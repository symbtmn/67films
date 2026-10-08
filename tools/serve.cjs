const http = require('node:http');
const fs = require('node:fs');
const path = require('node:path');
const root = path.resolve(__dirname, '..');
const mime = { '.html':'text/html; charset=utf-8', '.css':'text/css', '.js':'text/javascript', '.jpg':'image/jpeg', '.png':'image/png', '.svg':'image/svg+xml', '.ico':'image/x-icon', '.json':'application/json' };
http.createServer((req,res) => {
  let filename;
  try {
    const urlPath = decodeURIComponent(new URL(req.url,'http://localhost').pathname);
    filename = path.resolve(root, '.' + urlPath);
    if (filename !== root && !filename.startsWith(root + path.sep)) throw new Error('Invalid path');
    if (fs.statSync(filename).isDirectory()) filename = path.join(filename,'index.html');
    if (!fs.statSync(filename).isFile()) throw new Error('Not a file');
  } catch {
    res.writeHead(404, { 'Content-Type':'text/html; charset=utf-8' });
    res.end(fs.readFileSync(path.join(root,'404.html'))); return;
  }
  res.writeHead(200, { 'Content-Type':mime[path.extname(filename)] || 'application/octet-stream' });
  fs.createReadStream(filename).pipe(res);
}).listen(8080, () => console.log('67Films: http://localhost:8080'));
