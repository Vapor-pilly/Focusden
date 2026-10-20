const {test}=require('node:test');
const assert=require('node:assert/strict');
const {browserSuite}=require('./helpers/browser.cjs');
const suite=browserSuite();

test('issue 1: vertical settings icon is twice the original size, shares timer finish and opens settings',async()=>{
  const {page}=suite;
  assert.equal(await page.locator('#settings').innerText(),'⋮');
  const style=await page.evaluate(()=>{
    const a=getComputedStyle(document.getElementById('settings'));
    const b=getComputedStyle(document.getElementById('time'));
    const props=['backgroundImage','backgroundClip','color','textShadow','filter','fontWeight','opacity'];
    return {size:parseFloat(a.fontSize),icon:Object.fromEntries(props.map(k=>[k,a[k]])),timer:Object.fromEntries(props.map(k=>[k,b[k]]))};
  });
  assert.equal(style.size,14*2,'Original icon font size was 14px');
  assert.deepEqual(style.icon,style.timer,'Icon must share the timer translucent finish');
  assert.equal(style.icon.color,'rgba(0, 0, 0, 0)');
  for(const size of [{width:1280,height:720},{width:1440,height:900}]){
    await page.setViewportSize(size);
    const icon=await page.locator('#settings').boundingBox();
    const time=await page.locator('#time').boundingBox();
    assert.ok(icon.width>=44&&icon.height>=44,'Clickable target remains large enough');
    assert.ok(icon.x>=time.x+time.width-1,'Icon must not overlap countdown digits');
    assert.ok(icon.x+icon.width<=size.width,'Icon must remain in viewport');
    assert.ok(Math.abs(icon.y+icon.height/2-time.y-time.height/2)<2,'Icon aligns vertically with countdown');
    await page.locator('#settings').click();
    assert.equal(await page.locator('#settingsDialog').isVisible(),true);
    await page.locator('#settingsDialog .close').click();
  }
  await suite.screenshot('issue-1.png');
});

test('issue 1: removed default sentence stays absent after start, reset, duration change and reload',async()=>{
  const {page}=suite;
  const absent=async()=>{
    assert.ok(!(await page.locator('body').innerText()).includes('把这一刻，留给自己'));
    assert.equal(await page.locator('#status').isVisible(),false);
  };
  await absent();
  await page.locator('#toggle').click();
  await page.waitForFunction(()=>document.getElementById('time').textContent!=='25:00');
  await page.locator('#settings').click();
  await page.locator('#reset').click();
  await absent();
  await page.locator('#time').click();
  await page.locator('#saveWheel').click();
  await absent();
  await page.reload();
  await absent();
  assert.equal(await page.locator('#toggle').getAttribute('aria-label'),'开始计时');
});
