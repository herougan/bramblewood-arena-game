#!/usr/bin/env node
// 2026-11-10 (package BAL46): BAL45's tool, adapted for the three main-map fights a 400-game road measure (bal45w400) read out of band (5-2, 7-6, 10-7); every 200-game read is played at 400 (./rules_2026_11_10.js), output docs/balance/bal46/. BAL45's header: BAL44's tool. BAL44's header: BAL43's tool. BAL43's header: BAL42's tool. BAL42's header: the fights as they stand, 400 games on the road seeds (9100 + 37g, BAL35's tuner measure), with the size of
// each fight's legal deck space (BAL35's road_space), to pick which fights the exhaust read is worth running on (the road measure plays 40).
// Output docs/balance/bal46/baseline-2026-11-10.json.
//   node tools/bal46/baseline_2026_11_10.js --codes 20-A-1,5-A-2,...
'use strict';
require('./boon_expand_2026_11_10.js'); // BAL42: the boon check reads the expanded defs (FIX12)
const fs = require('fs'), path = require('path');
const ROOT = path.resolve(__dirname, '..', '..'), T = require('../bal35/road_tune_2026_11_10.js'), SP = require('../bal35/road_space_2026_11_10.js');
const a = process.argv.slice(2), arg = (k, d) => { const i = a.indexOf(k); return i >= 0 ? a[i + 1] : d; };
const CODES = (arg('--codes', '') || '').split(',').filter(Boolean), OUT = path.join(ROOT, 'docs', 'balance', 'bal46', 'baseline-2026-11-10.json');
const rows = fs.existsSync(OUT) ? JSON.parse(fs.readFileSync(OUT, 'utf8')).rows : {};
for (const code of CODES) {
  const F = T.setup(code), r = T.measure(F, { deck: F.node0.deck, leaders: null, shield: null }, 200, 9100);
  let space = null; try { space = SP.space(F).decks.length; } catch (e) { space = 'err ' + e.message; }
  rows[code] = { code, map: F.MAP, mapName: F.m.name, name: F.node0.name, target: F.want, lo: F.lo, hi: F.hi, win200: r.win, win400: r.win, gap: +(r.win - F.want).toFixed(1), space, leaders: F.leaders0, shieldRule: F.rule, shieldOverride: F.ov0 };
  console.log(code.padEnd(8), 'target', F.want, '| 400 games', r.win, '| gap', rows[code].gap, '| space', space);
  fs.writeFileSync(OUT, JSON.stringify({ about: 'BAL46 baseline (tools/bal46/baseline_2026_11_10.js): 400 games on the road seeds, the Map reference', rows }, null, 1) + '\n');
}
