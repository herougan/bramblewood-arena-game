#!/usr/bin/env node
// 2026-11-07 (package ENG29, owner 07:55: "Flying x Guardian. The guarded thing's flying and evade etc doesn't come into the picture anymore.
// Only your guardian - it cares about attempts. But IF the guardian has evasive skills, it DOES work."):
//   - a Guardian beside a Flying / Evasive / Swift / Invisible ward takes every swing aimed at it (the ward's dodges never roll);
//   - a Guardian with its own dodge (Evasive, Flying) dodges by its own chance: the swing misses, nobody takes it, and the 'evaded'
//     event is on the Guardian with guardianRedirect / guardedUid (the board plays the step-in and the dodge);
//   - the same for a Fork prong;
//   - the same seed gives the same result.
'use strict';
const fs = require('fs'), path = require('path');
const H = require('./lib/harness.js');
const E = H.Engine, ROOT = H.ROOT;
let fail = 0, n = 0; const ok = (c, m)=>{ n++; if(!c){ fail++; console.log('  ✗', m); } };
const so = id=> id === 1 ? 'A' : 'B';
const U = (id, effects, o)=> Object.assign({id, name:id, attack:0, health:500, wait:9, cost:0, effects: effects || {}}, o || {});
const defs = Object.assign({}, H.loadCardDefs(), {
  'z-hit':   U('z-hit', {}, {attack:2, health:100, wait:0}),
  'z-fork':  U('z-fork', {fork:true}, {attack:2, health:100, wait:0}),
  'z-wall':  U('z-wall', {}),
  'z-fly':   U('z-fly', {flying:true}),
  'z-eva':   U('z-eva', {evasive:true}),
  'z-all':   U('z-all', {flying:true, evasive:true, swift:true}),
  'z-guard': U('z-guard', {guardian:true}, {health:100, wait:0}), // Ready (ENG9), 0 Attack: it never swings
  'z-gEva':  U('z-gEva', {guardian:true, evasive:true}, {health:100, wait:0}),
  'z-gFly':  U('z-gFly', {guardian:true, flying:true}, {health:100, wait:0}),
});
const all = pl=> [...pl.row.left, ...pl.row.center, ...pl.row.right];
function mk(seed){ const e = E.makeSimEngine(defs, E.mulberry32(seed), {recordEvents:true, battleMode:'open'}); return {e, P:{1: e.newPlayer(1, {}), 2: e.newPlayer(2, {})}}; }
const spawn = (e, P, pid, id, side)=>{ e.debugSpawnCard(P, so, pid, id, side || 'left', {}, []); return all(P[pid]).find(c=> c.defId === id && !c.__t && (c.__t = true)); };
const round = (e, P)=>{ const ev = []; e.resolveCombat(P, so, {}, ev, 1); return ev; };
const SEEDS = 120;

// ---- the ward's dodges don't roll: the Guardian takes every attempt -----------------------------------------------------------------
for(const ward of ['z-fly', 'z-eva', 'z-all', 'z-inv']){
  let taken = 0, wardHit = 0, wardDodge = 0, swings = 0;
  for(let s = 1; s <= SEEDS; s++){ const {e, P} = mk(s); spawn(e, P, 1, 'z-hit'); const T = spawn(e, P, 2, ward === 'z-inv' ? 'z-wall' : ward), G = spawn(e, P, 2, 'z-guard');
    if(ward === 'z-inv') T.invisible = 3;
    const ev = round(e, P).filter(x=> (x.type === 'hit' || x.type === 'evaded') && x.attDefId === 'z-hit' && !x.ranged);
    swings += ev.length;
    ev.forEach(x=>{ if(x.type === 'hit' && x.targetUid === G.uid && x.guardianRedirect && x.guardedUid === T.uid) taken++;
      if(x.targetUid === T.uid){ if(x.type === 'hit') wardHit++; else wardDodge++; } }); }
  ok(swings === SEEDS && taken === SEEDS && wardHit === 0 && wardDodge === 0, `${ward}: the Guardian takes every swing (${taken}/${swings}; ward hit ${wardHit}, ward dodged ${wardDodge})`);
}

