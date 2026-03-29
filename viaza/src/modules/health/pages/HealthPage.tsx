// src/modules/health/pages/HealthPage.tsx
// Health Travel Module — VIAZA Producción
//
// PALETA OFICIAL (INMUTABLE):
//   Primary    #12212E
//   Secondary  #307082
//   Soft Teal  #6CA3A2
//   Background #ECE7DC
//   Accent     #EA9940
//
// REGLA: CERO emojis, CERO colores fuera de paleta.

import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useAppStore } from '../../../app/store/useAppStore';
import {
  getMedications,
  saveMedication,
  deleteMedication,
  toggleMedicationPacked,
  getHealthConditions,
  saveHealthConditions,
  EMPTY_CONDITIONS,
} from '../../../services/healthService';
import type {
  HealthMedication,
  HealthConditions,
  MedicationForm,
  ConditionsForm,
  DoseUnit,
} from '../../../services/healthService';

const P = {
  primary:    '#12212E',
  secondary:  '#307082',
  softTeal:   '#6CA3A2',
  background: '#ECE7DC',
  accent:     '#EA9940',
  muted:      'rgba(18,33,46,0.5)',
  card:       'white',
  border:     'rgba(18,33,46,0.10)',
} as const;

// ─── Íconos SVG ─────────────────────────────────────────────────────────────

function IconPill() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke={P.accent} strokeWidth="2.2" strokeLinecap="round">
      <path d="M10.5 20.5 3.5 13.5a5 5 0 1 1 7-7l7 7a5 5 0 1 1-7 7z"/>
      <line x1="8.5" y1="8.5" x2="15.5" y2="15.5"/>
    </svg>
  );
}

function IconHeart() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke={P.secondary} strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/>
    </svg>
  );
}

function IconCheck() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="20 6 9 17 4 12"/>
    </svg>
  );
}

function IconPlus() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
      <line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/>
    </svg>
  );
}

function IconTrash() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke={P.muted} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14H6L5 6"/><path d="M10 11v6"/><path d="M14 11v6"/><path d="M9 6V4h6v2"/>
    </svg>
  );
}

function IconCritical() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill={P.accent} stroke={P.accent} strokeWidth="1">
      <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/>
      <line x1="12" y1="9" x2="12" y2="13" stroke="white" strokeWidth="2" strokeLinecap="round"/>
      <line x1="12" y1="17" x2="12.01" y2="17" stroke="white" strokeWidth="2" strokeLinecap="round"/>
    </svg>
  );
}

function IconBack() {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke={P.primary} strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M19 12H5M12 19l-7-7 7-7"/>
    </svg>
  );
}

// ─── Helpers ─────────────────────────────────────────────────────────────────

function formatTime(t: string): string {
  try {
    const [h, m] = t.split(':');
    const hour = parseInt(h, 10);
    const ampm = hour >= 12 ? 'pm' : 'am';
    const h12 = hour % 12 || 12;
    return `${h12}:${m} ${ampm}`;
  } catch {
    return t;
  }
}

const DOSE_UNITS: DoseUnit[] = ['tableta', 'capsula', 'mg', 'ml', 'gota', 'unidad', 'otro'];

const CONDITION_LABELS: Record<keyof ConditionsForm, string> = {
  is_pregnant:              'Embarazo',
  is_diabetic:              'Diabetes',
  is_hypertensive:          'Hipertensión',
  has_asthma:               'Asma',
  has_severe_allergy:       'Alergia grave',
  has_reduced_mobility:     'Movilidad reducida',
  is_traveling_with_baby:   'Viaja con bebé',
  is_traveling_with_elderly:'Viaja con adulto mayor',
  is_traveling_with_pet:    'Viaja con mascota',
  allergy_details:          'Detalles de alergias',
  other_conditions:         'Otras condiciones',
  dietary_restrictions:     'Restricciones alimentarias',
};

// ─── Form vacío ───────────────────────────────────────────────────────────────

function emptyMedForm(tripId: string | null): MedicationForm {
  return {
    trip_id: tripId,
    name: '',
    dose_amount: null,
    dose_unit: 'tableta',
    frequency_label: 'Cada 8 horas',
    times: ['08:00'],
    notes: null,
    quantity_total: null,
    is_critical: false,
    packed: false,
  };
}

// ─── Componente Toggle ────────────────────────────────────────────────────────

