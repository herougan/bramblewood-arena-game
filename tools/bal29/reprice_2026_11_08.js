#!/usr/bin/env node
// 2026-11-08 (package BAL29): a skill re-price PROPOSAL from the BAL23 skill ladder (docs/balance/skill-ladder/summary-2026-11-07.json),
// and its knock-on as a dry run. Nothing is applied: canonical/skill-costs.json and canonical/cards.json are only read; the proposed table
// is a copy in memory (also saved beside the report for the record).
//   node tools/bal29/reprice_2026_11_08.js     -> docs/balance/bal29/reprice-proposal-2026-11-08.json (+ proposed-skill-costs-2026-11-08.json)
// The rule (why the MEAN, not the BEST): the table's currency is the canon's (docs/evaluation-protocol.md 5a: a 3A + H point measured over
// six carriers of three shapes), and the ladder's mean over bodies is that reading: Poison 1 / 2 (canon 2.38 / 4.69) read 2.56 / 4.87 mean
// but 4.35 / 8.79 best; Armor, Bleed, Injured, Drunk likewise. The best body's worth is the ceiling a designer can reach by picking the
// split, so it is reported beside each skill, but pricing at it would change the currency (roughly x1.7 on every skill).
//   proposed(N) = the mean over L1 and L5 of the ladder's mean worth; numbered skills get value x N^pow fitted through those points (log
//   least squares), so the proposal is a table entry. Group A = raise, B = cut (both: the mean's 95% interval clears the price at both
//   levels on most of the card N's). C = context skills (kept), D = changed since the measure (re-measure), E = hold (mean and best
//   disagree in direction; body-dependent), F = multipliers (priced on the caps, not in S).
// Knock-on: every card on a Maps 0-20 list (canonical/map-pools.json: cards, side maps, special) the budget measures, verdict by BUDGET2's
// rule as the pipeline's refit reads it (tools/skill2_refit_2026_10_31.js with SKILL2_MISSMULT: over = cap 1 or cap 2 broken at the start
// level or Level 1; well under = cap 1 at or below 60% of N), under today's table and under the proposed copy; the cards whose verdict
// changes, with the smallest stat change that would put them back (the refit's fit rule).
'use strict';
const fs = require('fs'), path = require('path');
const ROOT = path.join(__dirname, '..', '..'), OUTD = path.join(ROOT, 'docs', 'balance', 'bal29');
const LB = require(path.join(ROOT, 'tools', 'lib_bramble.js')), G = LB.G;
const LMP = require(path.join(ROOT, 'tools', 'lib_map_pools.js')), SC = require(path.join(ROOT, 'tools', 'skill_costs.js')), BB = require(path.join(ROOT, 'bramblewood-budget.js'));
const J = f => JSON.parse(fs.readFileSync(path.join(ROOT, f), 'utf8'));
const r2 = v => Math.round(v * 100) / 100, r05 = v => Math.round(v * 20) / 20;
const LADDER = J('docs/balance/skill-ladder/summary-2026-11-07.json'), TABLE = J('canonical/skill-costs.json');
const WELL_UNDER = 0.6;

