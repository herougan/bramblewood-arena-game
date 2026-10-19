#!/usr/bin/env node
// 2026-10-19 (package RB, owner 12:23: "Raid: Allies are still playing cards in the front column."): each side's player owns a row (you
// the front; ally 1 the middle, ally 2 the back, as the VS screen shows). An ally's play always went into its own row (RaidM.allySlot),
// but the unit then stepped up into your front row (or the back ally's into the middle) at the next round start (engine
// advanceReserves) whenever the slot ahead was clear. Now every ally unit (its plays and its leader) holds its row (holdRow).
// This test plays the page's own raid fight (tools/raid_full_sim.js's build: buildRaidFullFight, raidAlliesTurn, the boss's plays,
// the engine's round start and combat) with seeded fights until 200+ ally plays have gone down, and checks after every step that
// no ally unit stands outside its ally's row; and the raid model's own rules (the ally play rule's source, no spill).
'use strict';
const fs = require('fs'), path = require('path');
const ROOT = path.join(__dirname, '..');
const sim = require(path.join(ROOT, 'tools', 'raid_full_sim.js')), A = sim.A;
const B = require(path.join(ROOT, 'tools', 'lib_bramble.js')), {CARD_DEFS_BASELINE, CHARACTER_DEFS, G} = B;
const RaidM = require(path.join(ROOT, 'bramblewood-raid.js'));
const src = fs.readFileSync(path.join(ROOT, 'arena_app.js'), 'utf8'), eng = fs.readFileSync(path.join(ROOT, 'bramblewood-engine.js'), 'utf8');
const goliath = JSON.parse(fs.readFileSync(path.join(ROOT, 'canonical', 'raids.json'), 'utf8'))[0];
let pass = 0, fail = 0; const ok = (c, m)=>{ if(c) pass++; else { fail++; console.log('  FAIL ' + m); } };

// ---- the code: the plays go into the ally's own row, and its units hold it
ok(/if\(c\.holdRow\) return;/.test(eng), 'engine advanceReserves: a holdRow unit never steps up');
ok(/placed\.allyOf = a\.name; placed\.allyRow = a\.row; placed\.holdRow = true;/.test(src), 'raidAllyPlays: an ally\'s play holds its row');
ok(/c\.allyOf = a\.name; c\.allyRow = a\.row; c\.holdRow = true; c\.isLeader = true;/.test(src), 'an ally\'s leader holds its row');
ok(/RaidM\.allySlot\(E, pl, a\.row\)/.test(B.grab('raidAllyPlays')) && /if\(m\.raidFull\) return 'own';/.test(src), 'the ally plays into its own row only (allySlot); raids never spill (play rows: own)');

