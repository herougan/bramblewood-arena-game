#!/usr/bin/env node
// 2026-11-02 (package FIX5, owner 21:12: "Dynamic values shouldn't reset on victory. for example swarm bonus is removed on victory."):
//   1. Engine: the round that decides the match leaves every survivor's dynamic bonus in place (Swarm counts its allies, Pack chains,
//      Kinship); nothing is cleared at the match's end, so the board has the numbers to show.
//   2. App (source shape): once the replay is over, currentCardByUid reads a unit still on the board live (the replay snapshot has no uid
//      and round-start numbers), the uid from a data-uid matches as text, and updateCardAtkDisplay sums what boardCardHTML sums
//      (Formation / Isolation, High tide's +2, Swarm by the unit's uid).
// The behaviour on the page (a Swarm / Pack / Kinship board, the Attack shown before and after a win and a defeat) is the browser run
// tests/e2e/fix5_2026_11_02.py.
'use strict';
const fs = require('fs'), path = require('path');
const H = require('./lib/harness.js');
const E = H.Engine;
let fail = 0, pass = 0; const ok = (c, m)=>{ if(!c){ fail++; console.log('  ✗', m); } else pass++; };
const so = id=> id===1 ? 'A' : 'B';
const defs = H.loadCardDefs();
const all = pl=> [...pl.row.left, ...pl.row.center, ...pl.row.right];

// ---- 1. engine: a deciding round keeps the survivors' bonuses
[['soldier-ant', 'soldier-ant', 'soldier-ant'], ['dhole-runner', 'dhole-runner', 'soldier-ant'], ['rivergate-tribune', 'rivergate-tribune', 'soldier-ant']].forEach((ids, k)=>{
  ids.forEach(id=> ok(!!defs[id], `card ${id} exists`));
  for(const seed of [1, 2, 3]){
    const e = E.makeSimEngine(defs, E.mulberry32(seed + 10 * k), {recordEvents:true, battleMode:'open'});
    const P = {1: e.newPlayer(1, {}, {health:50}), 2: e.newPlayer(2, {}, {health:1})};
    ids.forEach((id, i)=> e.debugSpawnCard(P, so, 1, id, ['left', 'center', 'right'][i], {}, []));
    all(P[1]).forEach(c=>{ c.wait = 0; });
    const swarmBefore = all(P[1]).map(c=> e.swarmBonusOf(P, c));
    const ev = []; let over = false;
    try{ over = e.resolveCombat(P, so, {}, ev, 1); }catch(x){ ok(false, `[${ids}] resolveCombat threw ${x.message}`); continue; }
    ok(P[2].hq.hp <= 0, `[${ids} seed ${seed}] the enemy castle fell (${P[2].hq.hp})`);
    const units = all(P[1]);
    ok(units.length === ids.length, `[${ids} seed ${seed}] every unit still on the board (${units.length})`);
    const swarmAfter = units.map(c=> e.swarmBonusOf(P, c));
    ok(JSON.stringify(swarmAfter) === JSON.stringify(swarmBefore), `[${ids} seed ${seed}] Swarm bonus kept after the win ${swarmBefore} -> ${swarmAfter}`);
    if(ids[0] === 'soldier-ant') ok(swarmAfter.every(n=> n > 0), `[${ids} seed ${seed}] each ant still counts its allies (${swarmAfter})`);
    if(ids[0] === 'dhole-runner') ok(units.filter(c=> c.defId === 'dhole-runner').every(c=> (c.packBonus || 0) > 0 || (c.packChainBonus || 0) > 0), `[${ids} seed ${seed}] the Pack chain bonus is kept (${units.map(c=> c.packBonus + '/' + c.packChainBonus)})`);
  }
});

// ---- 2. app: source shape of the fix
const app = fs.readFileSync(path.join(__dirname, '..', 'arena_app.js'), 'utf8');
const fn = name=>{ const i = app.indexOf('function ' + name + '('); if(i < 0) return ''; const j = app.indexOf('\nfunction ', i + 10); return app.slice(i, j < 0 ? i + 4000 : j); };
const cc = fn('currentCardByUid');
ok(/FIX5/.test(cc), 'currentCardByUid carries the FIX5 note');
ok(/if\(m\.replayRows\) return m\.replayCards\[uid\]/.test(cc), 'currentCardByUid: the replay snapshot only while the replay plays');
ok(/return live\(true\) \|\| m\.replayCards\[uid\]/.test(cc), 'currentCardByUid: after the replay a unit on the board is read live, the snapshot for one that is gone');
ok(/String\(x\.uid\)===String\(uid\)/.test(cc), 'currentCardByUid: a data-uid string finds its unit');
const ua = fn('updateCardAtkDisplay');
ok(/c\.sk1Atk/.test(ua), 'updateCardAtkDisplay counts Formation / Isolation (sk1Atk) as boardCardHTML does');
ok(/tideNow === 'high' \? 2/.test(ua), "updateCardAtkDisplay counts High tide's +2 as boardCardHTML does");
ok(/liveSwarmBonus\(c\.uid != null \? c : Object\.assign\(\{\}, c, \{uid\}\)\)/.test(ua), 'updateCardAtkDisplay asks Swarm by the unit uid');
const bc = fn('boardCardHTML');
ok(/c\.sk1Atk/.test(bc) && /tideNow==='high' \? 2/.test(bc), 'boardCardHTML still sums sk1Atk and High tide (the two must agree)');

console.log(`fix5: ${pass} passed, ${fail} failed`);
process.exit(fail ? 1 : 0);
