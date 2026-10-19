#!/usr/bin/env node
// The full card retune (2026-10-19, package BF3; owner 15:48: "Retune to our L/10 stats. Retune all cards base on your assumptions in the
// balance calculation in master hub. Balance our dragons and everything."). Every live card at Level 1 under the final budget (v5,
// N = (Base + L/10)(1 + L/30), Base with + 0.2 × Map; bramblewood-budget.js through tools/skill_costs.js) and today's skill costs
// (canonical/skill-costs.json, the applied measured S included), against the band the master hub's Skill costs tab uses:
//   over          2A+H+S > N or A·H+S > (N/3)² (both ×1.5 per half-miss skill; = is fine since 16:22) -> stats down until both pass
//   well under    2A+H+S ≤ 60% of N (the hub's pink, SB_WELL_UNDER)                      -> stats up to RAISE_TO (65%) of N
//   within        between                                                              -> unchanged
// A card must also pass at the level it starts at (a Base card's Lv 0 N is Base − 1), so the queue ends empty. Stats move by one factor on
// both (the card's shape: a wall stays 0 Attack, a glass cannon stays glass), the smallest that lands; a card stats can't fix (its skills
// alone fill N) is an owner call, left as it is. Live = what the balance tools measure (no tokens, tests, Hall of Fame, variants, fields),
// not a pool card, not an Easter egg, with stats.
//   node tools/card_retune_2026_10_19.js plan     -> docs/balance/card-retune-plan.json (+ the summary)
//   node tools/card_retune_2026_10_19.js apply    -> canonical/cards.json, a creatorNote "2026-10-19 retune (v5 L/10): was A/H" each
//   node tools/card_retune_2026_10_19.js doc      -> docs/balance/card-retune-2026-10-19.md
'use strict';
const fs = require('fs'), path = require('path');
const ROOT = path.join(__dirname, '..'), OUTDIR = path.join(ROOT, 'docs', 'balance');
const SC = require('./skill_costs.js'), T = SC.make(JSON.parse(fs.readFileSync(path.join(ROOT, 'canonical', 'skill-costs.json'), 'utf8')));
const CARDS_FILE = path.join(ROOT, 'canonical', 'cards.json'), PLAN_FILE = path.join(OUTDIR, 'card-retune-plan.json');
const WELL_UNDER = 0.6, RAISE_TO = 0.65;
const cmd = process.argv[2] || 'plan';
const isEgg = c=> !!(c.easterEgg || (c.source && c.source.kind === 'easteregg'));
// not the non-creatures (Materia, spells, equipment) nor the Nest's eggs (they hatch into a creature), which carry 0/x placeholders
const live = c=> SC.measured(c) && !c.pool && !isEgg(c) && (c.attack != null || c.health != null) && !['materia', 'spell', 'equipment'].includes(c.cardType) && !c.hatchInto;
const MAX_CUT = 0.5; // an over card that would lose more than half its stats is an owner call (its cost or skills are the problem)
const r1 = v=> Math.round(v * 10) / 10;

function check(c, A, H){ const d = Object.assign({}, c, {attack: A, health: H}), b1 = T.budget(d, {level: 1}), lv = SC.levelOf(c), bs = lv === 1 ? b1 : T.budget(d, {level: lv});
  return {b1, bs, ok: b1.ok && bs.ok, use: b1.x1 / b1.N}; }
