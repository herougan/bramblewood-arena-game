#!/usr/bin/env node
// 2026-10-23 (package FX3, owner 01:57 notes 3 and 7): the volcano family by shape (every round 1, a single-target chance hit 2, a fight's
// own number at most 3), Scorched Ground as a line of fire (every front unit, 1, left to right, no roll), one ground fire a fight (Map 20's
// big fights no longer burn twice: Scorching AND Scorched Ground), and the texts (no "Burns a unit a side for 5").
//   "volcano's effects haven't been scaled down - to deal 1 damage for every turn ones, 2 for single target or higher if rare and
//    single-target. (max 3) The burning from scorched ground seems to be hitting twice as well.."
'use strict';
const fs = require('fs'), path = require('path');
const H = require('./lib/harness.js');
const E = H.Engine;
let fail = 0, checks = 0; const ok = (c, m)=>{ checks++; if(!c){ fail++; console.log('  ✗', m); } };
const so = id=> id===1 ? 'A' : 'B';
const U = (id, o)=> Object.assign({id, name:id, attack:0, health:500, wait:0, cost:0, effects:{}}, o || {});
const defs = Object.assign({}, H.loadCardDefs(), {'x3-wall': U('x3-wall'), 'x3-hot': U('x3-hot', {resist:['heat']}), 'x3-climb': U('x3-climb', {effects:{mountainClimber:true}})});
const all = pl=> [...pl.row.left, ...pl.row.center, ...pl.row.right];
function mk(rules, seed){ const e = E.makeSimEngine(defs, E.mulberry32(seed || 7), {recordEvents:true, battleMode:'open', rules}); return {e, P:{1:e.newPlayer(1, {}), 2:e.newPlayer(2, {})}}; }
function put(e, P, pid, id, slot){ const pl = P[pid]; e.debugSpawnCard(P, so, pid, id, 'left', {}, []);
  const c = all(pl).reduce((a, x)=> (!a || x.uid > a.uid) ? x : a, null); c.slot = slot;
  const cs = all(pl); pl.row.center = cs.filter(x=> x.slot === 0); pl.row.left = cs.filter(x=> x.slot < 0).sort((a, b)=> b.slot - a.slot); pl.row.right = cs.filter(x=> x.slot > 0).sort((a, b)=> a.slot - b.slot);
  e.syncSlots(pl); return c; }
const lost = c=> 500 - c.hp;

// ---- 1. Scorched Ground: a line of fire, every front unit 1, in sweep order, the same every time
const sweep = (rules, seed)=>{ const {e, P} = mk(rules, seed); const us = [];
  [-2, -1, 0, 1, 2].forEach(s=> us.push(put(e, P, 1, 'x3-wall', s))); [-1, 0, 1].forEach(s=> us.push(put(e, P, 2, 'x3-wall', s)));
  const hot = put(e, P, 2, 'x3-hot', 2), cl = put(e, P, 2, 'x3-climb', -2);
  const ev1 = []; e.roundStart(P, 1, so, {}, ev1); const ev = []; e.roundStart(P, 2, so, {}, ev); return {us, hot, cl, ev1, ev, e}; };
{ const r = sweep({eruption:5});
  ok(!r.ev1.some(x=> x.field === 'scorched' || x.field === 'scorchedSweep'), '1. nothing burns in round 1');
  ok(r.us.every(c=> lost(c) === 1), `1. every unit on both front lines takes 1, whatever the number (5 here) (${r.us.map(lost)})`);
  ok(lost(r.hot) === 0 && lost(r.cl) === 0, `1. a fire-resistant unit and a Mountain Climber are spared (${lost(r.hot)}, ${lost(r.cl)})`);
  const hd = r.ev.find(x=> x.field === 'scorchedSweep'), hits = r.ev.filter(x=> x.field === 'scorched');
  ok(hd && r.ev.indexOf(hd) < r.ev.indexOf(hits[0]) && hd.dmg === 1, '1. one sweep header first, then the hits');
  ok(hits.length === 8 && hits.every(x=> x.dmg === 1 && x.col != null), `1. one 'scorched' event a unit burned, with its column (${hits.length})`);
  ok(hits.every((x, i)=> i === 0 || hits[i - 1].col <= x.col), `1. left to right (${hits.map(x=> x.col)})`);
  const a = sweep({eruption:2}, 3).ev.filter(x=> x.type === 'fieldTick').map(x=> x.field + x.uid).join(), b = sweep({eruption:2}, 99).ev.filter(x=> x.type === 'fieldTick').map(x=> x.field + x.uid).join();
  ok(a === b, '1. no roll: the same board burns the same way on any seed');
  ok(r.e.forecast().eruption === 1 && r.e.forecast().scorched, '1. the forecast says Scorched Ground, 1'); }
