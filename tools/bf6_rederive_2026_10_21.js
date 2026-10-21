#!/usr/bin/env node
// Package BF6 (2026-10-21): skill worth re-measured in the halved world, then every card re-derived through the budget. The owner:
//   "B11: a blanket halve [of skill numbers] might not balance it appropriately. I assume the N value takes into account the Map value."
//   "B12: Okay whichever."  "New ability: Injured N: comes in with damage already on it (can be healed). This counts as −N × 0.99."
//   "Measure the worth of new skills. Remember that skills can be negative."  "By the end of this session, all cards should have been balanced."
//
//   node tools/bf6_rederive_2026_10_21.js costs   the halved-world measure (docs/balance/skill-worth-2026-10-21.json, tools/skill_worth.js
//                                                 --world=half) into canonical/skill-costs.json: measuredS / measuredConf / measuredSE for
//                                                 every entry it measured, and `value` = measuredS where the owner's own rule says so
//                                                 ("apply measured worth", 10-19) and the measure is good enough (APPLY_CONF); the
//                                                 owner-set values (OWNER_SET) keep theirs, marked ownerSet. The BF5 table is kept as
//                                                 docs/balance/skill-costs-bf5-2026-10-21.json (the "old" S of every card).
//   node tools/bf6_rederive_2026_10_21.js plan    -> docs/balance/bf6-plan-2026-10-21.json (+ the summary)
//   node tools/bf6_rederive_2026_10_21.js apply   -> canonical/cards.json (attack, health, creatorNote only)
//
// The re-derive (as BF5's tools/halve_2026_10_19.js): each card keeps its A:H shape (the stats before BF5's halving, from its BF5 note,
// else its stats now) and its current share of N (2A+H+S over N at Level 1, S under the BF5 table, ×1.5 a half-miss skill), held in the
// band (over 60%, at most 100%); the new stats are that shape scaled by one factor, rounded, whose share under the new S lands closest
// to it (from below where it can), both rules holding (2A+H+S ≤ N, A·H+S ≤ (N/3)², inclusive) at Level 1 and at the start level. N is
// the helper's: the Map term (+0.2 × the obtain map, halved with N) and BF5's multipliers (no abilities ×1.05, light ×1.02, Fragile ×0.75).
// Attack 0 stays 0, a non-zero Attack stays at least 1, Health at least 1. Skills are never stripped: a card whose skills no stats can
// absorb goes to the floor of its shape and is flagged.
// Every card with stats: the live cards and the Easter eggs through the band; the cards with no band of their own (the tokens skills put
// on the board, the Nest's eggs, the Blacksmith's equipment, the Caldera Wyrm under B10) keep their share of their own N, so they move
// only when their own skills' S moved. Not touched: pool, test, Materia, spells, fields, the Hall of Fame dummy.
'use strict';
const fs = require('fs'), path = require('path');
if(!process.argv.includes('--world=half')) process.argv.push('--world=half'); // skill_worth reads it when it loads
const ROOT = path.join(__dirname, '..'), R = require('./card_retune_2026_10_19.js'), SC = R.SC;
const CARDS_FILE = path.join(ROOT, 'canonical', 'cards.json'), COSTS = path.join(ROOT, 'canonical', 'skill-costs.json');
const OLD_COSTS = path.join(ROOT, 'docs', 'balance', 'skill-costs-bf5-2026-10-21.json'), SW_JSON = path.join(ROOT, 'docs', 'balance', 'skill-worth-2026-10-21.json');
const PLAN_FILE = path.join(ROOT, 'docs', 'balance', 'bf6-plan-2026-10-21.json');
const cmd = process.argv[2] || 'plan';
const r2 = v=> Math.round(v * 100) / 100;
const isEgg = c=> !!(c.easterEgg || (c.source && c.source.kind === 'easteregg'));
const BAND_LO = 0.6, BAND_HI = 1;
// The values the owner set himself (kept; marked ownerSet): his yardsticks (10-18), Thorns (BF3 16:22), Bounty doubled (BF5 21:36), Fragile
// priced on N (BF5), passive Vulnerable's −1.5 (BF5), Injured's −0.99 (BF6), and the half-miss skills, priced by the ×1.5 rule instead.
const OWNER_SET = {onDeath:'owner 10-18: On Death = 1, the yardstick', onAllyPlayed:'owner 10-18: On Ally Played = 2.5', onAnyPlayed:'owner 10-18: On Any Played = 5',
  bounty:'owner BF5 21:36: Bounty 1 a point', thorns:'owner BF3 16:22: "Thorns is reaallly strong"', fragile:'owner BF5: Fragile is priced on N (× 0.75)',
  vulnerable:'owner BF5: passive Vulnerable −1.5 a point', injured:'owner BF6: Injured N counts as −N × 0.99',
  blind:'the ×1.5 half-miss rule', evasive:'the ×1.5 half-miss rule', flying:'the ×1.5 half-miss rule', shadow:'the ×1.5 half-miss rule', swift:'the ×1.5 half-miss rule'};
const APPLY_CONF = ['high', 'medium'];
const PRE_FX = {'parish-sergeant': e=>{ if(e.banner != null){ e.rally = e.banner; delete e.banner; } return e; },
  'shieldbearer-hound': e=>{ delete e.armor; e.shieldCall = true; return e; }, 'magnate-duck': e=>{ e.shieldCall = true; return e; }};

// The entries the halved-world run measures (owner 15:22: "Simulations not needed right?" -> simulate only what has no measured worth
// yet, the new or changed ones): the rest of the table keeps its value and its 10-19 measure untouched.
const NEW = {skills: ['injured', 'rally', 'banner', 'weaponMaster', 'pry', 'hazardIce', 'hazardRubble', 'shieldwall', 'amplifier', 'broodkeeper', 'spotter', 'brood', 'twin', 'sprout'],
  actions: ['duplicate', 'devourGrave', 'devourGrave.amount2', 'buffAll', 'buffAll.amount2', 'stench', 'silence', 'stymie', 'exhaust', 'petrify', 'vulnerable', 'barrage', 'smokeScreen', 'magnet', 'positionBeam', 'spawnCard'],
  triggers: ['onEnterSlot', 'onAnyDeath'], modifiers: [], shorthands: ['archer', 'spawner', 'harbinger', 'corpsefeeder', 'warcry']};
