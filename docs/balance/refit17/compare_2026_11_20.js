#!/usr/bin/env node
// 2026-11-20 (package REFIT17): before / after road counts (Maps 0-20): main rows, side rows (all 96, the 85 tunable road rows without the
// dungeon floors and tutorial, and the 81 curve fights), in band / within 10 / beyond 20, and the moved fights. Read only.
//   node docs/balance/refit17/compare_2026_11_20.js before.jsonl after.jsonl [CODE...]
'use strict';
const fs = require('fs');
const rd = f => fs.readFileSync(f, 'utf8').trim().split('\n').map(JSON.parse).filter(x => x.target != null);
const [bf, af, ...codes] = process.argv.slice(2), B = rd(bf), A = rd(af);
const cnt = (L, name) => { const g = x => Math.abs(x.win - x.target);
  return `${name} ${L.length}: ${L.filter(x => x.win >= x.lo && x.win <= x.hi).length} in band / ${L.filter(x => g(x) <= 10).length} within 10 / ${L.filter(x => g(x) > 20).length} beyond 20`; };
const sets = L => [['main', L.filter(x => !x.side)], ['side road', L.filter(x => x.side && !/-(MM|UC)-/.test(x.code) && !/^T-/.test(x.code))], ['side curve', L.filter(x => x.side && x.curve)]];
for (const [lab, L] of [['before', B], ['after ', A]]) console.log(lab, sets(L).map(([n, s]) => cnt(s, n)).join('; '));
for (const c of codes) { const b = B.find(x => x.code === c), a = A.find(x => x.code === c);
  console.log(' ', c.padEnd(8), String(b && b.win).padStart(5), '->', String(a && a.win).padStart(5), ` target ${a ? a.target : b.target} (${(a || b).lo}-${(a || b).hi})`); }
const worst = L => L.map(x => ({ c: x.code, w: x.win, t: x.target, g: Math.abs(x.win - x.target) })).sort((p, q) => q.g - p.g).slice(0, 10).map(x => `${x.c} ${x.w}/${x.t}`).join(', ');
console.log('worst main:', worst(A.filter(x => !x.side)));
console.log('worst side road:', worst(A.filter(x => x.side && !/-(MM|UC)-/.test(x.code) && !/^T-/.test(x.code))));
