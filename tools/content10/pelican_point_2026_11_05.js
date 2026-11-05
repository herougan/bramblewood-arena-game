#!/usr/bin/env node
// 2026-11-05 (package CONTENT10, decision FIX8-1; owner 11-04 22:34: "Ease 2-4 slightly."): measures Pelican Point (2-4) the way the skirmish
// pass does (arena_app.js simulateReferenceFight: the fight as the game builds it, the same seeds 9100 + 37g) with two decks in your seat:
//   map      the Map reference (referenceDeckFor: Map 2's road deck, what `tools/skirmish_pass.js measure` plays)
//   starter  the Otter starter (WINRATE_REF_DECKS.starter, what a player who skipped the Camp still holds; QA2 M3)
// Read-only. Usage: node tools/content10/pelican_point_2026_11_05.js [games=200] [--tag=<t>]  -> docs/balance/content10/pelican-point-<tag>.json
'use strict';
const fs = require('fs'), path = require('path');
const ROOT = path.join(__dirname, '..', '..');
const B = require(path.join(ROOT, 'tools', 'lib_bramble.js')), G = B.G;
const argv = process.argv.slice(2), games = +(argv.find(a => /^\d+$/.test(a)) || 200);
const tag = ((argv.find(a => a.startsWith('--tag=')) || '').slice(6)) || 'now';
const node = B.byKey('mb', '2-4'); G.NODE_MAP_HINT.set(node, 'mb');
const out = { fight: '2-4 Pelican Point', games, seeds: '9100 + 37g', deck: node.deck, rows: {} };
for (const [k, deck] of [['map', null], ['starter', Object.assign({}, G.WINRATE_REF_DECKS.starter)]]) {
  const r = G.simulateReferenceFight('mb', node, games, { seed0: 9100, deck });
  out.rows[k] = { win: Math.round(r.win * 1000) / 10, losses: r.losses, draws: r.draws, avgRounds: r.avgRounds == null ? null : Math.round(r.avgRounds * 10) / 10, hpLost: Math.round(r.hpLost * 1000) / 10, stage: r.stage, level: r.level, bramble: r.hp + ' + ' + r.shield + ' Shield' };
  console.log(`${k.padEnd(8)} win ${out.rows[k].win}%  (losses ${r.losses}, draws ${r.draws}, rounds ${out.rows[k].avgRounds}, bramble ${out.rows[k].bramble})`);
}
const dir = path.join(ROOT, 'docs', 'balance', 'content10'); fs.mkdirSync(dir, { recursive: true });
fs.writeFileSync(path.join(dir, `pelican-point-${tag}.json`), JSON.stringify(out, null, 1) + '\n');
