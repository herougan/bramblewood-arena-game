#!/usr/bin/env node
// ECON2 (2026-11-03, owner 18:37: "Quest and reward and trail rewards balancing ... Game economy balancing basically"): plays the economy of a
// new player forward, day by day, from Map 0 to the end of Map 20, with the game's own numbers, and reports currencies and card power at
// Maps 0 / 5 / 10 / 15 / 20, where the player is starved or flooded, and how many days each stage takes. MEASURES ONLY: it changes no number.
//   node tools/econ2/econ_sim_2026_11_03.js [--out docs/balance/econ2-sim-2026-11-03.json] [--quiet]
// Read from arena_app.js (tools/lib_bramble.js grab, with the ECON1 halving applied exactly as the source applies it): CONQUEST_NODE_REWARDS
// (nodeRewardTier), nodeEnergyCost / mapEnergyBase, roadCurveTarget (each road fight's designed win rate), referencePlayerLevel /
// referenceDeckFor (the deck level the road curve is tuned for), QUEST_RANK_REWARD / _WEIGHT, QUEST_TIERS, TRAIL_*, RES3_LEVEL_TRACK,
// xpToNext, STAMINA_PLACES, ENERGY_*, NEST_UNLOCKS, KIBBLE_FIRST, MAP_FREE_PACKS, STRANGE_MATERIA_DROPS, ERRAND_TEMPLATES, FEATURE_SPOTS
// map numbers, canonical/upgrade-costs.json (Forge steps, tiers). Expected values, not dice: a fight won with chance p costs 1/p tries.
// The ASSUMPTIONS block below is what a reader should argue with; every other number is the game's.
'use strict';
const fs = require('fs'), path = require('path');
const ROOT = path.join(__dirname, '..', '..');
const B = require(path.join(ROOT, 'tools', 'lib_bramble.js')), G = B.G;
const args = process.argv.slice(2), opt = k=>{ const i = args.indexOf('--' + k); return i >= 0 ? args[i + 1] : null; };
const OUT = opt('out') || path.join(ROOT, 'docs', 'balance', 'econ2-sim-2026-11-03.json');
const UC = JSON.parse(fs.readFileSync(path.join(ROOT, 'canonical', 'upgrade-costs.json'), 'utf8'));

