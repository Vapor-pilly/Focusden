const {test}=require('node:test');
const assert=require('node:assert/strict');
const path=require('node:path');
const {readWav,rms}=require('./helpers/wav.cjs');
test('soft rain: slow separated drops, rounded low-volume signal, no clipping or abrupt loop seam',()=>{
  const a=readWav(path.join(__dirname,'../audio/rain.wav'));
  assert.equal(a.duration,32);assert.equal(a.channels,1);
  let peak=0,energy=0,diff=0;
  for(let i=0;i<a.samples.length;i++){const x=a.samples[i];peak=Math.max(peak,Math.abs(x));energy+=x*x;if(i)diff+=(x-a.samples[i-1])**2;}
  assert.ok(peak<.16&&peak>.03);assert.ok(rms(a.samples)<.025);
  assert.ok(Math.sqrt(diff/energy)<.4,'Soft drops must not be dominated by sharp high-frequency hiss');
  const block=Math.round(a.rate*.1),volumes=[];
  for(let i=0;i<a.samples.length;i+=block)volumes.push(rms(a.samples.slice(i,i+block)));
  let active=false;const onsets=[];
  volumes.forEach((v,i)=>{if(v>.008&&!active){onsets.push(i*.1);active=true;}else if(v<.003)active=false;});
  assert.ok(onsets.length>=9&&onsets.length<=18,'Drops remain sparse');
  for(let i=1;i<onsets.length;i++)assert.ok(onsets[i]-onsets[i-1]>1.6,'Drops are slow, not dense rain');
  assert.ok(volumes.filter(v=>v<.003).length/volumes.length>.65,'Most time is quiet between drops');
  assert.ok(Math.abs(a.samples[0]-a.samples.at(-1))<.003,'Loop boundary stays quiet');
});
