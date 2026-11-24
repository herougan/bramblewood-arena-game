#!/usr/bin/env node
// 2026-11-24 (package ROADFIX2): each fixed fight before / after on seeds 9100 and 5100 (400 games) and the verdict: keep when in band on both,
// or clearly closer on both (2+ points nearer the target on each seed set, never further out); else revert.
//   node docs/balance/roadfix2/compare_2026_11_24.js <before9100> <before5100> <after9100> <after5100> [--json out.json]
'use strict';
const fs = require('fs'), path = require('path'), ROOT = path.resolve(__dirname, '..', '..', '..');
const rd = t => { const o = {}; fs.readFileSync(path.join(ROOT, 'docs', 'balance', `skirmish-pass-${t}.jsonl`), 'utf8').split('\n').filter(Boolean).map(JSON.parse).forEach(r => { o[r.key] = r; }); return o; };
const a = process.argv.slice(2), [b9, b5, a9, a5] = a.slice(0, 4).map(rd), out = [];
for (const k of Object.keys(a9)) {
  const r = a9[k], t = r.target, inb = w => w >= r.lo && w <= r.hi, off = w => Math.abs(w - t);
  const w = { b9: (b9[k] || {}).win, b5: (b5[k] || {}).win, a9: r.win, a5: (a5[k] || {}).win };
  const inBoth = inb(w.a9) && inb(w.a5), closer = off(w.a9) <= off(w.b9) - 2 && off(w.a5) <= off(w.b5) - 2;
  const keep = inBoth || closer;
  out.push({ key: k, target: t, lo: r.lo, hi: r.hi, ...w, keep, why: inBoth ? 'in band on both' : closer ? 'closer on both' : 'not in band / not closer on both' });
  console.log(k.padEnd(7), 't', String(t).padEnd(5), '9100', String(w.b9).padEnd(5), '->', String(w.a9).padEnd(5), ' 5100', String(w.b5).padEnd(5), '->', String(w.a5).padEnd(5), keep ? 'KEEP' : 'REVERT', '(' + out[out.length - 1].why + ')');
}
const i = a.indexOf('--json'); if (i >= 0) fs.writeFileSync(path.join(ROOT, a[i + 1]), JSON.stringify(out, null, 1) + '\n');
