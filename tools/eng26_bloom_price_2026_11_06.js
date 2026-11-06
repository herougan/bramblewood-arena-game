#!/usr/bin/env node
// 2026-11-06 (package ENG26, owner 09:29 #3: "Bloom +1/+1 grows stronger"): what the escalating Bloom would do to the cards' budget use.
// Bloom – {conditions} is priced by bramblewood-budget.js (CONTEXT.bloomCopy: the copy's +1/+1 x the chain odds p(1 + q + q^2), at
// CONTEXT_MULT_BY.bloomCopy = 1, plus the body multiplier), not by its skill-costs.json value (0). With the Nth copy at +N/+N the expected
// bonus is p(1 + 2q + 3q^2) for one Bloom card: x (1 + 2q + 3q^2) / (1 + q + q^2) = 1.50 at q 0.43 (more with several Bloom cards, which
// share the count). This tool sets CONTEXT_MULT_BY.bloomCopy in memory only (to --mult, default that formula ratio) and lists every card whose
// budget use moves, by tools/skill_costs.js (cap 1: x1 / N). It writes nothing: the price change is one line of bramblewood-budget.js
// (decision ENG26-3).
//   node tools/eng26_bloom_price_2026_11_06.js [--mult 1.5]
'use strict';
const fs = require('fs'), path = require('path');
const ROOT = path.join(__dirname, '..');
const BB = require(path.join(ROOT, 'bramblewood-budget.js')), SC = require(path.join(ROOT, 'tools', 'skill_costs.js'));
const a = process.argv.slice(2), arg = (k, d) => { const i = a.indexOf(k); return i >= 0 ? a[i + 1] : d; };
const q = BB.BLOOM_CHAIN_Q, ratio = Math.round((1 + 2 * q + 3 * q * q) / (1 + q + q * q) * 100) / 100;
const M = +arg('--mult', ratio);
const T = SC.make(JSON.parse(fs.readFileSync(path.join(ROOT, 'canonical/skill-costs.json'), 'utf8')));
const cards = JSON.parse(fs.readFileSync(path.join(ROOT, 'canonical/cards.json'), 'utf8')).filter(c => c.effects && c.effects.bloomCopy);
const use = c => { const b = T.budget(c, {}); return b && b.N > 0 ? { u: 100 * b.x1 / b.N, S: b.S || 0 } : null; };
const was = BB.CONTEXT_MULT_BY.bloomCopy, before = cards.map(use);
BB.CONTEXT_MULT_BY.bloomCopy = M; const after = cards.map(use); BB.CONTEXT_MULT_BY.bloomCopy = was;
console.log(`q ${q}; formula ratio ${ratio}; mult used ${M}`);
cards.forEach((c, i) => { const b = before[i], f = after[i]; if (!b || !f) return;
  console.log(`${c.id.padEnd(22)} ${c.test ? '(test) ' : ''}${JSON.stringify(c.effects.bloomCopy.when)}${c.effects.bloomCopy.lumber ? ' +' + c.effects.bloomCopy.lumber + ' Lumber' : ''}  use ${Math.round(b.u)}% -> ${Math.round(f.u)}%  S ${b.S.toFixed(2)} -> ${f.S.toFixed(2)}`); });
