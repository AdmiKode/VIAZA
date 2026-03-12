/**
 * Tipos para el sistema de integrantes del viaje y maleta por persona.
 */

export type TravelerRole = 'adult' | 'kid' | 'baby';

export interface Traveler {
  id: string;
  tripId: string;
  name: string;
  role: TravelerRole;
  /** Índice de orden (0 = titular del viaje) */
  order: number;
}

/** Foto de evidencia de un ítem de maleta */
export interface PackingEvidence {
  itemId: string;
  travelerId: string;
  /** base64 data URL de la foto */
  photoDataUrl: string;
  takenAt: string; // ISO
}

/** Foto final de maleta completa para el asistente de acomodo */
export interface LuggagePhoto {
  id: string;
  tripId: string;
  travelerId: string;
  photoDataUrl: string;
  takenAt: string;
  /** Tamaño de maleta elegido por el usuario */
  luggageSize: 'cabin' | 'medium' | 'large' | 'extra_large';
  /** Recomendación de acomodo generada por IA */
  arrangementSuggestion?: string;
  arrangementStatus: 'pending' | 'analyzing' | 'ready' | 'error';
}
