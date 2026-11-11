#!/usr/bin/env node
// 2026-11-11 (package SKIR1, phase D): the data-only `unattainable` flag follows the new lists (LISTFIX1's rule, decision APPLY1-2; checked by
// tests/bal7-2026-10-28.js M3): a card the lists put in play loses a stale flag, a card they left on no list (out of play: tools/lib_map_pools.js
// isOutOfPlay) gets it. Only that field changes; the game never reads it (isUnattainable works from the lists and sources).
//   node tools/skir1/flags_2026_11_11.js [--dry]   -> canonical/cards.json, docs/balance/skir1/flags-2026-11-11.json
'use strict';
const fs = require('fs'), path = require('path');
const ROOT = path.resolve(__dirname, '..', '..'), F = path.join(ROOT, 'canonical', 'cards.json');
const cards = JSON.parse(fs.readFileSync(F, 'utf8'));
const LMP = require('../lib_map_pools.js'), LB = require('../lib_bramble.js'), BD = LB.CARD_DEFS_BASELINE, G = LB.G;
const listed = new Set(); Object.values(JSON.parse(fs.readFileSync(path.join(ROOT, 'canonical', 'map-pools.json'), 'utf8')).maps).forEach(e => (e.cards || []).concat(e.special || [], ...Object.values(e.submaps || {})).forEach(id => listed.add(id)));
// M3's two readings, both ways
const clear = cards.filter(c => c.unattainable && c.source && c.source.kind && !c.awaitingSource && !(c.source.kind === 'pack' && ![11, 99].includes(+c.source.tier) && !(c.source.map && listed.has(c.id))) && BD[c.id] && !LMP.isOutOfPlay(G, BD[c.id]));
const set = cards.filter(c => !c.unattainable && !c.pool && !c.token && !c.test && !c.hero && !c.easterEgg && !['materia', 'spell', 'equipment'].includes(c.cardType) && BD[c.id] && LMP.isOutOfPlay(G, BD[c.id]));
clear.forEach(c => { delete c.unattainable; }); set.forEach(c => { c.unattainable = true; });
console.log(`clear ${clear.length}: ${clear.map(c => c.id).join(' ')}\nset ${set.length}: ${set.map(c => c.id).join(' ')}`);
if (!process.argv.includes('--dry')) {
  fs.writeFileSync(F, JSON.stringify(cards, null, 2).replace(/[\u0080-￿]/g, ch => '\\u' + ch.charCodeAt(0).toString(16).padStart(4, '0')) + '\n');
  // the record is the whole change since SKIR1 began (commit 1137b281), so a re-run after a later list change keeps it complete
  const was = {}; JSON.parse(require('child_process').execSync('git show 1137b281:canonical/cards.json', { cwd: ROOT, maxBuffer: 1 << 28 }).toString()).forEach(c => { was[c.id] = !!c.unattainable; });
  fs.writeFileSync(path.join(ROOT, 'docs', 'balance', 'skir1', 'flags-2026-11-11.json'), JSON.stringify({ about: 'SKIR1: unattainable flags after the 2026-11-11 lists (tools/skir1/flags_2026_11_11.js), against the batch when SKIR1 began',
    cleared: cards.filter(c => was[c.id] && !c.unattainable).map(c => c.id), set: cards.filter(c => c.id in was && !was[c.id] && c.unattainable).map(c => c.id) }, null, 1) + '\n');
}
