/**
 * flight-alerts — watch flights for status changes and push notifications.
 *
 * POST  /flight-alerts          { flightNumber, flightDate, tripId? }  → subscribe (requires auth)
 * DELETE /flight-alerts         { watchId }                             → unsubscribe (requires auth)
 * POST  /flight-alerts/poll     {}  (internal / cron, service-role key) → check all active watches
 */

import { serve } from 'https://deno.land/std@0.224.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';
import { handleOptions, jsonResponse } from '../_shared/cors.ts';
import { requireAuth } from '../_shared/premium.ts';

// ─── Types ────────────────────────────────────────────────────────────────────

type FlightStatusRaw = {
  flight_status?: string;
  departure?: {
    scheduled?: string;
    estimated?: string;
    delay?: number | null;
    gate?: string | null;
    terminal?: string | null;
  };
  arrival?: {
    scheduled?: string;
    estimated?: string;
    delay?: number | null;
    gate?: string | null;
    terminal?: string | null;
  };
  airline?: { name?: string };
  flight?: { iata?: string };
};

type FlightSnapshot = {
  status: string;
  dep_delay_min: number | null;
  arr_delay_min: number | null;
  dep_gate: string | null;
  arr_gate: string | null;
  dep_terminal: string | null;
  arr_terminal: string | null;
};

// ─── Helpers ──────────────────────────────────────────────────────────────────

function getServiceClient() {
  return createClient(
    Deno.env.get('SUPABASE_URL')!,
    Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!,
  );
}

/** Call AviationStack for a flight on a specific date */
async function fetchFlightStatus(
  flightIata: string,
  flightDate: string,
): Promise<FlightSnapshot | null> {
  const key = Deno.env.get('AVIATIONSTACK_API_KEY');
  if (!key) return null;

  const url = new URL('https://api.aviationstack.com/v1/flights');
  url.searchParams.set('access_key', key);
  url.searchParams.set('flight_iata', flightIata.toUpperCase().replace(/\s/g, ''));
  url.searchParams.set('flight_date', flightDate); // YYYY-MM-DD
  url.searchParams.set('limit', '1');

  const res = await fetch(url);
  if (!res.ok) return null;
  const json = (await res.json()) as { data?: FlightStatusRaw[] };
  const raw = json.data?.[0];
  if (!raw) return null;

  return {
    status: raw.flight_status ?? 'unknown',
    dep_delay_min: raw.departure?.delay ?? null,
    arr_delay_min: raw.arrival?.delay ?? null,
    dep_gate: raw.departure?.gate ?? null,
    arr_gate: raw.arrival?.gate ?? null,
    dep_terminal: raw.departure?.terminal ?? null,
    arr_terminal: raw.arrival?.terminal ?? null,
  };
}

/** Build a human-readable push notification message */
function buildPushMessage(
  flightNumber: string,
  prev: FlightSnapshot,
  curr: FlightSnapshot,
): { title: string; body: string } | null {
  const changes: string[] = [];

  if (curr.status !== prev.status) {
    const statusMap: Record<string, string> = {
      cancelled: '❌ CANCELADO',
      diverted: '⚠️ DESVIADO',
      active: '✈️ En vuelo',
      landed: '🛬 Aterrizó',
      scheduled: 'Programado',
    };
    changes.push(`Estado: ${statusMap[curr.status] ?? curr.status}`);
  }

  if (
    curr.dep_delay_min !== null &&
    prev.dep_delay_min !== curr.dep_delay_min &&
    (curr.dep_delay_min ?? 0) >= 15
  ) {
    changes.push(`Salida retrasada ${curr.dep_delay_min} min`);
  }

  if (curr.dep_gate !== prev.dep_gate && curr.dep_gate) {
    changes.push(`Puerta de salida: ${curr.dep_gate}`);
  }

  if (curr.arr_gate !== prev.arr_gate && curr.arr_gate) {
    changes.push(`Puerta de llegada: ${curr.arr_gate}`);
  }

  if (changes.length === 0) return null;

  return {
    title: `Vuelo ${flightNumber}`,
    body: changes.join(' · '),
  };
}

// ─── Handlers ─────────────────────────────────────────────────────────────────

