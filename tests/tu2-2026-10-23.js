#!/usr/bin/env node
// 2026-10-23 (package TU2, owner answers of 00:10): static checks that
//   1. the Tutorial's way out: once T-1 and T-2 are both won (flags or progress) the Tutorial map has an exit beside T-2 to Map 0, and
//      taking it sets the flags; healTutorial2Flag restores either flag from the other / the progress (never strands the player);
//   2. the tutorial fights' Bramble Health is one number (the node's tutHp, blank = null so it really falls back) that the tutorial
//      editor edits too, and ✏️ Edit rewards on a tutorial fight edits the tutorial's own reward lists;
//   3. the Tutorial map reads T-1 … T-5 (keys unchanged); the coach tip names T-2;
//   4. the Nest lists recruits only, in two tabs (Eggs and babies, Level 0); a faction card's new copy comes at Level 0;
//   5. Promotion is its own "Coming soon" page with no controls, reached from the Forge;
//   6. Krooni are retired for players (no grant, no wallet / pack line), balances and Admin untouched;
//   7. the daily dungeons are hidden from players (preview), no entrance on their parent map;
//   8. the A-rank raid ticket is a Bonus Raid Ticket with its own outline.
// The flows were played headlessly at 390 and 1366; screenshots in docs/screens/TU2/.
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
const CODES = ['de','es','fr','id','it','ja','ko','pt','ta','tl','zh-Hans','zh-Hant'];
const packs = Object.fromEntries(CODES.map(c=> [c, Object.assign({}, JSON.parse(fs.readFileSync(path.join(ROOT, 'lang', c + '.json'), 'utf8')), JSON.parse(fs.readFileSync(path.join(ROOT, 'lang', 'ui', c + '.json'), 'utf8')))]));
const LEAD = /^(?:\p{Extended_Pictographic}|️|‍|\s)+/u;

