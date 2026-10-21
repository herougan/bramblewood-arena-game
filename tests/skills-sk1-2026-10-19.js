#!/usr/bin/env node
// Package SK1 (2026-10-19, owner 21:36: new combat skills). Engine scenarios for each skill, then the app's registry, the texts in the
// 12 packs, the skill costs, the cards and the decisions:
//   Sentry N (enter / move / swap; once per unit per look), Formation (N) (stacking, the cap, raid rows), Isolation (the table, a
//   parameter), Anchor (each displacement), Expose N (strips hiding, for N rounds), Exploit N (tokens, used one a hit), Punish N (flag),
//   Siege N (Structures and the bramble, the old Demolisher alias), Spoils N, Venom Pulse N, and the Cure / Heal / Cleanse split.
'use strict';
const fs = require('fs'), path = require('path');
const H = require('./lib/harness.js'), E = H.Engine;
const ROOT = path.join(__dirname, '..'), R = f=> fs.readFileSync(path.join(ROOT, f), 'utf8');
let fail = 0, n = 0; const ok = (c, m)=>{ n++; if(!c){ fail++; console.log('  ✗', m); } };
const so = id=> id===1 ? 'A' : 'B';
const U = (id, effects, o)=> Object.assign({id, name:id, attack:0, health:30, wait:0, cost:0, archetypes:['Sk'], effects: effects || {}}, o || {});
const defs = Object.assign({}, H.loadCardDefs(), {
  'sk-wall':     U('sk-wall'),
  'sk-hit3':     U('sk-hit3', {}, {attack:3}),
  'sk-hit10':    U('sk-hit10', {}, {attack:10}),
  'sk-weak':     U('sk-weak', {}, {health:5}),
  'sk-tower':    U('sk-tower', {}, {archetypes:['Structure'], health:30}),
  'sk-sentry':   U('sk-sentry', {sentry:true}),
  'sk-sentry3':  U('sk-sentry3', {sentry:3}),
  'sk-sentryW':  U('sk-sentryW', {sentry:true}, {wait:3}),
  'sk-restless': U('sk-restless', {restless:true}),
  'sk-swapper':  U('sk-swapper', {triggers:[{on:'onSpawn', do:'swapPositions'}]}),
  'sk-form':     U('sk-form', {formation:true}, {attack:2, health:10}),
  'sk-form2':    U('sk-form2', {formation:2}, {attack:2, health:10}),
  'sk-iso':      U('sk-iso', {isolation:true}, {attack:6, health:20}),
  'sk-isoT':     U('sk-isoT', {isolation:[2, 1, 0]}, {attack:6, health:20}),
  'sk-isoLow':   U('sk-isoLow', {isolation:true}, {attack:1, health:3}),
  'sk-anchor':   U('sk-anchor', {anchor:true}),
  'sk-anchorR':  U('sk-anchorR', {anchor:true, restless:true}),
  'sk-waveR':    U('sk-waveR', {wave:'right'}, {attack:1}),
  'sk-mind':     U('sk-mind', {triggers:[{on:'onSpawn', do:'mindControl', who:'enemy', sub:'random'}]}),
  'sk-expose':   U('sk-expose', {expose:2}, {attack:3}),
  'sk-evasive':  U('sk-evasive', {evasive:true}),
  'sk-swift':    U('sk-swift', {swift:true}),
  'sk-stealth':  U('sk-stealth', {stealth:true}, {attack:2}),
  'sk-exploit':  U('sk-exploit', {exploit:true}, {attack:3}),
  'sk-armor1':   U('sk-armor1', {armor:1}),
  'sk-spoils':   U('sk-spoils', {spoils:true}, {attack:10}),
  'sk-pulse':    U('sk-pulse', {venomPulse:true}, {attack:1}),
  'sk-pulse2':   U('sk-pulse2', {venomPulse:2}, {attack:1}),
  'sk-siege':    U('sk-siege', {siege:3}, {attack:2}),
  'sk-siegeT':   U('sk-siegeT', {siege:true}, {attack:2}),
  'sk-demo':     U('sk-demo', {demolisher:3}, {attack:2}),
  'sk-punish':   U('sk-punish', {punish:true}),
  'sk-cleanser': U('sk-cleanser', {triggers:[{on:'onRoundStart', do:'cleanse'}]}),
  'sk-cleanse1': U('sk-cleanse1', {triggers:[{on:'onRoundStart', do:'cleanse', amount:1}]}),
  'sk-renewal':  U('sk-renewal', {renewal:true}),
  'sk-cure':     U('sk-cure', {cure:2}),
});
const all = pl=> [...pl.row.left, ...pl.row.center, ...pl.row.right];
function mk(seed, rules, mode, o){ const e = E.makeSimEngine(defs, E.mulberry32(seed||7), Object.assign({recordEvents:true, battleMode: mode || 'open', rules: rules || {}}, o || {})); return {e, P:{1:e.newPlayer(1,{}), 2:e.newPlayer(2,{})}}; }
function put(e, P, pid, id, side, ev){ ok(e.debugSpawnCard(P, so, pid, id, side || 'left', {}, ev || []), `placed ${id}`); return all(P[pid]).filter(x=> x.defId === id).reduce((a, x)=> (!a || x.uid > a.uid) ? x : a, null); }
const fight = (e, P, first)=>{ const ev = []; e.resolveCombat(P, so, {}, ev, first || 1); return ev; };
const start = (e, P, round)=>{ const ev = []; e.roundStart(P, round || 1, so, {}, ev); return ev; };
const hitOn = (ev, uid)=> ev.filter(x=> x.type === 'hit' && x.targetUid === uid).reduce((t, x)=> t + (x.dmg || 0), 0);
const SENTRY = new Set(); // the Sentry units' uids: their strikes are the hits they deal (On Enemy Enters (Facing): Damage N)
const sentryOn = (ev, uid)=> ev.filter(x=> x.type === 'hit' && x.targetUid === uid && SENTRY.has(x.attUid));
const putS = (e, P, pid, id, side, ev)=>{ const c = put(e, P, pid, id, side, ev); SENTRY.add(c.uid); return c; };
const fx = (ev, kind)=> ev.filter(x=> x.type === 'statusFx' && x.kind === kind);

