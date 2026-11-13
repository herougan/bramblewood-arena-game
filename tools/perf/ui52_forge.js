#!/usr/bin/env node
// Package UI52 (2026-11-13): going to the Forge, A/B. Each window: from Home, `codexSubTab='forge'; switchTab('codex')`, then the time to the next
// painted frame (click -> paint, from a double rAF) and the main thread's busy time over 1.5 s (Chrome trace: RunTask total, longest task).
// Pages A and B load side by side; windows alternate A B / B A so a loaded box's noise falls on both. Medians.
//   node tools/perf/ui52_forge.js --a index-old.html --b index.html [--reps 5] [--rate 4] [--widths 1366,390] [--profile]
// --profile: one CPU profile of B's entry, the top self-time functions (the cause).
'use strict';
const fs = require('fs'), path = require('path');
const ROOT = path.join(__dirname, '..', '..');
const args = process.argv.slice(2), opt = (k, d)=>{ const i = args.indexOf(k); return i >= 0 && args[i + 1] ? args[i + 1] : d; };
function pw(){ try{ return require('playwright'); }catch(e){ return require(path.join(require('child_process').execSync('npm root -g').toString().trim(), 'playwright')); } }
const src = fs.readFileSync(path.join(ROOT, 'tests/perf2-2026-11-11.js'), 'utf8');
const lit = n=>{ const j = src.indexOf('const ' + n + ' = ') + n.length + 9, q = src[j]; let k = j + 1; while(src[k] !== q || src[k - 1] === '\\') k++; return src.slice(j, k + 1); };
const SKIP = eval(lit('SKIP')), OWN = eval(lit('OWN'));
const EXE = process.env.BW_CHROMIUM || '/opt/pw-browsers/chromium_headless_shell-1194/chrome-linux/headless_shell';
const TYPES = {'.html': 'text/html', '.js': 'text/javascript', '.json': 'application/json', '.webp': 'image/webp', '.png': 'image/png', '.svg': 'image/svg+xml', '.css': 'text/css', '.woff2': 'font/woff2'};
function serve(page){ const http = require('http'); return new Promise(res=>{ const s = http.createServer((q, r)=>{ let p = decodeURIComponent(q.url.split('?')[0]); if(p === '/') p = '/index.html';
  const f = p === '/index.html' ? page : path.join(ROOT, p); fs.readFile(f, (e, d)=>{ if(e){ r.writeHead(404); r.end(); return; } r.writeHead(200, {'content-type': TYPES[path.extname(f)] || 'application/octet-stream'}); r.end(d); }); }); s.listen(0, '127.0.0.1', ()=> res(s)); }); }
const med = a=>{ const s = a.slice().sort((x, y)=> x - y); return s.length ? s[Math.floor(s.length / 2)] : 0; };
const FIRE = `(async()=>{ const t0 = performance.now(); codexSubTab = 'forge'; switchTab('codex'); const t1 = performance.now();
  await new Promise(r=> requestAnimationFrame(()=> requestAnimationFrame(r))); return {js: t1 - t0, paint: performance.now() - t0}; })()`;
