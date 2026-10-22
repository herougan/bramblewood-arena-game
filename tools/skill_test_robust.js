#!/usr/bin/env node
// The robust skill test (2026-10-22, package ST; owner 18:20: "Program the more robust way of testing - lumber, wait, multi-skill all need to
// be taken in account. Field effects of various types need to be taken in to account, with the common ones like Day/Night, and Tide having
// 20% chance to exist. Then uncommon ones like darkness. The rest are super unlikely, but are nevertheless tested, e.g. at min. 20% a
// non-common one is added - reflects reality."). The standard test (tools/skill_test.js) stays as it is: 3/10s at one Wait and Lumber, the
// plain field. This one measures a skill in the economy it lives in:
//   units      every unit of both decks draws its own profile (rarity, Wait 0-3, Lumber 0-3) from the live band cards' joint mix
//              (docs/balance/bf6-plan-2026-10-21.json kind 'band', Wait and Lumber 4+ folded into 3), and its stats from the budget
//              (bramblewood-budget.js through tools/skill_costs.js, Level 1): stat points q = (N / f − S) / m, the skill's S priced in, split on
//              the owner's 3/10 shape (Attack 3/16 of the points), stochastic rounding, then cap 2 (Attack moves to Health until it holds).
//              The vanilla control is the same profiles with no skill (N × the plain bonus, as the budget gives it).
//   enemy      the standard enemy scaled the same way: its own profiles, --foe-ratio (0.8, see FOE_RATIO) of a vanilla unit's points on the
//              4/11 shape, no skills, and
//              each turn its bramble gives one random creature of its own +1/+0 or +0/+1. Brambles 35 Health, no abilities.
//   fields     each fight rolls its own field (FIELD_CONFIG below): the common ones (Day/Night, Tide) 20% each, every uncommon one 2%, every
//              rare one 0.2%, and 20% of fights are given one more non-common field on top (uncommon 3× as likely as rare). With no
//              Day/Night it is phase 'off' (no day, no night). The classes come from the maps' real use (--census; docs/balance/field-
//              census-2026-10-22.json): uncommon = 2.5% of map fights or more, or named by the owner (darkness, rain, fog).
//   modes      --mono: each unit carries the skill (+ its enabler); --duo: each pair; --multi: each unit carries the skill and 0-2
//              companions (1-3 skills in all, the live band cards' skill-count mix; companions drawn by how many live cards print them,
//              at their typical value), measured with and without the skill (same units, same companions, stats re-priced) for its
//              marginal worth. Modes combine (--mono --multi).
//   worth      the isotonic invert of tools/skill_worth.js on the vanilla deck + ΔH / + ΔA curves (every unit + d), S = (ΔH + 2ΔA) / 2,
//              relative to the vanilla reading; that is the deck's net gain in stat points (the "net": positive = the skill is worth more
//              than the stats the budget takes for it, i.e. under-priced). worth = net + the stat points the units gave up for it (the
//              "paid"); per field condition the same with the curves and the vanilla deck read on the same fights (common random numbers:
//              every setup plays the same seeds, profiles, roundings and fields).
//
//   node tools/skill_test_robust.js --mono|--duo|--multi [--games 10000] [--seed 1] [--jobs 2] [--skills quick,armor=1/2] [--curve-games N]
//        [--level 1] [--foe-ratio 0.8] [--quick] [--out docs/balance/skill-test-robust-<modes>-<date>.json] [--no-out]
//   node tools/skill_test_robust.js --census      the field-effect use on the conquest maps (classes for FIELD_CONFIG), written to docs/balance
//   --quick   a smoke size: 300 games a setup, 120 a curve point, a short curve grid; --skills defaults to quick,armor,nocturnal
'use strict';
const fs = require('fs'), path = require('path');
const ROOT = path.join(__dirname, '..');
const H = require(path.join(ROOT, 'tests', 'lib', 'harness.js')), E = H.Engine;
const SW = require('./skill_worth.js'), SC = require('./skill_costs.js'), BB = require(path.join(ROOT, 'bramblewood-budget.js'));
let WT = null; try{ WT = require('worker_threads'); }catch(e){ WT = null; }

