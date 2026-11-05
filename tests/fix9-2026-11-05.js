#!/usr/bin/env node
// Package FIX9 (2026-11-05, owner notes 22:18):
//   1. generic titles: a tab that stands for a group says the group's name ("Dailies", "Raids"); a member's own name only when it is alone;
//   2. raid CPU allies keep playing: a full row swaps its weakest unit for a better card from its next 3, and a spent deck is shuffled again
//      (shown on seeded Goliath fights, the page's own raid functions through tools/raid_full_sim.js);
//   3. Pounce: a unit an arrival wounds or kills shows its Health from before the blow until the blow lands (holdArrivalDead's copies);
//   4. water pips (💧N) and their floats only while Shift is held;
//   5. Shell N: each round the first hit gives N Armor until the round ends; nothing else.
//
//   node tests/fix9-2026-11-05.js
'use strict';
const fs = require('fs'), path = require('path');
const H = require('./lib/harness.js');
const ROOT = H.ROOT, E = H.Engine;
const src = fs.readFileSync(path.join(ROOT, 'arena_app.js'), 'utf8'), tpl = fs.readFileSync(path.join(ROOT, 'arena_template.html'), 'utf8');
const texts = fs.readFileSync(path.join(ROOT, 'bramblewood-texts.js'), 'utf8');
const B = require(path.join(ROOT, 'tools', 'lib_bramble.js'));
let fail = 0, pass = 0; const ok = (c, m)=>{ if(c) pass++; else { fail++; console.log('  ✗ ' + m); } };
const so = id=> id === 1 ? 'A' : 'B';

// ---- 5. Shell (engine)
{
  const defs = Object.assign({}, H.loadCardDefs(), {
    'f9-shell': {id:'f9-shell', name:'Shell', attack:2, health:40, wait:0, cost:0, effects:{shell:2}},
    'f9-hit':   {id:'f9-hit', name:'Hit', attack:5, health:60, wait:0, cost:0, effects:{}},
  });
  const mk = ()=>{ const e = E.makeSimEngine(defs, E.mulberry32(9), {recordEvents:true, battleMode:'open'}); return {e, P:{1: e.newPlayer(1, {}), 2: e.newPlayer(2, {})}}; };
  const all = pl=> [...pl.row.left, ...pl.row.center, ...pl.row.right];
  // two hits on one Shell unit in a round (the hitter has a Fast Forward turn): the first lands in full and raises the shell, the second loses 2 to it
  const {e, P} = mk(); e.debugSpawnCard(P, so, 1, 'f9-shell', 'center', {}, []); e.debugSpawnCard(P, so, 2, 'f9-hit', 'center', {}, []);
  const S = all(P[1])[0], Hh = all(P[2])[0], hq2 = P[2].hq.hp; const ev = []; Hh.ffCounters = 1;
  const hp0 = S.hp; e.resolveCombat(P, so, {}, ev, 2);
  const hits = ev.filter(x=> x.type === 'hit' && x.targetUid === S.uid);
  const ups = ev.filter(x=> x.type === 'statusFx' && x.kind === 'shellUp' && x.targetUid === S.uid);
  ok(ups.length === 1 && ups[0].amount === 2, `round 1: Shell goes up once, Armor 2 (${ups.length} shellUp, amount ${ups[0] && ups[0].amount})`);
  ok(hits.length >= 2 && hits[0].dmg === 5 && hits[1].dmg === 3, `round 1: the first hit lands in full (${hits[0] && hits[0].dmg}), the next loses 2 to the Armor (${hits[1] && hits[1].dmg})`);
  ok(!(S.tempHp > 0) && !ev.some(x=> x.type === 'tempSoak' && x.uid === S.uid), 'no temporary Health');
  ok(P[2].hq.hp < hq2 || ev.some(x=> x.type === 'hit' && x.attUid === S.uid), 'the shelled unit still attacks');
  ok(S.shellUntil == null && S.shellArmor === 0 && ev.some(x=> x.type === 'statusFx' && x.kind === 'shellDown'), 'the Armor goes at the round\'s end');
  ok(hp0 - S.hp === 8, `round 1 Health lost: 5 + 3 (${hp0 - S.hp})`);
  const ev2 = []; const hp1 = S.hp; Hh.ffCounters = 1; e.resolveCombat(P, so, {}, ev2, 2);
  const h2 = ev2.filter(x=> x.type === 'hit' && x.targetUid === S.uid);
  ok(ev2.filter(x=> x.type === 'statusFx' && x.kind === 'shellUp').length === 1 && h2[0] && h2[0].dmg === 5 && h2[1] && h2[1].dmg === 3, 'round 2: up again at the first hit, the same split');
  ok(hp1 - S.hp === 8, `round 2 Health lost: 8 (${hp1 - S.hp})`);
  // a hit between rounds raises it for the coming round, then it goes
  const {e: e2, P: P2} = mk(); e2.debugSpawnCard(P2, so, 1, 'f9-shell', 'center', {}, []); const S2 = all(P2[1])[0];
  e2.damageCardFlat(S2, 1, 'physical', 'f9-hit'); ok(S2.shellArmor === 2 && !(S2.tempHp > 0), 'a play-phase hit: Armor 2 for the coming round, no temporary Health');
  e2.resolveCombat(P2, so, {}, [], 1); ok(S2.shellArmor === 0 && S2.shellUntil == null, '... gone after the coming round');
  ok(/"ui\.sk-shell": "Each round, when first hit: \+\{n\} Armor until the round ends\."/.test(texts), 'the skill text says the new rule');
  const pks = ['de', 'es', 'fr', 'id', 'it', 'ja', 'ko', 'pt', 'ta', 'tl', 'zh-Hans', 'zh-Hant'].map(c=> JSON.parse(fs.readFileSync(path.join(ROOT, 'lang', c + '.json'), 'utf8')));
  ['Each round, when first hit: +{n} Armor until the round ends.', 'Shell: +{n} Armor until this round ends', 'went into its shell (+{n} Armor) 🐚'].forEach(k=> ok(pks.every(p=> p[k]), `12 packs translate "${k}"`));
}

