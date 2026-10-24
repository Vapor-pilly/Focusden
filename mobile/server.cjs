// Computer-only preview. Deploy this folder's static files to HTTPS for iPhone installation.
const http=require('node:http'),fs=require('node:fs'),path=require('node:path');
const root=__dirname,files=require('./asset-list.json');
const allowed=new Set([...files,'sw.js','asset-list.json']);
const types={'.html':'text/html; charset=utf-8','.js':'text/javascript; charset=utf-8','.css':'text/css; charset=utf-8','.json':'application/json','.webmanifest':'application/manifest+json','.svg':'image/svg+xml','.png':'image/png','.webp':'image/webp','.wav':'audio/wav'};
const server=http.createServer((req,res)=>{
 let url;try{url=decodeURIComponent(new URL(req.url,'http://127.0.0.1').pathname).slice(1);}catch{res.writeHead(400).end();return;}
 if(url==='health'){res.writeHead(200).end('focus-paradise-mobile');return;}
 if(!url)url='index.html';if(!allowed.has(url)){res.writeHead(404).end();return;}
 const filename=path.join(root,url);fs.stat(filename,(error,stat)=>{
  if(error){res.writeHead(404).end();return;}
  const headers={'Content-Type':types[path.extname(filename)]||'application/octet-stream','Cache-Control':'no-cache','X-Content-Type-Options':'nosniff','Content-Security-Policy':"default-src 'self'; img-src 'self' data:; media-src 'self'; script-src 'self'; style-src 'self' 'unsafe-inline'; connect-src 'self'; worker-src 'self'; manifest-src 'self'; object-src 'none'; base-uri 'self'"};
  const match=req.headers.range?.match(/^bytes=(\d+)-(\d*)$/);
  if(match){const start=Number(match[1]),end=Math.min(match[2]?Number(match[2]):stat.size-1,stat.size-1);if(start>end||start>=stat.size){res.writeHead(416,{'Content-Range':`bytes */${stat.size}`}).end();return;}res.writeHead(206,{...headers,'Content-Range':`bytes ${start}-${end}/${stat.size}`,'Accept-Ranges':'bytes','Content-Length':end-start+1});fs.createReadStream(filename,{start,end}).pipe(res);}
  else{res.writeHead(200,{...headers,'Content-Length':stat.size});fs.createReadStream(filename).pipe(res);}
 });
});
server.listen(8787,'127.0.0.1',()=>console.log('Mobile preview: http://127.0.0.1:8787/ (iPhone installation requires HTTPS)'));
server.on('error',error=>{console.error(error.message);process.exitCode=1;});
