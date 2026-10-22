const {test}=require('node:test');
const assert=require('node:assert/strict');
const {browserSuite}=require('./helpers/browser.cjs');
const suite=browserSuite();
async function captureAudio(page){
  await page.addInitScript(()=>{const Original=window.Audio;window.playbackAudio=[];window.Audio=function(...args){const audio=new Original(...args);window.playbackAudio.push(audio);return audio;};window.Audio.prototype=Original.prototype;});
  await page.reload();
}
test('audio: soft rain decodes locally, plays and loops, changes volume and stops on track switch',async()=>{
  const {page}=suite;await captureAudio(page);await page.locator('#sound').click();await page.locator('[data-track="rain"]').click();
  await page.waitForFunction(()=>window.playbackAudio.some(a=>a.src.endsWith('/rain.wav')&&!a.paused&&a.currentTime>.15));
  const info=await page.evaluate(()=>{const a=window.playbackAudio.find(a=>a.src.endsWith('/rain.wav'));return {duration:a.duration,loop:a.loop};});
  assert.equal(info.duration,32);assert.equal(info.loop,true);
  await page.locator('#volume').focus();await page.keyboard.press('Home');for(let i=0;i<5;i++)await page.keyboard.press('ArrowRight');
  assert.ok(Math.abs(await page.evaluate(()=>window.playbackAudio.find(a=>a.src.endsWith('/rain.wav')).volume)-.05)<.001);
  await page.locator('[data-track="forest"]').click();
  assert.equal(await page.evaluate(()=>window.playbackAudio.find(a=>a.src.endsWith('/rain.wav')).paused),true);
  await page.locator('#stopSound').click();
  assert.equal(await page.evaluate(()=>window.playbackAudio.find(a=>a.src.endsWith('/forest.wav')).paused),true);
});
