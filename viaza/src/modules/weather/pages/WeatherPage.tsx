// src/modules/weather/pages/WeatherPage.tsx
// Weather Intelligence — pronóstico por día del viaje + motor Plan B + sugerencias de ropa
//
// PALETA OFICIAL (INMUTABLE):
//   Primary    #12212E   Secondary  #307082
//   Soft Teal  #6CA3A2   Background #ECE7DC   Accent #EA9940
//
// CERO emojis · CERO colores fuera de paleta

import { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useAppStore } from '../../../app/store/useAppStore';
import { fetchWeatherCache } from '../../../services/weatherCacheService';
import type { WeatherForecastDailyEntry } from '../../../types/trip';

const P = {
  primary:    '#12212E',
  secondary:  '#307082',
  softTeal:   '#6CA3A2',
  background: '#ECE7DC',
  accent:     '#EA9940',
  muted:      'rgba(18,33,46,0.50)',
  border:     'rgba(18,33,46,0.10)',
  card:       'white',
} as const;

// ─── Íconos ───────────────────────────────────────────────────────────────────

function IconBack() {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke={P.primary} strokeWidth="2.2" strokeLinecap="round">
      <path d="M19 12H5M12 19l-7-7 7-7"/>
    </svg>
  );
}

function IconSun() {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke={P.accent} strokeWidth="2" strokeLinecap="round">
      <circle cx="12" cy="12" r="5"/>
      <line x1="12" y1="1" x2="12" y2="3"/><line x1="12" y1="21" x2="12" y2="23"/>
      <line x1="4.22" y1="4.22" x2="5.64" y2="5.64"/><line x1="18.36" y1="18.36" x2="19.78" y2="19.78"/>
      <line x1="1" y1="12" x2="3" y2="12"/><line x1="21" y1="12" x2="23" y2="12"/>
      <line x1="4.22" y1="19.78" x2="5.64" y2="18.36"/><line x1="18.36" y1="5.64" x2="19.78" y2="4.22"/>
    </svg>
  );
}

function IconRain() {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke={P.secondary} strokeWidth="2" strokeLinecap="round">
      <line x1="16" y1="13" x2="16" y2="21"/><line x1="8" y1="13" x2="8" y2="21"/>
      <line x1="12" y1="15" x2="12" y2="23"/>
      <path d="M20 16.58A5 5 0 0 0 18 7h-1.26A8 8 0 1 0 4 15.25"/>
    </svg>
  );
}

function IconCloud() {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke={P.softTeal} strokeWidth="2" strokeLinecap="round">
      <path d="M18 10h-1.26A8 8 0 1 0 9 20h9a5 5 0 0 0 0-10z"/>
    </svg>
  );
}

function IconCold() {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke={P.secondary} strokeWidth="2" strokeLinecap="round">
      <polyline points="23 4 23 10 17 10"/><path d="M20.49 15a9 9 0 1 1-2.12-9.36L23 10"/>
    </svg>
  );
}

function IconAlert() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke={P.accent} strokeWidth="2" strokeLinecap="round">
      <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/>
      <line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/>
    </svg>
  );
}

function IconShirt() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke={P.softTeal} strokeWidth="2" strokeLinecap="round">
      <path d="M20.38 3.46L16 2a4 4 0 0 1-8 0L3.62 3.46a2 2 0 0 0-1.34 2.23l.58 3.57a1 1 0 0 0 .99.84H6v10c0 1.1.9 2 2 2h8a2 2 0 0 0 2-2V10h2.15a1 1 0 0 0 .99-.84l.58-3.57a2 2 0 0 0-1.34-2.23z"/>
    </svg>
  );
}

// ─── Helpers ─────────────────────────────────────────────────────────────────

function formatShortDate(iso: string): string {
  const d = new Date(`${iso}T12:00:00`);
  return d.toLocaleDateString('es-MX', { weekday: 'short', day: 'numeric', month: 'short' });
}

function formatLong(iso: string): string {
  const d = new Date(`${iso}T12:00:00`);
  return d.toLocaleDateString('es-MX', { weekday: 'long', day: 'numeric', month: 'long' });
}

// ─── Clasificación de clima ───────────────────────────────────────────────────

