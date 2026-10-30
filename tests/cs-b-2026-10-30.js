#!/usr/bin/env node
// Package CS-B (2026-10-30; card sizes steps 2-3, docs/design/card-sizes-2026-10-29.md; owner decisions CS-2 / CS-4 10-30 10:34). Static checks:
//   1. cardChipHTML(d, opts): the Chip (data-size="chip", art disc, name, ×N, the mystery back, no data-defid when the caller zooms itself),
//      its text is only the name (the disc's emoji is CSS), and the chip CSS reads --chip-h;
//   2. the previews outside a match ask for Compact (map fight panel: leader, enemy squad, first-clear reward; the cards seen on the win screen;
//      the deck picker's deck strip; the Forge's bulk preview), the Forge's anvil is Full, the reward zoom shows the Full card;
//   3. the lists are Chips: VIS4's strip (the review's large card is Full), the deck's card list, the graveyard peek, the drop line, the battle log
//      (logChipify, run here against a tiny fake DOM: the line's text is unchanged, each named card is a chip), the pack pile;
//   4. the pack tray: a Full slot a card, and the flight aims at the slot;
//   5. THE GUARD, CS-A's extended to these screens: no CSS rule for a CS-B screen sets a card's width in plain pixels.
// The browser shots at 390 and 1366 are in docs/screens/cs-b/ (<screen>-before|after-<width>.jpg).
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

