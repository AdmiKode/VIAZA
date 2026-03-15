import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';
import { requireEnv } from './env.ts';

function requireAnyEnv(names: string[]): string {
  for (const name of names) {
    const v = Deno.env.get(name);
    if (v && v.trim()) return v.trim();
  }
  throw new Error(`Missing env. Set one of: ${names.join(', ')}`);
}

export function createSupabaseServiceClient() {
  // Nota: Supabase Studio no permite crear secrets con prefijo `SUPABASE_`.
  // Por eso soportamos aliases configurables por el proyecto.
  const supabaseUrl = requireAnyEnv(['SUPABASE_URL', 'PROJECT_URL']);
  const serviceKey = requireAnyEnv(['SUPABASE_SERVICE_ROLE_KEY', 'SERVICE_ROLE_KEY']);
  return createClient(supabaseUrl, serviceKey);
}
