// supabase/functions/safety-tracking/index.ts
// Edge function para Safe Walk MVP
//
// SEGURIDAD:
//   - Las acciones start / checkin / end requieren JWT del usuario (auth.uid()).
//   - La acción view/:token usa service_role para leer la sesión por companion_token.
//     El acompañante nunca toca la tabla directamente — este edge function
//     es el único punto de acceso público y devuelve solo campos no sensibles.
//
// ALCANCE MVP (Sprint 1):
//   - Foreground / sesión activa. El cliente debe estar en pantalla.
//   - Background tracking NO está implementado en este sprint.
//   - Offline: si no hay red, el cliente debe encolar localmente (Fase 3).
//     Este endpoint NO recibe colas offline diferidas.

import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const SUPABASE_URL = Deno.env.get('SUPABASE_URL')!;
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
const SUPABASE_ANON_KEY = Deno.env.get('SUPABASE_ANON_KEY')!;

// Cliente con service_role para acciones privilegiadas (solo vista del acompañante)
const adminClient = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

function corsHeaders() {
  return {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
    'Access-Control-Allow-Methods': 'POST, GET, OPTIONS',
  };
}

function json(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders(), 'Content-Type': 'application/json' },
  });
}

function err(message: string, status = 400) {
  return json({ error: message }, status);
}

/** Genera un token opaco de 32 bytes en hex */
function generateCompanionToken(): string {
  const bytes = new Uint8Array(32);
  crypto.getRandomValues(bytes);
  return Array.from(bytes).map((b) => b.toString(16).padStart(2, '0')).join('');
}

/** Extrae user_id del JWT del usuario (anon key con user session) */
async function getUserFromRequest(req: Request): Promise<string | null> {
  const authHeader = req.headers.get('Authorization');
  if (!authHeader) return null;

  // Crear cliente con el token del usuario para que Supabase valide el JWT
  const userClient = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
    global: { headers: { Authorization: authHeader } },
  });

  const { data: { user }, error } = await userClient.auth.getUser();
  if (error || !user) return null;
  return user.id;
}

