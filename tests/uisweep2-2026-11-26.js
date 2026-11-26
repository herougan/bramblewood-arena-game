#!/usr/bin/env node
// 2026-11-26 (package UISWEEP2, owner 11-24 22:29 #8 #9 #14):
//   #8  phone (390 px): the nav is two rows at most, the page never scrolls sideways, the Codex shows more of its album above the fold.
//   #9  the Codex page turn pivots on the spine: the right-hand page from its left edge (going on), the left-hand page from its right edge (going back),
//       a single page the same way; reduced motion: a plain cross-fade, no leaf.
//   #14 the Arena has a simple nav (Ranked | Casual), every control sits inside the tent panel, the computer modes (Quick Battle, Gauntlet, Caged vs
//       computer, Autobattler) live on the Practice page (Conquest's second tab).
'use strict';
const fs = require('fs'), path = require('path');
const ROOT = path.join(__dirname, '..');
const app = fs.readFileSync(path.join(ROOT, 'arena_app.js'), 'utf8');
const tpl = fs.readFileSync(path.join(ROOT, 'arena_template.html'), 'utf8');
const {TEXT} = require(path.join(ROOT, 'bramblewood-texts.js'));
let fail = 0, n = 0; const ok = (c, m)=>{ n++; if(!c){ fail++; console.log('  ✗', m); } };

