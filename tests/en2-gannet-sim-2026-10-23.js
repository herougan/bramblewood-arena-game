#!/usr/bin/env node
// EN2 (2026-10-23, owner 17:01 #8 / #14 and 17:34 #15: "Im abit stuck in Gannet cliffs because its so difficult. I realise the windy buff is
// reallly strong"): Gannet Cliffs (Map 3, mc) win rates for the reference decks, before / after EN2's wind rules (Tailwind = Quick, not a
// Fast Forward turn; Headwind = active skills twice, not every trigger). Not a test (not in run-all.sh): a measurement. Same play loop and
// brambles as tools/cpu_levels.js (the player seat at aiLevel 1 with aiAim on, the CPU at the map's level: basic on Map 3), the map's wind
// ('windy'); no day / night (the map's own phase is left out on both sides, so the comparison is the wind and EN2's other engine changes).
//   node tests/en2-gannet-sim-2026-10-23.js [games=200] [out.json] [--calm]      EN2_ENGINE=<engine file> for the before
'use strict';
const fs = require('fs'), path = require('path');
const ROOT = path.join(__dirname, '..');
const E = require(process.env.EN2_ENGINE || path.join(ROOT, 'bramblewood-engine.js'));
const ARGS = process.argv.slice(2).filter(a=> !a.startsWith('--')), N = +(ARGS[0] || 200), OUT = ARGS[1] || null, CALM = process.argv.includes('--calm');
const cards = JSON.parse(fs.readFileSync(path.join(ROOT, 'canonical/cards.json'), 'utf8'));
const chars = JSON.parse(fs.readFileSync(path.join(ROOT, 'canonical/characters.json'), 'utf8'));
const defs = {}; cards.filter(c=> !c.pool).forEach(c=>{ const d = Object.assign({effects:{}}, c); delete d.art; defs[c.id] = d; });
const charById = {}; (Array.isArray(chars) ? chars : Object.values(chars)).forEach(c=> charById[c.id] = c);
const src = fs.readFileSync(path.join(ROOT, 'arena_app.js'), 'utf8');
const i0 = src.indexOf('const CONQUEST_MAPS = ['), j0 = src.indexOf('\n];', i0);
const MAPS = eval(src.slice(i0 + 'const CONQUEST_MAPS = '.length, j0 + 2)), mains = MAPS.filter(m=> !m.sub), M = MAPS.find(m=> m.id === 'mc'), MAPNO = mains.indexOf(M);
const curve = JSON.parse(fs.readFileSync(path.join(ROOT, 'docs/balance/difficulty-curve.json'), 'utf8'));
const DECKS = Object.fromEntries(['starter', 'mid'].map(k=> [k, Object.fromEntries(curve.decks[k].cards.map(c=> [c.id, c.n]))]));
const MY_HP = 30;
const KIND_BASE = {champion:'elite', miniboss:'elite', subboss:'boss', dungeon:'elite', worldboss:'raidboss', megaraid:'raidboss'};
const KIND_CASTLE_LEVEL = {skirmish:0, elite:3, boss:8, raidboss:12, finalboss:15};
const SHIELD_RULE_MULT = {skirmish:1, elite:1.5, champion:1.5, dungeon:1.5, miniboss:2, subboss:2, boss:3, finalboss:3, worldboss:3, raidboss:3, megaraid:3, tutorial:0};
function bramble(n){ // tools/cpu_levels.js bramble()
  const kind = n.kind || 'skirmish', bk = KIND_BASE[kind] || kind, base = (n.characterId && charById[n.characterId]) || charById.castle || {health: 30};
  const baseHp = (Number(base.health) || 30) + (n.characterId ? (KIND_CASTLE_LEVEL[bk] || 0) : 0), hp = Number(n.hqHp) > 0 ? Math.min(baseHp, Math.round(Number(n.hqHp))) : baseHp;
  const mult = SHIELD_RULE_MULT[kind] != null ? SHIELD_RULE_MULT[kind] : (SHIELD_RULE_MULT[bk] != null ? SHIELD_RULE_MULT[bk] : 1);
  const ov = n.shieldOverride != null && n.shieldOverride !== '' ? [].concat(n.shieldOverride).reduce((a, b)=> a + Math.max(0, Math.round(+b || 0)), 0) : null;
  return {hp, shield: ov != null ? ov : Math.max(0, Math.round(MAPNO * mult)), ch: n.characterId && charById[n.characterId]};
}
function play(A, n, seed){
  const b = bramble(n), opts = {battleMode: n.battleMode || 'open', rules: CALM ? {} : {wind: 'windy'}, aiAim: true, aiLevel: 0};
  const e = E.makeSimEngine(defs, E.mulberry32(seed), opts), so = p=> p === 1 ? 'A' : 'B';
  const P = {1: e.newPlayer(1, A, Object.assign({}, charById.castle, {health: MY_HP})), 2: e.newPlayer(2, n.deck, Object.assign({}, b.ch || charById.castle, {health: b.hp}))}, st = {};
  P[2].loopCards = []; if(b.shield){ P[2].hq.shield = b.shield; P[2].hq.maxShield = b.shield; }
  e.draw(P[1], 3, 'A', st, null); e.draw(P[2], 3, 'B', st, null);
  for(let r = 1; r <= E.DRAW_ROUND_CAP; r++){ e.setSuddenDeath(r >= E.SUDDEN_DEATH_ROUND, r >= E.SUDDEN_DEATH_CASTLE_ROUND ? 2 : 1); [1, 2].forEach(p=>{ P[p].playedThisTurn = false; P[p].discardUsedThisTurn = false; }); if(r > 1) e.roundStart(P, r, so, st, null);
    e.setAiLevel(1); e.aiTakeTurn(P, so, 1, st, null); e.setAiLevel(0); e.aiTakeTurn(P, so, 2, st, null);
    if(e.resolveCombat(P, so, st, null, r % 2 === 0 ? 1 : 2)){ const a = P[1].hq.hp <= 0, bb = P[2].hq.hp <= 0; return a && bb ? 0 : a ? 2 : 1; }
    e.draw(P[1], 1, 'A', st, null); e.draw(P[2], 1, 'B', st, null); }
  return 0;
}
const out = {about: 'EN2 2026-10-23: Gannet Cliffs (mc, Map 3) win rate per fight (tests/en2-gannet-sim-2026-10-23.js)', engine: process.env.EN2_ENGINE ? 'before (EN2_ENGINE)' : 'current', wind: CALM ? 'none' : 'windy', games: N, decks: {}};
for(const k of Object.keys(DECKS)){ out.decks[k] = {};
  M.nodes.forEach((n, fi)=>{ if(!n.deck) return; let w = 0; for(let g = 0; g < N; g++) if(play(DECKS[k], n, 4000 + fi * 977 + g * 13) === 1) w++; out.decks[k][n.key] = +(w / N * 100).toFixed(1); });
  const v = Object.values(out.decks[k]); out.decks[k].mean = +(v.reduce((a, b)=> a + b, 0) / v.length).toFixed(1);
  console.log(k, JSON.stringify(out.decks[k])); }
if(OUT) fs.writeFileSync(OUT, JSON.stringify(out, null, 1) + '\n');
