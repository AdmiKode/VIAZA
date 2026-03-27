-- VIAZA: Emergency QR access logs
-- Date: 2026-03-25

create table if not exists public.emergency_qr_access_logs (
  id                  bigserial   primary key,
  emergency_profile_id uuid       not null references public.emergency_profiles(id) on delete cascade,
  access_type         text        not null default 'public_view' check (access_type in ('public_view')),
  source              text,
  client_info         text,
  token_fingerprint   text        not null,
  accessed_at         timestamptz not null default now(),
  created_at          timestamptz not null default now()
);

create index if not exists emergency_qr_access_logs_profile_idx
  on public.emergency_qr_access_logs(emergency_profile_id);

create index if not exists emergency_qr_access_logs_accessed_at_idx
  on public.emergency_qr_access_logs(accessed_at desc);

alter table public.emergency_qr_access_logs enable row level security;

-- Solo el dueño del emergency profile puede leer sus logs.
create policy "emergency_qr_access_logs: owner reads"
  on public.emergency_qr_access_logs for select
  using (
    exists (
      select 1
      from public.emergency_profiles ep
      where ep.id = emergency_qr_access_logs.emergency_profile_id
        and ep.user_id = auth.uid()
    )
  );

-- Inserción vía función SECURITY DEFINER.
create or replace function public.log_emergency_qr_access(
  token text,
  source text default null,
  client_info text default null
)
returns boolean
language plpgsql
security definer
set search_path = public
as $$
declare
  v_profile_id uuid;
begin
  if token is null or length(trim(token)) = 0 then
    return false;
  end if;

  select ep.id
    into v_profile_id
  from public.emergency_profiles ep
  where ep.public_token = token
    and ep.qr_enabled = true
    and ep.consent_public_display = true
  limit 1;

  if v_profile_id is null then
    return false;
  end if;

  insert into public.emergency_qr_access_logs (
    emergency_profile_id,
    access_type,
    source,
    client_info,
    token_fingerprint
  )
  values (
    v_profile_id,
    'public_view',
    nullif(left(coalesce(source, ''), 120), ''),
    nullif(left(coalesce(client_info, ''), 500), ''),
    encode(digest(token, 'sha256'), 'hex')
  );

  return true;
exception
  when others then
    return false;
end;
$$;

revoke all on function public.log_emergency_qr_access(text, text, text) from public;
grant execute on function public.log_emergency_qr_access(text, text, text) to anon, authenticated;
