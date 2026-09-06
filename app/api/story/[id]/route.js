import { NextResponse } from 'next/server'
import { getStory } from '../../../../lib/supabase-rest'

export const dynamic = 'force-dynamic'

export async function GET(request, context) {
  try {
    const params = await context.params
    const id = params?.id
    if (!id) return NextResponse.json({ error: 'Story id is required' }, { status: 400 })

    const story = await getStory(id)
    if (!story) return NextResponse.json({ error: 'Story not found' }, { status: 404 })

    return NextResponse.json({ story }, {
      headers: { 'Cache-Control': 'no-store' },
    })
  } catch (error) {
    return NextResponse.json({ error: error.message || 'Unable to load story' }, { status: 500 })
  }
}
