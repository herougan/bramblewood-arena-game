#!/usr/bin/env node
// EN8 (2026-10-24, owner 22:28 #1/#3 and 21:20 #4: "the CPU should be aggressively pitching"): how soon the CPU gets its first card
// down, fight by fight, as the game builds the fight (tools/lib_bramble.js: referenceFightSetup, the CPU at its real level, your seat
// at Smart). Per fight: the share of zero-Lumber cards in the CPU's deck, the mean round of its first play, how many of its first
// 6 turns it did nothing at all (no play, no pitch), and the new-player win rate.
//   node tools/en8_cpu_pitch_2026_10_24.js [games=40] [--maps=0-20] [--only=mw:5-3,...] [--tag=after] [--low=0.25]
// --low keeps fights whose CPU deck has at most that share of zero-Lumber cards (the owner's 5-3: 4 of 20).
// Output: docs/balance/en8-cpu-pitch-<tag>.json
'use strict';
const fs = require('fs'), path = require('path');
const ROOT = path.join(__dirname, '..');
const B = require('./lib_bramble.js'), G = B.G, E = B.E;
const argv = process.argv.slice(2);
const opt = (k, d)=>{ const a = argv.find(x=> x.startsWith('--' + k + '=')); return a ? a.slice(k.length + 3) : d; };
const GAMES = +(argv.find(a=> /^\d+$/.test(a)) || 40), TAG = opt('tag', 'now'), LOW = opt('low', null) != null ? +opt('low') : null;
const DECK = opt('deck', '') ? Object.fromEntries(opt('deck').split(',').map(x=>{ const [id, n] = x.split(':'); return [id, +n || 1]; })) : null; // --deck=id:n,...: the CPU's deck replaced (the "5-3-like" case)
const CPU = opt('cpu', null); // --cpu=0|1|2: the CPU's level forced
const [M0, M1] = opt('maps', '0-20').split('-').map(Number), ONLY = opt('only', '').split(',').filter(Boolean);
const seededRng = new Function(B.grab('seededRng') + '\nreturn seededRng;')(); // the game's own (arena_app.js)
const ENG = opt('engine', '') ? require(require('path').resolve(opt('engine'))) : E; // --engine=path: another engine build (the before / after measure)
const mainNo = m=> G.mapNumberOf(m.sub ? m.parent : m.id);
function playOne(ctx, g){
  const engine = ENG.makeSimEngine(ctx.defs, seededRng(ctx.seed0 + g * 37), {recordEvents:false, battleMode: ctx.mode, rules: ctx.rules, aiAim:true, aiLevel: ctx.cpu});
  const sideOf = id=> id===1?'A':'B', stats = {};
  const P = {1: engine.newPlayer(1, ctx.mine, ctx.myCastle), 2: engine.newPlayer(2, ctx.enemyDeck, ctx.sc.character)};
  P[2].loopCards = []; Object.assign(P[2].hq, ctx.setup.hq); if(ctx.setup.hq.shieldLayers) P[2].hq.shieldLayers = ctx.setup.hq.shieldLayers.slice(); if(ctx.setup.reserveLeaders) P[2].reserveLeaders = ctx.setup.reserveLeaders.slice();
  engine.draw(P[1], 3, 'A', stats, null); engine.draw(P[2], 3, 'B', stats, null);
  let r = 1, over = false, first = null, idle6 = 0;
  for(; r <= E.DRAW_ROUND_CAP && !over; r++){
    engine.setSuddenDeath(r >= E.SUDDEN_DEATH_ROUND, r >= E.SUDDEN_DEATH_CASTLE_ROUND ? 2 : 1);
    [1,2].forEach(p=>{ P[p].playedThisTurn = false; P[p].discardUsedThisTurn = false; });
    if(r > 1) engine.roundStart(P, r, sideOf, stats, null);
    engine.setAiLevel(1); engine.aiTakeTurn(P, sideOf, 1, stats, null); engine.setAiLevel(ctx.cpu); engine.aiTakeTurn(P, sideOf, 2, stats, null);
    if(P[2].playedThisTurn && first == null) first = r;
    if(r <= 6 && !P[2].playedThisTurn && !P[2].discardUsedThisTurn) idle6++;
    over = engine.resolveCombat(P, sideOf, stats, null, r % 2 === 0 ? 1 : 2); if(over) break;
    engine.draw(P[1], 1, 'A', stats, null); engine.draw(P[2], 1, 'B', stats, null);
  }
  const a = P[1].hq.hp <= 0, b = P[2].hq.hp <= 0;
  return {first: first == null ? r : first, idle6, win: !!(over && b && !a)};
}
const rows = [];
G.CONQUEST_MAPS.forEach(m=>{ const no = mainNo(m); if(no == null || no < M0 || no > M1) return;
  (m.nodes || []).forEach(n=>{ if(!n.deck || !Object.keys(n.deck).length) return; const key = m.id + ':' + n.key; if(ONLY.length && !ONLY.includes(key)) return;
    let ctx; try{ ctx = G.referenceFightSetup(m.id, n); }catch(e){ return; }
    if(DECK) ctx.enemyDeck = Object.assign({}, DECK); if(argv.includes('--noguard')){ ctx.rules = Object.assign({}, ctx.rules); delete ctx.rules.aiGuardLethal; } // --noguard: the pitch alone if(CPU != null) ctx.cpu = +CPU;
    const ids = Object.keys(ctx.enemyDeck), tot = ids.reduce((t, id)=> t + ctx.enemyDeck[id], 0);
    const zero = ids.reduce((t, id)=> t + ((ctx.defs[id] && !(ctx.defs[id].cost > 0) && !(ctx.defs[id].stoneCost > 0) && !(ctx.defs[id].metalCost > 0)) ? ctx.enemyDeck[id] : 0), 0);
    if(LOW != null && zero / Math.max(1, tot) > LOW) return;
    let fp = 0, idle = 0, wins = 0; for(let g = 0; g < GAMES; g++){ const r = playOne(ctx, g); fp += r.first; idle += r.idle6; if(r.win) wins++; }
    rows.push({fight: key, map: no, kind: n.kind || 'skirmish', cpu: ctx.cpu, zero, deck: tot, firstPlay: +(fp / GAMES).toFixed(2), idleOf6: +(idle / GAMES).toFixed(2), win: +(wins / GAMES * 100).toFixed(1)});
  }); });
const mean = k=> rows.length ? +(rows.reduce((t, r)=> t + r[k], 0) / rows.length).toFixed(2) : null;
const out = {tag: TAG, games: GAMES, maps: [M0, M1], low: LOW, fights: rows.length, meanFirstPlay: mean('firstPlay'), meanIdleOf6: mean('idleOf6'), meanWin: mean('win'), rows};
fs.mkdirSync(path.join(ROOT, 'docs/balance'), {recursive:true});
fs.writeFileSync(path.join(ROOT, 'docs/balance', `en8-cpu-pitch-${TAG}.json`), JSON.stringify(out, null, 1) + '\n');
rows.forEach(r=> console.log(`${r.fight.padEnd(12)} map ${String(r.map).padStart(2)} ${r.kind.padEnd(9)} cpu ${r.cpu} zero ${r.zero}/${r.deck}  first play r${r.firstPlay}  idle ${r.idleOf6}/6  win ${r.win}%`));
console.log(`fights ${rows.length}: mean first play r${out.meanFirstPlay}, idle ${out.meanIdleOf6}/6, player win ${out.meanWin}%`);
