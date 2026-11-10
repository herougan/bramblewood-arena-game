#!/usr/bin/env node
// Package REF6 (2026-11-11, owner 00:16: "Make sure the win rates for reference decks are labelled in the skirmish for admins. Also, do the 100 reference
// player decks thing per map, and also let me know the variance in strength of the different decks."). No games are played; the checks read the data and
// the code as they are now.
//   1. docs/balance/ref6/ladder-100.json: the 36 PRO entries of Maps 0-20 (main and side), 100 decks each (players 1..100), every deck legal (20 cards,
//      no faction card, within its rarity's copy cap and, where this machine has the collections cached, within the copies the player holds; the leader a
//      legal card, not in the deck): tools/ref6/ladder.js check's rules; the decks differ between players from Map 1 on.
//   2. the newest complete docs/balance/ref6/ref6-*.json: every map and road fight, the strength spread per map, the owner's table beside it.
//   3. assemble_arena.py bakes __REF6_LABELS__ from that file (the built page carries the same numbers); the label sits in the fight panel; Admin sees
//      "Ref 100: x% (p10 a – p90 b) · Map ref y% · Ref-2 z%", players see nothing (headless, Admin on and off).
//   4. texts: TX keys translated in the 12 packs; docs: balance.md (the one command), evaluation-protocol section 2, CHANGELOG; run-all.sh registers this.
//   node tests/ref6-2026-11-11.js
'use strict';
const fs = require('fs'), path = require('path');
const ROOT = path.join(__dirname, '..');
const J = f => JSON.parse(fs.readFileSync(path.join(ROOT, f), 'utf8')), J0 = f => JSON.parse(fs.readFileSync(f, 'utf8')), R = f => fs.readFileSync(path.join(ROOT, f), 'utf8');
let fail = 0, pass = 0; const ok = (c, m) => { if (c) pass++; else { fail++; console.log('  ✗ ' + m); } };

// ---- 1. the ladder ----
const LA = require(path.join(ROOT, 'tools', 'ref6', 'ladder.js')), gm = require(path.join(ROOT, 'tools', 'opt', 'deckopt.js')).loadGame(ROOT);
const L = J('docs/balance/ref6/ladder-100.json'), ids = LA.entries(null).map(e => e.id);
ok(ids.length === 36, 'Maps 0-20 and their side maps: ' + ids.length + ' PRO entries');
ok(L.players === 100 && /ref6-1 \.\. ref6-100/.test(L.seeds), 'ladder-100.json: 100 players, seeds ref6-1 .. ref6-100');
ids.forEach(id => ok(L.maps[id] && L.maps[id].decks.length === 100, id + ': 100 decks'));
const probs = LA.problems(gm, L); ok(probs.length === 0, 'every deck legal (no faction, copy caps, owned copies, 20 cards, leader): ' + (probs.slice(0, 5).join('; ') || 'ok'));
// the collections differ by the draws (where this machine has them cached); the decks differ where the draws reach the cards optimised decks use
// (on 9 maps every player builds the same deck: those cards all come from fixed rewards)
{ const cf = p => path.join(LA.CACHE, 'pools', `ref6-${p}.json`);
  if (fs.existsSync(cf(1)) && fs.existsSync(cf(2))) { const a = J0(cf(1)), b = J0(cf(2)); ok(Object.keys(a.at).filter(k => +k >= 1).every(k => JSON.stringify(a.at[k]) !== JSON.stringify(b.at[k])), 'players 1 and 2 hold different collections at every arrival from Map 1'); }
  const multi = ids.filter(id => new Set(L.maps[id].decks.map(d => JSON.stringify(d.counts) + d.leader)).size > 1).length;
  ok(multi >= 24, `the decks differ between players on ${multi} of 36 maps`); }
ok(Object.values(L.maps).every(M => M.decks.every(d => d.strength == null || (d.strength >= 0 && d.strength <= 100))), 'strength scores are win rates (0-100)');

// ---- 2. the measure ----
const dir = path.join(ROOT, 'docs', 'balance', 'ref6'); let best = null;
fs.readdirSync(dir).filter(f => /^ref6-.*\.json$/.test(f)).forEach(f => { const d = JSON.parse(fs.readFileSync(path.join(dir, f), 'utf8')); if (d.complete && (!best || d.generated > best.d.generated)) best = { f, d }; });
ok(!!best, 'a complete measure in docs/balance/ref6/ (node tools/ref6/measure.js --tag <t>)');
if (best) { const D = best.d, roadFights = require(path.join(ROOT, 'tools', 'bal13', 'ladder_2026_11_02.js')).roadFights;
  ok(fs.existsSync(path.join(dir, best.f.replace(/\.json$/, '.md'))), best.f + ': the owner\'s table beside it');
  ok(ids.every(id => D.maps[id]), best.f + ': every map');
  ids.forEach(id => { const M = D.maps[id], map = LA.mapOf(gm, id); if (!M) return; const want = roadFights(gm, map).map(x => x.key);
    ok(want.every(k => M.fights[k] && M.fights[k].mean != null && M.fights[k].p10e <= M.fights[k].p90e && M.fights[k].games >= D.fightGames && M.fights[k].n >= D.games), `${id}: every road fight measured (${want.length}), at least ${D.fightGames} games a fight and ${D.games} a deck`);
    const s = M.strength; ok(s && s.mean != null && s.sd != null && s.sdTrue <= s.sd + 1e-9 && s.p10 <= s.p90 && s.min <= s.max && M.decks.length === 100, `${id}: the strength spread of its 100 decks`); }); }

