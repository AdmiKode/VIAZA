import { jsonResponse } from './cors.ts';
import { createSupabaseClientForRequest } from './supabase.ts';

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

  if (error) return jsonResponse({ ok: false, error: 'Premium required' }, { status: 402 });
  if (!data?.is_active_premium) return jsonResponse({ ok: false, error: 'Premium required' }, { status: 402 });

  return { supabase, userId };
}

