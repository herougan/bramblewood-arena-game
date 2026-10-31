#!/usr/bin/env node
// 2026-10-29 (package UI1, owner notes 10-28 23:35: O1 O2 O3 O4 O8). Reads arena_app.js, arena_template.html, bramblewood-texts.js, lang/*.json; runs the camera in a vm.
//   O1  the raid's enemy Deck (and Environment) cards keep the raid's card width AND height on a desktop window (the --match-card-h override beat the raid's pair)
//   O2  touch drags: touch-action on the cards that drag at once and on the drop zones, the drag class, handlers bound to the touched element,
//       a sideways swipe on a scrolling hand scrolls it (browser: tests/e2e/ui1_2026_10_29.py)
//   O3  the battle camera rests on the mean position of the units (both sides), no jitter, the middle when the board is empty
//   O4  one list on the Profile: the Match log; the Match History panel is gone, the data (match_history) is still written and read for stats
//   O8  the Quests tab shows only the errands (renamed Quests everywhere the player sees them); dailies / weeklies / journeys are the Dailies tab
'use strict';
const fs = require('fs'), path = require('path'), vm = require('vm');
const ROOT = path.join(__dirname, '..');
const R = f=> fs.readFileSync(path.join(ROOT, f), 'utf8');
const src = R('arena_app.js'), tpl = R('arena_template.html'), txt = R('bramblewood-texts.js');
let fail = 0, n = 0; const ok = (c, m)=>{ n++; if(!c){ fail++; console.log('  ✗', m); } };
function fnSrc(name){ const i = src.indexOf('\nfunction ' + name + '('); if(i < 0) return null; let d = 0, j = src.indexOf('{', i);
  for(let k = j; k < src.length; k++){ const ch = src[k]; if(ch === '{') d++; else if(ch === '}'){ d--; if(!d) return src.slice(i + 1, k + 1); } } return null; }
const CODES = ['fr', 'de', 'es', 'it', 'pt', 'tl', 'ta', 'id', 'zh-Hans', 'zh-Hant', 'ja', 'ko'];
const pack = c=> JSON.parse(R('lang/' + c + '.json')), uiPack = c=> JSON.parse(R('lang/ui/' + c + '.json'));

