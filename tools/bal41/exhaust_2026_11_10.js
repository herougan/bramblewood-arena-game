#!/usr/bin/env node
// 2026-11-10 (package BAL41): BAL37's whole-space read (tools/bal37/road_exhaust_2026_11_10.js, unchanged: a deck with no explicit
// leaders keeps the leader the fight had) with the boon check on the expanded defs (./boon_expand_2026_11_10.js, FIX12).
//   node tools/bal41/exhaust_2026_11_10.js --dir ../bal41/exhaust --codes 9-1,... [--g1 60] [--top 8] [--sample 400]
'use strict';
require('./boon_expand_2026_11_10.js');
require('../bal37/road_exhaust_2026_11_10.js');
