#!/usr/bin/env node
// 2026-10-31 (package BUDGET2, owner on RECOST1-6: "If Attack = 3 Health, we have to edit the first N formula to 3*attack instead."): the
// card re-fit under the new budget (bramblewood-budget.js: cap 1 f × ((3A + H) × m + S) ≤ N, N × 1.13, cap2Mult 1.57).
//   node tools/budget2_refit_2026_10_31.js            the plan (docs/balance/budget2-refit-2026-10-31.json), nothing applied
//   python3 tools/budget2_apply_2026_10_31.py          writes the plan's stat changes into canonical/cards.json (keeps its format)
// Which cards: every card the budget measures (tools/skill_costs.js measured: not tokens, tests, Hall of Fame, variants, fields; not pool
// candidates or Easter eggs) with Health, in play or not (tools/lib_map_pools.js isOutOfPlay: reported apart), that the new formula
// pushed out of tolerance: inside under 2A + H, outside under 3A + H. A card already outside under 2A + H is outside for reasons that are
// not this package's (eggs and equipment read "well under" by design; bee-drone and worker-ant are held by the owner) and is listed, not
// moved; War Elephant and Owl Nightwatch are the named exceptions (EFFECT_EDITS).
// Tolerance (the hub's bands, SB_WELL_UNDER): over = cap 1 or cap 2 broken at the card's start level or at Level 1 (equal is fine); well
// under = cap 1 at or below 60% of N at the start level. Inside = neither.
// The fit: the smallest stat change that brings the card inside, by relative size |ΔA| / A + |ΔH| / H (a 4/10 loses 2 Health before 1
// Attack: the card keeps its shape), then the fewest points, then (over) the use nearest N / (under) the smallest lift. A trim that cuts a
// point of Attack frees 3 points, more than most cards are over by, so it gives Health back while the card stays inside and at or below
// its old use (2A + H): the Attack the formula now prices dearer turns into Health at 3 for 1 (honey-bee 2/3 -> 1/5, not 1/3). Theme rules: an
// over card only loses, an under card only gains; a card with Attack keeps at least 1, a 0-Attack wall stays at 0, Health stays 1 or
// more; an Archer's or a Hibernate unit's Attack is not moved (the budget does not count it, or counts it in part). A card with no fit is
// held and listed (stats cannot fit it: its skills alone break a cap).
// Held by the owner (RECOST1-5, 10-30 23:25 "hold them"): bee-drone, worker-ant (their trigger prices wait for RECOST1-3's package).
'use strict';
const fs = require('fs'), path = require('path');
const ROOT = path.join(__dirname, '..');
const LB = require('./lib_bramble.js'), G = LB.G, D = LB.CARD_DEFS_BASELINE;
const LMP = require('./lib_map_pools.js');
const SC = require('./skill_costs.js');
const TABLE = JSON.parse(fs.readFileSync(path.join(ROOT, 'canonical', 'skill-costs.json'), 'utf8'));
const OUT = path.join(ROOT, 'docs', 'balance', 'budget2-refit-2026-10-31.json');
const TUT12 = new Set(((JSON.parse(fs.readFileSync(path.join(ROOT, 'canonical', 'map-pools.json'), 'utf8')).maps.m1 || {}).submaps || {}).mtut12 || []);
const WELL_UNDER = 0.6, HELD = {'bee-drone': 'RECOST1-5 (owner: hold them)', 'worker-ant': 'RECOST1-5 (owner: hold them)'};
// War Elephant (item X15 / RECOST1-5, owner "if you can cut the arrow count, do it"): Arrow Count 2 -> 1 (one shot of Arrow 2 a round; the
// key goes, 1 is the engine's default). Applied to the card's effects before its fit; the applier writes it.
// Owl Nightwatch (in play, Common, 1/5 Flying, Stealth, Nocturnal 4): its night bonus (+4 Attack) is priced 0.53 x 3A now (was x 2A), and
// S·|S| alone (75) leaves no room in cap 2 for any body (1/1 still breaks it): Nocturnal 4 -> 3, the smallest change that fits (still a
// night hunter, +3 Attack at night).
const EFFECT_EDITS = {'war-elephant': {remove: ['arrowCount'], why: 'X15 / RECOST1-5: Arrow Count 2 -> 1 (its skills alone broke cap 2: S 22.5, S·|S| 507 > 356)'},
  'owl-nightwatch': {set: {nocturnal: 3}, why: 'BUDGET2: Nocturnal 4 -> 3 (its night bonus is priced at 3A now; S·|S| alone broke cap 2 for any body)'}};
