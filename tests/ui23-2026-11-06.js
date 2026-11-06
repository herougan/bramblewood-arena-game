#!/usr/bin/env node
// 2026-11-06 (package UI23, owner 11-06 20:28 / 20:29 / 20:40 / 20:44): static and engine checks for the package's items.
//   4 the card editor: the Species field closes (every later section used to sit inside the Identity grid), a fight copy edits its own card,
//     the Costs row, the wide modal with a fixed preview column and a sticky footer
//   1/18 the heart is Health + Shield and blue while any is left; the engine: damage takes the Shield first, Bleed and Poison ticks skip it
//   2 Undead Health is grey; 7 no leader banner text or gold band; 8 an open settings panel stays open across the HUD's re-render
//   9 a reference fight's BR is the dealt deck's; 13/34/38 NEW! (never seen) and GET! (first copy); 15 a level's card is not a pack
//   16 the Dark-blind pip; 17 Effects in the fight's settings, Medium shakes softer; 19 the dark overlay by field effect; 25 no 0x0 anchors
//   27 the results' packs (left column, stack and count, tip, no "Map reward"), the achievement toast, open-all width; 29 the speed gates
//   30 the emblem pops from its node; 31 skill tips say N; 33 the Delivery pip; 35 the showcase without captions; 37 no dusk bars, straight rays
//   39 the map title comes back after 3 s; ENG23-4 b Delivery "?" on Map 0; ENG23-6 the Larder's feed slot
// The browser check is tests/e2e/ui23_2026_11_06.py (screens in docs/screens/ui23/).
'use strict';
const fs = require('fs'), path = require('path');
const ROOT = path.join(__dirname, '..'), R = f=> fs.readFileSync(path.join(ROOT, f), 'utf8');
const H = require('./lib/harness.js'), E = H.Engine;
let fail = 0, n = 0; const ok = (c, m)=>{ n++; if(!c){ fail++; console.log('  ✗', m); } };
const app = R('arena_app.js'), tpl = R('arena_template.html'), texts = R('bramblewood-texts.js');
const fnSrc = name=>{ const i = app.indexOf('function ' + name + '('); if(i < 0) return ''; let d = 0, j = app.indexOf('{', i); for(let k = j; k < app.length; k++){ if(app[k] === '{') d++; else if(app[k] === '}'){ d--; if(!d) return app.slice(i, k + 1); } } return ''; };

