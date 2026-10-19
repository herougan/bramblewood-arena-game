#!/usr/bin/env node
// Skill combos (2026-10-19, package DC, owner 08:10: "Have you tested & costed all skills yet? We can do a sample testing with
// duo-skill combos, 1,000-2,000 times.").
//
// Two jobs on top of tools/skill_worth.js (package SW: the same live engine, baselines, calibrated opponent pools and worth maths):
//
//   1. Coverage: every skill / trigger / action / modifier / shorthand in canonical/skill-costs.json and every engine trigger and
//      action key, with its measured worth or the reason it has none. The entries SW could not measure on plain 20-copy decks get
//      targeted scenarios here:
//        - the 9 triggers that never fired: a scenario deck where they do (an enabler on the test unit AND on the deck it is
//          compared with: S = S(enabler + trigger) - S(enabler), weight = S / S(On Spawn, same action, same enabler));
//        - the 5 entries off the scale (Exile, Mind Control, Tsunami, Acid Bolt, Meteor) and Gain / Bounty (which compound when all
//          20 copies carry them): a mixed deck, k copies of the test unit among 20 vanilla units, its win rate inverted on the
//          same deck with k vanilla + Delta copies instead (a curve that runs to 10x the baseline's stats);
//        - Crepuscular (twilight only) in a fixed twilight field.
//   2. Duo-skill combos: the pair on one unit against the sum of its two single skills, all measured with the same seeds (common
//      random numbers), the same opponents and the same games per point. interaction = S(A+B) - S(A) - S(B).
//
//   node tools/skill_combo.js --scenarios [--checkpoint=docs/balance/skill-combos-scen.jsonl] [--budget-s=540]
//   node tools/skill_combo.js --pairs [--games=80] [--checkpoint=docs/balance/skill-combos-partial.jsonl] [--shard=0/2] [--budget-s=540]
//   node tools/skill_combo.js --plan        print the pair plan (skills, pairs, contexts) and stop
//   node tools/skill_combo.js --report [--apply]   docs/skill-combos-2026-10-19.md + .xlsx + docs/balance/skill-combos-2026-10-19.json;
//                                                  --apply writes the scenario results as measuredS into canonical/skill-costs.json
//                                                  (measured fields only, never `value`)
'use strict';
const fs = require('fs'), path = require('path');
const ROOT = path.join(__dirname, '..');
const SW = require(path.join(__dirname, 'skill_worth.js'));
const SkillCosts = require(path.join(__dirname, 'skill_costs.js'));
const E = require(path.join(ROOT, 'bramblewood-engine.js'));
const DAY = '2026-10-19';
const COSTS = path.join(ROOT, 'canonical', 'skill-costs.json');
const SW_JSON = path.join(ROOT, 'docs', 'balance', `skill-worth-${DAY}.json`);
const SW_SETUPS = path.join(ROOT, 'docs', 'balance', 'skill-worth-partial-setups'); // SW's calibrated opponents + vanilla curves (40 games a point)
const OUT_JSON = path.join(ROOT, 'docs', 'balance', `skill-combos-${DAY}.json`);
const OUT_MD = path.join(ROOT, 'docs', `skill-combos-${DAY}.md`);
const CK_PAIRS = path.join(ROOT, 'docs', 'balance', 'skill-combos-partial.jsonl');
const CK_SCEN = path.join(ROOT, 'docs', 'balance', 'skill-combos-scen.jsonl');
const CK_REP = path.join(ROOT, 'docs', 'balance', 'skill-combos-rep.jsonl');
const r2 = v=> Math.round(v * 100) / 100, r3 = v=> Math.round(v * 1000) / 1000;
const mean = xs=> xs.length ? xs.reduce((a, b)=> a + b, 0) / xs.length : null;
function hashStr(s){ let h = 2166136261; for(let i = 0; i < s.length; i++){ h ^= s.charCodeAt(i); h = Math.imul(h, 16777619); } return h >>> 0; }
const B = id=> SW.BASELINES.find(b=> b.id === id);
const deckOf = id=> ({[id]: 20});
// + a fixed twilight (Crepuscular acts only then): the realtime phase with its clock on 07:00, the minute the engine calls twilight
SW.CONTEXTS.twilight = {phase:'realtime', clock:'2026-10-19T07:00:00'};
const CONTEXTS = SW.CONTEXTS;
const SETUPS = path.join(ROOT, 'docs', 'balance', 'skill-combos-setups'); // SW's setups copied in (read as they are) + the ones built here

// ---------------------------------------------------------------------------------------------------------------------------
// A lab: SW's lab (its setups restored from SW's files: the calibrated opponents every single skill was costed against), plus a
// solve against SW's calibrated mixed deck with its games per point and its opponent from the caller.
// ---------------------------------------------------------------------------------------------------------------------------
function makeLab(o){
  o = o || {};
  const dir = o.setupDir === undefined ? SETUPS : o.setupDir;
  if(dir && fs.existsSync(SW_SETUPS)){ fs.mkdirSync(dir, {recursive:true}); fs.readdirSync(SW_SETUPS).forEach(f=>{ if(!fs.existsSync(path.join(dir, f))) fs.copyFileSync(path.join(SW_SETUPS, f), path.join(dir, f)); }); }
  const lab = SW.makeLab({games:40, log: o.log || (()=>{}), setupDir: dir, defs: o.defs});
  // The opponent (2026-10-19): SW's calibrated mix (5 glass cannons, 5 tanks, 5 flyers, 5 of the 0-cost swarm; vanilla wins about
  // half against it) with k added to every unit's Health (or Attack). Why not SW's vanilla mirror: 20 copies of one unit against 20
  // of another play near-deterministic games, and Health only counts in whole hits (6 Attack against 22 Health: +1 to +5 Health
  // changes nothing), so every small skill read "one breakpoint". The mix has four Health and Attack values, so the breakpoints
  // smear out. deckAt(stat, k, m): m of the 20 at k + 1 (round the kinds), the rest at k: a 1/20 step between integers.
  function mixDeckAt(S, extra){
    const b = S.b, off = S.cal.mixed.offset, kinds = ['glass', 'tank', 'flyer', 'swarm'], FX = {flyer:{flying:true}}, tag = extra ? '-' + hashStr(JSON.stringify(extra)).toString(36) : '';
    const u = (kind, stat, k)=>{ const c = S.cal[kind], id = `cx-${S.ctx}-${b.id}-${kind}-${stat}${k}${tag}`;
      if(!lab.defs[id]) lab.unit(id, {attack: Math.max(0, c.attack + (stat === 'a' ? k : 0)), health: Math.max(1, c.health + off + (stat === 'h' ? k : 0)), wait: c.wait, cost: c.cost}, {effects: Object.assign({}, FX[kind] || {}, extra || {})});
      return id; };
    const at = (stat, k, m)=>{ const d = {}; for(let i = 0; i < 20; i++){ const id = u(kinds[i % 4], stat, i < (m || 0) ? k + 1 : k); d[id] = (d[id] || 0) + 1; } return d; };
    at.lo = {h: -(Math.min(...kinds.map(k=> S.cal[k].health + off)) - 1), a: -Math.min(...kinds.map(k=> S.cal[k].attack))};
    return at;
  }
  // Bisection on the opponent's added stat until deck T wins half (integers, doubling out from 0), then the 1/20 step inside the last
  // integer bracket; the worth is where the win rate crosses 50% (interpolated).
  function solveN(S, T, stat, n, deckAt, key){
    const b = S.b, lo = deckAt.lo ? deckAt.lo[stat] : (stat === 'h' ? -(b.health - 1) : -b.attack), hi = stat === 'h' ? (o.hiMult || 5) * b.health : (o.hiMult || 5) * b.attack;
    const testId = Object.keys(T)[0], cache = {}, f = k=>{ if(cache[k] == null) cache[k] = lab.batch(testId, T, deckAt(stat, k, 0), S.ctx, key, n).wr; return cache[k]; };
    let a, z, clamp = null;
    if(f(0) > 0.5){ a = 0; z = 1; while(f(z) > 0.5){ if(z >= hi){ clamp = '>'; break; } a = z; z = Math.min(hi, z * 2); } }
    else { z = 0; a = Math.max(lo, -1); while(f(a) <= 0.5){ if(a <= lo){ clamp = '<'; break; } z = a; a = Math.max(lo, a * 2); } }
    if(clamp) return {d: clamp === '>' ? hi : lo, se:null, evals: Object.keys(cache).length, clamp};
    while(z - a > 1){ const mid = Math.floor((a + z) / 2); if(f(mid) > 0.5) a = mid; else z = mid; }
    const fm = m=>{ const ck = 'm' + m; if(cache[ck] == null) cache[ck] = m === 0 ? f(a) : m === 20 ? f(z) : lab.batch(testId, T, deckAt(stat, a, m), S.ctx, key, n).wr; return cache[ck]; };
    let ml = 0, mh = 20; while(mh - ml > 1){ const mid = Math.floor((ml + mh) / 2); if(fm(mid) > 0.5) ml = mid; else mh = mid; }
    const gl = fm(ml), gh = fm(mh), sl = Math.max(0.01, gl - gh), d = a + (ml + Math.min(1, Math.max(0, (gl - 0.5) / sl)) * (mh - ml)) / 20;
    // standard error: a win rate's noise over the local slope (per unit of the stat), the slope floored at the bracket's average
    const slope = Math.max(sl * 20 / Math.max(1, mh - ml), Math.max(0.02, f(a) - f(z)));
    return {d, se: 0.5 / Math.sqrt(n) / slope, evals: Object.keys(cache).length, clamp};
  }
  // the vanilla unit's own crossing against the same opponent (the zero every worth is measured from), cached
  const zeros = {};
  function zeroOf(S, n, deckAt, key, enabler){ const k = [S.ctx, S.b.id, n, key, JSON.stringify(enabler || {})].join('|'); if(zeros[k]) return zeros[k];
    const id = lab.unit('cz-' + hashStr(k).toString(36), S.b, {effects: enabler || {}}), T = deckOf(id);
    return (zeros[k] = {h: solveN(S, T, 'h', n, deckAt, key), a: solveN(S, T, 'a', n, deckAt, key)}); }
  return Object.assign({}, lab, {solveN, mixDeckAt, zeroOf, raw: lab});
}

