#!/usr/bin/env node
// 2026-10-24 (package EN8): the CPU's pitch and its lethal guard, Guardian vs Thorns, Armor vs magic, brambles that heal allies, Rampart's
// columns, the resource skills, Pearls, Windfall, the archetype clean-up and the new cards.
//   1. CPU pitching (owner 22:28 #1 / #3, 21:20 #4): the pitch comes before the play; nothing useful to play -> pitch the least valuable card
//      (keeping the one nearest to affordable); holding an unaffordable card with 3+ in hand -> pitch a spare card and still play; a deck
//      with 4 zero-cost cards of 20 plays by turn 2; every CPU level reads the same rule; the sims call the engine's aiTakeTurn;
//   2. P24-7 the lethal guard (rules.aiGuardLethal; fightRules sets it from Map 1): a blocker into the attacker's column; not when the CPU
//      wins this round itself; not without the flag (Map 0);
//   3. P24-15 a Guardian never steps in for a Thorns unit (its Thorns answer); 4. P24-16 Armor stops physical only, Magic Armor the rest;
//   5. P24-17 a bramble's healing heals an ally, never the bramble or a Structure; 6. Rampart covers its column and the next ones only;
//   7. the resource skills, Pearls paying, Windfall; 8. data: prices, texts, cards, Stem before Map 20, fightRules flags, Leafcutter.
'use strict';
const fs = require('fs'), path = require('path');
const H = require('./lib/harness.js');
const E = H.Engine, ROOT = H.ROOT || path.join(__dirname, '..');
let fail = 0, n = 0; const ok = (c, m)=>{ n++; if(!c){ fail++; console.log('  ✗', m); } };
const so = id=> id === 1 ? 'A' : 'B';
const U = (id, effects, o)=> Object.assign({id, name:id, attack:1, health:100, wait:0, cost:0, effects}, o || {});
const defs = Object.assign({}, H.loadCardDefs(), {
  'x-free': U('x-free', {}, {attack:1, health:3}), 'x-free2': U('x-free2', {}, {attack:2, health:4}),
  'x-c2': U('x-c2', {}, {attack:3, health:8, cost:2}), 'x-c3': U('x-c3', {}, {attack:4, health:10, cost:3}), 'x-c5': U('x-c5', {}, {attack:6, health:14, cost:5}),
  'x-spell0': {id:'x-spell0', name:'x-spell0', cardType:'spell', cost:0, attack:0, health:0, wait:0, spell:{do:'mend', amount:2}, effects:{}},
  'x-hit': U('x-hit', {}, {attack:10, health:500}), 'x-hit3': U('x-hit3', {}, {attack:3, health:500}), 'x-wall': U('x-wall', {}, {attack:0, health:500, wait:9}),
  'x-weak': U('x-weak', {}, {attack:0, health:5, wait:9}), 'x-blk': U('x-blk', {}, {attack:0, health:20, cost:0}), 'x-big': U('x-big', {}, {attack:30, health:20, cost:0}),
  'x-thorn': U('x-thorn', {thorns:3}, {attack:0, health:200, wait:9}), 'x-guard': U('x-guard', {guardian:true}, {attack:0, health:500, wait:9}),
  'x-arm': U('x-arm', {armor:2}, {attack:0, health:200, wait:9}), 'x-marm': U('x-marm', {magicArmor:2}, {attack:0, health:200, wait:9}),
  'x-fire': U('x-fire', {}, {attack:5, health:500, dmgType:'heat'}), 'x-mag': U('x-mag', {magic:true}, {attack:5, health:500}), 'x-phys': U('x-phys', {}, {attack:5, health:500}),
  'x-ramp': U('x-ramp', {rampart:true}, {attack:0, health:500, wait:9}), 'x-struct': U('x-struct', {}, {attack:0, health:50, wait:9, archetypes:['Structure']}),
  'x-sc': U('x-sc', {stonecutter:1}, {attack:0, health:500, wait:0}), 'x-pro': U('x-pro', {prospector:1}, {attack:9, health:500}), 'x-fel': U('x-fel', {felling:2}, {attack:9, health:500}),
  'x-pearl': U('x-pearl', {pearlBed:2}, {attack:0, health:50, wait:1}), 'x-pearl0': U('x-pearl0', {pearlBed:1}, {attack:0, health:50, wait:0}),
  'x-scav': U('x-scav', {scavenge:1}, {attack:0, health:500, wait:3}), 'x-salv': U('x-salv', {salvage:1}, {attack:0, health:500, wait:3}),
  'x-cop': U('x-cop', {coppice:1}, {attack:0, health:60, wait:0, archetypes:['Structure']}), 'x-drift': U('x-drift', {driftwood:1}, {attack:0, health:60, wait:0}),
  'x-render': U('x-render', {render:{trigger:'onSpawn', amount:3}}, {attack:0, health:500, wait:9}), 'x-shooter': U('x-shooter', {triggers:[{on:'perTurn', do:'damage', amount:4, who:'enemy', sub:'facing'}]}, {attack:5, health:500}),
  'x-stone2': U('x-stone2', {}, {attack:2, health:5, cost:1, stoneCost:2}),
});
const all = pl=> [...pl.row.left, ...pl.row.center, ...pl.row.right];
function mk(seed, opts, hp){ const e = E.makeSimEngine(defs, E.mulberry32(seed || 5), Object.assign({recordEvents:true, battleMode:'open', rules:{}}, opts || {}));
  return {e, P:{1: e.newPlayer(1, {}, {id:'st-hq', health:hp || 60, effects:{}}), 2: e.newPlayer(2, {}, {id:'st-hq', health:hp || 60, effects:{}})}}; }
