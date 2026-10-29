#!/usr/bin/env node
// 2026-10-26 (package RES3, rewards and results; owner notes 10-25 17:53 R1-R9, B1, B3 and 22:36 G5, G6, G10, G12, G15, G16, G18). The functions
// are cut out of arena_app.js and run on small stand-ins; tests/e2e/res3_2026_10_26.py drives the real page at 390 and 1366.
//   R1 R2 G16  the results' cards grouped (different cards apart, copies stacked ×N), the seen cards in the same column, the column scrolls
//   R3         egg and baby cards (G13's one source), their reveal, Kibble's tip     R5  a new map is one banner    R6  the emblem's flight
//   R7         the rank ribbon top right    R8  the Arena's XP on its results; other XP on the first screen after the fight
//   R9 B1      the level track table and the Profile bar     B3  the Group Dungeon on Map 16 with its themed name
//   G5         field pills' tooltip and New!   G6  first-clear rewards greyed with ✓ once won   G10  the desktop window fit
//   G12        the deck editor's sizes   G15  packs of 3 (Collector 5) at the same price per card   G18  Forge tabs by map
'use strict';
const fs = require('fs'), path = require('path'), vm = require('vm');
const ROOT = path.join(__dirname, '..');
const src = fs.readFileSync(path.join(ROOT, 'arena_app.js'), 'utf8');
const tpl = fs.readFileSync(path.join(ROOT, 'arena_template.html'), 'utf8');
const texts = require(path.join(ROOT, 'bramblewood-texts.js'));
let fail = 0, n = 0; const ok = (c, m)=>{ n++; if(!c){ fail++; console.log('  ✗', m); } };
function fnSrc(name){
  let a = src.indexOf('\nfunction ' + name + '('); if(a < 0) return '';
  let i = src.indexOf('{', src.indexOf(')', a)), depth = 0;
  for(; i < src.length; i++){ const ch = src[i]; if(ch === '{') depth++; else if(ch === '}'){ depth--; if(!depth) break; } }
  return src.slice(a + 1, i + 1);
}
function constSrc(name){ const a = src.indexOf('\nconst ' + name + ' = '); if(a < 0) return ''; let i = src.indexOf('= ', a) + 2, d = 0;
  for(; i < src.length; i++){ const c = src[i]; if(c === '[' || c === '{') d++; else if(c === ']' || c === '}'){ d--; if(!d) break; } }
  return src.slice(a + 1, i + 1) + ';'; }
const esc = s=> String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');

