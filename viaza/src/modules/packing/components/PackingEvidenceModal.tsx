/**
 * PackingEvidenceModal
 * Modal para tomar foto de evidencia de un item de maleta.
 * Persistencia real: Supabase Storage + tabla packing_evidence.
 */

import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { motion } from 'framer-motion';
import { ModalSheet } from '../../../components/ui/ModalSheet';
import { takePhoto } from '../../../services/cameraService';
import { impactMedium, notificationSuccess } from '../../../services/hapticsService';
import { deletePackingEvidenceRecord, uploadPackingEvidence } from '../../../services/packingMediaService';
import type { PackingEvidence } from '../../../types/traveler';

interface PackingEvidenceModalProps {
  open: boolean;
  onClose: () => void;
  tripId: string;
  itemId: string;
  itemLabel: string;
  travelerId: string;
  travelerName: string;
  existingEvidence: PackingEvidence | null;
  onEvidenceSaved: (evidence: PackingEvidence) => void;
  onEvidenceRemoved: (evidenceId: string) => void;
}

export function PackingEvidenceModal({
  open,
  onClose,
  tripId,
  itemId,
  itemLabel,
  travelerId,
  travelerName,
  existingEvidence,
  onEvidenceSaved,
  onEvidenceRemoved,
}: PackingEvidenceModalProps) {
  const { t } = useTranslation();

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleTakePhoto() {
    setLoading(true);
    setError(null);
    try {
      await impactMedium();
      const photo = await takePhoto();
      const saved = await uploadPackingEvidence({
        tripId,
        itemId,
        travelerId,
        dataUrl: photo.dataUrl,
        takenAt: new Date().toISOString(),
      });
      onEvidenceSaved(saved);
      await notificationSuccess();
      onClose();
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Error al guardar evidencia';
      setError(msg);
    } finally {
      setLoading(false);
    }
  }

  async function handleRemove() {
    if (!existingEvidence?.id) return;
    setLoading(true);
    setError(null);
    try {
      await deletePackingEvidenceRecord({
        id: existingEvidence.id,
        storagePath: existingEvidence.storagePath,
      });
      onEvidenceRemoved(existingEvidence.id);
      await notificationSuccess();
      onClose();
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Error al eliminar evidencia';
      setError(msg);
    } finally {
      setLoading(false);
    }
  }

  const previewUrl = existingEvidence?.photoUrl ?? existingEvidence?.photoDataUrl;

  return (
    <ModalSheet open={open} onClose={onClose} title={t('packing.evidence.title')}>
      <div style={{ padding: '0 20px 20px' }}>
        <div
          style={{
            background: 'rgba(234,153,64,0.08)',
            borderRadius: 16,
            padding: '12px 16px',
            marginBottom: 20,
          }}
        >
          <div
            style={{
              fontFamily: 'Questrial, sans-serif',
              fontWeight: 700,
              fontSize: 15,
              color: '#12212E',
            }}
          >
            {itemLabel}
          </div>
          <div
            style={{
              fontFamily: 'Questrial, sans-serif',
              fontSize: 12,
              color: 'rgba(18,33,46,0.55)',
              marginTop: 3,
            }}
          >
            {travelerName}
          </div>
        </div>

        {previewUrl ? (
          <div style={{ marginBottom: 20 }}>
            <div
              style={{
                fontFamily: 'Questrial, sans-serif',
                fontSize: 12,
                fontWeight: 600,
                color: 'rgba(18,33,46,0.50)',
                textTransform: 'uppercase',
                letterSpacing: 0.5,
                marginBottom: 10,
              }}
            >
              {t('packing.evidence.current')}
            </div>
            <div style={{ position: 'relative', borderRadius: 16, overflow: 'hidden' }}>
              <img
                src={previewUrl}
                alt={itemLabel}
                style={{ width: '100%', height: 220, objectFit: 'cover', display: 'block' }}
              />
              <div
                style={{
                  position: 'absolute',
                  top: 12,
                  right: 12,
                  background: '#307082',
                  borderRadius: 99,
                  padding: '4px 10px',
                  display: 'flex',
                  alignItems: 'center',
                  gap: 4,
                }}
              >
                <svg width="14" height="14" viewBox="0 0 48 48" fill="none">
                  <path d="M10 24l10 10 18-18" stroke="white" strokeWidth="5" strokeLinecap="round" strokeLinejoin="round" fill="none" />
                </svg>
                <span
                  style={{
                    fontFamily: 'Questrial, sans-serif',
                    fontSize: 11,
                    fontWeight: 700,
                    color: 'white',
                  }}
                >
                  {t('packing.evidence.verified')}
                </span>
              </div>
              <div
                style={{
                  position: 'absolute',
                  bottom: 10,
                  left: 12,
                  background: 'rgba(0,0,0,0.55)',
                  borderRadius: 8,
                  padding: '2px 8px',
                  fontFamily: 'Questrial, sans-serif',
                  fontSize: 11,
                  color: 'rgba(255,255,255,0.85)',
                }}
              >
                {existingEvidence?.takenAt ? new Date(existingEvidence.takenAt).toLocaleString() : ''}
              </div>
            </div>

            <div style={{ display: 'flex', gap: 10, marginTop: 12 }}>
              <button
                type="button"
                onClick={handleTakePhoto}
                disabled={loading}
                style={{
                  flex: 1,
                  height: 46,
                  borderRadius: 14,
                  background: '#EA9940',
                  color: 'white',
                  border: 'none',
                  fontFamily: 'Questrial, sans-serif',
                  fontWeight: 700,
                  fontSize: 14,
                  cursor: 'pointer',
                  opacity: loading ? 0.6 : 1,
                }}
              >
                {loading ? t('packing.evidence.taking') : t('packing.evidence.retake')}
              </button>
              <button
                type="button"
                onClick={handleRemove}
                disabled={loading}
                style={{
                  width: 46,
                  height: 46,
                  borderRadius: 14,
                  background: 'rgba(192,57,43,0.10)',
                  color: '#c0392b',
                  border: 'none',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  opacity: loading ? 0.6 : 1,
                }}
              >
                <svg width="18" height="18" viewBox="0 0 48 48" fill="none">
                  <path d="M12 12l24 24M36 12L12 36" stroke="#c0392b" strokeWidth="4" strokeLinecap="round" />
                </svg>
              </button>
            </div>
          </div>
        ) : (
          <div style={{ marginBottom: 20 }}>
            <div
              style={{
                height: 180,
                borderRadius: 16,
                border: '2px dashed rgba(18,33,46,0.15)',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                gap: 10,
                marginBottom: 16,
                background: 'rgba(18,33,46,0.03)',
              }}
            >
              <svg width="40" height="40" viewBox="0 0 48 48" fill="none">
                <rect x="4" y="10" width="40" height="30" rx="7" fill="#EA9940" />
                <rect x="4" y="10" width="40" height="14" rx="7" fill="rgba(180,192,200,0.55)" />
                <circle cx="24" cy="27" r="8" fill="white" opacity="0.5" />
                <circle cx="24" cy="27" r="5" fill="white" opacity="0.8" />
                <rect x="16" y="6" width="16" height="6" rx="3" fill="#EA9940" />
              </svg>
              <span
                style={{
                  fontFamily: 'Questrial, sans-serif',
                  fontSize: 13,
                  color: 'rgba(18,33,46,0.45)',
                  textAlign: 'center',
                }}
              >
                {t('packing.evidence.noPhoto')}
              </span>
            </div>

            <button
              type="button"
              onClick={handleTakePhoto}
              disabled={loading}
              style={{
                width: '100%',
                height: 52,
                borderRadius: 16,
                background: loading ? 'rgba(18,33,46,0.10)' : '#EA9940',
                color: loading ? 'rgba(18,33,46,0.40)' : 'white',
                border: 'none',
                fontFamily: 'Questrial, sans-serif',
                fontWeight: 700,
                fontSize: 15,
                cursor: loading ? 'default' : 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: 10,
              }}
            >
              {loading ? (
                <motion.div
                  animate={{ rotate: 360 }}
                  transition={{ repeat: Infinity, duration: 1, ease: 'linear' }}
                  style={{
                    width: 20,
                    height: 20,
                    borderRadius: '50%',
                    border: '2px solid rgba(18,33,46,0.15)',
                    borderTopColor: '#12212E',
                  }}
                />
              ) : (
                <>
                  <svg width="20" height="20" viewBox="0 0 48 48" fill="none">
                    <rect x="4" y="10" width="40" height="30" rx="7" fill="white" opacity="0.9" />
                    <circle cx="24" cy="27" r="8" fill="white" opacity="0.4" />
                    <circle cx="24" cy="27" r="5" fill="white" opacity="0.7" />
                    <rect x="16" y="6" width="16" height="6" rx="3" fill="white" opacity="0.9" />
                  </svg>
                  {t('packing.evidence.take')}
                </>
              )}
            </button>
          </div>
        )}

        {error && (
          <div
            style={{
              background: 'rgba(192,57,43,0.08)',
              border: '1px solid rgba(192,57,43,0.20)',
              borderRadius: 12,
              padding: '10px 14px',
              fontFamily: 'Questrial, sans-serif',
              fontSize: 13,
              color: '#c0392b',
            }}
          >
            {error}
          </div>
        )}

        <p
          style={{
            fontFamily: 'Questrial, sans-serif',
            fontSize: 12,
            color: 'rgba(18,33,46,0.40)',
            textAlign: 'center',
            marginTop: 12,
          }}
        >
          {t('packing.evidence.optional')}
        </p>
      </div>
    </ModalSheet>
  );
}
