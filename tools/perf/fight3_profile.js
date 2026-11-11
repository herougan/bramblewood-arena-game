#!/usr/bin/env node
// Package PERF3 (2026-11-12): profile a seeded played fight (Auto-play, Effects High) in headless Chromium: V8 CPU profile (self time by function),
// and per round: DOM nodes, JS heap, live GSAP tweens. Usage:
//   node tools/perf/fight3_profile.js [--page index.html] [--rounds 10] [--rate 1] [--map mw --node 5-3] [--top 40] [--noprofile]
// Build first. Compare builds run back to back; read CPU / counts, not wall time.
'use strict';
const fs = require('fs'), path = require('path');
const ROOT = path.join(__dirname, '..', '..');
const args = process.argv.slice(2), opt = (k, d)=>{ const i = args.indexOf(k); return i >= 0 && args[i + 1] ? args[i + 1] : d; };
function pw(){ try{ return require('playwright'); }catch(e){ return require(path.join(require('child_process').execSync('npm root -g').toString().trim(), 'playwright')); } }
// the seeded-fight setup strings live in the PERF2 bench; read them from there
const src = fs.readFileSync(path.join(ROOT, 'tests/perf2-2026-11-11.js'), 'utf8');
const lit = n=>{ const j = src.indexOf('const ' + n + ' = ') + n.length + 9, q = src[j]; let k = j + 1; while(src[k] !== q || src[k - 1] === '\\') k++; return src.slice(j, k + 1); };
const SKIP = eval(lit('SKIP')), INSTR = eval(lit('INSTR')), OWN = eval(lit('OWN'));
const EXE = process.env.BW_CHROMIUM || '/opt/pw-browsers/chromium_headless_shell-1194/chrome-linux/headless_shell';
const TYPES = {'.html': 'text/html', '.js': 'text/javascript', '.json': 'application/json', '.webp': 'image/webp', '.png': 'image/png', '.svg': 'image/svg+xml', '.css': 'text/css'};
function serve(page){ const http = require('http'); return new Promise(res=>{ const s = http.createServer((q, r)=>{ let p = decodeURIComponent(q.url.split('?')[0]); if(p === '/') p = '/index.html';
  const f = p === '/index.html' ? page : path.join(ROOT, p); fs.readFile(f, (e, d)=>{ if(e){ r.writeHead(404); r.end(); return; } r.writeHead(200, {'content-type': TYPES[path.extname(f)] || 'application/octet-stream'}); r.end(d); }); }); s.listen(0, '127.0.0.1', ()=> res(s)); }); }
