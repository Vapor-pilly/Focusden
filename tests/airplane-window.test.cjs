const {test}=require('node:test');
const assert=require('node:assert/strict');
const {browserSuite}=require('./helpers/browser.cjs');
const suite=browserSuite(),url='http://127.0.0.1:8765/?preview=airplane-window';
async function ready(page){await page.waitForFunction(()=>document.getElementById('pond').dataset.airplaneReady==='true');}
const dataset=(page,key)=>page.locator('#pond').getAttribute('data-'+key);
const handle=page=>page.evaluate(()=>JSON.parse(document.getElementById('pond').dataset.shadeHandle));
async function drag(page,distance){const p=await handle(page);await page.mouse.move(p.x,p.y);await page.mouse.down();await page.mouse.move(p.x,p.y+distance,{steps:12});await page.mouse.up();}
async function center(page){return page.evaluate(()=>{const c=document.getElementById('pond'),b=JSON.parse(c.dataset.windowBounds),d=devicePixelRatio;return Array.from(c.getContext('2d').getImageData((b.x+b.width/2)*d,(b.y+b.height*.6)*d,1,1).data);});}

test('airplane: large lower-center luminous frame and blue city draw, float and extend past one tile without touching timer or controls',async()=>{
 const {page}=suite;const saved=await page.evaluate(()=>JSON.parse(localStorage.getItem('yiyu.garden.v1')));
 await page.addInitScript(()=>{const original=CanvasRenderingContext2D.prototype.drawImage;window.cityTiles=[];CanvasRenderingContext2D.prototype.drawImage=function(image,...args){if(this.canvas.id==='pond'&&image.width===1800){window.cityTiles.push(args);if(window.cityTiles.length>4)window.cityTiles.shift();}return original.call(this,image,...args);};});
 await page.clock.install();await page.goto(url);await ready(page);await page.clock.runFor(100);
 const first=await dataset(page,'window-float'),offset=await dataset(page,'landscape-offset');await page.clock.runFor(1700);
 assert.notEqual(await dataset(page,'window-float'),first);assert.notEqual(await dataset(page,'landscape-offset'),offset);
 const tiles=await page.evaluate(()=>window.cityTiles);assert.equal(tiles.length,4);assert.ok(tiles[0][0]<=0&&tiles[0][0]>-1800);assert.equal(tiles[1][0]-tiles[0][0],1800);assert.equal(tiles[3][0]-tiles[2][0],1800);
 const pixel=await center(page);assert.ok(pixel[2]>pixel[0]*2&&pixel[2]>80,'Blue nightscape must really render');
 await suite.screenshot('airplane-window.png');
 for(const size of [{width:1440,height:900},{width:1280,height:720}]){
   await page.setViewportSize(size);await page.evaluate(()=>window.dispatchEvent(new Event('resize')));await page.clock.runFor(50);
   const b=JSON.parse(await dataset(page,'window-bounds')),timer=await page.locator('.timer-zone').boundingBox(),control=await page.locator('#toggle').boundingBox();
   assert.ok(b.height>size.height*.48&&b.width>size.width*.18);assert.ok(b.y+b.height/2>size.height*.5);assert.ok(Math.abs(b.x+b.width/2-size.width/2)<1);
   assert.ok(b.y>timer.y+timer.height,'Window clears countdown');assert.ok(b.y+b.height<control.y,'Window clears play control');
 }
 assert.equal(await page.evaluate(()=>JSON.parse(localStorage.getItem('yiyu.garden.v1')).scene),saved.scene,'Preview does not replace owned scene');
});

test('airplane: dragging the blind handle closes the view, reopens it and clamps at both ends',async()=>{
 const {page}=suite;await page.clock.install();await page.goto(url);await ready(page);await page.clock.runFor(100);
 assert.equal(await dataset(page,'shade'),'0.0000');const open=await center(page);
 await drag(page,700);await page.clock.runFor(100);assert.equal(await dataset(page,'shade'),'1.0000');const closed=await center(page);
 assert.ok(closed[0]>open[0]+70&&closed[2]/closed[0]<1.35,'Opaque blind must cover the blue scene');await suite.screenshot('airplane-window-closed.png');
 await drag(page,-200);await page.clock.runFor(100);const half=Number(await dataset(page,'shade'));assert.ok(half>0&&half<1);
 await drag(page,-700);await page.clock.runFor(100);assert.equal(await dataset(page,'shade'),'0.0000');const reopened=await center(page);assert.ok(reopened[2]>reopened[0]*2);
 assert.equal(await dataset(page,'shade-dragging'),'false');
});

test('airplane: only the handle drags, UI remains usable, blur releases capture and reduced motion stops floating and scenery',async()=>{
 const {page}=suite;await page.clock.install();await page.goto(url);await ready(page);await page.clock.runFor(100);
 await page.mouse.move(70,400);await page.mouse.down();await page.mouse.move(70,650);await page.mouse.up();assert.equal(await dataset(page,'shade'),'0.0000');
 await page.locator('#settings').click();await page.locator('#settingsDialog .close').click();assert.equal(await dataset(page,'shade'),'0.0000');
 const p=await handle(page);await page.mouse.move(p.x,p.y);await page.mouse.down();await page.mouse.move(p.x,p.y+120);await page.evaluate(()=>window.dispatchEvent(new Event('blur')));assert.equal(await dataset(page,'shade-dragging'),'false');const shade=await dataset(page,'shade');await page.mouse.move(p.x,p.y+250);await page.mouse.up();assert.equal(await dataset(page,'shade'),shade);
 await page.emulateMedia({reducedMotion:'reduce'});await page.clock.runFor(100);const off=await dataset(page,'landscape-offset');await page.clock.runFor(1800);assert.equal(await dataset(page,'window-float'),'0.000');assert.equal(await dataset(page,'landscape-offset'),off);
});

test('airplane: owned scene can favorite, restore and switch via library; exits remove blind listeners and animation',async()=>{
 const {page}=suite;const state={version:1,focus:25,rest:5,phase:'focus',remaining:1200,totalSeconds:420,cycles:3,day:'2026-10-23',eligibleDay:null,scene:'airplane-window',volume:.35,effects:true,unlocked:['warm-pond','airplane-window'],favorites:[]};
 await page.locator('#importFile').setInputFiles({name:'airplane.json',mimeType:'application/json',buffer:Buffer.from(JSON.stringify(state))});await ready(page);await page.reload();await ready(page);assert.equal(await page.locator('#time').innerText(),'20:00');
 await page.locator('#profile').click();await page.locator('#unlockedScenes [data-favorite-scene="airplane-window"]').click();assert.deepEqual(await page.evaluate(()=>JSON.parse(localStorage.getItem('yiyu.garden.v1')).favorites),['airplane-window']);
 await page.locator('#unlockedScenes [data-choose-scene="warm-pond"]').click();await page.waitForFunction(()=>document.getElementById('pond').dataset.renderer==='pond');assert.equal(await dataset(page,'airplane-ready'),null);assert.equal(await dataset(page,'shade-handle'),null);
 await page.mouse.click(720,520);assert.equal(await dataset(page,'shade-dragging'),null);
 await page.locator('#profile').click();await page.locator('#favoritesTab').click();await page.locator('#favoritesScenes [data-choose-scene="airplane-window"]').click();await ready(page);assert.equal(await dataset(page,'shade'),'0.0000');assert.equal(await page.locator('#count').innerText(),'3');
});
