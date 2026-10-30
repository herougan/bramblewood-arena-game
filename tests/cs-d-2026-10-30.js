#!/usr/bin/env node
// Package CS-D (2026-10-30; card sizes steps 6-7, docs/design/card-sizes-2026-10-29.md; owner CS-5 10-30 10:34). Static checks:
//   1. in a match every card is Compact: the board's inner tile (the .board-card wrapper is untouched: GSAP Flip and the play animation read
//      its data-uid), the hand, the leader (summonable and caged), both Brambles and the Environment / field cards ask for size:'compact', and
//      the live (board) face writes data-size too; no in-match renderer uses the Detail card (mountDetailCard would fight drag-to-play);
//   2. Compact in a match is the match card: the in-match width rule, the registered --match-card-w/h (@property, so JS reads px and w is
//      always h x .8 where it is declared), the name hidden at 70px or less (CS-5, the container query);
//   3. ONE match-card formula: the >=701 rule is the only declaration of --match-card-h with the viewport-height formula; the tablet, the big
//      screen, the desktop window's --res3-fit and the tablet field's x1.15 set its parameters only; the dead phone battlefield pair and UI1's
//      raid repeat are gone, and the raid's own pair still sets height and width together;
//   4. THE GUARD (step 7): no CSS rule gives a .card-tile a pixel width outside the size tokens, except the ALLOW list below (screens no step
//      has moved yet, and height caps). A new `width:96px` on any `... .card-tile` fails here; an ALLOW entry that is gone must leave the list.
// Browser checks: tests/e2e/cs_d_2026_10_30.py (sizes at 390 / 768 / 1024 / 1366x768 / 1366x860 / 1920, the raid's top row, hold-to-peek).
// Shots: docs/screens/cs-d/.
'use strict';
const fs = require('fs'), path = require('path');
const ROOT = path.join(__dirname, '..');
const rd = rel=> fs.readFileSync(path.join(ROOT, rel), 'utf8');
let fail = 0, checks = 0; const ok = (c, m)=>{ checks++; if(!c){ fail++; console.log('  ✗', m); } };
const app = rd('arena_app.js'), css = rd('arena_template.html');
function fnSrc(name){
  const a = app.indexOf('\nfunction ' + name + '('); if(a < 0) return '';
  let i = app.indexOf('{', a), depth = 0;
  for(; i < app.length; i++){ const ch = app[i]; if(ch === '{') depth++; else if(ch === '}'){ depth--; if(!depth) break; } }
  return app.slice(a + 1, i + 1);
}
// CSS rules as {sel, body} (comments out; the innermost `selector{body}` pairs, so a rule inside @media is found as itself)
function rules(text){
  const src = text.replace(/\/\*[\s\S]*?\*\//g, ''), out = [], re = /([^{}]+)\{([^{}]*)\}/g; let m;
  while((m = re.exec(src))){ const sel = m[1].trim(); if(!sel.startsWith('@')) out.push({sel, body: m[2]}); }
  return out;
}
const block = (()=>{ const a = css.indexOf('/* CS-D:BEGIN'), b = css.indexOf('/* CS-D:END */'); return a >= 0 && b > a ? css.slice(a, b) : ''; })();
ok(!!block, '0. the CS-D block is in arena_template.html');

// --- 1. in-match call sites
const board = fnSrc('boardCardHTML'), hand = fnSrc('renderHand'), lead = fnSrc('leaderWidgetHTML'), castle = fnSrc('matchCastleTileHTML'), field = fnSrc('matchFieldTileHTML');
ok(/cardTileHTML\(fightTreatedDef\([^)]*\), opts\.pid\), \{inPlay:true, size:'compact'/.test(board), '1. the board\'s inner tile is Compact');
ok(/class="board-card /.test(board) && /data-uid="\$\{c\.uid\}"/.test(board), '1. the .board-card wrapper and its data-uid are unchanged');
ok(/cardTileHTML\(d, \{inPlay:true, size:'compact'[^}]*hand:\{whyNot\}/.test(hand), '1. the hand is Compact');
ok((lead.match(/leader-card-face', inPlay:true, size:'compact'/g) || []).length === 2, '1. the leader (summonable and caged) is Compact');
ok(/isCastle: true, size: 'compact'/.test(castle), '1. both Brambles are Compact');
ok(/cardTileHTML\(def, \{inPlay:true, size:'compact'/.test(field), '1. the Environment / field cards are Compact (also the Arena\'s rule cards: .arena2 sets their --match-card-w)');
{ const tile = fnSrc('cardTileHTML'), i = tile.indexOf('if(live){'), live = i >= 0 ? tile.slice(i, i + 1600) : '';
  ok(/data-defid="\$\{d\.id\}"\$\{cardSizeAttr\(opts\)/.test(live), '1. the live (board) face writes data-size'); }
['boardCardHTML', 'renderHand', 'leaderWidgetHTML', 'matchCastleTileHTML', 'matchFieldTileHTML', 'renderMatchUI', 'renderBoard'].forEach(n=>{
  const s = fnSrc(n); ok(s && !/mountDetailCard|detailCardHTML|size:'(full|detail)'/.test(s), `1. ${n}: no Full or Detail card in a match`); });

// --- 2. Compact in a match
ok(/@property --match-card-w\{syntax:'<length>'; inherits:true; initial-value:119px;\}/.test(block) && /@property --match-card-h\{syntax:'<length>'; inherits:true; initial-value:149px;\}/.test(block),
  '2. --match-card-w/h are registered lengths');
ok(block.includes('.card-tile[data-size="compact"]:is(.match-field-tile, .match-castle-tile, .leader-card-face), .hand-strip > .card-tile[data-size="compact"]{width:var(--match-card-w);}'),
  '2. a Compact card in a match is the match card wide (not the 64px outside one)');
ok(block.includes('.board-card > .card-tile[data-size="compact"]{width:100%;}'), '2. the board\'s Compact tile fills its .board-card (a crowded row shrinks the wrapper)');
ok(/@container \(max-width: 70px\)\{ \.card-tile \.nm\{display:none;\} \}/.test(css), '2. the name hides at 70px or less (CS-5)');
ok(/\.card-tile\[data-size="compact"\]\{width:var\(--card-compact-w\);\}/.test(css), '2. outside a match Compact is still --card-compact-w (CS-B)');

// --- 3. one formula
const noCom = css.replace(/\/\*[\s\S]*?\*\//g, '');
const hDecl = noCom.match(/--match-card-h:[^;}]*/g) || [];
const formula = hDecl.filter(d=> /100dvh/.test(d));
ok(formula.length === 1, `3. one viewport formula for --match-card-h (found ${formula.length}: ${formula.join(' | ')})`);
ok(/#appWrap\.in-match, #appWrap\.in-match \.battlefield\{--match-card-h:calc\(clamp\(var\(--mc-min\), min\(\(100dvh - var\(--mc-top\)\) \/ 4\.55 \* var\(--mc-fit\), \(100vw - 110px\) \/ 6\.72\), var\(--mc-max\) \* var\(--mc-fit\)\) \* var\(--mc-k, 1\)\); --match-card-w:calc\(var\(--match-card-h\) \* \.8\);\}/.test(noCom),
  '3. the formula: clamp(min, min((100dvh - top) / 4.55 x fit, a row of 8.4 cards), max x fit) x k, w = h x .8');
ok(/#appWrap\.in-match\{--mc-min:104px; --mc-top:214px; --mc-max:149px; --mc-fit:1;\}/.test(noCom), '3. its defaults (a computer)');
ok(/#appWrap\.in-match\{--mc-min:92px;\}/.test(noCom) && /#appWrap\.in-match \.battlefield\{--mc-k:1\.15;\}/.test(noCom), '3. a tablet: a 92px floor and the field x1.15, as parameters');
ok(/#appWrap\.in-match\{--mc-top:250px; --mc-max:240px;\}/.test(noCom), '3. a big screen: as parameters');
ok(/html\.is-desk-centre #appWrap\.in-match\{--mc-fit:var\(--res3-fit, 1\);\}/.test(noCom) && !/html\.is-desk-centre #appWrap\.in-match\{--match-card-h/.test(noCom),
  '3. a desktop window\'s --res3-fit is the formula\'s fit, not a copy of the formula');
ok(!/#appWrap \.battlefield\{--match-card-w:(75|62)px/.test(noCom), '3. the dead phone battlefield pair (75x93 / 62x78) is gone');
ok(!/html\.is-desk-centre #appWrap\.in-match\.mb2-raid\{--match-card-h/.test(noCom), '3. UI1\'s raid repeat is gone (the raid\'s own pair wins again)');
ok(/#appWrap\.in-match\.mb2-raid\{--match-card-h:var\(--mb2-th, 82px\); --match-card-w:calc\(var\(--mb2-th, 82px\) \* \.8\);\}/.test(noCom), '3. the raid\'s top row: height and width set together (O1)');
// every declaration of the pair sets both or derives w from h in the same rule (the O1 bug: a rule that set only the height)
{ const lone = rules(css).filter(r=> /--match-card-h:/.test(r.body) && !/--match-card-w:/.test(r.body)).map(r=> r.sel.slice(-80));
  ok(!lone.length, `3. no rule sets --match-card-h without --match-card-w (O1):\n      ${lone.join('\n      ')}`); }
// the JS that reads the pair reads px (registered)
ok(/parseFloat\(getComputedStyle\(app\)\.getPropertyValue\('--match-card-w'\)\)/.test(fnSrc('mb2FitPhoneBoard')), '3. mb2FitPhoneBoard reads --match-card-w (px, registered)');

// --- 4. THE GUARD
// every pixel width on a .card-tile (its last compound selector) that is not a size token: "selector { prop:value }"
function widths(text){
  const out = [];
  rules(text).forEach(r=> r.sel.split(',').map(s=> s.trim()).forEach(sel=>{
    const last = sel.split(/[\s>+~]+/).pop(); if(!/\.card-tile(?![\w-])/.test(last)) return;
    r.body.split(';').forEach(d=>{ const i = d.indexOf(':'); if(i < 0) return; const p = d.slice(0, i).trim(), v = d.slice(i + 1).trim();
      if(/^(width|min-width|max-width)$/.test(p) && /\d(\.\d+)?px/.test(v) && !/var\(--(card-|match-card-)/.test(v)) out.push(`${sel} { ${p}:${v} }`); });
  }));
  return out;
}
// The allowed list (2026-10-30, CS-D): screens no card-size step has moved (each its own size today), and the height caps of the win screen.
// Remove an entry when its screen moves to a token; never add one without a reason in a comment.
const ALLOW = [
  '.card-tile { width:100px }',                                   // the base size of a tile no screen sizes
  '.grid-view.full-art .card-tile { width:168px }',               // the Codex's full-art view (CS-A: later)
  '.ce-preview .card-tile { width:150px }', '.ce-preview .card-tile { width:110px }', // the card editor's preview (admin; not moved, CS-C)
  '.rw-card .card-tile { width:84px }', '.rw-card .card-tile { width:118px }', // dead for the cards won / seen (data-size wins), but the rule also sets their height
  '.lumber-lesson .ll-card .card-tile { width:96px }',            // the Lumber lesson
  '.gd-hand-card .card-tile { width:84px }', '.gd-pick .card-tile { width:96px }', '.gd-hand-card .card-tile { width:100px }', // the group dungeon's hand and pick
  '.winloss-card.is-glory .rw-seen .card-tile { width:clamp(60px, 11vh, 96px) !important }', // the win screen's height caps (plan risk 4)
  '.rw-panel.has-split .rw-half-cards .card-tile { width:min(clamp(84px, 19vh, 160px), calc((88cqw - (var(--n, 1) - 1) * 10px) / var(--n, 1))) !important }',
  '.winloss-card .rw-panel .card-tile { width:96px !important }',
  '.cb-card .card-tile { width:120px }', '.rw3-card .card-tile { width:84px }', '.fp-choice .card-tile { width:70px }', // Camp board, reward picker, first pick
  '.card-decorator .deco-preview .card-tile { width:180px }',     // the card decorator (admin; not moved, CS-C)
  '#view-stomp .hp-card .card-tile { width:120px !important }', '#view-stomp .hp-card .card-tile { width:84px !important }', // Stomping Grounds
  '.tavern-recruit .tr-offer .card-tile { width:120px }', '.tavern-recruit .tr-offer .card-tile { width:92px }',
  '.f2b-card .card-tile { width:110px !important }', '.cd-spawn .card-tile { width:150px !important }',
  // the deck-swap thumbs (CS-B: not moved)
  '.ds2-thumb .card-tile { width:46px !important }', '.ds2-old .card-tile { width:112px !important }', '.ds2-new .card-tile { width:112px !important }',
  '.ds2-thumb .card-tile { width:36px !important }', '.ds2-old .card-tile { width:84px !important }', '.ds2-new .card-tile { width:84px !important }',
  '.ds3-row .ds2-old .card-tile { width:86px !important }', '.ds3-row .ds2-new .card-tile { width:86px !important }',
  '.ds3-row .ds2-old .card-tile { width:72px !important }', '.ds3-row .ds2-new .card-tile { width:72px !important }',
  '.ux-fcs-tile .card-tile { width:78px !important }', '.ux-fcs-tile .card-tile { width:70px !important }', // the faction showcase (CS-C: its own size)
  '.fg-rf-big .card-tile { width:120px }', '.fg-rf-pick .card-tile { width:96px }', '.fg-rf-pick .card-tile { width:84px }', '.fg-rv-front > .card-tile { width:120px }', // the Forge's refine
  '.vis5-lead-art .card-tile { width:118px !important }', '.vis5-lead-art .card-tile { width:88px !important }', // the map panel's leader art (VIS5)
];
const found = widths(css);
const count = list=> list.reduce((o, k)=> (o[k] = (o[k] || 0) + 1, o), {});
const fc = count(found), ac = count(ALLOW);
const fresh = Object.keys(fc).filter(k=> fc[k] > (ac[k] || 0)), gone = Object.keys(ac).filter(k=> (fc[k] || 0) < ac[k]);
ok(!fresh.length, `4. no new pixel width on a .card-tile (use --card-full-w / --card-compact-w / --card-detail-w / --match-card-w, or list it here with a reason):\n      ${fresh.join('\n      ')}`);
ok(!gone.length, `4. these ALLOW entries are gone from the CSS: take them off the list:\n      ${gone.join('\n      ')}`);
// the guard catches what it should and lets through what it should
ok(widths('#myDeckPool .card-tile{width:96px;}').length === 1 && widths('@media (max-width:640px){ .board-card > .card-tile{min-width:58px !important} }').length === 1, '4. self-test: a px width, also inside @media, is caught');
ok(!widths('.x .card-tile{width:var(--card-full-w)} .y .card-tile{width:min(var(--card-full-w), 15vh)} .z .card-tile{width:var(--match-card-w)} .q .card-tile{width:100%}').length, '4. self-test: tokens and percentages pass');
ok(!widths('.card-tile .nm{width:40px} .card-tile .badge{max-width:22px}').length, '4. self-test: parts of a card are not the card');

console.log(`cs-d: ${checks - fail}/${checks} checks passed`);
process.exit(fail ? 1 : 0);
