#!/usr/bin/env node
// 2026-10-24 (package PL1: the owner's playtest notes P24-1..P24-20 (UI and bug items) and 21:20 #1 #2 #4). Source and data checks; the browser
// checks and screenshots are tests/e2e/pl1_2026_10_24.py. Covers:
//   P24-1 the faction pick's cards start as three Commons and turn over; P24-2 no names under Tut2's reward cards; P24-3 a Conquest fight's
//   XP fills on the map; P24-4 the bundle ribbon (no band on a single pack); P24-5 the rank emblem spiral; P24-6 packs wait for the map's veil
//   and banner; P24-8 the swap's right column leaves out swapped-out and basic cards; P24-9 the hand preview refreshes on day / night;
//   P24-11 the Health bar above the plates; P24-12 Kinship / Nature's Force / Lone Wolf on the Attack plate; P24-13 the Dungeons tab waits for
//   Map 3; P24-18 the leader lesson waits for the Camp; P24-19 the pack count runs across sets, the page of every card, reward packs open once
//   the Camp is there; P24-20 the smaller copy pill; 21:20 #1 the boons' short words; #2 lethal Poison; #4 X after a first clear lets go.
'use strict';
const fs = require('fs'), path = require('path');
const ROOT = path.join(__dirname, '..');
let fail = 0, checks = 0; const ok = (c, m)=>{ checks++; if(!c){ fail++; console.log('  ✗', m); } else if(process.env.VERBOSE) console.log('  ✓', m); };
const app = fs.readFileSync(path.join(ROOT, 'arena_app.js'), 'utf8');
const tpl = fs.readFileSync(path.join(ROOT, 'arena_template.html'), 'utf8');
const fxe = fs.readFileSync(path.join(ROOT, 'bramblewood-fx-e.js'), 'utf8');
const TXT = fs.readFileSync(path.join(ROOT, 'bramblewood-texts.js'), 'utf8');
const T = require(path.join(ROOT, 'bramblewood-texts.js'));
const CODES = ['fr', 'de', 'es', 'it', 'pt', 'tl', 'ta', 'id', 'zh-Hans', 'zh-Hant', 'ja', 'ko'];
const packs = CODES.map(c=> Object.assign({}, JSON.parse(fs.readFileSync(path.join(ROOT, 'lang', 'ui', c + '.json'), 'utf8')), JSON.parse(fs.readFileSync(path.join(ROOT, 'lang', c + '.json'), 'utf8'))));
const fnSrc = name=>{ const i = app.indexOf('function ' + name + '('); if(i < 0) return ''; let d = 0, j = app.indexOf('{', i); for(let k = j; k < app.length; k++){ if(app[k] === '{') d++; else if(app[k] === '}'){ d--; if(!d) return app.slice(i, k + 1); } } return ''; };

