-- Rode este arquivo uma vez no SQL Editor do Supabase.
-- Ele pode ser executado de novo sem problemas (as políticas são recriadas).

-- 1. Bucket público para as imagens dos cartões.
--    Leitura é pública pela URL; escrita/remoção só na pasta do próprio usuário.
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'card-images',
  'card-images',
  true,
  5242880,
  array['image/webp', 'image/jpeg', 'image/png', 'image/gif', 'image/avif']
)
on conflict (id) do update set
  public = excluded.public,
  file_size_limit = excluded.file_size_limit,
  allowed_mime_types = excluded.allowed_mime_types;

drop policy if exists "card-images: dono lê" on storage.objects;
create policy "card-images: dono lê"
  on storage.objects for select to authenticated
  using (
    bucket_id = 'card-images'
    and (storage.foldername(name))[1] = (select auth.uid())::text
  );

drop policy if exists "card-images: dono envia" on storage.objects;
create policy "card-images: dono envia"
  on storage.objects for insert to authenticated
  with check (
    bucket_id = 'card-images'
    and (storage.foldername(name))[1] = (select auth.uid())::text
  );

drop policy if exists "card-images: dono apaga" on storage.objects;
create policy "card-images: dono apaga"
  on storage.objects for delete to authenticated
  using (
    bucket_id = 'card-images'
    and (storage.foldername(name))[1] = (select auth.uid())::text
  );

-- 2. Compartilhamento: qualquer usuário logado pode LER baralhos marcados como
--    públicos e os cartões deles. Escrita continua restrita ao dono.
--    O app sempre filtra por user_id nas listagens, então esses baralhos
--    não aparecem na tela inicial de outras pessoas.
drop policy if exists "decks: leitura de públicos" on public.decks;
create policy "decks: leitura de públicos"
  on public.decks for select to authenticated
  using (is_public = true);

drop policy if exists "cards: leitura de públicos" on public.cards;
create policy "cards: leitura de públicos"
  on public.cards for select to authenticated
  using (
    exists (
      select 1 from public.decks d
      where d.id = cards.deck_id and d.is_public = true
    )
  );
