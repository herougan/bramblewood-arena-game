#!/usr/bin/env node
// 2026-11-07 (package UI24, owner 11-06 23:35 notes #1, #2, #3, #7 display, #10, #12, #14):
//   1  2-3 px more margin under the card in the hover popover (24 -> 27 px)
//   2  card editor: adding a skill keeps the scroll position; the preview and the hover details follow the unsaved skills
//   3  Identity: Art height, Phylum, Type and Second type share the row of Card group / Card kind / Art; Art height moves the preview
//   7  card power in the editor: "Power: +N / 0 / -N" (win % of docs/balance/card-balance.json minus 50), its date, "not measured" without a row
//   10 Diurnal and Inspiration pip numbers 1 px closer; 14 trigger pips: the arrow closer to the emoji
//   12 Codex skill list: a skill and its Grant twin (Tally, Throng ...) are one entry that lists its thresholds
// Static checks always run; the browser part (Playwright, Chromium) runs when index.html and Chromium are there, at 1366 and 390.
// Build first (python3 assemble_arena.py && mv bramblewood-arena.html index.html). Nothing leaves the page.
'use strict';
const fs = require('fs'), path = require('path');
const ROOT = path.join(__dirname, '..');
const read = f=> fs.readFileSync(path.join(ROOT, f), 'utf8');
let fail = 0, n = 0; const ok = (c, m)=>{ n++; if(!c){ fail++; console.log('  ✗', m); } };
const app = read('arena_app.js'), tpl = read('arena_template.html'), asm = read('assemble_arena.py');
const CODES = ['fr', 'de', 'es', 'it', 'pt', 'tl', 'ta', 'id', 'zh-Hans', 'zh-Hant', 'ja', 'ko'];

// ---- static
const KEYS = ['ui.ui24-type2', 'ui.ui24-phylum-tip', 'ui.ui24-thresholds', 'ui.ui24-power', 'ui.ui24-power-none', 'ui.ui24-power-date', 'ui.ui24-power-tip'];
{ const {TEXT} = require(path.join(ROOT, 'bramblewood-texts.js'));
  KEYS.forEach(k=>{ const en = TEXT[k]; ok(!!en, 'TX key ' + k);
    CODES.forEach(c=>{ const pack = JSON.parse(read('lang/' + c + '.json')); ok(en && pack[en] && pack[en] !== en, `${c} translates "${en}"`); }); });
  ok(/\{n\}/.test(TEXT['ui.ui24-power']) && /\{date\}/.test(TEXT['ui.ui24-power-date']) && /\{list\}/.test(TEXT['ui.ui24-thresholds']), 'the placeholders are in the strings'); }
