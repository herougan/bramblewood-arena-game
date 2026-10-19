#!/usr/bin/env node
// 2026-10-16 (content batch): the Tower, the levels past the top, the jumpers (hidden skirmishes Type 2) and the new card.
//   "Can you prepare like a tower of babylon like tower? The enemies there can scale past lvl 10. Limit breaking to whatever lvl like
//    20. (Any stats undefined by us = assume a random +1 stat in att or def). It starts super difficult already, at BR=555. Every
//    skirmish jumps in 25 BR."
//   "This Skirmish is required to be completed before the next one is unlocked, but is hidden at first."
'use strict';
const fs = require('fs'), path = require('path'), vm = require('vm');
let fail = 0; const ok = (c, m)=>{ if(!c){ fail++; console.log('  ✗', m); } };
const src = fs.readFileSync(path.join(__dirname, '..', 'arena_app.js'), 'utf8');
const fnSrc = name=>{ const i = src.indexOf('function ' + name + '('); if(i < 0) throw new Error('no function ' + name); let k = src.indexOf('{', i), d = 0;
  for(; k < src.length; k++){ const c = src[k]; if(c === '{') d++; else if(c === '}'){ d--; if(!d) return src.slice(i, k + 1); } } return null; };
// a `const NAME = …;` statement, up to the semicolon that closes it at bracket depth 0
const constSrc = name=>{ const i = src.indexOf('const ' + name + ' ='); if(i < 0) throw new Error('no const ' + name); let d = 0, q = null;
  for(let k = i; k < src.length; k++){ const c = src[k]; if(q){ if(c === '\\'){ k++; continue; } if(c === q) q = null; continue; }
    if(c === '"' || c === "'" || c === '`'){ q = c; continue; } if('([{'.includes(c)) d++; else if(')]}'.includes(c)) d--; else if(c === ';' && !d) return src.slice(i, k + 1); } };
const cards = JSON.parse(fs.readFileSync(path.join(__dirname, '..', 'canonical', 'cards.json'), 'utf8')), defs = {}; cards.forEach(c=> defs[c.id] = c);
const ctx = {CARD_DEFS_BASELINE: defs, RARITY_DEFS: [], DECK_SIZE: 20, BramblewoodBudget: require(path.join(__dirname, '..', 'bramblewood-budget.js'))}; vm.createContext(ctx); // + the budget Forge curve (2026-10-19, package BF)
const towerConsts = src.slice(src.indexOf('const TOWER_LEVEL_CAP'), src.indexOf(';', src.indexOf('const TOWER_LEVEL_CAP')) + 1);
vm.runInContext([constSrc('RATING_WEIGHT'), constSrc('LEVEL_STEPS'), constSrc('LEVEL_STEP_GAIN'), constSrc('FORGE_CURVE_CACHE'), constSrc('RARITY_MAX_LEVEL'), towerConsts, constSrc('TOWER_POOLS'), constSrc('JUMPER_SKIRMISHES'), constSrc('TOWER_LUMBER_POOL'),
  ...['hashStr', 'cardBaseLevel', 'cardMaxLevel', 'forgeCurveOf', 'statsAtLevel', 'statsBeyondLevel', 'ratingWeightOf', 'ratingLevelFactor', 'towerTargetBR', 'seededUnit', 'towerDeckBR', 'isLumberSource', 'towerNeedsLumber', 'towerFloorDeck'].map(fnSrc),
  'this.api = {statsAtLevel, statsBeyondLevel, ratingLevelFactor, towerFloorDeck, towerDeckBR, TOWER_POOLS, JUMPER_SKIRMISHES, TOWER_FLOORS, TOWER_BR_START, TOWER_BR_STEP};'].join('\n'), ctx);
const A = ctx.api;
// Past the top: at or below 11 the usual curve; above, +1 Attack or Health per level, stable for a card and level
{ const d = defs['ironmaw-warwolf'];
  ok(JSON.stringify(A.statsBeyondLevel(d, 10)) === JSON.stringify(A.statsAtLevel(d, 10)), 'statsBeyondLevel: Lv 10 is the usual curve');
  ok(JSON.stringify(A.statsBeyondLevel(d, 11)) === JSON.stringify(A.statsAtLevel(d, 11)), 'statsBeyondLevel: Lv 11 (limit break) is the usual curve');
  const s11 = A.statsAtLevel(d, 11);
  for(let L = 12; L <= 20; L++){ const s = A.statsBeyondLevel(d, L), p = A.statsBeyondLevel(d, L - 1);
    ok((s.attack - p.attack) + (s.health - p.health) === 1, `statsBeyondLevel: Lv ${L} adds exactly one stat point`);
    ok(JSON.stringify(s) === JSON.stringify(A.statsBeyondLevel(d, L)), `statsBeyondLevel: Lv ${L} is stable`); }
  const s20 = A.statsBeyondLevel(d, 20); ok((s20.attack - s11.attack) + (s20.health - s11.health) === 9, 'statsBeyondLevel: Lv 20 is 9 points over Lv 11');
  // the designer's own stats for a level win, and the +1s carry on from there
  const own = Object.assign({}, d, {levelStats: {15: {attack: 30, health: 60}}});
  ok(A.statsBeyondLevel(own, 15).attack === 30 && A.statsBeyondLevel(own, 15).health === 60, 'statsBeyondLevel: a level with its own stats keeps them');
  const s16 = A.statsBeyondLevel(own, 16); ok(s16.attack + s16.health === 91, 'statsBeyondLevel: the level after carries on with +1');
  ok(A.ratingLevelFactor(20, 20) > A.ratingLevelFactor(11, 20) && A.ratingLevelFactor(20) === A.ratingLevelFactor(11), 'ratingLevelFactor: 20 counts only where the cap allows it'); }