// ---- 4 the editor
ok(/list\(cur\[1\]\)\}<\/select>`; \}\)\(\)\}<\/div><\/div>/.test(app), '4: the Species field closes both its divs');
ok(/if\(d && d\.derivedFrom\) defId = d\.derivedFrom;/.test(fnSrc('openCardEditor')), '4: a fight copy ("@lv", "~cp") opens its own card in the editor');
ok(/TX\('ui\.ui23-costs'\)/.test(app) && /"ui\.ui23-costs": "Costs"/.test(texts), '4: the Costs heading');
ok(/#editorOverlay \.modal\.has-ce-side\{width:min\(95vw, 1400px\)/.test(tpl) && /#editorOverlay \.ce-body > \.ce-side\{flex:0 0 300px; width:300px;\}/.test(tpl) && /#editorOverlay \.modal-actions #btnDelete\{margin-right:auto;\}/.test(tpl), '4: wide modal, 300 px preview, Delete left in the footer');

// ---- 1/18 heart, engine
{ const heart = new Function(fnSrc('vis3ShieldAmount') + fnSrc('ui23HeartOf') + 'return ui23HeartOf;')();
  ok(heart({hp: 1, shield: 4}) === 5 && heart({hp: 3, shield: 2}) === 5 && heart({hp: 1, shield: 0}) === 1 && heart({hp: 2, shield: 1, tempHp: 2}) === 5, '1/18: the heart is Health + Shield (with Shell / Bolster temporary Health)'); }
ok(/vis3ShieldAmount\(c\) > 0 \? 'has-shield'/.test(app) && /\.board-card\.has-shield \.stats \.hp i\.sg\{filter:hue-rotate/.test(tpl), '1/18: blue heart while any Shield is left');
{ const U = (id, effects)=> ({id, name: id, attack: 0, health: 10, wait: 5, cost: 0, effects: effects || {}});
  const defs = Object.assign({}, H.loadCardDefs(), {'ui23-w': U('ui23-w')}), so = id=> id === 1 ? 'A' : 'B';
  const mk = ()=>{ const e = E.makeSimEngine(defs, E.mulberry32(3), {recordEvents: true, battleMode: 'open', rules: {}}); const P = {1: e.newPlayer(1, {}), 2: e.newPlayer(2, {})};
    e.debugSpawnCard(P, so, 1, 'ui23-w', 'left', {}, []); return {e, c: [...P[1].row.left, ...P[1].row.center, ...P[1].row.right].find(x=> x.defId === 'ui23-w')}; };
  { const {e, c} = mk(); c.shield = 4; c.hp = 10; e.damageCardFlat(c, 3, 'physical'); ok(c.shield === 1 && c.hp === 10, `18: a hit takes the Shield first (shield ${c.shield}, hp ${c.hp})`); }
  { const {e, c} = mk(); c.shield = 4; c.hp = 10; e.damageCardFlat(c, 2, 'bleed'); ok(c.shield === 4 && c.hp === 8, `18: a Bleed tick skips the Shield (shield ${c.shield}, hp ${c.hp})`); }
  { const {e, c} = mk(); c.shield = 4; c.hp = 10; e.damageCardFlat(c, 2, 'poison'); ok(c.shield === 4 && c.hp === 8, `18: a Poison tick skips the Shield (shield ${c.shield}, hp ${c.hp})`); } }

// ---- 2, 7, 8, 9
ok(/function ui23Unhealth\(d\)/.test(app) && /\.card-tile \.stats \.hp\.is-unhealth\{color:#b9bcc0/.test(tpl), '2: Undead Health is grey');
ok(/w\.innerHTML = `<i class="vis5-lead-shock"><\/i>`;/.test(app) && /enemy-leader-banner leader-callout sr-only/.test(app), '7: no gold band, the banner only for screen readers');
ok(/if\(SETTINGS_OPEN\.has\(idSuffix\)\) open\(\);/.test(app) && /SETTINGS_OPEN\.clear\(\);/.test(fnSrc('closeAnyOpenSettingsPanel')), '8: an open settings panel is reopened after a re-render; outside clicks still close it');
ok(/m\.refDeck/.test(fnSrc('ui23MyBR')) && (app.match(/ui23MyBR\(\)/g) || []).length >= 3, '9: the versus BR chips read the dealt reference deck');

// ---- 13/34/38, 15, 16, 17
{ const tags = new Function('escapeHtml', 'TX', fnSrc('ui23CardTagsHTML') + 'return ui23CardTagsHTML;')(s=> s, k=> k === 'results.new' ? 'NEW!' : 'GET!');
  const both = tags(true, true, 'x'), got = tags(false, true, 'x'), none = tags(false, false, 'x');
  ok(/NEW!.*GET!/.test(both) && /ui23-late/.test(both) && !/NEW!/.test(got) && /GET!/.test(got) && !/ui23-late/.test(got) && none === '', '13/34/38: NEW! then GET! on top; GET! alone; nothing for a seen, owned card'); }
ok(/m\._ui23Seen \? new Set\(wonIds\.filter\(id=> !m\._ui23Seen\.has\(id\)\)\)/.test(app) && /seenNew = !seenCardIds\(\)\.has\(id\)/.test(app), '13: NEW! is "never seen before" (match snapshot; packs read it before the grant)');
ok(/if\(k === 'card'\)\{ ui23LevelCardShown\(o\.results \|\| \[\], L\); return; \}/.test(app), '15: a level\'s single card goes to the results, never a pack');
ok(/function ui23DarkBlindPip\(c\)/.test(app) && (app.match(/ui23DarkBlindPip\(c\)/g) || []).length >= 3, '16: the Dark-blind pip in both status paths');
ok(/id="fxSelectHud"/.test(app) && /const k = lv === 'med' \? 0\.6 : 1;/.test(fnSrc('battlefieldShake')), '17: Effects in the fight\'s settings; Medium shakes at 60%');

// ---- 19, 25, 27
ok(/function ui23DarkLevel\(m\)/.test(app) && /\$\{ui23DarkLevel\(m\) \? 'bf-lantern bf-dark-' \+ ui23DarkLevel\(m\) : ''\}/.test(app) && /\.battlefield\.bf-lantern\.bf-dark-dark::after/.test(tpl), '19: the dark overlay follows the field effects (a plain Darkness too)');
{ const rect = new Function(fnSrc('ui23Rect') + 'return ui23Rect;')();
  ok(rect({width: 0, height: 0, left: 0, top: 0}) === null && rect({width: 10, height: 5}) && /if\(!r\) return h;/.test(fnSrc('fxHostAt')), '25: a 0x0 box is no anchor; fxHostAt drops the float'); }
ok(/<div class="rw-sec rw-packs">/.test(app) && /x\.startsWith\('<div class="rw-sec rw-packs"'\)/.test(app) && /TX\('ui\.ui23-pack-n'/.test(app) && /"ui\.ui23-pack-tip": "\{name\} - opens as soon as you leave the screen\."/.test(texts), '27: packs with the cards, "(N)" stacks, the tip');
ok(/if\(ref\.kind === 'end'\) return \{id:p\.id, name: p\.name/.test(app), '27: no "Map reward" on a pack');
ok(/\.winloss-achv\{position:fixed !important; top:12px/.test(tpl) && /\.po2-sum-grid\.is-dense\{width:min\(980px, 94vw\);\}/.test(tpl), '27: the achievement toast at the top; open-all cards at full width');

// ---- 29 speed gates (the game's own function)
{ const sp = new Function('const SPEED_GATES = [{speed:3, map:20}, {speed:4, map:40}, {speed:5, map:60}]; const SPEED_15_MAP = 1, SPEED_2X_MAP = 3;\n' + fnSrc('speedStepsFor') + '\nreturn speedStepsFor;')();
  const S = o=> JSON.stringify(sp(o));
  ok(S({skirmWon: ()=> false, cleared: ()=> false}) === '[1,0.5]', '29: a Map 0 win alone opens nothing');
  ok(S({skirmWon: n=> n === 1, cleared: ()=> false}) === '[1,1.5,0.5]', '29: a Map 1 skirmish opens 1.5x');
  ok(S({skirmWon: n=> n <= 3, cleared: ()=> false}) === '[1,1.5,2,0.5]', '29: a Gannet Cliffs skirmish opens 2x'); }

// ---- 30, 31, 33, 35, 37, 39, ENG23
ok(!/W - 46/.test(fnSrc('res3RankEmblemFlight')) && /rank === 'A'/.test(fnSrc('res3RankEmblemFlight')) && /ui23-rank-shine/.test(tpl), '30: the emblem pops from its node; A bounces, S+ shines');
{ const nn = new Function(fnSrc('ui23NoNumbers') + 'return ui23NoNumbers;')();
  ok(nn('Its hits add 1 Poison.', 'Its hits add 2 Poison.') === 'Its hits add N Poison.' && nn('attacks at it miss 1 in 2', 'attacks at it miss 1 in 2') === 'attacks at it miss 1 in 2', '31: a value number reads N, a rule number stays'); }
ok(/\['delivery', 'deliveryEvery', 'tribeDelivery'\]\.forEach/.test(app), '33: the Delivery skills are a context pip');
ok(!/<figcaption>/.test(fnSrc('ui16VsArtStageHTML')) && /\.ui16-vs-art\.n2 \.ui16-vs-fig\.is-leader\{position:relative; z-index:2; margin-right:-9%/.test(tpl), '35: no captions; the portraits overlap, the leader in front');
ok(/B\.dusk = \(\)=> Promise\.resolve\(\);/.test(app) && /\.fxb-rays\{--rx:230%; --ry:-60%;/.test(tpl), '37: no dusk bars; the dawn rays straighter and fainter');
ok(/b\._awayT = setTimeout\(\(\)=> b\.classList\.remove\('is-away'\), 3000\)/.test(app) && /document\.addEventListener\('wheel'/.test(app), '39: the map title comes back after 3 s; a scroll counts');
ok(/delivery:\s*\{from:1, parts:\['deliveryEvery', 'deliveryRes'\]\}/.test(app), 'ENG23-4 b: Delivery reads "?" on Map 0');
ok(/ui23-feed-slot/.test(app) && /\[data-hq\]\.ui23-feed-slot::after/.test(tpl), 'ENG23-6: the Larder\'s feed slot while a card is held');

// ---- texts, changelog, run-all
{ const {TEXT} = require(path.join(ROOT, 'bramblewood-texts.js')); const CODES = ['fr', 'de', 'es', 'it', 'pt', 'tl', 'ta', 'id', 'zh-Hans', 'zh-Hant', 'ja', 'ko'];
  ['ui.ui23-costs', 'ui.ui23-effects', 'ui.ui23-get', 'ui.ui23-level-card', 'ui.ui23-pack-tip', 'ui.ui23-pack-n'].forEach(k=>{ const en = TEXT[k]; ok(!!en, 'TX ' + k);
    CODES.forEach(c=>{ const pack = JSON.parse(R('lang/' + c + '.json')); ok(en && pack[en], `${c} has "${en}"`); }); }); }
ok(/^## 2026-11-06 Package UI23/m.test(R('docs/CHANGELOG.md')), 'CHANGELOG entry');
ok(/tests\/ui23-2026-11-06\.js/.test(R('tests/run-all.sh')), 'in run-all.sh');

console.log(fail ? `ui23: ${fail} of ${n} checks failed` : `ui23: all ${n} checks passed`);
process.exit(fail ? 1 : 0);
