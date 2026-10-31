#!/usr/bin/env node
// 2026-10-31 (package SKILL2, decisions BUDGET2-1, DECK1-1, DECK1-5, BUDGET2-5): the card re-fit after the skill re-pricing.
//   node tools/skill2_refit_2026_10_31.js            the plan (docs/balance/skill2-refit-2026-10-31.json), nothing applied
//   python3 tools/skill2_apply_cards_2026_10_31.py    writes the plan's stat changes into canonical/cards.json (keeps its format)
// Which cards: as BUDGET2's re-fit (tools/budget2_refit_2026_10_31.js, whose verdict and fit this tool reuses): every card the budget
// measures with Health, in play or not (reported apart), that the new skill prices pushed out of tolerance: inside under the prices before
// SKILL2 (canonical/skill-costs.json at BASE, the batch's commit before this package), outside under the new ones. A card already outside
// before is listed, not moved (eggs and equipment read "well under" by design; the Dragons are the owner's), except the named ones below.
// Tolerance: over = cap 1 or cap 2 broken at the start level or at Level 1 (or Level 0 for the T-1 / T-2 cards); well under = cap 1 at or
// below 60% of N. The fit: the smallest relative stat change (|ΔA| / A + |ΔH| / H), then the fewest points; an over card only loses (a cut
// of a point of Attack gives Health back while it stays inside and at or below its old use), an under card only gains; a card keeps 1+
// Attack, a 0-Attack wall stays 0, an Archer's or a Hibernate unit's Attack is not moved. A card no stat change fits is held and listed.
// Named (owner decisions):
//   - BUDGET2-5: Marshal of Rivergate to 4/9.
//   - DECK1-5 (Gannet Cliffs' five flyers under the fair line): each lifted onto the fair line (LIFTS below, from the BUDGET2 contribution
//     run's per-copy distance and the yardstick: one 3A + H point ≈ RATE win-rate points a copy), within its budget where the budget allows.
//   - DECK1-1: the Quartermaster, Ashbone Ghoul, Wolf Spider Mother and Grave-Grin Hyena: their skills re-priced (Fletcher, Remember and its
//     On Death → Exile self, Brood, Executioner); the re-fit then trims them like any card the new prices push over.
'use strict';
const fs = require('fs'), path = require('path'), cp = require('child_process');
const ROOT = path.join(__dirname, '..');
const BASE = process.env.SKILL2_BASE || '641db7a8'; // the batch (batch-1023e) as merged, before SKILL2
const LB = require('./lib_bramble.js'), G = LB.G, D = LB.CARD_DEFS_BASELINE;
const LMP = require('./lib_map_pools.js'), SC = require('./skill_costs.js'), BB = require('../bramblewood-budget.js');
// SPEED1 (2026-10-31, tools/pipeline/refit.js): environment hooks so the pipeline can run this rule on the cards as they are now, against the
// skill table and budget constants as they were before its price step, with no owner edits: SKILL2_OLD_TABLE (a docs/balance/pipeline/state
// snapshot {table, constants}), SKILL2_CARDS (a cards json; default the cards at BASE), SKILL2_OUT (the plan file), SKILL2_NO_NAMED=1.
const OUT = process.env.SKILL2_OUT || path.join(ROOT, 'docs', 'balance', 'skill2-refit-2026-10-31.json');
const NEWT = JSON.parse(fs.readFileSync(path.join(ROOT, 'canonical', 'skill-costs.json'), 'utf8'));
const OLDT = (() => { if (!process.env.SKILL2_OLD_TABLE) return JSON.parse(cp.execSync(`git show ${BASE}:canonical/skill-costs.json`, { cwd: ROOT, maxBuffer: 64 << 20 }).toString());
  const snap = JSON.parse(fs.readFileSync(process.env.SKILL2_OLD_TABLE, 'utf8')), t = snap.table; t.budget = Object.assign({}, t.budget, { cap2SScale: snap.constants.cap2SScale, missMultBy: snap.constants.missMultBy }); return t; })();
