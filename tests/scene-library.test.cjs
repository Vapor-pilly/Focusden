const {test}=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs/promises');
const {browserSuite}=require('./helpers/browser.cjs');
const suite=browserSuite();
const fixture=extra=>({version:1,focus:25,rest:5,phase:'focus',remaining:1200,totalSeconds:420,cycles:3,day:'2026-10-23',eligibleDay:null,scene:'warm-pond',volume:.35,effects:true,...extra});
const saved=page=>page.evaluate(()=>JSON.parse(localStorage.getItem('yiyu.garden.v1')));
async function restore(page,state){
 await page.locator('#importFile').setInputFiles({name:'library.json',mimeType:'application/json',buffer:Buffer.from(JSON.stringify(state))});
 // The count can already be 3 from an earlier import. The file input is cleared only after processing finishes.
 await page.waitForFunction(()=>document.getElementById('importFile').value==='');
 assert.equal(await page.locator('#count').innerText(),'3');
}

test('library: legacy migration owns only saved scene; previews cannot unlock, favorite or replace saved ownership',async()=>{
 const {page}=suite;await restore(page,fixture());await page.locator('#profile').click();
 assert.equal(await page.locator('#unlockedScenes .scene-choice').count(),1);assert.deepEqual((await saved(page)).unlocked,['warm-pond']);
 await page.goto('http://127.0.0.1:8765/?preview=crystal-guitar');await page.locator('#profile').click();
 assert.equal(await page.locator('#unlockedScenes [data-choose-scene="crystal-guitar"]').count(),0);assert.deepEqual((await saved(page)).unlocked,['warm-pond']);
 await page.locator('#favoritesTab').click();assert.equal(await page.locator('#favoritesEmpty').isVisible(),true);
});

test('library: favorite star toggles independently, persists and exports/restores through local backups',async()=>{
 const {page}=suite;const state=fixture({unlocked:['warm-pond','dream-ocean','wisteria-glow'],favorites:[]});await restore(page,state);await page.locator('#profile').click();
 await page.locator('#unlockedScenes [data-favorite-scene="dream-ocean"]').click();
 assert.equal(await page.locator('html').getAttribute('data-scene'),'warm-pond','Starring must not switch scene');
 assert.deepEqual((await saved(page)).favorites,['dream-ocean']);
 await page.locator('#favoritesTab').click();assert.equal(await page.locator('#favoritesScenes .scene-choice').count(),1);
 assert.equal(await page.locator('#favoritesScenes [data-favorite-scene="dream-ocean"]').getAttribute('aria-pressed'),'true');
 await suite.screenshot('scene-library-favorites.png');
 const pending=page.waitForEvent('download');await page.locator('#export').click();const download=await pending;
 const backup=JSON.parse(await fs.readFile(await download.path(),'utf8'));assert.deepEqual(backup.favorites,['dream-ocean']);assert.deepEqual(backup.unlocked,state.unlocked);
 await page.reload();await page.locator('#profile').click();await page.locator('#favoritesTab').click();assert.equal(await page.locator('#favoritesScenes .scene-choice').count(),1);
 await page.locator('#favoritesScenes [data-favorite-scene="dream-ocean"]').click();assert.equal(await page.locator('#favoritesEmpty').isVisible(),true);assert.deepEqual((await saved(page)).favorites,[]);
 await page.locator('#profileDialog .close').click();
 // A real file read is asynchronous; keep it pending long enough to expose early assertions.
 await page.evaluate(()=>{const read=File.prototype.text;File.prototype.text=async function(){await new Promise(resolve=>setTimeout(resolve,250));return read.call(this);};});
 await restore(page,backup);assert.deepEqual((await saved(page)).favorites,['dream-ocean']);
});

test('library: unlocked and favorite entries switch immediately, leave preview, keep running timer and do not consume eligibility',async()=>{
 const {page}=suite;const state=fixture({unlocked:['warm-pond','dream-ocean'],favorites:['dream-ocean'],eligibleDay:'2026-10-23',consumedDay:null});
 await page.clock.install({time:new Date('2026-10-23T12:00:00+08:00')});await restore(page,state);await page.goto('http://127.0.0.1:8765/?preview=wisteria-glow');
 await page.locator('#toggle').click();await page.locator('#profile').click();await page.locator('#favoritesTab').click();await page.locator('#favoritesScenes [data-choose-scene="dream-ocean"]').click();
 assert.equal(await page.locator('html').getAttribute('data-scene'),'dream-ocean');assert.ok(!page.url().includes('preview='));assert.equal(await page.locator('#profileDialog').isVisible(),false);
 await page.clock.runFor(1500);const after=await saved(page);assert.ok(after.remaining<1200&&after.remaining>1197);assert.ok(after.totalSeconds>420);assert.equal(after.eligibleDay,state.eligibleDay);assert.equal(after.consumedDay,null);assert.equal(after.unlocked.length,2);
 assert.equal(await page.locator('#toggle').getAttribute('aria-label'),'暂停计时');await page.locator('#toggle').click();
 await page.locator('#profile').click();await page.locator('#unlockedTab').click();await page.locator('#unlockedScenes [data-choose-scene="warm-pond"]').click();assert.equal((await saved(page)).scene,'warm-pond');
 await page.reload();assert.equal(await page.locator('html').getAttribute('data-scene'),'warm-pond');assert.equal(await page.locator('#toggle').getAttribute('aria-label'),'开始计时');
});

test('library: next-day unlock records exactly one unseen scene while preserving collection',async()=>{
 const {page}=suite;await page.clock.install({time:new Date('2026-10-23T12:00:00+08:00')});
 const original=['warm-pond','dream-ocean'];await restore(page,fixture({unlocked:original,favorites:['dream-ocean'],eligibleDay:'2026-10-22'}));
 let s=await saved(page);assert.equal(s.unlocked.length,3);assert.ok(!original.includes(s.scene));assert.deepEqual(s.favorites,['dream-ocean']);const scene=s.scene;
 await page.reload();s=await saved(page);assert.equal(s.scene,scene);assert.equal(s.unlocked.length,3);
 await page.locator('#profile').click();assert.equal(await page.locator('#unlockedScenes .scene-choice').count(),3);await suite.screenshot('scene-library-unlocked.png');
});

test('library: invalid backup cannot add locked favorites or corrupt existing records',async()=>{
 const {page}=suite;await restore(page,fixture());
 await restore(page,fixture({unlocked:['warm-pond'],favorites:['crystal-guitar'],totalSeconds:9999}));
 assert.equal((await saved(page)).totalSeconds,420);assert.deepEqual((await saved(page)).favorites,[]);
 await restore(page,fixture({unlocked:'all',totalSeconds:9999}));assert.equal((await saved(page)).totalSeconds,420);
});
