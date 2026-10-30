#!/usr/bin/env node
// Package CS-A (2026-10-30; card sizes step 1, docs/design/card-sizes-2026-10-29.md; owner 10-29 19:14 "Can we reduce to just 3 or 4?",
// decisions CS-1..5 10-30 10:34). Static checks:
//   1. the four size tokens on :root (Detail, Full, Compact, Chip) and the data-size rules;
//   2. cardTileHTML(d, {size}) writes data-size for the three card sizes and nothing else;
//   3. every browsing screen moved in this step asks for size:'full' (and in-match cards do not, yet);
//   4. THE GUARD: no CSS rule for a migrated screen sets a card's width (or its grid column) in plain pixels. A width there must come from a
//      --card-* token (a cap such as min(var(--card-full-w), 15vh) is fine). A new `width:96px` on, say, `#myDeckPool .card-tile` fails here.
// The browser shots at 390 and 1366 are in docs/screens/cs-a/.
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

// --- 1. tokens
const root = (css.match(/CS-A:BEGIN[\s\S]*?:root\{([^}]*)\}/) || [])[1] || '';
const tok = n=> ((root.match(new RegExp('--' + n + ':([^;]+);')) || [])[1] || '').trim();
ok(/400px/.test(tok('card-detail-w')) && /86vw/.test(tok('card-detail-w')), `1. --card-detail-w is ≤400px / 86vw (${tok('card-detail-w')})`);
ok(tok('card-full-w') === 'clamp(84px, 22vw, 120px)', `1. --card-full-w is 120px, 86px on a 390 phone (CS-3) (${tok('card-full-w')})`);
ok(tok('card-compact-w') === '64px', `1. --card-compact-w is 64px (${tok('card-compact-w')})`);
ok(tok('chip-h') === '30px', `1. --chip-h is 30px (${tok('chip-h')})`);
ok(/--card-full-col:min\(var\(--card-full-w\), calc\(\(100% - 3 \* var\(--cs-gap\)\) \/ 4\)\)/.test(root), '1. --card-full-col: the Full width or a quarter of the row (4 a row on a phone)');
ok(/\.card-tile\[data-size="full"\]\{width:var\(--card-full-w\); max-width:100%;\}/.test(css), '1. .card-tile[data-size=full] takes the token');
ok(/\.card-tile\[data-size="compact"\]\{width:var\(--card-compact-w\);\}/.test(css) && /\.card-tile\[data-size="detail"\]\{width:var\(--card-detail-w\);\}/.test(css), '1. compact and detail rules');
ok(/@container \(max-width: 70px\)\{ \.card-tile\[data-size="full"\] \.nm\{display:flex;\} \}/.test(css), '1. a Full card keeps its name under 70px (CS-5 hides it on Compact only)');

// --- 2. cardTileHTML writes data-size
const SZ = app.slice(app.indexOf('const CARD_SIZES'), app.indexOf('\n', app.indexOf('function cardSizeAttr')));
const S = new Function(SZ + '\nreturn {cardSizeAttr, CARD_SIZES};')();
ok(S.cardSizeAttr({size:'full'}) === ' data-size="full"' && S.cardSizeAttr({size:'compact'}) === ' data-size="compact"' && S.cardSizeAttr({size:'detail'}) === ' data-size="detail"', '2. the three card sizes write data-size');
ok(S.cardSizeAttr({}) === '' && S.cardSizeAttr(null) === '' && S.cardSizeAttr({size:'huge'}) === '' && S.cardSizeAttr({size:'"><x'}) === '', '2. no size, or an unknown one, writes nothing');
const tileFn = fnSrc('cardTileHTML');
ok(/data-defid="\$\{d\.id\}"\$\{cardSizeAttr\(opts\)\}/.test(tileFn), '2. cardTileHTML puts it on the tile');

