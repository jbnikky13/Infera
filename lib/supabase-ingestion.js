const baseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

function configured() {
  return Boolean(baseUrl && serviceKey);
}

function chunks(items, size) {
  const result = [];
  for (let i = 0; i < items.length; i += size) result.push(items.slice(i, i + size));
  return result;
}

async function request(path, rows, { chunkSize = 25, returnRepresentation = false } = {}) {
  if (!rows.length) return [];
  const output = [];

  for (const batch of chunks(rows, chunkSize)) {
    const response = await fetch(`${baseUrl}/rest/v1/${path}`, {
      method: 'POST',
      headers: {
        apikey: serviceKey,
        Authorization: `Bearer ${serviceKey}`,
        'Content-Type': 'application/json',
        Prefer: returnRepresentation
          ? 'return=representation,resolution=merge-duplicates'
          : 'return=minimal,resolution=merge-duplicates',
      },
      body: JSON.stringify(batch),
      cache: 'no-store',
    });

    if (!response.ok) {
      const body = await response.text();
      throw new Error(`Supabase ${response.status} on ${path}: ${body}`);
    }

    if (returnRepresentation && response.status !== 204) {
      const saved = await response.json();
      if (Array.isArray(saved)) output.push(...saved);
    }
  }

  return output;
}

export async function persistStories(stories, sources) {
  if (!configured()) {
    return { persisted: false, reason: 'Supabase environment variables are not configured', count: 0 };
  }

  if (!stories.length) return { persisted: true, count: 0 };

  const sourceRows = (sources || []).map((source) => ({
    id: source.id,
    name: source.name,
    url: source.url,
    category: source.category,
    active: true,
  }));

  await request('sources?on_conflict=id', sourceRows, {
    chunkSize: 25,
    returnRepresentation: false,
  });

  const storyRows = stories.map((story) => ({
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

  // Keep story upserts small enough to avoid Supabase gateway timeouts.
  const savedRows = await request('stories?on_conflict=url', storyRows, {
    chunkSize: 20,
    returnRepresentation: true,
  });

  const savedByUrl = new Map(savedRows.map((row) => [row.url, row]));
  const persisted = stories
    .map((story) => {
      const saved = savedByUrl.get(story.url);
      if (!saved?.id) return null;
      story.id = saved.id;
      return { story, id: saved.id };
    })
    .filter(Boolean);

  if (!persisted.length) {
    return { persisted: false, reason: 'Supabase saved no story rows', count: 0 };
  }

  const snapshots = persisted.map(({ story, id }) => ({
    story_id: id,
    momentum_score: story.momentumScore || 0,
    importance_score: story.importanceScore || 0,
  }));

  await request('story_snapshots', snapshots, {
    chunkSize: 50,
    returnRepresentation: false,
  });

  const entityRows = [];
  for (const { story, id } of persisted) {
    for (const entity of story.entities || []) {
      const name = typeof entity === 'string' ? entity : entity?.name;
      const type = typeof entity === 'string' ? 'topic' : entity?.type || 'topic';
      if (name) entityRows.push({ story_id: id, name, entity_type: type });
    }
  }

  await request('story_entities?on_conflict=story_id%2Cname', entityRows, {
    chunkSize: 50,
    returnRepresentation: false,
  });

  return { persisted: true, count: persisted.length };
}
