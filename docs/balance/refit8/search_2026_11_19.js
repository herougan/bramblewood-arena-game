#!/usr/bin/env node
// 2026-11-19 (package REFIT8): REFIT7's neighbour search (docs/balance/refit4/search_2026_11_18.js, same arguments) with one more rule:
// the deck keeps its size (the brief: swaps only, so the side-map "one copy out" moves are refused), counted as a problem.
'use strict';
const path = require('path'), ROOT = path.resolve(__dirname, '..', '..', '..');
const X = require(path.join(ROOT, 'tools', 'legal1', 'lib_legal_2026_11_15.js'));
const sz = d => Object.values(d || {}).reduce((t, k) => t + k, 0), orig = X.problemsFull;
X.problemsFull = (code, deck, fx, opt) => { const p = orig(code, deck, fx, opt), s0 = sz(X.byCode[code].n.deck);
  return sz(deck) === s0 ? p : p.concat([`size ${sz(deck)} (live ${s0})`]); };
require(path.join(ROOT, 'docs', 'balance', 'refit4', 'search_2026_11_18.js'));
