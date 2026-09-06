export function buildTrendingStories(stories = []) {
  const now = Date.now()
  const buckets = new Map()
  for (const story of stories) {
    const title = String(story.title || '').trim()
    if (!title) continue
    const tokens = title.toLowerCase().replace(/[^a-z0-9\s-]/g, ' ').split(/\s+/).filter(w => w.length > 3)
    const score = Number(story.momentumScore || story.trendScore || 0)
    const recency = Math.max(0, 1 - (now - new Date(story.publishedAt || now).getTime()) / 172800000)
    for (const token of tokens) {
      if (['about','after','before','being','could','from','have','into','more','over','that','their','this','what','will','with'].includes(token)) continue
      const current = buckets.get(token) || { topic: token, mentions: 0, score: 0, recency: 0, categories: new Set(), stories: [] }
      current.mentions += 1
      current.score += score
      current.recency += recency
      if (story.category) current.categories.add(story.category)
      if (current.stories.length < 5) current.stories.push(story)
      buckets.set(token, current)
    }
  }
  return [...buckets.values()].map(item => ({ topic: item.topic, mentions: item.mentions, momentum: Math.min(100, Math.round(item.score / Math.max(1, item.mentions) * 0.7 + item.recency * 10)), categories: [...item.categories], stories: item.stories })).filter(item => item.mentions >= 2).sort((a,b) => b.momentum - a.momentum || b.mentions - a.mentions).slice(0, 20)
}
