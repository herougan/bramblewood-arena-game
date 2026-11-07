#!/usr/bin/env node
// BAL25 (2026-11-07): the summary of the card power v3 run (docs/balance/bal25/card-power.json, tools/card_balance.js --v3):
//   - the top / bottom 15 by "for its budget" (power - the fit's expected power at the card's N),
//   - how Diurnal and Nocturnal cards moved from v2 (docs/balance/card-balance.json: 100 games, day every game, no field) to v3,
//     centred on each run's median so the new filler's overall shift drops out, and v3's day / night / cycle split for them,
//   - the high-Lumber cards (cost 3+) v2 -> v3 the same way.
// Writes docs/balance/bal25/summary-2026-11-07.json and prints a short table. Reads only; changes no card.
//   node tools/bal25/summary_2026_11_07.js
'use strict';
const fs = require('fs'), path = require('path');
const ROOT = path.join(__dirname, '..', '..');
const J = f=> JSON.parse(fs.readFileSync(path.join(ROOT, f), 'utf8'));
const v3 = J('docs/balance/bal25/card-power.json'), v2 = J('docs/balance/card-balance.json');
const cards = J('canonical/cards.json'), RAW = {}; cards.forEach(c=> RAW[c.id] = c);
const r1 = v=> v == null ? null : Math.round(v * 10) / 10;
const median = a=>{ const s = a.filter(x=> x != null).sort((x, y)=> x - y), L = s.length; return !L ? null : L % 2 ? s[(L - 1) / 2] : (s[L / 2 - 1] + s[L / 2]) / 2; };
const V2 = {}; (v2.rows || []).forEach(r=> V2[r.id] = r);
const rows = v3.rows.filter(r=> r.forBudget != null && !r.lowSample);
const pick = r=> ({id: r.id, name: r.name, rarity: r.rarityClass, map: r.map, cost: r.cost, wait: r.wait, N: r.N, basic: r.winRate, adv: r.advRate, power: r.power, expected: r.expected, forBudget: r.forBudget});
const over = rows.slice().sort((a, b)=> b.forBudget - a.forBudget).slice(0, 15).map(pick);
const under = rows.slice().sort((a, b)=> a.forBudget - b.forBudget).slice(0, 15).map(pick);
// v2 -> v3, each centred on its own median (over the cards both runs measured)
const both = v3.rows.filter(r=> r.winRate != null && V2[r.id] && V2[r.id].winRate != null);
const m3 = median(both.map(r=> r.winRate)), m2 = median(both.map(r=> V2[r.id].winRate));
const isD = r=> { const e = (RAW[r.id] || {}).effects || {}; return !!(e.diurnal || e.diurnalHp); }, isN = r=> { const e = (RAW[r.id] || {}).effects || {}; return !!(e.nocturnal || e.nocturnalHp); };
const rate = b=> b && b[0] ? b[1] / b[0] * 100 : null;
function group(f, label){
  const g = both.filter(f), d = g.map(r=> (r.winRate - m3) - (V2[r.id].winRate - m2));
  const ph = k=>{ const p = g.reduce((s, r)=> s + r.byPhase[k][0], 0), w = g.reduce((s, r)=> s + r.byPhase[k][1], 0); return p ? r1(w / p * 100) : null; };
  return {label, cards: g.length, meanShift: r1(d.reduce((s, x)=> s + x, 0) / (d.length || 1)), v2MeanCentred: r1(g.reduce((s, r)=> s + V2[r.id].winRate - m2, 0) / (g.length || 1)),
    v3MeanCentred: r1(g.reduce((s, r)=> s + r.winRate - m3, 0) / (g.length || 1)), v3ByPhase: {day: ph('day'), cycle: ph('cycle'), night: ph('night')},
    meanForBudget: r1(g.filter(r=> r.forBudget != null).reduce((s, r)=> s + r.forBudget, 0) / (g.filter(r=> r.forBudget != null).length || 1)),
    rows: g.map(r=> ({id: r.id, v2: V2[r.id].winRate, v3: r.winRate, shift: r1((r.winRate - m3) - (V2[r.id].winRate - m2)), day: r1(rate(r.byPhase.day)), night: r1(rate(r.byPhase.night)), forBudget: r.forBudget})).sort((a, b)=> a.shift - b.shift)};
}
const groups = [group(isD, 'Diurnal'), group(isN, 'Nocturnal'), group(r=> (r.cost || 0) >= 3, 'Lumber 3+'), group(r=> !isD(r) && !isN(r), 'neither (control)')];
const adv = v3.rows.filter(r=> r.advRate != null).map(r=> r.advRate);
const out = {generated: v3.generated, source: 'docs/balance/bal25/card-power.json (' + v3.games + ' games) vs docs/balance/card-balance.json (' + v2.games + ' games, ' + v2.generated + ')',
  medians: {v3Basic: m3, v2Basic: m2, v3Adv: median(adv), v2Adv: median((v2.rows || []).map(r=> r.advRate))}, fit: v3.fit, cards: v3.rows.length, fitted: rows.length,
  factionStarter: v3.rows.filter(r=> r.rarityClass === 'factionStarter').map(pick), over, under, groups};
fs.writeFileSync(path.join(ROOT, 'docs/balance/bal25/summary-2026-11-07.json'), JSON.stringify(out, null, 1) + '\n');
console.log('medians', JSON.stringify(out.medians), 'fit', JSON.stringify({a: v3.fit.a, b: v3.fit.b, r2: v3.fit.r2, rmse: v3.fit.rmse, n: v3.fit.n}));
const line = r=> `  ${r.forBudget > 0 ? '+' : ''}${r.forBudget}  ${r.id} (${r.rarity}, map ${r.map}, L${r.cost}/W${r.wait}, N ${r.N}): basic ${r.basic}, adv ${r.adv}, power ${r.power} vs ${r.expected}`;
console.log('OVER'); over.forEach(r=> console.log(line(r))); console.log('UNDER'); under.forEach(r=> console.log(line(r)));
groups.forEach(g=> console.log(g.label, JSON.stringify({cards: g.cards, meanShift: g.meanShift, v2: g.v2MeanCentred, v3: g.v3MeanCentred, byPhase: g.v3ByPhase, fb: g.meanForBudget})));
