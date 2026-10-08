/* Shared, guarded functionality: every page may contain a different component. */
'use strict';
(() => {
  const storage = {
    get(key) { try { return localStorage.getItem(key); } catch { return null; } },
    set(key, value) { try { localStorage.setItem(key, value); } catch { /* session still works */ } }
  };
  const themeButton = document.getElementById('theme-toggle');
  function applyTheme(dark) {
    document.documentElement.setAttribute('data-bs-theme', dark ? 'dark' : 'light');
    document.body.classList.toggle('dark-mode', dark);
    if (themeButton) {
      themeButton.textContent = dark ? 'Күндізгі режим' : 'Түнгі режим';
      themeButton.setAttribute('aria-pressed', String(dark));
    }
  }
  applyTheme(storage.get('67films-theme') === 'dark');
  themeButton?.addEventListener('click', () => {
    const dark = document.documentElement.getAttribute('data-bs-theme') !== 'dark';
    applyTheme(dark);
    storage.set('67films-theme', dark ? 'dark' : 'light');
  });

  // Initialise manually; no autoplay, so there is no moving content to pause.
  const carousel = document.getElementById('movieCarousel');
  if (carousel && window.bootstrap) new bootstrap.Carousel(carousel, { interval: false });

  // Framework-free Assignment 2: native disclosure stays compact on mobile.
  const trends = document.querySelector('.trending-details');
  if (trends) {
    const desktop = matchMedia('(min-width: 992px)');
    const update = () => { trends.open = desktop.matches; };
    update();
    desktop.addEventListener('change', update);
  }

  // Search from any page submits to index.html?q=...; only index has live filtering.
  const input = document.getElementById('navSearch');
  const items = document.querySelectorAll('.movie-item');
  const isCatalog = document.getElementById('catalogTitle');
  if (input && isCatalog) {
    input.value = new URLSearchParams(location.search).get('q') || '';
    const filter = () => {
      const query = input.value.toLocaleLowerCase().trim();
      let count = 0;
      items.forEach(item => {
        const show = item.dataset.search.toLocaleLowerCase().includes(query);
        item.hidden = !show;
        if (show) count++;
      });
      const empty = document.getElementById('noResults');
      if (empty) empty.hidden = count !== 0;
      document.getElementById('searchSummary').textContent = query ? `Табылған туынды: ${count}` : `Барлығы ${count} туынды`;
    };
    input.addEventListener('input', filter);
    filter();
  }

  const movieSection = document.querySelector('[data-movie]');
  if (movieSection) {
    const key = `67films-movie:${movieSection.dataset.movie}`;
    let saved = {};
    try {
      const parsed = JSON.parse(storage.get(key) || '{}');
      if (parsed && typeof parsed === 'object' && !Array.isArray(parsed)) saved = parsed;
    } catch { /* ignore corrupt saved data */ }
    const feedback = document.getElementById('feedbackText');
    const ratingBox = document.getElementById('ratingBox');
    const messages = {
      watching: 'Көріліміңіз сәтті өтсін!', watched: 'Киноны көрдіңіз. Бағаңызды беріңіз.',
      will_watch: 'Туынды көру жоспарыңызға қосылды.', dropped: 'Көруді тоқтаттыңыз.',
      not_watched: 'Бұл туындыны әлі көрген жоқсыз.'
    };
    function setStatus(value, persist = true) {
      saved.status = Object.hasOwn(messages, value) ? value : 'not_watched';
      movieSection.querySelectorAll('[data-status]').forEach(button => {
        const active = button.dataset.status === saved.status;
        button.classList.toggle('active', active);
        button.setAttribute('aria-pressed', String(active));
      });
      feedback.textContent = messages[saved.status];
      ratingBox.hidden = saved.status !== 'watched';
      if (persist) storage.set(key, JSON.stringify(saved));
    }
    movieSection.querySelectorAll('[data-status]').forEach(button => button.addEventListener('click', () => setStatus(button.dataset.status)));
    movieSection.querySelectorAll('input[name="rating"]').forEach(radio => {
      if (Number(radio.value) === saved.rating) radio.checked = true;
      radio.addEventListener('change', () => {
        saved.rating = Number(radio.value);
        document.getElementById('ratingResult').textContent = `Бағаңыз: ${saved.rating} / 5`;
        storage.set(key, JSON.stringify(saved));
      });
    });
    if (saved.rating) document.getElementById('ratingResult').textContent = `Бағаңыз: ${saved.rating} / 5`;
    setStatus(saved.status, false);
  }

  const form = document.getElementById('contact-form');
  if (form) {
    form.addEventListener('submit', event => {
      event.preventDefault();
      if (!form.reportValidity()) return;
      const data = new FormData(form);
      // Escape every field. Formula-leading strings remain inert in spreadsheet apps.
      const cell = value => {
        let text = String(value ?? '');
        if (/^[\s]*[=+@-]/.test(text)) text = `'${text}`;
        return `"${text.replace(/"/g, '""')}"`;
      };
      const columns = ['username', 'email', 'category', 'contentType', 'message'];
      const csv = '\ufeff' + ['Аты,Email,Санат,Туынды түрі,Хабарлама', columns.map(name => cell(data.get(name))).join(',')].join('\r\n');
      const url = URL.createObjectURL(new Blob([csv], { type: 'text/csv;charset=utf-8;' }));
      const link = document.createElement('a');
      link.href = url;
      link.download = '67films-feedback.csv';
      document.body.append(link);
      link.click();
      link.remove();
      setTimeout(() => URL.revokeObjectURL(url), 1000);
      document.getElementById('formStatus').textContent = 'CSV файлы дайын. Хабарлама серверге жіберілген жоқ.';
    });
    form.addEventListener('reset', () => { document.getElementById('formStatus').textContent = ''; });
  }
})();