// ---- a Guardian's own dodge works: Evasive, Flying -----------------------------------------------------------------------------------
for(const [gid, reason] of [['z-gEva', 'evasive'], ['z-gFly', 'flying']]){
  let dodged = 0, taken = 0, wardTouched = 0, tagged = 0;
  for(let s = 1; s <= SEEDS; s++){ const {e, P} = mk(s); spawn(e, P, 1, 'z-hit'); const T = spawn(e, P, 2, 'z-fly'), G = spawn(e, P, 2, gid);
    const ev = round(e, P).filter(x=> (x.type === 'hit' || x.type === 'evaded') && x.attDefId === 'z-hit' && !x.ranged);
    ev.forEach(x=>{ if(x.targetUid === T.uid) wardTouched++;
      if(x.type === 'evaded' && x.targetUid === G.uid){ dodged++; if(x.guardianRedirect && x.guardedUid === T.uid && x.reason === reason) tagged++; }
      if(x.type === 'hit' && x.targetUid === G.uid) taken++; });
    if(T.hp !== 500) wardTouched++; }
  ok(dodged + taken === SEEDS && wardTouched === 0, `${gid}: every swing is an attempt on the Guardian (dodged ${dodged} + taken ${taken} of ${SEEDS}; ward touched ${wardTouched})`);
  ok(dodged > SEEDS * 0.3 && dodged < SEEDS * 0.7, `${gid}: it dodges by its own 1-in-2 chance (${dodged}/${SEEDS})`);
  ok(tagged === dodged, `${gid}: its dodge is tagged guardianRedirect + guardedUid + reason '${reason}' (${tagged}/${dodged})`);
}

// ---- a Fork prong: the same rule -----------------------------------------------------------------------------------------------------
{ let prongs = 0, onG = 0, onWard = 0;
  for(let s = 1; s <= 60; s++){ const {e, P} = mk(s); spawn(e, P, 1, 'z-fork');
    const W = spawn(e, P, 2, 'z-wall'), F = spawn(e, P, 2, 'z-all'), G = spawn(e, P, 2, 'z-guard');
    const ev = round(e, P).filter(x=> (x.type === 'hit' || x.type === 'evaded') && x.attDefId === 'z-fork' && x.fork);
    ev.forEach(x=>{ prongs++; if(x.targetUid === F.uid) onWard++; if(x.targetUid === G.uid && x.type === 'hit' && x.guardedUid === F.uid) onG++; }); }
  ok(onWard === 0 && onG > 0, `Fork: a prong at the Flying + Evasive + Swift ward never rolls its dodges (${onWard} on the ward of ${prongs} prongs; the Guardian took ${onG})`); }

// ---- same seed, same result ----------------------------------------------------------------------------------------------------------
{ const run = s=>{ const {e, P} = mk(s); spawn(e, P, 1, 'z-hit'); spawn(e, P, 2, 'z-all'); spawn(e, P, 2, 'z-gEva'); spawn(e, P, 2, 'z-gFly');
    let out = []; for(let r = 0; r < 4; r++) out = out.concat(round(e, P).filter(x=> x.type === 'hit' || x.type === 'evaded').map(x=> [x.type, x.targetUid, x.reason || '', x.dmg || 0].join(':')));
    return out.join('|'); };
  let same = true, differs = false; const base = run(1);
  for(let s = 1; s <= 12; s++){ if(run(s) !== run(s)) same = false; if(run(s) !== base) differs = true; }
  ok(same, 'the same seed gives the same Guardian / dodge sequence');
  ok(differs, 'different seeds give different sequences (the rolls are seeded, not fixed)'); }

// ---- texts: the rule is written down -------------------------------------------------------------------------------------------------
{ const tx = fs.readFileSync(path.join(ROOT, 'bramblewood-texts.js'), 'utf8');
  ok(/"ui\.e22-guardian": "[^"]*only the Guardian's own dodges can make the attack miss/.test(tx), 'the Guardian text says only its own dodges count');
  const ps = fs.readFileSync(path.join(ROOT, 'docs/project-state.md'), 'utf8'); ok(/ENG29/.test(ps), 'docs/project-state.md has the ENG29 rule'); }

console.log(`eng29: ${n - fail}/${n} passed`);
process.exit(fail ? 1 : 0);
