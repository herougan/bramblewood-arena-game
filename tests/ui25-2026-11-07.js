#!/usr/bin/env node
// 2026-11-07 (package UI25, owner 07:43 notes 1-4): "N cards added" toast, achievement card chip, map-end pack named by its name only, tooltip on the hidden reward card.
'use strict';
const fs = require('fs'), path = require('path');
const ROOT = path.join(__dirname, '..');
const read = f=> fs.readFileSync(path.join(ROOT, f), 'utf8');
let fail = 0, n = 0; const ok = (c, m)=>{ n++; if(!c){ fail++; console.log('  x', m); } };
const app = read('arena_app.js'), tpl = read('arena_template.html');
const CODES = ['fr', 'de', 'es', 'it', 'pt', 'tl', 'ta', 'id', 'zh-Hans', 'zh-Hant', 'ja', 'ko'];
const {TEXT} = require(path.join(ROOT, 'bramblewood-texts.js'));
['ui.ui25-mystery-title', 'ui.ui25-mystery-first', 'ui.ui25-mystery-rank', 'toast.card-added-to-your-collection'] /* 2026-11-07 (UI27 #12): ui.ui25-achv-cards retired with the chip */.forEach(k=>{
  const en = TEXT[k]; ok(!!en, 'TX key ' + k);
  CODES.forEach(c=>{ const pack = JSON.parse(read('lang/' + c + '.json')); const lk = en && en.replace(/^[^\w{]+/, ''); /* the packs key a toast by its text without the leading emoji */ ok(en && pack[lk] && pack[lk] !== lk, `${c} translates "${en}"`); }); });
ok(!TEXT['ui.rw5-end-pack'] && !TEXT['toast.rp-achv-faction-cards'], 'the retired keys are gone');
CODES.forEach(c=>{ const pack = JSON.parse(read('lang/' + c + '.json')); ok(!('{name} · Map reward' in pack) && !('Faction reward: {names}' in pack), c + ': retired rows gone'); });
ok(!/Map reward/i.test(Object.values(TEXT).filter(v=> /\{name\}/.test(v)).join('|')), 'no pack-name template says "Map reward"');
// 1: the achievement claim counts its cards
ok(/showToast\(TX\('toast\.card-added-to-your-collection', \{n: got\.length/.test(app), '1: achievement claim says N cards');
ok(!/toast\.rp-achv-faction-cards/.test(app), '1: the name-listing toast is gone');
// 3: endPackOf keeps the pack's own name
ok(/endReward:true, name: p\.name \/\*/.test(app) && !/ui\.rw5-end-pack/.test(app), '3: a map-end pack is titled by its name only');
// 4: the mystery tile carries a tooltip and a label
ok(/cnp-rw-card is-mystery[^`]*data-zoom-tip="\$\{escapeAttr\(mysteryTip\)\}"[^`]*aria-label=/.test(app), '4: mystery tile has data-zoom-tip and aria-label');
// 2: the chip counts claimable cards
// 2026-11-07 (package UI27 #12, owner 08:54: "Don't show notices like that until I see the card!"): the chip is gone; the cards show when claimed
ok(!/ui\.ui25-achv-cards/.test(app) && /function ui27RevealAchvCards/.test(app), '2 (UI27): no "cards to claim" chip; the claim shows the cards');
// 5: one message per win and per sitting of packs
ok(/nWon = \(m\.conquestCardsEarned\|\|\[\]\)\.length \+/.test(app) && /toast\.card-added-to-your-collection', \{n: nWon/.test(app), '5: one message for a win, N = all its cards');
ok(/ui25PackCards \+= opened\.reduce/.test(app) && /if\(!opts\.moreAfter\)/.test(app), '5: packs add up and show one message when no set follows');
// 6: the level badge fills (and respects Effects None)
ok(/function ui25AnimateBadge/.test(app) && /fxLevel\(\) !== 'none' && !reducedMotion\(\)\) ui25AnimateBadge/.test(app), '6: the XP badge animates unless Effects is None / reduced motion');
ok(/to\.level > from\.level/.test(app) && /'100%'/.test(app), '6: it fills across a level-up');
// 7: Boomerang is not gated
{ const m = /const SKILL_REVEAL_MAP = \{([\s\S]*?)\n\};/.exec(app); ok(m && !/boomerang\s*:/.test(m[1].replace(/\/\/[^\n]*/g, '')), '7: boomerang is not in SKILL_REVEAL_MAP'); }
ok(/^## 2026-11-07 Package UI25/m.test(read('docs/CHANGELOG.md')), 'CHANGELOG entry');
ok(/tests\/ui25-2026-11-07\.js/.test(read('tests/run-all.sh')), 'in run-all.sh');
console.log(`ui25-2026-11-07: ${n - fail}/${n} checks passed`);
process.exit(fail ? 1 : 0);
