#!/usr/bin/env node
// 2026-11-27 (package UISWEEP3): the five settled sweep decisions.
//   UISWEEP-1  one top bar on every page except the fight HUD: back first, the page's slot, then the fixed core Home, Map, Settings, Energy, Account
//   UISWEEP-2  a place closes the curtain, swaps behind it, then opens (880 ms the first time, 420 ms on repeat, a tap skips); other pages fade through
//              in 280 ms; pop-ups open in 200 ms and close in 140 ms; reduced motion swaps at once
//   UISWEEP-3  two breakpoints, 560 px (phones) and 900 px (wide); the few kept widths are listed below
//   STATE2-1/2 one Home (the 🏠 house), one back (a ↩ icon with a tooltip, no text backs, never two)
//   plus the Codex filter row on a phone (the type chips no longer end under the Base level toggle)
// Static checks always run; the browser part runs when index.html and Chromium are there. Browser automation swaps pages at once (navigator.webdriver, see
// bramblewood-ui-places.js txOn), so the curtain timings set window.__bwTransitions = true.
'use strict';
const fs = require('fs'), path = require('path');
const ROOT = path.join(__dirname, '..');
const rd = f=> fs.readFileSync(path.join(ROOT, f), 'utf8');
const app = rd('arena_app.js'), tpl = rd('arena_template.html'), places = rd('bramblewood-ui-places.js'), guide = rd('docs/style-guideline.md');
let fail = 0, n = 0; const ok = (c, m)=>{ n++; if(!c){ fail++; console.log('  x', m); } };

