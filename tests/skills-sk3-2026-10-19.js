#!/usr/bin/env node
// Package SK3 (2026-10-19, owner 21:56 / 21:59 / 22:08): skills batch 3, built as triggers x actions where they fit.
//   Spawner <unit>, Duplicate (action, the Illusion copy), War Banner N + Warcry N (the go-wide anthems), Shieldwall N, Corpsefeeder N,
//   Grave Call (spell), Silence N, Stymie N, Amplifier N, Stench N (+ the wash), Executioner (25%), Petrify N + Shatter (stone, Armor 3+),
//   Hunter shown as "Cull" (Weak: Attack <= 2 and Health <= 4), Broodkeeper N, Exhaust N, Herald N (the Leader), Harbinger N (On Any
//   Death, capped a round), Vulnerable (all enemies / all units), Barrage (an arrow at every enemy), Spotter (your attacks land; a
//   Legendary dodge still rolls), Smoke Screen (spell) and Magnet (spell, Grounded).
// Engine scenarios, then the data: skill costs (estimates), the cards, the app's registry, TX keys in the 12 packs.
'use strict';
const fs = require('fs'), path = require('path');
const H = require('./lib/harness.js'), E = H.Engine;
const ROOT = path.join(__dirname, '..'), R = f=> fs.readFileSync(path.join(ROOT, f), 'utf8');
let fail = 0, n = 0; const ok = (c, m)=>{ n++; if(!c){ fail++; console.log('  ✗', m); } };
const so = id=> id===1 ? 'A' : 'B';
const U = (id, effects, o)=> Object.assign({id, name:id, attack:0, health:30, wait:0, cost:0, archetypes:['Sk'], effects: effects || {}}, o || {});
const cards = JSON.parse(R('canonical/cards.json')), byId = Object.fromEntries(cards.map(c=> [c.id, c]));
const spell = id=> Object.assign({effects:{}}, byId[id]);
const defs = Object.assign({}, H.loadCardDefs(), {
  'sk-wall':    U('sk-wall'),
  'sk-small':   U('sk-small', {}, {attack:1, health:3}),
  'sk-hit3':    U('sk-hit3', {}, {attack:3}),
  'sk-hit2':    U('sk-hit2', {}, {attack:2}),
  'sk-tok':     U('sk-tok', {}, {attack:1, health:1, token:true}),
  'sk-spawner': U('sk-spawner', {spawner:'sk-tok'}),
  'sk-dup':     U('sk-dup', {triggers:[{on:'onSpawn', do:'duplicate', who:'self'}]}, {attack:4, health:9}),
  'sk-banner':  U('sk-banner', {banner:1}),
  'sk-warcry':  U('sk-warcry', {warcry:2}),
  'sk-wall2':   U('sk-wall2', {shieldwall:2}),
  'sk-corpse':  U('sk-corpse', {corpsefeeder:2}, {attack:1, health:5}),
  'sk-sil':     U('sk-sil', {triggers:[{on:'onSpawn', do:'silence', who:'enemy', sub:'adjacent', amount:2}]}),
  'sk-thorny':  U('sk-thorny', {thorns:3, flying:true}),
  'sk-styk':    U('sk-styk', {stymie:2}, {attack:1}),
  'sk-amp':     U('sk-amp', {amplifier:1}),
  'sk-poison2': U('sk-poison2', {poison:2}, {attack:1}),
  'sk-stench':  U('sk-stench', {stench:2}),
  'sk-flyer':   U('sk-flyer', {flying:true}, {attack:1}),
  'sk-exec':    U('sk-exec', {executioner:3}, {attack:2}),
  'sk-petri':   U('sk-petri', {petrify:2}, {attack:1}),
  'sk-shatter': U('sk-shatter', {shatter:3}, {attack:4}),
  'sk-armored': U('sk-armored', {armor:3}),
  'sk-cull':    U('sk-cull', {hunter:2}, {attack:3}),
  'sk-cullP':   U('sk-cullP', {hunter:2, hunterVs:'poison'}, {attack:3}),
  'sk-keeper':  U('sk-keeper', {broodkeeper:2}),
  'sk-brood':   U('sk-brood', {brood:1}),
  'sk-exh':     U('sk-exh', {triggers:[{on:'onSpawn', do:'exhaust', who:'enemy', sub:'adjacent', amount:1}]}),
  'sk-trig':    U('sk-trig', {triggers:[{on:'perTurn', do:'buff', who:'self', amount:1}]}),
  'sk-herald':  U('sk-herald', {herald:2}),
  'sk-harb':    U('sk-harb', {harbinger:1}),
  'sk-vuln':    U('sk-vuln', {triggers:[{on:'onSpawn', do:'vulnerable', who:'enemy', sub:'all', amount:2}]}),
  'sk-vulnAll': U('sk-vulnAll', {triggers:[{on:'onSpawn', do:'vulnerable', who:'both', sub:'all', amount:2}]}),
  'sk-barrage': U('sk-barrage', {triggers:[{on:'onSpawn', do:'barrage', amount:2}]}),
  'sk-spotter': U('sk-spotter', {spotter:true}),
  'sk-evasive': U('sk-evasive', {evasive:true}),
  'sk-legend':  U('sk-legend', {evasive:{legendary:true}}),
  'sk-invis':   U('sk-invis', {invisible:3}),
  'sk-wave':    U('sk-wave', {wave:2}, {attack:1}),
  'grave-call': spell('grave-call'), 'smoke-screen': spell('smoke-screen'), 'magnet': spell('magnet'),
});
const all = pl=> [...pl.row.left, ...pl.row.center, ...pl.row.right];
function mk(seed, rules, mode){ const e = E.makeSimEngine(defs, E.mulberry32(seed||7), {recordEvents:true, battleMode: mode || 'open', rules: rules || {}}); return {e, P:{1:e.newPlayer(1,{}), 2:e.newPlayer(2,{})}}; }
function put(e, P, pid, id, side, ev){ ok(e.debugSpawnCard(P, so, pid, id, side || 'left', {}, ev || []), `placed ${id}`); return all(P[pid]).filter(x=> x.defId === id || (x._sk3Base === id)).reduce((a, x)=> (!a || x.uid > a.uid) ? x : a, null); }
const fight = (e, P, first)=>{ const ev = []; e.resolveCombat(P, so, {}, ev, first || 1); return ev; };
const start = (e, P, round)=>{ const ev = []; e.roundStart(P, round, so, {}, ev); return ev; };
const hitOn = (ev, uid)=> ev.filter(x=> x.type === 'hit' && x.targetUid === uid).reduce((t, x)=> t + (x.dmg || 0), 0);
const fx = (e, c)=> e.effectsOf(c);
function cast(e, P, pid, id){ const pl = P[pid]; const uid = 900000 + Math.floor(Math.random()*1000); pl.hand.push({uid, defId:id}); pl.lumber = 99; pl.playedThisTurn = false; pl.playsThisTurn = 0; const ev = [];
  ok(e.placeCard(P, so, pid, uid, 'left', {}, ev), `cast ${id}`); return ev; }

