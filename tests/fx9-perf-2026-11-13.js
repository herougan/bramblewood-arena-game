#!/usr/bin/env node
// Package FX9 (2026-11-13): what the two standing loops cost, before and after (manual, not in run-all.sh).
// A test page with a built page's whole stylesheet (every <style> block) and six board cards, so the loop is the only thing moving: a full fight is
// too heavy to time on a busy box (at load 30 the fight page drew no frame for seconds). A 3 s window of thread CPU from a Chrome trace (the main
// thread, every other thread: compositor, raster), paint events and rAF frames, medians over --runs, modes interleaved.
// Modes: none (six plain cards), sleep (six sleepers: FX9's Zs when the stylesheet has them, else the old 💤 overlay), guard (six Ready Guardians),
// guardWait (six Guardians that can't guard: .guard-down, which only FX9's stylesheet knows; before FX9 their plates and sheen showed anyway).
// Effects Medium by default (--fx): it stills the cards' own idle animation (High only), which would otherwise swamp the numbers; the two loops run at Medium.
//   git show <a commit before FX9>:index.html > .fx9-before.html   # (not committed)
//   node tests/fx9-perf-2026-11-13.js --page .fx9-before.html --page2 index.html --runs 7
'use strict';
const fs = require('fs'), path = require('path');
const ROOT = path.join(__dirname, '..');
const args = process.argv.slice(2), opt = (k, d)=>{ const i = args.indexOf(k); return i >= 0 && args[i + 1] ? args[i + 1] : d; };
function pw(){ try{ return require('playwright'); }catch(e){ return require(path.join(require('child_process').execSync('npm root -g').toString().trim(), 'playwright')); } }
const EXE = process.env.BW_CHROMIUM || '/opt/pw-browsers/chromium_headless_shell-1194/chrome-linux/headless_shell';
const css = f=> [...fs.readFileSync(path.join(ROOT, f), 'utf8').matchAll(/<style[^>]*>([\s\S]*?)<\/style>/g)].map(m=> m[1]).join('\n');
const PLATES = '<span class="guard-plates" aria-hidden="true"><i class="gp-l"></i><i class="gp-r"></i></span>';
function page(sheet, mode){
  const fx9 = sheet.includes('.fx9-zzz'), zzz = fx9 ? '<div class="fx9-zzz" aria-hidden="true"><i>Z</i><i>Z</i><i>Z</i></div>' : '<div class="status-overlay sleep-overlay">💤</div>';
  const card = i=>{ const cls = ['board-card'], inner = [];
    if(mode === 'sleep'){ cls.push('is-asleep'); inner.push(zzz); }
    if(mode === 'guard' || mode === 'guardWait'){ cls.push('has-guard'); if(mode === 'guardWait') cls.push('guard-down'); }
    return `<div class="${cls.join(' ')}" data-uid="${i}" style="--match-card-w:120px; --match-card-h:150px;"><div class="card-tile" style="width:120px; height:150px;"><div class="nm">Unit ${i}</div>${inner.join('')}</div>${mode.startsWith('guard') ? PLATES : ''}</div>`; };
  return `<!doctype html><html data-fx="${opt('--fx', 'med')}"><head><style>${sheet.replace(/<\/style/g, '')}</style></head><body><div id="appWrap" class="in-match"><div id="view-play"><div class="battlefield" id="battlefieldEl"><div class="battlefield-inner" id="battlefieldInner">
    <div class="board-row enemy" id="rowEnemy">${[0, 1, 2].map(card).join('')}</div><div class="board-row mine" id="rowMine">${[3, 4, 5].map(card).join('')}</div></div></div></div></div></body></html>`;
}
const med = a=>{ const s = a.slice().sort((x, y)=> x - y); return s.length ? s[Math.floor(s.length / 2)] : 0; };
(async()=>{
  const runs = +opt('--runs', 5), pages = [opt('--page', '.fx9-before.html'), opt('--page2', 'index.html')], sheets = pages.map(css);
  const b = await pw().chromium.launch({executablePath: EXE}), modes = opt('--modes', 'none,sleep,guard,guardWait').split(','), res = {};
  for(let r = 0; r < runs; r++) for(const mode of modes) for(let p = 0; p < pages.length; p++){
    const key = pages[p] + ' ' + mode; res[key] = res[key] || [];
    const ctx = await b.newContext({viewport: {width: 1366, height: 768}}), pg = await ctx.newPage();
    await pg.setContent(page(sheets[p], mode)); await pg.waitForTimeout(600);
    const cdp = await ctx.newCDPSession(pg), evs = []; cdp.on('Tracing.dataCollected', d=>{ for(const e of d.value) evs.push(e); });
    await cdp.send('Tracing.start', {transferMode: 'ReportEvents', traceConfig: {includedCategories: ['devtools.timeline', 'disabled-by-default-devtools.timeline'], recordMode: 'recordContinuously'}});
    const frames = await pg.evaluate(()=> new Promise(res=>{ let n = 0; const f = ()=>{ n++; requestAnimationFrame(f); }; requestAnimationFrame(f); setTimeout(()=> res(n), 3000); }));
    await new Promise(async ok=>{ cdp.once('Tracing.tracingComplete', ok); await cdp.send('Tracing.end'); });
    const main = new Set(evs.filter(e=> e.name === 'thread_name' && e.args && e.args.name === 'CrRendererMain').map(e=> e.pid + ':' + e.tid));
    const X = evs.filter(e=> e.ph === 'X' && e.name === 'RunTask'), mainMs = X.filter(e=> main.has(e.pid + ':' + e.tid)).reduce((t, e)=> t + (e.tdur || 0), 0) / 1000, allMs = X.reduce((t, e)=> t + (e.tdur || 0), 0) / 1000;
    const M = evs.filter(e=> e.ph === 'X' && main.has(e.pid + ':' + e.tid)), sum = nm=> M.filter(e=> e.name === nm).reduce((t, e)=> t + (e.tdur || 0), 0) / 1000;
    res[key].push({mainMs, otherMs: allMs - mainMs, styleMs: sum('UpdateLayoutTree'), paintMs: sum('Paint'), paints: M.filter(e=> e.name === 'Paint').length, frames});
    await ctx.close();
  }
  await b.close();
  console.log(`page / mode                  mainCPU otherCPU styleMs paintMs paints frames   (ms of thread CPU in a 3 s window, six cards; medians of ${runs})`);
  Object.keys(res).sort().forEach(k=>{ const R = res[k], m = f=> med(R.map(f));
    console.log(k.padEnd(28), m(x=> x.mainMs).toFixed(0).padStart(7), m(x=> x.otherMs).toFixed(0).padStart(8), m(x=> x.styleMs).toFixed(0).padStart(7), m(x=> x.paintMs).toFixed(0).padStart(7), String(m(x=> x.paints)).padStart(6), String(m(x=> x.frames)).padStart(6)); });
})();