type WeatherClass = 'sun_hot' | 'sun' | 'partly_cloudy' | 'rain' | 'cold';

function classifyDay(maxC: number, minC: number, rainProb: number): WeatherClass {
  if (rainProb >= 65) return 'rain';
  if (maxC >= 30) return 'sun_hot';
  if (maxC >= 22) return 'sun';
  if (maxC >= 12) return 'partly_cloudy';
  return 'cold';
}

function weatherLabel(wc: WeatherClass): string {
  switch (wc) {
    case 'sun_hot':      return 'Calor intenso';
    case 'sun':          return 'Soleado';
    case 'partly_cloudy': return 'Parcialmente nublado';
    case 'rain':         return 'Lluvioso';
    case 'cold':         return 'Frío';
  }
}

function WeatherIcon({ wc, size = 22 }: { wc: WeatherClass; size?: number }) {
  if (wc === 'rain') return <IconRain />;
  if (wc === 'sun_hot' || wc === 'sun') return <IconSun />;
  if (wc === 'cold') return <IconCold />;
  return <IconCloud />;
}

// ─── Sugerencias de ropa ─────────────────────────────────────────────────────

function clothingSuggestions(wc: WeatherClass, maxC: number): string[] {
  if (wc === 'rain') return [
    'Impermeable o poncho ligero',
    'Zapatos cerrados impermeables',
    'Paraguas compacto en bolso de mano',
    'Capa extra si baja de 20°C',
  ];
  if (wc === 'sun_hot') return [
    `Ropa ligera y transpirable (${maxC}°C esperados)`,
    'Protector solar mínimo SPF 50',
    'Sombrero o gorra de ala ancha',
    'Botella de agua y electrolitos',
  ];
  if (wc === 'sun') return [
    'Ropa de verano cómoda',
    'Capa ligera para la tarde-noche',
    'Protector solar SPF 30+',
    'Gafas de sol',
  ];
  if (wc === 'cold') return [
    `Abrigo o chamarra (min ${maxC}°C)`,
    'Capas térmicas bajo la ropa',
    'Guantes y bufanda si baja de 5°C',
    'Zapatos cerrados con suela antiderrapante',
  ];
  return [
    'Capas ligeras combinables',
    'Capa intermedia para la mañana/noche',
    'Cómodo para caminar todo el día',
  ];
}

// ─── Motor Plan B ─────────────────────────────────────────────────────────────

interface PlanBAlert {
  date: string;
  type: 'rain_activity' | 'heat_outdoor' | 'cold_beach';
  message: string;
  suggestion: string;
}

function generatePlanBAlerts(days: ProcessedDay[]): PlanBAlert[] {
  const alerts: PlanBAlert[] = [];
  for (const d of days) {
    if (d.wc === 'rain' && d.rainProb >= 70) {
      alerts.push({
        date: d.date,
        type: 'rain_activity',
        message: `${formatShortDate(d.date)}: ${d.rainProb}% probabilidad de lluvia`,
        suggestion: 'Planifica actividades bajo techo. Museos, mercados cubiertos o gastronomía local.',
      });
    }
    if (d.wc === 'sun_hot' && d.maxTemp >= 33) {
      alerts.push({
        date: d.date,
        type: 'heat_outdoor',
        message: `${formatShortDate(d.date)}: hasta ${d.maxTemp}°C`,
        suggestion: 'Actividades al aire libre antes de las 10am o después de las 5pm. Hidratación constante.',
      });
    }
    if (d.wc === 'cold' && d.minTemp <= 3) {
      alerts.push({
        date: d.date,
        type: 'cold_beach',
        message: `${formatShortDate(d.date)}: mínima ${d.minTemp}°C`,
        suggestion: 'Abrigo de abrigo completo. Cafés y restaurantes con calefacción como puntos de descanso.',
      });
    }
  }
  return alerts;
}

// ─── Procesado de día ─────────────────────────────────────────────────────────

interface ProcessedDay {
  date: string;
  maxTemp: number;
  minTemp: number;
  morningTemp: number;
  afternoonTemp: number;
  nightTemp: number;
  rainProb: number;
  wc: WeatherClass;
}

