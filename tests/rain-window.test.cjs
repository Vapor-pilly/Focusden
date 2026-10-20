const {test}=require('node:test');
const assert=require('node:assert/strict');
const {browserSuite}=require('./helpers/browser.cjs');
const suite=browserSuite();
const url='http://127.0.0.1:8765/?preview=rain-window';

test('rain: star material flashes independently with bright and dim phases instead of synchronized blinking',async()=>{
  const {page}=suite;
  await page.addInitScript(()=>{
    let seed=7351;Math.random=()=>{seed=(seed*1664525+1013904223)>>>0;return seed/4294967296;};
    window.starSamples=[];
    const translate=CanvasRenderingContext2D.prototype.translate;
    CanvasRenderingContext2D.prototype.translate=function(x,y){if(this.canvas.id==='pond'&&x>10)this.starOrigin=[x,y];return translate.call(this,x,y);};
    const fill=CanvasRenderingContext2D.prototype.fill;
    CanvasRenderingContext2D.prototype.fill=function(...args){
      if(this.canvas.id==='pond'&&this.globalCompositeOperation==='screen'&&this.fillStyle==='#fffff5'){
        window.starSamples.push({xy:this.starOrigin,alpha:this.globalAlpha,time:performance.now()});
      }
      return fill.apply(this,args);
    };
  });
  await page.clock.install();await page.goto(url);
  await page.clock.runFor(6000);
  const samples=await page.evaluate(()=>window.starSamples);
  assert.ok(samples.length>100,'Actual luminous star shapes must be drawn');
  const groups=new Map();
  for(const s of samples){const key=s.xy.map(n=>Math.round(n*10)).join(',');if(!groups.has(key))groups.set(key,[]);groups.get(key).push(s);}
  const varied=[...groups.values()].filter(g=>Math.max(...g.map(x=>x.alpha))>.5&&Math.min(...g.map(x=>x.alpha))<.15);
  assert.ok(varied.length>=5,'Multiple individual beads visibly brighten and dim');
  const peaks=varied.map(g=>g.reduce((a,b)=>a.alpha>b.alpha?a:b).time);
  assert.ok(Math.max(...peaks)-Math.min(...peaks)>1500,'Individual star peaks must be staggered');
  await suite.screenshot('rain-stars.png');
});

test('rain: daylight green scene has scattered small drops, no pond renderer, and does not replace saved scene',async()=>{
  const {page}=suite;
  const saved=await page.evaluate(()=>JSON.parse(localStorage.getItem('yiyu.garden.v1')));
  await page.goto(url);
  await page.waitForFunction(()=>Number(document.getElementById('pond').dataset.drops)>0);
  assert.equal(await page.locator('#pond').getAttribute('data-renderer'),'rain-window');
  assert.ok((await page.locator('#hint').innerText()).includes('擦拭'));
  const info=await page.evaluate(()=>{
    const canvas=document.getElementById('pond'),c=canvas.getContext('2d'),d=devicePixelRatio;
    const a=Array.from(c.getImageData(120*d,450*d,1,1).data);
    return {a,drops:Number(canvas.dataset.drops),saved:JSON.parse(localStorage.getItem('yiyu.garden.v1'))};
  });
  assert.ok(info.a[1]>info.a[2]&&info.a[1]>100,'Rendered scene is soft green in daylight');
  assert.ok(info.drops>20&&info.drops<120,'Drops remain scattered rather than heavy rainfall');
  assert.equal(info.saved.scene,saved.scene);
  await suite.screenshot('rain-window.png');
});

test('rain: dragging visibly wipes fog and clear area gradually returns after release',async()=>{
  const {page}=suite;
  await page.clock.install();
  await page.goto(url);
  await page.waitForFunction(()=>Number(document.getElementById('pond').dataset.drops)>0);
  await page.evaluate(()=>{
    const c=document.getElementById('pond');
    window.rainSample=()=>Array.from(c.getContext('2d').getImageData(730*devicePixelRatio,520*devicePixelRatio,120*devicePixelRatio,80*devicePixelRatio).data);
    window.rainBefore=window.rainSample();
    window.rainDiff=()=>{const a=window.rainSample(),b=window.rainBefore;let n=0;for(let i=0;i<a.length;i+=4)n+=Math.abs(a[i]-b[i])+Math.abs(a[i+1]-b[i+1])+Math.abs(a[i+2]-b[i+2]);return n/(a.length/4*3);};
  });
  await page.mouse.move(720,560);await page.mouse.down();
  await page.mouse.move(860,560,{steps:15});
  await page.waitForFunction(()=>window.rainDiff()>4);
  const wiped=await page.evaluate(()=>window.rainDiff());
  assert.equal(await page.locator('#pond').getAttribute('data-interacting'),'true');
  await suite.screenshot('rain-window-wiped.png');
  await page.mouse.up();
  assert.equal(await page.locator('#pond').getAttribute('data-interacting'),'false');
  await page.clock.fastForward(16000);
  await page.waitForFunction(()=>document.getElementById('pond').dataset.wipes==='0');
  const recovered=await page.evaluate(()=>window.rainDiff());
  assert.ok(recovered<wiped*.3,'Fog visibly returns instead of permanently staying clear');
});

test('rain: controls do not wipe, losing focus releases interaction, and timer continues',async()=>{
  const {page}=suite;
  await page.goto(url);
  await page.waitForFunction(()=>document.getElementById('pond').dataset.wipes==='0');
  await page.locator('#settings').click();
  assert.equal(await page.locator('#pond').getAttribute('data-wipes'),'0');
  await page.locator('#settingsDialog .close').click();
  await page.locator('#toggle').click();
  await page.mouse.move(700,520);await page.mouse.down();
  await page.evaluate(()=>window.dispatchEvent(new Event('blur')));
  assert.equal(await page.locator('#pond').getAttribute('data-interacting'),'false');
  await page.mouse.up();
  await page.waitForFunction(()=>document.getElementById('time').textContent!=='25:00');
  await page.locator('#toggle').click();
});

test('rain: restoring a saved fish scene disposes rain, and rain backup restores without losing totals',async()=>{
  const {page}=suite;
  const fixture={version:1,focus:25,rest:5,phase:'focus',remaining:1200,totalSeconds:420,cycles:3,day:'2026-10-20',eligibleDay:null,scene:'rain-window',volume:.35,effects:true};
  async function restore(scene){
    await page.locator('#importFile').setInputFiles({name:'backup.json',mimeType:'application/json',buffer:Buffer.from(JSON.stringify({...fixture,scene}))});
    await page.waitForFunction(id=>document.documentElement.dataset.scene===id,scene);
  }
  await restore('rain-window');
  await page.waitForFunction(()=>Number(document.getElementById('pond').dataset.drops)>0);
  await restore('warm-pond');
  assert.equal(await page.locator('#pond').getAttribute('data-renderer'),'pond');
  assert.equal(await page.locator('#pond').getAttribute('data-drops'),null);
  await page.mouse.move(800,560);await page.mouse.down();await page.mouse.up();
  assert.equal(await page.locator('#pond').getAttribute('data-wipes'),null);
  await restore('rain-window');await page.reload();
  assert.equal(await page.locator('html').getAttribute('data-scene'),'rain-window');
  assert.equal(await page.locator('#count').innerText(),'3');
  assert.equal(await page.locator('#time').innerText(),'20:00');
  assert.equal(await page.locator('#toggle').getAttribute('aria-label'),'开始计时');
});
