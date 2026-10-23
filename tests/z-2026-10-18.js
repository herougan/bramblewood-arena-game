#!/usr/bin/env node
// 2026-10-18 (package Z, owner 17:28):
//   1. the field kit: two items a fight, +1 in a fight against a boss that grants an item (node.grantsItem, set on each main map's
//      own boss from Map GRANTS_ITEM_FROM_MAP); "1/2" on the 🎒 pill; spent, it greys and fades out (gone after KIT_FADE_MS);
//      the boss's first clear gives a kit item; the daily earning rules are untouched
//   2. the daily dungeons' Sweep: premium players only (isPremiumPlayer: a server flag if any, admins count), locked with a
//      Premium badge and the supporters tooltip otherwise; reuses openSweepMenu / runSweep
//      (2026-10-18, package DK: a Sweep run is no longer keyless: each uses a 🗝️ key, see tests/dk-2026-10-19.js)
//   3. the Babel Spire: a cleared floor is blue-grey, free (0 Energy) and pays nothing; a new floor's Energy comes back on a loss
//   4. TX keys for every new text, with all 12 packs; docs/ads-considerations-2026-10-18.md
'use strict';
const fs = require('fs'), path = require('path'), vm = require('vm');
const ROOT = path.join(__dirname, '..');
const src = fs.readFileSync(path.join(ROOT, 'arena_app.js'), 'utf8');
const tpl = fs.readFileSync(path.join(ROOT, 'arena_template.html'), 'utf8');
const {TEXT, TX} = require(path.join(ROOT, 'bramblewood-texts.js'));
const {createTranslator} = require(path.join(ROOT, 'bramblewood-i18n.js'));
let fail = 0, n = 0; const ok = (c, m)=>{ n++; if(!c){ fail++; console.log('  ✗', m); } };
const fnSrc = name=>{ const i = src.indexOf(`\nfunction ${name}(`) >= 0 ? src.indexOf(`\nfunction ${name}(`) : src.indexOf(`\nasync function ${name}(`); if(i < 0) return '';
  let d = 0, j = src.indexOf('{', src.indexOf(')', i)); for(let k = j; k < src.length; k++){ const ch = src[k]; if(ch === '{') d++; else if(ch === '}'){ d--; if(!d) return src.slice(i, k + 1); } } return ''; };
const lineOf = start=>{ const i = src.indexOf(start); if(i < 0) return ''; return src.slice(i, src.indexOf('\n', i)); };
const esc = s=> String(s);