const NEW = SC.make(NEWT), OLD = SC.make(OLDT);
// SPEED1 (2026-10-31, SKILL2_MISSMULT=1 from tools/pipeline/refit.js): tools/skill_costs.js budget() multiplies every half-miss skill by the table's flat
// missMult (1.5) and never reads MISS_MULT_BY, which is what the game's sbCheck reads (Flying x1.39 -> x1.13, SKILL2-2). Here the half-miss
// multiplier is swapped for the budget file's own (BB.missMultOf, with the table's budget as cfg, so an old snapshot's missMultBy applies) and cap 2
// reads S at CAP2_S_SCALE; the stat terms of both caps scale linearly with m. Left off by default: the SKILL2 plan stays reproducible.
if (process.env.SKILL2_MISSMULT) [[NEW, NEWT], [OLD, OLDT]].forEach(([T, table]) => { const B = table.budget || {}, f = T.budget;
  T.budget = function (d, o) { const b = f(d, o), e = (d && d.effects) || {}, mNew = BB.missMultOf(e, B); if (!(b.m > 0) || Math.abs(mNew - b.m) < 1e-9) return b;
    const fz = b.f || 1, q = mNew / b.m, cs = BB.cap2SOf ? BB.cap2SOf(b.S, B) : (b.S * Math.abs(b.S)), x1 = r2(fz * ((b.x1 / fz - b.S) * q + b.S)), x2 = r2(fz * ((b.x2 / fz - cs) * q + cs)), ok = x1 <= b.N && x2 <= b.N2;
    return Object.assign({}, b, { x1, x2, ok, wellUnder: ok && x1 <= b.N * 0.6, m: mNew }); }; });
const TUT12 = new Set(((JSON.parse(fs.readFileSync(path.join(ROOT, 'canonical', 'map-pools.json'), 'utf8')).maps.m1 || {}).submaps || {}).mtut12 || []);
const OVER_OK = new Set(['red-dragon', 'white-dragon', 'blue-dragon', 'green-dragon', 'black-dragon', 'caldera-wyrm']);
const HELD = { 'bee-drone': 'RECOST1-5 (owner: hold them)', 'worker-ant': 'RECOST1-5 (owner: hold them)' };
const WELL_UNDER = 0.6;
const r2 = v => Math.round(v * 100) / 100;
const NAMED = process.env.SKILL2_NO_NAMED ? { edits: {} } : { edits: {
  'marshal-of-rivergate': { attack: 4, health: 9, why: 'BUDGET2-5 (owner, via the coordinator): lift to 4/9 (was 2/3, 45% of N)' },
  // DECK1-5: Gannet Cliffs' five list cards clearly under the fair line (BUDGET2's contribution run, per copy: Peak Condor -2.3, Hawk
  // Arrowkeeper -2.2, Red-billed Chough -2.2, Peregrine Stooper -1.9, Conch Herald -1.5). On the canon's carriers +1 Attack is worth about
  // 2.0 win-rate points a copy and +1 Health 0.43 (the stat yardstick split by +1 Attack = 4.6 Health), so each gets +1 Attack, or Health
  // where the card's shape is Health (the Herald, an aura wall). Four of them fly: Flying is priced x1.39 on the stats (10.4 points on the
  // carriers) but measures 4.0 (SKILL2-2), which is why the lift breaks their budget on paper.
  'peak-condor': { attack: 4, health: 10, why: 'DECK1-5: onto the fair line (-2.3 a copy): 3/7 -> 4/7 still read -2.3 in the SKILL2 contribution run (it swings every other round), so 4/10' },
  'hawk-arrowkeeper': { attack: 2, health: 8, why: 'DECK1-5: onto the fair line (-2.2 a copy): 1/8 -> 2/8' },
  'red-billed-chough': { attack: 3, health: 2, why: 'DECK1-5: onto the fair line (-2.2 a copy): 2/2 -> 3/2' },
  'peregrine-stooper': { attack: 2, health: 8, why: 'DECK1-5: onto the fair line (-1.9 a copy): 1/8 -> 2/8' },
  'conch-herald': { attack: 2, health: 13, why: 'DECK1-5: onto the fair line (-1.5 a copy): 1/11 -> 1/13 read -1.6 in the SKILL2 contribution run, so 2/13' },
  // DECK1-1: the two of the four whose strength the re-priced skills do not explain (Executioner reads nothing on the carriers; Remember 1
  // with its trigger now 4.92 leaves the Ghoul at 90% of N): trimmed toward the fair line (BUDGET2: Ghoul +4.7 a copy, Hyena +3.2), checked
  // by the contribution run after the re-fit. The Quartermaster (Fletcher 0 -> 3.18) and the Wolf Spider Mother (Brood 2 4.4 -> 7.2) are
  // trimmed by the re-fit rule itself.
  'ashbone-ghoul': { attack: 1, health: 5, why: 'DECK1-1: toward the fair line (+4.7 a copy): 2/7 -> 2/5 still read +3.0 in the SKILL2 contribution run, so 1/5 (Remember 1 + its trigger re-priced 1.99 -> 4.92)' },
  // the two the re-fit rule trimmed (1/8, 3/7) still read +4.2 / +2.6 a copy in the SKILL2 contribution run: one step more
  'eagle-owl-quartermaster': { attack: 1, health: 6, why: 'DECK1-1: the re-fit rule gave 1/8 (Fletcher 0 -> 3.18, Arrow 1 3 -> 4.02), still +4.2 a copy over the fair line: 1/6' },
  'wolf-spider-mother': { attack: 2, health: 7, why: 'DECK1-1: the re-fit rule gave 3/7 (Brood 2 4.4 -> 7.2), still +2.6 a copy over the fair line: 2/7' },
  'grave-grin-hyena': { attack: 2, health: 10, why: 'DECK1-1: toward the fair line (+3.2 a copy): 2/14 -> 2/10 (Executioner reads nothing on the carriers: its strength is the body)' },
} };