// One unit's worth: the deck of 20 against SW's calibrated mix + Delta (Health, then Attack) until it wins half, less the vanilla
// unit's own Delta there; S = (dHealth + 2 dAttack) / 2 (Budget v3 units). Also its win rates against the vanilla mirror and each
// reference deck (the situational part; reported, not averaged in). Every unit plays the same seeds (common random numbers).
function measureLite(lab, run, n){
  const b = B(run.b), S = lab.setup(run.ctx, b), t = Date.now(), g0 = lab.stats().games, salt = run.salt ? '#' + run.salt : ''; // a salt: other seeds (the replicate check)
  const id = lab.unit('cb-' + hashStr(JSON.stringify([run.effects, run.rarity])).toString(36), b, {effects: run.effects, rarity: run.rarity}), T = deckOf(id);
  const m0 = lab.batch(id, T, deckOf(S.v), S.ctx, `vs:mirror:${b.id}` + salt, n);
  const per = {}; S.pool.forEach(r=> per[r] = lab.batch(id, T, S.refs[r], S.ctx, `vs:${r}:${b.id}` + salt, n).wr);
  const deckAt = lab.mixDeckAt(S), key = `cb:mix:${b.id}` + salt, z = lab.zeroOf(S, n, deckAt, key);
  const sh = lab.solveN(S, T, 'h', n, deckAt, key), sa = lab.solveN(S, T, 'a', n, deckAt, key);
  const dh = sh.d - z.h.d, da = sa.d - z.a.d, clamp = sh.clamp || sa.clamp || null;
  const se = sh.se == null || sa.se == null ? null : r2(Math.sqrt(sh.se * sh.se + 4 * sa.se * sa.se) / 2);
  delete lab.defs[id];
  return {key: run.key, kind: run.kind, ids: run.ids, ctx: run.ctx, b: run.b, effects: run.effects, source: run.source,
    wr: {mirror: r3(m0.wr), pool: r3(mean(S.pool.map(r=> per[r]))), per: Object.fromEntries(Object.entries(per).map(([k, v])=> [k, r3(v)]))},
    solve: {dh: r2(dh), da: r2(da), rawH: r2(sh.d), rawA: r2(sa.d), zeroH: r2(z.h.d), zeroA: r2(z.a.d), seH: sh.se == null ? null : r2(sh.se), seA: sa.se == null ? null : r2(sa.se), clampH: sh.clamp, clampA: sa.clamp, clamp, evals: sh.evals + sa.evals},
    h2h: {clamp}, S: {all: r2((dh + 2 * da) / 2), H: r2(dh), A: r2(2 * da), se}, games: lab.stats().games - g0, ms: Date.now() - t};
}

