#!/usr/bin/env node
// Package SKIR2 (2026-11-11): the road after SKIR1, recovered mostly by list adds (no card stat changed). No games are played.
//   1. the adds (tools/skir2/lists_2026_11_11.js ADDS): each on its map's MAP tier; Maps 0-11 in UI47_ADMIN_ADD (with SKIR1's Lumber adds), Maps
//      12-20 in UI47_SUGGEST; each with its reason in docs/design/map-suggestions-2026-11-11.json; no Stone card; each within its budget at the map
//      where it is now first obtainable; no card is listed on a later main map's list than its suggestion doc says (suggest = new to the road)
//   2. BAL9 JJ28: Coral Current, Wolfsbane Tundra, The Glass Dunes and Ashen Spurn each list a Guardian defender, and one of their road decks holds it
//   3. every road fight's card reward on Maps 0-20 and their side maps is obtainable (isUnattainable false): the first-clear pack card
//      (node.firstCard, else SKIRMISH_FIRST_PACK_CARDS) and every skirmish-exclusive card (a card whose source is that fight); 5-2's Sphagnum Vole
//      (CONTENT3) first among them
//   4. Map 13: its list holds Swift Fox, Tasmanian Devil and Bramblewood Lynx; every fight rebuilt by SKIR2 (in its build plan, dated comment)
//   5. the restored leaders (15-1 Cataphract Destrier, 10-A-2 Coral Reef Shark); every "(SKIR2 fit)" line is a kept fit or re-draw on record;
//      no road fight writes a field twice with two values (10-9 / 11-7's shieldOverride)
//   6. the record files; draft decisions SKIR2-n under 100 words, one of them "Keep SKIR2's list adds" naming every add
//   node tests/skir2-2026-11-11.js
'use strict';
const fs = require('fs'), path = require('path');
const ROOT = path.join(__dirname, '..');
const J = f => JSON.parse(fs.readFileSync(path.join(ROOT, f), 'utf8'));
let fail = 0, pass = 0; const ok = (c, m) => { if (c) pass++; else { fail++; console.log('  ✗ ' + m); } };
const LB = require(path.join(ROOT, 'tools', 'lib_bramble.js')), G = LB.G, D = LB.CARD_DEFS_BASELINE;
const M = require(path.join(ROOT, 'tools', 'skir1', 'lib_skir1_2026_11_11.js'));
const { ADDS, MAIN_ORDER } = require(path.join(ROOT, 'tools', 'skir2', 'lists_2026_11_11.js'));
const EXTRA = require(path.join(ROOT, 'tools', 'skir1', 'extra_2026_11_11.js'));
const src = fs.readFileSync(path.join(ROOT, 'arena_app.js'), 'utf8'), grab = n => JSON.parse((src.match(new RegExp('const ' + n + ' = (\\{.*?\\});\\n')) || [0, '{}'])[1]);
const pools = J('canonical/map-pools.json').maps, SUG = J('docs/design/map-suggestions-2026-11-11.json'), ADMIN = grab('UI47_ADMIN_ADD'), SUGGEST = grab('UI47_SUGGEST');
const SC = require(path.join(ROOT, 'tools', 'skill_costs.js')), SCN = SC.make(J('canonical/skill-costs.json'));
const lineOf = code => (src.match(new RegExp(`^\\s*\\{ ?key:\\s*"${code.replace(/-/g, '\\-')}",.*$`, 'm')) || [''])[0];
const no = id => MAIN_ORDER.indexOf(id);
// a card SKIR1 already held for the owner's re-fit (over budget at its first map, no stat change by Claude) may be carried to a later list: its
// first map, so its budget, does not move (Planarian Splitter: Maps 4 / 5 list it, SKIR2 carries it to Map 7)
const PENDING = {}; J('docs/balance/skir1/pending-budget-2026-11-11.json').cards.forEach(c => { PENDING[c.id] = c; });
const obtainMap = J('canonical/card-obtain-maps.json').maps;
const heldStill = id => !!PENDING[id] && (PENDING[id].obtainMap == null || obtainMap[id] === PENDING[id].obtainMap);

