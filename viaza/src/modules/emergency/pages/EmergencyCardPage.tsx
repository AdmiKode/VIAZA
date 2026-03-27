import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { getEmergencyProfile, getEmergencyQrAccessLogs } from '../../../services/emergencyService';
import { EmergencyQRModal } from '../components/EmergencyQRModal';
import { EmergencyCardForm } from '../components/EmergencyCardForm';
import type { EmergencyProfile, EmergencyQrAccessLog } from '../../../types/emergency';
import { EMPTY_EMERGENCY_FORM } from '../../../types/emergency';
import { buildSosMessage, sendAssistedSos } from '../../../services/emergencyAssistService';
import { getCurrentPosition } from '../../../services/locationService';
import { useAppStore } from '../../../app/store/useAppStore';

const C = { dark: '#12212E', cream: '#ECE7DC', accent: '#EA9940', teal: '#307082', soft: '#6CA3A2', muted: 'rgba(18,33,46,0.50)' };

type View = 'loading' | 'onboarding' | 'overview' | 'edit';

type BenefitIconKind = 'medical' | 'contacts' | 'privacy' | 'scan';

type Benefit = {
  icon: BenefitIconKind;
  title: string;
  desc: string;
};

const BENEFITS: Benefit[] = [
  {
    icon: 'medical',
    title: 'Datos médicos accesibles al instante',
    desc: 'Tipo de sangre, alergias y medicamentos siempre disponibles',
  },
  {
    icon: 'contacts',
    title: 'Contactos de emergencia',
    desc: 'Quienes te cuidan, a un toque de distancia',
  },
  {
    icon: 'privacy',
    title: 'Privacidad total',
    desc: 'Tú decides exactamente qué información es pública',
  },
  {
    icon: 'scan',
    title: 'Sin app necesaria',
    desc: 'Cualquier persona puede escanear tu QR, sin descargar nada',
  },
];

function BenefitIcon({ kind }: { kind: BenefitIconKind }) {
  switch (kind) {
    case 'medical':
      return (
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke={C.accent} strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M12 5v14M5 12h14" />
        </svg>
      );
    case 'contacts':
      return (
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke={C.teal} strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M16 3a4 4 0 0 1 0 8" />
          <path d="M8 7a4 4 0 1 0 0 .1" />
          <path d="M2 20a6 6 0 0 1 12 0" />
          <path d="M14 20a5 5 0 0 1 8 0" />
        </svg>
      );
    case 'privacy':
      return (
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke={C.dark} strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
          <rect x="4" y="10" width="16" height="10" rx="2" />
          <path d="M8 10V8a4 4 0 1 1 8 0v2" />
        </svg>
      );
    case 'scan':
      return (
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke={C.soft} strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M3 9V5a2 2 0 0 1 2-2h4" />
          <path d="M21 9V5a2 2 0 0 0-2-2h-4" />
          <path d="M3 15v4a2 2 0 0 0 2 2h4" />
          <path d="M21 15v4a2 2 0 0 1-2 2h-4" />
          <path d="M8 12h8" />
        </svg>
      );
  }
}

function formatAccessDate(iso: string): string {
  try {
    return new Date(iso).toLocaleString('es-MX', {
      dateStyle: 'medium',
      timeStyle: 'short',
    });
  } catch {
    return iso;
  }
}

function normalizeSource(source: string | null): string {
  if (!source) return 'Fuente no identificada';
  if (source.includes('android')) return 'Android';
  if (source.includes('iphone') || source.includes('ios')) return 'iOS';
  if (source.includes('web')) return 'Web';
  return source;
}

