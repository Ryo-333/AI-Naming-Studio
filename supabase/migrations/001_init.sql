-- AI Naming Studio — initial cloud-sync schema
-- Run this in: Supabase Dashboard → SQL Editor → New query → paste → Run

create table if not exists public.user_collections (
  id text not null,                                   -- client-generated collection id ("default" or uuid)
  user_id uuid not null references auth.users (id) on delete cascade,
  title text not null,
  names jsonb not null default '[]'::jsonb,           -- full SavedName payloads
  updated_at timestamptz not null default now(),
  primary key (user_id, id)
);

alter table public.user_collections enable row level security;

create policy "own rows: select" on public.user_collections
  for select using (auth.uid() = user_id);
create policy "own rows: insert" on public.user_collections
  for insert with check (auth.uid() = user_id);
create policy "own rows: update" on public.user_collections
  for update using (auth.uid() = user_id) with check (auth.uid() = user_id);
create policy "own rows: delete" on public.user_collections
  for delete using (auth.uid() = user_id);

create index if not exists user_collections_user_idx on public.user_collections (user_id);
