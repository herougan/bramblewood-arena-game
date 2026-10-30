#!/usr/bin/env node
// 2026-10-30 (package REF5, owner 10-28 22:50, re-confirmed 10-30: "a reference deck made from optimising standard draws + random booster pack
// openings appropriate for that map ... do this process a few times to generate a few different decks based on randomised pack rewards"):
// the progression reference ("Reference (Random)", set id "prog"): per main map 0-20, 5 decks, each the deck optimizer's best deck from the
// collection one seeded player holds arriving there, at the card levels that player's Forge share bought.
//
//   node tools/opt/ref5_prog.js econ                        the economy per map (seed 1 .. 5): income, packs bought, Forge levels (needs the decks
//                                                          of the earlier maps for the Forge; prints what it has)
//   node tools/opt/ref5_prog.js pools --map N               write Map N's 5 collections into docs/balance/ref/ref5-prog-pools.json
//   node tools/opt/deckopt.js --map N --mode prog --prog-seed K --pool-file docs/balance/ref/ref5-prog-pools.json ...   (K = 1..5; see RUN below)
//   node tools/opt/ref5_prog.js collect --map N --tag T     the 5 optima of Map N -> the Forge share spent on each -> docs/balance/ref/ref5-prog.json
//   node tools/opt/ref5_prog.js run --maps A-B              pools + 5 optimizer runs + collect, map by map (each map needs the one before)
//   node tools/opt/ref5_prog.js measure --maps A-B --games G --tag T   the 5 decks and the Map reference against every road fight
//
// THE ECONOMY (R1, R2). One player (Otters, the faction side the Pool reference uses), seeded, walking the road map by map. Before Map N
// it has cleared every fight the faction-track road order (tools/faction_track_sim_2026_10_21.js roadOrder) puts before N: the main maps
// 0..N-1 and the side maps that opened by then. Every number is the game's own, read from arena_app.js through tools/lib_bramble.js:
//   - first clears (nodeRewardTier(node).first: Maple Leaves and Dust; not halved by ECON1), their reward cards (nodeRewardCardIds +
//     SKIRMISH_FIRST_PACK_CARDS / node.firstCard), node.firstPack, an elite / boss first clear's base-track card (trackPick over the gated
//     basic pool), each main map's end pack (mapEndPackId, 3 cards, new cards first, gated) and its free pack (MAP_FREE_PACKS);
//   - the faction track (tools/rw5_faction_pacing_2026_10_23.js run: the tutorial, 0-2's pack, the milestones, the end-of-map faction packs,
//     every N-th first clear, the achievements), seed = the player's seed;
//   - the level track (RES3_LEVEL_TRACK: single cards, packs of your tier, 100 Leaves + 50 Dust) from XP: 100 for the tutorials, 25 + 3 a
//     first clear, 300 a map cleared, the collection milestones (xpMilestones);
//   - the Trail Mix Trek's free lane (TRAIL_FREE, halved by ECON1) at the stated pace: one map a day, 60 Stickers a day (first win 10 +
//     three notices 30 + the 3-notice day tier 20) and the first weekly tier (100) a week, the road resetting every 30 days;
//   - every pack (bought or given) as purchasePackOnce opens it: rollPackCards (the game's own, Math.random replaced by the seeded generator),
//     its levelChance free level-up (a random owned card +1), the bonus copy (bonusCopyChance).
// Left out (said in the report): a faction pack from the level track or the Trail (its cards), the general card of a faction pack, the
// achievements' currency, the 3% castle in a pack, notices, quests, repeats, raids and every other repeatable income (ECON1 halved them; the
// x1.5 below stands in for them).
// The resources (Maple Leaves, Gold Leaves, Dust) are those amounts x1.5. 1.0x of the Leaves and Gold Leaves buys packs at each map's arrival
// (every pack it can, the pack "appropriate for that map": the map's own series, mapEndPackId; a series not on sale or not affordable falls
// back to the next one down; the merchants: Hedgerow Pouch from Map 5, Tidemire Chest from Map 8, Highcrest Case from Map 13; bundles of
// 100 / 50 / 25 / 10 at their discount first). 0.5x of every currency goes to the Forge. No pack costs Dust, so the other 1.0x of the Dust
// is banked and unused (decision REF5-1).
// THE FORGE SCHEDULE (R2, chosen here and reported): the Forge opens on Map 11 (RES3_FORGE_TAB_MAP.upgrade); until then its share is banked.
// At each map from 11: the Forge tier first (the Iron Forge from Map 13, the Ember Forge from Map 16, when the bank pays it; the Strange
// Materia comes from the Map 12 and 15 bosses), then the map's deck (chosen first, at the levels the cards already have) is levelled one card
// level at a time (a level raises every copy, FG), the step with the most copies in the deck per Dust first, inside the Forge tier's cap and
// rarity band, the level gates (Lv 5-8 from Map 16) and a Base card's Lv 4 cap. What is left carries to the next map.
// THE DECK (R3): tools/opt/deckopt.js --mode prog: the collection's cards, each up to min(its rarity's copy cap, the copies owned; Base cards
// unlimited), 20 cards, at the cards' own levels; the gauntlet is deckopt's (the map's fight decks in a fair mirror under each fight's field +
// the road fights as the game builds them).
// THE SET (R4): docs/balance/ref/ref5-prog.json, {"id": "prog", "bake": true, "decks": {"<map>": [{seed, counts, parts}, x5]}}; parts are
// [id, copies, level] (absolute levels). tools/opt/ref_decks.js bakes it into arena_app.js REF_DECK_SETS; refSetFor('prog') deals one of the
// map's five at random ("Reference 3 of 5"), 'prog-1' .. 'prog-5' one in particular. A side map plays the decks of the map it opens on.
'use strict';
const fs = require('fs'), path = require('path'), cp = require('child_process');
const ROOT = path.join(__dirname, '..', '..');
const POOLS = 'docs/balance/ref/ref5-prog-pools.json', SET = 'docs/balance/ref/ref5-prog.json';
const SEEDS = [1, 2, 3, 4, 5], SIDE = 'otters', MAX_MAP = 20;
const MULT = 1.5, PACK_SHARE = 1.0, FORGE_SHARE = 0.5;
const TRAIL_PACE = { mapsPerDay: 1, stickersPerDay: 60, weeklyStickers: 100, monthDays: 30 };
const FORGE_OPEN = 11, FORGE_TIER_MAP = { 2: 13, 3: 16 };
const fnv = s => { let h = 2166136261; for (let i = 0; i < s.length; i++) { h ^= s.charCodeAt(i); h = Math.imul(h, 16777619); } return h >>> 0; };
function mulberry(seed) { let s = seed >>> 0; return () => { let t = (s = (s + 0x6D2B79F5) >>> 0); t = Math.imul(t ^ (t >>> 15), t | 1); t ^= t + Math.imul(t ^ (t >>> 7), t | 61); return ((t ^ (t >>> 14)) >>> 0) / 4294967296; }; }
const uniq = a => [...new Set(a)];

