import { useEffect, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useAppStore } from '../../../app/store/useAppStore';
import type { TransportType } from '../../../types/trip';
import { SUPABASE_URL, supabase } from '../../../services/supabaseClient';

type PlacesPrediction = {
  place_id: string;
  description: string;
  structured_formatting: { main_text: string; secondary_text?: string };
};

function useDebounce<T>(value: T, delay: number): T {
  const [debounced, setDebounced] = useState(value);
  useEffect(() => {
    const t = setTimeout(() => setDebounced(value), delay);
    return () => clearTimeout(t);
  }, [value, delay]);
  return debounced;
}

/* ─── Haversine: distancia en km entre dos puntos ──────────────── */
function haversineKm(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 6371;
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

/** Velocidades promedio por medio de transporte (km/h) */
const SPEED: Record<string, number> = {
  car:   90,
  bus:   70,
  train: 130,
};

function formatDuration(hours: number): string {
  const h = Math.floor(hours);
  const m = Math.round((hours - h) * 60);
  if (h === 0) return `${m} min`;
  if (m === 0) return `${h}h`;
  return `${h}h ${m}min`;
}

/** Tarjeta de tiempo estimado — solo si tenemos origen + destino + transporte terrestre */
function EstimatedTimeCard({ type }: { type: TransportType }) {
  const { t } = useTranslation();
  const draft = useAppStore((s) => s.onboardingDraft);

  if (!['car', 'bus', 'train'].includes(type)) return null;
  if (!draft.originLat || !draft.originLon || !draft.lat || !draft.lon) return null;

  const distKm = haversineKm(draft.originLat, draft.originLon, draft.lat, draft.lon);
  const speed = SPEED[type];
  const hours = distKm / speed;

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      className="flex items-center gap-3 rounded-2xl p-4"
      style={{ background: 'rgba(48,112,130,0.10)', border: '1px solid rgba(48,112,130,0.20)' }}
    >
      <svg width="22" height="22" viewBox="0 0 48 48" fill="none">
        <circle cx="24" cy="24" r="19" fill="#307082" opacity="0.18" />
        <circle cx="24" cy="24" r="14" fill="none" stroke="#307082" strokeWidth="3" />
        <line x1="24" y1="24" x2="24" y2="12" stroke="#307082" strokeWidth="3" strokeLinecap="round" />
        <line x1="24" y1="24" x2="33" y2="29" stroke="#EA9940" strokeWidth="3" strokeLinecap="round" />
      </svg>
      <div>
        <div style={{ color: '#307082', fontSize: 12, fontWeight: 700, textTransform: 'uppercase', letterSpacing: 0.8, fontFamily: 'Questrial, sans-serif' }}>
          {t('transport.estimatedTime')}
        </div>
        <div style={{ color: '#12212E', fontSize: 16, fontWeight: 700, fontFamily: 'Questrial, sans-serif' }}>
          {formatDuration(hours)}
          <span style={{ color: 'rgba(18,33,46,0.45)', fontSize: 12, fontWeight: 400, marginLeft: 6 }}>
            · {Math.round(distKm).toLocaleString()} km
          </span>
        </div>
      </div>
    </motion.div>
  );
}

/* ─── Iconos duotone por transporte ─────────────────────────────── */
function IconFlight() {
  return (
    <svg width="44" height="44" viewBox="0 0 48 48" fill="none">
      {/* fuselaje base naranja */}
      <path d="M6 24l10-4 22-10 4 4-22 10-2 10-6-2 2-6-8-2z" fill="#EA9940" />
      {/* ala glass gris */}
      <path d="M16 20l16-7 3 3-16 7z" fill="rgba(180,192,200,0.55)" />
      {/* cola glass */}
      <path d="M6 24l6 2-2 4z" fill="rgba(180,192,200,0.45)" />
      {/* brillo */}
      <path d="M18 18l14-6" stroke="white" strokeWidth="1.5" strokeLinecap="round" opacity="0.4" />
    </svg>
  );
}

