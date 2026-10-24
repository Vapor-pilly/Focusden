const {test,before,after,beforeEach,afterEach}=require('node:test');
const assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path'),os=require('node:os');
const {spawn,execFileSync}=require('node:child_process');
const root=path.resolve(__dirname,'..'),mobile=path.join(root,'mobile'),base='http://127.0.0.1:8787';
const {chromium}=require(path.join(os.homedir(),'.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright'));
let browser,server,context,page,errors,external;
const read=file=>fs.readFileSync(path.join(mobile,file),'utf8');
const scenes=['warm-pond','dream-ocean','rain-window','dandelion-night','book-pages','crystal-guitar','wisteria-glow','airplane-window'];
async function ready(){await page.waitForFunction(()=>document.documentElement.dataset.offlineReady==='true',{},{timeout:45000});}
async function scene(id){await page.goto(base+'/?preview='+id);await page.waitForFunction(()=>document.getElementById('pond').dataset.renderer);if(id==='book-pages')await page.waitForFunction(()=>document.getElementById('pond').dataset.bookReady==='true');if(id==='crystal-guitar')await page.waitForFunction(()=>document.getElementById('pond').dataset.guitarReady==='true');}
async function touchDrag(x,y,dx,dy){const cdp=await context.newCDPSession(page);await cdp.send('Input.dispatchTouchEvent',{type:'touchStart',touchPoints:[{x,y}]});for(let i=1;i<=12;i++)await cdp.send('Input.dispatchTouchEvent',{type:'touchMove',touchPoints:[{x:x+dx*i/12,y:y+dy*i/12}]});await cdp.send('Input.dispatchTouchEvent',{type:'touchEnd',touchPoints:[]});await cdp.detach();}
before(async()=>{
 server=spawn(process.execPath,['server.cjs'],{cwd:mobile,windowsHide:true,stdio:'pipe'});
 for(let i=0;i<40;i++){try{if((await fetch(base+'/health')).ok)break;}catch{}await new Promise(r=>setTimeout(r,100));}
 browser=await chromium.launch({headless:true,executablePath:'C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe'});
 fs.mkdirSync(path.join(root,'.preview'),{recursive:true});
});
beforeEach(async()=>{
 context=await browser.newContext({viewport:{width:390,height:844},deviceScaleFactor:1,isMobile:true,hasTouch:true,acceptDownloads:true});page=await context.newPage();errors=[];external=[];
 page.on('pageerror',e=>errors.push(e.message));page.on('request',r=>{if(!r.url().startsWith(base)&&!r.url().startsWith('data:')&&!r.url().startsWith('blob:'))external.push(r.url());});
 await page.goto(base);
});
afterEach(async()=>{try{assert.deepEqual(errors,[]);assert.deepEqual(external,[]);}finally{await context.close();}});
after(async()=>{await browser?.close();server?.kill();});

test('mobile: independent complete package, local icons/manifest, all desktop runtime sources unchanged',()=>{
 const manifest=JSON.parse(read('manifest.webmanifest'));assert.equal(manifest.name,'专注乐园');assert.equal(manifest.start_url,'./');assert.equal(manifest.display,'standalone');
 assert.ok(read('index.html').includes('viewport-fit=cover'));assert.ok(read('index.html').includes('apple-touch-icon'));
 const files=JSON.parse(read('asset-list.json'));assert.ok(files.length>=50);for(const file of files)assert.ok(fs.existsSync(path.join(mobile,file)),file);
 for(const id of scenes)assert.ok(files.includes(`scenes/${id}/scene.js`));
 for(const icon of ['assets/icon-180.png','assets/icon-192.png','assets/icon-512.png'])assert.ok(files.includes(icon));
 for(const file of ['index.html','style.css','app.js','server.cjs'])assert.deepEqual(fs.readFileSync(path.join(root,file),'utf8').replace(/\r\n/g,'\n'),execFileSync('git',['show','HEAD:'+file],{cwd:root,encoding:'utf8'}).replace(/\r\n/g,'\n'),'Desktop file must not be altered');
 assert.ok(!fs.existsSync(path.join(mobile,'.git')));assert.ok(!fs.existsSync(path.join(mobile,'source-materials')));
});

test('mobile: all eight scenes fit portrait and dialogs/controls stay within iPhone viewport',async()=>{
 await ready();
 for(const id of scenes){
  await scene(id);await page.waitForTimeout(80);
  assert.equal(await page.locator('html').getAttribute('data-scene'),id);
  for(const selector of ['#time','#settings','#toggle','#profile','#sound']){const b=await page.locator(selector).boundingBox();assert.ok(b.x>=0&&b.x+b.width<=391&&b.y>=0&&b.y+b.height<=845,`${id} ${selector} visible: ${JSON.stringify(b)}`);}
  assert.ok(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth),'No horizontal page overflow');
  if(id==='airplane-window')await page.screenshot({path:path.join(root,'.preview/mobile-airplane.png')});
 }
 await page.touchscreen.tap(55,770); // blank near lower left, not a control
 await page.locator('#settings').tap();assert.ok(await page.locator('#settingsDialog').isVisible());await page.locator('#focusMinutes').fill('30');await page.locator('#saveSettings').tap();assert.equal(await page.locator('#time').innerText(),'30:00');
 await scene('wisteria-glow');await page.screenshot({path:path.join(root,'.preview/mobile-wisteria.png')});
});