// ---- groups (curated from the ladder; reasons are short on purpose: the report prints them)
const A = { // raise: the mean clears the price at both levels
  inspiring: 'canon; mean 3.9 / 6.2 / 7.3 at N 1-3, best 2x that', delivery: 'theoretical price (4-round rule), never measured; mean +2.6 to +3.1 a step (x lumberHomeMult still applies)',
  pickpocket: 'flat in N (it steals what is there): 5.1-5.3, price 1 / 2', almanac: 'N is a threshold (cards drawn): worth falls 7.7 -> 5.8 with N, price flat 4',
  fork: 'canon 3.89, reads 4.92 [4.2, 5.7] mean at both levels', twinStrike: '7.73 mean, best 8.36: body-independent, so clear',
  bulwark: 'ENG33 Log Walls (before the measure): 6.2 / 8.5 vs 3.5 / 7', fastForward: '4.2 / 7.4 vs 3.0 / 6.0',
  lumberjack: 'CONDITIONAL (needs Lumber cards): reads high even without them, so a raise is allowed', repair: 'flat ~2.9 (mends the bramble), price 0.5 / 1',
  skitter: 'Haste x 0.56 by logic (1.44); reads 3.5 mean', invisible: '1.0 / 1.9 / 2.0 vs 0.48 / 0.96 / 0.96', overwhelm: '1.03 vs 0.52',
  thorns: 'N 2-3 clear, N 1 and 4 inside; +0.3 to +1.0', scar: 'half-scale step: N 1 and 3 under, N 2 fair', scare: 'half-scale step: N 1 and 3 under, N 2 fair',
  berserk: 'half-scale step: N 1 and 3 under, N 2 fair', speed: 'N 1 2.33 vs 1.02; N 2-3 fair', avalanche: 'N 1 9.25 vs 6.63 (N 2 13.26 reads 9.85: re-curve)',
  riled: 'N is a threshold (damage taken): 5.0 -> 1.2 over N 1-4, price flat 2.4 (re-curve)', tally: 'threshold (enemy deaths): 4.3 -> 0.9, flat 3.28 (re-curve)',
  scavenge: 'N 1 3.0 vs 2.27; N 2 3.5 vs 4.54 (re-curve)', gash: 'N 1-2 over, N 3-4 under (re-curve, steeper)',
};
const B = { // cut
  recoil: 'a drawback priced as a skill (+1 / +2); reads -3.4 / -6.1 / -7.8 mean (best -1.5 / -3.0 / -3.2)', weaken: 'N 2 6.78 reads 3.3 (best 3.75 [hi 5.4]); N 1 2.64 vs 3.39',
  trap: 'best below price at N 1-2: 0.4 / 1.0 / 1.6 / 2.1 vs 1.49-2.9', ambush: 'N 1-2 over (0.57 / 1.48 vs 1.44 / 2.24), N 3-4 fair',
  nova: '1.2 / 2.6 / 3.9 / 5.0 vs 2.24 / 4.48 / 4.48 / 6.72', tornado: '1.2 / 1.75 vs 1.96 / 3.92', bulldoze: 'N 2 2.64 vs 4.56', daunt: 'N 1 1.68 vs 2.31; 3 cards',
  onslaught: 'threshold: 2.6 -> 0.95 over N 1-4, flat 2.8 (re-curve)', frostbite: '0.18 / 0.33 vs 0.5 / 1.0', herbalist: '0.23 / 0.30 vs 0.58 / 1.16',
};
const C = { // context: keep, measure in context later
  fletcher: 'needs arrows: alone 0.2-0.4, Arrow 1 + Fletcher 1 synergy +7.2 [5.4, 8.8] L1 / +8.5 L5', mountainClimber: 'mountain terrain only', dry: 'dry maps only',
  darksight: 'dark fights only', tide: 'Tide fields only', timbered: 'needs Lumber cards', bedrock: 'needs Stone', salt: 'Salt fields only', frost: 'cold maps only', heat: 'hot maps only',
  illuminate: 'dark fights only', canopyCover: 'forest maps only', keenEye: 'needs hidden foes', keenSense: 'needs hidden foes', sonar: 'needs hidden / dark', guardian: 'team skill: worth is the ally it saves (mean -1.1, best 3.1)',
  taunt: 'team skill (mean -1.2, best 4.8)', packLeader: 'needs its pack', swarm: 'needs its type beside it (reads fair: 3.6 vs 3.13)', hunter: 'needs its prey status (reads 0.5-0.7 vs 0.51 / 0.09 / 0.03)',
  prey: 'needs a Predator', carrion: 'needs deaths beside it', foeScarcity: "needs the foe's resources", weaponMaster: 'needs equipment', backstab: 'needs a foe status / own edge (EN D21)',
  pierce: 'needs Armor on foes', shatter: 'needs Frozen foes', executioner: 'needs low-Health foes', crabClaws: 'its own aim; depends on the board', reload: 'an Archer drawback: the war-hound has no shots to reload',
  hibernate: 'priced partly through its Attack (EN6 uptime), which the price column omits', nocturnal: 'time of day, logic-priced (zeitS uptime)', diurnal: 'time of day, logic-priced (zeitS)',
  crepuscular: 'time of day, logic-priced (zeitS)', moonborn: 'Full Moon only', nightblind: 'night drawback, logic-priced', carnage: 'threshold, priced by thrS uptime (table value unused)', requiem: 'threshold, priced by thrS uptime',
  sequestration: 'context', relict: 'pairs with Armor (+2.9 synergy) / its relic', web: 'needs Webbed foes', dive: 'reads 0: dives need water lanes',
};
const D = { // changed since the measure (ENG35-37, CONTENT18): re-measure
  thanatosis: 'ENG36 rework (reset to 1 Health once): measured on the ENG33 rule', shield: 'ENG37 shield.armor parameter; also N 2 over / N 6 under: a flat 2.53 misses N',
  shell: 'ENG37 shell.when (after attacking x2.15)', immunity: 'ENG36 status resistances replace it', sap: 'Leech N (ENG35 perN 1.15): not on the ladder',
  reach: 'ENG37 rework: not on the ladder (ENG37 quick measure -0.18 [-0.94, 0.53]; ENG37-2 open)', hoard: 'ENG36 Hoard N = +N/+N a Lumber: not on the ladder', constrict: 'ENG36 new: not on the ladder',
};
const F = { flying: 'priced x1.13 on the stats (SKILL2-2), S 0; ladder 3.5 mean', evasive: 'x1.13 on the stats, S 0; 3.5 mean', purblind: 'x0.7 on the caps (BF8), S 0; reads -6.2 mean' };