// ---------------------------------------------------------------------------------------------------------------------------
// The field roll: every probability in one place. Shares in the comments are the conquest maps' fights (--census, 267 fights, the four
// 50-floor climbs left out). A field is {class, slot?, variants: [{w, rules, tag?}]}; a slot holds one field (the engine's single
// rules.field, one Lumber rule, one darkness).
// ---------------------------------------------------------------------------------------------------------------------------
const FIELD_CONFIG = {
  absentPhase: 'off',          // no Day/Night rolled: no day and no night (the owner: Day/Night "20% chance to exist")
  p: {common: 0.20, uncommon: 0.02, rare: 0.002},  // each field on its own, every fight
  forceNonCommon: 0.20,        // and this share of fights gets one more non-common field (owner: "at min. 20% a non-common one is added")
  forceWeight: {uncommon: 3, rare: 1}, // the added one: each uncommon field 3× as likely as each rare one
};
const FIELDS = {
  // common (owner): 20% each
  daynight:   {class:'common', variants:[{w:205, rules:{phase:'cycle'}, tag:'cycle'}, {w:15, rules:{phase:'night'}, tag:'night'}]}, // cycle 76.8% of map fights, all-night 5.6%
  tide:       {class:'common', variants:[{w:21, rules:{tide:true}}, {w:5, rules:{permaTide:true, rapids:true}, tag:'rapids'}]},   // Tide 7.9%, River Rapids 1.9%
  // uncommon: 2.5%+ of map fights, or named by the owner
  dark:       {class:'uncommon', slot:'dark', variants:[{w:17, rules:{dark:'dark'}}, {w:5, rules:{dark:'pitch'}, tag:'pitch'}]}, // 6.4% + 1.9% (owner-named)
  rain:       {class:'uncommon', slot:'field', variants:[{w:1, rules:{field:'rain'}}]},        // no map yet (owner-named)
  fog:        {class:'uncommon', slot:'field', variants:[{w:1, rules:{field:'fog'}}]},         // no map yet, the Hallow's Eve portent (owner-named)
  wet:        {class:'uncommon', variants:[{w:1, rules:{wet:true}}]},                          // 14.2% (beach, river and sea maps)
  wind:       {class:'uncommon', variants:[{w:31, rules:{wind:'windy'}}, {w:15, rules:{wind:'gale'}, tag:'gale'}]}, // 11.6% + 5.6%
  scorching:  {class:'uncommon', slot:'field', variants:[{w:8, rules:{field:'heatwave', heatLevel:1}}, {w:6, rules:{field:'heatwave', heatLevel:2}, tag:'II'}, {w:6, rules:{field:'heatwave', heatLevel:3}, tag:'III'}]}, // 7.5%
  eruption:   {class:'uncommon', variants:[{w:1, rules:{eruption:2}}]},                        // 6.7% (the volcano maps' big fights)
  swampFever: {class:'uncommon', variants:[{w:10, rules:{swampFever:50}}, {w:4, rules:{swampFever:25}, tag:'25'}]}, // 5.2%
  highTide:   {class:'uncommon', variants:[{w:1, rules:{highTide:true}}]},                     // 4.9% (boss and elite fights on the water maps)
  sandstorm:  {class:'uncommon', variants:[{w:1, rules:{sandstorm:true}}]},                    // 3.7%
  canopy:     {class:'uncommon', variants:[{w:8, rules:{canopy:true}}, {w:7, rules:{undergrowth:true}, tag:'undergrowth'}]}, // 3.0% + 2.6%
  firstBlood: {class:'uncommon', variants:[{w:1, rules:{firstBlood:1}}]},                      // 3.0%
  arrowSlits: {class:'uncommon', variants:[{w:1, rules:{arrowSlits:true}}]},                   // 2.6%
  // rare: everything else the engine runs as a field (fieldHazardRules, the FIELDS fields, the rules flags of the Edit-skirmish list)
  lavaSpout:{class:'rare', variants:[{w:1, rules:{lavaSpout:true}}]}, crushingDepths:{class:'rare', variants:[{w:1, rules:{crushingDepths:true}}]},
  mirage:{class:'rare', variants:[{w:1, rules:{mirage:true}}]}, hail:{class:'rare', variants:[{w:1, rules:{hail:true}}]},
  freezing:{class:'rare', variants:[{w:1, rules:{freezing:true, frostbite:1, frostResist:['Tundra', 'Frost', 'Taiga']}}]},
  frigid:{class:'rare', slot:'field', variants:[{w:1, rules:{field:'frozen'}}]}, moon:{class:'rare', slot:'field', variants:[{w:1, rules:{field:'moon'}}]},
  landslide:{class:'rare', variants:[{w:1, rules:{landslide:true}}]}, ashRain:{class:'rare', variants:[{w:1, rules:{ashRain:true}}]},
  ashy:{class:'rare', variants:[{w:1, rules:{ashy:true}}]}, sulphurFumes:{class:'rare', variants:[{w:1, rules:{sulphurFumes:true}}]},
  sporeCloud:{class:'rare', variants:[{w:1, rules:{sporeCloud:true}}]}, tangledRoots:{class:'rare', variants:[{w:1, rules:{tangledRoots:true}}]},
  thunderstorm:{class:'rare', variants:[{w:1, rules:{thunderstorm:true}}]}, tallGrass:{class:'rare', variants:[{w:1, rules:{tallGrass:true}}]},
  slippery:{class:'rare', variants:[{w:1, rules:{slippery:25}}]}, volcano:{class:'rare', variants:[{w:1, rules:{volcano:'low'}}]},
  tideSpout:{class:'rare', variants:[{w:1, rules:{tideSpout:true}}]}, rookRow:{class:'rare', variants:[{w:1, rules:{rookRow:true}}]},
  bishopPath:{class:'rare', variants:[{w:1, rules:{bishopPath:true}}]}, consternation:{class:'rare', variants:[{w:1, rules:{consternation:true}}]},
  glassStorm:{class:'rare', variants:[{w:1, rules:{glassStorm:true}}]}, quietContemplation:{class:'rare', variants:[{w:1, rules:{quietContemplation:true}}]},
  leylines:{class:'rare', variants:[{w:1, rules:{leylines1:true}, tag:'I'}, {w:1, rules:{leylines2:true}, tag:'II'}, {w:1, rules:{leylines3:true}, tag:'III'}]},
  haunted:{class:'rare', variants:[{w:1, rules:{haunted:true}}]}, psychicDampener:{class:'rare', variants:[{w:1, rules:{psychicDampener:true}}]},
  awash:{class:'rare', variants:[{w:1, rules:{awash:true}}]}, cloudy:{class:'rare', variants:[{w:1, rules:{cloudy:true}}]},
  lumber:{class:'rare', slot:'lumber', variants:[{w:1, rules:{lumberEvery:3}, tag:'timber'}, {w:1, rules:{lumberEvery:2}, tag:'rush'}]},
  doubleTime:{class:'rare', variants:[{w:1, rules:{actions:2}}]},
};
const FIELD_IDS = Object.keys(FIELDS), NONCOMMON = FIELD_IDS.filter(k=> FIELDS[k].class !== 'common');

const UNIT_SHAPE = {attack:3, health:10}, FOE_SHAPE = {attack:4, health:11}, BRAMBLE = 35, DECK = 20, DECAP = 3;
const r2 = v=> Math.round(v * 100) / 100, r3 = v=> Math.round(v * 1000) / 1000;
// FOE_RATIO: the enemy unit's stat points over a vanilla unit's at the same profile. The owner's 4/11 over 3/10 is 19/16, but with the
// bramble's buff every turn the vanilla deck then wins about 0% (as the standard test found, CHANGELOG MT), even at 1.0 only ~5%, and a
// deck that never wins can't show a skill's worth. 0.8 puts the vanilla deck near 40% (600 games, seed 1). --foe-ratio 1.1875 is the owner's.
let SEED = 1, LEVEL = 1, FOE_RATIO = 0.8;
const seedOf = g=> H.hashStr('skill-test-robust|' + SEED + '|' + g);
const stream = (g, tag)=> H.seededRng((seedOf(g) ^ H.hashStr(tag)) >>> 0);
const pickW = (rng, list, wf)=>{ const tot = list.reduce((s, x)=> s + wf(x), 0); let u = rng() * tot; for(const x of list){ u -= wf(x); if(u < 0) return x; } return list[list.length - 1]; };

