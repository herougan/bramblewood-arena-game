#!/usr/bin/env node
// Package BF (2026-10-19, owner 09:52): the budget v4 check and the Forge curve's numbers.
//   node tools/forge_curve_2026_10_19.js budget        every measured card under budget v3 and v4, at Level 1 and at the level it starts at:
//                                                     which cards move in or out of budget -> docs/balance/budget-v4-2026-10-19.json
//   node tools/forge_curve_2026_10_19.js gain          the mean 2A+H gain over Lv 1 at each level (arena_app.js FORGE_MEAN_GAIN)
//   node tools/forge_curve_2026_10_19.js cards a,b,c   the Forge curve of those cards, a row a level
// Budget v4: N(L) = (Base - 1 + L) x (1 + L/20), Base = v3's N without its 2L (bramblewood-budget.js); v3: N = Base + 2L.
'use strict';
const fs = require('fs'), path = require('path');
const ROOT = path.join(__dirname, '..');
const BB = require(path.join(ROOT, 'bramblewood-budget.js')), SC = require('./skill_costs.js');
const T = SC.make(JSON.parse(fs.readFileSync(path.join(ROOT, 'canonical', 'skill-costs.json'), 'utf8')));
const CARDS = JSON.parse(fs.readFileSync(path.join(ROOT, 'canonical', 'cards.json'), 'utf8'));
const r2 = v=> Math.round(v * 100) / 100;
const cmd = process.argv[2] || 'budget';

// the curve the game uses (arena_app.js forgeCurveOf: from the card's start level to 11, or its own top)
const topOf = d=> d.id === 'hero' ? 100 : (d.isCastle || (d.archetypes || []).includes('Castle')) ? 20 : 11;
const curveOf = d=> BB.forgeCurve(d, SC.levelOf(d), topOf(d));

function budgetRows(){
  return CARDS.filter(SC.measured).map(c=>{
    const lv = SC.levelOf(c), at = L=>{ const v4 = T.budget(c, {level: L}), v3 = T.budget(c, {N: T.budgetV3N(c, L)}); return {N3: v3.N, N4: v4.N, ok3: v3.ok, ok4: v4.ok, x1: v4.x1, x2: v4.x2}; };
    return {id: c.id, name: c.name, rarity: c.rarity || 'common', pool: !!c.pool, start: lv, base: T.budgetBase(c), S: T.budget(c).S, L1: at(1), start_: at(lv)};
  });
}
if(cmd === 'budget'){
  const rows = budgetRows(), tally = k=>{ const t = {in: [], out: [], same: 0}; rows.forEach(r=>{ const x = r[k]; if(x.ok4 && !x.ok3) t.in.push(r); else if(!x.ok4 && x.ok3) t.out.push(r); else t.same++; }); return t; };
  const L1 = tally('L1'), st = tally('start_'), d1 = rows.map(r=> r2(r.L1.N4 - r.L1.N3)), d0 = rows.filter(r=> r.start === 0).map(r=> r2(r.start_.N4 - r.start_.N3));
  const brief = r=> ({id: r.id, name: r.name, rarity: r.rarity, start: r.start, base: r.base, S: r.S, N3: r.L1.N3, N4: r.L1.N4, x1: r.L1.x1, x2: r.L1.x2});
  const out = {_about: 'Budget v4 (2026-10-19, package BF: N = (Base - 1 + L) x (1 + L/20)) against v3 (N = Base + 2L) for every measured card (tools/forge_curve_2026_10_19.js budget). "in" = passes v4 but not v3, "out" = passes v3 but not v4. At L1 every card is checked at Level 1; at start, at the level it starts at (Base / quest cards 0, rewards 1), which is what the tests and the post-balance queue use.',
    generated: '2026-10-19', cards: rows.length,
    atL1: {passV3: rows.filter(r=> r.L1.ok3).length, passV4: rows.filter(r=> r.L1.ok4).length, in: L1.in.map(brief), out: L1.out.map(brief), dN: {min: Math.min(...d1), max: Math.max(...d1)}},
    atStart: {passV3: rows.filter(r=> r.start_.ok3).length, passV4: rows.filter(r=> r.start_.ok4).length, in: st.in.map(r=> ({id: r.id, name: r.name, start: r.start, N3: r.start_.N3, N4: r.start_.N4})), out: st.out.map(r=> ({id: r.id, name: r.name, start: r.start, N3: r.start_.N3, N4: r.start_.N4})), startsAt0: d0.length}};
  fs.writeFileSync(path.join(ROOT, 'docs', 'balance', 'budget-v4-2026-10-19.json'), JSON.stringify(out, null, 1) + '\n');
  console.log(`${rows.length} measured cards. At Level 1: v3 passes ${out.atL1.passV3}, v4 ${out.atL1.passV4}; in ${L1.in.length}, out ${L1.out.length}; N moves ${out.atL1.dN.min} to +${out.atL1.dN.max}.`);
  L1.in.forEach(r=> console.log('  in ', r.name, `N ${r.L1.N3} -> ${r.L1.N4}, 2A+H+S ${r.L1.x1}`)); L1.out.forEach(r=> console.log('  out', r.name, `N ${r.L1.N3} -> ${r.L1.N4}, 2A+H+S ${r.L1.x1}`));
  console.log(`At the start level: v3 passes ${out.atStart.passV3}, v4 ${out.atStart.passV4}; in ${st.in.length}, out ${st.out.length} (${d0.length} cards start at Lv 0, where v4 is Base - 1, v3 Base).`);
  st.in.forEach(r=> console.log('  in ', r.name, 'Lv', r.start, `N ${r.start_.N3} -> ${r.start_.N4}`)); st.out.forEach(r=> console.log('  out', r.name, 'Lv', r.start, `N ${r.start_.N3} -> ${r.start_.N4}`));
} else if(cmd === 'gain'){
  const acc = {}; let n = 0;
  CARDS.filter(c=> SC.measured(c) && !c.pool && c.attack != null && c.health != null).forEach(d=>{ const w0 = 2 * (d.attack || 0) + (d.health || 0); if(w0 <= 0) return; n++;
    const c = curveOf(d); for(let L = 1; L <= 11; L++){ const r = c.rows[Math.max(L, c.from)]; (acc[L] = acc[L] || []).push((2 * r.attack + r.health) / w0 - 1); } });
  const table = Object.keys(acc).map(L=> [Math.round(acc[L].reduce((a, b)=> a + b, 0) / acc[L].length * 1000) / 1000, +L]);
  console.log(n, 'cards; FORGE_MEAN_GAIN =', JSON.stringify(table));
} else if(cmd === 'cards'){
  (process.argv[3] || '').split(',').filter(Boolean).forEach(id=>{ const d = CARDS.find(c=> c.id === id); if(!d){ console.log('no card', id); return; }
    const c = curveOf(d); console.log(`${d.name} (${d.rarity}, Wait ${d.wait || 0}, Lumber ${d.cost || 0}; Base ${c.base}, starts Lv ${c.from}${c.m !== 1 ? ', half-miss x' + c.m : ''})`);
    Object.entries(c.rows).forEach(([L, r])=> console.log(`  Lv ${String(L).padStart(2)} ${String(r.kind).padEnd(5)} N ${String(r.N).padEnd(6)} ${r.attack}/${r.health}${r.points ? '  +' + r.points : ''}`)); });
}
