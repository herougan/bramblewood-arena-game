#!/usr/bin/env node
// 2026-10-25 (package PREF, REF-2 / REF-3, owner 22:36): the reference sets the game and the balance tools can play instead of the map's reference
// deck. Each is one file in docs/balance/ref/*.json with an "id"; this tool bakes them into arena_app.js (REF_DECK_SETS, between the
// REF-DECK-SETS markers), so Admin's "Play with the map's reference deck" picker, a map's X-REF fight, `skirmish_pass.js measure --ref=<id>` and
// `tools/opt/pro_ease.js --ref <id>` all offer it.
//
//   node tools/opt/ref_decks.js            dry run: the sets found, what would change
//   node tools/opt/ref_decks.js --apply    write them into arena_app.js (then rebuild: python3 assemble_arena.py && mv bramblewood-arena.html index.html)
//   node tools/opt/ref_decks.js --check    exit 1 when arena_app.js is out of date with the files (tests/pref-2026-10-25.js runs it)
//
// A file: {"id": "ref3", "label": "Reference-3", "leader": "<card id>" (optional), "counts": {"<card id>": n, ...} (20 cards),
//          "schedule": {"fromMap": 1, "perMap": 5, "seed": "ref3"}, "note": "..."}. The schedule: Forge levels gained over each copy's own
// starting level; from fromMap on every map gives perMap different copies +1 (arena_app.js refSetCopyLevels). A file without an "id" is
// skipped (notes, lists to be built). The id "map" is the built-in map reference and cannot be used.
'use strict';
const fs = require('fs'), path = require('path');
const ROOT = path.join(__dirname, '..', '..');
const APP = path.join(ROOT, 'arena_app.js'), DIR = path.join(ROOT, 'docs', 'balance', 'ref');
const START = '/*REF-DECK-SETS-START*/', END = '/*REF-DECK-SETS-END*/';