// ---- 1. Sentry N: enter (play), move (Restless), swap; once per unit per look; Waiting yes, Stunned no
{ const {e, P} = mk(); const s = putS(e, P, 1, 'sk-sentry'); ok(s.slot === 0, 'the Sentry stands in the centre');
  const ev = []; const b0 = put(e, P, 2, 'sk-wall', 'left', ev); ok(b0.slot === 0 && b0.hp === 28 && sentryOn(ev, b0.uid).length === 1 && ev.some(x=> x.type === 'triggerFired' && x.hook === 'onEnemyEnter'), `Sentry (true = 2, an On Enemy Enters (Facing) trigger): a unit played in front of it takes 2 (${b0.hp})`);
  const ev1 = []; const b1 = put(e, P, 2, 'sk-wall', 'right', ev1); ok(b1.slot === 1 && b1.hp === 28, `... and one played into the slot beside that (${b1.slot}: ${b1.hp})`);
  const ev2 = []; const b2 = put(e, P, 2, 'sk-wall', 'right', ev2); ok(b2.slot === 2 && b2.hp === 30 && !sentryOn(ev2, b2.uid).length, 'a unit two slots over is outside its watch');
  const evF = fight(e, P); ok(!evF.some(x=> x.type === 'sentry'), 'once per unit per look: nobody moved, so no second strike next round');
  ok(b0.hp === 28 && b1.hp === 28, 'the watched units were struck once each'); }
{ const {e, P} = mk(); putS(e, P, 1, 'sk-sentry3'); const ev = []; const b = put(e, P, 2, 'sk-wall', 'left', ev); ok(b.hp === 27 && hitOn(ev, b.uid) === 3, `Sentry 3 deals 3 (${b.hp})`); }
{ const {e, P} = mk(); const s = putS(e, P, 1, 'sk-sentryW'); ok(s.wait === 3, 'a Waiting Sentry'); const b = put(e, P, 2, 'sk-wall'); ok(b.hp === 30, 'a Waiting Sentry does not strike (a reactive trigger is off while Waiting)'); }
{ const {e, P} = mk(); const s = putS(e, P, 1, 'sk-sentry'); s.stunned = 1; const b = put(e, P, 2, 'sk-wall'); ok(b.hp === 30, 'a Stunned Sentry does not strike'); }
{ const {e, P} = mk(); putS(e, P, 1, 'sk-sentry'); putS(e, P, 1, 'sk-sentry', 'right'); const ev = []; const b = put(e, P, 2, 'sk-wall', 'left', ev);
  ok(sentryOn(ev, b.uid).length === 2 && b.hp === 26, `two Sentries watching the same slot strike once each (${sentryOn(ev, b.uid).length} strikes, ${b.hp})`); }
{ const {e, P} = mk(); putS(e, P, 1, 'sk-sentry'); const b0 = put(e, P, 2, 'sk-wall'); const b1 = put(e, P, 2, 'sk-wall', 'right'); const r = put(e, P, 2, 'sk-restless', 'right');
  ok(r.slot === 2 && r.hp === 30, 'a Restless unit starts outside the watch');
  const ev = start(e, P, 1).concat(fight(e, P)); ok(r.slot === 1 && b1.slot === 2, `Restless walks in (swapping its ally out): ${r.slot}, ${b1.slot}`);
  ok(sentryOn(ev, r.uid).length === 1 && r.hp === 28, `Sentry strikes a unit that MOVES into its watch (${r.hp})`);
  ok(!sentryOn(ev, b1.uid).length, '... not the ally that moved out of it'); }
{ const {e, P} = mk(3); const b0 = put(e, P, 2, 'sk-wall'), b1 = put(e, P, 2, 'sk-wall', 'right'), b2 = put(e, P, 2, 'sk-wall', 'right');
  putS(e, P, 1, 'sk-sentry'); ok([b0, b1, b2].every(b=> b.hp === 30), 'units already standing when the Sentry arrives are not struck');
  const ev = []; put(e, P, 1, 'sk-swapper', 'right', ev); const sw = ev.find(x=> x.type === 'swapPositions'); ok(!!sw, 'the swap happened');
  const moved = [b0, b1, b2].filter(b=> b.uid === sw.aUid || b.uid === sw.bUid), inWatch = moved.filter(b=> Math.abs(b.slot) <= 1);
  ok(inWatch.length >= 1 && inWatch.every(b=> sentryOn(ev, b.uid).length === 1 && b.hp === 28), `Sentry strikes a unit swapped into or within its watch (${inWatch.map(b=> b.slot + ':' + b.hp).join(', ')})`);
  ok(moved.filter(b=> Math.abs(b.slot) > 1).every(b=> b.hp === 30), '... not one swapped out of it'); }

