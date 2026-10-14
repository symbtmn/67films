/* Assignment 4, Task 2: a custom accordion, not Bootstrap collapse. */
'use strict';
(() => {
  const closeTimers = new WeakMap();
  document.querySelectorAll('[data-faq-toggle]').forEach(button => {
    const panel = document.getElementById(button.getAttribute('aria-controls'));
    if (!panel) return;
    panel.hidden = true;
    panel.inert = true;
    button.setAttribute('aria-expanded', 'false');
    button.addEventListener('click', () => {
      clearTimeout(closeTimers.get(panel));
      const open = button.getAttribute('aria-expanded') !== 'true';
      button.setAttribute('aria-expanded', String(open));
      panel.setAttribute('aria-hidden', String(!open));
      panel.inert = !open;
      if (open) {
        panel.hidden = false;
        // Layout at 0fr must exist before transitioning to 1fr.
        void panel.offsetHeight;
        panel.classList.add('is-open');
      } else {
        panel.classList.remove('is-open');
        const delay = matchMedia('(prefers-reduced-motion: reduce)').matches ? 0 : 280;
        closeTimers.set(panel, setTimeout(() => {
          if (button.getAttribute('aria-expanded') === 'false') panel.hidden = true;
        }, delay));
      }
    });
  });
})();
