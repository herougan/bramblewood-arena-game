// ============================================================================
// BUDGET2 (2026-10-31, owner on RECOST1-6, 10-30 23:25: "If Attack = 3 Health, we have to edit the first N formula to 3*attack instead."):
//   the stat terms count a point of Attack as attackWeight (3) points, was 2: cap 1 is f × ((3A + H) × m + S) ≤ N; the braces of context,
//   threshold and time-of-day skills (+A/+H) are 3A + H; the Forge curve banks and spends 3A + H points (a point of Attack costs 3).
//   N re-derived by one factor, scale 1.13 (N = 1.13 × (Base + L/15) × (1 + L/30), Level 0 1.13 × (Base − 1)): the factor that keeps the
//   in-play cards' median cap-1 use where it was (0.906 under 2A + H, 0.905 under 3A + H × 1.13; 330 in-play cards with stats, each at its
//   start level for its first map). Fits tried (docs/balance/budget2-2026-10-31.md): N × c for c 1.10-1.15, Base + d, and the least-squares
//   line N_new = 1.049 N_old + 1.69 over the 252 cards at 80-100% use; their spread of use was within 1-4% of each other, so the one-number
//   form that keeps the owner's coefficients won. Cap 2 (A·H × m + S·|S|) does not change with the Attack weight, so cap2Mult goes 2 → 1.57
//   (2 / 1.13²): the cap-2 limit stays where it was in absolute terms. Skill prices are in Health points and keep their values.
// Bramblewood stat budget N and the Forge level curve (2026-10-19, package BF). DOM-free, one implementation for the game (inlined
// into the page: global `BramblewoodBudget`), the balance tools (tools/skill_costs.js, tools/card_balance.js ...) and the master
// hub (tools/hub/build_hub.py inlines it ahead of tools/skill_costs.js).
//
// Budget v5 (owner 2026-10-19 13:52, replacing v4: "Oh shit to the balance. That's too much. ... maybe instead: (Base + L/3) * (1 + L/30)
// -> this should weaken Level's contribution significantly. Level 0 gives an additional minus 1. So if Base = 14, then at L1, N = (14+1/3)
// x (1+1/30) = 14.8 and at level 10, N = (14+10/3) x (1+10/30) = 23.1"; 13:54: "if you think it favours weak cards too much ... change it
// to L/4 or L/5"):
//   Base = 20 + Rarity + 6×Wait + 0.5×Wait² + 4×Lumber + 0.4×Lumber² + 1×Ritual points   (v3's N without its 2×Level term)
//   N(L) = (Base + L/levelLinDiv) × (1 + L/levelDiv), levelLinDiv 10 (owner 15:48: "let's try L/10"; was 5, the closest of the 3 / 4 / 5
//   he offered at 13:54), levelDiv 30;
//   N(0) = Base − zeroPenalty (1)
//   v4 (09:52) was (Base − 1 + L) × (1 + L/20), v3 Base + 2L. At Level 1 v5 (L/10) is Base × 31/30 + 0.10 (Base 21: 21.80; v3 23, v4 22.05).
//   The rules: 2A+H+S ≤ N and A·H+S·|S| ≤ (N/3)² (inclusive since 16:22, "it's fine to be = to budget"), both ×1.5 per half-miss skill (Evasive, Swift, Flying, Shadow, Blind: about half
//   the attacks at the card miss, so its stats count half again).
//   Cap 2 (2026-10-21, package BF6; owner 15:15: "for the cap-2, it should be AxH+SxS instead, so A and H are penalised for being too
//   equal, and S is penalised at more equal weight to A and H"; was A·H+S): productScore(A, H, S) = A·H + S·|S|, S·|S| rather than S² so
//   a negative skill (Injured, Fragile, passive Vulnerable) still frees room instead of costing it. Every cap-2 check calls productScore.
//   N (BF6, owner 15:09): Base = 10 + Rarity + 3×Wait + 0.25×Wait² + 2×Lumber + 0.2×Lumber² + 0.5×Ritual + 0.1×Map, N(L) = (Base + L/15)
//   × (1 + L/30), N(0) = Base − 1 (the numbers in DEFAULTS below).
//   The caps (2026-10-22, package BF7; owner, answering pass III: "Do your cut. I misread alot of the x1.5 skills ..."; on Fragile: "Fragile
//   should be smth like x0.7 (so that you can have more stats!) ... The idea is that things that must be less than N have a x0.7
//   multiplier!"): capScores(A, H, S, effects, cfg) is the one copy of the two left sides,
//     cap 1  f × ((2A + H) × m + S)       ≤ N
//     cap 2  f × (A·H × m + S·|S|)        ≤ (N/3)²
//   m = missMult (1.5) per half-miss skill, now on the stat terms only, not on S (was (2A + H + S) × m and (A·H + S·|S|) × m); f = fragileUse
//   (0.7) for a Fragile card, else 1, on the whole left side of both caps, so a Fragile card gets more stats. It replaces BF5's fragileMult
//   (N × 0.75), which shrank N, the opposite of the intent; nMultOf no longer reads Fragile. A quality priced by a multiplier costs 0 as a
//   skill (canonical/skill-costs.json: Fragile, Blind, Evasive, Swift, Flying, Shadow at 0).
//
// The Forge curve (owner 09:52: "change majors to 4, 7, 10, minor to 2. Then divvy out strength updates at all levels. If there is no
// space for minor, then all are minor OR potentially still 0, then majors expect SOME improvement."):
//   every level L above the card's start level banks its budget gain ΔN = N(L) − N(L−1) (÷ the half-miss multiplier, which scales the
//   score), in 2A+H points (1 Health = 1, 1 Attack = 2). (BF7, 2026-10-22: m scales the stat terms only and S does not change with the
//   level, so a point of 2A+H still costs m of N: the bank is still ΔN ÷ m, now ÷ (m × f) with Fragile's f, and the A·H room is (N/3)² − f·m·A·H.) A level spends whole points out of the bank:
//     major (4, 7, 10; past 10 every third level, 13, 16 …) and the limit break (11): everything banked, at least 1;
//     minor (2): everything banked too, which is only a level or two of gain, so a smaller step;
//     any other level: a third of the bank (often 0 on small cards), the rest waits for the next major.
//   So the stats never get ahead of N(L) (2A+H rises by at most N(L) − N(start)), majors take the big chunks, and the gains are the same
//   for the same card everywhere. Points go to Attack where that keeps the card's A:H shape (Attack ≈ A0 × (2A0+H0+P)/(2A0+H0)), never
//   taking a point of Health back, the rest to Health; a 0-Attack wall only grows Health. A step that would shrink the card's A·H room,
//   (N(L)/3)² − m·A·H, below what it had at its start level goes to the cheaper stat, or spends less (a major still spends 1).
// ============================================================================
(function(root, factory){ if(typeof module === 'object' && module.exports) module.exports = factory(); else root.BramblewoodBudget = factory(); })(typeof self !== 'undefined' ? self : this, function(){
'use strict';
// canonical/skill-costs.json "budget" holds the same numbers (tests/forge-curve-2026-10-19.js checks they agree)
// 2026-10-21 (package BF6; owner 15:09, correcting BF5's scale 0.5 on the whole N: "The N is the half N that we discussed though! meaning all
// coefficients in calculating our caps are halved. So Base=10+Rarity*1+3*Wait... (I kept rarity at *1 not *0.5) and N=(Base + Level/15)x
// (1+Level/30). Base at lvl 0 is still Base(0) - 1."): every Base coefficient halved except Rarity's (base 10, perWait 3, perWait2 0.25,
// perLumber 2, perLumber2 0.2, perRitual 0.5, perMap 0.1), the Level term L/15, Level 0 Base − 1, and no scale on the whole N (scale 1;
// kept as a parameter). N(L) = (Base + L/15) × (1 + L/30). A Common Wait 0 Lumber 0 Map 0: BF5 10 / 10.9 / 14.67 at Lv 0 / 1 / 10,
// now 10 / 11.44 / 15.56 (before its multiplier). Rarity weighs twice what it did under BF5 (a Legendary +4.5 over BF5). BF5's multipliers stay.
// 2026-10-24 (package BAL2, DF-1, owner 10-23 17:34: "Map MUST absolutely contribute at 0.2* per Map ... 20*0.2=4, a reasonable bonus"): perMap 0.2 (was
// 0.1 since BF6 halved the coefficients); a Map 20 card gets +4 N. The card's map is the first main-line map it can be obtained on (arena_app.js cardObtainMap).
const DEFAULTS = {base:10, perRarity:1, perWait:3, perWait2:0.25, perLumber:2, perLumber2:0.2, perRitual:0.5, perMap:0.2, levelLinDiv:15, levelDiv:30, zeroPenalty:1, missMult:1.5, cap2Mult:1.57 /* BF11 (2026-10-23) 2; BUDGET2 (2026-10-31) 2 / 1.13² */, scale:1.13 /* BUDGET2 (2026-10-31): N x 1.13, fitted below */, plainBonus:1.05, lightBonus:1.02, fragileUse:0.7, shieldPerHealth:0.8 /* FIN2-c (2026-10-26) */, attackWeight:3 /* BUDGET2 (2026-10-31, owner RECOST1-6): 3A + H, was 2A + H */};
// BUDGET2 (2026-10-31): the Attack weight of the stat terms (braces, thresholds, time of day): DEFAULTS.attackWeight, read at each call so a
// comparison tool can price a card under the old 2A + H (tools/budget2_refit_2026_10_31.js sets it to 2 for its "before"); capScores reads cfg first
const awNow = ()=> +DEFAULTS.attackWeight || 2;
// Shield as Health (2026-10-26, package FIN2-c; owner 23:46 #3: "Shield should be valued less than health. E.g. maybe 0.8. So tide pool crab is
// heavily undertuned"): a unit's own Shield N (effects.shield: it arrives with N temporary Health that soaks damage first and never comes back)
// is priced as shieldPerHealth (0.8) x N Health in the stat terms of both caps: cap 1 (2A + H + 0.8·Sh) x m + S, cap 2 A·(H + 0.8·Sh) x m + S·|S|.
// It was a skill in S at scale 'half' (1 + floor(N/2): Shield 3 cost 2), so cap 2 squared it (S·|S|) and a small shielded card had no room left.
// Its skill price in canonical/skill-costs.json is 0. Shield given by an action (Give Shield N, Bulwark) keeps its own price.
function shieldHealthOf(effects, cfg){ const v = effects && effects.shield; if(!v) return 0; const n = v === true ? 1 : Math.max(0, Number(v) || 0); return r2(num(cfg, 'shieldPerHealth') * n); }
// N multipliers by what a card can do (2026-10-21, BF5; owner): plainBonus (N x 1.05) for a card with no abilities at all; lightBonus
// (x 1.02) for a card whose only abilities are the light ones (LIGHT: Flying, Tide, and the time-of-day ones, Diurnal / Nocturnal /
// Crepuscular, Sunshy / Nightblind). An ability is an effects key that is not a parameter of another skill (PARAMS: swarmN, espritHp, ...),
// and each trigger. nMultOf(effects) is their product, on N at every level. (BF5's fragileMult, N x 0.75, is gone since 2026-10-22, BF7:
// Fragile is fragileUse, x 0.7 on the left side of both caps, capScores below.)
// scale (2026-10-19, BF5; owner 21:36: "I think numbers are way too big. Can we HALF everything?" ... "Straight up, the total N value"):
// the whole N (Base, the Level terms, the Map term) times this, so N_BF5(L) = 0.5 × N_v5(L); the A·H rule is (N/3)² of that N. Skill costs stay.
// (BF6, owner 15:09: scale is 1 again; the halving is in the coefficients above.) // v5 (2026-10-19 13:52); levelLinDiv 10 since 15:48 ("let's try L/10"; L/5 before, from the 13:54 check)
const LADDER = ['starter','common','uncommon','rare','veryrare','superrare','epic','heroic','unique','legendary','mythic','ancient','divine','void','daemonic'];
const AS = {quest:'uncommon', questunique:'unique', special:'rare', devlegendary:'legendary', devancient:'ancient', eventlegendary:'legendary', eventrare:'rare'};
// 2026-10-22 (package BF8; owner 11:58: "Blind*ing gives blind ... Blinding will be a flat skill not a multiplier"): the on-hit Blind
// skill (shown as Blinding) is no longer a half-miss quality; it is priced as a skill in canonical/skill-costs.json.
const HALF_MISS = ['evasive', 'swift', 'flying', 'shadow'];
// 2026-10-22 (BF8; owner: "Tide: Just the flat charge is enough. Dont do the minor bonus."): Tide is out of LIGHT; plain Tide costs its
// flat price only. Tide {…} braces stay CONTEXT_MULT (0.4) × their contents (owner: "I think it should be 0.4x").
const LIGHT = ['flying', 'diurnal', 'nocturnal', 'crepuscular', 'sunshy', 'nightblind'];
const PARAMS = ['requiemGrant', 'dirgeGrant', 'carnageGrant', 'musterGrant', 'besetGrant', 'throngGrant' /* ENG10 (2026-10-26): the threshold skills' braces */, 'crepuscularHp', 'crepuscularGrant', 'rainrunnerGrant' /* CX2 */, 'defianceN', 'diurnalGrant', 'diurnalHp', 'espritHp', 'fullMoonGrant', 'loyalGrant', 'nocturnalGrant', 'nocturnalHp', 'swarmN', 'swimmerGrant', 'tideGrant', 'weakness', 'arrowCount', 'hunterVs', 'archerStyle' /* 2026-10-21 (BF5 merge of BX): Archer's look, not an ability */, 'stemGrant' /* 2026-10-21 (EV): a Stem's braces */, 'kinglyGrant' /* 2026-10-21 (TR): King's braces */, 'liegeGrant', 'rageGrant' /* 2026-10-23 (EN): Liege's and Rage's braces */, 'timberedGrant', 'bedrockGrant', 'forgedGrant', 'lastStandGrant' /* 2026-10-24 (EN5): the state skills' braces */, 'plentyGrant', 'scarcityGrant', 'foePlentyGrant', 'foeScarcityGrant', 'heatGrant', 'frostGrant', 'rainGrant', 'stormGrant', 'fogGrant', 'saltGrant', 'droughtGrant', 'seasonGrant', 'arrowBramble', 'fireArrowBramble', 'fireBoltBramble' /* 2026-10-24 (EN6): the state skills' braces and the – bramble toggles */, 'arrowPoison', 'arrowBleed', 'fireArrowPoison', 'fireArrowBleed', 'fireBoltPoison', 'fireBoltBleed', 'diveUses' /* 2026-10-24 (EN7): the – poison / – bleed toggles, Dive's uses */];
// Context skills (2026-10-21, package CX2; owner 17:42: "Regarding context-skills like Diurnal - {} or Tide - {} etc. The costing is wrong.
// Tide - {} should be 0.5x the skills contained within ... Since Tide is not guaranteed, I think the coefficient should be reduced to 0.4x
// instead."): a skill whose braces hold other skills costs CONTEXT_MULT × the S of everything in its braces, across all its phases (Tide:
// Flood's + Ebb's; Crepuscular: day's + night's). Stats in braces count as on the card: +A/+H is 2A + H. The plain flag beside the braces
// (effects.tide next to tideGrant, diurnal next to diurnalGrant ...) costs nothing then: the braces are the skill. Transform (When {…} →
// gain {…}, Lycanthropy) is priced the same way, since its condition is not near-certain either. CONTEXT[k](v) lists a context skill's
// brace sets; CONTEXT_FLAG[k] is the plain flag its braces replace.
const CONTEXT_MULT = 0.4;
const r2 = v=> Math.round(v * 100) / 100;
const obj = x=> x && typeof x === 'object' && !Array.isArray(x) ? x : null;
// Package TR (2026-10-21, owner 18:23, docs/titles-transforms-2026-10-21.md): the named transforms' default braces, used when a card's
// transform names one and lists no gain of its own (the engine's TRANSFORM_GAIN holds the same numbers). Enraged has none: the card sets it.
// Matured's +2/+4 are Stem stats (what an evolute placed over it inherits), priced the same way, 0.4 x (2A + H).
const TRANSFORM_GAIN = {gilded: {attack: 5, health: 10}, championed: {attack: 3, health: 3}, veteran: {attack: 2, health: 4}, matured: {attack: 2, health: 4}};
const nonEmpty = x=> obj(x) && Object.keys(x).length ? x : null;
function transformGainOf(v){ return nonEmpty(v && v.gain) || (v && TRANSFORM_GAIN[v.name]) || null; }
// The Crown's grant (TR): a crowned King has Kingly – {Tribute 1, Armor 2} unless its card names other braces (effects.kinglyGrant).
const KINGLY_DEFAULT = {tribute: 1, armor: 2};
const CONTEXT = {
  tideGrant: v=> [obj(v && v.flood), obj(v && v.ebb)], crepuscularGrant: v=> [obj(v && v.day), obj(v && v.night)],
  diurnalGrant: v=> [obj(v)], nocturnalGrant: v=> [obj(v)], fullMoonGrant: v=> [obj(v)], rainrunnerGrant: v=> [obj(v)],
  loyalGrant: v=> [obj(v)], usurperGrant: v=> [obj(v)], swimmerGrant: v=> [obj(v)],
  transform: v=> [transformGainOf(v)], // + the named presets' default braces (TR, 2026-10-21)
  kinglyGrant: v=> [obj(v)], // King – Kingly {…} (TR, 2026-10-21): 0.4 x the S of what the Crown gives it (the plain King's price is the default's)
  stemGrant: v=> [obj(v)], // Stem / Chrysalis – {…} (2026-10-21, package EV): what it hands the evolute placed over it, at 0.4 × its S
  liegeGrant: v=> [obj(v)], // Liege – {…} (2026-10-23, package EN): its braces while a King is on its side, at CONTEXT_MULT_BY.liegeGrant (0.3)
  rageGrant: v=> [obj(v)], // Rage – {…} (2026-10-23, package EN): its braces while its Rage is on, at CONTEXT_MULT_BY.rageGrant (0.4), on top of Rage's own price
  bloomWhen: v=> obj(v && v.grant) ? [Object.assign({attack: +(v.atk || 0), health: +(v.hp || 0)}, v.grant)] : null, // only Bloom's braces form; the plain +2/+2 keeps its measured worth
  bloomCopy: v=> { const p = bloomChainOdds(v); return [{attack: p, health: p}]; }, // Bloom – {conditions} (BL, 2026-10-23): the copy's +1/+1, x the odds (see bloomOdds); EN5: x the chain (bloomChainOdds)
  // State skills (EN5, 2026-10-24): their braces while the side's state holds, at CONTEXT_MULT_BY's uptime (the plain flag is priced in skill-costs.json)
  timberedGrant: v=> [obj(v)], bedrockGrant: v=> [obj(v)], forgedGrant: v=> [obj(v)], lastStandGrant: v=> [obj(v)],
  // EN6 (2026-10-24): the hand, heat / frost, weather and season state skills, the same way (their uptime: EN6_UPTIME)
  plentyGrant: v=> [obj(v)], scarcityGrant: v=> [obj(v)], foePlentyGrant: v=> [obj(v)], foeScarcityGrant: v=> [obj(v)], heatGrant: v=> [obj(v)], frostGrant: v=> [obj(v)], rainGrant: v=> [obj(v)], stormGrant: v=> [obj(v)], fogGrant: v=> [obj(v)], saltGrant: v=> [obj(v)], droughtGrant: v=> [obj(v)], seasonGrant: v=> [obj(v)]
};
// Bloom – {conditions} (2026-10-23, package BL; owner 11:23: "Bloom - {Conditions}. Let's just define bloom as +1/+1, then make a copy of
// this card"; 19:30: "I think bloom only gives the new one +1/+1, not itself."): once, when its conditions hold at a round's start, a copy of the
// unit (the same body) grows beside it and the copy gains +1/+1. Priced in two parts by the odds p that it ever blooms (bloomOdds):
//   S = p × (2×1 + 1) = 3p, the copy's +1/+1 (a context skill: CONTEXT.bloomCopy, multiplier 1);
//   cap 1's stat terms × (1 + p) (bloomBodyMult, in capScores): with odds p a second body of the same stats arrives. Cap 2 (A·H, how much
//   is packed into one body) is left alone: the copy is a second body, not a bigger one. The copy's own skills ride on S as they are.
// p = the conditions' odds over a unit's life (BLOOM_ODDS; 'and' multiplies them, 'or' is 1 − Π(1 − odds)) × BLOOM_LIVE (it is still on
// the field at a round's start once they hold, with a free slot beside it) × BLOOM_LUMBER per Lumber it pays. These are formula estimates,
// not measured (the robust skill test does not model the copy yet); Wet & Sunny p 0.27, Wet & Kill 0.17, Wet & Sunny + 1 Lumber 0.23.
const BLOOM_ODDS = {day: 0.85, sunny: 0.8, night: 0.8, twilight: 0.4, dark: 0.85, tide: 0.35, ebb: 0.3, wet: 0.4, rain: 0.15, wind: 0.25, heat: 0.1, frost: 0.1, fullmoon: 0.15, kill: 0.5};
const BLOOM_ODDS_OTHER = 0.3, BLOOM_LIVE = 0.85, BLOOM_LUMBER = 0.85;
function bloomOdds(v){ if(!obj(v)) return 0; const w = (Array.isArray(v.when) ? v.when : [v.when]).filter(Boolean).map(x=> String(x).toLowerCase().replace(/\s+/g, ''));
  if(!w.length) return 0; const o = w.map(k=> BLOOM_ODDS[k] != null ? BLOOM_ODDS[k] : BLOOM_ODDS_OTHER);
  const hit = v.mode === 'or' ? 1 - o.reduce((a, x)=> a * (1 - x), 1) : o.reduce((a, x)=> a * x, 1);
  return r2(hit * BLOOM_LIVE * Math.pow(BLOOM_LUMBER, Math.max(0, Math.round(+v.lumber || 0)))); }
// EN5 (2026-10-24, owner 03:12: "the copy can bloom"): each copy blooms once too, when the conditions still hold for it and a cell beside
// it is free (left / right, or the next row on a raid or Group Dungeon board). The expected number of copies is p × (1 + q + q²): the
// copy's copy and one more generation (the board is full by then), q = BLOOM_CHAIN_Q, the share of copies that live to a round where the
// conditions still hold with a free cell beside them (a formula estimate: the conditions usually still hold the next round, about 0.85 x
// BLOOM_LIVE, but a free cell is likelier missing for the second copy, x 0.6).
const BLOOM_CHAIN_Q = 0.43;
function bloomChainOdds(v){ const p = bloomOdds(v), q = BLOOM_CHAIN_Q; return r2(p * (1 + q + q * q)); }
function bloomBodyMult(effects){ const e = effects || {}; return e.bloomCopy ? 1 + bloomChainOdds(e.bloomCopy) : 1; } // EN5: the chain's copies (was 1 + p)
// Context skills with their own multiplier (2026-10-23, package EN). Liege – {…}: 0.3 (owner TR-4: "Liege is worth 0.3x {...}").
// Rage – {…}: 0.4, by logic: Rage is on for the lower half of the unit's Health (0.5), and a unit can
// fall from above half in one blow (x 0.8). Rage itself keeps its own price beside it (rage is not in CONTEXT_FLAG: the braces add to it).
// State skills (EN5, 2026-10-24, owner 03:12; priced by the owner's 4-round rule x the state's typical uptime, call EN5-4): the share of a
// unit's rounds its side holds the state. tools/en5_state_uptime_2026_10_24.js (docs/balance/en5-state-uptime-2026-10-24.json, 2000 CPU
// fights of random live decks) read: 3+ Lumber 0.9% (the CPU spends Lumber as it comes), 2+ Stone 0.5% even with 4 Stone makers (one card
// makes Stone), 1+ Metal 0.9% (83% with 4 Metal makers: nothing spends Metal), the bramble at a third or less 10%. A card with the skill is
// played to hold its state, so the uptimes are judged from those: Timbered 0.25 (a player who keeps 3 Lumber back from the 4th round),
// Bedrock 0.2 (Stone is scarce: Quarry and stone pitches), Forged 0.5 (half of 83%: the deck may hold no maker), Last Stand 0.2 (10%,
// and the rounds it is on decide fights: tools/skill_test_robust.js read plain Last Stand at 0.62, x 3 points = 0.2; Timbered read 0.38
// there, where the CPU spends its Lumber; docs/balance/en5-breach-states-2026-10-24.md).
const EN5_UPTIME = {timberedGrant: 0.25, bedrockGrant: 0.2, forgedGrant: 0.5, lastStandGrant: 0.2};
// EN6 (2026-10-24, owner 03:17 + 12:02 #11; priced by the 4-round rule x the state's uptime, call EN6-2): tools/en6_state_uptime_2026_10_24.js
// (docs/balance/en6-state-uptime-2026-10-24.json; 1500 CPU fights of random live decks for the hand, every conquest fight's rules x 6 fights for
// the field). The hand at the moment combat starts: 0 cards 6%, 1 card 73%, 2 cards 20%, 3+ 1.5% (the CPU plays a card a turn and draws one),
// so Scarcity (1 or fewer) holds 0.79, Foe's Scarcity 0.77, Plenty (4+) 0.2% and Foe's Plenty 0.1%: Plenty is judged at 0.15 (a player who
// holds cards back to keep it on), Foe's Plenty 0.05 (a human opponent who hoards). The field: over all 263 fights / over the fights where
// the state ever holds ('home'): Heat 0.21 / 1.0, Frost 0.11 / 1.0, Rain 0.017 / 0.08, Storm 0.14 / 0.76, Fog 0.04 / 1.0, Salt 0.04 / 0.45,
// Drought 0.26 / 0.75; a card made for those maps plays about half its fights there, so the price takes the midpoint of the two. Season:
// each season about 0.25 of a fight with the Seasons cycle on (3 rounds a season); no map runs the cycle yet (call EN6-4).
const EN6_UPTIME = {plentyGrant: 0.15, scarcityGrant: 0.79, foePlentyGrant: 0.05, foeScarcityGrant: 0.77, heatGrant: 0.6, frostGrant: 0.56, rainGrant: 0.05, stormGrant: 0.45, fogGrant: 0.52, saltGrant: 0.25, droughtGrant: 0.5, seasonGrant: 0.25};
// Hibernate (EN6): asleep while the field is cold, or at night on a cold map: 0.08 of all fights' unit-rounds, 0.86 on its home maps; the
// midpoint, 0.47, is the share of rounds its Attack does nothing (skill_costs.js budget: A x (1 - this)).
const EN6_HIBERNATE_UPTIME = 0.47;
// – bramble (EN6, owner 03:17 #2: "Actions: Some actions like arrow - can have a subtoggle - bramble"): the same shot at the enemy bramble. By the
// 4-round rule a point of bramble damage is worth about what a point at a unit is (Breach: 1.9 for about 3 landed hits, 0.63 a point; +1
// Attack's 2 points buy about 3 damage at units, 0.67 a point); it never misses or meets a shield, but it leaves the blocker standing: x 0.9.
const EN6_BRAMBLE_SHOTS = {arrowBramble: 'arrow', fireArrowBramble: 'fireArrow', fireBoltBramble: 'fireBolt'}, EN6_BRAMBLE_ACTIONS = ['arrow', 'missile', 'damage'], EN6_BRAMBLE_MULT = 0.9;
// EN7 (2026-10-24, owner 13:12 #5: "if it has Poison N, or Bleed N, it gives N tokens during ambush/pounce-like, fork-like skills ... As long
// it aint TOO overpowered"): a unit's Poison N / Bleed N now also ride on its Pounce and its Ambush strike (Fork / Trident / Pitchfork prongs,
// Octolash already carried them; Cleave's spread does not). By the 4-round rule Poison N's price is about 3 landed swings' worth over a 4-round life; Pounce
// adds one more landing, early (it ticks the longest): 0.33 of the status's price; Ambush strikes about once a fight, on arrival: 0.3. These are
// the shares of Poison / Bleed / Rabid / Greater Poison's price a card with Pounce / Ambush pays on top (tools/skill_costs.js cardS).
// – poison / – bleed on a shot (effects.arrowPoison ... fireBoltBleed): the shot lands each round as a swing would, a little less often (Evasive,
// Reflect, the bramble when nothing faces it): 0.9 x the price of Poison (Bleed) at the unit's own N, at least 1. On an Arrow / Missile / Deal
// damage action (t.withPoison / t.withBleed): + 0.9 x the Poison (Bleed) action's value at that N, x the trigger's weight as the action is.
// ENG9 (2026-10-26, owner EN7-3: "Cleave and related DOES spread the status."): Cleave's side hits carry the unit's Poison / Bleed now. Its
// spread lands on about one more unit a swing that has a neighbour beside its target (each side hit at the Cleave's own N, a share of a swing):
// 0.6 of the status's price on top (sweep is Cleave's engine key).
const EN7_EXTRA_HIT = {pounce: 0.33, ambush: 0.3, sweep: 0.6 /* ENG9 */}, EN7_EXTRA_HIT_KEYS = ['poison', 'bleed', 'rabid', 'greaterPoison'];
const EN7_TIP_SHOTS = {arrowPoison: ['arrow', 'poison'], arrowBleed: ['arrow', 'bleed'], fireArrowPoison: ['fireArrow', 'poison'], fireArrowBleed: ['fireArrow', 'bleed'], fireBoltPoison: ['fireBolt', 'poison'], fireBoltBleed: ['fireBolt', 'bleed']}, EN7_TIP_MULT = 0.9, EN7_TIP_ACTIONS = ['arrow', 'missile', 'damage'];
const CONTEXT_MULT_BY = Object.assign({liegeGrant: 0.3, rageGrant: 0.4, bloomCopy: 1 /* BL (2026-10-23): the odds are already in its braces */}, EN5_UPTIME, EN6_UPTIME);
const CONTEXT_FLAG = {tide: 'tideGrant', diurnal: 'diurnalGrant', nocturnal: 'nocturnalGrant', crepuscular: 'crepuscularGrant', fullMoon: 'fullMoonGrant', stem: 'stemGrant', chrysalis: 'stemGrant' /* EV (2026-10-21): the braces carry a Stem's or Chrysalis's cost */, king: 'kinglyGrant' /* TR (2026-10-21) */, liege: 'liegeGrant' /* EN (2026-10-23): a plain Liege is Liege – {Assault 2}, priced in skill-costs.json */, timbered: 'timberedGrant', bedrock: 'bedrockGrant', forged: 'forgedGrant', lastStand: 'lastStandGrant' /* EN5 (2026-10-24): the plain ones are priced in skill-costs.json */, plenty: 'plentyGrant', scarcity: 'scarcityGrant', foePlenty: 'foePlentyGrant', foeScarcity: 'foeScarcityGrant', heat: 'heatGrant', frost: 'frostGrant', rain: 'rainGrant', storm: 'stormGrant', fog: 'fogGrant', salt: 'saltGrant', drought: 'droughtGrant', season: 'seasonGrant' /* EN6 (2026-10-24) */};
// S of a context skill: {S, inner} (null when k is not one, or its braces are the plain form). costOf(effects) is the caller's S of a set of
// skills (no stats in it); the stats in the braces are added here as 2A + H.
function contextS(k, v, costOf, mult){ const f = CONTEXT[k]; if(!f) return null; const sets = f(v); if(!sets) return null; let inner = 0;
  sets.forEach(g=>{ if(!g) return; const rest = Object.assign({}, g), A = +rest.attack || 0, H = (+rest.health || 0) + shieldHealthOf(rest) /* FIN2-c (2026-10-26): a Shield in braces is 0.8 Health */; delete rest.attack; delete rest.health;
    inner += awNow() * A + H + (Object.keys(rest).length ? (+costOf(rest) || 0) : 0); }); // BUDGET2 (2026-10-31): 3A + H (was 2A + H)
  const m = mult == null ? (CONTEXT_MULT_BY[k] != null ? CONTEXT_MULT_BY[k] : CONTEXT_MULT) : +mult; return {S: r2(m * inner), inner: r2(inner), mult: m}; } // + CONTEXT_MULT_BY (EN, 2026-10-23)
// true when effects.k is a plain flag whose braces sit beside it (it costs nothing on its own then)
function contextFlagCovered(k, e){ const g = CONTEXT_FLAG[k]; return !!(g && e && e[g] && typeof e[g] === 'object'); }
// a card's abilities: its effects keys with a value (not a parameter of another skill), each trigger as 'trigger:<on>'
function abilitiesOf(effects, params){ const e = effects || {}, P = params || PARAMS, out = [];
  Object.keys(e).forEach(k=>{ const v = e[k]; if(v == null || v === false || v === 0 || v === '' || (Array.isArray(v) && !v.length) || P.includes(k)) return;
    if(k === 'triggers'){ (Array.isArray(v) ? v : []).forEach(t=> out.push('trigger:' + ((t && t.on) || '?'))); return; } out.push(k); });
  return out; }
// The two-skill rule's count (2026-10-21, package TR; owner, decision HB2-1, 18:23: "Flying, Tide (plain), Diurnal (plain) and Nocturnal
// (plain) do not count as skills for the two-skill limit. Having several of them counts as 1."): skillCountOf(effects) is the number of
// abilities (abilitiesOf) with the plain forms of these four left out, plus 1 when a card has two or more of them. "Plain" means without
// braces: Tide beside its tideGrant, Diurnal / Nocturnal beside their Grant count like any skill (their numbered +A/+H is still plain).
const TWO_SKILL_FREE = ['flying', 'tide', 'diurnal', 'nocturnal'];
function twoSkillFree(k, e){ return TWO_SKILL_FREE.includes(k) && !(e && e[k + 'Grant'] && typeof e[k + 'Grant'] === 'object'); }
function skillCountOf(effects, params){ const e = effects || {}, a = abilitiesOf(e, params), free = a.filter(k=> twoSkillFree(k, e)).length;
  return a.length - free + (free >= 2 ? 1 : 0); }
// Chained as an N multiplier (ENG9, 2026-10-26, owner G19: "Being chained should grant a larger budget - multiplicatively"): a Chained unit
// can't act until its chain breaks, so its stats are worth less for those rounds. By the 4-round rule: it takes about 3 damage a round in the
// line, so a 'damage N' chain holds it about N/3 rounds (at most the whole 4-round life). A held round is a quarter of its life with no swing
// and no say in where it fights (it is the enemy's free target); the old flat credit (S -3) was about +20% of N on a typical card and the owner
// wants more than that: x(1 + 0.25 per held round): Chained 1 1.08, 4 1.33, 9 1.75, 12+ 2. 'enemySpawn' (the opponent plays a card) breaks
// within about half a round: 1.1. Its skill price is 0 (canonical/skill-costs.json).
const CHAINED_PER_ROUND = 0.25, CHAINED_DMG_A_ROUND = 3, CHAINED_MAX_ROUNDS = 4, CHAINED_SPAWN_MULT = 1.1;
function chainedMult(effects){ const c = effects && effects.chained; if(!c) return 1; if(typeof c === 'object' && c.breakOn === 'enemySpawn') return CHAINED_SPAWN_MULT;
  const n = Math.max(1, Number(c && c.amount) || 1); return r2(1 + CHAINED_PER_ROUND * Math.min(CHAINED_MAX_ROUNDS, n / CHAINED_DMG_A_ROUND)); }
function nMultOf(effects, cfg, params){ const a = abilitiesOf(effects, params || (cfg && cfg.params)); let k = 1;
  if(!a.length) k *= num(cfg, 'plainBonus'); else if(a.every(x=> LIGHT.includes(x))) k *= num(cfg, 'lightBonus');
  k *= chainedMult(effects); // ENG9 (2026-10-26, G19)
  return k; } // BF7 (2026-10-22): Fragile is no longer an N multiplier (fragileUseOf / capScores)
const MAJOR = [4, 7, 10], MINOR = [2], LIMIT = 11;
const SHARE = {major: 1, limit: 1, minor: 1, other: 1 / 3};
const cfgOf = cfg=> Object.assign({}, DEFAULTS, cfg || {});
const num = (cfg, k)=>{ const v = cfg && cfg[k]; return v == null || v === '' || !Number.isFinite(Number(v)) ? DEFAULTS[k] : Number(v); };
// Rarity = a rank on the ladder + at most one flag (2026-10-21, package CX2; owner 17:42: "Too simplify to just quest, event, and dev toggles
// (and also 'special'). The common->Daemonic are the normal rank progression."). The stored strings stay as they are (no cards.json
// migration): quest = Quest + Uncommon, questunique = Quest + Unique, special = Special + Rare, devlegendary / devancient = Dev + Legendary /
// Ancient, eventlegendary / eventrare = Event + Legendary / Rare. Any other pair is the flag then the rank, in the same style
// ('questrare', 'devepic', 'eventheroic', 'specialepic' ...); rankOf reads those too.
const RARITY_FLAGS = ['quest', 'event', 'dev', 'special'];
const RARITY_STORED = {quest: ['quest', 'uncommon'], questunique: ['quest', 'unique'], special: ['special', 'rare'], devlegendary: ['dev', 'legendary'], devancient: ['dev', 'ancient'], eventlegendary: ['event', 'legendary'], eventrare: ['event', 'rare']};
function rarityParts(r){ const k = String(r || 'common'); if(RARITY_STORED[k]) return {flag: RARITY_STORED[k][0], rank: RARITY_STORED[k][1]};
  for(const f of RARITY_FLAGS){ if(k.startsWith(f) && LADDER.includes(k.slice(f.length))) return {flag: f, rank: k.slice(f.length)}; }
  return {flag: null, rank: LADDER.includes(k) ? k : 'common'}; }
function rarityCompose(rank, flag){ rank = LADDER.includes(rank) ? rank : 'common'; if(!flag || !RARITY_FLAGS.includes(flag)) return rank;
  const hit = Object.keys(RARITY_STORED).find(k=> RARITY_STORED[k][0] === flag && RARITY_STORED[k][1] === rank); return hit || (flag + rank); }
function rankOf(rarity){ const k = rarity || 'common'; return Math.max(0, LADDER.indexOf(AS[k] || rarityParts(k).rank)); }
// Deck caps on the top ranks (2026-10-22, package DR; owner: "For Legendary onwards, only 3 Legendaries can exist in a deck (including leader),
// Mythic takes this to 2, then beyond only 1. (meaning you can only own at max 2 differently named mythics in a deck). And so on."): per deck,
// the leader included, at most 3 cards of Legendary, 2 of Mythic and 1 of each rank above (Ancient, Divine, Void, Daemonic). Each rank's cap is
// its own (they do not share one pool). A flagged rarity counts as its rank (rankOf: devlegendary = Legendary). Copies count: the per-rarity copy
// limits already hold Unique and up to 1 copy, so in practice these are 3 / 2 / 1 different cards. The cap table is the only place the numbers live.
const DECK_RANK_CAPS = {legendary: 3, mythic: 2}, DECK_RANK_CAP_REST = 1;
function deckRankCapOf(rarity){ const i = rankOf(rarity); if(i < LADDER.indexOf('legendary')) return null; const rank = LADDER[i];
  return {rank, cap: DECK_RANK_CAPS[rank] || DECK_RANK_CAP_REST}; }
// {rank: {n, cap}} for the capped ranks a deck uses. counts = {cardId: copies}, defs = {cardId: def}, leaders = [cardId] (each counts once).
function deckRankUsage(counts, defs, leaders){ const out = {};
  const add = (id, n)=>{ const d = defs && defs[id]; if(!d || d.token || !(n > 0)) return; const c = deckRankCapOf(d.rarity); if(!c) return;
    const o = out[c.rank] || (out[c.rank] = {n: 0, cap: c.cap}); o.n += n; };
  Object.keys(counts || {}).forEach(id=> add(id, counts[id] | 0)); (leaders || []).forEach(id=> { if(id) add(id, 1); }); return out; }
// The ranks over their cap: [{rank, n, cap}].
function deckRankOver(counts, defs, leaders){ const u = deckRankUsage(counts, defs, leaders);
  return Object.keys(u).filter(r=> u[r].n > u[r].cap).map(r=> ({rank: r, n: u[r].n, cap: u[r].cap})); }
// null, or {rank, n, cap} when one more copy of `id` would put its rank over the cap (n = what the deck holds already).
function deckRankBlock(counts, id, defs, leaders){ const d = defs && defs[id]; if(!d || d.token) return null; const c = deckRankCapOf(d.rarity); if(!c) return null;
  const u = deckRankUsage(counts, defs, leaders)[c.rank]; const n = u ? u.n : 0; return n >= c.cap ? {rank: c.rank, n, cap: c.cap} : null; }
function ritualPts(effects){ const r = effects && effects.ritual; return r && typeof r === 'object' ? Object.values(r).reduce((a, b)=> a + (+b || 0), 0) : 0; }
// The level-independent part of N for a card ({rarity, wait, cost, effects, obtainMap}). 2026-10-19 (BF2, owner 15:25: "note that there is
// a Map * 0.2 number there"): + perMap (0.2) × the map number where the card becomes obtainable (d.obtainMap: a map reward its map, a
// pack card where its pack goes on sale, a raid card where raids open; Base, tutorial and unobtainable cards 0; the game's cardObtainMap,
// canonical/card-obtain-maps.json for the tools and the hub).
function baseOf(d, cfg){ d = d || {}; const W = +d.wait || 0, C = +d.cost || 0, M = +(d.obtainMap != null ? d.obtainMap : (typeof d.map === 'number' ? d.map : 0)) || 0; // .map: tools/special_monsters.js (RJ) passes the map that way
  return r2(num(cfg, 'base') + num(cfg, 'perRarity') * rankOf(d.rarity) + num(cfg, 'perWait') * W + num(cfg, 'perWait2') * W * W + num(cfg, 'perLumber') * C + num(cfg, 'perLumber2') * C * C + num(cfg, 'perRitual') * ritualPts(d.effects) + num(cfg, 'perMap') * M); }
// N at level L for a Base: (Base − 1 + L) × (1 + L/20).
// Base in its parts (2026-10-19, BF2; owner 14:07: "There should be a Base = ..."): {total, parts: [{k: 'base'|'rarity'|'wait'|'lumber'|'ritual', v}]},
// zero parts left out but the starting number; the parts add up to total (each rounded to 0.01, as baseOf).
function baseParts(d, cfg){ d = d || {}; const W = +d.wait || 0, C = +d.cost || 0, parts = [{k: 'base', v: num(cfg, 'base')}];
  const add = (k, v)=>{ v = r2(v); if(v) parts.push({k, v}); };
  add('rarity', num(cfg, 'perRarity') * rankOf(d.rarity)); add('wait', num(cfg, 'perWait') * W + num(cfg, 'perWait2') * W * W);
  add('lumber', num(cfg, 'perLumber') * C + num(cfg, 'perLumber2') * C * C); add('ritual', num(cfg, 'perRitual') * ritualPts(d.effects));
  const M = +(d.obtainMap != null ? d.obtainMap : (typeof d.map === 'number' ? d.map : 0)) || 0; if(M && num(cfg, 'perMap')) parts.push({k: 'map', v: r2(num(cfg, 'perMap') * M), map: M, coef: num(cfg, 'perMap')});
  return {total: baseOf(d, cfg), parts}; }
// N at level L for a Base (v5): (Base + L/levelLinDiv) × (1 + L/levelDiv); Level 0 is Base − zeroPenalty.
function nAt(base, L, cfg){ L = Math.max(0, Number(L) || 0); const k = num(cfg, 'scale'); if(L <= 0) return r2(k * (base - num(cfg, 'zeroPenalty'))); return r2(k * (base + L / num(cfg, 'levelLinDiv')) * (1 + L / num(cfg, 'levelDiv'))); }
// v4's N (2026-10-19 09:52, replaced at 13:52), for comparisons only: (Base − 1 + L) × (1 + L/20).
function nV4(base, L){ L = Math.max(0, Number(L) || 0); return r2((base - 1 + L) * (1 + L / 20)); }
// The formula as text, from the numbers in use (the card editor, the Test Lab, the hub): {n, base}.
function formulaParts(cfg){ const g = k=> num(cfg, k), t = (k, label)=> (g(k) === 1 ? '' : g(k) + '×') + label;
  const k = g('scale'), pre = k === 1 ? '' : `${k} × `; // BF5: the scale on the whole N
  // BF7 (2026-10-22): the half-miss m on the stat terms only; Fragile's f on the whole left side (capScores)
  return {cap1: `(${g('attackWeight')}A + H)×m + S ≤ N` /* BUDGET2 (2026-10-31) */, cap2: `A·H×m + S·|S| ≤ ${g('cap2Mult')}×(N/3)²` /* BF6 (owner 15:15); BF7 m on the stats only */, n: `N = ${pre}(Base + Level/${g('levelLinDiv')}) × (1 + Level/${g('levelDiv')})`, zero: `Level 0: ${pre}(Base − ${g('zeroPenalty')})`, scale: k, plain: g('plainBonus'), light: g('lightBonus'), fragile: g('fragileUse'),
    miss: `m = ${g('missMult')} per half-miss skill (Evasive, Swift, Shadow; Flying ${MISS_MULT_BY.flying}), on the stats only, not on S` /* BF7; BF10 Flying */,
    fragileText: `Fragile, Purblind: both left sides × ${g('fragileUse')} (more stats for a card that takes double damage or swings blind)` /* BF7 */,
    context: `Context skills ({…}): ${CONTEXT_MULT} × S of the skills in their braces` /* CX2 */,
    shield: `H counts a unit's own Shield as ${g('shieldPerHealth')} Health a point` /* FIN2-c (2026-10-26) */,
    base: `Base = ${g('base')} + ${t('perRarity', 'Rarity')} + ${g('perWait')}×Wait + ${g('perWait2')}×Wait² + ${g('perLumber')}×Lumber + ${g('perLumber2')}×Lumber² + ${t('perRitual', 'Ritual')} + ${g('perMap')}×Map`}; }
function nOf(d, L, cfg){ return r2(nAt(baseOf(d, cfg), L, cfg) * nMultOf(d && d.effects, cfg)); } // BF5: x the card's N multiplier
// v3's N, for comparisons only (docs, the BF report): Base + 2×Level.
function nV3(base, L){ return r2(base + 2 * Math.max(0, Number(L) || 0)); }
// Cap 2's score before the half-miss multiplier (BF6, owner 15:15): A·H + S·|S|.
// 2026-10-31 (package SPEED1, owner SKILL2-1): cap 2 reads the skill price S at CAP2_S_SCALE of itself, (S x k)·|S x k|. At 1 it is the old S·|S|; the owner's
// call is 0.5, so a re-priced skill no longer breaks cap 2 on its own. One constant; tools/pipeline/run.sh price --set-const cap2SScale=0.5 sets it.
const CAP2_S_SCALE = 1;
function cap2SOf(S, cfg){ const k = cfg && cfg.cap2SScale != null ? +cfg.cap2SScale : CAP2_S_SCALE, v = (+S || 0) * k; return v * Math.abs(v); }
function productScore(A, H, S, cfg){ A = +A || 0; H = +H || 0; return A * H + cap2SOf(S, cfg); }
// Per-skill half-miss multipliers (2026-10-23, package BF10; owner 01:03: "I think Flying may be overcosted."): the robust skill test
// (docs/balance/skill-test-robust-mono-2000-2026-10-22.md) measured Flying's worth at 5.88 stat points against 6.89 paid at x1.5, so
// Flying is x1.4. A skill not listed uses missMult (1.5). cfg.missMultBy overrides the table.
const MISS_MULT_BY = {flying: 1.39, evasive: 1.37, shadow: 1.1}; // owner 01:57: "I estimate Flying is worth x1.39"; 2026-10-23 (BF12, call BF10-1): Evasive and Shadow at their measured worth
// Cap 2's limit (2026-10-23, package BF11; owner 11:11: "Im also starting to think N/3 ^2 is too restrictive. Maybe 2*(N/3)^2 since we
// have A*H + S*|S|."): cap2Mult × (N/3)², cap2Mult 2 (was 1). Every cap-2 check reads this one helper.
function cap2Limit(N, cfg){ const k = cfg && cfg.cap2Mult != null ? +cfg.cap2Mult : DEFAULTS.cap2Mult; return (N / 3) * (N / 3) * k; }
function missMultFor(k, cfg){ const t = (cfg && cfg.missMultBy) || MISS_MULT_BY; return t[k] != null ? +t[k] : num(cfg, 'missMult'); }
// Canopy Cover (EN5, 2026-10-24, owner FLY-1: "ground units hiding under the cover of trees/canopy for 50% evasion"): Evasive's dodge while
// the field has trees over it, so a half-miss multiplier conditioned on the field: 1 + (Evasive's multiplier − 1) × CANOPY_UPTIME, the share
// of a Canopy Cover card's fights under the trees. 40 of the conquest maps' 267 fights (15%) are on a forest-biome map, High Canopy or the
// Undergrowth (the 50-floor climbs left out); a forest creature is mostly played on the maps it is won on, so CANOPY_UPTIME is 0.4 (call
// EN5-3). Not with Evasive (one roll): Evasive's own multiplier then. Not on a Flying card (it is not a ground unit, except when grounded).
const CANOPY_UPTIME = 0.4;
// 2026-10-30 (package TUT2, owner ENG13-3: "just use logic and reduce it, no need to remeasure."): since ENG13 the cover dodges only shots,
// skills and Flying / thrown swings, not a ground unit's melee swing (it dodged every single-target attack before). CANOPY_SHARE is the share
// of single-target attacks of those kinds over the live cards on the map lists, each card weighted by the lists it is on
// (tools/tut2_canopy_share_2026_10_30.js: 162 of 739 = 0.219 -> 0.22), so the multiplier is 1 + 0.37 x 0.4 x 0.22 = x1.033 (was x1.148).
// cfg.canopyShare overrides it.
const CANOPY_SHARE = 0.22;
function canopyMultOf(e, cfg){ if(!e || !e.canopyCover || e.evasive || e.flying) return 1; const sh = cfg && cfg.canopyShare != null ? +cfg.canopyShare : CANOPY_SHARE; return 1 + (missMultFor('evasive', cfg) - 1) * CANOPY_UPTIME * sh; } // TUT2: x CANOPY_SHARE
// Slow (2026-10-30, package TUT2, owner ENG13-2: "maybe just sloth titan, old-growth tortoise and garden snail ... The price should be *0.85
// instead. So it has more budget!"): a multiplier on the card's skill cost, not a flat price (ENG13 priced it -0.8): a Slow card's other
// priced skills cost x0.85 (Slow frees 15% of S); Slow alone costs 0. Only a positive S shrinks (a drawback total is left as it is).
// The table's own entry (canonical/skill-costs.json "slow", scale "mult") wins; tools/skill_costs.js cardS applies it.
const SLOW_S_MULT = 0.85;
function slowSMultOf(effects, entry){ if(!effects || !effects.slow) return 1; return entry && entry.scale === 'mult' && typeof entry.value === 'number' ? entry.value : SLOW_S_MULT; }
function missMultOf(effects, cfg){ const e = effects || {}; let x = 1; ((cfg && cfg.halfMiss) || HALF_MISS).forEach(k=>{ if(e[k]) x *= missMultFor(k, cfg); }); return x * canopyMultOf(e, cfg); } // + Canopy Cover (EN5)
// BF7 (2026-10-22, owner: "things that must be less than N have a x0.7 multiplier!"): f, fragileUse (0.7) for a Fragile card, else 1.
// BF8 (2026-10-22, owner: "Purblind will be 0.7x"): a Purblind card (blind itself) takes the same f; Fragile and Purblind together multiply.
function fragileUseOf(effects, cfg){ const e = effects || {}, f = num(cfg, 'fragileUse'); let x = 1; if(e.fragile) x *= f; if(e.purblind) x *= f; return x; }
// The two caps' left sides (BF7, 2026-10-22), the one copy every check calls (tools/skill_costs.js budget, the game's sbCheck, the hub):
// {m, f, x1: f × ((2A + H) × m + S), x2: f × (A·H × m + S·|S|)}; cap 1 is x1 ≤ N, cap 2 x2 ≤ (N/3)². A is the Attack that counts (an
// Archer's is 0, the caller's rule). opts.m / opts.f stand in for the card's own (a caller that knows only the multiplier).
function capScores(A, H, S, effects, cfg, opts){ A = +A || 0; H = +H || 0; S = +S || 0;
  const m = opts && opts.m != null ? +opts.m : missMultOf(effects, cfg), f = opts && opts.f != null ? +opts.f : fragileUseOf(effects, cfg);
  const k = bloomBodyMult(effects); // Bloom (BL, 2026-10-23): a copy of the body with odds p, cap 1's stat terms only
  const sh = opts && opts.sh != null ? +opts.sh || 0 : shieldHealthOf(effects, cfg), He = H + sh; // FIN2-c (2026-10-26): Shield as 0.8 Health; opts.sh for a caller without the effects
  const aw = num(cfg, 'attackWeight'); // BUDGET2 (2026-10-31, owner RECOST1-6): 3A + H (was 2A + H)
  return {m, f, k, sh, x1: r2(f * ((aw * A + He) * m * k + S)), x2: r2(f * (A * He * m + cap2SOf(S, cfg)))}; }
function levelKind(L){ if(L === LIMIT) return 'limit'; if(MAJOR.includes(L) || (L > 10 && L % 3 === 1)) return 'major'; if(MINOR.includes(L)) return 'minor'; return 'other'; }

// The curve for a card d ({attack, health, rarity, wait, cost, effects}) from its start level `from` (0 or 1) to `top` (11 for the
// usual Lv 10 cards: the limit break). Returns {base, from, top, m, rows: {L: {attack, health, points, kind, N}}}, rows[from] the
// printed stats. Stats that are null (a spell) stay null.
function forgeCurve(d, from, top, cfg){
  d = d || {}; from = Math.max(0, from | 0); top = Math.max(from, top | 0);
  const base = baseOf(d, cfg), m = missMultOf(d.effects, cfg) * fragileUseOf(d.effects, cfg) /* BF7: m × f, see the top */, A0 = d.attack, H0 = d.health, km = nMultOf(d.effects, cfg), NL = L=> r2(nAt(base, L, cfg) * km); // BF5: x the card's N multiplier
  const rows = {}; rows[from] = {attack: A0, health: H0, points: 0, kind: 'base', N: NL(from)};
  if(A0 == null && H0 == null){ for(let L = from + 1; L <= top; L++) rows[L] = {attack: A0, health: H0, points: 0, kind: levelKind(L), N: NL(L)}; return {base, from, top, m, rows}; }
  const aw = num(cfg, 'attackWeight') /* BUDGET2 (2026-10-31): a point of Attack costs 3 (was 2) */, a0 = +A0 || 0, h0 = +H0 || 0, w0 = Math.max(1, aw * a0 + h0), sh = shieldHealthOf(d.effects, cfg) /* FIN2-c (2026-10-26): Shield as 0.8 Health in the A·H room */, room0 = Math.pow(NL(from) / 3, 2) - m * a0 * (h0 + sh);
  let A = a0, H = h0, P = 0, bank = 0;
  for(let L = from + 1; L <= top; L++){
    const N = NL(L), kind = levelKind(L), room = h=> cap2Limit(N, cfg) - m * h.a * (h.h + sh); /* BF11 */
    bank = r2(bank + (N - NL(L - 1)) / (m * bloomBodyMult(d.effects))); // + Bloom's copy (BL, 2026-10-23): a stat point costs (1 + p) of N
    let p = Math.floor(bank * SHARE[kind] + 1e-9); if(kind === 'major' || kind === 'limit') p = Math.max(1, p);
    // split p points: Attack toward the shape (never more than p/2), the rest Health; Attack only when there is no Health stat
    const split = (pp, prefer)=>{
      if(H0 == null) { const da = Math.floor(pp / aw); return {a: A + da, h: H, used: aw * da}; }
      if(A0 == null || a0 <= 0) return {a: A, h: H + pp, used: pp};
      let da = Math.max(0, Math.min(Math.floor(pp / aw), Math.round(a0 * (w0 + P + pp) / w0) - A));
      if(prefer === 'health') da = 0; else if(prefer === 'attack') da = Math.floor(pp / aw);
      return {a: A + da, h: H + pp - aw * da, used: pp};
    };
    let pick = null;
    for(let pp = p; pp >= (kind === 'major' || kind === 'limit' ? 1 : 0) && !pick; pp--){
      const tries = [split(pp), split(pp, 'health'), split(pp, 'attack')];
      pick = tries.find(t=> room(t) >= Math.min(room0, room({a: A, h: H})) - 1e-9) || null;
    }
    if(!pick) pick = split(kind === 'major' || kind === 'limit' ? 1 : 0); // a major always gives something (the room was already short)
    const used = pick.used;
    bank = r2(bank - used); P += used; A = pick.a; H = pick.h;
    rows[L] = {attack: A0 == null ? A0 : A, health: H0 == null ? H0 : H, points: used, kind, N};
  }
  return {base, from, top, m, rows};
}
// Equipment durability (2026-10-24, package EQ2; owner EQ-1 "Durability with acid / Corrode wear"): a piece breaks after its durability in
// hits on its wearer (bramblewood-engine.js EQ2_DEF holds the same table; tests/eq2-2026-10-24.js checks they agree). The 4-round rule
// (docs/workflows/balance.md): a front-row wearer is hit about once a round, so a piece of durability D lasts about D rounds of a 4-round
// life: its stats and grant count min(D, 4) / 4 of what they did (equipLifeMult). Durability 3 (Common, Uncommon): x0.75; 4+: x1.
const EQUIP_DUR_BY_RARITY = {common: 3, uncommon: 3, quest: 3, rare: 4, veryrare: 4, superrare: 4, epic: 5, heroic: 5, unique: 5, questunique: 5, legendary: 5, mythic: 5}, EQUIP_DUR_DEFAULT = 5, EQUIP_LIFE_ROUNDS = 4;
function equipDurOf(d){ const v = d && d.equip && d.equip.durability; if(v != null && +v > 0) return Math.max(1, Math.round(+v)); return EQUIP_DUR_BY_RARITY[(d && d.rarity) || 'common'] || EQUIP_DUR_DEFAULT; }
// Hardy N (ENG10, 2026-10-26, PROP1-1, the proposal's price in docs/proposals-2026-10-26.md section 1): a piece's lives (equip.hardy or
// equip.lives, default 1; the engine's eqLivesMaxOf). Each life refills the durability, so the wearer's share is min(D x L, 4) / 4, and a piece
// that outlives its wearer serves the next unit in that slot after its Equip Time: 3 of its 4 rounds x 0.8 (the slot is refilled) x 0.6 (the
// fight goes on) = +0.35 of the piece's points for a 2nd life, +0.2 for a 3rd. equipLifeMult = min(D x L, 4) / 4 + 0.35 [L >= 2] + 0.2 [L >= 3].
function equipLivesOf(d){ const e = (d && d.equip) || {}, v = e.hardy != null ? e.hardy : e.lives; return v != null && +v > 0 ? Math.max(1, Math.min(9, Math.round(+v))) : 1; }
function equipLifeMult(d){ const L = equipLivesOf(d); return r2(Math.min(equipDurOf(d) * L, EQUIP_LIFE_ROUNDS) / EQUIP_LIFE_ROUNDS + (L >= 2 ? 0.35 : 0) + (L >= 3 ? 0.2 : 0)); }
// Threshold skills (ENG10, 2026-10-26, PROP1-4; the engine's THR block): Name N – {…}, plain {+2/+2}. Priced like the other state skills, the
// braces' points (2A + H + their skills' S) x the share of a unit's rounds the count is N or more. The shares are measured
// (tools/prop1_threshold_uptime_2026_10_26.js, docs/balance/prop1-threshold-uptime-2026-10-26.json: 1,500 CPU fights of random live decks,
// THR_UPTIME[k][N] = the share with N or more), + THR_PUSH where your own deck can push the count (sacrifices, tokens, cheap units: Requiem,
// Dirge, Muster, Throng +0.1; Carnage and Beset only the enemy decides: +0). N past the table's end: the last share, and 0 past 12.
const THR_UPTIME = {
  requiem: [1, 0.811, 0.71, 0.613, 0.521, 0.433, 0.357, 0.289, 0.228, 0.185, 0.143, 0.107, 0.08],
  dirge:   [1, 0.692, 0.508, 0.363, 0.25, 0.165, 0.1, 0.061, 0.032, 0.018, 0.009, 0.005, 0.002],
  carnage: [1, 0.735, 0.57, 0.408, 0.29, 0.187, 0.121, 0.069, 0.038, 0.02, 0.01, 0.005, 0.003],
  muster:  [1, 1, 0.978, 0.914, 0.786, 0.596, 0.388, 0.201, 0.082, 0.026, 0.009, 0.002, 0],
  beset:   [1, 0.999, 0.973, 0.889, 0.72, 0.505, 0.304, 0.147, 0.059, 0.02, 0.006, 0.002, 0.001],
  throng:  [1, 1, 1, 0.981, 0.977, 0.939, 0.911, 0.845, 0.765, 0.661, 0.54, 0.401, 0.263]};
const THR_PUSH = {requiem: 0.1, dirge: 0.1, carnage: 0, muster: 0.1, beset: 0, throng: 0.1};
const THR_DEFAULT_N = {requiem: 5, dirge: 3, carnage: 3, muster: 6, beset: 6, throng: 10}, THR_DEFAULT_GRANT = {attack: 2, health: 2};
function thrN(k, v){ return (v === true || v == null || !(+v > 0)) ? THR_DEFAULT_N[k] : Math.round(+v); }
function thrUptime(k, N){ const t = THR_UPTIME[k]; if(!t) return 0; const n = Math.max(0, Math.round(N)); const u = n < t.length ? t[n] : 0; return r2(Math.min(1, u + (u > 0 ? THR_PUSH[k] || 0 : 0))); }
// S of a threshold key k in effects (the flag carries the price; its Grant key costs nothing beside it): {S, inner, mult} or null
function thrS(k, v, effects, costOf){ const e = effects || {}; let key = k;
  if(/Grant$/.test(k) && THR_UPTIME[k.slice(0, -5)]){ key = k.slice(0, -5); if(e[key]) return {S: 0, inner: 0, mult: 0}; } else if(!THR_UPTIME[k]) return null;
  const g = obj(e[key + 'Grant']) && Object.keys(e[key + 'Grant']).length ? e[key + 'Grant'] : THR_DEFAULT_GRANT, rest = Object.assign({}, g), A = +rest.attack || 0, H = (+rest.health || 0) + shieldHealthOf(rest) /* FIN2-c */; delete rest.attack; delete rest.health;
  const inner = awNow() * A + H + (Object.keys(rest).length && costOf ? (+costOf(rest) || 0) : 0), m = thrUptime(key, thrN(key, e[key])); // BUDGET2: 3A + H
  return {S: r2(inner * m), inner: r2(inner), mult: m}; }
// ---- ENG12 (2026-10-28): time of day and Shock by the 4-round rule (docs/workflows/balance.md "Pricing by logic") -----------------------
// Nocturnal / Diurnal / Crepuscular N (+N Attack, +M Health with the Hp key) (owner L11, on the editor's Nocturnal +4/+0 at 2.5: "how can
// this be 2.5?"; they were a fixed 1 whatever N was): the bonus is worth what it is worth held all the time (2A + H, the 4-round rule's
// currency) times the share of a unit's rounds it is on. The shares are measured (tools/eng12_uptime_2026_10_28.js,
// docs/balance/eng12-uptime-2026-10-28.json: every conquest fight's rules x 4 CPU fights of random live decks, side 1's unit-rounds):
//   night  = night + Twilight rounds (ENG11: a dark fight is night, so the caves count),
//   day    = day + Twilight rounds, a day under clouds or ash at half (Diurnal's bonus halves there),
//   crepuscular = day + night + 2 x Twilight with a Crepuscular card in the deck (its D/N/D/N/T cycle; Twilight brings both parts).
// Their braces (Nocturnal – {…}, Diurnal – {…}, Crepuscular – {…}) take the same shares (CONTEXT_MULT_BY, was 0.4); Crepuscular's two sets
// share one multiplier, the mean of its day and night parts.
const ZEIT_UPTIME = {nocturnal: 0.53 /* 0.528 + 0.004 */, diurnal: 0.38 /* 0.378 + 0.004 - 0.005 / 2 */, crepuscular: 0.99 /* 0.313 + 0.506 + 2 x 0.085 */};
const ZEIT_GRANT_MULT = {nocturnalGrant: 0.53, diurnalGrant: 0.38, crepuscularGrant: 0.49 /* (0.313 + 0.085 + 0.506 + 0.085) / 2 */};
Object.assign(CONTEXT_MULT_BY, ZEIT_GRANT_MULT); // the braces' multipliers (contextS reads CONTEXT_MULT_BY)
// The dark-sight Nocturnal has had since ENG11 (it sees in the dark as Darksight does): Darksight's price x the share of unit-rounds in a
// dark fight (skill_costs.js adds it beside the bonus; a card with Darksight already pays nothing more).
const ZEIT_DARK_SHARE = 0.1 /* 0.105 */;
const ZEIT_KEYS = ['nocturnal', 'diurnal', 'crepuscular'];
// S of the time-of-day key k ('nocturnal', 'nocturnalHp' ...) on a card: {S, inner, mult} or null when k is not one. The flag carries the
// price of both parts (+A from the flag, true = +1; +H from the Hp key); the Hp key costs nothing beside its flag; braces beside the flag
// mean the plain bonus is not there (the engine's phaseStatsOf), so then 0.
function zeitS(k, effects){ const e = effects || {}, base = /Hp$/.test(k) ? k.slice(0, -2) : k; if(!ZEIT_KEYS.includes(base)) return null;
  if(k !== base && e[base]) return {S: 0, inner: 0, mult: 0};
  if(e[base + 'Grant'] && typeof e[base + 'Grant'] === 'object') return {S: 0, inner: 0, mult: 0};
  const v = e[base], A = v === true ? 1 : Math.max(0, Number(v) || 0), Hh = Math.max(0, Number(e[base + 'Hp']) || 0), inner = awNow() * A + Hh /* BUDGET2: 3A + H */, m = ZEIT_UPTIME[base];
  return {S: r2(inner * m), inner: r2(inner), mult: m}; }
// Shock (owner L5: "Shock is too strong."): a Shocked unit takes 1.5x from every hit, every source, for the rest of the round it is struck
// in and N more rounds (the engine's _shockedJustSet). By the 4-round rule, for On hit: Shock (chance p %, N rounds) on a unit with Attack A:
//   it lands about 3 of 4 swings (SHOCK.land), so each round of its 4-round life its target is Shocked with q = 0.75 p (a round's hit shocks
//   the next N rounds; a new Shock refreshes, it does not add): Shocked rounds = Σ over rounds 2-4 of 1 - (1 - q)^min(N, rounds before);
//   a Shocked round adds half of what the target takes that round: the unit's own next swing (A) and the rest (SHOCK.other, the mean hit
//   damage a unit takes a round, measured: docs/balance/eng12-uptime-2026-10-28.json dmgPerUnitRound), and the round a Shock lands adds
//   half of the rest of that round (SHOCK.rest);
//   a point of damage at units is 0.67 of a point (+1 Attack's 2 points buy about 3 damage, balance.md).
// S = 0.67 x 0.5 x [Shocked rounds x (A + other) + 4 x q x 0.5 x other]. Shock Bolt N (a Speed 1 shot each round, before the swings, then
// Shocked for a round): Arrow N's price for the shot (skill_costs.js) + its Shock: 4 rounds x 0.9 landed x 0.8 of the round still to come x
// 0.5 x (other + half its own swing, which meets that unit about half the time) x 0.67.
const SHOCK = {mult: 0.5, land: 0.75, life: 4, other: 1.05, perDmg: 0.67, rest: 0.5, boltLand: 0.9, boltRest: 0.8, boltOwn: 0.5};
function shockParams(v){ const o = v && typeof v === 'object'; const p = Math.max(0, Math.min(100, o ? Number(v.chance) || 0 : Number(v) || 0)) / 100;
  const d = Math.max(1, o ? Number(v.duration) || 1 : 1); return {p, d}; }
function shockRounds(q, d, life){ let t = 0; for(let r = 2; r <= life; r++) t += 1 - Math.pow(1 - q, Math.min(d, r - 1)); return t; }
function shockS(v, attack){ const {p, d} = shockParams(v), A = Math.max(0, Number(attack) || 0), q = SHOCK.land * p;
  const extra = shockRounds(q, d, SHOCK.life) * (A + SHOCK.other) + SHOCK.life * q * SHOCK.rest * SHOCK.other;
  return r2(SHOCK.perDmg * SHOCK.mult * extra); }
function shockBoltShockS(attack){ const A = Math.max(0, Number(attack) || 0);
  return r2(SHOCK.perDmg * SHOCK.mult * SHOCK.life * SHOCK.boltLand * SHOCK.boltRest * (SHOCK.other + SHOCK.boltOwn * A)); }
return {ZEIT_UPTIME, ZEIT_GRANT_MULT, ZEIT_DARK_SHARE, ZEIT_KEYS, zeitS, SHOCK, shockParams, shockRounds, shockS, shockBoltShockS /* ENG12 (2026-10-28) */, EQUIP_DUR_BY_RARITY, EQUIP_DUR_DEFAULT, EQUIP_LIFE_ROUNDS, equipDurOf, equipLifeMult /* EQ2 (2026-10-24) */, equipLivesOf, THR_UPTIME, THR_PUSH, THR_DEFAULT_N, thrN, thrUptime, thrS /* ENG10 (2026-10-26) */, BLOOM_ODDS, BLOOM_LIVE, BLOOM_LUMBER, bloomOdds, bloomBodyMult /* BL (2026-10-23) */, BLOOM_CHAIN_Q, bloomChainOdds, EN5_UPTIME, CANOPY_UPTIME, canopyMultOf /* EN5 (2026-10-24) */, CANOPY_SHARE, SLOW_S_MULT, slowSMultOf /* TUT2 (2026-10-30) */, TRANSFORM_GAIN, transformGainOf, KINGLY_DEFAULT /* TR (2026-10-21) */, CONTEXT_MULT, CONTEXT_MULT_BY /* EN (2026-10-23) */, EN6_UPTIME, EN6_HIBERNATE_UPTIME, EN6_BRAMBLE_SHOTS, EN6_BRAMBLE_ACTIONS, EN6_BRAMBLE_MULT /* EN6 (2026-10-24) */, EN7_EXTRA_HIT, EN7_EXTRA_HIT_KEYS, EN7_TIP_SHOTS, EN7_TIP_MULT, EN7_TIP_ACTIONS /* EN7 (2026-10-24) */, CONTEXT, CONTEXT_FLAG, contextS, contextFlagCovered, rarityParts, rarityCompose, RARITY_FLAGS /* CX2 */, DEFAULTS, LADDER, AS, HALF_MISS, LIGHT, PARAMS, MAJOR, MINOR, LIMIT, SHARE, rankOf, DECK_RANK_CAPS /* DR */, deckRankCapOf, deckRankUsage, deckRankOver, deckRankBlock, ritualPts, baseOf, baseParts, nAt, nOf, nV3, nV4, formulaParts, missMultOf, missMultFor, cap2Limit /* BF11 */, MISS_MULT_BY /* BF10 */, CAP2_S_SCALE /* SPEED1 */, cap2SOf, fragileUseOf, capScores /* BF7 (2026-10-22) */, shieldHealthOf /* FIN2-c (2026-10-26) */, productScore, levelKind, forgeCurve, abilitiesOf, nMultOf, chainedMult, CHAINED_PER_ROUND /* ENG9 (2026-10-26) */, TWO_SKILL_FREE, twoSkillFree, skillCountOf /* TR (2026-10-21) */};
});
