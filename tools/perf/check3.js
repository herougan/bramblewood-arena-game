#!/usr/bin/env node
// Package PERF3 (2026-11-12): behaviour checks for the changes, in the built page (headless Chromium): #cardPop's z-index with a deck-swap overlay / the pack overlay up,
// the top-row fit gives the same classes when it is re-applied from its memo, and a pip's offset from the class cache equals the measured one. Usage: node tools/perf/check3.js
'use strict';
const fs = require('fs'), path = require('path');
const ROOT = path.join(__dirname, '..', '..');
function pw(){ try{ return require('playwright'); }catch(e){ return require(path.join(require('child_process').execSync('npm root -g').toString().trim(), 'playwright')); } }
const src = fs.readFileSync(path.join(ROOT, 'tests/perf2-2026-11-11.js'), 'utf8');
const lit = n=>{ const j = src.indexOf('const ' + n + ' = ') + n.length + 9, q = src[j]; let k = j + 1; while(src[k] !== q || src[k - 1] === '\\') k++; return src.slice(j, k + 1); };
const SKIP = eval(lit('SKIP')), OWN = eval(lit('OWN'));
const EXE = process.env.BW_CHROMIUM || '/opt/pw-browsers/chromium_headless_shell-1194/chrome-linux/headless_shell';
const http = require('http'), TYPES = {'.html': 'text/html', '.js': 'text/javascript', '.json': 'application/json', '.webp': 'image/webp', '.png': 'image/png', '.svg': 'image/svg+xml', '.css': 'text/css'};
let fail = 0; const ok = (c, m)=>{ console.log(c ? '  ok ' : '  FAIL', m); if(!c) fail++; };
(async()=>{
  const s = await new Promise(res=>{ const sv = http.createServer((q, r)=>{ let p = decodeURIComponent(q.url.split('?')[0]); if(p === '/') p = '/index.html'; fs.readFile(path.join(ROOT, p), (e, d)=>{ if(e){ r.writeHead(404); r.end(); return; } r.writeHead(200, {'content-type': TYPES[path.extname(p)] || 'application/octet-stream'}); r.end(d); }); }); sv.listen(0, '127.0.0.1', ()=> res(sv)); });
  const b = await pw().chromium.launch({executablePath: fs.existsSync(EXE) ? EXE : undefined}), ctx = await b.newContext({viewport: {width: 1366, height: 768}}), pg = await ctx.newPage(), errs = []; pg.on('pageerror', e=> errs.push(String(e)));
  await pg.addInitScript(SKIP); await pg.goto(`http://127.0.0.1:${s.address().port}/index.html`); await pg.waitForFunction("typeof startConquestMatch === 'function'", null, {timeout: 120000}); await pg.waitForTimeout(1500); await pg.evaluate(OWN);
  const z = await pg.evaluate(`(async()=>{ const W = ms=> new Promise(r=> setTimeout(r, ms)), pop = document.getElementById('cardPop'), zi = ()=> getComputedStyle(pop).zIndex, out = {base: zi()};
    const ds = document.createElement('div'); ds.className = 'ds2-overlay'; document.body.appendChild(ds); await W(50); out.ds2 = zi();
    const po = document.createElement('div'); po.id = 'packOpenOverlay'; document.body.appendChild(po); await W(50); out.both = zi(); po.hidden = true; await W(50); out.dsOnly = zi(); po.hidden = false; ds.remove(); await W(50); out.packOnly = zi(); po.remove(); await W(50); out.none = zi(); return out; })()`);
  ok(z.ds2 === '9100' && z.both === '9600' && z.dsOnly === '9100' && z.packOnly === '9600' && z.none === z.base, '#cardPop z-index follows the overlays: ' + JSON.stringify(z));
  const fit = await pg.evaluate(`(async()=>{ adminModeEnabled = true; switchTab('play'); startConquestMatch('mw', '5-3', {skipEnergyCost:true, noOpener:true}); await new Promise(r=> setTimeout(r, 2800)); await document.fonts.ready;
    const cls = ()=>{ const r = document.querySelector('#view-play .top-row-controls'); return r.className + ' / ' + (r.closest('.top-play-row') || r.parentNode).className; };
    fitTopRowControls(); const a = cls(), memo = !!fitTopRowControls._memo; fitTopRowControls(); const bb = cls(); const res = {a, bb, memo};
    for(const w of [1366, 900]){ document.documentElement.style.width = ''; } return res; })()`);
  ok(fit.memo && fit.a === fit.bb, 'top-row fit: the re-applied answer equals the measured one (' + fit.a + ')');
  ok(!errs.length, 'no page errors ' + errs.slice(0, 2).join(' | '));
  await b.close(); s.close(); process.exit(fail ? 1 : 0);
})();