// ---- 3. the bake and the label ----
const asm = R('assemble_arena.py'), app = R('arena_app.js');
ok(/__REF6_LABELS__/.test(asm) && /docs\/balance\/ref6\/ref6-\*\.json/.test(asm), 'assemble_arena.py bakes __REF6_LABELS__ from the newest complete ref6-*.json');
ok(/const REF6_LABELS = __REF6_LABELS__;/.test(app), 'arena_app.js reads the placeholder');
{ const i = app.indexOf('id="cnpEditSkirmish"'), j = app.lastIndexOf('ref6LabelHTML(map.id, selectedNode)', i); ok(j > 0 && i - j < 2000, 'the label sits in the fight panel, by the admin buttons'); }
const html = R('index.html'), mm = html.match(/const REF6_LABELS = (\{.*?\});\n/);
ok(!!mm, 'index.html carries the baked labels');
if (mm && best) { const B = JSON.parse(mm[1]); ok(B.file === 'docs/balance/ref6/' + best.f && B.players === 100, 'the labels come from ' + best.f);
  let n = 0, same = 0; Object.keys(best.d.maps).forEach(id => Object.keys(best.d.maps[id].fights).forEach(k => { const x = best.d.maps[id].fights[k], b = B.fights[id + ':' + k]; n++;
    if (b && b[0] === x.mean && b[1] === x.p10e && b[2] === x.p90e && b[3] === x.mapRef && b[4] === x.ref2 && b[5] === x.games) same++; }));
  ok(n > 200 && same === n, `every road fight's label matches the measure (${same}/${n})`); }
{ const Bl = require(path.join(ROOT, 'tools', 'lib_bramble.js')), tx = require(path.join(ROOT, 'bramblewood-texts.js'));
  const T = (k, o) => String(tx.TEXT[k] || k).replace(/\{(\w+)\}/g, (a, b) => o && o[b] != null ? o[b] : a), esc = s => String(s).replace(/&/g, '&amp;').replace(/"/g, '&quot;').replace(/</g, '&lt;');
  const fx = new Function('REF6_LABELS', 'TX', 'escapeAttr', 'escapeHtml', 'let adminModeEnabled = false;\n' + Bl.grab('ref6LabelHTML') + '\nreturn {set: v => { adminModeEnabled = v; }, ref6LabelHTML};');
  const F = fx({ tag: 't1', generated: '2026-11-11T02:00:00Z', games: 16, refGames: 40, players: 100, fights: { 'mc:3-2': [52.4, 31.2, 69.6, 61, 74, 304], 'mc:3-3': [40, 30, 50, null, null, 160] } }, T, esc, esc), node = { key: '3-2' };
  ok(F.ref6LabelHTML('mc', node) === '', 'players see no label (Admin off)');
  F.set(true); const h = F.ref6LabelHTML('mc', node);
  ok(/Ref 100: 52% \(p10 31 – p90 70\)/.test(h) && /Map ref 61%/.test(h) && /Ref-2 74%/.test(h), 'Admin: "Ref 100: 52% (p10 31 – p90 70) · Map ref 61% · Ref-2 74%"');
  ok(/title="Measure t1, 2026-11-11: the 100 reference players&#39;|title="Measure t1, 2026-11-11: the 100 reference players'/.test(h) && /304 games in all \(at least 16 a deck\)/.test(h), 'the tooltip names the measure, its date and games');
  ok(!/· Map ref/.test(F.ref6LabelHTML('mc', { key: '3-3' })) && /Ref 100: 40%/.test(F.ref6LabelHTML('mc', { key: '3-3' })) && F.ref6LabelHTML('mc', { key: '3-9' }) === '' && F.ref6LabelHTML('m21', node) === '', 'no Map ref part without its number; nothing on a fight with no measure'); }

// ---- 4. texts, docs, tests ----
const texts = R('bramblewood-texts.js'), keys = ['ui.ref6-label', 'ui.ref6-mapref', 'ui.ref6-ref2', 'ui.ref6-tip'], en = {};
keys.forEach(k => { const m = texts.match(new RegExp('"' + k.replace(/\./g, '\\.') + '": "((?:[^"\\\\]|\\\\.)+)"')); ok(!!m, 'TX ' + k); if (m) en[k] = JSON.parse('"' + m[1] + '"'); });
fs.readdirSync(path.join(ROOT, 'lang')).filter(f => f.endsWith('.json')).forEach(f => { const P = J('lang/' + f); Object.values(en).forEach(e => ok(P[e] && (e.match(/\{\w+\}/g) || []).every(p => P[e].includes(p)), `lang/${f}: "${e.slice(0, 40)}" translated with its placeholders`)); });
ok(/node tools\/ref6\/measure\.js --tag/.test(R('docs/workflows/balance.md')), 'balance.md: the one-command measure');
const ep = R('docs/evaluation-protocol.md'), s2 = ep.slice(ep.indexOf('## 2. Reference decks'), ep.indexOf('## 3.'));
ok(/REF6/.test(s2) && /ref6-1/.test(s2) && /ladder-100\.json/.test(s2), 'evaluation-protocol section 2: the REF6 reference set');
ok(/^## 2026-11-11 Package REF6/m.test(R('docs/CHANGELOG.md')), 'CHANGELOG has the REF6 entry');
ok(/run node tests\/ref6-2026-11-11\.js/.test(R('tests/run-all.sh')), 'run-all.sh registers this test');
console.log(`ref6-2026-11-11: ${pass}/${pass + fail} checks passed`);
process.exit(fail ? 1 : 0);
