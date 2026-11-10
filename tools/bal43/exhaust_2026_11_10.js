#!/usr/bin/env node
// 2026-11-10 (package BAL43): BAL42's tool, adapted for Thistlewood 1-* and The Redwood Deep 13-* (main maps); output docs/balance/bal43/. BAL42's header: BAL37's whole-space read (tools/bal37/road_exhaust_2026_11_10.js, unchanged: a deck with no explicit
// leaders keeps the leader the fight had) with the boon check on the expanded defs (./boon_expand_2026_11_10.js, FIX12).
//   node tools/bal43/exhaust_2026_11_10.js --dir ../bal43/exhaust --codes 9-1,... [--g1 60] [--top 8] [--sample 400]
'use strict';
require('./boon_expand_2026_11_10.js');
require('../bal37/road_exhaust_2026_11_10.js');
