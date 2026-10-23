/* Assignment 4, Task 1: explicit client-side validation, shared with the popup. */
'use strict';
(() => {
  const MIN_PASSWORD_LENGTH = 8;
  const fieldsOf = form => [...form.querySelectorAll('[data-validate-field]')];
  function errorMessage(field, form) {
    const value = field.type === 'password' ? field.value : field.value.trim();
    if (field.type === 'checkbox') return field.checked ? '' : 'Келісім белгісін қойыңыз.';
    if (!value) return 'Бұл өрісті толтырыңыз.';
    // Names allow Unicode letters (including Kazakh), spaces, hyphens and apostrophes.
    if (field.autocomplete === 'name' &&
        !/^[\p{L}\p{M}]+(?:[ '\u2019-][\p{L}\p{M}]+)*$/u.test(value)) {
      return 'Атыңызды әріптермен жазыңыз, мысалы: Сымбат.';
    }
    const emailPattern = /^[a-z0-9]+(?:[._%+-][a-z0-9]+)*@(?:[a-z0-9](?:[a-z0-9-]*[a-z0-9])?\.)+[a-z]{2,63}$/i;
    if (field.type === 'email' && !emailPattern.test(value)) {
      return 'Дұрыс email енгізіңіз, мысалы: viewer@example.com.';
    }
    if (field.dataset.rule === 'password' && value.length < MIN_PASSWORD_LENGTH) {
      return `Құпиясөз кемінде ${MIN_PASSWORD_LENGTH} таңбадан тұруы керек.`;
    }
    if (field.dataset.match && value !== form.querySelector(`#${field.dataset.match}`).value) {
      return 'Құпиясөздер бірдей болуы керек.';
    }
    if (field.type !== 'password' && field.minLength > 0 && value.length < field.minLength) {
      return `Кемінде ${field.minLength} таңба енгізіңіз.`;
    }
    return '';
  }
  function renderError(field, message) {
    const error = document.getElementById(`${field.id}-error`);
    field.classList.toggle('is-invalid', Boolean(message));
    field.setAttribute('aria-invalid', String(Boolean(message)));
    if (error) { error.textContent = message; error.hidden = !message; }
  }
  function updateSummary(form) {
    const count = fieldsOf(form).filter(field => field.classList.contains('is-invalid')).length;
    const summary = form.querySelector('[data-error-summary]');
    if (summary) {
      summary.hidden = count === 0;
      summary.textContent = `Қателерді түзетіңіз: ${count} өрісті тексеру қажет.`;
    }
    return count;
  }
  function validate(form) {
    form.dataset.submitted = 'true';
    fieldsOf(form).forEach(field => renderError(field, errorMessage(field, form)));
    const valid = updateSummary(form) === 0;
    if (!valid) fieldsOf(form).find(field => field.classList.contains('is-invalid')).focus();
    return valid;
  }
  function clear(form) {
    delete form.dataset.submitted;
    fieldsOf(form).forEach(field => renderError(field, ''));
    updateSummary(form);
    form.querySelector('[data-form-status]')?.replaceChildren();
  }
  // Public helper: newsletter.js uses exactly the same error rendering rules.
  window.FilmForms = { validate, clear };
  document.querySelectorAll('[data-js-validation]').forEach(form => {
    // With JavaScript disabled, the HTML required/type/minlength rules still apply.
    form.noValidate = true;
    form.addEventListener('input', event => {
      if (form.dataset.submitted !== 'true' || !event.target.matches('[data-validate-field]')) return;
      renderError(event.target, errorMessage(event.target, form));
      fieldsOf(form).filter(field => field.dataset.match === event.target.id)
        .forEach(field => renderError(field, errorMessage(field, form)));
      updateSummary(form);
    });
    form.addEventListener('reset', () => clear(form));
  });
  const memberForm = document.getElementById('member-form');
  if (!memberForm) return;
  const password = memberForm.querySelector('[data-rule="password"]');
  password.minLength = MIN_PASSWORD_LENGTH;
  document.getElementById('passwordHint').textContent = `Кемінде ${MIN_PASSWORD_LENGTH} таңба. Демо үшін ойдан шығарылған құпиясөз қолданыңыз.`;
  memberForm.addEventListener('submit', event => {
    event.preventDefault();
    const status = memberForm.querySelector('[data-form-status]');
    status.textContent = '';
    if (!validate(memberForm)) return;
    // This static teaching demo never creates an account or saves a password.
    password.value = '';
    document.getElementById('memberConfirm').value = '';
    clear(memberForm);
    status.textContent = 'Тексеру сәтті өтті! Демо өтінім қабылданды. Нақты аккаунт жасалған жоқ.';
  });
})();
