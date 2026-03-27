import { supabase } from './supabaseClient';
import type { TripRiskSummary } from '../types/trip';

export async function fetchTripRisk(params: {
  tripId: string;
  countryCode?: string;
  destinationCountry?: string;
}): Promise<TripRiskSummary> {
  const { tripId, countryCode, destinationCountry } = params;

  const { data, error } = await supabase.functions.invoke('risk-zones', {
    body: {
      trip_id: tripId,
      country_code: countryCode,
      destination_country: destinationCountry,
    },
  });

  if (error) throw error;

  const risk = (data as { risk?: TripRiskSummary } | null)?.risk;
  if (!risk) throw new Error('No risk payload returned');
  return risk;
}
