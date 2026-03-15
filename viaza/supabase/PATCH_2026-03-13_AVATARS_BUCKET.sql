-- VIAZA — Storage bucket para fotos de perfil (Emergency QR)
-- Ejecutar en Supabase SQL Editor.
-- Crea bucket `avatars` (público) y políticas mínimas para que cada usuario
-- pueda subir/editar/borrar SOLO en su carpeta `{auth.uid()}/...`.

begin;

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'avatars',
  'avatars',
  true,
  5242880,
  array['image/jpeg','image/png','image/webp','image/heic']
) on conflict (id) do nothing;

-- Políticas (si ya existen, ignorar)
do $$
begin
  execute $p$
    create policy "avatars: read public"
    on storage.objects for select
    using (bucket_id = 'avatars');
  $p$;
exception when duplicate_object then null;
end $$;

do $$
begin
  execute $p$
    create policy "avatars: upload own"
    on storage.objects for insert
    to authenticated
    with check (
      bucket_id = 'avatars'
      and (storage.foldername(name))[1] = auth.uid()::text
    );
  $p$;
exception when duplicate_object then null;
end $$;

do $$
begin
  execute $p$
    create policy "avatars: update own"
    on storage.objects for update
    to authenticated
    using (
      bucket_id = 'avatars'
      and (storage.foldername(name))[1] = auth.uid()::text
    )
    with check (
      bucket_id = 'avatars'
      and (storage.foldername(name))[1] = auth.uid()::text
    );
  $p$;
exception when duplicate_object then null;
end $$;

do $$
begin
  execute $p$
    create policy "avatars: delete own"
    on storage.objects for delete
    to authenticated
    using (
      bucket_id = 'avatars'
      and (storage.foldername(name))[1] = auth.uid()::text
    );
  $p$;
exception when duplicate_object then null;
end $$;

commit;