function IconCar() {
  return (
    <svg width="44" height="44" viewBox="0 0 48 48" fill="none">
      {/* carrocería base naranja */}
      <path d="M6 32h36v6a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2v-6z" fill="#EA9940" />
      <path d="M10 32l4-10h20l4 10z" fill="#EA9940" />
      {/* parabrisas glass */}
      <path d="M14 32l3-7h14l3 7z" fill="rgba(180,192,200,0.60)" />
      {/* brillo techo */}
      <path d="M16 25l2-5h12l2 5" fill="rgba(255,255,255,0.20)" />
      {/* ruedas */}
      <circle cx="14" cy="38" r="5" fill="#12212E" />
      <circle cx="14" cy="38" r="2.5" fill="rgba(255,255,255,0.35)" />
      <circle cx="34" cy="38" r="5" fill="#12212E" />
      <circle cx="34" cy="38" r="2.5" fill="rgba(255,255,255,0.35)" />
    </svg>
  );
}

function IconBus() {
  return (
    <svg width="44" height="44" viewBox="0 0 48 48" fill="none">
      {/* cuerpo bus naranja */}
      <rect x="4" y="12" width="40" height="26" rx="5" fill="#EA9940" />
      {/* glass franja ventanas */}
      <rect x="8" y="16" width="32" height="10" rx="3" fill="rgba(180,192,200,0.55)" />
      {/* ventanas individuales */}
      <rect x="10" y="17" width="7" height="8" rx="2" fill="rgba(255,255,255,0.50)" />
      <rect x="20" y="17" width="7" height="8" rx="2" fill="rgba(255,255,255,0.50)" />
      <rect x="30" y="17" width="7" height="8" rx="2" fill="rgba(255,255,255,0.50)" />
      {/* brillo techo */}
      <rect x="4" y="12" width="40" height="7" rx="5" fill="rgba(255,255,255,0.18)" />
      {/* ruedas */}
      <circle cx="13" cy="38" r="5" fill="#12212E" />
      <circle cx="13" cy="38" r="2.5" fill="rgba(255,255,255,0.35)" />
      <circle cx="35" cy="38" r="5" fill="#12212E" />
      <circle cx="35" cy="38" r="2.5" fill="rgba(255,255,255,0.35)" />
    </svg>
  );
}

function IconCruise() {
  return (
    <svg width="44" height="44" viewBox="0 0 48 48" fill="none">
      {/* casco base naranja */}
      <path d="M4 30 Q24 38 44 30 L40 42 Q24 46 8 42z" fill="#EA9940" />
      {/* cubierta glass */}
      <rect x="8" y="18" width="32" height="14" rx="3" fill="rgba(180,192,200,0.55)" />
      {/* superestructura */}
      <rect x="14" y="10" width="20" height="10" rx="3" fill="#EA9940" />
      {/* chimenea */}
      <rect x="21" y="4" width="6" height="8" rx="2" fill="#12212E" />
      {/* brillo */}
      <rect x="8" y="18" width="32" height="6" rx="3" fill="rgba(255,255,255,0.20)" />
      {/* olas */}
      <path d="M2 38 Q12 34 22 38 Q32 42 44 38" stroke="rgba(48,112,130,0.60)" strokeWidth="2" fill="none" strokeLinecap="round" />
    </svg>
  );
}

