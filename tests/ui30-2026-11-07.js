#!/usr/bin/env node
// 2026-11-07 (package UI30, owner 09:47 notes #1 #2 #3 #7 #10 #14 #16):
//   #1  a settings change shows exactly one toast (renderHUD re-wired the fight's Settings panel on every refresh: 3 refreshes = 3 toasts)
//   #2  Poison and Bleed pips: no number; each counter that goes ticks the pip; only the last (1 -> 0) pops the greyed pip out; Effects None: no tick
//   #3  the quake line under a falling bramble: 0.8x the card's width, centred on it (it sat at the screen's top-left: GSAP never moved the outer <svg>)
//   #7  Tribe Delivery: one 📦 pip
//   #10 the Codex page leaf sits on the page it copies (it flowed in under the book); 15% faster (460 -> 390 ms)
//   #14 Poison Barbs 🌵☠️
//   #16 the Map cards window: a "Sugg. Intro" pill on Claude's picks per main map (canonical/map-intro-suggestions.json, baked in as __MAP_INTRO_SUGG__)
// Static checks always run; the browser part runs when index.html and Chromium are there, at 1366 and 390. Build first. Nothing leaves the page.
'use strict';
const fs = require('fs'), path = require('path');
const ROOT = path.join(__dirname, '..');
const read = f=> fs.readFileSync(path.join(ROOT, f), 'utf8');
let fail = 0, n = 0; const ok = (c, m)=>{ n++; if(!c){ fail++; console.log('  ✗', m); } };
const app = read('arena_app.js'), tpl = read('arena_template.html'), fxc = read('bramblewood-fx-c.js'), fxd = read('bramblewood-fx-d.js');
const CODES = ['fr', 'de', 'es', 'it', 'pt', 'tl', 'ta', 'id', 'zh-Hans', 'zh-Hant', 'ja', 'ko'];
const fn = (src, name)=>{ const i = src.indexOf('function ' + name + '('); if(i < 0) return ''; let d = 0; const j = src.indexOf('{', i); for(let k = j; k < src.length; k++){ if(src[k] === '{') d++; else if(src[k] === '}' && --d === 0) return src.slice(i, k + 1); } return ''; };

// ---- texts
const KEYS = ['ui.ui30-sugg-intro', 'ui.ui30-sugg-intro-tip', 'ui.ui30-sugg-missing', 'ui.ui30-bleed-tip'];
const {TEXT} = require(path.join(ROOT, 'bramblewood-texts.js'));
KEYS.forEach(k=>{ const en = TEXT[k]; ok(!!en, 'TX key ' + k);
  CODES.forEach(c=>{ const pack = JSON.parse(read('lang/' + c + '.json')); ok(en && pack[en] && pack[en] !== en, `${c} translates "${en}"`); }); });
ok(TEXT['ui.ui30-sugg-intro'] === 'Sugg. Intro' && /\{n\}/.test(TEXT['ui.ui30-bleed-tip']), 'the pill reads "Sugg. Intro"; the Bleed tooltip has the count');

// ---- #1 one toast per change
{ const w = fn(app, 'wireSettingsButton');
  ok(/panel\.dataset\.ui30Wired === '1'/.test(w) && /panel\.dataset\.ui30Wired = '1'/.test(w) && w.indexOf('ui30Wired') < w.indexOf('const sliders'), '#1 a panel is wired once (before any listener is added)'); }

