const {test}=require('node:test');
const assert=require('node:assert/strict');
const {browserSuite}=require('./helpers/browser.cjs');
const suite=browserSuite();
const url='http://127.0.0.1:8765/?preview=book-pages';
async function ready(page){await page.waitForFunction(()=>['true','error'].includes(document.getElementById('pond').dataset.bookReady));assert.equal(await page.locator('#pond').getAttribute('data-book-ready'),'true','All three image atlases must decode');await page.waitForFunction(()=>Number(document.getElementById('pond').dataset.autoTurns)>0);}
async function point(page){return page.evaluate(()=>{const [x,y,w,h]=JSON.parse(document.getElementById('pond').dataset.bookBounds);return {x:x+w/2,y:y+h*.6};});}

test('book: original image atlases render green book on white without phone interface or lost saved scene',async()=>{
  const {page}=suite;const original=await page.evaluate(()=>JSON.parse(localStorage.getItem('yiyu.garden.v1')).scene);
  await page.goto(url);await ready(page);
  const pixels=await page.evaluate(()=>{
    const c=document.getElementById('pond'),ctx=c.getContext('2d');
    const [x,y,w,h]=JSON.parse(c.dataset.bookBounds);const sample=ctx.getImageData(x,y,w,h).data;
    let green=0;for(let i=0;i<sample.length;i+=4)if(sample[i+1]>sample[i]*1.12&&sample[i+1]>sample[i+2]*1.15&&sample[i+1]<180)green++;
    return {corner:Array.from(ctx.getImageData(10,10,1,1).data),green};
  });
  assert.deepEqual(pixels.corner,[255,255,255,255]);assert.ok(pixels.green>1000,'Original green cover pixels must really render');
  assert.equal(await page.locator('#pond').getAttribute('data-renderer'),'book-pages');
  assert.equal(await page.evaluate(()=>JSON.parse(localStorage.getItem('yiyu.garden.v1')).scene),original);
  await suite.screenshot('book-pages.png');
});

test('book: untouched auto turns retain original 2.2-second cadence',async()=>{
  const {page}=suite;
  await page.addInitScript(()=>{window.turnTimes=[];document.addEventListener('garden-page-turn',e=>window.turnTimes.push({kind:e.detail.kind,time:performance.now()}));});
  await page.clock.install();await page.goto(url);await ready(page);await page.clock.runFor(6800);
  const times=await page.evaluate(()=>window.turnTimes.filter(t=>t.kind==='auto'));
  assert.ok(times.length>=4);
  for(let i=1;i<times.length;i++)assert.ok(Math.abs(times[i].time-times[i-1].time-2200)<50,'Original auto cadence must not accelerate or stall');
  assert.equal(await page.locator('#pond').getAttribute('data-click-turns'),'0');
});

test('book: one click means one extra full turn; blank sky and controls do not turn; sound respects effects switch',async()=>{
  const {page}=suite;
  await page.addInitScript(()=>{window.paperSounds=0;HTMLMediaElement.prototype.play=function(){if(this.src.endsWith('/audio/page-turn.wav'))window.paperSounds++;return Promise.resolve();};});
  await page.clock.install();await page.goto(url);await ready(page);await page.clock.runFor(850);
  await page.mouse.click(50,400);assert.equal(await page.locator('#pond').getAttribute('data-click-turns'),'0');
  const p=await point(page);await page.mouse.click(p.x,p.y);await page.clock.runFor(800);
  assert.equal(await page.locator('#pond').getAttribute('data-click-turns'),'1');
  assert.ok(await page.evaluate(()=>window.paperSounds>=2));
  await page.mouse.click(p.x,p.y);await page.mouse.click(p.x,p.y);await page.clock.runFor(1600);
  assert.equal(await page.locator('#pond').getAttribute('data-click-turns'),'3');
  await page.locator('#sound').click();await page.locator('#effects').uncheck();await page.locator('#soundDialog .close').click();
  const before=await page.evaluate(()=>window.paperSounds);await page.clock.runFor(3000);
  assert.equal(await page.evaluate(()=>window.paperSounds),before);
  assert.equal(await page.locator('#pond').getAttribute('data-click-turns'),'3');
});

test('book: backup and timer remain usable, switching to fish removes book animation and click handler',async()=>{
  const {page}=suite;
  const state={version:1,focus:25,rest:5,phase:'focus',remaining:1200,totalSeconds:420,cycles:3,day:'2026-10-23',eligibleDay:null,scene:'book-pages',volume:.35,effects:true};
  await page.locator('#importFile').setInputFiles({name:'book-backup.json',mimeType:'application/json',buffer:Buffer.from(JSON.stringify(state))});
  await ready(page);await page.reload();await ready(page);
  assert.equal(await page.locator('#time').innerText(),'20:00');assert.equal(await page.locator('#count').innerText(),'3');
  await page.locator('#toggle').click();await page.waitForFunction(()=>document.getElementById('time').textContent!=='20:00');await page.locator('#toggle').click();
  await page.locator('#importFile').setInputFiles({name:'warm.json',mimeType:'application/json',buffer:Buffer.from(JSON.stringify({...state,scene:'warm-pond'}))});
  await page.waitForFunction(()=>document.getElementById('pond').dataset.renderer==='pond');
  assert.equal(await page.locator('#pond').getAttribute('data-book-ready'),null);
  await page.mouse.click(720,600);assert.equal(await page.locator('#pond').getAttribute('data-click-turns'),null);
});
