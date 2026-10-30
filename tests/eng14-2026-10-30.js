#!/usr/bin/env node
// Package ENG14 (2026-10-30, owner 10-30 23:25):
//   X6  "The final elite fight 8-8 should be in pitch darkness: (Miss 1-2 instead)": 8-8's fight rules carry dark 'pitch' (1 in 2).
//   X8  "Does the CPU on our side ever play leaders btw?": a raid's CPU allies open with a leader (raidAllyLeaderOf); a group dungeon's CPU
//       seat had none and now opens with its deck's leader (bramblewood-coop.js createTable).
//   X10 "Mirage ... should do on both side. On multi-player environments, it should be for each player.": one Illusion a round per player.
//   X20 ANAD-1 "Anadromous: Get tide benefits +2 Health in non-sea, +1 attack in sea.": +1 Attack on rules.saltMap, else +2 Health.
//   X24 the CPU saves for a high-cost card (AI_PLAN_*): it holds its paying plays, pitches, then plays the big card; not while losing badly.
//   X25 "Elite skirmishes start with +1 card in their hand.": the CPU's opening hand is 4 in an elite-kind fight (openingExtra).
//   X26 Bola N: Arrow N's shot, the target Pinned for its next turn (no swing, no move; skills still work); priced in skill-costs.json.
'use strict';
const fs = require('fs'), path = require('path');
const H = require('./lib/harness.js');
const E = H.Engine, ROOT = path.join(__dirname, '..');
const app = fs.readFileSync(path.join(ROOT, 'arena_app.js'), 'utf8');
const eng = fs.readFileSync(path.join(ROOT, 'bramblewood-engine.js'), 'utf8');
let fail = 0, n = 0; const ok = (c, m)=>{ n++; if(!c){ fail++; console.log('  ✗', m); } else console.log('  ✓', m); };
const so = id=> id === 1 ? 'A' : 'B';
const U = (id, effects, o)=> Object.assign({id, name:id, attack:1, health:20, wait:0, cost:0, effects}, o || {});
const defs = Object.assign({}, H.loadCardDefs(), {
  'x-a': U('x-a', {}), 'x-wall': U('x-wall', {}, {attack:0, health:5000, wait:9}),
  'x-bola': U('x-bola', {bola:1}, {attack:0, health:50}), 'x-hitter': U('x-hitter', {}, {attack:3, health:200}),
  'x-archer': U('x-archer', {arrow:1}, {attack:3, health:200}),
  'x-salmon': U('x-salmon', {anadromous:true}, {attack:2, health:5}),
  'x-big': U('x-big', {}, {attack:6, health:14, cost:3}), 'x-small': U('x-small', {}, {attack:1, health:3, cost:1}), 'x-free': U('x-free', {}, {attack:1, health:2, cost:0}),
});
const all = pl=> [...pl.row.left, ...pl.row.center, ...pl.row.right];
function mk(rules, seed, o){ const e = E.makeSimEngine(defs, E.mulberry32(seed || 5), Object.assign({recordEvents:true, battleMode:'open', rules: rules || {}}, o || {}));
  return {e, P:{1: e.newPlayer(1, {}, {id:'st-hq', health:500, effects:{}}), 2: e.newPlayer(2, {}, {id:'st-hq', health:500, effects:{}})}}; }
function put(e, P, pid, id, slot){ const pl = P[pid]; e.debugSpawnCard(P, so, pid, id, 'left', {}, []);
  const c = all(pl).reduce((a, x)=> (!a || x.uid > a.uid) ? x : a, null); c.slot = slot;
  const cs = all(pl); pl.row.center = cs.filter(x=> x.slot === 0); pl.row.left = cs.filter(x=> x.slot < 0).sort((a, b)=> b.slot - a.slot); pl.row.right = cs.filter(x=> x.slot > 0).sort((a, b)=> a.slot - b.slot);
  e.syncPhaseStats(P, so, []); return c; }
const round = (e, P, first)=>{ const ev = []; e.resolveCombat(P, so, {}, ev, first || 1); return ev; };