async function handleSubscribe(req: Request): Promise<Response> {
  const authed = await requireAuth(req);
  if (authed instanceof Response) return authed;
  const { userId } = authed;

  const body = (await req.json()) as {
    flightNumber: string;
    flightDate: string;   // YYYY-MM-DD
    tripId?: string;
  };

  if (!body.flightNumber || !body.flightDate) {
    return jsonResponse({ ok: false, error: 'flightNumber and flightDate are required' }, { status: 400 });
  }

  const db = getServiceClient();

  // Avoid duplicates
  const { data: existing } = await db
    .from('flight_watches')
    .select('id')
    .eq('user_id', userId)
    .eq('flight_number', body.flightNumber.toUpperCase().replace(/\s/g, ''))
    .eq('flight_date', body.flightDate)
    .maybeSingle();

  if (existing) {
    return jsonResponse({ ok: true, watchId: existing.id, already: true });
  }

  // Fetch initial snapshot
  const snapshot = await fetchFlightStatus(body.flightNumber, body.flightDate);

  const { data, error } = await db
    .from('flight_watches')
    .insert({
      user_id: userId,
      trip_id: body.tripId ?? null,
      flight_number: body.flightNumber.toUpperCase().replace(/\s/g, ''),
      flight_date: body.flightDate,
      last_snapshot: snapshot ?? {},
      active: true,
    })
    .select('id')
    .single();

  if (error) return jsonResponse({ ok: false, error: error.message }, { status: 500 });

  return jsonResponse({ ok: true, watchId: data.id, snapshot });
}

async function handleUnsubscribe(req: Request): Promise<Response> {
  const authed = await requireAuth(req);
  if (authed instanceof Response) return authed;
  const { userId } = authed;

  const { watchId } = (await req.json()) as { watchId: string };
  if (!watchId) return jsonResponse({ ok: false, error: 'watchId is required' }, { status: 400 });

  const db = getServiceClient();
  const { error } = await db
    .from('flight_watches')
    .update({ active: false })
    .eq('id', watchId)
    .eq('user_id', userId);

  if (error) return jsonResponse({ ok: false, error: error.message }, { status: 500 });
  return jsonResponse({ ok: true });
}

/**
 * Poll all active watches — intended to be called by a cron job
 * or by the client when the app foregrounds.
 * Requires service role key in Authorization header (no user session).
 */
async function handlePoll(req: Request): Promise<Response> {
  // Simple shared secret check (cron caller sets X-Internal-Secret header)
  const secret = req.headers.get('x-internal-secret');
  const expected = Deno.env.get('INTERNAL_CRON_SECRET');
  if (expected && secret !== expected) {
    return jsonResponse({ ok: false, error: 'Unauthorized' }, { status: 401 });
  }

  const db = getServiceClient();

  // Only watches for today + 1 day ahead (relevant flights)
  const today = new Date();
  const tomorrow = new Date(today);
  tomorrow.setDate(tomorrow.getDate() + 1);
  const todayStr = today.toISOString().slice(0, 10);
  const tomorrowStr = tomorrow.toISOString().slice(0, 10);

  const { data: watches, error } = await db
    .from('flight_watches')
    .select('id, user_id, flight_number, flight_date, last_snapshot')
    .eq('active', true)
    .in('flight_date', [todayStr, tomorrowStr]);

  if (error) return jsonResponse({ ok: false, error: error.message }, { status: 500 });
  if (!watches || watches.length === 0) return jsonResponse({ ok: true, checked: 0, notified: 0 });

  let notified = 0;

  for (const watch of watches) {
    try {
      const curr = await fetchFlightStatus(watch.flight_number, watch.flight_date);
      if (!curr) continue;

      const prev = (watch.last_snapshot ?? {}) as FlightSnapshot;
      const msg = buildPushMessage(watch.flight_number, prev, curr);

      if (msg) {
        // Get user's push tokens
        const { data: tokens } = await db
          .from('push_tokens')
          .select('token')
          .eq('user_id', watch.user_id);

        if (tokens && tokens.length > 0) {
          // Call send-push edge function
          await db.functions.invoke('send-push', {
            body: {
              tokens: tokens.map((t: { token: string }) => t.token),
              title: msg.title,
              body: msg.body,
              data: {
                type: 'flight_alert',
                flightNumber: watch.flight_number,
                watchId: watch.id,
              },
            },
          });
          notified++;
        }

        // Save snapshot
        await db
          .from('flight_watches')
          .update({ last_snapshot: curr, last_checked_at: new Date().toISOString() })
          .eq('id', watch.id);
      } else {
        // Just update last_checked_at
        await db
          .from('flight_watches')
          .update({ last_checked_at: new Date().toISOString() })
          .eq('id', watch.id);
      }
    } catch {
      // Continue with next watch on error
    }
  }

  return jsonResponse({ ok: true, checked: watches.length, notified });
}

// ─── Router ───────────────────────────────────────────────────────────────────

serve(async (req) => {
  const opt = handleOptions(req);
  if (opt) return opt;

  const url = new URL(req.url);
  const isPoll = url.pathname.endsWith('/poll');

  try {
    if (isPoll && req.method === 'POST') return await handlePoll(req);
    if (req.method === 'POST') return await handleSubscribe(req);
    if (req.method === 'DELETE') return await handleUnsubscribe(req);

    return jsonResponse({ ok: false, error: 'Method not allowed' }, { status: 405 });
  } catch (err) {
    return jsonResponse({ ok: false, error: (err as Error).message }, { status: 500 });
  }
});
