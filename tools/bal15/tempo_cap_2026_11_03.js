#!/usr/bin/env node
// 2026-11-03 (package BAL15, DEC1 / BAL12-3: "measure the tempo cap at bramble 15 for 0-Lumber, Wait 0-1 Rares, and record whether cap 1 or cap 2
// should carry it"; budget only, no re-fit, owner 11-03 09:39). Reads the bramble-15 contribution run (tools/bench/bench.js contrib --bramble 15,
// docs/balance/bal15/run.sh) the way tools/bal12/tempo_cap2_2026_11_02.js pool reads one: T (Rare+, Lumber 0, Wait <= 1) minus R (Rare+ that pay
// Lumber or wait 2+), in stat points a copy (the stat yardstick at 15 Health) over T's mean 3A + H = the share f of the body the tempo term is worth.
// Then, for every in-play T card at the current prices (tools/skill2_refit_2026_10_31.js verdict, the refit's view):
//   cap 2 at (1 - f)^2 (the BAL12 form): which cards it limits (cap-2 use over 1);
//   cap 1 at N x (1 - f) (the term moved to cap 1): which cards it puts over (cap-1 use over 1 - f).
//   node tools/bal15/tempo_cap_2026_11_03.js <bench-contrib json>   -> docs/balance/bal15/tempo-cap-2026-11-03.json (+ .md)
'use strict';
process.env.SKILL2_MISSMULT = process.env.SKILL2_MISSMULT || '1';
process.env.SKILL2_NO_NAMED = '1';
const fs = require('fs'), path = require('path');
const ROOT = path.join(__dirname, '..', '..');
const BB = require(path.join(ROOT, 'bramblewood-budget.js'));
const quiet = f => { const log = console.log; console.log = () => {}; try { return f(); } finally { console.log = log; } };
const R = quiet(() => require('../skill2_refit_2026_10_31.js')), LB = require('../lib_bramble.js'), LP = require('../lib_map_pools.js');
const file = process.argv[2]; if (!file) { console.error('usage: tempo_cap_2026_11_03.js <bench-contrib json>'); process.exit(2); }
const cards = JSON.parse(fs.readFileSync(path.join(ROOT, 'canonical', 'cards.json'), 'utf8')), by = {}; cards.forEach(c => { by[c.id] = c; });
const rank = c => BB.rankOf(c.rarity), RARE = BB.LADDER.indexOf('rare');
const groupOf = c => { const L0 = (+c.cost || 0) === 0, W = +c.wait || 0;
  if (rank(c) >= RARE && L0 && W <= 1) return 'T'; if (rank(c) < RARE && L0 && W <= 1) return 'C'; if (rank(c) >= RARE) return 'R'; return 'O'; };
const r3 = v => Math.round(v * 1000) / 1000, r2 = v => Math.round(v * 100) / 100;
// the measure
const res = JSON.parse(fs.readFileSync(file, 'utf8')), g = {};
res.cards.forEach(r => { const c = by[r.id]; if (!c) return; (g[groupOf(c)] = g[groupOf(c)] || []).push(r); });
const k = res.context.copies || 6;
const st = rows => { const n = rows.length, m = rows.reduce((t, r) => t + r.vsFair, 0) / n, own = Math.sqrt(rows.reduce((t, r) => t + (r.se / k) ** 2, 0)) / n,
  sp = n > 1 ? Math.sqrt(rows.reduce((t, r) => t + (r.vsFair - m) ** 2, 0) / (n - 1) / n) : own; return { n, m, se: Math.max(own, sp) }; };
// the stat yardstick a copy at 15 Health: 3.00 win-rate points for 6 copies a 3A + H point (tools/bal12/tempo_cap2_2026_11_02.js pool; docs/balance/bal12/)
const yard = (/-b15/.test(res.context.name || '') ? 0.0300 : 0.0359) / k, pts = rows => rows.reduce((t, r) => t + 3 * (+r.attack || 0) + (+r.health || 0), 0) / rows.length;
const T = st(g.T), Rr = st(g.R), C = g.C ? st(g.C) : null, d = T.m - Rr.m, se = Math.sqrt(T.se ** 2 + Rr.se ** 2), TP = pts(g.T);
const f = d / yard / TP, fse = se / yard / TP, flo = f - 1.96 * fse, fhi = f + 1.96 * fse;
const measure = { from: path.relative(ROOT, file), context: res.context.name, fights: res.context.fights, copies: k, fairLine: res.fairLine,
  T: { n: T.n, vsFair: r3(T.m * 100), se: r3(T.se * 100), statPoints: r2(TP), cards: g.T.map(r => r.id) }, R: { n: Rr.n, vsFair: r3(Rr.m * 100), se: r3(Rr.se * 100) },
  C: C ? { n: C.n, vsFair: r3(C.m * 100), se: r3(C.se * 100) } : null, excessPoints: r2(d / yard), share: r3(f), shareSE: r3(fse), shareLo: r3(flo), shareHi: r3(fhi), z: r2(f / fse),
  cap2Tighter: r3(1 - (1 - f) ** 2), cap2TighterLo: r3(1 - (1 - Math.max(0, flo)) ** 2), cap2TighterHi: r3(1 - (1 - fhi) ** 2) };
