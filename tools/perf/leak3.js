#!/usr/bin/env node
// Package PERF3 (2026-11-12): does a long session grow? Plays N short fights (two rounds of Auto each, then endMatch and back to the Map) in one page and
// prints, after each, from Chrome's own counters: DOM nodes, event listeners, documents, JS heap after a forced GC, live GSAP tweens, body children.
// A number that climbs fight after fight is a leak. Usage: node tools/perf/leak3.js [--page index.html] [--fights 6]
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
function serve(page){ const http = require('http'); return new Promise(res=>{ const s = http.createServer((q, r)=>{ let p = decodeURIComponent(q.url.split('?')[0]); if(p === '/') p = '/index.html';
  const f = p === '/index.html' ? page : path.join(ROOT, p); fs.readFile(f, (e, d)=>{ if(e){ r.writeHead(404); r.end(); return; } r.writeHead(200, {'content-type': TYPES[path.extname(f)] || 'application/octet-stream'}); r.end(d); }); }); s.listen(0, '127.0.0.1', ()=> res(s)); }); }
(async()=>{
  const page = path.resolve(opt('--page', path.join(ROOT, 'index.html'))), fights = +opt('--fights', 6);
  const s = await serve(page), b = await pw().chromium.launch({executablePath: fs.existsSync(EXE) ? EXE : undefined}), ctx = await b.newContext({viewport: {width: 1366, height: 768}}), pg = await ctx.newPage();
  const errs = []; pg.on('pageerror', e=> errs.push(String(e))); await pg.addInitScript(SKIP);
  await pg.goto(`http://127.0.0.1:${s.address().port}/index.html`); await pg.waitForFunction("typeof startConquestMatch === 'function'", null, {timeout: 120000}); await pg.waitForTimeout(1500); await pg.evaluate(OWN);
  const cdp = await ctx.newCDPSession(pg); await cdp.send('Performance.enable');
  const read = async tag=>{ await cdp.send('HeapProfiler.collectGarbage'); const m = Object.fromEntries((await cdp.send('Performance.getMetrics')).metrics.map(x=> [x.name, x.value]));
    const tw = await pg.evaluate("gsap.globalTimeline.getChildren(true,true,true).length"), bc = await pg.evaluate("document.body.children.length");
    console.log(`${tag.padEnd(10)} nodes ${m.Nodes} listeners ${m.JSEventListeners} docs ${m.Documents} heap ${(m.JSHeapUsedSize / 1e6).toFixed(1)} MB  gsap ${tw}  body children ${bc}`); };
  await read('start');
  for(let i = 1; i <= fights; i++){
    await pg.evaluate(`(async()=>{ adminModeEnabled = true; forcedNextSeed = 777 + ${i}; switchTab('play'); startConquestMatch('mw', '5-3', {skipEnergyCost:true, noOpener:true}); await new Promise(r=> setTimeout(r, 2200)); try{ skipTriggerLesson(); }catch(e){} window.showToast = ()=>{};
      const m = matchState; m.autoplay = true; m.speedMult = 3; const r0 = m.round, T0 = performance.now(); while(!m.over && m.round < r0 + 2 && performance.now() - T0 < 60000) await new Promise(r=> setTimeout(r, 100));
      m.autoplay = false; for(let k = 0; k < 60 && m.resolving; k++) await new Promise(r=> setTimeout(r, 100)); try{ endMatch(); }catch(e){} switchTab('home'); await new Promise(r=> setTimeout(r, 800)); })()`);
    await pg.waitForTimeout(500); await read('fight ' + i);
  }
  if(errs.length) console.log('page errors', errs.slice(0, 3));
  await b.close(); s.close();
})();