// ---- 2. Formation (N): +N/+N per aligned ally, up to 2, recomputed on every board change
{ const {e, P} = mk(); const f = put(e, P, 1, 'sk-form'); ok(!(f.sk1Atk) && f.maxHp === 10, 'Formation alone: no bonus');
  put(e, P, 1, 'sk-wall', 'left'); ok(f.sk1Atk === 1 && f.maxHp === 11 && f.hp === 11, `one ally beside it: +1/+1 (${f.sk1Atk}, ${f.hp}/${f.maxHp})`);
  put(e, P, 1, 'sk-wall', 'right'); ok(f.sk1Atk === 2 && f.maxHp === 12, `two allies beside it: +2/+2 (${f.sk1Atk}, ${f.maxHp})`);
  put(e, P, 1, 'sk-wall', 'right'); ok(f.sk1Atk === 2 && f.maxHp === 12, 'a unit two slots away is not aligned with it');
  const ev = []; const evS = fight(e, P); ok(fx(evS, 'sk1Aura').length === 0, 'no change, no event'); }
{ const {e, P} = mk(); const f = put(e, P, 1, 'sk-form2'); put(e, P, 1, 'sk-wall', 'left'); put(e, P, 1, 'sk-wall', 'right'); ok(f.sk1Atk === 4 && f.maxHp === 14, `Formation 2: +2/+2 a neighbour, so +4/+4 (${f.sk1Atk})`); }
{ const {e, P} = mk(); const f = put(e, P, 1, 'sk-form'); const al = put(e, P, 1, 'sk-weak', 'left'); put(e, P, 2, 'sk-wall'); put(e, P, 2, 'sk-hit10', 'left');
  ok(f.sk1Atk === 1, 'the ally stands beside it'); const ev = fight(e, P); ok(al.hp <= 0 && !(f.sk1Atk) && f.maxHp === 10, `its ally falls: the bonus goes (${f.sk1Atk || 0}, ${f.maxHp})`);
  ok(fx(ev, 'sk1Aura').some(x=> x.targetUid === f.uid && x.dAtk === -1), 'the board is told (sk1Aura)'); }
{ const {e, P} = mk(1, {}, 'open', {reserveRows:2, reserveActs:true}); const f = put(e, P, 1, 'sk-form'); e.fillReserve(P[1], 1, 0, 'sk-wall'); put(e, P, 2, 'sk-wall');
  ok(f.sk1Atk === 1, `raid: the ally right behind it counts (${f.sk1Atk})`);
  put(e, P, 1, 'sk-wall', 'left'); put(e, P, 1, 'sk-wall', 'right'); ok(f.sk1Atk === 2 && f.maxHp === 12, `three aligned allies: capped at 2 (${f.sk1Atk})`); }
{ const {e, P} = mk(1, {}, 'open', {sk1:{formationMax:1}}); const f = put(e, P, 1, 'sk-form'); put(e, P, 1, 'sk-wall', 'left'); put(e, P, 1, 'sk-wall', 'right'); ok(f.sk1Atk === 1, 'the cap is a parameter (opts.sk1.formationMax)'); }

// ---- 3. Isolation: the table (4, 3, 2, 1, 0 for 0, 1, 2, 3, 4+ allies within 2 columns), flat Attack and Health
{ const {e, P} = mk(); const c = put(e, P, 1, 'sk-iso'); ok(c.sk1Atk === -4 && c.maxHp === 16 && c.hp === 16, `alone: −4/−4 (${c.sk1Atk}, ${c.hp}/${c.maxHp})`);
  put(e, P, 1, 'sk-wall', 'left'); ok(c.sk1Atk === -3 && c.maxHp === 17 && c.hp === 17, `1 ally near: −3/−3 (${c.sk1Atk}, ${c.hp})`);
  put(e, P, 1, 'sk-wall', 'right'); ok(c.sk1Atk === -2, '2 allies: −2'); put(e, P, 1, 'sk-wall', 'left'); ok(c.sk1Atk === -1, '3 allies: −1');
  put(e, P, 1, 'sk-wall', 'right'); ok(!(c.sk1Atk) && c.maxHp === 20 && c.hp === 20, `4 allies: no debuff (${c.sk1Atk || 0}, ${c.hp}/${c.maxHp})`);
  put(e, P, 1, 'sk-wall', 'right'); ok(!(c.sk1Atk), 'an ally 3 columns away is not near'); }
{ const {e, P} = mk(); const c = put(e, P, 1, 'sk-isoT'); ok(c.sk1Atk === -2, 'its own table (effects.isolation = [2, 1, 0]): −2 alone');
  put(e, P, 1, 'sk-wall', 'left'); put(e, P, 1, 'sk-wall', 'right'); put(e, P, 1, 'sk-wall', 'left'); ok(!(c.sk1Atk), '... the last entry for 2+ allies'); }
{ const {e, P} = mk(1, {}, 'open', {sk1:{isolationTable:[2, 2, 1, 1, 0]}}); const c = put(e, P, 1, 'sk-iso'); ok(c.sk1Atk === -2 && c.maxHp === 18, 'the engine table is a parameter (halved: opts.sk1.isolationTable)'); }
{ const {e, P} = mk(); const c = put(e, P, 1, 'sk-isoLow'); ok(c.hp === 1 && c.maxHp === 1, `its Health never drops below 1 (${c.hp}/${c.maxHp})`);
  put(e, P, 1, 'sk-wall'); ok(c.hp >= 1, 'it lives on'); }
{ const {e, P} = mk(); const c = put(e, P, 1, 'sk-iso'); const t = put(e, P, 2, 'sk-wall'); const ev = fight(e, P); ok(hitOn(ev, t.uid) === 2, `an isolated 6-Attack unit hits for 2 (${hitOn(ev, t.uid)})`); }

