const {test}=require('node:test');
const assert=require('node:assert/strict');
const {browserSuite}=require('./helpers/browser.cjs');
const suite=browserSuite();
const url='http://127.0.0.1:8765/?preview=dandelion-night';

test('dandelion: a large bright textured moon occupies upper right while countdown stays clear',async()=>{
  const {page}=suite;await page.goto(url);
  await page.waitForFunction(()=>{const c=document.getElementById('pond'),p=c.getContext('2d').getImageData(innerWidth*.88,innerHeight*.19,1,1).data;return p[0]>150;});
  const samples=await page.evaluate(()=>{
    const c=document.getElementById('pond').getContext('2d');
    return [[.88,.19],[.80,.19],[.88,.34],[.35,.19]].map(([x,y])=>Array.from(c.getImageData(x*innerWidth,y*innerHeight,1,1).data));
  });
  assert.ok(samples.slice(0,3).every(p=>p[0]>140&&p[1]>140),'Moon must cover a large area, not just a small dot');
  assert.ok(samples[3][2]>samples[3][0]&&samples[3][0]<100,'Left side remains a deep blue sky');
  assert.equal(await page.locator('#time').innerText(),'25:00');
  await suite.screenshot('dandelion-moon.png');
});

test('dandelion: every attached and drifting seed has glow, stronger wind sways flowers and releases seeds without touching',async()=>{
  const {page}=suite;
  await page.addInitScript(()=>{
    window.luminousFrames=[];window.swayPositions=[];
    let tufts=0,halos=0,cores=0;
    const draw=CanvasRenderingContext2D.prototype.drawImage;
    CanvasRenderingContext2D.prototype.drawImage=function(source,...args){
      if(this.canvas.id==='pond'){
        if(source.width===48&&source.height===48)halos++;
        else if(source.width>100){if(tufts)window.luminousFrames.push({tufts,halos,cores});if(window.luminousFrames.length>12)window.luminousFrames.shift();tufts=halos=cores=0;}
      }
      return draw.call(this,source,...args);
    };
    const translate=CanvasRenderingContext2D.prototype.translate;
    CanvasRenderingContext2D.prototype.translate=function(x,y){if(this.canvas.id==='pond')tufts++;return translate.call(this,x,y);};
    const fill=CanvasRenderingContext2D.prototype.fill;
    CanvasRenderingContext2D.prototype.fill=function(...args){if(this.canvas.id==='pond'&&this.shadowBlur>0)cores++;return fill.apply(this,args);};
    const radial=CanvasRenderingContext2D.prototype.createRadialGradient;
    CanvasRenderingContext2D.prototype.createRadialGradient=function(x,y,r,...args){if(this.canvas.id==='pond'&&x>190&&x<290&&y>540&&y<600)window.swayPositions.push(x);return radial.call(this,x,y,r,...args);};
  });
  await page.clock.install();await page.goto(url);await page.clock.runFor(6500);
  assert.equal(await page.locator('#pond').getAttribute('data-released-by-click'),'0');
  const wind=Number(await page.locator('#pond').getAttribute('data-released-by-wind'));
  assert.ok(wind>=1&&wind<=5,'A few seeds detach in the wind without any pointer action');
  const state=await page.evaluate(()=>({frames:window.luminousFrames,positions:window.swayPositions}));
  assert.ok(state.frames.length>=5);
  assert.ok(state.frames.every(f=>f.tufts>900&&f.halos===f.tufts&&f.cores===f.tufts),'Every drawn seed must have both halo and luminous core, not just occasional selected seeds');
  assert.ok(Math.max(...state.positions)-Math.min(...state.positions)>22,'Flower movement must be visibly larger than previous 2.3px sway');
  await suite.screenshot('dandelion-idle-wind.png');
});
async function flowerPoint(page,index=4){
  return page.evaluate(i=>{const f=window.GardenScenes.get('dandelion-night').layout[i];return {x:f[0]*innerWidth,y:(1-f[1])*innerHeight};},index);
}

test('dandelion: renders deep blue night and a staggered flower row without replacing saved scene',async()=>{
  const {page}=suite;
  const saved=await page.evaluate(()=>JSON.parse(localStorage.getItem('yiyu.garden.v1')));
  await page.goto(url);
  await page.waitForFunction(()=>Number(document.getElementById('pond').dataset.flowers)>0);
  await page.waitForFunction(()=>{const c=document.getElementById('pond');const p=c.getContext('2d').getImageData(500,150,1,1).data;return p[2]>p[1]&&p[1]>p[0];});
  assert.equal(await page.locator('#pond').getAttribute('data-renderer'),'dandelion-night');
  const pixel=await page.evaluate(()=>{const c=document.getElementById('pond');return Array.from(c.getContext('2d').getImageData(500,150,1,1).data);});
  assert.ok(pixel[2]>pixel[1]&&pixel[1]>pixel[0],'Night gradient must be deep blue');
  assert.equal(await page.locator('#pond').getAttribute('data-flowers'),'14');
  assert.equal(await page.locator('#pond').getAttribute('data-released-by-click'),'0');
  const after=await page.evaluate(()=>JSON.parse(localStorage.getItem('yiyu.garden.v1')));
  assert.equal(after.scene,saved.scene);assert.equal(after.cycles,saved.cycles);
  await suite.screenshot('dandelion-night.png');
});

