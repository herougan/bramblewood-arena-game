#!/usr/bin/env node
// N halved, every card re-derived (2026-10-19, package BF5; owner 21:36: "I think numbers are way too big. Can we HALF everything? This will
// cause a big rollback in our current balancing." / "Straight up, the total N value" / rounding: "Retune decides").
//
// The budget's N is now 0.5 × v5's (bramblewood-budget.js `scale`); skill costs (S) stay as they are, Bounty doubled (0.5 -> 1 a point,
// owner 21:36: "Bounty is way too strong. Let bounty N = N * 2."). Every live card's Attack / Health at Level 1 is re-derived:
//   - its place in the band is kept: the share of N its 2A+H+S filled under v5 (BF3 / BF4's numbers, Bounty at 0.5), held between the
//     band's floor (over 60%) and N itself; the new stats are the A:H shape scaled by one factor, rounded, whose 2A+H+S share of the
//     halved N lands closest to it (from below where it can) while both rules hold (2A+H+S <= N, A·H+S <= (N/3)², x1.5 a half-miss skill;
//     inclusive) at Level 1 and at the card's start level. Attack 0 stays 0, an Attack stays at least 1, Health at least 1.
//   - a card whose skills alone fill the halved N (S >= N, nothing left for stats), or that no stats fit, is an owner call: left as it is,
//     its skills not stripped.
//   - the owner's own targets: the Cave Bat Swarm 1/2 (21:36, "Okay to make cave bat swarm 1/2."), checked against the rules.
//   - outside the band (no budget of their own), halved in proportion: the Caldera Wyrm (kept as printed in BF3 by decision B10: its power
//     is the field's; "a halving applies to it too"), the tokens the skills put on the board, the Easter eggs, the Nest's eggs and the
//     Blacksmith's equipment (stat bonuses). Materia, spells, fields, test cards and pool cards are not touched.
// creatorNote "2026-10-19 halve (BF5): was A/H". Only attack, health and creatorNote are written (the parallel skill packages merge clean).
//   node tools/halve_2026_10_19.js plan    -> docs/balance/halve-plan-2026-10-19.json (+ the summary)
//   node tools/halve_2026_10_19.js apply   -> canonical/cards.json
//   node tools/halve_2026_10_19.js doc     -> docs/balance/halve-2026-10-19.md
'use strict';
const fs = require('fs'), path = require('path');
const ROOT = path.join(__dirname, '..'), R = require('./card_retune_2026_10_19.js'), SC = R.SC;
const CARDS_FILE = path.join(ROOT, 'canonical', 'cards.json'), PLAN_FILE = path.join(ROOT, 'docs', 'balance', 'halve-plan-2026-10-19.json');
const TABLE = JSON.parse(fs.readFileSync(path.join(ROOT, 'canonical', 'skill-costs.json'), 'utf8'));
const T = SC.make(TABLE);
// v5 as it stood before BF5 (scale 1, Bounty 0.5): each card's place in the band
const OLD = JSON.parse(JSON.stringify(TABLE)); OLD.budget.scale = 1; { const b = (OLD.skills || []).find(s=> s.id === 'bounty'); if(b) b.value = b.prevValue != null ? b.prevValue : 0.5; }
const T0 = SC.make(OLD);
const BAND_LO = 0.6, BAND_HI = 1, cmd = process.argv[2] || 'plan';
const TARGET = {'cave-bat-swarm': [1, 2]}; // owner 21:36
const PROPORTION = {'caldera-wyrm': 'outside the band (decision B10: printed = obtained, its power at 20-B-4 is the field\'s); halved in proportion'};
const isEgg = c=> !!(c.easterEgg || (c.source && c.source.kind === 'easteregg'));
const r2 = v=> Math.round(v * 100) / 100;
function chk(Tb, c, A, H){ const d = Object.assign({}, c, {attack: A, health: H}), lv = SC.levelOf(c), b1 = Tb.budget(d, {level: 1}), bs = lv === 1 ? b1 : Tb.budget(d, {level: lv});
  return {b1, ok: b1.ok && bs.ok, use: b1.x1 / b1.N}; }
