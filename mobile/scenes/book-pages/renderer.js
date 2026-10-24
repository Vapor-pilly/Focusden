window.GardenRenderers=window.GardenRenderers||{};
window.GardenRenderers['book-pages']=function(canvas,scene){
  'use strict';
  const ctx=canvas.getContext('2d',{alpha:false}),events=new AbortController();
  let w,h,dpr,raf,alive=true,ready=false,start=null,nextAuto=0,turn=null,pending=0,auto=0,clicked=0,cycle=0;
  let left,top,scale;
  const images=scene.sheets.map(src=>{const image=new Image();image.src=src;return image;});
  const listen=(target,name,fn)=>target.addEventListener(name,fn,{signal:events.signal});
  function resize(){
    w=innerWidth;h=innerHeight;dpr=Math.min(devicePixelRatio||1,2);
    canvas.width=w*dpr;canvas.height=h*dpr;ctx.setTransform(dpr,0,0,dpr,0,0);
    scale=Math.min(w*.72,h*.8,780)/scene.frameWidth;
    left=(w-scene.frameWidth*scale)/2;top=h*.70-210*scale;if(w<600){scale=Math.min(w*.96,h*.62)/scene.frameWidth;left=(w-scene.frameWidth*scale)/2;top=h*.66-210*scale;}else if(h<550){scale=Math.min(w*.45,h*1.05)/scene.frameWidth;left=w*.75-scene.frameWidth*scale/2;top=h*.5-170*scale;}
    canvas.dataset.bookBounds=JSON.stringify([left+50*scale,top+100*scale,392*scale,190*scale]);
  }
  function begin(kind,time){
    turn={kind,time};
    if(kind==='auto'){auto++;cycle=(auto-1)%images.length;nextAuto+=scene.autoPeriod*(Math.floor((time-nextAuto)/scene.autoPeriod)+1);}
    else clicked++;
    canvas.dataset.autoTurns=auto;canvas.dataset.clickTurns=clicked;
    canvas.dataset.queuedTurns=pending;
    document.dispatchEvent(new CustomEvent('garden-page-turn',{detail:{kind}}));
  }
  resize();listen(window,'resize',resize);
  canvas.dataset.bookReady='false';canvas.dataset.autoTurns='0';canvas.dataset.clickTurns='0';canvas.dataset.queuedTurns='0';
  Promise.all(images.map(image=>image.decode())).then(()=>{if(alive){ready=true;canvas.dataset.bookReady='true';}}).catch(()=>{if(alive)canvas.dataset.bookReady='error';});
  listen(canvas,'pointerdown',e=>{
    if(!ready)return;
    const [x,y,bw,bh]=JSON.parse(canvas.dataset.bookBounds);
    if(e.clientX<x||e.clientX>x+bw||e.clientY<y||e.clientY>y+bh)return;
    pending++;canvas.dataset.queuedTurns=pending;
    document.getElementById('hint').style.opacity='0';
    // If idle, start from the input handler so the first sound has a user gesture.
    const time=start===null?0:(performance.now()-start)/1000;
    if(!turn||time-turn.time>=scene.turnDuration){pending--;begin('click',time);}
  });
  function frame(now){
    if(!alive)return;raf=requestAnimationFrame(frame);ctx.fillStyle='#fff';ctx.fillRect(0,0,w,h);
    if(!ready)return;
    if(start===null)start=now;
    const time=(now-start)/1000;
    if(!turn||time-turn.time>=scene.turnDuration){
      if(pending){pending--;begin('click',time);}
      else if(time>=nextAuto)begin('auto',time);
    }
    const elapsed=turn?time-turn.time:0;
    const index=Math.min(scene.framesPerSheet-1,Math.max(0,Math.floor(elapsed*scene.frameRate)));
    ctx.drawImage(images[cycle],(index%scene.sheetColumns)*scene.frameWidth,Math.floor(index/scene.sheetColumns)*scene.frameHeight,scene.frameWidth,scene.frameHeight,left,top,scene.frameWidth*scale,scene.frameHeight*scale);
    canvas.dataset.bookFrame=index;
  }
  raf=requestAnimationFrame(frame);
  return ()=>{
    alive=false;cancelAnimationFrame(raf);events.abort();
    for(const image of images)image.src='';
    for(const key of ['bookReady','autoTurns','clickTurns','queuedTurns','bookBounds','bookFrame'])delete canvas.dataset[key];
  };
};