function IconTrain() {
  return (
    <svg width="44" height="44" viewBox="0 0 48 48" fill="none">
      {/* cuerpo naranja */}
      <rect x="8" y="10" width="32" height="28" rx="8" fill="#EA9940" />
      {/* ventanas glass */}
      <rect x="12" y="14" width="10" height="10" rx="3" fill="rgba(180,192,200,0.60)" />
      <rect x="26" y="14" width="10" height="10" rx="3" fill="rgba(180,192,200,0.60)" />
      {/* brillo superior */}
      <rect x="8" y="10" width="32" height="10" rx="8" fill="rgba(255,255,255,0.22)" />
      {/* franja central */}
      <rect x="8" y="24" width="32" height="5" fill="rgba(18,33,46,0.15)" />
      {/* ruedas */}
      <circle cx="14" cy="40" r="5" fill="#12212E" />
      <circle cx="14" cy="40" r="2.5" fill="rgba(255,255,255,0.35)" />
      <circle cx="34" cy="40" r="5" fill="#12212E" />
      <circle cx="34" cy="40" r="2.5" fill="rgba(255,255,255,0.35)" />
      {/* vía */}
      <rect x="4" y="43" width="40" height="3" rx="1.5" fill="rgba(18,33,46,0.25)" />
    </svg>
  );
}

/* ─── Config de opciones ─────────────────────────────────────────── */
const OPTIONS: Array<{
  value: TransportType;
  labelKey: string;
  descKey: string;
  Icon: () => JSX.Element;
}> = [
  { value: 'flight',  labelKey: 'transport.flight',  descKey: 'transport.flight.desc',  Icon: IconFlight  },
  { value: 'car',     labelKey: 'transport.car',     descKey: 'transport.car.desc',     Icon: IconCar     },
  { value: 'bus',     labelKey: 'transport.bus',     descKey: 'transport.bus.desc',     Icon: IconBus     },
  { value: 'cruise',  labelKey: 'transport.cruise',  descKey: 'transport.cruise.desc',  Icon: IconCruise  },
  { value: 'train',   labelKey: 'transport.train',   descKey: 'transport.train.desc',   Icon: IconTrain   },
];

/* ─── Input neumórfico pequeño ───────────────────────────────────── */
function NeuInput({
  placeholder,
  value,
  onChange,
  label,
}: {
  placeholder: string;
  value: string;
  onChange: (v: string) => void;
  label: string;
}) {
  return (
    <div>
      <label style={{
        display: 'block',
        color: 'rgba(18,33,46,0.50)',
        fontSize: 11,
        fontWeight: 700,
        letterSpacing: 1.2,
        textTransform: 'uppercase',
        marginBottom: 6,
        fontFamily: 'Questrial, sans-serif',
      }}>
        {label}
      </label>
      <div
        className="flex items-center rounded-2xl px-4"
        style={{
          height: 48,
          background: '#ECE7DC',
          boxShadow: 'inset 3px 3px 8px rgba(18,33,46,0.09), inset -2px -2px 6px rgba(255,255,255,0.70)',
        }}
      >
        <input
          type="text"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          style={{
            flex: 1,
            background: 'transparent',
            border: 'none',
            outline: 'none',
            fontSize: 15,
            color: '#12212E',
            fontFamily: 'Questrial, sans-serif',
          }}
        />
      </div>
    </div>
  );
}

/* ─── Airline autocomplete ───────────────────────────────────────── */
const AVIATION_KEY = import.meta.env.VITE_AVIATIONSTACK_KEY as string;

type AirlineSuggestion = { name: string; iata: string };

