#!/usr/bin/env node
// Package BAL23 (2026-11-07): the skill ladder's plan and curves (tools/skill_ladder_2026_11_07.js). No games are played.
//   1. the plan: Maps 0-20 cards, a numbered skill at N = 1.. capped at 4, Shield at 2 / 4 / 6, an on/off skill once, Twin Strike in,
//      every point priced by the cost table, a sane size; 25 pairs of skills that share a card, each on its skills' ladders.
//   2. the bodies: every Attack / Health spread at 3A + H = budget (A >= 1, H >= 1); more than 8: 8, seeded, Attack 1 and the most kept.
//   3. the curve fit on synthetic data: the quadratic's maximum (inside the range, at an edge, a line), value x N^pow recovered.
//   node tests/bal23-2026-11-07.js
'use strict';
const path = require('path'), fs = require('fs');
const ROOT = path.join(__dirname, '..');
const S = require(path.join(ROOT, 'tools', 'skill_ladder_2026_11_07.js'));
let fail = 0, pass = 0; const ok = (c, m) => { if (c) pass++; else { fail++; console.log('  ✗ ' + m); } };
const near = (a, b, e) => Math.abs(a - b) <= (e || 1e-6);

// ---- 1. the plan ----
const p = S.planOf(), table = JSON.parse(fs.readFileSync(path.join(ROOT, 'canonical', 'skill-costs.json'), 'utf8')), priced = new Set(table.skills.map(e => e.id));
ok(p.cards > 100, 'plan: Maps 0-20 hold ' + p.cards + ' cards');
ok(p.items.length >= 150 && p.items.length <= 400, 'plan: ' + p.items.length + ' points a level (150-400 expected)');
ok(p.items.every(x => x.n === true || (typeof x.n === 'number' && x.n >= 1 && (x.key === 'shield' || x.n <= S.CAP))), 'plan: a numbered point above the cap of ' + S.CAP);
ok(S.CAP === 4, 'plan: the cap is 4');
const sh = p.items.filter(x => x.key === 'shield').map(x => x.n);
ok(JSON.stringify(sh) === '[2,4,6]', 'plan: Shield at 2, 4, 6 (got ' + JSON.stringify(sh) + ')');
ok(p.items.some(x => x.key === 'twinStrike' && x.n === true), 'plan: Twin Strike in');
const keys = [...new Set(p.items.map(x => x.key))];
ok(keys.every(k => priced.has(k)), 'plan: every skill is in canonical/skill-costs.json');
ok(keys.every(k => { const ns = p.items.filter(x => x.key === k).map(x => x.n); return ns.length === new Set(ns).size && (ns[0] === true ? ns.length === 1 : k === 'shield' || (ns[0] === 1 && ns.length >= 2 && ns.every((n, i) => n === i + 1))); }), 'plan: a ladder is 1..N (2 or more) or one on/off point');
['armor', 'poison'].forEach(k => ok(JSON.stringify(p.items.filter(x => x.key === k).map(x => x.n)) === '[1,2,3,4]', 'plan: ' + k + ' at 1-4'));
ok(p.items.some(x => x.key === 'flying' && x.n === true), 'plan: Flying once');
ok(p.pairs.length === 25, 'plan: 25 pairs (got ' + p.pairs.length + ')');
ok(p.pairs.every(pr => pr.cards >= 1 && pr.a.key < pr.b.key && p.ladders[pr.a.key].includes(pr.a.n) && p.ladders[pr.b.key].includes(pr.b.n)), 'plan: every pair shares a card and sits on its skills\' ladders');
ok(S.onLadder('shield', 1, [2, 4, 6]) === 2 && S.onLadder('shield', 3, [2, 4, 6]) === 4 && S.onLadder('poison', 5, [1, 2, 3, 4]) === 4 && S.onLadder('flying', true, [true]) === true, 'plan: a card\'s number put on the ladder');
const only = S.planOf({ only: ['armor', 'poison'] });
ok(only.items.length === 8 && only.pairs.every(pr => ['armor', 'poison'].includes(pr.a.key) && ['armor', 'poison'].includes(pr.b.key)), 'plan: --only keeps its skills and their pairs');

