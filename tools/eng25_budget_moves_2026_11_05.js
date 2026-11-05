#!/usr/bin/env node
// ENG25 (2026-11-05): which cards' budget use moved, before (git HEAD: cards.json + skill-costs.json) vs now, by tools/skill_costs.js
// (cap 1: x1 / N at the card's budget level). No card or price is written.
//   node tools/eng25_budget_moves_2026_11_05.js [ref=HEAD]
'use strict';
const fs = require('fs'), path = require('path'), cp = require('child_process');
const ROOT = path.join(__dirname, '..'), SC = require(path.join(ROOT, 'tools', 'skill_costs.js'));
const ref = process.argv[2] || 'HEAD';
const at = f=> JSON.parse(cp.execFileSync('git', ['show', ref + ':' + f], {cwd: ROOT, maxBuffer: 1 << 28}).toString());
const now = f=> JSON.parse(fs.readFileSync(path.join(ROOT, f), 'utf8'));
const T0 = SC.make(at('canonical/skill-costs.json')), T1 = SC.make(now('canonical/skill-costs.json'));
const c0 = Object.fromEntries(at('canonical/cards.json').map(c=> [c.id, c])), c1 = now('canonical/cards.json');
const rows = [];
c1.forEach(c=>{ if(c.token || c.test || c.pool) return; const o = c0[c.id]; if(!o) return;
  const b0 = T0.budget(o, {}), b1 = T1.budget(c, {}); if(!(b0 && b1 && b0.N > 0 && b1.N > 0)) return;
  const u0 = 100 * b0.x1 / b0.N, u1 = 100 * b1.x1 / b1.N; if(Math.abs(u1 - u0) >= 0.5) rows.push({id: c.id, u0: Math.round(u0), u1: Math.round(u1), d: Math.round(u1 - u0), S0: +(b0.S || 0).toFixed(2), S1: +(b1.S || 0).toFixed(2)}); });
rows.sort((a, b)=> Math.abs(b.d) - Math.abs(a.d) || (a.id < b.id ? -1 : 1));
rows.forEach(r=> console.log(`${r.id.padEnd(28)} use ${r.u0}% -> ${r.u1}% (${r.d > 0 ? '+' : ''}${r.d})  S ${r.S0} -> ${r.S1}`));
console.log(rows.length + ' cards moved by 0.5 points or more');
