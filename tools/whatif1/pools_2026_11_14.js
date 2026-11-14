#!/usr/bin/env node
// 2026-11-14 (package WHATIF1): each side fight's room under K14 (SKIR1's fight rules, LIST1's held cards out as SIDE2 ran them): its size,
// the map-unique (own) and Carried cards of its pool, and the largest legal deck of at most dMax different cards (5-6 on a skirmish): the own cards' copy caps + Carried copies (K14: 1 each,
// 6 in all; option a: 2 each, 6 in all). Read only.   node tools/whatif1/pools_2026_11_14.js [--json]
'use strict';
const path = require('path');
require('../side2/holds_2026_11_13.js').patch();
const L = require('../skir1/lib_fight_2026_11_11.js');
const rows = [];
for (const m of L.maps().filter(x => x.sub)) for (const n of L.fightsOf(m)) {
  const f = L.fight(m, n), own = f.pool.filter(id => !f.U || f.U.has(id) || f.L0.includes(id)), car = f.pool.filter(id => !own.includes(id));
  const ownCap = own.reduce((t, id) => t + f.cap(id), 0);
  // the largest deck of at most dMax different cards: the own cards' caps and Carried cards at c copies each, 6 Carried copies in all
  const smax = c => { let best = 0; const caps = own.map(id => f.cap(id)).sort((x, y) => y - x);
    for (let k = 0; k <= Math.min(car.length, f.dMax); k++) { const o = caps.slice(0, f.dMax - k).reduce((t, x) => t + x, 0), cc = Math.min(6, k * Math.min(c, ...car.map(id => f.cap(id)), c)); best = Math.max(best, o + cc); } return best; };
  rows.push({ code: n.key, map: m.id, name: m.name, kind: f.kind, S: f.S, own: own.length, carried: car.length, ownCap,
    smaxK14: smax(1), smaxA: smax(2), dMin: f.dMin, dMax: f.dMax,
    legal: f.legal(n.deck) ? true : f.problems(n.deck) });
}
if (process.argv.includes('--json')) console.log(JSON.stringify(rows));
else rows.forEach(r => console.log(r.code, r.name, 'S', r.S, 'own', r.own, '(cap ' + r.ownCap + ')', 'carried', r.carried, 'Smax K14', r.smaxK14, 'a', r.smaxA, r.legal === true ? '' : 'ILLEGAL ' + r.legal.join('|')));
