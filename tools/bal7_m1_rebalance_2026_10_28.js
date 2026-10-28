#!/usr/bin/env node
// Package BAL7 (2026-10-28, M1: "Re-balance the contribution outliers ... by the formula and the measured contribution"): the cards whose
// contribution (tools/balance/contribution.js) sits 8+ points from their rarity band's median get stats taken off (too strong) or added (too
// weak), shape (Attack : Health) and rarity kept.
//   1. How many contribution points a stat point is worth: a least-squares fit over every measured card of its per-copy effect on its stat
//      weight w = 2A + H + 0.8 x Shield (the budget's cap-1 stat term), its skills' S (tools/skill_costs.js), its Lumber and its rarity band
//      (one intercept each). kW = the per-copy points one point of w buys.
//   2. Per outlier: the change that brings it to 3 points from its band's median, dW = -(vsBand -+ 0.03) / (meanCopies x kW), graded and
//      capped (see below; identity kept).
//   3. The stats: the card's own shape scanned (the FIN2 / BAL2 line search) for the line whose w is nearest w + dW, on the right side of
//      today's stats; a stronger line must hold both budget caps at Level 1 and its start level (bramblewood-budget.js, the formula); a too-weak
//      card already on its budget line gets what the formula leaves (maybe nothing: reported). A weaker line always holds the caps.
// Not touched: tokens, tests, cards with no stats, the owner's beginner card (Tide Pool Crab, FIN2-c), skirmish decks.
//   node tools/bal7_m1_rebalance_2026_10_28.js --from docs/balance/contribution-<tag>.json [--min 0.08] [apply]
//   -> docs/balance/bal7-m1-rebalance-2026-10-28.json (every card: old -> new, w, the fit)
'use strict';
const fs = require('fs'), path = require('path'), ROOT = path.join(__dirname, '..');
const SC = require('./skill_costs.js');
const argv = process.argv.slice(2), opt = (k, d)=>{ const i = argv.indexOf('--' + k); return i >= 0 ? argv[i + 1] : d; };
const FROM = path.resolve(ROOT, opt('from', '')), MIN = +opt('min', 0.08), TO_GAP = 0.03, MAXFRAC = 0.3;
const OUT = path.join(ROOT, 'docs', 'balance', 'bal7-m1-rebalance-2026-10-28.json');
const table = JSON.parse(fs.readFileSync(path.join(ROOT, 'canonical', 'skill-costs.json'), 'utf8')), T = SC.make(table);
const SPH = +table.budget.shieldPerHealth || 0.8;
const CARDS = path.join(ROOT, 'canonical', 'cards.json'), cards = JSON.parse(fs.readFileSync(CARDS, 'utf8')), byId = Object.fromEntries(cards.map(c=> [c.id, c]));
const A = JSON.parse(fs.readFileSync(FROM, 'utf8')).analysis;
const SKIP = new Set(['tide-pool-crab']);
const shOf = c=>{ const v = c.effects && c.effects.shield; return !v ? 0 : v === true ? 1 : +v || 0; };
const wOf = (c, a, h)=> 2 * (a == null ? (c.attack || 0) : a) + (h == null ? c.health : h) + SPH * shOf(c);
const sOf = c=>{ try{ return T.budget(c).S || 0; }catch(e){ return 0; } };
// ---- 1. the fit
const BANDS = Object.keys(A.bands), rows = A.cards.filter(r=> byId[r.id] && byId[r.id].health != null);
const X = rows.map(r=>{ const c = byId[r.id]; return [wOf(c), sOf(c), c.cost || 0].concat(BANDS.map(b=> r.band === b ? 1 : 0)); }), Y = rows.map(r=> r.perCopy);
function lstsq(X, Y){ const p = X[0].length, M = Array.from({length: p}, ()=> new Array(p + 1).fill(0));
  X.forEach((x, i)=>{ for(let a = 0; a < p; a++){ for(let b = 0; b < p; b++) M[a][b] += x[a] * x[b]; M[a][p] += x[a] * Y[i]; } });
  for(let a = 0; a < p; a++) M[a][a] += 1e-9;
  for(let c = 0; c < p; c++){ let piv = c; for(let r = c + 1; r < p; r++) if(Math.abs(M[r][c]) > Math.abs(M[piv][c])) piv = r; [M[c], M[piv]] = [M[piv], M[c]];
    for(let r = 0; r < p; r++){ if(r === c) continue; const f = M[r][c] / M[c][c]; for(let k = c; k <= p; k++) M[r][k] -= f * M[c][k]; } }
  return M.map((r, i)=> r[p] / r[i]); }
