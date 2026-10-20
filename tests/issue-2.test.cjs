const {test}=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs/promises');
const {browserSuite}=require('./helpers/browser.cjs');
const suite=browserSuite();
const originalIcon='M16 27V14M16 19C4 20 4 8 5 6c8 0 12 5 11 13Zm0-5c0-7 5-11 11-10 1 7-4 13-11 13';

test('issue 2: app name is consistent initially and while timer runs, brand icon is unchanged',async()=>{
  const {page}=suite;
  assert.equal(await page.locator('.brand').innerText(),'专注花园');
  assert.equal(await page.locator('.brand svg path').getAttribute('d'),originalIcon);
  assert.ok((await page.title()).endsWith('专注花园'));
  assert.ok(!(await page.title()).includes('一隅'));
  await page.locator('#toggle').click();
  await page.waitForFunction(()=>document.getElementById('time').textContent!=='25:00');
  assert.ok((await page.title()).includes('专注 · 专注花园'));
  await page.locator('#toggle').click();
  assert.ok(!(await page.locator('body').innerText()).includes('一隅'));
});

test('issue 2: both footer corners are removed at desktop sizes, central controls remain centered and work',async()=>{
  const {page}=suite;
  for(const size of [{width:1280,height:720},{width:1440,height:900}]){
    await page.setViewportSize(size);
    assert.equal(await page.locator('.scene-caption,.daily,#dailyText,#unlockText').count(),0);
    assert.equal((await page.locator('footer').innerText()).replace(/\s+/g,' ').trim(),'我的 声音');
    const play=await page.locator('#toggle').boundingBox();
    assert.ok(Math.abs(play.x+play.width/2-size.width/2)<1,'Main control remains horizontally centered');
    await page.locator('#profile').click();
    assert.equal(await page.locator('#profileDialog').isVisible(),true);
    assert.ok((await page.locator('#profileUnlock').innerText()).includes('解锁资格'));
    await page.locator('#profileDialog .close').click();
    await page.locator('#sound').click();
    assert.equal(await page.locator('#soundDialog').isVisible(),true);
    await page.locator('#soundDialog .close').click();
  }
  await suite.screenshot('acceptance-final.png');
});

test('issue 2: old backup restores under original storage key and exports with new app name',async()=>{
  const {page}=suite;
  const fixture={version:1,focus:25,rest:5,phase:'focus',remaining:1250,totalSeconds:300,cycles:3,day:'2026-10-20',eligibleDay:null,scene:'warm-pond',volume:.42,effects:false};
  await page.locator('#importFile').setInputFiles({name:'一隅备份-2026-10-19.json',mimeType:'application/json',buffer:Buffer.from(JSON.stringify(fixture))});
  await page.waitForFunction(()=>document.getElementById('count').textContent==='3');
  assert.equal(await page.locator('#time').innerText(),'20:50');
  await page.reload();
  const restored=await page.evaluate(()=>JSON.parse(localStorage.getItem('yiyu.garden.v1')));
  for(const field of ['focus','rest','phase','remaining','totalSeconds','cycles','scene','volume','effects'])assert.equal(restored[field],fixture[field]);
  assert.equal(await page.locator('#toggle').getAttribute('aria-label'),'开始计时');
  await page.locator('#profile').click();
  const downloaded=page.waitForEvent('download');
  await page.locator('#export').click();
  const download=await downloaded;
  assert.match(download.suggestedFilename(),/^专注花园备份-\d{4}-\d{2}-\d{2}\.json$/);
  const exported=JSON.parse(await fs.readFile(await download.path(),'utf8'));
  assert.equal(exported.totalSeconds,300);assert.equal(exported.cycles,3);assert.equal(exported.remaining,1250);
});

test('issue 2: restored rest phase renders without removed corner nodes or runtime errors',async()=>{
  const {page}=suite;
  const fixture={version:1,focus:25,rest:5,phase:'rest',remaining:60,totalSeconds:1500,cycles:0,day:'2026-10-20',eligibleDay:'2026-10-20',scene:'warm-pond',volume:.35,effects:true};
  await page.locator('#importFile').setInputFiles({name:'backup.json',mimeType:'application/json',buffer:Buffer.from(JSON.stringify(fixture))});
  await page.waitForFunction(()=>document.getElementById('breakTab').classList.contains('selected'));
  assert.ok((await page.title()).includes('休息 · 专注花园'));
  await page.locator('#toggle').click();
  await page.waitForFunction(()=>document.getElementById('time').textContent!=='01:00');
  await page.locator('#toggle').click();
  await page.locator('#profile').click();
  assert.ok((await page.locator('#profileUnlock').innerText()).includes('更多场景')||(await page.locator('#profileUnlock').innerText()).includes('新场景'));
});
