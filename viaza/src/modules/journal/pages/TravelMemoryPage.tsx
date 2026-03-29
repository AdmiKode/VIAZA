// src/modules/journal/pages/TravelMemoryPage.tsx
// Bitácora de viaje — crear, ver y eliminar entradas con mood, tags, fotos.
// Sin emojis. Paleta oficial VIAZA.

import { useState, useEffect, useCallback, useRef } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { Camera, CameraResultType, CameraSource } from '@capacitor/camera';
import { Capacitor } from '@capacitor/core';
import { useAppStore } from '../../../app/store/useAppStore';
import { supabase } from '../../../services/supabaseClient';
import {
  getJournalEntries,
  createJournalEntry,
  deleteJournalEntry,
  uploadJournalPhoto,
  getJournalPhotoUrls,
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

/** Abre un input file en web y devuelve base64 sin prefijo */
function pickPhotoWeb(): Promise<string> {
  return new Promise((resolve, reject) => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = 'image/*';
    input.onchange = () => {
      const file = input.files?.[0];
      if (!file) { reject(new Error('Sin archivo')); return; }
      const reader = new FileReader();
      reader.onload = () => {
        const result = reader.result as string;
        const base64 = result.split(',')[1] ?? '';
        resolve(base64);
      };
      reader.onerror = () => reject(reader.error);
      reader.readAsDataURL(file);
    };
    input.click();
  });
}

