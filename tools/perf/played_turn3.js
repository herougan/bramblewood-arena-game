#!/usr/bin/env node
// Package PERF3 (2026-11-12): a HUMAN-paced fight in headless Chromium: each round plays a card the way a click does (playCardByUid), waits as a player
// would, then ends the turn (afterPlayerAction), and the round resolves. A Chrome trace is kept per phase ("play" = the card going in and landing, 1.5 s;
// "resolve" = End turn until the next round starts), giving main-thread CPU (thread time, so a busy box matters less), style / layout / paint, passes,
// elements restyled, long tasks (>50 ms) and frames (rAF gaps) in each. Seeded (Math.random + match seed). Medians over the rounds; --runs repeats.
//   node tools/perf/played_turn3.js [--page index.html] [--rounds 6] [--rates 1,4] [--runs 1] [--json out.json]
// Compare builds back to back (--page old.html). Build first.
'use strict';
const fs = require('fs'), path = require('path');
const ROOT = path.join(__dirname, '..', '..');
const args = process.argv.slice(2), opt = (k, d)=>{ const i = args.indexOf(k); return i >= 0 && args[i + 1] ? args[i + 1] : d; };
function pw(){ try{ return require('playwright'); }catch(e){ return require(path.join(require('child_process').execSync('npm root -g').toString().trim(), 'playwright')); } }
const src = fs.readFileSync(path.join(ROOT, 'tests/perf2-2026-11-11.js'), 'utf8');
const lit = n=>{ const j = src.indexOf('const ' + n + ' = ') + n.length + 9, q = src[j]; let k = j + 1; while(src[k] !== q || src[k - 1] === '\\') k++; return src.slice(j, k + 1); };
const SKIP = eval(lit('SKIP')), INSTR = eval(lit('INSTR')), OWN = eval(lit('OWN'));
const EXE = process.env.BW_CHROMIUM || '/opt/pw-browsers/chromium_headless_shell-1194/chrome-linux/headless_shell';
const TYPES = {'.html': 'text/html', '.js': 'text/javascript', '.json': 'application/json', '.webp': 'image/webp', '.png': 'image/png', '.svg': 'image/svg+xml', '.css': 'text/css'};
function serve(page){ const http = require('http'); return new Promise(res=>{ const s = http.createServer((q, r)=>{ let p = decodeURIComponent(q.url.split('?')[0]); if(p === '/') p = '/index.html';
  const f = p === '/index.html' ? page : path.join(ROOT, p); fs.readFile(f, (e, d)=>{ if(e){ r.writeHead(404); r.end(); return; } r.writeHead(200, {'content-type': TYPES[path.extname(f)] || 'application/octet-stream'}); r.end(d); }); }); s.listen(0, '127.0.0.1', ()=> res(s)); }); }
const EVT = []; const STK = {}; const GS = 51379 + 1;
function stacks(ev){ // forced style / layout passes: who asked (top page frame of the JS stack on the trace event), by cost
  ev.filter(e=> e.ph === 'X' && (e.name === 'UpdateLayoutTree' || e.name === 'Layout') && e.args).forEach(e=>{ const st = (e.args.beginData && e.args.beginData.stackTrace) || (e.args.data && e.args.data.stackTrace) || []; const fr = st.filter(x=> x.url && (!args.includes('--nogsap') || !/index\.html$/.test(x.url) || x.lineNumber !== GS)).slice(0, +opt('--depth', 1)); const k = e.name[0] + ' ' + (fr.length ? fr.map(f=> (f.functionName || '(anon)') + ':' + f.lineNumber).join(' < ') : '(no JS: normal frame)'); const r = STK[k] || (STK[k] = {n: 0, ms: 0}); r.n++; r.ms += (e.tdur || 0) / 1000; }); }
