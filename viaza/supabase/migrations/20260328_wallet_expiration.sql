-- ============================================================
-- MIGRACIÓN: Wallet Expiration + OCR Fields
-- Fecha: 2026-03-28
-- Tabla base: public.wallet_docs (schema_viaza.sql línea 1753)
--
-- CAMPOS AÑADIDOS:
--   expiration_date   → fecha de vencimiento del documento (DATE)
--   ocr_name          → nombre extraído por OCR del documento
--   ocr_doc_number    → número de documento (pasaporte, DNI, visa...)
--   is_reported_lost  → flag para documentos reportados como perdidos
--   lost_reported_at  → timestamp del reporte de pérdida
--
-- ALCANCE:
--   - La extracción de los campos OCR se hace en la edge function ai-orchestrator
--     ya existente (boarding_pass_ocr / document_ocr).
--   - ExpirationBadge en UI: rojo (<7 días), amarillo (<30 días), verde (>30 días).
--   - is_reported_lost no bloquea el acceso al documento — solo es UI flag.
--
-- IDEMPOTENTE: todos los ALTER usan IF NOT EXISTS.
-- ============================================================

alter table public.wallet_docs
  add column if not exists expiration_date   date,
  add column if not exists ocr_name          text,
  add column if not exists ocr_doc_number    text,
  add column if not exists is_reported_lost  boolean      not null default false,
  add column if not exists lost_reported_at  timestamptz;

-- Índice para alertas de vencimiento próximo (útil en dashboard future)
create index if not exists idx_wallet_docs_expiration_date
  on public.wallet_docs(user_id, expiration_date)
  where expiration_date is not null;

-- Índice para documentos reportados perdidos
create index if not exists idx_wallet_docs_reported_lost
  on public.wallet_docs(user_id, is_reported_lost)
  where is_reported_lost = true;

-- Comentario en columna
comment on column public.wallet_docs.expiration_date is
  'Fecha de vencimiento del documento (pasaporte, visa, seguro...). NULL = no aplica.';
comment on column public.wallet_docs.is_reported_lost is
  'Flag UI solamente. No bloquea acceso al doc. Reporte formal va fuera de la app.';