// ---------------------------------------------------------------------------------------------------------------------------
// Part 1: scenarios for what SW could not measure.
// ---------------------------------------------------------------------------------------------------------------------------
const DMG2 = {do:'damage', amount:2, dmgType:'physical', who:'enemy', sub:'random'};
const SPAWN_BEE = {on:'onSpawn', do:'spawnCard', defId:'bee-swarmling', count:1};
// trigger scenarios: the enabler sits on the test unit and on the deck it is compared with (so the opponent of an On Enemy Spawn
// deck spawns too); the trigger runs with the action the scenario allows (On Discard pays resources or rebuilds only, On Exile
// pays resources or draws: the engine's own limits), its reference is On Spawn with the same action and the same enabler.
const TRIGGER_SCEN = {
  onAllySpawn:  {enabler:{triggers:[SPAWN_BEE]}, act:DMG2, why:'every copy spawns a Bee Swarmling as it is played (On Spawn: Spawn), so the copies already on the field see an ally spawned'},
  // 2026-10-19 (resumed): the bees on BOTH sides. With bees on the foe's side only, even the enabler-only deck lost every game at the
  // weakest opponent (the solve ran off its range: no number), so the test deck spawns the same bees (they do not fire its On Enemy Spawn).
  onEnemySpawn: {enabler:{triggers:[SPAWN_BEE]}, oppEnabler:{triggers:[SPAWN_BEE]}, act:DMG2, why:'both decks spawn a Bee Swarmling with every unit played (On Spawn: Spawn), so the test unit sees enemies spawned; the bees of its own side keep the two decks even'},
  onMove:       {enabler:{restless:true}, act:DMG2, why:'Restless on every copy (it steps toward a column with a foe), so the copies move'},
  onHeal:       {enabler:{regen:1}, act:DMG2, why:'Regeneration 1 on every copy (a heal it gives itself counts)'},
  onDiscard:    {enabler:{}, act:{do:'rebuild', amount:12}, why:'the CPU pitches a card a turn; On Discard can only pay resources or rebuild, so it runs as Rebuild 12 (the castle has 100 Health; Rebuild 4 moved nothing) and On Spawn: Rebuild 12 for the weight'},
  onSacrifice:  {enabler:{devour:{attack:3, health:3}}, act:DMG2, why:'Devour 3/3 on every copy: the CPU feeds it a hand card (40% of turns), which is sacrificed'},
  onExile:      {enabler:{triggers:[{on:'onSpawn', do:'exileGrave', count:2}]}, act:{do:'drawCard', count:1}, why:'every copy exiles 2 cards from its graveyard as it is played (On Spawn: Exile from graveyard 2); On Exile can only pay resources or draw, so it runs as Draw 1'},
  // 2026-10-19 (resumed): breakOn 'damage' (> 2) left the chained deck losing every game even at the weakest opponent (several of the
  // calibrated foes hit for 2 or less, so most chains never broke and both solves ran off their range); breakOn 'enemySpawn' frees
  // every chain on the foe's next play, so the trigger fires once per copy.
  onChainBreak: {enabler:{chained:{breakOn:'enemySpawn'}}, act:DMG2, why:'Chained (breaks when the foe plays a unit) on every copy, so every copy breaks free on the foe\'s next play (live Chained cards break on damage; that version never broke often enough to measure)'},
  onCharge:     {charge:true, act:DMG2, why:'the Charge skill\'s own hook: Charge N - deal 2 to a random enemy (N = 1, 2, 3; the weight is at N = 2, as live cards print)'},
};
// Mixed-deck entries: k copies among 20 (the rest vanilla). Off-scale ones, Gain / Bounty, and bridge entries (measured both ways,
// to show how a mixed-deck S compares with SW's 20-copy S).
const MIX_K = 5;
const MIXED = [
  {kind:'action', id:'exile', effects:{triggers:[{on:'onSpawn', do:'exile', who:'enemy', sub:'random'}]}, per:1, bs:['b2', 'b3']},
  {kind:'action', id:'mindControl', effects:{triggers:[{on:'onSpawn', do:'mindControl', sub:'random'}]}, per:1, bs:['b2', 'b3']},
  {kind:'skill', id:'acidBolt', value:2, effects:{acidBolt:2}, bs:['b2', 'b3']},
  {kind:'skill', id:'meteor', value:20, effects:{meteor:20}, bs:['b2', 'b3']},
  {kind:'skill', id:'tsunami', value:1, effects:{tsunami:1}, ctx:'tide', bs:['b2']},
  {kind:'action', id:'gain', effects:{triggers:[{on:'onSpawn', do:'gain', amount:1, resource:'lumber'}]}, per:1, bs:['b2', 'b3']},
  {kind:'shorthand', id:'bounty', value:1, effects:{bounty:1}, bs:['b2', 'b3']},
  {kind:'shorthand', id:'bounty', value:2, effects:{bounty:2}, bs:['b2'], tag:'n2'},
  {kind:'combo', id:'onKill→gain', effects:{triggers:[{on:'onKill', do:'gain', amount:1, resource:'lumber'}]}, bs:['b2']},
  // bridge: entries SW measured with high confidence, to read the mixed deck against the 20-copy deck
  {kind:'bridge', id:'damage', effects:{triggers:[{on:'onSpawn', do:'damage', amount:2, dmgType:'physical', who:'enemy', sub:'random'}]}, bs:['b2', 'b3']},
  {kind:'bridge', id:'armor', effects:{armor:1}, bs:['b2', 'b3']},
  {kind:'bridge', id:'poison', effects:{poison:2}, bs:['b2', 'b3']},
  {kind:'bridge', id:'quick', effects:{quick:true}, bs:['b2', 'b3']},
  {kind:'bridge', id:'sweep', effects:{sweep:2}, bs:['b2', 'b3']},
];
function scenarioPlan(){
  const runs = [], add = r=>{ r.key = ['scen', r.kind, r.id, r.tag || '', r.ctx || 'plain', r.b].join('|'); runs.push(r); };
  Object.entries(TRIGGER_SCEN).forEach(([id, sc])=> ['b1', 'b2', 'b3'].forEach(b=>{
    if(sc.charge){ [1, 2, 3].forEach(n=> add({kind:'trigger', id, tag:'n' + n, n, b, test:{charge:{n, do:Object.assign({}, sc.act)}}, ref:{triggers:[Object.assign({on:'onSpawn'}, sc.act)]}, enabler:{}})); return; }
    add({kind:'trigger', id, b, enabler: sc.enabler, test: Object.assign({}, {triggers:[Object.assign({on:id}, sc.act)]}), ref: {triggers:[Object.assign({on:'onSpawn'}, sc.act)]}}); }));
  MIXED.forEach(m=> m.bs.forEach(b=> add(Object.assign({}, m, {b, ctx: m.ctx || 'plain', mixed:true}))));
  // Crepuscular (twilight only): SW's own measure, in a fixed twilight
  add({kind:'skill', id:'crepuscular', b:'b2', ctx:'twilight', sw:true, effects:{crepuscular:true}});
  add({kind:'skill', id:'crepuscularHp', b:'b2', ctx:'twilight', sw:true, effects:{crepuscular:true, crepuscularHp:1}, minus:{crepuscular:true}});
  return runs;
}
// The enabler solve: the deck of 20 (baseline + enabler + effects) against SW's calibrated mix + Delta (the mix carries the enabler
// too where the trigger needs the foe to do it: On Enemy Spawn), less the enabler-only unit's own Delta.
function scenarioSolve(lab, b, ctx, effects, enabler, n, oppEnabler){
  const S = lab.setup(ctx, b), en = enabler || {};
  const merge = (a, z)=>{ const o = Object.assign({}, a, z); if(a.triggers || z.triggers) o.triggers = (a.triggers || []).concat(z.triggers || []); return o; };
  const id = lab.unit('cs-' + hashStr(JSON.stringify([effects, en])).toString(36), b, {effects: merge(en, effects)}), T = deckOf(id);
  const deckAt = lab.mixDeckAt(S, oppEnabler || null), key = 'scen:' + hashStr(JSON.stringify([en, oppEnabler || null])).toString(36) + ':' + b.id;
  const z = lab.zeroOf(S, n, deckAt, key, en), sh = lab.solveN(S, T, 'h', n, deckAt, key), sa = lab.solveN(S, T, 'a', n, deckAt, key);
  const se = sh.se == null || sa.se == null ? null : Math.sqrt(sh.se * sh.se + 4 * sa.se * sa.se) / 2;
  const dh = sh.d - z.h.d, da = sa.d - z.a.d;
  return {S: (dh + 2 * da) / 2, dh, da, se, clamp: sh.clamp || sa.clamp || null};
}
// The mixed deck as a DAMAGE-EQUIVALENT (2026-10-19, resumed): k test copies + (20 - k) vanilla against the mirror (20 vanilla) and
// SW's calibrated mix; its win rate is inverted on a ladder of k copies of "On Spawn: Damage D to a random enemy" (D = 0 ... 48) +
// (20 - k) vanilla, against the same decks on the same seeds, and S = D x the damage action's measuredS per point (SW, high
// confidence, 20 copies). The first version inverted on k (vanilla + Delta) copies instead; its bridge entries (measured both ways)
// came out 1x to 5x SW's 20-copy S (Sweep 21 against ~4), so that scale was not SW's. The ladder puts these entries on SW's scale
// through the one action SW measured best. A removal the ladder cannot reach (it wins more than Damage 48, i.e. more than a kill)
// stays a bound: "> a kill a play".
const DMG_LADDER = [0, 1, 2, 3, 4, 6, 8, 12, 16, 24, 32, 48];
const mixCurves = {};
function dmgPerPoint(table){ const e = (table.actions || []).find(x=> x.id === 'damage'); return e && typeof e.measuredS === 'number' ? e.measuredS : 1; }
function mixCurve(lab, b, ctx, n){
  const key = ctx + ':' + b.id + ':' + n; if(mixCurves[key]) return mixCurves[key];
  const S = lab.setup(ctx, b), v = S.v, opps = {mirror: deckOf(v), mixed: S.refs.mixed};
  const deck = id=> id === v ? deckOf(v) : {[id]: MIX_K, [v]: 20 - MIX_K};
  // the ladder is ~19k games: kept on disk beside the setups, so a chunk that resumes does not replay it
  const f = path.join(SETUPS, `dmg-ladder-${ctx}-${b.id}-g${n}.json`);
  let out = null; try{ out = JSON.parse(fs.readFileSync(f, 'utf8')); if(out.ladder.join() !== DMG_LADDER.join()) out = null; else out = out.curves; }catch(e){ out = null; }
  if(!out){ out = {};
    Object.entries(opps).forEach(([o, O])=>{ out[o] = DMG_LADDER.map(D=>{ const id = D ? lab.unit(`cd-${b.id}-d${D}`, b, {effects:{triggers:[{on:'onSpawn', do:'damage', amount:D, dmgType:'physical', who:'enemy', sub:'random'}]}}) : v;
      return {d: D, wr: lab.batch(id, deck(id), O, ctx, `mix:${o}:${b.id}`, n).wr}; }); });
    fs.mkdirSync(SETUPS, {recursive:true}); fs.writeFileSync(f, JSON.stringify({ladder: DMG_LADDER, ctx, b: b.id, n, curves: out}) + '\n'); }
  return (mixCurves[key] = {curves: out, opps, deck});
}
function mixedMeasure(lab, run, n, perPoint){
  const b = B(run.b), ctx = run.ctx || 'plain', mc = mixCurve(lab, b, ctx, n);
  const id = lab.unit('cm-' + hashStr(JSON.stringify(run.effects)).toString(36), b, {effects: run.effects}), per = {};
  Object.entries(mc.opps).forEach(([o, O])=>{ const wr = lab.batch(id, mc.deck(id), O, ctx, `mix:${o}:${b.id}`, n).wr, c = mc.curves[o], x = lab.invert(c, wr);
    // the ladder's slope where it crosses (win rate per point of damage), for the standard error of D
    const i = Math.max(1, c.findIndex(p=> p.d >= x.d)), a = c[Math.max(0, i - 1)], z = c[Math.min(c.length - 1, i)], sl = Math.max(0.002, (z.wr - a.wr) / Math.max(1, z.d - a.d));
    const sw = Math.sqrt(Math.max(0.05, wr * (1 - wr)) / n);
    per[o] = {wr: r3(wr), D: r2(x.d), S: r2(x.d * perPoint), clamp: x.clamp || null, se: r2(sw / sl * perPoint)}; });
  delete lab.defs[id];
  const list = Object.values(per), ok = list.filter(p=> !p.clamp), use = ok.length ? ok : list;
  return {S: mean(use.map(p=> p.S)), D: mean(use.map(p=> p.D)), se: Math.sqrt(mean(use.map(p=> p.se * p.se))) / Math.sqrt(use.length), per, clamp: ok.length ? null : (list[0].clamp || null),
    ladder: Object.fromEntries(Object.entries(mc.curves).map(([o, c])=> [o, c.map(p=> [p.d, r3(p.wr)])]))};
}
const MIX_G = 800;
function runScenario(lab, r, n, opts){
  const b = B(r.b), t = Date.now(), g0 = lab.stats().games;
  let out;
  if(r.sw){ // SW's own measure (40 games a point), less a parent where the entry is a parameter
    const m = lab.raw.measure({key:r.key, kind:'skill', id:r.id, value:true, n:1, ctx:r.ctx, b:r.b, effects:r.effects}), base = r.minus ? lab.raw.measure({key:r.key + '|base', kind:'skill', id:r.id, value:true, n:1, ctx:r.ctx, b:r.b, effects:r.minus}) : null;
    out = {S: r2(m.S.all - (base ? base.S.all : 0)), se: m.S.se, clamp: m.h2h.clamp || m.ref.clamp || null, raw: m.S, base: base ? base.S : null};
  } else if(r.mixed){ /* a mixed deck moves the win rate less (5 copies of 20): MIX_G games a point, 10x a solve's */ const pp = (opts && opts.perPoint) || 1, m = mixedMeasure(lab, r, (opts && opts.mixG) || MIX_G, pp);
    out = {S: r2(m.S), D: r2(m.D), se: r2(m.se), clamp: m.clamp, per: m.per, ladder: m.ladder, k: MIX_K, perPoint: pp}; }
  else {
    const oe = (TRIGGER_SCEN[r.id] || {}).oppEnabler, t1 = scenarioSolve(lab, b, r.ctx || 'plain', r.test, r.enabler, n, oe), t0 = scenarioSolve(lab, b, r.ctx || 'plain', r.ref, r.enabler, n, oe);
    out = {S: r2(t1.S), se: t1.se == null ? null : r2(t1.se), refS: r2(t0.S), refSe: t0.se == null ? null : r2(t0.se), w: Math.abs(t0.S) > 0.3 ? r3(t1.S / t0.S) : null, clamp: t1.clamp || t0.clamp, test: t1, ref: t0};
  }
  return Object.assign({key:r.key, kind:r.kind, id:r.id, tag:r.tag, n:r.n, b:r.b, ctx:r.ctx || 'plain', value:r.value, per:r.per, effects:r.effects || r.test, enabler:r.enabler}, out, {games: lab.stats().games - g0, ms: Date.now() - t});
}
// From scenario runs to measured entries (in each entry's own units).
function scenarioEntries(table, scen){
  const out = {}, by = (kind, id)=> scen.filter(r=> r.kind === kind && r.id === id && !r.error);
  const confOf = (v, se, clamp)=> clamp ? 'low' : se == null ? 'low' : se <= Math.max(0.15, Math.abs(v) * 0.25) ? 'high' : se <= Math.max(0.4, Math.abs(v) * 0.5) ? 'medium' : 'low';
  Object.entries(TRIGGER_SCEN).forEach(([id, sc])=>{ let list = by('trigger', id); if(sc.charge) list = list.filter(r=> r.n === 2);
    const ws = list.map(r=> r.w).filter(x=> x != null); if(!ws.length){ out['trigger:' + id] = {why:'the scenario did not move the win rate enough to divide by On Spawn'}; return; }
    // the weight's standard error from both solves (a ratio)
    const ses = list.filter(r=> r.w != null && r.se != null && r.refSe != null).map(r=> Math.abs(r.w) * Math.sqrt(Math.pow(r.se / Math.max(0.3, Math.abs(r.S)), 2) + Math.pow(r.refSe / Math.max(0.3, Math.abs(r.refS)), 2)));
    const w = mean(ws), se = ses.length ? mean(ses) / Math.sqrt(ses.length) : null;
    out['trigger:' + id] = {measuredS: r2(w), se: se == null ? null : r2(se), conf: confOf(w, se, list.some(r=> r.clamp)), how: 'scenario: ' + sc.why, at: list.map(r=> ({b:r.b, S:r.S, refS:r.refS, w:r.w})),
      perN: sc.charge ? Object.fromEntries([1, 2, 3].map(n=> [n, r2(mean(by('trigger', id).filter(r=> r.n === n && r.w != null).map(r=> r.w)) || 0)])) : undefined}; });
  const tbl = (f, id)=> (table[f] || []).find(e=> e.id === id) || {};
  MIXED.filter(m=> m.kind !== 'bridge' && m.kind !== 'combo').forEach(m=>{ const key = (m.kind === 'shorthand' ? 'shorthand:' : m.kind + ':') + m.id; if(out[key]) return;
    const list = scen.filter(r=> r.kind === m.kind && r.id === m.id && !r.error); if(!list.length) return;
    const e = m.kind === 'skill' ? tbl('skills', m.id) : {};
    const f = r=> m.kind === 'skill' ? (e.scale === 'n' ? Math.max(1, r.value) : e.scale === 'half' ? 1 + (r.value > 1 ? Math.floor(r.value / 2) : 0) : 1) : m.kind === 'shorthand' ? r.value : (m.per || 1);
    const vs = list.map(r=> r.S / f(r)), se = mean(list.map(r=> (r.se || 0) / f(r))) / Math.sqrt(list.length), v = mean(vs);
    out[key] = {measuredS: r2(v), se: r2(se), conf: confOf(v, se, list.every(r=> r.clamp)), off: list.every(r=> r.clamp) ? list[0].clamp : null, how: `damage-equivalent in a mixed deck: ${MIX_K} copies among 20 vanilla, inverted on ${MIX_K} copies of On Spawn: Damage D (D 0-48) vs the mirror and SW's calibrated mix, ${MIX_G} games a point; S = D × the damage action's measuredS per point${list.every(r=> r.clamp) ? ' (beyond the ladder: more than Damage 48, a kill a play, so only a bound)' : ''}`, D: r2(mean(list.map(r=> r.D))), at: list.map(r=> ({b:r.b, n:r.value, D:r.D, S:r.S, se:r.se, clamp:r.clamp}))}; });
  ['crepuscular', 'crepuscularHp'].forEach(id=>{ const r = scen.find(x=> x.kind === 'skill' && x.id === id && !x.error); if(!r) return;
    out['skill:' + id] = {measuredS: r2(r.S), se: r.se, conf: confOf(r.S, r.se, r.clamp), how: id === 'crepuscular' ? 'SW\'s measure in a fixed twilight ({"phase":"twilight"}), b2' : 'S(Crepuscular + Crepuscular Hp 1) − S(Crepuscular) in a fixed twilight, b2', field:'twilight'}; });
  return out;
}

