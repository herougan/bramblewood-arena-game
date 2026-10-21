#!/usr/bin/env node
// Package BF6 (2026-10-21), the owner's 15:15 skill rulings on the cards that carry them (run once, before the re-derive):
//   "Rally: temporary increase in attack. War Banner: passive increase in attack while this unit is present." The old Rally (a passive
//   Attack aura while it lives) is War Banner's now, so the Parish Sergeant's Rally 1 becomes War Banner 1.
//   "Shield call -> Armor": the Shieldbearer Hound's Shield Call becomes Armor 1 (the round shield on its back); the Magnate Duck loses
//   Shield Call and keeps his Armor 3 (already a wall against the halved world's median Attack 2; his budget has no room for more).
//   node tools/bf6_skill_moves_2026_10_21.js        -> canonical/cards.json (effects and creatorNote only)
'use strict';
const fs = require('fs'), path = require('path');
const FILE = path.join(__dirname, '..', 'canonical', 'cards.json');
const cards = JSON.parse(fs.readFileSync(FILE, 'utf8')), by = {}; cards.forEach(c=> by[c.id] = c);
const MOVES = [
  ['parish-sergeant', e=>{ if(e.rally == null) return null; const n = e.rally; delete e.rally; e.banner = n; return `Rally ${n} -> War Banner ${n} (owner 15:15: War Banner is the passive Attack aura now)`; }],
  ['shieldbearer-hound', e=>{ if(!e.shieldCall) return null; delete e.shieldCall; e.armor = 1; return 'Shield Call -> Armor 1 (owner 15:15: "Shield call -> Armor")'; }],
  ['magnate-duck', e=>{ if(!e.shieldCall) return null; delete e.shieldCall; return 'Shield Call removed, Armor 3 kept (owner 15:15: "Shield call -> Armor")'; }],
];
let n = 0;
MOVES.forEach(([id, f])=>{ const c = by[id]; if(!c) throw new Error('no card ' + id); c.effects = c.effects || {}; const what = f(c.effects); if(!what) return;
  c.creatorNote = ((c.creatorNote || '') + ` 2026-10-21 BF6: ${what}.`).trim(); n++; console.log(id + ':', what); });
fs.writeFileSync(FILE, JSON.stringify(cards, null, 2).replace(/[\u0080-￿]/g, ch=> '\\u' + ch.charCodeAt(0).toString(16).padStart(4, '0')) + '\n');
console.log('moved', n, 'cards');
