#!/usr/bin/env node
// 2026-10-19 (package RR, owner 22:10: "Raid: Back units cleave the same way as the front units. And all the skills should work as if
// they were at the front okay!"): in a raid fight (3 rows a side: reserveRows 2 + reserveActs), a skill on a middle- or back-row unit
// has the same effect shape as on a front-row one. Each check sets a unit up at the front, then in the back row, and compares:
//   swing shapes, mapped onto the row the swing aims at (the closest enemy row holding a unit in its column, else the front row):
//     Cleave (Sweep), Fork / Trident / Pitchfork, Crab claws, Octolash, Backstab, Tipsy's drift, Taunt (also a front swing that goes
//     on to the middle row), Rook's Row / Bishop's Path, Wave, Bloodlust's leap (along its own row), Boomerang (thrown and caught),
//     Puncture, Overwhelm; the shots (Arrow); Electricity's arc (beside the struck unit, in its row);
//   the round start: Regeneration, Renewal, On Round Start, Bloom, Rally, Immolation, Restless, Explode, On Ready (the Wait running out);
//   slot refills into the unit's own row: Revive, On Death: Spawn, Relic, Crystallise, Meiosis, Brood / Twin (arrival), a Spawn trigger;
//   arrival in a row: Pounce (once), Bounty; Ambush from a back-row unit.
// A row swing lands for ROW_SWING_SHARE of its swing (0.5, rounded up; measured below, not assumed), its prongs and lashes too.
'use strict';
const H = require('./lib/harness.js');
const E = H.Engine;
let fail = 0, pass = 0; const ok = (c, m)=>{ if(!c){ fail++; console.log('  ✗', m); } else pass++; };
const so = id=> id===1 ? 'A' : 'B';
const U = (id, effects, o)=> Object.assign({id, name:id, attack:0, health:500, wait:0, cost:0, effects: effects || {}}, o || {});
const defs = Object.assign({}, H.loadCardDefs(), {
  'rr-wall': U('rr-wall', {}), 'rr-frail': U('rr-frail', {}, {health:1}), 'rr-tok': U('rr-tok', {}, {health:3}), 'rr-hit': U('rr-hit', {}, {attack:10}),
  'rr-cleave': U('rr-cleave', {sweep:2}, {attack:8}), 'rr-fork': U('rr-fork', {fork:true}, {attack:8}), 'rr-trident': U('rr-trident', {trident:true}, {attack:8}),
  'rr-pitch': U('rr-pitch', {pitchfork:true}, {attack:8}), 'rr-crab': U('rr-crab', {crabClaws:true}, {attack:8}), 'rr-octo': U('rr-octo', {octolash:true}, {attack:8}),
  'rr-stab': U('rr-stab', {backstab:3}, {attack:8}), 'rr-plain': U('rr-plain', {}, {attack:8}), 'rr-taunt': U('rr-taunt', {taunt:true}),
  'rr-wave': U('rr-wave', {wave:'right'}, {attack:1}), 'rr-blood': U('rr-blood', {bloodlust:true}, {attack:50}), 'rr-boom': U('rr-boom', {boomerang:true}, {attack:6}),
  'rr-punct': U('rr-punct', {puncture:2}, {attack:4}), 'rr-over': U('rr-over', {overwhelm:true}, {attack:20}), 'rr-arrow': U('rr-arrow', {arrow:3}),
  'rr-elec': U('rr-elec', {electricity:2}, {attack:4}),
  'rr-regen': U('rr-regen', {regen:2}), 'rr-renew': U('rr-renew', {renewal:true}), 'rr-rs': U('rr-rs', {triggers:[{on:'onRoundStart', do:'gainLumber', amount:2}]}),
  'rr-bloom': U('rr-bloom', {bloom:3}), 'rr-rally': U('rr-rally', {rally:2}), 'rr-immo': U('rr-immo', {immolation:2}), 'rr-rest': U('rr-rest', {restless:true}),
  'rr-boomb': U('rr-boomb', {explode:{time:1, damage:5}}), 'rr-ready': U('rr-ready', {triggers:[{on:'onReady', do:'gainLumber', amount:3}]}, {attack:1, wait:1}),
  'rr-revive': U('rr-revive', {revive:true}, {health:1}), 'rr-ods': U('rr-ods', {onDeathSpawn:{defId:'rr-tok', count:2}}, {health:1}),
  'rr-relic': U('rr-relic', {relic:true}, {health:1}), 'rr-crys': U('rr-crys', {crystallise:3}, {health:1}), 'rr-meio': U('rr-meio', {meiosis:1}, {health:1, attack:4}),
  'rr-brood': U('rr-brood', {brood:2}), 'rr-twin': U('rr-twin', {twin:true}), 'rr-spawner': U('rr-spawner', {triggers:[{on:'onRoundStart', do:'spawnCard', defId:'rr-tok', count:1}]}),
  'rr-pounce': U('rr-pounce', {pounce:3}), 'rr-bounty': U('rr-bounty', {bounty:2}), 'rr-ambush': U('rr-ambush', {ambush:4}),
});
const all = pl=> [...pl.row.left, ...pl.row.center, ...pl.row.right];
function mk(opts, seed){ const e = E.makeSimEngine(defs, E.mulberry32(seed || 5), Object.assign({recordEvents:true, battleMode:'open', reserveRows:2, reserveActs:true}, opts || {}));
  return {e, P:{1:e.newPlayer(1, {}, {health:200}), 2:e.newPlayer(2, {}, {health:200})}}; }