function readSets(root) {
  const dir = path.join(root || ROOT, 'docs', 'balance', 'ref'), cards = JSON.parse(fs.readFileSync(path.join(root || ROOT, 'canonical', 'cards.json'), 'utf8'));
  const known = new Set((Array.isArray(cards) ? cards : Object.values(cards)).map(c => c.id)), sets = {}, toolSets = {}, problems = [];
  (fs.existsSync(dir) ? fs.readdirSync(dir) : []).filter(f => f.endsWith('.json')).sort().forEach(f => {
    let j; try { j = JSON.parse(fs.readFileSync(path.join(dir, f), 'utf8')); } catch (e) { problems.push(f + ': not JSON'); return; }
    if (!j || !j.id) return;
    // 2026-10-27 (package BAL6, K17): a per-map set ("decks": {"<map>": counts}, the Pool reference) is played by the tools only (ref_pool.js
    // deckFor); the game's refSetFor takes one deck a set, so it is checked here but not baked
    // 2026-10-30 (package REF5): a per-map set with "bake": true (the progression reference, n decks a map, each {seed, counts, parts}) is baked:
    // the game's refSetFor deals one of the map's decks at random ("Reference (Random)") or the one picked ("<id>-k")
    if (j.decks && !j.counts && j.bake) {
      if (sets[j.id] || toolSets[j.id] || j.id === 'map' || !/^[a-z0-9]+$/.test(j.id)) { problems.push(f + ': bad or repeated id ' + j.id + ' (a baked per-map set: letters and digits only)'); return; }
      const decks = {}; let n = 0;
      Object.keys(j.decks).sort((a, b) => a - b).forEach(m => { const list = j.decks[m] || []; n = Math.max(n, list.length);
        decks[m] = list.map((e, i) => { const c = e.counts || {}, tot = Object.values(c).reduce((t, k) => t + (k | 0), 0), pt = (e.parts || []).reduce((t, p) => t + (p[1] | 0), 0);
          Object.keys(c).filter(id => !known.has(id)).forEach(id => problems.push(f + ': Map ' + m + ' deck ' + (i + 1) + ': unknown card ' + id));
          if (tot !== 20) problems.push(f + ': Map ' + m + ' deck ' + (i + 1) + ': ' + tot + ' cards (a deck is 20)'); if (pt !== tot) problems.push(f + ': Map ' + m + ' deck ' + (i + 1) + ': parts hold ' + pt + ' copies, counts ' + tot);
          return { seed: e.seed, counts: c, parts: e.parts || [] }; }); });
      sets[j.id] = { id: j.id, label: j.label || j.id, file: 'docs/balance/ref/' + f, perMap: true, n, decks }; return;
    }
    if (j.decks && !j.counts) {
      if (toolSets[j.id] || sets[j.id]) { problems.push(f + ': id ' + j.id + ' is used twice'); return; }
      Object.keys(j.decks).forEach(m => { const d = j.decks[m] || {}, n = Object.values(d).reduce((t, k) => t + (k | 0), 0);
        Object.keys(d).filter(id => !known.has(id)).forEach(id => problems.push(f + ': Map ' + m + ': unknown card ' + id)); if (n !== 20) problems.push(f + ': Map ' + m + ': ' + n + ' cards (a deck is 20)'); });
      toolSets[j.id] = { id: j.id, label: j.label || j.id, file: 'docs/balance/ref/' + f, maps: Object.keys(j.decks).length }; return;
    }
    if (j.id === 'map' || !/^[a-z0-9-]+$/.test(j.id)) { problems.push(f + ': bad id ' + j.id); return; }
    if (sets[j.id]) { problems.push(f + ': id ' + j.id + ' is used twice'); return; }
    const counts = j.counts || {}, n = Object.values(counts).reduce((t, k) => t + (k | 0), 0);
    Object.keys(counts).filter(id => !known.has(id)).forEach(id => problems.push(f + ': unknown card ' + id));
    if (j.leader && !known.has(j.leader)) problems.push(f + ': unknown leader ' + j.leader);
    if (n !== 20) problems.push(f + ': ' + n + ' cards (a deck is 20)');
    const sc = j.schedule || {};
    sets[j.id] = { id: j.id, label: j.label || j.id, file: 'docs/balance/ref/' + f, leader: j.leader || null, counts, schedule: { fromMap: sc.fromMap != null ? sc.fromMap : 1, perMap: sc.perMap != null ? sc.perMap : 5, seed: sc.seed || j.id } };
  });
  return { sets, toolSets, problems };
}
function bakedOf(src) { const i = src.indexOf(START), k = src.indexOf(END); if (i < 0 || k < 0) throw new Error('arena_app.js: no REF-DECK-SETS markers'); return { i, k, text: src.slice(i + START.length, k) }; }

function main(argv) {
  const apply = argv.includes('--apply'), check = argv.includes('--check');
  const { sets, toolSets, problems } = readSets(ROOT), src = fs.readFileSync(APP, 'utf8'), b = bakedOf(src), want = JSON.stringify(sets);
  problems.forEach(p => console.log('problem: ' + p));
  if (Object.keys(toolSets).length) console.log('per-map sets (tools only, not baked): ' + Object.keys(toolSets).map(id => id + ' (' + toolSets[id].label + ', ' + toolSets[id].maps + ' maps, ' + toolSets[id].file + ')').join(', '));
  console.log('sets: ' + (Object.keys(sets).map(id => id + ' (' + sets[id].label + ', ' + sets[id].file + ')').join(', ') || 'none'));
  const same = b.text === want;
  if (check) { if (!same || problems.length) { console.log(same ? 'problems in the files' : 'arena_app.js is out of date: node tools/opt/ref_decks.js --apply'); process.exit(1); } console.log('up to date'); return; }
  if (same) { console.log('arena_app.js is up to date'); return; }
  if (!apply) { console.log('would write ' + want.length + ' chars into arena_app.js (run with --apply)'); return; }
  if (problems.length) { console.log('not written: fix the problems first'); process.exit(1); }
  fs.writeFileSync(APP, src.slice(0, b.i + START.length) + want + src.slice(b.k)); console.log('wrote arena_app.js; rebuild index.html');
}
if (require.main === module) main(process.argv.slice(2));
module.exports = { readSets, bakedOf, START, END };
