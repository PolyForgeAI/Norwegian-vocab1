export default async (req, context) => {
  const url   = new URL(req.url);
  const theme = (url.searchParams.get("theme") || "").trim();
  const l1    = (url.searchParams.get("l1") || "").trim();
  const tl    = (url.searchParams.get("tl") || "").trim();

  if (!l1 || !tl || l1 === tl) {
    return new Response(JSON.stringify([]), {
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    });
  }

  const prompt = `
You are an API backend. Return only valid JSON.

Generate five distinct vocabulary words in ${tl} ${
    theme ? `related to the topic "${theme}"` : "on general everyday topics"
  }. For each word, give the correct translation in ${l1}.

Format exactly as:

[
  { "tl": "<word in ${tl}>", "l1": "<translation in ${l1}>" },
  ...
]

Only return strict JSON. Do not use markdown, do not explain. Just the array.
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
  let content = data.choices?.[0]?.message?.content ?? '';

  // 🧼 Strip markdown if wrapped
  content = content.trim().replace(/^```json\\s*|\\s*```$/g, '');

  let words;
  try {
    words = JSON.parse(content);
  } catch (err) {
    console.error('❌ Parse failed. Raw content:', content);
    words = [];
  }

  return new Response(JSON.stringify(words), {
    status: 200,
    headers: { 'Content-Type': 'application/json' }
  });
};
