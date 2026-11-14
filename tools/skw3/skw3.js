#!/usr/bin/env node
// 2026-11-14 (package SKW3, study only; decision SKW2-1 default "measure a re-fit of cap 1 first"): what a cap 1 shaped like SKW2's
// measured exchange rate (w ≈ H/A, docs/balance/skw2/skw2-2026-11-14.md) would do to the live cards. No games are played; nothing in the game
// changes. The cap left sides are a LOCAL copy of bramblewood-budget.js capScores (checked against it card by card, `check` below), so the
// candidate forms never touch the budget file. S, m, f, N and the cap-2 limit come from tools/skill_costs.js as the game prices them.
//   node tools/skw3/skw3.js        writes docs/balance/skw3/skw3-2026-11-14.json and prints the tables the report quotes
// Forms (stat term T(A, He), He = H + 0.8 Shield; cap 1 is f × (T × m × k + S) ≤ N, cap 2 unchanged unless said):
//   today  3A + He
//   geo    c × sqrt((A + a0)(He + h0))      exchange rate (He + h0)/(A + a0); a0, h0 fitted to SKW2's uncensored rows, c to the mean card
//   prod   (A + a0)(He + h0) / q            the same exchange rate, degree 2 in the stats (the A·H/k idea), q to the mean card
//   cap2   cap 1 dropped, cap2Mult × λ      cap 2 binds alone, λ to the mean card
// "The mean card stays": the mean binding use over the live Maps 0-20 cards (cap 1 x1/N, cap 2 sqrt(x2/N2) so both read in stat scale) is
// today's. Live: tools/skill_costs.js measured, Health set, not a pool candidate, in play (tools/lib_map_pools.js isOutOfPlay). Over = a cap
// broken at the card's start level or at Level 1 (the BUDGET2 refit's verdict).
'use strict';
const fs = require('fs'), path = require('path');
const ROOT = path.join(__dirname, '..', '..');
const LB = require('../lib_bramble.js'), G = LB.G, D = LB.CARD_DEFS_BASELINE;
const LMP = require('../lib_map_pools.js');
const SC = require('../skill_costs.js');
const BB = require('../../bramblewood-budget.js');
const T = SC.make(JSON.parse(fs.readFileSync(path.join(ROOT, 'canonical', 'skill-costs.json'), 'utf8')));
const CARDS = JSON.parse(fs.readFileSync(path.join(ROOT, 'canonical', 'cards.json'), 'utf8'));
const OWNER = new Set((JSON.parse(fs.readFileSync(path.join(ROOT, 'tools', 'pipeline', 'config.json'), 'utf8')).refit || {}).ownerCards || []);
const SKW2 = JSON.parse(fs.readFileSync(path.join(ROOT, 'docs', 'balance', 'skw2', 'skw2-summary.json'), 'utf8'));
const OUT = path.join(ROOT, 'docs', 'balance', 'skw3', 'skw3-2026-11-14.json');
const CONTRIB = ['bench-contrib-global-b15-2026-11-03-bal15-tempo', 'bench-contrib-global-2026-10-30-inplay'];
const r2 = v=> Math.round(v * 100) / 100, r3 = v=> Math.round(v * 1000) / 1000;
const AW = BB.DEFAULTS.attackWeight, CAP2_LIMIT = (N, lam)=> BB.cap2Limit(N) * (lam || 1);

