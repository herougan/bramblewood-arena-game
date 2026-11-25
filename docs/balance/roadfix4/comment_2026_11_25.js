#!/usr/bin/env node
// 2026-11-25 (package ROADFIX4): ROADFIX3's comment tool (docs/balance/roadfix3/comment_2026_11_24.js), copied: writes the dated house-style
// comment after each applied deck of roadfix4-fixes.jsonl in arena_app.js (the change in card names, the target, before -> after at 400 games
// on seeds 9100 / 5100, and the card change the move followed; --a9 / --a5 take a comma list of tags, the last one holding the fight wins). Old decks from the committed arena_app.js before ROADFIX4 (git --rev, default
// 3b9f9428e); before = post1125 (9100) and roadfix4-pre-s5100 (5100), after = the --a9 / --a5 validation tags (a fight's last line wins).
// --why <json>: {code: "reason"}. Skips a line that already has its ROADFIX4 note.
//   node docs/balance/roadfix4/comment_2026_11_25.js --a9 roadfix4-v9100 --a5 roadfix4-v5100 [--rev 3b9f9428e] [--why why.json]
'use strict';
const fs = require('fs'), path = require('path'), cp = require('child_process'), ROOT = path.resolve(__dirname, '..', '..', '..'), APP = path.join(ROOT, 'arena_app.js');
const a = process.argv.slice(2), arg = (k, d) => { const i = a.indexOf(k); return i >= 0 ? a[i + 1] : d; };
const D = {}; JSON.parse(fs.readFileSync(path.join(ROOT, 'canonical', 'cards.json'), 'utf8')).forEach(c => { D[c.id] = c.name || c.id; });
const rd = f => fs.existsSync(path.join(ROOT, f)) ? fs.readFileSync(path.join(ROOT, f), 'utf8').split('\n').filter(Boolean).map(JSON.parse) : [];
const rows = {}, row = (tags, k) => tags.split(',').map(tag => (rows[tag] = rows[tag] || rd(`docs/balance/skirmish-pass-${tag}.jsonl`)).filter(x => x.key === k).pop()).filter(Boolean).pop(); // a comma list: the last tag holding the fight wins
const WHY = arg('--why') ? JSON.parse(fs.readFileSync(path.resolve(ROOT, arg('--why')), 'utf8')) : {};
const oldSrc = cp.execSync(`git show ${arg('--rev', '3b9f9428e')}:arena_app.js`, { cwd: ROOT, maxBuffer: 1 << 30 }).toString();
const re = k => new RegExp(`(\\{ ?key:\\s*['"]${k.replace(/-/g, '\\-')}['"],[^\\n]*?deck:(\\{[^}]*\\}))([^\\n]*)`);
let s = fs.readFileSync(APP, 'utf8'), n = 0;
for (const x of rd('docs/balance/roadfix4-fixes.jsonl')) {
  if (!x.deck) continue;
  const om = oldSrc.match(re(x.key)), o = om && JSON.parse(om[2]);
  const b9 = row('post1125', x.key), a9 = row(arg('--a9', 'roadfix4-v9100'), x.key), b5 = row('roadfix4-pre-s5100', x.key), a5 = row(arg('--a5', 'roadfix4-v5100'), x.key);
  if (!o || !b9 || !a9 || !b5 || !a5) { console.log('skip (no old deck / no validation)', x.key); continue; }
  const outs = [], ins = []; new Set(Object.keys(o).concat(Object.keys(x.deck))).forEach(id => { const d = (x.deck[id] || 0) - (o[id] || 0); if (d < 0) outs.push(`${-d} ${D[id]}`); if (d > 0) ins.push(`${d} ${D[id]}`); });
  const why = WHY[x.key] ? ` after ${WHY[x.key]}` : ' after DAUNT2 / CARDVET1';
  const note = `/* 2026-11-25 (ROADFIX4): a list swap${why} (leaders, first-clear cards, size kept; no Shield, Health or level change), ${outs.join(', ')} -> ${ins.join(', ')}, target ${b9.target}: ${b9.win} -> ${a9.win} on seeds 9100, ${b5.win} -> ${a5.win} on seeds 5100 (400 games); docs/balance/roadfix4-2026-11-25.md */`;
  const m = s.match(re(x.key));
  if (!m) { console.log('not found', x.key); continue; }
  if (m[3].includes('(ROADFIX4)')) continue;
  s = s.replace(m[0], m[1] + ' ' + note + m[3]); n++;
}
fs.writeFileSync(APP, s); console.log('commented', n, 'decks');