test('mobile: actual finger gestures guide fish, play strings, turn pages, drop stars and drag the blind',async()=>{
 await scene('warm-pond');await touchDrag(120,450,80,60);assert.equal(await page.locator('#pond').getAttribute('data-interacting'),'false');
 await scene('rain-window');await touchDrag(90,420,160,80);assert.equal(await page.locator('#pond').getAttribute('data-interacting'),'false');
 await scene('book-pages');const book=await page.evaluate(()=>{const [x,y,w,h]=JSON.parse(document.getElementById('pond').dataset.bookBounds);return {x:x+w*.5,y:y+h*.6};});await page.touchscreen.tap(book.x,book.y);await page.waitForFunction(()=>Number(document.getElementById('pond').dataset.clickTurns)>0);
 await scene('crystal-guitar');await page.waitForFunction(()=>document.getElementById('pond').dataset.stringPoints);const string=await page.evaluate(()=>JSON.parse(document.getElementById('pond').dataset.stringPoints)[3]);await page.touchscreen.tap(string.x,string.y);assert.equal(await page.locator('#pond').getAttribute('data-last-note'),'F');
 await page.screenshot({path:path.join(root,'.preview/mobile-guitar.png')});
 await scene('wisteria-glow');const vine=await page.evaluate(()=>JSON.parse(document.getElementById('pond').dataset.vineTargets).find(v=>v.x<32&&v.y>100));await page.touchscreen.tap(vine.x,vine.y);assert.equal(await page.locator('#pond').getAttribute('data-vine-clicks'),'1');
 await scene('airplane-window');const handle=await page.evaluate(()=>JSON.parse(document.getElementById('pond').dataset.shadeHandle));await touchDrag(handle.x,handle.y,0,460);assert.equal(await page.locator('#pond').getAttribute('data-shade'),'1.0000');
});

test('mobile: full offline cache reopens every scene and serves Safari-style audio ranges without network',async()=>{
 await ready();assert.equal(await page.evaluate(async()=>{const names=await caches.keys(),cache=await caches.open(names.find(n=>n.startsWith('focus-paradise-mobile-')));return (await cache.keys()).length;}),JSON.parse(read('asset-list.json')).length);
 await page.evaluate(async()=>{const keys=await caches.keys(),cache=await caches.open(keys.find(n=>n.startsWith('focus-paradise-mobile-')));await cache.delete(new URL('audio/water.wav',location.href));navigator.serviceWorker.controller.postMessage({type:'CHECK_OFFLINE'});});
 await page.waitForFunction(()=>document.documentElement.dataset.offlineReady==='false');await page.locator('#profile').tap();await page.locator('#retryOffline').tap();await ready();await page.locator('#profileDialog .close').tap();
 await context.setOffline(true);
 for(const id of scenes){await scene(id);assert.equal(await page.locator('html').getAttribute('data-scene'),id);}
 await ready();
 const range=await page.evaluate(async()=>{const r=await fetch('audio/piano.wav',{headers:{Range:'bytes=100-199'}});return {status:r.status,range:r.headers.get('Content-Range'),bytes:(await r.arrayBuffer()).byteLength};});
 assert.equal(range.status,206);assert.equal(range.bytes,100);assert.ok(range.range.startsWith('bytes 100-199/'));
 const suffix=await page.evaluate(async()=>{const r=await fetch('audio/rain.wav',{headers:{Range:'bytes=-32'}});return {status:r.status,size:(await r.arrayBuffer()).byteLength};});assert.deepEqual(suffix,{status:206,size:32});
 const invalid=await page.evaluate(async()=>(await fetch('audio/rain.wav',{headers:{Range:'bytes=999999999-'}})).status);assert.equal(invalid,416);
 await page.evaluate(()=>{const Original=window.Audio;window.mobileAudio=[];window.Audio=function(...args){const audio=new Original(...args);window.mobileAudio.push(audio);return audio;};window.Audio.prototype=Original.prototype;});
 await page.locator('#sound').tap();await page.locator('[data-track="rain"]').tap();await page.waitForFunction(()=>window.mobileAudio.some(a=>a.src.endsWith('/rain.wav')&&!a.paused&&a.currentTime>.15));
 assert.equal(await page.evaluate(()=>window.mobileAudio.find(a=>a.src.endsWith('/rain.wav')).loop),true);
 await page.locator('#stopSound').tap();
});

