#!/usr/bin/env node
// 2026-10-23 (package EB, owner 01:57 notes 1, 8 and 9): static and evaluated checks that
//   1. the real deck after T-2 drops the baby filler and is topped up with the sturdier cards (STARTER_CFG_DEFAULT.starterTopUp), one copy each,
//      20 with T-2's rewards; a saved config holding PG's old top-up gets the new one;
//   2. the enemy's bramble is plain in T-1, T-2 and on Map 0 (0-4 keeps its +1 Attack bramble), and yours starts higher than the enemy's
//      Health + Shield (EARLY_BRAMBLE_LEAD) in the tutorial and on Maps 0-1, in the game and in the tools (referenceFightSetup);
//   3. the early road's enemy level: Map 0 every copy at Level 0 (below a card's own level), Map 1 rising to half Level 1;
//   4. Map 1 is retuned: the saved before / after run (docs/balance/eb-2026-10-23.json) has every early fight inside its road-curve band;
//   5. field-kit items drop at 2% per ⚡ the fight used, at most 3 a day (was: the day's first 3 Conquest wins, sure);
//   6. an Energy capsule gives 8 Energy and is a first-clear reward token on 10 skirmishes (one on Map 1); item tokens no longer stand in for
//      a fight's card reward or shut off its card drop;
//   7. the new texts are TX keys, translated in the 12 packs.
'use strict';
const fs = require('fs'), path = require('path'), vm = require('vm');
const ROOT = path.join(__dirname, '..');
const src = fs.readFileSync(path.join(ROOT, 'arena_app.js'), 'utf8');
const {TEXT} = require(path.join(ROOT, 'bramblewood-texts.js'));
let fail = 0, checks = 0; const ok = (c, m)=>{ checks++; if(!c){ fail++; console.log('  ✗', m); } };
function fnSrc(name){
  const a = src.indexOf('\nfunction ' + name + '('); if(a < 0) return '';
  let i = src.indexOf('{', a), depth = 0;
  for(; i < src.length; i++){ const ch = src[i]; if(ch === '{') depth++; else if(ch === '}'){ depth--; if(!depth) break; } }
  return src.slice(a + 1, i + 1);
}
const between = (s, a, b)=>{ const i = s.indexOf(a); return i < 0 ? '' : s.slice(i, s.indexOf(b, i) + b.length); };
const B = require(path.join(ROOT, 'tools', 'lib_bramble.js')), G = B.G, D = B.CARD_DEFS_BASELINE;
const byMap = id=> G.CONQUEST_MAPS.find(m=> m.id === id), node = (mid, k)=> byMap(mid).nodes.find(n=> n.key === k);