// ---- 4. Anchor: nothing moves it
{ const {e, P} = mk(); putS(e, P, 1, 'sk-sentry'); const a = put(e, P, 2, 'sk-wall'); const ar = put(e, P, 2, 'sk-anchorR', 'right'); put(e, P, 2, 'sk-wall', 'right');
  const s0 = ar.slot; start(e, P, 1); ok(ar.slot === s0, 'Anchor: its own Restless does not move it'); }
{ const {e, P} = mk(); put(e, P, 1, 'sk-wall'); put(e, P, 2, 'sk-wall'); const an = put(e, P, 2, 'sk-anchor', 'right'); const r = put(e, P, 2, 'sk-restless', 'right');
  put(e, P, 1, 'sk-wall', 'left'); const s0 = an.slot; start(e, P, 1); ok(an.slot === s0, 'Anchor: a Restless ally cannot swap places with it'); }
{ const {e, P} = mk(); put(e, P, 1, 'sk-waveR'); const t = put(e, P, 2, 'sk-anchor'); const ev = fight(e, P); ok(t.slot === 0 && hitOn(ev, t.uid) === 1, 'Anchor: a Wave hit does not push it'); }
{ const {e, P} = mk(5, {awash:1}); const t = put(e, P, 2, 'sk-anchor'); put(e, P, 1, 'sk-wall'); const s0 = t.slot; for(let r = 1; r <= 4; r++){ start(e, P, r); fight(e, P); } ok(t.slot === s0, 'Anchor: the field\'s Wave does not move it'); }
{ const {e, P} = mk(); put(e, P, 2, 'sk-anchor'); put(e, P, 2, 'sk-wall', 'right'); const ev = []; put(e, P, 1, 'sk-swapper', 'left', ev); ok(!ev.some(x=> x.type === 'swapPositions'), 'Anchor: it cannot be swapped (one movable unit left: no swap)'); }
{ const {e, P} = mk(); const t = put(e, P, 2, 'sk-anchor'); put(e, P, 1, 'sk-mind'); ok(all(P[2]).includes(t) && !all(P[1]).includes(t), 'Anchor: Mind Control cannot drag it across'); }
{ const {e, P} = mk(); const t = put(e, P, 2, 'sk-wall'); put(e, P, 1, 'sk-mind'); ok(all(P[1]).includes(t), '(control: Mind Control takes a plain unit)'); }

// ---- 5. Expose N: strips hiding for N rounds; no extra damage
{ const {e, P} = mk(11); put(e, P, 1, 'sk-hit3'); const t = put(e, P, 2, 'sk-evasive'); let dodged = 0; for(let r = 0; r < 12; r++){ dodged += fight(e, P).filter(x=> x.type === 'evaded' && x.targetUid === t.uid).length; t.hp = 30; }
  ok(dodged > 0, `(control: an Evasive unit dodges: ${dodged} of 12)`); }
{ const {e, P} = mk(11); put(e, P, 1, 'sk-hit3'); const t = put(e, P, 2, 'sk-evasive'); let dodged = 0; for(let r = 0; r < 12; r++){ t.exposed = 2; dodged += fight(e, P).filter(x=> x.type === 'evaded' && x.targetUid === t.uid).length; t.hp = 30; }
  ok(dodged === 0, `an Exposed Evasive unit never dodges (${dodged})`); }
{ const {e, P} = mk(11); put(e, P, 1, 'sk-hit3'); const t = put(e, P, 2, 'sk-swift'); let dodged = 0; for(let r = 0; r < 16; r++){ t.exposed = 2; dodged += fight(e, P).filter(x=> x.type === 'evaded' && x.targetUid === t.uid && x.reason === 'swift').length; t.hp = 30; }
  ok(dodged > 0, `Swift is not hiding: an Exposed Swift unit still dodges (${dodged} of 16)`); }
{ const {e, P} = mk(); put(e, P, 1, 'sk-hit3'); const t = put(e, P, 2, 'sk-wall'); t.invisible = 3; const ev = fight(e, P); ok(hitOn(ev, t.uid) === 0, '(control: an Invisible unit cannot be hit)');
  t.exposed = 2; const ev2 = fight(e, P); ok(hitOn(ev2, t.uid) === 3, `an Exposed Invisible unit is found and hit (${hitOn(ev2, t.uid)})`); }
{ const {e, P} = mk(13); put(e, P, 1, 'sk-hit3'); const t = put(e, P, 2, 'sk-wall'); let miss = 0; for(let r = 0; r < 12; r++){ t.smoke = 2; t.exposed = 2; miss += fight(e, P).filter(x=> x.type === 'evaded' && x.targetUid === t.uid).length; t.hp = 30; }
  ok(miss === 0, `Smoke does not hide an Exposed unit (${miss})`); }
{ const {e, P} = mk(); const s = put(e, P, 1, 'sk-stealth'); const t = put(e, P, 2, 'sk-wall'); const ev = fight(e, P); ok(ev.some(x=> x.type === 'hitHQ' && x.attUid === s.uid) && hitOn(ev, t.uid) === 0, '(control: Stealth hits the bramble past the blocker)');
  s.exposed = 2; const ev2 = fight(e, P); ok(hitOn(ev2, t.uid) === 2 && !ev2.some(x=> x.type === 'hitHQ' && x.attUid === s.uid), 'an Exposed Stealth unit is blocked like anyone'); }
{ const {e, P} = mk(); put(e, P, 1, 'sk-expose'); const t = put(e, P, 2, 'sk-wall'); const ev = fight(e, P);
  ok(t.exposed === 2 && fx(ev, 'expose').some(x=> x.targetUid === t.uid && x.amount === 2) && ev.some(x=> x.type === 'triggerFired' && x.hook === 'onHit' && x.action === 'expose'), `Expose 2: its hit leaves the target Exposed for 2 rounds (${t.exposed})`);
  const ev2 = fight(e, P); ok(hitOn(ev2, t.uid) === 3, `Expose adds no damage now (the crit moved to Exploit): ${hitOn(ev2, t.uid)}`); }
{ const {e, P} = mk(); put(e, P, 1, 'sk-wall'); const t = put(e, P, 2, 'sk-wall'); t.exposed = 2; fight(e, P); ok(t.exposed === 1, `Exposed wears off a round each upkeep (${t.exposed})`); const ev = fight(e, P);
  ok(t.exposed === 0 && ev.some(x=> x.type === 'statusEnd' && x.status === 'exposed' && x.uid === t.uid), 'and ends (statusEnd)'); }

