#!/usr/bin/env node
// Package PERF5 (2026-11-13, owner 23:47 #10 "Bolt effects are still laggy", #12 "Unit death and unit damage number and bramble damage number
// (onhits) have a small frame drop"): what one effect costs in a live fight. The seeded fight of played_turn3.js (map 5-3, seed 777, a card
// played), then one Chrome trace per window (--win ms, 2000) with one effect fired at its start, through the game's own code
// (renderVfxForEvent / eng23AimedBolt / SkillFX). Modes rotate each run and a `none` window sits between two effects, so a loaded box's noise
// falls on every mode alike. Read per window: main-thread CPU (thread time), style (passes), layout (count; forced = called from JS), paint,
// the longest task, tasks over 16.7 ms (a dropped 60 fps frame) and over 50 ms. Medians over --runs.
//   node tools/perf/fx5_probe.js [--page index.html] [--ab before.html] [--runs 5] [--rate 1] [--modes aimed,glob,...] [--stacks] [--firestacks] [--prof] [--fireprof] [--fx high]
// --stacks: forced style / layout by the JS that asked (summed over runs, per mode). --prof: V8 self time by function per mode.
'use strict';
const fs = require('fs'), path = require('path');
const ROOT = path.join(__dirname, '..', '..');
const args = process.argv.slice(2), opt = (k, d)=>{ const i = args.indexOf(k); return i >= 0 && args[i + 1] ? args[i + 1] : d; };
function pw(){ try{ return require('playwright'); }catch(e){ return require(path.join(require('child_process').execSync('npm root -g').toString().trim(), 'playwright')); } }
const src = fs.readFileSync(path.join(ROOT, 'tests/perf2-2026-11-11.js'), 'utf8');
const lit = n=>{ const j = src.indexOf('const ' + n + ' = ') + n.length + 9, q = src[j]; let k = j + 1; while(src[k] !== q || src[k - 1] === '\\') k++; return src.slice(j, k + 1); };
const SKIP = eval(lit('SKIP')).replace("'bramblewood_fx_level','high'", "'bramblewood_fx_level','" + opt('--fx', 'high') + "'"), OWN = eval(lit('OWN'));
const EXE = process.env.BW_CHROMIUM || '/opt/pw-browsers/chromium_headless_shell-1194/chrome-linux/headless_shell';
const TYPES = {'.html': 'text/html', '.js': 'text/javascript', '.json': 'application/json', '.webp': 'image/webp', '.png': 'image/png', '.svg': 'image/svg+xml', '.css': 'text/css', '.woff2': 'font/woff2'};
function serve(page){ const http = require('http'); return new Promise(res=>{ const s = http.createServer((q, r)=>{ let p = decodeURIComponent(q.url.split('?')[0]); if(p === '/') p = '/index.html';
  const f = p === '/index.html' ? page : path.join(ROOT, p); fs.readFile(f, (e, d)=>{ if(e){ r.writeHead(404); r.end(); return; } r.writeHead(200, {'content-type': TYPES[path.extname(f)] || 'application/octet-stream'}); r.end(d); }); }); s.listen(0, '127.0.0.1', ()=> res(s)); }); }
