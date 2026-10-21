#!/usr/bin/env node
// Skill worth (2026-10-19, package SW, owner 00:19: "defining the N-worth of skills. Only way is to run experiments with test units
// with each skill to understand the impact of each skill — both in damage taken and damage avoided and damage done and units killed —
// e.g. arrow does low dmg but allows you a chance to snipe glass cannons.").
//
// An experiment harness on the game's own engine (bramblewood-engine.js makeSimEngine, both seats the Smart CPU with aiAim, Open
// battles, the stall rule and round cap of the reference fights in arena_app.js playReferenceGame). Every rule of the live engine
// applies as shipped (Revive a true death, the 5-layer trigger cap, Freeze / Confuse, no-op heals, True Strike vs a Legendary dodge,
// Prayer tokens ...): nothing here copies a rule.
//
//   test unit  = a vanilla baseline (b1 2/8 Wait 1, b2 4/14 Wait 2, b3 6/22 Wait 3; all Lumber 1, Common) + one skill (or one trigger
//                entry, one action under a reference trigger, Bounty N, a modifier). Its value is the one most live cards print
//                (pool cards skipped); skills that scale with N also run at 2-3 N on b2. Field-bound skills also run under their
//                field (Swimmer and Tide on a perma-tide, Darksight in the dark, Nocturnal at night ...).
//   decks      = 20 copies of the test unit, against (a) 20 vanilla baselines ("mirror") and (b) the reference pool: glass cannons
//                (high Attack, low Health), tanks, flyers, a 0-cost swarm and a mix of the four (+ swimmers on the tide), each
//                calibrated so the vanilla baseline wins about half its games. Seeds are shared (common random numbers): the test
//                deck and the vanilla deck play the same seeded games, sides alternate.
//   measured   = per copy of the unit on the field: damage done to units and to the bramble, damage taken, damage avoided (dodged,
//                missed by a blinded foe, soaked by Armor or Shield), kills, deaths, rounds survived, trigger firings; win rates.
//   worth      = the extra raw stats a vanilla unit needs to match the skilled unit. Head-to-head: bisection on the opponent's added
//                Health (and separately its added Attack) until the skilled deck wins 50% against vanilla + that much. Pool: the
//                skilled deck's mean win rate over the reference pool, inverted on the vanilla + ΔHealth / + ΔAttack curves against
//                the same pool. Budget v3 units (2A + H + S < N: 1 Health = 1, 1 Attack = 2): S_H = ΔHealth, S_A = 2 ΔAttack,
//                S = (S_H + S_A) / 2, the run's S = mean of head-to-head and pool. measuredS (in the entry's own units, what its
//                `value` would be) is fitted from the runs: × N for scale n, × (1 + N/2) for scale half, weight for triggers (On
//                Spawn = 1 by construction), value per point for actions.
//
//   node tools/skill_worth.js [--games=40] [--only=armor,arrow] [--quick] [--checkpoint=file.jsonl]   run the experiments
//        [--budget-s=540] [--shard=0/2] [--setups-only]   resumable chunks: the full run is
//        node tools/skill_worth.js --checkpoint=docs/balance/skill-worth-partial.jsonl --shard=i/2 --budget-s=540   (repeat until exit 0)
//   node tools/skill_worth.js --report [--apply] [--in=data.json]   write docs/skill-worth-2026-10-19.md (+ .xlsx via tools/skill_worth_xlsx.py)
//                                                  from docs/balance/skill-worth-2026-10-19.json; --apply writes measuredS into
//                                                  canonical/skill-costs.json (never `value`: the owner applies it in the hub)
'use strict';
const fs = require('fs'), path = require('path');
const ROOT = path.join(__dirname, '..');
const E = require(path.join(ROOT, 'bramblewood-engine.js'));
const SkillCosts = require(path.join(__dirname, 'skill_costs.js'));
// 2026-10-21 (package BF6; owner: "B11: a blanket halve [of skill numbers] might not balance it appropriately" and "Measure the worth of
// new skills. Remember that skills can be negative."): --world=half measures in the world BF5 made (N, the cards and the brambles halved,
// the skills' own numbers not): the baselines' stats halved (1/4 W1, 2/7 W2, 3/11 W3: the share of the halved N that 2/8, 4/14 and
// 6/22 had of v5's) and both brambles halved (50, the engine's 100 at BRAMBLE_SCALE 0.5). Its outputs are dated 2026-10-21; the
// 2026-10-19 run's files stay as they were.
const WORLD = ((typeof process !== 'undefined' && process.argv || []).find(a=> a.startsWith('--world=')) || '').slice(8) === 'half' ? 'half' : 'full';
const DAY = WORLD === 'half' ? '2026-10-21' : '2026-10-19';
const OUT_JSON = path.join(ROOT, 'docs', 'balance', `skill-worth-${DAY}.json`);
const OUT_MD = path.join(ROOT, 'docs', `skill-worth-${DAY}.md`);
const COSTS = path.join(ROOT, 'canonical', 'skill-costs.json');
const HQ = WORLD === 'half' ? {id:'sw-hq', health:50, effects:{}} : undefined;

const BASELINES = WORLD === 'half' ? [
  {id:'b1', attack:1, health:4, wait:1, cost:1},
  {id:'b2', attack:2, health:7, wait:2, cost:1},
  {id:'b3', attack:3, health:11, wait:3, cost:1},
] : [
  {id:'b1', attack:2, health:8, wait:1, cost:1},
  {id:'b2', attack:4, health:14, wait:2, cost:1},
  {id:'b3', attack:6, health:22, wait:3, cost:1},
];
// The fields a skill can depend on (engine rules flags; plain = the default: day all match, no field).
const CONTEXTS = {plain:{}, night:{phase:'night'}, tide:{permaTide:true}, dark:{dark:true}, rain:{field:'rain'}, heat:{field:'heatwave'}, frost:{field:'frozen'}, moon:{phase:'night', field:'moon'},
  // 2026-10-19 (package GI's three fields, for Field Breaker)
  spore:{sporeCloud:true}, thunder:{thunderstorm:2}, roots:{tangledRoots:true}};
const FIELD_OF = {nocturnal:'night', nocturnalHp:'night', nocturnalGrant:'night', nightblind:'night', moonborn:'moon', fullMoon:'moon', fullMoonGrant:'moon', illuminate:'night', lantern:'night',
  swimmer:'tide', swimmerGrant:'tide', tide:'tide', tideGrant:'tide', supremeTide:'tide', moonpull:'tide', wave:'tide', tsunami:'tide', bloomWhen:'night',
  darksight:'dark', keenSense:'dark', inherentDarkness:'dark', trueStrike:'dark', rainrunner:'rain', dry:'heat', mountainClimber:'frost'};
// Skills that also run under more fields (each on b2; the skill's worth is their mean).
const FIELDS_OF = {fieldBreaker:['thunder', 'spore', 'roots', 'heat']};
// Package GI (2026-10-19) skills sit only on pool cards, so their typical value is set here; the ones that need company get an
// enabler on the test unit and on its control (S = S(skill + enabler) − S(enabler)); Kin Rally / Pack Howl get a tribe deck.
const TYPICAL = {hunter:2, executioner:2, brittle:2, proliferate:1, prayerWard:1, fieldBreaker:2, detonate:true,
  // 2026-10-21 (BF6): skills no live card prints yet, at the engine's own default (SK3_DEF, EQ) or the owner's example (Injured)
  injured:2, vulnerable:2, banner:1, rally:1, herald:2, shieldwall:1, broodkeeper:1, amplifier:1, pry:1, hazardIce:1, hazardRubble:1, spotter:true};
const SKILL_ENABLER = {hunter:{poison:2}, detonate:{poison:2}, proliferate:{poison:2}, brittle:{shatter:2}, prayerWard:{prayer:1}};
const HUNTER_VS = [['bleed', {bleed:2}, 'plain'], ['exposed', {expose:1}, 'plain'], ['wet', {}, 'rain']];
// Skills that are a parameter of another (measured as the difference: parent + parameter − parent, on b2 in the parent's field).
const PARAM_OF = {crepuscularHp:'crepuscular', defianceN:'defiance', diurnalGrant:'diurnal', diurnalHp:'diurnal', espritHp:'esprit', fullMoonGrant:'fullMoon', loyalGrant:'loyal',
  nocturnalGrant:'nocturnal', nocturnalHp:'nocturnal', swarmN:'swarm', swimmerGrant:'swimmer', tideGrant:'tide', arrowCount:'arrow', bloomWhen:'bloom'};
// Why some entries can't be measured on plain test decks (the entry keeps its current S; the reason is written next to it).
const WHY = {
  prayer:'Prayer only pays with cards that need Prayer (prayerReq); a plain deck has none, so its worth is the deck\'s, not the unit\'s',
  leader:'Leader only matters for skirmish leaders (a fight setup), not a played unit',
  crepuscular:'Crepuscular acts only at twilight (the realtime clock maps)', crepuscularHp:'Crepuscular acts only at twilight (the realtime clock maps)',
  weakness:'Weakness (a damage type) needs a foe that deals that type; the plain decks deal physical damage only',
  hunterVs:'a parameter of Hunter (which status, no cost of its own); Hunter runs once per status (Poisoned, Bleeding, Exposed, Wet)',
  onAnyPlayed:'On Any Played has no engine hook yet (a reference value)',
  // 2026-10-21 (BF6)
  archerStyle:'a look only (bow or a dropped stone); no effect on play',
  vulnerable:'passive Vulnerable has no engine hook (the engine has the Vulnerable action only) and no card prints it: there is nothing to play; the owner\'s estimate stays',
  herald:'Herald only pays with a Leader on the board (a skirmish leader card), which a played test deck has none of',
};
// Triggers measured with "deal 2 damage to a random enemy"; actions under a reference trigger with the parameters live cards use most.
const REF_DAMAGE = {do:'damage', amount:2, dmgType:'physical', who:'enemy', sub:'random'};
const ACTION_REF = {
  damage:{on:'onSpawn', t:{amount:2, dmgType:'physical', who:'enemy', sub:'random'}}, missile:{on:'onSpawn', t:{amount:2}}, fireHit:{on:'onAttack', t:{amount:2}},
  heal:{on:'onAttack', t:{amount:2}}, rebuild:{on:'onSpawn', t:{amount:3}}, shield:{on:'onSpawn', t:{who:'ally', sub:'all', amount:2}}, cleanse:{on:'onAttack', t:{amount:1}},
  poison:{on:'onSpawn', t:{amount:2, who:'enemy', sub:'adjacent'}}, bleed:{on:'onSpawn', t:{amount:2, who:'enemy', sub:'random'}}, expose:{on:'onSpawn', t:{amount:2, who:'enemy', sub:'random'}},
  buff:{on:'onSpawn', t:{who:'self', amount:1}}, 'buff.amount2':{on:'onSpawn', t:{who:'self', amount2:2}}, debuff:{on:'onSpawn', t:{who:'enemy', sub:'adjacent', amount:1}},
  'debuff.amount2':{on:'onSpawn', t:{who:'enemy', sub:'adjacent', amount2:2}}, addWait:{on:'onSpawn', t:{amount:2, who:'enemy', sub:'adjacent'}},
  reduceWaitOfSpawned:{on:'onAllyPlayed', t:{amount:1}}, stun:{on:'onSpawn', t:{who:'enemy', sub:'adjacent'}}, stunPlayer:{on:'onSpawn', t:{count:1}},
  mindControl:{on:'onSpawn', t:{sub:'random'}}, swapPositions:{on:'onSpawn', t:{}}, drawCard:{on:'onSpawn', t:{count:1}}, spawnCard:{on:'onSpawn', t:{defId:'bee-swarmling', count:1}},
  exileGrave:{on:'onSpawn', t:{count:2}}, exile:{on:'onSpawn', t:{who:'enemy', sub:'random'}}, exileSelf:{on:'onDeath', t:{}}, gain:{on:'onSpawn', t:{amount:1, resource:'lumber'}},
  refine:{on:'perTurn', t:{amount:1}},
  // 2026-10-21 (BF6): package SK3's actions and EE's beam, which no live card prints as a trigger yet, at the parameters their keywords
  // use (the engine's sk3Trigs: Silence / Stymie / Exhaust / Petrify On Attack on the enemy facing it, Stench On Play on the area,
  // Corpsefeeder's devourGrave On Turn Start, Warcry's buffAll On Play) or the SK3 spells' (Smoke Screen 2, Magnet 2)
  duplicate:{on:'onSpawn', t:{who:'self'}}, devourGrave:{on:'perTurn', t:{amount:1}}, 'devourGrave.amount2':{on:'perTurn', t:{amount2:2}},
  buffAll:{on:'onSpawn', t:{who:'ally', amount:1}}, 'buffAll.amount2':{on:'onSpawn', t:{who:'ally', amount2:2}}, stench:{on:'onSpawn', t:{who:'enemy', sub:'area', amount:1}},
  silence:{on:'onAttack', t:{who:'enemy', sub:'adjacent', amount:2}}, stymie:{on:'onAttack', t:{who:'enemy', sub:'adjacent', amount:2}}, exhaust:{on:'onAttack', t:{who:'enemy', sub:'adjacent', amount:2}},
  petrify:{on:'onAttack', t:{who:'enemy', sub:'adjacent', amount:1}}, vulnerable:{on:'onSpawn', t:{who:'enemy', amount:2}}, barrage:{on:'onSpawn', t:{amount:1}},
  smokeScreen:{on:'onSpawn', t:{amount:2}}, magnet:{on:'onSpawn', t:{amount:2}}, positionBeam:{on:'onSpawn', t:{amount:2, dmgType:'physical'}},
};
// 2026-10-21 (BF6): a shorthand whose number is not its value (Spawner names the card it makes): its value at N
const SHORT_VAL = {spawner: n=> ({defId:'bee-swarmling', count:n})};
// A trigger that needs something else on the unit to fire at all: the enabler goes on both the test unit and its control.
const ENABLER = {onHealed:{regen:1}, onAllyHealed:{regen:1}};
// Engine keywords with no entry in the table (reported, not added).
const EXTRA = {antiAir:true};
const TRIBE = {kinRally:['Otter'], packHowl:['Wolf']}; // Kin Rally / Pack Howl (package GI shorthands): a tribe deck, every copy shares the type

