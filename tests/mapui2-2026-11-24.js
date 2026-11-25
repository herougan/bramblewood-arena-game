#!/usr/bin/env node
// 2026-11-24 (package MAPUI2, owner 2026-11-23 23:39 items 2a 6 7 8 9 10 13 15 17 18): the Map cards window's merged skill list and level bar.
//   1. static: run-all.sh, CHANGELOG, design doc, the typeof guard, the three emoji, Swift back in the picker, the swapped To remove gradient, the sway keyframes, the pip CSS, the 5 texts in 12 packs;
//   2. browser (index.html + Chromium; skipped when missing): one list (no "Other skills" head), the level bar 0-15 (0 and 11+ dark, Maps 0 / 1 / 5 gold), skills recomputed per level, the colour classes
//      (New! red, To add red / blue, To remove black / red, carried grey), no Suggested on a skill a card carries (Map 4 Venomous / Decay), the rewards of the map only, Swift in the picker, the tiles
//      redrawn at the picked level in the Prospects view, the pip numbers within 0.8 px of their capsule's centre, the sway at rest.
'use strict';
const fs = require('fs'), path = require('path');
const ROOT = path.join(__dirname, '..'), rd = f => fs.readFileSync(path.join(ROOT, f), 'utf8'), J = f => JSON.parse(rd(f));
let fail = 0, n = 0; const ok = (c, m) => { n++; if (!c) { fail++; console.log('  x ' + m); } };
const app = rd('arena_app.js'), tpl = rd('arena_template.html');

