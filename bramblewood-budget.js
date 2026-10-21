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
//   The rules: 2A+H+S ≤ N and A·H+S ≤ (N/3)² (inclusive since 16:22, "it's fine to be = to budget"), both ×1.5 per half-miss skill (Evasive, Swift, Flying, Shadow, Blind: about half
//   the attacks at the card miss, so its stats count half again).
//
// The Forge curve (owner 09:52: "change majors to 4, 7, 10, minor to 2. Then divvy out strength updates at all levels. If there is no
// space for minor, then all are minor OR potentially still 0, then majors expect SOME improvement."):
//   every level L above the card's start level banks its budget gain ΔN = N(L) − N(L−1) (÷ the half-miss multiplier, which scales the
//   score), in 2A+H points (1 Health = 1, 1 Attack = 2). A level spends whole points out of the bank:
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
const DEFAULTS = {base:20, perRarity:1, perWait:6, perWait2:0.5, perLumber:4, perLumber2:0.4, perRitual:1, perMap:0.2, levelLinDiv:10, levelDiv:30, zeroPenalty:1, missMult:1.5, scale:0.5, plainBonus:1.05, lightBonus:1.02, fragileMult:0.75};
// N multipliers by what a card can do (2026-10-21, BF5; owner): plainBonus (N x 1.05) for a card with no abilities at all; lightBonus
// (x 1.02) for a card whose only abilities are the light ones (LIGHT: Flying, Tide, and the time-of-day ones, Diurnal / Nocturnal /
// Crepuscular, Sunshy / Nightblind); fragileMult (x 0.75) for Fragile ("a negative value"). An ability is an effects key that is not a
// parameter of another skill (PARAMS: swarmN, espritHp, ...), and each trigger. nMultOf(effects) is their product, on N at every level.
// scale (2026-10-19, BF5; owner 21:36: "I think numbers are way too big. Can we HALF everything?" ... "Straight up, the total N value"):
// the whole N (Base, the Level terms, the Map term) times this, so N_BF5(L) = 0.5 × N_v5(L); the A·H rule is (N/3)² of that N. Skill costs stay. // v5 (2026-10-19 13:52); levelLinDiv 10 since 15:48 ("let's try L/10"; L/5 before, from the 13:54 check)
const LADDER = ['starter','common','uncommon','rare','veryrare','superrare','epic','heroic','unique','legendary','mythic','ancient','divine','void','daemonic'];
const AS = {quest:'uncommon', questunique:'unique', special:'rare', devlegendary:'legendary', devancient:'ancient', eventlegendary:'legendary', eventrare:'rare'};
const HALF_MISS = ['evasive', 'swift', 'flying', 'shadow', 'blind'];
const LIGHT = ['flying', 'tide', 'diurnal', 'nocturnal', 'crepuscular', 'sunshy', 'nightblind'];
const PARAMS = ['crepuscularHp', 'defianceN', 'diurnalGrant', 'diurnalHp', 'espritHp', 'fullMoonGrant', 'loyalGrant', 'nocturnalGrant', 'nocturnalHp', 'swarmN', 'swimmerGrant', 'tideGrant', 'weakness', 'arrowCount', 'hunterVs', 'archerStyle' /* 2026-10-21 (BF5 merge of BX): Archer's look, not an ability */];
// a card's abilities: its effects keys with a value (not a parameter of another skill), each trigger as 'trigger:<on>'
function abilitiesOf(effects, params){ const e = effects || {}, P = params || PARAMS, out = [];
  Object.keys(e).forEach(k=>{ const v = e[k]; if(v == null || v === false || v === 0 || v === '' || (Array.isArray(v) && !v.length) || P.includes(k)) return;
    if(k === 'triggers'){ (Array.isArray(v) ? v : []).forEach(t=> out.push('trigger:' + ((t && t.on) || '?'))); return; } out.push(k); });
  return out; }
function nMultOf(effects, cfg, params){ const a = abilitiesOf(effects, params || (cfg && cfg.params)); let k = 1;
  if(!a.length) k *= num(cfg, 'plainBonus'); else if(a.every(x=> LIGHT.includes(x))) k *= num(cfg, 'lightBonus');
  if(a.includes('fragile')) k *= num(cfg, 'fragileMult'); return k; }