function put(e, P, pid, id, slot){ e.debugSpawnCard(P, so, pid, id, 'left', {}, []);
  const pl = P[pid], c = all(pl).reduce((a, x)=> (!a || x.uid > a.uid) ? x : a, null); c.slot = slot;
  const cs = all(pl); pl.row.center = cs.filter(x=> x.slot === 0); pl.row.left = cs.filter(x=> x.slot < 0).sort((a, b)=> b.slot - a.slot); pl.row.right = cs.filter(x=> x.slot > 0).sort((a, b)=> a.slot - b.slot);
  e.syncSlots(pl); return c; }
const place = (e, P, pid, r, id, sl)=> r === 0 ? put(e, P, pid, id, sl) : e.fillReserve(P[pid], r, sl, id);
const ROWS = ['front', 'middle', 'back'];
const rowsOf = pl=> [all(pl)].concat(pl.reserve.map(rw=> Object.values(rw)));
// One swing of side 1's unit (row ar, column 0) at side 2's units of row tr (slots). Returns {r, att, foes:{slot: card}}.
function swing(attId, ar, tr, slots, o){ o = o || {}; const {e, P} = mk(o.engine, o.seed); const att = place(e, P, 1, ar, attId, 0);
  const foes = {}; slots.forEach(sl=>{ foes[sl] = place(e, P, 2, tr, o.foeId || 'rr-wall', sl); });
  if(o.before) o.before(e, P, att, foes);
  const ev = [], stats = {}; e.resolveCombat(P, so, stats, ev, 1); return {e, P, att, foes, ev, stats}; }
const hitSlots = r=> Object.keys(r.foes).map(Number).filter(sl=> r.foes[sl].hp < r.foes[sl].maxHp).sort((a, b)=> a - b);
const took = (r, sl)=> r.foes[sl].maxHp - r.foes[sl].hp;
const tag = (ar, tr)=> `[${ROWS[ar]} unit -> ${ROWS[tr]} row]`;
const same = (a, b)=> JSON.stringify(a) === JSON.stringify(b);

// ---- the row share, measured (a 10-Attack swing from the back row at the front row)
const SHARE = (()=>{ const r = swing('rr-hit', 2, 0, [0]); return took(r, 0) / 10; })();
const rowAmt = n=> Math.ceil(n * SHARE);
ok(SHARE > 0 && SHARE <= 1, `the row share is a fraction of the swing (${SHARE})`);
// the shapes to compare: the front unit at the front row, then the back unit at the front row and at the middle row
const PAIRS = [[0, 0], [2, 0], [2, 1], [1, 2]];
const amt = (ar, n)=> ar ? rowAmt(n) : n;

