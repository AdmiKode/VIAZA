import { useMemo, useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useAppStore } from '../../../app/store/useAppStore';
import type { ItineraryEventType } from '../../../types/itinerary';
import { DayRoutePanel } from '../components/DayRoutePanel';
import { FlightAlertCard } from '../components/FlightAlertCard';
import { ShareItineraryButton } from '../components/ShareItineraryButton';

const EVENT_META: Record<ItineraryEventType, { color: string; bg: string; label: string; icon: JSX.Element }> = {
  flight:    { color: '#12212E', bg: 'rgba(18,33,46,0.08)', label: 'Vuelo',      icon: <svg width="18" height="18" viewBox="0 0 48 48" fill="none"><path d="M8 38L22 24l-4-8 6-6 4 8 8-4 2 2-14 10 6 12-4 2-4-8-4 4z" fill="#12212E"/></svg> },
  hotel:     { color: '#307082', bg: 'rgba(48,112,130,0.10)', label: 'Hotel',    icon: <svg width="18" height="18" viewBox="0 0 48 48" fill="none"><rect x="6" y="10" width="36" height="28" rx="5" fill="#307082" fillOpacity="0.9"/><rect x="6" y="10" width="36" height="14" rx="5" fill="rgba(255,255,255,0.20)"/><rect x="16" y="28" width="8" height="10" rx="3" fill="white" fillOpacity="0.5"/><rect x="26" y="28" width="8" height="10" rx="3" fill="white" fillOpacity="0.5"/></svg> },
  activity:  { color: '#EA9940', bg: 'rgba(234,153,64,0.10)', label: 'Actividad',icon: <svg width="18" height="18" viewBox="0 0 48 48" fill="none"><path d="M8 38L22 24l-4-8 6-6 4 8 8-4 2 2-14 10 6 12-4 2-4-8-4 4z" fill="#EA9940"/><circle cx="38" cy="10" r="6" fill="#EA9940" fillOpacity="0.5"/></svg> },
  place:     { color: '#307082', bg: 'rgba(48,112,130,0.10)', label: 'Lugar',    icon: <svg width="18" height="18" viewBox="0 0 48 48" fill="none"><path d="M24 4C16.27 4 10 10.27 10 18c0 10.5 14 26 14 26s14-15.5 14-26c0-7.73-6.27-14-14-14z" fill="#307082"/><circle cx="24" cy="18" r="5" fill="white" fillOpacity="0.7"/></svg> },
  transport: { color: '#12212E', bg: 'rgba(18,33,46,0.08)', label: 'Transporte', icon: <svg width="18" height="18" viewBox="0 0 48 48" fill="none"><rect x="4" y="20" width="40" height="14" rx="6" fill="#12212E" fillOpacity="0.85"/><circle cx="13" cy="36" r="5" fill="#12212E"/><circle cx="35" cy="36" r="5" fill="#12212E"/></svg> },
  meal:      { color: '#EA9940', bg: 'rgba(234,153,64,0.10)', label: 'Comida',   icon: <svg width="18" height="18" viewBox="0 0 48 48" fill="none"><path d="M16 4v18c0 4 4 6 8 6s8-2 8-6V4" stroke="#EA9940" strokeWidth="3" strokeLinecap="round" fill="none"/><line x1="24" y1="28" x2="24" y2="44" stroke="#EA9940" strokeWidth="3" strokeLinecap="round"/></svg> },
  free:      { color: '#6CA3A2', bg: 'rgba(108,163,162,0.10)', label: 'Libre',   icon: <svg width="18" height="18" viewBox="0 0 48 48" fill="none"><circle cx="24" cy="24" r="18" fill="#6CA3A2" fillOpacity="0.7"/><path d="M24 14v10l7 7" stroke="white" strokeWidth="3" strokeLinecap="round" fill="none"/></svg> },
};

