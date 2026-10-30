#!/usr/bin/env node
// Package CS-C (2026-10-30; card sizes steps 4-5, docs/design/card-sizes-2026-10-29.md; owner CS-1 / CS-2 10-30 10:34). Static checks:
//   1. detailCardHTML(d, o): the one Detail card (data-dc, data-face, a focusable stage with a name, the spin, the front with the tile, the
//      decorative back = the card's own backing, CS-2), its aliases for older CSS, face down, a second face (the Forge), a span version (a button);
//   2. mountDetailCard: a drag turns the card only once it is clearly sideways (a vertical drag is left to the page: touch-action pan-y, no
//      capture before the intent), tap / Enter flips, arrows turn; detailStill = reduced motion or Effects Low / None, with no rotation in CSS;
//   3. every flip is this one: the Card Detail overlay (the inspector; no 🔍 Inspect), the pack-results viewer, the pack reveal (a tap still
//      moves on), the reward reveal (a raid's card too), the Hero's plinth, the entrance fan, the faction showcase, the Forge's before/after;
//   4. the hover popover: the Full card plus its text, a caller's line (data-pop-line; the Map cards reason, data-zoom-why), above modals;
//   5. CS-B's tray slot (--po2-slot-w) and the flight's aim are kept;
//   6. THE GUARD, CS-A's extended to the Detail screens: no CSS rule sets their card's width in plain pixels (the decorative fan is listed);
//   7. the old sizes are gone; 8. the three new texts are keyed and translated in the 12 languages.
// Browser checks: tests/e2e/cs_c_2026_10_30.py. Shots at 390 and 1366: docs/screens/cs-c/ (<screen>-before|after-<width>.jpg).
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
const block = (()=>{ const a = css.indexOf('/* CS-C:BEGIN'), b = css.indexOf('/* CS-C:END */'); return a >= 0 && b > a ? css.slice(a, b) : ''; })();
ok(!!block, '0. the CS-C block is in arena_template.html');

// --- 1. the markup
const esc = s=> String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
let still = false;
const dch = new Function('cardTileHTML', 'cardBackClass', 'escapeAttr', 'TX', 'detailStill', fnSrc('detailCardHTML') + '\nreturn detailCardHTML;')(
  (d, o)=> `<div class="card-tile ${o.extraClass || ''}" data-size="${o.size || ''}" data-defid="${d.id}"></div>`, d=> 'bw-back bk-' + d.id, esc, (k, v)=> k + ':' + (v && v.name), ()=> still);
