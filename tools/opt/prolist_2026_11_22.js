#!/usr/bin/env node
// 2026-11-22 (package PROLIST, owner 09:56: "I noticed Map 0's strong deck uses the Thorn Shrike, a card not even in the map list. Do not use
// cards not in the map list."): the Maps 0-20 PRO / BPRO / WPRO decks that hold a card the list-only map rule now refuses (a SPECIAL-tier card
// not on the map's list and, for PRO, not held by then; deckopt mapTruePools opt.listOnly, deck1Pools) are repaired and brought back to the
// protocol marks with SKWK4's per-deck routine (docs/balance/skwk4/skwk4_2026_11_19.js tuneDeck / keepOf, unchanged): the off-list copies go to
// the pool card nearest the deck's mark, then a local descent inside the deck's own rules (BPRO / WPRO: the map's list; PRO: list + held, 10+
// list copies; 6 different, 4 copies, at most 10 copies shared with the map's other strong decks) towards its mark (N-SK deck: 15-30% vs the
// reference ladder and the Map reference at most 85%; other PRO / BPRO: the Map reference at most 85%; WPRO: the Map reference 50%+), checked
// on fresh seeds. Why not a fresh strongest-deck search: the N-SK / N-WK decks were tuned to those marks (SKWK2-4); a re-search would undo it.
// Every other deck stays as it is.
//   node tools/opt/prolist_2026_11_22.js plan                       which decks -> docs/balance/prolist/plan-2026-11-22.json
//   node tools/opt/prolist_2026_11_22.js tune [--shard 0 --shards 2] [--resume]   -> docs/balance/prolist/tune/<mapId>.json (resumable per deck)
//   node tools/opt/prolist_2026_11_22.js apply [--dry]              the repaired decks into canonical/pro-skirmishes.json (old ones under history;
//                                                                   a deck with no legal repair goes to `replaced`, ids renumbered)
//   node tools/opt/prolist_2026_11_22.js check                      every Maps 0-20 deck: no card off its map's list rule (exit 1 on a problem)
'use strict';
const fs = require('fs'), path = require('path');
const ROOT = path.resolve(__dirname, '..', '..');
const O = require('./deckopt.js'), P = require('./pro_skirmishes.js'), D1 = require('./deck1_2026_10_30.js'), T3 = require('../bench/deck.js');
const SK = require('../../docs/balance/skwk4/skwk4_2026_11_19.js');
const DATE = '2026-11-22', DIR = path.join(ROOT, 'docs', 'balance', 'prolist'), PLAN = path.join(DIR, `plan-${DATE}.json`), OUT = path.join(DIR, 'tune'), PRO_FILE = path.join(ROOT, 'canonical', 'pro-skirmishes.json');
const a = process.argv.slice(2), CMD = a[0], arg = (k, d) => { const i = a.indexOf(k); return i >= 0 ? a[i + 1] : d; }, has = k => a.includes(k);
const KINDS = ['pro', 'bpro', 'wpro'], readPro = () => JSON.parse(fs.readFileSync(PRO_FILE, 'utf8'));
const skKindOf = ent => (ent.bpro || []).length ? 'bpro' : 'pro';
// the maps: every entry of the file numbered 0-20, side maps that open later included (the Old Bramble mo, Map 17's mi open at Map 21; tests/deck1
// checks them as Map 0 / 17)
// --beyond20: the entries past Map 20 too (Maps 21-23 held SPECIAL cards; the owner's rule is for every map, BAL17-2 keeps tuning to 0-20, so a
// second pass only repairs them to the rule)
const mapsOf = (g, file) => Object.keys(file.maps).filter(id => has('--beyond20') ? file.maps[id].map > 20 : file.maps[id].map <= 20).map(id => g.G.CONQUEST_MAPS.find(m => m.id === id)).filter(Boolean);
// the PROLIST problems of a deck: a card its kind's pool refuses because it is off the map's list (SPECIAL tier or a road fight's deck only)
function offList(g, map, ent, kind, e) {
  const R = SK.rulesFor(g, map, ent, kind, e.id, e.deck), pe = g.pools[map.sub ? map.parent : map.id] || {}, sp = new Set(pe.special || []);
  return Object.keys(e.deck).filter(c => R.offRule(c) && (sp.has(c) || O.fightsOf(map).some(n => n.deck[c])));
}
function plan() {
  const g = O.loadGame(ROOT), file = readPro(), out = { about: 'PROLIST (2026-11-22): per Maps 0-20 map the decks holding a card off the map\'s list (owner 09:56), N-SK kind first; tools/opt/prolist_2026_11_22.js', maps: {} };
  let n = 0; const later = [];
  for (const map of mapsOf(g, file)) { const ent = file.maps[map.id]; if (!ent) continue; const sk = skKindOf(ent), row = { tune: [], cards: {} };
    // also a PRO deck whose SPECIAL card is held (so legal) but no longer counts as a list copy: under its 10 list copies now
    const pe = g.pools[map.sub ? map.parent : map.id] || {}, sp = new Set(pe.special || []), list = new Set(D1.deck1Pools(g, map).list || []);
    for (const kind of [sk].concat(KINDS.filter(k => k !== sk))) for (const e of ent[kind] || []) { let bad = offList(g, map, ent, kind, e);
      if (!bad.length && SK.rulesFor(g, map, ent, kind, e.id, e.deck).problems(e.deck).some(p => /list copies/.test(p))) bad = Object.keys(e.deck).filter(c => sp.has(c) && !list.has(c));
      if (bad.length) { row.tune.push(e.id); row.cards[e.id] = bad; n++; } }
    if (row.tune.length) out.maps[map.id] = row; }
  // beyond Map 20 (BAL17-2: tune Maps 0-20 only): listed, not touched
  Object.keys(file.maps).forEach(id => { const ent = file.maps[id], map = g.G.CONQUEST_MAPS.find(m => m.id === id); if (!map || ent.map <= 20) return;
    const sp = new Set(((g.pools[map.sub ? map.parent : map.id]) || {}).special || []), pe = g.pools[map.sub ? map.parent : map.id] || {}, list = map.sub ? ((pe.submaps || {})[id] || []) : (pe.cards || []);
    KINDS.forEach(k => (ent[k] || []).forEach(e => { const bad = Object.keys(e.deck).filter(c => sp.has(c) && !(Array.isArray(list) ? list : list.cards || []).includes(c)); if (bad.length) later.push(e.id + ': ' + bad.join(', ')); })); });
  out.beyondMap20 = later;
  fs.mkdirSync(DIR, { recursive: true }); fs.writeFileSync(PLAN, JSON.stringify(out, null, 1) + '\n');
  Object.entries(out.maps).forEach(([id, r]) => console.log(id.padEnd(5), r.tune.map(x => x + ' (' + r.cards[x].join(',') + ')').join('; ')));
  console.log(`${n} decks on ${Object.keys(out.maps).length} maps to repair; beyond Map 20 (not touched): ${later.length}`);
}
function tune() {
  const g = O.loadGame(ROOT), pl = JSON.parse(fs.readFileSync(PLAN, 'utf8')), SH = +arg('--shard', 0), SHS = +arg('--shards', 1);
  fs.mkdirSync(OUT, { recursive: true });
  for (const mid of Object.keys(pl.maps).filter((id, i) => i % SHS === SH)) {
    const f = path.join(OUT, mid + '.json'), prev = fs.existsSync(f) ? JSON.parse(fs.readFileSync(f, 'utf8')) : null;
    if (prev && !has('--resume')) continue; if (prev && prev.done) continue;
    const ent = readPro().maps[mid], map = g.G.CONQUEST_MAPS.find(m => m.id === mid), res = { map: mid, generated: null, decks: prev ? prev.decks : [] }, sk = skKindOf(ent);
    // the decks repaired before in this map are in place, so the overlap rule reads them
    res.decks.forEach(r => { const e = (ent[r.kind] || []).find(x => x.id === r.id); if (e && SK.keepOf(r)) e.deck = r.pick.deck; });
    for (const id of pl.maps[mid].tune) { if (res.decks.some(r => r.id === id)) continue;
      const kind = /-WPRO-/.test(id) ? 'wpro' : /-BPRO-/.test(id) ? 'bpro' : 'pro', e = (ent[kind] || []).find(x => x.id === id); if (!e) continue;
      const r = SK.tuneDeck(g, map, ent, e, kind, kind === sk, (...x) => console.log(...x)); res.decks.push(r); if (SK.keepOf(r)) e.deck = r.pick.deck;
      res.generated = new Date().toISOString(); fs.writeFileSync(f, JSON.stringify(res, null, 1) + '\n'); }
    res.done = true; res.generated = new Date().toISOString(); fs.writeFileSync(f, JSON.stringify(res, null, 1) + '\n');
  }
}
function apply(dry) {
  const g = O.loadGame(ROOT), file = readPro(), pl = JSON.parse(fs.readFileSync(PLAN, 'utf8')), rules = O.loadRules(ROOT), pc = v => v == null ? '-' : Math.round(v * 1000) / 10 + '%';
  let nT = 0, nD = 0; const rows = [];
  for (const mid of Object.keys(pl.maps)) {
    const f = path.join(OUT, mid + '.json'); if (!fs.existsSync(f)) { console.log(mid + ': no tune result (skipped)'); continue; }
    const res = JSON.parse(fs.readFileSync(f, 'utf8')); if (res.applied) { console.log(mid + ': applied on ' + res.applied + ' (skipped)'); continue; }
    if (!dry) { res.applied = DATE; fs.writeFileSync(f, JSON.stringify(res, null, 1) + '\n'); }
    const ent = file.maps[mid], map = g.G.CONQUEST_MAPS.find(m => m.id === mid), prefix = P.proPrefix(g, map);
    const h = { package: 'PROLIST', on: DATE, why: 'owner 2026-11-22 09:56 "Do not use cards not in the map list.": a SPECIAL-tier card off, the deck repaired and tuned to its mark (docs/balance/prolist/)' };
    for (const r of res.decks) { const e = (ent[r.kind] || []).find(x => x.id === r.id); if (!e) continue;
      if (SK.keepOf(r)) { (h.decks = h.decks || {})[r.id] = e.deck; e.deck = r.pick.deck; e.leaders = r.kind === 'wpro' ? [] : P.leadersFor(g, map, e.deck); e.h2h = null;
        try { e.labels = T3.describe(g, e.deck, rules, [e.focus], null).labels; } catch (x) { }
        const ob = r.objective, v = r.pick.val || {};
        e.prolist = `2026-11-22 (PROLIST): ${pl.maps[mid].cards[r.id].join(', ')} off (not on the map's list), ${r.trail.filter(t => /^repair/.test(t.move)).map(t => t.move.replace(/^repair: /, '')).join('; ')}; tuned for ${ob.metric === 'ladder' ? 'vs ladder 15-30% (now ' + pc(v.v) + '), Map reference ' + pc(v.ref) : r.kind === 'wpro' ? 'the Map reference at 50%+ (now ' + pc(v.ref) + ')' : 'the Map reference at 85% or under (now ' + pc(v.ref) + ')'} on validation seeds; not re-searched`;
        nT++; rows.push(`${r.id}: ${e.prolist}`); }
      else { (h.dropped = h.dropped || []).push({ id: r.id, deck: e.deck, why: (r.repairFailed || ['no legal repair']).join('; ') });
        ent.replaced = (ent.replaced || []).concat([{ kind: r.kind, id: r.id, deck: e.deck, source: e.source, dropped: r.repairFailed || ['no legal repair'], on: DATE, package: 'PROLIST' }]);
        ent[r.kind] = ent[r.kind].filter(x => x !== e); nD++; rows.push(`${r.id}: DROPPED (${(r.repairFailed || []).join('; ')})`); } }
    if (h.dropped) KINDS.forEach(k => (ent[k] || []).forEach((x, i) => { const id = `${prefix}-${k.toUpperCase()}-${i + 1}`; if (x.id !== id) { (h.renamed = h.renamed || {})[x.id] = id; x.id = id; x.name = id; } }));
    if (h.decks || h.dropped) ent.history = (ent.history || []).concat([h]);
  }
  rows.forEach(x => console.log(x)); console.log(`${nT} decks repaired, ${nD} dropped`);
  if (!dry) { file.updated = DATE; fs.writeFileSync(PRO_FILE, JSON.stringify(file, null, 1) + '\n'); console.log('-> canonical/pro-skirmishes.json (rebuild the game to bake it in)'); }
}
function check() {
  const g = O.loadGame(ROOT), file = readPro(), out = [];
  for (const map of mapsOf(g, file)) { const ent = file.maps[map.id]; if (!ent) continue;
    KINDS.forEach(k => (ent[k] || []).forEach(e => { const bad = offList(g, map, ent, k, e); if (bad.length) out.push(`${e.id}: ${bad.join(', ')} not on the map's list`); })); }
  out.forEach(x => console.log('problem: ' + x)); console.log(out.length ? out.length + ' problem(s)' : 'ok'); if (out.length) process.exitCode = 1;
}
module.exports = { offList };
if (require.main === module) {
  if (CMD === 'plan') plan(); else if (CMD === 'tune') tune(); else if (CMD === 'apply') apply(has('--dry')); else if (CMD === 'check') check();
  else console.log(fs.readFileSync(__filename, 'utf8').split('\n').slice(1, 16).map(l => l.replace(/^\/\/ ?/, '')).join('\n'));
}