// ---- the ladder readings
const LAD = {}; LADDER.skills.forEach(s => LAD[s.key] = s);
function reading(key) { const s = LAD[key]; if (!s) return null;
  return s.points.map(p => { const L1 = p.L1, L5 = p.L5; if (!L1 || !L5) return { n: p.n, price: p.price };
    const mean = r2((L1.mean.m + L5.mean.m) / 2), best = r2((L1.best.m + L5.best.m) / 2);
    const under = L1.mean.lo > p.price && L5.mean.lo > p.price, over = L1.mean.hi < p.price && L5.mean.hi < p.price, bestOver = L1.best.hi < p.price && L5.best.hi < p.price;
    return { n: p.n, price: p.price, mean, best, m1: L1.mean, m5: L5.mean, b1: L1.best, b5: L5.best, under, over, bestOver, off: !!(L1.off || L5.off) }; }); }
function fitCurve(pts) { // value x N^pow through (N, y), log least squares; sign kept
  const sg = Math.sign(pts.reduce((a, p) => a + p.y, 0)) || 1, q = pts.filter(p => p.y * sg > 0.01);
  if (q.length < 2) { const v = q.length ? q[0].y / Math.pow(q[0].n, 0) : 0; return { value: r2(v), pow: 0 }; }
  const xs = q.map(p => Math.log(p.n)), ys = q.map(p => Math.log(p.y * sg)), mx = xs.reduce((a, b) => a + b) / xs.length, my = ys.reduce((a, b) => a + b) / ys.length;
  let sxy = 0, sxx = 0; xs.forEach((x, i) => { sxy += (x - mx) * (ys[i] - my); sxx += (x - mx) * (x - mx); });
  const pow = sxx ? sxy / sxx : 0, v = Math.exp(my - pow * mx); return { value: r2(sg * v), pow: Math.round(pow * 1000) / 1000 }; }
function proposeEntry(key) {
  const rd = reading(key), e = (TABLE.skills || []).find(x => x.id === key); if (!rd || !e) return null;
  const pts = rd.filter(p => p.mean != null);
  if (pts.length === 1 && pts[0].n === true) { const v = r05(pts[0].mean); return { entry: { scale: 'fixed', value: v }, at: [{ n: true, old: pts[0].price, mean: pts[0].mean, best: pts[0].best, proposed: v }] }; }
  const f = fitCurve(pts.map(p => ({ n: +p.n, y: p.mean })));
  return { entry: { scale: 'n', value: f.value, pow: f.pow }, at: pts.map(p => ({ n: p.n, old: p.price, mean: p.mean, best: p.best, proposed: r2(f.value * Math.pow(+p.n, f.pow)) })) }; }
function confidence(key, rd) { const q = rd.filter(p => p.mean != null), hit = q.filter(p => A[key] ? p.under : p.over).length;
  if (B[key] && q.some(p => p.bestOver)) return 'high'; return hit === q.length ? 'high' : hit >= q.length / 2 ? 'medium' : 'low'; }

// ---- the cards on Maps 0-20
const cards = J('canonical/cards.json'), byId = new Map(cards.map(c => [c.id, c])), pools = J('canonical/map-pools.json');
const onMap = new Set(); Object.entries(pools.maps).forEach(([m, v]) => { const no = G.mapNumberOf(m); if (no == null || no > 20) return; const n = LMP.normalizeEntry(v);
  n.cards.concat(n.special, ...Object.values(n.submaps)).forEach(id => onMap.add(id)); });
const flat = e => BB.XP ? BB.XP(e || {}) : (e || {});
function carriers(key) { let k = 0; onMap.forEach(id => { const c = byId.get(id); if (c && Object.prototype.hasOwnProperty.call(flat(c.effects), key)) k++; }); return k; }

