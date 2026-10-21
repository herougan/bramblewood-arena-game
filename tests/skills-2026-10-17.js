#!/usr/bin/env node
// 2026-10-17 (skills). The user's notes (20:19):
//   5b. "Add a new skill Reflect: that reflects ranged skills back at a random enemy unit."
//   11. "Vanguard skill: This card draws itself into its hand at the start of the game, and you discard a random card. (If you have >1,
//       you only do this once. If you alr have a vanguard card in your hand, you skip this step) Vanguards also have +1/+1 if played as
//       first card this game. Vanguard N -> +N/+N."
//   22. "🕸️ (Web) Skill"  -> Web N: its hits Web the target for N rounds (a Webbed unit can't dodge, can't move or be moved).
//   23. "Bloodlust + Ambush: Ambush N - whenever a unit enters this unit's opposing side, deal N damage. Bloodlust: when this unit kills an
//       opposing unit, it jumps to oppose next available creature* unit if possible. However, it deals 1/2 damage to structures and
//       brambles. Bloodlust has the specific extra feat that it counts in triggering Ambush."
//   + the skill-combo list: Carrion N (heal when anything dies), Leech (heal on hit, the old `sap`), Crab Claws (only left / right),
//     Sentry (attack a unit entering the 3 facing slots), Hoard N (Attack from Lumber), Venom Master N, Fletcher N, Herbalist N, Shatter N.
'use strict';
const fs = require('fs'), path = require('path');
const {TEXT: TEXT_D, TX: TX_D} = require(path.join(__dirname, '..', 'bramblewood-texts.js')); // 2026-10-18 (package D): the terse texts are TX keys
const H = require('./lib/harness.js');
const E = H.Engine;
let fail = 0, n = 0; const ok = (c, m)=>{ n++; if(!c){ fail++; console.log('  ✗', m); } };
const so = id=> id===1 ? 'A' : 'B';
const U = (id, effects, o)=> Object.assign({id, name:id, attack:3, health:500, wait:0, cost:0, effects: effects || {}}, o || {});
const base = H.loadCardDefs();
const defs = Object.assign({}, base, {
  's7-wall': U('s7-wall', {}, {attack:0}), 's7-hit': U('s7-hit'), 's7-frail': U('s7-frail', {}, {attack:0, health:2}),
  's7-mirror': U('s7-mirror', {reflect:true}, {attack:0}), 's7-mirror30': U('s7-mirror30', {reflect:30}, {attack:0}),
  's7-archer': U('s7-archer', {arrow:3}, {attack:0}), 's7-mirror-archer': U('s7-mirror-archer', {reflect:true, arrow:2}, {attack:0}),
  's7-spit': U('s7-spit', {poisonBolt:2}, {attack:0}), 's7-sky': U('s7-sky', {skyfall:4}, {attack:0}), 's7-fire': U('s7-fire', {fireball:5}, {attack:0}),
  's7-van': U('s7-van', {vanguard:true}, {attack:2, health:2}), 's7-van2': U('s7-van2', {vanguard:2}, {attack:2, health:2}),
  's7-web': U('s7-web', {web:2}, {attack:1}), 's7-evade': U('s7-evade', {evasive:true}, {attack:0}), 's7-fly': U('s7-fly', {flying:true}, {attack:0}),
  's7-wave': U('s7-wave', {wave:'left'}, {attack:1}),
  's7-blood': U('s7-blood', {bloodlust:true}, {attack:5}), 's7-blood1': U('s7-blood1', {bloodlust:1}, {attack:5}),
  's7-struct': U('s7-struct', {}, {attack:0, archetypes:['Structure']}), 's7-lurker': U('s7-lurker', {ambush:3}, {attack:0}),
  's7-amb': U('s7-amb', {ambush:true}, {attack:0}), 's7-amb-hit': U('s7-amb-hit', {ambush:true}, {attack:2}),
  's7-pop': U('s7-pop', {onDeathSpawn:{defId:'s7-wall', count:1}}, {attack:0, health:1}),
  's7-sentry': U('s7-sentry', {sentry:true}, {attack:4}), 's7-sentry-wait': U('s7-sentry-wait', {sentry:true}, {attack:4, wait:2}),
  's7-crab': U('s7-crab', {crabClaws:true}),
  's7-carrion': U('s7-carrion', {carrion:true}, {attack:0}), 's7-killer': U('s7-killer', {}, {attack:10}),
  's7-hoard': U('s7-hoard', {hoard:true}, {attack:1}),
  's7-adder': U('s7-adder', {poison:1}, {attack:1}), 's7-bleeder': U('s7-bleeder', {bleed:1}, {attack:1}), 's7-vm': U('s7-vm', {venomMaster:true}, {attack:0}),
  's7-fletch': U('s7-fletch', {fletcher:true}, {attack:0}), 's7-archer2': U('s7-archer2', {arrow:2}, {attack:0}),
  's7-regen': U('s7-regen', {regen:2}, {attack:0}), 's7-herb': U('s7-herb', {herbalist:true}, {attack:0}),
  's7-shatter': U('s7-shatter', {shatter:true}, {attack:3}),
});
const all = pl=> [...pl.row.left, ...pl.row.center, ...pl.row.right];
function mk(o){ o = o || {}; const e = E.makeSimEngine(defs, E.mulberry32(o.seed||7), {recordEvents:true, battleMode: o.mode || 'open', rules: o.rules || undefined});
  return {e, P:{1:e.newPlayer(1, o.deck1 || {}), 2:e.newPlayer(2, o.deck2 || {})}}; }
