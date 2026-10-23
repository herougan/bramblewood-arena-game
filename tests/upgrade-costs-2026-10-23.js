#!/usr/bin/env node
// 2026-10-23 (package HUB2, owner 11:11: "For all these upgrade costs and forge costs, put them in the master hub and let them be
// editable."): checks that
//   1. canonical/upgrade-costs.json is well formed, and every number in it is editable in the hub (tools/upgrade_costs_lib.js lists it);
//   2. the game's cost tables (the const lines in arena_app.js, run with the file baked in as assemble_arena.py does) equal the file:
//      level road, rarity multipliers, card-kind multipliers, limit break, duplicates, Forge tiers, prestige rings, disenchant, Materia,
//      energy upgrade; and no cost table is hard-coded there any more;
//   3. the fold tool round-trips: the file's layout is what the tool writes, edits change exactly the named numbers, undoing them gives
//      the file back byte for byte, bad paths / negative / non-numbers are refused, the Copy JSON form (a whole table) folds too;
//   4. the hub has the 💰 Upgrade costs tab: db collection "upgradeCosts", no localStorage for the edits, Copy JSON fallback, the
//      seed inlined by build_hub.py, the tab script parses.
'use strict';
const fs = require('fs'), path = require('path'), vm = require('vm'), cp = require('child_process'), os = require('os');
const ROOT = path.join(__dirname, '..');
const rd = rel=> fs.readFileSync(path.join(ROOT, rel), 'utf8');
let fail = 0, checks = 0; const ok = (c, m)=>{ checks++; if(!c){ fail++; console.log('  ✗', m); } };
const U = require(path.join(ROOT, 'tools', 'upgrade_costs_lib.js'));

// 1. the file
const raw = rd('canonical/upgrade-costs.json'); let T = null;
try{ T = JSON.parse(raw); }catch(e){ ok(false, 'upgrade-costs.json parses: ' + e.message); }
if(!T){ console.log(`upgrade-costs: ${checks - fail}/${checks} passed`); process.exit(1); }
ok(U.format(T) === raw, '1. the file is laid out the way the fold tool writes it (format(parse(file)) === file)');
const leaves = []; (function walk(o, p){ if(typeof o === 'number') leaves.push(p); else if(Array.isArray(o) && o.every(x=> x && typeof x === 'object')) o.forEach((x, i)=> walk(x, p + '.' + (x.key || x.id || i))); else if(Array.isArray(o)) o.forEach((x, i)=> walk(x, p + '.' + i)); else if(o && typeof o === 'object') Object.keys(o).forEach(k=> walk(o[k], p ? p + '.' + k : k)); })(T, '');
const ent = U.build(T), entPaths = new Set(ent.map(e=> e.path));
ok(new Set(ent.map(e=> e.path)).size === ent.length, '1. no path listed twice');
ent.forEach(e=> ok(typeof U.get(T, e.path) === 'number' && U.get(T, e.path) >= 0, `1. ${e.path} resolves to a number >= 0`));
ent.forEach(e=> ok(/^[A-Za-z0-9_.:-]+$/.test(e.path) && e.path.length < 100, `1. ${e.path} is a valid db doc id`));
ent.forEach(e=> ok(U.GROUPS.some(g=> g[0] === e.group), `1. ${e.path} has a known group`));
// numbers that are structure, not costs: version-free; the tier index, the card cap
const STRUCT = /^(forgeTiers\.(\d+)\.(tier|cap)|forgeStepDust\.0)$/;
const notEditable = leaves.filter(p=> !entPaths.has(p) && !STRUCT.test(p) && p !== 'version');
ok(!notEditable.length, '1. every cost number in the file is editable in the hub; missing: ' + notEditable.join(', '));
ok(T.forgeStepDust.length === 10 && T.forgeStepDust[0] === 0, '1. forgeStepDust has 10 entries, [0] unused');

// 2. the game's constants
const app = rd('arena_app.js');
ok((app.match(/__UPGRADE_COSTS__/g) || []).length === 1, '2. arena_app.js has the __UPGRADE_COSTS__ placeholder once');
ok(/__UPGRADE_COSTS__/.test(rd('assemble_arena.py')) && /canonical\/upgrade-costs\.json/.test(rd('assemble_arena.py')), '2. assemble_arena.py bakes canonical/upgrade-costs.json in');
function decl(name){ // the statement "const NAME = …;" (it may span lines)
  const lines = app.split('\n'), i = lines.findIndex(l=> new RegExp('^const ' + name + '\\b').test(l)); if(i < 0) return null;
  let j = i; while(j < lines.length && !/;\s*(\/\/.*)?$/.test(lines[j])) j++; return lines.slice(i, j + 1).join('\n'); }
