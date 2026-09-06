import { NextResponse } from 'next/server'
import { getRecentStories } from '../../../lib/supabase-rest'
import { buildTrendingStories } from '../../../lib/trending'
export const dynamic='force-dynamic'
export async function GET(){try{const stories=await getRecentStories(100);const trending=buildTrendingStories(stories||[]);const top=(stories||[]).slice(0,10).map(s=>({id:s.id,title:s.title,category:s.category,summary:s.summary,signal:Math.round(Number(s.momentum_score||0)),publishedAt:s.published_at}));return NextResponse.json({generatedAt:new Date().toISOString(),headline:top[0]?.title||'Your Infera brief is waiting for fresh signals.',stories:top,trending:trending.slice(0,8)})}catch(error){return NextResponse.json({error:error.message,stories:[],trending:[]},{status:500})}}
