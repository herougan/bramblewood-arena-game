#!/usr/bin/env node
// 2026-10-23 (package HUB3, owner 19:27: "Using the tutorial deck in Map 0 then changing it abit still makes it really difficult. Bramble
// health is too low at Map 0 and before. ... Gannet Cliffs is extremely challenging. Many of the matches ended up just me trying to avoid
// enemy units and trying to hit the enemy bramble to death (damage race)"): measurements behind the Progression plan's balancing
// suggestions. Nothing in the game is changed; each variant is a trial in memory.
//   node tools/hub3_balance_probe_2026_10_23.js [games=100] [--out docs/balance/hub3-probe-2026-10-23.json] [--only early|race]
// 1. early: Map 0 and Map 1 with the real starting deck of each side at Level 0 (tools/eb_early_road_2026_10_23.js runFight's setup), for
//    variants: today; your bramble +5 / +10 Health; the tutorial-base cards at 80% Attack and Health on both sides (the owner's plan to
//    make the Map 0 base units weaker); both together; the 80% in the enemy decks only (your copies keep today's stats).
// 2. race: Maps 1-4 with the game's reference deck (referenceFightSetup, as the skirmish editor's win-rate panel plays): win rate,
//    rounds, units each side kills a game, and the share of each side's damage that went into the enemy bramble (faceDamage / dealt,
//    engine stats). A high face share for both sides with few kills is the "damage race" the owner describes.
'use strict';
const fs = require('fs'), path = require('path');
const ROOT = path.join(__dirname, '..');
const EB = require(path.join(ROOT, 'tools', 'eb_early_road_2026_10_23.js')), G = EB.G, D = EB.D;
const E = require(path.join(ROOT, 'bramblewood-engine.js'));
const args = process.argv.slice(2), GAMES = +(args.find(a=> /^\d+$/.test(a)) || 100), opt = k=>{ const i = args.indexOf('--' + k); return i >= 0 ? args[i + 1] : null; };
const OUT = opt('out') || path.join(ROOT, 'docs', 'balance', 'hub3-probe-2026-10-23.json'), ONLY = opt('only');
const plan = JSON.parse(fs.readFileSync(path.join(ROOT, 'docs', 'balance', 'progression-plan-2026-10-23.json'), 'utf8'));
const TUT = plan.cards.filter(c=> c.bucket === 'tutorialBase').map(c=> c.id);
const pct = v=> Math.round(v * 1000) / 10;
const SIDES = ['otters', 'hummingbirds', 'both'];

// the same lv0 build as the EB tool (a Level-0 derived def per card whose own level is 1)
function lv0(deck){ const out = {}; Object.entries(deck).forEach(([id, k])=>{ const d = D[id]; if(!d) return;
  if(G.cardBaseLevel(d) <= 0){ out[id] = (out[id] || 0) + k; return; }
  const did = id + '@h3'; if(!D[did]){ const st = G.statsAtLevel(d, 0); D[did] = Object.assign({}, d, {id: did, derivedFrom: id, attack: st.attack, health: st.health, level: 0}); }
  out[did] = (out[did] || 0) + k; }); return out; }
function playGame(ctx, g){ // playReferenceGame with the engine's per-card stats kept
  const engine = E.makeSimEngine(ctx.defs, G.seededRng ? G.seededRng(ctx.seed0 + g * 37) : E.mulberry32(ctx.seed0 + g * 37), {recordEvents: false, battleMode: ctx.mode, rules: ctx.rules, aiAim: true, aiLevel: ctx.cpu});
  const so = id=> id === 1 ? 'A' : 'B', st = {};
  const P = {1: engine.newPlayer(1, ctx.mine, ctx.myCastle), 2: engine.newPlayer(2, ctx.enemyDeck, ctx.sc.character)};
  P[2].loopCards = []; Object.assign(P[2].hq, ctx.setup.hq); if(ctx.setup.hq.shieldLayers) P[2].hq.shieldLayers = ctx.setup.hq.shieldLayers.slice(); if(ctx.setup.reserveLeaders) P[2].reserveLeaders = ctx.setup.reserveLeaders.slice();
  engine.draw(P[1], 3, 'A', st, null); engine.draw(P[2], 3, 'B', st, null);
  let r = 1, over = false;
  for(; r <= E.DRAW_ROUND_CAP && !over; r++){
    engine.setSuddenDeath(r >= E.SUDDEN_DEATH_ROUND, r >= E.SUDDEN_DEATH_CASTLE_ROUND ? 2 : 1); [1, 2].forEach(p=>{ P[p].playedThisTurn = false; P[p].discardUsedThisTurn = false; });
    if(r > 1) engine.roundStart(P, r, so, st, null);
    engine.setAiLevel(1); engine.aiTakeTurn(P, so, 1, st, null); engine.setAiLevel(ctx.cpu); engine.aiTakeTurn(P, so, 2, st, null);
    over = engine.resolveCombat(P, so, st, null, r % 2 === 0 ? 1 : 2); if(over) break;
    engine.draw(P[1], 1, 'A', st, null); engine.draw(P[2], 1, 'B', st, null);
  }
  const sum = (side, k)=> Object.values(st).filter(x=> x && x.side === side).reduce((a, x)=> a + (x[k] || 0), 0);
  return {win: !!(over && P[2].hq.hp <= 0 && P[1].hq.hp > 0), rounds: r, A: {dealt: sum('A', 'dealt'), face: sum('A', 'faceDamage'), kills: sum('A', 'kills')}, B: {dealt: sum('B', 'dealt'), face: sum('B', 'faceDamage'), kills: sum('B', 'kills')}};
}
function run(mapId, node, opts, games, myDelta){
  const ctx = G.referenceFightSetup(mapId, node, opts);
  if(myDelta) ctx.myCastle = Object.assign({}, ctx.myCastle, {health: ctx.myCastle.health + myDelta});
  let w = 0, rounds = 0, aF = 0, aD = 0, bF = 0, bD = 0, aK = 0, bK = 0;
  for(let g = 0; g < games; g++){ const r = playGame(ctx, g); if(r.win) w++; rounds += r.rounds; aF += r.A.face; aD += r.A.dealt; bF += r.B.face; bD += r.B.dealt; aK += r.A.kills; bK += r.B.kills; }
  return {win: pct(w / games), rounds: Math.round(rounds / games * 10) / 10, myFace: aD ? pct(aF / aD) : null, foeFace: bD ? pct(bF / bD) : null, myKills: Math.round(aK / games * 10) / 10, foeKills: Math.round(bK / games * 10) / 10, my: ctx.myCastle.health, foe: ctx.sc.hp + '+' + ctx.sc.shield};
}
const out = {about: 'HUB3 balance probe (tools/hub3_balance_probe_2026_10_23.js): trials in memory, nothing in the game changed.', games: GAMES, generated: new Date().toISOString().slice(0, 10), early: null, race: null};

