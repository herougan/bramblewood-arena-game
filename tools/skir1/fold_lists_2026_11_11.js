#!/usr/bin/env node
// 2026-11-11 (package SKIR1, owner 2026-11-11 00:16: "redo all the deck optimisations, then finally - update ALL the skirmishes! ... No stone until
// Map 21+. Focus on lumber."): phase A, the map lists. Each main map 0-20's MAP tier (the list the game uses for packs, prospects and skirmish
// pools) becomes:
//   Maps 0-11   the owner's Yes picks (docs/design/map-picks-owner-2026-11-11.json) + Claude's admin adds (arena_app.js UI47_ADMIN_ADD);
//   Map 12      the owner's 3 picks + the THEME8 suggestions (UI47_SUGGEST.mh);
//   Maps 13-20  the THEME8 suggestions (UI47_SUGGEST; provisional, the owner reviews them later).
// Side maps up to the Map 20 region (the THEME8 submaps): their SUBMAP list becomes their suggestions (UI47_SUGGEST: own cards + carried).
// SPECIAL lists, the tutorial's lists, the endless dungeons and every other submap are kept as they are. EXTRA below holds SKIR1's own
// administrative adds (owner: "if you think my selection was not diverse enough ... you can make administrative changes"), each with its
// reason. Only the repo source is written (canonical/map-pools.json); the live `__cfg:map-pools:*` rows are server data and are not touched.
//   node tools/skir1/fold_lists_2026_11_11.js [--dry]   -> canonical/map-pools.json + docs/balance/skir1/lists-2026-11-11.json
'use strict';
const fs = require('fs'), path = require('path');
const ROOT = path.resolve(__dirname, '..', '..');
const J = f => JSON.parse(fs.readFileSync(path.join(ROOT, f), 'utf8'));
const DRY = process.argv.includes('--dry');
const SUG = J('docs/design/map-suggestions-2026-11-11.json'), PICKS = J('docs/design/map-picks-owner-2026-11-11.json').maps;
const POOLS_FILE = path.join(ROOT, 'canonical', 'map-pools.json'), pools = JSON.parse(fs.readFileSync(POOLS_FILE, 'utf8'));
// 'before' is the batch's lists when SKIR1 began (commit 1137b281, --base), so a re-run keeps the whole change on record
const BASE = (() => { const i = process.argv.indexOf('--base'); return i >= 0 ? process.argv[i + 1] : '1137b281'; })();
const before = JSON.parse(require('child_process').execSync('git show ' + BASE + ':canonical/map-pools.json', { cwd: ROOT, maxBuffer: 1 << 26 }).toString()).maps;
const src = fs.readFileSync(path.join(ROOT, 'arena_app.js'), 'utf8');
const grab = name => JSON.parse((src.match(new RegExp('const ' + name + ' = (\\{.*?\\});\\n')) || [0, '{}'])[1]);
const UI47_SUGGEST = grab('UI47_SUGGEST'), UI47_ADMIN_ADD = grab('UI47_ADMIN_ADD');
const CARDS = {}; J('canonical/cards.json').forEach(c => { CARDS[c.id] = c; });
// SKIR1's own administrative adds (main maps 0-11 only; filled in phase C where a map's skirmishes lack a mix kind or a spread archetype)
const EXTRA = require('./extra_2026_11_11.js'), { serialize } = require('../fold_map_pools.js'); // the file's own one-line-per-list format
const uniq = a => [...new Set(a)];
function newMainList(id, m) {
  const no = m.mapNo, yes = (PICKS[id] || {}).yes || [];
  const base = no <= 11 ? yes.concat(UI47_ADMIN_ADD[id] || []) : no === 12 ? yes.concat(UI47_SUGGEST[id] || []) : (UI47_SUGGEST[id] || []);
  return uniq(base.concat(Object.keys((EXTRA.main || {})[id] || {}), Object.keys((EXTRA.batch || {})[id] || {})));
}
const out = { about: 'SKIR1 phase A (tools/skir1/fold_lists_2026_11_11.js): the MAP tier of main maps 0-20 and the SUBMAP lists of the THEME8 side maps, before -> after', built: '2026-11-11', main: {}, submaps: {}, extra: EXTRA, missing: [] };
for (const [id, m] of Object.entries(SUG.maps)) {
  const e = pools.maps[id]; if (!e) throw new Error('no map-pools entry ' + id);
  const now = newMainList(id, m), was = (before[id] || {}).cards || [];
  const missing = now.filter(x => !CARDS[x]); if (missing.length) out.missing.push({ map: id, missing });
  const list = now.filter(x => CARDS[x]);
  out.main[id] = { mapNo: m.mapNo, name: m.name, rule: m.mapNo <= 11 ? 'owner Yes + UI47_ADMIN_ADD' : m.mapNo === 12 ? "owner's 3 + UI47_SUGGEST" : 'UI47_SUGGEST (provisional)',
    before: was.length, after: list.length, added: list.filter(x => !was.includes(x)), removed: was.filter(x => !list.includes(x)), list };
  e.cards = list;
}
for (const [sid, sm] of Object.entries(SUG.submaps)) {
  const e = pools.maps[sm.parent]; if (!e) throw new Error('no parent entry ' + sm.parent);
  e.submaps = e.submaps || {};
  const bs = ((before[sm.parent] || {}).submaps || {})[sid], was = Array.isArray(bs) ? bs : (bs && bs.cards) || [];
  const now = uniq((UI47_SUGGEST[sid] || []).concat(Object.keys((EXTRA.sub || {})[sid] || {})));
  const missing = now.filter(x => !CARDS[x]); if (missing.length) out.missing.push({ map: sid, missing });
  const list = now.filter(x => CARDS[x]);
  out.submaps[sid] = { name: sm.name, parent: sm.parent, unlockAfterNo: sm.unlockAfterNo, before: was.length, after: list.length, added: list.filter(x => !was.includes(x)), removed: was.filter(x => !list.includes(x)), list };
  e.submaps[sid] = list;
}
Object.values(out.main).forEach(r => console.log(`Map ${String(r.mapNo).padStart(2)} ${r.name.padEnd(24)} ${r.before} -> ${r.after}  +${r.added.length} -${r.removed.length}`));
Object.entries(out.submaps).forEach(([k, r]) => console.log(`  ${k.padEnd(4)} ${r.name.padEnd(24)} ${r.before} -> ${r.after}  +${r.added.length} -${r.removed.length}`));
if (out.missing.length) console.log('not in cards.json (left out):', JSON.stringify(out.missing));
if (!DRY) {
  fs.writeFileSync(POOLS_FILE, serialize(pools));
  fs.writeFileSync(path.join(ROOT, 'docs', 'balance', 'skir1', 'lists-2026-11-11.json'), JSON.stringify(out, null, 1) + '\n');
  console.log('-> canonical/map-pools.json, docs/balance/skir1/lists-2026-11-11.json');
} else console.log('dry run');
