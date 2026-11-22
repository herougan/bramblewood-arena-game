#!/usr/bin/env node
// ECON1 phase 1 (2026-11-22, owner 23:08: "advise AND execute first ... what you think is a good currency flow - skirmish rewards, reward
// growth, pack costs etc. I think a pack should instead contain 5 cards by default now, instead of 3"): walks a player through Maps 0-20 and
// their side maps, map by map, under today's numbers ("current") and docs/design/econ1-2026-11-22.md's ("proposed"), and prints currency over
// time, packs opened per map and how much of the next map's BPRO-1 deck (its pack-card copies) the player could field. Changes no game number.
//   node tools/econ1_sim.js [--road docs/balance/skirmish-pass-post1122.jsonl] [--plan current|proposed|both] [--player road|casual|dedicated|pass|all]
//     [--summary] [--churn 8] [--price 80,100,125] [--gstep 0.10] [--dstep 0.05] [--json]   (no files written; prints markdown)
// Road: every fight of the road measure (win rate = its measured rate, floor 15%), Energy from the game's nodeEnergyCost; side maps from the map
// that opens them (mapUnlockNumberOf), up to Map 20. Expected values, not dice: a fight won with chance p costs 1/p tries; a pack adds its
// expected copies to every card of its pool (Poisson per card). Game tables are read from arena_app.js (lib_bramble grab, ECON1's halving
// applied as the source applies it); the PROPOSED block and the ASSUMPTIONS block are the two things to argue with.
'use strict';
const fs = require('fs'), path = require('path');
const ROOT = path.join(__dirname, '..');
const B = require(path.join(__dirname, 'lib_bramble.js')), G = B.G, DEFS = B.CARD_DEFS_BASELINE;
const args = process.argv.slice(2), opt = (k, d)=>{ const a = args.find(x=> x.startsWith('--' + k + '=')); if(a) return a.split('=')[1]; const i = args.indexOf('--' + k); return i >= 0 && args[i + 1] && !args[i + 1].startsWith('--') ? args[i + 1] : d; };
const ROAD = path.resolve(ROOT, opt('road', 'docs/balance/skirmish-pass-post1122.jsonl'));
const UC = JSON.parse(fs.readFileSync(path.join(ROOT, 'canonical/upgrade-costs.json'), 'utf8'));
const PRO = JSON.parse(fs.readFileSync(path.join(ROOT, 'canonical/pro-skirmishes.json'), 'utf8')).maps;

