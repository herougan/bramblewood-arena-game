#!/usr/bin/env node
// 2026-10-21 (package BX, battle fixes and new cards; the owner's Oct 21 items):
//   1. Swarm (32): "Doesn't seem to be doing the bonus damage to the bramble. It should do so." -> castleSwingAmt adds Swarm (and
//      Defiance, its mirror), as damageCard does for a hit on a unit.
//   2. Wave at the frontier (34): "the enemy pushed my units to the left. It failed as there were no more units in that direction ...
//      the unit should be pushed by Wave 1." -> washPush: the frontier column just past the outermost unit is open to a push.
//   4. Archer N (3): "Cannot attack, instead Arrow N every action" -> On Action × Arrow N, no swing; Stonedrop Vulture has it, with the
//      'drop' look (effects.archerStyle).
//   + the static shape of 3 (the frame layers' host), 5 (fire attacks), 6 (the new hummingbird), 7 (Dive's Sprinter tag).
'use strict';
const fs = require('fs'), path = require('path');
const ROOT = path.join(__dirname, '..');
const H = require('./lib/harness.js'), E = H.Engine;
let fail = 0, n = 0; const ok = (c, m)=>{ n++; if(!c){ fail++; console.log('  ✗', m); } };
const so = id=> id === 1 ? 'A' : 'B';
const U = (id, effects, o)=> Object.assign({id, name:id, attack:2, health:500, wait:0, cost:0, archetypes:['Ant'], effects: effects || {}}, o || {});
const defs = Object.assign({}, H.loadCardDefs(), {
  'bx-swarm': U('bx-swarm', {swarm:true}), 'bx-plain': U('bx-plain', {}), 'bx-ant': U('bx-ant', {}, {attack:0}),
  'bx-wall': U('bx-wall', {}, {attack:0, archetypes:['Bird']}),
  'bx-waveL': U('bx-waveL', {wave:'left'}, {archetypes:['Fish']}), 'bx-waveR': U('bx-waveR', {wave:'right'}, {archetypes:['Fish']}), 'bx-waveT': U('bx-waveT', {wave:true}, {archetypes:['Fish']}),
  'bx-arch': U('bx-arch', {archer:3}, {attack:5, archetypes:['Bird']}), 'bx-arch0': U('bx-arch0', {archer:2}, {attack:0, archetypes:['Bird']}),
  'bx-archD': U('bx-archD', {archer:3, archerStyle:'drop'}, {attack:5, archetypes:['Bird']}),
  'bx-archOA': U('bx-archOA', {archer:1, triggers:[{on:'onAttack', do:'gainLumber', amount:5}]}, {attack:5, archetypes:['Bird']}),
  'bx-act': U('bx-act', {triggers:[{on:'onAction', do:'arrow', amount:4}]}, {attack:1, archetypes:['Bird']}),
});
const all = pl=> [...pl.row.left, ...pl.row.center, ...pl.row.right];
function mk(seed){ const e = E.makeSimEngine(defs, E.mulberry32(seed || 7), {recordEvents:true, battleMode:'open'}); return {e, P:{1:e.newPlayer(1, {}), 2:e.newPlayer(2, {})}}; }
function put(e, P, pid, id, slot){ const pl = P[pid]; e.debugSpawnCard(P, so, pid, id, 'left', {}, []);
  const c = all(pl).reduce((a, x)=> (!a || x.uid > a.uid) ? x : a, null); c.slot = slot; c.wait = 0;
  const cs = all(pl); pl.row.center = cs.filter(x=> x.slot === 0); pl.row.left = cs.filter(x=> x.slot < 0).sort((a, b)=> b.slot - a.slot); pl.row.right = cs.filter(x=> x.slot > 0).sort((a, b)=> a.slot - b.slot);
  e.syncSlots(pl); return c; }

