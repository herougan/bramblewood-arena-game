#!/usr/bin/env node
// 2026-10-23 (package FX4, the owner's 11:11 answers): UI4-3 (one swap row, Swap Again), FX3-1 (Scorched Ground on one unit a side, the
// line of fire as Wildfire Front), FX3-2 (one ground fire, a gap between field numbers, the Environment card that fires), FX3-3 (Lava Tide
// half as often, Lava Waders), EN-3 (Guardian on the Bulwark Shields), EN-5 (Backstab on Waiting / Shocked / Exposed), EB-1 (one of each
// weak Base card back in the starting deck, no Sparrow Chick) and the Tutorial's "Exit". Engine scenarios, data pins and source checks.
'use strict';
const fs = require('fs'), path = require('path'), vm = require('vm');
const H = require('./lib/harness.js');
const E = H.Engine;
const ROOT = path.join(__dirname, '..');
let fail = 0, checks = 0; const ok = (c, m)=>{ checks++; if(!c){ fail++; console.log('  ✗', m); } };
const so = id=> id===1 ? 'A' : 'B';
const U = (id, o)=> Object.assign({id, name:id, attack:0, health:500, wait:0, cost:0, effects:{}}, o || {});
const base = H.loadCardDefs();
const defs = Object.assign({}, base, {'f4-wall': U('f4-wall'), 'f4-hot': U('f4-hot', {resist:['heat']}), 'f4-climb': U('f4-climb', {effects:{mountainClimber:true}}),
  'f4-own': U('f4-own', {effects:{resist:['cold']}}), 'f4-knife': U('f4-knife', {attack:3, health:50, effects:{backstab:3}})});
const all = pl=> [...pl.row.left, ...pl.row.center, ...pl.row.right];
function mk(rules, seed){ const e = E.makeSimEngine(defs, E.mulberry32(seed || 7), {recordEvents:true, battleMode:'open', rules}); return {e, P:{1:e.newPlayer(1, {}), 2:e.newPlayer(2, {})}}; }
function put(e, P, pid, id, slot){ const pl = P[pid]; e.debugSpawnCard(P, so, pid, id, 'left', {}, []);
  const c = all(pl).reduce((a, x)=> (!a || x.uid > a.uid) ? x : a, null); c.slot = slot;
  const cs = all(pl); pl.row.center = cs.filter(x=> x.slot === 0); pl.row.left = cs.filter(x=> x.slot < 0).sort((a, b)=> b.slot - a.slot); pl.row.right = cs.filter(x=> x.slot > 0).sort((a, b)=> a.slot - b.slot);
  e.syncSlots(pl); return c; }
const lost = c=> 500 - c.hp;
const app = fs.readFileSync(path.join(ROOT, 'arena_app.js'), 'utf8'), tpl = fs.readFileSync(path.join(ROOT, 'arena_template.html'), 'utf8');
const T = require(path.join(ROOT, 'bramblewood-texts.js')).TEXT;
const fnSrc = name=>{ const i = app.indexOf('function ' + name + '('); if(i < 0) return ''; let d = 0, j = app.indexOf('{', i); for(let k = j; k < app.length; k++){ if(app[k] === '{') d++; else if(app[k] === '}'){ d--; if(!d) return app.slice(i, k + 1); } } return ''; };

// ---- FX3-1: Scorched Ground boils under one random unit a side, 1
{ const {e, P} = mk({eruption:5}); const us = [-2, -1, 0, 1, 2].map(s=> put(e, P, 1, 'f4-wall', s)).concat([-1, 0, 1].map(s=> put(e, P, 2, 'f4-wall', s)));
  const hot = put(e, P, 2, 'f4-hot', 2), cl = put(e, P, 2, 'f4-climb', -2);
  const ev1 = []; e.roundStart(P, 1, so, {}, ev1); ok(!ev1.some(x=> x.field === 'scorched'), 'FX3-1. Scorched Ground: nothing in round 1');
  for(let r = 2; r <= 7; r++){ const ev = []; e.roundStart(P, r, so, {}, ev); const hs = ev.filter(x=> x.field === 'scorched');
    ok(hs.length === 2 && hs.every(x=> x.dmg === 1) && new Set(hs.map(x=> x.side)).size === 2, `FX3-1. round ${r}: one unit a side, 1 each (${hs.map(x=> x.side + x.dmg)})`);
    ok(!ev.some(x=> x.field === 'wildfire' || x.field === 'wildfireSweep'), `FX3-1. round ${r}: no line of fire with Scorched Ground`); }
  ok(lost(hot) === 0 && lost(cl) === 0, `FX3-1. fire-resistant units and Mountain Climbers are never chosen (${lost(hot)}, ${lost(cl)})`);
  ok(us.reduce((a, c)=> a + lost(c), 0) === 12, `FX3-1. 6 rounds x 2 units x 1 = 12 in all (${us.reduce((a, c)=> a + lost(c), 0)})`);
  ok(e.forecast().scorched && e.forecast().eruption === 1, 'FX3-1. the forecast says Scorched Ground, 1'); }