// ---- 1. generic titles
{
  const fn = new Function('unlockedDailyDungeons', 'dailyDungeonsOpen', 'DAILY_DUNGEONS', 'groupDungeonCardHTML', 'TX', B.grab('fix9DungeonMembers') + '\n' + B.grab('dungeonTabLabel') + '\nreturn dungeonTabLabel;');
  const TX = k=> k === 'ui.ui6-dailies' ? 'Dailies' : k;
  const one = [{name: 'Murgle Mayhem'}];
  ok(fn(()=> one, ()=> true, [{}, {}, {}], ()=> '<div>', TX)() === 'Dailies', 'one unlocked daily dungeon among several slots: the tab says Dailies (was Murgle Mayhem)');
  ok(fn(()=> one, ()=> true, [{}], ()=> '', TX)() === 'Murgle Mayhem', 'the only member of the group: its own name');
  ok(fn(()=> [], ()=> false, [{}, {}], ()=> '<div>', TX)() === 'Dailies', 'none unlocked: Dailies');
  const raid = new Function('liveRaidDefs', B.grab('raidTabLabel') + '\nreturn raidTabLabel;');
  ok(raid(()=> [{name: 'Goliath'}, {name: 'Hydra'}])() === 'Raids' && raid(()=> [{name: 'Goliath'}])() === 'Goliath', 'raids: Raids for two or more, the raid\'s name alone');
}