// ---- #2 pips
{ const src = fn(app, 'ui7PoisonChip') + fn(app, 'ui30BleedChip') + fn(app, 'ui30TickOn') + fn(app, 'ui30TickCls') + fn(app, 'ui30StackTick') + fn(app, 'ui30StackGo');
  ok(src.length > 400, '#2 the pip helpers exist');
  let level = 'high', reduced = false; const calls = [];
  const H = new Function('TX', 'escapeAttr', 'fxLevel', 'reducedMotion', 'boardCardEl', 'bleedFadeDropVfx', 'updateCardStatusDisplay', 'window', 'FX',
    'var UI30_TICK = {};\n' + src + '\nreturn {ui7PoisonChip, ui30BleedChip, ui30TickCls, ui30StackGo, UI30_TICK};')(
    (k, v)=> k + JSON.stringify(v || {}), s=> String(s), ()=> level, ()=> reduced, ()=> null,
    uid=> calls.push('drop:bleed:' + uid), uid=> calls.push('update:' + uid), {FX: {D: {poisonDrop: ()=> calls.push('drop:poison')}}}, {D: {poisonDrop: ()=> calls.push('drop:poison')}});
  const p3 = H.ui7PoisonChip({uid: 1, poison: 3}), b2 = H.ui30BleedChip({uid: 2, bleed: 2});
  ok(/>☠<\/span>$/.test(p3) && !/has-n/.test(p3) && /"n":3/.test(p3), '#2 Poison 3: the icon alone, the count in the tooltip');
  ok(/>🩸<\/span>$/.test(b2) && /ui30-bleed-tip/.test(b2) && /"n":2/.test(b2), '#2 Bleed 2: the icon alone, the count in the tooltip');
  calls.length = 0; H.ui30StackGo(2, 'bleed', 1); ok(calls.join() === 'update:2', '#2 a counter goes (2 -> 1): redraw and tick, no drop');
  ok(/ui30-tick/.test(H.ui30BleedChip({uid: 2, bleed: 1})), '#2 a pip rebuilt right after the tick keeps the tick class');
  calls.length = 0; H.ui30StackGo(2, 'bleed', 0); ok(calls.join() === 'drop:bleed:2,update:2', '#2 the last counter (1 -> 0): the greyed pip drops first, then the redraw');
  calls.length = 0; level = 'none'; H.ui30StackGo(3, 'bleed', 0); ok(calls.join() === 'update:3', '#2 Effects None: no drop');
  H.ui30StackGo(4, 'poison', 2); ok(!/ui30-tick/.test(H.ui7PoisonChip({uid: 4, poison: 2})), '#2 Effects None: no tick'); level = 'high';
  reduced = true; H.ui30StackGo(5, 'poison', 2); ok(!/ui30-tick/.test(H.ui7PoisonChip({uid: 5, poison: 2})), '#2 reduced motion: no tick'); reduced = false;
  ok((app.match(/badges\.push\(ui30BleedChip\(c\)\)/g) || []).length === 2 && !/abadge bleed">🩸\$\{c\.bleed\}/.test(app), '#2 both badge paths use the numberless Bleed pip');
  ok(/ui30StackGo\(u, 'poison', left\)/.test(app) && /ui30StackGo\(ev\.uid, 'bleed', Math\.max\(0, ev\.left\|0\)\)/.test(app), '#2 the poison wear-down and the Bleed fade go through ui30StackGo');
  ok(/opts\.pip \? '<b>☠<\/b>'/.test(fxd), '#2 FX.D.poisonDrop({pip:true}) drops the greyed ☠ alone');
  ok(/\.abadge\.ui30-tick\{animation:ui30PipTick/.test(tpl) && /html\[data-fx="none"\] \.abadge\.ui30-tick\{animation:none/.test(tpl), '#2 CSS: the tick, off at Effects None'); }

// ---- #3 quake line
{ const cs = fxc.slice(fxc.indexOf('M.castleSink = function'), fxc.indexOf('M.CASTLE_SINK_MS'));
  ok(/const cw = w\*\.8/.test(cs) && /left:\$\{\(c\.x - cw\/2\)/.test(cs) && !/tl\.set\(sv, \{x:/.test(cs), '#3 the crack is 0.8x wide and placed with left / top on the bramble\'s centre'); }

// ---- #7, #14
ok(!/CHIP_FALLBACK_SKILLS\.push\('immortal', 'hydra', 'tribeDelivery'\)/.test(app), '#7 Tribe Delivery is off the fallback chip list (its 📦 is the Delivery pip)');
ok(/poisonBarbs:'🌵☠️'/.test(app), '#14 Poison Barbs 🌵☠️');

// ---- #10 codex leaf
ok(/\.pg-leaf\{position:absolute !important;[^}]*animation:pgLeafFwd 390ms/.test(tpl) && /pgLeafShade 390ms/.test(tpl) && /position: 'absolute', left: x \+ 'px'/.test(fn(app, 'codexLeafTurn')), '#10 the leaf is absolute (inline and !important) and runs 390 ms');

// ---- #16 suggestions data + placeholder
const SUG = JSON.parse(read('canonical/map-intro-suggestions.json')).suggestions;
ok(/sub_once\(app_src, "__MAP_INTRO_SUGG__", json\.dumps\(json\.load\(open\(SCRATCH \+ "canonical\/map-intro-suggestions\.json"/.test(read('assemble_arena.py')), '#16 assemble_arena.py bakes the file in');
ok(/const MAP_INTRO_SUGG = __MAP_INTRO_SUGG__;/.test(app), '#16 the placeholder');
{ const all = Object.values(SUG).flat(); const keys = all.map(e=> e.skill);
  ok(Object.keys(SUG).length >= 25 && all.every(e=> e.skill && e.why), `#16 every pick has a skill and a why (${Object.keys(SUG).length} maps)`);
  ok(new Set(keys).size === keys.length, '#16 no skill is suggested twice along the road');
  const kw = JSON.parse(read('canonical/map-keywords.json')).keywords; ok(Object.keys(SUG).every(m=> !SUG[m].some(e=> e.skill === kw[m])), '#16 no pick repeats the map\'s own intro keyword'); }
{ const hs = fn(app, 'ui19McSkillsHTML');
  ok(/typeof ui30McSugg === 'function'/.test(hs) && /typeof ui30SuggTilesHTML === 'function'/.test(hs) && (hs.match(/\$\{sp\(/g) || []).length === 3, '#16 the pill on skill, keyword and recommendation tiles, and the missing-pick tiles (guarded)');
  const H = new Function('MAP_INTRO_SUGG', 'mpIsSub', 'skillDefOf', 'TX', 'escapeAttr', 'escapeHtml', 'ui19McSkillText', 'SKILL_ICON', fn(app, 'ui30McSugg') + fn(app, 'ui30SuggPillHTML') + fn(app, 'ui30SuggTilesHTML') + 'return {ui30McSugg, ui30SuggPillHTML, ui30SuggTilesHTML};')(
    {m1: [{skill: 'guardian', why: 'w1'}, {skill: 'gone', why: 'x'}], m4: [{skill: 'sonar', why: 'w2'}]}, id=> id === 'mo', k=> k === 'gone' ? null : {label: k.toUpperCase()}, k=> k, s=> String(s), s=> String(s), ()=> 'text', {sonar: '📡'});
  const s1 = H.ui30McSugg('m1'); ok(s1.size === 1 && s1.get('guardian') === 'w1', '#16 a map\'s picks (a skill with no row is dropped)');
  ok(H.ui30McSugg('mo').size === 0 && H.ui30McSugg(null).size === 0, '#16 a sub-map has none');
  ok(/class="ui30-sugg"[^>]*>ui\.ui30-sugg-intro</.test(H.ui30SuggPillHTML('guardian', s1)) && /w1/.test(H.ui30SuggPillHTML('guardian', s1)) && H.ui30SuggPillHTML('quick', s1) === '', '#16 the pill (its why in the tooltip) only on a pick');
  const s4 = H.ui30McSugg('m4'); ok(/data-ui30-sugg="1"/.test(H.ui30SuggTilesHTML(s4, new Set())) && /📡/.test(H.ui30SuggTilesHTML(s4, new Set())) && H.ui30SuggTilesHTML(s4, new Set(['sonar'])) === '', '#16 a pick no tile shows gets its own tile; one already shown does not'); }
ok(/\.ui30-sugg\{/.test(tpl), '#16 CSS: the pill');
ok(/^## 2026-11-07[^\n]*UI30/m.test(read('docs/CHANGELOG.md')), 'CHANGELOG entry');
ok(/tests\/ui30-2026-11-07\.js/.test(read('tests/run-all.sh')), 'in run-all.sh');
ok(/^## 11-07: Package UI30 \(on its branch, not released\)/m.test(read('docs/action-items.md')), 'action-items section');

async function browser(){
  let pw; try{ pw = require('playwright'); }catch(e){ console.log('  (browser part skipped: no playwright)'); return; }
  const EXE = process.env.BW_CHROMIUM || '/opt/pw-browsers/chromium_headless_shell-1194/chrome-linux/headless_shell';
  if(!fs.existsSync(EXE) || !fs.existsSync(path.join(ROOT, 'index.html'))){ console.log('  (browser part skipped: no Chromium or index.html)'); return; }
  const URL = 'file://' + path.join(ROOT, 'index.html');
  const INIT = "localStorage.setItem('bramblewood_arena_tutorial_done','1'); localStorage.setItem('bramblewood_tutorial2_done_v1','1'); localStorage.setItem('bramblewood_world_open_v1','1'); sessionStorage.setItem('bramblewood_seen_splash','1');"
    + "localStorage.setItem('bramblewood_coach_seen', JSON.stringify(['wait','lumber','leader','handLimit','g-peek','skill-flying']));";
  const OWN = "try{ skipTriggerLesson(); }catch(e){} FEATURE_SPOTS.forEach(sp=> unlockFeature(sp.key)); Object.entries(myDeckCounts).forEach(([id,n])=>{for(let i=0;i<n;i++) unlockCardForPlayer(id,'test');}); saveEnergyState({current:60, lastRegenAt:Date.now()}); window.showCoachTip = ()=>{}; window.maybeShowCoachTip = ()=>{}; window.playDialogue = async ()=>({}); 1";
  const b = await pw.chromium.launch({executablePath: EXE});
  const errs = [];
  try{
    for(const w of [1366, 390]){
      const ctx = await b.newContext({viewport:{width:w, height: w < 500 ? 844 : 900}});
      await ctx.route('**/*', r=> r.request().url().startsWith('file:') ? r.continue() : r.abort());
      const pg = await ctx.newPage(); pg.on('pageerror', e=> errs.push(`@${w}: ` + String(e)));
      await pg.addInitScript(INIT); await pg.goto(URL, {waitUntil:'domcontentloaded', timeout:90000}); await pg.waitForFunction("typeof switchTab === 'function' && typeof startConquestMatch === 'function'", null, {timeout: 90000}); await pg.waitForTimeout(1500);
      await pg.evaluate(OWN);
      // #16: every main map (Maps 0-24) shows at least one pill; sub-maps none
      const scan = await pg.evaluate(`(()=>{ adminModeEnabled = true; const out = []; mainConquestMaps().forEach(m=>{ if(m.reserved) return; pk1OpenMapCards(m.id); const o = document.getElementById('pk1MapCardsOverlay');
        let grp = '', outside = 0; o.querySelectorAll('#ui19McSkills .ui19-sk-list > li').forEach(l=>{ if(l.classList.contains('ui32-sk-head')) grp = l.className; else if(grp.indexOf('is-main') < 0 && l.querySelector('.ui30-sugg')) outside++; });
        out.push({id: m.id, pills: o.querySelectorAll('#ui19McSkills .ui30-sugg').length, tiles: o.querySelectorAll('#ui19McSkills .ui30-sugg-tile').length + outside}); document.getElementById('pk1McClose').click(); });
        const subs = CONQUEST_MAPS.filter(m=> mpIsSub(m.id)).map(m=>{ pk1OpenMapCards(m.id); const k = document.querySelectorAll('#pk1MapCardsOverlay .ui30-sugg').length; document.getElementById('pk1McClose').click(); return k; });
        return {out, subPills: subs.reduce((a, b)=> a + b, 0), subs: subs.length}; })()`);
      ok(scan.out.length >= 25 && scan.out.every(x=> x.pills >= 1), `@${w} #16 every main map has a Sugg. Intro pill (${scan.out.filter(x=> !x.pills).map(x=> x.id).join(',') || 'all'})`);
      ok(scan.out.some(x=> x.tiles > 0), `@${w} #16 a pick no card has shows as its own tile (${scan.out.filter(x=> x.tiles).map(x=> x.id).join(',')})`);
      ok(scan.subs > 0 && scan.subPills === 0, `@${w} #16 sub-maps show no pill (${scan.subs} checked)`);
      // #14, #7
      const ic = await pg.evaluate(`(()=>{ const h = abilityBadges(getCardDefs()['bee-drone'], {compact: true}); return {pb: SKILL_ICON.poisonBarbs, boxes: (h.match(/alt="📦"|>📦</g) || []).length}; })()`);
      ok(ic.pb === '🌵☠️', `@${w} #14 Poison Barbs icon ${ic.pb}`);
      ok(ic.boxes === 1, `@${w} #7 Bee Drone (Tribe Delivery) has one 📦 (${ic.boxes})`);
      // a fight: #1 toasts, #2 pips, #3 the quake line
      await pg.evaluate(`(async()=>{ adminModeEnabled = true; switchTab('play'); startConquestMatch('mw', '5-3', {skipEnergyCost:true, noOpener:true}); await new Promise(r=> setTimeout(r, 2600)); try{ skipTriggerLesson(); }catch(e){}
        const m = matchState, e = m.engine; m.resolving = true; [1, 2].forEach(pid=>{ const pl = m.players[pid]; pl.row.left = []; pl.row.center = []; pl.row.right = []; });
        [[1, 'dolphin-knight'], [2, 'bee-knight']].forEach(([pid, id])=>{ const c = e.makeBoardCard(id); c.wait = 0; c.hp = c.maxHp = 9; c.slot = 0; m.players[pid].row.center.push(c); e.syncSlots(m.players[pid]); });
        m.replayCards = null; renderMatchUI(); await new Promise(r=> setTimeout(r, 900)); setFxLevel('high'); return 1; })()`);
      const t = await pg.evaluate(`(async()=>{ renderHUD(); renderHUD(); renderHUD(); document.querySelectorAll('.toast').forEach(x=> x.remove()); const s = document.getElementById('fxSelectHud'); if(!s) return -1; s.value = 'med'; s.dispatchEvent(new Event('change'));
        await new Promise(r=> setTimeout(r, 200)); const a = document.querySelectorAll('.toast').length; document.querySelectorAll('.toast').forEach(x=> x.remove());
        const v = document.getElementById('voiceLinesSelectHud'); v.value = 'off'; v.dispatchEvent(new Event('change')); await new Promise(r=> setTimeout(r, 200)); const b = document.querySelectorAll('.toast').length; setFxLevel('high'); return [a, b]; })()`);
      ok(Array.isArray(t) && t[0] === 1 && t[1] === 1, `@${w} #1 after 3 HUD refreshes, Effects and Voice lines each show one toast (${JSON.stringify(t)})`);
      const p = await pg.evaluate(`(async()=>{ const U = +document.querySelector('#rowMine .board-card[data-uid]').getAttribute('data-uid'), c = currentCardByUid(U); c.poison = 3; c.bleed = 2; updateCardStatusDisplay(U);
        const el = ()=> boardCardEl(U), pp = ()=> el().querySelector('.abadge.poison'), bp = ()=> el().querySelector('.abadge.bleed');
        const txt0 = [pp().textContent.trim(), bp().textContent.trim()];
        c.poison = 2; ui30StackGo(U, 'poison', 2); const tick = pp().classList.contains('ui30-tick'), drops0 = document.querySelectorAll('.fxd-psn-drop, .bleed-drop').length;
        c.bleed = 0; ui30StackGo(U, 'bleed', 0); const drop = document.querySelectorAll('.bleed-drop').length, gone = !bp();
        setFxLevel('none'); c.poison = 1; ui30StackGo(U, 'poison', 1); const tickNone = pp().classList.contains('ui30-tick'); setFxLevel('high');
        return {txt0, tick, drops0, drop, gone, tickNone, cls: document.documentElement.dataset.fx}; })()`);
      ok(!/\d/.test(p.txt0.join('')), `@${w} #2 Poison 3 and Bleed 2 pips show no number (${JSON.stringify(p.txt0)})`);
      ok(p.tick && p.drops0 === 0, `@${w} #2 3 -> 2: the pip ticks, nothing drops`);
      ok(p.drop === 1 && p.gone, `@${w} #2 Bleed 1 -> 0: one greyed 🩸 drops and the pip is gone`);
      ok(!p.tickNone, `@${w} #2 Effects None: no tick`);
      const q = await pg.evaluate(`(async()=>{ const el = hqTileEl('B'), t = el.querySelector('.card-tile') || el, r = t.getBoundingClientRect(); castleCrumble(el); await new Promise(r=> setTimeout(r, 520));
        const s = document.querySelector('.fxc-sinkcrack-wrap'); if(!s) return null; const sr = s.getBoundingClientRect(); return {c: r.left + r.width / 2, w: r.width, sc: sr.left + sr.width / 2, sw: sr.width, top: sr.top, bottom: r.bottom}; })()`);
      ok(q && Math.abs(q.c - q.sc) <= 3 && q.sw <= q.w * 0.85 && q.sw >= q.w * 0.6 && Math.abs(q.top + 8 - q.bottom) <= 14, `@${w} #3 the quake line is centred on the bramble and shorter than it (${JSON.stringify(q)})`);
      await ctx.close();
      // #10 codex leaf on the page
      const ctx2 = await b.newContext({viewport:{width:w, height: w < 500 ? 844 : 900}});
      await ctx2.route('**/*', r=> r.request().url().startsWith('file:') ? r.continue() : r.abort());
      const pg2 = await ctx2.newPage(); pg2.on('pageerror', e=> errs.push(`@${w}: ` + String(e)));
      await pg2.addInitScript(INIT); await pg2.goto(URL, {waitUntil:'domcontentloaded', timeout:90000}); await pg2.waitForFunction("typeof switchTab === 'function'", null, {timeout: 90000}); await pg2.waitForTimeout(1500);
      const L = await pg2.evaluate(`(async()=>{ window.showToast = ()=>{}; FEATURE_SPOTS.forEach(sp=> unlockFeature(sp.key)); setFxLevel('high'); Object.keys(getCardDefs()).slice(0, 200).forEach(id=>{ try{ unlockCardForPlayer(id, 'test'); }catch(e){} }); switchTab('codex'); await new Promise(r=> setTimeout(r, 2500));
        const S = codexAlbumState; if(!S || S.pages.length < 3) return null; const from = S.gridEl.querySelector('.pg-single') || S.gridEl.querySelector('.pg-right'), fr = from.getBoundingClientRect(), h0 = S.gridEl.offsetHeight;
        albumTurn(1); const l = S.gridEl.querySelector('.pg-leaf'); if(!l) return 'noleaf'; const dur = getComputedStyle(l).animationDuration; l.style.animation = 'none'; const lr = l.getBoundingClientRect();
        return {dx: Math.round(lr.left - fr.left), dy: Math.round(lr.top - fr.top), pos: getComputedStyle(l).position, dur, grew: S.gridEl.offsetHeight - h0}; })()`);
      ok(L && L !== 'noleaf' && Math.abs(L.dx) <= 3 && Math.abs(L.dy) <= 3 && L.pos === 'absolute' && L.grew <= 2, `@${w} #10 the turning leaf sits on its page, the book doesn't grow (${JSON.stringify(L)})`);
      ok(L && L.dur === '0.39s', `@${w} #10 the leaf turns in 390 ms (${L && L.dur})`);
      await ctx2.close();
    }
  } finally { await b.close(); }
  errs.forEach(e=> ok(false, 'page error ' + e));
}
browser().then(()=>{ console.log(`ui30: ${n - fail}/${n} ok`); process.exit(fail ? 1 : 0); }).catch(e=>{ console.log('ui30 crashed', e); process.exit(1); });