// ---- the tables and the verdict (tools/skill2_refit_2026_10_31.js with SKILL2_MISSMULT, as tools/pipeline/refit.js runs it)
function maker(table) { const T = SC.make(table), Bt = table.budget || {}, f = T.budget;
  T.budget = function (d, o) { const b = f(d, o), e = (d && d.effects) || {}, mNew = BB.missMultOf(e, Bt); if (!(b.m > 0) || Math.abs(mNew - b.m) < 1e-9) return b;
    const fz = b.f || 1, q = mNew / b.m, cs = BB.cap2SOf ? BB.cap2SOf(b.S, Bt) : (b.S * Math.abs(b.S)), x1 = r2(fz * ((b.x1 / fz - b.S) * q + b.S)), x2 = r2(fz * ((b.x2 / fz - cs) * q + cs)), ok = x1 <= b.N && x2 <= b.N2;
    return Object.assign({}, b, { x1, x2, ok, wellUnder: ok && x1 <= b.N * 0.6, m: mNew }); }; return T; }
function verdict(T, c) { const b = T.budget(c), b1 = T.budget(c, { level: 1 }), over = !b.ok || !b1.ok, under = !over && b.x1 <= b.N * WELL_UNDER;
  return { over, under, ok: !over && !under, v: over ? 'over' : under ? 'under' : 'ok', use: b.N ? r2(b.x1 / b.N) : null, S: b.S, x1: b.x1, N: b.N, cap2: b.N2 ? r2(b.x2 / b.N2) : null }; }
function fit(T, c, v) { const A0 = +c.attack || 0, H0 = +c.health || 0, e = c.effects || {};
  const lockA = !!(e.archer && !(Number(e.archer) < 0)) || !!e.hibernate || A0 === 0 || c.attack == null, dir = v.over ? -1 : 1, best = [];
  const aSteps = lockA ? [0] : (dir < 0 ? [0, -1, -2, -3, -4, -5].filter(d => A0 + d >= 1) : [0, 1, 2, 3]);
  for (const dA of aSteps) for (let k = 0; k <= 60; k++) { const dH = dir * k, H = H0 + dH; if (H < 1) break; if (!dA && !dH) continue;
    const w = verdict(T, Object.assign({}, c, { attack: c.attack == null ? c.attack : A0 + dA, health: H })); if (w.ok) { best.push({ dA, dH, cost: Math.abs(dA) / Math.max(1, A0) + Math.abs(dH) / Math.max(1, H0), pts: Math.abs(dA) + Math.abs(dH) }); break; } }
  if (!best.length) return null; best.sort((a, b) => a.cost - b.cost || a.pts - b.pts); const f = best[0];
  return { to: `${c.attack == null ? '-' : A0 + f.dA}/${H0 + f.dH}`, dA: f.dA, dH: f.dH }; }

function dryRun(changes, label) {
  const copy = JSON.parse(JSON.stringify(TABLE)); copy.skills.forEach(e => { const ch = changes[e.id]; if (!ch) return; delete e.pow; delete e.perN; delete e.plus; Object.assign(e, ch); e.bal29 = label; });
  const OLD = maker(TABLE), NEW = maker(copy), rows = [], tally = { cards: 0, before: { ok: 0, over: 0, under: 0 }, after: { ok: 0, over: 0, under: 0 } };
  [...onMap].sort().forEach(id => { const c = byId.get(id); if (!c || c.token || c.test || !SC.measured(c) || c.health == null) return; tally.cards++;
    const a = verdict(OLD, c), b = verdict(NEW, c); tally.before[a.v]++; tally.after[b.v]++;
    const touched = Object.keys(flat(c.effects)).filter(k => changes[k]); if (!touched.length && a.v === b.v) return;
    if (a.v === b.v && Math.abs(a.S - b.S) < 0.005) return;
    rows.push({ id, name: c.name, rarity: c.rarity || 'common', stats: `${c.attack == null ? '-' : c.attack}/${c.health}`, skills: touched, S: [a.S, b.S], use: [a.use, b.use], verdict: [a.v, b.v],
      fit: b.v !== 'ok' && a.v !== b.v ? fit(NEW, c, b) : null }); });
  return { copy, rows, tally }; }