function Toggle({ value, onChange }: { value: boolean; onChange: (v: boolean) => void }) {
  return (
    <button
      type="button"
      onClick={() => onChange(!value)}
      style={{
        width: 44, height: 26, borderRadius: 13, border: 'none', cursor: 'pointer',
        background: value ? P.accent : 'rgba(18,33,46,0.15)',
        position: 'relative', flexShrink: 0, transition: 'background 0.2s',
      }}
    >
      <span style={{
        position: 'absolute', top: 3,
        left: value ? 21 : 3,
        width: 20, height: 20, borderRadius: '50%',
        background: 'white', boxShadow: '0 2px 6px rgba(0,0,0,0.2)',
        transition: 'left 0.2s',
      }}/>
    </button>
  );
}

// ─── Componente Input inline ──────────────────────────────────────────────────

function FInput({
  value, onChange, placeholder, type = 'text',
}: {
  value: string; onChange: (v: string) => void; placeholder?: string; type?: string;
}) {
  return (
    <input
      type={type}
      value={value}
      placeholder={placeholder}
      onChange={e => onChange(e.target.value)}
      style={{
        width: '100%', background: 'rgba(18,33,46,0.04)',
        border: `1.5px solid ${P.border}`, borderRadius: 12,
        padding: '10px 14px', fontSize: 14, color: P.primary,
        fontFamily: 'Questrial, sans-serif', outline: 'none', boxSizing: 'border-box',
      }}
    />
  );
}

// ─── Formulario de medicamento ────────────────────────────────────────────────

interface MedFormProps {
  initial: MedicationForm;
  onSave: (f: MedicationForm) => void;
  onCancel: () => void;
  loading: boolean;
}