test('dandelion: actual glowing seed shapes drift right and upward after clicking a flower',async()=>{
  const {page}=suite;
  await page.addInitScript(()=>{
    window.floatingPoints=[];window.pappusStrokes=0;window.seedGlow=false;
    const translate=CanvasRenderingContext2D.prototype.translate;
    CanvasRenderingContext2D.prototype.translate=function(x,y){if(this.canvas.id==='pond'&&this.globalCompositeOperation==='screen'){window.floatingPoints.push([x,y]);if(window.floatingPoints.length>23)window.floatingPoints.shift();}return translate.call(this,x,y);};
    const stroke=CanvasRenderingContext2D.prototype.stroke;
    CanvasRenderingContext2D.prototype.stroke=function(...args){if(this.canvas.id==='pond'&&this.globalCompositeOperation==='screen')window.pappusStrokes++;return stroke.apply(this,args);};
    const fill=CanvasRenderingContext2D.prototype.fill;
    CanvasRenderingContext2D.prototype.fill=function(...args){if(this.canvas.id==='pond'&&this.globalCompositeOperation==='screen'&&this.shadowBlur>0)window.seedGlow=true;return fill.apply(this,args);};
  });
  await page.goto(url);
  const p=await flowerPoint(page);await page.mouse.click(p.x,p.y);
  await page.waitForFunction(()=>window.floatingPoints.length===23);
  const mean=()=>page.evaluate(()=>{const p=window.floatingPoints;return {x:p.reduce((s,a)=>s+a[0],0)/p.length,y:p.reduce((s,a)=>s+a[1],0)/p.length};});
  const first=await mean();
  await page.waitForFunction(a=>{const p=window.floatingPoints;return p.reduce((s,b)=>s+b[0],0)/p.length>a.x+35&&p.reduce((s,b)=>s+b[1],0)/p.length<a.y-25;},first);
  assert.equal(await page.locator('#pond').getAttribute('data-released-by-click'),'23');
  assert.ok(Number(await page.locator('#pond').getAttribute('data-floating-seeds'))>=23);
  assert.ok(await page.evaluate(()=>window.pappusStrokes>100));
  await page.waitForFunction(()=>window.seedGlow);
  await suite.screenshot('dandelion-drifting.png');
});

test('dandelion: blank sky and controls do not trigger click releases; repeated clicks remain bounded and timer works',async()=>{
  const {page}=suite;await page.goto(url);
  await page.mouse.click(1000,450);
  assert.equal(await page.locator('#pond').getAttribute('data-released-by-click'),'0');
  await page.locator('#settings').click();await page.locator('#settingsDialog .close').click();
  assert.equal(await page.locator('#pond').getAttribute('data-released-by-click'),'0');
  const p=await flowerPoint(page);
  for(let i=0;i<5;i++)await page.mouse.click(p.x,p.y);
  assert.ok(Number(await page.locator('#pond').getAttribute('data-released-by-click'))<=68,'Only seeds attached to the clicked flower can detach');
  await page.locator('#toggle').click();await page.waitForFunction(()=>document.getElementById('time').textContent!=='25:00');await page.locator('#toggle').click();
});

test('dandelion: backup restores progress and switching away removes the old animation and interactions',async()=>{
  const {page}=suite;
  const state={version:1,focus:25,rest:5,phase:'focus',remaining:1200,totalSeconds:420,cycles:3,day:'2026-10-20',eligibleDay:null,scene:'dandelion-night',volume:.35,effects:true};
  async function restore(scene){await page.locator('#importFile').setInputFiles({name:'backup.json',mimeType:'application/json',buffer:Buffer.from(JSON.stringify({...state,scene}))});await page.waitForFunction(id=>document.documentElement.dataset.scene===id,scene);}
  await restore('dandelion-night');await page.reload();
  assert.equal(await page.locator('#count').innerText(),'3');assert.equal(await page.locator('#time').innerText(),'20:00');
  const p=await flowerPoint(page);await page.mouse.click(p.x,p.y);
  assert.ok(Number(await page.locator('#pond').getAttribute('data-floating-seeds'))>0);
  await restore('rain-window');
  assert.equal(await page.locator('#pond').getAttribute('data-flowers'),null);
  assert.equal(await page.locator('#pond').getAttribute('data-floating-seeds'),null);
  await page.mouse.click(p.x,p.y);
  assert.equal(await page.locator('#pond').getAttribute('data-floating-seeds'),null);
  assert.equal(await page.locator('#toggle').getAttribute('aria-label'),'开始计时');
});