const r2 = v=> Math.round(v * 100) / 100, r3 = v=> Math.round(v * 1000) / 1000;
function hashStr(s){ let h = 2166136261; for(let i = 0; i < s.length; i++){ h ^= s.charCodeAt(i); h = Math.imul(h, 16777619); } return h >>> 0; }
function liveDefs(){ const out = {}; JSON.parse(fs.readFileSync(path.join(ROOT, 'canonical', 'cards.json'), 'utf8')).filter(c=> !c.pool).forEach(c=>{ const d = Object.assign({effects:{}}, c); delete d.art; out[c.id] = d; }); return out; }
const sig = o=> JSON.stringify(o, Object.keys(flatKeys(o)).sort());
function flatKeys(o, acc){ acc = acc || {}; if(o && typeof o === 'object') Object.keys(o).forEach(k=>{ acc[k] = 1; flatKeys(o[k], acc); }); return acc; }

// ---------------------------------------------------------------------------------------------------------------------------
// The lab: defs, one game, a batch of games (with per-unit metrics when asked), calibration, curves, solves.
// ---------------------------------------------------------------------------------------------------------------------------
function makeLab(o){
  o = o || {};
  const G = o.games || 40, log = o.log || (()=>{}), defs = Object.assign({}, o.defs || liveDefs());
  let games = 0; const t0 = Date.now();
  function unit(id, b, extra){ extra = extra || {};
    const d = {id, name:id, icon:'🧪', cost: extra.cost != null ? extra.cost : b.cost, wait: extra.wait != null ? extra.wait : b.wait, attack: Math.max(0, b.attack + (extra.da || 0)),
      health: Math.max(1, b.health + (extra.dh || 0)), rarity: extra.rarity || 'common', effects: JSON.parse(JSON.stringify(extra.effects || {})), test:true};
    if(extra.archetypes) d.archetypes = extra.archetypes;
    defs[id] = d; return id; }
  function vanilla(b, dh, da){ return unit(`sw-${b.id}-v${dh ? 'h' + dh : ''}${da ? 'a' + da : ''}`, b, {dh, da}); }
  function play(deckA, deckB, rules, seed, rec){
    const engine = E.makeSimEngine(defs, E.mulberry32(seed >>> 0), {recordEvents: !!rec, battleMode:'open', rules: rules || {}, aiAim:true, aiLevel:1});
    const sideOf = id=> id === 1 ? 'A' : 'B', stats = {}, ev = rec ? [] : null;
    const P = {1: engine.newPlayer(1, deckA, HQ), 2: engine.newPlayer(2, deckB, HQ)}; // BF6: HQ is the halved bramble under --world=half
    engine.draw(P[1], 3, 'A', stats, ev); engine.draw(P[2], 3, 'B', stats, ev);
    let r = 1, over = false, last = null, st = 0;
    for(; r <= E.DRAW_ROUND_CAP && !over; r++){
      if(rec) ev.push({type:'roundStart', round:r});
      engine.setSuddenDeath(r >= E.SUDDEN_DEATH_ROUND, r >= E.SUDDEN_DEATH_CASTLE_ROUND ? 2 : 1);
      [1, 2].forEach(p=>{ P[p].playedThisTurn = false; P[p].discardUsedThisTurn = false; });
      if(r > 1) engine.roundStart(P, r, sideOf, stats, ev);
      engine.aiTakeTurn(P, sideOf, 1, stats, ev); engine.aiTakeTurn(P, sideOf, 2, stats, ev);
      over = engine.resolveCombat(P, sideOf, stats, ev, r % 2 === 0 ? 1 : 2); if(over) break;
      const s = E.boardSignature(P); st = (s === last && E.noActionsLeft(P)) ? st + 1 : 0; last = s; if(st >= 2 && r >= E.STALL_DRAW_FROM_ROUND) break;
      engine.draw(P[1], 1, 'A', stats, ev); engine.draw(P[2], 1, 'B', stats, ev);
    }
    games++;
    const a = P[1].hq.hp <= 0, bb = P[2].hq.hp <= 0;
    return {winner: over && bb && !a ? 1 : over && a && !bb ? 2 : 0, rounds: Math.min(r, E.DRAW_ROUND_CAP), stats, events: ev};
  }
  // Per-copy metrics of `testId` on `side` from one recorded game.
  function addMetrics(m, res, side, testId){
    const st = res.stats[side + '|' + testId] || {}, uids = new Set(), enter = {}, gone = {}; let round = 1, copies = 0;
    const atkOf = id=> (defs[id] && defs[id].attack) || 0;
    res.events.forEach(e=>{
      if(e.type === 'roundStart'){ round = e.round; return; }
      if((e.type === 'play' || e.type === 'spawn') && e.side === side && e.defId === testId){ const list = e.type === 'play' ? [e.uid] : (e.uids || (e.placements || []).map(p=> p.uid));
        list.forEach(u=>{ if(u == null || uids.has(u)) return; uids.add(u); enter[u] = round; copies++; }); return; }
      if(e.type === 'death' && uids.has(e.uid) && gone[e.uid] == null){ gone[e.uid] = round; return; }
      if(e.type === 'triggerFired' && uids.has(e.uid)){ m.fires++; return; }
      if(e.type === 'evaded' || e.type === 'blindMiss'){ if(uids.has(e.targetUid)) m.avoided += atkOf(e.attDefId); if(uids.has(e.attUid)) m.misses++; return; }
      if(e.type === 'hit' && uids.has(e.targetUid)){ m.avoided += (e.armorSoaked || 0); return; }
      if(e.type === 'shieldSoak' && uids.has(e.uid)){ m.avoided += (e.soaked || 0); return; }
      if(e.type === 'deflect' && uids.has(e.uid)){ m.avoided += 1; return; }
      if(e.type === 'confusedWhiff' && uids.has(e.uid)){ m.misses++; return; }
    });
    uids.forEach(u=>{ m.survival += ((gone[u] != null ? gone[u] : res.rounds) - enter[u] + 1); });
    m.copies += copies; m.dealtUnits += Math.max(0, (st.dealt || 0) - (st.faceDamage || 0)); m.dealtBramble += (st.faceDamage || 0); m.taken += (st.taken || 0);
    m.kills += (st.kills || 0); m.deaths += (st.deaths || 0); m.games++; m.rounds += res.rounds;
  }
  const blankM = ()=> ({games:0, copies:0, dealtUnits:0, dealtBramble:0, taken:0, avoided:0, kills:0, deaths:0, survival:0, fires:0, misses:0, rounds:0});
  function finishM(m){ const c = Math.max(1, m.copies), f = v=> r2(v / c);
    return {games:m.games, copiesPerGame: r2(m.copies / Math.max(1, m.games)), dealtUnits:f(m.dealtUnits), dealtBramble:f(m.dealtBramble), taken:f(m.taken), avoided:f(m.avoided),
      kills:f(m.kills), deaths:f(m.deaths), survival:f(m.survival), fires:f(m.fires), misses:f(m.misses), gameRounds: r2(m.rounds / Math.max(1, m.games))}; }
  // n seeded games of deck T (testId's) against deck O; T alternates sides. Seeds depend on `key` only (common random numbers).
  function batch(testId, T, O, ctx, key, n, rec){
    n = n || G; let w = 0, l = 0, d = 0; const m = rec ? blankM() : null, rules = CONTEXTS[ctx] || {}, base = hashStr(key + '|' + ctx);
    for(let g = 0; g < n; g++){
      const mineFirst = g % 2 === 0, res = play(mineFirst ? T : O, mineFirst ? O : T, rules, base + g * 7919, rec), me = mineFirst ? 1 : 2;
      if(res.winner === me) w++; else if(res.winner === 0) d++; else l++;
      if(rec) addMetrics(m, res, mineFirst ? 'A' : 'B', testId);
    }
    return {wr: (w + d / 2) / n, w, l, d, n, m: m ? finishM(m) : null};
  }
  const deckOf = id=> ({[id]: 20});
  // Reference opponents per baseline, calibrated (plain field) so the vanilla baseline wins about half.
  const KINDS = {
    glass: b=> ({attack: 2 * b.attack + 1, wait: b.wait, cost: b.cost, lo:1, hi: b.health}),
    tank:  b=> ({attack: Math.max(1, Math.round(b.attack / 2)), wait: b.wait, cost: b.cost, lo: b.health, hi: 6 * b.health}),
    flyer: b=> ({attack: b.attack, wait: b.wait, cost: b.cost, fx:{flying:true}, lo:1, hi: 3 * b.health}),
    swarm: b=> ({attack: Math.max(1, Math.round(b.attack / 2)), wait: 0, cost: 0, lo:1, hi: 2 * b.health}),
    swimmer: b=> ({attack: b.attack, wait: b.wait, cost: b.cost, fx:{swimmer:true}, lo:1, hi: 3 * b.health, ctx:'tide'}),
  };
  const refCache = {};
  function refDef(b, kind, h){ const k = KINDS[kind](b); return unit(`sw-${b.id}-${kind}-h${h}`, {attack:k.attack, health:h, wait:k.wait, cost:k.cost}, {effects:k.fx}); }
  function calibrate(b, kind, inCtx){ // in its own field (each field calibrates its own pool)
    const k = KINDS[kind](b), ctx = k.ctx || inCtx || 'plain', key = b.id + ':' + kind + ':' + ctx; if(refCache[key]) return refCache[key];
    const v = vanilla(b, 0, 0), ev = {};
    const at = h=> ev[h] != null ? ev[h] : (ev[h] = batch(v, deckOf(v), deckOf(refDef(b, kind, h)), ctx, 'cal:' + key, 2 * G).wr);
    let lo = k.lo, hi = k.hi; // vanilla's win rate falls as the ref's Health rises
    if(at(lo) <= 0.5) hi = lo; else if(at(hi) >= 0.5) lo = hi;
    while(hi - lo > 1){ const mid = Math.floor((lo + hi) / 2); if(at(mid) > 0.5) lo = mid; else hi = mid; }
    const h = Math.abs(at(lo) - 0.5) <= Math.abs(at(hi) - 0.5) ? lo : hi;
    log(`  calibrated ${b.id} ${kind} (${ctx}): ${k.attack}/${h} (vanilla ${Math.round(at(h) * 100)}%)`);
    return (refCache[key] = {id: refDef(b, kind, h), attack:k.attack, health:h, wait:k.wait, cost:k.cost, vanillaWr: at(h), ctx});
  }
  // The mix (5 of each calibrated kind) is far stronger than its parts, so it gets its own calibration: one Health offset k on all four.
  function calibrateMixed(b, ctx){
    ctx = ctx || 'plain'; const key = b.id + ':mixed:' + ctx; if(refCache[key]) return refCache[key];
    const parts = ['glass', 'tank', 'flyer', 'swarm'].map(k=> [k, calibrate(b, k, ctx)]), v = vanilla(b, 0, 0), ev = {};
    const deckAt = k=>{ const d = {}; parts.forEach(([kind, c])=> d[refDef(b, kind, Math.max(1, c.health + k))] = 5); return d; };
    const at = k=> ev[k] != null ? ev[k] : (ev[k] = batch(v, deckOf(v), deckAt(k), ctx, 'cal:' + key, 2 * G).wr);
    let lo = -(Math.min(...parts.map(([, c])=> c.health)) - 1), hi = 2 * b.health;
    if(at(lo) <= 0.5) hi = lo; else if(at(hi) >= 0.5) lo = hi;
    while(hi - lo > 1){ const mid = Math.floor((lo + hi) / 2); if(at(mid) > 0.5) lo = mid; else hi = mid; }
    const k = Math.abs(at(lo) - 0.5) <= Math.abs(at(hi) - 0.5) ? lo : hi;
    log(`  calibrated ${b.id} mixed (${ctx}): Health ${k >= 0 ? '+' : ''}${k} on each kind (vanilla ${Math.round(at(k) * 100)}%)`);
    return (refCache[key] = {deck: deckAt(k), offset:k, vanillaWr: at(k)});
  }
  // The opponents for a field and baseline: mirror + the reference pool.
  const setups = {};
  // 2026-10-19 (the first full run was lost to a container restart): a built setup (calibrated opponents, the vanilla + Δ curves,
  // the vanilla unit's metrics) is saved to o.setupDir and read back, so a resumed or parallel run doesn't rebuild it. It is
  // deterministic (seeded), so a restored setup is the one the run would have built.
  const setupFile = key=> o.setupDir ? path.join(o.setupDir, key.replace(':', '-') + `-g${G}.json`) : null;
  function restore(ctx, b, key){
    const f = setupFile(key); if(!f || !fs.existsSync(f)) return null;
    let s; try{ s = JSON.parse(fs.readFileSync(f, 'utf8')); }catch(e){ return null; }
    const kinds = Object.keys(s.cal).filter(k=> k !== 'mixed'), refs = {};
    kinds.forEach(k=> refs[k] = deckOf(refDef(b, k, s.cal[k].health)));
    const mixed = {}; ['glass', 'tank', 'flyer', 'swarm'].forEach(k=> mixed[refDef(b, k, Math.max(1, s.cal[k].health + s.cal.mixed.offset))] = 5); refs.mixed = mixed;
    log(`  setup ${key}: restored from ${path.relative(ROOT, f)}`);
    return (setups[key] = {ctx, b, v: vanilla(b, 0, 0), refs, pool: Object.keys(refs), curves: s.curves, vm: s.vm, gridH: s.gridH, gridA: s.gridA, cal: s.cal});
  }
  function setup(ctx, b){
    const key = ctx + ':' + b.id; if(setups[key]) return setups[key];
    const got = restore(ctx, b, key); if(got) return got;
    const built = buildSetup(ctx, b, key), f = setupFile(key);
    if(f){ fs.mkdirSync(path.dirname(f), {recursive:true}); fs.writeFileSync(f + '.tmp', JSON.stringify({cal: built.cal, curves: built.curves, vm: built.vm, gridH: built.gridH, gridA: built.gridA})); fs.renameSync(f + '.tmp', f); }
    return built;
  }
  function buildSetup(ctx, b, key){
    const kinds = ['glass', 'tank', 'flyer', 'swarm'].concat(ctx === 'tide' ? ['swimmer'] : []);
    const refs = {}; kinds.forEach(k=>{ const c = calibrate(b, k, ctx); refs[k] = deckOf(c.id); });
    refs.mixed = calibrateMixed(b, ctx).deck;
    const v = vanilla(b, 0, 0), pool = Object.keys(refs);
    // vanilla + Δ curves against the mirror and each reference deck
    const H = b.health, A = b.attack;
    const gridH = [...new Set([-0.75, -0.5, -0.25, 0, 0.125, 0.25, 0.375, 0.5, 0.75, 1, 1.5, 2, 3, 4, 5].map(f=> Math.max(-(H - 1), Math.round(f * H))))].sort((x, y)=> x - y);
    const gridA = [...new Set([-1, -0.5, 0, 0.25, 0.5, 0.75, 1, 1.5, 2, 3, 4].map(f=> Math.max(-A, Math.round(f * A))))].sort((x, y)=> x - y);
    const curves = {h:{}, a:{}};
    ['mirror'].concat(pool).forEach(r=>{ const O = r === 'mirror' ? deckOf(v) : refs[r];
      curves.h[r] = gridH.map(d=>{ const id = vanilla(b, d, 0); return {d, wr: batch(id, deckOf(id), O, ctx, `vs:${r}:${b.id}`, G).wr}; });
      curves.a[r] = gridA.map(d=>{ const id = vanilla(b, 0, d); return {d, wr: batch(id, deckOf(id), O, ctx, `vs:${r}:${b.id}`, G).wr}; }); });
    ['h', 'a'].forEach(s=>{ curves[s].pool = curves[s][pool[0]].map((p, i)=> ({d:p.d, wr: pool.reduce((t, r)=> t + curves[s][r][i].wr, 0) / pool.length})); });
    // the vanilla unit's own metrics (rec) against the mirror and the pool, for the deltas
    const vm = {mirror: batch(v, deckOf(v), deckOf(v), ctx, `vs:mirror:${b.id}`, G, true)}; pool.forEach(r=> vm[r] = batch(v, deckOf(v), refs[r], ctx, `vs:${r}:${b.id}`, G, true));
    log(`  setup ${key}: pool ${pool.join(', ')}; vanilla vs pool ${pool.map(r=> Math.round(vm[r].wr * 100) + '%').join(' ')}`);
    return (setups[key] = {ctx, b, v, refs, pool, curves, vm, gridH, gridA, cal: Object.assign(Object.fromEntries(kinds.map(k=> [k, (({attack, health, wait, cost, vanillaWr})=> ({attack, health, wait, cost, vanillaWr:r3(vanillaWr)}))(calibrate(b, k, ctx))])), {mixed: {offset: calibrateMixed(b, ctx).offset, vanillaWr: r3(calibrateMixed(b, ctx).vanillaWr)}})});
  }
  // Isotonic (non-decreasing) fit, then the Δ where the curve reaches wr. {d, clamp: '<' | '>' | null}
  function invert(curve, wr){
    const pts = curve.map(p=> ({d:p.d, y:p.wr, w:1})), out = [];
    pts.forEach(p=>{ out.push({d0:p.d, d1:p.d, y:p.y, w:1}); while(out.length > 1 && out[out.length - 2].y > out[out.length - 1].y){ const b2 = out.pop(), a2 = out.pop(); out.push({d0:a2.d0, d1:b2.d1, y:(a2.y * a2.w + b2.y * b2.w) / (a2.w + b2.w), w:a2.w + b2.w}); } });
    const knots = out.map(s=> ({d:(s.d0 + s.d1) / 2, y:s.y}));
    if(wr <= knots[0].y) return {d: knots[0].y === wr ? knots[0].d : curve[0].d, clamp: wr < knots[0].y ? '<' : null};
    const L = knots[knots.length - 1]; if(wr >= L.y) return {d: L.y === wr ? L.d : curve[curve.length - 1].d, clamp: wr > L.y ? '>' : null};
    for(let i = 1; i < knots.length; i++){ const a = knots[i - 1], c = knots[i]; if(wr <= c.y) return {d: a.d + (c.d - a.d) * (wr - a.y) / Math.max(1e-9, c.y - a.y), clamp:null}; }
    return {d: L.d, clamp:null};
  }
  // Head-to-head solve: the opponent's added stat at which deck T wins half. f falls as the opponent grows.
  function solve(S, testId, T, stat, wr0){
    const b = S.b, lo = stat === 'h' ? -(b.health - 1) : -b.attack, hi = stat === 'h' ? 5 * b.health : 5 * b.attack;
    const cache = {0: wr0}, f = k=>{ if(cache[k] == null){ const id = stat === 'h' ? vanilla(b, k, 0) : vanilla(b, 0, k); cache[k] = batch(testId, T, deckOf(id), S.ctx, `vs:mirror:${b.id}`, G).wr; } return cache[k]; };
    const slope0 = (()=>{ const c = S.curves[stat].mirror, i = c.findIndex(p=> p.d === 0), a = c[Math.max(0, i - 1)], z = c[Math.min(c.length - 1, i + 1)]; return Math.max(0.01, (z.wr - a.wr) / Math.max(1, z.d - a.d)); })();
    if(Math.abs(wr0 - 0.5) < 0.04){ const d = (wr0 - 0.5) / slope0; return {d, se: 0.5 / Math.sqrt(G) / slope0, evals:0, approx:true, clamp:null}; }
    const guess = Math.round(invert(S.curves[stat].mirror, wr0).d) || (wr0 > 0.5 ? 1 : -1);
    let a, z, clamp = null; // f(a) > .5 >= f(z), z = a + 1 at the end
    if(wr0 > 0.5){ a = 0; z = Math.min(hi, Math.max(1, guess)); while(f(z) > 0.5){ if(z >= hi){ clamp = '>'; break; } a = z; z = Math.min(hi, z * 2); } }
    else { z = 0; a = Math.max(lo, Math.min(-1, guess)); while(f(a) <= 0.5){ if(a <= lo){ clamp = '<'; break; } z = a; a = Math.max(lo, a * 2); } }
    if(clamp) return {d: clamp === '>' ? hi : lo, se:null, evals: Object.keys(cache).length - 1, approx:false, clamp};
    while(z - a > 1){ const mid = Math.floor((a + z) / 2); if(f(mid) > 0.5) a = mid; else z = mid; }
    const fa = f(a), fz = f(z), slope = Math.max(0.01, fa - fz), d = a + (fa - 0.5) / slope;
    return {d, se: 0.5 / Math.sqrt(G) / Math.max(slope, slope0 / 2), evals: Object.keys(cache).length - 1, approx:false, clamp};
  }
  // One measurement: a unit = baseline + `effects` (+ extra def fields), in field ctx.
  function measure(run){
    const b = BASELINES.find(x=> x.id === run.b), S = setup(run.ctx, b);
    const id = unit('sw-t-' + hashStr(JSON.stringify(run)).toString(36), b, {effects: run.effects, archetypes: run.archetypes, rarity: run.rarity}), T = deckOf(id);
    const t = Date.now(), g0 = games;
    const h2h0 = batch(id, T, deckOf(S.v), S.ctx, `vs:mirror:${b.id}`, G, true);
    const refRes = {}; S.pool.forEach(r=> refRes[r] = batch(id, T, S.refs[r], S.ctx, `vs:${r}:${b.id}`, G, true));
    const sh = solve(S, id, T, 'h', h2h0.wr), sa = solve(S, id, T, 'a', h2h0.wr);
    const poolWr = S.pool.reduce((s, r)=> s + refRes[r].wr, 0) / S.pool.length;
    const ih = invert(S.curves.h.pool, poolWr), ia = invert(S.curves.a.pool, poolWr);
    const per = {}; S.pool.forEach(r=>{ const xh = invert(S.curves.h[r], refRes[r].wr), xa = invert(S.curves.a[r], refRes[r].wr); per[r] = {wr: r3(refRes[r].wr), vanillaWr: r3(S.vm[r].wr), dh: r2(xh.d), da: r2(xa.d), S: r2((xh.d + 2 * xa.d) / 2), clamp: xh.clamp || xa.clamp || null}; });
    // a side whose solve ran off its range only bounds the worth: the run's S then leans on the other side
    const Sh2h = (sh.d + 2 * sa.d) / 2, Sref = (ih.d + 2 * ia.d) / 2, hc = !!(sh.clamp || sa.clamp), rc = !!(ih.clamp || ia.clamp);
    const Sall = hc === rc ? (Sh2h + Sref) / 2 : hc ? Sref : Sh2h;
    const seH = sh.se == null ? null : sh.se, seA = sa.se == null ? null : sa.se;
    const se = seH == null || seA == null ? null : r2(Math.sqrt(seH * seH + 4 * seA * seA) / 2 / Math.SQRT2 + Math.abs(Sh2h - Sref) / 4);
    const metric = (m, v)=> Object.fromEntries(Object.keys(m).map(k=> [k, typeof m[k] === 'number' ? r2(m[k] - (v[k] || 0)) : m[k]]));
    const out = {key: run.key, kind: run.kind, id: run.id, label: run.label || run.id, value: run.value, n: run.n, ctx: run.ctx, b: run.b, effects: run.effects,
      wr: {mirror: r3(h2h0.wr), pool: r3(poolWr)}, vanillaWr: {mirror: r3(S.vm.mirror.wr), pool: r3(S.pool.reduce((s, r)=> s + S.vm[r].wr, 0) / S.pool.length)},
      h2h: {dh: r2(sh.d), da: r2(sa.d), seH: seH == null ? null : r2(seH), seA: seA == null ? null : r2(seA), clamp: sh.clamp || sa.clamp || null, approx: sh.approx && sa.approx, evals: sh.evals + sa.evals},
      ref: {dh: r2(ih.d), da: r2(ia.d), clamp: ih.clamp || ia.clamp || null, per},
      S: {h2h: r2(Sh2h), ref: r2(Sref), all: r2(Sall), H: r2((sh.d + ih.d) / 2), A: r2(sa.d + ia.d), se},
      metrics: {mirror: h2h0.m, pool: poolMetrics(S.pool.map(r=> refRes[r].m))}, delta: null, games: games - g0, ms: Date.now() - t};
    const vPool = poolMetrics(S.pool.map(r=> S.vm[r].m));
    out.delta = {mirror: metric(h2h0.m, S.vm.mirror.m), pool: metric(out.metrics.pool, vPool)};
    delete defs[id];
    return out;
  }
  function poolMetrics(list){ const out = {}; Object.keys(list[0]).forEach(k=> out[k] = r2(list.reduce((s, m)=> s + m[k], 0) / list.length)); return out; }
  return {G, defs, unit, vanilla, play, batch, setup, calibrate, invert, solve, measure, stats: ()=> ({games, ms: Date.now() - t0})};
}