function AirlineInput({ label, placeholder }: { label: string; placeholder: string }) {
  const setDraft = useAppStore((s) => s.setOnboardingDraft);
  const value = useAppStore((s) => s.onboardingDraft.airline ?? '');
  const [results, setResults] = useState<AirlineSuggestion[]>([]);
  const [open, setOpen] = useState(false);
  const debouncedQ = useDebounce(value, 400);

  useEffect(() => {
    if (debouncedQ.trim().length < 2) { setResults([]); return; }
    void fetch(
      `https://api.aviationstack.com/v1/airlines?access_key=${AVIATION_KEY}&airline_name=${encodeURIComponent(debouncedQ.trim())}&limit=6`
    )
      .then((r) => r.json())
      .then((json: { data?: Array<{ airline_name: string; iata_code: string }> }) => {
        const suggestions = (json.data ?? [])
          .filter((a) => a.airline_name && a.iata_code)
          .map((a) => ({ name: a.airline_name, iata: a.iata_code }));
        setResults(suggestions);
        setOpen(suggestions.length > 0);
      })
      .catch(() => setResults([]));
  }, [debouncedQ]);

  return (
    <div style={{ position: 'relative' }}>
      <label style={{
        display: 'block',
        color: 'rgba(18,33,46,0.50)',
        fontSize: 11,
        fontWeight: 700,
        letterSpacing: 1.2,
        textTransform: 'uppercase',
        marginBottom: 6,
        fontFamily: 'Questrial, sans-serif',
      }}>
        {label}
      </label>
      <div
        className="flex items-center rounded-2xl px-4"
        style={{
          height: 48,
          background: '#ECE7DC',
          boxShadow: 'inset 3px 3px 8px rgba(18,33,46,0.09), inset -2px -2px 6px rgba(255,255,255,0.70)',
        }}
      >
        <input
          type="text"
          value={value}
          onChange={(e) => { setDraft({ airline: e.target.value }); setOpen(false); }}
          onFocus={() => results.length > 0 && setOpen(true)}
          placeholder={placeholder}
          style={{
            flex: 1,
            background: 'transparent',
            border: 'none',
            outline: 'none',
            fontSize: 15,
            color: '#12212E',
            fontFamily: 'Questrial, sans-serif',
          }}
        />
        {value.length > 0 && (
          <button
            type="button"
            onClick={() => { setDraft({ airline: '' }); setResults([]); setOpen(false); }}
            style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 0, color: 'rgba(18,33,46,0.35)' }}
          >✕</button>
        )}
      </div>
      <AnimatePresence>
        {open && results.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: -6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -6 }}
            transition={{ duration: 0.18 }}
            style={{
              position: 'absolute',
              top: '100%',
              left: 0,
              right: 0,
              zIndex: 50,
              background: 'white',
              borderRadius: 16,
              boxShadow: '0 8px 32px rgba(18,33,46,0.14)',
              overflow: 'hidden',
              marginTop: 4,
            }}
          >
            {results.map((a) => (
              <button
                key={a.iata}
                type="button"
                onClick={() => {
                  setDraft({ airline: a.name });
                  setResults([]);
                  setOpen(false);
                }}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 10,
                  width: '100%',
                  padding: '12px 16px',
                  background: 'none',
                  border: 'none',
                  borderBottom: '1px solid rgba(18,33,46,0.06)',
                  cursor: 'pointer',
                  textAlign: 'left',
                }}
              >
                <span style={{
                  background: '#307082',
                  color: 'white',
                  borderRadius: 6,
                  padding: '2px 7px',
                  fontSize: 11,
                  fontWeight: 700,
                  fontFamily: 'Questrial, sans-serif',
                  minWidth: 36,
                  textAlign: 'center',
                }}>
                  {a.iata}
                </span>
                <span style={{ fontSize: 14, color: '#12212E', fontFamily: 'Questrial, sans-serif' }}>
                  {a.name}
                </span>
              </button>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

function OriginCityInput({
  label,
  placeholder,
}: {
  label: string;
  placeholder: string;
}) {
  const { t } = useTranslation();
  const lang = useAppStore((s) => s.currentLanguage);
  const setDraft = useAppStore((s) => s.setOnboardingDraft);
  const draft = useAppStore((s) => s.onboardingDraft);

  const [inputValue, setInputValue] = useState(draft.originCity);
  const [results, setResults] = useState<PlacesPrediction[]>([]);
  const [loading, setLoading] = useState(false);
  const [selected, setSelected] = useState<PlacesPrediction | null>(null);
  const [error, setError] = useState(false);
  const [errorText, setErrorText] = useState<string>('');
  const inputRef = useRef<HTMLInputElement>(null);

  const debouncedQuery = useDebounce(inputValue, 420);

  useEffect(() => {
    setInputValue(draft.originCity);
  }, [draft.originCity]);

  // Clear selection if user edits after picking
  useEffect(() => {
    if (selected && inputValue !== selected.structured_formatting.main_text) {
      setSelected(null);
    }
  }, [inputValue, selected]);

  // Autocomplete
  useEffect(() => {
    if (selected) return;
    if (debouncedQuery.trim().length < 2) {
      setResults([]);
      return;
    }
    setLoading(true);
    setError(false);
    setErrorText('');
    supabase.functions
      .invoke('places-autocomplete', { body: { input: debouncedQuery, language: lang } })
      .then(({ data, error: fnErr }) => {
        if (fnErr) throw fnErr;
        const payload = data as { ok?: boolean; error?: string; predictions?: PlacesPrediction[] } | null;
        if (payload && payload.ok === false) throw new Error(payload.error ?? 'Places error');
        setResults((payload?.predictions ?? []).slice(0, 6));
        setLoading(false);
      })
      .catch((e: unknown) => {
        setError(true);
        setErrorText((e as Error)?.message ?? '');
        setLoading(false);
      });
  }, [debouncedQuery, selected, lang]);

  async function handleSelect(result: PlacesPrediction) {
    setSelected(result);
    setInputValue(result.structured_formatting.main_text);
    setResults([]);
    setError(false);
    setErrorText('');
    setDraft({ originCity: result.structured_formatting.main_text });

    try {
      setLoading(true);
      const { data, error: fnErr } = await supabase.functions.invoke('places-details', {
        body: { place_id: result.place_id, language: lang },
      });
      if (fnErr) throw fnErr;
      const payload = data as { ok?: boolean; error?: string; place?: { lat: number | null; lon: number | null } } | null;
      if (payload && payload.ok === false) throw new Error(payload.error ?? 'Places error');
      const place = payload?.place;
      if (!place || !Number.isFinite(place.lat) || !Number.isFinite(place.lon)) throw new Error('Missing origin geometry');
      setDraft({ originLat: place.lat as number, originLon: place.lon as number });
    } catch (e: unknown) {
      setError(true);
      setErrorText((e as Error)?.message ?? '');
      setDraft({ originLat: 0, originLon: 0 });
    } finally {
      setLoading(false);
    }
  }

  const showDropdown = results.length > 0 && !selected;

  return (
    <div className="relative">
      <label style={{
        display: 'block',
        color: 'rgba(18,33,46,0.50)',
        fontSize: 11,
        fontWeight: 700,
        letterSpacing: 1.2,
        textTransform: 'uppercase',
        marginBottom: 6,
        fontFamily: 'Questrial, sans-serif',
      }}>
        {label}
      </label>

      <div
        className="flex items-center rounded-2xl px-4"
        style={{
          height: 48,
          background: '#ECE7DC',
          boxShadow: 'inset 3px 3px 8px rgba(18,33,46,0.09), inset -2px -2px 6px rgba(255,255,255,0.70)',
        }}
      >
        <input
          ref={inputRef}
          type="text"
          value={inputValue}
          onChange={(e) => {
            const v = e.target.value;
            setInputValue(v);
            setDraft({ originCity: v, originLat: 0, originLon: 0 });
          }}
          placeholder={placeholder}
          style={{
            flex: 1,
            background: 'transparent',
            border: 'none',
            outline: 'none',
            fontSize: 15,
            color: '#12212E',
            fontFamily: 'Questrial, sans-serif',
          }}
        />
        {inputValue.length > 0 && (
          <div style={{ marginLeft: 8 }}>
            {loading ? (
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ repeat: Infinity, duration: 0.8, ease: 'linear' }}
                style={{ width: 16, height: 16, borderRadius: '50%', border: '2px solid #EA9940', borderTopColor: 'transparent' }}
              />
            ) : (
              <button
                type="button"
                onClick={() => {
                  setInputValue('');
                  setResults([]);
                  setSelected(null);
                  setDraft({ originCity: '', originLat: 0, originLon: 0 });
                  inputRef.current?.focus();
                }}
                style={{
                  width: 24,
                  height: 24,
                  borderRadius: 999,
                  background: 'rgba(18,33,46,0.08)',
                  border: 'none',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  cursor: 'pointer',
                }}
              >
                <svg width="10" height="10" viewBox="0 0 48 48" fill="none">
                  <path d="M12 12l24 24M36 12L12 36" stroke="#12212E" strokeWidth="5" strokeLinecap="round" />
                </svg>
              </button>
            )}
          </div>
        )}
      </div>

      <AnimatePresence>
        {showDropdown && (
          <motion.div
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.2 }}
            className="absolute left-0 right-0 top-[calc(100%+6px)] z-20 overflow-hidden rounded-2xl bg-white"
            style={{ boxShadow: '0 10px 30px rgba(18,33,46,0.18)' }}
          >
            {results.map((r, i) => (
              <motion.button
                key={r.place_id}
                type="button"
                initial={{ opacity: 0, x: -8 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.04 }}
                onClick={() => void handleSelect(r)}
                className="flex w-full items-center gap-3 px-4 py-3 text-left transition"
                style={{
                  borderBottom: '1px solid rgba(18,33,46,0.06)',
                }}
              >
                <div className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-xl" style={{ background: 'rgba(48,112,130,0.12)' }}>
                  <svg width="16" height="16" viewBox="0 0 48 48" fill="none">
                    <path d="M24 4C16.3 4 10 10.3 10 18c0 11 14 26 14 26s14-15 14-26c0-7.7-6.3-14-14-14z" fill="#307082" />
                    <path d="M24 4C16.3 4 10 10.3 10 18c0 5 3 10 7 16L24 4z" fill="white" opacity="0.35" />
                    <circle cx="24" cy="18" r="5" fill="white" opacity="0.6" />
                  </svg>
                </div>
                <div style={{ minWidth: 0, flex: 1 }}>
                  <div style={{ color: '#12212E', fontSize: 13, fontWeight: 700, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                    {r.structured_formatting.main_text}
                  </div>
                  <div style={{ color: 'rgba(18,33,46,0.55)', fontSize: 11, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                    {r.structured_formatting.secondary_text || r.description}
                  </div>
                </div>
              </motion.button>
            ))}
          </motion.div>
        )}
      </AnimatePresence>

      {error && (
        <div style={{ marginTop: 6, color: '#EA9940', fontSize: 12, fontWeight: 600 }}>
          {t('onboarding.destination.searchError')}
          {errorText ? (
            <div style={{ marginTop: 4, color: 'rgba(18,33,46,0.55)', fontSize: 10, fontWeight: 600 }}>
              {errorText}
              {SUPABASE_URL ? (
                <div style={{ marginTop: 4 }}>
                  {new URL('/functions/v1/places-autocomplete', SUPABASE_URL).toString()}
                </div>
              ) : null}
            </div>
          ) : null}
        </div>
      )}
    </div>
  );
}

/* ─── SubForm según tipo de transporte ──────────────────────────── */
function TransportSubForm({ type }: { type: TransportType }) {
  const { t } = useTranslation();
  const setDraft = useAppStore((s) => s.setOnboardingDraft);
  const draft = useAppStore((s) => s.onboardingDraft);

  return (
    <motion.div
      key={type}
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -12 }}
      transition={{ duration: 0.3 }}
      className="mt-4 space-y-3 rounded-3xl p-5"
      style={{
        background: 'white',
        boxShadow: '0 4px 20px rgba(18,33,46,0.08)',
      }}
    >
      {type === 'flight' && (
        <>
          <OriginCityInput
            label={t('transport.originCity')}
            placeholder={t('transport.originCity.placeholder')}
          />
          <AirlineInput
            label={t('transport.airline')}
            placeholder={t('transport.airline.placeholder')}
          />
          <NeuInput
            label={t('transport.flightNumber')}
            placeholder={t('transport.flightNumber.placeholder')}
            value={draft.flightNumber}
            onChange={(v) => setDraft({ flightNumber: v })}
          />
          <NeuInput
            label={t('transport.airportCode')}
            placeholder={t('transport.airportCode.placeholder')}
            value={draft.airportCode}
            onChange={(v) => setDraft({ airportCode: v })}
          />
        </>
      )}
      {type === 'car' && (
        <>
          <OriginCityInput
            label={t('transport.originCity')}
            placeholder={t('transport.originCity.placeholder')}
          />
          <EstimatedTimeCard type={type} />
          <div
            className="flex items-center gap-3 rounded-2xl p-4"
            style={{ background: 'rgba(48,112,130,0.08)', border: '1px solid rgba(48,112,130,0.15)' }}
          >
            <svg width="20" height="20" viewBox="0 0 48 48" fill="none">
              <path d="M24 4C16.27 4 10 10.27 10 18c0 10.5 14 26 14 26s14-15.5 14-26c0-7.73-6.27-14-14-14z" fill="#307082" />
              <circle cx="24" cy="18" r="6" fill="rgba(255,255,255,0.50)" />
            </svg>
            <span style={{ color: '#307082', fontSize: 13, fontFamily: 'Questrial, sans-serif' }}>
              {t('transport.car.mapsNote')}
            </span>
          </div>
        </>
      )}
      {type === 'bus' && (
        <>
          <OriginCityInput
            label={t('transport.originCity')}
            placeholder={t('transport.originCity.placeholder')}
          />
          <EstimatedTimeCard type={type} />
          <NeuInput
            label={t('transport.busTerminal')}
            placeholder={t('transport.busTerminal.placeholder')}
            value={draft.busTerminal}
            onChange={(v) => setDraft({ busTerminal: v })}
          />
        </>
      )}
      {type === 'train' && (
        <>
          <OriginCityInput
            label={t('transport.originCity')}
            placeholder={t('transport.originCity.placeholder')}
          />
          <EstimatedTimeCard type={type} />
          <NeuInput
            label={t('transport.trainStation')}
            placeholder={t('transport.trainStation.placeholder')}
            value={draft.trainStation}
            onChange={(v) => setDraft({ trainStation: v })}
          />
        </>
      )}
      {type === 'cruise' && (
        <NeuInput
          label={t('transport.cruisePort')}
          placeholder={t('transport.cruisePort.placeholder')}
          value={draft.cruisePort}
          onChange={(v) => setDraft({ cruisePort: v })}
        />
      )}
    </motion.div>
  );
}

