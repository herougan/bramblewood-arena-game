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
//     is the field's; "a halving applies to it too"), the tokens the skills put on the board, the Nest's eggs and the
//     Blacksmith's equipment (stat bonuses). (10-21: the Easter eggs go through the band; an equipment egg is measured with its grant.) Materia, spells, fields, test cards and pool cards are not touched.
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
const OLD = JSON.parse(JSON.stringify(TABLE)); Object.assign(OLD.budget, {scale: 1, plainBonus: 1, lightBonus: 1, fragileMult: 1}); // v5: no halving, no N multipliers (BF5 10-21)
{ const b = [].concat(OLD.skills || [], OLD.triggers || []).find(s=> s.id === 'bounty'); if(b) b.value = 0.5; } // Bounty at the owner's 0.5 (BF5 doubled it)
// 2026-10-21 (BF5): each card's place in the v5 band is read from it as it stood before the two-skill cut and the halving (its skills then:
// a card that lost one gets that room back as stats), docs/balance/halve-ref-2026-10-21.json
const REF = (()=>{ try{ return JSON.parse(fs.readFileSync(path.join(ROOT, 'docs', 'balance', 'halve-ref-2026-10-21.json'), 'utf8')).cards; }catch(e){ return {}; } })();
const T0 = SC.make(OLD);
const BAND_LO = 0.6, BAND_HI = 1, cmd = process.argv[2] || 'plan';
const ONLY = ((process.argv.find(a=> a.startsWith('--only=')) || '').slice(7)).split(',').filter(Boolean); // re-derive just these (their stats back from the note first)
const TARGET = {'cave-bat-swarm': [1, 2]}; // owner 21:36
const PROPORTION = {'caldera-wyrm': 'outside the band (decision B10: printed = obtained, its power at 20-B-4 is the field\'s); halved in proportion'};
const isEgg = c=> !!(c.easterEgg || (c.source && c.source.kind === 'easteregg'));
const r2 = v=> Math.round(v * 100) / 100;
function chk(Tb, c, A, H){ const d = Object.assign({}, c, {attack: A, health: H}), lv = SC.levelOf(c), b1 = Tb.budget(d, {level: 1}), bs = lv === 1 ? b1 : Tb.budget(d, {level: lv});
  return {b1, ok: b1.ok && bs.ok, use: b1.x1 / b1.N}; }
const half = (A, H)=> [A == null ? A : A > 0 ? Math.max(1, Math.round(A / 2)) : 0, H == null ? H : H > 0 ? Math.max(1, Math.round(H / 2)) : 0];

