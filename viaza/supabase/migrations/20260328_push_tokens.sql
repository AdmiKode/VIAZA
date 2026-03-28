-- ============================================================
-- MIGRACIÓN: Push Tokens
-- Fecha: 2026-03-28
-- Tabla: public.push_tokens
--
-- PROPÓSITO:
--   Almacenar los FCM device tokens de cada usuario para envío
--   de notificaciones push remotas vía Firebase Cloud Messaging.
--
-- ALCANCE Y LIMITACIONES — LEER ANTES DE USAR:
--
--   [NO CONFIRMADO — PRODUCCIÓN]
--   El envío real de push remotas requiere FIREBASE_SERVICE_ACCOUNT_JSON
--   configurado como secret en Supabase (supabase secrets set ...).
--   Sin ese secret, la edge function send-push fallará en producción.
--   El código de la edge function está escrito y listo para desplegar
--   cuando Patty provea el Service Account JSON de Firebase Console.
--
--   [CONFIRMADO]
--   @capacitor/local-notifications v6 está instalado y funcional.
--   Las notificaciones locales (agendadas en el dispositivo) NO requieren
--   Firebase y funcionan en Android e iOS sin este token.
--
--   [NO CONFIRMADO]
--   @capacitor/push-notifications NO está en package.json.
--   La recepción de push remotas en foreground/background en la app
--   requiere instalar ese plugin + registrar en capacitor.config.ts.
--   Pendiente de confirmar instalación antes de usar pushNotificationService.ts.
--
-- IDEMPOTENTE: usa IF NOT EXISTS.
-- ============================================================

create table if not exists public.push_tokens (
  id           uuid        primary key default gen_random_uuid(),
  user_id      uuid        not null references auth.users(id) on delete cascade,
  -- Token FCM generado por @capacitor/push-notifications (NO CONFIRMADO instalación)
  token        text        not null,
  -- 'android' | 'ios' | 'web'
  platform     text        not null check (platform in ('android', 'ios', 'web')),
  -- Se desactiva cuando el usuario cierra sesión o el token expira
  is_active    boolean     not null default true,
  -- Permite tener múltiples dispositivos por usuario
  device_id    text,
  -- Se actualiza en cada login para mantener el token fresco
  last_seen_at timestamptz not null default now(),
  created_at   timestamptz not null default now(),
  updated_at   timestamptz not null default now(),
  -- Un usuario no puede tener el mismo token dos veces
  constraint push_tokens_user_token_unique unique (user_id, token)
);

drop trigger if exists push_tokens_updated_at on public.push_tokens;
create trigger push_tokens_updated_at
  before update on public.push_tokens
  for each row execute procedure public.set_updated_at();

alter table public.push_tokens enable row level security;

-- El usuario solo ve y gestiona sus propios tokens
drop policy if exists "push_tokens: owner full" on public.push_tokens;
create policy "push_tokens: owner full"
  on public.push_tokens
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

-- Índice para buscar tokens activos de un usuario (send-push los necesita)
create index if not exists idx_push_tokens_user_active
  on public.push_tokens(user_id, is_active)
  where is_active = true;

-- Índice para desactivar tokens por valor (al recibir error FCM de token inválido)
create index if not exists idx_push_tokens_token
  on public.push_tokens(token);

comment on table public.push_tokens is
  'Tokens FCM por dispositivo. Requiere @capacitor/push-notifications (NO CONFIRMADO) y FIREBASE_SERVICE_ACCOUNT_JSON (NO CONFIRMADO en prod).';