// The Tower: floor f is rated 555 + 25(f-1), levels 11..20, decks of 12 from the strong pools, a legendary every tenth floor
{ let worst = 0, prev = 0;
  for(let f = 1; f <= A.TOWER_FLOORS; f++){
    const t = A.towerFloorDeck(f), want = A.TOWER_BR_START + A.TOWER_BR_STEP * (f - 1), n = Object.values(t.deck).reduce((a, b)=> a + b, 0);
    ok(t.target === want, `tower floor ${f}: target ${want}`); worst = Math.max(worst, Math.abs(t.br - want));
    ok(n === 12, `tower floor ${f}: 12 cards (got ${n})`);
    ok(Object.values(t.levels).every(L=> L >= 11 && L <= 20), `tower floor ${f}: levels 11–20`);
    ok(Object.keys(t.deck).every(id=> defs[id]), `tower floor ${f}: every card exists`);
    if(f % 10 === 0) ok(Object.keys(t.deck).some(id=> A.TOWER_POOLS.legendary.includes(id)), `tower floor ${f}: a legendary heads the boss floor`);
    ok(t.br > prev, `tower floor ${f}: harder than the floor below`); prev = t.br;
    ok(JSON.stringify(A.towerFloorDeck(f)) === JSON.stringify(t), `tower floor ${f}: the same fight every time`); }
  ok(worst <= 20, `tower: every floor within 20 of its battle rating (worst ${worst}); 2026-10-18: the 10-17 Lumber swap trades one card, so a floor can land a little further off`);
  ok(A.towerFloorDeck(1).br >= 540 && A.towerFloorDeck(1).br <= 570, 'tower: floor 1 starts at about 555'); }
// The jumpers: 2–3 on Maps 5–20, between two real fights, a real entrance, decks of real cards
{ const J = A.JUMPER_SKIRMISHES, ENTR = ['meteor', 'splash', 'psychic', 'ghost'];
  ok(J.length >= 2 && J.length <= 3, 'jumpers: two or three of them');
  J.forEach(j=>{ ok(ENTR.includes(j.entrance), `jumper ${j.node.key}: entrance ${j.entrance}`);
    ok(new RegExp(`key:"${j.after}"`).test(src) && new RegExp(`key:"${j.before}"`).test(src), `jumper ${j.node.key}: ${j.after} and ${j.before} are fights`);
    ok(Object.keys(j.node.deck).every(id=> defs[id]), `jumper ${j.node.key}: every card exists`);
    const n = +j.node.key.split('-')[0]; ok(n >= 5 && n <= 20, `jumper ${j.node.key}: on Maps 5–20`); });
  const fx = fs.readFileSync(path.join(__dirname, '..', 'bramblewood-fx-e.js'), 'utf8');
  ENTR.forEach(k=> ok(new RegExp(`\\n  ${k}\\(node, c, g`).test(fx), `FX.E.jumperArrive has the ${k} entrance`)); }
// The new card and the boar art
{ const t = defs['snapstick-turtle']; ok(t && t.rarity === 'common' && /^data:image\/png;base64,/.test(t.art || '') && (!t.source || t.source.kind === 'map'), 'Snapstick Turtle: a common with art (a map reward since the 10-19 card pass)');
  ok(new Set(cards.map(c=> c.numericId)).size === cards.length, 'cards: numericIds stay unique');
  ok(fs.existsSync(path.join(__dirname, '..', 'art', 'cards', 'snapstick-turtle.png')) && fs.existsSync(path.join(__dirname, '..', 'art', 'cards', 'tusked-vanguard.png')), 'card art files'); }
console.log(fail ? `keywords-2026-10-15w3: ${fail} failure(s)` : 'keywords-2026-10-15w3: all passed');
process.exit(fail ? 1 : 0);
