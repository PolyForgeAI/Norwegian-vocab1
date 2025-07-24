export default async (req, context) => {
  const url = new URL(req.url);
  const theme = (url.searchParams.get("theme") || '').trim();

  const prompt = `
You are an API backend. Respond ONLY with JSON.

Give five Norwegian A1/A2-level vocabulary words ${
    theme ? `related to "${theme}"` : 'on everyday topics'
  }, like:
[
  { "no": "hund", "en": "dog" },
  { "no": "katt", "en": "cat" },
  { "no": "hus", "en": "house" },
  { "no": "vann", "en": "water" },
  { "no": "bil", "en": "car" }
]
Only JSON. No preamble.
`.trim();

  let openaiRes, data;

  try {
    openaiRes = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${process.env.OPENAI_API_KEY}`
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        messages: [{ role: 'user', content: prompt }],
        temperature: 0.3
      })
    });

    data = await openaiRes.json();
  } catch (err) {
    return new Response(JSON.stringify({ error: "❌ API call failed", details: err.message }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }

  return new Response(JSON.stringify({
    promptUsed: prompt,
    openaiRaw: data
  }), {
    status: 200,
    headers: { 'Content-Type': 'application/json' }
  });
};
