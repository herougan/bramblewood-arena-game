#!/usr/bin/env node
// Difficulty curve check (2026-10-03, game-design pass): plays each faction's post-tutorial starter
// deck (AI-piloted) against every Conquest node, N seeded games each, with the real castle HP on
// both sides. AI-vs-AI is not a human, but the SHAPE of the curve (each map a bit harder than the
// last, no wall, no free node) is what this is for.
//   node tools/difficulty_curve.js [games=120] [faction=otters] [mode=open|gravity]
// 2026-10-08: Conquest fights default to Open (no collapsing), so that's the default mode here too;
// a node's own battleMode still wins.
'use strict';
const fs = require('fs'), path = require('path');
const ROOT = path.join(__dirname, '..');
const E = require(path.join(ROOT, 'bramblewood-engine.js'));
const N = +process.argv[2] || 120, FACTION = process.argv[3] || 'otters', MODE = process.argv[4] || 'open';
const cards = JSON.parse(fs.readFileSync(path.join(ROOT, 'canonical/cards.json'), 'utf8'));
const chars = JSON.parse(fs.readFileSync(path.join(ROOT, 'canonical/characters.json'), 'utf8'));
const defs = {}; cards.forEach(c=>{ const d = Object.assign({effects:{}}, c); delete d.art; defs[c.id] = d; });
const charById = {}; (Array.isArray(chars) ? chars : Object.values(chars)).forEach(c=> charById[c.id] = c);
const src = fs.readFileSync(path.join(ROOT, 'arena_app.js'), 'utf8');
const i = src.indexOf('const CONQUEST_MAPS = ['); const j = src.indexOf('\n];', i);
const CONQUEST_MAPS = eval(src.slice(i + 'const CONQUEST_MAPS = '.length, j + 2));
const basics = f=> Object.keys(defs).filter(id=> defs[id].basic && (defs[id].basicSet||defs[id].faction)===f).sort();
const starter = {}; if(FACTION==='otters') basics('otters').forEach(id=> starter[id]=1); else basics('hummingbirds').forEach(id=> starter[id]=2);
function play(deckA, deckB, hpA, charB, hpB, seed, mode){
  const rnd = E.mulberry32(seed);
  const engine = E.makeSimEngine(defs, rnd, {battleMode: mode || MODE});
  const sideOf = p=> p===1 ? 'A' : 'B';
  const players = {1: engine.newPlayer(1, deckA, Object.assign({}, charById.castle, {health: hpA})), 2: engine.newPlayer(2, deckB, Object.assign({}, charB || charById.castle, {health: hpB}))};
  const stats = {};
  engine.draw(players[1], 3, 'A', stats, null); engine.draw(players[2], 3, 'B', stats, null);
  for(let round = 1; round <= E.DRAW_ROUND_CAP; round++){
    engine.setSuddenDeath(round >= E.SUDDEN_DEATH_ROUND);
    [1,2].forEach(p=>{ players[p].playedThisTurn = false; players[p].discardUsedThisTurn = false; });
    engine.aiTakeTurn(players, sideOf, 1, stats, null); engine.aiTakeTurn(players, sideOf, 2, stats, null);
    if(engine.resolveCombat(players, sideOf, stats, null, round%2===0 ? 1 : 2)){
      const a = players[1].hq.hp<=0, b = players[2].hq.hp<=0; return {w: a&&b ? 0 : a ? 2 : 1, r: round, hp: Math.max(0, players[1].hq.hp)};
    }
    engine.draw(players[1], 1, 'A', stats, null); engine.draw(players[2], 1, 'B', stats, null);
  }
  return {w: 0, r: E.DRAW_ROUND_CAP, hp: players[1].hq.hp};
}
console.log(`[${MODE}] Starter deck (${FACTION}, ${Object.values(starter).reduce((a,b)=>a+b,0)} cards) vs each Conquest node, ${N} games each, castle 30 HP:`);
console.log('node'.padEnd(26) + 'kind'.padEnd(10) + 'HP'.padStart(4) + '  win%   rounds  hp left');
CONQUEST_MAPS.forEach(m=>{
  m.nodes.filter(n=> n.deck && n.kind!=='tutorial').forEach(n=>{
    let wins = 0, rounds = 0, hpLeft = 0;
    for(let k=0;k<N;k++){ const r = play(starter, n.deck, 30, n.characterId && charById[n.characterId], n.hqHp, 1000 + k*7919, n.battleMode); if(r.w===1){ wins++; hpLeft += r.hp; } rounds += r.r; }
    const pct = 100*wins/N;
    console.log(`${(m.id+' '+n.key+' '+n.name).slice(0,25).padEnd(26)}${n.kind.padEnd(10)}${String(n.hqHp).padStart(4)}  ${pct.toFixed(0).padStart(4)}%  ${(rounds/N).toFixed(1).padStart(6)}  ${wins ? (hpLeft/wins).toFixed(1) : '-'}`);
  });
});
