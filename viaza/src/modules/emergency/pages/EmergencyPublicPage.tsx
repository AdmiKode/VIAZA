import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { getEmergencyPublicView } from '../../../services/emergencyService';
import type { EmergencyPublicView } from '../../../types/emergency';

const C = { dark: '#12212E', cream: '#ECE7DC', accent: '#EA9940', teal: '#307082', red: '#c0392b', muted: 'rgba(18,33,46,0.50)' };

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div style={{ background: 'white', borderRadius: 20, padding: '16px 18px', marginBottom: 12, boxShadow: '0 2px 12px rgba(18,33,46,0.07)' }}>
      <div style={{ color: C.muted, fontSize: 10, fontWeight: 800, letterSpacing: 1, textTransform: 'uppercase', marginBottom: 10 }}>{title}</div>
      {children}
    </div>
  );
}

export default function EmergencyPublicPage() {
  const { publicToken } = useParams<{ publicToken: string }>();
  const [data, setData] = useState<EmergencyPublicView | null | 'loading' | 'error'>('loading');

  useEffect(() => {
    if (!publicToken) { setData(null); return; }
    getEmergencyPublicView(publicToken)
      .then(d => setData(d as EmergencyPublicView | null))
      .catch(() => setData('error'));
  }, [publicToken]);

  // ── Loading ───────────────────────────────────────────────────────────────
  if (data === 'loading') {
    return (
      <div style={{ background: C.cream, minHeight: '100dvh', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: 'Questrial, sans-serif' }}>
        <div style={{ textAlign: 'center' }}>
          <div style={{ width: 48, height: 48, border: `4px solid ${C.red}`, borderTopColor: 'transparent', borderRadius: '50%', animation: 'spin 0.9s linear infinite', margin: '0 auto 16px' }}/>
          <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
          <div style={{ color: C.muted, fontSize: 14 }}>Cargando perfil de emergencia...</div>
        </div>
      </div>
    );
  }

  // ── Error / invalid ────────────────────────────────────────────────────────
  if (data === 'error' || data === null) {
    return (
      <div style={{ background: C.cream, minHeight: '100dvh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', fontFamily: 'Questrial, sans-serif', padding: '0 32px' }}>
        <div style={{ fontSize: 56, marginBottom: 16 }}>🚫</div>
        <div style={{ color: C.dark, fontSize: 22, fontWeight: 800, textAlign: 'center', marginBottom: 10 }}>QR inválido o desactivado</div>
        <div style={{ color: C.muted, fontSize: 14, textAlign: 'center', lineHeight: 1.6, marginBottom: 28 }}>
          Este código QR no existe, ha sido desactivado por su dueño, o el enlace es incorrecto.
        </div>
        <Link to="/" style={{ background: C.dark, color: C.cream, borderRadius: 14, padding: '13px 28px', fontSize: 15, fontWeight: 700, textDecoration: 'none' }}>
          Ir a VIAZA
        </Link>
      </div>
    );
  }

  // ── Emergency Card ────────────────────────────────────────────────────────
  return (
    <div style={{ background: C.cream, minHeight: '100dvh', fontFamily: 'Questrial, sans-serif' }}>
      {/* Top bar */}
      <div style={{ background: `linear-gradient(160deg, ${C.red} 0%, #8B0000 100%)`, padding: '40px 24px 28px', borderBottomLeftRadius: 28, borderBottomRightRadius: 28 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 14 }}>
          <div style={{ background: 'rgba(255,255,255,0.20)', borderRadius: 20, padding: '4px 12px', display: 'flex', alignItems: 'center', gap: 6 }}>
            <span style={{ color: 'white', fontSize: 12 }}>⚡</span>
            <span style={{ color: 'white', fontSize: 11, fontWeight: 800, letterSpacing: 0.8 }}>EMERGENCY TRAVEL CARD</span>
          </div>
        </div>
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }}>
          <div style={{ color: 'white', fontSize: 28, fontWeight: 800, lineHeight: 1.1 }}>{data.full_name}</div>
          {data.nationality && <div style={{ color: 'rgba(255,255,255,0.70)', fontSize: 14, marginTop: 5 }}>{data.nationality}</div>}
          {(data.primary_language || data.secondary_language) && (
            <div style={{ color: 'rgba(255,255,255,0.60)', fontSize: 12, marginTop: 3 }}>
              🌐 {[data.primary_language, data.secondary_language].filter(Boolean).join(' · ')}
            </div>
          )}
        </motion.div>
      </div>

      <div style={{ padding: '20px 16px 40px' }}>
        {/* Blood type badge */}
        {data.blood_type && (
          <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 0.1 }}
            style={{ background: `linear-gradient(135deg, ${C.red}, #8B0000)`, borderRadius: 22, padding: '18px 20px', marginBottom: 12, display: 'flex', alignItems: 'center', gap: 14, boxShadow: '0 6px 24px rgba(192,57,43,0.30)' }}>
            <div style={{ fontSize: 36 }}>🩸</div>
            <div>
              <div style={{ color: 'rgba(255,255,255,0.65)', fontSize: 11, fontWeight: 700, letterSpacing: 1, textTransform: 'uppercase', marginBottom: 2 }}>Tipo de sangre</div>
              <div style={{ color: 'white', fontSize: 36, fontWeight: 900, lineHeight: 1 }}>{data.blood_type}</div>
            </div>
          </motion.div>
        )}

        {/* Alergias */}
        {data.allergies && (
          <Section title="⚠️ Alergias">
            <div style={{ color: C.dark, fontSize: 14, lineHeight: 1.6 }}>{data.allergies}</div>
          </Section>
        )}

        {/* Condiciones */}
        {data.current_conditions && (
          <Section title="🏥 Condiciones médicas">
            <div style={{ color: C.dark, fontSize: 14, lineHeight: 1.6 }}>{data.current_conditions}</div>
          </Section>
        )}

        {/* Medicamentos */}
        {data.medications && (
          <Section title="💊 Medicamentos">
            <div style={{ color: C.dark, fontSize: 14, lineHeight: 1.6 }}>{data.medications}</div>
          </Section>
        )}

        {/* Notas médicas */}
        {data.medical_notes && (
          <Section title="📋 Notas para el médico">
            <div style={{ color: C.dark, fontSize: 14, lineHeight: 1.6 }}>{data.medical_notes}</div>
          </Section>
        )}

        {/* Contactos de emergencia */}
        {(data.emergency_contact_1_name || data.emergency_contact_2_name) && (
          <Section title="📞 Contactos de emergencia">
            {[
              [data.emergency_contact_1_name, data.emergency_contact_1_relation, data.emergency_contact_1_phone],
              [data.emergency_contact_2_name, data.emergency_contact_2_relation, data.emergency_contact_2_phone],
            ].filter(([name]) => name).map(([name, relation, phone]) => (
              <div key={name} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '10px 0', borderBottom: '1px solid rgba(18,33,46,0.06)' }}>
                <div>
                  <div style={{ color: C.dark, fontSize: 14, fontWeight: 700 }}>{name}</div>
                  {relation && <div style={{ color: C.muted, fontSize: 12, marginTop: 2 }}>{relation}</div>}
                </div>
                {phone && (
                  <a href={`tel:${phone}`}
                    style={{ background: `linear-gradient(135deg, ${C.teal}, #1a5060)`, color: 'white', borderRadius: 14, padding: '10px 18px', fontSize: 14, fontWeight: 800, textDecoration: 'none', display: 'flex', alignItems: 'center', gap: 6, boxShadow: '0 4px 14px rgba(48,112,130,0.30)' }}>
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round"><path d="M22 16.92v3a2 2 0 01-2.18 2 19.79 19.79 0 01-8.63-3.07A19.5 19.5 0 013.07 9.81a19.79 19.79 0 01-3.07-8.7A2 2 0 012 1h3a2 2 0 012 1.72c.127.96.361 1.903.7 2.81a2 2 0 01-.45 2.11L6.09 8.91a16 16 0 006 6l1.27-1.27a2 2 0 012.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0122 16.92z"/></svg>
                    Llamar
                  </a>
                )}
              </div>
            ))}
          </Section>
        )}

        {/* Seguro */}
        {(data.insurance_provider || data.insurance_policy_number) && (
          <Section title="🛡️ Seguro de viaje">
            <div style={{ display: 'flex', justifyContent: 'space-between', flexWrap: 'wrap', gap: 8 }}>
              {data.insurance_provider && (
                <div>
                  <div style={{ color: C.muted, fontSize: 11, fontWeight: 700 }}>Aseguradora</div>
                  <div style={{ color: C.dark, fontSize: 15, fontWeight: 700, marginTop: 2 }}>{data.insurance_provider}</div>
                </div>
              )}
              {data.insurance_policy_number && (
                <div>
                  <div style={{ color: C.muted, fontSize: 11, fontWeight: 700 }}>Póliza</div>
                  <div style={{ color: C.dark, fontSize: 15, fontWeight: 700, marginTop: 2 }}>{data.insurance_policy_number}</div>
                </div>
              )}
            </div>
          </Section>
        )}

        {/* Footer */}
        <div style={{ textAlign: 'center', marginTop: 28 }}>
          <Link to="/" style={{ textDecoration: 'none' }}>
            <div style={{ color: C.muted, fontSize: 12 }}>Generated by</div>
            <div style={{ color: C.dark, fontSize: 16, fontWeight: 800, letterSpacing: 1.5 }}>VIAZA</div>
            <div style={{ color: C.muted, fontSize: 11, marginTop: 2 }}>Emergency travel support profile</div>
          </Link>
        </div>
      </div>
    </div>
  );
}
