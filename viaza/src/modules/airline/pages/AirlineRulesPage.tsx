import { useEffect, useMemo, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { motion, AnimatePresence } from 'framer-motion';
import { fetchFlightInfo, flightStatusColor, flightStatusLabel, type FlightInfo } from '../services/airlineService';
import { airlineRules } from '../utils/airlineRulesData';

/* ─── Helpers de formato ─────────────────────────────────────────── */
function formatTime(iso: string) {
  if (!iso) return '--:--';
  try {
    return new Date(iso).toLocaleTimeString('es-MX', { hour: '2-digit', minute: '2-digit' });
  } catch { return '--:--'; }
}
function formatDate(iso: string) {
  if (!iso) return '';
  try {
    return new Date(iso).toLocaleDateString('es-MX', { day: 'numeric', month: 'short' });
  } catch { return ''; }
}

/* ─── Ícono avión ────────────────────────────────────────────────── */
function IconPlane({ size = 24 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 48 48" fill="none">
      <path d="M6 24l10-4 22-10 4 4-22 10-2 10-6-2 2-6-8-2z" fill="#EA9940" />
      <path d="M16 20l16-7 3 3-16 7z" fill="rgba(180,192,200,0.55)" />
      <path d="M6 24l6 2-2 4z" fill="rgba(180,192,200,0.45)" />
    </svg>
  );
}

/* ─── Ícono maleta ───────────────────────────────────────────────── */
function IconBag({ size = 24 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 48 48" fill="none">
      <rect x="8" y="18" width="32" height="24" rx="5" fill="#EA9940" />
      <rect x="8" y="18" width="32" height="10" rx="5" fill="rgba(180,192,200,0.55)" />
      <rect x="16" y="10" width="16" height="10" rx="4" fill="none" stroke="#12212E" strokeWidth="2.5" />
      <rect x="20" y="27" width="8" height="6" rx="2" fill="rgba(255,255,255,0.35)" />
    </svg>
  );
}

/* ─── Badge de status ────────────────────────────────────────────── */
function StatusBadge({ status }: { status: FlightInfo['status'] }) {
  return (
    <span style={{
      display: 'inline-block',
      padding: '3px 10px',
      borderRadius: 99,
      fontSize: 11,
      fontWeight: 700,
      letterSpacing: 0.8,
      fontFamily: 'Questrial, sans-serif',
      background: flightStatusColor(status) + '22',
      color: flightStatusColor(status),
      border: `1px solid ${flightStatusColor(status)}44`,
    }}>
      {flightStatusLabel(status)}
    </span>
  );
}

/* ─── Tarjeta de vuelo ───────────────────────────────────────────── */
function FlightCard({ info }: { info: FlightInfo }) {
  const { t } = useTranslation();
  const hasDelay = (info.departure.delayMinutes ?? 0) > 0;
  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
      style={{
        background: '#12212E',
        borderRadius: 24,
        padding: '24px 20px',
        boxShadow: '0 8px 32px rgba(18,33,46,0.22)',
        overflow: 'hidden',
        position: 'relative',
      }}
    >
      {/* glow fondo */}
      <div style={{
        position: 'absolute', top: -40, right: -40,
        width: 160, height: 160, borderRadius: '50%',
        background: 'radial-gradient(circle, rgba(234,153,64,0.18) 0%, transparent 70%)',
        pointerEvents: 'none',
      }} />

      {/* aerolínea + vuelo */}
      <div className="flex items-center justify-between mb-5">
        <div>
          <div style={{ color: 'rgba(236,231,220,0.55)', fontSize: 11, fontWeight: 700, letterSpacing: 1.2, fontFamily: 'Questrial, sans-serif', textTransform: 'uppercase' }}>
            {info.airline}
          </div>
          <div style={{ color: '#ECE7DC', fontSize: 22, fontWeight: 700, fontFamily: 'Questrial, sans-serif', marginTop: 2 }}>
            {info.flightNumber}
          </div>
        </div>
        <StatusBadge status={info.status} />
      </div>

      {/* ruta: origen → destino */}
      <div className="flex items-center gap-3">
        {/* origen */}
        <div className="flex-1">
          <div style={{ color: '#ECE7DC', fontSize: 28, fontWeight: 700, fontFamily: 'Questrial, sans-serif', lineHeight: 1 }}>
            {info.departure.iata}
          </div>
          <div style={{ color: 'rgba(236,231,220,0.50)', fontSize: 12, fontFamily: 'Questrial, sans-serif', marginTop: 4 }}>
            {info.departure.airport.length > 18 ? info.departure.airport.slice(0, 18) + '…' : info.departure.airport}
          </div>
          <div style={{ color: '#EA9940', fontSize: 18, fontWeight: 700, fontFamily: 'Questrial, sans-serif', marginTop: 6 }}>
            {formatTime(info.departure.estimatedLocal ?? info.departure.scheduledLocal)}
          </div>
          <div style={{ color: 'rgba(236,231,220,0.40)', fontSize: 11, fontFamily: 'Questrial, sans-serif' }}>
            {formatDate(info.departure.scheduledLocal)}
          </div>
        </div>

        {/* flecha */}
        <div className="flex flex-col items-center gap-1 flex-shrink-0">
          <div style={{ height: 1, width: 48, background: 'rgba(236,231,220,0.18)' }} />
          <IconPlane size={20} />
          <div style={{ height: 1, width: 48, background: 'rgba(236,231,220,0.18)' }} />
        </div>

        {/* destino */}
        <div className="flex-1 text-right">
          <div style={{ color: '#ECE7DC', fontSize: 28, fontWeight: 700, fontFamily: 'Questrial, sans-serif', lineHeight: 1 }}>
            {info.arrival.iata}
          </div>
          <div style={{ color: 'rgba(236,231,220,0.50)', fontSize: 12, fontFamily: 'Questrial, sans-serif', marginTop: 4 }}>
            {info.arrival.airport.length > 18 ? info.arrival.airport.slice(0, 18) + '…' : info.arrival.airport}
          </div>
          <div style={{ color: '#EA9940', fontSize: 18, fontWeight: 700, fontFamily: 'Questrial, sans-serif', marginTop: 6 }}>
            {formatTime(info.arrival.estimatedLocal ?? info.arrival.scheduledLocal)}
          </div>
          <div style={{ color: 'rgba(236,231,220,0.40)', fontSize: 11, fontFamily: 'Questrial, sans-serif' }}>
            {formatDate(info.arrival.scheduledLocal)}
          </div>
        </div>
      </div>

      {/* terminal + gate */}
      {(info.departure.terminal ?? info.departure.gate ?? info.arrival.terminal ?? info.arrival.gate) && (
        <div className="flex gap-4 mt-5 pt-4" style={{ borderTop: '1px solid rgba(255,255,255,0.07)' }}>
          {info.departure.terminal && (
            <div>
              <div style={{ color: 'rgba(236,231,220,0.40)', fontSize: 10, fontWeight: 700, letterSpacing: 1, textTransform: 'uppercase', fontFamily: 'Questrial, sans-serif' }}>{t('airline.terminal.departure')}</div>
              <div style={{ color: '#ECE7DC', fontSize: 15, fontWeight: 700, fontFamily: 'Questrial, sans-serif', marginTop: 2 }}>{info.departure.terminal}</div>
            </div>
          )}
          {info.departure.gate && (
            <div>
              <div style={{ color: 'rgba(236,231,220,0.40)', fontSize: 10, fontWeight: 700, letterSpacing: 1, textTransform: 'uppercase', fontFamily: 'Questrial, sans-serif' }}>{t('airline.gate')}</div>
              <div style={{ color: '#ECE7DC', fontSize: 15, fontWeight: 700, fontFamily: 'Questrial, sans-serif', marginTop: 2 }}>{info.departure.gate}</div>
            </div>
          )}
          {info.arrival.terminal && (
            <div>
              <div style={{ color: 'rgba(236,231,220,0.40)', fontSize: 10, fontWeight: 700, letterSpacing: 1, textTransform: 'uppercase', fontFamily: 'Questrial, sans-serif' }}>{t('airline.terminal.arrival')}</div>
              <div style={{ color: '#ECE7DC', fontSize: 15, fontWeight: 700, fontFamily: 'Questrial, sans-serif', marginTop: 2 }}>{info.arrival.terminal}</div>
            </div>
          )}
        </div>
      )}

      {/* delay warning */}
      {hasDelay && (
        <div className="flex items-center gap-2 mt-4 rounded-2xl p-3" style={{ background: 'rgba(234,153,64,0.12)', border: '1px solid rgba(234,153,64,0.25)' }}>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
            <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-2h2v2zm0-4h-2V7h2v6z" fill="#EA9940" />
          </svg>
          <span style={{ color: '#EA9940', fontSize: 12, fontFamily: 'Questrial, sans-serif', fontWeight: 600 }}>
            Retraso de {info.departure.delayMinutes} min
          </span>
        </div>
      )}
    </motion.div>
  );
}

