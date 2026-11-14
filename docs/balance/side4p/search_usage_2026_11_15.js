#!/usr/bin/env node
// 2026-11-15 (package SIDE4P, scratch only): side3p_search.js with the map usage line added to legal(): no card of the candidate deck may sit in
// more of the map's fights than max(the line, its count with the current decks). Run like side3p_search.js, under rules_2026_11_14.js --carried 2.
'use strict';
const L = require('./skir1/lib_fight_2026_11_11.js'), orig = L.fight;
L.fight = function (m, n) { const f = orig(m, n), all = L.fightsOf(m), cap = L.ucapOf(m), base = {}, others = {};
  all.forEach(x => Object.keys(x.deck).forEach(id => { base[id] = (base[id] || 0) + 1; if (x !== n) others[id] = (others[id] || 0) + 1; }));
  const lg = f.legal; f.legal = d => lg(d) && Object.keys(d).every(id => (others[id] || 0) + 1 <= Math.max(cap, base[id] || 0)); return f; };
require('./side3p_search.js');
