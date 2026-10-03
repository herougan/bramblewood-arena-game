// ============================================================================
// Bramblewood Raid model (2026-10-03, Raid P1 — see docs/raid-design.md). DOM-free: inlined into
// the page (global `BramblewoodRaid`) and require()'d by tests/raid.js.
//
// A raid definition has several PARTS (e.g. three tentacles and a core), each with stacked HP bars
// (bars × barHp, e.g. 8 × 80,000). Every attempt fights ONE part with today's engine (the trench
// board is P2) and converts in-fight castle damage into raid damage:
//   contribution = overwhelmed ? scoring.overwhelmCap : min(scoring.cap, dealt × scoring.perInFightHp)
// "Overwhelmed" = you destroyed that part's fight castle within the fight's turn limit. A part with `lockedUntil` can't be fought
// until those parts' global pools are empty (the core waits for the tentacles). The whole raid
// moves through STAGES as total HP falls (e.g. "Exposed" below 1%: enemy cards lose their abilities).
// Low-population safety net: `standIns.perDayPct` simulated raiders wear each open part down by that
// share of its total per day of the cycle, so a raid can still fall with few players (0 = off).
// ============================================================================
(function(root){
'use strict';
const DAY = 24*3600*1000;
const CYCLE_MS = 7*DAY;

function cycleOf(now){ return Math.floor(now / CYCLE_MS); }
function partTotal(p){ return Math.max(1, (p.bars|0) * (p.barHp|0)); }
// `part` (optional) may carry its own scoring overrides, e.g. the Core's stumps are worth more per HP.
function contributionFor(def, dealt, overwhelmed, part){
  const sc = Object.assign({}, def.scoring || {}, (part && part.scoring) || {});
  if(overwhelmed) return sc.overwhelmCap || 10000;
  return Math.max(0, Math.min(sc.cap || 5000, Math.round((dealt||0) * (sc.perInFightHp || 50))));
}
// attempts: [{raidId, part, cycle, owner, contribution, at}]
function raidState(def, attempts, now, opts){
  opts = opts || {};
  const cycle = opts.cycle!=null ? opts.cycle : cycleOf(now);
  const cycleStart = cycle * CYCLE_MS;
  const daysIn = Math.max(0, Math.min(7, (now - cycleStart) / DAY));
  const mine = (attempts||[]).filter(a=> a && a.raidId===def.id && a.cycle===cycle);
  const parts = {};
  (def.parts||[]).forEach(p=>{ parts[p.id] = {id:p.id, def:p, total: partTotal(p), real:0, standIn:0, attempts:0}; });
  mine.forEach(a=>{ const s = parts[a.part]; if(s){ s.real += Math.max(0, a.contribution|0); s.attempts++; } });
  // Locks resolve in order: a part is open once every part it waits on is empty.
  const isEmpty = id=> parts[id] && (parts[id].total - parts[id].real - parts[id].standIn) <= 0;
  const pct = ((def.standIns||{}).perDayPct || 0) / 100;
  let changed = true, guard = 0;
  const order = (def.parts||[]).slice();
  while(changed && guard++ < 10){
    changed = false;
    order.forEach(p=>{
      const s = parts[p.id];
      const open = (p.lockedUntil||[]).every(isEmpty);
      // stand-ins only work on open parts, and only for the days since it opened (approx: the whole cycle)
      const want = open ? Math.min(Math.max(0, s.total - s.real), Math.floor(s.total * pct * daysIn)) : 0;
      if(want !== s.standIn){ s.standIn = want; changed = true; }
    });
  }
  let total = 0, left = 0;
  const list = order.map(p=>{
    const s = parts[p.id];
    s.remaining = Math.max(0, s.total - s.real - s.standIn);
    s.locked = !(p.lockedUntil||[]).every(isEmpty);
    s.defeated = s.remaining <= 0;
    s.barsLeft = s.remaining / Math.max(1, p.barHp|0); // fractional bars still standing
    total += s.total; left += s.remaining;
    return s;
  });
  const fraction = total ? left / total : 0;
  const stages = (def.stages||[]).slice().sort((a,b)=> b.at - a.at);
  let stage = null; stages.forEach(st=>{ if(fraction < st.at) stage = st; });
  const owners = {};
  mine.forEach(a=>{ owners[a.owner] = (owners[a.owner]||0) + (a.contribution|0); });
  return {raid:def, cycle, parts:list, byId:parts, fraction, remaining:left, total, stage, defeated: left<=0, contributors: owners, daysIn};
}
// Ranked contribution tier for a player this cycle: 'top1' / 'top10' / 'top50' / 'participant' / null.
function contributionTier(state, owner){
  const entries = Object.entries(state.contributors).sort((a,b)=> b[1]-a[1]);
  const i = entries.findIndex(([o])=> o===owner);
  if(i<0) return null;
  const pct = (i+1) / entries.length;
  return pct <= 0.01 ? 'top1' : pct <= 0.10 ? 'top10' : pct <= 0.50 ? 'top50' : 'participant';
}
// What a participant can claim for a cycle: the kill reward if the raid fell, otherwise compensation
// once the cycle is over. Tier extras stack on top (materials / cosmetics, never raw power).
function claimableReward(def, state, owner, now){
  const tier = contributionTier(state, owner);
  if(!tier) return null;
  const rw = def.rewards || {};
  const over = cycleOf(now) > state.cycle;
  let base = null, kind = null;
  if(state.defeated){ base = rw.kill || {}; kind = 'kill'; }
  else if(over){ const pct = (rw.compensationPct!=null ? rw.compensationPct : 40) / 100; base = {}; Object.entries(rw.kill||{}).forEach(([k,v])=>{ if(typeof v==='number') base[k] = Math.round(v*pct); }); kind = 'compensation'; }
  else return null;
  const extra = ((rw.tiers||{})[tier]) || {};
  return {kind, tier, base, extra};
}
// Fight setup for one part: the part's deck and castle, and whether its cards are stripped of
// abilities (stage rule stripAbilities, e.g. the < 1% "Exposed" stage).
function fightFor(def, state, partId){
  const p = (def.parts||[]).find(x=> x.id===partId); if(!p) return null;
  const s = state.byId[partId];
  const rules = (state.stage && state.stage.rules) || [];
  return {part:p, deck: Object.assign({}, (p.fight||{}).deck||{}), castleHp: (p.fight||{}).castleHp || 200, rounds: fightRounds(def, p), stripAbilities: rules.some(r=> r.stripAbilities), locked: s.locked, defeated: s.defeated};
}
// Each attempt lasts a fixed number of turns (part `fight.rounds`, else raid `fightRounds`, else 12):
// the part's deck is finite, so without a clock any deck would grind its castle down eventually.
function fightRounds(def, p){ return Math.max(3, ((p && p.fight && p.fight.rounds) || def.fightRounds || 12) | 0); }
function validateRaid(def, defs){
  const errs = [];
  if(!def || !def.id) errs.push('missing id');
  if(!(def.parts||[]).length) errs.push('no parts');
  const ids = new Set((def.parts||[]).map(p=> p.id));
  (def.parts||[]).forEach(p=>{
    if(!(p.bars>0) || !(p.barHp>0)) errs.push(`${p.id}: bars and bar HP must be > 0`);
    (p.lockedUntil||[]).forEach(l=>{ if(!ids.has(l)) errs.push(`${p.id}: waits on unknown part ${l}`); if(l===p.id) errs.push(`${p.id}: waits on itself`); });
    const deck = (p.fight||{}).deck||{};
    if(!Object.keys(deck).length) errs.push(`${p.id}: empty fight deck`);
    if(defs) Object.keys(deck).forEach(id=>{ if(!defs[id]) errs.push(`${p.id}: unknown card ${id}`); });
  });
  // a lock cycle would make parts unreachable forever
  const visiting = {}, done = {};
  const dfs = id=>{ if(done[id]) return false; if(visiting[id]) return true; visiting[id] = true; const p = def.parts.find(x=> x.id===id); const cyc = (p.lockedUntil||[]).some(dfs); done[id] = true; return cyc; };
  if((def.parts||[]).some(p=> dfs(p.id))) errs.push('parts wait on each other in a loop');
  return errs;
}

const api = {CYCLE_MS, cycleOf, partTotal, fightRounds, contributionFor, raidState, contributionTier, claimableReward, fightFor, validateRaid};
if(typeof module !== 'undefined' && module.exports) module.exports = api;
if(root) root.BramblewoodRaid = api;
})(typeof window !== 'undefined' ? window : (typeof globalThis !== 'undefined' ? globalThis : null));
