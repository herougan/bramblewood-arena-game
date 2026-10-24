#!/usr/bin/env node
// EN6 (2026-10-24, owner 03:17 + 12:02 #11 "03:17 - all"): how often each EN6 state holds, for pricing the new state skills by the owner's
// 4-round rule x the condition's uptime (the way tools/en5_state_uptime_2026_10_24.js measured EN5's).
//   Part 1, the hand: seeded CPU-vs-CPU fights between decks of 20 random live band cards (the robust skill test's card set, brambles 35),
//     counted over every unit-round on side 1's board at the moment combat starts (after both sides played): the share where side 1 holds
//     4+ cards (Plenty) / 1 or fewer (Scarcity), the same for the opponent's hand, and the mean hand size and empty slots (Full Hand / Lean).
//   Part 2, the field: every conquest-map fight (arena_app.js CONQUEST_MAPS with fightRules' map-level rules, as tools/skill_test_robust.js
//     --census builds them, plus EN6's own map flags: hotMap on the ash / forge / frostfire / pale-desert maps, coldMap on tundra and
//     frostfire, saltMap on beach and reef, weatherMap on savanna and pale desert), GAMES_PER fights each, the same random decks: the share of
//     unit-rounds where Heat, Frost, Rain, Storm, Fog, Salt, Drought and Hibernate's sleep hold; over all fights, and over the fights where
//     the state ever holds ("home": the maps a card with that skill is made for).
//   Part 3, Seasons (the field option, off on every map): the same random fights with rules.seasons on (3 rounds a season): each season's share.
//   node tools/en6_state_uptime_2026_10_24.js [--games 1500] [--per 6] [--seed 1]   writes docs/balance/en6-state-uptime-2026-10-24.json
'use strict';
const fs = require('fs'), path = require('path'), vm = require('vm'), ROOT = path.join(__dirname, '..');
const H = require(path.join(ROOT, 'tests', 'lib', 'harness.js')), E = H.Engine;
const argv = process.argv.slice(2), opt = (k, d)=>{ const i = argv.indexOf('--' + k); return i >= 0 && argv[i + 1] ? argv[i + 1] : d; };
const G = Math.max(10, +opt('games', 1500) || 1500), PER = Math.max(1, +opt('per', 6) || 6), SEED = +opt('seed', 1) || 1;
const defs = H.loadCardDefs(), cards = JSON.parse(fs.readFileSync(path.join(ROOT, 'canonical', 'cards.json'), 'utf8'));
let kind = null; try{ const p = JSON.parse(fs.readFileSync(path.join(ROOT, 'docs', 'balance', 'bf6-plan-2026-10-21.json'), 'utf8')); kind = new Map((Array.isArray(p) ? p : p.rows || []).map(r=> [r.id, r.kind])); }catch(e){}
const band = cards.filter(c=> c.health != null && !c.easterEgg && !c.pool && defs[c.id] && (kind ? kind.get(c.id) === 'band' : !c.token));
const BRAMBLE = 35;
function deckOf(rng){ const d = {}; for(let n = 0; n < 20; n++){ const c = band[Math.floor(rng() * band.length)]; d[c.id] = (d[c.id] || 0) + 1; } return d; }
const FIELD_KEYS = ['heat', 'frost', 'rain', 'storm', 'fog', 'salt', 'drought', 'hibernate'];
function play(tag, g, rules, onRound){
  const seed = H.hashStr('en6-uptime|' + SEED + '|' + tag + '|' + g), rng = H.seededRng(seed);
  const engine = E.makeSimEngine(defs, H.seededRng(seed ^ 0x9e3779b9), {battleMode: 'open', rules, aiAim: true, aiLevel: 1});
  const P = {1: engine.newPlayer(1, deckOf(rng), {id: 'st-hq', health: BRAMBLE, effects: {}}), 2: engine.newPlayer(2, deckOf(rng), {id: 'st-hq', health: BRAMBLE, effects: {}})}, stats = {};
  engine.draw(P[1], 3, 'A', stats, null); engine.draw(P[2], 3, 'B', stats, null);
  for(let r = 1; r <= E.DRAW_ROUND_CAP; r++){
    [1, 2].forEach(p=>{ P[p].playedThisTurn = false; P[p].discardUsedThisTurn = false; });
    if(r > 1) engine.roundStart(P, r, H.sideOf, stats, null);
    engine.aiTakeTurn(P, H.sideOf, 1, stats, null); engine.aiTakeTurn(P, H.sideOf, 2, stats, null);
    const n = engine.allBoardCards(P[1]).filter(c=> c && c.hp > 0 && !c.gap).length; onRound(engine, P, n, r);
    const over = engine.resolveCombat(P, H.sideOf, stats, null, r % 2 === 0 ? 1 : 2); if(over) break;
    engine.draw(P[1], 1, 'A', stats, null); engine.draw(P[2], 1, 'B', stats, null);
  }
}
const r3 = v=> Math.round(v * 1000) / 1000;
// ---- part 1: the hand
function partHand(){ const t = {ur: 0, plenty: 0, scarcity: 0, foePlenty: 0, foeScarcity: 0, hand: 0, empty: 0, foeHand: 0, foeEmpty: 0, rounds: 0}, hist = [0, 0, 0, 0, 0, 0];
  for(let g = 0; g < G; g++) play('hand', g, {phase: 'cycle'}, (engine, P, n)=>{ const h = P[1].hand.length, f = P[2].hand.length; t.rounds++; t.ur += n;
    if(h >= 4) t.plenty += n; if(h <= 1) t.scarcity += n; if(f >= 4) t.foePlenty += n; if(f <= 1) t.foeScarcity += n;
    hist[Math.min(5, h)] += n; t.hand += n * h; t.empty += n * Math.max(0, 5 - h); t.foeHand += n * f; t.foeEmpty += n * Math.max(0, 5 - f); });
  const sh = k=> r3(t[k] / Math.max(1, t.ur)); return {games: G, unitRounds: t.ur, plenty: sh('plenty'), scarcity: sh('scarcity'), foePlenty: sh('foePlenty'), foeScarcity: sh('foeScarcity'),
    hist: hist.map(x=> r3(x / Math.max(1, t.ur))), meanHand: sh('hand'), meanEmpty: sh('empty'), meanFoeHand: sh('foeHand'), meanFoeEmpty: sh('foeEmpty')}; }
