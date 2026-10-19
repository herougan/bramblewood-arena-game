#!/usr/bin/env node
// 2026-10-19 (package RV2, owner 08:42 / 08:46): the raid round resolved strictly in order (each strike re-picks its target from the
// board the strikes before it left) and played back as real attacks RAID_COLUMN_STAGGER_MS apart; the raid's middle and back rows
// 15% larger; the HP-scaled elders (100 Health fresh, down to their basic Health); the boss playing 3 cards a turn; an ally's play
// drawn into its slot alone (no full board render); the raid fight's rank multiplying its damage (and its emblem for a win); the
// Competent (10,000) and Leading (50,000) participants; the TX keys in all 12 packs.
'use strict';
const fs = require('fs'), path = require('path');
const H = require('./lib/harness.js');
const E = H.Engine;
const B = require('../tools/lib_bramble.js');
const RaidM = require('../bramblewood-raid.js');
let fail = 0; const ok = (c, m)=>{ if(!c){ fail++; console.log('  ✗', m); } };
const so = id=> id===1 ? 'A' : 'B';
const U = (id, effects, o)=> Object.assign({id, name:id, attack:4, health:500, wait:0, cost:0, effects: effects || {}}, o || {});
const defs = Object.assign({}, H.loadCardDefs(), {
  'rv-hit': U('rv-hit', {}, {attack:4}), 'rv-wall': U('rv-wall', {}, {attack:0}), 'rv-frail': U('rv-frail', {}, {attack:0, health:1}), 'rv-killer': U('rv-killer', {}, {attack:600}),
});
const all = pl=> [...pl.row.left, ...pl.row.center, ...pl.row.right];
function mk(){ const e = E.makeSimEngine(defs, E.mulberry32(5), {recordEvents:true, battleMode:'open', reserveRows:2, reserveActs:true});
  return {e, P:{1:e.newPlayer(1, {}, {health:200}), 2:e.newPlayer(2, {}, {health:200})}}; }
function put(e, P, pid, id, slot){ e.debugSpawnCard(P, so, pid, id, 'left', {}, []);
  const pl = P[pid], c = all(pl).reduce((a, x)=> (!a || x.uid > a.uid) ? x : a, null); c.slot = slot;
  const cs = all(pl); pl.row.center = cs.filter(x=> x.slot === 0); pl.row.left = cs.filter(x=> x.slot < 0).sort((a, b)=> b.slot - a.slot); pl.row.right = cs.filter(x=> x.slot > 0).sort((a, b)=> a.slot - b.slot);
  e.syncSlots(pl); return c; }
const src = fs.readFileSync(path.join(__dirname, '..', 'arena_app.js'), 'utf8');
const tpl = fs.readFileSync(path.join(__dirname, '..', 'arena_template.html'), 'utf8');
const fxf = fs.readFileSync(path.join(__dirname, '..', 'bramblewood-fx-f.js'), 'utf8');
const raids = JSON.parse(fs.readFileSync(path.join(__dirname, '..', 'canonical', 'raids.json'), 'utf8')), goliath = raids[0];
const texts = require('../bramblewood-texts.js');
const idx = (ev, f)=> ev.findIndex(f);

// ======================= 1. the engine: strictly in order, each strike sees the board the strikes before it left =======================
// a front swing kills the boss's front unit in column 0; your middle-row unit there then strikes the boss's middle row, not the dead front
{ const {e, P} = mk(); const k = put(e, P, 1, 'rv-killer', 0), mid = e.fillReserve(P[1], 1, 0, 'rv-hit');
  const fr = put(e, P, 2, 'rv-frail', 0), wall = e.fillReserve(P[2], 1, 0, 'rv-wall'); const ev = []; e.resolveCombat(P, so, {}, ev, 1);
  const iHit = idx(ev, x=> x.type === 'hit' && x.attUid === k.uid && x.targetUid === fr.uid), iDeath = idx(ev, x=> x.type === 'death' && x.uid === fr.uid), iVol = idx(ev, x=> x.field === 'volleyHit' && x.fromUid === mid.uid);
  ok(fr.hp <= 0 && wall.hp === 498, `the front kill lands first; the middle row's strike goes to the next unit in the column (front ${fr.hp}, middle ${wall.hp})`);
  ok(iHit >= 0 && iHit < iDeath && iDeath < iVol && ev[iVol].targetRow === 1 && ev[iVol].uid === wall.uid, `events in order: the swing, its death, then the strike at the middle row (${iHit} < ${iDeath} < ${iVol})`); }
