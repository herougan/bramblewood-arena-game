#!/usr/bin/env node
// Skirmish rough balance pass (2026-10-18, package SKB, owner 15:56: "Have you done a card balance pass for all cards, then a
// skirmish rough balancing pass. as long it's not auto winnable or always loseable.").
//
// Plays every Conquest fight the way the game builds it today, not the way the older tools approximated it:
//   - the enemy bramble from arena_app.js itself (skirmishCastle: the map's castle and its passive, its level by kind, Map 0's base
//     bramble, Health = the bramble's own (hqHp only lowers it), the Shield by rule (ruleShieldOf) or the node's shieldOverride);
//   - the fight's rules from fightRules (day / night, Mist, Tide, wind, darkness, volcano, terrain) and its leaders / leader grants;
//   - the enemy deck at its road level (levelledEnemyDeck: Lv 2 from Map 5, +1 every 5 maps, bosses +1), endless-dungeon floors'
//     +4% a floor;
//   - aiAim on, the CPU at its real level (cpuAiLevelForNode: Map 21+ Smartest, Map 5+ elite / boss Smart, else Basic), your seat
//     at Smart, as simulateSkirmishVsDeck(…, {level}) does in the skirmish editor.
// The functions are read out of arena_app.js (tools/lib-free, like tests/shields-2026-10-18.js), so a rule change there is measured
// here without a copy to keep in step.
//
// Your deck is the stage deck for that point of the road (docs/difficulty-curve-2026-10-03.md, 10-18 section):
//   Map 0                 Starter   (the Otter starter + tutorial rewards, docs/balance/difficulty-curve.json)
//   Maps 1-9 (+ sides)    Road      (expectedPlayerDeck: Base + every earlier reward, the deck the editor's 🎯 tunes against)
//   Maps 10-17            Mid-road  (the curve's built deck: Base + rewards up to Map 9)
//   Maps 18-24            Strong    (the curve's built deck: everything obtainable)
// A come-back-later fight uses the stage of the map it counts as (nodeMapNumber: T-2/T-3/T-4 = 1/8/18, the Old Bramble = 17).
// Your cards play at Level 1 (tools/card_balance.js: "Level 1 for everyone"; a Level 0 card gets its first +10% step); your
// bramble is the plain 30 Health castle.
//
//   node tools/skirmish_pass.js decks          builds the Road decks (docs/balance/skirmish-pass-decks.json); run it first
//   node tools/skirmish_pass.js measure [games=40] [shard nshards] [--tag=before] [--only=a,b] [--seed=K]
//        appends one JSON line per fight to docs/balance/skirmish-pass-<tag>.jsonl (resumable; delete a fight's line to re-measure
//        it). Seeds 9100 + 37g, or K + 37g with --seed (the pass's "fresh seeds" check used 5100).
//   node tools/skirmish_pass.js tune [games=40] [--from=before] [--only=a,b] [--seed=7300] [--fixes=skirmish-pass-fixes] [shard nshards]
//        for each outlier (> 92% or < 12%) in the --from file tries, in order: CPU deck moves of up to 2 copies (swap / more copies /
//        add / remove, inside the road's rarity cap and the map's theme, a fight's namesake kept), then a shieldOverride, then a lower
//        bramble Health; appends to docs/balance/<fixes>.jsonl
//   node tools/skirmish_pass.js order [games] [--from=after] [--fixes=skirmish-pass-order]
//        the same tune for an elite / boss that the stage deck beats more often than its map's skirmishes (ceiling: their mean - 5)
//   node tools/skirmish_pass.js apply [--fixes=skirmish-pass-fixes]   writes those fixes into arena_app.js
//   node tools/skirmish_pass.js list           prints the fights and their stage decks
// The 2026-10-18 pass: docs/skirmish-pass-2026-10-18.md; its rounds are in docs/balance/skirmish-pass-tune-log.jsonl.
// Babel Spire floors are not covered (their decks are rated, levelled to 11-20 and rebuilt at load; tune them with TOWER_* instead).
'use strict';
const fs = require('fs'), path = require('path');
const ROOT = path.join(__dirname, '..');
const E = require(path.join(ROOT, 'bramblewood-engine.js'));
const APP = path.join(ROOT, 'arena_app.js');
const src = fs.readFileSync(APP, 'utf8');
const cardsRaw = JSON.parse(fs.readFileSync(path.join(ROOT, 'canonical/cards.json'), 'utf8'));
const charsRaw = JSON.parse(fs.readFileSync(path.join(ROOT, 'canonical/characters.json'), 'utf8'));
const argv = process.argv.slice(2), CMD = argv[0] || 'list';
const nums = argv.filter(a=> /^\d+$/.test(a)).map(Number);
const N = nums[0] || 40, SHARD = nums[1] || 0, NSH = nums[2] || 1;
const opt = (k, d)=>{ const a = argv.find(x=> x.startsWith('--' + k + '=')); return a ? a.slice(k.length + 3) : d; };
const ONLY = opt('only', '').split(',').filter(Boolean);
const LO = 0.12, HI = 0.92; // the pass's band: not always losable, not auto-winnable
const TUNE_SEED = +opt('seed', 7300); // tune's trials play other seeds than measure's (9100), so a fix isn't fitted to the seeds it is reported on

