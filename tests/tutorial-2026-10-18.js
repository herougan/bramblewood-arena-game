#!/usr/bin/env node
// 2026-10-18 (package T, tutorial and onboarding): static checks that
//   1. the "drag a card onto the field" hint shows the highlighted card: the step points at it, the phantom is a copy of it (not
//      of whatever is held) that keeps its look (mounted with mountDragGhost, no desaturating filter) and glides to the open slot;
//   2. picking a side goes straight into the tutorial fight (it starts under the fading picker; Home, with the level, never shows);
//   4. the tutorial's board is tinted green (bf-tutorial);
//   5. while T-3…T-5 are off the Tutorial map, T-1 and T-2 stand centred (labels since 2026-10-23, TU2; were T-2…T-4, T-0 and T-1); once the map opens up they slide to their real spots once;
//   7. the tutorial's card windows close by fading out while shrinking a little (94%, 280 ms), and simply go with reduced motion.
// Browser checks with screenshots were run by hand (see docs/CHANGELOG.md, package T).
'use strict';
const fs = require('fs'), path = require('path');
const ROOT = path.join(__dirname, '..');
const src = fs.readFileSync(path.join(ROOT, 'arena_app.js'), 'utf8');
const tpl = fs.readFileSync(path.join(ROOT, 'arena_template.html'), 'utf8');
let fail = 0, checks = 0; const ok = (c, m)=>{ checks++; if(!c){ fail++; console.log('  ✗', m); } };
function fnSrc(name){
  const a = src.indexOf('\nfunction ' + name + '('); if(a < 0) return '';
  let i = src.indexOf('{', a), depth = 0;
  for(; i < src.length; i++){ const ch = src[i]; if(ch === '{') depth++; else if(ch === '}'){ depth--; if(!depth) break; } }
  return src.slice(a + 1, i + 1);
}

// --- 1. the drag hint
const ph = fnSrc('syncCoachPhantom'), hlt = fnSrc('coachHighlightTile');
ok(ph.length > 300 && hlt.length > 50, 'syncCoachPhantom and coachHighlightTile exist');
ok(/opts\.prefer/.test(ph) && /src = \(want && want\.isConnected && want\.classList\.contains\('playable'\)\) \? want : held/.test(ph), 'the phantom copies the preferred (highlighted) card when it can be played');
ok(/src\.cloneNode\(true\)/.test(ph) && !/held\.cloneNode/.test(ph), 'the phantom is cloned from the source card');
ok(/mountDragGhost\(ph, src\)/.test(ph), 'the phantom keeps the hand\'s ancestor styles (mountDragGhost)');
ok(/\.slot-target, \.center-slot-empty/.test(ph), 'the phantom aims at the open slot');
ok(/coachPhantom\.__src === src/.test(ph), 'a different source card rebuilds the phantom');
ok(/_tutHlUid/.test(hlt) && /tut-highlight/.test(hlt), 'coachHighlightTile finds the one highlighted hand card');
ok(/tip\.id === 'g-play'\) syncCoachPhantom\(pointer, \{prefer: coachHighlightTile\}\)/.test(src), 'the g-play step passes the highlighted card');
ok(/id:'g-play'[^\n]*anchor:\(\)=>\{ const h = coachHighlightTile\(\)/.test(src), 'the g-play step points at the highlighted card');
ok(/dropCoachPhantom\(\);/.test(fnSrc('hideCoachTip')), 'hideCoachTip removes the phantom and its host');
{ const m = tpl.match(/\.coach-phantom\{[^}]*\}/); ok(m && !/saturate/.test(m[0]), 'the phantom is no longer desaturated'); }

// --- 2. faction pick goes straight in
const rf = fnSrc('resolveFactionChoice');
ok(/factionToBattleFx\(pick, el, hide\)/.test(rf), 'the picker fx only hides the picker at its end');
ok(/if\(!fx\) hide\(\);\s*\n\s*start\(\);/.test(rf), 'the tutorial fight starts at once, fx or not');
ok(/const start = \(\)=>\{ beginTutorialStage\(1\); fadeInBattlefield\(\); \}/.test(rf), 'start() begins stage 1 and fades the battlefield in');
ok(/el0\.classList\.contains\('fs-zoom'\)/.test(rf), 'a second tap during the fade is ignored');
ok(/\.splash\.fs-zoom\{[^}]*pointer-events:none/.test(tpl), 'the fading picker lets clicks through');

