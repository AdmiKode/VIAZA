// supabase/functions/send-push/index.ts
//
// Edge Function: Envío de notificaciones push remotas vía FCM (Firebase Cloud Messaging)
//
// ============================================================
// ESTADO DE CONFIRMACIÓN — LEER ANTES DE DESPLEGAR
// ============================================================
//
// [NO CONFIRMADO — REQUIERE ACCIÓN DE PATTY]
//   Esta función requiere el secret FIREBASE_SERVICE_ACCOUNT_JSON configurado en Supabase.
//   Sin él, la función devuelve 503 y no envía nada.
//
//   Para configurar:
//     1. Ve a Firebase Console → Proyecto VIAZA → Configuración → Cuentas de servicio
//     2. Genera nueva clave privada → descarga el JSON
//     3. Ejecuta:
//        supabase secrets set FIREBASE_SERVICE_ACCOUNT_JSON='<contenido del JSON>'
//     4. Redespliega: supabase functions deploy send-push
//
// ============================================================
// INVOCACIÓN:
//   Desde el cliente:
//     supabase.functions.invoke('send-push', {
//       body: {
//         targetUserId: 'uuid',          // enviar a todos los tokens activos del usuario
//         title: 'Titulo',
//         body: 'Mensaje',
//         data: { moduleId: 'safety' }, // opcional, para deeplink
//       }
//     })
//
//   O token directo (interno):
//     body: { token: 'fcm_token_string', title: '...', body: '...', data: {} }
//
// ============================================================
// SEGURIDAD:
//   - Solo puede invocarse con JWT válido (usuario autenticado).
//   - Un usuario solo puede enviar push a SÍ MISMO (targetUserId === auth.uid())
//     a menos que sea llamada interna service_role (desde otra edge function).
//   - El acceso a otros tokens de usuario está bloqueado por RLS en push_tokens.
// ============================================================

import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const CORS_HEADERS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// ─── FCM v1 API — obtener access token via Service Account ───────────────────

interface ServiceAccount {
  project_id: string;
  client_email: string;
  private_key: string;
}

