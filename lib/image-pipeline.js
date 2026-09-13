const MIN_SOURCE_WIDTH = 900;
const MAX_SOURCE_WIDTH = 2400;

function isHttpUrl(value = '') {
  return /^https?:\/\//i.test(value);
}

function widthHints(url = '') {
  const match = url.match(/[?&](?:w|width|sz|size)=(\d{3,4})/i);
  return match ? Number(match[1]) : null;
}

function removeResizeParams(url) {
  try {
    const parsed = new URL(url);
    const keys = new Set(['w', 'width', 'h', 'height', 'sz', 'size', 'resize', 'quality', 'q']);
    [...parsed.searchParams.keys()].forEach((key) => {
      if (keys.has(key.toLowerCase())) parsed.searchParams.delete(key);
    });
    return parsed.toString();
  } catch {
    return url;
  }
}

function removeWordPressThumbnailSuffix(url) {
  return url.replace(/-\d{2,4}x\d{2,4}(?=\.(?:jpe?g|png|webp|avif)(?:$|\?))/i, '');
}

function upgradeCloudinary(url) {
  return url.replace(
    /\/upload\/(?!.*\/upload\/)([^/]*\b(?:w_\d+|h_\d+|c_fill|q_\d+|f_auto)[^/]*)\//i,
    '/upload/q_auto:good,w_1600/'
  );
}

export function normalizeImageUrl(url = '') {
  if (!isHttpUrl(url)) return '';
  try {
    const parsed = new URL(url.trim());
    if (parsed.protocol === 'http:') parsed.protocol = 'https:';
    return parsed.toString();
  } catch {
    return '';
  }
}

export function imageQualityHint(url = '') {
  const width = widthHints(url);
  if (!width) return 'unknown';
  if (width < 500) return 'low';
  if (width < MIN_SOURCE_WIDTH) return 'medium';
  return 'high';
}

// Best-effort source upgrade. Prefer the publisher's original asset instead of
// a generated thumbnail, while leaving signed/unknown CDN URLs untouched.
export function prepareImageUrl(url = '') {
  let prepared = normalizeImageUrl(url);
  if (!prepared) return '';
  prepared = removeResizeParams(prepared);
  prepared = removeWordPressThumbnailSuffix(prepared);
  prepared = upgradeCloudinary(prepared);
  return prepared;
}

export function imageMetadata(url = '') {
  const prepared = prepareImageUrl(url);
  const hintedWidth = widthHints(url);
  return {
    url: prepared,
    quality: imageQualityHint(url),
    hintedWidth,
    targetWidth: Math.min(MAX_SOURCE_WIDTH, Math.max(MIN_SOURCE_WIDTH, hintedWidth || MIN_SOURCE_WIDTH)),
  };
}
