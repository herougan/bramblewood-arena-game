#!/usr/bin/env node
// Raid P2 trench tests (bramblewood-trench.js): determinism, roll-through, column attacks, the shared
// wall, entity shields and auras, Exposed stripping, and the tuning targets the Goliath relies on.
'use strict';
const path = require('path');
const H = require('./lib/harness.js');
const G = require(path.join(H.ROOT, 'bramblewood-ghosts.js'));
const R = require(path.join(H.ROOT, 'bramblewood-raid.js'));
const T = require(path.join(H.ROOT, 'bramblewood-trench.js'));
const raid = require(path.join(H.ROOT, 'canonical', 'raids.json'))[0];
const defs = H.loadCardDefs();
const failures = [];
const check = (ok, msg)=>{ if(!ok) failures.push(msg); };
const mk = H.Engine.makeSimEngine;
const rowsFor = i=> [0,1,2].map(k=> ({deck: G.generateGhostDeck(defs, (i+k)%7, 900+i*13+k), name: 'r'+k}));
const part = id=> raid.parts.find(p=> p.id===id);
const run = (pid, i, stage)=> T.runTrench({makeSimEngine: mk, defs, seed: 4000+i, rows: rowsFor(i), cfg: T.trenchConfig(raid, part(pid), stage), bossName: pid});
const EXPOSED = {rules:[{stripAbilities:true}]};

// 1. determinism
check(JSON.stringify(run('left', 3).log) === JSON.stringify(run('left', 3).log), 'same seed should replay the same trench fight');

// 2. mechanics show up across a batch
let rolls = 0, smacks = 0, sweeps = 0, wallHits = 0;
for(let i=0;i<15;i++){
  ['left','tail'].forEach(pid=>{
    const r = run(pid, i);
    r.snapshots.forEach(s=> s.notes.forEach(n=>{ if(n.kind==='roll') rolls++; if(n.kind==='smack') smacks++; if(n.kind==='sweep') sweeps++; if(n.kind==='round' && n.wallDmg>0) wallHits++; }));
    // the wall is one pool: every snapshot's wall ≤ max and never rises
    let last = Infinity; r.snapshots.forEach(s=>{ check(s.wall.hp <= last, `${pid}#${i}: wall HP went up`); last = s.wall.hp; });
    check(r.snapshots.every(s=> s.rows.length===3), `${pid}#${i}: expected 3 rows in every snapshot`);
  });
}
check(rolls > 0, 'no boss hit ever rolled through to the middle/back row');
check(smacks > 0, 'Tentacle Smack never fired');
check(sweeps > 0, 'Tail Sweep never fired');

// 3. Core: the castle is shielded while any stump stands, stumps carry illusory, wait delta applies
for(let i=0;i<12;i++){
  const r = run('core', i);
  r.snapshots.forEach(s=>{
    const stumps = s.boss.filter(c=> c.entity).length;
    if(stumps > 0) check(s.castle.hp === s.castle.max, `core#${i} r${s.round}: castle took damage while ${stumps} stump(s) stood`);
  });
  check(r.snapshots[0].boss.filter(c=> c.entity).length === 3, `core#${i}: should start with 3 stumps`);
  check(r.entityIds.every(id=> r.defs[id].effects.illusory > 0.6), `core#${i}: stumps should be illusory`);
}
{
  // a played card in the Core fight enters with +1 Wait over its printed Wait
  const r = run('core', 1);
  const first = r.snapshots[1].rows.flat().find(c=> !c.entity);
  if(first) check(first.wait >= (defs[first.defId].wait||0), 'wait delta should never lower a card\'s wait');
  const ex = run('core', 1, EXPOSED);
  check(ex.entityIds.every(id=> !ex.defs[id].effects.illusory), 'Exposed should strip illusory from the stumps');
}

// 4. tuning targets (same population tests/raid.js uses): outer parts ~4–5k a fight and rarely
// overwhelmed; Core ~2–3k and ~never overwhelmed; Exposed Core is the "celebration" push.
function batch(pid, stage){
  let tot = 0, ow = 0; const n = 30;
  for(let i=0;i<n;i++){ const r = run(pid, i, stage); ow += r.overwhelmed; tot += R.contributionFor(raid, r.dealt, r.overwhelmed, part(pid)); }
  return {avg: tot/n, ow: ow/n};
}
const out = {};
['left','right','tail','core'].forEach(pid=>{ out[pid] = batch(pid); });
out.exposed = batch('core', EXPOSED);
console.log('  ' + Object.entries(out).map(([k,v])=> `${k}: ${Math.round(v.avg)} avg, ${Math.round(v.ow*100)}% overwhelm`).join(' · '));
['left','right','tail'].forEach(pid=>{ check(out[pid].avg >= 3000 && out[pid].avg <= 6500, `${pid}: average ${Math.round(out[pid].avg)} outside 3000–6500`); check(out[pid].ow <= 0.3, `${pid}: overwhelmed too often (${Math.round(out[pid].ow*100)}%)`); });
check(out.core.avg >= 1000 && out.core.avg <= 4000, `core: average ${Math.round(out.core.avg)} outside 1000–4000`);
check(out.core.ow <= 0.05, `core: overwhelmed ${Math.round(out.core.ow*100)}% — should be near-impossible`);
check(out.exposed.avg > out.core.avg, 'Exposed core should be easier than the normal core');

// 5. interactive stepper: you play your own row turn by turn
{
  const cfg = T.trenchConfig(raid, part('left'), null);
  const t = T.createTrench({makeSimEngine: mk, defs, seed: 99, rows: rowsFor(2), cfg, bossName:'left', myRow: 1}).start();
  let played = 0, sawTelegraphBeforeSmack = false, guard = 0;
  while(!t.over && guard++ < 40){
    const tele = t.telegraphCols();
    const playable = t.myHand().find(h=> t.canPlayMine(h.uid));
    if(playable){
      const slots = t.myLegalSlots();
      check(slots.length > 0, 'a playable card should have a legal slot');
      if(t.playMine(playable.uid, slots[0])){ played++; check(!t.canPlayMine((t.myHand()[0]||{}).uid), 'only one card per turn'); }
    } else if(t.myHand().length) t.discardMine(t.myHand()[0].uid);
    const snaps = t.endTurn();
    if(tele.length && snaps[0].notes.some(n=> n.kind==='smack' && tele.includes(n.slot))) sawTelegraphBeforeSmack = true;
  }
  check(t.over, 'interactive trench should finish within its turn limit');
  check(played > 0, 'never managed to play a card in my row');
  check(sawTelegraphBeforeSmack, 'a Tentacle Smack never hit a column that had been telegraphed the turn before');
  const r = t.result(); check(r.dealt >= 0 && r.rounds <= cfg.rounds, 'interactive result out of range');
}

check(JSON.stringify(H.loadCardDefs())===JSON.stringify(defs), 'card defs mutated');
console.log(`trench: ${failures.length} failure(s)`);
failures.slice(0,20).forEach(f=> console.log('  FAIL '+f));
process.exit(failures.length ? 1 : 0);
