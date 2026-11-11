#!/usr/bin/env node
// 2026-11-12 (package SKIR3): the owner's drop list from the list record (docs/balance/skir3/lists-2026-11-12.json, tools/skir3/lists_2026_11_12.js) and
// the first-clear swaps (rewards-2026-11-12.json): per map, his picks taken off (and why), Claude's adds removed, the final NEW! / Carried counts; the
// cards that left play.   node tools/skir3/droplist_2026_11_12.js   -> docs/balance/skir3/drop-list-2026-11-12.md
'use strict';
const fs = require('fs'), path = require('path');
const ROOT = path.resolve(__dirname, '..', '..'), J = f => JSON.parse(fs.readFileSync(path.join(ROOT, f), 'utf8'));
const R = J('docs/balance/skir3/lists-2026-11-12.json'), RW = J('docs/balance/skir3/rewards-2026-11-12.json');
const C = {}; J('canonical/cards.json').forEach(c => { C[c.id] = c; });
const LB = require('../lib_bramble.js'), G = LB.G, nameOf = id => (C[id] || {}).name || id;
const mapName = id => { const m = G.CONQUEST_MAPS.find(x => x.id === id); return m ? m.name : id; };
const NO = {}; Object.entries(R.main).forEach(([k, r]) => { NO[k] = r.mapNo; });
const where = list => { const ids = String(list || '').split(',').filter(x => x && !/no main/.test(x)); if (!ids.length) return null;
  return ids.map(x => NO[x] != null ? 'Map ' + NO[x] : mapName(x) + ' (side)').join(', '); };
const out = ['# Drop list: the owner\'s 2026-11-12 map picks under the unique-card limits (SKIR3)', '',
  'Each list is your Yes picks, cut to the map\'s default limits (NEW! = new on this map, Carried = on an earlier map\'s list or the tutorial; side maps NEW! 3 / Carried 8). Claude\'s own adds went first; then, where your picks were still over, a pick that stays on another list before one that leaves play, weakest map fit first. "Moves to Map N" = the card is now first listed there. The Barrel Cactus (CACTI1) counts as one of your Map 18 picks.', '',
  '## Main maps', '', '| Map | NEW! | Carried | Your picks taken off | Claude adds removed |', '|---|---|---|---|---|'];
const pickTxt = d => { const w = where(d.nowOn), here = d.side === 'Carried';
  return `${nameOf(d.id)} (over ${here ? 'Carried' : 'NEW!'}, map fit ${d.fit != null ? d.fit : 0}: ${here ? 'stays on ' + (w || 'the tutorial list') : w ? 'moves to ' + w : (C[d.id] && C[d.id].unattainable ? 'leaves play' : 'off the road, still in play (Map 22-24, a SPECIAL list or a fight reward)')})`; };
Object.entries(R.main).forEach(([k, r]) => {
  const own = r.drops.filter(d => d.who === 'owner'), cl = r.drops.filter(d => d.who === 'claude');
  out.push(`| ${r.mapNo} ${mapName(k)} | ${r.neu} / ${r.limits.own} | ${r.car} / ${r.limits.carried} | ${own.map(pickTxt).join('; ') || '-'} | ${cl.map(d => nameOf(d.id)).join(', ') || '-'} |`);
});
const kept = Object.entries(R.adminAfter).filter(([, l]) => l.length).map(([k, l]) => `Map ${NO[k]} ${l.map(nameOf).join(', ')}`);
out.push('', `Claude adds kept (room under the limit): ${kept.join('; ') || 'none'}. UI47_ADMIN_ADD holds only these now.`, '',
  '## Side maps', '', '| Side map (opens after Map) | NEW! | Carried | Taken off | Claude carried top-up |', '|---|---|---|---|---|');
Object.entries(R.side).forEach(([s, r]) => {
  out.push(`| ${mapName(s)} (${r.unlockAfterNo}) | ${r.neu} / 3 | ${r.car} / 8 | ${r.drops.map(d => nameOf(d.id) + (s === 'mo' ? ' (your pick)' : '')).join(', ') || '-'} | ${Object.keys(r.claudeAdds || {}).map(nameOf).join(', ') || '-'} |`);
});
out.push('', 'Side maps other than The Old Bramble kept the 3 own cards their fights and reference decks used most. A top-up was added only where the fights could not be built from the cut list (fewer than 5 different cards, or K14\'s one-copy rule for carried cards).', '',
  `## Cards that left play (${R.leftPlay.length}: on no list, no other source)`, '', R.leftPlay.map(x => x.name).sort().join(', '), '',
  `Back in play from your picks: ${(R.flags.cleared || []).map(nameOf).join(', ') || 'none'}.`, '',
  '## First-clear cards swapped (their card left the map\'s list; GD-5: the nearest card of the list)', '', RW.swaps.map(s => `${s.fight} ${s.wasName} -> ${s.nowName}`).join('; ') || 'none', '');
fs.writeFileSync(path.join(ROOT, 'docs', 'balance', 'skir3', 'drop-list-2026-11-12.md'), out.join('\n'));
console.log('-> docs/balance/skir3/drop-list-2026-11-12.md');