// ---- read declarations out of arena_app.js (string / comment / template aware brace matching)
function declEnd(s, i, isFn){
  const stack = []; let j = i, seenBody = false;
  for(; j < s.length; j++){
    const c = s[j], top = stack[stack.length - 1];
    if(top === '`'){ if(c === '\\'){ j++; continue; } if(c === '`'){ stack.pop(); continue; } if(c === '$' && s[j+1] === '{'){ stack.push('${'); j++; } continue; }
    if(top === "'" || top === '"'){ if(c === '\\'){ j++; continue; } if(c === top) stack.pop(); else if(c === '\n') stack.pop(); continue; }
    if(c === '/' && s[j+1] === '/'){ j = s.indexOf('\n', j); if(j < 0) j = s.length; j--; continue; }
    if(c === '/' && s[j+1] === '*'){ j = s.indexOf('*/', j) + 1; continue; }
    if(c === "'" || c === '"' || c === '`'){ stack.push(c); continue; }
    if(c === '(' || c === '[' || c === '{'){ stack.push(c); if(c === '{') seenBody = true; continue; }
    if(c === ')' || c === ']' || c === '}'){ const t = stack.pop(); if(t === '${') continue; if(!stack.length && isFn && c === '}' && seenBody) return j + 1; continue; }
    if(!stack.length && !isFn && (c === ';' || c === '\n')) return j + 1;
  }
  return j;
}
function grab(name){
  let m = new RegExp(`^function ${name}\\(`, 'm').exec(src);
  if(m) return src.slice(m.index, declEnd(src, m.index, true));
  m = new RegExp(`^(const|let|var) ${name} = `, 'm').exec(src);
  if(m) return src.slice(m.index, declEnd(src, m.index + m[0].length, false));
  throw new Error('arena_app.js: no declaration ' + name);
}
const NAMES = ['RARITY_MAX_COPIES', 'maxCopiesForRarity', 'ROAD_RARITY_STEPS', 'ROAD_RARITY_ALIAS', 'roadRarityStep', 'roadSkirmishCap', 'roadBossCap', 'roadRarityCap', 'roadRarityOk',
  'TUTORIAL_REWARD_IDS', 'cardSourceOf', 'cardObtainableFrom', 'isUnattainable', 'isEquipmentDef', 'mapNumberOf', 'mainConquestMaps', 'TUT_SIDE_GATE', 'nodeRewardCardIds', 'cardBaseLevel', 'LEVEL_STEPS', 'LEVEL_STEP_GAIN', 'RARITY_MAX_LEVEL',
  'cardMaxLevel', 'statsAtLevel', 'statsBeyondLevel', 'LIMIT_BREAK_LEVEL', 'castleLeveled', 'DECK_SIZE', 'CPU_AI_KEYS', 'CPU_SMART_FROM_MAP', 'CPU_SMART_KINDS',
  'CPU_AI_MAX', 'cpuAiAutoLevel', 'cpuAiLevelForNode', 'MAP_CASTLE', 'KIND_CASTLE_LEVEL', 'NODE_MAP_HINT', 'mapOfNode', 'nodeCastleId', 'nodeCastleLevel', 'SHIELD_RULE_MULT',
  'nodeMapNumber', 'shieldRuleMult', 'ruleShieldOf', 'shieldOverrideOf', 'BASE_BRAMBLE_HP', 'baseBrambleHp', 'ARMOUR_LAYER_MAX', 'skirmishCastle', 'prepareLeaderGrants', 'applySkirmishSetup',
  'skirmishCardScore', 'expectedPlayerDeck', 'MAP_DAYNIGHT', 'mapDayNight', 'TIDESPOUT_NODES', 'MISTY_MAPS', 'PERMATIDE_MAPS', 'RAPIDS_MAPS', 'wetMap', 'mapIdOfNode', 'fightRules',
  'TERRAIN_BIOMES', 'TERRAIN_TIER_STATS', 'terrainTierFor', 'terrainFor', 'terrainObj', 'DARK_MAPS', 'WINDY_MAPS', 'VOLCANO_MAPS', 'VOLCANO_GLOW', 'MAP_MUSIC', 'MAP_BIOME_OF',
  'roadEnemyLevel', 'levelledEnemyDeck', 'hashStr', 'KIND_BASE', 'baseKind'];
const ms = src.indexOf('const CONQUEST_MAPS = ['), me = src.indexOf('\n];', ms) + 3;
const dg = src.indexOf('function endlessDungeon(cfg){'), dgEnd = src.indexOf('\nconst TOWER_LEVEL_CAP', dg); // the endless dungeons; the Tower is left out (see the header)
const CARD_DEFS_BASELINE = {}; cardsRaw.forEach(c=>{ const d = Object.assign({effects:{}}, c); delete d.art; CARD_DEFS_BASELINE[c.id] = d; });
const CHARACTER_DEFS = {}; (Array.isArray(charsRaw) ? charsRaw : Object.values(charsRaw)).forEach(c=> CHARACTER_DEFS[c.id] = c);
const body = [
  'let matchDefsOverlay = {}, matchLeaderGrantMap = null; const liveCards = {}; const AI_LEVEL_MAX = E.AI_LEVEL_MAX;',
  'function invalidateCardDefs(){} function getCardDefs(){ return Object.assign({}, CARD_DEFS_BASELINE, matchDefsOverlay); }',
  src.slice(ms, me), src.slice(dg, dgEnd),
  ...NAMES.map(grab),
  'return {CONQUEST_MAPS, mapNumberOf, nodeMapNumber, ruleShieldOf, skirmishCastle, prepareLeaderGrants, applySkirmishSetup, fightRules, levelledEnemyDeck, roadEnemyLevel, cpuAiLevelForNode,',
  '  expectedPlayerDeck, cardSourceOf, roadRarityOk, roadRarityCap, statsAtLevel, cardBaseLevel, maxCopiesForRarity, skirmishCardScore, NODE_MAP_HINT, baseKind, nodeRewardCardIds,',
  '  overlay: ()=> matchDefsOverlay, resetOverlay: ()=>{ matchDefsOverlay = {}; matchLeaderGrantMap = null; }, setGrantMap: m=>{ matchLeaderGrantMap = m; }, getCardDefs};',
].join('\n');
const G = new Function('E', 'CARD_DEFS_BASELINE', 'CHARACTER_DEFS', body)(E, CARD_DEFS_BASELINE, CHARACTER_DEFS);
const MAPS = G.CONQUEST_MAPS;