// One fight's field: {rules, ids: [field id or id:tag ...]}.
function rollField(g){
  const rng = stream(g, 'field'), on = [], slots = {}, rules = {};
  const take = id=>{ const f = FIELDS[id]; if(on.includes(id) || (f.slot && slots[f.slot])) return false; on.push(id); if(f.slot) slots[f.slot] = id; return true; };
  FIELD_IDS.forEach(id=>{ if(rng() < FIELD_CONFIG.p[FIELDS[id].class]) take(id); });
  if(rng() < FIELD_CONFIG.forceNonCommon){ const free = NONCOMMON.filter(id=> !on.includes(id) && !(FIELDS[id].slot && slots[FIELDS[id].slot]));
    if(free.length) take(pickW(rng, free, id=> FIELD_CONFIG.forceWeight[FIELDS[id].class])); }
  const ids = [];
  on.forEach(id=>{ const v = pickW(rng, FIELDS[id].variants, x=> x.w); Object.assign(rules, v.rules); ids.push(id); if(v.tag) ids.push(id + ':' + v.tag); });
  if(!rules.phase) rules.phase = FIELD_CONFIG.absentPhase;
  return {rules, ids};
}

// ---------------------------------------------------------------------------------------------------------------------------
// The live mix: band cards' (rarity, Wait, Lumber) and skill counts; companions by how many live cards print each skill.
// ---------------------------------------------------------------------------------------------------------------------------
function bandCards(){
  const cards = JSON.parse(fs.readFileSync(path.join(ROOT, 'canonical', 'cards.json'), 'utf8'));
  let kind = null; try{ const p = JSON.parse(fs.readFileSync(path.join(ROOT, 'docs', 'balance', 'bf6-plan-2026-10-21.json'), 'utf8')); kind = new Map((Array.isArray(p) ? p : p.rows || []).map(r=> [r.id, r.kind])); }catch(e){ kind = null; }
  return cards.filter(c=> c.health != null && !c.easterEgg && !c.pool && (kind ? kind.get(c.id) === 'band' : (!c.test && !c.token && !c.field && !c.hallOfFame)));
}
function liveMix(){
  const band = bandCards(), prof = {}, counts = {1:0, 2:0, 3:0};
  band.forEach(c=>{ const k = [c.rarity || 'common', Math.min(DECAP, c.wait || 0), Math.min(DECAP, c.cost || 0)].join('|'); prof[k] = (prof[k] || 0) + 1;
    const n = BB.skillCountOf(c.effects || {}); if(n > 0) counts[Math.min(3, n)]++; });
  const profiles = Object.keys(prof).sort().map(k=>{ const [rarity, wait, cost] = k.split('|'); return {rarity, wait: +wait, cost: +cost, w: prof[k]}; });
  return {band: band.length, profiles, skillCounts: counts};
}

// ---------------------------------------------------------------------------------------------------------------------------
// Units. A row is {key, label, kind, unit: spec}; spec = {effects} (every unit the same skills), {companions: true, x, xOn} (multi), or
// {dh, da} (a curve point on the vanilla units). Stats come from the budget at each unit's profile.
// ---------------------------------------------------------------------------------------------------------------------------
function makeCtx(defs, table, mix, set, pool){
  const T = SC.make(table), qMemo = {};
  // the exact stat points the budget gives a unit with these effects at this profile: {q, S, m, f, N}
  function priced(effects, p){ const key = JSON.stringify(effects) + '|' + p.rarity + '|' + p.wait + '|' + p.cost; if(qMemo[key]) return qMemo[key];
    const d = {id: 'st-probe', rarity: p.rarity, wait: p.wait, cost: p.cost, effects}; let S = 0; try{ S = +T.cardS(effects, d).S || 0; }catch(e){ S = 0; }
    const N = T.budgetN(d, LEVEL), m = BB.missMultOf(effects, table.budget), f = BB.fragileUseOf(effects, table.budget);
    return (qMemo[key] = {q: (N / f - S) / m, S, m, f, N}); }
  // stats from points q on a shape, with the two uniform draws for the rounding; cap 2 moves Attack to Health until it holds
  function statsOf(pr, shape, u1, u2, capCheck){ const q = Math.max(1, pr.q), sh = shape.attack / (2 * shape.attack + shape.health);
    let A = Math.max(0, Math.floor(q * sh + u1)), Hh = Math.max(1, Math.floor(q - 2 * A + u2)), squeezed = pr.q < 1;
    if(capCheck){ const room = (pr.N / 3) * (pr.N / 3); while(A > 0 && pr.f * (A * Hh * pr.m + pr.S * Math.abs(pr.S)) > room + 1e-9){ A--; Hh += 2; squeezed = true; } }
    return {A, H: Hh, squeezed}; }
  function defOf(fx, A, Hh, p, rarity){ const id = 'str-' + H.hashStr(JSON.stringify([fx, A, Hh, p.wait, p.cost, rarity])).toString(36);
    if(!defs[id]) defs[id] = {id, name: id, icon: '🧪', cost: p.cost, wait: p.wait, attack: A, health: Hh, rarity, effects: JSON.parse(JSON.stringify(fx)), test: true};
    return id; }
  const profAt = rng=> pickW(rng, mix.profiles, x=> x.w), cnts = [1, 2, 3].map(k=> ({k, w: mix.skillCounts[k] || 0}));
  // one side's 20 units for row `row` in game g: {deck, pts, paid, S, squeezed}; side 'T' (test) or 'X' (the standard enemy)
  function deckFor(row, g){ const rp = stream(g, 'test-units'), deck = {}; let pts = 0, qx = 0, S = 0, sq = 0;
    const cr = row.unit.companions ? stream(g, 'companions|' + row.unit.x) : null;
    for(let i = 0; i < DECK; i++){ const p = profAt(rp), u1 = rp(), u2 = rp(); let fx = {}, da = 0, dh = 0;
      if(row.unit.effects) fx = row.unit.effects;
      else if(row.unit.companions){ const k = pickW(cr, cnts, x=> x.w).k, comp = [], cand = pool.filter(c=> c.id !== row.unit.x);
        while(comp.length < k - 1 && comp.length < cand.length){ const c = pickW(cr, cand.filter(z=> !comp.includes(z)), z=> z.w); comp.push(c); }
        fx = Object.assign({}, ...comp.map(c=> c.fx), row.unit.xOn ? row.unit.xFx : {}); }
      else { da = row.unit.da || 0; dh = row.unit.dh || 0; }
      const pr = priced(fx, p), st = statsOf(pr, UNIT_SHAPE, u1, u2, true), A = Math.max(0, st.A + da), Hh = Math.max(1, st.H + dh);
      const id = defOf(fx, A, Hh, p, row.unit.legendary ? 'legendary' : p.rarity); deck[id] = (deck[id] || 0) + 1;
      pts += 2 * A + Hh; qx += pr.q; S += pr.S; if(st.squeezed) sq++; }
    return {deck, pts: pts / DECK, q: qx / DECK, S: S / DECK, squeezed: sq}; }
  function foeFor(g){ const rp = stream(g, 'foe-units'), deck = {}, k = FOE_RATIO;
    for(let i = 0; i < DECK; i++){ const p = profAt(rp), u1 = rp(), u2 = rp(), pr = priced({}, p), st = statsOf({q: pr.q * k}, FOE_SHAPE, u1, u2, false);
      const id = 'strf-' + [st.A, st.H, p.wait, p.cost].join('-'); if(!defs[id]) defs[id] = {id, name: 'Standard enemy', icon: '🧱', cost: p.cost, wait: p.wait, attack: st.A, health: st.H, rarity: p.rarity, effects: {}, test: true};
      deck[id] = (deck[id] || 0) + 1; }
    return deck; }
  return {priced, statsOf, deckFor, foeFor, trim: ()=>{ if(Object.keys(qMemo).length > 100000) Object.keys(qMemo).forEach(k=> delete qMemo[k]); }};
}

