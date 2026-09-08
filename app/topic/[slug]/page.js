'use client'
import {useEffect,useState} from 'react'
import Link from 'next/link'
import {ArrowLeft,ArrowUpRight,Globe2,TrendingUp,BarChart3} from 'lucide-react'

function Card({s}) {
  const id = typeof s.id === 'string' ? s.id : ''
  const content = <>
    <div><span>{s.category}</span><b>{Math.round(Number(s.momentumScore ?? s.momentum_score ?? 0))}</b></div>
    <h3>{s.title}</h3>
    <p>{s.sentiment || 'neutral'} · {s.publishedAt ? new Date(s.publishedAt).toLocaleDateString() : s.published_at ? new Date(s.published_at).toLocaleDateString() : ''}</p>
    <ArrowUpRight size={15}/>
  </>
  return id ? <Link className="topicStory" href={`/story/${encodeURIComponent(id)}`}>{content}</Link> : <article className="topicStory">{content}</article>
}

export default function TopicPage({params}) {
  const [topic,setTopic]=useState(null),[error,setError]=useState(''),[loading,setLoading]=useState(true)

  useEffect(()=>{
    let active=true
    ;(async()=>{
      try {
        const resolved = await params
        const slug = resolved?.slug
        if (!slug) throw new Error('This topic does not have a valid topic address.')
        const r=await fetch(`/api/topic/${encodeURIComponent(slug)}`,{cache:'no-store'})
        const d=await r.json().catch(()=>({}))
        if(!r.ok) throw Error(d.error||'Topic unavailable')
        if(!d.topic) throw Error('No intelligence has been collected for this topic yet.')
        if(active)setTopic(d.topic)
      } catch(e) {
        if(active)setError(e.message)
      } finally {
        if(active)setLoading(false)
      }
    })()
    return()=>{active=false}
  },[params])

  if(loading)return <main className="topicPage"><div className="inner pageState">Loading topic intelligence…</div></main>
  if(error||!topic)return <main className="topicPage"><div className="inner pageState"><Link href="/" className="back"><ArrowLeft size={16}/> Back to Infera</Link><h1>Topic unavailable</h1><p>{error||'No intelligence has been collected for this topic yet.'}</p></div></main>

  return <main className="topicPage">
    <header className="topbar"><div className="nav inner"><Link className="brand" href="/"><span>I</span> INFERA</Link><div className="navSpacer"/><Link href="/" className="back"><ArrowLeft size={15}/> Feed</Link></div></header>
    <section className="topicHero inner"><div><div className="eyebrow"><Globe2 size={12}/> TOPIC INTELLIGENCE</div><h1>{topic.name}</h1><p>{topic.storyCount} stories tracked by Infera, aggregated into one evolving signal.</p></div><div className="topicSignal"><span>AVERAGE MOMENTUM</span><strong>{topic.avgMomentum}<small>/100</small></strong><div className="topicMeter"><i style={{width:`${Math.min(100,Math.max(0,Number(topic.avgMomentum)||0))}%`}}/></div><em>{topic.avgMomentum>=85?'Accelerating':topic.avgMomentum>=70?'Rising':topic.avgMomentum>=45?'Monitoring':'Quiet'}</em></div></section>
    <section className="inner topicStats"><div><BarChart3/><span>Momentum</span><b>{topic.avgMomentum}</b></div><div><TrendingUp/><span>Importance</span><b>{topic.avgImportance}</b></div><div><span>Market relevance</span><b>{topic.avgMarketRelevance}</b></div><div><span>Africa relevance</span><b>{topic.avgAfricaRelevance}</b></div></section>
    <section className="inner topicFeed"><div className="eyebrow">EVOLVING COVERAGE</div><h2>Latest intelligence</h2><div className="topicGrid">{topic.stories.map(s=><Card key={s.id||s.url||s.title} s={s}/>)}</div></section>
  </main>
}
