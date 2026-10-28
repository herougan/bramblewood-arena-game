#!/usr/bin/env node
// Package ENG12 (2026-10-28, the owner's 10-28 09:48 notes L1, L5, L10, L11):
//   L1  Ambush strikes the moment its trigger holds: a unit that comes into its watch at the round's start (Restless, the wind, a spell)
//       is struck then, not when the next card is played. Both timings: a card played into the slot, and a unit that walks in.
//   L5  Shock (1.5x from every source) priced by the 4-round rule: chance x rounds x the damage it adds (bramblewood-budget.js shockS).
//   L10 A sleeping unit never swings: Spore Cloud fights with Stealth / Flying / Nocturnal / Coffee sleepers, and no hit, shot, Ambush
//       or Banana from a unit while it is Asleep. (The replay's 💤 badge now clears when a hit wakes the unit: arena_app.js w2SkillVfx.)
//   L11 Nocturnal / Diurnal / Crepuscular (+A/+H) priced by their measured uptime (bramblewood-budget.js zeitS).
'use strict';
const fs = require('fs'), path = require('path');
const H = require('./lib/harness.js');
const E = H.Engine, ROOT = path.join(__dirname, '..');
const BB = require(path.join(ROOT, 'bramblewood-budget.js'));
let fail = 0, n = 0; const ok = (c, m)=>{ n++; if(!c){ fail++; console.log('  ✗', m); } else console.log('  ✓', m); };
const so = id=> id === 1 ? 'A' : 'B';
const U = (id, effects, o)=> Object.assign({id, name:id, attack:1, health:100, wait:0, cost:0, effects}, o || {});
const defs = Object.assign({}, H.loadCardDefs(), {
  'x-amb': U('x-amb', {ambush:3}, {attack:0, health:100, wait:9}), 'x-rest': U('x-rest', {restless:true}, {attack:0, health:100, wait:9}),
  'x-dummy': U('x-dummy', {}, {attack:0, health:100, wait:9}), 'x-banana': U('x-banana', {banana:3}, {attack:0, health:100, wait:0}),
});
const all = pl=> [...pl.row.left, ...pl.row.center, ...pl.row.right];
function mk(seed, rules){ const e = E.makeSimEngine(defs, E.mulberry32(seed || 5), {recordEvents:true, battleMode:'open', rules: rules || {}});
  return {e, P:{1: e.newPlayer(1, {}, {id:'st-hq', health:200, effects:{}}), 2: e.newPlayer(2, {}, {id:'st-hq', health:200, effects:{}})}}; }
function put(e, P, pid, id, slot, where){ const pl = P[pid]; e.debugSpawnCard(P, so, pid, id, where === undefined ? slot : where, {}, []);
  const c = all(pl).reduce((a, x)=> (!a || x.uid > a.uid) ? x : a, null); c.slot = slot;
  const cs = all(pl); pl.row.center = cs.filter(x=> x.slot === 0); pl.row.left = cs.filter(x=> x.slot < 0).sort((a, b)=> b.slot - a.slot); pl.row.right = cs.filter(x=> x.slot > 0).sort((a, b)=> a.slot - b.slot);
  e.syncSlots(pl); return c; }
const ambushHits = (ev, uid)=> ev.filter(x=> x.type === 'hit' && x.ambush && x.attUid === uid);

// ---- L1 Ambush -----------------------------------------------------------------------------------------------------------------------
// (a) a card played into the slot facing it: struck as it lands (unchanged)
{ const {e, P} = mk(11); const a = put(e, P, 1, 'x-amb', 0); e.debugSpawnCard(P, so, 2, 'x-dummy', 3, {}, []); // a unit away from it
  const ev = []; e.debugSpawnCard(P, so, 2, 'x-dummy', 0, {}, ev); const d = all(P[2]).reduce((x, y)=> (!x || y.uid > x.uid) ? y : x, null);
  const hit = ambushHits(ev, a.uid); ok(d.slot === 0 && hit.length === 1 && d.hp === 97, `L1 a unit played into the slot facing the Ambush is struck as it lands (slot ${d.slot}, ${hit.length} hit, Health ${d.hp})`); }
