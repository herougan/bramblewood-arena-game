#!/usr/bin/env node
// 2026-11-20 (package REFIT10): REFIT8/9's size-keeping swap search (docs/balance/refit8/search_2026_11_19.js, same arguments) for the
// Basalt Foundry fights DEC19-DATA moved (Granite Ox Golem -> Malachite Golem one-for-one, LIST1-1 a). Two additions:
//   - m9 back in SKIR1's maps() (m9_2026_11_20.js; TESTFIX6 dropped it, it opens after Map 23), so problemsFull reads its fights;
//   - Malachite Golem stays (the brief): a fight that holds it keeps 1+ copy, counted as a problem.
'use strict';
const path = require('path'), ROOT = path.resolve(__dirname, '..', '..', '..');
require('./m9_2026_11_20.js');
const X = require(path.join(ROOT, 'tools', 'legal1', 'lib_legal_2026_11_15.js')), orig = X.problemsFull;
X.problemsFull = (code, deck, fx, opt) => { const p = orig(code, deck, fx, opt), live = X.byCode[code].n.deck;
  return (live['malachite-golem'] && !deck['malachite-golem']) ? p.concat(['malachite-golem out (stays, LIST1-1 a)']) : p; };
require(path.join(ROOT, 'docs', 'balance', 'refit8', 'search_2026_11_19.js'));
