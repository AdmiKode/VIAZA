/**
 * LuggageAssistantPage
 * Asistente de acomodo de maleta:
 * 1. Elige tamaño de maleta
 * 2. Toma foto de la maleta abierta
 * 3. IA (OpenAI Vision) analiza y da recomendación de acomodo por zonas
 * 4. Foto final para confirmar
 * Sin mocks — usa cámara real y OpenAI real.
 */

import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { motion, AnimatePresence } from 'framer-motion';
import { useAppStore } from '../../../app/store/useAppStore';
import { takePhoto } from '../../../services/cameraService';
import { impactMedium, notificationSuccess, notificationError } from '../../../services/hapticsService';
import { supabase } from '../../../services/supabaseClient';
import type { LuggagePhoto } from '../../../types/traveler';

type LuggageSize = LuggagePhoto['luggageSize'];

const LUGGAGE_SIZES: { id: LuggageSize; labelKey: string; descKey: string; icon: JSX.Element }[] = [
  {
    id: 'cabin',
    labelKey: 'luggage.size.cabin',
    descKey: 'luggage.size.cabin.desc',
    icon: (
      <svg width="32" height="32" viewBox="0 0 48 48" fill="none">
        <rect x="12" y="8" width="24" height="32" rx="5" fill="#EA9940" />
        <rect x="12" y="8" width="24" height="14" rx="5" fill="rgba(180,192,200,0.55)" />
        <rect x="18" y="4" width="12" height="6" rx="3" fill="#EA9940" />
        <line x1="24" y1="18" x2="24" y2="36" stroke="white" strokeWidth="2" strokeLinecap="round" opacity="0.5" />
      </svg>
    ),
  },
  {
    id: 'medium',
    labelKey: 'luggage.size.medium',
    descKey: 'luggage.size.medium.desc',
    icon: (
      <svg width="32" height="32" viewBox="0 0 48 48" fill="none">
        <rect x="10" y="6" width="28" height="36" rx="5" fill="#EA9940" />
        <rect x="10" y="6" width="28" height="16" rx="5" fill="rgba(180,192,200,0.55)" />
        <rect x="17" y="2" width="14" height="6" rx="3" fill="#EA9940" />
        <line x1="24" y1="18" x2="24" y2="38" stroke="white" strokeWidth="2" strokeLinecap="round" opacity="0.5" />
      </svg>
    ),
  },
  {
    id: 'large',
    labelKey: 'luggage.size.large',
    descKey: 'luggage.size.large.desc',
    icon: (
      <svg width="32" height="32" viewBox="0 0 48 48" fill="none">
        <rect x="8" y="4" width="32" height="40" rx="5" fill="#EA9940" />
        <rect x="8" y="4" width="32" height="18" rx="5" fill="rgba(180,192,200,0.55)" />
        <rect x="16" y="0" width="16" height="6" rx="3" fill="#EA9940" />
        <line x1="24" y1="18" x2="24" y2="40" stroke="white" strokeWidth="2" strokeLinecap="round" opacity="0.5" />
      </svg>
    ),
  },
  {
    id: 'extra_large',
    labelKey: 'luggage.size.extra_large',
    descKey: 'luggage.size.extra_large.desc',
    icon: (
      <svg width="32" height="32" viewBox="0 0 48 48" fill="none">
        <rect x="6" y="2" width="36" height="44" rx="5" fill="#EA9940" />
        <rect x="6" y="2" width="36" height="20" rx="5" fill="rgba(180,192,200,0.55)" />
        <rect x="15" y="0" width="18" height="4" rx="2" fill="#EA9940" />
        <line x1="24" y1="20" x2="24" y2="42" stroke="white" strokeWidth="2" strokeLinecap="round" opacity="0.5" />
      </svg>
    ),
  },
];

async function analyzeWithAI(photoDataUrl: string, luggageSize: LuggageSize, lang: string): Promise<string> {
  const { data, error } = await supabase.functions.invoke('ai-orchestrator', {
    body: {
      task_type: 'luggage_analysis',
      payload: { imageDataUrl: photoDataUrl, luggageSize },
      language_context: { app_lang: lang },
    },
  });
  if (error) throw error;
  return (data as { result?: { suggestion?: string } } | null)?.result?.suggestion ?? '';
}