export default function EmergencyCardPage() {
  const navigate = useNavigate();
  const currentTripId = useAppStore((s) => s.currentTripId);
  const currentTrip = useAppStore((s) => s.trips.find((trip) => trip.id === currentTripId) ?? null);
  const [profile, setProfile] = useState<EmergencyProfile | null>(null);
  const [qrAccessLogs, setQrAccessLogs] = useState<EmergencyQrAccessLog[]>([]);
  const [logsLoading, setLogsLoading] = useState(false);
  const [view, setView] = useState<View>('loading');
  const [showQR, setShowQR] = useState(false);
  const [sosSending, setSosSending] = useState<'whatsapp' | 'sms' | null>(null);

  useEffect(() => {
    let cancelled = false;

    const load = async () => {
      try {
        const p = await getEmergencyProfile();
        if (cancelled) return;
        setProfile(p);
        setView(p ? 'overview' : 'onboarding');
        if (p) {
          setLogsLoading(true);
          try {
            const logs = await getEmergencyQrAccessLogs(10);
            if (!cancelled) setQrAccessLogs(logs);
          } finally {
            if (!cancelled) setLogsLoading(false);
          }
        }
      } catch {
        if (!cancelled) setView('onboarding');
      }
    };

    void load();
    return () => {
      cancelled = true;
    };
  }, []);

  async function triggerAssistedSos(channel: 'whatsapp' | 'sms') {
    if (!profile) return;
    const contactPhone = profile.emergency_contact_1_phone || profile.emergency_contact_2_phone || '';
    if (!contactPhone.trim()) return;

    setSosSending(channel);
    try {
      let coords: { lat: number; lon: number } | null = null;
      try {
        coords = await getCurrentPosition();
      } catch {
        coords = null;
      }

      const message = buildSosMessage({
        travelerName: profile.full_name || 'Viajera VIAZA',
        destination: currentTrip?.destination ?? null,
        trackingUrl: `https://appviaza.com/emergency/${profile.public_token}`,
        lat: coords?.lat ?? null,
        lon: coords?.lon ?? null,
      });

      sendAssistedSos({
        channel,
        phone: contactPhone,
        message,
      });
    } finally {
      setSosSending(null);
    }
  }

  // ── Loading ──────────────────────────────────────────────────────────────
  if (view === 'loading') {
    return (
      <div style={{ background: C.cream, minHeight: '100dvh', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: 'Questrial, sans-serif' }}>
        <div style={{ textAlign: 'center' }}>
          <div style={{ width: 48, height: 48, border: `4px solid ${C.accent}`, borderTopColor: 'transparent', borderRadius: '50%', animation: 'spin 0.9s linear infinite', margin: '0 auto 16px' }}/>
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
        onSaved={saved => {
          setProfile(saved);
          setView('overview');
          setLogsLoading(true);
          void getEmergencyQrAccessLogs(10)
            .then(setQrAccessLogs)
            .finally(() => setLogsLoading(false));
        }}
      />
    );
  }

  // ── Onboarding (no profile yet) ───────────────────────────────────────────
  if (view === 'onboarding') {
    return (
      <div style={{ background: C.cream, minHeight: '100dvh', fontFamily: 'Questrial, sans-serif' }}>
        {/* Header */}
        <div style={{ background: `linear-gradient(160deg, ${C.dark} 0%, ${C.teal} 70%, ${C.accent} 100%)`, padding: '56px 24px 36px', borderBottomLeftRadius: 32, borderBottomRightRadius: 32 }}>
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
          {BENEFITS.map(({ icon, title, desc }) => (
            <div key={title} style={{ display: 'flex', gap: 14, marginBottom: 20 }}>
              <div
                style={{
                  width: 44,
                  height: 44,
                  borderRadius: 14,
                  background: 'rgba(234,153,64,0.14)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  flexShrink: 0,
                  overflow: 'hidden',
                }}
              >
                <BenefitIcon kind={icon} />
              </div>
              <div>
                <div style={{ color: C.dark, fontSize: 15, fontWeight: 700 }}>{title}</div>
                <div style={{ color: C.muted, fontSize: 13, marginTop: 2 }}>{desc}</div>
              </div>
            </div>
          ))}

          <motion.button
            whileTap={{ scale: 0.97 }}
            onClick={() => setView('edit')}
            style={{ width: '100%', background: `linear-gradient(135deg, ${C.accent} 0%, ${C.teal} 100%)`, color: 'white', border: 'none', borderRadius: 18, padding: '17px', fontSize: 17, fontWeight: 800, cursor: 'pointer', fontFamily: 'Questrial, sans-serif', boxShadow: '0 8px 28px rgba(18,33,46,0.18)', marginTop: 8 }}
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
      <div style={{ background: `linear-gradient(160deg, ${C.dark} 0%, ${C.teal} 70%, ${C.accent} 100%)`, padding: '56px 24px 28px', borderBottomLeftRadius: 28, borderBottomRightRadius: 28 }}>
        <button onClick={() => navigate(-1)} style={{ background: 'none', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 6, marginBottom: 16, padding: 0 }}>
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="rgba(255,255,255,0.7)" strokeWidth="2.5" strokeLinecap="round"><path d="M19 12H5M12 5l-7 7 7 7"/></svg>
          <span style={{ color: 'rgba(255,255,255,0.7)', fontSize: 14, fontWeight: 600 }}>Perfil</span>
        </button>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
          <div>
            <div style={{ color: 'white', fontSize: 22, fontWeight: 800 }}>Emergency Travel Card</div>
            <div style={{ color: 'rgba(255,255,255,0.65)', fontSize: 13, marginTop: 4 }}>{profile!.full_name}</div>
          </div>
          <div style={{ background: profile!.qr_enabled && profile!.consent_public_display ? 'rgba(108,163,162,0.22)' : 'rgba(255,255,255,0.15)', borderRadius: 20, padding: '4px 12px', display: 'flex', alignItems: 'center', gap: 5 }}>
            <div style={{ width: 7, height: 7, borderRadius: '50%', background: profile!.qr_enabled && profile!.consent_public_display ? C.soft : 'rgba(255,255,255,0.5)' }}/>
            <span style={{ color: 'white', fontSize: 11, fontWeight: 700 }}>{profile!.qr_enabled && profile!.consent_public_display ? 'QR Activo' : 'QR Inactivo'}</span>
          </div>
        </div>
      </div>

      <div style={{ padding: '20px 16px 0' }}>
        {/* Acciones principales */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 16 }}>
          <motion.button whileTap={{ scale: 0.96 }} onClick={() => setShowQR(true)}
            style={{ background: `linear-gradient(135deg, ${C.accent}, ${C.teal})`, color: 'white', border: 'none', borderRadius: 18, padding: '18px 14px', cursor: 'pointer', fontFamily: 'Questrial, sans-serif', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8, boxShadow: '0 6px 20px rgba(18,33,46,0.18)' }}>
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

        <div style={{ background: 'white', borderRadius: 22, padding: '16px 14px', marginBottom: 14, boxShadow: '0 2px 12px rgba(18,33,46,0.07)' }}>
          <div style={{ color: C.dark, fontSize: 14, fontWeight: 800, marginBottom: 8 }}>SOS asistido</div>
          <div style={{ color: C.muted, fontSize: 12, marginBottom: 12 }}>
            Genera mensaje con ubicacion + link de emergencia y abre WhatsApp o SMS para enviar.
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
            <button
              type="button"
              onClick={() => void triggerAssistedSos('whatsapp')}
              disabled={sosSending !== null || !(profile?.emergency_contact_1_phone || profile?.emergency_contact_2_phone)}
              style={{
                height: 42,
                borderRadius: 12,
                border: 'none',
                background: '#307082',
                color: 'white',
                fontSize: 13,
                fontWeight: 700,
                cursor: 'pointer',
                opacity: sosSending ? 0.7 : 1,
              }}
            >
              {sosSending === 'whatsapp' ? 'Abriendo...' : 'WhatsApp SOS'}
            </button>
            <button
              type="button"
              onClick={() => void triggerAssistedSos('sms')}
              disabled={sosSending !== null || !(profile?.emergency_contact_1_phone || profile?.emergency_contact_2_phone)}
              style={{
                height: 42,
                borderRadius: 12,
                border: '1px solid rgba(18,33,46,0.18)',
                background: 'white',
                color: C.dark,
                fontSize: 13,
                fontWeight: 700,
                cursor: 'pointer',
                opacity: sosSending ? 0.7 : 1,
              }}
            >
              {sosSending === 'sms' ? 'Abriendo...' : 'SMS SOS'}
            </button>
          </div>
        </div>

        {/* Auditoría de accesos QR */}
        <div style={{ background: 'white', borderRadius: 22, padding: '20px 18px', marginBottom: 14, boxShadow: '0 2px 12px rgba(18,33,46,0.07)' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
            <div style={{ color: C.dark, fontSize: 15, fontWeight: 800 }}>Historial de escaneos QR</div>
            <button
              type="button"
              onClick={() => {
                setLogsLoading(true);
                void getEmergencyQrAccessLogs(10)
                  .then(setQrAccessLogs)
                  .finally(() => setLogsLoading(false));
              }}
              style={{
                border: 'none',
                background: 'rgba(18,33,46,0.07)',
                color: C.dark,
                borderRadius: 10,
                padding: '6px 10px',
                fontSize: 12,
                fontWeight: 700,
                cursor: 'pointer',
                fontFamily: 'Questrial, sans-serif',
              }}
            >
              Actualizar
            </button>
          </div>
          {logsLoading ? (
            <div style={{ color: C.muted, fontSize: 13 }}>Cargando accesos...</div>
          ) : qrAccessLogs.length === 0 ? (
            <div style={{ color: C.muted, fontSize: 13 }}>Aún no hay escaneos registrados.</div>
          ) : (
            <div>
              {qrAccessLogs.map((log) => (
                <div key={log.id} style={{ borderTop: '1px solid rgba(18,33,46,0.06)', padding: '10px 0' }}>
                  <div style={{ color: C.dark, fontSize: 13, fontWeight: 700 }}>
                    {normalizeSource(log.source)}
                  </div>
                  <div style={{ color: C.muted, fontSize: 12, marginTop: 2 }}>
                    {formatAccessDate(log.accessed_at)}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Resumen médico */}
        <div style={{ background: 'white', borderRadius: 22, padding: '20px 18px', marginBottom: 14, boxShadow: '0 2px 12px rgba(18,33,46,0.07)' }}>
          <div style={{ color: C.dark, fontSize: 15, fontWeight: 800, marginBottom: 16 }}>Resumen médico</div>
          {profile!.blood_type && (
            <div style={{ display: 'inline-flex', alignItems: 'center', gap: 6, background: 'rgba(234,153,64,0.12)', borderRadius: 20, padding: '6px 14px', marginBottom: 12, marginRight: 8 }}>
              <span style={{ color: C.accent, fontSize: 15, fontWeight: 900 }}>{profile!.blood_type}</span>
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
          <div style={{ background: 'rgba(234,153,64,0.10)', border: '1.5px solid rgba(234,153,64,0.22)', borderRadius: 18, padding: '16px 18px', marginBottom: 14 }}>
            <div style={{ color: C.dark, fontSize: 14, fontWeight: 800, marginBottom: 4 }}>QR desactivado</div>
            <div style={{ color: C.muted, fontSize: 13, opacity: 0.9, marginBottom: 12 }}>Para que tu QR sea escaneable debes activar "QR público" y dar tu consentimiento de visualización.</div>
            <button onClick={() => setView('edit')} style={{ background: C.accent, color: 'white', border: 'none', borderRadius: 12, padding: '10px 18px', fontSize: 13, fontWeight: 700, cursor: 'pointer', fontFamily: 'Questrial, sans-serif' }}>
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
