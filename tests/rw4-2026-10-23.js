#!/usr/bin/env node
// Package RW4 (2026-10-23, owner notes 13:16 items 3, 5, 6, 7, 8, 10, 13, 14, 15). Headless checks on the source and the texts; the browser half
// (real swap rule at Map 1 and Map 2, the hover details over the swap window, the first-clear tips, the Energy panel, shots at 390 and 1366) is
// tests/e2e/rw4_2026_10_23.py.
//   3. swap window: wider gap, no star, squarer mini cards, no stat line, "Good Choice!", card details reach over it
//   5. a waiting swap holds while the map's title banner is due or playing
//   6. no skill reveal popup (fxHook 'skillReveal' gone); a NEW! tag for one skill at a time, never crepuscular / nocturnal
//   7. first-clear rewards: tips on resources, items and packs; items are bare icons; the Energy panel has a count and a Use button
//   8. no egg toast; "You got an egg!" and the nest hover line
//   10. the reward stage's dim is lighter and rises with the first card; no pre-darkening before the results
//   13. the drops line shows the card back, not the joker
//   14. items are icons only, with their rank-free tip
//   15. from Map 2 a swap needs a much better card (named constants); Maps 0 and 1 and forced teaching swaps keep the old rule
'use strict';
const fs = require('fs'), path = require('path');
const ROOT = path.join(__dirname, '..');
let fail = 0, n = 0; const ok = (c, m)=>{ n++; if(!c){ fail++; console.log('  ✗', m); } };
const app = fs.readFileSync(path.join(ROOT, 'arena_app.js'), 'utf8'), tpl = fs.readFileSync(path.join(ROOT, 'arena_template.html'), 'utf8');
const T = require(path.join(ROOT, 'bramblewood-texts.js')).TEXT;

// ---- 15. the threshold
{ const m = app.match(/const SWAP_MUCH_BETTER_MARGIN = ([\d.]+), SWAP_MUCH_BETTER_MIN_GAIN = (\d+), SWAP_MUCH_BETTER_FROM_MAP = (\d+);/);
  ok(!!m, '15. the threshold is three named constants');
  ok(m && +m[1] > 0.1 && +m[1] <= 0.6, `15. much better is well above the old 10% (${m && m[1]})`);
  ok(m && +m[3] === 2, '15. it starts with Map 2 (fight 2-1)'); }
ok(/function swapMuchBetterOn\(\)\{[^}]*furthestMapReached\(\) >= SWAP_MUCH_BETTER_FROM_MAP/.test(app), '15. the rule is switched on by the furthest map reached');
ok(/if\(!\(opts && opts\.legacy\) && swapMuchBetterOn\(\)\) return a - b >= Math\.max\(SWAP_MUCH_BETTER_MIN_GAIN, b \* SWAP_MUCH_BETTER_MARGIN\);\n  return strictlyDominates\(d, o\) \|\| a - b >= Math\.max\(1, b \* SWAP_CLEAR_MARGIN\);/.test(app), '15. swapClearlyBetter: much better from Map 2 (no free pass for strictly dominating), today\'s rule below it');
ok(/function swapOptsFor\(item\)\{ return item && item\.teach === 'lumber' \? \{anyCost: true, legacy: true\} : item && item\.forced \? \{legacy: true\} : null; \}/.test(app), '15. forced teaching swaps keep the old rule');
ok(/\(swapMuchBetterOn\(\) \|\| strictlyDominates\(d, defs\[k\]\)\) && swapClearlyBetter\(d, defs\[k\]\)/.test(app), '15. the one-card offer need not dominate once the card is much better');
ok(/swapMuchBetterOn\(\) \? swapClearlyBetter\(dIn, defs\[k\], \{anyCost:true\}\)/.test(app), '15. a faction pack\'s rows follow the same threshold');

