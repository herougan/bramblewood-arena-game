#!/usr/bin/env node
// 2026-11-15 (package BAL-LEGAL1): the fixes file (skirmish_pass apply format) from the searches' accepted lines: the last line per fight,
// only when it changes the live deck or a lever; --set CODE:field=value overrides a lever (2-1's hqHp picked on tune seeds); --drop CODE leaves a fight out.
// Every deck is re-checked with problemsFull() against all the others in the file before it is written.
//   node tools/legal1/fixes_2026_11_15.js --in accepted.jsonl --out legal1-fixes.jsonl [--set 2-1:hqHp=12] [--drop 19-1]
'use strict';
const fs = require('fs');
const X = require('./lib_legal_2026_11_15.js'), L = X.L;
const a = process.argv.slice(2), all = k => a.map((x, i) => x === k ? a[i + 1] : null).filter(Boolean), arg = (k, d) => all(k)[0] || d;
const last = {}; fs.readFileSync(arg('--in'), 'utf8').trim().split('\n').filter(Boolean).map(JSON.parse).forEach(x => { last[x.key] = x; });
all('--set').forEach(s => { const [c, kv] = s.split(':'), [k, v] = kv.split('='); last[c][k] = v === 'null' ? null : +v; });
all('--drop').forEach(c => { delete last[c]; });
const rows = [], decks = {};
for (const [k, x] of Object.entries(last)) { const live = X.byCode[k].n.deck, ch = x.deck && L.keyOf(x.deck) !== L.keyOf(live);
  if (!ch && x.shieldOverride == null && x.hqHp == null) continue;
  rows.push({ key: k, deck: ch ? x.deck : null, shieldOverride: x.shieldOverride, hqHp: x.hqHp, moves: x.moves, tune: x.tune }); if (ch) decks[k] = x.deck; }
let bad = 0; rows.forEach(r => { if (!r.deck) return; const o = Object.assign({}, decks); delete o[r.key]; const p = X.problemsFull(r.key, r.deck, o); if (p.length) { bad++; console.log('ILLEGAL', r.key, JSON.stringify(p)); } });
fs.writeFileSync(arg('--out'), rows.map(r => JSON.stringify(r)).join('\n') + '\n');
console.log(rows.length, 'fixes written to', arg('--out'), bad ? bad + ' ILLEGAL' : '(all pass problemsFull jointly)');