// ---- Cleave (Sweep 2): the target and its two neighbours in the target's row (sides take the flat 2); nothing in other rows
PAIRS.forEach(([ar, tr])=>{ let decoys = [];
  const r = swing('rr-cleave', ar, tr, [-1, 0, 1, 2], {before:(e, P)=>{ const other = tr === 0 ? 1 : 0; decoys = [-1, 1].map(sl=> place(e, P, 2, other, 'rr-wall', sl)); }});
  ok(same(hitSlots(r), [-1, 0, 1]) && took(r, 0) === amt(ar, 8) && took(r, -1) === 2 && took(r, 1) === 2 && decoys.every(c=> c.hp === 500), `${tag(ar, tr)} Cleave: target + both neighbours in its row (${hitSlots(r)}; ${took(r, 0)}/${took(r, -1)}/${took(r, 1)})`); });

// ---- Fork: L and R when both hold a unit; only C; only the side that holds one
PAIRS.forEach(([ar, tr])=>{
  const a = swing('rr-fork', ar, tr, [-1, 0, 1]); ok(same(hitSlots(a), [-1, 1]), `${tag(ar, tr)} Fork with L and R: hits L and R (${hitSlots(a)})`);
  if(tr === 0 || ar === 2){ const b = swing('rr-fork', ar, tr, [0]); ok(same(hitSlots(b), [0]), `${tag(ar, tr)} Fork with C only: hits C (${hitSlots(b)})`); } });
// ---- Trident: C full, L and R half
PAIRS.forEach(([ar, tr])=>{ const r = swing('rr-trident', ar, tr, [-2, -1, 0, 1, 2]);
  ok(same(hitSlots(r), [-1, 0, 1]) && took(r, 0) === amt(ar, 8) && took(r, 1) === amt(ar, 4), `${tag(ar, tr)} Trident: C ${took(r, 0)}, L / R ${took(r, -1)}/${took(r, 1)} (${hitSlots(r)})`); });
// ---- Pitchfork: 4 lines (LL/L/C/R or L/C/R/RR), every one at half
PAIRS.forEach(([ar, tr])=>{ const r = swing('rr-pitch', ar, tr, [-2, -1, 0, 1, 2]); const h = hitSlots(r);
  ok((same(h, [-2, -1, 0, 1]) || same(h, [-1, 0, 1, 2])) && took(r, 0) === amt(ar, 4), `${tag(ar, tr)} Pitchfork: 4 lines (${h}), C ${took(r, 0)}`); });
// ---- Crab claws: L or R in that row, never straight ahead; both sides come up over seeds
PAIRS.forEach(([ar, tr])=>{ const seen = new Set(); let bad = 0;
  for(let seed = 1; seed <= 16; seed++){ const r = swing('rr-crab', ar, tr, [-1, 0, 1], {seed}); const h = hitSlots(r); if(h.length !== 1 || h[0] === 0) bad++; else seen.add(h[0]); }
  ok(!bad && seen.has(-1) && seen.has(1), `${tag(ar, tr)} Crab claws: one of L / R each swing, both seen (${[...seen]}, ${bad} bad)`); });
// ---- Octolash: the 8 nearest in that row
PAIRS.forEach(([ar, tr])=>{ const r = swing('rr-octo', ar, tr, [-4, -3, -2, -1, 0, 1, 2, 3, 4]); const h = hitSlots(r);
  ok(h.length === 8 && h.includes(0) && took(r, 0) === amt(ar, 8) && took(r, 2) === amt(ar, 8), `${tag(ar, tr)} Octolash: 8 lashes (${h.length}), each ${took(r, 2)}`); });
// ---- Backstab 3: nothing in its column: the nearest unit, +3
PAIRS.forEach(([ar, tr])=>{ const r = swing('rr-stab', ar, tr, [2, -3]);
  ok(same(hitSlots(r), [2]) && took(r, 2) === amt(ar, 11), `${tag(ar, tr)} Backstab: the nearest (slot 2) for ${took(r, 2)} (want ${amt(ar, 11)})`); });
