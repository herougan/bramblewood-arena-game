#!/usr/bin/env node
// Package FX6 (2026-11-12): what the four FX6 effects cost in a fight. Same fight (seeded, tools/perf/played_turn3.js's start), the same 2.5 s window of
// thread CPU time from a Chrome trace (main thread, every other thread, style, paint, style passes) and the rAF frame gaps, with the
// effect firing vs not, alternated, medians over --runs. Effects: rise (Bulwark's wall + dust), bugs (Swarm / spawn on death), puff (Spore Cloud), tide0 (a High Tide scene without the wave: the baseline) and tide (the same scene with the .tw-wave layer), all (every one at once).
//   node tools/perf/fx6_effects.js [--page index.html] [--runs 5] [--rate 1] [--json out.json]
'use strict';
const fs = require('fs'), path = require('path');
const ROOT = path.join(__dirname, '..', '..');
const args = process.argv.slice(2), opt = (k, d)=>{ const i = args.indexOf(k); return i >= 0 && args[i + 1] ? args[i + 1] : d; };
function pw(){ try{ return require('playwright'); }catch(e){ return require(path.join(require('child_process').execSync('npm root -g').toString().trim(), 'playwright')); } }
const src = fs.readFileSync(path.join(ROOT, 'tests/perf2-2026-11-11.js'), 'utf8');
const lit = n=>{ const j = src.indexOf('const ' + n + ' = ') + n.length + 9, q = src[j]; let k = j + 1; while(src[k] !== q || src[k - 1] === '\\') k++; return src.slice(j, k + 1); };
const SKIP = eval(lit('SKIP')), OWN = eval(lit('OWN'));
const EXE = process.env.BW_CHROMIUM || '/opt/pw-browsers/chromium_headless_shell-1194/chrome-linux/headless_shell';
const TYPES = {'.html': 'text/html', '.js': 'text/javascript', '.json': 'application/json', '.webp': 'image/webp', '.png': 'image/png', '.svg': 'image/svg+xml', '.css': 'text/css'};
function serve(){ const http = require('http'); return new Promise(res=>{ const s = http.createServer((q, r)=>{ let p = decodeURIComponent(q.url.split('?')[0]); if(p === '/') p = '/index.html';
  const f = path.join(ROOT, p); if(!f.startsWith(ROOT) || !fs.existsSync(f) || fs.statSync(f).isDirectory()){ r.writeHead(404); return r.end(); } r.writeHead(200, {'content-type': TYPES[path.extname(f)] || 'application/octet-stream'}); fs.createReadStream(f).pipe(r); }); s.listen(0, '127.0.0.1', ()=> res(s)); }); }
const SCENE = '<div class="tw-wet"></div><div class="tw-sheet"><div class="tw-body"><div class="tw-water"><div class="tw-surf"><i class="tw-caus"></i><i class="tw-caus c2"></i><i class="tw-sheen"></i></div></div><i class="tw-wave"></i><i class="tw-edge tw-edge-b"></i><i class="tw-edge"></i></div></div>';
// fires `what` once at the start of the window, then waits for it to end
const FIRE = what=> `(async()=>{ const W = ms=> new Promise(r=> setTimeout(r, ms)), c = [...document.querySelectorAll('#battlefieldInner .board-row > .board-card')], t = c[Math.min(2, c.length - 1)], what = ${JSON.stringify(what)};
  const wr = document.createElement('div'), bf = document.getElementById('battlefieldEl');
  if(what === 'tide' || what === 'tide0' || what === 'all'){ const x = document.createElement('div'); x.className = 'tide-scene'; x.dataset.k = 'high'; x.style.cssText = 'position:absolute; inset:0; pointer-events:none; overflow:hidden; --tw-to:-12px; --tw-slosh:8.5px;'; x.innerHTML = ${JSON.stringify(SCENE)}; if(what === 'tide0') x.querySelector('.tw-wave').style.display = 'none'; wr.style.cssText = 'position:absolute; inset:0; pointer-events:none;'; wr.appendChild(x); bf.insertBefore(wr, bf.firstChild); }
  if(what === 'rise' || what === 'all'){ riseUpFx(t); gsap.fromTo(t, {y:34, clipPath:'inset(100% -45% -12% -45%)'}, {y:0, clipPath:'inset(-14% -45% -12% -45%)', duration:.5, ease:'power2.out', clearProps:'clipPath,y'}); }
  if(what === 'bugs' || what === 'all'){ bugCrawlVfx(c[0], {n:10}); bugCrawlVfx(t, {n:10}); }
  if(what === 'puff' || what === 'all'){ sporePuffVfx(c[0]); sporePuffVfx(t); sporePuffVfx(c[c.length - 1]); }
  await W(2500); wr.remove(); return {left: document.querySelectorAll('.fx-float-host').length}; })()`;
