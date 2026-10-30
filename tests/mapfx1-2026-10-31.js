#!/usr/bin/env node
// 2026-10-31 (package MAPFX1, owner X7): the conquest map's decor you can touch.
//   - MAP_FX_SPOTS is exactly what tools/map_fx_spots_2026_10_31.py prints (the painter's own positions, checked against the shipped art);
//   - the rate limit that keeps spam-clicking from stacking sounds; the layer-splitting helper;
//   - the four new cues exist and go through the SoundKit primitives (so the sound slider and mute rule them);
//   - the rules in the source: tree sway is transform-only and gated on reduced motion and Effects Medium+, a fire put out leaves the darkness
//     mask, the layer sits under nodes and only its own spots take taps, the fires hit-test only when nothing interactive was tapped.
// tests/e2e/mapfx1_2026_10_31.py drives the real page at 390 and 1366.
'use strict';
const fs = require('fs'), path = require('path'), cp = require('child_process');
const ROOT = path.join(__dirname, '..');
const src = fs.readFileSync(path.join(ROOT, 'arena_app.js'), 'utf8'), css = fs.readFileSync(path.join(ROOT, 'arena_template.html'), 'utf8');
let fail = 0, n = 0; const ok = (c, m)=>{ n++; if(!c){ fail++; console.log('  ✗', m); } };
function fnSrc(name){
  const a = src.indexOf('\nfunction ' + name + '('); if(a < 0) return '';
  let i = src.indexOf('{', a), depth = 0;
  for(; i < src.length; i++){ const ch = src[i]; if(ch === '{') depth++; else if(ch === '}'){ depth--; if(!depth) break; } }
  return src.slice(a + 1, i + 1);
}

// --- the spots table
const a = src.indexOf('// MAP_FX_SPOTS_BEGIN'), b = src.indexOf('// MAP_FX_SPOTS_END');
ok(a > 0 && b > a, 'the MAP_FX_SPOTS block is delimited');
const block = src.slice(a + '// MAP_FX_SPOTS_BEGIN'.length, b).trim();
const SPOTS = new Function(block.split('\n').filter(l=> !l.startsWith('//')).join('\n') + '\nreturn MAP_FX_SPOTS;')();
const ids = Object.keys(SPOTS);
ok(ids.length >= 30, `spots for ${ids.length} maps`);
let bad = 0, total = {t: 0, b: 0, c: 0, w: 0};
ids.forEach(id=>{ Object.entries(SPOTS[id]).forEach(([k, list])=>{ total[k] += list.length; list.forEach(p=>{ if(!(p[0] >= 0 && p[0] <= 100 && p[1] >= 0 && p[1] <= 100) || (k === 'w' && !(p[2] > 0 && p[3] > 0))) bad++; }); }); });
ok(bad === 0, 'every spot is inside the art (0-100%), every pond has a size');
ok(total.t > 100 && total.b > 100 && total.c > 50 && total.w > 30, `kinds present: ${JSON.stringify(total)}`);
ok((SPOTS.m4.c || []).length >= 30 && (SPOTS.m4.w || []).length >= 1, 'Caves & Alcoves (a dark map) has crystals and water');
ok((SPOTS.mg.c || []).length >= 5, "Smugglers' Grotto (a dark map) has crystals");
ok((SPOTS.m2.w || []).length >= 3 && (SPOTS.m2.b || []).length >= 10 && (SPOTS.m2.t || []).length >= 5, 'Sunken Hollow has water, bushes and trees');
ok((SPOTS.m5.t || []).length >= 10, 'Savanna Reaches has trees');
// the table is what the painter says (and the painter's pictures are the shipped ones: the tool skips any map whose art differs)
let py = null;
try{ py = cp.spawnSync('python3', [path.join(ROOT, 'tools', 'map_fx_spots_2026_10_31.py')], {encoding: 'utf8', timeout: 120000, cwd: ROOT}); }catch(e){}
if(py && py.status === 0){
  const printed = py.stdout.split('\n').filter(l=> !l.startsWith('//')).join('\n').trim();
  ok(printed === block.split('\n').filter(l=> !l.startsWith('//')).join('\n').trim(), 'MAP_FX_SPOTS equals tools/map_fx_spots_2026_10_31.py (re-run it and paste after changing a painter)');
  ok(!/skipped[^\n]*differs/.test(py.stdout.split('\n')[0]), 'every painted map matches its shipped art: ' + py.stdout.split('\n')[0].slice(0, 160));
} else console.log('  (python3 with numpy/PIL/scipy not available: table check skipped)');

// --- the rate limit
{ let now = 1000;
  const code = `const mfxState = {last: 0, stamps: [], per: {}};\n${fnSrc('mfxSoundOk')}\nreturn mfxSoundOk;`;
  const f = new Function('performance', code)({now: ()=> now});
  ok(f('a') === true, 'the first cue plays');
  now += 50; ok(f('b') === false, 'a second one 50 ms later is dropped (110 ms between any two)');
  const times = []; for(let i = 0; i < 30; i++){ now += 120; if(f('k' + i)) times.push(now); }
  const worst = Math.max(...times.map(t=> times.filter(u=> u >= t && u < t + 1500).length));
  ok(times.length >= 5 && worst <= 5, `30 clicks 120 ms apart play ${times.length}, never more than ${worst} in any 1.5 s`);
  now += 5000; ok(f('same') === true, 'after a pause a cue plays again'); now += 130; ok(f('same') === false, 'the same spot twice within 260 ms is dropped');
  now += 200; ok(f('same') === true, 'and plays again after 260 ms'); }

