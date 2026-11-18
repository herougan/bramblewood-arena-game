#!/usr/bin/env node
// Package DATAFIX (2026-11-18), step 2: after tools/bal9/cards_2026_11_02.js rewards + rarity --apply (the 43 reward slots re-filled on the new lists),
//   - every card the passes changed gets a dated DATAFIX creatorNote line (tests/lib/redesign.js reads the dates).
//   node tools/datafix2_2026_11_18.js <cards-before.json> [apply]
'use strict';
const fs = require('fs'), L = require('./datafix_lib_2026_11_18.js');
const before = Object.fromEntries(JSON.parse(fs.readFileSync(process.argv[2], 'utf8')).map(c => [c.id, c]));
const cards = L.load(), by = Object.fromEntries(cards.map(c => [c.id, c]));
// a challenge fight's card keeps the challenge flag when its slot moves (19-6: the Yeti -> its new card; tests/content10 pins the flag)
cards.forEach(c => { const b = before[c.id]; if (!(b && b.source && b.source.challenge && c.source && !c.source.challenge)) return;
  const nw = cards.find(x => x.source && x.source.kind === 'map' && x.source.id === b.source.id && x.source.node === b.source.node && !before[x.id].source.challenge && JSON.stringify(x.source) !== JSON.stringify(before[x.id].source));
  if (nw) nw.source.challenge = true; });
// a card whose rarity the pass lowered and that the lower rarity pushed over the budget (Caldera Snow Leopard, Superrare -> Very Rare): Health down to the line
cards.forEach(c => { const b = before[c.id]; if (!(b && b.rarity !== c.rarity && !L.use(c).ok && L.use(c).use > L.use(b).use)) return; const h0 = c.health;
  while (!L.use(c).ok && c.health > 1) c.health--; console.log('re-fit', c.id, c.attack + '/' + h0, '->', c.attack + '/' + c.health, JSON.stringify(L.use(c))); c.creatorNote = (c.creatorNote ? c.creatorNote + ' ' : '') + `2026-11-18 (DATAFIX): re-fit ${c.attack}/${h0} -> ${c.attack}/${c.health} (the lower rarity put it over the budget).`; });
const TAG = '2026-11-18 (DATAFIX)', show = s => s ? (s.kind === 'map' ? `map ${s.id} ${s.node}` : `pack ${s.map ? s.map + ' ' : ''}tier ${s.tier}`) : 'none';
const FIELDS = ['source', 'rarity', 'attack', 'health', 'cost', 'effects'];
let n = 0;
cards.forEach(c => { const b = before[c.id]; if (!b) return; const ch = [];
  FIELDS.forEach(f => { if (JSON.stringify(b[f]) !== JSON.stringify(c[f])) ch.push(f === 'source' ? `source ${show(b.source)} -> ${show(c.source)}` : f === 'effects' ? 'skills changed' : `${f} ${b[f]} -> ${c[f]}`); });
  if (!ch.length || (c.creatorNote || '').includes(TAG)) return;
  c.creatorNote = (c.creatorNote ? c.creatorNote + ' ' : '') + `${TAG}: ${ch.join('; ')} (reward slots moved to cards new on their map, rarities at the list's cap; rewards-pass, bal9 JJ12).`; n++; });
cards.forEach(c => { if (before[c.id] && !L.use(c).ok && L.use(before[c.id]).ok) console.log('LEFT THE BUDGET', c.id); });
console.log(n, 'notes added');
if (process.argv.includes('apply')) { L.save(cards); console.log('applied'); }
