#!/usr/bin/env node
// 2026-11-10 (package BAL45): BAL44's tool, adapted for the main-map fights 6+ points from target (still in band); output docs/balance/bal45/. BAL44's header: BAL43's tool. BAL43's header: BAL42's tool. BAL42's header: BAL37's whole-space read (tools/bal37/road_exhaust_2026_11_10.js, unchanged: a deck with no explicit
// leaders keeps the leader the fight had) with the boon check on the expanded defs (./boon_expand_2026_11_10.js, FIX12).
//   node tools/bal45/exhaust_2026_11_10.js --dir ../bal45/exhaust --codes 9-1,... [--g1 60] [--top 8] [--sample 400]
'use strict';
require('./boon_expand_2026_11_10.js');
require('../bal37/road_exhaust_2026_11_10.js');
