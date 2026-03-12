/**
 * useSmartTripDetection.ts
 * Orquesta la detección inteligente:
 * 1. Geocodifica el destino
 * 2. Obtiene pronóstico real de Open-Meteo
 * 3. Detecta actividades con Overpass/OSM
 * 4. Actualiza el draft del store con todo
 */

import { useState, useEffect, useCallback } from 'react';
import { geocodeDestination, getWeatherForecast } from '../../../services/api/weatherService';
import { detectActivities } from '../../../services/api/attractionService';
import { useAppStore } from '../../../app/store/useAppStore';
import type { ClimateType } from '../../../types/trip';

export type DetectionStatus = 'idle' | 'geocoding' | 'weather' | 'activities' | 'done' | 'error';

export interface SmartDetectionResult {
  status: DetectionStatus;
  climate: ClimateType | null;
  avgTempC: number | null;
  minTempC: number | null;
  maxTempC: number | null;
  precipMm: number | null;
  weatherDescription: string | null;
  currency: string;
  language: string;
  countryCode: string;
  activities: string[];
  error: string | null;
}

export function useSmartTripDetection() {
  const draft = useAppStore((s) => s.onboardingDraft);
  const setDraft = useAppStore((s) => s.setOnboardingDraft);

  const [result, setResult] = useState<SmartDetectionResult>({
    status: 'idle',
    climate: draft.inferredClimate,
    avgTempC: null,
    minTempC: null,
    maxTempC: null,
    precipMm: null,
    weatherDescription: null,
    currency: draft.inferredCurrency,
    language: draft.inferredLanguage,
    countryCode: draft.inferredCountryCode,
    activities: [],
    error: null,
  });

  const run = useCallback(async () => {
    if (!draft.destination.trim()) return;

    setResult((r) => ({ ...r, status: 'geocoding', error: null }));

    // 1. Geocodificar
    const geo = await geocodeDestination(draft.destination);
    if (!geo) {
      setResult((r) => ({ ...r, status: 'error', error: 'No se pudo ubicar el destino.' }));
      return;
    }

    // 2. Pronóstico del clima
    setResult((r) => ({ ...r, status: 'weather' }));
    const forecast = await getWeatherForecast(
      draft.destination,
      draft.startDate || undefined,
      draft.endDate || undefined
    );

    const climate: ClimateType = forecast?.climate ?? draft.inferredClimate ?? 'mild';
    setResult((r) => ({
      ...r,
      climate,
      avgTempC: forecast?.avgTempC ?? null,
      minTempC: forecast?.minTempC ?? null,
      maxTempC: forecast?.maxTempC ?? null,
      precipMm: forecast?.precipitationMm ?? null,
      weatherDescription: forecast?.description ?? null,
    }));

    // Actualizar draft con clima real
    setDraft({ inferredClimate: climate });

    // 3. Detección de actividades (OSM)
    setResult((r) => ({ ...r, status: 'activities' }));
    const activities = await detectActivities({ latitude: geo.latitude, longitude: geo.longitude });

    setResult((r) => ({
      ...r,
      status: 'done',
      activities,
    }));

    // Guardar activities en draft para que las use el packingGenerator
    setDraft({ activities: activities as string[] });
  }, [draft.destination, draft.startDate, draft.endDate, draft.inferredClimate, draft.inferredCurrency, draft.inferredLanguage, draft.inferredCountryCode, setDraft]);

  useEffect(() => {
    run();
    // Solo re-ejecutar cuando cambie el destino o las fechas
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [draft.destination, draft.startDate, draft.endDate]);

  return { result, retry: run };
}