const newest = pl=> all(pl).reduce((a, x)=> (!a || x.uid > a.uid) ? x : a, null);
// Played the real way (debugSpawnCard runs every on-play effect, Ambush and Sentry included).
function play(e, P, pid, id, side, ev){ e.debugSpawnCard(P, so, pid, id, side == null ? 'left' : side, {}, ev || []); return newest(P[pid]); }
// Set up on an exact slot, quietly (no on-play effects, so no Ambush / Sentry either) and already settled there, as if it had
// stood there all along.
function put(e, P, pid, id, slot){ const pl = P[pid]; const c = e.makeBoardCard(id); c.slot = slot; c._seenAt = slot;
  const cs = all(pl).concat(c); pl.row.center = cs.filter(x=> x.slot === 0); pl.row.left = cs.filter(x=> x.slot < 0).sort((a, b)=> b.slot - a.slot); pl.row.right = cs.filter(x=> x.slot > 0).sort((a, b)=> a.slot - b.slot);
  e.syncSlots(pl); return c; }
const src = fs.readFileSync(path.join(__dirname, '..', 'arena_app.js'), 'utf8');
const eng = fs.readFileSync(path.join(__dirname, '..', 'bramblewood-engine.js'), 'utf8');
const cards = JSON.parse(fs.readFileSync(path.join(__dirname, '..', 'canonical', 'cards.json'), 'utf8')); const byId = {}; cards.forEach(c=> byId[c.id] = c);

