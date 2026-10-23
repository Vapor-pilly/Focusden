const http = require('node:http');
const fs = require('node:fs');
const path = require('node:path');
const root = __dirname;
const types = {'.svg':'image/svg+xml','.html':'text/html; charset=utf-8','.js':'text/javascript; charset=utf-8','.css':'text/css; charset=utf-8','.wav':'audio/wav','.webp':'image/webp'};
const allowed = new Set(['/scenes/wisteria-glow/scene.js','/scenes/wisteria-glow/renderer.js','/assets/coffee-notes.svg','/scenes/crystal-guitar/scene.js','/scenes/crystal-guitar/renderer.js','/scenes/crystal-guitar/reference.webp','/scenes/crystal-guitar/background.webp','/scenes/crystal-guitar/guitar.webp','/scenes/crystal-guitar/ring-back.webp','/scenes/crystal-guitar/ring-front.webp','/scenes/crystal-guitar/butterfly-left.webp','/scenes/crystal-guitar/butterfly-right.webp','/audio/guitar-C.wav','/audio/guitar-D.wav','/audio/guitar-E.wav','/audio/guitar-F.wav','/audio/guitar-G.wav','/audio/guitar-A.wav','/audio/guitar-B.wav','/scenes/book-pages/scene.js','/scenes/book-pages/renderer.js','/scenes/book-pages/sheet-1.webp','/scenes/book-pages/sheet-2.webp','/scenes/book-pages/sheet-3.webp','/audio/page-turn.wav','/index.html','/style.css','/app.js','/scenes/dandelion-night/scene.js','/scenes/dandelion-night/renderer.js','/scenes/catalog.js','/scenes/warm-pond/scene.js','/scenes/dream-ocean/scene.js','/scenes/shared/pond.js','/scenes/shared/renderer.js','/scenes/rain-window/scene.js','/scenes/rain-window/renderer.js','/audio/piano.wav','/audio/rain.wav','/audio/waves.wav','/audio/forest.wav','/audio/water.wav','/audio/complete.wav']);
const server = http.createServer((req,res)=>{
  let url;
  try {url=decodeURIComponent(new URL(req.url,'http://127.0.0.1').pathname);}catch {res.writeHead(400).end();return;}
  if(url==='/')url='/index.html';
  if(url==='/health'){res.writeHead(200,{'Content-Type':'text/plain'}).end('yiyu-garden');return;}
  if(!allowed.has(url)){res.writeHead(404).end();return;}
  const filename=path.join(root,url);
  fs.stat(filename,(err,stat)=>{
    if(err){res.writeHead(404).end();return;}
    const headers={'Content-Type':types[path.extname(filename)]||'application/octet-stream','Cache-Control':'no-cache','X-Content-Type-Options':'nosniff','Content-Security-Policy':"default-src 'self'; img-src 'self' data:; style-src 'self' 'unsafe-inline'; script-src 'self'; media-src 'self'; connect-src 'none'; object-src 'none'; base-uri 'none'"};
    const range=req.headers.range?.match(/^bytes=(\d+)-(\d*)$/);
    if(range){const start=Number(range[1]),end=Math.min(range[2]?Number(range[2]):stat.size-1,stat.size-1);if(start>end){res.writeHead(416).end();return;}res.writeHead(206,{...headers,'Content-Range':`bytes ${start}-${end}/${stat.size}`,'Accept-Ranges':'bytes','Content-Length':end-start+1});fs.createReadStream(filename,{start,end}).pipe(res);}
    else{res.writeHead(200,{...headers,'Content-Length':stat.size});fs.createReadStream(filename).pipe(res);}
  });
});
server.listen(8765,'127.0.0.1',()=>console.log('专注乐园 · http://127.0.0.1:8765'));
server.on('error',err=>{console.error(err.message);process.exitCode=1;});
