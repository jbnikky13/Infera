import { NEWS_SOURCES } from './news-sources';

const SOURCE_TIMEOUT_MS = 15_000;

function clean(value = '') {
  return value
    .replace(/<!\[CDATA\[([\s\S]*?)\]\]>/g, '$1')
    .replace(/<[^>]+>/g, '')
    .replace(/&amp;/g, '&')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .trim();
}

function firstTag(xml, tag) {
  const match = xml.match(new RegExp(`<${tag}(?:\\s[^>]*)?>([\\s\\S]*?)</${tag}>`, 'i'));
  return match ? clean(match[1]) : '';
}

function firstImage(block) {
  const candidates = [
    block.match(/<media:(?:content|thumbnail)[^>]+url=["']([^"']+)["'][^>]*>/i)?.[1],
    block.match(/<enclosure[^>]+url=["']([^"']+)["'][^>]*(?:type=["']image\/(?:jpeg|jpg|png|webp)["'])?[^>]*>/i)?.[1],
    block.match(/<image[^>]*>\s*<url>([\s\S]*?)<\/url>/i)?.[1],
    block.match(/<img[^>]+src=["']([^"']+)["']/i)?.[1],
  ];
  const image = candidates.find(Boolean);
  return image ? clean(image) : '';
}

function extractItems(xml) {
  return [...xml.matchAll(/<(item|entry)(?:\s[^>]*)?>([\s\S]*?)<\/(item|entry)>/gi)].map((match) => {
    const block = match[2];
    const linkHref = block.match(/<link[^>]+href=["']([^"']+)["'][^>]*>/i)?.[1];
    return {
      title: firstTag(block, 'title'),
      description: firstTag(block, 'description') || firstTag(block, 'summary') || firstTag(block, 'content'),
      url: linkHref || firstTag(block, 'link') || firstTag(block, 'guid'),
      imageUrl: firstImage(block),
      publishedAt: firstTag(block, 'pubDate') || firstTag(block, 'published') || firstTag(block, 'updated'),
    };
  });
}

async function ingestOne(source) {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), SOURCE_TIMEOUT_MS);
  try {
    const response = await fetch(source.url, {
      headers: { 'user-agent': 'InferaBot/1.0', accept: 'application/rss+xml, application/atom+xml, application/xml, text/xml, */*' },
      cache: 'no-store',
      signal: controller.signal,
    });
    if (!response.ok) throw new Error(`HTTP ${response.status}`);
    const xml = await response.text();
    const items = extractItems(xml)
      .slice(0, 25)
      .map((item) => ({
        ...item,
        sourceId: source.id,
        sourceName: source.name,
        category: source.category,
        publishedAt: item.publishedAt ? new Date(item.publishedAt).toISOString() : new Date().toISOString(),
      }))
      .filter((item) => item.title && item.url);
    return { source, items, error: null };
  } catch (error) {
    const message = error?.name === 'AbortError' ? `timeout after ${SOURCE_TIMEOUT_MS}ms` : error?.message || 'Unknown source error';
    return { source, items: [], error: message };
  } finally {
    clearTimeout(timer);
  }
}

export async function ingestSources() {
  return Promise.all(NEWS_SOURCES.map(ingestOne));
}