// ---- FX3-1: Wildfire Front, every front unit 1, left to right; with it, no Scorched Ground (one ground fire)
{ const {e, P} = mk({wildfire:true, eruption:2}); const us = [-2, -1, 0, 1, 2].map(s=> put(e, P, 1, 'f4-wall', s)).concat([-1, 0, 1].map(s=> put(e, P, 2, 'f4-wall', s)));
  const ev1 = []; e.roundStart(P, 1, so, {}, ev1); ok(!ev1.some(x=> /wildfire/.test(x.field || '')), 'Wildfire Front: nothing in round 1');
  const ev = []; e.roundStart(P, 2, so, {}, ev); const hd = ev.find(x=> x.field === 'wildfireSweep'), hs = ev.filter(x=> x.field === 'wildfire');
  ok(hd && ev.indexOf(hd) < ev.indexOf(hs[0]), 'Wildfire Front: the header, then the hits');
  ok(hs.length === 8 && us.every(c=> lost(c) === 1), `Wildfire Front: every front unit takes 1 (${us.map(lost)})`);
  ok(hs.every((x, i)=> i === 0 || hs[i - 1].col <= x.col), 'Wildfire Front: one by one, left to right');
  ok(!ev.some(x=> x.field === 'scorched'), 'FX3-2. one ground fire: no Scorched Ground beside Wildfire Front');
  ok(e.forecast().wildfire === 1 && !e.forecast().scorched, 'Wildfire Front: the forecast'); }
// ---- FX3-3: Lava Tide half as often
{ const c = mk({volcano:'medium'}).e.volcanoChances(2); ok(c.lavaTide === 10 && c.petrify === 22 && c.eruption === 24, `FX3-3. Medium: Lava Tide 10 (was 20), the others as before (${c.lavaTide}/${c.petrify}/${c.eruption})`);
  const o = mk({volcano:'medium', lavaTideChance:40}).e.volcanoChances(2); ok(o.lavaTide === 40, 'FX3-3. a fight\'s own Lava Tide chance is kept');
  ok(/const LAVA_TIDE_FACTOR = 0\.5;/.test(app) && /pick\(r\.lavaTideChance, t\[0\], LAVA_TIDE_FACTOR\)/.test(app), 'FX3-3. the game\'s odds words use the same x0.5'); }
// ---- FX3-3: Lava Waders
{ const C = JSON.parse(fs.readFileSync(path.join(ROOT, 'canonical', 'cards.json'), 'utf8')), lw = C.find(c=> c.id === 'lava-waders');
  ok(lw && lw.cardType === 'equipment' && lw.attack === 0 && lw.health === 3 && lw.rarity === 'uncommon' && lw.cost === 1, 'Lava Waders: an Uncommon equipment card, Lumber 1, +0/+3');
  ok(lw && JSON.stringify(lw.equip) === JSON.stringify({grant:{resist:['heat']}}) && lw.source && lw.source.kind === 'smith', 'Lava Waders: grants Fire Resistance, made at the Blacksmith');
  ok(lw && C.filter(c=> c.numericId === lw.numericId).length === 1, 'Lava Waders: a unique numericId');
  ok(/\{out:'lava-waders', needs:\{'iron-shard':2, 'ember-core':1, 'basalt-boar':1\}, cost:\{dust:300, gold:400\}\}/.test(app), 'Lava Waders: the Blacksmith recipe');
  const SC = require(path.join(ROOT, 'tools', 'skill_costs.js')).make(require(path.join(ROOT, 'canonical', 'skill-costs.json')));
  const b = SC.budget(Object.assign({}, lw, {effects: lw.equip.grant})); ok(b.ok, `Lava Waders: inside the budget, its grant counted as its skills (2A+H+S ${b.x1} of N ${b.N})`);
  ok(fs.readFileSync(path.join(ROOT, 'docs', 'art', 'new-cards-2026-10-21-briefs.md'), 'utf8').includes('#### Lava Waders (`lava-waders`'), 'Lava Waders: a NightCafe prompt');
  const d2 = Object.assign({}, defs, {'lava-waders': lw});
  const run = (rules, unit)=>{ const e = E.makeSimEngine(d2, E.mulberry32(3), {recordEvents:true, battleMode:'open', rules}); const P = {1:e.newPlayer(1, {}), 2:e.newPlayer(2, {})};
    const u = put(e, P, 1, unit, 0); P[1].hand.push({uid: 9101, defId:'lava-waders'}); P[1].lumber = 1; e.equip(P, so, 1, u.uid, 9101, {}, []);
    e.roundStart(P, 1, so, {}, []); return {e, P, u}; };
  const r = run({wildfire:true}, 'f4-wall'); const ev = []; r.e.roundStart(r.P, 2, so, {}, ev);
  const dv = r.e.derivedDefs[r.u.defId] || {};
  ok(r.u.equipOn && (dv.effects.resist || []).includes('heat'), `Lava Waders: the equipped unit has Fire Resistance (${JSON.stringify(dv.effects && dv.effects.resist)})`);
  ok(ev.some(x=> x.field === 'wildfireSweep') && !ev.some(x=> x.field === 'wildfire' && x.uid === r.u.uid), 'Lava Waders: Wildfire Front passes it by');
  const r2 = run({}, 'f4-own'); ok(JSON.stringify(((r2.e.derivedDefs[r2.u.defId] || {}).effects || {}).resist) === JSON.stringify(['cold', 'heat']), 'Lava Waders: added to the unit\'s own Resist list, not in place of it');
  ok(T['ui.fx4-fire-resistance'] === 'Fire Resistance' && /function eqResistText\(k, v\)/.test(app), 'Lava Waders: the grant reads "Fire Resistance"'); }
