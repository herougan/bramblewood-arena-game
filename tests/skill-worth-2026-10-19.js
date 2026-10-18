#!/usr/bin/env node
// 2026-10-19 (package SW, owner 00:19: "defining the N-worth of skills. Only way is to run experiments with test units with each
// skill ... e.g. arrow does low dmg but allows you a chance to snipe glass cannons."): checks that
//   1. tools/skill_worth.js drives the live engine (makeSimEngine, no copied rules) and is deterministic: the same seeds give the
//      same games, a test unit with no skill plays exactly like the vanilla baseline (common random numbers), and a tiny
//      measurement (2 games a point) comes out the same twice;
//   2. the worth maths: Budget-v3 units (S = (ΔHealth + 2 ΔAttack) / 2), trigger weight = S / S(On Spawn), action value per point,
//      the robust per-N fit, a clamped side leaning on the other;
//   3. every canonical/skill-costs.json entry has measuredS (with a confidence) or measuredWhy, value untouched by the tool;
//   4. the outputs: docs/skill-worth-2026-10-19.md (method + the 20 biggest gaps), .xlsx, docs/balance/skill-worth-2026-10-19.json;
//   5. the hub's Skill costs tab shows measuredS next to each value with an Apply button (and the built hub carries it).
'use strict';
const fs = require('fs'), path = require('path');
const ROOT = path.join(__dirname, '..');
const rd = rel=> fs.readFileSync(path.join(ROOT, rel), 'utf8');
let fail = 0, checks = 0; const ok = (c, m)=>{ checks++; if(!c){ fail++; console.log('  ✗', m); } };
const SW = require(path.join(ROOT, 'tools', 'skill_worth.js'));
const table = JSON.parse(rd('canonical/skill-costs.json'));

