#!/usr/bin/env node
// 2026-10-18 (package DK, owner 23:54: "Playing a dungeon right now doesn't consume my key. It should. I can't sweep past the number of
// keys I have. Forge lets you increase the number of keys to 5 (but requires Strange Materia)." + 00:08: "The forge upgrades on your
// profile (and nest etc., tavern upgrades) should be on another tab in each of their own respective pages."):
//   1. a daily dungeon fight uses a key when it starts and a win no longer hands it back; 0 keys blocks the fight (and says why)
//   2. each Sweep run uses a key too, checked before the Energy; the Sweep menu's count stops at the keys held; 0 keys: no runs
//   3. the key cap is 3, raised to 4 and 5 by the Forge's 🗝️ Key ring (Strange Materia + Maple Leaves + Magic Dust), saved and synced
//   4. a new day fills the keys up to the cap (never above it, never taking any away); the Monday bonus may sit one over
//   5. the Forge, the Nest and the Tavern keep their upgrades in a ⬆️ Upgrades tab; the Profile has one summary row per place
//   6. TX keys for every new text, in all 12 packs; the 10-16 "a win gives your key back" texts are gone
'use strict';
const fs = require('fs'), path = require('path'), vm = require('vm');
const ROOT = path.join(__dirname, '..');
const src = fs.readFileSync(path.join(ROOT, 'arena_app.js'), 'utf8');
const tpl = fs.readFileSync(path.join(ROOT, 'arena_template.html'), 'utf8');
const {TEXT, TX} = require(path.join(ROOT, 'bramblewood-texts.js'));
const {createTranslator} = require(path.join(ROOT, 'bramblewood-i18n.js'));
let fail = 0, n = 0; const ok = (c, m)=>{ n++; if(!c){ fail++; console.log('  ✗', m); } };
const fnSrc = name=>{ const i = src.indexOf(`\nfunction ${name}(`); if(i < 0) return '';
  let d = 0, j = src.indexOf('{', src.indexOf(')', i)); for(let k = j; k < src.length; k++){ const ch = src[k]; if(ch === '{') d++; else if(ch === '}'){ d--; if(!d) return src.slice(i, k + 1); } } return ''; };
const lineOf = start=>{ const i = src.indexOf(start); if(i < 0) return ''; return src.slice(i, src.indexOf('\n', i)); };
const between = (a, b)=>{ const i = src.indexOf(a), j = src.indexOf(b, i); return i >= 0 && j > i ? src.slice(i, j) : ''; };
const esc = s=> String(s);
const fakeStorage = ()=>{ const m = new Map(); return {getItem: k=> m.has(k) ? m.get(k) : null, setItem: (k, v)=> m.set(k, String(v)), removeItem: k=> m.delete(k), _m: m}; };

