create extension if not exists pgcrypto;

create table if not exists public.sources (
  id text primary key,
  name text not null,
  category text not null,
  url text not null,
  active boolean not null default true,
  created_at timestamptz not null default now()
);

create table if not exists public.stories (
  id uuid primary key default gen_random_uuid(),
  source_id text references public.sources(id) on delete set null,
  title text not null,
  description text,
  url text not null unique,
  category text not null,
  published_at timestamptz,
  summary text,
  why_it_matters text,
  what_to_watch text,
  trend_score numeric(5,2) not null default 0,
  momentum_score numeric(5,2) not null default 0,
  importance_score numeric(5,2) not null default 0,
  market_relevance text,
  market_relevance_score numeric(5,2) not null default 0,
  africa_relevance numeric(5,2) not null default 0,
  sentiment text,
  entities jsonb not null default '[]'::jsonb,
  ai_processed boolean not null default false,
  is_breaking boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.story_snapshots (
  id uuid primary key default gen_random_uuid(),
  story_id uuid not null references public.stories(id) on delete cascade,
  momentum_score numeric(5,2) not null default 0,
  importance_score numeric(5,2) not null default 0,
  captured_at timestamptz not null default now()
);

create table if not exists public.story_entities (
  id uuid primary key default gen_random_uuid(),
  story_id uuid not null references public.stories(id) on delete cascade,
  name text not null,
  entity_type text not null default 'topic',
  created_at timestamptz not null default now(),
  unique(story_id, name)
);

create index if not exists stories_category_idx on public.stories(category);
create index if not exists stories_published_at_idx on public.stories(published_at desc);
create index if not exists stories_trend_score_idx on public.stories(trend_score desc);
create index if not exists stories_momentum_score_idx on public.stories(momentum_score desc);
create index if not exists stories_importance_score_idx on public.stories(importance_score desc);
create index if not exists story_snapshots_story_time_idx on public.story_snapshots(story_id, captured_at desc);
create index if not exists story_entities_story_idx on public.story_entities(story_id);
create index if not exists story_entities_name_idx on public.story_entities(name);

alter table public.sources enable row level security;
alter table public.stories enable row level security;
alter table public.story_snapshots enable row level security;
alter table public.story_entities enable row level security;

drop policy if exists "public can read active sources" on public.sources;
create policy "public can read active sources" on public.sources for select using (active = true);
drop policy if exists "public can read stories" on public.stories;
create policy "public can read stories" on public.stories for select using (true);
drop policy if exists "public can read story snapshots" on public.story_snapshots;
create policy "public can read story snapshots" on public.story_snapshots for select using (true);
drop policy if exists "public can read story entities" on public.story_entities;
create policy "public can read story entities" on public.story_entities for select using (true);

insert into public.sources (id, name, category, url) values
('bbc-business','BBC Business','business','https://feeds.bbci.co.uk/news/business/rss.xml'),
('bbc-world','BBC World','business','https://feeds.bbci.co.uk/news/world/rss.xml'),
('bbc-entertainment','BBC Entertainment','entertainment','https://feeds.bbci.co.uk/news/entertainment_and_arts/rss.xml'),
('techcrunch','TechCrunch','trends','https://techcrunch.com/feed/'),
('coindesk','CoinDesk','markets','https://www.coindesk.com/arc/outboundfeeds/rss/'),
('guardian-business','The Guardian Business','business','https://www.theguardian.com/business/rss'),
('guardian-culture','The Guardian Culture','entertainment','https://www.theguardian.com/culture/rss'),
('guardian-technology','The Guardian Technology','trends','https://www.theguardian.com/uk/technology/rss'),
('guardian-africa','The Guardian Africa','africa','https://www.theguardian.com/world/africa/rss')
on conflict (id) do nothing;
