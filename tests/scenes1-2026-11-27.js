#!/usr/bin/env node
// Package SCENES1 (2026-11-27): the ART16 battle scenes. Static plus the built page (no browser; run-all.sh runs this).
'use strict';
const fs = require('fs'), path = require('path'), vm = require('vm');
const ROOT = path.join(__dirname, '..');
let fail = 0, n = 0; const ok = (c, m)=>{ n++; if(!c){ fail++; console.log('  x', m); } };
const rd = f=> fs.readFileSync(path.join(ROOT, f), 'utf8');
const app = rd('arena_app.js'), tpl = rd('arena_template.html');
const m = app.match(/const SCENE_OF_MAP = (\{[^}]*\});/);
ok(!!m, '1. SCENE_OF_MAP exists');
const map = m ? vm.runInNewContext('(' + m[1] + ')') : {};
const want = {m4:'cave', mk:'kelp', m7:'reef', mw:'swamp', m8:'swamp', m6:'tundra', mi:'tundra', md:'desert', mpd:'desert', m3:'volcano', m11:'volcano', me:'volcano', my:'canopy'};
for(const id in want) ok(map[id] === want[id], '2. map ' + id + ' -> ' + want[id] + ' (got ' + map[id] + ')');
const MAP_ART_IDS = (app.match(/const MAP_ART_IDS = new Set\(\[([^\]]*)\]\)/) || [,''])[1];
const built = fs.existsSync(path.join(ROOT, 'index.html')) ? rd('index.html') : '';
for(const id in map){
  const s = map[id];
  ok(new RegExp('"' + id + '"').test(MAP_ART_IDS), '3. ' + id + ' has map art, so the battlefield is has-floor-art and the scene shows');
  ok(fs.existsSync(path.join(ROOT, 'art/scenes', s + '-bg.png')), '4. art/scenes/' + s + '-bg.png exists');
  if(s !== 'canopy') ok(fs.existsSync(path.join(ROOT, 'art/scenes', s + '-floor.png')), '4. art/scenes/' + s + '-floor.png exists');
  ok(fs.existsSync(path.join(ROOT, 'art/staging/art16/scenes', s + '-bg.png')), '4. the staging copy of ' + s + ' is kept');
  const r = built.match(new RegExp('\\.battlefield\\.scene-' + s + '\\{(--scene-bg[^}]*)\\}'));
  ok(!!r && /--scene-bg:url\(assets\/scenes\/[^)]+\.webp/.test(r[1]), '5. the built page maps scene-' + s + ' to its backdrop');
  if(r && s !== 'canopy'){
    const u = r[1].match(/--scene-floor:url\((assets\/scenes\/[^)?]+)/);
    ok(!!u && fs.existsSync(path.join(ROOT, u[1])), '5. scene-' + s + "'s floor file is in assets/");
  }
}
ok(/\.battlefield\.has-floor-art\{image-rendering:pixelated/.test(tpl) && /\[class\*="scene-"\]::before\{[^}]*image-rendering:pixelated/.test(tpl), '6. the floor and the backdrop render pixelated');
ok(/\[class\*="scene-"\]\{background:[^}]*var\(--scene-floor, var\(--map-art\)\)/.test(tpl), '7. the floor falls back to the map art (the Canopy keeps its floor)');
ok(/scene-tundra[^{]*\{--scene-dim:/.test(tpl), '8. the bright scenes carry a dim veil');
console.log(fail ? 'FAIL ' + fail + '/' + n : 'ok ' + n + ' checks');
process.exit(fail ? 1 : 0);
