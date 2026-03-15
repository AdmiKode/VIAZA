import type { ItineraryEventType } from '../types/itinerary';
import { supabase } from './supabaseClient';

export interface ParsedReservation {
  type: ItineraryEventType;
  title: string;
  description?: string;
  startTime?: string;   // HH:MM
  endTime?: string;     // HH:MM
  confirmationCode?: string;
  rawDate?: string;     // fecha detectada en texto libre
}

const SYSTEM_PROMPT = `Eres un asistente de viaje. El usuario te pegará texto de una confirmación de reserva (vuelo, hotel, actividad, restaurante, transporte u otro).
Extrae la información y devuelve SOLO un JSON válido con estos campos:
{
  "type": "flight" | "hotel" | "activity" | "place" | "transport" | "meal" | "free",
  "title": "string descriptivo breve (ej: Vuelo IB3456 Madrid→París)",
  "description": "string opcional con detalles clave",
  "startTime": "HH:MM o null",
  "endTime": "HH:MM o null",
  "confirmationCode": "código de reserva alfanumérico o null",
  "rawDate": "fecha en texto libre o null"
}
No incluyas nada más que el JSON.`;

export async function parseReservation(text: string): Promise<ParsedReservation> {
  const { data, error } = await supabase.functions.invoke('ai-orchestrator', {
    body: {
      task_type: 'reservation_parse',
      payload: { text: text.slice(0, 4000), system_prompt: SYSTEM_PROMPT },
    },
  });
  if (error) throw error;
  const raw: string = (data as { result?: { raw?: string } } | null)?.result?.raw ?? '{}';

  try {
    const jsonStr = raw.replace(/```json|```/g, '').trim();
    const parsed = JSON.parse(jsonStr) as ParsedReservation;
    // Validar type
    const validTypes: ItineraryEventType[] = ['flight', 'hotel', 'activity', 'place', 'transport', 'meal', 'free'];
    if (!validTypes.includes(parsed.type)) parsed.type = 'activity';
    if (!parsed.title) parsed.title = 'Reserva importada';
    return parsed;
  } catch {
    return { type: 'activity', title: 'Reserva importada', description: raw };
  }
}
