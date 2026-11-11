#!/usr/bin/env node
// 2026-11-11 (package LISTFIX3): takes back off the Maps 0-20 lists the 12 cards that Claude's admin adds (UI47_ADMIN_ADD) and suggestions
// (UI47_SUGGEST) had put back after they were cut (canonical/map-review.json cutArchive; tests/listfix2). Each card leaves only the list it was
// cut from; another list may still hold it. The 3 cuts the owner re-picked Yes on 11-11 stay (mk Fishing Cat, mw Alley Cat, mw Marsh-mallow Hare).
// Writes (idempotent): canonical/map-pools.json, arena_app.js UI47_ADMIN_ADD / UI47_SUGGEST, docs/design/map-suggestions-2026-11-11.json,
// canonical/cards.json `unattainable` flags (SKIR1's rule), canonical/card-obtain-maps.json (tools/forge_curve_2026_10_19.js maps), and the record
// docs/balance/listfix3/lists-2026-11-11.json.   node tools/listfix3/lists_2026_11_11.js [--dry]
'use strict';
const fs = require('fs'), path = require('path'), cp = require('child_process');
const ROOT = path.resolve(__dirname, '..', '..'), J = f => JSON.parse(fs.readFileSync(path.join(ROOT, f), 'utf8'));
// list key -> card -> where Claude had put it back
const REMOVE = {
  m2: { 'water-vole': 'UI47_ADMIN_ADD' }, m7: { 'coral-polyp-colony': 'UI47_ADMIN_ADD' }, mw: { 'caiman-hatchling': 'UI47_ADMIN_ADD', 'sphagnum-vole': 'UI47_ADMIN_ADD' },
  m5: { 'plains-zebra': 'UI47_SUGGEST' }, m6: { 'talus-pika': 'UI47_SUGGEST' }, ml: { 'squires-mount': 'UI47_SUGGEST', 'warhorse-charger': 'UI47_SUGGEST' },
  mp: { duckling: 'UI47_SUGGEST' }, mr: { 'stag-knight': 'UI47_SUGGEST' }, mt: { 'dhole-runner': 'UI47_SUGGEST' }, mx: { 'phoenix-fledgling': 'UI47_SUGGEST' },
};
const GAPS = { // THEME8's gap notes that named a removed card
  mw: ['Ambush (the gators, DES2) had no carrier: Caiman Hatchling (admin add) closes it.', 'Ambush (the gators, DES2) has no carrier: Caiman Hatchling, the owner\'s 11-01 cut, is off the list again (LISTFIX3).'],
  mt: ['Pack + Pack Leader shown as a pair (Dhole Runner, Dhole Matriarch).', 'Pack + Pack Leader: only Dhole Matriarch (Dhole Runner, cut 11-05, is off the list again: LISTFIX3).'],
};
module.exports = { REMOVE };
if (require.main !== module) return;
const DRY = process.argv.includes('--dry');
const POOLS_FILE = path.join(ROOT, 'canonical', 'map-pools.json'), APP = path.join(ROOT, 'arena_app.js'), SUGF = path.join(ROOT, 'docs', 'design', 'map-suggestions-2026-11-11.json');
const pools = J('canonical/map-pools.json'), SUG = J('docs/design/map-suggestions-2026-11-11.json'), arc = (J('canonical/map-review.json').cutArchive || {}).maps || {};
const { serialize } = require('../fold_map_pools.js');
const topOf = {}; Object.entries(pools.maps).forEach(([t, e]) => { topOf[t] = t; Object.keys(e.submaps || {}).forEach(s => { topOf[s] = t; }); });
const rec = { about: 'LISTFIX3: cut cards taken back off the lists Claude had put them on (tools/listfix3/lists_2026_11_11.js)', built: '2026-11-11', removed: [], problems: [] };
let src = fs.readFileSync(APP, 'utf8');
const grab = name => JSON.parse(src.match(new RegExp('const ' + name + ' = (\\{.*?\\});\\n'))[1]);
const put = (name, obj) => { src = src.replace(new RegExp('const ' + name + ' = \\{.*?\\};\\n'), () => 'const ' + name + ' = ' + JSON.stringify(obj).replace(/","/g, '", "').replace(/":\[/g, '": [').replace(/\],"/g, '], "') + ';\n'); };
const UI = { UI47_ADMIN_ADD: grab('UI47_ADMIN_ADD'), UI47_SUGGEST: grab('UI47_SUGGEST') };
const drop = (a, id) => { const i = (a || []).indexOf(id); if (i >= 0) a.splice(i, 1); return i >= 0; };
for (const [k, o] of Object.entries(REMOVE)) for (const [id, from] of Object.entries(o)) {
  const cut = (arc[k] || []).find(e => e.id === id); if (!cut) { rec.problems.push(`${k}: ${id} has no cut entry`); continue; }
  const t = topOf[k], e = pools.maps[t], list = k === t ? e.cards : e.submaps[k];
  const r = { list: k, card: id, from, cut: cut.why, cutBy: cut.by, offList: drop(list, id), offConst: drop(UI[from][k], id) };
  const m = k === t ? SUG.maps[k] : SUG.submaps[k];
  if (m) { r.offDoc = ['adminAdd', 'suggest', 'carried', 'ownerYes'].filter(f => drop(m[f], id)); if (m.adminWhy) delete m.adminWhy[id]; if (m.addWhy) delete m.addWhy[id];
    (m.skills || []).forEach(s => drop(s.carriers, id)); m.skills = (m.skills || []).filter(s => s.carriers.length); if (m.usage) delete m.usage[id];
    if (GAPS[k]) m.gaps = m.gaps.map(g => g === GAPS[k][0] ? GAPS[k][1] : g); }
  const still = []; Object.entries(pools.maps).forEach(([mt, me]) => { if ((me.cards || []).includes(id)) still.push(mt); if ((me.special || []).includes(id)) still.push(mt + ' SPECIAL'); Object.entries(me.submaps || {}).forEach(([s, l]) => { if ((Array.isArray(l) ? l : l.cards || []).includes(id)) still.push(s); }); });
  r.stillOn = still; rec.removed.push(r);
}
if (rec.problems.length) { console.log('problems:', rec.problems.join('; ')); process.exit(1); }
put('UI47_ADMIN_ADD', UI.UI47_ADMIN_ADD); put('UI47_SUGGEST', UI.UI47_SUGGEST);
src = src.replace(/; Map 5 Sphagnum Vole \(5-2's first-clear reward\)/, ''); // the SKIR2 note above UI47_ADMIN_ADD names its adds
// THEME8's split: a removed card whose first main list is now a later map is that map's suggestion, not carried (Talus Pika: Map 19)
const MAIN_ORDER = require('../skir2/lists_2026_11_11.js').MAIN_ORDER, firstAt = {};
MAIN_ORDER.forEach((mid, i) => { const m = SUG.maps[mid]; if (m) [].concat(m.ownerYes, m.adminAdd, m.suggest, m.carried, m.baby).forEach(id => { if (firstAt[id] == null) firstAt[id] = mid; }); });
rec.removed.forEach(r => { const mid = firstAt[r.card], m = SUG.maps[mid]; if (m && MAIN_ORDER.indexOf(mid) >= 12 && drop(m.carried, r.card)) { m.suggest.push(r.card); r.nowSuggestOn = mid; } });
// THEME8's usage counts (tools/skir2/lists_2026_11_11.js rule; the submaps' the same over suggest + carried)
const count = (ms, f) => { const u = {}; Object.values(ms).forEach(m => new Set(f(m)).forEach(id => { u[id] = (u[id] || 0) + 1; })); return Object.fromEntries(Object.entries(u).sort((a, b) => b[1] - a[1] || (a[0] < b[0] ? -1 : 1))); };
SUG.usage = count(SUG.maps, m => [].concat(m.ownerYes, m.adminAdd, m.suggest, m.carried, m.baby));
SUG.usageSubmaps = count(SUG.submaps, m => [].concat(m.suggest || [], m.carried || []));
Object.values(SUG.maps).forEach(m => { if (m.usage) Object.keys(m.usage).forEach(id => { m.usage[id] = SUG.usage[id]; }); });
rec.removed.forEach(r => console.log(`${r.list.padEnd(4)} - ${r.card.padEnd(20)} list ${r.offList ? 'off' : '(was off)'}, ${r.from} ${r.offConst ? 'off' : '(was off)'}, doc ${(r.offDoc || []).join('/') || '-'}; still on: ${r.stillOn.join(' ') || 'no list'}`));
if (DRY) { console.log('dry run'); process.exit(0); }
fs.writeFileSync(POOLS_FILE, serialize(pools));
fs.writeFileSync(APP + '.lf3tmp', src); fs.renameSync(APP + '.lf3tmp', APP);
fs.writeFileSync(SUGF, JSON.stringify(SUG, null, 1) + '\n');
// the unattainable flags (SKIR1's rule, tools/skir1/flags_2026_11_11.js; its own record file is SKIR1's, so the flags are set here) and the obtain maps
const obt0 = J('canonical/card-obtain-maps.json').maps;
const out = cp.execFileSync(process.execPath, ['-e', `
  const LMP = require('./tools/lib_map_pools.js'), LB = require('./tools/lib_bramble.js'), BD = LB.CARD_DEFS_BASELINE, G = LB.G, fs = require('fs');
  const cards = JSON.parse(fs.readFileSync('canonical/cards.json', 'utf8')), listed = new Set();
  Object.values(JSON.parse(fs.readFileSync('canonical/map-pools.json', 'utf8')).maps).forEach(e => (e.cards || []).concat(e.special || [], ...Object.values(e.submaps || {})).forEach(id => listed.add(id)));
  const clear = cards.filter(c => c.unattainable && c.source && c.source.kind && !c.awaitingSource && !(c.source.kind === 'pack' && ![11, 99].includes(+c.source.tier) && !(c.source.map && listed.has(c.id))) && BD[c.id] && !LMP.isOutOfPlay(G, BD[c.id])).map(c => c.id);
  const set = cards.filter(c => !c.unattainable && !c.pool && !c.token && !c.test && !c.hero && !c.easterEgg && !['materia', 'spell', 'equipment'].includes(c.cardType) && BD[c.id] && LMP.isOutOfPlay(G, BD[c.id])).map(c => c.id);
  console.log(JSON.stringify({ clear, set }));`], { cwd: ROOT, encoding: 'utf8', maxBuffer: 1 << 26 });
const fl = JSON.parse(out.trim().split('\n').pop()), cards = J('canonical/cards.json'), CARD = {}; cards.forEach(c => { CARD[c.id] = c; });
fl.clear.forEach(id => { delete CARD[id].unattainable; }); fl.set.forEach(id => { CARD[id].unattainable = true; });
if (fl.clear.length || fl.set.length) fs.writeFileSync(path.join(ROOT, 'canonical', 'cards.json'), JSON.stringify(cards, null, 2).replace(/[\u0080-￿]/g, ch => '\\u' + ch.charCodeAt(0).toString(16).padStart(4, '0')) + '\n');
cp.execFileSync(process.execPath, ['tools/forge_curve_2026_10_19.js', 'maps'], { cwd: ROOT, stdio: 'ignore' });
const obt1 = J('canonical/card-obtain-maps.json').maps;
rec.flags = { cleared: fl.clear, set: fl.set };
rec.obtainMaps = [...new Set(Object.keys(obt0).concat(Object.keys(obt1)))].filter(id => obt0[id] !== obt1[id]).map(id => ({ id, before: obt0[id] == null ? null : obt0[id], after: obt1[id] == null ? null : obt1[id] }));
fs.mkdirSync(path.join(ROOT, 'docs', 'balance', 'listfix3'), { recursive: true });
fs.writeFileSync(path.join(ROOT, 'docs', 'balance', 'listfix3', 'lists-2026-11-11.json'), JSON.stringify(rec, null, 1) + '\n');
console.log('flags cleared:', fl.clear.join(' ') || '-', '| set:', fl.set.join(' ') || '-');
console.log('obtain maps:', rec.obtainMaps.map(x => `${x.id} ${x.before}->${x.after}`).join(', ') || 'unchanged');