// 1. the harness
const src = rd('tools/skill_worth.js');
ok(/require\(path\.join\(ROOT, 'bramblewood-engine\.js'\)\)/.test(src) && /E\.makeSimEngine\(defs,/.test(src), 'skill_worth.js plays the live engine (makeSimEngine)');
ok(!/function (resolveCombat|aiTakeTurn|dodgeCheck)\b/.test(src), 'no copied engine rules in the harness');
ok(/battleMode:'open', rules: rules \|\| \{\}, aiAim:true, aiLevel:1/.test(src), 'Open battles, both seats Smart with aiAim');
const lab = SW.makeLab({games:6}), b2 = SW.BASELINES.find(b=> b.id === 'b2');
ok(SW.BASELINES.map(b=> `${b.attack}/${b.health}/${b.wait}/${b.cost}`).join(' ') === '2/8/1/1 4/14/2/1 6/22/3/1', 'baselines 2/8 W1, 4/14 W2, 6/22 W3 at Lumber 1');
const v = lab.vanilla(b2, 0, 0), same = lab.unit('sw-same', b2, {}), armor = lab.unit('sw-armor', b2, {effects:{armor:1}});
const x1 = lab.batch(armor, {[armor]:20}, {[v]:20}, 'plain', 'test', 6, true), x2 = lab.batch(armor, {[armor]:20}, {[v]:20}, 'plain', 'test', 6, true);
ok(JSON.stringify(x1) === JSON.stringify(x2), 'the same seeds give the same games and metrics');
const y = lab.batch(same, {[same]:20}, {[v]:20}, 'plain', 'test', 6, true), z = lab.batch(v, {[v]:20}, {[v]:20}, 'plain', 'test', 6, true);
ok(y.wr === z.wr && JSON.stringify(y.m) === JSON.stringify(z.m), 'a unit with no skill plays exactly like the vanilla baseline (common random numbers)');
ok(x1.m && x1.m.copies > 0 || x1.m.copiesPerGame > 0, 'metrics count the copies that reached the field');
['dealtUnits', 'dealtBramble', 'taken', 'avoided', 'kills', 'deaths', 'survival', 'fires'].forEach(k=> ok(typeof x1.m[k] === 'number', `metric ${k} per copy`));
ok(x1.m.avoided > 0, 'Armor 1 shows up as damage avoided (soaked)');
// a tiny measurement, twice, on fresh labs
const tiny = (()=>{ const runs = SW.plan(table, SW.makeLab({games:2}).defs, {baselines:['b1'], mid:'b1', combos:0}).filter(r=> r.kind === 'skill' && r.id === 'armor' && r.ctx === 'plain' && !r.tag); return runs[0]; })();
ok(tiny && tiny.b === 'b1' && tiny.value === 1, 'the plan has Armor at its typical value (1) on b1');
if(tiny){ const m1 = SW.makeLab({games:2}).measure(tiny), m2 = SW.makeLab({games:2}).measure(tiny); delete m1.ms; delete m2.ms;
  ok(JSON.stringify(m1) === JSON.stringify(m2), 'a tiny measurement is deterministic');
  ok(m1.S && typeof m1.S.all === 'number' && typeof m1.h2h.dh === 'number' && typeof m1.ref.da === 'number', 'a measurement reports ΔHealth, ΔAttack and S');
  ok(Math.abs(m1.S.h2h - (m1.h2h.dh + 2 * m1.h2h.da) / 2) < 0.02, 'head-to-head S = (ΔHealth + 2 ΔAttack) / 2 (Budget-v3 units)');
  ['glass', 'tank', 'flyer', 'swarm', 'mixed'].forEach(o=> ok(m1.ref.per[o], `pool has ${o}`)); }
// the plan covers the table
const plan = SW.plan(table, lab.defs, {});
const planned = new Set(plan.map(r=> r.kind + ':' + r.id));
table.skills.forEach(e=> ok(planned.has('skill:' + e.id) || planned.has('param:' + e.id) || SW.WHY[e.id], `skill ${e.id} is planned or has a reason`));
table.triggers.forEach(e=> ok(planned.has('trigger:' + e.id) || e.id === 'bounty' || e.inEngine === false, `trigger ${e.id} is planned`));
table.actions.forEach(e=> ok(planned.has('action:' + e.id), `action ${e.id} is planned`));
ok(plan.some(r=> r.kind === 'skill' && r.id === 'swimmer' && r.ctx === 'tide') && plan.some(r=> r.id === 'darksight' && r.ctx === 'dark') && plan.some(r=> r.id === 'nocturnal' && r.ctx === 'night'), 'field-bound skills also run under their field');
ok(plan.some(r=> r.id === 'armor' && r.n === 2) && plan.some(r=> r.id === 'armor' && r.n !== 1 && r.n !== 2), 'N-scaling skills run at 2-3 N');
ok(!plan.some(r=> r.effects && r.effects.onDeathSpawn && lab.defs[r.effects.onDeathSpawn.defId] && lab.defs[r.effects.onDeathSpawn.defId].pool), 'no pool card in the plan');

// 2. the maths on made-up runs
const fake = (kind, id, b, S, extra)=> Object.assign({key:[kind, id, '', 'plain', b, ''].join('|'), kind, id, b, ctx:'plain', value:1, n:1, S:{all:S, h2h:S, ref:S, se:0.2}, h2h:{clamp:null}, ref:{clamp:null, per:{}}, metrics:{mirror:{fires:1}, pool:{fires:1}}}, extra || {});
const agg = SW.aggregate(table, [fake('trigger', 'onSpawn', 'b2', 4), fake('trigger', 'onAttack', 'b2', 10), fake('action', 'damage', 'b2', 4, {per:2}),
  fake('skill', 'armor', 'b2', 3, {value:1, n:1}), fake('skill', 'armor', 'b2', 6, {key:'skill|armor|2|plain|b2|n2', value:2, n:2, tag:'n2'}), fake('skill', 'armor', 'b2', 40, {key:'skill|armor|5|plain|b2|n5', value:5, n:5, tag:'n5'})]);
ok(agg.entries.triggers.onSpawn.measuredS === 1 && agg.entries.triggers.onAttack.measuredS === 2.5, 'trigger weight = S / S(On Spawn)');
ok(agg.entries.actions.damage.measuredS === 2, 'action value = S / (weight × amount)');
ok(agg.entries.skills.armor.measuredS === 3, 'scale n: the median of S / N (Armor 5 as a wall does not drag it)');
ok(agg.entries.skills.prayer.why && agg.entries.skills.leader.why, 'entries that can\'t be measured on plain decks say why');

// 3. the table
['skills', 'triggers', 'actions', 'modifiers'].forEach(f=> table[f].forEach(e=>{
  const has = typeof e.measuredS === 'number' && isFinite(e.measuredS), why = typeof e.measuredWhy === 'string' && e.measuredWhy.length > 5;
  ok(has || why, `${f}: ${e.id} has measuredS or a reason`);
  if(has) ok(['high', 'medium', 'low'].includes(e.measuredConf), `${f}: ${e.id} has a confidence`);
  ok(typeof e.value === 'number', `${f}: ${e.id} keeps its value`); }));
Object.entries(table.shorthands || {}).forEach(([k, sh])=> ok(typeof sh.measuredS === 'number' || (typeof sh.measuredWhy === 'string' && sh.measuredWhy), `shorthand ${k} has measuredS or a reason`));
// package GI's skills (merged 2026-10-19) are measured with what they need
['hunter', 'executioner', 'detonate', 'proliferate', 'brittle', 'prayerWard', 'fieldBreaker'].forEach(id=> ok(!table.skills.find(e=> e.id === id) || plan.some(r=> r.id === id), `GI skill ${id} is planned`));
ok(plan.some(r=> r.id === 'hunter' && r.tag === 'vs-bleed') && plan.some(r=> r.id === 'hunter' && r.tag === 'vs-wet' && r.ctx === 'rain'), 'Hunter runs per status');
ok(plan.some(r=> r.id === 'prayerWard' && r.effects.prayer) && plan.some(r=> r.id === 'fieldBreaker' && r.ctx === 'thunder'), 'Prayer Ward with Prayer, Field Breaker under a field');
ok(!table.shorthands.kinRally || plan.some(r=> r.id === 'kinRally' && r.archetypes && r.tag === 'enabler'), 'Kin Rally in a tribe deck, with the tribe control');
ok(table.triggers.find(t=> t.id === 'onDeath').value === 1 && table.triggers.find(t=> t.id === 'onAllyPlayed').value === 2.5, 'the owner\'s seeds are untouched (value)');
ok(/package SW/.test(table.measured || ''), 'the table says what measuredS is');
ok(/measuredS/.test(src) && /value is unchanged/.test(src) && !/e\.value = x\.measuredS/.test(src), 'the tool writes measuredS, never value');

// resumable runs (2026-10-19, after a container restart lost the first full run): checkpoint + setup cache + time budget + shards
ok(/--budget-s=/.test(src) && /--shard=/.test(src) && /--setups-only/.test(src) && /appendFileSync\(ckOut/.test(src) && /function restore\(ctx, b, key\)/.test(src), 'the run checkpoints, caches setups, stops on a time budget and shards');
// a solve off its range is a bound (measuredOff), a half-miss skill's measuredS is the S on top of the ×missMult
['skills', 'triggers', 'actions', 'modifiers'].forEach(f=> table[f].forEach(e=>{ if(e.measuredOff) ok(['>', '<'].includes(e.measuredOff) && typeof e.measuredS === 'number', `${e.id}: measuredOff is a bound`); }));
ok(/half-miss: value = \(S − /.test(src) && /\(missMult − 1\) × \(2A \+ H\)/.test(src), 'half-miss skills compare against (missMult − 1)(2A + H)');
ok(/m\.off === '>' \? '≥'/.test(rd('tools/hub/skill_costs_tab.js')), 'the hub shows an off-the-scale value as a bound');

// 4. outputs
const J = path.join(ROOT, 'docs', 'balance', 'skill-worth-2026-10-19.json'), MD = path.join(ROOT, 'docs', 'skill-worth-2026-10-19.md'), XL = path.join(ROOT, 'docs', 'skill-worth-2026-10-19.xlsx');
ok(fs.existsSync(J) && fs.existsSync(MD) && fs.existsSync(XL), 'the json, md and xlsx exist');
if(fs.existsSync(J)){ const data = JSON.parse(fs.readFileSync(J, 'utf8'));
  ok(data.results.length > 900 && data.G >= 40, `the full run (${data.results.length} runs, ${data.G} games a point)`);
  ok(['b1', 'b2', 'b3'].every(b=> data.results.some(r=> r.b === b && r.kind === 'skill')), 'all three baselines');
  const errs = data.results.filter(r=> r.error); ok(errs.length <= 5, 'at most a handful of engine errors: ' + errs.map(r=> r.id).join(', '));
  const ar = data.results.find(r=> r.kind === 'skill' && r.id === 'arrow' && r.b === 'b2' && r.ctx === 'plain' && !r.tag);
  ok(ar && ar.ref.per.glass && typeof ar.ref.per.glass.S === 'number' && ar.metrics.pool.kills >= 0, 'Arrow has its worth against glass cannons and its kills');
  ok(data.gaps && data.gaps.length >= 20, 'the report lists the gaps'); }
if(fs.existsSync(MD)){ const md = fs.readFileSync(MD, 'utf8');
  ok(/## Method/.test(md) && /## The 20 biggest gaps/.test(md) && (md.match(/^\| \d+ \|/gm) || []).length >= 20, 'the md has the method and the 20 biggest gaps');
  ok(/Arrow and Snipe/.test(md), 'the md answers the owner\'s Arrow example');
  ok(/biggest gaps at high or medium confidence/.test(md) && /Caveats/.test(md), 'the md has the confident gaps and the caveats');
  ok(!table.skills.some(e=> e.measuredOff) || /\*\*Off the scale\*\*/.test(md), 'off-the-scale entries are listed apart'); }

// 5. the hub
const tab = rd('tools/hub/skill_costs_tab.js'), css = rd('tools/hub/hub_app.css');
ok(/e\.measuredS/.test(tab) && /data-apply=/.test(tab) && /setValue\(ap\.dataset\.apply, m\.v, true\)/.test(tab), 'the tab shows measuredS and Apply sets the value (an ordinary saved edit)');
ok(/biggest gap to measured first/.test(tab) && /measuredWhy/.test(tab), 'sort by the gap to measured; the reason when not measured');
ok(/\.sc-ms\{/.test(css) && /\.sc-apply\{/.test(css), 'the measured column has its styles');
// the freshly built hub (.hub/, tools/hub/build_hub.py) or, without one, the published snapshot in hub/ once it has the column
const built = [path.join(ROOT, '.hub', 'index.html'), path.join(ROOT, 'hub', 'index.html')].find(f=> fs.existsSync(f) && (f.includes('.hub') || fs.readFileSync(f, 'utf8').includes('sc-ms')));
if(built){ const h = fs.readFileSync(built, 'utf8'); ok(h.includes('"measuredS"') && h.includes('sc-apply'), 'hub/index.html carries measuredS and the Apply button'); }
console.log(`skill-worth: ${checks - fail}/${checks} passed`);
process.exit(fail ? 1 : 0);
