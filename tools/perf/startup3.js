#!/usr/bin/env node
// Package PERF3 (2026-11-12): startup of the built page in headless Chromium, as a returning player (tutorial done, splash seen): main-thread CPU
// (thread time) from navigation until the Map screen is up and settled, split into script compile, script run, style, layout, paint, and the biggest
// top-level tasks / functions run during load. Medians over --runs. Compare builds back to back (--page old.html).
//   node tools/perf/startup3.js [--page index.html] [--runs 3] [--rate 1] [--top 15]
'use strict';
const fs = require('fs'), path = require('path');
const ROOT = path.join(__dirname, '..', '..');
const args = process.argv.slice(2), opt = (k, d)=>{ const i = args.indexOf(k); return i >= 0 && args[i + 1] ? args[i + 1] : d; };
function pw(){ try{ return require('playwright'); }catch(e){ return require(path.join(require('child_process').execSync('npm root -g').toString().trim(), 'playwright')); } }
const EXE = process.env.BW_CHROMIUM || '/opt/pw-browsers/chromium_headless_shell-1194/chrome-linux/headless_shell';
const TYPES = {'.html': 'text/html', '.js': 'text/javascript', '.json': 'application/json', '.webp': 'image/webp', '.png': 'image/png', '.svg': 'image/svg+xml', '.css': 'text/css'};
function serve(page){ const http = require('http'); return new Promise(res=>{ const s = http.createServer((q, r)=>{ let p = decodeURIComponent(q.url.split('?')[0]); if(p === '/') p = '/index.html';
  const f = p === '/index.html' ? page : path.join(ROOT, p); fs.readFile(f, (e, d)=>{ if(e){ r.writeHead(404); r.end(); return; } r.writeHead(200, {'content-type': TYPES[path.extname(f)] || 'application/octet-stream'}); r.end(d); }); }); s.listen(0, '127.0.0.1', ()=> res(s)); }); }
