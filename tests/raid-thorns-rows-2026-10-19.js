#!/usr/bin/env node
// 2026-10-19 (package TS, owner 13:35: "somehow, thorns is not affecting the back row of the raid units. Fix this and related."):
// in a raid fight (3 rows a side: front, middle, back; reserveRows 2 + reserveActs), every on-hit and on-hit-taken reaction fires for
// a middle- or back-row unit exactly as for a front-row one, both ways (it strikes / it is struck), both sides (yours / the boss's):
//   Thorns, Spiteful (the game's "spiky"), Counterattack (its "retaliate"), Poison / Bleed / Freeze on hit, Sap (its lifesteal),
//   Armor, Evasive, Guardian (a neighbour in the struck unit's own row), Cleave (Sweep: the neighbours in the struck unit's own row),
//   the kill: the killer's kill stat and On Kill, the victim's Bounty and its On Death (who:'killer') when the killer is a back-row unit,
//   a back-row striker killed by Thorns dies a real death; the upkeep: a Frozen back-row unit thaws, its Poison ticks;
//   reserveVolley's strikes run the same hooks.
// Not tested here, with the reason: Reflect (since 2026-10-17 it only bounces shots, and no row strike is a shot); Deathtouch (no such
// skill in the game: the nearest, King Slayer / Execute style bonuses, ride damageCard, which every row swing uses).
// A row swing lands for half the unit's swing, rounded up (4 Attack: 4 from the front, 2 from the middle or back row).
'use strict';
const H = require('./lib/harness.js');
const E = H.Engine;
let fail = 0, pass = 0; const ok = (c, m)=>{ if(!c){ fail++; console.log('  ✗', m); } else pass++; };
const so = id=> id===1 ? 'A' : 'B';
const U = (id, effects, o)=> Object.assign({id, name:id, attack:0, health:500, wait:0, cost:0, effects: effects || {}}, o || {});
const defs = Object.assign({}, H.loadCardDefs(), {
  'ts-hit': U('ts-hit', {}, {attack:4}), 'ts-wall': U('ts-wall', {}),
  'ts-thorns': U('ts-thorns', {thorns:3}), 'ts-spite': U('ts-spite', {spiteful:2}), 'ts-counter': U('ts-counter', {counterattack:true}, {attack:5}),
  'ts-poison': U('ts-poison', {poison:2}, {attack:4}), 'ts-bleed': U('ts-bleed', {bleed:2}, {attack:4}), 'ts-sap': U('ts-sap', {sap:true}, {attack:4}),
  'ts-freeze': U('ts-freeze', {freeze:{chance:100, duration:1}}, {attack:4}), 'ts-armor': U('ts-armor', {armor:1}), 'ts-evade': U('ts-evade', {evasive:true}),
  'ts-guard': U('ts-guard', {guardian:true}), 'ts-cleave': U('ts-cleave', {sweep:2}, {attack:4}),
  'ts-prey': U('ts-prey', {bounty:3, triggers:[{on:'onDeath', do:'poison', amount:5, who:'killer'}]}, {health:1}),
  'ts-killer': U('ts-killer', {triggers:[{on:'onKill', do:'gainLumber', amount:2}]}, {attack:4}),
  'ts-frail': U('ts-frail', {}, {attack:4, health:2}),
});
const all = pl=> [...pl.row.left, ...pl.row.center, ...pl.row.right];
function mk(opts, seed){ const e = E.makeSimEngine(defs, E.mulberry32(seed || 5), Object.assign({recordEvents:true, battleMode:'open', reserveRows:2, reserveActs:true}, opts || {}));
  return {e, P:{1:e.newPlayer(1, {}, {health:200}), 2:e.newPlayer(2, {}, {health:200})}}; }
function put(e, P, pid, id, slot){ e.debugSpawnCard(P, so, pid, id, 'left', {}, []);
  const pl = P[pid], c = all(pl).reduce((a, x)=> (!a || x.uid > a.uid) ? x : a, null); c.slot = slot;
  const cs = all(pl); pl.row.center = cs.filter(x=> x.slot === 0); pl.row.left = cs.filter(x=> x.slot < 0).sort((a, b)=> b.slot - a.slot); pl.row.right = cs.filter(x=> x.slot > 0).sort((a, b)=> a.slot - b.slot);
  e.syncSlots(pl); return c; }
