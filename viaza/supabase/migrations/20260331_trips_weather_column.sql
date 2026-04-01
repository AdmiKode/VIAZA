-- Migration: añadir columna weather_forecast_daily a trips
-- Necesaria para que la edge function weather-cache pueda persistir el pronóstico.
-- Si la columna ya existe (re-run seguro), no falla.

ALTER TABLE public.trips
  ADD COLUMN IF NOT EXISTS weather_forecast_daily jsonb;

COMMENT ON COLUMN public.trips.weather_forecast_daily IS
  'Pronóstico meteorológico por día del viaje: array de {date, morning, afternoon, night} con temp_avg y rain_prob_max. Guardado por la edge function weather-cache.';
