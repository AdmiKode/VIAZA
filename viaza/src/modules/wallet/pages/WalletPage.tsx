import { useMemo, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';
import { AppHeader } from '../../../components/ui/AppHeader';
import { AppCard } from '../../../components/ui/AppCard';
import { AppButton } from '../../../components/ui/AppButton';
import { AppSelect } from '../../../components/ui/AppSelect';
import { AppInput } from '../../../components/ui/AppInput';
import { useAppStore } from '../../../app/store/useAppStore';
import { supabase } from '../../../services/supabaseClient';
import { updateWalletDocFields, reportDocLost } from '../../../services/walletDocsService';
import { ExpirationBadge } from '../components/ExpirationBadge';
import { DocViewer } from '../components/DocViewer';
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
  const [expirationDateInput, setExpirationDateInput] = useState('');
  const [uploadStatus, setUploadStatus] = useState<'idle' | 'uploading' | 'error'>('idle');
  const [analyzeId, setAnalyzeId] = useState<string | null>(null);
  const [viewerDoc, setViewerDoc] = useState<WalletDoc | null>(null);

  const canUpload = Boolean(trip?.id);

  const sortedDocs = useMemo(() => {
    return [...walletDocs].sort((a, b) => (b.createdAt ?? '').localeCompare(a.createdAt ?? ''));
  }, [walletDocs]);

  return (
    <div className="px-4 pt-4 pb-24">
      {/* DocViewer — fullscreen overlay */}
      {viewerDoc && (
        <DocViewer doc={viewerDoc} onClose={() => setViewerDoc(null)} />
      )}

      <AppHeader
        title={t('wallet.title')}
        right={
          <Link
            to="/wallet/lost"
            className="rounded-2xl px-3 py-2 text-xs font-bold"
            style={{ background: 'rgba(234,153,64,0.12)', color: '#EA9940', textDecoration: 'none' }}
          >
            Modo Emergencia
          </Link>
        }
      />

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

        <div className="mt-3">
          <div className="text-xs font-semibold text-[rgb(var(--viaza-primary-rgb)/0.55)] mb-1">
            Fecha de vencimiento (opcional)
          </div>
          <AppInput
            type="date"
            value={expirationDateInput}
            onChange={(e) => setExpirationDateInput(e.target.value)}
            placeholder="YYYY-MM-DD"
          />
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
                expirationDate: expirationDateInput || null,
              };
              addWalletDoc(doc);
              // Persistir fecha de vencimiento en DB si se ingresó
              if (expirationDateInput) {
                void updateWalletDocFields(id, { expirationDate: expirationDateInput });
              }
              setUploadStatus('idle');
              setExpirationDateInput('');
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
                {/* Tap en header del card → abre DocViewer */}
                <button
                  type="button"
                  className="w-full text-left active:opacity-80 transition-opacity"
                  onClick={() => setViewerDoc(d)}
                >
                  <div className="flex items-start gap-3">
                    <div className="min-w-0 flex-1">
                      <div className="truncate text-sm font-semibold text-[var(--viaza-primary)]">
                        {d.fileName ?? t('wallet.unnamed')}
                      </div>
                      <div className="mt-1 flex flex-wrap gap-2 text-xs text-[rgb(var(--viaza-primary-rgb)/0.60)]">
                        <span>{t(`wallet.docType.${d.docType}`)}</span>
                        {d.mimeType ? <span>· {d.mimeType}</span> : null}
                        {hasParsed ? <span>· {t('wallet.analysisReady')}</span> : null}
                      </div>
                      <div className="mt-2 flex flex-wrap gap-1.5">
                        <ExpirationBadge doc={d} showDate />
                      </div>
                      {(d.ocrName || d.ocrDocNumber) && (
                        <div className="mt-1.5 text-xs text-[rgb(var(--viaza-primary-rgb)/0.55)]">
                          {d.ocrName && <span className="mr-2">{d.ocrName}</span>}
                          {d.ocrDocNumber && <span className="font-semibold">{d.ocrDocNumber}</span>}
                        </div>
                      )}
                    </div>
                    <div className="shrink-0 text-[rgb(var(--viaza-primary-rgb)/0.30)] text-lg pt-0.5">›</div>
                  </div>
                </button>

                {/* Acciones */}
                <div className="mt-3 flex flex-wrap gap-2">
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
                          const parsed = { task: 'boarding_pass_ocr', raw };
                          updateWalletDoc(d.id, { parsedData: parsed });
                          void updateWalletDocFields(d.id, { parsedData: parsed });
                        } else {
                          // Usar wallet_doc_parse: un solo paso que retorna JSON estructurado
                          // con doc_type, full_name, doc_number, expiration_date, etc.
                          const ocr = await supabase.functions.invoke('ai-orchestrator', {
                            body: { task_type: 'wallet_doc_parse', payload: { imageDataUrl } },
                          });
                          if (ocr.error) throw ocr.error;

                          const ocrResult = (ocr.data as {
                            result?: {
                              structured?: {
                                doc_type?: string;
                                full_name?: string;
                                doc_number?: string;
                                expiration_date?: string;
                                issue_date?: string;
                                issuing_country?: string;
                                nationality?: string;
                                date_of_birth?: string;
                                raw_text?: string;
                              } | null;
                              raw?: string;
                            };
                          } | null)?.result;

                          const structured = ocrResult?.structured ?? null;
                          const rawText = ocrResult?.raw ?? '';

                          const parsed = {
                            task: 'wallet_doc_parse',
                            doc_type: structured?.doc_type ?? null,
                            raw_text: structured?.raw_text ?? rawText,
                          };

                          updateWalletDoc(d.id, {
                            parsedData: parsed,
                            ocrName: structured?.full_name ?? undefined,
                            ocrDocNumber: structured?.doc_number ?? undefined,
                            expirationDate: structured?.expiration_date ?? undefined,
                          });
                          void updateWalletDocFields(d.id, {
                            parsedData: parsed,
                            ocrName: structured?.full_name ?? null,
                            ocrDocNumber: structured?.doc_number ?? null,
                            expirationDate: structured?.expiration_date ?? null,
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
                    <Link to="/premium" className="self-center text-xs font-semibold text-[var(--viaza-accent)]">
                      {t('wallet.premiumForAnalysis')}
                    </Link>
                  )}

                  {/* Reportar perdido */}
                  {!d.isReportedLost && (
                    <button
                      type="button"
                      className="rounded-2xl px-3 py-2 text-xs font-semibold transition active:scale-[0.98]"
                      style={{ background: 'rgb(var(--viaza-primary-rgb) / 0.06)', color: 'var(--viaza-secondary)' }}
                      onClick={async () => {
                        updateWalletDoc(d.id, { isReportedLost: true, lostReportedAt: new Date().toISOString() });
                        void reportDocLost(d.id);
                      }}
                    >
                      Reportar perdido
                    </button>
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
              </AppCard>
            );
          })
        )}
      </div>
    </div>
  );
}

