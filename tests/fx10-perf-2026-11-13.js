#!/usr/bin/env node
// Package FX10 (2026-11-13): what each of the ten skill looks costs in a live fight, before (the float only) and after (manual, not in run-all.sh).
// The seeded fight of tools/perf/fx5_probe.js (map 5-3, seed 777, a card played); per window one event fired through the game's renderVfxForEvent
// (the event the engine sends, on a board card), a `none` window between two effects, modes rotated each run, the two builds alternated run by run so
// both see the same load. Read per window from a Chrome trace: main-thread CPU (thread time; first150: the tasks from the fire to 150 ms after, where a look starts), style / layout passes, the longest task, tasks over
// 16.7 ms (a dropped 60 fps frame) and 50 ms, and the synchronous fire. Medians over --runs.
//   git show <commit before FX10>:index.html > .fx10-before.html   # (not committed)
//   node tests/fx10-perf-2026-11-13.js --ab .fx10-before.html [--runs 3] [--rate 4] [--win 1500] [--modes snow,burn] [--cold]
'use strict';
const fs = require('fs'), path = require('path');
const ROOT = path.join(__dirname, '..');
const args = process.argv.slice(2), opt = (k, d)=>{ const i = args.indexOf(k); return i >= 0 && args[i + 1] ? args[i + 1] : d; };
function pw(){ try{ return require('playwright'); }catch(e){ return require(path.join(require('child_process').execSync('npm root -g').toString().trim(), 'playwright')); } }
const src = fs.readFileSync(path.join(ROOT, 'tests/perf2-2026-11-11.js'), 'utf8');
const lit = n=>{ const j = src.indexOf('const ' + n + ' = ') + n.length + 9, q = src[j]; let k = j + 1; while(src[k] !== q || src[k - 1] === '\\') k++; return src.slice(j, k + 1); };
const SKIP = eval(lit('SKIP')), OWN = eval(lit('OWN'));
const EXE = process.env.BW_CHROMIUM || '/opt/pw-browsers/chromium_headless_shell-1194/chrome-linux/headless_shell';
const TYPES = {'.html': 'text/html', '.js': 'text/javascript', '.json': 'application/json', '.webp': 'image/webp', '.png': 'image/png', '.svg': 'image/svg+xml', '.css': 'text/css', '.woff2': 'font/woff2'};
function serve(page){ const http = require('http'); return new Promise(res=>{ const s = http.createServer((q, r)=>{ let p = decodeURIComponent(q.url.split('?')[0]); if(p === '/') p = '/index.html';
  const f = p === '/index.html' ? page : path.join(ROOT, p); fs.readFile(f, (e, d)=>{ if(e){ r.writeHead(404); r.end(); return; } r.writeHead(200, {'content-type': TYPES[path.extname(f)] || 'application/octet-stream'}); r.end(d); }); }); s.listen(0, '127.0.0.1', ()=> res(s)); }); }
