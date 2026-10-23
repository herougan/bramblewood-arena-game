#!/usr/bin/env node
// EN2 (2026-10-23, owner 13:16 #2 / #11: "Does the CPU prefer the left? It shouldn't." and "I build left, you build right"):
// where the CPU puts its units. Not a test (not in run-all.sh): a measurement. Same play loop as tools/cpu_levels.js: the player
// seat (pid 1) plays aiLevel 1 with aiAim on, the CPU (pid 2) at aiLevel 0 / 1 / 2, open mode, the skirmish decks of Maps 0-5
// against the difficulty curve's 'mid' deck. For each unit a side places it records the slot, whether one of the other side's
// units stood across it (contested) and whether it was among the middle three slots (-1..1).
// --edge: the player seat is a "side builder" instead (the owner's "I build left"): each turn it plays the first unit it can afford
// at the outermost legal slot on its side (left in half the games, right in the other half), so the numbers show whether the CPU
// comes to meet it or builds on the other side.
//   node tests/en2-cpu-side-sim-2026-10-23.js [games=20] [out.json] [--edge]
'use strict';
const fs = require('fs'), path = require('path');
const ROOT = path.join(__dirname, '..');
const E = require(process.env.EN2_ENGINE || path.join(ROOT, 'bramblewood-engine.js')); // EN2_ENGINE: an older engine file, for a before / after
const ARGS = process.argv.slice(2).filter(a=> !a.startsWith('--')), EDGE = process.argv.includes('--edge');
const N = +(ARGS[0] || 20), OUT = ARGS[1] || null;
const cards = JSON.parse(fs.readFileSync(path.join(ROOT, 'canonical/cards.json'), 'utf8'));
const defs = {}; cards.filter(c=> !c.pool).forEach(c=>{ const d = Object.assign({effects:{}}, c); delete d.art; defs[c.id] = d; });
const src = fs.readFileSync(path.join(ROOT, 'arena_app.js'), 'utf8');
const i0 = src.indexOf('const CONQUEST_MAPS = ['), j0 = src.indexOf('\n];', i0);
const MAPS = eval(src.slice(i0 + 'const CONQUEST_MAPS = '.length, j0 + 2));
const mains = MAPS.filter(m=> !m.sub);
const curve = JSON.parse(fs.readFileSync(path.join(ROOT, 'docs/balance/difficulty-curve.json'), 'utf8'));
const PLAYER = Object.fromEntries(curve.decks.mid.cards.map(c=> [c.id, c.n]));
const fights = [];
mains.slice(0, 6).forEach(m=> (m.nodes || []).forEach(n=>{ if(n.deck && n.kind !== 'tutorial' && !n.rules) fights.push({m, n}); }));
const allCards = pl=> [...pl.row.left, ...pl.row.center, ...pl.row.right].filter(c=> c && c.hp > 0 && Number.isInteger(c.slot));
function tally(){ return {n: 0, slots: {}, contested: 0, middle: 3 > 2 ? 0 : 0, left: 0, right: 0, centre: 0}; }
function add(t, sl, contested){ t.n++; t.slots[sl] = (t.slots[sl] || 0) + 1; if(contested) t.contested++; if(Math.abs(sl) <= 1) t.middle++; if(sl < 0) t.left++; else if(sl > 0) t.right++; else t.centre++; }
function play(deckA, deckB, seed, cpu, T){
  const e = E.makeSimEngine(defs, E.mulberry32(seed), {battleMode: 'open', aiAim: true, aiLevel: cpu}); const so = p=> p === 1 ? 'A' : 'B';
  const P = {1: e.newPlayer(1, deckA, {id: 'castle', health: 30}), 2: e.newPlayer(2, deckB, {id: 'castle', health: 30})}, st = {};
  e.draw(P[1], 3, 'A', st, null); e.draw(P[2], 3, 'B', st, null);
  let faced = 0, cols = 0;
  for(let r = 1; r <= E.DRAW_ROUND_CAP; r++){
    e.setSuddenDeath(r >= E.SUDDEN_DEATH_ROUND, r >= E.SUDDEN_DEATH_CASTLE_ROUND ? 2 : 1);
    [1, 2].forEach(p=>{ P[p].playedThisTurn = false; P[p].discardUsedThisTurn = false; }); if(r > 1) e.roundStart(P, r, so, st, null);
    for(const pid of [1, 2]){
      const before = new Set(allCards(P[pid]).map(c=> c.uid));
      if(pid === 1 && EDGE){ const pl = P[1], hc = pl.hand.find(h=>{ const d = defs[h.defId] || {}; return !d.cardType && !d.field && e.canPlay(pl, h.defId, h.uid); });
        const legal = hc ? e.legalSlots(pl) : []; if(legal.length){ const sl = (seed & 1) ? Math.min(...legal) : Math.max(...legal); e.placeCard(P, so, 1, hc.uid, sl, st, null); } }
      else { e.setAiLevel(pid === 1 ? 1 : cpu); e.aiTakeTurn(P, so, pid, st, null); }
      const foeSlots = new Set(allCards(P[3 - pid]).map(c=> c.slot));
      const flip = EDGE && !(seed & 1) ? -1 : 1; // --edge: slots read so that negative (left) is always the side builder's side
      allCards(P[pid]).filter(c=> !before.has(c.uid)).forEach(c=> add(T[pid], c.slot * flip || 0, foeSlots.has(c.slot)));
    }
    // how many occupied columns face a unit (end of the play phase)
    const a = new Set(allCards(P[1]).map(c=> c.slot)), b = new Set(allCards(P[2]).map(c=> c.slot));
    const u = new Set([...a, ...b]); u.forEach(s=>{ cols++; if(a.has(s) && b.has(s)) faced++; });
    if(e.resolveCombat(P, so, st, null, r % 2 === 0 ? 1 : 2)){ T.faced += faced; T.cols += cols; return P[2].hq.hp <= 0 && P[1].hq.hp > 0 ? 1 : 0; }
    e.draw(P[1], 1, 'A', st, null); e.draw(P[2], 1, 'B', st, null);
  }
  T.faced += faced; T.cols += cols; return 0;
}
const out = {edge: EDGE, about: 'EN2 2026-10-23: CPU placement by slot (tests/en2-cpu-side-sim-2026-10-23.js). pid 1 = player seat (aiLevel 1), pid 2 = CPU.', games: N, fights: fights.length, levels: {}};
for(const cpu of [0, 1, 2]){
  const T = {1: tally(), 2: tally(), faced: 0, cols: 0}; let wins = 0, g = 0;
  fights.forEach(({n}, fi)=>{ for(let k = 0; k < N; k++){ wins += play(PLAYER, n.deck, 700 + fi * 101 + k * 7, cpu, T); g++; } });
  const sum = t=> ({placed: t.n, meanSlot: +(Object.entries(t.slots).reduce((s, [k, v])=> s + (+k) * v, 0) / Math.max(1, t.n)).toFixed(3),
    left: +(t.left / t.n).toFixed(3), centre: +(t.centre / t.n).toFixed(3), right: +(t.right / t.n).toFixed(3), middle3: +(t.middle / t.n).toFixed(3), contested: +(t.contested / t.n).toFixed(3),
    slots: Object.fromEntries(Object.keys(t.slots).map(Number).sort((x, y)=> x - y).map(k=> [k, t.slots[k]]))});
  out.levels[['basic', 'smart', 'smartest'][cpu]] = {games: g, playerWin: +(wins / g).toFixed(3), facedColumnShare: +(T.faced / Math.max(1, T.cols)).toFixed(3), player: sum(T[1]), cpu: sum(T[2])};
  console.log(['basic', 'smart', 'smartest'][cpu], JSON.stringify(out.levels[['basic', 'smart', 'smartest'][cpu]]));
}
if(OUT) fs.writeFileSync(OUT, JSON.stringify(out, null, 1) + '\n');