const SEL = {};
function selstats(ev){ ev.filter(e=> e.name === 'SelectorStats').forEach(e=>{ ((e.args && e.args.selector_stats && e.args.selector_stats.selector_timings) || []).forEach(t=>{ const r = SEL[t['selector']] || (SEL[t['selector']] = {ns: 0, match: 0, fast: 0, n: 0}); r.ns += t['elapsed (us)'] * 1000 || 0; r.match += t['match_count'] || 0; r.fast += t['fast_reject_count'] || 0; r.n += t['match_attempts'] || 0; }); }); }
function work(ev){ if(args.includes('--selectors')) selstats(ev); if(args.includes('--stacks')) stacks(ev);
  const main = new Set(ev.filter(e=> e.name === 'thread_name' && e.args && e.args.name === 'CrRendererMain').map(e=> e.pid + ':' + e.tid));
  const M = ev.filter(e=> e.ph === 'X' && main.has(e.pid + ':' + e.tid)), cpu = nm=> Math.round(M.filter(e=> e.name === nm).reduce((s, e)=> s + (e.tdur || 0), 0) / 1000);
  const ult = M.filter(e=> e.name === 'UpdateLayoutTree'), tasks = M.filter(e=> e.name === 'RunTask').map(e=> (e.tdur || 0) / 1000);
  if(args.includes('--events')){ const names = {}; M.forEach(e=>{ if(e.name !== 'RunTask') names[e.name] = (names[e.name] || 0) + (e.tdur || 0) / 1000; }); EVT.push(names); } // PERF4: inclusive ms by trace event name, summed over traces
  return {cpu: cpu('RunTask'), style: cpu('UpdateLayoutTree'), styleN: ult.length, els: ult.reduce((s, e)=> s + ((e.args && e.args.elementCount) || 0), 0), layout: cpu('Layout'), paint: cpu('Paint'), maxTask: Math.round(Math.max(0, ...tasks)), over50: tasks.filter(x=> x > 50).length};
}
const med = a=>{ const s = a.slice().sort((x, y)=> x - y); return s.length ? s[Math.floor(s.length / 2)] : 0; };
async function once(b, url, rate, rounds){
  const ctx = await b.newContext({viewport: {width: 1366, height: 768}}), pg = await ctx.newPage(), errs = []; pg.on('pageerror', e=> errs.push(String(e)));
  await pg.addInitScript(SKIP + INSTR); await pg.goto(url); await pg.waitForFunction("typeof startConquestMatch === 'function'", null, {timeout: 120000}); await pg.waitForTimeout(1500);
  await pg.evaluate(OWN);
  await pg.evaluate(`(async()=>{ adminModeEnabled = true; forcedNextSeed = 777; switchTab('play'); startConquestMatch('mw', '5-3', {skipEnergyCost:true, noOpener:true}); await new Promise(r=> setTimeout(r, 2600)); try{ skipTriggerLesson(); }catch(e){} const h = document.getElementById('toastHost'); if(h) h.remove(); window.showToast = ()=>{}; })()`);
  const cdp = await ctx.newCDPSession(pg); await cdp.send('Emulation.setCPUThrottlingRate', {rate});
  if(args.includes('--selectors')) await pg.evaluate(()=>0);
  const trace = async js=>{ const evs = [], on = d=>{ for(const e of d.value) evs.push(e); }; cdp.on('Tracing.dataCollected', on);
    await cdp.send('Tracing.start', {transferMode: 'ReportEvents', traceConfig: {includedCategories: ['devtools.timeline', 'disabled-by-default-devtools.timeline'].concat(args.includes('--stacks') ? ['disabled-by-default-devtools.timeline.stack'] : []).concat(args.includes('--selectors') ? ['disabled-by-default-blink.debug'] : []), recordMode: 'recordContinuously'}});
    const info = await pg.evaluate(js);
    await new Promise(async res=>{ cdp.once('Tracing.tracingComplete', res); await cdp.send('Tracing.end'); }); cdp.off('Tracing.dataCollected', on);
    const P = await pg.evaluate("(()=>{ const f = window.__perf.frames.slice(); window.__perf.frames.length = 0; window.__perf.lt.length = 0; return f; })()");
    return Object.assign({frames: P.length, fOver33: P.filter(x=> x > 33.5).length, fMax: Math.round(Math.max(0, ...P))}, info, work(evs)); };
  if(args.includes('--prof')){ await cdp.send('Profiler.enable'); await cdp.send('Profiler.setSamplingInterval', {interval: 500}); await cdp.send('Profiler.start'); }
  const idle = await trace(`(async()=>{ window.__perf.on = true; await new Promise(r=> setTimeout(r, 3000)); window.__perf.on = false; return {}; })()`);
  const play = [], resolve = [];
  for(let r = 0; r < rounds; r++){
    const p = await trace(`(async()=>{ const m = matchState, P = window.__perf, W = ms=> new Promise(r=> setTimeout(r, ms)); P.on = true; await W(600); // the player reads the board
      const pl = m.players[1]; const c = pl.hand.find(h=> m.engine.canPlay(pl, h.defId, h.uid)); let played = false;
      if(c){ await playCardByUid(c.uid, 'left'); played = true; } await W(1500); P.on = false; return {played}; })()`);
    const q = await trace(`(async()=>{ const m = matchState, P = window.__perf, W = ms=> new Promise(r=> setTimeout(r, ms)); P.on = true; const r0 = m.round, T0 = performance.now();
      afterPlayerAction(1); while(m.round === r0 && !m.over && performance.now() - T0 < ${rate * 60000}) await W(50); for(let i = 0; i < 100 && m.resolving; i++) await W(50); P.on = false; return {wall: Math.round(performance.now() - T0), over: m.over}; })()`);
    play.push(p); resolve.push(q); if(q.over) break;
  }
  if(args.includes('--prof')){ const {profile} = await cdp.send('Profiler.stop'), byId = new Map(profile.nodes.map(n=> [n.id, n])), parent = new Map(), dt = profile.timeDeltas, self = {}, entry = {};
    profile.nodes.forEach(n=> (n.children || []).forEach(c=> parent.set(c, n.id)));
    profile.samples.forEach((id, i)=>{ const cf = byId.get(id).callFrame, d = dt[i] || 0; if(cf.functionName === '(idle)') return; const k = (cf.functionName || '(anon)') + ':' + cf.lineNumber + (cf.url ? '' : ' [native]'); self[k] = (self[k] || 0) + d;
      let p = id, e = null; while(p){ const c = byId.get(p).callFrame; if(c.url && c.functionName !== '(root)' && !/^(Al|Qd)$/.test(c.functionName)) e = c; p = parent.get(p); } const ek = e ? (e.functionName || '(anon)') + ':' + e.lineNumber : '(native/GSAP only)'; entry[ek] = (entry[ek] || 0) + d; });
    { const tasks = []; let cur = null; profile.samples.forEach((id, i)=>{ const cf = byId.get(id).callFrame, d = dt[i] || 0; if(cf.functionName === '(idle)'){ if(cur) tasks.push(cur); cur = null; return; }
        if(!cur) cur = {ms: 0, by: {}}; cur.ms += d; let p = id, e = null; while(p){ const c = byId.get(p).callFrame; if(c.url && c.functionName !== '(root)' && !/^(Al|Qd)$/.test(c.functionName)) e = c; p = parent.get(p); }
        const k = e ? (e.functionName || '(anon)') + ':' + e.lineNumber : cf.functionName; cur.by[k] = (cur.by[k] || 0) + d; });
      const long = tasks.filter(t=> t.ms > 50000).sort((a, c)=> c.ms - a.ms); console.log('  long tasks (>50 ms, profiler on): ' + long.length + ' of ' + tasks.length + '; worst:'); long.slice(0, 10).forEach(t=> console.log('   ' + Math.round(t.ms / 1000) + ' ms: ' + Object.entries(t.by).sort((a, c)=> c[1] - a[1]).slice(0, 4).map(([k, v])=> k + ' ' + Math.round(v / 1000)).join(' | '))); }
    { const incl = {}; profile.samples.forEach((id, i)=>{ const d = dt[i] || 0, seen = new Set(); let p = id; while(p){ const c = byId.get(p).callFrame; if(c.url && c.functionName){ const k = c.functionName + ':' + c.lineNumber; if(!seen.has(k)){ seen.add(k); incl[k] = (incl[k] || 0) + d; } } p = parent.get(p); } }); // PERF4: inclusive time by page function
      if(args.includes('--incl')){ console.log('  inclusive time by function (ms):'); Object.entries(incl).sort((x, y)=> y[1] - x[1]).slice(0, +opt('--top', 22)).forEach(([k, v])=> console.log('   ' + String(Math.round(v / 1000)).padStart(6), k)); } }
    if(opt('--under', null)){ const U = opt('--under'), kids = {}; profile.samples.forEach((id, i)=>{ const d = dt[i] || 0, chain = []; let p = id; while(p){ chain.push(byId.get(p).callFrame); p = parent.get(p); } chain.reverse(); const j = chain.findIndex(c=> c.functionName === U); if(j < 0) return;
        const c = chain[j + 1]; const k = c ? (c.functionName || '(anon)') + ':' + c.lineNumber : '(self)'; kids[k] = (kids[k] || 0) + d; }); // PERF4: time directly under one function
      console.log('  time directly under ' + U + ' (ms):'); Object.entries(kids).sort((x, y)=> y[1] - x[1]).slice(0, 25).forEach(([k, v])=> console.log('   ' + String(Math.round(v / 1000)).padStart(6), k)); }
    const pr = (o, n)=> Object.entries(o).sort((a, c)=> c[1] - a[1]).slice(0, n).forEach(([k, v])=> console.log('   ' + String(Math.round(v / 1000)).padStart(6), k));
    console.log('  busy self time by function (ms):'); pr(self, +opt('--top', 22)); console.log('  busy time by outermost page function:'); pr(entry, 16); }
  await ctx.close(); return {rate, idle, play, resolve, errs};
}
(async()=>{
  const page = path.resolve(opt('--page', path.join(ROOT, 'index.html'))), rounds = +opt('--rounds', 6), rates = opt('--rates', '1,4').split(',').map(Number), runs = +opt('--runs', 1);
  const s = await serve(page), url = `http://127.0.0.1:${s.address().port}/index.html`, b = await pw().chromium.launch({executablePath: fs.existsSync(EXE) ? EXE : undefined}), all = [];
  for(let k = 0; k < runs; k++) for(const rate of rates){ const res = await once(b, url, rate, rounds); all.push(res);
    console.log(`  ${path.basename(page)} ${rate}x idle 3 s: cpu ${res.idle.cpu} ms (style ${res.idle.style}/${res.idle.styleN} passes/${res.idle.els} els, layout ${res.idle.layout}, paint ${res.idle.paint}) frames ${res.idle.frames}`);
    for(const ph of ['play', 'resolve']){ const a = res[ph], m = f=> med(a.map(x=> x[f]));
      console.log(`  ${path.basename(page)} ${rate}x ${ph.padEnd(7)} n=${a.length} median/round: cpu ${m('cpu')} ms (style ${m('style')}/${m('styleN')} passes/${m('els')} els, layout ${m('layout')}, paint ${m('paint')})  longest task ${m('maxTask')}  tasks>50ms ${a.reduce((x, y)=> x + y.over50, 0)}  frames ${m('frames')} >33ms ${a.reduce((x, y)=> x + y.fOver33, 0)} worst ${Math.max(...a.map(x=> x.fMax))}${ph === 'resolve' ? '  wall ' + m('wall') : ''}`); }
    if(res.errs.length) console.log('  page errors', res.errs.slice(0, 2)); }
  if(args.includes('--events')){ const t = {}; EVT.forEach(n=> Object.entries(n).forEach(([k, v])=> t[k] = (t[k] || 0) + v)); console.log('trace events on the main thread (inclusive ms, all phases):'); Object.entries(t).sort((x, y)=> y[1] - x[1]).slice(0, 25).forEach(([k, v])=> console.log('  ' + String(Math.round(v)).padStart(7), k)); }
  if(args.includes('--stacks')){ console.log('style (U) / layout (L) passes by the JS that caused them (ms, count):'); Object.entries(STK).sort((a, c)=> c[1].ms - a[1].ms).slice(0, 25).forEach(([k, v])=> console.log('  ' + String(Math.round(v.ms)).padStart(6), String(v.n).padStart(5), k)); }
  if(args.includes('--selectors')){ console.log('slowest selectors (us, attempts, matches):'); Object.entries(SEL).sort((a, c)=> c[1].ns - a[1].ns).slice(0, +opt('--top', 25)).forEach(([k, v])=> console.log('  ' + String(Math.round(v.ns / 1000)).padStart(7), String(v.n).padStart(7), String(v.match).padStart(6), k.slice(0, +opt('--w', 150)))); }
  if(opt('--json', null)) fs.writeFileSync(opt('--json'), JSON.stringify(all, null, 1));
  await b.close(); s.close();
})();