// in scope: eu / mu (an enemy / my board card's uid), eu2 (a second enemy), ed / md (their defIds)
const MODES = {
  none: null,
  snow: `{type:'statusFx', kind:'avalancheWait', side:'B', attUid:eu, attDefId:ed, targetSide:'A', targetUid:mu, targetDefId:md, amount:1}`,
  ignite: `{type:'statusFx', kind:'en20Ignite', side:'A', attUid:mu, attDefId:md, targetSide:'A', targetUid:mu, targetDefId:md, amount:1, total:1, fresh:true}`,
  burn: `{type:'burnTick', side:'A', defId:md, uid:mu, dmg:1, left:1}`,
  spent: `{type:'skillSpent', side:'B', uid:eu, defId:ed, keys:['delivery']}`,
  brood: `{type:'spawn', kind:'brood', cause:'triggerSpawn', side:'B', defId:ed, count:1, uids:[eu2], nearUid:eu}`,
  confuse: `{type:'statusFx', kind:'confuse', side:'B', attUid:eu, attDefId:ed, targetSide:'A', targetUid:mu, targetDefId:md}`,
  carrion: `{type:'statusFx', kind:'carrion', side:'B', attUid:eu, attDefId:ed, targetSide:'B', targetUid:eu, targetDefId:ed, amount:2, fromUid:mu}`,
  delivery: `{type:'lumber', side:'B', defId:ed, uid:eu, amount:1, cause:'delivery'}`,
  skitter: `{type:'statusFx', kind:'skitter', side:'A', attUid:mu, attDefId:md, targetUid:mu, targetDefId:md, amount:1}`,
  playdead: `{type:'statusFx', kind:'thanatosis', side:'A', attUid:mu, attDefId:md, targetSide:'A', targetUid:mu, targetDefId:md}`,
};
const med = a=>{ const s = a.slice().sort((x, y)=> x - y); return s.length ? s[Math.floor(s.length / 2)] : 0; };
function work(ev){
  const main = new Set(ev.filter(e=> e.name === 'thread_name' && e.args && e.args.name === 'CrRendererMain').map(e=> e.pid + ':' + e.tid));
  const M = ev.filter(e=> e.ph === 'X' && main.has(e.pid + ':' + e.tid)), RT = M.filter(e=> e.name === 'RunTask'), tasks = RT.map(e=> (e.tdur || 0) / 1000);
  const f = ev.find(e=> e.name === 'TimeStamp' && e.args && e.args.data && e.args.data.message === 'fx10-fire'), f0 = f ? f.ts : 0; // the event's task and the frames it starts the look in
  const start = RT.filter(e=> f && e.ts + (e.dur || 0) >= f0 && e.ts <= f0 + 150000).reduce((s, e)=> s + (e.tdur || 0) / 1000, 0);
  return {cpu: tasks.reduce((s, x)=> s + x, 0), start, styleN: M.filter(e=> e.name === 'UpdateLayoutTree').length, layoutN: M.filter(e=> e.name === 'Layout').length,
    maxTask: Math.max(0, ...tasks), over16: tasks.filter(x=> x > 16.7).length, over50: tasks.filter(x=> x > 50).length};
}
async function run(b, url, rate, order, win){
  const ctx = await b.newContext({viewport: {width: 1366, height: 768}}), pg = await ctx.newPage(), errs = []; pg.on('pageerror', e=> errs.push(String(e)));
  await pg.addInitScript(SKIP); await pg.goto(url); await pg.waitForFunction("typeof startConquestMatch === 'function'", null, {timeout: 180000}); await pg.waitForTimeout(1500); await pg.evaluate(OWN);
  await pg.evaluate(`(async()=>{ adminModeEnabled = true; forcedNextSeed = 777; switchTab('play'); startConquestMatch('mw', '5-3', {skipEnergyCost:true, noOpener:true}); await new Promise(r=> setTimeout(r, 2600)); try{ skipTriggerLesson(); }catch(e){} const h = document.getElementById('toastHost'); if(h) h.remove(); window.showToast = ()=>{};
    const m = matchState, pl = m.players[1], c = pl.hand.find(h=> m.engine.canPlay(pl, h.defId, h.uid)); if(c) await playCardByUid(c.uid, 'left'); await new Promise(r=> setTimeout(r, 2500)); })()`);
  // the cues are baked once a session (SoundKit keeps each buffer): bake them all first, in both builds, so a window holds the look, not the first bake (--cold keeps it)
  if(!args.includes('--cold')) await pg.evaluate("(async()=>{ ['snowThump', 'igniteWhoosh', 'burnCrackle', 'spentPuff', 'silkDrop', 'confuseWarble', 'carrionCaw', 'crateThunk', 'skitterPatter', 'playDeadFlop', 'blindTone', 'buzz', 'gold', 'gritUp'].forEach(k=>{ try{ SoundKit[k] && SoundKit[k](); }catch(e){} }); await new Promise(r=> setTimeout(r, 1500)); })()");
  const cdp = await ctx.newCDPSession(pg); await cdp.send('Emulation.setCPUThrottlingRate', {rate}); const out = {};
  for(const mode of order){
    const evs = [], on = d=>{ for(const e of d.value) evs.push(e); }; cdp.on('Tracing.dataCollected', on);
    await cdp.send('Tracing.start', {transferMode: 'ReportEvents', traceConfig: {includedCategories: ['devtools.timeline', 'disabled-by-default-devtools.timeline'], recordMode: 'recordContinuously'}});
    const info = await pg.evaluate(`(async()=>{ const E = [...document.querySelectorAll('#rowEnemy .board-card[data-uid]')], M = document.querySelector('#rowMine .board-card[data-uid]');
      const eu = E[0] && E[0].dataset.uid, eu2 = (E[1] || E[0]) && (E[1] || E[0]).dataset.uid, mu = M && M.dataset.uid, rc = matchState.replayCards || {}, def = u=>{ const c = rc[u] || (typeof currentCardByUid === 'function' ? currentCardByUid(u) : null); return c && c.defId; };
      const ed = def(eu), md = def(mu); let err = null; const ev = ${MODES[mode] || 'null'}; console.timeStamp('fx10-fire'); const t0 = performance.now();
      try{ if(ev) renderVfxForEvent(ev); }catch(e){ err = String(e); } const fireMs = performance.now() - t0; await new Promise(r=> setTimeout(r, ${win})); return {err, fireMs, E: E.length, M: !!M}; })()`);
    await new Promise(async res=>{ cdp.once('Tracing.tracingComplete', res); await cdp.send('Tracing.end'); }); cdp.off('Tracing.dataCollected', on);
    if(info.err) errs.push(mode + ': ' + info.err); if(!info.M || info.E < 1) errs.push(mode + ': no board cards');
    (out[mode] || (out[mode] = [])).push(Object.assign(work(evs), {fireMs: info.fireMs}));
  }
  await ctx.close(); return {out, errs};
}
(async()=>{
  const page = path.resolve(opt('--page', path.join(ROOT, 'index.html'))), runs = +opt('--runs', 3), rate = +opt('--rate', 1), win = +opt('--win', 1500);
  const modes = opt('--modes', Object.keys(MODES).filter(m=> m !== 'none').join(',')).split(',').filter(m=> MODES[m]);
  const pages = [page].concat(opt('--ab', null) ? [path.resolve(opt('--ab'))] : []), srv = await Promise.all(pages.map(serve)), urls = srv.map(x=> `http://127.0.0.1:${x.address().port}/index.html`);
  const b = await pw().chromium.launch({executablePath: fs.existsSync(EXE) ? EXE : undefined, args: ['--enable-unsafe-swiftshader', '--use-angle=swiftshader', '--ignore-gpu-blocklist']});
  const all = pages.map(()=> ({})), errs = [];
  for(let r = 0; r < runs; r++){
    const rot = modes.slice(); for(let k = 0; k < r % Math.max(1, rot.length); k++) rot.push(rot.shift());
    const order = []; rot.forEach(m=> order.push('none', m)); const pi = pages.map((_, i)=> i); if(r % 2) pi.reverse();
    for(const i of pi){ const res = await run(b, urls[i], rate, order, win); errs.push(...res.errs.map(e=> path.basename(pages[i]) + ' ' + e)); Object.entries(res.out).forEach(([m, a])=> (all[i][m] || (all[i][m] = [])).push(...a)); }
    process.stderr.write(`run ${r + 1}/${runs} done\n`);
  }
  await b.close(); srv.forEach(x=> x.close());
  pages.forEach((pg, i)=>{
    console.log(`${path.basename(pg)} ${rate}x, ${win} ms windows, medians of ${runs} (none: every 'none' window)`);
    console.log('mode      mainCPU  first150  style  layout  maxTask  >16.7  >50   fire');
    ['none'].concat(modes).forEach(m=>{ const a = all[i][m] || []; if(!a.length) return; const k = f=> med(a.map(x=> x[f]));
      console.log(m.padEnd(9), String(Math.round(k('cpu'))).padStart(7), k('start').toFixed(1).padStart(9), String(k('styleN')).padStart(6), String(k('layoutN')).padStart(7), String(Math.round(k('maxTask'))).padStart(8), String(k('over16')).padStart(6), String(k('over50')).padStart(4), k('fireMs').toFixed(1).padStart(6)); }); });
  if(errs.length) console.log('errors:', [...new Set(errs)].slice(0, 6));
  if(opt('--json', null)) fs.writeFileSync(opt('--json'), JSON.stringify(pages.map((p, i)=> ({page: path.basename(p), modes: all[i]})), null, 1));
})();