// ---- the local cap copy: the parts of one card at one level (A as tools/skill_costs.js budget counts it) ----
function parts(c, level){
  const b = T.budget(c, level == null ? undefined : {level}), d = BB.SPL ? BB.SPL.expandDef(c) : c, e = d.effects || {};
  const A = (e.archer && !(Number(e.archer) < 0)) ? 0 : (d.attack || 0) * (e.hibernate && BB.EN6_HIBERNATE_UPTIME ? 1 - BB.EN6_HIBERNATE_UPTIME : 1);
  const He = (d.health || 0) + BB.shieldHealthOf(e), k = BB.bloomBodyMult(e);
  return {A, He, S: b.S, m: b.m, f: b.f, k, N: b.N, N2: b.N2, x1: b.x1, x2: b.x2, tempo: b.N2 / BB.cap2Limit(b.N)};
}
const FORMS = {
  today: (p, P)=> AW * p.A + p.He,
  geo: (p, P)=> P.c * Math.sqrt((p.A + P.a0) * (p.He + P.h0)),
  prod: (p, P)=> (p.A + P.a0) * (p.He + P.h0) / P.q,
};
function x1Of(form, p, P){ return p.f * (FORMS[form](p, P) * p.m * p.k + p.S); }
function x2Of(p){ return p.f * (p.A * p.He * p.m + BB.cap2SOf(p.S)); }
function use2(p, lam){ const x2 = x2Of(p), L = p.N2 * (lam || 1); return x2 >= 0 ? Math.sqrt(x2 / L) : -Math.sqrt(-x2 / L); }
// {use1, use2, bind, over} under a form at one level
function judge(form, p, P){
  const u2 = use2(p, form === 'cap2' ? P.lam : 1);
  if(form === 'cap2') return {use1: null, use2: u2, bind: 'cap2', use: u2, over: u2 > 1 + 1e-9};
  const u1 = x1Of(form, p, P) / p.N; return {use1: u1, use2: u2, bind: u1 >= u2 ? 'cap1' : 'cap2', use: Math.max(u1, u2), over: u1 > 1 + 1e-9 || u2 > 1 + 1e-9};
}

// ---- the live cards ----
const live = [];
CARDS.forEach(c=>{
  const d = D[c.id]; if(!d || c.pool || c.token || c.test || !SC.measured(c) || c.health == null) return;
  if(LMP.isOutOfPlay(G, d)) return;
  let map = null; try{ const f = G.cardFirstMapList(d); map = f && f.n != null ? +f.n : null; }catch(e){}
  const p0 = parts(c), p1 = parts(c, 1);
  live.push({id: c.id, name: c.name, rarity: c.rarity || 'common', map, stats: `${c.attack == null ? '-' : c.attack}/${c.health}`, owner: OWNER.has(c.id), p0, p1});
});
// the local copy agrees with bramblewood-budget.js capScores on every card (else stop)
const bad = live.filter(r=> [r.p0, r.p1].some(p=> Math.abs(r2(x1Of('today', p)) - p.x1) > 0.02 || Math.abs(r2(x2Of(p)) - p.x2) > 0.02));
if(bad.length){ console.error('local cap copy disagrees with bramblewood-budget.js on', bad.map(r=> r.id).slice(0, 10)); process.exit(1); }
const road = live.filter(r=> r.map != null && r.map <= 20);
const verdict = (form, r, P)=>{ const a = judge(form, r.p0, P), b = judge(form, r.p1, P); return {use1: a.use1, use2: a.use2, bind: a.bind, use: a.use, over: a.over || b.over}; };
const meanUse = (form, P, set)=> set.reduce((t, r)=> t + judge(form, r.p0, P).use, 0) / set.length;

// ---- SKW2: fit a0, h0 of w = (He + h0)/(A + a0) on the uncensored rows (Berserker Boar out, as SKW2's shape fit) ----
const cardById = Object.fromEntries(CARDS.map(c=> [c.id, c]));
const swRows = SKW2.rows.map(r=>{ const c = cardById[r.unit] || {}; return Object.assign({}, r, {He: r.health + BB.shieldHealthOf(c.effects || {})}); });
const unc = swRows.filter(r=> !r.cens && r.w > 0 && r.unit !== 'berserker-boar'), cen = swRows.filter(r=> r.cens === '>' && r.unit !== 'berserker-boar');
const wOf = {today: ()=> AW, geo: (r, P)=> (r.He + P.h0) / (r.attack + P.a0), prod: (r, P)=> (r.He + P.h0) / (r.attack + P.a0), cap2: r=> r.He / r.attack};
const lerr = (form, P)=> Math.sqrt(unc.reduce((t, r)=> t + Math.pow(Math.log(wOf[form](r, P) / r.w), 2), 0) / unc.length);
let fit = {a0: 0, h0: 0, e: Infinity};
for(let a0 = 0; a0 <= 4.001; a0 += 0.05) for(let h0 = 0; h0 <= 10.001; h0 += 0.1){ const e = lerr('geo', {a0, h0}); if(e < fit.e) fit = {a0: r2(a0), h0: r2(h0), e}; }
// rank agreement (Spearman) between two arrays
function ranks(a){ const ix = a.map((v, i)=> [v, i]).sort((x, y)=> x[0] - y[0]), out = new Array(a.length); let i = 0;
  while(i < ix.length){ let j = i; while(j + 1 < ix.length && ix[j + 1][0] === ix[i][0]) j++; for(let t = i; t <= j; t++) out[ix[t][1]] = (i + j) / 2 + 1; i = j + 1; } return out; }
