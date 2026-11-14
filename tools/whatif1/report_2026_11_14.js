#!/usr/bin/env node
// 2026-11-14 (package WHATIF1): the side maps' road reads (400 games a fight) side by side: today's rules, option a (Carried x2), option c
// (smaller side decks): in band / within 10 / beyond 20 over the 77 fights on the curve, per map, and the fights that moved in or out of band.
//   node tools/whatif1/report_2026_11_14.js   (reads docs/balance/whatif1/measure-{base,a,c}-2026-11-14.jsonl)
'use strict';
const fs = require('fs'), path = require('path');
const DIR = path.join(__dirname, '..', '..', 'docs', 'balance', 'whatif1');
const read = t => { const f = path.join(DIR, `measure-${t}-2026-11-14.jsonl`); return fs.existsSync(f) ? fs.readFileSync(f, 'utf8').trim().split('\n').map(l => JSON.parse(l)).filter(r => r.curve) : null; };
const gap = r => Math.round((r.win - r.target) * 10) / 10;
const tot = rs => ({ fights: rs.length, inBand: rs.filter(r => r.green === 'green').length, within10: rs.filter(r => Math.abs(gap(r)) <= 10).length, beyond20: rs.filter(r => Math.abs(gap(r)) > 20).length,
  meanGap: Math.round(rs.reduce((t, r) => t + Math.abs(gap(r)), 0) / rs.length * 10) / 10 });
const runs = ['base', 'a', 'c'].map(t => [t, read(t)]).filter(x => x[1]);
console.log('| run | fights | in band | within 10 | beyond 20 | mean gap |\n|---|---|---|---|---|---|');
runs.forEach(([t, rs]) => { const x = tot(rs); console.log(`| ${t} | ${x.fights} | ${x.inBand} | ${x.within10} | ${x.beyond20} | ${x.meanGap} |`); });
const maps = [...new Set(runs[0][1].map(r => r.mapName))];
console.log('\n| map | fights | ' + runs.map(([t]) => t + ' in band (mean gap)').join(' | ') + ' |\n|---|---|' + runs.map(() => '---').join('|') + '|');
maps.forEach(mn => { const cells = runs.map(([t, rs]) => { const s = rs.filter(r => r.mapName === mn), x = tot(s); return `${x.inBand} (${x.meanGap})`; });
  console.log(`| ${mn} | ${runs[0][1].filter(r => r.mapName === mn).length} | ${cells.join(' | ')} |`); });
const base = new Map(runs[0][1].map(r => [r.code, r]));
runs.slice(1).forEach(([t, rs]) => {
  const moved = rs.map(r => ({ r, b: base.get(r.code) })).filter(x => x.b && (x.b.green === 'green') !== (x.r.green === 'green'));
  console.log(`\n${t}: into band: ` + moved.filter(x => x.r.green === 'green').map(x => `${x.r.code} ${x.b.win}->${x.r.win}/${x.r.target}`).join(', '));
  console.log(`${t}: out of band: ` + moved.filter(x => x.r.green !== 'green').map(x => `${x.r.code} ${x.b.win}->${x.r.win}/${x.r.target}`).join(', '));
  console.log(`${t}: still out: ` + rs.filter(r => r.green !== 'green' && base.get(r.code) && base.get(r.code).green !== 'green').map(r => `${r.code} ${base.get(r.code).win}->${r.win}/${r.target}`).join(', '));
});
