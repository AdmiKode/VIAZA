import { useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { motion, AnimatePresence } from 'framer-motion';
import { useAppStore } from '../../../app/store/useAppStore';
import { packingCategories } from '../utils/packingCategories';
import type { PackingCategory } from '../../../types/packing';

/* ─── Íconos duotone por categoría ──────────────────────────────── */
const CAT_ICONS: Record<PackingCategory, JSX.Element> = {
  documents: (
    <svg width="22" height="22" viewBox="0 0 48 48" fill="none">
      <rect x="8" y="4" width="32" height="40" rx="5" fill="#EA9940" />
      <rect x="8" y="4" width="32" height="18" rx="5" fill="rgba(180,192,200,0.55)" />
      <rect x="14" y="20" width="20" height="3" rx="1.5" fill="white" opacity="0.7" />
      <rect x="14" y="26" width="14" height="3" rx="1.5" fill="white" opacity="0.5" />
      <rect x="14" y="32" width="17" height="3" rx="1.5" fill="white" opacity="0.5" />
    </svg>
  ),
  clothes: (
    <svg width="22" height="22" viewBox="0 0 48 48" fill="none">
      <path d="M6 14l10-8h4l-4 8v26H32V14l-4-8h4l10 8-6 6V44H6V20z" fill="#EA9940" />
      <path d="M16 6l-4 8 6 4V6z" fill="rgba(180,192,200,0.55)" />
      <path d="M32 6l4 8-6 4V6z" fill="rgba(180,192,200,0.55)" />
    </svg>
  ),
  toiletries: (
    <svg width="22" height="22" viewBox="0 0 48 48" fill="none">
      <rect x="16" y="10" width="16" height="30" rx="5" fill="#EA9940" />
      <rect x="16" y="10" width="16" height="14" rx="5" fill="rgba(180,192,200,0.55)" />
      <rect x="20" y="4" width="8" height="8" rx="3" fill="#EA9940" />
      <circle cx="24" cy="28" r="4" fill="white" opacity="0.4" />
    </svg>
  ),
  electronics: (
    <svg width="22" height="22" viewBox="0 0 48 48" fill="none">
      <rect x="6" y="10" width="36" height="24" rx="5" fill="#EA9940" />
      <rect x="6" y="10" width="36" height="12" rx="5" fill="rgba(180,192,200,0.55)" />
      <rect x="18" y="34" width="12" height="5" rx="2" fill="#EA9940" />
      <rect x="14" y="39" width="20" height="3" rx="1.5" fill="#EA9940" />
      <circle cx="24" cy="22" r="5" fill="white" opacity="0.45" />
    </svg>
  ),
  health: (
    <svg width="22" height="22" viewBox="0 0 48 48" fill="none">
      <rect x="4" y="4" width="40" height="40" rx="8" fill="#EA9940" />
      <rect x="4" y="4" width="40" height="20" rx="8" fill="rgba(180,192,200,0.55)" />
      <rect x="20" y="14" width="8" height="20" rx="3" fill="white" opacity="0.8" />
      <rect x="14" y="20" width="20" height="8" rx="3" fill="white" opacity="0.8" />
    </svg>
  ),
  extras: (
    <svg width="22" height="22" viewBox="0 0 48 48" fill="none">
      <path d="M24 4l5 10 11 1.6-8 7.8 1.9 11L24 29l-9.9 5.4L16 23.4 8 15.6 19 14z" fill="#EA9940" />
      <path d="M24 4l5 10 11 1.6-8 7.8" fill="rgba(180,192,200,0.55)" />
    </svg>
  ),
};

const CAT_COLORS: Record<PackingCategory, string> = {
  documents:  'rgba(48,112,130,0.12)',
  clothes:    'rgba(234,153,64,0.12)',
  toiletries: 'rgba(108,163,162,0.15)',
  electronics:'rgba(18,33,46,0.10)',
  health:     'rgba(220,80,80,0.10)',
  extras:     'rgba(234,153,64,0.08)',
};

const CAT_ACCENT: Record<PackingCategory, string> = {
  documents:  '#307082',
  clothes:    '#EA9940',
  toiletries: '#6CA3A2',
  electronics:'#12212E',
  health:     '#c0392b',
  extras:     '#EA9940',
};

export function PackingChecklistPage() {
  const { t } = useTranslation();
  const currentTripId = useAppStore((s) => s.currentTripId);
  const packingItems = useAppStore((s) => s.packingItems);
  const trips = useAppStore((s) => s.trips);
  const togglePackingItem = useAppStore((s) => s.togglePackingItem);
  const addCustomPackingItem = useAppStore((s) => s.addCustomPackingItem);

  const currentTrip = trips.find((tr) => tr.id === currentTripId);

  // Categorías cerradas por defecto (completadas se cierran automáticamente)
  const [collapsed, setCollapsed] = useState<Record<PackingCategory, boolean>>({
    documents:   false,
    clothes:     false,
    toiletries:  true,
    electronics: true,
    health:      true,
    extras:      true,
  });

  const [customLabel, setCustomLabel] = useState('');
  const [showAddInput, setShowAddInput] = useState(false);

  const itemsForTrip = useMemo(
    () => (currentTripId ? packingItems.filter((x) => x.tripId === currentTripId) : []),
    [currentTripId, packingItems]
  );

  const checkedCount = itemsForTrip.filter((x) => x.checked).length;
  const totalCount = itemsForTrip.length;
  const progressPct = totalCount === 0 ? 0 : Math.round((checkedCount / totalCount) * 100);

  function toggleCollapse(cat: PackingCategory) {
    setCollapsed((s) => ({ ...s, [cat]: !s[cat] }));
  }

  return (
    <div
      className="min-h-full pb-32"
      style={{ background: '#ECE7DC', fontFamily: 'Questrial, sans-serif' }}
    >
      {/* ── Header ── */}
      <div
        className="sticky top-0 z-10 px-5 pt-6 pb-4"
        style={{
          background: '#ECE7DC',
          boxShadow: '0 2px 12px rgba(18,33,46,0.06)',
        }}
      >
        <div className="flex items-center justify-between mb-4">
          <div>
            <h1 style={{ color: '#12212E', fontSize: 22, fontWeight: 700 }}>
              {currentTrip ? currentTrip.destination : t('packing.title', 'Mi maleta')}
            </h1>
            {currentTrip && (
              <div style={{ display: 'flex', gap: 6, alignItems: 'center', marginTop: 3, flexWrap: 'wrap' }}>
                {currentTrip.startDate && (
                  <span style={{
                    fontSize: 11, color: 'white', background: '#307082',
                    borderRadius: 20, padding: '2px 10px', fontWeight: 600,
                  }}>
                    {currentTrip.startDate.slice(5).replace('-', '/')}
                    {currentTrip.endDate ? ` → ${currentTrip.endDate.slice(5).replace('-', '/')}` : ''}
                  </span>
                )}
                {currentTrip.travelType && (
                  <span style={{
                    fontSize: 11, color: '#307082', background: 'rgba(48,112,130,0.12)',
                    borderRadius: 20, padding: '2px 10px', fontWeight: 600,
                  }}>
                    {t(`travelType.${currentTrip.travelType}`, currentTrip.travelType)}
                  </span>
                )}
                {currentTrip.durationDays > 0 && (
                  <span style={{
                    fontSize: 11, color: '#EA9940', background: 'rgba(234,153,64,0.12)',
                    borderRadius: 20, padding: '2px 10px', fontWeight: 600,
                  }}>
                    {currentTrip.durationDays}d
                  </span>
                )}
              </div>
            )}
            <p style={{ color: 'rgba(18,33,46,0.50)', fontSize: 13, marginTop: 4 }}>
              {checkedCount} / {totalCount} {t('packing.itemsReady', 'artículos listos')}
            </p>
          </div>
          {/* Progreso circular */}
          <div className="relative flex items-center justify-center" style={{ width: 54, height: 54 }}>
            <svg width="54" height="54" viewBox="0 0 54 54">
              <circle cx="27" cy="27" r="22" fill="none" stroke="rgba(18,33,46,0.10)" strokeWidth="5" />
              <circle
                cx="27" cy="27" r="22"
                fill="none"
                stroke="#EA9940"
                strokeWidth="5"
                strokeLinecap="round"
                strokeDasharray={`${2 * Math.PI * 22}`}
                strokeDashoffset={`${2 * Math.PI * 22 * (1 - progressPct / 100)}`}
                transform="rotate(-90 27 27)"
              />
            </svg>
            <span
              className="absolute"
              style={{ color: '#12212E', fontSize: 13, fontWeight: 700 }}
            >
              {progressPct}%
            </span>
          </div>
        </div>

        {/* Barra de progreso full */}
        <div
          className="w-full rounded-full overflow-hidden"
          style={{ height: 6, background: 'rgba(18,33,46,0.10)' }}
        >
          <motion.div
            className="h-full rounded-full"
            style={{ background: 'linear-gradient(90deg, #307082, #EA9940)' }}
            animate={{ width: `${progressPct}%` }}
            transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
          />
        </div>
      </div>

      {/* ── Categorías ── */}
      <div className="px-4 mt-4 space-y-3">
        {packingCategories.map((cat) => {
          const items = itemsForTrip.filter((x) => x.category === cat.id);
          if (items.length === 0) return null;

          const isCollapsed = collapsed[cat.id];
          const catChecked = items.filter((x) => x.checked).length;
          const catTotal = items.length;
          const catDone = catChecked === catTotal;
          const catPct = Math.round((catChecked / catTotal) * 100);
          const accentColor = CAT_ACCENT[cat.id];

          return (
            <div
              key={cat.id}
              className="overflow-hidden rounded-3xl"
              style={{
                background: 'white',
                boxShadow: catDone
                  ? `0 4px 16px rgba(48,112,130,0.12)`
                  : '0 2px 12px rgba(18,33,46,0.06)',
                border: catDone ? '1.5px solid rgba(48,112,130,0.25)' : '1.5px solid transparent',
              }}
            >
              {/* Header del accordion */}
              <button
                type="button"
                className="w-full flex items-center gap-3 px-4 py-4"
                onClick={() => toggleCollapse(cat.id)}
              >
                {/* Ícono */}
                <div
                  className="flex items-center justify-center rounded-2xl flex-shrink-0"
                  style={{
                    width: 44,
                    height: 44,
                    background: catDone ? 'rgba(48,112,130,0.12)' : CAT_COLORS[cat.id],
                  }}
                >
                  {catDone ? (
                    <svg width="22" height="22" viewBox="0 0 48 48" fill="none">
                      <circle cx="24" cy="24" r="20" fill="#307082" />
                      <path d="M14 24l8 8 12-12" stroke="white" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round" fill="none" />
                    </svg>
                  ) : CAT_ICONS[cat.id]}
                </div>

                {/* Texto + mini barra */}
                <div className="flex-1 text-left min-w-0">
                  <div className="flex items-center justify-between">
                    <span style={{
                      color: catDone ? '#307082' : '#12212E',
                      fontSize: 15,
                      fontWeight: 700,
                      fontFamily: 'Questrial, sans-serif',
                    }}>
                      {t(cat.titleKey)}
                    </span>
                    <span style={{
                      color: catDone ? '#307082' : 'rgba(18,33,46,0.45)',
                      fontSize: 13,
                      fontWeight: 600,
                      marginLeft: 8,
                    }}>
                      {catChecked}/{catTotal}
                    </span>
                  </div>
                  {/* Mini barra por categoría */}
                  <div
                    className="mt-1.5 rounded-full overflow-hidden"
                    style={{ height: 4, background: 'rgba(18,33,46,0.08)' }}
                  >
                    <motion.div
                      className="h-full rounded-full"
                      style={{ background: catDone ? '#307082' : accentColor }}
                      animate={{ width: `${catPct}%` }}
                      transition={{ duration: 0.4 }}
                    />
                  </div>
                </div>

                {/* Chevron */}
                <motion.div
                  animate={{ rotate: isCollapsed ? 0 : 180 }}
                  transition={{ duration: 0.25 }}
                  style={{ flexShrink: 0 }}
                >
                  <svg width="18" height="18" viewBox="0 0 48 48" fill="none">
                    <path d="M12 18l12 12 12-12" stroke="rgba(18,33,46,0.35)" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                </motion.div>
              </button>

              {/* Items colapsables */}
              <AnimatePresence initial={false}>
                {!isCollapsed && (
                  <motion.div
                    key="content"
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
                    style={{ overflow: 'hidden' }}
                  >
                    <div className="pb-3 px-3 space-y-1.5">
                      {items.map((item) => (
                        <motion.label
                          key={item.id}
                          layout
                          className="flex items-center gap-3 rounded-2xl px-4 py-3 cursor-pointer select-none"
                          style={{
                            background: item.checked
                              ? 'rgba(48,112,130,0.06)'
                              : 'rgba(18,33,46,0.03)',
                            border: item.checked
                              ? '1px solid rgba(48,112,130,0.18)'
                              : '1px solid transparent',
                          }}
                        >
                          {/* Checkbox custom */}
                          <div
                            className="flex-shrink-0 flex items-center justify-center rounded-lg"
                            style={{
                              width: 24,
                              height: 24,
                              background: item.checked ? '#307082' : 'rgba(18,33,46,0.08)',
                              border: item.checked ? 'none' : '1.5px solid rgba(18,33,46,0.15)',
                              transition: 'all 0.2s ease',
                            }}
                            onClick={() => togglePackingItem(item.id)}
                          >
                            {item.checked && (
                              <svg width="13" height="13" viewBox="0 0 48 48" fill="none">
                                <path d="M10 24l10 10 18-18" stroke="white" strokeWidth="6" strokeLinecap="round" strokeLinejoin="round" fill="none" />
                              </svg>
                            )}
                          </div>
                          <input
                            type="checkbox"
                            checked={item.checked}
                            onChange={() => togglePackingItem(item.id)}
                            className="sr-only"
                          />

                          {/* Label */}
                          <div className="flex-1 min-w-0">
                            <div style={{
                              color: item.checked ? 'rgba(18,33,46,0.40)' : '#12212E',
                              fontSize: 14,
                              fontWeight: 600,
                              fontFamily: 'Questrial, sans-serif',
                              textDecoration: item.checked ? 'line-through' : 'none',
                            }}>
                              {item.labelKey ? t(item.labelKey) : item.label}
                              {item.required && !item.checked && (
                                <span style={{
                                  marginLeft: 6,
                                  fontSize: 10,
                                  color: '#EA9940',
                                  fontWeight: 700,
                                  letterSpacing: 0.5,
                                }}>
                                  ★
                                </span>
                              )}
                            </div>
                            {item.quantity > 1 && (
                              <div style={{
                                color: item.checked ? 'rgba(18,33,46,0.25)' : 'rgba(18,33,46,0.45)',
                                fontSize: 12,
                                marginTop: 1,
                              }}>
                                {t('packing.item.quantity', { count: item.quantity })}
                              </div>
                            )}
                          </div>
                        </motion.label>
                      ))}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          );
        })}
      </div>

      {/* ── FAB Agregar ítem ── */}
      <div className="fixed bottom-24 right-5 z-20">
        <AnimatePresence>
          {showAddInput && (
            <motion.div
              initial={{ opacity: 0, y: 12, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 12, scale: 0.95 }}
              transition={{ duration: 0.25 }}
              className="mb-3 rounded-3xl p-4"
              style={{
                background: 'white',
                boxShadow: '0 8px 32px rgba(18,33,46,0.15)',
                width: 280,
              }}
            >
              <p style={{ color: '#12212E', fontSize: 13, fontWeight: 700, marginBottom: 10, fontFamily: 'Questrial, sans-serif' }}>
                {t('packing.addCustom.title', 'Agregar artículo')}
              </p>
              <div
                className="flex items-center rounded-2xl px-3"
                style={{
                  height: 44,
                  background: '#ECE7DC',
                  boxShadow: 'inset 3px 3px 8px rgba(18,33,46,0.08), inset -2px -2px 6px rgba(255,255,255,0.70)',
                  marginBottom: 10,
                }}
              >
                <input
                  type="text"
                  value={customLabel}
                  onChange={(e) => setCustomLabel(e.target.value)}
                  placeholder={t('packing.addCustom.placeholder', 'Ej: Adaptador de corriente')}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' && currentTripId && customLabel.trim()) {
                      addCustomPackingItem(currentTripId, customLabel.trim(), 1);
                      setCustomLabel('');
                      setShowAddInput(false);
                    }
                  }}
                  style={{
                    flex: 1,
                    background: 'transparent',
                    border: 'none',
                    outline: 'none',
                    fontSize: 14,
                    color: '#12212E',
                    fontFamily: 'Questrial, sans-serif',
                  }}
                  autoFocus
                />
              </div>
              <button
                type="button"
                onClick={() => {
                  if (!currentTripId || !customLabel.trim()) return;
                  addCustomPackingItem(currentTripId, customLabel.trim(), 1);
                  setCustomLabel('');
                  setShowAddInput(false);
                }}
                disabled={!currentTripId || !customLabel.trim()}
                style={{
                  width: '100%',
                  height: 42,
                  borderRadius: 14,
                  background: customLabel.trim() ? '#EA9940' : 'rgba(18,33,46,0.10)',
                  color: customLabel.trim() ? 'white' : 'rgba(18,33,46,0.30)',
                  border: 'none',
                  fontSize: 14,
                  fontWeight: 700,
                  fontFamily: 'Questrial, sans-serif',
                  cursor: customLabel.trim() ? 'pointer' : 'default',
                }}
              >
                {t('packing.addCustom.cta', 'Agregar')}
              </button>
            </motion.div>
          )}
        </AnimatePresence>

        <motion.button
          type="button"
          onClick={() => setShowAddInput((s) => !s)}
          whileTap={{ scale: 0.92 }}
          className="flex items-center justify-center rounded-full"
          style={{
            width: 52,
            height: 52,
            background: showAddInput ? '#12212E' : '#EA9940',
            boxShadow: '0 6px 20px rgba(234,153,64,0.40)',
            border: 'none',
            cursor: 'pointer',
          }}
        >
          <svg width="22" height="22" viewBox="0 0 48 48" fill="none">
            {showAddInput
              ? <path d="M14 14l20 20M34 14L14 34" stroke="white" strokeWidth="4" strokeLinecap="round" />
              : <path d="M24 10v28M10 24h28" stroke="white" strokeWidth="4" strokeLinecap="round" />
            }
          </svg>
        </motion.button>
      </div>

      {/* Estado vacío */}
      {totalCount === 0 && (
        <div className="flex flex-col items-center justify-center px-8 pt-20 text-center">
          <svg width="80" height="80" viewBox="0 0 48 48" fill="none" style={{ opacity: 0.35 }}>
            <rect x="8" y="12" width="32" height="30" rx="5" fill="#12212E" />
            <path d="M18 12v-4a6 6 0 0 1 12 0v4" stroke="#12212E" strokeWidth="3.5" strokeLinecap="round" fill="none" />
          </svg>
          <p style={{ color: 'rgba(18,33,46,0.40)', fontSize: 15, marginTop: 16, fontFamily: 'Questrial, sans-serif' }}>
            {t('packing.empty', 'Crea un viaje para generar tu lista')}
          </p>
        </div>
      )}
    </div>
  );
}