function MedForm({ initial, onSave, onCancel, loading }: MedFormProps) {
  const [f, setF] = useState<MedicationForm>(initial);

  const upd = useCallback(<K extends keyof MedicationForm>(k: K, v: MedicationForm[K]) => {
    setF(prev => ({ ...prev, [k]: v }));
  }, []);

  function addTime() {
    setF(prev => ({ ...prev, times: [...prev.times, '08:00'] }));
  }

  function removeTime(i: number) {
    setF(prev => ({ ...prev, times: prev.times.filter((_, idx) => idx !== i) }));
  }

  function updateTime(i: number, v: string) {
    setF(prev => {
      const t = [...prev.times];
      t[i] = v;
      return { ...prev, times: t };
    });
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
      {/* Nombre */}
      <div>
        <div style={{ fontSize: 11, fontWeight: 700, color: P.muted, letterSpacing: 0.8, textTransform: 'uppercase', marginBottom: 5 }}>Medicamento</div>
        <FInput value={f.name} onChange={v => upd('name', v)} placeholder="Metformina, Omeprazol..." />
      </div>

      {/* Dosis */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
        <div>
          <div style={{ fontSize: 11, fontWeight: 700, color: P.muted, letterSpacing: 0.8, textTransform: 'uppercase', marginBottom: 5 }}>Cantidad</div>
          <FInput value={f.dose_amount?.toString() ?? ''} onChange={v => upd('dose_amount', v ? parseFloat(v) : null)} type="number" placeholder="500" />
        </div>
        <div>
          <div style={{ fontSize: 11, fontWeight: 700, color: P.muted, letterSpacing: 0.8, textTransform: 'uppercase', marginBottom: 5 }}>Unidad</div>
          <select
            value={f.dose_unit}
            onChange={e => upd('dose_unit', e.target.value as DoseUnit)}
            style={{ width: '100%', background: 'rgba(18,33,46,0.04)', border: `1.5px solid ${P.border}`, borderRadius: 12, padding: '10px 14px', fontSize: 14, color: P.primary, fontFamily: 'Questrial, sans-serif', outline: 'none' }}
          >
            {DOSE_UNITS.map(u => <option key={u} value={u}>{u}</option>)}
          </select>
        </div>
      </div>

      {/* Frecuencia */}
      <div>
        <div style={{ fontSize: 11, fontWeight: 700, color: P.muted, letterSpacing: 0.8, textTransform: 'uppercase', marginBottom: 5 }}>Frecuencia</div>
        <FInput value={f.frequency_label} onChange={v => upd('frequency_label', v)} placeholder="Cada 8 horas, 1 vez al día..." />
      </div>

      {/* Horarios */}
      <div>
        <div style={{ fontSize: 11, fontWeight: 700, color: P.muted, letterSpacing: 0.8, textTransform: 'uppercase', marginBottom: 8 }}>Horarios de toma</div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          {f.times.map((t, i) => (
            <div key={i} style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
              <input
                type="time"
                value={t}
                onChange={e => updateTime(i, e.target.value)}
                style={{ flex: 1, background: 'rgba(18,33,46,0.04)', border: `1.5px solid ${P.border}`, borderRadius: 12, padding: '10px 14px', fontSize: 14, color: P.primary, fontFamily: 'Questrial, sans-serif', outline: 'none' }}
              />
              {f.times.length > 1 && (
                <button type="button" onClick={() => removeTime(i)} style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 4 }}>
                  <IconTrash />
                </button>
              )}
            </div>
          ))}
          <button
            type="button"
            onClick={addTime}
            style={{ alignSelf: 'flex-start', background: 'none', border: `1.5px dashed ${P.border}`, borderRadius: 10, padding: '6px 14px', fontSize: 13, color: P.secondary, cursor: 'pointer', fontFamily: 'Questrial, sans-serif' }}
          >
            + Agregar horario
          </button>
        </div>
      </div>

      {/* Cantidad a llevar */}
      <div>
        <div style={{ fontSize: 11, fontWeight: 700, color: P.muted, letterSpacing: 0.8, textTransform: 'uppercase', marginBottom: 5 }}>Cantidad a llevar (piezas)</div>
        <FInput value={f.quantity_total?.toString() ?? ''} onChange={v => upd('quantity_total', v ? parseInt(v) : null)} type="number" placeholder="30" />
      </div>

      {/* Notas */}
      <div>
        <div style={{ fontSize: 11, fontWeight: 700, color: P.muted, letterSpacing: 0.8, textTransform: 'uppercase', marginBottom: 5 }}>Notas (opcional)</div>
        <textarea
          value={f.notes ?? ''}
          onChange={e => upd('notes', e.target.value || null)}
          placeholder="Tomar con alimentos, refrigerar..."
          rows={2}
          style={{ width: '100%', background: 'rgba(18,33,46,0.04)', border: `1.5px solid ${P.border}`, borderRadius: 12, padding: '10px 14px', fontSize: 14, color: P.primary, fontFamily: 'Questrial, sans-serif', outline: 'none', resize: 'none', boxSizing: 'border-box' }}
        />
      </div>

      {/* Crítico */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '10px 0', borderTop: `1px solid ${P.border}` }}>
        <div>
          <div style={{ color: P.primary, fontSize: 14, fontWeight: 600 }}>Medicamento crítico</div>
          <div style={{ color: P.muted, fontSize: 12, marginTop: 2 }}>Aparece siempre en la lista de prioridades</div>
        </div>
        <Toggle value={f.is_critical} onChange={v => upd('is_critical', v)} />
      </div>

      {/* Botones */}
      <div style={{ display: 'flex', gap: 10, paddingTop: 4 }}>
        <button
          type="button"
          onClick={onCancel}
          style={{ flex: 1, background: 'none', border: `1.5px solid ${P.border}`, borderRadius: 14, padding: '13px', fontSize: 14, color: P.primary, cursor: 'pointer', fontFamily: 'Questrial, sans-serif' }}
        >
          Cancelar
        </button>
        <button
          type="button"
          onClick={() => onSave(f)}
          disabled={loading || !f.name.trim()}
          style={{ flex: 1, background: P.accent, border: 'none', borderRadius: 14, padding: '13px', fontSize: 14, fontWeight: 700, color: P.primary, cursor: 'pointer', fontFamily: 'Questrial, sans-serif', opacity: loading || !f.name.trim() ? 0.5 : 1 }}
        >
          {loading ? 'Guardando...' : 'Guardar'}
        </button>
      </div>
    </div>
  );
}

// ─── Card de medicamento ──────────────────────────────────────────────────────