// ---- 2. the bodies ----
const b23 = S.bodiesOf(23, 'armor', 8);
ok(b23.length === 7 && b23.every((b, i) => b.A === i + 1 && b.H === 23 - 3 * b.A && b.H >= 1 && near(b.x, 3 * b.A / 23)), 'bodies: budget 23 gives A 1..7, H = 23 - 3A');
const b40a = S.bodiesOf(40, 'armor', 8), b40b = S.bodiesOf(40, 'armor', 8), b40c = S.bodiesOf(40, 'twinStrike', 8);
ok(b40a.length === 8 && b40a[0].A === 1 && b40a[7].A === 13 && b40a.every(b => b.H === 40 - 3 * b.A && b.H >= 1), 'bodies: budget 40 draws 8 of 13, Attack 1 and 13 kept');
ok(JSON.stringify(b40a) === JSON.stringify(b40b), 'bodies: the draw is seeded');
ok(JSON.stringify(b40a) !== JSON.stringify(b40c), 'bodies: seeded per skill');

// ---- 3. the curves ----
const xs = [0.1, 0.2, 0.3, 0.4, 0.5, 0.6, 0.7], f = x => 4 - 20 * (x - 0.45) ** 2;
const Q = S.fitQuad(xs, xs.map(f));
ok(near(Q.xMax, 0.45, 1e-6) && near(Q.yMax, 4, 1e-6), 'curve: an inner maximum found (' + Q.xMax + ', ' + Q.yMax + ')');
const Q2 = S.fitQuad(xs, xs.map(x => 1 + 5 * x - x * x));
ok(near(Q2.xMax, 0.7) && near(Q2.yMax, 1 + 3.5 - 0.49, 1e-6), 'curve: rising inside the range: the maximum at the top edge');
const Q3 = S.fitQuad(xs, xs.map(x => 2 + 3 * (x - 0.35) ** 2));
ok(near(Q3.xMax, 0.7) && near(Q3.yMax, 2 + 0.3675, 1e-6), 'curve: a convex curve: the higher edge');
const Q4 = S.fitQuad([0.2, 0.6], [1, 3]);
ok(near(Q4.xMax, 0.6) && near(Q4.yMax, 3), 'curve: two points: a line');
// noise: the curve's maximum is nearer the truth than the raw best body (averaged over seeded noisy draws)
let rng = 7; const rnd = () => { rng = (rng * 1103515245 + 12345) & 0x7fffffff; return rng / 0x7fffffff; };
let eq = 0, er = 0; for (let t = 0; t < 400; t++) { const y = xs.map(x => f(x) + (rnd() - 0.5) * 2); eq += Math.abs(S.fitQuad(xs, y).yMax - 4); er += Math.abs(Math.max(...y) - 4); }
ok(eq < er, 'curve: the fitted maximum is less biased by noise than the raw best (' + (eq / 400).toFixed(2) + ' vs ' + (er / 400).toFixed(2) + ')');
const P = S.fitPow([1, 2, 3, 4].map(n => ({ n, m: 2.5 * Math.pow(n, 0.7), se: 0.2 })));
ok(P && near(P.value, 2.5, 0.01) && near(P.pow, 0.7, 0.01), 'curve: value x N^pow recovered (' + JSON.stringify(P) + ')');
const P2 = S.fitPow([2, 4, 6].map(n => ({ n, m: 3 * Math.pow(n, 0.5), se: 0.3 })).concat([{ n: true, m: 9 }]));
ok(P2 && near(P2.value, 3, 0.01) && near(P2.pow, 0.5, 0.01), 'curve: Shield-like points 2 / 4 / 6 (an on/off point ignored)');
ok(S.fitPow([{ n: 1, m: 2 }]) === null && S.fitPow([{ n: 1, m: 0 }, { n: 2, m: 0.01 }]) === null, 'curve: under two positive points, no fit');
// nothing is written to the cost table by the tool
ok(!/writeFileSync\([^)]*skill-costs/.test(fs.readFileSync(path.join(ROOT, 'tools', 'skill_ladder_2026_11_07.js'), 'utf8')), 'tool: never writes canonical/skill-costs.json');

console.log(`bal23: ${pass} passed, ${fail} failed`);
process.exit(fail ? 1 : 0);