// ---- 1. static
ok(/mapui2-2026-11-24/.test(rd('tests/run-all.sh')), '1. run-all.sh lists this test');
// 2026-11-25 (TESTFIX11): later packages push the entry down; the check is that the package's dated entry is there
ok(/^## 2026-11-24 Package MAPUI2\b/m.test(rd('docs/CHANGELOG.md')), '1. CHANGELOG entry (## 2026-11-24 Package MAPUI2)');
ok(fs.existsSync(path.join(ROOT, 'docs/design/mapui2-2026-11-24.md')), '1. the design doc exists');
ok(/typeof MAP_SPECIAL_SKILL_NAMES !== 'undefined' \? MAP_SPECIAL_SKILL_NAMES : \{\}/.test(app), '1. MAP_SPECIAL_SKILL_NAMES is read behind a typeof guard');
ok(/constrict:'⛓️'/.test(app) && /swift:'🥾'/.test(app) && /onDeathSpawn:'🐛'/.test(app), '1. Constrict ⛓️, Swift 🥾, Progeny 🐛');
ok(!/if\(d && d\.key === 'swift'\) d\.hidden = true;/.test(app) && /x\.key === 'swift'/.test(app), '1. Swift is pickable again');
ok(/\.is-new\.is-focus-remove\{background:linear-gradient\(90deg, #2b2b2b 50%, #c62828 50%\)/.test(tpl), '1. To remove is black left, red right');
ok(/@keyframes mfxSway\{0%\{transform:rotate\(0\); opacity:0;\}/.test(tpl), '1. the sway starts at rest (rotate 0, hidden)');
ok(/translate\(-50%, calc\(52% \+ 2px\)\)/.test(tpl) && /\.abadge\{translate:0 \.06em;\}/.test(tpl), '1. the context pips sit 2 px lower and their numbers .06em lower');
ok(!/ui32-sk-head is-/.test(app.slice(app.indexOf('function ui19McSkillsHTML'), app.indexOf('// UI19_MC_SKILLS:END'))), '1. no group heading in the skill list');
const tx = rd('bramblewood-texts.js');
['pill-codex', 'lv', 'lv-tip', 'leg-add', 'leg-rem'].forEach(k => { ok(tx.includes('"ui.mapui2-' + k + '"'), '1. text key ui.mapui2-' + k);
  const en = (tx.match(new RegExp('"ui\\.mapui2-' + k + '": "([^"]*)"')) || [])[1]; for (const c of ['fr', 'de', 'es', 'it', 'pt', 'tl', 'ta', 'id', 'zh-Hans', 'zh-Hant', 'ja', 'ko']) ok(en && J('lang/' + c + '.json')[en], `1. lang/${c}.json has "${en}"`); });

// ---- 2. browser
async function browser() {
  let pw; try { pw = require('playwright'); } catch (e) { try { pw = require(path.join(require('child_process').execSync('npm root -g').toString().trim(), 'playwright')); } catch (_) { console.log('  (browser part skipped: no playwright)'); return; } }
  const EXE = process.env.BW_CHROMIUM || '/opt/pw-browsers/chromium_headless_shell-1194/chrome-linux/headless_shell';
  if (!fs.existsSync(EXE) || !fs.existsSync(path.join(ROOT, 'index.html'))) { console.log('  (browser part skipped: no Chromium or index.html)'); return; }
  const INIT = "localStorage.setItem('bramblewood_arena_tutorial_done','1'); sessionStorage.setItem('bramblewood_seen_splash','1');";
  const b = await pw.chromium.launch({ executablePath: EXE });
  try {
    const ctx = await b.newContext({ viewport: { width: 1366, height: 860 } });
    await ctx.route('**/*', r => /^(file|data|blob):/.test(r.request().url()) ? r.continue() : r.abort());
    const pg = await ctx.newPage(), errs = []; pg.on('pageerror', e => errs.push(String(e && e.message || e).slice(0, 200)));
    await pg.addInitScript(INIT); await pg.goto('file://' + path.join(ROOT, 'index.html'), { waitUntil: 'domcontentloaded', timeout: 180000 });
    await pg.waitForFunction("typeof switchTab === 'function' && typeof mpEntry === 'function'", null, { timeout: 180000 }); await pg.waitForTimeout(1500);

    // emoji and the picker
    const E = await pg.evaluate(() => ({ c: SKILL_ICON.constrict, s: SKILL_ICON.swift, p: SKILL_ICON.onDeathSpawn, pick: /value="swift"/.test(skillRowHTML({ key: 'daunt' }, 0, 'passive', null)) }));
    ok(E.c === '⛓️' && E.s === '🥾' && E.p === '🐛', '2. the three skill emoji: ' + JSON.stringify(E));
    ok(E.pick, '2. Swift is an option of the card editor\'s ability picker');

    // level bar
    const L = await pg.evaluate(() => { adminModeEnabled = true; const maps = mainConquestMaps(), out = {};
      [0, 1, 5].forEach(i => { pk1OpenMapCards(maps[i].id); const bar = document.querySelector('#ui19McSkills .mui2-lv');
        out[i] = { n: bar ? bar.querySelectorAll('.mui2-lv-b').length : 0, dim: bar ? [...bar.querySelectorAll('.is-dim')].map(x => +x.textContent) : [], gold: bar ? [...bar.querySelectorAll('.is-gold')].map(x => +x.textContent) : [], on: bar ? [...bar.querySelectorAll('.is-on')].map(x => +x.textContent) : [],
          head: document.querySelectorAll('#ui39Head .mui2-lv').length, other: /other skills/i.test(document.querySelector('#ui19McSkills').textContent), heads: document.querySelectorAll('#ui19McSkills .ui32-sk-head').length }; });
      return out; });
    ok(L[0].n === 16 && L[0].dim.join() === '0,11,12,13,14,15', '2. the bar is 0-15 with 0 and 11+ dark: ' + JSON.stringify(L[0].dim));
    ok(L[0].gold.join() === '0' && L[0].on.join() === '0', '2. Map 0: level 0 only (gold ' + L[0].gold + ', on ' + L[0].on + ')');
    ok(L[1].gold.join() === '0,1' && L[1].on.join() === '1', '2. Map 1: levels 0-1, the highest is picked (gold ' + L[1].gold + ', on ' + L[1].on + ')');
    ok(L[5].gold.length >= 2 && L[5].gold[0] === 0 && L[5].on[0] === L[5].gold[L[5].gold.length - 1], '2. Map 5: gold from 0, the highest picked (gold ' + L[5].gold + ', on ' + L[5].on + ')');
    ok([0, 1, 5].every(i => L[i].head === 1 && !L[i].other && L[i].heads === 0), '2. the Prospects head has a bar too, and the skill list has no "Other skills" subtitle');

    // skills at a level, colour classes
    const C = await pg.evaluate(() => { const maps = mainConquestMaps(), m1 = maps[1].id, m4 = maps[4].id, real = getCardDefs(), mk = (id, fx, ls) => ({ id, name: id, attack: 2, health: 3, cost: 1, wait: 1, rarity: 'common', effects: fx, levelSkills: ls || {}, baseLevel: 0 });
      const defs = Object.assign({}, real, { zA: mk('zA', { thorns: true }), zB: mk('zB', { poison: 2, decay: 1 }), zC: mk('zC', { flying: true }), zD: mk('zD', { thorns: true, regen: 1 }, { 3: { regen: 1 } }) });
      const html = (top, ids, lv) => { mapui2Lv = { mapId: top, lv }; const h = ui19McSkillsHTML(top, ids, defs, () => true, top, []); mapui2Lv = null; const d = document.createElement('div'); d.innerHTML = h; return d; };
      const tile = (d, k) => d.querySelector(`[data-ui19-skill="${k}"]`);
      const d1 = html(m1, ['zA', 'zB', 'zC'], 1), d3lo = html(m1, ['zD'], 1), d3hi = html(m1, ['zD'], 3);
      const cls = (d, k) => { const t = tile(d, k); return t ? t.className : ''; };
      const d4 = html(m4, ['zB', 'zC'], 1);
      return { thorns: cls(d1, 'thorns'), venom: cls(d1, 'poison'), flying: cls(d1, 'flying'), guardian: cls(d1, 'guardian'), venomPills: tile(d1, 'poison') ? tile(d1, 'poison').querySelectorAll('.ui28-sug, .ui30-sugg, .ui35-pill.is-intro, .ui35-pill.is-main').length : -1,
        thornsPills: tile(d1, 'thorns') ? tile(d1, 'thorns').querySelectorAll('.ui28-sug, .ui30-sugg, .ui35-pill.is-intro, .ui35-pill.is-main').length : -1,
        regenLo: !!tile(d3lo, 'regen'), regenHi: !!tile(d3hi, 'regen'), m4venom: cls(d4, 'poison'), m4venomPills: ['poison', 'decay'].map(k => tile(d4, k) ? tile(d4, k).querySelectorAll('.ui28-sug, .ui30-sugg, .ui35-pill.is-intro').length : -1).join(), m4decay: cls(d4, 'decay'), heads: d1.querySelectorAll('.ui32-sk-head').length,
        legend: [...d1.querySelectorAll('.uiq2-legend span')].map(x => x.className).join() }; });
    ok(/is-new/.test(C.thorns) && !/is-focus-remove/.test(C.thorns), '2. Thorns (in the Map 1 row, new here) is red: ' + C.thorns);
    ok(/is-new/.test(C.venom) && /is-focus-remove/.test(C.venom), '2. Venomous (poison; new, in no row) is To remove: ' + C.venom);
    ok(/is-carried/.test(C.flying) && !/is-new/.test(C.flying), '2. Flying (an earlier map has it) is carried grey: ' + C.flying);
    ok(/is-focus-add/.test(C.guardian), '2. Guardian (in the row, on no card) is To add: ' + C.guardian);
    ok(C.venomPills === 0 && C.thornsPills === 0, '2. a New! or To remove tile wears no Suggested / Sugg. Intro / Intro / Main pill');
    ok(!C.regenLo && C.regenHi, '2. a skill a card learns at level 3 is in the list at 3 and not at 1');
    ok(C.m4venomPills === '0,0', '2. Map 4 Venomous carried by a card wears no Suggested: ' + C.m4venomPills);
    ok(C.heads === 0 && /is-new,is-add,is-rem,is-sugnew,is-sugg,is-carried/.test(C.legend) /* 2026-11-26 (FIXPACK1): + Suggest New! */, '2. one list; the legend names New!, To add, To remove, Suggest New!, Suggested, Carried: ' + C.legend);

    // the rewards of the map only
    const R = await pg.evaluate(() => { adminModeEnabled = true; const maps = mainConquestMaps(); const res = []; maps.slice(0, 12).forEach(m => { const own = new Set((m.nodes || []).map(x => skirmishCode(m.id, x.key))); pk1OpenMapCards(m.id);
      const codes = [...document.querySelectorAll('#ui22McRewards [data-ui22-fight]')].map(x => x.dataset.ui22Fight); res.push({ id: m.id, codes: codes.length, foreign: codes.filter(c => !own.has(c)).length, subs: mpSubsOf(m.id).length }); }); return res; });
    ok(R.every(r => r.foreign === 0) && R.some(r => r.subs > 0 && r.codes > 0), '2. the rewards list holds the map\'s own fights only: ' + JSON.stringify(R.filter(r => r.foreign)));

    // the Prospects tiles at the picked level
    const P = await pg.evaluate(() => { adminModeEnabled = true; const m = mainConquestMaps()[1].id; pk1OpenMapCards(m); const defs = getCardDefs(); mapui2Pick(m, 7);
      const t = [...document.querySelectorAll('#ui37Pros .ui37-tile[data-ui37-id]')].find(x => { const d = defs[x.dataset.ui37Id]; return d && d.attack != null && x.querySelector('.card-tile .atk'); });
      const id = t && t.dataset.ui37Id, shown = t ? t.querySelector('.card-tile .atk').textContent.replace(/\D/g, '') : '', want = id ? String(eng23MapDef(id, defs, 7).attack) : '';
      const lo = id ? String(eng23MapDef(id, defs, 0).attack) : '';
      const on = [...document.querySelectorAll('#ui19McSkills .mui2-lv .is-on, #ui39Head .mui2-lv .is-on')].map(x => +x.textContent);
      const r = { id, shown, want, lo, on, show: mapui2Show }; mapui2Lv = null; pk1OpenMapCards(m); return r; });
    ok(P.id && P.shown === P.want && P.on.join() === '7,7' && P.show === 7, '2. picking level 7 redraws the tiles at it and moves both bars: ' + JSON.stringify(P));

    // the context pip numbers, centred vertically
    const Q = await pg.evaluate(() => { adminModeEnabled = true; pk1OpenMapCards(mainConquestMaps()[4].id); const cv = document.createElement('canvas').getContext('2d'), out = [];
      document.querySelectorAll('#pk1MapCardsOverlay .badges .abadge').forEach(x => { const tn = [...x.querySelectorAll('*')].concat([x]).flatMap(e => [...e.childNodes].filter(q => q.nodeType === 3 && /\d/.test(q.textContent)))[0]; if (!tn) return;
        const cs = getComputedStyle(tn.parentElement); cv.font = `${cs.fontWeight} ${cs.fontSize} ${cs.fontFamily}`; const m = cv.measureText(tn.textContent.match(/\d/)[0]), rg = document.createRange(); rg.selectNodeContents(tn); const r = rg.getBoundingClientRect(), base = r.top + m.fontBoundingBoxAscent,
          pill = x.closest('.badges').getBoundingClientRect(); out.push(Math.abs((base - m.actualBoundingBoxAscent + base + m.actualBoundingBoxDescent) / 2 - (pill.top + pill.bottom) / 2)); });
      return { n: out.length, max: Math.max(0, ...out) }; });
    ok(Q.n > 0 && Q.max <= 0.8, '2. pip numbers sit within 0.8 px of their capsule centre: ' + JSON.stringify(Q));

    // the sway at rest
    const S = await pg.evaluate(() => { const d = document.createElement('div'); d.className = 'mfx-patch mfx-sway'; d.style.cssText = 'width:20px;height:20px;--sw:1deg'; document.body.appendChild(d); const a = d.getAnimations()[0]; a.pause(); a.currentTime = 0; const cs = getComputedStyle(d), r = { op: cs.opacity, tr: cs.transform }; d.remove(); return r; });
    ok(S.op === '0' && /^(none|matrix\(1, 0, 0, 1, 0, 0\))$/.test(S.tr), '2. a sway patch at rest is hidden and unrotated: ' + JSON.stringify(S));
    ok(!errs.length, '2. no page errors: ' + errs.join(' | '));
  } finally { await b.close(); }
}
browser().then(() => { console.log(fail ? `mapui2: ${fail} of ${n} checks failed` : `mapui2: all ${n} checks passed`); process.exit(fail ? 1 : 0); }).catch(e => { console.log('  x ' + (e && e.message || e)); process.exit(1); });
