#!/usr/bin/env node
// 2026-11-18 (package REFIT4): the joint legality of refit4-fixes.jsonl (apply:true lines) against the live decks of the commit before
// REFIT4 (the candidates file's liveDeck; arena_app.js may hold other decks while a read runs): problemsFull per road fight (SKIR1's rules
// under SIDE2's holds + the map lines), the held pre-FOLD6 problems named apart.   node docs/balance/refit4/gate_2026_11_18.js
'use strict';
const fs = require('fs'), path = require('path'), ROOT = path.resolve(__dirname, '..', '..', '..');
const X = require(path.join(ROOT, 'tools', 'legal1', 'lib_legal_2026_11_15.js'));
const rd = f => fs.readFileSync(path.join(__dirname, f), 'utf8').trim().split('\n').filter(Boolean);
const held = {}; rd('problems-prefold-2026-11-18.txt').forEach(l => { const i = l.indexOf(' '); held[l.slice(0, i)] = new Set(JSON.parse(l.slice(i + 1))); });
const cand = rd('refit4-candidates.jsonl').map(JSON.parse), fixes = rd('refit4-fixes.jsonl').map(JSON.parse);
const live = {}; Object.keys(X.byCode).forEach(c => { live[c] = X.byCode[c].n.deck; }); cand.forEach(o => { live[o.key] = o.liveDeck; });
const fin = Object.assign({}, live); fixes.filter(x => x.apply).forEach(x => { fin[x.key] = x.deck; });
let n = 0, h = 0; const out = [];
for (const c of Object.keys(X.byCode)) { const o = Object.assign({}, fin); delete o[c];
  // problemsFull's map lines compare against the decks arena_app.js holds now; read them against the final set instead
  const p = X.problemsFull(c, fin[c], o).filter(q => !q.startsWith('map: ')); const mine = p.filter(q => !(held[c] && held[c].has(q)));
  if (p.length) { n++; if (!mine.length) h++; out.push(c + ' ' + JSON.stringify(p) + (mine.length ? '' : ' (held since before FOLD6)')); } }
// the map lines (usage, family, mix) of the final set vs the live set
const ml = set => { const s = new Set(); Object.keys(X.byMap).forEach(m => X.mapLines(m, set).forEach(x => s.add(x))); return s; };
const a = ml(live), b = ml(fin);
console.log(`fights with deck problems: ${n} (${h} held since before FOLD6)`); out.forEach(l => console.log('  ' + l));
console.log('map lines new with the fixes:', [...b].filter(x => !a.has(x)).join(' | ') || 'none');
console.log('map lines cleared:', [...a].filter(x => !b.has(x)).join(' | ') || 'none');
