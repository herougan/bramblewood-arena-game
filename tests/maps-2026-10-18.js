#!/usr/bin/env node
// 2026-10-18 (V3, world-map fixes): static and logic checks that
//   1. Lilypad Reach (mp) stays where it was (Pebble Beach, after 2-1, at 30/20) but waits on Gatorback Swamp (afterMapCleared "mw");
//      it is locked until every Gatorback fight is won, opens then, and stays open for a save that already fought on it;
//   2. its locked entrance is the normal locked emblem (is-locked, disabled, padlock badge) and reads "Clear Gatorback Swamp to open";
//   3. the cleared-dark-map darkness covers the whole screen evenly: the screen layer's mask has a hole the size of the visible map
//      canvas (four bands added, then intersected with the lantern and light pools), the canvas layer fills it square-cornered, and
//      the screen layer sits over the layout's z-0 layers (the cleared map's warm glow and a backdrop shader).
'use strict';
const fs = require('fs'), path = require('path');
const ROOT = path.join(__dirname, '..');
const src = fs.readFileSync(path.join(ROOT, 'arena_app.js'), 'utf8');
const tpl = fs.readFileSync(path.join(ROOT, 'arena_template.html'), 'utf8');
let fail = 0, checks = 0; const ok = (c, m)=>{ checks++; if(!c){ fail++; console.log('  ✗', m); } };
const fn = name=>{ const i = src.indexOf(`function ${name}(`); if(i < 0) return ''; let d = 0, j = src.indexOf('{', i); for(; j < src.length; j++){ if(src[j] === '{') d++; else if(src[j] === '}' && --d === 0) break; } return src.slice(i, j + 1); };
const constLine = name=>{ const m = src.match(new RegExp(`^const ${name} = [^\\n]*$`, 'm')); return m ? m[0] : ''; };

// --- the maps (the same slices tests/gates-2026-10-18.js evaluates)
const ms = src.indexOf('const CONQUEST_MAPS = ['), me = src.indexOf('\n];', ms) + 3;
const dg = src.indexOf('function endlessDungeon(cfg){'), de = src.indexOf('const CONQUEST_MAPS_BASELINE', dg);
const CONQUEST_MAPS = new Function(src.slice(ms, me) + '\n' + src.slice(dg, de) + '\nreturn CONQUEST_MAPS;')();
const byId = id=> CONQUEST_MAPS.find(m=> m.id === id);
const mp = byId('mp'), mw = byId('mw'), mb = byId('mb');

// --- 1. the entry
ok(mp && mp.sub && mp.parent === 'mb' && mp.name === 'Lilypad Reach', 'Lilypad Reach is still a side map of Pebble Beach');
ok(mp && mp.entry.after === '2-1' && mp.entry.x === 30 && mp.entry.y === 20, 'its entrance has not moved (after 2-1, at 30/20)');
ok(mp && mp.entry.afterMapCleared === 'mw' && mw && mw.name === 'Gatorback Swamp', 'it waits on Gatorback Swamp (afterMapCleared "mw")');

// isMapUnlocked, run against a fake save
const KIND_BASE = new Function(constLine('KIND_BASE') + '\nreturn KIND_BASE;')();
let progress = {completed: [], clearedAt: {}}, flags = {};
const H = new Function('CONQUEST_MAPS', 'KIND_BASE', 'getP', 'getFlags', [fn('conquestNodeId'), fn('baseKind'), fn('isMapUnlocked'),
  fn('conquestMapCleared').replace('loadConquestProgress()', 'getP()'), 'function loadDialogueFlags(){ return getFlags(); }', 'function loadConquestProgress(){ return getP(); }'].join('\n') +
  '\nreturn {isMapUnlocked, conquestMapCleared, conquestNodeId};')(CONQUEST_MAPS, KIND_BASE, ()=> progress, ()=> flags);