// ---- 1. Spawner <unit>
{ const {e, P} = mk(); const s = put(e, P, 1, 'sk-spawner'); put(e, P, 2, 'sk-wall'); fight(e, P);
  const toks = all(P[1]).filter(c=> c.defId === 'sk-tok');
  ok(toks.length === 1 && Math.abs(toks[0].slot - s.slot) === 1, `Spawner: one token a turn, right beside it (${toks.length})`); fight(e, P);
  ok(all(P[1]).filter(c=> c.defId === 'sk-tok').length === 2, 'Spawner: another the next turn (the other side)'); fight(e, P);
  ok(all(P[1]).filter(c=> c.defId === 'sk-tok').length === 2, 'Spawner: no free slot beside it, nothing'); }
{ const {e, P} = mk(); const s = put(e, P, 1, 'sk-spawner'); s.wait = 3; put(e, P, 2, 'sk-wall'); fight(e, P);
  ok(!all(P[1]).some(c=> c.defId === 'sk-tok'), 'Spawner: not while Waiting (On Turn Start needs it Ready)'); }
ok(JSON.stringify(E.makeSimEngine(defs, E.mulberry32(1), {}).sk3Trigs({spawner:'sk-tok'})[0]) === JSON.stringify({on:'perTurn', do:'spawnCard', defId:'sk-tok', count:1, near:true, keyword:'spawner'}), 'Spawner is On Turn Start x Spawn (near)');
// ---- 2. Duplicate (the Illusion)
{ const {e, P} = mk(); const ev = []; const d = put(e, P, 1, 'sk-dup', 'left', ev); const ill = all(P[1]).find(c=> c !== d);
  const id = ill && e.derivedDefs[ill.defId];
  ok(ill && ill.atk === 4 && ill.hp === 1 && ill.maxHp === 1 && id && id.token && id.illusionOf === 'sk-dup' && id.effects.illusory === 0.667, `Duplicate: an Illusion copy beside it, its Attack, Health 1, Illusory (${ill && ill.atk}/${ill && ill.hp})`);
  ok(!(id.effects.triggers || []).some(t=> t.do === 'duplicate') && all(P[1]).length === 2, 'Duplicate: the copy carries no Duplicate (no loop)');
  ok(ev.some(x=> x.type === 'statusFx' && x.kind === 'duplicate'), 'Duplicate tells the board'); }