// --- 1. the real deck after T-2
{ const cfgSrc = between(src, 'const STARTER_CFG_DEFAULT = {', '\n};');
  const SD = vm.runInNewContext('(' + cfgSrc.replace('const STARTER_CFG_DEFAULT = ', '').replace(/;$/, '') + ')');
  const PG = vm.runInNewContext(between(src, 'const PG_STARTER_TOP_UP = [', '];') + '; PG_STARTER_TOP_UP');
  const mk = (cfg, rewards2)=> new Function('getCardDefs', 'tutorialCfg', 'STARTER_CFG_DEFAULT', 'STARTER_SHOWN', 'DECK_SIZE', 'tutorialRewardIds', 'tutorialRewards2',
    ['const PG_STARTER_TOP_UP = ' + JSON.stringify(PG) + ';', fnSrc('starterTopUpList'), fnSrc('starterDeckTarget'), fnSrc('starterDeckParts'), 'return starterDeckParts;'].join('\n'))(()=> D, cfg, SD, 8, 20, ()=> [], ()=> rewards2);
  // the live __cfg:tutorial lists of 2026-10-22 (no starterTopUp of their own, the baby filler listed)
  const LIVE = Object.assign({}, SD, {starterShared:{'pond-trout':3,'meadow-frog':2,'crossed-eyes':1,'duck-paddler':2}, starterOtters:{'otter-kit':2,'fleetfootd':1,'otter-centurion':2},
    starterHummingbirds:{'mosswing-laborer':1,'crimson-wing-recruit':2,'cobalt-talon-fledgling':2}, starterBoth:{'dormouse':1,'otter-kit':2,'otter-paddler':2}, starterFiller:{'honey-bee':3,'silver-minnow':3,'sparrow-chick':3}});
  delete LIVE.starterTopUp;
  for(const [label, cfg] of [['default config', SD], ['live config', LIVE], ['a saved config with PG\'s top-up', Object.assign({}, LIVE, {starterTopUp: PG.slice()})]]){
    for(const pick of ['otters', 'hummingbirds', 'both']){
      const p = mk(cfg, ['x', 'y'])(pick), ids = Object.keys(p.all);
      ok(ids.length === 18 && Object.values(p.all).every(k=> k === 1), `1. ${label}, ${pick}: 18 different cards, one copy each (+ T-2's two = 20): ${ids.length}`);
      ok(!ids.includes('sparrow-chick'), `1. ${label}, ${pick}: the baby filler is not in the real deck`);
      ok(['river-carp', 'burrow-rabbit', 'farm-dog', 'chipmunk-forager'].every(id=> p.all[id]), `1. ${label}, ${pick}: the sturdier cards are in it (${ids.join(', ')})`);
    }
  }
  ok(SD.starterTopUp[0] === 'river-carp' && !SD.starterTopUp.slice(0, 7).some(id=> (D[id].attack || 0) + (D[id].health || 0) < 8), '1. the top-up starts with the sturdier cards');
  const firstPack = src.slice(src.indexOf('const SKIRMISH_FIRST_PACK_CARDS = {'), src.indexOf('/* GD5-TABLE-END */'));
  SD.starterTopUp.slice(0, 7).forEach(id=> ok(!firstPack.includes(`'${id}'`) && !(D[id].source && D[id].source.kind === 'map'), `1. ${id} is no skirmish's first-clear card`));
}

// --- 2. brambles
{ ['0-1', '0-2', '0-3'].forEach(k=>{ const sc = G.skirmishCastle(node('m1', k)); ok(!Object.keys(sc.character.effects || {}).length, `2. ${k} defends a plain bramble (${sc.character.id})`); });
  const sc4 = G.skirmishCastle(node('m1', '0-4')); ok(sc4.character.id === 'plains-terrace' && sc4.character.effects.firstUnitAtkBonus === 1, '2. 0-4 keeps the +1 Attack to the first unit');
  ok(/const watch = false;/.test(fnSrc('startTutorialMatch')), '2. T-2\'s rival bramble is plain (no Outskirts Watchtower)');
  ok(/myCharacter\.health = earlyBrambleHp\(myCharacter\.health, rivalCharacter\.health\)/.test(fnSrc('startTutorialMatch')), '2. your tutorial bramble starts above the rival\'s');
  ok(/const myCharacter = earlyHomeBramble\(node, myCastleDef\(\)\)/.test(fnSrc('startConquestMatch')), '2. a Conquest fight on Maps 0-1 gives your bramble the lead');
  ok(G.EARLY_BRAMBLE_LEAD === 3 && G.earlyBrambleHp(4, 5) === 8 && G.earlyBrambleHp(15, 6) === 15, '2. earlyBrambleHp = max(yours, enemy total + 3)');
  for(const [mid, k] of [['m1', '0-1'], ['m1', '0-4'], ['mf', '1-1'], ['mf', '1-5']]){ const ctx = G.referenceFightSetup(mid, node(mid, k), {});
    ok(ctx.myCastle.health > ctx.sc.hp + ctx.sc.shield, `2. ${k}: your bramble ${ctx.myCastle.health} > the enemy's ${ctx.sc.hp}+${ctx.sc.shield}`); }
  const c2 = G.referenceFightSetup('mb', node('mb', '2-5'), {}); ok(c2.myCastle.health === 15, '2. no lead from Map 2 on (' + c2.myCastle.health + ')');
}

