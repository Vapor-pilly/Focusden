const {test}=require('node:test');
const assert=require('node:assert/strict');
const path=require('node:path');
const {readWav,rms}=require('./helpers/wav.cjs');
test('study rain: continuous stereo broadband noise, stable loudness, no isolated tonal drops or abrupt loop',()=>{
  const a=readWav(path.join(__dirname,'../audio/rain.wav'));assert.equal(a.duration,32);assert.equal(a.channels,2);
  let peak=0;for(const x of a.samples)peak=Math.max(peak,Math.abs(x));assert.ok(peak<.30&&peak>.1);
  const block=a.rate*a.channels/2,levels=[];
  for(let i=0;i<a.samples.length;i+=block)levels.push(rms(a.samples.slice(i,i+block)));
  assert.ok(Math.min(...levels)>.04,'No sparse droplet gaps');assert.ok(Math.max(...levels)<.065,'No attention-grabbing bursts');
  const mono=a.samples.filter((_,i)=>i%2===0);let numerator=0,denominator=0;
  for(let i=0;i<mono.length-100;i++){numerator+=mono[i]*mono[i+100];denominator+=mono[i]*mono[i];}
  assert.ok(Math.abs(numerator/denominator)<.04,'Broadband rain must not have the old resonant drip pitch');
  for(let channel=0;channel<2;channel++)assert.ok(Math.abs(a.samples[channel]-a.samples.at(-2+channel))<.001);
  assert.notDeepEqual(a.samples.slice(0,200).filter((_,i)=>i%2===0),a.samples.slice(0,200).filter((_,i)=>i%2===1),'Actual stereo ambience');
});
