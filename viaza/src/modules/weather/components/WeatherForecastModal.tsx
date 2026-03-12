import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { motion } from 'framer-motion';
import { ModalSheet } from '../../../components/ui/ModalSheet';
import { fetchDailyForecast, type DayForecast } from '../../../engines/dailyForecastEngine';

interface WeatherForecastModalProps {
  open: boolean;
  onClose: () => void;
  lat: number;
  lon: number;
  startDate: string;
  endDate: string;
  destination: string;
}

/* ─── Iconos SVG duotone por tipo de clima ──────────────────────── */
function WeatherSvgIcon({ icon, size = 32 }: { icon: string; size?: number }) {
  const s = size;
  switch (icon) {
    case 'sun_hot':
      return (
        <svg width={s} height={s} viewBox="0 0 48 48" fill="none">
          <circle cx="24" cy="24" r="12" fill="#EA9940" />
          <circle cx="24" cy="24" r="12" fill="rgba(180,192,200,0.25)" />
          {[0,45,90,135,180,225,270,315].map((deg) => (
            <line key={deg}
              x1={24 + 15 * Math.cos(deg * Math.PI / 180)}
              y1={24 + 15 * Math.sin(deg * Math.PI / 180)}
              x2={24 + 20 * Math.cos(deg * Math.PI / 180)}
              y2={24 + 20 * Math.sin(deg * Math.PI / 180)}
              stroke="#EA9940" strokeWidth="2.5" strokeLinecap="round"
            />
          ))}
        </svg>
      );
    case 'sun':
      return (
        <svg width={s} height={s} viewBox="0 0 48 48" fill="none">
          <circle cx="24" cy="24" r="10" fill="#EA9940" />
          {[0,60,120,180,240,300].map((deg) => (
            <line key={deg}
              x1={24 + 13 * Math.cos(deg * Math.PI / 180)}
              y1={24 + 13 * Math.sin(deg * Math.PI / 180)}
              x2={24 + 18 * Math.cos(deg * Math.PI / 180)}
              y2={24 + 18 * Math.sin(deg * Math.PI / 180)}
              stroke="#EA9940" strokeWidth="2" strokeLinecap="round"
            />
          ))}
        </svg>
      );
    case 'partly_cloudy':
      return (
        <svg width={s} height={s} viewBox="0 0 48 48" fill="none">
          <circle cx="20" cy="20" r="8" fill="#EA9940" />
          <ellipse cx="28" cy="28" rx="12" ry="8" fill="rgba(180,192,200,0.80)" />
          <ellipse cx="22" cy="30" rx="9" ry="6" fill="rgba(180,192,200,0.60)" />
        </svg>
      );
    case 'rain':
      return (
        <svg width={s} height={s} viewBox="0 0 48 48" fill="none">
          <ellipse cx="24" cy="18" rx="14" ry="9" fill="#EA9940" />
          <ellipse cx="24" cy="18" rx="14" ry="9" fill="rgba(180,192,200,0.55)" />
          <line x1="16" y1="30" x2="14" y2="38" stroke="rgba(180,192,200,0.80)" strokeWidth="2.5" strokeLinecap="round" />
          <line x1="24" y1="30" x2="22" y2="38" stroke="rgba(180,192,200,0.80)" strokeWidth="2.5" strokeLinecap="round" />
          <line x1="32" y1="30" x2="30" y2="38" stroke="rgba(180,192,200,0.80)" strokeWidth="2.5" strokeLinecap="round" />
        </svg>
      );
    case 'snow':
      return (
        <svg width={s} height={s} viewBox="0 0 48 48" fill="none">
          <ellipse cx="24" cy="18" rx="14" ry="9" fill="rgba(180,192,200,0.70)" />
          <line x1="24" y1="28" x2="24" y2="42" stroke="rgba(180,192,200,0.90)" strokeWidth="2.5" strokeLinecap="round" />
          <line x1="16" y1="32" x2="32" y2="38" stroke="rgba(180,192,200,0.90)" strokeWidth="2.5" strokeLinecap="round" />
          <line x1="32" y1="32" x2="16" y2="38" stroke="rgba(180,192,200,0.90)" strokeWidth="2.5" strokeLinecap="round" />
        </svg>
      );
    case 'storm':
      return (
        <svg width={s} height={s} viewBox="0 0 48 48" fill="none">
          <ellipse cx="24" cy="16" rx="14" ry="9" fill="#EA9940" />
          <ellipse cx="24" cy="16" rx="14" ry="9" fill="rgba(18,33,46,0.30)" />
          <path d="M26 26l-6 12h5l-4 8 10-14h-5z" fill="#EA9940" />
        </svg>
      );
    case 'cold':
      return (
        <svg width={s} height={s} viewBox="0 0 48 48" fill="none">
          <ellipse cx="24" cy="18" rx="14" ry="9" fill="rgba(180,192,200,0.70)" />
          <ellipse cx="24" cy="18" rx="14" ry="9" fill="rgba(48,112,130,0.35)" />
          <line x1="24" y1="28" x2="24" y2="42" stroke="rgba(48,112,130,0.70)" strokeWidth="2.5" strokeLinecap="round" />
          <line x1="18" y1="35" x2="30" y2="35" stroke="rgba(48,112,130,0.70)" strokeWidth="2.5" strokeLinecap="round" />
        </svg>
      );
    default:
      return (
        <svg width={s} height={s} viewBox="0 0 48 48" fill="none">
          <circle cx="24" cy="24" r="10" fill="#EA9940" />
        </svg>
      );
  }
}

