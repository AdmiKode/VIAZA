import { jsonResponse } from './cors.ts';
import { createSupabaseClientForRequest } from './supabase.ts';

async function hasActivePremiumPayment(params: {
  supabase: ReturnType<typeof createSupabaseClientForRequest>;
  userId: string;
}): Promise<boolean> {
  const { supabase, userId } = params;
  try {
    const { data: p, error } = await supabase
      .from('payments')
      .select('created_at,plan_duration_days,status,plan_purchased')
      .eq('user_id', userId)
      .eq('status', 'completed')
      .eq('plan_purchased', 'premium')
      .order('created_at', { ascending: false })
      .limit(1)
      .maybeSingle();
    if (error || !p?.created_at) return false;

    const durationDays = Number(p.plan_duration_days ?? 30);
    const start = new Date(String(p.created_at)).getTime();
    if (!Number.isFinite(start)) return false;
    return start + durationDays * 86400000 > Date.now();
  } catch {
    return false;
  }
}

export async function requireAuth(req: Request): Promise<
  { supabase: ReturnType<typeof createSupabaseClientForRequest>; userId: string } | Response
> {
  const supabase = createSupabaseClientForRequest(req);
  const { data: auth } = await supabase.auth.getUser();
  if (!auth.user) return jsonResponse({ ok: false, error: 'Not authenticated' }, { status: 401 });
  return { supabase, userId: auth.user.id };
}

export async function requirePremium(req: Request): Promise<
  { supabase: ReturnType<typeof createSupabaseClientForRequest>; userId: string } | Response
> {
  const authed = await requireAuth(req);
  if (authed instanceof Response) return authed;

  const { supabase, userId } = authed;
  const { data, error } = await supabase
    .from('user_subscription')
    .select('is_active_premium')
    .eq('user_id', userId)
    .maybeSingle();

  if (!error && data?.is_active_premium) return { supabase, userId };

  // Fallback: `profiles.plan` + `profiles.plan_expires_at` (evita falsos negativos por vista/RLS/migración)
  const { data: profile, error: profErr } = await supabase
    .from('profiles')
    .select('plan,plan_expires_at')
    .eq('id', userId)
    .maybeSingle();

  if (profErr || !profile) {
    const okByPayment = await hasActivePremiumPayment({ supabase, userId });
    if (okByPayment) return { supabase, userId };
    return jsonResponse({ ok: false, error: 'Premium required' }, { status: 402 });
  }

  const plan = String(profile.plan ?? 'free').toLowerCase();
  if (plan !== 'premium') {
    const okByPayment = await hasActivePremiumPayment({ supabase, userId });
    if (okByPayment) return { supabase, userId };
    return jsonResponse({ ok: false, error: 'Premium required' }, { status: 402 });
  }
  if (!profile.plan_expires_at) return { supabase, userId };

  const active = new Date(profile.plan_expires_at).getTime() > Date.now();
  if (!active) {
    const okByPayment = await hasActivePremiumPayment({ supabase, userId });
    if (okByPayment) return { supabase, userId };
    return jsonResponse({ ok: false, error: 'Premium required' }, { status: 402 });
  }

  return { supabase, userId };
}