// ---- 5b. Reflect: a shot aimed at it bounces at a random enemy unit
{ const {e, P} = mk(); const R = put(e, P, 1, 's7-mirror', 0); const A = put(e, P, 2, 's7-archer', 0), W = put(e, P, 2, 's7-wall', 1); const ev = [];
  e.debugAttack(P, so, A.uid, {}, ev);
  ok(R.hp === 500, `Reflect: the arrow aimed at it doesn't hurt it (${R.hp})`);
  ok((500 - A.hp) + (500 - W.hp) === 3, `...it hits one of the archer's side for 3 (archer ${A.hp}, wall ${W.hp})`);
  const rs = ev.find(x=> x.type === 'reflectShot'), h = ev.find(x=> x.type === 'hit' && x.attUid === R.uid);
  ok(rs && rs.uid === R.uid && [A.uid, W.uid].includes(rs.targetUid), 'a reflectShot event names the bounce');
  ok(h && h.ranged === true && h.targetUid === rs.targetUid && h.side === 'A', 'the bounced hit is the Reflect unit\'s own shot'); }
{ const seen = new Set(); for(let s = 1; s <= 30; s++){ const {e, P} = mk({seed:s}); put(e, P, 1, 's7-mirror', 0); const A = put(e, P, 2, 's7-archer', 0), W = put(e, P, 2, 's7-wall', 1);
    e.debugAttack(P, so, A.uid, {}, []); if(A.hp < 500) seen.add('archer'); if(W.hp < 500) seen.add('wall'); }
  ok(seen.size === 2, `the bounce picks a random enemy unit (${[...seen]})`); }
{ let bounced = 0; const N = 300; for(let s = 1; s <= N; s++){ const {e, P} = mk({seed:s}); const R = put(e, P, 1, 's7-mirror30', 0); const A = put(e, P, 2, 's7-archer', 0);
    e.debugAttack(P, so, A.uid, {}, []); if(R.hp === 500) bounced++; }
  ok(bounced > N*0.2 && bounced < N*0.4, `an old Reflect 30 is a 30% chance to bounce (${bounced}/${N})`); }
{ const {e, P} = mk(); const R = put(e, P, 1, 's7-mirror', 0); const M = put(e, P, 2, 's7-hit', 0); const ev = []; e.debugAttack(P, so, M.uid, {}, ev);
  ok(R.hp === 497 && M.hp === 500 && !ev.some(x=> x.type === 'reflect' || x.type === 'reflectShot'), `melee is not a shot: no bounce, and the old melee Reflect is gone (${R.hp}, ${M.hp})`); }
{ const {e, P} = mk(); const R = put(e, P, 1, 's7-mirror', 0); const S = play(e, P, 2, 's7-sky', 0);
  ok(R.hp === 496 && S.hp === 500, `Skyfall falls from above: not reflected (${R.hp}, ${S.hp})`); }
{ const {e, P} = mk(); const R = put(e, P, 1, 's7-mirror', 0); const B = put(e, P, 2, 's7-spit', 0); e.debugAttack(P, so, B.uid, {}, []);
  ok(R.poison === 0 && B.poison === 2, `a Poison Bolt (no damage) bounces too: the spitter is Poisoned (${R.poison}, ${B.poison})`); }
{ const {e, P} = mk(); const R = put(e, P, 1, 's7-mirror', 0); const ev = []; const F = play(e, P, 2, 's7-fire', 0, ev);
  ok(R.hp === 500 && F.hp === 495, `Fireball: the whole burst bounces back at the caster's side (${R.hp}, ${F.hp})`);
  ok(ev.some(x=> x.type === 'reflectShot' && x.fireball) && ev.filter(x=> x.type === 'fireball').length === 2, 'a fireball out, a reflectShot, a fireball back'); }
{ const {e, P} = mk(); const R1 = put(e, P, 1, 's7-mirror-archer', 0); const R2 = put(e, P, 2, 's7-mirror', 0); const ev = []; e.debugAttack(P, so, R1.uid, {}, ev);
  ok(R2.hp === 500 && R1.hp === 498 && ev.filter(x=> x.type === 'reflectShot').length === 1, `a bounced shot never bounces again (the archer, a Reflect unit itself, takes it: ${R1.hp})`); }
ok(byId['mirror-moth'].effects.reflect === true && byId['test-skill-reflect'].effects.reflect === true, 'cards: Mirror Moth and the Reflect test card are Reflect (always)');