// P24-1
ok(/function pl1FactionStartCards\(/.test(app) && /pl1FactionStartCards\(key\)/.test(app), 'P24-1 the showcase starts from pl1FactionStartCards');
ok(/function pl1FactionCardCycle\(/.test(app) && /pl1-fsf-back/.test(tpl) && /\.pl1-fsf\.is-down \.pl1-fsf-in\{transform:rotateY\(180deg\)/.test(tpl), 'P24-1 the cards turn over (cycle + flip CSS)');
{ const cards = JSON.parse(fs.readFileSync(path.join(ROOT, 'canonical', 'cards.json'), 'utf8'));
  for(const arch of ['Otter', 'Hummingbird']){ const pool = cards.filter(d=> d.art && !d.token && !d.test && !d.hero && (d.archetypes||[]).includes(arch));
    ok(pool.filter(d=> (d.rarity||'common') === 'common').length >= 3, `P24-1 ${arch}: three Commons with art to start from`);
    ok(pool.length >= 6, `P24-1 ${arch}: more cards of the faction to turn over to (${pool.length})`); } }
// P24-2
ok(!/<figcaption class="tr-name">/.test(fnSrc('openDeckTopUpStep')), 'P24-2 no name under the Part 2 reward cards');
// P24-3
ok(/function pl1XpOnMap\(m\)\{ return !!m; \}/.test(app) /* 2026-10-25 (PL2, PL1-1): every fight's XP fills on the map */ && /if\(!resultsShowXpBar\(m\) \|\| pl1XpOnMap\(m\)\) return '';/.test(app), 'P24-3 a Conquest fight\'s results draw no XP bar');
ok(/pl1NoteXpForMap\(matchState\)/.test(fnSrc('endMatch')) && /function pl1XpOnMapShow\(/.test(app) && /\.pl1-xp-float\{/.test(tpl), 'P24-3 leaving the fight fills it on the map');
// P24-4
ok(/\.booster \.booster-band\{display:none;\}/.test(tpl) && /bundle-twine pl1-ribbon/.test(app) && /\.bundle-twine\.pl1-ribbon\{/.test(tpl), 'P24-4 no band on one pack; a ribbon round a set');
// P24-5
ok(/M\.nodeRankEmblem = function/.test(fxe) && /await M\.nodeRankEmblem\(n, rank\)/.test(fxe) && /cnp-rank-corner/.test(fxe), 'P24-5 the rank emblem spirals to the panel\'s corner');
// P24-6
const ready = fnSrc('packRevealReady');
ok(/\.map-veil/.test(ready) && /mapTitleHold\(\)/.test(ready), 'P24-6 packs wait for the veil and the banner');
// P24-8
ok(/function pl1SwapNeverOffer\(/.test(app) && /!pl1SwapNeverOffer\(k, defs\)/.test(app) && (app.match(/pl1NoteSwappedOut\(tOut\)/g) || []).length === 2, 'P24-8 the right column leaves out swapped-out and basic cards; both swap windows note what went out');
// P24-9
ok(/pl1HandPreviewSoon\(\)/.test(app) && /function pl1HandPreviewSoon\(/.test(app), 'P24-9 a day / night turn refreshes the hand preview');
// P24-11
ok(/\.eq2-hpbar\{position:absolute; left:12%; right:12%; bottom:31\.5%/.test(app) && /@media \(max-width:700px\)\{ \.eq2-hpbar\{bottom:39%/.test(app), 'P24-11 the Health bar sits above the plates (desktop and phone)');
// P24-12
ok(/function pl1AuraAtk\(/.test(app) && (app.match(/pl1AuraAtk\(/g) || []).length >= 5 && (app.match(/pl1AuraSnap\(/g) || []).length >= 4, 'P24-12 Kinship / Nature\'s Force / Lone Wolf reach the plate, the details, the refresh and the replay');
{ const f = new Function(fnSrc('pl1AuraAtk') + '; return pl1AuraAtk;')(); ok(f({kinBonus:1}) === 1 && f({kinBonus:1, natureBonus:2, packBonus:1}) === 4 && f(null) === 0, 'P24-12 pl1AuraAtk adds the three'); }
// P24-13
ok(/const GD_OPEN_AFTER_MAP = 3;/.test(app) && /tutorialFullyDone\(\) && mapsPassed\(\) >= GD_OPEN_AFTER_MAP/.test(app), 'P24-13 the Dungeons tab opens after Map 3 (or a daily dungeon)');
// P24-18
ok(/if\(!tabOpen\('deck'\)\)\{ pl1LeaderLessonWaitSave/.test(fnSrc('maybeLeaderLesson')), 'P24-18 the leader lesson waits for the Camp');
// P24-19
ok(/moreAfter/.test(fnSrc('openPackAnimation')) && /left \+ more/.test(app) && /poNextSet/.test(app) && /const showSession = /.test(app), 'P24-19 the count runs across sets; the last set shows every card');
ok(/spotAvailable\(sp, loadConquestProgress\(\)\)/.test(fnSrc('armouryOpen')) && /releaseHeldPacks\(\)/.test(app.slice(app.indexOf('pl1HeldPackCount() &&'), app.indexOf('pl1HeldPackCount() &&') + 200)), 'P24-19 reward packs open once the Camp is there; held ones open on the map');
// P24-20
ok(/\.pool-stack \.ps-count\{right:-11px; bottom:-10px; padding:0 4px; min-width:0; font-size:9\.5px/.test(tpl), 'P24-20 the smaller copy pill in the corner');
// 21:20 #1
const IDS = ['blindFury', 'hiveChorus', 'risingTide', 'secondBurrow', 'wildRage', 'snowVeil', 'sandVeil', 'restlessDead', 'emberBorn', 'siegeTrain', 'venomGlands', 'skyAmbush'];
for(const id of IDS){ const eff = T.TX('ui.pl1-boon-' + id), full = T.TX('ui.df3-' + id);
  ok(full.startsWith(eff + ' Theirs only:'), `#1 ${id}: the short effect is the DF3 sentence without its "Theirs only" part`); }
ok(T.TX('ui.pl1-boon-theme-venomGlands') === 'Reptile' && /`\$\{st\.have\}\/\$\{st\.total\} \$\{boonTheme\(row\.selfish\)\}`/.test(app), '#1 the card says "11/17 Reptile" (2026-10-25, PL2: built in place, no TX key)');
ok(T.TX('ui.pl1-boon-venomGlands') + ' ' + T.TX('ui.pl1-boon-theirs', {theme:'Reptile'}) === 'Their Poison gives twice the Poison. Theirs: half their deck Reptile', '#1 the detail: the effect and "Theirs: half their deck Reptile"');
ok(/function boonShortText\(/.test(app) && /boonShortText\(r\.boon\)/.test(app), '#1 the field rows use the short words');
// 21:20 #2
{ const f = new Function(fnSrc('pl1PoisonLethal') + '; return pl1PoisonLethal;')();
  ok(f({hp:4, poison:4}) && f({hp:3, poison:7}) && !f({hp:5, poison:4}) && !f({hp:0, poison:3}) && !f({hp:3, poison:0}), '#2 lethal when Poison >= Health (alive, poisoned)'); }
ok(/\.board-card\.pl1-lethal:not\(\.has-shield\) \.stats \.hp\{color:#8cff52/.test(tpl) && /\.board-card\.pl1-lethal \.fxd-psn-svg\{height:18%/.test(tpl), '#2 green bubbling Health, a higher pool');
// 21:20 #4
ok(/m\.fightFirstClear && m\.conquestNode/.test(app) && /conquestSelectedNodeKey = null; try\{ if\(currentTab === 'play'/.test(app), '#4 X after a first clear lets go of the fight so the pawn walks on');
// texts
const KEYS = ['ui.pl1-next-pack', 'ui.pl1-all-packs', 'ui.pl1-session-title', 'ui.pl1-boon-theirs'].concat(IDS.map(id=> 'ui.pl1-boon-' + id), IDS.map(id=> 'ui.pl1-boon-theme-' + id));
for(const k of KEYS){ const en = T.TEXT[k]; ok(!!en, `texts: ${k} is a TX text`); if(en) CODES.forEach((c, i)=> ok(!!packs[i][en], `texts: ${c} translates "${en.slice(0, 40)}"`)); }
ok(!/\/\*|\/\/ /.test(TXT.slice(TXT.indexOf('"ui.pl1-next-pack"'), TXT.indexOf('/*TEXT-TABLE-END*/'))), 'texts: no comments inside the TEXT table');

console.log(`pl1: ${checks - fail} passed, ${fail} failed`);
process.exit(fail ? 1 : 0);
