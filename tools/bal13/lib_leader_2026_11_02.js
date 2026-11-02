'use strict';
// 2026-11-02 (package BAL13, owner 21:37: "So make sure we take leaders into account."): the reference player WITH a leader, for BAL13's
// ladder, summary and card flags. The game's own reference harness (arena_app.js playReferenceGame) gives your seat no leader; a real match
// deals the leader the player chose (matchLeaderId, the Wandering Traveller when none). This file is a small, clearly marked stand-in until
// package FIX6's leader-dealing helper lands (FIX6 fixes leader choice / play: "Drowned Matriarch always shows as the owner's leader and is
// never played"); swap to that helper then.
//   leaderFor(gm, map)        the leader a player holds there: the strongest card that may lead (the game's canLeadDef: a Leader / Dictator
//                             card or Heroic and up) in the map's map-true pool (within its rarity cap), scored at the reference level as
//                             tools/opt/ref5_prog.js chooseLeader does; none -> the Wandering Traveller (DECK_DEFAULT_LEADER_ID)
//   setupLed(gm, mapId, node, opts, leaderId)   G.referenceFightSetup + your leader, levelled as your deck (referencePlayerDeck), in ctx.leader
//   playLed(gm, ctx, g)       playReferenceGame's loop line for line (arena_app.js), plus your seat's leader in reserveLeaders: the AI summons
//                             it the way the CPU summons a skirmish's leaders (bramblewood-engine.js aiTakeTurn reserveLeaders)
//   simulateLed(gm, mapId, node, games, opts, leaderId)   simulateReferenceFight's tally with playLed
const path = require('path');
const DEFAULT_LEADER = 'wandering-traveller';
const RARITY_TIER_BANDS_HEROIC = 'heroic';
function canLead(gm, d) { if (!d || d.token || d.test || d.hero) return false; const e = d.effects || {}; if (e.leader || e.dictator) return true;
  const bands = gm.G.RARITY_TIER_BANDS || ['common', 'uncommon', 'rare', 'veryrare', 'superrare', 'epic', 'heroic', 'unique', 'legendary', 'mythic', 'ancient'];
  const i = bands.indexOf(d.rarity || 'common'), h = bands.indexOf(RARITY_TIER_BANDS_HEROIC); return i >= 0 && h >= 0 && i >= h; }
const _lead = {};
function leaderFor(gm, map) {
  if (_lead[map.id]) return _lead[map.id];
  const O = require(path.join(__dirname, '..', 'opt', 'deckopt.js')), G = gm.G;
  let pool = []; try { pool = O.poolsFor(gm, map, { mode: 'map-true' }).p1; } catch (e) {}
  const lv = (() => { try { const f0 = (map.nodes || []).find(n => n.deck); return G.referenceDeckFor(map.id, f0).level || 1; } catch (e) { return 1; } })();
  const score = id => { const d = gm.D[id]; let st = d; try { st = G.statsAtLevel(d, lv); } catch (e) {} return G.skirmishCardScore(Object.assign({}, d, { attack: st.attack, health: st.health })); };
  const c = pool.filter(id => id !== DEFAULT_LEADER && canLead(gm, gm.D[id])).sort((a, b) => score(b) - score(a) || (a < b ? -1 : 1));
  return (_lead[map.id] = c[0] || DEFAULT_LEADER);
}
function setupLed(gm, mapId, node, opts, leaderId) {
  const G = gm.G, ctx = G.referenceFightSetup(mapId, node, opts);
  if (leaderId && gm.D[leaderId]) { // the leader levelled as your deck is: referenceFightSetup on a one-card deck of it
    const one = G.referenceFightSetup(mapId, node, Object.assign({}, opts, { deck: { [leaderId]: 1 } })), key = Object.keys(one.mine)[0];
    ctx.defs = Object.assign({}, ctx.defs, { [key]: one.defs[key] }); ctx.leader = key; }
  return ctx;
}
function playLed(gm, ctx, g) {
  const E = gm.E, G = gm.G, seededRng = gm.seededRng;
  const engine = E.makeSimEngine(ctx.defs, seededRng(ctx.seed0 + g * 37), { recordEvents: false, battleMode: ctx.mode, rules: ctx.rules, aiAim: true, aiLevel: ctx.cpu });
  const sideOf = id => id === 1 ? 'A' : 'B', stats = {};
  const P = { 1: engine.newPlayer(1, ctx.mine, ctx.myCastle), 2: engine.newPlayer(2, ctx.enemyDeck, ctx.sc.character) };
  P[2].loopCards = []; Object.assign(P[2].hq, ctx.setup.hq); if (ctx.setup.hq.shieldLayers) P[2].hq.shieldLayers = ctx.setup.hq.shieldLayers.slice(); if (ctx.setup.reserveLeaders) P[2].reserveLeaders = ctx.setup.reserveLeaders.slice();
  if (ctx.setup.openingExtra) P[2].openingExtra = ctx.setup.openingExtra;
  if (ctx.node.floor > 1 && !ctx.node.tower) P[2].perks = Object.assign({}, P[2].perks || {}, { floorPct: (ctx.node.floor - 1) * G.ENDLESS_FLOOR_CURVE.floorPct });
  if (ctx.leader) P[1].reserveLeaders = [ctx.leader]; // BAL13: your leader, summoned by your seat's AI as the CPU summons its own
  engine.draw(P[1], 3, 'A', stats, null); engine.draw(P[2], 3, 'B', stats, null);
  let r = 1, over = false, lastSig = null, stalled = 0;
  for (; r <= E.DRAW_ROUND_CAP && !over; r++) {
    engine.setSuddenDeath(r >= E.SUDDEN_DEATH_ROUND, r >= E.SUDDEN_DEATH_CASTLE_ROUND ? 2 : 1);
    [1, 2].forEach(p => { P[p].playedThisTurn = false; P[p].discardUsedThisTurn = false; });
    if (r > 1) engine.roundStart(P, r, sideOf, stats, null);
    engine.setAiLevel(1); engine.aiTakeTurn(P, sideOf, 1, stats, null); engine.setAiLevel(ctx.cpu); engine.aiTakeTurn(P, sideOf, 2, stats, null);
    over = engine.resolveCombat(P, sideOf, stats, null, r % 2 === 0 ? 1 : 2); if (over) break;
    const sig = E.boardSignature(P); stalled = (sig === lastSig && E.noActionsLeft(P)) ? stalled + 1 : 0; lastSig = sig; if (stalled >= 2 && r >= E.STALL_DRAW_FROM_ROUND) break;
    engine.draw(P[1], 1, 'A', stats, null); engine.draw(P[2], 1, 'B', stats, null);
  }
  const a = P[1].hq.hp <= 0, b = P[2].hq.hp <= 0;
  return { win: !!(over && b && !a), loss: !!(over && a && !b), rounds: r, leaderPlayed: !!ctx.leader && !(P[1].reserveLeaders || []).length };
}
function simulateLed(gm, mapId, node, games, opts, leaderId) {
  const ctx = setupLed(gm, mapId, node, opts, leaderId); let wins = 0, losses = 0, led = 0;
  for (let g = 0; g < games; g++) { const r = playLed(gm, ctx, g); if (r.win) wins++; else if (r.loss) losses++; if (r.leaderPlayed) led++; }
  return { wins, losses, n: games, win: wins / Math.max(1, games), leaderPlayed: led / Math.max(1, games), leader: ctx.leader || null };
}
module.exports = { DEFAULT_LEADER, canLead, leaderFor, setupLed, playLed, simulateLed };
