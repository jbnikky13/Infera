function stripResizeQuery(url) {
  try {
    const parsed = new URL(url);
    const resizeKeys = new Set([
      'w', 'width', 'h', 'height', 'resize', 'size', 'quality', 'q', 'fit',
      'crop', 'fm', 'format', 'dpr', 'auto', 'output', 'image_size',
    ]);

    [...parsed.searchParams.keys()].forEach((key) => {
      if (resizeKeys.has(key.toLowerCase())) parsed.searchParams.delete(key);
    });

    return parsed.toString();
  } catch {
    return url;
  }
}

function upgradePath(url) {
  // WordPress commonly exposes generated thumbnails as image-300x200.jpg.
  // Removing the generated dimensions lets the origin serve the full asset.
  return url.replace(/-\d{2,4}x\d{2,4}(?=\.(?:jpe?g|png|webp|avif)(?:$|\?))/i, '');
}

function upgradeCloudinary(url) {
  // Keep Cloudinary assets sharp while avoiding a tiny transformation being
  // reused by the card. Request a high-quality, retina-friendly rendition.
  return url.replace(
    /\/upload\/(?!.*\/upload\/)([^/]*\b(?:w_\d+|h_\d+|c_fill|q_\d+|f_auto)[^/]*)\//i,
    '/upload/q_auto:good,w_1600/'
  );
}

export function getDisplayImageUrl(value) {
  if (!value || typeof value !== 'string') return '';

  let url = value.trim();
  if (!url) return '';

  try {
    const parsed = new URL(url);
    if (parsed.protocol === 'http:') parsed.protocol = 'https:';
    url = parsed.toString();
  } catch {
    return value;
  }

  url = stripResizeQuery(url);
  url = upgradePath(url);
  url = upgradeCloudinary(url);
  return url;
}
