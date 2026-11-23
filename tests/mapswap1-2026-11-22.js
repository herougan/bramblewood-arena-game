#!/usr/bin/env node
// 2026-11-22 (package MAPSWAP1, owner 23:08): Claude's swaps in the Map cards window.
//   1. static: run-all.sh, CHANGELOG, doc, build placeholder, the 8 texts in all 12 packs, the pick path is ui37SetFlag;
//   2. the file: totals, every concept has a name / rarity / role, no card of Moonlit Hare;
//   3. browser (index.html + Chromium; skipped when missing): the file covers every To add tile and every To remove (skill, card) of Maps 0-20 as the window shows them,
//      each suggested card carries the skill and is not over the map's rarity cap (roadRevealedCap), the section renders for a main map in admin mode and not for a
//      player, Yes sends the row's pairs through ui37SetFlag and No sends nothing, a answered row is gone.
'use strict';
const fs = require('fs'), path = require('path');
const ROOT = path.join(__dirname, '..'), rd = f => fs.readFileSync(path.join(ROOT, f), 'utf8'), J = f => JSON.parse(rd(f));
let fail = 0, n = 0; const ok = (c, m) => { n++; if (!c) { fail++; console.log('  x ' + m); } };
const app = rd('arena_app.js');

// ---- 1. static
ok(/mapswap1-2026-11-22/.test(rd('tests/run-all.sh')), '1. run-all.sh lists this test');
ok(/MAPSWAP1/.test(rd('docs/CHANGELOG.md').slice(0, 20000)), '1. CHANGELOG entry at the top');
ok(fs.existsSync(path.join(ROOT, 'docs/design/mapswap1-2026-11-22.md')), '1. the design doc exists');
ok(/const MAP_SWAPS = __MAP_SWAPS__;/.test(app) && /__MAP_SWAPS__/.test(rd('assemble_arena.py')), '1. the build inlines the suggestions');
ok(/ui37SetFlag\(m, id, 'yes'\)/.test(app) && /ui37SetFlag\(m, id, 'no'\)/.test(app), '1. Yes goes through ui37SetFlag');
ok(/ms1SwapsHTML\(mapId \|\| top, defs\)/.test(app), '1. the section is part of the skills block');
const tx = rd('bramblewood-texts.js');
['title', 'add', 'concept', 'move', 'drop', 'keep', 'rep', 'to'].forEach(k => { ok(tx.includes('"ui.ms1-' + k + '"'), '1. text key ui.ms1-' + k);
  const en = (tx.match(new RegExp('"ui\\.ms1-' + k + '": "([^"]*)"')) || [])[1]; for (const c of ['fr', 'de', 'es', 'it', 'pt', 'tl', 'ta', 'id', 'zh-Hans', 'zh-Hant', 'ja', 'ko']) ok(en && J('lang/' + c + '.json')[en], `1. lang/${c}.json has "${en}"`); });

// ---- 2. the file
const S = J('canonical/map-swap-suggestions.json');
ok(S.maps.length === 21, '2. one entry per map 0-20');
S.maps.forEach(m => { m.add.forEach(a => ok(a.cards.length ? a.cards.length <= 4 : (a.concept && a.concept.name && a.concept.rarity && a.concept.role && !/\d\s*\/\s*\d/.test(a.concept.role)), `2. Map ${m.n} ${a.skill}: 1-4 cards or a concept`));
  m.remove.forEach(r => ok(r.text && r.why && ['move', 'drop', 'keep', 'stuck'].includes(r.kind), `2. Map ${m.n} ${r.cardName}: a suggested move`)); });
ok(!JSON.stringify(S).includes('"moonlit-hare"'), '2. Moonlit Hare is never suggested');

