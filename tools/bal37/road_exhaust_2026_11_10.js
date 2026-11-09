#!/usr/bin/env node
// 2026-11-10 (package BAL37): BAL35's whole-space read (tools/bal35/road_exhaust_2026_11_10.js, unchanged) with one more legality rule.
// A fight that names no leaders is led by its deck's showcase card (skirmishLeadersOf -> nodeShowcaseId), so a deck move can change who
// leads it: BAL37's first read of The Ancient Sloth Titan (20-9) cut both Titans and the boss came to be led by a Magma Salamander, while
// the tool's report still named the Titan (it prints the leader read at the start). Here a deck with no explicit leaders must keep the
// leader the fight had (an explicit leader pick is checked by the tuner's rules as before). Output docs/balance/bal37/<--dir>/<code>.json.
//   node tools/bal37/road_exhaust_2026_11_10.js --dir ../bal37/exhaust-r2 --codes 20-9 [--g1 60] [--top 8] [--sample 400]
'use strict';
const T = require('../bal35/road_tune_2026_11_10.js'), G = require('../lib_bramble.js').G;
const setup0 = T.setup;
T.setup = code => {
  const F = setup0(code), legal0 = F.legal, want = JSON.stringify(F.leaders0 || []);
  const derived = d => { const n = Object.assign({}, F.node0, { deck: d }); delete n.leaders; G.NODE_MAP_HINT.set(n, F.MAP); try { return JSON.stringify(G.skirmishLeadersOf(n, F.MAP) || []); } catch (e) { return '?'; } };
  const explicit = Array.isArray(F.node0.leaders) || !!F.node0.leaderId;
  F.legal = (d, leaders) => legal0(d, leaders) && (explicit || leaders || derived(d) === want);
  return F;
};
require('../bal35/road_exhaust_2026_11_10.js');