// ---- 11. Vanguard
{ const {e, P} = mk({deck1:{'s7-wall':9}}); const pl = P[1]; pl.deck = ['s7-van', 's7-wall', 's7-wall', 's7-wall', 's7-wall', 's7-wall']; const ev = [];
  e.draw(pl, 3, 'A', {}, ev);
  ok(pl.hand.length === 3 && pl.hand.some(h=> h.defId === 's7-van'), `opening hand: the Vanguard jumps in (${pl.hand.map(h=> h.defId)})`);
  ok(pl.graveyard.length === 1 && pl.deck.length === 2, `...and a random other card is discarded (graveyard ${pl.graveyard.length}, deck ${pl.deck.length})`);
  ok(ev.some(x=> x.type === 'vanguard' && x.defId === 's7-van' && x.discardDefId === 's7-wall'), 'a vanguard event');
  e.draw(pl, 1, 'A', {}, []); ok(pl.hand.length === 4, 'later draws are plain draws'); }
{ const {e, P} = mk(); const pl = P[1]; pl.deck = ['s7-wall', 's7-wall', 's7-van', 's7-wall']; e.draw(pl, 3, 'A', {}, []);
  ok(pl.graveyard.length === 0 && pl.hand.filter(h=> h.defId === 's7-van').length === 1, 'a Vanguard already in the opening hand: the step is skipped'); }
{ const {e, P} = mk(); const pl = P[1]; pl.deck = ['s7-van', 's7-van2', 's7-wall', 's7-wall', 's7-wall']; e.draw(pl, 3, 'A', {}, []);
  ok(pl.hand.filter(h=> /s7-van/.test(h.defId)).length === 1 && pl.graveyard.length === 1, 'two Vanguards in the deck: only one comes (once)'); }
{ const {e, P} = mk(); const pl = P[1]; pl.deck = ['s7-van', 's7-wall', 's7-wall', 's7-wall', 's7-wall']; pl.drawnTotal = 5; e.draw(pl, 1, 'A', {}, []);
  ok(!pl.hand.some(h=> h.defId === 's7-van') && pl.graveyard.length === 0, 'a player who has drawn before (a saved fight) gets no Vanguard step'); }
{ const {e, P} = mk(); const pl = P[1]; pl.hand.push({uid:9001, defId:'s7-van2'}); pl._openingDealt = true; const ev = [];
  ok(e.placeCard(P, so, 1, 9001, 0, {}, ev), 'set-up: the Vanguard 2 is played as the first card');
  const V = newest(pl); ok(V.atk === 4 && V.hp === 4 && V.maxHp === 4, `the first card this game: +2/+2 (${V.atk}/${V.hp})`);
  ok(ev.some(x=> x.type === 'statusFx' && x.kind === 'vanguard' && x.amount === 2), 'a vanguard statusFx'); }
{ const {e, P} = mk(); const pl = P[1]; pl.hand.push({uid:9001, defId:'s7-wall'}, {uid:9002, defId:'s7-van'}); pl._openingDealt = true;
  e.placeCard(P, so, 1, 9001, 0, {}, []); e.roundStart(P, 2, so, {}, []); pl.playedThisTurn = false; e.placeCard(P, so, 1, 9002, 'left', {}, []);
  const V = all(pl).find(c=> c.defId === 's7-van'); ok(V && V.atk === 2 && V.hp === 2, `not the first card: no bonus (${V && V.atk}/${V && V.hp})`); }

// ---- 22. Web
{ let landedAfter = 0, tries = 0, webbedAt = null; const {e, P} = mk({seed:3}); const T = put(e, P, 2, 's7-evade', 0); const W = put(e, P, 1, 's7-web', 0);
  for(let i = 0; i < 40 && !(T.webbed > 0); i++) e.debugAttack(P, so, W.uid, {}, []);
  webbedAt = T.webbed; ok(webbedAt === 2, `Web 2: a landed hit Webs the target for 2 rounds (${webbedAt})`);
  for(let i = 0; i < 20; i++){ const ev = []; e.debugAttack(P, so, W.uid, {}, ev); tries++; if(!ev.some(x=> x.type === 'evaded')) landedAfter++; }
  ok(landedAfter === tries, `a Webbed Evasive unit can't dodge (${landedAfter}/${tries})`); }
{ const {e, P} = mk(); const T = put(e, P, 2, 's7-fly', 0); T.webbed = 5; const A = put(e, P, 1, 's7-hit', 0); let miss = 0;
  for(let i = 0; i < 30; i++){ const ev = []; e.debugAttack(P, so, A.uid, {}, ev); if(ev.some(x=> x.type === 'evaded')) miss++; }
  ok(miss === 0, `a Webbed Flyer loses its Flying dodge (${miss} misses)`); }
{ const {e, P} = mk(); const T = put(e, P, 2, 's7-wall', 0); T.webbed = 3; const A = put(e, P, 1, 's7-wave', 0); const ev = []; e.debugAttack(P, so, A.uid, {}, ev);
  const wv = ev.find(x=> x.type === 'wave'); ok(T.slot === 0 && (!wv || wv.blocked), `a Webbed unit can't be pushed (slot ${T.slot})`); }
{ const {e, P} = mk(); const T = put(e, P, 2, 's7-wall', 0); T.webbed = 1; put(e, P, 1, 's7-wall', 0); const ev = [];
  e.roundStart(P, 2, so, {}, ev); e.resolveCombat(P, so, {}, ev, 1);
  ok(!(T.webbed > 0) && ev.some(x=> x.type === 'statusEnd' && x.status === 'webbed'), `Webbed wears off like Bound, with a statusEnd (${T.webbed})`); }