// --- 3. the enemy's level
{ ok(G.roadEnemyLevelExact(node('m1', '0-3')) === 0 && G.roadEnemyLevelExact(node('mf', '1-1')) === 0 && G.roadEnemyLevelExact(node('mf', '1-5')) === 0.5, '3. Map 0 Level 0; Map 1 from 0 to 0.5');
  ok(G.roadEnemyLevelExact(node('mb', '2-1')) === 1, '3. Map 2 is Level 1 as before');
  const d0 = G.levelledEnemyDeck(node('m1', '0-3'), node('m1', '0-3').deck), sk = G.overlay()['chipmunk-skirmisher@lv0'];
  ok(d0['chipmunk-skirmisher@lv0'] === 3 && sk && sk.health === G.statsAtLevel(D['chipmunk-skirmisher'], 0).health && sk.health < D['chipmunk-skirmisher'].health, '3. a Map 0 enemy card fights at its Level 0 stats, below its own level');
  const n15 = node('mf', '1-5'), d15 = G.levelledEnemyDeck(n15, n15.deck), lv = {0: 0, 1: 0}; Object.entries(d15).forEach(([id, k])=>{ const m = /@lv(\d+)$/.exec(id); if(m) lv[m[1]] = (lv[m[1]] || 0) + k; });
  ok(lv[0] > 0 && lv[1] > 0, '3. the Baron\'s copies are part Level 0, part Level 1: ' + JSON.stringify(lv));
  const ov = Object.assign({}, node('mf', '1-1'), {enemyLevel: 2}); G.NODE_MAP_HINT.set(ov, 'mf'); ok(G.roadEnemyLevelExact(ov) === 2, '3. the skirmish editor\'s Enemy level still wins');
}

// --- 4. the measured early road
{ const f = path.join(ROOT, 'docs', 'balance', 'eb-2026-10-23.json'); const J = fs.existsSync(f) ? JSON.parse(fs.readFileSync(f, 'utf8')) : null;
  ok(J && J.before && J.after, '4. docs/balance/eb-2026-10-23.json holds the before and after runs');
  if(J){ const row = (run, code)=> run.fights.find(x=> x.code === code);
    ['1-1', '1-2', '1-3', '1-4', '1-5'].forEach(code=>{ const a = row(J.after, code), b = row(J.before, code), t = G.roadCurveTarget('mf', node('mf', code));
      ok(b && b.mean < 15, `4. ${code} was under 15% before (${b && b.mean})`);
      ok(a && a.mean / 100 >= t.lo - 1e-9 && a.mean / 100 <= t.hi + 1e-9, `4. ${code} is inside its band ${Math.round(t.lo * 100)}-${Math.round(t.hi * 100)} (${a && a.mean})`); });
    ['0-1', '0-2', '0-3', '0-4'].forEach(code=>{ const a = row(J.after, code), t = G.roadCurveTarget('m1', node('m1', code)); ok(a && a.mean / 100 >= t.lo - 1e-9 && a.mean / 100 <= t.hi + 1e-9, `4. ${code} is inside its band (${a && a.mean})`); });
    ok(row(J.after, 'T-1').win >= 75 && row(J.after, 'T-2').win >= 70, '4. the tutorial fights stay easy'); }
  const mf = byMap('mf'); ok(mf.nodes.slice(0, 4).every(n=> n.characterId === 'castle'), '4. Map 1\'s skirmishes defend a plain bramble');
  const pools = JSON.parse(fs.readFileSync(path.join(ROOT, 'canonical', 'map-pools.json'), 'utf8')).maps;
  mf.nodes.forEach(n=> Object.keys(n.deck).forEach(id=> ok(pools.mf.cards.includes(id) || pools.mf.special.includes(id), `4. ${n.key}'s ${id} is in Map 1's pool`)));
  ok(mf.nodes.every(n=> Object.values(n.deck).reduce((a, b)=> a + b, 0) === 20), '4. Map 1\'s decks hold 20 cards');
  ok(node('mf', '1-1').deck['cricket-drummer'] > 0 && node('mf', '1-5').deck['badger-lumberjack'] > 0, '4. the reward cards are still in their fights\' decks');
}

