#!/usr/bin/env node
// 2026-11-12 (package FX8, owner 23:22): the eleven cinematic board effects (bramblewood-cinematic.js), checked in a real page.
//   1. files: the module is in the build (assemble_arena.py) and the Lab (build.py), one entry point per effect, no filter / blend layer in the source,
//      the Lab group and manifest, the catalogue, the cue sheet and the CHANGELOG entry; the effects are NOT called from arena_app.js (Lab only)
//   2. in a page: each effect runs fast-forwarded, leaves nothing behind (no .cn-root, canvas, translate, timers), at most one canvas at any time
//   3. Low: no canvas; reduced motion: no canvas, a still frame, then it ends; a tap skips to the aftermath, a second tap ends it; stop() cleans up
'use strict';
const fs = require('fs'), path = require('path');
const ROOT = path.join(__dirname, '..');
const rd = f=> fs.readFileSync(path.join(ROOT, f), 'utf8');
let fail = 0, n = 0; const ok = (c, m)=>{ n++; if(!c){ fail++; console.log('  x', m); } };
const NAMES = ['meteor', 'eclipse', 'lightning', 'tidalWave', 'earthquake', 'eruption', 'blizzard', 'aurora', 'wildfire', 'swarm', 'stampede'];

// 1. files
const src = rd('bramblewood-cinematic.js'), asm = rd('assemble_arena.py'), build = rd('tools/effects-lab/build.py'), man = rd('tools/effects-lab/manifest/cine.js');
ok(/bramblewood-cinematic\.js/.test(asm) && /bramblewood-cinematic\.js/.test(build), 'the module is in assemble_arena.py and the Lab build');
ok(NAMES.every(k=> new RegExp('\\b' + k + ': \\(el, o\\)=> run\\(').test(src)), 'one entry point per effect (11)');
ok((src.replace(/\/\*[\s\S]*?\*\//g, '').match(/[^-]filter\s*:/g) || []).length === 1 && !/mix-blend-mode|backdrop-filter/.test(src), 'no blend layer, and one CSS filter in all (the Stampede herd layer, brightness 0), never per card');
ok((src.match(/createElement\('canvas'\)/g) || []).length === 1, 'one canvas, made once');
ok(NAMES.every(k=> man.includes("E('" + k + "'")) && /area:'cine'/.test(man), 'the Lab manifest lists all 11 in the area "cine"');
ok(/\['cine', 'Cinematic \(FX8\)'/.test(rd('tools/effects-lab/fxlab-catalogue.js')), 'the Lab group is titled "Cinematic (FX8)"');
ok(/Cinematic \(FX8\)/.test(rd('docs/effects-catalogue.md')) && /package FX8/.test(rd('docs/sfx-cue-sheet.md')) && /Package FX8/.test(rd('docs/CHANGELOG.md').slice(0, 3000)), 'catalogue, cue sheet and CHANGELOG entries');
ok(!/BramblewoodCinematic/.test(rd('arena_app.js')), 'not wired into fights (arena_app.js untouched)');
ok(NAMES.every(k=> fs.existsSync(path.join(ROOT, 'docs/screens/fx8/' + k + '-stages.png'))), 'a contact sheet per effect');
ok(/tests\/fx8-2026-11-12\.js/.test(rd('tests/run-all.sh')), 'listed in tests/run-all.sh');

// 2-3. in a page
function pw(){ try{ return require('playwright'); }catch(e){ try{ return require(path.join(require('child_process').execSync('npm root -g').toString().trim(), 'playwright')); }catch(e2){ console.log('  playwright not found'); process.exit(1); } } }
const EXE = process.env.BW_CHROMIUM || '/opt/pw-browsers/chromium_headless_shell-1194/chrome-linux/headless_shell';
const TYPES = {'.html': 'text/html', '.js': 'text/javascript', '.json': 'application/json', '.png': 'image/png', '.webp': 'image/webp', '.jpg': 'image/jpeg', '.svg': 'image/svg+xml', '.css': 'text/css', '.woff2': 'font/woff2'};
(async()=>{
  const http = require('http');
  const srv = await new Promise(res=>{ const s = http.createServer((q, r)=>{ let p = decodeURIComponent(q.url.split('?')[0]); if(p === '/') p = '/index.html'; const f = path.join(ROOT, p); if(!f.startsWith(ROOT)){ r.writeHead(403); r.end(); return; }
    fs.readFile(f, (e, d)=>{ if(e){ r.writeHead(404); r.end(); return; } r.writeHead(200, {'content-type': TYPES[path.extname(f)] || 'application/octet-stream'}); r.end(d); }); }); s.listen(0, '127.0.0.1', ()=> res(s)); });
  const b = await pw().chromium.launch({executablePath: fs.existsSync(EXE) ? EXE : undefined});
  const pg = await b.newPage({viewport: {width: 390, height: 844}}); const errs = []; pg.on('pageerror', e=> errs.push(String(e)));
  await pg.addInitScript("localStorage.setItem('bramblewood_arena_tutorial_done','1'); sessionStorage.setItem('bramblewood_seen_splash','1');");
  await pg.goto('http://127.0.0.1:' + srv.address().port + '/index.html', {waitUntil: 'domcontentloaded', timeout: 120000}); await pg.waitForTimeout(1500);
  await pg.evaluate(()=>{ const h = document.createElement('div'); h.id = 'fx8host'; h.style.cssText = 'position:fixed;left:10px;top:10px;width:360px;height:480px;background:#456;z-index:9'; document.body.appendChild(h); });
  ok(await pg.evaluate(()=> typeof BramblewoodCinematic === 'object' && BramblewoodCinematic.names.length === 11), 'the built page exposes BramblewoodCinematic with 11 effects');
  const clean = ()=> pg.evaluate(()=>{ const h = document.getElementById('fx8host'); return {root: h.querySelectorAll('.cn-root').length, cv: document.querySelectorAll('.cn-cv').length, tr: h.style.translate, run: BramblewoodCinematic.running(), kids: h.children.length}; });
  for(const k of NAMES){
    const r = await pg.evaluate(async k=>{ const h = document.getElementById('fx8host'); let maxCv = 0, maxNodes = 0, t0 = performance.now();
      const iv = setInterval(()=>{ maxCv = Math.max(maxCv, h.querySelectorAll('canvas').length); maxNodes = Math.max(maxNodes, h.querySelectorAll('*').length); }, 30);
      await BramblewoodCinematic[k](h, {level: 'high', reduced: false, speed: 8}); clearInterval(iv); return {maxCv, maxNodes, ms: performance.now() - t0}; }, k);
    const c = await clean();
    ok(r.maxCv <= 1, k + ': at most one canvas (' + r.maxCv + ')'); ok(r.ms > 300 && r.ms < 6000, k + ': runs and ends (' + Math.round(r.ms) + ' ms at 8x)'); ok(r.maxNodes < 90, k + ': a modest node count (' + r.maxNodes + ')');
    ok(c.root === 0 && c.cv === 0 && !c.tr && c.run === 0 && c.kids === 0, k + ': nothing left behind ' + JSON.stringify(c));
    const low = await pg.evaluate(async k=>{ const h = document.getElementById('fx8host'); let cv = 0; const iv = setInterval(()=>{ cv += h.querySelectorAll('canvas').length; }, 30); await BramblewoodCinematic[k](h, {level: 'low', speed: 8}); clearInterval(iv); return cv; }, k);
    ok(low === 0, k + ': Low effects makes no canvas'); ok((await clean()).root === 0, k + ': Low leaves nothing');
    const red = await pg.evaluate(async k=>{ const h = document.getElementById('fx8host'); let cv = 0, still = 0; const t0 = performance.now(); const p = BramblewoodCinematic[k](h, {level: 'high', reduced: true});
      const iv = setInterval(()=>{ cv += h.querySelectorAll('canvas').length; }, 30); await new Promise(r=> setTimeout(r, 400)); still = h.querySelectorAll('.cn-root').length; await p; clearInterval(iv); return {cv, still, ms: performance.now() - t0}; }, k);
    ok(red.cv === 0 && red.still === 1 && red.ms > 1000 && red.ms < 5000, k + ': reduced motion is a still frame then a fade ' + JSON.stringify(red)); ok((await clean()).root === 0, k + ': reduced leaves nothing');
  }
  // skip and stop
  const sk = await pg.evaluate(async ()=>{ const h = document.getElementById('fx8host'); const p = BramblewoodCinematic.meteor(h, {level: 'high', reduced: false}); await new Promise(r=> setTimeout(r, 400));
    const t1 = p.timeline.time(); const root = h.querySelector('.cn-root'); root.dispatchEvent(new PointerEvent('pointerdown', {bubbles: true})); const t2 = p.timeline.time(), after = p.timeline.labels.after;
    root.dispatchEvent(new PointerEvent('pointerdown', {bubbles: true})); await p; return {t1, t2, after, left: h.querySelectorAll('.cn-root').length}; });
  ok(sk.t1 < 1 && Math.abs(sk.t2 - sk.after) < .3 && sk.left === 0, 'a tap jumps to the aftermath, a second tap ends it ' + JSON.stringify(sk));
  const st = await pg.evaluate(async ()=>{ const h = document.getElementById('fx8host'); const p = BramblewoodCinematic.swarm(h, {level: 'high', reduced: false}); await new Promise(r=> setTimeout(r, 500)); p.stop(); await p; return document.querySelectorAll('.cn-root,.cn-cv').length; });
  ok(st === 0, 'stop() removes everything');
  // a second effect on the same board replaces the first
  const two = await pg.evaluate(async ()=>{ const h = document.getElementById('fx8host'); const a = BramblewoodCinematic.meteor(h, {level: 'high'}); const b = BramblewoodCinematic.eclipse(h, {level: 'high'}); const roots = h.querySelectorAll('.cn-root').length; b.stop(); await a; await b; return roots; });
  ok(two === 1, 'a new effect on the same board ends the old one');
  ok(errs.length === 0, 'no page errors ' + errs.slice(0, 2).join(' | '));
  await b.close(); srv.close();
  console.log(fail ? 'FAILED ' + fail + ' of ' + n : 'fx8: ' + n + ' checks passed'); process.exit(fail ? 1 : 0);
})();