// ---- 6. Exploit N: tokens; +1 a hit, one token used; ticks don't use them
{ const {e, P} = mk(); put(e, P, 1, 'sk-hit3'); const t = put(e, P, 2, 'sk-wall'); t.exploit = 2;
  const h1 = hitOn(fight(e, P), t.uid); ok(h1 === 4 && t.exploit === 1, `Exploit token: 3 + 1, one used (${h1}, ${t.exploit} left)`);
  const ev2 = fight(e, P); ok(hitOn(ev2, t.uid) === 4 && t.exploit === 0, 'the second token'); ok(fx(ev2, 'exploitHit').some(x=> x.targetUid === t.uid && x.amount === 0), 'the board hears each token used (exploitHit)');
  ok(hitOn(fight(e, P), t.uid) === 3, 'no tokens: a plain hit'); }
{ const {e, P} = mk(); put(e, P, 1, 'sk-hit3'); const t = put(e, P, 2, 'sk-armor1'); t.exploit = 1; ok(hitOn(fight(e, P), t.uid) === 3, 'Armor soaks after the bonus (3 + 1 − 1)'); }
{ const {e, P} = mk(1, {}, 'open', {sk1:{exploitBonus:2}}); put(e, P, 1, 'sk-hit3'); const t = put(e, P, 2, 'sk-wall'); t.exploit = 1; ok(hitOn(fight(e, P), t.uid) === 5, 'the bonus is a parameter (opts.sk1.exploitBonus)'); }
{ const {e, P} = mk(); put(e, P, 1, 'sk-wall'); const t = put(e, P, 2, 'sk-wall'); t.exploit = 1; t.poison = 3; fight(e, P); ok(t.exploit === 1, 'a Poison tick is not a hit: the token stays'); }
{ const {e, P} = mk(); put(e, P, 1, 'sk-exploit'); const t = put(e, P, 2, 'sk-wall'); const ev = fight(e, P); ok(t.exploit === 2 && fx(ev, 'exploit').some(x=> x.amount === 2) && ev.some(x=> x.type === 'triggerFired' && x.hook === 'onHit' && x.action === 'exploit'), `Exploit (true = 2): its hit puts 2 tokens on (${t.exploit})`);
  ok(hitOn(fight(e, P), t.uid) === 4, '... and its next hit cashes one (+1)'); }

// ---- 7. Spoils N
{ const {e, P} = mk(); const s = put(e, P, 1, 'sk-spoils'); put(e, P, 2, 'sk-weak'); const ev = fight(e, P); ok(s.maxHp === 32 && s.hp === 32 && ev.some(x=> x.type === 'triggerFired' && x.hook === 'onKillCreature') && ev.some(x=> x.type === 'namedBuff' && x.amount2 === 2), `Spoils (true = 2): a kill gives +0/+2 (${s.hp}/${s.maxHp})`); }
{ const {e, P} = mk(); const s = put(e, P, 1, 'sk-spoils'); const t = put(e, P, 2, 'sk-tower'); t.hp = 5; fight(e, P); ok(t.hp <= 0 && s.maxHp === 30, 'a Structure is no creature: no spoils'); }

// ---- 8. Venom Pulse N
{ const {e, P} = mk(); put(e, P, 1, 'sk-pulse'); const t = put(e, P, 2, 'sk-wall'); t.poison = 4; const ev = fight(e, P); const pt = ev.filter(x=> x.type === 'poisonTick' && x.uid === t.uid);
  ok(pt.some(x=> x.pulse && x.dmg === 3 && x.decay === false), `Venom Pulse: the hit makes its Poison tick once more (${JSON.stringify(pt.map(x=> [x.dmg, !!x.pulse]))})`);
  ok(t.poison === 3, `the pulse does not wear the stack down (only the upkeep tick did: ${t.poison})`); }
{ const {e, P} = mk(); put(e, P, 1, 'sk-pulse2'); const t = put(e, P, 2, 'sk-wall'); t.poison = 3; const ev = fight(e, P); ok(ev.filter(x=> x.type === 'poisonTick' && x.pulse && x.uid === t.uid).length === 2, 'Venom Pulse 2: two pulses'); }
{ const {e, P} = mk(); put(e, P, 1, 'sk-pulse'); const t = put(e, P, 2, 'sk-wall'); const ev = fight(e, P); ok(!ev.some(x=> x.type === 'poisonTick' && x.pulse), 'no Poison, no pulse'); }

// ---- 9. Cure / Heal / Cleanse
{ const {e, P} = mk(); const c = put(e, P, 1, 'sk-wall'); c.hp = 20; c.bleed = 3; const n0 = e.debugHeal(P, so, c.uid, 5, {}, []); ok(n0 === 5 && c.hp === 25 && c.bleed === 3, `Heal only heals: +5 Health, the Bleed stays (${c.hp}, bleed ${c.bleed})`);
  c.hp = 30; const ev = []; const n1 = e.debugHeal(P, so, c.uid, 5, {}, ev); ok(n1 === 0 && c.bleed === 3 && !ev.length, 'a full-Health Bleeding unit has nothing to heal (no stanch, no event)'); }
{ const {e, P} = mk(); put(e, P, 1, 'sk-cure'); const a = put(e, P, 1, 'sk-wall', 'right'); a.poison = 5; a.bleed = 2; const ev = fight(e, P);
  ok(fx(ev, 'cure').some(x=> x.targetUid === a.uid && x.poison === 2 && !x.bleed) && a.bleed === 1 /* only the upkeep's fade */, `Cure removes Poison only (poison ${a.poison}, bleed ${a.bleed})`); }
{ const {e, P} = mk(); put(e, P, 2, 'sk-wall'); const c = put(e, P, 1, 'sk-cleanser'); Object.assign(c, {poison:3, bleed:2, scar:1, exposed:2, exploit:2, shocked:1, brittle:1, corrode:1, armorLoss:1, blind:2, tipsy:1});
  c.daunts = [{n:1, until:99}]; e.debugFireTrigger(P, so, c.uid, 'onRoundStart', {}, []);
  ok(c.bleed === 0 && c.scar === 0 && c.exposed === 0 && c.exploit === 0 && c.shocked === 0 && c.brittle === 0 && c.corrode === 0 && c.armorLoss === 0 && !c.daunts.length, 'Cleanse removes the physical debuffs (Bleed, Scar, Exposed, Exploit, Vulnerable, Brittle, Corrosion, Rend, Weakness)');
  ok(c.poison === 3 && c.blind === 2 && c.tipsy === 1, `... not Poison (Cure's), nor Blind or Tipsy (${c.poison}, ${c.blind}, ${c.tipsy})`); }
{ const {e, P} = mk(); put(e, P, 2, 'sk-wall'); const c = put(e, P, 1, 'sk-cleanse1'); c.poison = 2; c.bleed = 2; c.scar = 1; e.debugFireTrigger(P, so, c.uid, 'onRoundStart', {}, []); ok(c.poison === 2 && c.bleed === 1 && c.scar === 1, 'Cleanse 1: one physical counter, Poison untouched'); }
{ const {e, P} = mk(); const c = put(e, P, 1, 'sk-renewal'); c.poison = 3; c.bleed = 2; c.frozen = 0; const ev = fight(e, P); ok(c.bleed === 0 && c.poison === 2, `Renewal follows Cleanse: Bleed gone, Poison only ticked (${c.poison})`); }
{ const ph = H.loadCardDefs()['phoenix-fledgling']; ok(ph && ph.effects.renewal && ph.effects.cure > 0, 'Phoenix Fledgling keeps its intent: Renewal + Cure'); }

