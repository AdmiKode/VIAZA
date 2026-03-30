import { useEffect, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { AnimatePresence, motion } from 'framer-motion';
import { useAppStore } from '../../../app/store/useAppStore';
import { takePhoto } from '../../../services/cameraService';
import { impactMedium, notificationError, notificationSuccess } from '../../../services/hapticsService';
import {
  completePackingScanSession,
  createPackingScanSession,
  fetchSuitcaseLayoutPlans,
  fetchSuitcaseProfiles,
  invokePackingValidationScan,
  invokeSuitcaseLayoutPlan,
  savePackingScanDetections,
  saveSuitcaseLayoutPlan,
  type PackingScanResult,
  type PackingScanSummary,
  upsertSuitcaseProfile,
} from '../../../services/packingValidationService';
import { createLuggagePhoto, fetchLuggagePhotosByTrip, updateLuggagePhotoAnalysis } from '../../../services/packingMediaService';
import type { PackingItem } from '../../../types/packing';
import type { SuitcaseProfile } from '../../../types/packingScan';

type Step = 'profile' | 'scan' | 'analyzing' | 'result';
type LuggageSize = 'cabin' | 'medium' | 'large' | 'extra_large';
type LuggageType = 'carry_on' | 'checked' | 'backpack' | 'auto_trunk' | 'other';

const LUGGAGE_SIZES: { id: LuggageSize; labelKey: string; descKey: string; icon: JSX.Element }[] = [
  {
    id: 'cabin',
    labelKey: 'luggage.size.cabin',
    descKey: 'luggage.size.cabin.desc',
    icon: (
      <svg width="32" height="32" viewBox="0 0 48 48" fill="none">
        <rect x="12" y="8" width="24" height="32" rx="5" fill="#EA9940" />
        <rect x="12" y="8" width="24" height="14" rx="5" fill="rgba(180,192,200,0.55)" />
        <rect x="18" y="4" width="12" height="6" rx="3" fill="#EA9940" />
        <line x1="24" y1="18" x2="24" y2="36" stroke="white" strokeWidth="2" strokeLinecap="round" opacity="0.5" />
      </svg>
    ),
  },
  {
    id: 'medium',
    labelKey: 'luggage.size.medium',
    descKey: 'luggage.size.medium.desc',
    icon: (
      <svg width="32" height="32" viewBox="0 0 48 48" fill="none">
        <rect x="10" y="6" width="28" height="36" rx="5" fill="#EA9940" />
        <rect x="10" y="6" width="28" height="16" rx="5" fill="rgba(180,192,200,0.55)" />
        <rect x="17" y="2" width="14" height="6" rx="3" fill="#EA9940" />
        <line x1="24" y1="18" x2="24" y2="38" stroke="white" strokeWidth="2" strokeLinecap="round" opacity="0.5" />
      </svg>
    ),
  },
  {
    id: 'large',
    labelKey: 'luggage.size.large',
    descKey: 'luggage.size.large.desc',
    icon: (
      <svg width="32" height="32" viewBox="0 0 48 48" fill="none">
        <rect x="8" y="4" width="32" height="40" rx="5" fill="#EA9940" />
        <rect x="8" y="4" width="32" height="18" rx="5" fill="rgba(180,192,200,0.55)" />
        <rect x="16" y="0" width="16" height="6" rx="3" fill="#EA9940" />
        <line x1="24" y1="18" x2="24" y2="40" stroke="white" strokeWidth="2" strokeLinecap="round" opacity="0.5" />
      </svg>
    ),
  },
  {
    id: 'extra_large',
    labelKey: 'luggage.size.extra_large',
    descKey: 'luggage.size.extra_large.desc',
    icon: (
      <svg width="32" height="32" viewBox="0 0 48 48" fill="none">
        <rect x="6" y="2" width="36" height="44" rx="5" fill="#EA9940" />
        <rect x="6" y="2" width="36" height="20" rx="5" fill="rgba(180,192,200,0.55)" />
        <rect x="15" y="0" width="18" height="4" rx="2" fill="#EA9940" />
        <line x1="24" y1="20" x2="24" y2="42" stroke="white" strokeWidth="2" strokeLinecap="round" opacity="0.5" />
      </svg>
    ),
  },
];

const LUGGAGE_TYPES: Array<{ id: LuggageType; label: string }> = [
  { id: 'carry_on', label: 'Carry-on' },
  { id: 'checked', label: 'Documentada' },
  { id: 'backpack', label: 'Mochila' },
  { id: 'auto_trunk', label: 'Auto' },
  { id: 'other', label: 'Otro' },
];

type LayoutOutput = {
  bottom: string[];
  top: string[];
  compartments: string[];
  hand_bag: string[];
  security_separated: string[];
  fragile_separated: string[];
  quick_access: string[];
};

function normalizeLabel(value: string): string {
  return value
    .trim()
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^\w\s]/g, ' ')
    .replace(/\s+/g, ' ');
}