function planCard(c){
  // (10-21) an equipment card (the Easter egg Terraumbra) is measured with its grant as its skills, as the EE package priced it (tests/easter-eggs-2026-10-19.js)
  const grant = c.cardType === 'equipment' && c.equip && c.equip.grant || null; if(grant) c = Object.assign({}, c, {effects: Object.assign({}, c.effects, grant)});
  const A0 = c.attack || 0, H0 = c.health || 0, rf = REF[c.id], old = rf ? chk(T0, Object.assign({}, c, {effects: Object.assign({}, rf.effects, grant || {})}), rf.attack || 0, rf.health || 0) : chk(T0, c, A0, H0), now = chk(T, c, A0, H0);
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
    if(c.attack == null && c.health == null) return; if(ONLY.length && !ONLY.includes(c.id)) return;
    // (10-21) the Easter eggs go through the band like the rest: the EE package made each fit the budget (tests/easter-eggs-2026-10-19.js)
    if(PROPORTION[c.id] || (c.token && SC.measured(Object.assign({}, c, {token: false}))) || (c.cardType === 'equipment' && !isEgg(c)) || (c.hatchInto && !c.pool)){
      const now = half(c.attack, c.health), kind = PROPORTION[c.id] ? 'wyrm' : c.token ? 'token' : isEgg(c) ? 'easter egg' : c.cardType === 'equipment' ? 'equipment' : 'nest egg';
      if(now[0] !== c.attack || now[1] !== c.health) prop.push({id: c.id, name: c.name, kind, was: [c.attack, c.health], now, why: PROPORTION[c.id] || 'halved in proportion (no budget band of its own)'});
      return; }
    if(R.live(c) || isEgg(c) && (SC.measured(c) || c.cardType === 'equipment')) rows.push(planCard(c));
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
    '- **Halved in proportion:** cards outside the band, which have no budget of their own. These are the Caldera Wyrm (kept as printed in BF3 under decision B10, but "a halving applies to it too"), the tokens skills put on the board, the Nest\'s eggs and the Blacksmith\'s equipment. The Easter eggs go through the band like the rest (10-21; the EE package fitted each to the budget); Terraumbra, an equipment card, is measured with its grant as its skills.',
    '- **Not touched:** materia, spells, fields, test cards and pool cards.', '',
    '## The 10-21 rulings (owner, through the coordinator)', '',
    '- **The owner\'s later live edits are folded first, then halved like everything else.** 13 cards (edited on the server 10-19 to 10-20), Map 0 / Hedgerow / Shallows nodes, the tutorial and the Goliath\'s shards (`tools/fold_server_overrides_2026_10_21.js`, `docs/balance/server-overrides/fold-plan-2026-10-21.json`). One conflict: the Swarm Matriarch\'s art (the file\'s newer portrait is kept). RB2\'s raid values are unchanged. The server rows can be cleared with `supabase/proposed/20261021_clear_folded_overrides_2.sql` (prepared, **not applied**).',
    '- **N multipliers** in the shared helper (`bramblewood-budget.js` `nMultOf`, named constants shown in the card editor\'s budget panel and the Test Lab): a card with **no abilities ×1.05** (`plainBonus`); a card whose only abilities are light ones (Flying, Tide, Diurnal, Nocturnal, Crepuscular, Sun-shy, Night-blind) **×1.02** (`lightBonus`); **Fragile ×0.75** (`fragileMult`, it is priced on N now). Passive **Vulnerable** is a skill with a negative value (−1.5).',
    '- **Two skills at most** (`tools/two_skills_2026_10_21.js`, `docs/balance/two-skills-2026-10-21.json`): special and thematic cards (Epic and up, Supreme, hidden, Easter eggs, tokens) keep theirs. The list is below.',
    '- **Each card\'s place in the band is read before the cut and the halving** (`docs/balance/halve-ref-2026-10-21.json`, v5 with Bounty 0.5 and no multipliers), so a card that lost a skill gets that room back as stats.',
    '- **The Map × 0.2 term stays** in Base (halved with the rest of N). **Limit break balances a card to the next series\' standard**: a broken card is measured as if it were obtained on the next map series, so its extra power is that series\' Map term and level, not a separate allowance.',
    '- **Only `attack`, `health` and `creatorNote` are written.** The note reads "2026-10-19 halve (BF5): was A/H".', '',
    '## Summary', '', '| | Cards |', '|---|---|',
    `| Live cards | ${P.cards} |`, `| Re-derived in the band | ${P.band} |`, `| Under the band (the floor of their shape) | ${P.under} |`, `| At the owner\'s target | ${P.target} |`, `| Owner calls | ${P.owner} |`, `| Halved in proportion (outside the band) | ${P.proportion} |`, '',
    `**Skills that alone fill the halved N** (S ≥ N, nothing left for stats): **${P.skillsFillN.length}**. These are owner calls. They are left as they are, and their skills are not stripped.`, '',
    ...(owner.length ? ['## Owner calls', '', 'These cards\' skills don\'t fit the halved N. Each one is **halved in proportion** (it doesn\'t stay at twice the size of the rest) and flagged. Its skills are not stripped. The fix is the owner\'s: a skill, its cost, or the card\'s Wait or Lumber.', '', '| Card | Rarity | Wait / Lumber | Was | Now | S | N (halved, Lv 1) | Why |', '|---|---|---|---|---|---|---|---|',
      ...owner.map(r=> `| ${r.name} | ${r.rarity} | ${r.wait} / ${r.cost} | ${st(r.was)} | ${st(r.now)} | ${r.S}${r.m !== 1 ? ' ×' + r.m : ''} | ${r.N} | ${r.why} |`), ''] : []),
    '## Halved in proportion', '', '| Card | Kind | Was | Now |', '|---|---|---|---|', ...P.prop.map(r=> `| ${r.name} | ${r.kind} | ${st(r.was)} | ${st(r.now)} |`), '',
    '## Every live card', '', '| Card | Rarity | Wait / Lumber | Was | Now | N v5 → halved | Share of N, v5 → now | S |', '|---|---|---|---|---|---|---|---|',
    ...ch.slice().sort((a, b)=> a.name.localeCompare(b.name)).map(r=> `| ${r.name} | ${r.rarity} | ${r.wait} / ${r.cost} | ${st(r.was)} | **${st(r.now)}** | ${r.N0} → ${r.N} | ${pct(r.use0)} → ${pct(r.use)} | ${r.S} |`), ''];
  // the rest of the package: brambles, the Forge, the skill numbers, the road, the raid (each from its own file when it is there)
  const rdj = rel=>{ try{ return JSON.parse(fs.readFileSync(path.join(ROOT, rel), 'utf8')); }catch(e){ return null; } };
  const PR = rdj('docs/balance/halve-bramble-probe-2026-10-19.json'), GP = rdj('docs/balance/road-gaps-2026-10-19.json'), RD = rdj('docs/balance/halve-raid-2026-10-19.json');
  const live = JSON.parse(fs.readFileSync(CARDS_FILE, 'utf8')).filter(R.live), med = a=>{ const b = a.slice().sort((x, y)=> x - y); return b[b.length >> 1]; };
  const mA = med(live.map(c=> c.attack || 0)), mH = med(live.map(c=> c.health || 0));
  const FLAG = {meteor: 'Meteor', fireball: 'Fireball', trap: 'Trap', onReadyDamage: 'On Ready damage', pounce: 'Pounce', sweep: 'Sweep', thorns: 'Thorns', poison: 'Poison', armor: 'Armor', regen: 'Regeneration', fireArrow: 'Fire Arrow', earthquake: 'Earthquake', siege: 'Siege', lightning: 'Lightning', rocket: 'Rocket', crystallise: 'Crystallise', bleed: 'Bleed', sentry: 'Sentry'};
  const flags = Object.entries(FLAG).map(([k, label])=>{ const v = live.filter(c=> c.effects && typeof c.effects[k] === 'number').map(c=> [c.effects[k], c]); if(!v.length) return null;
    const top = v.sort((a, b)=> b[0] - a[0]), mx = top[0][0], against = k === 'armor' ? mA : mH; if(mx < (k === 'armor' ? mA : Math.max(3, mH - 1))) return null;
    return `| ${label} | ${v.length} | ${[...new Set(v.map(x=> x[0]))].sort((a, b)=> a - b).join(', ')} | ${top.slice(0, 2).map(x=> `${x[1].name} ${x[1].attack}/${x[1].health} (${x[0]})`).join('; ')} | ${k === 'armor' ? `Armor ${mx} against a median Attack of ${mA}: most attackers barely scratch it` : `${mx} against a median Health of ${mH}`} |`; }).filter(Boolean);
  const trig = live.filter(c=> (c.effects && c.effects.triggers || []).some(t=> typeof t.amount === 'number' && t.amount >= mH)).map(c=> c.name);
  const OE = rdj('docs/balance/owner-edits-bf5-2026-10-21.json'), TS = rdj('docs/balance/two-skills-2026-10-21.json');
  if(OE){ const fm = b=> `${st(b.stats)} (${pct(b.use)}${b.ok ? '' : ', **over**'})`;
    md.push('## The owner\'s 13 live edits, against the budget', '',
      'Each at Level 1: the file before the edit (v5), the owner\'s stats under v5 (N full, Bounty 0.5, no multipliers; share of N by 2A+H+S, **over** = a rule broken) and now (halved N, multipliers, two-skill cut, re-derived to the v5 share, held at 100% at most). `docs/balance/owner-edits-bf5-2026-10-21.json`.', '',
      '| Card | Rarity | Wait / Lumber | File before | Owner (v5) | Now (BF5) | S now / N now |', '|---|---|---|---|---|---|---|',
      ...OE.rows.map(r=> `| ${r.name} | ${r.rarity} | ${r.wait} / ${r.cost} | ${fm(r.filePre)} | ${fm(r.owner)} | **${fm(r.now)}** | ${r.now.S} / ${r.now.N} |`), '',
      `**What the edits say.** Twelve of them raised Health (most by 4 to 9 points; the Ant Hill by 20, to 0/50; the Mayfly Dancer\'s Attack too, 4 → 7); the Swarm Matriarch\'s left its stats at 2/11. ${OE.rows.filter(r=> !r.owner.ok).length} of the 13 sat over the v5 budget at the owner\'s stats. They read as "the cards should be sturdier than the budget lets them": Health is cheap in play next to what the budget charges for it, or the skills on them (Quick, Tide, Fragile, Crab Claws) cost more than they are worth. Under BF5 they keep the owner\'s A:H shape, at the share of the halved N the edit asked for (100% where it asked for more). The ones that shrink most are the ones whose skills now fill most of the halved N: the Tomcat (Quick, S 7.55 of N 10.9) and the Tide Pool Crab (S 6.9 of 11.42).`, ''); }
  if(TS){ const cut = TS.rows.filter(r=> r.dropped.length), sp = TS.rows.filter(r=> !r.dropped.length && !r.added);
    md.push('## Two skills at most', '', `${cut.length} cards were cut to two; ${sp.length} special or thematic cards keep more; the order was Bounty, then a time-of-day skill, then Darksight, then the two the card\'s name and flavour carry. A skill\'s parameters went with it.`, '',
      '**The owner\'s ants:** Ant Scout keeps Swarm alone (cheap: Wait 0, Lumber 0); the Soldier Ant gets **Formation 1** beside Swarm (Wait 1: soldiers hold the line); the Tunnel Ant gets **Ambush 2** beside Swarm (Wait 1, Lumber 1: it comes out of the tunnel at the enemy that enters).', '',
      '| Card | Rarity | Had | Keeps | Cut |', '|---|---|---|---|---|', ...cut.slice().sort((a, b)=> a.name.localeCompare(b.name)).map(r=> `| ${r.name} | ${r.rarity} | ${r.was.join(', ')} | ${r.keep.join(' + ')} | ${r.dropped.join(', ')} |`), '',
      `Special cards that keep more: ${sp.map(r=> r.name + ' (' + r.keep.length + ')').join(', ')}.`, ''); }
  md.push('## Brambles: halved too (measured)', '',
    'Whether the owner\'s "HALF everything" covers the brambles was not plain, so it was measured. The halved cards were played against full-size brambles, then against halved ones.' + (PR ? ` The sample is ${PR.fights} road fights (every 9th of the BF4 measure, 60 games each, \`docs/balance/halve-bramble-probe-2026-10-19.json\`). Sudden death starts at round 20.` : ''), '',
    ...(PR ? ['| | BF4 (full cards, full brambles) | Halved cards, full brambles | Halved cards, halved brambles |', '|---|---|---|---|',
      `| Mean rounds a fight | ${PR.meanRounds.bf4} | ${PR.meanRounds.fullBrambles} | ${PR.meanRounds.halvedBrambles} |`,
      `| Fights averaging 17+ rounds | ${PR.over17.bf4} | ${PR.over17.fullBrambles} | ${PR.over17.halvedBrambles} |`,
      `| Fights averaging 20+ rounds (sudden death) | ${PR.at20plus.bf4} | ${PR.at20plus.fullBrambles} | ${PR.at20plus.halvedBrambles} |`, ''] : []),
    '**With full brambles, fights dragged toward the turn caps.** So the brambles are halved too. It is one constant, `BRAMBLE_SCALE = 0.5` in `arena_app.js`, applied when a fight is built. The stored numbers (`characters.json`, node `hqHp` / `shieldOverride`, `raids.json`) stay full-size, so it can be tuned back. It covers:',
    '- **The road\'s brambles:** the map castles, Map 0\'s base brambles, a node\'s lower Health and the **Shield rule** (Map × 1 / 1.5 / 2 / 3, then halved) and its overrides.',
    '- **Your castle** in every mode (road, arena, gauntlet, ghosts, PvP, dungeon, raids).',
    '- **The raid:** the arms\' and tail\'s brambles **350 → 175** a fight, the **Core 200 → 100**, the **elders\' Health floor 55 → 28** (`bossHpBonusMax`), the trench wall, and the raiders\' merged castle.',
    '- **The tutorial** (both brambles) and the **dungeon** (its foes\' brambles).', '',
    '## The Forge curve', '',
    'It follows N on its own (`forgeCurve` banks each level\'s ΔN, halved with N, times the card\'s N multiplier). The mean 2A+H gain over Level 1 (`FORGE_MEAN_GAIN`) is now **+1.2% at Lv 2, +21.8% at Lv 4, +50.4% at Lv 7, +79.4% at Lv 10 and +96.3% at Lv 11**. Under v5 it was +4.4%, +20.8%, +45.8%, +70.5% and +79.6%.',
    '- **The minor step (Lv 2) mostly rounds to nothing** at halved sizes.',
    '- **The majors weigh relatively more**, because a card\'s stats are a smaller part of its halved N (S didn\'t halve).',
    '- **The majors still always add a point.** On the smallest cards that point can run one point past N at Lv 10 and 11. `tests/forge-curve-2026-10-19.js` allows exactly that.', '',
    '## Skill numbers that now look big (flagged, not changed)', '',
    `The owner said to halve N only, so the skills' own numbers stay. A live card is now a median **${mA}/${mH}**. These fixed numbers are large against that:`, '',
    '| Skill | Cards | Values | Largest | Against halved stats |', '|---|---|---|---|---|', ...flags, '',
    ...(trig.length ? [`Triggers with a fixed amount at or above the median Health (${mH}): ${trig.join(', ')}.`, ''] : []),
    '**Suggestion (owner call):**',
    '- **Halve the fixed amounts too** (damage, Poison, Thorns, Trap, Pounce, Sweep, On Ready damage, Meteor 20 → 10, Fireball 15 → 8), at least 1 each.',
    '- **Cap Armor** at about half the card\'s Attack, or halve it (Armor 4–5 on 50 cards makes many fights stall into sudden death).',
    '- **Re-measure the skill worth afterwards** (`tools/skill_worth`). The costs (S) were measured at the old sizes.', '');
  if(GP) md.push('## The road, re-measured (honest levers only)', '',
    `The levers are the owner's from 16:22: enemy decks only, levels on the schedule, no new Shield, no field buffs. The final measure is \`docs/balance/skirmish-pass-bf-after.jsonl\` (120 games, the measure seeds). On target: **main maps ${GP.counts.main.green} / ${GP.counts.main.fights}**, **side maps ${GP.counts.side.green} / ${GP.counts.side.fights}**. On fresh seeds: ${GP.freshCounts && GP.freshCounts.main ? GP.freshCounts.main.green + ' / ' + GP.freshCounts.main.fights : '—'}. There are **${GP.gaps.total} gaps** (${GP.gaps.easy} too easy: a future "cheat" field; ${GP.gaps.hard} too hard), listed in \`docs/balance/road-gaps-2026-10-19.json\`.`, '');
  const RR = rdj('docs/balance/halve-road-2026-10-21.json'); if(GP && RR) md.push(...RR.lines, ''); // (10-21) how the road got there
  if(RD) md.push('## The raid, re-measured', '', ...RD.lines, '');
  fs.writeFileSync(path.join(ROOT, 'docs', 'balance', 'halve-2026-10-19.md'), md.join('\n'));
  console.log('wrote docs/balance/halve-2026-10-19.md');
}