(async()=>{
  const page = path.resolve(opt('--page', path.join(ROOT, 'index.html'))), rounds = +opt('--rounds', 10), rate = +opt('--rate', 1), map = opt('--map', 'mw'), node = opt('--node', '5-3'), top = +opt('--top', 40);
  const s = await serve(page), b = await pw().chromium.launch({executablePath: fs.existsSync(EXE) ? EXE : undefined, args: ['--js-flags=--expose-gc']});
  const ctx = await b.newContext({viewport: {width: 1366, height: 768}}), pg = await ctx.newPage(), errs = []; pg.on('pageerror', e=> errs.push(String(e)));
  await pg.addInitScript(SKIP + INSTR);
  const t0 = Date.now(); await pg.goto(`http://127.0.0.1:${s.address().port}/index.html`); await pg.waitForFunction("typeof startConquestMatch === 'function'", null, {timeout: 120000});
  console.log('script-ready ms', Date.now() - t0);
  await pg.waitForTimeout(1500); await pg.evaluate(OWN);
  await pg.evaluate(`(async()=>{ adminModeEnabled = true; forcedNextSeed = 777; switchTab('play'); startConquestMatch('${map}', '${node}', {skipEnergyCost:true, noOpener:true}); await new Promise(r=> setTimeout(r, 2600)); try{ skipTriggerLesson(); }catch(e){} const h = document.getElementById('toastHost'); if(h) h.remove(); window.showToast = ()=>{}; })()`);
  const cdp = await ctx.newCDPSession(pg); await cdp.send('Emulation.setCPUThrottlingRate', {rate});
  const prof = !args.includes('--noprofile');
  if(prof){ await cdp.send('Profiler.enable'); await cdp.send('Profiler.setSamplingInterval', {interval: 500}); await cdp.send('Profiler.start'); }
  const snap = "(()=>({round: matchState && matchState.round, nodes: document.getElementsByTagName('*').length, heap: Math.round((performance.memory || {}).usedJSHeapSize / 1e6), tweens: (window.gsap ? gsap.globalTimeline.getChildren(true, true, true).length : -1)}))()";
  const r0 = await pg.evaluate('matchState.round'), rows = [await pg.evaluate(snap)];
  const res = await pg.evaluate(`(async()=>{ const m = matchState, W = ms=> new Promise(r=> setTimeout(r, ms)); m.autoplay = true; m.speedMult = 1; const T0 = performance.now(), out = [];
    let last = m.round; while(!m.over && m.round < ${r0 + rounds} && performance.now() - T0 < ${rate * 150000}){ await W(100); if(m.round !== last){ last = m.round; out.push(${snap}); } }
    for(let i = 0; i < 100 && m.resolving; i++) await W(100); m.autoplay = false; return {out, wall: Math.round(performance.now() - T0), over: m.over}; })()`);
  rows.push(...res.out);
  console.log('rounds played', res.out.length, 'wall ms', res.wall, 'over', res.over);
  console.log('per round:', rows.map(r=> `r${r.round} nodes ${r.nodes} heap ${r.heap}MB tw ${r.tweens}`).join(' | '));
  if(prof){
    const {profile} = await cdp.send('Profiler.stop'), byId = new Map(profile.nodes.map(n=> [n.id, n])), self = new Map(), dt = profile.timeDeltas; let total = 0;
    profile.samples.forEach((id, i)=>{ const d = dt[i] || 0; total += d; const cf = byId.get(id).callFrame; const k = (cf.functionName || '(anon)') + ' ' + path.basename(cf.url || '') + ':' + cf.lineNumber; self.set(k, (self.get(k) || 0) + d); });
    // who calls the native hot spots (the nearest page function above them)
    const parent = new Map(); profile.nodes.forEach(n=> (n.children || []).forEach(c=> parent.set(c, n.id)));
    const fnOf = id=>{ let p = parent.get(id); while(p){ const cf = byId.get(p).callFrame; if(cf.url && cf.functionName) return cf.functionName + ':' + cf.lineNumber; p = parent.get(p); } return '?'; };
    const callers = {}; profile.samples.forEach((id, i)=>{ const cf = byId.get(id).callFrame; if(!/^(getBoundingClientRect|querySelectorAll|querySelector|get clientWidth|Qd|getAnimations|\(garbage collector\))$/.test(cf.functionName)) return; const k = cf.functionName + ' <- ' + (cf.url ? 'self' : fnOf(id)); callers[k] = (callers[k] || 0) + (dt[i] || 0); });
    console.log('callers:'); Object.entries(callers).sort((a, c)=> c[1] - a[1]).slice(0, 16).forEach(([k, v])=> console.log(String(Math.round(v / 1000)).padStart(6), k));
    const entry = {}; profile.samples.forEach((id, i)=>{ let p = id, e = null; while(p){ const cf = byId.get(p).callFrame; if(cf.url && cf.functionName !== '(root)' && !/gsap|Qd/.test(cf.functionName)) e = cf; p = parent.get(p); } if(!e) return; const k = (e.functionName || '(anon)') + ':' + e.lineNumber; entry[k] = (entry[k] || 0) + (dt[i] || 0); });
    console.log('entry points (inclusive, outermost page function):'); Object.entries(entry).sort((a, c)=> c[1] - a[1]).slice(0, 25).forEach(([k, v])=> console.log(String(Math.round(v / 1000)).padStart(6), k));
    { // the long tasks: runs of non-idle samples over 40 ms, and what is in them (outermost page function / native)
      const tasks = []; let cur = null; profile.samples.forEach((id, i)=>{ const cf = byId.get(id).callFrame, d = dt[i] || 0;
        if(cf.functionName === '(idle)'){ if(cur) tasks.push(cur); cur = null; return; }
        if(!cur) cur = {ms: 0, by: {}}; cur.ms += d; let p = id, e = null; while(p){ const c = byId.get(p).callFrame; if(c.url && c.functionName !== '(root)' && !/gsap|Qd/.test(c.functionName)) e = c; p = parent.get(p); }
        const k = e ? (e.functionName || '(anon)') + ':' + e.lineNumber : cf.functionName; cur.by[k] = (cur.by[k] || 0) + d; });
      const long = tasks.filter(t=> t.ms > 40000).sort((a, c)=> c.ms - a.ms); console.log('long tasks (>40 ms):', long.length, 'total ms', Math.round(long.reduce((a, t)=> a + t.ms, 0) / 1000), ' of', tasks.length, 'tasks');
      const agg = {}; long.forEach(t=> Object.entries(t.by).forEach(([k, v])=> agg[k] = (agg[k] || 0) + v)); console.log('time inside long tasks by entry:', Object.entries(agg).sort((a, c)=> c[1] - a[1]).slice(0, 12).map(([k, v])=> k + ' ' + Math.round(v / 1000)).join(' | '));
      long.slice(0, 8).forEach(t=> console.log('  ', Math.round(t.ms / 1000), 'ms:', Object.entries(t.by).sort((a, c)=> c[1] - a[1]).slice(0, 5).map(([k, v])=> k + ' ' + Math.round(v / 1000)).join(' | '))); }
    for(const fn of opt('--under', '').split(',').filter(Boolean)){ // inclusive time of a function and where it goes (leaf self time)
      const leaf = {}; let incl = 0; profile.samples.forEach((id, i)=>{ let p = id, hit = false; while(p){ if(byId.get(p).callFrame.functionName === fn){ hit = true; break; } p = parent.get(p); } if(!hit) return; incl += dt[i] || 0; const cf = byId.get(id).callFrame; const k = (cf.functionName || '(anon)') + ':' + cf.lineNumber; leaf[k] = (leaf[k] || 0) + (dt[i] || 0); });
      console.log('under ' + fn + ': inclusive ms ' + Math.round(incl / 1000)); Object.entries(leaf).sort((a, c)=> c[1] - a[1]).slice(0, 10).forEach(([k, v])=> console.log('   ' + String(Math.round(v / 1000)).padStart(6), k)); }
    console.log('total sampled ms', Math.round(total / 1000)); [...self].sort((a, c)=> c[1] - a[1]).slice(0, top).forEach(([k, v])=> console.log(String(Math.round(v / 1000)).padStart(6), k));
  }
  console.log('where (elements by nearest id/class of the top-level container):', JSON.stringify(await pg.evaluate(`(()=>{ const o = {}; const key = e=>{ let n = e; while(n && n !== document.body && n.parentElement !== document.body) n = n.parentElement; return n ? (n.id || n.className || n.tagName).toString().slice(0, 40) : '?'; };
    document.querySelectorAll('body *').forEach(e=>{ const k = key(e); o[k] = (o[k] || 0) + 1; }); const big = Object.entries(o).sort((a, b)=> b[1] - a[1]).slice(0, 12);
    const tw = {}; gsap.globalTimeline.getChildren(true, true, true).forEach(t=>{ const k = t.vars && t.vars.onComplete ? 'cb' : (t.data || t.constructor.name); tw[k] = (tw[k] || 0) + 1; });
    const inner = {}; document.querySelectorAll('#appWrap *').forEach(e=>{ let n = e; while(n && !n.id) n = n.parentElement; const k = n ? '#' + n.id : '?'; inner[k] = (inner[k] || 0) + 1; });
    const cls = {}; document.querySelectorAll('#appWrap *').forEach(e=>{ const k = (e.className && e.className.baseVal === undefined ? e.className : e.tagName).toString().split(' ')[0]; cls[k] = (cls[k] || 0) + 1; });
    const tt = {}; gsap.globalTimeline.getChildren(true, true, true).forEach(t=>{ if(!t.targets) return; const g = t.targets()[0]; const k = (g && g.className && g.className.baseVal === undefined ? String(g.className).split(' ')[0] : (g && g.tagName) || typeof g) + (t.repeat() === -1 ? ' loop' : '') + (t.isActive() ? ' act' : '') + (t.progress() >= 1 ? ' done' : '') + (g && g.isConnected === false ? ' DETACHED' : ''); tt[k] = (tt[k] || 0) + 1; });
    return {tt: Object.entries(tt).sort((a, b)=> b[1] - a[1]).slice(0, 14), big, inner: Object.entries(inner).sort((a, b)=> b[1] - a[1]).slice(0, 10), cls: Object.entries(cls).sort((a, b)=> b[1] - a[1]).slice(0, 14), tw, intervals: window.__intervals || null}; })()`)));
  if(errs.length) console.log('page errors', errs.slice(0, 3));
  await b.close(); s.close();
})();
