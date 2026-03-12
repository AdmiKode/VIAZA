import { useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useAppStore } from '../../../app/store/useAppStore';
import type { ItineraryEventType } from '../../../types/itinerary';

const EVENT_TYPES: { value: ItineraryEventType; label: string; color: string; bg: string; icon: JSX.Element }[] = [
  { value: 'activity',  label: 'Actividad',  color: '#EA9940', bg: 'rgba(234,153,64,0.10)',   icon: <svg width="20" height="20" viewBox="0 0 48 48" fill="none"><path d="M8 38L22 24l-4-8 6-6 4 8 8-4 2 2-14 10 6 12-4 2-4-8-4 4z" fill="#EA9940"/></svg> },
  { value: 'place',     label: 'Lugar',      color: '#307082', bg: 'rgba(48,112,130,0.10)',   icon: <svg width="20" height="20" viewBox="0 0 48 48" fill="none"><path d="M24 4C16.27 4 10 10.27 10 18c0 10.5 14 26 14 26s14-15.5 14-26c0-7.73-6.27-14-14-14z" fill="#307082"/><circle cx="24" cy="18" r="5" fill="white" fillOpacity="0.7"/></svg> },
  { value: 'meal',      label: 'Comida',     color: '#EA9940', bg: 'rgba(234,153,64,0.10)',   icon: <svg width="20" height="20" viewBox="0 0 48 48" fill="none"><path d="M16 4v18c0 4 4 6 8 6s8-2 8-6V4" stroke="#EA9940" strokeWidth="3" strokeLinecap="round" fill="none"/><line x1="24" y1="28" x2="24" y2="44" stroke="#EA9940" strokeWidth="3" strokeLinecap="round"/></svg> },
  { value: 'hotel',     label: 'Hotel',      color: '#307082', bg: 'rgba(48,112,130,0.10)',   icon: <svg width="20" height="20" viewBox="0 0 48 48" fill="none"><rect x="6" y="10" width="36" height="28" rx="5" fill="#307082" fillOpacity="0.9"/><rect x="16" y="28" width="8" height="10" rx="3" fill="white" fillOpacity="0.5"/></svg> },
  { value: 'flight',    label: 'Vuelo',      color: '#12212E', bg: 'rgba(18,33,46,0.08)',     icon: <svg width="20" height="20" viewBox="0 0 48 48" fill="none"><path d="M8 38L22 24l-4-8 6-6 4 8 8-4 2 2-14 10 6 12-4 2-4-8-4 4z" fill="#12212E"/></svg> },
  { value: 'transport', label: 'Transporte', color: '#12212E', bg: 'rgba(18,33,46,0.08)',     icon: <svg width="20" height="20" viewBox="0 0 48 48" fill="none"><rect x="4" y="20" width="40" height="14" rx="6" fill="#12212E" fillOpacity="0.85"/><circle cx="13" cy="36" r="5" fill="#12212E"/><circle cx="35" cy="36" r="5" fill="#12212E"/></svg> },
  { value: 'free',      label: 'Tiempo libre', color: '#6CA3A2', bg: 'rgba(108,163,162,0.10)', icon: <svg width="20" height="20" viewBox="0 0 48 48" fill="none"><circle cx="24" cy="24" r="18" fill="#6CA3A2" fillOpacity="0.7"/><path d="M24 14v10l7 7" stroke="white" strokeWidth="3" strokeLinecap="round" fill="none"/></svg> },
];

