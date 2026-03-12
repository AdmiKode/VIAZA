/**
 * cameraService.ts
 * Servicio de cámara real usando @capacitor/camera.
 * En web usa el input file nativo del navegador como fallback.
 * Sin mocks — si la cámara no está disponible, lanza error claro.
 */

import { Camera, CameraResultType, CameraSource } from '@capacitor/camera';
import { Capacitor } from '@capacitor/core';

export interface PhotoResult {
  dataUrl: string;   // base64 data URL para mostrar en <img>
  format: string;    // jpeg | png
}

/**
 * Toma una foto con la cámara del dispositivo.
 * En web abre el selector de archivos nativo.
 */
export async function takePhoto(): Promise<PhotoResult> {
  const photo = await Camera.getPhoto({
    resultType: CameraResultType.DataUrl,
    source: Capacitor.isNativePlatform() ? CameraSource.Camera : CameraSource.Prompt,
    quality: 80,
    allowEditing: false,
    saveToGallery: false,
  });

  if (!photo.dataUrl) {
    throw new Error('No se pudo obtener la foto');
  }

  return {
    dataUrl: photo.dataUrl,
    format: photo.format ?? 'jpeg',
  };
}

/**
 * Solicita permisos de cámara explícitamente (solo nativo).
 * En web no hace nada (el navegador pide permisos al usar).
 */
export async function requestCameraPermissions(): Promise<void> {
  if (!Capacitor.isNativePlatform()) return;
  const perms = await Camera.requestPermissions({ permissions: ['camera'] });
  if (perms.camera === 'denied') {
    throw new Error('Permiso de cámara denegado');
  }
}
