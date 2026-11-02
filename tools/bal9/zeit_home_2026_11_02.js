#!/usr/bin/env node
// 2026-11-02 (package BAL11, owner on BAL10-6: "a card with Nocturnal +4/+0 being too much"): the time-of-day uptime per map, and per card at
// home. ENG12 priced Nocturnal / Diurnal / Crepuscular at the share of unit-rounds over EVERY conquest fight (night 0.53, day 0.38;
// docs/balance/eng12-uptime-2026-10-28.json), but a time-of-day card is played mostly on the maps it is won on, and some of those are always
// night (the dark caves, the Mycelium Deep) or always day. This plays tools/eng12_uptime_2026_10_28.js's measure per map (the same fights'
// rules, PER CPU fights of random live band decks each, side 1's unit-rounds by the engine's zeitPhase) and gives each time-of-day card its
// home share: the mean over its home maps (the maps whose list, side-map list or SPECIAL tier holds it, else the map it is first obtainable
// on; canonical/map-pools.json, canonical/card-obtain-maps.json). bramblewood-budget.js zeitS mixes it with the all-fights share
// (ZEIT_HOME_WEIGHT, as EN6 did for Hibernate: 0.47 = half its all-fights 0.08 and half its home 0.86).
//   node tools/bal9/zeit_home_2026_11_02.js [--per 6] [--seed 1] [--write]   -> docs/balance/bal11/zeit-home-2026-11-02.json
//   (--write also puts the per-card home shares into canonical/skill-costs.json "zeitHome", which tools/skill_costs.js hands to zeitS)
'use strict';
const fs = require('fs'), path = require('path'), vm = require('vm'), ROOT = path.join(__dirname, '..', '..');
const H = require(path.join(ROOT, 'tests', 'lib', 'harness.js')), E = H.Engine;
const argv = process.argv.slice(2), opt = (k, d)=>{ const i = argv.indexOf('--' + k); return i >= 0 && argv[i + 1] ? argv[i + 1] : d; };
const PER = Math.max(1, +opt('per', 6) || 6), SEED = +opt('seed', 1) || 1;
const defs = H.loadCardDefs(), cards = JSON.parse(fs.readFileSync(path.join(ROOT, 'canonical', 'cards.json'), 'utf8'));
const CL = Array.isArray(cards) ? cards : cards.cards;
let kind = null; try{ const p = JSON.parse(fs.readFileSync(path.join(ROOT, 'docs', 'balance', 'bf6-plan-2026-10-21.json'), 'utf8')); kind = new Map((Array.isArray(p) ? p : p.rows || []).map(r=> [r.id, r.kind])); }catch(e){}
const band = CL.filter(c=> c.health != null && !c.easterEgg && !c.pool && defs[c.id] && (kind ? kind.get(c.id) === 'band' : !c.token));
const BRAMBLE = 35, r3 = v=> Math.round(v * 1000) / 1000;
function deckOf(rng){ const d = {}; for(let n = 0; n < 20; n++){ const c = band[Math.floor(rng() * band.length)]; d[c.id] = (d[c.id] || 0) + 1; } return d; }
function play(tag, g, rules, onRound){
  const seed = H.hashStr('bal11-zeit|' + SEED + '|' + tag + '|' + g), rng = H.seededRng(seed);
  const engine = E.makeSimEngine(defs, H.seededRng(seed ^ 0x9e3779b9), {battleMode: 'open', rules, aiAim: true, aiLevel: 1, recordEvents: false});
  const P = {1: engine.newPlayer(1, deckOf(rng), {id: 'st-hq', health: BRAMBLE, effects: {}}), 2: engine.newPlayer(2, deckOf(rng), {id: 'st-hq', health: BRAMBLE, effects: {}})}, stats = {};
  engine.draw(P[1], 3, 'A', stats, null); engine.draw(P[2], 3, 'B', stats, null);
  for(let r = 1; r <= E.DRAW_ROUND_CAP; r++){
    [1, 2].forEach(p=>{ P[p].playedThisTurn = false; P[p].discardUsedThisTurn = false; });
    if(r > 1) engine.roundStart(P, r, H.sideOf, stats, null);
    engine.aiTakeTurn(P, H.sideOf, 1, stats, null); engine.aiTakeTurn(P, H.sideOf, 2, stats, null);
    const n1 = engine.allBoardCards(P[1]).filter(c=> c && c.hp > 0 && !c.gap).length;
    const over = engine.resolveCombat(P, H.sideOf, stats, [], r % 2 === 0 ? 1 : 2);
    onRound(engine, n1); if(over) break;
    engine.draw(P[1], 1, 'A', stats, null); engine.draw(P[2], 1, 'B', stats, null);
  }
}
// the conquest fights' rules, as tools/eng12_uptime_2026_10_28.js builds them
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
      out.push({map: mid, key: node.key, rules: r}); }); });
  return out;
}
const t0 = Date.now(), perMap = {};
fights().forEach(f=>{ const t = perMap[f.map] = perMap[f.map] || {ur: 0, day: 0, dayDim: 0, night: 0, twilight: 0, fights: 0}; t.fights++;
  for(let g = 0; g < PER; g++) play(f.map + '|' + f.key, g, f.rules, (engine, n1)=>{ t.ur += n1; const ph = engine.zeitPhase();
    if(ph === 'day'){ t.day += n1; if(f.rules.cloudy || f.rules.ashRain) t.dayDim += n1; } else if(ph === 'night') t.night += n1; else if(ph === 'twilight') t.twilight += n1; }); });