// ---- 3. the swap window
ok(/gap:96px;\} \/\* 2026-10-18/.test(tpl) && /\.ds2-stage\{gap:52px;\}/.test(tpl), '3. the two columns sit further apart (desktop and phone)');
ok(/\.ds3-row\{[^}]*grid-template-columns:1fr 40px 1fr 64px; align-items:center; gap:16px;/.test(tpl), '3. the several-swap rows are airier too');
ok(!/ds2-rec" aria-hidden/.test(app), '3. the star is gone from the mini cards');
ok(/\.ds2-thumb \.card-tile\{width:46px !important; border-radius:4px;\}/.test(tpl), '3. the mini card is squarer');
ok(/TX\('ui\.rw4-swap-good'\)/.test(app) && !/'Better card!'/.test(app), '3. "Good Choice!" instead of "Better card!"');
ok(!/ in place of \$\{dOut\.attack/.test(app) && !/against ⚔\$\{dOut\.attack/.test(app), '3. no 2/8-against-1/6 line');
ok(/body:has\(\.ds2-overlay\) #cardPop\{z-index:9100 !important;\}/.test(tpl), '3. the card details show over the swap window');
ok(!/\.ds2-thumb \.card-tile\{[^}]*pointer-events:none/.test(tpl) && !/\.ds3-row \.ds2-old \.card-tile, \.ds3-row \.ds2-new \.card-tile\{[^}]*pointer-events:none/.test(tpl), '3. the tiles take the pointer so hovering reaches the details');

// ---- 5. the map banner first
ok(/function mapTitleHold\(\)/.test(app) && /mapTitleHold\(\)\)\{ setTimeout\(maybeOfferDeckSwap, 400\); return; \}/.test(app), '5. a waiting swap holds while the map banner is due or playing');
ok(/mapTitleHoldUntil = Date\.now\(\) \+ \(\(document\.querySelector\('\.map-veil'\) \|\| tutZoomOut\) \? 2100 : 300\) \+ 700;/.test(app), '5. the hold starts when the banner is scheduled, with the banner\'s own delay');
ok(/Date\.now\(\) - mapTitleHoldSince > 9000/.test(app), '5. the hold gives up after 9 s');

// ---- 6. skills
ok(!/fxHook\('skillReveal'/.test(app), "6. no 'Skill revealed' popup");
ok(/const SKILL_NEW_SKIP = new Set\(\['crepuscular', 'nocturnal'\]\);/.test(app), '6. crepuscular and nocturnal never get a tag');
ok(/function skillNewKey\(\)/.test(app) && /\(st\.fresh \|\| \[\]\)\[0\]/.test(app), '6. one tagged skill at a time');
ok(/class="sk-new"/.test(app) && /\.sk-new\{/.test(tpl), '6. the NEW! tag exists and is styled');

// ---- 7 / 14. first-clear rewards and items
ok(/data-zoom-tip="\$\{escapeAttr\(TX\('ui\.rw4-tip-leaves-t'\)/.test(app) && /data-zoom-tip="\$\{escapeAttr\(TX\('ui\.rw4-tip-dust-t'\)/.test(app), '7. hovering the Maple Leaves / Magic Dust says what they are');
ok(/class="cnp-rw-item \$\{done\?'is-got':''\}"/.test(app) && /T\.item \? `<span class="cnp-rw-item/.test(app), '7/14. an item in the first-clear box is a bare icon, not a card');
ok(!/class="cnp-rw-card cnp-rw-token[^`]*rank-hex/.test(app) && !/cnp-rw-item[^`]*rank-hex/.test(app), '14. no rank emblem on items');
ok((app.match(/rw-icon-only/g) || []).length >= 3, '14. the results show items as icons');
ok(/id="epCapsule" title="\$\{escapeAttr\(capTip\)\}"/.test(app) && /🔋×\$\{capN\}<\/span> \$\{escapeHtml\(TX\('ui\.rw4-use'\)\)\}/.test(app), '7. the Energy panel shows the capsule count and a Use button (2026-10-25, PL2: one 🔋×N Use button, the count in its tooltip)');

// ---- 8. eggs
{ const g = app.match(/function grantEgg\(kind, from\)\{[\s\S]*?\n\}\n/); ok(g && !/showToast/.test(g[0]), '8. no egg toast'); }
ok(/TX\('ui\.rw4-got-egg'\)/.test(app) && /return TX\('ui\.rw4-egg-nest'\);/.test(app), '8. "You got an egg!" with the nest line on hover');
ok(T['ui.rw4-egg-nest'] === "An egg! You'll need a nest to hatch it!" && T['ui.rw4-got-egg'] === 'You got an egg!', '8. the owner\'s wording');

// ---- 10. the dim
ok(/rgba\(20,14,30,\.38\), rgba\(6,4,10,\.62\)/.test(tpl) && !/rgba\(20,14,30,\.55\), rgba\(6,4,10,\.86\)/.test(tpl), '10. the reward stage\'s dim is lighter');
ok(/gsap\.fromTo\(dimEl, \{opacity:0\}, \{opacity:1, duration:\.35/.test(app), '10. the dim rises with the first card');
ok(!/gsap\.to\(dimEl, \{opacity:1, duration:\.45/.test(app), '10. no full dim before the results open');
ok(/rgba\(0,0,0,\.14\), transparent 60%/.test(tpl), "10. the Victory sign's own dim is lighter");

// ---- 13. the card back
ok(!/🃏 \$\{fmtDropPct/.test(app) && (app.match(/cnp-drop-back bw-back bk-unit/g) || []).length === 2, '13. the drops line shows the card back, not the joker');

// ---- texts
const KEYS = Object.keys(T).filter(k=> /^ui\.rw4-/.test(k));
ok(KEYS.length === 11, `texts: 11 RW4 keys in the table (${KEYS.length})`);
const used = new Set((app.match(/TX\('ui\.rw4-[a-z-]+'/g) || []).map(s=> s.slice(4, -1)));
ok(KEYS.every(k=> used.has(k)), 'texts: every RW4 key is used by the app ' + KEYS.filter(k=> !used.has(k)).join(','));
for(const code of ['fr', 'de', 'es', 'it', 'pt', 'tl', 'ta', 'id', 'zh-Hans', 'zh-Hant', 'ja', 'ko']){
  const pack = JSON.parse(fs.readFileSync(path.join(ROOT, 'lang', code + '.json'), 'utf8')), ui = JSON.parse(fs.readFileSync(path.join(ROOT, 'lang', 'ui', code + '.json'), 'utf8'));
  const miss = KEYS.filter(k=> !(T[k] in pack) && !(T[k] in ui)); ok(!miss.length, `texts: ${code} has every RW4 row ${miss.join(',')}`);
  const bad = KEYS.filter(k=> ((T[k].match(/\{\w+\}/g) || []).sort().join() !== ((pack[T[k]] || ui[T[k]] || '').match(/\{\w+\}/g) || []).sort().join())); ok(!bad.length, `texts: ${code} keeps the {placeholders} ${bad.join(',')}`);
}
console.log(fail ? `rw4: ${fail} FAILED of ${n}` : `rw4: ${n} checks passed`);
process.exit(fail ? 1 : 0);