// (b) a unit that walks into the slot at the round's start (Restless): struck in that round start, before any card is played
{ const {e, P} = mk(12); const r = put(e, P, 2, 'x-rest', 1, 'left'); const a = put(e, P, 1, 'x-amb', 0, 'left'); // the Restless unit first: the Ambush, just arrived, doesn't react to it
  const ev0 = []; e.debugSpawnCard(P, so, 1, 'x-dummy', 5, {}, ev0); // a look at the board as it stands now: everyone is seen
  const hp0 = r.hp, ev = []; e.roundStart(P, 2, so, {}, ev);
  ok(r.slot === 0 && ev.some(x=> x.type === 'restless' && x.uid === r.uid), `L1 ... the Restless unit walks into the slot facing it at the round's start (slot ${r.slot})`);
  ok(ambushHits(ev, a.uid).length === 1 && r.hp === hp0 - 3, `L1 ... and the Ambush strikes it in that round start, at once (${ambushHits(ev, a.uid).length} hit, Health ${hp0} -> ${r.hp})`);
  const ev2 = []; e.debugSpawnCard(P, so, 1, 'x-dummy', 6, {}, ev2); ok(ambushHits(ev2, a.uid).length === 0, 'L1 ... and not again when the next card is played'); }
// (c) an Asleep ambusher lets the unit pass (L10)
{ const {e, P} = mk(13); const a = put(e, P, 1, 'x-amb', 0); a.asleep = 1; e.debugSpawnCard(P, so, 2, 'x-dummy', 3, {}, []);
  const ev = []; e.debugSpawnCard(P, so, 2, 'x-dummy', 0, {}, ev); ok(ambushHits(ev, a.uid).length === 0, 'L1/L10 an Asleep Ambush unit does not strike'); }

// ---- L10 no swing while Asleep, Spore Cloud fights -----------------------------------------------------------------------------------
// Random decks of Stealth / Flying / Nocturnal / Coffee / Banana / Ambush units under Spore Cloud (by night and in the day-night cycle):
// every 'hit' / 'hitHQ' an attacker makes is checked against its own Asleep counter at that moment. A Boomerang's return and an Explode fuse
// are left out: the return is the throw already in the air, the fuse burns whatever the unit does.
{ const ids = ['owl-nightwatch', 'raccoon-nightcrew', 'baby-bat', 'nightshade-moth', 'vampire-bat', 'owl-sentinel', 'buzzed-chipmunk', 'bramblewood-macaque', 'polar-bear', 'great-horned-owl'].filter(id=> defs[id]);
  let swings = 0, bad = []; const GAMES = 120;
  for(let g = 0; g < GAMES; g++){ const rng = H.seededRng(9000 + g); const deck = ()=>{ const d = {}; for(let i = 0; i < 20; i++){ const id = ids[Math.floor(rng() * ids.length)]; d[id] = (d[id] || 0) + 1; } return d; };
    const rules = {sporeCloud:true, phase: g % 2 ? 'night' : 'cycle'};
    const e = E.makeSimEngine(defs, H.seededRng(g * 7 + 3), {battleMode: g % 3 ? 'open' : undefined, rules, aiAim:true, aiLevel:1, recordEvents:true});
    const P = {1: e.newPlayer(1, deck(), {id:'st-hq', health:35, effects:{}}), 2: e.newPlayer(2, deck(), {id:'st-hq', health:35, effects:{}})};
    const ev = [], push = ev.push.bind(ev);
    ev.push = (...xs)=>{ xs.forEach(x=>{ if(x && (x.type === 'hit' || x.type === 'hitHQ') && x.attUid != null && !x.boomerang && !x.explode){ swings++;
      [1, 2].forEach(pid=>{ const c = e.allBoardCards(P[pid]).find(c=> c && c.uid === x.attUid); if(c && c.asleep > 0 && !c.hibernating) bad.push(c.defId + (x.ambush ? ' (ambush)' : x.ranged ? ' (shot)' : '')); }); } }); return push(...xs); };
    const st = {}; e.draw(P[1], 3, 'A', st, ev); e.draw(P[2], 3, 'B', st, ev);
    for(let r = 1; r <= 40; r++){ [1, 2].forEach(p=>{ P[p].playedThisTurn = false; P[p].discardUsedThisTurn = false; });
      if(r > 1) e.roundStart(P, r, so, st, ev); e.aiTakeTurn(P, so, 1, st, ev); e.aiTakeTurn(P, so, 2, st, ev);
      if(e.resolveCombat(P, so, st, ev, r % 2 === 0 ? 1 : 2)) break; e.draw(P[1], 1, 'A', st, ev); e.draw(P[2], 1, 'B', st, ev); } }
  ok(swings > 1000, `L10 Spore Cloud fights played (${GAMES} fights, ${swings} hits checked)`);
  ok(bad.length === 0, `L10 no unit hits anything while Asleep (Stealth, Flying, Nocturnal, Coffee, Banana, Ambush) (${bad.length}: ${[...new Set(bad)].slice(0, 6).join(', ')})`); }
{ const {e, P} = mk(21); const b = put(e, P, 1, 'x-banana', 0); put(e, P, 2, 'x-dummy', 0); b.asleep = 2; let thrown = 0;
  for(let r = 0; r < 6; r++){ b.asleep = 2; const ev = []; e.resolveCombat(P, so, {}, ev, 1); if(ev.some(x=> x.type === 'banana' && x.uid === b.uid)) thrown++; }
  ok(thrown === 0, `L10 an Asleep Banana unit neither eats nor throws (${thrown}/6 rounds)`); }
