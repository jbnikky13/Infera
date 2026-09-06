import { NextResponse } from 'next/server'
import { getTopic } from '../../../../lib/supabase-rest'

export const dynamic = 'force-dynamic'

export async function GET(request, { params }) {
  try {
    const topic = await getTopic(params.slug)
    if (!topic) return NextResponse.json({ error: 'Topic not found' }, { status: 404 })
    return NextResponse.json({ topic })
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