// a middle-row strike kills the boss's middle unit; your back row's strike in that column then goes on to its back row
{ const {e, P} = mk(); put(e, P, 1, 'rv-wall', 1); const m1 = e.fillReserve(P[1], 1, 0, 'rv-hit'), b1 = e.fillReserve(P[1], 2, 0, 'rv-hit');
  put(e, P, 2, 'rv-wall', 1); const fr = e.fillReserve(P[2], 1, 0, 'rv-frail'), back = e.fillReserve(P[2], 2, 0, 'rv-wall'), h = P[2].hq.hp;
  const ev = []; e.resolveCombat(P, so, {}, ev, 1);
  const a = idx(ev, x=> x.field === 'volleyHit' && x.fromUid === m1.uid), d = idx(ev, x=> x.type === 'death' && x.uid === fr.uid && x.reserve), c = idx(ev, x=> x.field === 'volleyHit' && x.fromUid === b1.uid);
  ok(fr.hp <= 0 && back.hp === 498 && P[2].hq.hp === h, `after the middle unit falls, the back-row strike finds the boss's back row (${back.hp}), not the bramble (-${h - P[2].hq.hp})`);
  ok(a >= 0 && a < d && d < c && ev[c].targetRow === 2, `the middle strike, the death, then the back strike at row 2 (${a} < ${d} < ${c})`); }
// the boss's side reacts the same way: its front kill on your front unit sends its middle row's strike to your middle row
{ const {e, P} = mk(); const myF = put(e, P, 1, 'rv-frail', 0), myM = e.fillReserve(P[1], 1, 0, 'rv-wall'); put(e, P, 2, 'rv-killer', 0); e.fillReserve(P[2], 1, 0, 'rv-hit');
  e.resolveCombat(P, so, {}, [], 2); ok(myF.hp <= 0 && myM.hp === 498, `the boss's rows: front kill, then its middle strike at your middle row (${myM.hp})`); }
// column by column: column -1's strikes all come before column 0's, and in a column the front row before the middle before the back
{ const {e, P} = mk(); const f0 = put(e, P, 1, 'rv-hit', 0), fm = put(e, P, 1, 'rv-hit', -1), r0 = e.fillReserve(P[1], 1, -1, 'rv-hit'), r2 = e.fillReserve(P[1], 2, -1, 'rv-hit');
  put(e, P, 2, 'rv-wall', 0); put(e, P, 2, 'rv-wall', -1); const ev = []; e.resolveCombat(P, so, {}, ev, 1);
  const at = u=> idx(ev, x=> (x.type === 'hit' && x.attUid === u) || (x.fromUid === u && /^volley/.test(x.field || '')));
  ok(at(fm.uid) < at(r0.uid) && at(r0.uid) < at(r2.uid) && at(r2.uid) < at(f0.uid), `column -1 front, middle, back, then column 0 (${[fm, r0, r2, f0].map(c=> at(c.uid)).join(' < ')})`); }