export function AddEventPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const defaultDay = parseInt(searchParams.get('day') ?? '0', 10);

  const currentTripId = useAppStore((s) => s.currentTripId);
  const trips = useAppStore((s) => s.trips);
  const addItineraryEvent = useAppStore((s) => s.addItineraryEvent);
  const itineraryEvents = useAppStore((s) => s.itineraryEvents);

  const currentTrip = trips.find((t) => t.id === currentTripId);
  const [title, setTitle] = useState('');
  const [type, setType] = useState<ItineraryEventType>('activity');
  const [dayIndex, setDayIndex] = useState(defaultDay);
  const [startTime, setStartTime] = useState('10:00');
  const [endTime, setEndTime] = useState('');
  const [description, setDescription] = useState('');
  const [confirmationCode, setConfirmationCode] = useState('');
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  function handleSave() {
    if (!title.trim()) { setError('Escribe un título'); return; }
    if (!currentTripId) { setError('No hay viaje activo'); return; }
    setSaving(true);
    const existingInDay = itineraryEvents.filter(
      (e) => e.tripId === currentTripId && e.dayIndex === dayIndex
    ).length;
    addItineraryEvent({
      tripId: currentTripId,
      dayIndex,
      order: existingInDay,
      type,
      title: title.trim(),
      description: description.trim() || undefined,
      startTime: startTime || undefined,
      endTime: endTime || undefined,
      confirmationCode: confirmationCode.trim() || undefined,
      source: 'manual',
    });
    navigate('/itinerary');
  }

  const selectedType = EVENT_TYPES.find((t) => t.value === type)!;
  const daysCount = currentTrip?.durationDays ?? 1;

  return (
    <div className="min-h-dvh pb-32" style={{ background: '#ECE7DC', fontFamily: 'Questrial, sans-serif' }}>

      {/* Header */}
      <div className="px-6 pt-14 pb-6" style={{ background: 'linear-gradient(160deg, #12212E 0%, #307082 70%, #6CA3A2 100%)', borderBottomLeftRadius: 28, borderBottomRightRadius: 28 }}>
        <button type="button" onClick={() => navigate(-1)} className="mb-4 flex items-center gap-2" style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 0 }}>
          <svg width="20" height="20" viewBox="0 0 48 48" fill="none"><path d="M30 10L14 24l16 14" stroke="white" strokeWidth="3.5" strokeLinecap="round" strokeLinejoin="round" fill="none"/></svg>
          <span style={{ color: 'rgba(255,255,255,0.70)', fontSize: 14, fontWeight: 600 }}>Itinerario</span>
        </button>
        <div style={{ color: 'white', fontSize: 24, fontWeight: 800 }}>Nuevo evento</div>
      </div>

      <div className="px-5 pt-6 space-y-5">

        {/* Título */}
        <div>
          <label style={{ color: 'rgba(18,33,46,0.50)', fontSize: 11, fontWeight: 700, letterSpacing: 1.2, textTransform: 'uppercase', display: 'block', marginBottom: 8 }}>Título</label>
          <input value={title} onChange={(e) => { setTitle(e.target.value); setError(''); }} placeholder="Ej: Visitar el Coliseo, Vuelo a Roma..." className="w-full rounded-2xl px-4 py-3.5 outline-none" style={{ background: 'white', border: 'none', fontSize: 15, fontFamily: 'Questrial, sans-serif', color: '#12212E', boxShadow: '0 2px 12px rgba(18,33,46,0.09)' }}/>
        </div>

        {/* Tipo */}
        <div>
          <label style={{ color: 'rgba(18,33,46,0.50)', fontSize: 11, fontWeight: 700, letterSpacing: 1.2, textTransform: 'uppercase', display: 'block', marginBottom: 10 }}>Tipo</label>
          <div className="grid grid-cols-4 gap-2">
            {EVENT_TYPES.map((et) => (
              <button key={et.value} type="button" onClick={() => setType(et.value)}
                className="flex flex-col items-center gap-1.5 rounded-2xl p-3 transition"
                style={{ background: type === et.value ? et.color : 'white', border: `2px solid ${type === et.value ? et.color : 'transparent'}`, cursor: 'pointer', boxShadow: type === et.value ? `0 4px 16px ${et.color}44` : '0 2px 8px rgba(18,33,46,0.07)' }}
              >
                <div style={{ filter: type === et.value ? 'brightness(10)' : 'none' }}>{et.icon}</div>
                <span style={{ fontSize: 10, fontWeight: 700, color: type === et.value ? 'white' : '#12212E', textAlign: 'center', lineHeight: 1.2, fontFamily: 'Questrial, sans-serif' }}>{et.label}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Día */}
        <div>
          <label style={{ color: 'rgba(18,33,46,0.50)', fontSize: 11, fontWeight: 700, letterSpacing: 1.2, textTransform: 'uppercase', display: 'block', marginBottom: 8 }}>Día del viaje</label>
          <div className="flex flex-wrap gap-2">
            {Array.from({ length: daysCount }, (_, i) => (
              <button key={i} type="button" onClick={() => setDayIndex(i)}
                className="rounded-full px-4 py-2 text-sm font-bold transition"
                style={{ background: dayIndex === i ? '#12212E' : 'white', color: dayIndex === i ? 'white' : '#12212E', border: 'none', cursor: 'pointer', boxShadow: dayIndex === i ? '0 4px 12px rgba(18,33,46,0.25)' : '0 2px 8px rgba(18,33,46,0.07)', fontFamily: 'Questrial, sans-serif' }}
              >
                Día {i + 1}
              </button>
            ))}
          </div>
        </div>

        {/* Horario */}
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label style={{ color: 'rgba(18,33,46,0.50)', fontSize: 11, fontWeight: 700, letterSpacing: 1.2, textTransform: 'uppercase', display: 'block', marginBottom: 8 }}>Inicio</label>
            <input type="time" value={startTime} onChange={(e) => setStartTime(e.target.value)} className="w-full rounded-2xl px-4 py-3.5 outline-none" style={{ background: 'white', border: 'none', fontSize: 14, fontFamily: 'Questrial, sans-serif', color: '#12212E', boxShadow: '0 2px 12px rgba(18,33,46,0.09)' }}/>
          </div>
          <div>
            <label style={{ color: 'rgba(18,33,46,0.50)', fontSize: 11, fontWeight: 700, letterSpacing: 1.2, textTransform: 'uppercase', display: 'block', marginBottom: 8 }}>Fin (opcional)</label>
            <input type="time" value={endTime} onChange={(e) => setEndTime(e.target.value)} className="w-full rounded-2xl px-4 py-3.5 outline-none" style={{ background: 'white', border: 'none', fontSize: 14, fontFamily: 'Questrial, sans-serif', color: '#12212E', boxShadow: '0 2px 12px rgba(18,33,46,0.09)' }}/>
          </div>
        </div>

        {/* Descripción */}
        <div>
          <label style={{ color: 'rgba(18,33,46,0.50)', fontSize: 11, fontWeight: 700, letterSpacing: 1.2, textTransform: 'uppercase', display: 'block', marginBottom: 8 }}>Descripción (opcional)</label>
          <textarea value={description} onChange={(e) => setDescription(e.target.value)} rows={2} placeholder="Detalles del evento..." className="w-full rounded-2xl px-4 py-3.5 outline-none resize-none" style={{ background: 'white', border: 'none', fontSize: 14, fontFamily: 'Questrial, sans-serif', color: '#12212E', boxShadow: '0 2px 12px rgba(18,33,46,0.09)' }}/>
        </div>

        {/* Código de confirmación (solo vuelo/hotel) */}
        {(type === 'flight' || type === 'hotel') && (
          <div>
            <label style={{ color: 'rgba(18,33,46,0.50)', fontSize: 11, fontWeight: 700, letterSpacing: 1.2, textTransform: 'uppercase', display: 'block', marginBottom: 8 }}>Código de confirmación</label>
            <input value={confirmationCode} onChange={(e) => setConfirmationCode(e.target.value)} placeholder="Ej: ABC123" className="w-full rounded-2xl px-4 py-3.5 outline-none" style={{ background: 'white', border: 'none', fontSize: 15, fontFamily: 'Questrial, sans-serif', color: '#12212E', boxShadow: '0 2px 12px rgba(18,33,46,0.09)' }}/>
          </div>
        )}

        {error && <div className="rounded-2xl px-4 py-3 text-sm font-semibold" style={{ background: 'rgba(192,57,43,0.10)', color: '#c0392b' }}>{error}</div>}

        {/* Preview */}
        <div className="flex items-center gap-3 rounded-3xl p-4" style={{ background: selectedType.bg }}>
          <div className="flex items-center justify-center rounded-2xl" style={{ width: 44, height: 44, background: 'white' }}>{selectedType.icon}</div>
          <div>
            <div style={{ color: '#12212E', fontSize: 15, fontWeight: 700 }}>{title || 'Título del evento'}</div>
            <div style={{ color: selectedType.color, fontSize: 12, fontWeight: 600, marginTop: 2 }}>Día {dayIndex + 1} · {startTime}{endTime ? ` – ${endTime}` : ''}</div>
          </div>
        </div>

        <motion.button whileTap={{ scale: 0.97 }} type="button" onClick={handleSave} disabled={saving}
          className="w-full rounded-2xl py-4 font-bold"
          style={{ background: '#EA9940', color: 'white', fontSize: 16, border: 'none', cursor: saving ? 'default' : 'pointer', opacity: saving ? 0.7 : 1, boxShadow: '0 8px 28px rgba(234,153,64,0.40)', fontFamily: 'Questrial, sans-serif' }}
        >
          {saving ? 'Guardando...' : 'Añadir al itinerario'}
        </motion.button>

      </div>
    </div>
  );
}
