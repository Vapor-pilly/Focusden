const {test}=require('node:test');
const assert=require('node:assert/strict');
const path=require('node:path');
const {readWav,rms}=require('./helpers/wav.cjs');
function energyAt(audio,start,freq){
  let real=0,imag=0,count=0;
  const first=Math.round(start*audio.rate),length=Math.round(.8*audio.rate);
  for(let i=0;i<length;i+=2){const x=(audio.samples[(first+i)*2]+audio.samples[(first+i)*2+1])/2;const angle=2*Math.PI*freq*i/audio.rate;real+=x*Math.cos(angle);imag+=x*Math.sin(angle);count++;}
  return (real*real+imag*imag)/(count*count);
}
test('soft piano: original 64-second stereo melody, soft dynamics, pitched notes and smooth loop boundary',()=>{
  const a=readWav(path.join(__dirname,'../audio/piano.wav'));
  assert.equal(a.duration,64);assert.equal(a.channels,2);
  let peak=0;for(const x of a.samples)peak=Math.max(peak,Math.abs(x));
  assert.ok(peak>.08&&peak<=.221,'Piano must be audible without clipping or harsh peaks');
  assert.ok(rms(a.samples)>.01&&rms(a.samples)<.07);
  assert.ok(Math.abs(a.samples[0]-a.samples.at(-2))<.02);assert.ok(Math.abs(a.samples[1]-a.samples.at(-1))<.02);
  const c=energyAt(a,1.1,523.25),e=energyAt(a,3.1,659.255);
  assert.ok(c>energyAt(a,1.1,550)*10,'First phrase must contain the intended C5 pitch, not noise');
  assert.ok(e>energyAt(a,3.1,630)*10,'Melody must change to E5 in the phrase');
  assert.ok(c>1e-6&&e>1e-6);
});