// ======================= 2. the playback: real attacks, RAID_COLUMN_STAGGER_MS apart =======================
ok(/const RAID_COLUMN_STAGGER_MS = 250;/.test(src) && /const RAID_COLUMN_STAGGER_LOW_MS = 150;/.test(src), 'the stagger is a named constant: 250 ms (150 under reduced motion / Low effects)');
{ const body = ['let matchState = {speedMult: 1}, low = false; function reducedMotion(){ return low; } function fxAtLeast(){ return !low; }',
    B.grab('RAID_COLUMN_STAGGER_MS'), B.grab('RAID_COLUMN_STAGGER_LOW_MS'), B.grab('raidSpeedOf'), B.grab('raidLowFx'), B.grab('raidStaggerMs'), B.grab('raidStrikeEv'), B.grab('raidStrikerOf'), B.grab('raidStaggerNext'),
    'return {raidStaggerNext, raidStrikeEv, setLow: v=>{ low = v; }, setSpeed: v=>{ matchState.speedMult = v; }};'].join('\n');
  const S = new Function(body)();
  const hit = (a, t)=> ({type:'hit', attUid:a, targetUid:t}), vol = (a, t)=> ({type:'fieldTick', field:'volleyHit', fromUid:a, uid:t}), castle = a=> ({type:'fieldTick', field:'volleyCastle', fromUid:a});
  ok(S.raidStaggerNext(hit(1, 9), vol(2, 9), false) === 250 && S.raidStaggerNext(vol(2, 9), castle(3), false) === 250, 'a strike followed by another unit\'s strike: the next starts 250 ms later');
  ok(S.raidStaggerNext(hit(1, 9), {type:'death', uid:9}, false) === 0, 'a death next breaks the run (it plays, then the next strike)');
  ok(S.raidStaggerNext(hit(1, 9), hit(1, 8), false) === 0, 'the same unit again (a second swing) is not staggered');
  ok(S.raidStaggerNext(Object.assign(hit(1, 9), {sweep:true}), hit(2, 9), false) === 0 && !S.raidStrikeEv({type:'hit', attUid:1, ranged:true}), 'a Sweep or a triggered shot keeps its own pacing');
  ok(S.raidStaggerNext(castle(3), hit(2, 9), true) === 0, 'a castle blow that may end the fight plays out in full');
  S.setLow(true); ok(S.raidStaggerNext(hit(1, 9), vol(2, 9), false) === 150, 'reduced motion / Low effects: 150 ms, the same order');
  S.setLow(false); S.setSpeed(2); ok(S.raidStaggerNext(hit(1, 9), vol(2, 9), false) === 125, 'at 2x speed: 125 ms'); }