/* ─── Página principal ───────────────────────────────────────────── */
export function TransportPage() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const selected = useAppStore((s) => s.onboardingDraft.transportType);
  const setDraft = useAppStore((s) => s.setOnboardingDraft);

  function handleSelect(val: TransportType) {
    setDraft({ transportType: val });
  }

  function handleContinue() {
    if (!selected) return;
    navigate('/onboarding/smart-detection');
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 24 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
      className="flex min-h-full flex-col px-5 pt-8 pb-10"
      style={{ background: '#ECE7DC' }}
    >
      {/* Header */}
      <div className="mb-6">
        <div
          className="mb-3 inline-flex items-center gap-2 rounded-full px-3 py-1"
          style={{ background: 'rgba(234,153,64,0.12)' }}
        >
          <span style={{ color: '#EA9940', fontSize: 12, fontWeight: 700, fontFamily: 'Questrial, sans-serif' }}>
            {t('onboarding.step', { current: 4, total: 8 })}
          </span>
        </div>
        <h1 style={{
          color: '#12212E',
          fontSize: 26,
          fontWeight: 700,
          lineHeight: 1.15,
          fontFamily: 'Questrial, sans-serif',
        }}>
          {t('transport.title')}
        </h1>
        <p style={{
          color: 'rgba(18,33,46,0.55)',
          fontSize: 14,
          marginTop: 6,
          fontFamily: 'Questrial, sans-serif',
        }}>
          {t('transport.prompt')}
        </p>
      </div>

      {/* Grid de opciones */}
      <div className="grid grid-cols-2 gap-3">
        {OPTIONS.map(({ value, labelKey, descKey, Icon }, i) => {
          const isActive = selected === value;
          return (
            <motion.button
              key={value}
              type="button"
              onClick={() => handleSelect(value)}
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.06 }}
              className="flex flex-col items-center gap-3 rounded-3xl p-4 text-left transition-all active:scale-[0.96]"
              style={{
                background: isActive ? '#12212E' : 'white',
                boxShadow: isActive
                  ? '0 8px 24px rgba(18,33,46,0.25)'
                  : '0 4px 16px rgba(18,33,46,0.08)',
                border: isActive ? '2px solid #EA9940' : '2px solid transparent',
                position: 'relative',
              }}
            >
              {/* Check badge */}
              {isActive && (
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  style={{
                    position: 'absolute',
                    top: 10,
                    right: 10,
                    width: 22,
                    height: 22,
                    borderRadius: '50%',
                    background: '#EA9940',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  <svg width="12" height="12" viewBox="0 0 48 48" fill="none">
                    <path d="M10 24l10 10 18-18" stroke="white" strokeWidth="5" strokeLinecap="round" strokeLinejoin="round" fill="none" />
                  </svg>
                </motion.div>
              )}

              {/* Contenedor ícono */}
              <div
                className="flex items-center justify-center rounded-2xl"
                style={{
                  width: 64,
                  height: 64,
                  background: isActive ? 'rgba(234,153,64,0.15)' : 'rgba(18,33,46,0.05)',
                }}
              >
                <Icon />
              </div>

              <div className="w-full">
                <div style={{
                  color: isActive ? 'white' : '#12212E',
                  fontSize: 14,
                  fontWeight: 700,
                  fontFamily: 'Questrial, sans-serif',
                }}>
                  {t(labelKey)}
                </div>
                <div style={{
                  color: isActive ? 'rgba(255,255,255,0.60)' : 'rgba(18,33,46,0.45)',
                  fontSize: 11,
                  marginTop: 2,
                  fontFamily: 'Questrial, sans-serif',
                }}>
                  {t(descKey)}
                </div>
              </div>
            </motion.button>
          );
        })}
      </div>

      {/* SubForm contextual */}
      <AnimatePresence mode="wait">
        {selected && <TransportSubForm key={selected} type={selected} />}
      </AnimatePresence>

      {/* Botones */}
      <div className="mt-auto pt-8 flex gap-3">
        <button
          type="button"
          onClick={() => navigate(-1)}
          style={{
            flex: 1,
            height: 54,
            borderRadius: 16,
            border: '1.5px solid rgba(18,33,46,0.15)',
            background: 'transparent',
            color: '#12212E',
            fontSize: 15,
            fontWeight: 700,
            fontFamily: 'Questrial, sans-serif',
            cursor: 'pointer',
          }}
        >
          {t('common.back')}
        </button>
        <button
          type="button"
          onClick={handleContinue}
          disabled={!selected}
          style={{
            flex: 2,
            height: 54,
            borderRadius: 16,
            background: selected ? '#EA9940' : 'rgba(18,33,46,0.12)',
            color: selected ? 'white' : 'rgba(18,33,46,0.30)',
            fontSize: 15,
            fontWeight: 700,
            fontFamily: 'Questrial, sans-serif',
            border: 'none',
            cursor: selected ? 'pointer' : 'default',
            boxShadow: selected ? '0 6px 20px rgba(234,153,64,0.35)' : 'none',
            transition: 'all 0.25s ease',
          }}
        >
          {selected ? t('common.continue') : t('transport.selectFirst')}
        </button>
      </div>
    </motion.div>
  );
}
