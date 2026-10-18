#!/usr/bin/env node
// 2026-10-18 (package R3-WP6, polish and dead code): static checks that
//   1. the Babel Spire's Dungeons-tab card has a summit state at 50/50 (no "Keep climbing", a floor picker to fight any floor
//      again) and is headed with the map's own name, not "The Tower"; mid-climb it still says "Keep climbing";
//   2. the Spire (tw) and the Long Burrow (mlb) have derived backdrops (MAP_ART_DERIVED, MAP_ART_IDS, the built assets);
//   3. the never-read localStorage keys bramblewood_tut_zoomout_v1 and bramblewood_deck_view are gone, and the errand Iron Shard
//      (which the audit called dead, but two templates do set) is still paid and shown;
//   4. the effects inventory shows meta-steam-achv, meta-dragon-egg-craft, dng-murgle, world-event and amb-arena as live.
'use strict';
const fs = require('fs'), path = require('path');
const ROOT = path.join(__dirname, '..');
const src = fs.readFileSync(path.join(ROOT, 'arena_app.js'), 'utf8');
let fail = 0, checks = 0; const ok = (c, m)=>{ checks++; if(!c){ fail++; console.log('  ✗', m); } };

// pull one top-level function's source out of arena_app.js (brace-matched, template literals included)
function fnSrc(name){
  const a = src.indexOf('\nfunction ' + name + '('); if(a < 0) return '';
  let i = src.indexOf('{', a), depth = 0;
  for(; i < src.length; i++){ const ch = src[i]; if(ch === '{') depth++; else if(ch === '}'){ depth--; if(!depth) break; } }
  return src.slice(a + 1, i + 1);
}

// --- 1. the Spire card
const towerSrc = fnSrc('towerCardHTML');
ok(towerSrc.length > 200, 'arena_app.js has towerCardHTML');
ok(!/<h3>🗼 The Tower<\/h3>/.test(towerSrc), 'the Spire card is no longer headed "The Tower"');
const nodes = Array.from({length:50}, (_, i)=> ({key:'20-TW-' + (i + 1), kind:(i + 1) % 10 ? 'elite' : 'boss'}));
const MAP = {id:'tw', name:'The Babel Spire', icon:'🗼', blurb:'A tower.', nodes};
// 2026-10-18 (package Z): the card now prints TX texts and the next floor's Energy (refunded if you lose), so TX, escapeAttr and
// nodeEnergyCost are passed in too
const {TX} = require(path.join(ROOT, 'bramblewood-texts.js'));
const card = done=> new Function('CONQUEST_MAPS', 'isMapUnlocked', 'dungeonFloorProgress', 'enemyDeckLevel', 'compassDiamondSVG', 'escapeHtml',
  'TOWER_BR_START', 'TOWER_BR_STEP', 'TOWER_LEVEL_CAP', 'adminModeEnabled', 'TX', 'escapeAttr', 'nodeEnergyCost', towerSrc + '\nreturn towerCardHTML({});')(
  [MAP], ()=> true, ()=> ({done, total:50}), ()=> 99, ()=> '<svg></svg>', s=> String(s), 100, 10, 15, false, TX, s=> String(s), ()=> 7);
let top = '', mid = '';
try{ top = card(50); mid = card(10); }catch(e){ ok(false, 'towerCardHTML runs with stubs: ' + e.message); }
ok(/<h3>🗼 The Babel Spire<\/h3>/.test(top), 'the card is headed with the map name');
ok(/You stand atop The Babel Spire/.test(top), 'at 50/50 the card shows the summit line');
ok(!/Keep climbing/.test(top), 'at 50/50 there is no "Keep climbing"');
ok(/data-tower-replay/.test(top) && (top.match(/<option /g) || []).length === 50, 'at 50/50 a floor picker lists all 50 floors, with a fight-again button');
ok(/Keep climbing/.test(mid) && /Floor 11<\/b> \/ 50/.test(mid) && !/data-tower-replay/.test(mid), 'mid-climb (10/50) still says "Keep climbing" at floor 11');
ok(/querySelectorAll\('\[data-tower-replay\]'\)/.test(src) && /conquestSelectedNodeKey = node \? node\.key : null/.test(src), 'the fight-again button opens the Spire with that floor selected');

// --- 2. backdrops
const asm = fs.readFileSync(path.join(ROOT, 'assemble_arena.py'), 'utf8');
const mai = (src.match(/const MAP_ART_IDS = new Set\(\[([^\]]*)\]\)/) || [])[1] || '';
['tw', 'mlb'].forEach(id=>{
  ok(new RegExp(`"${id}"`).test(mai), `MAP_ART_IDS lists ${id}`);
  ok(new RegExp(`^\\s*"${id}": \\("m\\w+", -?\\d+, [\\d.]+, [\\d.]+\\)`, 'm').test(asm), `MAP_ART_DERIVED derives ${id} from another map`);
  ok(fs.existsSync(path.join(ROOT, 'assets', 'maps', id + '.png')), `assets/maps/${id}.png is built`);
});
const html = fs.existsSync(path.join(ROOT, 'index.html')) ? fs.readFileSync(path.join(ROOT, 'index.html'), 'utf8') : '';
ok(/\.map-theme-tw, \.battlefield\.map-tw\{--map-art:url\(/.test(html) && /\.map-theme-mlb, \.battlefield\.map-mlb\{--map-art:url\(/.test(html), 'index.html carries both backdrops');

// --- 3. dead code
// (the 2026-10-18 comments still name the keys; no code reads or writes them)
ok(!/localStorage\.\w+\(\s*'bramblewood_tut_zoomout_v1'/.test(src), 'bramblewood_tut_zoomout_v1 is no longer written or cleared');
ok(!/localStorage\.\w+\(\s*'bramblewood_deck_view'/.test(src) && !/data-deckview/.test(src), 'bramblewood_deck_view and its button handler are gone');
const tplA = src.indexOf('const ERRAND_TEMPLATES = ['), tplB = src.indexOf('\n];', tplA);
ok(/shard:true/.test(src.slice(tplA, tplB)), 'errand templates still pay an Iron Shard (not dead)');
ok(/if\(t\.shard\)\{ try\{ unlockCardForPlayer\('iron-shard', 'errand'\)/.test(src), 'claimErrand still grants the shard');

// --- 4. effects inventory
const inv = JSON.parse(fs.readFileSync(path.join(ROOT, 'docs', 'effects-inventory-2026-10-15.json'), 'utf8'));
['meta-steam-achv', 'meta-dragon-egg-craft', 'dng-murgle', 'world-event', 'amb-arena'].forEach(id=>{
  const e = inv.find(x=> x.id === id);
  ok(e && e.status === 'live' && !e.future && /^live\b/.test(e.inGameHook || ''), `inventory row ${id} is live`);
});

console.log(fail ? `polish-2026-10-18: ${fail} of ${checks} checks failed` : `polish-2026-10-18: all ${checks} checks passed`);
process.exit(fail ? 1 : 0);