// ---- 1. Swarm at the bramble
const castleHit = (id, allies)=>{ const {e, P} = mk(); const s = put(e, P, 1, id, 0); for(let k = 0; k < allies; k++) put(e, P, 1, 'bx-ant', k % 2 ? -(1 + (k >> 1)) : 1 + (k >> 1));
  P[2].hq.shield = 0; const hp0 = P[2].hq.hp, ev = []; e.debugAttack(P, so, s.uid, {}, ev); const h = ev.find(x=> x.type === 'hitHQ' && x.attUid === s.uid); return {h, lost: hp0 - P[2].hq.hp}; };
{ const sw = castleHit('bx-swarm', 2), pl = castleHit('bx-plain', 2);
  ok(sw.h && pl.h, 'both swing at the bramble (an empty enemy row)');
  ok(sw.h && pl.h && sw.h.dmg === pl.h.dmg + 2, `Swarm with two Ant allies hits the bramble for 2 more than a plain unit (${sw.h && sw.h.dmg} vs ${pl.h && pl.h.dmg})`);
  ok(sw.lost === pl.lost + 2, `...and the bramble loses 2 more Health (${sw.lost} vs ${pl.lost})`);
  const sw0 = castleHit('bx-swarm', 0); ok(sw0.h && sw0.h.dmg === pl.h.dmg, `no allies: no Swarm bonus (${sw0.h && sw0.h.dmg})`);
  const sw3 = castleHit('bx-swarm', 3); ok(sw3.h && sw3.h.dmg === pl.h.dmg + 3, `three allies: +3 (${sw3.h && sw3.h.dmg})`); }
{ const {e, P} = mk(); const s = put(e, P, 1, 'bx-swarm', 0); put(e, P, 1, 'bx-ant', 1); put(e, P, 1, 'bx-ant', -1); const T = put(e, P, 2, 'bx-wall', 0);
  const ev = []; e.debugAttack(P, so, s.uid, {}, ev); const h = ev.find(x=> x.type === 'hit' && x.attUid === s.uid);
  ok(h && h.dmg === 4 && T.hp === 496, `on a unit it still hits 2 + 2 (${h && h.dmg})`); }
{ const src = fs.readFileSync(path.join(ROOT, 'bramblewood-engine.js'), 'utf8');
  ok(/function castleSwingAmt\(att, base\)\{ let n = Math\.max\(0, base \+ swarmBonus\(att\) \+ defianceBonus\(att\)/.test(src), 'castleSwingAmt counts Swarm and Defiance'); }

// ---- 2. Wave into the frontier
{ const {e, P} = mk(); const T = put(e, P, 2, 'bx-wall', -2); put(e, P, 2, 'bx-wall', -1); put(e, P, 2, 'bx-wall', 0); const W = put(e, P, 1, 'bx-waveL', 0);
  const ev = [], w = e.waveHit(P, so, 1, W, T, ev, {});
  ok(w && !w.blocked && T.slot === -3 && w.cols === 1 && w.dir === 'left', `Wave left on the outermost unit: it rides into the frontier column (-2 -> ${T.slot})`);
  ok(e.allBoardCards(P[2]).every(c=> P[2].row[c.slot === 0 ? 'center' : c.slot < 0 ? 'left' : 'right'].includes(c)), '...and the rows follow'); }
{ const {e, P} = mk(); const T = put(e, P, 2, 'bx-wall', 1); put(e, P, 2, 'bx-wall', 0); const W = put(e, P, 1, 'bx-waveR', 0);
  const w = e.waveHit(P, so, 1, W, T, [], {}); ok(w && !w.blocked && T.slot === 2, `Wave right from the edge (slot 1, the board's span 0..1): into slot 2 (${T.slot})`); }
{ const {e, P} = mk(); const T = put(e, P, 2, 'bx-wall', 0); const W = put(e, P, 1, 'bx-waveL', 0);
  const w = e.waveHit(P, so, 1, W, T, [], {}); ok(w && !w.blocked && T.slot === -1, `a lone unit in the centre: pushed one column (at least 1) (${T.slot})`); }
{ const {e, P} = mk(); const T = put(e, P, 2, 'bx-wall', -2); put(e, P, 2, 'bx-wall', 2); const W = put(e, P, 1, 'bx-waveL', 0); W.slot = 0;
  defs['bx-waveL'].effects.waveN = 3; const w = e.waveHit(P, so, 1, W, T, [], {}); delete defs['bx-waveL'].effects.waveN;
  ok(w && T.slot === -3 && w.cols === 1, `Wave 3 at the edge: one column, into the frontier, no further (${T.slot})`); }
{ const {e, P} = mk(); const T = put(e, P, 2, 'bx-wall', -2); const N = put(e, P, 2, 'bx-wall', -3); put(e, P, 2, 'bx-wall', 0); const W = put(e, P, 1, 'bx-waveL', 0);
  const ev = [], w = e.waveHit(P, so, 1, W, T, ev, {});
  ok(w && w.crashUid === N.uid && T.slot === -2 && ev.some(x=> x.type === 'washCrash'), 'a unit in the way still takes the crash (no frontier past it)'); }
{ let bad = 0, out = 0; for(let s = 1; s <= 40; s++){ const {e, P} = mk(s); const T = put(e, P, 2, 'bx-wall', 2), N = put(e, P, 2, 'bx-wall', 1); const W = put(e, P, 1, 'bx-waveT', 0);
    const w = e.waveHit(P, so, 1, W, T, [], {}); if(!w || w.blocked || w.bounced) bad++; else if(T.slot === 3) out++; else if(!(T.slot === 2 && w.crashUid === N.uid)) bad++; }
  ok(!bad && out > 5, `Wave (no fixed way) on the outermost unit: out into the frontier, or into its neighbour; never blocked or turned back (${out} out of 40 rode out, ${bad} wrong)`); }

// ---- 4. Archer N
{ const {e, P} = mk(); const A = put(e, P, 1, 'bx-arch', 0); const T = put(e, P, 2, 'bx-wall', 0);
  const ev = []; e.resolveCombat(P, so, {}, ev, 1);
  const ar = ev.filter(x=> x.type === 'arrow' && x.uid === A.uid), hits = ev.filter(x=> (x.type === 'hit' || x.type === 'hitHQ') && x.attUid === A.uid && !x.ranged);
  ok(ar.length === 1 && ar[0].archer && ar[0].amount === 3 && ar[0].targetUid === T.uid, `Archer 3: one arrow of 3 at the unit facing it (${ar.length} arrows)`);
  ok(T.hp === 497, `...the unit takes 3, not the archer's Attack 5 (${500 - T.hp})`);
  ok(!hits.length && ev.filter(x=> x.type === 'hit' && x.attUid === A.uid).length === 1, 'no swing: its only hit is the arrow (ranged)'); }
{ const {e, P} = mk(); const A = put(e, P, 1, 'bx-arch', 0); const T = put(e, P, 2, 'bx-wall', 2);
  const ev = []; e.resolveCombat(P, so, {}, ev, 1); ok(T.hp === 497, `nobody facing it: the nearest enemy (${500 - T.hp})`); }
{ const {e, P} = mk(); const A = put(e, P, 1, 'bx-arch', 0); P[2].hq.shield = 0; const hp0 = P[2].hq.hp;
  const ev = []; e.resolveCombat(P, so, {}, ev, 1); const ar = ev.find(x=> x.type === 'arrow' && x.uid === A.uid);
  ok(ar && ar.targetUid == null && hp0 - P[2].hq.hp === 3, `an empty enemy board: the arrow hits the bramble for 3 (${hp0 - P[2].hq.hp})`); }
{ const {e, P} = mk(); const A = put(e, P, 1, 'bx-arch0', 0); const T = put(e, P, 2, 'bx-wall', 0);
  const ev = []; e.resolveCombat(P, so, {}, ev, 1); ok(T.hp === 498 && !ev.some(x=> x.type === 'skipTurn' && x.uid === A.uid && x.reason === 'zeroAttack'), `an Archer at 0 Attack still shoots (${500 - T.hp})`); }
{ const {e, P} = mk(); const A = put(e, P, 1, 'bx-arch', 0); const T = put(e, P, 2, 'bx-wall', 0); A.stunned = 1;
  const ev = []; e.resolveCombat(P, so, {}, ev, 1); ok(T.hp === 500 && !ev.some(x=> x.type === 'arrow' && x.uid === A.uid), 'Stunned: no arrow'); }
{ const {e, P} = mk(); const A = put(e, P, 1, 'bx-arch', 0); const T = put(e, P, 2, 'bx-wall', 0); T.hp = 2;
  const stats = {}; e.resolveCombat(P, so, stats, [], 1); ok(!e.allBoardCards(P[2]).includes(T) && ((stats['A|bx-arch'] || {}).kills || 0) === 1, `its arrow's kill is the archer's (kills ${(stats['A|bx-arch'] || {}).kills || 0})`); }
{ const {e, P} = mk(); const A = put(e, P, 1, 'bx-archOA', 0); put(e, P, 2, 'bx-wall', 0); const l0 = P[1].lumber || 0;
  e.resolveCombat(P, so, {}, [], 1); ok((P[1].lumber || 0) === l0, `it doesn't attack, so its On Attack never fires (+${(P[1].lumber || 0) - l0} Lumber)`); }
{ const {e, P} = mk(); const A = put(e, P, 1, 'bx-archD', 0); put(e, P, 2, 'bx-wall', 0);
  const ev = []; e.resolveCombat(P, so, {}, ev, 1); const ar = ev.find(x=> x.type === 'arrow' && x.uid === A.uid); ok(ar && ar.style === 'drop', "effects.archerStyle 'drop' rides on the arrow event (the look)"); }
{ const {e, P} = mk(); const A = put(e, P, 1, 'bx-act', 0); const T = put(e, P, 2, 'bx-wall', 0);
  e.resolveCombat(P, so, {}, [], 1); ok(T.hp === 500 - 4 - 1, `the pieces on their own: On Action × Arrow 4 on a unit that also swings for 1 (${500 - T.hp})`); }
{ const ix = e=> e.trigsOf(defs['bx-arch']); const {e} = mk(); const t = ix(e).find(x=> x.keyword === 'archer');
  ok(t && t.on === 'onAction' && t.do === 'arrow' && t.amount === 3, 'Archer N is the trigger On Action × the action Arrow N'); }
{ const cards = JSON.parse(fs.readFileSync(path.join(ROOT, 'canonical', 'cards.json'), 'utf8')), v = cards.find(c=> c.id === 'stonedrop-vulture');
  ok(v && v.effects.archer > 0 && v.effects.archerStyle === 'drop' && !v.effects.skyfall && v.effects.flying, `Stonedrop Vulture: Archer ${v && v.effects.archer}, the drop look, Skyfall gone, still Flying`);
  ok(v && typeof v.creatorNote === 'string' && /Archer/.test(v.creatorNote), 'with a creatorNote'); }

console.log(fail ? `bx-2026-10-21: ${fail} of ${n} failed` : `bx-2026-10-21: all ${n} passed`);
process.exit(fail ? 1 : 0);
