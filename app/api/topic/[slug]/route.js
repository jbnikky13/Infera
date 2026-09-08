import { NextResponse } from 'next/server'
import { getTopic } from '../../../../lib/supabase-rest'

export const dynamic = 'force-dynamic'

export async function GET(request, { params }) {
  try {
    const resolved = await params
    const slug = resolved?.slug
    if (!slug || slug === 'undefined') {
      return NextResponse.json({ error: 'A valid topic slug is required' }, { status: 400 })
    }

    const topic = await getTopic(slug)
    if (!topic) return NextResponse.json({ error: 'Topic not found' }, { status: 404 })
    return NextResponse.json({ topic }, { headers: { 'Cache-Control': 'no-store' } })
  } catch (error) {
    console.error('Topic API error:', error)
    return NextResponse.json({ error: error?.message || 'Unable to load topic' }, { status: 500 })
  }
}
