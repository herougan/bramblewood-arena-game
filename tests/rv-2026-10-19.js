#!/usr/bin/env node
// Package RV (2026-10-19). The owner (00:19):
//   1. "Revive is true death, but Rescue no." A unit's first death, the one Revive answers, is a true death: its On Death, the
//      allies' On Ally Die, the killer's On Kill and kill stat, Bounty, Darkness from the loss, the Ritual count, the deaths stat,
//      the graveyard all happen; then the unit returns (1 Health, statuses cleared, in its own slot, out of the graveyard). What
//      would replace the body doesn't happen (Claude's call): no Relic 1/1, no Crystallise crystal, no Meiosis split; an On
//      Death: Spawn token goes beside it. Loops stop at the trigger layer cap. Rescue (Shield Call moving a unit out of harm)
//      is no death: nothing fires.
//   2. "Quiet Contemplation on Map 21's boss: no 2x and re-enablement effects." rules.quietContemplation on 21-6 (the Cathedral
//      Eagle) blocks Headwind, Twin Strike, Frenzy's second swing, Twin Shot's second arrow, Twin, Echoing Wood, Crit, Expose's
//      crit, Rage, Mighty, Tall Grass ×2, Supreme Tide, Double Time, Fast Forward / Tailwind / Quick Attack extra turns, Second Pitch.
//   3. Both are dated 2026-10-19 stated rules in docs/decisions.json (the old Revive rule gone), and decisions.md has them.
// Plus the board and texts: the death that a revive follows keeps its tile; TX keys, terse texts, 12 packs.
'use strict';
const fs = require('fs'), path = require('path');
const H = require('./lib/harness.js'), E = H.Engine;
const ROOT = path.join(__dirname, '..'), R = f=> fs.readFileSync(path.join(ROOT, f), 'utf8');
let fail = 0, n = 0; const ok = (c, m)=>{ n++; if(!c){ fail++; console.log('  ✗', m); } };
const so = id=> id===1 ? 'A' : 'B';
const U = (id, effects, o)=> Object.assign({id, name:id, attack:0, health:30, wait:0, cost:0, effects: effects || {}}, o || {});
const onKillLumber = {on:'onKill', do:'gainLumber', amount:2};
const defs = Object.assign({}, H.loadCardDefs(), {
  'rv-wall': U('rv-wall', {}, {health:500}),
  'rv-sword': U('rv-sword', {triggers:[onKillLumber]}, {attack:5, health:500}),
  'rv-phoenix': U('rv-phoenix', {revive:true, bounty:3, triggers:[{on:'onDeath', do:'gain', resource:'grace', amount:1}]}, {health:2}),
  'rv-mourner': U('rv-mourner', {triggers:[{on:'onAllyDie', do:'gain', resource:'stone', amount:1}]}, {health:500}),
  'rv-meio': U('rv-meio', {revive:true, meiosis:1}, {health:2}),
  'rv-crys': U('rv-crys', {revive:true, crystallise:2}, {health:2}),
  'rv-spawner': U('rv-spawner', {revive:true, onDeathSpawn:{defId:'rv-wall', count:1}}, {health:2}),
  'rv-ritual': U('rv-ritual', {ritual:{perished:9}}, {health:500}),
  'rv-pray': U('rv-pray', {revive:true, prayer:2}, {health:2, mechanicLine:'grace'}),
  // a loop: each revives once, and each one's death kills every ally
  'rv-loop': U('rv-loop', {revive:true, triggers:[{on:'onDeath', do:'damage', amount:99, who:'ally', sub:'all'}]}, {health:3}),
  // the Quiet Contemplation set
  'qc-twin': U('qc-twin', {twinStrike:true}, {attack:2, health:500}),
  'qc-frenzy': U('qc-frenzy', {frenzy:true}, {attack:2, health:500}),
  'qc-crit': U('qc-crit', {crit:true}, {attack:10, health:500}),
  'qc-rage': U('qc-rage', {rage:true}, {attack:10, health:100}),
  'qc-mighty': U('qc-mighty', {mighty:true}, {attack:10, health:500}),
  'qc-twinshot': U('qc-twinshot', {twinShot:3}, {health:500}),
  'qc-ff': U('qc-ff', {fastForward:2}, {attack:3, health:500}),
  'qc-mirror': U('qc-mirror', {twin:true}, {attack:1, health:5}),
  'qc-flyer': U('qc-flyer', {flying:true, triggers:[{on:'onRoundStart', do:'gain', resource:'grace', amount:1}]}, {health:500}),
  'qc-hitter': U('qc-hitter', {}, {attack:10, health:500}),
});
const all = pl=> [...pl.row.left, ...pl.row.center, ...pl.row.right];
function mk(o){ o = o || {}; const e = E.makeSimEngine(defs, E.mulberry32(o.seed||7), {recordEvents:true, battleMode:'open', rules: o.rules || {}});
  return {e, P:{1:e.newPlayer(1, {}), 2:e.newPlayer(2, {})}}; }