const INIT = "localStorage.setItem('bramblewood_arena_tutorial_done','1'); localStorage.setItem('bramblewood_pitch_open_v1','1'); localStorage.setItem('bramblewood_tutorial2_done_v1','1'); localStorage.setItem('bramblewood_world_open_v1','1'); localStorage.setItem('bramblewood_arena_faction','otters'); localStorage.setItem('bramblewood_map_revealed_v1','[\"*\"]'); sessionStorage.setItem('bramblewood_seen_splash','1'); localStorage.setItem('bramblewood_coach_seen', JSON.stringify(['wait','lumber','leader','handLimit','g-peek']));";
const med = a=>{ const s = a.slice().sort((x, y)=> x - y); return s.length ? s[Math.floor(s.length / 2)] : 0; };
async function once(b, url, rate){
  const ctx = await b.newContext({viewport: {width: 1366, height: 768}}), pg = await ctx.newPage(); await pg.addInitScript(INIT);
  const cdp = await ctx.newCDPSession(pg); await cdp.send('Emulation.setCPUThrottlingRate', {rate});
  const evs = []; cdp.on('Tracing.dataCollected', d=>{ for(const e of d.value) evs.push(e); });
  await cdp.send('Tracing.start', {transferMode: 'ReportEvents', traceConfig: {includedCategories: ['devtools.timeline', 'v8', 'disabled-by-default-devtools.timeline', 'blink.user_timing'], recordMode: 'recordContinuously'}});
  if(args.includes('--prof')){ await cdp.send('Profiler.enable'); await cdp.send('Profiler.setSamplingInterval', {interval: 250}); await cdp.send('Profiler.start'); }
  const t0 = Date.now(); await pg.goto(url, {waitUntil: 'commit'});
  await pg.waitForFunction("typeof startConquestMatch === 'function' && document.getElementById('appWrap')", null, {timeout: 300000, polling: 50}); const tReady = Date.now() - t0;
  await pg.waitForFunction("document.readyState === 'complete'", null, {timeout: 300000}); await pg.waitForTimeout(2500);
  if(args.includes('--prof')){ const {profile} = await cdp.send('Profiler.stop'), byId = new Map(profile.nodes.map(n=> [n.id, n])), parent = new Map(), dt = profile.timeDeltas, self = {}, incl = {};
    profile.nodes.forEach(n=> (n.children || []).forEach(c=> parent.set(c, n.id)));
    profile.samples.forEach((id, i)=>{ const cf = byId.get(id).callFrame, d = dt[i] || 0; if(cf.functionName === '(idle)') return; const k = (cf.functionName || '(anon)') + ':' + cf.lineNumber + ' ' + (cf.url || '').split('/').pop().slice(0, 24); self[k] = (self[k] || 0) + d;
      const seen = new Set(); let p = id; while(p){ const c = byId.get(p).callFrame; const kk = (c.functionName || '(anon)') + ':' + c.lineNumber + ' ' + (c.url || '').split('/').pop().slice(0, 24); if(c.url && !seen.has(kk)){ seen.add(kk); incl[kk] = (incl[kk] || 0) + d; } p = parent.get(p); } });
    const pr = (o, n)=> Object.entries(o).sort((a, c)=> c[1] - a[1]).slice(0, n).forEach(([k, v])=> console.log('   ' + String(Math.round(v / 1000)).padStart(6), k));
    console.log('  load: self time (ms):'); pr(self, +opt('--top', 15)); console.log('  load: inclusive time of page functions (ms):'); pr(incl, +opt('--top', 15)); }
  await new Promise(async res=>{ cdp.once('Tracing.tracingComplete', res); await cdp.send('Tracing.end'); });
  const main = new Set(evs.filter(e=> e.name === 'thread_name' && e.args && e.args.name === 'CrRendererMain').map(e=> e.pid + ':' + e.tid)), M = evs.filter(e=> e.ph === 'X' && main.has(e.pid + ':' + e.tid));
  const cpu = (...nm)=> Math.round(M.filter(e=> nm.includes(e.name)).reduce((s, e)=> s + (e.tdur || 0), 0) / 1000);
  const scripts = M.filter(e=> e.name === 'EvaluateScript' || e.name === 'v8.run').map(e=> ({ms: Math.round((e.tdur || 0) / 1000), url: ((e.args && e.args.data && e.args.data.url) || '').split('/').pop().slice(0, 40)})).sort((a, c)=> c.ms - a.ms);
  const tasks = M.filter(e=> e.name === 'RunTask').map(e=> (e.tdur || 0) / 1000);
  const lt = M.filter(e=> e.name === 'FunctionCall' || e.name === 'TimerFire' || e.name === 'FireAnimationFrame' || e.name === 'EventDispatch').map(e=> ({n: e.name, ms: Math.round((e.tdur || 0) / 1000), fn: e.args && e.args.data && (e.args.data.functionName || e.args.data.type) || ''})).sort((a, c)=> c.ms - a.ms).slice(0, 6);
  const r = {tReady, cpuAll: cpu('RunTask'), compile: cpu('v8.compile', 'V8.CompileCode', 'v8.compileModule'), parse: cpu('V8.ParseFunction', 'v8.parseOnBackground'), evalScript: cpu('EvaluateScript'), style: cpu('UpdateLayoutTree'), layout: cpu('Layout'), paint: cpu('Paint'), maxTask: Math.round(Math.max(...tasks)), over50: tasks.filter(x=> x > 50).length, scripts: scripts.slice(0, 6), lt};
  await ctx.close(); return r;
}
(async()=>{
  const page = path.resolve(opt('--page', path.join(ROOT, 'index.html'))), runs = +opt('--runs', 3), rate = +opt('--rate', 1);
  const s = await serve(page), b = await pw().chromium.launch({executablePath: fs.existsSync(EXE) ? EXE : undefined}), url = `http://127.0.0.1:${s.address().port}/index.html`, all = [];
  for(let i = 0; i < runs; i++) all.push(await once(b, url, rate));
  const m = k=> med(all.map(r=> r[k]));
  console.log(`${path.basename(page)} ${rate}x startup medians of ${runs}: script-ready wall ${m('tReady')} ms | main-thread CPU ${m('cpuAll')} ms: compile ${m('compile')}, EvaluateScript ${m('evalScript')}, style ${m('style')}, layout ${m('layout')}, paint ${m('paint')} | longest task ${m('maxTask')} ms, tasks >50 ms ${m('over50')}`);
  console.log('  biggest scripts (last run):', JSON.stringify(all[all.length - 1].scripts)); console.log('  biggest calls (last run):', JSON.stringify(all[all.length - 1].lt));
  await b.close(); s.close();
})();