const NAMES = ['FORGE_TIER_NAMES', 'UPGRADE_COSTS', 'PRESTIGE_TIERS', 'MATERIA_UNIT', 'DISENCHANT_DUST', 'FORGE_STEP_DUST', 'LIMIT_BREAK_COST_MULT', 'LEVEL_COST_MULT', 'DUPLICATE_DIVISOR', 'LIMIT_BREAK_DUPS', 'MATERIA_MOTE', 'FORGE_TIERS'];
const code = NAMES.map(n=>{ const d = decl(n); ok(!!d, `2. arena_app.js declares ${n}`); return (d || '').replace('__UPGRADE_COSTS__', JSON.stringify(T)); }).join('\n')
  + '\nconst MATERIA_DUST_COST = ' + ((app.match(/const MATERIA_DUST_COST = ([^,;]+),/) || [])[1] || 'NaN') + ';'
  + '\nconst __energy = ' + (((app.match(/function energyUpgradeCost\(\)\{ return ([^;]+); \}/) || [])[1]) || 'NaN').replace('energyUpgradesBought()', '0') + ';'
  + '\nconst __lc = (hero, ev, qb)=>{ let k = 1; if(hero) k *= UPGRADE_COSTS.modifiers.hero; else if(ev) k *= UPGRADE_COSTS.modifiers.event; else if(qb) k *= UPGRADE_COSTS.modifiers.questBase; return k; };'
  + '\n({FORGE_TIER_NAMES, UPGRADE_COSTS, PRESTIGE_TIERS, MATERIA_UNIT, DISENCHANT_DUST, FORGE_STEP_DUST, LIMIT_BREAK_COST_MULT, LEVEL_COST_MULT, DUPLICATE_DIVISOR, LIMIT_BREAK_DUPS, MATERIA_MOTE, FORGE_TIERS, MATERIA_DUST_COST, __energy})';
