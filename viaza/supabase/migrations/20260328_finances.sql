-- migrations/20260328_finances.sql
-- Budget MVP: presupuesto por categoría + gastos reales del viaje
-- Fase 1 Sprint 1 — VIAZA
-- ============================================================
-- NOTAS:
--   - split_bill_sessions y split_bill_expenses YA EXISTEN en schema_viaza.sql
--   - Este archivo SOLO crea trip_budget y trip_expenses (nuevas)
--   - Categorías fijas confirmadas en plan: transport, accommodation, food,
--     activities, shopping, health, emergency, other
-- ============================================================

-- ─── 0. FUNCIÓN HELPER (idempotente) ─────────────────────────────────────────

CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER LANGUAGE plpgsql AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

-- ─── 1. PRESUPUESTO POR CATEGORÍA ────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS public.trip_budget (
  id               UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id          UUID REFERENCES auth.users NOT NULL,
  trip_id          UUID REFERENCES public.trips(id) ON DELETE CASCADE NOT NULL,
  category         TEXT NOT NULL CHECK (category IN (
                     'transport', 'accommodation', 'food', 'activities',
                     'shopping', 'health', 'emergency', 'other'
                   )),
  planned_amount   NUMERIC(12, 2) NOT NULL DEFAULT 0,
  currency_code    TEXT NOT NULL DEFAULT 'USD',
  notes            TEXT,
  created_at       TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at       TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (trip_id, category)
);

ALTER TABLE public.trip_budget ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "trip_budget: owner full" ON public.trip_budget;
CREATE POLICY "trip_budget: owner full" ON public.trip_budget
  USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

CREATE INDEX IF NOT EXISTS idx_trip_budget_trip
  ON public.trip_budget (trip_id);

DROP TRIGGER IF EXISTS trip_budget_updated_at ON public.trip_budget;
CREATE TRIGGER trip_budget_updated_at
  BEFORE UPDATE ON public.trip_budget
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- ─── 2. GASTOS REALES DEL VIAJE ──────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS public.trip_expenses (
  id               UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id          UUID REFERENCES auth.users NOT NULL,
  trip_id          UUID REFERENCES public.trips(id) ON DELETE CASCADE NOT NULL,
  category         TEXT NOT NULL DEFAULT 'other' CHECK (category IN (
                     'transport', 'accommodation', 'food', 'activities',
                     'shopping', 'health', 'emergency', 'other'
                   )),
  amount           NUMERIC(12, 2) NOT NULL,
  currency_code    TEXT NOT NULL DEFAULT 'USD',
  amount_local     NUMERIC(12, 2),        -- monto en moneda local del destino
  exchange_rate    NUMERIC(12, 6),        -- tasa usada para la conversión
  description      TEXT,
  paid_by          TEXT,                  -- nombre del pagador (para referencia)
  split_session_id UUID REFERENCES public.split_bill_sessions(id) ON DELETE SET NULL,
  expense_date     DATE NOT NULL DEFAULT CURRENT_DATE,
  receipt_url      TEXT,                  -- foto del recibo (Supabase Storage)
  created_at       TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.trip_expenses ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "trip_expenses: owner full" ON public.trip_expenses;
CREATE POLICY "trip_expenses: owner full" ON public.trip_expenses
  USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

CREATE INDEX IF NOT EXISTS idx_trip_expenses_trip
  ON public.trip_expenses (trip_id, expense_date DESC);

CREATE INDEX IF NOT EXISTS idx_trip_expenses_category
  ON public.trip_expenses (trip_id, category);
