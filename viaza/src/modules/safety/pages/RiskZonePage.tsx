/**
 * RiskZonePage.tsx
 * Página completa de Zonas de Riesgo del destino del viaje.
 *
 * Muestra:
 *  - Nivel de riesgo general del país (en tiempo real vía TravelAdvisory.info)
 *  - Zonas urbanas específicas a evitar o cuidar (base curada)
 *  - Riesgos naturales del destino según temporada
 *  - Tips de seguridad accionables específicos para ese destino
 *  - Número de emergencias local
 *  - Acceso rápido a Maps/Waze con destino marcado
 *
 * Paleta: #12212E | #307082 | #6CA3A2 | #ECE7DC | #EA9940
 */
import { useState, useEffect, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { AppHeader } from '../../../components/ui/AppHeader';
import { AppCard } from '../../../components/ui/AppCard';
import { AppButton } from '../../../components/ui/AppButton';
import { useAppStore } from '../../../app/store/useAppStore';
import {
  findCityRiskProfile,
  detectCountryFromDestination,
  COUNTRY_RISK_LEVELS,
  type CityRiskProfile,
  type RiskLevel,
} from '../data/urbanRiskZones';

// ─── Paleta ───────────────────────────────────────────────────────────────────
const P = {
  primary:    '#12212E',
  secondary:  '#307082',
  softTeal:   '#6CA3A2',
  background: '#ECE7DC',
  accent:     '#EA9940',
} as const;

// ─── Colores por nivel de riesgo ──────────────────────────────────────────────
const LEVEL_CONFIG: Record<RiskLevel, { color: string; bg: string; label: string; icon: string }> = {
  1: { color: P.softTeal,  bg: `${P.softTeal}20`,  label: 'Precaución',     icon: 'ℹ' },
  2: { color: P.accent,    bg: `${P.accent}20`,    label: 'Mayor cuidado',  icon: '▲' },
  3: { color: '#D97706',   bg: '#D9770620',         label: 'Evitar de noche', icon: '!' },
  4: { color: P.primary,   bg: `${P.primary}E0`,   label: 'Evitar',         icon: '✕' },
};

// ─── TravelAdvisory.info API (por país) ───────────────────────────────────────
// Devuelve un advisory score 0-5 que mapeamos a nuestros niveles 1-4.
interface AdvisoryResult {
  score: number;
  message: string;
  updated: string;
  source: string;
}

async function fetchCountryAdvisory(countryCode: string): Promise<AdvisoryResult | null> {
  try {
    const res = await fetch(
      `https://www.travel-advisory.info/api?countrycode=${countryCode.toLowerCase()}`,
      { signal: AbortSignal.timeout(8000) }
    );
    if (!res.ok) return null;
    const json = await res.json() as {
      data?: Record<string, { advisory?: { score: number; message: string; updated: string; source: string } }>;
    };
    const entry = json.data?.[countryCode.toUpperCase()]?.advisory;
    if (!entry) return null;
    return {
      score: entry.score,
      message: entry.message,
      updated: entry.updated,
      source: entry.source,
    };
  } catch {
    return null;
  }
}

function advisoryScoreToLevel(score: number): RiskLevel {
  if (score >= 4) return 4;
  if (score >= 3) return 3;
  if (score >= 2) return 2;
  return 1;
}

// ─── Iconos ───────────────────────────────────────────────────────────────────
function ShieldIcon({ color }: { color: string }) {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 2L3 7v5c0 5.25 3.75 10.15 9 11.25C17.25 22.15 21 17.25 21 12V7L12 2z"/>
    </svg>
  );
}

function AlertIcon({ color }: { color: string }) {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round">
      <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/>
      <line x1="12" y1="9" x2="12" y2="13"/>
      <line x1="12" y1="17" x2="12.01" y2="17"/>
    </svg>
  );
}

function MountainIcon({ color }: { color: string }) {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M8 3L2 21h20L14 3l-3 5-3-5z"/>
    </svg>
  );
}