// The replay clears the 💤 badge on a wake (the UI path: arena_app.js w2SkillVfx's statusEnd)
{ const src = fs.readFileSync(path.join(ROOT, 'arena_app.js'), 'utf8');
  ok(/case 'statusEnd': if\(\[[^\]]*'asleep'[^\]]*\]\.includes\(ev\.status\)\)/.test(src), 'L10 the replay clears a woken unit\'s Asleep badge (statusEnd asleep)'); }

// ---- L11 time of day, L5 Shock: the prices ------------------------------------------------------------------------------------------
{ const M = JSON.parse(fs.readFileSync(path.join(ROOT, 'docs', 'balance', 'eng12-uptime-2026-10-28.json'), 'utf8')), p = M.plain, c = M.crepuscular, near = (a, b)=> Math.abs(a - b) <= 0.011;
  ok(near(BB.ZEIT_UPTIME.nocturnal, p.night + p.twilight) && near(BB.ZEIT_UPTIME.diurnal, p.day + p.twilight - p.dayDim / 2) && near(BB.ZEIT_UPTIME.crepuscular, c.day + c.night + 2 * c.twilight),
    `L11 the uptimes are the measured shares (night ${BB.ZEIT_UPTIME.nocturnal}, day ${BB.ZEIT_UPTIME.diurnal}, crepuscular ${BB.ZEIT_UPTIME.crepuscular})`);
  ok(near(BB.ZEIT_DARK_SHARE, p.dark) && near(BB.SHOCK.other, p.dmgPerUnitRound), 'L5/L11 the dark share and the damage a unit takes a round are the measured ones'); }
