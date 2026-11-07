#!/usr/bin/env node
// 2026-11-07 (package BAL22, owner 07:37): the card power test plays 100 games a card, counts only games where the card was played,
// and gives a basic (vs filler) and an advanced (vs decks of the top-20% cards, seeded) win rate; K worker processes; the card editor
// shows "Power: +N · Advanced +M" with the run date and the played share in the tooltip.
// Static: the tool's options, the report's fields and pool, the build's CARD_POWER table, the texts in all 12 packs, cePowerHTML's
// output (run in node with the real texts). No simulations here.
'use strict';
const fs = require('fs'), path = require('path');
const ROOT = path.join(__dirname, '..');
const read = f=> fs.readFileSync(path.join(ROOT, f), 'utf8');
let fail = 0, n = 0; const ok = (c, m)=>{ n++; if(!c){ fail++; console.log('  ✗', m); } };
const CODES = ['fr', 'de', 'es', 'it', 'pt', 'tl', 'ta', 'id', 'zh-Hans', 'zh-Hant', 'ja', 'ko'];

// ---- the tool
const tool = read('tools/card_balance.js');
ok(/\|\| 100\);/.test(tool), '100 games a card by default');
ok(/optv\('workers', 2\)/.test(tool) && /fork\(__filename/.test(tool), 'worker processes (--workers, default 2)');
ok(/--only=/.test(tool) && /card-balance-partial\.json/.test(tool), '--only still writes the partial report');
ok(/st\.played > 0/.test(tool) && /'A' : 'B'\) \+ '\|' \+ id/.test(tool), 'a game counts only when the test side played the card');
ok(/TOP_SHARE = 0\.2, LOW_SAMPLE = 20/.test(tool), 'top 20% pool, low sample under 20');
ok(!/cards\.json'\), *JSON\.stringify/.test(tool) && !/writeFileSync\([^)]*canonical/.test(tool), 'the tool never writes canonical/');

// ---- the report
const rep = JSON.parse(read('docs/balance/card-balance.json'));
ok(rep.games === 100, 'the committed run is 100 games a card (' + rep.games + ')');
ok(rep.advanced && Number.isFinite(rep.advanced.seed) && Array.isArray(rep.advanced.pool) && rep.advanced.pool.length > 0, 'advanced: seed and top pool recorded');
const rows = rep.rows || [], byId = {}; rows.forEach(r=> byId[r.id] = r);
ok(rows.length > 500, 'every live card measured (' + rows.length + ')');
ok(rows.every(r=> 'winRate' in r && 'advRate' in r && Number.isFinite(r.played) && Number.isFinite(r.games) && Number.isFinite(r.playedShare)), 'each row has winRate, advRate, played, games, playedShare');
ok(rows.every(r=> Math.abs(r.playedShare - (r.games ? r.played / r.games : 0)) < 0.001), 'playedShare = played / games');
ok(rows.every(r=> !!r.lowSample === (r.played < 20)), 'lowSample flags exactly the cards played in under 20 games');
ok(rows.every(r=> r.played ? r.winRate != null : r.winRate == null), 'winRate only when the card was played');
{ const eligible = rows.filter(r=> r.winRate != null && r.played >= 20);
  ok(Math.abs(rep.advanced.pool.length - Math.round(eligible.length * 0.2)) <= 1, 'pool = top 20% of the measured (not low-sample) cards');
  const cut = Math.min(...rep.advanced.pool.map(id=> byId[id] ? byId[id].winRate : 0));
  ok(rep.advanced.pool.every(id=> byId[id] && byId[id].played >= 20), 'no low-sample card in the pool');
  ok(eligible.filter(r=> !rep.advanced.pool.includes(r.id)).every(r=> r.winRate <= cut), 'every card outside the pool scores at most the pool\'s lowest'); }
{ const strong = rows.filter(r=> r.winRate >= 95 && r.advRate != null && r.adv && r.adv.played >= 20);
  // the advanced pass may be unfinished (advanced.complete false, resumable): then only the measured cards are checked
  ok(!strong.length || strong.reduce((a, r)=> a + r.advRate, 0) / strong.length < 80, 'strong cards come back toward 50 against the top pool');
  ok(rep.advanced.complete === rows.every(r=> r.advRate != null || (r.adv && r.adv.played === 0)) || rep.advanced.complete === false, 'advanced.complete matches the rows');
  ok(rep.advanced.measured === rows.filter(r=> r.adv).length, 'advanced.measured counts the rows with an advanced pass'); }

// ---- the build
const asm = read('assemble_arena.py');
ok(/_cp\["adv"\]/.test(asm) && /_cp\["ps"\]/.test(asm), 'assemble_arena.py bakes advRate and playedShare');
const html = read('index.html');
const m = html.match(/const CARD_POWER = (\{.*?\});\n/);
let CP = null; try{ CP = m && JSON.parse(m[1]); }catch(e){}
ok(CP && CP.wr && CP.adv && CP.ps && CP.date === rep.generated, 'index.html carries wr, adv, ps and the run date');

// ---- texts
const {TEXT, TX} = require(path.join(ROOT, 'bramblewood-texts.js'));
const KEYS = ['ui.bal22-adv', 'ui.bal22-adv-none', 'ui.bal22-power-tip', 'ui.bal22-power-share'];
KEYS.forEach(k=> ok(!!TEXT[k], 'TX key ' + k));
CODES.forEach(c=>{ const pk = JSON.parse(read('lang/' + c + '.json'));
  KEYS.forEach(k=>{ const t = pk[TEXT[k]]; ok(!!t && t !== TEXT[k] || c === 'tl', c + ' translates ' + k);
    (TEXT[k].match(/\{\w+\}/g) || []).forEach(ph=> ok(t && t.includes(ph), c + ' keeps ' + ph + ' in ' + k)); }); });

// ---- cePowerHTML in node, with the real texts
{ const app = read('arena_app.js'), i = app.indexOf('function cePowerHTML(d){'), j = app.indexOf('\nfunction ceBudgetRefresh', i);
  ok(i > 0 && j > i, 'cePowerHTML found');
  const esc = s=> String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
  const CARD_POWER = {date: '2026-11-07', wr: {up: 62.4, zero: 50.2, down: 41, noadv: 55}, adv: {up: 57.6, zero: 49.6, down: 31}, ps: {up: 0.83}};
  const f = new Function('CARD_POWER', 'TX', 'escapeHtml', 'escapeAttr', 'ui32PowerMarkHTML', 'liveCards', 'CARD_DEFS_BASELINE', app.slice(i, j) + '\nreturn cePowerHTML;')(CARD_POWER, TX, esc, esc, ()=> '', {}, {}); // 2026-11-08: UI32's "edited since rated" mark is stubbed here (tests/ui32 covers it)
  const txt = id=> f({id}).replace(/<[^>]*>/g, '').trim(), tip = id=> (f({id}).match(/title="([^"]*)"/) || [])[1] || '';
  ok(txt('up') === 'Power: +12 · Advanced +8', 'up: ' + txt('up'));
  ok(txt('zero') === 'Power: 0 · Advanced 0', 'zero: ' + txt('zero'));
  ok(txt('down') === 'Power: -9 · Advanced -19', 'down: ' + txt('down'));
  ok(txt('noadv') === 'Power: +5 · Advanced not measured', 'no advanced number: ' + txt('noadv'));
  ok(txt('nope') === 'Power: not measured' && txt(undefined) === 'Power: not measured', 'no row: not measured');
  ok(tip('up').includes('2026-11-07') && tip('up').includes('Played in 83% of the test games.'), 'tooltip: run date and played share (' + tip('up') + ')');
  ok(!tip('down').includes('Played in'), 'no played share in the tooltip without one'); }

// ---- package bookkeeping
ok(/^## 2026-11-07[^\n]*BAL22/m.test(read('docs/CHANGELOG.md')), 'CHANGELOG entry');
ok(/tests\/bal22-2026-11-07\.js/.test(read('tests/run-all.sh')), 'in run-all.sh');
ok(/^## 11-07: Package BAL22 \(on its branch, not released\)/m.test(read('docs/action-items.md')), 'action-items section');

console.log(`bal22: ${n - fail}/${n} checks passed`);
process.exit(fail ? 1 : 0);
