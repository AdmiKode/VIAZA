import { useMemo, useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useAppStore } from '../../../app/store/useAppStore';
import type { PlaceCategory, PlaceStatus } from '../../../types/itinerary';

const CAT_LABEL: Record<PlaceCategory, string> = {
  restaurant: 'Restaurante', museum: 'Museo', hotel: 'Hotel', beach: 'Playa',
  park: 'Parque', shopping: 'Compras', transport: 'Transporte', attraction: 'Atracción', other: 'Otro',
};

const STATUS_META: Record<PlaceStatus, { label: string; color: string; bg: string }> = {
  want_to_go: { label: 'Quiero ir',  color: '#307082',  bg: 'rgba(48,112,130,0.10)' },
  booked:     { label: 'Reservado', color: '#EA9940',  bg: 'rgba(234,153,64,0.10)' },
  visited:    { label: 'Visitado',  color: '#6CA3A2',  bg: 'rgba(108,163,162,0.12)' },
};

const CAT_ICONS: Partial<Record<PlaceCategory, JSX.Element>> = {
  restaurant: <svg width="18" height="18" viewBox="0 0 48 48" fill="none"><path d="M16 4v18c0 4 4 6 8 6s8-2 8-6V4" stroke="#EA9940" strokeWidth="3" strokeLinecap="round" fill="none"/><line x1="24" y1="28" x2="24" y2="44" stroke="#EA9940" strokeWidth="3" strokeLinecap="round"/></svg>,
  museum:     <svg width="18" height="18" viewBox="0 0 48 48" fill="none"><rect x="4" y="20" width="40" height="24" rx="4" fill="#307082" fillOpacity="0.85"/><path d="M4 20L24 6l20 14" fill="#307082" fillOpacity="0.50"/><rect x="18" y="30" width="12" height="14" rx="2" fill="white" fillOpacity="0.4"/></svg>,
  hotel:      <svg width="18" height="18" viewBox="0 0 48 48" fill="none"><rect x="6" y="10" width="36" height="28" rx="5" fill="#307082" fillOpacity="0.9"/><rect x="16" y="28" width="8" height="10" rx="3" fill="white" fillOpacity="0.5"/></svg>,
  beach:      <svg width="18" height="18" viewBox="0 0 48 48" fill="none"><path d="M4 36c10-8 30-8 40 0" stroke="#307082" strokeWidth="3" strokeLinecap="round" fill="none"/><circle cx="36" cy="16" r="8" fill="#EA9940"/></svg>,
};

