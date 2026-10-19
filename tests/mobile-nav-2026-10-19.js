#!/usr/bin/env node
// 2026-10-18 (package MB, owner 23:04 on mobile):
//   1. "On mobile, the admin and full screen button are stacked together. Put the full screen button on the correct row."
//      -> on phones the map's ⛶ sits on the 🧭 World row again (top:12px), 🚨 Admin under it; both step down only while the
//         map strip is hidden (world not open yet), where the Energy pill shares the top line.
//   2. "In mobile, there's no way to go 'home'. No home button in the conquest menu."
//      -> the full-screen map (body.conquest-immersive) hid the header and the 🏠 / ⚙️ / Energy row; a 🏠 now sits on the map's
//         own button row while it is on, and goes where the header's Home goes (switchTab('home'), full screen off).
// Static checks always run; the browser part (Playwright, Chromium at /opt/pw-browsers) runs when index.html and Chromium are there.
'use strict';
const fs = require('fs'), path = require('path');
const ROOT = path.join(__dirname, '..');
const src = fs.readFileSync(path.join(ROOT, 'arena_app.js'), 'utf8');
const tpl = fs.readFileSync(path.join(ROOT, 'arena_template.html'), 'utf8');
const {TEXT} = require(path.join(ROOT, 'bramblewood-texts.js'));
let fail = 0, n = 0; const ok = (c, m)=>{ n++; if(!c){ fail++; console.log('  ✗', m); } };