const fights = m=> m.nodes.filter(n=> n.kind !== 'tutorial');
const clearMap = (p, m)=> fights(m).forEach(n=> p.completed.push(H.conquestNodeId(m.id, n.key)));
// every main map up to (not including) Gatorback Swamp cleared, so Pebble Beach's 2-1 is won
const mains = CONQUEST_MAPS.filter(m=> !m.sub && !m.reserved), iw = mains.indexOf(mw);
ok(iw > mains.indexOf(mb), 'Gatorback Swamp comes after Pebble Beach on the road');
const before = {completed: [], clearedAt: {}}; mains.slice(0, iw).forEach(m=> clearMap(before, m));
ok(before.completed.includes('mb:2-1'), 'the fake save has Pebble Beach 2-1');
progress = before;
ok(H.isMapUnlocked(mw, progress), 'Gatorback Swamp is open in the fake save');
ok(!H.isMapUnlocked(mp, progress), 'Lilypad Reach is locked while Gatorback Swamp is not cleared');
progress = JSON.parse(JSON.stringify(before)); fights(mw).slice(0, -1).forEach(n=> progress.completed.push(H.conquestNodeId('mw', n.key)));
ok(!H.isMapUnlocked(mp, progress), 'still locked with one Gatorback fight to go');
progress = JSON.parse(JSON.stringify(before)); clearMap(progress, mw);
ok(H.conquestMapCleared('mw') && H.isMapUnlocked(mp, progress), 'Lilypad Reach opens once Gatorback Swamp is cleared');
// a save that already fought on Lilypad Reach keeps it
progress = JSON.parse(JSON.stringify(before)); progress.completed.push(H.conquestNodeId('mp', mp.nodes.find(n=> n.kind !== 'tutorial').key));
ok(H.isMapUnlocked(mp, progress), 'a save with a Lilypad Reach win keeps it open before Gatorback Swamp is cleared');
// a fresh save: locked (and not because of the swamp only)
progress = {completed: [], clearedAt: {}};
ok(!H.isMapUnlocked(mp, progress), 'a fresh save has it locked');

// --- 2. the locked entrance
const SUBMAP_CAVES = new Function(constLine('SUBMAP_CAVES') + '\nreturn SUBMAP_CAVES;')();
const entrances = new Function('CONQUEST_MAPS', 'H', 'SUBMAP_CAVES', 'getFlags', [fn('escapeAttr'), fn('escapeHtml'),
  'const SUBMAP_EMBLEM_SVG = {}; let conquestLayoutEdit = false;', 'function decorPos(id, key, fb){ return fb; }', 'function loadDialogueFlags(){ return getFlags(); }',
  'const isMapUnlocked = H.isMapUnlocked, conquestMapCleared = H.conquestMapCleared, conquestNodeId = H.conquestNodeId;', fn('subMapEntrancesHTML')].join('\n') +
  '\nreturn subMapEntrancesHTML;')(CONQUEST_MAPS, H, SUBMAP_CAVES, ()=> flags);
