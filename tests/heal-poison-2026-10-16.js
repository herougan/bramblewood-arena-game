#!/usr/bin/env node
// Heals, Poison, Bleed and Cure. 2026-10-16 heals took Poison off first; 2026-10-18 (user): "1. Heal-likes doesn't decrease poison,
// only bleed. 2. Bleed and poison both tick down by 1 per turn. Cure doesn't heal bleed."
'use strict';
const H = require('./lib/harness.js'), E = H.Engine;
let fail = 0; const ok = (c, m)=>{ if(!c){ fail++; console.log('  ✗', m); } };
const so = id=> id===1 ? 'A' : 'B';
const defs = Object.assign({}, H.loadCardDefs(), {
  'hp-regen': {id:'hp-regen', name:'HP Regen', attack:0, health:30, wait:0, cost:0, effects:{regen:5}},
  'hp-healer': {id:'hp-healer', name:'HP Healer', attack:0, health:30, wait:0, cost:0, effects:{triggers:[{on:'onRoundStart', do:'heal', amount:4}]}},
  'hp-curer': {id:'hp-curer', name:'HP Curer', attack:0, health:30, wait:0, cost:0, effects:{cure:3}},
  'hp-idle': {id:'hp-idle', name:'HP Idle', attack:0, health:30, wait:5, cost:0, effects:{}},
});
const all = pl=> [...pl.row.left, ...pl.row.center, ...pl.row.right];
function run(id, setup){
  const e = E.makeSimEngine(defs, E.mulberry32(7), {recordEvents:true, battleMode:'open', rules:{}});
  const P = {1:e.newPlayer(1,{}), 2:e.newPlayer(2,{})}; e.debugSpawnCard(P, so, 1, id, 'left', {}, []);
  const c = all(P[1]).find(x=> x.defId === id); setup(c);
  const ev = []; e.resolveCombat(P, so, {}, ev, 1); return {c, ev};
}
const tickOf = (ev, c)=> ev.filter(x=> x.type === 'poisonTick' && x.uid === c.uid);
// 1) Regeneration doesn't touch Poison: the stack only drops by its own tick
{ const {c, ev} = run('hp-regen', c=>{ c.hp = 10; c.poison = 4; });
  const t = tickOf(ev, c)[0];
  ok(!ev.some(x=> x.kind === 'healPoison'), 'no heal-away-Poison event any more');
  ok(c.poison === 3, `Poison 4 → 3 from its own tick only (poison ${c.poison})`);
  ok(t && c.hp === Math.min(c.maxHp, 10 - t.dmg + 5), `the whole Regeneration 5 heals Health (hp ${c.hp})`); }
// 2) A poisoned unit at full Health doesn't regenerate
{ const {c, ev} = run('hp-regen', c=>{ c.poison = 1; });
  ok(c.poison === 0, 'Poison 1 ticks down to 0');
  ok(!ev.some(x=> x.type === 'heal' && x.targetUid === c.uid && x.amount > 0 && x.cause === 'regen'), 'nothing to heal but the tick'); }
// 3) Bleed: wears down 1 a round (before the upkeep heals); 2026-10-19 (package SK1, owner 21:36: "heal only heals now"): the heal no longer stanches it
{ const {c, ev} = run('hp-regen', c=>{ c.hp = 10; c.bleed = 3; });
  ok(ev.some(x=> x.type === 'bleedFade' && x.uid === c.uid && x.left === 2), 'Bleed 3 → 2 at upkeep (bleedFade)');
  ok(c.bleed === 2 && c.hp === 15, `Regeneration 5: all 5 to Health, the Bleed stays (SK1: Cleanse takes it) (bleed ${c.bleed}, hp ${c.hp})`); }
// 4) A unit that doesn't act still loses 1 Bleed a round, and takes no Bleed damage
{ const {c, ev} = run('hp-idle', c=>{ c.bleed = 4; });
  ok(c.bleed === 3 && c.hp === 30 && !ev.some(x=> x.type === 'bleedTick'), `an idle unit: Bleed 4 → 3, no damage (bleed ${c.bleed}, hp ${c.hp})`); }
// 5) The Heal action: Bleed first, Poison untouched
{ const {c} = run('hp-healer', c=>{ c.hp = 20; c.poison = 3; c.bleed = 0; });
  ok(c.poison === 2, `Heal 4 leaves Poison to its tick (poison ${c.poison})`); }
// 6) Cure takes Poison only, never Bleed
{ const {c, ev} = run('hp-curer', c=>{ c.poison = 6; c.bleed = 5; });
  const cu = ev.find(x=> x.kind === 'cure');
  ok(cu && cu.poison === 3 && cu.bleed === 0, `Cure 3 removes 3 Poison and no Bleed (${JSON.stringify(cu && {p:cu.poison, b:cu.bleed})})`);
  ok(c.poison === 2 && c.bleed === 4, `Poison 6 -1 tick -3 cure = 2, Bleed 5 -1 a round = 4 (poison ${c.poison}, bleed ${c.bleed})`); }
{ const {ev} = run('hp-curer', c=>{ c.bleed = 5; });
  ok(!ev.some(x=> x.kind === 'cure'), 'Cure ignores a unit that only Bleeds'); }
console.log(fail ? `heal-poison: ${fail} failure(s)` : 'heal-poison: all passed'); process.exit(fail ? 1 : 0);
