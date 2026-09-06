-- Infera production intelligence compatibility migration.
-- Run this once in the Supabase SQL editor after schema.sql.

alter table public.stories
  add column if not exists what_to_watch text,
  add column if not exists importance_score numeric(5,2) not null default 0,
  add column if not exists momentum_score numeric(5,2) not null default 0,
  add column if not exists market_relevance_score numeric(5,2) not null default 0,
  add column if not exists africa_relevance numeric(5,2) not null default 0,
  add column if not exists ai_processed boolean not null default false,
  add column if not exists is_breaking boolean not null default false;

create table if not exists public.story_snapshots (
  id uuid primary key default gen_random_uuid(),
  story_id uuid not null references public.stories(id) on delete cascade,
  momentum_score numeric(5,2) not null default 0,
  importance_score numeric(5,2) not null default 0,
  captured_at timestamptz not null default now()
);

create index if not exists story_snapshots_story_time_idx on public.story_snapshots(story_id, captured_at desc);

create table if not exists public.story_entities (
  id uuid primary key default gen_random_uuid(),
  story_id uuid not null references public.stories(id) on delete cascade,
  name text not null,
  entity_type text not null default 'topic',
  created_at timestamptz not null default now(),
  unique(story_id, name)
);

create index if not exists story_entities_story_idx on public.story_entities(story_id);
create index if not exists story_entities_name_idx on public.story_entities(name);

alter table public.story_snapshots enable row level security;
alter table public.story_entities enable row level security;

drop policy if exists "public can read story snapshots" on public.story_snapshots;
create policy "public can read story snapshots" on public.story_snapshots for select using (true);
drop policy if exists "public can read story entities" on public.story_entities;
create policy "public can read story entities" on public.story_entities for select using (true);

create index if not exists stories_momentum_score_idx on public.stories(momentum_score desc);
create index if not exists stories_importance_score_idx on public.stories(importance_score desc);