// ---------------------------------------------------------------------------------------------------------------------------
// Part 2: the pairs.
// ---------------------------------------------------------------------------------------------------------------------------
// Typical values for skills only pool cards carry (as SW's TYPICAL) and the pair partners the owner's examples need.
const TYPICAL = {hunter:2, executioner:2, brittle:2, proliferate:1, prayerWard:1, fieldBreaker:2, detonate:true};
// Skills the pool leaves out: no effect on their own AND nothing on the same unit can switch them on (they read the foe or the
// tribe), so a pair with one plays exactly the partner's games (checked on 3 null pairs below).
const NULL_ALONE = {pierce:'ignores the foe\'s Armor (the test opponents have none)', demolisher:'extra damage to the foe\'s Structures', keenEye:'extra damage to Changelings',
  swarm:'counts allies of its tribe (a test unit has no type)', esprit:'grows when Kin arrive (a test unit has no type)', frostbite:'hurts Frozen foes (paired with Freeze below)',
  crabClaws:'changes who it may attack (no effect seen alone)', remember:'pays out of the Removal Zone (paired with On Death: Exile below)', sonar:'sees in the dark (dark field only)'};
// Owner's examples and obvious candidates (2026-10-19): "Poison+Proliferate, Flying+Arrow, Wet+lightning style, Taunt+Thorns"
const TARGETED = [['poison', 'proliferate'], ['poison', 'detonate'], ['poison', 'hunter'], ['bleed', 'hunter'], ['taunt', 'thorns'], ['taunt', 'armor'], ['taunt', 'regen'], ['taunt', 'shell'],
  ['twinStrike', 'poison'], ['twinStrike', 'bleed'], ['freeze', 'frostbite'], ['remember', 'T:onDeath>exileSelf'], ['shatter', 'brittle'], ['flying', 'reach'], ['sweep', 'poison'],
  // null checks: a skill with nothing to act on, paired, plays the partner's games
  ['pierce', 'arrow'], ['swarm', 'flying'], ['crabClaws', 'stealth']];
// Wet + lightning (owner's "Wet+lightning style"): a field gives the foe Wet counters, so the lightning skills run under rain and
// the tide as field interactions (S under the field − S in a plain field).
const FIELD_SYN = {skills:['electricity', 'lightning', 'shockBolt', 'chainLightning'], fields:['rain', 'tide']};
// Skill families for the interaction model (a per-family-pair multiplier the budget can use for pairs not in the table).
const FAMILY = {
  evade:['flying', 'evasive', 'stealth', 'invisible', 'swift', 'shadow'], ranged:['arrow', 'fireArrow', 'fireBolt', 'boomerang', 'volley', 'twinShot', 'snipe', 'reach'],
  dot:['poison', 'bleed', 'venomous', 'rabid', 'toxin', 'proliferate', 'detonate', 'hunter', 'decay'], defense:['armor', 'regen', 'shell', 'thorns', 'guardian', 'revive', 'shield', 'taunt', 'molting', 'sturdy', 'invincible'],
  tempo:['quick', 'ambush', 'pounce', 'haste', 'speed', 'fastForward'], offense:['sweep', 'rage', 'supreme', 'gash', 'immolation', 'twinStrike', 'crit', 'mighty', 'fork', 'berserk', 'bludgeon'],
  control:['scare', 'daunt', 'freeze', 'stunOnHit', 'shock', 'sleep', 'stagger', 'confuse', 'weaken', 'tangle'], economy:['onReadyGold', 'bounty', 'lumberjack', 'midas'],
  summon:['onDeathSpawn', 'brood', 'sprout', 'meiosis'], aura:['inspiring', 'rally', 'kinship', 'sociable'], ready:['onReadyDamage', 'explode', 'render'],
  field:['tide', 'nocturnal', 'darksight', 'dry', 'mountainClimber', 'wave', 'diurnal', 'keenSense', 'swimmer', 'rainrunner'],
};
const famOf = id=>{ if(String(id).startsWith('T:')) return 'trigger'; for(const [f, l] of Object.entries(FAMILY)) if(l.includes(id)) return f; return 'other'; };