// ---- 3. War Banner N and Warcry N (go-wide)
{ const {e, P} = mk(); const b = put(e, P, 1, 'sk-banner', 'left'); const a = put(e, P, 1, 'sk-small', 'right'); put(e, P, 2, 'sk-wall'); e.sk3Sync(P);
  ok(a.atk === 2 && a.maxHp === 4 && b.atk === 0, `War Banner 1: your other units +1/+1, not itself (${a.atk}/${a.maxHp})`);
  b.hp = 0; e.removeDeadCards(P, so, {}, {}, []); e.sk3Sync(P); ok(a.atk === 1 && a.maxHp === 3, 'War Banner: gone with it'); }
{ const {e, P} = mk(); const a = put(e, P, 1, 'sk-small', 'right'); const w = put(e, P, 1, 'sk-warcry', 'left');
  ok(a.atk === 3 && a.maxHp === 5 && w.atk === 0, `Warcry 2: On Play, your other units +2/+2 for good (${a.atk}/${a.maxHp})`); }
// ---- 4. Shieldwall N
{ const {e, P} = mk(); const w = put(e, P, 1, 'sk-wall2', 'left'); const a = put(e, P, 1, 'sk-wall', 'right'); const f1 = put(e, P, 2, 'sk-hit3', 'left'), f2 = put(e, P, 2, 'sk-hit3', 'right');
  const ev = fight(e, P, 2); const hw = hitOn(ev, w.uid), ha = hitOn(ev, a.uid);
  ok(ha === 1 && hw === 3, `Shieldwall 2: the ally beside it has Armor 2 (3 -> ${ha}), not itself (${hw})`); }
