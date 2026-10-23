(function(root){
  'use strict';
  const scenes = root.GardenSceneDefinitions || [];
  const has = id => scenes.some(s=>s.id===id);
  const dateValid = value => {
    if(typeof value!=='string'||!/^\d{4}-\d{2}-\d{2}$/.test(value))return false;
    const parsed=new Date(value+'T12:00:00Z');
    return Number.isFinite(parsed.getTime())&&parsed.toISOString().slice(0,10)===value;
  };
  // Old records can only prove ownership of their saved current scene.
  function collection(state){
    const unlocked=[...new Set([...(Array.isArray(state.unlocked)?state.unlocked:[]),state.scene].filter(has))];
    const favorites=[...new Set((Array.isArray(state.favorites)?state.favorites:[]).filter(id=>unlocked.includes(id)))];
    return {...state,unlocked,favorites};
  }
  function collectionValid(state){
    for(const key of ['unlocked','favorites'])if(state[key]!==undefined&&(!Array.isArray(state[key])||state[key].length>scenes.length||state[key].some(id=>!has(id))))return false;
    const owned=new Set([...(state.unlocked||[]),state.scene]);
    return !state.favorites||state.favorites.every(id=>owned.has(id));
  }
  // Prefer unseen scenes, then revisit unlocked ones when the library is complete.
  function choose(state,date,random=Math.random){
    const next={...collection(state),day:date};
    const unseen=scenes.filter(s=>!next.unlocked.includes(s.id));
    const candidates=unseen.length?unseen:scenes.filter(s=>s.id!==state.scene);
    if(dateValid(state.eligibleDay)&&state.eligibleDay<date&&
       (!state.consumedDay||state.eligibleDay>state.consumedDay)&&
       state.sceneChangedDay!==date&&candidates.length){
      next.scene=candidates[Math.min(candidates.length-1,Math.floor(random()*candidates.length))].id;
      next.consumedDay=state.eligibleDay;
      next.sceneChangedDay=date;
      next.unlocked=[...new Set([...next.unlocked,next.scene])];
    }
    return next;
  }
  root.GardenScenes=Object.freeze({all:scenes,has,dateValid,get:id=>scenes.find(s=>s.id===id),choose,collection,collectionValid});
})(typeof window==='undefined'?globalThis:window);