function verdict(T, c) { const b = T.budget(c), b1 = T.budget(c, { level: 1 });
  let ok0 = true; if (TUT12.has(c.id)) { const st = G.statsAtLevel(c, 0), fx = Object.assign({}, c.effects || {}); Object.keys(c.levelSkills || {}).filter(k => +k > 0).forEach(k => Object.keys(c.levelSkills[k]).forEach(x => delete fx[x]));
    ok0 = T.budget(Object.assign({}, c, { attack: st.attack, health: st.health, effects: fx }), { level: 0 }).ok; }
  const over = !b.ok || !b1.ok || !ok0, under = !over && b.x1 <= b.N * WELL_UNDER;
  return { over, under, ok: !over && !under, use: b.N ? r2(b.x1 / b.N) : null, x1: b.x1, N: b.N, x2: b.x2, N2: b.N2, S: b.S, cap2: r2(b.x2 / b.N2) }; }
function fit(c, v, vOld) { const A0 = +c.attack || 0, H0 = +c.health || 0, e = c.effects || {};
  const lockA = !!(e.archer && !(Number(e.archer) < 0)) || !!e.hibernate || A0 === 0 || c.attack == null;
  const dir = v.over ? -1 : 1, best = [];
  const aSteps = lockA ? [0] : (dir < 0 ? [0, -1, -2, -3, -4, -5].filter(d => A0 + d >= 1) : [0, 1, 2, 3]);
  for (const dA of aSteps) { for (let k = 0; k <= 60; k++) { const dH = dir * k, H = H0 + dH; if (H < 1) break; if (!dA && !dH) continue;
    const t = Object.assign({}, c, { attack: c.attack == null ? c.attack : A0 + dA, health: H }), w = verdict(NEW, t);
    if (w.ok) { best.push({ dA, dH, cost: Math.abs(dA) / Math.max(1, A0) + Math.abs(dH) / Math.max(1, H0), pts: Math.abs(dA) + Math.abs(dH), use: w.use, w }); break; } } }
  if (!best.length) return null;
  best.sort((a, b) => a.cost - b.cost || a.pts - b.pts || (v.over ? b.use - a.use : a.use - b.use));
  const f = best[0];
  if (v.over && f.dA < 0) { for (let k = 1; k <= 30; k++) { const t = Object.assign({}, c, { attack: A0 + f.dA, health: H0 + f.dH + k }), w = verdict(NEW, t);
    if (!w.ok || w.use > Math.min(1, vOld.use) + 1e-9) break; f.give = k; f.w = w; f.use = w.use; } if (f.give) f.dH += f.give; }
  return f; }

