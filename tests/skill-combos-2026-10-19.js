#!/usr/bin/env node
// 2026-10-19 (package DC, owner 08:10: "Have you tested & costed all skills yet? We can do a sample testing with duo-skill combos,
// 1,000-2,000 times."): checks that
//   1. tools/skill_combo.js runs on SW's lab (the live engine) and a tiny pair measurement is deterministic: the same pair twice on
//      fresh labs gives the same numbers, and a pair with a skill that has nothing to act on plays its partner's games;
//   2. the plan: the ~40 skills live cards print most, every pair of them, every pair live cards print together (2+ cards), the
//      owner's targeted pairs, a single for every skill of a pair in that pair's field;
//   3. the results: every planned pair has a measured row (pair worth, both singles, interaction, its error, ~1,000+ games), the
//      interaction model (families, the per-pair table), the md / xlsx / json outputs;
//   4. coverage: the 9 triggers that never fired, the 5 off-scale entries, Gain / Bounty, Crepuscular, each with a scenario result or
//      a reason; canonical/skill-costs.json carries them as measured fields and `value` is untouched;
//   5. the hub's Skill costs tab has the Combos view.
'use strict';
const fs = require('fs'), path = require('path');
const ROOT = path.join(__dirname, '..');
const rd = rel=> fs.readFileSync(path.join(ROOT, rel), 'utf8');
let fail = 0, checks = 0; const ok = (c, m)=>{ checks++; if(!c){ fail++; console.log('  ✗', m); } };
const C = require(path.join(ROOT, 'tools', 'skill_combo.js'));
const table = JSON.parse(rd('canonical/skill-costs.json'));
const src = rd('tools/skill_combo.js');

// 1. the harness: a tiny deterministic pair run (2 games a point, a throwaway setup dir so the calibrated setups are not touched)
ok(/require\(path\.join\(__dirname, 'skill_worth\.js'\)\)/.test(src) && !/function (resolveCombat|aiTakeTurn)\b/.test(src), 'skill_combo.js builds on skill_worth.js (the live engine), no copied rules');
const os = require('os'), tmp = fs.mkdtempSync(path.join(os.tmpdir(), 'dc-'));
const SWS = path.join(ROOT, 'docs', 'balance', 'skill-worth-partial-setups');
if(fs.existsSync(SWS)) fs.readdirSync(SWS).filter(f=> /^plain-b2-/.test(f)).forEach(f=> fs.copyFileSync(path.join(SWS, f), path.join(tmp, f)));
const run = {key:'t|armor+poison', kind:'pair', ids:['armor', 'poison'], ctx:'plain', b:'b2', effects:{armor:1, poison:2}};
const tiny = ()=>{ const m = C.measureLite(C.makeLab({setupDir: tmp}), run, 2); delete m.ms; return m; };
let t1 = null, t2 = null;
try{ t1 = tiny(); t2 = tiny(); }catch(e){ ok(false, 'tiny pair run: ' + e.message); }
if(t1){ ok(JSON.stringify(t1) === JSON.stringify(t2), 'a tiny pair run is deterministic (the same seeds give the same numbers)');
  ok(typeof t1.S.all === 'number' && typeof t1.solve.dh === 'number' && typeof t1.solve.da === 'number' && t1.games > 0, 'a pair run reports S, ΔHealth, ΔAttack and its games');
  ok(Math.abs(t1.S.all - (t1.solve.dh + 2 * t1.solve.da) / 2) < 0.02, 'S = (ΔHealth + 2 ΔAttack) / 2 (Budget-v3 units)');
  const nul = C.measureLite(C.makeLab({setupDir: tmp}), {key:'t|armor', kind:'single', ids:['armor'], ctx:'plain', b:'b2', effects:{armor:1}}, 2),
    nul2 = C.measureLite(C.makeLab({setupDir: tmp}), {key:'t|armor+pierce', kind:'pair', ids:['armor', 'pierce'], ctx:'plain', b:'b2', effects:{armor:1, pierce:true}}, 2);
  ok(nul.S.all === nul2.S.all && nul.wr.mirror === nul2.wr.mirror, 'Pierce (no Armor on the foes) adds nothing: the pair plays its partner\'s games'); }
try{ fs.rmSync(tmp, {recursive:true, force:true}); }catch(e){}