// The calls on the measures that are low confidence or can't read on plain decks (BF6), each with its reason: 'measured' takes the
// halved-world number anyway, 'keep' keeps today's value.
const KEEP_COMPANY = 'needs company the plain test decks lack (its measure reads 0: no equipment, armored foes, hazards, numbered neighbours, tokens or skills to stop); kept at its estimate';
const ANALOGY = {
  banner: {v: 'measured', why: 'low confidence only because the mirror saturates; the three baselines (3.6, 4.9, 5.8) and N 2 (5.1 a point) agree'},
  spawnCard: {v: 'measured', why: 'low confidence (b3\'s pool saturates); b1 2.2, b2 4.6, b3 5.4 a copy of the 1/1 bee: the halved token is worth less than the 10-19 measure of the 1/2 one'},
  brood: {v: 'keep', why: 're-measured after the nearest-slot rule: 3.02 against 3.21, within the noise; kept'},
  sprout: {v: 'keep', why: 're-measured after the nearest-slot rule: 3.02 against 3.19, within the noise; kept'},
  twin: {v: 'keep', why: 'a full copy of the card: off the scale (S 20+ on b2, 36 on b3), so no constant prices it; kept, its two cards flagged for the owner'},
  duplicate: {v: 'keep', why: 'off the scale on b3 (a copy with the card\'s Attack and skills); kept at its estimate, no card prints it'},
  stench: {v: 'measured', why: 'low confidence, no card prints it; close to its estimate (2.5)'}, stymie: {v: 'measured', why: 'low confidence, no card prints it'},
  petrify: {v: 'measured', why: 'low confidence, no card prints it'}, barrage: {v: 'measured', why: 'low confidence, no card prints it; close to its estimate (5.08)'},
  positionBeam: {v: 'measured', why: 'low confidence, no card prints it as a trigger'}, onEnterSlot: {v: 'measured', why: 'low confidence, no card prints it'}, onAnyDeath: {v: 'measured', why: 'low confidence, no card prints it (Harbinger is built on it)'},
  silence: {v: 'keep', why: KEEP_COMPANY}, exhaust: {v: 'keep', why: KEEP_COMPANY}, weaponMaster: {v: 'keep', why: KEEP_COMPANY}, pry: {v: 'keep', why: KEEP_COMPANY},
  hazardIce: {v: 'keep', why: KEEP_COMPANY}, hazardRubble: {v: 'keep', why: KEEP_COMPANY}, amplifier: {v: 'keep', why: KEEP_COMPANY}, broodkeeper: {v: 'keep', why: KEEP_COMPANY},
};
function costs(){
  const SW = require('./skill_worth.js'), table = JSON.parse(fs.readFileSync(COSTS, 'utf8'));
  if(!fs.existsSync(OLD_COSTS)) throw new Error('the BF5 table snapshot is missing: ' + OLD_COSTS);
  const data = JSON.parse(fs.readFileSync(SW_JSON, 'utf8')), agg = SW.aggregate(table, data.results), rows = [];
  const HOW = '2026-10-21 (BF6): tools/skill_worth.js --world=half (baselines 1/4 W1, 2/7 W2, 3/11 W3, brambles 50), ' + data.G + ' games a point';
  ['skills', 'triggers', 'actions', 'modifiers'].forEach(f=> (table[f] || []).forEach(e=>{
    if(!NEW[f].includes(e.id)) return;
    const x = agg.entries[f][e.id], was = e.value;
    ['measuredS', 'measuredConf', 'measuredSE', 'measuredOff', 'measuredWhy', 'measuredHow'].forEach(k=>{ if(e[k] != null) (e.bf5Measured = e.bf5Measured || {})[k] = e[k]; delete e[k]; });
    if(x && x.measuredS != null && isFinite(x.measuredS)){
      e.measuredS = x.measuredS; e.measuredConf = (x.conf && x.conf.level) || 'low'; if(x.conf && x.conf.se != null) e.measuredSE = x.conf.se; if(x.conf && x.conf.off) e.measuredOff = x.conf.off;
      e.measuredHow = HOW + (x.how ? '; ' + x.how : '');
    } else e.measuredWhy = (x && x.why) || 'not measured';
    let applied = false, why = '';
    if(OWNER_SET[e.id] && (f === 'skills' || f === 'triggers')){ e.ownerSet = OWNER_SET[e.id]; why = 'owner-set'; }
    else if(ANALOGY[e.id]){ const an = ANALOGY[e.id], v = an.v === 'measured' ? e.measuredS : an.v === 'keep' ? e.value : an.v;
      if(v != null && e.value !== v){ e.prevValue = was; e.value = v; e.appliedAt = '2026-10-21 (BF6: ' + an.why + ')'; } e.pricedBy = an.why; applied = an.v !== 'keep'; why = an.v === 'keep' ? 'kept: ' + an.why : an.why; }
    else if(e.measuredS == null) why = 'not measured';
    else if(e.measuredOff) why = 'off the scale (a bound)';
    else if(!APPLY_CONF.includes(e.measuredConf)) why = 'low confidence';
    else { if(e.value !== e.measuredS){ e.prevValue = was; e.value = e.measuredS; e.appliedAt = '2026-10-21 (BF6: measured in the halved world; the owner\'s 10-19 rule, "apply measured worth")'; } applied = true; }
    rows.push({kind: f, id: e.id, scale: e.scale || e.per || '', was, now: e.value, measuredS: e.measuredS == null ? null : e.measuredS, conf: e.measuredConf || null, off: e.measuredOff || null, applied, why, pricedBy: e.pricedBy || null});
  }));
  Object.entries(table.shorthands || {}).forEach(([k, sh])=>{ if(!NEW.shorthands.includes(k)) return; const x = (agg.entries.shorthands || {})[k];
    ['measuredS', 'measuredConf', 'measuredSE', 'measuredWhy'].forEach(q=>{ if(sh[q] != null) (sh.bf5Measured = sh.bf5Measured || {})[q] = sh[q]; delete sh[q]; });
    if(x && x.measuredS != null){ sh.measuredS = x.measuredS; sh.measuredConf = (x.conf && x.conf.level) || 'low'; sh.measuredHow = HOW + '; S per N (its trigger x action prices it)'; } else sh.measuredWhy = (x && x.why) || 'not measured';
    rows.push({kind: 'shorthands', id: k, scale: 'per N', was: null, now: null, measuredS: sh.measuredS == null ? null : sh.measuredS, conf: sh.measuredConf || null, applied: false, why: 'a shorthand is priced as its trigger x action'}); });
  table.measured = (table.measured || '') + ' | 2026-10-21 (package BF6): the new and changed entries (Injured, Rally, War Banner, the spawns after the nearest-slot rule, SK3\'s actions and keywords, EQ\'s) measured in the halved world by tools/skill_worth.js --world=half; the rest keep their 10-19 measure (owner 15:22: simulate only what has no measured worth)';
  fs.writeFileSync(COSTS, SW.fmtTable(table));
  fs.writeFileSync(path.join(ROOT, 'docs', 'balance', 'bf6-skill-costs-2026-10-21.json'), JSON.stringify({_about: 'BF6 (2026-10-21): the new and changed skill-cost entries, BF5 value -> BF6 value, their halved-world measure and why each was or was not applied', rows}, null, 1) + '\n');
  rows.forEach(r=> console.log(`${r.kind} ${r.id}: ${r.was} -> ${r.now} (measured ${r.measuredS}, ${r.conf}${r.off ? ' ' + r.off : ''}) ${r.applied ? 'applied' : r.why}`));
}

