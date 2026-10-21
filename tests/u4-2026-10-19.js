#!/usr/bin/env node
// 2026-10-19 (package U4, the owner's UI notes 23:20 / 23:34 / 23:44):
//   1. "The show unseen and all by ID, -> should show a tick or not if enabled or not - can't tell." -> the Codex's switches
//      (.u4-switch, role="switch"): an empty box off, a gold ✓ box on, the pill ringed; set filter selects ringed (.u4-set); chosen
//      single-choice chips carry a ✓.
//   2. "there should be a forge shortcut in the top right corner of the screen, together with arena and home. Home of course comes
//      first." -> #forgeNavBtnPlay (🔨) right after Home and Arena in the Play cluster, TX labels.
//   3. "skirmish editor - sort by advancement option as well." -> the deck popup's Sort: Advancement (advancementKey), kept per device.
// Static and function checks; the browser half is tests/e2e/u4_2026_10_19.py (Playwright, 360 / 390 / 1366).
'use strict';
const fs = require('fs'), path = require('path');
const ROOT = path.join(__dirname, '..');
const B = require('../tools/lib_bramble.js');
const {TEXT} = require('../bramblewood-texts.js');
const src = fs.readFileSync(path.join(ROOT, 'arena_app.js'), 'utf8');
const tpl = fs.readFileSync(path.join(ROOT, 'arena_template.html'), 'utf8');
let fail = 0, n = 0; const ok = (c, m)=>{ n++; if(!c){ fail++; console.log('  ✗', m); } };
const u4 = (tpl.match(/<style id="u4Styles">([^]*?)<\/style>/) || [])[1] || '';
ok(u4.length > 0, 'the U4 style block is there');

// ---- 1. switches and active states
const rc = B.grab('renderCodex');
for(const id of ['cxShowUnseen', 'cxFlatById', 'cxShowTest'])
  ok(new RegExp(`<label class="cx-test-toggle u4-switch \\$\\{[^}]+\\? 'is-on' : ''\\}"[^>]*><input type="checkbox" role="switch" id="${id}"`).test(rc), `1. ${id} is a switch with its on class`);
