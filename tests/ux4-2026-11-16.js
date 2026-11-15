#!/usr/bin/env node
// 2026-11-16 (package UX4): the UI audit's second round (docs/ux-audit-2026-11-16.md, "Round 2").
// Static: CSS / source rules. Browser (German, 390 px): input placeholders translate, long names fit on the translated word, map tab fade, home texts.
'use strict';
const fs = require('fs'), path = require('path');
const ROOT = path.join(__dirname, '..');
let fail = 0, n = 0; const ok = (c, m)=>{ n++; if(!c){ fail++; console.log('  x', m); } };
const read = f=> fs.readFileSync(path.join(ROOT, f), 'utf8');
const tpl = read('arena_template.html'), app = read('arena_app.js'), i18n = read('bramblewood-i18n.js');

ok(/function skipAttr\(el\)/.test(i18n) && /if\(skipAttr\(el\)\) return;/.test(i18n) && /function skip\(el\)\{[^}]*input, textarea/.test(i18n), 'i18n: attributes skip without inputs, text nodes still skip inputs');
ok(/function nmShown\(name\)/.test(app) && /const eng = name; name = nmShown\(name\)/.test(app), 'nmHTML fits on the translated name');
ok(/body\.pg-in-match \.dialogue-dock\{top:150px;\}/.test(tpl), 'the dialogue dock sits below the fight HUD buttons on a phone');
ok(/\.play-subtabs\.fade-r\{/.test(tpl) && /function syncSubtabsFade\(t\)/.test(app), 'the map tab strip has an edge fade');
ok(/no pill for a reward of 0/.test(app), 'results: zero rewards are dropped');
for(const c of 'fr de es it pt tl ta id zh-Hans zh-Hant ja ko'.split(' ')){
  const p = JSON.parse(read(`lang/${c}.json`));
  ok(p['Dailies & quests'] && p['Trade with players'] && p['Daily Dungeons'] && p['Send feedback'], `${c}: the home and splash literals have rows`);
}

async function browser(){
  let pw; try{ pw = require('playwright'); }catch(e){ console.log('  (browser part skipped: no playwright)'); return; }
  const EXE = process.env.BW_CHROMIUM || '/opt/pw-browsers/chromium_headless_shell-1194/chrome-linux/headless_shell';
  if(!fs.existsSync(EXE) || !fs.existsSync(path.join(ROOT, 'index.html'))){ console.log('  (browser part skipped: no Chromium or index.html)'); return; }
  const b = await pw.chromium.launch({executablePath: EXE});
  try{
    const ctx = await b.newContext({viewport: {width: 390, height: 844}});
    await ctx.route('**/*', r=> r.request().url().startsWith('file:') ? r.continue() : r.abort());
    const pg = await ctx.newPage(); const errs = []; pg.on('pageerror', e=> errs.push(String(e)));
    await pg.addInitScript("localStorage.setItem('bramblewood_arena_tutorial_done','1'); sessionStorage.setItem('bramblewood_seen_splash','1'); localStorage.setItem('bramblewood_lang_v1','de'); localStorage.setItem('bramblewood_coach_seen', JSON.stringify(['wait','lumber','leader','handLimit','g-peek','skill-flying']));");
    await pg.goto('file://' + path.join(ROOT, 'index.html'), {waitUntil: 'domcontentloaded', timeout: 90000});
    await pg.waitForFunction("typeof switchTab === 'function'", null, {timeout: 90000}); await pg.waitForTimeout(3500);
    await pg.evaluate("(()=>{ try{ FEATURE_SPOTS.forEach(sp=> unlockFeature(sp.key)); }catch(e){} })()");
    await pg.evaluate("switchTab('home')"); await pg.waitForTimeout(1500);
    const small = await pg.evaluate("[...document.querySelectorAll('.home-note small')].map(e=> e.textContent)");
    ok(small.includes('Mit Spielern handeln') && small.includes('Materia, Eier, Packs') && small.includes('Freunde · Rangliste · Gilde'), 'home notes are German (' + small.join(' | ') + ')');
    await pg.evaluate("switchTab('codex')"); await pg.waitForTimeout(1800);
    const ph = await pg.evaluate("[...document.querySelectorAll('input[placeholder]')].map(i=> i.placeholder)");
    ok(ph.length && ph.every(x=> !/^Search/.test(x)), 'Codex placeholders are translated (' + ph.join(' | ') + ')');
    const fit = await pg.evaluate(`(()=>{ const out = []; for(const id of Object.keys(getCardDefs())){ const d = getCardDefs()[id]; if(!d || !d.name || d.test) continue; const sh = nmShown(d.name); if(sh === d.name) continue;
      const lw = Math.max(1, ...sh.split(/\\s+/).filter(Boolean).map(nmWidthEm)); const m = /--nm-lw:([\\d.]+)/.exec(nmHTML(d.name)); if(!m || Math.abs(+m[1] - Math.round(lw * 100) / 100) > .01) out.push(d.name); if(out.length > 3) break; } return {bad: out, any: nmShown('Bee Warden')}; })()`);
    ok(!fit.bad.length, 'nmHTML measures the translated longest word (' + fit.bad.join(', ') + ')');
    const clipped = await pg.evaluate("[...document.querySelectorAll('.nm .nmt')].filter(e=>{ const r = e.getBoundingClientRect(), p = e.parentElement.getBoundingClientRect(); return r.width && (r.left < p.left - 1 || r.right > p.right + 1); }).map(e=> e.textContent)");
    ok(!clipped.length, 'no Codex name sticks out of its scroll (' + clipped.join(', ') + ')');
    await pg.evaluate("switchTab('play')"); await pg.waitForTimeout(4500);
    const fade = await pg.evaluate("(()=>{ const t = document.querySelector('.play-subtabs'); return t ? [t.scrollWidth > t.clientWidth + 2, t.classList.contains('fade-r')] : null; })()");
    ok(fade && (!fade[0] || fade[1]), 'the map tab strip fades when it overflows (' + fade + ')');
    ok(!errs.length, 'no page errors: ' + errs.slice(0, 2).join(' | '));
  } finally { await b.close(); }
}
browser().then(()=>{ console.log(`ux4-2026-11-16: ${n - fail}/${n} passed`); process.exit(fail ? 1 : 0); }, e=>{ console.log('  x browser part threw', e); process.exit(1); });
