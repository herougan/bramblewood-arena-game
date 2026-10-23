// ============================================================================
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
const DEFAULTS = {base:10, perRarity:1, perWait:3, perWait2:0.25, perLumber:2, perLumber2:0.2, perRitual:0.5, perMap:0.1, levelLinDiv:15, levelDiv:30, zeroPenalty:1, missMult:1.5, cap2Mult:2 /* BF11 (2026-10-23) */, scale:1, plainBonus:1.05, lightBonus:1.02, fragileUse:0.7};
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
const PARAMS = ['crepuscularHp', 'crepuscularGrant', 'rainrunnerGrant' /* CX2 */, 'defianceN', 'diurnalGrant', 'diurnalHp', 'espritHp', 'fullMoonGrant', 'loyalGrant', 'nocturnalGrant', 'nocturnalHp', 'swarmN', 'swimmerGrant', 'tideGrant', 'weakness', 'arrowCount', 'hunterVs', 'archerStyle' /* 2026-10-21 (BF5 merge of BX): Archer's look, not an ability */, 'stemGrant' /* 2026-10-21 (EV): a Stem's braces */, 'kinglyGrant' /* 2026-10-21 (TR): King's braces */, 'liegeGrant', 'rageGrant' /* 2026-10-23 (EN): Liege's and Rage's braces */];
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
  bloomWhen: v=> obj(v && v.grant) ? [Object.assign({attack: +(v.atk || 0), health: +(v.hp || 0)}, v.grant)] : null // only Bloom's braces form; the plain +2/+2 keeps its measured worth
};
// Context skills with their own multiplier (2026-10-23, package EN). Liege – {…}: 0.3 (owner TR-4: "Liege is worth 0.3x {...}").
// Rage – {…}: 0.4, by logic: Rage is on for the lower half of the unit's Health (0.5), and a unit can
// fall from above half in one blow (x 0.8). Rage itself keeps its own price beside it (rage is not in CONTEXT_FLAG: the braces add to it).
const CONTEXT_MULT_BY = {liegeGrant: 0.3, rageGrant: 0.4};
const CONTEXT_FLAG = {tide: 'tideGrant', diurnal: 'diurnalGrant', nocturnal: 'nocturnalGrant', crepuscular: 'crepuscularGrant', fullMoon: 'fullMoonGrant', stem: 'stemGrant', chrysalis: 'stemGrant' /* EV (2026-10-21): the braces carry a Stem's or Chrysalis's cost */, king: 'kinglyGrant' /* TR (2026-10-21) */, liege: 'liegeGrant' /* EN (2026-10-23): a plain Liege is Liege – {Assault 2}, priced in skill-costs.json */};
// S of a context skill: {S, inner} (null when k is not one, or its braces are the plain form). costOf(effects) is the caller's S of a set of
// skills (no stats in it); the stats in the braces are added here as 2A + H.
function contextS(k, v, costOf, mult){ const f = CONTEXT[k]; if(!f) return null; const sets = f(v); if(!sets) return null; let inner = 0;
  sets.forEach(g=>{ if(!g) return; const rest = Object.assign({}, g), A = +rest.attack || 0, H = +rest.health || 0; delete rest.attack; delete rest.health;
    inner += 2 * A + H + (Object.keys(rest).length ? (+costOf(rest) || 0) : 0); });
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
function nMultOf(effects, cfg, params){ const a = abilitiesOf(effects, params || (cfg && cfg.params)); let k = 1;
  if(!a.length) k *= num(cfg, 'plainBonus'); else if(a.every(x=> LIGHT.includes(x))) k *= num(cfg, 'lightBonus');
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
  return {cap1: '(2A + H)×m + S ≤ N', cap2: `A·H×m + S·|S| ≤ ${g('cap2Mult')}×(N/3)²` /* BF6 (owner 15:15); BF7 m on the stats only */, n: `N = ${pre}(Base + Level/${g('levelLinDiv')}) × (1 + Level/${g('levelDiv')})`, zero: `Level 0: ${pre}(Base − ${g('zeroPenalty')})`, scale: k, plain: g('plainBonus'), light: g('lightBonus'), fragile: g('fragileUse'),
    miss: `m = ${g('missMult')} per half-miss skill (Evasive, Swift, Shadow; Flying ${MISS_MULT_BY.flying}), on the stats only, not on S` /* BF7; BF10 Flying */,
    fragileText: `Fragile, Purblind: both left sides × ${g('fragileUse')} (more stats for a card that takes double damage or swings blind)` /* BF7 */,
    context: `Context skills ({…}): ${CONTEXT_MULT} × S of the skills in their braces` /* CX2 */,
    base: `Base = ${g('base')} + ${t('perRarity', 'Rarity')} + ${g('perWait')}×Wait + ${g('perWait2')}×Wait² + ${g('perLumber')}×Lumber + ${g('perLumber2')}×Lumber² + ${t('perRitual', 'Ritual')} + ${g('perMap')}×Map`}; }
function nOf(d, L, cfg){ return r2(nAt(baseOf(d, cfg), L, cfg) * nMultOf(d && d.effects, cfg)); } // BF5: x the card's N multiplier
// v3's N, for comparisons only (docs, the BF report): Base + 2×Level.
function nV3(base, L){ return r2(base + 2 * Math.max(0, Number(L) || 0)); }
// Cap 2's score before the half-miss multiplier (BF6, owner 15:15): A·H + S·|S|.
function productScore(A, H, S){ A = +A || 0; H = +H || 0; S = +S || 0; return A * H + S * Math.abs(S); }
// Per-skill half-miss multipliers (2026-10-23, package BF10; owner 01:03: "I think Flying may be overcosted."): the robust skill test
// (docs/balance/skill-test-robust-mono-2000-2026-10-22.md) measured Flying's worth at 5.88 stat points against 6.89 paid at x1.5, so
// Flying is x1.4. A skill not listed uses missMult (1.5). cfg.missMultBy overrides the table.
const MISS_MULT_BY = {flying: 1.39, evasive: 1.37, shadow: 1.1}; // owner 01:57: "I estimate Flying is worth x1.39"; 2026-10-23 (BF12, call BF10-1): Evasive and Shadow at their measured worth
// Cap 2's limit (2026-10-23, package BF11; owner 11:11: "Im also starting to think N/3 ^2 is too restrictive. Maybe 2*(N/3)^2 since we
// have A*H + S*|S|."): cap2Mult × (N/3)², cap2Mult 2 (was 1). Every cap-2 check reads this one helper.
function cap2Limit(N, cfg){ const k = cfg && cfg.cap2Mult != null ? +cfg.cap2Mult : DEFAULTS.cap2Mult; return (N / 3) * (N / 3) * k; }
function missMultFor(k, cfg){ const t = (cfg && cfg.missMultBy) || MISS_MULT_BY; return t[k] != null ? +t[k] : num(cfg, 'missMult'); }
function missMultOf(effects, cfg){ const e = effects || {}; let x = 1; ((cfg && cfg.halfMiss) || HALF_MISS).forEach(k=>{ if(e[k]) x *= missMultFor(k, cfg); }); return x; }
// BF7 (2026-10-22, owner: "things that must be less than N have a x0.7 multiplier!"): f, fragileUse (0.7) for a Fragile card, else 1.
// BF8 (2026-10-22, owner: "Purblind will be 0.7x"): a Purblind card (blind itself) takes the same f; Fragile and Purblind together multiply.
function fragileUseOf(effects, cfg){ const e = effects || {}, f = num(cfg, 'fragileUse'); let x = 1; if(e.fragile) x *= f; if(e.purblind) x *= f; return x; }
// The two caps' left sides (BF7, 2026-10-22), the one copy every check calls (tools/skill_costs.js budget, the game's sbCheck, the hub):
// {m, f, x1: f × ((2A + H) × m + S), x2: f × (A·H × m + S·|S|)}; cap 1 is x1 ≤ N, cap 2 x2 ≤ (N/3)². A is the Attack that counts (an
// Archer's is 0, the caller's rule). opts.m / opts.f stand in for the card's own (a caller that knows only the multiplier).
function capScores(A, H, S, effects, cfg, opts){ A = +A || 0; H = +H || 0; S = +S || 0;
  const m = opts && opts.m != null ? +opts.m : missMultOf(effects, cfg), f = opts && opts.f != null ? +opts.f : fragileUseOf(effects, cfg);
  return {m, f, x1: r2(f * ((2 * A + H) * m + S)), x2: r2(f * (A * H * m + S * Math.abs(S)))}; }
function levelKind(L){ if(L === LIMIT) return 'limit'; if(MAJOR.includes(L) || (L > 10 && L % 3 === 1)) return 'major'; if(MINOR.includes(L)) return 'minor'; return 'other'; }

// The curve for a card d ({attack, health, rarity, wait, cost, effects}) from its start level `from` (0 or 1) to `top` (11 for the
// usual Lv 10 cards: the limit break). Returns {base, from, top, m, rows: {L: {attack, health, points, kind, N}}}, rows[from] the
// printed stats. Stats that are null (a spell) stay null.
function forgeCurve(d, from, top, cfg){
  d = d || {}; from = Math.max(0, from | 0); top = Math.max(from, top | 0);
  const base = baseOf(d, cfg), m = missMultOf(d.effects, cfg) * fragileUseOf(d.effects, cfg) /* BF7: m × f, see the top */, A0 = d.attack, H0 = d.health, km = nMultOf(d.effects, cfg), NL = L=> r2(nAt(base, L, cfg) * km); // BF5: x the card's N multiplier
  const rows = {}; rows[from] = {attack: A0, health: H0, points: 0, kind: 'base', N: NL(from)};
  if(A0 == null && H0 == null){ for(let L = from + 1; L <= top; L++) rows[L] = {attack: A0, health: H0, points: 0, kind: levelKind(L), N: NL(L)}; return {base, from, top, m, rows}; }
  const a0 = +A0 || 0, h0 = +H0 || 0, w0 = Math.max(1, 2 * a0 + h0), room0 = Math.pow(NL(from) / 3, 2) - m * a0 * h0;
  let A = a0, H = h0, P = 0, bank = 0;
  for(let L = from + 1; L <= top; L++){
    const N = NL(L), kind = levelKind(L), room = h=> cap2Limit(N, cfg) - m * h.a * h.h; /* BF11 */
    bank = r2(bank + (N - NL(L - 1)) / m);
    let p = Math.floor(bank * SHARE[kind] + 1e-9); if(kind === 'major' || kind === 'limit') p = Math.max(1, p);
    // split p points: Attack toward the shape (never more than p/2), the rest Health; Attack only when there is no Health stat
    const split = (pp, prefer)=>{
      if(H0 == null) { const da = Math.floor(pp / 2); return {a: A + da, h: H, used: 2 * da}; }
      if(A0 == null || a0 <= 0) return {a: A, h: H + pp, used: pp};
      let da = Math.max(0, Math.min(Math.floor(pp / 2), Math.round(a0 * (w0 + P + pp) / w0) - A));
      if(prefer === 'health') da = 0; else if(prefer === 'attack') da = Math.floor(pp / 2);
      return {a: A + da, h: H + pp - 2 * da, used: pp};
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
return {TRANSFORM_GAIN, transformGainOf, KINGLY_DEFAULT /* TR (2026-10-21) */, CONTEXT_MULT, CONTEXT_MULT_BY /* EN (2026-10-23) */, CONTEXT, CONTEXT_FLAG, contextS, contextFlagCovered, rarityParts, rarityCompose, RARITY_FLAGS /* CX2 */, DEFAULTS, LADDER, AS, HALF_MISS, LIGHT, PARAMS, MAJOR, MINOR, LIMIT, SHARE, rankOf, DECK_RANK_CAPS /* DR */, deckRankCapOf, deckRankUsage, deckRankOver, deckRankBlock, ritualPts, baseOf, baseParts, nAt, nOf, nV3, nV4, formulaParts, missMultOf, missMultFor, cap2Limit /* BF11 */, MISS_MULT_BY /* BF10 */, fragileUseOf, capScores /* BF7 (2026-10-22) */, productScore, levelKind, forgeCurve, abilitiesOf, nMultOf, TWO_SKILL_FREE, twoSkillFree, skillCountOf /* TR (2026-10-21) */};
});