let G = null; try{ G = vm.runInNewContext(code, {Math, Object, JSON}); }catch(e){ ok(false, '2. the game\'s cost lines run: ' + e.message); }
const same = (a, b)=> JSON.stringify(a) === JSON.stringify(b);
if(G){
  ok(same(G.UPGRADE_COSTS, T), '2. UPGRADE_COSTS is the file');
  ok(same(G.MATERIA_UNIT, T.materiaUnit), '2. MATERIA_UNIT = materiaUnit');
  ok(same(G.FORGE_STEP_DUST, T.forgeStepDust), '2. FORGE_STEP_DUST = forgeStepDust');
  ok(G.LIMIT_BREAK_COST_MULT === T.limitBreakCostMult, '2. LIMIT_BREAK_COST_MULT = limitBreakCostMult');
  ok(same(G.LEVEL_COST_MULT, T.levelCostMult), '2. LEVEL_COST_MULT = levelCostMult');
  ok(same(G.DUPLICATE_DIVISOR, T.duplicateDivisor), '2. DUPLICATE_DIVISOR = duplicateDivisor');
  ok(same(G.LIMIT_BREAK_DUPS, T.limitBreakDups), '2. LIMIT_BREAK_DUPS = limitBreakDups');
  ok(same(G.DISENCHANT_DUST, T.disenchantDust), '2. DISENCHANT_DUST = disenchantDust');
  ok(G.MATERIA_MOTE.dust === Math.round(T.materiaUnit.dust / T.moteDivisor) && G.MATERIA_MOTE.gold === Math.round(T.materiaUnit.gold / T.moteDivisor), '2. MATERIA_MOTE = the Unit ÷ moteDivisor');
  ok(G.MATERIA_DUST_COST === T.materiaDustCost, '2. MATERIA_DUST_COST = materiaDustCost');
  ok(G.__energy === T.energyUpgradeStep, '2. the first energy upgrade costs energyUpgradeStep Leaves');
  ok(same(G.PRESTIGE_TIERS.map(p=> [p.key, p.cost.dust, p.cost.gold]), T.prestige.map(p=> [p.key, p.dust, p.gold])), '2. PRESTIGE_TIERS costs = prestige');
  ok(same(G.FORGE_TIER_NAMES, T.forgeTiers.map(f=> f.name)), '2. the game\'s Forge tier names (literal, for the language packs) = the file\'s names');
  ok(G.FORGE_TIERS.length === T.forgeTiers.length, '2. FORGE_TIERS has the file\'s tiers');
  T.forgeTiers.forEach((f, i)=>{ const g = G.FORGE_TIERS[i] || {};
    ok(g.tier === f.tier && g.name === f.name && g.cap === f.cap && g.upTo === f.upTo, `2. tier ${f.tier}: name / cap / upTo`);
    if(f.gold == null) ok(!g.cost && g.map == null, `2. tier ${f.tier} stays free`);
    else ok(g.cost.gold === f.gold && g.cost.dust === f.dust && g.strange === f.strange && g.map === f.map, `2. tier ${f.tier}: gold / dust / strange / map`); });
}
// no hard-coded copy left in arena_app.js
ok(!/const FORGE_STEP_DUST = \[/.test(app) && !/const LEVEL_COST_MULT = \{/.test(app) && !/const DISENCHANT_DUST = \{/.test(app) && !/const MATERIA_UNIT = \{/.test(app) && !/\{tier:2, name:'Iron Forge'/.test(app), '2. the cost tables are no longer literals in arena_app.js');
ok(!/return 150 \* \(energyUpgradesBought/.test(app) && !/MATERIA_DUST_COST = 125/.test(app), '2. energy upgrade and Materia bench prices read the file');

// 3. fold round trip
const tmp = fs.mkdtempSync(path.join(os.tmpdir(), 'ucost-')), tf = path.join(tmp, 'table.json'), ef = path.join(tmp, 'edits.json');
fs.writeFileSync(tf, raw);
const E = [{path: 'forgeStepDust.3', value: 99}, {path: 'levelCostMult.rare', value: 5}, {path: 'forgeTiers.1.gold', value: 777}, {path: 'prestige.rainbow.dust', value: 1}, {path: 'materiaUnit.dust', value: 700}, {path: 'energyUpgradeStep', value: 175}, {path: 'modifiers.event', value: 2}];
const r = U.apply(T, E);
ok(r.changed.length === E.length && !r.unknown.length, '3. every edit applies');
ok(JSON.stringify(T) === JSON.stringify(JSON.parse(raw)) && JSON.stringify(T) !== JSON.stringify(r.table), '3. apply does not touch its input');
{ const a = U.values(T), b = U.values(r.table); const moved = Object.keys(a).filter(p=> a[p] !== b[p]).sort();
  ok(same(moved, E.map(e=> e.path).sort()), '3. exactly the edited numbers moved'); }
ok(U.get(r.table, 'forgeTiers.1.gold') === 777 && U.get(r.table, 'prestige.rainbow.dust') === 1 && r.table.forgeTiers[1].name === 'Iron Forge', '3. a tier / prestige edit lands on the right entry');
const bad = U.apply(T, [{path: 'nope.x', value: 1}, {path: 'forgeStepDust.3', value: -1}, {path: 'forgeStepDust.3', value: 'abc'}, {path: 'forgeTiers.0.gold', value: 5}, {path: 'forgeTiers.1.name', value: 5}, null]);
ok(!bad.changed.length && bad.unknown.length === 6, '3. unknown paths, negatives, non-numbers, a free tier\'s missing price and non-number fields are refused');
const run = (args)=> cp.spawnSync('node', [path.join(ROOT, 'tools', 'fold_upgrade_costs.js')].concat(args), {encoding: 'utf8'});
fs.writeFileSync(ef, JSON.stringify(E.map(e=> Object.assign({updatedAt: '2026-10-23T12:00:00Z'}, e))));
let o = run([ef, '--dry-run', '--file', tf]);
ok(o.status === 0 && /7 change\(s\)/.test(o.stdout) && fs.readFileSync(tf, 'utf8') === raw, '3. --dry-run lists the changes and writes nothing');
o = run([ef, '--file', tf]);
const after = fs.readFileSync(tf, 'utf8');
ok(o.status === 0 && after !== raw && same(JSON.parse(after), r.table) && U.format(JSON.parse(after)) === after, '3. the fold tool writes the edited table in the file layout');
ok(after.split('\n').length === raw.split('\n').length, '3. the diff is in place (same number of lines)');
// a listing in the ArtifactData shape, then the edits undone -> the original, byte for byte
fs.writeFileSync(ef, JSON.stringify({docs: E.map(e=> ({id: e.path, data: {path: e.path, value: U.get(T, e.path)}}))}));
o = run([ef, '--file', tf]);
ok(o.status === 0 && fs.readFileSync(tf, 'utf8') === raw, '3. putting the numbers back gives the original file byte for byte (ArtifactData listing form)');
// the Copy JSON form: the whole edited table
fs.writeFileSync(ef, U.format(r.table)); o = run([ef, '--file', tf]);
ok(o.status === 0 && fs.readFileSync(tf, 'utf8') === U.format(r.table), '3. a whole pasted table (Copy JSON) folds');
fs.writeFileSync(tf, raw); fs.writeFileSync(ef, JSON.stringify([{path: 'bogus.path', value: 3}]));
o = run([ef, '--file', tf]); ok(o.status === 0 && /Not in the table/.test(o.stdout) && fs.readFileSync(tf, 'utf8') === raw, '3. an unknown path is reported, not added');
fs.rmSync(tmp, {recursive: true, force: true});

// 4. the hub tab
const bh = rd('tools/hub/build_hub.py'), tab = rd('tools/hub/upgrade_costs_tab.js');
ok(bh.includes('upgrade_costs_tab.js') && bh.includes("'upgrade-costs.json'") && bh.includes('upgrade_costs_lib.js') && bh.includes('id="p-ucosts"') && bh.includes('data-tab="ucosts"') && bh.includes('{UC_INLINE}'), '4. build_hub.py builds the Upgrade costs tab with the table and the lib');
ok(/collection\('upgradeCosts'\)/.test(tab) && /claude\.use\('db'\)/.test(tab) && !/localStorage/.test(tab), '4. the tab keeps edits in the artifact db (collection upgradeCosts), not localStorage');
ok(/Copy JSON/.test(tab) && /hub\.onShow\.ucosts/.test(tab), '4. Copy JSON fallback; shown through hub.onShow.ucosts');
ok(fs.existsSync(path.join(ROOT, 'tools/hub/pull_upgrade_costs.md')), '4. tools/hub/pull_upgrade_costs.md says how Claude folds the edits');
try{ new vm.Script(tab); new vm.Script(rd('tools/upgrade_costs_lib.js')); ok(true); }catch(e){ ok(false, '4. the tab and lib scripts parse: ' + e.message); }
{ // run the lib + tab against a stub page: the rows and the preview render, an edit changes the preview and saves to a stub db
  const els = {}, mk = id=> (els[id] = els[id] || {id, innerHTML: '', textContent: '', value: '', className: '', style: {}, addEventListener(t, f){ (this.l = this.l || {})[t] = f; }, after(){}, setAttribute(){}, querySelectorAll(){ return []; }});
  const saved = {}, db = {collection: ()=> ({doc: id=> ({set: d=>{ saved[id] = d; return Promise.resolve(); }, delete: ()=>{ delete saved[id]; return Promise.resolve(); }}), onSnapshot(f){ f({docs: []}); }})};
  const sandbox = {window: {hub: {onShow: {}}, claude: {use: async ()=> db}}, document: {getElementById: mk, querySelector: ()=> null}, CSS: {escape: s=> s}, navigator: {}, console, setTimeout, clearTimeout, UC_SEED: T};
  sandbox.window.window = sandbox.window; sandbox.window.UpgradeCosts = undefined; vm.createContext(sandbox);
  try{
    vm.runInContext(rd('tools/upgrade_costs_lib.js'), sandbox); // sets window.UpgradeCosts through `this`/window
    sandbox.window.UpgradeCosts = sandbox.window.UpgradeCosts || sandbox.UpgradeCosts;
    ok(!!sandbox.window.UpgradeCosts, '4. the lib registers window.UpgradeCosts');
    vm.runInContext(tab, sandbox); ok(typeof sandbox.window.hub.onShow.ucosts === 'function', '4. the tab registers its onShow');
    sandbox.window.hub.onShow.ucosts();
    ok(/Common/.test(els.ucRows.innerHTML) || /Level 1 to 2/.test(els.ucRows.innerHTML), '4. the road rows render');
    ok(/Lv 1 to 10/.test(els.ucPrev.innerHTML) && new RegExp('>' + Math.round(T.forgeStepDust.slice(1).reduce((a, b)=> a + b, 0)).toLocaleString('en') + ' ').test(els.ucPrev.innerHTML.replace(/<[^>]+>/g, '>')) , '4. the preview shows the Common road total');
    ok((els.ucRows.innerHTML.match(/class="sc-row/g) || []).length === ent.filter(e=> e.group === 'road').length, '4. one row per road step');
  }catch(e){ ok(false, '4. the tab runs against a stub page: ' + (e && e.stack || e)); }
}
console.log(`upgrade-costs: ${checks - fail}/${checks} passed`);
process.exit(fail ? 1 : 0);