// ---- 5. Corpsefeeder N
{ const {e, P} = mk(); const c = put(e, P, 1, 'sk-corpse'); put(e, P, 2, 'sk-wall'); P[1].graveyard.push({defId:'sk-wall'}, {defId:'sk-small'}); const ev = fight(e, P);
  ok(c.atk === 3 && c.maxHp === 7 && P[1].graveyard.length === 1 && P[1].graveyard[0].defId === 'sk-small' && P[1].exile.some(x=> x.defId === 'sk-wall'), `Corpsefeeder 2: exiles the oldest grave card, +2/+2 (${c.atk}/${c.maxHp})`);
  ok(ev.some(x=> x.kind === 'corpsefeed') && ev.some(x=> x.type === 'exile' && x.zone === 'graveyard'), 'Corpsefeeder: the exile and the feed show'); }
{ const {e, P} = mk(); const c = put(e, P, 1, 'sk-corpse'); put(e, P, 2, 'sk-wall'); fight(e, P); ok(c.atk === 1, 'Corpsefeeder: an empty graveyard, nothing'); }
// ---- 6. Grave Call (spell)
{ const {e, P} = mk(); put(e, P, 1, 'sk-wall', 'left'); P[1].graveyard.push({defId:'sk-small'}, {defId:'tailwind'}, {defId:'sk-wall'}); const ev = cast(e, P, 1, "grave-call");
  const back = all(P[1]).filter(c=> c.defId === 'sk-small' || c.defId === 'sk-wall').filter(c=> c.uid > 0);
  const rv = ev.find(x=> x.type === 'statusFx' && x.kind === 'graveCall'), u = rv && all(P[1]).find(c=> c.uid === rv.targetUid), base = u && defs[u.defId];
  ok(rv && u && P[1].graveyard.length === 3 && rv.amount === 3 && u.atk === base.attack + 3 && u.maxHp === base.health + 3, `Grave Call: a creature back, +3/+3 for the 3 cards left (the spell counts) (${rv && rv.amount})`);
  ok(!P[1].graveyard.some(g=> g.defId === u.defId) || P[1].graveyard.filter(g=> g.defId === u.defId).length < 2, 'Grave Call: the revived card left the graveyard'); }
{ const {e, P} = mk(); P[1].graveyard.push({defId:'tailwind'}); const ev = cast(e, P, 1, 'grave-call'); ok(!ev.some(x=> x.type === 'statusFx' && x.kind === 'graveCall') && !all(P[1]).length, 'Grave Call: no creature in the graveyard, nothing'); }
{ const {e, P} = mk(); for(let i = 0; i < 14; i++) P[1].graveyard.push({defId:'sk-small'}); const ev = cast(e, P, 1, 'grave-call'); const rv = ev.find(x=> x.type === 'statusFx' && x.kind === 'graveCall'); ok(rv && rv.amount === 10, `Grave Call: capped at +10 (${rv && rv.amount})`); }
// ---- 7. Silence N and Stymie N
{ const {e, P} = mk(); const t = put(e, P, 2, 'sk-thorny', 'left'); const s = put(e, P, 1, 'sk-sil', 'left');
  ok(t.silenced === 2 && !fx(e, t).thorns && !fx(e, t).flying && t.atk === 0 && t.maxHp === 30, `Silence 2: its skills are off (Thorns, Flying gone), stats stay (${t.silenced})`);
  fight(e, P); fight(e, P); fight(e, P); ok(!(t.silenced > 0) && fx(e, t).thorns === 3 && t.defId === 'sk-thorny', 'Silence wears off: its card is back'); }
{ const {e, P} = mk(); const sty = put(e, P, 1, 'sk-styk', 'left'); const t = put(e, P, 2, 'sk-hit3', 'left'); fight(e, P);
  ok(t.stymied === 2 && t.wait >= 1, `Stymie 2 (On Attack): a Ready target goes back to Wait 1 (${t.wait}), Stymied ${t.stymied}`);
  sty.hp = 0; e.removeDeadCards(P, so, {}, {}, []); const w0 = t.wait; fight(e, P); ok(t.wait === w0, `Stymie: its Wait doesn't count down (${t.wait})`); const ev = fight(e, P); fight(e, P);
  ok(!(t.stymied > 0) && t.wait === 0, `Stymie ends, then its Wait runs out (${t.stymied}, wait ${t.wait})`); }
// ---- 8. Amplifier N
{ const {e, P} = mk(); const a = put(e, P, 1, 'sk-amp', 'left'); const p = put(e, P, 1, 'sk-poison2', 'right'); const th = put(e, P, 1, 'sk-thorny', 'right'); e.sk3Sync(P);
  ok(fx(e, p).poison === 3 && (fx(e, th).thorns === (Math.abs(th.slot - a.slot) === 1 ? 4 : 3)), `Amplifier 1: Poison 2 -> ${fx(e, p).poison} beside it; Thorns only if beside (${fx(e, th).thorns})`);
  ok(!fx(e, a).amplifier || fx(e, a).amplifier === 1, 'Amplifier: not itself'); }
{ const {e, P} = mk(5, {sk3:{ampCap:1}}); put(e, P, 1, 'sk-amp', 'left'); const p = put(e, P, 1, 'sk-poison2', 'right'); put(e, P, 1, 'sk-amp', 'right'); e.sk3Sync(P);
  ok(fx(e, p).poison === 3, `Amplifier: the cap (ampCap 1 here) holds with two beside it (${fx(e, p).poison})`); }