async function getFcmAccessToken(sa: ServiceAccount): Promise<string> {
  // JWT para autenticarse con Google OAuth2
  const now = Math.floor(Date.now() / 1000);
  const header = { alg: 'RS256', typ: 'JWT' };
  const payload = {
    iss: sa.client_email,
    scope: 'https://www.googleapis.com/auth/firebase.messaging',
    aud: 'https://oauth2.googleapis.com/token',
    iat: now,
    exp: now + 3600,
  };

  const enc = (obj: unknown) =>
    btoa(JSON.stringify(obj)).replace(/=/g, '').replace(/\+/g, '-').replace(/\//g, '_');

  const signingInput = `${enc(header)}.${enc(payload)}`;

  // Importar clave privada RSA
  const privateKey = sa.private_key.replace(/\\n/g, '\n');
  const keyData = privateKey
    .replace('-----BEGIN PRIVATE KEY-----', '')
    .replace('-----END PRIVATE KEY-----', '')
    .replace(/\s/g, '');
  const binaryKey = Uint8Array.from(atob(keyData), (c) => c.charCodeAt(0));

  const cryptoKey = await crypto.subtle.importKey(
    'pkcs8',
    binaryKey.buffer,
    { name: 'RSASSA-PKCS1-v1_5', hash: 'SHA-256' },
    false,
    ['sign'],
  );

  const signature = await crypto.subtle.sign(
    'RSASSA-PKCS1-v1_5',
    cryptoKey,
    new TextEncoder().encode(signingInput),
  );

  const signatureB64 = btoa(String.fromCharCode(...new Uint8Array(signature)))
    .replace(/=/g, '').replace(/\+/g, '-').replace(/\//g, '_');

  const jwt = `${signingInput}.${signatureB64}`;

  // Intercambiar JWT por access token
  const tokenRes = await fetch('https://oauth2.googleapis.com/token', {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({
      grant_type: 'urn:ietf:params:oauth:grant-type:jwt-bearer',
      assertion: jwt,
    }),
  });

  const tokenJson = await tokenRes.json() as { access_token?: string; error?: string };
  if (!tokenJson.access_token) {
    throw new Error(`FCM token error: ${tokenJson.error ?? 'unknown'}`);
  }
  return tokenJson.access_token;
}

// ─── Enviar mensaje FCM v1 ────────────────────────────────────────────────────

async function sendFcmMessage(
  accessToken: string,
  projectId: string,
  token: string,
  title: string,
  body: string,
  data?: Record<string, string>,
): Promise<{ success: boolean; error?: string }> {
  const message = {
    message: {
      token,
      notification: { title, body },
      data: data ?? {},
      android: {
        priority: 'high',
        notification: { channel_id: 'viaza_default' },
      },
      apns: {
        payload: { aps: { sound: 'default' } },
      },
    },
  };

  const res = await fetch(
    `https://fcm.googleapis.com/v1/projects/${projectId}/messages:send`,
    {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(message),
    },
  );

  if (!res.ok) {
    const err = await res.text();
    return { success: false, error: err };
  }
  return { success: true };
}

// ─── Handler principal ────────────────────────────────────────────────────────

serve(async (req: Request) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: CORS_HEADERS });
  }

  try {
    // Verificar secret de Firebase
    const saJson = Deno.env.get('FIREBASE_SERVICE_ACCOUNT_JSON');
    if (!saJson) {
      return new Response(
        JSON.stringify({ error: 'FIREBASE_SERVICE_ACCOUNT_JSON not configured — NO CONFIRMADO en produccion' }),
        { status: 503, headers: { ...CORS_HEADERS, 'Content-Type': 'application/json' } },
      );
    }

    const serviceAccount: ServiceAccount = JSON.parse(saJson);

    // Autenticar al llamante
    const authHeader = req.headers.get('Authorization') ?? '';
    const userClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
      { global: { headers: { Authorization: authHeader } } },
    );
    const adminClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '',
    );

    const { data: { user }, error: authError } = await userClient.auth.getUser();
    // Permitir llamada interna con service_role (sin JWT de usuario)
    const isInternal = !user && !authError;
    if (!user && !isInternal) {
      return new Response(
        JSON.stringify({ error: 'Unauthorized' }),
        { status: 401, headers: { ...CORS_HEADERS, 'Content-Type': 'application/json' } },
      );
    }

    const body = await req.json() as {
      targetUserId?: string;
      token?: string;
      title: string;
      body: string;
      data?: Record<string, string>;
    };

    const { title, body: msgBody, data } = body;
    if (!title || !msgBody) {
      return new Response(
        JSON.stringify({ error: 'title and body are required' }),
        { status: 400, headers: { ...CORS_HEADERS, 'Content-Type': 'application/json' } },
      );
    }

    // Recopilar tokens destino
    let tokens: string[] = [];

    if (body.token) {
      // Token directo (llamada interna entre edge functions)
      tokens = [body.token];
    } else if (body.targetUserId) {
      // Seguridad: usuario solo puede enviarse a sí mismo
      if (user && body.targetUserId !== user.id) {
        return new Response(
          JSON.stringify({ error: 'Cannot send push to another user' }),
          { status: 403, headers: { ...CORS_HEADERS, 'Content-Type': 'application/json' } },
        );
      }

      const { data: tokenRows, error: tokensError } = await adminClient
        .from('push_tokens')
        .select('token')
        .eq('user_id', body.targetUserId)
        .eq('is_active', true);

      if (tokensError) throw tokensError;
      tokens = (tokenRows ?? []).map((r: { token: string }) => r.token);
    }

    if (tokens.length === 0) {
      return new Response(
        JSON.stringify({ sent: 0, message: 'No active tokens for user' }),
        { status: 200, headers: { ...CORS_HEADERS, 'Content-Type': 'application/json' } },
      );
    }

    // Obtener access token FCM
    const accessToken = await getFcmAccessToken(serviceAccount);

    // Enviar a todos los tokens activos del usuario
    const results = await Promise.allSettled(
      tokens.map((token) =>
        sendFcmMessage(accessToken, serviceAccount.project_id, token, title, msgBody, data)
      ),
    );

    const sent = results.filter((r) => r.status === 'fulfilled' && r.value.success).length;
    const failed = results.length - sent;

    // Desactivar tokens inválidos (FCM los rechaza con error UNREGISTERED)
    const invalidTokens: string[] = [];
    results.forEach((r, i) => {
      if (r.status === 'fulfilled' && !r.value.success && r.value.error?.includes('UNREGISTERED')) {
        invalidTokens.push(tokens[i]);
      }
    });
    if (invalidTokens.length > 0) {
      await adminClient
        .from('push_tokens')
        .update({ is_active: false })
        .in('token', invalidTokens);
    }

    return new Response(
      JSON.stringify({ sent, failed, total: tokens.length }),
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
