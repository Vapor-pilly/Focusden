window.GardenRenderers=window.GardenRenderers||{};
window.GardenRenderers['crystal-guitar']=function(canvas,scene){
  'use strict';
  const ctx=canvas.getContext('2d',{alpha:false}),events=new AbortController();
  const names=['background','guitar','ring-back','ring-front','butterfly-left','butterfly-right'];
  const images=Object.fromEntries(names.map(name=>{const im=new Image();im.src=`scenes/crystal-guitar/${name}.webp`;return [name,im];}));
  let w,h,scale,left,top,raf,alive=true,ready=false,pose={float:0,angle:0,wing:1},pulse=null;
  let last=-1,dragging=false;
  const listen=(target,name,fn)=>target.addEventListener(name,fn,{signal:events.signal});
  function resize(){w=innerWidth;h=innerHeight;const dpr=Math.min(devicePixelRatio||1,2);canvas.width=w*dpr;canvas.height=h*dpr;ctx.setTransform(dpr,0,0,dpr,0,0);scale=Math.min(h*.70,w*.78,850)/1192;left=(w-1192*scale)/2+w*.065;top=h*.23;}
  function exposeTargets(){
    canvas.dataset.stringPoints=JSON.stringify(scene.notes.map((note,i)=>({note,x:left+(488+(i-3)*7.8)*scale,y:top+(666+(i-3)*6.8+pose.float)*scale})));
  }
  function pluck(e){
    if(!ready)return;
    const x=(e.clientX-left)/scale,y=(e.clientY-top)/scale-pose.float;
    const dx=566,dy=-630,len=Math.hypot(dx,dy),along=((x-310)*dx+(y-850)*dy)/len;
    const across=((x-310)*(-dy)+(y-850)*dx)/len;
    if(along<10||along>len*.94||across< -27||across>46)return;
    const index=Math.max(0,Math.min(6,Math.floor((across+27)/10.43)));
    if(e.type==='pointermove'&&last===index)return;last=index;
    pulse={time:performance.now(),index};canvas.dataset.lastNote=scene.notes[index];canvas.dataset.plucks=String(Number(canvas.dataset.plucks)+1);
    document.getElementById('hint').style.opacity='0';
    document.dispatchEvent(new CustomEvent('garden-guitar-note',{detail:{note:scene.notes[index]}}));
  }
  listen(canvas,'pointerdown',e=>{dragging=true;last=-1;pluck(e);});
  listen(canvas,'pointermove',e=>{if(dragging)pluck(e);});
  listen(window,'pointerup',()=>{dragging=false;last=-1;});listen(window,'blur',()=>{dragging=false;});
  listen(canvas,'pointerleave',()=>{dragging=false;last=-1;});
  resize();listen(window,'resize',resize);canvas.dataset.guitarReady='false';canvas.dataset.plucks='0';
  Promise.all(Object.values(images).map(im=>im.decode())).then(()=>{if(alive){ready=true;canvas.dataset.guitarReady='true';}}).catch(()=>{if(alive)canvas.dataset.guitarReady='error';});
  const draw=name=>ctx.drawImage(images[name],0,0,1192,1192);
  function ring(name,t){
    ctx.save();ctx.translate(455,760);ctx.rotate(-.73);
    // Projection of an orbit about the diagonal neck axis. The signed width
    // moves the original ring through front/back depth, rather than spinning the guitar.
    ctx.transform(Math.cos(t),.22*Math.sin(t),-.12*Math.sin(t),1,0,0);
    ctx.rotate(.73);ctx.translate(-455,-760);draw(name);ctx.restore();
  }
  function butterfly(name,x,y,t,offset){
    const flutter=.30+.70*Math.abs(Math.cos(t*10+offset));
    ctx.save();ctx.translate(x+Math.sin(t*.9+offset)*3,y+Math.sin(t*1.6+offset)*5);
    ctx.rotate(Math.sin(t*1.3+offset)*.045);ctx.scale(flutter,1);ctx.translate(-x,-y);draw(name);ctx.restore();return flutter;
  }
  function frame(now){
    if(!alive)return;raf=requestAnimationFrame(frame);ctx.fillStyle='#fff';ctx.fillRect(0,0,w,h);
    if(!ready)return;
    const t=now/1000,reduced=matchMedia('(prefers-reduced-motion: reduce)').matches;
    pose.float=reduced?0:Math.sin(t*.85)*10;pose.angle=reduced?0:t*Math.PI/14;
    ctx.save();ctx.translate(left,top);ctx.scale(scale,scale);draw('background');
    ctx.translate(0,pose.float);
    ctx.save();ctx.shadowColor='#81699622';ctx.shadowBlur=25;ctx.shadowOffsetY=17;
    // A slight changing shear gives the preserved image subtle parallax depth.
    ctx.transform(1,0,reduced?0:Math.sin(t*.37)*.003,1,0,0);
    ring('ring-back',pose.angle);if(Math.cos(pose.angle)<0)ring('ring-front',pose.angle);
    draw('guitar');if(Math.cos(pose.angle)>=0)ring('ring-front',pose.angle);ctx.restore();
    pose.wing=butterfly('butterfly-left',377,549,reduced?0:t,0);
    butterfly('butterfly-right',752,641,reduced?0:t,1.7);
    if(pulse&&now-pulse.time<900){
      const age=(now-pulse.time)/900,offset=(pulse.index-3)*7.8;
      ctx.strokeStyle=`rgba(255,246,214,${(1-age)*.85})`;ctx.lineWidth=2.4;
      ctx.shadowBlur=12;ctx.shadowColor='#fff';ctx.beginPath();ctx.moveTo(310+offset,850+offset*.87);
      ctx.quadraticCurveTo(515+offset+Math.sin(age*70)*(1-age)*5,620+offset*.87,876+offset,220+offset*.87);ctx.stroke();
    }
    ctx.restore();exposeTargets();canvas.dataset.guitarPose=JSON.stringify(pose);
  }
  raf=requestAnimationFrame(frame);
  return ()=>{alive=false;cancelAnimationFrame(raf);events.abort();for(const im of Object.values(images))im.src='';for(const key of ['guitarReady','plucks','lastNote','stringPoints','guitarPose'])delete canvas.dataset[key];};
};