// ---- 10. Siege N (the old Demolisher, an alias)
{ const {e, P} = mk(); put(e, P, 1, 'sk-siege'); const t = put(e, P, 2, 'sk-tower'); ok(hitOn(fight(e, P), t.uid) === 5, 'Siege 3: 2 + 3 on a Structure'); }
{ const {e, P} = mk(); put(e, P, 1, 'sk-siege'); const t = put(e, P, 2, 'sk-wall'); ok(hitOn(fight(e, P), t.uid) === 2, '... not on a creature'); }
{ const {e, P} = mk(); put(e, P, 1, 'sk-siege'); const ev = fight(e, P); const h = ev.find(x=> x.type === 'hitHQ'); ok(h && h.dmg === 5 && h.siege, `Siege 3: 2 + 3 on the bramble (${h && h.dmg})`); }
{ const {e, P} = mk(); put(e, P, 1, 'sk-siegeT'); const ev = fight(e, P); const h = ev.find(x=> x.type === 'hitHQ'); ok(h && h.dmg === 4, 'Siege (true = 2) on the bramble'); }
{ const {e, P} = mk(); put(e, P, 1, 'sk-demo'); const t = put(e, P, 2, 'sk-tower'); ok(hitOn(fight(e, P), t.uid) === 5, 'an old Demolisher 3 card reads as Siege 3 on a Structure'); }
{ const {e, P} = mk(); put(e, P, 1, 'sk-demo'); const h = fight(e, P).find(x=> x.type === 'hitHQ'); ok(h && h.dmg === 5, '... and on the bramble'); }
{ const cards = JSON.parse(R('canonical/cards.json')); ok(!cards.some(c=> c.effects && c.effects.demolisher != null), 'no canonical card carries the old demolisher key');
  ['beetle-battering-ram', 'badger-sapper', 'mouse-sapper', 'siege-rhino', 'trebuchet-crew'].forEach(id=>{ const c = cards.find(x=> x.id === id); ok(c && c.effects.siege > 0, `${id}: Siege (was Demolisher)`); }); }

// ---- 11. Punish N (behind a flag)
{ const {e, P} = mk(); put(e, P, 1, 'sk-hit3'); put(e, P, 2, 'sk-punish'); const ev = fight(e, P); ok(!fx(ev, 'punish').length, 'Punish is off without the flag'); }
{ const {e, P} = mk(1, {punishSkill:true}); const a = put(e, P, 1, 'sk-hit3'); put(e, P, 2, 'sk-punish'); const ev = fight(e, P); ok(fx(ev, 'punish').length === 1 && a.hp === 28, `flag on (rules.punishSkill): the unit that hit it takes 2 at the round's end (${a.hp})`);
  const ev2 = []; e.resolveCombat(P, so, {}, ev2, 1); ok(fx(ev2, 'punish').length === 1, 'every round it is hit'); }
{ const {e, P} = mk(1, {}, 'open', {flags:{punish:true}}); const a = put(e, P, 1, 'sk-wall'); put(e, P, 2, 'sk-punish'); const ev = fight(e, P); ok(!fx(ev, 'punish').length && a.hp === 30, 'flag on (opts.flags.punish): nobody hit it, nobody pays'); }

// ---- 12. Triggers × actions (owner 21:56): the keyword shorthands, and the new triggers / actions on a hand-made card
const eng = R('bramblewood-engine.js');
ok(E.TRIGGER_KEYS ? ['onEnemyEnter', 'onHit', 'onKillCreature'].every(k=> E.TRIGGER_KEYS.includes(k)) : /TRIGGER_KEYS\.push\('onEnemyEnter', 'onHit', 'onKillCreature'\)/.test(eng), 'new triggers: On Enemy Enters (Facing), On Hit, On Kill (Creature)');
ok(/ACTION_KEYS\.push\('exploit', 'poisonTick'\)/.test(eng), 'new actions: Exploit, Poison Tick');
ok(/do:'damage', who:'enemy', sub:'subject', amount:N\('sentry'\)/.test(eng) && /on:'onHit', do:'expose'/.test(eng) && /on:'onHit', do:'exploit'/.test(eng) && /on:'onHit', do:'poisonTick'/.test(eng) && /on:'onKillCreature', do:'buff', who:'self', amount2:N\('spoils'\)/.test(eng), 'Sentry / Expose / Exploit / Venom Pulse / Spoils are trigger × action shorthands');
{ const d2 = Object.assign({}, defs, {'sk-hand': U('sk-hand', {triggers:[{on:'onHit', do:'poisonTick', who:'enemy', sub:'subject', amount:1}, {on:'onKillCreature', do:'buff', who:'self', amount:1}]}, {attack:30})});
  const e = E.makeSimEngine(d2, E.mulberry32(3), {recordEvents:true, battleMode:'open'}), P = {1:e.newPlayer(1,{}), 2:e.newPlayer(2,{})};
  e.debugSpawnCard(P, so, 1, 'sk-hand', 'left', {}, []); e.debugSpawnCard(P, so, 2, 'sk-weak', 'left', {}, []); const h = all(P[1])[0];
  const ev = []; e.resolveCombat(P, so, {}, ev, 1); ok(h.atk === 31, `a hand-made On Kill (Creature): Buff +1 Attack works (${h.atk})`); }