const HOME = `(async()=>{ document.querySelectorAll('.dialogue-wrap, .dlg, .modal-overlay:not([hidden]), .coach-tip, .toast').forEach(e=>{ try{ e.remove(); }catch(_){} }); switchTab('home'); await new Promise(r=> setTimeout(r, 1500)); return 1; })()`;
function busy(ev){
  const main = new Set(ev.filter(e=> e.name === 'thread_name' && e.args && e.args.name === 'CrRendererMain').map(e=> e.pid + ':' + e.tid));
  const M = ev.filter(e=> e.ph === 'X' && main.has(e.pid + ':' + e.tid)), T = M.filter(e=> e.name === 'RunTask').map(e=> (e.dur || 0) / 1000), sum = nm=> M.filter(e=> e.name === nm).reduce((s, e)=> s + (e.dur || 0), 0) / 1000;
  return {cpu: T.reduce((s, x)=> s + x, 0), maxTask: Math.max(0, ...T), style: sum('UpdateLayoutTree'), layout: sum('Layout'), pnt: sum('Paint') + sum('PrePaint')};
}
async function open(b, page, w, rate){
  const s = await serve(page), ctx = await b.newContext({viewport: {width: w, height: w < 700 ? 844 : 860}}), pg = await ctx.newPage();
  await pg.addInitScript(SKIP); await pg.goto(`http://127.0.0.1:${s.address().port}/index.html`);
  await pg.waitForFunction("typeof startConquestMatch === 'function'", null, {timeout: 180000}); await pg.waitForTimeout(1500); await pg.evaluate(OWN);
  await pg.evaluate("(()=>{ try{ const f = loadDialogueFlags(); Object.keys(DIALOGUES).forEach(k=> f['seen:' + k] = 1); localStorage.setItem(DIALOGUE_FLAGS_KEY, JSON.stringify(f)); }catch(e){} return 1; })()");
  const cdp = await ctx.newCDPSession(pg); await cdp.send('Emulation.setCPUThrottlingRate', {rate});
  return {s, ctx, pg, cdp};
}
async function measure(P){
  await P.pg.evaluate(HOME);
  const evs = [], h = d=>{ for(const e of d.value) evs.push(e); }; P.cdp.on('Tracing.dataCollected', h);
  await P.cdp.send('Tracing.start', {transferMode: 'ReportEvents', traceConfig: {includedCategories: ['__metadata', 'devtools.timeline', 'disabled-by-default-devtools.timeline'], recordMode: 'recordContinuously'}});
  const r = await P.pg.evaluate(FIRE); await P.pg.waitForTimeout(1500);
  await new Promise(async res=>{ P.cdp.once('Tracing.tracingComplete', res); await P.cdp.send('Tracing.end'); }); P.cdp.off('Tracing.dataCollected', h);
  return Object.assign(r, busy(evs));
}
(async()=>{
  const A = path.resolve(opt('--a', path.join(ROOT, 'index.html'))), B = path.resolve(opt('--b', path.join(ROOT, 'index.html'))), reps = +opt('--reps', 5), rate = +opt('--rate', 4);
  const b = await pw().chromium.launch({executablePath: fs.existsSync(EXE) ? EXE : undefined});
  for(const w of opt('--widths', '1366,390').split(',').map(Number)){
    const pa = await open(b, A, w, rate), pb = await open(b, B, w, rate), res = {a: [], b: []};
    await measure(pa); await measure(pb); // warm-up: the first visit (the flare, first-time caches) is not counted
    for(let r = 0; r < reps; r++) for(const k of (r % 2 ? ['b', 'a'] : ['a', 'b'])) res[k].push(await measure(k === 'a' ? pa : pb));
    console.log(`forge entry ${w}px, CPU ${rate}x, medians of ${reps} (interleaved)`);
    for(const k of ['a', 'b']){ const m = f=> Math.round(med(res[k].map(x=> x[f])));
      console.log(`  ${k.toUpperCase()} ${path.basename(k === 'a' ? A : B)}: switchTab ${m('js')} ms  click->paint ${m('paint')} ms  main-thread 1.5 s ${m('cpu')} ms  longest task ${m('maxTask')} ms  [style ${m('style')} layout ${m('layout')} paint ${m('pnt')}]   (paint each: ${res[k].map(x=> Math.round(x.paint)).join(',')})`); }
    if(args.includes('--profile')){
      await pb.pg.evaluate(HOME); await pb.cdp.send('Profiler.enable'); await pb.cdp.send('Profiler.setSamplingInterval', {interval: 200}); await pb.cdp.send('Profiler.start');
      await pb.pg.evaluate(FIRE); await pb.pg.waitForTimeout(800);
      const {profile} = await pb.cdp.send('Profiler.stop'), self = {}, dt = profile.timeDeltas, byId = {};
      profile.nodes.forEach(n=> byId[n.id] = n); const tot = {};
      for(let i = 0; i < profile.samples.length; i++){ const n = byId[profile.samples[i]], f = n.callFrame, k = (f.functionName || '(anon)') + ':' + (f.lineNumber + 1); self[k] = (self[k] || 0) + (dt[i] || 0) / 1000; }
      // inclusive time per function: walk parents
      const parent = {}; profile.nodes.forEach(n=> (n.children || []).forEach(c=> parent[c] = n.id));
      for(let i = 0; i < profile.samples.length; i++){ const seen = new Set(); let id = profile.samples[i]; while(id){ const f = byId[id].callFrame, k = (f.functionName || '(anon)') + ':' + (f.lineNumber + 1); if(!seen.has(k)){ seen.add(k); tot[k] = (tot[k] || 0) + (dt[i] || 0) / 1000; } id = parent[id]; } }
      console.log('  self (ms):', Object.entries(self).filter(([k])=> !/^\((idle|program|root)/.test(k)).sort((x, y)=> y[1] - x[1]).slice(0, 14).map(([k, v])=> k + ' ' + v.toFixed(0)).join(' | '));
      console.log('  total (ms):', Object.entries(tot).filter(([k])=> !/^\((idle|program|root)/.test(k)).sort((x, y)=> y[1] - x[1]).slice(0, 22).map(([k, v])=> k + ' ' + v.toFixed(0)).join(' | '));
    }
    for(const P of [pa, pb]){ await P.ctx.close(); P.s.close(); }
  }
  await b.close();
})();
