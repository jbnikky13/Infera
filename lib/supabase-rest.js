const baseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

function configured() {
  return Boolean(baseUrl && serviceKey);
}

function enc(value) {
  return encodeURIComponent(String(value));
}

async function request(path, options = {}) {
  if (!configured()) return null;

  const response = await fetch(`${baseUrl}/rest/v1/${path}`, {
    ...options,
    headers: {
      apikey: serviceKey,
      Authorization: `Bearer ${serviceKey}`,
      'Content-Type': 'application/json',
      Prefer: 'return=representation,resolution=merge-duplicates',
      ...(options.headers || {}),
    },
    cache: 'no-store',
  });

  if (!response.ok) {
    throw new Error(`Supabase ${response.status}: ${await response.text()}`);
  }

  return response.status === 204 ? null : response.json();
}

export async function persistStories(stories, sources) {
  if (!configured()) {
    return {
      persisted: false,
      reason: 'Supabase environment variables are not configured',
      count: 0,
    };
  }

  if (!stories.length) return { persisted: true, count: 0 };

  // The previous implementation made several Supabase HTTP requests per story.
  // With ~200 stories that could become hundreds of sequential requests and hit
  // the production gateway timeout. Persist each table in a small number of
  // bulk requests instead.
  const sourceRows = (sources || []).map((source) => ({
    id: source.id,
    name: source.name,
    url: source.url,
    category: source.category,
    active: true,
  }));

  if (sourceRows.length) {
    await request('sources?on_conflict=id', {
      method: 'POST',
      body: JSON.stringify(sourceRows),
    });
  }

  const storyPayload = stories.map((story) => ({
    source_id: story.sourceId || null,
    url: story.url,
    title: story.title,
    description: story.description || null,
    image_url: story.imageUrl || null,
    category: story.category,
    published_at: story.publishedAt,
    summary: story.summary || null,
    why_it_matters: story.whyItMatters || null,
    what_to_watch: story.whatToWatch || null,
    sentiment: story.sentiment || null,
    trend_score: story.trendScore || story.momentumScore || 0,
    momentum_score: story.momentumScore || 0,
    importance_score: story.importanceScore || 0,
    market_relevance_score: story.marketRelevance || 0,
    africa_relevance: story.africaRelevance || 0,
    entities: story.entities || [],
    ai_processed: Boolean(story.aiProcessed),
    is_breaking: (story.importanceScore || 0) >= 90,
  }));

  const savedRows = (await request('stories?on_conflict=url', {
    method: 'POST',
    body: JSON.stringify(storyPayload),
  })) || [];

  const savedByUrl = new Map(savedRows.map((row) => [row.url, row]));
  const persistedStories = stories
    .map((story) => {
      const saved = savedByUrl.get(story.url);
      if (saved?.id) story.id = saved.id;
      return saved?.id ? { story, id: saved.id } : null;
    })
    .filter(Boolean);

  if (!persistedStories.length) {
    return { persisted: false, reason: 'Supabase saved no story rows', count: 0 };
  }

  const snapshots = persistedStories.map(({ story, id }) => ({
    story_id: id,
    momentum_score: story.momentumScore || 0,
    importance_score: story.importanceScore || 0,
  }));

  if (snapshots.length) {
    await request('story_snapshots', {
      method: 'POST',
      body: JSON.stringify(snapshots),
    });
  }

  const entityRows = [];
  for (const { story, id } of persistedStories) {
    for (const entity of story.entities || []) {
      const name = typeof entity === 'string' ? entity : entity?.name;
      const type = typeof entity === 'string' ? 'topic' : entity?.type || 'topic';
      if (!name) continue;
      entityRows.push({ story_id: id, name, entity_type: type });
    }
  }

  if (entityRows.length) {
    await request('story_entities?on_conflict=story_id%2Cname', {
      method: 'POST',
      body: JSON.stringify(entityRows),
    });
  }

  return { persisted: true, count: persistedStories.length };
}

