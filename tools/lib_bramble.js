// The game's own fight build, read out of arena_app.js for the balance tools (2026-10-18, package SKB). Since X3 the enemy bramble's
// Health is its own (hqHp only lowers it) and its Shield follows a rule (ruleShieldOf: map number x 1 / 1.5 / 2 / 3 by kind) or the
// node's shieldOverride, so a tool that moved hqHp as "Health + Shield" no longer moved anything. This module evaluates the real
// functions (skirmishCastle, ruleShieldOf, fightRules, levelledEnemyDeck, cpuAiLevelForNode, expectedPlayerDeck ...) over the real
// CONQUEST_MAPS (with the endless dungeons; the Babel Spire is left out), the way tests/shields-2026-10-18.js does, so the tools
// measure what the game builds without a copy of the rules to keep in step.
//   const B = require('./lib_bramble.js');  B.G.skirmishCastle(B.byKey('mc', '3-1'))  ->  {hp, shield, total, rule, overridden, ...}
//   B.retotal(node, total)  ->  the edit that gives a fight that bramble total under the rule: {shieldOverride} or {hqHp, shieldOverride:0}
'use strict';
const fs = require('fs'), path = require('path');
const ROOT = path.join(__dirname, '..');
const E = require(path.join(ROOT, 'bramblewood-engine.js'));
const src = fs.readFileSync(path.join(ROOT, 'arena_app.js'), 'utf8');
const cardsRaw = JSON.parse(fs.readFileSync(path.join(ROOT, 'canonical/cards.json'), 'utf8'));
const charsRaw = JSON.parse(fs.readFileSync(path.join(ROOT, 'canonical/characters.json'), 'utf8'));

// string / comment / template aware brace matching
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
  let m = new RegExp(`^(?:async )?function ${name}\\(`, 'm').exec(src); // + async (2026-10-19, W2: checkSkirmishCurve)
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
  'roadEnemyLevel', 'levelledEnemyDeck', 'hashStr', 'KIND_BASE', 'baseKind',
  // 2026-10-19 (W2): the map win-rate panel's reference player, so the tools play exactly what the skirmish editor's panel plays
  'seededRng', 'sleep', 'CONQUEST_DEFAULT_MODE', 'levelGateMap', 'WINRATE_REF_DECKS', 'referencePlayerLevel', 'referenceDeckFor', 'referenceBaseDefs', 'referencePlayerDeck',
  'referenceFightSetup', 'playReferenceGame', 'simulateReferenceFight', 'skirmishTargetWinRate', 'SKIRMISH_CURVE_SIMS', 'skirmishCurveSimCache', 'SKIRMISH_CURVE_GAME_MS', /* + _FIGHT_MS, _BUDGET_MS: one declaration */ 'roadEnderKind', 'applyRoadKinds',
  'skirmishCurveSig', 'skirmishCurveErrText', 'checkSkirmishCurve'];
