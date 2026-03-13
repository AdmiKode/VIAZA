import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { getEmergencyProfile } from '../../../services/emergencyService';
import { EmergencyQRModal } from '../components/EmergencyQRModal';
import { EmergencyCardForm } from '../components/EmergencyCardForm';
import type { EmergencyProfile } from '../../../types/emergency';
import { EMPTY_EMERGENCY_FORM } from '../../../types/emergency';

const C = { dark: '#12212E', cream: '#ECE7DC', accent: '#EA9940', teal: '#307082', red: '#c0392b', muted: 'rgba(18,33,46,0.50)' };

type View = 'loading' | 'onboarding' | 'overview' | 'edit';

export default function EmergencyCardPage() {
  const navigate = useNavigate();
  const [profile, setProfile] = useState<EmergencyProfile | null>(null);
  const [view, setView] = useState<View>('loading');
  const [showQR, setShowQR] = useState(false);

  useEffect(() => {
    getEmergencyProfile()
      .then(p => { setProfile(p); setView(p ? 'overview' : 'onboarding'); })
      .catch(() => setView('onboarding'));
  }, []);

  // ── Loading ──────────────────────────────────────────────────────────────
  if (view === 'loading') {
    return (
      <div style={{ background: C.cream, minHeight: '100dvh', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: 'Questrial, sans-serif' }}>
        <div style={{ textAlign: 'center' }}>
          <div style={{ width: 48, height: 48, border: `4px solid ${C.red}`, borderTopColor: 'transparent', borderRadius: '50%', animation: 'spin 0.9s linear infinite', margin: '0 auto 16px' }}/>
          <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
          <div style={{ color: C.muted, fontSize: 14 }}>Cargando tu Emergency Card...</div>
        </div>
      </div>
    );
  }

  // ── Form (edit/create) ───────────────────────────────────────────────────
  if (view === 'edit') {
    return (
      <EmergencyCardForm
        initial={profile ? {
          full_name: profile.full_name,
          date_of_birth: profile.date_of_birth,
          nationality: profile.nationality,
          primary_language: profile.primary_language,
          secondary_language: profile.secondary_language,
          photo_url: profile.photo_url,
          blood_type: profile.blood_type,
          allergies: profile.allergies,
          medications: profile.medications,
          current_treatments: profile.current_treatments,
          current_conditions: profile.current_conditions,
          medical_notes: profile.medical_notes,
          insurance_provider: profile.insurance_provider,
          insurance_policy_number: profile.insurance_policy_number,
          doctor_name: profile.doctor_name,
          doctor_phone: profile.doctor_phone,
          emergency_contact_1_name: profile.emergency_contact_1_name,
          emergency_contact_1_relation: profile.emergency_contact_1_relation,
          emergency_contact_1_phone: profile.emergency_contact_1_phone,
          emergency_contact_2_name: profile.emergency_contact_2_name,
          emergency_contact_2_relation: profile.emergency_contact_2_relation,
          emergency_contact_2_phone: profile.emergency_contact_2_phone,
          show_blood_type: profile.show_blood_type,
          show_allergies: profile.show_allergies,
          show_conditions: profile.show_conditions,
          show_medications: profile.show_medications,
          show_contacts: profile.show_contacts,
          show_insurance: profile.show_insurance,
          show_notes: profile.show_notes,
          qr_enabled: profile.qr_enabled,
          consent_public_display: profile.consent_public_display,
        } : EMPTY_EMERGENCY_FORM}
        onSaved={saved => { setProfile(saved); setView('overview'); }}
      />
    );
  }

  // ── Onboarding (no profile yet) ───────────────────────────────────────────
  if (view === 'onboarding') {
    return (
      <div style={{ background: C.cream, minHeight: '100dvh', fontFamily: 'Questrial, sans-serif' }}>
        {/* Header */}
        <div style={{ background: `linear-gradient(160deg, ${C.red} 0%, #8B0000 100%)`, padding: '56px 24px 36px', borderBottomLeftRadius: 32, borderBottomRightRadius: 32 }}>
          <button onClick={() => navigate(-1)} style={{ background: 'none', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 6, marginBottom: 20, padding: 0 }}>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="rgba(255,255,255,0.7)" strokeWidth="2.5" strokeLinecap="round"><path d="M19 12H5M12 5l-7 7 7 7"/></svg>
            <span style={{ color: 'rgba(255,255,255,0.7)', fontSize: 14, fontWeight: 600 }}>Perfil</span>
          </button>
          {/* QR SVG placeholder */}
          <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 24 }}>
            <div style={{ width: 100, height: 100, background: 'rgba(255,255,255,0.12)', borderRadius: 22, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <svg width="60" height="60" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="1.5" strokeLinecap="round">
                <rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/>
                <path d="M14 14h3v3M17 20h3M20 17v3"/>
              </svg>
            </div>
          </div>
          <div style={{ color: 'white', fontSize: 24, fontWeight: 800, textAlign: 'center', lineHeight: 1.2 }}>Emergency Travel Card</div>
          <div style={{ color: 'rgba(255,255,255,0.7)', fontSize: 14, textAlign: 'center', marginTop: 8 }}>Tu perfil de emergencia con QR</div>
        </div>

        <div style={{ padding: '28px 20px' }}>
          {/* Beneficios */}
          {[
            ['🩺', 'Datos médicos accesibles al instante', 'Tipo de sangre, alergias y medicamentos siempre disponibles'],
            ['📞', 'Contactos de emergencia', 'Quienes te cuidan, a un toque de distancia'],
            ['🔒', 'Privacidad total', 'Tú decides exactamente qué información es pública'],
            ['⚡', 'Sin app necesaria', 'Cualquier persona puede escanear tu QR, sin descargar nada'],
          ].map(([icon, title, desc]) => (
            <div key={title} style={{ display: 'flex', gap: 14, marginBottom: 20 }}>
              <div style={{ width: 44, height: 44, borderRadius: 14, background: 'rgba(192,57,43,0.10)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 22, flexShrink: 0 }}>{icon}</div>
              <div>
                <div style={{ color: C.dark, fontSize: 15, fontWeight: 700 }}>{title}</div>
                <div style={{ color: C.muted, fontSize: 13, marginTop: 2 }}>{desc}</div>
              </div>
            </div>
          ))}

          <motion.button
            whileTap={{ scale: 0.97 }}
            onClick={() => setView('edit')}
            style={{ width: '100%', background: `linear-gradient(135deg, ${C.red} 0%, #8B0000 100%)`, color: 'white', border: 'none', borderRadius: 18, padding: '17px', fontSize: 17, fontWeight: 800, cursor: 'pointer', fontFamily: 'Questrial, sans-serif', boxShadow: '0 8px 28px rgba(192,57,43,0.35)', marginTop: 8 }}
          >
            Crear mi Emergency Card →
          </motion.button>
        </div>
      </div>
    );
  }

  // ── Overview (has profile) ────────────────────────────────────────────────
  return (
    <div style={{ background: C.cream, minHeight: '100dvh', fontFamily: 'Questrial, sans-serif', paddingBottom: 100 }}>
      {/* Header */}
      <div style={{ background: `linear-gradient(160deg, ${C.red} 0%, #8B0000 100%)`, padding: '56px 24px 28px', borderBottomLeftRadius: 28, borderBottomRightRadius: 28 }}>
        <button onClick={() => navigate(-1)} style={{ background: 'none', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 6, marginBottom: 16, padding: 0 }}>
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="rgba(255,255,255,0.7)" strokeWidth="2.5" strokeLinecap="round"><path d="M19 12H5M12 5l-7 7 7 7"/></svg>
          <span style={{ color: 'rgba(255,255,255,0.7)', fontSize: 14, fontWeight: 600 }}>Perfil</span>
        </button>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
          <div>
            <div style={{ color: 'white', fontSize: 22, fontWeight: 800 }}>Emergency Travel Card</div>
            <div style={{ color: 'rgba(255,255,255,0.65)', fontSize: 13, marginTop: 4 }}>{profile!.full_name}</div>
          </div>
          <div style={{ background: profile!.qr_enabled && profile!.consent_public_display ? 'rgba(46,213,115,0.25)' : 'rgba(255,255,255,0.15)', borderRadius: 20, padding: '4px 12px', display: 'flex', alignItems: 'center', gap: 5 }}>
            <div style={{ width: 7, height: 7, borderRadius: '50%', background: profile!.qr_enabled && profile!.consent_public_display ? '#2ed573' : 'rgba(255,255,255,0.5)' }}/>
            <span style={{ color: 'white', fontSize: 11, fontWeight: 700 }}>{profile!.qr_enabled && profile!.consent_public_display ? 'QR Activo' : 'QR Inactivo'}</span>
          </div>
        </div>
      </div>

      <div style={{ padding: '20px 16px 0' }}>
        {/* Acciones principales */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 16 }}>
          <motion.button whileTap={{ scale: 0.96 }} onClick={() => setShowQR(true)}
            style={{ background: `linear-gradient(135deg, ${C.red}, #8B0000)`, color: 'white', border: 'none', borderRadius: 18, padding: '18px 14px', cursor: 'pointer', fontFamily: 'Questrial, sans-serif', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8, boxShadow: '0 6px 20px rgba(192,57,43,0.30)' }}>
            <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round">
              <rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/>
              <path d="M14 14h3v3M17 20h3M20 17v3"/>
            </svg>
            <span style={{ fontSize: 14, fontWeight: 800 }}>Ver mi QR</span>
          </motion.button>

          <motion.button whileTap={{ scale: 0.96 }} onClick={() => setView('edit')}
            style={{ background: 'white', color: C.dark, border: `2px solid rgba(18,33,46,0.10)`, borderRadius: 18, padding: '18px 14px', cursor: 'pointer', fontFamily: 'Questrial, sans-serif', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8, boxShadow: '0 2px 12px rgba(18,33,46,0.07)' }}>
            <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke={C.dark} strokeWidth="2" strokeLinecap="round">
              <path d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z"/>
            </svg>
            <span style={{ fontSize: 14, fontWeight: 800 }}>Editar datos</span>
          </motion.button>
        </div>

        {/* Resumen médico */}
        <div style={{ background: 'white', borderRadius: 22, padding: '20px 18px', marginBottom: 14, boxShadow: '0 2px 12px rgba(18,33,46,0.07)' }}>
          <div style={{ color: C.dark, fontSize: 15, fontWeight: 800, marginBottom: 16 }}>Resumen médico</div>
          {profile!.blood_type && (
            <div style={{ display: 'inline-flex', alignItems: 'center', gap: 6, background: `rgba(192,57,43,0.10)`, borderRadius: 20, padding: '6px 14px', marginBottom: 12, marginRight: 8 }}>
              <span style={{ color: C.red, fontSize: 16, fontWeight: 900 }}>🩸</span>
              <span style={{ color: C.red, fontSize: 15, fontWeight: 900 }}>{profile!.blood_type}</span>
            </div>
          )}
          {[
            ['Alergias', profile!.allergies],
            ['Medicamentos', profile!.medications],
            ['Condiciones', profile!.current_conditions],
          ].map(([label, value]) => value && (
            <div key={label} style={{ marginBottom: 10 }}>
              <div style={{ color: C.muted, fontSize: 11, fontWeight: 700, letterSpacing: 0.7, textTransform: 'uppercase', marginBottom: 3 }}>{label}</div>
              <div style={{ color: C.dark, fontSize: 13, lineHeight: 1.5 }}>{value}</div>
            </div>
          ))}
          {!profile!.blood_type && !profile!.allergies && !profile!.medications && !profile!.current_conditions && (
            <div style={{ color: C.muted, fontSize: 13, textAlign: 'center', padding: '8px 0' }}>No hay datos médicos aún. Toca "Editar datos" para agregar.</div>
          )}
        </div>

        {/* Contactos */}
        {(profile!.emergency_contact_1_name || profile!.emergency_contact_2_name) && (
          <div style={{ background: 'white', borderRadius: 22, padding: '20px 18px', marginBottom: 14, boxShadow: '0 2px 12px rgba(18,33,46,0.07)' }}>
            <div style={{ color: C.dark, fontSize: 15, fontWeight: 800, marginBottom: 16 }}>Contactos de emergencia</div>
            {[
              [profile!.emergency_contact_1_name, profile!.emergency_contact_1_relation, profile!.emergency_contact_1_phone],
              [profile!.emergency_contact_2_name, profile!.emergency_contact_2_relation, profile!.emergency_contact_2_phone],
            ].filter(([name]) => name).map(([name, relation, phone]) => (
              <div key={name} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '10px 0', borderBottom: '1px solid rgba(18,33,46,0.06)' }}>
                <div>
                  <div style={{ color: C.dark, fontSize: 14, fontWeight: 700 }}>{name}</div>
                  <div style={{ color: C.muted, fontSize: 12, marginTop: 2 }}>{relation}</div>
                </div>
                {phone && (
                  <a href={`tel:${phone}`} style={{ background: `rgba(48,112,130,0.10)`, color: C.teal, borderRadius: 12, padding: '8px 14px', fontSize: 13, fontWeight: 700, textDecoration: 'none', display: 'flex', alignItems: 'center', gap: 5 }}>
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><path d="M22 16.92v3a2 2 0 01-2.18 2 19.79 19.79 0 01-8.63-3.07A19.5 19.5 0 013.07 9.81a19.79 19.79 0 01-3.07-8.7A2 2 0 012 1h3a2 2 0 012 1.72c.127.96.361 1.903.7 2.81a2 2 0 01-.45 2.11L6.09 8.91a16 16 0 006 6l1.27-1.27a2 2 0 012.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0122 16.92z"/></svg>
                    Llamar
                  </a>
                )}
              </div>
            ))}
          </div>
        )}

        {/* Estado del QR */}
        {(!profile!.qr_enabled || !profile!.consent_public_display) && (
          <div style={{ background: 'rgba(192,57,43,0.08)', border: '1.5px solid rgba(192,57,43,0.20)', borderRadius: 18, padding: '16px 18px', marginBottom: 14 }}>
            <div style={{ color: C.red, fontSize: 14, fontWeight: 800, marginBottom: 4 }}>⚠️ QR desactivado</div>
            <div style={{ color: C.red, fontSize: 13, opacity: 0.8, marginBottom: 12 }}>Para que tu QR sea escaneable debes activar "QR público" y dar tu consentimiento de visualización.</div>
            <button onClick={() => setView('edit')} style={{ background: C.red, color: 'white', border: 'none', borderRadius: 12, padding: '10px 18px', fontSize: 13, fontWeight: 700, cursor: 'pointer', fontFamily: 'Questrial, sans-serif' }}>
              Activar QR →
            </button>
          </div>
        )}
      </div>

      {/* QR Modal */}
      <AnimatePresence>
        {showQR && profile && (
          <EmergencyQRModal
            profile={profile}
            onClose={() => setShowQR(false)}
            onTokenRegenerated={newToken => setProfile(prev => prev ? { ...prev, public_token: newToken } : prev)}
          />
        )}
      </AnimatePresence>
    </div>
  );
}