// Each mode: JS run at the window's start. In scope: E / M (an enemy / my board card), eu / mu (their uids), ed / md (defIds), W(ms).
const MODES = {
  none: ``,
  // the Aimed Bolt as the game plays it: the engine's action, then its events through pushLog + renderVfxForEvent (eng23AimedBolt)
  aimed: `{ const pl = matchState.players[1]; pl.aimedBolt = 3; pl.aimedBoltUsed = false; const slot = (matchState.players[2].row ? Object.values(matchState.players[2].row).flat() : []).find(c=> String(c.uid) === String(eu)); await eng23AimedBolt(slot ? slot.slot : 0); }`,
  // a Bolt skill (the glob) and the ranged hit that follows it at windup + projectile (the replay's order)
  glob: `{ const am = animMs(); renderVfxForEvent({type:'bolt', element:'fire', side:'A', defId:md, uid:mu, targetSide:'B', targetUid:eu, targetDefId:ed, amount:2});
    renderVfxForEvent({type:'hit', side:'A', attDefId:md, attUid:mu, targetSide:'B', targetDefId:ed, targetUid:eu, mods:[], dmg:2, dmgType:'heat', ranged:true}); }`,
  shock: `{ renderVfxForEvent({type:'hit', side:'A', attDefId:md, attUid:mu, targetSide:'B', targetDefId:ed, targetUid:eu, mods:[], dmg:2, dmgType:'shock', ranged:true}); }`,
  arrow: `{ renderVfxForEvent({type:'arrow', fire:false, side:'A', defId:md, uid:mu, targetSide:'B', targetUid:eu, targetDefId:ed, amount:2});
    renderVfxForEvent({type:'hit', side:'A', attDefId:md, attUid:mu, targetSide:'B', targetDefId:ed, targetUid:eu, mods:[], dmg:2, dmgType:'physical', ranged:true}); }`,
  proj: `{ spawnProjectile(M, E, '🏹'); }`,
  hit: `{ renderVfxForEvent({type:'hit', side:'A', attDefId:md, attUid:mu, targetSide:'B', targetDefId:ed, targetUid:eu, mods:[], dmg:3, dmgType:'physical'}); }`,
  dmgnum: `{ flashDmg(eu, 3, false, 'physical', false, [], md); }`,
  hq: `{ renderVfxForEvent({type:'hitHQ', side:'A', attDefId:md, attUid:mu, targetSide:'B', mods:[], dmg:3, dmgType:'physical'}); }`,
  hqnum: `{ dnFloat(hqRibbonFloatAnchor('B') || hqTileEl('B'), 3, {type:'physical', addCls:'hq-big', fit:false}); }`,
  death: `{ renderVfxForEvent({type:'death', side:'B', defId:ed, uid:eu}); }`,
};
const med = a=>{ const s = a.slice().sort((x, y)=> x - y); return s.length ? s[Math.floor(s.length / 2)] : 0; };
const STK = {}, PROF = {}, FIRE = {}; let GSL = -9; // GSAP's (minified) line in the page: its frames are skipped in --stacks, so the caller shows
function fireTree(mode, prof){ // inclusive time by function (page functions and natives) inside the fire, summed over runs
  const byId = new Map(prof.nodes.map(n=> [n.id, n])), parent = new Map(); prof.nodes.forEach(n=> (n.children || []).forEach(c=> parent.set(c, n.id)));
  const F = FIRE[mode] || (FIRE[mode] = {incl: {}, self: {}, total: 0});
  prof.samples.forEach((id, i)=>{ const d = (prof.timeDeltas[i] || 0) / 1000, cf0 = byId.get(id).callFrame; if(/^\((idle|program)\)$/.test(cf0.functionName)) return; F.total += d;
    const k0 = (cf0.functionName || '(anon)') + ':' + cf0.lineNumber + (cf0.url ? '' : ' [n]'); F.self[k0] = (F.self[k0] || 0) + d;
    const seen = new Set(); let p = id; while(p){ const cf = byId.get(p).callFrame; if(cf.functionName && cf.functionName !== '(root)'){ const k = cf.functionName + ':' + cf.lineNumber + (cf.url ? '' : ' [n]'); if(!seen.has(k)){ seen.add(k); F.incl[k] = (F.incl[k] || 0) + d; } } p = parent.get(p); } }); }