function put(e, P, pid, id, slot){ const pl = P[pid]; const c = e.makeBoardCard(id); c.slot = slot; c._seenAt = slot;
  const cs = all(pl).concat(c); pl.row.center = cs.filter(x=> x.slot === 0); pl.row.left = cs.filter(x=> x.slot < 0).sort((a, b)=> b.slot - a.slot); pl.row.right = cs.filter(x=> x.slot > 0).sort((a, b)=> a.slot - b.slot);
  e.syncSlots(pl); return c; }
const kills = (stats, side, id)=> (stats[side + '|' + id] || {}).kills || 0;
const deaths = (stats, side, id)=> (stats[side + '|' + id] || {}).deaths || 0;
const kill = (e, P, c, ev, stats)=>{ c.hp = 0; e.removeDeadCards(P, so, {}, stats || {}, ev || []); };

// ---- 1. Revive is a true death
{ const {e, P} = mk(); const S = put(e, P, 1, 'rv-sword', 0); const X = put(e, P, 2, 'rv-phoenix', 0); put(e, P, 2, 'rv-mourner', 1);
  const stats = {}, ev = [], l0 = P[1].lumber || 0, g0 = P[2].grace || 0, st0 = P[2].stone || 0, dk0 = P[2].devilry || 0;
  const foeLumber0 = P[1].lumber || 0;
  e.debugAttack(P, so, S.uid, stats, ev);
  const dI = ev.findIndex(x=> x.type === 'death' && x.uid === X.uid), rI = ev.findIndex(x=> x.type === 'revive' && x.uid === X.uid);
  ok(dI >= 0 && rI > dI, `1. a death event, then the revive (death ${dI}, revive ${rI})`);
  ok(dI >= 0 && ev[dI].revives === true && !ev[dI].exiled, '1. the death is marked revives (the board keeps the tile)');
  ok(all(P[2]).includes(X) && X.hp === 1 && X.slot === 0 && X.revivedOnce && X.hasRemovalCounter, '1. it comes back at 1 Health, in its slot, its Revive spent');
  ok(deaths(stats, 'B', 'rv-phoenix') === 1, `1. the deaths stat counts it (${deaths(stats, 'B', 'rv-phoenix')})`);
  ok(kills(stats, 'A', 'rv-sword') === 1, `1. the killer gets the kill stat (${kills(stats, 'A', 'rv-sword')})`);
  ok((P[1].lumber || 0) - l0 === 2 + 3, `1. the killer's On Kill (+2) and the Bounty (+3) are paid (+${(P[1].lumber || 0) - foeLumber0})`);
  ok((P[2].grace || 0) - g0 === 1, '1. its own On Death fires');
  ok((P[2].stone || 0) - st0 === 1, '1. its ally\'s On Ally Die fires');
  ok((P[2].devilry || 0) - dk0 === 1, '1. Darkness from the loss');
  ok(!P[2].graveyard.some(g=> g.defId === 'rv-phoenix') && !P[2].exile.some(g=> g.defId === 'rv-phoenix'), '1. it is not left in the graveyard (it came back out)');
  // its final death: the Removal Zone, one more kill, one more On Kill and Bounty
  const ev2 = []; e.debugAttack(P, so, S.uid, stats, ev2);
  ok(!all(P[2]).includes(X) && P[2].exile.some(g=> g.defId === 'rv-phoenix') && !ev2.some(x=> x.type === 'revive'), '1. the second death is final: the Removal Zone, no revive');
  ok(kills(stats, 'A', 'rv-sword') === 2 && deaths(stats, 'B', 'rv-phoenix') === 2 && (P[1].lumber || 0) - l0 === 10, `1. two deaths, two kills, two On Kills and Bounties (kills ${kills(stats, 'A', 'rv-sword')}, +${(P[1].lumber || 0) - l0})`); }