// One fight; the test deck sits in seat 1 on even games and seat 2 on odd ones (tools/skill_test.js's loop, with the field's rules).
function playGame(defs, testDeck, foeDeck, g, rules){
  const seed = seedOf(g), engine = E.makeSimEngine(defs, H.seededRng(seed), {battleMode:'open', rules, aiAim:true, aiLevel:1});
  const buff = H.seededRng((seed ^ 0x5bd1e995) >>> 0), T = g % 2 === 0 ? 1 : 2, X = 3 - T, stats = {}, sideOf = H.sideOf;
  const P = {}; P[T] = engine.newPlayer(T, testDeck, {id:'st-hq', health:BRAMBLE, effects:{}}); P[X] = engine.newPlayer(X, foeDeck, {id:'st-hq', health:BRAMBLE, effects:{}});
  engine.draw(P[1], 3, 'A', stats, null); engine.draw(P[2], 3, 'B', stats, null);
  let r = 1, over = false, last = null, st = 0;
  for(; r <= E.DRAW_ROUND_CAP && !over; r++){
    engine.setSuddenDeath(r >= E.SUDDEN_DEATH_ROUND, r >= E.SUDDEN_DEATH_CASTLE_ROUND ? 2 : 1);
    [1, 2].forEach(p=>{ P[p].playedThisTurn = false; P[p].discardUsedThisTurn = false; });
    if(r > 1) engine.roundStart(P, r, sideOf, stats, null);
    engine.aiTakeTurn(P, sideOf, 1, stats, null); engine.aiTakeTurn(P, sideOf, 2, stats, null);
    { const mine = engine.allBoardCards(P[X]).filter(c=> c.hp > 0 && !c.cageOf);
      if(mine.length){ const c = mine[Math.floor(buff() * mine.length)]; if(buff() < 0.5){ c.atk += 1; c.baseAtk += 1; } else { c.hp += 1; c.maxHp += 1; } } }
    over = engine.resolveCombat(P, sideOf, stats, null, r % 2 === 0 ? 1 : 2); if(over) break;
    const s = E.boardSignature(P); st = (s === last && E.noActionsLeft(P)) ? st + 1 : 0; last = s; if(st >= 2 && r >= E.STALL_DRAW_FROM_ROUND) break;
    engine.draw(P[1], 1, 'A', stats, null); engine.draw(P[2], 1, 'B', stats, null);
  }
  const a = P[T].hq.hp <= 0, b = P[X].hq.hp <= 0;
  return over && b && !a ? 1 : over && a && !b ? -1 : 0;
}

function runChunk(defs, ctx, row, g0, g1){
  const out = {key: row.key, w: 0, l: 0, d: 0, n: 0, pts: 0, q: 0, S: 0, squeezed: 0, by: {}};
  for(let g = g0; g < g1; g++){ const f = rollField(g), t = ctx.deckFor(row, g), res = playGame(defs, t.deck, ctx.foeFor(g), g, f.rules);
    const k = res > 0 ? 'w' : res < 0 ? 'l' : 'd'; out[k]++; out.n++; out.pts += t.pts; out.q += t.q; out.S += t.S; out.squeezed += t.squeezed;
    const conds = f.ids.length ? f.ids.concat(f.ids.some(id=> FIELDS[id] && FIELDS[id].class === 'rare') ? ['any-rare'] : []) : ['none'];
    if(f.ids.some(id=> FIELDS[id] && FIELDS[id].class !== 'common')) conds.push('any-noncommon');
    if(!f.ids.includes('daynight')) conds.push('no-daynight');
    conds.forEach(c=>{ const b = out.by[c] || (out.by[c] = [0, 0, 0, 0]); b[k === 'w' ? 0 : k === 'l' ? 1 : 2]++; b[3]++; }); }
  // the test units made for this chunk go again (a full sweep would otherwise keep every one of them in memory)
  Object.keys(defs).forEach(id=>{ if(id.startsWith('str-')) delete defs[id]; }); ctx.trim();
  return out; }

