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
const OUT = path.join(ROOT, 'docs', 'balance', 'skill2-refit-2026-10-31.json');
const NEWT = JSON.parse(fs.readFileSync(path.join(ROOT, 'canonical', 'skill-costs.json'), 'utf8'));
const OLDT = JSON.parse(cp.execSync(`git show ${BASE}:canonical/skill-costs.json`, { cwd: ROOT, maxBuffer: 64 << 20 }).toString());
const NEW = SC.make(NEWT), OLD = SC.make(OLDT);
const TUT12 = new Set(((JSON.parse(fs.readFileSync(path.join(ROOT, 'canonical', 'map-pools.json'), 'utf8')).maps.m1 || {}).submaps || {}).mtut12 || []);
const OVER_OK = new Set(['red-dragon', 'white-dragon', 'blue-dragon', 'green-dragon', 'black-dragon', 'caldera-wyrm']);
const HELD = { 'bee-drone': 'RECOST1-5 (owner: hold them)', 'worker-ant': 'RECOST1-5 (owner: hold them)' };
const WELL_UNDER = 0.6;
const r2 = v => Math.round(v * 100) / 100;
const NAMED = { edits: {
  'marshal-of-rivergate': { attack: 4, health: 9, why: 'BUDGET2-5 (owner, via the coordinator): lift to 4/9 (was 2/3, 45% of N)' },
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
  const cards = JSON.parse(fs.readFileSync(path.join(ROOT, 'canonical', 'cards.json'), 'utf8'));
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
