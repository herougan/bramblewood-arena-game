#!/usr/bin/env node
// 2026-10-17 (the user's Arena and raid notes, 23:25 to 23:49): the engine and data side of the batch.
//   Psychic Dampener (psychic halved, Confuse 1 round less), the Arena's Lumber Rush as an Environment card, the raid allies playing only
//   into their own rows (BramblewoodRaid.allySlot), the boss calling Commons into its back two rows (bossReinforce), the back rows'
//   volley (engine reserveVolley), the Goliath's field / Commons / ground, the boss unit's own name and Health, the admin damage path.
'use strict';
const fs = require('fs'), path = require('path');
const H = require('./lib/harness.js');
const E = H.Engine;
const R = require('../bramblewood-raid.js');
let fail = 0; const ok = (c, m)=>{ if(!c){ fail++; console.log('  ✗', m); } };
const so = id=> id===1 ? 'A' : 'B';
const U = (id, effects, o)=> Object.assign({id, name:id, attack:3, health:500, wait:0, cost:0, effects: effects || {}}, o || {});
const defs = Object.assign({}, H.loadCardDefs(), {
  'ra-wall': U('ra-wall', {}, {attack:0}), 'ra-psy': U('ra-psy', {psychic:3}, {attack:1}), 'ra-conf1': U('ra-conf1', {confuse:{chance:100, duration:1}}, {attack:1}),
  'ra-conf2': U('ra-conf2', {confuse:{chance:100, duration:2}}, {attack:1}), 'ra-hit': U('ra-hit', {}, {attack:7}), 'ra-slow': U('ra-slow', {}, {attack:6, wait:2}),
  'ra-com': U('ra-com', {}, {attack:1, health:3, rarity:'common'}),
});
const all = pl=> [...pl.row.left, ...pl.row.center, ...pl.row.right];
function mk(rules, opts){ const e = E.makeSimEngine(defs, E.mulberry32(7), Object.assign({recordEvents:true, battleMode:'open', rules: rules || undefined}, opts || {})); return {e, P:{1:e.newPlayer(1, {}), 2:e.newPlayer(2, {})}}; }
function put(e, P, pid, id, slot){ e.debugSpawnCard(P, so, pid, id, 'left', {}, []);
  const pl = P[pid], c = all(pl).reduce((a, x)=> (!a || x.uid > a.uid) ? x : a, null); c.slot = slot;
  const cs = all(pl); pl.row.center = cs.filter(x=> x.slot === 0); pl.row.left = cs.filter(x=> x.slot < 0).sort((a, b)=> b.slot - a.slot); pl.row.right = cs.filter(x=> x.slot > 0).sort((a, b)=> a.slot - b.slot);
  e.syncSlots(pl); return c; }
const src = fs.readFileSync(path.join(__dirname, '..', 'arena_app.js'), 'utf8');
const fxf = fs.readFileSync(path.join(__dirname, '..', 'bramblewood-fx-f.js'), 'utf8');
const raids = JSON.parse(fs.readFileSync(path.join(__dirname, '..', 'canonical', 'raids.json'), 'utf8'));

// ---- Psychic Dampener: a Psychic 3 hit lands for 1 (half, rounded down); a Confuse lasts 1 round less (a 1-round Confuse doesn't land)
{ const run = rules=>{ const {e, P} = mk(rules); put(e, P, 1, 'ra-psy', 0); const w = put(e, P, 2, 'ra-wall', 0); const ev = []; e.resolveCombat(P, so, {}, ev, 1); return {hp: w.hp, ev}; };
  const off = run(null), on = run({psychicDampener:true});
  ok(off.hp === 496, `no dampener: 1 + Psychic 3 (${off.hp})`); ok(on.hp === 498, `Psychic Dampener: 1 + Psychic 1 (${on.hp})`);
  ok(on.ev.some(x=> x.type === 'psychic' && x.dampened && x.dmg === 1), 'the psychic event says it was dampened'); }
{ const conf = (id, rules)=>{ const {e, P} = mk(rules); put(e, P, 1, id, 0); const w = put(e, P, 2, 'ra-wall', 0); const ev = []; e.resolveCombat(P, so, {}, ev, 1); return {c: w.confused || 0, ev}; };
  ok(conf('ra-conf1', null).c === 1, 'no dampener: a 1-round Confuse lands');
  const d1 = conf('ra-conf1', {psychicDampener:true}); ok(d1.c === 0 && d1.ev.some(x=> x.type === 'dampened' && x.what === 'confuse'), `Psychic Dampener: a 1-round Confuse doesn't land (${d1.c})`);
  ok(conf('ra-conf2', {psychicDampener:true}).c === 1, 'Psychic Dampener: a 2-round Confuse lands for 1'); }