/* ─── Tab equipaje ───────────────────────────────────────────────── */
function BaggageTab() {
  const { t } = useTranslation();
  const [selected, setSelected] = useState(airlineRules[0]?.airline ?? '');
  const rule = useMemo(() => airlineRules.find((r) => r.airline === selected) ?? null, [selected]);

  return (
    <div className="space-y-4">
      {/* selector aerolínea */}
      <div style={{ background: 'white', borderRadius: 20, padding: '16px 18px', boxShadow: '0 2px 12px rgba(18,33,46,0.07)' }}>
        <div style={{ color: 'rgba(18,33,46,0.45)', fontSize: 11, fontWeight: 700, letterSpacing: 1.2, textTransform: 'uppercase', fontFamily: 'Questrial, sans-serif', marginBottom: 10 }}>
          Selecciona aerolínea
        </div>
        <div className="flex flex-wrap gap-2">
          {airlineRules.map((a) => {
            const active = a.airline === selected;
            return (
              <button
                key={a.airline}
                onClick={() => setSelected(a.airline)}
                style={{
                  padding: '8px 14px',
                  borderRadius: 99,
                  border: active ? '1.5px solid #EA9940' : '1.5px solid rgba(18,33,46,0.10)',
                  background: active ? '#12212E' : 'transparent',
                  color: active ? '#ECE7DC' : 'rgba(18,33,46,0.60)',
                  fontSize: 13,
                  fontWeight: 600,
                  fontFamily: 'Questrial, sans-serif',
                  cursor: 'pointer',
                  transition: 'all 0.2s',
                }}
              >
                {a.airline}
              </button>
            );
          })}
        </div>
      </div>

      {/* reglas */}
      {rule && (
        <motion.div
          key={rule.airline}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
          style={{ background: 'white', borderRadius: 20, padding: '18px', boxShadow: '0 2px 12px rgba(18,33,46,0.07)' }}
        >
          <div style={{ color: '#12212E', fontSize: 16, fontWeight: 700, fontFamily: 'Questrial, sans-serif', marginBottom: 14 }}>
            {rule.airline}
          </div>
          <div className="grid grid-cols-2 gap-3">
            {[
              { label: t('airline.carryOnWeight'), value: rule.carryOnWeightKg ? `${rule.carryOnWeightKg} kg` : null },
              { label: t('airline.checkedBagWeight'), value: rule.checkedBagWeightKg ? `${rule.checkedBagWeightKg} kg` : null },
              { label: t('airline.carryOnSize'), value: rule.carryOnSize ?? null },
              { label: t('airline.personalItemSize'), value: rule.personalItemSize ?? null },
            ].map((item) => (
              <div key={item.label} style={{
                background: '#ECE7DC',
                borderRadius: 14,
                padding: '12px 14px',
                opacity: item.value ? 1 : 0.4,
              }}>
                <div style={{ color: 'rgba(18,33,46,0.45)', fontSize: 10, fontWeight: 700, letterSpacing: 1, textTransform: 'uppercase', fontFamily: 'Questrial, sans-serif' }}>
                  {item.label}
                </div>
                <div style={{ color: '#12212E', fontSize: 15, fontWeight: 700, fontFamily: 'Questrial, sans-serif', marginTop: 4 }}>
                  {item.value ?? '—'}
                </div>
              </div>
            ))}
          </div>

          {rule.notesKeys?.length ? (
            <div className="mt-4 space-y-2">
              {rule.notesKeys.map((k) => (
                <div key={k} className="flex items-start gap-2" style={{
                  background: 'rgba(48,112,130,0.07)',
                  borderRadius: 12,
                  padding: '10px 12px',
                  border: '1px solid rgba(48,112,130,0.12)',
                }}>
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" style={{ marginTop: 1, flexShrink: 0 }}>
                    <circle cx="12" cy="12" r="10" fill="#307082" opacity="0.15" />
                    <path d="M12 8v5M12 16h.01" stroke="#307082" strokeWidth="2" strokeLinecap="round" />
                  </svg>
                  <span style={{ color: '#307082', fontSize: 12, fontFamily: 'Questrial, sans-serif' }}>
                    {t(k)}
                  </span>
                </div>
              ))}
            </div>
          ) : null}
        </motion.div>
      )}
    </div>
  );
}

