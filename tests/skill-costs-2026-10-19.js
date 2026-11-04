#!/usr/bin/env node
// 2026-10-18 (package H, owner 19:54: "Your bramble master hub should let me edit N values of all skills, triggers and actions.
// Triggers and actions are costed by How often x How strong. OnDeath is = 1. OnPlay(Ally) = 2.5, OnPlay(Any) = 5 ... Bounty is
// worth 0.5."): checks that
//   1. canonical/skill-costs.json loads, every entry has an id and a number, no id twice in a kind;
//   2. every trigger, action and skill any card uses (and every engine trigger hook / editor action) has an entry;
//   3. a triggered skill's S = trigger weight × action value (Worker Ant, the owner's own examples, Bounty);
//   4. keyword skills cost what they did before (the 2026-10-18 SB_SKILLS code, copied here) and N is unchanged, card by card —
//      except the entries the owner applied the measured worth to (appliedAt, 2026-10-19), which are skipped and reported;
//   4b. (2026-10-19, package TC) the applied entries: each has prevValue, appliedAt, measuredConf high and value = measuredS; the
//      owner-set values (On Death, On Ally Played, Bounty, Supreme, Supreme Tide, True Strike) are unchanged; the post-balance
//      queue (docs/balance/post-balance-queue.json) is exactly the cards the current table puts over budget;
//   5. tools/card_balance.js reads the table through tools/skill_costs.js, and the lib also runs as a plain browser script;
//   6. the hub has the 🧮 Skill costs tab: db collection "skillCosts", no localStorage for the edits, Copy JSON fallback.
'use strict';
const fs = require('fs'), path = require('path'), vm = require('vm');
const ROOT = path.join(__dirname, '..');
const rd = rel=> fs.readFileSync(path.join(ROOT, rel), 'utf8');
let fail = 0, checks = 0; const ok = (c, m)=>{ checks++; if(!c){ fail++; console.log('  ✗', m); } };

// 1. the table
let table = null; try{ table = JSON.parse(rd('canonical/skill-costs.json')); }catch(e){ ok(false, 'skill-costs.json parses: ' + e.message); }
if(!table){ console.log(`skill-costs: ${checks - fail}/${checks} passed`); process.exit(1); }
const KINDS = ['skills', 'triggers', 'actions', 'modifiers'];
KINDS.forEach(k=>{ ok(Array.isArray(table[k]) && table[k].length, `table has ${k}`); const seen = new Set();
  (table[k] || []).forEach(e=>{ ok(e && typeof e.id === 'string' && e.id, `${k}: entry has an id`); ok(typeof e.value === 'number' && isFinite(e.value), `${k}: ${e.id} has a number value`);
    ok(!seen.has(e.id), `${k}: ${e.id} only once`); seen.add(e.id); ok(/^[A-Za-z0-9_.:-]+$/.test(e.id), `${k}: ${e.id} is a valid db doc-id segment`); }); });
table.skills.forEach(e=> ok(['fixed', 'n', 'half', 'mult' /* 2026-10-30 TUT2: Slow is a x0.85 multiplier on the card's S (owner ENG13-2) */].includes(e.scale), `skill ${e.id} has a known scale`));
table.actions.forEach(e=> ok(e.per == null || ['amount', 'amount2', 'count', 'adjacent', 'surrounding', 'allies' /* 2026-11-04 (TESTFIX1): ENG19's Grant Shield fields (owner #15, 2026-11-02) */].includes(e.per), `action ${e.id} has a known per field`));
const ids = k=> new Set(table[k].map(e=> e.id));
const SKI = ids('skills'), TRI = ids('triggers'), ACT = new Set(table.actions.map(e=> e.id.split('.')[0])), alias = table.aliases || {}, SH = table.shorthands || {};
// the owner's seeds (19:54)
const tv = id=> (table.triggers.find(t=> t.id === id) || {}).value;
// 2026-11-04 (TESTFIX1): the owner's own hub edits (Human pass I, 2026-10-22, docs/balance/human-pass-1-2026-10-22.md) set On Death to 0.8 and
// Bounty to 3; BAL2 (2026-10-24, N22-10, call BAL2-4) re-measured Bounty at 2.5 a point
ok(tv('onDeath') === 0.8, 'On Death = 0.8 (owner: 1 on 10-18, 0.8 in Human pass I)'); ok(tv('onAllyPlayed') === 2.5, 'On Ally Played = 2.5 (owner: OnPlay(Ally))');
ok(tv('onAnyPlayed') === 5, 'On Any Played = 5 (owner: OnPlay(Any))'); ok(tv('bounty') === 2.5, 'Bounty = 2.5 (owner 21:36, BF5: 1; Human pass I 3; BAL2 re-measured 2.5)');

