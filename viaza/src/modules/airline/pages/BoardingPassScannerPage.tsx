/**
 * BoardingPassScannerPage
 * Escanea un pase de abordar con la cámara del dispositivo y extrae
 * todos los datos usando OpenAI Vision (gpt-4o).
 * Sin mocks — cámara real + IA real.
 */

import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { motion, AnimatePresence } from 'framer-motion';
import { takePhoto } from '../../../services/cameraService';
import { scanBoardingPass, type BoardingPassData } from '../../../services/boardingPassScanner';
import { impactMedium, notificationSuccess, notificationError } from '../../../services/hapticsService';
import { useAppStore } from '../../../app/store/useAppStore';

type ScanStatus = 'idle' | 'capturing' | 'analyzing' | 'done' | 'error';

export function BoardingPassScannerPage() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const updateTrip = useAppStore((s) => s.updateTrip);
  const currentTripId = useAppStore((s) => s.currentTripId);

  const [status, setStatus] = useState<ScanStatus>('idle');
  const [photoDataUrl, setPhotoDataUrl] = useState<string | null>(null);
  const [result, setResult] = useState<BoardingPassData | null>(null);
  const [errorMsg, setErrorMsg] = useState('');

  const handleScan = async () => {
    setStatus('capturing');
    setErrorMsg('');
    setResult(null);
    setPhotoDataUrl(null);

    try {
      await impactMedium();
      const photo = await takePhoto();
      setPhotoDataUrl(photo.dataUrl);
      setStatus('analyzing');

      const base64 = photo.dataUrl.split(',')[1];
      const mime = photo.dataUrl.startsWith('data:image/png') ? 'image/png' : 'image/jpeg';

      const data = await scanBoardingPass(base64, mime);
      setResult(data);
      await notificationSuccess();
      setStatus('done');
    } catch (err) {
      await notificationError();
      setErrorMsg(err instanceof Error ? err.message : t('scanner.error.generic'));
      setStatus('error');
    }
  };

  const handleApplyToTrip = () => {
    if (!result || !currentTripId) return;
    const updates: Record<string, string> = {};
    if (result.flightNumber) updates.flightNumber = result.flightNumber;
    if (result.airline) updates.airline = result.airline;
    if (result.destinationIata) updates.airportCode = result.destinationIata;
    if (result.departureTime) updates.flightDepartureTime = result.departureTime;
    updateTrip(currentTripId, updates);
    navigate(-1);
  };

  const InfoRow = ({ label, value }: { label: string; value?: string }) => {
    if (!value) return null;
    return (
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', padding: '10px 0', borderBottom: '1px solid rgba(18,33,46,0.06)' }}>
        <span style={{ fontSize: 12, fontWeight: 700, color: 'rgba(18,33,46,0.45)', textTransform: 'uppercase', letterSpacing: 0.6 }}>{label}</span>
        <span style={{ fontSize: 14, fontWeight: 700, color: '#12212E', textAlign: 'right', maxWidth: '60%' }}>{value}</span>
      </div>
    );
  };

  return (
    <div style={{ minHeight: '100vh', background: '#ECE7DC', fontFamily: 'Questrial, sans-serif', paddingBottom: 100 }}>
      {/* Header */}
      <div style={{ padding: '56px 20px 24px', background: 'linear-gradient(160deg, #12212E 0%, #1a3a4a 100%)' }}>
        <button type="button" onClick={() => navigate(-1)} style={{ width: 36, height: 36, borderRadius: 10, background: 'rgba(255,255,255,0.10)', border: 'none', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', marginBottom: 16 }}>
          <svg width="18" height="18" viewBox="0 0 48 48" fill="none"><path d="M30 12L18 24l12 12" stroke="white" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round" /></svg>
        </button>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <div style={{ width: 48, height: 48, borderRadius: 14, background: 'rgba(234,153,64,0.20)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <svg width="26" height="26" viewBox="0 0 48 48" fill="none">
              <rect x="4" y="12" width="40" height="30" rx="6" fill="#EA9940" />
              <rect x="4" y="12" width="40" height="14" rx="6" fill="rgba(180,192,200,0.50)" />
              <circle cx="24" cy="30" r="7" fill="white" opacity="0.25" />
              <circle cx="24" cy="30" r="4" fill="white" opacity="0.60" />
              <rect x="16" y="6" width="16" height="8" rx="4" fill="#EA9940" />
            </svg>
          </div>
          <div>
            <h1 style={{ color: 'white', fontSize: 22, fontWeight: 700 }}>{t('scanner.title')}</h1>
            <p style={{ color: 'rgba(255,255,255,0.55)', fontSize: 13 }}>{t('scanner.subtitle')}</p>
          </div>
        </div>
      </div>

      <div style={{ padding: '20px 16px', display: 'flex', flexDirection: 'column', gap: 14 }}>

        {/* Foto capturada */}
        <AnimatePresence>
          {photoDataUrl && (
            <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} style={{ borderRadius: 20, overflow: 'hidden', boxShadow: '0 8px 32px rgba(18,33,46,0.15)', position: 'relative' }}>
              <img src={photoDataUrl} alt="Boarding pass" style={{ width: '100%', display: 'block', maxHeight: 280, objectFit: 'cover' }} />
              {status === 'analyzing' && (
                <div style={{ position: 'absolute', inset: 0, background: 'rgba(18,33,46,0.65)', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 12 }}>
                  <motion.div animate={{ rotate: 360 }} transition={{ duration: 1.2, repeat: Infinity, ease: 'linear' }}>
                    <svg width="40" height="40" viewBox="0 0 48 48" fill="none"><circle cx="24" cy="24" r="18" stroke="#EA9940" strokeWidth="4" strokeDasharray="40 70" strokeLinecap="round" /></svg>
                  </motion.div>
                  <p style={{ color: 'white', fontSize: 14, fontWeight: 700 }}>{t('scanner.analyzing')}</p>
                </div>
              )}
            </motion.div>
          )}
        </AnimatePresence>

        {/* Botón principal */}
        {(status === 'idle' || status === 'error') && (
          <motion.button type="button" whileTap={{ scale: 0.97 }} onClick={handleScan} style={{ width: '100%', height: 64, borderRadius: 20, background: 'linear-gradient(135deg, #EA9940, #c07a2e)', color: 'white', border: 'none', fontSize: 17, fontWeight: 700, fontFamily: 'Questrial, sans-serif', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 12, boxShadow: '0 8px 24px rgba(234,153,64,0.40)' }}>
            <svg width="24" height="24" viewBox="0 0 48 48" fill="none">
              <rect x="4" y="12" width="40" height="30" rx="6" fill="white" opacity="0.25" />
              <circle cx="24" cy="30" r="7" fill="white" opacity="0.60" />
              <circle cx="24" cy="30" r="4" fill="white" />
              <rect x="16" y="6" width="16" height="8" rx="4" fill="white" opacity="0.80" />
            </svg>
            {t('scanner.cta')}
          </motion.button>
        )}

        {/* Error */}
        <AnimatePresence>
          {status === 'error' && errorMsg && (
            <motion.div initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} style={{ background: 'rgba(192,57,43,0.08)', border: '1px solid rgba(192,57,43,0.20)', borderRadius: 14, padding: '14px 16px', fontSize: 13, color: '#c0392b', fontWeight: 600 }}>
              {errorMsg}
            </motion.div>
          )}
        </AnimatePresence>

        {/* Resultado */}
        <AnimatePresence>
          {status === 'done' && result && (
            <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              {/* Tarjeta de vuelo */}
              <div style={{ background: 'linear-gradient(135deg, #12212E, #1e3a4a)', borderRadius: 24, padding: '20px', boxShadow: '0 8px 32px rgba(18,33,46,0.20)' }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 16, marginBottom: 16 }}>
                  <div style={{ textAlign: 'center' }}>
                    <div style={{ fontSize: 32, fontWeight: 700, color: 'white', lineHeight: 1 }}>{result.originIata ?? '---'}</div>
                    <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.50)', marginTop: 3 }}>{result.originCity ?? ''}</div>
                  </div>
                  <div style={{ flex: 1, display: 'flex', alignItems: 'center', gap: 4 }}>
                    <div style={{ flex: 1, height: 1, background: 'rgba(255,255,255,0.20)' }} />
                    <svg width="24" height="24" viewBox="0 0 48 48" fill="none"><path d="M6 32l8-8 4 4 12-16 4 4-16 20-4-4-8 8z" fill="#EA9940" /><path d="M6 32l8-8 4 4" fill="rgba(180,192,200,0.50)" /></svg>
                    <div style={{ flex: 1, height: 1, background: 'rgba(255,255,255,0.20)' }} />
                  </div>
                  <div style={{ textAlign: 'center' }}>
                    <div style={{ fontSize: 32, fontWeight: 700, color: 'white', lineHeight: 1 }}>{result.destinationIata ?? '---'}</div>
                    <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.50)', marginTop: 3 }}>{result.destinationCity ?? ''}</div>
                  </div>
                </div>
                <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', justifyContent: 'center' }}>
                  {result.flightNumber && <div style={{ padding: '6px 14px', borderRadius: 99, background: 'rgba(234,153,64,0.20)', fontSize: 13, fontWeight: 700, color: '#EA9940' }}>{result.flightNumber}</div>}
                  {result.departureTime && <div style={{ padding: '6px 14px', borderRadius: 99, background: 'rgba(255,255,255,0.10)', fontSize: 13, fontWeight: 700, color: 'white' }}>{result.departureTime}</div>}
                  {result.gate && <div style={{ padding: '6px 14px', borderRadius: 99, background: 'rgba(48,112,130,0.30)', fontSize: 13, fontWeight: 700, color: '#6CA3A2' }}>Gate {result.gate}</div>}
                  {result.seat && <div style={{ padding: '6px 14px', borderRadius: 99, background: 'rgba(255,255,255,0.08)', fontSize: 13, fontWeight: 700, color: 'rgba(255,255,255,0.70)' }}>{t('scanner.seat')} {result.seat}</div>}
                </div>
              </div>

              {/* Detalles */}
              <div style={{ background: 'white', borderRadius: 20, padding: '16px 20px', boxShadow: '0 2px 12px rgba(18,33,46,0.06)' }}>
                <p style={{ fontSize: 12, fontWeight: 700, color: 'rgba(18,33,46,0.40)', textTransform: 'uppercase', letterSpacing: 0.8, marginBottom: 4 }}>{t('scanner.details')}</p>
                <InfoRow label={t('scanner.passenger')} value={result.passengerName} />
                <InfoRow label={t('scanner.airline')} value={result.airline} />
                <InfoRow label={t('scanner.date')} value={result.departureDate} />
                <InfoRow label={t('scanner.boarding')} value={result.boardingTime} />
                <InfoRow label={t('scanner.terminal')} value={result.terminal} />
                <InfoRow label={t('scanner.bookingRef')} value={result.bookingRef} />
              </div>

              {/* Acciones */}
              <div style={{ display: 'flex', gap: 10 }}>
                <button type="button" onClick={handleScan} style={{ flex: 1, height: 48, borderRadius: 14, background: 'rgba(18,33,46,0.08)', border: 'none', fontSize: 14, fontWeight: 700, color: 'rgba(18,33,46,0.55)', cursor: 'pointer', fontFamily: 'Questrial, sans-serif' }}>
                  {t('scanner.rescan')}
                </button>
                {currentTripId && (
                  <button type="button" onClick={handleApplyToTrip} style={{ flex: 2, height: 48, borderRadius: 14, background: '#12212E', border: 'none', fontSize: 14, fontWeight: 700, color: 'white', cursor: 'pointer', fontFamily: 'Questrial, sans-serif' }}>
                    {t('scanner.applyToTrip')}
                  </button>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Instrucciones */}
        {status === 'idle' && (
          <div style={{ background: 'white', borderRadius: 20, padding: '20px', boxShadow: '0 2px 12px rgba(18,33,46,0.06)' }}>
            <p style={{ fontSize: 13, fontWeight: 700, color: 'rgba(18,33,46,0.50)', textTransform: 'uppercase', letterSpacing: 0.8, marginBottom: 14 }}>{t('scanner.howTo')}</p>
            {[t('scanner.step1'), t('scanner.step2'), t('scanner.step3')].map((step, i) => (
              <div key={i} style={{ display: 'flex', alignItems: 'flex-start', gap: 12, marginBottom: 12 }}>
                <div style={{ width: 32, height: 32, borderRadius: 10, background: 'rgba(234,153,64,0.10)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 14, fontWeight: 700, color: '#EA9940', flexShrink: 0 }}>{i + 1}</div>
                <p style={{ fontSize: 13, color: 'rgba(18,33,46,0.65)', lineHeight: 1.5, paddingTop: 6 }}>{step}</p>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