// ---------------------------------------------------------------- the game's pieces (lib_bramble + grabbed source)
let GAME = null;
function game() {
  if (GAME) return GAME;
  const B = require(path.join(ROOT, 'tools', 'lib_bramble.js')), G = B.G, D = B.CARD_DEFS_BASELINE;
  if (typeof globalThis.effectsAtLevel !== 'function') { try { globalThis.effectsAtLevel = new Function(B.grab('effectsAtLevel') + '\nreturn effectsAtLevel;')(); } catch (e) { /* older */ } }
  const UC = JSON.parse(fs.readFileSync(path.join(ROOT, 'canonical', 'upgrade-costs.json'), 'utf8'));
  // the pack draw: the game's rollPackCards and its helpers, Math.random swapped for the player's generator (env.rnd), the reach (env.reach)
  // and the collection (env.owned) supplied by the caller
  const names = ['SPELLS_SHELVED', 'isHofVariant', 'hofBlocked', 'RARITY_INTRO', 'SIDE_RARITY_INTRO', 'ROAD_MAIN_FROM', 'ROAD_EPIC_HEROIC_FROM', 'ROAD_NEVER', 'roadNever', 'ROAD_RARITY_STEPS', 'ROAD_RARITY_ALIAS', 'roadRarityStep',
    'rarityRevealedForPlayer', 'packCardReached', 'isBasicPackSource', 'packPoolOf', 'BASIC_PACK_POOLS', 'BASIC_PACK_TIERS', 'packCardPool', 'PACK_RARITY_WEIGHT', 'PACK_NUMBER_OF', 'PACK_COMMON_SHARE', 'PACK_UPPER_SHARE',
    'packNumberOf', 'packCommonShare', 'packRarityClass', 'packRarityShares', 'rollPackCards', 'BONUS_COPY_LADDER', 'BONUS_COPY_ALIAS', 'bonusCopyChance', 'TRACK_STAGES', 'TRACK_LATE', 'TRACK_LATE_MAP', 'trackPick',
    'SHOP_PACKS_DEFAULT', 'PACK_BUNDLE_DISCOUNT', 'packSetCost', 'mapEndPackId', 'MAP_FREE_PACKS', 'MAP_END_PACKS', 'CONQUEST_NODE_REWARDS', 'SKIRMISH_FIRST_PACK_CARDS', 'RES3_LEVEL_TRACK', 'RES4_LEVEL_LEAVES', 'res3LevelRewardsAt',
    'TRAIL_FREE', 'TRAIL_TIER_COST', 'TRAIL_TIERS', 'RARITY_TIER_BANDS', 'RARITY_DEFS', 'BASE_CARD_LEVEL_CAP', 'isBaseLevelCapped', 'cardMaxLevel', 'RARITY_MAX_LEVEL', 'LEVEL_STEPS'];
  const src = [];
  for (const n of names) { try { src.push(B.grab(n)); } catch (e) { if (!/^(TRACK_LATE|TRACK_LATE_MAP|TRAIL_TIERS|LEVEL_STEPS|RARITY_MAX_LEVEL)$/.test(n)) throw e; } }
  // a multi-name const line (TRAIL_TIER_COST, TRAIL_TIERS ... on one line): grab returns the whole statement once; drop exact duplicates
  const body = uniq(src).join('\n').replace(/econScaleTable\('trail', TRAIL_FREE\);?/, '');
  const env = { getCardDefs: () => D, isUnattainable: G.isUnattainable, isEasterEgg: d => !!(d && (d.easterEgg || (d.source && d.source.kind === 'easteregg'))), isEquipmentDef: d => !!(d && (d.cardType === 'equipment' || d.equip)),
    cardSourceOf: G.cardSourceOf, basicPackTierOf: G.basicPackTierOf, cardFirstMapList: G.cardFirstMapList, maxCopiesForRarity: G.maxCopiesForRarity, cardBaseLevel: G.cardBaseLevel, statsAtLevel: G.statsAtLevel,
    TX: (k, o) => k, antiqueCheck: () => ({ ok: false }) };
  const rt = { rnd: Math.random, reach: 0, owned: {} };
  const MathS = Object.create(Math); MathS.random = () => rt.rnd();
  const stubs = 'const Math = __M; let adminModeEnabled = false; function pitchingUnlocked(){ return true; } function trackMapReached(){ return __rt.reach; } function conquestMapCleared(){ return false; }\n'
    + 'function copiesOwned(id){ return __rt.owned[id] | 0; } const myUnlockedCardIds = new Set(); function econScaleTable(s, t){ return t; } function mapleLeafIconHTML(){ return ""; }\n';
  const ret = '\nreturn {packCardPool, rollPackCards, bonusCopyChance, trackPick, SHOP_PACKS_DEFAULT, packSetCost, mapEndPackId, MAP_FREE_PACKS, MAP_END_PACK_CARDS, CONQUEST_NODE_REWARDS, SKIRMISH_FIRST_PACK_CARDS, res3LevelRewardsAt, RES4_LEVEL_LEAVES, TRAIL_FREE, TRAIL_TIER_COST, TRAIL_TIERS: typeof TRAIL_TIERS !== "undefined" ? TRAIL_TIERS : 30, RARITY_TIER_BANDS, RARITY_DEFS, BASE_CARD_LEVEL_CAP, isBaseLevelCapped, cardMaxLevel};';
  const keys = Object.keys(env);
  const P = new Function('__M', '__rt', ...keys, stubs + body + ret)(MathS, rt, ...keys.map(k => env[k]));
  const RW5 = require(path.join(ROOT, 'tools', 'rw5_faction_pacing_2026_10_23.js')), SIM = require(path.join(ROOT, 'tools', 'faction_track_sim_2026_10_21.js'));
  GAME = { B, G, D, P, rt, UC, RW5, SIM };
  return GAME;
}

