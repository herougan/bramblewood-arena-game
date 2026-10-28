#!/usr/bin/env node
// ENG12 (2026-10-28, owner L11: "how can this be 2.5?" on the editor's Nocturnal +4/+0; L5: "Shock is too strong"): the numbers the 4-round rule
// needs to price the time-of-day bonuses and Shock (docs/workflows/balance.md, "Pricing by logic").
//   Part 1, the time of day: every conquest-map fight (arena_app.js CONQUEST_MAPS with the map-level rules, built as
//     tools/en6_state_uptime_2026_10_24.js builds them: MAP_DAYNIGHT, DARK_MAPS, Mist ...), PER CPU fights each between decks of 20 random live
//     band cards, counted over side 1's unit-rounds as combat starts: the share where the engine's zeitPhase() (the phase the time-givers read;
//     ENG11: a dark fight is night) is day / night / twilight / none, and the share of day rounds under clouds or ash (Diurnal's bonus halves).
//     Run twice: as the decks come (Twilight only when a deck holds a Crepuscular card), and with a Crepuscular card in side 1's deck (its
//     cycle is Day, Night, Day, Night, Twilight), which is what a Crepuscular unit sees.
//   Part 2, the damage a unit takes: the same fights, the mean damage of the 'hit' events on units per unit-round, and for Shock the extra
//     damage the Shocked hits carried (a third of each Shocked hit: it lands at 1.5x) per Shock that landed, for each Shock card.
//   node tools/eng12_uptime_2026_10_28.js [--per 4] [--seed 1]   writes docs/balance/eng12-uptime-2026-10-28.json
'use strict';
const fs = require('fs'), path = require('path'), vm = require('vm'), ROOT = path.join(__dirname, '..');
const H = require(path.join(ROOT, 'tests', 'lib', 'harness.js')), E = H.Engine;
const argv = process.argv.slice(2), opt = (k, d)=>{ const i = argv.indexOf('--' + k); return i >= 0 && argv[i + 1] ? argv[i + 1] : d; };
const PER = Math.max(1, +opt('per', 4) || 4), SEED = +opt('seed', 1) || 1;
const defs = H.loadCardDefs(), cards = JSON.parse(fs.readFileSync(path.join(ROOT, 'canonical', 'cards.json'), 'utf8'));
let kind = null; try{ const p = JSON.parse(fs.readFileSync(path.join(ROOT, 'docs', 'balance', 'bf6-plan-2026-10-21.json'), 'utf8')); kind = new Map((Array.isArray(p) ? p : p.rows || []).map(r=> [r.id, r.kind])); }catch(e){}
const band = cards.filter(c=> c.health != null && !c.easterEgg && !c.pool && defs[c.id] && (kind ? kind.get(c.id) === 'band' : !c.token));
const BRAMBLE = 35, CREP = 'nightjar-drifter', SHOCKERS = ['voltaic-eel', 'abyss-lantern-squid', 'electric-catfish'];
const r3 = v=> Math.round(v * 1000) / 1000;
function deckOf(rng, extra){ const d = {}; for(let n = 0; n < 20; n++){ const c = extra && n % 4 === 0 ? {id: extra} : band[Math.floor(rng() * band.length)]; d[c.id] = (d[c.id] || 0) + 1; } return d; }
function play(tag, g, rules, extra, onRound){
  const seed = H.hashStr('eng12-uptime|' + SEED + '|' + tag + '|' + g), rng = H.seededRng(seed);
  const engine = E.makeSimEngine(defs, H.seededRng(seed ^ 0x9e3779b9), {battleMode: 'open', rules, aiAim: true, aiLevel: 1, recordEvents: true});
  const P = {1: engine.newPlayer(1, deckOf(rng, extra), {id: 'st-hq', health: BRAMBLE, effects: {}}), 2: engine.newPlayer(2, deckOf(rng), {id: 'st-hq', health: BRAMBLE, effects: {}})}, stats = {};
  engine.draw(P[1], 3, 'A', stats, null); engine.draw(P[2], 3, 'B', stats, null);
  for(let r = 1; r <= E.DRAW_ROUND_CAP; r++){
    [1, 2].forEach(p=>{ P[p].playedThisTurn = false; P[p].discardUsedThisTurn = false; });
    if(r > 1) engine.roundStart(P, r, H.sideOf, stats, null);
    engine.aiTakeTurn(P, H.sideOf, 1, stats, null); engine.aiTakeTurn(P, H.sideOf, 2, stats, null);
    const live = pid=> engine.allBoardCards(P[pid]).filter(c=> c && c.hp > 0 && !c.gap);
    const ev = []; const n1 = live(1).length, n2 = live(2).length;
    const over = engine.resolveCombat(P, H.sideOf, stats, ev, r % 2 === 0 ? 1 : 2);
    onRound(engine, P, n1, n2, ev);
    if(over) break;
    engine.draw(P[1], 1, 'A', stats, null); engine.draw(P[2], 1, 'B', stats, null);
  }
}
// the conquest fights' rules (as tools/en6_state_uptime_2026_10_24.js builds them)
function fights(){
  const src = fs.readFileSync(path.join(ROOT, 'arena_app.js'), 'utf8'), sb = {}; vm.createContext(sb);
  const grab = (a, b)=>{ const i = src.indexOf(a), j = src.indexOf(b, i); if(i < 0 || j < 0) throw new Error('not found ' + a); return src.slice(i, j); };
  vm.runInContext(grab('const CONQUEST_MAPS = [', 'const CONQUEST_MAPS_BASELINE').replace('const CONQUEST_MAPS =', 'CONQUEST_MAPS ='), sb);
  vm.runInContext(grab('const MAP_DAYNIGHT = {', 'function mapDayNight').replace('const MAP_DAYNIGHT =', 'MAP_DAYNIGHT ='), sb);
  ['DARK_MAPS', 'WINDY_MAPS', 'VOLCANO_MAPS', 'MISTY_MAPS', 'RAPIDS_MAPS', 'MAP_BIOME_OF', 'TIDESPOUT_NODES'].forEach(nm=>{ const i = src.indexOf('const ' + nm + ' ='), j = src.indexOf('\n', i);
    if(i < 0) throw new Error('not found ' + nm); vm.runInContext(src.slice(i, j).replace('const ' + nm + ' =', nm + ' ='), sb); });
  const out = [];
  sb.CONQUEST_MAPS.forEach(m=>{ const mid = m.id, biome = sb.MAP_BIOME_OF[mid] || sb.MAP_BIOME_OF[m.parent], nodes = m.nodes || []; if(nodes.length >= 50) return;
    nodes.forEach(node=>{ if(/tutorial|raidboss/.test(node.kind || '')) return; const r = Object.assign({}, node.rules || {}); if(!r.phase) r.phase = sb.MAP_DAYNIGHT[mid] || 'cycle';
      if(sb.MISTY_MAPS.has(mid)) r.misty = true; if(r.misty || r.crushingDepths) r.phase = 'off';
      if(sb.RAPIDS_MAPS.has(mid)){ r.permaTide = true; r.rapids = true; } if(['beach', 'water', 'reef'].includes(biome)) r.wet = true;
      if(sb.WINDY_MAPS[mid]) r.wind = sb.WINDY_MAPS[mid]; if(sb.DARK_MAPS.has(mid)) r.dark = sb.DARK_MAPS.get(mid); if(sb.TIDESPOUT_NODES[mid] === node.key) r.tideSpout = true;
      out.push({map: mid, key: node.key, biome, rules: r}); }); });
  return out;
}
const t0 = Date.now(), list = fights();
function partPhase(extra){ const t = {ur: 0, day: 0, dayDim: 0, night: 0, twilight: 0, none: 0, dark: 0}, dmg = {ur: 0, d: 0};
  list.forEach(f=>{ for(let g = 0; g < PER; g++) play('phase|' + (extra || '-') + '|' + f.map + '|' + f.key, g, f.rules, extra, (engine, P, n1, n2, ev)=>{
    t.ur += n1; const ph = engine.zeitPhase(); if(ph === 'day'){ t.day += n1; if(f.rules.cloudy || f.rules.ashRain) t.dayDim += n1; } else if(ph === 'night') t.night += n1; else if(ph === 'twilight') t.twilight += n1; else t.none += n1;
    if(f.rules.dark) t.dark += n1;
    dmg.ur += n1 + n2; ev.forEach(x=>{ if(x.type === 'hit' && x.targetUid != null && x.dmg > 0) dmg.d += x.dmg; }); }); });
  const sh = k=> r3(t[k] / Math.max(1, t.ur));
  return {unitRounds: t.ur, day: sh('day'), dayDim: sh('dayDim'), night: sh('night'), twilight: sh('twilight'), none: sh('none'), dark: sh('dark'), dmgPerUnitRound: r3(dmg.d / Math.max(1, dmg.ur))}; }