// ---------------------------------------------------------------------------------------------------------------------------
// What to measure: every entry of canonical/skill-costs.json (+ engine keywords with no entry), at typical values from live cards.
// ---------------------------------------------------------------------------------------------------------------------------
const numOf = v=> typeof v === 'number' ? v : (Array.isArray(v) ? v.reduce((a, b)=> a + (+b || 0), 0) : 0);
function census(defs){
  const vals = {}, trig = {};
  Object.values(defs).filter(d=> !d.token && !d.test && !d.pool).forEach(d=> Object.entries(d.effects || {}).forEach(([k, v])=>{
    if(k === 'triggers'){ (Array.isArray(v) ? v : []).forEach(t=>{ if(t){ const s = JSON.stringify(t); trig[s] = (trig[s] || 0) + 1; } }); return; }
    const s = JSON.stringify(v); (vals[k] = vals[k] || {})[s] = (vals[k][s] || 0) + 1; }));
  return {vals, trig};
}
function typicalOf(cs, id){ const m = cs.vals[id]; if(!m) return null; return JSON.parse(Object.entries(m).sort((a, b)=> b[1] - a[1] || a[0].localeCompare(b[0]))[0][0]); }
function plan(table, defs, o){
  o = o || {}; const cs = census(defs), runs = [], bs = o.baselines || BASELINES.map(b=> b.id), mid = o.mid || 'b2';
  const add = (r, onB)=> (onB || bs).forEach(b=>{ const x = Object.assign({}, r, {b}); x.key = [x.kind, x.id, x.n == null ? '' : x.n, x.ctx, b, x.tag || ''].join('|'); runs.push(x); });
  const skillVal = (e)=>{ if(TYPICAL[e.id] != null) return TYPICAL[e.id]; const t = typicalOf(cs, e.id); if(t != null) return t; return e.scale === 'n' ? (e.payDefault || 2) : true; };
  const archOf = v=> v && typeof v === 'object' && !Array.isArray(v) && typeof v.type === 'string' ? [v.type] : undefined;
  (table.skills || []).forEach(e=>{
    if(PARAM_OF[e.id]){ // parent + parameter, from a live card that carries both (b2, the parent's field)
      const card = Object.values(defs).find(d=> !d.pool && d.effects && d.effects[e.id] != null && d.effects[PARAM_OF[e.id]] != null);
      const parent = PARAM_OF[e.id], pv = card ? card.effects[parent] : skillVal({id:parent, scale:'half'}), v = card ? card.effects[e.id] : skillVal(e), ctx = FIELD_OF[parent] || FIELD_OF[e.id] || 'plain';
      add({kind:'param', id:e.id, parent, tag:'base', value:pv, effects:{[parent]:pv}, ctx}, [mid]);
      add({kind:'param', id:e.id, parent, tag:'with', value:v, n: numOf(v) || null, effects:{[parent]:pv, [e.id]:v}, ctx}, [mid]);
      return; }
    if(WHY[e.id]) return;
    const v = skillVal(e), legendary = !!e.legendary, en = SKILL_ENABLER[e.id];
    const base = {kind:'skill', id:e.id, scale:e.scale, value:v, n: numOf(v) || (v === true ? 1 : null), effects: Object.assign({}, en || {}, {[e.id]:v}), archetypes: archOf(v), rarity: legendary ? 'legendary' : undefined};
    const ctl = (ctx, onB, tag, enab)=> add({kind:'skill', id:e.id, tag: tag || 'enabler', value: enab || en, effects: Object.assign({}, enab || en), ctx}, onB);
    add(Object.assign({ctx:'plain'}, base)); if(en) ctl('plain');
    if(FIELD_OF[e.id]){ add(Object.assign({}, base, {ctx: FIELD_OF[e.id]}), [mid]); if(en) ctl(FIELD_OF[e.id], [mid]); }
    (FIELDS_OF[e.id] || []).forEach(ctx=>{ add(Object.assign({}, base, {ctx, tag:'field'}), [mid]); if(en) ctl(ctx, [mid]); });
    if(e.id === 'hunter') HUNTER_VS.forEach(([vs, enab, ctx])=>{ add(Object.assign({}, base, {ctx, tag:'vs-' + vs, effects: Object.assign({}, enab, {hunter:v, hunterVs:vs})}), [mid]);
      ctl(ctx, [mid], 'enabler-' + vs, enab); });
    // N scaling: numbers 1 / typical / the largest a live card prints (or 1, 2, 4), on b2
    if((e.scale === 'n' || e.scale === 'half') && (typeof v === 'number' || (v === true && e.scale === 'n'))){
      const seen = Object.keys(cs.vals[e.id] || {}).map(s=> JSON.parse(s)).filter(x=> typeof x === 'number');
      const tv = typeof v === 'number' ? v : (e.payDefault || 2), mx = seen.length ? Math.max(...seen) : 4;
      [...new Set([1, 2, tv, Math.max(mx, tv + 1)].map(x=> Math.abs(x)))].filter(x=> x !== tv).slice(0, 2).forEach(n=>{
        const nv = n; add(Object.assign({}, base, {value:nv, n:nv, effects: Object.assign({}, en || {}, {[e.id]:nv}), ctx: FIELD_OF[e.id] || 'plain', tag:'n' + nv}), [mid]); });
      if(en && FIELD_OF[e.id]) ; // the field control above serves the variants
    }
  });
  (table.triggers || []).forEach(e=>{
    if(e.id === 'bounty' || e.inEngine === false) return;
    const t = Object.assign({on:e.id}, REF_DAMAGE), en = ENABLER[e.id];
    add({kind:'trigger', id:e.id, value:t, effects: Object.assign({}, en || {}, {triggers:[t]}), ctx:'plain'});
    if(en) add({kind:'trigger', id:e.id, tag:'enabler', value:en, effects: Object.assign({}, en), ctx:'plain'});
  });
  (table.actions || []).forEach(e=>{
    const ref = ACTION_REF[e.id]; if(!ref) return;
    const t = Object.assign({on:ref.on, do:e.id.split('.')[0]}, ref.t);
    add({kind:'action', id:e.id, value:t, effects:{triggers:[t]}, ctx:'plain', refOn: ref.on, per: e.per ? (ref.t[e.per] != null ? ref.t[e.per] : 1) : 1});
  });
  // modifiers: sub All, one side's On Turn Start, Once
  add({kind:'modifier', id:'subAll', value:{on:'onSpawn', do:'damage', amount:2, who:'enemy', sub:'all'}, effects:{triggers:[{on:'onSpawn', do:'damage', amount:2, dmgType:'physical', who:'enemy', sub:'all'}]}, ctx:'plain'});
  add({kind:'modifier', id:'turnOfOne', value:{on:'perTurn', turnOf:'self'}, effects:{triggers:[Object.assign({on:'perTurn', turnOf:'self'}, REF_DAMAGE)]}, ctx:'plain'});
  add({kind:'modifier', id:'onceCap', value:{on:'onAttack', once:true}, effects:{triggers:[Object.assign({on:'onAttack', once:true}, REF_DAMAGE)]}, ctx:'plain'});
  // shorthand: Bounty N
  Object.keys(table.shorthands || {}).forEach(k=>{ [1, 2].forEach(n=> add({kind:'shorthand', id:k, value:n, n, effects:{[k]: SHORT_VAL[k] ? SHORT_VAL[k](n) : n}, archetypes: TRIBE[k], ctx:'plain', tag:'n' + n}, n === 1 ? bs : [mid]));
    // the tribe deck's own control (same type, no skill), so the skill's S is the skill's and not the type's
    if(TRIBE[k]) add({kind:'shorthand', id:k, tag:'enabler', value:TRIBE[k], effects:{}, archetypes:TRIBE[k], ctx:'plain'}); });
  // the trigger entries live cards use most (trigger × action as printed), b2
  Object.entries(cs.trig).sort((a, b)=> b[1] - a[1]).slice(0, o.combos == null ? 10 : o.combos).forEach(([s, cnt])=>{ const t = JSON.parse(s);
    add({kind:'combo', id: t.on + '→' + t.do, value:t, effects:{triggers:[t]}, ctx:'plain', uses:cnt, tag: hashStr(s).toString(36)}, [mid]); });
  Object.entries(EXTRA).forEach(([k, v])=> add({kind:'extra', id:k, value:v, n:1, effects:{[k]:v}, ctx:'plain'}, [mid]));
  return runs;
}

