#!/usr/bin/env node
// EN5 (2026-10-24, owner 03:12: "New state-like skills like Tide ... One if wood=3+, one if stone=2+, one if metal=1+ ... When your bramble
// health is low - {} is gained"): how often each state holds, for pricing Timbered / Bedrock / Forged / Last Stand by the owner's 4-round
// rule x the condition's typical uptime. Plays seeded AI-vs-AI fights between decks of 20 random live band cards (the robust skill test's
// card set, their own skills; brambles 35, the robust test's), and counts, over every unit-round on the board (a unit on its side's front
// row at a round's start), the share where its side holds 3+ Lumber, 2+ Stone, 1+ Metal, and has its bramble at a third of its Health or
// less. Also the same shares for "resource decks": decks where at least 4 cards make that resource (Stone: pitchYield stone, Quarry,
// gainStone; Metal: Smelter, gain metal), the decks a Bedrock / Forged card would be built into.
//   node tools/en5_state_uptime_2026_10_24.js [--games 2000] [--seed 1]      writes docs/balance/en5-state-uptime-2026-10-24.json
'use strict';
const fs = require('fs'), path = require('path'), ROOT = path.join(__dirname, '..');
const H = require(path.join(ROOT, 'tests', 'lib', 'harness.js')), E = H.Engine;
const argv = process.argv.slice(2), opt = (k, d)=>{ const i = argv.indexOf('--' + k); return i >= 0 && argv[i + 1] ? argv[i + 1] : d; };
const G = Math.max(10, +opt('games', 2000) || 2000), SEED = +opt('seed', 1) || 1;
const defs = H.loadCardDefs(), cards = JSON.parse(fs.readFileSync(path.join(ROOT, 'canonical', 'cards.json'), 'utf8'));
let kind = null; try{ const p = JSON.parse(fs.readFileSync(path.join(ROOT, 'docs', 'balance', 'bf6-plan-2026-10-21.json'), 'utf8')); kind = new Map((Array.isArray(p) ? p : p.rows || []).map(r=> [r.id, r.kind])); }catch(e){}
const band = cards.filter(c=> c.health != null && !c.easterEgg && !c.pool && defs[c.id] && (kind ? kind.get(c.id) === 'band' : !c.token));
const trig = (c, f)=> ((c.effects && c.effects.triggers) || []).some(f);
const makesStone = c=> (c.pitchYield && c.pitchYield.resource === 'stone') || !!(c.effects && c.effects.quarry) || trig(c, t=> t && (t.do === 'gainStone' || (t.do === 'gain' && t.resource === 'stone')));
const makesMetal = c=> !!(c.effects && (c.effects.smelter || c.effects.heavyMetal)) || trig(c, t=> t && t.do === 'gain' && t.resource === 'metal');
const stoneCards = band.filter(makesStone), metalCards = band.filter(makesMetal);
const BRAMBLE = 35;
function deckOf(rng, extra){ const d = {}; let n = 0; if(extra && extra.length){ for(let i = 0; i < 4; i++){ const c = extra[Math.floor(rng() * extra.length)]; d[c.id] = (d[c.id] || 0) + 1; n++; } }
  while(n < 20){ const c = band[Math.floor(rng() * band.length)]; d[c.id] = (d[c.id] || 0) + 1; n++; } return d; }
function play(g, kindTag, extra){
  const seed = H.hashStr('en5-uptime|' + SEED + '|' + kindTag + '|' + g), rng = H.seededRng(seed);
  const engine = E.makeSimEngine(defs, H.seededRng(seed ^ 0x9e3779b9), {battleMode: 'open', rules: {phase: 'cycle'}, aiAim: true, aiLevel: 1});
  const P = {1: engine.newPlayer(1, deckOf(rng, extra), {id: 'st-hq', health: BRAMBLE, effects: {}}), 2: engine.newPlayer(2, deckOf(rng, null), {id: 'st-hq', health: BRAMBLE, effects: {}})}, stats = {};
  engine.draw(P[1], 3, 'A', stats, null); engine.draw(P[2], 3, 'B', stats, null);
  const t = {ur: 0, lumber3: 0, stone2: 0, metal1: 0, low: 0, rounds: 0};
  for(let r = 1; r <= E.DRAW_ROUND_CAP; r++){
    [1, 2].forEach(p=>{ P[p].playedThisTurn = false; P[p].discardUsedThisTurn = false; });
    if(r > 1) engine.roundStart(P, r, H.sideOf, stats, null);
    engine.aiTakeTurn(P, H.sideOf, 1, stats, null); engine.aiTakeTurn(P, H.sideOf, 2, stats, null);
    // side 1 only (the side that gets the resource cards in a resource deck)
    { const pl = P[1], n = engine.allBoardCards(pl).filter(c=> c && c.hp > 0 && !c.gap).length; t.rounds++;
      t.ur += n; if((pl.lumber || 0) >= 3) t.lumber3 += n; if((pl.stone || 0) >= 2) t.stone2 += n; if((pl.metal || 0) >= 1) t.metal1 += n; if(pl.hq.hp * 3 <= pl.hq.maxHp) t.low += n; }
    const over = engine.resolveCombat(P, H.sideOf, stats, null, r % 2 === 0 ? 1 : 2); if(over) break;
    engine.draw(P[1], 1, 'A', stats, null); engine.draw(P[2], 1, 'B', stats, null);
  }
  return t;
}
function run(tag, extra){ const s = {ur: 0, lumber3: 0, stone2: 0, metal1: 0, low: 0, rounds: 0}; for(let g = 0; g < G; g++){ const t = play(g, tag, extra); Object.keys(s).forEach(k=> s[k] += t[k]); }
  const sh = k=> Math.round(1000 * s[k] / Math.max(1, s.ur)) / 1000; return {games: G, unitRounds: s.ur, meanRounds: Math.round(100 * s.rounds / G) / 100, lumber3: sh('lumber3'), stone2: sh('stone2'), metal1: sh('metal1'), lastStand: sh('low')}; }
const t0 = Date.now();
const out = {_about: 'tools/en5_state_uptime_2026_10_24.js: the share of unit-rounds (a unit on the front row at a round\'s start, side 1) where the side holds 3+ Lumber, 2+ Stone, 1+ Metal, or has its bramble at a third of its Health or less. "any": 20 random live band cards a side; "stone" / "metal": 4 of side 1\'s 20 are cards that make that resource.',
  generated: '2026-10-24', seed: SEED, band: band.length, stoneMakers: stoneCards.map(c=> c.id), metalMakers: metalCards.map(c=> c.id),
  any: run('any', null), stone: stoneCards.length ? run('stone', stoneCards) : null, metal: metalCards.length ? run('metal', metalCards) : null, seconds: Math.round((Date.now() - t0) / 1000)};
const f = path.join(ROOT, 'docs', 'balance', 'en5-state-uptime-2026-10-24.json'); fs.writeFileSync(f, JSON.stringify(out, null, 1) + '\n');
console.log(JSON.stringify({any: out.any, stone: out.stone, metal: out.metal, stoneMakers: out.stoneMakers.length, metalMakers: out.metalMakers.length, seconds: out.seconds}, null, 1));