// ---------------- R1 R2 G16: the fan ----------------
{ const fan = new Function('escapeAttr', fnSrc('res3FanHTML') + '\nreturn res3FanHTML;')(esc);
  const t = (key)=> ({key, name: key, html: `<div class="rw-card" data-k="${key}"></div>`, copy: `<i class="c-${key}"></i>`});
  const h = fan([t('a'), t('b'), t('a'), t('a'), t('a'), t('a'), t('c')], 'won');
  ok((h.match(/class="res3-g/g) || []).length === 3, 'R1. three different cards are three groups');
  ok(/aria-label="a ×5"/.test(h) && /<b class="res3-n" aria-hidden="true">×5<\/b>/.test(h) && (h.match(/class="res3-copy"/g) || []).length === 3, 'R1. five copies: one stack, three copy faces behind (capped), ×5');
  ok(h.indexOf('data-k="a"') < h.indexOf('data-k="b"') && h.indexOf('data-k="b"') < h.indexOf('data-k="c"'), 'R1. groups keep the order the cards came in');
  ok(/res3-fan-won/.test(h) && /style="--g:3"/.test(h), 'R1. the fan names its kind and group count'); }
{ const f = fnSrc('rewardsPanelHTML');
  ok(/res3FanHTML\(tiles, 'won'\)/.test(f) && /rw-seen-cards[^\n]*res3FanHTML\(tiles, 'seen'\)/.test(f), 'R2. Cards won and New cards seen use the same fan');
  ok(/cardSecs\.join\(''\)/.test(f) && /isCardSec = x=> x\.startsWith\('<div class="rw-sec rw-unlocks"'\) \|\| x\.startsWith\('<div class="rw-sec rw-seen-cards"'\)/.test(f), 'R2. ...in the same column (the cards half)');
  ok(/\.rw-panel \.rw-cards\.res3-fan[^{]*\{display:flex !important; flex-wrap:wrap !important;[^}]*gap:16px 22px !important;[^}]*max-height:min\(56vh, 520px\); overflow-y:auto;/.test(tpl), 'R1 G16. clear gaps, wrapping, then a vertical scroll');
  // R3
  ok(/res3EggId \? res3EggCardId\(m\.conquestEggDrop\)/.test(f) || /const res3EggId = m\.conquestEggDrop \? res3EggCardId\(m\.conquestEggDrop\) : null/.test(f), 'R3. an egg found is its egg card');
  ok(/const bi = babyRewardInfo\(m\.conquestBabyEarned\);[^\n]*escapeHtml\(bi\.icon\)[^\n]*results\.fix3-rescued-baby/.test(f) && /function res3BabyCardDef\(type\)\{\n  const bi = babyRewardInfo\(type\)/.test(src), 'R3 (G13 kept). the baby card takes its type, icon and name from babyRewardInfo');
  ok(/res3-nest-card is-egg/.test(f) && /res3-nest-card is-baby/.test(f) && /\.rw-card\.res3-nest-card\{/.test(tpl) && /const nests = \[\.\.\.document\.querySelectorAll\('\.rw-card\.res3-nest-card'\)\]/.test(fnSrc('rewardCardsReveal')), 'R3. their own colours and their own reveal');
  ok(!/class="hud-pill rw-baby"/.test(f) && /if\(m\.conquestEggDrop && !res3EggId\)/.test(f), 'R3. no baby pill and no egg chip beside the cards');
  ok(texts.TEXT['results.res3-kibble-tip'] === 'For nurturing cards in the Nest' && /TX\('results\.res3-kibble-tip'\)/.test(f), 'R3. Kibble: "For nurturing cards in the Nest"');
  // R5
  ok(/mapId:map\.id/.test(fnSrc('diffUnlocks')) && /res3MapBannerHTML\(id,/.test(f) && /fightsShown = \(m\.unlockedFights\|\|\[\]\)\.filter\(f=> !newMaps\.includes\(f\.mapId\)\)/.test(f), 'R5. a new map is one banner; its fights are not listed one by one');
  ok(/results\.res3-map-fights/.test(fnSrc('res3MapBannerHTML')) && /var\(--map-art, none\) center \/ cover/.test(tpl), 'R5. the banner: the map\'s art, name and "N fights"');
  // R7
  ok(/\.rw-panel \.res3-fan \.pl2-rr\{left:auto; right:-8px; top:-10px; bottom:auto;/.test(tpl), 'R7. the rank ribbon on the card\'s top right'); }

// ---------------- R6 R8 ----------------
ok(/window\.FX\.E\.nodeRankEmblem = res3RankEmblemFlight/.test(src) && /sx = -size/.test(fnSrc('res3RankEmblemFlight')) && /x: W - 46, y: H - 46/.test(fnSrc('res3RankEmblemFlight')), 'R6. the emblem comes in from the left; bottom right stays the fallback landing (2026-10-29 UI3: S3 lands it on its own fight first)');
{ const ARENA_FIGHT_MODES = new Set(['ai', 'pc', 'gauntlet', 'pvp', 'async', 'liveRanked']);
  const f = new Function('ARENA_FIGHT_MODES', fnSrc('pl1XpOnMap') + '\nreturn pl1XpOnMap;')(ARENA_FIGHT_MODES);
  ok(!f({mode:'ai'}) && !f({mode:'pvp'}) && f({mode:'conquest'}) && !f(null), 'R8. the Arena keeps its XP on its results; a Conquest fight\'s waits');
  ok(/const onMap = res3XpScreenReady\(\)/.test(fnSrc('pl1XpOnMapSoon')) && /setTimeout\(\(\)=>\{ try\{ pl2MapViewed\(\); \}catch\(e\)\{\} \}, 0\);/.test(fnSrc('switchTab')), 'R8. waiting XP plays on any screen after the fight (and after a reload)'); }

// ---------------- B1 R9: the level track ----------------
{ const ctx = {}; vm.createContext(ctx); vm.runInContext(constSrc('RES3_LEVEL_TRACK') + '\n' + fnSrc('res3LevelRewardsAt') + '\nthis.f = res3LevelRewardsAt;', ctx);
  const f = ctx.f, row = L=> f(L).join('+');
  ok(row(0) === '' && [1, 2, 3, 4].every(L=> row(L) === 'card'), 'B1. Level 0: nothing; Levels 1-4: a single card');
  ok(row(5) === 'card+faction', 'B1. Level 5: a single card and the first faction pack');
  // 2026-10-26 (package RES4, PROP1-2 approved): the steady level packs moved to the Trail Mix Trek; a pack only every fifth level now, Maple Leaves
  // + Dust between (was: Pack 1 and a faction pack alternating, Pack 2 from Level 15). tests/res4-2026-10-26.js checks the new rows in full.
  ok(row(6) === 'leaves' && row(10) === 'packT' && row(15) === 'faction' && row(20) === 'packT' && row(25) === 'faction', 'B1 (RES4). a pack only at 10 / 15 / 20 / 25, Maple Leaves + Dust between');
  const g = fnSrc('res3CheckLevelTrack');
  ok(/if\(!st\)\{ st = \{granted: L\}; res3SaveLevelTrack\(st\); return; \}/.test(g), 'B1. a save from before starts the track where it is (no back pay)');
  ok(/if\(!armouryOpen\(\)\)\{ holdPackForArmoury\(\{kind:'res3level'/.test(fnSrc('res3GrantLevelReward')) && /ref\.kind === 'res3level'\) res3GrantLevelReward/.test(fnSrc('releaseHeldPacks')), 'B1. before the Armoury, level rewards wait with the held packs');
  ok(/res3CheckLevelTrack\(\)/.test(fnSrc('refreshLevelBadge')), 'B1. a level up pays its rewards');
  ok(/\$\{res3LevelTrackHTML\(\)/.test(fnSrc('renderProfile')) && /\.res3-lt-now\{flex:0 0 25%;/.test(tpl), 'R9. the Profile bar: the level in the left quarter, the next levels and rewards to the right'); }

// ---------------- B3 ----------------
ok(/const GD_OPEN_AFTER_MAP = 16;/.test(src) && /get name\(\)\{ return gdThemedName\(\); \}/.test(src) && texts.TEXT[/GD_THEMED_NAME = \{hollow: '([^']+)'\}/.exec(src)[1]] === 'The Tidelock Vault', 'B3. the Group Dungeon on Map 16, by its themed name'); // 2026-10-26 (RES4, RES3-4): aqua-themed, was The Warren Heist
ok(/function dungeonsTabOpen\(\)\{ try\{ return dungeonsAdminView\(\); \}/.test(src), 'B3. the daily dungeons stay Admin-only');

// ---------------- G5 G6 ----------------
{ const f = fnSrc('skirmishFieldHTML');
  ok(/<span class="tp-tip" role="tooltip">\$\{pillTipHTML\(row\.name, \[tip\]\)\}<\/span>/.test(f) && !/title="\$\{escapeAttr\(tip\)\}"/.test(f), 'G5. the preview pills use the cream tooltip (no native title)');
  ok(/closest\('\.bf-pill, \.cnp-fpill'/.test(src) && /res3FieldNewHTML\(row\.key\)/.test(f) && /newKey \? res3FieldNewHTML\(newKey, newAlias\)/.test(fnSrc('bfPillHTML')), 'G5. a New! on unseen field effects, preview and board');
  const store = {}; const ls = {getItem: k=> store[k] || null, setItem: (k, v)=>{ store[k] = String(v); }};
  let seen = {frost: 3}; const now0 = Date.now();
  const nf = new Function('localStorage', 'fieldRowsSeen', 'matchState', 'fightSerial', 'escapeHtml', 'TX', "const RES3_FIELD_NEW_KEY = 'k', RES3_FIELD_NEW_MS = " + /RES3_FIELD_NEW_MS = (\d+);/.exec(src)[1] + ';\n' + fnSrc('res3FieldNewStore') + '\n' + fnSrc('res3FieldNewHTML') + '\nreturn res3FieldNewHTML;')(ls, ()=> seen, null, ()=> 1, esc, ()=> 'NEW!');
  ok(/res3-fnew/.test(nf('rain')) && /res3-fnew/.test(nf('rain')), 'G5. a field effect never shown: New! (and again within its few seconds)');
  ok(nf('frost') === '', 'G5. one that already happened in a fight: no New!');
  const o = JSON.parse(store.k); o.rain = now0 - 5000; store.k = JSON.stringify(o);
  ok(nf('rain') === '', 'G5. after its moment, never again'); }
{ const f = fnSrc('cnpRewardStripHTML');
  ok((f.match(/res3GotMark\(\)/g) || []).length >= 6 && /cnp-rw-cur \$\{done\?'is-got':''\}/.test(f), 'G6. every won first-clear reward (cards, items, packs, currencies) gets the ✓');
  ok(/\.conquest-node-panel \.cnp-rw \.cnp-rw-card\.is-got \.card-tile[^{]*\{filter:grayscale\(1\) brightness\(\.72\) !important;\}/.test(tpl), 'G6. ...and is greyed, cards as well as items'); }

// ---------------- G10 G12 ----------------
ok(/const RES3_FIT_MAX = 1\.45;/.test(src) && /wrap\.style\.setProperty\('--res3-fit'/.test(fnSrc('centreFieldInFs')) && /html\.is-desk-centre #appWrap\.in-match\{--match-card-h: min\(calc\(clamp\(104px, calc\(\(100dvh - 214px\) \/ 4\.55\), 149px\) \* var\(--res3-fit, 1\)\)/.test(tpl), 'G10. a desktop window grows the match to its height');
ok(/#myDeckList \.deck-stack\{width:clamp\(72px, 7\.4vw, 104px\);\}/.test(tpl) && /#myDeckPool\.pool-grid\{grid-template-columns:repeat\(auto-fill, minmax\(clamp\(112px, 11vw, 150px\), 1fr\)\)/.test(tpl), 'G12. the deck editor: bigger deck cards, a much bigger pool');

// ---------------- G15 G16 ----------------
{ const block = src.slice(src.indexOf('const SHOP_PACKS_DEFAULT = ['), src.indexOf('];', src.indexOf('const SHOP_PACKS_DEFAULT = [')) + 2);
  const packs = vm.runInNewContext(block.replace('const SHOP_PACKS_DEFAULT = ', '(').replace(/\];$/, '])'));
  const OLD = {bronze:{cards:3, gold:50, gems:0}, silver:{cards:5, gold:120, gems:10}, mystery:{cards:3, gold:80, gems:0}, gold:{cards:8, gold:250, gems:30}};
  packs.forEach(p=>{ const o = OLD[p.id];
    ok(p.cards === 3, `G15. ${p.name}: 3 cards`);
    ok(Math.abs(p.cost.gold - o.gold / o.cards * 3) <= 0.5 && Math.abs((p.cost.gems||0) - o.gems / o.cards * 3) <= 0.5, `G15. ${p.name}: ${p.cost.gold} + ${p.cost.gems||0} = the old price per card x 3`);
    if(p.collectorCost) ok(Math.abs(p.collectorCost.gold - o.gold * 12 / 10 * 5) <= 0.5 && Math.abs((p.collectorCost.gems||0) - o.gems * 12 / 10 * 5) <= 0.5, `G15. Collector ${p.name}: 5 cards at the old Collector price per card`); });
  const adv = new Function('TX', 'RES3_COLLECTOR_CARDS', fnSrc('advancedPackOf') + '\nreturn advancedPackOf;')(()=> 'C', 5)(Object.assign({}, packs[1]));
  ok(adv.cards === 5 && adv.mainCards === 5 && adv.cost.gold === packs[1].collectorCost.gold, 'G15. a Collector pack: 5 cards, all at 10x foil, its own price');
  ok(/#packOpenOverlay \.po2-table\{--tp:clamp\(86px, min\(10\.5vw, 17vh\), 150px\);/.test(tpl), 'G15. the x10 table\'s packs are larger');
  ok((src.match(/\$\{t\.n > 1 \? ' res3-pile' : ''/g) || []).length === 2 && /\.po2-all \.po2-sum-grid\.is-dense\{max-height:min\(62vh, 640px\); overflow-y:auto;/.test(tpl), 'G16. the packs\' summary stacks copies, then scrolls'); }

// ---------------- G18 ----------------
{ let reach = 11, admin = false;
  const ctx = {playerMapReach: ()=> reach, get adminModeEnabled(){ return admin; }, devModeEnabled: false};
  vm.createContext(ctx); vm.runInContext(constSrc('RES3_FORGE_TAB_MAP') + '\n' + "const RES3_FORGE_TAB_TEASED = new Set(['castles']);" + '\n' + fnSrc('res3ForgeTabOpen') + '\n' + fnSrc('res3ForgeTabShown') + '\nthis.o = res3ForgeTabOpen; this.s = res3ForgeTabShown;', ctx);
  // 2026-10-26 (package RES4, RES3-3): Fuse moved to Map 14, so Map 11 opens Upgrade alone (was Upgrade and Fuse)
  ok(ctx.o('upgrade') && !ctx.s('fuse') && !ctx.s('smith') && !ctx.s('enchant') && !ctx.s('refine'), 'G18. at Map 11 only Upgrade; the rest are not drawn');
  ok(ctx.s('castles') && !ctx.o('castles'), 'G18. Reinforce shows, locked ("?")');
  // 2026-10-26 (package RES4, RES3-3: "spread from Map 0 to 40"): the last tab (Socket) now opens on Map 34 (was Map 20)
  reach = 34; ok(['smith', 'raid', 'refine', 'castles', 'enchant', 'facility'].every(k=> ctx.o(k)), 'G18. by Map 34 every tab is earned');
  reach = 0; admin = true; ok(ctx.o('enchant'), 'G18. Admin sees every tab');
  ok(/filter\(k=> res3ForgeTabShown\(k\)\)\.map\(k=> !res3ForgeTabOpen\(k\) \? res3ForgeLockedTabHTML\(k\)/.test(fnSrc('renderForge')) && /if\(!res3ForgeTabOpen\(forgeMode\)\) forgeMode = 'upgrade';/.test(fnSrc('renderForge')), 'G18. the Forge draws them that way'); }

// ---------------- texts in 12 packs ----------------
{ const keys = Object.keys(texts.TEXT).filter(k=> /\.res3-/.test(k));
  ok(keys.length >= 15, 'texts: ' + keys.length + ' RES3 keys'); // 2026-10-26 (RES4): the dungeon's name moved to ui.res4-gd-hollow (was 16)
  ['fr', 'de', 'es', 'it', 'pt', 'tl', 'ta', 'id', 'zh-Hans', 'zh-Hant', 'ja', 'ko'].forEach(code=>{ const pack = JSON.parse(fs.readFileSync(path.join(ROOT, 'lang', code + '.json'), 'utf8'));
    const miss = keys.map(k=> texts.TEXT[k]).filter(en=> !(en in pack)); ok(!miss.length, `texts: ${code} has every RES3 text ${miss.slice(0, 3)}`); }); }

console.log(`res3: ${n - fail}/${n} passed`);
process.exit(fail ? 1 : 0);
