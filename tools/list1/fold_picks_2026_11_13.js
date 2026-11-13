#!/usr/bin/env node
// 2026-11-13 (package LIST1, owner 11:08 #10 / #14): folds the owner's live Map cards picks (card_overrides `__cfg:map-picks:<map>`, read
// read-only into docs/balance/server-overrides/map-picks-dump-2026-11-13.json) into the map lists, the way SKIR3 folded his 11-12 picks, but
// with no cut: #10 "turn them canonical - as in, not 11/10 but 11/11" (a map over its NEW! target keeps every pick; the target follows).
//   Main maps 0-21: the MAP tier = his Yes + Claude's admin adds he did not No (arena_app.js UI47_ADMIN_ADD) + KEEP below.
//   Side maps: the side list = his Yes + the old list's Carried cards (still Carried under the new main lists). Where he flagged Carried cards
//   himself (The Old Bramble, The Ice Hollow, Basalt Foundry, Volcano Lair), an old Carried card stays only if one of the side map's fights uses it.
//   A card he dropped that a fight of that map still fields (deck, leader, showcase) moves to the main map's SPECIAL list ("kept for its fight",
//   the LISTFIX2 rule) so every fight stays legal until the fights are re-carded (SIDE2 for the side maps).
// Then, as SKIR3: canonical/cards.json `unattainable` flags only (SKIR1's rule), canonical/card-obtain-maps.json (forge_curve maps).
// Writes docs/design/map-picks-owner-2026-11-13.json (the picks, the 11-12 file's shape) and docs/balance/list1/fold-2026-11-13.json (record).
//   node tools/list1/fold_picks_2026_11_13.js [--dry]
'use strict';
const fs = require('fs'), path = require('path'), cp = require('child_process');
const ROOT = path.resolve(__dirname, '..', '..'), J = f => JSON.parse(fs.readFileSync(path.join(ROOT, f), 'utf8'));
const DRY = process.argv.includes('--dry');
const L = require('../side1/lib_side1_2026_11_12.js'), { MAIN, SIDES, C, CARDS } = L, G = L.lb().G;
const { serialize } = require('../fold_map_pools.js');
const DUMP = 'docs/balance/server-overrides/map-picks-dump-2026-11-13.json', PICKS_OUT = 'docs/design/map-picks-owner-2026-11-13.json', RECF = 'docs/balance/list1/fold-2026-11-13.json';
// Barrel Cactus: CACTI1's card that SKIR3 placed on Map 18 (never one of his flags); kept where SKIR3 put it
const KEEP = { md: ['barrel-cactus'] };
const SIDE_OWN_CARRIED = new Set(['mo', 'mi', 'm9', 'mx']);
const rows = J(DUMP).rows.filter(r => r && !r.deleted && r.data && /^__cfg:map-picks:/.test(r.id));
const PK = {}; rows.forEach(r => { PK[r.data.mapId] = { yes: (r.data.yes || []).filter(id => C[id]), no: r.data.no || [], unknown: (r.data.yes || []).filter(id => !C[id]) }; });
const doc = J('canonical/map-pools.json'), before = JSON.parse(JSON.stringify(doc.maps)), P = doc.maps;
const src = fs.readFileSync(path.join(ROOT, 'arena_app.js'), 'utf8'), ADM = JSON.parse(src.match(/const UI47_ADMIN_ADD = (\{.*?\});\n/)[1]);
const uniq = a => [...new Set(a)];
const parentOf = s => Object.keys(P).find(t => (P[t].submaps || {})[s]);
// the cards a map's fights field (deck, leaders, showcase)
const fielded = id => { const m = G.CONQUEST_MAPS.find(x => x.id === id), out = new Map();
  (m && m.nodes || []).forEach(n => { if (!n.deck) return; const ids = Object.keys(n.deck); try { G.NODE_MAP_HINT.set(n, id); (G.skirmishLeadersOf(n, id) || []).forEach(x => ids.push(x)); } catch (e) {} if (n.showcase) ids.push(n.showcase);
    ids.forEach(x => { if (!out.has(x)) out.set(x, []); if (!out.get(x).includes(n.key)) out.get(x).push(n.key); }); });
  return out; };
