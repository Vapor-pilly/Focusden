(() => {
  'use strict';
  const $ = id => document.getElementById(id), KEY = 'yiyu.garden.v1';
  const catalog=window.GardenScenes;
  const requestedPreview=new URLSearchParams(location.search).get('preview');
  let preview=catalog.has(requestedPreview)?requestedPreview:null;
  const today = () => { const d=new Date(); return `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`; };
  const defaults = () => catalog.collection({version:1,focus:25,rest:5,phase:'focus',remaining:1500,totalSeconds:0,cycles:0,day:today(),eligibleDay:null,consumedDay:null,sceneChangedDay:null,scene:catalog.all[Math.floor(Math.random()*catalog.all.length)].id,volume:.35,effects:true});
  function valid(s) { return s && s.version===1 && Number.isInteger(s.focus)&&s.focus>=1&&s.focus<=180&&Number.isInteger(s.rest)&&s.rest>=1&&s.rest<=60&&['focus','rest'].includes(s.phase)&&Number.isFinite(s.remaining)&&s.remaining>=0&&s.remaining<=10800&&Number.isFinite(s.totalSeconds)&&s.totalSeconds>=0&&Number.isSafeInteger(s.cycles)&&s.cycles>=0&&catalog.dateValid(s.day)&&(s.eligibleDay===null||catalog.dateValid(s.eligibleDay))&&(s.consumedDay==null||catalog.dateValid(s.consumedDay))&&(s.sceneChangedDay==null||catalog.dateValid(s.sceneChangedDay))&&catalog.has(s.scene)&&Number.isFinite(s.volume)&&s.volume>=0&&s.volume<=1&&typeof s.effects==='boolean'&&catalog.collectionValid(s); }
  let state=defaults(), running=false,last=0,lastSave=0, toastTimer;
  try { const s=JSON.parse(localStorage.getItem(KEY));if(valid(s)) state=catalog.collection({...defaults(),...s,unlocked:s.unlocked,favorites:s.favorites}); } catch {}
  function persist(){try{localStorage.setItem(KEY,JSON.stringify(state));}catch{toast('浏览器无法保存数据，请导出备份');}}
  function rollover(){const date=today();if(date!==state.day){state.day=date;persist();}}
  function applyScene(){const scene=catalog.get(preview||state.scene);document.documentElement.dataset.scene=scene.id;$('sceneName').textContent=`${scene.number} / ${scene.name}`;$('sceneMode').textContent=preview?'场景预览':'今日风景';document.querySelector('meta[name=theme-color]').content=scene.themeColor;window.dispatchEvent(new CustomEvent('garden-scene',{detail:scene}));}
  function selectScene(){if(!preview)state=catalog.choose(state,today());applyScene();renderLibrary();}
  const icons={play:'<path d="m9 5 12 11L9 27Z" fill="currentColor" stroke="none"/>',pause:'<path d="M11 7v18M21 7v18" stroke-width="4"/>',user:'<circle cx="16" cy="10" r="5"/><path d="M6 28v-3a10 10 0 0 1 20 0v3"/>',sound:'<path d="M5 19v-6M11 24V8M17 28V4M23 23V9M29 18v-4"/>',expand:'<path d="M4 12V4h8M20 4h8v8M28 20v8h-8M12 28H4v-8"/>'};
  const svg=n=>`<svg viewBox="0 0 32 32" aria-hidden="true">${icons[n]}</svg>`;
  $('profile').querySelector('.icon').innerHTML=svg('user');$('sound').querySelector('.icon').innerHTML=svg('sound');$('fullscreen').innerHTML=svg('expand');
  function render(){const n=Math.ceil(state.remaining);$('time').textContent=`${String(Math.floor(n/60)).padStart(2,'0')}:${String(n%60).padStart(2,'0')}`;$('focusTab').classList.toggle('selected',state.phase==='focus');$('breakTab').classList.toggle('selected',state.phase==='rest');$('toggle').innerHTML=svg(running?'pause':'play');$('toggle').ariaLabel=running?'暂停计时':'开始计时';$('status').textContent=running?(state.phase==='focus'?'静下来，专注正在慢慢生长':'松一口气，让思绪漂浮片刻'):(state.remaining===(state.phase==='focus'?state.focus:state.rest)*60?'':'时间停在这里，等你回来');document.title=`${$('time').textContent} · ${state.phase==='focus'?'专注':'休息'} · 专注乐园`;$('count').textContent=state.cycles;$('minutes').textContent=(state.totalSeconds/60).toLocaleString('zh-CN',{maximumFractionDigits:1});const unlocked=state.eligibleDay===today();$('profileUnlock').textContent=unlocked?'已获得明日解锁资格，明日打开时将自动更换新场景。':state.eligibleDay?'已保留场景解锁记录；完成今天的周期，继续为明日解锁新场景。':'完成专注与休息的完整周期，收下明日场景的解锁资格。';}
  function toast(t){$('toast').textContent=t;$('toast').classList.add('show');clearTimeout(toastTimer);toastTimer=setTimeout(()=>$('toast').classList.remove('show'),3200);}
  const completion=new Audio('audio/complete.wav'), water=new Audio('audio/water.wav'),pageTurn=new Audio('audio/page-turn.wav');water.volume=.3;pageTurn.volume=.28;
  function play(a){a.currentTime=0;a.play().catch(()=>{});}
  function advance(seconds){while(seconds>0&&running){const step=Math.min(seconds,state.remaining);if(state.phase==='focus')state.totalSeconds+=step;state.remaining-=step;seconds-=step;if(state.remaining<=0){if(state.phase==='focus'){state.phase='rest';state.remaining=state.rest*60;toast('专注完成，休息一会儿吧');}else{state.cycles++;state.eligibleDay=today();state.remaining=state.focus*60;state.phase='focus';running=false;play(completion);toast('一个完整周期完成了，辛苦啦');}persist();}}}
  function tick(){const now=Date.now();if(running){advance(Math.max(0,(now-last)/1000));}last=now;rollover();render();if(now-lastSave>1000){persist();lastSave=now;}}
  setInterval(tick,200);
  function pause(){if(running){tick();running=false;persist();render();}}
  $('toggle').onclick=()=>{if(running)pause();else{if(state.remaining<=0)state.remaining=(state.phase==='focus'?state.focus:state.rest)*60;running=true;last=Date.now();render();}};
  function open(id){$(id).showModal();}
  document.querySelectorAll('dialog .close').forEach(b=>b.onclick=e=>{e.preventDefault();b.closest('dialog').close();});
  document.querySelectorAll('dialog').forEach(d=>d.addEventListener('click',e=>{if(e.target===d){const r=d.getBoundingClientRect();if(e.clientX<r.left||e.clientX>r.right||e.clientY<r.top||e.clientY>r.bottom)d.close();}}));
  $('settings').onclick=()=>{pause();$('focusMinutes').value=state.focus;$('breakMinutes').value=state.rest;open('settingsDialog');};
  function reset(){pause();state.remaining=(state.phase==='focus'?state.focus:state.rest)*60;persist();render();}
  $('saveSettings').onclick=()=>{const f=Number($('focusMinutes').value),r=Number($('breakMinutes').value);if(!Number.isInteger(f)||f<1||f>180||!Number.isInteger(r)||r<1||r>60){toast('专注请选 1–180 分钟，休息请选 1–60 分钟');return;}pause();state.focus=f;state.rest=r;reset();$('settingsDialog').close();toast('已保存你的节奏');};
  $('reset').onclick=()=>{reset();$('settingsDialog').close();toast('当前阶段已重置，专注积累仍保留');};
  $('focusTab').onclick=()=>{if(state.phase==='rest'){toast('休息结束后将自动回到专注');}else $('time').click();};$('breakTab').onclick=()=>{if(state.phase==='rest')$('time').click();else{toast('专注结束后会自动进入休息');}};
  let wheelValue=25;
  $('time').onclick=()=>{pause();const max=state.phase==='focus'?180:60;wheelValue=state.phase==='focus'?state.focus:state.rest;$('wheelTitle').textContent=`调整${state.phase==='focus'?'专注':'休息'}时长`;$('wheel').innerHTML=Array.from({length:max},(_,i)=>`<button type="button" role="option" aria-selected="${i+1===wheelValue}">${String(i+1).padStart(2,'0')}</button>`).join('');open('wheelDialog');$('wheel').scrollTop=(wheelValue-1)*42;};
  $('wheel').onscroll=()=>{wheelValue=Math.round($('wheel').scrollTop/42)+1;Array.from($('wheel').children).forEach((b,i)=>b.setAttribute('aria-selected',i+1===wheelValue));};
  $('wheel').onclick=e=>{if(e.target.tagName==='BUTTON')$('wheel').scrollTo({top:(Number(e.target.textContent)-1)*42,behavior:'smooth'});};
  $('wheel').onkeydown=e=>{if(e.key==='ArrowUp'||e.key==='ArrowDown'){e.preventDefault();$('wheel').scrollBy({top:e.key==='ArrowUp'?-42:42,behavior:'smooth'});}};
  $('saveWheel').onclick=()=>{wheelValue=Math.max(1,Math.min(state.phase==='focus'?180:60,Math.round($('wheel').scrollTop/42)+1));state[state.phase==='focus'?'focus':'rest']=wheelValue;reset();$('wheelDialog').close();toast('时长已更新');};
  let libraryTab='unlocked';
  function renderLibrary(){
    const unlocked=state.unlocked||[state.scene],favorites=state.favorites||[];
    for(const key of ['unlocked','favorites']){
      const ids=key==='unlocked'?unlocked:favorites;
      const tab=$(key+'Tab'),panel=$(key+'Panel'),list=$(key+'Scenes');
      tab.textContent=`${key==='unlocked'?'已解锁场景':'收藏场景'} · ${ids.length}`;
      tab.setAttribute('aria-selected',String(libraryTab===key));panel.hidden=libraryTab!==key;
      list.replaceChildren();
      for(const scene of catalog.all.filter(s=>ids.includes(s.id))){
        const row=document.createElement('div');row.className='library-row';
        const choice=document.createElement('button');choice.type='button';choice.className='scene-choice';choice.dataset.chooseScene=scene.id;
        choice.setAttribute('aria-label',`切换到${scene.name}`);choice.setAttribute('aria-pressed',String(!preview&&state.scene===scene.id));
        const number=document.createElement('span');number.className='scene-number';number.textContent=scene.number;
        const name=document.createElement('span');name.textContent=scene.name;choice.append(number,name);
        if(!preview&&state.scene===scene.id){const badge=document.createElement('small');badge.textContent='当前';choice.append(badge);}
        const star=document.createElement('button');star.type='button';star.className='favorite-toggle';star.dataset.favoriteScene=scene.id;
        const favorite=favorites.includes(scene.id);star.textContent=favorite?'★':'☆';star.setAttribute('aria-pressed',String(favorite));star.setAttribute('aria-label',`${favorite?'取消收藏':'收藏'}${scene.name}`);
        row.append(choice,star);list.append(row);
      }
      $(key+'Empty').hidden=ids.length>0;
    }
  }
  for(const key of ['unlocked','favorites'])$(key+'Tab').onclick=()=>{libraryTab=key;renderLibrary();};
  $('sceneLibrary').onclick=e=>{
    const star=e.target.closest('[data-favorite-scene]');
    if(star){const id=star.dataset.favoriteScene;if(!state.unlocked.includes(id))return;state.favorites=state.favorites.includes(id)?state.favorites.filter(x=>x!==id):[...state.favorites,id];persist();renderLibrary();const next=$(libraryTab+'Scenes').querySelector(`[data-favorite-scene="${id}"]`);if(next)next.focus();return;}
    const choice=e.target.closest('[data-choose-scene]');if(!choice||!state.unlocked.includes(choice.dataset.chooseScene))return;
    tick();state.scene=choice.dataset.chooseScene;preview=null;
    const url=new URL(location.href);url.searchParams.delete('preview');history.replaceState(null,'',url);
    applyScene();persist();renderLibrary();$('profileDialog').close();toast(`已切换到${catalog.get(state.scene).name}`);
  };
  $('profile').onclick=()=>{render();renderLibrary();open('profileDialog');};
  let ambient=null,track=null;
  $('sound').onclick=()=>open('soundDialog');
  document.querySelectorAll('[data-track]').forEach(b=>b.onclick=()=>{ambient?.pause();track=b.dataset.track;ambient=new Audio(`audio/${track}.wav`);ambient.loop=true;ambient.volume=state.volume;ambient.play().catch(()=>toast('声音暂时无法播放'));document.querySelectorAll('[data-track]').forEach(x=>{x.classList.toggle('active',x===b);x.querySelector('i').textContent=x===b?'●':'○';});});
  $('stopSound').onclick=()=>{ambient?.pause();track=null;document.querySelectorAll('[data-track]').forEach(x=>{x.classList.remove('active');x.querySelector('i').textContent='○';});};
  $('volume').value=state.volume;$('effects').checked=state.effects;
  $('volume').oninput=e=>{state.volume=Number(e.target.value);if(ambient)ambient.volume=state.volume;persist();};$('effects').onchange=e=>{state.effects=e.target.checked;persist();};
  document.addEventListener('pond-touch',()=>{if(state.effects)play(water);});
  document.addEventListener('garden-page-turn',()=>{if(state.effects)play(pageTurn);});
  const guitarNotes=Object.fromEntries(['C','D','E','F','G','A','B'].map(note=>{const voices=Array.from({length:3},()=>{const a=new Audio(`audio/guitar-${note}.wav`);a.volume=.42;return a;});return [note,{voices,index:0}];}));
  document.addEventListener('garden-guitar-note',e=>{const pool=guitarNotes[e.detail.note];if(!state.effects||!pool)return;play(pool.voices[pool.index]);pool.index=(pool.index+1)%pool.voices.length;});
  window.addEventListener('garden-scene',()=>{for(const pool of Object.values(guitarNotes))for(const a of pool.voices){a.pause();a.currentTime=0;}});
  $('fullscreen').onclick=()=>{(document.fullscreenElement?document.exitFullscreen():document.documentElement.requestFullscreen()).catch(()=>toast('在 Safari 分享菜单中添加到主屏幕，可全屏使用'));};
  $('export').onclick=()=>{tick();persist();const url=URL.createObjectURL(new Blob([JSON.stringify(state,null,2)],{type:'application/json'}));const a=document.createElement('a');a.href=url;a.download=`专注乐园备份-${today()}.json`;a.click();setTimeout(()=>URL.revokeObjectURL(url),1000);toast('备份已导出');};
  $('import').onclick=()=>$('importFile').click();$('importFile').onchange=async e=>{const f=e.target.files[0];if(!f)return;try{if(f.size>100000)throw Error();const s=JSON.parse(await f.text());if(!valid(s))throw Error();pause();state=catalog.collection({...defaults(),...s,unlocked:s.unlocked,favorites:s.favorites});rollover();selectScene();persist();render();$('volume').value=state.volume;$('effects').checked=state.effects;if(ambient)ambient.volume=state.volume;toast('已恢复备份，计时处于暂停状态');}catch{toast('这份备份无法读取，请选择有效的专注乐园备份');}e.target.value='';};
  document.addEventListener('visibilitychange',()=>{tick();persist();});
  window.addEventListener('pagehide',()=>{pause();persist();});
  window.addEventListener('pageshow',()=>{running=false;last=Date.now();render();});
  rollover();selectScene();persist();render();
})();