interface LuggageAssistantPageProps {
  tripId: string;
  travelerId: string;
  travelerName: string;
  onClose: () => void;
}

export function LuggageAssistantPage({
  tripId, travelerId, travelerName, onClose,
}: LuggageAssistantPageProps) {
  const { t, i18n } = useTranslation();
  const addLuggagePhoto = useAppStore((s) => s.addLuggagePhoto);
  const updateLuggagePhoto = useAppStore((s) => s.updateLuggagePhoto);
  const luggagePhotos = useAppStore((s) =>
    s.luggagePhotos.filter((p) => p.tripId === tripId && p.travelerId === travelerId)
  );

  const [step, setStep] = useState<'size' | 'photo' | 'analyzing' | 'result'>('size');
  const [selectedSize, setSelectedSize] = useState<LuggageSize | null>(null);
  const [photoId, setPhotoId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const currentPhoto = luggagePhotos.find((p) => p.id === photoId);

  async function handleTakePhoto() {
    if (!selectedSize) return;
    setError(null);
    try {
      await impactMedium();
      const photo = await takePhoto();
      const id = addLuggagePhoto({
        tripId,
        travelerId,
        photoDataUrl: photo.dataUrl,
        takenAt: new Date().toISOString(),
        luggageSize: selectedSize,
        arrangementStatus: 'pending',
      });
      setPhotoId(id);
      setStep('analyzing');

      // Analizar con IA
      updateLuggagePhoto(id, { arrangementStatus: 'analyzing' });
      const suggestion = await analyzeWithAI(photo.dataUrl, selectedSize, i18n.language);
      updateLuggagePhoto(id, { arrangementSuggestion: suggestion, arrangementStatus: 'ready' });
      await notificationSuccess();
      setStep('result');
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Error';
      setError(msg);
      if (photoId) {
        updateLuggagePhoto(photoId, { arrangementStatus: 'error' });
      }
      await notificationError();
      setStep('photo');
    }
  }

  return (
    <div style={{
      position: 'fixed',
      inset: 0,
      background: '#ECE7DC',
      zIndex: 100,
      overflowY: 'auto',
      fontFamily: 'Questrial, sans-serif',
    }}>
      {/* Header */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        gap: 12,
        padding: '56px 20px 20px',
        background: 'linear-gradient(160deg, #12212E 0%, #307082 100%)',
      }}>
        <button
          type="button"
          onClick={onClose}
          style={{
            width: 38,
            height: 38,
            borderRadius: 99,
            background: 'rgba(255,255,255,0.15)',
            border: 'none',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <svg width="18" height="18" viewBox="0 0 48 48" fill="none">
            <path d="M30 10L18 24l12 14" stroke="white" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round" fill="none"/>
          </svg>
        </button>
        <div>
          <div style={{ color: 'white', fontWeight: 700, fontSize: 18 }}>
            {t('luggage.assistant.title')}
          </div>
          <div style={{ color: 'rgba(255,255,255,0.60)', fontSize: 13 }}>
            {travelerName}
          </div>
        </div>
      </div>

      <div style={{ padding: '24px 20px', paddingBottom: 80 }}>

        {/* ── PASO 1: Elegir tamaño ── */}
        <AnimatePresence mode="wait">
          {step === 'size' && (
            <motion.div
              key="size"
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -16 }}
            >
              <h2 style={{ fontWeight: 700, fontSize: 20, color: '#12212E', marginBottom: 8 }}>
                {t('luggage.size.title')}
              </h2>
              <p style={{ color: 'rgba(18,33,46,0.55)', fontSize: 14, marginBottom: 24 }}>
                {t('luggage.size.subtitle')}
              </p>

              <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                {LUGGAGE_SIZES.map((size) => (
                  <button
                    key={size.id}
                    type="button"
                    onClick={() => setSelectedSize(size.id)}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: 16,
                      padding: '16px 18px',
                      borderRadius: 20,
                      background: selectedSize === size.id ? '#12212E' : 'white',
                      border: selectedSize === size.id ? 'none' : '1.5px solid rgba(18,33,46,0.08)',
                      boxShadow: '0 2px 12px rgba(18,33,46,0.06)',
                      cursor: 'pointer',
                      textAlign: 'left',
                    }}
                  >
                    <div style={{
                      width: 52,
                      height: 52,
                      borderRadius: 14,
                      background: selectedSize === size.id ? 'rgba(255,255,255,0.12)' : 'rgba(234,153,64,0.10)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      flexShrink: 0,
                    }}>
                      {size.icon}
                    </div>
                    <div>
                      <div style={{
                        fontWeight: 700,
                        fontSize: 15,
                        color: selectedSize === size.id ? 'white' : '#12212E',
                      }}>
                        {t(size.labelKey)}
                      </div>
                      <div style={{
                        fontSize: 12,
                        color: selectedSize === size.id ? 'rgba(255,255,255,0.60)' : 'rgba(18,33,46,0.50)',
                        marginTop: 2,
                      }}>
                        {t(size.descKey)}
                      </div>
                    </div>
                    {selectedSize === size.id && (
                      <div style={{ marginLeft: 'auto' }}>
                        <svg width="20" height="20" viewBox="0 0 48 48" fill="none">
                          <circle cx="24" cy="24" r="20" fill="#EA9940" />
                          <path d="M14 24l8 8 12-12" stroke="white" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round" fill="none"/>
                        </svg>
                      </div>
                    )}
                  </button>
                ))}
              </div>

              <button
                type="button"
                onClick={() => selectedSize && setStep('photo')}
                disabled={!selectedSize}
                style={{
                  width: '100%',
                  height: 54,
                  borderRadius: 16,
                  background: selectedSize ? '#EA9940' : 'rgba(18,33,46,0.10)',
                  color: selectedSize ? 'white' : 'rgba(18,33,46,0.30)',
                  border: 'none',
                  fontWeight: 700,
                  fontSize: 16,
                  cursor: selectedSize ? 'pointer' : 'default',
                  marginTop: 24,
                }}
              >
                {t('luggage.size.cta')}
              </button>
            </motion.div>
          )}

          {/* ── PASO 2: Tomar foto ── */}
          {step === 'photo' && (
            <motion.div
              key="photo"
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -16 }}
            >
              <h2 style={{ fontWeight: 700, fontSize: 20, color: '#12212E', marginBottom: 8 }}>
                {t('luggage.photo.title')}
              </h2>
              <p style={{ color: 'rgba(18,33,46,0.55)', fontSize: 14, marginBottom: 24 }}>
                {t('luggage.photo.subtitle')}
              </p>

              {/* Área de foto */}
              <div style={{
                height: 240,
                borderRadius: 20,
                border: '2px dashed rgba(18,33,46,0.15)',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                gap: 12,
                background: 'rgba(18,33,46,0.03)',
                marginBottom: 24,
              }}>
                <svg width="56" height="56" viewBox="0 0 48 48" fill="none">
                  <rect x="4" y="10" width="40" height="30" rx="7" fill="#EA9940" />
                  <rect x="4" y="10" width="40" height="14" rx="7" fill="rgba(180,192,200,0.55)" />
                  <circle cx="24" cy="27" r="8" fill="white" opacity="0.5" />
                  <circle cx="24" cy="27" r="5" fill="white" opacity="0.8" />
                  <rect x="16" y="6" width="16" height="6" rx="3" fill="#EA9940" />
                </svg>
                <p style={{
                  color: 'rgba(18,33,46,0.45)',
                  fontSize: 14,
                  textAlign: 'center',
                  maxWidth: 220,
                }}>
                  {t('luggage.photo.hint')}
                </p>
              </div>

              {error && (
                <div style={{
                  background: 'rgba(192,57,43,0.08)',
                  border: '1px solid rgba(192,57,43,0.20)',
                  borderRadius: 12,
                  padding: '10px 14px',
                  fontSize: 13,
                  color: '#c0392b',
                  marginBottom: 16,
                }}>
                  {error}
                </div>
              )}

              <button
                type="button"
                onClick={handleTakePhoto}
                style={{
                  width: '100%',
                  height: 54,
                  borderRadius: 16,
                  background: '#EA9940',
                  color: 'white',
                  border: 'none',
                  fontWeight: 700,
                  fontSize: 16,
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: 10,
                }}
              >
                <svg width="22" height="22" viewBox="0 0 48 48" fill="none">
                  <rect x="4" y="10" width="40" height="30" rx="7" fill="white" opacity="0.9" />
                  <circle cx="24" cy="27" r="8" fill="white" opacity="0.4" />
                  <circle cx="24" cy="27" r="5" fill="white" opacity="0.7" />
                  <rect x="16" y="6" width="16" height="6" rx="3" fill="white" opacity="0.9" />
                </svg>
                {t('luggage.photo.cta')}
              </button>
            </motion.div>
          )}

          {/* ── PASO 3: Analizando ── */}
          {step === 'analyzing' && (
            <motion.div
              key="analyzing"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              style={{ textAlign: 'center', paddingTop: 60 }}
            >
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ repeat: Infinity, duration: 1.5, ease: 'linear' }}
                style={{
                  width: 64,
                  height: 64,
                  borderRadius: '50%',
                  border: '4px solid rgba(18,33,46,0.10)',
                  borderTopColor: '#EA9940',
                  margin: '0 auto 24px',
                }}
              />
              <h2 style={{ fontWeight: 700, fontSize: 20, color: '#12212E', marginBottom: 8 }}>
                {t('luggage.analyzing.title')}
              </h2>
              <p style={{ color: 'rgba(18,33,46,0.55)', fontSize: 14 }}>
                {t('luggage.analyzing.subtitle')}
              </p>
            </motion.div>
          )}

          {/* ── PASO 4: Resultado ── */}
          {step === 'result' && currentPhoto && currentPhoto.arrangementSuggestion && (
            <motion.div
              key="result"
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
            >
              <h2 style={{ fontWeight: 700, fontSize: 20, color: '#12212E', marginBottom: 8 }}>
                {t('luggage.result.title')}
              </h2>

              {/* Foto tomada */}
              <div style={{ borderRadius: 16, overflow: 'hidden', marginBottom: 20 }}>
                <img
                  src={currentPhoto.photoDataUrl}
                  alt="Maleta"
                  style={{ width: '100%', height: 200, objectFit: 'cover', display: 'block' }}
                />
              </div>

              {/* Recomendación */}
              <div style={{
                background: 'white',
                borderRadius: 20,
                padding: '18px 18px',
                boxShadow: '0 4px 20px rgba(18,33,46,0.08)',
                marginBottom: 20,
              }}>
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 10,
                  marginBottom: 14,
                }}>
                  <div style={{
                    width: 36,
                    height: 36,
                    borderRadius: 10,
                    background: 'rgba(234,153,64,0.12)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}>
                    <svg width="20" height="20" viewBox="0 0 48 48" fill="none">
                      <circle cx="24" cy="24" r="20" fill="#EA9940" />
                      <circle cx="24" cy="24" r="20" fill="rgba(180,192,200,0.25)" />
                      <path d="M24 14v12l6 6" stroke="white" strokeWidth="3.5" strokeLinecap="round" fill="none"/>
                    </svg>
                  </div>
                  <span style={{ fontWeight: 700, fontSize: 15, color: '#12212E' }}>
                    {t('luggage.result.aiSuggestion')}
                  </span>
                </div>
                <p style={{
                  fontSize: 14,
                  color: '#12212E',
                  lineHeight: 1.6,
                  whiteSpace: 'pre-wrap',
                }}>
                  {currentPhoto.arrangementSuggestion}
                </p>
              </div>

              <button
                type="button"
                onClick={onClose}
                style={{
                  width: '100%',
                  height: 54,
                  borderRadius: 16,
                  background: '#12212E',
                  color: 'white',
                  border: 'none',
                  fontWeight: 700,
                  fontSize: 16,
                  cursor: 'pointer',
                }}
              >
                {t('luggage.result.done')}
              </button>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