// ---- the fights
const mains = MAPS.filter(m=> !m.sub);
const DUNGEON_FLOORS = [1, 10, 25, 50]; // endless dungeons: two plain floors and two Kings (every 10th floor is a mini-boss)
function fights(){
  const out = [];
  for(const m of MAPS){
    if(m.reserved || m.tower) continue;
    const no = G.mapNumberOf(m.id); if(no == null) continue;
    const sibs = MAPS.filter(x=> x.sub && x.parent === m.parent && !x.endless);
    m.nodes.forEach((n, i)=>{
      if(!n.deck || !Object.keys(n.deck).length) return;
      const k = n.kind || 'skirmish'; if(k === 'tutorial' || k === 'raidboss') return;
      if(m.endless && !DUNGEON_FLOORS.includes(n.floor)) return;
      const code = n.code || (m.sub ? `${no}-${String.fromCharCode(65 + Math.max(0, sibs.indexOf(m)))}-${i+1}` : `${no}-${i+1}`);
      const stageMap = G.nodeMapNumber(n);
      out.push({map: m.id, mapNo: no, side: !!m.sub, endless: !!m.endless, mapName: m.name, key: n.key, code, kind: k, name: n.name || n.key, stageMap, m, n});
    });
  }
  return out;
}
function stageOf(f){ const s = f.stageMap; return s <= 0 ? 'starter' : s <= 9 ? 'road' : s <= 17 ? 'mid' : 'strong'; }