// ---- 13. The app: registry (the Skills chapter of the Codex book), short lines, icons, statuses, hooks
const appSrc = R('arena_app.js');
const TXT = (()=>{ const t = R('bramblewood-texts.js'); return JSON.parse(t.slice(t.indexOf('/*TEXT-TABLE-START*/') + 20, t.indexOf('/*TEXT-TABLE-END*/'))); })();
const words = s=> String(s).replace(/<[^>]*>/g, ' ').trim().split(/\s+/).filter(Boolean).length;
const blockA = appSrc.slice(appSrc.indexOf('// ==== Package SK1 (2026-10-19, owner 21:36: new combat skills; rules'), appSrc.indexOf('// ==== end of Package SK1 (registry)'));
const blockB = appSrc.slice(appSrc.indexOf('// ==== Package SK1 (2026-10-19): statuses'), appSrc.indexOf('// ==== end of Package SK1 (statuses and board)'));
ok(blockA.length > 500 && blockB.length > 500, 'the two SK1 app blocks');
ok(appSrc.indexOf('// ==== end of Package SK1 (registry)') < appSrc.indexOf('const SKILL_DEFS = ['), 'the registry block runs before SKILL_DEFS is built from PASSIVE_DEFS');
['formation', 'isolation', 'anchor', 'exploit', 'spoils', 'venomPulse', 'punish'].forEach(k=> ok(new RegExp(`\\{key:'${k}', category:'(passive|evergreen)', (hidden:true, reserved:true, )?label:TX\\('ui\\.skn-`).test(blockA), `${k}: in PASSIVE_DEFS with a TX name`));
['sentry', 'expose', 'siege', 'demolisher', 'cure', 'healing'].forEach(k=> ok(blockA.includes(`sk1Patch(PASSIVE_DEFS, '${k}'`), `${k}: patched in place (TX text)`));
['onEnemyEnter', 'onHit', 'onKillCreature'].forEach(k=> ok(blockA.includes(`{key:'${k}', label:TX(`), `trigger ${k} in TRIGGER_DEFS`));
['exploit', 'poisonTick'].forEach(k=> ok(blockA.includes(`{key:'${k}', label:TX(`), `action ${k} in ACTION_DEFS`));
['heal', 'cleanse', 'expose'].forEach(k=> ok(blockA.includes(`sk1Patch(ACTION_DEFS, '${k}'`), `the ${k} action's text is rewritten`));
['sentry', 'expose', 'exploit', 'siege', 'formation', 'isolation', 'anchor', 'spoils', 'venomPulse', 'punish', 'cure', 'healing'].forEach(k=> ok(new RegExp(`\\n  ${k}: [^\\n]*TX\\('ui\\.sk-`).test(blockB), `${k}: a terse SKILL_TEXT line (TX)`));
['formation', 'isolation', 'anchor', 'exploit', 'spoils', 'venomPulse', 'punish'].forEach(k=> ok(new RegExp(`\\b${k}:'[^']+'`).test(blockA), `${k}: an icon`));
ok(blockB.includes("['exploit', 'exploit', TX('ui.skn-exploit')") && blockB.includes("STATUS_KEYWORDS.push({k:'exploit'"), 'Exploit is a live status line and a status (the Statuses chapter)');
ok(appSrc.includes('{ const k = sk1LogText(ev, nm); if(k) return k; }') && appSrc.includes('try{ sk1Vfx(ev); }catch(e){}') && appSrc.includes('try{ sk1StatusBadges(c, badges); }catch(e){}'), 'the log, the looks and the status chips are hooked');
ok(appSrc.includes('exploit:c.exploit||0, sk1Atk:c.sk1Atk||0') && appSrc.includes('exploit:rc.exploit||0, sk1Atk:rc.sk1Atk||0'), 'the replay snapshot carries Exploit and the Formation / Isolation bonus');
ok((appSrc.match(/\(liveC\.sk1Atk\|\|0\)|\(c\.sk1Atk\|\|0\)/g) || []).length >= 2, 'the board\'s Attack shows the Formation / Isolation bonus');
ok(appSrc.includes('const m = sk1MigrateSiege(liveCards[id]);'), 'saved / server cards with Demolisher read as Siege (buildCardDefs)');
{ const fn = new Function('numOr', appSrc.slice(appSrc.indexOf('function sk1MigrateSiege(c){'), appSrc.indexOf('// ==== end of Package SK1 (registry)')) + '; return sk1MigrateSiege;')((v, d)=> v === true || v == null ? d : (Number(v) || d));
  const a = fn({id:'x', effects:{demolisher:3}}), b = fn({id:'y', effects:{siege:4, demolisher:3}}), c = fn({id:'z', effects:{armor:1}});
  ok(a.effects.siege === 3 && a.effects.demolisher == null && b.effects.siege === 4 && !('demolisher' in b.effects) && c.effects.armor === 1 && !c.effects.siege, 'alias loading: Demolisher 3 → Siege 3; Siege 4 + Demolisher 3 → Siege 4; others untouched'); }
