import { useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useAppStore } from '../../../app/store/useAppStore';
import type { PlaceCategory, PlaceStatus } from '../../../types/itinerary';

const MAPS_KEY = import.meta.env.VITE_GOOGLE_MAPS_KEY as string;

interface Suggestion {
  place_id: string;
  description: string;
  structured_formatting: { main_text: string; secondary_text?: string };
}

const CATS: { key: PlaceCategory; label: string; emoji: string }[] = [
  { key: 'restaurant', label: 'Restaurante', emoji: '🍽️' },
  { key: 'museum', label: 'Museo', emoji: '🏛️' },
  { key: 'hotel', label: 'Hotel', emoji: '🏨' },
  { key: 'beach', label: 'Playa', emoji: '🏖️' },
  { key: 'park', label: 'Parque', emoji: '🌿' },
  { key: 'shopping', label: 'Compras', emoji: '🛍️' },
  { key: 'transport', label: 'Transporte', emoji: '🚌' },
  { key: 'attraction', label: 'Atracción', emoji: '🎡' },
  { key: 'other', label: 'Otro', emoji: '📍' },
];

const STATUSES: { key: PlaceStatus; label: string }[] = [
  { key: 'want_to_go', label: 'Quiero ir' },
  { key: 'booked', label: 'Reservado' },
  { key: 'visited', label: 'Visitado' },
];