// ---- 23a. Bloodlust: leaps on a kill, half damage on Structures and castles
{ const {e, P} = mk(); const B = put(e, P, 1, 's7-blood', 0); put(e, P, 2, 's7-frail', 0); const X = put(e, P, 2, 's7-wall', 2); const ev = [];
  e.debugAttack(P, so, B.uid, {}, ev);
  ok(B.slot === 2, `Bloodlust: it kills the unit facing it and leaps to face the next creature (slot ${B.slot})`);
  ok(ev.some(x=> x.type === 'bloodlustLeap' && x.from === 0 && x.to === 2 && x.targetUid === X.uid), 'a bloodlustLeap event (from, to, the new foe)'); }
{ const {e, P} = mk(); const B = put(e, P, 1, 's7-blood', 0); put(e, P, 2, 's7-frail', 0); put(e, P, 2, 's7-wall', -1); put(e, P, 2, 's7-wall', 3);
  e.debugAttack(P, so, B.uid, {}, []); ok(B.slot === -1, `it picks the nearest (${B.slot})`); }
{ const {e, P} = mk(); const B = put(e, P, 1, 's7-blood', 0); put(e, P, 2, 's7-frail', 0); put(e, P, 2, 's7-struct', 1); put(e, P, 2, 's7-wall', 3);
  e.debugAttack(P, so, B.uid, {}, []); ok(B.slot === 3, `a Structure is no prey: it leaps past it to a creature (${B.slot})`); }
{ const {e, P} = mk(); const B = put(e, P, 1, 's7-blood', 0); put(e, P, 1, 's7-wall', 1); put(e, P, 2, 's7-frail', 0); put(e, P, 2, 's7-wall', 1);
  const ev = []; e.debugAttack(P, so, B.uid, {}, ev); ok(B.slot === 0 && !ev.some(x=> x.type === 'bloodlustLeap'), `no free slot of its own in front of a creature: it stays (${B.slot})`); }
{ const {e, P} = mk(); const B = put(e, P, 1, 's7-blood', 0); const S = put(e, P, 2, 's7-struct', 0); e.debugAttack(P, so, B.uid, {}, []);
  ok(S.hp === 497, `half damage, rounded up, on a Structure (5 -> 3: ${500 - S.hp})`); }
{ const {e, P} = mk(); const B = put(e, P, 1, 's7-blood', 0); put(e, P, 2, 's7-wall', 4); const hq = P[2].hq.hp; e.debugAttack(P, so, B.uid, {}, []);
  ok(hq - P[2].hq.hp === 3, `half damage on the castle (${hq - P[2].hq.hp})`); }
{ const {e, P} = mk(); const B = put(e, P, 1, 's7-blood', 0); put(e, P, 2, 's7-frail', 0); const L = put(e, P, 2, 's7-lurker', 1); const ev = [];
  e.debugAttack(P, so, B.uid, {}, ev);
  ok(B.slot === 1 && B.hp === 497, `its leap counts as entering: the Lurker's Ambush 3 strikes it (slot ${B.slot}, hp ${B.hp})`);
  ok(ev.some(x=> x.type === 'ambush' && x.uid === L.uid && x.targetUid === B.uid && x.moved), 'an ambush event, marked moved'); }
{ const {e, P} = mk(); const B = put(e, P, 1, 's7-blood1', 0); const W = put(e, P, 2, 's7-wall', 0); W.bleed = 9; put(e, P, 2, 's7-frail', 2);
  for(let i = 0; i < 4; i++) e.debugAttack(P, so, B.uid, {}, []);
  ok(B.atk === 5, `an old Bloodlust 1 is just Bloodlust: no more Attack for drawing blood (${B.atk})`); }
{ const {e, P} = mk({mode:'gravity'}); const B = play(e, P, 1, 's7-blood', 'center'); play(e, P, 2, 's7-frail', 'center'); play(e, P, 2, 's7-wall', 'left'); const ev = [];
  e.debugAttack(P, so, B.uid, {}, ev); ok(!ev.some(x=> x.type === 'bloodlustLeap'), 'packed rows (gravity): no leap, the row closes up by itself'); }
