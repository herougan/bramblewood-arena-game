// Multiplayer dungeons (2026-11-12, package DUNGEON1; owner 23:47 notes 18, 20, 21):
//   1. the data: every dungeon has 3-5 parts (the vault 5, the Mire Warren preview 3), a boss on the last, one scoring entry a part;
//   2. the run's pay: RUN_PAY_BANDS (all parts = full; else f = won / parts, x 0.5, or x 0.25 for 1-3 parts), runPay's full rewards;
//   3. a part won on the same board: the party (units, hands, bramble) carries over, the enemy gets the next part's bramble and deck, and
//      3-5 units arrive with Wait (the boss first on a boss part), every second one in its middle row; the part's own 20-round clock;
//      deterministic; refused before the enemy's bramble falls, after the party's, or on the last part; headlessRound advances inline;
//   4. the enemy side has two rows (reserveRows >= 1, even for a 1-row party);
//   5. the room: a whole solo run goes part to part on one table (one 'floor' act, then 'part' events), a 2-player run stays in step,
//      a joiner takes the room's dungeon from the roster, and the host's switcher moves the lobby (setType);
//   6. pacing (note 20): dungeon1GapMs: 2x the raid stagger within a row, 1.4x across rows, never past the single-player beat, never
//      faster than before; raids untouched;
//   7. the page wiring (the room from the dungeon's data, the switcher, every open dungeon's card, the part hook in resolveRoundCore, no
//      sudden death in a run, the part's turn count, the run's pay at its end) and the texts in 12 packs.
'use strict';
const fs = require('fs'), path = require('path');
const H = require('./lib/harness.js');
const B = require('../tools/lib_bramble.js');
const ROOT = H.ROOT, C = require(path.join(ROOT, 'bramblewood-coop.js'));
const defs = H.loadCardDefs(), ids = H.fieldableIds(defs);
let pass = 0; const fails = [];
function ok(cond, msg){ if(cond) pass++; else { fails.push(msg); console.log('  ✗ ' + msg); } }
const pool = ids.filter(id=> ['common', 'uncommon', 'rare'].includes(defs[id].rarity) && (defs[id].cost || 0) <= 2 && defs[id].attack != null && !defs[id].cardType);
function deckFrom(seed){ const r = H.seededRng(seed); const d = {}; let n = 0; while(n < 20){ const id = pool[Math.floor(r() * pool.length)]; if((d[id] || 0) >= 3) continue; d[id] = (d[id] || 0) + 1; n++; } return d; }
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
const mk = (seed, typeId, extra)=> C.createTable(Object.assign({makeSimEngine: H.Engine.makeSimEngine, defs, seed, typeId: typeId || 'hollow', floorIdx: 0,
  seats: [{deck: {'deep-cave-troll': 6, 'quarry-mole': 7, 'cave-cricket': 7}, castleHp: 40}, {cpu: true}], recordEvents: false}, extra || {}));
const boardUids = pl=> [...pl.row.left, ...pl.row.center, ...pl.row.right].filter(c=> c && !c.gap && c.hp > 0).map(c=> c.uid).sort((a, b)=> a - b);

