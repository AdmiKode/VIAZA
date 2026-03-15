import { useMemo, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';
import { AppHeader } from '../../../components/ui/AppHeader';
import { AppCard } from '../../../components/ui/AppCard';
import { AppButton } from '../../../components/ui/AppButton';
import { AppSelect } from '../../../components/ui/AppSelect';
import { useAppStore } from '../../../app/store/useAppStore';
import { supabase } from '../../../services/supabaseClient';
import type { WalletDocType, WalletDoc } from '../../../types/wallet';

const DOC_TYPES: Array<{ id: WalletDocType; labelKey: string }> = [
  { id: 'boarding_pass', labelKey: 'wallet.docType.boarding_pass' },
  { id: 'reservation', labelKey: 'wallet.docType.reservation' },
  { id: 'ticket', labelKey: 'wallet.docType.ticket' },
  { id: 'policy', labelKey: 'wallet.docType.policy' },
  { id: 'document', labelKey: 'wallet.docType.document' },
  { id: 'other', labelKey: 'wallet.docType.other' },
];

function safeFileName(name: string) {
  return name.replace(/[^\w.\-() ]+/g, '_').slice(0, 120);
}

async function fileToDataUrl(file: Blob): Promise<string> {
  return await new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result ?? ''));
    reader.onerror = () => reject(new Error('File read error'));
    reader.readAsDataURL(file);
  });
}

