-- VIAZA — Patch SQL (2026-03-13)
-- Objetivo:
-- 1) Asegurar que si el webhook inserta un pago ya en estado `completed`,
--    el trigger actualice `profiles.plan` y `profiles.plan_expires_at` en INSERT.
-- 2) Re-crear triggers para evitar duplicados.
-- 3) Re-crear la vista `user_subscription` (usada por Edge `requirePremium`).
--
-- Nota: Este patch asume que ya existe el schema VIAZA (tipos + tablas profiles/payments).

begin;

-- Safety: si faltan columnas, crear (no falla si ya existen)
alter table public.profiles
  add column if not exists plan subscription_plan not null default 'free';

alter table public.profiles
  add column if not exists plan_expires_at timestamptz;

-- Re-crear función trigger (INSERT + UPDATE + refunds)
create or replace function public.handle_payment_completed()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  -- Caso INSERT: Stripe puede insertar directamente "completed"
  if (tg_op = 'INSERT') then
    if new.status = 'completed' then
      update public.profiles
      set
        plan = new.plan_purchased,
        plan_expires_at = now() + (new.plan_duration_days || ' days')::interval,
        updated_at = now()
      where id = new.user_id;
    end if;
    return new;
  end if;

  -- Caso UPDATE: transición a completed
  if new.status = 'completed' and old.status is distinct from 'completed' then
    update public.profiles
    set
      plan = new.plan_purchased,
      plan_expires_at = now() + (new.plan_duration_days || ' days')::interval,
      updated_at = now()
    where id = new.user_id;
  end if;

  -- Caso refund: volver a free
  if new.status = 'refunded' and old.status = 'completed' then
    update public.profiles
    set
      plan = 'free',
      plan_expires_at = null,
      updated_at = now()
    where id = new.user_id;
  end if;

  return new;
end;
$$;

-- Re-crear triggers
drop trigger if exists on_payment_status_change on public.payments;
drop trigger if exists on_payment_insert on public.payments;

create trigger on_payment_status_change
  after update of status on public.payments
  for each row execute procedure public.handle_payment_completed();

create trigger on_payment_insert
  after insert on public.payments
  for each row execute procedure public.handle_payment_completed();

-- Vista para gating premium (Edge)
create or replace view public.user_subscription as
select
  p.id                                          as user_id,
  p.plan,
  p.plan_expires_at,
  case
    when p.plan = 'free'                         then false
    when p.plan_expires_at is null               then true
    when p.plan_expires_at > now()               then true
    else false
  end                                            as is_active_premium,
  case
    when p.plan_expires_at is not null
     and p.plan_expires_at > now()
    then extract(day from (p.plan_expires_at - now()))::int
    else null
  end                                            as days_remaining
from public.profiles p;

commit;