// --- 1. the Chip
const esc = s=> String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
const chipSrc = fnSrc('cardChipHTML');
ok(!!chipSrc, '1. cardChipHTML exists');
const chip = new Function('rarityStops', 'rarityTierClass', 'escapeAttr', 'escapeHtml', chipSrc + '\nreturn cardChipHTML;')(()=> ['#aaa', '#555'], r=> 'r-' + (r || 'common'), esc, esc);
const D = {id: 'otter-kit', name: 'Otter Kit', icon: '🦦', rarity: 'common', art: 'assets/cards/otter-kit.png', attack: 2, health: 5};
const text = h=> h.replace(/<[^>]*>/g, '');
{ const h = chip(D);
  ok(/^<span class="card-chip [^"]*"/.test(h) && / data-size="chip"/.test(h) && / data-defid="otter-kit"/.test(h), '1. a chip: .card-chip, data-size="chip", data-defid (hover / hold opens the card)');
  ok(/role="img" aria-label="Otter Kit"/.test(h) && /<img class="cc-art" src="assets\/cards\/otter-kit\.png"[^>]*loading="lazy"/.test(h), '1. its art in the disc (lazy), an aria-label');
  ok(text(h) === 'Otter Kit', `1. its text is only the name (${JSON.stringify(text(h))})`);
  ok(/--rarity-a:#aaa; --rarity-b:#555/.test(h), '1. the rarity colours ring the disc'); }
{ const h = chip(Object.assign({}, D, {art: null}));
  ok(/data-ico="🦦"/.test(h) && text(h) === 'Otter Kit', '1. no art: the icon is drawn from data-ico (CSS), not text'); }
ok(/<b class="cc-n"[^>]*>×3<\/b>/.test(chip(D, {n: 3})) && /aria-label="Otter Kit ×3"/.test(chip(D, {n: 3})) && !/class="cc-n"/.test(chip(D, {n: 1})), '1. ×N for copies (not for one)');
ok(!/data-defid/.test(chip(D, {noDefid: true})), '1. noDefid: the caller zooms the card itself (no second popover)');
{ const h = chip(D, {mystery: true}); ok(/is-mystery/.test(h) && !/data-defid/.test(h) && !/Otter/.test(h) && /data-ico="❓"/.test(h), '1. the mystery chip hides the card'); }
ok(/cc-st/.test(chip(D, {stat: true})) && !/cc-st/.test(chip(D)), '1. the optional ⚔/❤');
ok(!/<script/.test(chip({id: 'x', name: '<script>', rarity: 'common'})), '1. the name is escaped');
const block = (css.match(/\/\* CS-B:BEGIN[\s\S]*?CS-B:END \*\//) || [''])[0];
ok(!!block, '1. the CS-B block in arena_template.html');
ok(/\.card-chip\{--cc-h:var\(--chip-h\);[^}]*height:var\(--cc-h\)/.test(block), '1. the chip is --chip-h (30px) tall');
ok(/\.card-chip \.cc-disc::before\{content:attr\(data-ico\);\}/.test(block), '1. the disc draws its emoji from data-ico');

// --- 2. Compact, Full
const conquest = fnSrc('renderConquestSubTab');
ok(/class="cnp-showcase"[\s\S]{0,700}size:'compact'/.test(conquest), '2. the map fight panel\'s leader is Compact');
ok(/class="cnp-sq-card"[^\n]*cardTileHTML\(edEnemyShownDef\(sumNode, id\), \{inPlay:true, size:'compact'/.test(conquest), '2. the enemy squad is Compact');
ok(/cardTileHTML\(defs\[id\], \{inPlay:true, size:'compact'/.test(fnSrc('cnpRewardStripHTML')), '2. the first-clear reward is Compact');
ok(/rw-card is-seen[^\n]*size:'compact'/.test(fnSrc('rewardsPanelHTML')), '2. the cards seen on the win screen are Compact');
ok(/class="dbp-stack\$\{pm[^\n]*size:'compact'/.test(fnSrc('openDeckBuilderPopup')), '2. the deck picker\'s deck strip is Compact');
ok(/class="fb-tile">\$\{cardTileHTML\(d, \{inPlay:true, size:'compact'/.test(fnSrc('openForgeBulk')), '2. the Forge\'s bulk preview is Compact');
ok((app.match(/\{size:'full', extraClass:'forge-preview/g) || []).length >= 16 && !/\{extraClass:'forge-preview/.test(app), '2. every card on the Forge\'s anvils is Full');
ok(/z\.innerHTML = cardTileHTML\(d, \{inPlay:true, size:'full'/.test(fnSrc('wireRewardZoom')), '2. a preview or a chip zooms to the Full card');

// --- 3. Chips
const vis = fnSrc('vis4MapCardTilesHTML');
ok(/big \? cardTileHTML\(d, \{inPlay:true, size:'full'\}\) : cardChipHTML\(d, \{noDefid:true\}\)/.test(vis), '3. VIS4: a Chip in a list, the Full card in the review (owner 10-29 19:14: large cards there)');
ok(/data-zoom="\$\{escapeAttr\(id\)\}"/.test(vis), '3. VIS4: the wrapper still zooms (hover, focus, tap)');
ok(/cardChipHTML\(defs\[id\], \{n: counts\[id\], extraClass:'dm-card'\}\)/.test(fnSrc('deckCardsStripHTML')), '3. the deck\'s card list');
ok(/cardChipHTML\([^\n]*extraClass:'gpk-mini'/.test(fnSrc('zonePeekMiniHTML')), '3. the graveyard peek');
ok(/cnp-drop-tile" data-zoom[^\n]*cardChipHTML\(d, \{noDefid:true\}\)/.test(fnSrc('cnpDropsLineHTML')), '3. the drop line');
ok(/logChipify\(row, text, ev\)/.test(fnSrc('renderLogLine')), '3. the battle log');
ok(/cardChipHTML\(defOf\(r\.id\), \{n: r\.bonusCopy \? 2 : 0\}\)/.test(fnSrc('openPackAnimation')), '3. the pack pile (no slots) lists Chips');
// logChipify against a tiny fake DOM
{
  const node = t=> ({textContent: t});
  const row = {kids: [], _t: '', appendChild(n){ this.kids.push(n); return n; }, set textContent(v){ this.kids = []; this._t = v; }, get textContent(){ return this.kids.length ? this.kids.map(k=> k.textContent).join('') : this._t; }};
  const document = {createTextNode: node, createElement: ()=> ({className: '', textContent: ''})};
  const defs = {'otter-kit': {name: 'Otter Kit', icon: '🦦'}, 'ember-tetra': {name: 'Ember Tetra', icon: '🔥'}, 'ant': {name: 'Ant', icon: '🐜'}, 'ant-scout': {name: 'Ant Scout', icon: '🐜'}};
  const made = [];
  const cardChipEl = d=>{ const c = {chip: d.name, textContent: d.name, querySelector: ()=> null, insertBefore(h){ this.textContent = h.textContent + this.textContent; this.pre = h.textContent; }}; made.push(c); return c; };
  const keys = (app.match(/const LOG_CHIP_KEYS = (\[[^\]]*\]);/) || [])[1] || '[]';
  const run = new Function('document', 'getCardDefs', 'cardChipEl', `const LOG_CHIP_KEYS = ${keys};\n` + fnSrc('logChipify') + '\nreturn logChipify;')(document, ()=> defs, cardChipEl);
  const t1 = '🦦 Otter Kit hits 🔥 Ember Tetra for 2.';
  row.textContent = t1; run(row, t1, {attDefId: 'otter-kit', targetDefId: 'ember-tetra'});
  ok(row.textContent === t1, `3. log: the line reads the same (${JSON.stringify(row.textContent)})`);
  ok(row.kids.filter(k=> k.chip).map(k=> k.chip).join('|') === 'Otter Kit|Ember Tetra' && made.every(c=> /^\S+ $/.test(c.pre || '')), '3. log: each named card is a chip, its "🦦 " inside it');
  made.length = 0; const t2 = '🐜 Ant Scout and 🐜 Ant swap.'; row.textContent = t2; run(row, t2, {aDefId: 'ant-scout', bDefId: 'ant'});
  ok(row.textContent === t2 && row.kids.filter(k=> k.chip).map(k=> k.chip).join('|') === 'Ant Scout|Ant', '3. log: a name inside a longer name is not split (longest first, no overlap)');
  const t3 = 'Round 3'; row.textContent = t3; run(row, t3, {type: 'roundStart'}); ok(row.kids.length === 0 && row.textContent === t3, '3. log: a line with no card is left alone');
}

// --- 4. the pack tray
const pa = fnSrc('openPackAnimation');
ok(/slotMode \? poTile\(Object\.assign\(\{\}, defOf\(r\.id\), \{locked:false\}\), \{editable:false, size:'full'\}\)/.test(pa), '4. a slot holds the Full card');
ok(/mini\.parentElement\.classList\.contains\('po2-slot'\) \? mini\.parentElement/.test(pa), '4. the flight aims at the slot (its Full size), not the popping mini');
ok(/po2-got\$\{slots \? ' has-slots' : ''\}[^\n]*--per:/.test(pa), '4. the tray knows its cards a row');
ok(/\.po2-got\.has-slots\{--po2-slot-w:min\(var\(--card-full-w\)/.test(block) && /\.po2-slot\{width:var\(--po2-slot-w, var\(--card-full-w\)\)/.test(css), '4. a slot is the Full width (capped by the row and the window)');

// --- 5. the guard (CS-A's rules, these screens)
function rules(text){
  const src = text.replace(/\/\*[\s\S]*?\*\//g, ''), out = [], re = /([^{}]+)\{([^{}]*)\}/g; let m;
  while((m = re.exec(src))){ const sel = m[1].trim(); if(!sel.startsWith('@')) out.push({sel, body: m[2]}); }
  return out;
}
const SCREENS = ['.cnp-showcase', '.cnp-pair', '.cnp-sq-card', '.cnp-rw-card', '.cnp-rw-zoom', '.res3-fan-seen', '.dbp-deck', '.fbulk', '.fb-card', '.fb-tile', '.anvil-stage',
  '.forge-preview', '.sm-card', '.sm-stage', '.po2-slot', '.po2-mini', '.vis4-mc-card', '.rv1-tile', '.dm-card', '.gpk-mini', '.cnp-drop-tile', '.card-chip'];
const CARDS = ['.card-tile', '.cnp-showcase', '.cnp-sq-card', '.cnp-rw-card', '.cnp-rw-zoom', '.rw-card', '.dbp-stack', '.fb-card', '.flip3d-stage', '.sm-stage', '.po2-slot',
  '.po2-mini', '.vis4-mc-card', '.rv1-tile', '.dm-card', '.gpk-mini', '.cnp-drop-tile', '.card-chip'];
// not cards: a pack or a currency in the reward box, the zoom's text-only tip
const NOT = [/\.cnp-rw-pack\b/, /\.cnp-rw-tip\b/, /\.cnp-rw-token\b/];
const CARD_PROPS = /^(width|min-width|max-width|height|min-height|flex-basis|flex)$/;
const has = (list, last)=> list.some(k=> new RegExp(k.replace(/[.#[\]]/g, '\\$&') + '(?![\\w-])').test(last));
function offenders(text){
  const bad = [];
  rules(text).forEach(r=> r.sel.split(',').map(s=> s.trim()).forEach(sel=>{
    if(!SCREENS.some(k=> new RegExp(k.replace(/[.#[\]]/g, '\\$&') + '(?![\\w-])').test(sel)) || NOT.some(re=> re.test(sel))) return;
    const last = sel.split(/[\s>+~]+/).pop().replace(/::?[a-z-]+(\([^)]*\))?/g, '');
    if(!has(CARDS, last)) return;
    r.body.split(';').forEach(d=>{ const i = d.indexOf(':'); if(i < 0) return; const p = d.slice(0, i).trim(), v = d.slice(i + 1).trim();
      if(CARD_PROPS.test(p) && /\d(\.\d+)?px/.test(v) && !/var\(--(card-|chip-|po2-slot-w|cc-h)/.test(v)) bad.push(`${sel} { ${p}:${v} }`); });
  }));
  return bad;
}
const bad = offenders(css);
ok(!bad.length, `5. no hard-coded card width on a CS-B screen (use --card-compact-w / --card-full-w / --chip-h):\n      ${bad.join('\n      ')}`);
ok(offenders('.conquest-node-panel .cnp-sq-card{width:62px;}').length === 1 && offenders('@media (max-width:640px){ .cnp-rw .cnp-rw-card{width:38px;} }').length === 1, '5. self-test: a px width on a squad card or a reward (in @media too) is caught');
ok(offenders('.vis4-mc-card .card-tile{width:44px !important}').length === 1 && offenders('.po2-slot{width:46px}').length === 1 && offenders('.grave-peek .gpk-mini{width:46px}').length === 1, '5. self-test: map chips, the tray, the graveyard');
ok(!offenders('.cnp-rw-card.cnp-rw-pack{width:auto; max-width:180px;} .card-chip .cc-n{padding:2px 6px} .cnp-rw-zoom.cnp-rw-tip{max-width:220px}').length, '5. self-test: packs, badges and the text tip are not cards');
ok(!offenders('.cnp-showcase{width:var(--card-compact-w);} .rv1-tile{width:var(--card-full-w);}').length, '5. self-test: a token passes');

// --- 6. the stale sizes are gone
[['.cnp-showcase{flex:0 0 auto; width:74px', 'leader 74px'], ['.cnp-sq-card{position:relative; flex:0 0 auto; width:62px', 'squad 62px'], ['.cnp-rw .cnp-rw-card, .cnp-rw-card{width:74px;}', 'reward 74px'],
 ['res3-fan-seen .card-tile{width:clamp(60px, 10.5vh, 96px)', 'seen clamp'], ['.dbp-deck .dbp-stack{width:66px;}', 'deck strip 66px'], ['.vis4-mc-card .card-tile{width:44px', 'map chip 44px'],
 ['.po2-slot{width:46px', 'tray slot 46px'], ['.dm-card{position:relative; width:52px', 'deck mini 52px'], ['.rv1-tile{width:128px', 'review 128px'], ['.anvil-stage .card-tile.forge-preview, .anvil-stage .flip3d-stage{width:140px', 'anvil 140px']]
  .forEach(([s, n])=> ok(!css.includes(s), `6. the old ${n} rule is gone`));

console.log(`cs-b: ${checks - fail}/${checks} checks passed`);
process.exit(fail ? 1 : 0);
