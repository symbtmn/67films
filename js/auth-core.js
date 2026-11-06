/* Testable credential logic shared by the browser UI and Node checks. */
(function (root) {
  'use strict';
  const to64 = value => btoa(String.fromCharCode(...new Uint8Array(value)));
  const from64 = value => Uint8Array.from(atob(value), char => char.charCodeAt(0));
  async function digest(password, salt64) {
    const salt = salt64 ? from64(salt64) : root.crypto.getRandomValues(new Uint8Array(16));
    const key = await root.crypto.subtle.importKey('raw',new TextEncoder().encode(password),'PBKDF2',false,['deriveBits']);
    const bits = await root.crypto.subtle.deriveBits({name:'PBKDF2',salt,iterations:120000,hash:'SHA-256'},key,256);
    return {salt:to64(salt),hash:to64(bits),iterations:120000,algorithm:'PBKDF2-SHA-256'};
  }
  async function verify(password, saved) {
    if (!saved || saved.algorithm !== 'PBKDF2-SHA-256' || saved.iterations !== 120000 || typeof saved.salt !== 'string' || typeof saved.hash !== 'string') return false;
    try { return (await digest(password,saved.salt)).hash === saved.hash; } catch { return false; }
  }
  const api={digest,verify};if(typeof module!=='undefined'&&module.exports)module.exports=api;else root.FilmCredentials=api;
})(typeof window!=='undefined'?window:globalThis);