const tableWith = over=>{ const t = JSON.parse(JSON.stringify(TABLE)); Object.assign(t.budget, over || {}); return SC.make(t); };
const NEW = tableWith(), OLD = tableWith({attackWeight: 2, scale: 1, cap2Mult: 2});
const r2 = v=> Math.round(v * 100) / 100;
// the old budget prices braces, thresholds and the time of day at 2A + H too (bramblewood-budget.js reads DEFAULTS.attackWeight at each call)
const BB = require('../bramblewood-budget.js');
function asOld(fn){ const k = BB.DEFAULTS.attackWeight; BB.DEFAULTS.attackWeight = 2; try{ return fn(); } finally { BB.DEFAULTS.attackWeight = k; } }
function verdict(T, c){ if(T === OLD && BB.DEFAULTS.attackWeight !== 2) return asOld(()=> verdict(T, c)); const b = T.budget(c), b1 = T.budget(c, {level: 1});
  // the T-1 / T-2 cards (map list m1 / mtut12) fight at Level 0 with no skill (SKL0-1, tests/tut2-2026-10-30.js): that line must hold too
  let ok0 = true; if(TUT12.has(c.id)){ const st = G.statsAtLevel(c, 0), fx = Object.assign({}, c.effects || {}); Object.keys(c.levelSkills || {}).filter(k=> +k > 0).forEach(k=> Object.keys(c.levelSkills[k]).forEach(x=> delete fx[x]));
    ok0 = T.budget(Object.assign({}, c, {attack: st.attack, health: st.health, effects: fx}), {level: 0}).ok; }
  const over = !b.ok || !b1.ok || !ok0, under = !over && b.x1 <= b.N * WELL_UNDER;
  return {over, under, ok: !over && !under, use: b.N ? r2(b.x1 / b.N) : null, x1: b.x1, N: b.N, x2: b.x2, N2: b.N2, x1L1: b1.x1, NL1: b1.N, S: b.S}; }
function fit(c, v, vOld){ const A0 = +c.attack || 0, H0 = +c.health || 0, e = c.effects || {};
  const lockA = !!(e.archer && !(Number(e.archer) < 0)) || !!e.hibernate || A0 === 0 || c.attack == null;
  const dir = v.over ? -1 : 1, best = [];
  const aSteps = lockA ? [0] : (dir < 0 ? [0, -1, -2, -3].filter(d=> A0 + d >= 1) : [0, 1, 2, 3]);
  for(const dA of aSteps){ for(let k = 0; k <= 40; k++){ const dH = dir * k; const H = H0 + dH; if(H < 1) break;
    if(!dA && !dH) continue; const t = Object.assign({}, c, {attack: c.attack == null ? c.attack : A0 + dA, health: H}), w = verdict(NEW, t);
    if(w.ok){ best.push({dA, dH, cost: Math.abs(dA) / Math.max(1, A0) + Math.abs(dH) / Math.max(1, H0), pts: Math.abs(dA) + Math.abs(dH), use: w.use, w}); break; } } }
  if(!best.length) return null;
  best.sort((a, b)=> a.cost - b.cost || a.pts - b.pts || (v.over ? b.use - a.use : a.use - b.use));
  const f = best[0];
  if(v.over && f.dA < 0){ // the give-back: Health while inside and at or below the old use
    for(let k = 1; k <= 20; k++){ const t = Object.assign({}, c, {attack: A0 + f.dA, health: H0 + f.dH + k}), w = verdict(NEW, t);
      if(!w.ok || w.use > Math.min(1, vOld.use) + 1e-9) break; f.dH += 0; f.give = k; f.w = w; f.use = w.use; }
    if(f.give) f.dH += f.give; }
  return f; }
