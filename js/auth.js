/* Browser-only authentication simulation. No account data leaves this device. */
'use strict';
(() => {
  const ACCOUNT_KEY = '67films.accounts.v1';
  const SESSION_KEY = '67films.session.v1';
  const t = message => window.FilmLanguage?.t(message) || message;
  function readAccounts() {
    const raw = localStorage.getItem(ACCOUNT_KEY);
    if (!raw) return [];
    const value = JSON.parse(raw);
    if (!Array.isArray(value)) throw new Error('Жергілікті аккаунт деректері оқылмады.');
    return value.filter(user => user && typeof user.id === 'string' && typeof user.email === 'string' && typeof user.name === 'string' && typeof user.phone === 'string');
  }
  function currentUser() {
    try {
      const session = JSON.parse(localStorage.getItem(SESSION_KEY) || 'null');
      if (!session || !Number.isFinite(session.signedInAt) || Date.now() - session.signedInAt > 7 * 86400000) { localStorage.removeItem(SESSION_KEY); return null; }
      return readAccounts().find(user => user.id === session.userId) || null;
    } catch { return null; }
  }
  function listKey(source = 'catalogue') { return '67films.list.' + source + '.' + (currentUser()?.id || 'guest'); }
  function getList(source = 'catalogue') { try { const list = JSON.parse(localStorage.getItem(listKey(source)) || '[]'); return Array.isArray(list) ? list : []; } catch { return []; } }
  function setList(list, source = 'catalogue') { localStorage.setItem(listKey(source), JSON.stringify(list)); }
  function updateHeader() {
    const user = currentUser();
    document.querySelectorAll('[data-account-link]').forEach(link => { link.href = user ? 'profile.html' : 'login.html'; link.textContent = t(user ? 'Профиль' : 'Кіру'); });
  }
  function logout() { localStorage.removeItem(SESSION_KEY); location.assign('login.html?logout=1'); }
  window.FilmAuth = { currentUser, readAccounts, listKey, getList, setList, logout };
  updateHeader(); window.addEventListener('film-language-change',updateHeader); window.addEventListener('storage',updateHeader);
  document.querySelectorAll('[data-password-toggle]').forEach(button => button.addEventListener('click', () => {
    const field = document.getElementById(button.dataset.passwordToggle); const visible = field.type === 'password';
    field.type = visible ? 'text' : 'password'; button.textContent = t(visible ? 'Жасыру' : 'Көрсету'); button.setAttribute('aria-pressed',String(visible));
  }));
  function busy(form, enabled) { const button = form.querySelector('[type="submit"]'); button.disabled = enabled; button.setAttribute('aria-busy',String(enabled)); button.querySelector('[data-busy]')?.toggleAttribute('hidden',!enabled); }
  const signup = document.getElementById('signupForm');
  if (signup) signup.addEventListener('submit', async event => {
    event.preventDefault(); const status = document.getElementById('authStatus'); status.textContent = '';
    if (signup.dataset.busy === 'true' || !FilmForms.validate(signup)) return;
    signup.dataset.busy = 'true'; busy(signup,true);
    try {
      const email = signup.elements.email.value.trim().toLowerCase(); const users = readAccounts();
      if (users.some(user => user.email.toLowerCase() === email)) {
        FilmForms.renderError(signup.elements.email,'Бұл email бұрын тіркелген. Кіру бетін ашыңыз.'); FilmForms.summary(signup); signup.elements.email.focus(); return;
      }
      const password = await FilmCredentials.digest(signup.elements.password.value);
      // Re-read after async work so a second tab cannot silently overwrite an account.
      const latest = readAccounts(); if (latest.some(user => user.email.toLowerCase() === email)) throw new Error('Бұл email бұрын тіркелген. Кіру бетін ашыңыз.');
      latest.push({ id:crypto.randomUUID(), name:signup.elements.name.value.trim(), email, phone:FilmForms.rules.normalizePhone(signup.elements.phone.value), password, createdAt:new Date().toISOString() });
      localStorage.setItem(ACCOUNT_KEY,JSON.stringify(latest)); signup.reset(); location.assign('login.html?registered=1');
    } catch { status.textContent = t('Аккаунт сақталмады. Браузерде localStorage қолжетімді екенін тексеріңіз.'); }
    finally { signup.dataset.busy = 'false'; busy(signup,false); }
  });
  const login = document.getElementById('loginForm');
  if (login) {
    const status = document.getElementById('authStatus'); const params = new URLSearchParams(location.search);
    if (params.has('registered')) status.textContent = t('Тіркелу сәтті аяқталды. Енді аккаунтыңызға кіріңіз.');
    if (params.has('logout')) status.textContent = t('Аккаунттан шықтыңыз.');
    login.addEventListener('submit', async event => {
      event.preventDefault(); status.textContent = '';
      if (login.dataset.busy === 'true' || !FilmForms.validate(login)) return;
      login.dataset.busy = 'true'; busy(login,true);
      try {
        const user = readAccounts().find(item => item.email.toLowerCase() === login.elements.email.value.trim().toLowerCase());
        const matched = user ? await FilmCredentials.verify(login.elements.password.value,user.password) : false;
        if (!matched) { status.textContent = t('Email немесе құпиясөз қате. Қайта тексеріңіз.'); return; }
        localStorage.setItem(SESSION_KEY,JSON.stringify({ userId:user.id, signedInAt:Date.now() })); login.reset(); location.assign('profile.html');
      } catch { status.textContent = t('Кіру орындалмады. Браузердегі сақтауды тексеріңіз.'); }
      finally { login.dataset.busy = 'false'; busy(login,false); }
    });
  }
  const profile = document.getElementById('profileContent');
  if (!profile) return;
  let user = currentUser();
  if (!user) { location.replace('login.html?next=profile'); return; }
  profile.hidden = false; document.getElementById('profileLoading').hidden = true;
  const edit = document.getElementById('profileForm');
  function renderDetails() {
    document.getElementById('profileName').textContent = user.name;
    document.getElementById('profileAvatar').textContent = user.name.split(/\s+/).map(word=>word[0]).slice(0,2).join('').toUpperCase();
    document.getElementById('profileEmail').textContent = user.email;
    document.getElementById('profilePhone').textContent = user.phone;
    edit.elements.name.value = user.name; edit.elements.email.value = user.email; edit.elements.phone.value = user.phone;
  }
  function renderLists() {
    const movies = window.FilmCatalogue || []; const ids = getList(); const shows = getList('tvmaze');
    const grid = document.getElementById('profileWatchlist'); grid.replaceChildren();
    const entries = ids.map(id => movies.find(movie => movie.id === id)).filter(Boolean).map(movie => ({...movie,source:'catalogue'})).concat(shows.map(show=>({...show,title:show.name,page:show.url,source:'tvmaze'})));
    document.getElementById('profileListCount').textContent = String(entries.length); document.getElementById('profileListEmpty').hidden = entries.length > 0;
    entries.forEach(entry => {
      const item = document.createElement('li'); item.className = 'saved-row'; const link = document.createElement('a'); link.textContent = entry.title;
      const target = entry.source === 'catalogue' ? entry.page : /^https:\/\/(?:www\.)?tvmaze\.com\//.test(entry.page || '') ? entry.page : 'discover.html'; link.href = target;
      if (entry.source === 'tvmaze') { link.target = '_blank'; link.rel = 'noopener noreferrer'; }
      const remove = document.createElement('button'); remove.type = 'button'; remove.className = 'btn btn-outline-danger btn-sm'; remove.textContent = t('Алып тастау');
      remove.addEventListener('click',()=>{ try { setList(getList(entry.source).filter(item => entry.source === 'catalogue' ? item !== entry.id : item.id !== entry.id),entry.source); renderLists(); } catch { document.getElementById('profileStatus').textContent=t('Өзгерісті сақтау мүмкін болмады.'); } });
      item.append(link,remove); grid.append(item);
    });
  }
  renderDetails(); renderLists(); document.getElementById('logoutButton').addEventListener('click',logout);
  window.addEventListener('film-language-change',renderLists);
  edit.addEventListener('submit',event=>{
    event.preventDefault(); if (!FilmForms.validate(edit)) return;
    const status = document.getElementById('profileStatus');
    try {
      const users = readAccounts(); const email = edit.elements.email.value.trim().toLowerCase();
      if (users.some(item=>item.id !== user.id && item.email.toLowerCase() === email)) { FilmForms.renderError(edit.elements.email,'Бұл email бұрын тіркелген. Кіру бетін ашыңыз.'); FilmForms.summary(edit); return; }
      const updated = {...user,name:edit.elements.name.value.trim(),email,phone:FilmForms.rules.normalizePhone(edit.elements.phone.value)};
      localStorage.setItem(ACCOUNT_KEY,JSON.stringify(users.map(item=>item.id===user.id?updated:item))); user=updated; renderDetails(); status.textContent=t('Профиль сақталды.');
    } catch { status.textContent=t('Өзгерісті сақтау мүмкін болмады.'); }
  });
})();
