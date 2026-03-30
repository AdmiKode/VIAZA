// src/modules/places/pages/PlaceDetailPage.tsx
//
// Detalle de un lugar guardado del viaje activo.
// Ruta: /places/:id
//
// Secciones:
//   1. Header con nombre + categoría
//   2. Mapa estático (link externo Google Maps)
//   3. Info: dirección, categoría, status, día asignado, notas
//   4. Selector de status (want_to_go / booked / visited)
//   5. Selector de día del itinerario
//   6. Notas (editable inline)
//   7. Botón "Abrir en Google Maps"
//   8. Botón eliminar
//
// PALETA INMUTABLE: #12212E #307082 #6CA3A2 #ECE7DC #EA9940
// CERO emojis. CERO colores fuera de paleta.

import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { motion } from 'framer-motion';
import { useAppStore } from '../../../app/store/useAppStore';
import { upsertTripPlace, deleteTripPlaceRemote } from '../../../services/tripPlacesService';
import type { PlaceStatus } from '../../../types/itinerary';

const P = {
  primary:    '#12212E',
  secondary:  '#307082',
  softTeal:   '#6CA3A2',
  bg:         '#ECE7DC',
  accent:     '#EA9940',
  rgb:        '18,33,46',
} as const;

// ─── Metadatos de status ─────────────────────────────────────────────────────

const STATUS_META: Record<PlaceStatus, { label: string; color: string; bg: string }> = {
  want_to_go: { label: 'Quiero ir',  color: P.accent,     bg: 'rgba(234,153,64,0.12)' },
  booked:     { label: 'Reservado',  color: P.secondary,  bg: 'rgba(48,112,130,0.12)' },
  visited:    { label: 'Visitado',   color: P.softTeal,   bg: 'rgba(108,163,162,0.15)' },
};

const STATUS_ORDER: PlaceStatus[] = ['want_to_go', 'booked', 'visited'];

// ─── Etiquetas de categoría ───────────────────────────────────────────────────

const CAT_LABELS: Record<string, string> = {
  restaurant:  'Restaurante',
  cafe:        'Cafe',
  museum:      'Museo',
  hotel:       'Hotel',
  beach:       'Playa',
  park:        'Parque',
  shopping:    'Compras',
  transport:   'Transporte',
  attraction:  'Atraccion',
  other:       'Otro',
};

// ─── Íconos SVG ──────────────────────────────────────────────────────────────

function IconBack() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke={P.primary} strokeWidth="2.5" strokeLinecap="round">
      <polyline points="15 18 9 12 15 6"/>
    </svg>
  );
}

function IconPin() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
      <path d="M21 10c0 7-9 13-9 13S3 17 3 10a9 9 0 1 1 18 0z"/>
      <circle cx="12" cy="10" r="3"/>
    </svg>
  );
}

function IconMaps() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
      <polygon points="1 6 1 22 8 18 16 22 23 18 23 2 16 6 8 2 1 6"/>
      <line x1="8" y1="2" x2="8" y2="18"/>
      <line x1="16" y1="6" x2="16" y2="22"/>
    </svg>
  );
}

function IconTrash() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
      <polyline points="3 6 5 6 21 6"/>
      <path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"/>
      <path d="M10 11v6M14 11v6"/>
      <path d="M9 6V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2"/>
    </svg>
  );
}

function IconEdit() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
      <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/>
      <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/>
    </svg>
  );
}

function IconCalendar() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
      <rect x="3" y="4" width="18" height="18" rx="2"/>
      <line x1="16" y1="2" x2="16" y2="6"/>
      <line x1="8" y1="2" x2="8" y2="6"/>
      <line x1="3" y1="10" x2="21" y2="10"/>
    </svg>
  );
}

// ─── Componente principal ─────────────────────────────────────────────────────