export async function getRecentStories(limit = 200) {
  if (!configured()) return [];

  const rows =
    (await request(
      `stories?select=id,title,description,summary,image_url,category,published_at,momentum_score,trend_score,importance_score,market_relevance_score,africa_relevance,sentiment,url,sources(name,url)&order=published_at.desc&limit=${Math.min(limit, 500)}`
    )) || [];

  return rows.map((story) => ({
    ...story,
    publishedAt: story.published_at,
    imageUrl: story.image_url,
    momentumScore: Number(story.momentum_score || story.trend_score || 0),
    trendScore: Number(story.trend_score || 0),
    importanceScore: Number(story.importance_score || 0),
    marketRelevance: Number(story.market_relevance_score || 0),
    africaRelevance: Number(story.africa_relevance || 0),
    sourceName: story.sources?.name || 'Infera Intelligence Desk',
    sourceUrl: story.sources?.url || story.url || '',
  }));
}

export async function getStory(id) {
  if (!configured() || !id) return null;

  const rows = await request(
    `stories?id=eq.${enc(id)}&select=*,sources(name,url)&limit=1`
  );
  const story = rows?.[0];
  if (!story) return null;

  const entities = await request(
    `story_entities?story_id=eq.${enc(id)}&select=name,entity_type`
  );
  const snapshots = await request(
    `story_snapshots?story_id=eq.${enc(id)}&select=momentum_score,importance_score,captured_at&order=captured_at.asc`
  );
  const related = await request(
    `stories?category=eq.${enc(story.category)}&id=neq.${enc(id)}&select=id,title,category,published_at,momentum_score,url,image_url&order=published_at.desc&limit=5`
  );

  return {
    ...story,
    sourceName: story.sources?.name || 'Infera Intelligence Desk',
    sourceUrl: story.sources?.url || story.url || '',
    imageUrl: story.image_url,
    momentumScore: Number(story.momentum_score || story.trend_score || 0),
    importanceScore: Number(story.importance_score || 0),
    marketRelevance: Number(story.market_relevance_score || 0),
    africaRelevance: Number(story.africa_relevance || 0),
    whyItMatters: story.why_it_matters,
    whatToWatch: story.what_to_watch,
    aiProcessed: story.ai_processed,
    entities: entities || [],
    snapshots: snapshots || [],
    related: related || [],
  };
}

export async function getTopic(slug) {
  if (!configured() || !slug) return null;

  const topic = decodeURIComponent(String(slug)).replace(/-/g, ' ').trim();
  if (!topic) return null;

  const categories = ['business', 'markets', 'trends', 'entertainment', 'africa'];
  const isCategory = categories.includes(topic.toLowerCase());
  let stories;

  if (isCategory) {
    stories = await request(
      `stories?category=ilike.${enc(topic)}&select=id,title,category,published_at,momentum_score,trend_score,importance_score,market_relevance_score,africa_relevance,sentiment,url,image_url&order=published_at.desc&limit=50`
    );
  } else {
    const pattern = `*${topic}*`;
    const q = enc(pattern);
    stories = await request(
      `stories?or=(title.ilike.${q},description.ilike.${q},summary.ilike.${q})&select=id,title,category,published_at,momentum_score,trend_score,importance_score,market_relevance_score,africa_relevance,sentiment,url,image_url&order=published_at.desc&limit=50`
    );
  }

  if (!stories?.length) return null;

  const avg = (key) =>
    Math.round(
      stories.reduce((total, story) => total + Number(story[key] || 0), 0) /
        stories.length
    );

  return {
    name: topic.replace(/\b\w/g, (c) => c.toUpperCase()),
    slug,
    storyCount: stories.length,
    avgMomentum: avg('momentum_score') || avg('trend_score'),
    avgImportance: avg('importance_score'),
    avgMarketRelevance: avg('market_relevance_score'),
    avgAfricaRelevance: avg('africa_relevance'),
    stories: stories.map((story) => ({
      ...story,
      publishedAt: story.published_at,
      imageUrl: story.image_url,
      momentumScore: Number(story.momentum_score || story.trend_score || 0),
      trendScore: Number(story.trend_score || 0),
      importanceScore: Number(story.importance_score || 0),
      marketRelevance: Number(story.market_relevance_score || 0),
      africaRelevance: Number(story.africa_relevance || 0),
    })),
  };
}