function main() {
  // the cards as they were at BASE (before SKILL2), so the plan is the same on a re-run after the applier wrote it
  const cards = process.env.SKILL2_CARDS ? JSON.parse(fs.readFileSync(process.env.SKILL2_CARDS, 'utf8')) : JSON.parse(cp.execSync(`git show ${BASE}:canonical/cards.json`, { cwd: ROOT, maxBuffer: 256 << 20 }).toString());
  const rows = [], held = [], counts = { inPlay: 0, outOfPlay: 0, inPlayPushed: 0, outPushed: 0, outsideBefore: 0, outsideBeforeIds: [] };
  cards.forEach(c => {
    const d = D[c.id]; if (!d || c.pool || c.token || c.test || !SC.measured(c) || c.health == null) return;
    const inPlay = !LMP.isOutOfPlay(G, d); counts[inPlay ? 'inPlay' : 'outOfPlay']++;
    const vNew = verdict(NEW, c), vOld = verdict(OLD, c);
    const base = { id: c.id, name: c.name, rarity: c.rarity || 'common', inPlay, stats: `${c.attack == null ? '-' : c.attack}/${c.health}`,
      old: { use: vOld.use, N: vOld.N, x1: vOld.x1, S: vOld.S, verdict: vOld.over ? 'over' : vOld.under ? 'under' : 'ok' },
      new: { use: vNew.use, N: vNew.N, x1: vNew.x1, x2: vNew.x2, N2: vNew.N2, S: vNew.S, verdict: vNew.over ? 'over' : vNew.under ? 'under' : 'ok' } };
    const named = NAMED.edits[c.id];
    if (named) { const t = Object.assign({}, c, { attack: named.attack != null ? named.attack : c.attack, health: named.health != null ? named.health : c.health }), w = verdict(NEW, t);
      rows.push(Object.assign(base, { kind: 'named', why: named.why, dA: (t.attack || 0) - (c.attack || 0), dH: t.health - c.health, attack: t.attack, health: t.health, to: `${t.attack}/${t.health}`,
        after: { use: w.use, N: w.N, x1: w.x1, x2: w.x2, cap2: w.cap2, verdict: w.over ? 'over' : w.under ? 'under' : 'ok' } })); return; }
    if (vNew.ok) return;
    // ENG15 (coordinator, 10-31) reworks Anadromous and re-prices it: its carriers are left to that package
    if ((c.effects || {}).anadromous) { held.push(Object.assign(base, { why: 'Anadromous: ENG15 reworks and re-prices it' })); return; }
    if (!vOld.ok) { counts.outsideBefore++; counts.outsideBeforeIds.push(c.id + (inPlay ? '' : ' (out of play)')); return; }
    counts[inPlay ? 'inPlayPushed' : 'outPushed']++;
    if (HELD[c.id]) { held.push(Object.assign(base, { why: HELD[c.id] })); return; }
    if (OVER_OK.has(c.id)) { held.push(Object.assign(base, { why: 'owner call: over on purpose (the creature-ranks rule)' })); return; }
    const f = fit(c, vNew, vOld);
    if (!f) { held.push(Object.assign(base, { why: 'no stat change fits (its skills alone break a cap)' })); return; }
    // a fit that takes more than 40% of the card's 3A + H is not a re-fit but a new card: held with the cap-2 group (decision SKILL2-1)
    { const pts = A => 3 * (+A.attack || 0) + (+A.health || 0), after = { attack: (+c.attack || 0) + f.dA, health: c.health + f.dH };
      if (vNew.over && pts(after) < 0.6 * pts(c)) { held.push(Object.assign(base, { why: 'only ' + after.attack + '/' + after.health + ' fits (cap 2): more than 40% of its stats; held for SKILL2-1' })); return; } }
    const A = c.attack == null ? null : (+c.attack || 0) + f.dA, H = c.health + f.dH;
    rows.push(Object.assign(base, { kind: vNew.over ? 'trim' : 'lift', dA: f.dA, dH: f.dH, attack: A, health: H, to: `${A == null ? '-' : A}/${H}`, after: { use: f.w.use, N: f.w.N, x1: f.w.x1, x2: f.w.x2, cap2: f.w.cap2 } }));
  });
  const size = r => Math.abs(r.dA || 0) * 3 + Math.abs(r.dH || 0);
  rows.sort((a, b) => (b.inPlay - a.inPlay) || (a.kind < b.kind ? -1 : a.kind > b.kind ? 1 : 0) || size(b) - size(a) || (a.id < b.id ? -1 : 1));
  const out = { _about: 'SKILL2 (2026-10-31): the card re-fit after the skill re-pricing (canonical/skill-costs.json; the canon and the measured skills in 3A + H points). Built by node tools/skill2_refit_2026_10_31.js; applied by python3 tools/skill2_apply_cards_2026_10_31.py. old = the skill prices before SKILL2 (' + BASE + '), new = after. use = cap-1 left side / N at the start level.',
    built: '2026-10-31', base: BASE, counts, changes: rows, held };
  fs.writeFileSync(OUT, JSON.stringify(out, null, 1) + '\n');
  const ip = rows.filter(r => r.inPlay), op = rows.filter(r => !r.inPlay);
  console.log(`cards measured: ${counts.inPlay} in play, ${counts.outOfPlay} out of play; pushed out by the new prices: ${counts.inPlayPushed} in play, ${counts.outPushed} out of play; outside before (left): ${counts.outsideBefore}`);
  console.log(`changes: ${ip.length} in play (${ip.filter(r => r.kind === 'trim').length} trims, ${ip.filter(r => r.kind === 'lift').length} lifts, ${ip.filter(r => r.kind === 'named').length} named), ${op.length} out of play; held ${held.length}`);
  rows.forEach(r => console.log(`  ${r.inPlay ? 'IN ' : 'out'} ${r.kind.padEnd(6)} ${r.id.padEnd(28)} ${r.rarity.padEnd(10)} ${r.stats.padStart(6)} -> ${String(r.to).padEnd(6)} use ${r.old.use} -> ${r.new.use} -> ${r.after.use}  S ${r.old.S} -> ${r.new.S}`));
  held.forEach(r => console.log(`  held ${r.inPlay ? 'IN ' : 'out'} ${r.id} ${r.stats}: ${r.why} (use ${r.new.use}, S ${r.old.S} -> ${r.new.S}, cap 2 ${r.new.x2} / ${r.new.N2})`));
  console.log('wrote', path.relative(ROOT, OUT));
}
module.exports = { verdict, fit, NEW, OLD };
if (require.main === module) main();