function containsAny(label: string, words: string[]): boolean {
  const normalized = normalizeLabel(label);
  return words.some((word) => normalized.includes(word));
}

function deriveSpecialRules(items: PackingItem[]) {
  const liquids = items
    .filter((item) => containsAny(item.label, ['liquido', 'shampoo', 'perfume', 'gel', 'crema', 'lotion']))
    .map((item) => item.label);
  const fragile = items
    .filter((item) => containsAny(item.label, ['lente', 'camara', 'camara', 'vidrio', 'fragil', 'botella']))
    .map((item) => item.label);
  const quickAccess = items
    .filter((item) => containsAny(item.label, ['pasaporte', 'boarding', 'cargador', 'medic', 'medicina', 'wallet']))
    .map((item) => item.label);
  const security = items
    .filter((item) => containsAny(item.label, ['power bank', 'bateria', 'laptop', 'tablet', 'aerosol', 'navaja']))
    .map((item) => item.label);

  return {
    liquids,
    fragile,
    quickAccess,
    security,
  };
}

function buildFallbackLayout(items: PackingItem[]): LayoutOutput {
  const bottom = items.filter((item) => item.category === 'clothes' || item.category === 'extras').map((item) => item.label);
  const top = items.filter((item) => item.category === 'documents' || item.category === 'health').map((item) => item.label);
  const compartments = items.filter((item) => item.category === 'toiletries' || item.category === 'electronics').map((item) => item.label);
  const handBag = items.filter((item) => containsAny(item.label, ['pasaporte', 'medic', 'cargador', 'laptop'])).map((item) => item.label);
  const rules = deriveSpecialRules(items);

  return {
    bottom,
    top,
    compartments,
    hand_bag: handBag,
    security_separated: rules.security,
    fragile_separated: rules.fragile,
    quick_access: rules.quickAccess,
  };
}

function parseLayout(layout: Record<string, unknown>, items: PackingItem[]): LayoutOutput {
  const fallback = buildFallbackLayout(items);
  const asList = (key: keyof LayoutOutput): string[] => {
    const raw = layout[key];
    if (!Array.isArray(raw)) return fallback[key];
    return raw.map((x) => String(x)).filter(Boolean);
  };

  return {
    bottom: asList('bottom'),
    top: asList('top'),
    compartments: asList('compartments'),
    hand_bag: asList('hand_bag'),
    security_separated: asList('security_separated'),
    fragile_separated: asList('fragile_separated'),
    quick_access: asList('quick_access'),
  };
}

interface LuggageAssistantPageProps {
  tripId: string;
  travelerId: string;
  travelerName: string;
  onClose: () => void;
}

