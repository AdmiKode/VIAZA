import { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { motion, AnimatePresence } from 'framer-motion';
import { useAppStore } from '../../../app/store/useAppStore';
import type { AgendaCategory } from '../../../types/agenda';

/* ─── Paleta por categoría ─────────────────────────────────────── */
const CAT_META: Record<AgendaCategory, { color: string; bg: string; label: string; icon: JSX.Element }> = {
  medication: {
    color: '#EA9940', bg: 'rgba(234,153,64,0.10)',
    label: 'Medicamento',
    icon: <svg width="20" height="20" viewBox="0 0 48 48" fill="none"><rect x="4" y="4" width="40" height="40" rx="8" fill="#EA9940" fillOpacity="0.85"/><rect x="20" y="12" width="8" height="24" rx="3" fill="white" fillOpacity="0.9"/><rect x="12" y="20" width="24" height="8" rx="3" fill="white" fillOpacity="0.9"/></svg>,
  },
  call: {
    color: '#307082', bg: 'rgba(48,112,130,0.10)',
    label: 'Llamada',
    icon: <svg width="20" height="20" viewBox="0 0 48 48" fill="none"><path d="M14 8c0 0 4 6 4 10s-4 4-4 8c0 2 4 14 16 14 4 0 4-4 8-4s10 4 10 4l-6 6C22 48 0 26 0 14l6-6z" fill="#307082"/><path d="M14 8c0 0 4 6 4 10s-4 4-4 8" fill="rgba(255,255,255,0.2)"/></svg>,
  },
  meeting: {
    color: '#12212E', bg: 'rgba(18,33,46,0.09)',
    label: 'Reunión',
    icon: <svg width="20" height="20" viewBox="0 0 48 48" fill="none"><circle cx="16" cy="14" r="7" fill="#12212E" fillOpacity="0.8"/><circle cx="32" cy="14" r="7" fill="#12212E" fillOpacity="0.5"/><path d="M2 40c0-7.73 6.27-14 14-14s14 6.27 14 14" fill="#12212E" fillOpacity="0.8"/><path d="M32 28c5 0 14 2.27 14 12" stroke="#12212E" strokeWidth="3" strokeLinecap="round" fill="none" opacity="0.5"/></svg>,
  },
  checkin: {
    color: '#EA9940', bg: 'rgba(234,153,64,0.12)',
    label: 'Check-in',
    icon: <svg width="20" height="20" viewBox="0 0 48 48" fill="none"><rect x="8" y="8" width="32" height="32" rx="7" fill="#EA9940" fillOpacity="0.9"/><rect x="8" y="8" width="32" height="16" rx="7" fill="rgba(255,255,255,0.25)"/><path d="M16 28l6 6 12-12" stroke="white" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"/></svg>,
  },
  activity: {
    color: '#307082', bg: 'rgba(48,112,130,0.10)',
    label: 'Actividad',
    icon: <svg width="20" height="20" viewBox="0 0 48 48" fill="none"><path d="M8 38L22 24l-4-8 6-6 4 8 8-4 2 2-14 10 6 12-4 2-4-8-4 4z" fill="#307082"/><circle cx="38" cy="10" r="6" fill="#307082" fillOpacity="0.5"/></svg>,
  },
  reminder: {
    color: '#6CA3A2', bg: 'rgba(108,163,162,0.12)',
    label: 'Recordatorio',
    icon: <svg width="20" height="20" viewBox="0 0 48 48" fill="none"><path d="M24 4a16 16 0 0 0-16 16v8l-4 6h40l-4-6v-8A16 16 0 0 0 24 4z" fill="#6CA3A2" fillOpacity="0.9"/><path d="M24 4a16 16 0 0 0-16 16v8" fill="rgba(255,255,255,0.2)"/><path d="M20 40a4 4 0 0 0 8 0" stroke="#6CA3A2" strokeWidth="3" fill="none"/></svg>,
  },
  transport: {
    color: '#12212E', bg: 'rgba(18,33,46,0.09)',
    label: 'Transporte',
    icon: <svg width="20" height="20" viewBox="0 0 48 48" fill="none"><path d="M8 38L22 24l-4-8 6-6 4 8 8-4 2 2-14 10 6 12-4 2-4-8-4 4z" fill="#12212E" fillOpacity="0.85"/></svg>,
  },
  custom: {
    color: '#EA9940', bg: 'rgba(234,153,64,0.10)',
    label: 'Personalizado',
    icon: <svg width="20" height="20" viewBox="0 0 48 48" fill="none"><circle cx="24" cy="24" r="18" fill="#EA9940" fillOpacity="0.85"/><path d="M24 14v10l7 7" stroke="white" strokeWidth="3" strokeLinecap="round" fill="none"/></svg>,
  },
};

const RECURRENCE_LABEL: Record<string, string> = {
  none: '',
  every_8h: 'Cada 8h',
  every_12h: 'Cada 12h',
  daily: 'Diario',
  weekly: 'Semanal',
};

function formatTime(time: string) {
  if (!time) return '';
  const [h, m] = time.split(':');
  const hour = parseInt(h, 10);
  const ampm = hour >= 12 ? 'PM' : 'AM';
  const h12 = hour % 12 || 12;
  return `${h12}:${m} ${ampm}`;
}

function formatDate(iso: string) {
  if (!iso) return '';
  const d = new Date(iso + 'T00:00:00');
  return d.toLocaleDateString('es', { weekday: 'short', day: 'numeric', month: 'short' });
}

export function AgendaPage() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const currentTripId = useAppStore((s) => s.currentTripId);
  const trips = useAppStore((s) => s.trips);
  const agendaItems = useAppStore((s) => s.agendaItems);
  const toggleAgendaItem = useAppStore((s) => s.toggleAgendaItem);
  const deleteAgendaItem = useAppStore((s) => s.deleteAgendaItem);

  const currentTrip = trips.find((tr) => tr.id === currentTripId);
  const [filter, setFilter] = useState<AgendaCategory | 'all'>('all');
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const items = useMemo(() => {
    const base = agendaItems
      .filter((a) => a.tripId === currentTripId)
      .filter((a) => filter === 'all' || a.category === filter)
      .sort((a, b) => {
        const da = a.date + 'T' + a.time;
        const db = b.date + 'T' + b.time;
        return da.localeCompare(db);
      });
    return base;
  }, [agendaItems, currentTripId, filter]);

  // Agrupar por fecha
  const grouped = useMemo(() => {
    const map = new Map<string, typeof items>();
    for (const item of items) {
      const key = item.date;
      if (!map.has(key)) map.set(key, []);
      map.get(key)!.push(item);
    }
    return map;
  }, [items]);

  const pending = items.filter((a) => !a.completed).length;
  const categories = Object.keys(CAT_META) as AgendaCategory[];

  function handleDelete(id: string) {
    setDeletingId(id);
    setTimeout(() => {
      deleteAgendaItem(id);
      setDeletingId(null);
    }, 280);
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

        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }} className="relative">
          <div style={{ color: 'rgba(255,255,255,0.55)', fontSize: 11, fontWeight: 700, letterSpacing: 1.5, textTransform: 'uppercase', marginBottom: 4 }}>
            {currentTrip?.destination ?? 'Viaje activo'}
          </div>
          <div style={{ color: 'white', fontSize: 28, fontWeight: 800, lineHeight: 1.1 }}>Agenda del viaje</div>
          {pending > 0 && (
            <div style={{ color: 'rgba(255,255,255,0.70)', fontSize: 13, marginTop: 6 }}>
              {pending} evento{pending !== 1 ? 's' : ''} pendiente{pending !== 1 ? 's' : ''}
            </div>
          )}
        </motion.div>
      </div>

      {/* ── Filtros por categoría ── */}
      <div className="overflow-x-auto px-5 pt-5 pb-1" style={{ scrollbarWidth: 'none' }}>
        <div className="flex gap-2" style={{ width: 'max-content' }}>
          <button
            type="button"
            onClick={() => setFilter('all')}
            className="rounded-full px-4 py-2 text-xs font-bold transition"
            style={{
              background: filter === 'all' ? '#12212E' : 'white',
              color: filter === 'all' ? 'white' : '#12212E',
              border: 'none',
              boxShadow: '0 2px 8px rgba(18,33,46,0.10)',
              fontFamily: 'Questrial, sans-serif',
              cursor: 'pointer',
            }}
          >
            Todos
          </button>
          {categories.map((cat) => (
            <button
              key={cat}
              type="button"
              onClick={() => setFilter(cat)}
              className="flex items-center gap-1.5 rounded-full px-4 py-2 text-xs font-bold transition"
              style={{
                background: filter === cat ? CAT_META[cat].color : 'white',
                color: filter === cat ? 'white' : CAT_META[cat].color,
                border: 'none',
                boxShadow: '0 2px 8px rgba(18,33,46,0.10)',
                fontFamily: 'Questrial, sans-serif',
                cursor: 'pointer',
              }}
            >
              {CAT_META[cat].label}
            </button>
          ))}
        </div>
      </div>

      {/* ── Lista agrupada por día ── */}
      <div className="px-5 pt-4 space-y-6">
        {grouped.size === 0 && (
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex flex-col items-center py-16 text-center"
          >
            <div className="mb-4 flex h-20 w-20 items-center justify-center rounded-full" style={{ background: 'rgba(18,33,46,0.07)' }}>
              <svg width="36" height="36" viewBox="0 0 48 48" fill="none" opacity="0.35">
                <path d="M24 4a16 16 0 0 0-16 16v8l-4 6h40l-4-6v-8A16 16 0 0 0 24 4z" fill="#12212E"/>
                <path d="M20 40a4 4 0 0 0 8 0" stroke="#12212E" strokeWidth="3" fill="none"/>
              </svg>
            </div>
            <div style={{ color: '#12212E', fontSize: 17, fontWeight: 700, marginBottom: 6 }}>Sin eventos todavía</div>
            <div style={{ color: 'rgba(18,33,46,0.45)', fontSize: 13 }}>
              Toca el botón + para agregar recordatorios, llamadas, medicamentos...
            </div>
          </motion.div>
        )}

        {Array.from(grouped.entries()).map(([date, dayItems], gi) => (
          <motion.div
            key={date}
            initial={{ opacity: 0, y: 14 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: gi * 0.04 }}
          >
            {/* Título del día */}
            <div className="mb-3 flex items-center gap-3">
              <div style={{ height: 1, flex: 1, background: 'rgba(18,33,46,0.12)' }}/>
              <span style={{ color: 'rgba(18,33,46,0.50)', fontSize: 11, fontWeight: 700, letterSpacing: 1.2, textTransform: 'uppercase' }}>
                {formatDate(date)}
              </span>
              <div style={{ height: 1, flex: 1, background: 'rgba(18,33,46,0.12)' }}/>
            </div>

            <div className="space-y-3">
              <AnimatePresence>
                {dayItems.map((item) => {
                  const meta = CAT_META[item.category];
                  return (
                    <motion.div
                      key={item.id}
                      layout
                      initial={{ opacity: 0, x: -12 }}
                      animate={{ opacity: deletingId === item.id ? 0 : 1, x: 0 }}
                      exit={{ opacity: 0, x: 20 }}
                      transition={{ duration: 0.22 }}
                      className="flex items-start gap-3 rounded-3xl p-4"
                      style={{
                        background: item.completed ? 'rgba(18,33,46,0.04)' : 'white',
                        boxShadow: item.completed ? 'none' : '0 3px 16px rgba(18,33,46,0.08)',
                        opacity: item.completed ? 0.6 : 1,
                      }}
                    >
                      {/* Icono categoría */}
                      <div
                        className="flex-shrink-0 flex items-center justify-center rounded-2xl"
                        style={{ width: 44, height: 44, background: meta.bg }}
                      >
                        {meta.icon}
                      </div>

                      {/* Contenido */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between gap-2">
                          <div style={{ color: '#12212E', fontSize: 15, fontWeight: 700, textDecoration: item.completed ? 'line-through' : 'none', opacity: item.completed ? 0.6 : 1 }}>
                            {item.title}
                          </div>
                          <div style={{ color: meta.color, fontSize: 12, fontWeight: 700, flexShrink: 0 }}>
                            {formatTime(item.time)}
                          </div>
                        </div>
                        <div className="mt-1 flex flex-wrap items-center gap-2">
                          <span className="rounded-full px-2 py-0.5 text-xs font-semibold" style={{ background: meta.bg, color: meta.color }}>
                            {meta.label}
                          </span>
                          {item.recurrence !== 'none' && (
                            <span className="rounded-full px-2 py-0.5 text-xs font-semibold" style={{ background: 'rgba(18,33,46,0.07)', color: '#12212E' }}>
                              {RECURRENCE_LABEL[item.recurrence]}
                            </span>
                          )}
                        </div>
                        {item.notes && (
                          <div style={{ color: 'rgba(18,33,46,0.50)', fontSize: 12, marginTop: 4, lineHeight: 1.4 }}>
                            {item.notes}
                          </div>
                        )}
                      </div>

                      {/* Acciones */}
                      <div className="flex flex-col items-center gap-2 flex-shrink-0">
                        {/* Toggle completado */}
                        <button
                          type="button"
                          onClick={() => toggleAgendaItem(item.id)}
                          className="flex items-center justify-center rounded-full transition"
                          style={{ width: 32, height: 32, background: item.completed ? '#307082' : 'rgba(18,33,46,0.07)', border: 'none', cursor: 'pointer' }}
                        >
                          {item.completed
                            ? <svg width="14" height="14" viewBox="0 0 48 48" fill="none"><path d="M10 24l10 10 18-18" stroke="white" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round"/></svg>
                            : <svg width="14" height="14" viewBox="0 0 48 48" fill="none"><circle cx="24" cy="24" r="16" stroke="rgba(18,33,46,0.30)" strokeWidth="3" fill="none"/></svg>
                          }
                        </button>
                        {/* Eliminar */}
                        <button
                          type="button"
                          onClick={() => handleDelete(item.id)}
                          className="flex items-center justify-center rounded-full transition"
                          style={{ width: 32, height: 32, background: 'rgba(234,153,64,0.10)', border: 'none', cursor: 'pointer' }}
                        >
                          <svg width="13" height="13" viewBox="0 0 48 48" fill="none"><path d="M14 14l20 20M34 14L14 34" stroke="#EA9940" strokeWidth="3.5" strokeLinecap="round"/></svg>
                        </button>
                      </div>
                    </motion.div>
                  );
                })}
              </AnimatePresence>
            </div>
          </motion.div>
        ))}
      </div>

      {/* ── FAB ── */}
      <motion.button
        whileTap={{ scale: 0.93 }}
        type="button"
        onClick={() => navigate('/agenda/new')}
        className="fixed flex items-center gap-2 rounded-full shadow-xl"
        style={{
          bottom: 100,
          right: 24,
          background: '#EA9940',
          color: 'white',
          border: 'none',
          padding: '14px 22px',
          fontWeight: 800,
          fontSize: 15,
          cursor: 'pointer',
          fontFamily: 'Questrial, sans-serif',
          boxShadow: '0 8px 28px rgba(234,153,64,0.45)',
        }}
      >
        <svg width="18" height="18" viewBox="0 0 48 48" fill="none"><path d="M24 10v28M10 24h28" stroke="white" strokeWidth="4" strokeLinecap="round"/></svg>
        Nuevo evento
      </motion.button>
    </div>
  );
}