function pearson(x, y){ const n = x.length, mx = x.reduce((a, b)=> a + b, 0) / n, my = y.reduce((a, b)=> a + b, 0) / n; let sxy = 0, sxx = 0, syy = 0;
  for(let i = 0; i < n; i++){ sxy += (x[i] - mx) * (y[i] - my); sxx += (x[i] - mx) ** 2; syy += (y[i] - my) ** 2; } return sxx && syy ? sxy / Math.sqrt(sxx * syy) : NaN; }
const spearman = (x, y)=> pearson(ranks(x), ranks(y));

// ---- fit each candidate's constant so the mean binding use over the live Maps 0-20 cards stays today's ----
const P0 = {}, target = meanUse('today', P0, road);
function solve(f, lo, hi, up){ for(let i = 0; i < 80; i++){ const mid = (lo + hi) / 2, v = f(mid); if((v > target) === up) hi = mid; else lo = mid; } return (lo + hi) / 2; }
const PAR = {today: {}, geo: {a0: fit.a0, h0: fit.h0}, prod: {a0: fit.a0, h0: fit.h0}, cap2: {}};
PAR.geo.c = r3(solve(c=> meanUse('geo', Object.assign({}, PAR.geo, {c}), road), 0.1, 20, true));
PAR.prod.q = r3(solve(q=> meanUse('prod', Object.assign({}, PAR.prod, {q}), road), 0.1, 50, false));
PAR.cap2.lam = r3(solve(lam=> meanUse('cap2', {lam}, road), 0.05, 5, false));

// ---- task 1: today's cap-1-binding cards ----
const today = live.map(r=> Object.assign({}, r, {v: verdict('today', r, PAR.today)}));
const bind1 = today.filter(r=> r.v.bind === 'cap1').map(r=> ({id: r.id, rarity: r.rarity, map: r.map, stats: r.stats, owner: r.owner, N: r.p0.N, x1: r2(r.p0.x1), gap: r2(r.p0.x1 - r.p0.N), use1: r3(r.v.use1), use2: r3(r.v.use2), over: r.v.over}))
  .sort((a, b)=> ((a.map == null ? 99 : a.map) - (b.map == null ? 99 : b.map)) || b.gap - a.gap);

// ---- task 2: moves per candidate ----
const RAR = ['starter', 'common', 'uncommon', 'rare', 'superrare', 'veryrare', 'epic', 'legendary'];
const rarKey = r=> RAR.includes(r) ? r : (BB.rankOf(r) >= BB.LADDER.indexOf('legendary') ? 'legendary+' : r);
const mapKey = m=> m == null ? 'none' : m <= 20 ? 'm' + String(m).padStart(2, '0') : '21+';
const forms = ['geo', 'prod', 'cap2'], cand = {};
forms.forEach(form=>{
  const rows = live.map((r, i)=> ({r, a: today[i].v, b: verdict(form, r, PAR[form])}));
  const toOver = rows.filter(x=> !x.a.over && x.b.over), toLegal = rows.filter(x=> x.a.over && !x.b.over), tally = (list, key)=>{ const o = {}; list.forEach(x=> { const k = key(x.r); o[k] = (o[k] || 0) + 1; }); return o; };
  const roadRows = rows.filter(x=> x.r.map != null && x.r.map <= 20);
  const useShift = roadRows.map(x=> x.b.use - x.a.use).sort((a, b)=> a - b);
  cand[form] = {params: PAR[form], meanUseRoad: r3(meanUse(form, PAR[form], road)),
    overToday: rows.filter(x=> x.a.over).length, overAfter: rows.filter(x=> x.b.over).length,
    road: {toOver: roadRows.filter(x=> !x.a.over && x.b.over).length, toLegal: roadRows.filter(x=> x.a.over && !x.b.over).length, overAfter: roadRows.filter(x=> x.b.over).length, bindCap1After: roadRows.filter(x=> x.b.bind === 'cap1').length,
      useShiftP10: r3(useShift[Math.floor(useShift.length * 0.1)]), useShiftMedian: r3(useShift[Math.floor(useShift.length / 2)]), useShiftP90: r3(useShift[Math.floor(useShift.length * 0.9)])},
    toOver: {n: toOver.length, byRarity: tally(toOver, r=> rarKey(r.rarity)), byMap: tally(toOver, r=> mapKey(r.map)), owner: toOver.filter(x=> x.r.owner).map(x=> x.r.id),
      cards: toOver.map(x=> ({id: x.r.id, rarity: x.r.rarity, map: x.r.map, stats: x.r.stats, useToday: r3(x.a.use), useAfter: r3(x.b.use), owner: x.r.owner})).sort((a, b)=> b.useAfter - a.useAfter)},
    toLegal: {n: toLegal.length, byRarity: tally(toLegal, r=> rarKey(r.rarity)), byMap: tally(toLegal, r=> mapKey(r.map)),
      cards: toLegal.map(x=> ({id: x.r.id, rarity: x.r.rarity, map: x.r.map, stats: x.r.stats, useToday: r3(x.a.use), useAfter: r3(x.b.use), owner: x.r.owner}))}};
});

