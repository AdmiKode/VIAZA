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
    updated_at: new Date().toISOString(),
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

  return (data ?? []).map((row) => ({
    id: row.id,
    tripId: row.trip_id,
    docType: row.doc_type,
    fileName: row.file_name ?? undefined,
    mimeType: row.mime_type ?? undefined,
    storagePath: row.storage_path,
    publicUrl: row.public_url ?? undefined,
    parsedData: row.parsed_data ?? undefined,
    createdAt: row.created_at,
    updatedAt: row.updated_at ?? undefined,
  }));
}

