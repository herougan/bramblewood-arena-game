#!/usr/bin/env node
// 2026-11-16 (package A11Y2): accessibility audit fixes (docs/a11y-audit-2026-11-16.md).
// Static: focus-ring and contrast tokens, landmark / skip link, dialog role on the results screen. Browser (1280 px, light and dark):
// names on every visible control, one h1 and one main, the skip link, Escape closes the settings panel and a card dialog and focus
// comes back to a card tile, the focus ring is the new blue one, reduced motion stops the chestnut bob.
'use strict';
const fs = require('fs'), path = require('path');
const ROOT = path.join(__dirname, '..');
let fail = 0, n = 0; const ok = (c, m)=>{ n++; if(!c){ fail++; console.log('  x', m); } };
const read = f=> fs.readFileSync(path.join(ROOT, f), 'utf8');
const tpl = read('arena_template.html'), app = read('arena_app.js'), a11y = read('bramblewood-a11y.js');

const lum = h=>{ h = h.replace('#', ''); const c = [0, 2, 4].map(i=>{ const x = parseInt(h.substr(i, 2), 16) / 255; return x <= .03928 ? x / 12.92 : Math.pow((x + .055) / 1.055, 2.4); }); return .2126 * c[0] + .7152 * c[1] + .0722 * c[2]; };
const cr = (a, b)=>{ const x = lum(a), y = lum(b); return (Math.max(x, y) + .05) / (Math.min(x, y) + .05); };
const tok = (block, name)=>{ const m = new RegExp('--' + name + ':(#[0-9a-fA-F]{6})').exec(block); return m && m[1]; };
const rootBlock = tpl.slice(tpl.indexOf(':root{') >= 0 ? tpl.indexOf(':root{') : 0, 9000);
const darkBlocks = tpl.split('--focus-ring:');
ok(darkBlocks.length === 4, '--focus-ring is defined three times (bare :root, prefers-color-scheme dark, data-theme dark)');
const rings = darkBlocks.slice(1).map(b=> /^(#[0-9a-fA-F]{6})/.exec(b)[1]);
ok(rings[0] !== rings[1] && rings[1] === rings[2], 'the light ring differs from the dark ring; the two dark blocks agree');
const surf = ['#dfe4cb', '#f2e9cf', '#e8dcb8', '#2f2013'], darkSurf = ['#141d12', '#26211a', '#332c21', '#3d3323', '#140d08'];
surf.forEach(s=> ok(cr(rings[0], s) >= 3, `light ring ${rings[0]} on ${s} is ${cr(rings[0], s).toFixed(2)}:1 (needs 3)`));
darkSurf.forEach(s=> ok(cr(rings[1], s) >= 3, `dark ring ${rings[1]} on ${s} is ${cr(rings[1], s).toFixed(2)}:1 (needs 3)`));
ok(/button:focus-visible, \[role="button"\]:focus-visible[^{]*\{outline:3px solid var\(--focus-ring\)/.test(tpl) && !/focus-visible[^{]*\{outline:3px solid #ffd27a; outline-offset:2px;\}\n  \/\* ---- Results/.test(tpl), 'the site-wide ring uses --focus-ring (the 1.3:1 gold one is gone)');
ok(cr('#c2381f', '#ffffff') >= 4.5, 'home badge: white on #c2381f is at least 4.5:1');
ok(/<div class="content-wrap" id="mainContent" role="main"/.test(tpl) && /class="skip-link" id="skipLink"/.test(tpl), 'main landmark and skip link in the template');
ok(tpl.indexOf('id="skipLink"') < tpl.indexOf('class="topbar-wrap"'), 'the skip link comes before the top bar');
ok(/prefers-reduced-motion: reduce\)\{ \.home-menu-mark/.test(tpl), 'reduced motion stops the chestnut bob');
ok(/function a11yPageH1\(tab\)/.test(app) && /a11yPageH1\(tab\); \}catch/.test(app), 'every tab sets the hidden h1');
ok(/class="pass-overlay winloss-overlay" role="dialog" aria-modal="true"/.test(app), 'the results screen is a dialog');
ok(/class="wp-stam-pips" role="img"/.test(app) && /ds-slot-pips" role="img"/.test(app), 'pip counters have role=img with their aria-label');
ok(/function refind\(k\)/.test(a11y) && /openerKey/.test(a11y), 'a11y.js finds a re-rendered opener again');
for(const c of 'fr de es it pt tl ta id zh-Hans zh-Hant ja ko'.split(' ')) ok(JSON.parse(read(`lang/${c}.json`))['Skip to content'], `${c}: Skip to content has a row`);

async function browser(){
  let pw; try{ pw = require('playwright'); }catch(e){ console.log('  (browser part skipped: no playwright)'); return; }
  const EXE = process.env.BW_CHROMIUM || '/opt/pw-browsers/chromium_headless_shell-1194/chrome-linux/headless_shell';
  if(!fs.existsSync(EXE) || !fs.existsSync(path.join(ROOT, 'index.html'))){ console.log('  (browser part skipped: no Chromium or index.html)'); return; }
  const b = await pw.chromium.launch({executablePath: EXE});
  const INIT = "localStorage.setItem('bramblewood_arena_tutorial_done','1'); sessionStorage.setItem('bramblewood_seen_splash','1'); localStorage.setItem('bramblewood_coach_seen', JSON.stringify(['wait','lumber','leader','handLimit','g-peek','skill-flying']));";
  try{
    for(const dark of [false, true]){
      const tag = dark ? 'dark' : 'light';
      const ctx = await b.newContext({viewport: {width: 1280, height: 860}, colorScheme: dark ? 'dark' : 'light', reducedMotion: dark ? 'reduce' : 'no-preference'});
      await ctx.route('**/*', r=> r.request().url().startsWith('file:') ? r.continue() : r.abort());
      const pg = await ctx.newPage(); const errs = []; pg.on('pageerror', e=> errs.push(String(e)));
      await pg.addInitScript(INIT);
      await pg.goto('file://' + path.join(ROOT, 'index.html'), {waitUntil: 'domcontentloaded', timeout: 90000});
      await pg.waitForFunction("typeof switchTab === 'function'", null, {timeout: 90000}); await pg.waitForTimeout(3000);
      await pg.evaluate("(()=>{ try{ FEATURE_SPOTS.forEach(sp=> unlockFeature(sp.key)); }catch(e){} })()");
      for(const tab of ['home', 'codex', 'deck', 'shop']){
        await pg.evaluate(`switchTab('${tab}')`); await pg.waitForTimeout(1500);
        const r = await pg.evaluate(`(()=>{ const nm = el=> (el.getAttribute('aria-label') || el.getAttribute('title') || el.textContent || (el.querySelector('img[alt]') || {}).alt || '').trim();
          const bad = [...document.querySelectorAll('button, [role=button], a[href]')].filter(el=> el.getBoundingClientRect().width && getComputedStyle(el).visibility !== 'hidden' && !nm(el)).map(el=> el.id + '.' + String(el.className).slice(0, 30));
          return {bad, h1: [...document.querySelectorAll('h1')].filter(h=> h.id === 'pageH1').length, main: document.querySelectorAll('[role=main], main').length, h1text: (document.getElementById('pageH1') || {}).textContent}; })()`);
        ok(!r.bad.length, `${tag} ${tab}: every visible button and link has a name (${r.bad.join(', ')})`);
        ok(r.h1 === 1 && r.main === 1 && r.h1text, `${tag} ${tab}: one page h1 ("${r.h1text}") and one main landmark`);
      }
      // skip link: first Tab stop on the page, lands on the main area
      await pg.evaluate("switchTab('home'); document.activeElement && document.activeElement.blur(); window.scrollTo(0, 0)"); await pg.waitForTimeout(500);
      await pg.keyboard.press('Tab');
      ok(await pg.evaluate("document.activeElement && document.activeElement.id === 'skipLink'"), `${tag}: the skip link is the first Tab stop`);
      const ring = await pg.evaluate("(()=>{ const c = getComputedStyle(document.activeElement); return [c.outlineStyle, c.outlineColor, c.outlineWidth, document.activeElement.getBoundingClientRect().top >= 0]; })()");
      ok(ring[0] === 'solid' && ring[3], `${tag}: the skip link shows when focused (${ring})`);
      await pg.keyboard.press('Enter'); await pg.waitForTimeout(200);
      ok(await pg.evaluate("document.activeElement && document.activeElement.id === 'mainContent'"), `${tag}: Enter on the skip link focuses the main area`);
      // focus ring colour on a button that sits on a light or dark surface (the top bar's own gold ring is on wood)
      await pg.evaluate("switchTab('codex')"); await pg.waitForTimeout(1200);
      const want = await pg.evaluate("(()=>{ const probe = document.createElement('i'); probe.style.color = getComputedStyle(document.documentElement).getPropertyValue('--focus-ring'); document.body.appendChild(probe); const w = getComputedStyle(probe).color; probe.remove(); return w; })()");
      await pg.evaluate("document.getElementById('pageBackBtn').focus()");
      const col2 = await pg.evaluate("(()=>{ const c = getComputedStyle(document.activeElement); return [c.outlineColor, c.outlineStyle, c.outlineWidth]; })()");
      ok(col2[1] === 'solid' && col2[0] === want, `${tag}: a focused page button gets the --focus-ring outline (${col2} vs ${want})`);
      // reduced motion (dark run emulates it)
      if(dark){
        const anim = await pg.evaluate("document.getAnimations().filter(a=> a.effect && a.effect.getComputedTiming().iterations === Infinity && a.playState === 'running').map(a=> a.animationName)");
        ok(!anim.includes('splashBob'), 'reduced motion: the chestnut bob is not running (' + anim + ')');
      }
      // Escape closes the settings panel and gives focus back
      await pg.evaluate("switchTab('home')"); await pg.waitForTimeout(800);
      await pg.evaluate("(()=>{ const b = document.querySelector('[id^=settingsBtn]'); b.focus(); b.click(); })()"); await pg.waitForTimeout(900);
      ok(await pg.evaluate("(()=>{ const p = document.getElementById('settingsPanel'); return !!p && !p.hidden && p.contains(document.activeElement) && p.getAttribute('role') === 'dialog'; })()"), `${tag}: settings opens as a dialog with focus inside`);
      await pg.keyboard.press('Escape'); await pg.waitForTimeout(700);
      ok(await pg.evaluate("(()=>{ const p = document.getElementById('settingsPanel'); return !p || p.hidden || !p.getClientRects().length; })()") && await pg.evaluate("document.activeElement && document.activeElement.id === 'settingsBtn'"), `${tag}: Escape closes settings and focus returns to the gear`);
      // a dialog opened from a control that is rebuilt while the dialog is open: focus finds the rebuilt control (by id, and by aria-label)
      for(const by of ['id', 'label']){
        await pg.evaluate(`(()=>{ document.querySelectorAll('.a11y2-t').forEach(e=> e.remove());
          const mk = ()=>{ const b = document.createElement('button'); b.className = 'a11y2-t'; b.type = 'button'; b.textContent = 'Probe'; ${by === 'id' ? "b.id = 'a11y2Probe';" : "b.setAttribute('aria-label', 'Probe card, 3 attack');"} document.body.appendChild(b); return b; };
          const o = mk(); o.focus(); window.__mk = mk; window.__o = o;
          const d = document.createElement('div'); d.className = 'modal-overlay a11y2-t'; d.setAttribute('role', 'dialog'); d.innerHTML = '<div class="modal"><h2>Probe</h2><button type="button" class="modal-close-btn" aria-label="Close">x</button></div>'; document.body.appendChild(d); window.__d = d; })()`);
        await pg.waitForTimeout(500);
        await pg.evaluate("(()=>{ window.__o.remove(); window.__mk(); })()"); await pg.waitForTimeout(100);
        await pg.keyboard.press('Escape'); await pg.waitForTimeout(500);
        await pg.evaluate("window.__d.remove()"); await pg.waitForTimeout(500);
        const act = await pg.evaluate("(()=>{ const a = document.activeElement; return a && a.classList.contains('a11y2-t') && a.tagName === 'BUTTON'; })()");
        ok(act, `${tag}: focus returns to a rebuilt opener (by ${by})`);
        await pg.evaluate("document.querySelectorAll('.a11y2-t').forEach(e=> e.remove())");
      }
      ok(!errs.length, `${tag}: no page errors: ` + errs.slice(0, 2).join(' | '));
      await ctx.close();
    }
  } finally { await b.close(); }
}
browser().then(()=>{ console.log(`a11y2-2026-11-16: ${n - fail}/${n} passed`); process.exit(fail ? 1 : 0); }, e=>{ console.log('  x browser part threw', e); process.exit(1); });