// ---------------------------------------------------------------------------------------------------------------------------
// The census: how often the conquest maps' fights carry each field (fightRules' map-level rules + each node's own rules).
// ---------------------------------------------------------------------------------------------------------------------------
function census(){
  const vm = require('vm'), src = fs.readFileSync(path.join(ROOT, 'arena_app.js'), 'utf8'), sb = {}; vm.createContext(sb);
  const grab = (a, b)=>{ const i = src.indexOf(a), j = src.indexOf(b, i); if(i < 0 || j < 0) throw new Error('census: not found ' + a); return src.slice(i, j); };
  vm.runInContext(grab('const CONQUEST_MAPS = [', 'const CONQUEST_MAPS_BASELINE').replace('const CONQUEST_MAPS =', 'CONQUEST_MAPS ='), sb);
  vm.runInContext(grab('const MAP_DAYNIGHT = {', 'function mapDayNight').replace('const MAP_DAYNIGHT =', 'MAP_DAYNIGHT ='), sb);
  ['DARK_MAPS', 'WINDY_MAPS', 'VOLCANO_MAPS', 'MISTY_MAPS', 'RAPIDS_MAPS', 'MAP_BIOME_OF', 'TIDESPOUT_NODES'].forEach(nm=>{ const i = src.indexOf('const ' + nm + ' ='), j = src.indexOf('\n', i);
    vm.runInContext(src.slice(i, j).replace('const ' + nm + ' =', nm + ' ='), sb); });
  const cnt = {}; let n = 0, climbs = [];
  sb.CONQUEST_MAPS.forEach(m=>{ const mid = m.id, biome = sb.MAP_BIOME_OF[mid] || sb.MAP_BIOME_OF[m.parent], nodes = m.nodes || []; if(nodes.length >= 50){ climbs.push(mid); return; }
    nodes.forEach(node=>{ n++; const r = Object.assign({}, node.rules || {}); if(!r.phase) r.phase = sb.MAP_DAYNIGHT[mid] || 'cycle';
      if(sb.MISTY_MAPS.has(mid)) r.misty = true; if(r.misty || r.crushingDepths) r.phase = 'off';
      if(sb.RAPIDS_MAPS.has(mid)) r.permaTide = true; if(['beach', 'water', 'reef'].includes(biome)) r.wet = true;
      if(sb.WINDY_MAPS[mid]) r.wind = sb.WINDY_MAPS[mid]; if(sb.DARK_MAPS.has(mid)) r.dark = sb.DARK_MAPS.get(mid); if(sb.TIDESPOUT_NODES[mid] === node.key) r.tideSpout = true;
      if(sb.VOLCANO_MAPS.has(mid)){ const k = node.kind || '', e = k === 'worldboss' ? 5 : /boss/.test(k) ? 3 : /elite|champion|dungeon/.test(k) ? 2 : 0; if(e) r.eruption = e; }
      if(/boss|elite|champion/.test(node.kind || '') && !r.permaTide && ['water', 'reef', 'beach'].includes(biome)) r.highTide = true; // MAP_MUSIC water maps, by biome
      Object.keys(r).forEach(k=>{ const v = r[k]; if(v == null || v === false || v === 0 || k === 'heatLevel' || k === 'frostResist' || k === 'frostCount' || k === 'frostWait') return;
        const key = k === 'phase' ? 'phase:' + v : k === 'field' ? 'field:' + v + (r.heatLevel ? r.heatLevel : '') : (k === 'dark' || k === 'wind') ? k + ':' + v : k;
        cnt[key] = (cnt[key] || 0) + 1; }); }); });
  const rows = Object.entries(cnt).sort((a, b)=> b[1] - a[1] || a[0].localeCompare(b[0])).map(([k, v])=> ({key: k, fights: v, share: r3(v / n)}));
  return {fights: n, climbsLeftOut: climbs, rows};
}

// ---------------------------------------------------------------------------------------------------------------------------
if(WT && !WT.isMainThread && WT.workerData && WT.workerData.robust){
  const wd = WT.workerData, defs = Object.assign({}, H.loadCardDefs()); SEED = wd.seed; LEVEL = wd.level; FOE_RATIO = wd.foeRatio;
  const ctx = makeCtx(defs, wd.table, wd.mix, null, wd.pool);
  WT.parentPort.on('message', m=>{ if(m === 'stop') process.exit(0); WT.parentPort.postMessage(runChunk(defs, ctx, m.row, m.g0, m.g1)); });
} else if(require.main === module) main();

