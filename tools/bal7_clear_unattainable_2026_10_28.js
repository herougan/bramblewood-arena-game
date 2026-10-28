#!/usr/bin/env node
// Package BAL7 (2026-10-28, M3): clear the stale `unattainable: true` from cards that have a source. The game has not read the flag since
// 2026-10-12 (isUnattainable works from the source; loadCards deletes raw.unattainable), but tools still counted those cards as "not live".
// A card keeps the flag when it has no source (source missing or with no kind), a basic-pack source with no map (not placed), waits for
// one (awaitingSource) or is an Easter egg.
//   node tools/bal7_clear_unattainable_2026_10_28.js [apply]
'use strict';
const fs = require('fs'), path = require('path'), ROOT = path.join(__dirname, '..');
const CARDS = path.join(ROOT, 'canonical', 'cards.json'), cards = JSON.parse(fs.readFileSync(CARDS, 'utf8'));
const clear = [], keep = [];
for(const c of cards){ if(!c.unattainable) continue;
  // a basic-pack source (Pack 1-4) without a map is not placed yet (tests/rw5: every live basic-pack card has a map): it keeps the flag
  const s = c.source || {}, t = parseInt(s.tier, 10) || 1, placed = s.kind !== 'pack' || !!s.map || t === 11 || t === 99;
  const has = !!s.kind && s.kind !== 'easteregg' && placed && !c.awaitingSource && !c.easterEgg;
  (has ? clear : keep).push(c); }
const by = xs=> xs.reduce((m, c)=>{ const k = (c.source && c.source.kind) || 'none'; m[k] = (m[k] || 0) + 1; return m; }, {});
console.log(`clear ${clear.length} ${JSON.stringify(by(clear))}; keep ${keep.length} ${JSON.stringify(by(keep))}`);
if(process.argv.includes('apply')){
  clear.forEach(c=>{ delete c.unattainable; });
  fs.writeFileSync(CARDS, JSON.stringify(cards, null, 2).replace(/[\u007f-￿]/g, ch=> '\\u' + ch.charCodeAt(0).toString(16).padStart(4, '0')) + '\n');
  console.log('applied');
}
