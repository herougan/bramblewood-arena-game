#!/usr/bin/env node
// 2026-11-25 (package ROADFIX4): the report's tables. Kept: each fix of roadfix4-fixes.jsonl (the change in card names against the decks at
// --rev, default 3b9f9428e; target and band; before -> after on seeds 9100 and 5100 at 400 games; source). Rejected: the rejected-round*.jsonl
// lines with their reads. Validation tags in order, the last one holding a fight wins.
//   node docs/balance/roadfix4/table_2026_11_25.js [--rev 3b9f9428e]
'use strict';
const fs = require('fs'), path = require('path'), cp = require('child_process'), ROOT = path.resolve(__dirname, '..', '..', '..');
const a = process.argv.slice(2), arg = (k, d) => { const i = a.indexOf(k); return i >= 0 ? a[i + 1] : d; };
const D = {}; JSON.parse(fs.readFileSync(path.join(ROOT, 'canonical', 'cards.json'), 'utf8')).forEach(c => { D[c.id] = c.name || c.id; });
const rd = f => fs.existsSync(path.join(ROOT, f)) ? fs.readFileSync(path.join(ROOT, f), 'utf8').split('\n').filter(Boolean).map(JSON.parse) : [];
const last = (tags, k) => tags.map(t => rd(`docs/balance/skirmish-pass-${t}.jsonl`).filter(x => x.key === k).pop()).filter(Boolean).pop();
const A9 = ['roadfix4-v9100', 'roadfix4-v9100b', 'roadfix4-v9100c', 'roadfix4-v9100d', 'roadfix4-v9100e'], A5 = A9.map(t => t.replace('9100', '5100'));
const old = cp.execSync(`git show ${arg('--rev', '3b9f9428e')}:arena_app.js`, { cwd: ROOT, maxBuffer: 1 << 30 }).toString();
const re = k => new RegExp(`\\{ ?key:\\s*['"]${k.replace(/-/g, '\\-')}['"],[^\\n]*?deck:(\\{[^}]*\\})`);
const change = (k, d) => { const o = JSON.parse(old.match(re(k))[1]), outs = [], ins = [];
  new Set(Object.keys(o).concat(Object.keys(d))).forEach(id => { const x = (d[id] || 0) - (o[id] || 0); if (x < 0) outs.push(`${-x} ${D[id]}`); if (x > 0) ins.push(`${x} ${D[id]}`); });
  return `${outs.join(', ')} -> ${ins.join(', ')}`; };
const line = (x, b9, b5, a9, a5) => `| ${x.key} | ${change(x.key, x.deck)} | ${b9.target} (${b9.lo}-${b9.hi}) | ${b9.win} -> ${a9 ? a9.win : '?'} | ${b5 ? b5.win : '?'} -> ${a5 ? a5.win : '?'} | ${/search/.test(x.src) ? 'search' : 'curve'} |`;
console.log('| Fight | Change | Target (band) | Seeds 9100 | Seeds 5100 | From |\n|---|---|---|---|---|---|');
for (const x of rd('docs/balance/roadfix4-fixes.jsonl')) console.log(line(x, last(['post1125'], x.key), last(['roadfix4-pre-s5100'], x.key), last(A9, x.key), last(A5, x.key)));
console.log('\nRejected:\n\n| Fight | Change | Target (band) | Seeds 9100 | Seeds 5100 | From |\n|---|---|---|---|---|---|');
const r1 = rd('docs/balance/roadfix4/rejected-round1.jsonl'), r3 = rd('docs/balance/roadfix4/rejected-round3.jsonl');
// a round-1 reject read on v9100 / v9100b, a round-3 reject on v9100c / v9100d; the before of a fight already fixed in round 1 is its round-1 read
const base9 = k => last(['roadfix4-base9100'], k), base5 = k => last(['roadfix4-base5100'], k);
r1.forEach(x => console.log(line(x, last(['post1125'], x.key), last(['roadfix4-pre-s5100'], x.key), last(A9.slice(0, 2), x.key), last(A5.slice(0, 2), x.key))));
r3.forEach(x => console.log(line(x, base9(x.key), base5(x.key), last(A9.slice(2, 4), x.key), last(A5.slice(2, 4), x.key)) + (x.why ? ' ' + x.why : '')));