// ---------------------------------------------------------------------------------------------------------------------------
const OLD = ()=> SC.make(JSON.parse(fs.readFileSync(OLD_COSTS, 'utf8')));
function chk(Tb, c, A, H){ const d = Object.assign({}, c, {attack: A, health: H}), lv = SC.levelOf(c), b1 = Tb.budget(d, {level: 1}), bs = lv === 1 ? b1 : Tb.budget(d, {level: lv});
  return {b1, ok: b1.ok && bs.ok, use: b1.x1 / b1.N}; }
// the shape: the stats BF5 halved from (its note "halve (BF5): was A/H"), else the card's stats now
function shapeOf(c){ const m = String(c.creatorNote || '').match(/halve \(BF5\): was (\d+|-)\/(\d+|-)/g); if(!m) return [c.attack || 0, c.health || 0];
  const x = m[m.length - 1].match(/was (\d+|-)\/(\d+|-)/); return [x[1] === '-' ? 0 : +x[1], x[2] === '-' ? 0 : +x[2]]; }
function kindOf(c){
  if(c.pool || c.test || c.hallOfFame || c.field || ['materia', 'spell'].includes(c.cardType) || (c.attack == null && c.health == null)) return null;
  if(c.id === 'caldera-wyrm') return 'wyrm';
  if(isEgg(c)) return 'band';
  if(c.token) return 'token'; if(c.hatchInto) return 'nest egg'; if(c.cardType === 'equipment') return 'equipment';
  return R.live(c) ? 'band' : null;
}
// The owner's 13 live edits keep their share of N (coordinator, 15:09); every other band card goes to the top of the band (owner 15:22:
// "Just go to each card, and toggle all the values as equally as possible").
// Held as they are and flagged: no constant prices their skill (BF6's measure).
// 2026-10-21 (package MT, owner 16:33, B15): Twin is priced at 20 and Mirrorhide Mutant has Mimic (5) instead, so both cards are fitted by
// the formula again (Puddle Changeling's Twin overflows a Common's N: the bucket, at the floor of its shape, skills kept).
const HOLD = {};
const OWNER13 = (()=>{ try{ return new Set(JSON.parse(fs.readFileSync(path.join(ROOT, 'docs', 'balance', 'owner-edits-bf5-2026-10-21.json'), 'utf8')).rows.map(r=> r.id)); }catch(e){ return new Set(); } })();
// The candidates along the card's shape (A:H scaled by one factor, rounded), then the slack in cap 1 filled with Health a point at a time
// while both caps hold (Attack stays where the shape put it). A wall (Attack 0) stays at 0 Attack.
function candidates(T, c, sA, sH, fill){ const seen = new Set(), out = [];
  const push = (a, h)=>{ const key = a + '/' + h; if(seen.has(key)) return null; seen.add(key); const k = chk(T, c, a, h); out.push({A: a, H: h, use: k.use, ok: k.ok, x1: k.b1.x1}); return k; };
  for(let f = 1.5; f >= 0.005; f -= 0.0025){ const a = sA > 0 ? Math.max(1, Math.round(sA * f)) : 0, h = sH > 0 ? Math.max(1, Math.round(sH * f)) : 0; push(a, h); }
  if(fill && sH > 0) out.filter(x=> x.ok).forEach(x=>{ for(let h = x.H + 1; h < x.H + 40; h++){ if(seen.has(x.A + '/' + h)) continue; const k = push(x.A, h); if(!k || !k.ok) break; } });
  return out; }
