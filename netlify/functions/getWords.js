export default async (req, context) => {
  const theme = (context.params?.query?.theme || '').trim();

  const prompt = `
    Provide exactly five distinct Norwegian A1/A2 words ${
      theme ? `related to "${theme}"` : 'on random everyday topics'
    }.
    Return strict JSON array:
      [{ "no": "<Norwegian>", "en": "<English>" }, ...]
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
      temperature: 0.6
    })
  });

  const data    = await openaiRes.json();
  const content = data.choices?.[0]?.message?.content ?? '[]';

  let words;
  try { words = JSON.parse(content); }
  catch { words = []; }

  return new Response(JSON.stringify(words), {
    status: 200,
    headers: { 'Content-Type': 'application/json' }
  });
};