// ---------------------------------------------------------------- the Forge (levelUpCostRaw, levelCostMult, the tiers, the gates)
function rarityTier(gm, r) { r = r || 'common'; if (gm.UC.levelCostMult[r] != null) return r; const d = (gm.P.RARITY_DEFS || []).find(x => x.key === r); return d && d.as ? d.as : r === 'quest' ? 'uncommon' : r === 'questunique' ? 'unique' : 'common'; }
function costMult(gm, id) {
  const d = gm.D[id]; if (!d) return 1; let k = gm.UC.levelCostMult[rarityTier(gm, d.rarity)] || 1; const s = gm.G.cardSourceOf(d).kind;
  if (d.hero) k *= gm.UC.modifiers.hero; else if (gm.P.isBaseLevelCapped(d)) k *= gm.UC.modifiers.base != null ? gm.UC.modifiers.base : 1;
  else if (s === 'quest' || s === 'map' || d.rarity === 'quest' || d.rarity === 'questunique') k *= gm.UC.modifiers.questBase;
  return k;
}
function stepCost(gm, id, L) { // L -> L + 1
  if (L <= 0) return { dust: Math.round(gm.UC.materiaUnit.dust / gm.UC.moteDivisor), gold: Math.round(gm.UC.materiaUnit.gold / gm.UC.moteDivisor) };
  const k = costMult(gm, id), dust = gm.UC.forgeStepDust[Math.max(1, Math.min(9, L))];
  return { dust: Math.round(dust * k), gold: Math.round(dust * 2 / 3 * k) };
}
function levelGateMap(to) { return to >= 11 ? 50 : to >= 10 ? 31 : to >= 9 ? 26 : to >= 5 ? 16 : 0; }
function maxForgeLevel(gm, id, tier, mapNo) {
  const d = gm.D[id], T = gm.UC.forgeTiers[tier - 1], band = gm.P.RARITY_TIER_BANDS.indexOf(d.rarity || 'common');
  if (band > gm.P.RARITY_TIER_BANDS.indexOf(T.upTo)) return gm.G.cardBaseLevel(d);
  let cap = Math.min(T.cap, gm.P.cardMaxLevel(d)); if (gm.P.isBaseLevelCapped(d)) cap = Math.min(cap, gm.P.BASE_CARD_LEVEL_CAP);
  while (cap > 0 && levelGateMap(cap) > mapNo) cap--;
  return cap;
}

// ---------------------------------------------------------------- the player
function mainMaps(G) { return G.CONQUEST_MAPS.filter(m => !m.sub && !m.reserved && G.mapNumberOf(m.id) != null).sort((a, b) => G.mapNumberOf(a.id) - G.mapNumberOf(b.id)); }
function fieldable(gm, id) { const d = gm.D[id]; return !!d && !d.token && !d.test && !d.hero && !d.hallOfFame && !d.pool && id !== 'wandering-traveller' && d.cardType !== 'materia' && !(d.cardType === 'equipment' || d.equip); }
function baseKind(k) { return ({ champion: 'elite', miniboss: 'elite', subboss: 'boss', dungeon: 'elite', worldboss: 'raidboss', megaraid: 'raidboss' })[k] || k; }