ok(byId['piranha-shoal'].effects.bloodlust === true, 'cards: Piranha Shoal is Bloodlust (no number)');

// ---- 23b. Ambush: any enemy unit entering the slot facing it
{ const {e, P} = mk(); const A = put(e, P, 1, 's7-amb', 0); const X = put(e, P, 2, 's7-wall', 1); const Wv = put(e, P, 1, 's7-wave', 1); const ev = [];
  e.debugAttack(P, so, Wv.uid, {}, ev);
  ok(X.slot === 0 && X.hp === 496, `pushed into the slot facing it: Ambush 3 strikes (slot ${X.slot}, hp ${X.hp}: 1 from the wave's hit, 3 from the Ambush)`);
  ok(ev.filter(x=> x.type === 'ambush').length === 1, 'once'); void A; }
{ const {e, P} = mk(); const A = put(e, P, 1, 's7-amb-hit', 0); put(e, P, 2, 's7-pop', 0); const ev = []; e.debugAttack(P, so, A.uid, {}, ev);
  const tok = all(P[2]).find(c=> c.defId === 's7-wall');
  ok(tok && tok.slot === 0 && tok.hp === 497, `a token spawned into the slot facing it is struck too (${tok && tok.slot}, ${tok && tok.hp})`); }
{ const {e, P} = mk(); put(e, P, 1, 's7-amb', 0); const X = put(e, P, 2, 's7-wall', 0); const ev = []; e.resolveCombat(P, so, {}, ev, 1);
  ok(X.hp === 500 && !ev.some(x=> x.type === 'ambush'), 'a unit that was already facing it is left alone'); }

// ---- Sentry
{ const {e, P} = mk(); const S = put(e, P, 1, 's7-sentry', 0); put(e, P, 2, 's7-wall', 0); const ev = []; const X = play(e, P, 2, 's7-wall', 'right', ev);
  // 2026-10-19 (package SK1, owner 21:36): Sentry N = On Enemy Enters (Facing): Damage N (true = 2), for every unit that comes in (was: its
  // Attack, once a round). tests/skills-sk1-2026-10-19.js has the rest (moves, swaps, the trigger rules).
  ok(X.slot === 1 && X.hp === 498, `Sentry: an enemy played into a slot beside the one facing it takes 2 (${X.slot}: ${X.hp})`);
  ok(ev.some(x=> x.type === 'triggerFired' && x.uid === S.uid && x.hook === 'onEnemyEnter') && ev.some(x=> x.type === 'hit' && x.attUid === S.uid && x.targetUid === X.uid), 'its On Enemy Enters (Facing) trigger and the hit');
  const Y = play(e, P, 2, 's7-wall', 'left'); ok(Y.slot === -1 && Y.hp === 498, `each unit that enters, not once a round (${Y.hp})`);
  e.roundStart(P, 2, so, {}, []); const Z = play(e, P, 2, 's7-wall', 'right'); ok(Z.slot === 2 && Z.hp === 500, `out of its 3 slots: left alone (${Z.slot})`); }
{ const {e, P} = mk(); const S = put(e, P, 1, 's7-sentry-wait', 0); S.wait = 2; const X = play(e, P, 2, 's7-wall', 0); ok(X.hp === 500, 'a Waiting Sentry does nothing'); }

