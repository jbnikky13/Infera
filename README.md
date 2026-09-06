# Infera

**News, signals and intelligence for a faster world.**

Infera is an AI-assisted news intelligence platform covering **business, markets, trends, entertainment and Africa**. It is designed to explain not only what happened, but why it matters and what to watch next.

## Current build

- Responsive editorial homepage
- Business, Markets, Trends, Entertainment and Africa coverage
- Search and category filtering
- Story Intelligence briefs
- Topic Intelligence pages
- Trending Radar with momentum states
- Daily Intelligence Brief
- Device-local personalized intelligence preferences
- Live RSS ingestion and source attribution
- Duplicate filtering
- Gemini-powered summaries/context when configured
- Supabase persistence for stories, entities and signal snapshots
- Scheduled ingestion every 15 minutes through GitHub Actions
- Production health endpoint at `/api/health`
- Automated production build CI
- Security response headers
- Sitemap and robots metadata

## Architecture

```text
Trusted RSS sources
       ↓
Infera ingestion engine
       ↓
Normalize + deduplicate
       ↓
Signal scoring
       ↓
Gemini analysis (optional)
       ↓
Supabase story store + snapshots
       ↓
Trending / momentum intelligence
       ↓
Infera web feed + Topic Intelligence
       ↓
Personalized Brief / alerts layer
```

## Run locally

```bash
npm install
npm run dev
```

Open `http://localhost:3000`.

## Environment

Copy `.env.example` to `.env.local` and configure Supabase and Gemini. Never expose `SUPABASE_SERVICE_ROLE_KEY` to the browser.

For scheduled ingestion, add the deployed site URL as the GitHub Actions repository secret **`INFERA_URL`**.

## Supabase

Run `supabase/schema.sql` in the Supabase SQL editor. The schema creates source, story, snapshot and entity tables, indexes and public read policies. Keep service-role credentials server-side only.

## Production checklist

- [x] News ingestion and persistence path
- [x] AI enrichment fallback when Gemini is unavailable
- [x] Trend/momentum intelligence
- [x] Story and topic discovery
- [x] Scheduled ingestion workflow
- [x] Health endpoint
- [x] Production build CI
- [x] Security headers
- [x] SEO sitemap/robots metadata
- [ ] Set `INFERA_URL` GitHub Actions secret
- [ ] Set `NEXT_PUBLIC_SITE_URL` to the actual production domain
- [ ] Run the first scheduled/manual ingestion and confirm Supabase writes
- [ ] Configure real account authentication and server-side alert subscriptions before public launch

## Roadmap after production baseline

1. Account authentication and cross-device preferences.
2. Email/Telegram breaking and rising alerts.
3. Admin/source monitoring dashboard.
4. Market data and economic calendar integrations.
5. Analytics, monetization and public intelligence API.
