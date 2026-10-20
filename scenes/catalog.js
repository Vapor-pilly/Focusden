(function(root){
  'use strict';
  const scenes = root.GardenSceneDefinitions || [];
  const has = id => scenes.some(s=>s.id===id);
  const dateValid = value => {
    if(typeof value!=='string'||!/^\d{4}-\d{2}-\d{2}$/.test(value))return false;
    const parsed=new Date(value+'T12:00:00Z');
    return Number.isFinite(parsed.getTime())&&parsed.toISOString().slice(0,10)===value;
  };
  // Pure selection: consumed eligibility survives reload and backup restoration.
  function choose(state,date,random=Math.random){
    const next={...state,day:date};
    const candidates=scenes.filter(s=>s.id!==state.scene);
    if(dateValid(state.eligibleDay)&&state.eligibleDay<date&&
       (!state.consumedDay||state.eligibleDay>state.consumedDay)&&
       state.sceneChangedDay!==date&&candidates.length){
      next.scene=candidates[Math.min(candidates.length-1,Math.floor(random()*candidates.length))].id;
      next.consumedDay=state.eligibleDay;
      next.sceneChangedDay=date;
    }
    return next;
  }
  root.GardenScenes=Object.freeze({all:scenes,has,dateValid,get:id=>scenes.find(s=>s.id===id),choose});
})(typeof window==='undefined'?globalThis:window);
