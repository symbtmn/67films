/* TVmaze public API: loading, abortable requests, safe DOM rendering and retry. */
'use strict';
(() => {
  const form = document.getElementById('discoverForm'); if (!form) return;
  const input = document.getElementById('seriesQuery'); const results = document.getElementById('seriesResults');
  const loading = document.getElementById('seriesLoading'); const error = document.getElementById('seriesError');
  const status = document.getElementById('seriesStatus'); const empty = document.getElementById('seriesEmpty');
  const t = message => window.FilmLanguage?.t(message) || message;
  let controller; let debounce; let requestId = 0; let lastQuery = ''; let shown = [];
  function safeUrl(value, image = false) {
    try { const url = new URL(value); return url.protocol === 'https:' && (image ? url.hostname === 'static.tvmaze.com' : /^(?:www\.)?tvmaze\.com$/.test(url.hostname)) ? url.href : ''; } catch { return ''; }
  }
  function make(tag, text, className) { const element = document.createElement(tag); if (text) element.textContent = text; if (className) element.className = className; return element; }
  function render(shows, cached = false) {
    shown = shows; results.replaceChildren(); empty.hidden = shows.length > 0;
    status.textContent = t(cached ? 'Сақталған соңғы нәтиже көрсетілді. Интернет қосылуын тексеріңіз.' : 'TVmaze нәтижелері: {count}').replace('{count}',String(shows.length));
    const saved = window.FilmAuth.getList('tvmaze');
    shows.forEach(show => {
      const card = make('article','','card series-card h-100'); const figure = make('a'); const url = safeUrl(show.url);
      figure.href = url || 'https://www.tvmaze.com/'; figure.target = '_blank'; figure.rel = 'noopener noreferrer';
      const image = make('img'); image.src = safeUrl(show.image?.medium,true) || 'images/poster-placeholder.svg'; image.alt = show.name; image.width = 210; image.height = 295; image.loading = 'lazy';
      image.addEventListener('error',()=>{image.src='images/poster-placeholder.svg';},{once:true}); figure.append(image);
      const body = make('div','','card-body d-flex flex-column'); body.append(make('h2',show.name,'h5'));
      const meta = [show.premiered?.slice(0,4), show.language, show.rating?.average ? '★ '+show.rating.average : ''].filter(Boolean).join(' · '); body.append(make('p',meta,'small text-body-secondary'));
      body.append(make('p',(show.genres || []).join(' / '),'small'));
      // API summaries contain markup. Read text from a detached document, never inject it.
      const plain = new DOMParser().parseFromString(show.summary || '', 'text/html').body.textContent || t('Сипаттама әлі қосылмаған.');
      body.append(make('p',plain.slice(0,240)+(plain.length>240?'…':''),'small flex-grow-1'));
      const links = make('div','','d-flex flex-wrap gap-2'); const details=make('a',t('TVmaze-де ашу'),'btn btn-outline-secondary btn-sm'); details.href=url||'https://www.tvmaze.com/';details.target='_blank';details.rel='noopener noreferrer';
      const add=make('button',t(saved.some(item=>item.id===show.id)?'Сақталды ✓':'Тізімге қосу'),'btn btn-outline-danger btn-sm');add.type='button';add.setAttribute('aria-pressed',String(saved.some(item=>item.id===show.id)));
      add.addEventListener('click',()=>{
        try {
          const list=FilmAuth.getList('tvmaze');const exists=list.some(item=>item.id===show.id);
          FilmAuth.setList(exists?list.filter(item=>item.id!==show.id):[...list,{id:show.id,name:show.name,url:url||'https://www.tvmaze.com/',image:safeUrl(show.image?.medium || show.image?.original,true)}],'tvmaze');
          add.textContent=t(exists?'Тізімге қосу':'Сақталды ✓');add.setAttribute('aria-pressed',String(!exists));status.textContent=t(exists?'Туынды тізімнен алынды.':'Туынды көру тізіміне сақталды!');
        } catch { status.textContent=t('Өзгерісті сақтау мүмкін болмады.'); }
      });
      links.append(details,add);body.append(links);card.append(figure,body);results.append(card);
    });
  }
  function cached(query) { try { const entry=JSON.parse(localStorage.getItem('67films.api.last')||'null');return entry?.query===query&&Array.isArray(entry.shows)&&Date.now()-entry.savedAt<86400000?entry.shows:null; } catch { return null; } }
  async function search(query) {
    query=query.trim(); if (query.length<2||query.length>80) return;
    const id=++requestId;controller?.abort();controller=new AbortController();const activeController=controller;lastQuery=query;
    let timedOut=false; const timer=setTimeout(()=>{timedOut=true;activeController.abort();},10000);
    loading.hidden=false;error.hidden=true;empty.hidden=true;status.textContent='';results.replaceChildren();results.setAttribute('aria-busy','true');
    try {
      const shows=await FilmTVmaze.search(query,{signal:activeController.signal});
      if(id!==requestId)return;render(shows);
      try {localStorage.setItem('67films.api.last',JSON.stringify({query,shows,savedAt:Date.now()}));} catch { /* Saving API results is optional; live results remain usable. */ }
    } catch(exception) {
      if(id!==requestId||exception.name==='AbortError'&&!timedOut)return;
      error.hidden=false; document.getElementById('seriesErrorText').textContent=t(timedOut?'Сұрау уақыты аяқталды. Қайта көріңіз.':'Сериалдарды жүктеу мүмкін болмады. Интернет қосылуын тексеріңіз.');
      const saved=cached(query);if(saved)render(saved,true);
    } finally {clearTimeout(timer);if(id===requestId){loading.hidden=true;results.setAttribute('aria-busy','false');}}
  }
  form.addEventListener('submit',event=>{event.preventDefault();clearTimeout(debounce);if(FilmForms.validate(form))search(input.value);});
  input.addEventListener('input',()=>{
    clearTimeout(debounce);if(input.value.trim().length<2){requestId++;controller?.abort();loading.hidden=true;results.setAttribute('aria-busy','false');results.replaceChildren();shown=[];error.hidden=true;empty.hidden=true;status.textContent=t('Іздеу үшін кемінде 2 таңба жазыңыз.');return;}
    debounce=setTimeout(()=>{if(input.value.trim().length<=80)search(input.value);},500);
  });
  document.getElementById('seriesRetry').addEventListener('click',()=>search(lastQuery));
  window.addEventListener('film-language-change',()=>{if(shown.length)render(shown);});
  input.value='Breaking Bad';search(input.value);
})();
