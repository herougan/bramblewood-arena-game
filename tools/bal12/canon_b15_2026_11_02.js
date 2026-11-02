#!/usr/bin/env node
// 2026-11-02 (package BAL12, owner BAL11-2 a: "keep x2 and re-measure the canon at the game's bramble Health (15)"): the 15 canon points
// re-set from one shared measure with both brambles at 15 Health (the road's: arena_app.js BRAMBLE_SCALE 0.5 x 30), as SKILL2 set them at 30.
//   node tools/skill_canon_2026_10_31.js check --bramble 15 --games 1000 --save --name check-b15 --tag 2026-11-02-bal12 --out docs/balance/bal12
//   node tools/bal12/canon_b15_2026_11_02.js anchors [--dry]
// price = the anchor's paired gain less the placebo's (the canon tool 1.1.0 subtracts it in the check itself, once a key) / the stat yardstick's
// gain a 3A + H point, i.e. the check's worthStat; two canon points and a power curve (Armor, Bleed, Poison) give value = P(1) and
// pow = log2(P(2) / P(1)), as tools/skill2_apply_2026_10_31.js anchors. Each changed entry keeps its numbers before under `bal12Was`.
'use strict';
const fs = require('fs'), path = require('path');
const ROOT = path.join(__dirname, '..', '..');
const A = require('../skill2_apply_2026_10_31.js');
const CHECK = path.join(ROOT, 'docs', 'balance', 'bal12', 'skill-canon-check-b15-2026-11-02-bal12.json');
const r2 = v => Math.round(v * 100) / 100, r3 = v => Math.round(v * 1000) / 1000;
const numOf = v => typeof v === 'number' ? v : 0;
function anchors(dry) {
  const { text, table } = A.readTable(), chk = JSON.parse(fs.readFileSync(CHECK, 'utf8')), sr = chk.statRate;
  if (!chk.placebo) throw new Error('the check must be run with the placebo (canon tool 1.1.0 default)');
  if ((chk.context.bramble || 30) !== 15) throw new Error('the check is not at bramble 15');
  const by = {}; chk.anchors.forEach(a => { (by[a.id] = by[a.id] || []).push(a); });
  const changed = {}, rows = [];
  table.skills.filter(e => e.canon).forEach(e0 => {
    const pts = (by[e0.id] || []).slice().sort((a, b) => numOf(a.n) - numOf(b.n)); if (!pts.length) throw new Error('no measure for anchor ' + e0.id);
    const e = JSON.parse(JSON.stringify(e0)); e.bal12Was = {}; ['scale', 'value', 'pow', 'appliedAt', 'measuredS', 'measuredSE', 'measuredHow'].forEach(k => { if (e0[k] != null) e.bal12Was[k] = e0[k]; });
    const P = pts.map(a => ({ n: a.n, key: a.key, price: a.worthStat.m, ws: a.worthStat, old: a.price }));
    if (pts.length === 2 && e.scale === 'n' && e.pow != null) { e.value = r2(P[0].price); e.pow = r3(Math.log(P[1].price / P[0].price) / Math.log(numOf(P[1].n) / numOf(P[0].n))); }
    else if (pts.length === 1) e.value = r2(P[0].price / A.factorOf(e, P[0].n));
    else throw new Error('anchor ' + e.id + ': ' + pts.length + ' points and no power curve');
    e.measuredS = r2(P[0].price / A.factorOf(e, P[0].n)); e.measuredConf = 'high'; e.measuredSE = r2((P[0].ws.hi - P[0].ws.lo) / 3.92 / A.factorOf(e, P[0].n));
    e.appliedAt = '2026-11-02 (package BAL12, decision BAL11-2 a: the canon re-measured at the road\'s bramble Health, 15)';
    e.measuredHow = `2026-11-02 (BAL12): node tools/skill_canon_2026_10_31.js check --bramble 15 --games ${chk.context.fights} (global context, both brambles 15, carriers ${chk.carriers.join(', ')}, 6 copies, Level 1; docs/balance/bal12/skill-canon-check-b15-2026-11-02-bal12.json): price = (the anchor's paired gain - the placebo's ${r2(chk.placebo.gain * 100)}) / the stat yardstick's gain a 3A + H point (${r2(sr.m * 100)} [${r2(sr.lo * 100)}, ${r2(sr.hi * 100)}] win-rate points); ` + P.map(p => `${p.key} ${r2(p.price)} [${r2(p.ws.lo)}, ${r2(p.ws.hi)}]`).join('; ') + ' (95%, a bootstrap over fights)';
    e.canonReason = (e.canonReason || '').replace(/; BAL12 [(].*$/, '') + `; BAL12 (2026-11-02): re-set at bramble 15 (${P.map(p => p.key + ' ' + p.old + ' -> ' + r2(p.price)).join(', ')})`;
    changed[e.id] = e; P.forEach(p => rows.push(`${p.key.padEnd(15)} ${String(p.old).padStart(6)} -> ${String(r2(p.price)).padStart(6)}  [${r2(p.ws.lo)}, ${r2(p.ws.hi)}]`));
  });
  console.log(`stat yardstick at 15: ${r2(sr.m * 100)} [${r2(sr.lo * 100)}, ${r2(sr.hi * 100)}] win-rate points a 3A + H point; placebo ${r2(chk.placebo.gain * 100)}`);
  rows.forEach(r => console.log(r));
  if (dry) return;
  fs.writeFileSync(A.FILE || path.join(ROOT, 'canonical', 'skill-costs.json'), A.writeSkills(text, changed)); console.log('-> canonical/skill-costs.json (' + Object.keys(changed).length + ' anchor entries)');
}
if (process.argv[2] === 'anchors') anchors(process.argv.includes('--dry'));
else console.log(fs.readFileSync(__filename, 'utf8').split('\n').slice(1, 9).map(l => l.replace(/^\/\/ ?/, '')).join('\n'));