function processEntries(entries: WeatherForecastDailyEntry[]): ProcessedDay[] {
  return entries.map(e => {
    const temps = [e.morning.temp_avg, e.afternoon.temp_avg, e.night.temp_avg].filter((x): x is number => typeof x === 'number');
    const maxTemp = temps.length ? Math.round(Math.max(...temps)) : 0;
    const minTemp = temps.length ? Math.round(Math.min(...temps)) : 0;
    const rainProb = Math.round(Math.max(
      e.morning.rain_prob_max ?? 0,
      e.afternoon.rain_prob_max ?? 0,
      e.night.rain_prob_max ?? 0,
    ));
    return {
      date: e.date,
      maxTemp,
      minTemp,
      morningTemp: Math.round(e.morning.temp_avg ?? maxTemp),
      afternoonTemp: Math.round(e.afternoon.temp_avg ?? maxTemp),
      nightTemp: Math.round(e.night.temp_avg ?? minTemp),
      rainProb,
      wc: classifyDay(maxTemp, minTemp, rainProb),
    };
  });
}

// ─── Componente día ───────────────────────────────────────────────────────────

function DayCard({ day, expanded, onToggle }: { day: ProcessedDay; expanded: boolean; onToggle: () => void }) {
  const clothes = clothingSuggestions(day.wc, day.maxTemp);
  const bgColor = day.wc === 'rain'
    ? 'rgba(48,112,130,0.07)'
    : day.wc === 'sun_hot'
    ? 'rgba(234,153,64,0.08)'
    : P.card;

  return (
    <motion.div
      layout
      style={{ background: bgColor, borderRadius: 16, overflow: 'hidden', border: `1px solid ${P.border}` }}
    >
      <button
        type="button"
        onClick={onToggle}
        style={{
          width: '100%', background: 'none', border: 'none', cursor: 'pointer',
          padding: '14px 16px', textAlign: 'left',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <WeatherIcon wc={day.wc} />
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: 14, fontWeight: 700, color: P.primary }}>{formatShortDate(day.date)}</div>
            <div style={{ fontSize: 12, color: P.muted }}>{weatherLabel(day.wc)}</div>
          </div>
          <div style={{ textAlign: 'right' }}>
            <span style={{ fontSize: 20, fontWeight: 900, color: P.primary }}>{day.maxTemp}°</span>
            <span style={{ fontSize: 14, color: P.muted }}> / {day.minTemp}°</span>
          </div>
          {day.rainProb >= 40 && (
            <div style={{ fontSize: 11, fontWeight: 700, color: P.secondary, background: 'rgba(48,112,130,0.12)', borderRadius: 6, padding: '2px 7px' }}>
              {day.rainProb}% lluvia
            </div>
          )}
        </div>
      </button>

      {expanded && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: 'auto' }}
          exit={{ opacity: 0, height: 0 }}
          style={{ padding: '0 16px 16px' }}
        >
          {/* Franja horaria */}
          <div style={{ display: 'flex', gap: 8, marginBottom: 14 }}>
            {[
              { label: 'Manana', temp: day.morningTemp },
              { label: 'Tarde', temp: day.afternoonTemp },
              { label: 'Noche', temp: day.nightTemp },
            ].map(h => (
              <div key={h.label} style={{ flex: 1, background: 'rgba(18,33,46,0.05)', borderRadius: 10, padding: '8px', textAlign: 'center' }}>
                <div style={{ fontSize: 10, color: P.muted, marginBottom: 3 }}>{h.label.toUpperCase()}</div>
                <div style={{ fontSize: 16, fontWeight: 800, color: P.primary }}>{h.temp}°</div>
              </div>
            ))}
          </div>

          {/* Sugerencias de ropa */}
          <div style={{ borderTop: `1px solid ${P.border}`, paddingTop: 12 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 8 }}>
              <IconShirt />
              <span style={{ fontSize: 12, fontWeight: 700, color: P.muted, letterSpacing: 0.6, textTransform: 'uppercase' }}>Sugerencias</span>
            </div>
            {clothes.map((c, i) => (
              <div key={i} style={{ display: 'flex', gap: 8, alignItems: 'flex-start', padding: '4px 0' }}>
                <div style={{ width: 5, height: 5, borderRadius: '50%', background: P.softTeal, marginTop: 5, flexShrink: 0 }}/>
                <span style={{ fontSize: 13, color: P.primary, lineHeight: 1.5 }}>{c}</span>
              </div>
            ))}
          </div>
        </motion.div>
      )}
    </motion.div>
  );
}