// ---- 1. the ⛶ row (static)
ok(!/\.conquest-fs-btn\{top:58px !important;\}/.test(tpl), '1. the 10-13 top:58px !important that put ⛶ on the 🚨 spot is gone');
ok(/@media \(max-width:640px\)\{\s*\/\*[^]*?\*\/\s*\.conquest-fs-btn\{top:12px;\}/.test(tpl), '1. ≤640px: ⛶ on the 🧭 row (top:12px)');
ok(/body\.world-hidden:not\(\.conquest-immersive\) \.conquest-fs-btn\{top:58px;\}/.test(tpl) && /body\.world-hidden:not\(\.conquest-immersive\) \.conquest-admin-btn\{top:104px;\}/.test(tpl),
  '1. world not open yet: ⛶ steps under the Energy pill and 🚨 under ⛶');
ok(/\.conquest-admin-btn\{position:absolute; top:58px; right:12px;/.test(tpl) && /\.conquest-world-btn\{position:absolute; top:12px; right:58px;/.test(tpl), '1. 🚨 under ⛶, 🧭 left of ⛶ (unchanged)');

// ---- 2. Home on the full-screen map (static)
ok(typeof TEXT['ui.back-to-home'] === 'string' && TEXT['ui.back-to-home'] === 'Back to Home', '2. TX key ui.back-to-home');
ok(/class="conquest-home-btn" id="conquestHomeBtn" aria-label="\$\{escapeAttr\(TX\('ui\.back-to-home'\)\)\}" title="\$\{escapeAttr\(TX\('ui\.back-to-home'\)\)\}"><span class="tab-emoji" aria-hidden="true">🏠<\/span><\/button>/.test(src),
  '2. the map renders a 🏠 button with a TX aria-label / title');
ok(/const hb = document\.getElementById\('conquestHomeBtn'\); if\(hb\) hb\.onclick = \(\)=>\{ try\{ SoundKit\.woodKnock\(\); \}catch\(e\)\{\} exitConquestImmersive\(\); switchTab\('home'\); \}; \}/.test(src), '2. it leaves full screen and goes Home');
ok(/\.conquest-home-btn\{display:none; position:absolute; top:12px; right:104px;/.test(tpl) && /body\.conquest-immersive \.conquest-home-btn\{display:flex;\}/.test(tpl), '2. shown only on the full-screen map, left of 🧭');
ok(/body\.conquest-immersive\.world-hidden \.conquest-home-btn\{right:58px;\}/.test(tpl), '2. no 🧭 yet: 🏠 right beside ⛶');
ok(/body\.conquest-immersive \.topbar-wrap, body\.conquest-immersive \.play-subtabs-row\{display:none !important;\}/.test(tpl), '2. (why) the full-screen map hides the header and the Home row');
for(const c of ['fr', 'de', 'es', 'it', 'pt', 'tl', 'ta', 'id', 'zh-Hans', 'zh-Hant', 'ja', 'ko']){
  const pack = JSON.parse(fs.readFileSync(path.join(ROOT, 'lang', c + '.json'), 'utf8'));
  ok(typeof pack['Back to Home'] === 'string' && pack['Back to Home'] && pack['Back to Home'] !== 'Back to Home', `2. lang/${c}.json translates "Back to Home"`);
}
ok(/^## 2026-10-18 \(MB: /m.test(fs.readFileSync(path.join(ROOT, 'docs', 'CHANGELOG.md'), 'utf8')), 'CHANGELOG entry');

// ---- browser: the real page at phone sizes, admin off / on, map and full-screen map
async function browser(){
  let pw; try{ pw = require('playwright'); }catch(e){ console.log('  (browser part skipped: no playwright)'); return; }
  const EXE = process.env.BW_CHROMIUM || '/opt/pw-browsers/chromium_headless_shell-1194/chrome-linux/headless_shell';
  if(!fs.existsSync(EXE) || !fs.existsSync(path.join(ROOT, 'index.html'))){ console.log('  (browser part skipped: no Chromium or index.html)'); return; }
  const URL = 'file://' + path.join(ROOT, 'index.html');
  const INIT = "localStorage.setItem('bramblewood_arena_tutorial_done','1'); localStorage.setItem('bramblewood_tutorial2_done_v1','1'); localStorage.setItem('bramblewood_world_open_v1','1'); sessionStorage.setItem('bramblewood_seen_splash','1');";
  const SIZES = [[360, 640], [390, 844], [414, 896], [480, 854], [844, 390]];
  const b = await pw.chromium.launch({executablePath: EXE});
  const errs = [];
  try{
    const ctx = await b.newContext({viewport:{width:390, height:844}, isMobile:true, hasTouch:true});
    const pg = await ctx.newPage(); pg.on('pageerror', e=> errs.push(String(e)));
    await pg.addInitScript(INIT); await pg.goto(URL, {waitUntil:'domcontentloaded', timeout:120000}); await pg.waitForTimeout(2500);
    await pg.evaluate("FEATURE_SPOTS.forEach(sp=> unlockFeature(sp.key)); 1");
    const MEASURE = `(()=>{ const box = id=>{ const e = document.getElementById(id); if(!e) return null; const cs = getComputedStyle(e); if(cs.display === 'none' || cs.visibility === 'hidden') return null;
        const r = e.getBoundingClientRect(); return r.width && r.height ? {id, l:r.left, t:r.top, r:r.right, b:r.bottom} : null; };
      const all = ['homeNavBtnPlay', 'arenaNavBtnPlay', 'dungeonKeyBtnPlay', 'settingsBtnPlaySub', 'energyPillPlay', 'conquestWorldBtn', 'conquestAdminBtn', 'conquestFsBtn', 'conquestHomeBtn', 'playHomeTabBtn'].map(box).filter(Boolean);
      const hit = []; for(let i = 0; i < all.length; i++) for(let j = i + 1; j < all.length; j++){ const a = all[i], c = all[j]; if(a.l < c.r - 1 && c.l < a.r - 1 && a.t < c.b - 1 && c.t < a.b - 1) hit.push(a.id + '/' + c.id); }
      const g = id=> all.find(x=> x.id === id); return {hit, fs: g('conquestFsBtn'), world: g('conquestWorldBtn'), admin: g('conquestAdminBtn'), home: g('conquestHomeBtn') || g('homeNavBtnPlay') || g('playHomeTabBtn'), /* + the tab bar's 🌰 (2026-10-19, package NV) */
        inside: all.every(x=> x.l >= 0 && x.r <= innerWidth + 1 && x.t >= 0)}; })()`;
    for(const admin of [false, true]) for(const imm of [false, true]) for(const [w, h] of SIZES){
      await pg.setViewportSize({width:w, height:h});
      await pg.evaluate(`(()=>{ adminModeEnabled = ${admin}; exitConquestImmersive(); playSubTab = 'conquest'; switchTab('play'); if(${imm}){ document.body.classList.add('conquest-immersive'); renderConquestSubTab(document.getElementById('playSubBody')); } return 1; })()`);
      await pg.waitForTimeout(350);
      const m = await pg.evaluate(MEASURE), tag = `${w}x${h} admin ${admin ? 'on' : 'off'}${imm ? ', full screen' : ''}`;
      ok(m.fs && !m.hit.length, `B1. ${tag}: no buttons overlap (${m.hit.join(', ')})`);
      ok(m.fs && m.world && Math.abs(m.fs.t - m.world.t) < 2 && m.fs.l > m.world.l, `B1. ${tag}: ⛶ on the 🧭 row, right of it`);
      ok(!admin || (m.admin && m.admin.t >= m.fs.b - 1 && Math.abs(m.admin.l - m.fs.l) < 2), `B1. ${tag}: 🚨 under ⛶`);
      ok(m.home && m.inside, `B2. ${tag}: a 🏠 is on screen, every button inside the viewport`);
    }
    // the full-screen map's 🏠 goes Home and leaves full screen
    await pg.setViewportSize({width:390, height:844});
    await pg.evaluate("(()=>{ adminModeEnabled = false; playSubTab = 'conquest'; switchTab('play'); document.body.classList.add('conquest-immersive'); renderConquestSubTab(document.getElementById('playSubBody')); return 1; })()");
    await pg.waitForTimeout(300);
    await pg.click('#conquestHomeBtn'); await pg.waitForTimeout(500);
    const after = await pg.evaluate("({tab: currentTab, imm: document.body.classList.contains('conquest-immersive'), homeShown: !document.getElementById('view-home').hidden})");
    ok(after.tab === 'home' && !after.imm && after.homeShown, `B2. 🏠 on the full-screen map goes Home, full screen off (${JSON.stringify(after)})`);
    // world not open yet: ⛶ steps under the Energy pill (not on it), 🚨 under ⛶
    await pg.evaluate("window.worldRevealed = ()=> false; 1");
    for(const admin of [false, true]){
      await pg.evaluate(`(()=>{ adminModeEnabled = ${admin}; playSubTab = 'conquest'; switchTab('play'); return 1; })()`); await pg.waitForTimeout(350);
      const m = await pg.evaluate(MEASURE);
      ok(m.fs && !m.hit.length && !m.world, `B3. world not open, admin ${admin ? 'on' : 'off'}: no overlaps (${m.hit.join(', ')})`);
    }
    await ctx.close();
  } finally { await b.close(); }
  ok(!errs.length, `B. no page errors (${errs.slice(0, 3).join(' | ')})`);
}
browser().catch(e=>{ fail++; console.log('  ✗ browser part threw:', e && e.message); }).then(()=>{
  console.log(`mobile-nav-2026-10-19: ${n - fail}/${n} passed`);
  process.exit(fail ? 1 : 0);
});
