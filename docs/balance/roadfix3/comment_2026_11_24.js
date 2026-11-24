#!/usr/bin/env node
// 2026-11-24 (package ROADFIX3): ROADFIX2's comment tool, copied: writes the dated house-style comment after each applied deck of
// roadfix3-fixes.jsonl in arena_app.js (the change in card names, the target, before -> after at 400 games on seeds 9100 / 5100).
// Old decks from the committed arena_app.js before ROADFIX3 (git <rev>, default 7a055cfff); before = post1124c (9100) and refit20-v5100
// (5100), after = the given validation tags. Skips a line that already has its ROADFIX3 note.
//   node docs/balance/roadfix3/comment_2026_11_24.js [--rev 7a055cfff] [--a9 roadfix3-v9100] [--a5 roadfix3-v5100]
'use strict';
const fs = require('fs'), path = require('path'), cp = require('child_process'), ROOT = path.resolve(__dirname, '..', '..', '..'), APP = path.join(ROOT, 'arena_app.js');
const a = process.argv.slice(2), arg = (k, d) => { const i = a.indexOf(k); return i >= 0 ? a[i + 1] : d; };
const D = {}; JSON.parse(fs.readFileSync(path.join(ROOT, 'canonical', 'cards.json'), 'utf8')).forEach(c => { D[c.id] = c.name || c.id; });
const rd = f => fs.readFileSync(path.join(ROOT, f), 'utf8').split('\n').filter(Boolean).map(JSON.parse);
const row = (tag, k) => rd(`docs/balance/skirmish-pass-${tag}.jsonl`).filter(x => x.key === k).pop();
const oldSrc = cp.execSync(`git show ${arg('--rev', '7a055cfff')}:arena_app.js`, { cwd: ROOT, maxBuffer: 1 << 30 }).toString();
const re = k => new RegExp(`(\\{ ?key:\\s*['"]${k.replace(/-/g, '\\-')}['"],[^\\n]*?deck:(\\{[^}]*\\}))([^\\n]*)`);
let s = fs.readFileSync(APP, 'utf8'), n = 0;
for (const x of rd('docs/balance/roadfix3-fixes.jsonl')) {
  const om = oldSrc.match(re(x.key)), o = om && JSON.parse(om[2]);
  // round 2 (the joint 8-3 / 8-4 Stalactite Golem move) was validated under the tags ...b
  const r2 = ['8-3', '8-4'].includes(x.key) ? 'b' : '';
  const b9 = row('post1124c', x.key), a9 = row(arg('--a9', 'roadfix3-v9100') + r2, x.key), b5 = row('refit20-v5100', x.key), a5 = row(arg('--a5', 'roadfix3-v5100') + r2, x.key);
  if (!o || !b9 || !a9 || !b5 || !a5) { console.log('skip (no old deck / no validation)', x.key); continue; }
  const outs = [], ins = []; new Set(Object.keys(o).concat(Object.keys(x.deck))).forEach(id => { const d = (x.deck[id] || 0) - (o[id] || 0); if (d < 0) outs.push(`${-d} ${D[id]}`); if (d > 0) ins.push(`${d} ${D[id]}`); });
  const why = !r2 ? '' : x.key === '8-3' ? ' (8-4 gives up its Stalactite Pill Bugs, so Map 8 still holds the card in 6 fights)' : ' (it gives up its Stalactite Pill Bugs so 8-3 can take them; Map 8 still holds the card in 6 fights)';
  const note = `/* 2026-11-24 (ROADFIX3): a list swap after REFIT13-1 a's Map 8 reference deck (leaders, first-clear cards, size kept; no Shield, Health or level change), ${outs.join(', ')} -> ${ins.join(', ')}, target ${b9.target}: ${b9.win} -> ${a9.win} on seeds 9100, ${b5.win} -> ${a5.win} on seeds 5100 (400 games)${why}; docs/balance/roadfix3-2026-11-24.md */`;
  const m = s.match(re(x.key));
  if (!m) { console.log('not found', x.key); continue; }
  if (m[3].includes('(ROADFIX3)')) continue;
  s = s.replace(m[0], m[1] + ' ' + note + m[3]); n++;
}
fs.writeFileSync(APP, s); console.log('commented', n, 'decks');
