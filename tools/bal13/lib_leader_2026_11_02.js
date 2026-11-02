'use strict';
// 2026-11-02 (package BAL13, owner 21:37: "So make sure we take leaders into account."): the reference player WITH a leader, for BAL13's
// ladder, summary and card flags. Since FIX6 (merged 22:2x) the game's own harness deals it: referenceFightSetup(map, node, {leader: id})
// puts the leader in ctx.ref.leader and playReferenceGame gives your seat it through dealPlayerLeader (a reserve leader with leaderPlan: out
// as soon as it can be paid). BAL13's interim copy of the game loop is gone; this file only picks WHICH leader a reference deck holds.
//   leaderFor(gm, map)   the leader a player holds there: the strongest card that may lead (the game's canLeadDef: a Leader / Dictator card
//                        or Heroic and up) in the map's map-true pool (within its rarity cap), scored at the reference level as
//                        tools/opt/ref5_prog.js chooseLeader does; none -> the Wandering Traveller (DECK_DEFAULT_LEADER_ID). The ladder decks
//                        hold no leader-only card (ladder_2026_11_02.js poolOf), so the leader is never one of the deck's own cards.
//   setupLed / playLed / simulateLed   the game's referenceFightSetup / playReferenceGame / simulateReferenceFight with {leader: id}
//                        ({noLeader: true} when id is null), so a number here is the game's own reference fight with that leader.
const path = require('path');
const DEFAULT_LEADER = 'wandering-traveller';
function canLead(gm, d) { if (!d || d.token || d.test || d.hero) return false; const e = d.effects || {}; if (e.leader || e.dictator) return true;
  const bands = gm.G.RARITY_TIER_BANDS || ['common', 'uncommon', 'rare', 'veryrare', 'superrare', 'epic', 'heroic', 'unique', 'legendary', 'mythic', 'ancient'];
  const i = bands.indexOf(d.rarity || 'common'), h = bands.indexOf('heroic'); return i >= 0 && h >= 0 && i >= h; }
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
const withLeader = (opts, leaderId) => Object.assign({}, opts, leaderId ? { leader: leaderId } : { noLeader: true });
function setupLed(gm, mapId, node, opts, leaderId) { return gm.G.referenceFightSetup(mapId, node, withLeader(opts, leaderId)); }
function playLed(gm, ctx, g) { return gm.G.playReferenceGame(ctx, g); }
function simulateLed(gm, mapId, node, games, opts, leaderId) {
  const r = gm.G.simulateReferenceFight(mapId, node, games, withLeader(opts, leaderId)); return Object.assign(r, { leader: leaderId || null }); }
module.exports = { DEFAULT_LEADER, canLead, leaderFor, setupLed, playLed, simulateLed };