ok(/#cardPop \.card-pop-visual\{position:relative; z-index:2; margin:calc\(-1 \* var\(--pop-lift, 84px\)\) 0 27px;\}/.test(tpl), '#1 the popover card has 27 px under it (was 24)');
ok(/\.ab-trig \.ab-arrow\{[^}]*margin:0 -1px;/.test(tpl), '#14 the trigger arrow sits closer to its emojis');
ok(/ab-sk\[data-sk="diurnal"\] img\.tw-emoji, \.card-tile \.badges \.abadge\.eng21-insp img\.tw-emoji\{margin-right:calc\(\.02em - 1px\)/.test(tpl) && /\.board-card \.card-tile \.badges \.abadge \.ab-sk\[data-sk="diurnal"\] img\.tw-emoji[^{]*\{margin-right:calc\(-\.16em - 1px\) !important/.test(tpl), '#10 Diurnal and Inspiration numbers are 1 px closer (card and board)');
ok(/sub_once\(app_src, "__CARD_POWER__"/.test(asm) && /const CARD_POWER = __CARD_POWER__;/.test(app), '#7 the build placeholder is wired');
ok(/^## 2026-11-07[^\n]*UI24/m.test(read('docs/CHANGELOG.md')), 'CHANGELOG entry');
ok(/tests\/ui24-2026-11-07\.js/.test(read('tests/run-all.sh')), 'in run-all.sh');
ok(/^## 11-07: Package UI24 \(on its branch, not released\)/m.test(read('docs/action-items.md')), 'action-items section');
{ const html = read('index.html'); ok(!html.includes('__CARD_POWER__') && /const CARD_POWER = \{"date": "\d{4}-\d\d-\d\d", "wr": \{/.test(html), '#7 index.html carries the card power table'); }

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
      const ctx = await b.newContext({viewport:{width:w, height: w < 500 ? 844 : 900}, hasTouch: false});
      await ctx.route('**/*', r=> r.request().url().startsWith('file:') ? r.continue() : r.abort());
      const pg = await ctx.newPage(); pg.on('pageerror', e=> errs.push(`@${w}: ` + String(e)));
      await pg.addInitScript(INIT); await pg.goto(URL, {waitUntil:'domcontentloaded', timeout:90000}); await pg.waitForTimeout(2500);
      await pg.addStyleTag({content: '.toast, .toast-host, #toastHost, .xp-float, #signInBanner{display:none !important;}'});
      await pg.evaluate("adminModeEnabled = true; document.body.classList.toggle('is-admin', true); 1");
      const open = async id=>{ await pg.evaluate(`closeCardEditor(); openCardEditor(${id ? `'${id}'` : ''})`); await pg.waitForTimeout(600); };

      // ---- 2 adding a skill keeps the scroll; preview and hover follow
      await open('abbey-goose');
      await pg.evaluate("document.getElementById('addSkill').scrollIntoView({block:'center'}); 1"); await pg.waitForTimeout(200);
      const s0 = await pg.evaluate("document.querySelector('#editorOverlay .modal').scrollTop");
      const html0 = await pg.evaluate("document.getElementById('cePreview').dataset.html");
      await pg.click('#addSkill'); await pg.waitForTimeout(700);
      const s1 = await pg.evaluate("document.querySelector('#editorOverlay .modal').scrollTop");
      ok(s0 > 100 && Math.abs(s1 - s0) <= 2, `@${w} adding a skill keeps the scroll (${s0} -> ${s1})`);
      ok(await pg.evaluate("document.getElementById('cePreview').dataset.html") !== html0, `@${w} the preview follows the new skill`);
      const added = await pg.evaluate("(()=>{ const sel = [...document.querySelectorAll('#skillRows select[data-sk=key]')].pop(); return sel.options[sel.selectedIndex].textContent.replace(/^[^A-Za-z]+/, '').trim(); })()");
      await pg.evaluate("document.querySelector('#editorOverlay .modal').scrollTop = 0; 1");
      await pg.hover('#cePreview .card-tile'); await pg.waitForTimeout(1500);
      const pop = await pg.evaluate("document.getElementById('cardPop').hidden ? '' : document.getElementById('cardPop').innerText");
      ok(pop && pop.toLowerCase().includes(added.toLowerCase().split(' ')[0]), `@${w} the hover details show the unsaved skill "${added}"`);
      await pg.mouse.move(5, 5); await pg.waitForTimeout(300);
      // a skill changed in its dropdown keeps the scroll too
      await pg.evaluate("document.getElementById('addSkill').scrollIntoView({block:'center'}); 1"); await pg.waitForTimeout(200);
      const c0 = await pg.evaluate("document.querySelector('#editorOverlay .modal').scrollTop");
      await pg.evaluate("(()=>{ const sel = [...document.querySelectorAll('#skillRows select[data-sk=key]')].pop(); const o = [...sel.options].find(o=> o.value !== sel.value && o.value === 'bleed') || [...sel.options].find(o=> o.value !== sel.value); sel.value = o.value; sel.dispatchEvent(new Event('change', {bubbles:true})); })()"); await pg.waitForTimeout(700);
      const c1 = await pg.evaluate("document.querySelector('#editorOverlay .modal').scrollTop");
      ok(Math.abs(c1 - c0) <= 2, `@${w} changing a skill keeps the scroll (${c0} -> ${c1})`);

      // ---- 3 Identity rows
      await open('abbey-goose');
      const tops = await pg.evaluate("['fCardKind', 'fArtStyle', 'fArtPosY', 'fPhylum', 'fSpecies', 'fSpecies2'].map(i=> Math.round(document.getElementById(i).getBoundingClientRect().top))");
      if(w >= 1000) ok(new Set(tops).size === 1, `@${w} Card kind, Art, Art height, Phylum, Type and Second type are on one row ${JSON.stringify(tops)}`);
      const idf = await pg.evaluate("(()=>{ const ph = document.getElementById('fPhylum'), sp = document.getElementById('fSpecies'); return {phylum: ph.value, ro: ph.readOnly, type: sp.options[sp.selectedIndex].textContent.trim(), labels: ['fPhylum', 'fSpecies', 'fSpecies2', 'fArtPosY'].map(i=> (document.querySelector(`label[for=${i}]`)||{}).textContent.trim()), species: readEditorFormIntoCard().species}; })()");
      ok(/Bird/.test(idf.phylum) && idf.ro && /Bird/.test(idf.type) && idf.species.join() === 'Bird', `@${w} Phylum (read only) and Type are separate fields ${JSON.stringify(idf)}`);
      ok(/Phylum/.test(idf.labels[0]) && /^Type$/.test(idf.labels[1]) && /Art height/.test(idf.labels[3]), `@${w} the labels are Phylum, Type, Art height`);
      await pg.selectOption('#fSpecies', 'Canid'); await pg.waitForTimeout(200);
      const idr = await pg.evaluate("({phylum: document.getElementById('fPhylum').value, shown: (()=>{ const sp = document.getElementById('fSpecies'); return sp.options[sp.selectedIndex].textContent.trim(); })()})");
      ok(/Beast/.test(idr.phylum) && /Canid/.test(idr.shown), `@${w} the Type is named as the preview names it and the Phylum follows (Beast) ${JSON.stringify(idr)}`);
      await open('abbey-goose');
      const h0 = await pg.evaluate("document.getElementById('cePreview').dataset.html");
      await pg.fill('#fArtPosY', '90'); await pg.waitForTimeout(500);
      const h1 = await pg.evaluate("document.getElementById('cePreview').dataset.html");
      ok(h0 !== h1 && /90/.test(h1.replace(h0, '|')), `@${w} Art height moves the preview`);

      // ---- 7 power
      // 2026-11-07 (BAL22): a card that was played in the test (abbey-goose if it has a number), and the run's date moved into the tooltip
      const pid = await pg.evaluate("CARD_POWER.wr['abbey-goose'] != null ? 'abbey-goose' : Object.keys(CARD_POWER.wr)[0]");
      await open(pid);
      const exp = await pg.evaluate(`(()=>{ const v = CARD_POWER.wr['${pid}'], n = Math.round(v - 50); return {n: n > 0 ? '+' + n : String(n), date: CARD_POWER.date}; })()`);
      const pw1 = await pg.evaluate("(document.querySelector('#ceBudget .ce-power')||{}).textContent");
      const pt1 = await pg.evaluate("(document.querySelector('#ceBudget .ce-power')||{}).title || ''");
      ok(pw1 && pw1.includes('Power: ' + exp.n) && pt1.includes(exp.date), `@${w} the editor shows "Power: ${exp.n}" and the run's date in its tooltip (${pw1})`);
      const fmt = await pg.evaluate("(()=>{ CARD_POWER.wr['__up'] = 62.4; CARD_POWER.wr['__zero'] = 50.2; CARD_POWER.wr['__down'] = 41; const t = id=> cePowerHTML({id}).replace(/<[^>]*>/g, '').trim(); return [t('__up'), t('__zero'), t('__down'), t('__nope'), t(undefined)]; })()");
      ok(/^Power: \+12\b/.test(fmt[0]) && /^Power: 0\b/.test(fmt[1]) && /^Power: -9\b/.test(fmt[2]) && fmt[3] === 'Power: not measured' && fmt[4] === 'Power: not measured', `@${w} +N / 0 / -N, and not measured ${JSON.stringify(fmt)}`);
      await open(null);
      ok(/not measured/.test(await pg.evaluate("(document.querySelector('#ceBudget .ce-power')||{}).textContent || ''")), `@${w} a new card reads not measured`);
      await pg.evaluate("closeCardEditor(); 1");
      ok(!(await pg.evaluate("!!document.querySelector('.ce-power')")), `@${w} no power line outside the editor`);

      // ---- 12 Codex skill list
      const bk = await pg.evaluate("(()=>{ adminModeEnabled = true; skillBookMemo = null; const l = skillBookEntriesNow().filter(e=> e.ch === 'sk' && !e.hint), seen = {}; l.forEach(e=>{ seen[e.name] = (seen[e.name] || 0) + 1; }); const t = l.find(e=> e.name === 'Tally'), g = l.find(e=> e.name === 'Throng'), td = l.find(e=> e.name === 'Tide'); return {dups: Object.keys(seen).filter(k=> seen[k] > 1), tally: t && t.html.replace(/<[^>]*>/g, ''), throng: g && g.key, tide: td && td.key, tideTxt: td && td.html.replace(/<[^>]*>/g, '')}; })()");
      ok(bk.dups.length === 0, `@${w} one Codex entry per skill (twice: ${bk.dups.join(', ') || 'none'})`);
      ok(bk.tally && /Thresholds: [\d, ]+\./.test(bk.tally) && /3 or more/.test(bk.tally) && bk.throng === 'throng' && bk.tide === 'tide' && /Flood/.test(bk.tideTxt) && /braces/.test(bk.tideTxt), `@${w} Tally lists its thresholds, Throng and Tide keep their plain keys (${bk.tally && bk.tally.slice(-60)})`);
      await ctx.close();
    }
  } finally { await b.close(); }
  errs.forEach(e=> ok(false, 'page error ' + e));
}
browser().then(()=>{ console.log(`ui24: ${n - fail}/${n} ok`); process.exit(fail ? 1 : 0); }).catch(e=>{ console.log('ui24 crashed', e); process.exit(1); });