// ---------- the game's numbers, halved the way the source halves them ----------
const econSrc = ['ECON_INCOME_MULT', 'ECON_HALVED_KINDS', 'econMult', 'econScale', 'econScaleTable'].map(B.grab).join('\n');
const TX = (k, o)=> k + (o ? ' ' + JSON.stringify(o) : '');
// a declaration plus the econScaleTable() line that follows it in the source, if any
function evTable(name){
  const decl = B.grab(name), at = B.src.indexOf(decl) + decl.length, next = B.src.slice(at, at + 400).split('\n').find(l=> /^econScaleTable\(/.test(l.trim())) || '';
  return new Function('TX', econSrc + '\n' + decl + '\n' + (next.includes(name) ? next : '') + '\nreturn ' + name + ';')(TX);
}
const evMulti = (line, names)=>{ const m = new RegExp('^const ' + line + '.*$', 'm').exec(B.src); return new Function(m[0] + '\nreturn {' + names.join(',') + '};')(); };
const econ = new Function(econSrc + '\nreturn {econMult, econScale, ECON_INCOME_MULT};')();
const N = {
  NODE: evTable('CONQUEST_NODE_REWARDS'), RANK_MULT: evTable('RANK_MULT'), QRR: evTable('QUEST_RANK_REWARD'), QRW: evTable('QUEST_RANK_WEIGHT'), QT: evTable('QUEST_TIERS'),
  TRAIL_FREE: evTable('TRAIL_FREE'), NEST_UNLOCKS: evTable('NEST_UNLOCKS'), KIBBLE_FIRST: evTable('KIBBLE_FIRST'), MAP_FREE_PACKS: evTable('MAP_FREE_PACKS'),
  STRANGE: evTable('STRANGE_MATERIA_DROPS'), STAMINA: evTable('STAMINA_PLACES'), ERRANDS: evTable('ERRAND_TEMPLATES'), QUEST_KIT: evTable('QUEST_KIT_ITEMS'),
  RAID_PAY: evTable('RAID_ATTEMPT_PAY'), PVP_PER_DAY: evTable('PVP_TICKETS_PER_DAY'), LEVEL_TRACK: evTable('RES3_LEVEL_TRACK'), LEVEL_LEAVES: evTable('RES4_LEVEL_LEAVES'),
  ...evMulti('TRAIL_TIER_COST', ['TRAIL_TIER_COST', 'TRAIL_TIERS', 'TRAIL_CHEST_EVERY', 'TRAIL_CHEST_MAX', 'TRAIL_CH_POINTS', 'TRAIL_CH_PER_WEEK', 'TRAIL_FIRST_WIN']),
  TRAIL_NOTICE_PTS: evTable('TRAIL_NOTICE_PTS'), TRAIL_DAY_TIERS: evTable('TRAIL_DAY_TIERS'), TRAIL_WEEK_TIER_PTS: evTable('TRAIL_WEEK_TIER_PTS'),
  ENERGY_MAX_BASE: evTable('ENERGY_MAX_BASE'), ...evMulti('FREE_ENERGY_KEY', ['FREE_ENERGY_AMOUNT']), ...evMulti('ENERGY_CAPSULE_KEY', ['ENERGY_CAPSULE_AMOUNT']),
  ...evMulti('NURTURE_HOURS', ['NURTURE_COST']), SHOP: evTable('SHOP_PACKS_DEFAULT'), PACK_SALE_MAP: evTable('PACK_SALE_MAP'),
};
const xpToNext = new Function(B.grab('xpToNext') + '\nreturn xpToNext;')();
const MAIN = G.CONQUEST_MAPS.filter(m=> !m.sub && !m.reserved); // play order, as tools/resources_week_2026_10_23.js
const nodeEnergyCost = new Function('CONQUEST_MAPS', 'mainConquestMaps', 'baseKind', B.grab('mapEnergyBase') + '\n' + B.grab('nodeEnergyCost') + '\nreturn nodeEnergyCost;')(G.CONQUEST_MAPS, ()=> MAIN, G.baseKind);
const nodeRewardTier = new Function('CONQUEST_NODE_REWARDS', 'baseKind', 'econScale', B.grab('nodeRewardTier') + '\nreturn nodeRewardTier;')(N.NODE, G.baseKind, econ.econScale);
const FEATURE_MAP = {}; { const re = /\{key:'([a-z0-9]+)'[^\n]*?mapNumber:(\d+)/g; let m; const blk = B.grab('FEATURE_SPOTS'); while((m = re.exec(blk))) FEATURE_MAP[m[1]] = +m[2]; }
const DEFS = B.CARD_DEFS_BASELINE;
const winP = (map, n)=>{ try{ const r = G.roadCurveTarget(map.id, n); if(r && r.t) return r.t; }catch(e){} try{ return G.skirmishTargetWinRate(map.id, n) || 0.75; }catch(e){ return 0.75; } };
const stepCost = (L, id)=>{ const d = DEFS[id] || {}; const k = (UC.levelCostMult[d.rarity] || 1) * (d.hero ? UC.modifiers.hero : 1);
  if(L <= 0) return {dust: Math.round(UC.materiaUnit.dust / UC.moteDivisor), gold: Math.round(UC.materiaUnit.gold / UC.moteDivisor)};
  const s = UC.forgeStepDust[Math.min(9, L)]; return {dust: Math.round(s * k), gold: Math.round(s * 2 / 3 * k)}; };
const baseLevel = id=>{ try{ return G.cardBaseLevel(DEFS[id]); }catch(e){ return 1; } };
const levelCap = id=>{ const d = DEFS[id] || {}; try{ return G.isBaseLevelCapped(d) ? 4 : 10; }catch(e){ return 10; } };

// ---------- assumptions (argue with these) ----------
const PLAYERS = {
  dedicated: {label: 'Dedicated (checks in all day, ~2 h of fights)', awakeRegenHours: 16, sessions: null, fightMinutes: 120, notices: 6, weekly: true, pvp: 10, raids: 1, trailChallenges: 3, errands: true},
  casual: {label: 'Casual (2 sessions of 30 min a day)', awakeRegenHours: null, sessions: 2, sessionMinutes: 30, fightMinutes: 60, notices: 3, weekly: true, pvp: 3, raids: 1, trailChallenges: 1, errands: true},
};
// Sensitivity runs (not players): the same dedicated player if a weekly tier paid once (not once per quest), and with no Forge waits.
PLAYERS.dedicatedKeepDeck = Object.assign({}, PLAYERS.dedicated, {label: 'Dedicated, keeps one deck from Map 11 (variant: the Forge bill\'s lower bound)', keepDeck: true});
PLAYERS.casualKeepDeck = Object.assign({}, PLAYERS.casual, {label: 'Casual, keeps one deck from Map 11 (variant)', keepDeck: true});
PLAYERS.dedicatedWeeklyOnce =Object.assign({}, PLAYERS.dedicated, {label: 'Dedicated, a weekly tier paid once (variant)', weeklyOnce: true});
const A = {
  minutesPerFight: 3,          // with the speed-up, as in tools/resources_week_2026_10_23.js
  rank: 'S',                   // repeat wins are farmed at S
  pvpWin: 0.55, raidDamage: 600,
  forgeToReference: true,      // from Map 11 the player keeps the deck at referencePlayerLevel(map), the level the road curve is tuned for, and
                               // waits (farming) before a map's fights until it can pay for that. Before Map 11 there is nothing to buy.
  buyEnergySteps: true,        // Max Energy steps (Nest from Map 3, Forge from Map 11) bought as soon as Dust and Materia allow, after the deck
  days: 400,
};
const MILESTONES = [0, 5, 10, 15, 20];

function simulate(P){
  const W = {gold: 0, dust: 0, gems: 0, metal: 0, kibble: 0, xp: 0, iron: 0, pearl: 0, temper: 0, strange: 0, cards: 0, packs: 0, capsules: 0};
  const SPENT = {forge: {gold: 0, dust: 0}, forgeTier: {gold: 0, dust: 0}, energy: {gold: 0, dust: 0}, nest: {gold: 0, dust: 0}};
  const INC = {}; const inc = (src, k, v)=>{ if(!v) return; W[k] = (W[k] || 0) + v; INC[src] = INC[src] || {}; INC[src][k] = (INC[src][k] || 0) + v; };
  const deckLv = {}; let forgeTier = 1, stamina = {nest: 0, forge: 0}, nestSlots = 1;
  let mapIdx = 0, nodeIdx = 0, partial = 0, xpLevel = 0, xpInto = 0, trailPts = 0, trailTier = 0, trailChests = 0;
  const log = [], snaps = {}, waits = {}, daysOnMap = {}, boundBy = {}, energyDays = [];
  const fightsOf = m=> m.nodes.filter(n=> n.kind !== 'tutorial' && n.deck);
  const reached = n=> mapIdx >= n;
  const energyMax = ()=> N.ENERGY_MAX_BASE + stamina.nest * 5 + stamina.forge * 5;
  const deckNeed = ()=>{ // Dust + Leaves still to pay to bring the current map's reference deck to its reference level
    if(!A.forgeToReference || mapIdx < 11) return {dust: 0, gold: 0, level: 0, steps: []};
    const map = MAIN[mapIdx], ref = G.referenceDeckFor(map.id, fightsOf(map)[0]), L = ref.level, mx = G.levelMix(L);
    if(P.keepDeck) ref.deck = G.referenceDeckFor(MAIN[11].id, fightsOf(MAIN[11])[0]).deck; // the variant: one deck (Map 11's) kept and levelled to each map's level
    let dust = 0, gold = 0; const steps = [];
    Object.entries(ref.deck).forEach(([id, k])=>{ const nHi = Math.round(k * mx.frac), cap = levelCap(id);
      for(let c = 0; c < k; c++){ const want = Math.min(cap, c < nHi ? mx.hi : mx.lo), key = id + '#' + c; let cur = deckLv[key] != null ? deckLv[key] : baseLevel(id);
        for(; cur < want; cur++){ const s = stepCost(cur, id); dust += s.dust; gold += s.gold; steps.push([key, cur + 1, s]); } } });
    return {dust, gold, level: L, steps, hiNeeded: mx.frac ? mx.hi : mx.lo};
  };
  const levelUp = ()=>{ let need = xpToNext(Math.max(1, xpLevel)); while(xpInto >= need){ xpInto -= need; xpLevel++; levelReward(xpLevel); need = xpToNext(xpLevel); } };
  const levelReward = L=>{ let row = null; N.LEVEL_TRACK.forEach(r=>{ if(L >= r.from) row = r; }); const nx = N.LEVEL_TRACK[N.LEVEL_TRACK.indexOf(row) + 1]; if(!row || (nx && L >= nx.from)) return;
    (row.give[(L - row.from) % row.give.length] || []).forEach(g=>{ if(g === 'leaves'){ inc('levelTrack', 'gold', N.LEVEL_LEAVES.gold); inc('levelTrack', 'dust', N.LEVEL_LEAVES.dust); } else if(g === 'card') inc('levelTrack', 'cards', 1); else { inc('levelTrack', 'packs', 1); inc('levelTrack', 'cards', 3); } }); };
  const addXp = (n, src)=>{ inc(src, 'xp', n); xpInto += n; levelUp(); };
  const trailAdd = pts=>{ trailPts += pts; while(trailTier < N.TRAIL_TIERS && trailPts >= (trailTier + 1) * N.TRAIL_TIER_COST){ const t = N.TRAIL_FREE[trailTier++] || {};
      Object.entries(t).forEach(([k, v])=>{ if(['gold', 'dust', 'metal', 'kibble'].includes(k)) inc('trail', k, v); else if(k === 'pack' || k === 'faction'){ inc('trail', 'packs', v); inc('trail', 'cards', 3 * v); } else if(k === 'chest'){ inc('trail', 'packs', v); inc('trail', 'cards', 5 * v); } else if(k === 'capsule') inc('trail', 'capsules', v); }); }
    while(trailTier >= N.TRAIL_TIERS && trailChests < N.TRAIL_CHEST_MAX && trailPts >= N.TRAIL_TIERS * N.TRAIL_TIER_COST + (trailChests + 1) * N.TRAIL_CHEST_EVERY){ trailChests++; inc('trail', 'packs', 1); inc('trail', 'cards', 3); } };
  let day = 0, energyBank = N.ENERGY_MAX_BASE, done = false;
  const snap = (n, why)=>{ if(snaps[n]) return; const dn = deckNeed(); snaps[n] = {map: n, day, why, wallet: Object.fromEntries(Object.entries(W).map(([k, v])=> [k, Math.round(v)])),
    playerLevel: xpLevel, energyMax: energyMax(), forgeTier, refLevel: mapIdx >= 11 ? dn.level : 0, deckLevelGap: {dust: dn.dust, gold: dn.gold}, trailTier}; };
  snap(0, 'start');
  for(day = 1; day <= A.days && !done; day++){
    const dom = ((day - 1) % 30) + 1; if(dom === 1){ trailPts = 0; trailTier = 0; trailChests = 0; }
    // Energy for the day
    let E = P.awakeRegenHours ? P.awakeRegenHours * 12 + energyMax() + N.FREE_ENERGY_AMOUNT : P.sessions * (energyMax() + P.sessionMinutes / 5) + N.FREE_ENERGY_AMOUNT;
    if(W.capsules >= 1){ E += W.capsules * N.ENERGY_CAPSULE_AMOUNT; W.capsules = 0; }
    let minutes = P.fightMinutes, wins = 0, energyUsed = 0, waited = false;
    daysOnMap[mapIdx] = (daysOnMap[mapIdx] || 0) + 1;
    // 1. the road
    while(!done && minutes >= A.minutesPerFight){
      const map = MAIN[mapIdx], fights = fightsOf(map), n = fights[nodeIdx];
      if(!n){ mapIdx++; nodeIdx = 0; if(mapIdx > 20){ done = true; break; } if(MILESTONES.includes(mapIdx)) snap(mapIdx, 'reached'); continue; }
      if(nodeIdx === 0 && A.forgeToReference && mapIdx >= 11){ const dn = deckNeed(); if(dn.dust > W.dust || dn.gold > W.gold || (dn.hiNeeded >= 4 && forgeTier < 2) || (dn.hiNeeded >= 5 && forgeTier < 3)){ waited = true; break; } }
      const cost = nodeEnergyCost(map, n), p = winP(map, n), need = cost / p;
      if(E - energyUsed < cost) break;
      const tries = Math.min((E - energyUsed) / cost, minutes / A.minutesPerFight, (1 - partial) / p);
      energyUsed += tries * cost; minutes -= tries * A.minutesPerFight; partial += tries * p;
      if(partial < 0.999) break;
      partial = 0; nodeIdx++; wins++;
      const t = nodeRewardTier(n), bk = G.baseKind(n.kind || 'skirmish');
      inc('firstClear', 'gold', t.first.gold); inc('firstClear', 'dust', t.first.dust); inc('firstClear', 'kibble', N.KIBBLE_FIRST[n.kind] || N.KIBBLE_FIRST[bk] || 1);
      if(bk === 'elite') inc('firstClear', 'iron', 1);
      if(bk === 'boss'){ inc('firstClear', 'iron', 2); inc('firstClear', 'pearl', 1); inc('firstClear', 'temper', 1); }
      if(bk === 'raidboss' || bk === 'finalboss'){ inc('firstClear', 'iron', 3); inc('firstClear', 'temper', 2); }
      if(nodeIdx === fights.length){ if(N.STRANGE[mapIdx]) inc('firstClear', 'strange', N.STRANGE[mapIdx]); if(N.MAP_FREE_PACKS[mapIdx]){ inc('mapPack', 'packs', 1); inc('mapPack', 'cards', 3); } }
      ((n.rewardTokens) || []).forEach(tk=>{ if(tk === 'energyCapsule') inc('firstClear', 'capsules', 1); });
      const cardN = Object.keys(DEFS).filter(id=>{ const s = DEFS[id].source; return s && s.kind === 'map' && s.id === map.id && s.node === n.key; }).length; inc('firstClear', 'cards', cardN);
      addXp(3, 'wins');
    }
    if(waited) waits[mapIdx] = (waits[mapIdx] || 0) + 1;
    { const why = done ? 'done' : waited ? 'forge' : minutes < A.minutesPerFight ? 'time' : 'energy'; const band = mapIdx <= 4 ? '0-4' : mapIdx <= 10 ? '5-10' : mapIdx <= 15 ? '11-15' : '16-20';
      boundBy[band] = boundBy[band] || {}; boundBy[band][why] = (boundBy[band][why] || 0) + 1; energyDays.push({day, map: mapIdx, energy: Math.round(E), road: Math.round(energyUsed)}); }
    // 2. what is left of the Energy and the time: repeat wins on the best-paying fight already cleared on this map (or the map before)
    const farmMap = MAIN[nodeIdx > 0 ? mapIdx : Math.max(0, mapIdx - 1)] || MAIN[20];
    const cleared = fightsOf(farmMap).slice(0, nodeIdx > 0 ? nodeIdx : undefined);
    let best = null; cleared.forEach(n=>{ const t = nodeRewardTier(n), c = nodeEnergyCost(farmMap, n), v = (t.repeat.gold + 1.5 * t.repeat.dust) / c; if(!best || v > best.v) best = {n, t, c, v}; });
    if(best && !done){ const reps = Math.floor(Math.min((E - energyUsed) / best.c, minutes / A.minutesPerFight));
      if(reps > 0){ const mult = N.RANK_MULT[A.rank] || 1; inc('repeat', 'gold', reps * best.t.repeat.gold * mult); inc('repeat', 'dust', reps * best.t.repeat.dust * mult); inc('repeat', 'kibble', reps * 0.15); inc('repeat', 'iron', reps * 0.15);
        energyUsed += reps * best.c; minutes -= reps * A.minutesPerFight; wins += reps; addXp(3 * reps, 'wins'); } }
    // 3. daily notices (from the Notices, Map 4), their Stickers
    if(reached(FEATURE_MAP.quests || 4)){ const k = P.notices; let g = 0, d = 0, gm = 0, x = 0; Object.entries(N.QRW).forEach(([r, w])=>{ const rw = N.QRR[r] || {}; g += w / 100 * (rw.gold || 0); d += w / 100 * (rw.dust || 0); gm += w / 100 * (rw.gems || 0); x += w / 100 * (rw.xp || 0); });
      inc('notices', 'gold', k * g); inc('notices', 'dust', k * d); inc('notices', 'gems', k * gm); addXp(k * x, 'notices');
      const ptsPer = Object.entries(N.QRW).reduce((t, [r, w])=> t + w / 100 * (N.TRAIL_NOTICE_PTS[r] || 10), 0);
      trailAdd(k * ptsPer + N.TRAIL_DAY_TIERS.filter(t=> k >= t.notices).reduce((t, x)=> t + x.pts, 0)); }
    if(wins > 0) trailAdd(N.TRAIL_FIRST_WIN);
    // 4. PvP (Map 11) and raids (Map 13)
    if(reached(FEATURE_MAP.arena || 11)){ inc('pvp', 'gold', P.pvp * (A.pvpWin * 4 + (1 - A.pvpWin) * 1) * econ.econMult('arena', 'gold')); inc('pvp', 'dust', P.pvp * A.pvpWin * 0.25 * econ.econMult('arena', 'dust')); addXp(P.pvp * (A.pvpWin * 3 + (1 - A.pvpWin)), 'pvp'); }
    if(reached(FEATURE_MAP.raid || 13)){ inc('raids', 'gold', P.raids * A.raidDamage / N.RAID_PAY.goldPer * econ.econMult('raids', 'gold')); inc('raids', 'dust', P.raids * 3 * A.raidDamage / N.RAID_PAY.dustPer * econ.econMult('raids', 'dust')); }
    // 5. errands (the Quest Board, Map 8): 30% of wins offer one, 2 offers a day at most, about one claimed a day in all
    if(P.errands && reached(FEATURE_MAP.questboard || 8)){ const nE = Math.min(1, wins * 0.3 / 3); const mu = N.ERRANDS.reduce((t, e)=> t + e.mu, 0) / N.ERRANDS.length;
      inc('errands', 'dust', nE * econ.econScale('errands', 'dust', Math.round(UC.materiaUnit.dust * mu))); inc('errands', 'gold', nE * econ.econScale('errands', 'gold', Math.round(UC.materiaUnit.gold * mu))); addXp(20 * nE, 'errands');
      inc('errands', 'iron', nE * N.ERRANDS.filter(e=> e.shard).length / N.ERRANDS.length); }
    // 6. the week's quest tiers, paid per quest claimed (claimQuest grants tier.reward for each quest), a tier shown once the one before is all claimed
    if(day % 7 === 0 && P.weekly && reached(FEATURE_MAP.quests || 4)){
      let pts = 0;
      for(let ti = 0; ti < N.QT.weekly.length; ti++){ const tier = N.QT.weekly[ti]; let all = true;
        tier.quests.forEach(q=>{ const ok = /pvp/.test(q.counter) ? reached(FEATURE_MAP.arena || 11) : /raid/.test(q.counter) ? reached(FEATURE_MAP.raid || 13) : true;
          if(!ok){ all = false; return; } if(!P.weeklyOnce) Object.entries(tier.reward).forEach(([k, v])=> inc('weekly', k, v)); addXp([400, 250, 120][ti], 'weekly'); });
        if(!all) break;
        if(P.weeklyOnce) Object.entries(tier.reward).forEach(([k, v])=> inc('weekly', k, v)); // the variant: a tier paid once, as ECON1's arithmetic read it
        pts += N.TRAIL_WEEK_TIER_PTS[ti] || 0; }
      trailAdd(pts + P.trailChallenges * N.TRAIL_CH_POINTS);
    }
    // 7. spending: the Forge first (from Map 11), then Forge tiers, Max Energy, nest slots
    if(mapIdx >= 11){ const dn = deckNeed();
      if(dn.hiNeeded >= 4 && forgeTier < 2){ const t = UC.forgeTiers[1]; if(W.gold >= t.gold && W.dust >= t.dust && W.strange >= t.strange){ W.gold -= t.gold; W.dust -= t.dust; W.strange -= t.strange; SPENT.forgeTier.gold += t.gold; SPENT.forgeTier.dust += t.dust; forgeTier = 2; log.push({day, map: mapIdx, ev: 'Iron Forge'}); } }
      if(dn.hiNeeded >= 5 && forgeTier < 3){ const t = UC.forgeTiers[2]; if(W.gold >= t.gold && W.dust >= t.dust && W.strange >= t.strange){ W.gold -= t.gold; W.dust -= t.dust; W.strange -= t.strange; SPENT.forgeTier.gold += t.gold; SPENT.forgeTier.dust += t.dust; forgeTier = 3; log.push({day, map: mapIdx, ev: 'Ember Forge'}); } }
      for(const [key, L, s] of deckNeed().steps){ const cap = UC.forgeTiers[forgeTier - 1].cap; if(L > cap) continue; if(W.dust < s.dust || W.gold < s.gold) break; W.dust -= s.dust; W.gold -= s.gold; SPENT.forge.dust += s.dust; SPENT.forge.gold += s.gold; deckLv[key] = L; } }
    if(A.buyEnergySteps){ const reserve = deckNeed(); const free = {dust: W.dust - reserve.dust, gold: W.gold - reserve.gold};
      [['nest', FEATURE_MAP.nest || 3], ['forge', FEATURE_MAP.forge || 11]].forEach(([pl, from])=>{ const P2 = N.STAMINA[pl]; if(!reached(from)) return; if(pl === 'forge' && stamina.nest < N.STAMINA.nest.costs.length) return;
        const c = P2.costs[stamina[pl]]; if(!c) return; const mats = c.mats || {}; const have = {'iron-shard': W.iron, 'river-pearl': W.pearl, 'tempering-stone': W.temper};
        if(free.dust >= c.dust && Object.entries(mats).every(([k, v])=> (have[k] || 0) >= v)){ W.dust -= c.dust; free.dust -= c.dust; SPENT.energy.dust += c.dust; W.iron -= mats['iron-shard'] || 0; W.pearl -= mats['river-pearl'] || 0; W.temper -= mats['tempering-stone'] || 0; stamina[pl]++; log.push({day, map: mapIdx, ev: 'Max Energy ' + energyMax()}); } });
      const ns = N.NEST_UNLOCKS[nestSlots]; if(ns && reached(ns.map) && ns.cost && free.dust >= ns.cost.dust + 0 && free.gold >= ns.cost.gold){ W.gold -= ns.cost.gold; W.dust -= ns.cost.dust; SPENT.nest.gold += ns.cost.gold; SPENT.nest.dust += ns.cost.dust; nestSlots++; } }
  }
  if(done) snap(21, 'Map 20 cleared');
  const r = o=> Object.fromEntries(Object.entries(o).map(([k, v])=> [k, typeof v === 'object' ? r(v) : Math.round(v * 10) / 10]));
  const stage = (a, b)=> snaps[b] && snaps[a] ? snaps[b].day - snaps[a].day : null;
  return {label: P.label, snaps, stages: {'0-5': stage(0, 5), '5-10': stage(5, 10), '10-15': stage(10, 15), '15-20': stage(15, 20), '20-end': stage(20, 21)}, daysOnMap, forgeWaitDays: waits, boundBy, energyPerDay: energyDays.filter((x, i)=> i < 3 || x.day % 5 === 0),
    income: r(INC), spent: SPENT, wallet: r(W), log, finished: done, day};
}

// ---------- per-map tables: what the road pays against its effort ----------
function roadTable(){
  return MAIN.slice(0, 21).map((m, i)=>{ const fs2 = m.nodes.filter(n=> n.kind !== 'tutorial' && n.deck); let e = 0, eTries = 0, g = 0, d = 0, cards = 0, caps = 0;
    fs2.forEach(n=>{ const c = nodeEnergyCost(m, n), p = winP(m, n), t = nodeRewardTier(n); e += c; eTries += c / p; g += t.first.gold; d += t.first.dust;
      cards += Object.keys(DEFS).filter(id=>{ const s = DEFS[id].source; return s && s.kind === 'map' && s.id === m.id && s.node === n.key; }).length; caps += ((n.rewardTokens || []).filter(x=> x === 'energyCapsule').length); });
    const sk = fs2.find(n=> G.baseKind(n.kind) === 'skirmish') || fs2[0], rep = nodeRewardTier(sk), rc = nodeEnergyCost(m, sk);
    return {map: i, id: m.id, name: m.name, fights: fs2.length, energy: e, energyWithLosses: Math.round(eTries), firstGold: g, firstDust: d, cards, capsules: caps, pack: N.MAP_FREE_PACKS[i] || null,
      goldPerEnergy: +(g / eTries).toFixed(2), dustPerEnergy: +(d / eTries).toFixed(2), repeatSkirmish: {energy: rc, gold: rep.repeat.gold, dust: rep.repeat.dust, goldPerEnergy: +(rep.repeat.gold / rc).toFixed(2)}};
  });
}
function questTable(){
  const noticeEV = {}; let g = 0, d = 0; Object.entries(N.QRW).forEach(([r, w])=>{ g += w / 100 * (N.QRR[r].gold || 0); d += w / 100 * (N.QRR[r].dust || 0); });
  const notices = Object.keys(N.QRR).map(r=> ({rank: r, weight: N.QRW[r], reward: N.QRR[r], stickers: N.TRAIL_NOTICE_PTS[r]}));
  const weekly = N.QT.weekly.map((t, i)=> ({tier: i + 1, rewardPerQuest: t.reward, quests: t.quests.map(q=> ({id: q.id, counter: q.counter, goal: q.goal, gate: /pvp/.test(q.counter) ? 'Arena (Map ' + (FEATURE_MAP.arena || 11) + ')' : /raid/.test(q.counter) ? 'Raid (Map ' + (FEATURE_MAP.raid || 13) + ')' : 'Notices (Map ' + (FEATURE_MAP.quests || 4) + ')'}))}));
  const errands = N.ERRANDS.map(e=> ({id: e.id, counter: e.counter, goal: e.goal, mu: e.mu, dust: econ.econScale('errands', 'dust', Math.round(UC.materiaUnit.dust * e.mu)), gold: econ.econScale('errands', 'gold', Math.round(UC.materiaUnit.gold * e.mu)), shard: !!e.shard}));
  const trail = N.TRAIL_FREE.map((t, i)=> ({tier: i + 1, stickers: (i + 1) * N.TRAIL_TIER_COST, reward: t}));
  return {noticeEV: {gold: +g.toFixed(1), dust: +d.toFixed(1)}, notices, weekly, errands, trail, featureMaps: FEATURE_MAP};
}

const out = {generated: '2026-11-03', tool: 'node tools/econ2/econ_sim_2026_11_03.js', assumptions: A, players: PLAYERS,
  sim: Object.fromEntries(Object.entries(PLAYERS).map(([k, P])=> [k, simulate(P)])), road: roadTable(), quests: questTable(),
  shop: N.SHOP.map(p=> ({id: p.id, name: p.name, cost: p.cost, cards: p.cards, onSaleMap: N.PACK_SALE_MAP[p.id] || null}))};
fs.writeFileSync(OUT, JSON.stringify(out, null, 1) + '\n');
if(!args.includes('--quiet')){
  Object.entries(out.sim).forEach(([k, s])=>{
    console.log(`\n== ${k}: ${s.label} | finished ${s.finished} on day ${s.day - 1}`);
    console.log('stages (days):', JSON.stringify(s.stages), '| Forge waits by map:', JSON.stringify(s.forgeWaitDays), '| bound by:', JSON.stringify(s.boundBy));
    Object.values(s.snaps).forEach(x=> console.log(`  Map ${x.map} day ${x.day}: ${JSON.stringify(x.wallet)} Lv${x.playerLevel} ⚡${x.energyMax} forge T${x.forgeTier} ref ${x.refLevel} gap ${JSON.stringify(x.deckLevelGap)}`));
    console.log('  income:', JSON.stringify(s.income)); console.log('  spent:', JSON.stringify(s.spent)); console.log('  log:', JSON.stringify(s.log));
  });
  console.log('\nroad:'); out.road.forEach(r=> console.log(`  ${r.map} ${r.id} ${r.fights}f ⚡${r.energy}/${r.energyWithLosses} 🍁${r.firstGold} ✨${r.firstDust} cards ${r.cards} 🔋${r.capsules} ${r.pack || ''} g/⚡ ${r.goldPerEnergy} d/⚡ ${r.dustPerEnergy} rep ${JSON.stringify(r.repeatSkirmish)}`));
  console.log('noticeEV', JSON.stringify(out.quests.noticeEV), 'features', JSON.stringify(FEATURE_MAP));
  console.log('->', path.relative(ROOT, OUT));
}
