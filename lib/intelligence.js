const STOP_WORDS = new Set(['the','and','for','with','that','this','from','into','after','over','will','has','have','are','was','were','its','their','about','says','said','new','how','why','what','when','where','which','than','more','less','amid','today']);

function words(text = '') {
  return (text.toLowerCase().match(/[a-z][a-z0-9-]{2,}/g) || []).filter((w) => !STOP_WORDS.has(w));
}

function clamp(n, min = 0, max = 100) {
  return Math.max(min, Math.min(max, Math.round(n)));
}

export function analyzeStory(story, corpus = []) {
  const text = `${story.title || ''} ${story.description || ''}`;
  const tokens = words(text);
  const tokenSet = new Set(tokens);
  const duplicateCount = corpus.filter((item) => words(item.title || '').some((w) => tokenSet.has(w))).length;
  const marketTerms = ['stock','shares','market','bitcoin','crypto','oil','gold','forex','rate','inflation','earnings','revenue','profit','ipo','acquisition','merger','bank','dollar'];
  const urgencyTerms = ['breaking','surge','plunge','crash','launch','acquire','acquisition','ban','approval','deal','raises','funding'];
  const africaTerms = ['africa','nigeria','ghana','kenya','south africa','egypt','rwanda','lagos','abuja'];
  const marketHits = marketTerms.filter((term) => text.toLowerCase().includes(term)).length;
  const urgencyHits = urgencyTerms.filter((term) => text.toLowerCase().includes(term)).length;
  const africaHits = africaTerms.filter((term) => text.toLowerCase().includes(term)).length;
  const recency = story.publishedAt ? Math.max(0, 24 - (Date.now() - new Date(story.publishedAt).getTime()) / 3600000) : 0;
  const momentum = clamp(45 + recency * 1.5 + marketHits * 4 + urgencyHits * 6 + Math.min(duplicateCount, 6) * 4);
  const marketRelevance = clamp(marketHits * 16 + urgencyHits * 5);
  const importance = clamp(35 + marketHits * 8 + urgencyHits * 7 + Math.min(duplicateCount, 5) * 5);
  const africaRelevance = clamp(africaHits * 22);
  const sentiment = urgencyTerms.some((t) => ['plunge','crash','ban'].includes(t) && text.toLowerCase().includes(t)) ? 'negative' : marketHits || urgencyHits ? 'mixed' : 'neutral';

  return {
    ...story,
    trendScore: story.trendScore ?? momentum,
    momentumScore: momentum,
    importanceScore: importance,
    marketRelevance,
    africaRelevance,
    sentiment,
    tag: momentum >= 85 ? 'HIGH SIGNAL' : momentum >= 70 ? 'RISING' : 'MONITOR',
    whyItMatters: marketRelevance >= 50
      ? 'This story has meaningful business or market signals. Watch price reactions, company disclosures and follow-on developments.'
      : africaRelevance >= 40
        ? 'This development has relevance to African markets, businesses or consumers. Watch for regional spillover and local responses.'
        : 'The significance is still developing. Watch whether coverage expands, new facts emerge or the story begins affecting businesses, markets or culture.'
  };
}

export function analyzeStories(stories) {
  return stories.map((story) => analyzeStory(story, stories));
}