// --- 5. items
{ const ctx = {featureUnlockedSafe: ()=> true, ITEM_DEFS: {draught:{}, kindling:{}}, ITEM_CAP: 9, itemDay: ()=> 'd1', Math, Number};
  let save = {counts: {}}; ctx.loadItems = ()=> JSON.parse(JSON.stringify(save)); ctx.saveItems = o=>{ save = o; };
  const f = new Function(...Object.keys(ctx), [between(src, 'const SKIRMISH_KIT_PER_DAY = 3', ';'), between(src, 'const SKIRMISH_KIT_WEIGHT = {', '};'), fnSrc('kitDropChance'), fnSrc('skirmishKitLeftToday'), fnSrc('grantSkirmishKitItem'), 'return {kitDropChance, skirmishKitLeftToday, grantSkirmishKitItem};'].join('\n'))(...Object.values(ctx));
  ok(f.kitDropChance(1) === 0.02 && f.kitDropChance(5) === 0.1 && f.kitDropChance(0) === 0, '5. 2% per ⚡ (1⚡ 2%, 5⚡ 10%, a free fight 0)');
  ok(f.grantSkirmishKitItem(5, ()=> 0.11) === null && f.skirmishKitLeftToday() === 3, '5. a roll over the chance gives nothing and uses no slot');
  ok(f.grantSkirmishKitItem(0, ()=> 0) === null, '5. a fight that used no Energy rolls nothing');
  const got = [1, 2, 3, 4].map(()=> f.grantSkirmishKitItem(5, ()=> 0.05));
  ok(got.slice(0, 3).every(Boolean) && got[3] === null && f.skirmishKitLeftToday() === 0, '5. at most 3 items a day: ' + JSON.stringify(got.map(x=> x && x.nth)));
  ok(/grantSkirmishKitItem\(m\.energyPaid\)/.test(src) && /energyPaid = cost;/.test(fnSrc('startConquestMatch')) && /energyPaid, \/\/ 2026-10-23/.test(fnSrc('startConquestMatch')), '5. the win rolls with the Energy the fight used');
}

// --- 6. Energy capsules
{ ok(/ENERGY_CAPSULE_AMOUNT = 8,/.test(src), '6. a capsule gives 8 Energy');
  const caps = []; G.CONQUEST_MAPS.forEach(m=> m.nodes.forEach(n=>{ if((n.rewardTokens || []).includes('energyCapsule')) caps.push(m.id + ':' + n.key); }));
  ok(JSON.stringify(caps) === JSON.stringify(['mf:1-3', 'mb:2-1', 'm2:4-2', 'm8:6-3', 'mk:9-3', 'mh:12-3', 'ml:15-3', 'md:18-3', 'm21:21-3', 'm24:24-3'].filter(x=> caps.includes(x))) && caps.length === 10, '6. ten first-clear capsules: ' + caps.join(', '));
  ok(caps.some(x=> x.startsWith('mf:')), '6. one on Map 1');
  ok(!/MAP2_CAPSULE_KEY\) !== '1'\)\{ localStorage\.setItem\(MAP2_CAPSULE_KEY/.test(src), '6. the old "first win on Map 2" capsule is 2-1\'s token now');
  const RT = between(src, 'const REWARD_TOKENS = {', '};'); ok(/energyCapsule:\{icon:'🔋', label:'Energy capsule', item:true/.test(RT) && /raidTicket:\{icon:'🎫', label:'Raid Ticket', item:true/.test(RT), '6. the capsule and the Raid Ticket are item tokens');
  ok(/if\(cardRewardTokens\(node\)\.length\) return false;/.test(fnSrc('skirmishDropApplies')) && /isFirstClear && cardRewardTokens\(node\)\.length/.test(fnSrc('rollConquestPackDrops')), '6. an item token neither replaces the card reward nor shuts off the drop');
  ok(/grantItemRewardTokens\(bn\)/.test(src) && /conquestItemTokens/.test(fnSrc('rewardsPanelHTML') || src), '6. the win pays the item tokens and the results show them');
}

// --- 7. texts
{ const keys = ['ui.eb-kit-src', 'ui.eb-kit-left', 'ui.eb-kit-done', 'ui.eb-kit-more', 'results.eb-capsule', 'results.eb-capsule-tip', 'results.eb-ticket-tip'];
  keys.forEach(k=> ok(TEXT[k], '7. TX key ' + k));
  for(const code of ['fr', 'de', 'es', 'it', 'pt', 'tl', 'ta', 'id', 'zh-Hans', 'zh-Hant', 'ja', 'ko']){ const pack = JSON.parse(fs.readFileSync(path.join(ROOT, 'lang', code + '.json'), 'utf8'));
    keys.forEach(k=> ok(pack[TEXT[k]], `7. ${code} translates "${TEXT[k]}"`)); }
}
console.log(fail ? `eb-2026-10-23: ${fail} of ${checks} checks FAILED` : `eb-2026-10-23: all ${checks} checks pass`);
process.exit(fail ? 1 : 0);
