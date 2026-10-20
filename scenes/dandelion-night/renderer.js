window.GardenRenderers=window.GardenRenderers||{};
window.GardenRenderers['dandelion-night']=function(canvas,scene){
  'use strict';
  const ctx=canvas.getContext('2d',{alpha:false}),events=new AbortController();
  const sky=document.createElement('canvas');
  let w,h,dpr,raf,last=0,time=0,alive=true,flowers=[],flying=[];
  const rand=(a,b)=>a+Math.random()*(b-a);
  const listen=(target,name,fn)=>target.addEventListener(name,fn,{signal:events.signal});
  function background(){
    const c=sky.getContext('2d'),g=c.createLinearGradient(0,0,w*.25,h);
    g.addColorStop(0,'#1c1738');g.addColorStop(.48,'#493064');g.addColorStop(1,'#8f7194');
    c.fillStyle=g;c.fillRect(0,0,w,h);
    const glow=c.createRadialGradient(w*.72,h*.65,0,w*.72,h*.65,w*.75);
    glow.addColorStop(0,'#b395c627');glow.addColorStop(1,'#9379bb00');c.fillStyle=glow;c.fillRect(0,0,w,h);
    // A quiet night sky; sparse pinpricks keep the flowers as the subject.
    for(let i=0;i<28;i++){
      const x=((i*173.31)%997)/997*w,y=((i*237.19)%881)/881*h*.67;
      c.fillStyle=`rgba(243,229,255,${.12+(i%5)*.035})`;
      c.beginPath();c.arc(x,y,.45+(i%3)*.22,0,Math.PI*2);c.fill();
    }
  }
  function resize(){
    w=innerWidth;h=innerHeight;dpr=Math.min(devicePixelRatio||1,2);
    canvas.width=w*dpr;canvas.height=h*dpr;ctx.setTransform(dpr,0,0,dpr,0,0);
    sky.width=w;sky.height=h;background();flying=[];
    flowers=scene.layout.map(([x,height,size],index)=>{
      const r=Math.max(17,Math.min(w,h)*size),count=68;
      const seeds=Array.from({length:count},(_,i)=>{
        const z=1-2*(i+.5)/count,a=i*2.39996323,b=Math.sqrt(1-z*z);
        return {x:Math.cos(a)*b*r,y:z*r,depth:(Math.sin(a)*b+1)/2,phase:rand(0,Math.PI*2),hiddenUntil:0};
      });
      return {x:x*w,y:h-height*h,r,index,seeds};
    });
    canvas.dataset.flowers=flowers.length;canvas.dataset.floatingSeeds='0';
  }
  function center(f){return {x:f.x+Math.sin(time*.35+f.index)*2.3,y:f.y+Math.sin(time*.27+f.index)*.6};}
  // Fine pappus filaments, not a generic star particle.
  function tuft(x,y,r,rotation,alpha,phase,stem=7){
    ctx.save();ctx.globalAlpha=alpha;ctx.translate(x,y);ctx.rotate(rotation);
    ctx.lineWidth=.55;ctx.strokeStyle='#f3dff7b8';
    ctx.beginPath();ctx.moveTo(0,0);ctx.lineTo(0,stem);ctx.stroke();
    ctx.strokeStyle='#ffedf6c9';ctx.lineWidth=.48;ctx.beginPath();
    for(let i=0;i<9;i++){
      const a=-Math.PI+.15+i*(Math.PI-.3)/8,px=Math.cos(a)*r,py=Math.sin(a)*r*.78;
      ctx.moveTo(0,0);ctx.quadraticCurveTo(px*.45,py*.6,px,py);
    }
    ctx.stroke();
    const sparkle=Math.pow(Math.max(0,Math.sin(time*.85+phase)),10);
    if(sparkle>.2){ctx.shadowColor='#fff2c8';ctx.shadowBlur=5+sparkle*5;ctx.fillStyle=`rgba(255,248,213,${.3+.7*sparkle})`;ctx.beginPath();ctx.arc(0,-r*.55,.55+sparkle*.7,0,Math.PI*2);ctx.fill();}
    ctx.restore();
  }
  function bloom(f){
    const c=center(f);
    ctx.save();ctx.lineWidth=.75;ctx.strokeStyle='#e0cfdf74';ctx.beginPath();ctx.moveTo(f.x-13,h+5);
    ctx.bezierCurveTo(f.x-8,h-(h-c.y)*.3,c.x-6,c.y+30,c.x,c.y);ctx.stroke();
    const core=ctx.createRadialGradient(c.x,c.y,0,c.x,c.y,f.r*.38);
    core.addColorStop(0,'#ffedba83');core.addColorStop(.33,'#efcfb13a');core.addColorStop(1,'#f5d8ab00');
    ctx.fillStyle=core;ctx.fillRect(c.x-f.r*.4,c.y-f.r*.4,f.r*.8,f.r*.8);
    for(const seed of f.seeds){
      if(seed.hiddenUntil>time)continue;
      const regrow=seed.hiddenUntil?Math.min(1,(time-seed.hiddenUntil)/2.5):1;
      const alpha=(.25+seed.depth*.55)*regrow,x=c.x+seed.x,y=c.y+seed.y;
      ctx.globalAlpha=alpha*.48;ctx.strokeStyle='#ead7ef';ctx.lineWidth=.45;ctx.beginPath();ctx.moveTo(c.x,c.y);ctx.lineTo(x,y);ctx.stroke();ctx.globalAlpha=1;
      tuft(x,y,3.4+seed.depth*2.6,Math.atan2(seed.y,seed.x)+Math.PI/2,alpha,seed.phase,2);
    }
    ctx.restore();
  }
  function scatter(x,y){
    let selected=null,best=Infinity;
    for(const f of flowers){const c=center(f),distance=Math.hypot(x-c.x,y-c.y)/(f.r+12);if(distance<=1&&distance<best){selected=f;best=distance;}}
    if(!selected)return;
    const available=selected.seeds.filter(s=>s.hiddenUntil===0||time-s.hiddenUntil>2.5);
    const take=Math.min(23,available.length,360-flying.length),c=center(selected);
    for(let i=0;i<take;i++){
      const index=Math.floor(Math.random()*available.length),seed=available.splice(index,1)[0];
      seed.hiddenUntil=time+rand(11,17);
      flying.push({x:c.x+seed.x,y:c.y+seed.y,vx:rand(26,52),vy:-rand(21,43),age:0,life:rand(22,32),phase:seed.phase,r:rand(4.2,7),tilt:rand(-.5,.1),bend:rand(0,Math.PI*2)});
    }
    if(take)document.getElementById('hint').style.opacity='0';
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
  return ()=>{alive=false;cancelAnimationFrame(raf);events.abort();flying=[];flowers=[];delete canvas.dataset.flowers;delete canvas.dataset.floatingSeeds;};
};
