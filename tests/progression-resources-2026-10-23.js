#!/usr/bin/env node
// 2026-10-23 (package HUB3, owner 19:27: "Help me remember my definitions and log it in the master hub" / #17 "a tab called resources"):
// checks the 📚 Progression plan and 🪙 Resources tabs and their data:
//   1. docs/progression-plan.md has the owner's definitions (each marked as theirs, 2026-10-23), the targets and the suggestions;
//   2. tools/progression_plan_2026_10_23.js runs and its output is well formed: every live card in exactly one bucket, the target rows
//      add up, cards sorted by advancement, mistakes with fixes, the eggs / babies audit, Map 0-1 skills, pacing, collection; the
//      committed docs/balance/progression-plan-2026-10-23.json has the same shape;
//   3. tools/resources_week_2026_10_23.js runs: every resource row has a source and a sink text, the week rows are numbers >= 0, its
//      Energy is at most what regen allows, the session numbers;
//   4. build_hub.py wires both tabs (buttons, panels, inlined data, CSS) and the Units tab links to the plan;
//   5. both tab scripts parse and render against a stub page (every view of the plan; the resources tables), and use no browser storage.
'use strict';
const fs = require('fs'), path = require('path'), vm = require('vm'), cp = require('child_process'), os = require('os');
const ROOT = path.join(__dirname, '..');
const rd = rel=> fs.readFileSync(path.join(ROOT, rel), 'utf8');
let fail = 0, checks = 0; const ok = (c, m)=>{ checks++; if(!c){ fail++; console.log('  ✗', m); } };
const tmp = fs.mkdtempSync(path.join(os.tmpdir(), 'hub3-'));

// 1. the canonical text
const md = rd('docs/progression-plan.md');
['Tutorial base cards', 'Base.', 'Skirmish base', 'Pack 1, Pack 2, Pack 3', 'Faction pool', 'Standard faction rewards', 'Set and random faction rewards', 'Collector packs', 'Pack Secrets I', 'Tavern cards', 'Quest-only specials', 'Level 0', 'Babies', 'Craftable', 'Killer Veggies']
  .forEach(k=> ok(md.includes('**' + k), `1. the plan defines "${k}"`));
