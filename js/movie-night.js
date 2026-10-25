/* Assignment 5: custom DOM, events, callbacks and state for the cinema planner. */
'use strict';
(() => {
  const root = document.getElementById('nightApp');
  if (!root || !window.NightMovies) return;
  const select = selector => root.querySelector(selector);
  const selectAll = selector => [...root.querySelectorAll(selector)];
  const catalog = {
    movies: window.NightMovies,
    find(id) { return this.movies.find(movie => movie.id === id); },
    byCategory(category) {
      // The switch maps user choices to movie-filtering rules.
      switch (category) {
        case 'science': return this.movies.filter(movie => movie.category === 'science');
        case 'family': return this.movies.filter(movie => movie.category === 'family');
        case 'anime': return this.movies.filter(movie => movie.category === 'anime');
        default: return [...this.movies];
      }
    }
  };
  const storageKey = '67films-night-ratings';
  const state = { selectedId: catalog.movies[0].id, filter: 'all', step: 0, ratings: {}, confirmed: false };
  try {
    const saved = JSON.parse(localStorage.getItem(storageKey) || '{}');
    // Ignore stale, unknown or corrupted persisted values.
    for (const movie of catalog.movies) {
      if (Number.isInteger(saved?.[movie.id]) && saved[movie.id] >= 1 && saved[movie.id] <= 5) {
        state.ratings[movie.id] = saved[movie.id];
      }
    }
  } catch { /* Ratings still work for this visit when storage is unavailable. */ }

  function element(tag, className, text) {
    const node = document.createElement(tag);
    if (className) node.className = className;
    if (text !== undefined) node.textContent = text;
    return node;
  }

  function animate(node, className = 'night-enter') {
    node.classList.remove(className);
    // Finish the previous layout so the CSS animation restarts on repeat actions.
    void node.offsetWidth;
    node.classList.add(className);
  }

  function renderCards() {
    const movies = catalog.byCategory(state.filter);
    const fragment = document.createDocumentFragment();
    // A for...of loop generates the cards from an array of movie objects.
    for (const movie of movies) {
      const button = element('button', 'night-film-card');
      button.type = 'button';
      button.dataset.nightMovie = movie.id;
      button.setAttribute('aria-label', `${movie.title} — таңдау`);
      button.setAttribute('aria-pressed', String(movie.id === state.selectedId));
      button.classList.toggle('is-selected', movie.id === state.selectedId);
      const poster = element('img');
      poster.src = movie.poster;
      poster.alt = `${movie.title} постері`;
      poster.width = 240;
      poster.height = 170;
      const info = element('span', 'night-film-info');
      info.append(element('small', '', movie.categoryLabel), element('strong', '', movie.title),
        element('small', '', `${movie.year} · ${movie.duration}`),
        element('span', 'night-pick-label', movie.id === state.selectedId ? 'Таңдалды ✓' : 'Осы киноны таңдау ↗'));
      button.append(poster, info);
      button.addEventListener('click', () => chooseMovie(movie.id));
      fragment.append(button);
    }
    select('#nightFilmGrid').replaceChildren(fragment);
    select('#nightCount').textContent = `${movies.length} туынды табылды`;
  }

  function renderSelection() {
    const movie = catalog.find(state.selectedId);
    const poster = select('#selectedPoster');
    // Attribute manipulation: the selected thumbnail changes the large image and link.
    poster.setAttribute('src', movie.poster);
    poster.setAttribute('alt', `${movie.title} постері`);
    select('#selectedTitle').textContent = movie.title;
    select('#selectedCategory').textContent = movie.categoryLabel;
    select('#selectedMeta').textContent = `${movie.year} · ${movie.duration}`;
    select('#selectedLink').setAttribute('href', movie.page);
    select('#selectedDescription').textContent = movie.teaser;
    select('#selectedExtra').textContent = movie.description;
    select('#selectedExtra').hidden = true;
    select('#readMore').setAttribute('aria-expanded', 'false');
    select('#readMore').textContent = 'Толығырақ оқу';
    renderRating();
  }

  function chooseMovie(id) {
    if (!catalog.find(id)) return;
    state.selectedId = id;
    // Update existing buttons rather than replacing a focused thumbnail.
    selectAll('[data-night-movie]').forEach(button => {
      const active = button.dataset.nightMovie === id;
      button.classList.toggle('is-selected', active);
      button.setAttribute('aria-pressed', String(active));
      button.querySelector('.night-pick-label').textContent = active ? 'Таңдалды ✓' : 'Осы киноны таңдау ↗';
    });
    renderSelection();
    select('#nightAnnouncement').textContent = `Таңдалған кино: ${catalog.find(id).title}.`;
    if (state.step === 2) renderReview();
    invalidateTicket();
    animate(select('#nightSelection'));
  }

  function renderRating() {
    const rating = state.ratings[state.selectedId] || 0;
    const stars = selectAll('[data-night-star]');
    for (let index = 0; index < stars.length; index++) {
      stars[index].classList.toggle('is-filled', index < rating);
      stars[index].setAttribute('aria-checked', String(index + 1 === rating));
      stars[index].tabIndex = index === (rating ? rating - 1 : 0) ? 0 : -1;
    }
    select('#nightRatingText').textContent = rating ? `Бағаңыз: ${rating} / 5. Осы браузерде сақталады.` : 'Әлі баға берілген жоқ.';
    select('#clearNightRating').disabled = rating === 0;
  }

  function setRating(rating) {
    if (rating) state.ratings[state.selectedId] = rating;
    else delete state.ratings[state.selectedId];
    try { localStorage.setItem(storageKey, JSON.stringify(state.ratings)); } catch { /* Session-only fallback. */ }
    renderRating();
    animate(select('#nightStars'));
    window.NightSound?.play();
  }

  selectAll('[data-night-filter]').forEach(button => {
    button.addEventListener('click', () => {
      state.filter = button.dataset.nightFilter;
      selectAll('[data-night-filter]').forEach(item => {
        const active = item === button;
        item.classList.toggle('is-active', active);
        item.setAttribute('aria-pressed', String(active));
      });
      renderCards();
      animate(select('#nightFilmGrid'));
    });
  });
  select('#surpriseFilm').addEventListener('click', () => {
    const candidates = catalog.byCategory(state.filter).filter(movie => movie.id !== state.selectedId);
    if (candidates.length) chooseMovie(candidates[Math.floor(Math.random() * candidates.length)].id);
    select('#nightSelection').scrollIntoView({ block: 'start' });
  });
  select('#readMore').addEventListener('click', () => {
    const extra = select('#selectedExtra');
    extra.hidden = !extra.hidden;
    select('#readMore').setAttribute('aria-expanded', String(!extra.hidden));
    select('#readMore').textContent = extra.hidden ? 'Толығырақ оқу' : 'Қысқарту';
  });
  selectAll('[data-night-star]').forEach(button => {
    button.addEventListener('click', () => setRating(Number(button.dataset.nightStar)));
  });
  select('#clearNightRating').addEventListener('click', () => {
    setRating(0);
    select('[data-night-star="1"]').focus();
  });
  select('#nightStars').addEventListener('keydown', event => {
    const stars = selectAll('[data-night-star]');
    let index = stars.indexOf(document.activeElement);
    if (index < 0) return;
    switch (event.key) {
      case 'ArrowRight': case 'ArrowUp': index = (index + 1) % stars.length; break;
      case 'ArrowLeft': case 'ArrowDown': index = (index - 1 + stars.length) % stars.length; break;
      case 'Home': index = 0; break;
      case 'End': index = stars.length - 1; break;
      default: return;
    }
    event.preventDefault();
    stars[index].focus();
    setRating(index + 1);
  });

  // Keyboard navigation is scoped to this actual section navigation menu.
  const menu = select('#nightMenu');
  menu.addEventListener('keydown', event => {
    const links = [...menu.querySelectorAll('a')];
    let index = links.indexOf(document.activeElement);
    if (index < 0) return;
    switch (event.key) {
      case 'ArrowRight': case 'ArrowDown': index = (index + 1) % links.length; break;
      case 'ArrowLeft': case 'ArrowUp': index = (index - 1 + links.length) % links.length; break;
      case 'Home': index = 0; break;
      case 'End': index = links.length - 1; break;
      default: return;
    }
    event.preventDefault();
    links[index].focus();
  });

  const form = select('#nightPlanForm');
  const steps = selectAll('[data-night-step]');
  const host = select('#nightName');
  const date = select('#nightDate');
  function today() {
    const local = new Date();
    return `${local.getFullYear()}-${String(local.getMonth() + 1).padStart(2, '0')}-${String(local.getDate()).padStart(2, '0')}`;
  }
  date.min = today();
  date.value = today();

  function validateStep(index) {
    if (index === 0) {
      const value = host.value.trim();
      host.setCustomValidity(/^[\p{L}\p{M}]+(?:[ '\u2019-][\p{L}\p{M}]+)*$/u.test(value) && value.length >= 2
        ? '' : 'Атыңызды кемінде екі әріппен жазыңыз.');
    }
    if (index === 1) date.min = today();
    // Disabled hidden steps must be enabled briefly for final constraint checks.
    const wasDisabled = steps[index].disabled;
    steps[index].disabled = false;
    const inputs = [...steps[index].querySelectorAll('input, select')];
    const invalid = inputs.find(input => !input.checkValidity());
    steps[index].disabled = wasDisabled;
    if (invalid) {
      state.step = index;
      renderStep(index);
      select('#nightPlanError').textContent = invalid.validationMessage;
      select('#nightPlanError').hidden = false;
      invalid.setAttribute('aria-invalid', 'true');
      invalid.focus();
      return false;
    }
    inputs.forEach(input => input.removeAttribute('aria-invalid'));
    select('#nightPlanError').hidden = true;
    return true;
  }

  function planValues() {
    return { name: host.value.trim(), guests: select('#nightGuests').value,
      date: date.value, time: select('#nightTime').value, snack: select('#nightSnack').value,
      movie: catalog.find(state.selectedId) };
  }

  function fillDetails(target, plan) {
    const entries = [ ['Кино', plan.movie.title], ['Қонақтар', `${plan.guests} адам`],
      ['Күні', plan.date.split('-').reverse().join('.')], ['Уақыты', plan.time], ['Дәмді қосымша', plan.snack] ];
    target.replaceChildren();
    entries.forEach(([label, value]) => target.append(element('dt', '', label), element('dd', '', value)));
  }

  function renderReview() {
    const plan = planValues();
    // User-provided names go into textContent, never HTML.
    select('#nightGreeting').textContent = `${plan.name}, кино кешіңізді тексеріңіз!`;
    fillDetails(select('#nightReview'), plan);
  }

  function renderStep(index) {
    steps.forEach((panel, panelIndex) => {
      panel.hidden = panelIndex !== index;
      panel.disabled = panelIndex !== index;
    });
    selectAll('#nightSteps li').forEach((item, itemIndex) => {
      if (itemIndex === index) item.setAttribute('aria-current', 'step');
      else item.removeAttribute('aria-current');
    });
    select('#nightBack').hidden = index === 0;
    select('#nightNext').hidden = index === steps.length - 1;
    select('#nightSubmit').hidden = index !== steps.length - 1;
    select('#stepStatus').textContent = `${index + 1} / ${steps.length} қадам`;
    select('#nightPlanError').hidden = true;
    if (index === 2) renderReview();
    animate(steps[index]);
    steps[index].querySelector('legend').focus();
  }

  // Higher-order function: onChange is a callback, invoked after state changes.
  function goToStep(nextStep, onChange) {
    if (nextStep < 0 || nextStep >= steps.length) return;
    if (nextStep > state.step && !validateStep(state.step)) return;
    state.step = nextStep;
    onChange(state.step);
  }
  select('#nightNext').addEventListener('click', () => goToStep(state.step + 1, renderStep));
  select('#nightBack').addEventListener('click', () => goToStep(state.step - 1, renderStep));

  function invalidateTicket() {
    if (!state.confirmed) return;
    state.confirmed = false;
    select('#nightTicket').hidden = true;
    select('#nightSubmit').disabled = false;
  }
  form.addEventListener('input', event => {
    if (event.target === host) host.setCustomValidity('');
    event.target.removeAttribute('aria-invalid');
    select('#nightPlanError').hidden = true;
    invalidateTicket();
  });
  form.addEventListener('submit', event => {
    event.preventDefault();
    // Enter on earlier steps advances safely instead of bypassing validation.
    if (state.step < 2) { goToStep(state.step + 1, renderStep); return; }
    if (!validateStep(0) || !validateStep(1)) return;
    const plan = planValues();
    select('#ticketMessage').textContent = `${plan.name}, таңдауыңыз — «${plan.movie.title}».`;
    fillDetails(select('#ticketDetails'), plan);
    const ticket = select('#nightTicket');
    ticket.hidden = false;
    state.confirmed = true;
    select('#nightSubmit').disabled = true;
    animate(ticket, 'night-ticket-ready');
    select('#ticketHeading').focus();
    window.NightSound?.play();
  });
  select('#nightRestart').addEventListener('click', () => {
    form.reset();
    host.setCustomValidity('');
    date.min = today();
    date.value = today();
    invalidateTicket();
    goToStep(0, renderStep);
  });

  renderCards();
  renderSelection();
})();
