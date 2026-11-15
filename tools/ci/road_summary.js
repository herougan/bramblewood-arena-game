#!/usr/bin/env node
// 2026-11-16 (package INFRA1): a road measure's totals as Markdown, for .github/workflows/road-measure.yml's job summary and artifact.
// Rows as SKIR1's totals (tools/skir1/totals_2026_11_11.js): Maps 0-20, a curve target, not endless, not mtut / mm / muc, the last row
// per fight; main and side maps apart. In band = lo <= win <= hi; within 10 / beyond 20 = |win - target|.
//   node tools/ci/road_summary.js docs/balance/skirmish-pass-<tag>.jsonl [worst=8]
'use strict';
const fs = require('fs');
const [file, worstN = 8] = process.argv.slice(2);
if (!file) { console.error('usage: road_summary.js <skirmish-pass-*.jsonl> [worst]'); process.exit(2); }
const by = {};
fs.readFileSync(file, 'utf8').split('\n').filter(Boolean).forEach(l => { const r = JSON.parse(l); by[r.map + ':' + r.key] = r; });
const rows = Object.values(by).filter(r => r.target != null && !r.endless && r.mapNo <= 20 && !['mtut', 'mm', 'muc'].includes(r.map));
const gap = r => r.win - r.target;
const sum = rs => `${rs.length} fights: ${rs.filter(r => r.lo <= r.win && r.win <= r.hi).length} in band, ` +
  `${rs.filter(r => Math.abs(gap(r)) <= 10).length} within 10, ${rs.filter(r => Math.abs(gap(r)) > 20).length} beyond 20`;
const worst = rows.slice().sort((a, b) => Math.abs(gap(b)) - Math.abs(gap(a))).slice(0, +worstN);
const games = [...new Set(rows.map(r => r.games))].join('/');
console.log([
  `## Road measure: ${file.split('/').pop()}`,
  `Maps 0-20, curve fights, ${games} games a fight.`, '',
  `- **Main:** ${sum(rows.filter(r => !r.side))}`,
  `- **Side:** ${sum(rows.filter(r => r.side))}`, '',
  `Worst ${worst.length} (win - target; negative = too hard):`, '',
  '| fight | map | win | target (band) | gap |', '|---|---|---|---|---|',
  ...worst.map(r => `| ${r.code} ${r.name} | ${r.side ? 'side ' : ''}${r.mapNo} ${r.mapName} | ${r.win} | ${+r.target.toFixed(1)} (${+r.lo.toFixed(1)}-${+r.hi.toFixed(1)}) | ${gap(r) > 0 ? '+' : ''}${+gap(r).toFixed(1)} |`),
].join('\n'));
