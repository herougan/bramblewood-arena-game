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
table.skills.forEach(e=> ok(['fixed', 'n', 'half'].includes(e.scale), `skill ${e.id} has a known scale`));
table.actions.forEach(e=> ok(e.per == null || ['amount', 'amount2', 'count'].includes(e.per), `action ${e.id} has a known per field`));
const ids = k=> new Set(table[k].map(e=> e.id));
const SKI = ids('skills'), TRI = ids('triggers'), ACT = new Set(table.actions.map(e=> e.id.split('.')[0])), alias = table.aliases || {}, SH = table.shorthands || {};
// the owner's seeds (19:54)
const tv = id=> (table.triggers.find(t=> t.id === id) || {}).value;
ok(tv('onDeath') === 1, 'On Death = 1 (owner)'); ok(tv('onAllyPlayed') === 2.5, 'On Ally Played = 2.5 (owner: OnPlay(Ally))');
ok(tv('onAnyPlayed') === 5, 'On Any Played = 5 (owner: OnPlay(Any))'); ok(tv('bounty') === 1, 'Bounty = 1 (owner 21:36, BF5: "Let bounty N = N * 2"; was 0.5)');

// 2. coverage
const cards = JSON.parse(rd('canonical/cards.json'));
const missing = new Set();
cards.forEach(c=> Object.entries(c.effects || {}).forEach(([k, v])=>{
  if(k === 'triggers'){ (Array.isArray(v) ? v : []).forEach(t=>{ if(!t) return; if(!TRI.has(t.on)) missing.add('trigger ' + t.on + ' (' + c.id + ')');
    const a = alias[t.do] || t.do; if(!ACT.has(a)) missing.add('action ' + t.do + ' (' + c.id + ')'); }); return; }
  if(SH[k]){ if(!TRI.has(SH[k].trigger)) missing.add('trigger ' + SH[k].trigger); if(!ACT.has(SH[k].action)) missing.add('action ' + SH[k].action); return; }
  if(!SKI.has(k)) missing.add('skill ' + k + ' (' + c.id + ')'); }));
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
const ant = cards.find(c=> c.id === 'worker-ant'), at = ant && ant.effects.triggers[0];
ok(ant && at.on === 'onAttack' && at.do === 'drawCard', 'Worker Ant is still On Attack: Draw (the sample card)');
if(ant){ const want = tv('onAttack') * av('drawCard') * (at.count || 1), parts = T.cardS(ant.effects, ant).parts.filter(p=> p[0] === 'trigger');
  ok(parts.length === 1 && Math.abs(parts[0][2] - want) < 1e-9, `Worker Ant's trigger costs weight × value = ${want} (got ${parts[0] && parts[0][2]})`); }
const sCost = t=> T.cardS({triggers:[t]}, {attack:3}).S;
ok(sCost({on:'onDeath', do:'damage', amount:2}) === tv('onDeath') * av('damage') * 2, 'On Death: deal 2 = 1 × 2');
const t2 = JSON.parse(JSON.stringify(table)); t2.actions.find(a=> a.id === 'stun').value = 2; // the owner's "action worth 2"
ok(SC.make(t2).cardS({triggers:[{on:'onAnyPlayed', do:'stun', who:'enemy', sub:'random'}]}).S === 10, 'On Any Played (5) × an action worth 2 = 10 (owner)');
ok(sCost({on:'onSpawn', do:'buff', who:'self', amount:2, amount2:4}) === tv('onSpawn') * (av('buff') * 2 + av('buff.amount2') * 4), 'Buff counts +Attack and +Health');
ok(sCost({on:'onSpawn', do:'buff', who:'self', amount2:2}) === av('buff.amount2') * 2, 'a Buff with only +Health costs only its Health part');
ok(sCost({on:'onSpawn', do:'damage', amount:2, who:'enemy', sub:'all'}) === av('damage') * 2 * table.modifiers.find(m=> m.id === 'subAll').value, 'sub All × subAll');
// 2026-10-19 (package TC): cardS rounds each trigger to 2 places (r2), so compare rounded — with onceCap 0.66 (applied) the product
// 0.66 × stun is 3.696 unrounded and 3.7 as costed; and `once` on a trigger that fires once anyway leaves its weight alone.
const r2 = v=> Math.round(v * 100) / 100, capV = table.modifiers.find(m=> m.id === 'onceCap').value;
ok(sCost({on:'onAttack', do:'stun', once:true}) === r2(Math.min(tv('onAttack'), capV) * av('stun')), `once caps the weight (${sCost({on:'onAttack', do:'stun', once:true})} = min(${tv('onAttack')}, ${capV}) × ${av('stun')})`);
ok(sCost({on:'onAttacked', do:'stun', once:true}) === r2(Math.min(tv('onAttacked'), capV) * av('stun')), 'once caps On Attacked too (Sea Cucumber)');
['onSpawn', 'onDeath', 'onReady'].forEach(on=> ok(sCost({on, do:'damage', amount:2, once:true}) === sCost({on, do:'damage', amount:2}), `once on ${on} (fires once anyway) costs the same as without`));
ok(sCost({on:'onSpawn', do:'damage', amount:'attack'}) === 3 * av('damage'), "damage 'attack' uses the card's Attack");
ok(T.cardS({bounty:1}).S === 1 && T.cardS({bounty:2}).S === 2, 'Bounty N = 1 × Gain × N (BF5)');
// a changed weight moves S (what the hub tab relies on)
const t3 = JSON.parse(JSON.stringify(table)); t3.triggers.find(t=> t.id === 'onAttack').value = 10;
if(ant) ok(SC.make(t3).cardS(ant.effects, ant).S - T.cardS(ant.effects, ant).S === (10 - tv('onAttack')) * av('drawCard'), 'editing a weight changes S by Δweight × value');