// ---------------------------------------------------------------------------------------------------------------------------
// From runs to measuredS per table entry.
// ---------------------------------------------------------------------------------------------------------------------------
function aggregate(table, results){
  const SC = SkillCosts.make(table), by = {}; results.forEach(r=> (by[r.kind + ':' + r.id] = by[r.kind + ':' + r.id] || []).push(r));
  const mean = xs=> xs.length ? xs.reduce((a, b)=> a + b, 0) / xs.length : null;
  const rowsOf = k=> (by[k] || []).filter(r=> !r.error);
  const conf = (list, S)=>{ const ses = list.map(r=> r.S.se).filter(x=> x != null), clamp = list.some(r=> r.h2h.clamp || r.ref.clamp);
    const spread = list.length > 1 ? Math.max(...list.map(r=> r.S.all)) - Math.min(...list.map(r=> r.S.all)) : 0, se = ses.length ? mean(ses) / Math.sqrt(ses.length) : null;
    // off the scale (2026-10-19): every run's head-to-head and pool solves both ran off their range, so S is only the bound
    const off = list.length > 0 && list.every(r=> r.h2h.clamp && r.ref.clamp) ? (list.every(r=> r.h2h.clamp === '>' || r.ref.clamp === '>') ? '>' : '<') : null;
    const noise = se == null ? 99 : se; return {se: se == null ? null : r2(se), spread: r2(spread), level: clamp ? 'low' : noise <= Math.max(0.6, Math.abs(S) * 0.25) ? 'high' : noise <= Math.max(1.5, Math.abs(S) * 0.5) ? 'medium' : 'low', clamp, off}; };
  // trigger weights: S(trigger, deal 2) / S(On Spawn, deal 2), per baseline then averaged
  const onSpawnS = {}; rowsOf('trigger:onSpawn').forEach(r=> onSpawnS[r.b] = r.S.all);
  const trigW = {};
  const entries = {skills:{}, triggers:{}, actions:{}, modifiers:{}, extra:{}};
  (table.triggers || []).forEach(e=>{
    if(WHY[e.id]){ entries.triggers[e.id] = {why: WHY[e.id]}; return; }
    if(e.id === 'bounty'){ const list = rowsOf('shorthand:bounty'); if(!list.length){ entries.triggers[e.id] = {why:'not measured'}; return; }
      const w = mean(list.map(r=> r.S.all / Math.max(1, r.n))); entries.triggers[e.id] = {measuredS: r2(w), at: list.map(r=> ({b:r.b, n:r.n, S:r.S.all})), conf: conf(list, w), how:'S(Bounty N) / N (Gain at its current value 1)'}; return; }
    const list = rowsOf('trigger:' + e.id).filter(r=> !String(r.key).endsWith('|enabler')), en = rowsOf('trigger:' + e.id).filter(r=> String(r.key).endsWith('|enabler'));
    if(!list.length){ entries.triggers[e.id] = {why:'not measured'}; return; }
    const fires = mean(list.map(r=> (r.metrics.mirror.fires + r.metrics.pool.fires) / 2));
    const ws = list.map(r=>{ const base = en.find(x=> x.b === r.b), S = r.S.all - (base ? base.S.all : 0), d = onSpawnS[r.b]; return d && Math.abs(d) > 0.3 ? S / d : null; }).filter(x=> x != null);
    if(!fires){ entries.triggers[e.id] = {why:`never fired on the plain test decks (needs ${e.note || 'its event'}); kept at its current weight`, fires:0}; return; }
    const w = mean(ws); trigW[e.id] = {}; list.forEach(r=>{ const base = en.find(x=> x.b === r.b); if(onSpawnS[r.b]) trigW[e.id][r.b] = (r.S.all - (base ? base.S.all : 0)) / onSpawnS[r.b]; });
    entries.triggers[e.id] = {measuredS: r2(w), fires: r2(fires), at: list.map(r=> ({b:r.b, S:r.S.all})), conf: conf(list, w * 2), how:'S(trigger: deal 2 to a random enemy) / S(On Spawn: same)'};
  });
  (table.actions || []).forEach(e=>{
    const list = rowsOf('action:' + e.id); if(!list.length){ entries.actions[e.id] = {why:'no reference trigger set for this action'}; return; }
    const ref = ACTION_REF[e.id], per = list[0].per || 1;
    const vs = list.map(r=>{ const w = ref.on === 'onSpawn' ? 1 : (trigW[ref.on] && trigW[ref.on][r.b]); return w ? r.S.all / (w * per) : null; }).filter(x=> x != null);
    if(!vs.length){ entries.actions[e.id] = {why:`its reference trigger (${ref.on}) has no measured weight`}; return; }
    const v = mean(vs), fires = mean(list.map(r=> r.metrics.mirror.fires));
    entries.actions[e.id] = {measuredS: r2(v), at: list.map(r=> ({b:r.b, S:r.S.all})), conf: conf(list, v * per), fires: r2(fires), how:`S(${ref.on}: ${e.id.split('.')[0]} ${JSON.stringify(ref.t)}) / (weight × ${per})`};
  });
  const damageS = {}; rowsOf('action:damage').forEach(r=> damageS[r.b] = r.S.all);
  (table.modifiers || []).forEach(e=>{
    const list = rowsOf('modifier:' + e.id); if(!list.length){ entries.modifiers[e.id] = {why:'not measured'}; return; }
    let vs;
    if(e.id === 'subAll') vs = list.map(r=> damageS[r.b] ? r.S.all / damageS[r.b] : null);
    else if(e.id === 'turnOfOne') vs = list.map(r=>{ const pt = rowsOf('trigger:perTurn').find(x=> x.b === r.b); return pt && Math.abs(pt.S.all) > 0.3 ? r.S.all / pt.S.all : null; });
    else vs = list.map(r=> onSpawnS[r.b] ? r.S.all / onSpawnS[r.b] : null); // onceCap: the weight of a once-only On Attack
    vs = vs.filter(x=> x != null); const v = mean(vs);
    entries.modifiers[e.id] = v == null ? {why:'its reference run is too small to divide by'} : {measuredS: r2(v), at: list.map(r=> ({b:r.b, S:r.S.all})), conf: conf(list, v * 2),
      how: e.id === 'subAll' ? 'S(deal 2 to all enemies) / S(deal 2 to a random enemy)' : e.id === 'turnOfOne' ? 'S(On Turn Start, own turns) / S(On Turn Start)' : 'S(On Attack once: deal 2) / S(On Spawn: deal 2)'};
  });
  (table.skills || []).forEach(e=>{
    if(WHY[e.id]){ entries.skills[e.id] = {why: WHY[e.id]}; return; }
    if(PARAM_OF[e.id]){ const w = rowsOf('param:' + e.id), a = w.find(r=> /\|base$/.test(r.key)), z = w.find(r=> /\|with$/.test(r.key));
      if(!a || !z){ entries.skills[e.id] = {why:'parameter of ' + PARAM_OF[e.id] + ': not measured'}; return; }
      const S = z.S.all - a.S.all, n = z.n || 1, f = e.scale === 'n' ? Math.max(1, n) : e.scale === 'half' ? 1 + (n > 1 ? Math.floor(n / 2) : 0) : 1;
      entries.skills[e.id] = {measuredS: r2(S / f), S: r2(S), at:[{b:z.b, ctx:z.ctx, n, S:r2(S)}], conf: conf([a, z], S), field: z.ctx !== 'plain' ? z.ctx : undefined, how:`S(${PARAM_OF[e.id]} + ${e.id}) − S(${PARAM_OF[e.id]}) on ${z.b}${z.ctx !== 'plain' ? ', ' + z.ctx : ''}`}; return; }
    const all = rowsOf('skill:' + e.id), ctls = all.filter(r=> r.tag && String(r.tag).startsWith('enabler'));
    // a skill with an enabler: S − S(the enabler alone) in the same field and baseline
    const list = all.filter(r=> !(r.tag && String(r.tag).startsWith('enabler'))).map(r=>{ if(!ctls.length) return r;
      const want = r.tag && String(r.tag).startsWith('vs-') ? 'enabler-' + String(r.tag).slice(3) : 'enabler', c = ctls.find(x=> x.tag === want && x.b === r.b && x.ctx === r.ctx);
      return c ? Object.assign({}, r, {S: Object.assign({}, r.S, {all: r2(r.S.all - c.S.all), h2h: r2(r.S.h2h - c.S.h2h), ref: r2(r.S.ref - c.S.ref)}), minus: c.S.all}) : r; });
    if(!list.length){ entries.skills[e.id] = {why: (by['skill:' + e.id] || [])[0] ? 'the engine threw: ' + by['skill:' + e.id][0].error : 'not measured'}; return; }
    const field = FIELD_OF[e.id] || (FIELDS_OF[e.id] ? 'fields' : null), typ = list.filter(r=> !r.tag && r.ctx === 'plain');
    const fld = FIELDS_OF[e.id] ? list.filter(r=> r.tag === 'field') : field ? list.filter(r=> r.ctx === field && !r.tag) : [];
    const main = fld.length ? fld : typ; // a field-bound skill is costed where it works
    // fit: S = v × f(N), least squares through the origin over every run in the main field
    const fit = FIELDS_OF[e.id] ? fld : list.filter(r=> r.ctx === (fld.length ? field : 'plain') && !(r.tag && String(r.tag).startsWith('vs-')) && r.tag !== 'field'), fN = r=>{ const n = r.n == null ? 1 : Math.abs(r.n); return e.scale === 'n' ? Math.max(1, n) : e.scale === 'half' ? 1 + (n > 1 ? Math.floor(n / 2) : 0) : 1; };
    // the median of S / f(N) over the runs (robust: Armor 5 against Attack 4 is a wall, not 5 × Armor 1)
    const ratios = fit.map(r=> r.S.all / fN(r)).sort((a, b)=> a - b), med = ratios.length ? (ratios.length % 2 ? ratios[(ratios.length - 1) / 2] : (ratios[ratios.length / 2 - 1] + ratios[ratios.length / 2]) / 2) : null;
    const numeric = fit.some(r=> typeof r.value === 'number');
    let v = med; if(e.scale === 'fixed' || !numeric) v = mean(main.map(r=> r.S.all));
    // a half-miss skill (table.halfMiss) costs nothing in S: the budget multiplies 2A + H + S by missMult instead, so its S today is
    // (missMult − 1) × (2A + H) of the baseline it ran on (2026-10-19)
    const half = (table.halfMiss || []).includes(e.id), mm = (table.budget && table.budget.missMult) || 1.5;
    const typS = mean(main.map(r=> r.S.all)), cur = SC.cardS({[e.id]: list[0].value}, {attack:4}).S + (half ? mean(main.map(r=>{ const b = BASELINES.find(x=> x.id === r.b); return (mm - 1) * (2 * b.attack + b.health); })) : 0);
    // ... and its measuredS is the value that, added to S before the ×missMult, gives the measured worth:
    // (2A + H + value) × m = 2A + H + W  =>  value = (W − (m − 1)(2A + H)) / m (per N as the fit, scaled by the typical run's f(N))
    let how2 = '';
    if(half && v != null){ const halfS = cur - SC.cardS({[e.id]: list[0].value}, {attack:4}).S, f0 = Math.max(1e-9, typS) / Math.max(1e-9, v);
      v = (typS - halfS) / mm / (isFinite(f0) && f0 > 0 ? f0 : 1); how2 = `; half-miss: value = (S − ${r2(halfS)}) / ${mm}, the S on top of the ×${mm}`; }
    const noEffect = list.every(r=> r.S.all === 0 && r.wr.mirror === r.vanillaWr.mirror && r.wr.pool === r.vanillaWr.pool);
    entries.skills[e.id] = {measuredS: v == null ? null : r2(v), half: half || undefined, Styp: r2(typS), Scur: r2(cur), at: list.map(r=> ({b:r.b, ctx:r.ctx, n:r.n, S:r.S.all})), conf: conf(main, typS), field: fld.length ? field : undefined,
      plainS: fld.length && typ.length ? r2(mean(typ.map(r=> r.S.all))) : undefined, noEffect: noEffect || undefined, how: e.scale === 'fixed' || !numeric ? 'mean S of the typical value' : `median of S / ${e.scale === 'n' ? 'N' : '(1 + floor(N/2))'} over N = ${[...new Set(fit.map(r=> r.n))].sort((a, b)=> a - b).join(', ')}` + how2,
      vs: e.id === 'hunter' ? Object.fromEntries(list.filter(r=> r.tag && String(r.tag).startsWith('vs-')).map(r=> [r.tag.slice(3), r.S.all]).concat([['poison', r2(mean(typ.filter(r=> r.b === 'b2').map(r=> r.S.all)))]])) : undefined,
      enabler: SKILL_ENABLER[e.id] ? JSON.stringify(SKILL_ENABLER[e.id]) : undefined,
      perN: numeric ? Object.fromEntries([...new Set(fit.map(r=> r.n))].sort((a, b)=> a - b).map(n=> [n, r2(mean(fit.filter(r=> r.n === n).map(r=> r.S.all)))])) : undefined};
  });
  Object.keys(EXTRA).forEach(k=>{ const list = rowsOf('extra:' + k); if(list.length) entries.extra[k] = {measuredS: r2(mean(list.map(r=> r.S.all))), at: list.map(r=> ({b:r.b, S:r.S.all}))}; });
  // shorthands: S per N (Bounty, Kin Rally, Pack Howl; a tribe skill less its tribe deck's control, baseline by baseline)
  entries.shorthands = {};
  Object.keys(table.shorthands || {}).forEach(k=>{ const all = rowsOf('shorthand:' + k), ctl = all.filter(r=> r.tag === 'enabler'), list = all.filter(r=> r.tag !== 'enabler');
    if(!list.length){ entries.shorthands[k] = {why:'not measured'}; return; }
    const per = list.map(r=>{ const c = ctl.find(x=> x.b === r.b); return (r.S.all - (c ? c.S.all : 0)) / Math.max(1, r.n || 1); }), v = mean(per), cur = SC.cardS({[k]:1}, {attack:4}).S;
    entries.shorthands[k] = {measuredS: r2(v), Scur: r2(cur), at: list.map(r=> ({b:r.b, n:r.n, S:r.S.all})), tribe: TRIBE[k], conf: conf(list, v), how: 'S per N' + (TRIBE[k] ? ` less the ${TRIBE[k][0]} tribe deck's own S` : '')}; });
  const combos = results.filter(r=> r.kind === 'combo' && !r.error).map(r=> ({id:r.id, value:r.value, uses:r.uses, S:r.S.all, Scur: SC.cardS({triggers:[r.value]}, {attack:4}).S}));
  return {entries, combos};
}

