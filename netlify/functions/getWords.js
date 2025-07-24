export default async (req, context) => {
  const theme = (context.params?.query?.theme || '').trim();

  const prompt = `
You are an API backend. Respond ONLY with JSON.

Give five Norwegian A1/A2-level vocabulary words ${
    theme ? `related to "${theme}"` : 'on common topics'
  }, formatted as a strict JSON array:
[
  { "no": "hund", "en": "dog" },
  { "no": "katt", "en": "cat" },
  ...
]
Do NOT include any explanation or extra text — just return valid JSON.
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

  const data    = await openaiRes.json();
  const content = data.choices?.[0]?.message?.content ?? '[]';

  let words;
  try { words = JSON.parse(content); }
  catch {
    console.error("❌ Failed to parse OpenAI response:", content);
    words = [];
  }

  return new Response(JSON.stringify(words), {
    status: 200,
    headers: { 'Content-Type': 'application/json' }
  });
};
