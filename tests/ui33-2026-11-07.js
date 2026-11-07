#!/usr/bin/env node
// 2026-11-07 (package UI33, owner 23:05): the Codex page turn is a full turn. The leaf has two faces: the front (the page you leave) swings to edge-on, the back
// (the NEW page) opens out flat on the other side. Next and previous; reduced motion cross-fades; a hidden tab does not animate; a click mid-turn finishes the turn.
// Static checks always run; the browser part runs when index.html and Chromium are there (1366 and 390). Build first. UI33_SHOTS=<dir> saves frames at 25/50/75%.
'use strict';
const fs = require('fs'), path = require('path');
const ROOT = path.join(__dirname, '..');
const read = f=> fs.readFileSync(path.join(ROOT, f), 'utf8');
let fail = 0, n = 0; const ok = (c, m)=>{ n++; if(!c){ fail++; console.log('  ✗', m); } };
const app = read('arena_app.js'), tpl = read('arena_template.html');
const fn = (src, name)=>{ const i = src.indexOf('function ' + name + '('); if(i < 0) return ''; let d = 0; const j = src.indexOf('{', i); for(let k = j; k < src.length; k++){ if(src[k] === '{') d++; else if(src[k] === '}' && --d === 0) return src.slice(i, k + 1); } return ''; };