function PhoneIcon({ color }: { color: string }) {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round">
      <path d="M22 16.92v3a2 2 0 0 1-2.18 2A19.79 19.79 0 0 1 3.09 4.2 2 2 0 0 1 5.07 2h3a2 2 0 0 1 2 1.72c.127.96.361 1.903.7 2.81a2 2 0 0 1-.45 2.11L9.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0 1 22 16.92z"/>
    </svg>
  );
}

function MapIcon({ color }: { color: string }) {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <polygon points="1,6 1,22 8,18 16,22 23,18 23,2 16,6 8,2"/>
      <line x1="8" y1="2" x2="8" y2="18"/>
      <line x1="16" y1="6" x2="16" y2="22"/>
    </svg>
  );
}

// ─── Componente principal ─────────────────────────────────────────────────────
export function RiskZonePage() {
  const { t: _t } = useTranslation();
  const currentTripId = useAppStore((s) => s.currentTripId);
  const trip = useAppStore((s) => s.trips.find((x) => x.id === currentTripId) ?? null);

  const [advisory, setAdvisory] = useState<AdvisoryResult | null>(null);
  const [advisoryLoading, setAdvisoryLoading] = useState(false);
  const [advisoryError, setAdvisoryError] = useState(false);
  const [expandedZone, setExpandedZone] = useState<string | null>(null);

  const destination = trip?.destination ?? '';
  const countryCode = useMemo(() => detectCountryFromDestination(destination), [destination]);
  const cityProfile = useMemo<CityRiskProfile | null>(() => findCityRiskProfile(destination), [destination]);
  const countryFallback = countryCode ? COUNTRY_RISK_LEVELS[countryCode] ?? null : null;

  // Nivel general: prioridad advisory en tiempo real > perfil ciudad > fallback país
  const advisoryLevel = advisory ? advisoryScoreToLevel(advisory.score) : null;
  const overallLevel: RiskLevel = advisoryLevel ?? cityProfile?.overallLevel ?? countryFallback?.level ?? 1;
  const emergencyNumber = cityProfile?.emergencyNumber ?? countryFallback?.emergencyNumber ?? '911';
  const levelConfig = LEVEL_CONFIG[overallLevel];

  useEffect(() => {
    if (!countryCode) return;
    setAdvisoryLoading(true);
    setAdvisoryError(false);
    fetchCountryAdvisory(countryCode)
      .then((result) => {
        setAdvisory(result);
        if (!result) setAdvisoryError(true);
      })
      .catch(() => setAdvisoryError(true))
      .finally(() => setAdvisoryLoading(false));
  }, [countryCode]);

  const typeIcon = (type: string) => {
    if (type === 'natural') return <MountainIcon color={P.accent} />;
    if (type === 'road') return (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke={P.accent} strokeWidth="2" strokeLinecap="round">
        <path d="M12 2L8 22M16 2l-4 20M4 8h16M4 16h16"/>
      </svg>
    );
    if (type === 'scam') return (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke={P.accent} strokeWidth="2" strokeLinecap="round">
        <circle cx="12" cy="12" r="10"/>
        <path d="M12 8v4M12 16h.01"/>
      </svg>
    );
    return <AlertIcon color={P.accent} />;
  };

  if (!trip) {
    return (
      <div className="px-4 pt-4 pb-24">
        <AppHeader title="Zonas de Riesgo" />
        <AppCard className="mt-4">
          <p style={{ fontSize: 14, color: `${P.primary}99` }}>
            Abre un viaje para ver el análisis de riesgo del destino.
          </p>
        </AppCard>
      </div>
    );
  }

  return (
    <div className="px-4 pt-4 pb-24" style={{ background: P.background, minHeight: '100vh' }}>
      <AppHeader title="Zonas de Riesgo" />

      {/* ── Nivel general ───────────────────────────────────────────────── */}
      <div
        style={{
          marginTop: 16,
          background: overallLevel === 4 ? P.primary : levelConfig.bg,
          border: `1.5px solid ${overallLevel === 4 ? P.primary : levelConfig.color + '40'}`,
          borderRadius: 16,
          padding: '16px 18px',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <ShieldIcon color={overallLevel === 4 ? P.accent : levelConfig.color} />
          <div style={{ flex: 1 }}>
            <div style={{
              fontSize: 11,
              fontWeight: 700,
              letterSpacing: 1.2,
              textTransform: 'uppercase',
              color: overallLevel === 4 ? P.accent : levelConfig.color,
              marginBottom: 2,
            }}>
              Nivel de riesgo — {cityProfile?.cityLabel ?? destination}
            </div>
            <div style={{
              fontSize: 22,
              fontWeight: 900,
              color: overallLevel === 4 ? '#FFFFFF' : P.primary,
              lineHeight: 1.1,
            }}>
              {levelConfig.label}
            </div>
          </div>
          <div style={{
            width: 48, height: 48, borderRadius: 12,
            background: overallLevel === 4 ? `${P.accent}30` : `${levelConfig.color}25`,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: 22, fontWeight: 900,
            color: overallLevel === 4 ? P.accent : levelConfig.color,
          }}>
            {overallLevel}
          </div>
        </div>

        {/* Advisory en tiempo real */}
        {advisoryLoading && (
          <div style={{ marginTop: 10, fontSize: 12, color: overallLevel === 4 ? 'rgba(255,255,255,0.5)' : `${P.primary}60` }}>
            Consultando advisory oficial...
          </div>
        )}
        {advisory && !advisoryLoading && (
          <div style={{ marginTop: 10, fontSize: 12, color: overallLevel === 4 ? 'rgba(255,255,255,0.75)' : `${P.primary}90`, lineHeight: 1.5 }}>
            {advisory.message}
            <span style={{ display: 'block', marginTop: 4, fontSize: 11, opacity: 0.6 }}>
              Fuente: {advisory.source} · {new Date(advisory.updated).toLocaleDateString('es')}
            </span>
          </div>
        )}
        {advisoryError && !advisoryLoading && countryFallback && (
          <div style={{ marginTop: 10, fontSize: 12, color: overallLevel === 4 ? 'rgba(255,255,255,0.75)' : `${P.primary}90`, lineHeight: 1.5 }}>
            {countryFallback.tip}
          </div>
        )}
      </div>

      {/* ── Número de emergencias ────────────────────────────────────────── */}
      <div style={{ marginTop: 12, display: 'flex', gap: 10 }}>
        <a
          href={`tel:${emergencyNumber}`}
          style={{
            flex: 1,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: 8,
            background: '#DC262620',
            border: '1.5px solid #DC262640',
            borderRadius: 12,
            padding: '12px 16px',
            textDecoration: 'none',
          }}
        >
          <PhoneIcon color="#DC2626" />
          <span style={{ fontSize: 14, fontWeight: 800, color: '#DC2626' }}>
            Emergencias: {emergencyNumber}
          </span>
        </a>
        <a
          href={`https://maps.google.com/?q=${encodeURIComponent(destination)}`}
          target="_blank"
          rel="noopener noreferrer"
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: 6,
            background: `${P.secondary}15`,
            border: `1.5px solid ${P.secondary}30`,
            borderRadius: 12,
            padding: '12px 16px',
            textDecoration: 'none',
          }}
        >
          <MapIcon color={P.secondary} />
          <span style={{ fontSize: 13, fontWeight: 700, color: P.secondary }}>Maps</span>
        </a>
      </div>

      {/* ── Zonas específicas ────────────────────────────────────────────── */}
      {cityProfile && cityProfile.zones.length > 0 && (
        <div style={{ marginTop: 20 }}>
          <div style={{ fontSize: 13, fontWeight: 800, color: P.primary, marginBottom: 10, letterSpacing: 0.3 }}>
            ZONAS A CONSIDERAR
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {cityProfile.zones.map((zone) => {
              const cfg = LEVEL_CONFIG[zone.level];
              const isExpanded = expandedZone === zone.name;
              const isDark = zone.level === 4;
              return (
                <button
                  key={zone.name}
                  type="button"
                  onClick={() => setExpandedZone(isExpanded ? null : zone.name)}
                  style={{
                    background: isDark ? P.primary : cfg.bg,
                    border: `1.5px solid ${isDark ? P.primary : cfg.color + '40'}`,
                    borderRadius: 12,
                    padding: '12px 14px',
                    textAlign: 'left',
                    cursor: 'pointer',
                    width: '100%',
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    {typeIcon(zone.type)}
                    <div style={{ flex: 1 }}>
                      <div style={{
                        fontSize: 13, fontWeight: 700,
                        color: isDark ? '#FFFFFF' : P.primary,
                      }}>
                        {zone.name}
                      </div>
                      <div style={{
                        fontSize: 11, fontWeight: 600,
                        color: isDark ? P.accent : cfg.color,
                        marginTop: 1,
                      }}>
                        {cfg.label} · {zone.type === 'urban' ? 'Zona urbana' : zone.type === 'natural' ? 'Riesgo natural' : zone.type === 'road' ? 'Ruta/carretera' : 'Estafa frecuente'}
                      </div>
                    </div>
                    <svg
                      width="16" height="16" viewBox="0 0 24 24"
                      fill="none" stroke={isDark ? 'rgba(255,255,255,0.4)' : `${P.primary}50`}
                      strokeWidth="2" strokeLinecap="round"
                      style={{ transform: isExpanded ? 'rotate(180deg)' : 'none', transition: 'transform 0.2s', flexShrink: 0 }}
                    >
                      <polyline points="6,9 12,15 18,9"/>
                    </svg>
                  </div>
                  {isExpanded && (
                    <div style={{
                      marginTop: 10,
                      fontSize: 13,
                      lineHeight: 1.6,
                      color: isDark ? 'rgba(255,255,255,0.80)' : `${P.primary}CC`,
                      borderTop: `1px solid ${isDark ? 'rgba(255,255,255,0.1)' : `${P.primary}15`}`,
                      paddingTop: 10,
                    }}>
                      {zone.tip}
                    </div>
                  )}
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* ── Riesgos naturales ────────────────────────────────────────────── */}
      {cityProfile && cityProfile.naturalRisks.length > 0 && (
        <div style={{ marginTop: 20 }}>
          <div style={{ fontSize: 13, fontWeight: 800, color: P.primary, marginBottom: 10, letterSpacing: 0.3 }}>
            RIESGOS NATURALES Y CLIMÁTICOS
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {cityProfile.naturalRisks.map((risk) => {
              const cfg = LEVEL_CONFIG[risk.level];
              return (
                <div
                  key={risk.name}
                  style={{
                    background: '#FFFFFF',
                    borderRadius: 12,
                    border: `1px solid ${P.primary}12`,
                    padding: '12px 14px',
                    boxShadow: '0 1px 4px rgba(18,33,46,0.06)',
                  }}
                >
                  <div style={{ display: 'flex', gap: 10, alignItems: 'flex-start' }}>
                    <MountainIcon color={cfg.color} />
                    <div style={{ flex: 1 }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 6, flexWrap: 'wrap' }}>
                        <span style={{ fontSize: 13, fontWeight: 700, color: P.primary }}>{risk.name}</span>
                        {risk.season && (
                          <span style={{
                            fontSize: 10, fontWeight: 700,
                            background: `${cfg.color}20`, color: cfg.color,
                            borderRadius: 6, padding: '2px 7px',
                          }}>
                            {risk.season}
                          </span>
                        )}
                      </div>
                      <div style={{ marginTop: 5, fontSize: 12, color: `${P.primary}99`, lineHeight: 1.6 }}>
                        {risk.tip}
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* ── Tips de seguridad accionables ────────────────────────────────── */}
      {cityProfile && cityProfile.safetyTips.length > 0 && (
        <div style={{ marginTop: 20 }}>
          <div style={{ fontSize: 13, fontWeight: 800, color: P.primary, marginBottom: 10, letterSpacing: 0.3 }}>
            CONSEJOS CLAVE PARA ESTE DESTINO
          </div>
          <div style={{
            background: '#FFFFFF',
            borderRadius: 14,
            border: `1px solid ${P.primary}12`,
            boxShadow: '0 1px 4px rgba(18,33,46,0.06)',
            overflow: 'hidden',
          }}>
            {cityProfile.safetyTips.map((tip, i) => (
              <div
                key={i}
                style={{
                  display: 'flex', gap: 10, alignItems: 'flex-start',
                  padding: '12px 14px',
                  borderBottom: i < cityProfile.safetyTips.length - 1 ? `1px solid ${P.primary}10` : 'none',
                }}
              >
                <div style={{
                  width: 22, height: 22, borderRadius: 11, flexShrink: 0,
                  background: `${P.secondary}20`,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: 11, fontWeight: 900, color: P.secondary,
                }}>
                  {i + 1}
                </div>
                <div style={{ fontSize: 13, color: P.primary, lineHeight: 1.6, flex: 1 }}>
                  {tip}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ── Sin datos de ciudad específica ────────────────────────────────── */}
      {!cityProfile && countryFallback && (
        <div style={{ marginTop: 20 }}>
          <div style={{
            background: '#FFFFFF', borderRadius: 14,
            border: `1px solid ${P.primary}12`,
            boxShadow: '0 1px 4px rgba(18,33,46,0.06)',
            padding: '14px 16px',
          }}>
            <div style={{ fontSize: 13, fontWeight: 700, color: P.primary, marginBottom: 6 }}>
              Información general del país
            </div>
            <div style={{ fontSize: 13, color: `${P.primary}99`, lineHeight: 1.6 }}>
              {countryFallback.tip}
            </div>
            <div style={{ marginTop: 10, fontSize: 12, color: `${P.primary}70` }}>
              No tenemos perfil de riesgo específico para "{destination}". Mostramos el nivel país.
              En próximas versiones agregaremos más ciudades.
            </div>
          </div>
        </div>
      )}

      {/* ── Sin destino con datos ─────────────────────────────────────────── */}
      {!cityProfile && !countryFallback && (
        <div style={{ marginTop: 20 }}>
          <div style={{
            background: '#FFFFFF', borderRadius: 14,
            border: `1px solid ${P.primary}12`,
            boxShadow: '0 1px 4px rgba(18,33,46,0.06)',
            padding: '14px 16px',
          }}>
            <div style={{ fontSize: 13, fontWeight: 700, color: P.primary, marginBottom: 6 }}>
              Destino sin datos de riesgo
            </div>
            <div style={{ fontSize: 13, color: `${P.primary}99`, lineHeight: 1.6 }}>
              No encontramos alertas de riesgo específicas para "{destination}".
              Esto generalmente indica que es un destino de bajo riesgo.
            </div>
            <AppButton
              className="mt-3 w-full"
              type="button"
              onClick={() => window.open(`https://travel.state.gov/content/travel/en/international-travel/International-Travel-Country-Information-Pages.html`, '_blank')}
            >
              Ver advisory oficial (US State Dept)
            </AppButton>
          </div>
        </div>
      )}

      {/* ── Fuente y última actualización ─────────────────────────────────── */}
      <div style={{ marginTop: 20, fontSize: 11, color: `${P.primary}50`, textAlign: 'center', lineHeight: 1.6 }}>
        Datos: Travel Advisory API · Secretariado de Seguridad Pública · UK FCDO{'\n'}
        Base curada VIAZA v1 · Se actualiza con cada versión de la app
      </div>
    </div>
  );
}