function buildDays(trip: { startDate?: string; durationDays: number }) {
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

export function ItineraryPage() {
  const navigate = useNavigate();
  const currentTripId = useAppStore((s) => s.currentTripId);
  const trips = useAppStore((s) => s.trips);
  const itineraryEvents = useAppStore((s) => s.itineraryEvents);
  const savedPlaces = useAppStore((s) => s.savedPlaces);
  const deleteItineraryEvent = useAppStore((s) => s.deleteItineraryEvent);

  const currentTrip = trips.find((t) => t.id === currentTripId);
  const [expandedDay, setExpandedDay] = useState<number>(0);
  const [routeDayIndex, setRouteDayIndex] = useState<number | null>(null);

  const days = useMemo(() => (currentTrip ? buildDays(currentTrip) : []), [currentTrip]);

  const eventsByDay = useMemo(() => {
    const map = new Map<number, typeof itineraryEvents>();
    for (const ev of itineraryEvents.filter((e) => e.tripId === currentTripId)) {
      if (!map.has(ev.dayIndex)) map.set(ev.dayIndex, []);
      map.get(ev.dayIndex)!.push(ev);
    }
    // ordenar por campo order
    for (const [, arr] of map) arr.sort((a, b) => a.order - b.order);
    return map;
  }, [itineraryEvents, currentTripId]);

  const placesCount = savedPlaces.filter((p) => p.tripId === currentTripId).length;
  const totalEvents = itineraryEvents.filter((e) => e.tripId === currentTripId).length;

  if (!currentTrip) {
    return (
      <div className="flex min-h-dvh flex-col items-center justify-center px-6" style={{ background: '#ECE7DC' }}>
        <div style={{ color: '#12212E', fontSize: 17, fontWeight: 700, textAlign: 'center' }}>No hay viaje activo</div>
      </div>
    );
  }

  return (
    <div className="min-h-dvh pb-32" style={{ background: '#ECE7DC', fontFamily: 'Questrial, sans-serif' }}>

      {/* ── Header ── */}
      <div className="relative overflow-hidden px-6 pt-14 pb-8" style={{ background: 'linear-gradient(160deg, #12212E 0%, #307082 70%, #6CA3A2 100%)', borderBottomLeftRadius: 32, borderBottomRightRadius: 32 }}>
        <div className="pointer-events-none absolute -right-12 -top-12 h-48 w-48 rounded-full" style={{ background: 'rgba(255,255,255,0.05)' }}/>
        <button type="button" onClick={() => navigate(-1)} className="relative mb-5 flex items-center gap-2" style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 0 }}>
          <svg width="20" height="20" viewBox="0 0 48 48" fill="none"><path d="M30 10L14 24l16 14" stroke="white" strokeWidth="3.5" strokeLinecap="round" strokeLinejoin="round" fill="none"/></svg>
          <span style={{ color: 'rgba(255,255,255,0.70)', fontSize: 14, fontWeight: 600 }}>Volver</span>
        </button>
        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} className="relative">
          <div style={{ color: 'rgba(255,255,255,0.55)', fontSize: 11, fontWeight: 700, letterSpacing: 1.5, textTransform: 'uppercase', marginBottom: 4 }}>
            {currentTrip.destination}
          </div>
          <div style={{ color: 'white', fontSize: 28, fontWeight: 800, lineHeight: 1.1 }}>Itinerario</div>
          <div className="mt-4 flex gap-3">
            <div className="rounded-2xl px-4 py-2" style={{ background: 'rgba(255,255,255,0.14)' }}>
              <div style={{ color: 'white', fontSize: 18, fontWeight: 800 }}>{currentTrip.durationDays}</div>
              <div style={{ color: 'rgba(255,255,255,0.60)', fontSize: 11 }}>días</div>
            </div>
            <div className="rounded-2xl px-4 py-2" style={{ background: 'rgba(255,255,255,0.14)' }}>
              <div style={{ color: 'white', fontSize: 18, fontWeight: 800 }}>{totalEvents}</div>
              <div style={{ color: 'rgba(255,255,255,0.60)', fontSize: 11 }}>eventos</div>
            </div>
            <div className="rounded-2xl px-4 py-2" style={{ background: 'rgba(255,255,255,0.14)' }}>
              <div style={{ color: 'white', fontSize: 18, fontWeight: 800 }}>{placesCount}</div>
              <div style={{ color: 'rgba(255,255,255,0.60)', fontSize: 11 }}>lugares</div>
            </div>
          </div>
        </motion.div>
      </div>

      {/* ── Acceso a Lugares guardados ── */}
      <div className="px-5 pt-5">
        <Link
          to="/places"
          className="flex items-center justify-between rounded-3xl px-5 py-4 transition active:scale-[0.98]"
          style={{ background: 'white', boxShadow: '0 3px 16px rgba(18,33,46,0.08)', textDecoration: 'none' }}
        >
          <div className="flex items-center gap-3">
            <div className="flex items-center justify-center rounded-2xl" style={{ width: 44, height: 44, background: 'rgba(48,112,130,0.10)' }}>
              <svg width="22" height="22" viewBox="0 0 48 48" fill="none"><path d="M24 4C16.27 4 10 10.27 10 18c0 10.5 14 26 14 26s14-15.5 14-26c0-7.73-6.27-14-14-14z" fill="#307082"/><circle cx="24" cy="18" r="5" fill="white" fillOpacity="0.7"/></svg>
            </div>
            <div>
              <div style={{ color: '#12212E', fontSize: 14, fontWeight: 700 }}>Lugares guardados</div>
              <div style={{ color: 'rgba(18,33,46,0.45)', fontSize: 12 }}>{placesCount} lugar{placesCount !== 1 ? 'es' : ''} en este viaje</div>
            </div>
          </div>
          <svg width="16" height="16" viewBox="0 0 48 48" fill="none"><path d="M18 10l16 14-16 14" stroke="rgba(18,33,46,0.30)" strokeWidth="3.5" strokeLinecap="round" strokeLinejoin="round" fill="none"/></svg>
        </Link>
      </div>

      {/* ── Timeline por días ── */}
      <div className="px-5 pt-4 space-y-3">
        {days.map((day, gi) => {
          const dayEvents = eventsByDay.get(day.index) ?? [];
          const isExpanded = expandedDay === day.index;
          return (
            <motion.div
              key={day.index}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: gi * 0.03 }}
            >
              {/* Cabecera del día */}
              <button
                type="button"
                onClick={() => setExpandedDay(isExpanded ? -1 : day.index)}
                className="w-full flex items-center justify-between rounded-3xl px-5 py-4 transition"
                style={{
                  background: isExpanded ? '#12212E' : 'white',
                  boxShadow: isExpanded ? '0 4px 20px rgba(18,33,46,0.22)' : '0 2px 10px rgba(18,33,46,0.07)',
                  border: 'none',
                  cursor: 'pointer',
                  fontFamily: 'Questrial, sans-serif',
                }}
              >
                <div className="flex items-center gap-3">
                  <div className="flex items-center justify-center rounded-xl" style={{ width: 36, height: 36, background: isExpanded ? 'rgba(255,255,255,0.12)' : 'rgba(18,33,46,0.07)' }}>
                    <span style={{ color: isExpanded ? 'white' : '#12212E', fontSize: 14, fontWeight: 800 }}>{day.index + 1}</span>
                  </div>
                  <div className="text-left">
                    <div style={{ color: isExpanded ? 'white' : '#12212E', fontSize: 14, fontWeight: 700 }}>
                      {day.label}
                    </div>
                    {dayEvents.length > 0 && (
                      <div style={{ color: isExpanded ? 'rgba(255,255,255,0.55)' : 'rgba(18,33,46,0.45)', fontSize: 11, marginTop: 1 }}>
                        {dayEvents.length} evento{dayEvents.length !== 1 ? 's' : ''}
                      </div>
                    )}
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  {dayEvents.length === 0 && !isExpanded && (
                    <span style={{ color: 'rgba(18,33,46,0.30)', fontSize: 11, fontWeight: 600 }}>Sin eventos</span>
                  )}
                  <svg width="16" height="16" viewBox="0 0 48 48" fill="none" style={{ transform: isExpanded ? 'rotate(90deg)' : 'none', transition: 'transform 0.2s' }}>
                    <path d="M18 10l16 14-16 14" stroke={isExpanded ? 'rgba(255,255,255,0.50)' : 'rgba(18,33,46,0.30)'} strokeWidth="3.5" strokeLinecap="round" strokeLinejoin="round" fill="none"/>
                  </svg>
                </div>
              </button>

              {/* Eventos del día */}
              <AnimatePresence>
                {isExpanded && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    transition={{ duration: 0.24 }}
                    className="overflow-hidden"
                  >
                    <div className="pt-2 space-y-2">
                      {/* Línea de tiempo */}
                      {dayEvents.length > 0 && (
                        <div className="relative pl-8">
                          {/* línea vertical */}
                          <div className="absolute left-4 top-3 bottom-3 w-0.5" style={{ background: 'rgba(18,33,46,0.12)' }}/>

                          {dayEvents.map((ev) => {
                            const meta = EVENT_META[ev.type];
                            return (
                              <div key={ev.id} className="relative mb-3 last:mb-0">
                                {/* Dot en la línea */}
                                <div className="absolute -left-4 top-4 flex items-center justify-center rounded-full" style={{ width: 10, height: 10, background: meta.color, boxShadow: `0 0 0 3px white` }}/>
                                <div className="flex items-start justify-between rounded-2xl px-4 py-3.5" style={{ background: 'white', boxShadow: '0 2px 10px rgba(18,33,46,0.07)' }}>
                                  <div className="flex items-start gap-3">
                                    <div className="flex items-center justify-center rounded-xl flex-shrink-0" style={{ width: 36, height: 36, background: meta.bg }}>
                                      {meta.icon}
                                    </div>
                                    <div>
                                      <div style={{ color: '#12212E', fontSize: 14, fontWeight: 700 }}>{ev.title}</div>
                                      <div className="mt-0.5 flex items-center gap-2">
                                        <span style={{ color: meta.color, fontSize: 11, fontWeight: 600 }}>{meta.label}</span>
                                        {ev.startTime && <span style={{ color: 'rgba(18,33,46,0.40)', fontSize: 11 }}>{ev.startTime}{ev.endTime ? ` – ${ev.endTime}` : ''}</span>}
                                      </div>
                                      {ev.description && <div style={{ color: 'rgba(18,33,46,0.50)', fontSize: 12, marginTop: 3, lineHeight: 1.4 }}>{ev.description}</div>}
                                      {/* Flight alert subscription */}
                                      {ev.type === 'flight' && ev.confirmationCode && day.date && (
                                        <FlightAlertCard
                                          flightNumber={ev.confirmationCode}
                                          flightDate={day.date}
                                          tripId={currentTripId ?? undefined}
                                        />
                                      )}
                                    </div>
                                  </div>
                                  <button
                                    type="button"
                                    onClick={() => deleteItineraryEvent(ev.id)}
                                    style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 4, flexShrink: 0 }}
                                  >
                                    <svg width="13" height="13" viewBox="0 0 48 48" fill="none"><path d="M14 14l20 20M34 14L14 34" stroke="rgba(18,33,46,0.25)" strokeWidth="3.5" strokeLinecap="round"/></svg>
                                  </button>
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      )}

                      {/* Botón Ver ruta del día */}
                      {dayEvents.length >= 2 && (
                        <button
                          type="button"
                          onClick={() => setRouteDayIndex(routeDayIndex === day.index ? null : day.index)}
                          className="w-full flex items-center justify-center gap-2 rounded-2xl py-3 transition active:scale-[0.97]"
                          style={{
                            background: routeDayIndex === day.index ? 'rgba(48,112,130,0.15)' : 'rgba(48,112,130,0.08)',
                            border: '1.5px solid rgba(48,112,130,0.20)',
                            cursor: 'pointer',
                            fontFamily: 'Questrial, sans-serif',
                          }}
                        >
                          <svg width="14" height="14" viewBox="0 0 48 48" fill="none">
                            <path d="M8 24h32M28 14l12 10-12 10" stroke="#307082" strokeWidth="3.5" strokeLinecap="round" strokeLinejoin="round" fill="none"/>
                          </svg>
                          <span style={{ color: '#307082', fontSize: 13, fontWeight: 700 }}>
                            {routeDayIndex === day.index ? 'Ocultar ruta' : 'Ver ruta del día'}
                          </span>
                        </button>
                      )}

                      {/* DayRoutePanel */}
                      <AnimatePresence>
                        {routeDayIndex === day.index && currentTripId && (
                          <DayRoutePanel
                            tripId={currentTripId}
                            dayIndex={day.index}
                            dayLabel={day.label}
                            events={itineraryEvents.filter((e) => e.tripId === currentTripId)}
                            places={savedPlaces.filter((p) => p.tripId === currentTripId)}
                            onClose={() => setRouteDayIndex(null)}
                          />
                        )}
                      </AnimatePresence>

                      {/* Botón ver detalle del día */}
                      <button
                        type="button"
                        onClick={() => navigate(`/itinerary/day/${day.index}`)}
                        className="w-full flex items-center justify-center gap-2 rounded-2xl py-3 transition active:scale-[0.97]"
                        style={{ background: 'rgba(48,112,130,0.08)', border: '1.5px solid rgba(48,112,130,0.20)', cursor: 'pointer', fontFamily: 'Questrial, sans-serif' }}
                      >
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#307082" strokeWidth="2.5" strokeLinecap="round"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>
                        <span style={{ color: '#307082', fontSize: 13, fontWeight: 700 }}>Ver detalle del día</span>
                      </button>

                      {/* Botón añadir evento */}
                      <button
                        type="button"
                        onClick={() => navigate(`/itinerary/add-event?day=${day.index}`)}
                        className="w-full flex items-center justify-center gap-2 rounded-2xl py-3 transition active:scale-[0.97]"
                        style={{ background: 'rgba(234,153,64,0.10)', border: '1.5px dashed rgba(234,153,64,0.40)', cursor: 'pointer', fontFamily: 'Questrial, sans-serif' }}
                      >
                        <svg width="14" height="14" viewBox="0 0 48 48" fill="none"><path d="M24 10v28M10 24h28" stroke="#EA9940" strokeWidth="4" strokeLinecap="round"/></svg>
                        <span style={{ color: '#EA9940', fontSize: 13, fontWeight: 700 }}>Añadir evento al Día {day.index + 1}</span>
                      </button>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          );
        })}
      </div>

      {/* ── Compartir itinerario ── */}
      {currentTripId && (
        <div className="px-5 mt-4">
          <ShareItineraryButton tripId={currentTripId} />
        </div>
      )}

      {/* ── FAB: añadir lugar ── */}
      <motion.button
        whileTap={{ scale: 0.93 }}
        type="button"
        onClick={() => navigate('/places/add')}
        className="fixed flex items-center gap-2 rounded-full"
        style={{ bottom: 100, right: 24, background: '#307082', color: 'white', border: 'none', padding: '14px 22px', fontWeight: 800, fontSize: 14, cursor: 'pointer', fontFamily: 'Questrial, sans-serif', boxShadow: '0 8px 28px rgba(48,112,130,0.40)' }}
      >
        <svg width="16" height="16" viewBox="0 0 48 48" fill="none"><path d="M24 4C16.27 4 10 10.27 10 18c0 10.5 14 26 14 26s14-15.5 14-26c0-7.73-6.27-14-14-14z" fill="white"/><circle cx="24" cy="18" r="5" fill="rgba(0,0,0,0.25)"/></svg>
        Lugar
      </motion.button>
    </div>
  );
}