const lt = fn(app, 'codexLeafTurn');
ok(lt.length > 800, 'codexLeafTurn exists');
ok(/const CODEX_TURN_MS = 440/.test(app), 'the whole turn is 440 ms');
ok(/document\.hidden/.test(lt) && /reducedMotion\(\)/.test(lt) && /pg-xfade/.test(lt), 'hidden tab: no animation; reduced motion: cross-fade');
ok(/host\._cxTurnEnd/.test(lt) && /pg-face-back/.test(lt) && /pg-face-front/.test(lt) && /pg-cast/.test(lt) && /pg-hold/.test(lt), 'a running turn is finished first; two faces, a fold shadow, a held page');
ok(/\.pg-leaf-two\{[^}]*preserve-3d[^}]*animation:pgTurnFwd var\(--pg-turn-ms\)/.test(tpl), 'CSS: the two-face leaf turns in 3D');
ok(/\.pg-leaf-two \.pg-face\{backface-visibility:hidden/.test(tpl) && /\.pg-face-back\{transform:rotateY\(180deg\);?\}/.test(tpl), 'CSS: both faces hide their backs; the back is turned round');
ok(/@keyframes pgTurnFwd\{[^\n]*rotateY\(-180deg\)/.test(tpl) && /@keyframes pgTurnBack\{[^\n]*rotateY\(180deg\)/.test(tpl), 'CSS: a full 180 degrees both ways');
ok(/@keyframes pgOpenFwd\{from\{transform:perspective\(1800px\) rotateY\(-90deg\)/.test(tpl), 'CSS: one page: the new page opens out from the slice');
ok(/prefers-reduced-motion: reduce\)\{[^\n]*\.pg-leaf, \.pg-cast, \.pg-hold\{display:none/.test(tpl), 'CSS: reduced motion hides the leaf');
ok(/pg-leaf-two/.test(read('tests/run-all.sh')) === false && /ui33-2026-11-07/.test(read('tests/run-all.sh')), 'run-all.sh lists this test');

// ---- item 2 (owner 23:22): custom triggers get a gloss row in the card hover and the detail
ok(/function ui33TriggerGloss\(/.test(app) && (app.match(/ui33TriggerGloss\(/g) || []).length >= 5 && /t\.do === 'exileSelf' \? ACTION_DEFS\.find/.test(app), 'trigger gloss rows are wired into the hover (both layouts) and the detail; exileSelf has its ability line');
ok(/\.sk-used\{/.test(tpl) && /sk-used-tag/.test(fn(app, 'ui33TriggerGloss')), 'a spent one-shot trigger is struck with the used tag');

async function browser(){
  let pw; try{ pw = require('playwright'); }catch(e){ console.log('  (browser part skipped: no playwright)'); return; }
  const EXE = process.env.BW_CHROMIUM || '/opt/pw-browsers/chromium_headless_shell-1194/chrome-linux/headless_shell';
  if(!fs.existsSync(EXE) || !fs.existsSync(path.join(ROOT, 'index.html'))){ console.log('  (browser part skipped: no Chromium or index.html)'); return; }
  const URL = 'file://' + path.join(ROOT, 'index.html'), SHOTS = process.env.UI33_SHOTS;
  if(SHOTS) fs.mkdirSync(SHOTS, {recursive: true});
  const INIT = "localStorage.setItem('bramblewood_arena_tutorial_done','1'); localStorage.setItem('bramblewood_tutorial2_done_v1','1'); localStorage.setItem('bramblewood_world_open_v1','1'); sessionStorage.setItem('bramblewood_seen_splash','1');"
    + "localStorage.setItem('bramblewood_coach_seen', JSON.stringify(['wait','lumber','leader','handLimit','g-peek','skill-flying']));";
  const b = await pw.chromium.launch({executablePath: EXE});
  const errs = [];
  const OPEN = `(async()=>{ window.showToast = ()=>{}; window.playDialogue = async ()=>({}); window.maybeRarityLesson = ()=>{}; FEATURE_SPOTS.forEach(sp=> unlockFeature(sp.key)); setFxLevel('high'); Object.keys(getCardDefs()).slice(0, 200).forEach(id=>{ try{ unlockCardForPlayer(id, 'test'); }catch(e){} }); switchTab('codex'); await new Promise(r=> setTimeout(r, 2500));
    const S = codexAlbumState; if(!S || S.pages.length < 5) return 0; albumGo(S.L.pages * 2); await new Promise(r=> setTimeout(r, 900)); return S.pages.length; })()`;
  // a page's heading, to tell old from new
  const HEAD = `(el)=> { const h = el && el.querySelector('.al-head, .bk-run'); return h ? h.textContent.trim().slice(0, 60) + '|' + (el.querySelector('.al-foot') ? el.querySelector('.al-foot').textContent : '') : ''; }`;
  try{
    { // the Unremembered Heron's hover
      const ctx = await b.newContext({viewport:{width:900, height:700}}); await ctx.route('**/*', r=> r.request().url().startsWith('file:') ? r.continue() : r.abort());
      const pg = await ctx.newPage(); pg.on('pageerror', e=> errs.push('heron: ' + String(e)));
      await pg.addInitScript(INIT); await pg.goto(URL, {waitUntil:'domcontentloaded', timeout:90000}); await pg.waitForFunction("typeof switchTab === 'function'", null, {timeout: 90000}); await pg.waitForTimeout(1500);
      const h = await pg.evaluate(`(()=>{ const html = fullCardHTML('the-unremembered', null); const box = document.createElement('div'); box.id = 'heronBox'; box.style.cssText = 'position:fixed;left:20px;top:20px;width:420px;z-index:99999;background:#fffbe9;padding:12px;color:#222'; box.innerHTML = html; document.body.appendChild(box);
        const rows = [...box.querySelectorAll('.ui33-trg')].map(x=> x.textContent), lis = [...box.querySelectorAll('li')].map(x=> x.textContent);
        const live = (()=>{ try{ const d = getCardDefs()['the-unremembered']; return describeEffects(d, null, {terse:true}).join('|'); }catch(e){ return 'ERR ' + e; } })();
        return {rows, lis, live}; })()`);
      ok(h.rows.length === 1 && /On Death/.test(h.rows[0]) && /exile/i.test(h.rows[0]), 'heron hover: one gloss row, On Death ... exile (' + JSON.stringify(h.rows) + ')');
      ok(h.lis.some(t=> /On Death/.test(t) && /exile/i.test(t)), 'heron hover: its ability line lists the exile on death (' + JSON.stringify(h.lis) + ')');
      if(SHOTS){ const el = await pg.$('#heronBox'); if(el) await el.screenshot({path: path.join(SHOTS, 'heron-hover.png')}); }
      await ctx.close();
    }
    for(const w of [1366, 390]){
      for(const mode of ['motion', 'reduced', 'hidden']){
        const ctx = await b.newContext({viewport:{width:w, height: w < 500 ? 844 : 900}, reducedMotion: mode === 'reduced' ? 'reduce' : 'no-preference'});
        await ctx.route('**/*', r=> r.request().url().startsWith('file:') ? r.continue() : r.abort());
        const pg = await ctx.newPage(); pg.on('pageerror', e=> errs.push(`@${w}: ` + String(e)));
        await pg.addInitScript(INIT); await pg.goto(URL, {waitUntil:'domcontentloaded', timeout:90000}); await pg.waitForFunction("typeof switchTab === 'function'", null, {timeout: 90000}); await pg.waitForTimeout(1500);
        const total = await pg.evaluate(OPEN);
        await pg.evaluate(`(()=>{ const cb = document.getElementById('codexBody'); [...document.body.querySelectorAll('*')].forEach(e=>{ if(e.contains(cb) || cb.contains(e)) return; const c = getComputedStyle(e); if(c.position === 'fixed' && e.offsetWidth >= innerWidth * .8 && e.offsetHeight >= innerHeight * .8) e.remove(); }); })()`); // (a pack / level-up overlay the unlocks raised)
        if(!total){ ok(false, `@${w} ${mode}: the album has pages`); await ctx.close(); continue; }
        if(mode === 'hidden'){
          const r = await pg.evaluate(`(()=>{ Object.defineProperty(document, 'hidden', {configurable: true, get: ()=> true}); const g = codexAlbumState.gridEl, p0 = codexPage; albumTurn(1); return {moved: codexPage !== p0, leaf: g.querySelectorAll('.pg-leaf, .pg-cast, .pg-hold, .pg-xfade').length}; })()`);
          ok(r.moved && r.leaf === 0, `@${w} hidden tab: the page changes with no animation (${JSON.stringify(r)})`);
        } else if(mode === 'reduced'){
          const r = await pg.evaluate(`(async()=>{ const g = codexAlbumState.gridEl, p0 = codexPage; albumTurn(1); const x = g.querySelectorAll('.pg-xfade').length, leaf = g.querySelectorAll('.pg-leaf').length, vis = getComputedStyle(g.querySelector('.al-page')).animationName;
            await new Promise(r=> setTimeout(r, 400)); return {moved: codexPage !== p0, x, leaf, vis, after: g.querySelectorAll('.pg-xfade').length}; })()`);
          ok(r.moved && r.x >= 1 && r.leaf === 0 && /pgXfade/.test(r.vis) && r.after === 0, `@${w} reduced motion: a plain cross-fade, no leaf (${JSON.stringify(r)})`);
        } else {
          for(const dir of [1, -1]){
            const tag = `@${w} ${dir > 0 ? 'next' : 'previous'}`;
            const s = await pg.evaluate(`(async()=>{ const anims = ()=> document.getAnimations().filter(a=>{ try{ return isFinite(a.effect.getComputedTiming().endTime) && /pg|Pg/.test((a.animationName||'')); }catch(e){ return false; } }), fin = ()=> anims().forEach(a=>{ try{ a.finish(); }catch(e){} }); const st = window.setTimeout; window.setTimeout = (f, ms, ...a)=> (ms >= 480 && ms <= 560) ? 0 : st(f, ms, ...a); const head = ${HEAD}; const g = codexAlbumState.gridEl; const two = !!g.querySelector('.pg-right');
              const oldFrom = head(g.querySelector(${dir > 0 ? "'.pg-right, .pg-single'" : "'.pg-left, .pg-single'"})), oldOther = two ? head(g.querySelector(${dir > 0 ? "'.pg-left'" : "'.pg-right'"})) : '';
              albumTurn(${dir}); const leaf = g.querySelector('.pg-leaf'); if(!leaf) return {err: 'noleaf'};
              const newDest = head(g.querySelector(${dir > 0 ? "'.pg-left, .pg-single'" : "'.pg-right, .pg-single'"})), newReveal = two ? head(g.querySelector(${dir > 0 ? "'.pg-right'" : "'.pg-left'"})) : '';
              const out = {two, oldFrom, newDest, newReveal, frames: {}};
              const leaves = ()=> [...g.querySelectorAll('.pg-leaf')];
              for(const pct of [25, 50, 75]){
                anims().forEach(a=>{ a.pause(); a.currentTime = ${440} * pct / 100; });
                await new Promise(r=> requestAnimationFrame(()=> requestAnimationFrame(r)));
                const L = leaves(); const f = {n: L.length};
                if(two){ const m = new DOMMatrix(getComputedStyle(L[0]).transform); f.angle = Math.round(Math.atan2(m.m13, m.m11) * 180 / Math.PI); f.front = head(L[0].querySelector('.pg-face-front')); f.back = head(L[0].querySelector('.pg-face-back')); }
                else { f.ops = L.map(x=> +getComputedStyle(x).opacity); f.heads = L.map(x=> head(x)); }
                out.frames[pct] = f;
                ${'SHOT'}
              }
              out.cast = g.querySelectorAll('.pg-cast').length; out.hold = g.querySelectorAll('.pg-hold').length;
              fin(); await new Promise(r=> setTimeout(r, 150)); if(g._cxTurnEnd) g._cxTurnEnd(); window.setTimeout = st;
              out.left = g.querySelectorAll('.pg-leaf, .pg-cast, .pg-hold').length; out.hidden = [...g.querySelectorAll('.al-page')].filter(p=> p.style.visibility === 'hidden').length; return out; })()`.replace('SHOT', ''));
            ok(!s.err, `${tag}: a leaf appears`);
            if(s.err) continue;
            if(s.two){
              const f = s.frames;
              ok(Math.abs(f[25].angle) > 20 && Math.abs(f[25].angle) < 90 && f[25].front === s.oldFrom, `${tag} 25%: the leaf shows the old page, turning toward the slice (${f[25].angle} deg)`);
              ok(Math.abs(Math.abs(f[50].angle) - 90) <= 30, `${tag} 50%: near edge-on (${f[50].angle} deg)`);
              ok(Math.abs(f[75].angle) > 100 && Math.abs(f[75].angle) < 180 && f[75].back === s.newDest && f[75].back !== s.oldFrom, `${tag} 75%: past edge-on, the back face is the new page (${f[75].angle} deg, ${f[75].back})`);
              ok(s.newReveal !== '' && s.cast === 1, `${tag}: the revealed page holds new content and gets the fold shadow`);
            } else {
              const f = s.frames;
              ok(f[25].n === 2 && f[25].ops[0] === 1 && f[25].ops[1] === 0, `${tag} 25%: the old page folds, the new one waits`);
              ok(f[75].ops[1] === 1 && f[75].heads[1] === s.newDest, `${tag} 75%: the new page is opening out with its content`);
              ok(s.hidden === 0, `${tag}: the real new page is shown again after the turn`);
            }
            ok(s.left === 0, `${tag}: after the turn no copies are left (${s.left})`);
            if(SHOTS){ // frames for the owner (re-run the turn, pause at each point)
              for(const pct of [25, 50, 75]){
                await pg.evaluate(`(async()=>{ const anims = ()=> document.getAnimations().filter(a=>{ try{ return isFinite(a.effect.getComputedTiming().endTime) && /pg|Pg/.test((a.animationName||'')); }catch(e){ return false; } }), fin = ()=> anims().forEach(a=>{ try{ a.finish(); }catch(e){} }); const g = codexAlbumState.gridEl; const st = window.__st || window.setTimeout; window.__st = st; window.setTimeout = (f, ms, ...a)=> (ms >= 480 && ms <= 560) ? 0 : st(f, ms, ...a); fin(); await new Promise(r=> setTimeout(r, 120)); albumTurn(${-dir}); fin(); if(g._cxTurnEnd) g._cxTurnEnd(); await new Promise(r=> setTimeout(r, 60)); albumTurn(${dir}); anims().forEach(a=>{ a.pause(); a.currentTime = 440 * ${pct} / 100; }); await new Promise(r=> requestAnimationFrame(()=> requestAnimationFrame(r))); })()`);
                const el = await pg.$('#codexBody .al-album, #codexBody .pg-book'); if(el) await el.screenshot({path: path.join(SHOTS, `${w}-${dir > 0 ? 'next' : 'prev'}-${pct}.png`)}); // (the book is put back first, then turned this way)
                await pg.evaluate(`(async()=>{ const anims = ()=> document.getAnimations().filter(a=>{ try{ return isFinite(a.effect.getComputedTiming().endTime) && /pg|Pg/.test((a.animationName||'')); }catch(e){ return false; } }), fin = ()=> anims().forEach(a=>{ try{ a.finish(); }catch(e){} }); fin(); await new Promise(r=> setTimeout(r, 150)); if(codexAlbumState.gridEl._cxTurnEnd) codexAlbumState.gridEl._cxTurnEnd(); if(window.__st) window.setTimeout = window.__st; })()`);
              }
              // shots above turned the other way; put the page back for the next direction
            }
            await pg.evaluate(`(async()=>{ const anims = ()=> document.getAnimations().filter(a=>{ try{ return isFinite(a.effect.getComputedTiming().endTime) && /pg|Pg/.test((a.animationName||'')); }catch(e){ return false; } }), fin = ()=> anims().forEach(a=>{ try{ a.finish(); }catch(e){} }); fin(); await new Promise(r=> setTimeout(r, 150)); })()`);
          }
          // fast clicks: two turns 40 ms apart: one leaf at a time, both pages counted, nothing left
          const fc = await pg.evaluate(`(async()=>{ const g = codexAlbumState.gridEl, per = codexAlbumState.L.pages; const p0 = codexPage; albumTurn(-1); await new Promise(r=> setTimeout(r, 40)); const a = g.querySelectorAll('.pg-leaf-two, .pg-leaf-one:not(.pg-leaf-open)').length; albumTurn(-1); await new Promise(r=> setTimeout(r, 40)); const b = g.querySelectorAll('.pg-leaf-two, .pg-leaf-one:not(.pg-leaf-open)').length;
            await new Promise(r=> setTimeout(r, 700)); return {a, b, moved: (p0 - codexPage) / per, left: g.querySelectorAll('.pg-leaf, .pg-cast, .pg-hold').length, hidden: [...g.querySelectorAll('.al-page')].filter(p=> p.style.visibility === 'hidden').length}; })()`);
          ok(fc.a === 1 && fc.b === 1 && fc.moved === 2 && fc.left === 0 && fc.hidden === 0, `@${w} fast clicks: one leaf at a time, two pages turned, nothing left over (${JSON.stringify(fc)})`);
        }
        await ctx.close();
      }
    }
  } finally { await b.close(); }
  ok(errs.length === 0, 'no page errors ' + errs.slice(0, 2).join(' | '));
}
browser().then(()=>{ console.log(fail ? `ui33: ${fail} of ${n} checks FAILED` : `ui33: ${n} checks passed`); process.exit(fail ? 1 : 0); }, e=>{ console.log('  ✗ browser part crashed:', e && e.stack || e); process.exit(1); });