// a unit in row r (0 front, 1 middle, 2 back) of side pid, at slot sl
const place = (e, P, pid, r, id, sl)=> r === 0 ? put(e, P, pid, id, sl) : e.fillReserve(P[pid], r, sl, id);
const ROWS = ['front', 'middle', 'back'];
const full = r=> r === 0 ? 4 : 2; // a 4-Attack swing's damage from row r
// One strike: side attPid's unit in row ar (column 0) at side defPid's unit in row dr (column 0); nothing else in column 0.
function strike(attId, defId, ar, dr, attPid, o){ o = o || {};
  const {e, P} = mk(o.engine, o.seed); const defPid = attPid === 1 ? 2 : 1;
  const att = place(e, P, attPid, ar, attId, 0), def = place(e, P, defPid, dr, defId, 0);
  if(o.before) o.before(e, P, att, def, defPid);
  const stats = {}, ev = []; e.resolveCombat(P, so, stats, ev, attPid);
  return {e, P, att, def, ev, stats, defPid}; }
const tag = (ar, dr, attPid)=> `[${attPid === 1 ? 'yours' : 'boss'}: ${ROWS[ar]} -> ${ROWS[dr]}]`;
const each = fn=> [1, 2].forEach(attPid=> [0, 1, 2].forEach(ar=> [0, 1, 2].forEach(dr=> fn(ar, dr, attPid))));
const hitDmg = (ev, att, def)=> ev.filter(x=> (x.type === 'hit' && x.attUid === att.uid && x.targetUid === def.uid) || (x.field === 'volleyHit' && x.fromUid === att.uid && x.uid === def.uid)).reduce((t, x)=> t + (x.dmg||0), 0);

// ---- Thorns, both directions: the striker takes the Thorns back whatever row either stands in
each((ar, dr, s)=>{ const r = strike('ts-hit', 'ts-thorns', ar, dr, s);
  ok(r.att.hp === 497 && r.ev.some(x=> x.type === 'thorns' && x.fromUid === r.def.uid && x.targetUid === r.att.uid && x.dmg === 3), `${tag(ar, dr, s)} Thorns 3 back at the striker (${500 - r.att.hp})`);
  ok(r.def.hp === 500 - full(ar), `${tag(ar, dr, s)} the strike lands for ${full(ar)} (${500 - r.def.hp})`); });
// ---- Spiteful ("spiky")
each((ar, dr, s)=>{ const r = strike('ts-hit', 'ts-spite', ar, dr, s);
  ok(r.att.hp === 498 && r.ev.some(x=> x.kind === 'spite' && x.targetUid === r.att.uid), `${tag(ar, dr, s)} Spiteful 2 back at the striker (${500 - r.att.hp})`); });
// ---- Counterattack ("retaliate"): it strikes back at the closest enemy in its column, any row (here the striker)
each((ar, dr, s)=>{ const r = strike('ts-hit', 'ts-counter', ar, dr, s);
  ok(r.att.hp === 495 && r.ev.some(x=> x.kind === 'counter' && x.attUid === r.def.uid && x.targetUid === r.att.uid), `${tag(ar, dr, s)} Counterattack 5 at the striker (${500 - r.att.hp})`); });
// ---- On-hit statuses: Poison, Bleed, Freeze
each((ar, dr, s)=>{ const r = strike('ts-poison', 'ts-wall', ar, dr, s); ok(r.def.poison === 2, `${tag(ar, dr, s)} Poison 2 on hit (${r.def.poison})`); });
each((ar, dr, s)=>{ const r = strike('ts-bleed', 'ts-wall', ar, dr, s); ok(r.def.bleed >= 2, `${tag(ar, dr, s)} Bleed 2 on hit (${r.def.bleed})`); });
each((ar, dr, s)=>{ const r = strike('ts-freeze', 'ts-wall', ar, dr, s);
  // (a freeze laid before the unit's own turn is spent on that turn, FZ 2026-10-19: so it is either still on, or it cost that turn)
  ok(r.ev.some(x=> x.kind === 'freeze' && x.targetUid === r.def.uid) && (r.def.frozen >= 1 || r.ev.some(x=> x.type === 'skipTurn' && x.reason === 'frozen' && x.uid === r.def.uid)), `${tag(ar, dr, s)} Freeze on hit (${r.def.frozen})`); });
