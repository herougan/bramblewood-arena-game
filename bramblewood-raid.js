// ============================================================================
// Bramblewood Raid model (2026-10-03, Raid P1 — see docs/raid-design.md). DOM-free: inlined into
// the page (global `BramblewoodRaid`) and require()'d by tests/raid.js.
//
// A raid definition has several PARTS (e.g. three tentacles and a core), each with stacked HP bars
// (bars × barHp, e.g. 4 × 50,000). Every attempt fights ONE part with today's engine (the trench
// board is P2) and converts in-fight castle damage into raid damage:
//   contribution = (overwhelmed ? scoring.overwhelmCap : min(scoring.cap, dealt × scoring.perInFightHp)) × the rank multiplier
// (2026-10-19, package RB: perInFightHp 1, cap 1,000, a win 1,000; see contributionFor)
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
// 2026-10-19 (package RV2): `rank` (optional, the fight's B..SSS) multiplies a fight that didn't overwhelm by raidRankMult (below), on
// top of the cap, never past the overwhelm's 10,000; a win counts the overwhelm cap whatever the rank.
// 2026-10-19 (package RB, owner 12:23: "do not multiply the bramble damage by 15. If 130 * 1.01 (B) = 131 is ample damage" and "deal
// 1,000 instead of 10,000, counting in the bonus damage"): raid damage = the bramble damage (x scoring.perInFightHp, 1 now, was 15) x
// the rank multiplier, the bramble damage capped at scoring.cap (1,000) first; a win (the boss's bramble fell) counts scoring.overwhelmCap
// (1,000) x the rank multiplier too (a win at SSS: 2,000). The defaults are the new scale (a raid without scoring: x1, cap 1,000, win 1,000).
const SCORING_DEFAULTS = {perInFightHp: 1, cap: 1000, overwhelmCap: 1000};
function contributionFor(def, dealt, overwhelmed, part, rank){
  const sc = Object.assign({}, SCORING_DEFAULTS, def.scoring || {}, (part && part.scoring) || {}), mult = raidRankMult(rank);
  if(overwhelmed) return Math.max(0, Math.round((Number(sc.overwhelmCap) || SCORING_DEFAULTS.overwhelmCap) * mult));
  const base = Math.max(0, Math.min(Number(sc.cap) || SCORING_DEFAULTS.cap, Math.round((dealt||0) * (Number(sc.perInFightHp) || 1))));
  return Math.max(0, Math.round(base * mult));
}
// ---- The boss's weakening (2026-10-19, package RB, owner 12:23: "+ the boss gets weaker as it goes down in health, allowing for possible
// 'wins'."). THE curve, in this one place: every boss card of a part (its deck, its rows' decks, the Commons it calls in, its guards and
// its boss unit) fights at
//     weaken = floor + (1 - floor) x share
// of its stats (Attack and Health: its raid stats after bossAtkPct / bossHpPct AND a stage's +Attack / +Health), where
//     share = the lower of the part's remaining Health / its total and the whole raid's remaining / its total (weakenShare)
// (an outer part: its own share, 1 fresh to 0 down; the Core, which opens with the raid at 45%: the raid's) and floor = the raid's
// tuning.weakenFloor (WEAKEN_FLOOR_DEFAULT, 0.6): 100% fresh, 80% at half, 60% as it falls. weakenCard applies it (Attack never
// below 1 when it had any, Health never below 1). The elders' Health (bossHpBonus) falls on its own line, with the raid's share.
const WEAKEN_FLOOR_DEFAULT = 0.6;
function weakenFloor(def){ const v = def && def.tuning && def.tuning.weakenFloor; return (typeof v === 'number' && isFinite(v)) ? Math.max(0.1, Math.min(1, v)) : WEAKEN_FLOOR_DEFAULT; }
function bossWeakening(def, share){ const f = weakenFloor(def), s = Math.max(0, Math.min(1, share == null || !isFinite(Number(share)) ? 1 : Number(share))); return f + (1 - f) * s; }
function weakenShare(state, partId){
  if(!state) return 1; const ps = state.byId && state.byId[partId], sh = (a, b)=> b > 0 ? Math.max(0, Math.min(1, a / b)) : 1;
  return Math.min(ps ? sh(ps.remaining, ps.total) : 1, state.total ? sh(state.remaining, state.total) : 1);
}
// The raid bramble's Shield (2026-10-19, package MX, owner 22:47: "Add a shield value of 50 to the Raid. As the HP% goes down, this 50
// goes down proportionally."): the boss's bramble in a raid fight opens with a Shield (the Shield rule's armour layer: it soaks hits
// before Health) of round(max x weakenShare), the same remaining share the boss's weakening uses: 50 fresh, 25 at half, 0 as it falls.
// max = the part's `shield`, else the raid's `shield`, else RAID_SHIELD_DEFAULT (50), so a saved raid edit without it gets 50; 0 = off.
const RAID_SHIELD_DEFAULT = 50;
function raidShieldMax(def, partId){
  const p = ((def && def.parts) || []).find(x=> x.id === partId), ok = v=> v != null && v !== '' && isFinite(Number(v));
  const v = p && ok(p.shield) ? Number(p.shield) : (def && ok(def.shield) ? Number(def.shield) : RAID_SHIELD_DEFAULT);
  return Math.max(0, Math.min(999, Math.round(v)));
}
function raidShield(def, state, partId){
  const max = raidShieldMax(def, partId), share = weakenShare(state, partId);
  return {max, share, shield: Math.max(0, Math.round(max * share))};
}
function weakenCard(d, w){
  if(!d || !(w > 0) || w >= 1) return d; const a = Number(d.attack) || 0;
  return Object.assign({}, d, {attack: a > 0 ? Math.max(1, Math.round(a * w)) : 0, health: Math.max(1, Math.round((Number(d.health) || 1) * w))});
}
// The participation tiers' raid damage (2026-10-19, package RB): 1,000 / 10,000 / 50,000 on the x15 scale -> 500 / 2,000 / 12,500, so the
// same share of the lives with the tier's fights reaches each (completion model: 98% / 62% / 0.1%; tools/raid_completion_model.js).
const RB_TIER_DAMAGE = {participant: 500, competent: 2000, leading: 12500};
// ---- The new scale for saved raid edits (2026-10-19, package RB). A raid edit (this browser's, or the published one an admin saved in
// the raid editor, card_overrides '__cfg:raid:<id>') replaces the shipped def whole, so an edit saved before RB still carried the x15
// scale (scoring 15 / 5,000 / 10,000, the Goliath's 80,000 bars, its elders at 100, 100 players an instance, the 1,000 / 10,000 / 50,000
// tiers). migrateRaidScale(edit, shipped) brings such an edit (no scaleV >= 2; the editor stamps it now) onto the new scale and keeps
// everything else it set: the shipped raid's scoring, bossHpBonusMax, instanceCap and participation, and each part it shares with the
// shipped raid takes its bars / barHp (its own scoring override goes when the shipped part has none). A raid with no shipped twin (made
// in the editor) is scaled the way the Goliath was: scoring onto SCORING_DEFAULTS, every part's Health x RAID_SCALE_HP (1,100,000 /
// 1,360,000, rounded to 10,000s), the tiers onto the defaults, and its elders' ceiling halved. Returns a new def (or the edit itself).
// 2026-10-19 (package RB2, owner 16:22 / 16:28: the part brambles "less than 420" -> 350, then "make the raid very slightly harder" -> the
// elders' ceiling 50 -> 55): scale 3. An edit on scale 2 (saved after RB) with a shipped twin keeps all it set, except the values RB2
// moved that it still holds at RB's numbers: a part's fight bramble at 420 takes the shipped part's, and bossHpBonusMax 50 the shipped
// one. A value the admin changed from those is theirs and stays. Scale 1 edits take both steps.
const RAID_SCALE_V = 3, RAID_SCALE_HP = 1100000 / 1360000, RB_BRAMBLE_HP = 420, RB_ELDERS_MAX = 50;
function migrateRaidScale(e, shipped){
  if(!e || typeof e !== 'object' || Number(e.scaleV) >= RAID_SCALE_V) return e;
  if(Number(e.scaleV) >= 2) return migrateRb2(JSON.parse(JSON.stringify(e)), shipped);
  const out = JSON.parse(JSON.stringify(e)); out.scaleV = RAID_SCALE_V;
  if(shipped){
    ['scoring', 'bossHpBonusMax', 'instanceCap', 'participation'].forEach(k=>{ if(k in shipped) out[k] = JSON.parse(JSON.stringify(shipped[k])); else delete out[k]; });
    (out.parts || []).forEach(p=>{ const sp = (shipped.parts || []).find(x=> x.id === p.id); if(!sp) return; p.bars = sp.bars; p.barHp = sp.barHp;
      if(p.scoring && !sp.scoring){ delete p.scoring.perInFightHp; if(!Object.keys(p.scoring).length) delete p.scoring; } });
  } else {
    out.scoring = Object.assign({}, out.scoring || {}, SCORING_DEFAULTS);
    (out.parts || []).forEach(p=>{ const tot = Math.max(1, (p.bars | 0) * (p.barHp | 0)), want = Math.max(10000, Math.round(tot * RAID_SCALE_HP / 10000) * 10000), bars = Math.max(1, p.bars | 0);
      p.barHp = Math.max(1000, Math.round(want / bars)); if(p.scoring){ delete p.scoring.perInFightHp; if(!Object.keys(p.scoring).length) delete p.scoring; } });
    if(out.participation) out.participation = Object.assign({}, out.participation, {damage: PARTICIPATION_DEFAULTS.damage, strongDamage: PARTICIPATION_DEFAULTS.strongDamage, leadDamage: PARTICIPATION_DEFAULTS.leadDamage});
    if(out.bossHpBonusMax) out.bossHpBonusMax = Math.round(out.bossHpBonusMax / 2);
    if(out.instanceCap === 100) out.instanceCap = INSTANCE_CAP_DEFAULT;
  }
  return migrateRb2(out, shipped);
}
// The RB2 step (scale 2 -> 3) of migrateRaidScale, on a copy it owns.
function migrateRb2(out, shipped){
  out.scaleV = RAID_SCALE_V;
  if(!shipped) return out;
  (out.parts || []).forEach(p=>{ const sp = (shipped.parts || []).find(x=> x.id === p.id), want = sp && sp.fight && sp.fight.castleHp;
    if(want && p.fight && Number(p.fight.castleHp) === RB_BRAMBLE_HP) p.fight.castleHp = want; });
  if(Number(out.bossHpBonusMax) === RB_ELDERS_MAX && shipped.bossHpBonusMax != null) out.bossHpBonusMax = shipped.bossHpBonusMax;
  return out;
}
// attempts: [{raidId, part, cycle, owner, contribution, at}]
function raidState(def, attempts, now, opts){
  opts = opts || {};
  const cycle = opts.cycle!=null ? opts.cycle : cycleOf(now);
  const cycleStart = cycle * CYCLE_MS;
  const daysIn = Math.max(0, Math.min(7, (now - (opts.since != null ? Number(opts.since) : cycleStart)) / DAY));
  // 2026-10-19 (package RO, owner 21:48: "When the raid dies ... the respawn should start early"): opts.since / opts.until fence one
  // life of the raid (a generation, see raidGenerations): only attempts in [since, until) count, and the stand-ins' days run from since.
  const since = opts.since != null ? Number(opts.since) : null, until = opts.until != null ? Number(opts.until) : Infinity;
  const tOf = a=> a.at != null && isFinite(Number(a.at)) ? Number(a.at) : cycleStart;
  const mine = (attempts||[]).filter(a=> a && a.raidId===def.id && a.cycle===cycle && (since == null || (tOf(a) >= since && tOf(a) < until)));
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
  const owners = {}, fights = {};
  mine.forEach(a=>{ owners[a.owner] = (owners[a.owner]||0) + (a.contribution|0); fights[a.owner] = (fights[a.owner]||0) + 1; });
  return {raid:def, cycle, parts:list, byId:parts, fraction, remaining:left, total, stage, defeated: left<=0, contributors: owners, fightsBy: fights, daysIn, since};
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
//   extraVolley     the boss's back two rows strike N extra times as each round starts (half Attack, on top of every reserve unit's
//                   own strike in combat, 2026-10-18)
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
  // 2026-10-18: every back-row unit already strikes once in each round's combat (the engine's reserveActs), so a stage's volley is extra
  if(r.extraVolley) bits.push(r.extraVolley === 1 ? 'its back two rows strike an extra time as each round starts' : `its back two rows strike ${r.extraVolley} extra times as each round starts`);
  if(r.field){ const names = [...new Set(Object.keys(r.field).filter(k=> r.field[k] !== false).map(k=> nm(k)).filter(Boolean))]; if(names.length) bits.push(names.join(' and ') + ' on the field'); }
  if(r.castleHpPct) bits.push(`your bramble ${r.castleHpPct > 0 ? '+' : '−'}${Math.abs(r.castleHpPct)}% Health`);
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
// Each attempt lasts a fixed number of turns (part `fight.rounds`, else raid `fightRounds`, else 20):
// the part's deck is finite, so without a clock any deck would grind its castle down eventually.
// 2026-10-18 (owner 11:46: "Raid is changed to 20-turn limit (or your death)"): the default went from 12 to 20.
const FIGHT_ROUNDS_DEFAULT = 20;
function fightRounds(def, p){ return Math.max(3, ((p && p.fight && p.fight.rounds) || (def && def.fightRounds) || FIGHT_ROUNDS_DEFAULT) | 0); }
// The super whales' might (2026-10-18, owner 11:46: "The super whales have hp% based on the remaining HP of the raid maybe? They
// can start with additional HP beyond their peers up to almost 100+"): the raid's boss unit (the Kraken Brute and co.) carries
// +round(bossHpBonusMax × the share of the raid's total Health still standing) Health on top of its peer-scaled Health: about
// +100 on a fresh Goliath, about +0 on a nearly-dead one. The state is whatever raidState was given (the cloud's attempts, or
// only this device's when offline). bossHpBonusMax is clamped to 0–1000; unset = no bonus.
// 2026-10-19 (package RV2, owner 08:42: "Lower the HP of these HP-scaled elders. (They start with 100 HP instead, then scale down to
// the basic HP.)"): with the unit's `basic` Health given, bossHpBonusMax (100) is the unit's whole Health on a fresh raid, not a bonus
// on top: Health = basic + (100 − basic) × the raid's remaining share, so 100 fresh, its basic Health when the raid is nearly dead,
// never below basic (basic ≥ 100: basic, no bonus). `bonus` is what it adds to basic. Called without `basic`, the old +100 × share.
// 2026-10-19 (package RB, owner 12:23: "Elder should be rebalanced to start at 50 HP at max."): the ceiling is the raid's bossHpBonusMax,
// 50 on the Goliath now (was 100): Health = basic + (50 − basic) × the raid's remaining share, never below basic; basic ≥ 50: basic.
// 2026-10-19 (package RB2, owner 16:28: "make the raid very slightly harder", after the part brambles went 420 -> 350): 55 on the Goliath.
function bossHpBonus(def, state, basic){
  const max = Math.max(0, Math.min(1000, Math.round(Number(def && def.bossHpBonusMax) || 0)));
  const fraction = state && state.total > 0 ? Math.max(0, Math.min(1, (Number(state.remaining) || 0) / state.total)) : 1;
  const b = Math.max(0, Math.round(Number(basic) || 0));
  return {bonus: Math.round(Math.max(0, max - b) * fraction), fraction, max, basic: b, health: b + Math.round(Math.max(0, max - b) * fraction)};
}
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

// ============================================================================
// Raid ops (2026-10-19, package RO; see docs/raid-ops-2026-10-19.md). Owner 21:48 / 21:49 / 00:22 / 00:29.
// ============================================================================
// ---- Respawn: a raid that falls comes back respawnHours (24) after the kill, as a fresh generation with full Health, inside the
// same weekly cycle (the cycle's end still starts a new one). An admin restart starts a fresh generation at once. A generation is
// fenced by time only: [start, end) of the attempts' `at`, so the table needs no new column. The kill moment is the first attempt
// (or, for the stand-ins' share, the first minute) at which that generation's Health reaches 0.
const RESPAWN_HOURS_DEFAULT = 24;
function respawnMs(def){ const h = Number(def && def.respawnHours); return Math.round((isFinite(h) && h > 0 ? Math.max(1, Math.min(168, h)) : RESPAWN_HOURS_DEFAULT) * 3600 * 1000); }
function killTimeOf(def, attempts, cycle, since, until){
  const dead = t=> raidState(def, attempts, t, {cycle, since, until: t + 1}).remaining <= 0;
  if(!(until > since) || !dead(until - 1)) return null;
  const times = (attempts || []).filter(a=> a && a.raidId === def.id && a.cycle === cycle).map(a=> Number(a.at) || 0).filter(t=> t >= since && t < until).sort((a, b)=> a - b);
  // Health only falls with time, so: the first attempt at which it is down (a binary search over the attempts), then the minute
  // between the attempt before it and it (the stand-ins may finish it in between)
  let lo = since, hi = until - 1, a = 0, b = times.length - 1, first = -1;
  while(a <= b){ const m = (a + b) >> 1; if(dead(times[m])){ first = m; b = m - 1; } else a = m + 1; }
  if(first >= 0){ hi = times[first]; if(first > 0) lo = times[first - 1]; } else if(times.length) lo = times[times.length - 1];
  if(lo > since && dead(lo)) hi = lo; // equal timestamps
  while(hi - lo > 60 * 1000){ const mid = Math.floor((lo + hi) / 2); if(dead(mid)) hi = mid; else lo = mid; }
  return hi;
}
// The lives of a raid in one cycle: [{gen, start, end, killAt, respawnAt, restartAt, over}] (end is the next life's start, or the
// cycle's end). opts: {cycle, restarts: [ms] (admin restarts in this cycle)}.
function raidGenerations(def, attempts, now, opts){
  opts = opts || {};
  const cycle = opts.cycle != null ? opts.cycle : cycleOf(now), cStart = cycle * CYCLE_MS, cEnd = cStart + CYCLE_MS, upto = Math.min(now, cEnd);
  const rs = (opts.restarts || []).map(Number).filter(t=> isFinite(t) && t > cStart && t < cEnd).sort((a, b)=> a - b);
  const gens = []; let start = cStart;
  for(let guard = 0; guard < 64; guard++){
    const nextR = rs.find(t=> t > start), until = Math.min(upto, nextR != null ? nextR : Infinity);
    const killAt = killTimeOf(def, attempts, cycle, start, Math.max(start, until));
    const g = {gen: gens.length, start, end: cEnd, killAt, respawnAt: null, restartAt: null, over: false};
    gens.push(g);
    if(killAt != null){
      g.respawnAt = Math.min(cEnd, killAt + respawnMs(def));
      const r = rs.find(t=> t > killAt && t < g.respawnAt); if(r != null){ g.respawnAt = r; g.restartAt = r; } // a restart brings it back sooner
      g.end = g.respawnAt; g.over = true;
      if(g.respawnAt >= cEnd || g.respawnAt > now) break;
      start = g.respawnAt; continue;
    }
    if(nextR != null && nextR <= upto){ g.end = nextR; g.restartAt = nextR; g.over = true; start = nextR; continue; }
    g.over = now >= cEnd; break;
  }
  return gens;
}
// The raid now: the current generation's state, with gen / genStart / killAt / respawnAt on it (respawnAt: when a fallen raid returns).
function raidNow(def, attempts, now, opts){
  opts = opts || {};
  const cycle = opts.cycle != null ? opts.cycle : cycleOf(now), gens = raidGenerations(def, attempts, now, Object.assign({}, opts, {cycle}));
  const g = gens[gens.length - 1];
  const st = raidState(def, attempts, g.killAt != null ? Math.min(now, g.killAt) : now, Object.assign({}, opts, {cycle, since: g.start, until: g.end}));
  return Object.assign(st, {gen: g.gen, genStart: g.start, genEnd: g.end, killAt: g.killAt, respawnAt: g.killAt != null ? g.respawnAt : null, gens});
}
// One generation's state as it stood when it ended (or now, if it hasn't), for its claims.
function generationState(def, attempts, g, cycle, now){
  const at = Math.min(now, g.killAt != null ? g.killAt : g.end - 1);
  return Object.assign(raidState(def, attempts, at, {cycle, since: g.start, until: g.end}), {gen: g.gen, genStart: g.start, killAt: g.killAt, respawnAt: g.respawnAt});
}

// ---- Participation and rewards (owner 00:29): participating = 3+ fights AND 1,000+ raid damage in that life of the raid; a strong
// contributor = 4+ fights AND 5,000+ damage, who gets strongPct (20%) more of everything. The raid falls: participants get the full
// rewards. It survives (the life ends standing): half the general rewards (failPct 50: Gold, Dust, Metal, XP), and the raid-specific
// ones (its cards, the tier extras, the title) scaled to 0..failSpecialMaxPct (10%) by how much of its Health was taken off. Under
// the bar: no claim.
// 2026-10-19 (package RV2, owner 08:46: "The previous requirement for competent participant at 5,000 should be changed to 10,000. Then
// leading participant changed to 50,000."): the strong contributor is the Competent participant now, at 10,000+ damage (still 4+
// fights, +strongPct 20% of everything, a strongPct% chance of an extra raid card), and a new top tier, the Leading participant, at
// 50,000+ damage (leadFights 4+ fights): +leadPct (40%) of everything and leadCards (1) extra raid card for certain (a proposal: the
// owner may retune it). The damage is the raid damage counted for you, rank multiplier in (contributionFor). `strong` stays true for a
// leader, so every reader of the old flag still sees the better tier.
// 2026-10-19 (package RB, owner 12:23): the damage bars were set for the x15 scale (1,000 / 10,000 / 50,000); without the x15 and with a
// win at 1,000 they are rescaled so about the same share of raiders reaches each tier (docs/balance/raid-balance-2026-10-19.md).
const PARTICIPATION_DEFAULTS = {fights:3, damage:RB_TIER_DAMAGE.participant, strongFights:4, strongDamage:RB_TIER_DAMAGE.competent, strongPct:20, leadFights:4, leadDamage:RB_TIER_DAMAGE.leading, leadPct:40, leadCards:1};
function participationRules(def){
  const p = (def && def.participation) || {}, D = PARTICIPATION_DEFAULTS;
  const n = (v, d, lo, hi)=>{ const x = Number(v); return (v !== '' && v != null && isFinite(x)) ? Math.max(lo, Math.min(hi, Math.round(x))) : d; };
  return {fights: n(p.fights, D.fights, 0, 99), damage: n(p.damage, D.damage, 0, 1e7), strongFights: n(p.strongFights, D.strongFights, 0, 99),
    strongDamage: n(p.strongDamage, D.strongDamage, 0, 1e7), strongPct: n(p.strongPct, D.strongPct, 0, 200),
    leadFights: n(p.leadFights, D.leadFights, 0, 99), leadDamage: n(p.leadDamage, D.leadDamage, 0, 1e8), leadPct: n(p.leadPct, D.leadPct, 0, 300), leadCards: n(p.leadCards, D.leadCards, 0, 5)};
}
function participationOf(def, state, owner){
  const r = participationRules(def), fights = ((state && state.fightsBy) || {})[owner] || 0, damage = ((state && state.contributors) || {})[owner] || 0;
  const participant = fights >= r.fights && damage >= r.damage, strong = participant && fights >= r.strongFights && damage >= r.strongDamage;
  const leading = strong && fights >= r.leadFights && damage >= r.leadDamage;
  const level = leading ? 'leading' : strong ? 'competent' : participant ? 'participant' : null;
  return {fights, damage, participant, strong, leading, level, rules: r, needFights: Math.max(0, r.fights - fights), needDamage: Math.max(0, r.damage - damage)};
}
// The rank multiplier (2026-10-19, package RV2, owner 08:46: "You do 1.01× damage if B, 1.1× if A, 1.2× if S, 1.5× if SS, 2.0× if SSS
// ... it's just in the raid rules that ... higher rank = more damage"): a raid fight's rank (raidFightRank on the page: your bramble's
// Health left, SS no damage taken, SSS no damage and no unit lost) multiplies the raid damage that fight counts for, still capped
// (scoring.cap; a win is overwhelmCap, 10,000, whatever the rank). Below B: ×1. The numbers are not shown to players.
const RAID_RANK_MULT = {B:1.01, A:1.1, S:1.2, SS:1.5, SSS:2.0};
function raidRankMult(rank){ return RAID_RANK_MULT[rank] || 1; }
// ---- The total raid rank (2026-10-21, package RK, owner 18:35: "How is your TOTAL rank for a raid calculated? I think let it go to rank
// U. So S, SS, SSS, U. In the future, we will introduce U, UU, UUU. Maybe it's total contribution."): a player's rank for one life of a
// raid comes from their total contribution in it (the summed raid damage, state.contributors[owner], the number the tiers rank). THE
// ladder, lowest first, each rank's minimum total; below the first (800) there is no rank. UU and UUU go on the end when they come.
// It doesn't change the rewards' tiers (contributionTier: Top 1/10/50%); a fall's claim at RAID_TICKET_GRANT_RANK or better also pays
// RAID_TICKET_GRANT Raid Tickets (the page's claimRaidReward).
const RAID_TOTAL_RANKS = [
  {rank:'F', min:800}, {rank:'E', min:1500}, {rank:'D', min:3000}, {rank:'C', min:5000}, {rank:'B', min:7000}, {rank:'A', min:9000},
  {rank:'S', min:15000}, {rank:'SS', min:20000}, {rank:'SSS', min:25000}, {rank:'U', min:30000},
];
const RAID_TICKET_GRANT_RANK = 'A', RAID_TICKET_GRANT = 1;
// total -> the rank's letter, or null below the first rung
function raidTotalRank(total){ const t = Number(total) || 0; let out = null; RAID_TOTAL_RANKS.forEach(r=>{ if(t >= r.min) out = r.rank; }); return out; }
// the next rung above total: {rank, min, need} (need: the damage still to deal), or null at the top
function raidTotalRankNext(total){ const t = Number(total) || 0, r = RAID_TOTAL_RANKS.find(x=> t < x.min); return r ? {rank: r.rank, min: r.min, need: r.min - Math.max(0, Math.round(t))} : null; }
// is rank a at least rank b on the ladder (null is below every rung)
function raidTotalRankAtLeast(a, b){ const i = RAID_TOTAL_RANKS.findIndex(x=> x.rank === a), j = RAID_TOTAL_RANKS.findIndex(x=> x.rank === b); return i >= 0 && j >= 0 && i >= j; }
// opts.over: that life of the raid has ended (it fell, was restarted, or the cycle ended). Returns null when there is nothing to claim.
function raidReward(def, state, owner, opts){
  opts = opts || {};
  const p = participationOf(def, state, owner); if(!p.participant) return null;
  const kill = !!state.defeated; if(!kill && !opts.over) return null;
  const rw = (def && def.rewards) || {}, tier = contributionTier(state, owner) || 'participant';
  const failPct = rw.failPct != null ? Number(rw.failPct) : 50, specMax = rw.failSpecialMaxPct != null ? Number(rw.failSpecialMaxPct) : 10;
  const taken = Math.max(0, Math.min(1, 1 - (Number(state.fraction) || 0)));
  const genMult = kill ? 1 : Math.max(0, failPct) / 100, specMult = kill ? 1 : Math.max(0, specMax) / 100 * taken, boost = p.leading ? 1 + p.rules.leadPct / 100 : p.strong ? 1 + p.rules.strongPct / 100 : 1; // + the Leading participant (2026-10-19, RV2)
  const base = {}; Object.entries(rw.kill || {}).forEach(([k, v])=>{ if(typeof v === 'number' && v > 0){ const n = Math.round(v * genMult * boost); if(n > 0) base[k] = n; } });
  const extra = {}; Object.entries((rw.tiers || {})[tier] || {}).forEach(([k, v])=>{
    if(typeof v === 'number' && v > 0){ const n = kill ? Math.round(v * boost) : Math.floor(v * specMult * boost); if(n > 0) extra[k] = n; }
    else if(k === 'title' && v && kill) extra.title = v; });
  const xp = Math.round((rw.xp != null ? Number(rw.xp) : 500) * genMult * boost);
  const cardsBase = Math.max(0, Math.round(rw.cards != null ? Number(rw.cards) : 1)) + (/^top(1|10)$/.test(tier) ? 1 : 0);
  // cards: a kill gives them all (a strong contributor: strongPct% chance of one more); a survival only a chance at one, 0..10%
  // 2026-10-19 (RV2): a Leading participant's kill brings leadCards (1) more for certain, and no chance roll on top
  // 2026-10-19 (package RC, owner 09:53): these are REWARD cards now, from the normal pack pools (or, at factionChance, a faction
  // card), never the raid's own; its own cards come only at RAID_CARD_DROP_CHANCE (raidCardChance) and from the Forge's Raid tab.
  const cards = kill ? cardsBase + (p.leading ? p.rules.leadCards : 0) : 0, cardChance = kill ? (p.leading ? 0 : p.strong ? p.rules.strongPct / 100 : 0) : Math.min(1, specMult * boost * cardsBase);
  const row = RAID_REWARD_TABLE[p.level] || RAID_REWARD_TABLE.participant;
  // 2026-10-19 (package MX, owner 23:43: "main participators should definitely get more - maybe as a start, minimum 1 per game you
  // played ... Then the better you do, more than 20% and 40% rewards. Maybe 2x and 5x rewards. So 100+ for those who do very well."):
  // RAID_SHARDS_PER_FIGHT (1) a fight you played in that life, or the raid's flat base (rewards.shards, else the table's 6) when that is
  // more, times the level's shardMult (Participant 1, Competent 2, Leading 5; was x1.2 / x1.4 and +2 / +5), then the standing's
  // RAID_TIER_SHARDS on top; a held raid still pays its share below. 40 fights: 40 / 80 / 200.
  const shardBase = rw.shards != null && isFinite(Number(rw.shards)) ? Math.max(0, Number(rw.shards)) : row.shards;
  const fullShards = Math.round(Math.max(shardBase, (p.fights || 0) * RAID_SHARDS_PER_FIGHT) * (row.shardMult || 1)) + (RAID_TIER_SHARDS[tier] || 0);
  const shards = kill ? fullShards : Math.floor(fullShards * genMult * taken); // a held raid: its share (failPct) by how much Health went
  return {kind: kill ? 'kill' : 'compensation', tier, strong: p.strong, leading: !!p.leading, level: p.level, participation: p, base, extra, xp, cards, cardChance, taken, genMult, specMult, boost,
    packFloor: row.packFloor, factionChance: row.factionChance, shards, raidCardChance: kill ? RAID_CARD_DROP_CHANCE : 0};
}
// ---- Raid rewards v3 (2026-10-19, package RC, owner 09:53: "Raids almost never give raid cards. only maybe pack cards or faction
// cards (maybe), raid cards must be crafted in the Forge. Under a special tab."). A claim pays its reward cards from the normal pack
// pools at the participation level's rarity floor, each one a faction card at factionChance instead, plus the raid's trophy shards
// (its crafting material: the Forge's Raid tab turns them, with Magic Dust and Maple Leaves, into the raid's own cards).
// RAID_CARD_DROP_CHANCE is the ONE place the raid-card chance lives (the owner wants "almost never"): a fall's claim rolls it once,
// and so does a won raid fight (the page's raidFightCardDrop). A held raid's claim never rolls it.
const RAID_CARD_DROP_CHANCE = 0.015;
// shards: the flat base of trophy shards on a fall (a raid's rewards.shards replaces it) when that is more than RAID_SHARDS_PER_FIGHT x
// your fights; shardMult for the level (2026-10-19, package MX: x1 / x2 / x5, was x1.2 / x1.4 with +2 / +5 extraShards); RAID_TIER_SHARDS
// on top for the standing (top 1% / 10% / 50%). Owner may retune every number here.
const RAID_SHARDS_PER_FIGHT = 1;
const RAID_REWARD_TABLE = {
  participant: {packFloor:'common',   factionChance:0.10, shards:6, shardMult:1},
  competent:   {packFloor:'uncommon', factionChance:0.15, shards:6, shardMult:2},
  leading:     {packFloor:'rare',     factionChance:0.25, shards:6, shardMult:5},
};
const RAID_TIER_SHARDS = {top1:4, top10:2, top50:1, participant:0};
const RAID_RARITY_ORDER = ['starter', 'common', 'uncommon', 'quest', 'rare', 'veryrare', 'superrare', 'epic', 'heroic', 'unique', 'questunique', 'legendary', 'mythic', 'ancient'];
const RAID_CARD_WEIGHT = {common:8, uncommon:5, rare:3, epic:1.5, legendary:0.6}; // which of a raid's own cards, when one does come (was grantRaidCards')
function raidRarityRank(r){ const i = RAID_RARITY_ORDER.indexOf(r || 'common'); return i < 0 ? 1 : i; }
// pools: {pack:[ids], faction:[ids], raid:[ids], rarityOf(id), weight(id) (a pack card's weight; default 1)}. rnd: a seeded random.
// Returns {pack:[ids], faction:[ids], raid:[ids]}: what this claim's cards are. Pure, so tests can run it seeded.
function rollRaidRewardCards(reward, pools, rnd){
  rnd = rnd || Math.random; pools = pools || {}; const out = {pack:[], faction:[], raid:[]}; if(!reward) return out;
  const rar = id=> (pools.rarityOf ? pools.rarityOf(id) : 'common') || 'common';
  const pick = (list, w)=>{ if(!list.length) return null; const tot = list.reduce((t, id)=> t + Math.max(0, w(id)), 0); if(!(tot > 0)) return list[Math.floor(rnd() * list.length)];
    let r = rnd() * tot; for(const id of list){ r -= Math.max(0, w(id)); if(r <= 0) return id; } return list[list.length - 1]; };
  const floor = raidRarityRank(reward.packFloor || 'common'), atFloor = list=>{ const f = (list || []).filter(id=> raidRarityRank(rar(id)) >= floor); return f.length ? f : (list || []); };
  const packW = id=> pools.weight ? pools.weight(id) : 1;
  let n = Math.max(0, reward.cards | 0); if(reward.cardChance > 0 && rnd() < reward.cardChance) n++;
  for(let i = 0; i < n; i++){
    const fac = (pools.faction || []).length > 0 && rnd() < (reward.factionChance || 0);
    const id = pick(atFloor(fac ? pools.faction : pools.pack), packW); if(id) out[fac ? 'faction' : 'pack'].push(id);
  }
  if(reward.raidCardChance > 0 && (pools.raid || []).length && rnd() < reward.raidCardChance){ const id = pick(pools.raid, id=> RAID_CARD_WEIGHT[rar(id)] || 1); if(id) out.raid.push(id); }
  return out;
}
// ---- Raid recipes (2026-10-19, package RC): what crafting one of a raid's own cards costs in the Forge's Raid tab, by rarity: that
// raid's trophy shards + Magic Dust + Maple Leaves. A raid's recipeCost {rarity: {shards, dust, gold}} or recipes {cardId: {...}}
// overrides. Proposal numbers (a participant's fall pays 6 shards, a Leading participant's 13): a Common ~2 falls, a Legendary ~27
// (~12 leading).
const RAID_RECIPE_COST = {
  starter:{shards:8, dust:40, gold:80}, common:{shards:8, dust:40, gold:80}, uncommon:{shards:16, dust:90, gold:180}, quest:{shards:16, dust:90, gold:180},
  rare:{shards:30, dust:180, gold:360}, veryrare:{shards:45, dust:270, gold:540}, superrare:{shards:60, dust:360, gold:720}, epic:{shards:80, dust:480, gold:960},
  heroic:{shards:110, dust:640, gold:1280}, unique:{shards:130, dust:760, gold:1520}, questunique:{shards:130, dust:760, gold:1520}, legendary:{shards:160, dust:960, gold:1920},
  mythic:{shards:220, dust:1300, gold:2600}, ancient:{shards:300, dust:1800, gold:3600},
};
function raidRecipeFor(raid, cardId, rarity){
  const r = raid || {}, own = (r.recipes || {})[cardId], byR = (r.recipeCost || {})[rarity || 'common'], base = RAID_RECIPE_COST[rarity] || RAID_RECIPE_COST.common;
  const src = Object.assign({}, base, byR || {}, own || {}), n = v=> Math.max(0, Math.round(Number(v) || 0));
  return {shards: n(src.shards), dust: n(src.dust), gold: n(src.gold)};
}
// wallet: {gold, dust, raidShards:{raidId: n}} (the page's myCurrencies). What's missing, by kind (empty: affordable).
function raidRecipeShort(wallet, raidId, cost){
  const w = wallet || {}, have = {shards: Number(((w.raidShards || {})[raidId])) || 0, dust: Number(w.dust) || 0, gold: Number(w.gold) || 0};
  return ['shards', 'dust', 'gold'].filter(k=> (cost[k] || 0) > have[k]).map(k=> ({kind:k, need:cost[k], have:have[k]}));
}
// Pays a recipe out of the wallet (mutates it). false (and nothing taken) when it can't be paid.
function payRaidRecipe(wallet, raidId, cost){
  if(!wallet || !raidId || raidRecipeShort(wallet, raidId, cost).length) return false;
  wallet.raidShards = Object.assign({}, wallet.raidShards || {}); wallet.raidShards[raidId] = (Number(wallet.raidShards[raidId]) || 0) - (cost.shards || 0);
  wallet.dust = (Number(wallet.dust) || 0) - (cost.dust || 0); wallet.gold = (Number(wallet.gold) || 0) - (cost.gold || 0);
  return true;
}

// ---- Raid tickets (owner 00:22: "10 tickets per week to do raids, regenerate 1 per day"): at most `cap` (10); +1 every regenMs (a
// day) while under the cap, counted from the last tick (spending from a full stack starts the clock); every new weekly cycle tops the
// stack back up to the cap. t: {n, at (the regen clock, ms), cycle}. Returns a new {n, at, cycle}.
const TICKETS = {cap:10, regenMs: DAY};
function settleTickets(t, now, rules){
  const r = Object.assign({}, TICKETS, rules || {}); t = t || {};
  let n = Number(t.n); if(t.n == null || !isFinite(n)) n = r.cap;
  let at = Number(t.at); if(!(at > 0)) at = now;
  let cycle = t.cycle != null && isFinite(Number(t.cycle)) ? Number(t.cycle) : null;
  const cyc = cycleOf(now);
  if(cycle == null || cyc > cycle){ if(n < r.cap) n = r.cap; at = now; cycle = cyc; }
  if(n >= r.cap) return {n, at: now, cycle};
  const ticks = Math.floor(Math.max(0, now - at) / r.regenMs);
  if(ticks > 0){ n = Math.min(r.cap, n + ticks); at = n >= r.cap ? now : at + ticks * r.regenMs; }
  return {n, at, cycle};
}
function spendTickets(t, k, now, rules){ const cap = Object.assign({}, TICKETS, rules || {}).cap, s = settleTickets(t, now, rules); if(s.n < k) return null;
  return {n: s.n - k, at: s.n >= cap ? now : s.at, cycle: s.cycle}; }
// ms until the next ticket (the next day's tick, or the weekly top-up if that comes first); null when full
function nextTicketIn(t, now, rules){ const r = Object.assign({}, TICKETS, rules || {}), s = settleTickets(t, now, r); if(s.n >= r.cap) return null;
  return Math.max(0, Math.min(r.regenMs - (now - s.at), (s.cycle + 1) * CYCLE_MS - now)); }
// What one attempt costs (owner: "also takes 1-6 energy to participate"): the raid's tickets (cost.raidPoints, 1) and the part's
// Energy (part.cost.energy, else the raid's cost.energy), plus the current stage's energyAdd, kept to 1..6.
function attemptCost(def, partId, stage){
  const c = (def && def.cost) || {}, p = ((def && def.parts) || []).find(x=> x.id === partId) || {};
  const pe = p.cost && p.cost.energy != null ? Number(p.cost.energy) : (c.energy != null ? Number(c.energy) : 4);
  const energy = Math.max(1, Math.min(6, Math.round((isFinite(pe) ? pe : 4) + (Number(stage && stage.energyAdd) || 0))));
  const tickets = Math.max(0, Math.round(c.raidPoints != null ? Number(c.raidPoints) : 1));
  return {tickets, energy};
}

// ---- Auto (owner 21:49: "Completing a raid lets you auto it in the future"): completed = a participant in a life of the raid that
// fell. The page keeps the set of completed raids ({raidId: when}); this says whether a raid's Auto is open.
function autoUnlocked(done, raidId){ return !!(done && raidId && done[raidId]); }

// ---- Instances (owner 00:22: "When there are too many players, each raid can have multiple instances"): each cycle a raid has
// instances 1..N of instanceCap (250; 100 before 2026-10-19, package RB, owner 12:23: "cap the amount of participants to 250 players") players, each with its own Health, lives and rewards. A player is placed on their first fight
// of the cycle: in a guild-mate's instance that has room, else the lowest instance with room, else a new one (join order). The
// server does it (join_raid_instance, supabase/proposed/20261019_raid_ops.sql); until that is applied everyone is in instance 1.
// Attempts carry the instance in boss_id: "raid:part" is instance 1 (as before), "raid:part@2" instance 2.
const INSTANCE_CAP_DEFAULT = 250; // 2026-10-19 (package RB): was 100; the server's join_raid_instance default: supabase/proposed/20261019_raid_cap_250.sql
function instanceCap(def){ const n = Math.round(Number(def && def.instanceCap) || INSTANCE_CAP_DEFAULT); return Math.max(10, Math.min(1000, n)); }
function assignInstance(members, owner, opts){
  opts = opts || {}; const cap = Math.max(1, Math.round(opts.cap || INSTANCE_CAP_DEFAULT)), list = (members || []).filter(Boolean);
  const mine = list.find(m=> m.owner === owner); if(mine) return Math.max(1, mine.instance | 0);
  const count = {}; list.forEach(m=>{ count[m.instance | 0] = (count[m.instance | 0] || 0) + 1; });
  const room = i=> (count[i] || 0) < cap;
  if(opts.guild){ const g = [...new Set(list.filter(m=> m.guild && m.guild === opts.guild).map(m=> m.instance | 0))].sort((a, b)=> a - b).find(room); if(g) return g; }
  let i = 1; while(!room(i) && i < 100000) i++; return i;
}
function partKey(raidId, partId, instance){ return raidId + ':' + partId + ((instance | 0) > 1 ? '@' + (instance | 0) : ''); }
function parsePartKey(bossId){ const s = String(bossId || ''), i = s.indexOf(':'); if(i < 0) return {raidId: s, part: '', instance: 1};
  const rest = s.slice(i + 1), m = rest.match(/^(.*)@(\d+)$/); return {raidId: s.slice(0, i), part: m ? m[1] : rest, instance: m ? Math.max(1, +m[2]) : 1}; }

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
const REINFORCE = {perRow:1, max:2, cap:6, from:2, every:1}; // + every (2026-10-19): a call-in every N rounds from `from`
function bossReinforce(E, pl, pool, rnd, opts){
  opts = Object.assign({}, REINFORCE, opts || {}); const out = [];
  if(!pl || !pl.reserve || !(pool || []).length || (opts.round != null && opts.round < opts.from)) return out;
  if(opts.every > 1 && opts.round != null && (opts.round - opts.from) % Math.round(opts.every) !== 0) return out; // every N rounds only (2026-10-19, package RX: a raid's tuning.reinforce)
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

const api = {DAY, RESPAWN_HOURS_DEFAULT, respawnMs, killTimeOf, raidGenerations, raidNow, generationState, PARTICIPATION_DEFAULTS, participationRules, participationOf, raidReward,
  RAID_CARD_DROP_CHANCE, RAID_REWARD_TABLE, RAID_SHARDS_PER_FIGHT, RAID_TIER_SHARDS, RAID_CARD_WEIGHT, raidRarityRank, rollRaidRewardCards, RAID_RECIPE_COST, raidRecipeFor, raidRecipeShort, payRaidRecipe, // 2026-10-19 (package RC)
  TICKETS, settleTickets, spendTickets, nextTicketIn, attemptCost, autoUnlocked, instanceCap, assignInstance, partKey, parsePartKey,
  CYCLE_MS, cycleOf, partTotal, SCORING_DEFAULTS, RAID_SCALE_V, RAID_SCALE_HP, migrateRaidScale, WEAKEN_FLOOR_DEFAULT, weakenFloor, bossWeakening, weakenShare, weakenCard, RAID_SHIELD_DEFAULT, raidShieldMax, raidShield, /* 2026-10-19 (package MX) */ RB_TIER_DAMAGE, INSTANCE_CAP_DEFAULT, // 2026-10-19 (package RB)
   RAID_TOTAL_RANKS, RAID_TICKET_GRANT_RANK, RAID_TICKET_GRANT, raidTotalRank, raidTotalRankNext, raidTotalRankAtLeast, // 2026-10-21 (package RK)
   fightRounds, FIGHT_ROUNDS_DEFAULT, bossHpBonus, contributionFor, RAID_RANK_MULT, raidRankMult, raidState, contributionTier, claimableReward, fightFor, stageRules, setStageRules, describeStage, fieldRulesFor, scaleCastle, stageCard, validateRaid, allySlot, raidCommonPool, bossReinforce, REINFORCE};
if(typeof module !== 'undefined' && module.exports) module.exports = api;
if(root) root.BramblewoodRaid = api;
})(typeof window !== 'undefined' ? window : (typeof globalThis !== 'undefined' ? globalThis : null));