// ─── Página principal ─────────────────────────────────────────────────────────

export function WeatherPage() {
  const navigate = useNavigate();
  const trip = useAppStore(s => s.trips.find(t => t.id === s.currentTripId) ?? null);

  const [days, setDays] = useState<ProcessedDay[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [expandedDate, setExpandedDate] = useState<string | null>(null);

  useEffect(() => {
    if (!trip) { setLoading(false); return; }

    // Coordenadas del DESTINO (lat/lon), no del origen
    const destLat = trip.lat;
    const destLon = trip.lon;

    async function load() {
      let lat = destLat;
      let lon = destLon;

      // Si el viaje no tiene coordenadas guardadas, geocodificamos el nombre del destino
      if (!lat || !lon) {
        try {
          const geo = await fetch(
            `https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(trip!.destination)}&count=1&language=es&format=json`
          );
          const geoJson = await geo.json() as { results?: { latitude: number; longitude: number }[] };
          const r = geoJson.results?.[0];
          if (r) { lat = r.latitude; lon = r.longitude; }
        } catch { /* ignorar — intentará con coords en 0 */ }
      }

      if (!lat || !lon) {
        setError('No hay coordenadas para este destino.');
        setLoading(false);
        return;
      }

      fetchWeatherCache({
        tripId: trip!.id,
        lat,
        lon,
        startDate: trip!.startDate ?? new Date().toISOString().slice(0, 10),
        endDate: trip!.endDate ?? new Date(Date.now() + 7 * 86400000).toISOString().slice(0, 10),
        timezone: 'auto',
      })
        .then(entries => {
          setDays(processEntries(entries));
          setLoading(false);
        })
        .catch(err => {
          setError(err instanceof Error ? err.message : 'Error al cargar el clima');
          setLoading(false);
        });
    }

    void load();
  }, [trip]);

  const planBAlerts = useMemo(() => generatePlanBAlerts(days), [days]);

  // Resumen global
  const rainyDays = days.filter(d => d.wc === 'rain').length;
  const avgMax = days.length ? Math.round(days.reduce((s, d) => s + d.maxTemp, 0) / days.length) : 0;
  const dominantWc = days.length
    ? (['rain', 'sun_hot', 'sun', 'partly_cloudy', 'cold'] as WeatherClass[]).find(
        wc => days.filter(d => d.wc === wc).length >= days.length / 2
      ) ?? days[0].wc
    : 'sun';

  return (
    <div style={{ minHeight: '100vh', background: P.background, fontFamily: 'Questrial, sans-serif' }}>
      {/* Header */}
      <div style={{ position: 'sticky', top: 0, zIndex: 50, background: P.background, padding: '18px 20px 16px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <button type="button" onClick={() => navigate(-1)} style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 4 }}>
            <IconBack />
          </button>
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: 20, fontWeight: 800, color: P.primary }}>Clima del viaje</div>
            <div style={{ fontSize: 12, color: P.muted }}>
              {trip?.destination ?? 'Destino'} · {days.length} días
            </div>
          </div>
          <IconSun />
        </div>
      </div>

      <div style={{ padding: '0 20px 100px', display: 'flex', flexDirection: 'column', gap: 16 }}>

        {/* Loading */}
        {loading && (
          <div style={{ textAlign: 'center', padding: '40px 0' }}>
            <div style={{ width: 36, height: 36, borderRadius: '50%', border: `3px solid ${P.border}`, borderTopColor: P.secondary, margin: '0 auto 12px', animation: 'spin 0.8s linear infinite' }}/>
            <div style={{ fontSize: 14, color: P.muted }}>Cargando pronóstico...</div>
          </div>
        )}

        {/* Error */}
        {!loading && error && (
          <div style={{ background: 'rgba(234,153,64,0.12)', border: `1px solid rgba(234,153,64,0.3)`, borderRadius: 14, padding: '16px', fontSize: 14, color: P.primary }}>
            No se pudo cargar el pronóstico. Verifica tu conexión e intenta de nuevo.
          </div>
        )}

        {/* Resumen global */}
        {!loading && !error && days.length > 0 && (
          <div style={{
            background: P.card, borderRadius: 18, padding: '18px',
            boxShadow: '0 2px 12px rgba(18,33,46,0.06)',
          }}>
            <div style={{ fontSize: 13, fontWeight: 700, color: P.muted, letterSpacing: 0.8, textTransform: 'uppercase', marginBottom: 14 }}>Resumen del viaje</div>
            <div style={{ display: 'flex', gap: 10 }}>
              <div style={{ flex: 1, background: 'rgba(18,33,46,0.04)', borderRadius: 12, padding: '12px', textAlign: 'center' }}>
                <div style={{ fontSize: 28, fontWeight: 900, color: P.primary }}>{avgMax}°C</div>
                <div style={{ fontSize: 11, color: P.muted, marginTop: 2 }}>Temp. promedio</div>
              </div>
              <div style={{ flex: 1, background: 'rgba(18,33,46,0.04)', borderRadius: 12, padding: '12px', textAlign: 'center' }}>
                <div style={{ fontSize: 28, fontWeight: 900, color: rainyDays > 0 ? P.secondary : P.accent }}>{rainyDays}</div>
                <div style={{ fontSize: 11, color: P.muted, marginTop: 2 }}>Días con lluvia</div>
              </div>
              <div style={{ flex: 1, background: 'rgba(18,33,46,0.04)', borderRadius: 12, padding: '12px', textAlign: 'center' }}>
                <div style={{ marginBottom: 4, display: 'flex', justifyContent: 'center' }}><WeatherIcon wc={dominantWc} size={24} /></div>
                <div style={{ fontSize: 11, color: P.muted }}>{weatherLabel(dominantWc)}</div>
              </div>
            </div>
          </div>
        )}

        {/* Alertas Plan B */}
        {!loading && planBAlerts.length > 0 && (
          <div style={{ background: P.card, borderRadius: 18, padding: '18px', boxShadow: '0 2px 12px rgba(18,33,46,0.06)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 14 }}>
              <IconAlert />
              <span style={{ fontSize: 15, fontWeight: 800, color: P.primary }}>Plan B recomendado</span>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              {planBAlerts.map((alert, i) => (
                <div key={i} style={{
                  background: 'rgba(234,153,64,0.08)', border: `1px solid rgba(234,153,64,0.25)`,
                  borderRadius: 12, padding: '12px 14px',
                }}>
                  <div style={{ fontSize: 13, fontWeight: 700, color: P.accent, marginBottom: 4 }}>{alert.message}</div>
                  <div style={{ fontSize: 13, color: P.primary, lineHeight: 1.5 }}>{alert.suggestion}</div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Lista de días */}
        {!loading && !error && days.length > 0 && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            <div style={{ fontSize: 13, fontWeight: 700, color: P.muted, letterSpacing: 0.8, textTransform: 'uppercase', marginBottom: 4 }}>
              Pronóstico día a día
            </div>
            {days.map(day => (
              <DayCard
                key={day.date}
                day={day}
                expanded={expandedDate === day.date}
                onToggle={() => setExpandedDate(prev => prev === day.date ? null : day.date)}
              />
            ))}
          </div>
        )}

        {/* Sin datos */}
        {!loading && !error && days.length === 0 && (
          <div style={{ textAlign: 'center', padding: '40px 0', color: P.muted, fontSize: 14 }}>
            No hay datos de pronóstico disponibles para este viaje.
          </div>
        )}

        {/* Leyenda */}
        {!loading && days.length > 0 && (
          <div style={{ background: P.card, borderRadius: 18, padding: '16px 18px', boxShadow: '0 2px 12px rgba(18,33,46,0.06)' }}>
            <div style={{ fontSize: 12, color: P.muted, lineHeight: 1.6 }}>
              Datos de Open-Meteo (gratuito, sin clave). Pronóstico actualizado cada vez que abres esta pantalla.
              Toca cada día para ver sugerencias de ropa.
            </div>
          </div>
        )}

      </div>

      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );
}
