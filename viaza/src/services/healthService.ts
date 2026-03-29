// src/services/healthService.ts
// Health Travel Module — VIAZA Producción
// Gestiona medicamentos del viaje y condiciones especiales del viajero

import { supabase } from './supabaseClient';

// ─── Tipos ───────────────────────────────────────────────────────────────────

export type DoseUnit = 'mg' | 'ml' | 'tableta' | 'capsula' | 'gota' | 'unidad' | 'otro';

export interface HealthMedication {
  id: string;
  user_id: string;
  trip_id: string | null;
  name: string;
  dose_amount: number | null;
  dose_unit: DoseUnit;
  frequency_label: string;
  times: string[];          // "08:00", "14:00", ...
  notes: string | null;
  quantity_total: number | null;
  is_critical: boolean;
  packed: boolean;
  created_at: string;
  updated_at: string;
}

export interface HealthConditions {
  id: string;
  user_id: string;
  is_pregnant: boolean;
  is_diabetic: boolean;
  is_hypertensive: boolean;
  has_asthma: boolean;
  has_severe_allergy: boolean;
  has_reduced_mobility: boolean;
  is_traveling_with_baby: boolean;
  is_traveling_with_elderly: boolean;
  is_traveling_with_pet: boolean;
  allergy_details: string | null;
  other_conditions: string | null;
  dietary_restrictions: string | null;
  created_at: string;
  updated_at: string;
}

export type MedicationForm = Omit<HealthMedication, 'id' | 'user_id' | 'created_at' | 'updated_at'>;
export type ConditionsForm = Omit<HealthConditions, 'id' | 'user_id' | 'created_at' | 'updated_at'>;

export const EMPTY_CONDITIONS: ConditionsForm = {
  is_pregnant: false,
  is_diabetic: false,
  is_hypertensive: false,
  has_asthma: false,
  has_severe_allergy: false,
  has_reduced_mobility: false,
  is_traveling_with_baby: false,
  is_traveling_with_elderly: false,
  is_traveling_with_pet: false,
  allergy_details: null,
  other_conditions: null,
  dietary_restrictions: null,
};

// ─── Medicamentos ─────────────────────────────────────────────────────────────

export async function getMedications(tripId?: string): Promise<HealthMedication[]> {
  let q = supabase
    .from('health_medications')
    .select('*')
    .order('is_critical', { ascending: false })
    .order('name');

  if (tripId) {
    q = q.or(`trip_id.eq.${tripId},trip_id.is.null`);
  }

  const { data, error } = await q;
  if (error) throw error;
  return (data ?? []) as HealthMedication[];
}

export async function saveMedication(
  form: MedicationForm,
  id?: string
): Promise<HealthMedication> {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('No autenticado');

  if (id) {
    const { data, error } = await supabase
      .from('health_medications')
      .update({ ...form, updated_at: new Date().toISOString() })
      .eq('id', id)
      .eq('user_id', user.id)
      .select()
      .single();
    if (error) throw error;
    return data as HealthMedication;
  } else {
    const { data, error } = await supabase
      .from('health_medications')
      .insert({ ...form, user_id: user.id })
      .select()
      .single();
    if (error) throw error;
    return data as HealthMedication;
  }
}

export async function toggleMedicationPacked(id: string, packed: boolean): Promise<void> {
  const { error } = await supabase
    .from('health_medications')
    .update({ packed, updated_at: new Date().toISOString() })
    .eq('id', id);
  if (error) throw error;
}

export async function deleteMedication(id: string): Promise<void> {
  const { error } = await supabase
    .from('health_medications')
    .delete()
    .eq('id', id);
  if (error) throw error;
}

// ─── Condiciones especiales ───────────────────────────────────────────────────

export async function getHealthConditions(): Promise<HealthConditions | null> {
  const { data, error } = await supabase
    .from('health_conditions')
    .select('*')
    .maybeSingle();
  if (error) throw error;
  return (data as HealthConditions) ?? null;
}

export async function saveHealthConditions(form: ConditionsForm): Promise<HealthConditions> {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('No autenticado');

  const { data, error } = await supabase
    .from('health_conditions')
    .upsert(
      { ...form, user_id: user.id, updated_at: new Date().toISOString() },
      { onConflict: 'user_id' }
    )
    .select()
    .single();
  if (error) throw error;
  return data as HealthConditions;
}