// cards the owner keeps as printed (16:22: "Leave the Caldera Wyrm as printed; its extra power at 20-B-4 comes from the field"; decision B10)
const KEEP = {'caldera-wyrm': 'kept as printed (owner 16:22, decision B10): its power at 20-B-4 comes from the field; over its N at 0 Lumber'};
function plan(c){
  const A0 = c.attack || 0, H0 = c.health || 0, now = check(c, A0, H0);
  const out = {id: c.id, name: c.name, rarity: c.rarity || 'common', wait: c.wait || 0, cost: c.cost || 0, was: [A0, H0], N: now.b1.N, S: now.b1.S, m: now.b1.m, useWas: r1(now.use * 100)};
  if(KEEP[c.id]) return Object.assign(out, {verdict: 'owner', why: KEEP[c.id]});
  if(now.ok && now.use > WELL_UNDER){ out.verdict = 'within'; return out; }
  const scale = (f, healthOnly)=> healthOnly ? [A0, Math.max(1, Math.round(H0 * f))] : [A0 > 0 ? Math.max(1, Math.round(A0 * f)) : 0, Math.max(1, Math.round(H0 * f))];
  if(!now.ok){ // over: down, the smallest step that passes both rules at Level 1 and at its start level
    for(let f = 0.99; f >= 0.05; f -= 0.01){ const [A, H] = scale(f); if(A === A0 && H === H0) continue; const k = check(c, A, H);
      if(k.ok){ if(f < MAX_CUT) return Object.assign(out, {verdict: 'owner', why: `fitting it needs ${A}/${H} (×${Math.round(f * 100) / 100}): its ${c.cost || 0} Lumber / Wait ${c.wait || 0} at ${c.rarity} (N ${now.b1.N}) is too little for its skills (S ${now.b1.S}); a cost change, not a stat cut`}); return Object.assign(out, {verdict: 'over', now: [A, H], useNow: r1(k.use * 100)}); } }
    for(let H = H0; H >= 1; H--) for(let A = A0 > 0 ? 1 : 0; A <= (A0 > 0 ? 1 : 0); A++){ const k = check(c, A, H); if(k.ok) return Object.assign(out, {verdict: 'over', now: [A, H], useNow: r1(k.use * 100), note: 'stats alone barely fit: owner call on its skills'}); }
    return Object.assign(out, {verdict: 'owner', why: `its skills (S ${now.b1.S}${now.b1.m !== 1 ? ' ×' + now.b1.m : ''}) fill N ${now.b1.N} even at 1/1: a cost or skill change`});
  }
  // well under: up to RAISE_TO of N, keeping the shape; a high-Attack card that hits A·H first grows Health only
  for(const healthOnly of [false, true]){
    for(let f = 1.01; f <= 8; f += 0.01){ const [A, H] = scale(f, healthOnly); if(A === A0 && H === H0) continue; const k = check(c, A, H); if(!k.ok) break; if(k.use >= RAISE_TO) return Object.assign(out, {verdict: 'under', now: [A, H], useNow: r1(k.use * 100), healthOnly: healthOnly || undefined}); }
  }
  return Object.assign(out, {verdict: 'owner', why: `well under (${out.useWas}% of N) and no shape-keeping step lands inside both rules`});
}

