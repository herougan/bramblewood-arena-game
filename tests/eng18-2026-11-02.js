#!/usr/bin/env node
// Package ENG18 (2026-11-02, owner 19:56):
//   COOP3-1: "They play at the random time - that feels natural. If you play before they play, they may recalculate their action before
//            they play it."
//   Adjacency: "Adjacent in front, behind, left, right. Surrounding includes corners." (audit: docs/eng18-adjacency-2026-11-02.md)
//
//   node tests/eng18-2026-11-02.js
//
// Checks:
//   1. the table: a CPU ally's pick is made from the board as it is; when your play takes the cell it would have picked, it picks
//      another cell of its own network (ownedCells), never another row's centre;
//   2. the session (a CPU timer, a fake clock): you play into that cell before its timer fires; it waits out its timer, then plays the
//      re-planned cell, legal (no refusal, no pass, no desync), and the round follows;
//   3. adjacency: adjacentOf on a group dungeon's table (reserveActs) is left, right, in front, behind; on a one-row board left / right;
//      the co-op cells (ownedCells) are the same four directions of your own units; Guardian steps in from in front / behind there;
//   4. texts: the Codex term Adjacent is a TX key with the 4 directions and the group dungeon, Surrounding names the group dungeon,
//      Spawner says "nearest", Stench says "adjacent"; every reworded text has a row in all 12 packs; the old hard-coded term is gone.
'use strict';
const fs = require('fs'), path = require('path');
const H = require('./lib/harness.js');
const ROOT = H.ROOT, C = require(path.join(ROOT, 'bramblewood-coop.js'));
const defs = H.loadCardDefs();
let pass = 0; const fails = [];
function ok(cond, msg){ if(cond) pass++; else { fails.push(msg); console.log('  ✗ ' + msg); } }
const deps = {makeSimEngine: H.Engine.makeSimEngine, defs, defsHash: C.defsHash(defs, Object.keys(defs))};
function fakeClock(){
  let t = 1e6, seq = 0; const timers = new Map();
  return {now: ()=> t, setTimeout(fn, ms){ const id = ++seq; timers.set(id, {at: t + ms, fn}); return id; }, clearTimeout(id){ timers.delete(id); },
    setInterval(fn, ms){ const id = ++seq; timers.set(id, {at: t + ms, fn, every: ms}); return id; }, clearInterval(id){ timers.delete(id); },
    advance(ms){ const end = t + ms; for(;;){ let next = null; timers.forEach((v, k)=>{ if(v.at <= end && (!next || v.at < next[1].at)) next = [k, v]; }); if(!next) break; t = next[1].at; if(next[1].every) next[1].at += next[1].every; else timers.delete(next[0]); next[1].fn(); } t = end; }};
}
const io = ()=> new Promise(r=> setImmediate(r));
async function settle(hub, n){ for(let i = 0; i < (n || 6); i++){ await hub.flush(); await io(); } }
async function elapse(hub, clock, ms){ for(let x = 0; x < ms; x += 50){ clock.advance(Math.min(50, ms - x)); await settle(hub, 3); } }

// A unit of a seat on the group dungeon's board: row 0 (the front row) or row 1 (the ally's row)
function put(T, row, slot, seat, defId){
  const E = T.E, pl = T.players[1]; let c;
  if(!row){ c = E.makeBoardCard(defId || 'quarry-mole'); c.slot = slot; (slot === 0 ? pl.row.center : slot < 0 ? pl.row.left : pl.row.right).push(c); E.syncSlots(pl); }
  else { c = E.fillReserve(pl, row, slot, defId || 'quarry-mole'); c.holdRow = true; }
  c.coopSeat = seat; return c;
}
// The board the re-plan needs: your unit at 0:-1 (so 1:-1 behind it is yours too), the CPU ally's at 1:0 (its cells 1:-1 and 1:1).
function stage(T){ put(T, 0, -1, 0); put(T, 1, 0, 1); }
const playable = (T, s)=> C.seatData(T, s).hand.find(h=> T.E.canPlay(C.seatData(T, s), h.defId, h.uid));

