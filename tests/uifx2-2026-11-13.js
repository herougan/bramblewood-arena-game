#!/usr/bin/env node
// 2026-11-13 (package UIFX2, owner 00:03: "season changes when moving from certain maps etc."): the world as a journey, checked without a browser.
//   1. bramblewood-ui-world.js loads on its own; every map of the road (Maps 0-24), every side map and dungeon has its own season or biome
//   2. seasonOf falls back by biome, then parent; an endless dungeon is 'deep'; the route: main maps walk (right when the map comes later), a side map zooms
//   3. the ambient: Medium 8 spans, High 14, half where the map already shows that weather, none on Low / reduced motion / deep;
//      its keyframes move transform and opacity only; the CSS has no filter / blend / :has, hides everything on None, the ambient on Low, in a fight
//      and under reduced motion; the travel beat and a season change fit in 1.2 s
//   4. wiring: one hook line in arena_app.js (renderConquestSubTab, after the map's other layers), the game bundle and the Lab load the file,
//      the Lab group "World (UIFX2)" (8 seasons + the travel beat), the catalogue, the CHANGELOG, run-all.sh
//   --browser: the real map screen at 390 px: a move m7 -> m10 plays the beat (a route, 7 prints), ends in winter with 8-14 spans placed under
//      the map, a tap finishes it at once, nothing left behind; Effects Low: the vignette only
'use strict';
const fs = require('fs'), path = require('path'), vm = require('vm');
const ROOT = path.join(__dirname, '..');
const rd = f=> fs.readFileSync(path.join(ROOT, f), 'utf8');
const src = rd('arena_app.js'), world = rd('bramblewood-ui-world.js');
let fail = 0, n = 0; const ok = (c, m)=>{ n++; if(!c){ fail++; console.log('  x', m); } };

// 1. the module and its table
const load = extra=>{ const ctx = Object.assign({console, Math, Date, performance: {now: ()=> 0}}, extra || {}); vm.createContext(ctx); vm.runInContext(world, ctx); return ctx.BramblewoodWorld; };
const W = load();
ok(W && typeof W.arrive === 'function' && typeof W.travel === 'function' && typeof W.setSeason === 'function' && typeof W.seasonOf === 'function', 'BramblewoodWorld exports arrive / travel / setSeason / seasonOf');
ok(W.KINDS.join() === 'spring,summer,autumn,winter,desert,ash,coast,deep', 'eight kinds: the four seasons, desert, ash, coast, deep');
// the maps as the game defines them (the CONQUEST_MAPS literal, evaluated with every name it reads stubbed)
const maps = (()=>{ const i = src.indexOf('const CONQUEST_MAPS = ['); let j = src.indexOf('[', i), d = 0, k = j, q = null;
  for(; k < src.length; k++){ const c = src[k]; if(!q && c === '/' && src[k + 1] === '/'){ k = src.indexOf('\n', k); continue; } if(!q && c === '/' && src[k + 1] === '*'){ k = src.indexOf('*/', k) + 1; continue; }
    if(q){ if(c === '\\'){ k++; continue; } if(c === q) q = null; continue; } if(c === '"' || c === "'" || c === '`'){ q = c; continue; } if(c === '[') d++; else if(c === ']' && !--d) break; }
  const sb = new Proxy({}, {has: ()=> true, get: (t, p)=> p === Symbol.unscopables ? undefined : (p in globalThis ? globalThis[p] : ()=> ({}))});
  return new Function('sb', 'with(sb){ return ' + src.slice(j, k + 1) + '; }')(sb); })();
