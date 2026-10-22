const fs=require('node:fs');
function readWav(path){
  const data=fs.readFileSync(path);
  if(data.toString('ascii',0,4)!=='RIFF'||data.toString('ascii',8,12)!=='WAVE')throw Error('Not WAV');
  let format,pcm;
  for(let offset=12;offset+8<=data.length;){
    const id=data.toString('ascii',offset,offset+4),size=data.readUInt32LE(offset+4),start=offset+8;
    if(id==='fmt ')format={encoding:data.readUInt16LE(start),channels:data.readUInt16LE(start+2),rate:data.readUInt32LE(start+4),bits:data.readUInt16LE(start+14)};
    if(id==='data')pcm=data.subarray(start,start+size);
    offset=start+size+(size%2);
  }
  if(format.encoding!==1||format.bits!==16)throw Error('Expected 16-bit PCM');
  const samples=Array.from({length:pcm.length/2},(_,i)=>pcm.readInt16LE(i*2)/32768);
  return {...format,samples,duration:samples.length/format.channels/format.rate};
}
const rms=s=>Math.sqrt(s.reduce((sum,x)=>sum+x*x,0)/s.length);
module.exports={readWav,rms};
