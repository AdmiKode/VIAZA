import { useState } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import type { EmergencyProfileForm } from '../../../types/emergency';
import { BLOOD_TYPES, EMPTY_EMERGENCY_FORM } from '../../../types/emergency';
import { saveEmergencyProfile } from '../../../services/emergencyService';
import type { EmergencyProfile } from '../../../types/emergency';
import { supabase } from '../../../services/supabaseClient';

const C = { dark: '#12212E', cream: '#ECE7DC', accent: '#EA9940', teal: '#307082', soft: '#6CA3A2', muted: 'rgba(18,33,46,0.50)' };

interface Props {
  initial: EmergencyProfileForm;
  onSaved: (profile: EmergencyProfile) => void;
}

// ─── Sección genérica ────────────────────────────────────────────────────────
function Section({ title, icon, children }: { title: string; icon: React.ReactNode; children: React.ReactNode }) {
  return (
    <div style={{ background: 'white', borderRadius: 20, padding: '20px 18px', boxShadow: '0 2px 12px rgba(18,33,46,0.07)', marginBottom: 14 }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 16 }}>
        <div style={{ width: 36, height: 36, borderRadius: 11, background: 'rgba(18,33,46,0.07)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>{icon}</div>
        <span style={{ color: C.dark, fontSize: 15, fontWeight: 800 }}>{title}</span>
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>{children}</div>
    </div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <div style={{ color: C.muted, fontSize: 11, fontWeight: 700, letterSpacing: 0.8, textTransform: 'uppercase', marginBottom: 5 }}>{label}</div>
      {children}
    </div>
  );
}

function Input({ value, onChange, placeholder, type = 'text' }: { value: string; onChange: (v: string) => void; placeholder?: string; type?: string }) {
  return (
    <input
      type={type} value={value ?? ''} placeholder={placeholder}
      onChange={e => onChange(e.target.value)}
      style={{ width: '100%', background: 'rgba(18,33,46,0.04)', border: '1.5px solid rgba(18,33,46,0.10)', borderRadius: 12, padding: '11px 14px', fontSize: 14, color: C.dark, fontFamily: 'Questrial, sans-serif', outline: 'none', boxSizing: 'border-box' }}
    />
  );
}

function TextArea({ value, onChange, placeholder }: { value: string; onChange: (v: string) => void; placeholder?: string }) {
  return (
    <textarea
      value={value ?? ''} placeholder={placeholder} rows={3}
      onChange={e => onChange(e.target.value)}
      style={{ width: '100%', background: 'rgba(18,33,46,0.04)', border: '1.5px solid rgba(18,33,46,0.10)', borderRadius: 12, padding: '11px 14px', fontSize: 14, color: C.dark, fontFamily: 'Questrial, sans-serif', outline: 'none', resize: 'none', boxSizing: 'border-box' }}
    />
  );
}

function Toggle({ label, value, onChange, description }: { label: string; value: boolean; onChange: (v: boolean) => void; description?: string }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12, padding: '10px 0', borderBottom: '1px solid rgba(18,33,46,0.06)' }}>
      <div>
        <div style={{ color: C.dark, fontSize: 14, fontWeight: 600 }}>{label}</div>
        {description && <div style={{ color: C.muted, fontSize: 11, marginTop: 2 }}>{description}</div>}
      </div>
      <button type="button" onClick={() => onChange(!value)} style={{
        width: 48, height: 28, borderRadius: 14, border: 'none', cursor: 'pointer',
        background: value ? C.accent : 'rgba(18,33,46,0.15)',
        position: 'relative', flexShrink: 0, transition: 'background 0.2s',
      }}>
        <span style={{ position: 'absolute', top: 3, left: value ? 23 : 3, width: 22, height: 22, borderRadius: '50%', background: 'white', boxShadow: '0 2px 6px rgba(0,0,0,0.2)', transition: 'left 0.2s' }}/>
      </button>
    </div>
  );
}