function planCard(c, T, T0, kind){
  const grant = c.cardType === 'equipment' && c.equip && c.equip.grant || null; if(grant) c = Object.assign({}, c, {effects: Object.assign({}, c.effects, grant)});
  // the share is read with the skills it had before BF6's 15:15 moves (tools/bf6_skill_moves_2026_10_21.js), so a moved skill doesn't move it
  const pre = PRE_FX[c.id] ? Object.assign({}, c, {effects: PRE_FX[c.id](Object.assign({}, c.effects))}) : c;
  const A = c.attack || 0, H = c.health || 0, [A0, H0] = shapeOf(c), cur = chk(T0, pre, A, H), now = chk(T, c, A, H);
  const row = {id: c.id, name: c.name, kind, rarity: c.rarity || 'common', wait: c.wait || 0, cost: c.cost || 0, skills: Object.keys(c.effects || {}),
    was: [c.attack, c.health], shape: [A0, H0], S0: cur.b1.S, S: now.b1.S, N: now.b1.N, N2: now.b1.N2, m: now.b1.m, use0: r2(cur.use), useNowStats: r2(now.use)};
  const band = kind === 'band', keep = !band || OWNER13.has(c.id);
  const want = keep ? (band ? Math.min(BAND_HI, Math.max(BAND_LO + 0.01, cur.use)) : cur.use) : BAND_HI; row.want = r2(want); if(OWNER13.has(c.id)) row.owner13 = true;
  // a stat that is 0 now stays 0 (a wall's Attack; an equipment piece's Health)
  const sA = A === 0 ? 0 : (A0 || A), sH = H === 0 && c.health != null && kind !== 'band' ? 0 : (H0 || H || 1);
  if(HOLD[c.id]) return Object.assign(row, {verdict: 'flag', now: [c.attack, c.health], use: r2(now.use), why: HOLD[c.id]});
  const cand = candidates(T, c, sA, sH, band), pool = band ? cand.filter(x=> x.ok) : cand;
  if(!pool.length){ // the bucket: its skills alone leave no room for stats under one of the caps
    const fl = cand.slice().sort((p, q)=> p.x1 - q.x1)[0];
    return Object.assign(row, {verdict: 'bucket', now: [c.attack == null && !fl.A ? c.attack : fl.A, fl.H], use: r2(fl.use),
      why: `no stats fit: S ${r2(now.b1.S)}${row.m !== 1 ? ' (x' + row.m + ')' : ''} against N ${now.b1.N} (cap 2: S·|S| ${r2(now.b1.S * Math.abs(now.b1.S))} vs (N/3)² ${now.b1.N2})`}); }
  const inBand = band ? pool.filter(x=> x.use > BAND_LO && x.use <= BAND_HI) : pool, src = inBand.length ? inBand : pool;
  const dev = x=> Math.abs(x.A * sH - x.H * sA) / Math.max(1, sH * (x.H || 1));
  const below = src.filter(x=> x.use <= want + 1e-9).sort((p, q)=> (q.use - p.use) || (dev(p) - dev(q))), above = src.filter(x=> x.use > want).sort((p, q)=> p.use - q.use);
  const pick = keep ? (below[0] && (!above[0] || want - below[0].use <= above[0].use - want + 0.02) ? below[0] : above[0] || below[0]) : (below[0] || above[0]);
  return Object.assign(row, {verdict: band ? (pick.use > BAND_LO ? 'band' : 'under') : 'own', now: [c.attack == null && !pick.A ? c.attack : pick.A, c.health == null && !pick.H ? c.health : pick.H], use: r2(pick.use)});
}
// The bucket's calls (BF6, owner 15:22: "find if removal is easily done without thematic loss, then removing them then balancing those few"):
// BUCKET_DROP takes one skill off (its parameters go with it) where that costs the card nothing of its name or flavour and makes it fit;
// every other bucket card keeps its skills at the floor of its shape, flagged for the owner, with FLAG_WHY's reason (a one-skill card: its skill is the card).
const BUCKET_DROP = {
  "dolphin-knight": ["wave", "a knight: it keeps its fighting stats and the Tide it rides"],
  "caustic-scorpion": ["thorns", "\"Caustic\": the Poison is the name"],
  "silverback-brawler": ["bounty", "Bounty is an economy tag, not the brawler"],
  "webspire-sentinel": ["bounty", "Bounty is an economy tag"],
  "carrion-fly-swarm": ["poison", "a swarm: Brood is the swarm"],
  "reef-shark": ["sweep", "a shark bites; it keeps the reef's Tide"],
  "beetle-battering-ram": ["sweep", "\"Battering-Ram\": Siege is the name"],
  "raven-scout": ["pounce", "a scout: Flying is the card"],
  "alpha-howler": ["nocturnal", "the howler leads the sweep; the time of day goes first (BF5 order)"],
  "grizzly-vanguard": ["bounty", "Bounty is an economy tag"],
  "firetail-trickster": ["bounty", "Bounty is an economy tag"],
  "grass-viper": ["shedding", "a viper: the Poison is the card"],
  "adder-ambusher": ["shedding", "an adder: the Poison is the card"],
  "constrictor-coil": ["sweep", "a constrictor squeezes, it does not sweep"],
  "venomlord-serpent": ["ambush", "\"Venomlord\": the Poison is the name"],
  "cave-flitter": ["darksight", "a flitter: Flying is the card; Darksight goes first (BF5 order)"],
  "sand-widow": ["dry", "a widow spider: the Poison is the card"],
  "orca-vanguard": ["momentum", "the orca's sweep stays; Momentum is a mechanic"],
  "hawk-arrowkeeper": ["pounce", "a keeper of arrows, not a diver"],
  "toucan-courier": ["bounty", "Bounty is an economy tag (BF5 order)"],
  "coral-reef-shark": ["crit", "a reef shark keeps its Tide"],
  "cave-bat-swarm": ["fork", "a bat swarm: Flying is the card (the owner's 1/2 stands as its shape)"],
  "tide-pool-crab": ["wave", "a tide-pool crab: its Tide is the name"],
  "mangrove-mudskipper": ["quick", "a mangrove fish: its Tide is the place"],
  "humpback-elder": ["thorns", "an elder whale: Inspiring (its song) is the card"],
  "sandstorm-roc": ["fork", "\"Sandstorm\": Dry is the name"],
  "duckling-squadron": ["fork", "a squadron of ducklings: Flying is the card"],
  "barrow-leech-bat": ["darksight", "Darksight goes first (BF5 order)"],
  "coral-current-eel": ["poison", "an eel of the current: its Tide is the name"],
  "elder-tortoise": ["regen", "the slow tortoise keeps its Wait on the foe"],
  "cobalt-talon-fledgling": ["diurnal", "the time of day goes first (BF5 order)"],
  "crimson-wing-recruit": ["diurnal", "the time of day goes first (BF5 order)"],
  "violet-vane-fletcher": ["sweep", "a fletcher does not sweep"],
  "quarry-mole": ["darksight", "a mole keeps its Keen Sense"],
  "sparrow-chick": ["bleed", "a chick: Flying is the card"],
  "tiny-cave-dweller": ["nocturnal", "the time of day goes first (BF5 order)"],
  "friar-badger": ["satiety", "a friar: the Relic is the card"],
  "vigil-owl": ["retribution", "an owl's vigil: the Relic stays"],
  "nectar-sipper": ["regen", "a sipper: Flying is the card"],
  "wrong-way-salmon": ["tide", "\"Wrong-Way\": Backstab is the joke"],
  "inside-out-hedgehog": ["armor", "a hedgehog keeps its spines (Thorns)"],
  "old-shell": ["tide", "\"The Old Shell\": Armor is the name"],
  "ferry-toll-frog": ["tide", "\"Toll\": the Gain on a kill is the joke"],
  "malachite-golem": ["darksight", "a golem's Shell stays; Darksight goes first"],
  "the-contradiction": ["bleed", "its contradiction is Rage beside Regeneration"],
  "ember-revenant": ["armor", "\"Revenant\": Revive is the name"],
  "vampire-squid": ["regen", "\"Vampire\": Bleed is the name"],
  "cave-centipede": ["quick", "a centipede's Poison stays"],
  "thorny-devil": ["dry", "\"Thorny\": Thorns is the name"],
  "fennec-fox": ["darksight", "a desert fox keeps Dry; Darksight goes first"],
  "meerkat-sentry": ["dry", "meerkats are sociable"],
  "monitor-rambler": ["thorns", "a monitor lizard's scales are its Armor"],
  "clover-butterfly": ["diurnal", "the time of day goes first (BF5 order)"],
  "meerkat-burrower": ["dry", "a burrower keeps Darksight underground"],
  "lions-mane-jelly": ["tide", "a jellyfish stings: the Poison stays"],
  "mudpuppy": ["tide", "a salamander's Regeneration stays"],
  "cinder-gecko": ["dry", "a gecko keeps its Evasive"],
  "cave-olm": ["darksight", "the olm's Regeneration stays; Darksight goes first"],
  "glimmer-spider": ["darksight", "a spider's Poison stays; Darksight goes first"],
  "hammerhead-shark": ["sweep", "a shark keeps its Tide"],
  "dromedary": ["regen", "a camel: Dry is the card"],
  "ashwing-ptarmigan": ["darksight", "Darksight goes first (BF5 order)"],
  "caldera-snow-leopard": ["ambush", "a leopard pounces"],
  "howdah-archers": ["quick", "archers keep the Arrow"],
  "marshal-tuskwell": ["arrow", "a marshal keeps Armor and Inspiring; the arrow is the least of his five"],
  "great-gate": ["armor", "a gate's job is Guardian"],
  "magnate-duck": ["inspiring", "the Magnate is money (Midas, Bounty, Hoard, Swipe) and his Armor"],
  "hedgehog-herbalist": ["bloom", "\"Herbalist\" is the name"],
  "sea-cucumber": ["regen", "its quirk is the stun when attacked"],
  "sandfish": ["dry", "a sandfish hides in the sand (Invisible)"],
  "river-mink": ["pounce", "a river mink keeps its Tide"],
  "pine-marten": ["quick", "a marten pounces"],
  "grass-snake": ["tide", "a grass snake plays dead (Revive)"],
  "peregrine-stooper": ["quick", "\"Stooper\": the dive (Pounce) is the name"],
  "water-shrew": ["tide", "water shrews are venomous"],
  "pyrenean-desman": ["keenSense", "an aquatic desman keeps its Tide"],
  "diving-bell-spider": ["ambush", "a diving-bell spider lives under water (Tide)"],
  "anhinga-spearbird": ["tide", "\"Spearbird\": the strike (Pounce) is the name"],
  "raft-spider": ["darksight", "Darksight goes first (BF5 order)"],
  "leopard-slug": ["nocturnal", "the time of day goes first (BF5 order)"],
  "wolf-spider-mother": ["pounce", "\"Mother\": Brood is the name"],
  "springtail-hopper": ["quick", "a springtail springs away (Evasive)"],
  "cave-cricket": ["darksight", "Darksight goes first (BF5 order)"],
  "cave-pseudoscorpion": ["darksight", "Darksight goes first (BF5 order)"],
  "giant-cave-huntsman": ["poison", "a huntsman spider hunts (Pounce)"],
  "guano-beetle": ["darksight", "Darksight goes first (BF5 order)"],
  "banded-sea-krait": ["tide", "a krait is its venom"],
  "fishing-cat": ["tide", "a fishing cat strikes (Pounce)"],
  "horseshoe-crab": ["tide", "a horseshoe crab is its shell (Armor)"],
  "giant-clam": ["regen", "a clam is its Shell"],
  "alpine-salamander": ["scare", "a salamander's Regeneration stays"],
  "hawthorn-shieldbug": ["daunt", "\"Shieldbug\": Armor is the name"],
  "garden-tiger-moth": ["thorns", "a moth: Flying is the card"],
  "polar-bear": ["tide", "a polar bear waits at the ice hole (Ambush)"],
  "stormcaller": ["trigger:1", "a stormcaller calls lightning (On Ready: Damage); the Wait it puts on the foe goes"],
  "bog-behemoth": ["nocturnal", "the time of day goes first (BF5 order)"],
  "quill-volley": ["bounty", "Bounty is an economy tag"],
  "clownfish-scout": ["guardian", "a clownfish lives in the reef (Tide)"],
  "sea-hare": ["tide", "a sea hare's ink is its Smoke Bomb"],
  "harp-seal-pup": ["tide", "a pup molts its white coat (Molting)"]};