const D = {id: 'otter-centurion', name: 'Otter Centurion'};
{ const h = dch(D, {tileOpts: {size: 'detail'}});
  ok(/^<div class="dc" data-dc data-face="front">/.test(h), '1. the root: .dc, data-dc, face up');
  ok(/<div class="dc-stage" tabindex="0" role="button" aria-label="ui\.csc-card-aria:Otter Centurion">/.test(h), '1. a focusable stage with the card\'s name (ui.csc-card-aria)');
  ok(/<div class="dc-spin"><div class="dc-face dc-front"><div class="card-tile dc-tile" data-size="detail"/.test(h) && /class="dc-glare"/.test(h), '1. the spin, the front with the tile at the Detail size, the light');
  ok(/<div class="dc-face dc-back bw-back bk-otter-centurion" aria-hidden="true">/.test(h), '1. the back is the card\'s own decorative backing (CS-2: no lore or levels)'); }
{ const h = dch(D, {face: 'back', focus: false, tag: 'span', alias: {spin: 'po2-flip', front: 'po2-front', back: 'po2-back'}, tile: '<i>T</i>'});
  ok(/^<span class="dc" data-dc data-face="back"><span class="dc-stage">/.test(h) && !/<div/.test(h), '1. face down, not focusable (its button is), spans inside a button');
  ok(/dc-spin po2-flip/.test(h) && /dc-front po2-front/.test(h) && /dc-back bw-back bk-otter-centurion po2-back/.test(h) && /<i>T<\/i>/.test(h), '1. an older screen\'s classes ride along (aliases), a given front'); }
{ const h = dch(null, {tile: 'BEFORE', backHTML: 'AFTER', focus: false, cls: 'dc-flow'});
  ok(/class="dc dc-flow"/.test(h) && /dc-back dc-back-face[^"]*" aria-hidden="true">AFTER</.test(h) && /BEFORE/.test(h), '1. a second face instead of a backing (the Forge\'s before / after)'); }
{ still = true; ok(/class="dc is-still"/.test(dch(D, {})), '1. drawn still when detailStill()'); still = false; }

// --- 2. the controller and the still mode
{ const m = fnSrc('mountDetailCard'), st = fnSrc('detailStill');
  ok(/reducedMotion\(\)/.test(st) && /!fxAtLeast\('med'\)/.test(st), '2. still = prefers-reduced-motion or Effects Low / None');
  ok(/Math\.abs\(dx\) > 8 && Math\.abs\(dx\) > Math\.abs\(dy\) \* 1\.3/.test(m), '2. a drag turns the card only once it is clearly sideways');
  ok(/else if\(Math\.abs\(dy\) > 10\)\{ drag = null; return; \}/.test(m), '2. a vertical drag is let go (the page scrolls)');
  const cap = m.indexOf('setPointerCapture'), intent = m.indexOf('Math.abs(dx) > 8');
  ok(cap > intent && intent > 0 && (m.match(/setPointerCapture/g) || []).length === 1, '2. the pointer is captured only after the sideways intent (never on pointerdown)');
  ok(/if\(s0\)\{ spin\.style\.transform = '';/.test(m) && /if\(still\(\)\)\{ if\(Math\.abs\(e\.clientX - d0\.x\) > 40\) flip/.test(m), '2. still: no transform, a long swipe swaps the faces');
  ok(/\(e\.pointerType === 'mouse' \|\| e\.pointerType === 'pen'\) && can\(o\.tilt\) && !still\(\)/.test(m), '2. the tilt follows a mouse or pen only, never in still mode');
  ok(/e\.key === 'Enter' \|\| e\.key === ' '/.test(m) && /ArrowLeft/.test(m) && /swallowClick/.test(m), '2. Enter / Space flip, arrows turn, the click after a spin is swallowed');
  ok(/\.dc-stage\{[^}]*touch-action:pan-y/.test(block), '2. CSS: the stage lets a vertical touch drag scroll (touch-action:pan-y)');
  ok(/\.card-inspect \.ci-stage\{touch-action:auto/.test(block), '2. CSS: the Inspector\'s old stage no longer blocks scrolling (was touch-action:none)');
  ok(/\.dc\.is-still \.dc-spin\{transform:none !important/.test(block) && /\.dc\.is-still\[data-face="front"\] \.dc-back, \.dc\.is-still\[data-face="back"\] \.dc-front\{opacity:0; visibility:hidden;\}/.test(block), '2. CSS still: no rotation, the faces swap');
  ok(/\.dc\[data-face="back"\] \.dc-spin\{transform:rotateY\(180deg\)/.test(block), '2. CSS: the markup alone turns by data-face');
  ok(/@media \(prefers-reduced-motion: reduce\)\{ \.dc-spin\{transition:none !important;\} \}/.test(block), '2. CSS: reduced motion has no transition either'); }

// --- 3. every flip is the one Detail card
{ const cd = fnSrc('openCardDetail'), ci = fnSrc('openCardInspector');
  ok(/mountDetailView\(overlay\.querySelector\('\.cd-dc'\), d, cdSt\)/.test(cd) && /detailBarHTML\(d, cdSt\)/.test(cd), '3. the Card Detail overlay: the Detail card with the Inspector\'s controls');
  ok(!/cdInspectBtn/.test(app) && !/class="cd-inspect-btn"/.test(cd), '3. no 🔍 Inspect button (the card itself is the inspector)');
  ok(/if\(!opts\.pull && !opts\.over && document\.getElementById\('cardDetailOverlay'\)\)\{ openCardDetail\(defId/.test(ci), '3. the inspector opens the Card Detail overlay (the Nest\'s viewer too)');
  ok(/mountDetailView\(ov, d, st\)/.test(ci) && /neInspectDetailHTML\(d\)/.test(ci) && /ci-split/.test(ci) && !/requestAnimationFrame/.test(ci), '3. over the pack opener: the same Detail card and text, no second spin loop');
  const bar = fnSrc('detailBarHTML');
  ok(/data-dc-spin/.test(bar) && /data-dc-flip/.test(bar) && /CI_FINISHES/.test(bar) && /adminModeEnabled/.test(bar) && /ci-skin/.test(bar) && /ci-fxbtn/.test(bar), '3. the controls keep Spin, the admin finishes, skins and ▶ Attack, and add Flip');
  const pa = fnSrc('openPackAnimation');
  ok(/detailCardHTML\(d, \{tag:'span', face:'back', focus:false/.test(pa) && /dcSetFace\(c, 'front'\)/.test(pa), '3. the pack reveal: the Detail card face down, turned up on reveal');
  ok(/mountDetailCard\(c, \{tap:'none', keys:false, settle:'front', spin: \(\)=> c\.classList\.contains\('is-revealed'\)/.test(pa), '3. the pack reveal: a revealed card turns with a drag and settles face up; a tap still moves on (the button\'s click)');
  ok(/c\.addEventListener\('click', \(\)=>\{ try\{ act\(c\); \}/.test(pa) && /openCardInspector\(c\.dataset\.poview, \{returnFocus: c, pull:/.test(pa), '3. the pack\'s own actions are kept (tap reveals / collects, the results open the viewer)');
  const rr = fnSrc('playRewardReveal');
  ok(/detailCardHTML\(defs\[id\], \{face:'back', focus:false/.test(rr) && /dcSetFace\(c, 'front'\)/.test(rr) && /mountDetailCard\(c, \{spin:false, tap:'none', keys:false\}\)/.test(rr), '3. the reward reveal (a raid\'s card too): the Detail card, turned up as the shine flashes');
  ok(/stage\.addEventListener\('pointerdown', finish\)/.test(rr), '3. the reward reveal: any tap still skips');
  ok(/detailCardHTML\(d, \{extraClass:'is-hero-card', tileOpts:\{size:'detail'\}\}\)/.test(app) && /const hc = body\.querySelector\('\.hero-card-big\.has-dc'\); if\(hc\) mountDetailCard\(hc, \{\}\)/.test(app), '3. the Hero\'s plinth: the Detail card');
  ok(/detailCardHTML\(defs\[id\], \{tile: tile\(id\), face: reduceFan \? 'front' : 'back'/.test(fnSrc('dressEntrance')) && /dcSetFace\(el, 'front'\)/.test(fnSrc('dressEntrance')), '3. the entrance fan: the same markup and flip');
  ok(/detailCardHTML\(d, \{tile: cardTileHTML\(d, \{inPlay:true\}\)/.test(fnSrc('pl1FsFlipHTML')) && /dcSetFace\(el, 'back'\)/.test(fnSrc('pl1FactionCardCycle')), '3. the faction showcase: the same markup and flip');
  ok(/detailCardHTML\(null, \{tile: opts\.frontHTML\|\|'', backHTML: opts\.backHTML\|\|''/.test(fnSrc('flipRevealCard')) && /dcSetFace\(mountEl, 'back'\)/.test(fnSrc('flipRevealCard')), '3. the Forge\'s before / after: the same markup and flip');
  ok(!/class="ef-flip"/.test(app) && !/class="pl1-fsf-in"/.test(app) && !/class="flip3d-inner"/.test(app) && !/<span class="po2-flip">/.test(app) && !/class="rr-back \$\{/.test(app) && !/class="ci-spin"/.test(app), '3. none of the six old flip markups is left'); }

// --- 4. the hover popover
{ const f = fnSrc('fullCardHTML'), z = fnSrc('wireRewardZoom');
  ok(/size:'full', extraClass:'card-pop-visual-tile'/.test(f), '4. the popover\'s card is the Full card (CS-1)');
  ok(/opts\.line \? `<div class="cp-line">\$\{escapeHtml\(opts\.line\)\}<\/div>`/.test(f) && /\.dataset\.popLine/.test(app), '4. a caller\'s extra line (data-pop-line), escaped');
  ok(/cardPopTextHTML\(d\); z\.classList\.add\('cp-sheet'\)/.test(z) && /abilityListHTML\(lines\)/.test(fnSrc('cardPopTextHTML')), '4. the gallery popover: the Full card plus its skills and flavour');
  ok(/el\.dataset\.zoomWhy/.test(z) && /cnp-rw-above/.test(z), '4. the Map cards reason still rides in it, and it still sits above a modal');
  ok(/\.cnp-rw-zoom\.cnp-rw-above\{z-index:900;\}/.test(css) && /#cardPop\{z-index:2100 !important;\}/.test(css) && /\.modal-overlay\{[^}]*z-index:600/.test(css), '4. z-order: both popovers above a modal overlay (600)');
  ok(/Math\.min\(innerHeight - zh - 8/.test(z) && /top = Math\.max\(8, top\)/.test(z), '4. the gallery popover stays on screen (beside the card when there is no room above or below)');
  ok(/r\.right \+ 10 \+ pwReal > window\.innerWidth - 8 && r\.left - pwReal - 10 < 8/.test(app) && /left = Math\.max\(8, Math\.min\(left, window\.innerWidth - pwReal - 8\)\)/.test(app), '4. the page popover goes above / below a card when there is no room beside it, never off screen'); }

// --- 5. CS-B's tray
ok(/\.po2-got\.has-slots\{--po2-slot-w:/.test(css) && /mini\.parentElement\.classList\.contains\('po2-slot'\)/.test(fnSrc('openPackAnimation')), '5. the tray\'s Full slot (--po2-slot-w) and the flight\'s aim at it are kept');
ok(/\.po2-deck\{--cw:var\(--card-detail-w\)/.test(css) && /\.po2-stage\.po2-reveal:has\(\+ \.po2-got\.has-slots\) \.po2-deck\{--cw:min\(var\(--card-detail-w\), 50vh \* \.8\);\}/.test(block), '5. the reveal is the Detail size, capped by the window while the tray is under it');

// --- 6. the guard
function rules(text){
  const src = text.replace(/\/\*[\s\S]*?\*\//g, ''), out = [], re = /([^{}]+)\{([^{}]*)\}/g; let m;
  while((m = re.exec(src))){ const sel = m[1].trim(); if(!sel.startsWith('@')) out.push({sel, body: m[2]}); }
  return out;
}
const SCREENS = ['.dc', '.dc-stage', '.dc-spin', '.cd-dc', '.card-detail-card', '.card-inspect', '.ci-stage', '.ci-spin', '.po2-deck', '.po2-card', '.rr-card', '.hero-card-big', '.stomp-plinth',
  '#cardPop', '.cp-sheet', '.ef-card', '.pl1-fsf', '.fs-cards'];
const CARDS = ['.card-tile', '.dc', '.dc-stage', '.dc-spin', '.dc-face', '.cd-dc', '.ci-spin', '.ci-face', '.po2-deck', '.po2-card', '.rr-card', '.hero-card-big', '.card-pop-visual-tile', '.cp-sheet', '.ef-card', '.pl1-fsf'];
const CARD_PROPS = /^(width|min-width|max-width|height|min-height|flex-basis|--dc-w|--cw)$/;
// the decorative entrance fan keeps its own sizes (five cards fanned on the splash; not one large card)
const ALLOW = ['.entrance-fan .ef-card > .dc { --dc-w:168px }', '.entrance-fan .ef-card:nth-child(2) > .dc { --dc-w:184px }', '.faction-showcase .pl1-fsf > .dc { --dc-w:min(9vw, 112px) }'];
// (and the faction showcase's row of small cards, its own size before CS-C)
const pat = k=> new RegExp(k.replace(/[.#[\]]/g, '\\$&') + '(?![\\w-])');
function offenders(text){
  const bad = [];
  rules(text).forEach(r=> r.sel.split(',').map(s=> s.trim()).forEach(sel=>{
    if(!SCREENS.some(k=> pat(k).test(sel))) return;
    const last = sel.split(/[\s>+~]+/).pop().replace(/::?[a-z-]+(\([^)]*\))?/g, '');
    if(!CARDS.some(k=> pat(k).test(last))) return;
    r.body.split(';').forEach(d=>{ const i = d.indexOf(':'); if(i < 0) return; const p = d.slice(0, i).trim(), v = d.slice(i + 1).replace(/!important/, '').trim();
      if(CARD_PROPS.test(p) && /\d(\.\d+)?px/.test(v) && !/var\(--(card-|dc-w|cw|chip-|po2-slot-w)/.test(v)){ const s = `${sel} { ${p}:${v} }`; if(!ALLOW.includes(s)) bad.push(s); } });
  }));
  return bad;
}
const bad = offenders(css);
ok(!bad.length, `6. no hard-coded card width on a Detail screen (use --card-detail-w / --dc-w / --card-full-w):\n      ${bad.join('\n      ')}`);
ok(offenders('.rr-card{position:relative; width:220px; height:275px;}').length === 2 && offenders('#view-stomp .stomp-plinth .hero-card-big .card-tile{width:168px !important;}').length === 1, '6. self-test: the old reward and plinth sizes are caught');
ok(offenders('.ci-spin{width:min((100vh - 190px) * .8, 80vw, 400px); min-width:150px;}').length === 2 && offenders('#cardPop .card-pop-visual-tile{width:204px}').length === 1, '6. self-test: the old inspector and popover sizes are caught');
ok(offenders('.entrance-fan .ef-card > .dc{--dc-w:168px;}').length === 0 && offenders('.entrance-fan .ef-card > .dc{--dc-w:170px;}').length === 1, '6. self-test: only the listed fan sizes pass');
ok(!offenders('.dc{--dc-w:var(--card-detail-w); width:var(--dc-w); max-width:100%;} .po2-card .dc-spin{transform:none}').length, '6. self-test: tokens pass');

// --- 7. the old sizes are gone
[['.rr-card{position:relative; width:220px; height:275px;}', 'reward flip 220×275'], ['.rr-card .rr-front .card-tile{width:220px', 'reward tile 220'],
 ['.hero-card-big .card-tile{width:150px', 'Hero card 150×188'], ['.stomp-plinth .hero-card-big{width:168px', 'plinth 168'], ['.stomp-plinth .hero-card-big .card-tile{width:168px', 'plinth tile 168×210'],
 ['.ci-spin{position:relative; transform-style:preserve-3d; will-change:transform; width:min(', 'inspector spin'], ['#cardPop .card-pop-visual-tile{width:150px', 'popover card 150'],
 ['#cardPop .card-pop-visual-tile{width:204px', 'popover card 204'], ['.card-detail-card .card-pop-visual-tile{width:', 'detail card (three rules)'], ['.entrance-fan .ef-card .card-tile{width:168px', 'fan tile 168'],
 ['.fs-cards .card-tile{width:min(9vw, 112px)', 'showcase tile']].forEach(([s, n])=> ok(!css.includes(s), `7. the old ${n} rule is gone`));

// --- 8. texts
{ const tx = rd('bramblewood-texts.js');
  const EN = {'ui.csc-flip': 'Flip', 'ui.csc-hint': 'Drag sideways to turn it · tap to flip it over', 'ui.csc-card-aria': '{name}: drag sideways to turn it, Enter to flip it over'};
  Object.entries(EN).forEach(([k, v])=> ok(tx.includes(`"${k}": ${JSON.stringify(v)}`), `8. ${k} is keyed`));
  ['de', 'es', 'fr', 'id', 'it', 'ja', 'ko', 'pt', 'ta', 'tl', 'zh-Hans', 'zh-Hant'].forEach(c=>{ const j = JSON.parse(rd(`lang/${c}.json`));
    ok(Object.values(EN).every(v=> j[v] && j[v] !== v), `8. lang/${c}.json translates the three texts`); }); }

console.log(`cs-c: ${checks - fail}/${checks} checks passed`);
process.exit(fail ? 1 : 0);
