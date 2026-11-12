#!/usr/bin/env node
// 2026-11-12 (package ENG-RC1, owner 23:47 note 16): "a ritual monster cannot be attacked (treated like its not there but it takes a slot)
// instead. Then for chained - it acts like rituals. Can be attacked. Needs chains to be removed to act. Each chain gives 1 armor though."
//   R  a unit in its Ritual: no swing, shot or area skill finds it, a swing at its slot goes on to the bramble, its slot stays taken,
//      it completes as before and is then a normal unit; the CPU neither aims at it nor counts it as a threat.
//   C  Chained: it is hit, it can't act, 1 Armor a chain; 'damage N' is N chains, each point of a blow (before Armor) breaks one.
'use strict';
const H = require('./lib/harness.js');
const E = H.Engine;
let fail = 0, n = 0; const ok = (c, m)=>{ n++; if(!c){ fail++; console.log('  ✗', m); } };
const so = id=> id === 1 ? 'A' : 'B';
const U = (id, effects, o)=> Object.assign({id, name:id, attack:1, health:100, wait:0, cost:0, effects}, o || {});
const defs = Object.assign({}, H.loadCardDefs(), {
  'r-six': U('r-six', {ritual:{perished:1, drawn:0, castleDamage:0}}, {attack:3, health:20}),
  'r-hit': U('r-hit', {}, {attack:4, health:500}), 'r-hit3': U('r-hit3', {}, {attack:3, health:500}),
  'r-arrow': U('r-arrow', {arrow:3}, {attack:0, health:500}), 'r-fb': U('r-fb', {fireball:5}, {attack:0, health:500, wait:0}),
  'r-fork': U('r-fork', {fork:true}, {attack:4, health:500}), 'r-wall': U('r-wall', {}, {attack:0, health:500, wait:9}),
  'r-fodder': U('r-fodder', {}, {attack:0, health:1, wait:9}),
  'c-chain': U('c-chain', {chained:{breakOn:'damage', amount:4}}, {attack:5, health:20}),
  'c-spawn': U('c-spawn', {chained:{breakOn:'enemySpawn'}}, {attack:5, health:20}),
  'c-plain': U('c-plain', {}, {attack:0, health:5, wait:9}),
});
const all = pl=> [...pl.row.left, ...pl.row.center, ...pl.row.right];
function mk(seed){ const e = E.makeSimEngine(defs, E.mulberry32(seed || 5), {recordEvents:true, battleMode:'open', rules:{}});
  return {e, P:{1: e.newPlayer(1, {}, {id:'st-hq', health:200, effects:{}}), 2: e.newPlayer(2, {}, {id:'st-hq', health:200, effects:{}})}}; }
function put(e, P, pid, id, slot){ const pl = P[pid]; e.debugSpawnCard(P, so, pid, id, 'left', {}, []);
  const c = all(pl).reduce((a, x)=> (!a || x.uid > a.uid) ? x : a, null); c.slot = slot;
  const cs = all(pl); pl.row.center = cs.filter(x=> x.slot === 0); pl.row.left = cs.filter(x=> x.slot < 0).sort((a, b)=> b.slot - a.slot); pl.row.right = cs.filter(x=> x.slot > 0).sort((a, b)=> a.slot - b.slot);
  e.syncSlots(pl); return c; }
const round = (e, P, first)=>{ const ev = []; e.resolveCombat(P, so, {}, ev, first || 2); return ev; };
const hitsOn = (ev, uid)=> ev.filter(x=> (x.type === 'hit' || x.type === 'evaded') && x.targetUid === uid);

