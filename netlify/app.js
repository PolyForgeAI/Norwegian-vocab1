/* global fetch */
const btnContainer = document.getElementById('buttons');
const refreshBtn   = document.getElementById('refresh');
const themeInput   = document.getElementById('theme');

let seen = new Set(); // session-level cache

/** Utility: call OpenAI for 5 Norwegian words + English translations */
async function fetchWords(theme = '') {
  const prompt = `
    Give five distinct Norwegian A1/A2 vocabulary words ${
      theme ? `related to "${theme}"` : 'on random everyday topics'
    }. 
    Return as strict JSON: 
      [{ "no": "<Norwegian>", "en": "<English>" }, ...]. 
    Do NOT repeat any of these words: [${[...seen].join(', ')}]
  `.trim();

  const res = await fetch('https://api.openai.com/v1/chat/completions', {
    method : 'POST',
    headers: {
      'Content-Type' : 'application/json',
      Authorization  : `Bearer ${window.OPENAI_API_KEY}`
    },
    body: JSON.stringify({
      model  : 'gpt-4o-mini',
      messages: [{ role: 'user', content: prompt }],
      temperature: 0.6
    })
  });

  const data  = await res.json();
  const text  = data.choices?.[0]?.message?.content ?? '[]';
  let words;

  try   { words = JSON.parse(text); }
  catch {                                                        // fallback if parsing fails
    console.warn('OpenAI response not JSON – using local seed');
    words = await localFallback();
  }
  return words.filter(w => !seen.has(w.no.toLowerCase()));
}

/** local fallback from seedWords.json */
async function localFallback() {
  const res   = await fetch('seedWords.json');
  const pool  = await res.json();
  const shuffle = arr => arr.sort(() => 0.5 - Math.random());
  return shuffle(pool).slice(0, 5);
}

/** Render 5 word buttons */
function render(words) {
  btnContainer.innerHTML = '';
  words.forEach(({ no, en }) => {
    const btn = document.createElement('button');
    btn.className = 'word';
    btn.textContent = no;
    btn.dataset.no = no;
    btn.dataset.en = en;
    btn.onclick = () => toggle(btn);
    btn.onmouseenter = () => hoverSwap(btn, true);
    btn.onmouseleave = () => hoverSwap(btn, false);
    btnContainer.appendChild(btn);
    seen.add(no.toLowerCase());
  });
}

/** Click toggle */
function toggle(btn) {
  btn.textContent = btn.textContent === btn.dataset.no ? btn.dataset.en : btn.dataset.no;
}

/** Hover (non-touch) swap */
function hoverSwap(btn, entering) {
  if (window.matchMedia('(hover: hover)').matches) {
    btn.textContent = entering ? btn.dataset.en : btn.dataset.no;
  }
}

/** Fetch & display */
async function populate() {
  const theme = themeInput.value.trim();
  const words = await fetchWords(theme);
  render(words);
}

/** Event binding */
refreshBtn.addEventListener('click', populate);

/* Kick-off */
populate();

