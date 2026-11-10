// 2026-11-11 (package SKIR1): one road fight's deck rules for the rebuild (tools/skir1/build_2026_11_11.js) and the fit (fit_2026_11_11.js).
// A fight's deck: its size kept; 5-6 different cards on a skirmish, 5-7 on an elite or boss (up to the deck's own count if it had more); copies
// min(4, the rarity's cap); every card from the fight's pool: its map's list (main map: MAP + SPECIAL; side map: its SUBMAP list + SPECIAL),
// its own first-clear reward cards and its leaders, within the road's rarity cap for its kind (tools/lib_map_pools fightPool, roadRarityOk);
// not another fight's reward; no card that costs or makes Stone before Map 21 (a side map counts the map it opens on); no Baby card but the
// admin adds (THEME8's Caiman Hatchling); K14 (non-map-unique cards 1 copy each, 6 in all; Map 0 exempt, BAL7-2); kept: the fight's first-clear
// cards and leader cards it held, its showcase, a skirmish's Auto showcase leader (nodeShowcaseId stays the same card), a challenge deck's
// selfish boon on (DF3), the content tests' copy floors (2-2 / 2-5 Rock Pool Starfish x2).
'use strict';
const fs = require('fs'), path = require('path');
const ROOT = path.resolve(__dirname, '..', '..');
const LB = require('../lib_bramble.js'), G = LB.G, D = LB.CARD_DEFS_BASELINE;
const LP = require('../lib_map_pools.js'), K = require('../bal7_k14_decks_2026_10_28.js'), M = require('./lib_skir1_2026_11_11.js');
const ENG = require(path.join(ROOT, 'bramblewood-engine.js'));
const DX = JSON.parse(JSON.stringify(D)); if (ENG.SKILL_PARAMS_LIB) ENG.SKILL_PARAMS_LIB.expandDefsInPlace(DX); // the boon counts expanded skills (FIX12)
const POOLS = () => JSON.parse(fs.readFileSync(path.join(ROOT, 'canonical', 'map-pools.json'), 'utf8'));
const SRC = fs.readFileSync(path.join(ROOT, 'arena_app.js'), 'utf8');
const ADMIN = new Set([].concat(...Object.values(JSON.parse((SRC.match(/const UI47_ADMIN_ADD = (\{.*?\});\n/) || [0, '{}'])[1]))));
const KEEP_MIN = { '2-2': { 'rock-pool-starfish': 2 }, '2-5': { 'rock-pool-starfish': 2 } };
const OUT_OF_SCOPE = new Set(['mtut', 'mtut12', 'mm', 'muc', 'mlb']);
const size = d => Object.values(d).reduce((t, k) => t + k, 0);
const keyOf = d => Object.keys(d).sort().map(id => id + d[id]).join(',');
const unlockOf = m => { const no = G.mapNumberOf(m.id); if (!m.sub) return no; try { const u = G.mapUnlockNumberOf(m.id); return u == null ? no : u; } catch (e) { return no; } };
// the maps: main maps 0-20 and their side maps (not the tutorial, the endless dungeons, the tower or reserved maps)
function maps() { return G.CONQUEST_MAPS.filter(m => !m.reserved && !m.tower && !m.endless && !OUT_OF_SCOPE.has(m.id) && G.mapNumberOf(m.id) != null && G.mapNumberOf(m.id) <= 20 && (m.nodes || []).some(n => n.deck && Object.keys(n.deck).length)); }
function fightsOf(m) { return (m.nodes || []).filter(n => n.deck && Object.keys(n.deck).length && !/tutorial|raid/.test(n.kind || 'skirmish')); }
const isBoss = (n, all) => /boss|dungeon/.test(n.kind || '') || (n === all[all.length - 1] && (() => { try { const b = G.skirmishTargetBand(G.CONQUEST_MAPS.find(x => (x.nodes || []).includes(n)).id, n); return b && b.t <= 0.5; } catch (e) { return false; } })());
let poolsCache = null;
function fight(m, n) {
  poolsCache = poolsCache || POOLS();
  const no = G.mapNumberOf(m.id), kind = n.kind || 'skirmish', old = Object.assign({}, n.deck), S = size(old), n0 = Object.keys(old).length;
  G.NODE_MAP_HINT.set(n, m.id);
  let L0 = []; try { L0 = G.skirmishLeadersOf(n, m.id) || []; } catch (e) {}
  const explicit = Array.isArray(n.leaders) || !!n.leaderId;
  const firstAll = (G.nodeFirstClearCardIds || G.nodeRewardCardIds)(m.id, n.key) || [], own = G.nodeRewardCardIds(m.id, n.key) || [];
  const unlock = unlockOf(m), U = m.id === 'm1' ? null : K.uniqueOf(m.id);
  // the owner's "No stone until Map 21+" wins over a kept card: a Stone card leaves the deck (an Auto showcase leader then changes; reported)
  const stoneOut = id => unlock < 21 && M.stone(D[id]);
  const keep = new Map(); // id -> at least these copies
  firstAll.filter(id => old[id]).forEach(id => keep.set(id, 1));
  L0.filter(id => old[id]).forEach(id => keep.set(id, 1));
  if (n.showcase && old[n.showcase]) keep.set(n.showcase, 1);
  Object.entries(KEEP_MIN[n.key] || {}).forEach(([id, k]) => keep.set(id, k));
  [...keep.keys()].filter(stoneOut).forEach(id => keep.delete(id));
  const stoneLeader = !explicit && L0.some(stoneOut);
  if (stoneLeader) L0 = [];
  const list = LP.fightPool(poolsCache, m.id, m.sub ? m.parent : null) || new Set();
  const otherReward = id => { const s = (D[id] || {}).source; return !!(s && s.kind === 'map' && s.node && !(s.id === m.id && s.node === n.key)); };
  const deckable = id => { const d = D[id]; return d && !d.token && !d.test && !d.hero && !d.pool && !d.hallOfFame && !/^egg-/.test(id) && !(d.effects || {}).leader && d.cardType !== 'materia' && d.cardType !== 'equipment'; };
  const allowedIn = id => keep.has(id) || L0.includes(id) || (deckable(id) && ((list.has(id) || own.includes(id)) && G.roadRarityOk(D[id].rarity, no, kind, m.id) && !otherReward(id)
    && !(M.stone(D[id]) && unlock < 21) && (D[id].kind !== 'baby' || ADMIN.has(id))));
  const leadOf = d => { if (explicit) return L0; const nn = Object.assign({}, n, { deck: d }); G.NODE_MAP_HINT.set(nn, m.id); try { return G.skirmishLeadersOf(nn, m.id) || []; } catch (e) { return []; } };
  // an Auto showcase leader (no explicit leaders, no showcase field) stays the deck's top card: a card that would outrank it stays out
  // an Auto showcase leader (no explicit leaders, no showcase field) is pinned: the build writes it as the fight's `showcase` (the card the
  // panel already showed and the CPU already summoned), so a stronger card in the deck no longer takes the lead (pin = that card, else null)
  const pin = !explicit && L0.length === 1 && !(n.showcase && old[n.showcase]) ? L0[0] : null;
  const outranks = () => false;
  const pool = [...new Set([...list].concat(own, L0, [...keep.keys()]))].filter(id => allowedIn(id) && !outranks(id) && !stoneOut(id)).sort();
  // a challenge deck's boon-theme cards may hold their rarity's full copy cap (the road's 5 Commons): Shrine Steps 20-4 has only two themed cards left
  const themedBoon = id => !!(n.rules && n.rules.boon) && ENG.selfishBoonCount(DX, { [id]: 1 }, n.rules.boon).have === 1;
  const cap = id => Math.max(keep.get(id) || 0, themedBoon(id) ? G.maxCopiesForRarity(D[id].rarity) : Math.min(4, G.maxCopiesForRarity(D[id].rarity)));
  const dMin = Math.min(5, n0, S), dMax = kind === 'skirmish' ? 6 : Math.max(7, Math.min(n0, 8));
  const k14 = d => { if (!U) return []; const out = []; let tot = 0; Object.entries(d).forEach(([id, k]) => { if (U.has(id) || L0.includes(id)) return; tot += k; if (k > 1) out.push(id + ' x' + k); }); if (tot > 6) out.push(tot + ' non-unique copies'); return out; };
  const boonOn = d => !(n.rules && n.rules.boon) || ENG.selfishBoonCount(DX, d, n.rules.boon).on;
  const problems = d => { const out = [], ids = Object.keys(d);
    if (size(d) !== S) out.push(`${size(d)} cards, not ${S}`);
    if (ids.length < dMin || ids.length > dMax) out.push(`${ids.length} different cards (${dMin}-${dMax})`);
    ids.forEach(id => { if (!(d[id] >= 1)) out.push(id + ' x' + d[id]); else if (d[id] > cap(id)) out.push(`${id} x${d[id]} over ${cap(id)}`); if (!pool.includes(id)) out.push(id + ' not in the fight\'s pool'); });
    keep.forEach((k, id) => { if ((d[id] || 0) < k) out.push(`kept card ${id} x${d[id] || 0} (needs ${k})`); });
    out.push(...k14(d));
    if (L0.length && !explicit && !pin && JSON.stringify(leadOf(d)) !== JSON.stringify(L0)) out.push(`the showcase leader ${L0} would become ${leadOf(d)}`);
    if (!boonOn(d)) out.push('the challenge boon ' + n.rules.boon + ' is off');
    return out; };
  return { m, n, map: m.id, mapNo: no, unlock, side: !!m.sub, code: n.key, kind, name: n.name, old, S, n0, L0, explicit, stoneLeader, pin, keep, pool, list, own, cap, dMin, dMax, U, k14, problems, legal: d => !problems(d).length, leadOf };
}
module.exports = { maps, fightsOf, fight, isBoss, size, keyOf, unlockOf, G, D, DX, M, ADMIN, KEEP_MIN };