function liveCards(){ return JSON.parse(fs.readFileSync(path.join(ROOT, 'canonical', 'cards.json'), 'utf8')).filter(c=> !c.pool && !c.token); }
function swData(){ try{ return JSON.parse(fs.readFileSync(SW_JSON, 'utf8')); }catch(e){ return null; } }
// value of a skill (or a trigger pseudo-skill "T:on>do", the entry live cards print most) as live cards print it most
function valueOf(cards, id){
  if(String(id).startsWith('T:')){ const [on, d] = id.slice(2).split('>'), m = {};
    cards.forEach(c=> ((c.effects || {}).triggers || []).forEach(t=>{ if(t && t.on === on && t.do === d){ const s = JSON.stringify(t); m[s] = (m[s] || 0) + 1; } }));
    const top = Object.entries(m).sort((a, b)=> b[1] - a[1] || a[0].localeCompare(b[0]))[0]; return top ? JSON.parse(top[0]) : {on, do:d}; }
  if(TYPICAL[id] != null) return TYPICAL[id];
  const m = {}; cards.forEach(c=>{ const v = (c.effects || {})[id]; if(v != null){ const s = JSON.stringify(v); m[s] = (m[s] || 0) + 1; } });
  const top = Object.entries(m).sort((a, b)=> b[1] - a[1] || a[0].localeCompare(b[0]))[0]; return top ? JSON.parse(top[0]) : true;
}
function effectsOf(cards, ids){ const o = {}; ids.forEach(id=>{ const v = valueOf(cards, id); if(String(id).startsWith('T:')) o.triggers = (o.triggers || []).concat([v]); else o[id] = v; }); return o; }
const fieldOf = id=> SW.FIELD_OF[id] || null;
function ctxOf(ids){ const fs2 = [...new Set(ids.map(fieldOf).filter(Boolean))]; return fs2.length > 1 ? null : fs2[0] || 'plain'; }
// The pool: the 40 skills live cards print most (non-pool cards; parameters of another skill, entries SW could not measure and
// the null-alone skills left out), the pairs live cards print together (2+ cards), the targeted pairs.
function pairPlan(table, o){
  o = o || {}; const cards = liveCards(), ids = new Set(table.skills.map(e=> e.id)), sw = swData(), agg = sw && sw.aggregate;
  const cnt = {}, together = {}, tcnt = {};
  cards.forEach(c=>{ const ks = Object.keys(c.effects || {}).filter(k=> ids.has(k)), ts = [...new Set(((c.effects || {}).triggers || []).filter(Boolean).map(t=> 'T:' + t.on + '>' + t.do))];
    ks.forEach(k=> cnt[k] = (cnt[k] || 0) + 1); ts.forEach(k=> tcnt[k] = (tcnt[k] || 0) + 1);
    const u = ks.concat(ts); for(let i = 0; i < u.length; i++) for(let j = i + 1; j < u.length; j++){ const p = [u[i], u[j]].sort().join('+'); together[p] = (together[p] || 0) + 1; } });
  // field-bound skills: Tide and Nocturnal (103 and 41 cards) pair with the whole pool in their field; the rarer ones (Darksight,
  // Dry, Mountain Climber, Wave ...) only with what live cards print them with (each field needs its own singles: 2026-10-19, time)
  const FULL_FIELD = ['tide', 'nocturnal'];
  const skip = id=> SW.WHY[id] || SW.PARAM_OF[id] || NULL_ALONE[id] || (fieldOf(id) && !FULL_FIELD.includes(id) ? 'bound to a field (' + fieldOf(id) + '): its live pairs only' : null);
  const ranked = Object.entries(cnt).sort((a, b)=> b[1] - a[1] || a[0].localeCompare(b[0]));
  const top = ranked.filter(([k])=> !skip(k)).slice(0, o.top || 40).map(([k])=> k);
  const left = ranked.slice(0, ranked.findIndex(([k])=> k === top[top.length - 1]) + 1).filter(([k])=> skip(k)).map(([k, n])=> ({id:k, cards:n, why: SW.WHY[k] ? SW.WHY[k] : SW.PARAM_OF[k] ? 'a parameter of ' + SW.PARAM_OF[k] : NULL_ALONE[k] || skip(k)}));
  const pairs = {}, skipped = [];
  const addPair = (a, b, source)=>{ const ids2 = [a, b].sort(), k = ids2.join('+'); if(pairs[k]){ if(!pairs[k].source.includes(source)) pairs[k].source.push(source); return; }
    if(a === b) return; if(ids2.some(x=> SW.PARAM_OF[x] && ids2.includes(SW.PARAM_OF[x]))){ skipped.push({pair:k, why:'a skill and its own parameter (SW measured it as the parameter)'}); return; }
    if(ids2.some(x=> SW.WHY[x])){ skipped.push({pair:k, why:'has an entry SW could not measure: ' + ids2.filter(x=> SW.WHY[x]).map(x=> x + ' (' + SW.WHY[x] + ')').join('; ')}); return; }
    if(ids2.some(x=> SW.PARAM_OF[x])){ skipped.push({pair:k, why:'a parameter without its skill'}); return; }
    const ctx = ctxOf(ids2); if(!ctx){ skipped.push({pair:k, cards: together[k] || 0, why:'two skills bound to different fields (' + ids2.map(x=> x + ' ' + fieldOf(x)).join(', ') + ')'}); return; }
    pairs[k] = {ids: ids2, ctx, source:[source], cards: together[k] || 0}; };
  for(let i = 0; i < top.length; i++) for(let j = i + 1; j < top.length; j++) addPair(top[i], top[j], 'top40');
  Object.entries(together).filter(([, n])=> n >= 2).forEach(([k])=>{ const [a, b] = k.split('+'); addPair(a, b, 'live'); });
  TARGETED.forEach(([a, b])=> addPair(a, b, 'targeted'));
  // singles: every skill of a pair, in that pair's field
  const singles = {}; Object.values(pairs).forEach(p=> p.ids.forEach(id=>{ const k = id + '@' + p.ctx; singles[k] = singles[k] || {ids:[id], ctx:p.ctx}; }));
  FIELD_SYN.skills.forEach(id=> ['plain'].concat(FIELD_SYN.fields).forEach(ctx=>{ const k = id + '@' + ctx; singles[k] = singles[k] || {ids:[id], ctx, fieldSyn:true}; }));
  const runs = [];
  const legendary = ids2=> ids2.some(x=> (table.skills.find(e=> e.id === x) || {}).legendary) ? 'legendary' : undefined;
  Object.values(singles).forEach(s=> runs.push({key:['single', s.ids[0], s.ctx, 'b2'].join('|'), kind:'single', ids:s.ids, ctx:s.ctx, b:'b2', effects: effectsOf(cards, s.ids), rarity: legendary(s.ids)}));
  Object.values(pairs).forEach(p=> runs.push({key:['pair', p.ids.join('+'), p.ctx, 'b2'].join('|'), kind:'pair', ids:p.ids, ctx:p.ctx, b:'b2', effects: effectsOf(cards, p.ids), rarity: legendary(p.ids), source:p.source, cards:p.cards}));
  // a field's runs together, singles first
  runs.sort((a, b)=> (a.ctx === 'plain' ? 0 : 1) - (b.ctx === 'plain' ? 0 : 1) || a.ctx.localeCompare(b.ctx) || (a.kind === 'single' ? 0 : 1) - (b.kind === 'single' ? 0 : 1) || a.key.localeCompare(b.key));
  return {top, left, pairs, skipped, runs, counts: cnt, trigCounts: tcnt, together, swAgg: agg ? true : false};
}

function replicatePlan(p, n){
  const pairs = p.runs.filter(r=> r.kind === 'pair' && r.ctx === 'plain').sort((a, b)=> hashStr(a.key) - hashStr(b.key)).slice(0, n), need = new Set();
  pairs.forEach(r=> r.ids.forEach(id=> need.add('single|' + id + '|' + r.ctx + '|b2')));
  return p.runs.filter(r=> need.has(r.key)).concat(pairs).map(r=> Object.assign({}, r, {salt:'rep', key: r.key + '|rep'}));
}
// ---------------------------------------------------------------------------------------------------------------------------
// The single-skill worth SW measured (40 games a point) for a skill in a field, on b2: the run's S (less its enabler's control).
// ---------------------------------------------------------------------------------------------------------------------------
function swSingle(sw, id, ctx){
  if(!sw) return null;
  if(String(id).startsWith('T:')){ const [on, d] = id.slice(2).split('>'); const r = sw.results.find(x=> x.kind === 'combo' && x.b === 'b2' && x.value && x.value.on === on && x.value.do === d && !x.error); return r ? r.S.all : null; }
  const rs = sw.results.filter(x=> x.kind === 'skill' && x.id === id && x.b === 'b2' && x.ctx === ctx && !x.error);
  const r = rs.find(x=> !x.tag), c = rs.find(x=> x.tag === 'enabler');
  return r ? r2(r.S.all - (c ? c.S.all : 0)) : null;
}