// --- 1. the way out, and the self-healing start map
{
  const heal = fnSrc('healTutorial2Flag');
  let st = {}, completed = [];
  const mk = ()=> new Function('loadTutorial2Done', 'loadTutorialDone', 'loadConquestProgress', 'saveTutorial2Done', 'saveTutorialDone', heal + '\nreturn healTutorial2Flag;')(
    ()=> !!st.t2, ()=> !!st.t1, ()=> ({completed}), ()=>{ st.t2 = true; }, ()=>{ st.t1 = true; });
  st = {t1:true}; completed = ['mtut:tutorial']; ok(mk()() === false && !st.t2, '1. T-1 alone: T-2 still to play');
  st = {t1:true}; completed = ['mtut:tutorial', 'mtut:tutorial2']; ok(mk()() === true && st.t2, '1. T-2 in the progress restores its flag');
  st = {}; completed = ['mtut:tutorial', 'mtut:tutorial2']; ok(mk()() === true && st.t1 && st.t2, '1. both flags lost, both won: both come back (never stranded)');
  st = {t2:true}; completed = []; ok(mk()() === true && st.t1, '1. the T-2 flag without the T-1 flag: T-1 comes back');
  st = {}; completed = ['m1:0-1']; ok(mk()() === false && !st.t2, '1. nothing from before T-1');
}
const exitFn = fnSrc('subMapExitHTML');
ok(/if\(tut && !tutorialPairDone\(\)\) return '';/.test(exitFn) && /n\.key === 'tutorial2'/.test(exitFn) && /TX\('map\.tu2-exit'/.test(exitFn), '1. the Tutorial exit opens with both tutorials, beside T-2, to Map 0');
ok(/if\(map\.id === 'mtut'\)\{ healTutorial2Flag\(\); if\(!loadTutorialDone\(\)\) saveTutorialDone\(\); if\(!loadTutorial2Done\(\)\) saveTutorial2Done\(\);/.test(src), '1. taking the exit sets the flags the full map needs');
ok(/function tutorialPairDone\(\)/.test(src), '1. tutorialPairDone');

// --- 2. tutorial Health and rewards
ok(/'enemyLevel','tutHp'\]\.forEach\(k=>\{ if\(!\(k in draft\) && \(k in base\)\) patch\[k\] = null;/.test(src), '2. a blank Bramble Health is saved as null (falls back), not snapped back to 9 / 11');
ok(/id="teRivalHp\$\{n\}"/.test(src) && /saveNodeField\('mtut', tn\.key, 'tutHp', v\)/.test(fnSrc('saveTutorialRivalHpFields')), '2. the tutorial editor edits each fight\'s tutHp as a node edit');
ok(!/id="teRivalHp" /.test(src), '2. the old single Rival bramble HP field (which the nodes always beat) is gone');
ok(/if\(found\.node\.kind === 'tutorial'\) return openTutorialRewardsEditor\(/.test(fnSrc('openNodeRewardsEditor')), '2. Edit rewards on a tutorial fight opens the tutorial rewards editor');
ok(/next\.rewards = ids;/.test(fnSrc('openTutorialRewardsEditor')) && /next\.rewards2 = /.test(fnSrc('openTutorialRewardsEditor')) && /publishTutorialCfg\(\)/.test(fnSrc('openTutorialRewardsEditor')), '2. it saves tutorialCfg.rewards / rewards2 and publishes them');

// --- 3. labels
ok(/return `T-\$\{Math\.max\(1, node\.stage\|\|1\)\}`;/.test(fnSrc('skirmishCode')), '3. the tutorials read T-1 / T-2');
ok(/key:"T-2", code:"T-3"/.test(src) && /key:"T-3", code:"T-4"/.test(src) && /key:"T-4", code:"T-5"/.test(src), '3. the later three read T-3 / T-4 / T-5, keys kept');
ok(TEXT['coach.tap-t-2-then-press-fight'] === '🎓 Tap T-2, then press ⚔️ Fight.' && !TEXT['coach.tap-t-1-then-press-fight'], '3. the coach tip names T-2');

// --- 4. the Nest
const nest = fnSrc('renderNest');
ok(/\['eggs', '🥚 ' \+ TX\('ui\.tu2-nest-tab-eggs'\)\], \['recruits', '🌱 ' \+ TX\('ui\.tu2-nest-tab-recruits'\)\]/.test(nest) /* 2026-10-23 (release): emoji outside the TX text */, '4. two recruit tabs (+ Upgrades)');
ok(/nestTab === 'recruits' \? Object\.keys\(defs\)\.filter\([^;]*nestHasLevel0Copy\(id\)/.test(nest), '4. the Level 0 tab lists only cards with a Level-0 copy');
ok(!/ownedIds\.length \? nestGridHTML\(ownedIds, defs\)\s*\n\s*: `<div class="panel nest-empty"><p class="panel-sub" style="margin:0 0 10px;">You don't own/.test(nest), '4. no list of every owned card');
const fac = fnSrc('factionCopyLevel0');
ok(/c\.level = 0; c\.lv0 = 1;/.test(fac) && /copyLevel\(id, x\) > 0/.test(fac), '4. a faction card\'s new copy comes at Level 0, unless the card is already raised');
ok(/else factionCopyLevel0\(id\);/.test(fnSrc('unlockCardForPlayer')), '4. every grant runs it');

// --- 5. Promotion
ok(/<div id="view-promotion" hidden><\/div>/.test(tpl) && /if\(tab==='promotion'\) safeRender\('Promotion', renderPromotionPage\)/.test(src), '5. its own page');
const pp = fnSrc('renderPromotionPage');
ok(pp && !/<button|<input|<select/.test(pp) && /ui\.tu2-coming-soon/.test(pp), '5. "Coming soon", no controls');
ok(/if\(!PROMOTION_PAGE_LIVE\) return `<div class="forge-promote is-soon">[\s\S]*data-go-promotion/.test(fnSrc('forgePromotionHTML')), '5. the Forge points to it instead of the Promote controls');

// --- 6. Krooni
ok(/const KROONI_RETIRED = true;/.test(src) && /if\(kind === 'kroon' && KROONI_RETIRED\) return;/.test(fnSrc('grantCurrency')), '6. no Krooni earned');
ok(/Object\.keys\(CURRENCY_META\)\.filter\(currencyShown/.test(src) && /p\.kroon && currencyShown\('kroon'\)/.test(src), '6. not in the wallet or the pack line for players');
ok(/adminModeEnabled/.test(fnSrc('currencyShown')), '6. Admin Mode still sees them');

// --- 7. daily dungeons
ok(/const DAILY_DUNGEONS_HIDDEN = true;/.test(src) && /id:'mm', code:'MM', mapNumber:6, parent:'m8', preview: DAILY_DUNGEONS_HIDDEN/.test(src) && /id:'muc'[^\n]*preview: DAILY_DUNGEONS_HIDDEN/.test(src) && /id:'mlb'[^\n]*\|\| DAILY_DUNGEONS_HIDDEN/.test(src), '7. Murgle Mayhem, the Undercroft and the Long Burrow are previews');
ok(/!\(typeof dungeonHiddenFromPlayer === 'function' && dungeonHiddenFromPlayer\(m\)\)/.test(fnSrc('subMapEntrancesHTML')), '7. no entrance on the parent map for players');

// --- 8. Bonus Raid Ticket
ok(/addRaidBonusTickets\(tGrant\)/.test(src) && !/if\(tGrant\)\{ addRaidTicketItems\(tGrant\)/.test(src), '8. the A-rank claim pays a Bonus Raid Ticket');
ok(/\.rk-tk-ico\.is-bonus\{[^}]*outline:/.test(tpl) && /class="rk-tk-ico is-bonus"/.test(src), '8. it has its own outline');
ok(TEXT['ui.tu2-bonus-ticket-name'] === 'Bonus Raid Ticket', '8. named Bonus Raid Ticket');
ok(/PROGRESS_KEYS\.push\(RAID_BONUS_TICKET_KEY\)/.test(src), '8. it travels with the progress');

// --- texts: every new TX key is used and translated in the 12 packs
const keys = Object.keys(TEXT).filter(k=> /\.tu2-/.test(k) || k === 'coach.tap-t-2-then-press-fight');
ok(keys.length >= 30, `the TU2 keys (${keys.length})`);
for(const k of keys){
  ok(src.includes(`'${k}'`), `${k} is used`);
  const en = TEXT[k].replace(LEAD, '');
  for(const c of CODES) ok(packs[c][en], `${c} translates "${en}"`);
}
console.log(fail ? `tu2-2026-10-23: ${fail} of ${checks} checks failed` : `tu2-2026-10-23: all ${checks} checks pass`);
process.exit(fail ? 1 : 0);