// the decks the earlier maps chose, per seed (for the Forge), from the set file
function loadSetFile() { const f = path.join(ROOT, SET); return fs.existsSync(f) ? JSON.parse(fs.readFileSync(f, 'utf8')) : null; }
function chosenDeck(set, mapNo, seed) { const l = set && set.decks && set.decks[mapNo]; const e = l && l.find(x => x.seed === seed); return e ? e.counts : null; }

// Walk the road for one seed up to (arriving at) map `upTo`; `decks(mapNo)` gives the deck that map chose (or null: not chosen yet). Returns
// the state at arrival (collection, levels, wallet, the per-map log). With `finish: true` the arrival map's own Forge spend is done too (its
// deck must be known): the levels the deck plays at.
function walk(seed, upTo, decks, opts) {
  opts = opts || {}; const gm = game(), G = gm.G, D = gm.D, P = gm.P, rt = gm.rt, mains = mainMaps(G);
  const rnd = mulberry(fnv('ref5|' + seed)); rt.rnd = rnd; rt.owned = {};
  const st = { owned: {}, unlimited: new Set(), level: {}, wallet: { gold: 0, gems: 0, dust: 0 }, packBank: { gold: 0, gems: 0 }, forgeBank: { gold: 0, dust: 0 }, idleDust: 0, xp: 0, plLevel: 0, tier: 1, forgeTierBought: [],
    log: [], trailPts: 0, trailClaimed: 0, trailMonth: 0, milestones: new Set(), freeLevels: 0 };
  const own = (id, n, why) => { if (!D[id] || !fieldable(gm, id)) return; st.owned[id] = (st.owned[id] || 0) + (n || 1); rt.owned[id] = st.owned[id]; if (st.level[id] == null) st.level[id] = G.cardBaseLevel(D[id]); cur.cards.push(id); if (why) cur.why[why] = (cur.why[why] || 0) + (n || 1); };
  const earn = (w, why) => { ['gold', 'gems', 'dust'].forEach(k => { const v = (w[k] || 0) * MULT; if (!v) return; cur.earned[k] = (cur.earned[k] || 0) + v; st.packBank.gold += k === 'gold' ? v * PACK_SHARE / MULT : 0; st.packBank.gems += k === 'gems' ? v * PACK_SHARE / MULT : 0;
    if (k === 'gold' || k === 'dust') st.forgeBank[k] += v * FORGE_SHARE / MULT; if (k === 'dust') st.idleDust += v * PACK_SHARE / MULT; }); if (why) cur.src[why] = cur.src[why] || {}, ['gold', 'gems', 'dust'].forEach(k => { if (w[k]) cur.src[why][k] = (cur.src[why][k] || 0) + w[k]; }); };
  // a pack as purchasePackOnce opens it: the cards, the bonus copies, the free level-up
  const openPack = (pack, opt, why) => {
    const pulls = P.rollPackCards(pack, opt || null); pulls.forEach(id => { own(id, 1, why); if (rnd() < P.bonusCopyChance((D[id] || {}).rarity)) own(id, 1, why + ' (bonus copy)'); });
    if (rnd() < (pack.levelChance || 0)) { const ids = Object.keys(st.owned).filter(id => (st.level[id] || 0) < 10).sort(); if (ids.length) { const id = ids[Math.floor(rnd() * ids.length)]; st.level[id] = (st.level[id] || 0) + 1; st.freeLevels++; cur.freeLevels = (cur.freeLevels || 0) + 1; } }
    cur.packs[why] = (cur.packs[why] || 0) + 1; return pulls; };
  const shop = id => P.SHOP_PACKS_DEFAULT.find(p => p.id === id);
  const packOf = (id, cards, extra) => Object.assign({}, shop(id), { cards: cards || shop(id).cards, metal: 0, kroon: 0 }, extra || {});
  // the starter: WINRATE_REF_DECKS.starter's copies, every Base card unlimited (Base and starter copies are made for a deck)
  let cur = { map: -1, cards: [], why: {}, earned: {}, src: {}, packs: {}, bought: {} };
  Object.keys(D).filter(id => G.cardSourceOf(D[id]).kind === 'base' && fieldable(gm, id)).forEach(id => { st.unlimited.add(id); own(id, 1, 'Base'); });
  Object.entries(G.WINRATE_REF_DECKS.starter).forEach(([id, k]) => { if (D[id] && D[id].rarity === 'starter') st.unlimited.add(id); own(id, k, 'starter deck'); });
  // the faction track (RW5's run, the same seed)
  const fac = gm.RW5.run({ side: SIDE, seed: fnv('ref5|faction|' + seed) }), facBy = {}; fac.log.filter(x => x.id).forEach(x => (facBy[x.map] = facBy[x.map] || []).push(x.id));
  const order = gm.SIM.roadOrder(), firstPack = P.SKIRMISH_FIRST_PACK_CARDS;
  const realNode = (mapId, key) => { const m = G.CONQUEST_MAPS.find(x => x.id === mapId); return m && m.nodes.find(n => n.key === key); };
  const xpLevel = xp => { let L = 1, rest = xp; const need = l => Math.round(200 + 50 * (l - 1) + 20 * (Math.pow(1.12, l - 1) - 1)); while (rest >= need(L)) { rest -= need(L); L++; } return L; };
  const levelTrack = mapNo => {
    const distinct = Object.keys(st.owned).length; [[10, 150], [25, 300], [50, 600], [100, 1000], [200, 2000]].forEach(([n, xp]) => { if (distinct >= n && !st.milestones.has('col' + n)) { st.milestones.add('col' + n); st.xp += xp; } });
    const L = xpLevel(st.xp); for (let n = st.plLevel + 1; n <= L; n++) P.res3LevelRewardsAt(n).forEach(k => {
      if (k === 'leaves') { earn(P.RES4_LEVEL_LEAVES, 'level track'); return; }
      if (k === 'faction') { cur.left = (cur.left || 0) + 1; return; } // a faction pack from the level track: left out (see the header)
      rt.reach = mapNo; const id = k === 'packT' ? P.mapEndPackId(mapNo) : 'bronze'; openPack(packOf(id, k === 'card' ? 1 : 3, { endReward: true }), { newFirst: true, gated: true }, 'level track'); });
    st.plLevel = Math.max(st.plLevel, L); };
  const trail = mapNo => { // one map a day: the Stickers of this map's day, the free lane's tiers reached (the road resets every monthDays)
    const day = Math.floor(mapNo / TRAIL_PACE.mapsPerDay) + 1, month = Math.floor((day - 1) / TRAIL_PACE.monthDays);
    if (month !== st.trailMonth) { st.trailMonth = month; st.trailPts = 0; st.trailClaimed = 0; }
    st.trailPts += TRAIL_PACE.stickersPerDay + (day % 7 === 0 ? TRAIL_PACE.weeklyStickers : 0);
    const tier = Math.min(P.TRAIL_TIERS, Math.floor(st.trailPts / P.TRAIL_TIER_COST));
    for (let t = st.trailClaimed + 1; t <= tier; t++) { const r = P.TRAIL_FREE[t - 1] || {};
      const w = {}; ['gold', 'dust'].forEach(k => { if (r[k]) w[k] = Math.max(1, Math.round(r[k] * 0.5)); }); if (Object.keys(w).length) earn(w, 'Trail free lane');
      rt.reach = mapNo; if (r.pack) openPack(packOf(P.mapEndPackId(mapNo), 3, { endReward: true }), { newFirst: true, gated: true }, 'Trail pack');
      if (r.chest) openPack(packOf('silver', 5, { endReward: true }), { newFirst: true, gated: true }, 'Trail chest');
      if (r.faction) cur.left = (cur.left || 0) + 1; }
    st.trailClaimed = Math.max(st.trailClaimed, tier); };
  // buy packs with the pack bank at map N's arrival
  const SALE = { bronze: 5, silver: 8, gold: 13 };
  const buyPacks = mapNo => {
    const series = ['gold', 'silver', 'bronze'], want = P.mapEndPackId(mapNo), order2 = series.slice(series.indexOf(want)).filter(id => SALE[id] <= mapNo);
    for (const id of order2) { const p = shop(id); for (const q of [100, 50, 25, 10, 1]) { for (;;) { const c = q > 1 ? P.packSetCost(p, q) : { gold: p.cost.gold || 0, gems: p.cost.gems || 0 };
      if (st.packBank.gold + 1e-9 < c.gold || st.packBank.gems + 1e-9 < c.gems) break; st.packBank.gold -= c.gold; st.packBank.gems -= c.gems; cur.bought[id] = (cur.bought[id] || 0) + q;
      for (let i = 0; i < q; i++) openPack(packOf(id), null, 'bought ' + id); } } } };
  // the Forge at map N: tier first, then the deck's cards, most copies per Dust first
  const forge = (mapNo, deck) => {
    if (mapNo < FORGE_OPEN) return;
    for (const t of [2, 3]) { const T = gm.UC.forgeTiers[t - 1]; if (st.tier === t - 1 && mapNo >= FORGE_TIER_MAP[t] && st.forgeBank.gold >= T.gold && st.forgeBank.dust >= T.dust) { st.forgeBank.gold -= T.gold; st.forgeBank.dust -= T.dust; st.tier = t; st.forgeTierBought.push({ tier: t, map: mapNo }); cur.forgeTier = t; } }
    if (!deck) return; let n = 0;
    for (;;) { let best = null;
      Object.keys(deck).forEach(id => { const L = st.level[id] != null ? st.level[id] : G.cardBaseLevel(D[id]); if (L >= maxForgeLevel(gm, id, st.tier, mapNo)) return; const c = stepCost(gm, id, L);
        if (c.dust > st.forgeBank.dust || c.gold > st.forgeBank.gold) return; const v = deck[id] / Math.max(1, c.dust); if (!best || v > best.v || (v === best.v && id < best.id)) best = { id, v, c, L }; });
      if (!best) break; st.forgeBank.dust -= best.c.dust; st.forgeBank.gold -= best.c.gold; st.level[best.id] = best.L + 1; n++; }
    cur.forgeLevels = (cur.forgeLevels || 0) + n; };
  // the road
  st.xp += 100; // the tutorials (xpMilestones 'tutorial')
  const fightsAt = i => order.filter(x => x.at === i);
  for (let i = 0; i <= upTo; i++) {
    // arriving at Map i: what the road paid before it is in; the packs it buys, the faction cards of Map i - 1, then Map i's deck and Forge
    if (i > 0) st.log.push(cur);
    cur = { map: i, cards: [], why: {}, earned: {}, src: {}, packs: {}, bought: {} };
    if (i === upTo && !opts.finish) { buyPacks(i); break; }
    if (i === upTo) { buyPacks(i); forge(i, decks(i)); break; }
    buyPacks(i); forge(i, decks(i));
    // Map i's fights (first clears), main and side maps that open now
    (facBy[i] || []).forEach(id => own(id, 1, 'faction track'));
    rt.reach = i; const doneMaps = new Set();
    fightsAt(i).forEach(({ m, n }) => {
      const node = realNode(m.id, n.key) || n; const kind = baseKind(node.kind || 'skirmish'); if (kind === 'tutorial') return;
      const tier = P.CONQUEST_NODE_REWARDS[node.kind] || P.CONQUEST_NODE_REWARDS[kind] || P.CONQUEST_NODE_REWARDS.skirmish, o = (node.rewards || {}).first || {};
      earn({ gold: o.gold != null && o.gold !== '' ? +o.gold : tier.first.gold, dust: o.dust != null && o.dust !== '' ? +o.dust : tier.first.dust }, 'first clears');
      st.xp += 28;
      const cards = uniq(G.nodeRewardCardIds(m.id, node.key).concat(node.firstCard != null ? [].concat(node.firstCard) : [].concat(firstPack[m.id + ':' + node.key] || [])));
      cards.forEach(id => own(id, 1, 'fight reward cards'));
      if (['elite', 'boss', 'raidboss', 'finalboss'].includes(kind)) { const pool = P.packCardPool(D, 'basic', true, true).filter(id => fieldable(gm, id)); const id = P.trackPick(pool, rnd); if (id) own(id, 1, 'base track'); }
      if (node.firstPack && shop(node.firstPack)) openPack(packOf(node.firstPack), null, 'fight free pack');
      if (!m.sub && node.ender) { openPack(packOf(P.mapEndPackId(i), P.MAP_END_PACK_CARDS, { endReward: true }), { newFirst: true, gated: true }, 'end-of-map pack');
        const fp = P.MAP_FREE_PACKS[i]; if (fp && shop(fp)) openPack(packOf(fp), null, 'map free pack'); }
      doneMaps.add(m.id);
    });
    st.xp += 300 * [...doneMaps].length; // a map cleared (approximately: every map with a first clear on this map's day)
    levelTrack(i); trail(i);
  }
  st.arrival = cur; return st;
}

