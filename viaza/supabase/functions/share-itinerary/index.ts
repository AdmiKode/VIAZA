/**
 * share-itinerary — generate / revoke share tokens for itinerary read-only access.
 *
 * POST /share-itinerary          { tripId }              → generate token (requires auth)
 * DELETE /share-itinerary        { tripId }              → revoke token (requires auth)
 * GET  /share-itinerary/:token                           → fetch public itinerary data (no auth)
 */

import { serve } from 'https://deno.land/std@0.224.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';
import { handleOptions, jsonResponse } from '../_shared/cors.ts';
import { requireAuth } from '../_shared/premium.ts';

// ─── Helpers ──────────────────────────────────────────────────────────────────

function getServiceClient() {
  return createClient(
    Deno.env.get('SUPABASE_URL')!,
    Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!,
  );
}

/** Generate a URL-safe random token (32 chars) */
function generateToken(): string {
  const bytes = new Uint8Array(24);
  crypto.getRandomValues(bytes);
  return btoa(String.fromCharCode(...bytes))
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=/g, '')
    .slice(0, 32);
}

// ─── Handlers ─────────────────────────────────────────────────────────────────

async function handleGenerate(req: Request): Promise<Response> {
  const authed = await requireAuth(req);
  if (authed instanceof Response) return authed;
  const { supabase, userId } = authed;
  const db = getServiceClient();

  const { tripId } = (await req.json()) as { tripId: string };
  if (!tripId) return jsonResponse({ ok: false, error: 'tripId is required' }, { status: 400 });

  // Verify ownership
  const { data: trip } = await supabase
    .from('trips')
    .select('id, share_token')
    .eq('id', tripId)
    .eq('user_id', userId)
    .maybeSingle();

  if (!trip) return jsonResponse({ ok: false, error: 'Trip not found or unauthorized' }, { status: 404 });

  // Reuse existing token or generate new
  const token = (trip.share_token as string | null) ?? generateToken();

  const { error } = await db
    .from('trips')
    .update({ share_token: token, share_enabled: true, share_updated_at: new Date().toISOString() })
    .eq('id', tripId);

  if (error) return jsonResponse({ ok: false, error: error.message }, { status: 500 });

  return jsonResponse({ ok: true, token, url: `/itinerary/shared/${token}` });
}

async function handleRevoke(req: Request): Promise<Response> {
  const authed = await requireAuth(req);
  if (authed instanceof Response) return authed;
  const { supabase } = authed;

  const { tripId } = (await req.json()) as { tripId: string };
  if (!tripId) return jsonResponse({ ok: false, error: 'tripId is required' }, { status: 400 });

  const { error } = await supabase
    .from('trips')
    .update({ share_token: null, share_enabled: false, share_updated_at: new Date().toISOString() })
    .eq('id', tripId);

  if (error) return jsonResponse({ ok: false, error: error.message }, { status: 500 });
  return jsonResponse({ ok: true });
}

async function handleView(token: string): Promise<Response> {
  if (!token) return jsonResponse({ ok: false, error: 'Invalid token' }, { status: 400 });
  const db = getServiceClient();

  // Find trip by share token
  const { data: trip, error: tripErr } = await db
    .from('trips')
    .select('id, title, destination, start_date, end_date, duration_days, travel_type, share_enabled')
    .eq('share_token', token)
    .eq('share_enabled', true)
    .maybeSingle();

  if (tripErr || !trip) {
    return jsonResponse({ ok: false, error: 'Itinerary not found or link expired' }, { status: 404 });
  }

  // Load itinerary events (read-only, no user data)
  const { data: events } = await db
    .from('itinerary_events')
    .select('id, day_index, order, type, title, description, start_time, end_time, confirmation_code, source')
    .eq('trip_id', trip.id)
    .order('day_index', { ascending: true })
    .order('order', { ascending: true });

  return jsonResponse({
    ok: true,
    trip: {
      id: trip.id,
      title: trip.title,
      destination: trip.destination,
      startDate: trip.start_date,
      endDate: trip.end_date,
      durationDays: trip.duration_days,
      travelType: trip.travel_type,
    },
    events: (events ?? []).map((e) => ({
      id: e.id,
      dayIndex: e.day_index,
      order: e.order,
      type: e.type,
      title: e.title,
      description: e.description,
      startTime: e.start_time,
      endTime: e.end_time,
      confirmationCode: e.confirmation_code,
      source: e.source,
    })),
  });
}

// ─── Router ───────────────────────────────────────────────────────────────────

serve(async (req) => {
  const opt = handleOptions(req);
  if (opt) return opt;

  const url = new URL(req.url);
  // GET /share-itinerary/TOKEN
  const pathParts = url.pathname.split('/').filter(Boolean);
  const token = pathParts[pathParts.length - 1];
  const isViewRoute = req.method === 'GET' && token && token !== 'share-itinerary';

  try {
    if (isViewRoute) return await handleView(token);
    if (req.method === 'POST') return await handleGenerate(req);
    if (req.method === 'DELETE') return await handleRevoke(req);

    return jsonResponse({ ok: false, error: 'Method not allowed' }, { status: 405 });
  } catch (err) {
    return jsonResponse({ ok: false, error: (err as Error).message }, { status: 500 });
  }
});
