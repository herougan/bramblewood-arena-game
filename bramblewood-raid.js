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
// Stage rules (2026-10-18, R3-WP2: "Enraged" and "Thrashing" had no rules, and fightFor only understood stripAbilities). A stage's
// `rules` is an object, or a list of objects (the older shape, merged in order). Keys, all optional; unknown keys are ignored:
//   stripAbilities  true: the boss's cards lose every ability (Exposed)
//   bossAtk / bossHp  +N Attack / +N Health on every boss card (its deck, its boss unit, its guards and the Commons it calls in)
//   field           a field effect for this stage: a field-effect id or rule key ("landslide"), a list of them, or a rules object;
//                   it goes on top of the raid's and the part's own field (a key it names replaces theirs)
//   extraVolley     the boss's back two rows strike N times a round too (the volley your ally rows already make: half Attack)
//   castleHpPct     your (the raiders') castle's max Health changes by N% (-10 = 10% less)
const STAGE_NUM_KEYS = {bossAtk:[-20, 50], bossHp:[-50, 200], extraVolley:[0, 3], castleHpPct:[-90, 200]};
function stageFieldOf(v, resolve){
  if(!v) return {};
  if(Array.isArray(v)) return v.reduce((o, x)=> Object.assign(o, stageFieldOf(x, resolve)), {});
  if(typeof v === 'string') return String(v).split(/[\s,]+/).filter(Boolean).reduce((o, k)=>{ const r = resolve ? resolve(k) : null; if(r && typeof r === 'object') Object.assign(o, r); else o[k] = true; return o; }, {});
  if(typeof v === 'object') return Object.assign({}, v);
  return {};
}
function stageRules(stage, opts){
  const raw = stage && stage.rules, list = Array.isArray(raw) ? raw : (raw && typeof raw === 'object') ? [raw] : [];
  const out = {}, resolve = opts && opts.fieldRules;
  list.forEach(r=>{ if(!r || typeof r !== 'object') return;
    if(r.stripAbilities) out.stripAbilities = true;
    Object.keys(STAGE_NUM_KEYS).forEach(k=>{ const n = Number(r[k]); if(r[k] == null || !isFinite(n) || !n) return; const [lo, hi] = STAGE_NUM_KEYS[k]; out[k] = Math.max(lo, Math.min(hi, Math.round((out[k] || 0) + n))); });
    if(r.field){ const f = stageFieldOf(r.field, resolve); if(Object.keys(f).length) out.field = Object.assign(out.field || {}, f); }
  });
  Object.keys(out).forEach(k=>{ if(out[k] === 0) delete out[k]; });
  return out;
}
// The raid editor's write side (2026-10-18): sets the keys named in `vals` on a stage (a 0 / blank / false clears one) and keeps
// every other key it already had. Stored as a one-object list, the shape the trench reads (bramblewood-trench.js trenchConfig).
function setStageRules(stage, vals){
  if(!stage) return stage; vals = vals || {};
  const raw = stage.rules, list = Array.isArray(raw) ? raw : (raw && typeof raw === 'object') ? [raw] : [];
  const merged = Object.assign({}, ...list.filter(r=> r && typeof r === 'object'));
  Object.keys(vals).forEach(k=>{ const v = vals[k];
    if(k === 'stripAbilities'){ delete merged[k]; if(v) merged[k] = true; }
    else if(k === 'field'){ delete merged[k]; if(v && (typeof v !== 'object' || Object.keys(v).length)) merged[k] = v; }
    else if(STAGE_NUM_KEYS[k]){ delete merged[k]; const n = Number(v), [lo, hi] = STAGE_NUM_KEYS[k]; if(v !== '' && v != null && isFinite(n) && Math.round(n)) merged[k] = Math.max(lo, Math.min(hi, Math.round(n))); }
  });
  stage.rules = Object.keys(merged).length ? [merged] : [];
  return stage;
}
// One line on what a stage does, for the raid tab, the fight's set-up and the editor. opts.fieldName(key) names a field rule (else
// the key, spaced out: crushingDepths -> Crushing Depths; a name it returns empty is left out, e.g. a helper key).
function describeStage(stage, opts){
  const r = stageRules(stage, opts), bits = [], sg = n=> (n > 0 ? '+' : '') + n;
  const nm = (opts && opts.fieldName) || (k=> String(k).replace(/([a-z])([A-Z])/g, '$1 $2').replace(/^./, c=> c.toUpperCase()));
  if(r.stripAbilities) bits.push('the boss’s cards lose every ability');
  if(r.bossAtk && r.bossHp) bits.push(`every boss card ${sg(r.bossAtk)} Attack, ${sg(r.bossHp)} Health`);
  else if(r.bossAtk) bits.push(`every boss card ${sg(r.bossAtk)} Attack`);
  else if(r.bossHp) bits.push(`every boss card ${sg(r.bossHp)} Health`);
  if(r.extraVolley) bits.push(r.extraVolley === 1 ? 'its back two rows strike too, once a round' : `its back two rows strike ${r.extraVolley} times a round`);
  if(r.field){ const names = [...new Set(Object.keys(r.field).filter(k=> r.field[k] !== false).map(k=> nm(k)).filter(Boolean))]; if(names.length) bits.push(names.join(' and ') + ' on the field'); }
  if(r.castleHpPct) bits.push(`your castle ${r.castleHpPct > 0 ? '+' : '−'}${Math.abs(r.castleHpPct)}% Health`);
  if(!bits.length) return '';
  const s = bits.join('; '); return s.charAt(0).toUpperCase() + s.slice(1) + '.';
}
// The field a fight is under: the raid's fieldRules, the part's own on top (false switches one off), then the stage's field.
function fieldRulesFor(def, part, sr){
  const r = Object.assign({}, (def && def.fieldRules) || {}, (part && part.fieldRules) || {}, (sr && sr.field) || {});
  Object.keys(r).forEach(k=>{ if(r[k] === false || r[k] == null) delete r[k]; });
  return r;
}
// Fight setup for one part: the part's deck and castle, and what the raid's current stage does to it (stageRules above). opts:
// {fieldRules(key) -> rules object} resolves a stage's field id (the page passes its FIELD_EFFECTS); {myCastleHp} is your castle's
// Health before the stage's castleHpPct (the result's myCastleHp is after it).
function fightFor(def, state, partId, opts){
  const p = (def.parts||[]).find(x=> x.id===partId); if(!p) return null;
  const s = state.byId[partId] || {};
  const sr = stageRules(state.stage, opts);
  const out = {part:p, deck: Object.assign({}, (p.fight||{}).deck||{}), castleHp: (p.fight||{}).castleHp || 200, rounds: fightRounds(def, p), stripAbilities: !!sr.stripAbilities, locked: s.locked, defeated: s.defeated,
    stage: state.stage ? (state.stage.name || '') : null, stageRules: sr, bossAtk: sr.bossAtk || 0, bossHp: sr.bossHp || 0, extraVolley: sr.extraVolley || 0, castleHpPct: sr.castleHpPct || 0,
    fieldRules: fieldRulesFor(def, p, sr)};
  if(opts && opts.myCastleHp != null) out.myCastleHp = scaleCastle(opts.myCastleHp, out.castleHpPct);
  return out;
}
// Your castle's Health under a stage's castleHpPct (never below 1).
function scaleCastle(hp, pct){ hp = Number(hp) || 0; return pct ? Math.max(1, Math.round(hp * (1 + pct / 100))) : hp; }
// A boss card's copy under a stage: +bossAtk Attack and +bossHp Health (never below 0 Attack / 1 Health). Returns a new def.
function stageCard(d, f){ if(!d || !f || !(f.bossAtk || f.bossHp)) return d; return Object.assign({}, d, {attack: Math.max(0, (Number(d.attack) || 0) + (f.bossAtk || 0)), health: Math.max(1, (Number(d.health) || 1) + (f.bossHp || 0))}); }
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

