#!/usr/bin/env node
// 2026-11-25 (package MAPEXEC1, owner 00:22): the swaps applied to canonical/map-pools.json, the proposed SQL for the owner's picks rows, Eyrie Heights' skill count.
//   1. static: run-all.sh, CHANGELOG, doc, the SQL is proposed only (a transaction of UPDATEs on card_overrides map-picks rows, no DELETE / DROP / INSERT, a read-back SELECT);
//   2. the file: every op of docs/design/mapexec1-ops-2026-11-25.json is in map-pools.json (add on the list, drop off it, move off the source and on the destination), one dated note per op;
//   3. browser: Map 11's header counts main-list skills and a few side-map ones (not the endless dungeon's 91 cards), a swaps row whose change is in the list is gone.
'use strict';
const fs = require('fs'), path = require('path');
const ROOT = path.join(__dirname, '..'), rd = f => fs.readFileSync(path.join(ROOT, f), 'utf8'), J = f => JSON.parse(rd(f));
let fail = 0, n = 0; const ok = (c, m) => { n++; if (!c) { fail++; console.log('  x ' + m); } };
ok(/mapexec1-2026-11-25/.test(rd('tests/run-all.sh')), '1. run-all.sh lists this test');
ok(/MAPEXEC1/.test(rd('docs/CHANGELOG.md').slice(0, 20000)), '1. CHANGELOG entry at the top');
ok(fs.existsSync(path.join(ROOT, 'docs/design/mapexec1-2026-11-25.md')), '1. the design doc exists');
const sql = rd('supabase/proposed/mapexec1-2026-11-25.sql');
ok(/^BEGIN;/m.test(sql) && /^COMMIT;/m.test(sql) && /select id, jsonb_array_length/.test(sql), '1. the SQL is a transaction with a read-back');
ok(!/\b(delete|drop|insert|truncate|alter)\b/i.test(sql.replace(/^--.*$/gm, '')), '1. the SQL only updates');
ok((sql.match(/^update card_overrides set data = /gm) || []).every(() => true) && (sql.match(/where id = '__cfg:map-picks:[a-z0-9]+' and deleted = false;/g) || []).length === (sql.match(/^update card_overrides/gm) || []).length, '1. every UPDATE targets one map-picks row');
const P = J('canonical/map-pools.json'), ops = J('docs/design/mapexec1-ops-2026-11-25.json'), C = {}; J('canonical/cards.json').forEach(c => { C[c.id] = c; });
ok(ops.length >= 40, '2. the swaps are recorded (' + ops.length + ' ops)');
ops.forEach(o => { const l = (P.maps[o.map] || {}).cards || [], to = o.to && (P.maps[o.to] || {}).cards;
  ok(!!C[o.card], '2. ' + o.card + ' is a card');
  if (o.kind === 'add') ok(l.includes(o.card), `2. ${o.card} is on ${o.map}`);
  else if (o.kind === 'drop') ok(!l.includes(o.card), `2. ${o.card} is off ${o.map}`);
  else ok(!l.includes(o.card) && to && to.includes(o.card), `2. ${o.card} moved ${o.map} -> ${o.to}`);
  if (o.kind === 'add') ok(!C[o.card].awaitingSource && C[o.card].rarity !== 'starter' && !(C[o.card].source && C[o.card].source.kind === 'map'), `2. ${o.card}: a placed pack card (no awaiting, starter or skirmish reward)`); });
ok(Array.isArray(P._changes) && P._changes.length === ops.length && P._changes.every(x => /^2026-11-25 MAPEXEC1 /.test(x)), '2. one dated note per op in map-pools.json');
Object.values(P.maps).forEach(m => ok(new Set(m.cards).size === m.cards.length, '2. no duplicate on a list'));
// 3. browser
async function browser() {
  let pw; try { pw = require('playwright'); } catch (e) { try { pw = require(path.join(require('child_process').execSync('npm root -g').toString().trim(), 'playwright')); } catch (_) { console.log('  (browser part skipped: no playwright)'); return; } }
  const EXE = process.env.BW_CHROMIUM || '/opt/pw-browsers/chromium_headless_shell-1194/chrome-linux/headless_shell';
  if (!fs.existsSync(EXE) || !fs.existsSync(path.join(ROOT, 'index.html'))) { console.log('  (browser part skipped: no Chromium or index.html)'); return; }
  const b = await pw.chromium.launch({ executablePath: EXE });
  try {
    const ctx = await b.newContext({ viewport: { width: 1366, height: 860 } });
    await ctx.route('**/*', r => /^(file|data|blob):/.test(r.request().url()) ? r.continue() : r.abort());
    const pg = await ctx.newPage(), errs = []; pg.on('pageerror', e => errs.push(String(e && e.message || e).slice(0, 200)));
    await pg.addInitScript("localStorage.setItem('bramblewood_arena_tutorial_done','1'); sessionStorage.setItem('bramblewood_seen_splash','1');");
    await pg.goto('file://' + path.join(ROOT, 'index.html'), { waitUntil: 'domcontentloaded', timeout: 180000 });
    await pg.waitForFunction("typeof switchTab === 'function' && typeof mpEntry === 'function'", null, { timeout: 180000 }); await pg.waitForTimeout(1500);
    const r = await pg.evaluate(() => { adminModeEnabled = true; localStorage.removeItem('bramblewood_ms1_done'); const g = ui32McSkillIds('m10', 'm10', () => true); pk1OpenMapCards('m10');
      const head = +document.querySelector('#ui19McSkills h3 small').textContent, tiles = document.querySelectorAll('#ui19McSkills .ui19-sk.is-carried, #ui19McSkills .ui19-sk.is-other, #ui19McSkills .ui19-sk.is-new, #ui19McSkills .ui19-sk.is-grey').length;
      const muc = new Set(mpEntry('m10').submaps.muc || []), other = new Set(g.other);
      return { head, tiles, mucInOther: [...muc].filter(i => other.has(i) && !(mpEntry('m10').cards.includes(i))).length, mucN: muc.size, rows: ms1Rows('m10').map(x => x.id) }; });
    ok(r.mucN > 50 && r.mucInOther < r.mucN / 4, `3. the endless dungeon's list is not Map 11's other cards (${r.mucInOther} of ${r.mucN})`);
    ok(r.head === r.tiles && r.head < 40, `3. Map 11 header ${r.head} counts its tiles (${r.tiles}), was 74`);
    ok(!r.rows.includes('stonedrop-vulture') && !r.rows.includes('mountain-hare') && !r.rows.includes('eyrie-warden'), '3. the applied swaps are no rows any more ' + r.rows.join(','));
    ok(!errs.length, '3. no page errors ' + errs.slice(0, 2).join(' | '));
  } finally { await b.close(); }
}
browser().then(() => { console.log(fail ? `mapexec1: ${fail} of ${n} FAILED` : `mapexec1: ${n} checks passed`); process.exit(fail ? 1 : 0); }).catch(e => { console.error(e); process.exit(1); });