// ---- the key core, run for real (localStorage stubbed)
const keyFns = ['dungeonDayIndex', 'dungeonWeekIndex', 'saveDungeonTickets', 'loadDungeonTickets', 'dungeonTicketsLeft', 'dungeonGateOk', 'dungeonStakeKey', 'dungeonFloorWon', 'dungeonNoKeysText', 'dungeonNextTicketMs'];
keyFns.forEach(f=> ok(fnSrc(f), `arena_app.js has ${f}`));
const capBlock = between('const DUNGEON_TICKETS_KEY', '// The Forge\'s 🗝️ Key ring row');
ok(/DUNGEON_TICKETS_CAP = 3;/.test(capBlock) && /DUNGEON_KEY_CAP_MAX = 5;/.test(capBlock), '3. the cap is 3, up to 5');
function makeKeys(extra){
  const spent = [];
  const ctx = Object.assign({localStorage: fakeStorage(), Date, Math, JSON, String, parseInt, Object, TX, PROGRESS_KEYS: [], PROGRESS_MERGE_KEYS: {},
    myCurrencies: {gold: 5000, dust: 3000}, adminModeEnabled: false, strange: 2, saveCurrencies: ()=>{}, logTxn: ()=>{}, livePushProgress: ()=>{},
    dungeonBestFloor: ()=> 2, spent}, extra || {});
  ctx.ownedCount = id=> id === 'strange-materia' ? ctx.strange : 0;
  ctx.spendCopies = (id, k)=>{ spent.push([id, k]); if(id === 'strange-materia') ctx.strange -= k; };
  vm.createContext(ctx);
  vm.runInContext(capBlock + '\n' + keyFns.map(fnSrc).join('\n') + '\nthis.K = {' + keyFns.join(',') + ', dungeonKeyCap, dungeonKeyCapNext, canRaiseDungeonKeyCap, raiseDungeonKeyCap, DUNGEON_TICKETS_KEY, DUNGEON_KEY_CAP_KEY, DUNGEON_KEY_CAP_STEPS};', ctx);
  return ctx;
}
{ const ctx = makeKeys(), K = ctx.K, LS = ctx.localStorage;
  const s0 = K.loadDungeonTickets();
  ok(s0.n === 3 && K.dungeonKeyCap() === 3, `1. a new save starts with a full ring of 3 keys (${s0.n})`);
  ok(K.dungeonStakeKey('mm') === true && K.dungeonTicketsLeft() === 2, '1. a fight uses a key when it starts');
  K.dungeonFloorWon('mm', 3, true);
  ok(K.dungeonTicketsLeft() === 2, '1. a won floor gives no key back (the old third argument is ignored)');
  ok(K.loadDungeonTickets().best.mm === 3, '1. a won floor still moves the best floor up');
  K.dungeonStakeKey('mm'); K.dungeonStakeKey('mm');
  ok(K.dungeonTicketsLeft() === 0 && !K.dungeonGateOk('mm'), '1. 0 keys: the gate is shut');
  ok(K.dungeonStakeKey('mm') === false && K.dungeonTicketsLeft() === 0, '1. 0 keys: nothing is taken, the count never goes below 0');
  ok(/^No keys left\. They fill up to 3 in \d+h\.$/.test(K.dungeonNoKeysText()) /* 2026-10-30 (UI6, X19): "Dungeon key" is now "key" (the Dailies share one set) */, `1. the reason names the cap and the hours (${K.dungeonNoKeysText()})`);
  // 4. regeneration fills up to the cap
  const set = patch=>{ const s = JSON.parse(LS.getItem(K.DUNGEON_TICKETS_KEY)); Object.assign(s, patch); LS.setItem(K.DUNGEON_TICKETS_KEY, JSON.stringify(s)); };
  const today = K.dungeonDayIndex(), wk = K.dungeonWeekIndex();
  set({n: 0, day: today - 1}); ok(K.dungeonTicketsLeft() === 3, '4. a new day fills 0 keys up to the cap (3)');
  set({n: 1, day: today - 5}); ok(K.dungeonTicketsLeft() === 3, '4. days away still stop at the cap');
  set({n: 4, day: today - 1}); ok(K.dungeonTicketsLeft() === 4, '4. keys over the cap (the Monday bonus) are kept');
  set({n: 3, day: today, week: wk - 1}); ok(K.dungeonTicketsLeft() === 4, '4. the Monday bonus may sit one over the cap');
  set({n: 4, day: today, week: wk - 1}); ok(K.dungeonTicketsLeft() === 4, '4. the bonus never goes past cap + 1');
  set({n: 2, day: today}); ok(K.dungeonTicketsLeft() === 2, '4. no refill on the same day');
  // 3. the Key ring
  ok(K.DUNGEON_KEY_CAP_STEPS.length === 2 && K.DUNGEON_KEY_CAP_STEPS.every(x=> x.strange >= 1 && x.cost.gold > 0 && x.cost.dust > 0), '3. two steps, each costing Strange Materia, Maple Leaves and Magic Dust');
  ok(ctx.PROGRESS_KEYS.includes(K.DUNGEON_KEY_CAP_KEY), '3. the cap is in the synced progress blob');
  ok(ctx.PROGRESS_MERGE_KEYS[K.DUNGEON_KEY_CAP_KEY]('4', '5') === '5' && ctx.PROGRESS_MERGE_KEYS[K.DUNGEON_KEY_CAP_KEY]('5', '3') === '5', '3. on a pull the larger cap wins');
  const g0 = ctx.myCurrencies.gold, d0 = ctx.myCurrencies.dust, step1 = K.DUNGEON_KEY_CAP_STEPS[0];
  const r1 = K.raiseDungeonKeyCap();
  ok(r1 && r1.cap === 4 && K.dungeonKeyCap() === 4, '3. the first step raises the cap to 4');
  ok(ctx.myCurrencies.gold === g0 - step1.cost.gold && ctx.myCurrencies.dust === d0 - step1.cost.dust && ctx.spent.some(([id, k])=> id === 'strange-materia' && k === step1.strange), '3. it costs its Leaves, Dust and Strange Materia');
  set({n: 0, day: today - 1}); ok(K.dungeonTicketsLeft() === 4, '4. regeneration fills up to the new cap (4)');
  ok(K.raiseDungeonKeyCap().cap === 5 && K.dungeonKeyCap() === 5, '3. the second step raises it to 5');
  ok(K.raiseDungeonKeyCap() === false && K.canRaiseDungeonKeyCap().why === 'max' && !K.dungeonKeyCapNext(), '3. 5 is the most');
  set({n: 1, day: today - 1}); ok(K.dungeonTicketsLeft() === 5, '4. and refills to 5');
  LS.setItem(K.DUNGEON_KEY_CAP_KEY, '9'); ok(K.dungeonKeyCap() === 5, '3. a stored cap above 5 reads as 5');
  LS.setItem(K.DUNGEON_KEY_CAP_KEY, '1'); ok(K.dungeonKeyCap() === 3, '3. below 3 reads as 3'); }
{ const ctx = makeKeys({strange: 0}), K = ctx.K;
  ok(K.canRaiseDungeonKeyCap().why === 'strange' && K.raiseDungeonKeyCap() === false && K.dungeonKeyCap() === 3, '3. no Strange Materia: no step');
  ctx.strange = 1; ctx.myCurrencies.gold = 10; ok(K.canRaiseDungeonKeyCap().why === 'cost', '3. not enough Leaves: no step');
  ctx.adminModeEnabled = true; ctx.strange = 0; ctx.myCurrencies.gold = 9999; ok(K.canRaiseDungeonKeyCap().ok, '3. Admin Mode skips the Strange Materia, like the Forge tiers'); }