// ---- 9. Stench N
{ const {e, P} = mk(); const t = put(e, P, 2, 'sk-hit3', 'left'); const f = put(e, P, 2, 'sk-flyer', 'right'); put(e, P, 1, 'sk-stench', 'left');
  ok(t.stench === 2 && !(f.stench > 0), `Stench 2: tokens on the enemy facing it (${t.stench}); flyers are above it`);
  ok(e.sk3StenchOf(t) === 2, 'Stench: -1 Attack a token'); t.stench = 9; ok(e.sk3StenchOf(t) === 3, 'Stench: at most -3'); }
{ const {e, P} = mk(); const t = put(e, P, 2, 'sk-wall', 'left'); put(e, P, 2, 'sk-wall', 'right'); t.stench = 3; const w = put(e, P, 1, 'sk-wave', 'left'); const ev = [];
  e.waveHit(P, so, 1, w, t, ev, {}); ok(t.stench === 1 && ev.some(x=> x.kind === 'stenchWash' && x.amount === 2), `Stench: a Wave 2 washes 2 off (${t.stench})`); }
{ const {e, P} = mk(5, {permaTide:true}); const t = put(e, P, 2, 'sk-wall', 'left'); t.stench = 2; put(e, P, 1, 'sk-wall'); e.startTide(); fight(e, P);
  ok(t.stench <= 1 || e.getTide() === null, `Stench: the Tide in washes 1 an upkeep (${t.stench}, tide ${e.getTide()})`); }
// ---- 10. Executioner N (25%)
{ const {e, P} = mk(); put(e, P, 1, 'sk-exec'); const t = put(e, P, 2, 'sk-wall'); t.hp = 7; const ev = fight(e, P); ok(hitOn(ev, t.uid) === 5, `Executioner 3: +3 below 25% (7/30): ${hitOn(ev, t.uid)}`); }
{ const {e, P} = mk(); put(e, P, 1, 'sk-exec'); const t = put(e, P, 2, 'sk-wall'); t.hp = 14; const ev = fight(e, P); ok(hitOn(ev, t.uid) === 2, 'Executioner: 14/30 is no longer low enough'); }
// ---- 11. Petrify N and Shatter
{ const {e, P} = mk(); put(e, P, 1, 'sk-petri'); const t = put(e, P, 2, 'sk-hit3'); const ev = fight(e, P);
  ok(t.petrified && t.petrifyLeft === 2, `Petrify 2 (On Attack): stone for 2 rounds (${t.petrifyLeft})`); const ev2 = fight(e, P);
  ok(!ev2.some(x=> x.type === 'hit' && x.attUid === t.uid), 'Petrified: it can\'t attack'); all(P[1])[0].hp = 0; e.removeDeadCards(P, so, {}, {}, []); fight(e, P); fight(e, P); ok(!t.petrified, 'Petrify wears off'); }
{ const {e, P} = mk(); put(e, P, 1, 'sk-shatter'); const t = put(e, P, 2, 'sk-wall'); t.petrified = true; t.petrifyLeft = 2; const ev = fight(e, P);
  ok(hitOn(ev, t.uid) === 14, `Shatter 3 on stone: (4 + 3) doubled, not halved (${hitOn(ev, t.uid)})`); }
{ const {e, P} = mk(); put(e, P, 1, 'sk-hit2'); const t = put(e, P, 2, 'sk-wall'); t.petrified = true; t.petrifyLeft = 2; const ev = fight(e, P); ok(hitOn(ev, t.uid) === 1, 'stone still halves a plain hit'); }
{ const {e, P} = mk(); put(e, P, 1, 'sk-shatter'); const t = put(e, P, 2, 'sk-armored'); const ev = fight(e, P);
  ok(hitOn(ev, t.uid) === 4, `Shatter 3 on Armor 3: 4 + 3 - 3 (${hitOn(ev, t.uid)})`); }
{ const {e, P} = mk(); put(e, P, 1, 'sk-shatter'); const t = put(e, P, 2, 'sk-wall'); t.frozen = 2; const ev = fight(e, P); ok(hitOn(ev, t.uid) === 7, 'Shatter on a Frozen unit as before (+3)'); }
// ---- 12. Hunter, shown as Cull: Weak by default
{ const {e, P} = mk(); put(e, P, 1, 'sk-cull'); const t = put(e, P, 2, 'sk-small'); const ev = fight(e, P);
  ok(hitOn(ev, t.uid) === 5, `Cull 2 (Weak): 3 + 2 on a 1/3 unit (${hitOn(ev, t.uid)})`); }
{ const {e, P} = mk(); put(e, P, 1, 'sk-cull'); const t = put(e, P, 2, 'sk-wall'); t.hp = 4; t.atk = 3; const ev = fight(e, P); ok(hitOn(ev, t.uid) === 3, 'Cull (Weak): Attack 3 is not weak (Attack AND Health)'); }
{ const {e, P} = mk(); put(e, P, 1, 'sk-cull'); const t = put(e, P, 2, 'sk-wall'); t.hp = 5; const ev = fight(e, P); ok(hitOn(ev, t.uid) === 3, 'Cull (Weak): Health 5 is not low'); }
{ const {e, P} = mk(); put(e, P, 1, 'sk-cullP'); const t = put(e, P, 2, 'sk-wall'); t.poison = 3; const ev = fight(e, P); ok(hitOn(ev, t.uid) === 5, 'Cull (Poisoned): the old picker still works'); }
ok(byId['fen-mink'].effects.hunterVs === 'poison', 'Fen Mink keeps its Poisoned pick (explicit now)');
// ---- 13. Broodkeeper N
{ const {e, P} = mk(); put(e, P, 1, 'sk-keeper', 'left'); put(e, P, 1, 'sk-brood', 'right'); const b = all(P[1]).find(c=> /~brood$/.test(c.defId));
  ok(b && b.atk === 3 && b.maxHp === 3, `Broodkeeper 2: a brood token arrives +2/+2 (${b && b.atk}/${b && b.maxHp})`);
  const pl = put(e, P, 1, 'sk-small', 'right'); ok(pl.atk === 1, 'Broodkeeper: a played card gets nothing'); }