// ---- task 3a: SKW2's exchange rates ----
const skw2Fit = {};
['today', 'geo', 'prod', 'cap2'].forEach(form=>{
  const P = PAR[form], pred = unc.map(r=> wOf[form](r, P)), meas = unc.map(r=> r.w);
  skw2Fit[form] = {rmsLogErr: r3(lerr(form, P)), factor: r2(Math.exp(lerr(form, P))), spearman: form === 'today' ? null : r3(spearman(pred, meas)),
    censoredAgree: cen.filter(r=> wOf[form](r, P) >= r.w).length + '/' + cen.length, censoredMedianPred: r2(cen.map(r=> wOf[form](r, P)).sort((a, b)=> a - b)[Math.floor(cen.length / 2)])};
});

// ---- task 3b: the saved contribution runs (cards whose stats, cost, wait and skills match today's, so today's S applies) ----
function bootDiff(xs, ys, zs, B){ // paired bootstrap of spearman(xs, zs) - spearman(ys, zs) over cards (deterministic LCG)
  let s = 12345; const rnd = ()=> (s = (s * 1103515245 + 12345) % 2147483648) / 2147483648, n = zs.length, d = [];
  for(let b = 0; b < B; b++){ const ix = Array.from({length: n}, ()=> Math.floor(rnd() * n)); d.push(spearman(ix.map(i=> xs[i]), ix.map(i=> zs[i])) - spearman(ix.map(i=> ys[i]), ix.map(i=> zs[i]))); }
  d.sort((a, b)=> a - b); return [r3(d[Math.floor(B * 0.025)]), r3(d[Math.floor(B * 0.975)])]; }
const contrib = {};
CONTRIB.forEach(name=>{
  const file = path.join(ROOT, 'docs', 'balance', name + '.json'); if(!fs.existsSync(file)) return; const J = JSON.parse(fs.readFileSync(file, 'utf8'));
  const rows = [];
  J.cards.forEach(m=>{ const c = cardById[m.id]; if(!c || c.attack !== m.attack || c.health !== m.health || (+c.cost || 0) !== (+m.cost || 0) || (+c.wait || 0) !== (+m.wait || 0)) return;
    const sk = BB.abilitiesOf(c.effects || {}).slice().sort().join(','), msk = (m.skills || []).slice().sort().join(','); if(sk !== msk) return;
    rows.push({id: m.id, perCopy: m.perCopy, vsFair: m.vsFair, p: parts(c, J.context && J.context.level != null ? J.context.level : 1)}); });
  const out = {file: 'docs/balance/' + name + '.json', context: J.context, fingerprint: J.fingerprint, cardsInRun: J.cards.length, matched: rows.length, forms: {}};
  if(rows.length < 10){ contrib[name] = out; return; }
  // the fair line refitted on today's N (the file's vsFair used the N of its day): resid = perCopy - (a + b N)
  const pc = rows.map(r=> r.perCopy), N = rows.map(r=> r.p.N), n = N.length, mN = N.reduce((a, b)=> a + b, 0) / n, mP = pc.reduce((a, b)=> a + b, 0) / n;
  const bN = N.reduce((t, x, i)=> t + (x - mN) * (pc[i] - mP), 0) / N.reduce((t, x)=> t + (x - mN) ** 2, 0), vs = pc.map((y, i)=> y - (mP + bN * (N[i] - mN))), vsFile = rows.map(r=> r.vsFair);
  const useOf = (form, r)=> form === 'cap2' ? use2(r.p, PAR.cap2.lam) : judge(form, r.p, PAR[form]).use;
  const vOf = (form, r)=> form === 'cap2' ? Math.sqrt(Math.max(0, x2Of(r.p))) : x1Of(form, r.p, PAR[form]);
  const base = rows.map(r=> useOf('today', r));
  ['today', 'geo', 'prod', 'cap2'].forEach(form=>{ const u = rows.map(r=> useOf(form, r)), v = rows.map(r=> vOf(form, r));
    out.forms[form] = {useVsResid: r3(spearman(u, vs)), diffVsToday95: form === 'today' ? null : bootDiff(u, base, vs, 2000), useVsFileFair: r3(spearman(u, vsFile)), valueVsPerCopy: r3(spearman(v, pc))}; });
  out.nVsPerCopy = r3(spearman(N, pc)); out.fairLineToday = {slopePerN: r3(bN)};
  contrib[name] = out;
});

