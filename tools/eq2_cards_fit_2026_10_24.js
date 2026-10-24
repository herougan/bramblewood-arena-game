#!/usr/bin/env node
// Package EQ2 (2026-10-24): fit the package's new cards (tools/eq2_cards_2026_10_24.py) by the budget at Level 1, as fresh cards: the
// most stats in the card's shape (its Attack : Health as written) that pass both rules at Level 1 and at its start level
// (tools/card_retune_2026_10_19.js check, which reads canonical/card-obtain-maps.json for the Map term). Prints {id: {attack, health, N, use}}.
'use strict';
const fs = require('fs'), path = require('path');
const ROOT = path.join(__dirname, '..');
const RT = require('./card_retune_2026_10_19.js');
const IDS = ['clinging-leech', 'barnacle-bulwark', 'reefback-turtle'];
const cards = JSON.parse(fs.readFileSync(path.join(ROOT, 'canonical', 'cards.json'), 'utf8'));
const out = {};
IDS.forEach(id=>{ const c = cards.find(x=> x.id === id); if(!c) return;
  const A0 = c.attack || 0, H0 = c.health || 1; let best = null;
  for(let f = 0.2; f <= 6; f += 0.01){ const A = A0 > 0 ? Math.max(1, Math.round(A0 * f)) : 0, H = Math.max(1, Math.round(H0 * f)); const k = RT.check(c, A, H);
    if(k.ok) best = {attack: A, health: H, N: k.b1.N, use: Math.round(k.use * 1000) / 10}; else if(best) break; }
  // then Health alone while it still fits (a tank keeps its 1 Attack)
  if(best) for(let H = best.health + 1; H < best.health + 40; H++){ const k = RT.check(c, best.attack, H); if(!k.ok) break; best = {attack: best.attack, health: H, N: k.b1.N, use: Math.round(k.use * 1000) / 10}; }
  out[id] = best; });
process.stdout.write(JSON.stringify(out, null, 1) + '\n');
