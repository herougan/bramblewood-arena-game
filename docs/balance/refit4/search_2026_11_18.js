#!/usr/bin/env node
// 2026-11-18 (package REFIT4, owner 11-17 23:41 overnight plan): REFIT1's legal-only search (tools/refit1/search_2026_11_16.js, unchanged,
// same arguments) with one difference: the deck problems a fight already had before FOLD6 (problems-prefold-2026-11-18.txt: the 17 held
// fights, e.g. 14-x Tasmanian Devil x4, 13-4's wildRage boon) are not counted, so the search neither "repairs" a held deck nor finds no legal
// refill for 13-4. Everything else (SKIR1's rules under SIDE2's holds, the map lines, leaders kept) is problemsFull as REFIT1-3 used it.
//   node docs/balance/refit4/search_2026_11_18.js --code X --bands <measure.jsonl> --fx acc.jsonl --accept acc.jsonl --out log.jsonl [...]
'use strict';
const fs = require('fs'), path = require('path'), ROOT = path.resolve(__dirname, '..', '..', '..');
const X = require(path.join(ROOT, 'tools', 'legal1', 'lib_legal_2026_11_15.js'));
const held = {}; fs.readFileSync(path.join(__dirname, 'problems-prefold-2026-11-18.txt'), 'utf8').trim().split('\n').filter(Boolean).forEach(l => {
  const i = l.indexOf(' '); held[l.slice(0, i)] = new Set(JSON.parse(l.slice(i + 1))); });
const orig = X.problemsFull;
X.problemsFull = (code, deck, fx, opt) => orig(code, deck, fx, opt).filter(p => !(held[code] && held[code].has(p)));
require(path.join(ROOT, 'tools', 'refit1', 'search_2026_11_16.js'));