// ---- 1. the field kit
const kitFns = ['itemsUsableIn', 'kitGrantsItemNode', 'kitUsesMax', 'kitUsesUsed', 'kitSpent', 'itemsHudHTML', 'itemBlockReason'];
kitFns.forEach(f=> ok(fnSrc(f), `arena_app.js has ${f}`));
ok(/^const KIT_USES_PER_FIGHT = 2, KIT_FADE_MS = \d+;/.test(lineOf('const KIT_USES_PER_FIGHT')), '1. two items a fight');
{ const ctx = {TX, escapeAttr: esc, escapeHtml: esc, ITEM_PVE_MODES: new Set(['conquest', 'ai']), ITEM_DEFS: {draught:{}, kindling:{}},
    featureUnlockedSafe: ()=> true, loadItems: ()=> ({counts:{draught:2, kindling:1}}), itemCount: ()=> 2,
    findConquestNode: (mapId, key)=> ({map:{}, node:{key, grantsItem: key === 'boss'}}), Date};
  vm.createContext(ctx); vm.runInContext(lineOf('const KIT_USES_PER_FIGHT') + '\n' + kitFns.map(fnSrc).join('\n') + '\nthis.K = {' + kitFns.join(',') + ', KIT_FADE_MS};', ctx);
  const K = ctx.K;
  const fight = (key, used, extra)=> Object.assign({mode:'conquest', over:false, conquestNode:{mapId:'m13', nodeId:key}, itemsUsed:used, players:{1:{}, 2:{}}}, extra || {});
  ok(K.kitUsesMax(fight('a', 0)) === 2, '1. an ordinary fight allows 2 items');
  ok(K.kitUsesMax(fight('boss', 0)) === 3, '1. a grantsItem boss allows 3');
  ok(K.kitUsesMax({mode:'ai'}) === 2, '1. a fight with no node (vs AI) allows 2');
  const h0 = K.itemsHudHTML(fight('a', 0)), h1 = K.itemsHudHTML(fight('a', 1));
  ok(/id="hudPackBtn"/.test(h0) && !/hud-pack-used/.test(h0) && !/is-used/.test(h0), '1. unused: the pill, no badge');
  ok(/has-used/.test(h1) && /<span class="hud-pack-used" aria-hidden="true">1\/2<\/span>/.test(h1) && !/is-spent/.test(h1), '1. one used: "1/2" badge, not greyed');
  ok(/1 of 2 used this skirmish/.test(h1), '1. the aria label says 1 of 2 used');
  const h2 = K.itemsHudHTML(fight('a', 2, {kitSpentAt: Date.now() - 300}));
  ok(/is-used is-spent/.test(h2) && /2\/2<\/span>/.test(h2) && /animation-delay:-\d+ms/.test(h2), '1. two used: greyed "2/2", fading (delay keeps its place)');
  ok(K.itemsHudHTML(fight('a', 2, {kitSpentAt: Date.now() - K.KIT_FADE_MS - 10})) === '', '1. faded out after KIT_FADE_MS');
  ok(K.itemsHudHTML(fight('a', 2)) === '', '1. a resumed fight that was spent shows no pill');
  ok(/2\/3<\/span>/.test(K.itemsHudHTML(fight('boss', 2))) && !/is-spent/.test(K.itemsHudHTML(fight('boss', 2))), '1. against a grantsItem boss, 2 used is "2/3", still open');
  ok(K.itemBlockReason('draught', fight('a', 2)) === TX('toast.kit-limit', {max: 2}), '1. a third item is refused with "2 items a skirmish."');
  ok(K.itemBlockReason('draught', fight('boss', 3)) === TX('toast.kit-limit', {max: 3}), '1. a fourth against a grantsItem boss is refused');
}
ok(/m\.itemsUsed = kitUsesUsed\(m\) \+ 1;/.test(src) && !/m\.itemUsed\b/.test(src.split('\n').filter(l=> !/^\s*\/\//.test(l)).join('\n')), '1. useItem counts m.itemsUsed (the one-shot m.itemUsed is gone)');
ok(/if\(kitSpent\(m\)\)\{ m\.kitSpentAt = Date\.now\(\); setTimeout\(/.test(src), '1. the last item starts the fade and a redraw after it');
ok(/'itemsUsed','towerReplay','towerEnergyPaid','towerRefunded'\]/.test(src), '1/3. resumed fights keep the kit count and the Spire state');
ok(/\.hud-pack\.is-spent\{animation:kitSpentFade/.test(tpl) && /@keyframes kitSpentFade\{/.test(tpl), '1. the fade-out CSS');
// grantsItem: each main map's own boss from GRANTS_ITEM_FROM_MAP
{ const a = src.indexOf('const GRANTS_ITEM_FROM_MAP'), b = src.indexOf('const CONQUEST_MAPS_BASELINE');
  ok(a > 0 && b > a && src.indexOf('CONQUEST_MAPS.push(buildTower());') < a, '1. the flags are set after the maps are built, before the baseline copy');
  const maps = Array.from({length:15}, (_, i)=> ({id:'m' + i, nodes:[{key:'a', kind:'skirmish'}, {key:'b', kind:'boss'}, i === 13 ? {key:'e', kind:'elite', ender:true} : {key:'c', kind:'skirmish'}]}));
  maps[14].nodes[1].grantsItem = false; maps.push({id:'sub', sub:true, nodes:[{key:'x', kind:'boss'}]});
  const ctx = {CONQUEST_MAPS: maps}; vm.createContext(ctx); vm.runInContext(src.slice(a, b), ctx);
  ok(maps.slice(0, 12).every(m=> m.nodes.every(x=> !x.grantsItem)), '1. no boss before Map 12 grants an item');
  ok(maps[12].nodes[1].grantsItem === true, '1. Map 12\'s boss grants an item');
  ok(maps[13].nodes[2].grantsItem === true && !maps[13].nodes[1].grantsItem, '1. a map\'s ender is its boss');
  ok(maps[14].nodes[1].grantsItem === false, '1. grantsItem:false is kept');
  ok(!maps[15].nodes[0].grantsItem, '1. side maps are left alone'); }
ok(fnSrc('grantBossKitItem') && /if\(isFirstClear && bn && bn\.grantsItem\)\{ const bi = grantBossKitItem\(\); if\(bi\) m\.conquestBossKitItem = bi; \}/.test(src), '1. a grantsItem boss\'s first clear gives a kit item');
ok(/conquestBossKitItem[\s\S]{0,260}data-tip="\$\{escapeAttr\(kd\.desc\)/.test(src) /* 2026-10-23 (UI4): the chip's tip is the item's own line */ && /TX\('ui\.node-grants-item'/.test(src), '1. the results chip and the node panel line');
ok(/const SKIRMISH_KIT_PER_DAY = 3[,;]/.test(src) /* 2026-10-23 (EB): + KIT_DROP_PER_ENERGY on the same line */ && /const QUEST_KIT_ITEMS = \{daily:\{A:1, S:1, SS:2, SSS:3\}, weekly:\[3, 2, 1\]\};/.test(src), '1. the daily earning rules are unchanged');

// ---- 2. premium Sweep of the daily dungeons
['premiumFromProfile', 'isPremiumPlayer', 'refreshPremiumFlag', 'dungeonSweepableFloor', 'dungeonSweepNode', 'dungeonSweepBtnHTML'].forEach(f=> ok(fnSrc(f), `arena_app.js has ${f}`));
{ const ctx = {TX, escapeAttr: esc, escapeHtml: esc, adminModeEnabled: false, adminAllowed: ()=> false, cloudPremium: false,
    isDailyDungeonMap: m=> !!(m && m.endless && !m.tower), dungeonBestFloor: ()=> 4, nodeEnergyCost: ()=> 6,
    dungeonTicketsLeft: ()=> 2, dungeonNoKeysText: ()=> 'No Dungeon keys left.'}; // 2026-10-18 (package DK): the button reads the keys in hand
  vm.createContext(ctx);
  vm.runInContext(lineOf('const PREMIUM_SPEND_USD') + '\n' + ['premiumFromProfile', 'isPremiumPlayer', 'dungeonSweepableFloor', 'dungeonSweepNode', 'dungeonSweepBtnHTML'].map(fnSrc).join('\n') +
    '\nthis.P = {premiumFromProfile, isPremiumPlayer, dungeonSweepableFloor, dungeonSweepNode, dungeonSweepBtnHTML};', ctx);
  const P = ctx.P;
  ok(P.premiumFromProfile({premium:true}) && P.premiumFromProfile({lifetime_spend_usd: 10.01}) && P.premiumFromProfile({lifetime_spend_usd:'25'}), '2. a premium flag, or more than 10 USD spent, is premium');
  ok(!P.premiumFromProfile({lifetime_spend_usd:10}) && !P.premiumFromProfile({id:'x', rating:3}) && !P.premiumFromProfile(null), '2. 10 USD exactly, no field, or no row: not premium');
  ok(P.isPremiumPlayer() === false, '2. with no server flag, a player is not premium');
  ctx.adminModeEnabled = true; ok(P.isPremiumPlayer() === true, '2. Admin Mode counts as premium'); ctx.adminModeEnabled = false;
  ctx.adminAllowed = ()=> true; ok(P.isPremiumPlayer() === true, '2. an admin account counts as premium'); ctx.adminAllowed = ()=> false;
  const map = {id:'mm', endless:true, nodes: Array.from({length:10}, (_, i)=> ({key:'6-MM-' + (i + 1), floor: i + 1}))};
  ok(P.dungeonSweepNode(map).floor === 4, '2. the Dungeons tab sweeps your best floor');
  ok(P.dungeonSweepableFloor(map, map.nodes[2]) && P.dungeonSweepableFloor(map, map.nodes[3]) && !P.dungeonSweepableFloor(map, map.nodes[4]), '2. floors up to your best can be swept, not above');
  ok(!P.dungeonSweepableFloor({id:'tw', endless:true, tower:true, nodes:[]}, {floor:1}), '2. the Spire is not a daily dungeon');
  const locked = P.dungeonSweepBtnHTML(map);
  ok(/is-locked/.test(locked) && /aria-disabled="true"/.test(locked) && /<span class="premium-badge">Premium<\/span>/.test(locked) && locked.includes('title="Sweeping daily dungeons is a perk for supporters"'), '2. not premium: locked, Premium badge, supporters tooltip');
  ctx.cloudPremium = true; const open = P.dungeonSweepBtnHTML(map);
  ok(!/is-locked/.test(open) && /aria-haspopup="true"/.test(open) && /Sweep floor 4, your best/.test(open) && /costs 6⚡/.test(open), '2. premium: an open Sweep for floor 4 at its Energy cost');
  ok(P.dungeonSweepBtnHTML({id:'mm', endless:true, nodes:map.nodes, best:0}) !== '' , '2. (sanity) a map with a best floor has a button');
  ctx.dungeonBestFloor = ()=> 0; ok(P.dungeonSweepBtnHTML(map) === '', '2. nothing cleared yet: no Sweep'); }
ok(/sbClient\.from\('profiles'\)\.select\('\*'\)\.eq\('id', cloudUserId\)\.maybeSingle\(\)/.test(fnSrc('refreshPremiumFlag')) && !/\.(update|upsert|insert)\(/.test(fnSrc('refreshPremiumFlag')), '2. the flag is only read from the player\'s own profile row');
ok(/refreshPremiumFlag\(\); \/\/ 2026-10-18 \(package Z\)/.test(src), '2. it is read at sign-in');
ok(/\$\{dungeonSweepBtnHTML\(map\)/.test(src) && /querySelectorAll\('\[data-dungeon-sweep\]'\)/.test(src) && /openSweepMenu\(b, map, node, nodeEnergyCost\(map, node\) \|\| 1, body, \{noIdle:true, after: \(\)=> renderDungeonsSubTab\(body\)\}\)/.test(src), '2. the Dungeons tab Sweep reuses openSweepMenu');
// 2026-10-18 (package DK, owner 23:54: "I can't sweep past the number of keys I have"): was "A Sweep takes no key"
ok(/costs \{e\}⚡ and a Dungeon key/.test(TEXT['ui.dungeon-sweep-tip']) && /if\(dg\)\{ dungeonStakeKey\(mapId\); keys\+\+; \}/.test(fnSrc('runSweep')), '2. a dungeon Sweep run uses a key (no longer keyless)');
ok(/function openSweepMenu\(anchor, map, node, energyCost, body, how\)/.test(src) && /if\(how && how\.after\) how\.after\(\); else renderConquestSubTab\(body\);/.test(src) && /runSweep\(map\.id, node\.key, n\)/.test(src), '2. the sweep menu runs runSweep and can re-render its own tab');
ok(/const canSweep = dgSweep \|\| \(done && !selectedNode\.tower && !isDailyDungeonMap\(map\) && sweepAllowed/.test(src) && /if\(so\.dataset\.locked\) return dungeonSweepLocked\(so\);/.test(src), '2. a floor\'s own panel: premium Sweep, locked for others');
ok(/\.premium-badge\{/.test(tpl) && /\.dg-sweep\.is-locked/.test(tpl), '2. the badge and locked CSS');

// ---- 3. the Babel Spire
['towerFloorCleared', 'fightEnergyCost', 'towerCostNoteHTML', 'nodeRewardTier'].forEach(f=> ok(fnSrc(f), `arena_app.js has ${f}`));
{ const done = new Set(['tw:20-TW-1', 'tw:20-TW-2']);
  const ctx = {TX, escapeHtml: esc, loadConquestProgress: ()=> ({completed:[...done]}), conquestNodeId: (a, b)=> a + ':' + b, nodeEnergyCost: ()=> 9,
    CONQUEST_NODE_REWARDS: {elite:{first:{gold:100, dust:20}, repeat:{gold:30, dust:5}}}, baseKind: k=> k};
  vm.createContext(ctx); vm.runInContext(['towerFloorCleared', 'fightEnergyCost', 'towerCostNoteHTML', 'nodeRewardTier'].map(fnSrc).join('\n') + '\nthis.T = {towerFloorCleared, fightEnergyCost, towerCostNoteHTML, nodeRewardTier};', ctx);
  const T = ctx.T, f1 = {key:'20-TW-1', tower:true, kind:'elite'}, f3 = {key:'20-TW-3', tower:true, kind:'elite'}, plain = {key:'5-3', kind:'elite'};
  ok(T.towerFloorCleared(f1) && !T.towerFloorCleared(f3) && !T.towerFloorCleared(plain), '3. cleared Spire floors are known');
  ok(T.fightEnergyCost('tw', f1) === 0 && T.fightEnergyCost('tw', f3) === 9 && T.fightEnergyCost('m5', plain) === 9, '3. a cleared floor costs 0 Energy, a new one its cost');
  ok(T.towerCostNoteHTML({}, f1) === '<p class="cnp-tower-cost is-free">⚡ 0 · free · 0 reward: you have cleared this floor</p>', '3. a cleared floor\'s panel line: ⚡ 0 · free');
  ok(T.towerCostNoteHTML({}, f3) === '<p class="cnp-tower-cost">⚡ 9 · refunded if you lose</p>', '3. a new floor\'s panel line: ⚡ 9 · refunded if you lose');
  ok(T.towerCostNoteHTML({}, plain) === '', '3. no Spire line elsewhere');
  const r = T.nodeRewardTier(Object.assign({rewards:{first:{gold:66, dust:17}}}, f3));
  ok(r.first.gold === 66 && r.repeat.gold === 0 && r.repeat.dust === 0, '3. a Spire floor pays its first clear, and 0 again');
  ok(T.nodeRewardTier(plain).repeat.gold === 30, '3. other fights keep their clear-again reward'); }
{ const s = src.slice(src.indexOf('\nfunction startConquestMatch('), src.indexOf('\nfunction startConquestMatch(') + 9000);
  ok(/const towerReplay = !!node\.tower && towerFloorCleared\(node\); let towerEnergyPaid = 0(, energyPaid = 0)?;/.test(s) /* 2026-10-23 (EB): + energyPaid */ && /if\(!\(opts && opts\.skipEnergyCost\) && !towerReplay\)\{/.test(s), '3. a cleared floor starts without spending Energy');
  ok(/if\(node\.tower\) towerEnergyPaid = cost; else bumpQuestCounter\('energyConquest', cost\);/.test(s) && /towerReplay, towerEnergyPaid,/.test(s), '3. a new floor\'s Energy is held for a refund'); }
// 2026-10-21 (package TT): package ED's one result per match adds !m.rewardDuplicate to the refund and the rewards (below)
ok(/if\(m\.mode==='conquest' && m\.winner!==1 && m\.towerEnergyPaid > 0 && !m\.towerRefunded && !m\.rewardDuplicate\)\{ m\.towerRefunded = m\.towerEnergyPaid;(?: \/\/[^\n]*)?\s*try\{ const st = settleEnergy\(\); st\.current \+= m\.towerEnergyPaid; saveEnergyState\(st\);/.test(src), '3. a lost, forfeited or drawn new floor refunds its Energy');
ok(/if\(m\.mode==='conquest' && m\.winner===1 && m\.conquestNode && !m\.adminTest && m\.towerReplay\)\{/.test(src) && /if\(m\.mode==='conquest' && m\.winner===1 && m\.conquestNode && !m\.adminTest && !m\.towerReplay\)\{\n\s*\/\/ Reward payouts/.test(src), '3. a free replay skips every reward (and keeps its rank)');
ok(/QUEST_COUNTING_MODES\.has\(m\.mode\) && !m\.towerReplay && !m\.rewardDuplicate\)\{/.test(src) && /!m\.adminTest && !m\.towerReplay && !m\.rewardDuplicate\) heroAwardBattle\(m\)/.test(src), '3. no XP, quests or hero XP on a free replay');
ok(/if\(m\.towerEnergyPaid > 0\) bumpQuestCounter\('energyConquest', m\.towerEnergyPaid\);/.test(src), '3. a won new floor\'s Energy counts for the notice');
ok(/TX\('results\.tower-refunded', \{n: m\.towerRefunded\}\)/.test(src) && /TX\('results\.tower-replay'\)/.test(src), '3. the results say "refunded" / "no reward"');
ok(/\$\{done && node\.tower \? ' is-free-replay' : ''/.test(src) && /<span class="map-node-free">\$\{escapeHtml\(TX\('ui\.tower-free-tag'\)\)\}<\/span>/.test(src), '3. cleared floors on the map: blue-grey with "0 reward · free"');
ok(/\.map-node\.done\.is-free-replay\{background-color:#8fa3b8;/.test(tpl) && /\.map-node \.map-node-free\{/.test(tpl), '3. the blue-grey CSS');
ok(/const energyCost = selectedNode\.virtual \? 0 : fightEnergyCost\(map, selectedNode\)/.test(src) && /const c = fightEnergyCost\(f\.map, f\.node\), short/.test(src), '3. the panel and Play again use the free cost');
{ // the Spire card: rule line, the next floor's refundable cost, and at the summit the free replay line
  const towerSrc = fnSrc('towerCardHTML'); const nodes = Array.from({length:50}, (_, i)=> ({key:'20-TW-' + (i + 1), kind:(i + 1) % 10 ? 'elite' : 'boss'}));
  const card = done=> new Function('CONQUEST_MAPS', 'isMapUnlocked', 'dungeonFloorProgress', 'enemyDeckLevel', 'compassDiamondSVG', 'escapeHtml', 'escapeAttr',
    'TOWER_BR_START', 'TOWER_BR_STEP', 'TOWER_LEVEL_CAP', 'adminModeEnabled', 'TX', 'nodeEnergyCost', towerSrc.slice(1) + '\nreturn towerCardHTML({});')(
    [{id:'tw', name:'The Babel Spire', icon:'🗼', blurb:'A tower.', nodes}], ()=> true, ()=> ({done, total:50}), ()=> 99, ()=> '', esc, esc, 100, 10, 15, false, TX, ()=> 7);
  const mid = card(10), top = card(50);
  ok(mid.includes(TX('ui.tower-rule')) && mid.includes('<span class="dg-tower-cost">⚡ 7 · refunded if you lose</span>'), '3. mid-climb: the rule and "⚡ 7 · refunded if you lose"');
  ok(top.includes(TX('ui.tower-summit-free')) && /data-tower-replay title="⚡ 0 · free · 0 reward/.test(top) && top.includes('<span class="dg-tower-cost is-free">0 reward · free</span>'), '3. the summit picker says the replay is free, 0 reward'); }

// ---- 4. texts, packs, the ads page
const KEYS = ['ui.kit-pill-title', 'ui.kit-pill-aria', 'ui.kit-spent', 'ui.kit-head-sub', 'ui.kit-boss-bonus', 'toast.kit-limit', /* 'results.kit-boss-item' went 2026-10-23 (UI4) */ 'ui.node-grants-item',
  'ui.kit-inv-head', 'ui.kit-inv-note', 'ui.kit-shop-rule', 'ui.dungeon-sweep', 'ui.premium-badge', 'ui.dungeon-sweep-locked', 'ui.dungeon-sweep-tip',
  'ui.tower-free-tag', 'ui.tower-cost-refund', 'ui.tower-cost-free', 'ui.tower-rule', 'ui.tower-summit-free', 'results.tower-refunded', 'results.tower-replay'];
KEYS.forEach(k=> ok(typeof TEXT[k] === 'string' && src.includes(`'${k}'`), `4. ${k} is a TX key the code uses`));
ok(!('toast.one-item-a-skirmish' in TEXT), '4. the retired "One item a skirmish." key is gone');
ok(!/One item a skirmish, and it doesn't use your play/.test(src) && !/one item a skirmish · up to/.test(src), '4. no one-item wording left in the Inventory');
const LEAD = /^[\s \p{Extended_Pictographic}\p{So}\p{Sk}️‍↻→←▸▾•·★☆✓✕✗⚡]*/u;
const core = v=> v.trim().replace(LEAD, '').replace(/[\s:]+$/, '');
const CODES = ['fr', 'de', 'es', 'it', 'pt', 'tl', 'ta', 'id', 'zh-Hans', 'zh-Hant', 'ja', 'ko'];
CODES.forEach(c=>{ const pack = JSON.parse(fs.readFileSync(path.join(ROOT, 'lang', c + '.json'), 'utf8'));
  const miss = KEYS.filter(k=> !pack[core(TEXT[k])]); ok(!miss.length, `4. lang/${c}.json has every new text (missing: ${miss.join(', ')})`);
  ok(!('One item a skirmish.' in pack), `4. lang/${c}.json dropped the retired line`); });
{ const fr = JSON.parse(fs.readFileSync(path.join(ROOT, 'lang', 'fr.json'), 'utf8')), tr = createTranslator(fr);
  ok(tr(TX('ui.tower-cost-refund', {n: 7})) === '⚡ 7 · remboursé si vous perdez', `4. the template translates: ${tr(TX('ui.tower-cost-refund', {n: 7}))}`);
  ok(tr(TX('ui.kit-head-sub', {n: 1, max: 2})) === '1/2 utilisés dans cette escarmouche', `4. the kit heading translates: ${tr(TX('ui.kit-head-sub', {n: 1, max: 2}))}`);
  ok(tr(TX('ui.dungeon-sweep')) === '🧹 Balayage', '4. the Sweep button translates'); }
ok(fs.existsSync(path.join(ROOT, 'tools', 'i18n_2026_10_18z.py')), '4. tools/i18n_2026_10_18z.py');
{ const ads = fs.existsSync(path.join(ROOT, 'docs', 'ads-considerations-2026-10-18.md')) ? fs.readFileSync(path.join(ROOT, 'docs', 'ads-considerations-2026-10-18.md'), 'utf8') : '';
  ok(/opt-in rewarded/i.test(ads) && /never in a battle/i.test(ads) && /premium/i.test(ads) && /Steam/.test(ads) && /consent/i.test(ads), '4. the ads page covers opt-in rewarded ads, no battles, premium, Steam and consent'); }

console.log(fail ? `z-2026-10-18: ${fail} of ${n} checks failed` : `z-2026-10-18: all ${n} checks passed`);
process.exit(fail ? 1 : 0);
