'use client'

import { useMemo, useState } from 'react'
import { ArrowUpRight, BarChart3, Bell, ChevronRight, Globe2, Menu, Search, TrendingUp, X } from 'lucide-react'

const stories = [
  { id: 1, category: 'Markets', tag: 'MARKET MOVING', title: 'Investors turn toward defensive assets as global markets digest fresh economic signals', source: 'Nexora Markets Desk', time: '18 min ago', impact: 'High', score: 94, summary: 'A sharp shift in positioning is putting rates, currencies and commodities back at the center of the market conversation.' },
  { id: 2, category: 'Business', tag: 'BUSINESS', title: 'African fintech enters a new expansion cycle as digital payments accelerate', source: 'Nexora Business Desk', time: '42 min ago', impact: 'High', score: 89, summary: 'Funding, customer growth and cross-border payments are creating a new competitive map for African financial technology.' },
  { id: 3, category: 'Trends', tag: 'RISING TREND', title: 'AI-native products are moving from experiments into everyday consumer workflows', source: 'Nexora Trends Lab', time: '1 hr ago', impact: 'Medium', score: 87, summary: 'The next phase of AI adoption is shifting from chat interfaces toward tools embedded directly into daily work and entertainment.' },
  { id: 4, category: 'Entertainment', tag: 'CULTURE', title: 'Streaming platforms compete for attention with global releases and local originals', source: 'Nexora Culture Desk', time: '2 hrs ago', impact: 'Medium', score: 82, summary: 'Audience behavior is becoming increasingly global while local-language productions gain international reach.' },
  { id: 5, category: 'Business', tag: 'STARTUPS', title: 'Investors are watching capital-efficient startups more closely', source: 'Nexora Venture Desk', time: '3 hrs ago', impact: 'Medium', score: 79, summary: 'The funding environment is rewarding companies that can demonstrate durable revenue and disciplined spending.' },
  { id: 6, category: 'Markets', tag: 'CRYPTO', title: 'Digital assets remain sensitive to liquidity, regulation and institutional flows', source: 'Nexora Digital Assets', time: '4 hrs ago', impact: 'High', score: 76, summary: 'Crypto markets continue to react quickly to macroeconomic changes and institutional positioning.' },
]

const movers = [
  ['AI agents', 'Technology', 96], ['African fintech', 'Business', 91], ['Gold', 'Markets', 88], ['Streaming', 'Entertainment', 84], ['Digital assets', 'Markets', 81]
]

export default function Home() {
  const [category, setCategory] = useState('All')
  const [search, setSearch] = useState('')
  const [menu, setMenu] = useState(false)
  const filtered = useMemo(() => stories.filter(s => (category === 'All' || s.category === category) && `${s.title} ${s.summary}`.toLowerCase().includes(search.toLowerCase())), [category, search])
  const categories = ['All', 'Business', 'Markets', 'Trends', 'Entertainment']

  return <main>
    <header className="topbar">
      <div className="nav inner">
        <button className="mobileMenu" onClick={() => setMenu(!menu)} aria-label="Menu">{menu ? <X/> : <Menu/>}</button>
        <a className="brand" href="#"><span>N</span> NEXORA</a>
        <nav className={menu ? 'open' : ''}>{categories.slice(1).map(c => <button key={c} onClick={() => {setCategory(c); setMenu(false)}}>{c}</button>)}<button onClick={() => {setCategory('All'); setMenu(false)}}>AFRICA</button></nav>
        <div className="navActions"><button className="iconBtn"><Bell size={18}/></button><button className="subscribe">Get the Brief</button></div>
      </div>
    </header>

    <section className="hero inner">
      <div className="heroCopy"><div className="eyebrow"><span className="liveDot"/> LIVE INTELLIGENCE</div><h1>Know what happened.<br/><em>Understand what matters.</em></h1><p>Nexora brings business, markets, trends and entertainment into one intelligent daily view — with the context behind the headline.</p><div className="heroButtons"><button className="primary" onClick={() => document.getElementById('feed').scrollIntoView({behavior:'smooth'})}>Explore today's signals <ArrowUpRight size={18}/></button><button className="secondary">How Nexora works</button></div></div>
      <div className="signalCard"><div className="cardTop"><span>GLOBAL SIGNAL</span><span>UPDATED NOW</span></div><div className="signalNumber">87<span>/100</span></div><h3>Market & business momentum</h3><div className="meter"><i style={{width:'87%'}}/></div><div className="signalRows"><div><b>Business</b><span>↑ 12%</span></div><div><b>Markets</b><span>↑ 8%</span></div><div><b>Trends</b><span>↑ 17%</span></div></div></div>
    </section>

    <section className="ticker"><div className="tickerInner"><strong>WHAT'S MOVING</strong>{movers.map(([name, type, score]) => <span key={name}><b>{name}</b> {type} <i>{score}</i></span>)}</div></section>

    <section className="inner content" id="feed">
      <div className="sectionHead"><div><div className="eyebrow">THE NEXORA FEED</div><h2>Top intelligence</h2></div><div className="search"><Search size={17}/><input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search Nexora"/></div></div>
      <div className="tabs">{categories.map(c => <button className={category===c?'active':''} key={c} onClick={() => setCategory(c)}>{c}</button>)}</div>
      <div className="grid">{filtered.map((story, i) => <article className={i===0 ? 'story featured' : 'story'} key={story.id}><div className="storyVisual"><span>{story.category}</span><div className="visualGlyph">{story.category==='Markets' ? <BarChart3/> : story.category==='Trends' ? <TrendingUp/> : story.category==='Business' ? <Globe2/> : <span>✦</span>}</div></div><div className="storyBody"><div className="storyMeta"><span>{story.tag}</span><span>{story.time}</span></div><h3>{story.title}</h3><p>{story.summary}</p><div className="storyFooter"><span>{story.source}</span><strong>{story.score} <small>signal</small></strong></div></div></article>)}</div>
      {filtered.length===0 && <div className="empty">No stories match your search.</div>}
    </section>

    <section className="why"><div className="inner whyGrid"><div><div className="eyebrow">THE NEXORA DIFFERENCE</div><h2>Headlines tell you <em>what.</em><br/>Nexora explains <em>why.</em></h2></div><div className="whyText"><p>Every major story is designed to answer the questions that matter: what happened, why it matters, what could change next, and which signals deserve attention.</p><div className="featureList"><span><b>01</b> Source-aware reporting</span><span><b>02</b> AI-assisted context</span><span><b>03</b> Momentum & trend scoring</span><span><b>04</b> Africa + global perspective</span></div></div></div></section>

    <footer><div className="inner footerGrid"><div><a className="brand" href="#"><span>N</span> NEXORA</a><p>News, signals and intelligence for a faster world.</p></div><div><b>Explore</b><a href="#feed">Business</a><a href="#feed">Markets</a><a href="#feed">Trends</a><a href="#feed">Entertainment</a></div><div><b>Platform</b><a href="#">About</a><a href="#">Methodology</a><a href="#">Contact</a><a href="#">Newsletter</a></div></div><div className="inner copyright">© 2026 Nexora. Intelligence, not noise.</div></footer>
  </main>
}
