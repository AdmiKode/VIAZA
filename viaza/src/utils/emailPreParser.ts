/**
 * Regex pre-parser for reservation emails / confirmation texts.
 * Runs client-side BEFORE calling AI — saves API cost on high-confidence matches.
 */

import type { ItineraryEventType } from '../types/itinerary';
import type { ParsedReservation } from '../services/reservationParserService';

// ─── Helpers ─────────────────────────────────────────────────────────────────

/** Normalise text: collapse whitespace, unify line endings */
function norm(text: string) {
  return text.replace(/\r\n/g, '\n').replace(/[ \t]+/g, ' ').trim();
}

/** Try to find a 6-char alphanumeric booking reference */
function extractBookingRef(text: string): string | null {
  // Preceded by keywords like "reserva", "booking", "código", "PNR", "ref", ":"
  const anchored = text.match(
    /(?:reserva|booking|código|pnr|ref|localizador|confirmation|confirmación)[:\s#]+([A-Z0-9]{5,8})\b/i
  );
  if (anchored) return anchored[1].toUpperCase();

  // Standalone 6-char uppercase alphanum that looks like a booking code
  const standalone = text.match(/\b([A-Z]{2,4}[0-9]{2,4}|[A-Z0-9]{6})\b/g);
  if (standalone) {
    // Filter out common false-positives: airline IATA codes, country codes, etc.
    const candidates = standalone.filter(
      (c) => c.length >= 6 && !/^(FLIGHT|HOTEL|CHECK|GATES?|SEAT|BOARDING)$/i.test(c)
    );
    if (candidates.length) return candidates[0].toUpperCase();
  }
  return null;
}

/** Parse dates in multiple formats → ISO string or readable text */
function extractDate(text: string): string | null {
  // ISO: 2026-03-15
  let m = text.match(/\b(\d{4}-\d{2}-\d{2})\b/);
  if (m) return m[1];

  // DD/MM/YYYY or DD-MM-YYYY
  m = text.match(/\b(\d{1,2})[\/\-](\d{1,2})[\/\-](\d{4})\b/);
  if (m) return `${m[3]}-${m[2].padStart(2, '0')}-${m[1].padStart(2, '0')}`;

  // "15 Mar 2026" / "15 marzo 2026" / "March 15, 2026"
  const MONTHS: Record<string, string> = {
    jan: '01', feb: '02', mar: '03', apr: '04', may: '05', jun: '06',
    jul: '07', aug: '08', sep: '09', oct: '10', nov: '11', dec: '12',
    ene: '01', abr: '04', ago: '08', dic: '12',
    enero: '01', febrero: '02', marzo: '03', abril: '04', mayo: '05',
    junio: '06', julio: '07', agosto: '08', septiembre: '09',
    octubre: '10', noviembre: '11', diciembre: '12',
    january: '01', february: '02', march: '03', april: '04', june: '06',
    july: '07', august: '08', september: '09', october: '10', november: '11', december: '12',
  };

  m = text.match(
    /\b(\d{1,2})\s+(enero|febrero|marzo|abril|mayo|junio|julio|agosto|septiembre|octubre|noviembre|diciembre|jan|feb|mar|apr|may|jun|jul|aug|sep|oct|nov|dec)\w*\s+(\d{4})\b/i
  );
  if (m) {
    const month = MONTHS[m[2].toLowerCase().slice(0, 3)] ?? MONTHS[m[2].toLowerCase()] ?? '01';
    return `${m[3]}-${month}-${m[1].padStart(2, '0')}`;
  }

  // "March 15, 2026"
  m = text.match(
    /\b(january|february|march|april|may|june|july|august|september|october|november|december)\s+(\d{1,2}),?\s+(\d{4})\b/i
  );
  if (m) {
    const month = MONTHS[m[1].toLowerCase()] ?? '01';
    return `${m[3]}-${month}-${m[2].padStart(2, '0')}`;
  }

  return null;
}

/** Extract HH:MM time */
function extractTime(text: string): string | null {
  const m = text.match(/\b(\d{1,2}):(\d{2})(?:\s?(?:hrs?|h|am|pm))?\b/i);
  if (!m) return null;
  let h = parseInt(m[1], 10);
  const min = m[2];
  if (/pm/i.test(text.slice(m.index ?? 0, (m.index ?? 0) + 8)) && h < 12) h += 12;
  return `${String(h).padStart(2, '0')}:${min}`;
}

/** Extract two consecutive times (departure → arrival) */
function extractTimePair(text: string): [string | null, string | null] {
  const times = [...text.matchAll(/\b(\d{1,2}:\d{2})(?:\s?(?:hrs?|h))?\b/gi)].map((m) => m[1]);
  if (times.length >= 2) return [times[0], times[1]];
  if (times.length === 1) return [times[0], null];
  return [null, null];
}

// ─── Flight parser ────────────────────────────────────────────────────────────

function parseFlight(text: string): ParsedReservation | null {
  // Flight number: 2-letter airline code + 1-4 digits
  const flightMatch = text.match(/\b([A-Z]{2})\s?(\d{1,4})\b/);
  if (!flightMatch) return null;
  const flightNum = `${flightMatch[1]}${flightMatch[2]}`;

  // Route: IATA codes like "MAD → CDG" or "MAD-CDG" or "(MAD)" ... "(CDG)"
  const routeMatch = text.match(/\b([A-Z]{3})\s?[-→>]+\s?([A-Z]{3})\b/);
  const route = routeMatch ? `${routeMatch[1]} → ${routeMatch[2]}` : null;

  const title = route
    ? `Vuelo ${flightNum} ${route}`
    : `Vuelo ${flightNum}`;

  const bookingRef = extractBookingRef(text);
  const rawDate = extractDate(text);
  const [startTime, endTime] = extractTimePair(text);

  // Confidence: need at least flight number to be sure
  return {
    type: 'flight',
    title,
    description: [route && `Ruta: ${route}`, rawDate && `Fecha: ${rawDate}`]
      .filter(Boolean)
      .join(' · ') || undefined,
    startTime: startTime ?? undefined,
    endTime: endTime ?? undefined,
    confirmationCode: bookingRef ?? undefined,
    rawDate: rawDate ?? undefined,
  };
}

// ─── Hotel parser ─────────────────────────────────────────────────────────────

function parseHotel(text: string): ParsedReservation | null {
  // Keywords
  const isHotel = /\b(hotel|hostel|hospedaje|alojamiento|resort|inn|lodge|b&b|airbnb|check[-\s]?in|check[-\s]?out|llegada|salida)\b/i.test(text);
  if (!isHotel) return null;

  // Hotel name: text near "Hotel" keyword
  const nameMatch = text.match(/(?:hotel|resort|hostel|lodge|inn)\s+([A-ZÁÉÍÓÚÑ][A-Za-záéíóúñÁÉÍÓÚÑ\s]{2,35})/i);
  const hotelName = nameMatch ? nameMatch[1].trim() : 'Hotel';

  const bookingRef = extractBookingRef(text);
  const rawDate = extractDate(text);
  const [startTime] = extractTimePair(text);

  // Check-in time
  const checkInMatch = text.match(/check[-\s]?in[:\s]+(\d{1,2}:\d{2})/i);
  const checkIn = checkInMatch ? checkInMatch[1] : startTime;

  return {
    type: 'hotel',
    title: `Hotel ${hotelName}`.replace(/Hotel hotel/i, 'Hotel'),
    description: rawDate ? `Llegada: ${rawDate}` : undefined,
    startTime: checkIn ?? undefined,
    confirmationCode: bookingRef ?? undefined,
    rawDate: rawDate ?? undefined,
  };
}

// ─── Tour / Activity parser ───────────────────────────────────────────────────

function parseActivity(text: string): ParsedReservation | null {
  const isActivity = /\b(tour|excursión|excursion|actividad|activity|ticket|entrada|experiencia|visita|reserva de|booking for)\b/i.test(text);
  if (!isActivity) return null;

  const nameMatch = text.match(/(?:tour|excursión|actividad|ticket|entrada|experiencia|visita)\s*(?:a|de|:)?\s*([A-ZÁÉÍÓÚÑ][A-Za-záéíóúñÁÉÍÓÚÑ\s,]{2,50})/i);
  const actTitle = nameMatch ? nameMatch[1].trim().replace(/\n.*/s, '') : 'Actividad';

  const bookingRef = extractBookingRef(text);
  const rawDate = extractDate(text);
  const [startTime] = extractTimePair(text);

  return {
    type: 'activity',
    title: actTitle.length > 4 ? actTitle : 'Actividad reservada',
    startTime: startTime ?? undefined,
    confirmationCode: bookingRef ?? undefined,
    rawDate: rawDate ?? undefined,
  };
}

// ─── Restaurant / Meal parser ─────────────────────────────────────────────────

function parseMeal(text: string): ParsedReservation | null {
  const isMeal = /\b(restaurante|restaurant|reserva de mesa|dinner|cena|comida|almuerzo|mesa para|table for|dining)\b/i.test(text);
  if (!isMeal) return null;

  const nameMatch = text.match(/(?:restaurante?|restaurant)\s+([A-ZÁÉÍÓÚÑ][A-Za-záéíóúñÁÉÍÓÚÑ\s]{2,35})/i);
  const restName = nameMatch ? nameMatch[1].trim() : 'Restaurante';

  const bookingRef = extractBookingRef(text);
  const rawDate = extractDate(text);
  const [startTime] = extractTimePair(text);

  return {
    type: 'meal',
    title: `${restName}`,
    startTime: startTime ?? undefined,
    confirmationCode: bookingRef ?? undefined,
    rawDate: rawDate ?? undefined,
  };
}

// ─── Transport parser (trains, buses, etc.) ───────────────────────────────────

function parseTransport(text: string): ParsedReservation | null {
  const isTransport = /\b(tren|train|bus|autobús|autobus|ferry|barco|crucero|cruise|AVE|Renfe|BlaBlaCar|FlixBus)\b/i.test(text);
  if (!isTransport) return null;

  const bookingRef = extractBookingRef(text);
  const rawDate = extractDate(text);
  const [startTime, endTime] = extractTimePair(text);

  const routeMatch = text.match(/\b([A-ZÁÉÍÓÚÑ][a-záéíóúñ]{2,})\s?[-→>]+\s?([A-ZÁÉÍÓÚÑ][a-záéíóúñ]{2,})\b/);
  const route = routeMatch ? `${routeMatch[1]} → ${routeMatch[2]}` : null;

  const typeMatch = text.match(/\b(tren|train|bus|autobús|ferry|barco|crucero|cruise|AVE)\b/i);
  const transportType = typeMatch ? typeMatch[1].charAt(0).toUpperCase() + typeMatch[1].slice(1).toLowerCase() : 'Transporte';

  return {
    type: 'transport',
    title: route ? `${transportType} ${route}` : `${transportType} reservado`,
    startTime: startTime ?? undefined,
    endTime: endTime ?? undefined,
    confirmationCode: bookingRef ?? undefined,
    rawDate: rawDate ?? undefined,
  };
}

// ─── Main exported function ───────────────────────────────────────────────────

export interface PreParseResult {
  /** Whether we found a high-confidence match that can skip the AI call */
  highConfidence: boolean;
  /** The parsed result — present even for low-confidence (partial pre-fill) */
  result: ParsedReservation | null;
  /** Detected type, used for routing to correct AI prompt */
  detectedType: ItineraryEventType | null;
}

/**
 * Try to pre-parse a reservation text with regex patterns.
 * Returns a confidence score + partial result.
 *
 * High-confidence = found type + booking ref + date (AI call can be skipped).
 * Low-confidence = partial fields found, should still call AI but pre-fill context.
 */
export function preParseEmailText(rawText: string): PreParseResult {
  const text = norm(rawText);

  // Ordered by specificity
  const parsers: Array<(t: string) => ParsedReservation | null> = [
    parseFlight,
    parseHotel,
    parseMeal,
    parseTransport,
    parseActivity,
  ];

  for (const parser of parsers) {
    const result = parser(text);
    if (!result) continue;

    // High confidence: has booking ref AND (date OR time)
    const highConfidence = !!(
      result.confirmationCode &&
      (result.rawDate || result.startTime)
    );

    return {
      highConfidence,
      result,
      detectedType: result.type,
    };
  }

  return { highConfidence: false, result: null, detectedType: null };
}
