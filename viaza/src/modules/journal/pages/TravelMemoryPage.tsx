// src/modules/journal/pages/TravelMemoryPage.tsx
// Bitácora de viaje — crear, ver y eliminar entradas con mood, tags y ubicación.
// Sin emojis. Paleta oficial VIAZA.

import { useState, useEffect, useCallback } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { useAppStore } from '../../../app/store/useAppStore';
import {
  getJournalEntries,
  createJournalEntry,
  deleteJournalEntry,
  MOOD_LABELS,
  MOOD_COLORS,
  type JournalEntry,
  type JournalMood,
} from '../../../services/journalService';

const P = {
  primary:  '#12212E',
  secondary:'#307082',
  softTeal: '#6CA3A2',
  bg:       '#ECE7DC',
  accent:   '#EA9940',
  rgb:      '18,33,46',
};

const MOODS: JournalMood[] = ['great', 'good', 'neutral', 'tired', 'bad'];

const SUGGESTED_TAGS = ['gastronomia', 'transporte', 'alojamiento', 'cultura', 'naturaleza', 'compras', 'gente', 'incidente'];

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString('es-MX', { weekday: 'short', day: 'numeric', month: 'short', year: 'numeric' });
}

export function TravelMemoryPage() {
  const navigate = useNavigate();
  const currentTripId = useAppStore((s) => s.currentTripId);

  const [entries, setEntries] = useState<JournalEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);

  // Form state
  const [title, setTitle] = useState('');
  const [body, setBody] = useState('');
  const [mood, setMood] = useState<JournalMood | undefined>(undefined);
  const [tags, setTags] = useState<string[]>([]);
  const [customTag, setCustomTag] = useState('');
  const [saving, setSaving] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const data = await getJournalEntries(currentTripId ?? undefined);
      setEntries(data);
    } catch { /* silenciar */ }
    finally { setLoading(false); }
  }, [currentTripId]);

  useEffect(() => { void load(); }, [load]);

  function toggleTag(tag: string) {
    setTags((prev) => prev.includes(tag) ? prev.filter((t) => t !== tag) : [...prev, tag]);
  }

  function addCustomTag() {
    const t = customTag.trim().toLowerCase().replace(/\s+/g, '-');
    if (t && !tags.includes(t)) setTags((prev) => [...prev, t]);
    setCustomTag('');
  }

  async function handleSave() {
    if (!body.trim()) { setFormError('El contenido no puede estar vacío'); return; }
    setSaving(true);
    setFormError(null);
    try {
      await createJournalEntry({
        tripId: currentTripId ?? undefined,
        title: title.trim() || undefined,
        body: body.trim(),
        mood,
        tags,
      });
      setTitle(''); setBody(''); setMood(undefined); setTags([]); setCustomTag('');
      setShowForm(false);
      await load();
    } catch (e) {
      setFormError((e as Error).message ?? 'Error guardando');
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete(id: string) {
    try {
      await deleteJournalEntry(id);
      setEntries((prev) => prev.filter((e) => e.id !== id));
    } catch { /* silenciar */ }
  }

  return (
    <div style={{ minHeight: '100vh', background: P.bg, paddingBottom: 100, fontFamily: 'Questrial, sans-serif' }}>

      {/* Header */}
      <div style={{ background: `linear-gradient(160deg, ${P.primary} 0%, ${P.secondary} 100%)`, padding: '52px 20px 24px' }}>
        <button onClick={() => navigate(-1)} style={{ background: 'none', border: 'none', color: 'rgba(255,255,255,0.7)', fontSize: 13, cursor: 'pointer', marginBottom: 12, padding: 0 }}>
          Atras
        </button>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
          <div>
            <div style={{ fontSize: 22, fontWeight: 700, color: '#fff' }}>Bitacora de viaje</div>
            <div style={{ fontSize: 13, color: 'rgba(255,255,255,0.65)', marginTop: 4 }}>
              {entries.length} {entries.length === 1 ? 'momento registrado' : 'momentos registrados'}
            </div>
          </div>
          <button
            onClick={() => setShowForm((v) => !v)}
            style={{ background: P.accent, border: 'none', borderRadius: 12, padding: '10px 18px', color: '#fff', fontSize: 13, fontWeight: 700, cursor: 'pointer' }}
          >
            {showForm ? 'Cancelar' : '+ Nuevo'}
          </button>
        </div>
      </div>

      <div style={{ padding: '20px' }}>

        {/* Formulario */}
        <AnimatePresence>
          {showForm && (
            <motion.div
              initial={{ opacity: 0, y: -12 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -12 }}
              style={{ background: '#fff', borderRadius: 16, padding: '20px', marginBottom: 20, boxShadow: `0 4px 20px rgba(${P.rgb},0.1)` }}
            >
              <div style={{ fontSize: 14, fontWeight: 700, color: P.primary, marginBottom: 14 }}>Nuevo momento</div>

              {/* Titulo */}
              <input
                type="text"
                placeholder="Titulo (opcional)"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                style={{ width: '100%', boxSizing: 'border-box', padding: '10px 12px', borderRadius: 10, border: `1px solid rgba(${P.rgb},0.15)`, fontSize: 13, color: P.primary, background: `rgba(${P.rgb},0.04)`, outline: 'none', marginBottom: 10 }}
              />

              {/* Cuerpo */}
              <textarea
                placeholder="Que paso hoy? Que recuerdas? Que sentiste?"
                value={body}
                onChange={(e) => setBody(e.target.value)}
                rows={5}
                style={{ width: '100%', boxSizing: 'border-box', padding: '10px 12px', borderRadius: 10, border: `1px solid rgba(${P.rgb},0.15)`, fontSize: 13, color: P.primary, background: `rgba(${P.rgb},0.04)`, outline: 'none', resize: 'vertical', fontFamily: 'Questrial, sans-serif', marginBottom: 14 }}
              />

              {/* Mood */}
              <div style={{ fontSize: 12, color: P.softTeal, marginBottom: 8 }}>Como te sientes?</div>
              <div style={{ display: 'flex', gap: 6, marginBottom: 14, flexWrap: 'wrap' }}>
                {MOODS.map((m) => (
                  <button
                    key={m}
                    onClick={() => setMood(mood === m ? undefined : m)}
                    style={{
                      padding: '6px 12px', borderRadius: 20, border: 'none', cursor: 'pointer', fontSize: 12, fontWeight: mood === m ? 700 : 400,
                      background: mood === m ? MOOD_COLORS[m] : `rgba(${P.rgb},0.07)`,
                      color: mood === m ? '#fff' : P.softTeal,
                      transition: 'all 0.15s',
                    }}
                  >
                    {MOOD_LABELS[m]}
                  </button>
                ))}
              </div>

              {/* Tags */}
              <div style={{ fontSize: 12, color: P.softTeal, marginBottom: 8 }}>Tags</div>
              <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', marginBottom: 10 }}>
                {SUGGESTED_TAGS.map((t) => (
                  <button
                    key={t}
                    onClick={() => toggleTag(t)}
                    style={{
                      padding: '4px 10px', borderRadius: 16, border: 'none', cursor: 'pointer', fontSize: 11,
                      background: tags.includes(t) ? P.secondary : `rgba(${P.rgb},0.07)`,
                      color: tags.includes(t) ? '#fff' : P.softTeal,
                    }}
                  >
                    {t}
                  </button>
                ))}
              </div>

              <div style={{ display: 'flex', gap: 8, marginBottom: 14 }}>
                <input
                  type="text"
                  placeholder="Tag personalizado"
                  value={customTag}
                  onChange={(e) => setCustomTag(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && addCustomTag()}
                  style={{ flex: 1, padding: '8px 12px', borderRadius: 10, border: `1px solid rgba(${P.rgb},0.15)`, fontSize: 12, color: P.primary, background: `rgba(${P.rgb},0.04)`, outline: 'none' }}
                />
                <button onClick={addCustomTag} style={{ padding: '8px 14px', borderRadius: 10, border: 'none', background: `rgba(${P.rgb},0.1)`, color: P.primary, fontSize: 12, cursor: 'pointer' }}>
                  Agregar
                </button>
              </div>

              {formError && (
                <div style={{ fontSize: 12, color: '#C0392B', marginBottom: 10 }}>{formError}</div>
              )}

              <button
                onClick={() => void handleSave()}
                disabled={saving}
                style={{ width: '100%', padding: '12px', borderRadius: 12, border: 'none', background: saving ? `rgba(${P.rgb},0.1)` : P.primary, color: saving ? P.softTeal : '#fff', fontSize: 14, fontWeight: 700, cursor: saving ? 'default' : 'pointer' }}
              >
                {saving ? 'Guardando...' : 'Guardar momento'}
              </button>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Lista */}
        {loading && (
          <div style={{ textAlign: 'center', color: P.softTeal, fontSize: 13, padding: '32px 0' }}>Cargando bitacora...</div>
        )}

        {!loading && entries.length === 0 && (
          <div style={{ textAlign: 'center', padding: '48px 20px' }}>
            <div style={{ fontSize: 15, fontWeight: 700, color: P.primary, marginBottom: 8 }}>Sin entradas aun</div>
            <div style={{ fontSize: 13, color: P.softTeal }}>Registra tu primer momento tocando "+ Nuevo"</div>
          </div>
        )}

        {entries.map((entry) => (
          <motion.div
            key={entry.id}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            style={{
              background: '#fff', borderRadius: 14, padding: '16px', marginBottom: 12,
              boxShadow: `0 2px 10px rgba(${P.rgb},0.06)`,
              borderLeft: entry.mood ? `4px solid ${MOOD_COLORS[entry.mood]}` : `4px solid rgba(${P.rgb},0.1)`,
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
              <div style={{ flex: 1 }}>
                {entry.title && (
                  <div style={{ fontSize: 15, fontWeight: 700, color: P.primary, marginBottom: 4 }}>{entry.title}</div>
                )}
                <div style={{ fontSize: 13, color: P.primary, lineHeight: 1.6, marginBottom: 8 }}>{entry.body}</div>

                {/* Tags */}
                {entry.tags.length > 0 && (
                  <div style={{ display: 'flex', gap: 4, flexWrap: 'wrap', marginBottom: 8 }}>
                    {entry.tags.map((t) => (
                      <span key={t} style={{ fontSize: 10, padding: '2px 8px', borderRadius: 10, background: `rgba(${P.rgb},0.07)`, color: P.softTeal }}>{t}</span>
                    ))}
                  </div>
                )}

                <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
                  <span style={{ fontSize: 11, color: P.softTeal }}>{formatDate(entry.entryDate)}</span>
                  {entry.mood && (
                    <span style={{ fontSize: 11, fontWeight: 600, color: MOOD_COLORS[entry.mood] }}>
                      {MOOD_LABELS[entry.mood]}
                    </span>
                  )}
                </div>
              </div>

              <button
                onClick={() => void handleDelete(entry.id)}
                style={{ background: 'none', border: 'none', color: `rgba(${P.rgb},0.25)`, fontSize: 18, cursor: 'pointer', padding: '0 0 0 12px', lineHeight: 1 }}
                aria-label="Eliminar entrada"
              >
                x
              </button>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