// the Ritual count (units perished) goes up for the revive death too
{ const {e, P} = mk(); e.debugSpawnCard(P, so, 1, 'rv-ritual', 'left', {}, []); const Rt = all(P[1]).find(c=> c.defId === 'rv-ritual');
  const X = put(e, P, 2, 'rv-phoenix', 0); put(e, P, 2, 'rv-wall', 1); const p0 = e.ritualProgress(P[1], Rt).perished[0];
  kill(e, P, X); ok(X.hp === 1 && e.ritualProgress(P[1], Rt).perished[0] === p0 + 1, `1. the Ritual count goes up for the revive death (${p0} -> ${e.ritualProgress(P[1], Rt).perished[0]})`); }
// what replaces the body doesn't happen; its death tokens go beside it
{ const {e, P} = mk(); const M = put(e, P, 1, 'rv-meio', 0); kill(e, P, M);
  ok(all(P[1]).length === 1 && all(P[1])[0] === M && M.hp === 1, '1. Meiosis + Revive: no split on the revive death'); kill(e, P, M);
  ok(all(P[1]).length === 2 && all(P[1]).every(c=> c !== M), '1. ... its final death splits'); }
{ const {e, P} = mk(); const C = put(e, P, 1, 'rv-crys', 0); kill(e, P, C);
  ok(all(P[1]).length === 1 && C.hp === 1, '1. Crystallise + Revive: no crystal on the revive death'); }
{ const {e, P} = mk(); const S = put(e, P, 1, 'rv-spawner', 0); const ev = []; kill(e, P, S, ev);
  const tok = all(P[1]).find(c=> c.defId === 'rv-wall');
  ok(S.hp === 1 && S.slot === 0 && tok && tok.slot !== 0 && ev.some(x=> x.type === 'spawn' && x.defId === 'rv-wall'), '1. On Death: Spawn fires, the token goes beside it (its slot is its own)');
  ok(new Set(all(P[1]).map(c=> c.slot)).size === all(P[1]).length, '1. no two units share a slot'); }
{ const {e, P} = mk(); const X = put(e, P, 1, 'rv-pray', 0); X.prayerTokens = 4; kill(e, P, X); ok(X.hp === 1 && !(X.prayerTokens > 0), '1. its Prayer tokens are gone with the death'); }
// a whole match with Revive cards keeps the invariants
{ const m = E.simulateOneMatch(defs, {'rv-phoenix':10, 'cinder-skeleton':10}, {'rv-sword':4, 'rv-spawner':16}, {rnd: E.mulberry32(5), maxRounds: 40, recordEvents: true});
  ok(H.checkInvariants(m.players, 'end').length === 0 && m.events.some(x=> x.type === 'revive'), '1. a match with Revive cards: revives happen, invariants hold'); }

// ---- 1b. Loops: each unit revives once; the chain stops at the trigger layer cap
{ const {e, P} = mk(); const A = put(e, P, 1, 'rv-loop', 0), B = put(e, P, 1, 'rv-loop', 1), C = put(e, P, 1, 'rv-loop', -1); const ev = [];
  A.hp = 0; e.removeDeadCards(P, so, {}, {}, ev);
  const rv = ev.filter(x=> x.type === 'revive'), dd = ev.filter(x=> x.type === 'death');
  ok(rv.length === 3 && new Set(rv.map(x=> x.uid)).size === 3, `1b. three loop units: each revives exactly once (${rv.length})`);
  ok(dd.length === 6 && !all(P[1]).length, `1b. then each dies for good: 6 deaths, the board empty (${dd.length}, ${all(P[1]).length} left)`);
  ok(E.TRIGGER_LAYER_CAP === 5, '1b. the layer cap is 5'); }
{ const src = R('bramblewood-engine.js');
  ok(/Loops: Revive is once per unit \(revivedOnce\)[\s\S]{0,200}TRIGGER_LAYER_CAP/.test(src), '1b. the engine says how the cap bounds a revive loop'); }

