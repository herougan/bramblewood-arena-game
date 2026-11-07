#!/usr/bin/env node
// 2026-11-07 (package UI27, owner notes 11-07 08:54 #4 #5 #11 #12 #15 #16 and 09:01 #17):
//   4  the end-of-fight light (FX.B darkLeave's .fxb-spill) sits behind the results window, weaker, tinted by the fight's context
//   5  the Update loop: version.json and index.html carry the same build; Update loads a cache-busted URL and does not ask twice for one build
//   11 gated skills on cards the player can own before their unlock map are not "?" (UI25-1 b); Sonar / Keen Sense keep ENG28's gate unless owned
//   12 no "N cards to claim" chip; claiming an achievement shows its cards, then "N cards added"
//   15 while the tab is hidden (and just after), no effects start and no sound cue plays
//   16 the editor's budget box: "Within budget, B = x < y = N", the B and Product lines with formulas on hover, no parameters line, Base level
//      box after Rank (locked), the skill points row under Custom Triggers adding up to the budget's S
//   17 Previous / Next in the card editor (Codex order, Map cards order), on-page ask on unsaved changes, ← / → outside the fields
//   18 (09:47 note 9) one claim shows its cards in the middle of the screen; Claim all shows every card in one sequence, then one message
//   19 (09:47 note 12) the two-skill warning sits in the skill section, only when over 2; a skill counts 1, a light one 0.5; the sum on hover
// Static checks always run; the browser part (Playwright, Chromium) runs when index.html and Chromium are there, at 1366 and 390.
// Build first (python3 assemble_arena.py && mv bramblewood-arena.html index.html). Nothing leaves the page.
'use strict';
const fs = require('fs'), path = require('path');
const ROOT = path.join(__dirname, '..');
const read = f=> fs.readFileSync(path.join(ROOT, f), 'utf8');
let fail = 0, n = 0; const ok = (c, m)=>{ n++; if(!c){ fail++; console.log('  ✗', m); } };
const app = read('arena_app.js'), tpl = read('arena_template.html');
const CODES = ['fr', 'de', 'es', 'it', 'pt', 'tl', 'ta', 'id', 'zh-Hans', 'zh-Hant', 'ja', 'ko'];

// ---- static
const KEYS = ['ui.ui27-budget-ok', 'ui.ui27-budget-over', 'ui.ui27-budget-under', 'ui.ui27-budget-b-tip', 'ui.ui27-budget-product', 'ui.ui27-budget-product-tip', 'ui.ui27-budget-n-tip',
  'ui.ui27-s-tip', 'ui.ui27-base-level', 'ui.ui27-base-level-tip', 'ui.ui27-lvl', 'ui.ui27-new-card', 'ui.ui27-new-cards', 'ui.ui27-continue', 'ui.ui27-prev', 'ui.ui27-next', 'ui.ui27-nav-of',
  'ui.ui27-nav-unsaved', 'ui.ui27-nav-tip', 'ui.ui27-two-skills', 'ui.ui27-two-skills-tip'];