const rec = { about: 'LIST1 fold (tools/list1/fold_picks_2026_11_13.js): the owner\'s 11-13 Map cards picks as the lists, no cut (#10)', built: '2026-11-13', main: {}, side: {}, special: {}, unknownIds: {} };
const toSpecial = (top, id, map, why) => { P[top].special = uniq((P[top].special || []).concat(id)); (rec.special[top] = rec.special[top] || []).push({ id, name: (C[id] || {}).name, from: map, why }); };
MAIN.forEach(k => {
  const p = PK[k] || { yes: [], no: [] }, adds = (ADM[k] || []).filter(id => C[id] && !p.no.includes(id)), list = uniq(p.yes.concat(adds, (KEEP[k] || []).filter(id => C[id] && (before[k].cards || []).includes(id))));
  const old = before[k].cards || [], gone = old.filter(id => !list.includes(id)), fl = fielded(k);
  gone.forEach(id => { if (fl.has(id)) toSpecial(k, id, k, 'dropped from the MAP list; fielded by ' + fl.get(id).join(', ')); });
  P[k].cards = list;
  rec.main[k] = { mapNo: G.mapNumberOf(k), added: list.filter(id => !old.includes(id)), dropped: gone, adminAdds: adds, kept: (KEEP[k] || []).filter(id => list.includes(id)) };
  if (p.unknown && p.unknown.length) rec.unknownIds[k] = p.unknown;
});
SIDES.forEach(s => {
  const top = parentOf(s), un = L.unlockOf(s), idx = L.carriedIndex(un, P), old = before[top].submaps[s] || [], p = PK[s] || { yes: [], no: [] }, fl = fielded(s);
  const keepCar = old.filter(id => idx.has(id) && !p.no.includes(id) && (!SIDE_OWN_CARRIED.has(s) || fl.has(id)));
  const list = uniq(p.yes.concat(keepCar)), gone = old.filter(id => !list.includes(id));
  gone.forEach(id => { if (fl.has(id)) toSpecial(top, id, s, 'dropped from ' + s + '; fielded by ' + fl.get(id).join(', ')); });
  P[top].submaps[s] = list;
  rec.side[s] = { parent: top, unlockAfterNo: un, ownerYes: p.yes, keptCarried: keepCar, dropped: gone, added: list.filter(id => !old.includes(id)) };
  if (p.unknown && p.unknown.length) rec.unknownIds[s] = p.unknown;
});
const pr = (k, r) => console.log(`${k.padEnd(4)} +${r.added.length} -${r.dropped.length}` + (r.dropped.length ? ' dropped: ' + r.dropped.join(' ') : ''));
Object.entries(rec.main).forEach(([k, r]) => pr(k, r)); Object.entries(rec.side).forEach(([k, r]) => pr(k, r));
Object.entries(rec.special).forEach(([k, l]) => console.log('SPECIAL', k, l.map(x => x.id).join(' ')));
if (DRY) { console.log('dry run'); process.exit(0); }
const picksDoc = { source: 'card_overrides __cfg:map-picks:* read 2026-11-13 (package LIST1, ' + DUMP + '). Side maps are keyed by their own id (sub: true). No targets set.', maps: {} };
MAIN.concat(SIDES).forEach(k => { if (PK[k]) picksDoc.maps[k] = Object.assign({ mapNo: G.mapNumberOf(k) }, SIDES.includes(k) ? { sub: true } : {}, { yes: PK[k].yes.concat(PK[k].unknown || []) }); });
fs.writeFileSync(path.join(ROOT, PICKS_OUT), JSON.stringify(picksDoc, null, 1) + '\n');
fs.writeFileSync(path.join(ROOT, 'canonical', 'map-pools.json'), serialize(doc));
// unattainable flags (SKIR1's / SKIR3's rule), read in a fresh process after the lists change
const out = cp.execFileSync(process.execPath, ['-e', `
  const LMP = require('./tools/lib_map_pools.js'), LB = require('./tools/lib_bramble.js'), BD = LB.CARD_DEFS_BASELINE, G = LB.G, fs = require('fs');
  const cards = JSON.parse(fs.readFileSync('canonical/cards.json', 'utf8')), listed = new Set();
  Object.values(JSON.parse(fs.readFileSync('canonical/map-pools.json', 'utf8')).maps).forEach(e => (e.cards || []).concat(e.special || [], ...Object.values(e.submaps || {})).forEach(id => listed.add(id)));
  const clear = cards.filter(c => c.unattainable && c.source && c.source.kind && !c.awaitingSource && !(c.source.kind === 'pack' && ![11, 99].includes(+c.source.tier) && !(c.source.map && listed.has(c.id))) && BD[c.id] && !LMP.isOutOfPlay(G, BD[c.id])).map(c => c.id);
  const set = cards.filter(c => !c.unattainable && !c.pool && !c.token && !c.test && !c.hero && !c.easterEgg && !['materia', 'spell', 'equipment'].includes(c.cardType) && BD[c.id] && LMP.isOutOfPlay(G, BD[c.id])).map(c => c.id);
  console.log(JSON.stringify({ clear, set }));`], { cwd: ROOT, encoding: 'utf8', maxBuffer: 1 << 26 });
const fl = JSON.parse(out.trim().split('\n').pop());
fl.clear.forEach(id => { delete C[id].unattainable; }); fl.set.forEach(id => { C[id].unattainable = true; });
if (fl.clear.length || fl.set.length) fs.writeFileSync(path.join(ROOT, 'canonical', 'cards.json'), JSON.stringify(CARDS, null, 2).replace(/[\u0080-￿]/g, ch => '\\u' + ch.charCodeAt(0).toString(16).padStart(4, '0')) + '\n');
cp.execFileSync(process.execPath, ['tools/forge_curve_2026_10_19.js', 'maps'], { cwd: ROOT, stdio: 'ignore' });
rec.flags = { cleared: fl.clear, set: fl.set };
fs.mkdirSync(path.join(ROOT, path.dirname(RECF)), { recursive: true }); fs.writeFileSync(path.join(ROOT, RECF), JSON.stringify(rec, null, 1) + '\n');
console.log('unattainable cleared:', fl.clear.join(' ') || '-', '| set:', fl.set.join(' ') || '-');
