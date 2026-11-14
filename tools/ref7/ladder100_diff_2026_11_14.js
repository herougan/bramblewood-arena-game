#!/usr/bin/env node
// 2026-11-14 (package REF7): what the REF6 ladder-100 rebuild on the new prog decks moved, per map (no games).
//   node tools/ref7/ladder100_diff_2026_11_14.js <before.json> [after.json, default docs/balance/ref6/ladder-100.json] [--json out.json]
// Per map: decks changed (of 100), different decks before -> after, mean copies changed per changed deck, cards gained / lost most often.
'use strict';
const fs = require('fs'), path = require('path'), ROOT = path.resolve(__dirname, '..', '..');
const ji = process.argv.indexOf('--json'), a = process.argv.slice(2).filter((x, i, v) => !x.startsWith('--') && v[i - 1] !== '--json');
const B = JSON.parse(fs.readFileSync(a[0], 'utf8')), A = JSON.parse(fs.readFileSync(a[1] || path.join(ROOT, 'docs/balance/ref6/ladder-100.json'), 'utf8'));
const key = d => JSON.stringify(d.counts) + d.leader, diff = (x, y) => Object.keys(Object.assign({}, x, y)).reduce((t, id) => t + Math.max(0, (y[id] || 0) - (x[id] || 0)), 0);
const out = {};
for (const id of Object.keys(A.maps)) {
  const m = A.maps[id], p = B.maps[id]; if (!p) continue; let ch = 0, moved = 0; const gain = {}, lose = {}, lead = {};
  m.decks.forEach((d, i) => { const o = p.decks[i]; if (key(o) === key(d)) return; ch++; moved += diff(o.counts, d.counts);
    Object.keys(Object.assign({}, o.counts, d.counts)).forEach(c => { const x = (d.counts[c] || 0) - (o.counts[c] || 0); if (x > 0) gain[c] = (gain[c] || 0) + x; if (x < 0) lose[c] = (lose[c] || 0) - x; });
    if (o.leader !== d.leader) lead[o.leader + '>' + d.leader] = (lead[o.leader + '>' + d.leader] || 0) + 1; });
  const top = o => Object.entries(o).sort((x, y) => y[1] - x[1]).slice(0, 3).map(([c, k]) => c + ' ' + (k / 100).toFixed(1)).join(', ');
  out[id] = { map: m.map, side: m.side, changed: ch, distinctBefore: new Set(p.decks.map(key)).size, distinctAfter: new Set(m.decks.map(key)).size,
    copiesMovedPerChanged: ch ? Math.round(moved / ch * 10) / 10 : 0, gained: top(gain), lost: top(lose), leaders: lead, progInLibrary: (m.library || []).filter(s => /^prog-/.test(s)).length };
  console.log(`${id.padEnd(4)} Map ${String(m.map).padStart(2)}${m.side ? ' side' : '     '} changed ${String(ch).padStart(3)}/100, distinct ${out[id].distinctBefore}->${out[id].distinctAfter}, copies moved ${out[id].copiesMovedPerChanged}  +[${out[id].gained}] -[${out[id].lost}]`);
}
if (ji >= 0) fs.writeFileSync(process.argv[ji + 1], JSON.stringify({ about: 'REF7: REF6 ladder-100 rebuilt on the REF6 prog decks, before vs after (tools/ref7/ladder100_diff_2026_11_14.js); gained / lost = copies per player', maps: out }, null, 1) + '\n');