const {TEXT} = require(path.join(ROOT, 'bramblewood-texts.js'));
KEYS.forEach(k=>{ const en = TEXT[k]; ok(!!en, 'TX key ' + k);
  CODES.forEach(c=>{ const pack = JSON.parse(read('lang/' + c + '.json')), lk = en && en.replace(/^[^\w{]+/, ''); ok(en && pack[lk] && pack[lk] !== lk, `${c} translates "${lk}"`); }); });
ok(!TEXT['ui.ui25-achv-cards'] && CODES.every(c=> !('{n} card{s} to claim' in JSON.parse(read('lang/' + c + '.json')))), '#12 the retired "cards to claim" text is gone from the table and the packs');
ok(!/skills/i.test(['ui.ui27-budget-ok', 'ui.ui27-budget-over', 'ui.ui27-budget-under', 'ui.ui27-budget-product', 'ui.ui27-budget-b-tip', 'ui.ui27-budget-product-tip'].map(k=> TEXT[k]).join('|')), '#16 no "skills" in the budget formulas');
// 4
ok(/\.fxb\.fxb-dk:has\(> \.fxb-spill\)\{z-index:190 !important; opacity:var\(--ui27-fl-k\);\}/.test(tpl), '#4 the end light sits under the results (z 190 < .pass-overlay 200), at the context strength');
ok(['dark', 'pitch', 'absolute', 'night', 'dusk', 'sun', 'frost', 'grey'].every(k=> tpl.includes(`html[data-ui27-flash="${k}"]{`)), '#4 a tint per context');
ok(/function ui27FlashContext\(m, kind\)/.test(app) && /try\{ ui27FlashContext\(m, kind\); \}catch\(e\)\{\}/.test(app), '#4 the end sign names the context');
// 5
{ const v = JSON.parse(read('version.json')), html = read('index.html'), m = /const BUILD_ID = '([0-9a-f]+)'/.exec(html);
  ok(m && v.build === m[1], `#5 version.json's build (${v.build}) is index.html's (${m && m[1]}): a mismatched pair makes every page ask to update forever`); }
ok(/if\(ui27UpdateSettled\(v\.build\)\) return 'stale-stamp';/.test(app) && /versionBanner\('update', [^\n]*ui27GoUpdate\(v\.build\)\)/.test(app), '#5 the banner goes through the update guards');
ok(/u\.searchParams\.set\('v', serverBuild\)/.test(app) && /cache: 'reload'/.test(app) && /u\.searchParams\.delete\('v'\)/.test(app), '#5 Update loads a cache-busted URL and drops the parameter on load');
// 11
ok(/const UI27_KEEP_GATE = new Set\(\['sonar', 'keenSense'\]\);/.test(app) && /if\(ui27Ungated\(k\)\) return;/.test(app), '#11 the un-gate rule is in hiddenSkillSet; Sonar / Keen Sense keep their gate');
// 12
ok(!/ui\.ui25-achv-cards|wa-cards">/.test(app), '#12 no "cards to claim" chip on the results');
ok(/ui27AchvCardsPending\.push\(\.\.\.got\)/.test(app) && (app.match(/ui27RevealAchvCards\(\)/g) || []).length >= 2, '#12 Claim and Claim all show the cards');
// 15
ok(/function ac\(\)\{ return ui27Away\(\) \? null : acRaw\(\); \}/.test(app) && /function fxLevel\(\)\{ return ui27Away\(\) \? 'none' : fxLevelShown\(\); \}/.test(app), '#15 cues and effects are gated by ui27Away');
ok(/document\.documentElement\.dataset\.fx = fxLevelShown\(\)/.test(app), '#15 data-fx keeps the setting');
// 16
{ const i = app.indexOf('function ceBudgetHTML(d){'), body = app.slice(i, app.indexOf('\n}\n', i));
  ok(i > 0 && !/ui\.budget-line/.test(body) && /ui\.ui27-budget-ok/.test(body) && /bTip/.test(body) && /pTip/.test(body), '#16 the box: heading, B line, Product line, no parameters line'); }
ok(/id="fBaseLevel" disabled/.test(app), '#16 Base level box, locked');
ok(/<div id="ceSkillPts" class="ui27-spts"/.test(app), '#16 skill points row');
ok(app.includes('function cePowerHTML(d){') && /box\.innerHTML = ceBudgetHTML\(d\) \+ cePowerHTML\(d\);/.test(app), '#16 the Power line is still appended');
// 19
{ const i = app.indexOf('function ceBudgetHTML(d){'), body = app.slice(i, app.indexOf('\n}\n', i)); ok(!/sbNMultLine\(/.test(body), '#19 the budget box no longer carries the two-skill line'); }
ok(/<div id="ceSkillWarn" class="ui27-skwarn-row" hidden><\/div>/.test(app) && app.includes("const UI27_LIGHT_SKILLS = ['flying', 'tide', 'diurnal', 'nocturnal', 'crepuscular', 'sunshy', 'nightblind', 'purblind'];"), '#19 the warning row in the skill section; the light list');
// 17
ok(/ceNavSet\(codexNavIds, 'codex'\)/.test(app) && /ceNavSet\(order, 'mapcards'\)/.test(app), '#17 Codex and Map cards hand the editor their order');
ok(!/function pk1OpenMapCards[\s\S]{0,4000}ceNav/.test(app.slice(app.indexOf('function pk1OpenMapCards'), app.indexOf('function pk1OpenMapCards') + 4200)), '#17 pk1OpenMapCards itself is untouched (UI28 edits it)');
ok(/^## 2026-11-07[^\n]*UI27/m.test(read('docs/CHANGELOG.md')), 'CHANGELOG entry');
ok(/tests\/ui27-2026-11-07\.js/.test(read('tests/run-all.sh')), 'in run-all.sh');
ok(/^## 11-07: Package UI27 \(on its branch, not released\)/m.test(read('docs/action-items.md')), 'action-items section');

async function browser(){
  let pw; try{ pw = require('playwright'); }catch(e){ console.log('  (browser part skipped: no playwright)'); return; }
  const EXE = process.env.BW_CHROMIUM || '/opt/pw-browsers/chromium_headless_shell-1194/chrome-linux/headless_shell';
  if(!fs.existsSync(EXE) || !fs.existsSync(path.join(ROOT, 'index.html'))){ console.log('  (browser part skipped: no Chromium or index.html)'); return; }
  const URL = 'file://' + path.join(ROOT, 'index.html');
  const INIT = "localStorage.setItem('bramblewood_arena_tutorial_done','1'); localStorage.setItem('bramblewood_tutorial2_done_v1','1'); localStorage.setItem('bramblewood_world_open_v1','1'); sessionStorage.setItem('bramblewood_seen_splash','1');";
  const SHOTS = path.join(ROOT, 'docs', 'screens', 'ui27'); fs.mkdirSync(SHOTS, {recursive: true});
  const b = await pw.chromium.launch({executablePath: EXE});
  const errs = [];
  try{
    for(const w of [1366, 390]){
      const ctx = await b.newContext({viewport:{width:w, height: w < 500 ? 844 : 900}, hasTouch: false});
      await ctx.route('**/*', r=> r.request().url().startsWith('file:') ? r.continue() : r.abort());
      const pg = await ctx.newPage(); pg.on('pageerror', e=> errs.push(`@${w}: ` + String(e)));
      await pg.addInitScript(INIT); await pg.goto(URL, {waitUntil:'domcontentloaded', timeout:90000}); await pg.waitForTimeout(2500);
      await pg.addStyleTag({content: '.toast, .toast-host, #toastHost, .xp-float, #signInBanner{display:none !important;}'});

      // ---- 11 (before admin mode, which shows every skill)
      const g = await pg.evaluate("(()=>{ const s = [...ui27UngatedSkills()].sort(), h = [...hiddenSkillSet()]; return {s, h, tide: skillHiddenNow('tide'), sonar: skillHiddenNow('sonar'), far: furthestMapReached()}; })()");
      // UI25 counted 17 with the unobtainable cards (cardObtainMap 0); Frostbite, Fire Arrow, Molting and Stem sit early only on cards no one can own
      ok(['nocturnal', 'tide', 'evasive', 'delivery', 'diurnal', 'taunt', 'inspiring', 'esprit', 'crepuscular', 'keenEye', 'reach', 'chrysalis'].every(k=> g.s.includes(k)), `@${w} #11 the skills on cards owned before their map are un-gated (${g.s.join(', ')})`);
      ok(['frostbite', 'fireArrow', 'molting', 'stem'].every(k=> !g.s.includes(k)), `@${w} #11 skills whose early cards can't be owned keep their gate`);
      ok(!g.s.includes('sonar') && !g.s.includes('keenSense'), `@${w} #11 Sonar / Keen Sense keep ENG28's gate`);
      ok(g.far < 1 && !g.tide && g.sonar, `@${w} #11 on a fresh save Tide reads as itself, Sonar is still "?" (hidden: ${g.h.join(', ')})`);
      const own = await pg.evaluate("(()=>{ const defs = Object.assign({}, CARD_DEFS_BASELINE, liveCards), id = Object.keys(defs).find(k=> defs[k].effects && defs[k].effects.sonar && !defs[k].token && !defs[k].test); if(!id) return null; grantCardCopy(id, {}); skillRevealMemo = null; return {id, hidden: skillHiddenNow('sonar')}; })()").catch(e=> ({err: String(e)}));
      ok(own && !own.err && own.hidden === false, `@${w} #11 owning a Sonar card shows Sonar (${JSON.stringify(own)})`);

      await pg.evaluate("adminModeEnabled = true; document.body.classList.toggle('is-admin', true); 1");
      const open = async id=>{ await pg.evaluate(`closeCardEditor(); openCardEditor(${id ? `'${id}'` : ''})`); await pg.waitForTimeout(700); };

      // ---- 16 the budget box: a card with a priced skill of the value x N^p form, when there is one
      const cid = await pg.evaluate(`(()=>{ const T = sbCanon(), defs = getCardDefs(); const ids = Object.keys(CARD_DEFS_BASELINE).filter(id=> defs[id] && defs[id].attack != null && !defs[id].token && !defs[id].test);
        const has = id=>{ try{ return (T.cardS(defs[id].effects || {}, defs[id]).parts || []).some(p=> p[0] === 'skill' && !p[3] && /\\^/.test(ui27PartTerm(p, defs[id].effects))); }catch(e){ return false; } };
        return ids.find(id=> has(id) && Object.keys(defs[id].effects || {}).length >= 2) || ids.find(has) || 'abbey-goose'; })()`);
      await open(cid);
      const bx = await pg.evaluate(`(()=>{ const box = document.getElementById('ceBudget'), d = editorDraftFromForm(), cfg = sbLoad(), S = sbPriceS(d, cfg).S, N = sbBudgetAt(d, cfg, 1),
          c = sbCheck(Number(d.attack)||0, Number(d.health)||0, S, N, sbMissMult(d, cfg), sbFragileUse(d, cfg), sbShieldH(d)), f1 = v=> Math.round(v * 10) / 10;
        const head = box.querySelector('.ui27-bhead'), bl = box.querySelector('.ui27-bline'), pl = box.querySelector('.ui27-pline'), sp = document.getElementById('ceSkillPts');
        let sum = null; try{ sum = [...sp.querySelectorAll('.ui27-sterm')].reduce((t, el, i, a)=>{ const prev = el.previousSibling, neg = prev && /−/.test(prev.textContent || ''); const v = Function('return ' + el.textContent.replace(/×/g, '*').replace(/\\^/g, '**'))(); return t + (neg ? -v : v); }, 0); }catch(e){ sum = 'err ' + e; }
        const bl0 = document.getElementById('fBaseLevel');
        return {head: head && head.textContent, headTip: head && head.title, b: bl && bl.textContent, bTip: bl && bl.title, p: pl && pl.textContent, pTip: pl && pl.title, all: box.textContent,
          x1: f1(c.x1), n: f1(N), ok: c.ok, S: Math.round(S * 100) / 100, sp: sp && sp.textContent, sum, base: bl0 && {dis: bl0.disabled, txt: bl0.options[bl0.selectedIndex].textContent, lv: cardBaseLevel(d), after: !!(bl0.closest('.field') && bl0.closest('.field').previousElementSibling && bl0.closest('.field').previousElementSibling.querySelector('#fRarity'))},
          power: !!box.querySelector('.ce-power')}; })()`);
      ok(new RegExp('^\\s*(⚖️\\s*)?(Within budget|Over budget|Well under budget), B = ' + bx.x1.toString().replace('.', '\\.') + ' [<=>] ' + bx.n.toString().replace('.', '\\.') + ' = N$').test(bx.head || ''), `@${w} #16 heading "${bx.head}" (B ${bx.x1}, N ${bx.n})`);
      ok(/N = /.test(bx.headTip) && /Base = /.test(bx.headTip), `@${w} #16 the heading's hover has N's formula and Base (${bx.headTip})`);
      ok(/^B = .* = [\d.]+ [✓✗]$/.test(bx.b || '') && (bx.b || '').includes('= ' + bx.x1 + ' ') && /3A \+ H/.test(bx.bTip) && /S: /.test(bx.bTip), `@${w} #16 the B line "${bx.b}" with its symbols on hover`);
      ok(/^Product: .* [<=>] [\d.]+ [✓✗]$/.test(bx.p || '') && /A × H × m/.test(bx.pTip), `@${w} #16 the Product line "${bx.p}" with its symbols on hover`);
      ok(!/\bskills\b/i.test(bx.all) && !/Level 1 ·|Wait \d+ · Lumber/.test(bx.all), `@${w} #16 no "skills" word, no parameters line`);
      ok(bx.power, `@${w} #16 the Power line stays`);
      ok(bx.base && bx.base.dis && bx.base.txt === 'Lvl ' + bx.base.lv && bx.base.after, `@${w} #16 Base level after Rank, locked, "Lvl ${bx.base && bx.base.lv}"`);
      ok(new RegExp('= ' + String(bx.S).replace('.', '\\.') + ' = S$').test(bx.sp || '') && typeof bx.sum === 'number' && Math.abs(bx.sum - bx.S) < 0.06, `@${w} #16 the skill points add up to the budget's S (${cid}: "${bx.sp}", terms ${bx.sum}, S ${bx.S})`);
      { const el = await pg.$('#ceBudget'); if(el) await el.screenshot({path: path.join(SHOTS, `editor-budget-${w}.png`)}); }
      await pg.evaluate("document.getElementById('ceSkillPts').scrollIntoView({block:'center'}); 1"); await pg.waitForTimeout(200);
      { const el = await pg.$('#ceSkillPts'); if(el) await el.screenshot({path: path.join(SHOTS, `editor-skillpts-${w}.png`)}); }
      await pg.evaluate("document.querySelector('#editorOverlay .modal').scrollTop = 0; 1"); await pg.waitForTimeout(200);
      await pg.screenshot({path: path.join(SHOTS, `editor-top-${w}.png`)});

      // ---- 19 the two-skill warning
      const sw = await pg.evaluate(`(()=>{ const a = ui27SkillCount({flying:true, tide:true, cleave:3}), b = ui27SkillCount({flying:true, cleave:3, armor:2}), c = ui27SkillCount({tide:true, tideGrant:{armor:1}, cleave:3, armor:1});
        const h = ceSkillWarnHTML({effects:{flying:true, cleave:3, armor:2}}), el = document.getElementById('ceSkillWarn'), sec = el && el.closest('.section-divider');
        return {a: a.n, b: b.n, c: c.n, none: ceSkillWarnHTML({effects:{flying:true, tide:true, cleave:3}}), h, rowHidden: el && el.hidden, inSkills: !!(sec && sec.querySelector('#triggerRows')), boxWarn: /two at most|skills count/i.test((document.getElementById('ceBudget')||{}).textContent || '')}; })()`);
      ok(sw.a === 2 && sw.b === 2.5 && sw.c === 3 && sw.none === '', `@${w} #19 a skill 1, a plain light one 0.5, Tide with braces 1; at 2 no warning (${JSON.stringify(sw).slice(0, 200)})`);
      ok(/Over the two-skill limit \(2\.5\)/.test(sw.h) && /Flying 0\.5 \+ \w+ 1 \+ Armor 1 = 2\.5/i.test(sw.h), `@${w} #19 "Over the two-skill limit (2.5)", the sum on hover (${sw.h})`);
      ok(sw.rowHidden === true && sw.inSkills && !sw.boxWarn, `@${w} #19 the row sits in the skill section, hidden for a card within the rule; no skill-count line in the budget box`);
      await pg.evaluate("(()=>{ const r = document.getElementById('ceSkillWarn'); r.innerHTML = ceSkillWarnHTML({effects:{flying:true, cleave:3, armor:2}}); r.hidden = false; r.scrollIntoView({block:'center'}); })()"); await pg.waitForTimeout(200);
      { const el = await pg.$('#ceSkillWarn'); if(el) await el.screenshot({path: path.join(SHOTS, `editor-skillwarn-${w}.png`)}); }

      // ---- 17 Previous / Next
      const ids = await pg.evaluate("Object.keys(CARD_DEFS_BASELINE).filter(id=> !CARD_DEFS_BASELINE[id].token && CARD_DEFS_BASELINE[id].attack != null).slice(0, 3)");
      await pg.evaluate(`closeCardEditor(); ceNavSet(${JSON.stringify(ids)}, 'mapcards'); openCardEditor('${ids[0]}'); 1`); await pg.waitForTimeout(800);
      const nv0 = await pg.evaluate("({prev: !!document.querySelector('[data-ce-nav=\"-1\"]:disabled'), next: !!document.querySelector('[data-ce-nav=\"1\"]:not(:disabled)'), pos: (document.querySelector('.ui27-nav-pos')||{}).textContent})");
      ok(nv0.prev && nv0.next && nv0.pos === '1 of 3', `@${w} #17 the first card: Previous off, Next on, "1 of 3" (${JSON.stringify(nv0)})`);
      await pg.click('[data-ce-nav="1"]'); await pg.waitForTimeout(800);
      ok(await pg.evaluate(`editingCard && editingCard.id === '${ids[1]}'`), `@${w} #17 Next opens the next card`);
      await pg.fill('#fName', 'Changed name UI27'); await pg.waitForTimeout(200);
      await pg.click('[data-ce-nav="-1"]'); await pg.waitForTimeout(300);
      const armed = await pg.evaluate("({id: editingCard.id, txt: document.querySelector('[data-ce-nav=\"-1\"]').textContent, cls: document.querySelector('[data-ce-nav=\"-1\"]').classList.contains('is-armed')})");
      ok(armed.id === ids[1] && armed.cls && /Unsaved changes/.test(armed.txt), `@${w} #17 unsaved changes: the first tap asks on the page (${JSON.stringify(armed)})`);
      if(w === 390) await pg.screenshot({path: path.join(SHOTS, `editor-nav-armed-${w}.png`)});
      await pg.click('[data-ce-nav="-1"]'); await pg.waitForTimeout(800);
      ok(await pg.evaluate(`editingCard.id === '${ids[0]}' && document.getElementById('fName').value !== 'Changed name UI27'`), `@${w} #17 the second tap leaves; nothing typed is carried over`);
      await pg.focus('#fName'); await pg.keyboard.press('ArrowRight'); await pg.waitForTimeout(400);
      ok(await pg.evaluate(`editingCard.id === '${ids[0]}'`), `@${w} #17 → inside a text field does not move`);
      await pg.evaluate("document.activeElement && document.activeElement.blur(); document.querySelector('#editorOverlay .modal').focus(); 1");
      await pg.evaluate("document.getElementById('editorOverlay').dispatchEvent(new KeyboardEvent('keydown', {key:'ArrowRight', bubbles:true})); 1"); await pg.waitForTimeout(800);
      ok(await pg.evaluate(`editingCard.id === '${ids[1]}'`), `@${w} #17 → outside the fields opens the next card`);
      await pg.evaluate("closeCardEditor(); openCardEditor('abbey-goose'); 1"); await pg.waitForTimeout(500);
      ok(await pg.evaluate("!document.querySelector('.ui27-nav') && ceNav === null"), `@${w} #17 opened from elsewhere: no Previous / Next`);
      const cx = await pg.evaluate(`(async ()=>{ closeCardEditor(); try{ FEATURE_SPOTS.forEach(sp=> unlockFeature(sp.key)); }catch(e){} switchTab('codex'); await new Promise(r=> setTimeout(r, 2500)); const list = codexNavIds.slice(); if(list.length < 3) return {n: list.length};
        openCardDetail(list[1], {codex:true}); await new Promise(r=> setTimeout(r, 600)); const eb = document.getElementById('cdEditBtn'); if(!eb) return {n: list.length, noEdit: true}; eb.click(); await new Promise(r=> setTimeout(r, 800));
        return {n: list.length, same: !!ceNav && ceNav.from === 'codex' && ceNav.ids.length === list.length && ceNav.ids[1] === list[1], id: editingCard && editingCard.id, want: list[1], pos: (document.querySelector('.ui27-nav-pos')||{}).textContent}; })()`);
      ok(cx.same && cx.id === cx.want && cx.pos === '2 of ' + cx.n, `@${w} #17 from the Codex: its order (${JSON.stringify(cx)})`);
      await pg.evaluate("closeCardEditor(); switchTab('home'); 1");

      // ---- 5 the update guards
      const up = await pg.evaluate(`(()=>{ const K = UI27_UPDATE_KEY, I = UI27_UPDATE_IGNORE, now = Date.now(), set = r=> sessionStorage.setItem(K, JSON.stringify(r)), out = {};
        sessionStorage.removeItem(I); sessionStorage.removeItem(K); out.none = ui27UpdateSettled('zzz');
        set({to:'zzz', from: BUILD_ID, at: now, tries: 1}); out.sameTry1 = ui27UpdateSettled('zzz');
        set({to:'zzz', from: 'old0build', at: now, tries: 1}); out.changed = ui27UpdateSettled('zzz'); out.ignored = sessionStorage.getItem(I) === 'zzz';
        sessionStorage.removeItem(I); set({to:'zzz', from: BUILD_ID, at: now, tries: 2}); out.twice = ui27UpdateSettled('zzz');
        sessionStorage.removeItem(I); sessionStorage.removeItem(K); out.other = ui27UpdateSettled('yyy'); return out; })()`);
      ok(up.none === false && up.sameTry1 === false && up.changed === true && up.ignored && up.twice === true && up.other === false, `@${w} #5 asks for a new build; not again once this tab updated for it (${JSON.stringify(up)})`);

      // ---- 15 away
      const aw = await pg.evaluate(`(async ()=>{ const out = {}; out.before = fxLevel(); Object.defineProperty(document, 'hidden', {configurable:true, get:()=> true});
        out.hidden = {fx: fxLevel(), low: fxAtLeast('low'), away: ui27Away(), raw: !!SoundKit.audioContext(), dataFx: document.documentElement.dataset.fx};
        Object.defineProperty(document, 'hidden', {configurable:true, get:()=> false}); document.dispatchEvent(new Event('visibilitychange'));
        out.back = {fx: fxLevel(), away: ui27Away()}; await new Promise(r=> setTimeout(r, UI27_BACK_MS + 150)); out.later = {fx: fxLevel(), away: ui27Away()}; return out; })()`);
      ok(aw.before !== 'none' && aw.hidden.fx === 'none' && !aw.hidden.low && aw.hidden.away && aw.hidden.dataFx === aw.before, `@${w} #15 hidden: Effects count as None, the setting stays (${JSON.stringify(aw.hidden)})`);
      ok(aw.back.away && aw.back.fx === 'none' && !aw.later.away && aw.later.fx === aw.before, `@${w} #15 back: a short grace, then as before (${JSON.stringify(aw)})`);

      // ---- 12 achievement cards: the still reveal (Effects None), then the message
      const ac = await pg.evaluate(`(async ()=>{ const toasts = []; const st = window.showToast; window.showToast = (m, k)=>{ toasts.push(m); }; try{ localStorage.setItem(FX_KEY, 'none'); }catch(e){}
        const id = Object.keys(getCardDefs()).find(k=> !getCardDefs()[k].token && getCardDefs()[k].attack != null); ui27AchvCardsPending.push(id);
        const p = ui27RevealAchvCards(); await new Promise(r=> setTimeout(r, 300)); const ov = document.querySelector('.ui27-cards-ov'), before = toasts.length;
        const tiles = ov ? ov.querySelectorAll('.card-tile').length : 0; if(ov) ov.querySelector('[data-ui27-ok]').click(); const nAdded = await p; window.showToast = st; try{ localStorage.removeItem(FX_KEY); }catch(e){}
        return {ov: !!ov, tiles, before, after: toasts, nAdded}; })()`);
      const ca = await pg.evaluate(`(async ()=>{ const toasts = []; const st = window.showToast; window.showToast = (m, k)=>{ toasts.push(m); }; try{ localStorage.setItem(FX_KEY, 'none'); }catch(e){}
        const ids = Object.keys(getCardDefs()).filter(k=> !getCardDefs()[k].token && getCardDefs()[k].attack != null).slice(0, 3); ui27AchvCardsPending.push(ids[0]); ui27AchvCardsPending.push(ids[1], ids[2]); /* two achievements' cards, as Claim all gathers them */
        const p = ui27RevealAchvCards(); await new Promise(r=> setTimeout(r, 300)); const ovs = document.querySelectorAll('.ui27-cards-ov'), tiles = ovs[0] ? ovs[0].querySelectorAll('.card-tile').length : 0;
        if(ovs[0]) ovs[0].querySelector('[data-ui27-ok]').click(); await p; await new Promise(r=> setTimeout(r, 200)); const again = document.querySelectorAll('.ui27-cards-ov').length; window.showToast = st; try{ localStorage.removeItem(FX_KEY); }catch(e){}
        return {n: ovs.length, tiles, again, toasts}; })()`);
      ok(ca.n === 1 && ca.tiles === 3 && ca.again === 0 && ca.toasts.length === 1 && /3 cards/.test(ca.toasts[0]), `@${w} #18 Claim all: every card in one reveal, then one "3 cards added" (${JSON.stringify(ca)})`);
      ok(/playRewardReveal\(\{rewardCardIds: got\}\)/.test(await pg.evaluate("String(ui27RevealAchvCards)")), `@${w} #18 with effects on, the cards use the won-card reveal (playRewardReveal, centred)`);
      ok(ac.ov && ac.tiles === 1 && ac.before === 0 && ac.nAdded === 1 && ac.after.length === 1 && /1 card/.test(ac.after[0]), `@${w} #12 the card shows first, then "1 card added" (${JSON.stringify(ac)})`);

      // ---- 4 the end light under the results window
      const fl = await pg.evaluate(`(async ()=>{ const ov = document.createElement('div'); ov.className = 'pass-overlay winloss-overlay'; ov.innerHTML = '<div class="pass-card winloss-card">results</div>'; document.body.appendChild(ov);
        document.documentElement.dataset.ui27Flash = 'pitch'; document.documentElement.dataset.ui27FlashRes = 'victory';
        const host = document.createElement('div'); host.style.cssText = 'position:fixed; left:0; top:0; width:100vw; height:60vh;'; document.body.appendChild(host);
        const pr = FX.B.darkLeave(host, {level:'pitch'}); await new Promise(r=> setTimeout(r, 150)); const dk = document.querySelector('.fxb.fxb-dk:has(> .fxb-spill)');
        const out = {dk: !!dk, z: dk && getComputedStyle(dk).zIndex, op: dk && Number(getComputedStyle(dk).opacity), top: (document.elementFromPoint(innerWidth/2, 8) || {}).className || '', bg: dk && getComputedStyle(dk.querySelector('.fxb-spill')).backgroundImage};
        await pr; ov.remove(); host.remove(); return out; })()`);
      ok(fl.dk && Number(fl.z) < 200 && fl.op > 0 && fl.op <= 0.3 && /pass-overlay/.test(fl.top) && /rgba\(170, 180, 240/.test(fl.bg || ''), `@${w} #4 under the results, faint and cool in Pitch Black (${JSON.stringify(fl).slice(0, 300)})`);
      await ctx.close();
    }
  } finally { await b.close(); }
  errs.forEach(e=> ok(false, 'page error ' + e));
}
browser().then(()=>{ console.log(`ui27: ${n - fail}/${n} ok`); process.exit(fail ? 1 : 0); }).catch(e=>{ console.log('ui27 crashed', e); process.exit(1); });