ok(/const stag = !pi && m\.raidFull \? raidStaggerNext\(ev, nx, over\) : 0;/.test(src) && /else if\(stag\) await sleep\(stag\);/.test(src), 'the replay loop waits the stagger between a raid\'s strikes');
ok(/case 'volleyHit': case 'volleyCastle': \{ raidStrikeVfx\(ev\); break; \}/.test(src) && /function raidStrikeVfx\(ev\)\{[\s\S]{0,900}animateAttacker\(ev\.fromUid, isMine, \{leanX, toCastle: castle\}\)/.test(src), 'a middle- or back-row strike lunges like a front-row swing (raidStrikeVfx)');
ok(/function raidStrikeVfx\(ev\)\{[\s\S]{0,1800}pi\[String\(ev\.uid\)\] = pr;/.test(src), 'its blow is registered with the replay, so a death it causes waits for it to land');
ok(/m\.replayReserve = \{\};/.test(src) && /if\(m\.replayReserve\) raidReplayReserveDrop\(m, ev\.side, ev\.uid\);/.test(src) && /raidReplayReserveEnd\(m\);/.test(src), 'the middle and back rows replay hit by hit (a unit leaves its slot when its death plays)');

// ======================= 3. the raid's middle and back rows: +15% =======================
ok(/\.board-row\.reserve-row\.raid-rows > \.board-card\{transform:scale\(\.966\)/.test(tpl) && Math.abs(0.84 * 1.15 - 0.966) < 0.001, 'the raid\'s reserve cards at .966 (.84 x 1.15)');
ok(/\.board-row\.reserve-row\.raid-rows\{height:calc\(var\(--match-card-h, 149px\) \* \.966 \+ 8px\) !important;\}/.test(tpl), 'their rows as tall as the cards');
ok(/reserve-row enemy\$\{m\.raidFull \? ' raid-rows' : ''\}/.test(src) && /reserve-row mine\$\{m\.raidFull \? ' raid-rows' : ''\}/.test(src), 'only a raid\'s reserve rows take the larger size');

// ======================= 4. the HP-scaled elders: 100 Health fresh, down to their basic Health =======================
{ const fresh = RaidM.raidState(goliath, [], 0, {cycle:0});
  const f = RaidM.bossHpBonus(goliath, fresh, 18), near = RaidM.bossHpBonus(goliath, {total:1000, remaining:1}, 18), dead = RaidM.bossHpBonus(goliath, {total:1000, remaining:0}, 18), half = RaidM.bossHpBonus(goliath, {total:100, remaining:50}, 18);
  ok(f.health === 100 && f.bonus === 82, `fresh: 18 basic + 82 = 100 (${JSON.stringify(f)})`);
  ok(near.health === 18 && dead.health === 18 && dead.bonus === 0, `nearly dead: its basic Health (${near.health}, ${dead.health})`);
  ok(half.health === 18 + 41, `half the raid left: 18 + (100 - 18) x 0.5 = 59 (${half.health})`);
  ok(RaidM.bossHpBonus(goliath, fresh, 120).bonus === 0 && RaidM.bossHpBonus(goliath, fresh, 120).health === 120, 'basic Health at or above 100: its basic, no bonus'); }
const sim = require('../tools/raid_full_sim.js'), A = sim.A;
function build(st, opts){ st = st || RaidM.raidState(goliath, [], 0, {cycle:0}); const f = RaidM.fightFor(goliath, st, 'left', {});
  const allies = [0, 1].map(i=> A.raidAllyOf({name:'Ally ' + i, deck: goliath.allyDecks[i].deck, level:0}, i));
  const b = A.buildRaidFullFight(goliath, 'left', f, st, Object.assign({rng: E.mulberry32(3), allies, myCastle:{id:'castle', health:30}, myDeck: B.G.WINRATE_REF_DECKS.starter, recordEvents:true, rand: E.mulberry32(4)}, opts || {}));
  const m = {raidDef: goliath, raidFull:true, round:1, players: b.players, engine: b.engine, sideOf: b.sideOf, stats: b.stats, raidAllies: allies, raidBossUnitId: b.bossUnitId, raidBossHpBonus: b.bossHpBonus, raidBossRowDecks: b.rowDecks, raidCommonPool: b.commonPool};
  return {b, m, f, allies}; }
{ const {b, m} = build(), u = b.overlay[b.bossUnitId];
  ok(u && u.health < 100 && u.health + b.bossHpBonus === 100, `a fresh raid's boss unit: ${u && u.health} + ${b.bossHpBonus} = 100 Health`);
  Object.assign(B.CARD_DEFS_BASELINE, b.overlay); m.round = 3; const ev = []; A.raidBossUnit(m, ev);
  const c = b.engine.allBoardCards(b.players[2]).find(x=> x.bossUnit); ok(c && c.hp === 100 && c.maxHp === 100, `it comes in at 100/100 (${c && c.hp}/${c && c.maxHp})`); }
ok(/RaidM\.bossHpBonus\(def, st, defs\[bossUnitId\]\.health\)\.bonus/.test(src), 'the fight build passes the unit\'s basic Health');
ok(/Boss unit Health, fresh raid<input id="reBossHpBonus"/.test(src), 'the raid editor names the field for what it is now');

// ======================= 5. the boss plays 3 cards a turn, one a row =======================
{ const {b, m} = build(); const P2 = b.players[2], E2 = b.engine;
  ok(!Object.keys(P2.reserve[0]).length && !Object.keys(P2.reserve[1]).length, 'no card waits in the boss\'s middle or back row at the start (it read as a first play)');
  ok(b.rowDecks && b.rowDecks[1].length === 20 && b.rowDecks[2].length === 20, `its middle and back rows each have their own 20-card deck (${b.rowDecks[1].length}, ${b.rowDecks[2].length})`);
  Object.assign(B.CARD_DEFS_BASELINE, b.overlay);
  const front0 = E2.allBoardCards(P2).length; P2.playedThisTurn = false; E2.setAiLevel(1); E2.aiTakeTurn(b.players, b.sideOf, 2, b.stats, null);
  const ev = [], rows = A.raidBossRowPlays(m, ev), front1 = E2.allBoardCards(P2).length;
  ok(front1 - front0 === 1 && rows.length === 2 && rows[0].row === 1 && rows[1].row === 2, `turn 1: 1 card into its front row (the CPU's play) and 1 each into its middle and back rows (${front1 - front0} + ${rows.length})`);
  ok(ev.filter(x=> x.type === 'raidBossPlay').length === 2 && P2.reserve[0][rows[0].slot] && P2.reserve[1][rows[1].slot], 'each row play is on the board, logged as raidBossPlay');
  ok(b.rowDecks[1].length === 19 && b.rowDecks[2].length === 19, 'each came off its row\'s deck'); }
ok(/m\.engine\.aiTakeTurn\(m\.players, m\.sideOf, 2, m\.stats, events\);[\s\S]{0,4000}if\(m\.raidFull\) fightSafe\(\(\)=>\{ const plays = raidBossRowPlays\(m, null\);/.test(src), 'the page plays them in the same CPU turn as its front play (aiActNow)');
ok(/plays\.forEach\(\(pl, i\)=>\{[^\n]*reserveSlotPut\(m, 2, pl\.row, pl\.slot\); bossRowPlayFx\(pl\.uid, i\);/.test(src), 'each flies in from the boss\'s hand into its own slot');
ok(texts.TEXT['ui.raid-boss-play-mid'] && texts.TEXT['ui.raid-boss-play-back'] && /case 'raidBossPlay': return \{cls:'', text: ev\.row === 2 \? TX\('ui\.raid-boss-play-back'/.test(src), 'its row plays have their own log lines (TX)');

// ======================= 6. an ally's play: into its slot alone, no full board render =======================
{ const {b, allies} = build(); Object.assign(B.CARD_DEFS_BASELINE, b.overlay);
  const body = ['let renders = 0, puts = [], fx = []; const document = {}; function pushLog(){} function renderBoard(){ renders++; }',
    'function reserveSlotPut(m, pid, row, slot){ puts.push([pid, row, slot]); return {}; } function allyPlayFx(uid, o){ fx.push(o); } function getCardDefs(){ return D; }',
    B.grab('raidAllyPlays'), 'return {raidAllyPlays, st: ()=> ({renders, puts, fx})};'].join('\n');
  const X = new Function('RaidM', 'D', body)(RaidM, Object.assign({}, B.CARD_DEFS_BASELINE));
  const m = {players: b.players, engine: b.engine}; X.raidAllyPlays(m, allies[0], null); const st = X.st();
  ok(st.renders === 0 && st.puts.length === 1 && st.puts[0][0] === 1 && st.puts[0][1] === allies[0].row, `an ally's play outside the round's events draws its one slot (${JSON.stringify(st.puts)}), no renderBoard (${st.renders})`);
  ok(st.fx.length === 1 && st.fx[0].name === allies[0].name && st.fx[0].mode === 'raid' && st.fx[0].defId, 'and plays its hand-play animation with the ally\'s name and the card'); }
ok(!/raidAlliesTurn\(m, drawEvents\)/.test(src) && /if\(m\.raidFull\) m\._raidAlliesDue = true;/.test(src) && /renderMatchUI\(\);\n  if\(m\._raidAlliesDue\)\{ m\._raidAlliesDue = false; if\(m\.raidFull && !m\.over && matchState === m\) try\{ raidAlliesTurn\(m, null\); \}catch\(e\)\{\} \}/.test(src),
  'each turn\'s ally plays come after the turn\'s redraw, each into its slot, so the redraw never draws them before their flights');
ok(/function reserveSlotPut\(m, pid, row, slot\)\{[\s\S]{0,900}cells\[i\]\.replaceWith\(el\);/.test(src) && !/function reserveSlotPut[\s\S]{0,900}renderBoard\(/.test(src), 'reserveSlotPut replaces one slot\'s element, nothing else');
ok(/function allyPlayFx\(uid, opts\)\{[\s\S]{0,2200}allyNameTagPulse\(el, opts\)[\s\S]{0,1600}allyHandFan\(from, w \|\| 40\)[\s\S]{0,400}flip: true, trail: true, dust: true/.test(src), 'the play shows the ally\'s name tag, its hand of card backs, the face-down card turning face up, a trail and dust');
ok(/if\(origin\.flip\)\{ back = document\.createElement\('div'\); back\.className = 'ally-card-back';/.test(src) && /if\(origin\.dust\) impactDust\(c\);/.test(src), 'the flight proxy turns the card over midway and kicks up dust on landing');
ok(/\.ally-play-tag\{/.test(tpl) && /@keyframes allyTagPulse/.test(tpl) && /\.ally-hand-fan > \.ally-card-back/.test(tpl) && /\.ally-trail-dot\{/.test(tpl), 'the name tag pulses; the hand fan, card back and trail are styled');
ok(texts.TX('ui.raid-ally-plays', {name:'Captain Swiftpaw', card:'Otter Guard'}) === 'Captain Swiftpaw plays Otter Guard', 'the tag reads "Captain Swiftpaw plays Otter Guard"');

// ======================= 7. the raid fight's rank multiplies its damage; a win shows it emblemed =======================
{ const part = goliath.parts.find(p=> p.id === 'left');
  const c = (d, rank, ow)=> RaidM.contributionFor(goliath, d, !!ow, part, rank);
  ok(c(100) === 1500 && c(100, 'C') === 1500 && c(100, 'B') === 1515 && c(100, 'A') === 1650 && c(100, 'S') === 1800 && c(100, 'SS') === 2250 && c(100, 'SSS') === 3000, `B ×1.01, A ×1.1, S ×1.2, SS ×1.5, SSS ×2; below B ×1 (${['C', 'B', 'A', 'S', 'SS', 'SSS'].map(r=> c(100, r)).join(', ')})`);
  ok(c(400) === 5000 && c(400, 'SSS') === 10000 && c(2000, 'SSS') === 10000, 'on top of the cap, never past the overwhelm\'s 10,000');
  ok(c(10, 'SSS', true) === 10000 && c(10, null, true) === 10000, 'a win counts 10,000 whatever the rank'); }
{ const body = [B.grab('RANK_ORDER'), B.grab('rankForHqFraction'), B.grab('raidFightRank'), 'return raidFightRank;'].join('\n'), R = new Function(body)();
  const mm = (hp, max, deaths, extra)=> Object.assign({players:{1:{hq:{hp, maxHp:max}}}, stats: deaths ? {x:{side:'A', deaths}} : {}}, extra || {});
  ok(R(mm(100, 100, 0)) === 'SSS' && R(mm(100, 100, 2)) === 'SS' && R(mm(95, 100)) === 'S' && R(mm(75, 100)) === 'A' && R(mm(55, 100)) === 'B' && R(mm(35, 100)) === 'C', 'the rank: SSS / SS / S / A / B / C on your bramble\'s Health left');
  ok(R(mm(0, 100)) === null && R(mm(90, 100, 0, {endReason:'forfeit'})) === null, 'no rank when your bramble fell or you gave up'); }
ok(/m\.raidRank = m\.raidFull \? raidFightRank\(m\) : null;/.test(src) && /recordRaidAttempt\(def, m\.raidPart, m\.raidCycle, dealt, overwhelmed, m\.raidRank\)/.test(src) && /RaidM\.contributionFor\(def, dealt, overwhelmed, part, rank\)/.test(src), 'the full raid\'s fight is ranked and its attempt (and the server row\'s damage) carries the multiplied damage');
ok(/\$\{raidRankEmblemHTML\(m\.raidRank, m\.raidOverwhelmed, 'lg'\)/.test(src) /* 2026-10-19 (package NV): the results show the raid emblem (tests/nv-2026-10-19.js) */ && /raid-rank\$\{won \? ' is-emblem' : ''\}/.test(src), 'the results show the rank, emblemed for a win');
ok(/\.conquest-rank-badge\.raid-rank\.is-emblem\{/.test(tpl) && /\.raid-rank-crest\{/.test(tpl), 'the emblemed badge: extra rings and a crest');
ok(/rank: raidBestRankOf\(def, c, g\)/.test(src) && /rewards, rank: rk,/.test(src) && /fxf-rcs-rank\$\{spec\.rank\.emblem \? ' is-emblem' : ''\}/.test(fxf) && /\.fxf-rcs-rank\.is-emblem\{/.test(fxf), 'the claim row and the claim screen show your best rank in that life, emblemed if you won a fight');
['ui.raid-rule-share', 'ui.raid-rule-win', 'ui.raid-rule-rank'].forEach(k=>{ const t = texts.TEXT[k]; ok(t && t.split(/\s+/).length < 20 && !/[0-9]\.[0-9]|×/.test(t) && src.includes(`'${k}'`), `the raid rules line ${k} (under 20 words, no multipliers): "${t}"`); });

// ======================= 8. taking part, Competent (10,000), Leading (50,000) =======================
{ const st = (fights, dmg)=> ({contributors:{p: dmg}, fightsBy:{p: fights}});
  const pv = (f, d)=> RaidM.participationOf(goliath, st(f, d), 'p');
  ok(pv(3, 1000).participant && !pv(3, 1000).strong && pv(4, 9999).level === 'participant', 'taking part: 3+ fights, 1,000+ damage; 9,999 is not yet Competent');
  ok(pv(4, 10000).level === 'competent' && pv(4, 10000).strong && !pv(4, 10000).leading && pv(3, 20000).level === 'participant', 'Competent participant: 4+ fights and 10,000+ damage (was 5,000)');
  ok(pv(4, 50000).level === 'leading' && pv(4, 50000).leading && pv(4, 50000).strong && pv(4, 49999).level === 'competent', 'Leading participant: 4+ fights and 50,000+ damage');
  const killState = (dmg)=> Object.assign(st(4, dmg), {defeated:true, fraction:0, contributors:{p: dmg, q: 1}});
  const lead = RaidM.raidReward(goliath, killState(60000), 'p', {}), comp = RaidM.raidReward(goliath, killState(12000), 'p', {});
  ok(comp.boost === 1.2 && comp.cardChance === 0.2 && lead.boost === 1.4 && lead.cardChance === 0 && lead.cards === comp.cards + 1 && lead.leading && lead.level === 'leading', `a fall: Competent +20% and a 20% card chance; Leading +40% and an extra card for certain (${comp.boost}/${comp.cards}, ${lead.boost}/${lead.cards})`); }
ok(/TX\(c\.reward\.leading \? 'ui\.raid-leading' : 'ui\.raid-strong'\)/.test(src) && /rw\.leading \? ' · ' \+ TX\('results\.raid-leading'\)/.test(src) && /if\(p\.leading\) return TX\('ui\.raid-leading'\);/.test(src), 'the hub, the raid screen and the claim screen name the tier');
ok(/id="reLDmg"/.test(src) && /leadDamage: n\('reLDmg', 50000, 1e8\)/.test(src) && /Competent: damage<input id="reSDmg"/.test(src), 'the raid editor edits both tiers');
ok(texts.TEXT['ui.raid-strong'] === '★ Competent participant' && texts.TEXT['results.raid-strong'] === 'Competent participant' && texts.TEXT['ui.raid-leading'] === '👑 Leading participant', 'the tier names');

// ======================= 9. TX keys used, and in the 12 packs =======================
const KEYS = ['ui.raid-boss-play-mid', 'ui.raid-boss-play-back', 'ui.raid-ally-plays', 'results.raid-rank', 'results.raid-rank-tip', 'results.raid-rank-won-tip', 'ui.raid-leading', 'results.raid-leading',
  'ui.raid-part-rules-lead', 'ui.raid-rw-leading', 'ui.raid-rw-leading-what', 'ui.raid-boss-plays-note', 'ui.raid-might', 'ui.raid-rule-share', 'ui.raid-rule-win', 'ui.raid-rule-rank'];
KEYS.forEach(k=> ok(texts.TEXT[k] && src.includes(`'${k}'`), `TX key ${k} exists and is used`));
{ const peel = s=> s.replace(/^[^\p{L}\p{N}{]*/u, '');
  ['fr', 'de', 'es', 'it', 'pt', 'tl', 'ta', 'id', 'zh-Hans', 'zh-Hant', 'ja', 'ko'].forEach(c=>{ const pack = JSON.parse(fs.readFileSync(path.join(__dirname, '..', 'lang', c + '.json'), 'utf8'));
    const miss = KEYS.concat(['ui.raid-strong', 'ui.raid-part-rules', 'ui.raid-rw-strong']).filter(k=> !pack[peel(texts.TEXT[k])]); ok(!miss.length, `the ${c} pack has the RV2 texts (${miss.join(', ')})`); }); }

console.log(fail ? `raid-rv2-2026-10-19: ${fail} failed` : 'raid-rv2-2026-10-19: all passed');
process.exit(fail ? 1 : 0);
