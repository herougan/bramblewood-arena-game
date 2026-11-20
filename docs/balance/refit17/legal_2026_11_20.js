#!/usr/bin/env node
// 2026-11-20 (package REFIT17): REFIT16 script, copied (acc.jsonl now refit17). Was: a candidate deck's legality (problemsFull with refit17/acc.jsonl's other decks in place, leaders kept). Read only.
//   node docs/balance/refit17/legal_2026_11_20.js CODE '<deck json>' [CODE '<deck json>' ...]
'use strict';
const fs = require('fs'), path = require('path'), ROOT = path.resolve(__dirname, '..', '..', '..');
const X = require(path.join(ROOT, 'tools', 'legal1', 'lib_legal_2026_11_15.js')), G = X.G;
const a = process.argv.slice(2), fx = {};
fs.readFileSync(path.join(__dirname, 'acc.jsonl'), 'utf8').trim().split('\n').filter(Boolean).map(JSON.parse).forEach(x => { fx[x.key] = x.deck; });
for (let i = 0; i < a.length; i += 2) fx[a[i]] = JSON.parse(a[i + 1]);
for (let i = 0; i < a.length; i += 2) { const code = a[i], d = fx[code], { m, n } = X.byCode[code];
  const lead = dd => { const nn = Object.assign({}, n, { deck: dd }); G.NODE_MAP_HINT.set(nn, m.id); return JSON.stringify(G.skirmishLeadersOf(nn, m.id) || []); };
  const others = Object.assign({}, fx); delete others[code];
  const p = X.problemsFull(code, d, others).concat(lead(d) === lead(n.deck) ? [] : ['leaders change']);
  console.log(code, p.length ? 'PROBLEMS ' + JSON.stringify(p) : 'legal', JSON.stringify(d)); }
