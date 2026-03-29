// src/services/journalService.ts
// CRUD para trip_journal_entries (Travel Memory / Bitácora)
// Schema: supabase/migrations/20260328_travel_memory.sql

import { supabase } from './supabaseClient';

// ─── Tipos ──────────────────────────────────────────────────────────────────

export type JournalMood = 'great' | 'good' | 'neutral' | 'tired' | 'bad';

export const MOOD_LABELS: Record<JournalMood, string> = {
  great:   'Excelente',
  good:    'Bien',
  neutral: 'Normal',
  tired:   'Cansado',
  bad:     'Mal',
};

export const MOOD_COLORS: Record<JournalMood, string> = {
  great:   '#27AE60',
  good:    '#307082',
  neutral: '#6CA3A2',
  tired:   '#EA9940',
  bad:     '#C0392B',
};

export interface JournalEntry {
  id: string;
  userId: string;
  tripId: string | null;
  title: string | null;
  body: string;
  mood: JournalMood | null;
  tags: string[];
  lat: number | null;
  lon: number | null;
  placeName: string | null;
  photoPaths: string[];
  entryDate: string;
  createdAt: string;
  updatedAt: string;
}

export interface CreateJournalEntry {
  tripId?: string;
  title?: string;
  body: string;
  mood?: JournalMood;
  tags?: string[];
  lat?: number;
  lon?: number;
  placeName?: string;
  entryDate?: string; // YYYY-MM-DD, default today
}

export interface UpdateJournalEntry {
  title?: string;
  body?: string;
  mood?: JournalMood | null;
  tags?: string[];
  placeName?: string;
}

// ─── Mapeo ─────────────────────────────────────────────────────────────────

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function fromRow(r: any): JournalEntry {
  return {
    id: r.id,
    userId: r.user_id,
    tripId: r.trip_id ?? null,
    title: r.title ?? null,
    body: r.body,
    mood: r.mood ?? null,
    tags: r.tags ?? [],
    lat: r.lat ?? null,
    lon: r.lon ?? null,
    placeName: r.place_name ?? null,
    photoPaths: r.photo_paths ?? [],
    entryDate: r.entry_date,
    createdAt: r.created_at,
    updatedAt: r.updated_at,
  };
}

// ─── API ────────────────────────────────────────────────────────────────────

/** Obtiene entradas del viaje (o todas si tripId es null), ordenadas por fecha desc */
export async function getJournalEntries(tripId?: string | null, limit = 50): Promise<JournalEntry[]> {
  let q = supabase
    .from('trip_journal_entries')
    .select('*')
    .order('entry_date', { ascending: false })
    .order('created_at', { ascending: false })
    .limit(limit);

  if (tripId) q = q.eq('trip_id', tripId);

  const { data, error } = await q;
  if (error) throw new Error(error.message);
  return (data ?? []).map(fromRow);
}

/** Crea una nueva entrada de bitácora */
export async function createJournalEntry(payload: CreateJournalEntry): Promise<JournalEntry> {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('No autenticado');

  const today = new Date().toISOString().split('T')[0];

  const { data, error } = await supabase
    .from('trip_journal_entries')
    .insert({
      user_id: user.id,
      trip_id: payload.tripId ?? null,
      title: payload.title ?? null,
      body: payload.body,
      mood: payload.mood ?? null,
      tags: payload.tags ?? [],
      lat: payload.lat ?? null,
      lon: payload.lon ?? null,
      place_name: payload.placeName ?? null,
      photo_paths: [],
      entry_date: payload.entryDate ?? today,
    })
    .select()
    .single();

  if (error) throw new Error(error.message);
  return fromRow(data);
}

/** Actualiza una entrada existente */
export async function updateJournalEntry(id: string, payload: UpdateJournalEntry): Promise<JournalEntry> {
  const updates: Record<string, unknown> = {};
  if (payload.title !== undefined) updates.title = payload.title;
  if (payload.body  !== undefined) updates.body  = payload.body;
  if (payload.mood  !== undefined) updates.mood  = payload.mood;
  if (payload.tags  !== undefined) updates.tags  = payload.tags;
  if (payload.placeName !== undefined) updates.place_name = payload.placeName;

  const { data, error } = await supabase
    .from('trip_journal_entries')
    .update(updates)
    .eq('id', id)
    .select()
    .single();

  if (error) throw new Error(error.message);
  return fromRow(data);
}

/** Elimina una entrada */
export async function deleteJournalEntry(id: string): Promise<void> {
  const { error } = await supabase
    .from('trip_journal_entries')
    .delete()
    .eq('id', id);
  if (error) throw new Error(error.message);
}

/**
 * Sube una foto (base64 o blob) al bucket viaza-journal y
 * agrega el path al array photo_paths de la entrada.
 * Retorna la URL pública firmada (signed URL, 1 año).
 */
export async function uploadJournalPhoto(params: {
  entryId: string;
  userId: string;
  base64Data: string;  // data sin el prefijo "data:image/jpeg;base64,"
  mimeType: string;    // 'image/jpeg' | 'image/png' | 'image/webp'
}): Promise<{ path: string; signedUrl: string }> {
  const { entryId, userId, base64Data, mimeType } = params;
  const ext = mimeType.split('/')[1] ?? 'jpg';
  const path = `${userId}/${entryId}/${Date.now()}.${ext}`;

  // Convertir base64 a Uint8Array
  const binary = atob(base64Data);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) bytes[i] = binary.charCodeAt(i);

  const { error: uploadErr } = await supabase.storage
    .from('viaza-journal')
    .upload(path, bytes.buffer, { contentType: mimeType, upsert: false });

  if (uploadErr) throw new Error(uploadErr.message);

  // Signed URL válida por 1 año
  const { data: signedData, error: signErr } = await supabase.storage
    .from('viaza-journal')
    .createSignedUrl(path, 60 * 60 * 24 * 365);

  if (signErr || !signedData) throw new Error(signErr?.message ?? 'Error firmando URL');

  // Agregar path al array de la entrada
  const { error: updateErr } = await supabase.rpc('append_journal_photo', {
    p_entry_id: entryId,
    p_path: path,
  });

  // Si el RPC no existe, usamos update directo con array_append via select
  if (updateErr) {
    // Fallback: leer paths actuales y actualizar
    const { data: entry, error: selErr } = await supabase
      .from('trip_journal_entries')
      .select('photo_paths')
      .eq('id', entryId)
      .single();
    if (selErr) throw new Error(selErr.message);

    const current: string[] = (entry as { photo_paths: string[] }).photo_paths ?? [];
    const { error: updErr2 } = await supabase
      .from('trip_journal_entries')
      .update({ photo_paths: [...current, path] })
      .eq('id', entryId);
    if (updErr2) throw new Error(updErr2.message);
  }

  return { path, signedUrl: signedData.signedUrl };
}

/**
 * Obtiene signed URLs para los photo_paths de una entrada.
 */
export async function getJournalPhotoUrls(photoPaths: string[]): Promise<string[]> {
  if (!photoPaths.length) return [];
  const results = await Promise.all(
    photoPaths.map(async (path) => {
      const { data } = await supabase.storage
        .from('viaza-journal')
        .createSignedUrl(path, 60 * 60 * 24 * 7); // 7 días
      return data?.signedUrl ?? '';
    })
  );
  return results.filter(Boolean);
}
