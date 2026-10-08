const fs = require('node:fs');
const path = require('node:path');
const root = path.resolve(__dirname, '..');
const dest = path.join(root,'dist');
fs.rmSync(dest,{ recursive:true, force:true });
fs.mkdirSync(dest,{ recursive:true });
for (const name of fs.readdirSync(root)) {
  if (name.endsWith('.html') || ['img','css','js','vendor','favicon.ico','icon.svg','icon.png','robots.txt','site.webmanifest'].includes(name)) {
    fs.cpSync(path.join(root,name),path.join(dest,name),{ recursive:true });
  }
}
console.log('Built all static pages into dist/');
