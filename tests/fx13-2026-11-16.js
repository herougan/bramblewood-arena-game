#!/usr/bin/env node
// 2026-11-16 (package FX13, owner 20:20: "The high tide looks a bit ugly. The waves aren't even connected. And they don't resemble the foamy
// colour at the top of waves. Anyway, they should disappear off at the top."). Checks:
//   1. files: FX.B.tideSwellHTML / the edge tile in bramblewood-fx-b.js, syncTideScene puts the swells in the scene, FX6's crest layer is
//      gone from the game, the swell CSS animates transform / opacity only (no filter, no blend mode), fades at the top (mask), Low pauses
//      it, None hides it, reduced motion pauses it; the Lab manifest, the inventory, the catalogue, the CHANGELOG, run-all.sh
//   2. in the built page, on a real fight at High Tide: the tide layer renders, each swell is ONE continuous path (one M) that spans the
//      board's width (and one sideways loop more), the swell fades toward the top, the Ebb edge wears the new foam tile, no console errors,
//      and the layer is removed when the tide ends
'use strict';
const fs = require('fs'), path = require('path');
const ROOT = path.join(__dirname, '..');
const rd = f=> fs.readFileSync(path.join(ROOT, f), 'utf8');
let fail = 0, n = 0; const ok = (c, m)=>{ n++; if(!c){ fail++; console.log('  x', m); } };