// the in-play T cards at today's prices
const D = LB.CARD_DEFS_BASELINE, rows = [];
for (const c of cards) { const dd = D[c.id]; if (!dd || c.pool || c.token || c.test || c.health == null || LP.isOutOfPlay(LB.G, dd) || /^egg-/.test(c.id)) continue;
  if (groupOf(c) !== 'T') continue; const v = R.verdict(R.NEW, c), now = BB.tempoCap2Mult(c);
  const cap2At = m => r2(v.cap2 * now / m); // v.cap2 = x2 / (cap2Limit x the current tempo mult)
  rows.push({ id: c.id, name: c.name, rarity: c.rarity, wait: c.wait || 0, stats: `${c.attack}/${c.health}`, use: v.use, cap2Now: v.cap2, verdictNow: v.over ? 'over' : v.under ? 'under' : 'in band',
    cap2NoTerm: cap2At(1), cap2AtShare: cap2At((1 - Math.max(0, f)) ** 2), cap1Limit: r3(1 - Math.max(0, f)), overOnCap1: v.use > 1 - Math.max(0, f) + 1e-9, overOnCap1Hi: v.use > 1 - Math.max(0, fhi) + 1e-9 }); }
const out = { tool: 'tools/bal15/tempo_cap_2026_11_03.js', built: '2026-11-03', measure, cards: rows,
  cap2Limits: rows.filter(r => r.cap2AtShare > 1).map(r => r.id), cap1Over: rows.filter(r => r.overOnCap1).map(r => r.id), cap1OverAtHi: rows.filter(r => r.overOnCap1Hi).map(r => r.id) };
const fo = path.join(ROOT, 'docs', 'balance', 'bal15', 'tempo-cap-2026-11-03.json'); fs.mkdirSync(path.dirname(fo), { recursive: true }); fs.writeFileSync(fo, JSON.stringify(out, null, 1) + '\n');
const md = ['# The tempo term of a 0-Lumber, Wait 0-1 Rare at bramble 15 (BAL15, 2026-11-03)', '',
  `From \`${measure.from}\` (${measure.context}, ${measure.fights} fights a card, ${k} copies). T = Rare+, Lumber 0, Wait <= 1; R = Rare+ that pay Lumber or wait 2+; C = Common / Uncommon at Lumber 0, Wait 0-1 (control).`, '',
  '| Group | Cards | Mean vs fair line (win-rate points a copy) | se |', '|---|---|---|---|',
  `| T | ${T.n} | ${measure.T.vsFair} | ${measure.T.se} |`, `| R | ${Rr.n} | ${measure.R.vsFair} | ${measure.R.se} |`, C ? `| C | ${C.n} | ${measure.C.vsFair} | ${measure.C.se} |` : '', '',
  `T minus R: ${r2(d / yard)} stat points a copy of T's ${r2(TP)} (3A + H): a share **${measure.share}** [${measure.shareLo}, ${measure.shareHi}] (z ${measure.z}); as cap 2 tighter by ${measure.cap2Tighter} [${measure.cap2TighterLo}, ${measure.cap2TighterHi}] (today x${BB.TEMPO_CAP2_MULT}).`, '',
  '## The in-play T cards at today\'s prices', '', '| Card | Rarity | Wait | A/H | cap-1 use | verdict now | cap-2 use now | cap-2 use at the measured share | over on cap 1 at N x (1 - share) | over at the upper bound |', '|---|---|---|---|---|---|---|---|---|---|',
  ...rows.map(r => `| ${r.name} | ${r.rarity} | ${r.wait} | ${r.stats} | ${r.use} | ${r.verdictNow} | ${r.cap2Now} | ${r.cap2AtShare} | ${r.overOnCap1 ? 'OVER' : ''} | ${r.overOnCap1Hi ? 'OVER' : ''} |`), '',
  `Cap 2 at the measured share limits ${out.cap2Limits.length} card(s)${out.cap2Limits.length ? ': ' + out.cap2Limits.join(', ') : ''}. Cap 1 at N x ${r3(1 - Math.max(0, f))} puts ${out.cap1Over.length} over${out.cap1Over.length ? ': ' + out.cap1Over.join(', ') : ''} (at the upper bound ${out.cap1OverAtHi.length}).`, ''];
fs.writeFileSync(fo.replace(/\.json$/, '.md'), md.filter(x => x !== null).join('\n'));
console.log(`T ${T.n} vs fair ${measure.T.vsFair}  R ${Rr.n} ${measure.R.vsFair}  share ${measure.share} [${measure.shareLo}, ${measure.shareHi}] z ${measure.z}`);
console.log(`cap 2 limits: ${out.cap2Limits.join(', ') || 'none'}; cap 1 over: ${out.cap1Over.join(', ') || 'none'} (upper bound ${out.cap1OverAtHi.length})`);
console.log('->', path.relative(ROOT, fo));