Deno.serve(async (req: Request) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders() });
  }

  const url = new URL(req.url);
  const pathParts = url.pathname.split('/').filter(Boolean);
  // pathParts[0] = 'safety-tracking', pathParts[1] = action, pathParts[2] = token (si aplica)
  const action = pathParts[1] ?? '';

  // ──────────────────────────────────────────────────────────
  // GET /safety-tracking/view/:token
  // Acceso del acompañante — service_role, sin auth del usuario.
  // Devuelve solo campos no sensibles de la sesión activa.
  // ──────────────────────────────────────────────────────────
  if (req.method === 'GET' && action === 'view') {
    const companionToken = pathParts[2];
    if (!companionToken) return err('Token requerido', 400);

    const { data: session, error } = await adminClient
      .from('safety_sessions')
      .select('id, session_type, status, companion_name, expected_duration_min, started_at, expected_end_at, last_checkin_at, last_lat, last_lon, last_accuracy')
      .eq('companion_token', companionToken)
      .single();

    if (error || !session) return err('Sesión no encontrada', 404);

    // Opcionalmente: devolver los últimos N checkins para trazar el path
    const { data: checkins } = await adminClient
      .from('safety_checkins')
      .select('lat, lon, checkin_at')
      .eq('session_id', session.id)
      .order('checkin_at', { ascending: false })
      .limit(20);

    return json({ session, checkins: checkins ?? [] });
  }

  // ──────────────────────────────────────────────────────────
  // Acciones POST — requieren JWT del usuario
  // ──────────────────────────────────────────────────────────
  if (req.method !== 'POST') return err('Método no soportado', 405);

  const userId = await getUserFromRequest(req);
  if (!userId) return err('No autenticado', 401);

  let body: Record<string, unknown> = {};
  try {
    body = await req.json();
  } catch {
    return err('Body JSON inválido', 400);
  }

  // ──────────────────────────────────────────────────────────
  // POST /safety-tracking/start
  // Crea una nueva sesión de Safe Walk.
  // ──────────────────────────────────────────────────────────
  if (action === 'start') {
    const { trip_id, companion_name, companion_phone, expected_duration_min, session_type } = body as {
      trip_id?: string;
      companion_name?: string;
      companion_phone?: string;
      expected_duration_min?: number;
      session_type?: string;
    };

    const companionToken = generateCompanionToken();
    const now = new Date();
    const expectedEnd = expected_duration_min
      ? new Date(now.getTime() + expected_duration_min * 60 * 1000).toISOString()
      : null;

    const { data: session, error } = await adminClient
      .from('safety_sessions')
      .insert({
        user_id: userId,
        trip_id: trip_id ?? null,
        session_type: session_type ?? 'safe_walk',
        status: 'active',
        companion_token: companionToken,
        companion_name: companion_name ?? null,
        companion_phone: companion_phone ?? null,
        expected_duration_min: expected_duration_min ?? null,
        started_at: now.toISOString(),
        expected_end_at: expectedEnd,
      })
      .select('id, companion_token, started_at, expected_end_at')
      .single();

    if (error) return err(`Error creando sesión: ${error.message}`, 500);

    const companionUrl = `${SUPABASE_URL.replace('supabase.co', 'netlify.app')}/safety/view/${companionToken}`;

    return json({
      session_id: session.id,
      companion_token: session.companion_token,
      companion_url: companionUrl,
      started_at: session.started_at,
      expected_end_at: session.expected_end_at,
    });
  }

  // ──────────────────────────────────────────────────────────
  // POST /safety-tracking/checkin
  // Registra ubicación actual en una sesión activa del usuario.
  // ──────────────────────────────────────────────────────────
  if (action === 'checkin') {
    const { session_id, lat, lon, accuracy, note } = body as {
      session_id: string;
      lat: number;
      lon: number;
      accuracy?: number;
      note?: string;
    };

    if (!session_id || lat == null || lon == null) {
      return err('session_id, lat y lon son requeridos', 400);
    }

    // Verificar que la sesión pertenece al usuario y está activa
    const { data: session, error: sessionErr } = await adminClient
      .from('safety_sessions')
      .select('id, status')
      .eq('id', session_id)
      .eq('user_id', userId)
      .single();

    if (sessionErr || !session) return err('Sesión no encontrada o sin permisos', 404);
    if (session.status !== 'active') return err('La sesión no está activa', 409);

    // Insertar checkin
    const { error: checkinErr } = await adminClient
      .from('safety_checkins')
      .insert({ session_id, lat, lon, accuracy: accuracy ?? null, note: note ?? null });

    if (checkinErr) return err(`Error en checkin: ${checkinErr.message}`, 500);

    // Actualizar last_* en la sesión
    const { error: updateErr } = await adminClient
      .from('safety_sessions')
      .update({
        last_lat: lat,
        last_lon: lon,
        last_accuracy: accuracy ?? null,
        last_checkin_at: new Date().toISOString(),
      })
      .eq('id', session_id);

    if (updateErr) return err(`Error actualizando sesión: ${updateErr.message}`, 500);

    return json({ ok: true, checkin_at: new Date().toISOString() });
  }

  // ──────────────────────────────────────────────────────────
  // POST /safety-tracking/end
  // Marca una sesión como completada (usuario llegó bien).
  // ──────────────────────────────────────────────────────────
  if (action === 'end') {
    const { session_id, status } = body as {
      session_id: string;
      status?: 'completed' | 'sos_triggered';
    };

    if (!session_id) return err('session_id requerido', 400);

    const finalStatus = status === 'sos_triggered' ? 'sos_triggered' : 'completed';

    const { error } = await adminClient
      .from('safety_sessions')
      .update({ status: finalStatus, ended_at: new Date().toISOString() })
      .eq('id', session_id)
      .eq('user_id', userId);

    if (error) return err(`Error finalizando sesión: ${error.message}`, 500);

    return json({ ok: true, status: finalStatus });
  }

  return err('Acción no reconocida. Usar: start | checkin | end | view/:token', 400);
});
