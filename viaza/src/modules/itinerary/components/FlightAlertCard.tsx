/**
 * FlightAlertCard — subscribe/unsubscribe flight status alerts for a flight event.
 * Used inline inside ItineraryPage flight event cards.
 */

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  subscribeFlightAlert,
  unsubscribeFlightAlert,
  getMyFlightWatches,
  formatFlightStatus,
  getFlightStatusColor,
  type FlightWatch,
  type FlightSnapshot,
} from '../../../services/flightAlertsService';

interface FlightAlertCardProps {
  flightNumber: string;
  flightDate: string;  // YYYY-MM-DD
  tripId?: string;
}

export function FlightAlertCard({ flightNumber, flightDate, tripId }: FlightAlertCardProps) {
  const [watch, setWatch] = useState<FlightWatch | null>(null);
  const [loading, setLoading] = useState(false);
  const [checking, setChecking] = useState(true);
  const [error, setError] = useState('');

  // Check if already watching
  useEffect(() => {
    if (!flightNumber || !flightDate) { setChecking(false); return; }
    setChecking(true);
    getMyFlightWatches(tripId)
      .then((watches) => {
        const existing = watches.find(
          (w) => w.flightNumber === flightNumber.toUpperCase().replace(/\s/g, '') &&
                 w.flightDate === flightDate
        );
        setWatch(existing ?? null);
      })
      .catch(() => {/* ignore */})
      .finally(() => setChecking(false));
  }, [flightNumber, flightDate, tripId]);

  async function handleSubscribe() {
    setLoading(true);
    setError('');
    try {
      const result = await subscribeFlightAlert({ flightNumber, flightDate, tripId });
      // Refresh watch
      const watches = await getMyFlightWatches(tripId);
      const updated = watches.find((w) => w.id === result.watchId);
      setWatch(updated ?? null);
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setLoading(false);
    }
  }

  async function handleUnsubscribe() {
    if (!watch) return;
    setLoading(true);
    setError('');
    try {
      await unsubscribeFlightAlert(watch.id);
      setWatch(null);
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setLoading(false);
    }
  }

  if (checking) return null;

  const snapshot = watch?.lastSnapshot as FlightSnapshot | undefined;
  const statusColor = snapshot ? getFlightStatusColor(snapshot) : '#12212E';
  const statusLabel = snapshot ? formatFlightStatus(snapshot) : null;

  return (
    <motion.div
      initial={{ opacity: 0, y: 6 }}
      animate={{ opacity: 1, y: 0 }}
      className="rounded-2xl px-4 py-3 mt-2"
      style={{ background: watch ? 'rgba(48,112,130,0.08)' : 'rgba(18,33,46,0.04)' }}
    >
      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-2 min-w-0">
          {/* Bell icon */}
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" style={{ flexShrink: 0, color: watch ? '#307082' : 'rgba(18,33,46,0.40)' }}>
            <path d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"
              stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>

          <div className="min-w-0">
            <div style={{ fontSize: 12, fontWeight: 700, color: '#12212E' }}>
              {watch ? 'Alertas activadas' : 'Alertas de vuelo'}
            </div>
            {watch && statusLabel && (
              <div style={{ fontSize: 11, color: statusColor, fontWeight: 600, marginTop: 1 }}>
                {statusLabel}
                {snapshot?.dep_delay_min != null && snapshot.dep_delay_min > 0 && (
                  <span style={{ marginLeft: 4, color: '#EA9940' }}>· {snapshot.dep_delay_min} min retraso</span>
                )}
                {snapshot?.dep_gate && (
                  <span style={{ marginLeft: 4, color: 'rgba(18,33,46,0.50)' }}>· Puerta {snapshot.dep_gate}</span>
                )}
              </div>
            )}
            {!watch && (
              <div style={{ fontSize: 11, color: 'rgba(18,33,46,0.45)', marginTop: 1 }}>
                Recibe notificaciones de cambios
              </div>
            )}
          </div>
        </div>

        <motion.button
          whileTap={{ scale: 0.95 }}
          type="button"
          onClick={watch ? handleUnsubscribe : handleSubscribe}
          disabled={loading}
          className="rounded-full px-3 py-1.5 text-xs font-bold flex-shrink-0"
          style={{
            background: watch ? 'rgba(18,33,46,0.08)' : '#307082',
            color: watch ? '#12212E' : 'white',
            border: 'none',
            cursor: loading ? 'not-allowed' : 'pointer',
            fontFamily: 'Questrial, sans-serif',
            opacity: loading ? 0.6 : 1,
          }}
        >
          {loading ? '…' : watch ? 'Desactivar' : 'Activar'}
        </motion.button>
      </div>

      {error && (
        <div style={{ fontSize: 11, color: '#EA9940', marginTop: 4 }}>{error}</div>
      )}
    </motion.div>
  );
}