const beta = lstsq(X, Y), kW = beta[0], kS = beta[1], kL = beta[2];
const resid = Y.map((y, i)=> y - X[i].reduce((a, x, j)=> a + x * beta[j], 0)), r2 = 1 - resid.reduce((a, e)=> a + e * e, 0) / Y.reduce((a, y)=> a + (y - Y.reduce((s, v)=> s + v, 0) / Y.length) ** 2, 0);
console.log(`fit over ${rows.length} cards: per copy = ${kW.toFixed(4)} x w + ${kS.toFixed(4)} x S + ${kL.toFixed(4)} x Lumber + band; R^2 ${r2.toFixed(3)}`);
if(!(kW > 0)) throw new Error('the fit gives no positive worth to a stat point');
// ---- 2-3. the outliers
// The fit (kW, a stat point is worth about 0.2 win-rate points a copy) says stats alone cannot close a 10-17 point gap without gutting the
// card, so the size of a move is graded by the gap and capped (identity kept): frac = min(MAXFRAC, 0.02 x the gap in points) of w (8 points:
// 16%, 12: 24%, 15+: 30%), never more than the fit asks for; a too-strong card 12+ points over whose skills include a numbered one at 2 or more
// (Spitfire 2, Twin Shot 2, Pack 2 ...) also loses one level of it (the dearest such skill by its S), the owner's "or a skill level".
function use(c, a, h, eff){ const d = Object.assign({}, c, {attack: a, health: h}, eff ? {effects: eff} : {}), lv = SC.levelOf(c), b1 = T.budget(d, {level: 1}), bs = lv === 1 ? b1 : T.budget(d, {level: lv});
  return b1.ok && bs.ok && b1.x1 / b1.N <= 1 ? b1.x1 / b1.N : 0; }
function lines(c){ const sA = c.attack || 0, sH = Math.max(1, c.health), out = [], seen = new Set();
  for(let k = 0.3; k <= 2.5; k += 0.01){ const a = sA === 0 ? 0 : Math.max(1, Math.round(sA * k)), h = Math.max(1, Math.round(sH * k)), key = a + '/' + h; if(seen.has(key)) continue; seen.add(key); out.push({a, h, w: wOf(c, a, h)}); }
  return out; }
// special cards whose weakness in random decks is their design (they grow, hatch or need a partner), not their stats
const SPECIAL = c=>{ const e = c.effects || {}; return /^egg-/.test(c.id) || e.chrysalis || e.evoluteAlpha || e.evolute || e.moonborn || e.stem || c.cardType; };
const NO_LEVEL = new Set(['throng', 'fireball', 'weakness', 'nocturnalHp', 'diurnalHp']);
function skillCut(c){ const e = c.effects || {}; let parts = []; try{ parts = T.budget(c).parts || []; }catch(err){}
  const cost = k=> (parts.find(p=> p[1] === k) || [0, 0, 0])[2] || 0;
  const cand = Object.entries(e).filter(([k, v])=> typeof v === 'number' && v >= 2 && v <= 6 && !NO_LEVEL.has(k)).sort((a, b)=> cost(b[0]) - cost(a[0]) || (a[0] < b[0] ? -1 : 1));
  return cand.length ? {key: cand[0][0], from: cand[0][1], to: cand[0][1] - 1} : null; }