// --- the layer splitter
{ const f = new Function(fnSrc('mfxSplitLayers') + '\nreturn mfxSplitLayers;')();
  const l = f('radial-gradient(130% 95% at 50% 45%, rgba(0, 0, 0, 0) 55%, rgba(0, 0, 0, 0.5) 100%), url("x.png?v=1"), radial-gradient(rgb(1, 2, 3), rgb(4, 5, 6))');
  ok(l.length === 3 && /^url/.test(l[1]) && /^radial/.test(l[2]), 'a background list splits at its top-level commas only'); }

// --- the cues
['fireOut', 'crystalTing', 'waterPlop', 'bushRustle'].forEach(c=>{
  const i = src.indexOf('\n    ' + c + '('); ok(i > 0, 'SoundKit.' + c + ' exists');
  const body = src.slice(i, i + 700); ok(/\b(tone|fnoise|sweep)\(/.test(body), c + ' is built from the volume-gated primitives');
});
ok(/crystalTing\(k\)\{ const p = k \|\| 1;/.test(src) && /mfxPlay\('crystalTing', t, 0\.9 \+ Math\.random\(\) \* 0\.22/.test(src), 'the ting varies its pitch a little each tap');

// --- the rules in the source
const mount = fnSrc('mountMapFx'), toggle = fnSrc('mfxFireToggle');
ok(/function mfxSway\(\)\{ try\{ return !reducedMotion\(\) && fxAtLeast\('med'\)/.test(src), 'tree sway needs no reduced motion and Effects Medium or High');
ok(/function mfxVisual\(\)\{ try\{ return !reducedMotion\(\) && fxAtLeast\('low'\)/.test(src), 'taps\' visuals need no reduced motion and Effects Low or more');
ok(/@keyframes mfxSway\{from\{transform:rotate\(calc\(var\(--sw, \.8deg\) \* -1\)\);\} to\{transform:rotate\(var\(--sw, \.8deg\)\);\}\}/.test(css), 'the sway keyframes are one rotate');
ok(/\.mfx-sway\{transform-origin:50% 80%; will-change:transform; animation:mfxSway/.test(css), 'the sway turns round the trunk base (bottom of the tree)');
ok(/\(\(i \* 37\) % 5\) \/ 10; \/\/ 0\.6 to 1\.0 degrees/.test(mount) && /\(4 \+ \(\(i \* 53\) % 31\) \/ 10\)/.test(mount) && /animationDelay = '-'/.test(mount), 'amplitude 0.6-1.0 degrees, 4.0-7.0 s, a different negative delay per tree');
ok(/\.map-fx-layer\{position:absolute; inset:0; z-index:0; pointer-events:none;\}/.test(css) && /\.mfx-hit\{[^}]*pointer-events:auto/.test(css), 'the layer takes no taps; only its spots do');
ok(/\.map-sway-layer\{[^}]*pointer-events:none/.test(css) && /\.mfx-patch\{[^}]*pointer-events:none/.test(css), 'the sway layer and its copies take no taps');
ok(/layout-editing \.map-fx-layer, \.conquest-map-canvas\.link-editing \.map-fx-layer\{display:none;\}/.test(css), 'the layer is off while an admin edits the layout or the links');
ok(/e\.target\.closest[^;]*\.map-node, \.map-spot, \.map-curio, \[data-lkey\], button/.test(mount) && /addEventListener\('click', onClick, true\)/.test(mount), 'a fire only hears a tap that landed on nothing interactive');
ok(/\.cave-fire\.is-out \.cf-flame, \.cave-fire\.is-out \.cf-glow/.test(css) && /\.map-campfire\.is-out \.mcf-fire/.test(css), 'a fire that is out loses flame and glow (cave fires and the campfire)');
ok(/lit = f\._lit == null \? 1 : f\._lit/.test(fnSrc('caveLightPools')) && /\* lit\}\)/.test(fnSrc('caveLightPools')), 'a fire\'s light pool in the darkness mask scales with how lit it is (shrinks to nothing when out)');
ok(/is-out/.test(toggle) && /fireOut/.test(toggle) && /fireIgnite/.test(toggle) && !/localStorage|save[A-Z]/.test(toggle), 'tap puts out, tap lights, nothing saved');
ok(/mountMapFx\(document\.getElementById\('conquestCanvas'\), map\)/.test(src), 'the map render mounts the layer');
ok(/fireOut/.test(fs.readFileSync(path.join(ROOT, 'docs', 'sfx-cue-sheet.md'), 'utf8')), 'the cue sheet lists the new cues');

console.log(`mapfx1-2026-10-31: ${n - fail}/${n} ok`);
process.exit(fail ? 1 : 0);