// ---- decks
const CURVE = JSON.parse(fs.readFileSync(path.join(ROOT, 'docs/balance/difficulty-curve.json'), 'utf8'));
const REF = Object.fromEntries(Object.entries(CURVE.decks).map(([k, v])=> [k, Object.fromEntries(v.cards.map(c=> [c.id, c.n]))]));
// your cards at Level 1: "<id>@lv1" copies like the game's levelled enemy cards (only where Level 1 differs from the print)
const PLAYER_LV = 1, playerDefs = {};
function playerDeck(deck){
  const out = {};
  for(const [id, k] of Object.entries(deck)){ const b = CARD_DEFS_BASELINE[id]; if(!b){ continue; }
    if(G.cardBaseLevel(b) >= PLAYER_LV || (b.attack == null && b.health == null)){ out[id] = (out[id]||0) + k; continue; }
    const did = id + '@p' + PLAYER_LV; if(!playerDefs[did]){ const st = G.statsAtLevel(b, PLAYER_LV); playerDefs[did] = Object.assign({}, b, {id: did, derivedFrom: id, attack: st.attack, health: st.health, level: PLAYER_LV, baseLevel: G.cardBaseLevel(b), locked: false}); }
    out[did] = (out[did]||0) + k; }
  return out;
}
// The Road decks (Maps 1-9): built the way tools/difficulty_curve.js builds Mid-road and Strong, from what the game says you own
// arriving at that map (expectedPlayerDeck's pool: Base + every earlier map's rewards, no packs): cards ranked by their measured
// win rate (docs/balance/card-balance.json), Lumber makers in when the deck has 2+ Lumber cards, then a hill-climb that keeps a
// one-card swap only if the deck wins more across that map's own fights. (expectedPlayerDeck's own top 20 by stat score is all
// 0-Lumber chaff, 0% from Map 5 on, so it doesn't stand in for a player.) Built once: `node tools/skirmish_pass.js decks`
// writes docs/balance/skirmish-pass-decks.json, which measure and tune read.
const DECKS_FILE = path.join(ROOT, 'docs', 'balance', 'skirmish-pass-decks.json');
let ROAD = {}; try{ ROAD = JSON.parse(fs.readFileSync(DECKS_FILE, 'utf8')).road || {}; }catch(e){}
function stageDeck(f){
  const st = stageOf(f);
  if(st !== 'road') return {stage: st, deck: REF[st]};
  const d = ROAD[f.stageMap]; if(!d && CMD !== 'decks' && CMD !== 'list') throw new Error('no Road deck for Map ' + f.stageMap + ': run `node tools/skirmish_pass.js decks` first');
  return {stage: st, deck: d ? Object.fromEntries(d.cards.map(c=> [c.id, c.n])) : {}};
}
const BAL = {}; try{ (JSON.parse(fs.readFileSync(path.join(ROOT, 'docs/balance/card-balance.json'), 'utf8')).rows || []).forEach(r=> BAL[r.id] = r.winRate); }catch(e){}
const DCAP = {devlegendary:1, devancient:1, eventlegendary:1, legendary:1, mythic:1, ancient:1, unique:1, questunique:1, epic:2, heroic:2, veryrare:3, superrare:3, rare:4, uncommon:5};
const playableCard = c=> c && !c.token && !c.test && !c.hallOfFame && !c.hero && c.cardType !== 'materia' && c.cardType !== 'equipment' && c.id !== 'wandering-traveller' && c.id !== 'missingno' && !(c.effects||{}).leader && !(c.archetypes||[]).includes('Leader') && !(c.source && c.source.kind === 'secret');
const isLumberMaker = id=>{ const e = (CARD_DEFS_BASELINE[id]||{}).effects || {}; return !!(e.onSpawnGold || e.onReadyGold || e.bounty || (e.triggers||[]).some(t=> t && (t.do === 'gainGold' || t.do === 'gainLumber' || (t.do === 'gain' && (t.resource||'lumber') === 'lumber')))); };
function ownedAt(mapNo){ // expectedPlayerDeck's pool arriving at main map mapNo
  const owned = new Set(); G.resetOverlay(); const defs = G.getCardDefs();
  Object.keys(defs).forEach(id=>{ const d = defs[id]; if(playableCard(d) && (G.cardSourceOf ? G.cardSourceOf(d).kind : 'base') === 'base') owned.add(id); });
  for(const m of mains.slice(0, mapNo)) m.nodes.forEach(n=> G.nodeRewardCardIds(m.id, n.key).forEach(id=> owned.add(id)));
  return [...owned].filter(id=> playableCard(defs[id]));
}
function buildRoadDeck(mapNo, fightsOfMap, seed, prev){
  const strength = id=> BAL[id] != null ? BAL[id] : 40 + power(id) * 2;
  const ids = ownedAt(mapNo).sort((a, b)=> strength(b) - strength(a) || (a < b ? -1 : 1));
  const cap = id=> Math.min(4, DCAP[CARD_DEFS_BASELINE[id].rarity] || 10);
  const fill = start=>{ const deck = Object.assign({}, start||{}); let n = deckSize(deck); for(const id of ids){ if(deck[id]) continue; const k = Math.min(cap(id), 20 - n); if(k <= 0) break; deck[id] = k; n += k; } return deck; };
  let deck = fill();
  if(Object.keys(deck).filter(id=> (CARD_DEFS_BASELINE[id].cost||0) >= 2).length >= 2){ const lum = ids.filter(isLumberMaker).slice(0, 2); deck = fill(Object.fromEntries(lum.map(id=> [id, Math.min(3, cap(id))]))); }
  const score = d=> fightsOfMap.reduce((t, f)=> t + measure(f, null, 12, 4100, d).win, 0);
  let best = score(deck); if(prev){ const p = Object.fromEntries(prev.cards.map(c=> [c.id, c.n])), ps = score(p); if(ps > best){ best = ps; deck = p; } } /* the pool only grows, so last map's deck is a candidate */ const rnd = E.mulberry32(seed), top = ids.slice(0, 40);
  for(let it = 0; it < 40; it++){
    const cur = Object.keys(deck), out = cur[Math.floor(rnd() * cur.length)];
    const inn = top.filter(id=> !deck[id])[Math.floor(rnd() * Math.min(25, top.length))]; if(!inn) continue;
    const trial = Object.assign({}, deck), k = trial[out]; delete trial[out]; trial[inn] = Math.min(k, cap(inn));
    const filled = deckSize(trial) < 20 ? fill(trial) : trial;
    const sc = score(filled); if(sc > best){ best = sc; deck = filled; }
  }
  return {pool: ids.length, score: Math.round(best / fightsOfMap.length * 10) / 10, cards: Object.entries(deck).map(([id, n])=> ({id, name: CARD_DEFS_BASELINE[id].name, n}))};
}