// ---- Sap ("lifesteal"): heals the striker for what it dealt
each((ar, dr, s)=>{ const r = strike('ts-sap', 'ts-wall', ar, dr, s, {before:(e, P, att)=>{ att.hp = 400; }});
  ok(r.att.hp === 400 + full(ar), `${tag(ar, dr, s)} Sap heals the striker ${full(ar)} (${r.att.hp - 400})`); });
// ---- Armor: 1 off each strike
each((ar, dr, s)=>{ const r = strike('ts-hit', 'ts-armor', ar, dr, s); ok(r.def.hp === 500 - (full(ar) - 1), `${tag(ar, dr, s)} Armor 1 soaks 1 (${500 - r.def.hp})`); });
// ---- Evasive: dodges about half the strikes, from every row
[0, 1, 2].forEach(ar=> [0, 2].forEach(dr=>{ let dodged = 0, landed = 0;
  for(let seed = 1; seed <= 40; seed++){ const r = strike('ts-hit', 'ts-evade', ar, dr, 1, {seed}); if(r.ev.some(x=> x.type === 'evaded' && x.targetUid === r.def.uid)) dodged++; if(r.def.hp < 500) landed++; }
  ok(dodged >= 8 && landed >= 8, `${tag(ar, dr, 1)} Evasive dodges some, not all (${dodged} dodged, ${landed} landed of 40)`); }));
{ const r = strike('ts-hit', 'ts-evade', 2, 1, 1, {seed:3}); const evd = r.ev.find(x=> x.type === 'evaded');
  ok(!evd || (evd.volley && evd.row === 2 && evd.targetRow === 1), 'a row swing\'s dodge says its rows (volley, row, targetRow)'); }
// ---- Guardian: the neighbour in the struck unit's own row takes the hit
each((ar, dr, s)=>{ let g = null; const r = strike('ts-hit', 'ts-wall', ar, dr, s, {before:(e, P, att, def, defPid)=>{ g = place(e, P, defPid, dr, 'ts-guard', 1); }});
  ok(g.hp === 500 - full(ar) && r.def.hp === 500, `${tag(ar, dr, s)} Guardian beside it in its row takes the ${full(ar)} (guard -${500 - g.hp}, target -${500 - r.def.hp})`); });
// ---- Cleave (Sweep 2): the struck unit's neighbours in its own row take 2 each, units beside it in another row nothing
each((ar, dr, s)=>{ let nb = [], decoys = []; const other = dr === 0 ? 1 : 0;
  const r = strike('ts-cleave', 'ts-wall', ar, dr, s, {before:(e, P, att, def, defPid)=>{ nb = [-1, 1].map(sl=> place(e, P, defPid, dr, 'ts-wall', sl)); decoys = [-1, 1].map(sl=> place(e, P, defPid, other, 'ts-wall', sl)); }});
  ok(r.def.hp === 500 - full(ar) && nb.every(c=> c.hp === 498) && decoys.every(c=> c.hp === 500), `${tag(ar, dr, s)} Cleave hits the target's own row's neighbours (${nb.map(c=> 500 - c.hp)}; other row ${decoys.map(c=> 500 - c.hp)})`); });
// ---- The kill: kill stat, the killer's On Kill, the victim's Bounty and On Death (who:'killer'), when either stands in any row
each((ar, dr, s)=>{ let l0 = 0; const r = strike('ts-killer', 'ts-prey', ar, dr, s, {before:(e, P, att)=>{ l0 = P[s].lumber || 0; }});
  const st = r.stats[so(s) + '|ts-killer'] || {};
  ok(r.ev.some(x=> x.type === 'death' && x.uid === r.def.uid) && !r.e.allBoardCards(r.P[r.defPid]).includes(r.def) && !Object.values(r.P[r.defPid].reserve[0]).concat(Object.values(r.P[r.defPid].reserve[1])).includes(r.def), `${tag(ar, dr, s)} the victim dies and leaves its row`);
  ok(st.kills === 1, `${tag(ar, dr, s)} the kill is credited to the striker (${st.kills})`);
  ok((r.P[s].lumber || 0) - l0 === 5, `${tag(ar, dr, s)} its side gains On Kill's 2 + the Bounty's 3 (${(r.P[s].lumber || 0) - l0})`);
  ok(r.att.poison === 5, `${tag(ar, dr, s)} the victim's On Death poisons its killer (${r.att.poison})`); });