function main(){
  const argv = process.argv.slice(2), has = k=> argv.includes('--' + k);
  const opt = (k, d)=>{ const i = argv.findIndex(a=> a === '--' + k || a.startsWith('--' + k + '=')); if(i < 0) return d; const a = argv[i];
    return a.includes('=') ? a.slice(a.indexOf('=') + 1) : (argv[i + 1] != null && !argv[i + 1].startsWith('--') ? argv[i + 1] : d); };
  if(has('census')){ const c = census(), out = path.join(ROOT, 'docs', 'balance', 'field-census-2026-10-22.json');
    c.rows.forEach(r=> console.log(r.key.padEnd(26), String(r.fights).padStart(4), (r.share * 100).toFixed(1) + '%'));
    const cls = {}; FIELD_IDS.forEach(id=> cls[id] = FIELDS[id].class);
    fs.writeFileSync(out, JSON.stringify(Object.assign({_about: 'tools/skill_test_robust.js --census: the share of conquest-map fights (arena_app.js CONQUEST_MAPS + fightRules\' map-level rules) that carry each field; the four 50-floor climbs left out. FIELD_CONFIG\'s classes: uncommon = 2.5%+ or named by the owner (darkness, rain, fog)', generated: '2026-10-22'}, c, {classes: cls}), null, 1) + '\n');
    console.log(`${c.fights} fights; wrote ${path.relative(ROOT, out)}`); return; }
  const modes = ['mono', 'duo', 'multi'].filter(has);
  if(!modes.length){ console.log('usage: node tools/skill_test_robust.js --mono|--duo|--multi [--games 10000] [--seed 1] [--jobs 2] [--skills a,b=1/2] [--curve-games N] [--level 1] [--foe-ratio 0.8] [--quick] [--out f.json] [--no-out]\n       node tools/skill_test_robust.js --census'); process.exit(1); }
  const quick = has('quick');
  const G = Math.max(2, Math.round(Number(opt('games', quick ? 300 : 10000)) || 10000)), CG = Math.max(2, Math.round(Number(opt('curve-games', quick ? 120 : G)) || G));
  const JOBS = Math.max(1, Math.round(Number(opt('jobs', 1)) || 1)); SEED = Math.round(Number(opt('seed', 1)) || 1); LEVEL = Math.max(0, Math.round(Number(opt('level', 1)))); { const fr = opt('foe-ratio', null); if(fr != null && Number(fr) > 0) FOE_RATIO = Number(fr); }
  const table = JSON.parse(fs.readFileSync(path.join(ROOT, 'canonical', 'skill-costs.json'), 'utf8')), defs = Object.assign({}, H.loadCardDefs()), cs = SW.census(defs), mix = liveMix();
  const entry = id=> (table.skills || []).find(e=> e.id === id) || {id, scale:'half'};
  const typical = e=> SW.TYPICAL[e.id] != null ? SW.TYPICAL[e.id] : (()=>{ const t = SW.typicalOf(cs, e.id); return t != null ? t : e.scale === 'n' ? (e.payDefault || 2) : true; })();
  const parseVal = s=> s === 'true' ? true : /^-?\d+(\.\d+)?$/.test(s) ? Number(s) : s;
  const all = (table.skills || []).filter(e=> !SW.WHY[e.id] && !SW.PARAM_OF[e.id]);
  const want = String(opt('skills', quick ? 'quick,armor,nocturnal' : '')).split(',').map(s=> s.trim()).filter(Boolean);
  const set = (want.length ? want.map(s=>{ const [id, vs] = s.split('='); return {id, values: vs ? vs.split('/').map(parseVal) : null}; }) : all.map(e=> ({id: e.id, values: null})))
    .map(s=>{ const e = entry(s.id); return Object.assign(s, {e, values: s.values || [typical(e)], enabler: SW.SKILL_ENABLER[s.id] || null, legendary: !!e.legendary}); });
  // companions: every measurable skill a live card prints, weighted by how many print it (not legendary-only ones, not ones that need an enabler)
  const pool = all.filter(e=> !e.legendary && !SW.SKILL_ENABLER[e.id]).map(e=>{ const w = Object.values(cs.vals[e.id] || {}).reduce((a, b)=> a + b, 0); return {id: e.id, w, fx: {[e.id]: typical(e)}}; }).filter(c=> c.w > 0);
  const rows = [], byKey = {}, add = r=>{ if(!byKey[r.key]){ byKey[r.key] = r; rows.push(r); } return byKey[r.key]; };
  const sig = o=> JSON.stringify(o);
  add({key: 'vanilla', label: 'vanilla', kind: 'vanilla', unit: {effects: {}}});
  // the curve grids, from the mean vanilla unit
  const probe = makeCtx({}, table, mix, null, pool); let mA = 0, mH = 0; { const rng = H.seededRng(12345); for(let i = 0; i < 4000; i++){ const p = pickW(rng, mix.profiles, x=> x.w), st = probe.statsOf(probe.priced({}, p), UNIT_SHAPE, rng(), rng(), true); mA += st.A; mH += st.H; } mA /= 4000; mH /= 4000; }
  const fH = quick ? [-0.5, -0.25, 0.25, 0.5, 1, 2] : [-0.75, -0.5, -0.25, 0.125, 0.25, 0.375, 0.5, 0.75, 1, 1.5, 2, 3, 4, 5];
  const fA = quick ? [-0.5, 0.5, 1, 2] : [-1, -0.5, 0.25, 0.5, 0.75, 1, 1.5, 2, 3, 4];
  const gridH = [...new Set(fH.map(f=> Math.round(f * mH)).filter(d=> d))].sort((x, y)=> x - y), gridA = [...new Set(fA.map(f=> Math.round(f * mA)).filter(d=> d))].sort((x, y)=> x - y);
  gridH.forEach(d=> add({key: 'h' + d, kind: 'curve', unit: {dh: d}, games: CG})); gridA.forEach(d=> add({key: 'a' + d, kind: 'curve', unit: {da: d}, games: CG}));
  const fxOf = (s, v)=> Object.assign({}, s.enabler || {}, {[s.id]: v});
  const enRow = en=> add({key: 'en:' + sig(en), label: 'enabler ' + sig(en), kind: 'enabler', unit: {effects: Object.assign({}, en)}});
  const monoRow = (s, v)=>{ const en = s.enabler ? enRow(s.enabler) : null;
    return add({key: 'mono:' + sig(fxOf(s, v)), label: s.id + (v === true ? '' : ' ' + sig(v)), kind: 'mono', ids: [s.id], value: v, unit: {effects: fxOf(s, v), legendary: s.legendary}, enKey: en ? en.key : null}); };
  if(modes.includes('mono') || modes.includes('duo')) set.forEach(s=> s.values.forEach(v=> monoRow(s, v)));
  if(modes.includes('duo')) for(let i = 0; i < set.length; i++) for(let j = i + 1; j < set.length; j++){ const a = set[i], b = set[j], en = Object.assign({}, a.enabler || {}, b.enabler || {});
    const fx = Object.assign({}, en, {[a.id]: a.values[0], [b.id]: b.values[0]}), enR = Object.keys(en).length ? enRow(en) : null;
    add({key: 'duo:' + sig(fx), label: a.id + ' + ' + b.id, kind: 'duo', ids: [a.id, b.id], unit: {effects: fx, legendary: a.legendary || b.legendary}, enKey: enR ? enR.key : null,
      parts: [monoRow(a, a.values[0]).key, monoRow(b, b.values[0]).key]}); }
  if(modes.includes('multi')) set.forEach(s=> s.values.forEach(v=>{ const x = s.id + (v === true ? '' : '=' + sig(v));
    const without = add({key: 'multi-:' + x, label: s.id + ' companions only', kind: 'multi-', ids: [s.id], unit: {companions: true, x: s.id, xOn: false, xFx: s.enabler ? Object.assign({}, s.enabler) : {}}});
    add({key: 'multi:' + x, label: s.id + (v === true ? '' : ' ' + sig(v)) + ' + companions', kind: 'multi', ids: [s.id], value: v, unit: {companions: true, x: s.id, xOn: true, xFx: fxOf(s, v), legendary: s.legendary}, without: without.key}); }));
  // chunks, dealt out to --jobs workers (the result is the same for any --jobs)
  const CH = Math.max(25, Math.min(250, Math.ceil(G / (JOBS * 4)))), chunks = [];
  rows.forEach(r=>{ const n = r.games || G; for(let g = 0; g < n; g += CH) chunks.push({row: r, g0: g, g1: Math.min(n, g + CH)}); });
  const totalGames = chunks.reduce((s, c)=> s + c.g1 - c.g0, 0), tally = {}, t0 = Date.now(); let doneGames = 0, lastLog = Date.now();
  console.log(`robust skill test (${modes.join(' + ')}): ${set.length} skill${set.length === 1 ? '' : 's'}, ${rows.length} setups (${rows.filter(r=> r.kind === 'curve').length} curve points), ${G} games a setup` +
    `${CG !== G ? ` (${CG} a curve point)` : ''}, ${totalGames} games in all, ${JOBS} job${JOBS === 1 ? '' : 's'}, seed ${SEED}; band mix of ${mix.band} cards, Level ${LEVEL}; mean vanilla unit ${r2(mA)}/${r2(mH)}`);
  const take = res=>{ const t = tally[res.key] || (tally[res.key] = {w: 0, l: 0, d: 0, n: 0, pts: 0, q: 0, S: 0, squeezed: 0, by: {}});
    ['w', 'l', 'd', 'n', 'pts', 'q', 'S', 'squeezed'].forEach(k=> t[k] += res[k]);
    Object.keys(res.by).forEach(c=>{ const b = t.by[c] || (t.by[c] = [0, 0, 0, 0]); res.by[c].forEach((v, i)=> b[i] += v); }); doneGames += res.n;
    if(Date.now() - lastLog > 15000){ lastLog = Date.now(); const s = (Date.now() - t0) / 1000; console.log(`  ${doneGames}/${totalGames} games, ${Math.round(s)} s (about ${Math.round(s / doneGames * (totalGames - doneGames))} s left)`); } };
  const outFile = has('no-out') ? null : opt('out', path.join('docs', 'balance', `skill-test-robust-${modes.join('-')}${quick ? '-quick' : ''}-${new Date().toISOString().slice(0, 10)}.json`));
  const finish = ()=> report(modes, rows, byKey, tally, gridH, gridA, {G, CG, JOBS, SEED, LEVEL, mix, mA, mH, quick, ms: Date.now() - t0, games: totalGames}, outFile);
  if(JOBS === 1 || !WT){ const ctx = makeCtx(defs, table, mix, set, pool); chunks.forEach(c=> take(runChunk(defs, ctx, c.row, c.g0, c.g1))); finish(); return; }
  let next = 0, live = 0;
  for(let j = 0; j < Math.min(JOBS, chunks.length); j++){
    const w = new WT.Worker(__filename, {workerData: {robust: true, seed: SEED, level: LEVEL, foeRatio: FOE_RATIO, table, mix, pool}}); live++;
    const feed = ()=>{ if(next < chunks.length){ const c = chunks[next++]; w.postMessage({row: c.row, g0: c.g0, g1: c.g1}); } else w.postMessage('stop'); };
    w.on('message', res=>{ take(res); feed(); });
    w.on('error', e=>{ console.error('worker error:', e && e.stack || e); process.exit(2); });
    w.on('exit', ()=>{ if(--live === 0) finish(); });
    feed();
  }
}

