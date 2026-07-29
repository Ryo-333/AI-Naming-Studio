-- AI Naming Studio — billing entitlements
-- Run in: Supabase Dashboard → SQL Editor → New query → paste → Run

create table if not exists public.entitlements (
  user_id uuid primary key references auth.users (id) on delete cascade,
  plan text not null default 'free',              -- free | premium | lifetime
  credits int not null default 0,
  stripe_customer_id text,
  current_period_end timestamptz,
  updated_at timestamptz not null default now()
);

alter table public.entitlements enable row level security;

-- Users may read their own entitlements; all writes happen server-side via
-- the service-role key (webhook), which bypasses RLS.
create policy "own row: select" on public.entitlements
  for select using (auth.uid() = user_id);

create index if not exists entitlements_customer_idx on public.entitlements (stripe_customer_id);
