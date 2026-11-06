/* Behavioral unit tests: validation boundaries, password storage and API failures. */
const assert=require('node:assert/strict');
const rules=require('../js/validation.js');const credentials=require('../js/auth-core.js');const api=require('../js/tvmaze-client.js');
let checks=0;function check(name,condition){assert.ok(condition,name);checks++;}
(async()=>{
  for(const email of ['viewer@example.com','a.b+cinema@astanait.edu.kz','NAME@EXAMPLE.COM'])check('Valid email '+email,rules.email(email));
  for(const email of ['   ','a@','a@b','@mail.com','a b@example.com','a..b@example.com','a@-mail.com'])check('Reject invalid email '+email,!rules.email(email));
  for(const name of ['Сымбат','Зулпыбек Ақерке','O’Connor','Anne-Marie'])check('Unicode name '+name,rules.name(name));
  for(const name of [' ','A','@@','123','Ali!'])check('Reject invalid name '+name,!rules.name(name));
  for(const phone of ['+7 776 123 45 67','+7 (702) 123-45-67','87761234567'])check('Phone normalized '+phone,rules.phone(phone));
  for(const phone of [' ','+7 123','abc','+7 777 123 45 678','+7 777 123 45 6A'])check('Invalid phone '+phone,!rules.phone(phone));
  for(const password of ['Movie123!','Cinema2026#'])check('Strong password accepted',rules.password(password));
  for(const password of ['password','12345678','Movie123','movie123!','MOVIE123!','Mo1!',' Movie123!','Movie 123!'])check('Weak password rejected',!rules.password(password));
  const a=await credentials.digest('Movie123!');const b=await credentials.digest('Movie123!');
  check('Passwords use distinct random salts',a.salt!==b.salt&&a.hash!==b.hash);
  check('No plaintext password in serialized credential',!JSON.stringify(a).includes('Movie123!'));
  check('Correct password verifies',await credentials.verify('Movie123!',a));
  check('Incorrect password is rejected',!(await credentials.verify('Wrong123!',a)));
  check('Malformed credential is rejected',!(await credentials.verify('Movie123!',{salt:'%%%'})));
  let requested='';const signal=new AbortController().signal;
  const shows=await api.search('  Dark & Light  ',{signal,fetcher:async(url,options)=>{requested=url;check('Abort signal forwarded',options.signal===signal);return {ok:true,json:async()=>[{show:{id:1,name:'Dark'}}]};}});
  check('API query correctly escaped',requested.endsWith('Dark%20%26%20Light'));
  check('API returns validated show data',shows.length===1&&shows[0].name==='Dark');
  check('Empty API response is legitimate',(await api.search('Missing',{fetcher:async()=>({ok:true,json:async()=>[]})})).length===0);
  await assert.rejects(api.search('Test',{fetcher:async()=>({ok:false,status:429})}),/429/);checks++;
  await assert.rejects(api.search('Test',{fetcher:async()=>({ok:true,json:async()=>({error:'wrong shape'})})}),/Unexpected/);checks++;
  await assert.rejects(api.search('Test',{fetcher:async()=>{throw new Error('offline');}}),/offline/);checks++;
  await assert.rejects(api.search(' '),RangeError);checks++;
  check('Malformed API rows are ignored',(await api.search('Test',{fetcher:async()=>({ok:true,json:async()=>[null,{show:{id:'a',name:'bad'}},{show:{id:1,name:'ok'}}]})})).length===1);
  check('API result limit',(await api.search('Test',{fetcher:async()=>({ok:true,json:async()=>Array.from({length:20},(_,id)=>({show:{id,name:'Show'}}))})})).length===12);
  console.log('PASS:',checks,'behavioral unit assertions');
  require('node:fs').mkdirSync(require('node:path').join(__dirname,'../evidence/final'),{recursive:true});
  require('node:fs').writeFileSync(require('node:path').join(__dirname,'../evidence/final/unit-results.json'),JSON.stringify({checks,passed:true,scope:['validation boundaries','salted password credentials','API success, empty, malformed, rate limit and network failures']},null,2));
})().catch(error=>{console.error(error);process.exit(1);});