// 2. the plan
const plan = C.pairPlan(table), cards = JSON.parse(rd('canonical/cards.json')).filter(c=> !c.pool && !c.token);
const cnt = {}; cards.forEach(c=> Object.keys(c.effects || {}).forEach(k=> cnt[k] = (cnt[k] || 0) + 1));
ok(plan.top.length >= 40 && plan.top.slice(40).every(k=> cnt[k] === cnt[plan.top[39]]), `the 40 skills live cards print most + the ties at the cutoff (${plan.top.length}; left out: no effect alone, a parameter, or a rare field)`);
ok(plan.top.every((k, i)=> i === 0 || cnt[plan.top[i - 1]] >= cnt[k]), 'the 40 are in order of how many live cards print them');
ok(Object.keys(plan.pairs).length >= 780, `all pairs among the 40 + live + targeted (${Object.keys(plan.pairs).length})`);
const mustPairs = [];
for(let i = 0; i < plan.top.length; i++) for(let j = i + 1; j < plan.top.length; j++) mustPairs.push([plan.top[i], plan.top[j]].sort().join('+'));
const skippedK = new Set(plan.skipped.map(s=> s.pair));
ok(mustPairs.every(k=> plan.pairs[k] || skippedK.has(k)), 'every pair among the 40 is planned or skipped with a reason');
Object.entries(plan.together).filter(([, n])=> n >= 2).forEach(([k])=>{ const kk = k.split('+').sort().join('+'); ok(plan.pairs[kk] || skippedK.has(kk), `live pair ${k} is planned or has a reason`); });
plan.skipped.forEach(s=> ok(s.why && s.why.length > 10, `skipped ${s.pair} says why`));
[['poison', 'proliferate'], ['arrow', 'flying'], ['taunt', 'thorns'], ['freeze', 'frostbite']].forEach(p=> ok(plan.pairs[p.sort().join('+')], `targeted pair ${p.join(' + ')}`));
Object.values(plan.pairs).forEach(p=> p.ids.forEach(id=> ok(plan.runs.some(r=> r.kind === 'single' && r.ids[0] === id && r.ctx === p.ctx), `single ${id} in ${p.ctx}`)));

// 3. results
const J = path.join(ROOT, 'docs', 'balance', 'skill-combos-2026-10-19.json'), MD = path.join(ROOT, 'docs', 'skill-combos-2026-10-19.md'), XL = path.join(ROOT, 'docs', 'skill-combos-2026-10-19.xlsx');
ok(fs.existsSync(J) && fs.existsSync(MD) && fs.existsSync(XL), 'the json, md and xlsx exist');
let data = null;
if(fs.existsSync(J)){ data = JSON.parse(fs.readFileSync(J, 'utf8'));
  const have = new Set(data.pairs.map(r=> [r.a, r.b].sort().join('+') + '@' + r.ctx));
  // 2026-10-19 (package SK1): Demolisher was folded into Siege after these runs, so Siege (now on 8 live cards) entered the 40; its pairs
  // wait for the next tools/skill_combo.js run (the estimates say "re-measure": canonical/skill-costs.json sk1Note).
  const SK1_PENDING = new Set(['siege']);
  const miss = Object.values(plan.pairs).filter(p=> !have.has(p.ids.join('+') + '@' + p.ctx) && !p.ids.some(id=> SK1_PENDING.has(id)));
  ok(!miss.length, `every measured pair is present (${miss.length} missing: ${miss.slice(0, 5).map(p=> p.ids.join('+')).join(', ')})`);
  ok(data.G >= 40, `${data.G} games a point`);
  const games = data.pairs.map(r=> r.games).sort((a, b)=> a - b), med = games[Math.floor(games.length / 2)];
  ok(med >= 800, `a pair plays ~1,000 games (median ${med})`);
  data.pairs.forEach(r=>{ if(!(typeof r.S === 'number' && typeof r.Sa === 'number' && typeof r.Sb === 'number' && Math.abs(r.interaction - (r.S - r.Sa - r.Sb)) < 0.02 && ['high', 'medium', 'low'].includes(r.confidence))) ok(false, `pair ${r.pair}: S, singles, interaction = S − S(A) − S(B), confidence`); });
  ok(data.pairs.some(r=> r.confidence !== 'low' && r.interaction > 0) && data.pairs.some(r=> r.confidence !== 'low' && r.interaction < 0), 'synergies and anti-synergies flagged');
  ok(data.model && typeof data.model.global === 'number' && data.model.families.length >= 5 && Array.isArray(data.model.table) && data.model.rmse.additive >= 0, 'the interaction model: a global and per-family multiplier, a per-pair table, their errors');
  ok(data.results.filter(r=> r.error).length <= 5, 'at most a handful of engine errors');
  ok(data.pairs.filter(r=> typeof r.sumSW === 'number').length > data.pairs.length * 0.5, 'pairs compare with the sum of SW\'s single-skill measures too'); }
