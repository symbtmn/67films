/* Source and API contract: https://www.tvmaze.com/api (CORS, key-free public search). */
(function(root){
  'use strict';
  async function search(query,{signal,fetcher=root.fetch.bind(root)}={}) {
    query=String(query).trim();if(query.length<2||query.length>80)throw new RangeError('Search must contain 2–80 characters');
    const response=await fetcher('https://api.tvmaze.com/search/shows?q='+encodeURIComponent(query),{signal,headers:{Accept:'application/json'}});
    if(!response.ok)throw new Error('TVmaze HTTP '+response.status);
    const data=await response.json();if(!Array.isArray(data))throw new TypeError('Unexpected TVmaze response');
    return data.map(item=>item?.show).filter(show=>show&&Number.isInteger(show.id)&&typeof show.name==='string').slice(0,12);
  }
  const api={search};if(typeof module!=='undefined'&&module.exports)module.exports=api;else root.FilmTVmaze=api;
})(typeof window!=='undefined'?window:globalThis);
