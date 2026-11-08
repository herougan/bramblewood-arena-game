#!/usr/bin/env node
// 2026-11-07 (package UI28, owner 09:00 notes #1-#3): the admin Map cards window (pk1OpenMapCards), made faster to use
//   1  a card power badge on each card ("+12" / "0" / "-8", green / grey / red) read from CARD_POWER like cePowerHTML (win % - 50); an advanced value (cp.advRate) goes into the tooltip;
//      no row, no badge; tighter chrome; Cut is the scissors emoji alone
//   2  the standing "Cut and Keep only mark your picks ..." text is gone and is the tooltip (title + aria-label) of the Cut / Keep buttons; Add card to SPECIAL sits in the SPECIAL section
//   3  skill tiles: no recommendation tile for a skill a card of the map carries; a skill met only at a higher level or hidden ("?") is a grey tile, with a "Suggested" pill when also recommended;
//      the top button row sits right under the subtitle
// Static checks always run; the browser part (Playwright, Chromium) runs when index.html and Chromium are there, at 1366 and 390. Build first. Nothing leaves the page.
'use strict';
const fs = require('fs'), path = require('path');
const ROOT = path.join(__dirname, '..');
const read = f=> fs.readFileSync(path.join(ROOT, f), 'utf8');
let fail = 0, n = 0; const ok = (c, m)=>{ n++; if(!c){ fail++; console.log('  ✗', m); } };
const app = read('arena_app.js'), tpl = read('arena_template.html');
const CODES = ['fr', 'de', 'es', 'it', 'pt', 'tl', 'ta', 'id', 'zh-Hans', 'zh-Hant', 'ja', 'ko'];