// --- 3. call sites
const FULL = ['pumpDiscoverQueue', 'renderCodexGrid', 'deckHeroBannerHTML', 'deckShowcaseHTML', 'openDeckBuilderPopup', 'renderAutobattleSubTab', 'neDeckPoolStackHTML',
  'renderMyDeckPanels', 'rewardsPanelHTML', 'rewardCastleCardHTML', 'openMatchDeckView', 'openRecentOpponentDeck', 'renderForge', 'openNestPicker', 'openPackAnimation',
  'marketBrowseHTML', 'marketSellHTML'];
FULL.forEach(n=>{ const s = fnSrc(n); ok(s && /size:'full'/.test(s), `3. ${n} asks for the Full size`); });
ok((fnSrc('renderCodexGrid').match(/size:'full'/g) || []).length >= 2, '3. the Codex: its tile and the easter-egg mask');
ok((fnSrc('rewardsPanelHTML').match(/size:'full'/g) || []).length >= 7, '3. the cards won: every kind of card won');
// later steps: in-match cards, the reveal, the hover popover and the detail keep their own sizes for now
['boardCardHTML', 'renderHand', 'leaderWidgetHTML', 'matchFieldTileHTML', 'openCardDetail', 'openCardInspector', 'fullCardHTML', 'vis4MapCardTilesHTML'].forEach(n=>{
  const s = fnSrc(n); ok(s && !/\bsize:'/.test(s), `3. ${n} is not moved yet (a later step)`); });
{ const pa = fnSrc('openPackAnimation'); ok((pa.match(/size:'full'/g) || []).length === 3 && /po2-mini[^\n]*poTile\(Object\.assign\(\{\}, defOf\(r\.id\), \{locked:false\}\), \{editable:false\}\)/.test(pa), '3. the pack summary is Full; the reveal and the tray minis are not (the flight is a later step)'); }

// --- 4. the guard
// CSS rules as {sel, body}: comments out, then the innermost `selector{body}` pairs (a rule inside @media is found as itself)
function rules(text){
  const src = text.replace(/\/\*[\s\S]*?\*\//g, ''), out = [], re = /([^{}]+)\{([^{}]*)\}/g; let m;
  while((m = re.exec(src))){ const sel = m[1].trim(); if(!sel.startsWith('@')) out.push({sel, body: m[2]}); }
  return out;
}
// a migrated screen is named by one of these in the selector...
const SCREENS = ['#codexGrid', '.al-grid', '.al-sleeve', '.cx-tile-wrap', '#forgePool', '.forge-tile', '.np-cards', '#myDeckPool', '#myDeckList', '.dt-tile', '.dt-slot',
  '.dt-empty-leader', '.dt-cap', '.dbp-pool', '.mdv-card', '.ro-deck-grid', '.ro-deck-card', '.ds-tile', '.ds-slot', '.ds-empty-leader', '.res3-fan-won', '.rw-unlocks',
  '.po2-sum-card', '.po2-sum-grid', '.mk-grid', '.mk-item', '.mk-sell-preview', '.ab-offer', '.ab-slot', '.discover-card'];
// ...and the rule is about the card or its wrapper (its width and height) when its last compound selector is one of these,
const CARDS = ['.card-tile', '.cx-tile-wrap', '.al-sleeve', '.forge-tile', '.deck-stack', '.dt-tile', '.dt-slot', '.dt-empty-leader', '.dt-cap', '.dbp-stack', '.mdv-card',
  '.ro-deck-card', '.ds-tile', '.ds-slot', '.ds-empty-leader', '.rw-card', '.res3-copy', '.po2-sum-card', '.mk-item', '.mk-sell-preview', '.np-item', '.discover-card'];
// ...or about the grid that lays the cards out (its columns)
const GRIDS = ['.al-grid', '#forgePool', '.pool-grid', '.grid-view', '#myDeckPool', '#myDeckList', '.dbp-pool', '.ro-deck-grid', '.po2-sum-grid', '.mk-grid', '.np-grid'];
// later steps (not moved in CS-A): the pickers' "large cards" pool view (owner, package MP) and the Codex's full-art view
const LATER = [/\.is-pooled\b/, /\.full-art\b/];
const CARD_PROPS = /^(width|min-width|max-width|height|min-height|flex-basis|flex)$/, GRID_PROPS = /^(grid-template-columns|grid-auto-columns)$/;
const has = (list, last)=> list.some(k=> new RegExp(k.replace(/[.#[\]]/g, '\\$&') + '(?![\\w-])').test(last));
function offenders(text){
  const bad = [];
  rules(text).forEach(r=> r.sel.split(',').map(s=> s.trim()).forEach(sel=>{
    if(!SCREENS.some(k=> sel.includes(k)) || LATER.some(re=> re.test(sel))) return;
    const last = sel.split(/[\s>+~]+/).pop().replace(/::?[a-z-]+(\([^)]*\))?/g, '');
    const props = has(CARDS, last) ? CARD_PROPS : has(GRIDS, last) ? GRID_PROPS : null; if(!props) return;
    r.body.split(';').forEach(d=>{ const i = d.indexOf(':'); if(i < 0) return; const p = d.slice(0, i).trim(), v = d.slice(i + 1).trim();
      if(props.test(p) && /\d(\.\d+)?px/.test(v) && !/var\(--card-/.test(v)) bad.push(`${sel} { ${p}:${v} }`); });
  }));
  return bad;
}
const bad = offenders(css);
ok(!bad.length, `4. no hard-coded card width on a migrated screen (use --card-full-w / --card-full-col):\n      ${bad.join('\n      ')}`);
// the guard itself catches what it should, and lets through what it should
ok(offenders('#myDeckPool .card-tile{width:96px;}').length === 1, '4. self-test: a px width on a deck pool tile is caught');
ok(offenders('@media (max-width:640px){ #myDeckPool.pool-grid{grid-template-columns:repeat(auto-fill, minmax(104px, 1fr));} }').length === 1, '4. self-test: a px grid column inside @media is caught');
ok(offenders('.ab-offer .card-tile{width:150px !important}').length === 1 && offenders('.discover-card{width:78px}').length === 1, '4. self-test: Arena offers and Discover');
ok(!offenders('.rw-panel .res3-fan-won .card-tile{width:min(var(--card-full-w), max(78px, 15vh)) !important;}').length, '4. self-test: a token with a height cap passes');
ok(!offenders('#myDeckList .dchip-minus{width:22px;} .pool-stack .ps-count{min-width:0;} .np-grid{grid-template-columns:repeat(auto-fill, minmax(min(100%, 150px), 1fr));}').length, '4. self-test: badges and other grids are not cards');
ok(!offenders('.dbp-pool.is-pooled{grid-template-columns:repeat(auto-fill, minmax(150px, 1fr));}').length, '4. self-test: the later-step list');

// --- 5. the stale per-screen sizes are gone
[['.ds-tile .card-tile{width:92px', 'profile 92px'], ['.dt-tile .card-tile{width:120px !important', 'deck top 120px'], ['.np-cards .card-tile{width:96px', 'nest 96px'],
 ['.discover-card .card-tile{width:78px', 'discover 78px'], ['.ab-offer .card-tile{width:150px', 'arena 150px'], ['#myDeckList .deck-stack{width:clamp(', 'loadout clamp'],
 ['minmax(clamp(112px, 11vw, 150px), 1fr)', 'deck pool clamp'], ['.ro-deck-grid{grid-template-columns:repeat(auto-fill, minmax(96px', 'deck view 96px'],
 ['.po2-sum-card{width:clamp(120px, 22vw, 190px)', 'pack summary clamp']].forEach(([s, n])=> ok(!css.includes(s), `5. the old ${n} rule is gone`));

console.log(`cs-a: ${checks - fail}/${checks} checks passed`);
process.exit(fail ? 1 : 0);