// ---- A middle / back-row striker killed by Thorns dies a real death (out of its row, a death event, the kill credited to the Thorns unit)
[1, 2].forEach(ar=>{ const r = strike('ts-frail', 'ts-thorns', ar, 0, 1); const st = r.stats['B|ts-thorns'] || {};
  ok(r.att.hp === 0 && !r.P[1].reserve[ar - 1][0] && r.ev.some(x=> x.type === 'death' && x.uid === r.att.uid && x.reserve), `[${ROWS[ar]}] a striker killed by Thorns leaves its row with a death event`);
  ok(st.kills === 1, `[${ROWS[ar]}] the Thorns unit is credited with the kill (${st.kills})`); });
// ---- The upkeep reaches the middle and back rows: Freeze melts (then it strikes again), Poison ticks
{ const {e, P} = mk(); const c = e.fillReserve(P[1], 2, 0, 'ts-hit'), t = put(e, P, 2, 'ts-wall', 0); c.frozen = 1;
  e.resolveCombat(P, so, {}, [], 1); ok(t.hp === 500 && c.frozen === 0, `a Frozen back-row unit sits out its round, and the freeze melts (${500 - t.hp}, frozen ${c.frozen})`);
  e.resolveCombat(P, so, {}, [], 1); ok(t.hp === 498, `next round it strikes again (${500 - t.hp})`); }
{ const {e, P} = mk(); const c = e.fillReserve(P[2], 1, 0, 'ts-wall'); put(e, P, 1, 'ts-wall', 3); c.poison = 3;
  e.resolveCombat(P, so, {}, [], 1); ok(c.hp === 497 && c.poison === 2, `Poison 3 on a middle-row unit ticks and wears down (${500 - c.hp}, poison ${c.poison})`); }
{ const {e, P} = mk(); const c = e.fillReserve(P[1], 1, 0, 'ts-hit'), t = put(e, P, 2, 'ts-wall', 0); c.asleep = 1;
  e.resolveCombat(P, so, {}, [], 1); e.resolveCombat(P, so, {}, [], 1); ok(c.asleep === 0 && t.hp === 498, `an Asleep middle-row unit wakes in the upkeep and strikes (${500 - t.hp})`); }
// ---- reserveVolley (a raid stage's extra volley) runs the same swing: Thorns back at it
{ const {e, P} = mk({reserveActs:false}); put(e, P, 1, 'ts-wall', 0); const c = e.fillReserve(P[1], 1, 0, 'ts-hit'); const t = put(e, P, 2, 'ts-thorns', 0); const ev = [];
  const d = e.reserveVolley(P, so, 1, {}, ev);
  ok(d === 2 && t.hp === 498 && c.hp === 497, `the extra volley's strike lands for 2 and takes Thorns 3 back (${d}, ${500 - t.hp}, ${500 - c.hp})`);
  ok(ev[0] && ev[0].field === 'volley' && ev.some(x=> x.field === 'volleyHit' && x.row === 1), 'its events: the volley header, then a volleyHit naming its row'); }
// ---- A front-row swing's events are unchanged (hit / hitHQ); a row swing's stay volleyHit / volleyCastle
{ const r = strike('ts-hit', 'ts-wall', 0, 1, 1); ok(r.ev.some(x=> x.type === 'hit' && x.attUid === r.att.uid && x.targetUid === r.def.uid), 'front -> middle: a hit event'); }
{ const r = strike('ts-hit', 'ts-wall', 2, 0, 1); ok(r.ev.some(x=> x.field === 'volleyHit' && x.fromUid === r.att.uid && x.uid === r.def.uid && x.row === 2 && x.targetRow === 0 && x.dmg === 2), 'back -> front: a volleyHit (row 2, targetRow 0, 2 damage)'); }
{ const {e, P} = mk(); const c = e.fillReserve(P[1], 1, 0, 'ts-hit'); put(e, P, 2, 'ts-wall', 3); const h = P[2].hq.hp, ev = []; e.resolveCombat(P, so, {}, ev, 1);
  ok(P[2].hq.hp === h - 2 && ev.some(x=> x.field === 'volleyCastle' && x.fromUid === c.uid && x.dmg === 2 && x.row === 1), `middle -> an empty column: the bramble, a volleyCastle (${h - P[2].hq.hp})`); }

console.log(fail ? `raid-thorns-rows-2026-10-19: ${fail} FAILED (${pass} passed)` : `raid-thorns-rows-2026-10-19: all ${pass} passed`);
process.exit(fail ? 1 : 0);
