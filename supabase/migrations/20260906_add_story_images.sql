alter table if exists public.stories
  add column if not exists image_url text;

create index if not exists stories_published_at_idx on public.stories (published_at desc);