const real = maps.filter(m=> !/^Reserved$/.test(m.name));
ok(real.length >= 40, `the map list was read (${real.length} maps)`);
const missing = real.filter(m=> !W.MAP_SEASON[m.id]).map(m=> m.id);
ok(!missing.length, 'every map and side map has its own row in MAP_SEASON (missing: ' + missing.join(', ') + ')');
ok(Object.values(W.MAP_SEASON).every(v=> W.KINDS.includes(v)), 'every row is one of the eight kinds');
['mm', 'mlb', 'muc', 'tw'].forEach(id=> ok(W.MAP_SEASON[id] === 'deep', `dungeon / tower ${id} is deep`));
const mains = real.filter(m=> !m.sub);
ok(mains.slice(0, 22).every(m=> W.MAP_SEASON[m.id]), 'Maps 0-21 by number are all in the table');
const want = {m1:'spring', mf:'spring', mb:'coast', mc:'coast', m2:'summer', mw:'summer', m8:'autumn', mu:'autumn', m4:'deep', mk:'coast', m7:'coast', m10:'winter', mh:'autumn', mr:'autumn', m5:'summer', ml:'autumn', mt:'winter', m6:'winter', md:'desert', m3:'ash', m11:'ash', m21:'winter'};
ok(Object.keys(want).every(id=> W.MAP_SEASON[id] === want[id]), 'Maps 0-21 keep the seasons this package set (change the table and this list together)');
const used = new Set(mains.slice(0, 22).map(m=> W.MAP_SEASON[m.id])); ok(W.KINDS.every(k=> used.has(k)), 'the road through Maps 0-21 meets all eight kinds');

// 2. fallbacks and the route
{ const M = [{id:'a'}, {id:'b'}, {id:'c'}, {id:'s', sub:true, parent:'b'}, {id:'t', sub:true, parent:'b'}, {id:'zz', sub:true, parent:'m6'}, {id:'yy', endless:true, parent:'m1'}, {id:'xx'}];
  const V = load({CONQUEST_MAPS: M, MAP_BIOME_OF: {xx:'beach', b:'tundra'}});
  ok(V.seasonOf('xx') === 'coast' && V.seasonOf('b') === 'winter', 'a map without a row takes its biome\'s season');
  ok(V.seasonOf('zz') === 'winter', 'then its parent\'s'); ok(V.seasonOf('yy') === 'deep', 'an endless dungeon is deep'); ok(V.seasonOf('nope') === 'spring' && V.seasonOf('winter') === 'winter', 'unknown: spring; a kind is itself');
  const r = (a, b)=> JSON.stringify(V._route(a, b));
  ok(r('a', 'c') === '{"kind":"road","dir":"right"}' && r('c', 'a') === '{"kind":"road","dir":"left"}', 'main maps walk the road, right when the map comes later');
  ok(r('b', 's') === '{"kind":"zoom","dir":"up"}' && r('s', 'b') === '{"kind":"zoom","dir":"up"}' && r('s', 't') === '{"kind":"zoom","dir":"up"}', 'a side map and its parent (or a sibling) zoom, no route');
  ok(r('s', 'c') === '{"kind":"road","dir":"right"}', 'from a side map to another main map: by the parent\'s place'); }

// 3. the ambient and the CSS
ok(W._count('spring', 'med') === 8 && W._count('spring', 'high') === 14 && W._count('spring', 'high', true) === 7 && W._count('spring', 'med', true) === 4, 'spans: Medium 8, High 14, half where the map shows that weather already');
ok(['calm', 'off'].every(m=> W._count('winter', m) === 0) && W._count('deep', 'high') === 0, 'no spans on Low / reduced motion / None, nor in the dark');
W.KINDS.forEach(k=>{ const L = W._lanes(k); if(k === 'deep'){ ok(!L.length, 'deep has no lanes'); return; }
  ok(L.length === 14, `${k}: 14 lanes`);
  const props = new Set(); L.forEach(l=> W._kf(l).replace(/\{([^{}]*)\}/g, (_, body)=>{ body.split(';').forEach(d=>{ const p = d.split(':')[0].trim(); if(p) props.add(p); }); return ''; }));
  ok([...props].every(p=> p === 'transform' || p === 'opacity'), `${k}: keyframes move transform and opacity only (${[...props]})`);
  ok(L.every(l=> !/filter|mix-blend|box-shadow/.test(l.css)), `${k}: spans have no filter / blend / shadow`);
  ok(L.every(l=> l.dur >= 2.5 && l.dur <= 22), `${k}: loops between 2.5 and 22 s`); });