(async ()=>{
  // ---- 1. the data
  Object.values(C.DUNGEONS).forEach(d=>{
    ok(d.floors.length >= C.PARTS_MIN && d.floors.length <= C.PARTS_MAX, `${d.id}: ${d.floors.length} parts (3-5)`);
    ok(d.floors[d.floors.length - 1].boss && d.floors.every((f, i)=> !f.boss || i === d.floors.length - 1), `${d.id}: the boss on the last part only`);
    ok(d.scoring.length === d.floors.length, `${d.id}: one scoring entry a part`);
    ok(d.floors.every(f=> Object.values(f.deck).reduce((a, b)=> a + b, 0) === 20 && Object.keys(f.deck).every(id=> defs[id] && !defs[id].token)), `${d.id}: every part's deck is 20 real cards`);
    ok(d.blurbKey && d.art && Array.isArray(d.tint), `${d.id}: what its room draws (blurb, art, tint)`);
  });
  ok(C.partsOf('hollow') === 5 && C.DUNGEONS.hollow.floors[3].key === 'stair', 'the vault: 5 parts, the Drowned Stair fourth');
  ok(C.DUNGEONS.mire.preview === true && C.DUNGEONS.mire.mapNumber == null, 'the Mire Warren: an Admin preview with no map yet');

  // ---- 2. the run's pay
  const near = (a, b)=> Math.abs(a - b) < 1e-9;
  ok(near(C.runFactor(5, 5), 1) && near(C.runFactor(4, 5), 0.4) && near(C.runFactor(3, 5), 0.15) && near(C.runFactor(2, 5), 0.1) && near(C.runFactor(1, 5), 0.05) && C.runFactor(0, 5) === 0,
    'pay: 5/5 full, 4/5 = 0.8 x 0.5, 3/5 = 0.6 x 0.25, 2/5 = 0.1, 1/5 = 0.05, none 0');
  ok(near(C.runFactor(3, 3), 1) && near(C.runFactor(2, 3), 2 / 3 * 0.25), 'pay: a 3-part dungeon: all = full, 2 of 3 = f x 0.25');
  ok(C.RUN_PAY_BANDS.length === 3 && C.RUN_PAY_BANDS[0].all && C.RUN_PAY_BANDS[1].maxWon === 3 && C.RUN_PAY_BANDS[1].mult === 0.25 && C.RUN_PAY_BANDS[2].mult === 0.5, 'pay: one table of bands');
  { const all = [0, 1, 2, 3, 4].map(i=> ({idx: i, won: true, rank: 'S'})), r = C.runPay('hollow', all);
    const sum = [0, 1, 2, 3, 4].reduce((a, i)=> a + C.floorPay('hollow', i, {won: true, rank: 'S'}).contribution, 0);
    ok(r.cleared && r.factor === 1 && r.contribution === sum && r.gold === Math.round(sum / C.PAY.goldPer), `pay: a cleared run pays every part's won pay (${r.contribution})`);
    const part = C.runPay('hollow', all.slice(0, 4).concat([{idx: 4, won: false}]));
    ok(!part.cleared && part.won === 4 && part.contribution === Math.round(part.full * 0.4), `pay: 4 of 5 pays 40% of the full rewards (${part.contribution} of ${part.full})`);
    ok(C.runPay('hollow', []).contribution === 0, 'pay: no part won pays nothing'); }

  // ---- 3. a part won on the same board
  { const T = mk(7), P = T.players, E = T.E;
    ok(!C.advancePart(T), 'advance: refused while the enemy\'s bramble stands');
    E.debugSpawnCard(P, id=> id === 1 ? 'A' : 'B', 1, 'deep-cave-troll', 0, T.stats, []); E.debugSpawnCard(P, id=> id === 1 ? 'A' : 'B', 1, 'quarry-mole', 1, T.stats, []);
    const mine = boardUids(P[1]), hand = C.seatData(T, 0).hand.map(h=> h.uid).join(','), hp1 = (P[1].hq.hp -= 7);
    P[2].hq.hp = 0; T.round = 9;
    const a = C.advancePart(T), f1 = C.floorDef('hollow', 1);
    ok(a && T.floorIdx === 1 && a.idx === 1 && T.over === null, 'advance: on to part 2');
    ok(JSON.stringify(boardUids(P[1])) === JSON.stringify(mine) && P[1].hq.hp === hp1 && C.seatData(T, 0).hand.map(h=> h.uid).join(',') === hand, 'carry-over: the party\'s units, hand and bramble Health stay');
    ok(P[2].hq.hp === P[2].hq.maxHp && P[2].hq.maxHp === Math.max(10, Math.round(f1.castle * T.scale)) && P[2].hand.length === 3, `the enemy: the next part's bramble (${P[2].hq.hp}) and a hand of 3`);
    ok(a.freeTurns >= 3 && a.freeTurns <= 5 && a.arrivals.length === a.freeTurns, `arrivals: ${a.arrivals.length} units for ${a.freeTurns} free turns`);
    ok(a.arrivals.every(x=> x.wait >= C.ARRIVAL_WAIT_MIN && Object.keys(f1.deck).includes(x.defId)), 'arrivals: from the next part\'s deck, each with Wait');
    ok(a.arrivals.some(x=> x.row === 1) && a.arrivals.some(x=> x.row === 0), `arrivals: in both enemy rows (${a.arrivals.map(x=> x.row + ':' + x.slot).join(' ')})`);
    ok(a.arrivals.filter(x=> x.row === 1).every(x=> P[2].reserve[0][x.slot] && P[2].reserve[0][x.slot].uid === x.uid && P[2].reserve[0][x.slot]._rowArrived), 'arrivals: the middle row\'s are on the board (no second On Spawn)');
    ok(T.cap === 9 + C.DUNGEONS.hollow.roundCap && T.partStart === 10, 'the part\'s own clock: 20 more rounds');
    ok(a.prev && a.prev.idx === 0 && a.prev.won && a.prev.rank, `the part just won is on the log (rank ${a.prev && a.prev.rank})`);
    const T2 = mk(7); E.debugSpawnCard; const P2 = T2.players; T2.E.debugSpawnCard(P2, id=> id === 1 ? 'A' : 'B', 1, 'deep-cave-troll', 0, T2.stats, []); T2.E.debugSpawnCard(P2, id=> id === 1 ? 'A' : 'B', 1, 'quarry-mole', 1, T2.stats, []);
    P2[1].hq.hp -= 7; P2[2].hq.hp = 0; T2.round = 9; const b = C.advancePart(T2);
    ok(JSON.stringify(b.arrivals) === JSON.stringify(a.arrivals) && C.tableHash(T2) === C.tableHash(T), 'deterministic: the same seed brings the same arrivals');
    // the last part: the boss first, and no part after it
    const T3 = mk(3); T3.floorIdx = 3; T3.players[2].hq.hp = 0; const c = C.advancePart(T3);
    ok(c && c.idx === 4 && c.arrivals[0].defId === C.bossIdOf('hollow', 4) && c.arrivals.length === c.freeTurns + 1, 'the boss part: the Tidewarden arrives first, with the free turns\' units');
    T3.players[2].hq.hp = 0; ok(!C.advancePart(T3) && !C.hasNextPart(T3), 'the last part: no part after it');
    const T4 = mk(4); T4.players[2].hq.hp = 0; T4.players[1].hq.hp = 0; ok(!C.advancePart(T4), 'refused when the party\'s bramble fell too'); }
  { // whole runs, headless: parts advance inline, the run ends only on the last part or a loss
    const res = [];
    for(const seed of [1, 2, 3]){ const T = mk(seed); let r = {}, seen = [0];
      for(let i = 0; i < 160 && !r.over; i++){ C.cpuActs(T, 0); C.cpuActs(T, 1); r = C.headlessRound(T); if(seen[seen.length - 1] !== T.floorIdx) seen.push(T.floorIdx); }
      res.push(`${seed}:${T.over}@part${T.floorIdx + 1}`);
      ok(r.over && T.partLog.length === T.floorIdx + 1 && T.partLog.slice(0, -1).every(x=> x.won) && seen.join(',') === Array.from({length: T.floorIdx + 1}, (_, i)=> i).join(','), `run ${seed}: parts in order on one table (${seen.join('>')}), ${T.over}`);
      ok(T.over !== 'won' || T.floorIdx === C.partsOf('hollow') - 1, `run ${seed}: "won" only on the last part`); }
    console.log('  headless runs:', res.join(' · ')); }

  // ---- 4. two enemy rows
  { const T = mk(5); ok(T.E.reserveRows >= 1 && T.players[2].reserve && T.players[2].reserve.length >= 1, 'the enemy side has a middle row'); }

  // ---- 5. the room
  async function run(nHumans, seed, typeId){
    const hub = C.createHub({defer: fn=> setImmediate(fn)}), clock = fakeClock(), peers = [], evs = [];
    for(let i = 0; i < nHumans; i++){ const id = 'p' + i, mine = []; evs.push(mine);
      peers.push(C.createSession({transport: hub.connect(id), me: {peerId: id, name: 'P' + i, deck: deckFrom(seed * 10 + i), castleHp: 15}, host: i === 0, code: 'DGN001', typeId: i === 0 ? typeId : 'hollow', deps, clock, seed, autoPlay: 10, onEvent: (k, d)=> mine.push([k, d && d.idx])})); await settle(hub); }
    peers.slice(1).forEach(p=> p.setReady(true)); await settle(hub);
    peers[0].start(); await settle(hub);
    for(let g = 0; g < 900 && !peers[0].ended; g++) await elapse(hub, clock, 200);
    await settle(hub); return {peers, evs};
  }
  const solo = await run(1, 21, 'hollow');
  const s0 = solo.peers[0], parts = solo.evs[0].filter(e=> e[0] === 'part').map(e=> e[1]);
  ok(s0.ended && s0.log.filter(a=> a.kind === 'floor').length === 1, `solo: the run ended (${s0.ended}) with one 'floor' act (the parts on one table)`);
  ok(parts.join(',') === Array.from({length: parts.length}, (_, i)=> i + 1).join(','), `solo: 'part' events in order (${parts.join(',')})`);
  ok(s0.results.slice(0, -1).every(x=> x === 'won') && s0.results.length === parts.length + 1, `solo: every part before the last result was won (${JSON.stringify(s0.results)})`);
  ok(s0.ended === 'cleared' ? s0.results.length === C.partsOf('hollow') : s0.ended === 'lost', 'solo: "cleared" only after the last part');
  const duo = await run(2, 23, 'mire');
  ok(duo.peers[1].typeId === 'mire' && duo.peers[1].T && duo.peers[1].T.typeId === 'mire', 'join: the guest takes the room\'s dungeon (the Mire Warren) from the roster');
  ok(duo.peers.every(p=> p.desyncs === 0) && duo.peers[1].ended === duo.peers[0].ended, `2p: in step through the parts (${duo.peers[0].ended}, ${JSON.stringify(duo.peers[0].results)})`);
  ok(JSON.stringify(duo.peers[1].log.map(a=> [a.seq, a.kind, a.seat, a.hash || ''])) === JSON.stringify(duo.peers[0].log.map(a=> [a.seq, a.kind, a.seat, a.hash || ''])), '2p: both clients applied the same act log');
  [solo, duo].forEach(x=> x.peers.forEach(p=> p.close()));
  { const hub = C.createHub({defer: fn=> setImmediate(fn)}), clock = fakeClock();
    const h = C.createSession({transport: hub.connect('h'), me: {peerId: 'h', name: 'H', deck: deckFrom(1)}, host: true, code: 'SWITCH', typeId: 'hollow', deps, clock, seed: 3});
    const g = C.createSession({transport: hub.connect('g'), me: {peerId: 'g', name: 'G', deck: deckFrom(2)}, host: false, code: 'SWITCH', typeId: 'hollow', deps, clock}); await settle(hub);
    g.setReady(true); await settle(hub);
    ok(h.setType('mire') && h.room.typeId === 'mire', 'switch: the host moves the lobby to the Mire Warren'); await settle(hub);
    ok(g.typeId === 'mire' && g.room.typeId === 'mire' && !g.room.seats[1].ready, 'switch: the guest follows, and confirms again (Ready cleared)');
    ok(!g.setType('hollow'), 'switch: only the host moves the room');
    ok(!h.canStart(), 'switch: the host waits for the guest to be ready again');
    g.setReady(true); await settle(hub); ok(h.start(), 'switch: then the climb starts'); await settle(hub);
    ok(!h.setType('hollow') && h.startMsg.typeId === 'mire', 'switch: not once the climb started (the run is the Mire Warren)'); h.close(); g.close(); }

  // ---- 6. pacing
  const app = fs.readFileSync(path.join(ROOT, 'arena_app.js'), 'utf8');
  { const body = ['let matchState = {speedMult: 1};', B.grab('RAID_COLUMN_STAGGER_MS'), B.grab('RAID_COLUMN_STAGGER_LOW_MS'), B.grab('raidStrikeEv'), B.grab('raidStrikerOf'),
      B.grab('DUNGEON1_PACE'), B.grab('dungeon1StrikeRow'), B.grab('dungeon1GapMs'), 'return {dungeon1GapMs, DUNGEON1_PACE};'].join('\n');
    const S = new Function(body)(), g = S.dungeon1GapMs;
    const vol = (a, row, side)=> ({type: 'fieldTick', field: 'volleyHit', fromUid: a, fromSide: side || 'A', row, uid: 99});
    const hit = (a, side)=> ({type: 'hit', attUid: a, side: side || 'A', targetUid: 98});
    ok(g(vol(1, 1), vol(2, 1), 60, 1, false) === 500, 'pacing: the next strike in the same row waits 2x the stagger (500 ms at 1x, was 60-150)');
    ok(g(vol(1, 1), hit(3), 150, 1, false) === 350, 'pacing: the next column\'s strike (another row) waits 1.4x (350 ms)');
    ok(g(vol(1, 1), vol(2, 1), 60, 2, false) === 250 && g(vol(1, 1), hit(3), 150, 2, false) === 175, 'pacing: relative to the chosen speed (2x: 250 / 175 ms)');
    ok(g(hit(1), hit(2), 900, 1, false) === 900 && g(hit(1), vol(2, 1), 900, 1, false) === 900, 'pacing: a front-row swing already at the single-player beat stays as it is');
    ok(g(vol(1, 1), vol(2, 1), 60, 1, true) === 300, 'pacing: Low effects / reduced motion: 2 x 150 ms');
    ok(g({type: 'statusFx', kind: 'x'}, vol(2, 1), 60, 1, false) === 60, 'pacing: anything that is not a strike keeps its beat');
    ok(S.DUNGEON1_PACE.sameRow * 250 <= S.DUNGEON1_PACE.singleBeat && S.DUNGEON1_PACE.nextRow * 250 <= S.DUNGEON1_PACE.singleBeat, 'pacing: never slower than the single-player beat (900 ms)'); }
  ok(/else if\(m\.coop && !rapid\) await sleep\(dungeon1GapMs\(ev, nx, delayForEvent\(ev, lastVfxKind\), m\.speedMult \|\| 1, raidLowFx\(\)\)\);/.test(app), 'pacing: the replay loop uses it in a group dungeon');
  ok(/const stag = !pi && m\.raidFull \? raidStaggerNext\(ev, nx, over\) : 0;/.test(app) && /const RAID_COLUMN_STAGGER_MS = 250;/.test(app), 'pacing: raids keep their own stagger');

  // ---- 7. the page wiring and the texts
  [/function gdLobbyHTML\(\)\{[\s\S]{0,600}dg = gdType\(id\)/, /class="dg1-banner"/, /class="dg1-track"/, /data-gd-act="switch"/, /<details class="dg1-more">/, /CoopM\.runFactor\(w, n\)/,
   /if\(a === 'switch'\)\{[\s\S]{0,200}S\.setType\(t\)/, /function groupDungeonCardsHTML\(\)/, /gdCreate\(k === 'solo', b\.dataset\.gdType\)/, /function pl2OpenCoopPop\(id\)/,
   /FEATURE_SPOTS\.push\(\{key:'coop-' \+ d\.id/, /m\.coop && over && !dungeonAdvanced && m\.forcedWinner == null && m\.players\[1\]\.hq\.hp > 0 && m\.players\[2\]\.hq\.hp <= 0 && fightSafe\(\(\)=> dungeon1Advance\(m\)/,
   /await dungeon1PartBanner\(m\.coop\.T\)/, /CoopM\.advancePart\(T\)/, /&& !m\.coop \/\* DUNGEON1: a run's parts go past turn 20/, /const off = m\.coopRoundOffset \| 0/, /CoopM\.runPay\(T\.typeId, T\.partLog \|\| \[\]\)/, /CoopM\.allOverlays\(T\.typeId, sd\)/]
    .forEach(re=> ok(re.test(app), 'page: ' + re.source.slice(0, 70)));
  const tpl = fs.readFileSync(path.join(ROOT, 'arena_template.html'), 'utf8');
  ['.dg1-banner{', '.dg1-track{', '.dg1-part-banner{', '@keyframes dg1Scroll', '.dg1-part-banner.is-still .dg1-pb-ribbon{animation:dg1Fade', '@media (max-width:560px)'].forEach(s=> ok(tpl.includes(s), 'css: ' + s));
  const texts = require(path.join(ROOT, 'bramblewood-texts.js')), T0 = texts.TEXT || texts;
  const keys = [...new Set((app.match(/TX\('ui\.dungeon1-[a-z0-9-]+'/g) || []).map(s=> s.slice(4, -1)).concat(C.TEXT_KEYS))];
  ok(keys.length >= 20 && keys.every(k=> T0[k]), 'texts: every DUNGEON1 key is in bramblewood-texts.js (' + keys.filter(k=> !T0[k]).join(', ') + ')');
  ok(T0['ui.ar3-floor'] === 'Part {n}/{total}' && T0['ui.coop2-group-facts'].startsWith('{floors} parts'), 'texts: floors are parts now');
  ['fr', 'de', 'es', 'it', 'pt', 'tl', 'ta', 'id', 'zh-Hans', 'zh-Hant', 'ja', 'ko'].forEach(code=>{ const pack = JSON.parse(fs.readFileSync(path.join(ROOT, 'lang', code + '.json'), 'utf8'));
    ok(keys.every(k=> pack[T0[k]]), `texts: the ${code} pack has every line (${keys.filter(k=> !pack[T0[k]]).join(', ')})`); });

  console.log(`dungeon1: ${pass} passed, ${fails.length} failed`);
  process.exit(fails.length ? 1 : 0);
})().catch(e=>{ console.error(e); process.exit(1); });
