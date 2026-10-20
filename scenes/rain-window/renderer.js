window.GardenRenderers=window.GardenRenderers||{};
window.GardenRenderers['rain-window']=function(canvas){
  'use strict';
  const ctx=canvas.getContext('2d',{alpha:false}),events=new AbortController();
  const outside=document.createElement('canvas'),fogged=document.createElement('canvas'),layer=document.createElement('canvas');
  let w,h,dpr,alive=true,raf,last=0,active=false,nextDrop=0,marks=[],drops=[];
  let pointer=null;
  const random=(a,b)=>a+Math.random()*(b-a);
  function listen(target,type,fn){target.addEventListener(type,fn,{signal:events.signal});}
  function landscape(){
    // A fixed natural composition, softly defocused behind the glass.
    let seed=3197;
    const rand=()=>{seed=(seed*1664525+1013904223)>>>0;return seed/4294967296;};
    const c=outside.getContext('2d');
    const sky=c.createLinearGradient(0,0,0,h);
    sky.addColorStop(0,'#d4ddcd');sky.addColorStop(.35,'#a4b89b');sky.addColorStop(1,'#647f60');
    c.fillStyle=sky;c.fillRect(0,0,w,h);
    c.save();c.filter=`blur(${Math.max(18,w*.018)}px)`;
    const tones=['#6d8b5f','#8ba877','#4d704e','#a3b795','#789961','#5d8054'];
    // Tall overlapping tree crowns, with diffused gaps of overcast daylight.
    for(let tree=0;tree<16;tree++){
      const x=(tree/15)*w+w*(rand()-.5)*.1,top=h*(.12+rand()*.3);
      for(let j=0;j<24;j++){
        const y=top+rand()*h*.8,r=w*(.035+rand()*.06);
        c.globalAlpha=.14+rand()*.16;c.fillStyle=tones[Math.floor(rand()*tones.length)];
        c.beginPath();c.ellipse(x+(rand()-.5)*w*.13,y,r,r*(.6+rand()*.7),rand(),0,Math.PI*2);c.fill();
      }
    }
    c.restore();
    const light=c.createRadialGradient(w*.32,-h*.1,0,w*.32,h*.12,w*.8);
    light.addColorStop(0,'#f4f1df80');light.addColorStop(1,'#eff4e000');
    c.fillStyle=light;c.fillRect(0,0,w,h);
    const f=fogged.getContext('2d');f.filter='blur(12px)';f.drawImage(outside,-14,-14,w+28,h+28);f.filter='none';
    f.fillStyle='rgba(239,244,231,.28)';f.fillRect(0,0,w,h);
    // Extremely fine condensation; the fog remains thin and even.
    for(let i=0;i<Math.floor(w*h/180);i++){
      f.fillStyle=`rgba(255,255,245,${.012+rand()*.022})`;
      f.fillRect(rand()*w,rand()*h,1,1);
    }
  }
  function makeDrop(initial=false){
    return {x:random(10,w-10),y:random(8,h-8),r:random(.8,3.2),age:initial?random(1,20):0,life:random(40,95),seed:random(0,100),slide:Math.random()<.09?random(.3,1.2):0};
  }
  function resize(){
    w=innerWidth;h=innerHeight;dpr=Math.min(devicePixelRatio||1,2);
    canvas.width=w*dpr;canvas.height=h*dpr;ctx.setTransform(dpr,0,0,dpr,0,0);
    for(const c of [outside,fogged,layer]){c.width=w;c.height=h;}
    marks=[];drops=Array.from({length:Math.round(w*h/21000)},()=>makeDrop(true));landscape();
  }
  resize();listen(window,'resize',resize);
  function mark(x,y){marks.push({x,y,born:performance.now()/1000});if(marks.length>240)marks.shift();}
  function wipe(e){
    const x=e.clientX,y=e.clientY;
    if(pointer){const length=Math.hypot(x-pointer.x,y-pointer.y),steps=Math.max(1,Math.ceil(length/12));for(let i=1;i<=steps;i++)mark(pointer.x+(x-pointer.x)*i/steps,pointer.y+(y-pointer.y)*i/steps);}
    else mark(x,y);
    pointer={x,y};
  }
  function release(){active=false;pointer=null;canvas.dataset.interacting='false';}
  listen(canvas,'pointerdown',e=>{active=true;canvas.dataset.interacting='true';canvas.setPointerCapture(e.pointerId);wipe(e);document.getElementById('hint').style.opacity='0';});
  listen(canvas,'pointermove',e=>{if(e.clientX<0||e.clientY<0||e.clientX>w||e.clientY>h){release();return;}if(active)wipe(e);});
  for(const name of ['pointerup','pointercancel','pointerleave','lostpointercapture'])listen(canvas,name,release);
  listen(window,'blur',release);listen(document,'visibilitychange',()=>{if(document.hidden)release();});
  function drop(d,time){
    const born=Math.min(1,d.age/1.5),fade=Math.min(1,(d.life-d.age)/3);
    ctx.save();ctx.globalAlpha=born*fade;
    const r=d.r;
    ctx.translate(d.x,d.y);
    const glass=ctx.createRadialGradient(-r*.3,-r*.35,0,0,0,r*1.3);
    glass.addColorStop(0,'#f9ffedc0');glass.addColorStop(.4,'#dce7d336');glass.addColorStop(.78,'#45654c38');glass.addColorStop(1,'#ffffff00');
    ctx.fillStyle=glass;ctx.beginPath();ctx.ellipse(0,0,r,r*1.18,0,0,Math.PI*2);ctx.fill();
    ctx.lineWidth=.6;ctx.strokeStyle='#f9fff3a0';ctx.beginPath();ctx.ellipse(0,-.2,r*.77,r*.85,-.2,Math.PI*1.05,Math.PI*1.68);ctx.stroke();
    const twinkle=Math.pow(Math.max(0,Math.sin(time*.55+d.seed)),16);
    ctx.fillStyle=`rgba(255,255,247,${.45+.5*twinkle})`;ctx.beginPath();ctx.arc(-r*.28,-r*.4,Math.max(.45,r*.21),0,Math.PI*2);ctx.fill();
    if(twinkle>.7&&r>1.4){ctx.strokeStyle=`rgba(255,255,242,${(twinkle-.7)*1.5})`;ctx.lineWidth=.55;const s=2.4+r*.45;ctx.beginPath();ctx.moveTo(-s,-r*.3);ctx.lineTo(s,-r*.3);ctx.moveTo(0,-r*.3-s);ctx.lineTo(0,-r*.3+s);ctx.stroke();}
    ctx.restore();
  }
  function frame(now){
    if(!alive)return;
    raf=requestAnimationFrame(frame);
    if(now-last<1000/30)return;
    const dt=Math.min((now-last)/1000||.033,.1);last=now;
    const time=now/1000;
    ctx.drawImage(outside,0,0,w,h);
    const f=layer.getContext('2d');f.globalCompositeOperation='source-over';f.clearRect(0,0,w,h);f.drawImage(fogged,0,0);
    marks=marks.filter(m=>time-m.born<13);
    f.globalCompositeOperation='destination-out';
    for(const m of marks){const age=time-m.born,strength=.92*Math.max(0,1-Math.max(0,age-2)/11);const g=f.createRadialGradient(m.x,m.y,0,m.x,m.y,46);g.addColorStop(0,`rgba(0,0,0,${strength})`);g.addColorStop(.55,`rgba(0,0,0,${strength*.8})`);g.addColorStop(1,'rgba(0,0,0,0)');f.fillStyle=g;f.fillRect(m.x-46,m.y-46,92,92);}
    f.globalCompositeOperation='source-over';ctx.drawImage(layer,0,0);
    if(time>nextDrop){if(drops.length<Math.ceil(w*h/13000))drops.push(makeDrop());nextDrop=time+random(.7,2.4);}
    drops=drops.filter(d=>d.age<d.life&&d.y<h+8);
    for(const d of drops){d.age+=dt;d.y+=d.slide*dt;drop(d,time);}
    canvas.dataset.wipes=marks.length;canvas.dataset.drops=drops.length;
  }
  raf=requestAnimationFrame(frame);
  return ()=>{alive=false;cancelAnimationFrame(raf);events.abort();marks=[];drops=[];delete canvas.dataset.wipes;delete canvas.dataset.drops;};
};