// ---- 14. Texts: TX keys used, terse, in the 12 packs
const SK1_KEY = /^ui\.(skn-(sentry|expose|siege|formation|isolation|anchor|exploit|spoils|venom-pulse|punish)|sk-(sentry|expose|exploit|siege|formation|isolation|anchor|spoils|venom-pulse|punish|cure|healing)|st-exploit|ls-exploit|exploit-tip|aura-|log-(expose-rounds|exploit|poison-pulse|punish|formation|isolation|aura-off)|float-(sentry|exploit|punish)|trg-on-(enemy-enter|hit|kill-creature)|act-(exploit|poison-tick|expose-desc|heal-desc|cleanse-desc))/;
const TKEYS = Object.keys(TXT).filter(k=> SK1_KEY.test(k));
ok(TKEYS.length === 63, `63 package SK1 TX keys (${TKEYS.length})`);
TKEYS.forEach(k=> ok(appSrc.includes(`TX('${k}'`) || R('bramblewood-fx-a.js').includes(`TX('${k}'`), `${k} is used`));
TKEYS.filter(k=> !/codex|desc|^ui\.act-/.test(k)).forEach(k=> ok(words(TXT[k]) < 20, `${k} is terse (${words(TXT[k])} words)`));
ok(/hiding/.test(TXT['ui.st-exposed']) && /hiding/.test(TXT['ui.ls-exposed']) && !/crit/.test(TXT['ui.exposed-tip']), 'the Exposed texts describe hiding, not crits');
const CODES = ['fr', 'de', 'es', 'it', 'pt', 'tl', 'ta', 'id', 'zh-Hans', 'zh-Hant', 'ja', 'ko'];
const LEAD = /^[\s\p{Extended_Pictographic}\p{So}️‍]*/u, core = s=> s.trim().replace(LEAD, '').trim();
const ph = s=> JSON.stringify((String(s).match(/\{\w+\}/g) || []).filter(x=> x !== '{s}').sort());
CODES.forEach(code=>{ const pack = JSON.parse(R('lang/' + code + '.json'));
  const keys = TKEYS.concat(['ui.st-exposed', 'ui.ls-exposed', 'ui.exposed-tip']);
  const miss = keys.filter(k=> !(TXT[k] in pack) && !(core(TXT[k]) in pack)); ok(!miss.length, `${code}: every SK1 text is translated (${miss.join(', ')})`);
  const bad = keys.filter(k=>{ const tr = pack[TXT[k]] || pack[core(TXT[k])]; return tr && ph(TXT[k]) !== ph(tr); }); ok(!bad.length, `${code}: every {placeholder} kept (${bad.join(', ')})`); });
// ---- 15. Skill costs (canonical/skill-costs.json): estimates, low confidence
const SC = require('../tools/skill_costs.js'), table = JSON.parse(R('canonical/skill-costs.json')), Tc = SC.make(table);
const est = e=> e && e.measuredHow === 'estimate SK1' && e.measuredConf === 'low' && typeof e.measuredS === 'number' && !e.appliedAt;
['formation', 'isolation', 'anchor', 'punish'].forEach(id=> ok(est(table.skills.find(x=> x.id === id)), `skill ${id}: an S estimate (estimate SK1, low)`));
['onEnemyEnter', 'onHit', 'onKillCreature'].forEach(id=> ok(est(table.triggers.find(x=> x.id === id)), `trigger ${id}: a weight estimate`));
['exploit', 'poisonTick'].forEach(id=> ok(est(table.actions.find(x=> x.id === id)), `action ${id}: a value estimate`));
['exploit', 'venomPulse', 'spoils'].forEach(id=> ok(est(table.shorthands[id]), `shorthand ${id}: trigger × action, estimated`));
ok(table.skills.find(x=> x.id === 'isolation').value < 0, 'Isolation costs less than nothing (a drawback, like the payments)');
ok(Tc.cardS({spoils:2}).S === Math.round(table.triggers.find(x=> x.id === 'onKillCreature').value * table.actions.find(x=> x.id === 'buff.amount2').value * 2 * 100) / 100, `Spoils 2 = On Kill (Creature) × Buff (+Health) × 2 (${Tc.cardS({spoils:2}).S})`);
['formation', 'isolation', 'anchor', 'punish', 'exploit', 'venomPulse', 'spoils'].forEach(k=> ok(!Tc.cardS({[k]: 1}).missing.length, `${k} has a cost (no missing entry)`));
['sentry', 'expose', 'siege'].forEach(id=> ok(/package SK1/.test((table.skills.find(x=> x.id === id) || {}).sk1Note || ''), `${id}: flagged for re-measuring (sk1Note)`));
// ---- 16. No live card carries a new skill; the docs
const ALL = JSON.parse(R('canonical/cards.json'));
// 2026-10-21 (BF5, the owner's 10-21 ruling on the ants: "give each a distinct second skill"): the Soldier Ant carries Formation 1, the one exception
ok(!ALL.some(c=> c.id !== 'soldier-ant' && c.effects && ['formation', 'isolation', 'anchor', 'exploit', 'spoils', 'venomPulse', 'punish'].some(k=> c.effects[k] != null)), 'no card has a new skill yet (owner: not on existing cards; BF5: but the Soldier Ant\'s Formation)');
const D = JSON.parse(R('docs/decisions.json')), md = R('docs/decisions.md'), sk = (D.rules || []).find(r=> /Package SK1/.test(r.intro || ''));
ok(sk && sk.items.some(x=> /Maps 21–40 are mostly about using the skills already learnt/.test(x)) && sk.items.some(x=> /canonical animals, arrange skills and stats/.test(x)), 'decisions.json: the two design notes');
ok(md.includes('**Maps 21–40 are mostly about using the skills already learnt**') && md.includes('**Cure / Heal / Cleanse**'), 'decisions.md regenerated with them');
ok(fs.existsSync(path.join(ROOT, 'docs/skills-punish-proposal.md')) && /## B\./.test(R('docs/skills-punish-proposal.md')), 'docs/skills-punish-proposal.md (three designs, B built)');
ok(/skills-sk1-2026-10-19\.js/.test(R('tests/run-all.sh')), 'in tests/run-all.sh');
console.log(fail ? `skills-sk1-2026-10-19: ${fail} of ${n} checks FAILED` : `skills-sk1-2026-10-19: all ${n} checks passed`);
process.exit(fail ? 1 : 0);
