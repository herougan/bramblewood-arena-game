// ============================================================================
// Bramblewood stat budget N and the Forge level curve (2026-10-19, package BF). DOM-free, one implementation for the game (inlined
// into the page: global `BramblewoodBudget`), the balance tools (tools/skill_costs.js, tools/card_balance.js ...) and the master
// hub (tools/hub/build_hub.py inlines it ahead of tools/skill_costs.js).
//
// Budget v4 (owner 2026-10-19 09:52: "L should scale. So this is my new formula. (Base-1 + L) * (1+L/20) e.g. (Base-1 + 5) * (1.25)."):
//   Base = 20 + Rarity + 6×Wait + 0.5×Wait² + 4×Lumber + 0.4×Lumber² + 1×Ritual points   (v3's N without its 2×Level term)
//   N(L) = (Base − 1 + L) × (1 + L/20)
//   v3 was N = Base + 2L, so at Level 1 v4 is 1.05×Base against Base + 2: 0.05×Base − 2 apart (−0.95 at Base 21, 0 at Base 40,
//   +1 at Base 60); at Level 0 it is Base − 1 (v3: Base). The rules are v3's: 2A+H+S < N and A·H+S < (N/3)² (×1.5 per half-miss skill).
//
// The Forge curve (owner 09:52: "change majors to 4, 7, 10, minor to 2. Then divvy out strength updates at all levels. If there is no
// space for minor, then all are minor OR potentially still 0, then majors expect SOME improvement."):
//   every level L above the card's start level banks its budget gain ΔN = N(L) − N(L−1) (÷ the half-miss multiplier, which scales the
//   score), in 2A+H points (1 Health = 1, 1 Attack = 2). A level spends whole points out of the bank:
//     major (4, 7, 10; past 10 every third level, 13, 16 …) and the limit break (11): everything banked, at least 1;
//     minor (2): half the bank;  any other level: a third of the bank (often 0 on small cards).
//   So the stats never get ahead of N(L) (2A+H rises by at most N(L) − N(start)), majors take the big chunks, and the gains are the same
//   for the same card everywhere. Points go to Attack where that keeps the card's A:H shape (Attack ≈ A0 × (2A0+H0+P)/(2A0+H0)), never
//   taking a point of Health back, the rest to Health; a 0-Attack wall only grows Health. A step that would shrink the card's A·H room,
//   (N(L)/3)² − m·A·H, below what it had at its start level goes to the cheaper stat, or spends less (a major still spends 1).
// ============================================================================
(function(root, factory){ if(typeof module === 'object' && module.exports) module.exports = factory(); else root.BramblewoodBudget = factory(); })(typeof self !== 'undefined' ? self : this, function(){
'use strict';
// canonical/skill-costs.json "budget" holds the same numbers (tests/forge-curve-2026-10-19.js checks they agree)
const DEFAULTS = {base:20, perRarity:1, perWait:6, perWait2:0.5, perLumber:4, perLumber2:0.4, perRitual:1, levelDiv:20, missMult:1.5};
const LADDER = ['starter','common','uncommon','rare','veryrare','superrare','epic','heroic','unique','legendary','mythic','ancient','divine','void','daemonic'];
const AS = {quest:'uncommon', questunique:'unique', special:'rare', devlegendary:'legendary', devancient:'ancient', eventlegendary:'legendary', eventrare:'rare'};
const HALF_MISS = ['evasive', 'swift', 'flying', 'shadow', 'blind'];
const MAJOR = [4, 7, 10], MINOR = [2], LIMIT = 11;
const SHARE = {major: 1, limit: 1, minor: 0.5, other: 1 / 3};
const r2 = v=> Math.round(v * 100) / 100;
const cfgOf = cfg=> Object.assign({}, DEFAULTS, cfg || {});
const num = (cfg, k)=>{ const v = cfg && cfg[k]; return v == null || v === '' || !Number.isFinite(Number(v)) ? DEFAULTS[k] : Number(v); };
function rankOf(rarity){ const k = rarity || 'common'; return Math.max(0, LADDER.indexOf(AS[k] || k)); }
function ritualPts(effects){ const r = effects && effects.ritual; return r && typeof r === 'object' ? Object.values(r).reduce((a, b)=> a + (+b || 0), 0) : 0; }
// The level-independent part of N for a card ({rarity, wait, cost, effects}).
function baseOf(d, cfg){ d = d || {}; const W = +d.wait || 0, C = +d.cost || 0;
  return r2(num(cfg, 'base') + num(cfg, 'perRarity') * rankOf(d.rarity) + num(cfg, 'perWait') * W + num(cfg, 'perWait2') * W * W + num(cfg, 'perLumber') * C + num(cfg, 'perLumber2') * C * C + num(cfg, 'perRitual') * ritualPts(d.effects)); }
// N at level L for a Base: (Base − 1 + L) × (1 + L/20).
function nAt(base, L, cfg){ L = Math.max(0, Number(L) || 0); return r2((base - 1 + L) * (1 + L / num(cfg, 'levelDiv'))); }
function nOf(d, L, cfg){ return nAt(baseOf(d, cfg), L, cfg); }
// v3's N, for comparisons only (docs, the BF report): Base + 2×Level.
function nV3(base, L){ return r2(base + 2 * Math.max(0, Number(L) || 0)); }
function missMultOf(effects, cfg){ const e = effects || {}, m = num(cfg, 'missMult'); let x = 1; ((cfg && cfg.halfMiss) || HALF_MISS).forEach(k=>{ if(e[k]) x *= m; }); return x; }
function levelKind(L){ if(L === LIMIT) return 'limit'; if(MAJOR.includes(L) || (L > 10 && L % 3 === 1)) return 'major'; if(MINOR.includes(L)) return 'minor'; return 'other'; }

// The curve for a card d ({attack, health, rarity, wait, cost, effects}) from its start level `from` (0 or 1) to `top` (11 for the
// usual Lv 10 cards: the limit break). Returns {base, from, top, m, rows: {L: {attack, health, points, kind, N}}}, rows[from] the
// printed stats. Stats that are null (a spell) stay null.
function forgeCurve(d, from, top, cfg){
  d = d || {}; from = Math.max(0, from | 0); top = Math.max(from, top | 0);
  const base = baseOf(d, cfg), m = missMultOf(d.effects, cfg), A0 = d.attack, H0 = d.health;
  const rows = {}; rows[from] = {attack: A0, health: H0, points: 0, kind: 'base', N: nAt(base, from, cfg)};
  if(A0 == null && H0 == null){ for(let L = from + 1; L <= top; L++) rows[L] = {attack: A0, health: H0, points: 0, kind: levelKind(L), N: nAt(base, L, cfg)}; return {base, from, top, m, rows}; }
  const a0 = +A0 || 0, h0 = +H0 || 0, w0 = Math.max(1, 2 * a0 + h0), room0 = Math.pow(nAt(base, from, cfg) / 3, 2) - m * a0 * h0;
  let A = a0, H = h0, P = 0, bank = 0;
  for(let L = from + 1; L <= top; L++){
    const N = nAt(base, L, cfg), kind = levelKind(L), room = h=> (N / 3) * (N / 3) - m * h.a * h.h;
    bank = r2(bank + (N - nAt(base, L - 1, cfg)) / m);
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
return {DEFAULTS, LADDER, AS, HALF_MISS, MAJOR, MINOR, LIMIT, SHARE, rankOf, ritualPts, baseOf, nAt, nOf, nV3, missMultOf, levelKind, forgeCurve};
});