// ---- one fight, as startConquestMatch builds it, played as simulateSkirmishVsDeck(…, {level}) plays it
const MY_CASTLE = CHARACTER_DEFS.castle || {id:'castle', health:30};
function measure(f, node, games, seed0, deckOverride){
  node = node || f.n; G.NODE_MAP_HINT.set(node, f.map);
  const sd = deckOverride ? {stage: 'trial', deck: deckOverride} : stageDeck(f), mine = playerDeck(sd.deck);
  G.resetOverlay();
  const enemyDeck = G.levelledEnemyDeck(f.n, node.deck); // the real node: roadEnemyLevel finds its map by identity, so a trial copy would fight at Level 0 G.setGrantMap(G.prepareLeaderGrants(node));
  const defs = Object.assign(G.getCardDefs(), playerDefs);
  const rules = G.fightRules(f.map, node), cpu = G.cpuAiLevelForNode(f.map, node), mode = node.battleMode || 'open';
  const sc = G.skirmishCastle(node);
  let wins = 0, losses = 0, rounds = 0, lost = 0;
  for(let g = 0; g < games; g++){
    const e = E.makeSimEngine(defs, E.mulberry32((seed0 || 9100) + g * 37), {recordEvents:false, battleMode: mode, rules, aiAim:true, aiLevel: cpu});
    const so = id=> id === 1 ? 'A' : 'B', stats = {};
    const P = {1: e.newPlayer(1, mine, MY_CASTLE), 2: e.newPlayer(2, enemyDeck, sc.character)};
    P[2].loopCards = []; G.applySkirmishSetup(P, node);
    if(node.floor > 1 && !node.tower) P[2].perks = Object.assign({}, P[2].perks || {}, {floorPct: (node.floor - 1) * 0.04});
    e.draw(P[1], 3, 'A', stats, null); e.draw(P[2], 3, 'B', stats, null);
    let r = 1, over = false, lastSig = null, stalled = 0;
    for(; r <= E.DRAW_ROUND_CAP && !over; r++){
      e.setSuddenDeath(r >= E.SUDDEN_DEATH_ROUND, r >= E.SUDDEN_DEATH_CASTLE_ROUND ? 2 : 1);
      [1,2].forEach(p=>{ P[p].playedThisTurn = false; P[p].discardUsedThisTurn = false; });
      if(r > 1) e.roundStart(P, r, so, stats, null);
      e.setAiLevel(1); e.aiTakeTurn(P, so, 1, stats, null); e.setAiLevel(cpu); e.aiTakeTurn(P, so, 2, stats, null);
      over = e.resolveCombat(P, so, stats, null, r % 2 === 0 ? 1 : 2); if(over) break;
      const sig = E.boardSignature(P); stalled = (sig === lastSig && E.noActionsLeft(P)) ? stalled + 1 : 0; lastSig = sig; if(stalled >= 2 && r >= E.STALL_DRAW_FROM_ROUND) break;
      e.draw(P[1], 1, 'A', stats, null); e.draw(P[2], 1, 'B', stats, null);
    }
    const a = P[1].hq.hp <= 0, b = P[2].hq.hp <= 0;
    if(over && b && !a){ wins++; rounds += r; lost += 1 - Math.max(0, P[1].hq.hp) / P[1].hq.maxHp; } else { if(over && a && !b) losses++; lost += 1; }
  }
  G.resetOverlay();
  return {win: Math.round(wins / games * 1000) / 10, loss: Math.round(losses / games * 1000) / 10, rounds: wins ? Math.round(rounds / wins * 10) / 10 : null,
    hpLost: Math.round(lost / games * 1000) / 10, cpu, stage: sd.stage, hp: sc.hp, shield: sc.shield, overridden: sc.overridden};
}
const verdict = w=> w > HI * 100 ? 'easy' : w < LO * 100 ? 'hard' : 'ok';

