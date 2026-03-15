/**
 * boardingPassScanner.ts
 * Escanea un boarding pass o pase de abordar usando OpenAI Vision (gpt-4o).
 * Extrae: número de vuelo, aerolínea, origen, destino, gate, terminal,
 * hora de salida, hora de abordaje, asiento y nombre del pasajero.
 *
 * Sin mocks — usa cámara real + OpenAI real.
 * Si la key no está configurada, lanza error claro.
 */

import { supabase } from './supabaseClient';

export interface BoardingPassData {
  passengerName?: string;
  flightNumber?: string;
  airline?: string;
  originIata?: string;
  originCity?: string;
  destinationIata?: string;
  destinationCity?: string;
  departureDate?: string;       // YYYY-MM-DD
  departureTime?: string;       // HH:MM (24h)
  boardingTime?: string;        // HH:MM (24h)
  gate?: string;
  terminal?: string;
  seat?: string;
  bookingRef?: string;
  rawText?: string;             // texto completo extraído por la IA
}

const SYSTEM_PROMPT = `Eres un asistente especializado en leer pases de abordar (boarding passes).
Analiza la imagen y extrae TODOS los datos visibles. Responde ÚNICAMENTE con un objeto JSON válido con estas claves exactas (usa null si no encuentras el dato):
{
  "passengerName": string | null,
  "flightNumber": string | null,
  "airline": string | null,
  "originIata": string | null,
  "originCity": string | null,
  "destinationIata": string | null,
  "destinationCity": string | null,
  "departureDate": "YYYY-MM-DD" | null,
  "departureTime": "HH:MM" | null,
  "boardingTime": "HH:MM" | null,
  "gate": string | null,
  "terminal": string | null,
  "seat": string | null,
  "bookingRef": string | null,
  "rawText": string
}
No incluyas texto fuera del JSON. El campo rawText debe contener todo el texto visible en la imagen.`;

/**
 * Analiza una imagen de boarding pass en base64 y devuelve los datos extraídos.
 * @param imageBase64 - imagen en base64 (sin el prefijo data:image/...)
 * @param mimeType - tipo MIME de la imagen (default: image/jpeg)
 */
export async function scanBoardingPass(
  imageBase64: string,
  mimeType: 'image/jpeg' | 'image/png' | 'image/webp' = 'image/jpeg'
): Promise<BoardingPassData> {
  const { data, error } = await supabase.functions.invoke('ai-orchestrator', {
    body: {
      task_type: 'boarding_pass_ocr',
      payload: { imageDataUrl: `data:${mimeType};base64,${imageBase64}`, mimeType },
    },
  });
  if (error) throw error;
  const content = (data as { result?: { raw?: string } } | null)?.result?.raw ?? '';

  // Extraer el JSON de la respuesta (puede venir con markdown ```json```)
  const jsonMatch = content.match(/\{[\s\S]*\}/);
  if (!jsonMatch) {
    throw new Error('La IA no pudo extraer datos del boarding pass. Intenta con una imagen más clara.');
  }

  const parsed = JSON.parse(jsonMatch[0]) as Record<string, string | null>;

  // Limpiar nulls y devolver el objeto tipado
  const result: BoardingPassData = {};
  if (parsed.passengerName) result.passengerName = parsed.passengerName;
  if (parsed.flightNumber) result.flightNumber = parsed.flightNumber.replace(/\s+/g, '').toUpperCase();
  if (parsed.airline) result.airline = parsed.airline;
  if (parsed.originIata) result.originIata = parsed.originIata.toUpperCase();
  if (parsed.originCity) result.originCity = parsed.originCity;
  if (parsed.destinationIata) result.destinationIata = parsed.destinationIata.toUpperCase();
  if (parsed.destinationCity) result.destinationCity = parsed.destinationCity;
  if (parsed.departureDate) result.departureDate = parsed.departureDate;
  if (parsed.departureTime) result.departureTime = parsed.departureTime;
  if (parsed.boardingTime) result.boardingTime = parsed.boardingTime;
  if (parsed.gate) result.gate = parsed.gate;
  if (parsed.terminal) result.terminal = parsed.terminal;
  if (parsed.seat) result.seat = parsed.seat;
  if (parsed.bookingRef) result.bookingRef = parsed.bookingRef;
  if (parsed.rawText) result.rawText = parsed.rawText;

  return result;
}
