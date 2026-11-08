#!/usr/bin/env node
// 2026-11-08 (package UI35, owner 09:27 items 2, 3, 4, 6, 8):
// 1 NEW! counts the main progression only (an earlier main map's own list; side maps / Other / grey skills never introduce a skill), 2 the Map cards skills section is one list with pills,
// "N new" beside the heading, 3 "Thematic Recommendation" + the deck editor's Full art / Compact view, 4 the 📦 Packs button, 5 the SK / WK Map-reference line, 6 texts in 12 packs, 7 build and docs.
// Browser: tests/e2e/ui35_2026_11_08.py (Bloom on Sunken Hollow, both widths, screenshots in docs/screens/ui35/).
'use strict';
const fs = require('fs'), path = require('path'), vm = require('vm');
const ROOT = path.join(__dirname, '..');
const rd = f=> fs.readFileSync(path.join(ROOT, f), 'utf8'), J = f=> JSON.parse(rd(f));
let fail = 0, pass = 0; const ok = (c, m)=>{ if(!c){ fail++; console.log('  x', m); } else pass++; };
const CODES = ['de', 'es', 'fr', 'id', 'it', 'ja', 'ko', 'pt', 'ta', 'tl', 'zh-Hans', 'zh-Hant'];
const app = rd('arena_app.js'), texts = rd('bramblewood-texts.js'), tpl = rd('arena_template.html');
const fn = (src, name)=>{ const m = src.match(new RegExp('function ' + name + '\\([\\s\\S]*?\\n\\}\\n')); if(!m) throw new Error('no function ' + name); return m[0]; };

// ================= 1. NEW! counts the main progression only =================
{ const defs = {pb: {id: 'pb', effects: {armor: 1}}, side: {id: 'side', effects: {bloomCopy: true}}, sp: {id: 'sp', effects: {bloomCopy: true}}, lv: {id: 'lv', effects: {}, levelSkills: {3: {reach: true}}}, hollow: {id: 'hollow', effects: {bloomCopy: true, armor: 1}}};
  const SECS = {m3: [{key: 'cards', ids: ['pb', 'lv']}, {key: 'sub:x', ids: ['side']}, {key: 'special', ids: ['sp']}], m4: [{key: 'cards', ids: ['hollow']}]};
  const ctx = {mainConquestMaps: ()=> [{id: 'm3'}, {id: 'm4'}], mapNumberOf: id=> ({m3: 3, m4: 4})[id], mapPoolSections: id=> SECS[id],
    ui18CardSkillKeys: d=> [...Object.keys(d.effects).map(k=> ({key: k, lvl: 0})), ...Object.entries(d.levelSkills || {}).flatMap(([L, o])=> Object.keys(o).map(k=> ({key: k, lvl: +L})))],
    ui28SkillMeet: (r, defs2, n)=>{ let met = false; r.ids.forEach(id=>{ const x = ctx.ui18CardSkillKeys(defs2[id]).find(q=> q.key === r.key); if(x && x.lvl === 0) met = true; }); return {met, lvl: 0}; }};
  vm.createContext(ctx);
  vm.runInContext(fn(app, 'ui19McSkillRows') + fn(app, 'ui19McEarlierSkillKeys') + '\nthis.api = {ui19McEarlierSkillKeys};', ctx);
  const early = [...ctx.api.ui19McEarlierSkillKeys('m4', defs, ()=> true)].sort().join();
  ok(early === 'armor', 'a skill on an earlier map\'s side list or SPECIAL (Bloom on the side card) does not introduce it, a later-level-only skill (Reach) neither: ' + early);
  ok(!ctx.api.ui19McEarlierSkillKeys('m3', defs, ()=> true).size, 'the first main map has no earlier maps');
  ok(/secs\.filter\(s=> s\.key === 'cards'\)/.test(fn(app, 'ui19McEarlierSkillKeys')), 'only the MAP section (key cards) of an earlier main map counts'); }

