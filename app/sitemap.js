const getBaseUrl = () => {
  const configured = process.env.NEXT_PUBLIC_SITE_URL?.trim()
  if (configured) return configured.replace(/\/$/, '')
  const vercel = process.env.VERCEL_URL?.trim()
  if (vercel) return `https://${vercel}`
  return 'http://localhost:3000'
}

const categories = ['business','markets','trends','entertainment','africa']

export default function sitemap() {
  const base = getBaseUrl()
  return [
    { url: base, lastModified: new Date(), changeFrequency: 'hourly', priority: 1 },
    { url: `${base}/trending`, lastModified: new Date(), changeFrequency: 'hourly', priority: 0.9 },
    { url: `${base}/brief`, lastModified: new Date(), changeFrequency: 'daily', priority: 0.8 },
    ...categories.map(slug => ({ url: `${base}/topic/${slug}`, lastModified: new Date(), changeFrequency: 'hourly', priority: 0.8 }))
  ]
}
