import { NextResponse } from 'next/server';
import { ingestSources } from '../../../lib/news-ingest';
import { analyzeStories } from '../../../lib/intelligence';
import { enrichStories } from '../../../lib/gemini';
import { persistStories } from '../../../lib/supabase-rest';

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

  const scored = analyzeStories(unique).sort((a, b) => (b.momentumScore || 0) - (a.momentumScore || 0));
  const stories = await enrichStories(scored);
  const highSignal = stories.filter((story) => (story.importanceScore || 0) >= 75);
  let persistence = { persisted: false, reason: 'Not attempted', count: 0 };
  try { persistence = await persistStories(stories, batches.map((batch) => batch.source)); }
  catch (error) { persistence = { persisted: false, reason: error.message, count: 0 }; }

  return NextResponse.json({
    generatedAt: new Date().toISOString(), count: stories.length, highSignalCount: highSignal.length,
    aiConfigured: Boolean(process.env.GEMINI_API_KEY), persistence, signals: stories.slice(0, 50),
    sourceStatus: batches.map(({ source, items, error }) => ({ source, count: items.length, error }))
  }, { headers: { 'Cache-Control': 's-maxage=300, stale-while-revalidate=600' } });
}
