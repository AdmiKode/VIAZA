import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useAppStore } from '../../../app/store/useAppStore';
import type { AgendaCategory, AgendaRecurrence } from '../../../types/agenda';
import { scheduleNotification, generateNotificationId } from '../../../services/notificationsService';

const CATEGORIES: { value: AgendaCategory; label: string; color: string; bg: string; icon: JSX.Element }[] = [
  { value: 'medication', label: 'Medicamento', color: '#c0392b', bg: 'rgba(192,57,43,0.10)', icon: <svg width="22" height="22" viewBox="0 0 48 48" fill="none"><rect x="4" y="4" width="40" height="40" rx="8" fill="#c0392b" fillOpacity="0.85"/><rect x="20" y="12" width="8" height="24" rx="3" fill="white" fillOpacity="0.9"/><rect x="12" y="20" width="24" height="8" rx="3" fill="white" fillOpacity="0.9"/></svg> },
  { value: 'call',       label: 'Llamada',     color: '#307082', bg: 'rgba(48,112,130,0.10)', icon: <svg width="22" height="22" viewBox="0 0 48 48" fill="none"><path d="M14 8c0 0 4 6 4 10s-4 4-4 8c0 2 4 14 16 14 4 0 4-4 8-4s10 4 10 4l-6 6C22 48 0 26 0 14l6-6z" fill="#307082"/></svg> },
  { value: 'meeting',    label: 'Reunión',     color: '#12212E', bg: 'rgba(18,33,46,0.09)', icon: <svg width="22" height="22" viewBox="0 0 48 48" fill="none"><circle cx="16" cy="14" r="7" fill="#12212E" fillOpacity="0.8"/><circle cx="32" cy="14" r="7" fill="#12212E" fillOpacity="0.5"/><path d="M2 40c0-7.73 6.27-14 14-14s14 6.27 14 14" fill="#12212E" fillOpacity="0.8"/></svg> },
  { value: 'checkin',    label: 'Check-in',    color: '#EA9940', bg: 'rgba(234,153,64,0.12)', icon: <svg width="22" height="22" viewBox="0 0 48 48" fill="none"><rect x="8" y="8" width="32" height="32" rx="7" fill="#EA9940" fillOpacity="0.9"/><path d="M16 28l6 6 12-12" stroke="white" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"/></svg> },
  { value: 'activity',   label: 'Actividad',   color: '#307082', bg: 'rgba(48,112,130,0.10)', icon: <svg width="22" height="22" viewBox="0 0 48 48" fill="none"><path d="M8 38L22 24l-4-8 6-6 4 8 8-4 2 2-14 10 6 12-4 2-4-8-4 4z" fill="#307082"/></svg> },
  { value: 'reminder',   label: 'Recordatorio',color: '#6CA3A2', bg: 'rgba(108,163,162,0.12)', icon: <svg width="22" height="22" viewBox="0 0 48 48" fill="none"><path d="M24 4a16 16 0 0 0-16 16v8l-4 6h40l-4-6v-8A16 16 0 0 0 24 4z" fill="#6CA3A2" fillOpacity="0.9"/><path d="M20 40a4 4 0 0 0 8 0" stroke="#6CA3A2" strokeWidth="3" fill="none"/></svg> },
  { value: 'transport',  label: 'Transporte',  color: '#12212E', bg: 'rgba(18,33,46,0.09)', icon: <svg width="22" height="22" viewBox="0 0 48 48" fill="none"><path d="M8 38L22 24l-4-8 6-6 4 8 8-4 2 2-14 10 6 12-4 2-4-8-4 4z" fill="#12212E" fillOpacity="0.85"/></svg> },
  { value: 'custom',     label: 'Personalizado',color: '#EA9940', bg: 'rgba(234,153,64,0.10)', icon: <svg width="22" height="22" viewBox="0 0 48 48" fill="none"><circle cx="24" cy="24" r="18" fill="#EA9940" fillOpacity="0.85"/><path d="M24 14v10l7 7" stroke="white" strokeWidth="3" strokeLinecap="round" fill="none"/></svg> },
];

const RECURRENCES: { value: AgendaRecurrence; label: string }[] = [
  { value: 'none',      label: 'Sin repetir'  },
  { value: 'every_8h',  label: 'Cada 8 horas' },
  { value: 'every_12h', label: 'Cada 12 horas'},
  { value: 'daily',     label: 'Cada día'     },
  { value: 'weekly',    label: 'Cada semana'  },
];

export function NewAgendaItemPage() {
  const navigate = useNavigate();
  const currentTripId = useAppStore((s) => s.currentTripId);
  const trips = useAppStore((s) => s.trips);
  const addAgendaItem = useAppStore((s) => s.addAgendaItem);
  const isPremium = useAppStore((s) => s.isPremium);

  const currentTrip = trips.find((tr) => tr.id === currentTripId);
  const today = new Date().toISOString().slice(0, 10);

  const [title, setTitle] = useState('');
  const [category, setCategory] = useState<AgendaCategory>('reminder');
  const [date, setDate] = useState(currentTrip?.startDate ?? today);
  const [time, setTime] = useState('09:00');
  const [recurrence, setRecurrence] = useState<AgendaRecurrence>('none');
  const [notes, setNotes] = useState('');
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  const isRecurring = recurrence !== 'none';
  const recurringBlocked = isRecurring && !isPremium;

  async function handleSave() {
    if (!title.trim()) { setError('Escribe un título'); return; }
    if (!currentTripId) { setError('No hay viaje activo'); return; }
    if (recurringBlocked) { setError('Las recurrencias son Premium'); return; }
    setSaving(true);
    try {
      const notifId = generateNotificationId();
      const at = new Date(`${date}T${time}:00`);
      await scheduleNotification({
        id: notifId,
        title,
        body: notes || `Recordatorio de viaje: ${title}`,
        at: at.toISOString(),
      });
      addAgendaItem({
        tripId: currentTripId,
        title: title.trim(),
        category,
        date,
        time,
        recurrence,
        notes: notes.trim() || undefined,
        notificationId: notifId,
        completed: false,
      });
      navigate('/agenda');
    } catch {
      setError('Error al guardar');
    } finally {
      setSaving(false);
    }
  }

  const selectedCat = CATEGORIES.find((c) => c.value === category)!;

  return (
    <div className="min-h-dvh pb-32" style={{ background: '#ECE7DC', fontFamily: 'Questrial, sans-serif' }}>

      {/* ── Header ── */}
      <div className="px-6 pt-14 pb-6" style={{ background: 'linear-gradient(160deg, #12212E 0%, #307082 70%, #6CA3A2 100%)', borderBottomLeftRadius: 28, borderBottomRightRadius: 28 }}>
        <button type="button" onClick={() => navigate(-1)} className="mb-4 flex items-center gap-2" style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 0 }}>
          <svg width="20" height="20" viewBox="0 0 48 48" fill="none"><path d="M30 10L14 24l16 14" stroke="white" strokeWidth="3.5" strokeLinecap="round" strokeLinejoin="round" fill="none"/></svg>
          <span style={{ color: 'rgba(255,255,255,0.70)', fontSize: 14, fontWeight: 600 }}>Agenda</span>
        </button>
        <div style={{ color: 'white', fontSize: 24, fontWeight: 800 }}>Nuevo evento</div>
        <div style={{ color: 'rgba(255,255,255,0.60)', fontSize: 13, marginTop: 4 }}>
          {currentTrip?.destination ?? 'Viaje activo'}
        </div>
      </div>

      <div className="px-5 pt-6 space-y-5">

        {/* ── Título ── */}
        <div>
          <label style={{ color: 'rgba(18,33,46,0.50)', fontSize: 11, fontWeight: 700, letterSpacing: 1.2, textTransform: 'uppercase' }}>
            Título
          </label>
          <input
            value={title}
            onChange={(e) => { setTitle(e.target.value); setError(''); }}
            placeholder="Ej: Tomar pastilla, Llamar al hotel..."
            className="mt-2 w-full rounded-2xl px-4 py-3.5 outline-none transition"
            style={{
              background: 'white',
              border: 'none',
              fontSize: 15,
              fontFamily: 'Questrial, sans-serif',
              color: '#12212E',
              boxShadow: '0 2px 12px rgba(18,33,46,0.09)',
            }}
          />
        </div>

        {/* ── Categoría ── */}
        <div>
          <label style={{ color: 'rgba(18,33,46,0.50)', fontSize: 11, fontWeight: 700, letterSpacing: 1.2, textTransform: 'uppercase', display: 'block', marginBottom: 10 }}>
            Categoría
          </label>
          <div className="grid grid-cols-4 gap-2">
            {CATEGORIES.map((cat) => (
              <button
                key={cat.value}
                type="button"
                onClick={() => setCategory(cat.value)}
                className="flex flex-col items-center gap-1.5 rounded-2xl p-3 transition"
                style={{
                  background: category === cat.value ? cat.color : 'white',
                  border: `2px solid ${category === cat.value ? cat.color : 'transparent'}`,
                  cursor: 'pointer',
                  boxShadow: category === cat.value ? `0 4px 16px ${cat.color}44` : '0 2px 8px rgba(18,33,46,0.07)',
                }}
              >
                <div style={{ filter: category === cat.value ? 'brightness(10)' : 'none' }}>
                  {cat.icon}
                </div>
                <span style={{ fontSize: 10, fontWeight: 700, color: category === cat.value ? 'white' : '#12212E', textAlign: 'center', lineHeight: 1.2, fontFamily: 'Questrial, sans-serif' }}>
                  {cat.label}
                </span>
              </button>
            ))}
          </div>
        </div>

        {/* ── Fecha y hora ── */}
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label style={{ color: 'rgba(18,33,46,0.50)', fontSize: 11, fontWeight: 700, letterSpacing: 1.2, textTransform: 'uppercase', display: 'block', marginBottom: 8 }}>
              Fecha
            </label>
            <input
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              className="w-full rounded-2xl px-4 py-3.5 outline-none"
              style={{ background: 'white', border: 'none', fontSize: 14, fontFamily: 'Questrial, sans-serif', color: '#12212E', boxShadow: '0 2px 12px rgba(18,33,46,0.09)' }}
            />
          </div>
          <div>
            <label style={{ color: 'rgba(18,33,46,0.50)', fontSize: 11, fontWeight: 700, letterSpacing: 1.2, textTransform: 'uppercase', display: 'block', marginBottom: 8 }}>
              Hora
            </label>
            <input
              type="time"
              value={time}
              onChange={(e) => setTime(e.target.value)}
              className="w-full rounded-2xl px-4 py-3.5 outline-none"
              style={{ background: 'white', border: 'none', fontSize: 14, fontFamily: 'Questrial, sans-serif', color: '#12212E', boxShadow: '0 2px 12px rgba(18,33,46,0.09)' }}
            />
          </div>
        </div>

        {/* ── Recurrencia ── */}
        <div>
          <div className="flex items-center justify-between mb-2">
            <label style={{ color: 'rgba(18,33,46,0.50)', fontSize: 11, fontWeight: 700, letterSpacing: 1.2, textTransform: 'uppercase' }}>
              Repetir
            </label>
            {!isPremium && (
              <span className="rounded-full px-2.5 py-1 text-xs font-bold" style={{ background: '#EA9940', color: 'white' }}>
                Premium
              </span>
            )}
          </div>
          <div className="flex flex-wrap gap-2">
            {RECURRENCES.map((r) => {
              const locked = r.value !== 'none' && !isPremium;
              return (
                <button
                  key={r.value}
                  type="button"
                  onClick={() => !locked && setRecurrence(r.value)}
                  className="rounded-full px-4 py-2 text-xs font-bold transition"
                  style={{
                    background: recurrence === r.value ? '#12212E' : locked ? 'rgba(18,33,46,0.05)' : 'white',
                    color: recurrence === r.value ? 'white' : locked ? 'rgba(18,33,46,0.30)' : '#12212E',
                    border: 'none',
                    cursor: locked ? 'not-allowed' : 'pointer',
                    boxShadow: recurrence === r.value ? '0 4px 16px rgba(18,33,46,0.25)' : '0 2px 8px rgba(18,33,46,0.07)',
                    fontFamily: 'Questrial, sans-serif',
                  }}
                >
                  {r.label}
                </button>
              );
            })}
          </div>
        </div>

        {/* ── Notas ── */}
        <div>
          <label style={{ color: 'rgba(18,33,46,0.50)', fontSize: 11, fontWeight: 700, letterSpacing: 1.2, textTransform: 'uppercase', display: 'block', marginBottom: 8 }}>
            Notas (opcional)
          </label>
          <textarea
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            rows={3}
            placeholder="Detalles adicionales..."
            className="w-full rounded-2xl px-4 py-3.5 outline-none resize-none"
            style={{ background: 'white', border: 'none', fontSize: 14, fontFamily: 'Questrial, sans-serif', color: '#12212E', boxShadow: '0 2px 12px rgba(18,33,46,0.09)' }}
          />
        </div>

        {/* ── Error ── */}
        {error && (
          <div className="rounded-2xl px-4 py-3 text-sm font-semibold" style={{ background: 'rgba(192,57,43,0.10)', color: '#c0392b' }}>
            {error}
          </div>
        )}

        {/* ── Preview ── */}
        <div className="flex items-center gap-3 rounded-3xl p-4" style={{ background: selectedCat.bg, boxShadow: `0 2px 12px ${selectedCat.color}22` }}>
          <div className="flex items-center justify-center rounded-2xl" style={{ width: 44, height: 44, background: 'white' }}>
            {selectedCat.icon}
          </div>
          <div>
            <div style={{ color: '#12212E', fontSize: 15, fontWeight: 700 }}>{title || 'Título del evento'}</div>
            <div style={{ color: selectedCat.color, fontSize: 12, fontWeight: 600, marginTop: 2 }}>
              {date} · {time}
              {recurrence !== 'none' ? ` · ${RECURRENCES.find((r) => r.value === recurrence)?.label}` : ''}
            </div>
          </div>
        </div>

        {/* ── CTA ── */}
        <motion.button
          whileTap={{ scale: 0.97 }}
          type="button"
          onClick={handleSave}
          disabled={saving}
          className="w-full rounded-2xl py-4 text-center font-bold transition"
          style={{
            background: '#EA9940',
            color: 'white',
            fontSize: 16,
            border: 'none',
            cursor: saving ? 'default' : 'pointer',
            opacity: saving ? 0.7 : 1,
            boxShadow: '0 8px 28px rgba(234,153,64,0.40)',
            fontFamily: 'Questrial, sans-serif',
          }}
        >
          {saving ? 'Guardando...' : 'Guardar evento'}
        </motion.button>

      </div>
    </div>
  );
}
