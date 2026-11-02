#!/usr/bin/env node
// 2026-11-02 (package BAL11, owner on BAL10-6: "Stealth being over-powered because bramble Health is low"): a skill's worth at the game's bramble
// Health against the measures' bramble Health. Every skill price in canonical/skill-costs.json was measured with both brambles at 30 Health
// (tools/skill_canon_2026_10_31.js, tools/bench/lib.js BRAMBLE 30), but a road fight halves the brambles (arena_app.js BRAMBLE_SCALE 0.5: your
// bramble is 30 x 0.5 = 15). A skill that hits the bramble itself (Stealth: every swing goes to the bramble) is worth more against 15.
// The paired test (the bench's design, run here on the engine directly so the bramble Health can be set): a test deck of 6 copies of the carrier
// and 14 random live band cards against 20 random band cards, both brambles at H, a field drawn from the conquest fights' rules (or the
// carrier's home maps' with --home), the Smart CPU both sides (aiAim), seats swapped every other fight. Each fight is played with the carrier
// as printed, without the skill, with +1 Health and with +1 Attack, on the same seeds. Worth = (as printed - without) / the stat yardstick
// (the +1 Health gain and a third of the +1 Attack gain, pooled over the carriers: a 3A + H point), at H = 15 and H = 30.
//   node tools/bal9/bramble_hp_2026_11_02.js --skill stealth [--cards a,b] [--games 400] [--hp 15,30] [--home]
//     -> docs/balance/bal11/bramble-hp-<skill>-2026-11-02.json
'use strict';
const fs = require('fs'), path = require('path'), vm = require('vm'), ROOT = path.join(__dirname, '..', '..');
const H = require(path.join(ROOT, 'tests', 'lib', 'harness.js')), E = H.Engine;
const argv = process.argv.slice(2), opt = (k, d)=>{ const i = argv.indexOf('--' + k); return i >= 0 && argv[i + 1] ? argv[i + 1] : d; };
const SKILL = opt('skill', 'stealth'), GAMES = +opt('games', 400), HPS = String(opt('hp', '15,30')).split(',').map(Number), HOME = argv.includes('--home');
const defs0 = H.loadCardDefs(), cards = JSON.parse(fs.readFileSync(path.join(ROOT, 'canonical', 'cards.json'), 'utf8')), CL = Array.isArray(cards) ? cards : cards.cards;
let kind = null; try{ const p = JSON.parse(fs.readFileSync(path.join(ROOT, 'docs', 'balance', 'bf6-plan-2026-10-21.json'), 'utf8')); kind = new Map((Array.isArray(p) ? p : p.rows || []).map(r=> [r.id, r.kind])); }catch(e){}
const band = CL.filter(c=> c.health != null && !c.easterEgg && !c.pool && defs0[c.id] && (kind ? kind.get(c.id) === 'band' : !c.token)).map(c=> c.id);
const carriers = (opt('cards', '') ? opt('cards').split(',') : CL.filter(c=> c.effects && c.effects[SKILL] && !c.test && !c.token && c.health != null && defs0[c.id]).map(c=> c.id));
// the variants as extra defs
const defs = Object.assign({}, defs0), VARS = ['as', 'no', 'h1', 'a1'];
carriers.forEach(id=>{ const d = defs0[id];
  defs[id + '~no'] = Object.assign({}, d, {id: id + '~no', effects: Object.fromEntries(Object.entries(d.effects || {}).filter(([k])=> k !== SKILL))});
  defs[id + '~h1'] = Object.assign({}, d, {id: id + '~h1', health: (d.health || 0) + 1});
  defs[id + '~a1'] = Object.assign({}, d, {id: id + '~a1', attack: (d.attack || 0) + 1}); });
const vid = (id, v)=> v === 'as' ? id : id + '~' + v;
// the fights' rules (tools/eng12_uptime_2026_10_28.js's builder)
function fights(){
  const src = fs.readFileSync(path.join(ROOT, 'arena_app.js'), 'utf8'), sb = {}; vm.createContext(sb);
  const grab = (a, b)=>{ const i = src.indexOf(a), j = src.indexOf(b, i); return src.slice(i, j); };
  vm.runInContext(grab('const CONQUEST_MAPS = [', 'const CONQUEST_MAPS_BASELINE').replace('const CONQUEST_MAPS =', 'CONQUEST_MAPS ='), sb);
  vm.runInContext(grab('const MAP_DAYNIGHT = {', 'function mapDayNight').replace('const MAP_DAYNIGHT =', 'MAP_DAYNIGHT ='), sb);
  ['DARK_MAPS', 'WINDY_MAPS', 'MISTY_MAPS', 'RAPIDS_MAPS', 'MAP_BIOME_OF'].forEach(nm=>{ const i = src.indexOf('const ' + nm + ' ='), j = src.indexOf('\n', i); vm.runInContext(src.slice(i, j).replace('const ' + nm + ' =', nm + ' ='), sb); });
  const out = [];
  sb.CONQUEST_MAPS.forEach(m=>{ const mid = m.id, biome = sb.MAP_BIOME_OF[mid] || sb.MAP_BIOME_OF[m.parent], nodes = m.nodes || []; if(nodes.length >= 50) return;
    nodes.forEach(node=>{ if(/tutorial|raidboss/.test(node.kind || '')) return; const r = Object.assign({}, node.rules || {}); if(!r.phase) r.phase = sb.MAP_DAYNIGHT[mid] || 'cycle';
      if(sb.MISTY_MAPS.has(mid)) r.misty = true; if(r.misty || r.crushingDepths) r.phase = 'off'; if(sb.RAPIDS_MAPS.has(mid)){ r.permaTide = true; r.rapids = true; }
      if(['beach', 'water', 'reef'].includes(biome)) r.wet = true; if(sb.WINDY_MAPS[mid]) r.wind = sb.WINDY_MAPS[mid]; if(sb.DARK_MAPS.has(mid)) r.dark = sb.DARK_MAPS.get(mid);
      out.push({map: mid, parent: m.parent, rules: r}); }); });
  return out;
}
const ALL = fights(), pools = JSON.parse(fs.readFileSync(path.join(ROOT, 'canonical', 'map-pools.json'), 'utf8')).maps || {};
const homeMaps = id=>{ const out = new Set(); Object.entries(pools).forEach(([mid, e])=>{ if((e.cards || []).includes(id) || (e.special || []).includes(id)) out.add(mid);
  Object.entries(e.submaps || {}).forEach(([sid, l])=>{ if((Array.isArray(l) ? l : (l && l.cards) || []).includes(id)) out.add(sid); }); }); return out; };
