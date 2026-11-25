#!/usr/bin/env node
// 2026-11-25 (package ROADFIX4): the deck-rule problems the working tree's road decks have that the decks at --rev (default 3b9f9428e, before
// ROADFIX4) did not, over every fight of the maps a changed deck sits on (tools/legal1 problemsFull, map lines included; a lesser form of an old
// problem, e.g. K14 "<id> x3" from x4, is not new). Prints each new problem; exit 1 if any.
//   node docs/balance/roadfix4/newprob_2026_11_25.js [--rev 3b9f9428e]
'use strict';
const path = require('path'), cp = require('child_process'), ROOT = path.resolve(__dirname, '..', '..', '..');
const X = require(path.join(ROOT, 'tools', 'legal1', 'lib_legal_2026_11_15.js'));
const a = process.argv.slice(2), arg = (k, d) => { const i = a.indexOf(k); return i >= 0 ? a[i + 1] : d; };
const old = cp.execSync(`git show ${arg('--rev', '3b9f9428e')}:arena_app.js`, { cwd: ROOT, maxBuffer: 1 << 30 }).toString();
const re = k => new RegExp(`\\{ ?key:\\s*['"]${k.replace(/-/g, '\\-')}['"],[^\\n]*?deck:(\\{[^}]*\\})`);
const was = {}; for (const code of Object.keys(X.byCode)) { const m = old.match(re(code)); if (m && JSON.stringify(JSON.parse(m[1])) !== JSON.stringify(X.byCode[code].n.deck)) was[code] = JSON.parse(m[1]); }
const worseOf = p => { let m; if ((m = p.match(/^(.*) x(\d+)$/)) && !p.startsWith('kept card')) return [m[1] + ' x#', +m[2]];
  if ((m = p.match(/^(\d+) non-unique copies$/))) return ['# non-unique copies', +m[1]]; if ((m = p.match(/^(.* usage \S+) (\d+)>(\d+)$/))) return [m[1] + ' #>' + m[3], +m[2]]; return null; };
const isNew = (p, ws) => { if (ws.includes(p)) return false; const w = worseOf(p); return !w || !ws.some(q => { const v = worseOf(q); return v && v[0] === w[0] && v[1] >= w[1]; }); };
const maps = new Set(Object.keys(was).map(c => X.byCode[c].m.id)); let bad = 0;
console.log('changed decks:', Object.keys(was).length, 'on maps', [...maps].join(' '));
for (const code of Object.keys(X.byCode).filter(c => maps.has(X.byCode[c].m.id))) {
  const now = X.problemsFull(code, X.byCode[code].n.deck, {}), before = X.problemsFull(code, was[code] || X.byCode[code].n.deck, was);
  const nw = now.filter(p => isNew(p, before)); if (nw.length) { bad++; console.log(code.padEnd(8), 'NEW', JSON.stringify(nw)); }
}
console.log(bad ? bad + ' fights with new problems' : 'no new problems'); process.exit(bad ? 1 : 0);