// ---- X26 Bola -------------------------------------------------------------------------------------------------------------------------
{ const {e, P} = mk(); const b = put(e, P, 1, 'x-bola', 0), t = put(e, P, 2, 'x-hitter', 0);
  const ev1 = round(e, P, 1);
  const shot = ev1.find(x=> x.type === 'arrow' && x.uid === b.uid), pin = ev1.find(x=> x.type === 'statusFx' && x.kind === 'pinDown' && x.targetUid === t.uid);
  ok(shot && shot.bola && shot.amount === 1, `Bola 1 throws a shot for 1 at the unit facing it (${shot && shot.amount})`);
  ok(!!pin, 'the unit it hits is Pinned (statusFx pinDown)');
  ok(t.hp === 199, `the target took the bola's 1 damage (${t.hp})`);
  const sk = ev1.find(x=> x.type === 'skipTurn' && x.uid === t.uid);
  ok(sk && sk.reason === 'pinned' && !ev1.some(x=> x.type === 'hit' && x.attUid === t.uid), 'Pinned before its swing: its swing that round is lost (skipTurn pinned)');
  ok(!(t.pinDown > 0) && t.pinFreed != null, 'the Pin is spent by the lost swing');
  e.endOfRoundUpkeep && e.endOfRoundUpkeep(P, so, {}, []);
  const ev2 = round(e, P, 1);
  ok(!ev2.some(x=> x.type === 'statusFx' && x.kind === 'pinDown'), 'the round after it broke free it can\'t be Pinned again');
  ok(ev2.some(x=> x.type === 'hit' && x.attUid === t.uid), 'so it swings that round'); }
{ const {e, P} = mk(); put(e, P, 1, 'x-bola', 0); const t = put(e, P, 2, 'x-archer', 0);
  const ev = round(e, P, 1); ok(ev.some(x=> x.type === 'arrow' && x.uid === t.uid) && ev.some(x=> x.type === 'skipTurn' && x.uid === t.uid && x.reason === 'pinned'), 'a Pinned unit still shoots its Arrow (a skill) but loses its swing'); }
{ const {e, P} = mk(); const t = put(e, P, 2, 'x-hitter', 0); t.pinDown = 1; ok(e.bolaPinnable(t) === false, 'not on a unit already Pinned');
  const w = put(e, P, 2, 'x-wall', 1); ok(e.bolaPinnable(w) === true, 'a fresh unit can be Pinned'); }
