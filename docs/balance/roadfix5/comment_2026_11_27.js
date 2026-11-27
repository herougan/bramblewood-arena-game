#!/usr/bin/env node
// 2026-11-27 (package ROADFIX5): ROADFIX4's comment tool (docs/balance/roadfix4/comment_2026_11_25.js), copied: writes the dated house-style
// comment after each applied deck of roadfix5-fixes.jsonl in arena_app.js (the change in card names, the target, before -> after at 400 games
// on seeds 9100 / 5100, and why the fight moved). Old decks from the committed arena_app.js before ROADFIX5 (git --rev, default fd19da9b9);
// before = post1127s (9100) and roadfix5-pre-s5100 (5100), after = the --a9 / --a5 validation tags (a comma list: the last tag holding the
// fight wins). --why <json>: {code: "reason"}. Skips a line that already has its ROADFIX5 note.
//   node docs/balance/roadfix5/comment_2026_11_27.js --a9 roadfix5-v9100 --a5 roadfix5-v5100 [--why docs/balance/roadfix5/why.json]
'use strict';
const fs = require('fs'), path = require('path'), cp = require('child_process'), ROOT = path.resolve(__dirname, '..', '..', '..'), APP = path.join(ROOT, 'arena_app.js');
const a = process.argv.slice(2), arg = (k, d) => { const i = a.indexOf(k); return i >= 0 ? a[i + 1] : d; };
const D = {}; JSON.parse(fs.readFileSync(path.join(ROOT, 'canonical', 'cards.json'), 'utf8')).forEach(c => { D[c.id] = c.name || c.id; });
const rd = f => fs.existsSync(path.join(ROOT, f)) ? fs.readFileSync(path.join(ROOT, f), 'utf8').split('\n').filter(Boolean).map(JSON.parse) : [];
const rows = {}, row = (tags, k) => tags.split(',').map(tag => (rows[tag] = rows[tag] || rd(`docs/balance/skirmish-pass-${tag}.jsonl`)).filter(x => x.key === k).pop()).filter(Boolean).pop();
const WHY = arg('--why') ? JSON.parse(fs.readFileSync(path.resolve(ROOT, arg('--why')), 'utf8')) : {};
const oldSrc = cp.execSync(`git show ${arg('--rev', 'fd19da9b9')}:arena_app.js`, { cwd: ROOT, maxBuffer: 1 << 30 }).toString();
const re = k => new RegExp(`(\\{ ?key:\\s*['"]${k.replace(/-/g, '\\-')}['"],[^\\n]*?deck:(\\{[^}]*\\}))([^\\n]*)`);
let s = fs.readFileSync(APP, 'utf8'), n = 0;
for (const x of rd('docs/balance/roadfix5-fixes.jsonl')) {
  if (!x.deck) continue;
  const om = oldSrc.match(re(x.key)), o = om && JSON.parse(om[2]);
  const b9 = row('post1127s', x.key), a9 = row(arg('--a9', 'roadfix5-v9100'), x.key), b5 = row('roadfix5-pre-s5100', x.key), a5 = row(arg('--a5', 'roadfix5-v5100'), x.key);
  if (!o || !b9 || !a9 || !b5 || !a5) { console.log('skip (no old deck / no validation)', x.key); continue; }
  const outs = [], ins = []; new Set(Object.keys(o).concat(Object.keys(x.deck))).forEach(id => { const d = (x.deck[id] || 0) - (o[id] || 0); if (d < 0) outs.push(`${-d} ${D[id]}`); if (d > 0) ins.push(`${d} ${D[id]}`); });
  const why = WHY[x.key] ? ` after ${WHY[x.key]}` : ' after SKILLS3-B';
  const note = `/* 2026-11-27 (ROADFIX5): a list swap${why} (leaders, first-clear cards, size kept; no Shield, Health or level change), ${outs.join(', ')} -> ${ins.join(', ')}, target ${b9.target}: ${b9.win} -> ${a9.win} on seeds 9100, ${b5.win} -> ${a5.win} on seeds 5100 (400 games); docs/balance/roadfix5-2026-11-27.md */`;
  const m = s.match(re(x.key));
  if (!m) { console.log('not found', x.key); continue; }
  if (m[3].includes('(ROADFIX5)')) continue;
  s = s.replace(m[0], m[1] + ' ' + note + m[3]); n++;
}
fs.writeFileSync(APP, s); console.log('commented', n, 'decks');
