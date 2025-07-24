const btnContainer = document.getElementById('buttons');
const refreshBtn   = document.getElementById('refresh');
const themeInput   = document.getElementById('theme');

let seen = new Set();

async function fetchWords(theme = '') {
  const endpoint = `/.netlify/functions/getWords?theme=${encodeURIComponent(theme)}`;
  const res      = await fetch(endpoint);
  const words    = await res.json();
  return words.filter(w => !seen.has(w.no.toLowerCase()));
}

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

function toggle(btn) {
  btn.textContent = btn.textContent === btn.dataset.no ? btn.dataset.en : btn.dataset.no;
}

function hoverSwap(btn, entering) {
  if (window.matchMedia('(hover: hover)').matches) {
    btn.textContent = entering ? btn.dataset.en : btn.dataset.no;
  }
}

async function populate() {
  const theme = themeInput.value.trim();
  const words = await fetchWords(theme);
  render(words);
}

refreshBtn.addEventListener('click', populate);
populate();

