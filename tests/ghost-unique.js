#!/usr/bin/env node
// Ghost decks stay legal when many cards are one-copy (2026-10-09). Making the Wandering Traveller
// Unique once left late-stage ghost decks short of 20 cards; this marks every third card Unique and
// checks every stage still produces valid decks.
'use strict';
const fs = require('fs'), path = require('path');
const R = path.join(__dirname, '..');
const G = require(path.join(R, 'bramblewood-ghosts.js'));
const cards = JSON.parse(fs.readFileSync(path.join(R, 'canonical/cards.json'), 'utf8'));
const defs = {}; cards.forEach(c=>{ const d = Object.assign({}, c); delete d.art; defs[c.id] = d; });
let k = 0; Object.values(defs).forEach(d=>{ if(!d.token && (k++ % 3 === 0)) d.rarity = 'unique'; });
let bad = 0;
for(let st = 0; st < 10; st++) for(let i = 0; i < 40; i++){
  const e = G.validateDeck(defs, G.generateGhostDeck(defs, st, 1000 + st*97 + i));
  if(e.length){ bad++; if(bad <= 3) console.log('  stage', st, e.join('; ')); }
}
console.log(`ghost-unique: ${bad} failure(s)`);
process.exit(bad ? 1 : 0);
