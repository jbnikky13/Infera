import { NextResponse } from 'next/server'
import { getStory } from '../../../../lib/supabase-rest'

export const dynamic = 'force-dynamic'

export async function GET(request, { params }) {
  try {
    const story = await getStory(params.id)
    if (!story) return NextResponse.json({ error: 'Story not found' }, { status: 404 })
    return NextResponse.json({ story })
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