const plan = [];
for(const r of A.cards){
  if(Math.abs(r.vsBand) < MIN) continue;
  const c = byId[r.id]; const base = {id: r.id, name: r.name, rarity: r.rarity, band: r.band, contribution: r.contribution, vsBand: r.vsBand, z: r.z, meanCopies: r.meanCopies};
  if(!c || c.health == null || c.token || c.test || SKIP.has(r.id) || SPECIAL(c)){ plan.push(Object.assign(base, {move: null, why: !c ? 'not in cards.json' : SKIP.has(r.id) ? 'the owner\'s beginner card' : SPECIAL(c) ? 'a card that hatches, grows or evolves: its design, not its stats' : 'no stats'})); continue; }
  const strong = r.vsBand > 0, gapPts = Math.abs(r.vsBand) * 100, want = -(r.vsBand - (strong ? TO_GAP : -TO_GAP)), w0 = wOf(c);
  const fitW = Math.abs(want / (Math.max(1, r.meanCopies) * kW)), frac = Math.min(MAXFRAC, 0.02 * gapPts), dWabs = Math.min(fitW, frac * w0), target = w0 + (strong ? -dWabs : dWabs);
  const sk = strong && gapPts >= 12 ? skillCut(c) : null, eff = sk ? Object.assign({}, c.effects, {[sk.key]: sk.to}) : null;
  const a0 = c.attack || 0, h0 = c.health;
  const cand = lines(c).filter(x=> strong ? x.w < w0 : x.w > w0).filter(x=> strong || use(c, x.a, x.h) > 0);
  if(!cand.length && !sk){ plan.push(Object.assign(base, {from: `${a0}/${h0}`, move: null, w: w0, why: strong ? 'no smaller line' : 'on its budget line: the formula leaves no room'})); continue; }
  const best = cand.length ? cand.reduce((b, x)=> !b || Math.abs(x.w - target) < Math.abs(b.w - target) ? x : b, null) : {a: a0, h: h0, w: w0};
  const limited = !strong && best.w < target - 1;
  plan.push(Object.assign(base, {from: `${a0}/${h0}`, to: `${best.a}/${best.h}`, A: best.a, H: best.h, skill: sk, move: strong ? 'down' : 'up', w: w0, wNew: best.w, frac: Math.round(frac * 100) / 100, fitW: Math.round(fitW * 10) / 10,
    budgetLimited: limited, use: Math.round(use(c, best.a, best.h, eff) * 100) || null}));
}
const moves = plan.filter(p=> p.move);
console.log(`${plan.length} outliers (|vs band| >= ${MIN * 100} points): ${moves.filter(p=> p.move === 'down').length} down, ${moves.filter(p=> p.move === 'up').length} up, ${plan.length - moves.length} not moved`);
plan.sort((a, b)=> b.vsBand - a.vsBand).forEach(p=> console.log(`  ${(p.move || '-').padEnd(4)} ${p.id.padEnd(26)} ${p.rarity.padEnd(9)} vs band ${(p.vsBand * 100).toFixed(1).padStart(5)}  ${p.from || ''} -> ${p.to || '(kept: ' + p.why + ')'}${p.skill ? ' + ' + p.skill.key + ' ' + p.skill.from + ' -> ' + p.skill.to : ''}${p.budgetLimited ? ' (budget line)' : ''}`));
const report = {_about: 'Package BAL7 (2026-10-28, M1): contribution outliers re-balanced by the formula and the measured contribution. node tools/bal7_m1_rebalance_2026_10_28.js --from ' + path.relative(ROOT, FROM),
  fit: {cards: rows.length, kW, kS, kL, r2, note: 'per copy (win-rate fraction) = kW x (2A + H + 0.8 Sh) + kS x S + kL x Lumber + band intercept'}, min: MIN, toGap: TO_GAP, maxFrac: MAXFRAC, plan};
if(argv.includes('apply')){
  for(const m of moves){ const c = byId[m.id]; if(c.attack != null || m.A !== 0) c.attack = m.A; c.health = m.H; if(m.skill) c.effects[m.skill.key] = m.skill.to;
    c.creatorNote = (c.creatorNote ? c.creatorNote + ' ' : '') + `2026-10-28 BAL7 M1 re-balance (contribution ${(m.contribution * 100).toFixed(1)}, ${(m.vsBand * 100 >= 0 ? '+' : '') + (m.vsBand * 100).toFixed(1)} vs its band): ${m.from} -> ${m.to}${m.skill ? ', ' + m.skill.key + ' ' + m.skill.from + ' -> ' + m.skill.to : ''}.`; }
  fs.writeFileSync(CARDS, JSON.stringify(cards, null, 2).replace(/[\u007f-￿]/g, ch=> '\\u' + ch.charCodeAt(0).toString(16).padStart(4, '0')) + '\n');
  report.applied = new Date().toISOString();
  console.log('applied', moves.length);
}
fs.writeFileSync(OUT, JSON.stringify(report, null, 1) + '\n');
