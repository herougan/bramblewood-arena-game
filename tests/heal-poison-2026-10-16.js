#!/usr/bin/env node
// 2026-10-16 (user: "When regeneration of heal are used to reduce poison ... Note: it takes heal values to remove poison counters -
// priority. Only the remaining left over heals the unit."): every heal (Regeneration, the Heal action, ...) first removes Poison,
// 1 counter per 1 heal; only what is left restores Health (Bleed still comes off before Health, after Poison).
'use strict';
const H = require('./lib/harness.js'), E = H.Engine;
let fail = 0; const ok = (c, m)=>{ if(!c){ fail++; console.log('  ✗', m); } };
const so = id=> id===1 ? 'A' : 'B';
const defs = Object.assign({}, H.loadCardDefs(), {
  'hp-regen': {id:'hp-regen', name:'HP Regen', attack:0, health:30, wait:0, cost:0, effects:{regen:5}},
  'hp-healer': {id:'hp-healer', name:'HP Healer', attack:0, health:30, wait:0, cost:0, effects:{triggers:[{on:'onRoundStart', do:'heal', amount:4}]}},
});
const all = pl=> [...pl.row.left, ...pl.row.center, ...pl.row.right];
function run(id, setup){
  const e = E.makeSimEngine(defs, E.mulberry32(7), {recordEvents:true, battleMode:'open', rules:{}});
  const P = {1:e.newPlayer(1,{}), 2:e.newPlayer(2,{})}; e.debugSpawnCard(P, so, 1, id, 'left', {}, []);
  const c = all(P[1]).find(x=> x.defId === id); setup(c);
  const ev = []; e.resolveCombat(P, so, {}, ev, 1); return {c, ev};
}
const cureOf = (ev, c)=> ev.filter(x=> x.type === 'statusFx' && x.kind === 'healPoison' && x.targetUid === c.uid);
const healOf = (ev, c)=> ev.filter(x=> x.type === 'heal' && x.targetUid === c.uid).reduce((a, x)=> a + (x.amount||0), 0);
const tickOf = (ev, c)=> ev.filter(x=> x.type === 'poisonTick' && x.uid === c.uid);
// 1) Regeneration 5 on a unit with Poison 3 (after its tick): 3 counters off first, then 2 Health
{ const {c, ev} = run('hp-regen', c=>{ c.hp = 10; c.poison = 4; });
  const t = tickOf(ev, c)[0], p1 = 4 - (t && t.decay ? 1 : 0), hp1 = 10 - (t ? t.dmg : 0); // the upkeep tick lands before Regeneration
  const cu = cureOf(ev, c);
  ok(cu.length === 1 && cu[0].amount === Math.min(5, p1), `Regen removes ${Math.min(5, p1)} Poison first (got ${JSON.stringify(cu.map(x=> x.amount))})`);
  ok(c.poison === Math.max(0, p1 - 5), `no Poison left (poison ${c.poison})`);
  ok(c.hp === Math.min(c.maxHp, hp1 + Math.max(0, 5 - p1)), `only the left-over ${Math.max(0, 5 - p1)} heals (hp ${c.hp}, from ${hp1})`);
  ok(healOf(ev, c) === Math.max(0, 5 - p1), `the heal event reports only the Health restored (${healOf(ev, c)})`);
  ok(cu.length && cu[0].left === c.poison, 'the event says how many counters are left'); }
// 2) More Poison than heal: the whole heal goes to the Poison, no Health at all
{ const {c, ev} = run('hp-regen', c=>{ c.hp = 10; c.poison = 9; });
  const t = tickOf(ev, c)[0], p1 = 9 - (t && t.decay ? 1 : 0), hp1 = 10 - (t ? t.dmg : 0);
  ok(c.poison === p1 - 5, `5 of ${p1} counters come off (poison ${c.poison})`);
  ok(c.hp === hp1, `no Health restored while Poison soaks the heal (hp ${c.hp}, ${hp1} before)`);
  ok(healOf(ev, c) === 0, 'no heal event for 0 Health'); }
// 3) Poison first, then Bleed, then Health
{ const {c} = run('hp-regen', c=>{ c.hp = 10; c.poison = 0; c.bleed = 2; });
  ok(c.bleed === 0 && c.hp === 13, `no Poison: Bleed 2 then 3 Health, as before (bleed ${c.bleed}, hp ${c.hp})`); }
// 4) The Heal action follows the same rule
{ const {c, ev} = run('hp-healer', c=>{ c.hp = 20; c.poison = 3; });
  const t = tickOf(ev, c)[0], p1 = 3 - (t && t.decay ? 1 : 0), hp1 = 20 - (t ? t.dmg : 0);
  ok(c.poison === Math.max(0, p1 - 4), `Heal 4 removes the Poison first (poison ${c.poison})`);
  ok(c.hp === Math.min(c.maxHp, hp1 + Math.max(0, 4 - p1)), `then heals the rest (hp ${c.hp}, ${hp1} before)`); }
console.log(fail ? `heal-poison: ${fail} failure(s)` : 'heal-poison: all passed'); process.exit(fail ? 1 : 0);
