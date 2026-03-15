import { supabase } from './supabaseClient';
import type { EmergencyProfile, EmergencyProfileForm, EmergencyPublicView } from '../types/emergency';

// ─── helpers ────────────────────────────────────────────────────────────────

function generateToken(): string {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  let token = '';
  const array = new Uint32Array(32);
  crypto.getRandomValues(array);
  for (const val of array) token += chars[val % chars.length];
  return token;
}

// ─── Leer perfil propio ──────────────────────────────────────────────────────

export async function getEmergencyProfile(): Promise<EmergencyProfile | null> {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return null;

  const { data, error } = await supabase
    .from('emergency_profiles')
    .select('*')
    .eq('user_id', user.id)
    .maybeSingle();

  if (error) throw error;
  return data ?? null;
}

// ─── Crear o actualizar perfil ───────────────────────────────────────────────

export async function saveEmergencyProfile(form: EmergencyProfileForm): Promise<EmergencyProfile> {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('No autenticado');

  // ¿Ya existe?
  const existing = await getEmergencyProfile();

  if (existing) {
    const { data, error } = await supabase
      .from('emergency_profiles')
      .update({ ...form, updated_at: new Date().toISOString() })
      .eq('user_id', user.id)
      .select()
      .single();
    if (error) throw error;
    return data;
  } else {
    const { data, error } = await supabase
      .from('emergency_profiles')
      .insert({
        ...form,
        user_id: user.id,
        public_token: generateToken(),
        updated_at: new Date().toISOString(),
      })
      .select()
      .single();
    if (error) throw error;
    return data;
  }
}

// ─── Regenerar token (invalida el anterior) ──────────────────────────────────

export async function regenerateEmergencyToken(): Promise<string> {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('No autenticado');

  const newToken = generateToken();

  const { error } = await supabase
    .from('emergency_profiles')
    .update({ public_token: newToken, updated_at: new Date().toISOString() })
    .eq('user_id', user.id);

  if (error) throw error;
  return newToken;
}

// ─── Vista pública (sin autenticación) ──────────────────────────────────────

export async function getEmergencyPublicView(publicToken: string): Promise<EmergencyPublicView | null> {
  const { data, error } = await supabase.rpc('get_emergency_public_view', { token: publicToken });
  if (error || !data) return null;
  const row = Array.isArray(data) ? data[0] : data;
  if (!row) return null;
  return row as EmergencyPublicView;
}
