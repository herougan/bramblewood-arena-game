#!/usr/bin/env node
// 2026-11-20 (package REFIT17): writes refit17/fixes.jsonl into arena_app.js's fight lines: {key, deck?, shield? (a shieldOverride number, or
// "rule" = no override), note}. The new deck replaces the line's first deck:{...}; the dated comment goes right after it, the old deck in it.
//   node docs/balance/refit17/apply_2026_11_20.js
'use strict';
const fs = require('fs'), path = require('path'), ROOT = path.resolve(__dirname, '..', '..', '..'), F = path.join(ROOT, 'arena_app.js');
const src = fs.readFileSync(F, 'utf8').split('\n');
for (const x of fs.readFileSync(path.join(__dirname, 'fixes.jsonl'), 'utf8').trim().split('\n').filter(Boolean).map(JSON.parse)) {
  const i = src.findIndex(l => l.includes(`{ key:"${x.key}",`)); if (i < 0) throw new Error('no line ' + x.key);
  let l = src[i]; const dm = l.match(/deck:(\{[^}]*\})/), old = dm[1];
  let c = ` /* 2026-11-20 (REFIT17): ${x.note}`;
  if (x.deck) c += `; deck (was ${old})`;
  c += '; docs/balance/refit17/ */';
  l = l.replace(dm[0], `deck:${x.deck ? JSON.stringify(x.deck) : old}${c}`);
  if (x.shield !== undefined) {
    const has = /shieldOverride:[0-9]+, /.test(l);
    if (x.shield === 'rule') l = l.replace(/shieldOverride:[0-9]+, /, '');
    else if (has) l = l.replace(/shieldOverride:[0-9]+, /, `shieldOverride:${x.shield}, `);
    else l = l.replace(/deck:\{/, `shieldOverride:${x.shield}, deck:{`);
  }
  src[i] = l; console.log(x.key, 'written');
}
fs.writeFileSync(F, src.join('\n'));