if(ONLY !== 'race'){
  const scaleTut = k=>{ const keep = {}; TUT.forEach(id=>{ const d = D[id]; if(!d) return; keep[id] = [d.attack, d.health]; d.attack = Math.max(0, Math.round(d.attack * k)); d.health = Math.max(1, Math.round(d.health * k)); });
    Object.keys(D).filter(id=> /@h3$|@lv/.test(id)).forEach(id=> delete D[id]); return ()=>{ Object.entries(keep).forEach(([id, [a, h]])=>{ D[id].attack = a; D[id].health = h; }); Object.keys(D).filter(id=> /@h3$|@lv/.test(id)).forEach(id=> delete D[id]); }; };
  const VARIANTS = [{key: 'now', label: 'today', my: 0}, {key: 'hp5', label: 'your bramble +5', my: 5}, {key: 'hp10', label: 'your bramble +10', my: 10},
    {key: 'tut80', label: 'tutorial-base cards at 80% (both sides)', my: 0, tut: 0.8}, {key: 'tut80hp5', label: 'tutorial base 80% + your bramble +5', my: 5, tut: 0.8},
    {key: 'tut80foe', label: 'tutorial-base cards at 80% in the enemy decks only', my: 0, tut: 0.8, foeOnly: true}];
  // the player's copies frozen at today's stats (for foeOnly): a clone per card, made before any scaling
  const frozen = deck=>{ const out = {}; Object.entries(lv0(deck)).forEach(([id, k])=>{ const fid = id.replace(/@h3$/, '') + '@h3o'; if(!D[fid]) D[fid] = Object.assign({}, D[id], {id: fid, derivedFrom: D[id].derivedFrom || id}); out[fid] = (out[fid] || 0) + k; }); return out; };
  const decks = {}, frozenDecks = {}; SIDES.forEach(s=>{ decks[s] = EB.starterDeck(s); frozenDecks[s] = frozen(decks[s]); });
  out.early = {decks, variants: VARIANTS.map(v=> ({key: v.key, label: v.label})), fights: []};
  const fights = []; ['m1', 'mf'].forEach(mid=> EB.byMap(mid).nodes.filter(n=> n.deck && n.kind !== 'tutorial').forEach(n=> fights.push([mid, n])));
  fights.forEach(([mid, n])=> out.early.fights.push({code: n.key, target: Math.round(G.roadCurveTarget(mid, n).t * 100), res: {}}));
  VARIANTS.forEach(v=>{ const undo = v.tut ? scaleTut(v.tut) : null;
    fights.forEach(([mid, n], i)=>{ const row = out.early.fights[i]; const per = SIDES.map(s=> run(mid, n, {deck: v.foeOnly ? frozenDecks[s] : lv0(decks[s]), level: 0}, GAMES, v.my));
      row.res[v.key] = {mean: pct(per.reduce((a, r)=> a + r.win / 100, 0) / per.length), sides: Object.fromEntries(SIDES.map((s, k)=> [s, per[k].win])), rounds: per[0].rounds, my: per[0].my, foe: per[0].foe}; });
    if(undo) undo(); console.log('early', v.key, out.early.fights.map(f=> f.code + ' ' + f.res[v.key].mean).join('  ')); });
}
if(ONLY !== 'early'){
  out.race = {about: 'reference deck (referenceFightSetup), per map', maps: []};
  ['mf', 'mb', 'mc', 'm2'].forEach(mid=>{ const m = EB.byMap(mid), rows = [];
    m.nodes.filter(n=> n.deck && n.kind !== 'tutorial').forEach(n=>{ rows.push(Object.assign({code: n.key}, run(mid, n, {}, GAMES, 0))); });
    const avg = k=> Math.round(rows.reduce((a, r)=> a + (r[k] || 0), 0) / rows.length * 10) / 10;
    const row = {map: mid, num: G.mapNumberOf(mid), name: m.name, win: avg('win'), rounds: avg('rounds'), myFace: avg('myFace'), foeFace: avg('foeFace'), myKills: avg('myKills'), foeKills: avg('foeKills'), fights: rows};
    out.race.maps.push(row); console.log('race', mid, JSON.stringify(Object.assign({}, row, {fights: undefined}))); });
}
fs.writeFileSync(OUT, JSON.stringify(out, null, 1) + '\n'); console.log('->', path.relative(ROOT, OUT));
