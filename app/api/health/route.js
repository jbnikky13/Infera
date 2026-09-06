import { NextResponse } from 'next/server'
import { getRecentStories } from '../../../lib/supabase-rest'
import { NEWS_SOURCES } from '../../../lib/news-sources'

export const dynamic = 'force-dynamic'

export async function GET() {
  const started = Date.now()
  const checks = { database: false, sourcesConfigured: NEWS_SOURCES.length > 0 }
  try {
    const stories = await getRecentStories(1)
    checks.database = Array.isArray(stories)
    return NextResponse.json({ ok: checks.database && checks.sourcesConfigured, checks, sources: NEWS_SOURCES.length, latencyMs: Date.now() - started, timestamp: new Date().toISOString() }, { status: checks.database ? 200 : 503 })
  } catch (error) {
    return NextResponse.json({ ok: false, checks, error: error.message, latencyMs: Date.now() - started, timestamp: new Date().toISOString() }, { status: 503 })
  }
}