export function PlacesPage() {
  const navigate = useNavigate();
  const currentTripId = useAppStore((s) => s.currentTripId);
  const trips = useAppStore((s) => s.trips);
  const savedPlaces = useAppStore((s) => s.savedPlaces);
  const updateSavedPlace = useAppStore((s) => s.updateSavedPlace);
  const deleteSavedPlace = useAppStore((s) => s.deleteSavedPlace);

  const currentTrip = trips.find((t) => t.id === currentTripId);
  const [statusFilter, setStatusFilter] = useState<PlaceStatus | 'all'>('all');
  const [search, setSearch] = useState('');

  const places = useMemo(() => {
    return savedPlaces
      .filter((p) => p.tripId === currentTripId)
      .filter((p) => statusFilter === 'all' || p.status === statusFilter)
      .filter((p) => !search || p.name.toLowerCase().includes(search.toLowerCase()));
  }, [savedPlaces, currentTripId, statusFilter, search]);

  const statuses: PlaceStatus[] = ['want_to_go', 'booked', 'visited'];

  return (
    <div className="min-h-dvh pb-32" style={{ background: '#ECE7DC', fontFamily: 'Questrial, sans-serif' }}>

      {/* Header */}
      <div className="relative overflow-hidden px-6 pt-14 pb-8" style={{ background: 'linear-gradient(160deg, #12212E 0%, #307082 70%, #6CA3A2 100%)', borderBottomLeftRadius: 32, borderBottomRightRadius: 32 }}>
        <div className="pointer-events-none absolute -right-12 -top-12 h-48 w-48 rounded-full" style={{ background: 'rgba(255,255,255,0.05)' }}/>
        <button type="button" onClick={() => navigate(-1)} className="relative mb-5 flex items-center gap-2" style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 0 }}>
          <svg width="20" height="20" viewBox="0 0 48 48" fill="none"><path d="M30 10L14 24l16 14" stroke="white" strokeWidth="3.5" strokeLinecap="round" strokeLinejoin="round" fill="none"/></svg>
          <span style={{ color: 'rgba(255,255,255,0.70)', fontSize: 14, fontWeight: 600 }}>Itinerario</span>
        </button>
        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} className="relative">
          <div style={{ color: 'rgba(255,255,255,0.55)', fontSize: 11, fontWeight: 700, letterSpacing: 1.5, textTransform: 'uppercase', marginBottom: 4 }}>{currentTrip?.destination ?? 'Viaje activo'}</div>
          <div style={{ color: 'white', fontSize: 28, fontWeight: 800 }}>Lugares guardados</div>
          <div style={{ color: 'rgba(255,255,255,0.60)', fontSize: 13, marginTop: 4 }}>{places.length} lugar{places.length !== 1 ? 'es' : ''}</div>
        </motion.div>
      </div>

      {/* Buscador */}
      <div className="px-5 pt-4">
        <div className="flex items-center gap-3 rounded-2xl px-4 py-3" style={{ background: 'white', boxShadow: '0 2px 12px rgba(18,33,46,0.09)' }}>
          <svg width="16" height="16" viewBox="0 0 48 48" fill="none" opacity="0.35"><circle cx="20" cy="20" r="14" stroke="#12212E" strokeWidth="3.5" fill="none"/><path d="M30 30l10 10" stroke="#12212E" strokeWidth="3.5" strokeLinecap="round"/></svg>
          <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Buscar lugar..." className="flex-1 outline-none bg-transparent" style={{ fontSize: 14, fontFamily: 'Questrial, sans-serif', color: '#12212E', border: 'none' }}/>
        </div>
      </div>

      {/* Filtros */}
      <div className="flex gap-2 px-5 pt-3">
        <button type="button" onClick={() => setStatusFilter('all')} className="rounded-full px-4 py-2 text-xs font-bold transition" style={{ background: statusFilter === 'all' ? '#12212E' : 'white', color: statusFilter === 'all' ? 'white' : '#12212E', border: 'none', cursor: 'pointer', boxShadow: '0 2px 8px rgba(18,33,46,0.10)', fontFamily: 'Questrial, sans-serif' }}>Todos</button>
        {statuses.map((s) => (
          <button key={s} type="button" onClick={() => setStatusFilter(s)} className="rounded-full px-4 py-2 text-xs font-bold transition" style={{ background: statusFilter === s ? STATUS_META[s].color : 'white', color: statusFilter === s ? 'white' : STATUS_META[s].color, border: 'none', cursor: 'pointer', boxShadow: '0 2px 8px rgba(18,33,46,0.10)', fontFamily: 'Questrial, sans-serif' }}>
            {STATUS_META[s].label}
          </button>
        ))}
      </div>

      {/* Lista */}
      <div className="px-5 pt-4 space-y-3">
        {places.length === 0 && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex flex-col items-center py-14 text-center">
            <div className="mb-4 flex h-20 w-20 items-center justify-center rounded-full" style={{ background: 'rgba(18,33,46,0.07)' }}>
              <svg width="36" height="36" viewBox="0 0 48 48" fill="none" opacity="0.30"><path d="M24 4C16.27 4 10 10.27 10 18c0 10.5 14 26 14 26s14-15.5 14-26c0-7.73-6.27-14-14-14z" fill="#12212E"/><circle cx="24" cy="18" r="5" fill="#12212E" opacity="0.5"/></svg>
            </div>
            <div style={{ color: '#12212E', fontSize: 17, fontWeight: 700, marginBottom: 6 }}>Sin lugares guardados</div>
            <div style={{ color: 'rgba(18,33,46,0.45)', fontSize: 13 }}>Busca y guarda lugares para tu viaje</div>
          </motion.div>
        )}

        <AnimatePresence>
          {places.map((place, i) => {
            const statusMeta = STATUS_META[place.status];
            const catIcon = CAT_ICONS[place.category];
            return (
              <motion.div
                key={place.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, x: 20 }}
                transition={{ delay: i * 0.03 }}
                className="flex items-start gap-3 rounded-3xl p-4"
                style={{ background: 'white', boxShadow: '0 3px 16px rgba(18,33,46,0.08)' }}
              >
                {/* Icono categoría */}
                <div className="flex-shrink-0 flex items-center justify-center rounded-2xl" style={{ width: 48, height: 48, background: 'rgba(48,112,130,0.08)' }}>
                  {catIcon ?? <svg width="18" height="18" viewBox="0 0 48 48" fill="none"><path d="M24 4C16.27 4 10 10.27 10 18c0 10.5 14 26 14 26s14-15.5 14-26c0-7.73-6.27-14-14-14z" fill="#307082"/><circle cx="24" cy="18" r="5" fill="white" fillOpacity="0.7"/></svg>}
                </div>

                <div className="flex-1 min-w-0">
                  <div style={{ color: '#12212E', fontSize: 15, fontWeight: 700 }}>{place.name}</div>
                  {place.address && <div style={{ color: 'rgba(18,33,46,0.45)', fontSize: 12, marginTop: 2 }}>{place.address}</div>}
                  <div className="mt-2 flex flex-wrap items-center gap-2">
                    <span className="rounded-full px-2.5 py-1 text-xs font-bold" style={{ background: statusMeta.bg, color: statusMeta.color }}>{statusMeta.label}</span>
                    <span className="rounded-full px-2.5 py-1 text-xs font-semibold" style={{ background: 'rgba(18,33,46,0.06)', color: 'rgba(18,33,46,0.55)' }}>{CAT_LABEL[place.category]}</span>
                    {place.assignedDayIndex != null && (
                      <span className="rounded-full px-2.5 py-1 text-xs font-semibold" style={{ background: 'rgba(18,33,46,0.06)', color: 'rgba(18,33,46,0.55)' }}>Día {place.assignedDayIndex + 1}</span>
                    )}
                  </div>
                  {place.notes && <div style={{ color: 'rgba(18,33,46,0.45)', fontSize: 12, marginTop: 4, lineHeight: 1.4 }}>{place.notes}</div>}
                </div>

                {/* Acciones */}
                <div className="flex flex-col gap-2 flex-shrink-0">
                  {/* Ciclar estado */}
                  <button
                    type="button"
                    onClick={() => {
                      const next: PlaceStatus = place.status === 'want_to_go' ? 'booked' : place.status === 'booked' ? 'visited' : 'want_to_go';
                      updateSavedPlace(place.id, { status: next });
                    }}
                    className="flex items-center justify-center rounded-full"
                    style={{ width: 32, height: 32, background: statusMeta.bg, border: 'none', cursor: 'pointer' }}
                  >
                    <svg width="13" height="13" viewBox="0 0 48 48" fill="none"><path d="M10 24l10 10 18-18" stroke={statusMeta.color} strokeWidth="4" strokeLinecap="round" strokeLinejoin="round"/></svg>
                  </button>
                  <button type="button" onClick={() => deleteSavedPlace(place.id)} className="flex items-center justify-center rounded-full" style={{ width: 32, height: 32, background: 'rgba(192,57,43,0.07)', border: 'none', cursor: 'pointer' }}>
                    <svg width="13" height="13" viewBox="0 0 48 48" fill="none"><path d="M14 14l20 20M34 14L14 34" stroke="#c0392b" strokeWidth="3.5" strokeLinecap="round"/></svg>
                  </button>
                </div>
              </motion.div>
            );
          })}
        </AnimatePresence>
      </div>

      {/* FAB */}
      <motion.button
        whileTap={{ scale: 0.93 }}
        type="button"
        onClick={() => navigate('/places/add')}
        className="fixed flex items-center gap-2 rounded-full"
        style={{ bottom: 100, right: 24, background: '#307082', color: 'white', border: 'none', padding: '14px 22px', fontWeight: 800, fontSize: 14, cursor: 'pointer', fontFamily: 'Questrial, sans-serif', boxShadow: '0 8px 28px rgba(48,112,130,0.40)' }}
      >
        <svg width="16" height="16" viewBox="0 0 48 48" fill="none"><path d="M24 10v28M10 24h28" stroke="white" strokeWidth="4" strokeLinecap="round"/></svg>
        Añadir lugar
      </motion.button>
    </div>
  );
}
