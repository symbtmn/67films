/* Persisted three-language selector; translate interface text without HTML injection. */
'use strict';
(() => {
  const messages = window.FilmTranslations || {};
  let language = 'kk';
  try { language = localStorage.getItem('67films-language') || 'kk'; } catch { /* Session only. */ }
  const validLanguage = value => { switch (value) { case 'en': return 'en'; case 'ru': return 'ru'; default: return 'kk'; } };
  language = validLanguage(language);
  const originals = new WeakMap();
  const reverse = new Map();
  Object.entries(messages).forEach(([source, values]) => { reverse.set(source, source); Object.values(values).forEach(value => reverse.set(value, source)); });
  function t(source, values = {}) {
    let result = language === 'kk' ? source : messages[source]?.[language] || source;
    Object.entries(values).forEach(([key,value]) => { result=result.replaceAll(`{${key}}`,String(value)); });return result;
  }
  const observer = new MutationObserver(() => apply());
  function apply() {
    observer.disconnect();
    document.documentElement.lang = language;
    const walker = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT);
    while(walker.nextNode()) {
      const node = walker.currentNode;
      if(node.parentElement.closest('script,style,#languageSelect'))continue;
      const current=node.textContent.trim();if(!current)continue;
      const old=originals.get(node);const source=old?.last===current?old.source:reverse.get(current)||current;
      const translated=t(source);if(translated!==current)node.textContent=node.textContent.replace(current,translated);
      originals.set(node,{source,last:translated});
    }
    document.querySelectorAll('[placeholder],[aria-label]').forEach(el=>{
      if(el.id==='languageSelect')return;
      for(const attribute of ['placeholder','aria-label']) {
        const current=el.getAttribute(attribute);if(current&&reverse.has(current))el.setAttribute(attribute,t(reverse.get(current)));
      }
    });
    observer.observe(document.body,{subtree:true,childList:true,characterData:true});
  }
  const picker=document.getElementById('languageSelect');
  if(picker){picker.value=language;picker.addEventListener('change',()=>{language=validLanguage(picker.value);try{localStorage.setItem('67films-language',language);}catch{}apply();window.dispatchEvent(new Event('film-language-change'));});}
  window.FilmLanguage={t,get language(){return language;},apply};apply();
})();