/* ─── Tab vuelo en tiempo real ───────────────────────────────────── */
function FlightLiveTab() {
  const [query, setQuery] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<FlightInfo | null>(null);
  const [error, setError] = useState<string | null>(null);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    const trimmed = query.trim().replace(/\s/g, '');
    if (trimmed.length < 4) { setResult(null); setError(null); return; }

    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(async () => {
      setLoading(true);
      setError(null);
      setResult(null);
      const info = await fetchFlightInfo(trimmed);
      setLoading(false);
      if (!info) {
        setError('No encontramos ese vuelo. Verifica el número e intenta de nuevo.');
      } else {
        setResult(info);
      }
    }, 700);

    return () => { if (debounceRef.current) clearTimeout(debounceRef.current); };
  }, [query]);

  return (
    <div className="space-y-4">
      {/* input número de vuelo */}
      <div style={{ background: 'white', borderRadius: 20, padding: '16px 18px', boxShadow: '0 2px 12px rgba(18,33,46,0.07)' }}>
        <div style={{ color: 'rgba(18,33,46,0.45)', fontSize: 11, fontWeight: 700, letterSpacing: 1.2, textTransform: 'uppercase', fontFamily: 'Questrial, sans-serif', marginBottom: 10 }}>
          Número de vuelo
        </div>
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: 12,
          background: '#ECE7DC',
          borderRadius: 16,
          padding: '0 16px',
          height: 52,
          boxShadow: 'inset 3px 3px 8px rgba(18,33,46,0.09), inset -2px -2px 6px rgba(255,255,255,0.70)',
        }}>
          <IconPlane size={20} />
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value.toUpperCase())}
            placeholder="Ej: AM401, AA123, AM 650"
            style={{
              flex: 1,
              background: 'transparent',
              border: 'none',
              outline: 'none',
              fontSize: 16,
              fontWeight: 700,
              color: '#12212E',
              fontFamily: 'Questrial, sans-serif',
              letterSpacing: 1.5,
            }}
          />
          {loading && (
            <div style={{
              width: 18, height: 18, borderRadius: '50%',
              border: '2px solid rgba(18,33,46,0.12)',
              borderTopColor: '#EA9940',
              animation: 'spin 0.8s linear infinite',
              flexShrink: 0,
            }} />
          )}
        </div>
        <div style={{ color: 'rgba(18,33,46,0.35)', fontSize: 11, fontFamily: 'Questrial, sans-serif', marginTop: 8 }}>
          Escribe el número y buscaremos en tiempo real
        </div>
      </div>

      <AnimatePresence mode="wait">
        {loading && (
          <motion.div key="loading"
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            style={{ textAlign: 'center', padding: '32px 0' }}
          >
            <div style={{ color: 'rgba(18,33,46,0.35)', fontSize: 13, fontFamily: 'Questrial, sans-serif' }}>
              Buscando vuelo…
            </div>
          </motion.div>
        )}

        {!loading && error && (
          <motion.div key="error"
            initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
            style={{
              background: 'rgba(192,57,43,0.08)',
              border: '1px solid rgba(192,57,43,0.18)',
              borderRadius: 16,
              padding: '14px 16px',
              display: 'flex',
              alignItems: 'center',
              gap: 10,
            }}
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
              <circle cx="12" cy="12" r="10" fill="rgba(234,153,64,0.15)" />
              <path d="M15 9l-6 6M9 9l6 6" stroke="#EA9940" strokeWidth="2" strokeLinecap="round" />
            </svg>
            <span style={{ color: '#EA9940', fontSize: 13, fontFamily: 'Questrial, sans-serif' }}>{error}</span>
          </motion.div>
        )}

        {!loading && result && (
          <motion.div key="result" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
            <FlightCard info={result} />
          </motion.div>
        )}

        {!loading && !result && !error && (
          <motion.div key="empty"
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            style={{ textAlign: 'center', padding: '40px 0' }}
          >
            <IconPlane size={48} />
            <div style={{ color: 'rgba(18,33,46,0.30)', fontSize: 14, fontFamily: 'Questrial, sans-serif', marginTop: 12 }}>
              Ingresa un número de vuelo para rastrearlo
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );
}