// ---- 3. Pounce: the held / shown copies
{
  const body = [B.grab('boardPosSnapshot'), B.grab('fix9ArrivalShown'), B.grab('holdArrivalDead'), B.grab('arrivalHoldRows'), 'return {boardPosSnapshot, holdArrivalDead, arrivalHoldRows};'].join('\n');
  const F = new Function('fightSafe', 'getCardDefs', body)((f)=>{ try{ return f(); }catch(e){ console.log(e); } }, ()=> ({x: {health: 6, attack: 1}}));
  const killed = {uid: 7, defId: 'x', hp: 6, maxHp: 6, slot: 0}, hurt = {uid: 8, defId: 'x', hp: 6, maxHp: 6, slot: 1};
  const m = {players: {1: {id: 1, row: {left: [], center: [killed, hurt], right: []}}, 2: {id: 2, row: {left: [], center: [], right: []}}}};
  const pre = F.boardPosSnapshot(m);
  // the enemy's Pounce: 6 on one (it dies, the engine drops it), 3 on the other
  killed.hp = 0; hurt.hp = 3; m.players[1].row.center = [hurt];
  const evs = [{type: 'pounce'}, {type: 'hit', targetUid: 7, dmg: 6}, {type: 'death', uid: 7}, {type: 'hit', targetUid: 8, dmg: 3}];
  F.holdArrivalDead(m, pre, evs, evs);
  const h = m._arrivalHold && m._arrivalHold.get('7');
  ok(h && h.card.hp === 6 && h.card !== killed, `the unit the Pounce kills is held at its Health before the blow (${h && h.card.hp}; was 0)`);
  const s = m._arrivalShown && m._arrivalShown.get('8');
  ok(s && s.hp === 6 && hurt.hp === 3, `the unit the Pounce wounds shows 6 until the blow lands (${s && s.hp}); the engine's is 3`);
  const rows = F.arrivalHoldRows(m, m.players[1], false);
  ok(rows.center.some(c=> c.uid === 8 && c.hp === 6) && rows.center.some(c=> c.uid === 7 && c.hp === 6) && m.players[1].row.center[0] === hurt, 'the board draws both at 6; the engine\'s rows are untouched');
  ok(/FIX9 \(2026-11-05\): a unit an arrival wounds \(m\._arrivalShown\) takes the blow as it lands/.test(src) && /m\._arrivalShown = null \/\* FIX9 \*\//.test(src), 'the blow takes its damage at impact; the copies clear when the arrival has played');
  ok(/if\(!m\.replayRows && \(m\._arrivalShown \|\| m\._arrivalHold\)\)/.test(B.grab('currentCardByUid')), 'currentCardByUid reads the shown copy while the arrival waits');
}

// ---- 4. water pips on Shift
ok(/html:not\(\.fix9-show-wet\) \.abadge\.en20-water\{display:none !important;\}/.test(tpl), 'CSS: the 💧N pips hide unless .fix9-show-wet');
{ const i = src.indexOf('(function fix9WetShift(){'), blk = i >= 0 ? src.slice(i, i + 600) : '';
  ok(/classList\.toggle\('fix9-show-wet', !!on\)/.test(blk) && /keydown', e=>\{ if\(e\.key === 'Shift'\) set\(true\); \}/.test(blk) && /keyup', e=>\{ if\(e\.key === 'Shift'\) set\(false\); \}/.test(blk) && /'blur', \(\)=> set\(false\)/.test(blk),
    'Shift held puts .fix9-show-wet on <html>; released (or the window losing focus) takes it off'); }
ok(/if\(el && fix9WetShown\(\)\) floatText\(el, '💧\+'/.test(src) && /if\(el && fix9WetShown\(\)\) floatText\(el, '💧−'/.test(src), 'the 💧± floats only while Shift is held');

// ---- 2. raid allies keep playing (seeded Goliath fights)
{
  const sim = require(path.join(ROOT, 'tools', 'raid_full_sim.js')), A = sim.A;
  const {CARD_DEFS_BASELINE, CHARACTER_DEFS, G} = B;
  const RaidM = require(path.join(ROOT, 'bramblewood-raid.js'));
  const goliath = JSON.parse(fs.readFileSync(path.join(ROOT, 'canonical', 'raids.json'), 'utf8'))[0];
  const parts = ['left', 'right', 'tail', 'core'];
  let late = 0, lateTurns = 0, swaps = 0, cycles = 0, leaderGone = 0, fights = 0, rounds = 0;
  for(let g = 0; g < 8; g++){
    const partId = parts[g % parts.length], saveRandom = Math.random; Math.random = A.seededRng((0xF19 + g * 131) >>> 0);
    try{
      const def = JSON.parse(JSON.stringify(goliath)), st = RaidM.raidState(def, [], 0, {cycle: 0}), f = RaidM.fightFor(def, st, partId, {});
      const decks = def.allyDecks.filter(d=> Object.keys(d.deck).every(id=> CARD_DEFS_BASELINE[id]));
      const allies = [0, 1].map(i=> A.raidAllyOf({name: decks[(g + i * 3) % decks.length].name, deck: decks[(g + i * 3) % decks.length].deck}, i));
      const b = A.buildRaidFullFight(def, partId, f, st, {rng: A.seededRng((0x5A1D + g * 977) >>> 0), allies, myCastle: Object.assign({}, CHARACTER_DEFS.castle), myDeck: G.WINRATE_REF_DECKS.road['13'], recordEvents: false, rand: Math.random});
      const saved = {}; Object.keys(b.overlay).forEach(id=>{ saved[id] = CARD_DEFS_BASELINE[id]; CARD_DEFS_BASELINE[id] = b.overlay[id]; });
      const {engine: En, players: P, sideOf} = b;
      // a leader in each ally's row centre, as the page does (raidAllyLeaderOf)
      allies.forEach(a=>{ const id = a.deck.splice(0, 1)[0]; const c = id ? En.fillReserve(P[1], a.row, 0, id) : null; if(c){ c.allyOf = a.name; c.allyRow = a.row; c.holdRow = true; c.isLeader = true; a.leaderUid = c.uid; } });
      const m = {raidDef: def, engine: En, players: P, sideOf, stats: b.stats, round: 1, raidFull: true, over: false, raidAllies: allies, raidAttacks: b.cfg.attacks || [], raidPending: {},
        raidCommonPool: b.commonPool, raidBossUnitId: b.bossUnitId, raidBossHpBonus: b.bossHpBonus, raidBossRowDecks: b.rowDecks, raidSeed: (0xBEEF + g * 7919) >>> 0};
      A.raidAlliesTurn(m, [], true);
      for(let r = 1; r <= 20; r++){
        m.round = r;
        if(r > 1){ const ev = []; En.roundStart(P, r, sideOf, b.stats, ev); A.raidSpecials(m, ev);
          const before = allies.map(a=> a.played + a.deck.length * (a.cycles || 0)); allies.forEach(a=>{ a.lastSwap = null; }); A.raidAlliesTurn(m, ev);
          allies.forEach(a=>{ if(a.lastSwap && a.lastSwap.uid === a.leaderUid) leaderGone++; });
          if(r > 15){ allies.forEach((a, i)=>{ lateTurns++; if(a.played + a.deck.length * (a.cycles || 0) > before[i]) late++; }); }
          A.raidBossUnit(m, ev); A.raidBossCommons(m, ev);
          En.draw(P[1], 1, 'A', b.stats, null); En.draw(P[2], 1, 'B', b.stats, null); if(P[1].hq.hp <= 0 || P[2].hq.hp <= 0) break; }
        [1, 2].forEach(p=>{ P[p].playedThisTurn = false; P[p].discardUsedThisTurn = false; });
        En.setAiLevel(1); En.aiTakeTurn(P, sideOf, 1, b.stats, null); En.aiTakeTurn(P, sideOf, 2, b.stats, null); A.raidBossRowPlays(m, null);
        rounds++; const over = En.resolveCombat(P, sideOf, b.stats, null, r % 2 === 0 ? 1 : 2);
        if(over || P[1].hq.hp <= 0 || P[2].hq.hp <= 0) break;
      }
      allies.forEach(a=>{ swaps += a.swaps || 0; cycles += a.cycles || 0; });
      fights++;
      Object.keys(saved).forEach(id=>{ if(saved[id] === undefined) delete CARD_DEFS_BASELINE[id]; else CARD_DEFS_BASELINE[id] = saved[id]; });
    } finally { Math.random = saveRandom; }
  }
  console.log(`  raid allies: ${fights} seeded Goliath fights, ${rounds} rounds; rounds 16-20: ${late} of ${lateTurns} ally turns played a card; ${swaps} swaps, ${cycles} reshuffles`);
  ok(fights === 8 && lateTurns > 0, 'the seeded fights ran');
  ok(swaps > 0, `a full row swaps its weakest unit for a better card (${swaps})`);
  ok(late / Math.max(1, lateTurns) >= 0.5, `late in the fight (rounds 16-20) the allies still play most turns (${late}/${lateTurns}; before FIX9 about 4 in 10)`);
  ok(leaderGone === 0, `an ally's leader is never swapped out (${leaderGone})`);
  // the reshuffle, alone: an ally whose deck is spent plays its first card again
  const a = {name: 'T', row: 1, deck: ['x1', 'x2'], played: 2};
  const fn = new Function('RaidM', 'getCardDefs', 'reserveSlotPut', 'renderBoard', 'pushLog', 'allyPlayFx', B.grab('raidAllyPlays') + '\nreturn raidAllyPlays;')(
    {allySlot: ()=> 0}, ()=> ({x1: {attack: 1, health: 1}, x2: {attack: 1, health: 1}}), ()=> true, ()=>{}, ()=>{}, ()=>{});
  const placed = [];
  fn({players: {1: {reserve: [{}]}}, engine: {fillReserve: (pl, r, sl, id)=>{ placed.push(id); return {uid: 1, defId: id}; }}}, a, []);
  ok(placed.length === 1 && a.cycles === 1 && a.played === 1, `a spent deck is shuffled again and the ally plays (${placed.join()}, cycles ${a.cycles})`);
}

console.log(`fix9-2026-11-05: ${pass} passed, ${fail} failed`);
process.exit(fail ? 1 : 0);
