#!/usr/bin/env node
// 2026-11-11 (package SKIR2): the list adds that recover the road after SKIR1. Owner authority (brief): Maps 0-11 may take 2-3 carried cards a
// map as admin adds (UI47_ADMIN_ADD); the Maps 12-20 lists are Claude's suggestions (UI47_SUGGEST) and may be edited. Standing rules kept: no
// Stone card before Map 21, no card stat changes. Each add carries its reason; the same reasons go to docs/design/map-suggestions-2026-11-11.json
// (adminWhy on Maps 0-11, addWhy on Maps 12-20) so the owner's Map cards window and the suggestion doc agree.
// What it writes (idempotent: a re-run with the same table changes nothing):
//   canonical/map-pools.json        each add on its map's MAP tier
//   arena_app.js                    UI47_ADMIN_ADD (Maps 0-11, plus SKIR1's Lumber adds, tools/skir1/extra) / UI47_SUGGEST (Maps 12-20),
//                                   and one dated comment line above UI47_ADMIN_ADD naming every admin add and why
//   docs/design/map-suggestions-2026-11-11.json   adminAdd / adminWhy, suggest / carried / addWhy, the usage counts (THEME8's rule)
//   canonical/cards.json            only the `unattainable` flags that follow the lists (SKIR1's flags rule, tests/bal7 M3)
//   canonical/card-obtain-maps.json regenerated (node tools/forge_curve_2026_10_19.js maps)
//   docs/balance/skir2/lists-2026-11-11.json      the record
//   node tools/skir2/lists_2026_11_11.js [--dry]
'use strict';
const fs = require('fs'), path = require('path'), cp = require('child_process');
const ROOT = path.resolve(__dirname, '..', '..');
const J = f => JSON.parse(fs.readFileSync(path.join(ROOT, f), 'utf8'));
// kind: own = first listed here (suggest), carried = an earlier list holds it, admin = a Maps 0-11 admin add
const ADDS = {
  mr: { // Map 13 The Redwood Deep (SKIR1-7 a): its old strongest fighters back (all three are Map 13's own pack cards, source.map mr)
    'swift-fox': { kind: 'own', why: "SKIR1-7: one of The Redwood Deep's old strongest fighters (its own pack card); the suggested list left every fight at 87-99%" },
    'tasmanian-devil': { kind: 'own', why: "SKIR1-7: one of The Redwood Deep's old strongest fighters (its own pack card)" },
    'bramblewood-lynx': { kind: 'own', why: "SKIR1-7: one of The Redwood Deep's old strongest fighters (its own pack card, source.map mr); now first listed here, carried on Map 16" } },
  mw: { 'sphagnum-vole': { kind: 'admin', why: "5-2's first-clear reward (CONTENT3)" } },
  mu: { // 7-6 read 79.5% (target 40) on the list; SKIR1's three fits stopped at 72-75%: one of its old boss cards back (BAL46's in-band deck held it and
    // the Dung Beetle, which stays off: with the boss's pinned showcase Corpse-flower Beetle it would be two cards of a two-card family in one fight)
    'planarian-splitter': { kind: 'admin', why: "7-6's old boss card (Map 7's own pack card by source), carried from Map 4: the boss read 79.5% (target 40) without it" } },
  m7: { 'grey-seal-bull': { kind: 'admin', why: 'BAL9 JJ28: a Guardian defender for Coral Current (its list had none): an Ocean seal bull carried from Smugglers\' Grotto (Map 2), on no other main list' },
    // item 8's reward scan (tests/skir2): first-clear pack cards SKIR1's lists left on no list, so the fight paid nothing (isUnattainable)
    'parrotfish': { kind: 'admin', why: "10-3's first-clear reward (GD5 table): on no list since SKIR1, so the fight paid nothing" },
    'coral-reef-shark': { kind: 'admin', why: "10-4's first-clear reward (GD5 table): on no list since SKIR1, so the fight paid nothing" } },
  ml: { 'cataphract-destrier': { kind: 'own', why: "15-4's first-clear reward (GD5 table; Map 15's own pack card): on no list since SKIR1, so the fight paid nothing" } },
  m6: { 'shepherds-bark': { kind: 'carried', why: 'BAL9 JJ28: a Guardian defender for Wolfsbane Tundra (its list had none): a herding dog against the wolves, carried from Map 15, on one list before' },
    'snow-ermine': { kind: 'own', why: "17-1's first-clear reward (GD5 table; Map 17's own pack card): on no main list since SKIR1, so the fight paid nothing" },
    'harbor-seal': { kind: 'own', why: "17-3's first-clear reward (GD5 table; Map 17's own pack card): on no list since SKIR1, so the fight paid nothing" },
    'snow-bunting-archer': { kind: 'own', why: "17-4's first-clear reward (GD5 table; Map 17's own pack card): on no list since SKIR1, so the fight paid nothing" } },
  md: { 'marula-elephant': { kind: 'carried', why: 'BAL9 JJ28: a Guardian defender for The Glass Dunes (its list had none): a desert-edge elephant carried from Map 14 like the list\'s other savanna cards, on one list before' } },
  m3: { 'stalactite-golem': { kind: 'carried', why: 'BAL9 JJ28: a Guardian defender for Ashen Spurn (its list had none): a cave wall from the lava tubes, carried from Map 8 (on Map 20\'s SPECIAL list too)' } },
};
// SKIR1's Lumber adds (tools/skir1/extra_2026_11_11.js main) are listed in UI47_ADMIN_ADD too (brief item 4), with SKIR1's reasons
const EXTRA = require('../skir1/extra_2026_11_11.js');
const MAIN_ORDER = ['m1', 'mf', 'mb', 'mc', 'm2', 'mw', 'm8', 'mu', 'm4', 'mk', 'm7', 'm10', 'mh', 'mr', 'm5', 'ml', 'mt', 'm6', 'md', 'm3', 'm11'];
module.exports = { ADDS, MAIN_ORDER };
if (require.main !== module) return;