function partShock(id){ const t = {shocks: 0, extra: 0, games: 0};
  list.forEach(f=>{ for(let g = 0; g < PER; g++){ t.games++; play('shock|' + id + '|' + f.map + '|' + f.key, g, f.rules, id, (engine, P, n1, n2, ev)=>{
    ev.forEach(x=>{ if(x.type === 'hit' && x.targetUid != null && x.dmg > 0 && (x.mods || []).includes('shocked')) t.extra += x.dmg / 3; if(x.type === 'statusFx' && x.kind === 'shock') t.shocks++; }); }); } });
  return {games: t.games, shocksLanded: t.shocks, extraDmgPerShock: r3(t.extra / Math.max(1, t.shocks))}; }
const plain = partPhase(null), crepuscular = partPhase(CREP), shock = {}; SHOCKERS.forEach(id=> shock[id] = partShock(id));
const out = {_about: 'tools/eng12_uptime_2026_10_28.js: shares of side 1\'s unit-rounds (units on the board as combat starts) by the time-givers\' phase (engine zeitPhase: a dark fight is night), over every conquest fight\'s rules x ' + PER + ' CPU fights of random live band decks; "crepuscular": the same with a Crepuscular card in side 1\'s deck (the D/N/D/N/T cycle). dmgPerUnitRound: mean hit damage a unit takes a round. shock: extra damage the Shocked hits carried per Shock landed, with the card as a quarter of side 1\'s deck.',
  generated: '2026-10-28', seed: SEED, perFight: PER, fights: list.length, band: band.length, plain, crepuscular, shock, seconds: Math.round((Date.now() - t0) / 1000)};
fs.writeFileSync(path.join(ROOT, 'docs', 'balance', 'eng12-uptime-2026-10-28.json'), JSON.stringify(out, null, 1) + '\n');
console.log(JSON.stringify(out, null, 1));
