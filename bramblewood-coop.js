// ============================================================================
// Bramblewood Group Dungeon (2026-10-23, package AR3; owner AR-3: "This is a big pass. I like this. Can you launch a big pass for
// this."). The co-op dungeon of D49 (docs/coop-dungeon-design-2026-10-13.md, answers D76): 2-4 players side by side on one board
// against a dungeon, plays planned at the same time. DOM-free: inlined into the page (global `BramblewoodCoop`) and require()'d by
// tests/coop-dungeon-2026-10-23.js and tests/coop-lobby-2026-10-23.js.
//
// Two halves:
//   1. THE RUN (createRun / startFloor / resolveRound): the rules. One engine (bramblewood-engine.js, an Open board with one reserve
//      row a side and every row acting, as the raid's full board) per floor. Engine player 1 is the party, player 2 the dungeon. Each
//      seat keeps its own deck, hand, Lumber and turn flags (SEAT_KEYS); they are swapped into the party player while that seat acts.
//      Same inputs (seed, decks, plans) -> the same fight on every machine, so the host sends only each round's plans and a hash.
//   2. THE ROOM (createSession + transports): the lobby, the plan timer, the host, disconnects and host migration, over any transport
//      with send / onMessage: Supabase Realtime broadcast (live), BroadcastChannel (tabs of one browser), or an in-memory hub (tests).
//
// Board (the design's 10-cell rows fitted to the raid board's 7 columns):
//   dungeon  e e e e e e e     its front row and one row behind it
//   row 0    A A A [S] B B B   front: seat A on the left, seat B on the right, the centre column shared
//   row 1    C C C [S] D D D   back: seat C and seat D (a back-row unit steps up when the cell ahead empties)
// A 2-seat party (1-2 players) uses A and C and only the left half and centre (columns -3..0): the right half is blocked ground on
// both sides. 3 players: A, C, D and a CPU ally in B. 4 players: all four. Solo: you in A and a CPU ally in C.
// ============================================================================
(function(root){
'use strict';

const SEATS = ['A', 'B', 'C', 'D'];
const SEAT_ROW = {A:0, B:0, C:1, D:1};
const JOIN_ORDER = ['A', 'C', 'D', 'B']; // the host is A; the 2nd player C (the back row behind them), then D, then B
const COLS_4 = [-3, -2, -1, 0, 1, 2, 3], COLS_2 = [-3, -2, -1, 0];
const SHARED_COL = 0;
const HEALTH_SCALE = [1, 1.7, 2.3, 2.8]; // the dungeon's Health by players (D49)
const PARTY_CASTLE_SHARE = 0.75; // the shared castle: the seats' castles added up, scaled down (D49, D76)
const FLOOR_ROUNDS = 20; // the floor is lost if the dungeon still stands after this many rounds (the raid's fight length)
const PLAN_SECONDS = {normal: 30, casual: 60}; // D76
const ENERGY_COST = 5; // ⚡ per player per run (paid as the run starts; given back if no floor was cleared)
// What each seat owns of the party player (swapped in while it acts). The board, castle, Graveyard and Removal Zone are shared.
const SEAT_KEYS = ['deck', 'hand', 'lumber', 'stone', 'metal', 'uranium', 'grace', 'devilry', 'gold', 'elementalEnergy', 'playedThisTurn',
  'discardUsedThisTurn', 'playsTurn', 'playsThisTurn', 'darkUsed', 'fieldTurn', 'cardsPlayedEver', 'drawnTotal', '_openingDealt',
  'prayerTokens', 'prayerOfferTurn', 'firstUnitBonusUsed'];

// ---- The dungeon (Hollow Kin country: the lore bible's cave dwellers). Floor decks are live cards; the Matriarch is a fight-only copy.
const DUNGEONS = {
  hollow: {id: 'hollow', nameKey: 'ui.ar3-dungeon-name', icon: '🕳️', poolFloor: 3,
    floors: [
      {key: 'roost', nameKey: 'ui.ar3-floor-roost', icon: '🦇', castle: 24, mech: null,
        deck: {'baby-bat': 4, 'cave-swiftlet': 3, 'vampire-bat': 3, 'cave-flitter': 3, 'upside-down-bat': 3, 'voltwing-bat': 2, 'fruit-bat-familiar': 2},
        reward: {gold: 40, dust: 10}},
      {key: 'galleries', nameKey: 'ui.ar3-floor-galleries', icon: '⛏️', castle: 26, mech: 'caveIn',
        deck: {'quarry-mole': 4, 'star-nosed-mole': 3, 'ore-smelter-mole': 3, 'cave-cricket': 3, 'cave-centipede': 3, 'tiny-cave-dweller': 2, 'deep-cave-troll': 2},
        reward: {gold: 55, dust: 14}},
      {key: 'pools', nameKey: 'ui.ar3-floor-pools', icon: '🦎', castle: 21, mech: 'curse',
        deck: {'cave-olm': 3, 'alpine-salamander': 3, 'fire-salamander': 3, 'glimmer-spider': 3, 'glowworm-cluster': 2, 'whip-spider': 2, 'velvet-worm': 2, 'magma-salamander': 2},
        reward: {gold: 70, dust: 18}},
      {key: 'matriarch', nameKey: 'ui.ar3-floor-matriarch', icon: '👑', castle: 28, mech: 'smack', boss: {base: 'cave-warlord', nameKey: 'ui.ar3-boss-name', hpMult: 1.25, atkAdd: 0},
        deck: {'giant-cave-huntsman': 2, 'wolf-spider-mother': 2, 'trapdoor-spider': 2, 'deep-cave-troll': 2, 'glowing-gecko': 3, 'hollow-oath-keeper': 3, 'cave-bat-swarm': 2, 'arc-bat': 2, 'irradiated-glow-wyrm': 2},
        reward: {gold: 120, dust: 40}},
    ]},
};
const MECH = {caveIn: {from: 3, every: 2, dmg: 2}, curse: {dmg: 2}, smack: {every: 2, dmg: 4}};

// ---- small helpers
function mulberry32(a){ return function(){ a |= 0; a = a + 0x6D2B79F5 | 0; let t = Math.imul(a ^ a >>> 15, 1 | a); t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t; return ((t ^ t >>> 14) >>> 0) / 4294967296; }; }
function mixSeed(){ let h = 0x811C9DC5; for(let i = 0; i < arguments.length; i++){ h ^= (Number(arguments[i]) >>> 0); h = Math.imul(h, 0x01000193) >>> 0; h ^= h >>> 13; } return h >>> 0; }
function hashStr(s){ let h = 2166136261; s = String(s); for(let i = 0; i < s.length; i++){ h ^= s.charCodeAt(i); h = Math.imul(h, 16777619); } return (h >>> 0).toString(36); }
function clone(o){ return o == null ? o : JSON.parse(JSON.stringify(o)); }
const sideOf = id=> id === 1 ? 'A' : 'B';
const byCentre = (a, b)=> Math.abs(a) - Math.abs(b) || a - b;

// ---- seats and cells
// The party's size on the board: 2 seats (A, C) for 1-2 players, else 4 (an empty seat is a CPU ally). `want` lets a solo / duo room
// ask for 4 seats (more CPU allies).
function boardSize(humans, want){ return (humans >= 3 || want === 4) ? 4 : 2; }
function seatsFor(size){ return size === 4 ? ['A', 'B', 'C', 'D'] : ['A', 'C']; }
function colsFor(size){ return size === 4 ? COLS_4.slice() : COLS_2.slice(); }
// The cells a seat may play into: its row, its half and the shared centre (alone on a row, the centre is its own).
function cellsFor(seat, size){
  const row = SEAT_ROW[seat], left = seat === 'A' || seat === 'C';
  const cols = size === 4 ? (left ? [-3, -2, -1, 0] : [0, 1, 2, 3]) : [-3, -2, -1, 0];
  return cols.map(slot=> ({row, slot, shared: size === 4 && slot === SHARED_COL}));
}
function isSharedCell(size, slot){ return size === 4 && slot === SHARED_COL; }

// ---- the run
// opts: {makeSimEngine, defs, seed, size, dungeonId, seats:[{seat, name, deck:{id:n}, cpu, castleHp}]}
function createRun(opts){
  const dg = DUNGEONS[opts.dungeonId || 'hollow'];
  const size = opts.size === 4 ? 4 : 2, seatIds = seatsFor(size);
  const given = {}; (opts.seats || []).forEach(s=>{ if(s && seatIds.includes(s.seat)) given[s.seat] = s; });
  const seats = seatIds.map(id=>{ const s = given[id] || {seat: id, cpu: true, name: '', deck: null};
    return {seat: id, name: s.name || '', cpu: !!s.cpu, deck: Object.assign({}, s.deck || {}), castleHp: Math.max(1, Number(s.castleHp) || 20)}; });
  // a CPU ally with no deck of its own plays a copy of the first human's deck
  const firstDeck = (seats.find(s=> !s.cpu && Object.keys(s.deck).length) || seats.find(s=> Object.keys(s.deck).length) || {}).deck || {};
  seats.forEach(s=>{ if(!Object.keys(s.deck).length) s.deck = Object.assign({}, firstDeck); });
  const humans = Math.max(1, seats.filter(s=> !s.cpu).length);
  return {v: 1, dungeonId: dg.id, seed: (Number(opts.seed) >>> 0) || 1, size, cols: colsFor(size), seats, humans,
    makeSimEngine: opts.makeSimEngine, defs: opts.defs, floorIdx: -1, floorCount: dg.floors.length, results: [], fl: null};
}
function dungeonOf(run){ return DUNGEONS[run.dungeonId] || DUNGEONS.hollow; }
function floorDef(run, idx){ return dungeonOf(run).floors[idx == null ? run.floorIdx : idx]; }
// Party size = the seats on the board, CPU allies included (a solo player with a CPU ally fights with two decks, as a duo does): x1.7
// for 2 seats, x2.8 for 4 (D49's 1-4 player steps).
function healthScale(run){ return HEALTH_SCALE[Math.max(0, Math.min(3, run.seats.length - 1))]; }
// 2026-10-26 (package FIN1, RES4-3): the boss and floors carry the Tidelock Vault's aqua names (ids unchanged: matriarch, roost, galleries, pools).
// The fight-only cards of a floor: the Tidewarden (a copy of its base card under her own name, her Health scaled with the party).
function floorOverlay(run, idx){
  const f = floorDef(run, idx), out = {};
  if(f && f.boss && run.defs[f.boss.base]){ const src = run.defs[f.boss.base], id = f.boss.base + '~gdboss';
    out[id] = Object.assign({}, src, {id, nameKey: f.boss.nameKey, name: f.boss.name || 'The Tidewarden', attack: (src.attack || 0) + (f.boss.atkAdd || 0),
      health: Math.max(1, Math.round((src.health || 1) * (f.boss.hpMult || 2) * healthScale(run))), cost: 0, wait: 0, rarity: 'epic', gdBoss: true}); }
  return out;
}
function bossIdOf(run, idx){ const f = floorDef(run, idx); return f && f.boss ? f.boss.base + '~gdboss' : null; }

function loadSeat(run, seat){ const fl = run.fl, pl = fl.players[1], ctx = fl.ctx[seat]; SEAT_KEYS.forEach(k=>{ pl[k] = ctx[k]; }); fl.loaded = seat; }
function saveSeat(run){ const fl = run.fl, pl = fl.players[1], seat = fl.loaded; if(!seat) return; const ctx = fl.ctx[seat]; SEAT_KEYS.forEach(k=>{ ctx[k] = pl[k]; }); fl.loaded = null; }
function withSeat(run, seat, fn){ loadSeat(run, seat); try{ return fn(run.fl.players[1]); } finally { saveSeat(run); } }
// The seat whose hand and Lumber take what the round's combat gives the party (draws, Bounty ...): it rotates through the seats.
function leadSeat(run){ const ids = run.seats.map(s=> s.seat); return ids[(Math.max(1, run.fl.round) - 1) % ids.length]; }

function startFloor(run, idx){
  const f = floorDef(run, idx); if(!f) throw new Error('no floor ' + idx);
  run.floorIdx = idx;
  const rnd = mulberry32(mixSeed(run.seed, idx + 1, 0xF100));
  const defs = Object.assign({}, run.defs, floorOverlay(run, idx));
  const E = run.makeSimEngine(defs, rnd, {recordEvents: true, aiAim: true, aiLevel: 1, battleMode: 'open', reserveRows: 1, reserveActs: true, suddenDeathCastles: false, slotCols: run.cols, rules: f.rules || {}});
  const scale = healthScale(run);
  const partyHp = Math.max(10, Math.round(run.seats.reduce((t, s)=> t + s.castleHp, 0) * PARTY_CASTLE_SHARE));
  const dgHp = Math.max(10, Math.round(f.castle * scale));
  const players = {1: E.newPlayer(1, {}, {id: 'gd-party', name: 'Party', health: partyHp, effects: {}}),
    2: E.newPlayer(2, f.deck, {id: 'gd-' + f.key, name: f.key, health: dgHp, effects: {}})};
  const fl = run.fl = {E, defs, players, stats: {}, round: 1, over: null, reason: null, ctx: {}, loaded: null, events: [], lastRound: null,
    mech: {kind: f.mech || null, marked: null, markedFor: null}, rowDeck: [], uidSeat: {}};
  // each seat's deck (shuffled by the floor's engine, in seat order) and its opening hand of 3
  run.seats.forEach(s=>{ const tmp = E.newPlayer(1, s.deck); const ctx = {}; SEAT_KEYS.forEach(k=>{ ctx[k] = tmp[k]; }); ctx.deck = tmp.deck; ctx.hand = []; fl.ctx[s.seat] = ctx; });
  run.seats.forEach(s=> withSeat(run, s.seat, pl=> E.draw(pl, 3, 'A', fl.stats, [])));
  E.draw(players[2], 3, 'B', fl.stats, []);
  // the back row's own deck (the floor's cards, shuffled): it plays into the dungeon's second row from round 2, as the raid's rows
  const ids = Object.keys(f.deck).sort(); ids.forEach(id=>{ for(let i = 0; i < (f.deck[id] | 0); i++) fl.rowDeck.push(id); });
  const rr = mulberry32(mixSeed(run.seed, idx + 1, 0xB0A7)); for(let k = fl.rowDeck.length - 1; k > 0; k--){ const j = Math.floor(rr() * (k + 1)); [fl.rowDeck[k], fl.rowDeck[j]] = [fl.rowDeck[j], fl.rowDeck[k]]; }
  const boss = bossIdOf(run, idx); if(boss) E.debugSpawnCard(players, sideOf, 2, boss, 0, fl.stats, []);
  return fl;
}

// Mechanics telegraphed for the round being planned: the cursed centre (even rounds), the marked column (the Matriarch's smack).
function curseOn(run, round){ return run.fl && run.fl.mech.kind === 'curse' && (round % 2 === 0); }
function planCells(run, seat){
  const round = run.fl ? run.fl.round : 1;
  return cellsFor(seat, run.size).filter(c=> !(c.slot === SHARED_COL && curseOn(run, round)));
}
function cardAt(run, pid, row, slot){
  const pl = run.fl.players[pid]; if(!row) return run.fl.E.allBoardCards(pl).find(c=> c.hp > 0 && c.slot === slot) || null;
  const rw = pl.reserve && pl.reserve[row - 1]; return rw && rw[slot] && rw[slot].hp > 0 ? rw[slot] : null;
}
function cellFree(run, row, slot){ return !cardAt(run, 1, row, slot); }
function noSlotCard(d){ return !!(d && (d.field || d.cardType === 'spell')); }

// Is this plan legal for the seat right now? plan: {pitch: uid|null, play: {uid, row, slot}|null}. A pitch comes first, so its Lumber pays.
function checkPlan(run, seat, plan){
  const fl = run.fl; if(!fl || fl.over) return {ok: false, why: 'over'};
  if(!fl.ctx[seat]) return {ok: false, why: 'seat'};
  plan = plan || {};
  return withSeat(run, seat, pl=>{
    const hand = pl.hand, E = fl.E;
    let extra = 0;
    if(plan.pitch != null){ const h = hand.find(x=> x.uid === plan.pitch); if(!h) return {ok: false, why: 'pitch'}; extra = 1; }
    if(plan.play){ const p = plan.play, h = hand.find(x=> x.uid === p.uid); if(!h || h.uid === plan.pitch) return {ok: false, why: 'card'};
      const d = fl.defs[h.defId] || {};
      pl.lumber += extra; const can = E.canPlay(pl, h.defId, h.uid); pl.lumber -= extra;
      if(!can) return {ok: false, why: 'cost'};
      if(!noSlotCard(d)){
        if(p.row === 1 && (d.cardType === 'equipment' || d.cardType === 'hazard' || d.evolute)) return {ok: false, why: 'row'};
        if(!planCells(run, seat).some(c=> c.row === p.row && c.slot === p.slot)) return {ok: false, why: 'cell'};
        if(!cellFree(run, p.row, p.slot) && d.cardType !== 'equipment' && !d.evolute) return {ok: false, why: 'taken'};
      }
    }
    return {ok: true};
  });
}
// The cells a hand card can go to this round (for the page's highlights). [] for a field / spell card (no cell: playCell = null).
function legalCellsFor(run, seat, uid, pitchUid){
  const r = checkPlan(run, seat, {pitch: pitchUid != null ? pitchUid : null, play: {uid, row: -1, slot: 99}});
  if(!r.ok && r.why !== 'cell') return {ok: false, why: r.why, cells: []};
  const h = run.fl.ctx[seat].hand.find(x=> x.uid === uid), d = h ? run.fl.defs[h.defId] : null;
  if(noSlotCard(d)) return {ok: true, cells: [], noCell: true};
  return {ok: true, cells: planCells(run, seat).filter(c=> checkPlan(run, seat, {pitch: pitchUid != null ? pitchUid : null, play: {uid, row: c.row, slot: c.slot}}).ok)};
}

// The CPU ally's plan (and a dropped player's, while they are away): its best affordable unit into a free cell of its own, the one
// facing an enemy first, centre-most; nothing it can afford -> it pitches its dearest card. Seeded, so tests repeat.
function cpuPlan(run, seat, salt){
  const fl = run.fl; if(!fl || fl.over || !fl.ctx[seat]) return {};
  const rnd = mulberry32(mixSeed(run.seed, run.floorIdx + 1, fl.round, SEATS.indexOf(seat) + 1, salt | 0));
  const hand = fl.ctx[seat].hand.slice(), defs = fl.defs;
  const score = h=>{ const d = defs[h.defId] || {}; return (d.attack || 0) + (d.health || 0) * 0.6 - (d.wait || 0) * 0.5 + rnd() * 0.01; };
  const cells = planCells(run, seat).filter(c=> cellFree(run, c.row, c.slot));
  const facing = c=> !!(cardAt(run, 2, 0, c.slot) || cardAt(run, 2, 1, c.slot));
  const tryPlay = pitch=>{
    const opts = hand.filter(h=> h.uid !== pitch).sort((a, b)=> score(b) - score(a));
    for(const h of opts){ const d = defs[h.defId] || {};
      if(d.cardType === 'equipment' || d.cardType === 'hazard' || d.evolute || d.cardType === 'materia') continue;
      if(noSlotCard(d)){ if(checkPlan(run, seat, {pitch, play: {uid: h.uid}}).ok) return {uid: h.uid}; continue; }
      const order = cells.slice().sort((a, b)=> (facing(b) - facing(a)) || (a.shared - b.shared) || byCentre(a.slot, b.slot) || (a.row - b.row));
      for(const c of order){ if(checkPlan(run, seat, {pitch, play: {uid: h.uid, row: c.row, slot: c.slot}}).ok) return {uid: h.uid, row: c.row, slot: c.slot}; }
    }
    return null;
  };
  let play = tryPlay(null); if(play) return {pitch: null, play};
  if(!hand.length) return {};
  const dear = hand.slice().sort((a, b)=> ((defs[b.defId] || {}).cost || 0) - ((defs[a.defId] || {}).cost || 0) || a.uid - b.uid)[0];
  play = tryPlay(dear.uid);
  return {pitch: dear.uid, play: play || null};
}

// One round. plans: {A: {pitch, play, lock}, ...}; a seat with no plan passes. `lock` orders a shared-cell contest (the lower one locked
// first and takes the cell; the other card stays in hand, nothing paid). Plays land A, B, C, D, then the dungeon plays, the floor's
// mechanic, combat, and the draws. Returns {round, bumped, refused, ended, reason, events}.
function resolveRound(run, plans){
  const fl = run.fl; if(!fl || fl.over) return null;
  const E = fl.E, players = fl.players, stats = fl.stats, events = [], round = fl.round, f = floorDef(run);
  plans = plans || {};
  const hp0 = {party: players[1].hq.hp, dungeon: players[2].hq.hp};
  if(round > 1){ loadSeat(run, leadSeat(run)); try{ E.roundStart(players, round, sideOf, stats, events); } finally { saveSeat(run); } }
  run.seats.forEach(s=>{ const c = fl.ctx[s.seat]; c.playedThisTurn = false; c.discardUsedThisTurn = false; c.playsThisTurn = 0; c.darkUsed = 0; });
  // the shared-cell contest
  const bumped = [], refused = [], claim = {};
  run.seats.forEach(s=>{ const p = plans[s.seat] && plans[s.seat].play; if(!p || !isSharedCell(run.size, p.slot) || p.row == null) return;
    const k = p.row + ':' + p.slot, lk = Number(plans[s.seat].lock); const cur = claim[k];
    if(!cur || (isFinite(lk) ? lk : 1e9) < cur.lock) claim[k] = {seat: s.seat, lock: isFinite(lk) ? lk : 1e9}; });
  run.seats.forEach(s=>{
    const plan = plans[s.seat]; if(!plan) return;
    loadSeat(run, s.seat);
    try{
      const pl = players[1];
      if(plan.pitch != null && !pl.discardUsedThisTurn){ const h = pl.hand.find(x=> x.uid === plan.pitch); if(h) E.pitchCard(players, sideOf, 1, h, stats, events); }
      const p = plan.play;
      if(p && p.uid != null){
        const h = pl.hand.find(x=> x.uid === p.uid), d = h ? fl.defs[h.defId] || {} : null;
        if(!h) refused.push({seat: s.seat, uid: p.uid, why: 'card'});
        else if(!noSlotCard(d) && isSharedCell(run.size, p.slot) && claim[p.row + ':' + p.slot] && claim[p.row + ':' + p.slot].seat !== s.seat) bumped.push({seat: s.seat, uid: p.uid, row: p.row, slot: p.slot});
        else if(!noSlotCard(d) && !planCells(run, s.seat).some(c=> c.row === p.row && c.slot === p.slot)) refused.push({seat: s.seat, uid: p.uid, why: 'cell'});
        else {
          const ok = E.placeCard(players, sideOf, 1, p.uid, noSlotCard(d) ? 'center' : p.slot, stats, events, noSlotCard(d) ? undefined : {reserve: p.row ? p.row : 0, freeSlot: true});
          if(!ok) refused.push({seat: s.seat, uid: p.uid, why: 'engine'});
          else { const ev = [...events].reverse().find(e=> e.type === 'play' && e.side === 'A' && e.defId === h.defId); if(ev && ev.uid != null) fl.uidSeat[ev.uid] = s.seat; }
        }
      }
    } finally { saveSeat(run); }
  });
  // the dungeon: its front row plays as any CPU; its second row takes a card from its own deck from round 2 (two with 4 seats). From here
  // to the end of the mechanic the lead seat stands in for the party (its hand and Lumber take what the dungeon's turn and combat give).
  let over = false; loadSeat(run, leadSeat(run));
  try{
  E.aiTakeTurn(players, sideOf, 2, stats, events);
  if(round >= 2){ const n = run.size === 4 ? 2 : 1, rw = players[2].reserve && players[2].reserve[0];
    for(let k = 0; k < n && rw && fl.rowDeck.length; k++){
      if(Object.keys(rw).filter(sl=> rw[sl] && rw[sl].hp > 0).length >= (run.size === 4 ? 4 : 2)) break;
      const free = run.cols.filter(sl=> !rw[sl]); if(!free.length) break;
      const ahead = free.filter(sl=> cardAt(run, 2, 0, sl)), pick = (ahead.length ? ahead : free).sort(byCentre)[0];
      const id = fl.rowDeck.shift(), c = E.fillReserve(players[2], 1, pick, id);
      if(c) events.push({type: 'gdRowPlay', side: 'B', defId: id, uid: c.uid, row: 1, slot: pick}); } }
  // combat, then the floor's mechanic
  over = E.resolveCombat(players, sideOf, stats, events, round % 2 === 0 ? 1 : 2);
  if(!over) mechAfterCombat(run, round, events);
  } finally { saveSeat(run); }
  over = over || players[1].hq.hp <= 0 || players[2].hq.hp <= 0;
  let ended = null, reason = null;
  if(over){ ended = players[2].hq.hp <= 0 ? 'won' : 'lost'; reason = ended === 'won' ? 'castle' : 'party'; }
  else if(round >= FLOOR_ROUNDS){ ended = 'lost'; reason = 'time'; }
  if(!ended){ run.seats.forEach(s=> withSeat(run, s.seat, pl=> E.draw(pl, 1, 'A', stats, events))); E.draw(players[2], 1, 'B', stats, events); fl.round = round + 1; }
  else { fl.over = ended; fl.reason = reason; run.results[run.floorIdx] = ended; }
  const out = {round, bumped, refused, ended, reason, dmg: {party: Math.max(0, hp0.party - players[1].hq.hp), dungeon: Math.max(0, hp0.dungeon - players[2].hq.hp)},
    kills: events.filter(e=> e.type === 'death' || e.type === 'kill').length};
  fl.events = events; fl.lastRound = out;
  return out;
}
function mechAfterCombat(run, round, events){
  const fl = run.fl, E = fl.E, players = fl.players, k = fl.mech.kind; if(!k) return;
  const hit = (cards, dmg, kind)=>{ const live = cards.filter(c=> c && c.hp > 0); if(!live.length) return;
    live.forEach(c=> E.damageCardFlat(c, dmg, 'true', null)); events.push({type: 'gdMech', kind, dmg, uids: live.map(c=> c.uid)});
    E.removeDeadCards(players, sideOf, {}, fl.stats, events); };
  const front = ()=> E.allBoardCards(players[1]).filter(c=> c.hp > 0 && !c.gap), back = ()=> Object.values((players[1].reserve || [])[0] || {}).filter(c=> c && c.hp > 0);
  if(k === 'caveIn' && round >= MECH.caveIn.from && (round - MECH.caveIn.from) % MECH.caveIn.every === 0){
    const a = front(), b = back(); if(a.length || b.length) hit(a.length >= b.length ? a : b, MECH.caveIn.dmg, 'caveIn'); }
  if(k === 'curse' && curseOn(run, round)) hit(front().concat(back()).filter(c=> c.slot === SHARED_COL), MECH.curse.dmg, 'curse');
  if(k === 'smack'){
    if(fl.mech.marked != null && fl.mech.markedFor === round){ const col = fl.mech.marked; fl.mech.marked = null; fl.mech.markedFor = null;
      hit(front().concat(back()).filter(c=> c.slot === col), MECH.smack.dmg, 'smack'); }
    else if(fl.mech.marked == null && round % MECH.smack.every === 1){ // mark a column for the next round, weighted by the party's units in it
      const r = mulberry32(mixSeed(run.seed, run.floorIdx + 1, round, 0x5AC))(), units = front().concat(back());
      const w = run.cols.map(sl=> ({sl, n: units.filter(c=> c.slot === sl).length})).filter(x=> x.n > 0);
      if(w.length){ const tot = w.reduce((t, x)=> t + x.n, 0); let acc = 0, pick = w[w.length - 1].sl; for(const x of w){ acc += x.n / tot; if(r < acc){ pick = x.sl; break; } }
        fl.mech.marked = pick; fl.mech.markedFor = round + 1; events.push({type: 'gdMark', slot: pick, round: round + 1}); } }
  }
}

// ---- what the page draws (and what a rejoining player gets): plain data
const UNIT_KEYS = ['uid', 'defId', 'hp', 'maxHp', 'atk', 'baseAtk', 'wait', 'slot', 'shield', 'armor', 'poison', 'bleed', 'decay', 'stunned', 'frozen', 'asleep', 'blind', 'webbed', 'isLeader'];
function unitView(run, c, row){ const o = {}; UNIT_KEYS.forEach(k=>{ if(c[k] != null && c[k] !== false && c[k] !== 0) o[k] = c[k]; }); o.hp = c.hp; o.atk = c.atk; o.slot = c.slot; o.row = row; const s = run.fl.uidSeat[c.uid]; if(s) o.seat = s; return o; }
function boardView(run, pid){
  const pl = run.fl.players[pid], E = run.fl.E;
  const front = E.allBoardCards(pl).filter(c=> c && !c.gap && c.hp > 0).map(c=> unitView(run, c, 0));
  const back = Object.values((pl.reserve || [])[0] || {}).filter(c=> c && c.hp > 0).map(c=> unitView(run, c, 1));
  return front.concat(back).sort((a, b)=> a.row - b.row || a.slot - b.slot);
}
function viewOf(run){
  const fl = run.fl; if(!fl) return null;
  const f = floorDef(run), P = fl.players;
  const seats = {}; run.seats.forEach(s=>{ const c = fl.ctx[s.seat];
    seats[s.seat] = {name: s.name, cpu: s.cpu, hand: c.hand.map(h=> ({uid: h.uid, defId: h.defId})), deck: c.deck.length, lumber: c.lumber || 0, stone: c.stone || 0, metal: c.metal || 0, grace: c.grace || 0, devilry: c.devilry || 0}; });
  const extra = {}; const dd = fl.E.derivedDefs || {}; [boardView(run, 1), boardView(run, 2)].forEach(list=> list.forEach(u=>{ if(!run.defs[u.defId] && (fl.defs[u.defId] || dd[u.defId])) extra[u.defId] = fl.defs[u.defId] || dd[u.defId]; }));
  return {v: 1, floorIdx: run.floorIdx, floorKey: f.key, floorCount: run.floorCount, round: fl.round, roundCap: FLOOR_ROUNDS, size: run.size, cols: run.cols.slice(),
    mech: {kind: fl.mech.kind, cursed: curseOn(run, fl.round), marked: fl.mech.marked}, over: fl.over, reason: fl.reason, results: run.results.slice(),
    party: {hp: Math.max(0, P[1].hq.hp), maxHp: P[1].hq.maxHp, shield: P[1].hq.shield || 0},
    dungeon: {hp: Math.max(0, P[2].hq.hp), maxHp: P[2].hq.maxHp, shield: P[2].hq.shield || 0, hand: P[2].hand.length, deck: P[2].deck.length},
    board: {party: boardView(run, 1), dungeon: boardView(run, 2)}, seats, last: fl.lastRound ? clone(fl.lastRound) : null, defsExtra: clone(extra)};
}
// The state's fingerprint (names, the last round's summary and display-only defs left out): equal on every machine in step.
function hashView(v){
  if(!v) return '';
  const core = {f: v.floorIdx, r: v.round, o: v.over, p: v.party, d: [v.dungeon.hp, v.dungeon.hand, v.dungeon.deck], m: v.mech,
    b: ['party', 'dungeon'].map(k=> v.board[k].map(u=> [u.uid, u.defId, u.hp, u.atk, u.row, u.slot, u.wait || 0].join(':')).join('|')),
    s: Object.keys(v.seats).sort().map(k=> [k, v.seats[k].hand.map(h=> h.uid + h.defId).join(','), v.seats[k].deck, v.seats[k].lumber].join('/'))};
  return hashStr(JSON.stringify(core));
}
function runHash(run){ return hashView(viewOf(run)); }

// ---- rewards (paid by each player's own game, through the existing currencies: Maple Leaves and Magic Dust; the last floor adds a
// pick of three cards from the dungeon's own cards, once a day)
function floorReward(dungeonId, idx){ const f = (DUNGEONS[dungeonId] || DUNGEONS.hollow).floors[idx]; return f ? Object.assign({}, f.reward) : null; }
function cardPool(dungeonId, defs){
  const dg = DUNGEONS[dungeonId] || DUNGEONS.hollow, ids = new Set();
  dg.floors.slice(Math.max(0, dg.poolFloor - 1)).forEach(f=> Object.keys(f.deck).forEach(id=> ids.add(id)));
  return [...ids].filter(id=> defs[id] && !defs[id].token && !defs[id].test).sort();
}
function bossPicks(dungeonId, defs, seed, who){
  const pool = cardPool(dungeonId, defs), r = mulberry32(mixSeed(seed, 0x91C6, ...String(who || '').split('').map(ch=> ch.charCodeAt(0)))), out = [];
  const left = pool.slice(); while(out.length < 3 && left.length){ out.push(left.splice(Math.floor(r() * left.length), 1)[0]); }
  return out;
}
// The texts the page asks for, by key (so a test can check every key exists)
const TEXT_KEYS = ['ui.ar3-dungeon-name', 'ui.ar3-floor-roost', 'ui.ar3-floor-galleries', 'ui.ar3-floor-pools', 'ui.ar3-floor-matriarch', 'ui.ar3-boss-name'];

// ============================================================================
// THE ROOM: transports and the session
// ============================================================================
// A transport: {send(msg), onMessage(fn), close(), kind}. Messages are plain objects {t: type, from: peerId, ...}.
// In-memory hub (tests, and the solo room): every connected peer gets every other peer's messages, asynchronously, in order.
function createHub(opts){
  opts = opts || {}; const peers = new Map(), dropped = new Set(), q = [];
  const defer = opts.defer || (fn=> setTimeout(fn, 0));
  let pumping = false;
  function pump(){ if(pumping) return; pumping = true; defer(()=>{ pumping = false; const batch = q.splice(0); batch.forEach(({to, msg})=>{ const p = peers.get(to); if(p && !dropped.has(to)) p.fns.forEach(fn=>{ try{ fn(clone(msg)); }catch(e){ if(opts.onError) opts.onError(e); else throw e; } }); }); if(q.length) pump(); }); }
  return {
    connect(id){ const me = {fns: []}; peers.set(id, me); dropped.delete(id);
      return {kind: 'hub', send(msg){ if(dropped.has(id)) return; peers.forEach((p, pid)=>{ if(pid !== id) q.push({to: pid, msg}); }); pump(); },
        onMessage(fn){ me.fns.push(fn); }, close(){ peers.delete(id); }}; },
    drop(id){ dropped.add(id); }, restore(id){ dropped.delete(id); }, peers(){ return [...peers.keys()].filter(id=> !dropped.has(id)); },
    flush(){ return new Promise(res=>{ const step = ()=> q.length || pumping ? defer(step) : res(); step(); }); },
  };
}
// Tabs of one browser (a local multi-tab room): BroadcastChannel (same origin only).
function broadcastChannelTransport(name, BC){
  BC = BC || (typeof BroadcastChannel !== 'undefined' ? BroadcastChannel : null); if(!BC) return null;
  const ch = new BC('bw-coop-' + name), fns = [];
  ch.onmessage = e=> fns.forEach(fn=>{ try{ fn(e.data); }catch(err){ console.error('coop', err); } });
  return {kind: 'local', send(msg){ try{ ch.postMessage(clone(msg)); }catch(e){} }, onMessage(fn){ fns.push(fn); }, close(){ try{ ch.close(); }catch(e){} }};
}
// Live: a Supabase Realtime broadcast channel (the Ranked Live host's own transport), topic coop-room-<room>.
// opts.private: a private channel (only the room's members, once supabase/proposed/20261023_coop_rooms_4p.sql is applied).
function supabaseTransport(sb, room, opts){
  if(!sb || !sb.channel) return null;
  const fns = [], ch = sb.channel('coop-room-' + room, {config: Object.assign({broadcast: {self: false}}, opts && opts.private ? {private: true} : {})});
  ch.on('broadcast', {event: 'coop'}, ({payload})=> fns.forEach(fn=>{ try{ fn(payload); }catch(err){ console.error('coop', err); } }));
  ch.subscribe();
  return {kind: 'live', send(msg){ try{ const r = ch.send({type: 'broadcast', event: 'coop', payload: msg}); if(r && r.catch) r.catch(()=>{}); }catch(e){} }, onMessage(fn){ fns.push(fn); }, close(){ try{ sb.removeChannel(ch); }catch(e){} }};
}

const PING_MS = 2000, DROP_MS = 8000;
// opts: {transport, me: {peerId, name, deck, castleHp}, host: bool, code, casual, size (2|4), deps: {makeSimEngine, defs}, clock, onEvent(kind, data),
//        maxHumans (4; 2 while a live room lacks the proposed SQL), autoPlan (tests: plan for my seat with the CPU logic)}
function createSession(opts){
  const clock = opts.clock || {now: ()=> Date.now(), setTimeout: (f, ms)=> setTimeout(f, ms), clearTimeout: id=> clearTimeout(id), setInterval: (f, ms)=> setInterval(f, ms), clearInterval: id=> clearInterval(id)};
  const T = opts.transport, me = Object.assign({}, opts.me), emit = (k, d)=>{ try{ opts.onEvent && opts.onEvent(k, d); }catch(e){ console.error('coop event', e); } };
  const S = {me, code: opts.code, isHost: !!opts.host, room: null, run: null, view: null, mode: 'idle', myPlan: null, locked: {}, lockSeq: 0, plans: {},
    deadline: 0, lastSeen: {}, timers: {}, startMsg: null, closed: false, epoch: 0, hovers: {}, history: [], maxHumans: opts.maxHumans || 4, floorPaused: false};
  function send(t, body){ if(S.closed) return; const msg = Object.assign({t, from: me.peerId, epoch: S.epoch}, body || {}); T.send(msg); return msg; }
  function mySeat(){ if(!S.room) return null; const k = SEATS.find(s=> S.room.seats[s] && S.room.seats[s].peerId === me.peerId); return k || null; }
  function humansIn(room){ return SEATS.filter(s=> room.seats[s] && !room.seats[s].cpu); }
  function freeSeat(room){ const cap = room.size === 4 ? JOIN_ORDER : JOIN_ORDER.filter(s=> s === 'A' || s === 'C');
    return cap.find(s=> !room.seats[s]) || cap.find(s=> room.seats[s] && room.seats[s].cpu) || null; }
  function newRoom(){ return {code: S.code, hostId: me.peerId, casual: !!opts.casual, size: opts.size === 4 ? 4 : 2, status: 'lobby', seats: {A: seatOf(me, true)}, epoch: S.epoch}; }
  function seatOf(p, connected){ return {peerId: p.peerId, name: p.name || '', deck: p.deck || {}, castleHp: p.castleHp || 20, ready: false, cpu: false, connected: connected !== false}; }
  function broadcastRoster(){ if(!S.isHost) return; S.room.epoch = S.epoch; send('roster', {room: S.room}); emit('roster', S.room); }
  function planSeconds(){ return S.room && S.room.casual ? PLAN_SECONDS.casual : PLAN_SECONDS.normal; }
  function seenNow(id){ S.lastSeen[id] = clock.now(); }

  // ---- lobby (host)
  function addHuman(p){
    const room = S.room; const at = SEATS.find(s=> room.seats[s] && room.seats[s].peerId === p.peerId);
    if(at){ Object.assign(room.seats[at], {name: p.name || room.seats[at].name, deck: p.deck || room.seats[at].deck, castleHp: p.castleHp || room.seats[at].castleHp, connected: true}); return at; }
    if(humansIn(room).length >= S.maxHumans) return null;
    if(humansIn(room).length >= 2 && room.size === 2) room.size = 4; // a 3rd player opens the right half
    const s = freeSeat(room); if(!s) return null; room.seats[s] = seatOf(p, true); return s;
  }
  function setCpu(seat, on){ // host: add / remove a CPU ally
    if(!S.isHost || !S.room || S.room.status !== 'lobby' || seat === 'A') return false;
    const cur = S.room.seats[seat]; if(cur && !cur.cpu) return false;
    if(on){ S.room.seats[seat] = {peerId: 'cpu-' + seat, name: '', cpu: true, ready: true, connected: true, deck: null}; } else delete S.room.seats[seat];
    if(SEATS.some(s=> (s === 'B' || s === 'D') && S.room.seats[s])) S.room.size = 4;
    broadcastRoster(); return true;
  }
  function setSize(n){ if(!S.isHost || !S.room || S.room.status !== 'lobby') return; if(n === 2 && humansIn(S.room).length > 2) return; S.room.size = n === 4 ? 4 : 2;
    if(S.room.size === 2){ delete S.room.seats.B; delete S.room.seats.D; } broadcastRoster(); }
  function setCasual(on){ if(!S.isHost || !S.room || S.room.status !== 'lobby') return; S.room.casual = !!on; broadcastRoster(); }
  // the host's own Start is its ready; every other player must be ready and here
  function canStart(){ const r = S.room; if(!S.isHost || !r || r.status !== 'lobby') return false; return humansIn(r).filter(s=> r.seats[s].peerId !== me.peerId).every(s=> r.seats[s].ready && r.seats[s].connected); }

  // ---- the fight
  function runSeats(room){ const size = room.size, list = [];
    seatsFor(size).forEach(s=>{ const x = room.seats[s]; list.push(x && !x.cpu ? {seat: s, name: x.name, deck: x.deck, castleHp: x.castleHp, cpu: false} : {seat: s, cpu: true, name: '', deck: null, castleHp: 20}); });
    return list; }
  function buildRun(start){
    const run = createRun({makeSimEngine: opts.deps.makeSimEngine, defs: opts.deps.defs, seed: start.seed, size: start.size, dungeonId: start.dungeonId, seats: start.seats});
    run.humans = Math.max(1, start.seats.filter(s=> !s.cpu).length); return run; }
  function enterFloor(idx){
    S.locked = {}; S.plans = {}; S.myPlan = null; S.lockSeq = 0; S.floorPaused = false;
    // a fresh floor is a fresh deterministic fight, so a player who came back mid-floor (mirroring) is in step again from here
    if(S.startMsg && opts.deps && S.defsOk !== false){
      try{ if(!S.run) S.run = buildRun(S.startMsg); startFloor(S.run, idx); S.mode = 'lockstep'; S.view = viewOf(S.run); }catch(e){ console.error('coop floor', e); S.mode = 'mirror'; }
    } else { S.mode = 'mirror'; if(!S.isHost) send('sync', {}); }
    emit('floor', {idx, view: S.view});
  }
  function start(){ // host
    if(!canStart()) return false;
    const r = S.room; r.status = 'playing';
    SEATS.forEach(s=>{ if(r.seats[s] && r.seats[s].cpu && !seatsFor(r.size).includes(s)) delete r.seats[s]; });
    const seed = (opts.seed != null ? opts.seed : Math.floor(Math.random() * 4294967295)) >>> 0;
    const startMsg = {seed, size: r.size, dungeonId: 'hollow', seats: runSeats(r), defsHash: opts.deps.defsHash || ''};
    S.startMsg = startMsg; broadcastRoster(); send('start', {start: startMsg});
    emit('start', startMsg); S.run = null; S.mode = 'lockstep'; enterFloor(0); openRound(); return true;
  }
  function humanSeatsNow(){ return S.run ? S.run.seats.filter(s=> !s.cpu).map(s=> s.seat) : []; }
  function seatConnected(seat){ const x = S.room && S.room.seats[seat]; return !!(x && !x.cpu && x.connected); }
  function openRound(){ // host
    if(!S.isHost || !S.run || !S.run.fl || S.run.fl.over) return;
    S.locked = {}; S.plans = {}; S.lockSeq = 0; S.myPlan = null; S.hovers = {};
    const ms = planSeconds() * 1000; S.deadline = clock.now() + ms;
    clearRoundTimer(); S.timers.round = clock.setTimeout(()=> resolveNow('timer'), ms);
    send('turn', {floor: S.run.floorIdx, round: S.run.fl.round, ms});
    emit('turn', {floor: S.run.floorIdx, round: S.run.fl.round, ms});
    maybeAutoPlan();
  }
  function clearRoundTimer(){ if(S.timers.round){ clock.clearTimeout(S.timers.round); S.timers.round = null; } }
  function lockPlan(seat, plan){ // host: a seat's plan arrives
    if(!S.run || !S.run.fl || S.run.fl.over || S.locked[seat]) return;
    const ok = checkPlan(S.run, seat, plan); const clean = ok.ok ? {pitch: plan.pitch != null ? plan.pitch : null, play: plan.play || null} : {};
    S.plans[seat] = Object.assign(clean, {lock: ++S.lockSeq}); S.locked[seat] = true;
    send('lock', {seat, round: S.run.fl.round}); emit('lock', {seat});
    if(humanSeatsNow().filter(seatConnected).every(s=> S.locked[s])) resolveNow('all');
  }
  function resolveNow(why){ // host
    if(!S.isHost || !S.run || !S.run.fl || S.run.fl.over) return;
    clearRoundTimer();
    const plans = {}; let seq = S.lockSeq;
    S.run.seats.forEach(s=>{
      if(S.plans[s.seat]) plans[s.seat] = S.plans[s.seat];
      else if(s.cpu || !seatConnected(s.seat)) plans[s.seat] = Object.assign(cpuPlan(S.run, s.seat), {lock: ++seq, cpu: true});
      else plans[s.seat] = {lock: ++seq, pass: true}; // no play in time = pass (D49)
    });
    const floor = S.run.floorIdx, round = S.run.fl.round;
    const res = resolveRound(S.run, plans); S.view = viewOf(S.run); const hash = hashView(S.view);
    S.history.push({floor, round, hash});
    send('round', {floor, round, plans, hash, ended: res.ended});
    emit('round', {res, view: S.view, plans, why});
    if(res.ended) floorEnded(res.ended); else openRound();
  }
  function floorEnded(result){
    S.floorPaused = true;
    const idx = S.view ? S.view.floorIdx : 0, last = !!(S.view && idx >= S.view.floorCount - 1);
    emit('floorEnd', {idx, result, view: S.view, last});
    if(S.isHost && (result !== 'won' || last)) finish(result === 'won' ? 'cleared' : 'lost'); // the others hear it in 'end'
  }
  function nextFloor(){ // host: the party goes on (the host presses Continue)
    if(!S.isHost || !S.run || !S.run.fl || S.run.fl.over !== 'won' || S.run.floorIdx >= S.run.floorCount - 1) return false;
    const idx = S.run.floorIdx + 1; send('next', {idx}); enterFloor(idx); openRound(); return true;
  }
  function finish(how){ if(S.room) S.room.status = 'done'; S.mode = S.mode === 'idle' ? 'idle' : S.mode; if(S.isHost) send('end', {how}); emit('end', {how, view: S.view}); }

  // ---- my own plan (any seat)
  function submitPlan(plan){
    const seat = mySeat(); if(!seat || !S.view || S.view.over) return false;
    if(S.run && S.run.fl && S.mode === 'lockstep'){ const ok = checkPlan(S.run, seat, plan); if(!ok.ok) return ok; }
    S.myPlan = plan || {};
    if(S.isHost) lockPlan(seat, S.myPlan); else send('plan', {seat, floor: S.view.floorIdx, round: S.view.round, plan: S.myPlan});
    S.locked[seat] = true; emit('lock', {seat, mine: true}); return {ok: true};
  }
  function maybeAutoPlan(){ if(!opts.autoPlan) return; const seat = mySeat(); if(!seat || !S.run || !S.run.fl || S.run.fl.over) return;
    const delay = typeof opts.autoPlan === 'number' ? opts.autoPlan : 0;
    const go = ()=>{ if(S.locked[seat] || !S.run.fl || S.run.fl.over) return; const p = cpuPlan(S.run, seat, 7); submitPlan({pitch: p.pitch != null ? p.pitch : null, play: p.play || null}); };
    if(delay) clock.setTimeout(go, delay); else go(); }
  function hover(cell){ const seat = mySeat(); if(!seat) return; send('hover', {seat, cell: cell || null}); }

  // ---- messages
  function onMsg(msg){
    if(S.closed || !msg || msg.from === me.peerId) return;
    seenNow(msg.from);
    switch(msg.t){
      case 'hello': if(S.isHost) onHello(msg); break;
      case 'roster': // the newest host term wins (host migration raises it)
        if(msg.room && (msg.epoch || 0) >= S.epoch && !(S.isHost && (msg.epoch || 0) === S.epoch)){ S.epoch = msg.epoch || 0; S.room = msg.room; S.isHost = msg.room.hostId === me.peerId; emit('roster', S.room);
          if(S.pendingReady && mySeat()){ const p = S.pendingReady; S.pendingReady = null; setReady(p.on, p.deck); } } break;
      case 'full': if(msg.to === me.peerId) emit('full', msg); break;
      case 'ready': if(S.isHost && S.room && S.room.status === 'lobby'){ const s = SEATS.find(k=> S.room.seats[k] && S.room.seats[k].peerId === msg.from); if(s){ S.room.seats[s].ready = !!msg.ready; if(msg.deck) S.room.seats[s].deck = msg.deck; broadcastRoster(); } } break;
      case 'leave': onLeave(msg.from, !!msg.host); break;
      case 'start': if(!S.isHost){ S.startMsg = msg.start; S.run = null; S.defsOk = !(opts.deps.defsHash && msg.start.defsHash && opts.deps.defsHash !== msg.start.defsHash); // other card data: mirror the host's state
        emit('start', msg.start); enterFloor(0); } break;
      case 'turn': if(!S.isHost){ S.deadline = clock.now() + (msg.ms || 0); S.locked = {}; S.hovers = {}; S.myPlan = null; emit('turn', msg); if(S.run && S.run.fl && S.mode === 'lockstep' && S.run.fl.round !== msg.round) { S.mode = 'mirror'; send('sync', {}); } maybeAutoPlan(); } break;
      case 'plan': if(S.isHost && S.run && S.run.fl && msg.round === S.run.fl.round && msg.floor === S.run.floorIdx){ const s = SEATS.find(k=> S.room.seats[k] && S.room.seats[k].peerId === msg.from); if(s && s === msg.seat) lockPlan(s, msg.plan || {}); } break;
      case 'lock': if(!S.isHost){ S.locked[msg.seat] = true; emit('lock', {seat: msg.seat}); } break;
      case 'hover': S.hovers[msg.seat] = msg.cell; emit('hover', {seat: msg.seat, cell: msg.cell}); break;
      case 'round': if(!S.isHost) onRound(msg); break;
      case 'sync': if(S.isHost && S.view) send('state', {to: msg.from, view: S.view, start: S.startMsg, room: S.room, history: S.history.length}); break;
      case 'state': if(!S.isHost && (msg.to === me.peerId || !msg.to)){ if(msg.room) S.room = msg.room; if(msg.start) S.startMsg = msg.start;
        // still in step (same state as the host's)? keep running the fight; else mirror the host until the next floor
        const inStep = S.mode === 'lockstep' && S.run && S.run.fl && msg.view && hashView(viewOf(S.run)) === hashView(msg.view);
        if(!inStep && msg.view){ S.mode = 'mirror'; S.view = msg.view; emit('state', {view: S.view}); } } break;
      case 'next': if(!S.isHost){ enterFloor(msg.idx); } break;
      case 'end': if(!S.isHost){ if(S.room) S.room.status = 'done'; emit('end', {how: msg.how, view: S.view}); } break;
      case 'ping': // two hosts (the old one was cut off and came back): the newer host term keeps the room, then the one further on, then the earlier seat
        if(S.isHost && msg.host && S.room && S.room.status !== 'done'){
          const seatOfP = id=> JOIN_ORDER.indexOf(SEATS.find(k=> S.room.seats[k] && S.room.seats[k].peerId === id) || 'B');
          const theirs = msg.hist || 0, mine = S.history.length, te = msg.epoch || 0;
          if(te > S.epoch || (te === S.epoch && (theirs > mine || (theirs === mine && seatOfP(msg.from) < seatOfP(me.peerId))))){ S.isHost = false; S.room.hostId = msg.from; clearRoundTimer(); emit('hostChanged', {hostId: msg.from}); rejoinHello(); } }
        break;
    }
  }
  function onHello(msg){
    const room = S.room, p = msg.peer || {};
    if(room.status === 'lobby'){ const s = addHuman(Object.assign({}, p, {peerId: msg.from})); if(!s){ send('full', {to: msg.from}); return; } broadcastRoster(); return; }
    // playing: only a seat-holder may come back (they get the state, and play from the next floor in step)
    const s = SEATS.find(k=> room.seats[k] && room.seats[k].peerId === msg.from);
    if(!s){ send('full', {to: msg.from}); return; }
    room.seats[s].connected = true; broadcastRoster();
    send('state', {to: msg.from, view: S.view, start: S.startMsg, room});
  }
  function onLeave(peerId, wasHost){
    if(!S.room) return; const s = SEATS.find(k=> S.room.seats[k] && S.room.seats[k].peerId === peerId); if(!s) return;
    if(S.isHost){ if(S.room.status === 'lobby') delete S.room.seats[s]; else S.room.seats[s].connected = false; broadcastRoster();
      if(S.room.status === 'playing' && S.run && S.run.fl && !S.run.fl.over && humanSeatsNow().filter(seatConnected).every(x=> S.locked[x])) resolveNow('left'); return; }
    if(wasHost || S.room.hostId === peerId){ S.room.seats[s].connected = false; migrate(peerId); }
  }
  // The host is gone (left or silent for DROP_MS): the first connected player in seat order (A, C, D, B) takes over. In step (it runs
  // the same engine), the fight goes on from the round being planned; a player only mirroring (came back mid-floor) ends the run
  // cleanly instead, floors cleared so far kept.
  function migrate(oldHost){
    const room = S.room; if(!room) return;
    const cand = JOIN_ORDER.find(s=>{ const x = room.seats[s]; if(!x || x.cpu || x.peerId === oldHost) return false; return x.peerId === me.peerId || (clock.now() - (S.lastSeen[x.peerId] || 0) < DROP_MS); });
    const x = cand && room.seats[cand]; if(!x || x.peerId !== me.peerId){ emit('hostLost', {waitingFor: x ? x.peerId : null}); return; }
    // hearing nobody at all may mean it is ME who is cut off: with other players in the room, take over only if one of them is heard
    const others = SEATS.map(k=> room.seats[k]).filter(y=> y && !y.cpu && y.peerId !== me.peerId && y.peerId !== oldHost);
    if(others.length && !others.some(y=> clock.now() - (S.lastSeen[y.peerId] || 0) < DROP_MS)){ emit('hostLost', {cutOff: true}); return; }
    S.isHost = true; S.epoch += 1; room.hostId = me.peerId; room.epoch = S.epoch;
    SEATS.forEach(k=>{ if(room.seats[k] && room.seats[k].peerId === oldHost){ if(room.status === 'lobby') delete room.seats[k]; else room.seats[k].connected = false; } });
    broadcastRoster(); emit('hostChanged', {hostId: me.peerId});
    if(room.status === 'playing'){
      if(S.mode === 'lockstep' && S.run && S.run.fl){ if(!S.run.fl.over) openRound(); else if(S.run.fl.over === 'won' && S.run.floorIdx < S.run.floorCount - 1){ S.floorPaused = true; emit('floorEnd', {idx: S.run.floorIdx, result: 'won', view: S.view, resumed: true}); } }
      else finish('hostLeft');
    }
  }
  function onRound(msg){
    if(S.mode === 'lockstep' && S.run && S.run.fl && msg.floor === S.run.floorIdx && msg.round === S.run.fl.round){
      const res = resolveRound(S.run, msg.plans); S.view = viewOf(S.run); const hash = hashView(S.view);
      S.history.push({floor: msg.floor, round: msg.round, hash});
      if(hash !== msg.hash){ S.mode = 'mirror'; emit('desync', {mine: hash, host: msg.hash}); send('sync', {}); }
      emit('round', {res, view: S.view, plans: msg.plans});
      if(res && res.ended) floorEnded(res.ended);
    } else { send('sync', {}); emit('round', {view: S.view, plans: msg.plans, mirror: true}); if(msg.ended){ S.floorPaused = true; emit('floorEnd', {idx: msg.floor, result: msg.ended, view: S.view}); } }
  }
  T.onMessage(onMsg);

  // ---- heartbeat: who is still here
  function tick(){
    if(S.closed) return; send('ping', {host: S.isHost, hist: S.history.length}); const now = clock.now();
    if(!S.room) return;
    if(S.isHost){ let changed = false;
      SEATS.forEach(k=>{ const x = S.room.seats[k]; if(!x || x.cpu || x.peerId === me.peerId) return; const gone = now - (S.lastSeen[x.peerId] || 0) > DROP_MS;
        if(gone && x.connected){ if(S.room.status === 'lobby') delete S.room.seats[k]; else x.connected = false; changed = true; } });
      if(changed){ broadcastRoster(); if(S.room.status === 'playing' && S.run && S.run.fl && !S.run.fl.over && humanSeatsNow().filter(seatConnected).every(x=> S.locked[x])) resolveNow('dropped'); }
    } else if(S.room.hostId && S.room.status !== 'done' && now - (S.lastSeen[S.room.hostId] || now) > DROP_MS){ migrate(S.room.hostId); }
  }
  S.timers.ping = clock.setInterval(tick, PING_MS);

  // ---- open / join / leave
  if(S.isHost){ S.room = newRoom(); emit('roster', S.room); }
  else { send('hello', {peer: {name: me.name, deck: me.deck, castleHp: me.castleHp}}); }
  function setReady(on, deck){ const seat = mySeat(); if(!seat){ S.pendingReady = {on: !!on, deck: deck || null}; return; } if(deck) me.deck = deck; // before my seat is known: sent once the roster names it
    if(S.isHost){ S.room.seats[seat].ready = !!on; if(deck) S.room.seats[seat].deck = deck; broadcastRoster(); } else send('ready', {ready: !!on, deck: deck || null}); }
  function leave(){ if(S.closed) return; send('leave', {host: S.isHost}); close(); }
  function close(){ S.closed = true; clearRoundTimer(); if(S.timers.ping) clock.clearInterval(S.timers.ping); try{ T.close(); }catch(e){} }
  function rejoinHello(){ S.lastSeen = {}; send('hello', {peer: {name: me.name, deck: me.deck, castleHp: me.castleHp}}); }
  Object.assign(S, {mySeat, setReady, setCpu, setSize, setCasual, canStart, start, submitPlan, nextFloor, leave, close, hover, rejoinHello, tick, resolveNow, _onMsg: onMsg,
    planLeftMs: ()=> Math.max(0, S.deadline - clock.now()), humansIn: ()=> S.room ? humansIn(S.room) : []});
  return S;
}

// A short room code (6 letters / digits, no look-alikes: the coop_rooms check ^[A-Z0-9]{6}$)
function newRoomCode(rnd){ rnd = rnd || Math.random; const A = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'; let s = ''; for(let i = 0; i < 6; i++) s += A[Math.floor(rnd() * A.length)]; return s; }
// The cards a room's fight reads, fingerprinted (each player's game must hold the same card data for the fight to run in step)
function defsHash(defs, ids){ const list = [...new Set(ids)].sort().map(id=>{ const d = defs[id] || {}; return [id, d.attack, d.health, d.cost, d.wait, JSON.stringify(d.effects || {})].join(';'); }); return hashStr(list.join('|')); }
function roomCardIds(decks){ const ids = new Set(); Object.values(DUNGEONS).forEach(dg=> dg.floors.forEach(f=>{ Object.keys(f.deck).forEach(id=> ids.add(id)); if(f.boss) ids.add(f.boss.base); })); (decks || []).forEach(d=> Object.keys(d || {}).forEach(id=> ids.add(id))); return [...ids]; }

const api = {SEATS, SEAT_ROW, JOIN_ORDER, COLS_4, COLS_2, SHARED_COL, HEALTH_SCALE, PARTY_CASTLE_SHARE, FLOOR_ROUNDS, PLAN_SECONDS, ENERGY_COST, SEAT_KEYS, DUNGEONS, MECH, TEXT_KEYS,
  PING_MS, DROP_MS, boardSize, seatsFor, colsFor, cellsFor, isSharedCell, createRun, startFloor, resolveRound, checkPlan, legalCellsFor, planCells, cpuPlan, curseOn, viewOf, hashView, runHash,
  floorReward, cardPool, bossPicks, floorOverlay, bossIdOf, healthScale, createHub, broadcastChannelTransport, supabaseTransport, createSession, newRoomCode, defsHash, roomCardIds, mulberry32, mixSeed};
if(typeof module !== 'undefined' && module.exports) module.exports = api;
if(root) root.BramblewoodCoop = api;
})(typeof window !== 'undefined' ? window : (typeof globalThis !== 'undefined' ? globalThis : null));
