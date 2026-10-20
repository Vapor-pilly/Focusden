const {test}=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const vm=require('node:vm');
const root={};
for(const f of ['warm-pond/scene.js','dream-ocean/scene.js','catalog.js'])vm.runInNewContext(fs.readFileSync(path.join(__dirname,'../scenes',f),'utf8'),{window:root});
const catalog=root.GardenScenes;
const state=overrides=>({scene:'warm-pond',day:'2026-10-20',eligibleDay:null,consumedDay:null,sceneChangedDay:null,...overrides});

test('scenes: warm palette is preserved and both real-time variants are registered',()=>{
  assert.equal(catalog.all.length,2);
  assert.equal(catalog.get('warm-pond').water.join(','),'#b4baa4,#91a595,#6d8d80');
  assert.equal(catalog.get('warm-pond').count,86);
  assert.equal(catalog.get('warm-pond').glowing,false);
  assert.equal(catalog.get('dream-ocean').glowing,true);
  assert.equal(catalog.has('not-a-scene'),false);
});
test('scenes: no eligibility means no change; same-day completion does not change scene',()=>{
  assert.equal(catalog.choose(state(), '2026-10-21').scene,'warm-pond');
  assert.equal(catalog.choose(state({eligibleDay:'2026-10-20'}),'2026-10-20').scene,'warm-pond');
});
test('scenes: next natural day consumes eligibility once and excludes current scene',()=>{
  const next=catalog.choose(state({eligibleDay:'2026-10-20'}),'2026-10-21');
  assert.equal(next.scene,'dream-ocean');assert.equal(next.consumedDay,'2026-10-20');
  assert.equal(next.sceneChangedDay,'2026-10-21');
  assert.equal(catalog.choose(next,'2026-10-21').scene,'dream-ocean');
  assert.equal(catalog.choose(next,'2026-10-22').scene,'dream-ocean');
});
test('scenes: multiple missed days grant one change, new completion permits a later return',()=>{
  const next=catalog.choose(state({eligibleDay:'2026-10-20'}),'2026-10-25');
  assert.equal(next.scene,'dream-ocean');
  assert.equal(catalog.choose(next,'2026-10-26').scene,'dream-ocean');
  const back=catalog.choose({...next,eligibleDay:'2026-10-25'},'2026-10-26');
  assert.equal(back.scene,'warm-pond');assert.equal(back.consumedDay,'2026-10-25');
});
test('scenes: JSON backup retains consumption and invalid dates cannot grant a scene',()=>{
  const next=catalog.choose(state({eligibleDay:'2026-10-20'}),'2026-10-21');
  assert.equal(catalog.choose(JSON.parse(JSON.stringify(next)),'2026-10-22').scene,'dream-ocean');
  assert.equal(catalog.dateValid('2026-02-30'),false);
  assert.equal(catalog.dateValid('2028-02-29'),true);
  assert.equal(catalog.choose(state({eligibleDay:'2026-02-30'}),'2026-10-21').scene,'warm-pond');
});
