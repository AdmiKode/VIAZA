/**
 * mapsService.ts
 * Centraliza toda la lógica de deep links y URLs de Google Maps / Waze.
 * Para deep links nativos (Capacitor), usa los esquemas URI directos.
 */

import type { TransportType } from '../../types/trip';

// ─── Static Map URL (para thumbnails en tarjetas) ────────────────────────────

/** Devuelve URL de imagen estática de Google Maps centrada en lat/lon. */
export function staticMapUrl(params: {
  lat: number;
  lon: number;
  zoom?: number;
  width?: number;
  height?: number;
  markers?: boolean;
}): string | null {
  void params;
  // Regla de seguridad: no exponer API keys en frontend.
  // Si se requiere thumbnail, debe renderizarse con assets locales por tipo de viaje
  // o vía Edge Function que proxyee la imagen sin filtrar la key.
  return null;
}

// ─── Deep Links ─────────────────────────────────────────────────────────────

/** Google Maps deep link para navegar a una dirección o coordenadas. */
export function googleMapsNavUrl(params: {
  lat?: number;
  lon?: number;
  placeName?: string;
  mode?: 'driving' | 'walking' | 'transit';
}): string {
  const { lat, lon, placeName, mode = 'driving' } = params;
  const dest = lat && lon ? `${lat},${lon}` : encodeURIComponent(placeName ?? '');
  return `https://www.google.com/maps/dir/?api=1&destination=${dest}&travelmode=${mode}`;
}

/** Waze deep link para navegación por auto. */
export function wazeNavUrl(params: { lat: number; lon: number }): string {
  const { lat, lon } = params;
  return `waze://ul?ll=${lat},${lon}&navigate=yes`;
}

/** Waze fallback web (si la app no está instalada). */
export function wazeWebUrl(params: { lat: number; lon: number }): string {
  const { lat, lon } = params;
  return `https://waze.com/ul?ll=${lat},${lon}&navigate=yes`;
}

/** Apple Maps deep link (iOS). */
export function appleMapsUrl(params: {
  lat?: number;
  lon?: number;
  placeName?: string;
}): string {
  const { lat, lon, placeName } = params;
  const dest = lat && lon ? `${lat},${lon}` : encodeURIComponent(placeName ?? '');
  return `maps://maps.apple.com/?daddr=${dest}&dirflg=d`;
}

// ─── Por TransportType ───────────────────────────────────────────────────────

export interface TransportDeepLink {
  label: string;
  url: string;
  fallbackUrl?: string; // web fallback si app no está instalada
  icon: 'google-maps' | 'waze' | 'apple-maps';
}

/**
 * Genera los deep links de navegación según el tipo de transporte.
 * - flight: Maps al aeropuerto (IATA → nombre)
 * - car: Waze + Google Maps al destino
 * - bus: Maps a la terminal
 * - train: Maps a la estación
 * - cruise: Maps al puerto
 */
export function getTransportDeepLinks(params: {
  transportType: TransportType;
  destinationLat?: number;
  destinationLon?: number;
  destinationName?: string;
  airportCode?: string;
  busTerminal?: string;
  trainStation?: string;
  cruisePort?: string;
}): TransportDeepLink[] {
  const {
    transportType,
    destinationLat: lat,
    destinationLon: lon,
    destinationName,
    airportCode,
    busTerminal,
    trainStation,
    cruisePort,
  } = params;

  const links: TransportDeepLink[] = [];

  switch (transportType) {
    case 'flight': {
      const airportName = airportCode
        ? `Aeropuerto ${airportCode}`
        : `aeropuerto ${destinationName ?? ''}`;
      links.push({
        label: 'Ir al aeropuerto',
        url: googleMapsNavUrl({ placeName: airportName }),
        icon: 'google-maps',
      });
      break;
    }

    case 'car': {
      if (lat && lon) {
        links.push({
          label: 'Navegar con Waze',
          url: wazeNavUrl({ lat, lon }),
          fallbackUrl: wazeWebUrl({ lat, lon }),
          icon: 'waze',
        });
        links.push({
          label: 'Google Maps',
          url: googleMapsNavUrl({ lat, lon }),
          icon: 'google-maps',
        });
      } else if (destinationName) {
        links.push({
          label: 'Cómo llegar',
          url: googleMapsNavUrl({ placeName: destinationName }),
          icon: 'google-maps',
        });
      }
      break;
    }

    case 'bus': {
      const terminal = busTerminal ?? `Central de autobuses ${destinationName ?? ''}`;
      links.push({
        label: 'Ir a la terminal',
        url: googleMapsNavUrl({ placeName: terminal }),
        icon: 'google-maps',
      });
      break;
    }

    case 'train': {
      const station = trainStation ?? `Estación de tren ${destinationName ?? ''}`;
      links.push({
        label: 'Ir a la estación',
        url: googleMapsNavUrl({ placeName: station }),
        icon: 'google-maps',
      });
      break;
    }

    case 'cruise': {
      const port = cruisePort ?? `Puerto de cruceros ${destinationName ?? ''}`;
      links.push({
        label: 'Ir al puerto',
        url: googleMapsNavUrl({ placeName: port }),
        icon: 'google-maps',
      });
      break;
    }
  }

  return links;
}