// ---- Tipsy: the swing drifts L / C / R along that row
PAIRS.forEach(([ar, tr])=>{ const seen = new Set(); let off = 0;
  for(let seed = 1; seed <= 24; seed++){ const r = swing('rr-plain', ar, tr, [-1, 0, 1], {seed, before:(e, P, att)=>{ att.tipsy = 9; }}); hitSlots(r).forEach(sl=> seen.add(sl)); if(hitSlots(r).length > 1) off++; }
  ok(seen.size === 3 && !off, `${tag(ar, tr)} Tipsy: drifts over L, C and R of that row (${[...seen].sort()})`); });
// ---- Taunt: a Taunt unit beside the target in that row draws the swing
PAIRS.forEach(([ar, tr])=>{ let t = null; const r = swing('rr-plain', ar, tr, [0], {before:(e, P)=>{ t = place(e, P, 2, tr, 'rr-taunt', 1); }});
  ok(r.foes[0].hp === 500 && t.hp === 500 - amt(ar, 8) && r.ev.some(x=> x.kind === 'taunted' && x.attUid === t.uid), `${tag(ar, tr)} Taunt beside the target draws it (taunt -${500 - t.hp}, target -${500 - r.foes[0].hp})`); });
{ let t = null; const r = swing('rr-plain', 0, 1, [0], {before:(e, P)=>{ t = place(e, P, 2, 1, 'rr-taunt', -1); }});
  ok(r.foes[0].hp === 500 && t.hp === 492, `[front unit -> middle row, front column empty] a middle-row Taunt unit draws the swing that goes on to its row (${500 - t.hp})`); }
// ---- Rook's Row / Bishop's Path
PAIRS.forEach(([ar, tr])=>{ const r = swing('rr-plain', ar, tr, [0], {engine:{rules:{rookRow:2}}});
  ok(took(r, 0) === amt(ar, 10), `${tag(ar, tr)} Rook's Row +2 straight ahead (${took(r, 0)}, want ${amt(ar, 10)})`); });
// (a unit in its column picks the row; Crab claws then pinch L or R of it. With its column empty in every row it faces the front row,
// so L / R units in a row behind are out of its reach, as for a front-row crab.)
PAIRS.forEach(([ar, tr])=>{ const r = swing('rr-crab', ar, tr, [-1, 0, 1], {engine:{rules:{bishopPath:2}}}); const h = hitSlots(r);
  ok(h.length === 1 && took(r, h[0]) === amt(ar, 10), `${tag(ar, tr)} Bishop's Path +2 on the slant (${h.length === 1 ? took(r, h[0]) : h}, want ${amt(ar, 10)})`); });
// ---- Wave (right): the struck unit rides a column along its own row
PAIRS.forEach(([ar, tr])=>{ const r = swing('rr-wave', ar, tr, [0]); const t = r.foes[0];
  const where = tr === 0 ? all(r.P[2]).includes(t) : r.P[2].reserve[tr - 1][t.slot] === t;
  ok(t.slot === 1 && where && r.ev.some(x=> x.type === 'wave' && x.targetUid === t.uid), `${tag(ar, tr)} Wave pushes it to slot 1 in its row (slot ${t.slot}, in its row ${where})`); });
// ---- Bloodlust: a kill straight ahead, then it leaps (along its own row) to face the nearest creature
PAIRS.filter(([ar, tr])=> ar === 2 || tr === 0).forEach(([ar, tr])=>{ const r = swing('rr-blood', ar, tr, [0, 2], {before:(e, P, att, foes)=>{ foes[0].hp = 1; foes[0].maxHp = 1; }});
  const inRow = ar === 0 ? all(r.P[1]).includes(r.att) : r.P[1].reserve[ar - 1][r.att.slot] === r.att;
  ok(r.att.slot === 2 && inRow && r.ev.some(x=> x.type === 'bloodlustLeap' && x.uid === r.att.uid), `${tag(ar, tr)} Bloodlust leaps to slot 2 in its own row (slot ${r.att.slot}, in its row ${inRow})`); });
