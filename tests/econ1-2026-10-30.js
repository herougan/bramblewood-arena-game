#!/usr/bin/env node
// Package ECON1 (2026-10-30, owner BRUP-1 10:34: "Their own resource & a bit of normal resource. The bramble resource comes from winning
// fights. Dealing damage to bramble does net you a tiny bit even on loss. Overall - help me half all the resources you get, (except
// first-time rewards). Because, i want to make the first two daily dungeons: one gives bramble resources, the other gives normal resources.
// - grinding that = lvl 0 common unit levelled to lvl 10 per week."):
//   1. a bramble's Reinforce costs Briar Blossoms plus a quarter of the old Dust / Leaves; the old castle credit moves over; Reinforce spends them
//   2. a won Conquest fight pays Blossoms (by kind and map), a loss a small share by the bramble damage dealt; the results show them
//   3. income halved except first-time rewards (spot checks per source); first clears unchanged
//   4. the first two daily dungeons: a week of grinding both (22 keys, 11 won floors each) is a Common card's Level 0 -> 10 and a Common
//      bramble's Level 0 -> 10
//   5. TX keys in all 12 packs; cloud sync and the proposed SQL
'use strict';
const fs = require('fs'), path = require('path'), vm = require('vm');
const ROOT = path.join(__dirname, '..');
const src = fs.readFileSync(path.join(ROOT, 'arena_app.js'), 'utf8');
const {TEXT, TX} = require(path.join(ROOT, 'bramblewood-texts.js'));
const UC = JSON.parse(fs.readFileSync(path.join(ROOT, 'canonical', 'upgrade-costs.json'), 'utf8'));
let fail = 0, n = 0; const ok = (c, m)=>{ n++; if(!c){ fail++; console.log('  ✗', m); } };
const fnSrc = name=>{ let i = src.indexOf(`\nfunction ${name}(`); if(i < 0) i = src.indexOf(`\nasync function ${name}(`); if(i < 0) return '';
  let d = 0, j = src.indexOf('{', src.indexOf(')', i)); for(let k = j; k < src.length; k++){ const ch = src[k]; if(ch === '{') d++; else if(ch === '}'){ d--; if(!d) return src.slice(i, k + 1); } } return ''; };
const between = (a, b)=>{ const i = src.indexOf(a), j = src.indexOf(b, i); return i >= 0 && j > i ? src.slice(i, j + b.length) : ''; };
const fakeStorage = ()=>{ const m = new Map(); return {getItem: k=> m.has(k) ? m.get(k) : null, setItem: (k, v)=> m.set(k, String(v)), removeItem: k=> m.delete(k), _m: m}; };
const INCOME = between('// ECON1_INCOME:BEGIN', '// ECON1_INCOME:END'), BLOSS = between('// ECON1_BLOSSOMS:BEGIN', '// ECON1_BLOSSOMS:END');
ok(INCOME.length > 1000 && BLOSS.length > 1000, 'the ECON1_INCOME and ECON1_BLOSSOMS blocks are there');

