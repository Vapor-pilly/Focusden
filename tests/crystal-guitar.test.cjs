const {test}=require('node:test');
const assert=require('node:assert/strict');
const {browserSuite}=require('./helpers/browser.cjs');
const {readWav,rms}=require('./helpers/wav.cjs');
const path=require('node:path');
const suite=browserSuite(),url='http://127.0.0.1:8765/?preview=crystal-guitar';
async function ready(page){await page.waitForFunction(()=>document.getElementById('pond').dataset.guitarReady==='true');}

test('guitar: original cutouts render, guitar floats, ring rotates clockwise and both wings flutter',async()=>{
  const {page}=suite;await page.clock.install();await page.goto(url);await ready(page);
  await page.clock.runFor(30);
  const a=JSON.parse(await page.locator('#pond').getAttribute('data-guitar-pose'));
  const before=await page.locator('#pond').screenshot();await page.clock.runFor(700);
  const b=JSON.parse(await page.locator('#pond').getAttribute('data-guitar-pose'));
  const poses=[a,b];for(let i=0;i<6;i++){await page.clock.runFor(400);poses.push(JSON.parse(await page.locator('#pond').getAttribute('data-guitar-pose')));}
  assert.ok(Math.max(...poses.map(p=>p.float))-Math.min(...poses.map(p=>p.float))>3);assert.ok(b.angle>a.angle);assert.ok(Math.max(...poses.map(p=>p.wing))-Math.min(...poses.map(p=>p.wing))>.1);
  assert.notDeepEqual(before,await page.locator('#pond').screenshot());
  assert.equal(await page.locator('#sceneName').innerText(),'06 / 弦上幻光');
  const pixels=await page.evaluate(()=>{const c=document.getElementById('pond'),data=c.getContext('2d').getImageData(0,0,c.width,c.height).data;let purple=0,metal=0;for(let i=0;i<data.length;i+=4){if(data[i]>data[i+1]+15&&data[i+2]>data[i+1]+10)purple++;if(data[i]<160&&data[i+1]<170&&data[i+2]<180)metal++;}return {purple,metal};});
  assert.ok(pixels.purple>10000&&pixels.metal>1000,'Original pink and silver details actually draw');
  await suite.screenshot('crystal-guitar.png');
});

test('guitar: seven string positions play seven real local notes; blank/control clicks and effects-off stay silent',async()=>{
  const {page}=suite;
  await page.addInitScript(()=>{const Original=window.Audio;window.notes=[];window.Audio=function(...args){const a=new Original(...args);window.notes.push(a);return a;};window.Audio.prototype=Original.prototype;});
  await page.goto(url);await ready(page);
  for(const note of 'CDEFGAB'){
    const p=await page.evaluate(n=>JSON.parse(document.getElementById('pond').dataset.stringPoints).find(p=>p.note===n),note);
    await page.mouse.click(p.x,p.y);
    assert.equal(await page.locator('#pond').getAttribute('data-last-note'),note);
    await page.waitForFunction(n=>window.notes.some(a=>a.src.endsWith(`/guitar-${n}.wav`)&&!a.paused&&a.currentTime>0),note);
  }
  assert.equal(await page.locator('#pond').getAttribute('data-plucks'),'7');
  await page.mouse.click(50,500);await page.locator('#sound').click();
  assert.equal(await page.locator('#pond').getAttribute('data-plucks'),'7');
  await page.locator('#effects').uncheck();await page.locator('#soundDialog .close').click();
  await page.waitForTimeout(2900);
  const p=await page.evaluate(()=>JSON.parse(document.getElementById('pond').dataset.stringPoints)[0]);await page.mouse.click(p.x,p.y);
  assert.equal(await page.evaluate(()=>window.notes.filter(a=>a.src.includes('/guitar-')&&!a.paused).length),0);
});

test('guitar: persisted scene restores with timer data, switching cleans animation/listeners and stops strings',async()=>{
  const {page}=suite;
  const state={version:1,focus:25,rest:5,phase:'focus',remaining:1200,totalSeconds:420,cycles:3,day:'2026-10-23',eligibleDay:null,scene:'crystal-guitar',volume:.35,effects:true};
  await page.locator('#importFile').setInputFiles({name:'guitar.json',mimeType:'application/json',buffer:Buffer.from(JSON.stringify(state))});await ready(page);await page.reload();await ready(page);
  assert.equal(await page.locator('#time').innerText(),'20:00');assert.equal(await page.locator('#count').innerText(),'3');
  await page.locator('#importFile').setInputFiles({name:'fish.json',mimeType:'application/json',buffer:Buffer.from(JSON.stringify({...state,scene:'warm-pond'}))});
  await page.waitForFunction(()=>document.getElementById('pond').dataset.renderer==='pond');
  assert.equal(await page.locator('#pond').getAttribute('data-guitar-pose'),null);
  await page.mouse.click(700,600);assert.equal(await page.locator('#pond').getAttribute('data-plucks'),null);
});

test('guitar: plucked WAV files have decaying envelopes, distinct tuned pitches and no clipping',()=>{
  const frequencies=[261.6256,293.6648,329.6276,349.2282,391.9954,440,493.8833];
  [...'CDEFGAB'].forEach((note,index)=>{
    const a=readWav(path.join(__dirname,`../audio/guitar-${note}.wav`));assert.equal(a.duration,2.8);
    assert.ok(rms(a.samples.slice(0,a.rate/5))>rms(a.samples.slice(a.rate*2))*2);
    let peak=0;for(const x of a.samples)peak=Math.max(peak,Math.abs(x));assert.ok(peak<=.361);
    const slice=a.samples.slice(a.rate*.1,a.rate*.5),f=frequencies[index];let best=0,bestLag=0;
    for(let lag=Math.floor(a.rate/f*.96);lag<=Math.ceil(a.rate/f*1.04);lag++){
      let corr=0,e1=0,e2=0;for(let i=0;i<slice.length-lag;i++){corr+=slice[i]*slice[i+lag];e1+=slice[i]**2;e2+=slice[i+lag]**2;}corr/=Math.sqrt(e1*e2);if(corr>best){best=corr;bestLag=lag;}
    }
    assert.ok(Math.abs(a.rate/bestLag-f)/f<.025,`${note} must sound near its intended pitch`);
  });
});
