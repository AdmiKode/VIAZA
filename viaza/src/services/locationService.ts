/**
 * locationService.ts
 * Geolocalización real usando @capacitor/geolocation.
 * Sin mocks — lanza error claro si los permisos son denegados.
 */

import { Geolocation } from '@capacitor/geolocation';
import { Capacitor } from '@capacitor/core';

export interface Coordinates {
  lat: number;
  lon: number;
  accuracy: number;
}

/**
 * Obtiene la posición actual del dispositivo.
 */
export async function getCurrentPosition(): Promise<Coordinates> {
  if (Capacitor.isNativePlatform()) {
    const perms = await Geolocation.requestPermissions();
    if (perms.location === 'denied') {
      throw new Error('Permiso de ubicación denegado');
    }
  }

  const pos = await Geolocation.getCurrentPosition({
    enableHighAccuracy: true,
    timeout: 10000,
  });

  return {
    lat: pos.coords.latitude,
    lon: pos.coords.longitude,
    accuracy: pos.coords.accuracy,
  };
}

/**
 * Verifica si la geolocalización está disponible.
 */
export async function isLocationAvailable(): Promise<boolean> {
  try {
    if (!Capacitor.isNativePlatform() && !navigator.geolocation) return false;
    return true;
  } catch {
    return false;
  }
}
