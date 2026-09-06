const base = process.env.NEXT_PUBLIC_SITE_URL || 'https://infera.vercel.app'
const categories = ['business','markets','trends','entertainment','africa']
export default function sitemap(){return [{url:base,lastModified:new Date(),changeFrequency:'hourly',priority:1},{url:`${base}/trending`,lastModified:new Date(),changeFrequency:'hourly',priority:.9},{url:`${base}/brief`,lastModified:new Date(),changeFrequency:'daily',priority:.8},...categories.map(slug=>({url:`${base}/topic/${slug}`,lastModified:new Date(),changeFrequency:'hourly',priority:.8}))]}