// ---- EN-3: the Bulwark Shields have Guardian
{ const d3 = Object.assign({}, defs, {'f4-bulwark': U('f4-bulwark', {attack:1, health:10, effects:{bulwark:1}})});
  const e = E.makeSimEngine(d3, E.mulberry32(5), {recordEvents:true, battleMode:'open'}); const P = {1:e.newPlayer(1, {}, {health:200}), 2:e.newPlayer(2, {}, {health:200})};
  P[1].hand.push({uid: 9201, defId:'f4-bulwark'}); P[1].lumber = 5; e.placeCard(P, so, 1, 9201, 0, {}, []);
  const sh = all(P[1]).filter(c=> (e.derivedDefs[c.defId] || {}).bulwarkShield);
  ok(sh.length === 2 && sh.every(c=> e.derivedDefs[c.defId].effects.guardian === true), `EN-3. both Bulwark Shields have Guardian (${sh.length})`);
  ok(/Structures with Guardian/.test(T['ui.sk-bulwark-codex']), 'EN-3. the Codex line says Guardian'); }
// ---- EN-5: Backstab's +N on a Waiting, Shocked or Exposed target
{ for(const [st, label] of [[{wait:2}, 'Waiting'], [{shocked:2}, 'Shocked'], [{exposed:1}, 'Exposed'], [{}, 'in good shape']]){
    const e = E.makeSimEngine(defs, E.mulberry32(5), {recordEvents:true, battleMode:'open'}); const P = {1:e.newPlayer(1, {}), 2:e.newPlayer(2, {})};
    e.debugSpawnCard(P, so, 1, 'f4-knife', 'left', {}, []); e.debugSpawnCard(P, so, 2, 'f4-wall', 'left', {}, []);
    e.allBoardCards(P[2]).forEach(c=> Object.assign(c, st)); const k = e.allBoardCards(P[1])[0]; const ev = []; e.debugAttack(P, so, k.uid, {}, ev);
    const h = ev.find(x=> x.type === 'hit' && x.attDefId === 'f4-knife');
    ok(h && (label === 'in good shape' ? !h.backstab : h.backstab === 3), `EN-5. a target ${label}: ${label === 'in good shape' ? 'no bonus' : '+3'} (dmg ${h && h.dmg}, backstab ${h && h.backstab})`); }
  ok(/still Waiting, Shocked, Exposed/.test(T['ui.sk-backstab-codex']), 'EN-5. the Codex line lists them'); }
