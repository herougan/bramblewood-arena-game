#!/usr/bin/env node
// 2026-11-08 (package UI36, owner 10:52 #13): the Achievements page's "Card Rewards" filter.
// 1 every achievement that gives a card is found from FACTION_REWARD_TRACK, 2 the panel wiring (button, count, filter composes, remembered in try/catch), 3 claim records the cards,
// 4 texts in 12 packs, 5 build is current.
// Browser: tests/e2e/ui36_2026_11_08.py (both widths, screenshots in docs/screens/ui36/).
'use strict';
const fs = require('fs'), path = require('path');
const ROOT = path.join(__dirname, '..');
const rd = f=> fs.readFileSync(path.join(ROOT, f), 'utf8');
let fail = 0, pass = 0; const ok = (c, m)=>{ if(!c){ fail++; console.log('  x', m); } else pass++; };
const CODES = ['de', 'es', 'fr', 'id', 'it', 'ja', 'ko', 'pt', 'ta', 'tl', 'zh-Hans', 'zh-Hant'];
const app = rd('arena_app.js'), texts = rd('bramblewood-texts.js'), tpl = rd('arena_template.html');

// 1. the card achievements
{ const m = app.match(/ambushGrowth: 1,[^\n]*\n  achievements: \{([^}]*)\}/); ok(!!m, 'FACTION_REWARD_TRACK.achievements found');
  const ids = [...m[1].matchAll(/(\w+):\s*(\d+)/g)].filter(x=> +x[2] > 0).map(x=> x[1]);
  const defs = [...app.matchAll(/\{id:'(\w+)', cat:/g)].map(x=> x[1]);
  ok(ids.length >= 8, 'at least the 8 known card achievements: ' + ids.length);
  ok(ids.every(i=> defs.includes(i)), 'every card achievement id is a real achievement');
  ok(/function ui36AchvCardCount\(def\)\{ return achievementFactionCards\(def\.id\)/.test(app), 'the count reads FACTION_REWARD_TRACK.achievements (so a new entry joins the filter), plus a def.cardIds hook'); }

// 2. panel wiring
{ const f = app.slice(app.indexOf('function achievementsPanelHTML'), app.indexOf('function wireAchievementsPanel'));
  ok(/id="achvCardsBtn"/.test(f) && /aria-pressed="\$\{achvCardsOnly\}"/.test(f), 'a toggle button with aria-pressed');
  ok(/TX\('ui\.ui36-card-rewards'\)/.test(f) && /acb-n">\$\{cardTotal\}/.test(f), 'label from a TX key and the count');
  ok(/const show = r=> show0\(r\) && \(!achvCardsOnly \|\| ui36AchvCardCount\(r\.def\) > 0\)/.test(f), 'the toggle narrows whatever the status filter shows');
  ok(/is-card-hot/.test(f) && /ui36CardsRowHTML\(def, st\)/.test(f), 'unclaimed card rows are highlighted and carry the card chips');
  ok(/wireAchievementsPanel[\s\S]*achvCardsBtn/.test(app) && /ui36SetCardsOnly\(!achvCardsOnly\)/.test(app), 'the click toggles and redraws');
  ok(/try\{ return localStorage\.getItem\(UI36_ONLY_KEY\) === '1'; \}catch/.test(app) && /try\{ localStorage\.setItem\(UI36_ONLY_KEY/.test(app), 'the choice is stored per viewer inside try/catch');
  ok(/\.achv-cardbtn\{/.test(tpl) && /\.achv-tile\.has-card\.is-card-hot/.test(tpl), 'CSS for the button and the highlight'); }

// 3. claim records the cards
{ const f = app.slice(app.indexOf('function claimAchievement'), app.indexOf('const ui27AchvCardsPending'));
  ok(/ui36SaveAchvCards\(id, got\)/.test(f), 'claiming remembers the cards the row gave'); }

// 4. texts
{ const keys = ['card-rewards', 'n-ready', 'cards-prize', 'cards-got', 'next-card', 'cards-tip', 'none'].map(k=> 'ui.ui36-' + k);
  const en = {}; keys.forEach(k=>{ const m = texts.match(new RegExp('"' + k + '": "((?:[^"\\\\]|\\\\.)*)"')); ok(!!m, k + ' in bramblewood-texts.js'); if(m) en[k] = m[1]; });
  CODES.forEach(c=>{ const d = JSON.parse(rd('lang/' + c + '.json')); keys.forEach(k=>{ if(en[k]) ok(d[en[k]] && d[en[k]] !== en[k], c + ' translates ' + k); }); }); }

// 5. build is current
ok(rd('index.html').includes('achvCardsBtn'), 'index.html carries the button (rebuilt)');
console.log(fail ? 'FAIL ' + fail : 'ok', pass + ' checks'); process.exit(fail ? 1 : 0);