const MAJOR = [4, 7, 10], MINOR = [2], LIMIT = 11;
const SHARE = {major: 1, limit: 1, minor: 1, other: 1 / 3};
const r2 = v=> Math.round(v * 100) / 100;
const cfgOf = cfg=> Object.assign({}, DEFAULTS, cfg || {});
const num = (cfg, k)=>{ const v = cfg && cfg[k]; return v == null || v === '' || !Number.isFinite(Number(v)) ? DEFAULTS[k] : Number(v); };
function rankOf(rarity){ const k = rarity || 'common'; return Math.max(0, LADDER.indexOf(AS[k] || k)); }
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
  return {n: `N = ${pre}(Base + Level/${g('levelLinDiv')}) × (1 + Level/${g('levelDiv')})`, zero: `Level 0: ${pre}(Base − ${g('zeroPenalty')})`, scale: k, plain: g('plainBonus'), light: g('lightBonus'), fragile: g('fragileMult'),
    base: `Base = ${g('base')} + ${t('perRarity', 'Rarity')} + ${g('perWait')}×Wait + ${g('perWait2')}×Wait² + ${g('perLumber')}×Lumber + ${g('perLumber2')}×Lumber² + ${t('perRitual', 'Ritual')} + ${g('perMap')}×Map`}; }
function nOf(d, L, cfg){ return r2(nAt(baseOf(d, cfg), L, cfg) * nMultOf(d && d.effects, cfg)); } // BF5: x the card's N multiplier
// v3's N, for comparisons only (docs, the BF report): Base + 2×Level.
function nV3(base, L){ return r2(base + 2 * Math.max(0, Number(L) || 0)); }
function missMultOf(effects, cfg){ const e = effects || {}, m = num(cfg, 'missMult'); let x = 1; ((cfg && cfg.halfMiss) || HALF_MISS).forEach(k=>{ if(e[k]) x *= m; }); return x; }
function levelKind(L){ if(L === LIMIT) return 'limit'; if(MAJOR.includes(L) || (L > 10 && L % 3 === 1)) return 'major'; if(MINOR.includes(L)) return 'minor'; return 'other'; }

// The curve for a card d ({attack, health, rarity, wait, cost, effects}) from its start level `from` (0 or 1) to `top` (11 for the
// usual Lv 10 cards: the limit break). Returns {base, from, top, m, rows: {L: {attack, health, points, kind, N}}}, rows[from] the
// printed stats. Stats that are null (a spell) stay null.
function forgeCurve(d, from, top, cfg){
  d = d || {}; from = Math.max(0, from | 0); top = Math.max(from, top | 0);
  const base = baseOf(d, cfg), m = missMultOf(d.effects, cfg), A0 = d.attack, H0 = d.health, km = nMultOf(d.effects, cfg), NL = L=> r2(nAt(base, L, cfg) * km); // BF5: x the card's N multiplier
  const rows = {}; rows[from] = {attack: A0, health: H0, points: 0, kind: 'base', N: NL(from)};
  if(A0 == null && H0 == null){ for(let L = from + 1; L <= top; L++) rows[L] = {attack: A0, health: H0, points: 0, kind: levelKind(L), N: NL(L)}; return {base, from, top, m, rows}; }
  const a0 = +A0 || 0, h0 = +H0 || 0, w0 = Math.max(1, 2 * a0 + h0), room0 = Math.pow(NL(from) / 3, 2) - m * a0 * h0;
  let A = a0, H = h0, P = 0, bank = 0;
  for(let L = from + 1; L <= top; L++){
    const N = NL(L), kind = levelKind(L), room = h=> (N / 3) * (N / 3) - m * h.a * h.h;
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
return {DEFAULTS, LADDER, AS, HALF_MISS, LIGHT, PARAMS, MAJOR, MINOR, LIMIT, SHARE, rankOf, ritualPts, baseOf, baseParts, nAt, nOf, nV3, nV4, formulaParts, missMultOf, levelKind, forgeCurve, abilitiesOf, nMultOf};
});
