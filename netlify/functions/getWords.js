export default async (req, context) => {
  const url = new URL(req.url);
  const theme = (url.searchParams.get("theme") || '').trim();

  const prompt = `
You are an API backend. Respond ONLY with JSON.

Give five Norwegian A1/A2-level vocabulary words ${
    theme ? `related to "${theme}"` : 'on common everyday topics'
  }, formatted exactly like this:

[
  { "no": "hund", "en": "dog" },
  { "no": "katt", "en": "cat" },
  { "no": "hus", "en": "house" },
  { "no": "vann", "en": "water" },
  { "no": "bil", "en": "car" }
]

Do not return any explanation or formatting. Only JSON. Strict format.
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
      temperature: 0.4
    })
  });

  const data = await openaiRes.json();
  const content = data.choices?.[0]?.message?.content ?? '[]';

  let words;
  try {
    words = JSON.parse(content);
  } catch (err) {
    console.error("❌ Failed to parse OpenAI response:", content);
    words = [];
  }

  return new Response(JSON.stringify(words), {
    status: 200,
    headers: { 'Content-Type': 'application/json' }
  });
};