// ================= 2. one list with pills =================
{ const f = fn(app, 'ui19McSkillsHTML');
  ok(!/hd\('main'/.test(f) && !/hd\('rec'/.test(f) && !/hd\('counters'/.test(f) && /hd\('other', flaggedOther\.length\)/.test(f), 'no Main / Recommended / Counters headings; Other keeps its own');
  ok(/\$\{flaggedMain\.map\(li\)\.join\(''\)\}\$\{ctrTiles\}\$\{kwMissing\}\$\{suggTiles\}\$\{recs\.map\(rli\)\.join\(''\)\}\$\{pickTiles\}\$\{hd\('other'/.test(f), 'one <ul>: Main, Counters, keyword, Sugg. Intro, recommendations, picks, then Other');
  ok(/r\.outside \? '' : pill\('main', 'ui\.ui35-pill-main'/.test(f), 'a Main tile wears the Main pill (Other tiles do not)');
  ok((f.match(/sugPill\(/g) || []).length >= 3, 'recommendation, keyword and pick tiles wear the Suggested pill');
  ok(/class="ui35-newn/.test(f) && /ui35-new-count/.test(f) && /flaggedMain\.filter\(r=> r\.isNew\)/.test(f), '"N new" beside the heading counts the NEW! tiles of the main list');
  ok(/isNew: isMain && mt\.met/.test(f), 'NEW! only on the main list');
  ok(/ui35-pill is-counter/.test(fn(app, 'ui34CounterTileHTML')) && /ui34-cn/.test(fn(app, 'ui34CounterTileHTML')), 'a counter tile wears the Counter pill and keeps its count');
  // rendered
  const S = {bloomCopy: {key: 'bloomCopy', label: 'Bloom', desc: ()=> 'grows'}, armor: {key: 'armor', label: 'Armor', desc: ()=> 'armor'}, flying: {key: 'flying', label: 'Flying', desc: ()=> 'fly'}};
  const defs = {a: {id: 'a', effects: {bloomCopy: true, armor: 1}}, b: {id: 'b', effects: {armor: 1}}, o: {id: 'o', effects: {flying: true}}};
  const TXS = {'ui.ui19-mc-new': 'NEW!', 'ui.ui35-pill-main': 'Main', 'ui.ui35-new-count': '{n} new'};
  const c = {ui18CardSkillKeys: d=> Object.keys(d.effects).map(k=> ({key: k, lvl: 0})), skillDefOf: k=> S[k], skillText: (p, v)=> p.desc(v), SKILL_ICON: {}, escapeHtml: s=> String(s), escapeAttr: s=> String(s),
    TX: (k, v)=> (TXS[k] || k).replace(/\{(\w+)\}/g, (m, n)=> v && v[n] != null ? v[n] : m), mapNumberOf: id=> ({m0: 0, m1: 1})[id], mainConquestMaps: ()=> [{id: 'm0'}, {id: 'm1'}],
    mapPoolSections: id=> [{key: 'cards', ids: id === 'm0' ? ['b'] : []}, {key: 'sub:s', ids: id === 'm0' ? ['a'] : []}]};
  vm.createContext(c); vm.runInContext(['ui19McSkillRows', 'ui19McEarlierSkillKeys', 'ui19McSkillText', 'ui19McSkillsHTML'].map(n=> fn(app, n)).join('\n') + '\nthis.api = {ui19McSkillsHTML};', c);
  const html = c.api.ui19McSkillsHTML('m1', ['a', 'b'], defs, ()=> true, 'm1', ['o']);
  ok(/data-ui19-skill="bloomCopy"[^>]*>[\s\S]*?Bloom<\/b>[\s\S]*?ui35-pill is-main[\s\S]*?NEW!/.test(html), 'rendered: Bloom (on the side list of the earlier map only) is NEW! on the next main map');
  ok(!/data-ui19-skill="armor"[^>]*>[^]*?NEW![^]*?<\/li>/.test(html.replace(/data-ui19-skill="bloomCopy"[\s\S]*?<\/li>/, '')), 'rendered: Armor (on an earlier main list) is not NEW!');
  ok(/data-ui35-new="1"[^>]*>1 new</.test(html), 'rendered: the heading says "1 new"');
  ok((html.match(/ui32-sk-head/g) || []).length === 1 && /ui32-sk-head is-other/.test(html) && /data-ui19-skill="flying"[\s\S]*$/.test(html.split('ui32-sk-head')[1]), 'rendered: only the Other heading; Flying sits under it with no Main pill and no NEW!');
  ok(!/is-new[^>]*data-ui19-skill="flying"/.test(html), 'rendered: a skill of the Other group is never NEW!'); }

// ================= 3. Thematic Recommendation and the deck editor views =================
ok(/"ui\.ui22-claude-title": "Thematic Recommendation"/.test(texts) && !/Recommended by Claude/.test(texts), 'the section is called Thematic Recommendation');
{ const store = {}; let throwing = false;
  const c = {localStorage: {getItem: k=> { if(throwing) throw new Error('blocked'); return store[k] == null ? null : store[k]; }, setItem: (k, v)=> { if(throwing) throw new Error('blocked'); store[k] = String(v); }},
    escapeAttr: s=> String(s), escapeHtml: s=> String(s), TX: (k, v)=> k + (v ? JSON.stringify(v) : ''), lookLabel: ()=> 'Shiny', cardChipHTML: (d, o)=> `<span class="card-chip" data-nodefid="${o.noDefid ? 1 : 0}"><span class="cc-disc"></span>${d.name}</span>`,
    ownedCopiesOf: id=> id === 'inf' ? Infinity : 4, neDeckUsed: id=> id === 'two' ? 2 : 0, neDeckFull: id=> id === 'full', myDeckCounts: {two: 2}};
  vm.createContext(c);
  const src = app.match(/\/\/ UI35_DECKVIEW:START[\s\S]*?\/\/ UI35_DECKVIEW:END/)[0].replace(/^let deckCardView/m, 'var deckCardView').replace(/^const UI35_DECK_VIEW_KEY/m, 'var UI35_DECK_VIEW_KEY');
  vm.runInContext(src + '\nthis.api = {ui35SetDeckView, ui35DeckViewBarHTML, ui35DeckChipHTML, ui35PoolTileHTML, view: ()=> deckCardView};', c);
  ok(c.api.view() === 'full', 'the deck editor starts in Full art');
  const bar = c.api.ui35DeckViewBarHTML(); ok(/data-ui35-view="full" aria-pressed="true"/.test(bar) && /data-ui35-view="compact" aria-pressed="false"/.test(bar), 'the switch has Full art and Compact, Full pressed');
  c.api.ui35SetDeckView('compact'); ok(c.api.view() === 'compact' && store['bramblewood_deck_cardview_v1'] === 'compact', 'Compact is remembered (localStorage key bramblewood_deck_cardview_v1)');
  ok(/aria-pressed="true">ui\.ui35-view-compact/.test(c.api.ui35DeckViewBarHTML()), 'the bar follows the view');
  throwing = true; c.api.ui35SetDeckView('full'); ok(c.api.view() === 'full', 'blocked storage does not throw: the view still switches');
  const chip = c.api.ui35DeckChipHTML('bee', {name: 'Bee Drone'}, '', 3);
  ok(/class="dchip ui35-dchip /.test(chip) && /data-defid="bee"/.test(chip) && /ui35-n">×3</.test(chip) && /class="dchip-minus" data-minus="bee"/.test(chip) && /cc-disc/.test(chip), 'a deck chip: circle + name, x 3, the - corner, the handlers\' .dchip and data-defid');
  const look = c.api.ui35DeckChipHTML('bee', {name: 'Bee Drone'}, 'shiny', 1); ok(/data-look="shiny"/.test(look) && /data-minus-look="shiny"/.test(look) && /look-tag/.test(look), 'a Shiny copy is its own chip');
  const tile = c.api.ui35PoolTileHTML('x', {x: {name: 'Ant'}}); ok(/<button type="button" class="ui35-pool-tile/.test(tile) && /ui35-n">×4</.test(tile) && /data-defid="x"/.test(tile) && !/is-spent/.test(tile), 'a pool chip is a button with the copies left (x 4)');
  ok(/ui35-n">×2</.test(c.api.ui35PoolTileHTML('two', {two: {name: 'Two'}})) && /has-in/.test(c.api.ui35PoolTileHTML('two', {two: {name: 'Two'}})), 'copies left = owned - in the deck; a card already in the deck is ringed');
  ok(/is-spent ne-full/.test(c.api.ui35PoolTileHTML('full', {full: {name: 'F'}})) && /∞/.test(c.api.ui35PoolTileHTML('inf', {inf: {name: 'I'}})), 'a full card is greyed; unlimited copies read x infinity'); }
{ const r = fn(app, 'renderMyDeckPanels');
  ok(/compact \? ui35PoolTileHTML\(id, defs\) : neDeckPoolStackHTML\(id, defs\)/.test(r) && /compact \? ui35DeckChipHTML\(id, defs\[id\], look, k\)/.test(r), 'renderMyDeckPanels draws chips in Compact and the stacks otherwise');
  ok(/#myDeckPool \.ui35-pool-tile'\)\.forEach/.test(r) && /deckCardClick\(e, id, myDeckCounts, '#myDeckPool', '#myDeckList', fast\(id\), true\)/.test(r) && /shiftKey:true/.test(r), 'a pool chip: click adds, right-click takes out (Shift+click through deckCardClick)');
  ok(/#myDeckPool \.card-tile:not\(\.locked\), #myDeckPool \.ui35-pool-tile'\)/.test(r), 'the chips drag onto the deck like the cards');
  ok(/if\(deckCardView === 'compact'\) return false;/.test(fn(app, 'tentQuickCount')), 'Compact redraws on a count change (the in-place count is for the stacks)');
  ok(/ui35DeckViewBarHTML\(\)/.test(fn(app, 'renderPlayerSubTab')) && /data-ui35-view\]'\)\.forEach/.test(fn(app, 'renderPlayerSubTab')), 'the switch sits in the deck toolbar and is wired'); }

// ================= 4. the Packs button =================
{ ok(/id="cnpMapCards"[^>]*>[^<]*<\/button><button type="button" class="btn small ghost" id="cnpPacks"/.test(app.replace(/\$\{escapeHtml\(TX\('ui\.pk1-map-cards-btn'\)\)[^}]*\}/, 'X')), '📦 Packs is the next button right after 🃏 Map cards');
  ok(/getElementById\('cnpPacks'\)[\s\S]{0,200}ui29OpenPackEditor\(ui29KeyForMap\(map\.id\)\)/.test(app) && /ui29OpenPackEditor\(ui29KeyForMap\(map\.id\)\)/.test(app.match(/on\('mlPacks'[^\n]*/)[0]), 'it calls the 🚨 bar\'s handler (ui29OpenPackEditor of this map\'s pack)'); }

// ================= 5. the SK / WK Map-reference line =================
{ const MARKS = {rule: {band: [0.15, 0.30], skEasy: 0.85, wkStrong: 0.5}, generated: '2026-11-07T07:19:10.988Z', marks: {'0-SK': {win: 0.154, mapRef: 0.65, flag: null}, '9-SK': {win: 0.2, mapRef: 0.9, flag: 'weak', flagRef: 0.95}, '0-WK': {win: 0.07, mapRef: 0.4, flag: 'strong', flagRef: 0.4}}};
  const c = {adminModeEnabled: true, BAL24_PRO_MARKS: MARKS, escapeHtml: s=> String(s), escapeAttr: s=> String(s), TX: (k, v)=> k + (v ? JSON.stringify(v) : '')};
  vm.createContext(c); vm.runInContext(['bal24Mark', 'bal24PillHTML', 'bal24WinLineHTML', 'bal24RefLineHTML'].map(n=> fn(app, n)).join('\n') + '\nthis.api = {bal24WinLineHTML};', c);
  const sk = c.api.bal24WinLineHTML('0-SK', false), wk = c.api.bal24WinLineHTML('0-WK', true), hot = c.api.bal24WinLineHTML('9-SK', false);
  ok(/data-ref-pct="65"/.test(sk) && /ui\.ui35-ref-sk\{"pct":65\}/.test(sk) && /ui\.ui35-ref-cut-sk\{"cut":85\}/.test(sk) && /2026-11-07/.test(sk) && /data-flag=""/.test(sk), 'N-SK: the Map reference win % (65), its cut (too weak above 85) and the day it was measured');
  ok(/ui\.ui35-ref-wk\{"pct":40\}/.test(wk) && /ui\.ui35-ref-cut-wk\{"cut":50\}/.test(wk) && /data-flag="strong"/.test(wk) && /ui\.ui35-ref-worst\{"pct":40\}/.test(wk), 'N-WK: the win % (40), its cut (too strong below 50), flagged, the worst deck');
  ok(/data-flag="weak"/.test(hot) && /ui\.ui35-ref-worst\{"pct":95\}/.test(hot) && /bal24-pill/.test(hot), 'a flagged SK keeps the pill and adds the worst deck (95)');
  ok(/PRO decks win|ui\.bal24-pro-win/.test(sk), 'the PRO decks\' own win % line is still there'); }

// ================= 6. texts =================
const KEYS = ['ui.ui35-view-label', 'ui.ui35-view-full', 'ui.ui35-view-compact', 'ui.ui35-pool-left', 'ui.ui35-pool-how', 'ui.ui35-pill-main', 'ui.ui35-pill-main-tip', 'ui.ui35-pill-counter', 'ui.ui35-pill-counter-tip',
  'ui.ui35-new-count', 'ui.ui35-new-count-tip', 'ui.ui35-ref-sk', 'ui.ui35-ref-wk', 'ui.ui35-ref-cut-sk', 'ui.ui35-ref-cut-wk', 'ui.ui35-ref-worst', 'ui.ui35-ref-tip', 'ui.ui22-claude-title'];
const phs = s=> (s.match(/\{\w+\}/g) || []).sort().join(',');
const core = t=> t.trim().replace(/^[\s \p{Extended_Pictographic}️‍]+/u, '');
const packs = {}; CODES.forEach(c=> packs[c] = J('lang/' + c + '.json'));
KEYS.forEach(k=>{ const m = texts.match(new RegExp('"' + k.replace(/\./g, '\\.') + '": "((?:[^"\\\\]|\\\\.)*)"')); ok(!!m, `TX key ${k} exists`); if(!m) return;
  const en = JSON.parse('"' + m[1] + '"');
  CODES.forEach(c=>{ const t = packs[c][core(en)]; ok(typeof t === 'string' && t.length > 0 && (t !== core(en) || k === 'ui.ui35-view-compact'), `lang/${c}.json translates ${k}`); if(t) ok(phs(t) === phs(en), `lang/${c}.json keeps the placeholders of ${k} (${phs(en)})`); }); });
{ const used = [...new Set([...app.matchAll(/'(ui\.ui35-[a-z-]+)'/g)].map(m=> m[1]))], have = new Set(KEYS);
  ok(used.length > 10 && used.every(k=> have.has(k)), 'every ui35 key the page uses is in the tested list ' + used.filter(k=> !have.has(k)).join(',')); }

// ================= 7. build, docs, tests =================
ok(/\.ui35-pill\.is-counter/.test(tpl) && /\.ui35-newn\.has-new/.test(tpl) && /#myDeckPool\.pool-grid\.ui35-cmp/.test(tpl) && /\.ui35-pool-tile\.is-spent/.test(tpl) && /\.bal24-refline/.test(tpl), 'CSS: pills, the N new count, the Compact deck view, the reference line');
ok(/@media \(max-width:520px\)\{ \.pk1-mc-overlay \.ui19-sk-list\{grid-template-columns:1fr;\}/.test(tpl), 'CSS: one column of tiles on a phone (a tile with three pills does not fit half a phone)');
ok(/^## 2026-11-08 Package UI35/m.test(rd('docs/CHANGELOG.md')), 'CHANGELOG entry');
ok(/tests\/ui35-2026-11-08\.js/.test(rd('tests/run-all.sh')), 'tests/run-all.sh lists this test');
ok(fs.existsSync(path.join(ROOT, 'tests/e2e/ui35_2026_11_08.py')) && ['mapcards-skills-1366', 'mapcards-skills-390', 'deck-compact-1366', 'deck-compact-390', 'sk-details-1366', 'sk-details-390'].every(n=> fs.existsSync(path.join(ROOT, 'docs/screens/ui35/' + n + '.png'))), 'the browser check and its screenshots exist');
console.log(`ui35: ${pass} passed, ${fail} failed`); process.exit(fail ? 1 : 0);
