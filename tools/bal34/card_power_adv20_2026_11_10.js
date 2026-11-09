#!/usr/bin/env node
// 2026-11-10 (package BAL34, decision BAL25-1 b, owner 11-09 23:05: "decision that maximised deck power"): BAL25's card power v3 with the
// advanced opponent at 20 top-40% cards (the strongest decks; was 5 top-40% + 15 from every card). The run itself:
//   node tools/card_balance.js --v3 --resume [--workers=K]   (the basic pass is kept: only the advanced settings changed; same seeds, same pool)
// This script compares the new docs/balance/bal25/card-power.json with BAL25's (the file at git <rev>, default e958d6b8): the advanced
// median, the fit, and the card-power ranking (power = mean of basic and advanced): Spearman rho, the biggest rank moves, the top / bottom 10.
// Writes docs/balance/bal34/card-power-adv20-2026-11-10.json and adds the full-run row to docs/balance/bal25/adv-calibration-2026-11-07.json.
//   node tools/bal34/card_power_adv20_2026_11_10.js [rev]
'use strict';
const fs = require('fs'), path = require('path'), cp = require('child_process');
const ROOT = path.join(__dirname, '..', '..'), REV = process.argv[2] || 'e958d6b8';
const NOW = JSON.parse(fs.readFileSync(path.join(ROOT, 'docs/balance/bal25/card-power.json'), 'utf8'));
const OLD = JSON.parse(cp.execFileSync('git', ['show', REV + ':docs/balance/bal25/card-power.json'], {cwd: ROOT, maxBuffer: 1 << 26}).toString());
const median = a=>{ const s = a.filter(Number.isFinite).sort((x, y)=> x - y), n = s.length; return n ? (n % 2 ? s[(n - 1) / 2] : (s[n / 2 - 1] + s[n / 2]) / 2) : null; };
const mean = a=>{ const s = a.filter(Number.isFinite); return s.length ? s.reduce((t, v)=> t + v, 0) / s.length : null; };
const r1 = v=> v == null ? null : Math.round(v * 10) / 10, r3 = v=> v == null ? null : Math.round(v * 1000) / 1000;
const byOld = {}; OLD.rows.forEach(r=> byOld[r.id] = r);
const rows = NOW.rows.filter(r=> byOld[r.id] && Number.isFinite(r.advRate) && Number.isFinite(byOld[r.id].advRate));
const rank = (list, key)=>{ const s = list.slice().sort((a, b)=> b[key] - a[key] || (a.id < b.id ? -1 : 1)), out = {}; s.forEach((r, i)=> out[r.id] = i + 1); return out; };
const pts = rows.map(r=> ({id: r.id, name: r.name, map: r.map, rarity: r.rarity, basic: r.winRate, adv5: byOld[r.id].advRate, adv20: r.advRate,
  power5: byOld[r.id].power, power20: r.power, N: r.N, forBudget5: byOld[r.id].forBudget, forBudget20: r.forBudget}));
const rP5 = rank(pts, 'power5'), rP20 = rank(pts, 'power20'), rA5 = rank(pts, 'adv5'), rA20 = rank(pts, 'adv20');
const rho = (ra, rb)=>{ const n = pts.length; const d2 = pts.reduce((t, p)=> t + Math.pow(ra[p.id] - rb[p.id], 2), 0); return 1 - 6 * d2 / (n * (n * n - 1)); };
pts.forEach(p=>{ p.rank5 = rP5[p.id]; p.rank20 = rP20[p.id]; p.move = p.rank5 - p.rank20; p.advDelta = r1(p.adv20 - p.adv5); });
const movers = pts.slice().sort((a, b)=> Math.abs(b.move) - Math.abs(a.move) || (a.id < b.id ? -1 : 1));
const top = (k, n)=> pts.slice().sort((a, b)=> a[k] - b[k]).slice(0, n).map(p=> p.id);
const quart = q=> pts.filter(p=> { const i = rank(pts, 'basic')[p.id] / pts.length; return i > q[0] && i <= q[1]; });
const byBasicQuarter = [[0, 0.25], [0.25, 0.5], [0.5, 0.75], [0.75, 1]].map(q=>{ const s = quart(q); return {basicRankShare: q.join('-'), cards: s.length, adv5: r1(mean(s.map(p=> p.adv5))), adv20: r1(mean(s.map(p=> p.adv20)))}; });
const out = {when: '2026-11-10', package: 'BAL34', decision: 'BAL25-1 b', advMix: NOW.advanced && NOW.advanced.poolCards,
  run: 'node tools/card_balance.js --v3 --resume (basic pass kept from BAL25, 2026-11-07; advanced pass re-played at 400 games a card, seed 2211, the same top-40% pool)',
  old: 'docs/balance/bal25/card-power.json at ' + REV + ' (5 top-40% + 15 from every card)', cards: pts.length,
  medians: {basic: r1(median(pts.map(p=> p.basic))), adv5: r1(median(pts.map(p=> p.adv5))), adv20: r1(median(pts.map(p=> p.adv20))), power5: r1(median(pts.map(p=> p.power5))), power20: r1(median(pts.map(p=> p.power20)))},
  means: {adv5: r1(mean(pts.map(p=> p.adv5))), adv20: r1(mean(pts.map(p=> p.adv20)))},
  fit: {old: OLD.fit && {a: OLD.fit.a, b: OLD.fit.b, r2: OLD.fit.r2, rmse: OLD.fit.rmse}, now: NOW.fit && {a: NOW.fit.a, b: NOW.fit.b, r2: NOW.fit.r2, rmse: NOW.fit.rmse}},
  spearman: {power: r3(rho(rP5, rP20)), adv: r3(rho(rA5, rA20))}, byBasicQuarter,
  top10: {old: top('rank5', 10), now: top('rank20', 10)}, bottom10: {old: pts.slice().sort((a, b)=> b.rank5 - a.rank5).slice(0, 10).map(p=> p.id), now: pts.slice().sort((a, b)=> b.rank20 - a.rank20).slice(0, 10).map(p=> p.id)},
  movers: movers.slice(0, 20), rows: pts.sort((a, b)=> a.rank20 - b.rank20)};
fs.mkdirSync(path.join(ROOT, 'docs/balance/bal34'), {recursive: true});
fs.writeFileSync(path.join(ROOT, 'docs/balance/bal34/card-power-adv20-2026-11-10.json'), JSON.stringify(out, null, 1) + '\n');
const calF = path.join(ROOT, 'docs/balance/bal25/adv-calibration-2026-11-07.json'), cal = JSON.parse(fs.readFileSync(calF, 'utf8'));
cal.rows = cal.rows.filter(r=> !/BAL25-1 b/.test(r.opponent));
cal.rows.push({opponent: '20 cards from the top 40% (BAL25-1 b, owner 11-09 23:05; full run, BAL34 2026-11-10)', cards: pts.length, games: NOW.games, advMedian: out.medians.adv20, advMean: out.means.adv20});
fs.writeFileSync(calF, JSON.stringify(cal, null, 1) + '\n');
console.log('medians', JSON.stringify(out.medians), 'spearman', JSON.stringify(out.spearman), 'fit', JSON.stringify(out.fit));
console.log('by basic quarter', JSON.stringify(byBasicQuarter));
console.log('top 10 now', out.top10.now.join(', ')); console.log('top 10 old', out.top10.old.join(', '));
movers.slice(0, 12).forEach(p=> console.log(`  ${p.name.padEnd(26)} rank ${p.rank5} -> ${p.rank20} (adv ${p.adv5} -> ${p.adv20}, basic ${p.basic})`));