// ---- 1c. Rescue is no death: Shield Call moves the unit out of harm, nothing fires for it
{ const {e, P} = mk(); const sn = put(e, P, 1, 'rv-sword', 0); P[1].row.center = []; e.syncSlots(P[1]);
  const sniper = put(e, P, 1, 'qc-hitter', 0); defs['qc-hitter'].effects = {snipe:9}; sniper.atk = 0;
  const hound = put(e, P, 2, 'shieldbearer-hound', 3); const X = put(e, P, 2, 'rv-phoenix', 1); hound.wait = 0;
  const stats = {}, ev = [], g0 = P[2].grace || 0; e.debugAttack(P, so, sniper.uid, stats, ev);
  defs['qc-hitter'].effects = {};
  const called = ev.some(x=> x.type === 'spawn' && x.cause === 'shieldCall');
  ok(called, '1c. (the Shield Call happened)');
  ok(called && X.hp === 2 && !ev.some(x=> (x.type === 'death' || x.type === 'revive') && x.uid === X.uid) && (P[2].grace || 0) === g0 && !X.revivedOnce && deaths(stats, 'B', 'rv-phoenix') === 0,
    '1c. the rescued unit: no death, no revive, no On Death, no deaths stat, Revive unspent'); void sn; }

// ---- 2. Quiet Contemplation
const QC = {quietContemplation:true};
const swings = (ev, uid)=> ev.filter(x=> x.type === 'hit' && x.attUid === uid).length;
const quiet = (ev, what)=> ev.filter(x=> x.type === 'quiet' && (!what || x.what === what)).length;
{ for(const [rules, want] of [[{}, 2], [QC, 1]]){ const {e, P} = mk({rules}); const T = put(e, P, 1, 'qc-twin', 0); put(e, P, 2, 'rv-wall', 0); const ev = []; e.debugAttack(P, so, T.uid, {}, ev);
    ok(swings(ev, T.uid) === want, `2. Twin Strike swings ${want} time(s) ${rules.quietContemplation ? 'under' : 'without'} Quiet Contemplation (${swings(ev, T.uid)})`);
    if(rules.quietContemplation) ok(quiet(ev, 'twinStrike') === 1, '2. ... and the board is told ({type:"quiet", what:"twinStrike"})'); } }
{ for(const [rules, want] of [[{}, 2], [QC, 1]]){ const {e, P} = mk({rules}); const T = put(e, P, 1, 'qc-frenzy', 0); T.poison = 3; put(e, P, 2, 'rv-wall', 0); const ev = []; e.debugAttack(P, so, T.uid, {}, ev);
    ok(swings(ev, T.uid) === want, `2. Frenzy (statused) swings ${want} time(s) ${rules.quietContemplation ? 'under QC' : ''} (${swings(ev, T.uid)})`); } }
{ let hi = 0; for(let s = 1; s <= 30; s++){ const {e, P} = mk({rules: QC, seed: s}); const T = put(e, P, 1, 'qc-crit', 0); const W = put(e, P, 2, 'rv-wall', 0); e.debugAttack(P, so, T.uid, {}, []); hi = Math.max(hi, 500 - W.hp); }
  let hi0 = 0; for(let s = 1; s <= 30; s++){ const {e, P} = mk({seed: s}); const T = put(e, P, 1, 'qc-crit', 0); const W = put(e, P, 2, 'rv-wall', 0); e.debugAttack(P, so, T.uid, {}, []); hi0 = Math.max(hi0, 500 - W.hp); }
  ok(hi === 10 && hi0 === 20, `2. Crit: never doubles under QC (max ${hi}), does without (max ${hi0})`); }
{ for(const [rules, want] of [[{}, 20], [QC, 10]]){ const {e, P} = mk({rules}); const T = put(e, P, 1, 'qc-rage', 0); T.hp = 40; const W = put(e, P, 2, 'rv-wall', 0); e.debugAttack(P, so, T.uid, {}, []);
    ok(500 - W.hp === want, `2. Rage below half Health hits ${want} ${rules.quietContemplation ? 'under QC' : ''} (${500 - W.hp})`); } }
{ for(const [rules, want] of [[{}, 20], [QC, 10]]){ const {e, P} = mk({rules}); const T = put(e, P, 1, 'qc-mighty', 0); const W = put(e, P, 2, 'rv-wall', 0); e.debugAttack(P, so, T.uid, {}, []);
    ok(500 - W.hp === want, `2. Mighty hits ${want} ${rules.quietContemplation ? 'under QC' : ''} (${500 - W.hp})`); } }
{ for(const [rules, want] of [[{}, 20], [QC, 10]]){ const {e, P} = mk({rules}); const T = put(e, P, 1, 'qc-hitter', 0); const W = put(e, P, 2, 'rv-wall', 0); W.exposed = 2; e.debugAttack(P, so, T.uid, {}, []);
    ok(500 - W.hp === want && W.exposed === 1, `2. a hit on an Exposed unit deals ${want} ${rules.quietContemplation ? 'under QC (the counter still used up)' : ''} (${500 - W.hp}, ${W.exposed} left)`); } }
{ for(const [rules, want] of [[{}, 2], [QC, 1]]){ const {e, P} = mk({rules}); const T = put(e, P, 1, 'qc-twinshot', 0); put(e, P, 2, 'rv-wall', 0); put(e, P, 2, 'rv-wall', 1); const ev = []; e.debugAttack(P, so, T.uid, {}, ev);
    const shots = ev.filter(x=> (x.type === 'hit' || x.type === 'evaded') && x.attUid === T.uid).length;
    ok(shots === want, `2. Twin Shot fires ${want} arrow(s) ${rules.quietContemplation ? 'under QC' : ''} (${shots})`); } }
{ for(const [rules, want] of [[{}, 2], [QC, 1]]){ const {e, P} = mk({rules}); e.debugSpawnCard(P, so, 1, 'qc-mirror', 'left', {}, []);
    ok(all(P[1]).length === want, `2. Twin: ${want} unit(s) on arrival ${rules.quietContemplation ? 'under QC' : ''} (${all(P[1]).length})`); } }
{ for(const [rules, want] of [[{}, true], [QC, false]]){ const {e, P} = mk({rules}); const F = put(e, P, 1, 'qc-ff', 0); put(e, P, 2, 'rv-wall', 0); const ev = []; e.resolveCombat(P, so, {}, ev, 1);
    ok(ev.some(x=> x.type === 'fastForward') === want && F.ffCounters === 0, `2. Fast Forward 2 ${want ? 'takes its extra turns' : 'takes no extra turn under QC (counters spent)'}`);
    if(!want) ok(quiet(ev, 'fastForward') === 1 && swings(ev, F.uid) === 1, `2. ... one quiet line, one swing (${swings(ev, F.uid)})`); } }
{ const tw = Object.assign(U('qc-tailwind'), {cardType:'spell', spell:{do:'tailwind', amount:1}}); defs['qc-tailwind'] = tw;
  for(const [rules, want] of [[{}, 1], [QC, 0]]){ const {e, P} = mk({rules}); const F = put(e, P, 1, 'qc-flyer', 0); F.wait = 2; P[1].hand = [{uid: 77001, defId:'qc-tailwind'}]; P[1].lumber = 9;
    e.placeCard(P, so, 1, 77001, 'left', {}, []);
    ok((F.ffCounters || 0) === want && F.wait === 1, `2. the Tailwind spell: Hasten ${rules.quietContemplation ? 'only, no extra turn under QC' : 'and an extra turn'} (ff ${F.ffCounters || 0}, wait ${F.wait})`); } }
{ // Headwind: a Flyer's triggers twice; not under QC (wind forced to blow every round at side B's flyers)
  const res = {}; for(const rules of [{wind:'gale'}, Object.assign({wind:'gale'}, QC)]){ let twice = 0, once = 0;
    for(let s = 1; s <= 12; s++){ const {e, P} = mk({rules, seed: s}); put(e, P, 1, 'qc-flyer', 0); put(e, P, 2, 'qc-flyer', 0); for(let r = 1; r <= 4; r++){ const ev = []; e.roundStart(P, r, so, {}, ev); e.resolveCombat(P, so, {}, ev, 1);
        const fires = ev.filter(x=> x.type === 'triggerFired' && x.hook === 'onRoundStart'); const per = {}; fires.forEach(x=> per[x.uid] = (per[x.uid] || 0) + 1);
        Object.values(per).forEach(k=> k >= 2 ? twice++ : once++); } }
    res[rules.quietContemplation ? 'qc' : 'plain'] = {twice, once}; }
  ok(res.plain.twice > 0, `2. (Headwind doubles a Flyer's trigger in a gale: ${res.plain.twice})`);
  ok(res.qc.twice === 0 && res.qc.once > 0, `2. Headwind: never twice under QC (${res.qc.twice} twice, ${res.qc.once} once)`); }
{ const a = mk({rules:{actions:2}}).e, q = mk({rules:Object.assign({actions:2}, QC)}).e;
  ok(a.actionsPerTurn() === 2 && q.actionsPerTurn() === 1, `2. Double Time: 2 plays a turn, 1 under QC (${a.actionsPerTurn()}, ${q.actionsPerTurn()})`);
  const P = {1: q.newPlayer(1, {}), 2: q.newPlayer(2, {})}; const h0 = P[2].hand.length, b = q.applySecondPlayerBonus(P[2], 'B', {}, []);
  ok(P[2].hand.length === h0 && b.cards === 0, '2. ... and no second-player bonus for a Double Time that is off'); }
{ for(const [rules, want] of [[{}, false], [QC, true]]){ const {e, P} = mk({rules}); P[1].perks = {secondPitch:true}; P[1].hand = [{uid: 78001, defId:'rv-wall'}, {uid: 78002, defId:'rv-wall'}];
    e.pitchCard(P, so, 1, P[1].hand[0], {}, []);
    ok(!!P[1].discardUsedThisTurn === want, `2. Second Pitch: ${want ? 'the pitch is used up under QC (the perk waits)' : 'a second pitch this turn'}`); } }
{ // Supreme Tide gives the plain Tide bonus under QC (read from the source: the helper is internal)
  const src = R('bramblewood-engine.js');
  ok(/function supremeTideOf\(card\)\{[^\n]*e\.supremeTide\) && !quietOn\(\)/.test(src), '2. Supreme Tide is off under QC (plain Tide bonuses)');
  ok(/rules\.tallGrass && !quietOn\(\)\) pAmt \*= 2/.test(src) && /tallGrassStab = [^\n]*&& !quietOn\(\)/.test(src), '2. Tall Grass: no double Pounce / Backstab under QC');
  ok(/pl\.perks\.echo && !quietStills\(boardCard/.test(src) && /s\.pl\.perks\.echo && !quietStills\(null/.test(src), '2. Echoing Wood: no copy under QC (both spawn paths)');
  ok(/const ACTIONS = rules\.quietContemplation \? 1/.test(src), '2. Double Time reads QC'); }
// a whole match under QC: invariants hold, nothing doubles
{ const {e, P} = mk({rules: QC, seed: 9}); ['qc-twin', 'qc-ff', 'qc-crit'].forEach((id, i)=> put(e, P, 1, id, i - 1)); ['alley-cat', 'swift-fox', 'snow-owl-sentinel'].forEach((id, i)=> put(e, P, 2, id, i - 1));
  const ev = []; for(let r = 1; r <= 8; r++){ e.roundStart(P, r, so, {}, ev); if(e.resolveCombat(P, so, {}, ev, r % 2 ? 1 : 2)) break; }
  ok(H.checkInvariants(P, 'end').length === 0 && !ev.some(x=> x.type === 'fastForward' || x.type === 'frenzy') && quiet(ev) > 0, '2. eight rounds under QC: no extra turns, no second swings, quiet lines, invariants hold'); }

// ---- 2b. Map 21's boss fight carries it; the texts
const app = R('arena_app.js'), TXT = require(path.join(ROOT, 'bramblewood-texts.js')).TEXT;
ok(/\{ key:"21-6", kind:"boss", name:"The Cathedral Eagle"[^\n]*rules:\{"quietContemplation":true\}/.test(app), '2b. 21-6 (the Cathedral Eagle) has rules.quietContemplation');
ok(/\n  quietContemplation:\s*\{icon:'🧘', name:TX\('ui\.fx-name-quiet-contemplation'\), editor:'quietcontemplation'/.test(app), '2b. FIELD2 has Quiet Contemplation (Environment card, Edit skirmish, Map Codex)');
ok(/\['quietContemplation', \{quietContemplation:true\}/.test(app), '2b. the Effects library stages it');
const words = s=> String(s).replace(/<[^>]*>/g, ' ').trim().split(/\s+/).filter(Boolean).length;
['ui.fx-quiet-contemplation', 'ui.fx-quiet-contemplation-short', 'ui.log-quiet-stills', 'ui.log-revive', 'ui.skill-revive'].forEach(k=> ok(TXT[k] && words(TXT[k]) < 20, `2b. ${k} is terse (${TXT[k] ? words(TXT[k]) : 'missing'} words)`));
ok(TXT['ui.fxx-quiet-contemplation'] && /Headwind/.test(TXT['ui.fxx-quiet-contemplation']) && /Second Pitch/.test(TXT['ui.fxx-quiet-contemplation']) && /Fast Forward/.test(TXT['ui.fxx-quiet-contemplation']), '2b. the Codex line lists what it blocks');
ok(/case 'quiet': return ev\.defId \? \{cls:'', text:TX\('ui\.log-quiet-stills'/.test(app) && /case 'revive': return \{cls:'gold', text:TX\('ui\.log-revive'/.test(app), '2b. battle log lines through TX');
ok(/if\(ev\.type==='death' && !ev\.revives\)\{/.test(app), '2b. the replay keeps the tile of a unit whose death a revive follows');
const CODES = ['fr', 'de', 'es', 'it', 'pt', 'tl', 'ta', 'id', 'zh-Hans', 'zh-Hant', 'ja', 'ko'];
const KEYS = ['ui.fx-name-quiet-contemplation', 'ui.fx-quiet-contemplation', 'ui.fx-quiet-contemplation-short', 'ui.fxx-quiet-contemplation', 'ui.log-quiet-stills', 'ui.log-revive', 'ui.skill-revive'];
const LEAD = /^[\s\p{Extended_Pictographic}\p{So}️‍↻→←▸▾•·★☆✓✕✗⚡]*/u, core = s=> s.trim().replace(LEAD, '').trim();
CODES.forEach(code=>{ const pack = JSON.parse(R('lang/' + code + '.json'));
  const miss = KEYS.filter(k=> !(TXT[k] in pack) && !(core(TXT[k]) in pack)); ok(!miss.length, `2b. ${code}: every new text has a translation (${miss.join(', ')})`); });

// ---- 3. the stated rules
const D = JSON.parse(R('docs/decisions.json')), md = R('docs/decisions.md');
const rv = (D.rules || []).find(r=> r.date === '2026-10-19' && /00:19/.test(r.intro || ''));
ok(rv && rv.items.some(x=> /Revive is a true death/.test(x)) && rv.items.some(x=> /Rescue is not a death/.test(x)) && rv.items.some(x=> /Quiet Contemplation/.test(x)), '3. decisions.json: the 2026-10-19 RV rules (Revive, Rescue, Quiet Contemplation)');
ok(!JSON.stringify(D).includes('Revive is not a death'), '3. the old "Revive is not a death" rule is gone');
ok(/Revive is a true death/.test(md) && /Quiet Contemplation/.test(md), '3. decisions.md regenerated with them');

console.log(`rv-2026-10-19: ${n - fail}/${n} passed`);
process.exit(fail ? 1 : 0);
