export type LuggageType = 'carry_on' | 'checked' | 'backpack' | 'auto_trunk' | 'other';

export interface SuitcaseProfile {
  id: string;
  userId: string;
  tripId: string;
  travelerId: string | null;
  name: string;
  luggageType: LuggageType;
  heightCm: number | null;
  widthCm: number | null;
  depthCm: number | null;
  weightLimitKg: number | null;
  compartments: number;
  constraints: Record<string, unknown>;
  createdAt: string;
  updatedAt: string;
}

export type ScanSessionStatus = 'pending' | 'processing' | 'completed' | 'failed';

export interface PackingScanSession {
  id: string;
  userId: string;
  tripId: string;
  travelerId: string | null;
  suitcaseProfileId: string | null;
  status: ScanSessionStatus;
  confidenceAvg: number | null;
  completionPct: number | null;
  missingCount: number;
  duplicateCount: number;
  uncertainCount: number;
  startedAt: string;
  completedAt: string | null;
  metadata: Record<string, unknown>;
  createdAt: string;
  updatedAt: string;
}

export type DetectionMatchStatus = 'matched' | 'missing' | 'duplicate' | 'uncertain' | 'extra';

export interface PackingScanDetection {
  id: number;
  sessionId: string;
  packingItemId: string | null;
  detectedLabel: string;
  normalizedLabel: string | null;
  confidence: number | null;
  matchStatus: DetectionMatchStatus;
  quantityDetected: number;
  source: string;
  bbox: Record<string, unknown> | null;
  rawPayload: Record<string, unknown> | null;
  createdAt: string;
}

export type LayoutPlanStatus = 'draft' | 'approved' | 'applied';

export interface SuitcaseLayoutPlan {
  id: string;
  userId: string;
  tripId: string;
  travelerId: string | null;
  suitcaseProfileId: string;
  strategyVersion: string;
  layout: Record<string, unknown>;
  notes: string | null;
  generatedBy: string;
  status: LayoutPlanStatus;
  createdAt: string;
  updatedAt: string;
}
