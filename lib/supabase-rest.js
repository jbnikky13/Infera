const baseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

function configured() { return Boolean(baseUrl && serviceKey); }

async function request(path, options = {}) {
  if (!configured()) return null;
  const response = await fetch(`${baseUrl}/rest/v1/${path}`, {
    ...options,
    headers: {
      apikey: serviceKey,
      Authorization: `Bearer ${serviceKey}`,
      'Content-Type': 'application/json',
      Prefer: 'return=representation,resolution=merge-duplicates',
      ...(options.headers || {})
    },
    cache: 'no-store'
  });
  if (!response.ok) throw new Error(`Supabase ${response.status}: ${await response.text()}`);
  return response.status === 204 ? null : response.json();
}

export async function persistStories(stories, sources) {
  if (!configured()) return { persisted: false, reason: 'Supabase environment variables are not configured', count: 0 };
  let count = 0;
  for (const source of sources) {
    await request(`sources?name=eq.${encodeURIComponent(source.name)}`, {
      method: 'POST',
      body: JSON.stringify({ name: source.name, url: source.url, feed_url: source.url, category: source.category, active: true })
    });
  }
  for (const story of stories) {
    const sourceRows = await request(`sources?name=eq.${encodeURIComponent(story.sourceName)}&select=id`);
    const sourceId = sourceRows?.[0]?.id || null;
    await request('stories', {
      method: 'POST',
      body: JSON.stringify({
        source_id: sourceId,
        external_url: story.url,
        title: story.title,
        description: story.description || null,
        category: story.category,
        published_at: story.publishedAt,
        summary: story.summary || null,
        why_it_matters: story.whyItMatters || null,
        what_to_watch: story.whatToWatch || null,
        sentiment: story.sentiment || null,
        importance_score: story.importanceScore || 0,
        momentum_score: story.momentumScore || 0,
        market_relevance: story.marketRelevance || 0,
        africa_relevance: story.africaRelevance || 0,
        is_breaking: (story.importanceScore || 0) >= 90,
        ai_processed: false
      })
    });
    count += 1;
  }
  return { persisted: true, count };
}