// 4. keyword skills and N exactly as before (the 2026-10-18 card_balance.js code)
const OLD = {penance:'-v', bloodTithe:'-v', flying:0, evasive:0, swift:0, shadow:0, blind:0, bounty:0, quick:2, helmet:2, darksight:1, swimmer:1, diurnal:1, nocturnal:1, crepuscular:1, tide:1, molting:1, dynamite:0, leader:0, armor:'v', poison:'v', thorns:'v', heal:'v', regen:'v', rebuild:'v', creative:0, bleed:'v', snipe:'v', arrows:'v', crabClaws:0, relic:2, castDarkness:2, trueStrike:2 /* 2026-10-18 (package D): the two new keywords, as in SB_DEFAULT_SKILLS */}; // + Relic (2026-10-19, package E: a new skill, costed 2 from the start)
const OPAY = {penance:3, bloodTithe:2}, LAD = ['starter','common','uncommon','rare','veryrare','superrare','epic','heroic','unique','legendary','mythic','ancient','divine','void','daemonic'];
const OAS = {quest:'uncommon', questunique:'unique', special:'rare', devlegendary:'legendary', devancient:'ancient', eventlegendary:'legendary', eventrare:'rare'};
function oldBudget(d){ const e = d.effects || {}, k = d.rarity || 'common', rank = Math.max(0, LAD.indexOf(OAS[k] || k));
  const qs = d.source && (d.source.kind==='quest' || d.source.kind==='errand' || d.source.kind==='base');
  const L = (d.faction || d.id==='wandering-traveller') ? 1 : ((d.basic || d.rarity==='starter' || d.tutorial || d.quest || qs) ? 0 : 1);
  const W = +d.wait||0, C = +d.cost||0, rit = e.ritual && typeof e.ritual === 'object' ? Object.values(e.ritual).reduce((a, b)=> a + (+b||0), 0) : 0;
  // 2026-10-19 (package BF2): N is budget v5, (Base + L/5) x (1 + L/30), Level 0 Base - 1; Base = v3's N without its 2L
  const base = 20 + rank + 6*W + 0.5*W*W + 4*C + 0.4*C*C + rit + 0.2 * T.obtainMapOf(d) /* + the map term (BF2, 15:25) */, kS = table.budget.scale /* BF5: the whole N halved (on Base rounded to 0.01, as the helper) */, bR = Math.round(base * 100) / 100, N = Math.round((L ? kS * (bR + L / 10) * (1 + L / 30) : kS * (bR - 1)) * 100) / 100; // L/10 since 15:48
  let S = 0; Object.entries(e).forEach(([key, v])=>{ if(key === 'triggers' || key === 'bounty') return; // the two the new model prices differently
    if(APPLIED.has(key)) return; // applied measured worth (2026-10-19): not the frozen value any more
    const rule = OLD[key], num = typeof v === 'number' ? v : (Array.isArray(v) ? v.reduce((a, b)=> a + (+b || 0), 0) : 0);
    if(rule === 'v') S += Math.max(1, num); else if(rule === '-v') S -= Math.max(1, v === true ? (OPAY[key] || 1) : num); else if(typeof rule === 'number') S += rule; else S += 1 + (num > 1 ? Math.floor(num / 2) : 0); });
  return {N, S}; }
