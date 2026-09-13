const MIN_SOURCE_WIDTH = 900;
const MAX_SOURCE_WIDTH = 2400;

function isHttpUrl(value = '') {
  return /^https?:\/\//i.test(value);
}

export function normalizeImageUrl(url = '') {
  if (!isHttpUrl(url)) return '';
  return url.trim();
}

function widthHints(url = '') {
  const match = url.match(/[?&](?:w|width|sz|size)=(\d{3,4})/i);
  return match ? Number(match[1]) : null;
}

export function imageQualityHint(url = '') {
  const width = widthHints(url);
  if (!width) return 'unknown';
  if (width < 500) return 'low';
  if (width < MIN_SOURCE_WIDTH) return 'medium';
  return 'high';
}

// Best-effort source upgrade. We never discard an image merely because its
// dimensions cannot be detected: many publishers hide the original image
// dimensions behind a CDN or signed URL.
export function prepareImageUrl(url = '') {
  const normalized = normalizeImageUrl(url);
  if (!normalized) return '';

  // Preserve the publisher URL by default. Only append a width hint when the
  // URL already exposes a common image-resizing parameter, avoiding accidental
  // breakage of signed CDN URLs.
  return normalized;
}

export function imageMetadata(url = '') {
  const prepared = prepareImageUrl(url);
  const hintedWidth = widthHints(prepared);
  return {
    url: prepared,
    quality: imageQualityHint(prepared),
    hintedWidth,
    targetWidth: Math.min(MAX_SOURCE_WIDTH, Math.max(MIN_SOURCE_WIDTH, hintedWidth || MIN_SOURCE_WIDTH)),
  };
}