// ---------------------------------------------------------------------------------------------------------------------------
// From win rates to stat points (tools/skill_worth.js's isotonic invert on the vanilla + Δ curves, S = (ΔH + 2ΔA) / 2), overall and per
// field condition (the curves and the vanilla deck read on the same fights).
// ---------------------------------------------------------------------------------------------------------------------------
function report(modes, rows, byKey, tally, gridH, gridA, meta, outFile){
  const lab = SW.makeLab({defs: {}});
  const cell = (k, c)=>{ const t = tally[k]; if(!t) return null; if(!c) return {w: t.w, l: t.l, d: t.d, n: t.n}; const b = t.by[c]; return b ? {w: b[0], l: b[1], d: b[2], n: b[3]} : null; };
  const wrOf = x=> x && x.n ? (x.w + x.d / 2) / x.n : null;
  function reader(c){ const v0 = wrOf(cell('vanilla', c)); if(v0 == null) return null;
    const curve = (pre, grid)=> [{d: 0, wr: v0}].concat(grid.map(d=> ({d, wr: wrOf(cell(pre + d, c))})).filter(p=> p.wr != null)).sort((a, b)=> a.d - b.d);
    const cH = curve('h', gridH), cA = curve('a', gridA), base = {h: lab.invert(cH, v0).d, a: lab.invert(cA, v0).d};
    const ends = cv=> [Math.min(...cv.map(p=> p.wr)), Math.max(...cv.map(p=> p.wr))], [hl, hh] = ends(cH), [al, ah] = ends(cA);
    const S = wr=>{ const h = lab.invert(cH, wr), a = lab.invert(cA, wr); return ((h.d - base.h) + 2 * (a.d - base.a)) / 2; };
    return {v0, cH, cA, worth: (wr, n)=>{ const se = Math.sqrt(Math.max(wr * (1 - wr), 1e-4) / Math.max(1, n)), s = S(wr);
      const clamp = wr <= Math.max(hl, al) ? '<' : wr >= Math.min(hh, ah) ? '>' : null;
      return {wr: r3(wr), se: r3(se), S: r2(s), Sse: r2(Math.abs(S(Math.min(1, wr + se)) - S(Math.max(0, wr - se))) / 2), clamp}; }}; }
  const conds = new Set(); Object.values(tally).forEach(t=> Object.keys(t.by).forEach(c=> conds.add(c)));
  const condList = ['none', 'no-daynight', 'daynight', 'daynight:night', 'tide', 'any-noncommon', 'any-rare'].concat(NONCOMMON.filter(id=> FIELDS[id].class === 'uncommon'), NONCOMMON.filter(id=> FIELDS[id].class === 'rare')).filter(c=> conds.has(c));
  const R = {all: reader(null)}; condList.forEach(c=> R[c] = reader(c));
  const van = tally.vanilla, vPts = van.pts / van.n, vQ = van.q / van.n, out = [];
  rows.filter(r=> r.kind !== 'curve').forEach(r=>{ const t = tally[r.key]; if(!t) return; const x = R.all.worth(wrOf(cell(r.key)), t.n);
    const pts = t.pts / t.n, paid = vPts - pts, o = {key: r.key, label: r.label, kind: r.kind, ids: r.ids, value: r.value, n: t.n, wr: x.wr, se: x.se, delta: r3(x.wr - R.all.v0),
      net: x.S, netSE: x.Sse, clamp: x.clamp, paid: r2(paid), worth: r2(x.S + paid), Stable: r2(t.S / t.n), unitPts: r2(pts), squeezed: r3(t.squeezed / (t.n * DECK)), byField: {}};
    condList.forEach(c=>{ const cc = cell(r.key, c), rd = R[c]; if(!cc || !rd || cc.n < 30) return; const y = rd.worth(wrOf(cc), cc.n);
      o.byField[c] = {n: cc.n, wr: y.wr, vanillaWr: r3(rd.v0), net: y.S, netSE: y.Sse, worth: r2(y.S + paid), clamp: y.clamp}; });
    out.push(o); });
  const O = k=> out.find(o=> o.key === k);
  out.forEach(o=>{ const r = byKey[o.key];
    if(r.enKey && O(r.enKey)){ const e = O(r.enKey); o.gross = {net: o.net, worth: o.worth}; o.net = r2(o.net - e.net); o.worth = r2(o.worth - e.worth); o.Stable = r2(o.Stable - e.Stable); o.paid = r2(o.paid - e.paid);
      Object.keys(o.byField).forEach(c=>{ if(e.byField[c]){ o.byField[c].net = r2(o.byField[c].net - e.byField[c].net); o.byField[c].worth = r2(o.byField[c].worth - e.byField[c].worth); } }); }
    if(r.kind === 'multi' && O(r.without)){ const wo = O(r.without); o.marginal = {net: r2(o.net - wo.net), paid: r2(o.paid - wo.paid), worth: r2(o.worth - wo.worth), Stable: r2(o.Stable - wo.Stable), byField: {}};
      Object.keys(o.byField).forEach(c=>{ if(wo.byField[c]) o.marginal.byField[c] = {net: r2(o.byField[c].net - wo.byField[c].net), worth: r2(o.byField[c].worth - wo.byField[c].worth)}; }); }
    if(r.kind === 'duo'){ const a = O(r.parts[0]), b = O(r.parts[1]); if(a && b) o.synergy = r2(o.worth - a.worth - b.worth); } });
  // the report: per skill its worth, what the budget takes for it, the net (+ = under-priced), and the field conditions that move it most
  const pct = v=> v == null ? '–' : (v * 100).toFixed(1) + '%', sg = v=> v == null ? '–' : (v >= 0 ? '+' : '') + v;
  const lines = [`vanilla vs the standard enemy: ${pct(R.all.v0)} (${van.n} games); mean vanilla unit ${r2(meta.mA)}/${r2(meta.mH)} (${r2(vPts)} stat points)`, '',
    ['setup'.padEnd(36), 'win rate', ' net (±)', '  paid', ' worth', ' S table', '  field: worth'].join(' ')];
  const order = {mono: 1, enabler: 2, duo: 3, multi: 4, 'multi-': 5};
  const fieldNote = o=>{ const src = o.marginal ? o.marginal.byField : o.byField, base = o.marginal ? o.marginal.worth : o.worth;
    return Object.entries(src).filter(([c])=> !['none', 'no-daynight', 'any-noncommon', 'any-rare'].includes(c) || c === 'none').map(([c, v])=> [c, v.worth]).sort((a, b)=> Math.abs(b[1] - base) - Math.abs(a[1] - base)).slice(0, 3).map(([c, v])=> c + ' ' + v).join(', '); };
  out.filter(o=> o.kind !== 'vanilla' && o.kind !== 'multi-').sort((a, b)=> (order[a.kind] - order[b.kind]) || (b.worth - a.worth)).forEach(o=>{ const m = o.marginal || o;
    lines.push([String(o.label).slice(0, 36).padEnd(36), pct(o.wr).padStart(8), (sg(m.net) + (o.clamp || '') + ' ±' + o.netSE).padStart(13), String(m.paid).padStart(6), String(m.worth).padStart(6), String(m.Stable).padStart(8),
      (o.synergy != null ? ' synergy ' + sg(o.synergy) + ';' : '') + ' ' + fieldNote(o)].join(' ')); });
  lines.push('', 'net: the deck\'s gain over the vanilla deck in stat points (2A + H) after the budget took the skill\'s price off its stats; + = worth more than the price.',
    'paid: the stat points a unit gave up for it; worth = net + paid. --multi rows are marginal (with minus without the skill, same companions). S table: the price in canonical/skill-costs.json.',
    `${meta.games} games, ${Math.round(meta.ms / 1000)} s, ${meta.JOBS} job${meta.JOBS === 1 ? '' : 's'} (${r2(meta.ms / meta.games)} ms a game)`);
  console.log(lines.join('\n'));
  if(!outFile) return;
  const data = {_about: 'tools/skill_test_robust.js: the robust skill test (docs/workflows/balance.md, package ST 2026-10-22)', modes, generated: new Date().toISOString().slice(0, 10),
    setup: {games: meta.G, curveGames: meta.CG, foeRatio: FOE_RATIO, seed: meta.SEED, level: meta.LEVEL, quick: meta.quick, unitShape: UNIT_SHAPE, foeShape: FOE_SHAPE, bramble: BRAMBLE, deck: DECK,
      mix: meta.mix, fieldConfig: FIELD_CONFIG, fields: Object.fromEntries(FIELD_IDS.map(id=> [id, FIELDS[id].class])), meanVanillaUnit: {attack: r2(meta.mA), health: r2(meta.mH)}, vanillaPts: r2(vPts), vanillaQ: r2(vQ)},
    vanillaWr: r3(R.all.v0), vanillaByField: Object.fromEntries(condList.map(c=> [c, R[c] ? {wr: r3(R[c].v0), n: cell('vanilla', c).n} : null])),
    curves: {h: R.all.cH.map(p=> ({d: p.d, wr: r3(p.wr)})), a: R.all.cA.map(p=> ({d: p.d, wr: r3(p.wr)}))}, rows: out, games: meta.games, ms: meta.ms};
  fs.mkdirSync(path.dirname(path.resolve(outFile)), {recursive: true}); fs.writeFileSync(outFile, JSON.stringify(data, null, 1) + '\n');
  const md = outFile.replace(/\.json$/, '') + '.md';
  fs.writeFileSync(md, [`# Robust skill test (${modes.join(' + ')}), ${data.generated}`, '', `Made by \`tools/skill_test_robust.js\`; the data is \`${path.basename(outFile)}\`. ${meta.G} games a setup${meta.CG !== meta.G ? `, ${meta.CG} a curve point` : ''}, seed ${meta.SEED}${meta.quick ? ' (a --quick smoke run: too few games to read)' : ''}.`, '',
    `Units: the live band cards' rarity / Wait / Lumber mix, stats from the budget at Level ${meta.LEVEL} (the skill priced in). Fields: Day/Night and Tide 20% each, each uncommon field ${FIELD_CONFIG.p.uncommon * 100}%, each rare one ${FIELD_CONFIG.p.rare * 100}%, and ${FIELD_CONFIG.forceNonCommon * 100}% of fights get one more non-common field.`, '',
    '```', ...lines, '```', ''].join('\n'));
  console.log('wrote', outFile, 'and', md);
}
module.exports = {FIELD_CONFIG, FIELDS, rollField, liveMix, makeCtx, playGame, census, setSeed: s=>{ SEED = s; }};
