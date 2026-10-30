/* Assignment 5: independent movie selection, gallery, rating and planner pages. */
'use strict';
(() => {
  const root = document.getElementById('nightApp');
  if (!root || !window.NightMovies) return;
  const $ = selector => root.querySelector(selector);
  const $$ = selector => [...root.querySelectorAll(selector)];
  const t = (text, values) => window.FilmLanguage.t(text, values);
  const catalog = {
    movies: window.NightMovies,
    find(id) { return this.movies.find(movie => movie.id === id) || this.movies[0]; },
    filter(category) {
      switch (category) {
        case 'science': case 'family': case 'anime': return this.movies.filter(movie => movie.category === category);
        default: return this.movies;
      }
    }
  };
  const store = {
    get(key) { try { return localStorage.getItem(key); } catch { return null; } },
    set(key, value) { try { localStorage.setItem(key, value); } catch { /* Session fallback. */ } }
  };
  const state = { movie: catalog.find(store.get('67films-night-selected')), category: 'all', step: 0, ratings: {} };
  try {
    const saved = JSON.parse(store.get('67films-night-ratings') || '{}');
    for (const movie of catalog.movies) if (Number.isInteger(saved?.[movie.id]) && saved[movie.id] >= 1 && saved[movie.id] <= 5) state.ratings[movie.id] = saved[movie.id];
  } catch { /* Ignore invalid stored data. */ }
  function node(tag, text, className) {
    const el = document.createElement(tag); if (text) el.textContent = text; if (className) el.className = className; return el;
  }
  function animate(el, name = 'night-enter') { if (!el) return; el.classList.remove(name); void el.offsetWidth; el.classList.add(name); }
  function choose(id) {
    state.movie = catalog.find(id); store.set('67films-night-selected', state.movie.id);
    render(); invalidateTicket();
    animate($('#nightSelection') || $('#galleryLarge'));
  }
  function renderCards() {
    if (!$('#nightFilmGrid')) return;
    const list = catalog.filter(state.category);
    $('#nightFilmGrid').replaceChildren();
    for (const movie of list) {
      const card = node('button', '', 'night-film-card'); card.type = 'button';
      card.dataset.nightMovie = movie.id; card.setAttribute('aria-pressed', String(movie.id === state.movie.id));
      card.classList.toggle('is-selected', movie.id === state.movie.id);
      const img = node('img'); img.src = movie.poster; img.alt = movie.title; img.width = 240; img.height = 170;
      const info = node('span', '', 'night-film-info');
      info.append(node('small', t(movie.categoryLabel)), node('strong', movie.title), node('small', movie.year), node('span', t(movie.id === state.movie.id ? 'Таңдалды ✓' : 'Осы киноны таңдау ↗'), 'night-pick-label'));
      card.append(img, info); card.addEventListener('click', () => { choose(movie.id); $('#selectionStatus').textContent = t('Таңдалған кино: {title}', {title:movie.title}); });
      $('#nightFilmGrid').append(card);
    }
    $('#nightCount').textContent = t('Табылған туынды: {count}', {count:list.length});
  }
  if ($('#nightFilmGrid')) $('#nightFilmGrid').after(node('p', '', 'small mt-3'));
  if ($('#nightFilmGrid')) $('#nightFilmGrid').nextElementSibling.id = 'selectionStatus';
  $$('[data-night-filter]').forEach(button => button.addEventListener('click', () => {
    state.category = button.dataset.nightFilter;
    $$('[data-night-filter]').forEach(other => { const active = other === button; other.setAttribute('aria-pressed', String(active)); other.classList.toggle('is-active', active); });
    renderCards(); animate($('#nightFilmGrid'));
  }));
  $('#surpriseFilm')?.addEventListener('click', () => {
    const options = catalog.filter(state.category).filter(movie => movie.id !== state.movie.id);
    if (options.length) choose(options[Math.floor(Math.random() * options.length)].id);
    $('#selectionStatus').textContent = t('Таңдалған кино: {title}', {title:state.movie.title});
  });
  const picker = $('#featureMovie');
  if (picker) {
    catalog.movies.forEach(movie => { const option = node('option', movie.title); option.value = movie.id; picker.append(option); });
    picker.value = state.movie.id; picker.addEventListener('change', () => choose(picker.value));
  }
  function renderGallery() {
    if (!$('#galleryLarge')) return;
    $('#galleryLarge').setAttribute('src', state.movie.poster);
    $('#galleryLarge').setAttribute('alt', state.movie.title);
    $('#galleryTitle').textContent = state.movie.title; $('#galleryLink').href = state.movie.page;
    $('#galleryStatus').textContent = t('Таңдалған кино: {title}', {title:state.movie.title});
    if (!$('#galleryThumbs').children.length) catalog.movies.forEach(movie => {
      const button = node('button', '', 'gallery-thumbnail'); button.type = 'button'; button.dataset.thumbnail = movie.id;
      button.setAttribute('aria-label', movie.title);
      const img = node('img'); img.src = movie.poster; img.alt = movie.title; img.width = 80; img.height = 110;
      button.append(img); button.addEventListener('click', () => choose(movie.id)); $('#galleryThumbs').append(button);
    });
    $$('[data-thumbnail]').forEach(button => { const active = button.dataset.thumbnail === state.movie.id; button.classList.toggle('is-selected', active); button.setAttribute('aria-pressed', String(active)); });
  }
  function renderRating() {
    if (!$('#nightStars')) return;
    const value = state.ratings[state.movie.id] || 0;
    const stars = $$('[data-night-star]');
    for (let i = 0; i < stars.length; i++) {
      stars[i].classList.toggle('is-filled', i < value); stars[i].setAttribute('aria-checked', String(i + 1 === value)); stars[i].tabIndex = i === (value ? value - 1 : 0) ? 0 : -1;
    }
    $('#nightRatingText').textContent = value ? t('Бағаңыз: {rating} / 5', {rating:value}) : t('Әлі баға берілген жоқ.');
    $('#clearNightRating').disabled = !value;
  }
  function rate(value) {
    if (value) state.ratings[state.movie.id] = value; else delete state.ratings[state.movie.id];
    store.set('67films-night-ratings', JSON.stringify(state.ratings)); renderRating(); animate($('#nightStars'));
  }
  $$('[data-night-star]').forEach(button => button.addEventListener('click', () => rate(Number(button.dataset.nightStar))));
  $('#clearNightRating')?.addEventListener('click', () => { rate(0); $('[data-night-star="1"]').focus(); });
  $('#nightStars')?.addEventListener('keydown', event => {
    const stars = $$('[data-night-star]'); let index = stars.indexOf(document.activeElement);
    if (index < 0) return;
    switch (event.key) {
      case 'ArrowRight': case 'ArrowUp': index = (index + 1) % stars.length; break;
      case 'ArrowLeft': case 'ArrowDown': index = (index + stars.length - 1) % stars.length; break;
      case 'Home': index = 0; break; case 'End': index = stars.length - 1; break; default: return;
    }
    event.preventDefault(); stars[index].focus(); rate(index + 1);
  });
  $('#readMore')?.addEventListener('click', () => {
    const extra = $('#selectedExtra'); extra.hidden = !extra.hidden;
    $('#readMore').setAttribute('aria-expanded', String(!extra.hidden)); $('#readMore').textContent = t(extra.hidden ? 'Толығырақ оқу' : 'Қысқарту');
  });
  $('#nightMenu')?.addEventListener('keydown', event => {
    const links = $$('#nightMenu a'); let index = links.indexOf(document.activeElement); if (index < 0) return;
    switch (event.key) {
      case 'ArrowRight': case 'ArrowDown': index = (index + 1) % links.length; break;
      case 'ArrowLeft': case 'ArrowUp': index = (index + links.length - 1) % links.length; break;
      case 'Home': index = 0; break; case 'End': index = links.length - 1; break; default: return;
    }
    event.preventDefault(); links[index].focus();
  });
  const form = $('#nightPlanForm'); const steps = $$('[data-night-step]');
  function today() { const d = new Date(); return `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`; }
  function invalidateTicket() { if ($('#nightTicket')) { $('#nightTicket').hidden = true; $('#nightSubmit').disabled = false; } }
  function errorFor(input) {
    if (input.id === 'nightName' && !/^[\p{L}\p{M}]+(?:[ '\u2019-][\p{L}\p{M}]+)*$/u.test(input.value.trim())) return t('Атыңызды кемінде екі әріппен жазыңыз.');
    if (input.id === 'nightName' && input.value.trim().length < 2) return t('Атыңызды кемінде екі әріппен жазыңыз.');
    if (input.id === 'nightGuests' && (!Number.isInteger(Number(input.value)) || Number(input.value)<1 || Number(input.value)>12)) return t('Адам саны 1–12 аралығындағы бүтін сан болуы керек.');
    if (input.id === 'nightDate' && (!input.value || input.value < today())) return t('Бүгінгі немесе алдағы күнді таңдаңыз.');
    if (input.required && (!input.value || input.validity.badInput)) return t('Бұл өрісті дұрыс толтырыңыз.');
    return '';
  }
  function validate(index) {
    for (const input of steps[index].querySelectorAll('input,select')) {
      const message = errorFor(input); if (message) { state.step=index; renderStep(index); $('#nightPlanError').textContent=message; $('#nightPlanError').hidden=false; input.setAttribute('aria-invalid','true'); input.focus(); return false; }
    }
    return true;
  }
  function details(target) {
    const pairs = [['Кино', state.movie.title], ['Атыңыз', $('#nightName').value.trim()], ['Қонақтар', $('#nightGuests').value], ['Күні', $('#nightDate').value], ['Уақыты', $('#nightTime').value], ['Дәмді қосымша', t($('#nightSnack').value)]];
    target.replaceChildren(); pairs.forEach(([label,value]) => target.append(node('dt',t(label)), node('dd',value)));
  }
  function renderStep(index) {
    steps.forEach((step,i) => { step.hidden=i!==index; step.disabled=i!==index; });
    $$('#nightSteps li').forEach((el,i) => { if(i===index)el.setAttribute('aria-current','step');else el.removeAttribute('aria-current'); });
    $('#nightBack').hidden=index===0; $('#nightNext').hidden=index===2; $('#nightSubmit').hidden=index!==2;
    $('#stepStatus').textContent=t('Қадам: {step} / 3',{step:index+1}); $('#nightPlanError').hidden=true;
    if (index===2) { $('#nightGreeting').textContent=t('Жоспарыңызды тексеріңіз, {name}!',{name:$('#nightName').value.trim()}); details($('#nightReview')); }
    animate(steps[index]);
  }
  // onChange is the callback used to render a step after validation and state update.
  function goToStep(index, onChange) { if(index<0||index>2)return;if(index>state.step&&!validate(state.step))return;state.step=index;onChange(index);steps[index].querySelector('legend').focus(); }
  if(form) {
    $('#nightDate').min=today(); $('#nightDate').value=today();
    $('#nightNext').addEventListener('click',()=>goToStep(state.step+1,renderStep)); $('#nightBack').addEventListener('click',()=>goToStep(state.step-1,renderStep));
    form.addEventListener('input',event=>{event.target.removeAttribute('aria-invalid');$('#nightPlanError').hidden=true;invalidateTicket();});
    form.addEventListener('reset',()=>setTimeout(()=>{state.step=0;$('#nightDate').min=today();$('#nightDate').value=today();form.querySelectorAll('[aria-invalid]').forEach(el=>el.removeAttribute('aria-invalid'));invalidateTicket();renderStep(0);$('#nightName').focus();},0));
    form.addEventListener('submit',event=>{
      event.preventDefault();if(state.step<2){goToStep(state.step+1,renderStep);return;}if(!validate(0)||!validate(1))return;
      details($('#ticketDetails'));$('#ticketMessage').textContent=t('Жоспарыңыз дайын, {name}!',{name:$('#nightName').value.trim()});$('#nightTicket').hidden=false;$('#nightSubmit').disabled=true;animate($('#nightTicket'),'night-ticket-ready');$('#ticketHeading').focus();window.NightSound?.play();
    });
    $('#nightRestart').addEventListener('click',()=>form.reset());
  }
  function render() {
    renderCards();renderGallery();
    if($('#selectedTitle')) { $('#selectedTitle').textContent=state.movie.title;$('#selectedPoster').src=state.movie.poster;$('#selectedPoster').alt=state.movie.title;$('#selectedCategory').textContent=t(state.movie.categoryLabel);$('#selectedMeta').textContent=state.movie.year;$('#selectedLink').href=state.movie.page;$('#selectedDescription').textContent=t(state.movie.teaser);$('#selectedExtra').textContent=t(state.movie.description);renderRating(); }
    if(form)renderStep(state.step);
  }
  window.addEventListener('film-language-change',render);render();
})();