ok(/u4WireToggles\(document\.getElementById\('codexToolbar'\)\)/.test(rc), '1. the Codex toolbar wires its switches and filters');
ok(/u4WireToggles\(body\.querySelector\('\.ux2-br-bar'\)\)/.test(B.grab('wireBramblesTab')), '1. the Brambles bar too (Owned / Not owned)');
ok(/\.codex-toolbar \.u4-switch input\[type=checkbox\]\{flex:none; min-width:0; width:18px; height:18px;/.test(u4), '1. the box is 18 px, not the 160 px text pill');
ok(/input\[type=checkbox\]::after\{content:'✓';[^}]*opacity:0;/.test(u4) && /:checked::after\{opacity:1;/.test(u4), '1. a ✓ only when on');
ok(/\.u4-switch\.is-on, \.codex-toolbar \.u4-switch:has\(input:checked\)\{background:#f1da98; color:#2b1d10;/.test(u4), '1. the pill: opaque light gold with dark ink while on (readable on the dark page)');
ok(/select\.u4-set\{border-color:#e0b85a !important; box-shadow:0 0 0 2px/.test(u4), '1. a set filter wears the gold ring');
ok(/\.ux-kind\.on::before, \.ux-lv\.on::before, \.forge-chip\.on::before, \.cx-sk-chip\[aria-pressed="true"\]::before\{content:'✓';/.test(u4), '1. chosen chips carry a ✓');
{ const F = new Function(B.grab('U4_FILTER_SELECTS') + '\n' + B.grab('u4MarkSelect') + '\nreturn {U4_FILTER_SELECTS, u4MarkSelect};')();
  ok(['cxArch', 'cxAnimal', 'cxPhylum', 'cxRarity', 'cxMechLine', 'brFx', 'brOwn'].every(id=> F.U4_FILTER_SELECTS.includes(id)) && !F.U4_FILTER_SELECTS.includes('cxSort'), '1. the filters (not the sorts) are marked');
  const cls = new Set(), sel = i=> ({options:[1, 2, 3], selectedIndex:i, classList:{toggle:(c, on)=> on ? cls.add(c) : cls.delete(c)}});
  F.u4MarkSelect(sel(2)); const a = cls.has('u4-set'); F.u4MarkSelect(sel(0));
  ok(a && !cls.has('u4-set'), '1. u4MarkSelect: set past "All" = ringed, back on "All" = not'); }

// ---- 2. the Forge in the cluster
const rp = B.grab('renderPlay');
ok(/id="homeNavBtnPlay"[^]*?id="arenaNavBtnPlay"[^]*?id="forgeNavBtnPlay"[^]*?dungeonKeyBtnHTML\('dungeonKeyBtnPlay'\)[^]*?id="settingsBtnPlaySub"[^]*?id="energyPillPlay"/.test(rp), '2. Home, Arena, Forge, then the key, ⚙️ and Energy');
ok(/\$\{tabOpen\('forge'\) \? `<button class="home-nav-btn" id="forgeNavBtnPlay" type="button" title="\$\{escapeAttr\(TX\('ui\.place-forge'\)\)\}" aria-label="\$\{escapeAttr\(TX\('ui\.place-forge'\)\)\}"><span class="tab-emoji" aria-hidden="true">🔨<\/span> \$\{escapeHtml\(TX\('ui\.u4-forge'\)\)\}<\/button>`/.test(rp), '2. the 🔨 Forge once the Forge is open, TX title / label');
ok(/forgeBtn\.addEventListener\('click', \(\)=>\{ try\{ SoundKit\.woodKnock\(\); \}catch\(e\)\{\} exitConquestImmersive\(\); codexSubTab = 'forge'; switchTab\('codex'\); \}\)/.test(rp), '2. it goes to the Forge like the page bar\'s shortcut');
ok(/id="arenaNavBtnPlay" type="button" title="\$\{escapeAttr\(TX\('ui\.u4-arena-tip'\)\)\}"/.test(rp) && /TX\('ui\.u4-arena-back'\)/.test(rp) && !/id="arenaNavBtnPlay" type="button" title="(?:The Arena|Back to the Arena)"/.test(rp), '2. the Arena button\'s texts are TX keys now');

// ---- 3. the deck popup's Advancement sort
const dp = B.grab('openDeckBuilderPopup');
// 2026-10-21 (package TX): the popup's sort is the Codex filter bar's (cfBarHTML; it marks the current sort), with Advancement added
ok(/cfBarHTML\(cf, 'dbp', null, \[\['advance', \(\)=> TX\('ui\.u4-sort-advance'\)\]\]\)/.test(dp) && /sel===k\?'selected':''/.test(B.grab('cfSortOptionsHTML')), '3. Sort: Advancement is offered, the current sort selected');
ok(/try\{ const v = localStorage\.getItem\('bramblewood_dbp_sort_v1'\);/.test(dp) && /try\{ uiStickySave\('dbpTx', cf\); localStorage\.setItem\('bramblewood_dbp_sort_v1', cf\.sort\); \}catch\(e\)\{\}/.test(dp), '3. kept per device (in try/catch)');
{ const defs = {a:{name:'A', cost:3, k:'0'}, b:{name:'B', cost:1, k:'100020000003'}, c:{name:'C', cost:2, k:'100010000005'}, d:{name:'D', cost:1, k:'100011000000'}, e:{name:'E', cost:0, k:'9'}};
  const S = new Function('getCardDefs', 'advancementKey', B.grab('dbpAdvanceSortFn') + '\nreturn dbpAdvanceSortFn;')(()=> defs, d=> d.k);
  ok(Object.keys(defs).sort(S()).join('') === 'acdbe', '3. Base, Map 1 (its side map after it), Map 2, then the rest'); }

// ---- texts and packs
const KEYS = ['ui.u4-arena', 'ui.u4-arena-tip', 'ui.u4-arena-back', 'ui.u4-forge', 'ui.u4-sort-advance'];
KEYS.forEach(k=> ok(typeof TEXT[k] === 'string' && src.includes(`'${k}'`), `TX ${k} is in the table and used`));
for(const c of ['fr', 'de', 'es', 'it', 'pt', 'tl', 'ta', 'id', 'zh-Hans', 'zh-Hant', 'ja', 'ko']){
  const pack = JSON.parse(fs.readFileSync(path.join(ROOT, 'lang', c + '.json'), 'utf8'));
  const miss = KEYS.concat(['ui.place-forge']).map(k=> TEXT[k]).filter(en=> !(typeof pack[en] === 'string' && pack[en]));
  ok(!miss.length, `lang/${c}.json translates the U4 texts (${miss.join(' | ')})`);
}
ok(/^## 2026-10-19 \(package U4: /m.test(fs.readFileSync(path.join(ROOT, 'docs', 'CHANGELOG.md'), 'utf8')), 'CHANGELOG entry');
console.log(fail ? `u4-2026-10-19: ${fail} of ${n} failed` : `u4-2026-10-19: all ${n} passed`);
process.exit(fail ? 1 : 0);