// ---- fixes: CPU deck tweak, then shieldOverride, then bramble Health
const typesOf = id=> [...((CARD_DEFS_BASELINE[id]||{}).archetypes||[]), ...((CARD_DEFS_BASELINE[id]||{}).species||[])];
const power = id=> G.skirmishCardScore(CARD_DEFS_BASELINE[id] || {});
const KEEP = new Set(['dromedary']); // the owner's new card walks in a Glass Dunes skirmish (tests/decisions-2026-10-18.js 8)
const RARE_UP = new Set(['epic','heroic','unique','questunique','legendary','mythic','ancient','devlegendary','devancient','eventlegendary']);
// How strong a card is: its measured win rate from the card pass (docs/balance/card-balance.json), else the stat score.
const strengthOf = id=> BAL[id] != null ? BAL[id] : 40 + power(id) * 2;
const MAP_BIOME = (()=>{ try{ return eval('(' + src.slice(src.indexOf('const MAP_BIOME_OF = ') + 'const MAP_BIOME_OF = '.length, src.indexOf('};', src.indexOf('const MAP_BIOME_OF = ')) + 1) + ')'); }catch(e){ return {}; } })();
const mainOf = m=> m.sub ? MAPS.find(x=> x.id === m.parent) : m;
// The cards a fight may take in, keeping the theme: the cards of this map's own fights (and its parent's / side maps'), the cards of
// same-biome maps two either side of it, and cards of the map's three main types from maps two back to one ahead. All within the
// road's rarity cap for the map the fight is on (tests/road-rarity-2026-10-16.js); never a token.
function themedPool(f){
  const m = f.m, main = mainOf(m), i = mains.indexOf(main), tally = {};
  const family = MAPS.filter(mm=> !mm.reserved && !mm.tower && (mm === m || mm === main || (mm.sub && mm.parent === main.id)));
  family.forEach(mm=> mm.nodes.forEach(x=> Object.entries(x.deck||{}).forEach(([id, c])=> typesOf(id).forEach(t=> tally[t] = (tally[t]||0) + c))));
  const top = new Set(Object.entries(tally).filter(([t])=> !['Structure','Leader','Bird','Beast','Mammal'].includes(t)).sort((a,b)=> b[1]-a[1]).slice(0, 3).map(([t])=> t));
  const near = (mm, lo, hi)=>{ const j = mains.indexOf(mainOf(mm)); return j >= i - lo && j <= i + hi; };
  const cardsOf = list=> list.flatMap(mm=> mm.nodes.filter(x=> x.kind !== 'raidboss' && x.kind !== 'tutorial').flatMap(x=> Object.keys(x.deck||{})));
  const own = cardsOf(family);
  const biome = MAP_BIOME[m.id] || MAP_BIOME[main.id];
  const sameBiome = cardsOf(MAPS.filter(mm=> !mm.reserved && !mm.tower && biome && (MAP_BIOME[mm.id] || MAP_BIOME[mainOf(mm).id]) === biome && near(mm, 2, 2)));
  const typed = cardsOf(MAPS.filter(mm=> !mm.reserved && !mm.tower && near(mm, 2, 1))).filter(id=> typesOf(id).some(t=> top.has(t)));
  return [...new Set([...own, ...sameBiome, ...typed])]
    .filter(id=> CARD_DEFS_BASELINE[id] && !CARD_DEFS_BASELINE[id].token && G.roadRarityOk(CARD_DEFS_BASELINE[id].rarity, f.mapNo, f.kind)); // the cap counts the map the fight is on
}
const deckSize = d=> Object.values(d).reduce((a, b)=> a + b, 0);
// Candidate moves of up to two copies, most promising first. A fight's namesake (Epic and up, or its showcase card) is never taken out.
// Too easy: the deck's weakest card makes way for a stronger themed one, or the strongest card it has gets more copies, or (under 20
// cards) a strong themed card is added. Too hard: the strongest card makes way for a weaker one from the map's own fights, or loses
// copies.
function deckMoves(f, deck, easy){
  const defs = CARD_DEFS_BASELINE, cap = id=> Math.min(4, G.maxCopiesForRarity(defs[id].rarity));
  const ids = Object.keys(deck).filter(id=> defs[id]).sort((a, b)=> strengthOf(b) - strengthOf(a));
  const movable = ids.filter(id=> !RARE_UP.has(defs[id].rarity) && id !== f.n.showcase && !KEEP.has(id));
  const pool = themedPool(f).filter(id=> !RARE_UP.has(defs[id].rarity) || deck[id]);
  const moves = [];
  if(easy){
    const weak = movable.slice(-2).reverse();
    const strong = pool.filter(id=> (deck[id]||0) < cap(id) && !weak.includes(id)).sort((a, b)=> strengthOf(b) - strengthOf(a)).slice(0, 3);
    strong.forEach(inn=> weak.forEach(out=> moves.push({type:'swap', out, inn, k: Math.min(2, deck[out], cap(inn) - (deck[inn]||0))})));
    ids.filter(id=> deck[id] < cap(id)).slice(0, 2).forEach(inn=> weak.filter(out=> out !== inn).slice(0, 1).forEach(out=> moves.push({type:'more', out, inn, k: Math.min(2, deck[out], cap(inn) - deck[inn])})));
    // a small deck runs dry (the CPU gets no loop cards on the road), so a deck under 16 cards grows first
    const adds = deckSize(deck) <= 18 ? strong.slice(0, 2).concat(ids.filter(id=> deck[id] < cap(id)).slice(0, 1)).map(inn=> ({type:'add', inn, k: Math.min(2, cap(inn) - (deck[inn]||0))})) : [];
    if(deckSize(deck) < 16) moves.unshift(...adds); else moves.push(...adds);
  } else {
    const strongest = movable.slice(0, 2);
    const ownIds = new Set(MAPS.filter(mm=> mm === f.m || mm === mainOf(f.m) || (mm.sub && mm.parent === mainOf(f.m).id)).flatMap(mm=> mm.nodes.flatMap(x=> Object.keys(x.deck||{}))));
    const weak = pool.filter(id=> ownIds.has(id) && !strongest.includes(id) && (deck[id]||0) < cap(id)).sort((a, b)=> strengthOf(a) - strengthOf(b)).slice(0, 3);
    weak.forEach(inn=> strongest.forEach(out=> moves.push({type:'swap', out, inn, k: Math.min(2, deck[out], cap(inn) - (deck[inn]||0))})));
    if(deckSize(deck) > 8) strongest.forEach(out=> moves.push({type:'remove', out, k: Math.min(2, deck[out])}));
  }
  return moves.filter(mv=> mv.k > 0);
}
// Maps 21-40: a quarter or more of a skirmish deck is Rare or better (tests/road-rarity-2026-10-16.js)
const rareStep = id=> ['common','uncommon','starter','quest'].indexOf(CARD_DEFS_BASELINE[id].rarity || 'common') < 0;
function rareQuarterOk(f, deck){ if(f.mapNo < 21 || f.mapNo > 40 || f.kind !== 'skirmish' || f.endless) return true;
  const tot = deckSize(deck), r = Object.entries(deck).reduce((a, [id, k])=> a + (rareStep(id) ? k : 0), 0); return tot > 0 && r / tot >= 0.25; }