/* ─── Formato de fecha legible ──────────────────────────────────── */
function formatDayLabel(dateStr: string, locale: string): string {
  try {
    const d = new Date(dateStr + 'T12:00:00');
    return d.toLocaleDateString(locale, { weekday: 'short', day: 'numeric', month: 'short' });
  } catch {
    return dateStr;
  }
}

/* ─── Componente principal ──────────────────────────────────────── */
export function WeatherForecastModal({
  open, onClose, lat, lon, startDate, endDate, destination,
}: WeatherForecastModalProps) {
  const { t, i18n } = useTranslation();
  const [days, setDays] = useState<DayForecast[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!open || !lat || !lon || !startDate || !endDate) return;
    let cancelled = false;
    setLoading(true);
    setError(null);
    fetchDailyForecast(lat, lon, startDate, endDate)
      .then((data) => {
        if (!cancelled) {
          setDays(data);
          setLoading(false);
        }
      })
      .catch((err: Error) => {
        if (!cancelled) {
          setError(err.message);
          setLoading(false);
        }
      });
    return () => { cancelled = true; };
  }, [open, lat, lon, startDate, endDate]);

  return (
    <ModalSheet open={open} onClose={onClose} title={t('weather.forecast.title')} fullHeight>
      <div style={{ padding: '0 20px' }}>
        {/* Subtítulo */}
        <p style={{
          fontFamily: 'Questrial, sans-serif',
          fontSize: 13,
          color: 'rgba(18,33,46,0.55)',
          margin: '0 0 16px',
        }}>
          {destination} · {t('weather.forecast.days', { n: days.length })}
        </p>

        {/* Loading */}
        {loading && (
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '48px 0', gap: 12 }}>
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ repeat: Infinity, duration: 1, ease: 'linear' }}
              style={{ width: 32, height: 32, borderRadius: '50%', border: '3px solid rgba(18,33,46,0.10)', borderTopColor: '#EA9940' }}
            />
            <span style={{ fontFamily: 'Questrial, sans-serif', fontSize: 13, color: 'rgba(18,33,46,0.45)' }}>
              {t('smart.fetchingWeather')}
            </span>
          </div>
        )}

        {/* Error */}
        {error && !loading && (
          <div style={{
            background: 'rgba(192,57,43,0.08)',
            border: '1px solid rgba(192,57,43,0.20)',
            borderRadius: 16,
            padding: '16px 18px',
            fontFamily: 'Questrial, sans-serif',
            fontSize: 13,
            color: '#C0392B',
          }}>
            {t('weather.forecast.noData')}
          </div>
        )}

        {/* Días */}
        {!loading && !error && days.length > 0 && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {days.map((day, i) => (
              <motion.div
                key={day.date}
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.04, duration: 0.3 }}
                style={{
                  background: 'rgba(255,255,255,0.75)',
                  backdropFilter: 'blur(16px)',
                  WebkitBackdropFilter: 'blur(16px)',
                  border: '1px solid rgba(255,255,255,0.55)',
                  borderRadius: 20,
                  padding: '14px 16px',
                  boxShadow: '0 2px 12px rgba(18,33,46,0.06)',
                }}
              >
                {/* Fila superior: fecha + icono + max/min */}
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <div>
                    <div style={{
                      fontFamily: 'Questrial, sans-serif',
                      fontWeight: 700,
                      fontSize: 14,
                      color: '#12212E',
                      textTransform: 'capitalize',
                    }}>
                      {formatDayLabel(day.date, i18n.language)}
                    </div>
                    <div style={{
                      fontFamily: 'Questrial, sans-serif',
                      fontSize: 12,
                      color: 'rgba(18,33,46,0.50)',
                      marginTop: 2,
                    }}>
                      {t('weather.forecast.rain', { pct: day.rainProbability })}
                    </div>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                    <WeatherSvgIcon icon={day.icon} size={36} />
                    <div style={{ textAlign: 'right' }}>
                      <div style={{ fontFamily: 'Questrial, sans-serif', fontWeight: 700, fontSize: 18, color: '#12212E' }}>
                        {day.maxTemp}°
                      </div>
                      <div style={{ fontFamily: 'Questrial, sans-serif', fontSize: 12, color: 'rgba(18,33,46,0.45)' }}>
                        {day.minTemp}°
                      </div>
                    </div>
                  </div>
                </div>

                {/* Fila inferior: mañana / tarde / noche */}
                <div style={{
                  display: 'grid',
                  gridTemplateColumns: '1fr 1fr 1fr',
                  gap: 6,
                  marginTop: 12,
                  paddingTop: 10,
                  borderTop: '1px solid rgba(18,33,46,0.06)',
                }}>
                  {[
                    { label: t('weather.forecast.morning'),   temp: day.morningTemp },
                    { label: t('weather.forecast.afternoon'), temp: day.afternoonTemp },
                    { label: t('weather.forecast.night'),     temp: day.nightTemp },
                  ].map(({ label, temp }) => (
                    <div key={label} style={{ textAlign: 'center' }}>
                      <div style={{
                        fontFamily: 'Questrial, sans-serif',
                        fontSize: 10,
                        fontWeight: 600,
                        color: 'rgba(18,33,46,0.45)',
                        textTransform: 'uppercase',
                        letterSpacing: 0.5,
                        marginBottom: 3,
                      }}>
                        {label}
                      </div>
                      <div style={{
                        fontFamily: 'Questrial, sans-serif',
                        fontWeight: 700,
                        fontSize: 15,
                        color: '#12212E',
                      }}>
                        {temp}°
                      </div>
                    </div>
                  ))}
                </div>
              </motion.div>
            ))}
          </div>
        )}

        {/* No data sin error */}
        {!loading && !error && days.length === 0 && (
          <div style={{
            textAlign: 'center',
            padding: '48px 0',
            fontFamily: 'Questrial, sans-serif',
            fontSize: 14,
            color: 'rgba(18,33,46,0.45)',
          }}>
            {t('weather.forecast.noData')}
          </div>
        )}
      </div>
    </ModalSheet>
  );
}