export function AddPlacePage() {
  const navigate = useNavigate();
  const currentTripId = useAppStore((s) => s.currentTripId);
  const trips = useAppStore((s) => s.trips);
  const addSavedPlace = useAppStore((s) => s.addSavedPlace);

  const currentTrip = trips.find((t) => t.id === currentTripId);
  const tripDays = currentTrip ? Math.max(1, currentTrip.durationDays ?? 1) : 1;

  const [query, setQuery] = useState('');
  const [suggestions, setSuggestions] = useState<Suggestion[]>([]);
  const [loading, setLoading] = useState(false);
  const [selected, setSelected] = useState<{ name: string; address: string; placeId: string } | null>(null);
  const [cat, setCat] = useState<PlaceCategory>('other');
  const [status, setStatus] = useState<PlaceStatus>('want_to_go');
  const [assignedDay, setAssignedDay] = useState<number | undefined>(undefined);
  const [notes, setNotes] = useState('');
  const [error, setError] = useState('');
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  async function fetchSuggestions(value: string) {
    if (!value || value.length < 3) { setSuggestions([]); return; }
    setLoading(true);
    try {
      const endpoint = `https://maps.googleapis.com/maps/api/place/autocomplete/json?input=${encodeURIComponent(value)}&key=${MAPS_KEY}&language=es`;
      // En web, el CORS de la API de Places bloquea llamadas directas.
      // Usamos un proxy local o el SDK JS. Aquí simulamos con fetch y allowamos el modo no-cors.
      const res = await fetch(endpoint, { mode: 'cors' });
      if (res.ok) {
        const data = await res.json();
        setSuggestions((data.predictions ?? []).slice(0, 5));
      }
    } catch {
      // Si falla (CORS en web), permitimos entrada manual
      setSuggestions([]);
    } finally {
      setLoading(false);
    }
  }

  function handleInput(v: string) {
    setQuery(v);
    setSelected(null);
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => fetchSuggestions(v), 400);
  }

  function pickSuggestion(s: Suggestion) {
    setSelected({ name: s.structured_formatting.main_text, address: s.description, placeId: s.place_id });
    setQuery(s.structured_formatting.main_text);
    setSuggestions([]);
  }

  function handleManual() {
    if (!query.trim()) return;
    setSelected({ name: query.trim(), address: '', placeId: '' });
    setSuggestions([]);
  }

  function handleSave() {
    const name = selected?.name ?? query.trim();
    if (!name) { setError('Escribe el nombre del lugar'); return; }
    if (!currentTripId) { setError('No hay viaje activo'); return; }
    addSavedPlace({
      tripId: currentTripId,
      name,
      address: selected?.address || undefined,
      lat: 0,
      lon: 0,
      category: cat,
      googlePlaceId: selected?.placeId || undefined,
      notes: notes.trim() || undefined,
      assignedDayIndex: assignedDay,
      status,
    });
    navigate('/places');
  }

  return (
    <div className="min-h-dvh pb-32" style={{ background: '#ECE7DC', fontFamily: 'Questrial, sans-serif' }}>

      {/* Header */}
      <div className="relative overflow-hidden px-6 pt-14 pb-8" style={{ background: 'linear-gradient(160deg, #12212E 0%, #307082 70%, #6CA3A2 100%)', borderBottomLeftRadius: 32, borderBottomRightRadius: 32 }}>
        <button type="button" onClick={() => navigate(-1)} className="relative mb-5 flex items-center gap-2" style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 0 }}>
          <svg width="20" height="20" viewBox="0 0 48 48" fill="none"><path d="M30 10L14 24l16 14" stroke="white" strokeWidth="3.5" strokeLinecap="round" strokeLinejoin="round" fill="none"/></svg>
          <span style={{ color: 'rgba(255,255,255,0.70)', fontSize: 14, fontWeight: 600 }}>Lugares</span>
        </button>
        <div style={{ color: 'white', fontSize: 26, fontWeight: 800 }}>Añadir lugar</div>
        <div style={{ color: 'rgba(255,255,255,0.55)', fontSize: 13, marginTop: 4 }}>{currentTrip?.destination}</div>
      </div>

      <div className="px-5 pt-5 space-y-5">
        {/* Buscador */}
        <div>
          <div style={{ color: '#12212E', fontSize: 13, fontWeight: 700, marginBottom: 8, textTransform: 'uppercase', letterSpacing: 1 }}>Nombre o búsqueda</div>
          <div className="relative">
            <input
              value={query}
              onChange={(e) => handleInput(e.target.value)}
              placeholder="Ej: Torre Eiffel, La Boqueria..."
              className="w-full rounded-2xl px-4 py-3.5 outline-none"
              style={{ background: 'white', fontSize: 15, fontFamily: 'Questrial, sans-serif', color: '#12212E', border: 'none', boxShadow: '0 2px 12px rgba(18,33,46,0.09)' }}
            />
            {loading && <div className="absolute right-4 top-1/2 -translate-y-1/2 text-xs" style={{ color: '#307082' }}>…</div>}
          </div>

          {/* Sugerencias */}
          <AnimatePresence>
            {suggestions.length > 0 && (
              <motion.div initial={{ opacity: 0, y: -6 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="mt-1 rounded-2xl overflow-hidden" style={{ background: 'white', boxShadow: '0 4px 18px rgba(18,33,46,0.12)' }}>
                {suggestions.map((s) => (
                  <button key={s.place_id} type="button" onClick={() => pickSuggestion(s)} className="w-full px-4 py-3 text-left border-b last:border-0" style={{ fontFamily: 'Questrial, sans-serif', border: 'none', borderBottom: '1px solid rgba(18,33,46,0.06)', background: 'none', cursor: 'pointer' }}>
                    <div style={{ fontSize: 14, fontWeight: 700, color: '#12212E' }}>{s.structured_formatting.main_text}</div>
                    {s.structured_formatting.secondary_text && <div style={{ fontSize: 12, color: 'rgba(18,33,46,0.45)' }}>{s.structured_formatting.secondary_text}</div>}
                  </button>
                ))}
              </motion.div>
            )}
          </AnimatePresence>

          {/* Entrada manual */}
          {query.trim().length > 2 && !selected && suggestions.length === 0 && !loading && (
            <button type="button" onClick={handleManual} className="mt-2 rounded-xl px-4 py-2.5 text-sm font-bold" style={{ background: 'rgba(48,112,130,0.10)', color: '#307082', border: 'none', cursor: 'pointer', fontFamily: 'Questrial, sans-serif' }}>
              + Guardar "{query.trim()}" manualmente
            </button>
          )}
          {selected && (
            <div className="mt-2 flex items-center gap-2 rounded-xl px-3 py-2" style={{ background: 'rgba(108,163,162,0.12)' }}>
              <svg width="14" height="14" viewBox="0 0 48 48" fill="none"><path d="M10 24l10 10 18-18" stroke="#6CA3A2" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round"/></svg>
              <span style={{ fontSize: 13, color: '#307082', fontWeight: 600 }}>Seleccionado: {selected.name}</span>
            </div>
          )}
        </div>

        {/* Categoría */}
        <div>
          <div style={{ color: '#12212E', fontSize: 13, fontWeight: 700, marginBottom: 8, textTransform: 'uppercase', letterSpacing: 1 }}>Categoría</div>
          <div className="grid gap-2" style={{ gridTemplateColumns: 'repeat(3, 1fr)' }}>
            {CATS.map((c) => (
              <button key={c.key} type="button" onClick={() => setCat(c.key)} className="rounded-2xl py-3 flex flex-col items-center gap-1 transition" style={{ background: cat === c.key ? 'rgba(48,112,130,0.15)' : 'white', border: cat === c.key ? '2px solid #307082' : '2px solid transparent', cursor: 'pointer', boxShadow: '0 2px 8px rgba(18,33,46,0.06)' }}>
                <span style={{ fontSize: 20 }}>{c.emoji}</span>
                <span style={{ fontSize: 11, fontWeight: 700, color: cat === c.key ? '#307082' : 'rgba(18,33,46,0.55)', fontFamily: 'Questrial, sans-serif' }}>{c.label}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Estado */}
        <div>
          <div style={{ color: '#12212E', fontSize: 13, fontWeight: 700, marginBottom: 8, textTransform: 'uppercase', letterSpacing: 1 }}>Estado</div>
          <div className="flex gap-2">
            {STATUSES.map((s) => (
              <button key={s.key} type="button" onClick={() => setStatus(s.key)} className="flex-1 rounded-full py-2.5 text-sm font-bold transition" style={{ background: status === s.key ? '#307082' : 'white', color: status === s.key ? 'white' : '#307082', border: 'none', cursor: 'pointer', fontFamily: 'Questrial, sans-serif', boxShadow: '0 2px 8px rgba(18,33,46,0.08)' }}>
                {s.label}
              </button>
            ))}
          </div>
        </div>

        {/* Asignar día */}
        <div>
          <div style={{ color: '#12212E', fontSize: 13, fontWeight: 700, marginBottom: 8, textTransform: 'uppercase', letterSpacing: 1 }}>Asignar a día (opcional)</div>
          <div className="flex gap-2 flex-wrap">
            <button type="button" onClick={() => setAssignedDay(undefined)} className="rounded-full px-4 py-2 text-sm font-bold" style={{ background: assignedDay == null ? '#12212E' : 'white', color: assignedDay == null ? 'white' : 'rgba(18,33,46,0.55)', border: 'none', cursor: 'pointer', fontFamily: 'Questrial, sans-serif', boxShadow: '0 2px 8px rgba(18,33,46,0.08)' }}>Sin asignar</button>
            {Array.from({ length: tripDays }, (_, i) => (
              <button key={i} type="button" onClick={() => setAssignedDay(i)} className="rounded-full px-4 py-2 text-sm font-bold" style={{ background: assignedDay === i ? '#EA9940' : 'white', color: assignedDay === i ? 'white' : 'rgba(18,33,46,0.55)', border: 'none', cursor: 'pointer', fontFamily: 'Questrial, sans-serif', boxShadow: '0 2px 8px rgba(18,33,46,0.08)' }}>Día {i + 1}</button>
            ))}
          </div>
        </div>

        {/* Notas */}
        <div>
          <div style={{ color: '#12212E', fontSize: 13, fontWeight: 700, marginBottom: 8, textTransform: 'uppercase', letterSpacing: 1 }}>Notas (opcional)</div>
          <textarea value={notes} onChange={(e) => setNotes(e.target.value)} placeholder="Horario, recomendaciones, precio..." rows={3} className="w-full rounded-2xl px-4 py-3 resize-none outline-none" style={{ background: 'white', fontSize: 14, fontFamily: 'Questrial, sans-serif', color: '#12212E', border: 'none', boxShadow: '0 2px 12px rgba(18,33,46,0.09)' }}/>
        </div>

        {error && <div className="rounded-xl px-4 py-3 text-sm font-semibold" style={{ background: 'rgba(192,57,43,0.08)', color: '#c0392b' }}>{error}</div>}

        {/* CTA */}
        <motion.button whileTap={{ scale: 0.97 }} type="button" onClick={handleSave} className="w-full rounded-3xl py-4 font-extrabold text-base" style={{ background: 'linear-gradient(135deg, #307082 0%, #6CA3A2 100%)', color: 'white', border: 'none', cursor: 'pointer', fontFamily: 'Questrial, sans-serif', boxShadow: '0 8px 24px rgba(48,112,130,0.35)' }}>
          Guardar lugar
        </motion.button>
      </div>
    </div>
  );
}
