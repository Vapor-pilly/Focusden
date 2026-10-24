'use strict';
const CACHE_NAME="focus-paradise-mobile-e86e4254fd6d225e";
const PREFIX='focus-paradise-mobile-';
const FILES=["app.js", "assets/coffee-notes.svg", "assets/icon-180.png", "assets/icon-192.png", "assets/icon-512.png", "audio/complete.wav", "audio/forest.wav", "audio/guitar-A.wav", "audio/guitar-B.wav", "audio/guitar-C.wav", "audio/guitar-D.wav", "audio/guitar-E.wav", "audio/guitar-F.wav", "audio/guitar-G.wav", "audio/page-turn.wav", "audio/piano.wav", "audio/rain.wav", "audio/water.wav", "audio/waves.wav", "index.html", "manifest.webmanifest", "mobile.css", "mobile.js", "scenes/airplane-window/renderer.js", "scenes/airplane-window/scene.js", "scenes/book-pages/renderer.js", "scenes/book-pages/scene.js", "scenes/book-pages/sheet-1.webp", "scenes/book-pages/sheet-2.webp", "scenes/book-pages/sheet-3.webp", "scenes/catalog.js", "scenes/crystal-guitar/background.webp", "scenes/crystal-guitar/butterfly-left.webp", "scenes/crystal-guitar/butterfly-right.webp", "scenes/crystal-guitar/guitar.webp", "scenes/crystal-guitar/reference.webp", "scenes/crystal-guitar/renderer.js", "scenes/crystal-guitar/ring-back.webp", "scenes/crystal-guitar/ring-front.webp", "scenes/crystal-guitar/scene.js", "scenes/dandelion-night/renderer.js", "scenes/dandelion-night/scene.js", "scenes/dream-ocean/scene.js", "scenes/rain-window/renderer.js", "scenes/rain-window/scene.js", "scenes/shared/pond.js", "scenes/shared/renderer.js", "scenes/warm-pond/scene.js", "scenes/wisteria-glow/renderer.js", "scenes/wisteria-glow/scene.js", "style.css"];
const urls=FILES.map(file=>new URL(file,self.registration.scope).href);
async function notify(message){for(const client of await self.clients.matchAll({type:'window',includeUncontrolled:true}))client.postMessage(message);}
async function complete(){const cache=await caches.open(CACHE_NAME);return (await Promise.all(urls.map(url=>cache.match(url)))).every(Boolean);}
async function prepare(){
  const cache=await caches.open(CACHE_NAME);let next=0,done=0;
  await Promise.all(Array.from({length:3},async()=>{
    while(next<urls.length){
      const url=urls[next++],response=await fetch(new Request(url,{cache:'reload'}));
      if(!response.ok||response.status!==200)throw Error('Offline resource incomplete');
      await cache.put(url,response);done++;await notify({type:'CACHE_PROGRESS',percent:Math.floor(done/urls.length*100)});
    }
  }));
  if(!await complete())throw Error('Offline cache verification failed');
}
self.addEventListener('install',event=>event.waitUntil((async()=>{await prepare();await self.skipWaiting();})()));
self.addEventListener('activate',event=>event.waitUntil((async()=>{
  if(!await complete())throw Error('Cannot activate incomplete offline package');
  for(const key of await caches.keys())if(key.startsWith(PREFIX)&&key!==CACHE_NAME)await caches.delete(key);
  await self.clients.claim();await notify({type:'OFFLINE_READY'});
})()));
self.addEventListener('message',event=>event.waitUntil((async()=>{
  if(event.data?.type==='REPAIR_OFFLINE'){
    try{await prepare();await notify({type:'OFFLINE_READY'});}catch{await notify({type:'OFFLINE_MISSING'});}
  }else if(event.data?.type==='CHECK_OFFLINE')await notify({type:await complete()?'OFFLINE_READY':'OFFLINE_MISSING'});
})()));
// Safari commonly requests audio as byte ranges, including while offline.
async function ranged(request,response){
  if(!request.headers.has('range'))return response;
  const buffer=await response.arrayBuffer(),size=buffer.byteLength;
  const match=request.headers.get('range').match(/^bytes=(\d*)-(\d*)$/);
  const invalid=()=>new Response(null,{status:416,headers:{'Content-Range':`bytes */${size}`}});
  if(!match||(!match[1]&&!match[2]))return invalid();
  let start,end;
  if(!match[1]){const suffix=Number(match[2]);if(suffix<=0)return invalid();start=Math.max(0,size-suffix);end=size-1;}
  else{start=Number(match[1]);end=match[2]?Math.min(Number(match[2]),size-1):size-1;}
  if(!Number.isSafeInteger(start)||!Number.isSafeInteger(end)||start<0||start>=size||end<start)return invalid();
  const headers=new Headers(response.headers);headers.delete('Content-Encoding');headers.delete('Transfer-Encoding');
  headers.set('Content-Range',`bytes ${start}-${end}/${size}`);headers.set('Accept-Ranges','bytes');headers.set('Content-Length',String(end-start+1));
  return new Response(buffer.slice(start,end+1),{status:206,statusText:'Partial Content',headers});
}
self.addEventListener('fetch',event=>{
  if(event.request.method!=='GET')return;
  const url=new URL(event.request.url);
  if(url.origin!==self.location.origin||!url.href.startsWith(self.registration.scope))return;
  event.respondWith((async()=>{
    const cache=await caches.open(CACHE_NAME);
    if(event.request.mode==='navigate'){
      const index=await cache.match(new URL('index.html',self.registration.scope).href);
      if(index)return index;
    }
    url.search='';url.hash='';const response=await cache.match(url.href);
    if(response)return ranged(event.request,response);
    return fetch(event.request);
  })());
});
