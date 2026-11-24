#!/usr/bin/env node
// 2026-11-24 (package ROADFIX2): writes the dated house-style comment after each applied deck of roadfix2-fixes.jsonl in arena_app.js
// (the change in card names, the target, before -> after at 400 games on seeds 9100 / 5100). Skips a line that already has its ROADFIX2 note.
//   node docs/balance/roadfix2/comment_2026_11_24.js
'use strict';
const fs = require('fs'), path = require('path'), ROOT = path.resolve(__dirname, '..', '..', '..'), APP = path.join(ROOT, 'arena_app.js');
const D = {}; JSON.parse(fs.readFileSync(path.join(ROOT, 'canonical', 'cards.json'), 'utf8')).forEach(c => { D[c.id] = c.name || c.id; });
const rd = f => fs.readFileSync(path.join(ROOT, f), 'utf8').split('\n').filter(Boolean).map(JSON.parse);
const old = {}; rd('docs/balance/roadfix2/revert-all.jsonl').concat(fs.existsSync(path.join(__dirname, 'revert-all-2.jsonl')) ? rd('docs/balance/roadfix2/revert-all-2.jsonl') : []).forEach(x => { old[x.key] = old[x.key] || x.deck; });
let s = fs.readFileSync(APP, 'utf8'), n = 0;
for (const x of rd('docs/balance/roadfix2-fixes.jsonl')) {
  const o = old[x.key], v = x.validate; if (!o || !v) { console.log('skip (no old deck / no validation)', x.key); continue; }
  const outs = [], ins = []; new Set(Object.keys(o).concat(Object.keys(x.deck))).forEach(id => { const d = (x.deck[id] || 0) - (o[id] || 0); if (d < 0) outs.push(`${-d} ${D[id]}`); if (d > 0) ins.push(`${d} ${D[id]}`); });
  const note = `/* 2026-11-24 (ROADFIX2): a list swap after ENG16 / CARDS1 (leaders, first-clear cards, size kept; no Shield, Health or level change), ${outs.join(', ')} -> ${ins.join(', ')}, target ${v.target}: ${v.b9} -> ${v.a9} on seeds 9100, ${v.b5} -> ${v.a5} on seeds 5100 (400 games) */`;
  const re = new RegExp(`(\\{ ?key:\\s*['"]${x.key.replace(/-/g, '\\-')}['"],[^\\n]*?deck:\\{[^}]*\\})([^\\n]*)`), m = s.match(re);
  if (!m) { console.log('not found', x.key); continue; }
  if (m[2].includes('(ROADFIX2)')) continue;
  s = s.replace(m[0], m[1] + ' ' + note + m[2]); n++;
}
fs.writeFileSync(APP, s); console.log('commented', n, 'decks');
