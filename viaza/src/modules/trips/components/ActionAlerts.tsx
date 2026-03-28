// src/modules/trips/components/ActionAlerts.tsx
// Sección "Acciones urgentes" en HomePage — Sprint 1 Fase 1 S4
// Paleta oficial VIAZA — CERO emojis — CERO colores fuera de paleta

import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import type { TripAlert } from '../../../engines/tripBrainEngine';

const P = {
  primary:    '#12212E',
  secondary:  '#307082',
  accent:     '#EA9940',
  background: '#ECE7DC',
  softTeal:   '#6CA3A2',
  primaryRgb: '18,33,46',
  accentRgb:  '234,153,64',
};

const SEVERITY_STYLES: Record<TripAlert['severity'], {
  border: string;
  dot: string;
  label: string;
}> = {
  urgent: {
    border: `rgba(${P.accentRgb},0.5)`,
    dot: P.accent,
    label: 'Urgente',
  },
  warning: {
    border: `rgba(${P.primaryRgb},0.2)`,
    dot: P.secondary,
    label: 'Atencion',
  },
  info: {
    border: `rgba(${P.primaryRgb},0.1)`,
    dot: P.softTeal,
    label: 'Info',
  },
};

interface Props {
  alerts: TripAlert[];
}

export function ActionAlerts({ alerts }: Props) {
  const navigate = useNavigate();

  if (alerts.length === 0) return null;

  return (
    <div style={{ marginBottom: 4 }}>
      <div
        style={{
          fontSize: 11,
          fontWeight: 700,
          color: P.softTeal,
          letterSpacing: '0.08em',
          textTransform: 'uppercase',
          marginBottom: 8,
          paddingLeft: 2,
        }}
      >
        Acciones pendientes
      </div>

      <AnimatePresence>
        {alerts.map((alert) => {
          const styles = SEVERITY_STYLES[alert.severity];
          return (
            <motion.div
              key={alert.id}
              initial={{ opacity: 0, y: -6 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.2 }}
              style={{
                background: `rgba(${P.primaryRgb},0.04)`,
                border: `1px solid ${styles.border}`,
                borderRadius: 12,
                padding: '12px 14px',
                marginBottom: 8,
                cursor: alert.actionPath ? 'pointer' : 'default',
              }}
              onClick={() => {
                if (alert.actionPath) navigate(alert.actionPath);
              }}
            >
              <div style={{ display: 'flex', alignItems: 'flex-start', gap: 10 }}>
                {/* Dot indicador */}
                <div
                  style={{
                    width: 8,
                    height: 8,
                    borderRadius: '50%',
                    background: styles.dot,
                    marginTop: 5,
                    flexShrink: 0,
                  }}
                />
                <div style={{ flex: 1 }}>
                  <div
                    style={{
                      fontWeight: 700,
                      fontSize: 13,
                      color: P.primary,
                      marginBottom: 2,
                    }}
                  >
                    {alert.title}
                  </div>
                  <div style={{ fontSize: 12, color: P.softTeal, lineHeight: 1.4 }}>
                    {alert.description}
                  </div>
                </div>
                {alert.actionLabel && (
                  <div
                    style={{
                      fontSize: 11,
                      fontWeight: 700,
                      color: P.secondary,
                      flexShrink: 0,
                      alignSelf: 'center',
                    }}
                  >
                    {alert.actionLabel}
                  </div>
                )}
              </div>
            </motion.div>
          );
        })}
      </AnimatePresence>
    </div>
  );
}