const maps = {}; Object.entries(perMap).forEach(([id, t])=>{ const s = k=> r3(t[k] / Math.max(1, t.ur));
  maps[id] = {fights: t.fights, unitRounds: t.ur, night: r3(s('night') + s('twilight')), day: r3(s('day') + s('twilight') - s('dayDim') / 2)}; });
// each time-of-day card's home maps
const pools = JSON.parse(fs.readFileSync(path.join(ROOT, 'canonical', 'map-pools.json'), 'utf8')).maps || {};
let obtain = {}; try{ obtain = JSON.parse(fs.readFileSync(path.join(ROOT, 'canonical', 'card-obtain-maps.json'), 'utf8')).maps || {}; }catch(e){}
const homeOf = id=>{ const out = new Set();
  Object.entries(pools).forEach(([mid, e])=>{ if((e.cards || []).includes(id) || (e.special || []).includes(id)) out.add(mid);
    Object.entries(e.submaps || {}).forEach(([sid, l])=>{ const list = Array.isArray(l) ? l : (l && l.cards) || []; if(list.includes(id)) out.add(sid); }); });
  return [...out].filter(m=> maps[m]); };
// the keys that read the time of day: the bonuses (Nocturnal, Diurnal and their braces) and the drawbacks (Nightblind at night, Sunshy by day)
const KEYS = {nocturnal: 'night', nocturnalGrant: 'night', nightblind: 'night', diurnal: 'day', diurnalGrant: 'day', sunshy: 'day'}, zeitHome = {}, perCard = [];
CL.forEach(c=>{ const e = c.effects || {}; const ph = [...new Set(Object.keys(KEYS).filter(k=> e[k]).map(k=> KEYS[k]))]; if(!ph.length) return; const home = homeOf(c.id); if(!home.length) return;
  ph.forEach(p=>{ const share = r3(home.reduce((t, m)=> t + maps[m][p], 0) / home.length); (zeitHome[c.id] = zeitHome[c.id] || {})[p] = share;
    perCard.push({id: c.id, phase: p, keys: Object.keys(KEYS).filter(k=> e[k] && KEYS[k] === p), home, share}); }); });
const out = {_about: 'tools/bal9/zeit_home_2026_11_02.js (package BAL11): the time-of-day share per map (side 1\'s unit-rounds by the engine\'s zeitPhase, night = night + Twilight, day = day + Twilight - half the dim days, as ENG12 counts them) over each map\'s fights x ' + PER + ' CPU fights of random live band decks; per time-of-day card the mean over its home maps (lists, side-map lists, SPECIAL).',
  generated: '2026-11-02', seed: SEED, per: PER, maps, cards: perCard, seconds: Math.round((Date.now() - t0) / 1000)};
fs.mkdirSync(path.join(ROOT, 'docs', 'balance', 'bal11'), {recursive: true});
fs.writeFileSync(path.join(ROOT, 'docs', 'balance', 'bal11', 'zeit-home-2026-11-02.json'), JSON.stringify(out, null, 1) + '\n');
if(argv.includes('--write')){ const f = path.join(ROOT, 'canonical', 'skill-costs.json'); let s = fs.readFileSync(f, 'utf8');
  const v = Object.assign({_about: '2026-11-02 (package BAL11): each time-of-day card\'s share of unit-rounds in its phase on its home maps (tools/bal9/zeit_home_2026_11_02.js, docs/balance/bal11/zeit-home-2026-11-02.json); bramblewood-budget.js zeitS mixes it with the all-fights share (ZEIT_HOME_WEIGHT).'}, zeitHome);
  const line = ' "zeitHome": ' + JSON.stringify(v); // the file's own layout: one line per top-level key
  s = /\n "zeitHome": .*\n/.test(s) ? s.replace(/\n "zeitHome": .*\n/, '\n' + line + '\n') : s.replace(/\n}\s*$/, ',\n' + line + '\n}\n');
  JSON.parse(s); fs.writeFileSync(f, s); }
console.log(Object.entries(maps).map(([id, m])=> `${id} night ${m.night} day ${m.day}`).join('\n')); console.log(perCard.map(c=> `${c.id} ${c.phase} (${c.keys.join(',')}) home ${c.home.join(',')} ${c.share}`).join('\n'));