// ---- part 2: the conquest fights' rules (skill_test_robust.js census(), + EN6's map flags as arena_app.js fightRules sets them)
function fights(){
  const src = fs.readFileSync(path.join(ROOT, 'arena_app.js'), 'utf8'), sb = {}; vm.createContext(sb);
  const grab = (a, b)=>{ const i = src.indexOf(a), j = src.indexOf(b, i); if(i < 0 || j < 0) throw new Error('not found ' + a); return src.slice(i, j); };
  vm.runInContext(grab('const CONQUEST_MAPS = [', 'const CONQUEST_MAPS_BASELINE').replace('const CONQUEST_MAPS =', 'CONQUEST_MAPS ='), sb);
  vm.runInContext(grab('const MAP_DAYNIGHT = {', 'function mapDayNight').replace('const MAP_DAYNIGHT =', 'MAP_DAYNIGHT ='), sb);
  ['DARK_MAPS', 'WINDY_MAPS', 'VOLCANO_MAPS', 'MISTY_MAPS', 'RAPIDS_MAPS', 'MAP_BIOME_OF', 'TIDESPOUT_NODES', 'EN6_HOT_BIOMES', 'EN6_COLD_BIOMES', 'EN6_SALT_BIOMES', 'EN6_WEATHER_BIOMES'].forEach(nm=>{ const i = src.indexOf('const ' + nm + ' ='), j = src.indexOf('\n', i);
    if(i < 0) throw new Error('not found ' + nm); vm.runInContext(src.slice(i, j).replace('const ' + nm + ' =', nm + ' ='), sb); });
  const out = [];
  sb.CONQUEST_MAPS.forEach(m=>{ const mid = m.id, biome = sb.MAP_BIOME_OF[mid] || sb.MAP_BIOME_OF[m.parent], nodes = m.nodes || []; if(nodes.length >= 50) return;
    nodes.forEach(node=>{ if(/tutorial|raidboss/.test(node.kind || '')) return; const r = Object.assign({}, node.rules || {}); if(!r.phase) r.phase = sb.MAP_DAYNIGHT[mid] || 'cycle';
      if(sb.MISTY_MAPS.has(mid)) r.misty = true; if(r.misty || r.crushingDepths) r.phase = 'off';
      if(sb.RAPIDS_MAPS.has(mid)){ r.permaTide = true; r.rapids = true; } if(['beach', 'water', 'reef'].includes(biome)) r.wet = true;
      if(sb.WINDY_MAPS[mid]) r.wind = sb.WINDY_MAPS[mid]; if(sb.DARK_MAPS.has(mid)) r.dark = sb.DARK_MAPS.get(mid); if(sb.TIDESPOUT_NODES[mid] === node.key) r.tideSpout = true;
      if(sb.VOLCANO_MAPS.has(mid)){ const k = node.kind || '', e = /boss/.test(k) ? 3 : /elite|champion|dungeon/.test(k) ? 2 : 0; if(e && r.eruption == null) r.eruption = e; }
      if(/boss|elite|champion/.test(node.kind || '') && !r.permaTide && ['water', 'reef', 'beach'].includes(biome)) r.highTide = true;
      if(r.hotMap == null && sb.EN6_HOT_BIOMES.has(biome)) r.hotMap = true; if(r.coldMap == null && sb.EN6_COLD_BIOMES.has(biome)) r.coldMap = true;
      if(r.saltMap == null && sb.EN6_SALT_BIOMES.has(biome)) r.saltMap = true; if(r.weatherMap == null && sb.EN6_WEATHER_BIOMES.has(biome)) r.weatherMap = true;
      out.push({map: mid, key: node.key, biome, rules: r}); }); });
  return out;
}
function partField(){ const list = fights(), tot = {ur: 0}, perFight = []; FIELD_KEYS.forEach(k=> tot[k] = 0);
  list.forEach((f, i)=>{ const t = {ur: 0}; FIELD_KEYS.forEach(k=> t[k] = 0);
    for(let g = 0; g < PER; g++) play('field|' + f.map + '|' + f.key, g, f.rules, (engine, P, n)=>{ t.ur += n;
      if(engine.en6Hot()) t.heat += n; if(engine.en6Cold()) t.frost += n; if(engine.en6Rain()) t.rain += n; if(engine.en6Storm()) t.storm += n; if(engine.en6Fog()) t.fog += n;
      if(engine.en6Salt()) t.salt += n; if(engine.en6Drought()) t.drought += n; if(engine.en6HibernateCond()) t.hibernate += n; });
    Object.keys(t).forEach(k=> tot[k] += t[k]); perFight.push({map: f.map, key: f.key, biome: f.biome, ur: t.ur, on: FIELD_KEYS.filter(k=> t[k] > 0).reduce((o, k)=> (o[k] = r3(t[k] / Math.max(1, t.ur)), o), {})}); });
  const all = {}, home = {}, homeFights = {};
  FIELD_KEYS.forEach(k=>{ all[k] = r3(tot[k] / Math.max(1, tot.ur)); const hs = perFight.filter(p=> p.on[k] > 0); homeFights[k] = hs.length;
    const ur = hs.reduce((a, p)=> a + p.ur, 0), on = hs.reduce((a, p)=> a + p.on[k] * p.ur, 0); home[k] = r3(on / Math.max(1, ur)); });
  return {fights: list.length, perFight: PER, all, home, homeFights, maps: [...new Set(perFight.filter(p=> Object.keys(p.on).length).map(p=> p.map))].length, perFightRows: perFight};
}
function partSeason(){ const t = {ur: 0, spring: 0, summer: 0, autumn: 0, winter: 0, heat: 0, frost: 0, hib: 0};
  for(let g = 0; g < Math.round(G / 3); g++) play('season', g, {phase: 'cycle', seasons: true}, (engine, P, n)=>{ t.ur += n; const s = engine.en6Season(); if(s) t[s] += n; if(engine.en6Hot()) t.heat += n; if(engine.en6Cold()) t.frost += n; if(engine.en6HibernateCond()) t.hib += n; });
  const sh = k=> r3(t[k] / Math.max(1, t.ur)); return {games: Math.round(G / 3), spring: sh('spring'), summer: sh('summer'), autumn: sh('autumn'), winter: sh('winter'), heat: sh('heat'), frost: sh('frost'), hibernate: sh('hib')}; }
const t0 = Date.now();
const hand = partHand(), field = partField(), season = partSeason();
const out = {_about: 'tools/en6_state_uptime_2026_10_24.js: the share of unit-rounds (side 1\'s units on the board as combat starts) where each EN6 state holds. hand: random live band decks, CPU vs CPU. field: every conquest fight\'s rules (+ EN6\'s map flags), ' + PER + ' fights each; "all" over every fight, "home" over the fights where the state ever holds. season: rules.seasons on (3 rounds a season).',
  generated: '2026-10-24', seed: SEED, band: band.length, hand, field: Object.assign({}, field, {perFightRows: undefined}), season, seconds: Math.round((Date.now() - t0) / 1000)};
fs.writeFileSync(path.join(ROOT, 'docs', 'balance', 'en6-state-uptime-2026-10-24.json'), JSON.stringify(out, null, 1) + '\n');
console.log(JSON.stringify({hand, field: {fights: field.fights, maps: field.maps, all: field.all, home: field.home, homeFights: field.homeFights}, season, seconds: out.seconds}, null, 1));
