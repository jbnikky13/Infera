const FETCH_TIMEOUT_MS = 7000;
const MAX_HTML_BYTES = 700_000;

function absoluteUrl(value, base) {
  if (!value) return '';
  try { return new URL(value, base).toString(); } catch { return ''; }
}

function cleanUrl(value) {
  return String(value || '').replace(/&amp;/g, '&').trim();
}

function candidateScore(url, hint = '') {
  const text = `${url} ${hint}`.toLowerCase();
  let score = 0;
  if (/og:image/.test(text)) score += 50;
  if (/image_src/.test(text)) score += 45;
  if (/twitter:image/.test(text)) score += 40;
  if (/original|full|large|hero|featured|master|1600|1200/.test(text)) score += 30;
  if (/thumb|thumbnail|small|tiny|150x|300x/.test(text)) score -= 35;
  if (/\.svg(?:[?#]|$)/.test(text)) score -= 20;
  return score;
}

function parseImageCandidates(html, pageUrl) {
  const candidates = [];
  const push = (url, hint = '') => {
    const absolute = absoluteUrl(cleanUrl(url), pageUrl);
    if (absolute && /^https?:\/\//i.test(absolute)) candidates.push({ url: absolute, score: candidateScore(absolute, hint) });
  };
  for (const match of html.matchAll(/<meta[^>]+(?:property|name)=["'](?:og:image|og:image:url|twitter:image|twitter:image:src)["'][^>]+content=["']([^"']+)["'][^>]*>/gi)) push(match[1], match[0]);
  for (const match of html.matchAll(/<link[^>]+(?:rel=["'][^"']*(?:image_src|preload)[^"']*["'])[^>]+href=["']([^"']+)["'][^>]*>/gi)) push(match[1], match[0]);
  for (const match of html.matchAll(/<img[^>]+(?:src|data-src|data-lazy-src|data-original)=["']([^"']+)["'][^>]*>/gi)) push(match[1], match[0]);
  return candidates;
}

export async function resolveOriginalImage(articleUrl, currentImage = '') {
  if (!articleUrl || !/^https?:\/\//i.test(articleUrl)) return currentImage || '';
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), FETCH_TIMEOUT_MS);
  try {
    const response = await fetch(articleUrl, { headers: { 'user-agent': 'InferaBot/1.0', accept: 'text/html,application/xhtml+xml' }, cache: 'no-store', signal: controller.signal });
    if (!response.ok) return currentImage || '';
    const reader = response.body?.getReader();
    if (!reader) return currentImage || '';
    const decoder = new TextDecoder();
    let html = '';
    while (html.length < MAX_HTML_BYTES) {
      const { done, value } = await reader.read();
      if (done) break;
      html += decoder.decode(value, { stream: true });
      if (html.toLowerCase().includes('</head>')) break;
    }
    try { await reader.cancel(); } catch {}
    const candidates = parseImageCandidates(html, articleUrl);
    if (!candidates.length) return currentImage || '';
    candidates.sort((a, b) => b.score - a.score);
    const currentScore = candidateScore(currentImage);
    return candidates[0].score > currentScore + 5 ? candidates[0].url : (currentImage || candidates[0].url);
  } catch {
    return currentImage || '';
  } finally {
    clearTimeout(timer);
  }
}
