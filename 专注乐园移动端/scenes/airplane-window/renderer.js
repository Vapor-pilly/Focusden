window.GardenRenderers=window.GardenRenderers||{};
window.GardenRenderers['airplane-window']=function(canvas,scene){
  'use strict';
  const ctx=canvas.getContext('2d',{alpha:false}),events=new AbortController(),motion=matchMedia('(prefers-reduced-motion: reduce)');
  let w,h,W,H,left,top,inset,raf,alive=true,shade=0,drag=null,last=null,time=0,float=0;
  let seed=6812;const random=()=>{seed=(seed*1664525+1013904223)>>>0;return seed/4294967296;};
  const tileWidth=1800,tileHeight=1100;
  function landscape(layer){
    const tile=document.createElement('canvas');tile.width=tileWidth;tile.height=tileHeight;const c=tile.getContext('2d');
    // A periodically sampled terrain profile wraps without a visible join.
    function ground(x){return 590+Math.sin(x/tileWidth*Math.PI*2)*34+Math.cos(x/tileWidth*Math.PI*6+.5)*23;}
    if(layer===0){
      c.strokeStyle='#97adff33';c.lineWidth=1.4;
      for(let band=0;band<4;band++){
        c.beginPath();for(let x=0;x<=tileWidth;x+=8){const y=ground(x)+band*44;x?c.lineTo(x,y):c.moveTo(x,y);}c.stroke();
      }
      for(let i=0;i<190;i++){const x=random()*tileWidth,y=ground(x)+random()*170;c.fillStyle=`rgba(177,191,255,${.15+random()*.35})`;c.fillRect(x,y,1.1+random()*1.3,1.2);}
    }else{
      for(let road=0;road<7;road++){
        const baseline=650+road*57,points=[];
        const knots=Array.from({length:12},()=>baseline+(random()-.5)*85);knots.push(knots[0]);
        c.beginPath();
        for(let i=0;i<=12;i++){const x=i/12*tileWidth,y=knots[i];points.push([x,y]);i?c.lineTo(x,y):c.moveTo(x,y);}
        c.strokeStyle=road%3===0?'#f4dfaa88':'#b4c0f34f';c.lineWidth=road%3===0?1.8:1.1;c.stroke();
        for(let segment=0;segment<12;segment++){
          const [ax,ay]=points[segment],[bx,by]=points[segment+1];
          for(let j=0;j<12;j++){const f=j/12;c.fillStyle=j%4===0?'#fff5d7ac':'#c3d6ff8c';c.fillRect(ax+(bx-ax)*f,ay+(by-ay)*f-1.3,1.4,1.4);}
          if(segment%3===1){c.strokeStyle='#b5c8f53d';c.lineWidth=.8;c.beginPath();c.moveTo(ax,ay);c.lineTo(ax+45,ay+45);c.lineTo(ax+150,ay+75);c.lineTo(ax+190,ay+125);c.stroke();}
        }
      }
      for(let i=0;i<2300;i++){
        const x=random()*tileWidth,y=ground(x)+25+random()*450;
        const alpha=.16+random()*.59,r=.5+random()*1.6;
        c.fillStyle=i%9===0?`rgba(255,230,176,${alpha})`:`rgba(207,222,255,${alpha})`;
        c.beginPath();c.ellipse(x,y,r,r*.75,0,0,7);c.fill();
        if(i%50===0){c.fillStyle='#d0dcff0c';c.beginPath();c.arc(x,y,r*5,0,7);c.fill();}
      }
    }
    return tile;
  }
  const layers=[landscape(0),landscape(1)];
  function shape(pad=0){
    const x=pad,y=pad,a=W-pad*2,b=H-pad*2,p=new Path2D();
    p.moveTo(x+a*.51,y);
    p.bezierCurveTo(x+a*.81,y-1,x+a*.96,y+b*.18,x+a*.975,y+b*.40);
    p.bezierCurveTo(x+a*1.025,y+b*.72,x+a*.91,y+b*.95,x+a*.64,y+b*.99);
    p.bezierCurveTo(x+a*.31,y+b*1.06,x+a*.04,y+b*.91,x+a*.025,y+b*.67);
    p.bezierCurveTo(x-a*.015,y+b*.39,x+a*.06,y+b*.15,x+a*.30,y+b*.035);
    p.bezierCurveTo(x+a*.37,y+b*.006,x+a*.45,y,x+a*.51,y);p.closePath();return p;
  }
  function resize(){
    w=innerWidth;h=innerHeight;const dpr=Math.min(devicePixelRatio||1,2);canvas.width=w*dpr;canvas.height=h*dpr;ctx.setTransform(dpr,0,0,dpr,0,0);
    top=h*.30;H=Math.min(h*.57,h-115-top,w*.73);if(w<600){top=h*.31;H=Math.min(h*.50,h-150-top,w*1.14);}else if(h<550){top=h*.12;H=h*.72;}W=H*.73;left=(h<550&&w>600?w*.75-W/2:(w-W)/2);inset=Math.max(16,W*.058);drag=null;canvas.style.cursor='';expose();
  }
  const handleY=()=>inset+18+shade*(H-2*inset-38);
  function expose(){
    canvas.dataset.windowBounds=JSON.stringify({x:left,y:top+float,width:W,height:H});
    canvas.dataset.shadeHandle=JSON.stringify({x:left+W/2,y:top+float+handleY(),width:W*.36});
    canvas.dataset.shade=shade.toFixed(4);canvas.dataset.windowFloat=float.toFixed(3);
    canvas.dataset.landscapeOffset=JSON.stringify([time*7%tileWidth,time*17%tileWidth]);
    canvas.dataset.shadeDragging=String(!!drag);
  }
  function release(){if(drag&&canvas.hasPointerCapture(drag.id))canvas.releasePointerCapture(drag.id);drag=null;canvas.style.cursor='';expose();}
  canvas.addEventListener('pointerdown',e=>{
    if(e.button!==0)return;
    const localX=e.clientX-left,localY=e.clientY-top-float;
    if(Math.abs(localX-W/2)>W*.25||Math.abs(localY-handleY())>21)return;
    drag={id:e.pointerId,start:e.clientY,value:shade};canvas.setPointerCapture(e.pointerId);canvas.style.cursor='grabbing';
    document.getElementById('hint').style.opacity='0';expose();
  },{signal:events.signal});
  canvas.addEventListener('pointermove',e=>{
    if(drag&&e.pointerId===drag.id)shade=Math.max(0,Math.min(1,drag.value+(e.clientY-drag.start)/(H-2*inset-38)));
    else {const handle=JSON.parse(canvas.dataset.shadeHandle);canvas.style.cursor=Math.abs(e.clientX-handle.x)<W*.25&&Math.abs(e.clientY-handle.y)<21?'grab':'';}
    expose();
  },{signal:events.signal});
  for(const event of ['pointerup','pointercancel','lostpointercapture'])canvas.addEventListener(event,()=>{drag=null;canvas.style.cursor='';expose();},{signal:events.signal});
  window.addEventListener('blur',release,{signal:events.signal});window.addEventListener('resize',resize,{signal:events.signal});
  function frame(now){
    if(!alive)return;raf=requestAnimationFrame(frame);const dt=last===null?0:Math.min((now-last)/1000,.08);last=now;if(!motion.matches)time+=dt;
    if(!drag)float=motion.matches?0:Math.sin(time*.72)*3.8;
    ctx.fillStyle='#040408';ctx.fillRect(0,0,w,h);
    const room=ctx.createRadialGradient(w*.5,top+H*.5,30,w*.5,top+H*.5,H*.9);room.addColorStop(0,'#15213936');room.addColorStop(1,'#04040800');ctx.fillStyle=room;ctx.fillRect(0,0,w,h);
    ctx.save();ctx.translate(left,top+float);const outer=shape(),inner=shape(inset);
    ctx.shadowColor='#abc7ff77';ctx.shadowBlur=24;ctx.fillStyle='#b8cff7';ctx.fill(outer);ctx.shadowBlur=0;
    const metal=ctx.createLinearGradient(0,0,W,H);metal.addColorStop(0,'#d7e5ff');metal.addColorStop(.20,'#fff');metal.addColorStop(.42,'#89b7ed');metal.addColorStop(.65,'#f3f9ff');metal.addColorStop(1,'#a4bfe8');ctx.fillStyle=metal;ctx.fill(shape(3));
    ctx.strokeStyle='#fcffff';ctx.lineWidth=2.5;ctx.stroke(shape(5));ctx.strokeStyle='#353f50';ctx.lineWidth=3;ctx.stroke(shape(10));
    ctx.strokeStyle='#d3f1ff';ctx.lineWidth=3;ctx.stroke(shape(14));
    ctx.save();ctx.clip(inner);
    const sky=ctx.createLinearGradient(0,0,W*.2,H);sky.addColorStop(0,'#12114f');sky.addColorStop(.38,'#17177e');sky.addColorStop(1,'#233bd0');ctx.fillStyle=sky;ctx.fillRect(0,0,W,H);
    for(let i=0;i<layers.length;i++){
      const speed=i?17:7,offset=time*speed%tileWidth;
      ctx.save();ctx.scale(W/tileWidth,H/tileHeight);ctx.drawImage(layers[i],-offset,0);ctx.drawImage(layers[i],tileWidth-offset,0);ctx.restore();
    }
    const glass=ctx.createLinearGradient(0,0,W,H);glass.addColorStop(0,'#a8c7ff1a');glass.addColorStop(.28,'#ffffff00');glass.addColorStop(.7,'#ffffff00');glass.addColorStop(1,'#0b113355');ctx.fillStyle=glass;ctx.fillRect(0,0,W,H);
    // The cabin blind is clipped to the same aperture as the moving landscape.
    const blindBottom=shade>=.999?H:handleY()+13;
    const blind=ctx.createLinearGradient(0,0,W,0);blind.addColorStop(0,'#667a97');blind.addColorStop(.22,'#b6c4d5');blind.addColorStop(.62,'#d6dee7');blind.addColorStop(1,'#7388a3');ctx.fillStyle=blind;ctx.fillRect(0,0,W,blindBottom);
    ctx.fillStyle='#111a2f22';for(let y=20;y<blindBottom;y+=3)ctx.fillRect(0,y,W,.38);
    ctx.fillStyle='#263a5555';ctx.fillRect(0,blindBottom-3,W,3);
    const gripW=Math.min(52,W*.22),hy=handleY();ctx.shadowColor='#1a243f';ctx.shadowBlur=3;ctx.shadowOffsetY=1;
    ctx.fillStyle='#e8eef6';ctx.beginPath();ctx.roundRect(W/2-gripW/2,hy-4,gripW,8,4);ctx.fill();ctx.shadowBlur=0;ctx.shadowOffsetY=0;
    ctx.strokeStyle='#7186a0';ctx.lineWidth=1;ctx.beginPath();ctx.moveTo(W/2-gripW*.3,hy);ctx.lineTo(W/2+gripW*.3,hy);ctx.stroke();
    ctx.restore();ctx.strokeStyle='#27334c';ctx.lineWidth=3;ctx.stroke(inner);ctx.strokeStyle='#8ba4cc88';ctx.lineWidth=1;ctx.stroke(shape(inset+4));ctx.restore();expose();
  }
  resize();canvas.dataset.airplaneReady='true';raf=requestAnimationFrame(frame);
  return ()=>{alive=false;cancelAnimationFrame(raf);release();events.abort();canvas.style.cursor='';for(const tile of layers){tile.width=tile.height=1;}for(const key of ['airplaneReady','windowBounds','shadeHandle','shade','windowFloat','landscapeOffset','shadeDragging'])delete canvas.dataset[key];};
};
