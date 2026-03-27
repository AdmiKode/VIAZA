import { supabase } from './supabaseClient';
import type { LuggagePhoto, PackingEvidence } from '../types/traveler';

const EVIDENCE_BUCKET = 'evidence';
const LUGGAGE_BUCKET = 'luggage';

function safeSegment(value: string): string {
  return value.replace(/[^a-zA-Z0-9_-]/g, '_');
}

function mimeToExtension(mime: string): string {
  const clean = mime.toLowerCase();
  if (clean.includes('png')) return 'png';
  if (clean.includes('webp')) return 'webp';
  if (clean.includes('heic')) return 'heic';
  return 'jpg';
}

async function dataUrlToBlob(dataUrl: string): Promise<{ blob: Blob; mimeType: string; ext: string }> {
  const mimeMatch = dataUrl.match(/^data:([^;]+);base64,/i);
  const mimeType = mimeMatch?.[1] ?? 'image/jpeg';
  const response = await fetch(dataUrl);
  if (!response.ok) throw new Error('No se pudo convertir imagen para upload');
  const blob = await response.blob();
  return { blob, mimeType, ext: mimeToExtension(mimeType) };
}

async function signedUrl(bucket: string, storagePath: string): Promise<string> {
  const { data, error } = await supabase.storage.from(bucket).createSignedUrl(storagePath, 60 * 60 * 24);
  if (error || !data?.signedUrl) throw error ?? new Error('No se pudo crear signed url');
  return data.signedUrl;
}

function mapEvidenceRow(row: any, tripId: string, photoUrl: string): PackingEvidence {
  return {
    id: row.id,
    tripId,
    itemId: row.item_id,
    travelerId: row.traveler_id,
    photoUrl,
    storagePath: row.storage_path,
    takenAt: row.taken_at,
  };
}

function mapLuggageRow(row: any, photoUrl: string): LuggagePhoto {
  return {
    id: row.id,
    tripId: row.trip_id,
    travelerId: row.traveler_id,
    photoUrl,
    storagePath: row.storage_path,
    takenAt: row.taken_at,
    luggageSize: row.luggage_size,
    phase: row.phase,
    zones: row.zones,
    arrangementSuggestion: row.ai_suggestion ?? undefined,
    arrangementStatus: row.ai_suggestion ? 'ready' : 'pending',
  };
}

async function getCurrentUserId(): Promise<string> {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('Sesion no valida');
  return user.id;
}

export async function fetchPackingEvidenceByTrip(tripId: string): Promise<PackingEvidence[]> {
  const { data: itemRows, error: itemError } = await supabase
    .from('packing_items')
    .select('id')
    .eq('trip_id', tripId);

  if (itemError) throw itemError;

  const itemIds = (itemRows ?? []).map((r) => String(r.id));
  if (itemIds.length === 0) return [];

  const { data, error } = await supabase
    .from('packing_evidence')
    .select('*')
    .in('item_id', itemIds)
    .order('taken_at', { ascending: false });

  if (error) throw error;

  const rows = data ?? [];
  const signed = await Promise.all(
    rows.map(async (row) => {
      const url = await signedUrl(EVIDENCE_BUCKET, String(row.storage_path));
      return mapEvidenceRow(row, tripId, url);
    })
  );

  return signed;
}

export async function uploadPackingEvidence(input: {
  tripId: string;
  itemId: string;
  travelerId: string;
  dataUrl: string;
  takenAt?: string;
}): Promise<PackingEvidence> {
  const userId = await getCurrentUserId();

  // Reemplazar evidencia previa de ese item/viajero para mantener una fuente de verdad.
  const { data: existingRows } = await supabase
    .from('packing_evidence')
    .select('id, storage_path')
    .eq('item_id', input.itemId)
    .eq('traveler_id', input.travelerId)
    .eq('user_id', userId);

  if (existingRows && existingRows.length > 0) {
    const paths = existingRows.map((r) => String(r.storage_path)).filter(Boolean);
    if (paths.length > 0) {
      await supabase.storage.from(EVIDENCE_BUCKET).remove(paths);
    }
    await supabase.from('packing_evidence').delete().eq('item_id', input.itemId).eq('traveler_id', input.travelerId).eq('user_id', userId);
  }

  const { blob, mimeType, ext } = await dataUrlToBlob(input.dataUrl);
  const now = Date.now();
  const storagePath = `${safeSegment(userId)}/${safeSegment(input.tripId)}/traveler_${safeSegment(input.travelerId)}/item_${safeSegment(input.itemId)}/${now}.${ext}`;

  const upload = await supabase.storage
    .from(EVIDENCE_BUCKET)
    .upload(storagePath, blob, { upsert: false, contentType: mimeType });

  if (upload.error) throw upload.error;

  const url = await signedUrl(EVIDENCE_BUCKET, storagePath);
  const { data, error } = await supabase
    .from('packing_evidence')
    .insert({
      item_id: input.itemId,
      traveler_id: input.travelerId,
      user_id: userId,
      photo_url: url,
      storage_path: storagePath,
      taken_at: input.takenAt ?? new Date().toISOString(),
    })
    .select('*')
    .single();

  if (error) throw error;

  return mapEvidenceRow(data, input.tripId, url);
}