function put(e, P, pid, id, slot){ const pl = P[pid]; e.debugSpawnCard(P, so, pid, id, 'left', {}, []);
  const c = all(pl).reduce((a, x)=> (!a || x.uid > a.uid) ? x : a, null); c.slot = slot;
  const cs = all(pl); pl.row.center = cs.filter(x=> x.slot === 0); pl.row.left = cs.filter(x=> x.slot < 0).sort((a, b)=> b.slot - a.slot); pl.row.right = cs.filter(x=> x.slot > 0).sort((a, b)=> a.slot - b.slot);
  e.syncSlots(pl); e.syncPhaseStats(P, so, []); return c; }
const round = (e, P, first)=>{ const ev = []; e.resolveCombat(P, so, {}, ev, first || 1); return ev; };
let huid = 90000; const hand = (P, pid, ids)=>{ P[pid].hand = ids.map(defId=> ({uid: huid++, defId})); };
const fresh = P=> [1,2].forEach(p=>{ P[p].playedThisTurn = false; P[p].discardUsedThisTurn = false; P[p].playsThisTurn = 0; });

// ---- 1. CPU pitching ------------------------------------------------------------------------------------------------------------
for(const lv of [0, 1, 2]){
  { const {e, P} = mk(11, {aiAim:true, aiLevel:lv}); hand(P, 2, ['x-c2', 'x-c3', 'x-c5']); P[2].lumber = 1; fresh(P); const ev = [];
    e.aiTakeTurn(P, so, 2, {}, ev); const d = ev.find(x=> x.type === 'discard'), play = ev.find(x=> x.type === 'play');
    ok(d && P[2].discardUsedThisTurn && d.defId !== 'x-c2', `level ${lv}: nothing useful to play -> it pitches (not the card nearest to affordable): pitched ${d && d.defId}`);
    ok(play && play.defId === 'x-c2' && P[2].lumber === 0, `level ${lv}: the pitch comes first, so the 2-cost card is played this very turn (${play && play.defId})`); }
  { const {e, P} = mk(12, {aiAim:true, aiLevel:lv}); hand(P, 2, ['x-free', 'x-free2', 'x-c5']); P[2].lumber = 0; fresh(P); const ev = [];
    e.aiTakeTurn(P, so, 2, {}, ev); const d = ev.find(x=> x.type === 'discard'), play = ev.find(x=> x.type === 'play');
    ok(d && d.defId === 'x-free' && play && play.defId === 'x-free2', `level ${lv}: holding a card it can't afford, 3 in hand: pitches the spare (${d && d.defId}) and plays the best free card (${play && play.defId})`); }
  { const {e, P} = mk(13, {aiAim:true, aiLevel:lv}); hand(P, 2, ['x-spell0', 'x-c3']); P[2].lumber = 0; fresh(P); const ev = [];
    e.aiTakeTurn(P, so, 2, {}, ev); ok(ev.some(x=> x.type === 'discard'), `level ${lv}: a spell with nothing to do is not a play: it pitches instead of passing`); }
}
{ // the 5-3 case: 4 zero-cost cards of 20; its first card comes down by turn 2 (was turn 3: the pitch came after the play)
  const deck = {'x-free': 4, 'x-c2': 8, 'x-c3': 8}; let firsts = [];
  for(let s = 1; s <= 30; s++){ const e = E.makeSimEngine(defs, E.mulberry32(s), {recordEvents:false, battleMode:'open', aiAim:true, aiLevel:1, rules:{}});
    const P = {1: e.newPlayer(1, {'x-wall': 20}, {id:'st-hq', health:60, effects:{}}), 2: e.newPlayer(2, deck, {id:'st-hq', health:60, effects:{}})};
    e.draw(P[1], 3, 'A', {}, null); e.draw(P[2], 3, 'B', {}, null); let first = 99;
    for(let r = 1; r <= 6 && first === 99; r++){ fresh(P); if(r > 1) e.roundStart(P, r, so, {}, null); e.aiTakeTurn(P, so, 2, {}, null); if(P[2].playedThisTurn) first = r; e.draw(P[2], 1, 'B', {}, null); }
    firsts.push(first); }
  const worst = Math.max(...firsts), mean = firsts.reduce((a, b)=> a + b, 0) / firsts.length;
  ok(worst <= 3 && mean <= 2, `4 zero-cost of 20: the CPU's first play by turn 2-3 (worst ${worst}, mean ${mean.toFixed(2)})`); }
{ const src = f=> fs.readFileSync(path.join(ROOT, f), 'utf8');
  ok(/aiTakeTurn\(/.test(src('arena_app.js')) && /simulateReferenceFight/.test(src('tools/skirmish_pass.js')) && /aiTakeTurn|simulateOneMatch|playReferenceGame|makeSimEngine/.test(src('tools/opt/deckopt.js')),
    'the game, tools/skirmish_pass.js and tools/opt/deckopt.js all play through the engine\'s aiTakeTurn'); }

// ---- 2. P24-7 the lethal guard --------------------------------------------------------------------------------------------------
{ const {e, P} = mk(21, {aiAim:true, aiLevel:0, rules:{aiGuardLethal:true}}, 8); put(e, P, 2, 'x-wall', 0); const A = put(e, P, 1, 'x-hit', 1);
  hand(P, 2, ['x-blk']); P[2].lumber = 0; fresh(P); const ev = []; e.aiTakeTurn(P, so, 2, {}, ev); const play = ev.find(x=> x.type === 'play');
  const blk = all(P[2]).find(c=> c.defId === 'x-blk');
  ok(play && blk && blk.slot === A.slot, `an unblocked 10 at an 8-Health bramble: the CPU blocks that column (slot ${blk && blk.slot}, attacker ${A.slot})`);
  const g = e.aiIncomingOnBramble(P, 2, null); ok(g === 0, `... and nothing reaches the bramble now (${g})`); }
{ const {e, P} = mk(22, {aiAim:true, aiLevel:0, rules:{aiGuardLethal:true}}, 8); put(e, P, 2, 'x-wall', 0); put(e, P, 1, 'x-hit', 1); P[1].hq.hp = 5;
  hand(P, 2, ['x-big', 'x-blk']); P[2].lumber = 0; fresh(P);
  ok(e.aiLethalBlock(P, 2, P[2].hand) === null, 'it can win this round itself (a 30 into an open column at a 5-Health bramble): no block, it goes for the win'); }
{ const blocks = rules=>{ let k = 0; for(let s = 1; s <= 20; s++){ const {e, P} = mk(100 + s, {aiAim:true, aiLevel:0, rules}, 8); put(e, P, 2, 'x-wall', 0); const A = put(e, P, 1, 'x-hit', 1);
    hand(P, 2, ['x-blk']); fresh(P); e.aiTakeTurn(P, so, 2, {}, []); const b = all(P[2]).find(c=> c.defId === 'x-blk'); if(b && b.slot === A.slot) k++; } return k; };
  const on = blocks({aiGuardLethal:true}), off = blocks({});
  ok(on === 20 && off < 20, `the flag gates the guard: with it every game blocks (${on}/20); without it (Map 0) the old placement (${off}/20)`); }

// ---- 3. P24-15 Guardian vs Thorns -----------------------------------------------------------------------------------------------
{ const {e, P} = mk(31); const T = put(e, P, 2, 'x-thorn', 0); const G = put(e, P, 2, 'x-guard', 1); const A = put(e, P, 1, 'x-hit3', 0); const hp0 = A.hp;
  const ev = round(e, P, 1); const h = ev.find(x=> x.type === 'hit' && x.attUid === A.uid);
  ok(h && h.targetUid === T.uid && !h.guardianRedirect, `a swing at a Thorns unit: no Guardian steps in (hit ${h && h.targetDefId})`);
  ok(ev.some(x=> x.type === 'thorns' && x.targetUid === A.uid) && A.hp === hp0 - 3, `... and its Thorns answer the attacker (${hp0} -> ${A.hp})`); void G; }
{ const {e, P} = mk(32); const W = put(e, P, 2, 'x-wall', 0); const G = put(e, P, 2, 'x-guard', 1); put(e, P, 1, 'x-hit3', 0);
  const ev = round(e, P, 1); const h = ev.find(x=> x.type === 'hit' && x.guardianRedirect); ok(h && h.targetUid === G.uid, 'a plain ally is still guarded'); void W; }

// ---- 4. P24-16 Armor and Magic Armor --------------------------------------------------------------------------------------------
{ const dmgOn = (att, def)=>{ const {e, P} = mk(41); const D = put(e, P, 2, def, 0); put(e, P, 1, att, 0); const ev = round(e, P, 1); const h = ev.find(x=> x.type === 'hit' && x.targetUid === D.uid); return h ? h.dmg : null; };
  ok(dmgOn('x-phys', 'x-arm') === 3, `Armor 2 takes 2 off a physical 5 (${dmgOn('x-phys', 'x-arm')})`);
  ok(dmgOn('x-fire', 'x-arm') === 5, `a fire swing goes past Armor (${dmgOn('x-fire', 'x-arm')})`);
  ok(dmgOn('x-mag', 'x-arm') === 5, `a magic swing goes past Armor (${dmgOn('x-mag', 'x-arm')})`);
  ok(dmgOn('x-phys', 'x-marm') === 5, `Magic Armor 2 does nothing to a physical 5 (${dmgOn('x-phys', 'x-marm')})`);
  ok(dmgOn('x-fire', 'x-marm') === 3 && dmgOn('x-mag', 'x-marm') === 3, `Magic Armor 2 takes 2 off a fire or magic 5 (${dmgOn('x-fire', 'x-marm')}, ${dmgOn('x-mag', 'x-marm')})`);
  const {e, P} = mk(42); const M = put(e, P, 2, 'x-marm', 0); const d1 = e.damageCardFlat(M, 4, 'heat'), d2 = e.damageCardFlat(M, 4, 'physical'), d3 = e.damageCardFlat(M, 4, 'poison');
  ok(d1 === 2 && d2 === 4 && d3 === 4, `a shot: Magic Armor off a fire shot (${d1}), not a physical one (${d2}), not a status tick (${d3})`); }

// ---- 5. P24-17 brambles mend allies, never themselves; Structures aren't healed -----------------------------------------------
{ const {e, P} = mk(51); P[2] = e.newPlayer(2, {}, {id:'st-hq', health:60, effects:{castleRegen:2}}); const W = put(e, P, 2, 'x-wall', 0); const S = put(e, P, 2, 'x-struct', 1);
  W.hp -= 10; S.hp -= 10; P[2].hq.hp = 40; const ev = []; e.roundStart(P, 2, so, {}, ev);
  ok(P[2].hq.hp === 40, `the bramble's own Health doesn't move (${P[2].hq.hp})`);
  ok(W.hp === W.maxHp - 8 && S.hp === S.maxHp - 10, `the wounded ally heals 2 (${W.maxHp - W.hp} short now), the Structure nothing (${S.maxHp - S.hp} short)`);
  ok(ev.some(x=> x.type === 'heal' && x.cause === 'brambleMend' && x.targetUid === W.uid && x.amount === 2), 'a brambleMend heal event names the ally'); }

// ---- 6. Rampart: its column and the next ones only ------------------------------------------------------------------------------
{ const share = (rSlot, aSlot)=>{ const {e, P} = mk(61); put(e, P, 2, 'x-ramp', rSlot); put(e, P, 1, 'x-hit3', aSlot); const ev = round(e, P, 1); return ev.find(x=> x.type === 'rampart'); };
  ok(share(1, 2) && share(1, 2).share === 2, 'an attacker one column over: Rampart takes ceil(3/2) = 2');
  ok(!share(1, 3), 'an attacker two columns over: not covered');
  ok(!share(-2, 2), 'an attacker on the far side: not covered'); }

// ---- 7. the resource skills, Pearls, Windfall -----------------------------------------------------------------------------------
{ const {e, P} = mk(71); put(e, P, 1, 'x-sc', 0); put(e, P, 2, 'x-wall', 0); const st = []; for(let r = 1; r <= 6; r++){ round(e, P, 1); st.push(P[1].stone || 0); }
  ok(st[st.length - 1] === 3 && st[0] !== st[1], `Stonecutter 1: +1 Stone every second Ready turn (Stone over 6 turns: ${st.join(',')})`); }
{ const {e, P} = mk(72); put(e, P, 1, 'x-pro', 0); put(e, P, 2, 'x-weak', 0); round(e, P, 1); ok((P[1].metal||0) === 1, `Prospector 1: a kill gives 1 Metal (${P[1].metal})`); }
{ const {e, P} = mk(73); put(e, P, 1, 'x-fel', 0); put(e, P, 2, 'x-weak', 0); const l0 = P[1].lumber; round(e, P, 1); ok(P[1].lumber - l0 === 2, `Felling 2: a kill gives 2 Lumber (${P[1].lumber - l0})`); }
{ const {e, P} = mk(74); put(e, P, 1, 'x-pearl0', 0); ok((P[1].pearls||0) === 1, `Pearl Bed 1 on a Wait-0 card: +1 Pearl as it lands Ready (${P[1].pearls})`);
  put(e, P, 1, 'x-pearl', 1); put(e, P, 2, 'x-wall', 0); for(let r = 1; r <= 2; r++) round(e, P, 1);
  ok((P[1].pearls||0) === 3, `Pearl Bed 2 with Wait 1: +2 Pearls when it becomes Ready (${P[1].pearls})`); }
{ const {e, P} = mk(75); P[1].pearls = 3; P[1].lumber = 0; P[1].stone = 1; hand(P, 1, ['x-stone2']); fresh(P);
  ok(e.canPlay(P[1], 'x-stone2', null), 'cost 1 Lumber + 2 Stone with 0 Lumber, 1 Stone and 3 Pearls: playable');
  const uid = P[1].hand[0].uid; e.placeCard(P, so, 1, uid, 0, {}, []);
  ok(P[1].lumber === 0 && P[1].stone === 0 && P[1].pearls === 1, `Pearls make up the 1 Lumber and 1 Stone short (Lumber ${P[1].lumber}, Stone ${P[1].stone}, Pearls ${P[1].pearls})`);
  P[1].pearls = 1; P[1].stone = 0; hand(P, 1, ['x-stone2']); fresh(P); ok(!e.canPlay(P[1], 'x-stone2', null), '3 short with 1 Pearl: not playable'); }
{ const {e, P} = mk(76); put(e, P, 1, 'x-scav', 0); put(e, P, 1, 'x-salv', -1); const W = put(e, P, 1, 'x-weak', 1); const S = put(e, P, 1, 'x-struct', 2);
  const l0 = P[1].lumber; W.hp = 0; e.removeDeadCards(P, so, {}, {}, []); const l1 = P[1].lumber;
  ok(l1 - l0 === 1, `Scavenge 1 (Waiting too): an ally dies: +1 Lumber (${l1 - l0}); Salvage ignores a non-Structure`);
  S.hp = 0; e.removeDeadCards(P, so, {}, {}, []); ok(P[1].lumber - l1 === 3, `a Structure dies: Scavenge +1, Salvage 1 +2 (${P[1].lumber - l1})`); }
{ const {e, P} = mk(77); const C = put(e, P, 1, 'x-cop', 0); const l = []; for(let r = 2; r <= 5; r++){ if(r === 4) e.damageCardFlat(C, 1, 'physical'); e.roundStart(P, r, so, {}, []); l.push(P[1].lumber); }
  ok(l.join(',') === '0,1,1,2', `Coppice 1: armed on its first round start, +1 after an undamaged round, nothing after a damaged one (Lumber ${l.join(',')})`); }
{ const {e, P} = mk(78, {rules:{beachMap:true, permaTide:false}}); put(e, P, 1, 'x-drift', 0); e.startTide(); const l = [];
  for(let r = 2; r <= 5; r++){ e.roundStart(P, r, so, {}, []); l.push(`${e.getTide()}:${P[1].lumber}`); }
  const ebb = l.filter(x=> x.startsWith('ebb')).length; ok(P[1].lumber === ebb && ebb > 0, `Driftwood 1 on a beach: +1 at each Ebb round start (${l.join(' ')})`);
  const m2 = mk(79, {rules:{}}); put(m2.e, m2.P, 1, 'x-drift', 0); m2.e.startTide(); for(let r = 2; r <= 5; r++) m2.e.roundStart(m2.P, r, so, {}, []); ok(m2.P[1].lumber === 0, 'not on a beach map: nothing'); }
{ const {e, P} = mk(80, {rules:{windfall:true, thunderstorm:true}}); const ev = []; for(let r = 2; r <= 4; r++) e.roundStart(P, r, so, {}, ev);
  ok(P[1].lumber >= 1 && P[2].lumber === P[1].lumber && ev.some(x=> x.type === 'lumber' && x.cause === 'windfall'), `Windfall in a Thunderstorm: both sides +1 after each storm round (${P[1].lumber}, ${P[2].lumber})`);
  const m2 = mk(81, {rules:{windfall:true}}); for(let r = 2; r <= 4; r++) m2.e.roundStart(m2.P, r, so, {}, []); ok(m2.P[1].lumber === 0, 'Windfall without a storm: nothing'); }

// ---- 7b. Render N: Daunt counters (owner 00:02 #2, 2026-10-25)
{ const {e, P} = mk(91); const T = put(e, P, 2, 'x-shooter', 0); const atk0 = e.effAtk ? e.effAtk(T) : null; const ev = []; put(e, P, 1, 'x-render', 0);
  ok(T.dauntN === 3 && T.atk === 5, `Render 3: 3 Daunt counters on the enemy facing it, its printed Attack untouched (${T.dauntN}, ${T.atk})`);
  const hpD = e.newPlayer(1, {}, {id:'st-hq', health:60, effects:{}}); void hpD; void atk0;
  const W = P[1].row.center[0]; const h0 = W.hp; const evr = round(e, P, 2); const shot = evr.find(x=> x.type === 'hit' && x.attUid === T.uid && x.ranged), sw = evr.find(x=> x.type === 'hit' && x.attUid === T.uid && !x.ranged);
  ok(shot && shot.dmg === 1, `its skill (4 damage) with 3 Daunt hits for 1 (${shot && shot.dmg})`);
  ok(sw && sw.dmg === 3, `then its swing (Attack 5) with 2 Daunt left hits for 3 (${sw && sw.dmg})`);
  ok(T.dauntN === 0, `one counter for its swing, one for its skill, one at the round's end: ${T.dauntN} left`);
  void h0; }
{ const {e, P} = mk(92); const T = put(e, P, 2, 'x-wall', 0); const W = put(e, P, 1, 'x-wall', 0); round(e, P, 1); T.dauntN = 2; const ev = [];
  T.uid; const d = e.damageCardFlat(W, 5, 'physical', 'x-shooter', T.uid); ok(d === 3, `its skill damage is 2 less with 2 Daunt (${d})`); }

// ---- 8. data -------------------------------------------------------------------------------------------------------------------
{ const sc = JSON.parse(fs.readFileSync(path.join(ROOT, 'canonical/skill-costs.json'), 'utf8')), by = Object.fromEntries(sc.skills.map(s=> [s.id, s]));
  ['stonecutter', 'prospector', 'felling', 'pearlBed', 'coppice', 'driftwood', 'magicArmor', 'scavenge', 'salvage'].forEach(k=> ok(by[k] && by[k].value > 0 && /EN8/.test(by[k].note || ''), `${k} is priced (4-round rule, EN8 note)`));
  ok(by.rampart && by.rampart.value === 0.25, `Rampart re-priced for its columns (${by.rampart && by.rampart.value})`); }
{ const TX = require(path.join(ROOT, 'bramblewood-texts.js')); const T = TX.TEXT || TX.TEXTS || TX;
  const keys = ['ui.en8-stonecutter', 'ui.en8-prospector', 'ui.en8-felling', 'ui.en8-pearl-bed', 'ui.en8-coppice', 'ui.en8-driftwood', 'ui.en8-magic-armor', 'ui.en8-scavenge', 'ui.en8-salvage', 'ui.en8-armor', 'ui.en8-guardian', 'ui.en8-mystery', 'ui.en8-castle-regen', 'ui.fx-windfall', 'ui.en8-pearl-tip', 'ui.sk-rampart', 'ui.en8-render', 'ui.en8-render-codex', 'ui.en8-log-render', 'ui.en8-daunt-badge'];
  const src = fs.readFileSync(path.join(ROOT, 'bramblewood-texts.js'), 'utf8'), en = k=>{ const m = new RegExp('"' + k.replace(/\./g, '\\.') + '": "((?:[^"\\\\]|\\\\.)*)"').exec(src); return m ? JSON.parse('"' + m[1] + '"') : null; };
  const codes = ['fr', 'de', 'es', 'it', 'pt', 'tl', 'ta', 'id', 'zh-Hans', 'zh-Hant', 'ja', 'ko'];
  keys.forEach(k=>{ const e1 = en(k); ok(e1, `${k} in bramblewood-texts.js`); codes.forEach(c=>{ const pk = JSON.parse(fs.readFileSync(path.join(ROOT, 'lang', c + '.json'), 'utf8')); if(e1 && !pk[e1]) ok(false, `${k}: no ${c} translation`); }); });
  ok(/column or beside it/.test(en('ui.sk-rampart') || ''), 'Rampart\'s line names its columns'); void T; }
{ const cards = JSON.parse(fs.readFileSync(path.join(ROOT, 'canonical/cards.json'), 'utf8')), by = Object.fromEntries(cards.map(c=> [c.id, c]));
  const om = JSON.parse(fs.readFileSync(path.join(ROOT, 'canonical/card-obtain-maps.json'), 'utf8')).maps, pools = JSON.parse(fs.readFileSync(path.join(ROOT, 'canonical/map-pools.json'), 'utf8')).maps;
  const C = require(path.join(ROOT, 'tools', 'en8_cards_2026_10_24.js'));
  C.NEW.forEach(s=>{ const c = by[s.id]; ok(c && !c.faction && (pools[s.place[0]].cards || []).includes(s.id) && c.source && c.source.map === s.place[0], `${s.id}: placed in ${s.place[0]}'s pool, no faction`); });
  const skills = ['stonecutter', 'prospector', 'felling', 'pearlBed', 'coppice', 'driftwood', 'scavenge', 'salvage', 'magicArmor'];
  skills.forEach(k=> ok(cards.some(c=> c.effects && c.effects[k] && !c.pool && !c.awaitingSource), `a placed card carries ${k}`));
  ok(by['oyster-bank'].effects.pearlBed && by['giant-clam'].effects.pearlBed, 'the Shellfish (Oyster Bank, Giant Clam) grow Pearls');
  ok(!by['leafcutter-gardener'].effects.growth && (by['leafcutter-gardener'].effects.triggers || []).some(t=> t.on === 'onReady' && t.resource === 'lumber'), 'Leafcutter Gardener: Growth -> On Ready +1 Lumber');
  const early = cards.filter(c=> c.mechanicLine !== 'evolution' && !c.pool && (om[c.id] || 0) < 20 && (((c.effects||{}).stem || (c.effects||{}).stemGrant || ((c.effects||{}).chrysalis && !(c.mysterySkills||[]).includes('chrysalis'))) || Object.values(c.levelSkills || {}).some(s=> s && (s.stem || s.stemGrant))));
  ok(!early.length, `no Stem / Chrysalis on a non-Evomax card before Map 20 (${early.map(c=> c.id).join(', ')})`);
  ok((by['egg-bug'].mysterySkills || []).includes('chrysalis'), 'the Cocoon\'s Chrysalis reads "?" (mysterySkills)'); }
{ const B = require(path.join(ROOT, 'tools', 'lib_bramble.js')), G = B.G;
  const r0 = G.fightRules('m1', B.byKey('m1', '0-1')), r1 = G.fightRules('mf', B.byKey('mf', '1-1')), rb = G.fightRules('mb', B.byKey('mb', '2-1')), rc = G.fightRules('mc', B.byKey('mc', '3-1'));
  ok(!r0.aiGuardLethal && r1.aiGuardLethal, `fightRules: the lethal guard from Map 1 (Map 0 ${!!r0.aiGuardLethal}, Map 1 ${!!r1.aiGuardLethal})`);
  ok(rb.beachMap && !rc.beachMap, 'fightRules: beachMap on Pebble Beach only');
  ok(rc.windfall && !rb.windfall, 'fightRules: Windfall on the windy Gannet Cliffs, not on the beach'); }
{ const app = fs.readFileSync(path.join(ROOT, 'arena_app.js'), 'utf8');
  ok(/sk1Patch\(PASSIVE_DEFS, 'stem', \{mechLineGate:'evolution'\}\)/.test(app) && /sk1Patch\(PASSIVE_DEFS, 'chrysalis', \{mechLineGate:'evolution'\}\)/.test(app), 'the editor offers Stem / Chrysalis on Evomax cards only');
  ok(/hudPearlPill/.test(app) && /floatResourceGain\(ev, '⚪', 'hudPearlPill'/.test(app), 'Pearls have their pill and float');
  ok(/r\.aiGuardLethal = true/.test(app) && /windfall:\s+\{icon:'🍃'/.test(app), 'fightRules sets the guard; Windfall is a field effect'); }

console.log(fail ? `en8-2026-10-24: ${fail} of ${n} failed` : `en8-2026-10-24: all ${n} passed`);
process.exit(fail ? 1 : 0);