// ---- static
ok(/\.pg-leaf-two\.pg-leaf-mid\{transform-origin:0% 50%/.test(tpl) && /\.pg-leaf-mid\.pg-leaf-back\{transform-origin:100% 50%/.test(tpl), '#9 CSS: a single page turns about its spine edge (0% going on, 100% going back), not its middle');
ok(/\.pg-leaf\{[^}]*transform-origin:0% 50%/.test(tpl) && /\.pg-leaf-two\.pg-leaf-back\{transform-origin:100% 50%/.test(tpl), '#9 CSS: two pages: the right page pivots on its left edge, the left page on its right edge');
ok(/pg-left'\), R = host\.querySelector\('\.pg-right'\)[^]*transformOrigin/.test(app), '#9 JS: the two-page leaf pivots on the middle of the gap (the spine)');
for(const k of ['ui.sw2-ranked', 'ui.sw2-casual', 'ui.sw2-practice', 'ui.sw2-practice-back']){
  ok(typeof TEXT[k] === 'string', `texts: ${k}`);
  for(const c of ['fr', 'de', 'es', 'it', 'pt', 'tl', 'ta', 'id', 'zh-Hans', 'zh-Hant', 'ja', 'ko']){
    const pack = JSON.parse(fs.readFileSync(path.join(ROOT, 'lang', c + '.json'), 'utf8')); ok(pack[TEXT[k]], `lang/${c}.json has "${TEXT[k]}"`); }
}
ok(/^## 2026-11-26 Package UISWEEP2/m.test(fs.readFileSync(path.join(ROOT, 'docs', 'CHANGELOG.md'), 'utf8')), 'CHANGELOG entry');

async function browser(){
  let pw; try{ pw = require('playwright'); }catch(e){ console.log('  (browser part skipped: no playwright)'); return; }
  const EXE = process.env.BW_CHROMIUM || '/opt/pw-browsers/chromium_headless_shell-1194/chrome-linux/headless_shell';
  if(!fs.existsSync(EXE) || !fs.existsSync(path.join(ROOT, 'index.html'))){ console.log('  (browser part skipped: no Chromium or index.html)'); return; }
  const URL = 'file://' + path.join(ROOT, 'index.html');
  const INIT = "localStorage.setItem('bramblewood_arena_tutorial_done','1'); sessionStorage.setItem('bramblewood_seen_splash','1'); localStorage.setItem('bramblewood_coach_seen', JSON.stringify(['wait','lumber','leader','handLimit','g-peek','skill-flying']));";
  const b = await pw.chromium.launch({executablePath: EXE}); const errs = [];
  const open = async (w, h, rm)=>{ const ctx = await b.newContext({viewport:{width:w, height:h}, reducedMotion: rm || 'no-preference'}); const pg = await ctx.newPage(); pg.on('pageerror', e=> errs.push(String(e)));
    await pg.addInitScript(INIT); await pg.goto(URL, {waitUntil:'domcontentloaded', timeout:120000}); await pg.waitForTimeout(2200);
    await pg.evaluate("FEATURE_SPOTS.forEach(sp=> unlockFeature(sp.key)); 1"); return {ctx, pg}; };
  try{
    // #8: phone, nav rows and sideways overflow, page by page
    { const {ctx, pg} = await open(390, 844);
      const pages = [['home', "switchTab('home')"], ['codex', "switchTab('codex')"], ['deck', "switchTab('deck')"], ['shop', "switchTab('shop')"], ['achievements', "switchTab('achievements')"], ['inventory', "switchTab('inventory')"],
        ['profile', "switchTab('profile')"], ['map', "playSubTab='conquest'; switchTab('play')"], ['arena', "playSubTab='arena'; switchTab('play')"], ['practice', "playSubTab='practice'; switchTab('play')"]];
      for(const [name, js] of pages){
        await pg.evaluate(js); await pg.waitForTimeout(700);
        const m = await pg.evaluate(`(()=>{ const tops = []; for(const e of document.querySelectorAll('.topbar > *, #pageBackBar > *')){ const cs = getComputedStyle(e), r = e.getBoundingClientRect(); if(cs.display !== 'none' && r.height > 0 && r.width > 0) tops.push(Math.round(r.top)); }
          tops.sort((a, c)=> a - c); let rows = 0, last = -99; for(const t of tops){ if(t - last > 14){ rows++; last = t; } }
          return {rows, sw: document.documentElement.scrollWidth, iw: window.innerWidth}; })()`);
        ok(m.rows <= 2, `#8 390 px ${name}: the nav is ${m.rows} row(s), at most 2`);
        ok(m.sw <= m.iw, `#8 390 px ${name}: the page does not scroll sideways (${m.sw} > ${m.iw})`);
      }
      await pg.evaluate("switchTab('codex')"); await pg.waitForTimeout(800);
      const top = await pg.evaluate("(()=>{ const g = document.querySelector('.al-grid'); return g ? Math.round(g.getBoundingClientRect().top) : -1; })()");
      ok(top > 0 && top <= 400, `#8 390 px Codex: the card grid starts at y=${top} (was 517), 444 px or more of it above the fold`);
      await ctx.close(); }

    // #9: the turn's pivot, two pages
    { const {ctx, pg} = await open(1366, 860);
      await pg.evaluate("adminModeEnabled = true; codexShowUnseen = true; switchTab('codex')"); await pg.waitForTimeout(1200);
      for(const dir of [1, -1]){
        const r = await pg.evaluate(`(async()=>{ if(${dir} < 0){ codexTurnFn(1); await new Promise(r=> setTimeout(r, 1000)); } codexTurnFn(${dir}); await new Promise(r=> setTimeout(r, 120));
          const lf = document.querySelector('.pg-leaf'); if(!lf) return null; const host = lf.parentElement, L = host.querySelector('.pg-left'), R = host.querySelector('.pg-right');
          const ox = parseFloat(getComputedStyle(lf).transformOrigin), spine = (L.offsetLeft + L.offsetWidth + R.offsetLeft) / 2; // first .pg-left / .pg-right are the real pages (the leaf's clones come after)
          return {cls: lf.className, pivot: lf.offsetLeft + ox, spine, ox, w: lf.offsetWidth}; })()`);
        ok(r && Math.abs(r.pivot - r.spine) <= 1.5, `#9 1366 px turn ${dir > 0 ? 'on' : 'back'}: the leaf pivots on the spine (${r && r.pivot} vs ${r && r.spine})`);
        ok(r && (dir > 0 ? r.ox <= 2 : r.ox >= r.w - 2), `#9 1366 px turn ${dir > 0 ? 'on' : 'back'}: the pivot is the ${dir > 0 ? 'left' : 'right'} edge of the page that turns (${r && r.ox} of ${r && r.w})`);
        await pg.waitForTimeout(900);
      }
      await ctx.close(); }
    // #9: one page (phone)
    { const {ctx, pg} = await open(390, 844);
      await pg.evaluate("adminModeEnabled = true; codexShowUnseen = true; switchTab('codex')"); await pg.waitForTimeout(1200);
      for(const dir of [1, -1]){
        const r = await pg.evaluate(`(async()=>{ if(${dir} < 0){ codexTurnFn(1); await new Promise(r=> setTimeout(r, 1000)); } codexTurnFn(${dir}); await new Promise(r=> setTimeout(r, 120));
          const lf = document.querySelector('.pg-leaf'); if(!lf) return null; return {mid: lf.classList.contains('pg-leaf-mid'), ox: parseFloat(getComputedStyle(lf).transformOrigin), w: lf.offsetWidth}; })()`);
        ok(r && r.mid && Math.abs(r.ox - (dir > 0 ? 0 : r.w)) <= 1, `#9 390 px one page turn ${dir > 0 ? 'on' : 'back'}: pivot on the ${dir > 0 ? 'left' : 'right'} edge, not the middle (${r && r.ox} of ${r && r.w})`);
        await pg.waitForTimeout(900);
      }
      await ctx.close(); }
    // #9: reduced motion, no leaf
    { const {ctx, pg} = await open(1366, 860, 'reduce');
      await pg.evaluate("adminModeEnabled = true; codexShowUnseen = true; switchTab('codex')"); await pg.waitForTimeout(1200);
      const r = await pg.evaluate("(async()=>{ codexTurnFn(1); await new Promise(r=> setTimeout(r, 60)); return {leaf: document.querySelectorAll('.pg-leaf').length, fade: document.querySelectorAll('.pg-xfade').length}; })()");
      ok(r.leaf === 0, `#9 reduced motion: no turning leaf (a cross-fade or a plain redraw) (${JSON.stringify(r)})`);
      await ctx.close(); }

    // #14: the Arena
    for(const [w, h] of [[390, 844], [1366, 860]]){
      const {ctx, pg} = await open(w, h);
      await pg.evaluate("playSubTab = 'arena'; pl2ArenaPane = 'modes'; switchTab('play')"); await pg.waitForTimeout(900);
      const a = await pg.evaluate(`(()=>{ const q = s=> [...document.querySelectorAll(s)]; const tent = document.querySelector('.ar3-tent');
        return {tabs: q('.pl2-arena-tabs .tab-btn').map(x=> x.textContent.trim()), tent: !!tent, inTent: ['.ar3-chips', '.ar3-pvp-btn', '#startLiveRankedBtn', '#arenaAchvBtn'].every(s=> q(s).length && q(s).every(e=> e.closest('.ar3-tent'))),
          pve: ['startVsAiBtn', 'startGauntletBtn', 'startCagedAiBtn', 'openAutobattleBtn'].filter(id=> document.getElementById(id)), pvp: !!document.getElementById('startPvpBtn') && !!document.getElementById('startPvpStdBtn')}; })()`);
      ok(a.tabs.length >= 2 && /Ranked/.test(a.tabs[0]) && /Casual/.test(a.tabs[1]), `#14 ${w} px Arena: sub-tabs Ranked | Casual (${a.tabs.join(' | ')})`);
      ok(a.tent && a.inTent && a.pvp, `#14 ${w} px Arena: chips, both PvP buttons, Ranked Live and the trophy sit inside the tent panel`);
      ok(!a.pve.length, `#14 ${w} px Arena: no computer modes in the Arena (${a.pve.join(', ')})`);
      await pg.click('.pl2-arena-tabs [data-pl2-arena="casual"]'); await pg.waitForTimeout(500);
      const c = await pg.evaluate(`(()=>{ const t = document.querySelector('.ar3-tent'); return {ids: ['startVsPcBtn', 'startCagedPcBtn', 'startVsAiBtn', 'startCagedAiBtn'].map(id=> !!(t && t.querySelector('#' + id))), pane: pl2ArenaPane}; })()`);
      ok(c.pane === 'casual' && c.ids[0] && c.ids[1] && !c.ids[2] && !c.ids[3], `#14 ${w} px Arena, Casual: Pass & Play and Caged Fight (two players) in the tent, no computer modes (${JSON.stringify(c)})`);
      // Practice: Conquest's second tab
      await pg.evaluate("playSubTab = 'conquest'; switchTab('play')"); await pg.waitForTimeout(700);
      const tabs = await pg.evaluate("[...document.querySelectorAll('.play-subtabs .tab-btn')].map(x=> x.getAttribute('data-playtab'))");
      ok(tabs.includes('conquest') && tabs.includes('practice') && !tabs.includes('arena'), `#14 ${w} px Conquest page tabs: Conquest | Practice (${tabs.join(', ')})`);
      await pg.click('.play-subtabs [data-playtab="practice"]'); await pg.waitForTimeout(700);
      const p = await pg.evaluate(`(()=>{ const t = document.querySelector('.ar3-tent'); return {sub: playSubTab, ids: ['startVsAiBtn', 'startGauntletBtn', 'startCagedAiBtn'].map(id=> !!(t && t.querySelector('#' + id))), pvp: !!document.getElementById('startPvpBtn')}; })()`);
      ok(p.sub === 'practice' && p.ids.every(Boolean) && !p.pvp, `#14 ${w} px Practice: Quick Battle, Gauntlet and Caged Fight (computer) in the tent (${JSON.stringify(p)})`);
      await pg.evaluate("document.getElementById('startVsAiBtn').click()"); await pg.waitForTimeout(1500);
      ok(await pg.evaluate("typeof matchState !== 'undefined' && !!matchState"), `#14 ${w} px Practice: Quick Battle starts a fight`);
      await ctx.close();
    }
  } finally { await b.close(); }
  ok(!errs.length, `no page errors (${errs.slice(0, 3).join(' | ')})`);
}
browser().catch(e=>{ fail++; console.log('  ✗ browser part threw:', e && e.message); }).then(()=>{
  console.log(`uisweep2-2026-11-26: ${n - fail}/${n} passed`);
  process.exit(fail ? 1 : 0);
});
