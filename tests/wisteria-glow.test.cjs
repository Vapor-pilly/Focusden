const {test}=require('node:test');
const assert=require('node:assert/strict');
const {browserSuite}=require('./helpers/browser.cjs');
const suite=browserSuite(),url='http://127.0.0.1:8765/?preview=wisteria-glow';
async function ready(page){await page.waitForFunction(()=>document.getElementById('pond').dataset.wisteriaReady==='true');}
async function target(page){return page.evaluate(()=>JSON.parse(document.getElementById('pond').dataset.vineTargets).find(v=>v.x>180&&v.x<innerWidth*.3&&v.y>100));}
const data=(page,key)=>page.locator('#pond').getAttribute('data-'+key);

test('wisteria: watercolor purple stays in upper half at two desktop sizes, wind moves independently, no automatic stars',async()=>{
  const {page}=suite;const saved=await page.evaluate(()=>JSON.parse(localStorage.getItem('yiyu.garden.v1')).scene);
  await page.clock.install();await page.goto(url);await ready(page);
  for(const size of [{width:1440,height:900},{width:1280,height:720}]){
    await page.setViewportSize(size);await page.evaluate(()=>window.dispatchEvent(new Event('resize')));await page.clock.runFor(100);
    const pixels=await page.evaluate(()=>{
      const c=document.getElementById('pond'),ctx=c.getContext('2d'),d=devicePixelRatio;
      function purple(y,height){const a=ctx.getImageData(0,y*d,c.width,height*d).data;let count=0;for(let i=0;i<a.length;i+=4)if(a[i+2]>a[i+1]+9&&a[i]>a[i+1]+3)count++;return count;}
      return {top:purple(0,innerHeight/2),bottom:purple(innerHeight/2,innerHeight/2)};
    });
    assert.ok(pixels.top>8000,'Real lavender flower pixels must draw '+JSON.stringify(pixels));assert.equal(pixels.bottom,0,'No vine pixels below halfway');
    const targets=JSON.parse(await data(page,'vine-targets'));assert.ok(targets.length>=26);assert.ok(targets.every(v=>v.length<=size.height*.5));
  }
  const before=JSON.parse(await data(page,'vine-motion'));await page.clock.runFor(1800);const after=JSON.parse(await data(page,'vine-motion'));
  assert.ok(before.some((x,i)=>Math.abs(x-after[i])>1),'Wind must move the rendered stems');
  assert.ok(new Set(before.map((x,i)=>(after[i]-x).toFixed(1))).size>3,'Stems sway independently');
  assert.equal(await data(page,'particle-count'),'0');assert.equal(await page.evaluate(()=>JSON.parse(localStorage.getItem('yiyu.garden.v1')).scene),saved);
  await page.setViewportSize({width:1440,height:900});await page.clock.runFor(30);await suite.screenshot('wisteria-glow.png');
});

test('wisteria: clicking a moving vine drops all three pink-white shapes with twinkling and visible glowing pixels',async()=>{
  const {page}=suite;await page.clock.install();await page.goto(url);await ready(page);await page.clock.runFor(30);
  const p=await target(page);assert.ok(p);await page.mouse.click(p.x,p.y);await page.clock.runFor(300);
  assert.equal(await data(page,'vine-clicks'),'1');assert.equal(await data(page,'particle-count'),'24');
  const a=JSON.parse(await data(page,'sparkles'));assert.deepEqual([...new Set(a.map(p=>p.kind))].sort(),[0,1,2]);
  const img1=await page.locator('#pond').screenshot();await page.clock.runFor(700);const b=JSON.parse(await data(page,'sparkles'));
  assert.ok(b.every((p,i)=>p.y>a[i].y+10),'Particles must fall downward');
  const samples=[b];for(let step=0;step<4;step++){await page.clock.runFor(220);samples.push(JSON.parse(await data(page,'sparkles')));}
  assert.ok(b.some((_,i)=>Math.max(...samples.map(s=>s[i].light))-Math.min(...samples.map(s=>s[i].light))>.25),'Individual light must pass through bright and dim phases over multiple timestamps');
  assert.notDeepEqual(img1,await page.locator('#pond').screenshot());
  const pink=await page.evaluate(()=>{const c=document.getElementById('pond'),ctx=c.getContext('2d');const ps=JSON.parse(c.dataset.sparkles);let hit=0;for(const p of ps){const a=ctx.getImageData(p.x-5,p.y-5,10,10).data;for(let i=0;i<a.length;i+=4)if(a[i]>230&&a[i+2]>a[i+1]+2)hit++;}return hit;});
  assert.ok(pink>10,'Pink-white sparkle cores must really render');await suite.screenshot('wisteria-glow-interaction.png');
});

test('wisteria: blank sky and UI do not drop stars; repeated clicks are bounded, stars expire, reduced motion stops wind',async()=>{
  const {page}=suite;await page.clock.install();await page.goto(url);await ready(page);await page.clock.runFor(30);
  await page.mouse.click(100,650);await page.locator('#settings').click();await page.locator('#settingsDialog .close').click();
  assert.equal(await data(page,'particle-count'),'0');
  const p=await target(page);for(let i=0;i<20;i++)await page.mouse.click(p.x,p.y);
  assert.ok(Number(await data(page,'particle-count'))<=300);assert.ok(Number(await data(page,'vine-clicks'))>0);
  await page.clock.runFor(9500);assert.equal(await data(page,'particle-count'),'0');
  await page.emulateMedia({reducedMotion:'reduce'});await page.clock.runFor(50);const a=await data(page,'vine-motion');await page.clock.runFor(1800);assert.equal(await data(page,'vine-motion'),a);
});

test('wisteria: backup and timer survive reload, switching to fish removes particles and vine input',async()=>{
  const {page}=suite;const state={version:1,focus:25,rest:5,phase:'focus',remaining:1200,totalSeconds:420,cycles:3,day:'2026-10-23',eligibleDay:null,scene:'wisteria-glow',volume:.35,effects:true};
  await page.locator('#importFile').setInputFiles({name:'wisteria.json',mimeType:'application/json',buffer:Buffer.from(JSON.stringify(state))});await ready(page);await page.reload();await ready(page);
  assert.equal(await page.locator('#time').innerText(),'20:00');assert.equal(await page.locator('#count').innerText(),'3');
  await page.locator('#toggle').click();await page.waitForFunction(()=>document.getElementById('time').textContent!=='20:00');await page.locator('#toggle').click();
  const p=await target(page);await page.mouse.click(p.x,p.y);assert.ok(Number(await data(page,'particle-count'))>0);
  await page.locator('#importFile').setInputFiles({name:'fish.json',mimeType:'application/json',buffer:Buffer.from(JSON.stringify({...state,scene:'warm-pond'}))});
  await page.waitForFunction(()=>document.getElementById('pond').dataset.renderer==='pond');assert.equal(await data(page,'wisteria-ready'),null);assert.equal(await data(page,'particle-count'),null);
  await page.mouse.click(p.x,p.y);assert.equal(await data(page,'vine-clicks'),null);
});