function main() {
  fs.mkdirSync(OUTD, { recursive: true });
  const skills = [], changes = {}, best = {};
  const add = (grp, key, why) => { const rd = reading(key) || [], car = carriers(key), base = { key, group: grp, why, cards: car, ladderCards: LAD[key] ? LAD[key].cards : 0 };
    if (grp === 'A' || grp === 'B') { const p = proposeEntry(key); if (!p) return; changes[key] = p.entry; base.entry = p.entry; base.at = p.at; base.confidence = confidence(key, rd);
      const fb = fitCurve(rd.filter(x => x.best != null).map(x => ({ n: x.n === true ? 1 : +x.n, y: x.best }))); best[key] = rd.length === 1 && rd[0].n === true ? { scale: 'fixed', value: r05(rd[0].best) } : { scale: 'n', value: fb.value, pow: fb.pow }; }
    else base.at = rd.filter(p => p.mean != null).map(p => ({ n: p.n, old: p.price, mean: p.mean, best: p.best }));
    skills.push(base); };
  Object.entries(A).forEach(([k, w]) => add('A', k, w)); Object.entries(B).forEach(([k, w]) => add('B', k, w));
  Object.entries(C).forEach(([k, w]) => add('C', k, w)); Object.entries(D).forEach(([k, w]) => add('D', k, w)); Object.entries(F).forEach(([k, w]) => add('F', k, w));
  // E: every other ladder skill with a flagged variant: mean and best disagree, or fair on the mean
  LADDER.skills.forEach(s => { if (skills.find(x => x.key === s.key)) return; const rd = reading(s.key), q = rd.filter(p => p.mean != null);
    const off = q.some(p => p.off), meanOver = q.some(p => p.over), meanUnder = q.some(p => p.under);
    const why = meanOver && !meanUnder ? 'mean says over, best says under: body-dependent (a wall body carries it); hold' : meanUnder && meanOver ? 'mixed by N; hold' : meanUnder ? 'under on the mean at one N only; hold' : off ? 'fair on the mean (flagged on best only)' : 'fair';
    if (off || meanOver || meanUnder) add('E', s.key, why); });
  const run = dryRun(changes, 'BAL29 proposal (mean)'), runBest = dryRun(best, 'BAL29 alternative (best)');
  const only = g => { const o = {}; Object.keys(changes).forEach(k => { if ((g === 'A' ? A : B)[k]) o[k] = changes[k]; }); return o; };
  const flipsOf = r => r.rows.filter(x => x.verdict[0] !== x.verdict[1]).map(x => x.id), runA = dryRun(only('A'), 'A'), runB = dryRun(only('B'), 'B');
  fs.writeFileSync(path.join(OUTD, 'proposed-skill-costs-2026-11-08.json'), JSON.stringify(run.copy, null, 1) + '\n');
  const out = { _about: 'BAL29 (2026-11-08): skill re-price proposal from the BAL23 ladder (game e538c9f45c68, before ENG35-37 / CONTENT18) and its dry-run knock-on on the Maps 0-20 cards (cards as of this commit). Nothing applied. Built by node tools/bal29/reprice_2026_11_08.js.',
    ladder: { file: 'docs/balance/skill-ladder/summary-2026-11-07.json', fingerprint: LADDER.fingerprint, games: LADDER.games }, rule: 'proposed = mean over L1/L5 of the ladder mean; numbered: value x N^pow fit', skills,
    knockOn: { tally: run.tally, rows: run.rows }, bestAlternative: { tally: runBest.tally, changed: runBest.rows.filter(r => r.verdict[0] !== r.verdict[1]).length },
    groupAOnly: { tally: runA.tally, flips: flipsOf(runA) }, groupBOnly: { tally: runB.tally, flips: flipsOf(runB) } };
  fs.writeFileSync(path.join(OUTD, 'reprice-proposal-2026-11-08.json'), JSON.stringify(out, null, 1) + '\n');
  const flips = run.rows.filter(r => r.verdict[0] !== r.verdict[1]), cnt = {}; flips.forEach(r => { const k = r.verdict.join('->'); cnt[k] = (cnt[k] || 0) + 1; });
  console.log('cards', run.tally.cards, 'before', JSON.stringify(run.tally.before), 'after', JSON.stringify(run.tally.after), 'flips', JSON.stringify(cnt));
  console.log('best alternative after', JSON.stringify(runBest.tally.after));
  console.log('A only', JSON.stringify(runA.tally.after), flipsOf(runA).join(' '), '| B only', JSON.stringify(runB.tally.after), flipsOf(runB).join(' '));
}
main();