// ---- EB-1: the real deck after T-2 keeps one of each weak Base card; no Sparrow Chick
{ const between = (s, a, b)=>{ const i = s.indexOf(a); return i < 0 ? '' : s.slice(i, s.indexOf(b, i) + b.length); };
  const SD = vm.runInNewContext('(' + between(app, 'const STARTER_CFG_DEFAULT = {', '\n};').replace('const STARTER_CFG_DEFAULT = ', '').replace(/;$/, '') + ')');
  const PG = vm.runInNewContext(between(app, 'const PG_STARTER_TOP_UP = [', '];') + '; PG_STARTER_TOP_UP');
  const D = require(path.join(ROOT, 'tools', 'lib_bramble.js')).CARD_DEFS_BASELINE;
  const mkP = cfg=> new Function('getCardDefs', 'tutorialCfg', 'STARTER_CFG_DEFAULT', 'STARTER_SHOWN', 'DECK_SIZE', 'tutorialRewardIds', 'tutorialRewards2',
    ['const PG_STARTER_TOP_UP = ' + JSON.stringify(PG) + ';', fnSrc('starterTopUpList'), fnSrc('starterDeckTarget'), fnSrc('starterDeckParts'), 'return starterDeckParts;'].join('\n'))(()=> D, cfg, SD, 8, 20, ()=> ['r'], ()=> ['x', 'y']);
  const LIVE = Object.assign({}, SD, {starterFiller:{'honey-bee':3, 'silver-minnow':3, 'sparrow-chick':3}}); delete LIVE.starterTopUp;
  for(const [label, cfg] of [['default', SD], ['a saved config with the old filler', LIVE]]) for(const pick of ['otters', 'hummingbirds', 'both']){
    const p = mkP(cfg)(pick), ids = Object.keys(p.all);
    ok(ids.length === 17 && Object.values(p.all).every(n=> n === 1), `EB-1. ${label}, ${pick}: 17 cards, one copy each (+ the 3 tutorial rewards = 20): ${ids.length}`);
    ok(p.all['honey-bee'] && p.all['silver-minnow'] && !p.all['sparrow-chick'], `EB-1. ${label}, ${pick}: one Honey Bee and one Silver Minnow, no Sparrow Chick`);
    ok(!p.shown['honey-bee'] && !p.shown['silver-minnow'], `EB-1. ${label}, ${pick}: the weak cards are in the hidden part`);
    ok(p.all['river-carp'] && p.all['burrow-rabbit'], `EB-1. ${label}, ${pick}: the sturdier cards stay`); }
  const C = JSON.parse(fs.readFileSync(path.join(ROOT, 'canonical', 'cards.json'), 'utf8')), sc = C.find(c=> c.id === 'sparrow-chick');
  ok(JSON.stringify(sc.source) === JSON.stringify({kind:'pack', tier:1, map:'mc'}), 'EB-1. the Sparrow Chick is a Gannet Cliffs pack card');
  // 2026-10-28 APPLY1: lists follow THEME2 (owner 23:05); THEME2 leaves the Sparrow Chick off Gannet Cliffs' list (on no list: not obtainable yet)
  const t2mc = JSON.parse(fs.readFileSync(path.join(ROOT, 'docs', 'balance', 'theme2-proposal-2026-10-28.json'), 'utf8')).maps.find(m=> m.key === 'mc');
  ok(JSON.parse(fs.readFileSync(path.join(ROOT, 'canonical', 'map-pools.json'), 'utf8')).maps.mc.cards.includes('sparrow-chick') === t2mc.proposed.includes('sparrow-chick'), 'EB-1. its place on Gannet Cliffs\' list follows THEME2');
  // 2026-10-24 (package BAL2, DF-1): a Pack 1 card counts from Map 0, where the first Pack 1 is paid (was its pool map, 3)
  ok(!JSON.parse(fs.readFileSync(path.join(ROOT, 'canonical', 'card-obtain-maps.json'), 'utf8')).maps['sparrow-chick'], 'EB-1. obtainable from Map 0 (Pack 1, DF-1)'); }
// ---- the fights: Wildfire Front on 14-6 (savanna) and 20-8 (volcano), one ground fire there
{ const G = require(path.join(ROOT, 'tools', 'lib_bramble.js')).G, node = (mid, k)=> G.CONQUEST_MAPS.find(m=> m.id === mid).nodes.find(n=> n.key === k);
  for(const [mid, k] of [['m5', '14-6'], ['m11', '20-8']]){ const r = G.fightRules(mid, node(mid, k));
    ok(r.wildfire === true && !(Number(r.eruption) > 0) && r.field !== 'heatwave', `${k}: Wildfire Front, no Scorched Ground or Scorching beside it (${r.wildfire}, ${r.eruption}, ${r.field})`); }
  const r7 = G.fightRules('m11', node('m11', '20-7')); ok(Number(r7.eruption) > 0 && !r7.wildfire, '20-7 keeps Scorched Ground'); }
