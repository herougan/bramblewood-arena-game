#!/usr/bin/env node
// 2026-11-03 (package THEME5): READ-ONLY check of docs/balance/theme5/carried-picks-2026-11-03.json against
// docs/balance/theme5/carried-data-2026-11-03.json (run tools/theme5/carried_data_2026_11_03.js first). Per pick: the candidate is a legal
// carried candidate for its map (on an earlier list, within the cap, not Baby, obtainable, in play, not owner-cut there), the plan's cards are
// on the map's list or are the candidate, 20 cards, at most 6 different, each within its rarity copy cap (arena_app.js maxCopiesForRarity),
// and how many different cards the plan shares with each of the map's PRO / BPRO decks (the most shared is reported). Writes nothing.
const fs = require('fs'), path = require('path');
const ROOT = path.join(__dirname, '..', '..');
const opt = require(path.join(ROOT, 'tools', 'opt', 'deckopt.js'));
const gm = opt.loadGame(ROOT), G = gm.G, D = gm.D;
const data = JSON.parse(fs.readFileSync(path.join(ROOT, 'docs/balance/theme5/carried-data-2026-11-03.json'), 'utf8'));
const picks = JSON.parse(fs.readFileSync(path.join(ROOT, 'docs/balance/theme5/carried-picks-2026-11-03.json'), 'utf8')).picks;
const by = {}; data.lists.forEach(l => { by[l.id] = l; });
let bad = 0; const rows = [];
for (const p of picks) {
  const l = by[p.map], probs = [];
  if (!l) { console.log('no list', p.map); bad++; continue; }
  const c = l.candidates.find(x => x.id === p.card);
  if (!c) probs.push('not a legal candidate here'); else if (c.ownerCutHere) probs.push('owner cut it from this list');
  const ids = Object.keys(p.deck), total = ids.reduce((a, k) => a + p.deck[k], 0);
  if (total !== 20 && !(p.sizeNote && total === 19)) probs.push('size ' + total);
  if (ids.length > 6) probs.push(ids.length + ' different');
  ids.forEach(k => { if (!D[k]) { probs.push('unknown ' + k); return; } if (k !== p.card && !l.list.some(x => x.id === k)) probs.push(k + ' not on the list');
    const cap = G.maxCopiesForRarity(D[k].rarity); if (p.deck[k] > cap) probs.push(k + ' x' + p.deck[k] + ' over cap ' + cap); });
  const share = l.decks.map(d => ({ id: d.id, n: ids.filter(k => d.deck[k]).length })).sort((a, b) => b.n - a.n)[0] || { id: '-', n: 0 };
  if (probs.length) bad++;
  rows.push(`${l.label.padEnd(5)} ${p.map.padEnd(4)} ${p.card.padEnd(24)} ${p.archetype.padEnd(22)} fit ${c ? c.fit : '?'} from ${c ? c.fromLabel : '?'}  most shared ${share.n}/6 (${share.id})${probs.length ? '  PROBLEMS: ' + probs.join('; ') : ''}`);
}
rows.forEach(r => console.log(r));
console.log(picks.length + ' picks, ' + bad + ' with problems');
process.exitCode = bad ? 1 : 0;
