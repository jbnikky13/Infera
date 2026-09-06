# Nexora

**News, signals and intelligence for a faster world.**

Nexora is an AI-powered news intelligence platform covering **business, markets, trends, entertainment and Africa**. It is designed to explain not only what happened, but why it matters and what to watch next.

## Current build

- Responsive editorial homepage
- Business, Markets, Trends and Entertainment sections
- Search and category filtering
- What's Moving trend strip
- Global signal dashboard
- Live RSS ingestion endpoint at `/api/news`
- Curated source registry with source attribution
- Duplicate filtering
- Supabase schema for persistent stories, sources, entities and trend scores
- Scheduled GitHub Actions ingestion workflow
- Environment template for Supabase and Gemini

## Architecture

```text
Trusted RSS sources
       ↓
Nexora ingestion engine
       ↓
Normalize + deduplicate
       ↓
Supabase story store
       ↓
Gemini analysis layer
       ↓
Trend / momentum scoring
       ↓
Nexora web feed
       ↓
Telegram / X / email alerts
```

## Run locally

```bash
npm install
npm run dev
```

Open `http://localhost:3000`.

## Environment

Copy `.env.example` to `.env.local` and configure Supabase and Gemini when those integrations are enabled.

## Supabase

Run `supabase/schema.sql` in the Supabase SQL editor. The schema creates source and story tables, indexes and public read policies. Keep service-role credentials server-side only.

## Roadmap

1. Persist ingested stories automatically in Supabase.
2. Add Gemini-powered summaries and "Why it matters" analysis.
3. Add entity extraction and company/topic pages.
4. Add market data and economic events.
5. Improve trend/momentum scoring using story volume, recency and source diversity.
6. Add breaking-news detection and alerts.
7. Add daily email, Telegram and X distribution.
8. Add authentication, saved topics and personalized intelligence feeds.
9. Add admin/source monitoring dashboard.
10. Add analytics, monetization and a public intelligence API.