// ---- FX3-2: the gap between field numbers, the Environment card that fires
{ ok(/const FIELD_GAP_MS = 250;/.test(app) && /try\{ fieldGapStamp\(drawEvents, m\); \}catch\(e\)\{\}/.test(app), 'FX3-2. the upkeep stamps a 250 ms gap per extra field number on a unit');
  const stamp = new Function('FIELD_GAP_MS', fnSrc('fieldGapStamp') + '; return fieldGapStamp;')(250);
  const evs = [{type:'fieldTick', field:'comet', uid:1, dmg:1}, {type:'fieldTick', field:'lavaTide', uid:1, dmg:2}, {type:'fieldTick', field:'comet', uid:2, dmg:1}, {type:'fieldTick', field:'wildfireSweep'}, {type:'fieldTick', field:'wildfire', uid:1, dmg:1}];
  stamp(evs, {speedMult:1}); ok(evs[0]._fxGap === 0 && evs[1]._fxGap === 250 && evs[2]._fxGap === 0 && evs[4]._fxGap === 500, `FX3-2. gaps: ${evs.map(x=> x._fxGap)}`);
  stamp(evs.map(x=> Object.assign({}, x, {_fxGap: undefined})), {speedMult:2});
  ok(/ev\._fxGap > 0 && !ev\._fxGapDone/.test(app) && /Math\.max\(gap, Math\.round\(at\)\)/.test(app), 'FX3-2. a later number waits its gap (the line of fire too)');
  ok(/function envCardsFire\(events, m\)/.test(app) && /try\{ envCardsFire\(drawEvents, m\); \}catch\(e\)\{\}/.test(app), 'FX3-2. the Environment card of an effect that fires is lit');
  ok(/\.card-tile\.env-card\.is-firing\{[^}]*rotate\(0deg\)/.test(tpl) && /\.env-shine::after/.test(tpl), 'FX3-2. it straightens, lifts and shines (CSS)');
  ok(/function groundBoilVfx\(ev\)/.test(app) && /\.ground-boil \.gb-pool/.test(tpl), 'FX3-1. the ground boils under the unit (groundBoilVfx, CSS)'); }
// ---- UI4-3: one row, Swap Again
{ const f = fnSrc('openMultiDeckSwap');
  ok(/const MULTI_SWAP_AGAIN_MS = 800;/.test(app) && /MULTI_SWAP_AGAIN_MS\)/.test(f), 'UI4-3. "Swap Again" comes 0.8 s after a swap');
  ok(!/ds3-row/.test(f) && /ds2-stage/.test(f) && /\.slice\(0, 3\)/.test(f), 'UI4-3. one row in the one-card window\'s style, up to 3 cards a side');
  ok(/outGone\.add\(tOut\)/.test(f) && /filter\(k=> !outGone\.has\(k\)\)/.test(f), 'UI4-3. a deck card swapped out is out of the running');
  ok(T['ui.fx4-swap-again'] === 'Swap Again' && T['ui.fx4-swap-done'] === 'Done', 'UI4-3. the button texts'); }
// ---- Tutorials: "Exit"
ok(T['map.tu2-exit'] === 'Exit' && /\$\{tut \? escapeHtml\(TX\('map\.tu2-exit'\)\)/.test(app), 'Tutorial: the start map\'s way out says "Exit"');
// ---- texts in the 12 packs
{ const CODES = ['fr', 'de', 'es', 'it', 'pt', 'tl', 'ta', 'id', 'zh-Hans', 'zh-Hant', 'ja', 'ko'];
  const keys = ['ui.fx-scorched', 'ui.fx-scorched-short', 'ui.fxx-scorched', 'ui.fx-name-wildfire', 'ui.fx-wildfire', 'ui.fx-wildfire-short', 'ui.fxx-wildfire', 'ui.fx-wildfire-sweep-log',
    'ui.fx4-fire-resistance', 'ui.sk-bulwark-codex', 'ui.sk-backstab-codex', 'map.tu2-exit', 'ui.fx4-swap-again', 'ui.fx4-swap-done', 'ui.fx4-swap-say', 'ui.fx4-swap-say-again', 'ui.fx4-swap-prev-pack', 'ui.fx4-swap-next-pack'];
  CODES.forEach(c=>{ const pk = JSON.parse(fs.readFileSync(path.join(ROOT, 'lang', c + '.json'), 'utf8')), cards = JSON.parse(fs.readFileSync(path.join(ROOT, 'lang', 'cards', c + '.json'), 'utf8'));
    const miss = keys.filter(k=> !pk[T[k]]); ok(!miss.length && cards['Lava Waders'], `texts: ${c} has the FX4 rows and the Lava Waders name (${miss})`); }); }
console.log(fail ? `fx4-2026-10-23: ${fail} of ${checks} failed` : `fx4-2026-10-23: all ${checks} passed`);
process.exit(fail ? 1 : 0);