// ---- 1. the fight start and its end
const start = fnSrc('startConquestMatch');
ok(/if\(dungeonEntry && !dungeonGateOk\(mapId\)\)\{[^\n]*showToast\('🗝️ ' \+ dungeonNoKeysText\(\), 'warn'\); return false; \}/.test(start), '1. no key: the fight does not start, and the toast says why');
ok(start.indexOf('dungeonGateOk(mapId)') < start.indexOf('spendEnergy(cost)'), '1. the key check comes before the Energy is taken');
ok(/const dungeonKeyStaked = dungeonEntry && dungeonStakeKey\(mapId\);/.test(start) && /TX\('toast\.dungeon-key-used', \{n: dungeonTicketsLeft\(\)\}\)/.test(start), '1. the start uses the key and says how many are left');
ok(/const dungeonEntry = !\(opts && opts\.skipEnergyCost\) && isDailyDungeonMap/.test(start), '1. only the admin test / jump tools (skipEnergyCost) skip the key');
ok(/dungeonFloorWon\(dunMap\.id, dunNode\.floor\); m\.dungeonOutcome = \{won:true, floor: dunNode\.floor\}/.test(src) && !/keyBack/.test(src), '1. a won floor gives no key back');
ok(/TX\('results\.dungeon-climb-resets'/.test(src) && !/results\.dungeon-key-lost-climb-resets/.test(src), '1. a loss: the climb resets (the key was used at the start)');
// the node panel: "🗝️ N left" and a disabled Fight with the reason
ok(/const dgKeys = !selectedNode\.virtual && isDailyDungeonMap\(map\) \? dungeonTicketsLeft\(\) : null;/.test(src), '1. the floor panel reads the keys in hand');
ok(/id="cnpFightBtn" data-energy-cost="\$\{energyCost\}" \$\{dgKeys === 0 \? 'data-no-keys="1" ' : ''\}\$\{canAffordFight && dgKeys !== 0 \? '' : 'aria-disabled="true"'\} title="\$\{escapeAttr\(dgKeys === 0 \? dungeonNoKeysText\(\)/.test(src), '1. 0 keys: Fight is disabled and its tooltip says why');
ok(/<p class="cnp-dungeon-keys \$\{dgKeys \? '' : 'is-empty'\}"><span>\$\{escapeHtml\(TX\('ui\.dungeon-keys-left', \{n: dgKeys\}\)\)\}<\/span>/.test(src), '1. "🗝️ N left" under the Fight button');
ok(TX('ui.dungeon-keys-left', {n: 2}) === '🗝️ 2 left', '1. it reads "🗝️ 2 left"');
ok(/closest\('button\[data-no-keys\]'\)[^\n]*\n\s*e\.preventDefault\(\); e\.stopImmediatePropagation\(\); dungeonNoKeys\(b\);/.test(src), '1. a click on a no-key button says why instead of starting');
ok(/if\(short \|\| b\.dataset\.noKeys\) b\.setAttribute\('aria-disabled', 'true'\)/.test(src), '1. the Energy refresh keeps a no-key button disabled');
ok(/isDailyDungeonMap\(f\.map\) && dungeonTicketsLeft\(\) <= 0\) return `data-energy-cost="\$\{c\}" data-no-keys="1" aria-disabled="true"/.test(fnSrc('playAgainEnergyAttrs')), '1. Play again on a dungeon floor with 0 keys is disabled');
ok(/data-no-keys="1" aria-disabled="true" title="\$\{escapeAttr\(dungeonNoKeysText\(\)\)\}"/.test(fnSrc('nextBattleButtonHTML')), '1. so is the next floor button');

// ---- 2. Sweep
{ let keys = 2, energy = 100, energySpent = 0; const used = [];
  const ctx = {findConquestNode: (m, k)=> ({map: {id: m, endless: true}, node: {key: k, floor: 2}}), CONQUEST_MAPS: [], nodeEnergyCost: ()=> 4, nodeRewardTier: ()=> ({repeat: {gold: 10, dust: 2}}),
    isDailyDungeonMap: m=> !!(m && m.endless && !m.tower), dungeonTicketsLeft: ()=> keys, dungeonStakeKey: id=>{ if(keys <= 0) return false; keys--; used.push(id); return true; },
    spendEnergy: c=>{ if(energy < c) return false; energy -= c; energySpent += c; return true; }, simulateSkirmishVsDeckSeeded: ()=> ({win: true, castleLeft: 1}),
    RANK_MULT: {S: 1}, myDeckCounts: {}, myCastleDef: ()=> ({}), bumpQuestCounter: ()=>{}, grantCurrency: ()=>{}, refreshTopbarDungeonKey: ()=>{}, currentTab: 'play', Math};
  vm.createContext(ctx); vm.runInContext(fnSrc('runSweep') + '\nthis.runSweep = runSweep;', ctx);
  const r = ctx.runSweep('mm', 'f2', 5);
  ok(r.played === 2 && r.keys === 2 && keys === 0 && used.length === 2, `2. a sweep of 5 with 2 keys runs 2, using both keys (${JSON.stringify(r)})`);
  ok(energySpent === 8, '2. no Energy is taken for a run with no key');
  const r0 = ctx.runSweep('mm', 'f2', 3); ok(r0.played === 0 && r0.keys === 0 && energySpent === 8, '2. 0 keys: no runs, nothing spent');
  keys = 5; energy = 4; const re = ctx.runSweep('mm', 'f2', 3); ok(re.played === 1 && re.keys === 1 && keys === 4, '2. out of Energy first: only the runs played use a key');
  ctx.findConquestNode = (m, k)=> ({map: {id: m}, node: {key: k}}); keys = 0; energy = 100;
  const rc = ctx.runSweep('m3', 'a', 3); ok(rc.played === 3 && rc.keys === 0, '2. a Conquest sweep uses no keys'); }
{ const menu = fnSrc('openSweepMenu');
  ok(/const dgKeys = isDailyDungeonMap\(map\) \? dungeonTicketsLeft\(\) : null;/.test(menu) && /Math\.min\(20, Math\.floor\(currentEnergy\(\) \/ energyCost\), dgKeys != null \? dgKeys : Infinity\)/.test(menu), '2. the count picker stops at the keys held');
  ok(/dgKeys === 0 \? `<span class="panel-sub sm-nokeys">🗝️ \$\{escapeHtml\(dungeonNoKeysText\(\)\)\}<\/span>`/.test(menu), '2. 0 keys: no counts, and the reason');
  ok(/TX\('ui\.sweep-key-a-run', \{n: dgKeys\}\)/.test(menu), '2. the menu foot says a key a run and how many are left');
  // the count options, worked out as the menu does
  const most = (energy, cost, keys)=> Math.max(0, Math.min(20, Math.floor(energy / cost), keys != null ? keys : Infinity));
  const opts = m=> [...new Set([1, 3, 5, 10, m].filter(x=> x >= 1 && x <= m))].sort((a, b)=> a - b);
  ok(JSON.stringify(opts(most(200, 4, 2))) === '[1,2]' && JSON.stringify(opts(most(200, 4, 0))) === '[]' && most(8, 4, 5) === 2, '2. e.g. 2 keys: 1× or All 2; 0 keys: none; Energy can still be the limit'); }
{ let keys = 0; const ctx = {TX, escapeAttr: esc, escapeHtml: esc, isPremiumPlayer: ()=> true, isDailyDungeonMap: m=> !!(m && m.endless && !m.tower), dungeonBestFloor: ()=> 3,
    nodeEnergyCost: ()=> 6, dungeonTicketsLeft: ()=> keys, dungeonKeyCap: ()=> 3, dungeonNextTicketMs: ()=> 5 * 3600000, Math};
  vm.createContext(ctx); vm.runInContext(['dungeonSweepNode', 'dungeonSweepBtnHTML', 'dungeonNoKeysText'].map(fnSrc).join('\n') + '\nthis.B = dungeonSweepBtnHTML;', ctx);
  const map = {id: 'mm', endless: true, nodes: [1, 2, 3, 4].map(f=> ({key: 'f' + f, floor: f}))};
  const b0 = ctx.B(map); ok(/data-nokeys="1" aria-disabled="true" title="No keys left\. They fill up to 3 in 5h\."/.test(b0) /* 2026-10-30 (UI6, X19): "Dungeon key" is now "key" (the Dailies share one set) */, '2. the Dungeons tab Sweep at 0 keys: disabled with the reason');
  keys = 2; const b2 = ctx.B(map); ok(!/data-nokeys/.test(b2) && /and a key/.test(b2) /* 2026-10-30 (UI6, X19): "Dungeon key" is now "key" (the Dailies share one set) */, '2. with keys: open, and its tooltip says a run costs a key'); }
ok(/if\(b\.dataset\.nokeys \|\| dungeonTicketsLeft\(\) <= 0\) return dungeonNoKeys\(b\);/.test(src), '2. a click on it with 0 keys says why');

// ---- 3. the Forge row
{ let cap = 3, open = true, can = {ok: false, why: 'strange', next: {cap: 4, cost: {gold: 800, dust: 400}, strange: 1}};
  const ctx = {TX, escapeAttr: esc, escapeHtml: esc, dungeonsTabOpen: ()=> open, dailyDungeonsOpen: ()=> open /* AR3 (2026-10-23): the key ring follows the daily dungeons */, dungeonKeyCap: ()=> cap, dungeonKeyCapNext: ()=> cap < 5 ? {cap: cap + 1, cost: {gold: 800, dust: 400}, strange: 1} : null,
    canRaiseDungeonKeyCap: ()=> can, ownedCount: ()=> 0, strangeMateriaSourceText: ()=> 'Strange Materia',
    btnCostHTML: (c, extra)=> `<span class="btn-cost">${c.gold}|${c.dust}|${(extra || []).map(x=> x.icon + x.need).join('')}</span>`};
  vm.createContext(ctx); vm.runInContext(fnSrc('dungeonKeyRingHTML') + '\nthis.R = dungeonKeyRingHTML;', ctx);
  const h = ctx.R();
  ok(/id="forgeKeyCapBtn" aria-disabled="true">⬆️ Widen the key ring<span class="btn-cost">800\|400\|🔮1<\/span>/.test(h) && /Holds 3 keys/.test(h) /* 2026-10-30 (UI6, X19): "Dungeon key" is now "key" (the Dailies share one set) */ && /Next: holds 4 keys/.test(h), '3. the Key ring row: holds 3, next 4, cost with 🔮 Strange Materia, greyed when short');
  cap = 5; ok(/Fully widened: 5 keys\./.test(ctx.R()) && !/forgeKeyCapBtn/.test(ctx.R()), '3. at 5: fully widened, no button');
  open = false; ok(ctx.R() === '', '3. no daily dungeon open yet: no row'); }
ok(/closest\('#forgeKeyCapBtn'\)/.test(src) && /showToast\(TX\('toast\.keyring-up', \{cap: t\.cap\}\), 'ok'\)/.test(src) && /showToast\(TX\('toast\.keyring-short'\), 'warn'\)/.test(src), '3. the button raises the cap or says it is short');

// ---- 5. the Upgrades tabs and the Profile
const forge = fnSrc('renderForge');
ok(/facility: \{icon:'⬆️', get label\(\)\{ return TX\('ui\.upgrades-tab'\); \}/.test(src), '5. the Forge has a ⬆️ Upgrades mode tab');
{ const tabsAt = forge.indexOf('class="forge-modes"'), upAt = forge.indexOf("forgeMode === 'facility' ? `<div class=\"facility-upgrades\" id=\"forgeUpgradesTab\">${forgeUpgradeHTML() + staminaPanelHTML('forge') + dungeonKeyRingHTML()}</div>`");
  ok(upAt > tabsAt && tabsAt > 0, '5. the Forge tier, its Max Energy and the Key ring are inside the Upgrades tab');
  ok(forge.split('forgeUpgradeHTML()').length === 2 && forge.split("staminaPanelHTML('forge')").length === 2 && forge.split('dungeonKeyRingHTML()').length === 2, '5. and nowhere else on the Forge page');
  ok(/<div class="forge-layout" \$\{forgeMode==='smith' \|\| forgeMode==='castles' \|\| forgeMode==='facility'( \|\| forgeMode==='raid')? \? 'hidden' : ''\}>/.test(forge), '5. the card bench hides on the Upgrades tab'); // + the Raid tab (2026-10-19, package RC)
  ok(/if\(forgeMode==='smith' \|\| forgeMode==='facility'( \|\| forgeMode==='raid')?\) return false;/.test(fnSrc('forgeReadyFor')), '5. no "ready" cards counted on it'); }
{ const nest = fnSrc('renderNest');
  // 2026-10-23 (TU2, owner: "Nest only lists baby/eggs or level 0 base cards (in two tabs)"): Eggs | Level 0 recruits | Upgrades
  // 2026-10-24 (package NE, owner 17:01 #11: "The nest tabs say 'Hatchery', 'Upgrades'. No need for the level 0 tab."): Hatchery | Upgrades; the
  // Level 0 cards (Younglings) moved into a nest's subwindow (tests/ne-2026-10-24.js). Was: Eggs | Level 0 | Upgrades, with the grid on Level 0.
  ok(/facilityTabsHTML\('nest', nestTab, \[\['eggs', '🪺 ' \+ TX\('ui\.ne-nest-tab-hatchery'\)\], \['upgrades', '⬆️ ' \+ TX\('ui\.upgrades-tab'\)\]\]\)/.test(nest), '5. the Nest has Hatchery | ⬆️ Upgrades');
  ok(/nestTab === 'upgrades' \? `<div class="facility-upgrades" id="nestUpgradesTab">\$\{staminaPanelHTML\('nest'\)[^`]*\$\{nestBuildRowHTML\(\)\}<\/div>` : nestKeeperHTML\(\)/.test(nest) && nest.split("staminaPanelHTML('nest')").length === 2, '5. the Nest\'s Max Energy and next nest are in its Upgrades tab only');
  ok(/<div class="grid-view" id="nestGrid" hidden><\/div>/.test(nest), '5. no card grid on the Nest page (Younglings live in the nest subwindow)'); }
{ const tav = fnSrc('openTavern');
  ok(/facilityTabsHTML\('tavern', tavernTab, \[\['recruit', TX\('ui\.tavern-tab-recruit'\)\], \['upgrades', '⬆️ ' \+ TX\('ui\.upgrades-tab'\)\]\]\)/.test(tav), '5. the Tavern has 🤝 Recruit | ⬆️ Upgrades');
  // 2026-10-24 (package NE): the Upgrades tab also holds the deck slots since package UI4 (2026-10-23), so the stamina panel is no longer the tab's only content
  ok(/tavernTab === 'upgrades' \? `<div class="facility-upgrades" id="tavernUpgradesTab">\$\{staminaPanelHTML\('tavern'\)\}[^`]*<\/div>` : tavernBeerHTML\(\) \+ tavernRecruitHTML\(\)/.test(tav) && tav.split("staminaPanelHTML('tavern')").length === 2, '5. the Tavern\'s Max Energy is in its Upgrades tab only');
  ok(/if\(!wasOpen\) fxHook\('tavernOpen'/.test(tav), '5. a tab switch does not replay the Tavern\'s hello'); }
ok(/\$\{profileUpgradesHTML\(\)/.test(fnSrc('renderProfile')), '5. the Profile shows the upgrades summary');
{ const ctx = {TX, escapeAttr: esc, escapeHtml: esc, featureUnlockedSafe: k=> k !== 'tavern', facilityUpgradeState: p=> p === 'forge' ? {done: 2, of: 7, ready: true} : {done: 0, of: 8, ready: false}};
  vm.createContext(ctx); vm.runInContext(lineOf('const FACILITY_UPGRADE_PLACES') + '\n' + fnSrc('profileUpgradesHTML') + '\n' + fnSrc('facilityTabsHTML') + '\nthis.P = profileUpgradesHTML; this.T = facilityTabsHTML;', ctx);
  const h = ctx.P();
  ok(/data-facility-upgrades="forge"[^>]*>.*<b>The Forge<\/b><small>2\/7 upgrades<\/small><em>one is ready<\/em>/.test(h) && /data-facility-upgrades="nest"/.test(h) && !/data-facility-upgrades="tavern"/.test(h), '5. one row per open place: upgrades bought / all, "one is ready"');
  ctx.featureUnlockedSafe = ()=> false; ok(ctx.P() === '', '5. nothing open: no summary');
  const t = ctx.T('nest', 'upgrades', [['cards', 'Cards'], ['upgrades', 'Up']]);
  ok(/role="tablist"/.test(t) && /class="facility-tab on " data-facility-tab="nest:upgrades" aria-selected="true">Up/.test(t) && /data-facility-tab="nest:cards" aria-selected="false"/.test(t), '5. the tab bar marks the open tab'); }
{ const f = fnSrc('openFacilityUpgrades');
  ok(/forgeMode = 'facility'; codexSubTab = 'forge'; switchTab\('codex'\);/.test(f) && /nestTab = 'upgrades'; switchTab\('nest'\);/.test(f) && /tavernTab = 'upgrades'; openTavern\(\);/.test(f), '5. a summary row opens that place on its Upgrades tab'); }
ok(/\.facility-tabs\{/.test(tpl) && /\.forge-mode\.has-ready::after/.test(tpl) && /\.pf-upgrades \.pf-upg-row\{/.test(tpl) && /\.cnp-dungeon-keys\{/.test(tpl), '5. the CSS');

// ---- 6. texts and packs
const KEYS = ['ui.keyring-title', 'ui.keyring-tip', 'ui.keyring-holds', 'ui.keyring-next', 'ui.keyring-btn', 'ui.keyring-max', 'toast.keyring-short', 'toast.keyring-up',
  'ui.dungeon-no-keys', 'ui.dungeon-keys-count', 'ui.dungeon-keep-climbing', 'ui.dungeon-each-floor-key', 'ui.dungeon-best-floor', 'ui.dungeon-refill-in', 'ui.dungeon-key-rule',
  'ui.dungeons-sub', 'ui.dungeon-keys-row', 'ui.dungeon-keys-left', 'ui.dungeon-fight-uses-key', 'toast.dungeon-key-used', 'ui.sweep-key-a-run', 'results.sweep-keys-used', 'ui.dungeon-sweep-tip',
  'ui.upgrades-tab', 'ui.forge-upgrades-blurb', 'ui.ne-nest-tab-hatchery' /* 2026-10-24 (package NE): was ui.tu2-nest-tab-eggs / -recruits; ui.nest-upg-next-map went (#10: "Locked for now", no map) */, 'ui.tavern-tab-recruit', 'ui.nest-upg-title', 'ui.nest-upg-built', 'ui.nest-upg-btn', 'ui.nest-upg-all',
  'ui.upg-sum-title', 'ui.upg-sum-sub', 'ui.upg-sum-steps', 'ui.upg-sum-ready', 'ui.upg-sum-open', 'ui.place-forge', 'ui.place-nest', 'ui.place-tavern'];
KEYS.forEach(k=> ok(typeof TEXT[k] === 'string' && src.includes(`'${k}'`), `6. ${k} is a TX key the code uses`));
const RETIRED = ['toast.no-dungeon-tickets-left-a-new', 'toast.dungeon-key-in-the-lock-win', 'results.a-win-gives-your-key-back', 'results.dungeon-key-back', 'results.dungeon-key-lost-climb-resets'];
RETIRED.forEach(k=> ok(!(k in TEXT) && !src.includes(`'${k}'`), `6. ${k} is retired`));
ok(!/win and it comes back|win and the key comes back|a win gives it back'/.test(src.split('\n').filter(l=> !/^\s*\/\//.test(l)).join('\n').replace(/\/\*[^]*?\*\//g, '')), '6. no player text still says a win gives the key back');
ok(!/DUNGEON_KEY_RULE/.test(src), '6. the inline English rule is gone (dungeonKeyRuleText)');
const LEAD = /^[\s \p{Extended_Pictographic}\p{So}\p{Sk}️‍↻→←▸▾•·★☆✓✕✗⚡]*/u;
const core = v=> v.trim().replace(LEAD, '').replace(/[\s:]+$/, '');
const CODES = ['fr', 'de', 'es', 'it', 'pt', 'tl', 'ta', 'id', 'zh-Hans', 'zh-Hant', 'ja', 'ko'];
CODES.forEach(c=>{ const pack = JSON.parse(fs.readFileSync(path.join(ROOT, 'lang', c + '.json'), 'utf8'));
  const miss = KEYS.filter(k=> !pack[core(TEXT[k])]); ok(!miss.length, `6. lang/${c}.json has every new text (missing: ${miss.join(', ')})`);
  ok(!pack['+1 Dungeon key ({n} in hand)'] && !pack['A won floor gives your Dungeon key back, so you can keep climbing'], `6. lang/${c}.json dropped the retired lines`); });
{ const fr = JSON.parse(fs.readFileSync(path.join(ROOT, 'lang', 'fr.json'), 'utf8')), tr = createTranslator(fr);
  ok(tr(TX('ui.dungeon-keys-left', {n: 2})) === '🗝️ 2 restante(s)', `6. "🗝️ N left" translates: ${tr(TX('ui.dungeon-keys-left', {n: 2}))}`);
  ok(tr('🗝️ ' + TX('ui.dungeon-no-keys', {cap: 4, h: 7})) === '🗝️ Plus de clé. Elles remontent à 4 dans 7 h.' /* 2026-10-30 (UI6, X19): "Dungeon key" is now "key" (the Dailies share one set) */, `6. the reason translates: ${tr('🗝️ ' + TX('ui.dungeon-no-keys', {cap: 4, h: 7}))}`);
  ok(tr(TX('ui.keyring-holds', {cap: 5})) === 'Contient 5 clés' /* 2026-10-30 (UI6, X19): "Dungeon key" is now "key" (the Dailies share one set) */, '6. the Key ring line translates');
  ok(tr('⬆️ ' + TX('ui.upgrades-tab')) === '⬆️ Améliorations', '6. the tab translates'); }
ok(fs.existsSync(path.join(ROOT, 'tools', 'i18n_2026_10_19_dungeon_keys.py')), '6. tools/i18n_2026_10_19_dungeon_keys.py');

console.log(fail ? `dk-2026-10-19: ${fail} of ${n} checks failed` : `dk-2026-10-19: all ${n} checks passed`);
process.exit(fail ? 1 : 0);