// ---- 2. by shape: every round 1, a single-target chance hit 2, a fight's own number at most 3
const one = rules=>{ const {e, P} = mk(Object.assign({volcano:'verylow', lavaTideChance:0, petrifyChance:0, eruptionChance:0}, rules)); const a = put(e, P, 1, 'x3-wall', 0); put(e, P, 2, 'x3-wall', 0); e.roundStart(P, 2, so, {}, []); return lost(a); };
ok(one({eruptionChance:100}) === 2, `2. Eruption: 2 (${one({eruptionChance:100})})`);
ok(one({eruptionChance:100, eruption:3}) === 3 && one({eruptionChance:100, eruption:5}) === 3, '2. a fight\'s Eruption number: 3 at most (a world boss\'s 5 lands 3)');
ok(one({lavaTideChance:100}) === 2, `2. Lava Tide: 2 to the column's unit a side (${one({lavaTideChance:100})})`);
{ const {e, P} = mk({volcano:'verylow', lavaTideChance:0, petrifyChance:0, eruptionChance:100}); const a = put(e, P, 1, 'x3-wall', 0); put(e, P, 2, 'x3-wall', 0);
  e.roundStart(P, 2, so, {}, []); const ev = []; e.roundStart(P, 3, so, {}, ev); ok(ev.filter(x=> x.field === 'comet').every(x=> x.dmg === 1), '2. comets: 1 to every unit'); }
for(const L of [1, 2, 3]){ const {e, P} = mk({field:'heatwave', heatLevel:L}); const us = [-2, -1, 0, 1, 2].map(s=> put(e, P, 1, 'x3-wall', s)); const ev = []; e.roundStart(P, 2, so, {}, ev);
  const hit = us.filter(c=> lost(c) > 0); ok(hit.length === L + 1 && hit.every(c=> lost(c) === 1), `2. Scorching ${'I'.repeat(L)}: ${L + 1} units a side, 1 each (${us.map(lost)})`); }
{ const {e, P} = mk({lavaSpout:3}); const a = put(e, P, 1, 'x3-wall', 0); e.roundStart(P, 2, so, {}, []); ok(lost(a) === 1, `2. Lava Spout 3: 1 (every round) (${lost(a)})`); }
{ const {e, P} = mk({ashRain:4}); put(e, P, 1, 'x3-wall', 0); const h0 = P[1].hq.hp; e.roundStart(P, 2, so, {}, []); ok(h0 - P[1].hq.hp === 1, `2. Ash Rain 4: 1 to a bramble (every round) (${h0 - P[1].hq.hp})`); }

// ---- 3. the fights: one ground fire, the numbers, the card text
const B = require('../tools/lib_bramble.js'), G = B.G;
const node = (mid, key)=> G.CONQUEST_MAPS.find(m=> m.id === mid).nodes.find(n=> n.key === key);
['20-5', '20-6', '20-7', '20-8', '20-9', '20-10'].forEach(k=>{ const r = G.fightRules('m11', node('m11', k));
  ok(Number(r.eruption) > 0 && r.field !== 'heatwave' && !r.heatLevel, `3. ${k}: Scorched Ground's line of fire, no Scorching on top (${r.field}, ${r.eruption})`); });
{ const r = G.fightRules('m22', node('m22', '22-7')); ok(Number(r.eruption) > 0 && r.field !== 'heatwave', '3. 22-7: one ground fire too'); }
{ const r = G.fightRules('m22', node('m22', '22-8')); ok(r.eruption === 3 && r.volcano === 'low', `3. 22-8 (volcano odds, a miniboss): its Eruption hits 3 (${r.eruption})`);
  ok(G.fightRules('m11', node('m11', '20-10')).eruption === 3, '3. a world boss\'s number is 3 (was 5)');
  ok(G.fightRules('m5', node('m5', '14-5')).field === 'heatwave', '3. Scorching stays where there is no Scorched Ground (14-5)'); }
