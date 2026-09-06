import { NextResponse } from 'next/server'
import { buildTrendingStories } from '../../../lib/trending'
import { getRecentStories } from '../../../lib/supabase-rest'

export const dynamic = 'force-dynamic'

export async function GET() {
  try {
    const stories = await getRecentStories(200)
    const trending = buildTrendingStories(stories || [])
    return NextResponse.json({ updatedAt: new Date().toISOString(), topics: trending })
  } catch (error) {
    return NextResponse.json({ error: error.message, topics: [] }, { status: 500 })
  }
}