// ---------------------------------------------------------------------------------------------------------------------------
// The report.
// ---------------------------------------------------------------------------------------------------------------------------
function pairRows(plan, results, sw){
  const S = {}; results.filter(r=> r.kind === 'single' && !r.error).forEach(r=> S[r.ids[0] + '@' + r.ctx] = r);
  const rows = [];
  results.filter(r=> r.kind === 'pair' && !r.error).forEach(r=>{
    const [a, b] = r.ids, sa = S[a + '@' + r.ctx], sb = S[b + '@' + r.ctx]; if(!sa || !sb) return;
    const sum = sa.S.all + sb.S.all, I = r.S.all - sum, ses = [r.S.se, sa.S.se, sb.S.se];
    const se = ses.every(x=> x != null) ? Math.sqrt(ses.reduce((t, x)=> t + x * x, 0)) : null;
    const clamp = !!(r.h2h.clamp || sa.h2h.clamp || sb.h2h.clamp);
    const z = se ? Math.abs(I) / se : 0, conf = clamp ? 'low' : z >= 3 ? 'high' : z >= 2 ? 'medium' : 'low';
    const swA = swSingle(sw, a, r.ctx), swB = swSingle(sw, b, r.ctx), swSum = swA != null && swB != null ? r2(swA + swB) : null;
    const p = plan.pairs[r.ids.join('+')] || {};
    rows.push({pair: r.ids.join(' + '), a, b, ctx: r.ctx, source: (p.source || r.source || []).join(', '), cards: p.cards || 0, fa: famOf(a), fb: famOf(b),
      S: r.S.all, Sa: sa.S.all, Sb: sb.S.all, sum: r2(sum), I: r2(I), ratio: Math.abs(sum) > 0.5 ? r2(r.S.all / sum) : null, se: se == null ? null : r2(se), z: r2(z), conf, clamp,
      swA, swB, swSum, Isw: swSum != null ? r2(r.S.all - swSum) : null, gamesPair: r.games, wr: r.wr, h2h: r.h2h, ref: r.ref});
  });
  return rows;
}
// The interaction model: (1) a per-pair adjustment table, each measured interaction shrunk by its noise (I x max(0, 1 - 1/z^2)),
// (2) a multiplier per family pair, S(A+B) = m x (S(A) + S(B)), the ratio of summed worths over that family pair's measured pairs.
function interactionModel(rows){
  const use = rows.filter(r=> !r.clamp && r.se != null);
  const table = use.map(r=> ({pair:r.pair, ctx:r.ctx, adj: r2(r.I * Math.max(0, 1 - 1 / Math.max(1e-9, r.z * r.z))), I:r.I, se:r.se, conf:r.conf})).filter(x=> Math.abs(x.adj) >= 0.5).sort((x, y)=> Math.abs(y.adj) - Math.abs(x.adj));
  const fam = {}; use.forEach(r=>{ const k = [r.fa, r.fb].sort().join('×'); (fam[k] = fam[k] || []).push(r); });
  const fams = Object.entries(fam).map(([k, l])=>{ const sp = l.reduce((t, r)=> t + r.S, 0), ss = l.reduce((t, r)=> t + r.sum, 0); return {fam:k, pairs:l.length, m: Math.abs(ss) > 1 ? r3(sp / ss) : null, meanI: r2(mean(l.map(r=> r.I)))}; }).sort((x, y)=> y.pairs - x.pairs);
  // global: least squares of S(A+B) on S(A) + S(B) through the origin, and the residual error with and without the family multiplier
  const sxy = use.reduce((t, r)=> t + r.S * r.sum, 0), sxx = use.reduce((t, r)=> t + r.sum * r.sum, 0), k = sxx ? sxy / sxx : 1;
  const mOf = r=>{ const f = fams.find(x=> x.fam === [r.fa, r.fb].sort().join('×')); return f && f.m != null && f.pairs >= 3 ? f.m : k; };
  const rmse = f=> Math.sqrt(mean(use.map(r=> Math.pow(r.S - f(r), 2))) || 0);
  return {n: use.length, global: r3(k), rmse: {additive: r2(rmse(r=> r.sum)), global: r2(rmse(r=> k * r.sum)), family: r2(rmse(r=> mOf(r) * r.sum)), table: r2(rmse(r=>{ const t = table.find(x=> x.pair === r.pair && x.ctx === r.ctx); return mOf(r) * r.sum + (t ? t.adj - (mOf(r) - 1) * r.sum : 0); }))}, families: fams, table};
}
function coverage(table, scenEnt, plan){
  const rows = [], add = (kind, id, e, extra)=>{ const s = scenEnt['' + (kind === 'shorthand' ? 'shorthand' : kind) + ':' + id];
    const st = s && s.measuredS != null ? (s.off ? 'off the scale (a bound)' : 'measured here (' + s.conf + ')') : typeof e.measuredS === 'number' ? (e.measuredOff ? 'off the scale (a bound)' : 'measured by SW (' + (e.measuredConf || 'low') + ')') : 'not measured';
    rows.push(Object.assign({kind, id, status: st, measuredS: s && s.measuredS != null ? s.measuredS : typeof e.measuredS === 'number' ? e.measuredS : null, conf: s && s.measuredS != null ? s.conf : e.measuredConf || '',
      source: s && s.measuredS != null ? 'DC' : typeof e.measuredS === 'number' ? 'SW' : '', why: s && s.measuredS != null ? s.how : e.measuredWhy || '', value: e.value}, extra || {})); };
  [['skill', 'skills'], ['trigger', 'triggers'], ['action', 'actions'], ['modifier', 'modifiers']].forEach(([k, f])=> (table[f] || []).forEach(e=> add(k, e.id, e)));
  Object.entries(table.shorthands || {}).forEach(([k, sh])=> add('shorthand', k, sh));
  // engine keys with no entry of their own (none today: the check stays so a new key shows up)
  const tt = new Set((table.triggers || []).map(e=> e.id)), ta = new Set((table.actions || []).map(e=> e.id.split('.')[0]));
  E.TRIGGER_KEYS.filter(k=> !tt.has(k)).forEach(k=> rows.push({kind:'trigger', id:k, status:'no entry', why:'engine trigger with no skill-costs entry'}));
  E.ACTION_KEYS.filter(k=> !ta.has(k) && !(table.aliases || {})[k]).forEach(k=> rows.push({kind:'action', id:k, status:'no entry', why:'engine action with no skill-costs entry'}));
  return rows;
}
function applyScenario(table, scenEnt){
  const set = (e, s)=>{ e.measuredS = s.measuredS; e.measuredConf = s.conf; if(s.se != null) e.measuredSE = s.se; else delete e.measuredSE;
    delete e.measuredWhy; if(s.off) e.measuredOff = s.off; else delete e.measuredOff; e.measuredHow = `${DAY} (package DC): ${s.how}`; };
  Object.entries(scenEnt).forEach(([k, s])=>{ if(s.measuredS == null || !isFinite(s.measuredS)) return; const [kind, id] = k.split(':');
    if(kind === 'shorthand'){ const sh = (table.shorthands || {})[id]; if(sh) set(sh, s); const t = (table.triggers || []).find(e=> e.id === id); if(t) set(t, s); return; }
    const f = {skill:'skills', trigger:'triggers', action:'actions', modifier:'modifiers'}[kind], e = f && (table[f] || []).find(x=> x.id === id); if(e) set(e, s); });
  table.measured = `${DAY} (package SW, + package DC's scenarios): measuredS = the entry's value as measured by tools/skill_worth.js (docs/skill-worth-${DAY}.md) or, where measuredHow says so, tools/skill_combo.js (docs/skill-combos-${DAY}.md); value is unchanged, the owner applies it in the hub`;
  return table;
}
function readJsonl(f){ const dir = path.dirname(f), base = path.basename(f), out = {};
  (fs.existsSync(dir) ? fs.readdirSync(dir) : []).filter(x=> x === base || x.startsWith(base + '.s')).forEach(x=> fs.readFileSync(path.join(dir, x), 'utf8').split('\n').filter(Boolean).forEach(l=>{ try{ const r = JSON.parse(l); out[r.key] = r; }catch(e){} }));
  return out; }