// ---- 1. files
const B = rd('bramblewood-fx-b.js'), app = rd('arena_app.js'), tpl = rd('arena_template.html');
ok(/M\.tideSwellHTML = function\(\)/.test(B) && /function edgeTileURL\(back\)/.test(B), 'FX.B draws the swells and the edge tile');
ok(/function tideSwellHTML\(\)\{ try\{ return \(window\.FX && FX\.B && FX\.B\.tideSwellHTML\)/.test(app) && /<i class="tw-sheen"><\/i><\/div><\/div>' \+ tideSwellHTML\(\) \+ '<i class="tw-edge tw-edge-b">/.test(app), 'syncTideScene puts the swells in the standing tide scene');
ok(!/tw-wave/.test(app) && !/\.tw-wave|twWaveDrift|twWaveIn/.test(tpl), "FX6's crest layer (.tw-wave) is gone from the game");
ok(!/^  \.tide-scene \.tw-edge\{[^}]*url\(/m.test(tpl) && !/^  \.tide-scene \.tw-edge\.tw-edge-b\{[^}]*url\(/m.test(tpl), 'the old edge images left the template (the pixel style keeps its own)');
const swCss = (B.match(/css\('tideSwell', `[\s\S]*?`\);/) || [''])[0];
ok(swCss.length > 500 && !/(^|[^-])filter\s*:|mix-blend-mode|backdrop-filter/.test(swCss), 'no filter or blend mode in the swell CSS');
const kf = (swCss.match(/@keyframes fxbSw\w+\{[\s\S]*?\}\}/g) || []);
ok(kf.length === 2 && kf.every(k=> !/(^|[{;\s])(top|left|bottom|height|width|margin)\s*:/.test(k.replace(/@keyframes \w+/, ''))), 'the swell keyframes move transform / opacity only');
ok(/mask-image:linear-gradient\(0deg, #000 0, #000 40%, rgba\(0,0,0,\.55\) 64%, transparent 90%\)/.test(swCss), 'the swells fade out toward the top (mask)');
ok(/html\[data-fx="low"\] \.fxb-swell :is\(\.fxb-sw-lane, \.fxb-sw-svg\)\{animation-play-state:paused;\}/.test(swCss) && /html\[data-fx="none"\] \.tide-scene \.fxb-swell\{display:none;\}/.test(swCss)
  && /prefers-reduced-motion: reduce\)\{ \.fxb-swell :is\(\.fxb-sw-lane, \.fxb-sw-svg\)\{animation-play-state:paused;\} \}/.test(swCss), 'Low effects pause it, None hides it, reduced motion pauses it');
ok(/\.tide-scene\[data-k="high"\] \.fxb-swell\{opacity:1; visibility:visible;/.test(swCss), 'shown only at High Tide');
const man = rd('tools/effects-lab/manifest/fx13.js'), inv = JSON.parse(rd('docs/effects-inventory-2026-10-15.json')), by = Object.fromEntries(inv.map(e=> [e.id, e]));
ok(/id:'wt-tide-high'/.test(man) && /id:'wt-tide-ebb'/.test(man) && /tideSwellHTML/.test(rd('tools/effects-lab/fx-src-extra.txt')), 'the Lab plays it (manifest/fx13.js, tideSwellHTML synced)');
ok(by['wt-tide-high'] && by['wt-tide-high'].updated === '2026-11-16' && /FX13/.test(by['wt-tide-high'].current) && by['wt-tide-high'].lab === 'fx13.js', 'the inventory entry is updated');
ok(/package FX13/.test(rd('docs/effects-catalogue.md')) && /package FX13/i.test(rd('docs/CHANGELOG.md')) && /tests\/fx13-2026-11-16\.js/.test(rd('tests/run-all.sh')), 'catalogue, CHANGELOG, run-all.sh');

// ---- 2. the built page
function pw(){ try{ return require('playwright'); }catch(e){ try{ return require(path.join(require('child_process').execSync('npm root -g').toString().trim(), 'playwright')); }catch(e2){ console.log('  playwright not found'); process.exit(1); } } }
const EXE = process.env.BW_CHROMIUM || '/opt/pw-browsers/chromium_headless_shell-1194/chrome-linux/headless_shell';
const TYPES = {'.html': 'text/html', '.js': 'text/javascript', '.json': 'application/json', '.png': 'image/png', '.webp': 'image/webp', '.jpg': 'image/jpeg', '.svg': 'image/svg+xml', '.css': 'text/css', '.woff2': 'font/woff2'};
const SKIP = "localStorage.setItem('bramblewood_arena_tutorial_done','1'); sessionStorage.setItem('bramblewood_seen_splash','1'); localStorage.setItem('bramblewood_fx_level','high'); localStorage.setItem('bramblewood_arena_faction','otters');"
  + "localStorage.setItem('bramblewood_coach_seen', JSON.stringify(['wait','lumber','leader','handLimit','g-peek','skill-flying']));";
const FIGHT = `(async()=>{ try{ saveTutorial2Done(); saveTutorialDone(); skipTriggerLesson(); }catch(e){} window.deckSizeOkOrWarn = ()=> true; window.showCoachTip = ()=>{}; window.maybeShowCoachTip = ()=>{};
  adminModeEnabled = true; forcedNextSeed = 777; switchTab('play'); startConquestMatch('m1', '0-2', {skipEnergyCost:true, noOpener:true});
  for(let i = 0; i < 60 && !matchState; i++) await new Promise(r=> setTimeout(r, 200)); await new Promise(r=> setTimeout(r, 2000)); return !!matchState; })()`;
// the tide as the engine would report it; tideSceneSet / syncTideScene draw it (in place: a High Tide already standing)
const TIDE = k=> `(async()=>{ const m = matchState; m.engine.getTide = ()=> ${k ? `'${k}'` : 'null'}; m._tideScene = ${k ? `{k:'${k}', from:'${k}', at:0, tilt:0}` : 'm._tideScene'}; renderMatchUI(); syncTideScene(m); await new Promise(r=> setTimeout(r, 600)); })()`;
const PROBE = `(()=>{ const bf = document.getElementById('battlefieldEl'), w = bf && bf.querySelector(':scope > .tide-scene'), sw = w && w.querySelector('.fxb-swell'); if(!sw) return {scene: !!w};
  const br = bf.getBoundingClientRect(), cs = getComputedStyle(sw), lanes = [...sw.querySelectorAll('.fxb-sw-lane')];
  const rows = lanes.map(l=>{ const svg = l.querySelector('svg'), p = svg.querySelector('defs path'), uses = svg.querySelectorAll('use'), crest = svg.querySelector('.fxb-sw-crest'), r = crest.getBoundingClientRect(), ls = getComputedStyle(l);
    return {moves: (p.getAttribute('d').match(/M/g) || []).length, w: r.width, left: r.left, right: r.right, uses: uses.length, anim: ls.animationName, svgAnim: getComputedStyle(svg).animationName}; });
  return {scene: true, k: w.dataset.k, op: +cs.opacity, vis: cs.visibility, mask: cs.maskImage || cs.webkitMaskImage, filter: cs.filter, blend: cs.mixBlendMode, bw: br.width, bl: br.left, br: br.right, rows,
    edge: getComputedStyle(w.querySelector('.tw-edge:not(.tw-edge-b)')).backgroundImage.slice(0, 120)}; })()`;
(async()=>{
  if(!fs.existsSync(path.join(ROOT, 'index.html'))){ console.log('  no index.html: build first'); process.exit(1); }
  const http = require('http');
  const srv = await new Promise(res=>{ const s = http.createServer((q, r)=>{ let p = decodeURIComponent(q.url.split('?')[0]); if(p === '/') p = '/index.html'; const f = path.join(ROOT, p); if(!f.startsWith(ROOT)){ r.writeHead(403); r.end(); return; }
    fs.readFile(f, (e, d)=>{ if(e){ r.writeHead(404); r.end(); return; } r.writeHead(200, {'content-type': TYPES[path.extname(f)] || 'application/octet-stream'}); r.end(d); }); }); s.listen(0, '127.0.0.1', ()=> res(s)); });
  const b = await pw().chromium.launch({executablePath: fs.existsSync(EXE) ? EXE : undefined});
  for(const [w, h] of [[390, 844], [1366, 860]]){
    const pg = await b.newPage({viewport: {width: w, height: h}}); const errs = [];
    pg.on('pageerror', e=> errs.push(String(e))); pg.on('console', m=>{ if(m.type() === 'error' && !/Failed to load resource|ERR_|net::/.test(m.text())) errs.push('console: ' + m.text()); });
    await pg.route(/^https?:\/\/(?!127\.0\.0\.1)/, r=> r.abort()); // offline: no Supabase or font calls
    await pg.addInitScript(SKIP);
    await pg.goto('http://127.0.0.1:' + srv.address().port + '/index.html', {waitUntil: 'domcontentloaded', timeout: 180000});
    await pg.waitForFunction("typeof startConquestMatch === 'function'", null, {timeout: 180000}); await pg.waitForTimeout(1300);
    ok(await pg.evaluate(FIGHT), `${w}: a fight starts`);
    ok(await pg.evaluate(()=> !!(window.FX && FX.B && FX.B.tideSwellHTML)), `${w}: the built page has FX.B.tideSwellHTML`);
    await pg.evaluate(TIDE('high')); await pg.waitForTimeout(1100);
    const p = await pg.evaluate(PROBE);
    ok(p.scene && p.k === 'high' && p.rows && p.rows.length === 3, `${w}: the tide layer renders on a High Tide fight, three swells ${JSON.stringify({scene: p.scene, k: p.k, n: p.rows && p.rows.length})}`);
    if(p.rows){
      ok(p.op > .99 && p.vis === 'visible', `${w}: the swells are shown (opacity ${p.op}, ${p.vis})`);
      ok(p.rows.every(r=> r.moves === 1), `${w}: each swell is one continuous path (one M) ${JSON.stringify(p.rows.map(r=> r.moves))}`);
      ok(p.rows.every(r=> r.left <= p.bl + 1 && r.right >= p.br - 1 && r.w >= p.bw), `${w}: each crest spans the board's width ${JSON.stringify(p.rows.map(r=> [Math.round(r.left), Math.round(r.right)]))} vs ${Math.round(p.bl)}..${Math.round(p.br)}`);
      ok(p.rows.every(r=> r.anim === 'fxbSwRise' && r.svgAnim === 'fxbSwDrift'), `${w}: they rise and drift ${JSON.stringify(p.rows.map(r=> r.anim + '/' + r.svgAnim))}`);
      ok(/linear-gradient/.test(p.mask || '') && p.filter === 'none' && p.blend === 'normal', `${w}: a top fade mask, no filter or blend mode ${JSON.stringify({mask: (p.mask || '').slice(0, 40), filter: p.filter, blend: p.blend})}`);
      ok(/data:image\/svg\+xml/.test(p.edge) && /fffdf8|fffaf0/i.test(decodeURIComponent(await pg.evaluate(()=> getComputedStyle(document.querySelector('#battlefieldEl > .tide-scene .tw-edge:not(.tw-edge-b)')).backgroundImage))), `${w}: the water's front edge wears the foam tile`);
    }
    // the effects levels: Low pauses, None hides
    const lv = await pg.evaluate(async ()=>{ const r = {}, sw = ()=> document.querySelector('#battlefieldEl > .tide-scene .fxb-swell');
      document.documentElement.dataset.fx = 'low'; await new Promise(q=> setTimeout(q, 50)); r.low = getComputedStyle(sw().querySelector('.fxb-sw-lane')).animationPlayState;
      document.documentElement.dataset.fx = 'none'; await new Promise(q=> setTimeout(q, 50)); r.none = getComputedStyle(sw()).display;
      document.documentElement.dataset.fx = 'high'; await new Promise(q=> setTimeout(q, 50)); r.high = getComputedStyle(sw().querySelector('.fxb-sw-lane')).animationPlayState; return r; });
    ok(lv.low === 'paused' && lv.none === 'none' && lv.high === 'running', `${w}: Low pauses the swells, None hides them ${JSON.stringify(lv)}`);
    // a redraw keeps one scene with one swell layer
    await pg.evaluate(async ()=>{ renderMatchUI(); syncTideScene(matchState); renderMatchUI(); await new Promise(r=> setTimeout(r, 300)); });
    ok(await pg.evaluate(()=> document.querySelectorAll('#battlefieldEl .tide-scene').length === 1 && document.querySelectorAll('#battlefieldEl .fxb-swell').length === 1), `${w}: redraws keep one scene and one swell layer`);
    // the tide ends: the swells hide at once, the scene goes once the water has drained and dried
    await pg.evaluate(TIDE(null));
    const mid = await pg.evaluate(()=>{ const w = document.querySelector('#battlefieldEl > .tide-scene'), sw = w && w.querySelector('.fxb-swell'); return {k: w && w.dataset.k, hidden: !sw || getComputedStyle(sw).visibility === 'hidden' || +getComputedStyle(sw).opacity < 1}; });
    ok(mid.k === 'none' && mid.hidden, `${w}: the swells fade out as the tide goes ${JSON.stringify(mid)}`);
    await pg.evaluate(async ()=>{ const m = matchState; if(m._tideScene) m._tideScene.at = Date.now() - 60000; syncTideScene(m); renderMatchUI(); await new Promise(r=> setTimeout(r, 300)); });
    ok(await pg.evaluate(()=> !document.querySelector('#battlefieldEl .tide-scene') && !document.querySelector('.fxb-swell')), `${w}: the tide layer is removed when the field ends`);
    ok(errs.length === 0, `${w}: no console errors ` + errs.slice(0, 3).join(' | '));
    await pg.close();
  }
  await b.close(); srv.close();
  console.log(fail ? 'FAILED ' + fail + ' of ' + n : 'fx13: ' + n + ' checks passed'); process.exit(fail ? 1 : 0);
})().catch(e=>{ console.log('  x crashed', e && e.message); process.exit(1); });
