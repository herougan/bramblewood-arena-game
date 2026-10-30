#!/usr/bin/env node
// Package UI6 (2026-10-30; owner notes 10-30 23:25 X2, X4, X11, X19, X22, X23). Static checks; the browser run is tests/e2e/ui6_2026_10_30.py.
//   X2  the card popover stays open and steady while the pointer rests on the same card through redraws and attack animations
//   X4  the popover shows the card as printed (no live damage, buffs, statuses), plus the unit's own hit log
//   X11 the render that ends a match keeps every unit's element (matched by uid), and a token already on the page never re-enters
//   X19 Dailies (shared keys), Dungeons (multi-step), Multiplayer (Energy): English and the 12 packs
//   X22 Whisper's Game is off the map (mapHidden), only the layout editor draws it
//   X23 a selfish boon's field text gives the theme only, no "12/17" count
'use strict';
const fs = require('fs'), path = require('path');
const ROOT = path.join(__dirname, '..');
const rd = rel=> fs.readFileSync(path.join(ROOT, rel), 'utf8');
let fail = 0, checks = 0; const ok = (c, m)=>{ checks++; if(!c){ fail++; console.log('  ✗', m); } };
const app = rd('arena_app.js');
function fnSrc(name){
  let a = app.indexOf('\nfunction ' + name + '('); if(a < 0) a = app.indexOf('\nasync function ' + name + '('); if(a < 0) a = app.indexOf('  function ' + name + '('); if(a < 0) return '';
  let i = app.indexOf('{', a), depth = 0;
  for(; i < app.length; i++){ const ch = app[i]; if(ch === '{') depth++; else if(ch === '}'){ depth--; if(!depth) break; } }
  return app.slice(a + 1, i + 1);
}
const pop = (()=>{ const a = app.indexOf('(function initPopover(){'), b = app.indexOf('\n})();', a); return a > 0 ? app.slice(a, b) : ''; })();

