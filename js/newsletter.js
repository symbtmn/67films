/* Assignment 4, Task 3: a native modal dialog with custom open/close handlers. */
'use strict';
(() => {
  const dialog = document.getElementById('newsletter-dialog');
  const form = document.getElementById('newsletter-form');
  if (!dialog || !form || !window.FilmForms) return;
  let trigger = null;
  document.querySelectorAll('[data-newsletter-open]').forEach(button => {
    button.addEventListener('click', () => {
      if (dialog.open) return;
      trigger = button;
      window.FilmForms.clear(form);
      dialog.showModal();
      document.body.classList.add('newsletter-open');
    });
  });
  dialog.querySelector('[data-newsletter-close]').addEventListener('click', () => dialog.close());
  // Keep keyboard focus inside the popup in every supported browser.
  dialog.addEventListener('keydown', event => {
    if (event.key !== 'Tab') return;
    const controls = [...dialog.querySelectorAll('button, input, select, textarea, a[href], [tabindex="0"]')]
      .filter(control => !control.disabled && control.getClientRects().length > 0);
    const first = controls[0];
    const last = controls[controls.length - 1];
    if (event.shiftKey && document.activeElement === first) {
      event.preventDefault(); last.focus();
    } else if (!event.shiftKey && document.activeElement === last) {
      event.preventDefault(); first.focus();
    }
  });
  dialog.addEventListener('click', event => {
    const box = dialog.getBoundingClientRect();
    const outside = event.clientX < box.left || event.clientX > box.right ||
      event.clientY < box.top || event.clientY > box.bottom;
    if (event.target === dialog && outside) dialog.close();
  });
  // Escape closes native dialogs. The close event handles every closing path.
  dialog.addEventListener('close', () => {
    document.body.classList.remove('newsletter-open');
    trigger?.focus();
  });
  form.addEventListener('submit', event => {
    event.preventDefault();
    form.querySelector('[data-form-status]').textContent = '';
    if (!window.FilmForms.validate(form)) return;
    form.querySelector('[data-form-status]').textContent = 'Email тексерілді! Бұл демо жазылым: хат жіберілмейді.';
  });
})();