// ---- O1 the raid's card size on a desktop window
// 2026-10-30 (CS-D): the desktop window's rule only sets --mc-fit now, so the raid's own pair wins without UI1's repeat; no rule sets the height alone
{ ok(/#appWrap\.in-match\.mb2-raid\{--match-card-h:var\(--mb2-th, 82px\); --match-card-w:calc\(var\(--mb2-th, 82px\) \* \.8\);\}/.test(tpl) && !/html\.is-desk-centre #appWrap\.in-match\{--match-card-h/.test(tpl),
    'O1: the raid sets --match-card-h and --match-card-w together, and a desktop window no longer sets the height alone');
  ok(/html\.is-desk-centre #appWrap\.in-match\{--mc-fit:var\(--res3-fit, 1\);\}/.test(tpl), 'O1: ... the desktop window only scales the one formula (tests/cs-d-2026-10-30.js checks it)'); }

// ---- O2 touch drags
{ ok(/#handStrip \[draggable="true"\], #leaderWidget\[draggable="true"\], #view-play \.battlefield \[draggable="true"\], \.discardzone, \.skipzone, \.reserve-target\{touch-action:none;\}/.test(tpl), 'O2: touch-action none on the hand\'s cards, the leader, the board\'s cards and the drop zones');
  ok(/#handStrip\.hs-scroll \[draggable="true"\]\{touch-action:pan-x;\}/.test(tpl), 'O2: ... a scrolling hand lets its cards pass a sideways swipe on');
  ok(/body\.bw-touch-dragging, body\.bw-touch-dragging \*\{touch-action:none !important;\}/.test(tpl) && /overscroll-behavior:none/.test(tpl.slice(tpl.indexOf('body.bw-touch-dragging, body.bw-touch-dragging *'), tpl.indexOf('body.bw-touch-dragging, body.bw-touch-dragging *') + 400)), 'O2: for a whole drag the page takes no touch scroll and no overscroll chaining');
  const shim = src.slice(src.indexOf('(function initTouchDragShim(){'), src.indexOf('// In-page dropdowns (2026-10-12'));
  ok(/classList\.add\('bw-touch-dragging'\)/.test(shim) && /classList\.remove\('bw-touch-dragging'\)/.test(shim), 'O2: the shim sets and clears the drag class');
  ok(/targetEl\.addEventListener\('touchmove', onTouchMove, \{passive:false\}\)/.test(shim) && /new WeakSet\(\)/.test(shim) && /handled\.has\(e\)/.test(shim), 'O2: the touched element also hears the finger (a redraw takes it out of the page) and each event is handled once');
  ok(/if\(e\.cancelable\) e\.preventDefault\(\);/.test(shim), 'O2: preventDefault on every move of a drag, while it can be cancelled');
  ok(/closest\('#handStrip\.hs-scroll'\) && Math\.abs\(dx\) > 1\.3\*Math\.abs\(dy\)/.test(shim), 'O2: on a scrolling hand a mostly sideways move scrolls it, a mostly vertical one drags');
  ok(/holdNeeded && Date\.now\(\) - startAt >= HOLD_TO_DRAG_MS && e\.cancelable\) e\.preventDefault\(\)/.test(shim) && /moved before the hold: let the page scroll/.test(shim), 'O2: a deck card held for the hold time stops the scroll before the drag; moving before the hold still scrolls');
  ok(/function syncHandScroll\(\)/.test(src) && /setTimeout\(syncHandScroll, 0\)/.test(fnSrc('renderHand')), 'O2: renderHand keeps .hs-scroll in step with the hand\'s width');
  // a touch outside any draggable never reaches preventDefault
  const ts = shim.slice(shim.indexOf('function onTouchStart(e){'), shim.indexOf('function detachTargetListeners'));
  ok(/if\(!t \|\| t\.getAttribute\('draggable'\)==='false'\) return;/.test(ts) && !/preventDefault/.test(ts), 'O2: a touch that starts outside a draggable card sets no candidate and is never prevented'); }

// ---- O3 the camera on the mass of units
{ const f = fnSrc('setBoardLean'); const ctx = {}; vm.createContext(ctx); vm.runInContext('var battlefieldLeanX = 0, battlefieldTilt = 0, battlefieldPanLo = 0, battlefieldPanHi = 0;\n' + f, ctx);
  const L = (c, minX, maxX, W = 1200, colW = 100)=> ({c, minX, maxX, W, colW});
  ctx.setBoardLean(L(220, 100, 350), 1, 0); ok(Math.abs(ctx.battlefieldLeanX + 220) < 1, `O3: units right of the middle: the camera goes to their mean (${ctx.battlefieldLeanX})`);
  ctx.setBoardLean(L(-180, -400, 0), 1, 0); ok(Math.abs(ctx.battlefieldLeanX - 180) < 1, `O3: units left of the middle: the other way (${ctx.battlefieldLeanX})`);
  ctx.setBoardLean(null, 1, 0); ok(ctx.battlefieldLeanX === 0, 'O3: an empty board falls back to the middle');
  ctx.setBoardLean(L(0, -50, 50), 1, 0); ok(ctx.battlefieldLeanX === 0, 'O3: units around the middle: the camera stays in the middle');
  ctx.setBoardLean(L(300, 250, 350), 1, 0); const a = ctx.battlefieldLeanX; ctx.setBoardLean(L(312, 250, 362), 1, 0);
  ok(ctx.battlefieldLeanX === a, `O3: a mass that moved a few px keeps the camera still (no jitter) (${a} -> ${ctx.battlefieldLeanX})`);
  ctx.setBoardLean(L(380, 250, 420), 1, 0); ok(Math.abs(ctx.battlefieldLeanX - a) > 40, `O3: a mass that moved by a column or more moves it (${a} -> ${ctx.battlefieldLeanX})`);
  ctx.setBoardLean(L(400, -560, 560), 1, 0); ok(Math.abs(ctx.battlefieldLeanX) <= 16.5, `O3: never so far that a card leaves the frame (the mean wants -400, the camera takes ${ctx.battlefieldLeanX})`);
  ok(/if\(cards\.length < 1\) return null;/.test(fnSrc('measureBoardLean')) && /c: sum\/cards\.length/.test(fnSrc('measureBoardLean')), 'O3: the measure is the mean over every unit on the board (both sides, one card is enough, none gives null)');
  ok(!/lean\.minX >= -2\.5\*lean\.colW/.test(fnSrc('setBoardLean')), 'O3: the "stay put while all cards sit in the middle five columns" rule is gone');
  ok(/fitBattlefieldZoom\._match = matchState; battlefieldLeanX = 0;/.test(src), 'O3: a new match forgets the old camera'); }

// ---- O4 one list: the Match log
{ ok(!/function matchHistoryPanelHTML|function wireMatchHistoryPanel|\$\{matchHistoryPanelHTML\(\)|\n\s*wireMatchHistoryPanel\(\);/.test(src), 'O4: the Match History panel and its wiring are gone');
  const prof = src.slice(src.indexOf('${matchLogPanelHTML()'), src.indexOf('${matchLogPanelHTML()') + 300);
  ok(/\$\{matchLogPanelHTML\(\)/.test(src) && /wireMatchLogPanel\(root\)/.test(src), 'O4: the Profile still renders and wires the Match log');
  ok(!/match-history-list|match-history-row|match-history-log|\.mh-result/.test(tpl + src), 'O4: its CSS and markup classes are gone');
  ok(!/Match History<\/h2>/.test(src), 'O4: no "Match History" heading is left to show');
  ok(/from\('match_history'\)\.insert/.test(src) && /from\('match_history'\)\.select/.test(src) && /matchHistoryList\.forEach/.test(src), 'O4: the match_history rows are still written and read (the stats panel uses them; no table was touched)'); }

// ---- O8 Quests are the errands; Dailies are their own tab
{ const shell = fnSrc('questsModalShellHTML');
  ok(/data-qn-tab="notices"[^>]*>📅 Dailies<\/button>/.test(shell), 'O8: the first tab is Dailies');
  ok(/data-qn-tab="errands"[^>]*>📜 Quests\$\{erBadge\}<\/button>/.test(shell), 'O8: the second tab is Quests');
  const body = shell.slice(shell.indexOf('const body ='), shell.indexOf('return `<div class="modal quests-modal'));
  const [onQuests, onDailies] = [body.slice(body.indexOf('onErr'), body.indexOf(': `<p class="qn-sub">Jobs posted')), body.slice(body.indexOf(': `<p class="qn-sub">Jobs posted'))];
  ok(/errandsBoardHTML\(\)/.test(onQuests) && !/noticeQuestListHTML|dailyBoard|section\('weekly'|journeysHTML/.test(onQuests), 'O8: the Quests tab holds the errands and no daily / weekly / journey');
  ok(!/noticeQuestListHTML\(q\)/.test(onDailies) /* 2026-10-31 (UI10, EE1): the "Your dailies" summary is gone */ && /dailyBoard\(\)/.test(onDailies) && /section\('weekly'/.test(onDailies) && /journeysHTML\(\)/.test(onDailies) && !/errandsBoardHTML/.test(onDailies), 'O8: the Dailies tab holds the daily / weekly / journey notices and the "Your dailies" list');
  ok(/if\(noticesSubTab === 'errands' && !erOpen\) noticesSubTab = 'notices'/.test(shell) && /\$\{erOpen \? `<button[^`]*data-qn-tab="errands"/.test(shell), 'O8: the Quests tab appears once the Quest Board is open');
  ok(/<b>Your dailies<\/b>/.test(src) && !/<b>Your quests<\/b>/.test(src), 'O8: the list of dailies says so');
  // nothing the player reads says Errand any more
  const board = fnSrc('errandsBoardHTML');
  const visible = [board, fnSrc('claimErrand'), fnSrc('flushErrandToasts'), fnSrc('maybeOfferErrand')].join('\n').replace(/\/\/[^\n]*/g, '').replace(/[A-Za-z_]*errand[A-Za-z_]*/gi, '').replace(/data-errand-[a-z]+/g, '');
  ok(!/errand/i.test(visible), `O8: no visible text in the errand code says errand (${(visible.match(/.{20}errand.{20}/i) || [''])[0]})`);
  ok(/😅|Quest done!/.test(src) && /t\.thanks \|\| 'Quest done!'/.test(src) && /<span class="er-kind">📜 Quest<\/span>/.test(src) && /Give up this quest/.test(src) && /You have \$\{ERRANDS_MAX\} quests already/.test(src) && /<div class="qn-sign"><b>Quests<\/b>/.test(src) && /No quests yet\./.test(src) && /text:'Quests\. Small favours/.test(src), 'O8: the writ band, the sign, the empty line, Drop\'s tip, the limit line, the default thanks and Shieldback\'s line say quest');
  ok(/title="Notices"><i class="pin" aria-hidden="true">📌<\/i><b>📌 Notices<\/b><small>\$\{qn \? `\$\{qn\} to claim!` : 'Dailies &amp; quests'\}/.test(src), 'O8: the home note is the Notices board (Dailies & quests), not "Quests"');
  ok(/"toast\.errand-taken": "📌 Quest taken: \{label\}"/.test(txt) && /"toast\.errand-complete-claim-it-on-the": "📜 Quest complete: \{title\}\. Claim it on the Notices\."/.test(txt) && /"toast\.errand": "📜 Quest: \{title\} — \{v\}\/\{g\}"/.test(txt), 'O8: the three toasts say Quest');
  ok(!/errand/i.test(txt.replace(/"[a-z.\-]*errand[a-z.\-]*":/g, '')), 'O8: bramblewood-texts.js has no player text with "errand"');
  const newUi = ['Your dailies', 'Dailies', 'Dailies & quests', 'The favours folk asked of you on the road. Take one, finish it, and claim the reward.', 'Quests. Small favours, small rewards. They add up.', 'Give up this quest', 'You have {v1} quests already'];
  const newMain = ['Quest taken: {label}', 'Quest complete: {title}. Claim it on the Notices.', 'Quest: {title} — {v}/{g}'];
  CODES.forEach(c=>{ const p = pack(c), u = uiPack(c);
    ok(newUi.every(k=> typeof u[k] === 'string' && u[k]) && newMain.every(k=> typeof p[k] === 'string' && p[k]), `O8: ${c}: the new rows are translated`);
    ok(!Object.keys(u).concat(Object.keys(p)).some(k=> /\berrands?\b/i.test(k)), `O8: ${c}: no errand row left in the packs`);
  }); }

console.log(`ui1-2026-10-29: ${n - fail}/${n} passed`); process.exit(fail ? 1 : 0);