ok(/Each one is an owner definition, 2026-10-23/.test(md), '1. the definitions are marked as the owner\'s, 2026-10-23');
ok(/## Targets/.test(md) && /## Balancing suggestions/.test(md) && /SUGGESTIONS:BEGIN[\s\S]+### 1\.[\s\S]+SUGGESTIONS:END/.test(md), '1. targets and written suggestions');

// 2. the plan's data
const ppOut = path.join(tmp, 'pp.json');
const r1 = cp.spawnSync('node', [path.join(ROOT, 'tools/progression_plan_2026_10_23.js'), '--quiet', '--out', ppOut], {encoding: 'utf8', timeout: 120000});
ok(r1.status === 0 && fs.existsSync(ppOut), '2. the plan tool runs: ' + (r1.stderr || '').slice(0, 300));
const check = (P, where)=>{
  ok(P && Array.isArray(P.cards) && P.cards.length > 300, `2. ${where}: cards listed`);
  if(!P || !P.cards) return;
  const ids = new Set(P.cards.map(c=> c.id)); ok(ids.size === P.cards.length, `2. ${where}: each card once`);
  ok(P.cards.every(c=> typeof c.bucket === 'string' && c.bucket), `2. ${where}: every card has a bucket`);
  const adv = P.cards.map(c=> c.adv == null ? 999 : c.adv); ok(adv.every((a, i)=> !i || a >= adv[i - 1]), `2. ${where}: sorted by advancement`);
  ['factionOtter', 'factionHummingbird', 'factionShared', 'base', 'pack-p1', 'skirmish-p1', 'pack-p2', 'skirmish-p2', 'pack-p3', 'skirmish-p3', 'tavern'].forEach(k=> ok(P.targets.some(t=> t.key === k), `2. ${where}: a target row for ${k}`));
  P.targets.forEach(t=> ok(t.actual === P.cards.filter(c=> c.bucket === t.key).length, `2. ${where}: ${t.key} counts its cards`));
  ok(P.mistakes.length >= 5 && P.mistakes.every(m=> m.what && m.fix), `2. ${where}: mistakes each with a fix`);
  ok(P.mistakes.some(m=> /lava|volcanic/i.test(m.what)), `2. ${where}: the lava cards in Pack 1 are named`);
  ok(P.eggs && P.eggs.eggCards.length >= 7 && P.eggs.inconsistencies.length >= 2 && P.eggs.facts.length >= 3, `2. ${where}: eggs and babies audit`);
  ok(Array.isArray(P.skillsSeen) && P.skillsSeen.length >= 3 && P.skillsSeen.every(s=> s.label && Object.keys(s.where).length), `2. ${where}: Map 0-1 skills`);
  ok(Array.isArray(P.pacing) && P.pacing.length >= 3 && P.pacing.every(p=> p.verdict), `2. ${where}: faction pacing models with verdicts`);
  ok(Array.isArray(P.collection) && [3, 7, 13, 20].every(m=> P.collection.some(c=> c.map === m && c.withProposal > c.today)), `2. ${where}: collection by Map 3 / 7 / 13 / 20`);
  ok(P.ants && Array.isArray(P.ants.live) && Array.isArray(P.outsideFaction), `2. ${where}: Ants and the faction cards outside the pool`);
};
let P = null; try{ P = JSON.parse(fs.readFileSync(ppOut, 'utf8')); }catch(e){}
check(P, 'fresh run');
let PC = null; try{ PC = JSON.parse(rd('docs/balance/progression-plan-2026-10-23.json')); }catch(e){}
check(PC, 'committed file');

// 3. resources
const rsOut = path.join(tmp, 'rs.json');
const r2 = cp.spawnSync('node', [path.join(ROOT, 'tools/resources_week_2026_10_23.js'), '--quiet', '--out', rsOut], {encoding: 'utf8', timeout: 120000});
ok(r2.status === 0 && fs.existsSync(rsOut), '3. the resources tool runs: ' + (r2.stderr || '').slice(0, 300));
let RS = null; try{ RS = JSON.parse(fs.readFileSync(rsOut, 'utf8')); }catch(e){}
if(RS){
  ok(RS.resources.length >= 25 && RS.resources.every(r=> r.key && r.name && r.from && r.spent), '3. every resource has where it comes from and what spends it');
  ['gold', 'gems', 'dust', 'metal', 'kibble', 'beer', 'laurels', 'energy', 'ironShard', 'strangeMateria', 'trophyShards', 'eggs', 'raidTicket', 'fragments'].forEach(k=> ok(RS.resources.some(r=> r.key === k), `3. lists ${k}`));
  ok(RS.weeks.length === 3 && RS.weeks.every(w=> Object.values(w.week).every(v=> typeof v === 'number' && v >= 0)), '3. the week rows are numbers >= 0');
  ok(RS.weeks.every(w=> w.week.energy <= 7 * 288 + 7 * 60 + 7 * 5 && w.fightsPerDay > 0), '3. Energy spent stays within regen + cap + free');
  ok(RS.sessions && RS.sessions.gannetCleared.sessions > 0 && RS.sessions.gatorReached.sessions >= RS.sessions.gannetCleared.sessions, '3. sessions to Gannet and the Gatorback Swamp');
  ok(RS.assumptions && RS.assumptions.awakeHours > 0 && RS.assumptions.session, '3. the assumptions are in the file');
}
ok(fs.existsSync(path.join(ROOT, 'docs/balance/resources-2026-10-23.json')), '3. the committed resources file exists');

// 4. build_hub.py
const bh = rd('tools/hub/build_hub.py');
ok(bh.includes('data-tab="progress"') && bh.includes('id="p-progress"') && bh.includes('{PP_INLINE}') && bh.includes('progression_tab.js') && bh.includes("'progression-plan.md'"), '4. the Progression plan tab is built');
ok(bh.includes('data-tab="resources"') && bh.includes('id="p-resources"') && bh.includes('{RS_INLINE}') && bh.includes('resources_tab.js'), '4. the Resources tab is built');
ok(bh.includes('{PP_CSS}') && fs.existsSync(path.join(ROOT, 'tools/hub/plan_tabs.css')), '4. the tabs\' styles');
ok(/id="p-units"[^\n]*href="#progress"/.test(bh), '4. Units by theme links to the plan');

// 5. the tab scripts against a stub page
const ppTab = rd('tools/hub/progression_tab.js'), rsTab = rd('tools/hub/resources_tab.js');
ok(!/localStorage|sessionStorage|indexedDB/.test(ppTab + rsTab), '5. no browser storage');
function stub(){
  const els = {}, mk = id=> (els[id] = els[id] || {id, innerHTML: '', value: '', l: {}, addEventListener(t, f){ this.l[t] = f; }, querySelectorAll(){ return []; }, focus(){}, setSelectionRange(){}});
  const sb = {window: {hub: {onShow: {}}}, document: {getElementById: mk}, console};
  sb.window.window = sb.window; vm.createContext(sb); return {sb, els};
}
try{
  const {sb, els} = stub(); sb.PP_DATA = PC; sb.PP_DOC = '<h2>Definitions</h2>'; vm.runInContext(ppTab, sb);
  ok(typeof sb.window.hub.onShow.progress === 'function', '5. the plan tab registers hub.onShow.progress');
  sb.window.hub.onShow.progress();
  ok(/Progression plan/.test(els.ppHost.innerHTML) && /Definitions/.test(els.ppBody.innerHTML), '5. the plan opens on the definitions');
  const click = v=> els.ppViews.l.click({target: {closest: s=> s === 'button[data-v]' ? {dataset: {v}} : null}});
  const want = {targets: /Faction pool: Otter side/, cards: /Advancement/, mistakes: /Fix:/, eggs: /Egg cards/, pacing: /Collection by map/, early: /Skills a player meets/};
  Object.entries(want).forEach(([v, re])=>{ click(v); ok(re.test(els.ppBody.innerHTML), `5. the plan's ${v} view renders`); });
  click('cards'); const rowsAll = (els.ppBody.innerHTML.match(/<tr><td>/g) || []).length; ok(rowsAll === PC.cards.length, '5. one row per card');
  els.ppHost.l.change({target: {id: 'ppB', value: 'pack-p1'}}); ok((els.ppBody.innerHTML.match(/<tr><td>/g) || []).length === PC.cards.filter(c=> c.bucket === 'pack-p1').length, '5. the bucket filter');
}catch(e){ ok(false, '5. the plan tab runs against a stub page: ' + (e && e.stack || e)); }
try{
  const {sb, els} = stub(); sb.RS_DATA = JSON.parse(rd('docs/balance/resources-2026-10-23.json')); vm.runInContext(rsTab, sb);
  ok(typeof sb.window.hub.onShow.resources === 'function', '5. the resources tab registers hub.onShow.resources');
  sb.window.hub.onShow.resources();
  ok(/A dedicated player's week/.test(els.rsBody.innerHTML) && /Maple Leaves/.test(els.rsBody.innerHTML) && /Gannet Cliffs/.test(els.rsBody.innerHTML), '5. the resources tables render');
}catch(e){ ok(false, '5. the resources tab runs against a stub page: ' + (e && e.stack || e)); }
fs.rmSync(tmp, {recursive: true, force: true});
console.log(`progression-resources: ${checks - fail}/${checks} passed`);
process.exit(fail ? 1 : 0);
