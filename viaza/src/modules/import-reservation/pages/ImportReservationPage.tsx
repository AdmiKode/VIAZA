import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useAppStore } from '../../../app/store/useAppStore';
import { parseReservation, type ParsedReservation } from '../../../services/reservationParserService';

const TYPE_META: Record<string, { label: string }> = {
  flight:    { label: 'Vuelo'      },
  hotel:     { label: 'Hotel'      },
  activity:  { label: 'Actividad'  },
  place:     { label: 'Lugar'      },
  transport: { label: 'Transporte' },
  meal:      { label: 'Comida'     },
  free:      { label: 'Libre'      },
};

export function ImportReservationPage() {
  const navigate = useNavigate();
  const currentTripId = useAppStore((s) => s.currentTripId);
  const trips = useAppStore((s) => s.trips);
  const addItineraryEvent = useAppStore((s) => s.addItineraryEvent);

  const currentTrip = trips.find((t) => t.id === currentTripId);
  const tripDays = currentTrip
    ? Math.max(1, currentTrip.durationDays ?? 1)
    : 1;

  const [text, setText] = useState('');
  const [loading, setLoading] = useState(false);
  const [parsed, setParsed] = useState<ParsedReservation | null>(null);
  const [selectedDay, setSelectedDay] = useState(0);
  const [error, setError] = useState('');
  const [saved, setSaved] = useState(false);

  async function handleAnalyze() {
    if (!text.trim()) { setError('Pega primero el texto de tu reserva'); return; }
    setError('');
    setLoading(true);
    try {
      const result = await parseReservation(text.trim());
      setParsed(result);
    } catch (e) {
      setError((e as Error).message ?? 'Error al analizar');
    } finally {
      setLoading(false);
    }
  }

  function handleConfirm() {
    if (!parsed || !currentTripId) return;
    addItineraryEvent({
      tripId: currentTripId,
      dayIndex: selectedDay,
      order: 0,
      type: parsed.type,
      title: parsed.title,
      description: parsed.description,
      startTime: parsed.startTime ?? undefined,
      endTime: parsed.endTime ?? undefined,
      confirmationCode: parsed.confirmationCode ?? undefined,
      source: 'imported',
    });
    setSaved(true);
    setTimeout(() => navigate('/itinerary'), 1400);
  }

  function handleReset() {
    setText('');
    setParsed(null);
    setError('');
    setSaved(false);
  }

  const typeMeta = parsed ? (TYPE_META[parsed.type] ?? { label: parsed.type }) : null;

  return (
    <div className="min-h-dvh pb-32" style={{ background: '#ECE7DC', fontFamily: 'Questrial, sans-serif' }}>

      {/* Header */}
      <div className="relative overflow-hidden px-6 pt-14 pb-8" style={{ background: 'linear-gradient(160deg, var(--viaza-primary) 0%, var(--viaza-secondary) 70%, var(--viaza-accent) 100%)', borderBottomLeftRadius: 32, borderBottomRightRadius: 32 }}>
        <div className="pointer-events-none absolute -right-10 -top-10 h-44 w-44 rounded-full" style={{ background: 'rgba(255,255,255,0.06)' }}/>
        <button type="button" onClick={() => navigate(-1)} className="relative mb-5 flex items-center gap-2" style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 0 }}>
          <svg width="20" height="20" viewBox="0 0 48 48" fill="none"><path d="M30 10L14 24l16 14" stroke="white" strokeWidth="3.5" strokeLinecap="round" strokeLinejoin="round" fill="none"/></svg>
          <span style={{ color: 'rgba(255,255,255,0.70)', fontSize: 14, fontWeight: 600 }}>Itinerario</span>
        </button>
        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}>
          <div style={{ color: 'rgba(255,255,255,0.65)', fontSize: 11, fontWeight: 700, letterSpacing: 1.5, textTransform: 'uppercase', marginBottom: 4 }}>Inteligencia Artificial</div>
          <div style={{ color: 'white', fontSize: 28, fontWeight: 800 }}>Importar reserva</div>
          <div style={{ color: 'rgba(255,255,255,0.60)', fontSize: 13, marginTop: 4 }}>Pega el email o texto de confirmación</div>
        </motion.div>
      </div>

      {/* Éxito */}
      <AnimatePresence>
        {saved && (
          <motion.div initial={{ opacity: 0, scale: 0.85 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-50 flex flex-col items-center justify-center gap-4" style={{ background: 'rgba(18,33,46,0.65)', backdropFilter: 'blur(8px)' }}>
            <div className="flex flex-col items-center gap-4 rounded-3xl p-8" style={{ background: 'white' }}>
              <div style={{ color: '#12212E', fontSize: 20, fontWeight: 800 }}>¡Evento añadido!</div>
              <div style={{ color: 'rgba(18,33,46,0.45)', fontSize: 14 }}>Volviendo al itinerario…</div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="px-5 pt-5 space-y-5">
        {/* Textarea */}
        {!parsed && (
          <>
            <div>
              <div style={{ color: '#12212E', fontSize: 13, fontWeight: 700, marginBottom: 8, textTransform: 'uppercase', letterSpacing: 1 }}>Texto de confirmación</div>
              <textarea
                value={text}
                onChange={(e) => { setText(e.target.value); setError(''); }}
                placeholder={`Ej:\n\nConfirmación de vuelo IB3456\nMadrid (MAD) → París (CDG)\nSalida: 14:30 — Llegada: 16:45\nCódigo de reserva: XYZABC`}
                rows={10}
                className="w-full rounded-2xl px-4 py-3.5 resize-none outline-none"
                style={{ background: 'white', fontSize: 14, fontFamily: 'Questrial, sans-serif', color: '#12212E', border: 'none', lineHeight: 1.55, boxShadow: '0 2px 12px rgba(18,33,46,0.09)' }}
              />
              <div className="mt-2 flex flex-wrap gap-2 text-xs" style={{ color: 'rgba(18,33,46,0.40)' }}>
                <span>Vuelos</span>
                <span>Hoteles</span>
                <span>Actividades</span>
                <span>Restaurantes</span>
                <span>Transporte</span>
              </div>
            </div>

            {error && <div className="rounded-xl px-4 py-3 text-sm font-semibold" style={{ background: 'rgba(234,153,64,0.12)', color: 'var(--viaza-primary)' }}>{error}</div>}

            <motion.button
              whileTap={{ scale: 0.97 }}
              type="button"
              onClick={handleAnalyze}
              disabled={loading}
              className="w-full rounded-3xl py-4 font-extrabold text-base flex items-center justify-center gap-3"
              style={{ background: loading ? 'rgba(18,33,46,0.15)' : 'linear-gradient(135deg, var(--viaza-accent) 0%, var(--viaza-soft) 100%)', color: loading ? 'rgba(18,33,46,0.45)' : 'white', border: 'none', cursor: loading ? 'not-allowed' : 'pointer', fontFamily: 'Questrial, sans-serif', boxShadow: loading ? 'none' : '0 8px 24px rgba(234,153,64,0.40)' }}
            >
              {loading ? (
                <>
                  <svg className="animate-spin" width="18" height="18" viewBox="0 0 48 48" fill="none"><circle cx="24" cy="24" r="18" stroke="rgba(18,33,46,0.30)" strokeWidth="4"/><path d="M24 6a18 18 0 0 1 18 18" stroke="#12212E" strokeWidth="4" strokeLinecap="round"/></svg>
                  Analizando con IA…
                </>
              ) : 'Analizar con IA'}
            </motion.button>
          </>
        )}

        {/* Preview del resultado */}
        {parsed && !saved && (
          <AnimatePresence>
            <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} className="space-y-4">
              {/* Card preview */}
              <div className="rounded-3xl p-5" style={{ background: 'white', boxShadow: '0 4px 20px rgba(18,33,46,0.10)' }}>
                <div className="flex items-start gap-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="rounded-full px-3 py-1 text-xs font-bold" style={{ background: 'rgba(234,153,64,0.12)', color: '#EA9940' }}>{typeMeta?.label}</span>
                    </div>
                    <div style={{ color: '#12212E', fontSize: 17, fontWeight: 800, lineHeight: 1.3 }}>{parsed.title}</div>
                    {parsed.description && <div style={{ color: 'rgba(18,33,46,0.50)', fontSize: 13, marginTop: 6, lineHeight: 1.45 }}>{parsed.description}</div>}
                    <div className="mt-3 flex flex-wrap gap-2">
                      {parsed.startTime && <span className="rounded-full px-3 py-1 text-xs font-semibold" style={{ background: 'rgba(18,33,46,0.06)', color: '#12212E' }}>{parsed.startTime}{parsed.endTime ? ` → ${parsed.endTime}` : ''}</span>}
                      {parsed.confirmationCode && <span className="rounded-full px-3 py-1 text-xs font-semibold" style={{ background: 'rgba(48,112,130,0.10)', color: '#307082' }}>{parsed.confirmationCode}</span>}
                      {parsed.rawDate && <span className="rounded-full px-3 py-1 text-xs font-semibold" style={{ background: 'rgba(108,163,162,0.12)', color: '#6CA3A2' }}>{parsed.rawDate}</span>}
                    </div>
                  </div>
                </div>
              </div>

              {/* Asignar a día */}
              <div>
                <div style={{ color: '#12212E', fontSize: 13, fontWeight: 700, marginBottom: 8, textTransform: 'uppercase', letterSpacing: 1 }}>Asignar al día del itinerario</div>
                <div className="flex gap-2 flex-wrap">
                  {Array.from({ length: tripDays }, (_, i) => (
                    <button key={i} type="button" onClick={() => setSelectedDay(i)} className="rounded-full px-4 py-2 text-sm font-bold" style={{ background: selectedDay === i ? '#12212E' : 'white', color: selectedDay === i ? 'white' : 'rgba(18,33,46,0.55)', border: 'none', cursor: 'pointer', fontFamily: 'Questrial, sans-serif', boxShadow: '0 2px 8px rgba(18,33,46,0.08)' }}>
                      Día {i + 1}
                    </button>
                  ))}
                </div>
              </div>

              <div className="flex gap-3">
                <button type="button" onClick={handleReset} className="flex-1 rounded-3xl py-3.5 font-bold text-sm" style={{ background: 'white', color: 'rgba(18,33,46,0.55)', border: 'none', cursor: 'pointer', fontFamily: 'Questrial, sans-serif', boxShadow: '0 2px 12px rgba(18,33,46,0.08)' }}>
                  Volver a pegar
                </button>
                <motion.button whileTap={{ scale: 0.97 }} type="button" onClick={handleConfirm} className="flex-1 rounded-3xl py-3.5 font-extrabold text-sm" style={{ background: 'linear-gradient(135deg, #12212E 0%, #307082 100%)', color: 'white', border: 'none', cursor: 'pointer', fontFamily: 'Questrial, sans-serif', boxShadow: '0 8px 24px rgba(18,33,46,0.30)' }}>
                  ✓ Añadir al itinerario
                </motion.button>
              </div>
            </motion.div>
          </AnimatePresence>
        )}

        {/* Tip */}
        {!parsed && (
          <div className="rounded-2xl px-4 py-3.5 flex gap-3" style={{ background: 'rgba(18,33,46,0.05)' }}>
            <div style={{ color: 'rgba(18,33,46,0.55)', fontSize: 12, lineHeight: 1.55 }}>
              Puedes pegar el cuerpo de un email de confirmación, un SMS, o simplemente escribir los datos de tu reserva. La IA detecta vuelos, hoteles, actividades y más.
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