// ---- static
const KEYS = ['ui.ui28-power-adv', 'ui.ui28-suggested', 'ui.ui28-suggested-tip', 'ui.ui28-grey-lvl', 'ui.ui28-grey-hidden'];
{ const {TEXT} = require(path.join(ROOT, 'bramblewood-texts.js'));
  KEYS.forEach(k=>{ const en = TEXT[k]; ok(!!en, 'TX key ' + k);
    CODES.forEach(c=>{ const pack = JSON.parse(read('lang/' + c + '.json')); ok(en && pack[en] && (pack[en] !== en || c === 'tl'), `${c} translates "${en}"`); }); });
  ok(/\{n\}/.test(TEXT['ui.ui28-power-adv']) && /\{card\}/.test(TEXT['ui.ui28-suggested-tip']) && /\{n\}/.test(TEXT['ui.ui28-grey-lvl']), 'the placeholders are in the strings');
  ok(TEXT['ui.rv1-act-cut'] === '✂', '#1 Cut is the emoji alone');
  CODES.forEach(c=>{ const pack = JSON.parse(read('lang/' + c + '.json')); ok(!('✂ Cut' in pack) && pack['✂'] === '✂', `${c}: the old "✂ Cut" row became "✂"`); }); }
{ const fn = name=>{ const i = app.indexOf('function ' + name + '('); let d = 0, j = app.indexOf('{', i); for(let k = j; k < app.length; k++){ if(app[k] === '{') d++; else if(app[k] === '}' && --d === 0) return app.slice(i, k + 1); } return ''; };
  const open = fn('pk1OpenMapCards');
  ok(!/lf2-picks-note/.test(open) && !/class="panel-sub lf2/.test(open), '#2 no standing note paragraph');
  ok(/title="\$\{escapeAttr\(TX\('ui\.lf2-picks-note'\)\)\}" aria-label="\$\{escapeAttr\(TX\('ui\.lf2-picks-note'\)\)\}"/.test(fn('rv1TileHTML')), '#2 the note is the Cut / Keep buttons\' title and aria-label');
  ok(!/id="ff9AddSpecial"/.test(open) && /ui28AddSpecialHTML\(\)/.test(open), '#2 the Add button is built into the SPECIAL section');
  ok(/typeof ui28PowerBadgeHTML === 'function'/.test(app), '#1 the badge is guarded with typeof');
  ok(!/ui28/.test(fn('cePowerHTML')), 'cePowerHTML is untouched (BAL22 owns it)');
  const hs = fn('ui19McSkillsHTML'); ok(/typeof ui28SkillMeet === 'function'/.test(hs) && /have\.has\(r\.key\)/.test(hs), '#3 skill tiles: grey and no duplicate recommendation (guarded)');
  // lifted-function checks: the power helper
  const cpDefs = { id: 'a', n: 1 };
  const P = new Function('CARD_POWER', 'TX', 'escapeAttr', 'escapeHtml', fn('ui28PowerOf') + fn('ui28PowerBadgeHTML') + 'return {ui28PowerOf, ui28PowerBadgeHTML};');
  const tx = (k, v)=> k + (v ? JSON.stringify(v) : ''), esc = s=> String(s);
  const H = P({date: '2026-11-07', wr: {up: 62.4, down: 41.6, zero: 50.2, odd: 'x'}, advRate: {up: 70}}, tx, esc, esc);
  const up = H.ui28PowerOf('up'), dn = H.ui28PowerOf('down'), z = H.ui28PowerOf('zero');
  ok(up.n === 12 && up.adv === 20 && dn.n === -8 && dn.adv === null && z.n === 0 && H.ui28PowerOf('none') === null && H.ui28PowerOf('odd') === null, 'ui28PowerOf: +12 with advanced +20, -8, 0, no row and bad row give null');
  ok(/is-up/.test(H.ui28PowerBadgeHTML('up')) && />\+12</.test(H.ui28PowerBadgeHTML('up')) && /ui28-power-adv/.test(H.ui28PowerBadgeHTML('up')) && /is-down/.test(H.ui28PowerBadgeHTML('down')) && />-8</.test(H.ui28PowerBadgeHTML('down')) && /is-zero/.test(H.ui28PowerBadgeHTML('zero')) && H.ui28PowerBadgeHTML('none') === '', 'ui28PowerBadgeHTML: classes, text, advanced in the tooltip, nothing for not measured');
  const H0 = P(null, tx, esc, esc); ok(H0.ui28PowerBadgeHTML('up') === '', 'no CARD_POWER table: no badge'); }
ok(/\.ui28-pow\{position:absolute;/.test(tpl) && /\.ui19-sk\.is-grey\{/.test(tpl) && /\.ui28-sug\{/.test(tpl) && /\.ui28-sp-add\{/.test(tpl), 'CSS: badge, grey tile, Suggested pill, Add button');
ok(/^## 2026-11-07[^\n]*UI28/m.test(read('docs/CHANGELOG.md')), 'CHANGELOG entry');
ok(/tests\/ui28-2026-11-07\.js/.test(read('tests/run-all.sh')), 'in run-all.sh');
ok(/^## 11-07: Package UI28 \(on its branch, not released\)/m.test(read('docs/action-items.md')), 'action-items section');

async function browser(){
  let pw; try{ pw = require('playwright'); }catch(e){ console.log('  (browser part skipped: no playwright)'); return; }
  const EXE = process.env.BW_CHROMIUM || '/opt/pw-browsers/chromium_headless_shell-1194/chrome-linux/headless_shell';
  if(!fs.existsSync(EXE) || !fs.existsSync(path.join(ROOT, 'index.html'))){ console.log('  (browser part skipped: no Chromium or index.html)'); return; }
  const URL = 'file://' + path.join(ROOT, 'index.html');
  const INIT = "localStorage.setItem('bramblewood_arena_tutorial_done','1'); localStorage.setItem('bramblewood_tutorial2_done_v1','1'); localStorage.setItem('bramblewood_world_open_v1','1'); sessionStorage.setItem('bramblewood_seen_splash','1');";
  const b = await pw.chromium.launch({executablePath: EXE});
  const errs = [];
  try{
    for(const w of [1366, 390]){
      const ctx = await b.newContext({viewport:{width:w, height: w < 500 ? 844 : 900}});
      await ctx.route('**/*', r=> r.request().url().startsWith('file:') ? r.continue() : r.abort());
      const pg = await ctx.newPage(); pg.on('pageerror', e=> errs.push(`@${w}: ` + String(e)));
      await pg.addInitScript(INIT); await pg.goto(URL, {waitUntil:'domcontentloaded', timeout:90000}); await pg.waitForTimeout(2500);
      await pg.addStyleTag({content: '.toast, .toast-host, #toastHost, .xp-float, #signInBanner{display:none !important;}'});
      await pg.evaluate("adminModeEnabled = true; document.body.classList.toggle('is-admin', true); 1");
      const scan = await pg.evaluate(`(()=>{ const out = []; mainConquestMaps().forEach(m=>{ const k = mapNumberOf(m.id); if(k == null || k > 20) return; pk1OpenMapCards(m.id); const o = document.getElementById('pk1MapCardsOverlay');
        const normal = new Set([...o.querySelectorAll('.ui19-sk[data-ui19-skill]')].map(x=> x.dataset.ui19Skill)), recs = [...o.querySelectorAll('[data-ui24-rec]')].map(x=> x.dataset.ui24Rec);
        out.push({k, dupRec: recs.filter(r=> normal.has(r)), sugOutsideGrey: [...o.querySelectorAll('.ui28-sug')].filter(x=> !x.closest('.ui19-sk.is-grey, .ui19-sk.is-rec, .ui19-sk.is-intro') /* UI35 (2026-11-08): the pill also marks the recommendation tiles */).length, greySug: o.querySelectorAll('.ui19-sk.is-grey .ui28-sug').length,
          grey: o.querySelectorAll('.ui19-sk.is-grey').length, greyNew: o.querySelectorAll('.ui19-sk.is-grey.is-new').length, sugWithoutRec: [...o.querySelectorAll('.ui19-sk.is-grey[data-ui28-suggested]')].length - o.querySelectorAll('.ui19-sk.is-grey .ui28-sug').length});
        document.getElementById('pk1McClose').click(); }); return out; })()`);
      ok(scan.length >= 20, `@${w} scanned Maps 0-20 (${scan.length})`);
      ok(scan.every(x=> x.dupRec.length === 0), `@${w} no recommendation tile repeats a skill already shown as a tile`);
      ok(scan.every(x=> x.sugOutsideGrey === 0 && x.greyNew === 0 && x.sugWithoutRec === 0), `@${w} the Suggested pill is only on grey and recommendation tiles; grey tiles carry no NEW!`);
      ok(scan.some(x=> x.grey > 0) && scan.some(x=> x.greySug > 0), `@${w} some map has a grey tile and one has a Suggested grey tile (${scan.filter(x=> x.greySug).map(x=> x.k).join(',')})`);
      // Map 5 and Map 6 windows
      for(const num of [5, 6, 0]){
        const id = await pg.evaluate(`mainConquestMaps().find(m=> mapNumberOf(m.id) === ${num}).id`);
        await pg.evaluate(`pk1OpenMapCards(${JSON.stringify(id)})`); await pg.waitForTimeout(900);
        const r = await pg.evaluate(`(()=>{ const o = document.getElementById('pk1MapCardsOverlay'), q = s=> o.querySelector(s), qa = s=> [...o.querySelectorAll(s)];
          const ids = [...new Set(qa('.rv1-tile').map(t=> t.dataset.rvId))], cp = (typeof CARD_POWER !== 'undefined' && CARD_POWER && CARD_POWER.wr) || {};
          const badge = id=> { const t = o.querySelector('.rv1-tile[data-rv-id="' + id + '"] .ui28-pow'); return t ? t.textContent : null; };
          const withRow = ids.filter(id=> Object.prototype.hasOwnProperty.call(cp, id)), noRow = ids.filter(id=> !Object.prototype.hasOwnProperty.call(cp, id));
          const cut = q('[data-rv-act=cut]'), keep = q('[data-rv-act=keep]'), sub = q('.pk1-mc-modal > .panel-sub'), bar = q('.rv1-bar');
          const sp = q('[data-rv-special]'), add = q('#ff9AddSpecial'), pow = q('.ui28-pow'), tile = q('.rv1-tile .vis4-mc-card');
          const br = pow && pow.getBoundingClientRect(), tr = tile && tile.getBoundingClientRect();
          return {n: ids.length, withRow: withRow.length, noRow: noRow.length, wrong: withRow.filter(id=> { const v = Math.round(cp[id] - 50), s = v > 0 ? '+' + v : String(v === 0 ? 0 : v); return badge(id) !== s; }).length,
            badgeOnNoRow: noRow.filter(id=> badge(id) !== null).length, tipOk: !!(pow && /Power/.test(pow.title)),
            cutText: cut ? cut.textContent.trim() + '|' + !!cut.querySelector('img.tw-emoji, img[alt]') : '', cutTip: cut ? [cut.title, cut.getAttribute('aria-label')] : [], keepTip: keep ? [keep.title, keep.getAttribute('aria-label')] : [],
            noteText: o.innerText.includes('Cut and') || !!q('.lf2-picks-note'), addInSpecial: !!(sp && add && sp.contains(add)), addInBar: !!(bar && bar.contains(add)),
            gap: sub && bar ? Math.round(bar.getBoundingClientRect().top - sub.getBoundingClientRect().bottom) : null, badgeInCard: !!(br && tr && br.left >= tr.left && br.right <= tr.right + 1 && br.top >= tr.top && br.bottom <= tr.bottom),
            tileW: tile ? Math.round(tr.width) : 0, pillTexts: qa('.ui28-sug').map(x=> x.textContent)}; })()`);
        ok(r.n > 5 && r.withRow > 0, `@${w} Map ${num}: ${r.n} cards, ${r.withRow} with a power row`);
        ok(r.wrong === 0 && r.badgeOnNoRow === 0 && r.tipOk, JSON.stringify([r.wrong, r.badgeOnNoRow, r.tipOk]) + ' ' + `@${w} Map ${num}: badges read +N / 0 / -N from CARD_POWER; none on not measured (${r.noRow}); tooltip says Power`);
        ok(r.badgeInCard, `@${w} Map ${num}: the badge sits inside the card`);
        ok(r.cutText.startsWith('|') || r.cutText.split('|')[0] === '✂' , `@${w} Map ${num}: the Cut button shows the emoji only (${r.cutText})`);
        ok(/Cut and/.test(r.cutTip[0] || '') && r.cutTip[0] === r.cutTip[1] && r.keepTip[0] === r.cutTip[0] && r.keepTip[0] === r.keepTip[1], `@${w} Map ${num}: Cut and Keep carry the note as title + aria-label`);
        ok(!r.noteText, `@${w} Map ${num}: the standing note is gone`);
        ok(r.addInSpecial && !r.addInBar, `@${w} Map ${num}: Add card to SPECIAL is in the SPECIAL section`);
        ok(r.gap !== null && r.gap <= 8, `@${w} Map ${num}: the button row is ${r.gap}px under the subtitle`);
        if(num === 0) ok(r.pillTexts.length >= 1 && r.pillTexts.every(t=> t === 'Suggested'), `@${w} Map 0: the Suggested pill shows on a grey tile`);
      }
      // the Cut / Keep toggle still flips and keeps the tooltip
      const t = await pg.evaluate(`(()=>{ const o = document.getElementById('pk1MapCardsOverlay'), b = o.querySelector('[data-rv-act=cut]'); const tip = b.title; b.click(); const after = o.querySelector('[data-rv-act=cut]'); return {pressed: after.getAttribute('aria-pressed'), tip: after.title === tip}; })()`);
      ok(t.pressed === 'true' && t.tip, `@${w} Cut still toggles (aria-pressed ${t.pressed}) and keeps its tooltip`);
      await ctx.close();
    }
  } finally { await b.close(); }
  errs.forEach(e=> ok(false, 'page error ' + e));
}
browser().then(()=>{ console.log(`ui28: ${n - fail}/${n} ok`); process.exit(fail ? 1 : 0); }).catch(e=>{ console.log('ui28 crashed', e); process.exit(1); });
