#!/usr/bin/env node
// 2026-11-14 (package WHATIF2): the side maps' road reads (400 games a fight) for SIDE2-2 a + c beside WHATIF1's today / a / c (same totals as
// tools/whatif1/report_2026_11_14.js: the 77 fights on the curve), per map, the fights whose band status moved vs today, and named fights.
//   node tools/whatif2/report_2026_11_14.js [--codes 0-B-3,...]
'use strict';
const fs = require('fs'), path = require('path');
const BAL = path.join(__dirname, '..', '..', 'docs', 'balance');
const read = (dir, t) => { const f = path.join(BAL, dir, `measure-${t}-2026-11-14.jsonl`); return fs.existsSync(f) ? fs.readFileSync(f, 'utf8').trim().split('\n').map(l => JSON.parse(l)) : null; };
const gap = r => Math.round((r.win - r.target) * 10) / 10, cur = rs => rs.filter(r => r.curve);
const tot = rs => ({ inBand: rs.filter(r => r.green === 'green').length, within10: rs.filter(r => Math.abs(gap(r)) <= 10).length, beyond20: rs.filter(r => Math.abs(gap(r)) > 20).length,
  meanGap: Math.round(rs.reduce((t, r) => t + Math.abs(gap(r)), 0) / rs.length * 10) / 10, fights: rs.length });
const runs = [['today', read('whatif1', 'base')], ['a', read('whatif1', 'a')], ['c', read('whatif1', 'c')], ['a+c', read('whatif2', 'ac')]].filter(x => x[1]);
console.log('| run | in band | within 10 | beyond 20 | mean gap |\n|---|---|---|---|---|');
runs.forEach(([t, rs]) => { const x = tot(cur(rs)); console.log(`| ${t} | ${x.inBand} | ${x.within10} | ${x.beyond20} | ${x.meanGap} | (${x.fights} fights)`); });
const maps = [...new Set(cur(runs[0][1]).map(r => r.mapName))];
console.log('\n| map (fights) | ' + runs.map(([t]) => t).join(' | ') + ' |\n|---|' + runs.map(() => '---').join('|') + '|');
maps.forEach(mn => console.log(`| ${mn} (${cur(runs[0][1]).filter(r => r.mapName === mn).length}) | ` + runs.map(([t, rs]) => { const x = tot(cur(rs).filter(r => r.mapName === mn)); return `${x.inBand} (${x.meanGap})`; }).join(' | ') + ' |'));
const by = rs => new Map(rs.map(r => [r.code, r])), base = by(runs[0][1]), ac = runs.find(x => x[0] === 'a+c');
if (ac) {
  const fresh = (dir, t) => by(read(dir, t) || []), fb = new Map([...fresh('whatif1', 'base-fresh'), ...fresh('whatif2', 'base-fresh')]), fa = fresh('whatif2', 'ac-fresh');
  const moved = cur(ac[1]).filter(r => base.get(r.code) && (base.get(r.code).green === 'green') !== (r.green === 'green'));
  console.log('\nmoved vs today (code: today road/fresh -> a+c road/fresh, target, band):');
  moved.forEach(r => { const b = base.get(r.code), f = x => x ? x.win : '-'; console.log(`${r.code}: ${b.win}/${f(fb.get(r.code))} -> ${r.win}/${f(fa.get(r.code))} (t ${r.target} [${r.lo}-${r.hi}]) ${r.green === 'green' ? 'IN' : 'OUT'}${fa.get(r.code) ? (fa.get(r.code).green === 'green' ? ' fresh IN' : ' fresh OUT') : ''}`); });
  console.log('movers: ' + moved.map(r => r.code).join(','));
  console.log('still out: ' + cur(ac[1]).filter(r => r.green !== 'green').map(r => `${r.code} ${r.win}/${r.target}`).join(', '));
  const i = process.argv.indexOf('--codes'); if (i > 0) process.argv[i + 1].split(',').forEach(c => console.log(c + ': ' + runs.map(([t, rs]) => { const r = by(rs).get(c); return t + ' ' + (r ? `${r.win} (t ${r.target}, ${r.green}, size ${Object.values(r.deck || {}).reduce((s, k) => s + k, 0)}, shield ${r.shield})` : '-'); }).join(' | ')));
}
