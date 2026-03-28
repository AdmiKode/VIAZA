export type WalletDocType =
  | 'boarding_pass'
  | 'reservation'
  | 'ticket'
  | 'policy'
  | 'document'
  | 'other';

export interface WalletDoc {
  id: string;
  tripId: string;
  docType: WalletDocType;
  fileName?: string;
  mimeType?: string;
  storagePath: string;
  publicUrl?: string;
  parsedData?: unknown;
  createdAt: string;
  updatedAt?: string;
  // Campos añadidos en 20260328_wallet_expiration.sql
  expirationDate?: string | null;   // ISO date: '2027-04-10'
  ocrName?: string | null;          // Nombre extraído por OCR
  ocrDocNumber?: string | null;     // Número de doc (pasaporte, visa...)
  isReportedLost?: boolean;         // Flag UI solamente
  lostReportedAt?: string | null;   // ISO timestamp del reporte
}

/** Días hasta vencimiento. Negativo = ya venció. null = sin fecha. */
export function daysUntilExpiration(doc: WalletDoc): number | null {
  if (!doc.expirationDate) return null;
  const exp = new Date(doc.expirationDate).getTime();
  const now = new Date().setHours(0, 0, 0, 0);
  return Math.ceil((exp - now) / (1000 * 60 * 60 * 24));
}

/** Nivel de alerta basado en días hasta vencimiento. */
export type ExpirationLevel = 'expired' | 'critical' | 'warning' | 'ok' | 'none';

export function expirationLevel(doc: WalletDoc): ExpirationLevel {
  const days = daysUntilExpiration(doc);
  if (days === null) return 'none';
  if (days < 0) return 'expired';
  if (days <= 7) return 'critical';
  if (days <= 30) return 'warning';
  return 'ok';
}