const cards = JSON.parse(fs.readFileSync(path.join(ROOT, 'canonical', 'cards.json'), 'utf8'));
const rows = [], held = [], counts = {inPlay: 0, outOfPlay: 0, inPlayPushed: 0, outPushed: 0, outsideBefore: 0};
cards.forEach(c0=>{
  const d = D[c0.id]; if(!d || c0.pool || c0.token || c0.test || c0.easterEgg || !SC.measured(c0) || c0.health == null) return;
  const inPlay = !LMP.isOutOfPlay(G, d); counts[inPlay ? 'inPlay' : 'outOfPlay']++;
  const ed = EFFECT_EDITS[c0.id]; let c = c0;
  if(ed){ const e = Object.assign({}, c0.effects); (ed.remove || []).forEach(k=> delete e[k]); Object.assign(e, ed.set || {}); c = Object.assign({}, c0, {effects: e}); }
  const vNew = verdict(NEW, c), vOld = verdict(OLD, c0), vNew0 = ed ? verdict(NEW, c0) : vNew;
  const base = {id: c0.id, name: c0.name, rarity: c0.rarity || 'common', inPlay, stats: `${c0.attack == null ? '-' : c0.attack}/${c0.health}`,
    old: {use: vOld.use, N: vOld.N, x1: vOld.x1, verdict: vOld.over ? 'over' : vOld.under ? 'under' : 'ok'}, new: {use: vNew0.use, N: vNew0.N, x1: vNew0.x1, x2: vNew0.x2, N2: vNew0.N2, verdict: vNew0.over ? 'over' : vNew0.under ? 'under' : 'ok'}};
  if(ed) base.effectEdit = ed;
  if(vNew.ok){ if(ed) rows.push(Object.assign(base, {kind: 'effect', to: base.stats, after: {use: vNew.use, N: vNew.N, x1: vNew.x1, x2: vNew.x2}})); return; }
  if(!vOld.ok && !ed){ counts.outsideBefore++; (counts.outsideBeforeIds = counts.outsideBeforeIds || []).push(c0.id + (inPlay ? '' : ' (out of play)')); return; } // not pushed out by BUDGET2
  counts[inPlay ? 'inPlayPushed' : 'outPushed']++;
  if(HELD[c0.id]){ held.push(Object.assign(base, {why: HELD[c0.id]})); return; }
  const f = fit(c, vNew, vOld);
  if(!f){ held.push(Object.assign(base, {why: 'no stat change fits (its skills alone break a cap)'})); return; }
  const A = c.attack == null ? null : (+c.attack || 0) + f.dA, H = c.health + f.dH;
  rows.push(Object.assign(base, {kind: vNew.over ? 'trim' : 'lift', dA: f.dA, dH: f.dH, attack: A, health: H, to: `${A == null ? '-' : A}/${H}`, after: {use: f.w.use, N: f.w.N, x1: f.w.x1, x2: f.w.x2}}));
});
rows.sort((a, b)=> (b.inPlay - a.inPlay) || (a.kind < b.kind ? -1 : a.kind > b.kind ? 1 : 0) || (Math.abs(b.dA || 0) * 3 + Math.abs(b.dH || 0)) - (Math.abs(a.dA || 0) * 3 + Math.abs(a.dH || 0)) || (a.id < b.id ? -1 : 1));
const out = {_about: 'BUDGET2 (2026-10-31): the card re-fit under 3A + H (bramblewood-budget.js). Built by node tools/budget2_refit_2026_10_31.js; applied by python3 tools/budget2_apply_2026_10_31.py. old = 2A + H, N x 1, cap2Mult 2; new = 3A + H, N x 1.13, cap2Mult 1.57. use = cap-1 left side / N at the start level.',
  built: '2026-10-31', counts, changes: rows, held};
fs.writeFileSync(OUT, JSON.stringify(out, null, 1) + '\n');
const ip = rows.filter(r=> r.inPlay), op = rows.filter(r=> !r.inPlay);
console.log(`cards measured: ${counts.inPlay} in play, ${counts.outOfPlay} out of play; pushed out of tolerance by 3A + H: ${counts.inPlayPushed} in play, ${counts.outPushed} out of play; outside already under 2A + H (left): ${counts.outsideBefore}`);
console.log(`changes: ${ip.length} in play (${ip.filter(r=> r.kind === 'trim').length} trims, ${ip.filter(r=> r.kind === 'lift').length} lifts, ${ip.filter(r=> r.kind === 'effect').length} effect edits), ${op.length} out of play; held ${held.length}`);
rows.forEach(r=> console.log(`  ${r.inPlay ? 'IN ' : 'out'} ${r.kind.padEnd(6)} ${r.id.padEnd(28)} ${r.rarity.padEnd(10)} ${r.stats.padStart(6)} -> ${r.to.padEnd(6)} use ${r.old.use} (2A+H) -> ${r.new.use} (3A+H) -> ${r.after.use}  N ${r.after.N}`));
held.forEach(r=> console.log(`  held ${r.id} ${r.stats}: ${r.why} (use ${r.new.use}, cap 2 ${r.new.x2} / ${r.new.N2})`));
console.log('wrote', path.relative(ROOT, OUT));