export function PlaceDetailPage() {
  const { id } = useParams<{ id: string }>();
  const { t } = useTranslation();
  const navigate = useNavigate();

  const place = useAppStore((s) => s.savedPlaces.find((p) => p.id === id));
  const currentTrip = useAppStore((s) => s.trips.find((x) => x.id === s.currentTripId) ?? null);
  const updateSavedPlace = useAppStore((s) => s.updateSavedPlace);
  const deleteSavedPlace = useAppStore((s) => s.deleteSavedPlace);

  const [editingNotes, setEditingNotes] = useState(false);
  const [notesValue, setNotesValue] = useState(place?.notes ?? '');
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [savingNotes, setSavingNotes] = useState(false);

  // Número de días del viaje (para el selector)
  const tripDurationDays = (() => {
    if (!currentTrip?.startDate || !currentTrip?.endDate) return 0;
    const ms = new Date(currentTrip.endDate).getTime() - new Date(currentTrip.startDate).getTime();
    return Math.max(1, Math.ceil(ms / 86400000));
  })();

  if (!place) {
    return (
      <div
        className="min-h-dvh flex items-center justify-center px-6 text-center pb-32"
        style={{ background: P.bg, fontFamily: 'Questrial, sans-serif' }}
      >
        <div>
          <p className="text-base font-bold" style={{ color: P.primary }}>
            {t('places.detail.notFound')}
          </p>
          <button
            type="button"
            onClick={() => navigate(-1)}
            className="mt-4 rounded-2xl px-6 py-3 text-sm font-bold"
            style={{ background: P.primary, color: P.bg, border: 'none', cursor: 'pointer' }}
          >
            {t('places.detail.back')}
          </button>
        </div>
      </div>
    );
  }

  // place está garantizado non-null aquí — pero TS no narrowea variables
  // de store closures fuera del render path. Alias explícito para los handlers.
  const p = place;

  const statusMeta = STATUS_META[p.status];
  const mapsUrl = `https://maps.google.com/?q=${p.lat},${p.lon}`;
  const staticMapUrl = `https://maps.googleapis.com/maps/api/staticmap?center=${p.lat},${p.lon}&zoom=15&size=600x240&maptype=roadmap&markers=color:0x307082|${p.lat},${p.lon}&key=AIzaSyDUME3X4zMOWHl6FXQlDaS3WnLQ9ZMGXkk`;

  async function handleStatusChange(next: PlaceStatus) {
    updateSavedPlace(p.id, { status: next });
    try {
      await upsertTripPlace({ ...p, status: next });
    } catch {
      // silencioso — el store ya actualizó optimistamente
    }
  }

  async function handleDayChange(dayIndex: number | null) {
    updateSavedPlace(p.id, { assignedDayIndex: dayIndex });
    try {
      await upsertTripPlace({ ...p, assignedDayIndex: dayIndex });
    } catch {
      // silencioso
    }
  }

  async function handleSaveNotes() {
    setSavingNotes(true);
    const trimmed = notesValue.trim() || undefined;
    updateSavedPlace(p.id, { notes: trimmed });
    try {
      await upsertTripPlace({ ...p, notes: trimmed });
    } catch {
      // silencioso
    } finally {
      setSavingNotes(false);
      setEditingNotes(false);
    }
  }

  function handleDelete() {
    deleteSavedPlace(p.id);
    void deleteTripPlaceRemote(p.id).catch(() => null);
    navigate(-1);
  }

  return (
    <div
      className="min-h-dvh pb-36"
      style={{ background: P.bg, fontFamily: 'Questrial, sans-serif' }}
    >
      {/* ─── Header ─────────────────────────────────────────────────────── */}
      <div className="px-5 pt-4 pb-2 flex items-center gap-3">
        <button
          type="button"
          onClick={() => navigate(-1)}
          className="flex items-center justify-center rounded-full transition active:scale-90"
          style={{ width: 38, height: 38, background: 'rgba(18,33,46,0.07)', border: 'none', cursor: 'pointer', flexShrink: 0 }}
        >
          <IconBack />
        </button>
        <div className="flex-1 min-w-0">
          <h1 className="text-base font-bold truncate" style={{ color: P.primary }}>
            {p.name}
          </h1>
          <p className="text-xs mt-0.5" style={{ color: `rgba(${P.rgb},0.50)` }}>
            {CAT_LABELS[p.category] ?? p.category}
          </p>
        </div>
        <span
          className="rounded-full px-3 py-1 text-xs font-bold flex-shrink-0"
          style={{ background: statusMeta.bg, color: statusMeta.color }}
        >
          {statusMeta.label}
        </span>
      </div>

      <div className="px-5 space-y-4">

        {/* ─── Vista previa de mapa (link a Google Maps) ──────────────── */}
        <motion.a
          href={mapsUrl}
          target="_blank"
          rel="noopener noreferrer"
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.25 }}
          className="block rounded-3xl overflow-hidden relative"
          style={{
            height: 180,
            background: `linear-gradient(135deg, ${P.secondary} 0%, ${P.softTeal} 100%)`,
            textDecoration: 'none',
            boxShadow: '0 4px 20px rgba(18,33,46,0.12)',
          }}
        >
          {/* Fondo con imagen del mapa estático — si falla muestra el gradiente */}
          <img
            src={staticMapUrl}
            alt="Mapa"
            className="absolute inset-0 w-full h-full object-cover"
            onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }}
          />
          {/* Overlay + pin central */}
          <div
            className="absolute inset-0 flex flex-col items-center justify-center gap-2"
            style={{ background: 'rgba(18,33,46,0.25)' }}
          >
            <div
              className="flex items-center justify-center rounded-full"
              style={{ width: 44, height: 44, background: 'white', boxShadow: '0 4px 16px rgba(18,33,46,0.25)' }}
            >
              <span style={{ color: P.secondary }}><IconPin /></span>
            </div>
            <span
              className="rounded-full px-3 py-1 text-xs font-bold"
              style={{ background: 'rgba(255,255,255,0.90)', color: P.primary }}
            >
              {t('places.detail.openMaps')}
            </span>
          </div>
        </motion.a>

        {/* ─── Información del lugar ──────────────────────────────────── */}
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.25, delay: 0.06 }}
          className="rounded-3xl overflow-hidden"
          style={{ background: 'white', boxShadow: '0 4px 20px rgba(18,33,46,0.08)' }}
        >
          {p.address && (
            <div
              className="px-5 py-4 flex items-start gap-3"
              style={{ borderBottom: '1px solid rgba(18,33,46,0.06)' }}
            >
              <span style={{ color: P.softTeal, marginTop: 1, flexShrink: 0 }}><IconPin /></span>
              <div>
                <div className="text-xs font-semibold mb-0.5" style={{ color: `rgba(${P.rgb},0.50)` }}>
                  {t('places.detail.address')}
                </div>
                <div className="text-sm" style={{ color: P.primary }}>{p.address}</div>
              </div>
            </div>
          )}

          <div
            className="px-5 py-4 flex items-center gap-3"
            style={{ borderBottom: tripDurationDays > 0 ? '1px solid rgba(18,33,46,0.06)' : 'none' }}
          >
            <span style={{ color: P.softTeal, flexShrink: 0 }}><IconCalendar /></span>
            <div className="flex-1 min-w-0">
              <div className="text-xs font-semibold mb-0.5" style={{ color: `rgba(${P.rgb},0.50)` }}>
                {t('places.detail.assignedDay')}
              </div>
              <div className="text-sm font-semibold" style={{ color: P.primary }}>
                {p.assignedDayIndex != null
                  ? `${t('itinerary.day')} ${p.assignedDayIndex + 1}`
                  : t('places.detail.noDay')}
              </div>
            </div>
          </div>
        </motion.div>

        {/* ─── Cambiar status ─────────────────────────────────────────── */}
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.25, delay: 0.10 }}
        >
          <div className="text-xs font-semibold mb-2 px-1" style={{ color: `rgba(${P.rgb},0.50)` }}>
            {t('places.detail.status')}
          </div>
          <div className="flex gap-2">
            {STATUS_ORDER.map((s) => {
              const meta = STATUS_META[s];
              const active = p.status === s;
              return (
                <button
                  key={s}
                  type="button"
                  onClick={() => void handleStatusChange(s)}
                  className="flex-1 rounded-2xl py-3 text-xs font-bold transition active:scale-[0.96]"
                  style={{
                    background: active ? meta.color : 'white',
                    color: active ? (s === 'want_to_go' ? P.primary : 'white') : `rgba(${P.rgb},0.55)`,
                    border: active ? 'none' : '1.5px solid rgba(18,33,46,0.10)',
                    cursor: 'pointer',
                    boxShadow: active ? `0 4px 16px ${meta.color}40` : 'none',
                  }}
                >
                  {meta.label}
                </button>
              );
            })}
          </div>
        </motion.div>

        {/* ─── Asignar a día del itinerario ───────────────────────────── */}
        {tripDurationDays > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.25, delay: 0.14 }}
          >
            <div className="text-xs font-semibold mb-2 px-1" style={{ color: `rgba(${P.rgb},0.50)` }}>
              {t('places.detail.assignDay')}
            </div>
            <div className="flex flex-wrap gap-2">
              <button
                type="button"
                onClick={() => void handleDayChange(null)}
                className="rounded-2xl px-4 py-2.5 text-xs font-bold transition active:scale-[0.96]"
                style={{
                  background: p.assignedDayIndex == null ? P.primary : 'white',
                  color: p.assignedDayIndex == null ? P.bg : `rgba(${P.rgb},0.55)`,
                  border: p.assignedDayIndex == null ? 'none' : '1.5px solid rgba(18,33,46,0.10)',
                  cursor: 'pointer',
                }}
              >
                {t('places.detail.noDay')}
              </button>
              {Array.from({ length: tripDurationDays }, (_, i) => (
                <button
                  key={i}
                  type="button"
                  onClick={() => void handleDayChange(i)}
                  className="rounded-2xl px-4 py-2.5 text-xs font-bold transition active:scale-[0.96]"
                  style={{
                    background: p.assignedDayIndex === i ? P.secondary : 'white',
                    color: p.assignedDayIndex === i ? 'white' : `rgba(${P.rgb},0.55)`,
                    border: p.assignedDayIndex === i ? 'none' : '1.5px solid rgba(18,33,46,0.10)',
                    cursor: 'pointer',
                    boxShadow: p.assignedDayIndex === i ? '0 4px 12px rgba(48,112,130,0.30)' : 'none',
                  }}
                >
                  {t('itinerary.day')} {i + 1}
                </button>
              ))}
            </div>
          </motion.div>
        )}

        {/* ─── Notas ──────────────────────────────────────────────────── */}
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.25, delay: 0.18 }}
          className="rounded-3xl"
          style={{ background: 'white', boxShadow: '0 4px 20px rgba(18,33,46,0.08)' }}
        >
          <div className="px-5 pt-4 pb-3 flex items-center justify-between">
            <span className="text-sm font-bold" style={{ color: P.primary }}>
              {t('places.detail.notes')}
            </span>
            {!editingNotes && (
              <button
                type="button"
                onClick={() => setEditingNotes(true)}
                className="flex items-center gap-1 rounded-xl px-3 py-1.5 text-xs font-semibold transition active:scale-95"
                style={{ background: 'rgba(18,33,46,0.06)', color: `rgba(${P.rgb},0.65)`, border: 'none', cursor: 'pointer' }}
              >
                <IconEdit />
                {t('places.detail.edit')}
              </button>
            )}
          </div>
          <div className="px-5 pb-4">
            {editingNotes ? (
              <div>
                <textarea
                  value={notesValue}
                  onChange={(e) => setNotesValue(e.target.value)}
                  rows={4}
                  className="w-full rounded-2xl p-3 text-sm resize-none"
                  style={{
                    background: 'rgba(18,33,46,0.04)',
                    border: `1.5px solid rgba(${P.rgb},0.12)`,
                    color: P.primary,
                    fontFamily: 'Questrial, sans-serif',
                    outline: 'none',
                  }}
                  placeholder={t('places.detail.notesPlaceholder')}
                />
                <div className="mt-3 flex gap-2">
                  <button
                    type="button"
                    onClick={() => { setEditingNotes(false); setNotesValue(p.notes ?? ''); }}
                    className="flex-1 rounded-2xl py-3 text-sm font-bold transition active:scale-[0.97]"
                    style={{ background: 'rgba(18,33,46,0.07)', color: P.primary, border: 'none', cursor: 'pointer' }}
                  >
                    {t('places.detail.cancel')}
                  </button>
                  <button
                    type="button"
                    disabled={savingNotes}
                    onClick={() => void handleSaveNotes()}
                    className="flex-1 rounded-2xl py-3 text-sm font-bold transition active:scale-[0.97]"
                    style={{ background: P.secondary, color: 'white', border: 'none', cursor: 'pointer' }}
                  >
                    {savingNotes ? t('places.detail.saving') : t('places.detail.save')}
                  </button>
                </div>
              </div>
            ) : (
              <p
                className="text-sm leading-relaxed"
                style={{ color: p.notes ? P.primary : `rgba(${P.rgb},0.35)` }}
              >
                {p.notes ?? t('places.detail.noNotes')}
              </p>
            )}
          </div>
        </motion.div>

        {/* ─── Botón Google Maps ──────────────────────────────────────── */}
        <motion.a
          href={mapsUrl}
          target="_blank"
          rel="noopener noreferrer"
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.25, delay: 0.22 }}
          className="flex items-center justify-center gap-2 w-full rounded-3xl py-4 text-sm font-bold transition active:scale-[0.97]"
          style={{
            background: 'white',
            color: P.secondary,
            boxShadow: '0 4px 20px rgba(18,33,46,0.08)',
            textDecoration: 'none',
          }}
        >
          <IconMaps />
          {t('places.detail.openMaps')}
        </motion.a>

        {/* ─── Eliminar ───────────────────────────────────────────────── */}
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.25, delay: 0.26 }}
        >
          {!confirmDelete ? (
            <button
              type="button"
              onClick={() => setConfirmDelete(true)}
              className="flex items-center justify-center gap-2 w-full rounded-3xl py-4 text-sm font-bold transition active:scale-[0.97]"
              style={{
                background: 'rgba(18,33,46,0.06)',
                color: `rgba(${P.rgb},0.55)`,
                border: 'none',
                cursor: 'pointer',
              }}
            >
              <IconTrash />
              {t('places.detail.delete')}
            </button>
          ) : (
            <div
              className="rounded-3xl p-5"
              style={{ background: 'white', boxShadow: '0 4px 20px rgba(18,33,46,0.08)' }}
            >
              <p className="text-sm font-semibold text-center mb-4" style={{ color: P.primary }}>
                {t('places.detail.deleteConfirm')}
              </p>
              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={() => setConfirmDelete(false)}
                  className="flex-1 rounded-2xl py-3 text-sm font-bold transition active:scale-[0.97]"
                  style={{ background: 'rgba(18,33,46,0.07)', color: P.primary, border: 'none', cursor: 'pointer' }}
                >
                  {t('places.detail.cancel')}
                </button>
                <button
                  type="button"
                  onClick={handleDelete}
                  className="flex-1 rounded-2xl py-3 text-sm font-bold transition active:scale-[0.97]"
                  style={{ background: P.primary, color: P.bg, border: 'none', cursor: 'pointer' }}
                >
                  {t('places.detail.deleteConfirmBtn')}
                </button>
              </div>
            </div>
          )}
        </motion.div>

      </div>
    </div>
  );
}