// ---------- 1. bramble costs ----------
const CASTLE = between('const CASTLE_MAX_LEVEL = 20', '\n// 2026-10-18 (package NF): the spares are copySpareIdx');
function castleCtx(){
  const cur = {blossoms: 0, dust: 0, gold: 0};
  const ctx = {localStorage: fakeStorage(), JSON, Math, Number, Object, Array, Set, console,
    UPGRADE_COSTS: UC, LEVEL_COST_MULT: UC.levelCostMult, RARITY_DEFS: [],
    CHARACTER_DEFS: {castle: {id:'castle', rarity:'common', health:30}, rr: {id:'rr', rarity:'rare', health:28}},
    myCurrencies: cur, saveCurrencies(){}, fxHook(){}, ownedCount: ()=> 99, spendCopies(){}, levelGateNeed: ()=> 0, LIMIT_BREAK_LEVEL: 11, brambleChar: x=> x};
  vm.createContext(ctx);
  vm.runInContext(CASTLE + '\n' + fnSrc('castleCanTemper') + '\n' + fnSrc('temperCastle') + '\nthis.F = {castleLevelUpCost, castleLevelUpCostRaw, castleNetCost, castleCreditOf, castleRoadCost, castleCanTemper, temperCastle, fuseCastleDuplicates, addCastleDuplicate, BRAMBLE_COST, CASTLE_CREDIT_KEY, CASTLE_LEVELS_KEY};', ctx);
  return ctx;
}
{
  const c = castleCtx(), F = c.F;
  ok(F.BRAMBLE_COST.normalShare === UC.bramble.normalShare && UC.bramble.normalShare > 0 && UC.bramble.normalShare <= 0.25, '1. the normal share comes from canonical/upgrade-costs.json (a bit: <= 25%)');
  [0, 5, 9, 10, 15, 19].forEach(L=>{ ['castle', 'rr'].forEach(id=>{
    const raw = F.castleLevelUpCostRaw(L, id), x = F.castleLevelUpCost(L, id);
    ok(x.blossoms === Math.round(raw.dust * UC.bramble.blossomsPerDust) && x.blossoms > x.dust, `1. ${id} Lv ${L}: mostly Blossoms (${x.blossoms})`);
    ok(x.dust === Math.round(raw.dust * UC.bramble.normalShare) && x.gold === Math.round(raw.gold * UC.bramble.normalShare), `1. ${id} Lv ${L}: a quarter of the old Dust and Leaves (${x.dust} / ${x.gold} of ${raw.dust} / ${raw.gold})`); }); });
  ok(F.castleLevelUpCostRaw(0, 'castle').dust === 15 && F.castleLevelUpCostRaw(10, 'castle').dust === 45 && F.castleLevelUpCostRaw(5, 'rr').dust === 300, '1. the old ramp is unchanged (15 + 12L, x3 from 10, x rarity)');
  ok(JSON.stringify(F.castleLevelUpCost(21, 'castle').mats) === JSON.stringify(F.castleLevelUpCostRaw(21, 'castle').mats) && F.castleLevelUpCost(21, 'castle').mats['ember-core'] >= 1, '1. the limit break still takes its materials');
  // Reinforce spends Blossoms + the small share
  c.localStorage.setItem(F.CASTLE_LEVELS_KEY, '{}');
  const cost0 = F.castleNetCost(0, 'castle');
  Object.assign(c.myCurrencies, {blossoms: cost0.blossoms - 1, dust: 999, gold: 999});
  ok(!F.castleCanTemper('castle'), '1. one Blossom short: no Reinforce');
  c.myCurrencies.blossoms = cost0.blossoms + 5;
  ok(F.castleCanTemper('castle') && F.temperCastle('castle'), '1. enough: Reinforce goes');
  ok(c.myCurrencies.blossoms === 5 && c.myCurrencies.dust === 999 - cost0.dust && c.myCurrencies.gold === 999 - cost0.gold, '1. it spends the Blossoms and the small share of Dust and Leaves');
  // the old credit moves over: same share of the road covered
  const c2 = castleCtx(), G = c2.F; const raw5 = G.castleLevelUpCostRaw(5, 'rr');
  c2.localStorage.setItem(G.CASTLE_CREDIT_KEY, JSON.stringify({rr: {dust: raw5.dust, gold: raw5.gold}}));
  const cr = G.castleCreditOf('rr'), net = G.castleNetCost(5, 'rr');
  ok(cr.blossoms === raw5.dust && cr.dust === Math.round(raw5.dust * 0.25) && cr.gold === Math.round(raw5.gold * 0.25), '1. an old {dust, gold} credit becomes Blossoms + the normal share');
  ok(net.blossoms === 0 && net.dust === 0 && net.gold === 0, '1. a credit that paid a whole step before still pays that whole step');
  ok(JSON.parse(c2.localStorage.getItem(G.CASTLE_CREDIT_KEY)).rr.v === 2 && G.castleCreditOf('rr').blossoms === raw5.dust, '1. the move runs once (v:2), a second read changes nothing');
  G.addCastleDuplicate('castle', 1); const v = G.fuseCastleDuplicates('castle'), road = G.castleRoadCost('castle');
  ok(v && v.blossoms === Math.round(road.blossoms / 8) && G.castleCreditOf('castle').blossoms === v.blossoms, '1. a fused spare bramble banks 1/8 of the road, Blossoms too');
}