const FLAG_WHY = {
  "bee-drone": "a drone: the bees it calls (On Attacked: Spawn) and Flying are the card",
  "boar-rampager": "Bounty off does not make room; the rampage (Sweep) is the name",
  "octopus-tactician": "eight arms (Sweep) and the sea (Tide) are the card; Tide off does not make room",
  "fox-warchief": "Bounty off does not make room; the warchief's Sweep is the card",
  "poison-dart-croaker": "\"Poison Dart\" is the name; Tide off does not make room",
  "stone-turtle-warden": "\"Stone Turtle\": Armor is the name; Tide off does not make room",
  "sea-turtle-elder": "a turtle is its shell (Armor); Revive off does not make room",
  "golden-eagle-diver": "\"Diver\": the dive (Pounce) and Flying are the card",
  "obsidian-scorpion": "\"Obsidian\" is its Armor and a scorpion is its Poison",
  "dune-jackal": "no single skill off makes room (Quick, Dry)",
  "dune-jackal-scout": "\"Dune\": Dry is the name; Armor off does not make room",
  "nightshade-moth": "\"Nightshade\": Sleep is the name, and a moth flies",
  "courier-pigeon": "a courier: the card it brings (On Play: Draw) and Flying are the card",
  "daily-post": "the post: the card it brings (On Play: Draw) and Flying are the card",
  "fleetfootd": "\"Fleetfoot\": Quick is the name; Tide off does not make room",
  "ironmaw-warwolf": "Fork off does not make room; \"Ironmaw\" is its Armor and its bite (Bleed)",
  "nectar-vintner": "nectar (Bloom) and Flying are the card",
  "dawn-bellringer": "\"Dawn\": Diurnal is the name, and it flies",
  "snail-mail": "\"Mail\": the card it brings (Draw); Armor off does not make room",
  "marshal-of-rivergate": "Armor off does not make room; the marshal's Sweep is the card",
  "ruby-throat-duelist": "a duelist is its Quick; Pierce (S 0) off does not make room",
  "ford-kingfisher": "a kingfisher dives (Pounce) and flies",
  "conch-crawler": "a conch is its Shell; Tide off does not make room",
  "obsidian-lich": "\"Obsidian\" is its Armor, and a lich does not die (Regeneration)",
  "stonedrop-vulture": "\"Stonedrop\": the Archer drop and Flying are the card",
  "goliath-tentacle": "the tentacle's Sweep is the card; Tide off does not make room",
  "arc-bat": "\"Arc\": Electricity is the name, and a bat flies",
  "ember-centipede": "no single skill off makes room (Quick, Dry)",
  "pincushion-urchin": "\"Pincushion\": Thorns is the name; Tide off does not make room",
  "rock-pool-starfish": "a starfish regrows (Regeneration); Tide off does not make room",
  "limpet-clinger": "a limpet is its Shell; Tide off does not make room",
  "fulmar-spitter": "\"Spitter\": the oil it spits (Thorns) and Flying are the card",
  "giant-water-bug": "a water bug is its venom; Tide off does not make room",
  "greater-siren": "a siren salamander regrows (Regeneration); Tide off does not make room",
  "yellow-bellied-sea-snake": "a sea snake is its Poison; Tide off does not make room",
  "crown-of-thorns-star": "\"Crown-of-thorns\": Thorns is the name; Poison off does not make room",
  "lionfish": "a lionfish is its spines (Thorns); Tide off does not make room",
  "great-barracuda": "a barracuda is its burst of speed (Quick); Tide off does not make room",
  "alpine-swift": "\"Swift\": Quick is the name, and a swift flies",
  "grovebearer-dragon-turtle": "a Legendary: no single skill off makes room",
  "terraumbra": "an Easter egg (equipment): its grant is the card",
  "pink-maus": "an Easter egg: Sturdy is the card; Taunt (S 0) off does not make room",
  "gangrenous-leech": "\"Gangrenous\": the Poison is the name; Fester (S 0) off does not make room",
  "quillback-elder": "its one skill (Armor) is the card",
  "guppy": "its one skill (Tide) is the card",
  "cone-snail": "its one skill (Toxin) is the card",
  "testudo-tortoise": "\"Testudo\": the shield wall (Guardian) and the shell (Armor) are the card"};