// ---- Boomerang: thrown on round 1, back on round 2 (a hit on the same target, caught: that is its action)
[[0, 0], [2, 0], [2, 1]].forEach(([ar, tr])=>{ const {e, P} = mk(); const att = place(e, P, 1, ar, 'rr-boom', 0), t = place(e, P, 2, tr, 'rr-wall', 0);
  const ev1 = [], ev2 = []; e.resolveCombat(P, so, {}, ev1, 1); const h1 = 500 - t.hp; e.resolveCombat(P, so, {}, ev2, 1); const h2 = 500 - t.hp - h1;
  ok(h1 === amt(ar, 6) && h2 === amt(ar, 6) && ev2.some(x=> x.type === 'boomerangCaught' && x.uid === att.uid), `${tag(ar, tr)} Boomerang: out ${h1}, back ${h2}, caught`); });
// ---- Puncture 2 and Overwhelm
PAIRS.forEach(([ar, tr])=>{ const r = swing('rr-punct', ar, tr, [0]); ok(r.ev.some(x=> x.type === 'pierceHQ' && x.dmg === 2), `${tag(ar, tr)} Puncture 2 reaches the castle`); });
PAIRS.forEach(([ar, tr])=>{ const r = swing('rr-over', ar, tr, [0], {foeId:'rr-frail'}); ok(r.ev.some(x=> x.type === 'overwhelmHQ' && x.dmg === amt(ar, 20) - 1), `${tag(ar, tr)} Overwhelm spills ${amt(ar, 20) - 1} into the castle`); });
// ---- Electricity: an arc to a unit beside the struck one, in its row
PAIRS.forEach(([ar, tr])=>{ let dec = []; const r = swing('rr-elec', ar, tr, [-1, 0, 1], {before:(e, P)=>{ if(tr !== 0) return; dec = [-1, 1].map(sl=> place(e, P, 2, 2, 'rr-wall', sl)); }});
  ok(hitSlots(r).length >= 2 && hitSlots(r).includes(0) && dec.every(c=> c.hp === 500), `${tag(ar, tr)} Electricity arcs beside the target in its row (${hitSlots(r)})`); });
// ---- Arrow: a back-row shooter shoots
[0, 1, 2].forEach(ar=>{ const r = swing('rr-arrow', ar, 0, [0]); ok(took(r, 0) === 3 && r.ev.some(x=> x.type === 'arrow' && x.uid === r.att.uid), `[${ROWS[ar]}] Arrow 3 shoots the unit facing it (${took(r, 0)})`); });

