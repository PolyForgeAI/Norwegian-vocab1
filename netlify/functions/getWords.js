export default async (req, context) => {
  const url = new URL(req.url);
  const theme = (url.searchParams.get("theme") || '').trim();

  const prompt = `
You are an API backend. Respond ONLY with valid JSON.

Give five Norwegian A1/A2 vocabulary words ${
    theme ? `related to "${theme}"` : 'on everyday topics'
  } in this format:

[
  { "no": "hund", "en": "dog" },
  { "no": "katt", "en": "cat" },
  { "no": "hest", "en": "horse" },
  { "no": "fugl", "en": "bird" },
  { "no": "fisk", "en": "fish" }
]

NO explanation. NO markdown. ONLY JSON.
`.trim();

  const openaiRes = await fetch('https://api.openai.com/v1/chat/completions', {
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

  const data = await openaiRes.json();
  let content = data.choices?.[0]?.message?.content ?? '';

  // 🧽 Clean: remove markdown wrapper if present
  content = content.trim().replace(/^```json\s*|\s*```$/g, '');

  let words;
  try {
    words = JSON.parse(content);
  } catch (err) {
    console.error("❌ Failed to parse cleaned content:\n", content);
    words = [];
  }

  return new Response(JSON.stringify(words), {
    status: 200,
    headers: { 'Content-Type': 'application/json' }
  });
};