// ---- 200+ seeded ally plays in the page's raid fight
function where(P, c){ // 0 front, 1 middle, 2 back, or -1
  if(A && P[1].row && ['left', 'center', 'right'].some(k=> (P[1].row[k] || []).includes(c))) return 0;
  for(let r = 0; r < (P[1].reserve || []).length; r++) if(Object.values(P[1].reserve[r]).includes(c)) return r + 1;
  return -1;
}
let plays = 0, checks = 0, bad = [], fights = 0, front = 0;
const parts = ['left', 'right', 'tail', 'core'];
for(let g = 0; plays < 200 && g < 40; g++){
  const partId = parts[g % parts.length], saveRandom = Math.random; Math.random = A.seededRng((0xA11E + g * 131) >>> 0);
  try{
    const def = JSON.parse(JSON.stringify(goliath)), st = RaidM.raidState(def, [], 0, {cycle: 0}), f = RaidM.fightFor(def, st, partId, {});
    const decks = def.allyDecks.filter(d=> Object.keys(d.deck).every(id=> CARD_DEFS_BASELINE[id]));
    const allies = [0, 1].map(i=> A.raidAllyOf({name: decks[(g + i * 3) % decks.length].name, deck: decks[(g + i * 3) % decks.length].deck}, i));
    const b = A.buildRaidFullFight(def, partId, f, st, {rng: A.seededRng((0x5A1D + g * 977) >>> 0), allies, myCastle: Object.assign({}, CHARACTER_DEFS.castle), myDeck: G.WINRATE_REF_DECKS.road['13'], recordEvents: false, rand: Math.random});
    const saved = {}; Object.keys(b.overlay).forEach(id=>{ saved[id] = CARD_DEFS_BASELINE[id]; CARD_DEFS_BASELINE[id] = b.overlay[id]; });
    const {engine: En, players: P, sideOf} = b;
    const m = {raidDef: def, engine: En, players: P, sideOf, stats: b.stats, round: 1, raidFull: true, over: false, raidAllies: allies, raidAttacks: b.cfg.attacks || [], raidPending: {},
      raidCommonPool: b.commonPool, raidBossUnitId: b.bossUnitId, raidBossHpBonus: b.bossHpBonus, raidBossRowDecks: b.rowDecks, raidSeed: (0xBEEF + g * 7919) >>> 0};
    const allyCards = new Map(); // card -> its ally's row
    const scan = ()=>{ checks++;
      En.allBoardCards(P[1]).forEach(c=>{ if(c.allyOf || allyCards.has(c)){ front++; bad.push(`fight ${g} r${m.round}: ${c.defId} (${c.allyOf}) in your front row`); } });
      (P[1].reserve || []).forEach((row, r)=> Object.values(row).forEach(c=>{ if(!c || !c.allyOf) return; if(!allyCards.has(c)) allyCards.set(c, c.allyRow); const want = allyCards.get(c);
        if(want !== r + 1) bad.push(`fight ${g} r${m.round}: ${c.defId} (${c.allyOf}, row ${want}) in row ${r + 1}`); })); };
    const countPlays = ()=> allies.reduce((t, a)=> t + a.played, 0);
    const before = countPlays();
    scan(); A.raidAlliesTurn(m, [], true); scan();
    for(let r = 1; r <= 20; r++){
      m.round = r;
      if(r > 1){ const ev = []; En.roundStart(P, r, sideOf, b.stats, ev); scan(); A.raidSpecials(m, ev); A.raidAlliesTurn(m, ev); scan(); A.raidBossUnit(m, ev); A.raidBossCommons(m, ev);
        En.draw(P[1], 1, 'A', b.stats, null); En.draw(P[2], 1, 'B', b.stats, null); if(P[1].hq.hp <= 0 || P[2].hq.hp <= 0) break; }
      [1, 2].forEach(p=>{ P[p].playedThisTurn = false; P[p].discardUsedThisTurn = false; });
      En.setAiLevel(1); En.aiTakeTurn(P, sideOf, 1, b.stats, null); En.aiTakeTurn(P, sideOf, 2, b.stats, null); A.raidBossRowPlays(m, null); scan();
      const over = En.resolveCombat(P, sideOf, b.stats, null, r % 2 === 0 ? 1 : 2); scan();
      if(over || P[1].hq.hp <= 0 || P[2].hq.hp <= 0) break;
    }
    plays += countPlays() - before; fights++;
    Object.keys(saved).forEach(id=>{ if(saved[id] === undefined) delete CARD_DEFS_BASELINE[id]; else CARD_DEFS_BASELINE[id] = saved[id]; });
  } finally { Math.random = saveRandom; }
}
console.log(`  ${plays} ally plays over ${fights} seeded raid fights, ${checks} board checks`);
ok(plays >= 200, `200+ seeded ally plays (${plays})`);
ok(!bad.length, `no ally unit outside its ally's row (${bad.length}: ${bad.slice(0, 4).join('; ')})`);
ok(front === 0, `no ally unit ever in your front row (${front})`);
// your own cards never go into the allies' rows either
ok(/if\(m\.raidFull && popts && popts\.reserve\) return false;/.test(src) || /matchPlayRows\(m\) === 'own' && popts && popts\.reserve/.test(src), 'you play only into your own (front) row');
console.log(`raid-ally-rows: ${pass} passed, ${fail} failed`);
process.exit(fail ? 1 : 0);
