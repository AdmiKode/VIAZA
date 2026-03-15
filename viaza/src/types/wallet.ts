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
}