const DRY = process.argv.includes('--dry');
const POOLS_FILE = path.join(ROOT, 'canonical', 'map-pools.json'), APP = path.join(ROOT, 'arena_app.js'), SUGF = path.join(ROOT, 'docs', 'design', 'map-suggestions-2026-11-11.json');
const CARDS_FILE = path.join(ROOT, 'canonical', 'cards.json');
const pools = JSON.parse(fs.readFileSync(POOLS_FILE, 'utf8')), SUG = JSON.parse(fs.readFileSync(SUGF, 'utf8')), cards = JSON.parse(fs.readFileSync(CARDS_FILE, 'utf8'));
const CARD = {}; cards.forEach(c => { CARD[c.id] = c; });
const { serialize } = require('../fold_map_pools.js'), M = require('../skir1/lib_skir1_2026_11_11.js');
const no = id => MAIN_ORDER.indexOf(id);
const rec = { about: 'SKIR2 list adds (tools/skir2/lists_2026_11_11.js)', built: '2026-11-11', adds: [], problems: [] };
// 1. the lists
for (const [mid, adds] of Object.entries(ADDS)) for (const [id, a] of Object.entries(adds)) {
  if (!CARD[id]) { rec.problems.push(`${mid}: ${id} is not a card`); continue; }
  if (M.stone(CARD[id]) && no(mid) < 21) { rec.problems.push(`${mid}: ${id} costs or makes Stone`); continue; }
  const e = pools.maps[mid]; if (!(e.cards || []).includes(id)) e.cards.push(id);
  rec.adds.push({ map: mid, mapNo: no(mid), card: id, name: CARD[id].name, kind: a.kind, why: a.why });
}
if (rec.problems.length) { console.log('problems:', rec.problems.join('; ')); process.exit(1); }
// 2. UI47 constants (one-line JSON, as tools/skir1 and the tests read them)
let src = fs.readFileSync(APP, 'utf8');
const grab = name => { const m = src.match(new RegExp('const ' + name + ' = (\\{.*?\\});\\n')); if (!m) throw new Error(name + ' not found'); return JSON.parse(m[1]); };
const put = (name, obj) => { src = src.replace(new RegExp('const ' + name + ' = \\{.*?\\};\\n'), () => 'const ' + name + ' = ' + JSON.stringify(obj).replace(/","/g, '", "').replace(/":\[/g, '": [').replace(/\],"/g, '], "') + ';\n'); };
const ADMIN = grab('UI47_ADMIN_ADD'), SUGGEST = grab('UI47_SUGGEST'), push = (o, k, id) => { o[k] = o[k] || []; if (!o[k].includes(id)) o[k].push(id); };
const why = {}; // map -> id -> reason for the admin adds this package names
Object.entries(EXTRA.main || {}).forEach(([mid, o]) => Object.entries(o).forEach(([id, w]) => { push(ADMIN, mid, id); (why[mid] = why[mid] || {})[id] = 'SKIR1: ' + w; }));
rec.adds.forEach(r => { if (r.mapNo <= 11) { push(ADMIN, r.map, r.card); (why[r.map] = why[r.map] || {})[r.card] = 'SKIR2: ' + r.why; } else push(SUGGEST, r.map, r.card); });
put('UI47_ADMIN_ADD', ADMIN); put('UI47_SUGGEST', SUGGEST);
const nm = id => (CARD[id] || {}).name || id;
const note = '// 2026-11-11 (SKIR2): admin adds named by SKIR1 / SKIR2, each with its reason in docs/design/map-suggestions-2026-11-11.json (maps.<id>.adminWhy): '
  + Object.entries(why).map(([mid, o]) => `Map ${no(mid)} ${Object.keys(o).map(nm).join(' + ')} (${Object.values(o).map(w => w.replace(/^SKIR\d: /, '').split(/[:(;]/)[0].trim()).join('; ')})`).join('; ') + '.\n';
src = src.replace(/^\/\/ 2026-11-11 \(SKIR2\): admin adds named by SKIR1 \/ SKIR2.*\n/m, '');
src = src.replace(/^const UI47_ADMIN_ADD = /m, () => note + 'const UI47_ADMIN_ADD = ');
// 3. the suggestion doc
for (const [mid, o] of Object.entries(why)) { const m = SUG.maps[mid]; m.adminAdd = m.adminAdd || []; m.adminWhy = m.adminWhy || {};
  Object.entries(o).forEach(([id, w]) => { if (!m.adminAdd.includes(id)) m.adminAdd.push(id); m.adminWhy[id] = w; }); }
rec.adds.filter(r => r.mapNo >= 12).forEach(r => { const m = SUG.maps[r.map], k = r.kind === 'own' ? 'suggest' : 'carried';
  if (!m[k].includes(r.card)) m[k].push(r.card); m.addWhy = m.addWhy || {}; m.addWhy[r.card] = 'SKIR2: ' + r.why; });
// a card that is now first listed earlier is carried on its later maps (THEME8: suggest = new to the road)
const firstAt = {}; MAIN_ORDER.forEach((mid, i) => { const m = SUG.maps[mid]; if (!m) return; [].concat(m.ownerYes, m.adminAdd, m.suggest, m.carried, m.baby).forEach(id => { if (firstAt[id] == null) firstAt[id] = i; }); });
MAIN_ORDER.forEach((mid, i) => { const m = SUG.maps[mid]; if (!m || i < 12) return; const moved = m.suggest.filter(id => firstAt[id] < i);
  if (moved.length) { m.suggest = m.suggest.filter(id => !moved.includes(id)); moved.forEach(id => { if (!m.carried.includes(id)) m.carried.push(id); }); rec.adds.push({ map: mid, mapNo: i, moved, note: 'now first listed on an earlier map: suggest -> carried' }); } });
const use = {}; Object.values(SUG.maps).forEach(m => new Set([].concat(m.ownerYes, m.adminAdd, m.suggest, m.carried, m.baby)).forEach(id => { use[id] = (use[id] || 0) + 1; }));
SUG.usage = Object.fromEntries(Object.entries(use).sort((a, b) => b[1] - a[1] || (a[0] < b[0] ? -1 : 1)));
Object.values(SUG.maps).forEach(m => { const ids = new Set([].concat(m.suggest, m.carried, m.ownerYes, m.adminAdd, m.baby)); // THEME8's key order kept, new cards last
  m.usage = Object.fromEntries(Object.keys(m.usage || {}).filter(id => ids.has(id)).concat([...ids].filter(id => !(id in (m.usage || {})))).map(id => [id, use[id]])); });
// 4. unattainable flags (SKIR1's rule: tools/skir1/flags_2026_11_11.js, tests/bal7 M3), read after the lists change
if (!DRY) fs.writeFileSync(POOLS_FILE, serialize(pools));
const flags = { cleared: [], set: [] };
if (!DRY) {
  const out = cp.execFileSync(process.execPath, ['-e', `
    const LMP = require('./tools/lib_map_pools.js'), LB = require('./tools/lib_bramble.js'), BD = LB.CARD_DEFS_BASELINE, G = LB.G, fs = require('fs');
    const cards = JSON.parse(fs.readFileSync('canonical/cards.json', 'utf8')), listed = new Set();
    Object.values(JSON.parse(fs.readFileSync('canonical/map-pools.json', 'utf8')).maps).forEach(e => (e.cards || []).concat(e.special || [], ...Object.values(e.submaps || {})).forEach(id => listed.add(id)));
    const clear = cards.filter(c => c.unattainable && c.source && c.source.kind && !c.awaitingSource && !(c.source.kind === 'pack' && ![11, 99].includes(+c.source.tier) && !(c.source.map && listed.has(c.id))) && BD[c.id] && !LMP.isOutOfPlay(G, BD[c.id])).map(c => c.id);
    const set = cards.filter(c => !c.unattainable && !c.pool && !c.token && !c.test && !c.hero && !c.easterEgg && !['materia', 'spell', 'equipment'].includes(c.cardType) && BD[c.id] && LMP.isOutOfPlay(G, BD[c.id])).map(c => c.id);
    console.log(JSON.stringify({ clear, set }));`], { cwd: ROOT, encoding: 'utf8', maxBuffer: 1 << 26 });
  const r = JSON.parse(out.trim().split('\n').pop());
  r.clear.forEach(id => { delete CARD[id].unattainable; }); r.set.forEach(id => { CARD[id].unattainable = true; }); flags.cleared = r.clear; flags.set = r.set;
  if (r.clear.length || r.set.length) fs.writeFileSync(CARDS_FILE, JSON.stringify(cards, null, 2).replace(/[\u0080-￿]/g, ch => '\\u' + ch.charCodeAt(0).toString(16).padStart(4, '0')) + '\n');
  fs.writeFileSync(APP + '.skir2tmp', src); fs.renameSync(APP + '.skir2tmp', APP);
  fs.writeFileSync(SUGF, JSON.stringify(SUG, null, 1) + '\n');
  // the record is the whole change since SKIR2 began (the batch tip ffd5b58c), so a re-run keeps it complete
  const BASE = 'ffd5b58c', atBase = f => JSON.parse(cp.execSync('git show ' + BASE + ':' + f, { cwd: ROOT, maxBuffer: 1 << 28 }).toString());
  const obt0 = atBase('canonical/card-obtain-maps.json').maps, was = {}; atBase('canonical/cards.json').forEach(c => { was[c.id] = !!c.unattainable; });
  flags.cleared = cards.filter(c => was[c.id] && !c.unattainable).map(c => c.id); flags.set = cards.filter(c => c.id in was && !was[c.id] && c.unattainable).map(c => c.id);
  cp.execFileSync(process.execPath, ['tools/forge_curve_2026_10_19.js', 'maps'], { cwd: ROOT, stdio: 'ignore' });
  const obt1 = J('canonical/card-obtain-maps.json').maps;
  rec.obtainMaps = [...new Set(Object.keys(obt0).concat(Object.keys(obt1)))].filter(id => obt0[id] !== obt1[id]).map(id => ({ id, before: obt0[id] == null ? 0 : obt0[id], after: obt1[id] == null ? 0 : obt1[id] }));
  rec.flags = flags; rec.uiAdminAdd = ADMIN; rec.uiSuggest = Object.fromEntries(Object.keys(ADDS).filter(k => no(k) >= 12).map(k => [k, SUGGEST[k]]));
  fs.mkdirSync(path.join(ROOT, 'docs', 'balance', 'skir2'), { recursive: true });
  fs.writeFileSync(path.join(ROOT, 'docs', 'balance', 'skir2', 'lists-2026-11-11.json'), JSON.stringify(rec, null, 1) + '\n');
}
rec.adds.forEach(r => console.log(r.card ? `Map ${r.mapNo} ${r.map}: + ${r.card} (${r.kind})` : `Map ${r.mapNo} ${r.map}: ${r.moved.join(', ')} ${r.note}`));
console.log('flags cleared:', flags.cleared.join(' ') || '-', '| set:', flags.set.join(' ') || '-');
if (rec.obtainMaps) console.log('obtain maps:', rec.obtainMaps.map(x => `${x.id} ${x.before}->${x.after}`).join(', ') || 'unchanged');
console.log(DRY ? 'dry run' : '-> map-pools.json, arena_app.js UI47, map-suggestions json, cards.json flags, card-obtain-maps.json, docs/balance/skir2/lists-2026-11-11.json');
