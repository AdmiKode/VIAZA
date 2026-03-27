import { supabase } from './supabaseClient';
import type {
  PackingScanDetection,
  PackingScanSession,
  SuitcaseLayoutPlan,
  SuitcaseProfile,
} from '../types/packingScan';
import type { PackingItem } from '../types/packing';

function mapSuitcaseProfile(row: any): SuitcaseProfile {
  return {
    id: row.id,
    userId: row.user_id,
    tripId: row.trip_id,
    travelerId: row.traveler_id,
    name: row.name,
    luggageType: row.luggage_type,
    heightCm: row.height_cm,
    widthCm: row.width_cm,
    depthCm: row.depth_cm,
    weightLimitKg: row.weight_limit_kg,
    compartments: row.compartments,
    constraints: row.constraints ?? {},
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

function mapScanSession(row: any): PackingScanSession {
  return {
    id: row.id,
    userId: row.user_id,
    tripId: row.trip_id,
    travelerId: row.traveler_id,
    suitcaseProfileId: row.suitcase_profile_id,
    status: row.status,
    confidenceAvg: row.confidence_avg,
    completionPct: row.completion_pct,
    missingCount: row.missing_count,
    duplicateCount: row.duplicate_count,
    uncertainCount: row.uncertain_count,
    startedAt: row.started_at,
    completedAt: row.completed_at,
    metadata: row.metadata ?? {},
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

function mapDetection(row: any): PackingScanDetection {
  return {
    id: row.id,
    sessionId: row.session_id,
    packingItemId: row.packing_item_id,
    detectedLabel: row.detected_label,
    normalizedLabel: row.normalized_label,
    confidence: row.confidence,
    matchStatus: row.match_status,
    quantityDetected: row.quantity_detected,
    source: row.source,
    bbox: row.bbox,
    rawPayload: row.raw_payload,
    createdAt: row.created_at,
  };
}

function mapLayoutPlan(row: any): SuitcaseLayoutPlan {
  return {
    id: row.id,
    userId: row.user_id,
    tripId: row.trip_id,
    travelerId: row.traveler_id,
    suitcaseProfileId: row.suitcase_profile_id,
    strategyVersion: row.strategy_version,
    layout: row.layout ?? {},
    notes: row.notes,
    generatedBy: row.generated_by,
    status: row.status,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

export async function fetchSuitcaseProfiles(tripId: string): Promise<SuitcaseProfile[]> {
  const { data, error } = await supabase
    .from('suitcase_profiles')
    .select('*')
    .eq('trip_id', tripId)
    .order('created_at', { ascending: false });

  if (error) throw error;
  return (data ?? []).map(mapSuitcaseProfile);
}

export async function upsertSuitcaseProfile(profile: Omit<SuitcaseProfile, 'createdAt' | 'updatedAt'>): Promise<SuitcaseProfile> {
  const { data, error } = await supabase
    .from('suitcase_profiles')
    .upsert({
      id: profile.id,
      user_id: profile.userId,
      trip_id: profile.tripId,
      traveler_id: profile.travelerId,
      name: profile.name,
      luggage_type: profile.luggageType,
      height_cm: profile.heightCm,
      width_cm: profile.widthCm,
      depth_cm: profile.depthCm,
      weight_limit_kg: profile.weightLimitKg,
      compartments: profile.compartments,
      constraints: profile.constraints,
      updated_at: new Date().toISOString(),
    }, { onConflict: 'id' })
    .select('*')
    .single();

  if (error) throw error;
  return mapSuitcaseProfile(data);
}

export async function createPackingScanSession(input: {
  userId: string;
  tripId: string;
  travelerId?: string | null;
  suitcaseProfileId?: string | null;
  metadata?: Record<string, unknown>;
}): Promise<PackingScanSession> {
  const { data, error } = await supabase
    .from('packing_scan_sessions')
    .insert({
      user_id: input.userId,
      trip_id: input.tripId,
      traveler_id: input.travelerId ?? null,
      suitcase_profile_id: input.suitcaseProfileId ?? null,
      metadata: input.metadata ?? {},
      status: 'pending',
    })
    .select('*')
    .single();

  if (error) throw error;
  return mapScanSession(data);
}

export async function completePackingScanSession(input: {
  sessionId: string;
  status: 'completed' | 'failed';
  confidenceAvg?: number | null;
  completionPct?: number | null;
  missingCount?: number;
  duplicateCount?: number;
  uncertainCount?: number;
  metadata?: Record<string, unknown>;
}): Promise<void> {
  const { error } = await supabase
    .from('packing_scan_sessions')
    .update({
      status: input.status,
      confidence_avg: input.confidenceAvg ?? null,
      completion_pct: input.completionPct ?? null,
      missing_count: input.missingCount ?? 0,
      duplicate_count: input.duplicateCount ?? 0,
      uncertain_count: input.uncertainCount ?? 0,
      metadata: input.metadata ?? {},
      completed_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    })
    .eq('id', input.sessionId);

  if (error) throw error;
}

export async function savePackingScanDetections(sessionId: string, detections: Array<{
  packingItemId?: string | null;
  detectedLabel: string;
  normalizedLabel?: string | null;
  confidence?: number | null;
  matchStatus: PackingScanDetection['matchStatus'];
  quantityDetected?: number;
  source?: string;
  bbox?: Record<string, unknown> | null;
  rawPayload?: Record<string, unknown> | null;
}>): Promise<void> {
  if (detections.length === 0) return;

  const rows = detections.map((d) => ({
    session_id: sessionId,
    packing_item_id: d.packingItemId ?? null,
    detected_label: d.detectedLabel,
    normalized_label: d.normalizedLabel ?? null,
    confidence: d.confidence ?? null,
    match_status: d.matchStatus,
    quantity_detected: d.quantityDetected ?? 1,
    source: d.source ?? 'vision',
    bbox: d.bbox ?? null,
    raw_payload: d.rawPayload ?? null,
  }));

  const { error } = await supabase
    .from('packing_scan_detections')
    .insert(rows);

  if (error) throw error;
}

export async function fetchPackingScanDetections(sessionId: string): Promise<PackingScanDetection[]> {
  const { data, error } = await supabase
    .from('packing_scan_detections')
    .select('*')
    .eq('session_id', sessionId)
    .order('created_at', { ascending: true });

  if (error) throw error;
  return (data ?? []).map(mapDetection);
}

export async function saveSuitcaseLayoutPlan(plan: Omit<SuitcaseLayoutPlan, 'createdAt' | 'updatedAt'>): Promise<SuitcaseLayoutPlan> {
  const { data, error } = await supabase
    .from('suitcase_layout_plans')
    .upsert({
      id: plan.id,
      user_id: plan.userId,
      trip_id: plan.tripId,
      traveler_id: plan.travelerId,
      suitcase_profile_id: plan.suitcaseProfileId,
      strategy_version: plan.strategyVersion,
      layout: plan.layout,
      notes: plan.notes,
      generated_by: plan.generatedBy,
      status: plan.status,
      updated_at: new Date().toISOString(),
    }, { onConflict: 'id' })
    .select('*')
    .single();

  if (error) throw error;
  return mapLayoutPlan(data);
}

export async function fetchSuitcaseLayoutPlans(tripId: string, travelerId?: string | null): Promise<SuitcaseLayoutPlan[]> {
  let query = supabase
    .from('suitcase_layout_plans')
    .select('*')
    .eq('trip_id', tripId)
    .order('created_at', { ascending: false });

  if (travelerId) {
    query = query.eq('traveler_id', travelerId);
  }

  const { data, error } = await query;
  if (error) throw error;

  return (data ?? []).map(mapLayoutPlan);
}

function normalizeLabel(value: string): string {
  return value
    .trim()
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^\w\s]/g, ' ')
    .replace(/\s+/g, ' ');
}

function toNumber(value: unknown, fallback = 0): number {
  if (typeof value === 'number' && Number.isFinite(value)) return value;
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : fallback;
}

function parseJsonObject(raw: string): Record<string, unknown> | null {
  const text = raw.trim();
  if (!text) return null;

  try {
    const parsed = JSON.parse(text) as unknown;
    if (parsed && typeof parsed === 'object' && !Array.isArray(parsed)) return parsed as Record<string, unknown>;
  } catch {
    // continue
  }

  const start = text.indexOf('{');
  const end = text.lastIndexOf('}');
  if (start < 0 || end <= start) return null;
  try {
    const parsed = JSON.parse(text.slice(start, end + 1)) as unknown;
    if (parsed && typeof parsed === 'object' && !Array.isArray(parsed)) return parsed as Record<string, unknown>;
  } catch {
    return null;
  }
  return null;
}

export interface PackingScanSummary {
  completionPct: number;
  missingCount: number;
  duplicateCount: number;
  uncertainCount: number;
  extraCount: number;
  confidenceAvg: number;
}

export interface PackingScanProgressRow {
  key: string;
  detected: number;
  total: number;
  pct: number;
}

export interface PackingScanResult {
  detected: Array<{
    packingItemId: string | null;
    detectedLabel: string;
    normalizedLabel: string;
    confidence: number;
    quantityDetected: number;
    matchStatus: PackingScanDetection['matchStatus'];
  }>;
  summary: PackingScanSummary;
  missingPackingItemIds: string[];
  categoryProgress: PackingScanProgressRow[];
  travelerProgress: PackingScanProgressRow[];
  notes: string;
}

export function computePackingScanResult(params: {
  checklistItems: PackingItem[];
  detected: PackingScanResult['detected'];
  notes?: string;
}): PackingScanResult {
  const { checklistItems, detected } = params;
  const requiredItems = checklistItems.filter((x) => x.required);
  const requiredIds = new Set(requiredItems.map((x) => x.id));
  const matchedIds = new Set(
    detected
      .filter((d) => d.matchStatus === 'matched' && d.packingItemId)
      .map((d) => String(d.packingItemId))
  );

  const duplicateCount = detected.filter((d) => d.matchStatus === 'duplicate').length;
  const uncertainCount = detected.filter((d) => d.matchStatus === 'uncertain').length;
  const extraCount = detected.filter((d) => d.matchStatus === 'extra').length;

  const missingPackingItemIds = [...requiredIds].filter((id) => !matchedIds.has(id));
  const missingCount = missingPackingItemIds.length;
  const completionPct = requiredIds.size === 0 ? 0 : Math.round((matchedIds.size / requiredIds.size) * 100);

  const confidenceRows = detected.filter((d) => Number.isFinite(d.confidence) && d.confidence > 0);
  const confidenceAvg =
    confidenceRows.length === 0
      ? 0
      : Number((confidenceRows.reduce((acc, row) => acc + row.confidence, 0) / confidenceRows.length).toFixed(4));

  const categoryProgressMap = new Map<string, { total: number; detected: number }>();
  for (const item of checklistItems) {
    const current = categoryProgressMap.get(item.category) ?? { total: 0, detected: 0 };
    current.total += 1;
    if (matchedIds.has(item.id)) current.detected += 1;
    categoryProgressMap.set(item.category, current);
  }
  const categoryProgress: PackingScanProgressRow[] = [...categoryProgressMap.entries()].map(([key, value]) => ({
    key,
    detected: value.detected,
    total: value.total,
    pct: value.total === 0 ? 0 : Math.round((value.detected / value.total) * 100),
  }));

  const travelerProgressMap = new Map<string, { total: number; detected: number }>();
  for (const item of checklistItems) {
    const key = item.travelerId ?? 'shared';
    const current = travelerProgressMap.get(key) ?? { total: 0, detected: 0 };
    current.total += 1;
    if (matchedIds.has(item.id)) current.detected += 1;
    travelerProgressMap.set(key, current);
  }
  const travelerProgress: PackingScanProgressRow[] = [...travelerProgressMap.entries()].map(([key, value]) => ({
    key,
    detected: value.detected,
    total: value.total,
    pct: value.total === 0 ? 0 : Math.round((value.detected / value.total) * 100),
  }));

  return {
    detected,
    summary: {
      completionPct,
      missingCount,
      duplicateCount,
      uncertainCount,
      extraCount,
      confidenceAvg,
    },
    missingPackingItemIds,
    categoryProgress,
    travelerProgress,
    notes: params.notes ?? '',
  };
}

function findPackingItemIdByLabel(label: string, checklistItems: PackingItem[]): string | null {
  const normalized = normalizeLabel(label);
  if (!normalized) return null;

  const exact = checklistItems.find((item) => normalizeLabel(item.label) === normalized);
  if (exact) return exact.id;

  const partial = checklistItems.find((item) => {
    const itemLabel = normalizeLabel(item.label);
    return itemLabel.includes(normalized) || normalized.includes(itemLabel);
  });
  return partial?.id ?? null;
}

export async function invokePackingValidationScan(input: {
  imageDataUrl: string;
  luggageType: string;
  checklistItems: PackingItem[];
  appLang: string;
}): Promise<PackingScanResult> {
  const payloadChecklist = input.checklistItems.map((item) => ({
    id: item.id,
    traveler_id: item.travelerId ?? null,
    label: item.label,
    category: item.category,
    required: item.required,
    quantity: item.quantity,
  }));

  const { data, error } = await supabase.functions.invoke('ai-orchestrator', {
    body: {
      task_type: 'packing_validation_scan',
      payload: {
        imageDataUrl: input.imageDataUrl,
        luggageType: input.luggageType,
        checklist_items: payloadChecklist,
      },
      language_context: { app_lang: input.appLang },
    },
  });

  if (error) throw error;

  const parsedCandidate = (data as { result?: { parsed?: unknown; raw?: string } } | null)?.result?.parsed;
  const rawCandidate = (data as { result?: { raw?: string } } | null)?.result?.raw ?? '';
  const parsed =
    (parsedCandidate && typeof parsedCandidate === 'object' && !Array.isArray(parsedCandidate)
      ? parsedCandidate
      : parseJsonObject(rawCandidate)) ?? {};

  const parsedDetected = Array.isArray((parsed as { detected?: unknown[] }).detected)
    ? ((parsed as { detected?: unknown[] }).detected ?? [])
    : [];

  const detected: PackingScanResult['detected'] = parsedDetected.map((row) => {
    const source = (row && typeof row === 'object') ? row as Record<string, unknown> : {};
    const detectedLabel = String(source.detected_label ?? source.label ?? '').trim();
    const normalizedLabel = String(source.normalized_label ?? detectedLabel).trim();
    const explicitPackingItemId =
      source.packing_item_id == null || source.packing_item_id === ''
        ? null
        : String(source.packing_item_id);

    const matched = explicitPackingItemId ?? findPackingItemIdByLabel(normalizedLabel, input.checklistItems);
    const statusRaw = String(source.match_status ?? 'uncertain') as PackingScanDetection['matchStatus'];
    const allowedStatus: PackingScanDetection['matchStatus'][] = ['matched', 'missing', 'duplicate', 'uncertain', 'extra'];
    const matchStatus = allowedStatus.includes(statusRaw) ? statusRaw : 'uncertain';

    return {
      packingItemId: matched,
      detectedLabel: detectedLabel || normalizedLabel,
      normalizedLabel: normalizeLabel(normalizedLabel || detectedLabel),
      confidence: toNumber(source.confidence, 0),
      quantityDetected: Math.max(1, Math.round(toNumber(source.quantity_detected, 1))),
      matchStatus,
    };
  }).filter((row) => row.detectedLabel.length > 0);

  const result = computePackingScanResult({
    checklistItems: input.checklistItems,
    detected,
    notes: String((parsed as { notes?: unknown }).notes ?? ''),
  });

  // Si el modelo no reporta faltantes explícitos, los computamos desde checklist requerido.
  if (result.missingPackingItemIds.length === 0) {
    return result;
  }

  return result;
}

export async function invokeSuitcaseLayoutPlan(input: {
  profile: SuitcaseProfile;
  checklistItems: PackingItem[];
  scanResult: PackingScanResult;
  appLang: string;
  tripContext?: Record<string, unknown>;
}): Promise<{
  strategyVersion: string;
  layout: Record<string, unknown>;
  notes: string;
}> {
  const { data, error } = await supabase.functions.invoke('ai-orchestrator', {
    body: {
      task_type: 'suitcase_layout_plan',
      payload: {
        profile: {
          luggage_type: input.profile.luggageType,
          dimensions_cm: {
            height: input.profile.heightCm,
            width: input.profile.widthCm,
            depth: input.profile.depthCm,
          },
          weight_limit_kg: input.profile.weightLimitKg,
          compartments: input.profile.compartments,
          constraints: input.profile.constraints,
        },
        checklist_items: input.checklistItems.map((item) => ({
          id: item.id,
          label: item.label,
          category: item.category,
          quantity: item.quantity,
          required: item.required,
          checked: item.checked,
        })),
        scan_summary: input.scanResult.summary,
      },
      trip_context: input.tripContext ?? {},
      language_context: { app_lang: input.appLang },
    },
  });

  if (error) throw error;

  const parsedCandidate = (data as { result?: { parsed?: unknown; raw?: string } } | null)?.result?.parsed;
  const rawCandidate = (data as { result?: { raw?: string } } | null)?.result?.raw ?? '';
  const parsed =
    (parsedCandidate && typeof parsedCandidate === 'object' && !Array.isArray(parsedCandidate)
      ? parsedCandidate
      : parseJsonObject(rawCandidate)) ?? {};

  const strategyVersion = String((parsed as { strategy_version?: unknown }).strategy_version ?? 'v1');
  const layoutRaw = (parsed as { layout?: unknown }).layout;
  const layout = (layoutRaw && typeof layoutRaw === 'object' && !Array.isArray(layoutRaw))
    ? layoutRaw as Record<string, unknown>
    : {};

  const notes = String((parsed as { notes?: unknown }).notes ?? '').trim();

  return {
    strategyVersion,
    layout,
    notes,
  };
}