// ---- X2: steady popover
ok(pop.length > 2000, 'X2: initPopover found');
ok(/function popKeyOf\(el\)/.test(pop) && /'u' \+ u\.getAttribute\('data-uid'\)/.test(pop) && /'h' \+ h\.getAttribute\('data-handuid'\)/.test(pop), 'X2: the popover belongs to a card key (unit uid, hand uid, else card id)');
ok(/if\(!pop\.hidden && popKey && key === popKey\)\{[^}]*\} bindPopSrc\(el\); return; \}/.test(pop), 'X2: a mouseover on the same card\'s new element rebinds, without a new 1 s wait');
ok(/function rebindPop\(\)/.test(pop) && /elementsFromPoint\(ptX, ptY\)/.test(pop) && /inRect\(popRect, ptX, ptY\)/.test(pop), 'X2: a redraw or a lunge keeps it while the pointer rests on the card\'s spot');
ok(/if\(!rebindPop\(\)\) closePop\(\);/.test(pop), 'X2: leaving the card (and not on the same card) closes it');
ok(/TipWatch\.track\(pop, el, \(\)=>\{ if\(!rebindPop\(\)\) closePopLost\(\); \}, \{steady: !!matchState\}\)/.test(pop), 'X2: TipWatch tries to rebind before it closes the popover; no fading with the card in a fight');
ok(/if\(!\(how && how\.quiet\)\) try\{ fxHook\('cardPop', pop, el\);/.test(pop), 'X2: a quiet reopen plays no pop-in animation');
ok(/if\(rec\.steady\)\{ tip\.style\.opacity = ''; return; \}/.test(app) && /steady: !!\(opts && opts\.steady\)/.test(app), 'X2: TipWatch.track takes {steady}');

// ---- X4: printed card
ok(/fullCardHTML\(el\.getAttribute\('data-defid'\), null, \{logUid: liveForLog \? liveForLog\.uid : null/.test(pop), 'X4: the popover asks for the printed card (no live instance)');
ok(/opts\.logUid != null \? cardActionLogHTML\(opts\.logUid\)/.test(fnSrc('fullCardHTML')), 'X4: the unit\'s own hit log is still added');

// ---- X11: the ending render
{ const f = fnSrc('pl2ReconcileRow');
  ok(/byUid\.get\(nuU\)/.test(f) && !/fresh\.length !== old\.length\) return false/.test(f), 'X11: cells matched by uid, also when the column count changed');
  ok(/row\.insertBefore\(el, cur \|\| null\)/.test(f) && /if\(!keep\.has\(od\)\) od\.remove\(\)/.test(f), 'X11: only fallen or new cells are removed / inserted');
  ok(/if\(slotView && \(m\.ending \|\| m\.over\)\) seen\.forEach\(\(\[u\]\)=> knownBoardUids\.add\(u\)\)/.test(app), 'X11: a unit already on the page is not "new" in the ending render (no second entrance)');
  // run the reconcile on a tiny fake DOM: a kept unit keeps its element, a new token is inserted, a fallen one removed
  const mk = (tag, attrs)=>({tag, attrs: attrs || {}, getAttribute(k){ return this.attrs[k] != null ? this.attrs[k] : null; }, matches(){ return false; }, remove(){ const i = row.children.indexOf(this); if(i >= 0) row.children.splice(i, 1); }, get outerHTML(){ return tag + JSON.stringify(this.attrs); }});
  let row = {children: [], insertBefore(el, cur){ const j = row.children.indexOf(el); if(j >= 0) row.children.splice(j, 1); const i = cur ? row.children.indexOf(cur) : row.children.length; row.children.splice(i, 0, el); }, get lastElementChild(){ return row.children[row.children.length - 1]; }};
  const A = mk('div', {'data-uid': '1'}), B = mk('div', {'data-uid': '2'}), S = mk('span', {}); row.children.push(S, A, B);
  const fresh = [mk('span', {}), mk('div', {'data-uid': '1'}), mk('div', {'data-uid': '9'}), mk('div', {'data-uid': '8'})];
  const updates = [];
  const sandbox = {document: {createElement: ()=>({set innerHTML(h){}, children: fresh})}, updateCardHpDisplay: u=> updates.push(u), updateCardAtkDisplay(){}, updateCardStatusDisplay(){}, eq2Refresh(){}};
  let r = null; try{ r = new Function(...Object.keys(sandbox), f + '\nreturn pl2ReconcileRow;')(...Object.values(sandbox))(row, ''); }catch(e){ console.log(e); }
  ok(r === true, 'X11: the reconcile accepts a changed column count');
  ok(row.children.length === 4 && row.children[0] === S && row.children[1] === A && row.children[2] === fresh[2] && row.children[3] === fresh[3], 'X11: kept unit and empty cell keep their elements; the fallen unit goes; two tokens are inserted');
  ok(updates.join() === '1', 'X11: the kept unit\'s numbers are patched in place (' + updates.join() + ')');
}

// ---- X19: names
{ const T = require(path.join(ROOT, 'bramblewood-texts.js'));
  const en = k=> T.TX(k);
  ok(en('ui.ar-group-name') === 'Multiplayer' && en('ui.pl2-coop') === 'Multiplayer' && /Multiplayer/.test(en('ui.ar3-invited')) && /Multiplayer/.test(en('ui.coop2-unsupported')), 'X19: the group / co-op dungeon is Multiplayer');
  ok(/Energy/.test(en('ui.ar-group-sub')) && /Energy/.test(en('ui.coop2-tab-sub')), 'X19: Multiplayer says it uses Energy');
  ok(en('ui.ui6-dailies') === 'Dailies' && /Dailies/.test(en('ui.dungeon-sweep-locked')) && /share/.test(en('ui.dungeon-key-rule')) && /share/.test(en('ui.dungeons-sub')), 'X19: the daily dungeons are the Dailies, and their keys are shared');
  ok(/TX\('ui\.ui6-dailies'\)/.test(fnSrc('dungeonTabLabel')) && !/'Daily Dungeons'/.test(app) && !/Daily dungeon\$\{note\}/.test(app), 'X19: the tab and the world map say Dailies (no hard-coded "Daily Dungeons")');
  const keys = Object.keys(T.TEXT || {}).filter(k=> !/^(ui|toast|results)\.(ex|codex)/.test(k));
  const bad = keys.filter(k=> /Dungeon keys?|Group Dungeon|daily dungeons?|group dungeon|\bCo-op\b/.test(T.TEXT[k]));
  ok(!bad.length, 'X19: no English text says "Dungeon key", "Group Dungeon", "daily dungeon" or "Co-op" (' + bad.slice(0, 5).join(', ') + ')');
  const CODES = ['de', 'es', 'fr', 'id', 'it', 'ja', 'ko', 'pt', 'ta', 'tl', 'zh-Hans', 'zh-Hant'];
  const strip = v=> /^[^\w{]/.test(v) ? v.replace(/^\W+\s/, '') : v;
  const need = ['ui.ar-group-name', 'ui.ar-group-sub', 'ui.dungeon-key-rule', 'ui.dungeons-sub', 'ui.coop2-tab-sub', 'ui.coop2-unsupported', 'ui.ui6-dailies', 'ui.ux2-br-tower', 'toast.dungeon-key-used', 'ui.dungeon-keys-count'].map(k=> strip(en(k)));
  CODES.forEach(c=>{ const L = JSON.parse(rd('lang/' + c + '.json')); const miss = need.filter(e=> !(e in L) || !L[e]); ok(!miss.length, `X19: ${c} translates the new names (${miss.join(' | ')})`); });
}

// ---- X22: Whisper's Game
ok(/\{key:'autobattle', adminOnly:true[^\n]{0,160}?, mapHidden:true/.test(app), 'X22: Whisper\'s Game carries mapHidden');
ok(/function ui6SpotOffMap\(sp\)\{ if\(!sp \|\| !sp\.mapHidden\) return false; try\{ return !decorEditing\(\); \}/.test(app), 'X22: off the map for everyone, Admin included; the layout editor still draws it');
ok((app.match(/!pl2SpotHidden\(sp\) && !ui6SpotOffMap\(sp\)/g) || []).length === 2, 'X22: both the "?" spots and the found spots skip it');
ok(/\.map-spot\.ui6-map-hidden\{/.test(rd('arena_template.html')), 'X22: the layout editor marks it hidden');

// ---- X23: no count
ok(/row\.short = row\.selfish \? boonTheme\(row\.selfish\) \/\*/.test(fnSrc('boonRowWithCount')), 'X23: the selfish boon\'s line is its theme only ("Reptile", not "12/17 Reptile")');

console.log(fail ? `ui6-2026-10-30: ${fail} FAILED of ${checks}` : `ui6-2026-10-30: all ${checks} checks passed`);
process.exit(fail ? 1 : 0);