// 2026-10-19 (BF4): required as a module (tools/fold_server_overrides_2026_10_19.js) it runs nothing and hands over the same rules
if(require.main !== module){ module.exports = {plan, check, live, KEEP, WELL_UNDER, RAISE_TO, MAX_CUT, T, SC}; }
else if(cmd === 'plan'){
  const cards = JSON.parse(fs.readFileSync(CARDS_FILE, 'utf8')).filter(live), rows = cards.map(plan);
  const by = v=> rows.filter(r=> r.verdict === v);
  const out = {_about: 'Full card retune (2026-10-19, package BF3): every live card at Level 1 under budget v5 (L/10, + 0.2 x Map) and today\'s skill costs, to the master hub\'s band: over (2A+H+S >= N or A*H+S >= (N/3)^2) down until both pass, well under (2A+H+S <= 60% of N) up to 65% of N; within left alone. tools/card_retune_2026_10_19.js.',
    generated: '2026-10-19', band: {wellUnder: WELL_UNDER, raiseTo: RAISE_TO}, cards: rows.length, within: by('within').length, over: by('over').length, under: by('under').length, owner: by('owner').length, rows};
  fs.writeFileSync(PLAN_FILE, JSON.stringify(out, null, 1) + '\n');
  console.log(`${rows.length} live cards: ${out.within} within, ${out.over} over -> fitted down, ${out.under} well under -> raised, ${out.owner} owner calls`);
  by('owner').forEach(r=> console.log('  owner:', r.name, r.was.join('/'), r.why));
} else if(cmd === 'apply'){
  const P = JSON.parse(fs.readFileSync(PLAN_FILE, 'utf8')), all = JSON.parse(fs.readFileSync(CARDS_FILE, 'utf8')), by = {}; all.forEach(c=> by[c.id] = c); let n = 0;
  P.rows.filter(r=> r.now).forEach(r=>{ const c = by[r.id]; if(!c) throw new Error('no card ' + r.id);
    if(c.attack !== r.was[0] || c.health !== r.was[1]) throw new Error(`${r.id} is not ${r.was.join('/')} any more: re-plan`);
    c.attack = r.now[0]; c.health = r.now[1]; n++;
    c.creatorNote = ((c.creatorNote || '') + ` 2026-10-19 retune (v5 L/10): was ${r.was.join('/')} (${r.verdict === 'over' ? 'over budget' : 'well under'}: 2A+H+S ${r.useWas}% -> ${r.useNow}% of N ${r.N}).`).trim(); });
  fs.writeFileSync(CARDS_FILE, JSON.stringify(all, null, 2).replace(/[\u0080-￿]/g, ch=> '\\u' + ch.charCodeAt(0).toString(16).padStart(4, '0')) + '\n');
  console.log('applied', n, 'cards');
} else if(cmd === 'restore'){
  // the stats before the retune, from each card's note (for a re-run under new rules: 16:22's inclusive budget and Thorns' new cost)
  const all = JSON.parse(fs.readFileSync(CARDS_FILE, 'utf8')); let n = 0;
  const RE = / ?2026-10-19 retune \(v5 L\/10\): was (\d+)\/(\d+) \([^)]*\)\./;
  all.forEach(c=>{ const m = RE.exec(c.creatorNote || ''); if(!m) return; c.attack = +m[1]; c.health = +m[2]; c.creatorNote = c.creatorNote.replace(RE, '').trim(); if(!c.creatorNote) delete c.creatorNote; n++; });
  fs.writeFileSync(CARDS_FILE, JSON.stringify(all, null, 2).replace(/[\u0080-\uffff]/g, ch=> '\\u' + ch.charCodeAt(0).toString(16).padStart(4, '0')) + '\n');
  console.log('restored', n, 'cards');
} else if(cmd === 'doc'){
  const P = JSON.parse(fs.readFileSync(PLAN_FILE, 'utf8')), ch = P.rows.filter(r=> r.now), own = P.rows.filter(r=> r.verdict === 'owner');
  const md = ['# The full card retune, 2026-10-19 (package BF3)', '',
    'Owner (15:48): "Retune to our L/10 stats. Retune all cards base on your assumptions in the balance calculation in master hub. Balance our dragons and everything."', '',
    '## The rule', '',
    `- **The budget:** v5, N = (Base + L/10) × (1 + L/30), at **Level 1**, and a card must also pass at the level it starts at (a Base card\'s Lv 0: Base − 1). Base = 20 + Rarity + 6×Wait + 0.5×Wait² + 4×Lumber + 0.4×Lumber² + Ritual + 0.2 × Map (the map it becomes obtainable on).`,
    '- **The skill costs:** `canonical/skill-costs.json` as it is, the applied measured S included.',
    `- **The band:** the master hub\'s Skill costs tab. A card is **over** when 2A+H+S > N or A·H+S > (N/3)² (equal is fine, owner 16:22) (both ×1.5 per half-miss skill), **well under** (pink) when 2A+H+S ≤ ${WELL_UNDER * 100}% of N, and **within** between. Over cards come down until both rules pass; well-under cards go up to ${RAISE_TO * 100}% of N, a few points inside the band so rounding never puts them back; cards within are left alone.`,
    '- **The shape:** Attack and Health move by one factor, so a wall keeps 0 Attack and a glass cannon stays glass. Where a high-Attack card would break the A·H rule first, only its Health grows.',
    '- **Not changed:** costs, Wait, rarities and skills. A card that stats can\'t fix is an owner call (below).', '',
    '## Summary', '',
    '| | Cards |', '|---|---|',
    `| Live cards checked | ${P.cards} |`, `| Within, unchanged | ${P.within} |`, `| Over, fitted down | ${P.over} |`, `| Well under, raised | ${P.under} |`, `| Owner calls | ${P.owner} |`, '',
    '## Every change', '',
    '| Card | Rarity | Wait / Lumber | Was | Now | N (Lv 1) | 2A+H+S was | now | Why |', '|---|---|---|---|---|---|---|---|---|',
    ...ch.sort((a, b)=> a.name.localeCompare(b.name)).map(r=> `| ${r.name} | ${r.rarity} | ${r.wait} / ${r.cost} | ${r.was.join('/')} | ${r.now.join('/')} | ${r.N} | ${r.useWas}% | ${r.useNow}% | ${r.verdict === 'over' ? 'over budget' : 'well under'}${r.healthOnly ? ', Health only' : ''}${r.note ? '; ' + r.note : ''} |`), '',
    '## Owner calls', '',
    ...(own.length ? ['| Card | Stats | N | Why |', '|---|---|---|---|', ...own.map(r=> `| ${r.name} | ${r.was.join('/')} | ${r.N} | ${r.why} |`)] : ['None: every live card landed in the band with a stat change.']), ''];
  fs.writeFileSync(path.join(ROOT, 'docs', 'balance', 'card-retune-2026-10-19.md'), md.join('\n'));
  console.log('wrote docs/balance/card-retune-2026-10-19.md');
}