const ms = src.indexOf('const CONQUEST_MAPS = ['), me = src.indexOf('\n];', ms) + 3;
const dg = src.indexOf('function endlessDungeon(cfg){'), dgEnd = src.indexOf('\nconst TOWER_LEVEL_CAP', dg); // the endless dungeons; the Tower is left out
const CARD_DEFS_BASELINE = {}; cardsRaw.forEach(c=>{ const d = Object.assign({effects:{}}, c); delete d.art; CARD_DEFS_BASELINE[c.id] = d; });
const CHARACTER_DEFS = {}; (Array.isArray(charsRaw) ? charsRaw : Object.values(charsRaw)).forEach(c=> CHARACTER_DEFS[c.id] = c);
const body = [
  'let matchDefsOverlay = {}, matchLeaderGrantMap = null; const liveCards = {}, liveDeletes = {}; const AI_LEVEL_MAX = E.AI_LEVEL_MAX;',
  'const makeSimEngine = E.makeSimEngine, boardSignature = E.boardSignature, noActionsLeft = E.noActionsLeft, DRAW_ROUND_CAP = E.DRAW_ROUND_CAP, SUDDEN_DEATH_ROUND = E.SUDDEN_DEATH_ROUND, SUDDEN_DEATH_CASTLE_ROUND = E.SUDDEN_DEATH_CASTLE_ROUND, STALL_DRAW_FROM_ROUND = E.STALL_DRAW_FROM_ROUND;',
  'function invalidateCardDefs(){} function getCardDefs(){ return Object.assign({}, CARD_DEFS_BASELINE, matchDefsOverlay); }',
  src.slice(ms, me), src.slice(dg, dgEnd),
  ...NAMES.map(grab),
  // 2026-10-19 (W2): the game gives each main map's last fight its kind at load (applyNodeEdits -> applyRoadKinds: Map 0 a skirmish,
  // Maps 1-4 an elite, every 5th map a boss, the rest a mini-boss). The tools read the source's kinds before today, so every map ender
  // was measured with the wrong Shield multiplier, castle level, CPU level and boss enemy level (e.g. 1-5 as a boss; the game's is an elite).
  'applyRoadKinds();',
  'return {CONQUEST_MAPS, mapNumberOf, nodeMapNumber, ruleShieldOf, skirmishCastle, prepareLeaderGrants, applySkirmishSetup, fightRules, levelledEnemyDeck, roadEnemyLevel, cpuAiLevelForNode,',
  '  expectedPlayerDeck, cardSourceOf, roadRarityOk, roadRarityCap, statsAtLevel, cardBaseLevel, maxCopiesForRarity, skirmishCardScore, NODE_MAP_HINT, baseKind, nodeRewardCardIds,',
  '  roadEnderKind, WINRATE_REF_DECKS, referencePlayerLevel, referenceDeckFor, referenceFightSetup, playReferenceGame, simulateReferenceFight, skirmishTargetWinRate, checkSkirmishCurve, skirmishCurveSimCache, SKIRMISH_CURVE_SIMS,',
  '  overlay: ()=> matchDefsOverlay, resetOverlay: ()=>{ matchDefsOverlay = {}; matchLeaderGrantMap = null; }, setGrantMap: m=>{ matchLeaderGrantMap = m; }, getCardDefs};',
].join('\n');
const G = new Function('E', 'CARD_DEFS_BASELINE', 'CHARACTER_DEFS', body)(E, CARD_DEFS_BASELINE, CHARACTER_DEFS);
const byKey = (mapId, key)=>{ const m = G.CONQUEST_MAPS.find(x=> x.id === mapId); return m && m.nodes.find(n=> n.key === key); };
// The bramble as the game builds it for a node from another tool's own eval of CONQUEST_MAPS (matched by map id and key, with that
// tool's edits to the deck / hqHp / shieldOverride carried over).
function brambleOf(mapId, node){ const real = byKey(mapId, node.key); const t = Object.assign({}, real || {}, node); G.NODE_MAP_HINT.set(t, mapId); return G.skirmishCastle(t); }
// The edit that gives a node a bramble total of `total` (Health + Shield) under the rule: the Shield moves first (shieldOverride, or
// none when the total lands on the rule's own value); below the bramble's own Health, hqHp lowers it and the Shield is 0.
function retotal(mapId, node, total){
  const t = Object.assign({}, byKey(mapId, node.key) || {}, node); delete t.shieldOverride; G.NODE_MAP_HINT.set(t, mapId);
  const sc = G.skirmishCastle(t), own = sc.hp; total = Math.max(1, Math.round(total));
  if(total >= own){ const s = total - own; return s === sc.rule ? {shieldOverride: null} : {shieldOverride: s}; }
  return {hqHp: total, shieldOverride: 0};
}
// Writes node edits into arena_app.js's CONQUEST_MAPS lines: [{key, deck?, hqHp?, shieldOverride?}] (shieldOverride null = back on
// the rule). Returns the number of nodes written; the file is only touched when `write` is true.
function writeNodeEdits(edits, write){
  const APP = path.join(ROOT, 'arena_app.js'); let s = fs.readFileSync(APP, 'utf8'), n = 0;
  for(const x of edits){
    const re = new RegExp(`(\\{ ?key:\\s*['"]${x.key.replace(/[-]/g, '\\-')}['"],[^\\n]*)`); const mm = s.match(re); if(!mm){ console.log('not found', x.key); continue; }
    let line = mm[1];
    if(x.deck) line = line.replace(/deck:\{[^}]*\}/, 'deck:' + JSON.stringify(x.deck));
    if(x.hqHp != null) line = /hqHp:\d+/.test(line) ? line.replace(/hqHp:\d+/, 'hqHp:' + x.hqHp) : line.replace(/deck:/, `hqHp:${x.hqHp}, deck:`);
    if('shieldOverride' in x){
      if(x.shieldOverride == null) line = line.replace(/,? ?shieldOverride:\d+/, '');
      else line = /shieldOverride:\d+/.test(line) ? line.replace(/shieldOverride:\d+/, 'shieldOverride:' + x.shieldOverride) : line.replace(/deck:/, `shieldOverride:${x.shieldOverride}, deck:`);
    }
    if(line !== mm[1]){ s = s.replace(mm[1], line); n++; }
  }
  if(write) fs.writeFileSync(APP, s);
  return n;
}
module.exports = {G, E, MAPS: G.CONQUEST_MAPS, CARD_DEFS_BASELINE, CHARACTER_DEFS, byKey, brambleOf, retotal, writeNodeEdits, src, grab}; // + grab (2026-10-19, package RX: tools/raid_full_sim.js)