const app = fs.readFileSync(path.join(__dirname, '..', 'arena_app.js'), 'utf8'), tx = fs.readFileSync(path.join(__dirname, '..', 'bramblewood-texts.js'), 'utf8');
ok(!/'', `Burns a unit a side for/.test(app), '3. the field card no longer says "Burns a unit a side for N"');
ok(/add\('eruption', '🔥', SCORCHED_NAME, scorchedGroundText\(\), '', TX\('ui\.fx-scorched-short'\)/.test(app), '3. the Scorched Ground card reads its TX lines');
ok(/"ui\.fx-scorched": "From round 2, a line of fire sweeps past each round: 1 fire damage to every unit it touches\."/.test(tx) && /"ui\.fx-scorched-short": "A line of fire: 1 to every unit"/.test(tx), '3. TX: the line of fire, 1');
ok(/"ui\.fx-lava-tide": "[^"]*2 fire damage/.test(tx) && /"ui\.fx-scorching3": "[^"]*4 random units on each side take 1 fire/.test(tx), '3. TX: Lava Tide 2, Scorching III 1');
ok(!/take [23] fire damage\. Heat-resistant/.test(app + tx), '3. no Scorching text says 2 or 3 damage');
const CODES = ['fr', 'de', 'es', 'it', 'pt', 'tl', 'ta', 'id', 'zh-Hans', 'zh-Hant', 'ja', 'ko'];
const keys = ['ui.fx-scorched', 'ui.fx-scorched-short', 'ui.fxx-scorched', 'ui.fx-scorched-sweep-log', 'ui.fx-lava-tide', 'ui.fx-scorching1', 'ui.fx-scorching2', 'ui.fx-scorching3'];
const en = k=>{ const m = new RegExp('"' + k.replace(/\./g, '\\.') + '": "((?:[^"\\\\]|\\\\.)*)"').exec(tx); return m ? JSON.parse('"' + m[1] + '"') : null; };
CODES.forEach(c=>{ const pk = JSON.parse(fs.readFileSync(path.join(__dirname, '..', 'lang', c + '.json'), 'utf8')); const miss = keys.filter(k=> !pk[en(k)]); ok(!miss.length, `3. ${c}: the ${keys.length} FX3 texts are translated (${miss})`); });
// ---- 4. the line of fire on screen: the Effects Lab's Wildfire front, each number as the band reaches the card
ok(/function scorchSweepVfx\(ev\)/.test(app) && /B\.wildfire\(bf, \{host: bf, duration: ms \/ 1000\}\)/.test(app), '4. the sweep plays FX.B.wildfire over the battlefield');
ok(/'scorched', 'scorchedSweep'\]\.includes\(ev\.field\)/.test(app), '4. the generic field float leaves Scorched Ground to the sweep (one number a hit)');
ok(/dnFloat\(host, ev\.dmg, \{type:'heat', mods: ev\.mods, fit:true\}\)/.test(app), '4. the number is DN\'s fire number');
ok(/const D = Number\(opts\.duration\) > 0/.test(fs.readFileSync(path.join(__dirname, '..', 'bramblewood-fx-b.js'), 'utf8')), '4. FX.B.wildfire takes the fight\'s duration');
console.log(fail ? `fx3-2026-10-23: ${fail} of ${checks} failed` : `fx3-2026-10-23: all ${checks} passed`);
process.exit(fail ? 1 : 0);
