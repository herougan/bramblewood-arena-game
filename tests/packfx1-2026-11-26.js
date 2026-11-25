#!/usr/bin/env node
// 2026-11-26 (package PACKFX1, owner 11-24 22:29 #4 #5 #6): the pack opener's one label per card (New! never seen / Get! seen, not owned), labels and glint only
// after the turn, the glint's chance table and colour lean, and no glint with reduced motion. Static + vm, then a browser part (skipped without Chromium / index.html).
'use strict';
const fs = require('fs'), path = require('path'), vm = require('vm');
const ROOT = path.join(__dirname, '..'), rd = f => fs.readFileSync(path.join(ROOT, f), 'utf8');
let fail = 0, n = 0; const ok = (c, m) => { n++; if (!c) { fail++; console.log('  x ' + m); } };
const app = rd('arena_app.js'), css = rd('arena_template.html');

ok(/packfx1-2026-11-26/.test(rd('tests/run-all.sh')), '1. run-all.sh lists this test');
ok(/^## 2026-11-26 Package PACKFX1\b/m.test(rd('docs/CHANGELOG.md')), '1. CHANGELOG entry');
ok(/- \[x\] PACKFX1/.test(rd('docs/action-items.md')), '1. action-items marks PACKFX1 done');
ok(/Pack card glint/.test(rd('docs/effects-catalogue.md')) && /Pack card glint/.test(rd('tools/effects-lab/effects-lab.js')), '1. catalogue and Effects Lab list the glint');

// ---- labels: one per card
const row = app.match(/\$\{r\.isNew \|\| r\.seenNew \? `<span class="po2-new"[^\n]*/)[0];
ok(/r\.seenNew \? `<b>\$\{escapeHtml\(TX\('results\.new'\)\)\}<\/b>` : `<b class="ui23-get">/.test(row), '2. New! when never seen, else Get! (an either / or, never both)');
ok(!/ui23-late/.test(row), '2. no stacked second label in the opener');
ok(/if\(r\.isNew \|\| r\.seenNew\)\{\s*later\(\(\)=>\{ c\.classList\.add\('is-new-moment'\)[^\n]*, 600\)/.test(app), '2. the stamp comes after the .55 s turn, for New! and Get!');
ok(/\.po2-card\.is-revealed \.po2-rar\{[^}]*transition-delay:\.55s/.test(css), '2. the rarity pill waits for the turn');

// ---- the glint table
const src = app.match(/const PACK_GLINT_P = [^\n]*\nfunction packGlint\([\s\S]*?\n  return RARITY_TIER_BANDS[^\n]*\n/)[0];
const bands = Object.assign(['starter','common','uncommon','quest','rare','veryrare','superrare','epic','heroic','unique','questunique','legendary','mythic','ancient','divine','void','daemonic'], { indexOf(k) { return Array.prototype.indexOf.call(this, k); } });
const ctx = { RARITY_TIER_BANDS: bands, Math }; vm.createContext(ctx); vm.runInContext(src + '\nthis.P = PACK_GLINT_P; this.packGlint = packGlint;', ctx);
const P = ctx.P; ok(P.length === 8 && P.every((v, i) => i === 0 || v > P[i - 1]) && P[7] === 99, '3. chances rise every step to 99 at Epic: ' + P.join(','));
const seq = a => { let i = 0; return () => a[i++ % a.length]; };
const rate = (r, trials = 4000) => { let h = 0; for (let i = 0; i < trials; i++) if (ctx.packGlint(r)) h++; return h / trials * 100; };
ok(Math.abs(rate('common') - 10) < 3 && Math.abs(rate('rare') - 35) < 4 && rate('epic') > 95 && rate('unique') > 95 && rate('legendary') > 95, '3. measured chances follow the table');
ok(ctx.packGlint('epic', seq([0.5, 0.1, 0.1])) === 'epic' && ctx.packGlint('legendary', seq([0.5, 0.1, 0.1])) === 'legendary', '3. Epic and up: always the true colour');
ok(ctx.packGlint('rare', seq([0.1, 0.9])) === 'rare', '3. no lean 7 times in 10: the true rarity');
ok(ctx.packGlint('rare', seq([0.1, 0.1, 0.1])) === 'quest' && ctx.packGlint('rare', seq([0.1, 0.1, 0.9])) === 'veryrare', '3. a lean is one step down or up');
ok(ctx.packGlint('common', seq([0.9])) === null, '3. a miss gives no glint');

// ---- reduced motion, css
ok(/!reduce && fxAtLeast\('low'\) && !reducedMotion\(\) \? packGlint\(/.test(app), '4. no glint with reduced motion or Effects off (JS)');
ok(/@media \(prefers-reduced-motion: reduce\)\{ \.po2-glint\{display:none;\} \}/.test(css) && /html\[data-fx="none"\] \.po2-glint\{display:none;\}/.test(css), '4. CSS hides it as well');
ok(/@keyframes po2Glint\{to\{translate:/.test(css) && /animation:po2Glint \.26s/.test(css) && !/\.po2-glint[^{]*\{[^}]*filter/.test(css), '4. one translate-only animation, .26 s, no filter');

// ---- browser
async function browser() {
  let pw; try { pw = require('playwright'); } catch (e) { try { pw = require(path.join(require('child_process').execSync('npm root -g').toString().trim(), 'playwright')); } catch (_) { console.log('  (browser part skipped: no playwright)'); return; } }
  const EXE = process.env.BW_CHROMIUM || '/opt/pw-browsers/chromium_headless_shell-1194/chrome-linux/headless_shell';
  if (!fs.existsSync(EXE) || !fs.existsSync(path.join(ROOT, 'index.html'))) { console.log('  (browser part skipped: no Chromium or index.html)'); return; }
  const INIT = "localStorage.setItem('bramblewood_arena_tutorial_done','1'); sessionStorage.setItem('bramblewood_seen_splash','1'); localStorage.setItem('bramblewood_fx_level','high');";
  const b = await pw.chromium.launch({ executablePath: EXE });
  try {
    for (const reduced of [false, true]) {
      const ctx = await b.newContext({ viewport: { width: 390, height: 844 }, reducedMotion: reduced ? 'reduce' : 'no-preference' });
      await ctx.route('**/*', r => /^(file|data|blob):/.test(r.request().url()) ? r.continue() : r.abort());
      const pg = await ctx.newPage(), errs = []; pg.on('pageerror', e => errs.push(String(e && e.message || e).slice(0, 200)));
      await pg.addInitScript(INIT); await pg.goto('file://' + path.join(ROOT, 'index.html'), { waitUntil: 'domcontentloaded', timeout: 180000 });
      await pg.waitForFunction("typeof switchTab === 'function'", null, { timeout: 180000 }); await pg.waitForTimeout(1500);
      await pg.evaluate("Math.random = () => 0.001; FEATURE_SPOTS.forEach(sp => unlockFeature(sp.key))");
      await pg.evaluate(`(() => { const d = getCardDefs(), id = Object.keys(d).find(i => !d[i].token && d[i].rarity === 'epic');
        openPackAnimation({id:'s', name:'T', icon:'x'}, [{results:[{id, isNew:true, seenNew:true},{id, isNew:true, seenNew:false}]}], {}); })()`);
      await pg.waitForTimeout(800); await pg.evaluate("document.getElementById('poStrip').click()"); await pg.waitForTimeout(2200);
      await pg.evaluate("document.querySelector('.po2-card.is-current').click()");
      const early = await pg.evaluate("document.querySelectorAll('.po2-glint').length");
      let seen = 0; for (let i = 0; i < 12; i++) { await pg.waitForTimeout(60); seen = Math.max(seen, await pg.evaluate("document.querySelectorAll('.po2-glint').length")); }
      const lab = await pg.evaluate("[...document.querySelectorAll('.po2-card[data-i=\"0\"] .po2-new b')].map(e => e.textContent)");
      ok(early === 0, `5. (${reduced ? 'reduced' : 'normal'}) no glint while the card is still turning`);
      ok(reduced ? seen === 0 : seen === 1, `5. (${reduced ? 'reduced' : 'normal'}) glints seen: ${seen}`);
      ok(lab.length === 1 && /new/i.test(lab[0]), `5. (${reduced ? 'reduced' : 'normal'}) one label on the card (${lab}); New! for a never-seen card`);
      ok(errs.length === 0, '5. no page errors ' + errs.join('|'));
      await ctx.close();
    }
  } finally { await b.close(); }
}
browser().then(() => { console.log(fail ? `FAIL ${fail}/${n}` : `ok ${n} checks`); process.exit(fail ? 1 : 0); }, e => { console.log('browser part crashed: ' + e); process.exit(1); });