// ---- the round start, in every row
[0, 1, 2].forEach(ar=>{ const {e, P} = mk(); const c = place(e, P, 1, ar, 'rr-regen', 0); c.hp = 490; e.resolveCombat(P, so, {}, [], 1); ok(c.hp === 492, `[${ROWS[ar]}] Regeneration 2 (${c.hp - 490})`); });
[0, 1, 2].forEach(ar=>{ const {e, P} = mk(); const c = place(e, P, 1, ar, 'rr-renew', 0); c.poison = 3; c.bleed = 2; c.scar = 2; e.resolveCombat(P, so, {}, [], 1); ok(c.scar === 0 && c.bleed === 0 && c.poison === 2, `[${ROWS[ar]}] Renewal cleanses the physical debuffs; Poison is Cure's and only ticks (2026-10-19, package SK1) (poison ${c.poison}, bleed ${c.bleed}, scar ${c.scar})`); });
[0, 1, 2].forEach(ar=>{ const {e, P} = mk(); place(e, P, 1, ar, 'rr-rs', 0); const l0 = P[1].lumber || 0; e.resolveCombat(P, so, {}, [], 1); ok((P[1].lumber || 0) - l0 === 2, `[${ROWS[ar]}] On Round Start: +2 Lumber (${(P[1].lumber || 0) - l0})`); });
[0, 1, 2].forEach(ar=>{ const {e, P} = mk(); place(e, P, 1, ar, 'rr-bloom', 0); const m = place(e, P, 1, ar, 'rr-wall', 1); m.hp = 480; e.resolveCombat(P, so, {}, [], 1); ok(m.hp === 483, `[${ROWS[ar]}] Bloom 3 heals the hurt ally beside it (${m.hp - 480})`); });
[0, 1, 2].forEach(ar=>{ const {e, P} = mk(); place(e, P, 1, ar, 'rr-rally', 3); const h = put(e, P, 1, 'rr-plain', 0), t = put(e, P, 2, 'rr-wall', 0); e.resolveCombat(P, so, {}, [], 1); ok(t.hp === 490, `[${ROWS[ar]}] Rally 2 reaches the front-row unit (${500 - t.hp}, want 10)`); });
{ const {e, P} = mk(); put(e, P, 1, 'rr-rally', 3); const h = e.fillReserve(P[1], 2, 0, 'rr-plain'), t = put(e, P, 2, 'rr-wall', 0); e.resolveCombat(P, so, {}, [], 1); ok(t.hp === 500 - rowAmt(10), `[front Rally] reaches a back-row unit (${500 - t.hp}, want ${rowAmt(10)})`); }
[0, 2].forEach(ar=>{ const {e, P} = mk(); place(e, P, 1, ar, 'rr-immo', 0); const nb = [-1, 1].map(sl=> place(e, P, 1, ar, 'rr-wall', sl)); e.roundStart(P, 2, so, {}, []); ok(nb.every(c=> c.hp === 498), `[${ROWS[ar]}] Immolation 2 burns the units beside it in its row (${nb.map(c=> 500 - c.hp)})`); });
[0, 2].forEach(ar=>{ const {e, P} = mk(); const c = place(e, P, 1, ar, 'rr-rest', 0); put(e, P, 2, 'rr-wall', 3); e.restlessMoves(P, so, {}, []);
  const inRow = ar === 0 ? all(P[1]).includes(c) : P[1].reserve[ar - 1][c.slot] === c; ok(c.slot === 1 && inRow, `[${ROWS[ar]}] Restless walks a column toward the enemy along its row (slot ${c.slot})`); });
[0, 2].forEach(ar=>{ const {e, P} = mk(); place(e, P, 1, ar, 'rr-boomb', 0); const t = put(e, P, 2, 'rr-wall', 0); const ev = []; e.resolveCombat(P, so, {}, ev, 1);
  ok(t.hp === 495 && ev.some(x=> x.type === 'explode'), `[${ROWS[ar]}] Explode blows at the unit in its column (${500 - t.hp})`); });
[0, 2].forEach(ar=>{ const {e, P} = mk(); const c = place(e, P, 1, ar, 'rr-ready', 0); const l0 = P[1].lumber || 0, ev = []; e.resolveCombat(P, so, {}, ev, 1);
  ok(c.wait === 0 && ev.some(x=> x.type === 'ready' && x.uid === c.uid) && (P[1].lumber || 0) - l0 === 3, `[${ROWS[ar]}] its Wait runs out: Ready, and On Ready fires (+${(P[1].lumber || 0) - l0})`); });

// ---- slot refills, into the unit's own row (struck down by a 10-Attack enemy in its column)
function killIn(ar, id){ const {e, P} = mk(); const c = place(e, P, 1, ar, id, 0); put(e, P, 2, 'rr-hit', 0); const ev = []; e.resolveCombat(P, so, {}, ev, 2); return {e, P, c, ev, row: rowsOf(P[1])[ar]}; }
[0, 2].forEach(ar=>{ const k = killIn(ar, 'rr-revive'); ok(k.c.hp === 1 && k.c.revivedOnce && k.row.includes(k.c) && k.c.slot === 0, `[${ROWS[ar]}] Revive: back in its slot at 1 Health`); });
[0, 2].forEach(ar=>{ const k = killIn(ar, 'rr-ods'); const toks = k.row.filter(c=> c.defId === 'rr-tok');
  ok(toks.length === 2 && toks.some(c=> c.slot === 0) && rowsOf(k.P[1]).every((rw, i)=> i === ar || !rw.some(c=> c.defId === 'rr-tok')), `[${ROWS[ar]}] On Death: Spawn: 2 tokens in its row, one in its slot (${toks.map(c=> c.slot)})`); });
