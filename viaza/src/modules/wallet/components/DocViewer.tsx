// src/modules/wallet/components/DocViewer.tsx
//
// Visor de documentos del wallet con signed URL (bucket privado).
//
// SOPORTE POR TIPO:
//   - Imágenes (image/*) → <img> tag, zoom en modal
//   - PDF (application/pdf) → <iframe> embed  ← funciona en navegador/iOS WebView
//     ⚠ PDF en Android WebView (Capacitor) → NO CONFIRMADO sin @capacitor-community/file-opener
//       En Android, si iframe no carga el PDF, se muestra botón "Abrir con app externa"
//       que intenta window.open (fallback). Para apertura nativa real se necesita
//       @capacitor-community/file-opener (pendiente Fase 2).
//   - Otros → botón "Descargar / Abrir" con window.open (nueva pestaña)
//
// SIGNED URL:
//   - TTL = 3600 segundos (1 hora). No hay cacheo en este componente.
//   - Se regenera cada vez que el DocViewer monta.
//
// USO:
//   <DocViewer doc={doc} onClose={() => setOpen(false)} />

import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { getSignedUrl } from '../../../services/walletDocsService';
import type { WalletDoc } from '../../../types/wallet';

interface DocViewerProps {
  doc: WalletDoc;
  onClose: () => void;
}

type LoadState = 'loading' | 'ready' | 'error';

function isImage(mimeType?: string) {
  return mimeType?.startsWith('image/') ?? false;
}

function isPdf(mimeType?: string) {
  return mimeType === 'application/pdf';
}

export function DocViewer({ doc, onClose }: DocViewerProps) {
  const [signedUrl, setSignedUrl] = useState<string | null>(null);
  const [loadState, setLoadState] = useState<LoadState>('loading');

  useEffect(() => {
    let cancelled = false;
    setLoadState('loading');
    void getSignedUrl(doc.storagePath, 3600)
      .then((url) => {
        if (cancelled) return;
        if (!url) { setLoadState('error'); return; }
        setSignedUrl(url);
        setLoadState('ready');
      })
      .catch(() => { if (!cancelled) setLoadState('error'); });
    return () => { cancelled = true; };
  }, [doc.storagePath]);

  // Cerrar con Escape
  useEffect(() => {
    function onKey(e: KeyboardEvent) { if (e.key === 'Escape') onClose(); }
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [onClose]);

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-50 flex flex-col"
        style={{ background: 'rgba(0,0,0,0.92)' }}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-4 pt-safe pb-3 pt-4" style={{ background: 'rgba(0,0,0,0.80)' }}>
          <div className="min-w-0 flex-1 mr-3">
            <div className="truncate text-sm font-semibold text-white">
              {doc.fileName ?? 'Documento'}
            </div>
            {doc.mimeType && (
              <div className="text-xs text-white/50 mt-0.5">{doc.mimeType}</div>
            )}
          </div>
          <button
            type="button"
            onClick={onClose}
            className="shrink-0 rounded-full px-4 py-2 text-sm font-semibold"
            style={{ background: 'rgba(255,255,255,0.12)', color: 'white' }}
          >
            Cerrar
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-hidden relative">
          {loadState === 'loading' && (
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="text-white/60 text-sm">Cargando...</div>
            </div>
          )}

          {loadState === 'error' && (
            <div className="absolute inset-0 flex flex-col items-center justify-center gap-4 px-8 text-center">
              <div className="text-white/70 text-sm">No se pudo cargar el documento.</div>
              <div className="text-white/40 text-xs">Verifica tu conexión e intenta de nuevo.</div>
            </div>
          )}

          {loadState === 'ready' && signedUrl && (
            <>
              {isImage(doc.mimeType) && (
                <div className="absolute inset-0 flex items-center justify-center p-4 overflow-auto">
                  <img
                    src={signedUrl}
                    alt={doc.fileName ?? 'Documento'}
                    className="max-w-full max-h-full object-contain rounded-lg"
                    style={{ userSelect: 'none' }}
                  />
                </div>
              )}

              {isPdf(doc.mimeType) && (
                <div className="absolute inset-0 flex flex-col">
                  {/* ⚠ ANDROID WebView: iframe puede no renderizar PDFs nativamente.
                      Si el contenido no aparece, el botón de fallback está disponible. */}
                  <iframe
                    src={signedUrl}
                    title={doc.fileName ?? 'PDF'}
                    className="flex-1 w-full border-0"
                    style={{ background: 'white' }}
                  />
                  {/* Fallback para Android WebView donde iframe no carga PDF */}
                  <div className="shrink-0 px-4 py-3" style={{ background: 'rgba(0,0,0,0.80)' }}>
                    <div className="text-xs text-white/40 mb-2 text-center">
                      ¿No se ve el PDF? {/* [NO CONFIRMADO] Apertura nativa requiere @capacitor-community/file-opener (Fase 2) */}
                    </div>
                    <button
                      type="button"
                      className="w-full rounded-2xl py-3 text-sm font-semibold"
                      style={{ background: 'rgba(255,255,255,0.12)', color: 'white' }}
                      onClick={() => window.open(signedUrl, '_blank', 'noopener,noreferrer')}
                    >
                      Abrir en nueva pestaña
                    </button>
                  </div>
                </div>
              )}

              {!isImage(doc.mimeType) && !isPdf(doc.mimeType) && (
                <div className="absolute inset-0 flex flex-col items-center justify-center gap-4 px-8 text-center">
                  <div
                    className="rounded-2xl flex items-center justify-center"
                    style={{
                      width: 64,
                      height: 64,
                      background: 'rgba(108,163,162,0.18)',
                      border: '1.5px solid rgba(108,163,162,0.35)',
                    }}
                  >
                    <span style={{ fontSize: 11, fontWeight: 700, letterSpacing: 1, color: '#6CA3A2', textTransform: 'uppercase' }}>
                      {doc.mimeType?.split('/')[1]?.slice(0, 4) ?? 'DOC'}
                    </span>
                  </div>
                  <div className="text-white/80 text-sm font-semibold">{doc.fileName ?? 'Archivo'}</div>
                  <div className="text-white/40 text-xs">{doc.mimeType ?? 'Tipo desconocido'}</div>
                  <button
                    type="button"
                    className="mt-2 rounded-2xl px-6 py-3 text-sm font-semibold"
                    style={{ background: 'rgba(255,255,255,0.12)', color: 'white' }}
                    onClick={() => window.open(signedUrl, '_blank', 'noopener,noreferrer')}
                  >
                    Abrir / Descargar
                  </button>
                </div>
              )}
            </>
          )}
        </div>
      </motion.div>
    </AnimatePresence>
  );
}
