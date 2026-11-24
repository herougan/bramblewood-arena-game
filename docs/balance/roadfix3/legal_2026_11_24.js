#!/usr/bin/env node
// 2026-11-24 (package ROADFIX2): the new legality problems of each deck fix in a fixes file, alone (the other decks as they stand) and
// with every other listed fix in place (tools/legal1/lib_legal_2026_11_15.js problemsFull; a problem the live deck already has is not new).
//   node docs/balance/roadfix2/legal_2026_11_24.js <fixes.jsonl> [CODE ...]   (CODE: only these fixes count as "listed")
'use strict';
const fs = require('fs'), path = require('path'), ROOT = path.resolve(__dirname, '..', '..', '..');
const X = require(path.join(ROOT, 'tools', 'legal1', 'lib_legal_2026_11_15.js'));
const a = process.argv.slice(2), only = new Set(a.slice(1)), fx = {};
fs.readFileSync(a[0], 'utf8').trim().split('\n').filter(Boolean).map(JSON.parse).forEach(x => { if (x.deck && X.byCode[x.key] && (!only.size || only.has(x.key))) fx[x.key] = x.deck; });
for (const code of Object.keys(fx)) {
  const was = X.problemsFull(code, X.byCode[code].n.deck, {}), others = Object.assign({}, fx); delete others[code];
  const alone = X.problemsFull(code, fx[code], {}).filter(p => !was.includes(p)), all = X.problemsFull(code, fx[code], others).filter(p => !was.includes(p));
  console.log(code.padEnd(8), alone.length || all.length ? 'alone ' + JSON.stringify(alone) + (all.length > alone.length ? ' with-all ' + JSON.stringify(all) : '') : 'legal');
}