/* ─── Página principal ───────────────────────────────────────────── */
export function AirlineRulesPage() {
  const [tab, setTab] = useState<'flight' | 'baggage'>('flight');

  const TABS: Array<{ id: 'flight' | 'baggage'; label: string; Icon: typeof IconPlane }> = [
    { id: 'flight',   label: 'Mi vuelo',  Icon: IconPlane },
    { id: 'baggage',  label: 'Equipaje',  Icon: IconBag   },
  ];

  return (
    <div style={{ minHeight: '100vh', background: '#ECE7DC', paddingBottom: 96 }}>

      {/* Header */}
      <div style={{
        background: '#12212E',
        padding: '56px 20px 24px',
        position: 'relative',
        overflow: 'hidden',
      }}>
        {/* glow */}
        <div style={{
          position: 'absolute', top: -60, right: -60,
          width: 200, height: 200, borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(234,153,64,0.20) 0%, transparent 70%)',
          pointerEvents: 'none',
        }} />
        <div style={{ color: 'rgba(236,231,220,0.50)', fontSize: 11, fontWeight: 700, letterSpacing: 2, textTransform: 'uppercase', fontFamily: 'Questrial, sans-serif', marginBottom: 4 }}>
          VIAZA
        </div>
        <div style={{ color: '#ECE7DC', fontSize: 26, fontWeight: 700, fontFamily: 'Questrial, sans-serif' }}>
          Aerolíneas
        </div>
        <div style={{ color: 'rgba(236,231,220,0.45)', fontSize: 14, fontFamily: 'Questrial, sans-serif', marginTop: 4 }}>
          Vuelos en tiempo real y reglas de equipaje
        </div>

        {/* tabs */}
        <div className="flex gap-2 mt-6">
          {TABS.map(({ id, label, Icon }) => {
            const active = tab === id;
            return (
              <button
                key={id}
                onClick={() => setTab(id)}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 7,
                  padding: '9px 18px',
                  borderRadius: 99,
                  border: 'none',
                  background: active ? '#EA9940' : 'rgba(255,255,255,0.08)',
                  color: active ? '#12212E' : 'rgba(236,231,220,0.55)',
                  fontSize: 13,
                  fontWeight: 700,
                  fontFamily: 'Questrial, sans-serif',
                  cursor: 'pointer',
                  transition: 'all 0.22s',
                }}
              >
                <Icon size={16} />
                {label}
              </button>
            );
          })}
        </div>
      </div>

      {/* contenido */}
      <div style={{ padding: '20px 16px' }}>
        <AnimatePresence mode="wait">
          {tab === 'flight' ? (
            <motion.div key="flight" initial={{ opacity: 0, x: -16 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 16 }} transition={{ duration: 0.28 }}>
              <FlightLiveTab />
            </motion.div>
          ) : (
            <motion.div key="baggage" initial={{ opacity: 0, x: 16 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -16 }} transition={{ duration: 0.28 }}>
              <BaggageTab />
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}

