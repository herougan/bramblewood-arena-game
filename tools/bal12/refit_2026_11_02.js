#!/usr/bin/env node
// 2026-11-02 (package BAL12, owner BAL11-2 a / BAL11-4 a, 19:56: "re-fit the cards the new formula reads over or well under"): every in-play
// card the budget reads over (a cap broken) or well under (cap 1 at or below 60% of N) after BAL12's prices (the canon at the road's
// bramble Health, the Lumber makers by their lists' mean cost, the tighter cap 2 of a 0-Lumber Rare) gets the existing fit
// (tools/bal9/cards_2026_11_02.js fitCard: BUDGET2's smallest relative stat change into the band, else the shape scan), and is applied only
// when each stat moves by at most 2 and the body keeps its shape (tools/pipeline/config.json refit.themeShapes: hitter / balanced / wall,
// and its last point of Attack). Not touched and listed: eggs and equipment, the owner's named cards (config.json refit.ownerCards), cards
// whose creatorNote says the owner set them, the three cards BAL11 held (Glass Octopus, Subterraneaner, Badger Sapper: the owner picks
// their lines, BAL11-2) and the cards no fit within the rule reaches (held, with the fit as a proposal).
//   node tools/bal12/refit_2026_11_02.js [--apply] [--check]   -> docs/balance/bal12/refit-2026-11-02.json
'use strict';
process.env.SKILL2_MISSMULT = process.env.SKILL2_MISSMULT || '1';
process.env.SKILL2_NO_NAMED = '1';
const fs = require('fs'), path = require('path'), cp = require('child_process');
const ROOT = path.join(__dirname, '..', '..');
const F = (() => { const log = console.log; console.log = () => {}; try { return require('../bal9/cards_2026_11_02.js'); } finally { console.log = log; } })() /* its command line prints its help when required */, R = require('../skill2_refit_2026_10_31.js');
const LB = require('../lib_bramble.js'), G = LB.G, D = LB.CARD_DEFS_BASELINE, LP = require('../lib_map_pools.js');
const CFG = JSON.parse(fs.readFileSync(path.join(ROOT, 'tools', 'pipeline', 'config.json'), 'utf8'));
const OUT = path.join(ROOT, 'docs', 'balance', 'bal12', 'refit-2026-11-02.json');
const OWNER_NOTE = /owner[^.]{0,60}\b(set|tune|tuned|chose|picked|asked for|wants?)\b[^.]{0,40}\b(stat|attack|health|\d+\/\d+)/i;
const HELD = { 'glass-octopus': 'BAL11-2: the owner picks its line', subterraneaner: 'BAL11-2: the owner picks its line', 'badger-sapper': 'BAL11-2: the owner picks its line' };
const MAXD = CFG.refit.maxStatPoints || 2, SHAPES = CFG.refit.themeShapes;
const shapeOf = (A, H) => { const r = (+A || 0) / Math.max(1, +H || 1); return SHAPES.findIndex(([lo, hi]) => r >= lo && r < hi); };
const NAMES = ['hitter', 'balanced', 'wall'];
const cards = JSON.parse(fs.readFileSync(path.join(ROOT, 'canonical', 'cards.json'), 'utf8'));
const owner = new Set(CFG.refit.ownerCards), edits = [], listed = [], held = [];
for (const c of cards) {
  const d = D[c.id]; if (!d || c.pool || c.token || c.test || c.health == null) continue;
  if (LP.isOutOfPlay(G, d)) continue;
  const v = R.verdict(R.NEW, c); if (v.ok) continue;
  const base = { id: c.id, rarity: c.rarity, lumber: c.cost || 0, wait: c.wait || 0, stats: `${c.attack == null ? '-' : c.attack}/${c.health}`, verdict: v.over ? 'over' : 'under', use: v.use, cap2: v.cap2, S: v.S, N: v.N };
  if (/^egg-/.test(c.id) || (c.effects || {}).egg || c.cardType === 'equipment' || d.equip) { listed.push(Object.assign(base, { why: 'egg / equipment: priced its own way' })); continue; }
  if (owner.has(c.id)) { listed.push(Object.assign(base, { why: 'named owner card (' + CFG.refit.ownerWhy + ')' })); continue; }
  if (HELD[c.id]) { listed.push(Object.assign(base, { why: 'held: ' + HELD[c.id] })); continue; }
  if (OWNER_NOTE.test(c.creatorNote || '')) { listed.push(Object.assign(base, { why: 'creatorNote: the owner set it ("' + ((c.creatorNote || '').match(OWNER_NOTE) || [''])[0].slice(0, 90) + '")' })); continue; }
  if ((c.effects || {}).anadromous) { listed.push(Object.assign(base, { why: 'Anadromous: ENG15 prices it' })); continue; }
  const f = F.fitCard(c);
  if (!f || f.w.over) { held.push(Object.assign(base, { why: 'no stat change fits the band (its skills alone break a cap)' })); continue; }
  const A0 = +c.attack || 0, H0 = +c.health || 0, A1 = f.attack == null ? null : +f.attack, H1 = +f.health, dA = c.attack == null ? 0 : A1 - A0, dH = H1 - H0;
  const to = `${A1 == null ? '-' : A1}/${H1}`, s0 = shapeOf(A0, H0), s1 = shapeOf(A1 || 0, H1);
  const problems = [];
  if (Math.abs(dA) > MAXD || Math.abs(dH) > MAXD) problems.push(`a stat moves more than ${MAXD} (${dA >= 0 ? '+' : ''}${dA} Attack, ${dH >= 0 ? '+' : ''}${dH} Health)`);
  if (c.attack != null && s0 !== s1) problems.push(`body shape ${NAMES[s0]} -> ${NAMES[s1]}`);
  if (A0 >= 1 && c.attack != null && !(A1 >= 1)) problems.push('loses its last point of Attack');
  if (problems.length) {
    // the fit broke the rule: the nearest line within it (each stat within MAXD, the same shape, Attack kept), the smallest relative change
    let alt = null; const lockA = c.attack == null || A0 === 0 || !!(c.effects || {}).archer || !!(c.effects || {}).hibernate;
    for (let da = -MAXD; da <= MAXD; da++) for (let dh = -MAXD; dh <= MAXD; dh++) { if (!da && !dh) continue; if (lockA && da) continue; const A = A0 + da, H = H0 + dh; if (H < 1 || (A0 >= 1 && A < 1)) continue;
      if (c.attack != null && shapeOf(A, H) !== s0) continue; const w = R.verdict(R.NEW, Object.assign({}, c, { attack: c.attack == null ? null : A, health: H })); if (!w.ok) continue;
      const cost = Math.abs(da) / Math.max(1, A0) + Math.abs(dh) / Math.max(1, H0); if (!alt || cost < alt.cost || (cost === alt.cost && (v.over ? w.use > alt.w.use : w.use < alt.w.use))) alt = { A, H, w, cost, da, dh }; }
    if (!alt) { held.push(Object.assign(base, { proposal: to, proposalUse: f.w.use, why: problems.join('; ') + '; no line within the rule fits' })); continue; }
    const set = { health: alt.H }; if (c.attack != null) set.attack = alt.A; const to2 = `${c.attack == null ? '-' : alt.A}/${alt.H}`;
    edits.push({ id: c.id, set, from: base, to: to2, use: alt.w.use, note: `budget fit ${base.stats} -> ${to2}: it read ${base.verdict} the budget band after BAL12's prices (cap-1 use ${v.use} of N, S ${v.S}), now ${alt.w.use} (the nearest line within ${MAXD} a stat that keeps its shape; the plain fit ${to} broke it; docs/balance/bal12/)` });
    continue; }
  const set = { health: H1 }; if (c.attack != null) set.attack = A1;
  edits.push({ id: c.id, set, from: base, to, use: f.w.use, note: `budget fit ${base.stats} -> ${to}: it read ${base.verdict} the budget band after BAL12's prices (cap-1 use ${v.use} of N, S ${v.S}), now ${f.w.use} (${f.how}; each stat within ${MAXD}, shape kept; docs/balance/bal12/)` });
}
const plan = { _about: 'BAL12 (2026-11-02): in-play cards outside the budget band after BAL12 (canon at bramble 15, Lumber makers by their lists, tempo cap 2), re-fit within 2 a stat, shape kept; tools/bal12/refit_2026_11_02.js', built: '2026-11-02', edits, held, listed };
if (!process.argv.includes('--check')) { fs.mkdirSync(path.dirname(OUT), { recursive: true }); fs.writeFileSync(OUT, JSON.stringify(plan, null, 1) + '\n'); }
console.log(`re-fit: ${edits.length}; held (no fit within the rule): ${held.length}; listed (not ours to change): ${listed.length}`);
edits.forEach(e => console.log(`  fit  ${e.id.padEnd(28)} ${String(e.from.rarity).padEnd(9)} ${e.from.verdict.padEnd(5)} ${e.from.stats} -> ${e.to} (use ${e.from.use} -> ${e.use})`));
held.forEach(x => console.log(`  held ${x.id} ${x.stats} ${x.verdict} use ${x.use}${x.proposal ? ' (fit ' + x.proposal + ')' : ''}: ${x.why}`));
listed.forEach(x => console.log(`  listed ${x.id} ${x.stats} ${x.verdict} use ${x.use}: ${x.why}`));
if (process.argv.includes('--apply') && edits.length) { const r = cp.spawnSync('python3', [path.join(__dirname, 'apply_cards_2026_11_02.py'), OUT], { cwd: ROOT, encoding: 'utf8' }); process.stdout.write(r.stdout || ''); process.stderr.write(r.stderr || ''); if (r.status) process.exit(1); }