// 2. coverage
const cards = JSON.parse(rd('canonical/cards.json'));
const missing = new Set();
cards.forEach(c=> Object.entries(c.effects || {}).forEach(([k, v])=>{
  if(k === 'triggers'){ (Array.isArray(v) ? v : []).forEach(t=>{ if(!t) return; if(!TRI.has(t.on)) missing.add('trigger ' + t.on + ' (' + c.id + ')');
    const a = alias[t.do] || t.do; if(!ACT.has(a)) missing.add('action ' + t.do + ' (' + c.id + ')'); }); return; }
  if(SH[k]){ if(!TRI.has(SH[k].trigger)) missing.add('trigger ' + SH[k].trigger); if(!ACT.has(SH[k].action)) missing.add('action ' + SH[k].action); return; }
  // 2026-11-04 (TESTFIX1): CX2 (2026-10-21) prices context skills such as Transform (Lycanthropy) through bramblewood-budget.js contextS, not a table entry
  if(!SKI.has(k) && !(require(path.join(ROOT, 'tools', 'skill_costs.js')).make(table).cardS({[k]: v}, c).parts.some(p=> p[0] === 'context' && p[1] === k))) missing.add('skill ' + k + ' (' + c.id + ')'); }));
ok(!missing.size, 'every trigger / action / skill a card uses has an entry: missing ' + [...missing].join(', '));
const eng = rd('bramblewood-engine.js'), app = rd('arena_app.js');
const tk = eng.match(/const TRIGGER_KEYS = \[([\s\S]*?)\];/); ok(tk, 'engine TRIGGER_KEYS found');
if(tk) (tk[1].replace(/\/\/[^\n]*/g, '').match(/'(\w+)'/g) || []).map(s=> s.slice(1, -1)).forEach(k=> ok(TRI.has(k), `engine trigger ${k} has a weight`));
['onCharge', 'onChainBreak'].forEach(k=> ok(TRI.has(k), `engine hook ${k} has a weight`));
const ad = app.indexOf('const ACTION_DEFS = ['), ae = app.indexOf('\n];', ad); ok(ad > 0, 'ACTION_DEFS found');
(app.slice(ad, ae).match(/^\s*\{key:'(\w+)'/gm) || []).map(s=> s.match(/'(\w+)'/)[1]).forEach(k=> ok(ACT.has(k), `editor action ${k} has a value`));

// 3. trigger × action
const SC = require(path.join(ROOT, 'tools', 'skill_costs.js')), T = SC.make(table);
const av = id=> (table.actions.find(a=> a.id === id) || {}).value;
// 2026-11-04 (TESTFIX1): SKILL2 (2026-10-31, call BUDGET2-1) gave measured trigger-and-action pairs their own factor (table.pairs["on>do"].mult),
// and the costs round to 2 places: a trigger's S = weight x value x pair factor
const pm = (on, d)=> ((table.pairs || {})[on + '>' + d] || {}).mult || 1, r2c = v=> Math.round(v * 100) / 100;
const ant = cards.find(c=> c.id === 'worker-ant'), at = ant && ant.effects.triggers[0];
ok(ant && at.on === 'onAttack' && at.do === 'drawCard', 'Worker Ant is still On Attack: Draw (the sample card)');
if(ant){ const want = tv('onAttack') * av('drawCard') * (at.count || 1), parts = T.cardS(ant.effects, ant).parts.filter(p=> p[0] === 'trigger');
  ok(parts.length === 1 && Math.abs(parts[0][2] - r2c(want * pm('onAttack', 'drawCard'))) < 1e-9, `Worker Ant's trigger costs weight × value (× its pair factor) = ${r2c(want * pm('onAttack', 'drawCard'))} (got ${parts[0] && parts[0][2]})`); }
const sCost = t=> T.cardS({triggers:[t]}, {attack:3}).S;
ok(sCost({on:'onDeath', do:'damage', amount:2}) === r2c(tv('onDeath') * av('damage') * 2 * pm('onDeath', 'damage')), 'On Death: deal 2 = weight × value × 2 (× the pair factor)');
const t2 = JSON.parse(JSON.stringify(table)); t2.actions.find(a=> a.id === 'stun').value = 2; // the owner's "action worth 2"
ok(SC.make(t2).cardS({triggers:[{on:'onAnyPlayed', do:'stun', who:'enemy', sub:'random'}]}).S === 10, 'On Any Played (5) × an action worth 2 = 10 (owner)');
ok(sCost({on:'onSpawn', do:'buff', who:'self', amount:2, amount2:4}) === r2c(tv('onSpawn') * pm('onSpawn', 'buff') * (av('buff') * 2 + av('buff.amount2') * 4)), 'Buff counts +Attack and +Health');
ok(sCost({on:'onSpawn', do:'buff', who:'self', amount2:2}) === r2c(tv('onSpawn') * pm('onSpawn', 'buff') * av('buff.amount2') * 2), 'a Buff with only +Health costs only its Health part');
ok(sCost({on:'onSpawn', do:'damage', amount:2, who:'enemy', sub:'all'}) === r2c(tv('onSpawn') * pm('onSpawn', 'damage') * av('damage') * 2 * table.modifiers.find(m=> m.id === 'subAll').value), 'sub All × subAll');
// 2026-10-19 (package TC): cardS rounds each trigger to 2 places (r2), so compare rounded — with onceCap 0.66 (applied) the product
// 0.66 × stun is 3.696 unrounded and 3.7 as costed; and `once` on a trigger that fires once anyway leaves its weight alone.
const r2 = v=> Math.round(v * 100) / 100, capV = table.modifiers.find(m=> m.id === 'onceCap').value;
ok(sCost({on:'onAttack', do:'stun', once:true}) === r2(Math.min(tv('onAttack'), capV) * av('stun')), `once caps the weight (${sCost({on:'onAttack', do:'stun', once:true})} = min(${tv('onAttack')}, ${capV}) × ${av('stun')})`);
ok(sCost({on:'onAttacked', do:'stun', once:true}) === r2(Math.min(tv('onAttacked'), capV) * av('stun')), 'once caps On Attacked too (Sea Cucumber)');
['onSpawn', 'onDeath', 'onReady'].forEach(on=> ok(sCost({on, do:'damage', amount:2, once:true}) === sCost({on, do:'damage', amount:2}), `once on ${on} (fires once anyway) costs the same as without`));
ok(sCost({on:'onSpawn', do:'damage', amount:'attack'}) === r2c(tv('onSpawn') * pm('onSpawn', 'damage') * 3 * av('damage')), "damage 'attack' uses the card's Attack");
{ const bm = table.shorthands.bounty.mult || 1; // SKILL2 (2026-10-31): the Bounty shorthand's measured factor (0.72)
  ok(T.cardS({bounty:1}).S === r2c(tv('bounty') * av('gain') * bm) && T.cardS({bounty:2}).S === r2c(tv('bounty') * av('gain') * 2 * bm), `Bounty N = weight × Gain × N × its factor (${T.cardS({bounty:1}).S}, ${T.cardS({bounty:2}).S})`); }
// a changed weight moves S (what the hub tab relies on)
const t3 = JSON.parse(JSON.stringify(table)); t3.triggers.find(t=> t.id === 'onAttack').value = 10;
if(ant) ok(Math.abs(SC.make(t3).cardS(ant.effects, ant).S - T.cardS(ant.effects, ant).S - (10 - tv('onAttack')) * av('drawCard') * pm('onAttack', 'drawCard') * (at.count || 1)) < 0.02, 'editing a weight changes S by Δweight × value (× the pair factor)');

// 4. / 4b. RETIRED 2026-11-04 (TESTFIX1): they froze the 10-18 keyword model (copied SB_SKILLS) and the 10-19 TC rule "an applied entry's
// value = max(0, measuredS)". Later, dated decisions re-priced the table on purpose: the owner's hub edits (Human pass I, 10-22), BF7 (BF7-1..3),
// BAL2 (BAL2-4), the 4-round rule (EN6-2, EN8-5: measurement optional), RECOST1 (RECOST1-1..3) and BUDGET2 / SKILL2 (BUDGET2-1, BUDGET2-2),
// and docs/balance/post-balance-queue.json is a 10-19 snapshot nobody regenerates. The live budget is checked by tests/budget2-2026-10-31.js,
// tests/skill2-2026-10-31.js and tests/forge-curve-2026-10-19.js.

// 5. the balance tool and the browser build
const cb = rd('tools/card_balance.js');
ok(/require\(path\.join\(__dirname, 'skill_costs\.js'\)\)/.test(cb) && cb.includes('canonical/skill-costs.json'), 'card_balance.js reads the table through tools/skill_costs.js');
ok(!/const SB_SKILLS = \{/.test(cb), 'card_balance.js has no skill-cost table of its own');
// 2026-10-19 (package BF): as the hub inlines them, bramblewood-budget.js (window.BramblewoodBudget, budget v4's N) comes first
const win = {}; vm.runInNewContext(rd('bramblewood-budget.js') + '\n' + rd('tools/skill_costs.js').replace(/^#!.*\n/, ''), {self: win});
ok(win.SkillCosts && typeof win.SkillCosts.make === 'function', 'tools/skill_costs.js runs as a browser script (window.SkillCosts)');
if(win.SkillCosts && ant) ok(win.SkillCosts.make(table).budget(ant).S === T.budget(ant).S, 'browser and Node builds agree');

// 6. the hub
const bh = rd('tools/hub/build_hub.py'), tab = rd('tools/hub/skill_costs_tab.js');
ok(bh.includes("skill_costs_tab.js") && bh.includes("'skill-costs.json'") && bh.includes('id="p-costs"') && bh.includes('data-tab="costs"'), 'build_hub.py builds the Skill costs tab with the table');
ok(/claude\.use\('db'\)/.test(tab) && tab.includes("collection('skillCosts')"), 'the tab uses the db capability, collection skillCosts');
ok(/set\(\{kind, id, value: edits\[key\], updatedAt:/.test(tab), 'one doc per edit: {kind, id, value, updatedAt}');
ok(!/localStorage/.test(tab), 'no localStorage for the edits');
ok(/navigator\.clipboard\.writeText\(text\)\.then\(/.test(tab) && tab.includes("Edits can't be saved here"), 'read-only note and Copy JSON (clipboard in the click, rejection caught)');
ok(fs.existsSync(path.join(ROOT, 'tools/hub/pull_skill_costs.md')), 'tools/hub/pull_skill_costs.md exists');
const built = path.join(ROOT, 'hub', 'index.html');
if(fs.existsSync(built)){ const h = fs.readFileSync(built, 'utf8'); ok(h.includes('id="p-costs"') && h.includes('const SC_SEED = '), 'hub/index.html has the tab and the seeds'); }
// soft: the game's Test Lab still has its own table (arena_app.js SB_DEFAULT_SKILLS); say where the two differ
const sb = app.match(/^const SB_DEFAULT_SKILLS = \{(.*?)\};/m);
if(sb){ const rule = {}; sb[1].replace(/\/\*.*?\*\//g, '').split(',').forEach(p=>{ const m = p.match(/(\w+)\s*:\s*('-?v'|-?\d+(?:\.\d+)?)/); if(m) rule[m[1]] = m[2].replace(/'/g, ''); });
  const off = Object.entries(rule).filter(([k, r])=>{ const e = table.skills.find(s=> s.id === k); if(!e) return k !== 'bounty';
    return r === 'v' ? !(e.scale === 'n' && e.value === 1) : r === '-v' ? !(e.scale === 'n' && e.value === -1) : !(e.scale === 'fixed' && e.value === +r); });
  if(off.length) console.log('  note: the Test Lab (SB_DEFAULT_SKILLS in arena_app.js) differs from canonical/skill-costs.json for', off.map(o=> o[0]).join(', ')); }
console.log(`skill-costs: ${checks - fail}/${checks} passed`);
process.exit(fail ? 1 : 0);
