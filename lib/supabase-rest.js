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

  let count = 0;

  // Sources use a text primary key. Explicitly tell PostgREST which
  // constraint to use so repeated ingestion updates the existing source
  // instead of returning a 409 conflict.
  for (const source of sources) {
    await request(`sources?on_conflict=id`, {
      method: 'POST',
      body: JSON.stringify({
        id: source.id,
        name: source.name,
        url: source.url,
        category: source.category,
        active: true,
      }),
    });
  }

  for (const story of stories) {
    const sourceRows = await request(
      `sources?id=eq.${enc(story.sourceId)}&select=id&limit=1`
    );
    const sourceId = sourceRows?.[0]?.id || story.sourceId || null;

    const storyPayload = {
      source_id: sourceId,
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
    };

    // stories.url is UNIQUE. Explicit on_conflict=url makes ingestion
    // idempotent: existing stories are updated and their real UUID is
    // returned, while new stories receive a generated UUID.
    const rows = await request(`stories?on_conflict=url`, {
      method: 'POST',
      body: JSON.stringify(storyPayload),
    });

    const saved = rows?.[0];
    if (!saved?.id) continue;

    story.id = saved.id;

    await request('story_snapshots', {
      method: 'POST',
      body: JSON.stringify({
        story_id: saved.id,
        momentum_score: story.momentumScore || 0,
        importance_score: story.importanceScore || 0,
      }),
    });

    for (const entity of story.entities || []) {
      const name = typeof entity === 'string' ? entity : entity?.name;
      const type = typeof entity === 'string' ? 'topic' : entity?.type || 'topic';
      if (!name) continue;

      // story_entities has a UNIQUE(story_id, name) constraint. Explicitly
      // use it so repeated ingestion never aborts persistence with 409.
      await request(
        `story_entities?on_conflict=story_id%2Cname`,
        {
          method: 'POST',
          body: JSON.stringify({
            story_id: saved.id,
            name,
            entity_type: type,
          }),
        }
      );
    }

    count += 1;
  }

  return { persisted: true, count };
}

export async function getRecentStories(limit = 200) {
  if (!configured()) return [];

  const rows =
    (await request(
      `stories?select=id,title,description,summary,image_url,category,published_at,momentum_score,trend_score,importance_score,market_relevance_score,africa_relevance,sentiment,url&order=published_at.desc&limit=${Math.min(limit, 500)}`
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
    sourceName: story.sources?.name,
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
    sourceName: story.sources?.name,
    sourceUrl: story.sources?.url,
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
  if (!configured()) return null;

  const topic = decodeURIComponent(slug).replace(/-/g, ' ');
  const categories = ['business', 'markets', 'trends', 'entertainment', 'africa'];
  const isCategory = categories.includes(topic.toLowerCase());
  let stories;

  if (isCategory) {
    stories = await request(
      `stories?category=ilike.${enc(topic)}&select=id,title,category,published_at,momentum_score,importance_score,market_relevance_score,africa_relevance,sentiment,url,image_url&order=published_at.desc&limit=50`
    );
  } else {
    const q = encodeURIComponent(`*${topic}*`);
    stories = await request(
      `stories?or=(title.ilike.${q},description.ilike.${q},summary.ilike.${q})&select=id,title,category,published_at,momentum_score,importance_score,market_relevance_score,africa_relevance,sentiment,url,image_url&order=published_at.desc&limit=50`
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
    avgMomentum: avg('momentum_score'),
    avgImportance: avg('importance_score'),
    avgMarketRelevance: avg('market_relevance_score'),
    avgAfricaRelevance: avg('africa_relevance'),
    stories,
  };
}
