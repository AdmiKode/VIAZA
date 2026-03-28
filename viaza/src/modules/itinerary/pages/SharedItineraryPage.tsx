/**
 * SharedItineraryPage — public read-only view of a shared itinerary.
 * Route: /itinerary/shared/:token (no auth required)
 */

import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { fetchSharedItinerary, type SharedItineraryData, type SharedItineraryEvent } from '../../../services/itinerarySharingService';

const TYPE_LABELS: Record<string, string> = {
  flight: 'Vuelo', hotel: 'Hotel', activity: 'Actividad',
  place: 'Lugar', transport: 'Transporte', meal: 'Comida', free: 'Libre',
};

const TYPE_COLORS: Record<string, string> = {
  flight: '#12212E', hotel: '#307082', activity: '#EA9940',
  place: '#307082', transport: '#12212E', meal: '#EA9940', free: '#6CA3A2',
};

const TYPE_BG: Record<string, string> = {
  flight: 'rgba(18,33,46,0.08)', hotel: 'rgba(48,112,130,0.10)',
  activity: 'rgba(234,153,64,0.10)', place: 'rgba(48,112,130,0.10)',
  transport: 'rgba(18,33,46,0.08)', meal: 'rgba(234,153,64,0.10)',
  free: 'rgba(108,163,162,0.10)',
};

function buildDays(trip: SharedItineraryData['trip']): { index: number; label: string; date: string }[] {
  const days: { index: number; label: string; date: string }[] = [];
  const start = trip.startDate ? new Date(trip.startDate + 'T00:00:00') : null;
  for (let i = 0; i < trip.durationDays; i++) {
    let dateStr = '';
    let label = `Día ${i + 1}`;
    if (start) {
      const d = new Date(start);
      d.setDate(d.getDate() + i);
      dateStr = d.toISOString().slice(0, 10);
      label = d.toLocaleDateString('es', { weekday: 'short', day: 'numeric', month: 'short' });
    }
    days.push({ index: i, label, date: dateStr });
  }
  return days;
}

function groupByDay(events: SharedItineraryEvent[]): Map<number, SharedItineraryEvent[]> {
  const map = new Map<number, SharedItineraryEvent[]>();
  for (const ev of events) {
    if (!map.has(ev.dayIndex)) map.set(ev.dayIndex, []);
    map.get(ev.dayIndex)!.push(ev);
  }
  for (const [, arr] of map) arr.sort((a, b) => a.order - b.order);
  return map;
}

