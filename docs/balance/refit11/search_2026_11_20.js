#!/usr/bin/env node
// 2026-11-20 (package REFIT11): REFIT8's size-keeping swap search (docs/balance/refit8/search_2026_11_19.js, same arguments) with REFIT10's
// "card stays" rule turned on the FOCUS2 carriers: a fight that holds Meerkat Sentry, Sworn Shieldbearer or Booming Bittern keeps 1+ copy
// (counted as a problem), so the map still shows its new skill (Embolden / Harden / Enfeeble). Pass 2 of the lanes (lane_2026_11_20.sh SEARCH=).
'use strict';
const path = require('path'), ROOT = path.resolve(__dirname, '..', '..', '..');
const X = require(path.join(ROOT, 'tools', 'legal1', 'lib_legal_2026_11_15.js')), orig = X.problemsFull;
const CARRIERS = ['meerkat-sentry', 'sworn-shieldbearer', 'booming-bittern'];
X.problemsFull = (code, deck, fx, opt) => { const p = orig(code, deck, fx, opt), live = X.byCode[code].n.deck;
  return p.concat(CARRIERS.filter(id => live[id] && !deck[id]).map(id => `${id} out (FOCUS2 carrier stays)`)); };
require(path.join(ROOT, 'docs', 'balance', 'refit8', 'search_2026_11_19.js'));