function applyMove(deck, mv){
  const d = Object.assign({}, deck), k = mv.k || 1;
  if(mv.out){ d[mv.out] -= k; if(d[mv.out] <= 0) delete d[mv.out]; }
  if(mv.inn) d[mv.inn] = (d[mv.inn]||0) + k;
  return d;
}
// a little margin, so a fix doesn't sit on the edge; `top` lowers the ceiling (the `order` pass: an elite or boss under its map's skirmishes)
let TOP = HI * 100 - 4;
const inBand = w=> w >= LO * 100 + 3 && w <= TOP;
function tune(f, before, top){
  TOP = top != null ? top : HI * 100 - 4;
  const easy = before.win > TOP, trail = [];
  let node = f.n, cur = measure(f, null, N, TUNE_SEED); trail.push({what: "start", win: cur.win}); // the same seeds as every trial below
  const tryNode = (nn, what)=>{ const r = measure(f, nn, N, TUNE_SEED); trail.push({what, win: r.win}); return r; };
  // 1. CPU deck: up to four (too easy) or three (too hard) moves, each kept only if it moves the win rate the right way
  for(let step = 0; step < (easy ? 4 : 3) && !inBand(cur.win); step++){
    let best = null;
    for(const mv of deckMoves(f, node.deck, easy).slice(0, 7)){
      const nd = applyMove(node.deck, mv); if(!rareQuarterOk(f, nd)) continue; const nn = Object.assign({}, node, {deck: nd}); const r = tryNode(nn, mv);
      const gain = easy ? cur.win - r.win : r.win - cur.win;
      const over = easy ? r.win < (TOP < HI * 100 - 4 ? Math.max(LO * 100 + 3, TOP - 25) : 50) : r.win > 65; // a light touch: don't swing a fight to the far side of the road's curve
      if(gain > 2 && !over && (!best || Math.abs(r.win - (easy ? 80 : 30)) < Math.abs(best.r.win - (easy ? 80 : 30)))) best = {mv, nn, r};
      if(best && inBand(best.r.win)) break;
    }
    if(!best) break; node = best.nn; cur = best.r; (node._moves = (node._moves || []).concat([best.mv]));
  }
  const moves = node._moves || [];
  // 2. Shield: an override searched between 0 and the rule x 4 (at least 40)
  let shield = null;
  if(!inBand(cur.win) && (easy || cur.shield > 0)){
    const rule = G.ruleShieldOf(node), base = cur.shield;
    let lo = easy ? base + 1 : 0, hi = easy ? Math.max(60, rule * 5, base + 40) : Math.max(0, base - 1), best = null;
    for(let it = 0; it < 7 && lo <= hi; it++){
      const s = Math.floor((lo + hi) / 2), nn = Object.assign({}, node, {shieldOverride: s}); const r = tryNode(nn, {shield: s});
      if(inBand(r.win) && (!best || Math.abs(s - base) < Math.abs(best.s - base))) best = {s, r, nn};
      if(r.win > TOP) lo = s + 1; else if(r.win < LO * 100 + 3) hi = s - 1; else { if(easy) hi = s - 1; else lo = s + 1; } // in band: look for a lighter touch
    }
    if(!best && !easy){ const nn = Object.assign({}, node, {shieldOverride: 0}); const r = tryNode(nn, {shield: 0}); best = {s: 0, r, nn}; }
    if(best && (inBand(best.r.win) || !easy)){ node = best.nn; cur = best.r; shield = best.s; }
  }
  // 3. Health (only lower: hqHp can't raise a bramble past its own Health)
  let hqHp = null;
  if(!inBand(cur.win) && !easy){
    let lo = 6, hi = cur.hp - 1, best = null;
    for(let it = 0; it < 6 && lo <= hi; it++){
      const h = Math.floor((lo + hi) / 2), nn = Object.assign({}, node, {hqHp: h}); const r = tryNode(nn, {hqHp: h});
      if(inBand(r.win) && (!best || h > best.h)) best = {h, r, nn};
      if(r.win < LO * 100 + 3) hi = h - 1; else lo = h + 1;
    }
    if(best){ node = best.nn; cur = best.r; hqHp = best.h; }
  }
  return {moves, deck: moves.length ? node.deck : null, shieldOverride: shield, hqHp, after: cur, trail};
}

