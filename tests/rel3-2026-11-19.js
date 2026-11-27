#!/usr/bin/env node
// 2026-11-19 (package REL3): the second polish pass on the Release 1.0 path. Source-level pins: the first-deck line and XP moment, NPC / bubble / swap-sheet close on
// a tab change, the title card skip and repeat cap, the Lumber tip's rings, tap-to-explain, the sign-in strip, the chest label, the new texts in all 12 packs.
'use strict';
const fs = require('fs'), path = require('path');
const ROOT = path.join(__dirname, '..');
const rd = f=> fs.readFileSync(path.join(ROOT, f), 'utf8');
const app = rd('arena_app.js'), tpl = rd('arena_template.html'), txt = rd('bramblewood-texts.js'), fxg = rd('bramblewood-fx-g.js');
let fail = 0, n = 0; const ok = (c, m)=>{ n++; if(!c){ fail++; console.log('  x', m); } };

// 1. title card: a tap skips, a repeat map holds about 1 s
ok(fxg.includes('tl.timeScale(14)'), '1. a tap on the map title card skips it');
ok(/again \? \{hold:\.1\} : \{\}/.test(fxg) && fxg.includes("SEEN_KEY + '_ever'"), '1. a repeat map caps the hold');
// 2. first deck
ok(app.includes("TX('ui.rel3-deck-line', {n: DECK_SIZE})") && !app.includes("Add them to your deck to take them onto the map."), '2. one line: "These 20 go with you"');
ok(app.includes('class="tr-moment" data-moment="tutorial-xp"') && app.includes("new CustomEvent('bw-moment'") && app.includes('el.dataset.up'), '2. the XP / Level moment slot and its hook');
ok(/if\(rel3MomentOn\(\)\)\{ rel3Moment\.xp \+= Math\.round\(n\)/.test(app) && app.includes('!rel3MomentOn() && !rewardXpBarUp()'), '2. the XP and level toasts are held back while the window is up or about to pop');
ok(/\.tut-reward \.tr-moment\{/.test(tpl) && /\.tr-moment \.trm\{/.test(tpl), '2. the moment is styled');
// 3 + 6. tab change
ok(/function rel3CloseOnTabChange\(\)/.test(app) && app.includes("document.querySelectorAll('.speech-bubble').forEach(b=> b.remove())") && app.includes("sw.querySelector('#dsKeep')"), '3/6. speech bubbles and a (non-teaching) swap sheet close');
ok(/function switchTab\(tab, covered\)\{[^]*?tabSwitchSeq\+\+; pageBackOverride = null;\n  if\(tab !== \(typeof currentTab !== 'undefined' \? currentTab : null\)\) rel3CloseOnTabChange\(\)/.test(app), '3/6. switchTab calls it on a real change');
ok(app.includes('epoch0 === dialogueEpoch'), '3. a running conversation stops on a tab change');
// 4. traveller dialogue
ok(/body:not\(\.pg-in-match\) \.dialogue-dock\{top:132px;\}/.test(tpl) && /body\.conquest-full \.dialogue-dock\{left:228px; top:120px;\}/.test(tpl), '4. the dock sits under the map name');
// 5. chest label
ok(/"ui\.res3-lt-pack-name": "Level \{n\} reward: \{name\}"/.test(txt), '5. the level-reward pack label');
// 7. lumber tip
ok(app.includes("document.querySelector('#handStrip .card-tile.unplayable[data-handuid]')") && app.includes('also:()=> document.getElementById(\'hudLumberPill\')') && app.includes("ex.classList.add('coach-anchor', 'coach-also')"), '7. the Lumber tip rings the first greyed card and the Lumber chip');
ok(app.includes("coachOpen.tip.id === 'pl-need'"), '7. the Lumber chip shows at 0 Lumber while the tip is up');
ok(app.includes("e.target.closest('#handStrip .card-tile.unplayable[data-whynot]')") && app.includes('REL2_TOUCH || !matchState'), '7. touch: a tap on a greyed card says why');
// 8. sign-in strip
ok(app.includes("sessionStorage.setItem('bw_signin_later', '1')") && app.includes("sessionStorage.getItem('bw_signin_later')"), '8. "It\'s okay" holds for the session');
ok(/body\[data-tab="play"\] \.signin-banner\{display:none;\}/.test(tpl), '8. the strip stays off the map on a phone');
// texts in all 12 packs
const keys = ['ui.rel3-deck-line', 'ui.rel3-xp', 'ui.rel3-level', 'ui.res3-lt-pack-name'].map(k=> { const m = txt.match(new RegExp('"' + k.replace(/\./g, '\\.') + '": "([^"]*)"')); ok(!!m, '5. key ' + k); return m && m[1]; }).filter(Boolean);
for(const code of ['fr', 'de', 'es', 'it', 'pt', 'tl', 'ta', 'id', 'zh-Hans', 'zh-Hant', 'ja', 'ko']){
  const pack = JSON.parse(rd('lang/' + code + '.json')); const miss = keys.filter(k=> !pack[k]);
  ok(!miss.length, '5. ' + code + ' misses ' + miss.join(' | '));
}
console.log(fail ? `rel3: ${fail} FAILED of ${n}` : `rel3: ${n} checks passed`);
process.exit(fail ? 1 : 0);