export function SharedItineraryPage() {
  const { token } = useParams<{ token: string }>();
  const [data, setData] = useState<SharedItineraryData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [expandedDay, setExpandedDay] = useState<number>(0);

  useEffect(() => {
    if (!token) { setError('Token inválido'); setLoading(false); return; }
    fetchSharedItinerary(token)
      .then(setData)
      .catch((e) => setError((e as Error).message))
      .finally(() => setLoading(false));
  }, [token]);

  if (loading) {
    return (
      <div className="flex min-h-dvh flex-col items-center justify-center" style={{ background: '#ECE7DC' }}>
        <svg className="animate-spin mb-4" width="32" height="32" viewBox="0 0 48 48" fill="none">
          <circle cx="24" cy="24" r="18" stroke="rgba(18,33,46,0.15)" strokeWidth="4"/>
          <path d="M24 6a18 18 0 0 1 18 18" stroke="#307082" strokeWidth="4" strokeLinecap="round"/>
        </svg>
        <div style={{ color: 'rgba(18,33,46,0.50)', fontSize: 14 }}>Cargando itinerario…</div>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="flex min-h-dvh flex-col items-center justify-center px-8" style={{ background: '#ECE7DC' }}>
        <div className="text-center">
          <div style={{ fontSize: 48, marginBottom: 16 }}>🔗</div>
          <div style={{ color: '#12212E', fontSize: 20, fontWeight: 800, marginBottom: 8 }}>Enlace no disponible</div>
          <div style={{ color: 'rgba(18,33,46,0.55)', fontSize: 14, lineHeight: 1.5 }}>
            {error || 'Este itinerario no existe o el enlace ha expirado.'}
          </div>
        </div>
      </div>
    );
  }

  const { trip, events } = data;
  const days = buildDays(trip);
  const eventsByDay = groupByDay(events);

  return (
    <div className="min-h-dvh pb-12" style={{ background: '#ECE7DC', fontFamily: 'Questrial, sans-serif' }}>
      {/* Header */}
      <div
        className="relative overflow-hidden px-6 pt-14 pb-10"
        style={{
          background: 'linear-gradient(160deg, #12212E 0%, #307082 70%, #6CA3A2 100%)',
          borderBottomLeftRadius: 32,
          borderBottomRightRadius: 32,
        }}
      >
        <div className="pointer-events-none absolute -right-12 -top-12 h-48 w-48 rounded-full" style={{ background: 'rgba(255,255,255,0.05)' }}/>
        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}>
          <div style={{ color: 'rgba(255,255,255,0.60)', fontSize: 11, fontWeight: 700, letterSpacing: 1.5, textTransform: 'uppercase', marginBottom: 4 }}>
            Itinerario compartido
          </div>
          <div style={{ color: 'white', fontSize: 26, fontWeight: 800, lineHeight: 1.2 }}>
            {trip.title || trip.destination}
          </div>
          <div style={{ color: 'rgba(255,255,255,0.65)', fontSize: 14, marginTop: 4 }}>
            {trip.destination}
          </div>

          {/* Trip meta */}
          <div className="mt-4 flex flex-wrap gap-2">
            {trip.startDate && (
              <span className="rounded-full px-3 py-1 text-xs font-semibold" style={{ background: 'rgba(255,255,255,0.15)', color: 'white' }}>
                {new Date(trip.startDate + 'T00:00:00').toLocaleDateString('es', { day: 'numeric', month: 'short', year: 'numeric' })}
              </span>
            )}
            <span className="rounded-full px-3 py-1 text-xs font-semibold" style={{ background: 'rgba(255,255,255,0.15)', color: 'white' }}>
              {trip.durationDays} {trip.durationDays === 1 ? 'día' : 'días'}
            </span>
            <span className="rounded-full px-3 py-1 text-xs font-semibold" style={{ background: 'rgba(255,255,255,0.15)', color: 'white' }}>
              {events.length} {events.length === 1 ? 'actividad' : 'actividades'}
            </span>
          </div>
        </motion.div>
      </div>

      {/* Powered by banner */}
      <div className="mx-5 mt-4 rounded-2xl px-4 py-2.5 flex items-center justify-between" style={{ background: 'rgba(18,33,46,0.06)' }}>
        <div style={{ color: 'rgba(18,33,46,0.45)', fontSize: 11 }}>Vista de solo lectura · Creado con</div>
        <div style={{ color: '#307082', fontSize: 12, fontWeight: 800, letterSpacing: 0.5 }}>VIAZA</div>
      </div>

      {/* Days */}
      <div className="px-5 mt-5 space-y-3">
        {days.map((day) => {
          const dayEvents = eventsByDay.get(day.index) ?? [];
          const isExpanded = expandedDay === day.index;

          return (
            <motion.div key={day.index} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: day.index * 0.04 }}>
              <button
                type="button"
                onClick={() => setExpandedDay(isExpanded ? -1 : day.index)}
                className="w-full flex items-center justify-between rounded-2xl px-4 py-3.5"
                style={{
                  background: isExpanded ? '#12212E' : 'white',
                  border: 'none',
                  cursor: 'pointer',
                  fontFamily: 'Questrial, sans-serif',
                  boxShadow: '0 2px 10px rgba(18,33,46,0.08)',
                }}
              >
                <div className="flex items-center gap-3">
                  <div
                    className="flex items-center justify-center rounded-full text-xs font-bold"
                    style={{
                      width: 28,
                      height: 28,
                      background: isExpanded ? 'rgba(255,255,255,0.15)' : 'rgba(18,33,46,0.07)',
                      color: isExpanded ? 'white' : '#12212E',
                    }}
                  >
                    {day.index + 1}
                  </div>
                  <div>
                    <div style={{ fontSize: 14, fontWeight: 700, color: isExpanded ? 'white' : '#12212E', textTransform: 'capitalize' }}>
                      {day.label}
                    </div>
                    <div style={{ fontSize: 11, color: isExpanded ? 'rgba(255,255,255,0.55)' : 'rgba(18,33,46,0.45)', marginTop: 1 }}>
                      {dayEvents.length} {dayEvents.length === 1 ? 'actividad' : 'actividades'}
                    </div>
                  </div>
                </div>
                <svg
                  width="16"
                  height="16"
                  viewBox="0 0 48 48"
                  fill="none"
                  style={{ transform: isExpanded ? 'rotate(180deg)' : 'rotate(0deg)', transition: 'transform 0.2s' }}
                >
                  <path d="M10 18l14 14 14-14" stroke={isExpanded ? 'rgba(255,255,255,0.6)' : 'rgba(18,33,46,0.35)'} strokeWidth="3.5" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </button>

              <AnimatePresence>
                {isExpanded && dayEvents.length > 0 && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.22 }}
                    className="overflow-hidden"
                  >
                    <div className="ml-3 mt-2 space-y-2.5 border-l-2 pl-4" style={{ borderColor: 'rgba(18,33,46,0.12)' }}>
                      {dayEvents.map((ev) => {
                        const color = TYPE_COLORS[ev.type] ?? '#12212E';
                        const bg = TYPE_BG[ev.type] ?? 'rgba(18,33,46,0.06)';
                        const label = TYPE_LABELS[ev.type] ?? ev.type;

                        return (
                          <div key={ev.id} className="relative">
                            <div className="absolute -left-4 top-4 rounded-full" style={{ width: 8, height: 8, background: color, boxShadow: `0 0 0 3px white` }}/>
                            <div className="rounded-2xl px-4 py-3.5" style={{ background: 'white', boxShadow: '0 2px 10px rgba(18,33,46,0.07)' }}>
                              <div className="flex items-start gap-3">
                                <div className="flex items-center justify-center rounded-xl flex-shrink-0" style={{ width: 34, height: 34, background: bg }}>
                                  <div style={{ width: 8, height: 8, borderRadius: '50%', background: color }}/>
                                </div>
                                <div className="flex-1 min-w-0">
                                  <div style={{ color: '#12212E', fontSize: 14, fontWeight: 700 }}>{ev.title}</div>
                                  <div className="mt-0.5 flex items-center flex-wrap gap-2">
                                    <span style={{ color, fontSize: 11, fontWeight: 600 }}>{label}</span>
                                    {ev.startTime && (
                                      <span style={{ color: 'rgba(18,33,46,0.40)', fontSize: 11 }}>
                                        {ev.startTime}{ev.endTime ? ` – ${ev.endTime}` : ''}
                                      </span>
                                    )}
                                    {ev.confirmationCode && (
                                      <span className="rounded-full px-2 py-0.5" style={{ background: 'rgba(48,112,130,0.10)', color: '#307082', fontSize: 10, fontWeight: 600 }}>
                                        {ev.confirmationCode}
                                      </span>
                                    )}
                                  </div>
                                  {ev.description && (
                                    <div style={{ color: 'rgba(18,33,46,0.50)', fontSize: 12, marginTop: 3, lineHeight: 1.4 }}>{ev.description}</div>
                                  )}
                                </div>
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </motion.div>
                )}

                {isExpanded && dayEvents.length === 0 && (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="ml-3 mt-2 rounded-2xl px-4 py-4 text-center"
                    style={{ background: 'white', boxShadow: '0 2px 10px rgba(18,33,46,0.07)' }}
                  >
                    <div style={{ color: 'rgba(18,33,46,0.40)', fontSize: 13 }}>Sin actividades este día</div>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}