// ---------- 2. Blossoms from fights ----------
function blossCtx(o){
  o = o || {};
  const got = [];
  const ctx = {localStorage: fakeStorage(), JSON, Math, Number, Object, Array, console,
    res3ForgeTabOpen: ()=> o.open !== false, mapNumberOf: id=> ({m0:0, m10:10, m20:20, mm:6})[id], baseKind: k=> ({miniboss:'elite'})[k] || k,
    CONQUEST_MAPS: [{id:'m0'}, {id:'m10'}, {id:'m20'}, {id:'mm', endless:true}], isDailyDungeonMap: m=> !!(m && m.endless),
    findConquestNode: (mapId, nodeId)=> ({node: {key: nodeId, kind: o.kind || 'skirmish'}}),
    grantCurrency: (k, v)=> got.push([k, v]), myCurrencies: {}};
  vm.createContext(ctx); vm.runInContext(BLOSS + '\nthis.F = {blossomWinPay, blossomLossPay, settleBlossoms, BRAMBLE_WIN_BLOSSOMS};', ctx);
  return {F: ctx.F, got};
}
const match = (mapId, winner, dealt, maxHp, extra)=> Object.assign({mode:'conquest', conquestNode:{mapId, nodeId:'x'}, winner, players:{2:{hq:{maxHp, hp: maxHp - dealt}}}}, extra || {});
{
  let t = blossCtx(), m = match('m10', 1, 40, 40);
  ok(t.F.settleBlossoms(m) === 8 && m.conquestBlossomsEarned === 8 && t.got.length === 1 && t.got[0][0] === 'blossoms', '2. a won skirmish on Map 10 pays 4 x 2 = 8 Blossoms');
  ok(t.F.settleBlossoms(m) === 0 && t.got.length === 1, '2. once per match');
  t = blossCtx({kind:'boss'}); ok(t.F.settleBlossoms(match('m20', 1, 40, 40)) === 45, '2. a boss on Map 20 pays 15 x 3 = 45');
  t = blossCtx(); m = match('m10', 2, 20, 40);
  ok(t.F.settleBlossoms(m) === 1 && m.conquestBlossomsLoss, '2. a loss that took half the enemy bramble pays a quarter of the win x half (8 x 0.25 x 0.5 = 1)');
  t = blossCtx({kind:'boss'}); ok(t.F.settleBlossoms(match('m20', 2, 40, 40)) === 11, '2. a loss that nearly won: a quarter of the win (45 -> 11)');
  t = blossCtx(); ok(t.F.settleBlossoms(match('m10', 2, 0, 40)) === 0 && !t.got.length, '2. a loss with no bramble damage pays nothing');
  t = blossCtx(); ok(t.F.settleBlossoms(match('m10', 0, 3, 40)) === 1, '2. a draw with a scratch on the bramble pays at least 1');
  t = blossCtx({open:false}); ok(t.F.settleBlossoms(match('m10', 1, 40, 40)) === 0, '2. before Reinforce opens (Map ' + (src.match(/castles:(\d+)/) || [])[1] + '), no Blossoms from fights');
  t = blossCtx(); ok(t.F.settleBlossoms(match('mm', 1, 40, 40)) === 0, '2. a daily dungeon floor pays only its own table (DAILY_DUNGEON_PAY)');
  ['adminTest', 'rewardDuplicate', 'towerReplay'].forEach(f=>{ t = blossCtx(); ok(t.F.settleBlossoms(match('m10', 1, 40, 40, {[f]: true})) === 0, `2. ${f}: nothing`); });
  // wired into the match end, before the duplicate guard, and into the results and the Sweep
  const end = src.indexOf('try{ settleBlossoms(m); }catch(e){}'), dup = src.indexOf('if(m.rewardDuplicate){ /* 2026-10-21');
  ok(end > 0 && dup > end && dup - end < 400, '2. settleBlossoms runs at the match end');
  ok(/if\(m\.conquestBlossomsEarned\) cur\.push\(\['blossoms', m\.conquestBlossomsEarned\]\)/.test(fnSrc('rewardsPanelHTML')), '2. the results show the Blossoms pill');
  ok(/blossomWinPay\(mapId, node\)/.test(fnSrc('runSweep')) && /grantCurrency\('blossoms', blossoms\)/.test(fnSrc('runSweep')), '2. the Sweep pays Blossoms for its wins');
  ok(/forgeMode === 'castles' \? `<span class="forge-coin blossoms"/.test(src), '2. the Forge wallet shows Blossoms on Reinforce only');
  ok(/if\(k === 'blossoms'\) return blossomsShown\(\)/.test(fnSrc('currencyShown')), '2. the Inventory wallet shows them only once they matter');
}

// ---------- 3. income halved, first-time rewards not ----------
const ictx = {localStorage: fakeStorage(), JSON, Math, Number, Object, Array, console};
vm.createContext(ictx); vm.runInContext(INCOME + '\nthis.F = {ECON_INCOME_MULT, econScale, econPay, econPayAll, econScaleTable, econMult};', ictx);
const E = ictx.F;
ok(Object.keys(E.ECON_INCOME_MULT).length >= 15 && Object.values(E.ECON_INCOME_MULT).every(v=> v === 0.5), '3. every listed source is at one half');
ok(E.econScale('quests', 'dust', 8) === 4 && E.econScale('quests', 'dust', 1) === 1 && E.econScale('quests', 'xp', 40) === 40 && E.econScale('quests', 'kibble', 20) === 20, '3. econScale: halves the wallet currencies only, never to 0');
{ let s = 0; for(let i = 0; i < 10; i++) s += E.econPay('arena', 'dust', 1); ok(s === 5, '3. econPay carries the half: ten 1-Dust wins pay 5'); }
ok(E.econPay('arena', 'gold', 4) === 2 && E.econPay('nope', 'gold', 4) === 4 && JSON.stringify(E.econPayAll('raids', {gold: 10, dust: 6, ink: 3, card: 'x'})) === JSON.stringify({gold: 5, dust: 3, ink: 3, card: 'x'}), '3. econPay / econPayAll: listed sources and wallet kinds only');
// Conquest: the repeat halved, the first clear not (nodeRewardTier, the source of the payout, the preview, the Sweep and Clear map)
{
  const ctx = {CONQUEST_NODE_REWARDS: null, baseKind: k=> ({miniboss:'elite'})[k] || k, econScale: E.econScale, Math, Number, Object};
  vm.createContext(ctx);
  vm.runInContext(between('const CONQUEST_NODE_REWARDS = {', '};') + '\n' + fnSrc('nodeRewardTier') + '\n' + between('const DAILY_DUNGEON_PAY = ', ';') + '\n' + fnSrc('dailyDungeonPay') + '\nthis.F = {nodeRewardTier, CONQUEST_NODE_REWARDS, DAILY_DUNGEON_PAY};', ctx);
  const R = ctx.F;
  ['skirmish', 'elite', 'boss', 'raidboss', 'finalboss'].forEach(k=>{ const t = R.nodeRewardTier({kind: k}), b = R.CONQUEST_NODE_REWARDS[k];
    ok(t.first.gold === b.first.gold && t.first.dust === b.first.dust, `3. ${k}: the first clear is unchanged (${b.first.gold} / ${b.first.dust})`);
    ok(t.repeat.gold === E.econScale('conquestRepeat', 'gold', b.repeat.gold) && t.repeat.dust === E.econScale('conquestRepeat', 'dust', b.repeat.dust) && t.repeat.gold < b.repeat.gold, `3. ${k}: a repeat pays half (${b.repeat.gold} -> ${t.repeat.gold} Leaves)`); });
  const ov = R.nodeRewardTier({kind:'elite', rewards:{repeat:{gold: 30}}}); ok(ov.repeat.gold === 15, '3. a node\'s own repeat override is halved too');
  // 4. the daily dungeon floors
  const mm = R.nodeRewardTier({kind:'skirmish', dungeonId:'mm', rewards:{first:{gold: 18, dust: 5}}}), uc = R.nodeRewardTier({kind:'miniboss', dungeonId:'muc', rewards:{first:{gold: 85, dust: 34}}});
  ok(mm.dungeonPay && mm.repeat.dust === R.DAILY_DUNGEON_PAY.mm.dust && mm.repeat.gold === R.DAILY_DUNGEON_PAY.mm.gold && mm.first.dust === 5 + R.DAILY_DUNGEON_PAY.mm.dust, '4. a Murgle floor: its pay on every clear, on top of the first-clear reward');
  ok(uc.dungeonPay && uc.repeat.blossoms === R.DAILY_DUNGEON_PAY.muc.blossoms && uc.first.blossoms === uc.repeat.blossoms && uc.first.gold === 85, '4. an Undercroft floor (a mini-boss too): Blossoms on every clear');
  ok(!R.nodeRewardTier({kind:'skirmish', dungeonId:'mlb'}).dungeonPay, '4. the Long Burrow keeps the normal tier');
}
// the tables: halved in place after their definition (shown and paid alike)
function tableAfter(def, scaleLine, name){ const ctx = {Math, Number, Object, Array, TX: (k)=> k}; vm.createContext(ctx); vm.runInContext(INCOME + '\n' + def + '\n' + scaleLine + `\nthis.T = ${name};`, ctx); return ctx.T; }
{
  const qDef = between('const QUEST_RANK_REWARD = {', '}};'), qBefore = vm.runInNewContext('(' + qDef.replace('const QUEST_RANK_REWARD = ', '').replace(/;$/, '') + ')');
  const qAfter = tableAfter(qDef, "econScaleTable('notices', QUEST_RANK_REWARD);", 'QUEST_RANK_REWARD');
  ok(src.includes("econScaleTable('notices', QUEST_RANK_REWARD);"), '3. notices: the table is halved where it is defined');
  ok(qAfter.C.gold === qBefore.C.gold / 2 && qAfter.C.dust === qBefore.C.dust / 2 && qAfter.C.xp === qBefore.C.xp && qAfter.SSS.metal === Math.round(qBefore.SSS.metal / 2) && qAfter.S.gems === qBefore.S.gems / 2, '3. notices: C ' + qBefore.C.gold + '/' + qBefore.C.dust + ' -> ' + qAfter.C.gold + '/' + qAfter.C.dust + ', XP kept');
  const tDef = between('const QUEST_TIERS = {', '\n};'), line = "econScaleTable('quests', QUEST_TIERS.daily.map(t=> t.reward)); econScaleTable('quests', QUEST_TIERS.weekly.map(t=> t.reward));";
  ok(src.includes(line), '3. quest tiers: halved where they are defined');
  const tBefore = vm.runInNewContext(tDef.replace('const QUEST_TIERS = ', '(').replace(/;$/, '') + ')', {TX: k=> k}), tAfter = tableAfter(tDef, line, 'QUEST_TIERS');
  ok(tAfter.weekly[0].reward.dust === tBefore.weekly[0].reward.dust / 2 && tAfter.daily[0].reward.gold === tBefore.daily[0].reward.gold / 2 && tAfter.weekly[0].reward.metal === Math.round(tBefore.weekly[0].reward.metal / 2), '3. quest tiers: weekly 1 ' + tBefore.weekly[0].reward.dust + ' -> ' + tAfter.weekly[0].reward.dust + ' Dust');
  const trDef = between('const TRAIL_FREE = [', '];'), trB = vm.runInNewContext(trDef.replace('const TRAIL_FREE = ', '(').replace(/;$/, ')')), trA = tableAfter(trDef, "econScaleTable('trail', TRAIL_FREE);", 'TRAIL_FREE');
  ok(src.includes("econScaleTable('trail', TRAIL_FREE);") && trA[0].gold === trB[0].gold / 2 && trA[6].kibble === trB[6].kibble && trA[2].kit === trB[2].kit, '3. the Trail\'s free lane: Leaves / Dust / Metal halved, Kibble and kits not');
}
// every other source goes through econPay with its own name; first-time sources do not
const uses = {
  quickMatch: /grantCurrency\('gold', econPay\('quickMatch'/, ghostRun: /econPay\('ghostRun', 'gold', 12 \+ stage\*6\)/, gauntlet: /econPay\('gauntlet', 'gold', 15 \+ streak\*5\)/,
  onlineRaid: /econPay\('onlineRaid', 'gold', 30 \+ strength\*13\)/, 'raids (offline)': /econPay\('raids', 'gold', Math\.round\(dealt\/4\)/, 'raids (parts)': /econPay\('raids', 'gold', below \? 8/,
  'raids (claims)': /const all = econPayAll\('raids', all0\)/, coopDungeon: /econPayAll\('coopDungeon', CoopM\.floorPay/, autobattle: /econPayAll\('autobattle', AutoB\.runRewards/,
  arena: /econPay\('arena', 'gold'/, packDust: /econPay\('packDust', 'dust', MU\(pct \/ 100\)\)/, arenaDungeon: /econPayAll\('arenaDungeon'/, errands: /econScale\('errands', 'dust'/,
  'boss Metal on a repeat': /metalAmt = m\.conquestFirstClearNow \? metalFull : econPay\('conquestRepeat', 'metal'/, 'Long Burrow every clear': /econScale\('dungeonEvery', 'gems', 20 \+ floor\)/,
};
Object.entries(uses).forEach(([k, re])=> ok(re.test(src), `3. ${k}: halved at the source`));
ok(/Object\.keys\(def\.reward\)\.forEach\(kind=> grantCurrency\(kind, def\.reward\[kind\]\)\)/.test(fnSrc('claimAchievement')), '3. achievements (first-time) pay in full');
ok(/Object\.entries\(BIRTHDAY_GIFT\)\.forEach\(\(\[k, v\]\)=> grantCurrency\(k, v\)\)/.test(src) && /RES4_LEVEL_LEAVES\)\.forEach\(\(\[c, v\]\)=> grantCurrency\(c, v\)\)/.test(src), '3. the birthday gift and the level track pay in full');
ok(/const base = isFirstClear \? rewardTier\.first : rewardTier\.repeat;/.test(src) && /bm = isFirstClear \|\| rewardTier\.dungeonPay \? 0/.test(src), '3. a first clear pays rewardTier.first (unchanged); no rank bonus on a dungeon pay');
ok(/return \(firstClear \? 10 : 0\) \+/.test(fnSrc('dungeonGoldLeavesFor')), '3. a dungeon floor\'s first-clear Gold Leaves (10) are unchanged');

// ---------- 4. the daily dungeons' week ----------
{
  const W = vm.runInNewContext('(' + between('const DAILY_DUNGEON_WEEK = ', ';').replace('const DAILY_DUNGEON_WEEK = ', '').replace(/;$/, '') + ')');
  const P = vm.runInNewContext('(' + between('const DAILY_DUNGEON_PAY = ', ';').replace('const DAILY_DUNGEON_PAY = ', '').replace(/;$/, '') + ')');
  const cap = Number((src.match(/DUNGEON_TICKETS_CAP = (\d+)/) || [])[1]);
  ok(cap === W.keysPerDay && /s\.n = Math\.min\(dungeonKeyCap\(\) \+ 1, s\.n \+ 1\)/.test(src), '4. the assumption is the game\'s: ' + cap + ' keys a day, +1 on Monday');
  const keys = W.keysPerDay * 7 + W.mondayKeys, each = keys / W.dungeons;
  ok(keys === 22 && each === 11, '4. 22 keys a week, 11 won floors in each dungeon');
  ok(/\{mapId:'mm', mapNumber:6\},\s*\n\s*\{mapId:'muc', mapNumber:11/.test(src), '4. Murgle Mayhem and the Undercroft are the first two daily dungeons');
  // a Common card's road from Level 0 to 10, from the canonical table
  let dust = Math.round(UC.materiaUnit.dust / UC.moteDivisor), gold = Math.round(UC.materiaUnit.gold / UC.moteDivisor);
  for(let L = 1; L <= 9; L++){ dust += Math.round(UC.forgeStepDust[L] * UC.levelCostMult.common); gold += Math.round(UC.forgeStepDust[L] * 2 / 3 * UC.levelCostMult.common); }
  const wd = each * P.mm.dust, wg = each * P.mm.gold;
  ok(dust === 759 && gold === 504, '4. a Common Level 0 -> 10: ' + dust + ' Dust, ' + gold + ' Leaves');
  ok(wd >= dust && wd - dust < P.mm.dust && wg >= gold && wg - gold < P.mm.gold, `4. a week of Murgle: ${wd} Dust, ${wg} Leaves (enough, and one floor less is not)`);
  // a Common bramble's Levels 0 -> 10 in Blossoms
  const c = castleCtx(); let bl = 0; for(let L = 0; L < 10; L++) bl += c.F.castleLevelUpCost(L, 'castle').blossoms;
  const wb = each * P.muc.blossoms;
  ok(wb >= bl && wb - bl < P.muc.blossoms, `4. a week of the Undercroft: ${wb} Blossoms, a Common bramble Level 0 -> 10 (${bl})`);
  ok(!P.mm.blossoms && !P.muc.dust && !P.muc.gold, '4. one dungeon pays normal resources, the other the bramble resource');
}

// ---------- 5. texts, packs, cloud, SQL ----------
const KEYS = ['ui.econ1-blossoms', 'ui.econ1-blossoms-tip', 'ui.econ1-rf-note', 'ui.econ1-dungeon-every', 'results.econ1-blossoms-win', 'results.econ1-blossoms-loss'];
KEYS.forEach(k=> ok(TEXT[k] && src.includes(`'${k}'`), `5. ${k} is a TX key the game reads`));
['fr', 'de', 'es', 'it', 'pt', 'tl', 'ta', 'id', 'zh-Hans', 'zh-Hant', 'ja', 'ko'].forEach(code=>{ const p = JSON.parse(fs.readFileSync(path.join(ROOT, 'lang', code + '.json'), 'utf8'));
  ok(KEYS.every(k=> p[TEXT[k]]), `5. ${code}: every ECON1 text translated`); });
ok(/if\(cloudBlossomsColumn !== false\) row\.blossoms = /.test(fnSrc('cloudPushCurrencies')) && /cloudBlossomsColumn = false; delete row\.blossoms/.test(fnSrc('cloudPushCurrencies')), '5. the push sends blossoms, and drops the column once when the server has none');
ok(/blossoms: cur\.blossoms != null \? /.test(fnSrc('cloudPullState')), '5. the pull reads blossoms, or keeps this browser\'s');
ok(/blossoms: Math\.max\(0, Math\.floor\(Number\(parsed\.blossoms\)\|\|0\)\)/.test(fnSrc('loadCurrencies')), '5. saved locally with the other currencies');
const sql = fs.readFileSync(path.join(ROOT, 'supabase', 'proposed', '20261030_bramble_resource.sql'), 'utf8');
ok(/add column if not exists blossoms integer not null default 0/.test(sql) && /PROPOSED, NOT APPLIED/.test(sql), '5. the proposed SQL adds the column (not applied)');
ok(!fs.existsSync(path.join(ROOT, 'supabase', 'migrations', '20261030_bramble_resource.sql')), '5. nothing in migrations/');

console.log(`econ1-2026-10-30: ${n - fail}/${n} passed`);
process.exit(fail ? 1 : 0);