export async function deletePackingEvidenceRecord(evidence: { id: string; storagePath?: string | null }): Promise<void> {
  if (evidence.storagePath) {
    await supabase.storage.from(EVIDENCE_BUCKET).remove([evidence.storagePath]);
  }
  const { error } = await supabase
    .from('packing_evidence')
    .delete()
    .eq('id', evidence.id);
  if (error) throw error;
}

export async function fetchLuggagePhotosByTrip(tripId: string, travelerId?: string | null): Promise<LuggagePhoto[]> {
  let query = supabase
    .from('luggage_photos')
    .select('*')
    .eq('trip_id', tripId)
    .order('taken_at', { ascending: false });

  if (travelerId) {
    query = query.eq('traveler_id', travelerId);
  }

  const { data, error } = await query;
  if (error) throw error;

  const rows = data ?? [];
  const mapped = await Promise.all(
    rows.map(async (row) => {
      const url = await signedUrl(LUGGAGE_BUCKET, String(row.storage_path));
      return mapLuggageRow(row, url);
    })
  );

  return mapped;
}

export async function createLuggagePhoto(input: {
  tripId: string;
  travelerId: string;
  dataUrl: string;
  luggageSize: LuggagePhoto['luggageSize'];
  phase?: 'open' | 'packed' | 'final';
}): Promise<LuggagePhoto> {
  const userId = await getCurrentUserId();
  const { blob, mimeType, ext } = await dataUrlToBlob(input.dataUrl);
  const now = Date.now();
  const storagePath = `${safeSegment(userId)}/${safeSegment(input.tripId)}/traveler_${safeSegment(input.travelerId)}/luggage_${now}.${ext}`;

  const upload = await supabase.storage
    .from(LUGGAGE_BUCKET)
    .upload(storagePath, blob, { upsert: false, contentType: mimeType });

  if (upload.error) throw upload.error;

  const url = await signedUrl(LUGGAGE_BUCKET, storagePath);
  const { data, error } = await supabase
    .from('luggage_photos')
    .insert({
      trip_id: input.tripId,
      traveler_id: input.travelerId,
      user_id: userId,
      photo_url: url,
      storage_path: storagePath,
      luggage_size: input.luggageSize,
      phase: input.phase ?? 'open',
      taken_at: new Date().toISOString(),
    })
    .select('*')
    .single();

  if (error) throw error;
  return mapLuggageRow(data, url);
}

export async function updateLuggagePhotoAnalysis(input: {
  id: string;
  aiSuggestion?: string;
  zones?: Record<string, unknown> | null;
  phase?: 'open' | 'packed' | 'final';
}): Promise<void> {
  const payload: Record<string, unknown> = {};
  if (input.aiSuggestion !== undefined) payload.ai_suggestion = input.aiSuggestion;
  if (input.zones !== undefined) payload.zones = input.zones;
  if (input.phase !== undefined) payload.phase = input.phase;

  const { error } = await supabase
    .from('luggage_photos')
    .update(payload)
    .eq('id', input.id);

  if (error) throw error;
}

export async function deleteLuggagePhotoRecord(photo: { id: string; storagePath?: string | null }): Promise<void> {
  if (photo.storagePath) {
    await supabase.storage.from(LUGGAGE_BUCKET).remove([photo.storagePath]);
  }
  const { error } = await supabase
    .from('luggage_photos')
    .delete()
    .eq('id', photo.id);
  if (error) throw error;
}