export function WalletPage() {
  const { t } = useTranslation();
  const isPremium = useAppStore((s) => s.isPremium);
  const currentTripId = useAppStore((s) => s.currentTripId);
  const trip = useAppStore((s) => s.trips.find((x) => x.id === currentTripId) ?? null);
  const walletDocs = useAppStore((s) => s.walletDocs.filter((d) => d.tripId === currentTripId));
  const addWalletDoc = useAppStore((s) => s.addWalletDoc);
  const updateWalletDoc = useAppStore((s) => s.updateWalletDoc);
  const deleteWalletDoc = useAppStore((s) => s.deleteWalletDoc);

  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const [docType, setDocType] = useState<WalletDocType>('document');
  const [uploadStatus, setUploadStatus] = useState<'idle' | 'uploading' | 'error'>('idle');
  const [analyzeId, setAnalyzeId] = useState<string | null>(null);

  const canUpload = Boolean(trip?.id);

  const sortedDocs = useMemo(() => {
    return [...walletDocs].sort((a, b) => (b.createdAt ?? '').localeCompare(a.createdAt ?? ''));
  }, [walletDocs]);

  return (
    <div className="px-4 pt-4 pb-24">
      <AppHeader title={t('wallet.title')} />

      <div className="mt-2 text-sm text-[rgb(var(--viaza-primary-rgb)/0.60)]">
        {t('wallet.subtitle')}
      </div>

      <AppCard className="mt-4">
        <div className="text-xs font-semibold uppercase tracking-wider text-[rgb(var(--viaza-primary-rgb)/0.55)]">
          {t('wallet.docTypeLabel')}
        </div>
        <div className="mt-2">
          <AppSelect value={docType} onChange={(e) => setDocType(e.target.value as WalletDocType)}>
            {DOC_TYPES.map((d) => (
              <option key={d.id} value={d.id}>
                {t(d.labelKey)}
              </option>
            ))}
          </AppSelect>
        </div>

        <input
          ref={fileInputRef}
          type="file"
          accept="application/pdf,image/*"
          className="hidden"
          onChange={async (e) => {
            const file = e.target.files?.[0] ?? null;
            if (!file || !trip?.id) return;
            setUploadStatus('uploading');
            try {
              const { data: { user } } = await supabase.auth.getUser();
              if (!user) throw new Error('Not authenticated');

              const storagePath = `${user.id}/${trip.id}/${Date.now()}_${safeFileName(file.name)}`;
              const upload = await supabase.storage
                .from('wallet_docs')
                .upload(storagePath, file, { upsert: false, contentType: file.type || undefined });
              if (upload.error) throw upload.error;

              const now = new Date().toISOString();
              const id = crypto.randomUUID();
              const doc: WalletDoc = {
                id,
                tripId: trip.id,
                docType,
                fileName: file.name,
                mimeType: file.type || undefined,
                storagePath,
                createdAt: now,
                updatedAt: now,
              };
              addWalletDoc(doc);
              setUploadStatus('idle');
            } catch {
              setUploadStatus('error');
            } finally {
              if (fileInputRef.current) fileInputRef.current.value = '';
            }
          }}
        />

        <div className="mt-3">
          <AppButton
            className="w-full"
            type="button"
            disabled={!canUpload || uploadStatus === 'uploading'}
            onClick={() => fileInputRef.current?.click()}
          >
            {uploadStatus === 'uploading' ? t('wallet.uploading') : t('wallet.upload')}
          </AppButton>
        </div>

        {uploadStatus === 'error' && (
          <div className="mt-3 text-sm font-semibold text-[var(--viaza-accent)]">
            {t('wallet.uploadError')}
          </div>
        )}
      </AppCard>

      <div className="mt-4 space-y-3">
        {sortedDocs.length === 0 ? (
          <AppCard>
            <div className="text-sm text-[rgb(var(--viaza-primary-rgb)/0.70)]">
              {t('wallet.empty')}
            </div>
          </AppCard>
        ) : (
          sortedDocs.map((d) => {
            const isAnalyzing = analyzeId === d.id;
            const hasParsed = Boolean(d.parsedData);
            return (
              <AppCard key={d.id}>
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <div className="truncate text-sm font-semibold text-[var(--viaza-primary)]">
                      {d.fileName ?? t('wallet.unnamed')}
                    </div>
                    <div className="mt-1 flex flex-wrap gap-2 text-xs text-[rgb(var(--viaza-primary-rgb)/0.60)]">
                      <span>{t(`wallet.docType.${d.docType}`)}</span>
                      {d.mimeType ? <span>· {d.mimeType}</span> : null}
                      {hasParsed ? <span>· {t('wallet.analysisReady')}</span> : null}
                    </div>
                  </div>

                  <div className="flex flex-col gap-2">
                    <button
                      type="button"
                      className="rounded-2xl px-3 py-2 text-xs font-semibold transition active:scale-[0.98]"
                      style={{ background: 'rgb(var(--viaza-primary-rgb) / 0.10)', color: 'var(--viaza-primary)' }}
                      onClick={async () => {
                        const { data, error } = await supabase.storage
                          .from('wallet_docs')
                          .createSignedUrl(d.storagePath, 60 * 10);
                        if (error || !data?.signedUrl) return;
                        window.open(data.signedUrl, '_blank', 'noopener,noreferrer');
                      }}
                    >
                      {t('wallet.open')}
                    </button>

                    <button
                      type="button"
                      className="rounded-2xl px-3 py-2 text-xs font-semibold transition active:scale-[0.98]"
                      style={{ background: 'rgb(var(--viaza-accent-rgb) / 0.20)', color: 'var(--viaza-primary)' }}
                      disabled={isAnalyzing || !isPremium || !d.mimeType?.startsWith('image/')}
                      onClick={async () => {
                        if (!d.mimeType?.startsWith('image/')) return;
                        setAnalyzeId(d.id);
                        try {
                          const { data, error } = await supabase.storage
                            .from('wallet_docs')
                            .createSignedUrl(d.storagePath, 60 * 10);
                          if (error || !data?.signedUrl) throw error ?? new Error('signedUrl error');

                          const blobRes = await fetch(data.signedUrl);
                          if (!blobRes.ok) throw new Error('download error');
                          const blob = await blobRes.blob();
                          const imageDataUrl = await fileToDataUrl(blob);

                          if (d.docType === 'boarding_pass') {
                            const r = await supabase.functions.invoke('ai-orchestrator', {
                              body: { task_type: 'boarding_pass_ocr', payload: { imageDataUrl } },
                            });
                            if (r.error) throw r.error;
                            const raw = (r.data as { result?: { raw?: string } } | null)?.result?.raw ?? '';
                            updateWalletDoc(d.id, { parsedData: { task: 'boarding_pass_ocr', raw } });
                          } else {
                            const ocr = await supabase.functions.invoke('ai-orchestrator', {
                              body: { task_type: 'document_ocr' as const, payload: { imageDataUrl } },
                            });
                            if (ocr.error) throw ocr.error;
                            const text = (ocr.data as { result?: { text?: string } } | null)?.result?.text ?? '';

                            const parsed = await supabase.functions.invoke('ai-orchestrator', {
                              body: { task_type: 'reservation_parse', payload: { text: text.slice(0, 4000) } },
                            });
                            if (parsed.error) throw parsed.error;

                            updateWalletDoc(d.id, {
                              parsedData: {
                                task: 'document_ocr',
                                text,
                                reservation_raw: (parsed.data as { result?: { raw?: string } } | null)?.result?.raw ?? '',
                              },
                            });
                          }
                        } catch {
                          // silencioso (MVP)
                        } finally {
                          setAnalyzeId(null);
                        }
                      }}
                    >
                      {isAnalyzing ? t('wallet.analyzing') : t('wallet.analyze')}
                    </button>

                    {!isPremium && (
                      <Link to="/premium" className="-mt-1 block text-right text-xs font-semibold text-[var(--viaza-accent)]">
                        {t('wallet.premiumForAnalysis')}
                      </Link>
                    )}

                    <button
                      type="button"
                      className="rounded-2xl px-3 py-2 text-xs font-semibold transition active:scale-[0.98]"
                      style={{ background: 'rgb(var(--viaza-primary-rgb) / 0.06)', color: 'rgb(var(--viaza-primary-rgb) / 0.70)' }}
                      onClick={async () => {
                        await supabase.storage.from('wallet_docs').remove([d.storagePath]);
                        deleteWalletDoc(d.id);
                      }}
                    >
                      {t('wallet.delete')}
                    </button>
                  </div>
                </div>
              </AppCard>
            );
          })
        )}
      </div>
    </div>
  );
}

