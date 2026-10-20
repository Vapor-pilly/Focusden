const {test}=require('node:test');
const assert=require('node:assert/strict');
const {browserSuite}=require('./helpers/browser.cjs');
const suite=browserSuite();
const fixture=overrides=>({version:1,focus:25,rest:5,phase:'focus',remaining:1250,totalSeconds:300,cycles:3,day:'2026-10-20',eligibleDay:null,scene:'warm-pond',volume:.35,effects:true,...overrides});
async function importState(page,state){
  await page.locator('#importFile').setInputFiles({name:'old-backup.json',mimeType:'application/json',buffer:Buffer.from(JSON.stringify(state))});
  await page.waitForFunction(()=>document.getElementById('count').textContent==='3');
}

test('scenes: preview renders real blue pixels, preserves saved warm scene, and warm preview remains available',async()=>{
  const {page}=suite;
  await importState(page,fixture());
  await page.goto('http://127.0.0.1:8765/?preview=dream-ocean');
  await page.waitForFunction(()=>document.querySelector('canvas').getContext('2d').getImageData(10,10,1,1).data[2]>140);
  assert.equal(await page.locator('html').getAttribute('data-scene'),'dream-ocean');
  assert.ok((await page.locator('#sceneName').innerText()).includes('蓝梦鱼海'));
  const saved=await page.evaluate(()=>JSON.parse(localStorage.getItem('yiyu.garden.v1')));
  assert.equal(saved.scene,'warm-pond');assert.equal(saved.remaining,1250);assert.equal(saved.cycles,3);
  await page.goto('http://127.0.0.1:8765/?preview=warm-pond');
  assert.equal(await page.locator('html').getAttribute('data-scene'),'warm-pond');
  await page.waitForFunction(()=>{const p=document.querySelector('canvas').getContext('2d').getImageData(10,10,1,1).data;return p[0]>100&&p[1]>100&&p[2]<200;});
});

test('scenes: glowing fish actually draw and gather toward the unchanged pointer light, then release',async()=>{
  const {page}=suite;
  await page.addInitScript(()=>{
    const original=CanvasRenderingContext2D.prototype.translate;
    window.drawnFish=[];window.glowSeen=false;
    CanvasRenderingContext2D.prototype.translate=function(x,y){
      if(this.canvas.id==='pond'){window.drawnFish.push([x,y]);if(window.drawnFish.length>124)window.drawnFish.shift();}
      return original.call(this,x,y);
    };
    const fill=CanvasRenderingContext2D.prototype.fill;
    CanvasRenderingContext2D.prototype.fill=function(...args){if(this.canvas.id==='pond'&&this.shadowBlur>0)window.glowSeen=true;return fill.apply(this,args);};
  });
  await page.goto('http://127.0.0.1:8765/?preview=dream-ocean');
  await page.waitForFunction(()=>window.glowSeen&&window.drawnFish.length===124);
  const distance=()=>page.evaluate(()=>window.drawnFish.reduce((s,p)=>s+Math.hypot(p[0]-720,p[1]-520),0)/window.drawnFish.length);
  const before=await distance();
  await page.mouse.move(720,520);await page.mouse.down();
  await page.waitForFunction(()=>document.getElementById('pond').dataset.interacting==='true');
  await page.waitForFunction(b=>window.drawnFish.reduce((s,p)=>s+Math.hypot(p[0]-720,p[1]-520),0)/window.drawnFish.length<b*.8,before,{timeout:20000});
  const light=await page.evaluate(()=>Array.from(document.getElementById('pond').getContext('2d').getImageData(720,520,1,1).data));
  assert.ok(light[0]>180&&light[1]>180,'Pointer remains a warm bright light');
  await suite.screenshot('dream-ocean-interaction.png');
  await page.mouse.up();
  assert.equal(await page.locator('#pond').getAttribute('data-interacting'),'false');
  await page.mouse.move(700,500);await page.mouse.down();
  await page.evaluate(()=>window.dispatchEvent(new Event('blur')));
  assert.equal(await page.locator('#pond').getAttribute('data-interacting'),'false');
  await page.mouse.up();
});

test('scenes: legacy daily eligibility switches at next open only once; backup restores new scene and consumption',async()=>{
  const {page}=suite;
  const yesterday=await page.evaluate(()=>{const d=new Date();d.setDate(d.getDate()-1);return `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`;});
  await importState(page,fixture({eligibleDay:yesterday}));
  assert.equal(await page.locator('html').getAttribute('data-scene'),'dream-ocean');
  let saved=await page.evaluate(()=>JSON.parse(localStorage.getItem('yiyu.garden.v1')));
  assert.equal(saved.consumedDay,yesterday);
  await page.reload();
  assert.equal(await page.locator('html').getAttribute('data-scene'),'dream-ocean');
  await importState(page,saved);
  saved=await page.evaluate(()=>JSON.parse(localStorage.getItem('yiyu.garden.v1')));
  assert.equal(saved.scene,'dream-ocean');assert.equal(saved.cycles,3);assert.equal(saved.totalSeconds,300);
  assert.equal(saved.consumedDay,yesterday);
  assert.equal(await page.locator('#toggle').getAttribute('aria-label'),'开始计时');
});
