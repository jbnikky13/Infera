import { NEWS_SOURCES } from './news-sources';

function clean(value = '') {
  return value.replace(/<!\[CDATA\[([\s\S]*?)\]\]>/g, '$1').replace(/<[^>]+>/g, '').replace(/&amp;/g, '&').replace(/&quot;/g, '"').replace(/&#39;/g, "'").replace(/&lt;/g, '<').replace(/&gt;/g, '>').trim();
}
function firstTag(xml, tag) { const match = xml.match(new RegExp(`<${tag}(?:\\s[^>]*)?>([\\s\\S]*?)</${tag}>`, 'i')); return match ? clean(match[1]) : ''; }
function extractItems(xml) { return [...xml.matchAll(/<(item|entry)(?:\s[^>]*)?>([\s\S]*?)<\/(item|entry)>/gi)].map((match) => { const block = match[2]; const linkHref = block.match(/<link[^>]+href=["']([^"']+)["'][^>]*>/i)?.[1]; return { title: firstTag(block, 'title'), description: firstTag(block, 'description') || firstTag(block, 'summary') || firstTag(block, 'content'), url: linkHref || firstTag(block, 'link') || firstTag(block, 'guid'), publishedAt: firstTag(block, 'pubDate') || firstTag(block, 'published') || firstTag(block, 'updated') }; }); }

export async function ingestSources() {
  const results = [];
  for (const source of NEWS_SOURCES) {
    try {
      const response = await fetch(source.url, { headers: { 'user-agent': 'InferaBot/1.0' }, cache: 'no-store' });
      if (!response.ok) throw new Error(`HTTP ${response.status}`);
      const xml = await response.text();
      const items = extractItems(xml).slice(0, 25).map((item) => ({ ...item, sourceId: source.id, sourceName: source.name, category: source.category, publishedAt: item.publishedAt ? new Date(item.publishedAt).toISOString() : new Date().toISOString() })).filter((item) => item.title && item.url);
      results.push({ source, items, error: null });
    } catch (error) { results.push({ source, items: [], error: error.message }); }
  }
  return results;
}