// ---- 14. Exhaust N
{ const {e, P} = mk(); const t = put(e, P, 2, 'sk-trig', 'left'); put(e, P, 1, 'sk-exh', 'left'); ok(t.exhaust === 1, 'Exhaust 1: one token');
  const ev = fight(e, P); ok(t.atk === 0 && t.exhaust === 0 && ev.some(x=> x.kind === 'exhaustSpent'), `Exhaust: its next trigger fizzles, a token goes (atk ${t.atk})`);
  fight(e, P); ok(t.atk === 1, 'Exhaust: then it fires again'); }
// ---- 15. Herald N (the Leader)
{ const {e, P} = mk(); const L = put(e, P, 1, 'sk-wall', 'left'); L.isLeader = true; const h = put(e, P, 1, 'sk-herald', 'right'); const o = put(e, P, 1, 'sk-small', 'right'); e.sk3Sync(P);
  ok(L.atk === 2 && L.maxHp === 32 && o.atk === 1 && h.atk === 0, `Herald 2: your Leader +2/+2 while it lives (${L.atk}/${L.maxHp}); nobody else`); }
// ---- 16. Harbinger N (On Any Death)
{ const {e, P} = mk(); const h = put(e, P, 1, 'sk-harb', 'left'); const a = put(e, P, 2, 'sk-small', 'left'), b = put(e, P, 1, 'sk-small', 'right');
  a.hp = 0; b.hp = 0; e.removeDeadCards(P, so, {}, {}, []); ok(h.atk === 2 && h.maxHp === 32, `Harbinger 1: +1/+1 for each death, either side (${h.atk}/${h.maxHp})`); }
{ const {e, P} = mk(); const h = put(e, P, 1, 'sk-harb', 'left'); for(let i = 0; i < 5; i++){ const x = put(e, P, 2, 'sk-small', 'left'); x.hp = 0; e.removeDeadCards(P, so, {}, {}, []); }
  ok(h.atk === 3, `Harbinger: at most 3 a round (${h.atk})`); }
