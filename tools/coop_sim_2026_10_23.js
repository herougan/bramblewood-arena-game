#!/usr/bin/env node
// The group dungeon's floors measured (2026-10-23, package AR3): CPU parties (every seat on cpuPlan) of 1-4 players climb the Hollow
// Warren on random mid-game decks (Common / Uncommon / Rare, cost 2 or less, at most 3 copies). Prints each floor's clear rate and its
// average length. Used to set DUNGEONS.hollow's castles.
//   node tools/coop_sim_2026_10_23.js [runs per party size, default 30]
'use strict';
const path = require('path');
const ROOT = path.resolve(__dirname, '..');
const H = require(path.join(ROOT, 'tests', 'lib', 'harness.js')), C = require(path.join(ROOT, 'bramblewood-coop.js'));
const defs = H.loadCardDefs(), ids = H.fieldableIds(defs);
const pool = ids.filter(id=> ['common', 'uncommon', 'rare'].includes(defs[id].rarity) && (defs[id].cost || 0) <= 2 && defs[id].attack != null && !defs[id].cardType);
function deckFrom(seed){ const r = H.seededRng(seed); const d = {}; let n = 0; while(n < 20){ const id = pool[Math.floor(r() * pool.length)]; if((d[id] || 0) >= 3) continue; d[id] = (d[id] || 0) + 1; n++; } return d; }
const N = +process.argv[2] || 30;
for(const [humans, size] of [[1, 2], [2, 2], [3, 4], [4, 4]]){
  const won = [0, 0, 0, 0], tried = [0, 0, 0, 0], rounds = [[], [], [], []], reasons = {};
  for(let s = 0; s < N; s++){
    const seats = C.seatsFor(size).map((seat, i)=> ({seat, name: seat, deck: deckFrom(100 * s + i), castleHp: 20, cpu: i >= humans}));
    const run = C.createRun({makeSimEngine: H.Engine.makeSimEngine, defs, seed: 5000 + s, size, seats});
    run.humans = humans;
    for(let f = 0; f < run.floorCount; f++){
      C.startFloor(run, f); tried[f]++;
      let res;
      while(!run.fl.over){ const plans = {}; run.seats.forEach((st, i)=>{ plans[st.seat] = Object.assign(C.cpuPlan(run, st.seat), {lock: i}); }); res = C.resolveRound(run, plans); }
      rounds[f].push(run.fl.round); reasons[res.reason] = (reasons[res.reason] || 0) + 1;
      if(run.fl.over === 'won') won[f]++; else break;
    }
  }
  console.log(`${humans} player(s), ${size} seats: clears ${won.map((w, i)=> `${w}/${tried[i]}`).join(' ')} · rounds ${rounds.map(r=> r.length ? (r.reduce((a, b)=> a + b, 0) / r.length).toFixed(1) : '-').join(' ')} · ${JSON.stringify(reasons)}`);
}
