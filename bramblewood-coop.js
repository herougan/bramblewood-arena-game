// ============================================================================
// Bramblewood Group Dungeon (2026-10-28, package COOP2; owner K12, 10-27 11:22: "Tidelock Vault - ... It should be a normal game, but
// like, raid, it has 2-4 players (not selectable depends on the multi-dungeon type.) In this version, allies can place in allied spots.
// (Placing a card shows up as you placing your card in your friend's screens. locking that slot. If there's ever a race condition,
// smaller index player takes priority)").
//
// Replaces package AR3's co-op board (2026-10-23: its own board drawn in an overlay, plans locked at the same time on a 30 s timer, a
// shared centre column, cave-ins / cursed centre / marked columns, a pick of three after the boss). The fight is now the NORMAL fight on
// the normal battle board, built the way a raid is: the dungeon's floor (its deck, its bramble, the Tidewarden on the last floor) is the
// enemy side; the party is engine player 1 with one shared bramble and a row per player, as the raid's allies have their rows.
// DOM-free: inlined into the page (global `BramblewoodCoop`) and require()'d by the tests.
//
// Three parts:
//   1. THE TYPES: a group dungeon has a fixed player count (`players`) in its definition; the lobby never asks.
//   2. THE TABLE (createTable / applyAct / headlessRound): the rules glue on top of the engine. Each seat keeps its own deck, hand, Lumber
//      and turn flags (SEAT_KEYS), swapped into the party player while that seat acts. A seat owns its row (seat 0 the front, seat 1 the
//      middle ...), and may also play into an ally's empty slots. Same seed + same acts in the same order = the same fight everywhere.
//   3. THE ROOM (createSession + transports): lobby, then an ordered log of acts. Every placement goes to the host as a claim; the host
//      gathers the claims of one moment (batchMs), takes them lower player index first, checks each against the board, numbers the good
//      ones (seq) and sends them to everyone; every client applies the acts in seq order to its own engine (the page animates them as a
//      normal play, or as the ally's play). A claim on a slot already taken is refused and its card stays in the player's hand.
// ============================================================================
(function(root){
'use strict';

// ---- 1. the group-dungeon types. `players` is fixed per type (K12: "not selectable depends on the multi-dungeon type").
// The Tidelock Vault is a 2-player type (COOP2, decision COOP2-1): a raid board has three rows a side at most (engine reserveRows <= 2),
// so a row per player fits 2 or 3; two is the first type because two friends is the room the live coop_rooms row (host + guest_id) and
// join_coop_room already seat, with no new SQL, and a 2-player floor is the easiest to tune first. A 3-player type is one more row
// (layout 'rows'); 4 players needs split rows (two seats a row), not built yet.
// `id` stays 'hollow' (the text keys ui.ar3-* and the save keys use it); the floors' names and the boss are FIN1's aqua names.
const DUNGEONS = {
  hollow: {id: 'hollow', nameKey: 'ui.ar3-dungeon-name', icon: '🌊', players: 2, layout: 'rows', roundCap: 20, poolFloor: 3,
    // the party's bramble: every player's bramble Health added up (the raid's merged bramble); the vault's scaled by the party (D49 steps)
    healthScale: [1, 1.7, 2.3, 2.8],
    floors: [
      {key: 'roost', nameKey: 'ui.ar3-floor-roost', icon: '🦇', castle: 24,
        deck: {'baby-bat': 4, 'cave-swiftlet': 3, 'vampire-bat': 3, 'cave-flitter': 3, 'upside-down-bat': 3, 'voltwing-bat': 2, 'fruit-bat-familiar': 2}},
      {key: 'galleries', nameKey: 'ui.ar3-floor-galleries', icon: '⛏️', castle: 26,
        deck: {'quarry-mole': 4, 'star-nosed-mole': 3, 'ore-smelter-mole': 3, 'cave-cricket': 3, 'cave-centipede': 3, 'tiny-cave-dweller': 2, 'deep-cave-troll': 2}},
      {key: 'pools', nameKey: 'ui.ar3-floor-pools', icon: '🦎', castle: 21,
        deck: {'cave-olm': 3, 'alpine-salamander': 3, 'fire-salamander': 3, 'glimmer-spider': 3, 'glowworm-cluster': 2, 'whip-spider': 2, 'velvet-worm': 2, 'magma-salamander': 2}},
      {key: 'matriarch', nameKey: 'ui.ar3-floor-matriarch', icon: '👑', castle: 28, boss: {base: 'cave-warlord', nameKey: 'ui.ar3-boss-name', hpMult: 1.25, atkAdd: 0},
        deck: {'giant-cave-huntsman': 2, 'wolf-spider-mother': 2, 'trapdoor-spider': 2, 'deep-cave-troll': 2, 'glowing-gecko': 3, 'hollow-oath-keeper': 3, 'cave-bat-swarm': 2, 'arc-bat': 2, 'irradiated-glow-wyrm': 2}},
    ],
    // the raid's scoring (RaidM.contributionFor): bramble damage x perInFightHp, capped; a fallen bramble scores overwhelmCap; the rank
    // multiplies it. One entry a floor (deeper floors pay more), paid by each player's own game as a raid fight is (RAID_ATTEMPT_PAY).
    scoring: [{perInFightHp: 50, cap: 2000, overwhelmCap: 2500}, {perInFightHp: 50, cap: 2200, overwhelmCap: 3000},
      {perInFightHp: 50, cap: 2400, overwhelmCap: 3500}, {perInFightHp: 50, cap: 3000, overwhelmCap: 5000}]},
};
const ENERGY_COST = 5; // ⚡ per player per run (paid as the run starts; given back if no floor was cleared)
const COLS = [-3, -2, -1, 0, 1, 2, 3]; // the raid board's seven columns
// What each seat owns of the party player (swapped in while it acts). The board, bramble, Graveyard and Removal Zone are shared.
const SEAT_KEYS = ['deck', 'hand', 'lumber', 'stone', 'metal', 'uranium', 'pearls', 'grace', 'devilry', 'gold', 'elementalEnergy', 'playedThisTurn',
  'discardUsedThisTurn', 'playsTurn', 'playsThisTurn', 'darkUsed', 'fieldTurn', 'cardsPlayedEver', 'drawnTotal', '_openingDealt',
  'prayerTokens', 'prayerOfferTurn', 'firstUnitBonusUsed'];
const TURN_FLAGS = {playedThisTurn: false, discardUsedThisTurn: false, playsThisTurn: 0, darkUsed: 0};

// ---- small helpers
function mulberry32(a){ return function(){ a |= 0; a = a + 0x6D2B79F5 | 0; let t = Math.imul(a ^ a >>> 15, 1 | a); t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t; return ((t ^ t >>> 14) >>> 0) / 4294967296; }; }
function mixSeed(){ let h = 0x811C9DC5; for(let i = 0; i < arguments.length; i++){ h ^= (Number(arguments[i]) >>> 0); h = Math.imul(h, 0x01000193) >>> 0; h ^= h >>> 13; } return h >>> 0; }
function hashStr(s){ let h = 2166136261; s = String(s); for(let i = 0; i < s.length; i++){ h ^= s.charCodeAt(i); h = Math.imul(h, 16777619); } return (h >>> 0).toString(36); }
function clone(o){ return o == null ? o : JSON.parse(JSON.stringify(o)); }
const sideOf = id=> id === 1 ? 'A' : 'B';
const byCentre = (a, b)=> Math.abs(a) - Math.abs(b) || a - b;
function typeOf(id){ return DUNGEONS[id] || DUNGEONS.hollow; }
function playersOf(id){ return typeOf(id).players; }
function rowOfSeat(typeId, seat){ return seat; } // layout 'rows': seat i plays from row i (0 front, 1 middle, 2 back)
function seatOfRow(typeId, row){ const n = playersOf(typeId); return row >= 0 && row < n ? row : null; }
function noSlotCard(d){ return !!(d && (d.field || d.cardType === 'spell')); }
// Cards that need a target the co-op table doesn't offer yet (equipment onto a unit, a hazard row, an evolute's base, a Parasite's host,
// a prayer offering): refused with a note (decision COOP2-3) instead of a half-working play.
function unsupportedCard(d){ return !!(d && (d.cardType === 'equipment' || d.cardType === 'hazard' || d.evolute || d.parasite || d.cardType === 'materia' || (d.effects && d.effects.prayer))); }

// ---- 2. the table
function floorDef(typeId, idx){ return typeOf(typeId).floors[idx]; }
// The fight-only card of the last floor: the Tidewarden, a copy of its base card under her own name, her Health scaled with the party.
function floorOverlay(typeId, idx, defs){
  const f = floorDef(typeId, idx), out = {}, t = typeOf(typeId);
  if(f && f.boss && defs[f.boss.base]){ const src = defs[f.boss.base], id = f.boss.base + '~gdboss', sc = t.healthScale[Math.max(0, Math.min(3, t.players - 1))];
    out[id] = Object.assign({}, src, {id, nameKey: f.boss.nameKey, name: f.boss.name || 'The Tidewarden', attack: (src.attack || 0) + (f.boss.atkAdd || 0),
      health: Math.max(1, Math.round((src.health || 1) * (f.boss.hpMult || 2) * sc)), cost: 0, wait: 0, rarity: 'epic', gdBoss: true}); }
  return out;
}
function bossIdOf(typeId, idx){ const f = floorDef(typeId, idx); return f && f.boss ? f.boss.base + '~gdboss' : null; }

// Seat swapping. T.loaded is the seat whose keys are in players[1] right now (the page keeps its own seat loaded at rest).
function saveSeat(T){ const s = T.loaded; if(s == null) return; const pl = T.players[1], ctx = T.ctx[s]; SEAT_KEYS.forEach(k=>{ ctx[k] = pl[k]; }); T.loaded = null; }
function loadSeat(T, s){ const pl = T.players[1], ctx = T.ctx[s]; SEAT_KEYS.forEach(k=>{ pl[k] = ctx[k]; }); T.loaded = s; }
function withSeat(T, s, fn){
  if(T.loaded === s) return fn(T.players[1]);
  const was = T.loaded; saveSeat(T); loadSeat(T, s);
  try{ return fn(T.players[1]); } finally { saveSeat(T); if(was != null) loadSeat(T, was); }
}
function seatData(T, s){ return T.loaded === s ? T.players[1] : T.ctx[s]; } // read-only look at a seat
// The seat whose hand and Lumber take what the round gives the party as a whole (a Bounty, a draw from a skill): it turns each round.
function leadSeat(T){ return (Math.max(1, T.round) - 1) % T.n; }

// The engine the page and the tests drive: the real one, with the round's four entry points run as the lead seat, every seat drawing
// its card, and every seat's turn flags cleared as a round starts. Everything else is the engine as it is.
function coopEngine(T){
  const E = T.E, W = Object.create(E);
  const asLead = fn=> function(){ const a = arguments; return withSeat(T, leadSeat(T), ()=> fn.apply(E, a)); };
  W.aiTakeTurn = asLead(E.aiTakeTurn); W.resolveCombat = asLead(E.resolveCombat);
  W.roundStart = function(players, round, sOf, stats, events){
    T.round = round; T.passed = {};
    for(let s = 0; s < T.n; s++) withSeat(T, s, pl=> Object.assign(pl, TURN_FLAGS));
    return withSeat(T, leadSeat(T), ()=> E.roundStart(players, round, sOf, stats, events));
  };
  W.draw = function(pl, n, side, stats, events){
    if(pl !== T.players[1]) return E.draw(pl, n, side, stats, events);
    for(let s = 0; s < T.n; s++) withSeat(T, s, p=> E.draw(p, n, side, stats, events));
  };
  return W;
}

// opts: {makeSimEngine, defs, seed, typeId, floorIdx, seats:[{name, deck, leader, castleHp, cpu}], partyCastle (character object, the
// page's merged brambles), brambleHp (fn: a printed bramble Health at the game's scale), aiLevel, rest (the seat kept loaded), recordEvents}
function createTable(opts){
  const t = typeOf(opts.typeId), n = t.players, idx = opts.floorIdx | 0, f = t.floors[idx]; if(!f) throw new Error('no floor ' + idx);
  const given = (opts.seats || []).slice(0, n);
  const firstDeck = (given.find(s=> s && !s.cpu && s.deck && Object.keys(s.deck).length) || given.find(s=> s && s.deck && Object.keys(s.deck).length) || {}).deck || {};
  const seats = []; for(let i = 0; i < n; i++){ const s = given[i] || {cpu: true};
    seats.push({seat: i, name: s.name || '', cpu: !!s.cpu, deck: Object.assign({}, Object.keys(s.deck || {}).length ? s.deck : firstDeck), leader: s.leader || null, castleHp: Math.max(1, Number(s.castleHp) || 20)}); }
  const seed = (Number(opts.seed) >>> 0) || 1, bh = opts.brambleHp || (x=> x);
  const defs = Object.assign({}, opts.defs, floorOverlay(opts.typeId, idx, opts.defs));
  const rnd = mulberry32(mixSeed(seed, idx + 1, 0xF100));
  const E = opts.makeSimEngine(defs, rnd, {recordEvents: opts.recordEvents !== false, aiAim: true, aiLevel: opts.aiLevel != null ? opts.aiLevel : 1, battleMode: 'open',
    reserveRows: n - 1, reserveActs: true, suddenDeathCastles: false, slotCols: COLS, rules: f.rules || {}});
  const scale = t.healthScale[Math.max(0, Math.min(3, n - 1))];
  const pc = opts.partyCastle || {}, partyHp = Math.max(10, Number(pc.health) || seats.reduce((a, s)=> a + s.castleHp, 0));
  const players = {1: E.newPlayer(1, {}, Object.assign({}, pc, {id: pc.id || 'gd-party', name: pc.name || 'Party', health: partyHp, effects: pc.effects || {}})),
    2: E.newPlayer(2, f.deck, {id: 'gd-' + f.key, name: f.key, health: Math.max(10, Math.round(bh(f.castle) * scale)), effects: {}})};
  const T = {v: 2, typeId: t.id, seed, floorIdx: idx, floorKey: f.key, n, seats, E, defs, players, stats: {}, ctx: {}, loaded: null, round: 1, passed: {},
    over: null, reason: null, cap: t.roundCap, aiLevel: opts.aiLevel != null ? opts.aiLevel : 1};
  // each seat's deck (shuffled by the floor's engine, in seat order), then its opening hand of 3
  seats.forEach(s=>{ const tmp = E.newPlayer(1, s.deck), ctx = {}; SEAT_KEYS.forEach(k=>{ ctx[k] = tmp[k]; }); ctx.hand = []; T.ctx[s.seat] = ctx; });
  seats.forEach(s=> withSeat(T, s.seat, pl=> E.draw(pl, 3, 'A', T.stats, [])));
  E.draw(players[2], 3, 'B', T.stats, []);
  const boss = bossIdOf(t.id, idx); if(boss) E.debugSpawnCard(players, sideOf, 2, boss, 0, T.stats, []);
  // every player's leader opens in the centre of its own row, as the raid's three leaders do (and holds the row)
  T.leaderUids = {};
  seats.forEach(s=>{ const id = s.leader; if(!id || !defs[id]) return; let c = null;
    if(s.seat === 0){ E.debugSpawnCard(players, sideOf, 1, id, 0, T.stats, []); c = E.allBoardCards(players[1]).find(x=> x.defId === id && x.slot === 0) || null; }
    else c = E.fillReserve(players[1], rowOfSeat(t.id, s.seat), 0, id);
    if(c){ c.isLeader = true; c.coopSeat = s.seat; if(s.seat > 0) c.holdRow = true; T.leaderUids[s.seat] = c.uid; } });
  T.W = coopEngine(T);
  loadSeat(T, opts.rest != null ? opts.rest : 0);
  return T;
}

// ---- where a card may go
function unitAt(T, row, slot){
  const pl = T.players[1]; if(!row) return T.E.allBoardCards(pl).find(c=> c && !c.gap && c.hp > 0 && c.slot === slot) || null;
  const rw = pl.reserve && pl.reserve[row - 1]; return rw && rw[slot] && rw[slot].hp > 0 ? rw[slot] : null;
}
// Whose a board unit is: the seat that played it (coopSeat; a leader too), else the row's player (a token a skill made there).
function ownerOf(T, c, row){ return c && c.coopSeat != null ? c.coopSeat : seatOfRow(T.typeId, row); }
// The free slots of one row, by the normal game's rule (the centre, or beside one of the row's units), inside the seven columns.
// 2026-10-30 (package COOP3, owner W10: "You can also place cards in your allies' rows and vice versa if you have a card adjacent. However
// you cannot use your allies' 'network' to place cards."): with a seat, the row's free slots FOR THAT PLAYER (the engine's ownedCells):
// beside a unit of their own (left, right, or the same column one row in front or behind), in any row, plus the centre of their own
// row; an ally's units open nothing for them. Without a seat: the old any-unit rule (kept for callers that only ask "is it free").
function rowLegalSlots(T, row, seat){
  if(seat != null && T.E.ownedCells){ const home = rowOfSeat(T.typeId, seat);
    return T.E.ownedCells(T.players[1], (c, r)=> ownerOf(T, c, r) === seat, home).filter(x=> x.row === row && COLS.includes(x.slot)).map(x=> x.slot); }
  if(!row) return T.E.legalSlots(T.players[1]).filter(sl=> COLS.includes(sl));
  const rw = (T.players[1].reserve || [])[row - 1]; if(!rw) return [];
  const occ = new Set(Object.keys(rw).map(Number).filter(sl=> rw[sl] && rw[sl].hp > 0)), out = new Set();
  if(!occ.has(0)) out.add(0);
  occ.forEach(sl=> [sl - 1, sl + 1].forEach(x=>{ if(!occ.has(x) && !rw[x]) out.add(x); }));
  return [...out].filter(sl=> COLS.includes(sl) && !rw[sl]).sort((a, b)=> a - b);
}
function allCells(T, seat){ const out = []; for(let r = 0; r < T.n; r++) rowLegalSlots(T, r, seat).forEach(slot=> out.push({row: r, slot, owner: seatOfRow(T.typeId, r)})); return out; } // + COOP3: a seat's cells
function seatDone(T, s){ return !!(T.passed[s] || seatData(T, s).playedThisTurn); }
// Is this act legal right now? act: {kind:'play', seat, uid, row, slot} | {kind:'pitch', seat, uid} | {kind:'pass', seat}
function checkAct(T, act){
  if(!act || T.over) return {ok: false, why: 'over'};
  const s = act.seat; if(!(s >= 0 && s < T.n)) return {ok: false, why: 'seat'};
  if(act.kind === 'pass') return seatDone(T, s) ? {ok: false, why: 'done'} : {ok: true};
  return withSeat(T, s, pl=>{
    const h = pl.hand.find(x=> x.uid === act.uid); if(!h) return {ok: false, why: 'card'};
    if(act.kind === 'pitch') return pl.discardUsedThisTurn || T.passed[s] ? {ok: false, why: 'pitched'} : {ok: true};
    if(act.kind !== 'play') return {ok: false, why: 'kind'};
    const d = T.defs[h.defId] || {};
    if(unsupportedCard(d)) return {ok: false, why: 'unsupported'};
    if(T.passed[s] || (pl.playedThisTurn && !d.field)) return {ok: false, why: 'done'};
    if(!T.E.canPlay(pl, h.defId, h.uid)) return {ok: false, why: 'cost'};
    if(noSlotCard(d)) return {ok: true, noCell: true};
    if(!(act.row >= 0 && act.row < T.n) || !rowLegalSlots(T, act.row, s).includes(act.slot)) return {ok: false, why: unitAt(T, act.row, act.slot) ? 'taken' : 'cell'}; // + COOP3: beside a unit of this seat's own
    return {ok: true};
  });
}
// Apply one act to the table (the engine call), as seat act.seat. Returns {ok, why, events, uid (the board unit's), defId}.
function applyAct(T, act, events){
  events = events || [];
  const r = checkAct(T, act); if(!r.ok) return {ok: false, why: r.why, events};
  const s = act.seat;
  if(act.kind === 'pass'){ T.passed[s] = true; return {ok: true, events}; }
  return withSeat(T, s, pl=>{
    const E = T.E, h = pl.hand.find(x=> x.uid === act.uid);
    if(act.kind === 'pitch'){ const pr = E.pitchCard(T.players, sideOf, 1, h, T.stats, events); return {ok: !!pr, events, defId: h.defId, pitch: pr}; }
    const d = T.defs[h.defId] || {}, noCell = noSlotCard(d);
    const ok = E.placeCard(T.players, sideOf, 1, act.uid, noCell ? 'center' : act.slot, T.stats, events, noCell ? undefined : (act.row ? {reserve: act.row, freeSlot: true} : {freeSlot: true}));
    if(!ok) return {ok: false, why: 'engine', events};
    const ev = [...events].reverse().find(e=> e.type === 'play' && e.side === 'A' && e.defId === h.defId);
    const c = ev && ev.uid != null ? (unitAt(T, act.row | 0, act.slot) || null) : null;
    if(c && c.uid === ev.uid){ c.coopSeat = s; if(act.row > 0) c.holdRow = true; } // its row is its player's: it holds it, as a raid ally's unit does
    return {ok: true, events, uid: ev ? ev.uid : null, defId: h.defId, noCell};
  });
}
// The CPU ally's turn (a solo player's partner, or a player who dropped): its best affordable unit into its own row, centre first; with
// nothing it can afford it pitches its dearest card and tries again; then it passes if it has not played. cpuChoice is its next act
// without changing anything; cpuActs plays the whole turn (apply: how each act lands, applyAct by default). Seeded by the table alone.
function cpuChoice(T, s){
  if(T.over || seatDone(T, s)) return null;
  const defs = T.defs, row = rowOfSeat(T.typeId, s);
  return withSeat(T, s, pl=>{
    const score = h=>{ const d = defs[h.defId] || {}; return (d.attack || 0) + (d.health || 0) * 0.6 - (d.wait || 0) * 0.5; };
    const hand = pl.hand.filter(h=>{ const d = defs[h.defId] || {}; return !unsupportedCard(d) && !noSlotCard(d) && T.E.canPlay(pl, h.defId, h.uid); }).sort((a, b)=> score(b) - score(a) || a.uid - b.uid);
    // 2026-10-30 (package COOP3, W10): the cells this seat may use (its own units' network, any row), its own row first, then nearest the centre
    const cells = allCells(T, s).sort((a, b)=> (a.row !== row) - (b.row !== row) || byCentre(a.slot, b.slot));
    if(hand.length && cells.length) return {kind: 'play', seat: s, uid: hand[0].uid, row: cells[0].row, slot: cells[0].slot};
    if(!pl.discardUsedThisTurn && pl.hand.length && cells.length){ const d0 = pl.hand.slice().sort((a, b)=> ((defs[b.defId] || {}).cost || 0) - ((defs[a.defId] || {}).cost || 0) || a.uid - b.uid)[0]; return {kind: 'pitch', seat: s, uid: d0.uid}; }
    return {kind: 'pass', seat: s};
  });
}
function cpuActs(T, s, apply){
  apply = apply || (a=> applyAct(T, a)); const out = [];
  for(let k = 0; k < 6; k++){ const a = cpuChoice(T, s); if(!a) break; out.push(a); const r = apply(a); if(!r || r.ok === false){ if(a.kind !== 'pass'){ const p = {kind: 'pass', seat: s}; out.push(p); apply(p); } break; } }
  return out;
}
// The round, without the page: what the page's aiActNow + resolveRound do to the engine, in the same order (the page runs these same
// engine calls through T.W), so a headless client and a page stay in step. Returns {over, winner, reason}.
function headlessRound(T, events){
  events = events || []; const W = T.W, P = T.players;
  if(W.setAiLevel) W.setAiLevel(T.aiLevel);
  W.aiTakeTurn(P, sideOf, 2, T.stats, events);
  if(W.setSuddenDeath) W.setSuddenDeath(false, T.round >= 25 ? 2 : 1); // the page's rule with a 20-turn cap: never sudden death
  let over = W.resolveCombat(P, sideOf, T.stats, events, T.round % 2 === 0 ? 1 : 2), forced = null;
  if(!over && T.round >= T.cap){ over = true; forced = 0; }
  return finishRound(T, over, forced, events);
}
// After the combat: the result, or the next round's start (the page's resolveRoundCore tail). Shared with the page (it calls noteRound).
function finishRound(T, over, forced, events){
  const P = T.players;
  if(over){ const d1 = P[1].hq.hp <= 0, d2 = P[2].hq.hp <= 0; const winner = forced != null ? forced : (d1 && d2) ? 0 : d1 ? 2 : 1;
    T.over = winner === 1 ? 'won' : 'lost'; T.reason = forced === 0 ? 'time' : winner === 1 ? 'castle' : 'party'; return {over: T.over, winner, reason: T.reason}; }
  [1, 2].forEach(p=>{ P[p].playedThisTurn = false; P[p].discardUsedThisTurn = false; });
  T.W.roundStart(P, T.round + 1, sideOf, T.stats, events);
  T.W.draw(P[1], 1, 'A', T.stats, events); T.W.draw(P[2], 1, 'B', T.stats, events);
  return {over: null};
}
// The page tells the table how its round ended (it ran the same engine calls itself): {over: bool, winner, reason}
function noteRoundEnd(T, m){ if(!m || !m.over) return; T.over = m.winner === 1 ? 'won' : 'lost'; T.reason = m.reason || (m.winner === 1 ? 'castle' : m.winner === 2 ? 'party' : 'time'); }

// The state's fingerprint: equal on every machine in step (the seats read from wherever each one is, nothing moved).
const UNIT_KEYS = ['uid', 'defId', 'hp', 'atk', 'slot', 'wait', 'shield'];
function tableHash(T){
  if(!T) return ''; const P = T.players, E = T.E, u = c=> UNIT_KEYS.map(k=> c[k] == null ? '' : c[k]).join(':');
  const side = p=> E.allBoardCards(P[p]).filter(c=> c && !c.gap && c.hp > 0).map(u).sort().join('|') + '#' + (P[p].reserve || []).map(rw=> Object.keys(rw).sort().map(k=> rw[k] && rw[k].hp > 0 ? u(rw[k]) : '').join(',')).join('/');
  const seats = []; for(let s = 0; s < T.n; s++){ const d = seatData(T, s); seats.push([s, d.hand.map(h=> h.uid + h.defId).join(','), d.deck.length, d.lumber || 0, d.playedThisTurn ? 1 : 0, T.passed[s] ? 1 : 0].join('/')); }
  return hashStr(JSON.stringify({f: T.floorIdx, r: T.round, o: T.over, hp: [P[1].hq.hp, P[2].hq.hp, P[1].hq.shield || 0, P[2].hq.shield || 0], b: [side(1), side(2)], s: seats, e: [P[2].hand.length, P[2].deck.length]}));
}

// ---- rewards, as the raid's (each player's game pays its own): the fight's rank on the party's bramble (S 90%+ ... SS unhurt, SSS
// unhurt and no unit lost), the bramble damage dealt x perInFightHp (or the overwhelm figure when the vault's bramble fell), times the
// rank (RaidM.raidRankMult); Maple Leaves and Magic Dust by the raid's RAID_ATTEMPT_PAY; a card drop at the raid's odds from the vault's
// own cards. The page does the paying; this is the arithmetic, so a test can check it.
const RANK_MULT = {B: 1.01, A: 1.1, S: 1.2, SS: 1.5, SSS: 2.0}, PAY = {goldPer: 48, dustPer: 190};
function rankFor(hp, maxHp, lost){
  if(!(hp > 0)) return null; const f = maxHp > 0 ? hp / maxHp : 0;
  const base = f >= 0.9 ? 'S' : f >= 0.7 ? 'A' : f >= 0.5 ? 'B' : f >= 0.3 ? 'C' : f >= 0.1 ? 'D' : 'E';
  if(base !== 'S' || hp < maxHp) return base; return lost ? 'SS' : 'SSS';
}
function floorPay(typeId, idx, o){
  const sc = typeOf(typeId).scoring[idx] || typeOf(typeId).scoring[0], mult = RANK_MULT[o.rank] || 1;
  const contribution = o.won ? Math.round(sc.overwhelmCap * mult) : Math.round(Math.max(0, Math.min(sc.cap, Math.round((o.dealt || 0) * sc.perInFightHp))) * mult);
  return {contribution, gold: Math.round(contribution / PAY.goldPer), dust: 3 * Math.round(contribution / PAY.dustPer), rank: o.rank || null};
}
function cardPool(dungeonId, defs){
  const dg = typeOf(dungeonId), ids = new Set();
  dg.floors.slice(Math.max(0, dg.poolFloor - 1)).forEach(f=> Object.keys(f.deck).forEach(id=> ids.add(id)));
  return [...ids].filter(id=> defs[id] && !defs[id].token && !defs[id].test).sort();
}
// The texts the page asks for, by key (so a test can check every key exists)
const TEXT_KEYS = ['ui.ar3-dungeon-name', 'ui.ar3-floor-roost', 'ui.ar3-floor-galleries', 'ui.ar3-floor-pools', 'ui.ar3-floor-matriarch', 'ui.ar3-boss-name'];

// ============================================================================
// 3. THE ROOM: transports and the session
// ============================================================================
// A transport: {send(msg), onMessage(fn), close(), kind}. Messages are plain objects {t: type, from: peerId, ...}.
// In-memory hub (tests, the solo room, an in-page second client): every peer gets every other peer's messages, asynchronously, in order.
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
// Live: a Supabase Realtime broadcast channel (the Ranked Live host's own transport), topic coop-room-<room>. Broadcast keeps one
// sender's messages in order; the host's seq numbers order everything else. opts.private: a private channel (members only, 4p SQL).
function supabaseTransport(sb, room, opts){
  if(!sb || !sb.channel) return null;
  const fns = [], ch = sb.channel('coop-room-' + room, {config: Object.assign({broadcast: {self: false}}, opts && opts.private ? {private: true} : {})});
  ch.on('broadcast', {event: 'coop'}, ({payload})=> fns.forEach(fn=>{ try{ fn(payload); }catch(err){ console.error('coop', err); } }));
  ch.subscribe();
  return {kind: 'live', send(msg){ try{ const r = ch.send({type: 'broadcast', event: 'coop', payload: msg}); if(r && r.catch) r.catch(()=>{}); }catch(e){} }, onMessage(fn){ fns.push(fn); }, close(){ try{ sb.removeChannel(ch); }catch(e){} }};
}

const PING_MS = 2000, DROP_MS = 8000, BATCH_MS = 120;
// The table every client builds for a floor: the start message (seed, seats) and the page's / test's deps.
function tableFor(start, idx, deps, rest){
  return createTable({makeSimEngine: deps.makeSimEngine, defs: deps.defs, seed: start.seed, typeId: start.typeId, floorIdx: idx, seats: start.seats, rest,
    partyCastle: deps.partyCastle ? deps.partyCastle(start.seats) : null, brambleHp: deps.brambleHp, recordEvents: deps.recordEvents});
}
// Apply one act without a page (tests, a client catching up): plays / pitches / passes on the table, a round by headlessRound.
function applyHeadless(T, act){
  if(act.kind === 'round') return headlessRound(T);
  return applyAct(T, act);
}

// opts: {transport, me: {peerId, name, deck, leader, castleHp}, host: bool, code, typeId, deps: {makeSimEngine, defs, defsHash, partyCastle, brambleHp},
//        clock, onEvent(kind, data), apply(act, T) -> result | Promise (the page; default applyHeadless), batchMs, seed, autoPlay (tests: the CPU
//        plays my seat), maxHumans (the live room's cap while the 4p SQL is missing)}
function createSession(opts){
  const clock = opts.clock || {now: ()=> Date.now(), setTimeout: (f, ms)=> setTimeout(f, ms), clearTimeout: id=> clearTimeout(id), setInterval: (f, ms)=> setInterval(f, ms), clearInterval: id=> clearInterval(id)};
  const T0 = opts.transport, me = Object.assign({}, opts.me), typeId = (DUNGEONS[opts.typeId] ? opts.typeId : 'hollow'), N = playersOf(typeId);
  const emit = (k, d)=>{ try{ opts.onEvent && opts.onEvent(k, d); }catch(e){ console.error('coop event', e); } };
  const batchMs = opts.batchMs != null ? opts.batchMs : BATCH_MS;
  const S = {me, code: opts.code, typeId, players: N, isHost: !!opts.host, room: null, T: null, startMsg: null, closed: false, epoch: 0,
    seq: 0, log: [], queue: [], busy: false, inbox: [], batchTimer: null, pending: {}, cidSeq: 0, lastSeen: {}, timers: {}, floorIdx: -1, results: [], ended: null,
    maxHumans: Math.min(N, opts.maxHumans || N), desyncs: 0, rejected: [], cpuT: {}, cpuKey: null};
  function send(t, body){ if(S.closed) return; const msg = Object.assign({t, from: me.peerId, epoch: S.epoch}, body || {}); T0.send(msg); return msg; }
  function mySeat(){ if(!S.room) return null; const i = S.room.seats.findIndex(x=> x && x.peerId === me.peerId); return i >= 0 ? i : null; }
  function humans(room){ return (room || S.room).seats.map((x, i)=> x && !x.cpu ? i : -1).filter(i=> i >= 0); }
  function seatOf(p, connected){ return {peerId: p.peerId, name: p.name || '', deck: p.deck || {}, leader: p.leader || null, castle: p.castle || null, castleHp: p.castleHp || 20, ready: false, cpu: false, connected: connected !== false}; }
  function newRoom(){ const seats = Array(N).fill(null); seats[0] = seatOf(me, true); return {code: S.code, hostId: me.peerId, typeId, players: N, status: 'lobby', seats, epoch: S.epoch}; }
  function broadcastRoster(){ if(!S.isHost) return; S.room.epoch = S.epoch; send('roster', {room: S.room}); emit('roster', S.room); }
  function seenNow(id){ S.lastSeen[id] = clock.now(); }
  function connected(i){ const x = S.room && S.room.seats[i]; return !!(x && !x.cpu && (x.connected !== false)); }

  // ---- lobby (host). Seats fill in order (the host is 0); a seat left empty at Start is a CPU ally.
  function addHuman(p){
    const room = S.room, at = room.seats.findIndex(x=> x && x.peerId === p.peerId);
    if(at >= 0){ Object.assign(room.seats[at], {name: p.name || room.seats[at].name, deck: p.deck || room.seats[at].deck, leader: p.leader || room.seats[at].leader, castle: p.castle || room.seats[at].castle, castleHp: p.castleHp || room.seats[at].castleHp, connected: true}); return at; }
    if(humans(room).length >= S.maxHumans) return null;
    const free = room.seats.findIndex((x, i)=> i > 0 && (!x || x.cpu)); if(free < 0) return null;
    room.seats[free] = seatOf(p, true); return free;
  }
  function canStart(){ const r = S.room; if(!S.isHost || !r || r.status !== 'lobby') return false; return humans(r).filter(i=> r.seats[i].peerId !== me.peerId).every(i=> r.seats[i].ready && r.seats[i].connected); }
  function start(){ // host
    if(!canStart()) return false;
    const r = S.room; r.status = 'playing';
    const seats = r.seats.map((x, i)=> x && !x.cpu ? {seat: i, name: x.name, deck: x.deck, leader: x.leader, castle: x.castle, castleHp: x.castleHp, cpu: false} : {seat: i, cpu: true, name: '', deck: null, leader: null, castle: null, castleHp: 20});
    r.seats = r.seats.map((x, i)=> x && !x.cpu ? x : {peerId: 'cpu-' + i, name: '', cpu: true, ready: true, connected: true});
    const seed = (opts.seed != null ? opts.seed : Math.floor(Math.random() * 4294967295)) >>> 0;
    S.startMsg = {seed, typeId, seats, defsHash: (opts.deps && opts.deps.defsHash) || ''};
    broadcastRoster(); send('start', {start: S.startMsg}); emit('start', S.startMsg);
    hostAct({kind: 'floor', idx: 0}); return true;
  }

  // ---- the act log. The host numbers acts; everyone applies them in seq order (the host too, through the same queue).
  function hostAct(a){ const act = Object.assign({}, a, {seq: ++S.seq}); if(act.kind === 'round') act.hash = S.T ? tableHash(S.T) : ''; send('act', {act}); enqueue(act); return act; }
  function enqueue(act){ S.queue.push(act); S.queue.sort((x, y)=> x.seq - y.seq); pump(); }
  async function pump(){
    if(S.busy || S.closed) return; S.busy = true;
    try{
      while(S.queue.length && !S.closed && !S.syncing){
        const want = S.log.length ? S.log[S.log.length - 1].seq + 1 : 1, act = S.queue[0];
        if(act.seq < want){ S.queue.shift(); continue; } // already applied (a resend)
        if(act.seq > want){ if(!S.isHost) requestSync('gap'); break; }
        S.queue.shift(); if(await applyOne(act) === 'stop') break; S.log.push(act);
      }
    } finally { S.busy = false; }
    if(S.isHost && !S.closed){ if(S.inbox.length && !S.batchTimer) S.batchTimer = clock.setTimeout(flush, 0); maybeRound(); }
  }
  async function applyOne(act){
    if(act.kind === 'floor'){ S.floorIdx = act.idx; S.pending = {}; S.T = null;
      if(S.startMsg && opts.deps && S.defsOk !== false){ try{ S.T = tableFor(S.startMsg, act.idx, opts.deps, mySeat() != null ? mySeat() : 0); }catch(e){ console.error('coop floor', e); } }
      emit('floor', {idx: act.idx, T: S.T}); maybeAutoPlay(); scheduleCpu(); return; } // + COOP3: the CPU allies' timers
    if(act.kind === 'end'){ S.ended = act.how; if(S.room) S.room.status = 'done'; emit('end', {how: act.how, results: S.results.slice()}); return; }
    const T = S.T; if(!T) return;
    if(act.kind === 'round'){
      // out of step with the host (it should never be): stop, ask for the host's log and rebuild the floor from it (catchUp)
      if(act.hash && act.hash !== tableHash(T) && !S.isHost){ S.desyncs++; emit('desync', {mine: tableHash(T), host: act.hash}); S.syncing = true; S.syncAsked = 0; requestSync('hash'); return 'stop'; }
      const res = await (opts.apply ? opts.apply(act, T, S) : applyHeadless(T, act));
      if(res && res.over && !T.over) noteRoundEnd(T, res);
      emit('round', {act, res, T});
      if(T.over){ S.results[T.floorIdx] = T.over; emit('floorEnd', {idx: T.floorIdx, result: T.over, reason: T.reason, T, last: T.floorIdx >= typeOf(typeId).floors.length - 1}); hostAfterFloor(); }
      else { maybeAutoPlay(); scheduleCpu(); } // + COOP3
      return;
    }
    // a play / pitch / pass: the host checked it; here it lands (the page draws it as that player's play)
    landAct(act);
  }
  // One play / pitch / pass landing (synchronously: the page draws it and returns, its animations run on their own)
  function landAct(act){
    const T = S.T, mine = act.cid && S.pending[act.cid]; if(mine) delete S.pending[act.cid];
    const res = opts.apply ? opts.apply(act, T, S) : applyHeadless(T, act);
    if(!res || res.ok === false){ S.desyncs++; emit('desync', {act, why: res && res.why}); }
    emit('act', {act, res, mine: !!mine});
    maybeAutoPlay();
    return res;
  }
  // The host, after each act: every player here is done -> the CPU seats (and players who dropped) take their turn, then the round.
  // 2026-10-30 (package COOP3, owner W4: "The allies should play their cards first if CPU btw, taking a random amount of time between 0.5 to
  // 3.0s. (0.5 to 1.5s in the first turn only)"): with opts.cpuDelay(T, seat) -> ms, the host gives each CPU seat its own timer as a floor
  // and each round begin; the CPU plays when it fires (in parallel with the players: they may play before it lands, and the round waits for
  // it). Its acts are numbered and logged like any other, so the delay is presentation only (every page and the catch-up replay the log).
  // Without opts.cpuDelay (the headless tests) the CPU seats play when the players are done, as before.
  function clearCpu(){ Object.keys(S.cpuT).forEach(k=> clock.clearTimeout(S.cpuT[k])); S.cpuT = {}; }
  function scheduleCpu(){
    const T = S.T; if(!opts.cpuDelay || !S.isHost || S.closed || !T || T.over || !S.room) return;
    const key = T.floorIdx + ':' + T.round; if(S.cpuKey === key) return;
    clearCpu(); S.cpuKey = key;
    S.room.seats.forEach((x, i)=>{ if(!x || !x.cpu || seatDone(T, i)) return; let ms = 0; try{ ms = Math.max(0, Number(opts.cpuDelay(T, i)) || 0); }catch(e){}
      S.cpuT[i] = clock.setTimeout(()=> cpuTurn(i, key), ms); });
  }
  function cpuTurn(i, key){
    const T = S.T; if(S.closed || !S.isHost || !T || T.over || S.cpuKey !== key){ delete S.cpuT[i]; return; }
    // a round still playing, or players' claims of this moment not landed yet (they go first: the lower index's race rule): a moment later
    if(S.busy || S.queue.length || S.inbox.length || S.batchTimer){ S.cpuT[i] = clock.setTimeout(()=> cpuTurn(i, key), 60); return; }
    delete S.cpuT[i];
    if(!seatDone(T, i)){ S.busy = true; try{ cpuActs(T, i, a=> hostLand(a)); } finally { S.busy = false; } }
    maybeRound();
  }
  function maybeRound(){
    const T = S.T; if(!S.isHost || !T || T.over || S.busy || S.queue.length || S.inbox.length || S.batchTimer) return;
    if(Object.keys(S.cpuT).length) return; // + COOP3: a CPU ally still taking its time; the round waits for it
    if(!humans().filter(connected).every(i=> seatDone(T, i))) return;
    S.busy = true;
    try{ for(let i = 0; i < N; i++){ if(!seatDone(T, i)) cpuActs(T, i, a=> hostLand(a)); } } // a CPU seat, or a player who is away
    finally { S.busy = false; }
    hostAct({kind: 'round'});
  }
  // The host lands an act at once (numbered, sent, applied, logged): a claim it accepted, or a CPU seat's act.
  function hostLand(a){ const act = Object.assign({}, a, {seq: ++S.seq}); send('act', {act}); const r = landAct(act); S.log.push(act); return r; }
  function hostAfterFloor(){
    if(!S.isHost) return; const T = S.T, last = T.floorIdx >= typeOf(typeId).floors.length - 1;
    if(T.over !== 'won' || last) hostAct({kind: 'end', how: T.over === 'won' ? 'cleared' : 'lost'});
  }
  function nextFloor(){ // host: the party goes on (the host presses Continue)
    const T = S.T; if(!S.isHost || !T || T.over !== 'won' || T.floorIdx >= typeOf(typeId).floors.length - 1) return false;
    hostAct({kind: 'floor', idx: T.floorIdx + 1}); return true;
  }

  // ---- claims: my placement goes to the host, which takes the claims of one moment lower index first
  function claim(c){
    const seat = mySeat(); if(seat == null || !S.T || S.T.over) return {ok: false, why: 'seat'};
    const act = Object.assign({}, c, {seat});
    const pend = Object.values(S.pending);
    if(act.kind === 'play' && pend.some(p=> p.kind === 'play' && p.row === act.row && p.slot === act.slot)) return {ok: false, why: 'taken'};
    if(pend.some(p=> p.uid != null && p.uid === act.uid) || (act.kind === 'pass' && pend.some(p=> p.kind === 'pass'))) return {ok: false, why: 'pending'};
    if(act.kind === 'play' && pend.some(p=> p.kind === 'play' && !p.field)) return {ok: false, why: 'done'};
    const ok = checkAct(S.T, act); if(!ok.ok) return ok;
    const cid = me.peerId + ':' + (++S.cidSeq); S.pending[cid] = Object.assign({cid}, act);
    if(S.isHost) hostInbox({seat, c: act, cid}); else send('claim', {seat, floor: S.floorIdx, c: act, cid});
    emit('pending', {cid, act}); return {ok: true, cid};
  }
  function hostInbox(item){ item.at = clock.now(); item.n = S.inbox.length; S.inbox.push(item); if(!S.batchTimer) S.batchTimer = clock.setTimeout(flush, batchMs); }
  // The claims of one moment (the batch window): lower player index first (K12's race rule), each checked against the board as the
  // ones before it landed, so of two claims on one slot the lower index lands and the other is refused (its card stays in hand).
  function flush(){
    S.batchTimer = null; if(!S.isHost || S.closed) return;
    if(S.busy || S.queue.length){ S.batchTimer = clock.setTimeout(flush, 30); return; } // a round still playing: the claims wait for it
    const batch = S.inbox.splice(0).sort((a, b)=> a.seat - b.seat || a.n - b.n);
    S.busy = true;
    try{
      batch.forEach(it=>{
        const T = S.T, act = Object.assign({}, it.c, {seat: it.seat, cid: it.cid});
        const r = T ? checkAct(T, act) : {ok: false, why: 'over'};
        if(!r.ok){ const u = T && act.kind === 'play' ? unitAt(T, act.row | 0, act.slot) : null, by = u && u.coopSeat != null ? u.coopSeat : null;
          send('reject', {to: it.seat, cid: it.cid, why: r.why, by}); onReject({cid: it.cid, why: r.why, by, seat: it.seat}); return; }
        hostLand(act); });
    } finally { S.busy = false; }
    maybeRound();
  }
  function onReject(m){
    if(m.seat !== mySeat()) return; const p = S.pending[m.cid]; delete S.pending[m.cid];
    S.rejected.push({cid: m.cid, why: m.why, by: m.by}); emit('reject', {cid: m.cid, why: m.why, by: m.by, act: p || null}); maybeAutoPlay(); // + COOP3 (2026-10-30): auto-play tries again after a refused claim
  }
  function requestSync(why){ if(S.syncAsked && clock.now() - S.syncAsked < 1500) return; S.syncAsked = clock.now(); send('sync', {why, have: S.log.length ? S.log[S.log.length - 1].seq : 0}); }
  // A client that fell out of step (a missed act, a rejoin): it rebuilds the floor from the start message and the host's act log.
  function catchUp(start, log){
    S.startMsg = start; S.queue = []; S.log = []; S.T = null;
    log = log || []; let T = null; const floorAt = [...log].reverse().find(a=> a.kind === 'floor') || {seq: Infinity};
    log.forEach(a=>{ if(a.kind === 'floor' && a === floorAt){ S.floorIdx = a.idx; T = tableFor(start, a.idx, opts.deps, mySeat() != null ? mySeat() : 0); S.T = T; }
      else if(T && a.seq > floorAt.seq && a.kind !== 'end') { const r = applyHeadless(T, a); if(a.kind === 'round' && T.over) S.results[T.floorIdx] = T.over; void r; }
      if(a.kind === 'end'){ S.ended = a.how; }
      S.log.push(a); });
    S.seq = S.log.length ? S.log[S.log.length - 1].seq : 0; S.pending = {}; S.syncing = false;
    emit('caughtUp', {T: S.T, ended: S.ended});
  }

  // ---- messages
  function onMsg(msg){
    if(S.closed || !msg || msg.from === me.peerId) return;
    seenNow(msg.from);
    switch(msg.t){
      case 'hello': if(S.isHost) onHello(msg); break;
      case 'roster': // the newest host term wins (host migration raises it)
        if(msg.room && (msg.epoch || 0) >= S.epoch && !(S.isHost && (msg.epoch || 0) === S.epoch)){ const wasHost = S.isHost; S.epoch = msg.epoch || 0; S.room = msg.room; S.isHost = msg.room.hostId === me.peerId; emit('roster', S.room);
          if(wasHost && !S.isHost) clearBatch();
          if(S.pendingReady && mySeat() != null){ const p = S.pendingReady; S.pendingReady = null; setReady(p.on, p.deck); }
          resendPending(); } break;
      case 'full': if(msg.to === me.peerId) emit('full', msg); break;
      case 'ready': if(S.isHost && S.room && S.room.status === 'lobby'){ const i = S.room.seats.findIndex(x=> x && x.peerId === msg.from); if(i >= 0){ S.room.seats[i].ready = !!msg.ready; if(msg.deck) S.room.seats[i].deck = msg.deck; if(msg.leader !== undefined) S.room.seats[i].leader = msg.leader; broadcastRoster(); } } break;
      case 'leave': onLeave(msg.from, !!msg.host); break;
      case 'start': if(!S.isHost){ S.startMsg = msg.start; S.defsOk = !(opts.deps && opts.deps.defsHash && msg.start.defsHash && opts.deps.defsHash !== msg.start.defsHash); emit('start', msg.start); } break;
      case 'act': if(!S.isHost || msg.epoch > S.epoch){ enqueue(msg.act); } break;
      case 'claim': if(S.isHost && msg.floor === S.floorIdx){ const i = S.room.seats.findIndex(x=> x && x.peerId === msg.from); if(i >= 0 && i === msg.seat) hostInbox({seat: i, c: msg.c, cid: msg.cid}); } break;
      case 'reject': if(msg.to === mySeat()) onReject({cid: msg.cid, why: msg.why, by: msg.by, seat: msg.to}); break;
      case 'sync': if(S.isHost && S.startMsg) send('state', {to: msg.from, start: S.startMsg, room: S.room, log: S.log}); break;
      case 'state': if(!S.isHost && msg.to === me.peerId){ if(msg.room) S.room = msg.room; catchUp(msg.start, msg.log || []); } break;
      case 'ping': // two hosts (one was cut off and took over alone): the longer act log keeps the room, then the newer host term, then the
        // lower seat; the other one stops hosting and catches up from it (its own acts while alone are dropped)
        if(S.isHost && msg.host && S.room && S.room.status !== 'done'){
          const seatOfP = id=> { const i = S.room.seats.findIndex(x=> x && x.peerId === id); return i < 0 ? 99 : i; };
          const theirs = msg.seq || 0, mine = S.seq, te = msg.epoch || 0;
          if(theirs > mine || (theirs === mine && (te > S.epoch || (te === S.epoch && seatOfP(msg.from) < seatOfP(me.peerId))))){ S.isHost = false; S.epoch = Math.max(S.epoch, te); S.room.hostId = msg.from; clearBatch(); emit('hostChanged', {hostId: msg.from}); rejoinHello(); }
          else if(te >= S.epoch){ S.epoch = te + 1; broadcastRoster(); } } // I keep the room: a newer term than theirs, so everyone follows mine
        break;
    }
  }
  function clearBatch(){ if(S.batchTimer){ clock.clearTimeout(S.batchTimer); S.batchTimer = null; } S.inbox = []; }
  function resendPending(){ if(S.isHost || !S.room || S.room.status !== 'playing') return; Object.values(S.pending).forEach(p=>{ send('claim', {seat: p.seat, floor: S.floorIdx, c: p, cid: p.cid}); }); }
  function onHello(msg){
    const room = S.room, p = msg.peer || {};
    if(room.status === 'lobby'){ const s = addHuman(Object.assign({}, p, {peerId: msg.from})); if(s == null){ send('full', {to: msg.from}); return; } broadcastRoster(); return; }
    // playing: only a seat-holder may come back (they get the start and the log, and catch up)
    const i = room.seats.findIndex(x=> x && x.peerId === msg.from); if(i < 0){ send('full', {to: msg.from}); return; }
    room.seats[i].connected = true; broadcastRoster(); send('state', {to: msg.from, start: S.startMsg, room, log: S.log});
  }
  function onLeave(peerId, wasHost){
    if(!S.room) return; const i = S.room.seats.findIndex(x=> x && x.peerId === peerId); if(i < 0) return;
    if(S.isHost){ if(S.room.status === 'lobby') S.room.seats[i] = null; else S.room.seats[i].connected = false; broadcastRoster(); maybeRound(); return; }
    if(wasHost || S.room.hostId === peerId){ S.room.seats[i].connected = false; migrate(peerId); }
  }
  // The host is gone (left, or silent for DROP_MS): the lowest seat still here takes over. Every client holds the same table and log, so
  // the new host just goes on numbering acts; the others send it their open claims again.
  function migrate(oldHost){
    const room = S.room; if(!room) return;
    const cand = room.seats.findIndex(x=> x && !x.cpu && x.peerId !== oldHost && (x.peerId === me.peerId || clock.now() - (S.lastSeen[x.peerId] || 0) < DROP_MS));
    const x = cand >= 0 ? room.seats[cand] : null; if(!x || x.peerId !== me.peerId){ emit('hostLost', {waitingFor: x ? x.peerId : null}); return; }
    const others = room.seats.filter(y=> y && !y.cpu && y.peerId !== me.peerId && y.peerId !== oldHost);
    if(others.length && !others.some(y=> clock.now() - (S.lastSeen[y.peerId] || 0) < DROP_MS)){ emit('hostLost', {cutOff: true}); return; }
    S.isHost = true; S.epoch += 1; room.hostId = me.peerId; room.epoch = S.epoch; S.seq = S.log.length ? S.log[S.log.length - 1].seq : 0;
    room.seats.forEach((y, k)=>{ if(y && y.peerId === oldHost){ if(room.status === 'lobby') room.seats[k] = null; else y.connected = false; } });
    broadcastRoster(); emit('hostChanged', {hostId: me.peerId});
    Object.values(S.pending).forEach(p=> hostInbox({seat: p.seat, c: p, cid: p.cid}));
    if(room.status === 'playing') pump().then(()=>{ S.cpuKey = null; scheduleCpu(); maybeRound(); }); // + COOP3: the new host times the CPU allies
  }
  T0.onMessage(onMsg);

  // ---- heartbeat: who is still here
  function tick(){
    if(S.closed) return; send('ping', {host: S.isHost, seq: S.seq}); const now = clock.now();
    if(!S.room) return;
    if(S.isHost){ let changed = false;
      S.room.seats.forEach((x, k)=>{ if(!x || x.cpu || x.peerId === me.peerId) return; const gone = now - (S.lastSeen[x.peerId] || 0) > DROP_MS;
        if(gone && x.connected){ if(S.room.status === 'lobby') S.room.seats[k] = null; else x.connected = false; changed = true; } });
      if(changed){ broadcastRoster(); maybeRound(); }
    } else if(S.room.hostId && S.room.status !== 'done' && now - (S.lastSeen[S.room.hostId] || now) > DROP_MS){ migrate(S.room.hostId); }
  }
  S.timers.ping = clock.setInterval(tick, PING_MS);
  function maybeAutoPlay(){ if(!opts.autoPlay) return; const seat = mySeat(), T = S.T; if(seat == null || !T || T.over || seatDone(T, seat) || Object.keys(S.pending).length) return;
    const go = ()=>{ const T2 = S.T; if(!T2 || T2.over || seatDone(T2, seat) || Object.keys(S.pending).length) return;
      const a = cpuChoice(T2, seat); if(!a) return; const r = claim(a.kind === 'play' ? {kind: 'play', uid: a.uid, row: a.row, slot: a.slot} : a.kind === 'pitch' ? {kind: 'pitch', uid: a.uid} : {kind: 'pass'});
      if(r && r.ok === false && a.kind !== 'pass') claim({kind: 'pass'}); };
    clock.setTimeout(go, typeof opts.autoPlay === 'number' ? opts.autoPlay : 0); }

  // ---- open / join / leave
  if(S.isHost){ S.room = newRoom(); emit('roster', S.room); }
  else { send('hello', {peer: {name: me.name, deck: me.deck, leader: me.leader, castle: me.castle, castleHp: me.castleHp}}); }
  function setReady(on, deck, leader){ const seat = mySeat(); if(seat == null){ S.pendingReady = {on: !!on, deck: deck || null}; return; } if(deck) me.deck = deck;
    if(S.isHost){ S.room.seats[seat].ready = !!on; if(deck) S.room.seats[seat].deck = deck; if(leader !== undefined) S.room.seats[seat].leader = leader; broadcastRoster(); } else send('ready', {ready: !!on, deck: deck || null, leader}); }
  function leave(){ if(S.closed) return; send('leave', {host: S.isHost}); close(); }
  function close(){ S.closed = true; clearBatch(); clearCpu(); if(S.timers.ping) clock.clearInterval(S.timers.ping); try{ T0.close(); }catch(e){} }
  function rejoinHello(){ S.lastSeen = {}; send('hello', {peer: {name: me.name, deck: me.deck, leader: me.leader, castle: me.castle, castleHp: me.castleHp}}); }
  Object.assign(S, {mySeat, setReady, canStart, start, claim, nextFloor, leave, close, rejoinHello, tick, flush, _onMsg: onMsg, humansIn: ()=> S.room ? humans() : [],
    myAutoPlay: maybeAutoPlay, seatDone: i=> S.T ? seatDone(S.T, i) : false});
  return S;
}

// A short room code (6 letters / digits, no look-alikes: the coop_rooms check ^[A-Z0-9]{6}$)
function newRoomCode(rnd){ rnd = rnd || Math.random; const A = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'; let s = ''; for(let i = 0; i < 6; i++) s += A[Math.floor(rnd() * A.length)]; return s; }
// The cards a room's fight reads, fingerprinted (each player's game must hold the same card data for the fight to run in step)
function defsHash(defs, ids){ const list = [...new Set(ids)].sort().map(id=>{ const d = defs[id] || {}; return [id, d.attack, d.health, d.cost, d.wait, JSON.stringify(d.effects || {})].join(';'); }); return hashStr(list.join('|')); }
function roomCardIds(decks){ const ids = new Set(); Object.values(DUNGEONS).forEach(dg=> dg.floors.forEach(f=>{ Object.keys(f.deck).forEach(id=> ids.add(id)); if(f.boss) ids.add(f.boss.base); })); (decks || []).forEach(d=> Object.keys(d || {}).forEach(id=> ids.add(id))); return [...ids]; }

const api = {DUNGEONS, ENERGY_COST, COLS, SEAT_KEYS, TEXT_KEYS, PING_MS, DROP_MS, BATCH_MS, RANK_MULT, PAY,
  typeOf, playersOf, rowOfSeat, seatOfRow, floorDef, floorOverlay, bossIdOf, createTable, coopEngine, withSeat, seatData, leadSeat, unitAt, ownerOf, rowLegalSlots, allCells,
  seatDone, checkAct, applyAct, cpuChoice, cpuActs, headlessRound, finishRound, noteRoundEnd, tableHash, applyHeadless, tableFor, unsupportedCard, noSlotCard,
  rankFor, floorPay, cardPool, createHub, broadcastChannelTransport, supabaseTransport, createSession, newRoomCode, defsHash, roomCardIds, mulberry32, mixSeed};
if(typeof module !== 'undefined' && module.exports) module.exports = api;
if(root) root.BramblewoodCoop = api;
})(typeof window !== 'undefined' ? window : (typeof globalThis !== 'undefined' ? globalThis : null));
