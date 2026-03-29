-- ============================================================
-- VIAZA — Health Travel Module
-- Migración: 20260329_health_module.sql
-- ============================================================

-- 0. Función updated_at (idempotente)
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- 1. Enum para unidad de dosis
DO $$ BEGIN
  CREATE TYPE dose_unit AS ENUM ('mg', 'ml', 'tableta', 'capsula', 'gota', 'unidad', 'otro');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

-- 2. Tabla de medicamentos del viaje
CREATE TABLE IF NOT EXISTS public.health_medications (
  id             UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id        UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  trip_id        UUID REFERENCES public.trips(id) ON DELETE CASCADE,
  name           TEXT NOT NULL,
  dose_amount    NUMERIC(8,2),
  dose_unit      dose_unit DEFAULT 'tableta',
  frequency_label TEXT NOT NULL DEFAULT 'Cada 8 horas',   -- texto libre: "Cada 8 horas", "1 vez al día", etc.
  times          TEXT[] DEFAULT '{}',                       -- ISO-time strings "08:00", "14:00", "20:00"
  notes          TEXT,
  quantity_total INTEGER,                                   -- cuántas llevar
  is_critical    BOOLEAN DEFAULT FALSE,                     -- si falta este medicamento es urgente
  packed         BOOLEAN DEFAULT FALSE,                     -- está en la maleta
  created_at     TIMESTAMPTZ DEFAULT NOW(),
  updated_at     TIMESTAMPTZ DEFAULT NOW()
);

-- 3. Tabla de condiciones especiales del viajero
CREATE TABLE IF NOT EXISTS public.health_conditions (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id     UUID NOT NULL UNIQUE REFERENCES auth.users(id) ON DELETE CASCADE,
  -- condiciones booleanas
  is_pregnant          BOOLEAN DEFAULT FALSE,
  is_diabetic          BOOLEAN DEFAULT FALSE,
  is_hypertensive      BOOLEAN DEFAULT FALSE,
  has_asthma           BOOLEAN DEFAULT FALSE,
  has_severe_allergy   BOOLEAN DEFAULT FALSE,
  has_reduced_mobility BOOLEAN DEFAULT FALSE,
  is_traveling_with_baby       BOOLEAN DEFAULT FALSE,
  is_traveling_with_elderly    BOOLEAN DEFAULT FALSE,
  is_traveling_with_pet        BOOLEAN DEFAULT FALSE,
  -- texto libre
  allergy_details      TEXT,
  other_conditions     TEXT,
  dietary_restrictions TEXT,
  created_at  TIMESTAMPTZ DEFAULT NOW(),
  updated_at  TIMESTAMPTZ DEFAULT NOW()
);

-- 4. Triggers de updated_at
DROP TRIGGER IF EXISTS trg_health_medications_updated ON public.health_medications;
CREATE TRIGGER trg_health_medications_updated
  BEFORE UPDATE ON public.health_medications
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

DROP TRIGGER IF EXISTS trg_health_conditions_updated ON public.health_conditions;
CREATE TRIGGER trg_health_conditions_updated
  BEFORE UPDATE ON public.health_conditions
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- 5. RLS
ALTER TABLE public.health_medications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.health_conditions  ENABLE ROW LEVEL SECURITY;

-- Medicamentos
DROP POLICY IF EXISTS "User owns medications" ON public.health_medications;
CREATE POLICY "User owns medications" ON public.health_medications
  FOR ALL TO authenticated
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

-- Condiciones
DROP POLICY IF EXISTS "User owns conditions" ON public.health_conditions;
CREATE POLICY "User owns conditions" ON public.health_conditions
  FOR ALL TO authenticated
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

-- 6. Índices
CREATE INDEX IF NOT EXISTS idx_health_medications_user_trip ON public.health_medications(user_id, trip_id);
CREATE INDEX IF NOT EXISTS idx_health_medications_critical  ON public.health_medications(user_id, is_critical) WHERE is_critical = TRUE;