function play(seed, deckT, seatT, hp, rules){
  const rng = H.seededRng(seed), deckO = {}; for(let n = 0; n < 20; n++){ const id = band[Math.floor(rng() * band.length)]; deckO[id] = (deckO[id] || 0) + 1; }
  const engine = E.makeSimEngine(defs, H.seededRng(seed ^ 0x9e3779b9), {battleMode: 'open', rules, aiAim: true, aiLevel: 1, recordEvents: false});
  const decks = seatT === 1 ? {1: deckT, 2: deckO} : {1: deckO, 2: deckT};
  const P = {1: engine.newPlayer(1, decks[1], {id: 'st-hq', health: hp, effects: {}}), 2: engine.newPlayer(2, decks[2], {id: 'st-hq', health: hp, effects: {}})}, stats = {};
  engine.draw(P[1], 3, 'A', stats, null); engine.draw(P[2], 3, 'B', stats, null);
  let over = false;
  for(let r = 1; r <= E.DRAW_ROUND_CAP && !over; r++){
    [1, 2].forEach(p=>{ P[p].playedThisTurn = false; P[p].discardUsedThisTurn = false; });
    if(r > 1) engine.roundStart(P, r, H.sideOf, stats, null);
    engine.aiTakeTurn(P, H.sideOf, 1, stats, null); engine.aiTakeTurn(P, H.sideOf, 2, stats, null);
    over = engine.resolveCombat(P, H.sideOf, stats, [], r % 2 === 0 ? 1 : 2);
    if(!over){ engine.draw(P[1], 1, 'A', stats, null); engine.draw(P[2], 1, 'B', stats, null); }
  }
  const a = P[1].hq.hp <= 0, b = P[2].hq.hp <= 0, w = !over || (a && b) ? 0 : (a ? 2 : 1);
  return w === 0 ? 0.5 : (w === seatT ? 1 : 0);
}
const t0 = Date.now(), res = {};
carriers.forEach(id=>{ const hm = homeMaps(id), fl = HOME ? ALL.filter(f=> hm.has(f.map)) : ALL; res[id] = {home: [...hm], fields: fl.length};
  HPS.forEach(hp=>{ const s = {as: 0, no: 0, h1: 0, a1: 0};
    for(let g = 0; g < GAMES; g++){ const seed = H.hashStr('bal11-bhp|' + SKILL + '|' + id + '|' + hp + '|' + g), rng = H.seededRng(seed ^ 77), rest = {};
      for(let n = 0; n < 14; n++){ const x = band[Math.floor(rng() * band.length)]; rest[x] = (rest[x] || 0) + 1; }
      const f = fl[Math.floor(rng() * fl.length)] || ALL[0];
      VARS.forEach(v=>{ const d = Object.assign({}, rest); d[vid(id, v)] = 6; s[v] += play(seed, d, g % 2 ? 2 : 1, hp, f.rules); }); }
    const p = k=> s[k] / GAMES; res[id][hp] = {as: p('as'), no: p('no'), h1: p('h1'), a1: p('a1'), skill: p('as') - p('no'), dH: p('h1') - p('as'), dA: p('a1') - p('as')}; });
  console.log(id, JSON.stringify(res[id])); });
// the pooled yardstick per H (a 3A + H point) and each carrier's worth
const out = {skill: SKILL, games: GAMES, hps: HPS, home: HOME, carriers: res, yardstick: {}, worth: {}};
HPS.forEach(hp=>{ const ys = carriers.map(id=> (res[id][hp].dH + res[id][hp].dA / 3) / 2), y = ys.reduce((t, x)=> t + x, 0) / Math.max(1, ys.length);
  out.yardstick[hp] = Math.round(y * 10000) / 10000; out.worth[hp] = {};
  carriers.forEach(id=> out.worth[hp][id] = y > 0 ? Math.round(res[id][hp].skill / y * 100) / 100 : null);
  out.worth[hp].mean = y > 0 ? Math.round(carriers.reduce((t, id)=> t + res[id][hp].skill, 0) / carriers.length / y * 100) / 100 : null; });
out.seconds = Math.round((Date.now() - t0) / 1000);
fs.mkdirSync(path.join(ROOT, 'docs', 'balance', 'bal11'), {recursive: true});
const file = path.join(ROOT, 'docs', 'balance', 'bal11', `bramble-hp-${SKILL}${HOME ? '-home' : ''}-2026-11-02.json`);
fs.writeFileSync(file, JSON.stringify(out, null, 1) + '\n'); console.log('yardstick', JSON.stringify(out.yardstick), 'worth', JSON.stringify(out.worth), out.seconds + 's ->', path.relative(ROOT, file));