// ---- static: breakpoints
{ const widths = {};
  for(const f of ['arena_template.html', 'arena_app.js', 'bramblewood-ui-story.js', 'bramblewood-fx-f.js', 'bramblewood-ui-places.js'])
    for(const q of rd(f).match(/@media[^{;]*(?=\{)/g) || []) for(const m of q.matchAll(/(max|min)-width:\s*(\d+)px/g)) widths[m[1] + m[2]] = (widths[m[1] + m[2]] || 0) + 1;
  // the two breakpoints (560 phone, 900 wide) and their complements (561, 899); KEPT: big-screen scaling only (a bigger layout, not a layout change)
  const KEPT = ['min1000', 'min1100', 'min1200', 'min1300', 'min1500', 'min1700', 'min2300', 'max1100', 'max1199', 'max1299', 'max1499'];
  const allowed = ['max560', 'min561', 'max899', 'min900'].concat(KEPT);
  const stray = Object.keys(widths).filter(k=> !allowed.includes(k));
  ok(stray.length === 0, 'every width media query is 560 / 900 (or a kept big-screen one): stray ' + stray.join(', '));
  ok(widths.max560 > 100 && widths.max899 > 20 && widths.min900 > 5, 'the two breakpoints carry the rules (560: ' + widths.max560 + ', 899: ' + widths.max899 + ', 900: ' + widths.min900 + ')');
  ok(!/matchMedia\('\(max-width:(?!560px|899px)\d+px\)'\)/.test(app), 'script media queries use the same two widths');
  ok(/two breakpoints/i.test(guide) && /560/.test(guide) && /900/.test(guide), 'docs/style-guideline.md section 7 names the two breakpoints'); }

// ---- static: one Home, one back, one bar
ok(!/id="homeNavBtnPlay"|id="brandHomeBtn"|class="brand"/.test(tpl + app), 'no second Home (the Play 🌰 copy) and no acorn brand tile');
ok((tpl.match(/id="homeNavBtn"/g) || []).length === 1 && /id="homeNavBtn"[^>]*><span class="tab-emoji" aria-hidden="true">🏠</.test(tpl) && !/id="homeNavBtn"[^>]*hidden/.test(tpl), 'Home is the 🏠 house, never hidden');
ok(!/class="[^"]*feedback-btn/.test(tpl) && /<button type="button" class="btn ghost small" id="feedbackBtn">/.test(tpl.slice(tpl.indexOf('id="settingsPanel"'), tpl.indexOf('id="settingsLinks"'))), 'Feedback is a row of the Settings panel, not a button in the bar');
ok(!/id="settingsPanelPlaySub"|id="settingsBtnPlaySub"|id="energyPillPlay"/.test(app), 'the Play page has no Settings / Energy copies');
ok(!/class="btn small shop-back/.test(app) && !/nestMapBackBtn|achvBackBtn|guildBackBtn|rankingBackBtn|deckBackBtn/.test(app), 'no text back buttons left (Shop, Nest, Achievements, Community, deck builder)');
ok(!/>← |>‹ Back|← \$\{/.test(app.split('\n').filter(l=> /<button/.test(l) && !/pager/i.test(l)).join('\n')), 'no "← ..." text on a button');
ok(/function backBtnHTML\(id, label\)/.test(app) && /class="pb-back"[^`]*title="\$\{escapeAttr\(label\)\}" aria-label="\$\{escapeAttr\(label\)\}"/.test(app), 'the back is one helper: a ↩ icon with a tooltip and an aria-label');

// ---- static: the timings
ok(/first: \{cover: 320, hold: 80, reveal: 480\}, repeat: \{cover: 160, hold: 0, reveal: 260\}/.test(places), 'curtain: first take 320 + 80 + 480 = 880 ms, repeat 160 + 260 = 420 ms');
ok(/\.view-fade\{animation:viewFade 280ms/.test(tpl) && !/view-turn/.test(tpl + app), 'other pages fade through in 280 ms; the 3D page turn is gone');
ok(/\.bw-centre-dialog \.modal\{margin:auto; animation:bwPopIn \.2s/.test(tpl) && /\.bw-centre-dialog\.is-out \.modal\{animation:bwPopOut \.14s/.test(tpl) && /\.modal-overlay:not\(\.bw-centre-dialog\) \.modal\{animation:bwPopIn \.2s/.test(tpl) && /\.modal-overlay\.bw-closing \.modal\{animation:bwPopOut \.14s/.test(tpl), 'pop-ups open in 200 ms, close in 140 ms');
ok(/reduced\(\)\)\{ if\(!opts\.host\) ambientOff\(\); return Promise\.resolve\(false\); \}/.test(places) && /if\(!k \|\| !txOn\(\) \|\| reduced\(\)/.test(places), 'reduced motion: no curtain, no entrance');
ok(/z-index:92;/.test(places), 'the curtain sits under the bar (92 < 95), so Home, Settings and the Map button stay reachable');

// ---- browser
async function browser(){
  let pw; try{ pw = require('playwright'); }catch(e){ console.log('  (browser part skipped: no playwright)'); return; }
  const EXE = process.env.BW_CHROMIUM || '/opt/pw-browsers/chromium_headless_shell-1194/chrome-linux/headless_shell';
  if(!fs.existsSync(EXE) || !fs.existsSync(path.join(ROOT, 'index.html'))){ console.log('  (browser part skipped: no Chromium or index.html)'); return; }
  const URL = 'file://' + path.join(ROOT, 'index.html');
  const INIT = "localStorage.setItem('bramblewood_arena_tutorial_done','1'); localStorage.setItem('bramblewood_tutorial2_done_v1','1'); localStorage.setItem('bramblewood_world_open_v1','1'); sessionStorage.setItem('bramblewood_seen_splash','1');";
  const b = await pw.chromium.launch({executablePath: EXE}), errs = [];
  const open = async (opts, w, h, init)=>{ const ctx = await b.newContext(Object.assign({viewport: {width: w, height: h}}, opts || {})), pg = await ctx.newPage();
    pg.on('pageerror', e=> errs.push(String(e))); await pg.addInitScript(INIT + (init || '')); await pg.goto(URL, {waitUntil: 'domcontentloaded', timeout: 120000}); await pg.waitForTimeout(2200);
    await pg.evaluate("FEATURE_SPOTS.forEach(sp=> unlockFeature(sp.key)); 1"); return {ctx, pg}; };
  try{
    // one bar per page, the fixed core, one Home, one back
    for(const w of [1366, 390]){
      const {ctx, pg} = await open(null, w, w > 700 ? 860 : 844);
      const PAGES = [['home'], ['play'], ['deck'], ['shop'], ['nest'], ['codex'], ['profile'], ['achievements'], ['inventory'], ['market'], ['stomp'], ['trail']];
      for(const [tab] of PAGES){
        await pg.evaluate(`switchTab('${tab}'); 1`); await pg.waitForTimeout(500);
        const r = await pg.evaluate(`(()=>{ const vis = e=>{ if(!e) return false; const cs = getComputedStyle(e), r = e.getBoundingClientRect(); return cs.display !== 'none' && cs.visibility !== 'hidden' && r.width > 0 && r.height > 0; };
          const bars = [...document.querySelectorAll('.topbar')].filter(vis), bar = bars[0];
          const core = ['homeNavBtn', 'ui14MapNavBtn', 'settingsBtn', 'energyPill', 'accountChip'].map(id=>{ const e = document.getElementById(id); const r = e && e.getBoundingClientRect(); return {id, vis: vis(e), inBar: !!(bar && e && bar.contains(e)), l: r ? r.left : -1, t: r ? r.top : -1, w: r ? r.width : 0, h: r ? r.height : 0}; });
          const backs = [...document.querySelectorAll('.pb-back, .page-back-btn, .shop-back, .deck-back-btn, #statsBackBtn')].filter(vis);
          const homes = [...document.querySelectorAll('button')].filter(e=> vis(e) && /(^|\\s)Home$/i.test((e.getAttribute('aria-label') || '').trim()));
          const textBack = [...document.querySelectorAll('button')].filter(e=> vis(e) && /^(←|‹)\\s/.test((e.textContent || '').trim()));
          return {tab: currentTab, bars: bars.length, core, backs: backs.map(e=> e.id || e.className), homes: homes.length, textBack: textBack.length, slots: bar ? [...bar.querySelectorAll('.pb-sc')].filter(vis).map(e=> e.getBoundingClientRect().height) : []}; })()`);
        const t = `${w} ${tab}`;
        ok(r.tab === tab && r.bars === 1, `${t}: one top bar (${r.bars})`);
        ok(r.core.every(c=> c.vis && c.inBar), `${t}: the fixed core is in the bar (${r.core.filter(c=> !c.vis || !c.inBar).map(c=> c.id)})`);
        // the core keeps its order (Home, Map, Settings, Energy, Account), left to right; on a phone a wrapped slot row sits under it
        const ls = r.core.map(c=> c.l); ok(ls.every((l, i)=> i === 0 || l > ls[i - 1]), `${t}: the core runs Home, Map, Settings, Energy, Account (${ls.map(Math.round)})`);
        ok(r.core.every(c=> c.h >= 30), `${t}: every core control is at least 30 px tall (${r.core.map(c=> Math.round(c.h))})`);
        ok(r.homes === 1, `${t}: one Home (${r.homes})`);
        ok(r.backs.length === (['home', 'play', 'trail'].includes(tab) ? r.backs.length : 1) && r.backs.length <= 1 && r.textBack === 0, `${t}: at most one back, an icon, no text back (${r.backs}, text ${r.textBack})`);
        if(!['home', 'play'].includes(tab)) ok(r.backs.length === 1, `${t}: the back is there (${r.backs})`);
        ok(r.slots.every(h=> h >= 26), `${t}: slot buttons keep a tap height (${r.slots})`);
      }
      // the map's own slot lives in the same bar: Home and the core stay where every page has them
      await pg.evaluate("switchTab('play'); 1"); await pg.waitForTimeout(500);
      ok(await pg.evaluate("document.querySelectorAll('#view-play .play-subtabs-actions').length === 0 && !!document.querySelector('.topbar #pageBackBar')"), `${w}: no second cluster on the map`);
      // Home on Home is filled (aria-current); the 🗺️ is filled on the map
      ok(await pg.evaluate("document.getElementById('ui14MapNavBtn').classList.contains('is-here')"), `${w}: the Map button is the filled one on the map`);
      await pg.evaluate("switchTab('home'); 1"); await pg.waitForTimeout(300);
      ok(await pg.evaluate("document.getElementById('homeNavBtn').classList.contains('is-here') && document.getElementById('homeNavBtn').hasAttribute('aria-current')"), `${w}: Home is the filled one on Home`);
      // Feedback and Settings: one panel
      await pg.click('#settingsBtn'); await pg.waitForTimeout(250);
      ok(await pg.evaluate("document.querySelectorAll('.settings-panel').length >= 1 && !!document.querySelector('#settingsPanel #feedbackBtn') && !document.getElementById('settingsPanel').hidden"), `${w}: Feedback is inside the Settings panel (the fight HUD keeps its own)`);
      await ctx.close();
    }
    // the Codex filter row on a phone: the type chips end before the toggle, which is two icons
    { const {ctx, pg} = await open(null, 390, 844);
      await pg.evaluate("switchTab('codex'); 1"); await pg.waitForTimeout(700);
      const r = await pg.evaluate("(()=>{ const c = document.querySelector('.ux-kind-chips').getBoundingClientRect(), l = document.querySelector('.ux-cx-level').getBoundingClientRect(); return {cr: c.right, ll: l.left, lw: l.width, t: [...document.querySelectorAll('.ux-lv-t')].every(e=> getComputedStyle(e).display === 'none'), al: [...document.querySelectorAll('.ux-lv')].every(e=> !!e.getAttribute('aria-label'))}; })()");
      ok(r.cr <= r.ll + 1 && r.lw < 110 && r.t && r.al, `390 Codex: the chips end before the Base level toggle (${Math.round(r.cr)} <= ${Math.round(r.ll)}), the toggle is ${Math.round(r.lw)} px, labels in aria`);
      await ctx.close(); }
    // breakpoint edges: 560 is a phone (the account chip is an icon), 561 is not
    for(const [w, phone] of [[560, true], [561, false], [899, false], [900, false]]){
      const {ctx, pg} = await open(null, w, 800);
      ok(await pg.evaluate(`(()=>{ const t = document.getElementById('accountChipText'); return (getComputedStyle(t).display === 'none') === ${phone}; })()`), `${w}: ${phone ? 'phone' : 'not a phone'}: the account chip ${phone ? 'is an icon' : 'keeps its words'}`);
      await ctx.close();
    }
    // reduced motion: instant swaps, no layer, no fade
    { const {ctx, pg} = await open({reducedMotion: 'reduce'}, 1366, 860, "window.__bwTransitions = true;");
      const r = await pg.evaluate("(async()=>{ switchTab('shop'); const sync = currentTab; const layer = !!document.querySelector('.bwp-layer'); await new Promise(r=> setTimeout(r, 60)); return {sync, layer, fade: !!document.querySelector('.view-fade'), after: !!document.querySelector('.bwp-layer')}; })()");
      ok(r.sync === 'shop' && !r.layer && !r.after, `reduced motion: switchTab('shop') swaps at once, no curtain (${JSON.stringify(r)})`);
      await ctx.close(); }
    // the curtain: close, swap behind it, open; 880 ms first, 420 ms repeat, Shop <-> Premium always the repeat take, a tap skips, the latest request wins
    { const {ctx, pg} = await open(null, 1366, 860, "window.__bwTransitions = true;");
      const run = async (js, settle)=> pg.evaluate(`(async()=>{ const t0 = performance.now(), wait = ms=> new Promise(r=> setTimeout(r, ms)); const log = {}; ${js}
        let swapped = null, gone = null; for(let i = 0; i < 400; i++){ await wait(5); const now = performance.now() - t0; const layer = !!document.querySelector('.bwp-layer');
          if(swapped === null && ${settle.swapped}) swapped = now; if(gone === null && !layer && swapped !== null) { gone = now; break; } }
        log.swapped = Math.round(swapped), log.gone = Math.round(gone); return log; })()`);
      let r = await run("window.__t = ()=>0; switchTab('shop'); log.sync = currentTab; log.layerNow = !!document.querySelector('.bwp-layer');", {swapped: "currentTab === 'shop'"});
      ok(r.sync === 'home' && r.layerNow, `curtain: the page does not swap at once, the curtain closes first (still ${r.sync}, layer ${r.layerNow})`);
      // headless Chromium draws the swapped page on the same thread, so the stamps run 100-400 ms late; the nominal 880 / 420 ms are pinned above
      ok(r.swapped >= 300 && r.swapped <= 900, `curtain, first visit: swaps behind the closed curtain at about 400 ms (${r.swapped})`);
      ok(r.gone >= 650 && r.gone <= 1800 && r.gone - r.swapped >= 300, `curtain, first visit: gone after about 880 ms (${r.gone})`);
      r = await run("switchTab('home');", {swapped: "currentTab === 'home'"}); // Home is not a place: no curtain, a fade
      ok(r.swapped < 450, `a page that is not a place swaps at once and fades (${r.swapped})`);
      r = await run("switchTab('shop');", {swapped: "currentTab === 'shop'"});
      ok(r.swapped >= 100 && r.swapped <= 600 && r.gone >= 300 && r.gone <= 1100 && r.gone - r.swapped >= 150, `curtain, repeat visit: about 420 ms (swap ${r.swapped}, gone ${r.gone})`);
      r = await run("document.querySelector('[data-nav1shop=\"premium\"]').click(); log.now = shopMode;", {swapped: "shopMode === 'premium'"});
      ok(r.now === 'normal' && r.swapped >= 100 && r.gone >= 300 && r.gone <= 1100, `Shop to Premium closes, swaps behind it, then opens in about 420 ms (now ${r.now}, swap ${r.swapped}, gone ${r.gone})`);
      ok(await pg.evaluate("document.getElementById('view-shop').classList.contains('is-premium-shop')"), 'Premium is showing after the curtain');
      r = await run("document.querySelector('[data-nav1shop=\"normal\"]').click();", {swapped: "shopMode === 'normal'"});
      ok(r.gone <= 1100, `Premium to Shop, the same take (${r.gone})`);
      // a tap during the cover jumps to closed: the swap happens now
      const t = await pg.evaluate("(async()=>{ switchTab('home'); await new Promise(r=> setTimeout(r, 60)); switchTab('nest'); await new Promise(r=> setTimeout(r, 30)); const before = currentTab; const lay = document.querySelector('.bwp-layer'); lay.dispatchEvent(new PointerEvent('pointerdown', {bubbles: true})); const after = currentTab; await new Promise(r=> setTimeout(r, 1300)); return {before, after, layers: document.querySelectorAll('.bwp-layer').length}; })()");
      ok(t.before !== 'nest' && t.after === 'nest' && t.layers === 0, `a tap during the cover closes it now and the page swaps (${JSON.stringify(t)})`);
      // the latest request wins; nothing is left up
      const l = await pg.evaluate("(async()=>{ switchTab('home'); await new Promise(r=> setTimeout(r, 100)); switchTab('codex'); await new Promise(r=> setTimeout(r, 20)); switchTab('deck'); await new Promise(r=> setTimeout(r, 1500)); return {tab: currentTab, layers: document.querySelectorAll('.bwp-layer').length}; })()");
      ok(l.tab === 'deck' && l.layers === 0, `latest wins and the layer is gone within 1.5 s (${JSON.stringify(l)})`);
      // the bar stays above the curtain: Home works during a cover
      const h = await pg.evaluate("(async()=>{ switchTab('stomp'); await new Promise(r=> setTimeout(r, 40)); const z = +getComputedStyle(document.querySelector('.bwp-layer')).zIndex, bz = +getComputedStyle(document.querySelector('.topbar-wrap')).zIndex; document.getElementById('homeNavBtn').click(); await new Promise(r=> setTimeout(r, 1400)); return {z, bz, tab: currentTab, layers: document.querySelectorAll('.bwp-layer').length}; })()");
      ok(h.z < h.bz && h.tab === 'home' && h.layers === 0, `Home works while a curtain is up (layer ${h.z} < bar ${h.bz}; ${h.tab}, ${h.layers} layers)`);
      // the fade-through and the pop-ups
      const f = await pg.evaluate("(async()=>{ switchTab('profile'); const v = document.getElementById('view-profile'); const cs = getComputedStyle(v); const r = {cls: v.classList.contains('view-fade'), dur: cs.animationDuration, tab: currentTab}; return r; })()");
      ok(f.cls && f.dur === '0.28s' && f.tab === 'profile', `a page that is not a place fades through in 280 ms (${JSON.stringify(f)})`);
      const m = await pg.evaluate("(()=>{ const o = document.createElement('div'); o.className = 'modal-overlay'; o.innerHTML = '<div class=\"modal\">x</div>'; document.body.appendChild(o); const r = {open: getComputedStyle(o.querySelector('.modal')).animationDuration}; o.remove(); return r; })()");
      ok(m.open === '0.2s', `a pop-up opens in 200 ms (${m.open})`);
      const g = await pg.evaluate("(async()=>{ const o = document.createElement('div'); o.className = 'modal-overlay'; o.id = 'ghostTest'; o.innerHTML = '<div class=\"modal\">x</div>'; document.body.appendChild(o); await new Promise(r=> setTimeout(r, 30)); o.remove(); await new Promise(r=> setTimeout(r, 20)); const g1 = document.querySelector('.modal-overlay.bw-closing'); const dur = g1 ? getComputedStyle(g1.querySelector('.modal')).animationDuration : null; const idGone = !document.getElementById('ghostTest'); await new Promise(r=> setTimeout(r, 300)); return {dur, idGone, after: !!document.querySelector('.modal-overlay.bw-closing')}; })()");
      ok(g.dur === '0.14s' && g.idGone && !g.after, `a closed pop-up fades out for 140 ms and is gone (${JSON.stringify(g)})`);
      await ctx.close(); }
  } finally { await b.close(); }
  ok(errs.length === 0, 'no page errors ' + errs.slice(0, 3).join(' | '));
}
browser().then(()=>{ console.log(fail ? `uisweep3: ${fail} of ${n} checks FAILED` : `uisweep3: ${n} checks passed`); process.exit(fail ? 1 : 0); }, e=>{ console.log('  x browser part crashed:', e && e.stack || e); process.exit(1); });
