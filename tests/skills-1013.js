#!/usr/bin/env node
// Overnight skills (2026-10-13): Coffee, Landslide, Lone Wolf, Sociable, Dry, Arrow picks the nearest enemy.
'use strict';
const H = require('./lib/harness.js');
const E = H.Engine;
let fail = 0; const ok = (c, m)=>{ if(!c){ fail++; console.log('  ✗', m); } };
const so = id=> id===1 ? 'A' : 'B';
const U = (id, effects, o)=> Object.assign({id, name:id, attack:1, health:20, wait:0, cost:0, effects:effects||{}}, o||{});
const defs = Object.assign({}, H.loadCardDefs(), {
  'k-coffee': U('k-coffee', {coffee:2}, {wait:3}),
  'k-slide': U('k-slide', {landslide:3}, {health:1}),
  'k-lone': U('k-lone', {loneWolf:[1,1]}),
  'k-soc': U('k-soc', {sociable:[1,0]}),
  'k-wall': U('k-wall', {}),
  'k-dry': U('k-dry', {dry:true}),
  'k-kin': U('k-kin', {kinship:{type:'Otter', atk:2, hp:1}}),
  'k-otter': U('k-otter', {}, {archetypes:['Otter']}),
  'k-rocket': U('k-rocket', {rocket:5}),
  'k-big': U('k-big', {}, {attack:9}),
});
const all = pl=> [...pl.row.left, ...pl.row.center, ...pl.row.right];
const mk = (opts)=>{ const e = E.makeSimEngine(defs, E.mulberry32(5), Object.assign({recordEvents:true, battleMode:'open'}, opts||{})); return {e, P:{1: e.newPlayer(1, {}), 2: e.newPlayer(2, {})}}; };
// 2026-10-27 (package ENG11, owner K2): Coffee is the new skill (acts twice every Nth turn, then Stunned; tests/eng11-2026-10-27.js);
// it no longer takes Wait off on play or sets the old crash timer.
{ const {e, P} = mk(); e.debugSpawnCard(P, so, 1, 'k-coffee', 'left', {}, []); const c = all(P[1])[0];
  ok(c.wait === 3, `Coffee 2: no Wait change on play any more (got ${c.wait})`); ok(!c.coffeeCrash, 'no old crash timer'); }
{ const {e, P} = mk(); e.debugSpawnCard(P, so, 1, 'k-slide', 'left', {}, []); ['left','left','right','right'].forEach(l=> e.debugSpawnCard(P, so, 2, 'k-wall', l, {}, []));
  const sl = all(P[1])[0]; e.debugDamage(P, so, sl.uid, 5, {}, []);
  const hit = all(P[2]).filter(c=> c.hp === 17).length; ok(hit >= 2 && hit <= 3, `Landslide hits the facing enemy and its neighbours (${all(P[2]).map(c=>c.slot+':'+c.hp)})`); }
{ const {e, P} = mk(); e.debugSpawnCard(P, so, 1, 'k-lone', 'left', {}, []); e.roundStart(P, 2, so, {}, []); e.resolveCombat(P, so, {}, []);
  const l = all(P[1])[0]; ok(l.maxHp === 25, `Lone Wolf alone: +5/+5 (hp ${l.maxHp})`); }
{ const {e, P} = mk(); e.debugSpawnCard(P, so, 1, 'k-soc', 'left', {}, []); ['left','right','left','right'].forEach(l=> e.debugSpawnCard(P, so, 1, 'k-wall', l, {}, []));
  e.resolveCombat(P, so, {}, []); const c = all(P[1]).find(x=> x.defId==='k-soc'); ok(c.packBonus >= 2, `Sociable with neighbours gets Attack (${c.packBonus}, slot ${c.slot})`); }
{ const {e, P} = mk({rules:{field:'heatwave'}}); e.debugSpawnCard(P, so, 1, 'k-dry', 'left', {}, []); e.debugSpawnCard(P, so, 2, 'k-wall', 'left', {}, []);
  e.resolveCombat(P, so, {}, []); const d = all(P[1])[0], w = all(P[2])[0]; ok(d.hp >= w.hp, `Dry unharmed by Heatwave (dry ${d.hp}, wall ${w.hp})`); }
{ const {e, P} = mk(); e.debugSpawnCard(P, so, 1, 'k-kin', 'left', {}, []); e.debugSpawnCard(P, so, 1, 'k-otter', 'right', {}, []); e.resolveCombat(P, so, {}, []);
  const o = all(P[1]).find(c=> c.defId==='k-otter'), k = all(P[1]).find(c=> c.defId==='k-kin'); ok(o.kinBonus === 2 && o.maxHp === 21 && !k.kinBonus, `Kinship Otter 2/1 (otter +${o.kinBonus}, hp ${o.maxHp}; source +${k.kinBonus||0})`); }
{ const {e, P} = mk(); ['left','right'].forEach(l=> e.debugSpawnCard(P, so, 2, 'k-wall', l, {}, [])); e.debugSpawnCard(P, so, 2, 'k-big', 'left', {}, []); e.debugSpawnCard(P, so, 1, 'k-rocket', 'left', {}, []);
  const big = all(P[2]).find(c=> c.defId==='k-big'); ok(big.hp <= 15, `Rocket hits the strongest enemy (hp ${big.hp})`); }
{ const D2 = Object.assign({}, defs, {'k-club': U('k-club', {bludgeon:true}, {attack:2}), 'k-armfly': U('k-armfly', {armor:3, flying:true}, {attack:0, health:40})});
  const e = E.makeSimEngine(D2, E.mulberry32(9), {recordEvents:true, battleMode:'open'}); const P = {1: e.newPlayer(1, {}), 2: e.newPlayer(2, {})};
  e.debugSpawnCard(P, so, 1, 'k-club', 'left', {}, []); e.debugSpawnCard(P, so, 2, 'k-armfly', 'left', {}, []);
  const club = all(P[1])[0]; let broke = [];
  for(let i=0;i<8;i++){ const ev = []; e.debugAttack(P, so, club.uid, {}, ev); ev.filter(x=> x.kind==='bludgeon').forEach(x=> broke.push(x.broke)); }
  ok(broke.includes('armor') && broke.includes('flying') && broke.length === 2, `Bludgeon breaks Armor and Flying, once each (${broke})`); }
{ const D3 = Object.assign({}, defs, {'k-snipe': U('k-snipe', {snipe:4})});
  const e = E.makeSimEngine(D3, E.mulberry32(3), {recordEvents:true, battleMode:'open'}); const P = {1: e.newPlayer(1, {}), 2: e.newPlayer(2, {})};
  e.debugSpawnCard(P, so, 1, 'k-wall', 'left', {}, []); e.debugSpawnCard(P, so, 1, 'k-snipe', 'left', {}, []); e.debugSpawnCard(P, so, 2, 'k-wall', 'left', {}, []);
  const ev = []; e.resolveCombat(P, so, {}, ev); ok(ev.some(x=> x.type==='arrow' && x.snipe), 'Snipe fires when nothing faces it'); }
{ const D4 = Object.assign({}, defs, {'k-fly': U('k-fly', {flying:true}, {attack:1})});
  const e = E.makeSimEngine(D4, E.mulberry32(3), {recordEvents:true, battleMode:'open', rules:{wind:'gale'}}); const P = {1: e.newPlayer(1, {}), 2: e.newPlayer(2, {})};
  e.debugSpawnCard(P, so, 1, 'k-fly', 'left', {}, []); e.debugSpawnCard(P, so, 2, 'k-fly', 'left', {}, []);
  // 2026-10-16 (user: "the wind change is random. Forward, Backward, No Wind"): a Gale is strong every round, its way a coin flip
  const ev = [], seen = new Set(); let calm = 0; for(let r = 2; r < 40; r++){ e.roundStart(P, r, so, {}, ev); if(!e.isWindy()) calm++; seen.add(e.windSideOf(1)); }
  ok(calm === 0 && seen.has('tail') && seen.has('head'), `Gale: strong wind every round, blowing either way (${[...seen]}, calm ${calm})`); }
{ const e = E.makeSimEngine(defs, E.mulberry32(5), {recordEvents:true, battleMode:'open', rules:{wind:'windy'}}); const P = {1: e.newPlayer(1, {}), 2: e.newPlayer(2, {})};
  const n = {tail:0, head:0, calm:0}; for(let r = 1; r < 301; r++){ e.roundStart(P, r, so, {}, []); n[e.isWindy() ? e.windSideOf(1) : 'calm']++; }
  ok(['tail', 'head', 'calm'].every(k=> n[k] > 70 && n[k] < 130), `Windy: at your back, in your face or calm, about 1 in 3 each (${JSON.stringify(n)})`); }
console.log(`skills-1013: ${fail} failure(s)`); process.exit(fail ? 1 : 0);