// ---- The full raid board (2026-10-17, user: "for 3 lane raids, the CPU allies can only place on their own rows! For the enemy, can you
// enhance it by letting them playing commons on the back 2 rows every turn as well?"). Pure helpers over the engine's reserve rows
// (E.legalReserveSlots / E.fillReserve), so tests/raid-arena-2026-10-17.js can check them without a page.
const BOARD_COLS = [-3, -2, -1, 0, 1, 2, 3];
const byCentre = (a, b)=> Math.abs(a) - Math.abs(b) || a - b;
// Where a CPU ally plays: ONLY its own row (reserve row `row`: 1 = middle, 2 = back), never your front row or the other ally's row.
// A free slot with a card right in front of it first (it waits there), centre-most; else any free slot of its row, centre-most (a
// card there steps up when the column ahead is empty, as every reserve does). null when its row is full: the ally keeps the card.
function allySlot(E, pl, row, cols){
  if(!pl || !pl.reserve || !pl.reserve[row - 1]) return null;
  const legal = E.legalReserveSlots(pl, row).slice().sort(byCentre); if(legal.length) return legal[0];
  const r = pl.reserve[row - 1], free = (cols || BOARD_COLS).filter(sl=> !r[sl]).sort(byCentre);
  return free.length ? free[0] : null;
}
// The commons a raid boss calls in: the raid part's or the raid's `commonPool` (card ids), else every Common that shares a species or
// archetype with the part's deck and costs 2 or less. Tokens, test cards and Basics never come.
function raidCommonPool(def, part, defs){
  const ok = id=>{ const d = defs && defs[id]; return !!(d && !/~/.test(id) && (d.rarity || 'common') === 'common' && !d.token && !d.test && !d.basic); }; // never a fight-only copy (~raid, ~boss)
  const own = ((part && part.commonPool) || (def && def.commonPool) || []).filter(ok);
  if(own.length) return own;
  const tags = new Set(); Object.keys(((part || {}).fight || {}).deck || {}).forEach(id=>{ const d = defs[id]; if(d) (d.species || []).concat(d.archetypes || []).forEach(t=>{ if(t !== 'Structure') tags.add(t); }); });
  return Object.keys(defs || {}).filter(id=> ok(id) && (Number(defs[id].cost) || 0) <= 2 && (defs[id].species || []).concat(defs[id].archetypes || []).some(t=> tags.has(t))).sort();
}
// The boss's reinforcements, every round from round 2 (on top of its normal play): up to `perRow` (1) Common into each of its back two
// rows (middle first, then back), each into an EMPTY slot with a card right in front of it (so it waits there, it never jumps the
// queue), centre-most; at most `max` (2) a round, and none while its two back rows already hold `cap` (6) cards. `toId` maps a pool id
// to the id that goes on the board (the raid's scaled copy). Returns [{row, slot, defId, card}].
const REINFORCE = {perRow:1, max:2, cap:6, from:2};
function bossReinforce(E, pl, pool, rnd, opts){
  opts = Object.assign({}, REINFORCE, opts || {}); const out = [];
  if(!pl || !pl.reserve || !(pool || []).length || (opts.round != null && opts.round < opts.from)) return out;
  const held = ()=> pl.reserve.reduce((t, r)=> t + Object.keys(r).length, 0);
  for(let row = 1; row <= Math.min(2, pl.reserve.length); row++){
    for(let k = 0; k < opts.perRow; k++){
      if(out.length >= opts.max || held() >= opts.cap) return out;
      const slots = E.legalReserveSlots(pl, row).slice().sort(byCentre); if(!slots.length) break;
      const pick = pool[Math.floor((rnd ? rnd() : Math.random()) * pool.length)], id = opts.toId ? opts.toId(pick) : pick;
      const card = E.fillReserve(pl, row, slots[0], id); if(!card) break;
      out.push({row, slot:slots[0], defId:id, card});
    }
  }
  return out;
}

const api = {CYCLE_MS, cycleOf, partTotal, fightRounds, contributionFor, raidState, contributionTier, claimableReward, fightFor, stageRules, setStageRules, describeStage, fieldRulesFor, scaleCastle, stageCard, validateRaid, allySlot, raidCommonPool, bossReinforce, REINFORCE};
if(typeof module !== 'undefined' && module.exports) module.exports = api;
if(root) root.BramblewoodRaid = api;
})(typeof window !== 'undefined' ? window : (typeof globalThis !== 'undefined' ? globalThis : null));