// ---- commands
const all = fights().filter(f=> !ONLY.length || ONLY.includes(f.map) || ONLY.includes(f.key) || ONLY.includes(f.code));
const OUTDIR = path.join(ROOT, 'docs', 'balance');
const readJsonl = file=>{ try{ return fs.readFileSync(file, 'utf8').split('\n').filter(Boolean).map(l=> JSON.parse(l)); }catch(e){ return []; } };
const rowOf = (f, extra)=>{ const {m, n, ...row} = f; return Object.assign(row, extra); };
if(CMD === 'list'){
  all.forEach(f=>{ const sd = stageDeck(f); console.log(`${f.code.padEnd(9)} ${f.map.padEnd(4)} ${f.kind.padEnd(9)} stage ${sd.stage.padEnd(7)} cpu ${G.cpuAiLevelForNode(f.map, f.n)}  ${f.name}`); });
  console.log(all.length, 'fights'); console.log('road deck at Map 1:', JSON.stringify(stageDeck(all.find(f=> f.mapNo === 1)).deck));
} else if(CMD === 'decks'){
  const F = fights(), out = {generated: '2026-10-18', note: 'Road decks for Maps 1-9 (tools/skirmish_pass.js decks); Starter / Mid-road / Strong are docs/balance/difficulty-curve.json', road: {}};
  for(let no = 1; no <= 9; no++){ const t = Date.now(), fm = F.filter(f=> f.mapNo === no && !f.side);
    out.road[no] = buildRoadDeck(no, fm, 900 + no, out.road[no - 1]); console.log(`Map ${no}: ${out.road[no].score}% on its own fights, pool ${out.road[no].pool}, ${((Date.now()-t)/1000).toFixed(0)}s:`, out.road[no].cards.map(c=> `${c.n}x ${c.name}`).join(', '));
    fs.writeFileSync(DECKS_FILE, JSON.stringify(out, null, 1) + '\n'); }
} else if(CMD === 'measure'){
  const OUT = path.join(OUTDIR, `skirmish-pass-${opt('tag', 'before')}.jsonl`), done = new Set(readJsonl(OUT).map(r=> r.map + ':' + r.key));
  const mine = all.filter((f, i)=> i % NSH === SHARD && !done.has(f.map + ':' + f.key));
  console.log('fights', all.length, 'mine', mine.length);
  for(const f of mine){ const t = Date.now(), r = measure(f, null, N, opt('seed') ? TUNE_SEED : undefined); /* --seed=K: a fresh seed set (the verify run) */ fs.appendFileSync(OUT, JSON.stringify(rowOf(f, Object.assign(r, {verdict: verdict(r.win), games: N, ms: Date.now() - t}))) + '\n'); }
  console.log('done');
} else if(CMD === 'tune'){
  const before = readJsonl(path.join(OUTDIR, `skirmish-pass-${opt('from', 'before')}.jsonl`));
  const OUT = path.join(OUTDIR, opt('fixes', 'skirmish-pass-fixes') + '.jsonl'), done = new Set(readJsonl(OUT).map(r=> r.map + ':' + r.key));
  const todo = all.filter(f=>{ const b = before.find(r=> r.map === f.map && r.key === f.key); return b && b.verdict !== 'ok' && !f.endless; }).filter((f, i)=> i % NSH === SHARD && !done.has(f.map + ':' + f.key)); // shard first, so two shards started apart never overlap
  console.log('outliers to tune', todo.length);
  for(const f of todo){ const b = before.find(r=> r.map === f.map && r.key === f.key), t = Date.now(), fx = tune(f, b);
    fs.appendFileSync(OUT, JSON.stringify(Object.assign(rowOf(f, {}), {before: b.win, verdict: b.verdict, ms: Date.now() - t}, fx)) + '\n');
    console.log(f.code, b.win, '->', fx.after.win, JSON.stringify(fx.moves), fx.shieldOverride, fx.hqHp); }
} else if(CMD === 'order'){
  // Elites and bosses should sit harder than their map's skirmishes (docs/difficulty-curve-2026-10-03.md): an elite or boss that the
  // stage deck beats more often than the map's skirmishes on average gets the same light-touch tune with its ceiling at that average
  // minus 5 (and never below 40%). Endless dungeon floors are left out.
  const now = readJsonl(path.join(OUTDIR, `skirmish-pass-${opt('from', 'after')}.jsonl`));
  const OUT = path.join(OUTDIR, opt('fixes', 'skirmish-pass-order') + '.jsonl'), done = new Set(readJsonl(OUT).map(r=> r.map + ':' + r.key));
  const skMean = {}; now.filter(r=> r.kind === 'skirmish' && !r.endless).forEach(r=>{ (skMean[r.map] = skMean[r.map] || []).push(r.win); });
  const mean = a=> a && a.length ? a.reduce((x, y)=> x + y, 0) / a.length : null;
  const todo = all.filter(f=>{ if(f.endless || f.kind === 'skirmish') return false; const r = now.find(x=> x.map === f.map && x.key === f.key), m = mean(skMean[f.map]);
    return r && m != null && r.win > Math.max(40, m - 5) && r.win >= LO * 100; }).filter((f, i)=> i % NSH === SHARD && !done.has(f.map + ':' + f.key));
  console.log('elites / bosses over their skirmishes', todo.length);
  for(const f of todo){ const r = now.find(x=> x.map === f.map && x.key === f.key), top = Math.max(40, Math.round(mean(skMean[f.map]) - 5)), t = Date.now(), fx = tune(f, r, top);
    fs.appendFileSync(OUT, JSON.stringify(Object.assign(rowOf(f, {}), {before: r.win, verdict: 'order', top, ms: Date.now() - t}, fx)) + '\n');
    console.log(f.code, r.win, 'top', top, '->', fx.after.win, JSON.stringify(fx.moves), fx.shieldOverride, fx.hqHp); }
} else if(CMD === 'apply'){
  const fixes = readJsonl(path.join(OUTDIR, opt('fixes', 'skirmish-pass-fixes') + '.jsonl')).filter(x=> x.apply !== false && (x.deck || x.shieldOverride != null || x.hqHp != null));
  let s = fs.readFileSync(APP, 'utf8'), n = 0;
  for(const x of fixes){
    const re = new RegExp(`(\\{ ?key:\\s*['"]${x.key.replace(/[-]/g, '\\-')}['"],[^\\n]*)`); const mm = s.match(re); if(!mm){ console.log('not found', x.key); continue; }
    let line = mm[1];
    if(x.deck) line = line.replace(/deck:\{[^}]*\}/, 'deck:' + JSON.stringify(x.deck));
    if(x.hqHp != null) line = /hqHp:\d+/.test(line) ? line.replace(/hqHp:\d+/, 'hqHp:' + x.hqHp) : line.replace(/deck:/, `hqHp:${x.hqHp}, deck:`);
    if(x.shieldOverride != null) line = /shieldOverride:\d+/.test(line) ? line.replace(/shieldOverride:\d+/, 'shieldOverride:' + x.shieldOverride) : line.replace(/deck:/, `shieldOverride:${x.shieldOverride}, deck:`);
    s = s.replace(mm[1], line); n++;
  }
  fs.writeFileSync(APP, s); console.log('applied', n, 'fixes to arena_app.js');
}