export function TravelMemoryPage() {
  const navigate = useNavigate();
  const currentTripId = useAppStore((s) => s.currentTripId);
  const userId = useAppStore((s) => s.user?.id ?? '');

  const [entries, setEntries] = useState<JournalEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);

  // Fotos locales (pre-upload) para el formulario
  const [pendingPhotos, setPendingPhotos] = useState<{ base64: string; mime: string; preview: string }[]>([]);
  const [uploadingPhoto, setUploadingPhoto] = useState(false);

  // URLs de fotos por entryId
  const [photoUrls, setPhotoUrls] = useState<Record<string, string[]>>({});
  const loadingPhotosRef = useRef<Set<string>>(new Set());

  // Form state
  const [title, setTitle] = useState('');
  const [body, setBody] = useState('');
  const [mood, setMood] = useState<JournalMood | undefined>(undefined);
  const [tags, setTags] = useState<string[]>([]);
  const [customTag, setCustomTag] = useState('');
  const [saving, setSaving] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  // Resumen IA
  const [aiSummary, setAiSummary] = useState<string | null>(null);
  const [generatingSummary, setGeneratingSummary] = useState(false);
  const [showSummary, setShowSummary] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const data = await getJournalEntries(currentTripId ?? undefined);
      setEntries(data);
    } catch { /* silenciar */ }
    finally { setLoading(false); }
  }, [currentTripId]);

  useEffect(() => { void load(); }, [load]);

  // Carga lazy de fotos por entrada
  const loadPhotosForEntry = useCallback(async (entry: JournalEntry) => {
    if (!entry.photoPaths.length) return;
    if (loadingPhotosRef.current.has(entry.id)) return;
    if (photoUrls[entry.id]) return;
    loadingPhotosRef.current.add(entry.id);
    try {
      const urls = await getJournalPhotoUrls(entry.photoPaths);
      setPhotoUrls(prev => ({ ...prev, [entry.id]: urls }));
    } catch { /* silenciar */ }
  }, [photoUrls]);

  useEffect(() => {
    entries.forEach(e => { void loadPhotosForEntry(e); });
  }, [entries, loadPhotosForEntry]);

  function toggleTag(tag: string) {
    setTags((prev) => prev.includes(tag) ? prev.filter((t) => t !== tag) : [...prev, tag]);
  }

  function addCustomTag() {
    const t = customTag.trim().toLowerCase().replace(/\s+/g, '-');
    if (t && !tags.includes(t)) setTags((prev) => [...prev, t]);
    setCustomTag('');
  }

  async function handleTakePhoto() {
    setUploadingPhoto(true);
    try {
      let base64 = '';
      let mime = 'image/jpeg';

      if (Capacitor.isNativePlatform()) {
        const photo = await Camera.getPhoto({
          quality: 80,
          allowEditing: false,
          resultType: CameraResultType.Base64,
          source: CameraSource.Prompt,
        });
        base64 = photo.base64String ?? '';
        mime = `image/${photo.format ?? 'jpeg'}`;
      } else {
        // Web: usar input file
        base64 = await pickPhotoWeb();
        mime = 'image/jpeg';
      }

      if (!base64) return;
      const preview = `data:${mime};base64,${base64}`;
      setPendingPhotos(prev => [...prev, { base64, mime, preview }]);
    } catch { /* usuario canceló */ }
    finally { setUploadingPhoto(false); }
  }

  async function handleSave() {
    if (!body.trim()) { setFormError('El contenido no puede estar vacío'); return; }
    setSaving(true);
    setFormError(null);
    try {
      const entry = await createJournalEntry({
        tripId: currentTripId ?? undefined,
        title: title.trim() || undefined,
        body: body.trim(),
        mood,
        tags,
      });

      // Upload fotos pendientes
      for (const p of pendingPhotos) {
        try {
          await uploadJournalPhoto({
            entryId: entry.id,
            userId,
            base64Data: p.base64,
            mimeType: p.mime,
          });
        } catch { /* no bloquear por una foto fallida */ }
      }

      setTitle(''); setBody(''); setMood(undefined); setTags([]); setCustomTag('');
      setPendingPhotos([]);
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

  async function handleGenerateSummary() {
    if (entries.length === 0) return;
    setGeneratingSummary(true);
    setShowSummary(true);
    setAiSummary(null);
    try {
      const reviewsText = entries
        .map((e) => {
          const parts: string[] = [];
          if (e.title) parts.push(`Titulo: ${e.title}`);
          parts.push(`Fecha: ${formatDate(e.entryDate)}`);
          if (e.mood) parts.push(`Animo: ${MOOD_LABELS[e.mood]}`);
          parts.push(`Contenido: ${e.body}`);
          if (e.tags.length) parts.push(`Tags: ${e.tags.join(', ')}`);
          return parts.join('\n');
        })
        .join('\n\n---\n\n');

      const { data, error } = await supabase.functions.invoke('ai-orchestrator', {
        body: {
          task_type: 'reviews_summary',
          payload: { reviews_text: reviewsText },
          trip_context: {},
          language_context: { app_lang: 'es' },
        },
      });

      if (error) throw error;
      const summary = (data as { result?: { summary?: string } })?.result?.summary;
      setAiSummary(summary ?? 'No se pudo generar el resumen');
    } catch {
      setAiSummary('Error al conectar con IA. Verifica tu conexion.');
    } finally {
      setGeneratingSummary(false);
    }
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
          <div style={{ display: 'flex', gap: 8 }}>
            {entries.length >= 2 && (
              <button
                onClick={() => void handleGenerateSummary()}
                disabled={generatingSummary}
                style={{ background: 'rgba(255,255,255,0.15)', border: '1px solid rgba(255,255,255,0.25)', borderRadius: 12, padding: '10px 14px', color: '#fff', fontSize: 12, fontWeight: 600, cursor: generatingSummary ? 'wait' : 'pointer', backdropFilter: 'blur(8px)' }}
              >
                {generatingSummary ? 'Generando...' : 'Resumen IA'}
              </button>
            )}
            <button
              onClick={() => setShowForm((v) => !v)}
              style={{ background: P.accent, border: 'none', borderRadius: 12, padding: '10px 18px', color: '#fff', fontSize: 13, fontWeight: 700, cursor: 'pointer' }}
            >
              {showForm ? 'Cancelar' : '+ Nuevo'}
            </button>
          </div>
        </div>
      </div>

      <div style={{ padding: '20px' }}>

        {/* Panel resumen IA */}
        <AnimatePresence>
          {showSummary && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              style={{ background: '#fff', borderRadius: 16, padding: '18px 20px', marginBottom: 20, boxShadow: `0 4px 20px rgba(${P.rgb},0.1)`, borderLeft: `4px solid ${P.secondary}` }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
                <div style={{ fontSize: 14, fontWeight: 700, color: P.primary }}>Resumen de la bitacora</div>
                <button
                  onClick={() => setShowSummary(false)}
                  style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'rgba(18,33,46,0.35)', fontSize: 18, lineHeight: 1 }}
                >x</button>
              </div>
              {generatingSummary && (
                <div style={{ fontSize: 13, color: P.softTeal, fontStyle: 'italic' }}>
                  Analizando tus momentos...
                </div>
              )}
              {!generatingSummary && aiSummary && (
                <div style={{ fontSize: 13, color: P.primary, lineHeight: 1.7, whiteSpace: 'pre-wrap' }}>{aiSummary}</div>
              )}
              {!generatingSummary && !aiSummary && (
                <div style={{ fontSize: 13, color: P.softTeal }}>Sin resumen disponible</div>
              )}
              {!generatingSummary && aiSummary && (
                <button
                  onClick={() => void handleGenerateSummary()}
                  style={{ marginTop: 12, background: `rgba(${P.rgb},0.07)`, border: 'none', borderRadius: 10, padding: '8px 14px', fontSize: 12, color: P.secondary, fontWeight: 600, cursor: 'pointer' }}
                >
                  Regenerar
                </button>
              )}
            </motion.div>
          )}
        </AnimatePresence>

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

              {/* Fotos pendientes */}
              <div style={{ marginBottom: 14 }}>
                <div style={{ fontSize: 12, color: P.softTeal, marginBottom: 8 }}>Fotos del momento</div>
                <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                  {pendingPhotos.map((p, i) => (
                    <div key={i} style={{ position: 'relative', width: 72, height: 72, borderRadius: 10, overflow: 'hidden', flexShrink: 0 }}>
                      <img src={p.preview} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                      <button
                        type="button"
                        onClick={() => setPendingPhotos(prev => prev.filter((_, j) => j !== i))}
                        style={{ position: 'absolute', top: 3, right: 3, background: 'rgba(18,33,46,0.65)', border: 'none', borderRadius: '50%', width: 20, height: 20, display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}
                      >
                        <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3" strokeLinecap="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
                      </button>
                    </div>
                  ))}
                  <button
                    type="button"
                    onClick={() => void handleTakePhoto()}
                    disabled={uploadingPhoto}
                    style={{
                      width: 72, height: 72, borderRadius: 10, border: `1.5px dashed rgba(${P.rgb},0.25)`,
                      background: `rgba(${P.rgb},0.04)`, display: 'flex', flexDirection: 'column',
                      alignItems: 'center', justifyContent: 'center', gap: 4, cursor: 'pointer', flexShrink: 0,
                    }}
                  >
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke={P.softTeal} strokeWidth="2" strokeLinecap="round">
                      <path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z"/>
                      <circle cx="12" cy="13" r="4"/>
                    </svg>
                    <span style={{ fontSize: 9, color: P.softTeal }}>{uploadingPhoto ? '...' : 'Foto'}</span>
                  </button>
                </div>
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

                {/* Fotos de la entrada */}
                {entry.photoPaths.length > 0 && (
                  <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', marginBottom: 8 }}>
                    {photoUrls[entry.id]
                      ? photoUrls[entry.id].map((url, i) => (
                          <img
                            key={i}
                            src={url}
                            alt=""
                            style={{ width: 64, height: 64, borderRadius: 8, objectFit: 'cover', flexShrink: 0 }}
                          />
                        ))
                      : <div style={{ fontSize: 11, color: P.softTeal }}>{entry.photoPaths.length} foto{entry.photoPaths.length > 1 ? 's' : ''}</div>
                    }
                  </div>
                )}

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
