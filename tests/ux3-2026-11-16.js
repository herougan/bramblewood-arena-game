#!/usr/bin/env node
// 2026-11-16 (package UX3): the UI audit's fixes at 390 px (docs/ux-audit-2026-11-16.md).
// 1 CSS is in the template, 2 browser: no horizontal scroll on the audited screens, topbar / Codex / page-bar tap sizes, the Settings panel stays on screen.
'use strict';
const fs = require('fs'), path = require('path');
const ROOT = path.join(__dirname, '..');
let fail = 0, n = 0; const ok = (c, m)=>{ n++; if(!c){ fail++; console.log('  x', m); } };
const tpl = fs.readFileSync(path.join(ROOT, 'arena_template.html'), 'utf8');

ok(/package UX3\): 36px tap targets on a phone/.test(tpl) && /\.topbar \.settings-btn, \.topbar \.feedback-btn\{width:36px !important; height:36px !important;\}/.test(tpl), 'topbar icon buttons are 36px on a phone');
ok(/\.settings-panel\{position:fixed; top:56px; right:12px; left:auto;/.test(tpl), 'the Settings panel is fixed to the phone screen');
ok(/\.account-chip-ico\{[^}]*background:#fff8e6/.test(tpl), 'the account icon sits on a cream disc');
ok(/\.page-back-bar \.pb-sc\{min-height:36px;\}/.test(tpl), 'page-bar shortcuts are 36px tall');
ok(/\.dlg-hide\{[^}]*width:34px; height:34px/.test(tpl), 'the coach dismiss button is 34px');

async function browser(){
  let pw; try{ pw = require('playwright'); }catch(e){ console.log('  (browser part skipped: no playwright)'); return; }
  const EXE = process.env.BW_CHROMIUM || '/opt/pw-browsers/chromium_headless_shell-1194/chrome-linux/headless_shell';
  if(!fs.existsSync(EXE) || !fs.existsSync(path.join(ROOT, 'index.html'))){ console.log('  (browser part skipped: no Chromium or index.html)'); return; }
  const b = await pw.chromium.launch({executablePath: EXE});
  try{
    const ctx = await b.newContext({viewport: {width: 390, height: 844}});
    await ctx.route('**/*', r=> r.request().url().startsWith('file:') ? r.continue() : r.abort());
    const pg = await ctx.newPage(); const errs = []; pg.on('pageerror', e=> errs.push(String(e)));
    await pg.addInitScript("localStorage.setItem('bramblewood_arena_tutorial_done','1'); sessionStorage.setItem('bramblewood_seen_splash','1'); localStorage.setItem('bramblewood_coach_seen', JSON.stringify(['wait','lumber','leader','handLimit','g-peek','skill-flying']));");
    await pg.goto('file://' + path.join(ROOT, 'index.html'), {waitUntil: 'domcontentloaded', timeout: 90000});
    await pg.waitForFunction("typeof switchTab === 'function'", null, {timeout: 90000}); await pg.waitForTimeout(1500);
    await pg.evaluate("(()=>{ try{ FEATURE_SPOTS.forEach(sp=> unlockFeature(sp.key)); }catch(e){} })()");
    const small = `(sel, min)=> [...document.querySelectorAll(sel)].filter(e=>{ const r = e.getBoundingClientRect(); return r.width && r.height && (r.height < min || r.width < min); }).map(e=> (e.id || e.className) + ' ' + Math.round(e.getBoundingClientRect().width) + 'x' + Math.round(e.getBoundingClientRect().height))`;
    for(const tab of ['home', 'deck', 'codex', 'shop', 'nest', 'profile']){
      await pg.evaluate(`switchTab('${tab}')`); await pg.waitForTimeout(900);
      const sw = await pg.evaluate("document.documentElement.scrollWidth");
      ok(sw <= 390, `${tab}: no horizontal scroll at 390px (${sw})`);
      if(tab !== 'home'){
        const s = await pg.evaluate(`(${small})('.topbar button.settings-btn, .topbar button.feedback-btn, .topbar .home-nav-btn.ne-home-icon, .topbar .account-chip', 36)`);
        ok(!s.length, `${tab}: topbar controls are 36px or more (${s.join(', ')})`);
        const p = await pg.evaluate(`(${small})('.page-back-bar button.pb-sc', 34)`);
        ok(!p.length, `${tab}: page-bar shortcuts are 34px or more (${p.join(', ')})`);
      }
    }
    await pg.evaluate("switchTab('codex')"); await pg.waitForTimeout(900);
    const cx = await pg.evaluate(`(${small})('#view-codex .btn.small, #view-codex .pg-tab.pg-corner', 36)`);
    ok(!cx.length, `codex: tabs, Filters and pager are 36px or more (${cx.join(', ')})`);
    const kinds = await pg.evaluate(`(${small})('#view-codex .ux-kind, #view-codex .ux-lv', 34)`);
    ok(!kinds.length, `codex: kind and level chips are 34px or more (${kinds.join(', ')})`);
    await pg.evaluate("switchTab('home'); document.getElementById('settingsBtn').click()"); await pg.waitForTimeout(700);
    const sp = await pg.evaluate("(()=>{ const r = document.querySelector('.settings-panel:not([hidden])').getBoundingClientRect(); return [r.left, r.right]; })()");
    ok(sp[0] >= 0 && sp[1] <= 390, `the Settings panel stays inside the screen (${sp})`);
    ok(!errs.length, 'no page errors: ' + errs.slice(0, 2).join(' | '));
  } finally { await b.close(); }
}
browser().then(()=>{ console.log(`ux3-2026-11-16: ${n - fail}/${n} passed`); process.exit(fail ? 1 : 0); }, e=>{ console.log('  x browser part threw', e); process.exit(1); });