progress = JSON.parse(JSON.stringify(before));
const html = entrances(mb, progress), btn = (html.match(/<button[^>]*data-lkey="~sub:mp"[\s\S]*?<\/button>/) || [''])[0];
ok(btn, 'Pebble Beach draws the Lilypad Reach entrance');
ok(/class="map-cave map-subcave map-subemblem is-locked/.test(btn) && /\sdisabled\s/.test(btn) && /mse-lock/.test(btn) && !/data-submap=/.test(btn), 'it is the normal locked emblem (is-locked, disabled, padlock, no way in)');
ok(/title="The lily ponds — Clear Gatorback Swamp to open"/.test(btn) && /aria-label="The lily ponds — Clear Gatorback Swamp to open"/.test(btn), 'it reads "Clear Gatorback Swamp to open"');
progress = JSON.parse(JSON.stringify(before)); clearMap(progress, mw);
const open = (entrances(mb, progress).match(/<button[^>]*data-lkey="~sub:mp"[\s\S]*?<\/button>/) || [''])[0];
ok(/data-submap="mp"/.test(open) && !/is-locked/.test(open) && /Lilypad Reach — 0\/\d+ cleared/.test(open), 'cleared swamp: the entrance opens with its name and count');
// the other entrances keep their old "clear X to find a way in" text
progress = {completed: [], clearedAt: {}};
const grotto = (entrances(mb, progress).match(/<button[^>]*data-lkey="~sub:mg"[\s\S]*?<\/button>/) || [''])[0];
ok(/to find a way in/.test(grotto), "Smugglers' Grotto's locked text is unchanged");

// --- 3. the darkness
const D = new Function([fn('setCaveMask'), fn('caveScreenHole')].join('\n') + '\nreturn {setCaveMask, caveScreenHole};')();
const r = {left: 238, top: 12, right: 1348, bottom: 640, width: 1110, height: 628};
const hole = D.caveScreenHole(r);
ok(hole && hole.img.length === 4 && hole.comp.join() === 'add,add,add,add', 'the hole is four bands, added together');
ok(hole && /#000 12\.0px, transparent 12\.0px/.test(hole.img[0]) && /transparent 640\.0px, #000 640\.0px/.test(hole.img[1]) &&
  /to right, #000 238\.0px, transparent 238\.0px/.test(hole.img[2]) && /transparent 1348\.0px, #000 1348\.0px/.test(hole.img[3]), 'the bands frame the canvas rectangle');
const clipped = D.caveScreenHole({left: 18, top: 126, right: 372, bottom: 1100, width: 354, height: 974}, {left: 0, top: 113, right: 390, bottom: 844});
ok(clipped && /transparent 844\.0px, #000 844\.0px/.test(clipped.img[1]) && /#000 126\.0px/.test(clipped.img[0]), 'the hole is clipped to the scroll box (a phone map scrolled part-way)');
ok(D.caveScreenHole({left: 0, top: 900, right: 390, bottom: 1200, width: 390, height: 300}, {left: 0, top: 113, right: 390, bottom: 844}) === null, 'no hole when the canvas is scrolled out of view');
ok(D.caveScreenHole({left: 0, top: 0, right: 0, bottom: 0, width: 0, height: 0}) === null, 'no hole for a canvas with no size');
const fake = ()=> ({classList: {add(){}}, style: {}});
const e1 = fake(); D.setCaveMask(e1, 'x', 'intersect, intersect, add, add, add, add');
ok(e1.style.maskComposite === 'intersect, intersect, add, add, add, add' && e1.style.webkitMaskComposite === 'source-in, source-in, source-over, source-over, source-over, source-over', 'setCaveMask passes the composite list (and its -webkit- spelling)');
const e2 = fake(); D.setCaveMask(e2, 'x');
ok(e2.style.maskComposite === 'intersect' && e2.style.webkitMaskComposite === 'source-in', 'the canvas layer keeps plain intersect');
const mount = fn('mountCaveDark');
ok(/caveScreenHole\(r, scrollBox && scrollBox\.getBoundingClientRect\(\)\)/.test(mount) && /Array\(pools\.length \+ 1\)\.fill\('intersect'\)\.concat\(hole\.comp\)/.test(mount), 'the screen layer gets the hole, after the lantern and every pool');
ok(/document\.addEventListener\('scroll', window\.__bwCaveScroll, \{capture:true, passive:true\}\)/.test(mount) && /removeEventListener\('scroll', window\.__bwCaveScroll, true\)/.test(mount), 'the hole follows a scroll at once, and the listener is replaced, not stacked');
ok(/el\.style\.opacity = scr\.style\.opacity = lit \? '0\.78' : ''/.test(mount), 'both layers still lift to 0.78 on a cleared map');
const zRule = tpl.indexOf('.cave-screen-dark{z-index:1;}'), baseRule = tpl.indexOf('.cave-screen-dark{position:fixed; inset:0; z-index:0;');
ok(zRule > baseRule && baseRule > 0, 'the screen layer is raised to z-index 1, after its base rule');
ok(/\.conquest-layout\.dark-cleared::after\{[^}]*z-index:0;/.test(tpl) && /\.conquest-layout > \.conquest-maps, \.conquest-layout > \.conquest-main\{position:relative; z-index:1;\}/.test(tpl), 'the glow stays at 0 and the map list and map at 1 (above the darkness)');
ok(/body\.cave-screen \.conquest-map-canvas > \.cave-dark\.is-masked\{border-radius:0;\}/.test(tpl), "the canvas layer is square-cornered, so the canvas's round corners leave no lit nicks");

console.log(fail ? `maps-2026-10-18: ${fail} of ${checks} checks FAILED` : `maps-2026-10-18: all ${checks} checks pass`);
process.exit(fail ? 1 : 0);
