window.GardenRenderers=window.GardenRenderers||{};
window.GardenRenderers['dandelion-night']=function(canvas,scene){
  'use strict';
  const ctx=canvas.getContext('2d',{alpha:false}),events=new AbortController();
  const sky=document.createElement('canvas'),seedLight=document.createElement('canvas');
  seedLight.width=seedLight.height=48;
  const lightContext=seedLight.getContext('2d'),lightGradient=lightContext.createRadialGradient(24,24,0,24,24,24);
  lightGradient.addColorStop(0,'#ffffffff');lightGradient.addColorStop(.18,'#f0f6ffb3');lightGradient.addColorStop(.45,'#dceaff30');lightGradient.addColorStop(1,'#dceaff00');lightContext.fillStyle=lightGradient;lightContext.fillRect(0,0,48,48);
  let w,h,dpr,raf,last=0,time=0,alive=true,flowers=[],flying=[],nextWind=3,clickReleases=0,windReleases=0;
  const rand=(a,b)=>a+Math.random()*(b-a);
  const listen=(target,name,fn)=>target.addEventListener(name,fn,{signal:events.signal});
  function background(){
    const c=sky.getContext('2d'),g=c.createLinearGradient(0,0,w*.25,h);
    g.addColorStop(0,'#00139d');g.addColorStop(.48,'#002fa7');g.addColorStop(1,'#003fbd');
    c.fillStyle=g;c.fillRect(0,0,w,h);
    const glow=c.createRadialGradient(w*.72,h*.65,0,w*.72,h*.65,w*.75);
    glow.addColorStop(0,'#064aff18');glow.addColorStop(1,'#064aff00');c.fillStyle=glow;c.fillRect(0,0,w,h);
    // Reference yellow moon: a smooth disk without any surface texture.
    const radius=Math.min(w*.16,h*.23),mx=w*.88,my=h*.19;
    const halo=c.createRadialGradient(mx,my,radius*.82,mx,my,radius*2.1);
    halo.addColorStop(0,'#ffe18a36');halo.addColorStop(.5,'#ffdf7812');halo.addColorStop(1,'#ffdf7800');
    c.fillStyle=halo;c.fillRect(mx-radius*2.1,my-radius*2.1,radius*4.2,radius*4.2);
    c.save();c.beginPath();c.arc(mx,my,radius,0,Math.PI*2);c.clip();
    c.fillStyle='#ffdc69';c.fillRect(mx-radius,my-radius,radius*2,radius*2);
    c.restore();
    // A quiet night sky; sparse pinpricks keep the flowers as the subject.
    for(let i=0;i<28;i++){
      const x=((i*173.31)%997)/997*w,y=((i*237.19)%881)/881*h*.67;
      if(Math.hypot(x-mx,y-my)<radius+2)continue;
      c.fillStyle=`rgba(243,229,255,${.12+(i%5)*.035})`;
      c.beginPath();c.arc(x,y,.45+(i%3)*.22,0,Math.PI*2);c.fill();
    }
  }
  function resize(){
    w=innerWidth;h=innerHeight;dpr=Math.min(devicePixelRatio||1,2);
    canvas.width=w*dpr;canvas.height=h*dpr;ctx.setTransform(dpr,0,0,dpr,0,0);
    sky.width=w;sky.height=h;background();flying=[];nextWind=time+rand(2.6,3.6);clickReleases=0;windReleases=0;
    flowers=scene.layout.map(([x,height,size],index)=>{
      const baseR=Math.max(17,Math.min(w,h)*size),r=baseR*scene.flowerScale,count=68;
      const seeds=Array.from({length:count},(_,i)=>{
        const z=1-2*(i+.5)/count,a=i*2.39996323,b=Math.sqrt(1-z*z);
        return {x:Math.cos(a)*b*r,y:z*r,depth:(Math.sin(a)*b+1)/2,phase:rand(0,Math.PI*2),hiddenUntil:0};
      });
      return {x:x*w,y:h-height*h,r,baseR,index,seeds};
    });
    canvas.dataset.flowers=flowers.length;canvas.dataset.floatingSeeds='0';canvas.dataset.releasedByClick='0';canvas.dataset.releasedByWind='0';
  }
  function center(f){const sway=(Math.sin(time*.65+f.index*.35)*.75+Math.sin(time*.27)*.35)*(14+f.baseR*.25);return {x:f.x+sway,y:f.y+Math.sin(time*.52+f.index*.32)*3};}
  // Fine pappus filaments, not a generic star particle.
  function tuft(x,y,r,rotation,alpha,phase,stem=7){
    ctx.save();ctx.globalAlpha=alpha;ctx.translate(x,y);ctx.rotate(rotation);
    ctx.lineWidth=.55;ctx.strokeStyle='#e8f2ffd9';
    ctx.beginPath();ctx.moveTo(0,0);ctx.lineTo(0,stem);ctx.stroke();
    ctx.strokeStyle='#f7fcffe6';ctx.lineWidth=.48;ctx.beginPath();
    for(let i=0;i<9;i++){
      const a=-Math.PI+.15+i*(Math.PI-.3)/8,px=Math.cos(a)*r,py=Math.sin(a)*r*.78;
      ctx.moveTo(0,0);ctx.quadraticCurveTo(px*.45,py*.6,px,py);
    }
    ctx.stroke();
    const sparkle=(.5+.5*Math.sin(time*(1.8+.35*Math.sin(phase*3))+phase))**6;
    // Silver-white starburst material shared by every attached and drifting seed.
    const halo=3+r;
    ctx.save();ctx.globalAlpha=alpha*(.32+sparkle*.68);ctx.drawImage(seedLight,-halo,-halo-r*.55,halo*2,halo*2);ctx.restore();
    ctx.shadowColor='#f2f8ff';ctx.shadowBlur=4+sparkle*9;
    ctx.fillStyle=`rgba(248,252,255,${.72+.28*sparkle})`;
    const cy=-r*.55,reach=1.6+r*.18+sparkle*(2.6+r*.35),width=.28+sparkle*.5;
    ctx.beginPath();ctx.arc(0,cy,.7+sparkle*.95,0,Math.PI*2);
    ctx.moveTo(0,cy-reach);ctx.quadraticCurveTo(width,cy-width,reach*.78,cy);
    ctx.quadraticCurveTo(width,cy+width,0,cy+reach);ctx.quadraticCurveTo(-width,cy+width,-reach*.78,cy);
    ctx.quadraticCurveTo(-width,cy-width,0,cy-reach);ctx.fill();
    ctx.restore();
  }
  function bloom(f){
    const c=center(f);
    ctx.save();ctx.lineWidth=.75;ctx.strokeStyle='#e4f0ff84';ctx.beginPath();ctx.moveTo(f.x-13,h+5);
    ctx.bezierCurveTo(f.x-8,h-(h-c.y)*.3,c.x-6,c.y+30,c.x,c.y);ctx.stroke();
    const core=ctx.createRadialGradient(c.x,c.y,0,c.x,c.y,f.r*.38);
    core.addColorStop(0,'#f5faff83');core.addColorStop(.33,'#dceaff3a');core.addColorStop(1,'#e2efff00');
    ctx.fillStyle=core;ctx.fillRect(c.x-f.r*.4,c.y-f.r*.4,f.r*.8,f.r*.8);
    for(const seed of f.seeds){
      if(seed.hiddenUntil>time)continue;
      const regrow=seed.hiddenUntil?Math.min(1,(time-seed.hiddenUntil)/2.5):1;
      const alpha=(.46+seed.depth*.48)*regrow,x=c.x+seed.x,y=c.y+seed.y;
      ctx.globalAlpha=alpha*.48;ctx.strokeStyle='#e8f3ff';ctx.lineWidth=.45;ctx.beginPath();ctx.moveTo(c.x,c.y);ctx.lineTo(x,y);ctx.stroke();ctx.globalAlpha=1;
      tuft(x,y,(3.4+seed.depth*2.6)*scene.flowerScale,Math.atan2(seed.y,seed.x)+Math.PI/2,alpha,seed.phase,2);
    }
    ctx.restore();
  }
  function scatter(x,y){
    let selected=null,best=Infinity;
    for(const f of flowers){const c=center(f),distance=Math.hypot(x-c.x,y-c.y)/(f.r+12);if(distance<=1&&distance<best){selected=f;best=distance;}}
    if(!selected)return;
    detach(selected,23,false);
    document.getElementById('hint').style.opacity='0';
  }
  function detach(selected,amount,ambient){
    const available=selected.seeds.filter(s=>s.hiddenUntil===0||time-s.hiddenUntil>2.5);
    const take=Math.min(amount,available.length,360-flying.length),c=center(selected);
    for(let i=0;i<take;i++){
      const index=Math.floor(Math.random()*available.length),seed=available.splice(index,1)[0];
      seed.hiddenUntil=time+rand(11,17);
      flying.push({x:c.x+seed.x,y:c.y+seed.y,vx:ambient?rand(12,24):rand(26,52),vy:ambient?-rand(7,16):-rand(21,43),age:0,life:rand(22,32),phase:seed.phase,r:rand(4.2,7)*scene.flowerScale,tilt:rand(-.5,.1),bend:rand(0,Math.PI*2),ambient});
    }
    if(ambient)windReleases+=take;else clickReleases+=take;
    canvas.dataset.releasedByClick=clickReleases;canvas.dataset.releasedByWind=windReleases;
    canvas.dataset.floatingSeeds=flying.length;
  }
  resize();listen(window,'resize',resize);
  function release(){canvas.dataset.interacting='false';}
  listen(canvas,'pointerdown',e=>{canvas.dataset.interacting='true';scatter(e.clientX,e.clientY);});
  for(const name of ['pointerup','pointerleave','pointercancel'])listen(canvas,name,release);
  listen(window,'blur',release);listen(document,'visibilitychange',()=>{if(document.hidden)release();});
  function draw(now){
    if(!alive)return;raf=requestAnimationFrame(draw);if(now-last<1000/30)return;
    const dt=Math.min((now-last)/1000||.033,.05);last=now;time+=dt;
    ctx.drawImage(sky,0,0,w,h);
    for(const f of flowers)bloom(f);
    if(time>=nextWind){
      if(flying.filter(s=>s.ambient).length<14)detach(flowers[Math.floor(Math.random()*flowers.length)],Math.random()<.3?2:1,true);
      nextWind=time+rand(2.4,4.6);
    }
    flying=flying.filter(s=>s.age<s.life&&s.x<w+35&&s.y>-35);
    for(const seed of flying){
      seed.age+=dt;seed.x+=(seed.vx+Math.sin(time*.7+seed.bend)*4)*dt;seed.y+=(seed.vy+Math.sin(time*.6+seed.bend)*3)*dt;
      const alpha=Math.min(1,seed.age*3)*Math.min(1,(seed.life-seed.age)/4);
      ctx.save();ctx.globalCompositeOperation='screen';
      tuft(seed.x,seed.y,seed.r,seed.tilt+Math.sin(time*.7+seed.phase)*.14,alpha,seed.phase,seed.r*1.5);
      ctx.restore();
    }
    canvas.dataset.floatingSeeds=flying.length;
  }
  raf=requestAnimationFrame(draw);
  return ()=>{alive=false;cancelAnimationFrame(raf);events.abort();flying=[];flowers=[];delete canvas.dataset.flowers;delete canvas.dataset.floatingSeeds;delete canvas.dataset.releasedByClick;delete canvas.dataset.releasedByWind;};
};
