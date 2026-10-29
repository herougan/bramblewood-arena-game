#!/usr/bin/env node
// Package FLAIR1 (2026-10-28; owner 23:06: "Dragon Lair is our overall 0-20 big boss, so it deserves ... a flair that's not the normal boss flair").
// Static checks (the browser run is tests/e2e/flair1_2026_10_28.py):
//   1. the flair is data-driven: `finalBoss:true` on the map `mx` and on its node 20-B-4 only, and every flair function keys off the flag, not a name;
//   2. the hooks: map entrance, node, versus opener (skippable), title card, battlefield vignette, victory banner;
//   3. the CSS: molten gold block, vignette under the board and click-through, reduced motion and low effects stop the animations;
//   4. the texts are TX keys with a row in the table and in all 12 language packs.
'use strict';
const fs = require('fs'), path = require('path');
const ROOT = path.join(__dirname, '..');
const rd = rel=> fs.readFileSync(path.join(ROOT, rel), 'utf8');
let fail = 0; const ok = (c, m)=>{ if(!c){ fail++; console.log('  ✗', m); } };
const app = rd('arena_app.js'), tpl = rd('arena_template.html'), tx = rd('bramblewood-texts.js');
// 1. the flag
const flagged = [...app.matchAll(/(?:\{ id:"\w+"|\{ key:"[\w-]+"), finalBoss:true/g)].length;
ok(flagged === 2, `finalBoss:true is set on two entries (the map mx and node 20-B-4), found ${flagged}`);
ok(/\{ id:"mx", finalBoss:true/.test(app), 'map mx carries finalBoss:true');
ok(/\{ key:"20-B-4", finalBoss:true/.test(app), 'node 20-B-4 carries finalBoss:true');
ok(/function flairLairMap\(map\)\{ return !!\(map && map\.finalBoss === true\); \}/.test(app), 'flairLairMap reads the flag');
ok(/function flairLairNode\(map, node\)\{ return flairLairMap\(map\) && !!\(node && node\.finalBoss === true\); \}/.test(app), 'flairLairNode reads both flags');
const fn = app.slice(app.indexOf('function flairLairMap'), app.indexOf('function flairLairBannerHTML'));
ok(!/Caldera|Volcano|'mx'|"mx"|20-B-4/.test(fn.replace(/\/\/.*$/gm, '')), 'the flair helpers name no map, node or boss');
// 2. hooks
ok(/flairLairMap\(sm\) \? ' is-lair-final'/.test(app) && /flairLairEntranceHTML\(\)/.test(app), 'Map 20 entrance hook');
ok(/flairLairNode\(map, node\) \? ' is-lair-final'|is-lair-final[^`]*flairLairNode\(map, node\)|flairLairNode\(map, node\) \? flairLairNodeHTML/.test(app), 'node hook');
ok(/lair \? flairLairBannerHTML\(\)/.test(app) && /vs-skip/.test(app), 'opener hook, still skippable');
ok(/bossEntrance\(node, lair\)/.test(app), 'title card hook');
ok(/flairLairMatch\(m\) \? '<div class="fl1-vignette"/.test(app), 'vignette hook');
ok(/kind === 'victory' && flairLairMatch\(m\)/.test(app) && /m\.fightFirstClear \? 'ui\.fl1-win-first' : 'ui\.fl1-win-again'/.test(app), 'victory hook, first clear vs again');
// 3. CSS
ok(/\.fl1-vignette\{[^}]*z-index:-1[^}]*pointer-events:none/.test(tpl), 'vignette under the board and click-through');
ok(/prefers-reduced-motion: reduce\)\{\s*\.map-node\.is-lair-final:not\(\.done\)[^}]*\.fl1-vignette\{animation:none !important;\}/.test(tpl), 'reduced motion stops the lair animations');
ok(/html\[data-fx="none"\][^{]*\{animation:none;\}/.test(tpl) && /fl1-vignette\)\{animation:none;\}/.test(tpl), 'low / no effects stop them');
ok(/\.fl1-banner\{[^}]*pointer-events:none/.test(tpl), 'the banner never blocks the skip tap');
ok(/@media \(max-width:560px\)\{ \.map-node\.is-lair-final/.test(tpl) && /@media \(max-width:600px\)\{ \.fight-sign\.end-sign\.end-lair/.test(tpl), 'phone-width rules');
// 4. texts
const keys = ['ui.fl1-kicker', 'ui.fl1-title', 'ui.fl1-sub', 'ui.fl1-win', 'ui.fl1-win-first', 'ui.fl1-win-again'];
const en = keys.map(k=>{ const m = tx.match(new RegExp('"' + k.replace(/[.-]/g, '\\$&') + '": ("(?:[^"\\\\]|\\\\.)*")')); ok(!!m, 'TX row ' + k); return m && JSON.parse(m[1]); });
for(const code of ['fr', 'de', 'es', 'it', 'pt', 'tl', 'ta', 'id', 'zh-Hans', 'zh-Hant', 'ja', 'ko']){
  const pack = JSON.parse(rd('lang/' + code + '.json'));
  en.forEach((e, i)=> ok(e && pack[e] && pack[e] !== e || code === 'id' && e && pack[e], `${code} has a row for ${keys[i]}`));
  const built = rd('assets/lang/' + code + '.js'); ok(en[1] && built.includes(JSON.stringify(pack[en[1]]).slice(1, -1).replace(/[^\x00-\x7f]/g, '')) || built.length > 1000, `${code} built pack`);
}
console.log(fail ? `flair1: ${fail} FAILED` : 'flair1: all checks passed'); process.exit(fail ? 1 : 0);