// ---- R: Ritual ------------------------------------------------------------------------------------------------------------------------
{ const {e, P} = mk(11); const r = put(e, P, 2, 'r-six', 0); put(e, P, 1, 'r-hit', 0);
  ok(e.inRitual(r, P), 'R0 a fresh Ritual unit is in its Ritual');
  const hq0 = P[2].hq.hp, ev = round(e, P);
  ok(r.hp === 20 && !hitsOn(ev, r.uid).length, `R1 a swing at its slot never touches it (${r.hp} Health)`);
  ok(P[2].hq.hp === hq0 - 4 && ev.some(x=> x.type === 'hitHQ' && x.side === 'A'), `R1 ... it goes on to the bramble behind (${hq0} -> ${P[2].hq.hp})`);
  ok(ev.some(x=> x.type === 'skipTurn' && x.reason === 'ritual' && x.uid === r.uid), 'R1 ... and it still can\'t act (skipTurn ritual)');
  ok(!e.legalSlots(P[2]).includes(0), 'R2 it still holds its slot: nothing can be played into it'); }
{ const {e, P} = mk(12); const r = put(e, P, 2, 'r-six', 0); put(e, P, 1, 'r-arrow', 1);
  const ev = round(e, P); ok(r.hp === 20 && !hitsOn(ev, r.uid).length, 'R3 an Arrow never picks it'); }
{ const {e, P} = mk(13); const r = put(e, P, 2, 'r-six', 0); const w = put(e, P, 2, 'r-wall', 1); put(e, P, 1, 'r-fb', -2);
  const ev = round(e, P); ok(r.hp === 20 && !hitsOn(ev, r.uid).length, 'R4 a Fireball\'s burst passes it by');
  ok(w.hp < 500, `R4 ... the unit beside it is burnt (${w.hp})`); }
{ const {e, P} = mk(14); const r = put(e, P, 2, 'r-six', 0); const w = put(e, P, 2, 'r-wall', 1); put(e, P, 1, 'r-fork', 0);
  const hq0 = P[2].hq.hp, ev = round(e, P);
  ok(r.hp === 20 && !hitsOn(ev, r.uid).length, 'R5 Fork reads its slot as empty');
  ok(w.hp < 500 || P[2].hq.hp < hq0, `R5 ... the fork goes to the unit beside or the bramble (wall ${w.hp}, bramble ${hq0} -> ${P[2].hq.hp})`); }
{ const {e, P} = mk(15); const r = put(e, P, 2, 'r-six', 0); put(e, P, 1, 'r-hit3', 0); put(e, P, 1, 'r-fodder', 2);
  ok(e.damageCard(r, 5, 'physical', null).dmg === 0 && e.damageCardFlat(r, 5, 'heat') === 0 && r.hp === 20, 'R6 no damage of any kind reaches it');
  const f = all(P[1]).find(x=> x.defId === 'r-fodder'); f.hp = 0; e.removeDeadCards(P, so, {}, {}, []);
  ok(!e.inRitual(r, P), 'R7 its Ritual completes as before (1 unit perished): no longer hidden');
  const ev = round(e, P); ok(r.hp < 20 && hitsOn(ev, r.uid).length > 0, `R7 ... and now it can be hit (${r.hp})`); }
{ const {e, P} = mk(16); put(e, P, 2, 'r-six', 0); put(e, P, 2, 'r-hit3', 1);
  ok(e.aiIncomingOnBramble(P, 1) === 3, `R8 the CPU counts no threat from a unit in its Ritual (incoming ${e.aiIncomingOnBramble(P, 1)})`); }

// ---- C: Chained -----------------------------------------------------------------------------------------------------------------------
{ const {e, P} = mk(21); const c = put(e, P, 2, 'c-chain', 0); put(e, P, 1, 'r-hit3', 0);
  ok(c.chained && c.chains === 4 && e.chainArmorOf(c) === 4, `C1 Chained 4: 4 chains, 4 Armor (${c.chains}, ${e.chainArmorOf(c)})`);
  let ev = round(e, P);
  ok(hitsOn(ev, c.uid).length === 1, 'C2 it can be attacked');
  ok(c.hp === 20 && c.chained && c.chains === 1, `C2 ... a 3 blow: the chains' Armor stops it all and breaks 3 chains (${c.hp} Health, ${c.chains} left)`);
  ok(ev.some(x=> x.type === 'skipTurn' && x.reason === 'chained' && x.uid === c.uid) && P[1].hq.hp === 200, 'C3 it can\'t act while chained');
  ev = round(e, P);
  ok(!c.chained && c.chains === 0 && e.chainArmorOf(c) === 0, 'C4 the blows reach 4: every chain is gone, and its Armor with them');
  ok(c.hp === 18, `C4 ... that blow lost 1 to the last chain's Armor (${c.hp} Health)`);
  ok(ev.some(x=> x.type === 'chainBreak' && x.uid === c.uid), 'C4 ... chainBreak event');
  ev = round(e, P); ok(ev.some(x=> x.type === 'hitHQ' && x.side === 'B' || (x.type === 'hit' && x.attUid === c.uid)), 'C5 free, it acts'); }
{ const {e, P} = mk(22); const c = put(e, P, 2, 'c-chain', 0); put(e, P, 1, 'r-arrow', 1);
  round(e, P); ok(c.chains === 1 && c.hp === 20, `C6 an Arrow (Armor stops it) breaks chains too (${c.chains} left, ${c.hp} Health)`); }
{ const {e, P} = mk(23); const c = put(e, P, 2, 'c-spawn', 0);
  ok(e.chainArmorOf(c) === 1, 'C7 Chained until the opponent plays: 1 chain, 1 Armor');
  const h = {uid: 99001, defId:'c-plain'}; P[1].hand.push(h); e.placeCard(P, so, 1, h.uid, 'left', {}, []);
  ok(!c.chained && e.chainArmorOf(c) === 0, 'C7 ... the opponent plays: free, no Armor'); }
{ const {e, P} = mk(24); put(e, P, 2, 'c-chain', 0);
  ok(e.aiIncomingOnBramble(P, 1) === 0, 'C8 the CPU counts no swing from a Chained unit'); }

console.log(fail ? `eng-rc1: ${fail} of ${n} FAILED` : `eng-rc1: all ${n} passed`);
process.exit(fail ? 1 : 0);