// ---- Lumber Rush (lumberEvery 2): both sides +1 Lumber on rounds 3, 5, 7 (the rule an Arena Environment card now names)
{ const {e, P} = mk({lumberEvery:2}); const got = [];
  for(let r = 1; r <= 7; r++){ const l0 = P[1].lumber || 0; const ev = []; e.roundStart(P, r, so, {}, ev); if((P[1].lumber || 0) > l0 && ev.some(x=> x.type === 'lumber' && x.rule)) got.push(r); }
  ok(got.join() === '3,5,7', `Lumber Rush: +1 on rounds 3, 5, 7 (${got.join()})`); }
ok(/function arenaExtraRows\(rs\)/.test(src) && /'Lumber Rush'/.test(src) && /add\('lumberEvery'/.test(src), 'the Arena: Lumber Rush is an Environment row (arenaExtraRows)');
ok(/rows = rows\.concat\(arenaExtraRows\(m\.arenaRuleset\)\)/.test(src), 'the Arena: its rows join the fight\'s Environment stack');
ok(/const rs = '';/.test(src) && !/bfPillHTML\('arena-rs-pill'/.test(src), 'the Arena: the ruleset pill is gone');
ok(/lumberEvery:'timber'/.test(src) && /timber:\{art:'art\/fields\/undergrowth\.png'\}/.test(src), 'Lumber Rush has a scene (the Undergrowth\'s, borrowed)');

// ---- Allies play only into their own rows
{ const {e, P} = mk(null, {reserveRows:2}); const pl = P[1];
  ok(R.allySlot(e, pl, 1) === 0, 'an ally with an empty board still plays into its own middle row (centre)');
  put(e, P, 1, 'ra-wall', 2); ok(R.allySlot(e, pl, 1) === 2, 'the middle-row ally prefers the slot behind your unit');
  ok(R.allySlot(e, pl, 2) === 0, 'the back-row ally plays into the back row, never the middle');
  [-3, -2, -1, 0, 1, 2, 3].forEach(sl=> e.fillReserve(pl, 2, sl, 'ra-wall'));
  ok(R.allySlot(e, pl, 2) === null, 'a full back row: the ally keeps its card (no other row)'); }
ok(!/E\.debugSpawnCard\(m\.players, m\.sideOf, 1, id, a\.row === 1 \? 'left' : 'right'/.test(src) && /RaidM\.allySlot\(E, pl, a\.row\)/.test(src), 'raidAlliesTurn: no fallback into your front row or the other ally\'s row');

// ---- The boss calls Commons into its back two rows: 1 a row, 2 a round at most, only behind a card, none from round 1, cap 6
{ const {e, P} = mk(null, {reserveRows:2}); const pl = P[2];
  ok(R.bossReinforce(e, pl, ['ra-com'], ()=> 0, {round:1}).length === 0, 'not on round 1');
  ok(R.bossReinforce(e, pl, ['ra-com'], ()=> 0, {round:2}).length === 0, 'nothing in front: no slot to call into');
  put(e, P, 2, 'ra-wall', 0); put(e, P, 2, 'ra-wall', 1);
  const g1 = R.bossReinforce(e, pl, ['ra-com'], ()=> 0, {round:2});
  ok(g1.length === 2 && g1[0].row === 1 && g1[0].slot === 0 && g1[1].row === 2 && g1[1].slot === 0, `round 2: one into the middle (behind a card), one into the back behind it (${JSON.stringify(g1.map(x=> [x.row, x.slot]))})`);
  const g2 = R.bossReinforce(e, pl, ['ra-com'], ()=> 0, {round:3}); ok(g2.length === 2 && g2[0].slot === 1 && g2[1].slot === 1, 'round 3: the next column');
  ok(R.bossReinforce(e, pl, ['ra-com'], ()=> 0, {round:4}).length === 0, 'every free slot with a card in front is taken: none');
  [-1, -2, 2].forEach(sl=> put(e, P, 2, 'ra-wall', sl)); R.bossReinforce(e, pl, ['ra-com'], ()=> 0, {round:5});
  ok(pl.reserve.reduce((t, r)=> t + Object.keys(r).length, 0) === 6, 'and never more than 6 waiting in its back rows'); }
{ const pool = R.raidCommonPool({}, {fight:{deck:{'kraken-spawnling':1}}}, defs);
  ok(pool.length > 0 && pool.every(id=> (defs[id].rarity || 'common') === 'common' && !defs[id].token && !defs[id].basic && !/~/.test(id) && (defs[id].cost || 0) <= 2), `a derived pool: Commons of the deck's kinds, cost 2 or less (${pool.slice(0, 5).join(', ')})`); }

// ---- The back rows strike: half Attack (rounded up) at the front unit in their column, the castle if it's empty; Wait counts down first
{ const {e, P} = mk(null, {reserveRows:2}); put(e, P, 1, 'ra-wall', 0); put(e, P, 1, 'ra-wall', 1);
  e.fillReserve(P[1], 1, 0, 'ra-hit'); const slow = e.fillReserve(P[1], 1, 1, 'ra-slow'); e.fillReserve(P[1], 2, 0, 'ra-hit');
  const foe = put(e, P, 2, 'ra-wall', 0); const hq0 = P[2].hq.hp; const ev = [];
  e.reserveVolley(P, so, 1, {}, ev);
  ok(foe.hp === 500 - 4 - 4, `two strikes of half 7 (4) on the unit in their column (${foe.hp})`);
  ok(P[2].hq.hp === hq0 && slow.wait === 1, `the waiting unit only counts its Wait down (${slow.wait})`);
  e.reserveVolley(P, so, 1, {}, []); e.reserveVolley(P, so, 1, {}, []);
  ok(P[2].hq.hp === hq0 - 3, `ready, it strikes an empty column's castle for half 6 (${hq0 - P[2].hq.hp})`);
  ok(ev.some(x=> x.field === 'volleyHit' && x.row === 2), 'the volley events say which row struck');
  P[2].onHqHit = ()=> 0; const h1 = P[2].hq.hp; e.reserveVolley(P, so, 1, {}, []); ok(P[2].hq.hp === h1, 'a shielded castle (the stumps) takes nothing'); }
{ const {e, P} = mk(null, {reserveRows:2}); put(e, P, 2, 'ra-wall', 0); e.fillReserve(P[2], 1, 0, 'ra-hit'); const w = put(e, P, 1, 'ra-wall', 0);
  e.reserveVolley(P, so, 1, {}, []); ok(w.hp === 500, 'only the side asked for strikes (the boss\'s back rows wait)'); }
ok(/m\.engine\.reserveVolley\(m\.players, m\.sideOf, 1, m\.stats, drawEvents\)/.test(src), 'a raid round: your back rows strike');

// ---- The Goliath's data: its field, its Commons, its ground
{ const g = raids.find(r=> r.id === 'goliath');
  ok(g && g.fieldRules && g.fieldRules.psychicDampener === true && g.fieldRules.crushingDepths === 2 && g.fieldRules.tide === true, 'the Goliath fights under Crushing Depths 2, the Tide and the Psychic Dampener');
  ok(g.ground === 'mabyss', 'the Goliath fights in the Abyss');
  ok((g.commonPool || []).length >= 5 && g.commonPool.every(id=> defs[id] && (defs[id].rarity || 'common') === 'common'), 'its Commons are real Commons');
  ok(R.raidCommonPool(g, g.parts[0], defs).join() === g.commonPool.join(), 'the raid\'s own pool wins'); }
ok(/psychicDampener:\{icon:'🧠', name:'Psychic Dampener'/.test(src) && /\['psychicDampener', \{psychicDampener:true\}/.test(src), 'Psychic Dampener: a FIELD2 card (Edit skirmish, Environment, Effects library)');
ok(fs.existsSync(path.join(__dirname, '..', 'art', 'fields', 'psychicdampener.png')) && fs.existsSync(path.join(__dirname, '..', 'art', 'maps', 'mabyss.png')) && fs.existsSync(path.join(__dirname, '..', 'art', 'maps', 'marena.png')), 'the new scenes exist');
ok(/function fieldRowHidden\(key\)\{ return fieldRowState\(key\) === 'unknown' && !\(typeof adminModeEnabled/.test(src), 'the "?" reveal: admins see every line');

// ---- The boss unit: its own card and name; Health ×(1.5 + 1.5·r), not ×(2 + 10·r²)
ok(/bossUnitId = base \+ '~boss'/.test(src) && /'kraken-spawnling':'Kraken Brute'/.test(src) && /\(1\.5 \+ 1\.5 \* r\)/.test(src) && !/2 \+ 10 \* r \* r/.test(src), 'the boss unit is the Kraken Brute and so on, at ×1.5–×3 Health');
// ---- Admin damage, the Tentacle Smack
ok(/async function adminRaidDamage\(def, frac\)/.test(src) && /data-raid-admin-dmg="0\.5"/.test(src), 'Admin: Deal 10% / Deal 50%');
ok(fs.existsSync(path.join(__dirname, '..', 'supabase', 'proposed', '20261017_e_admin_raid_damage.sql')), 'the admin damage function is a proposed migration');
ok(/function tentacleDraw\(ctx/.test(fxf) && !/TENTACLE_SVG/.test(fxf), 'the Tentacle Smack is drawn on one canvas');

console.log(fail ? `raid-arena-2026-10-17: ${fail} failure(s)` : 'raid-arena-2026-10-17: all passed');
process.exit(fail ? 1 : 0);
