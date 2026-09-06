const MODEL = process.env.GEMINI_MODEL || 'gemini-2.5-flash';

export async function enrichWithGemini(story) {
  const key = process.env.GEMINI_API_KEY;
  if (!key) return { ...story, aiProcessed: false, aiStatus: 'not_configured' };
  const prompt = `You are the senior intelligence editor for Infera. Analyze this news item without inventing facts. Return ONLY valid JSON with keys: summary, whyItMatters, whatToWatch, sentiment, entities. entities must be an array of objects with name and type. Keep summary under 70 words, whyItMatters under 80 words, whatToWatch under 60 words. sentiment must be positive, negative, neutral, or mixed.\n\nTitle: ${story.title}\nDescription: ${story.description || ''}\nCategory: ${story.category}\nSource: ${story.sourceName || ''}`;
  try {
    const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/${MODEL}:generateContent?key=${encodeURIComponent(key)}`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ contents: [{ parts: [{ text: prompt }] }], generationConfig: { temperature: 0.2, responseMimeType: 'application/json' } }), cache: 'no-store' });
    if (!response.ok) throw new Error(`Gemini HTTP ${response.status}`);
    const data = await response.json();
    const text = data.candidates?.[0]?.content?.parts?.[0]?.text;
    const parsed = JSON.parse(text);
    return { ...story, ...parsed, aiProcessed: true, aiStatus: 'processed' };
  } catch (error) { return { ...story, aiProcessed: false, aiStatus: 'error', aiError: error.message }; }
}

export async function enrichStories(stories) {
  if (!process.env.GEMINI_API_KEY) return stories.map((story) => ({ ...story, aiProcessed: false, aiStatus: 'not_configured' }));
  const output = [];
  for (const story of stories.slice(0, 12)) output.push(await enrichWithGemini(story));
  return [...output, ...stories.slice(12)];
}