// ---- Crab Claws: never ahead; nobody beside -> the castle
{ const {e, P} = mk(); const F = put(e, P, 2, 's7-wall', 0); const C = put(e, P, 1, 's7-crab', 0); const hq = P[2].hq.hp; e.debugAttack(P, so, C.uid, {}, []);
  ok(F.hp === 500 && hq - P[2].hq.hp === 3, `Crab Claws with only a unit in front: the castle (${F.hp}, ${hq - P[2].hq.hp})`); }

// ---- Carrion N (default 2)
{ const {e, P} = mk(); const C = put(e, P, 1, 's7-carrion', 0); C.hp = 10; const K = put(e, P, 1, 's7-killer', 1); put(e, P, 2, 's7-frail', 1); const ev = [];
  e.debugAttack(P, so, K.uid, {}, ev); ok(C.hp === 12 && ev.some(x=> x.type === 'statusFx' && x.kind === 'carrion' && x.amount === 2), `Carrion: a unit dies, it heals 2 (${C.hp})`); }

// ---- Hoard N (default 2), Shatter N (default 2)
{ const {e, P} = mk(); const Hd = put(e, P, 1, 's7-hoard', 0); const W = put(e, P, 2, 's7-wall', 0); P[1].lumber = 7; e.debugAttack(P, so, Hd.uid, {}, []);
  ok(W.hp === 496, `Hoard: +1 Attack for every 2 Lumber (7 Lumber: 1 + 3 = ${500 - W.hp})`); }
{ const {e, P} = mk(); const Sh = put(e, P, 1, 's7-shatter', 0); const W = put(e, P, 2, 's7-wall', 0); e.debugAttack(P, so, Sh.uid, {}, []); const d0 = 500 - W.hp;
  W.frozen = 3; e.debugAttack(P, so, Sh.uid, {}, []); const d1 = 500 - W.hp - d0; ok(d0 === 3 && d1 === 5, `Shatter: +2 on a Frozen unit (${d0}, then ${d1})`); }

// ---- the auras: Venom Master, Fletcher, Herbalist (default 1 each)
{ const {e, P} = mk(); const A = put(e, P, 1, 's7-adder', 0); put(e, P, 1, 's7-vm', 1); const W = put(e, P, 2, 's7-wall', 0); e.debugAttack(P, so, A.uid, {}, []);
  ok(W.poison === 2, `Venom Master: the ally's Poison 1 hit adds 2 (${W.poison})`); }
{ const {e, P} = mk(); const A = put(e, P, 1, 's7-bleeder', 0); put(e, P, 1, 's7-vm', 1); const W = put(e, P, 2, 's7-wall', 0); e.debugAttack(P, so, A.uid, {}, []);
  ok(W.bleed === 2, `...and Bleed too (${W.bleed})`); }
{ const {e, P} = mk(); const A = put(e, P, 1, 's7-adder', 0); const W = put(e, P, 2, 's7-wall', 0); e.debugAttack(P, so, A.uid, {}, []); ok(W.poison === 1, 'without it: 1'); }
{ const {e, P} = mk(); const A = put(e, P, 1, 's7-archer2', 0); put(e, P, 1, 's7-fletch', 1); const W = put(e, P, 2, 's7-wall', 0); e.debugAttack(P, so, A.uid, {}, []);
  ok(W.hp === 497, `Fletcher: the ally's Arrow 2 hits for 3 (${500 - W.hp})`); }
{ const heal = withHerb=>{ const {e, P} = mk(); const M = put(e, P, 1, 's7-regen', 0); M.hp = 10; if(withHerb) put(e, P, 1, 's7-herb', 1); e.resolveCombat(P, so, {}, [], 1); return M.hp - 10; };
  const a = heal(false), b = heal(true); ok(a === 2 && b === 3, `Herbalist: Regeneration 2 heals 3 (${a} -> ${b})`); }