[0, 2].forEach(ar=>{ const k = killIn(ar, 'rr-relic'); ok(k.row.some(c=> /~relic$/.test(c.defId) && c.slot === 0), `[${ROWS[ar]}] Relic: its 1/1 stands in its slot`); });
[0, 2].forEach(ar=>{ const k = killIn(ar, 'rr-crys'); ok(k.row.some(c=> /~crystal/.test(c.defId) && c.slot === 0), `[${ROWS[ar]}] Crystallise: a crystal in its slot`); });
[0, 2].forEach(ar=>{ const k = killIn(ar, 'rr-meio'); const halves = k.row.filter(c=> /~half$/.test(c.defId)); ok(halves.length === 2 && halves.some(c=> c.slot === 0), `[${ROWS[ar]}] Meiosis: two halves in its row (${halves.map(c=> c.slot)})`); });
[0, 2].forEach(ar=>{ const {e, P} = mk(); place(e, P, 1, ar, 'rr-brood', 0); e.resolveCombat(P, so, {}, [], 1); const row = rowsOf(P[1])[ar];
  ok(row.filter(c=> /~brood$/.test(c.defId)).length === 2 && rowsOf(P[1]).every((rw, i)=> i === ar || !rw.some(c=> /~brood$/.test(c.defId))), `[${ROWS[ar]}] Brood 2: two brood tokens beside it, in its row`); });
[0, 2].forEach(ar=>{ const {e, P} = mk(); place(e, P, 1, ar, 'rr-twin', 0); e.resolveCombat(P, so, {}, [], 1); const row = rowsOf(P[1])[ar];
  ok(row.filter(c=> c.isTwin).length === 1, `[${ROWS[ar]}] Twin: its twin beside it, in its row`); });
[0, 2].forEach(ar=>{ const {e, P} = mk(); place(e, P, 1, ar, 'rr-spawner', 0); e.resolveCombat(P, so, {}, [], 1); const row = rowsOf(P[1])[ar];
  ok(row.some(c=> c.defId === 'rr-tok') && rowsOf(P[1]).every((rw, i)=> i === ar || !rw.some(c=> c.defId === 'rr-tok')), `[${ROWS[ar]}] a Spawn trigger spawns beside it, in its row`); });
// ---- arrival in a middle / back row: Pounce (once), Bounty
{ const {e, P} = mk(); const t = put(e, P, 2, 'rr-wall', 4); e.fillReserve(P[1], 2, 0, 'rr-pounce'); const ev = []; e.resolveCombat(P, so, {}, ev, 1); const d1 = 500 - t.hp; e.resolveCombat(P, so, {}, [], 1);
  ok(d1 === 3 && t.hp === 497 && ev.some(x=> x.type === 'pounce'), `[back] Pounce 3 on arriving in the row, once (${d1}, then ${497 - t.hp})`); }
{ const {e, P} = mk(); const b0 = P[1].lumber || 0; e.fillReserve(P[1], 1, 0, 'rr-bounty'); e.resolveCombat(P, so, {}, [], 1); ok((P[1].lumber || 0) - b0 === 2, `[middle] Bounty pays its owner on arrival (${(P[1].lumber || 0) - b0})`); }
// ---- Ambush from a back-row unit: an enemy entering the slot facing it takes the N
[0, 2].forEach(ar=>{ const {e, P} = mk(); place(e, P, 1, ar, 'rr-ambush', 0); e.resolveCombat(P, so, {}, [], 1); const ev = [];
  e.debugSpawnCard(P, so, 2, 'rr-wall', 0, {}, ev); const t = all(P[2]).find(c=> c.slot === 0);
  ok(t && t.hp === 496 && ev.some(x=> x.type === 'ambush'), `[${ROWS[ar]}] Ambush 4 strikes the enemy that enters the slot facing it (${t ? 500 - t.hp : 'none'})`); });

console.log(fail ? `raid-row-parity-2026-10-19: ${fail} FAILED (${pass} passed)` : `raid-row-parity-2026-10-19: all ${pass} passed`);
process.exit(fail ? 1 : 0);
