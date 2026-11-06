/* Final project: every rule runs in JavaScript, with inline accessible feedback. */
(function (root) {
  'use strict';
  const rules = {
    email(value) { return /^[a-z0-9]+(?:[._%+-][a-z0-9]+)*@(?:[a-z0-9](?:[a-z0-9-]*[a-z0-9])?\.)+[a-z]{2,63}$/i.test(value); },
    name(value) { return value.length >= 2 && value.length <= 80 && /^[\p{L}\p{M}]+(?:[ '\u2019-][\p{L}\p{M}]+)*$/u.test(value); },
    password(value) { return value.length >= 8 && value.length <= 64 && /[a-z]/.test(value) && /[A-Z]/.test(value) && /\d/.test(value) && /[^a-zA-Z0-9\s]/.test(value) && !/\s/.test(value); },
    phone(value) { return /^\+7\d{10}$/.test(this.normalizePhone(value)); },
    normalizePhone(value) { const digits = String(value).replace(/[\s().-]/g, ''); return /^8\d{10}$/.test(digits) ? '+7' + digits.slice(1) : digits; }
  };
  if (typeof module !== 'undefined' && module.exports) module.exports = rules;
  if (!root.document) return;
  const text = message => root.FilmLanguage?.t(message) || message;
  const fieldsOf = container => [...container.querySelectorAll('input,textarea,select')].filter(field => !field.disabled && !['submit','button','reset','hidden'].includes(field.type));
  function messageFor(field, form) {
    const value = (field.type === 'password' || field.dataset.rule === 'password' || field.dataset.match) ? field.value : field.value.trim();
    if (field.type === 'checkbox') return field.hasAttribute('data-required') && !field.checked ? 'Келісім белгісін қойыңыз.' : '';
    if (!value) return field.hasAttribute('data-required') ? 'Бұл өрісті толтырыңыз.' : '';
    const rule = field.dataset.rule;
    if ((rule === 'name' || field.autocomplete === 'name') && !rules.name(value)) return 'Атыңызды 2–80 әріппен жазыңыз.';
    if (rule === 'email' && !rules.email(value)) return 'Дұрыс email енгізіңіз, мысалы: viewer@example.com.';
    if (rule === 'phone' && !rules.phone(value)) return 'Телефонды +7 777 123 45 67 форматында жазыңыз.';
    if (rule === 'password' && !rules.password(value)) return 'Құпиясөз: 8–64 таңба, үлкен және кіші латын әрпі, сан және арнайы белгі. Бос орын қолданбаңыз.';
    if (field.dataset.match && value !== form.querySelector('#' + field.dataset.match)?.value) return 'Құпиясөздер бірдей болуы керек.';
    if (field.dataset.minlength && value.length < Number(field.dataset.minlength)) return text('Кемінде {count} таңба енгізіңіз.').replace('{count}', field.dataset.minlength);
    if (field.dataset.maxlength && value.length > Number(field.dataset.maxlength)) return text('Ең көбі {count} таңба енгізіңіз.').replace('{count}', field.dataset.maxlength);
    return '';
  }
  function renderError(field, message) {
    const id = field.id + '-error';
    let error = document.getElementById(id);
    if (!error) { error = document.createElement('div'); error.id = id; error.className = 'invalid-feedback d-block'; (field.closest('.input-group') || field).after(error); }
    const descriptions = new Set((field.getAttribute('aria-describedby') || '').split(/\s+/).filter(Boolean)); descriptions.add(id);
    field.setAttribute('aria-describedby', [...descriptions].join(' ')); field.setAttribute('aria-invalid', String(Boolean(message)));
    field.classList.toggle('is-invalid', Boolean(message)); error.textContent = text(message); error.hidden = !message;
  }
  function summary(form) {
    const count = fieldsOf(form).filter(field => field.getAttribute('aria-invalid') === 'true').length;
    let box = form.querySelector('[data-error-summary]');
    if (!box) { box = document.createElement('div'); box.dataset.errorSummary = ''; box.className = 'alert alert-danger'; box.setAttribute('role','alert'); form.prepend(box); }
    box.hidden = count === 0; box.textContent = count ? text('Белгіленген өрістердегі қателерді түзетіңіз.') : ''; return count;
  }
  function validate(form) {
    form.dataset.submitted = 'true'; fieldsOf(form).forEach(field => renderError(field, messageFor(field, form)));
    const valid = summary(form) === 0;
    if (!valid) fieldsOf(form).find(field => field.getAttribute('aria-invalid') === 'true')?.focus();
    return valid;
  }
  function clear(form) {
    delete form.dataset.submitted; fieldsOf(form).forEach(field => renderError(field, '')); summary(form);
    form.querySelector('[data-form-status]')?.replaceChildren();
  }
  root.FilmForms = { rules, validate, clear, renderError, messageFor, summary };
  document.querySelectorAll('form').forEach(form => {
    form.setAttribute('novalidate','');
    form.addEventListener('input', event => {
      const field = event.target; if (!field.matches('input,textarea,select')) return;
      if (form.dataset.submitted === 'true') {
        renderError(field, messageFor(field, form));
        fieldsOf(form).filter(other => other.dataset.match === field.id).forEach(other => renderError(other, messageFor(other, form))); summary(form);
      }
    });
    form.addEventListener('change', event => { if (form.dataset.submitted === 'true' && event.target.matches('input,select')) { renderError(event.target, messageFor(event.target,form)); summary(form); } });
    form.addEventListener('reset', () => clear(form));
    // The multi-step planner validates its active step in movie-night.js.
    if (form.id !== 'nightPlanForm') form.addEventListener('submit', event => {
      if (!validate(form)) { event.preventDefault(); event.stopImmediatePropagation(); }
    }, { capture: true });
  });
})(typeof window !== 'undefined' ? window : globalThis);
