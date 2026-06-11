-- Run this once in the Supabase SQL Editor for your project
-- (Project: qtppvcwacclemwjbceub — same one used by the Employee Portal)

create table if not exists recipes (
  id uuid primary key default gen_random_uuid(),
  drink text not null,
  category text not null default '',
  recipe text not null default '',
  updated_at timestamptz not null default now()
);

alter table recipes enable row level security;

-- Anyone (anon key) can read recipes — this is what the store iPads use.
create policy "Public read access" on recipes
  for select using (true);

-- No anon insert/update/delete — all writes go through the admin API route,
-- which uses the service role key (bypasses RLS).