(async ()=>{
  // ---- 1. the table
  {
    const T = C.createTable({makeSimEngine: H.Engine.makeSimEngine, defs, seed: 9, typeId: 'hollow', floorIdx: 0, seats: [{deck: {'cave-cricket': 20}, castleHp: 15}, {cpu: true}]});
    stage(T);
    const plan = C.cpuChoice(T, 1);
    ok(plan && plan.kind === 'play' && plan.row === 1 && plan.slot === -1, `setup: the CPU ally would play 1:-1 (its row, nearest the centre) (${JSON.stringify(plan)})`);
    ok(C.rowLegalSlots(T, 1, 0).includes(-1), 'setup: 1:-1 is yours too (behind your unit at 0:-1)');
    ok(!C.rowLegalSlots(T, 0, 1).includes(0), 'the CPU ally never has your row\'s centre (ENG17)');
    const h = playable(T, 0);
    ok(!!h && C.applyAct(T, {kind: 'play', seat: 0, uid: h && h.uid, row: 1, slot: -1}).ok, 'you play first, into the cell it would have picked');
    const again = C.cpuChoice(T, 1);
    ok(again && again.kind === 'play' && again.row === 1 && again.slot === 1, `the CPU ally picks again from the new board: 1:1 (${JSON.stringify(again)})`);
    ok(again && C.rowLegalSlots(T, again.row, 1).includes(again.slot) && C.checkAct(T, again).ok, 'its new pick is legal by its own network');
    ok(again && !(again.row !== 1 && again.slot === 0), 'its new pick is not another row\'s centre');
  }

  // ---- 2. the session: it waits out its timer, then plays the re-planned cell
  {
    const hub = C.createHub({defer: fn=> setImmediate(fn)}), clock = fakeClock();
    const host = C.createSession({transport: hub.connect('h'), me: {peerId: 'h', name: 'Hazel', deck: {'cave-cricket': 20}, castleHp: 15}, host: true, code: 'ENG018', typeId: 'hollow', deps, clock, seed: 41,
      cpuDelay: ()=> 1200});
    await settle(hub);
    ok(host.start(), 'solo: the host starts with a CPU ally'); await settle(hub);
    const T = host.T; stage(T);
    const before = C.cpuChoice(T, 1);
    ok(before && before.row === 1 && before.slot === -1, `before your play the CPU ally would take 1:-1 (${JSON.stringify(before)})`);
    const h = playable(T, 0);
    const r = h ? host.claim({kind: 'play', uid: h.uid, row: 1, slot: -1}) : {ok: false};
    ok(r.ok, 'you claim 1:-1 before its timer fires'); await elapse(hub, clock, 400);
    ok(C.unitAt(T, 1, -1) && C.unitAt(T, 1, -1).coopSeat === 0, 'your play lands at 1:-1');
    ok(!host.log.some(a=> a.seat === 1), 'the CPU ally has not played yet: it waits out its timer');
    await elapse(hub, clock, 1000);
    const mine = host.log.filter(a=> a.seat === 1);
    const play = mine.find(a=> a.kind === 'play');
    ok(play && play.row === 1 && play.slot === 1, `at its time it plays the re-planned cell 1:1 (${JSON.stringify(mine.map(a=> [a.kind, a.row, a.slot]))})`);
    ok(!mine.some(a=> a.kind === 'pass'), 'no refusal, no pass in its place');
    ok(host.desyncs === 0, `no desync (${host.desyncs})`);
    ok(C.unitAt(T, 1, 1) && C.unitAt(T, 1, 1).coopSeat === 1, 'its unit stands at 1:1, its own');
    host.claim({kind: 'pass'}); await elapse(hub, clock, 400);
    ok(host.T.round === 2, 'you pass: the round is fought');
    host.close();
  }

  // ---- 3. adjacency
  {
    const T = C.createTable({makeSimEngine: H.Engine.makeSimEngine, defs, seed: 3, typeId: 'hollow', floorIdx: 0, seats: [{deck: {'cave-cricket': 20}}, {cpu: true}]});
    const E = T.E, pl = T.players[1];
    const a = put(T, 0, 0, 0), l = put(T, 0, -1, 0), rr = put(T, 0, 1, 0), b = put(T, 1, 0, 1), bl = put(T, 1, -1, 1);
    const adj = E.adjacentOf(pl, a);
    ok(adj.includes(l) && adj.includes(rr) && adj.includes(b) && !adj.includes(bl) && adj.length === 3, `group dungeon: the front centre's adjacent units are left, right and behind, not the diagonal (${adj.length})`);
    const adjB = E.adjacentOf(pl, b);
    ok(adjB.includes(a) && adjB.includes(bl) && !adjB.includes(l) && adjB.length === 2, `group dungeon: the ally's centre: in front and to its left; not the diagonal (${adjB.length})`);
    // Guardian from behind: a Guardian in the ally's row guards the unit in front of it
    const gDef = Object.keys(defs).find(k=> (defs[k].effects || {}).guardian && !(defs[k].effects || {}).thorns);
    const E2 = H.Engine.makeSimEngine(defs, H.seededRng(4), {battleMode: 'open', reserveRows: 1, reserveActs: true, slotCols: C.COLS});
    const P = {1: E2.newPlayer(1, {'quarry-mole': 20}), 2: E2.newPlayer(2, {'quarry-mole': 20})};
    const f = E2.makeBoardCard('quarry-mole'); f.slot = 0; P[1].row.center.push(f); E2.syncSlots(P[1]);
    const g = E2.fillReserve(P[1], 1, 0, gDef); g.wait = 0;
    ok(E2.redirectToGuardian(P[1], f) === g, `Guardian (${gDef}) behind a unit steps in for it where every row fights`);
    // a one-row board: left / right only
    const E3 = H.Engine.makeSimEngine(defs, H.seededRng(5), {battleMode: 'open'});
    const P3 = E3.newPlayer(1, {'quarry-mole': 20});
    const mk = sl=>{ const c = E3.makeBoardCard('quarry-mole'); c.slot = sl; (sl === 0 ? P3.row.center : sl < 0 ? P3.row.left : P3.row.right).push(c); E3.syncSlots(P3); return c; };
    const c0 = mk(0), cl = mk(-1), cr = mk(1); mk(2);
    const a3 = E3.adjacentOf(P3, c0);
    ok(a3.length === 2 && a3.includes(cl) && a3.includes(cr), 'one fighting row: adjacent is left and right');
    // the co-op cells: the four directions of your own units (COOP3-2 / ENG17), confirmed
    const T4 = C.createTable({makeSimEngine: H.Engine.makeSimEngine, defs, seed: 6, typeId: 'hollow', floorIdx: 0, seats: [{deck: {'cave-cricket': 20}}, {deck: {'cave-cricket': 20}}]});
    put(T4, 1, 2, 1);
    const cells = E.ownedCells ? T4.E.ownedCells(T4.players[1], (c, r)=> C.ownerOf(T4, c, r) === 1, 1).map(x=> x.row + ':' + x.slot).sort() : [];
    ok(cells.join(' ') === ['0:2', '1:0', '1:1', '1:3'].sort().join(' '), `co-op cells of a unit at 1:2: left, right, in front (and your own row's centre); no diagonal (${cells.join(' ')})`);
  }

  // ---- 4. texts
  {
    const TX = require(path.join(ROOT, 'bramblewood-texts.js'));
    const t = k=> (TX.TEXT || TX.TX_TEXT || {})[k] || (typeof TX.TX === 'function' ? TX.TX(k) : (typeof TX === 'function' ? TX(k) : ''));
    const src = fs.readFileSync(path.join(ROOT, 'bramblewood-texts.js'), 'utf8');
    const en = k=>{ const m = src.match(new RegExp('^  "' + k.replace(/[.]/g, '\\.') + '": (".*?"),$', 'm')); return m ? JSON.parse(m[1]) : null; };
    void t;
    const adjT = en('ui.eng18-term-adjacent') || '';
    // 2026-11-03 (package FIX7): the player-facing texts say "multiplayer dungeon" since X19; either name passes
    ok(/left, right, in front or behind/.test(adjT) && /(group|multiplayer) dungeon/.test(adjT), 'Codex term Adjacent: the four directions, raids and group dungeons');
    // 2026-11-03 (package TEXT1): Surrounding follows X19 too ("multiplayer-dungeon rows"); either name passes
    ok(/(group|multiplayer).dungeon/.test(en('ui.term-surrounding') || '') && /diagonals/.test(en('ui.term-surrounding') || ''), 'Codex term Surrounding: the diagonals, and a group dungeon\'s rows');
    ok(/raid or (group|multiplayer) dungeon/.test(en('ui.eng9-guardian') || '') /* FIX7 (2026-11-03): X19's wording */, 'Guardian: in front / behind in a raid or group dungeon');
    ok(/nearest/.test(en('ui.sk3-spawner') || '') && !/beside it/.test(en('ui.sk3-spawner-codex') || ''), 'Spawner: the nearest free slot (BF6)');
    ok(/adjacent to that one/.test(en('ui.sk3-stench') || ''), 'Stench: the facing enemy and the units adjacent to it');
    ok(/Guardian adjacent to it/.test(en('ui.eq2-strike-desc') || ''), 'Beak Strike: a Guardian adjacent to it');
    const app = fs.readFileSync(path.join(ROOT, 'arena_app.js'), 'utf8');
    ok(app.includes("{name:'Adjacent', re:'adjacent', text:TX('ui.eng18-term-adjacent')}") && !app.includes("'directly left or right; in a raid, also directly in front or behind.'"), 'the glossary reads the TX key; the old hard-coded text is gone');
    const CODES = ['fr', 'de', 'es', 'it', 'pt', 'tl', 'ta', 'id', 'zh-Hans', 'zh-Hant', 'ja', 'ko'];
    const keys = ['ui.eng18-term-adjacent', 'ui.term-surrounding', 'ui.eng9-guardian', 'ui.sk3-spawner', 'ui.sk3-spawner-codex', 'ui.sk3-stench', 'ui.eq2-strike-desc'];
    CODES.forEach(c=>{ const pack = JSON.parse(fs.readFileSync(path.join(ROOT, 'lang', c + '.json'), 'utf8')), ui = JSON.parse(fs.readFileSync(path.join(ROOT, 'lang', 'ui', c + '.json'), 'utf8'));
      const miss = keys.filter(k=> !(typeof pack[en(k)] === 'string' && pack[en(k)].length));
      ok(!miss.length, `${c}: a translation for every reworded text (${miss.join(', ')})`);
      ok(!('directly left or right; in a raid, also directly in front or behind.' in ui), `${c}: the old term's lang/ui row is gone`);
      ok(/\{card\}/.test(pack[en('ui.sk3-spawner')] || '') && /\{n\}/.test(pack[en('ui.sk3-stench')] || ''), `${c}: placeholders kept`); });
  }

  // ---- 5. the audit and the decisions are filed
  {
    const doc = fs.readFileSync(path.join(ROOT, 'docs', 'eng18-adjacency-2026-11-02.md'), 'utf8');
    ['Guardian', 'Spellward', 'Formation', 'Haste', 'Shieldwall', 'Amplifier', 'Immolation', 'Irradiated', 'Inspiring', 'Friction', 'Proliferate', 'Electricity', 'Chain Lightning', 'Dragon Lightning', 'Spitfire',
      'Dynamite', 'Scavenge', 'Shore Up', 'Pack', 'Fireball', 'Meteor', 'Rocket', 'Stench', 'Spawner', 'Bloom', 'Rampart', 'Sentry', 'Taunt'].forEach(s=> ok(doc.includes(s), `audit lists ${s}`));
    const dj = JSON.parse(fs.readFileSync(path.join(ROOT, 'docs', 'decisions.json'), 'utf8'));
    const eng18 = dj.items.filter(x=> /^ENG18-\d+$/.test(x.id));
    ok(eng18.length >= 4 && eng18.every(x=> x.group === 'game' && (x.status === 'YET' || (x.status === 'DONE' && /Claude's call/.test(x.outcome || '')) /* 2026-11-03 (DEC1): decided at the defaults, ENG18-5 b */) && Array.isArray(x.options) && x.options.length >= 2 && x.default), `decisions ENG18-n filed, group game, with options (${eng18.length})`);
  }

  // ---- 7. UI16-4: a seat keeps its player's profile look (avatar), sent by the joining player
  {
    const hub = C.createHub({defer: fn=> setImmediate(fn)}), clock = fakeClock();
    const av = {character: 'otter', color: 'acorn', title: 'newcomer', background: 'dusk', border: 'vine', font: 'serif', prefix: 'Brave', suffix: 'of the Pond'};
    const host = C.createSession({transport: hub.connect('h'), me: {peerId: 'h', name: 'Hazel', deck: {'cave-cricket': 20}, avatar: {character: 'mouse'}}, host: true, code: 'AVA001', typeId: 'hollow', deps, clock, seed: 5});
    await settle(hub);
    const pip = C.createSession({transport: hub.connect('p'), me: {peerId: 'p', name: 'Pip', deck: {'cave-cricket': 20}, avatar: av}, host: false, code: 'AVA001', typeId: 'hollow', deps, clock, seed: 5});
    await settle(hub, 10);
    const seats = host.room && host.room.seats || [];
    ok(seats[0] && seats[0].avatar && seats[0].avatar.character === 'mouse', 'the host\'s seat carries its avatar');
    ok(seats[1] && seats[1].avatar && JSON.stringify(seats[1].avatar) === JSON.stringify(av), `the joining player's avatar reaches the host's seat (${JSON.stringify(seats[1] && seats[1].avatar)})`);
    ok(pip.room && pip.room.seats[1] && pip.room.seats[1].avatar && pip.room.seats[1].avatar.suffix === 'of the Pond', 'and the roster carries it back to every page');
    const app = fs.readFileSync(path.join(ROOT, 'arena_app.js'), 'utf8');
    ok(/castleHp: gdCastleHp\(\), avatar: \(\(\)=>\{ try\{ return loadAvatar\(\); \}/.test(app), 'the page sends loadAvatar() with the join (gdBegin, used by gdJoin)');
    host.close(); pip.close();
  }

  // ---- 6. BASELVL-1 (owner 20:19: "Baby cards start at level 0"): base Level 0 for every Baby card, Hatchling at Level 0
  {
    const B = require(path.join(ROOT, 'tools', 'lib_bramble.js')), G = B.G, D = B.CARD_DEFS_BASELINE;
    const babies = Object.values(D).filter(d=> d.kind === 'baby');
    ok(babies.length >= 21 && babies.every(d=> G.cardBaseLevel(d) === 0), `every Baby card has base Level 0 (${babies.filter(d=> G.cardBaseLevel(d) !== 0).map(d=> d.id).join(', ')})`);
    ok(babies.every(d=>{ const s = G.statsAtLevel(d, 0); return s.attack === d.attack && s.health === d.health; }), 'a Level 0 Baby copy has its printed stats');
    const starters = Object.values(D).filter(d=> d.kind !== 'baby' && d.faction === 'base' && d.rarity === 'starter' && !d.token);
    ok(starters.length > 0 && starters.every(d=> G.cardBaseLevel(d) === 1), `the other starters (faction base) stay at Level 1 (${starters.length})`);
    ok(babies.every(d=> d.levelSkills && d.levelSkills['0'] && d.levelSkills['0'].hatchling === true && !(d.levelSkills['1'] && d.levelSkills['1'].hatchling)), 'Hatchling at Level 0 on every Baby card (none at Level 1)'); // 2026-11-03 (ENG22, DESIGN1-2): a Baby's other abilities arrive at Level 1 now, so levelSkills "1" may exist; Hatchling is not in it
    const app = fs.readFileSync(path.join(ROOT, 'arena_app.js'), 'utf8');
    const eff = app.match(/function effectsAtLevel\(b, L, fx0\)\{[\s\S]*?return fx; \}/);
    if(eff){ const f = new Function(eff[0] + '; return effectsAtLevel;')(); ok(babies.every(d=> f(d, 0).hatchling === true), 'effectsAtLevel: a Level 0 Baby has Hatchling'); }
    else ok(false, 'effectsAtLevel found');
  }

  console.log(`eng18: ${pass} passed, ${fails.length} failed`);
  if(fails.length){ fails.forEach(f=> console.log('  FAIL ' + f)); process.exit(1); }
})().catch(e=>{ console.error(e); process.exit(1); });
