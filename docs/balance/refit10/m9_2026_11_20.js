// 2026-11-20 (package REFIT10): the Basalt Foundry (m9, side map of 19) opens after Map 23, so SKIR1's lib_fight maps() leaves it out
// since TESTFIX6 (unlock <= 20); the road measure still plays it (map number 19). Required first, this puts m9 back into maps() so
// tools/legal1/lib_legal_2026_11_15.js (and the REFIT search on top of it) reads its fights with the same rules as every other side map.
'use strict';
const path = require('path'), ROOT = path.resolve(__dirname, '..', '..', '..');
const L = require(path.join(ROOT, 'tools', 'skir1', 'lib_fight_2026_11_11.js')), orig = L.maps;
L.maps = () => { const a = orig(); const m9 = L.G.CONQUEST_MAPS.find(m => m.id === 'm9'); return a.includes(m9) ? a : a.concat([m9]); };
module.exports = L;
