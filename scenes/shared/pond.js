window.GardenRenderers=window.GardenRenderers||{};
window.GardenRenderers.pond=function(canvas,theme){
  'use strict';
  const ctx=canvas.getContext('2d',{alpha:false}),events=new AbortController();
  let alive=true,raf;
  const listen=(target,type,handler)=>target.addEventListener(type,handler,{signal:events.signal});
  let w,h,dpr,previous=0,t=0,active=false,light=0,lastRipple=0;
  const pointer={x:0,y:0},fish=[],ripples=[],motes=[];
  const rand=(a,b)=>a+Math.random()*(b-a),angleDiff=(a,b)=>Math.atan2(Math.sin(a-b),Math.cos(a-b));
  function resize(){w=innerWidth;h=innerHeight;dpr=Math.min(devicePixelRatio||1,2);canvas.width=w*dpr;canvas.height=h*dpr;ctx.setTransform(dpr,0,0,dpr,0,0);}
  resize();listen(window,'resize',resize);
  function seedFish(){fish.length=0;for(let i=0;i<theme.count;i++){const depth=rand(.35,1);fish.push({x:rand(0,w),y:rand(0,h),angle:rand(-Math.PI,Math.PI),size:rand(...theme.size)*depth,speed:rand(15,32),depth,color:theme.colors[i%theme.colors.length],seed:rand(0,100),turn:0});}}
  seedFish();
  for(let i=0;i<45;i++)motes.push({x:Math.random(),y:Math.random(),r:rand(.5,1.7),seed:rand(0,50)});
  let oldW=w,oldH=h;
  function ripple(x,y){ripples.push({x,y,r:5,a:.45});if(ripples.length>12)ripples.shift();}
  listen(canvas,'pointerdown',e=>{active=true;canvas.dataset.interacting='true';pointer.x=e.clientX;pointer.y=e.clientY;canvas.setPointerCapture(e.pointerId);ripple(pointer.x,pointer.y);document.dispatchEvent(new Event('pond-touch'));document.getElementById('hint').style.opacity='0';});
  listen(canvas,'pointermove',e=>{pointer.x=e.clientX;pointer.y=e.clientY;if(e.clientX<=0||e.clientY<=0||e.clientX>=w||e.clientY>=h){active=false;canvas.dataset.interacting='false';}});
  const release=()=>{active=false;canvas.dataset.interacting='false';};listen(canvas,'pointerup',release);listen(canvas,'pointercancel',release);listen(canvas,'pointerleave',release);listen(window,'blur',release);listen(document,'visibilitychange',()=>{if(document.hidden)release();});
  function body(f,shadow){ctx.save();ctx.translate(f.x+(shadow?7:0),f.y+(shadow?14:0));ctx.rotate(f.angle);const s=f.size;ctx.scale(s,s);if(theme.glowing&&!shadow){ctx.shadowColor=f.color;ctx.shadowBlur=8+f.depth*7+Math.sin(t*.7+f.seed)*2;}const flap=Math.sin(t*(active?8:5)+f.seed)*.3;ctx.fillStyle=shadow?'#314f4533':f.color;ctx.beginPath();ctx.moveTo(1.1,0);ctx.bezierCurveTo(.35,-.5,-.5,-.5,-.8,0);ctx.bezierCurveTo(-.5,.5,.35,.5,1.1,0);ctx.fill();ctx.beginPath();ctx.moveTo(-.65,0);ctx.quadraticCurveTo(-1.15,-.12+flap,-1.6,-.5+flap);ctx.quadraticCurveTo(-1.35,flap,-1.6,.5+flap);ctx.quadraticCurveTo(-1.1,.12+flap,-.65,0);ctx.fill();if(!shadow){ctx.globalAlpha=.28;ctx.fillStyle='#fffbed';ctx.beginPath();ctx.ellipse(.12,-.16,.63,.08,-.06,0,Math.PI*2);ctx.fill();ctx.globalAlpha=.5;ctx.beginPath();ctx.moveTo(-.1,-.25);ctx.lineTo(-.4,-.67);ctx.lineTo(.4,-.27);ctx.fill();ctx.globalAlpha=.6;ctx.fillStyle='#53635b';ctx.beginPath();ctx.arc(.69,-.1,.045,0,Math.PI*2);ctx.fill();}ctx.restore();}
  function draw(now){if(!alive)return;const dt=Math.min((now-previous)/1000||.016,.04);previous=now;t+=dt;if(oldW!==w||oldH!==h){fish.forEach(f=>{f.x*=w/oldW;f.y*=h/oldH;});oldW=w;oldH=h;}
    const bg=ctx.createLinearGradient(0,0,w*.7,h);bg.addColorStop(0,theme.water[0]);bg.addColorStop(.42,theme.water[1]);bg.addColorStop(1,theme.water[2]);ctx.fillStyle=bg;ctx.fillRect(0,0,w,h);
    // Broad patches of warm light move slowly across the water.
    const glow=ctx.createRadialGradient(w*.15,h*.07,0,w*.15,h*.07,w*.8);glow.addColorStop(0,theme.sunlight);glow.addColorStop(1,'#f8e9bd00');ctx.fillStyle=glow;ctx.fillRect(0,0,w,h);
    ctx.save();ctx.lineWidth=1;for(let row=-1;row<7;row++){for(let col=-1;col<10;col++){const x=col*w/7+Math.sin(t*.18+row*.8)*38,y=row*h/5+Math.cos(col+t*.13)*30;ctx.strokeStyle=`rgba(${theme.caustic.join(',')},${.025+.012*Math.sin(t*.5+col)})`;ctx.beginPath();ctx.ellipse(x,y,w/8+Math.sin(row+col)*18,h/9,Math.sin(t*.12+col)*.4,0,Math.PI*2);ctx.stroke();}}ctx.restore();
    // Caustic ribbons rather than a static texture.
    ctx.save();ctx.filter='blur(2px)';for(let i=0;i<9;i++){ctx.beginPath();for(let x=-100;x<w+100;x+=18){const y=h*(i/8)+Math.sin(x*.006+t*.22+i)*38+Math.sin(x*.014-t*.13+i)*17;x===-100?ctx.moveTo(x,y):ctx.lineTo(x,y);}ctx.strokeStyle=theme.ribbon;ctx.lineWidth=2;ctx.stroke();}ctx.restore();
    light+=(Number(active)-light)*Math.min(1,dt*5);
    fish.forEach(f=>{let target=f.angle+Math.sin(t*.5+f.seed)*.025;let speed=f.speed*f.depth;if(active){const dx=pointer.x-f.x,dy=pointer.y-f.y,dist=Math.hypot(dx,dy);target=Math.atan2(dy,dx);if(dist<40+f.size*2)target+=1.05;speed*=Math.min(2.5,.65+dist/160);}else{if(f.x<65)target=0;if(f.x>w-65)target=Math.PI;if(f.y<65)target=Math.PI/2;if(f.y>h-65)target=-Math.PI/2;}
      // Local separation preserves individual fish within the school.
      let sx=0,sy=0;for(const other of fish){if(f===other)continue;const dx=f.x-other.x,dy=f.y-other.y,d2=dx*dx+dy*dy;if(d2>0&&d2<1100){sx+=dx/d2*12;sy+=dy/d2*12;}}
      target+=Math.max(-.5,Math.min(.5,sx*Math.sin(f.angle)-sy*Math.cos(f.angle)));f.angle+=Math.max(-dt*1.9,Math.min(dt*1.9,angleDiff(target,f.angle)));f.x+=Math.cos(f.angle)*speed*dt+sx*dt*4;f.y+=Math.sin(f.angle)*speed*dt+sy*dt*4;f.x=Math.max(-30,Math.min(w+30,f.x));f.y=Math.max(-30,Math.min(h+30,f.y));if(!theme.glowing){ctx.globalAlpha=f.depth*.48;body(f,true);}ctx.globalAlpha=theme.glowing?.55+f.depth*.45:.3+f.depth*.64;body(f,false);});ctx.globalAlpha=1;
    motes.forEach(p=>{const x=p.x*w+Math.sin(t*.2+p.seed)*12,y=(p.y*h-t*2+p.seed*h)%(h+10);ctx.beginPath();ctx.arc(x,y,p.r,0,Math.PI*2);ctx.fillStyle=theme.motes;ctx.fill();});
    for(let i=ripples.length-1;i>=0;i--){const r=ripples[i];r.r+=dt*44;r.a-=dt*.15;if(r.a<=0){ripples.splice(i,1);continue;}ctx.lineWidth=.8;ctx.strokeStyle=`rgba(255,245,210,${r.a})`;ctx.beginPath();ctx.ellipse(r.x,r.y,r.r,r.r*.72,0,0,Math.PI*2);ctx.stroke();}
    if(light>.005){const g=ctx.createRadialGradient(pointer.x,pointer.y,0,pointer.x,pointer.y,85);g.addColorStop(0,`rgba(255,243,195,${light*.7})`);g.addColorStop(.15,`rgba(255,239,186,${light*.24})`);g.addColorStop(1,'#fff0bd00');ctx.fillStyle=g;ctx.fillRect(pointer.x-85,pointer.y-85,170,170);ctx.fillStyle=`rgba(255,249,225,${light})`;ctx.beginPath();ctx.arc(pointer.x,pointer.y,3.5,0,Math.PI*2);ctx.fill();if(active&&t-lastRipple>.65){ripple(pointer.x,pointer.y);lastRipple=t;}}
    raf=requestAnimationFrame(draw);
  }
  raf=requestAnimationFrame(draw);
  return ()=>{alive=false;cancelAnimationFrame(raf);events.abort();};
};