ok(/function stuckFast\(c\)\{ return !!\(c && \(c\.pinned \|\| c\.webbed > 0 \|\| c\.pinDown > 0/.test(eng), 'a Pinned unit can\'t move or be moved (stuckFast)');
{ const costs = JSON.parse(fs.readFileSync(path.join(ROOT, 'canonical', 'skill-costs.json'), 'utf8')); const SC = require(path.join(ROOT, 'tools', 'skill_costs.js')).make(costs);
  const row = costs.skills.find(r=> r.id === 'bola');
  ok(row && row.plus === 'arrow' && SC.skillCost('bola', 1) === SC.skillCost('arrow', 1) + 2 && SC.skillCost('bola', 2) === SC.skillCost('arrow', 2) + 2, `Bola N = Arrow N + 2 (Bola 1 ${SC.skillCost('bola', 1)}, Bola 2 ${SC.skillCost('bola', 2)})`);
  const ar = costs.skills.find(r=> r.id === 'anadromous'); // 2026-10-31 (package BUDGET2, item 4): at 3A + H the sea half (+1 Attack) is 3 points, the river half (+2 Health) 2; x the salt-water share
// of the road's fights (0.062): 2.06 -> 2.1
ok(ar && SC.skillCost('anadromous', true) === 2.1, 'Anadromous costs 2.1 (3 x 0.062 at sea + 2 x 0.938 off it, BUDGET2)'); }
{ const cards = JSON.parse(fs.readFileSync(path.join(ROOT, 'canonical', 'cards.json'), 'utf8'));
  ok(!cards.some(c=> c.effects && (c.effects.bola || c.effects.anadromous)), 'Bola and Anadromous are on no card yet (decision ENG14-4 / ENG14-5)'); }

// ---- X20 Anadromous -------------------------------------------------------------------------------------------------------------------
{ const {e, P} = mk({saltMap:true}); const s = put(e, P, 1, 'x-salmon', 0);
  ok(s.atk + (s.phaseAtk||0) === 3 && s.maxHp === 5, `on a sea map: +1 Attack (${s.atk}+${s.phaseAtk}/${s.maxHp})`); ok(/anadromousSea/.test(s._en5On || ''), 'its pip names the sea half'); }
{ const {e, P} = mk({}); const s = put(e, P, 1, 'x-salmon', 0);
  ok(s.atk + (s.phaseAtk||0) === 2 && s.maxHp === 7 && s.hp === 7, `off the sea: +2 Health (${s.atk}/${s.hp}/${s.maxHp})`); ok(/anadromousRiver/.test(s._en5On || ''), 'its pip names the river half'); }
{ const B = require(path.join(ROOT, 'tools', 'lib_bramble.js')), G = B.G;
  const bio = new Function(app.match(/const MAP_BIOME_OF = \{[^\n]*?\};/)[0] + '\nreturn MAP_BIOME_OF;')(), salt = (app.match(/const EN6_SALT_BIOMES = new Set\((\[[^\]]*\])\);/) || [])[1];
  const sea = Object.keys(bio).filter(k=> ['beach', 'reef'].includes(bio[k])); // (the tools' copy of fightRules lacks the EN6 biome sets, so the page's own tables are read)
  ok(salt === "['beach', 'reef']" && /if\(r\.saltMap == null && EN6_SALT_BIOMES\.has\(b\)\) r\.saltMap = true;/.test(app) && sea.includes('mb') && sea.includes('mk'), `the sea test is the salt-water maps (rules.saltMap: beach, reef biomes): ${sea.join(', ')}`);

  // ---- X6: 8-8 Pitch Black --------------------------------------------------------------------------------------------------------------
  const m4 = G.CONQUEST_MAPS.find(m=> m.id === 'm4'), n88 = m4.nodes.find(x=> x.key === '8-8');
  ok(G.fightRules('m4', n88).dark === 'pitch', `8-8 (${n88.name}) is Pitch Black: miss 1 in 2`);
  ok(G.fightRules('m4', m4.nodes.find(x=> x.key === '8-7')).dark === 'dark', 'the rest of Map 8 keeps the map\'s Darkness (1 in 4)');

  // ---- X25: elite +1 card ----------------------------------------------------------------------------------------------------------------
  const elite = m4.nodes.find(x=> x.kind === 'elite'), skirm = m4.nodes.find(x=> x.kind === 'skirmish');
  const setOf = node=>{ const s = {2: {hq: {}}}; G.applySkirmishSetup(s, node); return s[2]; };
  const boss = G.CONQUEST_MAPS.flatMap(m=> (m.nodes || []).filter(x=> x.kind === 'boss')).find(x=> x.deck);
  ok(setOf(elite).openingExtra === 1 && setOf(n88).openingExtra === 1 && !setOf(skirm).openingExtra && !(boss && setOf(boss).openingExtra), `elite-kind fights (elite; 8-8 is Map 8's mini-boss, its final elite) give the CPU openingExtra 1; skirmish and boss (${boss && boss.key}) fights none`);
  const ctx = G.referenceFightSetup('m4', elite); ok(ctx.setup.openingExtra === 1, 'the road sims (referenceFightSetup / playReferenceGame) get it too');
  ok(/if\(ctx\.setup\.openingExtra\) P\[2\]\.openingExtra = ctx\.setup\.openingExtra;/.test(app), 'playReferenceGame copies it onto the CPU'); }
{ const {e, P} = mk(); const pl = e.newPlayer(2, {'x-a': 10}, {id:'st-hq', health:50, effects:{}}); pl.openingExtra = 1; e.draw(pl, 3, 'B', {}, []);
  ok(pl.hand.length === 4, `an elite CPU's opening hand is 4 (${pl.hand.length})`); e.draw(pl, 1, 'B', {}, []); ok(pl.hand.length === 5, 'later draws are as before');
  const p2 = e.newPlayer(2, {'x-a': 10}, {id:'st-hq', health:50, effects:{}}); e.draw(p2, 3, 'B', {}, []); ok(p2.hand.length === 3, 'without it: 3'); }

// ---- X10 Mirage -------------------------------------------------------------------------------------------------------------------------
{ let both = 0, games = 0;
  for(let s = 1; s <= 12; s++){ const {e, P} = mk({mirage:true}, s); put(e, P, 1, 'x-wall', 0); put(e, P, 2, 'x-wall', 0); const ev = []; e.roundStart(P, 2, so, {}, ev);
    const t = ev.filter(x=> x.type === 'fieldTick' && x.field === 'mirage'); games++; if(t.some(x=> x.side === 'A' && x.illusionUid != null) && t.some(x=> x.side === 'B' && x.illusionUid != null)) both++; }
  ok(both === games, `every round both sides get an Illusion (${both}/${games} seeds)`); }
{ const {e, P} = mk({mirage:true}, 3); put(e, P, 2, 'x-wall', 0); const ev = []; e.roundStart(P, 2, so, {}, ev);
  const t = ev.filter(x=> x.type === 'fieldTick' && x.field === 'mirage'); ok(t.length === 1 && t[0].side === 'B', 'a side with no units gets none'); }
{ // a raid-style board: your front row and an ally's middle row (allyOf): one Illusion each, the ally's in its own row
  const e = E.makeSimEngine(defs, E.mulberry32(9), {recordEvents:true, battleMode:'open', reserveRows:2, reserveActs:true, rules:{mirage:true}});
  const P = {1: e.newPlayer(1, {}, {id:'st-hq', health:500, effects:{}}), 2: e.newPlayer(2, {}, {id:'st-hq', health:500, effects:{}})};
  put(e, P, 1, 'x-wall', 0); const a = e.fillReserve(P[1], 1, 0, 'x-wall'); a.allyOf = 'Ally'; a.allyRow = 1; a.holdRow = true; put(e, P, 2, 'x-wall', 0);
  const ev = []; e.roundStart(P, 2, so, {}, ev); const t = ev.filter(x=> x.type === 'fieldTick' && x.field === 'mirage' && x.illusionUid != null);
  ok(t.filter(x=> x.side === 'A').length === 2 && t.filter(x=> x.side === 'B').length === 1, `multiplayer: you and your ally each get one, the enemy one (${t.map(x=> x.side + (x.row || 0)).join(',')})`);
  const ill = Object.values(P[1].reserve[0]).find(c=> c && c.uid !== a.uid); ok(!!ill && ill.allyOf === 'Ally', "the ally's Illusion is in the ally's row and is the ally's"); }
ok(e14key('ui.fx-mirage', /each player/), 'the Mirage field text says each player');
function e14key(k, re){ const T = require(path.join(ROOT, 'bramblewood-texts.js')).TEXT; return re.test(T[k] || ''); }

// ---- X8 CPU allies' leaders -------------------------------------------------------------------------------------------------------------
{ const C = require(path.join(ROOT, 'bramblewood-coop.js')); const d = H.loadCardDefs(); const leader = Object.keys(d).find(id=> d[id].rarity === 'heroic' && !d[id].token);
  const deck = {}; Object.keys(d).filter(id=> !d[id].token && d[id].rarity === 'common').slice(0, 5).forEach(id=> deck[id] = 4);
  const T = C.createTable({makeSimEngine: E.makeSimEngine, defs: d, seed: 7, typeId: 'hollow', floorIdx: 0, seats: [{name: 'Me', deck, leader}, {cpu: true}], recordEvents: false});
  ok(T.seats[1].cpu && T.seats[1].leader === leader && T.leaderUids[1] != null, `a group dungeon's CPU seat opens with its deck's leader (${T.seats[1].leader})`);
  ok(/function raidAllyLeaderOf\(a\)/.test(app) && /const id = raidAllyLeaderOf\(a\); if\(!id\) return; const c = E\.fillReserve/.test(app), "a raid's CPU allies already open with a leader (raidAllyLeaderOf)"); }

// ---- X24 the CPU's save plan ------------------------------------------------------------------------------------------------------------
{ const p = (E.makeSimEngine(defs, E.mulberry32(1), {aiAim:true}).AI_PLAN)(); ok(p.reach === 3 && p.turns === 2, `the plan: in reach of 3 pitches, at most ${p.turns} turns held back`); }
function cpuTurn(hand, lumber, opts){ const {e, P} = mk({}, 11, {aiAim:true, aiLevel:1}); const ai = P[2];
  ai.deck = ['x-free', 'x-free', 'x-free', 'x-free']; ai.hand = hand.map((id, i)=> ({defId:id, uid:'h' + i})); ai.lumber = lumber; ai.deckCounts = {'x-small': 10, 'x-big': 2};
  if(opts && opts.losing) ai.hq.hp = 100; const ev = []; e.aiTakeTurn(P, so, 2, {}, ev); return {ev, ai}; }
{ const {ev, ai} = cpuTurn(['x-big', 'x-small', 'x-free'], 1);
  ok(!ev.some(x=> x.type === 'play' && x.defId === 'x-small') && ai.hand.some(h=> h.defId === 'x-big') && ai._aiSave && ai._aiSave.uid === 'h0', 'with a big card 2 short it keeps its Lumber: no Lumber-paying play, it saves (and pitches) for the big card'); }
{ const {ev} = cpuTurn(['x-big', 'x-small', 'x-free'], 1, {losing:true});
  ok(ev.some(x=> x.type === 'play' && x.defId === 'x-small'), 'losing badly (bramble under 40%): it plays as before'); }
{ const {ev} = cpuTurn(['x-big', 'x-free'], 2);
  ok(ev.some(x=> x.type === 'discard' && x.defId === 'x-free') && ev.some(x=> x.type === 'play' && x.defId === 'x-big'), 'one short with only a free card beside it: it pitches that card and plays the big one now'); }

// ---- the texts ---------------------------------------------------------------------------------------------------------------------------
{ const T = require(path.join(ROOT, 'bramblewood-texts.js')).TEXT; const keys = ['ui.skn-e14-bola', 'ui.e14-sk-bola', 'ui.e14-sk-bola-codex', 'ui.e14-stn-pinned', 'ui.e14-ls-pinned', 'ui.e14-log-pinned', 'ui.e14-log-pinned-skip', 'ui.e14-log-pinned-end', 'ui.skn-e14-anadromous', 'ui.e14-sk-anadromous', 'ui.e14-sk-anadromous-codex', 'ui.fx-mirage'];
  ok(keys.every(k=> T[k]), 'the ENG14 TX keys exist');
  ['fr', 'de', 'es', 'it', 'pt', 'tl', 'ta', 'id', 'zh-Hans', 'zh-Hant', 'ja', 'ko'].forEach(c=>{ const pk = JSON.parse(fs.readFileSync(path.join(ROOT, 'lang', c + '.json'), 'utf8'));
    ok(keys.every(k=> pk[T[k]]), `lang/${c}.json has the ENG14 rows`); });
  ok(app.includes("{key:'bola', category:'evergreen'") && app.includes("{key:'anadromous', category:'passive'") && app.includes("Object.assign(SKILL_ICON, {bola:'🪀', anadromous:'🐟', pinDown:'📌'})"), 'arena_app.js: the skill rows, icons, the 📌 status');
  const cat = fs.readFileSync(path.join(ROOT, 'docs', 'effects-catalogue.md'), 'utf8'); ok(/Bola N/.test(cat) && /Anadromous/.test(cat) && /ENG14/.test(cat), 'docs/effects-catalogue.md describes them'); }

console.log(`\n${n - fail}/${n} passed`); process.exit(fail ? 1 : 0);