// ---------------------------------------------------------------------------------------------------------------------------
// The report: markdown + the xlsx's rows + measuredS into the table.
// ---------------------------------------------------------------------------------------------------------------------------
const KINDF = {skill:'skills', trigger:'triggers', action:'actions', modifier:'modifiers'};
function currentS(table, kind, id){ const e = (table[KINDF[kind]] || []).find(x=> x.id === id); return e ? e.value : null; }
function gapsOf(table, agg){
  const out = [];
  Object.entries(KINDF).forEach(([kind, f])=> Object.entries(agg.entries[f]).forEach(([id, x])=>{ if(x.measuredS == null) return; const cur = currentS(table, kind, id);
    // compare in S at the typical value (skills), else in the entry's own units
    const curS = kind === 'skill' && x.Scur != null ? x.Scur : cur, mS = kind === 'skill' && x.Styp != null ? x.Styp : x.measuredS;
    out.push({kind, id, value: cur, measuredS: x.measuredS, curS, mS, gap: r2(mS - curS), conf: x.conf && x.conf.level, field: x.field, noEffect: x.noEffect, off: (x.conf && x.conf.off) || undefined}); }));
  Object.entries(agg.entries.shorthands || {}).forEach(([id, x])=>{ if(x.measuredS == null) return; out.push({kind:'shorthand', id, value: x.Scur, measuredS: x.measuredS, curS: x.Scur, mS: x.measuredS, gap: r2(x.measuredS - x.Scur), conf: x.conf && x.conf.level, off: (x.conf && x.conf.off) || undefined}); });
  return out.sort((a, b)=> (a.off ? 1 : 0) - (b.off ? 1 : 0) || Math.abs(b.gap) - Math.abs(a.gap));
}
function applyMeasured(table, agg){
  Object.entries(KINDF).forEach(([kind, f])=> (table[f] || []).forEach(e=>{ const x = agg.entries[f][e.id];
    delete e.measuredS; delete e.measuredWhy; delete e.measuredConf; delete e.measuredSE; delete e.measuredOff;
    if(x && x.measuredS != null && isFinite(x.measuredS)){ e.measuredS = x.measuredS; e.measuredConf = (x.conf && x.conf.level) || 'low'; if(x.conf && x.conf.se != null) e.measuredSE = x.conf.se; if(x.conf && x.conf.off) e.measuredOff = x.conf.off; }
    else e.measuredWhy = (x && x.why) || 'not measured'; }));
  Object.entries(table.shorthands || {}).forEach(([k, sh])=>{ const x = (agg.entries.shorthands || {})[k]; delete sh.measuredS; delete sh.measuredWhy; delete sh.measuredConf;
    if(x && x.measuredS != null){ sh.measuredS = x.measuredS; sh.measuredConf = (x.conf && x.conf.level) || 'low'; } else sh.measuredWhy = (x && x.why) || 'not measured'; });
  table.measured = `${DAY} (package SW): measuredS = the entry's value as measured by tools/skill_worth.js (docs/skill-worth-${DAY}.md); value is unchanged, the owner applies it in the hub`;
  return table;
}
const fmtTable = o=> '{\n' + Object.entries(o).map(([k, v])=> ' ' + JSON.stringify(k) + ': ' + (Array.isArray(v) && v.length && typeof v[0] === 'object' ? '[\n' + v.map(x=> '  ' + JSON.stringify(x)).join(',\n') + '\n ]' : JSON.stringify(v))).join(',\n') + '\n}\n';

