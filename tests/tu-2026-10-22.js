#!/usr/bin/env node
// 2026-10-22 (package TU, owner 11:58): static checks that
//   1. phones get a Profile note in the Home menu (TX keys, translated), desktop keeps only the top bar's chip;
//   2. the start map holds for everyone until Tutorial II is won (Admin Mode, which Reset all keeps, used to skip it: the T-1 win then
//      landed on an empty Outskirts and T-2 could not be reached); the Tutorial's own fights don't open the world; the T-1 / T-2 pair
//      stands side by side; the Tutorial II flag follows the account (PROGRESS_KEYS) and is restored from progress (healTutorial2Flag);
//   3. T-1 and T-2 show their first-clear cards (tutorialRewardIds / tutorialRewards2) with no rank emblem.
// The flow itself (fresh account, Admin Mode on and off, 390 and 1366, T-1 → T-2 → the Outskirts → the Tutorial submap) was played
// headlessly; screenshots in docs/screens/TU/. (Labels as of 2026-10-23, TU2: the tutorials read T-1 / T-2.)
'use strict';
const fs = require('fs'), path = require('path');
const ROOT = path.join(__dirname, '..');
const src = fs.readFileSync(path.join(ROOT, 'arena_app.js'), 'utf8');
const tpl = fs.readFileSync(path.join(ROOT, 'arena_template.html'), 'utf8');
const {TEXT} = require(path.join(ROOT, 'bramblewood-texts.js'));
let fail = 0, checks = 0; const ok = (c, m)=>{ checks++; if(!c){ fail++; console.log('  ✗', m); } };
function fnSrc(name){
  const a = src.indexOf('\nfunction ' + name + '('); if(a < 0) return '';
  let i = src.indexOf('{', a), depth = 0;
  for(; i < src.length; i++){ const ch = src[i]; if(ch === '{') depth++; else if(ch === '}'){ depth--; if(!depth) break; } }
  return src.slice(a + 1, i + 1);
}

// --- 1. Profile on the phone's Home menu
ok(TEXT['ui.home-profile'] === 'Profile' && typeof TEXT['ui.home-profile-sub'] === 'string', '1. TX keys ui.home-profile / ui.home-profile-sub');
ok(/class="home-note note-profile" data-hometab="profile"/.test(src) && /TX\('ui\.home-profile'\)/.test(src), '1. Home draws the Profile note (goes to the profile tab)');
ok(/\.home-note\.note-profile\{display:none;\}/.test(tpl) && /@media \(max-width:860px\)\{ \.home-note\.note-profile\{display:flex; position:static; rotate:0deg;\} \}/.test(tpl), '1. shown on phones only');
for(const c of ['de','es','fr','id','it','ja','ko','pt','ta','tl','zh-Hans','zh-Hant']){
  const d = JSON.parse(fs.readFileSync(path.join(ROOT, 'lang', c + '.json'), 'utf8'));
  ok(d['Profile'] && d[TEXT['ui.home-profile-sub']], `1. ${c} translates both lines`);
}

// --- 2. the start map
const sub = fnSrc('renderConquestSubTab');
ok(/healTutorial2Flag\(\);\s*if\(!loadTutorial2Done\(\) && !\(typeof conquestLayoutEdit !== 'undefined' && conquestLayoutEdit\) && conquestSelectedMap !== 'mtut'\) conquestSelectedMap = 'mtut';/.test(sub),
  '2. until Tutorial II is won the map is the Tutorial, Admin Mode or not (only the layout editor looks elsewhere)');
const wr = fnSrc('worldRevealed');
ok(/if\(!loadTutorial2Done\(\) && !\(typeof conquestLayoutEdit !== 'undefined' && conquestLayoutEdit\)\) return false;\s*if\(adminModeEnabled\) return true;/.test(wr), '2. no map list on the start map, admins too');
ok(/\['m1','mq','mf','mtut'\]/.test(wr), '2. a T-1 win alone does not open the world');
{
  const pair = new Function(fnSrc('tutPairCentred') + '\nreturn tutPairCentred;')();
  const map = {id:'mtut', nodes:[{key:'tutorial', kind:'tutorial', stage:1}, {key:'tutorial2', kind:'tutorial', stage:2}, {key:'T-2'}]};
  const c = pair(map, [{x:16, y:64}, {x:34, y:40}, {x:52, y:62}]);
  ok(c[0].y === c[1].y && c[0].x < 50 && c[1].x > 50 && c[2].x === 52, '2. T-1 and T-2 side by side in the middle; the others keep their spots');
}
ok(/'bramblewood_tutorial2_done_v1'\];/.test(src) && /const TUTORIAL2_KEY = 'bramblewood_tutorial2_done_v1';/.test(src), '2. the Tutorial II flag is in the progress blob');
{
  const heal = fnSrc('healTutorial2Flag');
  let store = {}, t1 = true, completed = [];
  const f = new Function('loadTutorial2Done', 'loadTutorialDone', 'loadConquestProgress', 'saveTutorial2Done', heal + '\nreturn healTutorial2Flag;')(
    ()=> !!store.t2, ()=> t1, ()=> ({completed}), ()=>{ store.t2 = true; });
  completed = ['mtut:tutorial']; ok(f() === false && !store.t2, '2. T-1 alone: Tutorial II still to play');
  completed = ['mtut:tutorial', 'm1:0-1']; ok(f() === true && store.t2, '2. a cleared road fight restores the flag');
  store = {}; completed = ['mtut:tutorial', 'mtut:tutorial2']; ok(f() === true && store.t2, '2. mtut:tutorial2 restores the flag');
  store = {}; t1 = false; completed = ['m1:0-1']; ok(f() === false && !store.t2, '2. never before T-1 is won');
}

// --- 3. T-1 / T-2 first-clear cards
const strip = fnSrc('cnpRewardStripHTML');
ok(/const isTutNode = !!\(node && node\.kind === 'tutorial'\);/.test(strip) && /node\.stage === 2 \? tutorialRewards2\(loadFactionChoice\(\) \|\| 'both'\) : tutorialRewardIds\(\)/.test(strip), '3. a tutorial node lists the tutorial reward cards');
ok(/needR = \(got \|\| isTutNode\) \? null : cardRewardRankFor/.test(strip), '3. no rank emblem on a tutorial reward');

console.log(fail ? `tu-2026-10-22: ${fail} of ${checks} checks failed` : `tu-2026-10-22: all ${checks} checks pass`);
process.exit(fail ? 1 : 0);
