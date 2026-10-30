/* Assignment 4, Task 4: change the real page background, with readable palettes. */
'use strict';
(() => {
  const button = document.getElementById('background-toggle');
  if (!button) return;
  const palettes = [
    { name: 'Классикалық', light: '#ffffff', dark: '#252d39' },
    { name: 'Жылы', light: '#fff1e6', dark: '#3b3029' },
    { name: 'Көгілдір', light: '#e7f1ff', dark: '#24364b' },
    { name: 'Күлгін', light: '#f1eaff', dark: '#382e4a' }
  ];
  let index = 0;
  try {
    const stored = Number(localStorage.getItem('67films-background'));
    if (Number.isInteger(stored) && stored >= 0 && stored < palettes.length) index = stored;
  } catch { /* Storage restrictions do not disable the component. */ }
  function applyBackground() {
    const dark = document.documentElement.getAttribute('data-bs-theme') === 'dark';
    document.body.style.backgroundColor = dark ? palettes[index].dark : palettes[index].light;
    button.textContent = `Фон: ${palettes[index].name}`;
  }
  button.addEventListener('click', () => {
    index = (index + 1) % palettes.length;
    applyBackground();
    try { localStorage.setItem('67films-background', String(index)); } catch { /* keep working */ }
  });
  new MutationObserver(applyBackground).observe(document.documentElement, {
    attributes: true, attributeFilter: ['data-bs-theme']
  });
  applyBackground();
})();