// Rows for the sheet (tools/skill_worth_xlsx.py writes them as they are).
function sheetRows(data, table, agg){
  const SC = SkillCosts.make(table), F = {skill:'skills', param:'skills', trigger:'triggers', action:'actions', modifier:'modifiers', shorthand:'triggers', extra:'extra'};
  const sug = r=>{ const ent = agg.entries[F[r.kind]] && agg.entries[F[r.kind]][r.kind === 'shorthand' ? 'bounty' : r.id]; if(!ent || ent.measuredS == null) return null;
    if(r.kind === 'skill' || r.kind === 'param'){ const e = (table.skills || []).find(x=> x.id === r.id) || {}; const n = Math.abs(numOf(r.value)) || 1; return r2(ent.measuredS * (e.scale === 'n' ? n : e.scale === 'half' ? 1 + (n > 1 ? Math.floor(n / 2) : 0) : 1)); }
    return ent.measuredS; };
  const curS = r=>{ try{ if(r.kind === 'skill' || r.kind === 'param') return SC.cardS({[r.id]: r.value}, {attack:4}).S; if(r.kind === 'shorthand' || r.kind === 'extra') return SC.cardS(r.effects, {attack:4}).S; return SC.cardS(r.effects || {}, {attack:4}).S; }catch(e){ return null; } };
  const OPP = ['glass', 'tank', 'flyer', 'swarm', 'swimmer', 'mixed'], MK = ['dealtUnits', 'dealtBramble', 'taken', 'avoided', 'kills', 'deaths', 'survival', 'fires', 'misses'];
  const head = ['Kind', 'Entry', 'Tag', 'Value', 'N', 'Field', 'Baseline', 'Win vs mirror', 'Win vs pool', 'Vanilla vs pool', 'Win Δ pool', 'ΔHealth h2h', 'ΔAttack h2h', 'ΔHealth pool', 'ΔAttack pool',
    'S h2h', 'S pool', 'S measured', 'SE', 'Clamped', ...OPP.map(o=> 'S vs ' + o), ...MK.map(k=> k + ' / copy'), ...MK.map(k=> 'Δ ' + k), 'S today (table)', 'Suggested S (fit)', 'Games', 'Error'];
  const runs = data.results.map(r=> r.error ? [r.kind, r.id, r.tag || '', JSON.stringify(r.value), r.n == null ? '' : r.n, r.ctx, r.b, ...Array(head.length - 9).fill(''), r.error] : [
    r.kind, r.id, r.tag || '', JSON.stringify(r.value), r.n == null ? '' : r.n, r.ctx, r.b, r.wr.mirror, r.wr.pool, r.vanillaWr.pool, r3(r.wr.pool - r.vanillaWr.pool), r.h2h.dh, r.h2h.da, r.ref.dh, r.ref.da,
    r.S.h2h, r.S.ref, r.S.all, r.S.se == null ? '' : r.S.se, r.h2h.clamp || r.ref.clamp || '', ...OPP.map(o=> r.ref.per[o] ? r.ref.per[o].S : ''), ...MK.map(k=> r.metrics.pool[k]), ...MK.map(k=> r.delta.pool[k]),
    curS(r), sug(r), r.games, '']);
  const eh = ['Kind', 'Entry', 'Scale / per', 'value (today)', 'measuredS', 'S today at typical', 'S measured at typical', 'Gap', 'Confidence', 'SE', 'Field', 'Plain-field S', 'How', 'Reason (not measured)'];
  const ents = [];
  Object.entries(KINDF).forEach(([kind, f])=> (table[f] || []).forEach(e=>{ const x = agg.entries[f][e.id] || {};
    const cS = kind === 'skill' ? x.Scur : e.value, mS = kind === 'skill' ? (x.Styp != null ? x.Styp : x.S) : x.measuredS;
    ents.push([kind, e.id, e.scale || e.per || '', e.value, x.measuredS == null ? '' : x.measuredS, cS == null ? '' : cS, mS == null ? '' : mS, mS == null || cS == null ? '' : r2(mS - cS), x.conf ? x.conf.level : '', x.conf && x.conf.se != null ? x.conf.se : '', x.field || '', x.plainS == null ? '' : x.plainS, x.how || '', x.why || '']); }));
  const gh = ['#', 'Kind', 'Entry', 'Current', 'Measured', 'Gap', 'Confidence', 'Field', 'Off the scale'], gaps = gapsOf(table, agg).filter(g=> !g.off).slice(0, 20).concat(gapsOf(table, agg).filter(g=> g.off)).map((g, i)=> [i + 1, g.kind, g.id, g.curS, g.mS, g.gap, g.conf || '', g.field || '', g.off || '']);
  const ch = ['Field', 'Baseline', 'Opponent', 'Attack', 'Health', 'Wait', 'Lumber', 'Vanilla win rate'], cal = [];
  Object.entries(data.setups || {}).forEach(([k, s])=>{ const [ctx, b] = k.split(':'); Object.entries(s.cal || {}).forEach(([o, c])=> cal.push([ctx, b, o, c.attack == null ? '' : c.attack, c.health == null ? 'offset ' + c.offset : c.health, c.wait == null ? '' : c.wait, c.cost == null ? '' : c.cost, c.vanillaWr])); });
  return {sheets:[{name:'Runs', head, rows:runs}, {name:'Entries', head:eh, rows:ents}, {name:'Top gaps', head:gh, rows:gaps}, {name:'Opponents', head:ch, rows:cal}]};
}
function writeReport(data, table, agg){
  const L = [], gaps = gapsOf(table, agg), pc = v=> v == null ? '–' : Math.round(v * 100) + '%', sgn = v=> v == null ? '–' : (v > 0 ? '+' : '') + v;
  const res = data.results.filter(r=> !r.error);
  L.push(`# Skill worth, ${DAY}`, '', `Package SW (owner 00:19: "defining the N-worth of skills. Only way is to run experiments with test units with each skill ... e.g. arrow does low dmg but allows you a chance to snipe glass cannons").`, '');
  L.push(`**${res.length} runs**, ${data.games} games (${Math.round(data.ms / 60000)} min, ${data.G} games per point), engine as shipped today. Data: \`docs/balance/skill-worth-${DAY}.json\`, the sheet \`docs/skill-worth-${DAY}.xlsx\`, \`measuredS\` per entry in \`canonical/skill-costs.json\` (\`value\` unchanged; compare and apply in the hub's 🧮 Skill costs tab).`, '');
  L.push('## Method', '',
    '- **Test unit**: a vanilla baseline + one skill. Baselines (Lumber 1, Common): ' + BASELINES.map(b=> `${b.id} ${b.attack}/${b.health} Wait ${b.wait}`).join(', ') + '. The skill\'s value is the one live cards print most (pool cards skipped); skills that scale with N also run at 2–3 N on b2. Field-bound skills run in plain fields and under their field on b2 (' + Object.entries(CONTEXTS).filter(([k])=> k !== 'plain').map(([k, v])=> `${k} = ${JSON.stringify(v)}`).join(', ') + ').',
    '- **Triggers** run as "deal 2 damage to a random enemy" (weight = S / S of On Spawn with the same action; On Spawn = 1 by construction). **Actions** run under a reference trigger with the parameters live cards use most (value = S / (that trigger\'s measured weight × the amount)). Modifiers and Bounty as ratios of their plain runs. The 10 trigger entries live cards use most are also measured as printed (trigger × action).',
    '- **Games**: 20 copies of the test unit against 20 vanilla baselines (mirror) and against the reference pool — glass cannons (2A+1 Attack, low Health), tanks (A/2 Attack, high Health), flyers, a 0-cost Wait-0 swarm, a mix of those four (+ swimmers on the tide) — each calibrated so the vanilla baseline wins about half. Both seats the Smart CPU (aiAim), Open battles, the stall rule and round cap of the reference fights. Seeds are shared between the test deck and the vanilla decks (common random numbers); sides alternate.',
    '- **Metrics** per copy that reached the field: damage to units and to the bramble, damage taken, damage avoided (dodges and blinded misses at the attacker\'s Attack, Armor and Shield soaks), kills, deaths, rounds survived, trigger firings, own misses.',
    '- **Worth**: head-to-head, the Health (then Attack) a vanilla opponent needs for the skilled deck to win 50% (bisection on integers, interpolated); pool, the skilled deck\'s mean pool win rate inverted on the vanilla + ΔHealth / + ΔAttack curves. In Budget v3 units (2A + H + S < N): S_H = ΔHealth, S_A = 2 ΔAttack, S = (S_H + S_A) / 2, the run\'s S = mean of head-to-head and pool. A skill\'s measuredS is fitted in its own units (× N for scale n, × (1 + floor(N/2)) for scale half).',
    '- **Confidence**: high / medium / low from the solve\'s standard error and the head-to-head vs pool disagreement; low whenever a solve hit its range (a skill worth more than +5× the baseline\'s stats, or a win rate the curves can\'t reach). The worth is a property of these decks: a skill that needs company (Prayer cards, resource spenders, tribes) reads near 0 here and says why.',
    '- Rules as shipped: Revive is a true death, triggers stop at 5 layers, Freeze / Confuse, no-op heals, True Strike vs Legendary dodges, Prayer tokens; nothing is copied, the runs call the live engine.', '');
  const offs = gaps.filter(g=> g.off);
  L.push('## The 20 biggest gaps (current S vs measured S)', '', 'Skills compare S at the typical value; triggers, actions and modifiers compare the entry\'s own number (weight / value per point). Positive = under-costed today (worth more than it costs). Entries off the scale (below) are left out: their measured S is only a bound.', '',
    '| # | Entry | Current | Measured | Gap | Confidence | Note |', '|---|---|---|---|---|---|---|');
  gaps.filter(g=> !g.off).slice(0, 20).forEach((g, i)=> L.push(`| ${i + 1} | ${g.kind} \`${g.id}\` | ${g.curS} | ${g.mS} | ${sgn(g.gap)} | ${g.conf || '–'} | ${g.noEffect ? 'no effect seen' : ''}${g.field ? 'under ' + g.field : ''}${g.kind === 'skill' && g.measuredS !== g.mS ? (g.field ? '; ' : '') + 'per-N ' + g.measuredS : ''} |`));
  L.push('');
  if(offs.length){ L.push('**Off the scale** (' + offs.length + '): a deck of 20 still beats vanilla + 5× the baseline\'s Health and Attack (or loses to vanilla − all of it), so the measured S is only a bound — these want a scenario test, not a number: ' + offs.map(g=> `${g.id} (today ${g.curS}, ${g.off === '>' ? '≥' : '≤'} ${g.mS})`).join(', ') + '.', ''); }
  // 2026-10-19: the same list at high / medium confidence only (the ones a cost could move on today)
  const sure = gaps.filter(g=> !g.off && (g.conf === 'high' || g.conf === 'medium')).slice(0, 20);
  if(sure.length){ L.push('**The 20 biggest gaps at high or medium confidence**:', '', '| # | Entry | Current | Measured | Gap | Confidence | Note |', '|---|---|---|---|---|---|---|');
    sure.forEach((g, i)=> L.push(`| ${i + 1} | ${g.kind} \`${g.id}\` | ${g.curS} | ${g.mS} | ${sgn(g.gap)} | ${g.conf} | ${g.field ? 'under ' + g.field : ''} |`)); L.push(''); }
  // findings
  const sk = agg.entries.skills, top = (f, k, n)=> Object.entries(agg.entries[f]).filter(([, x])=> x.measuredS != null).sort((a, b)=> k(b[1], b[0]) - k(a[1], a[0])).slice(0, n);
  const under = gaps.filter(g=> g.gap > 0 && !g.off).slice(0, 8), over = gaps.filter(g=> g.gap < 0 && !g.off).slice(0, 8);
  L.push('## Findings', '');
  L.push('**Most under-costed** (worth more than today\'s S): ' + under.map(g=> `${g.id} (${g.curS} → ${g.mS})`).join(', ') + '.', '');
  L.push('**Most over-costed** (worth less than today\'s S): ' + over.map(g=> `${g.id} (${g.curS} → ${g.mS})`).join(', ') + '.', '');
  // situational: the win-rate lift over the vanilla unit against one opponent minus its mean lift over the pool (plain field, the
  // typical value, averaged over the baselines); a lift the curves can't convert (100% wins) still counts here
  L.push('**Situational value** (win-rate lift vs one opponent minus the mean lift over the pool, typical value, averaged over b1-b3):', '');
  ['glass', 'tank', 'flyer', 'swarm', 'mixed'].forEach(k=>{ const g2 = {};
    res.filter(r=> r.kind === 'skill' && r.ctx === 'plain' && !r.tag && r.ref.per[k]).forEach(r=> (g2[r.id] = g2[r.id] || []).push((r.ref.per[k].wr - r.ref.per[k].vanillaWr) - (r.wr.pool - r.vanillaWr.pool)));
    const t = Object.entries(g2).map(([id, ds])=> [id, ds.reduce((a, b)=> a + b, 0) / ds.length]).sort((a, b)=> b[1] - a[1]).slice(0, 8);
    L.push(`- vs ${({glass:'glass cannons', tank:'tanks', flyer:'flyers', swarm:'the 0-cost swarm', mixed:'the mix'})[k]}: ` + t.map(([id, d])=> `${id} +${Math.round(d * 100)} pts`).join(', ')); });
  L.push('');
  const arrowRows = res.filter(r=> (r.id === 'arrow' || r.id === 'snipe') && r.kind === 'skill');
  if(arrowRows.length){ L.push('**Arrow and Snipe** (the owner\'s example):', '', 'Win rate against each opponent (the vanilla unit\'s in brackets; each opponent is calibrated to about 50% for vanilla). A pool S at the top of its range (' + '5× the baseline\'s stats) means the deck wins (nearly) every pool game, so the run\'s S leans on head-to-head.', '', '| Skill | N | Baseline | S head-to-head | S pool | vs glass | vs tank | vs flyer | kills / copy (Δ vs vanilla) | dmg to units (Δ) |', '|---|---|---|---|---|---|---|---|---|---|');
    arrowRows.forEach(r=> L.push(`| ${r.id} | ${r.n} | ${r.b} | ${r.S.h2h} | ${r.S.ref} | ${['glass', 'tank', 'flyer'].map(o=> r.ref.per[o] ? `${pc(r.ref.per[o].wr)} (${pc(r.ref.per[o].vanillaWr)})` : '–').join(' | ')} | ${r.metrics.pool.kills} (${sgn(r.delta.pool.kills)}) | ${r.metrics.pool.dealtUnits} (${sgn(r.delta.pool.dealtUnits)}) |`)); L.push(''); }
  // field-bound
  const fb = Object.entries(sk).filter(([, x])=> x.field && x.measuredS != null);
  if(fb.length){ L.push('**Field-bound skills** (costed where they work; plain-field S in brackets): ' + fb.map(([id, x])=> `${id} ${x.Styp != null ? x.Styp : x.S} under ${x.field} (${x.plainS != null ? x.plainS : '–'})`).join(', ') + '.', ''); }
  // package GI's new skills (their own needs)
  const GI = ['hunter', 'executioner', 'detonate', 'proliferate', 'brittle', 'prayerWard', 'fieldBreaker'].filter(id=> sk[id]);
  if(GI.length){ L.push('## Package GI\'s new skills', '', 'Measured with what each needs (S of the skill less S of its enabler alone, same baseline and field): Hunter on a Poison 2 unit (and per status on b2: Bleed 2, Expose 1, Wet in Spring Rain), Detonate / Proliferate with Poison 2, Brittle with Shatter 2, Prayer Ward with Prayer 1, Field Breaker under Thunderstorm, Spore Cloud, Tangled Roots and Scorching; Kin Rally and Pack Howl in tribe decks (Otter, Wolf) less the tribe deck\'s own S.', '',
    '| Skill | value today | measuredS | S today | S measured | Detail |', '|---|---|---|---|---|---|');
    GI.forEach(id=>{ const e = table.skills.find(x=> x.id === id), x = sk[id]; const det = id === 'hunter' && x.vs ? 'by status: ' + Object.entries(x.vs).map(([k, v])=> `${k} ${v}`).join(', ') : id === 'fieldBreaker' ? 'by field: ' + (x.at || []).filter(a=> a.ctx !== 'plain').map(a=> `${a.ctx} ${a.S}`).join(', ') : x.perN ? 'per N: ' + Object.entries(x.perN).map(([n, v])=> `${n}: ${v}`).join(', ') : '';
      L.push(`| \`${id}\` | ${e.value} | ${x.measuredS != null ? x.measuredS : '–'} | ${x.Scur != null ? x.Scur : '–'} | ${x.Styp != null ? x.Styp : '–'} | ${det}${x.enabler ? ' (with ' + x.enabler + ')' : ''} |`); });
    L.push(''); }
  const SHR = agg.entries.shorthands || {};
  if(Object.keys(SHR).length){ L.push('## Shorthands (S per N)', '', '| Shorthand | S per N today | Measured | Note |', '|---|---|---|---|');
    Object.entries(SHR).forEach(([k, x])=> L.push(`| \`${k}\` | ${x.Scur != null ? x.Scur : '–'} | ${x.measuredS != null ? x.measuredS : '–'} | ${x.how || x.why || ''} |`)); L.push(''); }
  // triggers / actions
  L.push('## Triggers (weight; On Spawn = 1)', '', '| Trigger | Current | Measured | Fires / copy | Confidence | Note |', '|---|---|---|---|---|---|');
  (table.triggers || []).forEach(e=>{ const x = agg.entries.triggers[e.id] || {}; L.push(`| \`${e.id}\` | ${e.value} | ${x.measuredS != null ? x.measuredS : '–'} | ${x.fires != null ? x.fires : '–'} | ${x.conf ? x.conf.level : '–'} | ${x.why || ''} |`); });
  L.push('', '## Actions (value per point)', '', '| Action | Current | Measured | Reference | Confidence | Note |', '|---|---|---|---|---|---|');
  (table.actions || []).forEach(e=>{ const x = agg.entries.actions[e.id] || {}, ref = ACTION_REF[e.id]; L.push(`| \`${e.id}\` | ${e.value} | ${x.measuredS != null ? x.measuredS : '–'} | ${ref ? ref.on + ' ' + JSON.stringify(ref.t).replace(/\|/g, '/') : '–'} | ${x.conf ? x.conf.level : '–'} | ${x.why || ''} |`); });
  L.push('', '## Modifiers', '', '| Modifier | Current | Measured | How |', '|---|---|---|---|');
  (table.modifiers || []).forEach(e=>{ const x = agg.entries.modifiers[e.id] || {}; L.push(`| \`${e.id}\` | ${e.value} | ${x.measuredS != null ? x.measuredS : '–'} | ${x.how || x.why || ''} |`); });
  if(agg.combos.length){ L.push('', '## Trigger × action as live cards print them (b2)', '', '| Entry | Cards | S today | S measured |', '|---|---|---|---|');
    agg.combos.forEach(c=> L.push(`| \`${JSON.stringify(c.value).replace(/\|/g, '/')}\` | ${c.uses} | ${c.Scur} | ${c.S} |`)); }
  L.push('', '## Every skill', '', 'S today and measured at the typical value (mean over the runs in its field); measuredS in the entry\'s own units (what `value` would be).', '',
    '| Skill | Typical | Scale | value | measuredS | S today | S measured | b1 / b2 / b3 | Conf | Note |', '|---|---|---|---|---|---|---|---|---|---|');
  (table.skills || []).forEach(e=>{ const x = sk[e.id] || {}, at = (x.at || []).filter(a=> a.ctx === (x.field || 'plain') && (a.n == null || true));
    const byB = ['b1', 'b2', 'b3'].map(b=>{ const r = res.find(q=> q.kind === 'skill' && q.id === e.id && q.b === b && q.ctx === 'plain' && !q.tag); return r ? r.S.all : '–'; }).join(' / ');
    const typ = res.find(q=> (q.kind === 'skill' || q.kind === 'param') && q.id === e.id && !(q.tag && q.tag.startsWith('n')));
    L.push(`| \`${e.id}\` | ${typ ? '`' + JSON.stringify(typ.value).replace(/\|/g, '/').slice(0, 40) + '`' : '–'} | ${e.scale} | ${e.value} | ${x.measuredS != null ? x.measuredS : '–'} | ${x.Scur != null ? x.Scur : '–'} | ${x.Styp != null ? x.Styp : (x.S != null ? x.S : '–')} | ${byB} | ${x.conf ? x.conf.level : '–'} | ${x.why ? x.why : x.noEffect ? 'no effect seen: every game played as the vanilla unit\'s' : x.field ? 'under ' + x.field + (x.plainS != null ? ' (plain ' + x.plainS + ')' : '') : ''} |`); });
  if(Object.keys(agg.entries.extra).length){ L.push('', '## Engine keywords with no entry in the table', '', Object.entries(agg.entries.extra).map(([k, x])=> `- \`${k}\`: measured S ${x.measuredS} (b2). Not added to the table (an entry would change every card that has it).`).join('\n')); }
  L.push('', '## Reading it', '', '- A measured S is how much Budget-v3 N the skill is worth on these units against these decks; on a 6/22 a flat skill (Armor 1) is a smaller share than on a 2/8, which the per-baseline columns show. Stats per copy, deltas and per-opponent worth are in the JSON and the sheet.',
    '- Noise: each point is ' + data.G + ' seeded games; a head-to-head solve\'s standard error is shown per run in the sheet. Low-confidence rows want a longer run (`node tools/skill_worth.js --only=<ids> --games=120`) before a cost moves.',
    '- Caveats (2026-10-19, read before moving a cost): the test decks are 20 copies of one unit, so a skill that compounds across copies reads high — Gain 1 Lumber on a Lumber-1 card makes every copy free (Gain, Bounty), and Exile / Mind Control / the big-damage bolts snowball (several are off the scale). Swarm opponents (Wait 0) have a step in their win rate (one more Health takes a hit more to kill), so their calibration lands at 20-90% for vanilla rather than 50%; the curves still invert against the same decks. On Round Start and On Turn Start measure the same here (a test unit is Ready after its first Wait). A skill with no effect in a field still reads about −0.05 (the curve fit at Δ = 0), which is the noise floor.',
    '- Nothing in the game changed: card stats, `value` and every card\'s S stay as they were. The owner applies a measured value in the hub (Skill costs tab, the "measured" chip → Apply).', '');
  fs.writeFileSync(OUT_MD, L.join('\n'));
  return gaps;
}