ok(W._lanes('spring')[3].css === load()._lanes('spring')[3].css, 'lanes are the same on every load (a re-render picks each span up where it was)');
const C = W._css();
ok(!/filter|mix-blend|:has\(|\[class\*=/.test(C), 'world CSS: no filter, blend mode, :has() or [class*=]');
ok(/@media \(prefers-reduced-motion: reduce\)\{ \.bww-amb, \.bww-fx, \.bww-road\{display:none;\} \}/.test(C), 'reduced motion: nothing moves');
ok(/html\[data-fx="none"\] \.bww-amb, html\[data-fx="none"\] \.bww-fx, html\[data-fx="none"\] \.bww-road, html\[data-fx="low"\] \.bww-amb\{display:none;\}/.test(C), 'Effects None: none of it; Low: no ambient');
ok(/#appWrap\.in-match \.bww-amb\{display:none;\}/.test(C), 'never in a fight');
ok(/\.bww-amb\{position:absolute; inset:0; z-index:0; overflow:hidden; pointer-events:none;[^}]*contain:strict/.test(C), 'the ambient takes no taps and is contained');
ok(/\.bww-fx, \.bww-road\{position:absolute; z-index:2; pointer-events:none;/.test(C), 'the beat takes no taps (a tap skips it and goes through)');
['desert', 'ash', 'coast'].forEach(k=> ok(new RegExp(`\\.season-veil\\.season-${k}\\{background:`).test(C), `the vignette has a ${k} look`)); ok(/\.season-veil\.season-deep\{display:none;\}/.test(C), 'no vignette in the dark');
ok(W.BEAT_MS <= 1200 && W.FADE_MS <= 1200, `the travel beat (${W.BEAT_MS} ms) and a season change (${W.FADE_MS} ms) fit in 1.2 s`);
ok(/'pointerdown', 'keydown', 'wheel'\][\s\S]{0,120}capture: true, passive: true/.test(world), 'a tap, key or wheel finishes the beat (passive capture listener: the tap still goes through)');
ok(/b\.timer = setTimeout\(/.test(world), 'a timer backs the beat up when GSAP is held (hidden tab)');
ok(!/setInterval|requestAnimationFrame/.test(world), 'no loops of its own: the ambient is CSS, the beats GSAP');
ok(/insertBefore\(el, before \|\| null\)/.test(world) && /:scope > \.fxe-tod/.test(world), 'the ambient goes under the time-of-day tint (dawn, dusk and night grade it)');

// 4. wiring
const hooks = src.split('\n').filter(l=> /BramblewoodWorld/.test(l));
ok(hooks.length === 1 && /2026-11-13 \(package UIFX2\)/.test(hooks[0]) && /BramblewoodWorld\.arrive\(map, conquestShaderHost\(\), document\.getElementById\('conquestCanvas'\)\)/.test(hooks[0]), 'arena_app.js: one dated hook line, arrive(map, layout, canvas)');
{ const i = src.indexOf('function renderConquestSubTab('), h = src.indexOf('BramblewoodWorld.arrive'), ms = src.indexOf("fxHook('mapShown'", i);
  ok(i > 0 && ms > i && h > ms && h - ms < 400, 'the hook sits in renderConquestSubTab right after the mapShown hook (shader, cave dark, tint and pawn are placed by then)'); }
ok(/open\(SCRATCH \+ "bramblewood-ui-world\.js", encoding="utf-8"\)/.test(rd('assemble_arena.py')), 'assemble_arena.py bundles bramblewood-ui-world.js');
ok(/bramblewood-ui-world\.js/.test(rd('tools/effects-lab/build.py')), 'the Effects Lab loads it');
{ const man = rd('tools/effects-lab/manifest/world.js'), reg = [];
  const ctx = {FXLAB: {register: s=> reg.push(s)}, window: {}}; vm.createContext(ctx); vm.runInContext(man, ctx);
  ok(reg.length === 9 && reg.every(s=> s.area === 'World (UIFX2)' && /^map-grand-uifx2-/.test(s.id) && s.variants.length >= 2 && s.variants.every(v=> typeof v.play === 'function')), 'Lab: 9 entries (8 seasons + travel) in "World (UIFX2)", each with replay variants');
  ok(W.KINDS.every(k=> reg.some(s=> s.id === 'map-grand-uifx2-' + k)) && reg.some(s=> s.id === 'map-grand-uifx2-travel' && s.variants.length === 3), 'Lab: one per season, the travel beat with 3 looks'); }
ok(/^## 2026-11-13 \(package UIFX2\)/m.test(rd('docs/effects-catalogue.md')), 'effects catalogue entry');
ok(/^## 2026-11-13 Package UIFX2/m.test(rd('docs/CHANGELOG.md')), 'CHANGELOG entry');
ok(/tests\/uifx2-2026-11-13\.js/.test(rd('tests/run-all.sh')), 'in run-all.sh');

async function browser(){
  let pw; try{ pw = require('playwright'); }catch(e){ console.log('  (browser part skipped: no playwright)'); return; }
  const EXE = process.env.BW_CHROMIUM || '/opt/pw-browsers/chromium_headless_shell-1194/chrome-linux/headless_shell';
  if(!fs.existsSync(EXE) || !fs.existsSync(path.join(ROOT, 'index.html'))){ console.log('  (browser part skipped: no Chromium or index.html)'); return; }
  const INIT = "localStorage.setItem('bramblewood_arena_tutorial_done','1'); localStorage.setItem('bramblewood_tutorial2_done_v1','1'); sessionStorage.setItem('bramblewood_seen_splash','1');";
  const SETUP = `(()=>{ try{ FEATURE_SPOTS.forEach(sp=> unlockFeature(sp.key)); }catch(e){} const p = loadConquestProgress(); p.completed = p.completed || [];
    CONQUEST_MAPS.forEach(m=> (m.nodes||[]).forEach(nd=>{ const id = conquestNodeId(m.id, nd.key); if(!p.completed.includes(id)) p.completed.push(id); })); saveConquestProgress(p); try{ localStorage.removeItem(HELD_PACKS_KEY); }catch(e){}
    try{ const f = loadDialogueFlags(); Object.keys(DIALOGUES).forEach(k=> f['seen:' + k] = 1); localStorage.setItem(DIALOGUE_FLAGS_KEY, JSON.stringify(f)); }catch(e){}
    const ids = CONQUEST_MAPS.map(m=> m.id); localStorage.setItem('bramblewood_maps_opened', JSON.stringify(ids)); sessionStorage.setItem('bw_fxg_map_titles', JSON.stringify(ids)); try{ mapVeilShownThisSession = true; }catch(e){}
    conquestWorldView = false; playSubTab = 'conquest'; conquestSelectedMap = 'm7'; switchTab('play'); renderPlay(); return 1; })()`;
  const b = await pw.chromium.launch({executablePath: EXE, args: ['--enable-unsafe-swiftshader', '--use-angle=swiftshader']}); const errs = [];
  try{
    const ctx = await b.newContext({viewport: {width: 390, height: 844}});
    await ctx.route('**/*', r=> r.request().url().startsWith('file:') ? r.continue() : r.abort());
    const pg = await ctx.newPage(); pg.on('pageerror', e=> errs.push(String(e))); pg.setDefaultTimeout(120000);
    await pg.addInitScript(INIT); await pg.goto('file://' + path.join(ROOT, 'index.html'), {waitUntil: 'domcontentloaded', timeout: 180000}); await pg.waitForTimeout(2500);
    await pg.evaluate(SETUP); await pg.waitForTimeout(1500);
    const clean = "document.querySelectorAll('.dialogue-wrap, .dlg, .modal-overlay, .coach-tip, .pack-open-overlay').forEach(e=> e.remove())";
    await pg.evaluate(clean);
    const st = await pg.evaluate("({k: BramblewoodWorld._state.kind, spans: document.querySelectorAll('#conquestLayout > .bww-amb > i').length, veil: (document.querySelector('#conquestLayout > .season-veil') || {}).className})");
    ok(st.k === 'coast' && st.spans >= 4 && /season-coast/.test(st.veil), '@390 Map 10: coast, ambient spans, the coast vignette ' + JSON.stringify(st));
    await pg.evaluate("BramblewoodWorld.travelBeat = true; conquestPanTo('m10', document.getElementById('playSubBody'), loadConquestProgress())"); // 2026-11-13 (UI51): the beat is off in the game; the test turns it on
    await pg.waitForFunction('!!BramblewoodWorld._state.beat', null, {timeout: 20000}).catch(()=>{});
    const mid = await pg.evaluate(`(()=>{ const b = BramblewoodWorld._state.beat; if(!b) return null; clearTimeout(b.timer); b.tl.pause(); b.tl.seek(.6);
      const lay = document.getElementById('conquestLayout'), amb = lay.querySelector(':scope > .bww-amb'), kids = [...lay.children];
      return {road: !!lay.querySelector(':scope > .bww-road path'), prints: lay.querySelectorAll('.bww-road .bww-pp').length, fx: !!lay.querySelector(':scope > .bww-fx'), dur: b.tl.duration(),
        ambBeforeMain: !!amb && kids.indexOf(amb) < kids.indexOf(lay.querySelector(':scope > .conquest-main')), veils: lay.querySelectorAll(':scope > .season-veil').length}; })()`);
    ok(mid && mid.road && mid.prints === 7 && mid.fx && mid.dur <= 1.2 && mid.ambBeforeMain && mid.veils === 2, '@390 the beat: a route, 7 paw prints, the season change, ≤ 1.2 s, the ambient under the map, two vignettes crossfading ' + JSON.stringify(mid));
    await pg.evaluate(clean); await pg.evaluate("document.body.dispatchEvent(new PointerEvent('pointerdown', {bubbles: true}))"); await pg.waitForTimeout(300); // a tap anywhere (no target: a real tap might land on a fight)
    const end = await pg.evaluate("(()=>{ const lay = document.getElementById('conquestLayout'); return {beat: !!BramblewoodWorld._state.beat, left: lay.querySelectorAll(':scope > .bww-road, :scope > .bww-fx').length, veils: lay.querySelectorAll(':scope > .season-veil').length, veil: lay.querySelector(':scope > .season-veil').className, k: BramblewoodWorld._state.kind, spans: lay.querySelectorAll(':scope > .bww-amb > i').length, ambs: document.querySelectorAll('.bww-amb:not(.is-out)').length}; })()");
    ok(end && !end.beat && end.left === 0 && end.veils === 1 && /season-winter/.test(end.veil) && end.k === 'winter' && end.spans >= 4 && end.ambs === 1, '@390 a tap finishes it: nothing left but one winter vignette and one ambient layer (the old one fading out) ' + JSON.stringify(end));
    await pg.evaluate("localStorage.setItem('bramblewood_fx_level', 'low'); applyFxLevel(); conquestPanTo('m7', document.getElementById('playSubBody'), loadConquestProgress())"); await pg.waitForTimeout(1200);
    const low = await pg.evaluate("(()=>{ const lay = document.getElementById('conquestLayout'); return {beat: !!BramblewoodWorld._state.beat, layers: lay.querySelectorAll('.bww-road, .bww-fx, .bww-amb').length, veil: lay.querySelector(':scope > .season-veil').className}; })()");
    ok(low && !low.beat && low.layers === 0 && /season-coast/.test(low.veil), 'Effects Low: no beat, no ambient, the coast vignette at once ' + JSON.stringify(low));
  } finally { await b.close(); }
  ok(!errs.length, 'no page errors (' + errs.slice(0, 2).join(' | ') + ')');
}

(process.argv.includes('--browser') ? browser() : Promise.resolve()).then(()=>{
  console.log(`uifx2: ${n - fail}/${n} passed`); process.exit(fail ? 1 : 0);
}, e=>{ console.log('  x browser part threw:', e && e.message); process.exit(1); });
