window.GardenRenderers=window.GardenRenderers||{};
window.GardenRenderers['wisteria-glow']=function(canvas,scene){
  'use strict';
  const ctx=canvas.getContext('2d',{alpha:false}),events=new AbortController();
  let w,h,raf,alive=true,vines=[],particles=[],last=null,time=0,clicks=0;
  const reduced=matchMedia('(prefers-reduced-motion: reduce)');
  let seed=7521;const random=()=>{seed=(seed*1664525+1013904223)>>>0;return seed/4294967296;};
  // Translucent overlapping washes are stamped from an offscreen palette once.
  // Slightly ragged edges and pigment pooling keep the flowers painterly.
  const palette=['#b393d2','#d4b5e8','#9b7abe','#c8a4dc','#e4d3f0','#a184c2','#8f6bb2','#d9c6eb'];
  const flowers=palette.map((color,index)=>{
    const stamp=document.createElement('canvas');stamp.width=stamp.height=80;const c=stamp.getContext('2d');
    c.translate(40,36);c.fillStyle=color;
    for(const [x,y,rx,ry] of [[-11,-1,15,21],[11,0,15,20],[0,9,13,18]]){
      c.globalAlpha=.62;c.beginPath();c.ellipse(x,y,rx,ry,(x/80),0,Math.PI*2);c.fill();
      for(let k=0;k<12;k++){c.globalAlpha=.018+random()*.028;c.beginPath();c.ellipse(x+(random()-.5)*rx,y+(random()-.5)*ry,rx*(.6+random()*.35),ry*(.6+random()*.35),random()*.3,0,Math.PI*2);c.fill();}
    }
    c.globalAlpha=.38;c.fillStyle=index%2?'#84649f':'#a384ba';
    for(const x of [-7,7]){c.beginPath();c.ellipse(x,18,6,8,x/40,0,Math.PI*2);c.fill();}
    c.globalAlpha=.48;c.fillStyle='#fff5dc';c.beginPath();c.ellipse(0,12,2.4,3.4,0,0,7);c.fill();
    return stamp;
  });
  function resize(){
    w=innerWidth;h=innerHeight;const dpr=Math.min(devicePixelRatio||1,2);
    canvas.width=w*dpr;canvas.height=h*dpr;ctx.setTransform(dpr,0,0,dpr,0,0);
    seed=9721;const count=Math.max(26,Math.round(w/25));vines=[];
    for(let i=0;i<count;i++){
      const x=(i+.25+random()*.5)/count*w,center=Math.abs(x/w-.5);
      const length=Math.min(h*scene.maxHeight,h*(center<.19?.085+random()*.095:.24+random()*.245));
      const vine={x,length,phase:random()*7,amplitude:4+random()*9,bend:(random()-.5)*15,depth:random(),flowers:[],leaves:[]};
      const steps=Math.max(8,Math.round(length/11));
      for(let j=0;j<steps;j++){
        const t=(j+.5)/steps,taper=Math.pow(1-t,.52);
        const size=(22+random()*20)*(.22+.88*taper);
        vine.flowers.push({t,size,offset:(random()-.5)*size*.9,sprite:Math.floor(random()*flowers.length),alpha:.55+random()*.4});
        if(j%3===0&&t<.7)vine.leaves.push({t,side:random()>.5?1:-1,size:3+random()*4});
        if(t<.64&&random()>.32)vine.flowers.push({t:t+.012,size:size*.95,offset:(random()>.5?1:-1)*size*.5,sprite:Math.floor(random()*5),alpha:.42+random()*.2});
      }
      vines.push(vine);
    }
    vines.sort((a,b)=>a.depth-b.depth);particles=[];
    expose();
  }
  function vx(v,t){return v.x+v.bend*t*t+(reduced.matches?0:Math.sin(time*.58+v.phase+t*.9)*v.amplitude*Math.pow(t,1.6));}
  function expose(){
    canvas.dataset.vineTargets=JSON.stringify(vines.map(v=>({x:vx(v,.72),y:v.length*.72,length:v.length})));
    canvas.dataset.vineMotion=JSON.stringify(vines.slice(0,8).map(v=>vx(v,1)));
    canvas.dataset.sparkles=JSON.stringify(particles.slice(-18).map(p=>({x:p.x,y:p.y,kind:p.kind,light:p.light})));
    canvas.dataset.particleCount=particles.length;canvas.dataset.vineClicks=clicks;
  }
  function burst(e){
    const v=vines.find(v=>e.clientY>8&&e.clientY<=v.length&&Math.abs(e.clientX-vx(v,e.clientY/v.length))<18);
    if(!v)return;
    clicks++;document.getElementById('hint').style.opacity='0';
    const amount=reduced.matches?12:24;
    for(let i=0;i<amount;i++){
      const t=.15+random()*.8;
      particles.push({x:vx(v,t)+(random()-.5)*70,y:v.length*t,vx:(random()-.5)*24,vy:15+random()*28,size:3+random()*5,
        kind:i%3,phase:random()*7,spin:(random()-.5)*1.2,age:0,life:5+random()*3,light:1});
    }
    if(particles.length>scene.particleLimit)particles.splice(0,particles.length-scene.particleLimit);
    expose();
  }
  function drawVine(v){
    ctx.globalAlpha=.22+v.depth*.25;ctx.strokeStyle='#858771';ctx.lineWidth=.65;
    ctx.beginPath();ctx.moveTo(v.x,-3);for(let i=1;i<=16;i++){const t=i/16;ctx.lineTo(vx(v,t),v.length*t);}ctx.stroke();
    for(const leaf of v.leaves){ctx.globalAlpha=.23;ctx.fillStyle='#93977c';ctx.beginPath();ctx.ellipse(vx(v,leaf.t)+leaf.side*5,v.length*leaf.t,leaf.size*.65,leaf.size,leaf.side*.6,0,7);ctx.fill();}
    for(const f of v.flowers){
      ctx.globalAlpha=f.alpha*(.67+v.depth*.33);
      ctx.drawImage(flowers[f.sprite],vx(v,f.t)+f.offset-f.size/2,v.length*f.t-f.size*.4,f.size,f.size);
    }
  }
  function sparkle(p){
    const fade=Math.min(1,p.age/.18,Math.max(0,(p.life-p.age)/1.2));
    p.light=(.4+.6*Math.pow(.5+.5*Math.sin(p.age*5+p.phase),2))*fade;
    const r=p.size;ctx.save();ctx.translate(p.x,p.y);
    ctx.globalAlpha=p.light;const halo=ctx.createRadialGradient(0,0,0,0,0,r*3.3);
    halo.addColorStop(0,'#fff9ff');halo.addColorStop(.25,'#ffdef0ad');halo.addColorStop(1,'#efb5d800');
    ctx.fillStyle=halo;ctx.fillRect(-r*3.3,-r*3.3,r*6.6,r*6.6);
    ctx.rotate(p.age*p.spin);ctx.fillStyle='#fff8fd';ctx.strokeStyle='#dca3c6';ctx.lineWidth=.65;ctx.beginPath();
    if(p.kind===0){for(let i=0;i<10;i++){const a=-Math.PI/2+i*Math.PI/5,rr=i%2?r*.45:r;i?ctx.lineTo(Math.cos(a)*rr,Math.sin(a)*rr):ctx.moveTo(Math.cos(a)*rr,Math.sin(a)*rr);}ctx.closePath();ctx.fill();ctx.stroke();}
    else if(p.kind===1){
      ctx.moveTo(0,-r*1.8);ctx.quadraticCurveTo(r*.12,-r*.12,r*1.8,0);ctx.quadraticCurveTo(r*.12,r*.12,0,r*1.8);ctx.quadraticCurveTo(-r*.12,r*.12,-r*1.8,0);ctx.quadraticCurveTo(-r*.12,-r*.12,0,-r*1.8);ctx.fill();
      ctx.strokeStyle='#fff';ctx.lineWidth=.7;ctx.beginPath();ctx.moveTo(-r*2.7,0);ctx.lineTo(r*2.7,0);ctx.moveTo(0,-r*2.7);ctx.lineTo(0,r*2.7);ctx.stroke();
    }else{ctx.moveTo(0,-r);ctx.lineTo(r*.62,0);ctx.lineTo(0,r);ctx.lineTo(-r*.62,0);ctx.closePath();ctx.fill();ctx.stroke();}
    ctx.restore();
  }
  function frame(now){
    if(!alive)return;raf=requestAnimationFrame(frame);const dt=last===null?0:Math.min((now-last)/1000,.05);last=now;time+=dt;
    const bg=ctx.createLinearGradient(0,0,0,h);bg.addColorStop(0,'#faf8f4');bg.addColorStop(.52,'#fafce8');bg.addColorStop(1,'#f7f9e7');ctx.globalAlpha=1;ctx.fillStyle=bg;ctx.fillRect(0,0,w,h);
    // Clip even the flower fringe and the changing wind pose to the upper half.
    ctx.save();ctx.beginPath();ctx.rect(0,0,w,h/2);ctx.clip();for(const v of vines)drawVine(v);ctx.restore();
    ctx.globalAlpha=1;const veil=ctx.createLinearGradient(0,0,0,92);veil.addColorStop(0,'#fffcf8bb');veil.addColorStop(1,'#fffcf800');ctx.fillStyle=veil;ctx.fillRect(0,0,w,92);
    for(const p of particles){p.age+=dt;p.vy+=dt*13;p.x+=p.vx*dt+Math.sin(p.age+p.phase)*dt*5;p.y+=p.vy*dt;sparkle(p);}
    particles=particles.filter(p=>p.age<p.life&&p.y<h+30);ctx.globalAlpha=1;expose();
  }
  canvas.dataset.wisteriaReady='true';resize();
  window.addEventListener('resize',resize,{signal:events.signal});canvas.addEventListener('pointerdown',burst,{signal:events.signal});
  raf=requestAnimationFrame(frame);
  return ()=>{alive=false;cancelAnimationFrame(raf);events.abort();particles=[];vines=[];for(const key of ['wisteriaReady','vineTargets','vineMotion','sparkles','particleCount','vineClicks'])delete canvas.dataset[key];};
};
