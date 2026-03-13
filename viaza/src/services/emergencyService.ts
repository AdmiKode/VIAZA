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
  const { data, error } = await supabase
    .from('emergency_profiles')
    .select('*')
    .eq('public_token', publicToken)
    .eq('qr_enabled', true)
    .eq('consent_public_display', true)
    .maybeSingle();

  if (error || !data) return null;

  // Solo devolver los campos que el usuario autorizó
  return {
    full_name: data.full_name,
    photo_url: data.photo_url,
    nationality: data.nationality,
    primary_language: data.primary_language,
    secondary_language: data.secondary_language,
    blood_type:             data.show_blood_type  ? data.blood_type             : null,
    allergies:              data.show_allergies   ? data.allergies              : null,
    current_conditions:     data.show_conditions  ? data.current_conditions     : null,
    medications:            data.show_medications ? data.medications            : null,
    medical_notes:          data.show_notes       ? data.medical_notes          : null,
    insurance_provider:     data.show_insurance   ? data.insurance_provider     : null,
    insurance_policy_number:data.show_insurance   ? data.insurance_policy_number: null,
    emergency_contact_1_name:     data.show_contacts ? data.emergency_contact_1_name     : null,
    emergency_contact_1_relation: data.show_contacts ? data.emergency_contact_1_relation : null,
    emergency_contact_1_phone:    data.show_contacts ? data.emergency_contact_1_phone    : null,
    emergency_contact_2_name:     data.show_contacts ? data.emergency_contact_2_name     : null,
    emergency_contact_2_relation: data.show_contacts ? data.emergency_contact_2_relation : null,
    emergency_contact_2_phone:    data.show_contacts ? data.emergency_contact_2_phone    : null,
  };
}