function planAll(){
  const T = SC.make(JSON.parse(fs.readFileSync(COSTS, 'utf8'))), T0 = OLD(), cards = JSON.parse(fs.readFileSync(CARDS_FILE, 'utf8')), rows = [];
  cards.forEach(c=>{ const k = kindOf(c); if(!k) return; let r = planCard(c, T, T0, k);
    // under the band too: cap 2 squeezes it to the floor of its shape, so it is treated as the bucket is
    if(r.verdict === 'bucket' || r.verdict === 'under'){ const under = r.verdict === 'under', d = BUCKET_DROP[c.id];
      if(d){ const fx = withoutSkill(c.effects, d[0]), r2_ = planCard(Object.assign({}, c, {effects: fx}), T, T0, k);
        if(r2_.verdict !== 'bucket'){ r = Object.assign(r2_, {bucket: !under, squeezed: under || undefined, dropped: d[0], dropWhy: d[1], effectsNow: fx, S0: r.S0, use0: r.use0}); }
        else r = Object.assign(r, {verdict: 'flag', bucket: true, why: 'taking ' + d[0] + ' off still leaves no room; ' + r.why}); }
      else if(under) r = Object.assign(r, {squeezed: true, flag: true, why: FLAG_WHY[c.id] || 'no skill can go without thematic loss'});
      else r = Object.assign(r, {verdict: 'flag', bucket: true, why: FLAG_WHY[c.id] || (skillKeys(c.effects).length <= 1 ? 'its one skill is the card' : 'no skill can go without thematic loss'), fit: r.why}); }
    rows.push(r); });
  const moved = rows.filter(r=> r.now && (r.now[0] !== r.was[0] || r.now[1] !== r.was[1]));
  return {_about: 'BF6 (2026-10-21): every card re-derived with the halved world\'s skill worth (its shape and its share of N kept, in the band for live cards and Easter eggs)',
    generated: '2026-10-21', cards: rows.length, moved: moved.length, band: rows.filter(r=> r.verdict === 'band').length, under: rows.filter(r=> r.verdict === 'under').length,
    own: rows.filter(r=> r.verdict === 'own').length, bucket: rows.filter(r=> r.bucket).length, dropped: rows.filter(r=> r.dropped).length, flag: rows.filter(r=> r.verdict === 'flag').length, squeezed: rows.filter(r=> r.squeezed).length, squeezedFlag: rows.filter(r=> r.squeezed && r.flag).length, rows};
}
const NOTE = (was, flag, drop)=> `2026-10-21 BF6 (the halved coefficients, cap 2 A·H+S·|S|, the new skill worths): was ${was.map(v=> v == null ? '-' : v).join('/')}${drop ? '; took ' + drop : ''}${flag ? ' (flag: its skills leave no room; at the floor of its shape, skills kept)' : ''}.`;
setImmediate(()=>{ // after every const below is set
if(cmd === 'costs') costs();
else if(cmd === 'plan' || cmd === 'apply'){
  const P = planAll(); fs.writeFileSync(PLAN_FILE, JSON.stringify(P, null, 1) + '\n');
  console.log(`${P.cards} cards: ${P.moved} move; ${P.band} in the band, ${P.under} under it, ${P.own} by their own share (tokens, eggs, equipment, the Wyrm), ${P.bucket} in the bucket and ${P.squeezed} squeezed under the band (${P.dropped} took a skill off; ${P.flag} flagged at the floor, ${P.squeezedFlag} under the band flagged)`);
  if(cmd === 'apply'){
    const cards = JSON.parse(fs.readFileSync(CARDS_FILE, 'utf8')), by = {}; cards.forEach(c=> by[c.id] = c); let n = 0;
    // --only=a,b (2026-10-21, package MT): apply just these cards' rows (the plan file still holds every card)
    const onlyArg = process.argv.find(a=> a.startsWith('--only=')), only = onlyArg ? new Set(onlyArg.slice(7).split(',')) : null;
    P.rows.filter(r=> !only || only.has(r.id)).forEach(r=>{ const c = by[r.id]; if(c.attack !== r.was[0] || c.health !== r.was[1]) throw new Error(r.id + ' changed since the plan');
      if(r.dropped){ c.effects = r.effectsNow; }
      if(r.now[0] === r.was[0] && r.now[1] === r.was[1] && !r.dropped) return;
      if(c.attack != null || r.now[0]) c.attack = r.now[0]; if(c.health != null || r.now[1]) c.health = r.now[1];
      // --note="<package text>" (2026-10-21, package CX2): the creatorNote line names that package instead of BF6 ("was A/H" follows it)
      const noteArg = process.argv.find(a=> a.startsWith('--note=')), note = noteArg ? `${noteArg.slice(7)}: was ${r.was.map(v=> v == null ? '-' : v).join('/')}${r.verdict === 'flag' ? ' (flag: its skills leave no room; at the floor of its shape, skills kept)' : ''}.` : null;
      c.creatorNote = ((c.creatorNote || '') + ' ' + (note || NOTE(r.was, r.verdict === 'flag', r.dropped && (r.dropped + ': ' + r.dropWhy)))).trim(); n++; });
    fs.writeFileSync(CARDS_FILE, JSON.stringify(cards, null, 2).replace(/[\u0080-￿]/g, ch=> '\\u' + ch.charCodeAt(0).toString(16).padStart(4, '0')) + '\n');
    console.log('applied', n, 'cards');
  }
} else if(cmd === 'bucket'){ bucketOptions(); }
else if(cmd === 'doc'){ doc(); }
else console.log('usage: node tools/bf6_rederive_2026_10_21.js costs | plan | bucket | apply | doc');
});