function MedCard({
  med,
  onTogglePacked,
  onDelete,
}: {
  med: HealthMedication;
  onTogglePacked: (id: string, packed: boolean) => void;
  onDelete: (id: string) => void;
}) {
  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -8 }}
      style={{
        background: P.card, borderRadius: 16, padding: '16px 18px',
        boxShadow: '0 2px 12px rgba(18,33,46,0.06)',
        border: med.is_critical ? `1.5px solid rgba(234,153,64,0.4)` : `1px solid ${P.border}`,
      }}
    >
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 10 }}>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 4 }}>
            {med.is_critical && <IconCritical />}
            <span style={{ fontSize: 15, fontWeight: 700, color: P.primary, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{med.name}</span>
          </div>
          <div style={{ fontSize: 12, color: P.muted }}>
            {med.dose_amount && `${med.dose_amount} ${med.dose_unit} · `}{med.frequency_label}
          </div>
          {med.times.length > 0 && (
            <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', marginTop: 6 }}>
              {med.times.map((t, i) => (
                <span key={i} style={{ fontSize: 11, background: `rgba(48,112,130,0.10)`, color: P.secondary, borderRadius: 8, padding: '3px 8px', fontWeight: 600 }}>
                  {formatTime(t)}
                </span>
              ))}
            </div>
          )}
          {med.quantity_total && (
            <div style={{ fontSize: 12, color: P.muted, marginTop: 4 }}>
              Llevar: {med.quantity_total} piezas
            </div>
          )}
          {med.notes && (
            <div style={{ fontSize: 12, color: P.muted, marginTop: 4, fontStyle: 'italic' }}>{med.notes}</div>
          )}
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 8, flexShrink: 0 }}>
          {/* Packed toggle */}
          <button
            type="button"
            onClick={() => onTogglePacked(med.id, !med.packed)}
            style={{
              width: 32, height: 32, borderRadius: 10,
              background: med.packed ? P.secondary : 'rgba(18,33,46,0.07)',
              border: 'none', cursor: 'pointer',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              transition: 'background 0.2s',
            }}
          >
            {med.packed
              ? <IconCheck />
              : <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke={P.muted} strokeWidth="2.2" strokeLinecap="round"><polyline points="20 6 9 17 4 12"/></svg>
            }
          </button>
          {/* Borrar */}
          <button
            type="button"
            onClick={() => onDelete(med.id)}
            style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 4 }}
          >
            <IconTrash />
          </button>
        </div>
      </div>
    </motion.div>
  );
}

// ─── Panel de condiciones ─────────────────────────────────────────────────────

const BOOLEAN_CONDITION_KEYS = [
  'is_pregnant', 'is_diabetic', 'is_hypertensive', 'has_asthma',
  'has_severe_allergy', 'has_reduced_mobility',
  'is_traveling_with_baby', 'is_traveling_with_elderly', 'is_traveling_with_pet',
] as const;

const TEXT_CONDITION_KEYS = ['allergy_details', 'other_conditions', 'dietary_restrictions'] as const;

function ConditionsPanel({
  initial,
  onSave,
  loading,
}: {
  initial: ConditionsForm;
  onSave: (f: ConditionsForm) => void;
  loading: boolean;
}) {
  const [f, setF] = useState<ConditionsForm>(initial);
  const [dirty, setDirty] = useState(false);

  function upd<K extends keyof ConditionsForm>(k: K, v: ConditionsForm[K]) {
    setF(prev => ({ ...prev, [k]: v }));
    setDirty(true);
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
      {/* Toggles booleanos */}
      <div style={{ background: P.card, borderRadius: 16, padding: '16px 18px', boxShadow: '0 2px 12px rgba(18,33,46,0.06)' }}>
        {BOOLEAN_CONDITION_KEYS.map((key, i) => (
          <div
            key={key}
            style={{
              display: 'flex', alignItems: 'center', justifyContent: 'space-between',
              padding: '10px 0',
              borderBottom: i < BOOLEAN_CONDITION_KEYS.length - 1 ? `1px solid ${P.border}` : 'none',
            }}
          >
            <span style={{ fontSize: 14, color: P.primary }}>{CONDITION_LABELS[key]}</span>
            <Toggle value={f[key] as boolean} onChange={v => upd(key, v as ConditionsForm[typeof key])} />
          </div>
        ))}
      </div>

      {/* Campos de texto */}
      <div style={{ background: P.card, borderRadius: 16, padding: '16px 18px', boxShadow: '0 2px 12px rgba(18,33,46,0.06)', display: 'flex', flexDirection: 'column', gap: 14 }}>
        {TEXT_CONDITION_KEYS.map(key => (
          <div key={key}>
            <div style={{ fontSize: 11, fontWeight: 700, color: P.muted, letterSpacing: 0.8, textTransform: 'uppercase', marginBottom: 5 }}>
              {CONDITION_LABELS[key]}
            </div>
            <textarea
              value={(f[key] as string | null) ?? ''}
              onChange={e => upd(key, e.target.value || null as ConditionsForm[typeof key])}
              rows={2}
              style={{ width: '100%', background: 'rgba(18,33,46,0.04)', border: `1.5px solid ${P.border}`, borderRadius: 12, padding: '10px 14px', fontSize: 14, color: P.primary, fontFamily: 'Questrial, sans-serif', outline: 'none', resize: 'none', boxSizing: 'border-box' }}
            />
          </div>
        ))}
      </div>

      {dirty && (
        <button
          type="button"
          onClick={() => { onSave(f); setDirty(false); }}
          disabled={loading}
          style={{ background: P.accent, border: 'none', borderRadius: 14, padding: '14px', fontSize: 14, fontWeight: 700, color: P.primary, cursor: 'pointer', fontFamily: 'Questrial, sans-serif', opacity: loading ? 0.6 : 1 }}
        >
          {loading ? 'Guardando...' : 'Guardar condiciones'}
        </button>
      )}
    </div>
  );
}

