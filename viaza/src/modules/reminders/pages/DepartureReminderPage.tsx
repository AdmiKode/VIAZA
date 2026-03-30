import { useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { motion } from 'framer-motion';
import { calculateRecommendedDeparture } from '../utils/departureCalculator';
import { requestNotificationPermissions, scheduleNotification as scheduleLocalNotification } from '../../../services/notificationsService';
import { notificationSuccess } from '../../../services/hapticsService';
import { supabase } from '../../../services/supabaseClient';
import { useAppStore } from '../../../app/store/useAppStore';

function toLocalInputValue(date: Date) {
  const pad = (n: number) => String(n).padStart(2, '0');
  const y = date.getFullYear();
  const m = pad(date.getMonth() + 1);
  const d = pad(date.getDate());
  const hh = pad(date.getHours());
  const mm = pad(date.getMinutes());
  return `${y}-${m}-${d}T${hh}:${mm}`;
}

type NotifStatus = 'idle' | 'loading' | 'success' | 'error';

export function DepartureReminderPage() {
  const { t } = useTranslation();
  const currentTripId = useAppStore((s) => s.currentTripId);
  const [flightTime, setFlightTime] = useState(() => toLocalInputValue(new Date(Date.now() + 24 * 60 * 60_000)));
  const [airport, setAirport] = useState('');
  const [status, setStatus] = useState<NotifStatus>('idle');
  const [errorMsg, setErrorMsg] = useState('');

  const calc = useMemo(
    () => calculateRecommendedDeparture({ flightDepartureIso: flightTime, bufferMinutes: 180 }),
    [flightTime]
  );

  const formatTime = (date: Date) =>
    date.toLocaleTimeString('es-MX', { hour: '2-digit', minute: '2-digit', hour12: true });

  const formatFull = (date: Date) =>
    date.toLocaleString('es-MX', {
      weekday: 'long', day: 'numeric', month: 'long',
      hour: '2-digit', minute: '2-digit', hour12: true,
    });

  const handleScheduleNotification = async () => {
    if (!calc?.recommended) return;
    setStatus('loading');
    setErrorMsg('');
    try {
      const granted = await requestNotificationPermissions();
      if (!granted) {
        setStatus('error');
        setErrorMsg(t('departure.permissionDenied'));
        return;
      }
      const notifTime = new Date(calc.recommended.getTime() - 30 * 60 * 1000);
      const notifId = Math.floor(Math.random() * 100000);
      await scheduleLocalNotification({
        id: notifId,
        title: t('departure.notifTitle'),
        body: `${t('departure.notifBody')} ${formatTime(calc.recommended)}${airport ? ` · ${airport}` : ''}`,
        at: notifTime.toISOString(),
      });
      // Persistir en Supabase para sincronización multi-dispositivo y auditoría
      if (currentTripId) {
        const { data: { user } } = await supabase.auth.getUser();
        if (user) {
          await supabase.from('departure_reminders').insert({
            trip_id: currentTripId,
            user_id: user.id,
            remind_at: notifTime.toISOString(),
            message: `${t('departure.notifBody')} ${formatTime(calc.recommended)}${airport ? ` · ${airport}` : ''}`,
            is_active: true,
            capacitor_id: notifId,
          });
        }
      }
      await notificationSuccess();
      setStatus('success');
    } catch (err) {
      setStatus('error');
      setErrorMsg(err instanceof Error ? err.message : t('departure.notifError'));
    }
  };

  return (
    <div style={{
      minHeight: '100vh',
      background: '#ECE7DC',
      fontFamily: 'Questrial, sans-serif',
      paddingBottom: 100,
    }}>
      {/* Header */}
      <div style={{
        padding: '56px 20px 24px',
        background: 'linear-gradient(160deg, #12212E 0%, #307082 100%)',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <div style={{
            width: 44, height: 44, borderRadius: 14,
            background: 'rgba(234,153,64,0.20)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}>
            <svg width="24" height="24" viewBox="0 0 48 48" fill="none">
              <circle cx="24" cy="24" r="18" fill="#EA9940" />
              <circle cx="24" cy="24" r="18" fill="rgba(180,192,200,0.30)" />
              <path d="M24 14v10l6 4" stroke="white" strokeWidth="3.5" strokeLinecap="round" fill="none"/>
            </svg>
          </div>
          <div>
            <h1 style={{ color: 'white', fontSize: 22, fontWeight: 700 }}>{t('departure.title')}</h1>
            <p style={{ color: 'rgba(255,255,255,0.55)', fontSize: 13 }}>{t('departure.subtitle')}</p>
          </div>
        </div>
      </div>

      <div style={{ padding: '20px 16px', display: 'flex', flexDirection: 'column', gap: 14 }}>
        {/* Datos del vuelo */}
        <div style={{ background: 'white', borderRadius: 20, padding: '20px', boxShadow: '0 2px 12px rgba(18,33,46,0.06)' }}>
          <p style={{ fontSize: 13, fontWeight: 700, color: 'rgba(18,33,46,0.50)', textTransform: 'uppercase', letterSpacing: 0.8, marginBottom: 14 }}>
            {t('departure.flightData')}
          </p>
          <div style={{ marginBottom: 14 }}>
            <label style={{ fontSize: 13, fontWeight: 700, color: '#12212E', display: 'block', marginBottom: 6 }}>
              {t('departure.flightTime')}
            </label>
            <div style={{
              background: '#ECE7DC', borderRadius: 14, padding: '0 14px', height: 48,
              display: 'flex', alignItems: 'center',
              boxShadow: 'inset 3px 3px 8px rgba(18,33,46,0.08), inset -2px -2px 6px rgba(255,255,255,0.70)',
            }}>
              <input
                type="datetime-local" value={flightTime}
                onChange={(e) => { setFlightTime(e.target.value); setStatus('idle'); }}
                style={{ flex: 1, background: 'transparent', border: 'none', outline: 'none', fontSize: 14, color: '#12212E', fontFamily: 'Questrial, sans-serif' }}
              />
            </div>
          </div>
          <div>
            <label style={{ fontSize: 13, fontWeight: 700, color: '#12212E', display: 'block', marginBottom: 6 }}>
              {t('departure.airport')}
            </label>
            <div style={{
              background: '#ECE7DC', borderRadius: 14, padding: '0 14px', height: 48,
              display: 'flex', alignItems: 'center',
              boxShadow: 'inset 3px 3px 8px rgba(18,33,46,0.08), inset -2px -2px 6px rgba(255,255,255,0.70)',
            }}>
              <input
                type="text" value={airport}
                onChange={(e) => setAirport(e.target.value)}
                placeholder={t('departure.airportPlaceholder')}
                style={{ flex: 1, background: 'transparent', border: 'none', outline: 'none', fontSize: 14, color: '#12212E', fontFamily: 'Questrial, sans-serif' }}
              />
            </div>
          </div>
        </div>

        {/* Resultado */}
        {calc?.recommended && (
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            style={{
              background: 'linear-gradient(135deg, #12212E, #1e3a4a)',
              borderRadius: 20, padding: '20px',
              boxShadow: '0 8px 24px rgba(18,33,46,0.20)',
            }}
          >
            <p style={{ fontSize: 12, color: 'rgba(255,255,255,0.50)', fontWeight: 700, textTransform: 'uppercase', letterSpacing: 0.8, marginBottom: 8 }}>
              {t('departure.recommended')}
            </p>
            <div style={{ fontSize: 42, fontWeight: 700, color: '#EA9940', lineHeight: 1 }}>
              {formatTime(calc.recommended)}
            </div>
            <p style={{ fontSize: 13, color: 'rgba(255,255,255,0.55)', marginTop: 6 }}>
              {formatFull(calc.recommended)}
            </p>
            <div style={{ marginTop: 16, padding: '12px 14px', background: 'rgba(255,255,255,0.06)', borderRadius: 12 }}>
              <p style={{ fontSize: 12, color: 'rgba(255,255,255,0.45)' }}>{t('departure.note')}</p>
            </div>
          </motion.div>
        )}

        {/* Botón notificación */}
        <motion.button
          type="button"
          whileTap={{ scale: 0.97 }}
          onClick={handleScheduleNotification}
          disabled={!calc?.recommended || status === 'loading' || status === 'success'}
          style={{
            width: '100%', height: 56, borderRadius: 18,
            background: status === 'success' ? '#307082' : !calc?.recommended || status === 'loading' ? 'rgba(18,33,46,0.15)' : '#EA9940',
            color: status === 'success' || (calc?.recommended && status !== 'loading') ? 'white' : 'rgba(18,33,46,0.35)',
            border: 'none', fontSize: 16, fontWeight: 700,
            fontFamily: 'Questrial, sans-serif',
            cursor: calc?.recommended && status !== 'loading' && status !== 'success' ? 'pointer' : 'default',
            display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10,
            boxShadow: calc?.recommended && status !== 'loading' && status !== 'success' ? '0 6px 20px rgba(234,153,64,0.35)' : 'none',
            transition: 'all 0.3s',
          }}
        >
          {status === 'loading' ? (
            <motion.div animate={{ rotate: 360 }} transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}>
              <svg width="20" height="20" viewBox="0 0 48 48" fill="none">
                <circle cx="24" cy="24" r="18" stroke="white" strokeWidth="4" strokeDasharray="56 56" strokeLinecap="round" />
              </svg>
            </motion.div>
          ) : status === 'success' ? (
            <>{t('departure.notifScheduled')}</>
          ) : (
            <>{t('departure.cta')}</>
          )}
        </motion.button>

        {status === 'error' && errorMsg && (
          <div style={{
            background: 'rgba(234,153,64,0.08)', border: '1px solid rgba(234,153,64,0.25)',
            borderRadius: 14, padding: '12px 16px',
            fontSize: 13, color: '#EA9940', fontWeight: 600,
          }}>
            {errorMsg}
          </div>
        )}
      </div>
    </div>
  );
}