function stateSummary(gm, st, mapNo) {
  const pool = Object.keys(st.owned).filter(id => fieldable(gm, id)).sort(), copies = {};
  pool.forEach(id => { copies[id] = st.unlimited.has(id) ? null : st.owned[id]; });
  const levels = {}; pool.forEach(id => { const b = gm.G.cardBaseLevel(gm.D[id]); if ((st.level[id] || 0) !== b) levels[id] = st.level[id]; });
  return { pool, copies, levels };
}

// ---------------------------------------------------------------- commands
function mapRange(spec) { const out = []; String(spec).split(',').forEach(p => { const m = /^(\d+)-(\d+)$/.exec(p); if (m) { for (let i = +m[1]; i <= +m[2]; i++) out.push(i); } else out.push(+p); }); return out; }
function cmdPools(argv) {
  const gm = game(), mapNo = +arg(argv, '--map'), set = loadSetFile(), mains = mainMaps(gm.G);
  const f = path.join(ROOT, POOLS), cur = fs.existsSync(f) ? JSON.parse(fs.readFileSync(f, 'utf8')) : { about: '', maps: {} };
  const entry = { mapId: mains[mapNo].id, name: mains[mapNo].name, seeds: {} };
  for (const s of SEEDS) {
    const st = walk(s, mapNo, n => chosenDeck(set, n, s));
    const sum = stateSummary(gm, st, mapNo);
    entry.seeds[s] = Object.assign(sum, { prev: chosenDeck(set, mapNo - 1, s) /* --seed-ref starts the search from it */, size: sum.pool.length, bought: st.arrival.bought, packBank: { gold: Math.round(st.packBank.gold), gems: Math.round(st.packBank.gems) } });
    console.log(`Map ${mapNo} seed ${s}: pool ${sum.pool.length}, levelled ${Object.keys(sum.levels).length}, bought ${JSON.stringify(st.arrival.bought)}`);
  }
  cur.about = 'Package REF5: the collection each of the 5 seeded players holds arriving at each main map (tools/opt/ref5_prog.js pools); read by tools/opt/deckopt.js --mode prog. copies: null = unlimited (Base / starter). levels: absolute card levels where not the card\'s own. No "id": tools/opt/ref_decks.js skips this file.';
  cur.tool = 'tools/opt/ref5_prog.js'; cur.maps[mapNo] = entry;
  fs.writeFileSync(f, JSON.stringify(cur) + '\n'); console.log('-> ' + POOLS);
}
function arg(argv, k, d) { const i = argv.indexOf(k); return i >= 0 ? argv[i + 1] : d; }

