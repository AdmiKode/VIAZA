// supabase/functions/sos-handler/index.ts
//
// Edge Function: Manejo de eventos SOS con event-token efímero
//
// POST /sos-handler         → crea sos_event + token efímero (24h) + confirma SOS
// PATCH /sos-handler/:id    → actualiza status (acknowledged, resolved)
// GET /sos-handler/:token   → vista pública por token (para el contacto)
//
// SEGURIDAD:
//   - POST/PATCH: requiere JWT válido
//   - GET por token: público, solo mientras no esté expirado/resuelto

import { serve } from 'https://deno.land/std@0.224.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const CORS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

function json(data: unknown, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: { ...CORS, 'Content-Type': 'application/json' },
  });
}

function generateToken(): string {
  const bytes = new Uint8Array(24);
  crypto.getRandomValues(bytes);
  return btoa(String.fromCharCode(...bytes))
    .replace(/\+/g, '-').replace(/\//g, '_').replace(/=/g, '')
    .slice(0, 32);
}

serve(async (req: Request) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: CORS });

  const url = new URL(req.url);
  const pathParts = url.pathname.split('/').filter(Boolean);
  // pathParts[0] = 'sos-handler', pathParts[1] = id o token (opcional)
  const param = pathParts[1] ?? null;

  const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
  const anonKey    = Deno.env.get('SUPABASE_ANON_KEY')!;
  const serviceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;

  const admin = createClient(supabaseUrl, serviceKey);

  // ─── GET /:token — vista pública ──────────────────────────────────────────
  if (req.method === 'GET' && param) {
    const { data, error } = await admin
      .from('sos_events')
      .select('id, lat, lon, accuracy_meters, status, message_text, sent_to_name, sent_via, created_at, token_expires_at')
      .eq('event_token', param)
      .gt('token_expires_at', new Date().toISOString())
      .not('status', 'in', '("expired","resolved")')
      .maybeSingle();

    if (error || !data) return json({ ok: false, error: 'Token inválido o expirado' }, 404);
    return json({ ok: true, event: data });
  }

  // ─── Auth required para POST / PATCH ─────────────────────────────────────
  const authHeader = req.headers.get('Authorization') ?? '';
  const userClient = createClient(supabaseUrl, anonKey, {
    global: { headers: { Authorization: authHeader } },
  });
  const { data: { user }, error: authErr } = await userClient.auth.getUser();
  if (!user || authErr) return json({ ok: false, error: 'Unauthorized' }, 401);

  // ─── PATCH /:id — actualizar status ──────────────────────────────────────
  if (req.method === 'PATCH' && param) {
    const body = await req.json() as { status?: string; notes?: string };
    const allowed = ['acknowledged', 'resolved'];
    if (!body.status || !allowed.includes(body.status)) {
      return json({ ok: false, error: 'status must be acknowledged or resolved' }, 400);
    }

    const updatePayload: Record<string, unknown> = { status: body.status };
    if (body.status === 'acknowledged') updatePayload.acknowledged_at = new Date().toISOString();
    if (body.status === 'resolved')     updatePayload.resolved_at     = new Date().toISOString();
    if (body.notes) updatePayload.notes = body.notes;

    const { error } = await admin
      .from('sos_events')
      .update(updatePayload)
      .eq('id', param)
      .eq('user_id', user.id);

    if (error) return json({ ok: false, error: error.message }, 500);
    return json({ ok: true });
  }

  // ─── POST — crear nuevo SOS event ────────────────────────────────────────
  if (req.method === 'POST') {
    const body = await req.json() as {
      tripId?: string;
      lat?: number;
      lon?: number;
      accuracyMeters?: number;
      messageText?: string;
      sentToName?: string;
      sentToPhone?: string;
      sentVia?: 'whatsapp' | 'sms' | 'email' | 'manual';
    };

    const token = generateToken();
    const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(); // 24h

    const { data: sosEvent, error: insertErr } = await admin
      .from('sos_events')
      .insert({
        user_id: user.id,
        trip_id: body.tripId ?? null,
        lat: body.lat ?? null,
        lon: body.lon ?? null,
        accuracy_meters: body.accuracyMeters ?? null,
        event_token: token,
        token_expires_at: expiresAt,
        status: 'sent',
        message_text: body.messageText ?? null,
        sent_to_name: body.sentToName ?? null,
        sent_to_phone: body.sentToPhone ? body.sentToPhone.slice(-4).padStart(body.sentToPhone.length, '*') : null,
        sent_via: body.sentVia ?? 'manual',
      })
      .select('id')
      .single();

    if (insertErr) return json({ ok: false, error: insertErr.message }, 500);

    // Construir URL pública del evento (para compartir con el contacto)
    const eventUrl = `${Deno.env.get('PUBLIC_SITE_URL') ?? 'https://viaza.app'}/sos/${token}`;

    // Push de confirmación al propio usuario
    try {
      await fetch(`${supabaseUrl}/functions/v1/send-push`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${serviceKey}`,
          apikey: anonKey,
        },
        body: JSON.stringify({
          targetUserId: user.id,
          title: 'SOS activado',
          body: 'Tu alerta SOS fue registrada y enviada.',
          data: { type: 'sos_confirmation', sosEventId: sosEvent.id },
        }),
      });
    } catch { /* push no es bloqueante */ }

    return json({
      ok: true,
      sosEventId: sosEvent.id,
      eventToken: token,
      eventUrl,
      tokenExpiresAt: expiresAt,
    });
  }

  return json({ ok: false, error: 'Method not allowed' }, 405);
});


const CORS_HEADERS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req: Request) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: CORS_HEADERS });
  }

  try {
    const authHeader = req.headers.get('Authorization') ?? '';

    // Cliente autenticado (para leer user_id y validar RLS)
    const userClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
      { global: { headers: { Authorization: authHeader } } },
    );

    // Cliente admin (para leer tokens del compañero y enviar push)
    const adminClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '',
    );

    // Verificar autenticación
    const { data: { user }, error: authError } = await userClient.auth.getUser();
    if (!user || authError) {
      return new Response(
        JSON.stringify({ error: 'Unauthorized' }),
        { status: 401, headers: { ...CORS_HEADERS, 'Content-Type': 'application/json' } },
      );
    }

    const body = await req.json() as {
      sessionId?: string;
      tripId?: string;
      lat?: number;
      lon?: number;
      accuracy?: number;
      companionPhone?: string;
      method?: 'whatsapp' | 'sms' | 'push' | 'manual';
      notes?: string;
    };

    const method = body.method ?? 'manual';

    // ─── 1. Insertar sos_event ────────────────────────────────────────────────
    const { data: sosEvent, error: insertError } = await adminClient
      .from('sos_events')
      .insert({
        user_id: user.id,
        trip_id: body.tripId ?? null,
        session_id: body.sessionId ?? null,
        triggered_at: new Date().toISOString(),
        lat: body.lat ?? null,
        lon: body.lon ?? null,
        accuracy: body.accuracy ?? null,
        contact_phone: body.companionPhone ?? null,
        method,
        status: 'sent',
        notes: body.notes ?? null,
      })
      .select('id')
      .single();

    if (insertError) {
      console.error('[sos-handler] insert sos_events error:', insertError.message);
      return new Response(
        JSON.stringify({ error: insertError.message }),
        { status: 500, headers: { ...CORS_HEADERS, 'Content-Type': 'application/json' } },
      );
    }

    // ─── 2. Actualizar safety_session si existe ───────────────────────────────
    if (body.sessionId) {
      await adminClient
        .from('safety_sessions')
        .update({ status: 'sos_triggered', updated_at: new Date().toISOString() })
        .eq('id', body.sessionId)
        .eq('user_id', user.id); // no puede cambiar sesiones de otro usuario
    }

    // ─── 3. Push notification a tokens del propio usuario (si los tiene) ─────
    // El compañero RECIBE el push solo si él también tiene la app y tokens activos.
    // En Sprint 1, el compañero es identificado por teléfono, no por user_id.
    // Por ahora: enviamos push al propio usuario (confirmación de SOS disparado)
    // y dejamos el push al compañero para cuando tengamos matching por teléfono.
    let pushSent = false;
    try {
      const supabaseUrl = Deno.env.get('SUPABASE_URL') ?? '';
      const anonKey = Deno.env.get('SUPABASE_ANON_KEY') ?? '';

      // Llamada interna al endpoint send-push con service_role
      const pushRes = await fetch(`${supabaseUrl}/functions/v1/send-push`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')}`,
          'apikey': anonKey,
        },
        body: JSON.stringify({
          targetUserId: user.id,
          title: 'SOS activado',
          body: 'Tu alerta SOS fue registrada. Mantente seguro.',
          data: {
            type: 'sos_confirmation',
            sosEventId: sosEvent?.id ?? '',
          },
        }),
      });

      if (pushRes.ok) {
        const pushData = await pushRes.json() as { sent?: number };
        pushSent = (pushData.sent ?? 0) > 0;
      }
    } catch (e) {
      // Push no disponible — no es bloqueante para el SOS
      console.warn('[sos-handler] push notification skipped:', e);
    }

    return new Response(
      JSON.stringify({
        ok: true,
        sosEventId: sosEvent?.id,
        pushSent,
        message: 'SOS registrado correctamente',
      }),
      { status: 200, headers: { ...CORS_HEADERS, 'Content-Type': 'application/json' } },
    );
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    return new Response(
      JSON.stringify({ error: msg }),
      { status: 500, headers: { ...CORS_HEADERS, 'Content-Type': 'application/json' } },
    );
  }
});