// --- 4. greener tutorial board
const bmc = fnSrc('battlefieldMapClass');
ok(/m\.mode === 'tutorial'\) return 'bf-tutorial'/.test(bmc), 'a tutorial fight gets the bf-tutorial board');
ok(/\.battlefield\.bf-tutorial\{background:[^}]*#8fd16a[^}]*\}/.test(tpl), 'bf-tutorial is tinted green');
{ // with no map and no override, a tutorial match is bf-tutorial; a Conquest fight on m1 is not
  const f = new Function('loadBattlefieldBgOverride', 'MAP_BATTLEFIELD_CLASS', 'MAP_ART_IDS', 'raidGroundOf', 'ARENA_FIGHT_MODES', bmc + '\nreturn battlefieldMapClass;')(
    ()=> 'auto', {m1:'map-m1'}, new Set(['m1']), ()=> null, new Set());
  ok(f({mode:'tutorial'}) === 'bf-tutorial', 'battlefieldMapClass(tutorial) is bf-tutorial');
  ok(f({mode:'conquest', conquestNode:{mapId:'m1'}}) === 'map-m1 has-floor-art', 'a Conquest fight keeps its map ground');
}

// --- 5. Tutorial map layout
const tc = fnSrc('tutSideCentred'), tp = fnSrc('tutPairCentred'), slide = fnSrc('tutMapOpenSlide'), mnp = fnSrc('mapNodePositions');
ok(tc && tp && slide, 'tutSideCentred, tutPairCentred and tutMapOpenSlide exist');
ok((mnp.match(/tutSideCentred\(map,/g) || []).length === 2, 'mapNodePositions centres the pair on both paths (with and without layout overrides)');
{
  const map = {id:'mtut', nodes:[{key:'tutorial', kind:'tutorial', stage:1}, {key:'tutorial2', kind:'tutorial', stage:2}, {key:'T-2'}, {key:'T-3'}, {key:'T-4'}]};
  const pos = [{x:16, y:64}, {x:34, y:40}, {x:52, y:62}, {x:68, y:38}, {x:86, y:58}];
  const pair = new Function(tp + '\nreturn tutPairCentred;')();
  let hidden = true;
  const side = new Function('tutSideNodeHidden', 'tutPairCentred', 'conquestLayoutEdit', tc + '\nreturn tutSideCentred;')((m, n)=> hidden && /^T-/.test(n.key), pair, false);
  const c = side(map, pos), mx = (c[0].x + c[1].x)/2, my = (c[0].y + c[1].y)/2;
  ok(Math.abs(mx - 50) < 0.01 && Math.abs(my - 52) < 0.01, `during the tutorials the pair is centred (${mx}, ${my})`);
  // 2026-10-22 (package TU, owner: "T1 and T2 side by side"): level, T-1 on the left (was: the pair kept its diagonal shape)
  ok(c[0].y === c[1].y && c[0].x < c[1].x && c[1].x - c[0].x >= 20, 'the pair stands side by side, T-1 on the left');
  ok(c[2] === pos[2], 'the hidden fights keep their spots');
  hidden = false;
  ok(side(map, pos) === pos, 'once the map opens up every fight is at its real spot');
  ok(new Function('tutSideNodeHidden', 'tutPairCentred', 'conquestLayoutEdit', tc + '\nreturn tutSideCentred;')(()=> true, pair, true)(map, pos) === pos, 'the layout editor shows the real spots');
  ok(side({id:'m1', nodes:map.nodes}, pos) === pos, 'other maps are untouched');
}
ok(/TUT_MAP_OPEN_KEY = 'bramblewood_tut_map_opened_v1'/.test(src) && /localStorage\.setItem\(TUT_MAP_OPEN_KEY/.test(slide), 'the opening slide plays once');
ok(/reducedMotion\(\)\)\{ localStorage\.setItem\(TUT_MAP_OPEN_KEY/.test(slide), 'reduced motion: no slide');
ok(/\.tut-reward'\) \|\| tutorialRewardPopPending/.test(slide), 'the slide waits for the tutorial card window');
ok(/if\(map\.id === 'mtut' && !conquestLayoutEdit\) tutMapOpenSlide\(map, positions\)/.test(src), 'the map render runs the slide on the Tutorial map');
ok(/\.conquest-map-canvas\.tut-opening \.fxe-bramble/.test(tpl), 'the bramble rings wait for their markers');

// --- 7. card windows fade out shrinking
const close = fnSrc('tutRewardClose');
ok(/is-closing/.test(close) && /reducedMotion\(\)/.test(close) && /setTimeout\(end, 400\)/.test(close), 'tutRewardClose: .is-closing, reduced motion, a fallback');
for(const fn of ['openStarterDeckStep', 'openDeckTopUpStep']){
  const s = fnSrc(fn);
  ok(/tutRewardClose\(ov, onDone\)/.test(s) && !/ov\.remove\(\); onDone/.test(s), `${fn} closes through tutRewardClose`);
}
ok(/\.tut-reward\.is-closing\{animation:trVeilOut \.28s/.test(tpl) && /@keyframes trShrinkOut\{from\{transform:scale\(1\);\} to\{transform:scale\(\.94\);\}\}/.test(tpl), 'the window fades out in 280 ms while shrinking to 94%');
ok(/prefers-reduced-motion: reduce\)\{ \.tut-reward\.is-closing, \.tut-reward\.is-closing \.starter-modal\{animation:none;\}/.test(tpl), 'reduced motion: no closing animation');

// --- the build carries it
const idx = fs.readFileSync(path.join(ROOT, 'index.html'), 'utf8');
ok(['function tutRewardClose(', 'function tutMapOpenSlide(', 'function coachHighlightTile(', '.battlefield.bf-tutorial{'].every(s=> idx.includes(s)), 'index.html is rebuilt with the changes');

console.log(fail ? `tutorial-2026-10-18: ${fail} of ${checks} checks failed` : `tutorial-2026-10-18: all ${checks} checks pass`);
process.exit(fail ? 1 : 0);