// ─── Página principal ─────────────────────────────────────────────────────────

type Tab = 'meds' | 'conditions';

export function HealthPage() {
  const navigate = useNavigate();
  const currentTripId = useAppStore(s => s.currentTripId);

  const [tab, setTab] = useState<Tab>('meds');
  const [medications, setMedications] = useState<HealthMedication[]>([]);
  const [conditions, setConditions] = useState<ConditionsForm>(EMPTY_CONDITIONS);
  const [loadingData, setLoadingData] = useState(true);
  const [saving, setSaving] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Carga inicial
  useEffect(() => {
    let cancelled = false;
    const load = async () => {
      setLoadingData(true);
      try {
        const [meds, conds] = await Promise.all([
          getMedications(currentTripId ?? undefined),
          getHealthConditions(),
        ]);
        if (!cancelled) {
          setMedications(meds);
          if (conds) setConditions(conds);
        }
      } catch (e) {
        if (!cancelled) setError(e instanceof Error ? e.message : 'Error al cargar');
      } finally {
        if (!cancelled) setLoadingData(false);
      }
    };
    void load();
    return () => { cancelled = true; };
  }, [currentTripId]);

  const handleSaveMed = useCallback(async (form: MedicationForm) => {
    setSaving(true);
    setError(null);
    try {
      const saved = await saveMedication(form);
      setMedications(prev => [saved, ...prev]);
      setShowForm(false);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Error al guardar');
    } finally {
      setSaving(false);
    }
  }, []);

  const handleTogglePacked = useCallback(async (id: string, packed: boolean) => {
    setMedications(prev => prev.map(m => m.id === id ? { ...m, packed } : m));
    try {
      await toggleMedicationPacked(id, packed);
    } catch {
      setMedications(prev => prev.map(m => m.id === id ? { ...m, packed: !packed } : m));
    }
  }, []);

  const handleDelete = useCallback(async (id: string) => {
    setMedications(prev => prev.filter(m => m.id !== id));
    try {
      await deleteMedication(id);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Error al eliminar');
    }
  }, []);

  const handleSaveConditions = useCallback(async (form: ConditionsForm) => {
    setSaving(true);
    setError(null);
    try {
      await saveHealthConditions(form);
      setConditions(form);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Error al guardar');
    } finally {
      setSaving(false);
    }
  }, []);

  const criticalMeds = medications.filter(m => m.is_critical);
  const unpackedCritical = criticalMeds.filter(m => !m.packed);

  return (
    <div style={{ minHeight: '100vh', background: P.background, fontFamily: 'Questrial, sans-serif' }}>
      {/* Header */}
      <div style={{ position: 'sticky', top: 0, zIndex: 50, background: P.background, padding: '18px 20px 0' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 18 }}>
          <button type="button" onClick={() => navigate(-1)} style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 4 }}>
            <IconBack />
          </button>
          <div>
            <div style={{ fontSize: 20, fontWeight: 800, color: P.primary }}>Salud del viaje</div>
            <div style={{ fontSize: 12, color: P.muted }}>Medicamentos y condiciones especiales</div>
          </div>
        </div>

        {/* Alert crítico */}
        {unpackedCritical.length > 0 && (
          <div style={{ background: `rgba(234,153,64,0.15)`, border: `1.5px solid rgba(234,153,64,0.35)`, borderRadius: 14, padding: '12px 16px', marginBottom: 14, display: 'flex', gap: 10, alignItems: 'center' }}>
            <IconCritical />
            <div>
              <div style={{ fontSize: 13, fontWeight: 700, color: P.primary }}>
                {unpackedCritical.length} medicamento{unpackedCritical.length > 1 ? 's' : ''} critico{unpackedCritical.length > 1 ? 's' : ''} sin empacar
              </div>
              <div style={{ fontSize: 12, color: P.muted }}>{unpackedCritical.map(m => m.name).join(', ')}</div>
            </div>
          </div>
        )}

        {/* Tabs */}
        <div style={{ display: 'flex', gap: 8, marginBottom: 16 }}>
          {(['meds', 'conditions'] as Tab[]).map(t => (
            <button
              key={t}
              type="button"
              onClick={() => setTab(t)}
              style={{
                flex: 1, padding: '10px', borderRadius: 12, border: 'none',
                cursor: 'pointer', fontSize: 13, fontWeight: 700,
                fontFamily: 'Questrial, sans-serif',
                background: tab === t ? P.primary : 'rgba(18,33,46,0.07)',
                color: tab === t ? P.background : P.primary,
                transition: 'all 0.2s',
              }}
            >
              {t === 'meds' ? 'Medicamentos' : 'Mi perfil de salud'}
            </button>
          ))}
        </div>
      </div>

      {/* Content */}
      <div style={{ padding: '0 20px 100px' }}>
        {error && (
          <div style={{ background: 'rgba(18,33,46,0.07)', border: `1.5px solid ${P.border}`, borderRadius: 12, padding: '12px 16px', marginBottom: 14, fontSize: 13, color: P.primary }}>
            {error}
          </div>
        )}

        {loadingData ? (
          <div style={{ textAlign: 'center', padding: '60px 0', color: P.muted, fontSize: 14 }}>Cargando...</div>
        ) : (
          <AnimatePresence mode="wait">
            {tab === 'meds' ? (
              <motion.div key="meds" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                {/* Form de nuevo medicamento */}
                <AnimatePresence>
                  {showForm && (
                    <motion.div
                      key="form"
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -10 }}
                      style={{ background: P.card, borderRadius: 18, padding: '18px', boxShadow: '0 4px 20px rgba(18,33,46,0.10)', border: `1.5px solid ${P.border}` }}
                    >
                      <div style={{ fontSize: 15, fontWeight: 800, color: P.primary, marginBottom: 16 }}>Agregar medicamento</div>
                      <MedForm
                        initial={emptyMedForm(currentTripId)}
                        onSave={handleSaveMed}
                        onCancel={() => setShowForm(false)}
                        loading={saving}
                      />
                    </motion.div>
                  )}
                </AnimatePresence>

                {/* Lista */}
                {medications.length === 0 && !showForm ? (
                  <div style={{ textAlign: 'center', padding: '48px 0', color: P.muted }}>
                    <div style={{ marginBottom: 12 }}><IconPill /></div>
                    <div style={{ fontSize: 15, fontWeight: 700, color: P.primary }}>Sin medicamentos registrados</div>
                    <div style={{ fontSize: 13, marginTop: 4 }}>Agrega tus medicamentos para el viaje</div>
                  </div>
                ) : (
                  <AnimatePresence>
                    {medications.map(m => (
                      <MedCard
                        key={m.id}
                        med={m}
                        onTogglePacked={handleTogglePacked}
                        onDelete={handleDelete}
                      />
                    ))}
                  </AnimatePresence>
                )}
              </motion.div>
            ) : (
              <motion.div key="conds" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                <ConditionsPanel
                  initial={conditions}
                  onSave={handleSaveConditions}
                  loading={saving}
                />
              </motion.div>
            )}
          </AnimatePresence>
        )}
      </div>

      {/* FAB para agregar medicamento */}
      {tab === 'meds' && !showForm && (
        <button
          type="button"
          onClick={() => setShowForm(true)}
          style={{
            position: 'fixed', bottom: 28, right: 24,
            width: 56, height: 56, borderRadius: '50%',
            background: P.accent, border: 'none', cursor: 'pointer',
            boxShadow: '0 6px 20px rgba(234,153,64,0.35)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            color: P.primary,
          }}
        >
          <IconPlus />
        </button>
      )}
    </div>
  );
}