ok(BB.zeitS('nocturnal', {nocturnal: 4}).S === 4.24 && BB.zeitS('nocturnal', {nocturnal: true}).S === 1.06, 'L11 Nocturnal 4 (+4/+0) is 0.53 x 8 = 4.24 (was a fixed 1); plain Nocturnal (+1/+0) 1.06');
ok(BB.zeitS('nocturnal', {nocturnal: 5, nocturnalHp: 6}).S === 8.48 && BB.zeitS('nocturnalHp', {nocturnal: 5, nocturnalHp: 6}).S === 0, 'L11 ... with Nocturnal Hp: 0.53 x (2 x 5 + 6); the Hp key costs nothing beside its flag');
ok(BB.zeitS('nocturnalHp', {nocturnalHp: 2}).S === 1.06 && BB.zeitS('diurnal', {diurnal: 1}).S === 0.76 && BB.zeitS('crepuscular', {crepuscular: 1}).S === 1.98, 'L11 Nocturnal Hp alone, Diurnal 1 (0.38 x 2), Crepuscular 1 (0.99 x 2)');
ok(BB.zeitS('diurnal', {diurnal: true, diurnalGrant: {evasive: true}}).S === 0 && BB.CONTEXT_MULT_BY.nocturnalGrant === 0.53 && BB.CONTEXT_MULT_BY.diurnalGrant === 0.38, 'L11 the braces carry their own price, at the same uptimes');
{ const SC = require(path.join(ROOT, 'tools', 'skill_costs.js')), T = SC.make(JSON.parse(fs.readFileSync(path.join(ROOT, 'canonical', 'skill-costs.json'), 'utf8')));
  const cards = JSON.parse(fs.readFileSync(path.join(ROOT, 'canonical', 'cards.json'), 'utf8')), card = id=> cards.find(c=> c.id === id);
  const owl = card('owl-nightwatch'), b = T.budget(owl), noc = b.parts.find(x=> x[1] === 'nocturnal');
  ok(noc && noc[2] === 4.54, `L11 the Owl Nightwatch's Nocturnal 4: 4.24 + the dark-sight 0.3 (${noc && noc[2]})`);
  ok(owl.attack === 1 && owl.health === 6 && b.ok, `L11 ... and it is re-fitted to ${owl.attack}/${owl.health} (was 1/8), within both caps (${b.x1} / ${b.N})`);
  const moved = {'great-horned-owl': '2/14', 'raccoon-bandit': '4/7', 'weredog': '2/7', 'night-watchman': '1/3', 'sunspire-choirmother': '3/4', 'vampire-bat': '2/5', 'kinkajou-lurker': '5/9', 'electric-catfish': '2/8'};
  const bad = Object.keys(moved).filter(id=>{ const c = card(id); return `${c.attack}/${c.health}` !== moved[id] || !T.budget(c).ok; });
  ok(!bad.length, `L5/L11 the re-fitted cards hold their new lines within both caps (${bad.join(', ') || 'all'})`);
  ok(T.skillCost('nocturnal', 4) === 4.24 && T.skillCost('shock', {chance: 40, duration: 1}) === BB.shockS({chance: 40, duration: 1}, 0), 'L5/L11 skill_costs prices one skill the same way without a card');
  const eel = T.budget(card('voltaic-eel')).parts.find(x=> x[1] === 'shock'), cat = T.budget(card('electric-catfish')).parts.find(x=> x[1] === 'shockBolt');
  ok(eel && eel[2] === 0.83 && cat && cat[2] === 7.98, `L5 the Voltaic Eel's Shock 40%/1 at Attack 1: 0.83 (was 0.93); the Catfish's Shock Bolt 2: 7.98 (was 6) (${eel && eel[2]}, ${cat && cat[2]})`); }
ok(BB.shockS({chance: 100, duration: 2}, 3) > BB.shockS({chance: 100, duration: 1}, 3) && BB.shockS({chance: 100, duration: 1}, 3) > BB.shockS({chance: 50, duration: 1}, 3) && BB.shockS({chance: 50, duration: 1}, 5) > BB.shockS({chance: 50, duration: 1}, 1),
  'L5 Shock costs more with more chance, more rounds and more Attack (it was a flat 0.93)');
ok(BB.shockS({chance: 40, duration: 1}, 1) === 0.83 && BB.shockS({chance: 30, duration: 1}, 3) === 1.07 && BB.shockS({chance: 100, duration: 2}, 3) === 4.09, 'L5 Shock 40%/1 at Attack 1 0.83, 30%/1 at Attack 3 1.07, 100%/2 at Attack 3 4.09');
// the damage rule itself is unchanged: 1.5x from every source
{ const {e, P} = mk(31); const t = put(e, P, 2, 'x-dummy', 0); t.shocked = 1; const hp0 = t.hp; e.damageCard(t, 4, 'physical'); ok(hp0 - t.hp === 6, `L5 a Shocked unit still takes 1.5x (4 -> ${hp0 - t.hp})`); }

if(typeof module !== 'undefined') module.exports = {ok, defs};
if(require.main === module){ console.log(`\n${n - fail}/${n} checks passed`); process.exit(fail ? 1 : 0); }