export function LuggageAssistantPage({
  tripId,
  travelerId,
  travelerName,
  onClose,
}: LuggageAssistantPageProps) {
  const { t, i18n } = useTranslation();
  const user = useAppStore((s) => s.user);
  const trips = useAppStore((s) => s.trips);
  const packingItems = useAppStore((s) => s.packingItems);

  const [step, setStep] = useState<Step>('profile');
  const [selectedSize, setSelectedSize] = useState<LuggageSize>('medium');
  const [luggageType, setLuggageType] = useState<LuggageType>('checked');
  const [heightCm, setHeightCm] = useState<string>('');
  const [widthCm, setWidthCm] = useState<string>('');
  const [depthCm, setDepthCm] = useState<string>('');
  const [weightLimitKg, setWeightLimitKg] = useState<string>('');
  const [compartments, setCompartments] = useState<string>('1');
  const [constraintCabin, setConstraintCabin] = useState(false);
  const [constraintHandBag, setConstraintHandBag] = useState(true);
  const [constraintLiquids, setConstraintLiquids] = useState(true);

  const [profile, setProfile] = useState<SuitcaseProfile | null>(null);
  const [scanResult, setScanResult] = useState<PackingScanResult | null>(null);
  const [layoutResult, setLayoutResult] = useState<LayoutOutput | null>(null);
  const [layoutNotes, setLayoutNotes] = useState<string>('');
  const [latestPhotoUrl, setLatestPhotoUrl] = useState<string | null>(null);
  const [lastSummary, setLastSummary] = useState<PackingScanSummary | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const currentTrip = trips.find((trip) => trip.id === tripId) ?? null;
  const checklistItems = useMemo(
    () => packingItems.filter((item) => item.tripId === tripId && (!item.travelerId || item.travelerId === travelerId)),
    [packingItems, tripId, travelerId]
  );

  const packingItemById = useMemo(() => {
    const map = new Map<string, PackingItem>();
    for (const item of checklistItems) map.set(item.id, item);
    return map;
  }, [checklistItems]);

  const missingItems = useMemo(() => {
    if (!scanResult) return [];
    return scanResult.missingPackingItemIds
      .map((id) => packingItemById.get(id))
      .filter((item): item is PackingItem => Boolean(item));
  }, [scanResult, packingItemById]);

  const duplicateRows = useMemo(
    () => (scanResult?.detected ?? []).filter((row) => row.matchStatus === 'duplicate'),
    [scanResult]
  );
  const uncertainRows = useMemo(
    () => (scanResult?.detected ?? []).filter((row) => row.matchStatus === 'uncertain'),
    [scanResult]
  );
  const extraRows = useMemo(
    () => (scanResult?.detected ?? []).filter((row) => row.matchStatus === 'extra'),
    [scanResult]
  );

  useEffect(() => {
    let cancelled = false;
    async function bootstrap() {
      try {
        const [profiles, plans, photos] = await Promise.all([
          fetchSuitcaseProfiles(tripId),
          fetchSuitcaseLayoutPlans(tripId, travelerId),
          fetchLuggagePhotosByTrip(tripId, travelerId),
        ]);

        if (cancelled) return;

        const selectedProfile =
          profiles.find((row) => row.travelerId === travelerId)
          ?? profiles.find((row) => row.travelerId == null)
          ?? null;

        if (selectedProfile) {
          setProfile(selectedProfile);
          setLuggageType(selectedProfile.luggageType);
          setHeightCm(selectedProfile.heightCm == null ? '' : String(selectedProfile.heightCm));
          setWidthCm(selectedProfile.widthCm == null ? '' : String(selectedProfile.widthCm));
          setDepthCm(selectedProfile.depthCm == null ? '' : String(selectedProfile.depthCm));
          setWeightLimitKg(selectedProfile.weightLimitKg == null ? '' : String(selectedProfile.weightLimitKg));
          setCompartments(String(selectedProfile.compartments));
          setConstraintCabin(Boolean((selectedProfile.constraints as { cabin_only?: unknown }).cabin_only));
          setConstraintHandBag(Boolean((selectedProfile.constraints as { hand_bag?: unknown }).hand_bag ?? true));
          setConstraintLiquids(Boolean((selectedProfile.constraints as { separate_liquids?: unknown }).separate_liquids ?? true));
        }

        if (plans.length > 0) {
          const latestPlan = plans[0];
          const parsed = parseLayout(latestPlan.layout, checklistItems);
          setLayoutResult(parsed);
          setLayoutNotes(latestPlan.notes ?? '');
        }

        if (photos.length > 0) {
          setLatestPhotoUrl(photos[0].photoUrl ?? null);
        }
      } catch {
        // no-op
      }
    }

    void bootstrap();
    return () => {
      cancelled = true;
    };
  }, [tripId, travelerId, checklistItems]);

  async function handleSaveProfile() {
    if (!user?.id) {
      setError('Sesion no valida');
      return;
    }

    setLoading(true);
    setError(null);
    try {
      const saved = await upsertSuitcaseProfile({
        id: profile?.id ?? crypto.randomUUID(),
        userId: user.id,
        tripId,
        travelerId,
        name: `Maleta de ${travelerName}`,
        luggageType,
        heightCm: heightCm ? Number(heightCm) : null,
        widthCm: widthCm ? Number(widthCm) : null,
        depthCm: depthCm ? Number(depthCm) : null,
        weightLimitKg: weightLimitKg ? Number(weightLimitKg) : null,
        compartments: Math.max(1, Number(compartments) || 1),
        constraints: {
          cabin_only: constraintCabin,
          hand_bag: constraintHandBag,
          separate_liquids: constraintLiquids,
        },
      });
      setProfile(saved);
      setStep('scan');
      await notificationSuccess();
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'No se pudo guardar perfil de maleta';
      setError(msg);
      await notificationError();
    } finally {
      setLoading(false);
    }
  }

  async function handleRunScan() {
    if (!user?.id) {
      setError('Sesion no valida');
      return;
    }
    if (!profile) {
      setError('Primero guarda el perfil de maleta');
      setStep('profile');
      return;
    }

    setLoading(true);
    setError(null);
    let sessionId: string | null = null;

    try {
      await impactMedium();
      const photo = await takePhoto();

      const uploadedPhoto = await createLuggagePhoto({
        tripId,
        travelerId,
        dataUrl: photo.dataUrl,
        luggageSize: selectedSize,
        phase: 'open',
      });
      setLatestPhotoUrl(uploadedPhoto.photoUrl ?? null);

      const session = await createPackingScanSession({
        userId: user.id,
        tripId,
        travelerId,
        suitcaseProfileId: profile.id,
        metadata: { luggage_size: selectedSize },
      });
      sessionId = session.id;
      setStep('analyzing');

      const result = await invokePackingValidationScan({
        imageDataUrl: photo.dataUrl,
        luggageType,
        checklistItems,
        appLang: i18n.language,
      });
      setScanResult(result);
      setLastSummary(result.summary);

      await savePackingScanDetections(
        session.id,
        result.detected.map((row) => ({
          packingItemId: row.packingItemId,
          detectedLabel: row.detectedLabel,
          normalizedLabel: row.normalizedLabel,
          confidence: row.confidence,
          matchStatus: row.matchStatus,
          quantityDetected: row.quantityDetected,
          source: 'vision',
        }))
      );

      await completePackingScanSession({
        sessionId: session.id,
        status: 'completed',
        confidenceAvg: result.summary.confidenceAvg,
        completionPct: result.summary.completionPct,
        missingCount: result.summary.missingCount,
        duplicateCount: result.summary.duplicateCount,
        uncertainCount: result.summary.uncertainCount,
        metadata: { extra_count: result.summary.extraCount },
      });

      let planResult: { strategyVersion: string; layout: Record<string, unknown>; notes: string };
      try {
        planResult = await invokeSuitcaseLayoutPlan({
          profile,
          checklistItems,
          scanResult: result,
          appLang: i18n.language,
          tripContext: currentTrip
            ? {
                destination: currentTrip.destination,
                travel_type: currentTrip.travelType,
                climate: currentTrip.climate,
                duration_days: currentTrip.durationDays,
                transport_type: currentTrip.transportType,
              }
            : {},
        });
      } catch {
        planResult = {
          strategyVersion: 'fallback_v1',
          layout: buildFallbackLayout(checklistItems),
          notes: 'Plan generado con reglas operativas locales por falla temporal de IA.',
        };
      }

      const parsedLayout = parseLayout(planResult.layout, checklistItems);
      setLayoutResult(parsedLayout);
      setLayoutNotes(planResult.notes);

      await saveSuitcaseLayoutPlan({
        id: crypto.randomUUID(),
        userId: user.id,
        tripId,
        travelerId,
        suitcaseProfileId: profile.id,
        strategyVersion: planResult.strategyVersion,
        layout: parsedLayout,
        notes: planResult.notes,
        generatedBy: 'ai_orchestrator',
        status: 'draft',
      });

      await updateLuggagePhotoAnalysis({
        id: uploadedPhoto.id,
        aiSuggestion: planResult.notes,
        zones: parsedLayout,
        phase: 'packed',
      });

      await notificationSuccess();
      setStep('result');
    } catch (err: unknown) {
      if (sessionId) {
        await completePackingScanSession({
          sessionId,
          status: 'failed',
          metadata: { error: err instanceof Error ? err.message : 'scan failed' },
        }).catch(() => undefined);
      }
      const msg = err instanceof Error ? err.message : 'No se pudo ejecutar el escaneo';
      setError(msg);
      setStep('scan');
      await notificationError();
    } finally {
      setLoading(false);
    }
  }

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        background: '#ECE7DC',
        zIndex: 100,
        overflowY: 'auto',
        fontFamily: 'Questrial, sans-serif',
      }}
    >
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: 12,
          padding: '56px 20px 20px',
          background: 'linear-gradient(160deg, #12212E 0%, #307082 100%)',
        }}
      >
        <button
          type="button"
          onClick={onClose}
          style={{
            width: 38,
            height: 38,
            borderRadius: 99,
            background: 'rgba(255,255,255,0.15)',
            border: 'none',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <svg width="18" height="18" viewBox="0 0 48 48" fill="none">
            <path d="M30 10L18 24l12 14" stroke="white" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round" fill="none" />
          </svg>
        </button>
        <div>
          <div style={{ color: 'white', fontWeight: 700, fontSize: 18 }}>
            {t('luggage.assistant.title')}
          </div>
          <div style={{ color: 'rgba(255,255,255,0.60)', fontSize: 13 }}>
            {travelerName}
          </div>
        </div>
      </div>

      <div style={{ padding: '24px 20px', paddingBottom: 80 }}>
        <AnimatePresence mode="wait">
          {step === 'profile' && (
            <motion.div
              key="profile"
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -16 }}
            >
              <h2 style={{ fontWeight: 700, fontSize: 20, color: '#12212E', marginBottom: 8 }}>
                Perfil de maleta
              </h2>
              <p style={{ color: 'rgba(18,33,46,0.55)', fontSize: 14, marginBottom: 20 }}>
                Define tipo, medidas y restricciones para calcular validacion y acomodo real.
              </p>

              <div style={{ marginBottom: 14 }}>
                <div style={{ fontSize: 12, fontWeight: 700, color: 'rgba(18,33,46,0.60)', marginBottom: 8 }}>
                  Tipo de equipaje
                </div>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
                  {LUGGAGE_TYPES.map((type) => {
                    const active = luggageType === type.id;
                    return (
                      <button
                        key={type.id}
                        type="button"
                        onClick={() => setLuggageType(type.id)}
                        style={{
                          borderRadius: 999,
                          border: active ? 'none' : '1px solid rgba(18,33,46,0.15)',
                          background: active ? '#12212E' : 'white',
                          color: active ? 'white' : '#12212E',
                          fontSize: 12,
                          fontWeight: 700,
                          padding: '7px 12px',
                          cursor: 'pointer',
                        }}
                      >
                        {type.label}
                      </button>
                    );
                  })}
                </div>
              </div>

              <div style={{ marginBottom: 14 }}>
                <div style={{ fontSize: 12, fontWeight: 700, color: 'rgba(18,33,46,0.60)', marginBottom: 8 }}>
                  Tamano de maleta
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                  {LUGGAGE_SIZES.map((size) => (
                    <button
                      key={size.id}
                      type="button"
                      onClick={() => setSelectedSize(size.id)}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: 12,
                        padding: '12px 14px',
                        borderRadius: 16,
                        border: selectedSize === size.id ? 'none' : '1px solid rgba(18,33,46,0.12)',
                        background: selectedSize === size.id ? '#12212E' : 'white',
                        color: selectedSize === size.id ? 'white' : '#12212E',
                        textAlign: 'left',
                      }}
                    >
                      <div style={{ width: 44, height: 44, borderRadius: 12, background: selectedSize === size.id ? 'rgba(255,255,255,0.14)' : 'rgba(234,153,64,0.12)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        {size.icon}
                      </div>
                      <div>
                        <div style={{ fontWeight: 700, fontSize: 14 }}>{t(size.labelKey)}</div>
                        <div style={{ fontSize: 12, opacity: 0.7 }}>{t(size.descKey)}</div>
                      </div>
                    </button>
                  ))}
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 10, marginBottom: 10 }}>
                <input
                  type="number"
                  inputMode="numeric"
                  value={heightCm}
                  onChange={(e) => setHeightCm(e.target.value)}
                  placeholder="Alto cm"
                  style={{ height: 42, borderRadius: 12, border: '1px solid rgba(18,33,46,0.12)', padding: '0 10px', background: 'white' }}
                />
                <input
                  type="number"
                  inputMode="numeric"
                  value={widthCm}
                  onChange={(e) => setWidthCm(e.target.value)}
                  placeholder="Ancho cm"
                  style={{ height: 42, borderRadius: 12, border: '1px solid rgba(18,33,46,0.12)', padding: '0 10px', background: 'white' }}
                />
                <input
                  type="number"
                  inputMode="numeric"
                  value={depthCm}
                  onChange={(e) => setDepthCm(e.target.value)}
                  placeholder="Prof cm"
                  style={{ height: 42, borderRadius: 12, border: '1px solid rgba(18,33,46,0.12)', padding: '0 10px', background: 'white' }}
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, marginBottom: 16 }}>
                <input
                  type="number"
                  inputMode="numeric"
                  value={weightLimitKg}
                  onChange={(e) => setWeightLimitKg(e.target.value)}
                  placeholder="Peso limite kg"
                  style={{ height: 42, borderRadius: 12, border: '1px solid rgba(18,33,46,0.12)', padding: '0 10px', background: 'white' }}
                />
                <input
                  type="number"
                  inputMode="numeric"
                  min={1}
                  value={compartments}
                  onChange={(e) => setCompartments(e.target.value)}
                  placeholder="Compartimentos"
                  style={{ height: 42, borderRadius: 12, border: '1px solid rgba(18,33,46,0.12)', padding: '0 10px', background: 'white' }}
                />
              </div>

              <div style={{ display: 'grid', gap: 8, marginBottom: 18 }}>
                <label style={{ display: 'flex', alignItems: 'center', gap: 8, color: '#12212E', fontSize: 13 }}>
                  <input type="checkbox" checked={constraintCabin} onChange={(e) => setConstraintCabin(e.target.checked)} />
                  Solo cabina
                </label>
                <label style={{ display: 'flex', alignItems: 'center', gap: 8, color: '#12212E', fontSize: 13 }}>
                  <input type="checkbox" checked={constraintHandBag} onChange={(e) => setConstraintHandBag(e.target.checked)} />
                  Bolsa de mano separada
                </label>
                <label style={{ display: 'flex', alignItems: 'center', gap: 8, color: '#12212E', fontSize: 13 }}>
                  <input type="checkbox" checked={constraintLiquids} onChange={(e) => setConstraintLiquids(e.target.checked)} />
                  Liquidos separados
                </label>
              </div>

              <button
                type="button"
                onClick={() => void handleSaveProfile()}
                disabled={loading}
                style={{
                  width: '100%',
                  height: 50,
                  borderRadius: 14,
                  border: 'none',
                  background: '#EA9940',
                  color: 'white',
                  fontWeight: 700,
                  cursor: 'pointer',
                  opacity: loading ? 0.7 : 1,
                }}
              >
                {loading ? 'Guardando...' : 'Guardar perfil y continuar'}
              </button>
            </motion.div>
          )}

          {step === 'scan' && (
            <motion.div
              key="scan"
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -16 }}
            >
              <h2 style={{ fontWeight: 700, fontSize: 20, color: '#12212E', marginBottom: 8 }}>
                Escaneo contra checklist
              </h2>
              <p style={{ color: 'rgba(18,33,46,0.55)', fontSize: 14, marginBottom: 14 }}>
                Captura la maleta abierta para validar detectados, faltantes, duplicados y extras.
              </p>

              <div
                style={{
                  borderRadius: 20,
                  border: '2px dashed rgba(18,33,46,0.18)',
                  background: 'rgba(18,33,46,0.04)',
                  padding: 18,
                  minHeight: 200,
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'center',
                  alignItems: 'center',
                  textAlign: 'center',
                }}
              >
                {latestPhotoUrl ? (
                  <img src={latestPhotoUrl} alt="Maleta" style={{ width: '100%', maxHeight: 240, objectFit: 'cover', borderRadius: 12 }} />
                ) : (
                  <>
                    <svg width="56" height="56" viewBox="0 0 48 48" fill="none">
                      <rect x="4" y="10" width="40" height="30" rx="7" fill="#EA9940" />
                      <rect x="4" y="10" width="40" height="14" rx="7" fill="rgba(180,192,200,0.55)" />
                      <circle cx="24" cy="27" r="8" fill="white" opacity="0.5" />
                      <circle cx="24" cy="27" r="5" fill="white" opacity="0.8" />
                      <rect x="16" y="6" width="16" height="6" rx="3" fill="#EA9940" />
                    </svg>
                    <span style={{ marginTop: 12, color: 'rgba(18,33,46,0.50)', fontSize: 13 }}>
                      Checklist analizado: {checklistItems.length} items
                    </span>
                  </>
                )}
              </div>

              {lastSummary && (
                <div style={{ marginTop: 12, borderRadius: 14, padding: 12, background: 'white', border: '1px solid rgba(18,33,46,0.10)' }}>
                  <div style={{ fontSize: 13, fontWeight: 700, color: '#12212E', marginBottom: 6 }}>Ultimo resultado</div>
                  <div style={{ fontSize: 12, color: 'rgba(18,33,46,0.60)' }}>
                    Progreso: {lastSummary.completionPct}% · Faltantes: {lastSummary.missingCount} · Duplicados: {lastSummary.duplicateCount}
                  </div>
                </div>
              )}

              <button
                type="button"
                onClick={() => void handleRunScan()}
                disabled={loading || checklistItems.length === 0}
                style={{
                  width: '100%',
                  height: 52,
                  borderRadius: 16,
                  background: loading || checklistItems.length === 0 ? 'rgba(18,33,46,0.10)' : '#EA9940',
                  color: loading || checklistItems.length === 0 ? 'rgba(18,33,46,0.35)' : 'white',
                  border: 'none',
                  fontWeight: 700,
                  marginTop: 18,
                  cursor: loading || checklistItems.length === 0 ? 'default' : 'pointer',
                }}
              >
                {loading ? 'Escaneando...' : 'Escanear y validar'}
              </button>
            </motion.div>
          )}

          {step === 'analyzing' && (
            <motion.div
              key="analyzing"
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -16 }}
            >
              <div style={{ padding: '22px 14px', borderRadius: 20, background: 'white', textAlign: 'center' }}>
                <motion.div
                  animate={{ rotate: 360 }}
                  transition={{ repeat: Infinity, duration: 1.2, ease: 'linear' }}
                  style={{
                    margin: '0 auto 14px',
                    width: 28,
                    height: 28,
                    borderRadius: '50%',
                    border: '3px solid rgba(18,33,46,0.12)',
                    borderTopColor: '#307082',
                  }}
                />
                <div style={{ fontSize: 16, fontWeight: 700, color: '#12212E' }}>Analizando maleta</div>
                <div style={{ fontSize: 13, color: 'rgba(18,33,46,0.55)', marginTop: 6 }}>
                  Validacion por checklist y generacion de acomodo en proceso.
                </div>
              </div>
            </motion.div>
          )}

          {step === 'result' && scanResult && layoutResult && (
            <motion.div
              key="result"
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -16 }}
            >
              <h2 style={{ fontWeight: 700, fontSize: 20, color: '#12212E', marginBottom: 10 }}>
                Resultado operativo
              </h2>

              <div style={{ borderRadius: 16, padding: 14, background: 'white', marginBottom: 12, border: '1px solid rgba(18,33,46,0.10)' }}>
                <div style={{ fontSize: 14, fontWeight: 700, color: '#12212E', marginBottom: 6 }}>
                  Validacion checklist
                </div>
                <div style={{ fontSize: 13, color: 'rgba(18,33,46,0.62)' }}>
                  Detectados: {scanResult.detected.filter((row) => row.matchStatus === 'matched').length} ·
                  Faltantes: {scanResult.summary.missingCount} ·
                  Duplicados: {scanResult.summary.duplicateCount} ·
                  Inciertos: {scanResult.summary.uncertainCount} ·
                  Extras: {scanResult.summary.extraCount}
                </div>
                <div style={{ marginTop: 10, height: 7, borderRadius: 999, background: 'rgba(18,33,46,0.08)', overflow: 'hidden' }}>
                  <div style={{ width: `${scanResult.summary.completionPct}%`, height: '100%', background: 'linear-gradient(90deg, #307082, #EA9940)' }} />
                </div>
                <div style={{ marginTop: 6, fontSize: 12, color: 'rgba(18,33,46,0.55)' }}>
                  Progreso total: {scanResult.summary.completionPct}%
                </div>
              </div>

              <div style={{ borderRadius: 16, padding: 14, background: 'white', marginBottom: 12, border: '1px solid rgba(18,33,46,0.10)' }}>
                <div style={{ fontSize: 14, fontWeight: 700, color: '#12212E', marginBottom: 8 }}>
                  Progreso por categoria
                </div>
                {(scanResult.categoryProgress.length === 0 ? [{ key: 'general', detected: 0, total: 0, pct: 0 }] : scanResult.categoryProgress).map((row) => (
                  <div key={row.key} style={{ marginBottom: 8 }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12, color: 'rgba(18,33,46,0.70)' }}>
                      <span>{row.key}</span>
                      <span>{row.detected}/{row.total} ({row.pct}%)</span>
                    </div>
                    <div style={{ marginTop: 4, height: 5, borderRadius: 999, background: 'rgba(18,33,46,0.08)', overflow: 'hidden' }}>
                      <div style={{ width: `${row.pct}%`, height: '100%', background: '#307082' }} />
                    </div>
                  </div>
                ))}
              </div>

              <div style={{ borderRadius: 16, padding: 14, background: 'white', marginBottom: 12, border: '1px solid rgba(18,33,46,0.10)' }}>
                <div style={{ fontSize: 14, fontWeight: 700, color: '#12212E', marginBottom: 8 }}>
                  Suitcase Fit & Layout Advisor
                </div>
                <div style={{ fontSize: 12, color: 'rgba(18,33,46,0.55)', marginBottom: 8 }}>
                  {layoutNotes || 'Plan por zonas generado'}
                </div>
                <div style={{ display: 'grid', gap: 8 }}>
                  <div style={{ fontSize: 12, color: '#12212E' }}><strong>Fondo:</strong> {layoutResult.bottom.join(', ') || '-'}</div>
                  <div style={{ fontSize: 12, color: '#12212E' }}><strong>Arriba:</strong> {layoutResult.top.join(', ') || '-'}</div>
                  <div style={{ fontSize: 12, color: '#12212E' }}><strong>Compartimentos:</strong> {layoutResult.compartments.join(', ') || '-'}</div>
                  <div style={{ fontSize: 12, color: '#12212E' }}><strong>Bolsa de mano:</strong> {layoutResult.hand_bag.join(', ') || '-'}</div>
                  <div style={{ fontSize: 12, color: '#12212E' }}><strong>Seguridad / liquidos:</strong> {layoutResult.security_separated.join(', ') || '-'}</div>
                  <div style={{ fontSize: 12, color: '#12212E' }}><strong>Fragiles:</strong> {layoutResult.fragile_separated.join(', ') || '-'}</div>
                  <div style={{ fontSize: 12, color: '#12212E' }}><strong>Acceso rapido:</strong> {layoutResult.quick_access.join(', ') || '-'}</div>
                </div>
              </div>

              <div style={{ borderRadius: 16, padding: 14, background: 'white', marginBottom: 12, border: '1px solid rgba(18,33,46,0.10)' }}>
                <div style={{ fontSize: 13, fontWeight: 700, color: '#12212E', marginBottom: 6 }}>
                  Faltantes y confirmaciones
                </div>
                <div style={{ fontSize: 12, color: 'rgba(18,33,46,0.70)' }}>
                  Faltantes: {missingItems.map((item) => item.label).join(', ') || '-'}
                </div>
                <div style={{ marginTop: 6, fontSize: 12, color: 'rgba(18,33,46,0.70)' }}>
                  Duplicados: {duplicateRows.map((row) => row.detectedLabel).join(', ') || '-'}
                </div>
                <div style={{ marginTop: 6, fontSize: 12, color: 'rgba(18,33,46,0.70)' }}>
                  Inciertos: {uncertainRows.map((row) => row.detectedLabel).join(', ') || '-'}
                </div>
                <div style={{ marginTop: 6, fontSize: 12, color: 'rgba(18,33,46,0.70)' }}>
                  Extras: {extraRows.map((row) => row.detectedLabel).join(', ') || '-'}
                </div>
              </div>

              <div style={{ display: 'grid', gap: 8 }}>
                <button
                  type="button"
                  onClick={() => setStep('scan')}
                  style={{
                    width: '100%',
                    height: 48,
                    borderRadius: 14,
                    border: 'none',
                    background: '#307082',
                    color: 'white',
                    fontWeight: 700,
                    cursor: 'pointer',
                  }}
                >
                  Re-escanear maleta
                </button>
                <button
                  type="button"
                  onClick={onClose}
                  style={{
                    width: '100%',
                    height: 48,
                    borderRadius: 14,
                    border: '1px solid rgba(18,33,46,0.18)',
                    background: 'white',
                    color: '#12212E',
                    fontWeight: 700,
                    cursor: 'pointer',
                  }}
                >
                  Cerrar
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {error && (
          <div
            style={{
              marginTop: 12,
              background: 'rgba(234,153,64,0.08)',
              border: '1px solid rgba(234,153,64,0.25)',
              borderRadius: 12,
              padding: '10px 12px',
              color: '#EA9940',
              fontSize: 13,
            }}
          >
            {error}
          </div>
        )}
      </div>
    </div>
  );
}