// the optimizer's output for (map, seed, tag)
function optFile(gm, mapNo, seed, tag) { const m = mainMaps(gm.G)[mapNo]; return `docs/balance/opt/deckopt-map${String(mapNo).padStart(2, '0')}-${m.id}-${tag}-s${seed}.json`; }
function cmdCollect(argv) {
  const gm = game(), mapNo = +arg(argv, '--map'), tag = arg(argv, '--tag'); if (!tag) throw new Error('collect --tag');
  const set = loadSetFile() || { decks: {}, runs: {} }, pools = JSON.parse(fs.readFileSync(path.join(ROOT, POOLS), 'utf8')).maps[mapNo];
  const list = [], runs = [];
  for (const s of SEEDS) {
    const rel = optFile(gm, mapNo, s, tag), fp = path.join(ROOT, rel); if (!fs.existsSync(fp)) throw new Error('no ' + rel);
    const d = JSON.parse(fs.readFileSync(fp, 'utf8')), best = (d.optima || [])[0] || d[d.optimum].best, counts = best.deck;
    const p = pools.seeds[s], bad = Object.keys(counts).filter(id => !p.pool.includes(id) || (p.copies[id] != null && counts[id] > p.copies[id]));
    if (bad.length) throw new Error(`Map ${mapNo} seed ${s}: the optimum breaks the collection: ${bad.join(', ')}`);
    const st = walk(s, mapNo, n => n === mapNo ? counts : chosenDeck(set, n, s), { finish: true });
    const parts = Object.keys(counts).sort().map(id => [id, counts[id], st.level[id] != null ? st.level[id] : gm.G.cardBaseLevel(gm.D[id])]);
    list.push({ seed: s, counts, parts }); runs.push({ seed: s, file: rel, score: best.score, ci: best.ci, pool: p.size, forgeTier: st.tier, forgeBank: { gold: Math.round(st.forgeBank.gold), dust: Math.round(st.forgeBank.dust) } });
  }
  set.id = 'prog'; set.label = 'Reference (Random)'; set.bake = true; set.decksPerMap = SEEDS.length;
  set.note = 'Package REF5 (owner 10-28 22:50 / 10-30): per main map, 5 decks, each the optimizer\'s best deck from one seeded player\'s collection (first clears, faction track, level track, Trail free lane, map packs and the packs 1.0x of the Leaves bought; tools/opt/ref5_prog.js), at the card levels 0.5x of the resources bought in the Forge. parts: [card, copies, absolute level]. A side map plays the decks of the map it opens on. Baked into arena_app.js by tools/opt/ref_decks.js; the game deals one at random ("Reference (Random)").';
  set.decks = set.decks || {}; set.runs = set.runs || {}; set.decks[mapNo] = list; set.runs[mapNo] = { tag, runs };
  fs.writeFileSync(path.join(ROOT, SET), JSON.stringify(set, null, 0).replace(/,"(\d+)":\[/g, ',\n"$1":[') + '\n');
  console.log(`-> ${SET}: Map ${mapNo}, ${list.length} decks; mean level ${list.map(x => meanLevel(x.parts).toFixed(2)).join(' ')}`);
}
function meanLevel(parts) { const n = parts.reduce((t, p) => t + p[1], 0); return n ? parts.reduce((t, p) => t + p[1] * p[2], 0) / n : 0; }

function cmdRun(argv) {
  const gm = game(), maps = mapRange(arg(argv, '--maps')), tag = arg(argv, '--tag', '2026-10-30-ref5'), budget = arg(argv, '--budget', '1500'), pop = arg(argv, '--pop', '8'), g0 = arg(argv, '--g0', '1'), /* from Map 8: 1500 games, population 8, 1 game a gauntlet entry on the first rung, gmax 8, one restart (Map 8 seeds 1-2: gmax 32, two restarts), so the search gets several generations on a shared machine */ fg = arg(argv, '--final-games', '4') /* Maps 0-6 and Map 7 seeds 1-2 ran at 3000 / 16 (Map 0-5 32); from Map 7 seed 5 on 1200 / 4 (Map 7 seeds 3-4: 1200 / 8), seeded with the player's previous deck: the machine was shared (load 8-11 on 2 cores) */;
  const half = arg(argv, '--part'); // a = the pools + seeds 1-2, b = seeds 3-4, c = seed 5 + collect (each well under 10 minutes on a shared machine)
  const only = half === 'a' ? [1, 2] : half === 'b' ? [3, 4] : half === 'c' ? [5] : arg(argv, '--seeds') ? mapRange(arg(argv, '--seeds')) : SEEDS, step0 = arg(argv, '--step', 'all');
  for (const n of maps) {
    for (const step of half === 'a' ? ['pools', 'opt'] : half === 'b' ? ['opt'] : half === 'c' ? ['opt', 'collect'] : [step0]) {
    if (step === 'all' || step === 'pools') cp.execFileSync('node', [__filename, 'pools', '--map', String(n)], { cwd: ROOT, stdio: 'inherit' });
    if (step === 'all' || step === 'opt') for (const s of only) {
      if (fs.existsSync(path.join(ROOT, optFile(gm, n, s, tag))) && !argv.includes('--redo')) { console.log(`Map ${n} seed ${s}: done`); continue; }
      cp.execFileSync('node', [path.join(ROOT, 'tools/opt/deckopt.js'), '--map', String(n), '--mode', 'prog', '--prog-seed', String(s), '--pool-file', POOLS, '--level', 'ref', '--budget', budget, '--final-games', fg,
        '--ladder', 'none', '--distinct-max', '1', '--seed-ref', '--pop', pop, '--children', String(2 * +pop), '--g0', g0, '--gmax', '8', '--restarts', '1', '--workers', '2', '--tag', tag + '-s' + s, '--seed', 'ref5-s' + s, '--quiet', '--no-summary', '--ckpt-dir', '/home/claude/bench-cache-ref5/ckpt'], { cwd: ROOT, stdio: 'inherit' });
    }
    if (step === 'all' || step === 'collect') cp.execFileSync('node', [__filename, 'collect', '--map', String(n), '--tag', tag], { cwd: ROOT, stdio: 'inherit' });
    }
  }
}

// the next steps in order (a map's pools, its seeds one by one, its collect, then the next map), starting new work only while --minutes are
// left, so one command stays well under 10 minutes on a shared machine
function cmdAuto(argv) {
  const gm = game(), to = +arg(argv, '--to', MAX_MAP), mins = +arg(argv, '--minutes', 5), tag = arg(argv, '--tag', '2026-10-30-ref5'), t0 = Date.now(), left = () => Date.now() - t0 < mins * 60000;
  for (let n = 0; n <= to; n++) {
    const set = loadSetFile(); if (set && set.decks && set.decks[n] && set.decks[n].length === SEEDS.length) continue;
    const pf = path.join(ROOT, POOLS), pools = fs.existsSync(pf) ? JSON.parse(fs.readFileSync(pf, 'utf8')).maps : {};
    if (!pools[n] || !left()) { if (!left()) return console.log('time up before Map ' + n); cmdRun(['--maps', String(n), '--step', 'pools', '--tag', tag]); }
    for (const s of SEEDS) { if (fs.existsSync(path.join(ROOT, optFile(gm, n, s, tag)))) continue; if (!left()) return console.log(`time up: Map ${n} seed ${s} next`); cmdRun(['--maps', String(n), '--step', 'opt', '--seeds', String(s), '--tag', tag]); console.log(`Map ${n} seed ${s} done ${Math.round((Date.now() - t0) / 1000)} s`); }
    cmdRun(['--maps', String(n), '--step', 'collect', '--tag', tag]);
  }
  console.log('all maps done');
}
function cmdEcon(argv) {
  const gm = game(), set = loadSetFile(), upTo = +arg(argv, '--to', MAX_MAP), out = { pace: TRAIL_PACE, mult: MULT, maps: {} };
  for (const s of SEEDS) {
    const st = walk(s, upTo, n => chosenDeck(set, n, s), { finish: true });
    st.log.concat([st.arrival]).forEach(r => { const o = out.maps[r.map] = out.maps[r.map] || { seeds: {} };
      o.seeds[s] = { earned: r.earned, src: r.src, bought: r.bought, packs: r.packs, newCards: r.cards.length, forgeLevels: r.forgeLevels || 0, forgeTier: r.forgeTier || null, freeLevels: r.freeLevels || 0, leftOutFactionPacks: r.left || 0 }; });
  }
  if (argv.includes('--json')) { const f = arg(argv, '--json'); fs.writeFileSync(path.join(ROOT, f), JSON.stringify(out, null, 1) + '\n'); console.log('-> ' + f); }
  Object.keys(out.maps).sort((a, b) => a - b).forEach(m => { const S = out.maps[m].seeds, v = k => SEEDS.map(s => (S[s] || {})[k]);
    const earned = k => Math.round(SEEDS.reduce((t, s) => t + (((S[s] || {}).earned || {})[k] || 0), 0) / SEEDS.length);
    const bought = SEEDS.map(s => Object.entries((S[s] || {}).bought || {}).map(([k, n]) => n + ' ' + k).join('+') || '-');
    console.log(`Map ${String(m).padStart(2)}  earned x1.5 (mean): ${earned('gold')} Leaves ${earned('gems')} Gold Leaves ${earned('dust')} Dust | bought at arrival: ${bought.join(' / ')} | Forge levels ${v('forgeLevels').join(' ')}`); });
}

function main(argv) {
  const cmd = argv[0];
  if (cmd === 'pools') return cmdPools(argv);
  if (cmd === 'collect') return cmdCollect(argv);
  if (cmd === 'run') return cmdRun(argv);
  if (cmd === 'econ') return cmdEcon(argv);
  if (cmd === 'auto') return cmdAuto(argv);
  if (cmd === 'measure') return require('./ref5_measure.js').main(argv.slice(1));
  console.log(fs.readFileSync(__filename, 'utf8').split('\n').slice(1, 12).map(l => l.replace(/^\/\/ ?/, '')).join('\n'));
}
if (require.main === module) main(process.argv.slice(2));
module.exports = { walk, game, stateSummary, stepCost, maxForgeLevel, POOLS, SET, SEEDS, MULT, TRAIL_PACE, mainMaps, meanLevel };