// ---- the app: skill list, short text, icons, keyword, codex note, Effects library
ok(/\{key:'reflect', category:'passive', label:'Reflect', kind:'boolean'/.test(src) && /reflect: v=> `\$\{typeof v === 'number' && v < 100/.test(src), 'Reflect: a flag in "+ Add Skill", with its card line');
ok(/\{key:'bloodlust', category:'evergreen', label:'Bloodlust', kind:'boolean'/.test(src) && /codexNote:'Its leap counts as entering: an enemy Ambush or Sentry facing its new slot strikes it\.'/.test(src), 'Bloodlust: a flag, with the Codex-only Ambush note');
ok(/\n  bloodlust: \(\)=> TX\('ui\.sk-bloodlust'\)/.test(src) && /leaps to the nearest enemy\. Half damage to Structures and brambles\./.test(TEXT_D['ui.sk-bloodlust']) && !/Ambush/.test(TEXT_D['ui.sk-bloodlust']), 'Bloodlust card line (no Ambush note on the card; 2026-10-18, package D: terse, a TX key)');
ok(/if\(p\.codexNote\) txt \+= ' ' \+ p\.codexNote;/.test(src) && /codexNote:p\.codexNote/.test(src), 'the Skills Codex adds the note');
['sap', 'vanguard', 'web', 'sentry', 'carrion', 'hoard', 'venomMaster', 'fletcher', 'herbalist', 'shatter'].forEach(k=>{
  ok(new RegExp(`\\{key:'${k}', category:'passive', label:'[A-Z][a-z]+( [A-Z][a-z]+)?'`).test(src), `${k}: in "+ Add Skill" with a simple name`);
  ok(new RegExp(`\\n  ${k}: (v|\\(\\))=> \``).test(src), `${k}: a short card line`);
  ok(k === 'sap' || ((src.match(/Object\.assign\(SKILL_ICON, \{vanguard:[^}]*\}/) || [''])[0]).includes(`${k}:'`), `${k}: an icon`);
  ok(new RegExp(`'${k}'`).test(src.slice(src.indexOf('const CHIP_FALLBACK_SKILLS'), src.indexOf('const CHIP_FALLBACK_SKILLS') + 3000)), `${k}: a chip on the card`); });
ok(/\{key:'sap', category:'passive', label:'Leech'/.test(src), 'Leech is the old sap key (heal on hit by the damage dealt)');
ok(/\{k:'webbed', re:\/\\b\(web\(\?:bed\|s\)\?\)\\b\/gi, cs:true, name:'Webbed'/.test(src) && /\['webbed', 'webbed', 'Webbed'/.test(src), 'Webbed: a status keyword with colour and gloss, and a live-status line');
ok(/SKILL_ICON, \{vanguard:'🎖️', web:'🕸️'/.test(src), 'Web: the 🕸️ icon');
['reflect', 'bloodlust', 'sentry', 'web', 'carrion', 'hoard', 'venomMaster', 'fletcher', 'herbalist', 'shatter', 'vanguard'].forEach(k=> ok(new RegExp(`\\n  ${k}: \\{`).test(src.slice(src.indexOf('const FXL_SKILL_SETUPS'))), `${k}: an Effects library setup`));
['reflectShot', 'bloodlustLeap', 'sentry', 'vanguard'].forEach(t=> ok(src.includes(`ev.type === '${t}'`), `${t}: a log line / look`));
ok(/ambush: v=> `When an enemy unit enters the slot facing it \(played, spawned or moved in\)/.test(src), 'Ambush card line');
ok(/crabClaws: \(\)=> TX\('ui\.sk-crab-claws'\)/.test(src) && /random enemy to its left or right, never the one in front; with none, the bramble/.test(TEXT_D['ui.sk-crab-claws']), 'Crab Claws card line (2026-10-18, package D: terse)');
ok(/function watchScan\(/.test(eng) && /function reflectShotOf\(/.test(eng) && /function bloodlustLeap\(/.test(eng) && /function vanguardOpening\(/.test(eng) && !/function bloodlustGain\(/.test(eng), 'engine: the new helpers; the old Bloodlust gain is gone');

console.log(`skills-2026-10-17: ${fail ? fail + ' failure(s)' : 'all passed'} (${n} checks)`); process.exit(fail ? 1 : 0);