function writeReport(o){
  const {table, plan, rows, model, scen, scenEnt, cov, sw, data} = o, L = [], sg = v=> v == null ? '–' : (v > 0 ? '+' : '') + v, pc = v=> v == null ? '–' : Math.round(v * 100) + '%';
  const sure = rows.filter(r=> r.conf !== 'low'), syn = sure.filter(r=> r.I > 0).sort((a, b)=> b.I - a.I), anti = sure.filter(r=> r.I < 0).sort((a, b)=> a.I - b.I);
  L.push(`# Skill combos, ${DAY}`, '', 'Package DC (owner 08:10: "Have you tested & costed all skills yet? We can do a sample testing with duo-skill combos, 1,000–2,000 times.").', '');
  const pairG = rows.map(r=> r.gamesPair), totG = data.games;
  L.push(`**${rows.length} skill pairs** on one unit, each against its two single skills (${data.singles} single runs), ${Math.round(mean(pairG) || 0)} games per pair on average (${Math.min(...pairG)}–${Math.max(...pairG)}), ${totG} games in all (with the scenarios). Data: \`docs/balance/skill-combos-${DAY}.json\`, the sheet \`docs/skill-combos-${DAY}.xlsx\`; the scenario results are \`measuredS\` (with \`measuredHow\`) in \`canonical/skill-costs.json\` (\`value\` unchanged). The hub's 🧮 Skill costs tab has a Combos view.`, '');
  // coverage
  const cnt = st=> cov.filter(r=> r.status.startsWith(st)).length;
  L.push('## Coverage: is every skill costed?', '',
    `${cov.length} entries in canonical/skill-costs.json (${table.skills.length} skills, ${table.triggers.length} triggers, ${table.actions.length} actions, ${table.modifiers.length} modifiers, ${Object.keys(table.shorthands || {}).length} shorthands); every engine trigger and action key has an entry.`, '',
    `| Status | Entries |`, '|---|---|', `| measured by SW (20-copy decks) | ${cnt('measured by SW')} |`, `| measured here (scenarios, mixed decks) | ${cnt('measured here')} |`, `| off the scale (only a bound) | ${cnt('off the scale')} |`, `| not measured (a reason each) | ${cnt('not measured')} |`, '');
  L.push('**Measured here** (they had no number, or a number SW flagged):', '', '| Entry | Before | Measured | SE | Conf | How |', '|---|---|---|---|---|---|');
  Object.entries(scenEnt).forEach(([k, s])=>{ const [kind, id] = k.split(':'), f = {skill:'skills', trigger:'triggers', action:'actions'}[kind], e = kind === 'shorthand' ? (table.shorthands || {})[id] : (table[f] || []).find(x=> x.id === id) || {};
    L.push(`| ${kind} \`${id}\` | ${e.measuredS != null && !e.measuredHow ? e.measuredS + (e.measuredOff ? ' (bound)' : '') + ' (SW)' : e.measuredWhy ? 'none' : e.measuredS != null ? e.measuredS : '–'} | ${s.measuredS != null ? s.measuredS + (s.off ? ' (still a bound)' : '') : '–'} | ${s.se != null ? s.se : '–'} | ${s.conf || '–'} | ${(s.how || s.why || '').replace(/\|/g, '/')}${s.perN ? ' — per N: ' + Object.entries(s.perN).map(([n, v])=> `N ${n}: ${v}`).join(', ') : ''} |`); });
  L.push('');
  const tr = scen.filter(r=> r.kind === 'trigger' && !r.error);
  if(tr.length){ L.push('Trigger scenarios per baseline (S of the trigger with its action, S of On Spawn with the same action and enabler, weight = their ratio):', '', '| Trigger | Baseline | S | S (On Spawn) | Weight |', '|---|---|---|---|---|');
    tr.forEach(r=> L.push(`| \`${r.id}\`${r.tag ? ' ' + r.tag : ''} | ${r.b} | ${r.S} | ${r.refS} | ${r.w != null ? r.w : '–'} |`)); L.push(''); }
  const br = scen.filter(r=> r.kind === 'bridge' && !r.error);
  if(br.length){ L.push(`**Damage-equivalent vs 20 copies** (the bridge): entries SW measured with high confidence on 20-copy decks, measured here as a damage-equivalent (${MIX_K} copies among 20 vanilla). A ratio near 1 means the damage-equivalents above sit on SW's scale; Damage 2 is the ladder's own self-check.`, '', '| Entry | Baseline | Damage-equivalent D | S (D × per point) | S, 20 copies (SW) | Ratio |', '|---|---|---|---|---|---|');
    br.forEach(r=>{ const swr = sw && sw.results.find(x=> x.b === r.b && x.ctx === 'plain' && !x.tag && ((r.id === 'damage' && x.kind === 'action' && x.id === 'damage') || (r.id !== 'damage' && x.kind === 'skill' && x.id === r.id)));
      L.push(`| \`${r.id}\` | ${r.b} | ${r.D != null ? r.D : '–'} | ${r.S}${r.clamp ? ' (' + r.clamp + ')' : ''} | ${swr ? swr.S.all : '–'} | ${swr && Math.abs(swr.S.all) > 0.3 ? r2(r.S / swr.S.all) : '–'} |`); }); L.push(''); }
  const nm = cov.filter(r=> r.status.startsWith('not measured') || r.status.startsWith('off the scale'));
  L.push('**Still open** (honest gaps):', '');
  nm.forEach(r=> L.push(`- ${r.kind} \`${r.id}\`: ${r.status}${r.why ? ' — ' + r.why : ''}`));
  L.push('- Cross-field pairs (two skills bound to different fields, e.g. Darksight + Tide on 2 cards) were not run: each needs a merged field and its own calibrated pool. Listed in the JSON (`skipped`).');
  L.push('- Pairs are measured on one baseline (b2, 4/14 Wait 2) at the value live cards print most; a pair\'s interaction on a 2/8 or a 6/22 can differ (SW\'s single-skill tables show how much a skill moves with the baseline).', '');
  // method
  L.push('## Method (pairs)', '',
    `- **Which pairs**: all pairs among the ${plan.top.length} skills live cards print most (${plan.top.join(', ')}), every pair live cards print together on 2+ cards, and targeted pairs (the owner's examples: Poison + Proliferate, Flying + Arrow, Taunt + Thorns, and on-hit × multi-hit, Freeze + Frostbite, Remember + On Death: Exile, three null checks). Left out of the 40 (no effect alone and nothing on the same unit can switch them on): ${plan.left.map(x=> `${x.id} (${x.cards} cards: ${x.why})`).join('; ')}.`,
    '- **The unit**: b2 (4/14 Wait 2, Lumber 1, Common; Legendary when a skill is) + both skills at the value live cards print most, in the field a field-bound skill needs (Tide on a perma-tide, Nocturnal at night, Darksight in the dark, Dry in a heatwave, Mountain Climber in the frost).',
    `- **Games**: SW's measure — 20 copies against 20 vanilla units (head-to-head: bisection on the opponent's added Health and Attack until 50%) and against SW's calibrated reference pool (glass cannons, tanks, flyers, a 0-cost swarm, the mix, + swimmers on the tide), inverted on SW's vanilla curves; S = (ΔHealth + 2 ΔAttack) / 2, the mean of head-to-head and pool. ${data.G} games per point; every pair and both its singles play the same seeds against the same opponents (common random numbers).`,
    '- **Interaction** = S(A + B) − S(A) − S(B), all three measured here. Its standard error is the three runs\' errors added in quadrature (conservative: the shared seeds make the real error smaller). Confidence: high at |I| ≥ 3 SE, medium at ≥ 2 SE, low otherwise or when a solve ran off its range (a pair worth more than 5× the baseline\'s stats).',
    '- **The comparison asked for** (sum of single-skill measuredS): the "Σ SW" column adds SW\'s own single-skill runs (b2, same field, 40 games a point). The singles re-measured here at the pair\'s games per point are the fair yardstick (same seeds, same game count); the two agree within noise for most skills (see the sheet).', '');
  // headline
  L.push('## Top synergies (pair worth ≫ the sum of its singles)', '', '| # | Pair | Field | S pair | S(A) | S(B) | Sum | Interaction | ×Sum | SE | Conf | Cards |', '|---|---|---|---|---|---|---|---|---|---|---|---|');
  syn.slice(0, 20).forEach((r, i)=> L.push(`| ${i + 1} | ${r.pair} | ${r.ctx} | ${r.S} | ${r.Sa} | ${r.Sb} | ${r.sum} | **${sg(r.I)}** | ${r.ratio != null ? r.ratio : '–'} | ${r.se} | ${r.conf} | ${r.cards || ''} |`));
  L.push('', '## Top anti-synergies (pair worth ≪ the sum)', '', '| # | Pair | Field | S pair | S(A) | S(B) | Sum | Interaction | ×Sum | SE | Conf | Cards |', '|---|---|---|---|---|---|---|---|---|---|---|---|');
  anti.slice(0, 20).forEach((r, i)=> L.push(`| ${i + 1} | ${r.pair} | ${r.ctx} | ${r.S} | ${r.Sa} | ${r.Sb} | ${r.sum} | **${sg(r.I)}** | ${r.ratio != null ? r.ratio : '–'} | ${r.se} | ${r.conf} | ${r.cards || ''} |`));
  L.push('');
  // the owner's examples
  const ex = [['poison', 'proliferate'], ['arrow', 'flying'], ['taunt', 'thorns'], ['guardian', 'thorns'], ['poison', 'twinStrike'], ['freeze', 'frostbite'], ['poison', 'quick'], ['flying', 'reach'], ['arrow', 'pierce'], ['flying', 'swarm'], ['crabClaws', 'stealth']];
  L.push('## The owner\'s examples and checks', '', '| Pair | S pair | Sum of singles | Interaction | Conf | Reading |', '|---|---|---|---|---|---|');
  ex.forEach(([a, b])=>{ const r = rows.find(x=> x.pair === [a, b].sort().join(' + ')); if(!r) return;
    const read = r.conf === 'low' ? 'additive within noise' : r.I > 0 ? 'synergy' : 'anti-synergy'; L.push(`| ${r.pair} | ${r.S} | ${r.sum} | ${sg(r.I)} ± ${r.se} | ${r.conf} | ${read} |`); });
  const fsyn = data.fieldSyn || [];
  if(fsyn.length){ L.push('', '**Wet + lightning** (a field that makes the foe Wet: +1 lightning damage per Wet counter; rain gives every unit one, the tide gives non-flyers one): S under the field − S in a plain field, b2.', '', '| Skill | Plain | Rain | Tide | Rain − plain | Tide − plain |', '|---|---|---|---|---|---|');
    fsyn.forEach(f=> L.push(`| \`${f.id}\` | ${f.plain} | ${f.rain} | ${f.tide} | ${sg(f.dRain)} | ${sg(f.dTide)} |`)); }
  L.push('');
  // model
  L.push('## Interaction model', '', `Fitted on the ${model.n} pairs whose solves stayed in range. Error of a pair's predicted worth (RMSE, in S):`, '',
    '| Model | RMSE |', '|---|---|', `| additive (S(A) + S(B)) | ${model.rmse.additive} |`, `| one global multiplier (× ${model.global}) | ${model.rmse.global} |`, `| a multiplier per family pair (below; the global one where a family pair has < 3 pairs) | ${model.rmse.family} |`, `| family multiplier + the per-pair adjustment table | ${model.rmse.table} |`, '',
    `**How the budget could use it**: S(card with skills A and B) = m(fam A, fam B) × (S(A) + S(B)), and for a pair in the adjustment table use S(A) + S(B) + adj instead. Families: ${Object.entries(FAMILY).map(([f, l])=> `${f} (${l.slice(0, 6).join(', ')}${l.length > 6 ? '…' : ''})`).join('; ')}; anything else is "other".`, '',
    '| Family pair | Pairs | Multiplier m | Mean interaction |', '|---|---|---|---|');
  model.families.filter(f=> f.pairs >= 3).forEach(f=> L.push(`| ${f.fam} | ${f.pairs} | ${f.m != null ? f.m : '–'} | ${sg(f.meanI)} |`));
  L.push('', `**Per-pair adjustment table** (the ${Math.min(30, model.table.length)} largest of ${model.table.length}; adj = interaction × max(0, 1 − 1/z²), so a noisy one shrinks toward 0; all in the JSON):`, '', '| Pair | Field | adj | Interaction | SE |', '|---|---|---|---|---|');
  model.table.slice(0, 30).forEach(t=> L.push(`| ${t.pair} | ${t.ctx} | ${sg(t.adj)} | ${sg(t.I)} | ${t.se} |`));
  L.push('', '## Reading it', '',
    '- An interaction is a property of these decks (20 copies of the pair unit against vanilla and the reference pool); a synergy that needs company (tribes, Prayer cards) still reads as additive here.',
    '- Saturation: when a pair wins (nearly) every pool game, the pool side is clamped and the pair leans on its head-to-head; a pair worth more than 5× the baseline is only a bound (marked low).',
    '- Large negative interactions often mean overlap rather than conflict: two answers to the same problem (two evasions, two ranged openers) are not worth both prices.',
    '- Nothing in the game changed: `value` and every card\'s S stay as they were; the scenario numbers are `measuredS` the owner applies in the hub.', '');
  fs.writeFileSync(OUT_MD, L.join('\n'));
}

function sheet(o){
  const {rows, model, scen, scenEnt, cov} = o;
  const ph = ['Pair', 'A', 'B', 'Field', 'Source', 'Cards', 'Family A', 'Family B', 'S pair', 'S(A)', 'S(B)', 'Sum of singles', 'Interaction', 'Pair / sum', 'SE', 'z', 'Confidence', 'Clamped', 'S(A) SW', 'S(B) SW', 'Sum SW', 'Interaction vs SW', 'Win vs mirror', 'Win vs pool', 'Games (pair)'];
  const pr = rows.slice().sort((a, b)=> b.I - a.I).map(r=> [r.pair, r.a, r.b, r.ctx, r.source, r.cards, r.fa, r.fb, r.S, r.Sa, r.Sb, r.sum, r.I, r.ratio == null ? '' : r.ratio, r.se == null ? '' : r.se, r.z, r.conf, r.clamp ? 'yes' : '', r.swA == null ? '' : r.swA, r.swB == null ? '' : r.swB, r.swSum == null ? '' : r.swSum, r.Isw == null ? '' : r.Isw, r.wr.mirror, r.wr.pool, r.gamesPair]);
  const sh = ['Kind', 'Entry', 'Tag', 'Baseline', 'Field', 'S', 'SE', 'S (On Spawn ref)', 'Weight', 'Clamped', 'Games'];
  const sr = scen.map(r=> [r.kind, r.id, r.tag || '', r.b, r.ctx, r.S == null ? '' : r.S, r.se == null ? '' : r.se, r.refS == null ? '' : r.refS, r.w == null ? '' : r.w, r.clamp || '', r.games || '']);
  const ch = ['Kind', 'Entry', 'Status', 'measuredS', 'Confidence', 'Source', 'value (today)', 'How / reason'];
  const cr = cov.map(r=> [r.kind, r.id, r.status, r.measuredS == null ? '' : r.measuredS, r.conf || '', r.source || '', r.value == null ? '' : r.value, r.why || '']);
  const mh = ['Family pair', 'Pairs', 'Multiplier', 'Mean interaction'], mr = model.families.map(f=> [f.fam, f.pairs, f.m == null ? '' : f.m, f.meanI]);
  const ah = ['Pair', 'Field', 'Adjustment', 'Interaction', 'SE', 'Confidence'], ar = model.table.map(t=> [t.pair, t.ctx, t.adj, t.I, t.se, t.conf]);
  return {sheets:[{name:'Pairs', head:ph, rows:pr}, {name:'Model (families)', head:mh, rows:mr}, {name:'Model (pair table)', head:ah, rows:ar}, {name:'Scenarios', head:sh, rows:sr}, {name:'Coverage', head:ch, rows:cr}]};
}