// The bucket's options (owner 15:22: "those with too many skills are put into a bucket, then the agent will find if removal is easily done
// without thematic loss"): for every bucket card, each of its skills taken off in turn (a skill's parameters go with it) and the card
// re-fitted. -> docs/balance/bf6-bucket-2026-10-21.json; the calls themselves are BUCKET_CALLS (apply reads them).
const PARAM_OF = {crepuscularHp:'crepuscular', defianceN:'defiance', diurnalGrant:'diurnal', diurnalHp:'diurnal', espritHp:'esprit', espritWho:'esprit', fullMoonGrant:'fullMoon', loyalGrant:'loyal',
  nocturnalGrant:'nocturnal', nocturnalHp:'nocturnal', swarmN:'swarm', swimmerGrant:'swimmer', tideGrant:'tide', arrowCount:'arrow', bloomWhen:'bloom', hunterVs:'hunter', archerStyle:'archer', weakness:'rabid'};
function withoutSkill(e, k){ const o = JSON.parse(JSON.stringify(e || {}));
  if(/^trigger:/.test(k)){ const i = +k.slice(8); o.triggers = (o.triggers || []).filter((t, j)=> j !== i); if(!o.triggers.length) delete o.triggers; return o; }
  delete o[k]; Object.entries(PARAM_OF).forEach(([p, par])=>{ if(par === k) delete o[p]; }); return o; }
