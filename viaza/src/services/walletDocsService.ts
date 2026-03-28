import { supabase } from './supabaseClient';
import type { WalletDoc } from '../types/wallet';

function toRow(doc: WalletDoc, userId: string) {
  return {
    id: doc.id,
    trip_id: doc.tripId,
    user_id: userId,
    doc_type: doc.docType,
    file_name: doc.fileName ?? null,
    mime_type: doc.mimeType ?? null,
    storage_path: doc.storagePath,
    public_url: doc.publicUrl ?? null,
    parsed_data: doc.parsedData ?? null,
    expiration_date: doc.expirationDate ?? null,
    ocr_name: doc.ocrName ?? null,
    ocr_doc_number: doc.ocrDocNumber ?? null,
    is_reported_lost: doc.isReportedLost ?? false,
    lost_reported_at: doc.lostReportedAt ?? null,
    updated_at: new Date().toISOString(),
  };
}

function fromRow(row: Record<string, unknown>): WalletDoc {
  return {
    id: row.id as string,
    tripId: row.trip_id as string,
    docType: row.doc_type as WalletDoc['docType'],
    fileName: (row.file_name as string | null) ?? undefined,
    mimeType: (row.mime_type as string | null) ?? undefined,
    storagePath: row.storage_path as string,
    publicUrl: (row.public_url as string | null) ?? undefined,
    parsedData: row.parsed_data ?? undefined,
    createdAt: row.created_at as string,
    updatedAt: (row.updated_at as string | null) ?? undefined,
    expirationDate: (row.expiration_date as string | null) ?? null,
    ocrName: (row.ocr_name as string | null) ?? null,
    ocrDocNumber: (row.ocr_doc_number as string | null) ?? null,
    isReportedLost: (row.is_reported_lost as boolean | null) ?? false,
    lostReportedAt: (row.lost_reported_at as string | null) ?? null,
  };
}

export async function upsertWalletDoc(doc: WalletDoc): Promise<void> {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return;

  const { error } = await supabase
    .from('wallet_docs')
    .upsert(toRow(doc, user.id), { onConflict: 'id' });

  if (error) console.error('[walletDocsService] upsertWalletDoc error:', error.message);
}

export async function updateWalletDocFields(id: string, fields: Partial<Pick<WalletDoc, 'expirationDate' | 'ocrName' | 'ocrDocNumber' | 'isReportedLost' | 'lostReportedAt' | 'parsedData'>>): Promise<void> {
  const patch: Record<string, unknown> = { updated_at: new Date().toISOString() };
  if ('expirationDate' in fields) patch.expiration_date = fields.expirationDate ?? null;
  if ('ocrName' in fields) patch.ocr_name = fields.ocrName ?? null;
  if ('ocrDocNumber' in fields) patch.ocr_doc_number = fields.ocrDocNumber ?? null;
  if ('isReportedLost' in fields) patch.is_reported_lost = fields.isReportedLost ?? false;
  if ('lostReportedAt' in fields) patch.lost_reported_at = fields.lostReportedAt ?? null;
  if ('parsedData' in fields) patch.parsed_data = fields.parsedData ?? null;

  const { error } = await supabase.from('wallet_docs').update(patch).eq('id', id);
  if (error) console.error('[walletDocsService] updateWalletDocFields error:', error.message);
}

export async function reportDocLost(id: string): Promise<void> {
  await updateWalletDocFields(id, {
    isReportedLost: true,
    lostReportedAt: new Date().toISOString(),
  });
}

export async function deleteWalletDocRemote(id: string): Promise<void> {
  const { error } = await supabase
    .from('wallet_docs')
    .delete()
    .eq('id', id);
  if (error) console.error('[walletDocsService] deleteWalletDocRemote error:', error.message);
}

export async function fetchWalletDocs(tripId: string): Promise<WalletDoc[]> {
  const { data, error } = await supabase
    .from('wallet_docs')
    .select('*')
    .eq('trip_id', tripId)
    .order('created_at', { ascending: false });

  if (error) {
    console.error('[walletDocsService] fetchWalletDocs error:', error.message);
    return [];
  }

  return (data ?? []).map((row) => fromRow(row as Record<string, unknown>));
}

/** Genera signed URL para visualización. TTL configurable (default 1 hora). */
export async function getSignedUrl(storagePath: string, ttlSeconds = 3600): Promise<string | null> {
  const { data, error } = await supabase.storage
    .from('wallet_docs')
    .createSignedUrl(storagePath, ttlSeconds);
  if (error || !data?.signedUrl) {
    console.error('[walletDocsService] getSignedUrl error:', error?.message);
    return null;
  }
  return data.signedUrl;
}