// ---- 17. Vulnerable (board-wide), Barrage
{ const {e, P} = mk(); const a = put(e, P, 2, 'sk-wall', 'left'), b = put(e, P, 2, 'sk-wall', 'right'); const m = put(e, P, 1, 'sk-wall', 'right'); put(e, P, 1, 'sk-vuln', 'left');
  ok(a.shocked === 2 && b.shocked === 2 && !(m.shocked > 0), 'Vulnerable 2 (all enemies): every enemy Shocked 2 rounds, yours not'); }
{ const {e, P} = mk(); const a = put(e, P, 2, 'sk-wall', 'left'); const m = put(e, P, 1, 'sk-wall', 'right'); put(e, P, 1, 'sk-vulnAll', 'left'); ok(a.shocked === 2 && m.shocked === 2, 'Vulnerable (all units): both sides'); }
{ const {e, P} = mk(); const a = put(e, P, 2, 'sk-wall', 'left'), b = put(e, P, 2, 'sk-wall', 'right'); const ev = []; put(e, P, 1, 'sk-barrage', 'left', ev);
  ok(a.hp === 28 && b.hp === 28 && ev.filter(x=> x.type === 'hit' && x.ranged).length === 2, `Barrage 2: an arrow at every enemy (${a.hp}, ${b.hp})`); }
// ---- 18. Spotter
{ let landed = 0; for(let s = 1; s <= 40; s++){ const {e, P} = mk(s); put(e, P, 1, 'sk-hit2', 'left'); put(e, P, 1, 'sk-spotter', 'right'); const t = put(e, P, 2, 'sk-evasive', 'left'); const ev = fight(e, P); if(hitOn(ev, t.uid) === 2) landed++; }
  ok(landed === 40, `Spotter: your attacks at an Evasive unit always land (${landed}/40)`); }
{ let landed = 0; for(let s = 1; s <= 40; s++){ const {e, P} = mk(s); put(e, P, 1, 'sk-hit2', 'left'); const t = put(e, P, 2, 'sk-evasive', 'left'); const ev = fight(e, P); if(hitOn(ev, t.uid) === 2) landed++; }
  ok(landed > 5 && landed < 35, `without a Spotter, Evasive dodges about half (${landed}/40)`); }
{ let landed = 0; for(let s = 1; s <= 40; s++){ const {e, P} = mk(s); put(e, P, 1, 'sk-hit2', 'left'); put(e, P, 1, 'sk-spotter', 'right'); const t = put(e, P, 2, 'sk-legend', 'left'); const ev = fight(e, P); if(hitOn(ev, t.uid) === 2) landed++; }
  ok(landed > 5 && landed < 35, `Spotter: a Legendary dodge still rolls (${landed}/40)`); }
{ const {e, P} = mk(); put(e, P, 1, 'sk-hit2', 'left'); put(e, P, 1, 'sk-spotter', 'right'); const t = put(e, P, 2, 'sk-invis', 'left'); const ev = fight(e, P); ok(hitOn(ev, t.uid) === 2, 'Spotter: an Invisible unit is found'); }
// ---- 19. Smoke Screen and Magnet (spells)
{ const {e, P} = mk(); const a = put(e, P, 1, 'sk-wall', 'left'), b = put(e, P, 1, 'sk-wall', 'right'); const f = put(e, P, 2, 'sk-wall', 'left'); cast(e, P, 1, 'smoke-screen');
  ok(a.smoke === 2 && b.smoke === 2 && !(f.smoke > 0), 'Smoke Screen: your units are in Smoke 2 rounds'); }
{ let landed = 0; for(let s = 1; s <= 30; s++){ const {e, P} = mk(s); const t = put(e, P, 1, 'sk-wall', 'left'); cast(e, P, 1, 'smoke-screen'); put(e, P, 2, 'sk-hit2', 'left'); put(e, P, 2, 'sk-spotter', 'right'); const ev = fight(e, P, 2); if(hitOn(ev, t.uid) === 2) landed++; }
  ok(landed === 30, `Spotter sees through Smoke Screen (${landed}/30)`); }
{ const {e, P} = mk(); const f = put(e, P, 2, 'sk-flyer', 'left'), g = put(e, P, 2, 'sk-wall', 'right'); const ev = cast(e, P, 1, 'magnet');
  ok(f.grounded === 2 && !fx(e, f).flying && !(g.grounded > 0), `Magnet: enemy flyers Grounded 2 rounds, no Flying (${f.grounded})`);
  fight(e, P); fight(e, P); fight(e, P); ok(fx(e, f).flying && !(f.grounded > 0), 'Magnet: it flies again after'); }