// 2026-11-12 (SKIR3): the owner's 11-12 picks are the lists now, under the NEW! / Carried limits; Claude's adds went first (tools/skir3/lists_2026_11_12.js).
// An add SKIR3 took off (its record names it, or the map's list no longer holds it) is checked as off; the rest as before.
const S3 = J('docs/balance/skir3/lists-2026-11-12.json'), s3off = (mid, id) => !!(S3.main[mid] || S3.side[mid]) && !((S3.main[mid] || S3.side[mid]).list || []).includes(id);
// ---- 1. the adds ----
// 2026-11-11 (LISTFIX3): an add that is a cut card (canonical/map-review.json cutArchive) is off its list again (tools/listfix3/lists_2026_11_11.js REMOVE: Sphagnum Vole)
const LF3 = require(path.join(ROOT, 'tools', 'listfix3', 'lists_2026_11_11.js')).REMOVE;
for (const [mid, adds] of Object.entries(ADDS)) for (const [id, x] of Object.entries(adds)) {
  if (s3off(mid, id)) { ok(!(pools[mid].cards || []).includes(id) && !(ADMIN[mid] || []).includes(id), `${mid}: ${id} is off its list (SKIR3: the owner's 11-12 picks under the limits)`); continue; }
  if ((LF3[mid] || {})[id]) { ok(!(pools[mid].cards || []).includes(id) && !(ADMIN[mid] || []).includes(id) && !(SUGGEST[mid] || []).includes(id), `${mid}: ${id} is off its list again (LISTFIX3: a cut card)`); continue; }
  ok(D[id], `${mid}: ${id} is a card`); if (!D[id]) continue;
  ok((pools[mid].cards || []).includes(id), `Map ${no(mid)} (${mid}): ${id} is on its MAP tier`);
  if (no(mid) <= 11) { ok((ADMIN[mid] || []).includes(id), `Map ${no(mid)}: ${id} in UI47_ADMIN_ADD`); ok(/^SKIR2: ./.test(((SUG.maps[mid] || {}).adminWhy || {})[id] || ''), `Map ${no(mid)}: ${id} has its reason (adminWhy)`); }
  else { ok((SUGGEST[mid] || []).includes(id), `Map ${no(mid)}: ${id} in UI47_SUGGEST`); ok(/^SKIR2: ./.test(((SUG.maps[mid] || {}).addWhy || {})[id] || ''), `Map ${no(mid)}: ${id} has its reason (addWhy)`);
    ok([].concat(SUG.maps[mid].suggest, SUG.maps[mid].carried).includes(id), `Map ${no(mid)}: ${id} in the suggestion doc's suggest / carried`); }
  ok(!M.stone(D[id]), `${id}: no Stone card before Map 21`);
  const b = SCN.budget(D[id], { level: 1 }); ok(b.ok || heldStill(id), `${id}: within its budget at its obtain map (${b.x1} <= ${b.N}), or held for the owner's re-fit by SKIR1 with its first map unchanged`);
  ok(x.why && x.why.length > 15, `${id}: the add says why`);
}
Object.entries(EXTRA.main || {}).forEach(([mid, o]) => Object.keys(o).forEach(id => { if (s3off(mid, id)) return; ok((ADMIN[mid] || []).includes(id), `SKIR1's admin add ${id} (${mid}) is in UI47_ADMIN_ADD`); ok(/^SKIR1: ./.test(((SUG.maps[mid] || {}).adminWhy || {})[id] || ''), `SKIR1's admin add ${id} has its reason`); }));
ok(/^\/\/ 2026-11-1[12] \(SKIR[23]\): admin adds.*\nconst UI47_ADMIN_ADD = /m.test(src), 'a dated comment names the admin adds above UI47_ADMIN_ADD'); // 2026-11-12: SKIR3's comment replaces SKIR2's
// THEME8's suggest / carried split still holds: a "suggest" card is first listed on that map (no earlier main map gives it)
const firstAt = {}; MAIN_ORDER.forEach((mid, i) => { const m = SUG.maps[mid]; if (!m) return; [].concat(m.ownerYes, m.adminAdd, m.suggest, m.carried, m.baby).forEach(id => { if (firstAt[id] == null) firstAt[id] = i; }); });
MAIN_ORDER.forEach((mid, i) => (SUG.maps[mid] && i >= 12 ? SUG.maps[mid].suggest : []).forEach(id => ok(firstAt[id] === i, `Map ${i}: suggested ${id} is new to the road (first on Map ${firstAt[id]})`)));
const use = {}; Object.values(SUG.maps).forEach(m => new Set([].concat(m.ownerYes, m.adminAdd, m.suggest, m.carried, m.baby)).forEach(id => { use[id] = (use[id] || 0) + 1; }));
ok(Object.entries(use).every(([id, k]) => SUG.usage[id] === k), 'the suggestion doc\'s usage counts follow its lists');

