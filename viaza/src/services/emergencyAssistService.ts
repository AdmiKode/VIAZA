import { Capacitor } from '@capacitor/core';

type SosChannel = 'whatsapp' | 'sms';

function normalizePhone(raw: string): string {
  return raw.replace(/[^\d+]/g, '').replace(/^00/, '+');
}

function channelUrl(channel: SosChannel, phone: string, encodedMessage: string): string {
  if (channel === 'whatsapp') {
    const plainPhone = phone.replace(/[^\d]/g, '');
    return `https://wa.me/${plainPhone}?text=${encodedMessage}`;
  }

  const separator = phone.includes('?') ? '&' : '?';
  return `sms:${phone}${separator}body=${encodedMessage}`;
}

function openUrl(url: string): void {
  if (Capacitor.isNativePlatform()) {
    window.location.href = url;
    return;
  }
  window.open(url, '_blank', 'noopener,noreferrer');
}

export function buildSosMessage(input: {
  travelerName: string;
  destination?: string | null;
  trackingUrl?: string | null;
  lat?: number | null;
  lon?: number | null;
}): string {
  const lines: string[] = [];
  lines.push(`SOS VIAZA: ${input.travelerName} solicita acompanamiento.`);

  if (input.destination) {
    lines.push(`Destino: ${input.destination}.`);
  }

  if (input.lat != null && input.lon != null) {
    lines.push(`Ubicacion actual: https://maps.google.com/?q=${input.lat},${input.lon}`);
  }

  if (input.trackingUrl) {
    lines.push(`Emergency card / tracking: ${input.trackingUrl}`);
  }

  lines.push('Por favor confirma recepcion y manten contacto activo.');
  return lines.join('\n');
}

export function sendAssistedSos(params: {
  channel: SosChannel;
  phone: string;
  message: string;
}): void {
  const normalized = normalizePhone(params.phone);
  const encoded = encodeURIComponent(params.message);
  const url = channelUrl(params.channel, normalized, encoded);

  if (params.channel === 'whatsapp') {
    if (Capacitor.isNativePlatform()) {
      // Intento nativo primero
      const waUrl = `whatsapp://send?phone=${normalized.replace(/[^\d]/g, '')}&text=${encoded}`;
      openUrl(waUrl);
      setTimeout(() => openUrl(url), 700);
      return;
    }
  }

  openUrl(url);
}
