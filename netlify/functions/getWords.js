export default async (req, context) => {
  const url = new URL(req.url);
  const theme = (url.searchParams.get("theme") || '').trim();

  const prompt = `
You are an API backend. Respond ONLY with JSON.

Give five Norwegian A1/A2-level vocabulary words ${
    theme ? `related to "${theme}"` : 'on common everyday topics'
  }, formatted as:
[
  { "no": "hund", "en": "dog" },
  { "no": "katt", "en": "cat" },
  ...
]
No preamble. No explanation. No markdown. Only valid JSON.
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
  const content = data.choices?.[0]?.message?.content ?? '';

  console.log("🔎 RAW RESPONSE FROM OPENAI:\n" + content); // will show in Netlify function logs

  return new Response(
    JSON.stringify({ raw: content }), // don’t parse
    { status: 200, headers: { 'Content-Type': 'application/json' } }
  );
};