// ---------- the game's tables (as tools/econ2/econ_sim_2026_11_03.js reads them) ----------
const econSrc = ['ECON_INCOME_MULT', 'ECON_HALVED_KINDS', 'econMult', 'econScale', 'econScaleTable'].map(B.grab).join('\n');
function ev(name){ const decl = B.grab(name), at = B.src.indexOf(decl) + decl.length, next = B.src.slice(at, at + 400).split('\n').find(l=> /^econScaleTable\(/.test(l.trim())) || '';
  return new Function('TX', econSrc + '\n' + decl + '\n' + (next.includes(name) ? next : '') + '\nreturn ' + name + ';')(k=> k); }
const evLine = (first, names)=> new Function(B.grab(first) + '\nreturn {' + names.join(',') + '};')();
const N = {NODE: ev('CONQUEST_NODE_REWARDS'), RANK_MULT: ev('RANK_MULT'), QRR: ev('QUEST_RANK_REWARD'), QRW: ev('QUEST_RANK_WEIGHT'), QT: ev('QUEST_TIERS'),
  SHOP: ev('SHOP_PACKS_DEFAULT'), FREE: ev('MAP_FREE_PACKS'), PCS: ev('PACK_COMMON_SHARE'), PUS: ev('PACK_UPPER_SHARE'), MAT: ev('PACK_MATERIA_PCT'), SALE: ev('PACK_SALE_MAP'),
  DDP: ev('DAILY_DUNGEON_PAY'), DDW: ev('DAILY_DUNGEON_WEEK'), STAMINA: ev('STAMINA_PLACES'), ENERGY_MAX_BASE: ev('ENERGY_MAX_BASE'), TIER_METAL: ev('FORGE_TIER_METAL'),
  ...evLine('MAP_END_PACKS', ['MAP_END_PACK_CARDS']), ...evLine('FACTION_PACK_OWN', ['FACTION_PACK_OWN', 'FACTION_PACK_GENERAL']), ...evLine('FREE_ENERGY_KEY', ['FREE_ENERGY_AMOUNT']), ...evLine('ENERGY_CAPSULE_KEY', ['ENERGY_CAPSULE_AMOUNT'])};
const econ = new Function(econSrc + '\nreturn {econScale};')();
const MAIN = G.CONQUEST_MAPS.filter(m=> !m.sub && !m.reserved);
const nodeEnergyCost = new Function('CONQUEST_MAPS', 'mainConquestMaps', 'baseKind', B.grab('mapEnergyBase') + '\n' + B.grab('nodeEnergyCost') + '\nreturn nodeEnergyCost;')(G.CONQUEST_MAPS, ()=> MAIN, G.baseKind);
const MU_DUST = UC.materiaUnit.dust;
// 2026-11-23 (ECON1 phase 2): the "current" plan pays a first clear through the game's own nodeRewardTier (CONQUEST_NODE_REWARDS, the
// FIRST_CLEAR_MAP_STEP growth and the nodes' overrides as built), so a re-run reads the game, not a copy. Code from before phase 2 has no
// FIRST_CLEAR_MAP_STEP; nodeRewardTier is guarded for that and pays the flat rows.
const gameTier = (()=>{ const has = n=>{ try{ return B.grab(n); }catch(e){ return ''; } };
  return new Function('baseKind', 'mapUnlockNumberOf', 'mapOfNode', 'CONQUEST_MAPS', 'nodeEnergyCost', econSrc + '\n' + B.grab('CONQUEST_NODE_REWARDS') + '\n' + has('FIRST_CLEAR_MAP_STEP') + '\n' + B.grab('nodeRewardTier') + '\nreturn nodeRewardTier;')(G.baseKind, G.mapUnlockNumberOf, G.mapOfNode, G.CONQUEST_MAPS, nodeEnergyCost); })();
const GAME_STEP = (()=>{ try{ return new Function(B.grab('FIRST_CLEAR_MAP_STEP') + '\nreturn FIRST_CLEAR_MAP_STEP;')(); }catch(e){ return {gold: 0, dust: 0}; } })();

// ---------- PROPOSED (docs/design/econ1-2026-11-22.md, section 9) ----------
const PROPOSED = {
  packCards: 5,                                   // owner 23:08: 5 cards a pack by default (shop, free and map-end packs)
  packCost: (([b, s, g])=> ({bronze: {gold: b, gems: 0}, silver: {gold: s, gems: 0}, gold: {gold: g, gems: 0}, mystery: {gold: 120, gems: 0}}))(String(opt('price', '80,100,125')).split(',').map(Number)),
  endCards: 5,                                    // MAP_END_PACK_CARDS 3 -> 5
  factionCards: 3,                                // faction packs keep 2 + 1 (they pace the faction track)
  firstStep: {gold: +opt('gstep', 0.10), dust: +opt('dstep', 0.05)},            // first-clear Leaves / Dust + this share a map number (side maps: the map that opens them)
  extraRows: {miniboss: {first: {gold: 95, dust: 115}, repeat: {gold: 18, dust: 7}}}, // a mini-boss map ender pays between elite and boss
  passGemPrice: {bronze: 40, silver: 60, gold: 75}, // a Gold-Leaves-only price (D35 / D75 first prices, scaled to 5 cards); needs a store, not 1.0
  sideRule: true,                                 // the 41 side-map nodes with a hand-set first-clear pay (2-B, 5-A, 7-A, 8-A, 11-A, 18-A, 20-A, 20-B) follow the rule
  passSeries: true,                               // the Pass's daily pack is the current series (D35 said a Hedgerow Pouch)
};
const CURRENT = {packCards: null, packCost: null, endCards: N.MAP_END_PACK_CARDS, factionCards: N.FACTION_PACK_OWN + N.FACTION_PACK_GENERAL, firstStep: GAME_STEP, extraRows: {}, passGemPrice: null, passSeries: false, sideRule: false, game: true}; // the game as its arena_app.js stands

// ---------- ASSUMPTIONS (argue with these) ----------
const A = {
  winFloor: 0.15, murgleWin: 0.70, pvpWin: 0.55, coopFull: 0.5, coopPart: 0.25, // a co-op run: half are full clears, the rest pay x0.25 of 2-3 parts
  deck: [['common', 13], ['uncommon', 6], ['rare', 1]], newCopiesPerMap: +opt('churn', 8),    // the Forge model: a 20-card deck, 8 new copies (Level 1) a map from Map 12
  passGemsStart: 330, passGemsDay: 15, passPouchDay: 1,                          // the Bramble Pass as priced in D35 / D75 (not built)
};
const PLAYERS = {
  road: {label: 'Clears each map once (first clears only, no dailies)', daily: false},
  casual: {label: 'Free, casual (2 sessions a day, 3 notices, 3 PvP)', daily: true, sessions: 2, notices: 3, pvp: 3, coop: 1},
  dedicated: {label: 'Free, dedicated (Energy never capped, 6 notices, 10 PvP)', daily: true, regenHours: 16, notices: 6, pvp: 10, coop: 1},
  pass: {label: 'Paying: casual + Bramble Pass (D35 prices, not built)', daily: true, sessions: 2, notices: 3, pvp: 3, coop: 1, pass: true},
};

// ---------- the road (fights per map from the measure) ----------
const rows = fs.readFileSync(ROAD, 'utf8').trim().split('\n').map(l=> JSON.parse(l)).filter(r=> !r.endless && !/^T-/.test(r.code) && !['mm', 'muc', 'mtut'].includes(r.map));
const fightsAt = {}; // unlock map number -> [{row, node, map, e, p}]
rows.forEach(r=>{ const n = r.side ? G.mapUnlockNumberOf(r.map) : r.mapNo; if(!(n >= 0 && n <= 20)) return;
  const map = G.CONQUEST_MAPS.find(m=> m.id === r.map), node = B.byKey(r.map, r.key); if(!map || !node) return;
  (fightsAt[n] = fightsAt[n] || []).push({r, node, map, n, e: nodeEnergyCost(map, node), p: Math.max(A.winFloor, r.win / 100)}); });

// ---------- packs: per-card odds of a numbered pack, from the game's pools ----------
const BONUS = {common: 0.05, starter: 0.05, uncommon: 0.04, rare: 0.03, veryrare: 0.02, superrare: 0.01};
const tierIds = {1: G.packTierCardIds(1), 2: G.packTierCardIds(2), 3: G.packTierCardIds(3)};
const cls = r=> (r === 'starter' || !r) ? 'common' : r;
function cardOdds(t){ // id -> chance a card slot is that card (packRarityShares, then even within the rarity)
  const ids = tierIds[t], by = {}; ids.forEach(id=> (by[cls(DEFS[id].rarity)] = by[cls(DEFS[id].rarity)] || []).push(id));
  const cs = N.PCS[t], up = Object.keys(N.PUS).filter(k=> by[k]), upT = up.reduce((s, k)=> s + N.PUS[k], 0), out = {};
  (by.common || []).forEach(id=> out[id] = cs / 100 / by.common.length);
  up.forEach(k=> by[k].forEach(id=> out[id] = (100 - cs) / 100 * N.PUS[k] / upT / by[k].length));
  return out; }
const ODDS = {1: cardOdds(1), 2: cardOdds(2), 3: cardOdds(3)};
const TIER_OF = {bronze: 1, silver: 2, gold: 3};
const endPackId = n=> n <= 6 ? 'bronze' : n <= 13 ? 'silver' : 'gold';
const poisMin = (lam, k)=>{ let p = Math.exp(-lam), s = 0, cdfTerm = 0; for(let i = 0; i < k; i++){ s += i * p; cdfTerm += p; p *= lam / (i + 1); } return s + k * (1 - cdfTerm); }; // E[min(X, k)]

function plan(name){ const P = name === 'proposed' ? PROPOSED : CURRENT;
  const shop = id=>{ const p = N.SHOP.find(x=> x.id === id); return {cards: P.packCards || p.cards, cost: P.packCost ? P.packCost[id] : p.cost, metal: p.metal || 0, dust: econ.econScale('packDust', 'dust', MU_DUST * (N.MAT[id] || 0) / 100)}; };
  const firstPay = (node, n, side)=>{ if(P.game){ const t = gameTier(node, G.mapOfNode(node)); return {gold: t.first.gold, dust: t.first.dust}; } const row = P.extraRows[node.kind] || N.NODE[node.kind] || N.NODE[G.baseKind(node.kind)]; const o = (P.sideRule && side) ? {} : ((node.rewards && node.rewards.first) || {});
    const f = k=> o[k] != null && o[k] !== '' ? +o[k] : Math.round(row.first[k] * (1 + (P.firstStep[k] || 0) * n)); return {gold: f('gold'), dust: f('dust')}; };
  return {name, P, shop, firstPay}; }

// ---------- one player through Maps 0-20 ----------
function walk(PL, plan){
  const W = {gold: 0, dust: 0, gems: 0, metal: 0}, lam = {}, out = [], spent = {dust: 0, gold: 0, packGold: 0};
  let day = 0, cap = N.ENERGY_MAX_BASE, nest = 0, forgeSt = 0, forgeTier = 1, disDone = 0, gemsSpent = 0;
  const deck = []; A.deck.forEach(([r, k])=>{ for(let i = 0; i < k; i++) deck.push({r, lv: 1}); });
  const mult = r=> UC.levelCostMult[r] || 1;
  const addPack = (t, cards, gatedTo)=>{ if(!ODDS[t]) return; if(gatedTo != null){ const pool = tierIds[t].filter(id=>{ const f = G.cardFirstMapList(DEFS[id]); return !f || f.n <= gatedTo; }); pool.forEach(id=> lam[id] = (lam[id] || 0) + cards / pool.length); return; }
    Object.entries(ODDS[t]).forEach(([id, p])=> lam[id] = (lam[id] || 0) + cards * p * (1 + (BONUS[cls(DEFS[id].rarity)] || 0))); };
  const resetFor = (n, dk)=>{ if(n >= 12) for(let i = 0; i < A.newCopiesPerMap; i++) dk[((n - 12) * A.newCopiesPerMap + i) % dk.length].lv = 1; };
  const forgeSteps = (n, dk)=>{ if(n < 11) return {steps: [], tier: 0}; // every Forge step that brings the deck to referencePlayerLevel(n), lowest level first
    const L = G.referencePlayerLevel(n), mx = G.levelMix(L), nHi = Math.round(dk.length * mx.frac), steps = [];
    dk.forEach((c, i)=>{ const want = i < nHi ? mx.hi : mx.lo; for(let l = c.lv; l < want; l++){ const d = UC.forgeStepDust[Math.min(9, l)] * mult(c.r); steps.push({i, to: l + 1, dust: d, gold: Math.round(d * 2 / 3)}); } });
    steps.sort((a, b)=> a.to - b.to); return {steps, tier: steps.some(x=> x.to >= 4) && forgeTier < 2 ? 1 : 0}; };
  const T2 = UC.forgeTiers[1];
  const forgeNeed = (n, dk)=>{ const f = forgeSteps(n, dk || deck); const dust = f.steps.reduce((s, x)=> s + x.dust, 0) + (f.tier ? T2.dust : 0), gold = f.steps.reduce((s, x)=> s + x.gold, 0) + (f.tier ? T2.gold : 0); return {dust, gold, tier: f.tier}; };
  const nextNeed = n=>{ const dk = deck.map(c=> Object.assign({}, c)); resetFor(n, dk); return forgeNeed(n, dk); };
  const payForge = n=>{ const f = forgeSteps(n, deck); let short = 0;
    if(f.tier){ if(W.dust >= T2.dust && W.gold >= T2.gold && W.metal >= N.TIER_METAL[2]){ W.dust -= T2.dust; W.gold -= T2.gold; W.metal -= N.TIER_METAL[2]; forgeTier = 2; } }
    for(const x of f.steps){ if(x.to >= 4 && forgeTier < 2){ short += x.dust; continue; } if(W.dust >= x.dust && W.gold >= x.gold){ W.dust -= x.dust; W.gold -= x.gold; deck[x.i].lv = x.to; spent.dust += x.dust; spent.gold += x.gold; } else short += x.dust; }
    return short; };
  // daily income (per day) by map number
  const nr = Object.keys(N.QRW), nAvg = k=> nr.reduce((s, r)=> s + N.QRW[r] / 100 * ((N.QRR[r] || {})[k] || 0), 0);
  const wk = n=>{ if(n < 4) return {gold: 0, dust: 0, metal: 0}; const T = N.QT.weekly, q = [T[0].quests.length, T[1].quests.length, n >= 11 ? (PL.pvp >= 5 ? 2 : 1) : 0]; // tier 3: the PvP quests from the Arena (Map 11); raid quests not before Map 21
    return ['gold', 'dust', 'metal'].reduce((o, k)=> (o[k] = q.reduce((s, c, i)=> s + c * (T[i].reward[k] || 0), 0), o), {}); };
  const coopRun = (()=>{ const full = [2500, 3000, 3500, 4000, 5000].reduce((s, x)=> s + x, 0) * 1.1, avg = full * (A.coopFull + (1 - A.coopFull) * A.coopPart * 0.5); return {gold: econ.econScale('coopDungeon', 'gold', avg / 48), dust: econ.econScale('coopDungeon', 'dust', 3 * avg / 190)}; })();
  const daily = n=>{ if(!PL.daily) return {gold: 0, dust: 0, gems: 0, metal: 0, coopE: 0}; const o = {gold: 0, dust: 0, gems: 0, metal: 0, coopE: 0};
    if(n >= 4){ o.gold += PL.notices * nAvg('gold'); o.dust += PL.notices * nAvg('dust'); o.gems += PL.notices * nAvg('gems'); o.metal += PL.notices * nAvg('metal'); const w = wk(n); o.gold += w.gold / 7; o.dust += w.dust / 7; o.metal += w.metal / 7; }
    if(n >= 11){ const keys = (N.DDW.keysPerDay * 7 + N.DDW.mondayKeys) / 7 * A.murgleWin; o.gold += keys * N.DDP.mm.gold; o.dust += keys * N.DDP.mm.dust; o.gold += PL.pvp * econ.econScale('arena', 'gold', A.pvpWin * 4 + (1 - A.pvpWin) * 1); }
    if(n >= 16 && PL.coop){ o.gold += coopRun.gold * PL.coop; o.dust += coopRun.dust * PL.coop; o.coopE = 5 * PL.coop; }
    return o; };
  const eDay = ()=> PL.regenHours ? PL.regenHours * 12 + cap + N.FREE_ENERGY_AMOUNT : PL.sessions * (cap + 6) + N.FREE_ENERGY_AMOUNT;
  const repeatPay = n=>{ const fs = (fightsAt[n] || []).filter(f=> G.baseKind(f.node.kind) === 'skirmish'); const e = fs.length ? fs.reduce((s, f)=> s + f.e, 0) / fs.length : 1; // per Energy of a repeat skirmish, rank S
    return {gold: econ.econScale('conquestRepeat', 'gold', 8 * e) * N.RANK_MULT.S / e, dust: econ.econScale('conquestRepeat', 'dust', 2 * e) * N.RANK_MULT.S / e, drop: 0.01}; };
  for(let n = 0; n <= 20; n++){
    const fights = fightsAt[n] || [], row = {map: n, fights: fights.length, energy: 0, fcGold: 0, fcDust: 0, bought: 0, boughtGems: 0, free: 0, end: 0, faction: 0, pass: 0, waitDays: 0};
    // 1. arrive: the Forge (from Map 11), new copies swapped in from Map 12
    resetFor(n, deck);
    const need = forgeNeed(n); row.forgeDust = need.dust;
    const d0 = daily(n), rp = repeatPay(n);
    if(PL.daily && (need.dust > W.dust || need.gold > W.gold)){ // short: a daily player farms repeats and dailies until it can pay
      const E = Math.max(0, eDay() - d0.coopE), dd = d0.dust + E * rp.dust, dg = d0.gold + E * rp.gold;
      const w = Math.max(need.dust > W.dust ? (need.dust - W.dust) / dd : 0, need.gold > W.gold ? (need.gold - W.gold) / dg : 0);
      row.waitDays = w; day += w; W.dust += w * dd; W.gold += w * dg; W.gems += w * d0.gems; W.metal += w * d0.metal; Object.entries(ODDS[TIER_OF[endPackId(n)]]).forEach(([id, p])=> lam[id] = (lam[id] || 0) + w * E * rp.drop * p); }
    const short = payForge(n); if(short > 0) row.forgeGap = Math.round(short); // the road player levels what it can (lowest steps first)
    // 2. the map's fights: Energy with losses, first clears
    fights.forEach(f=>{ row.energy += f.e / f.p; const pay = plan.firstPay(f.node, f.n, !!f.r.side); row.fcGold += pay.gold; row.fcDust += pay.dust; });
    W.gold += row.fcGold; W.dust += row.fcDust;
    if(PL.daily){ const days = row.energy / Math.max(1, eDay() - d0.coopE); day += days; W.gold += days * d0.gold; W.dust += days * d0.dust; W.gems += days * d0.gems; W.metal += days * d0.metal; row.days = days + row.waitDays;
      if(PL.pass){ const pd = days + row.waitDays; W.gems += pd * A.passGemsDay + (n === 0 ? A.passGemsStart : 0); row.pass = pd * A.passPouchDay; const pid = plan.P.passSeries ? (['gold', 'silver', 'bronze'].find(id=> n >= N.SALE[id]) || 'bronze') : 'bronze'; addPack(TIER_OF[pid], row.pass * plan.shop(pid).cards); W.dust += row.pass * plan.shop(pid).dust; } }
    // 3. the map's end: map-end pack (gated, new cards first), faction pack, free pack
    if(n >= 0){ row.end = 1; addPack(TIER_OF[endPackId(n)], plan.P.endCards, n); row.faction = 1; }
    const fp = N.FREE[n]; if(fp){ row.free = 1; const s = plan.shop(fp); addPack(TIER_OF[fp], s.cards); W.dust += s.dust; W.metal += s.metal; }
    // 4. Max Energy (daily players): the next step when Dust is spare (Nest from Map 3, Forge steps from Map 11)
    if(PL.daily){ const st = nest < 2 && n >= 3 ? N.STAMINA.nest.costs[nest] : (n >= 11 && forgeSt < 4 ? N.STAMINA.forge.costs[forgeSt] : null); const nx = nextNeed(n + 1);
      if(st && W.dust - nx.dust > st.dust + 200){ W.dust -= st.dust; cap += 5; if(nest < 2) nest++; else forgeSt++; } }
    // 5. buy packs with the Leaves the next map's Forge step does not need: the newest series on sale (Pouch 5, Chest 8, Case 13)
    const nx = nextNeed(n + 1), reserve = n + 1 >= 11 ? nx.gold : 0, onSale = ['gold', 'silver', 'bronze'].filter(id=> n >= N.SALE[id]);
    for(const id of onSale){ const s = plan.shop(id); let guard = 0;
      while(guard++ < 2000 && W.gold - s.cost.gold >= reserve && W.gems >= (s.cost.gems || 0)){ W.gold -= s.cost.gold; spent.packGold += s.cost.gold; W.gems -= s.cost.gems || 0; W.dust += s.dust; W.metal += s.metal; addPack(TIER_OF[id], s.cards); row.bought++; row.boughtCards = (row.boughtCards || 0) + s.cards; }
      if(PL.pass && plan.P.passGemPrice){ const gp = plan.P.passGemPrice[id]; while(W.gems >= gp){ W.gems -= gp; gemsSpent += gp; addPack(TIER_OF[id], s.cards); row.boughtGems++; row.boughtCards = (row.boughtCards || 0) + s.cards; } } }
    // 6. extra copies past the copy cap melt to Dust (the quick Disenchant button)
    let dis = 0; Object.entries(lam).forEach(([id, l])=>{ const r = DEFS[id].rarity, c = G.maxCopiesForRarity(r); dis += (l - poisMin(l, c)) * (UC.disenchantDust[cls(r)] || 5); });
    W.dust += dis - disDone; row.disDust = dis - disDone; disDone = dis;
    // 7. readings: BPRO-1 of the next main map, its pack-card copies the player could field
    const nextMain = MAIN[n + 1], bp = nextMain && PRO[nextMain.id] && (PRO[nextMain.id].bpro || [])[0];
    if(bp){ let needC = 0, have = 0; Object.entries(bp.deck).forEach(([id, k])=>{ if(!G.basicPackTierOf(DEFS[id] || {})) return; needC += k; have += poisMin(lam[id] || 0, k); }); row.cover = needC ? have / needC : null; row.coverNeed = needC; }
    const s = plan.shop('bronze'); row.cardsFromPacks = (row.boughtCards || 0) + row.pass * s.cards + row.end * plan.P.endCards + row.faction * plan.P.factionCards + (fp ? plan.shop(fp).cards : 0);
    row.seen = [1, 2, 3].reduce((t, k)=> t + tierIds[k].reduce((u, id)=> u + 1 - Math.exp(-(lam[id] || 0)), 0), 0) / (tierIds[1].length + tierIds[2].length + tierIds[3].length); row.day = PL.daily ? day : null; row.spent = Object.assign({}, spent); row.disTotal = disDone; row.wallet = {gold: Math.round(W.gold), dust: Math.round(W.dust), gems: Math.round(W.gems), metal: Math.round(W.metal)};
    out.push(row);
  }
  return out;
}

// ---------- report ----------
const plans = (opt('plan', 'both') === 'both' ? ['current', 'proposed'] : [opt('plan')]).map(plan);
const players = opt('player', 'all') === 'all' ? Object.keys(PLAYERS) : [opt('player')];
const R = {}; plans.forEach(pl=> players.forEach(k=> R[pl.name + ':' + k] = walk(PLAYERS[k], pl)));
const f0 = x=> x == null ? '-' : Math.round(x).toLocaleString('en-US'), pc = x=> x == null ? '-' : Math.round(100 * x) + '%', f1 = x=> x == null ? '-' : (Math.round(x * 10) / 10).toString();
if(args.includes('--json')){ process.stdout.write(JSON.stringify({road: path.relative(ROOT, ROAD), assumptions: A, proposed: PROPOSED, runs: R}, null, 1) + '\n'); process.exit(0); }
if(args.includes('--summary')){ console.log(`Deck churn ${A.newCopiesPerMap} copies a map.\n\n| Plan: player | Packs opened (bought a map, Maps 5-20) | Pack cards | Next-map BPRO pack copies held (mean Maps 6-20) | P1-P3 cards seen | Map 20 cleared (day; Forge wait days) | Map 20 wallet 🍁 / ✨ / 🍂 / 🔩 | Forge ✨ spent (short) | Disenchant ✨ |\n|---|---|---|---|---|---|---|---|---|`);
  for(const key of Object.keys(R)){ const rs = R[key], packs = rs.reduce((t, r)=> t + r.bought + (r.boughtGems || 0) + r.free + r.end + r.faction + r.pass, 0), cards = rs.reduce((t, r)=> t + r.cardsFromPacks, 0), w = rs[20].wallet, gap = rs.reduce((t, r)=> t + (r.forgeGap || 0), 0), wait = rs.reduce((t, r)=> t + (r.waitDays || 0), 0);
    console.log(`| ${key} | ${f0(packs)} (${f1(rs.slice(5).reduce((t, r)=> t + r.bought + (r.boughtGems || 0) + r.pass, 0) / 16)}) | ${f0(cards)} | ${pc(rs.slice(5, 20).reduce((t, r)=> t + (r.cover || 0), 0) / 15)} | ${pc(rs[20].seen)} | ${rs[20].day == null ? '-' : f1(rs[20].day) + '; ' + f1(wait)} | ${f0(w.gold)} / ${f0(w.dust)} / ${f0(w.gems)} / ${f0(w.metal)} | ${f0(rs[20].spent.dust)}${gap ? ' (' + f0(gap) + ')' : ''} | ${f0(rs[20].disTotal)} |`); } process.exit(0); }
console.log(`ECON1 sim (deck churn ${A.newCopiesPerMap} copies a map from Map 12): road ${path.relative(ROOT, ROAD)} (${rows.length} fights read, ${Object.values(fightsAt).flat().length} walked on Maps 0-20 incl. side maps)`);
console.log(`Pack pools: P1 ${tierIds[1].length}, P2 ${tierIds[2].length}, P3 ${tierIds[3].length} cards.`);
for(const key of Object.keys(R)){ const [pn, pk] = key.split(':'), rs = R[key];
  console.log(`\n### ${pn}: ${PLAYERS[pk].label}`);
  console.log('| Map | Fights | Energy | Day | 1st-clear 🍁 / ✨ | Packs bought | Free + end + faction | Cards from packs | 🍁 held | ✨ held | 🍂 held | Forge ✨ (gap) | Next map BPRO pack copies held |');
  console.log('|---|---|---|---|---|---|---|---|---|---|---|---|---|');
  rs.forEach(r=> console.log(`| ${r.map} | ${r.fights} | ${f0(r.energy)} | ${r.day == null ? '-' : f1(r.day)} | ${f0(r.fcGold)} / ${f0(r.fcDust)} | ${r.bought + (r.boughtGems ? ` + ${r.boughtGems} 🍂` : '') + (r.pass ? ` + ${f1(r.pass)} Pass` : '')} | ${r.free} + ${r.end} + ${r.faction} | ${f0(r.cardsFromPacks)} | ${f0(r.wallet.gold)} | ${f0(r.wallet.dust)} | ${f0(r.wallet.gems)} | ${r.forgeDust ? f0(r.forgeDust) + (r.forgeGap ? ` (${f0(r.forgeGap)})` : '') : '-'} | ${pc(r.cover)} |`));
  const tot = rs.reduce((s, r)=> ({packs: s.packs + r.bought + (r.boughtGems || 0) + r.free + r.end + r.faction + r.pass, cards: s.cards + r.cardsFromPacks, fc: s.fc + r.fcGold, fd: s.fd + r.fcDust, gap: s.gap + (r.forgeGap || 0)}), {packs: 0, cards: 0, fc: 0, fd: 0, gap: 0});
  console.log(`Total Maps 0-20: ${f0(tot.packs)} packs, ${f0(tot.cards)} pack cards; first clears ${f0(tot.fc)} 🍁 / ${f0(tot.fd)} ✨; Forge spent ${f0(rs[20].spent.dust)} ✨ / ${f0(rs[20].spent.gold)} 🍁; packs ${f0(rs[20].spent.packGold)} 🍁; disenchant ${f0(rs[20].disTotal)} ✨; Map 20 cleared on day ${rs[20].day == null ? '-' : f1(rs[20].day)}; Forge Dust short ${f0(tot.gap)}; mean BPRO cover Maps 6-20 ${pc(rs.slice(5, 20).reduce((s, r)=> s + (r.cover || 0), 0) / 15)}.`);
}