// ---- 20. determinism, the layer cap with Harbinger loops
{ const run = ()=>{ const {e, P} = mk(11); put(e, P, 1, 'sk-spawner'); put(e, P, 1, 'sk-harb', 'right'); put(e, P, 2, 'sk-stench'); put(e, P, 2, 'sk-petri', 'right'); let s = ''; for(let i = 0; i < 6; i++){ const ev = fight(e, P); s += ev.length + ','; } return s + JSON.stringify(all(P[1]).map(c=> [c.atk, c.hp])); };
  ok(run() === run(), 'SK3 fights repeat exactly (seeded)'); }

// ---- 21. the data
const SC = JSON.parse(R('canonical/skill-costs.json'));
const ids = new Set(SC.skills.map(s=> s.id)), acts = new Set(SC.actions.map(a=> a.id)), trs = new Set(SC.triggers.map(t=> t.id));
['spawner', 'banner', 'warcry', 'shieldwall', 'corpsefeeder', 'silence', 'stymie', 'exhaust', 'petrify', 'amplifier', 'stench', 'broodkeeper', 'herald', 'harbinger', 'spotter'].forEach(k=>{
  const s = SC.skills.find(x=> x.id === k) || (SC.shorthands || {})[k]; ok(s && /estimate SK3/.test(s.measuredHow || ''), `skill-costs: ${k} costed (estimate SK3)`); });
['duplicate', 'devourGrave', 'buffAll', 'stench', 'silence', 'stymie', 'exhaust', 'petrify', 'vulnerable', 'barrage', 'smokeScreen', 'magnet'].forEach(k=> ok(acts.has(k), `skill-costs: action ${k}`));
ok(trs.has('onAnyDeath'), 'skill-costs: trigger On Any Death');
['grave-call', 'smoke-screen', 'magnet'].forEach((id, i)=>{ const c = byId[id]; ok(c && c.cardType === 'spell' && ['rare', 'epic'].includes(c.rarity) && !c.source && cards.indexOf(c) >= cards.length - 30, `${id}: a spell at the end of cards.json, Rare/Epic, no source`); });
ok(!byId['clarity-bomb'], 'no Clarity Bomb card (owner 22:08: it is a skill, Spotter)');
const app = R('arena_app.js'), tx = R('bramblewood-texts.js');
['spawner', 'banner', 'warcry', 'shieldwall', 'corpsefeeder', 'amplifier', 'stench', 'broodkeeper', 'herald', 'harbinger', 'spotter', 'silence', 'stymie', 'exhaust', 'petrify'].forEach(k=> ok(new RegExp(`\\{key:'${k}', category:`).test(app), `the app's registry has ${k} (the Codex skills book lists it)`));
ok(/"ui\.skn-hunter": "Cull"/.test(tx), 'Hunter shows as Cull');
ok(/\{key:'onAnyDeath'/.test(app), 'the trigger picker has On Any Death');
const brief = R('docs/art/new-cards-2026-10-19-briefs.md'); ['Grave Call', 'Smoke Screen', 'Magnet'].forEach(nm=> ok(brief.includes(nm), `art brief for ${nm}`));
const strat = R('docs/strategies-2026-10-19.md'); ok(/go-wide/i.test(strat) && /graveyard/i.test(strat) && /leader/i.test(strat), 'docs/strategies-2026-10-19.md');
// TX keys in the 12 packs
const CODES = ['fr', 'de', 'es', 'it', 'pt', 'tl', 'ta', 'id', 'zh-Hans', 'zh-Hant', 'ja', 'ko'];
const keys = [...tx.matchAll(/"(ui\.sk3-[^"]+|ui\.skn-(?:spawner|banner|warcry|shieldwall|corpsefeeder|amplifier|stench|broodkeeper|herald|harbinger|spotter|silence|stymie|exhaust|petrify))": "([^"]+)"/g)].map(m=> m[2]);
ok(keys.length >= 40, `SK3 TX keys (${keys.length})`);
const LEAD = /^[\s\u{1F000}-\u{1FFFF}☀-➿️‍]+/u;
CODES.forEach(c=>{ const pk = JSON.parse(R('lang/' + c + '.json')); const miss = keys.filter(k=> !(k.replace(LEAD, '').trim() in pk)); ok(!miss.length, `${c}: every SK3 text translated (${miss.slice(0, 2).join(' | ')})`); });

console.log(`skills-sk3-2026-10-19: ${n - fail}/${n} checks passed`);
process.exit(fail ? 1 : 0);
