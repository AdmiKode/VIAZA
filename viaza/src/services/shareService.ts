/**
 * shareService.ts
 * Share nativo real usando @capacitor/share.
 * En web usa la Web Share API si está disponible.
 */

import { Share } from '@capacitor/share';
import { Capacitor } from '@capacitor/core';

export interface ShareOptions {
  title: string;
  text?: string;
  url?: string;
}

export async function shareContent(options: ShareOptions): Promise<void> {
  if (Capacitor.isNativePlatform()) {
    await Share.share({
      title: options.title,
      text: options.text,
      url: options.url,
      dialogTitle: options.title,
    });
    return;
  }

  // Web Share API
  if (navigator.share) {
    await navigator.share({
      title: options.title,
      text: options.text,
      url: options.url,
    });
    return;
  }

  // Fallback: copiar al portapapeles
  const content = [options.title, options.text, options.url].filter(Boolean).join('\n');
  await navigator.clipboard.writeText(content);
}

export async function canShare(): Promise<boolean> {
  if (Capacitor.isNativePlatform()) return true;
  return Boolean(navigator.share);
}