const half = (A, H)=> [A == null ? A : A > 0 ? Math.max(1, Math.round(A / 2)) : 0, H == null ? H : H > 0 ? Math.max(1, Math.round(H / 2)) : 0];

function planCard(c){
  const A0 = c.attack || 0, H0 = c.health || 0, old = chk(T0, c, A0, H0), now = chk(T, c, A0, H0);
  const row = {id: c.id, name: c.name, rarity: c.rarity || 'common', wait: c.wait || 0, cost: c.cost || 0, was: [A0, H0], S: now.b1.S, N: now.b1.N, N0: old.b1.N, use0: r2(old.use), m: now.b1.m};
  if(TARGET[c.id]){ const [A, H] = TARGET[c.id], k = chk(T, c, A, H);
    return Object.assign(row, {now: [A, H], use: r2(k.use)}, k.ok ? {verdict: 'target', why: 'the owner\'s target (21:36)'} : {verdict: 'owner', why: `the owner's ${A}/${H} (21:36), applied; it does not fit: 2A+H+S ${r2(k.b1.x1)}${row.m !== 1 ? ' (×' + row.m + ')' : ''} vs N ${k.b1.N}, its skills (S ${row.S}) are the owner's call`}); }
  // an owner call is halved in proportion ("HALF everything": it doesn't stay at twice the size of the rest) and flagged; its skills stay
  const ownerHalf = why=>{ const hn = half(A0, H0), k = chk(T, c, hn[0], hn[1]); return Object.assign(row, {verdict: 'owner', now: hn, use: r2(k.use), why: why + '; halved in proportion, skills not stripped'}); };
  if(now.b1.S * now.b1.m >= now.b1.N) return ownerHalf(`its skills alone fill the halved N (S ${now.b1.S}${now.b1.m !== 1 ? ' ×' + now.b1.m : ''} >= N ${now.b1.N})`);
  const want = Math.min(BAND_HI, Math.max(BAND_LO + 0.01, old.use)); row.want = r2(want);
  const seen = new Set(), cand = [];
  for(let f = 1; f >= 0.01; f -= 0.005){ const A = A0 > 0 ? Math.max(1, Math.round(A0 * f)) : 0, H = Math.max(1, Math.round(H0 * f)), key = A + '/' + H;
    if(seen.has(key)) continue; seen.add(key); const k = chk(T, c, A, H); if(k.ok) cand.push({A, H, use: k.use}); }
  if(!cand.length) return ownerHalf(`no stats fit the halved N even at ${A0 > 0 ? 1 : 0}/1 (S ${now.b1.S}${now.b1.m !== 1 ? ', ×' + now.b1.m + ' for its half-miss skill' : ''}, N ${now.b1.N})`);
  const inBand = cand.filter(x=> x.use > BAND_LO && x.use <= BAND_HI);
  const below = inBand.filter(x=> x.use <= want + 1e-9).sort((a, b)=> b.use - a.use), above = inBand.filter(x=> x.use > want).sort((a, b)=> a.use - b.use);
  const pick = below[0] && (!above[0] || want - below[0].use <= above[0].use - want + 0.02) ? below[0] : above[0] || cand.sort((a, b)=> b.use - a.use)[0];
  return Object.assign(row, {verdict: pick.use > BAND_LO ? 'band' : 'under', now: [pick.A, pick.H], use: r2(pick.use)});
}
function planAll(){
  const cards = JSON.parse(fs.readFileSync(CARDS_FILE, 'utf8')), rows = [], prop = [];
  cards.forEach(c=>{
    if(c.attack == null && c.health == null) return;
    if(PROPORTION[c.id] || (c.token && SC.measured(Object.assign({}, c, {token: false}))) || isEgg(c) || c.cardType === 'equipment' || (c.hatchInto && !c.pool)){
      const now = half(c.attack, c.health), kind = PROPORTION[c.id] ? 'wyrm' : c.token ? 'token' : isEgg(c) ? 'easter egg' : c.cardType === 'equipment' ? 'equipment' : 'nest egg';
      if(now[0] !== c.attack || now[1] !== c.health) prop.push({id: c.id, name: c.name, kind, was: [c.attack, c.health], now, why: PROPORTION[c.id] || 'halved in proportion (no budget band of its own)'});
      return; }
    if(R.live(c)) rows.push(planCard(c));
  });
  const by = v=> rows.filter(r=> r.verdict === v);
  const out = {_about: 'BF5 (2026-10-19, owner 21:36): N halved (scale 0.5), Bounty 1 a point; every live card re-derived at Level 1 keeping its share of N inside the band; the cards outside the band halved in proportion',
    generated: '2026-10-19', cards: rows.length, band: by('band').length, under: by('under').length, target: by('target').length, owner: by('owner').length, proportion: prop.length,
    skillsFillN: rows.filter(r=> r.verdict === 'owner' && /skills alone/.test(r.why)).map(r=> r.id), rows, prop};
  return out;
}
const NOTE = (was, owner)=> `2026-10-19 halve (BF5): was ${was.map(v=> v == null ? '-' : v).join('/')}${owner ? ' (owner call: its skills don\'t fit the halved N; halved in proportion)' : ''}.`;
if(cmd === 'plan' || cmd === 'apply'){
  const P = planAll(); fs.writeFileSync(PLAN_FILE, JSON.stringify(P, null, 1) + '\n');
  console.log(`${P.cards} live cards: ${P.band} re-derived in the band, ${P.under} under it (the floor of their shape), ${P.target} at the owner's target, ${P.owner} owner calls; ${P.proportion} halved in proportion`);
  console.log('skills alone fill the halved N:', P.skillsFillN.length, P.skillsFillN.join(', '));
  P.rows.filter(r=> r.verdict === 'owner' && !/skills alone/.test(r.why)).forEach(r=> console.log('  owner:', r.id, r.why));
  if(cmd === 'apply'){
    const cards = JSON.parse(fs.readFileSync(CARDS_FILE, 'utf8')), by = {}; cards.forEach(c=> by[c.id] = c); let n = 0;
    P.rows.filter(r=> r.now).concat(P.prop).forEach(r=>{ const c = by[r.id]; if(c.attack !== r.was[0] && !(c.attack == null && r.was[0] === 0) || c.health !== r.was[1] && !(c.health == null && r.was[1] === 0)) throw new Error(r.id + ' changed since the plan');
      if(r.now[0] === r.was[0] && r.now[1] === r.was[1]) return;
      if(c.attack != null || r.now[0]) c.attack = r.now[0]; if(c.health != null || r.now[1]) c.health = r.now[1];
      c.creatorNote = ((c.creatorNote || '') + ' ' + NOTE(r.was, r.verdict === 'owner')).trim(); n++; });
    fs.writeFileSync(CARDS_FILE, JSON.stringify(cards, null, 2).replace(/[\u0080-￿]/g, ch=> '\\u' + ch.charCodeAt(0).toString(16).padStart(4, '0')) + '\n');
    console.log('applied', n, 'cards');
  }
} else if(cmd === 'doc'){
  const P = JSON.parse(fs.readFileSync(PLAN_FILE, 'utf8')), st = a=> a.map(v=> v == null ? '-' : v).join('/'), pct = v=> Math.round(v * 100) + '%';
  const owner = P.rows.filter(r=> r.verdict === 'owner'), ch = P.rows.filter(r=> r.now);
  const md = ['# N halved, every card re-derived, 2026-10-19 (package BF5)', '',
    'Owner (21:36): "I think numbers are way too big. Can we HALF everything? This will cause a big rollback in our current balancing." Asked what to halve: "Straight up, the total N value". On rounding: "Retune decides".', '',
    '## The rule', '',
    '- **N is halved:** N(L) = 0.5 × (Base + L/10) × (1 + L/30), and Level 0 is 0.5 × (Base − 1). Base, the Level terms and the Map term are all halved. It is one constant, `scale` in `bramblewood-budget.js`, and it appears in the `budget` line of `canonical/skill-costs.json`, the Test Lab and the hub\'s Budget & stats tab. The A·H rule is (N/3)² of the halved N.',
    '- **Skill costs stay as they are.** The owner said to halve N only. Bounty doubles, from 0.5 to 1 a point (owner 21:36: "Bounty is way too strong. Let bounty N = N * 2."). Skill-heavy cards therefore lose relatively more of their stats.',
    `- **Each live card keeps its place in the band.** That place is the share of N its 2A+H+S filled under v5, held between just over 60% and 100%. The new stats are the card's A:H shape scaled by one factor and rounded, whose share of the halved N lands closest to that place, from below where it can. Both rules must hold, inclusive, at Level 1 and at the card's start level. Attack 0 stays 0, a non-zero Attack stays at least 1, and Health is at least 1.`,
    '- **The owner\'s target:** the Cave Bat Swarm is 1/2 (21:36: "Okay to make cave bat swarm 1/2.").',
    '- **Halved in proportion:** cards outside the band, which have no budget of their own. These are the Caldera Wyrm (kept as printed in BF3 under decision B10, but "a halving applies to it too"), the tokens skills put on the board, the Easter eggs, the Nest\'s eggs and the Blacksmith\'s equipment.',
    '- **Not touched:** materia, spells, fields, test cards and pool cards.',
    '- **Only `attack`, `health` and `creatorNote` are written.** The note reads "2026-10-19 halve (BF5): was A/H".', '',
    '## Summary', '', '| | Cards |', '|---|---|',
    `| Live cards | ${P.cards} |`, `| Re-derived in the band | ${P.band} |`, `| Under the band (the floor of their shape) | ${P.under} |`, `| At the owner\'s target | ${P.target} |`, `| Owner calls | ${P.owner} |`, `| Halved in proportion (outside the band) | ${P.proportion} |`, '',
    `**Skills that alone fill the halved N** (S ≥ N, nothing left for stats): **${P.skillsFillN.length}**. These are owner calls. They are left as they are, and their skills are not stripped.`, '',
    ...(owner.length ? ['## Owner calls', '', 'These cards\' skills don\'t fit the halved N. Each one is **halved in proportion** (it doesn\'t stay at twice the size of the rest) and flagged. Its skills are not stripped. The fix is the owner\'s: a skill, its cost, or the card\'s Wait or Lumber.', '', '| Card | Rarity | Wait / Lumber | Was | Now | S | N (halved, Lv 1) | Why |', '|---|---|---|---|---|---|---|---|',
      ...owner.map(r=> `| ${r.name} | ${r.rarity} | ${r.wait} / ${r.cost} | ${st(r.was)} | ${st(r.now)} | ${r.S}${r.m !== 1 ? ' ×' + r.m : ''} | ${r.N} | ${r.why} |`), ''] : []),
    '## Halved in proportion', '', '| Card | Kind | Was | Now |', '|---|---|---|---|', ...P.prop.map(r=> `| ${r.name} | ${r.kind} | ${st(r.was)} | ${st(r.now)} |`), '',
    '## Every live card', '', '| Card | Rarity | Wait / Lumber | Was | Now | N v5 → halved | Share of N, v5 → now | S |', '|---|---|---|---|---|---|---|---|',
    ...ch.slice().sort((a, b)=> a.name.localeCompare(b.name)).map(r=> `| ${r.name} | ${r.rarity} | ${r.wait} / ${r.cost} | ${st(r.was)} | **${st(r.now)}** | ${r.N0} → ${r.N} | ${pct(r.use0)} → ${pct(r.use)} | ${r.S} |`), ''];
  fs.writeFileSync(path.join(ROOT, 'docs', 'balance', 'halve-2026-10-19.md'), md.join('\n'));
  console.log('wrote docs/balance/halve-2026-10-19.md');
}