function work(ev, mode){
  const main = new Set(ev.filter(e=> e.name === 'thread_name' && e.args && e.args.name === 'CrRendererMain').map(e=> e.pid + ':' + e.tid));
  const M = ev.filter(e=> e.ph === 'X' && main.has(e.pid + ':' + e.tid)), sum = nm=> M.filter(e=> e.name === nm).reduce((s, e)=> s + (e.tdur || 0), 0) / 1000;
  const tasks = M.filter(e=> e.name === 'RunTask').map(e=> (e.tdur || 0) / 1000);
  const stackOf = e=> (e.args && ((e.args.beginData && e.args.beginData.stackTrace) || (e.args.data && e.args.data.stackTrace))) || [];
  const LY = M.filter(e=> e.name === 'Layout'), UL = M.filter(e=> e.name === 'UpdateLayoutTree');
  const forced = LY.filter(e=> stackOf(e).length).length + UL.filter(e=> stackOf(e).length).length;
  const ts = nm=>{ const t = ev.find(e=> e.name === 'TimeStamp' && e.args && e.args.data && e.args.data.message === nm); return t ? t.ts : null; }, f0 = ts('fx5-fire-0'), f1 = ts('fx5-fire-1');
  const inFire = e=> !args.includes('--firestacks') || (f0 != null && f1 != null && e.ts >= f0 && e.ts <= f1); // PERF5: --firestacks keeps only the passes inside the synchronous fire
  if(args.includes('--stacks') || args.includes('--firestacks')){ const S = STK[mode] || (STK[mode] = {}); LY.concat(UL).filter(inFire).forEach(e=>{ const st = stackOf(e).filter(x=> x.url && Math.abs(x.lineNumber - GSL) > 1).slice(0, +opt('--depth', 2)); const k = e.name[0] + ' ' + (st.length ? st.map(f=> (f.functionName || '(anon)') + ':' + f.lineNumber).join(' < ') : '(frame)'); const r = S[k] || (S[k] = {n: 0, ms: 0}); r.n++; r.ms += (e.tdur || 0) / 1000; }); }
  return {cpu: sum('RunTask'), style: sum('UpdateLayoutTree'), styleN: UL.length, layout: sum('Layout'), layoutN: LY.length, forced, paint: sum('Paint'), maxTask: Math.max(0, ...tasks), over16: tasks.filter(x=> x > 16.7).length, over50: tasks.filter(x=> x > 50).length};
}
async function run(b, url, rate, order, win){
  const ctx = await b.newContext({viewport: {width: 1366, height: 768}}), pg = await ctx.newPage(), errs = []; pg.on('pageerror', e=> errs.push(String(e)));
  await pg.addInitScript(SKIP + `window.__fr = []; (()=>{ let l = 0; const f = t=>{ if(l) window.__fr.push(t - l); l = t; requestAnimationFrame(f); }; requestAnimationFrame(f); })();`);
  await pg.goto(url); await pg.waitForFunction("typeof startConquestMatch === 'function'", null, {timeout: 180000}); await pg.waitForTimeout(1500); await pg.evaluate(OWN);
  await pg.evaluate(`(async()=>{ adminModeEnabled = true; forcedNextSeed = 777; switchTab('play'); startConquestMatch('mw', '5-3', {skipEnergyCost:true, noOpener:true}); await new Promise(r=> setTimeout(r, 2600)); try{ skipTriggerLesson(); }catch(e){} const h = document.getElementById('toastHost'); if(h) h.remove(); window.showToast = ()=>{};
    const m = matchState, pl = m.players[1], c = pl.hand.find(h=> m.engine.canPlay(pl, h.defId, h.uid)); if(c) await playCardByUid(c.uid, 'left'); await new Promise(r=> setTimeout(r, 2500)); })()`);
  const cdp = await ctx.newCDPSession(pg); await cdp.send('Emulation.setCPUThrottlingRate', {rate});
  if(args.includes('--prof') || args.includes('--fireprof')){ await cdp.send('Profiler.enable'); await cdp.send('Profiler.setSamplingInterval', {interval: args.includes('--fireprof') ? 100 : 250}); }
  const out = {};
  for(const mode of order){
    const evs = [], on = d=>{ for(const e of d.value) evs.push(e); }; cdp.on('Tracing.dataCollected', on);
    await pg.evaluate("window.__fr.length = 0");
    await cdp.send('Tracing.start', {transferMode: 'ReportEvents', traceConfig: {includedCategories: ['devtools.timeline', 'disabled-by-default-devtools.timeline', 'disabled-by-default-devtools.timeline.stack'], recordMode: 'recordContinuously'}});
    const fp = args.includes('--fireprof'); // PERF5: profile only the synchronous fire (what lands in the frame the effect starts in)
    if(args.includes('--prof') || fp) await cdp.send('Profiler.start');
    const fire = `(async()=>{ const W = ms=> new Promise(r=> setTimeout(r, ms)); const E = document.querySelector('#rowEnemy .board-card[data-uid]'), M = document.querySelector('#rowMine .board-card[data-uid]');
      const eu = E && E.dataset.uid, mu = M && M.dataset.uid, rc = matchState.replayCards || {}, def = u=>{ const c = (rc[u] || null) || (typeof currentCardByUid === 'function' ? currentCardByUid(u) : null); return c && c.defId; };
      const ed = def(eu), md = def(mu); let err = null; console.timeStamp('fx5-fire-0'); const t0 = performance.now();
      try{ ${'${JS}'} }catch(e){ err = String(e); } const fireMs = performance.now() - t0; console.timeStamp('fx5-fire-1'); ${fp ? '' : 'await W(' + win + ');'} return {err, fireMs, E: !!E, M: !!M}; })()`.replace('${JS}', MODES[mode]);
    const info = await pg.evaluate(fire);
    let prof = null; if(args.includes('--prof') || fp) prof = (await cdp.send('Profiler.stop')).profile;
    if(fp){ await pg.waitForTimeout(win); if(prof) fireTree(mode, prof); prof = null; }
    await new Promise(async res=>{ cdp.once('Tracing.tracingComplete', res); await cdp.send('Tracing.end'); }); cdp.off('Tracing.dataCollected', on);
    const fr = await pg.evaluate("window.__fr.slice()");
    if(info.err) errs.push(mode + ': ' + info.err);
    if(prof){ const P = PROF[mode] || (PROF[mode] = {}), byId = new Map(prof.nodes.map(n=> [n.id, n])); prof.samples.forEach((id, i)=>{ const cf = byId.get(id).callFrame; if(cf.functionName === '(idle)' || cf.functionName === '(program)') return; const k = (cf.functionName || '(anon)') + ':' + cf.lineNumber + (cf.url ? '' : ' [n]'); P[k] = (P[k] || 0) + (prof.timeDeltas[i] || 0) / 1000; }); }
    (out[mode] || (out[mode] = [])).push(Object.assign(work(evs, mode), {fireMs: info.fireMs, frames: fr.length, f33: fr.filter(x=> x > 33.5).length, fMax: Math.max(0, ...fr)}));
  }
  await ctx.close(); return {out, errs};
}
(async()=>{
  const page = path.resolve(opt('--page', path.join(ROOT, 'index.html'))), runs = +opt('--runs', 5), rate = +opt('--rate', 1), win = +opt('--win', 2000);
  const modes = opt('--modes', 'aimed,glob,shock,arrow,proj,hit,dmgnum,hq,hqnum,death').split(',').filter(m=> MODES[m] != null && m !== 'none');
  { const L = fs.readFileSync(page, 'utf8').split('\n'); GSL = L.findIndex(l=> l.startsWith('!function(t,e){') && l.includes('gsap')) + 1; }
  // --ab other.html: the same runs on a second build, alternated run by run (other first on odd runs), so both see the same load
  const pages = [page].concat(opt('--ab', null) ? [path.resolve(opt('--ab'))] : []), srv = await Promise.all(pages.map(serve)), urls = srv.map(x=> `http://127.0.0.1:${x.address().port}/index.html`);
  const b = await pw().chromium.launch({executablePath: fs.existsSync(EXE) ? EXE : undefined, args: ['--enable-unsafe-swiftshader', '--use-angle=swiftshader', '--ignore-gpu-blocklist']});
  const all = pages.map(()=> ({})), errs = [];
  for(let r = 0; r < runs; r++){
    const rot = modes.filter(m=> m !== 'death'); for(let k = 0; k < r % Math.max(1, rot.length); k++) rot.push(rot.shift());
    const order = []; rot.forEach(m=> order.push('none', m)); if(modes.includes('death')) order.push('none', 'death');
    const pi = pages.map((_, i)=> i); if(r % 2) pi.reverse();
    for(const i of pi){ const res = await run(b, urls[i], rate, order, win); errs.push(...res.errs.map(e=> path.basename(pages[i]) + ' ' + e)); Object.entries(res.out).forEach(([m, a])=> (all[i][m] || (all[i][m] = [])).push(...a)); }
    process.stderr.write(`run ${r + 1}/${runs} done\n`);
  }
  await b.close(); srv.forEach(x=> x.close());
  pages.forEach((pg, i)=>{
    console.log(`${path.basename(pg)} ${rate}x, ${win} ms windows, medians of ${runs} (none: every 'none' window)`);
    console.log('mode     mainCPU  style/n    layout/n  forced  paint  maxTask  >16.7  >50  frames >33ms  fire');
    ['none'].concat(modes).forEach(m=>{ const a = all[i][m] || []; if(!a.length) return; const k = f=> med(a.map(x=> x[f]));
      console.log(m.padEnd(8), String(Math.round(k('cpu'))).padStart(7), (Math.round(k('style')) + '/' + k('styleN')).padStart(9), (Math.round(k('layout')) + '/' + k('layoutN')).padStart(10), String(k('forced')).padStart(7), String(Math.round(k('paint'))).padStart(6), String(Math.round(k('maxTask'))).padStart(8), String(k('over16')).padStart(6), String(k('over50')).padStart(4), String(k('frames')).padStart(7), String(k('f33')).padStart(5), k('fireMs').toFixed(1).padStart(6)); }); });
  if(args.includes('--stacks') || args.includes('--firestacks')) Object.entries(STK).forEach(([m, S])=>{ if(m === 'none') return; console.log(`-- ${m}: style (U) / layout (L) passes by caller, ms and count over all runs`); Object.entries(S).sort((a, c)=> c[1].ms - a[1].ms).slice(0, +opt('--top', 10)).forEach(([k, v])=> console.log('  ' + v.ms.toFixed(1).padStart(7), String(v.n).padStart(5), k)); });
  if(args.includes('--prof')) Object.entries(PROF).forEach(([m, P])=>{ console.log(`-- ${m}: self time by function (ms over all runs)`); Object.entries(P).sort((a, c)=> c[1] - a[1]).slice(0, +opt('--top', 12)).forEach(([k, v])=> console.log('  ' + v.toFixed(1).padStart(7), k)); });
  if(args.includes('--fireprof')) Object.entries(FIRE).forEach(([m, F])=>{ if(m === 'none') return; console.log(`-- ${m}: the synchronous fire, ${F.total.toFixed(1)} ms sampled over ${runs} runs; inclusive / self by function`);
    Object.entries(F.incl).sort((a, c)=> c[1] - a[1]).slice(0, +opt('--top', 14)).forEach(([k, v])=> console.log('  ' + v.toFixed(1).padStart(7), k));
    console.log('   self:', Object.entries(F.self).sort((a, c)=> c[1] - a[1]).slice(0, 8).map(([k, v])=> k + ' ' + v.toFixed(1)).join(' | ')); });
  if(errs.length) console.log('errors:', [...new Set(errs)].slice(0, 6));
  if(opt('--json', null)) fs.writeFileSync(opt('--json'), JSON.stringify(pages.map((p, i)=> ({page: path.basename(p), modes: all[i]})), null, 1));
})();