// ---- 3. browser
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
    // the window's own tiles, as tools/hub/map_skill_table.js reads them
    const T = await pg.evaluate(() => { const defs = getCardDefs(), carry = (d, k) => { const e = (d && d.effects) || {}; return e[k] != null && e[k] !== false && e[k] !== 0; };
      return mainConquestMaps().slice(0, 21).map((m, n) => { const ids = (mpEntry(m.id).cards || []).filter(i => defs[i]); pk1OpenMapCards(m.id);
        const rm = [...document.querySelectorAll('#ui19McSkills .is-focus-remove')].map(li => li.dataset.ui19Skill), o = document.getElementById('pk1MapCardsOverlay'); if (o) o.remove();
        return { n, id: m.id, rm: rm.map(k => ({ key: k, carriers: ids.filter(i => carry(defs[i], k)) })), row: MAP_FOCUS_SKILLS[n] || [], none: (MAP_FOCUS_SKILLS[n] || []).filter(k => skillDefOf(k) && !ids.some(i => carry(defs[i], k))), cap: roadRarityStep(roadRevealedCap(n)) }; }); });
    let nAdd = 0, nRm = 0;
    T.forEach(t => { const m = S.maps[t.n]; ok(m && m.id === t.id, `3. Map ${t.n} id matches the game`);
      t.none.forEach(k => { nAdd++; ok(m.add.some(a => a.key === k && (a.cards.length || a.concept)), `3. Map ${t.n}: To add ${k} is covered`); });
      ok(m.add.length === t.none.length, `3. Map ${t.n}: no extra or missing To add items (${m.add.length} vs ${t.none.length})`);
      t.rm.forEach(r => r.carriers.forEach(c => { nRm++; ok(m.remove.some(x => x.card === c && x.keys.includes(r.key)), `3. Map ${t.n}: To remove ${r.key} / ${c} is resolved`); })); });
    ok(nAdd >= 6 && nRm >= 36, `3. the table's items are all there (${nAdd} to add, ${nRm} to remove)`);
    // carriers and caps
    const bad = await pg.evaluate(S0 => { const defs = getCardDefs(), carry = (d, k) => { const e = (d && d.effects) || {}; return e[k] != null && e[k] !== false && e[k] !== 0; }, out = [];
      S0.maps.forEach(m => { const cap = roadRarityStep(roadRevealedCap(m.n)); m.add.forEach(a => { a.cards.forEach(c => { const d = defs[c.id]; if (!d) out.push(m.n + ' missing ' + c.id); else { if (!carry(d, a.key)) out.push(m.n + ' ' + c.id + ' lacks ' + a.key); if (roadRarityStep(d.rarity) > cap) out.push(m.n + ' ' + c.id + ' over the cap'); } });
          if (a.concept && roadRarityStep(a.concept.rarity) > cap) out.push(m.n + ' concept over the cap'); });
        m.remove.forEach(r => { if (r.kind === 'move' && roadRarityStep(defs[r.card].rarity) > roadRarityStep(roadRevealedCap(r.to))) out.push(m.n + ' ' + r.card + ' over the cap on Map ' + r.to); }); }); return out; }, S);
    ok(!bad.length, '3. suggested cards carry the skill and fit the cap ' + bad.slice(0, 4).join('; '));
    // the section
    const sid = S.maps.find(m => m.add.some(a => a.cards.length) && m.remove.length);
    const r0 = await pg.evaluate(id => { adminModeEnabled = true; localStorage.removeItem('bramblewood_ms1_done'); pk1OpenMapCards(id); return { rows: document.querySelectorAll('#ms1Swaps .ms1-row').length, btns: document.querySelectorAll('#ms1Swaps [data-ms1-act]').length, tiles: document.querySelectorAll('#ms1Swaps .rv1-tile, #ms1Swaps .ui38-concept').length }; }, sid.id);
    ok(r0.rows >= 2 && r0.btns === r0.rows * 2 && r0.tiles >= r0.rows, `3. the section renders on Map ${sid.n} (${r0.rows} rows, ${r0.btns} buttons, ${r0.tiles} tiles)`);
    // Yes calls the pick path with the row's pairs, No none
    const y = await pg.evaluate(() => { window.__calls = []; window.ui37SetFlag = (t, id, f) => window.__calls.push([t, id, f]); const li = document.querySelector('#ms1Swaps .ms1-row'), sid = li.dataset.ms1Sid, map = li.dataset.ms1Map; const row = ms1Rows(map).find(r => r.sid === sid);
      li.querySelector('[data-ms1-act=yes]').click(); const done = ms1Done()[sid], after = document.querySelectorAll('#ms1Swaps .ms1-row').length;
      const want = row.yes.map(p => [p[0], p[1], 'yes']).concat(row.no.map(p => [p[0], p[1], 'no'])); return { calls: window.__calls, want, done, after }; });
    ok(y.calls.length === y.want.length && JSON.stringify(y.calls) === JSON.stringify(y.want), '3. Yes sends the row\'s pairs through ui37SetFlag ' + JSON.stringify(y.calls));
    ok(y.done === 'yes' && y.after === r0.rows - 1, '3. an answered row is gone');
    const nn = await pg.evaluate(() => { window.__calls = []; const li = document.querySelector('#ms1Swaps .ms1-row'); li.querySelector('[data-ms1-act=no]').click(); return { calls: window.__calls.length, rows: document.querySelectorAll('#ms1Swaps .ms1-row').length }; });
    ok(nn.calls === 0, '3. No only hides the row (no pick written)');
    const pl = await pg.evaluate(id => { adminModeEnabled = false; pk1OpenMapCards(id); return document.querySelectorAll('#ms1Swaps').length; }, sid.id);
    ok(pl === 0, '3. a player never sees the section');
    ok(!errs.length, '3. no page errors ' + errs.slice(0, 2).join(' | '));
  } finally { await b.close(); }
}
browser().then(() => { console.log(fail ? `mapswap1: ${fail} of ${n} FAILED` : `mapswap1: ${n} checks passed`); process.exit(fail ? 1 : 0); }).catch(e => { console.error(e); process.exit(1); });
