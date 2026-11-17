// 2026-11-17 (BOLT2, owner OWN-1117-1 "only fire bolt in Map 20; the rest of the bolts, e.g. Archer Fish's Water Bolt, in Map 21+"):
// Archerfish leaves muc (Map 11 side) for Map 21's list; Fire Salamander leaves Map 19's list and muc, stays on Map 20 and Volcano Lair.
// (canonical/cards.json is not touched here: Fire Salamander's source stays m3 19-3, see the CHANGELOG / report.)
const fs = require('fs'), path = require('path'), ROOT = path.resolve(__dirname, '..');
const P = path.join(ROOT, 'canonical', 'map-pools.json'); let t = fs.readFileSync(P, 'utf8');
const M = JSON.parse(t).maps;
const drop = (arr, id) => { const i = arr.indexOf(id); if (i < 0) throw new Error(id + ' missing'); arr.splice(i, 1); };
const line = a => '[' + a.map(x => JSON.stringify(x)).join(', ') + ']';
// rewrite one list in place, text-level (keeps the file's layout)
function sub(oldArr, newArr) { const o = line(oldArr); if (t.split(o).length !== 2) throw new Error('list not unique: ' + oldArr.slice(0, 2)); t = t.replace(o, line(newArr)); }
const edit = (arr, f) => { const old = arr.slice(); f(arr); sub(old, arr); };
edit(M.m10.submaps.muc, a => { drop(a, 'archerfish'); drop(a, 'fire-salamander'); });
edit(M.m3.cards, a => drop(a, 'fire-salamander'));
edit(M.m21.cards, a => { a.push('archerfish'); });
fs.writeFileSync(P, t);