// ---- 2. BAL9 JJ28 ----
const L = require(path.join(ROOT, 'tools', 'skir1', 'lib_fight_2026_11_11.js'));
for (const mid of ['m7', 'm6', 'md', 'm3']) {
  if (['grey-seal-bull', 'shepherds-bark', 'marula-elephant', 'stalactite-golem'].some(id => s3off(mid, id) && (S3.main[mid].before || []).includes(id)) && !(pools[mid].cards || []).some(id => D[id] && (D[id].effects || {}).guardian)) continue; // 2026-11-12 (SKIR3): no room for the Guardian add (draft SKIR3-1)
  const guards = (pools[mid].cards || []).filter(id => D[id] && (D[id].effects || {}).guardian);
  ok(guards.length >= 1, `Map ${no(mid)} (${mid}): its list holds a Guardian defender (${guards.join(', ')})`);
  const m = L.maps().find(x => x.id === mid); ok(L.fightsOf(m).some(n => guards.some(id => n.deck[id])), `Map ${no(mid)}: a road deck holds its Guardian`);
}

// ---- 3. every road fight's card reward is obtainable ----
const tab = {}; ((src.match(/\/\* GD5-TABLE-START[\s\S]*?GD5-TABLE-END \*\//) || [''])[0]).replace(/'([a-z0-9]+):([^']+)':\s*'([^']+)'/g, (_, m, k, id) => { tab[m + ':' + k] = id; });
ok(Object.keys(tab).length > 40, `the first-clear pack card table reads (${Object.keys(tab).length} rows)`);
// 2026-11-11 (SKIR2, brief item 3): Maps 0-20 and every side map that opens on them (the Old Bramble, the tutorial and the endless dungeons
// included); a node pays its skirmish-exclusive cards (source = that node: nodeRewardCardIds) and its first-clear pack card (node.firstCard,
// else SKIRMISH_FIRST_PACK_CARDS: nodeFirstPackCardIds); both drop a card that isUnattainable, so the fight would pay nothing for it
const defs = G.getCardDefs(), seen = { pack: 0, firstCard: 0, exclusive: 0, maps: 0 }, bad = [];
for (const m of G.CONQUEST_MAPS) {
  const n0 = G.mapNumberOf(m.id); if (n0 == null || n0 > 20 || m.reserved || m.tower) continue; seen.maps++;
  for (const n of m.nodes || []) {
    const packIds = [].concat(n.firstCard != null ? n.firstCard : (tab[m.id + ':' + n.key] || [])), how = n.firstCard != null ? 'firstCard' : 'pack';
    const excl = Object.keys(defs).filter(id => { const s = G.cardSourceOf(defs[id]); return s.kind === 'map' && s.id === m.id && s.node === n.key && defs[id].cardType !== 'equipment' && !(G.isEasterEgg ? G.isEasterEgg(defs[id]) : defs[id].easterEgg); });
    packIds.forEach(id => { seen[how]++; const good = defs[id] && !G.isUnattainable(defs[id]); if (!good) bad.push(`${n.key} ${how} ${id}`); ok(good, `${n.key} (${m.id}): its first-clear pack card ${id} (${how === 'pack' ? 'SKIRMISH_FIRST_PACK_CARDS' : 'node.firstCard'}) is obtainable`); });
    excl.forEach(id => { seen.exclusive++; const good = !G.isUnattainable(defs[id]); if (!good) bad.push(`${n.key} exclusive ${id}`); ok(good, `${n.key} (${m.id}): its skirmish-exclusive card ${id} is obtainable`); });
  }
}
const nRewards = seen.pack + seen.firstCard + seen.exclusive;
ok(nRewards > 100 && seen.maps >= 39, `rewards checked: ${nRewards} on ${seen.maps} maps (${seen.pack} first-clear pack cards from the table, ${seen.firstCard} node.firstCard, ${seen.exclusive} skirmish-exclusive)${bad.length ? '; not obtainable: ' + bad.join(', ') : ''}`);
// 2026-11-11 (LISTFIX3, draft LISTFIX3-1): 5-2 pays Raft Spider, the owner's Map 5 Yes card nearest the cut Sphagnum Vole (was: Sphagnum Vole on Map 5's list)
const n52 = G.CONQUEST_MAPS.find(m => m.id === 'mw').nodes.find(n => n.key === '5-2');
ok(n52.firstCard === 'raft-spider' && !G.isUnattainable(defs['raft-spider']) && (pools.mw.cards || []).includes('raft-spider') && !(pools.mw.cards || []).includes('sphagnum-vole'), "5-2 pays Raft Spider, on Map 5's list and obtainable; the cut Sphagnum Vole is off it");

// ---- 4. Map 13 ----
['swift-fox', 'tasmanian-devil', 'bramblewood-lynx'].forEach(id => ok(pools.mr.cards.includes(id) || s3off('mr', id), `Map 13's list holds ${id} (SKIR1-7), unless SKIR3 took it off (the owner's 11-12 picks)`));
const plan = J('docs/balance/skir2/build-plan-2026-11-11.json'), mr = plan.maps.find(p => p.id === 'mr');
ok(mr && mr.fights.length === 8, 'Map 13 is in the SKIR2 build plan (8 fights)');
(mr ? mr.fights : []).forEach(x => ok(/\(SKIR2( fit)?\): /.test(lineOf(x.code)), `${x.code}: rebuilt by SKIR2 (dated comment)`));

// ---- 5. restored leaders, fits on record ----
[['ml', '15-1', 'cataphract-destrier'], ['mj', '10-A-2', 'coral-reef-shark']].forEach(([mid, code, id]) => {
  const m = G.CONQUEST_MAPS.find(x => x.id === mid), n = m.nodes.find(x => x.key === code); G.NODE_MAP_HINT.set(n, mid);
  if (G.isUnattainable(defs[id]) || !n.deck[id]) return; // 2026-11-12 (SKIR3): the card left play / the deck on the 11-12 lists
  ok(JSON.stringify(G.skirmishLeadersOf(n, mid)) === JSON.stringify([id]), `${code}: led by ${id} again`); });
const fitDirs = fs.readdirSync(path.join(ROOT, 'docs', 'balance', 'skir2')).filter(d => /^(fit|search)/.test(d) && fs.statSync(path.join(ROOT, 'docs', 'balance', 'skir2', d)).isDirectory()).map(d => path.join(ROOT, 'docs', 'balance', 'skir2', d));
const kept = {}; fitDirs.forEach(d => fs.readdirSync(d).filter(f => f.endsWith('.json')).forEach(f => { const x = JSON.parse(fs.readFileSync(path.join(d, f), 'utf8')); if (x.keep) (kept[x.code] = kept[x.code] || []).push(x); }));
src.split('\n').filter(l => /\(SKIR2 fit\): /.test(l)).forEach(l => { const code = (l.match(/key:\s*"([^"]+)"/) || [])[1];
  ok(code && kept[code], `${code}: its SKIR2 fit is a kept pick on record`); });
// 2026-11-11 (SKIR2): no road fight writes a field twice with two values (the later key wins in JS: 10-9 and 11-7 kept their old
// shieldOverride after the fit wrote 0 in front of it); comments are left out, a repeated identical value (SKIR1's pinned showcases) is harmless
const twice = [];
src.split('\n').forEach(l => { const m = l.match(/^\s*\{ ?key:\s*["']([^"']+)["']/); if (!m) return; const code = l.replace(/\/\*[\s\S]*?\*\//g, '');
  ['shieldOverride', 'deck', 'showcase', 'leaders', 'leaderId', 'hqHp', 'firstCard'].forEach(k => { const v = (code.match(new RegExp('[,{]\\s*' + k + ':\\s*("[^"]*"|\'[^\']*\'|\\d+|\\{[^}]*\\}|\\[[^\\]]*\\])', 'g')) || []).map(h => h.replace(/^[,{]\s*/, ''));
    if (new Set(v).size > 1) twice.push(`${m[1]} ${v.join(' / ')}`); }); });
ok(!twice.length, `no road fight writes a field twice with two values (${twice.join('; ') || 'none'})`);

// ---- 6. files and decisions ----
['docs/balance/skir2/lists-2026-11-11.json', 'docs/balance/skir2/build-plan-2026-11-11.json', 'docs/balance/skir2/seed-2026-11-11.json', 'docs/balance/skir2/cuts-2026-11-11.json', 'docs/balance/skir2/road-totals-skir2w400.json']
  .forEach(f => ok(fs.existsSync(path.join(ROOT, f)), f + ' exists'));
const words = s => String(s || '').split(/\s+/).filter(Boolean).length;
const DEC = J('docs/balance/skir2/decisions-2026-11-11.json').items || [];
DEC.forEach(x => ok(/^SKIR2-\d+$/.test(x.id) && words(x.body) + words((x.options || []).join(' ')) < 100 && x.default === 'a', x.id + ': body and options under 100 words, default a'));
const keepAdds = DEC.find(x => /Keep SKIR2's list adds/.test(x.title || ''));
ok(keepAdds, 'a draft decision "Keep SKIR2\'s list adds"');
if (keepAdds) Object.values(ADDS).forEach(o => Object.keys(o).forEach(id => ok(keepAdds.body.includes(D[id].name), `"Keep SKIR2's list adds" names ${D[id].name}`)));
console.log(`skir2: ${pass} passed, ${fail} failed`); process.exit(fail ? 1 : 0);