const res = {tool: 'tools/skw3/skw3.js 1.0.0 (2026-11-14, SKW3)', generated: new Date().toISOString(), budget: {attackWeight: AW, cap2Mult: BB.DEFAULTS.cap2Mult, shieldPerHealth: BB.DEFAULTS.shieldPerHealth},
  counts: {live: live.length, liveMaps0to20: road.length, overToday: today.filter(r=> r.v.over).length, overTodayRoad: today.filter(r=> r.v.over && r.map != null && r.map <= 20).length, cap1Binding: bind1.length, cap1BindingRoad: bind1.filter(r=> r.map != null && r.map <= 20).length},
  meanUseRoadToday: r3(target), skw2ShapeFit: {a0: fit.a0, h0: fit.h0, rows: unc.length, censored: cen.length}, candidates: cand, skw2: skw2Fit, contribution: contrib, cap1Binding: bind1};
fs.mkdirSync(path.dirname(OUT), {recursive: true}); fs.writeFileSync(OUT, JSON.stringify(res, null, 1) + '\n');
// ---- print ----
console.log('live', live.length, 'Maps 0-20', road.length, '| mean binding use (Maps 0-20)', r3(target), '| over today', res.counts.overToday, '(Maps 0-20', res.counts.overTodayRoad + ')');
console.log('cap 1 binding:', bind1.length, '(Maps 0-20', res.counts.cap1BindingRoad + '); over among them', bind1.filter(r=> r.over).length);
const g = bind1.filter(r=> r.map != null && r.map <= 20).map(r=> r.gap).sort((a, b)=> a - b); console.log('  gap x1-N on Maps 0-20: min', g[0], 'p10', g[Math.floor(g.length * 0.1)], 'median', g[Math.floor(g.length / 2)], 'p90', g[Math.floor(g.length * 0.9)], 'max', g[g.length - 1]);
console.log('  over on cap 1 (Maps 0-20):', bind1.filter(r=> r.map != null && r.map <= 20 && r.gap > 0).map(r=> `${r.id} m${r.map} ${r.stats} +${r.gap}${r.owner ? ' (owner)' : ''}`).join('; '));
console.log('SKW2 shape fit a0', fit.a0, 'h0', fit.h0, 'on', unc.length, 'rows');
forms.forEach(f=>{ const c = cand[f]; console.log(f, JSON.stringify(c.params), 'over', c.overToday, '->', c.overAfter, '| Maps 0-20 to over', c.road.toOver, 'to legal', c.road.toLegal, 'cap1 binds', c.road.bindCap1After, 'use shift p10/med/p90', c.road.useShiftP10, c.road.useShiftMedian, c.road.useShiftP90);
  console.log('   to over by rarity', JSON.stringify(c.toOver.byRarity), 'by map', JSON.stringify(c.toOver.byMap)); console.log('   to legal by rarity', JSON.stringify(c.toLegal.byRarity), 'by map', JSON.stringify(c.toLegal.byMap)); console.log('   owner cards pushed over:', c.toOver.owner.length, c.toOver.owner.slice(0, 12).join(', ')); });
console.log('SKW2 exchange rates', JSON.stringify(skw2Fit));
Object.values(contrib).forEach(c=> console.log('contrib', c.file, 'matched', c.matched, '/', c.cardsInRun, 'N vs perCopy', c.nVsPerCopy, JSON.stringify(c.forms)));
console.log('wrote', path.relative(ROOT, OUT));
