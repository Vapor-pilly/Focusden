(() => {
  'use strict';
  const status=document.getElementById('offlineStatus'),retry=document.getElementById('retryOffline');
  let registration=null;
  const say=text=>{status.textContent=text;};
  document.getElementById('fullscreen').onclick=()=>{
    if(document.documentElement.requestFullscreen){
      (document.fullscreenElement?document.exitFullscreen():document.documentElement.requestFullscreen()).catch(()=>say('在 Safari 分享菜单中添加到主屏幕，可全屏打开。'));
    }else{document.getElementById('profile').click();document.getElementById('installHelp').open=true;document.getElementById('installHelp').scrollIntoView({block:'nearest'});}
  };
  // Save work when the OS backgrounds the page; a surviving foreground return
  // catches up using the mobile app's wall clock. iOS can still terminate it.
  if(!('serviceWorker' in navigator)||!isSecureContext){
    say('桌面离线安装需要 HTTPS 地址。文件预览或普通局域网地址无法准备离线资源。');retry.hidden=true;return;
  }
  function inspect(){const worker=registration?.active;if(worker)worker.postMessage({type:'CHECK_OFFLINE'});}
  navigator.serviceWorker.addEventListener('message',event=>{
    const m=event.data||{};
    if(m.type==='CACHE_PROGRESS')say(`正在准备离线资源 · ${m.percent}%`);
    if(m.type==='OFFLINE_READY'){
      say('离线资源已就绪，可添加到 iPhone 主屏幕。');document.documentElement.dataset.offlineReady='true';
    }
    if(m.type==='OFFLINE_MISSING'){say('离线资源尚未完整准备，请保持联网并点击重新准备。');document.documentElement.dataset.offlineReady='false';}
  });
  async function start(){
    say('正在准备离线资源，首次请保持网络连接……');retry.disabled=true;
    try{
      registration=await navigator.serviceWorker.getRegistration('./');
      if(registration?.active){
        inspect();if(navigator.onLine)registration.update().catch(()=>{});
      }else{
        registration=await navigator.serviceWorker.register('sw.js',{scope:'./',updateViaCache:'none'});
        await new Promise((resolve,reject)=>{
          const worker=registration.installing||registration.waiting||registration.active;
          const timer=setTimeout(()=>reject(Error('Offline preparation timed out')),120000);
          function changed(){if(worker?.state==='activated'){clearTimeout(timer);resolve();}else if(worker?.state==='redundant'){clearTimeout(timer);reject(Error('Offline preparation failed'));}}
          if(worker){worker.addEventListener('statechange',changed);changed();}
          else navigator.serviceWorker.ready.then(()=>{clearTimeout(timer);resolve();},reject);
        });
        inspect();
      }
      navigator.serviceWorker.addEventListener('controllerchange',inspect,{once:true});
      if(navigator.storage?.persist)navigator.storage.persist().catch(()=>{});
    }catch{say('离线准备未完成，请确认 HTTPS 地址、网络和剩余储存空间后重试。');}
    finally{retry.disabled=false;}
  }
  retry.onclick=async()=>{if(registration?.active){say('正在补全离线资源……');registration.active.postMessage({type:'REPAIR_OFFLINE'});}else start();};
  start();
})();
