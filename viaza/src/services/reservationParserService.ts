import type { ItineraryEventType } from '../types/itinerary';

const OPENAI_KEY = import.meta.env.VITE_OPENAI_API_KEY as string;

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
  if (!OPENAI_KEY) throw new Error('No VITE_OPENAI_API_KEY configurada');

  const res = await fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${OPENAI_KEY}`,
    },
    body: JSON.stringify({
      model: 'gpt-4.1-mini',
      temperature: 0,
      max_tokens: 400,
      messages: [
        { role: 'system', content: SYSTEM_PROMPT },
        { role: 'user', content: text.slice(0, 4000) },
      ],
    }),
  });

  if (!res.ok) {
    const err = await res.text();
    throw new Error(`OpenAI error: ${err}`);
  }

  const data = await res.json();
  const raw: string = data.choices?.[0]?.message?.content ?? '{}';

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
