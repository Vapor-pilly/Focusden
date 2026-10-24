(() => {
  const canvas=document.getElementById('pond');
  let dispose=null,current=null;
  function mount(scene){
    if(current===scene.id)return;
    if(dispose)dispose();
    const renderer=scene.renderer||'pond';
    canvas.dataset.renderer=renderer;
    canvas.dataset.interacting='false';
    canvas.setAttribute('aria-label',scene.description||'互动鱼池，按住并移动鼠标，引导小鱼游动');
    document.getElementById('hint').innerHTML=`<span>✧</span> ${scene.hint||'按住水面，让小鱼跟随你的光'}`;
    document.getElementById('hint').style.opacity='';
    dispose=window.GardenRenderers[renderer](canvas,scene);
    current=scene.id;
  }
  window.addEventListener('garden-scene',e=>mount(e.detail));
  mount(window.GardenScenes.get(document.documentElement.dataset.scene));
})();
