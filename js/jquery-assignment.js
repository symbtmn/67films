/* Assignment 6: jQuery interactions, guarded so each page stays independent. */
$(document).ready(function () {
  // Task 0. The CDN script in <head> loads before this external script.
  console.log('jQuery is ready!');
  const movies = window.FilmCatalogue || [];
  const reducedMotion = matchMedia('(prefers-reduced-motion: reduce)').matches;
  let notificationTimer;
  let copyTimer;
  let busy = false;

  function notify(message) {
    // Task 7. Cancel old work before displaying the latest notification.
    clearTimeout(notificationTimer);
    const toast = $('#jqToast');
    toast.stop(true, true).prop('hidden', false).text(message).hide();
    toast.fadeIn(reducedMotion ? 0 : 160);
    notificationTimer = setTimeout(function () {
      toast.fadeOut(reducedMotion ? 0 : 240, () => toast.prop('hidden', true));
    }, 2400);
  }

  // Task 3. Highlight every occurrence, preserving text as inert text nodes.
  function highlighted(text, query) {
    const output = $('<span>');
    if (!query) return output.text(text);
    const haystack = text.toLocaleLowerCase();
    const needle = query.toLocaleLowerCase();
    let start = 0;
    let match;
    while ((match = haystack.indexOf(needle, start)) !== -1) {
      output.append(document.createTextNode(text.slice(start, match)));
      output.append($('<mark>').text(text.slice(match, match + query.length)));
      start = match + query.length;
    }
    return output.append(document.createTextNode(text.slice(start)));
  }

  function closeSuggestions() {
    $('#jqSuggestions').prop('hidden', true);
    $('#jqSearch').attr('aria-expanded', 'false');
  }

  // Tasks 1-3. Use the complete catalogue for filtering and suggestions.
  function updateSearch(showSuggestions = true) {
    const query = $('#jqSearch').val().trim();
    const needle = query.toLocaleLowerCase();
    const matches = $(movies).filter(function (_, movie) {
      return `${movie.title} ${movie.meta} ${movie.description}`
        .toLocaleLowerCase().includes(needle);
    });
    const results = $('#jqResults').empty();
    matches.each(function (_, movie) {
      const article = $('<article class="card p-3 h-100">');
      article.append($('<h2 class="h5">').append(highlighted(movie.title, query)));
      article.append($('<p class="small text-body-secondary">')
        .append(highlighted(movie.meta, query)));
      article.append($('<p>').append(highlighted(movie.description, query)));
      article.append($('<a class="btn btn-outline-danger align-self-start mt-auto">')
        .attr('href', movie.page).text('Киноны ашу'));
      results.append($('<div class="col">').append(article));
    });
    $('#jqCount').text(`Табылған туынды: ${matches.length} / ${movies.length}`);
    $('#jqEmpty').prop('hidden', matches.length !== 0);
    const suggestions = $('#jqSuggestions').empty();
    const expanded = Boolean(showSuggestions && query && matches.length);
    suggestions.prop('hidden', !expanded);
    $('#jqSearch').attr('aria-expanded', String(expanded));
    if (expanded) matches.slice(0, 6).each(function (_, movie) {
      const button = $('<button type="button" class="list-group-item list-group-item-action w-100">')
        .text(movie.title).on('click', function () {
          $('#jqSearch').val(movie.title);
          updateSearch(false);
          $('#jqSearch').trigger('focus');
        });
      suggestions.append($('<li role="option" aria-selected="false">').append(button));
    });
    updateProgress();
  }
  $('#jqSearch').on('input', () => updateSearch()).on('keydown', function (event) {
    if (event.key === 'ArrowDown' && !$('#jqSuggestions').prop('hidden')) {
      event.preventDefault();
      $('#jqSuggestions button').first().trigger('focus');
    }
    if (event.key === 'Escape') closeSuggestions();
  });
  $('#jqSuggestions').on('keydown', 'button', function (event) {
    const buttons = $('#jqSuggestions button');
    const index = buttons.index(this);
    if (event.key === 'Escape') {
      closeSuggestions();
      $('#jqSearch').trigger('focus');
    }
    if (event.key === 'ArrowDown' || event.key === 'ArrowUp') {
      event.preventDefault();
      const direction = event.key === 'ArrowDown' ? 1 : -1;
      buttons.eq((index + direction + buttons.length) % buttons.length).trigger('focus');
    }
  });
  $(document).on('click', event => {
    if (!$(event.target).closest('#jqSearch, #jqSuggestions').length) closeSuggestions();
  });
  if ($('#jqSearch').length) updateSearch(false);

  // Task 4. Clamp progress and handle pages with no scrollable distance.
  function updateProgress() {
    const distance = document.documentElement.scrollHeight - innerHeight;
    const percent = distance > 0 ? Math.min(100, Math.max(0, scrollY / distance * 100)) : 0;
    $('#jqProgress').css('width', `${percent}%`).attr('aria-valuenow', Math.round(percent));
  }

  // Task 5. Start each counter once, when it becomes visible.
  function startCounters() {
    $('.jq-counter').each(function () {
      const counter = $(this);
      const bounds = this.getBoundingClientRect();
      if (counter.data('started') || bounds.top >= innerHeight || bounds.bottom <= 0) return;
      counter.data('started', true);
      const target = Number(counter.attr('data-target'));
      if (reducedMotion) { counter.text(target); return; }
      $({ value: 0 }).animate({ value: target }, {
        duration: 1400,
        step(value) { counter.text(Math.floor(value)); },
        complete() { counter.text(target); }
      });
    });
  }

  // Task 6. Whitespace is empty; never start the spinner for invalid input.
  $('#jqForm').attr('novalidate', 'novalidate');
  $('#jqName, #jqMessage').on('input', function () {
    this.setCustomValidity('');
    $(this).removeAttr('aria-invalid');
    $('#jqFormStatus').text('');
  });
  $('#jqForm').on('submit', function (event) {
    event.preventDefault();
    if (busy) return;
    const name = $('#jqName')[0];
    const message = $('#jqMessage')[0];
    name.value = name.value.trim();
    message.value = message.value.trim();
    name.setCustomValidity(name.value.length < 2 ? 'Атыңызды кемінде екі таңбамен жазыңыз.' : '');
    message.setCustomValidity(message.value ? '' : 'Кино атауын немесе ұсынысыңызды жазыңыз.');
    const invalid = [name, message].find(field => !field.checkValidity());
    if (invalid) {
      $('#jqFormStatus').text(invalid.validationMessage);
      $(invalid).attr('aria-invalid', 'true').trigger('focus');
      return;
    }
    busy = true;
    const button = $('#jqSubmit');
    button.prop('disabled', true).attr('aria-busy', 'true').empty()
      .append($('<span class="jq-spinner" aria-hidden="true">'), document.createTextNode(' Please wait…'));
    $('#jqFormStatus').text('Өтінім тексерілуде…');
    setTimeout(function () {
      busy = false;
      button.prop('disabled', false).removeAttr('aria-busy').text('Жіберу');
      $('#jqFormStatus').text('Демо өтінім тексерілді. Серверге жіберілген жоқ.');
      notify('Өтінім сәтті тексерілді!');
    }, 1500);
  });

  // Task 7. A toast confirms a real, persistent watchlist change.
  let saved = [];
  try {
    const value = JSON.parse(localStorage.getItem('67films-jq-watchlist') || '[]');
    if (Array.isArray(value)) saved = value.filter(id => movies.some(movie => movie.id === id));
  } catch { /* Storage restrictions leave the current visit functional. */ }
  $('#jqWatchMovie').append(movies.map(movie => $('<option>').val(movie.id).text(movie.title)));
  function showWatchlist() {
    const list = $('#jqSavedList').empty();
    movies.filter(movie => saved.includes(movie.id)).forEach(movie => list.append($('<li>').text(movie.title)));
    $('#jqSavedCount').text(`Сақталған туынды: ${saved.length}`);
    $('#jqNotify').text(saved.includes($('#jqWatchMovie').val()) ? 'Тізімнен алып тастау' : 'Тізімге қосу');
  }
  $('#jqWatchMovie').on('change', showWatchlist);
  $('#jqNotify').on('click', function () {
    const id = $('#jqWatchMovie').val();
    const exists = saved.includes(id);
    saved = exists ? saved.filter(item => item !== id) : [...saved, id];
    let persisted = true;
    try { localStorage.setItem('67films-jq-watchlist', JSON.stringify(saved)); } catch { persisted = false; }
    showWatchlist();
    notify(exists ? 'Туынды тізімнен алынды.' : persisted ? 'Туынды көру тізіміне сақталды!' : 'Туынды осы беттегі тізімге қосылды. Браузер тұрақты сақтауды бұғаттады.');
  });
  showWatchlist();

  // Task 8. Only show the checkmark after the clipboard operation succeeds.
  $('#jqCopy').on('click', async function () {
    const button = $(this);
    try {
      await navigator.clipboard.writeText($('#jqShare').text().trim());
      clearTimeout(copyTimer);
      button.text('✓ Көшірілді').attr('aria-label', 'Мәтін көшірілді');
      $('#jqCopyTip').prop('hidden', false);
      notify('Мәтін clipboard-қа көшірілді!');
      copyTimer = setTimeout(function () {
        button.text('Көшіру').attr('aria-label', 'Мәтінді көшіру');
        $('#jqCopyTip').prop('hidden', true);
      }, 2500);
    } catch {
      $('#jqCopyTip').prop('hidden', true);
      notify('Көшіруге рұқсат берілмеді. Мәтінді қолмен көшіріңіз.');
    }
  });

  // Task 9. Unique catalogue posters stay placeholders until intersecting the viewport.
  const placeholder = 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="240" height="340"%3E%3C/svg%3E';
  if ($('#jqLazyGrid').length) movies.forEach(function (movie) {
    const image = $('<img class="jq-lazy">').attr({ src: placeholder, 'data-src': movie.poster,
      alt: `${movie.title} постері`, width: 240, height: 340 });
    $('#jqLazyGrid').append($('<figure class="col">').append(image, $('<figcaption class="small mt-2">').text(movie.title)));
  });
  function loadVisibleImages() {
    $('.jq-lazy[data-src]').filter(function () {
      const top = $(this).offset().top;
      return top < scrollY + innerHeight && top + $(this).outerHeight() > scrollY;
    }).each(function () {
      const image = $(this);
      image.one('load', () => image.addClass('is-loaded'));
      image.one('error', () => image.attr('alt', 'Сурет ашылмады'));
      image.attr('src', image.attr('data-src')).removeAttr('data-src');
    });
  }
  if ($('#jqReading').length) movies.slice(0, 12).forEach(function (movie) {
    $('#jqReading').append($('<article class="card p-4 mb-4">')
      .append($('<h2 class="h5">').text(movie.title), $('<p>').text(movie.description)));
  });
  $(window).on('scroll resize', function () {
    updateProgress();
    startCounters();
    loadVisibleImages();
  });
  updateProgress();
  startCounters();
  loadVisibleImages();
});
