#!/usr/bin/env node
// 2026-11-13 (package SIDE2, round 2 after LIST1): LIST1 folded the owner's 11-13 picks into canonical/map-pools.json and put the 24 cards he
// dropped but fights still field on their main map's SPECIAL list, "so every fight stays legal until it is re-carded" (docs/balance/list1-2026-11-13.md,
// decision LIST1-2). SPECIAL is part of a side fight's pool and of the search pools, so a re-card would pick them again. SIDE2 leaves them out:
//   - `strip`: removes them from the side maps' search plan (docs/balance/side2/refdecks/refdecks-plan-2026-11-11.json: BPRO / PRO / WPRO pools, anchors);
//   - require('./holds_2026_11_13.js').patch(): SKIR1's fight rules (tools/skir1/lib_fight_2026_11_11.js fight()) drop them from a side fight's pool,
//     unless the fight keeps the card (its first-clear card, leader or showcase: the owner's rewards stay until he re-points them).
//   node tools/side2/holds_2026_11_13.js strip
'use strict';
const fs = require('fs'), path = require('path');
const ROOT = path.resolve(__dirname, '..', '..');
const FOLD = JSON.parse(fs.readFileSync(path.join(ROOT, 'docs', 'balance', 'list1', 'fold-2026-11-13.json'), 'utf8'));
const held = new Set([].concat(...Object.values(FOLD.special || {}).map(a => a.map(x => x.id))));
function patch() {
  const L = require('../skir1/lib_fight_2026_11_11.js'); if (L.fight.side2Holds) return L;
  const orig = L.fight;
  L.fight = function (m, n) { const f = orig(m, n); if (f.side) { for (let i = f.pool.length - 1; i >= 0; i--) if (held.has(f.pool[i]) && !f.keep.has(f.pool[i])) f.pool.splice(i, 1); } return f; };
  L.fight.side2Holds = true; return L;
}
module.exports = { held, patch };
if (require.main === module && process.argv[2] === 'strip') {
  const P = path.join(ROOT, 'docs', 'balance', 'side2', 'refdecks', 'refdecks-plan-2026-11-11.json'), j = JSON.parse(fs.readFileSync(P, 'utf8')); let k = 0;
  Object.values(j.maps).forEach(x => ['bpro', 'pro', 'wpro'].forEach(kind => { const e = x[kind]; if (!e || e.none) return;
    ['pool', 'anchor'].forEach(f => { if (Array.isArray(e[f])) { const before = e[f].length; e[f] = e[f].filter(id => !held.has(id)); k += before - e[f].length; } }); }));
  j.side2Holds = 'SIDE2 (2026-11-13): LIST1\'s 24 held cards (dropped by the owner, kept on SPECIAL only for the old fights) left out of these pools';
  fs.writeFileSync(P, JSON.stringify(j, null, 1) + '\n'); console.log('stripped', k, 'pool entries');
}