function skillKeys(e){ return Object.keys(e || {}).filter(k=> !PARAM_OF[k]).flatMap(k=> k === 'triggers' ? (e.triggers || []).map((t, i)=> 'trigger:' + i) : [k]); }
function bucketOptions(){
  const T = SC.make(JSON.parse(fs.readFileSync(COSTS, 'utf8'))), T0 = OLD(), cards = JSON.parse(fs.readFileSync(CARDS_FILE, 'utf8')), out = [];
  cards.forEach(c=>{ const k = kindOf(c); if(!k) return; const r = planCard(c, T, T0, k); if(r.verdict !== 'bucket' && r.verdict !== 'under') return;
    const parts = T.budget(Object.assign({}, c, {attack: 1, health: 1})).parts.map(p=> [p[1], r2(p[2])]);
    const opts = skillKeys(c.effects).map(sk=>{ const c2 = Object.assign({}, c, {effects: withoutSkill(c.effects, sk)}), r2_ = planCard(c2, T, T0, k);
      return {drop: sk === 'trigger:0' || /^trigger:/.test(sk) ? sk + ' ' + JSON.stringify((c.effects.triggers || [])[+sk.slice(8)]) : sk, fits: r2_.verdict !== 'bucket' && r2_.verdict !== 'under', now: r2_.now, use: r2_.use, S: r2_.S}; });
    out.push({id: c.id, verdict: r.verdict, name: c.name, rarity: c.rarity, wait: c.wait || 0, cost: c.cost || 0, was: r.was, N: r.N, N2: r.N2, S: r.S, m: r.m, parts, flavor: (c.flavor || '').slice(0, 140), opts}); });
  fs.writeFileSync(path.join(ROOT, 'docs', 'balance', 'bf6-bucket-2026-10-21.json'), JSON.stringify({_about: 'BF6 (2026-10-21): the bucket (no stats fit under 2A+H+S <= N and A·H+S·|S| <= (N/3)²) and each skill taken off in turn', cards: out}, null, 1) + '\n');
  out.forEach(b=> console.log(`${b.id} | ${b.name} | ${b.rarity} W${b.wait} C${b.cost} | N ${b.N} | ${b.parts.map(p=> p[0] + ' ' + p[1]).join(', ')} || ${b.opts.map(o=> o.drop.slice(0, 30) + (o.fits ? ' -> ' + (o.now || []).join('/') + ' ' + Math.round(o.use * 100) + '%' : ' x')).join('; ')}`));
}
// The BF6 doc: the skill worth table (BF5 → BF6, negatives marked), the cards that moved most, the flags. Extra prose comes from
// docs/balance/bf6-notes-2026-10-21.json ({intro: [...], measure: [...], raid: [...], calls: [...]}) when it is there.
function doc(){
  const rd = f=> JSON.parse(fs.readFileSync(path.join(ROOT, 'docs', 'balance', f), 'utf8'));
  const SCJ = rd('bf6-skill-costs-2026-10-21.json'), P = rd('bf6-plan-2026-10-21.json'); let NT = {}; try{ NT = rd('bf6-notes-2026-10-21.json'); }catch(e){}
  const cards = JSON.parse(fs.readFileSync(CARDS_FILE, 'utf8')), live = new Set(), uses = {};
  cards.filter(c=> kindOf(c)).forEach(c=>{ const e = c.effects || {}; Object.keys(e).forEach(k=>{ if(k === 'triggers') (e.triggers || []).forEach(t=>{ if(t){ uses['triggers:' + t.on] = (uses['triggers:' + t.on] || 0) + 1; uses['actions:' + t.do] = (uses['actions:' + t.do] || 0) + 1; } }); else uses['skills:' + k] = (uses['skills:' + k] || 0) + 1; }); });
  const st = a=> a.map(v=> v == null ? '-' : v).join('/'), pct = v=> Math.round(v * 100) + '%', neg = v=> v == null ? '–' : v < 0 ? `**${v}** (−)` : String(v);
  const md = ['# Skill worth in the halved world, every card re-derived, 2026-10-21 (package BF6)', '', ...(NT.intro || []), ''];
  if(NT.injured) md.push('## Injured N', '', ...NT.injured, '');
  if(NT.measure) md.push('## How the worth was measured', '', ...NT.measure, '');
  const moved = SCJ.rows.filter(r=> r.applied && r.was !== r.now), keyRow = r=> uses[r.kind + ':' + r.id] || (r.kind === 'actions' ? uses['actions:' + r.id.split('.')[0]] : 0) || 0;
  md.push('## The skill worth table', '', `Every entry's value (S, in its own units: a point of the skill's number for scale n, the base for scale half, a trigger's weight, an action's value a point) under BF5 → BF6, with its halved-world measure. **Bold with (−)** marks a negative worth (a drawback). ${moved.length} values moved; the full list, with the reason an entry kept its value, is \`docs/balance/bf6-skill-costs-2026-10-21.json\`. "Cards" counts the cards that print it.`, '',
    '| Entry | Kind | Scale | BF5 value | BF6 value | Measured (halved world) | Confidence | 10-19 measure (full size) | Cards | Note |', '|---|---|---|---|---|---|---|---|---|---|');
  const show = SCJ.rows.filter(r=> r.kind !== 'shorthands' && (r.applied && r.was !== r.now || (NT.alwaysShow || []).includes(r.id) || r.why === 'owner-set' || (r.measuredS != null && r.measuredS < 0)));
  show.sort((a, b)=> keyRow(b) - keyRow(a) || a.id.localeCompare(b.id)).forEach(r=> md.push(`| \`${r.id}\` | ${r.kind.replace(/s$/, '')} | ${r.scale} | ${neg(r.was)} | ${neg(r.now)} | ${neg(r.measuredS)}${r.off ? ' (' + r.off + ' bound)' : ''} | ${r.conf || '–'} | ${r.prev10_19 == null ? '–' : r.prev10_19} | ${keyRow(r)} | ${r.why === 'owner-set' ? 'owner-set, kept' : r.why && !r.applied ? r.why + ', kept' : ''} |`));
  md.push('');
  const sh = SCJ.rows.filter(r=> r.kind === 'shorthands');
  md.push('**Shorthands** (S a point of N, measured; a shorthand is priced as the trigger × action it is built from): ' + sh.map(r=> `${r.id} ${r.measuredS == null ? '–' : neg(r.measuredS)}${r.conf ? ' (' + r.conf + ')' : ''}`).join(', ') + '.', '');
  const kept = SCJ.rows.filter(r=> r.why === 'low confidence' || r.why === 'off the scale (a bound)');
  if(kept.length) md.push(`**Kept at their BF5 value** (the measure is too loose to move a cost on: low confidence or off the scale): ${kept.length}, of them on cards: ${kept.filter(r=> keyRow(r)).map(r=> `${r.id} (BF5 ${r.was}, measured ${r.measuredS}${r.off ? ' ' + r.off : ''}, ${keyRow(r)} cards)`).join(', ') || 'none'}.`, '');
  const ch = P.rows.filter(r=> r.now && (r.now[0] !== r.was[0] || r.now[1] !== r.was[1]));
  const dsum = r=> Math.abs((2 * (r.now[0] || 0) + (r.now[1] || 0)) - (2 * (r.was[0] || 0) + (r.was[1] || 0)));
  md.push('## The cards', '', `| | Cards |`, '|---|---|', `| Re-derived | ${P.cards} |`, `| Moved | ${P.moved} |`, `| In the band | ${P.band} |`, `| Under the band | ${P.under} |`, `| By their own share (tokens, the Nest's eggs, equipment, the Wyrm) | ${P.own} |`, `| In the bucket (no stats fit under a cap) | ${P.bucket} |`, `| Squeezed under the band by cap 2 | ${P.squeezed} |`, `| Took one skill off (bucket and squeezed) | ${P.dropped} |`, `| Flagged at the floor, skills kept | ${P.flag} |`, '',
    '**The biggest moves** (by 2A+H):', '', '| Card | Rarity | Was | Now | S BF5 → BF6 | N | Share of N |', '|---|---|---|---|---|---|---|',
    ...ch.slice().sort((a, b)=> dsum(b) - dsum(a)).slice(0, 25).map(r=> `| ${r.name} | ${r.rarity} | ${st(r.was)} | **${st(r.now)}** | ${r.S0} → ${r.S} | ${r.N} | ${pct(r.use0)} → ${pct(r.use)} |`), '');
  const dr = P.rows.filter(r=> r.dropped);
  if(dr.length) md.push('## The bucket: one skill off', '', 'Each took off the skill whose loss costs its name and flavour least (BF5\'s order first: Bounty, a time of day, Darksight), then was fitted like the rest.', '',
    '| Card | Rarity | Took off | Why | Was | Now |', '|---|---|---|---|---|---|', ...dr.map(r=> `| ${r.name} | ${r.rarity} | ${r.dropped.replace(/^trigger:\d+$/, 'its second trigger')} | ${r.dropWhy} | ${st(r.was)} | ${st(r.now)} |`), '');
  const fl = P.rows.filter(r=> r.verdict === 'flag' || r.squeezed && r.flag);
  if(fl.length) md.push('## Cards that still can\'t fit', '', 'No skill could go without thematic loss (or none that would make room), so each keeps its skills at the floor of its shape (1/1, a wall 0/1) and is flagged. The fix is the owner\'s: a skill, its number, the card\'s Wait or Lumber, or cap 2.', '',
    '| Card | Rarity | Wait / Lumber | Was | Now | S | N | Why |', '|---|---|---|---|---|---|---|---|', ...fl.map(r=> `| ${r.name} | ${r.rarity} | ${r.wait} / ${r.cost} | ${st(r.was)} | ${st(r.now)} | ${r.S}${r.m !== 1 ? ' ×' + r.m : ''} | ${r.N} | ${r.why} |`), '');
  if(NT.raid) md.push('## The raid (B12)', '', ...NT.raid, '');
  if(NT.calls) md.push('## Owner calls', '', ...NT.calls, '');
  md.push('## Every card that moved', '', '| Card | Kind | Was | Now | S BF5 → BF6 | Share |', '|---|---|---|---|---|---|', ...ch.slice().sort((a, b)=> a.name.localeCompare(b.name)).map(r=> `| ${r.name} | ${r.kind} | ${st(r.was)} | ${st(r.now)} | ${r.S0} → ${r.S} | ${pct(r.use0)} → ${pct(r.use)} |`), '');
  fs.writeFileSync(path.join(ROOT, 'docs', 'balance', 'bf6-2026-10-21.md'), md.join('\n'));
  console.log('wrote docs/balance/bf6-2026-10-21.md');
}
