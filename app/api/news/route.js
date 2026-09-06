import { NextResponse } from 'next/server';
import { ingestSources } from '../../../lib/news-ingest';

export const dynamic = 'force-dynamic';

export async function GET() {
  const batches = await ingestSources();
  const stories = batches.flatMap((batch) => batch.items);
  const seen = new Set();
  const unique = stories.filter((story) => {
    const key = story.url || story.title.toLowerCase();
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  }).sort((a, b) => new Date(b.publishedAt) - new Date(a.publishedAt));

  return NextResponse.json({
    generatedAt: new Date().toISOString(),
    count: unique.length,
    sourceStatus: batches.map(({ source, items, error }) => ({ source, count: items.length, error })),
    stories: unique
  }, { headers: { 'Cache-Control': 's-maxage=300, stale-while-revalidate=600' } });
}