// ---------------------------------------------------------------------------------------------------------------------------
if(require.main === module){
  const args = process.argv.slice(2), opt = k=>{ const a = args.find(x=> x.startsWith('--' + k + '=')); return a ? a.slice(k.length + 3) : null; };
  const table = JSON.parse(fs.readFileSync(COSTS, 'utf8'));
  if(args.includes('--report')){
    const IN = opt('in') || OUT_JSON, data = JSON.parse(fs.readFileSync(IN, 'utf8')), agg = aggregate(table, data.results);
    data.aggregate = agg; data.gaps = gapsOf(table, agg); fs.writeFileSync(IN, JSON.stringify(data) + '\n');
    const gaps = writeReport(data, table, agg), sheetFile = path.join(path.dirname(OUT_JSON), `skill-worth-${DAY}.sheet.json`);
    fs.writeFileSync(sheetFile, JSON.stringify(sheetRows(data, table, agg)));
    try{ require('child_process').execFileSync('python3', [path.join(__dirname, 'skill_worth_xlsx.py'), sheetFile, OUT_MD.replace(/\.md$/, '.xlsx')], {stdio:'inherit'}); }finally{ fs.unlinkSync(sheetFile); }
    console.log('Top gaps:'); gaps.filter(g=> !g.off).slice(0, 20).forEach((g, i)=> console.log(`  ${i + 1}. ${g.kind} ${g.id}: ${g.curS} -> ${g.mS} (${g.gap > 0 ? '+' : ''}${g.gap}, ${g.conf})`));
    if(args.includes('--apply')){ fs.writeFileSync(COSTS, fmtTable(applyMeasured(table, agg))); console.log('measuredS written to canonical/skill-costs.json (value unchanged)'); }
    process.exit(0);
  }
  // 2026-10-19 (resumable, after a container restart lost the first full run): --checkpoint=file.jsonl appends every finished run
  // (a shard writes file.jsonl.s<i>; every sibling is read back), --budget-s=N stops starting runs after N seconds (exit code 3 =
  // more to do, so a long run goes in foreground chunks), --shard=i/n takes every n-th run, --setups-only builds the
  // (field, baseline) setups into the setup dir (docs/balance/skill-worth-partial-setups/, beside the checkpoint) and stops.
  const G = +(opt('games') || 40), only = (opt('only') || '').split(',').filter(Boolean), ckpt = opt('checkpoint'), budget = +(opt('budget-s') || 0) * 1000;
  const shard = (opt('shard') || '').split('/').map(Number), setupDir = opt('setup-dir') || (ckpt ? ckpt.replace(/\.jsonl$/, '') + '-setups' : null);
  const lab = makeLab({games: G, log: s=> console.log(s), setupDir});
  let runs = plan(table, lab.defs, args.includes('--quick') ? {baselines:['b2'], combos:0} : {});
  if(only.length) runs = runs.filter(r=> only.includes(r.id) || only.includes(r.parent) || (r.kind === 'trigger' && r.id === 'onSpawn' && only.some(o=> /^on|^per/.test(o))));
  const done = {};
  if(ckpt){ const dir = path.dirname(ckpt), base = path.basename(ckpt);
    (fs.existsSync(dir) ? fs.readdirSync(dir) : []).filter(f=> f === base || f.startsWith(base + '.s')).forEach(f=> fs.readFileSync(path.join(dir, f), 'utf8').split('\n').filter(Boolean).forEach(l=>{ try{ const r = JSON.parse(l); done[r.key] = r; }catch(e){} })); }
  const ckOut = ckpt && shard.length === 2 ? ckpt + '.s' + shard[0] : ckpt;
  // order: per (field, baseline) so each setup is built once and in turn
  runs.sort((a, b)=> (a.ctx === 'plain' ? 0 : 1) - (b.ctx === 'plain' ? 0 : 1) || a.ctx.localeCompare(b.ctx) || a.b.localeCompare(b.b));
  const groups = [...new Set(runs.map(r=> r.ctx + ':' + r.b))];
  // runs are dealt out one by one (setups are built first with --setups-only, which deals out the (field, baseline) groups)
  const mine = r=> shard.length !== 2 || runs.indexOf(r) % shard[1] === shard[0];
  console.log(`${runs.length} runs (${runs.filter(r=> done[r.key]).length} from the checkpoint), ${G} games per point${shard.length === 2 ? `, shard ${shard[0]}/${shard[1]}` : ''}`);
  if(args.includes('--setups-only')){ groups.filter((g, i)=> shard.length !== 2 || i % shard[1] === shard[0]).forEach(g=>{ const [ctx, b] = g.split(':'); lab.setup(ctx, BASELINES.find(x=> x.id === b)); });
    console.log(`setups built, ${lab.stats().games} games, ${Math.round(lab.stats().ms / 1000)} s`); process.exit(0); }
  const results = []; let stopped = 0;
  runs.forEach((r, i)=>{
    if(done[r.key]){ results.push(done[r.key]); return; }
    if(!mine(r)) return;
    if(budget && lab.stats().ms > budget){ stopped++; return; }
    let out; try{ out = lab.measure(r); }catch(e){ out = {key:r.key, kind:r.kind, id:r.id, b:r.b, ctx:r.ctx, value:r.value, error: String(e && e.message || e).slice(0, 200)}; }
    if(r.tag) out.tag = r.tag; if(r.parent) out.parent = r.parent; if(r.per != null) out.per = r.per; if(r.uses) out.uses = r.uses; if(r.scale) out.scale = r.scale;
    results.push(out); if(ckOut) fs.appendFileSync(ckOut, JSON.stringify(out) + '\n');
    const st = lab.stats(); console.log(`[${i + 1}/${runs.length}] ${r.kind} ${r.id}${r.tag ? ' ' + r.tag : ''} ${r.ctx} ${r.b}: ${out.error ? 'ERROR ' + out.error : `S ${out.S.all} (h2h ${out.S.h2h}, pool ${out.S.ref}) wr ${out.wr.mirror}/${out.wr.pool}`} · ${Math.round(st.ms / 1000)}s ${st.games} games`);
  });
  const left = runs.filter(r=> !results.some(x=> x.key === r.key)).length;
  if(left){ console.log(`${results.length}/${runs.length} runs done (${stopped} left for this shard), ${lab.stats().games} games, ${Math.round(lab.stats().ms / 1000)} s: run again to resume`); process.exit(stopped ? 3 : 0); }
  const st = lab.stats(), setups = {};
  results.forEach(r=>{ const k = r.ctx + ':' + r.b; if(!setups[k]){ try{ const s = lab.setup(r.ctx, BASELINES.find(b=> b.id === r.b)); setups[k] = {cal: s.cal, curves: s.curves, vanilla: s.vm && Object.fromEntries(Object.entries(s.vm).map(([q, v])=> [q, {wr: r3(v.wr), m: v.m}]))}; }catch(e){} } });
  // games and time over every chunk (each result counts its own games and ms)
  const data = {generated: DAY, G, games: results.reduce((s, r)=> s + (r.games || 0), 0) || st.games, ms: results.reduce((s, r)=> s + (r.ms || 0), 0) || st.ms, baselines: BASELINES, contexts: CONTEXTS, setups, results};
  if(!only.length && !args.includes('--quick')){ fs.mkdirSync(path.dirname(OUT_JSON), {recursive:true}); fs.writeFileSync(OUT_JSON, JSON.stringify(data) + '\n'); console.log('wrote', path.relative(ROOT, OUT_JSON)); }
  else { const p = opt('out'); if(p){ fs.writeFileSync(p, JSON.stringify(data) + '\n'); console.log('wrote', p); } }
  console.log(`${results.length} runs, ${data.games} games, ${Math.round(data.ms / 1000)} s`);
}
module.exports = {BASELINES, CONTEXTS, FIELD_OF, PARAM_OF, WHY, ACTION_REF, makeLab, plan, census, aggregate, applyMeasured, gapsOf, sheetRows, writeReport, fmtTable};