if(fs.existsSync(MD)){ const md = fs.readFileSync(MD, 'utf8');
  ok(/## Coverage/.test(md) && /## Top synergies/.test(md) && /## Top anti-synergies/.test(md) && /## Interaction model/.test(md), 'the md has coverage, synergies, anti-synergies and the model');
  ok(/\*\*Still open\*\*/.test(md), 'the md lists the remaining gaps'); }

// 4. coverage
const NEVER = ['onAllySpawn', 'onMove', 'onHeal', 'onDiscard', 'onSacrifice', 'onExile', 'onChainBreak', 'onCharge', 'onEnemySpawn'];
NEVER.forEach(id=> ok(C.TRIGGER_SCEN[id], `a scenario deck for ${id}`));
['exile', 'mindControl', 'tsunami', 'acidBolt', 'meteor', 'gain', 'bounty'].forEach(id=> ok(C.MIXED.some(m=> m.id === id), `a mixed-deck damage-equivalent for ${id}`));
if(data){ const ent = data.scenarioEntries || {};
  NEVER.forEach(id=> ok(ent['trigger:' + id] && (typeof ent['trigger:' + id].measuredS === 'number' || ent['trigger:' + id].why), `trigger ${id}: a result or a reason`));
  ['action:exile', 'action:mindControl', 'skill:tsunami', 'skill:acidBolt', 'skill:meteor', 'action:gain', 'shorthand:bounty', 'skill:crepuscular'].forEach(k=> ok(ent[k] && typeof ent[k].measuredS === 'number', `${k}: measured`));
  const sk1New = e=> /^estimate /.test(e.measuredHow || ''); // 2026-10-19 (package SK1): entries added after the runs, with an estimate (2026-10-21, BF5: any later package's estimate: SK2b, BX, BF5)
  ok(data.coverage.length >= table.skills.filter(e=> !sk1New(e)).length + table.triggers.filter(e=> !sk1New(e)).length + table.actions.filter(e=> !sk1New(e)).length, 'the coverage list has every entry (the SK1 estimates aside)');
  ok(!data.coverage.some(r=> r.status === 'no entry'), 'every engine trigger and action has an entry');
  data.coverage.forEach(r=> ok(r.status && (r.status !== 'not measured' || r.why), `${r.kind} ${r.id}: a status, and a reason when not measured`));
  // the table carries them as measured fields
  NEVER.forEach(id=>{ const e = table.triggers.find(t=> t.id === id), s = ent['trigger:' + id]; if(e && s && typeof s.measuredS === 'number') ok(e.measuredS === s.measuredS && /package DC/.test(e.measuredHow || ''), `skill-costs ${id}: measuredS ${s.measuredS} (package DC)`); }); }
// value untouched: the seeds and the applied values are what main has (the tool never writes value)
ok(table.triggers.find(t=> t.id === 'onDeath').value === 1 && table.triggers.find(t=> t.id === 'onMove').value === 0.5, 'value untouched (On Death 1, On Move 0.5)');
ok(!/\.value = s\./.test(src) && /value unchanged/.test(src), 'the tool writes measured fields only');

// 5. the hub
const tab = rd('tools/hub/skill_costs_tab.js'), css = rd('tools/hub/hub_app.css'), bh = rd('tools/hub/build_hub.py');
ok(/data-k="combo"/.test(tab) && /function renderCombos\(\)/.test(tab) && /Anti-synergies/.test(tab) && /Family multipliers/.test(tab), 'the Skill costs tab has the Combos view (synergies, anti-synergies, family multipliers)');
ok(/SC_COMBOS/.test(bh) && /skill-combos-2026-10-19\.json/.test(bh), 'build_hub.py inlines the combos');
ok(/\.sc-cbh\{/.test(css), 'the Combos view has its styles');
console.log(`skill-combos: ${checks - fail}/${checks} passed`);
process.exit(fail ? 1 : 0);