test('mobile: desktop JSON imports, favorites persist offline, background resume catches elapsed time',async()=>{
 await ready();const state={version:1,focus:25,rest:5,phase:'focus',remaining:1200,totalSeconds:420,cycles:3,day:'2026-10-23',eligibleDay:null,scene:'warm-pond',volume:.35,effects:true,unlocked:['warm-pond','dream-ocean'],favorites:['dream-ocean']};
 await page.locator('#importFile').setInputFiles({name:'电脑备份.json',mimeType:'application/json',buffer:Buffer.from(JSON.stringify(state))});await page.waitForFunction(()=>document.getElementById('count').textContent==='3');await context.setOffline(true);await page.reload();assert.equal(await page.locator('#time').innerText(),'20:00');
 await page.locator('#profile').tap();await page.locator('#favoritesTab').tap();await page.locator('#favoritesScenes [data-choose-scene="dream-ocean"]').tap();assert.equal(await page.locator('html').getAttribute('data-scene'),'dream-ocean');
 await page.clock.install();await page.locator('#toggle').tap();await page.clock.fastForward(5000);await page.waitForFunction(()=>document.getElementById('time').textContent==='19:55');await page.locator('#toggle').tap();await page.reload();assert.equal(await page.locator('#time').innerText(),'19:55');
 const saved=await page.evaluate(()=>JSON.parse(localStorage.getItem('yiyu.garden.v1')));assert.deepEqual(saved.favorites,['dream-ocean']);assert.equal(saved.scene,'dream-ocean');
});

test('mobile: countdown sits lower in portrait and clears the header and bottom controls',async()=>{
 for(const viewport of [{width:375,height:667},{width:390,height:844},{width:430,height:932}]){
  await page.setViewportSize(viewport);
  for(const id of scenes.filter(id=>id!=='airplane-window')){
   await scene(id);
   const timer=await page.locator('.timer-zone').boundingBox(),header=await page.locator('header').boundingBox();
   const previousTop=viewport.height*.12;
   assert.ok(timer.y-previousTop>=viewport.height*.059,'Countdown is visibly lower than the previous mobile layout');
   assert.ok(timer.y>=header.y+header.height,'Countdown clears the header');
   const controls=await page.locator('#toggle').boundingBox();
   assert.ok(timer.y+timer.height<controls.y-44,'Countdown and status clear the bottom controls');
  }
 }
});

test('mobile: larger play and pause glyphs are centered, aligned with side icons, and remain tappable',async()=>{
 for(const viewport of [{width:375,height:667},{width:390,height:844},{width:430,height:932},{width:844,height:390}]){
  await page.setViewportSize(viewport);await scene('wisteria-glow');
  for(const running of [false,true]){
   if(running)await page.locator('#toggle').tap();
   const geometry=await page.evaluate(()=>{
    const button=document.getElementById('toggle'),svg=button.querySelector('svg'),b=button.getBoundingClientRect(),s=svg.getBoundingClientRect();
    const sideCenters=[...document.querySelectorAll('.side-control .icon')].map(el=>{const r=el.getBoundingClientRect();return r.y+r.height/2;});
    const shape=svg.querySelector('path'),shapeBox=shape.getBBox();
    return {button:{x:b.x,y:b.y,w:b.width,h:b.height},svg:{x:s.x,y:s.y,w:s.width,h:s.height},sideCenters,view:svg.viewBox.baseVal.width,shapeHeight:shapeBox.height,label:button.ariaLabel};
   });
   const b=geometry.button,s=geometry.svg;
   assert.ok(b.w>=(viewport.width<600?88:72),'Round tap target is enlarged');
   assert.ok(s.w>=48&&s.h>=48,'Glyph canvas is at least 48px');
   assert.ok(geometry.shapeHeight*s.h/geometry.view>=27,'Visible symbol is substantially larger than the old 14-17px glyph');
   assert.ok(Math.abs(s.x+s.w/2-b.x-b.w/2)<1&&Math.abs(s.y+s.h/2-b.y-b.h/2)<1,'SVG is centered in its circle');
   if(viewport.width<600)for(const center of geometry.sideCenters)assert.ok(Math.abs(center-(s.y+s.h/2))<1,'All three icon centers share a horizontal line');
   assert.equal(geometry.label,running?'暂停计时':'开始计时');
   if(running){await page.waitForFunction(()=>document.getElementById('time').textContent!=='25:00');await page.locator('#toggle').tap();assert.equal(await page.locator('#toggle').getAttribute('aria-label'),'开始计时');}
  }
 }
 await page.setViewportSize({width:390,height:844});await scene('wisteria-glow');await page.locator('#toggle').tap();
 await page.screenshot({path:path.join(root,'.preview/mobile-controls-updated.png')});
});

test('mobile: small iPhone and landscape controls fit with scrollable personal panel',async()=>{
 for(const viewport of [{width:375,height:667},{width:430,height:932},{width:844,height:390}]){
  await page.setViewportSize(viewport);await scene('airplane-window');
  for(const selector of ['#settings','#profile','#toggle','#sound']){const b=await page.locator(selector).boundingBox();assert.ok(b.x>=0&&b.y>=0&&b.x+b.width<=viewport.width+1&&b.y+b.height<=viewport.height+1,`${JSON.stringify(viewport)} ${selector}`);}
  await page.locator('#profile').tap();const box=await page.locator('#profileDialog').boundingBox();assert.ok(box.x>=0&&box.y>=0&&box.width<=viewport.width&&box.height<=viewport.height);
  await page.locator('#profileDialog .close').tap();
 }
});