// ─── Componente principal ────────────────────────────────────────────────────
export function EmergencyCardForm({ initial, onSaved }: Props) {
  const navigate = useNavigate();
  const [form, setForm] = useState<EmergencyProfileForm>(initial ?? EMPTY_EMERGENCY_FORM);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [uploadingPhoto, setUploadingPhoto] = useState(false);

  const set = <K extends keyof EmergencyProfileForm>(key: K, value: EmergencyProfileForm[K]) =>
    setForm(f => ({ ...f, [key]: value }));

  const handlePhotoPicked = async (file: File | null) => {
    if (!file) return;
    if (!file.type.startsWith('image/')) { setError('Selecciona una imagen válida'); return; }
    if (file.size > 5 * 1024 * 1024) { setError('La imagen debe ser menor a 5MB'); return; }

    try {
      setUploadingPhoto(true);
      setError(null);
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('No autenticado');

      const ext = (file.name.split('.').pop() ?? 'jpg').toLowerCase().replace(/[^a-z0-9]/g, '');
      const path = `${user.id}/emergency/profile_${Date.now()}.${ext || 'jpg'}`;

      const { error: upErr } = await supabase.storage
        .from('avatars')
        .upload(path, file, { upsert: true, contentType: file.type });
      if (upErr) throw upErr;

      const { data } = supabase.storage.from('avatars').getPublicUrl(path);
      if (!data?.publicUrl) throw new Error('No se pudo obtener la URL de la foto');

      set('photo_url', data.publicUrl);
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : 'Error al subir la foto');
    } finally {
      setUploadingPhoto(false);
    }
  };

  const handleSave = async () => {
    if (!form.full_name.trim()) { setError('El nombre completo es obligatorio'); return; }
    setSaving(true); setError(null);
    try {
      const saved = await saveEmergencyProfile(form);
      onSaved(saved);
      navigate('/profile/emergency');
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : 'Error al guardar');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div style={{ background: C.cream, minHeight: '100dvh', fontFamily: 'Questrial, sans-serif', paddingBottom: 120 }}>
      {/* Header */}
      <div style={{ background: `linear-gradient(160deg, ${C.dark} 0%, ${C.teal} 70%, ${C.accent} 100%)`, padding: '56px 24px 28px', borderBottomLeftRadius: 28, borderBottomRightRadius: 28 }}>
        <button type="button" onClick={() => navigate(-1)} style={{ background: 'none', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 6, marginBottom: 16, padding: 0 }}>
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="rgba(255,255,255,0.7)" strokeWidth="2.5" strokeLinecap="round"><path d="M19 12H5M12 5l-7 7 7 7"/></svg>
          <span style={{ color: 'rgba(255,255,255,0.7)', fontSize: 14, fontWeight: 600 }}>Volver</span>
        </button>
        <div style={{ color: 'white', fontSize: 26, fontWeight: 800, lineHeight: 1.1 }}>Emergency Travel Card</div>
        <div style={{ color: 'rgba(255,255,255,0.65)', fontSize: 13, marginTop: 6 }}>Tus datos de emergencia para el viaje</div>
      </div>

      <div style={{ padding: '20px 16px 0' }}>
        {/* ── Datos personales ── */}
        <Section title="Datos personales" icon={<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke={C.dark} strokeWidth="2" strokeLinecap="round"><path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>}>
          <Field label="Nombre completo *"><Input value={form.full_name} onChange={v => set('full_name', v)} placeholder="Como aparece en tu pasaporte"/></Field>
          <Field label="Foto de perfil (opcional)">
            <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
              <div style={{
                width: 64,
                height: 64,
                borderRadius: '50%',
                overflow: 'hidden',
                background: 'rgba(18,33,46,0.06)',
                border: '2px solid rgba(234,153,64,0.35)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                flexShrink: 0,
              }}>
                {form.photo_url ? (
                  <img
                    src={form.photo_url}
                    alt="Foto de perfil"
                    style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                  />
                ) : (
                  <svg width="28" height="28" viewBox="0 0 48 48" fill="none">
                    <circle cx="24" cy="18" r="10" fill={C.teal} opacity="0.35" />
                    <path d="M10 44c0-7.7 6.3-14 14-14s14 6.3 14 14" fill={C.teal} opacity="0.35" />
                    <circle cx="20" cy="14" r="5" fill="white" opacity="0.35" />
                  </svg>
                )}
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: 8, flex: 1 }}>
                <input
                  id="emergency-photo"
                  type="file"
                  accept="image/*"
                  style={{ display: 'none' }}
                  onChange={(e) => void handlePhotoPicked(e.target.files?.[0] ?? null)}
                />
                <label
                  htmlFor="emergency-photo"
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: 8,
                    height: 42,
                    borderRadius: 12,
                    background: uploadingPhoto ? 'rgba(18,33,46,0.10)' : 'rgba(48,112,130,0.10)',
                    border: '1.5px solid rgba(48,112,130,0.22)',
                    color: C.teal,
                    fontSize: 14,
                    fontWeight: 800,
                    cursor: uploadingPhoto ? 'not-allowed' : 'pointer',
                    userSelect: 'none',
                  }}
                >
                  <svg width="18" height="18" viewBox="0 0 48 48" fill="none">
                    <rect x="9" y="14" width="30" height="22" rx="7" fill={C.teal} opacity="0.25" />
                    <path d="M18 14l3-5h6l3 5" fill={C.teal} opacity="0.35" />
                    <circle cx="24" cy="25" r="6.5" fill="none" stroke={C.teal} strokeWidth="3" />
                    <circle cx="21" cy="22" r="2.5" fill="white" opacity="0.35" />
                  </svg>
                  {uploadingPhoto ? 'Subiendo…' : (form.photo_url ? 'Cambiar foto' : 'Subir foto')}
                </label>

                {form.photo_url && (
                  <button
                    type="button"
                    onClick={() => set('photo_url', null)}
                    style={{
                      height: 38,
                      borderRadius: 12,
                      background: 'rgba(234,153,64,0.10)',
                      border: '1.5px solid rgba(234,153,64,0.22)',
                      color: C.dark,
                      fontSize: 13,
                      fontWeight: 800,
                      cursor: 'pointer',
                      fontFamily: 'Questrial, sans-serif',
                    }}
                  >
                    Quitar
                  </button>
                )}
              </div>
            </div>
          </Field>
          <Field label="Fecha de nacimiento"><Input type="date" value={form.date_of_birth ?? ''} onChange={v => set('date_of_birth', v || null)}/></Field>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
            <Field label="Nacionalidad"><Input value={form.nationality ?? ''} onChange={v => set('nationality', v || null)} placeholder="Mexicana"/></Field>
            <Field label="Idioma principal"><Input value={form.primary_language ?? ''} onChange={v => set('primary_language', v || null)} placeholder="Español"/></Field>
          </div>
          <Field label="Idioma secundario"><Input value={form.secondary_language ?? ''} onChange={v => set('secondary_language', v || null)} placeholder="Inglés (opcional)"/></Field>
        </Section>

        {/* ── Datos médicos ── */}
        <Section title="Datos médicos críticos" icon={<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke={C.accent} strokeWidth="2" strokeLinecap="round"><path d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></svg>}>
          <Field label="Tipo de sangre">
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
              {BLOOD_TYPES.map(bt => (
                <button key={bt} type="button" onClick={() => set('blood_type', form.blood_type === bt ? null : bt)}
                  style={{ padding: '8px 16px', borderRadius: 10, border: '1.5px solid', cursor: 'pointer', fontWeight: 700, fontSize: 14, fontFamily: 'Questrial, sans-serif', transition: 'all 0.15s',
                    background: form.blood_type === bt ? C.accent : 'transparent',
                    borderColor: form.blood_type === bt ? C.accent : 'rgba(18,33,46,0.15)',
                    color: form.blood_type === bt ? 'white' : C.dark }}>
                  {bt}
                </button>
              ))}
            </div>
          </Field>
          <Field label="Alergias (separadas por coma)"><TextArea value={form.allergies ?? ''} onChange={v => set('allergies', v || null)} placeholder="Ej: penicilina, mariscos, látex"/></Field>
          <Field label="Medicamentos actuales"><TextArea value={form.medications ?? ''} onChange={v => set('medications', v || null)} placeholder="Ej: metformina 500mg 2 veces al día"/></Field>
          <Field label="Tratamientos actuales"><TextArea value={form.current_treatments ?? ''} onChange={v => set('current_treatments', v || null)} placeholder="Ej: quimioterapia, fisioterapia"/></Field>
          <Field label="Condiciones actuales"><TextArea value={form.current_conditions ?? ''} onChange={v => set('current_conditions', v || null)} placeholder="Ej: diabetes tipo 2, hipertensión"/></Field>
          <Field label="Notas médicas importantes"><TextArea value={form.medical_notes ?? ''} onChange={v => set('medical_notes', v || null)} placeholder="Información adicional para médicos"/></Field>
        </Section>

        {/* ── Seguro y médico ── */}
        <Section title="Seguro y médico tratante" icon={<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke={C.teal} strokeWidth="2" strokeLinecap="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
            <Field label="Aseguradora"><Input value={form.insurance_provider ?? ''} onChange={v => set('insurance_provider', v || null)} placeholder="AXA, BUPA…"/></Field>
            <Field label="Número de póliza"><Input value={form.insurance_policy_number ?? ''} onChange={v => set('insurance_policy_number', v || null)}/></Field>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
            <Field label="Médico tratante"><Input value={form.doctor_name ?? ''} onChange={v => set('doctor_name', v || null)} placeholder="Dr. García"/></Field>
            <Field label="Teléfono del médico"><Input type="tel" value={form.doctor_phone ?? ''} onChange={v => set('doctor_phone', v || null)} placeholder="+52 55 1234"/></Field>
          </div>
        </Section>

        {/* ── Contactos de emergencia ── */}
        <Section title="Contacto de emergencia 1" icon={<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke={C.accent} strokeWidth="2" strokeLinecap="round"><path d="M22 16.92v3a2 2 0 01-2.18 2 19.79 19.79 0 01-8.63-3.07A19.5 19.5 0 013.07 9.81a19.79 19.79 0 01-3.07-8.7A2 2 0 012 1h3a2 2 0 012 1.72c.127.96.361 1.903.7 2.81a2 2 0 01-.45 2.11L6.09 8.91a16 16 0 006 6l1.27-1.27a2 2 0 012.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0122 16.92z"/></svg>}>
          <Field label="Nombre"><Input value={form.emergency_contact_1_name ?? ''} onChange={v => set('emergency_contact_1_name', v || null)} placeholder="María López"/></Field>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
            <Field label="Relación"><Input value={form.emergency_contact_1_relation ?? ''} onChange={v => set('emergency_contact_1_relation', v || null)} placeholder="Madre, Pareja…"/></Field>
            <Field label="Teléfono"><Input type="tel" value={form.emergency_contact_1_phone ?? ''} onChange={v => set('emergency_contact_1_phone', v || null)} placeholder="+52 55…"/></Field>
          </div>
        </Section>

        <Section title="Contacto de emergencia 2" icon={<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke={C.accent} strokeWidth="2" strokeLinecap="round"><path d="M22 16.92v3a2 2 0 01-2.18 2 19.79 19.79 0 01-8.63-3.07A19.5 19.5 0 013.07 9.81a19.79 19.79 0 01-3.07-8.7A2 2 0 012 1h3a2 2 0 012 1.72c.127.96.361 1.903.7 2.81a2 2 0 01-.45 2.11L6.09 8.91a16 16 0 006 6l1.27-1.27a2 2 0 012.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0122 16.92z"/></svg>}>
          <Field label="Nombre"><Input value={form.emergency_contact_2_name ?? ''} onChange={v => set('emergency_contact_2_name', v || null)} placeholder="Carlos Torres (opcional)"/></Field>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
            <Field label="Relación"><Input value={form.emergency_contact_2_relation ?? ''} onChange={v => set('emergency_contact_2_relation', v || null)} placeholder="Hermano, Amigo…"/></Field>
            <Field label="Teléfono"><Input type="tel" value={form.emergency_contact_2_phone ?? ''} onChange={v => set('emergency_contact_2_phone', v || null)} placeholder="+52 55…"/></Field>
          </div>
        </Section>

        {/* ── Visibilidad pública ── */}
        <Section title="Privacidad y visibilidad pública" icon={<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke={C.teal} strokeWidth="2" strokeLinecap="round"><rect x="3" y="11" width="18" height="11" rx="2"/><path d="M7 11V7a5 5 0 0110 0v4"/></svg>}>
          <div style={{ color: C.muted, fontSize: 12, lineHeight: 1.6, marginBottom: 8 }}>
            Elige qué información verá la persona que escanee tu QR. Solo se muestra lo que tú autorices.
          </div>
          <Toggle label="Mostrar tipo de sangre" value={form.show_blood_type} onChange={v => set('show_blood_type', v)}/>
          <Toggle label="Mostrar alergias" value={form.show_allergies} onChange={v => set('show_allergies', v)}/>
          <Toggle label="Mostrar condiciones médicas" value={form.show_conditions} onChange={v => set('show_conditions', v)}/>
          <Toggle label="Mostrar medicamentos" value={form.show_medications} onChange={v => set('show_medications', v)}/>
          <Toggle label="Mostrar contactos de emergencia" value={form.show_contacts} onChange={v => set('show_contacts', v)}/>
          <Toggle label="Mostrar datos del seguro" value={form.show_insurance} onChange={v => set('show_insurance', v)}/>
          <Toggle label="Mostrar notas médicas" value={form.show_notes} onChange={v => set('show_notes', v)}/>
        </Section>

        {/* ── Control QR ── */}
        <Section title="Control del QR" icon={<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke={C.accent} strokeWidth="2" strokeLinecap="round"><rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/><path d="M14 14h3v3M17 20h3M20 17v3"/></svg>}>
          <Toggle
            label="Activar QR público"
            description="Cuando está activo, tu QR puede ser escaneado por cualquier persona"
            value={form.qr_enabled}
            onChange={v => set('qr_enabled', v)}
          />
          <Toggle
            label="Consentimiento de visualización pública"
            description="Confirmo que consiento mostrar los datos seleccionados públicamente a través del QR"
            value={form.consent_public_display}
            onChange={v => set('consent_public_display', v)}
          />
          {form.qr_enabled && !form.consent_public_display && (
            <div style={{ background: 'rgba(234,153,64,0.10)', border: '1px solid rgba(234,153,64,0.22)', borderRadius: 12, padding: '10px 14px', color: C.dark, fontSize: 12, fontWeight: 600 }}>
              Debes activar el consentimiento para que el QR sea visible públicamente.
            </div>
          )}
        </Section>

        {/* Error */}
        {error && (
          <div style={{ background: 'rgba(234,153,64,0.10)', border: '1px solid rgba(234,153,64,0.22)', borderRadius: 14, padding: '12px 16px', color: C.dark, fontSize: 14, marginBottom: 14 }}>
            {error}
          </div>
        )}

        {/* Guardar */}
        <motion.button
          whileTap={{ scale: 0.97 }}
          type="button"
          onClick={handleSave}
          disabled={saving}
          style={{ width: '100%', background: `linear-gradient(135deg, ${C.accent} 0%, ${C.teal} 100%)`, color: 'white', border: 'none', borderRadius: 18, padding: '17px', fontSize: 17, fontWeight: 800, cursor: saving ? 'not-allowed' : 'pointer', fontFamily: 'Questrial, sans-serif', boxShadow: '0 8px 28px rgba(18,33,46,0.18)', opacity: saving ? 0.7 : 1 }}
        >
          {saving ? 'Guardando...' : 'Guardar Emergency Card'}
        </motion.button>
      </div>
    </div>
  );
}