const APPLIED = new Set(table.skills.filter(e=> e.appliedAt).map(e=> e.id)), skipped = {}; // 2026-10-19 (package TC): measured worth applied
let same = 0, diff = [];
cards.filter(c=> SC.measured(c) && !c.pool /* 2026-10-19 (package GI): an unplaced pool card may carry a skill newer than this frozen model */ && !['hunter', 'executioner', 'detonate', 'proliferate', 'brittle', 'kinRally', 'packHowl', 'prayerWard', 'fieldBreaker', 'weaponMaster', 'pry' /* + package EQ (2026-10-19) */].some(k=> (c.effects || {})[k] != null) /* 2026-10-19 (package TH): nor a placed GI example */).forEach(c=>{ const o = oldBudget(c), b = T.budget(c), passive = b.parts.filter(p=> p[0] === 'skill' && !APPLIED.has(p[1])).reduce((a, p)=> a + p[2], 0);
  b.parts.forEach(p=>{ if(p[0] === 'skill' && APPLIED.has(p[1])) skipped[p[1]] = (skipped[p[1]] || 0) + 1; });
  if(Math.abs(passive - o.S) < 1e-9 && b.N === o.N) same++; else diff.push(`${c.id} S ${o.S}→${passive} N ${o.N}→${b.N}`); });
ok(!diff.length, 'keyword S and N unchanged for every measured card: ' + diff.slice(0, 8).join('; '));
ok(same > 500, `compared ${same} cards`);
console.log(`  note: the frozen keyword comparison skips ${Object.keys(skipped).length} applied skills (measured worth, appliedAt) on ${Object.values(skipped).reduce((a, b)=> a + b, 0)} card uses: ${Object.entries(skipped).sort((a, b)=> b[1] - a[1]).slice(0, 12).map(([k, n])=> k + ' ' + n).join(', ')}, …`);

// 4b. the applied measured worth (2026-10-19, package TC)
const all = KINDS.flatMap(k=> table[k].map(e=> [k, e])), applied = all.filter(([, e])=> e.appliedAt);
ok(applied.length >= 150, `the measured worth is applied (${applied.length} entries with appliedAt)`);
// the application floored a negative measured worth at 0 (58 entries, the payments Penance / Blood Tithe among them)
applied.forEach(([k, e])=> ok(typeof e.prevValue === 'number' && typeof e.appliedAt === 'string' && (e.measuredConf === 'high' || /owner/.test(e.appliedAt) /* BF3: Thorns, the owner's call on a low-confidence floor */) && e.value === ((e.prevValue < 0 && /payment/.test(e.note || "")) ? e.measuredS : Math.max(0, e.measuredS)),
  `${k} ${e.id}: applied entry has prevValue, appliedAt, measuredConf high, value = max(0, measuredS) (${e.prevValue} -> ${e.value}, measured ${e.measuredS}, ${e.measuredConf})`));
ok(!all.some(([, e])=> !e.appliedAt && e.prevValue != null), 'only applied entries carry prevValue');
const ent = (k, id)=> table[k].find(e=> e.id === id) || {};
[['triggers', 'onDeath', 1], ['triggers', 'onAllyPlayed', 2.5], ['triggers', 'bounty', 1 /* owner 21:36 (BF5): doubled from 0.5 */], ['triggers', 'onAnyPlayed', 5], ['skills', 'supreme', 1], ['skills', 'supremeTide', 1], ['skills', 'trueStrike', 2]]
  .forEach(([k, id, v])=> ok(ent(k, id).value === v && !ent(k, id).appliedAt, `owner-set ${id} = ${v}, not replaced by the measured worth (${ent(k, id).value})`));
ok(table.shorthands.bounty && table.shorthands.bounty.trigger === 'bounty' && table.shorthands.bounty.action === 'gain' && !table.shorthands.bounty.appliedAt, 'Bounty shorthand kept (owner)');
const Q = JSON.parse(rd('docs/balance/post-balance-queue.json')), QB = require(path.join(ROOT, 'tools', 'post_balance_queue.js')).build();
ok(JSON.stringify(Q.cards.map(c=> c.id).sort()) === JSON.stringify(QB.cards.map(c=> c.id).sort()) && Q.count === Q.cards.length, `the post-balance queue is current (${Q.count} in the file, ${QB.count} from the table): run node tools/post_balance_queue.js`);
// 2026-10-19 (package BF2): budget v5's N at Level 1 is a little under v4's for some cards, so a few queued cards (Great Gate, Colony) fail
// even under prevValue: the formula put them over, the new costs only further
ok(Q.cards.every(c=> c.sAfter > c.sBefore && (c.overBy.x1 > 0 || c.overBy.x2 > 0)) && Q.cards.filter(c=> !c.passedBefore).length <= 3, `every queued card costs more now and is over by its recorded margin; most passed under prevValue (${Q.cards.filter(c=> !c.passedBefore).map(c=> c.id).join(', ') || 'all'} over under the formula alone)`);

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