// ---------------------------------------------------------------------------------------------------------------------------
if(require.main === module){
  const args = process.argv.slice(2), opt = k=>{ const a = args.find(x=> x.startsWith('--' + k + '=')); return a ? a.slice(k.length + 3) : null; };
  const table = JSON.parse(fs.readFileSync(COSTS, 'utf8'));
  const budget = +(opt('budget-s') || 0) * 1000, shard = (opt('shard') || '').split('/').map(Number), t0 = Date.now();
  if(args.includes('--plan')){ const p = pairPlan(table); console.log('top', p.top.length, p.top.join(' ')); console.log('left out', p.left.map(x=> x.id).join(' '));
    console.log('pairs', Object.keys(p.pairs).length, 'singles', p.runs.filter(r=> r.kind === 'single').length, 'skipped', p.skipped.length);
    const byCtx = {}; p.runs.forEach(r=> byCtx[r.ctx] = (byCtx[r.ctx] || 0) + 1); console.log(JSON.stringify(byCtx)); process.exit(0); }
  if(args.includes('--scenarios')){
    const G = +(opt('games') || 80), ck = opt('checkpoint') || CK_SCEN, done = readJsonl(ck), lab = makeLab({hiMult:10});
    const runs = scenarioPlan().filter(r=> !opt('only') || opt('only').split(',').includes(r.id));
    let left = 0;
    // --shard-by=b: shard by baseline (b2 on 0, b3 on 1, b1 by index) so each process builds only its own damage ladders
    const shardOf = (r, i)=> opt('shard-by') === 'b' && r.b !== 'b1' ? (r.b === 'b2' ? 0 : 1) % shard[1] : i % shard[1];
    runs.forEach((r, i)=>{ if(done[r.key]) return; if(shard.length === 2 && shardOf(r, i) !== shard[0]) return; if(budget && Date.now() - t0 > budget){ left++; return; }
      let out; try{ out = runScenario(lab, r, G, {perPoint: dmgPerPoint(table), mixG: +(opt('mix-games') || MIX_G)}); }catch(e){ out = {key:r.key, kind:r.kind, id:r.id, b:r.b, error: String(e && e.stack || e).slice(0, 300)}; }
      fs.appendFileSync(shard.length === 2 ? ck + '.s' + shard[0] : ck, JSON.stringify(out) + '\n');
      console.log(`[${i + 1}/${runs.length}] ${r.kind} ${r.id}${r.tag ? ' ' + r.tag : ''} ${r.ctx || 'plain'} ${r.b}: ${out.error ? 'ERROR ' + out.error : `S ${out.S}${out.refS != null ? ' ref ' + out.refS + ' w ' + out.w : ''}${out.clamp ? ' clamp ' + out.clamp : ''}`} · ${Math.round((Date.now() - t0) / 1000)}s ${lab.stats().games} games`); });
    console.log(left ? `${left} left: run again` : 'scenarios done'); process.exit(left ? 3 : 0);
  }
  if(args.includes('--pairs')){
    const G = +(opt('games') || 40), ck = opt('checkpoint') || (opt('replicate') ? CK_REP : CK_PAIRS), done = readJsonl(ck), lab = makeLab({hiMult:8});
    const p = pairPlan(table); let runs = p.runs; if(opt('only')) runs = runs.filter(r=> r.ids.some(x=> opt('only').split(',').includes(x)));
    // --replicate=N: N pairs (a seeded pick, plain field) and their singles again on other seeds, for the empirical noise of an interaction
    if(opt('replicate')){ runs = replicatePlan(p, +opt('replicate')); }
    const ckOut = shard.length === 2 ? ck + '.s' + shard[0] : ck; let left = 0, did = 0;
    console.log(`${runs.length} runs (${runs.filter(r=> done[r.key]).length} from the checkpoint), ${G} games per point${shard.length === 2 ? ', shard ' + shard.join('/') : ''}`);
    runs.forEach((r, i)=>{ if(done[r.key]) return; if(shard.length === 2 && i % shard[1] !== shard[0]) return; if(budget && Date.now() - t0 > budget){ left++; return; }
      let out; try{ out = measureLite(lab, r, G); }catch(e){ out = {key:r.key, kind:r.kind, ids:r.ids, ctx:r.ctx, b:r.b, error: String(e && e.stack || e).slice(0, 300)}; }
      out.G = G; fs.appendFileSync(ckOut, JSON.stringify(out) + '\n'); did++;
      console.log(`[${i + 1}/${runs.length}] ${r.kind} ${r.ids.join('+')} ${r.ctx}: ${out.error ? 'ERROR ' + out.error : `S ${out.S.all} (H ${out.S.H}, A ${out.S.A}, ±${out.S.se}) vs pool ${out.wr.pool} ${out.games} games`} · ${Math.round((Date.now() - t0) / 1000)}s`); });
    console.log(`${did} done this chunk, ${left} left for this shard`); process.exit(left ? 3 : 0);
  }
  if(args.includes('--report')){
    const sw = swData(), p = pairPlan(table), done = readJsonl(CK_PAIRS), scenDone = readJsonl(CK_SCEN);
    const results = p.runs.map(r=> done[r.key]).filter(Boolean), scen = scenarioPlan().map(r=> scenDone[r.key]).filter(Boolean);
    const missing = p.runs.filter(r=> !done[r.key]).length; if(missing) console.log(`warning: ${missing} planned runs have no result yet`);
    const rows = pairRows(p, results, sw), model = interactionModel(rows), scenEnt = scenarioEntries(table, scen);
    const single = id=> ctx=>{ const r = results.find(x=> x.kind === 'single' && x.ids[0] === id && x.ctx === ctx && !x.error); return r ? r.S.all : null; };
    const fieldSyn = FIELD_SYN.skills.map(id=>{ const s = single(id), pl = s('plain'), rn = s('rain'), td = s('tide'); return {id, plain: pl, rain: rn, tide: td, dRain: pl != null && rn != null ? r2(rn - pl) : null, dTide: pl != null && td != null ? r2(td - pl) : null}; });
    const applied = args.includes('--apply') ? applyScenario(JSON.parse(JSON.stringify(table)), scenEnt) : table;
    const cov = coverage(applied, scenEnt, p);
    const data = {generated: DAY, G: results.length ? results[0].G : null, games: results.reduce((t, r)=> t + (r.games || 0), 0) + scen.reduce((t, r)=> t + (r.games || 0), 0), ms: results.reduce((t, r)=> t + (r.ms || 0), 0) + scen.reduce((t, r)=> t + (r.ms || 0), 0),
      singles: results.filter(r=> r.kind === 'single').length, baseline: 'b2', top: p.top, leftOut: p.left, skipped: p.skipped, mixK: MIX_K, families: FAMILY,
      pairs: rows.map(r=> ({pair:r.pair, a:r.a, b:r.b, ctx:r.ctx, source:r.source, cards:r.cards, games:r.gamesPair, S:r.S, Sa:r.Sa, Sb:r.Sb, sumSingles:r.sum, interaction:r.I, ratio:r.ratio, se:r.se, z:r.z, confidence:r.conf, clamped:r.clamp, sumSW:r.swSum, interactionVsSW:r.Isw, wr:r.wr})),
      singlesRuns: results.filter(r=> r.kind === 'single').map(r=> ({id:r.ids[0], ctx:r.ctx, S:r.S.all, se:r.S.se, sw: swSingle(sw, r.ids[0], r.ctx), games:r.games})),
      fieldSyn, model, scenarios: scen, scenarioEntries: scenEnt, coverage: cov, results};
    fs.writeFileSync(OUT_JSON, JSON.stringify(data) + '\n');
    writeReport({table, plan:p, rows, model, scen, scenEnt, cov, sw, data});
    const sf = OUT_JSON.replace(/\.json$/, '.sheet.json'); fs.writeFileSync(sf, JSON.stringify(sheet({rows, model, scen, scenEnt, cov})));
    try{ require('child_process').execFileSync('python3', [path.join(__dirname, 'skill_worth_xlsx.py'), sf, OUT_MD.replace(/\.md$/, '.xlsx')], {stdio:'inherit'}); }finally{ fs.unlinkSync(sf); }
    if(args.includes('--apply')){ fs.writeFileSync(COSTS, SW.fmtTable(applied)); console.log('measuredS (scenarios) written to canonical/skill-costs.json (value unchanged)'); }
    console.log(`wrote ${path.relative(ROOT, OUT_MD)}, ${rows.length} pairs; model RMSE ${JSON.stringify(model.rmse)}`);
    process.exit(0);
  }
  console.log('usage: --plan | --scenarios | --pairs | --report [--apply]');
}
module.exports = {makeLab, measureLite, pairPlan, scenarioPlan, runScenario, scenarioEntries, pairRows, interactionModel, coverage, applyScenario, swSingle, valueOf, famOf, TRIGGER_SCEN, MIXED, TARGETED, NULL_ALONE, FAMILY, CONTEXTS, MIX_K};
