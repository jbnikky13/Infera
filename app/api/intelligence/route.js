import { NextResponse } from 'next/server';
import { ingestSources } from '../../../lib/news-ingest';
import { analyzeStories } from '../../../lib/intelligence';

export const dynamic = 'force-dynamic';

export async function GET() {
  const batches = await ingestSources();
  const allStories = batches.flatMap((batch) => batch.items);
  const seen = new Set();
  const unique = allStories.filter((story) => {
    const key = story.url || story.title.toLowerCase();
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });

  const stories = analyzeStories(unique).sort((a, b) => (b.momentumScore || 0) - (a.momentumScore || 0));
  const highSignal = stories.filter((story) => (story.importanceScore || 0) >= 75);

  return NextResponse.json({
    generatedAt: new Date().toISOString(),
    count: stories.length,
    highSignalCount: highSignal.length,
    signals: stories.slice(0, 50),
    sourceStatus: batches.map(({ source, items, error }) => ({ source, count: items.length, error }))
  }, { headers: { 'Cache-Control': 's-maxage=300, stale-while-revalidate=600' } });
}