const med = a=>{ const s = a.slice().sort((x, y)=> x - y); return s.length ? s[Math.floor(s.length / 2)] : 0; };
(async()=>{
  const runs = +opt('--runs', 5), rate = +opt('--rate', 1), page = opt('--page', 'index.html'), srv = await serve(), url = `http://127.0.0.1:${srv.address().port}/${page}`;
  const b = await pw().chromium.launch({executablePath: EXE, args: ['--enable-unsafe-swiftshader', '--use-angle=swiftshader', '--ignore-gpu-blocklist']});
  const modes = ['none', 'tide0', 'tide', 'rise', 'bugs', 'puff', 'all'], res = {}; modes.forEach(m=> res[m] = []);
  for(let r = 0; r < runs; r++) for(const mode of modes){
    const ctx = await b.newContext({viewport: {width: 1366, height: 768}}), pg = await ctx.newPage(), errs = []; pg.on('pageerror', e=> errs.push(String(e)));
    await pg.addInitScript(SKIP + `window.__fr = []; (()=>{ let l = performance.now(); const f = t=>{ window.__fr.push(t - l); l = t; requestAnimationFrame(f); }; requestAnimationFrame(f); })();`);
    await pg.goto(url); await pg.waitForFunction("typeof startConquestMatch === 'function'", null, {timeout: 120000}); await pg.waitForTimeout(1500); await pg.evaluate(OWN);
    await pg.evaluate(`(async()=>{ adminModeEnabled = true; forcedNextSeed = 777; switchTab('play'); startConquestMatch('mw', '5-3', {skipEnergyCost:true, noOpener:true}); await new Promise(r=> setTimeout(r, 2600)); try{ skipTriggerLesson(); }catch(e){} const h = document.getElementById('toastHost'); if(h) h.remove(); window.showToast = ()=>{};
      const m = matchState, pl = m.players[1], c = pl.hand.find(h=> m.engine.canPlay(pl, h.defId, h.uid)); if(c) await playCardByUid(c.uid, 'left'); await new Promise(r=> setTimeout(r, 2500)); })()`);
    const cdp = await ctx.newCDPSession(pg); await cdp.send('Emulation.setCPUThrottlingRate', {rate});
    const evs = [], on = d=>{ for(const e of d.value) evs.push(e); }; cdp.on('Tracing.dataCollected', on);
    await pg.evaluate("window.__fr.length = 0");
    await cdp.send('Tracing.start', {transferMode: 'ReportEvents', traceConfig: {includedCategories: ['devtools.timeline', 'disabled-by-default-devtools.timeline'], recordMode: 'recordContinuously'}});
    const info = await pg.evaluate(FIRE(mode));
    await new Promise(async res=>{ cdp.once('Tracing.tracingComplete', res); await cdp.send('Tracing.end'); });
    const fr = await pg.evaluate("window.__fr.slice()");
    // thread time (tdur, CPU, not wall: a busy box matters less): the renderer's main thread, and every other thread's tasks (raster, compositor, GPU)
    const main = new Set(evs.filter(e=> e.name === 'thread_name' && e.args && e.args.name === 'CrRendererMain').map(e=> e.pid + ':' + e.tid));
    const X = evs.filter(e=> e.ph === 'X' && e.name === 'RunTask'), mainMs = X.filter(e=> main.has(e.pid + ':' + e.tid)).reduce((t, e)=> t + (e.tdur || 0), 0) / 1000, allMs = X.reduce((t, e)=> t + (e.tdur || 0), 0) / 1000;
    const M = evs.filter(e=> e.ph === 'X' && main.has(e.pid + ':' + e.tid)), sum = nm=> M.filter(e=> e.name === nm).reduce((t, e)=> t + (e.tdur || 0), 0) / 1000;
    res[mode].push({taskMs: mainMs, scriptMs: allMs - mainMs, styleMs: sum('UpdateLayoutTree'), layoutMs: sum('Paint'), styles: M.filter(e=> e.name === 'UpdateLayoutTree').length, frames: fr.length, over33: fr.filter(x=> x > 33.5).length, maxGap: Math.max(0, ...fr), left: info.left, errs: errs.length});
    await ctx.close();
  }
  await b.close(); srv.close();
  const out = {}; console.log('mode   mainCPU otherCPU styleMs paintMs styles frames >33ms maxGap left   (ms of thread CPU in the 2.5 s window; medians)');
  modes.forEach(m=>{ const R = res[m], k = f=> med(R.map(f)); out[m] = {taskMs: k(x=> x.taskMs), scriptMs: k(x=> x.scriptMs), styleMs: k(x=> x.styleMs), layoutMs: k(x=> x.layoutMs), styles: k(x=> x.styles), frames: k(x=> x.frames), over33: k(x=> x.over33), maxGap: k(x=> x.maxGap), left: Math.max(...R.map(x=> x.left)), errs: R.reduce((s, x)=> s + x.errs, 0)};
    const o = out[m]; console.log(m.padEnd(6), o.taskMs.toFixed(0).padStart(6), o.scriptMs.toFixed(0).padStart(8), o.styleMs.toFixed(0).padStart(7), o.layoutMs.toFixed(0).padStart(8), String(o.styles).padStart(6), String(o.frames).padStart(6), String(o.over33).padStart(5), o.maxGap.toFixed(0).padStart(6), String(o.left).padStart(4), o.errs ? 'ERRORS ' + o.errs : ''); });
  if(opt('--json', '')) fs.writeFileSync(opt('--json'), JSON.stringify(out, null, 1));
})();
