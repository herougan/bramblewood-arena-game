#!/usr/bin/env node
// Package BAL24 (2026-11-07): the simulated reference ladder (owner BAL21-3) and Admin's PRO marks (BAL21-2, owner 09:10 / 09:14). No games
// are played; the checks read the data and the code as they are now.
//   1. the ladder: every PRO entry of Maps 0-20 (main and side) has 10 simulated decks (source "bal24-sim"), ranked weak to strong; each deck
//      is 20 cards from its player's collection (docs/balance/bal24/pools/<map>.json: the owned copies, the rarity caps), its leader a card
//      that player holds and not in the deck; the collections differ between players (random pack draws) from Map 1 on; Maps 21-24 keep their
//      BAL13 / BAL17 ladder; the game bakes the set (tools/opt/ref_decks.js --check); the spread report exists.
//   2. the PRO marks: assemble_arena.py bakes __BAL24_PRO_MARKS__ with the protocol's thresholds (N-SK over 85%, N-WK under 50%, band 15-30%);
//      the built page's marks match the newest pro_ease file with the ladder (recomputed here); the pill sits on the map's N-SK / N-WK nodes and
//      the win-rate line in the skirmish details, both Admin only (run headless with Admin on and off).
//   3. pro_ease plays the weak decks (--kind all / wpro); the texts are TX keys translated in all 12 packs; the protocol, decisions (BAL24-n
//      under 100 words), CHANGELOG and action items carry BAL24; cards.json is untouched by BAL24.
//   node tests/bal24-2026-11-07.js
'use strict';
const fs = require('fs'), path = require('path'), cp = require('child_process');
const ROOT = path.join(__dirname, '..');
const J = f => JSON.parse(fs.readFileSync(path.join(ROOT, f), 'utf8'));
const B = require(path.join(ROOT, 'tools', 'lib_bramble.js')), G = B.G, D = B.CARD_DEFS_BASELINE;
let fail = 0, pass = 0; const ok = (c, m) => { if (c) pass++; else { fail++; console.log('  ✗ ' + m); } };
const size = d => Object.values(d).reduce((t, k) => t + k, 0);

// ---- 1. the simulated ladder ----
const pro = J('canonical/pro-skirmishes.json'), set = J('docs/balance/ref/ref-ladder.json');
ok(fs.existsSync(path.join(ROOT, 'tools', 'bal24', 'ladder_sim_2026_11_07.js')), 'the simulator tool exists');
const ids = Object.keys(pro.maps).filter(id => pro.maps[id].map <= 20);
ok(ids.length === 36, 'Maps 0-20 and their side maps: ' + ids.length + ' PRO entries');
let differ = 0, compared = 0;
for (const id of ids) {
  const L = set.ladder[id]; ok(L && L.source === 'bal24-sim', id + ': a simulated ladder'); if (!L || L.source !== 'bal24-sim') continue;
  const pf = path.join(ROOT, 'docs', 'balance', 'bal24', 'pools', id + '.json'); ok(fs.existsSync(pf), id + ': its pool file'); if (!fs.existsSync(pf)) continue;
  const P = JSON.parse(fs.readFileSync(pf, 'utf8')), seeds = Object.values(P.maps)[0].seeds;
  ok(L.decks.length === 10 && Object.keys(seeds).length === 10, id + ': 10 players, 10 decks');
  ok(L.decks.every((d, i) => d.rank === i + 1 && (i === 0 || d.selectWin >= L.decks[i - 1].selectWin)), id + ': ranked weak to strong');
  ok(new Set(L.decks.map(d => d.player)).size === 10, id + ': one deck a player');
  ok(new Set(L.decks.map(d => d.title)).size === 10, id + ': the names differ within the map');
  L.decks.forEach(d => { const s = seeds[d.player], own = new Set(s.pool);
    ok(size(d.counts) === 20, `${id} rank ${d.rank}: 20 cards`);
    ok(Object.keys(d.counts).every(c => own.has(c) && (s.copies[c] == null || d.counts[c] <= s.copies[c]) && d.counts[c] <= G.maxCopiesForRarity(D[c].rarity)), `${id} rank ${d.rank}: every card from player ${d.player}'s collection, within the owned copies and the rarity cap`);
    ok(d.leader === s.leader && !d.counts[d.leader] && (d.leader === 'wandering-traveller' || D[d.leader]), `${id} rank ${d.rank}: the leader is the player's own and not in the deck`);
    ok((d.parts || []).reduce((t, p) => t + p[1], 0) === 20, `${id} rank ${d.rank}: parts hold 20 copies`); });
  if (P.arrival >= 1) { compared++; const a = Object.values(seeds).map(s => s.pool.join(',')); if (new Set(a).size > 1) differ++; }
}
ok(compared > 30 && differ === compared, `the players' collections differ by the draws (${differ} of ${compared} maps from Map 1 on)`);
['m21', 'm22', 'm23', 'm24'].forEach(id => ok(set.ladder[id] && set.ladder[id].source !== 'bal24-sim' && set.ladder[id].decks.length >= 10, id + ': keeps its BAL13 / BAL17 ladder'));
{ const r = cp.spawnSync('node', [path.join(ROOT, 'tools', 'opt', 'ref_decks.js'), '--check'], { cwd: ROOT, encoding: 'utf8' }); ok(r.status === 0, 'tools/opt/ref_decks.js --check: the simulated ladder is baked'); }
{ const sp = 'docs/balance/bal24/ladder-spread-2026-11-07.json'; ok(fs.existsSync(path.join(ROOT, sp)), 'the spread report'); if (fs.existsSync(path.join(ROOT, sp))) { const s = J(sp); ok(s.k === 10 && s.maps.length === 36 && s.maps.every(m => m.sd != null && m.se != null), 'the spread: K = 10, SD and SE for every map'); } }
// the game deals a simulated deck by map id (refSetFor ladder-k)
{ const m = G.CONQUEST_MAPS.find(x => x.id === 'mc'), n = m.nodes.find(x => x.deck), r = G.refSetFor('ladder-4', 'mc', n);
  ok(r && JSON.stringify(r.deck) === JSON.stringify(set.ladder.mc.decks[3].counts) && r.leader === set.ladder.mc.decks[3].leader, 'refSetFor("ladder-4") deals the map\'s simulated rank-4 deck with its leader'); }

// ---- 2. the PRO marks ----
const asm = fs.readFileSync(path.join(ROOT, 'assemble_arena.py'), 'utf8'), app = fs.readFileSync(path.join(ROOT, 'arena_app.js'), 'utf8');
ok(/__BAL24_PRO_MARKS__/.test(asm) && /"band": \[0\.15, 0\.30\], "skEasy": 0\.85, "wkStrong": 0\.50/.test(asm), 'assemble_arena.py bakes __BAL24_PRO_MARKS__ with 15-30%, 85% and 50%');
ok(/const BAL24_PRO_MARKS = __BAL24_PRO_MARKS__;/.test(app), 'arena_app.js reads the placeholder');
ok(/bal24PillHTML\(e\.id\)/.test(app.slice(app.indexOf('function proMapNodesHTML'), app.indexOf('function ui14ProSpots'))), 'the pill sits on the map\'s N-SK / N-WK nodes (proMapNodesHTML)');
ok(/bal24WinLineHTML\(node\.key, node\.weak\)/.test(app.slice(app.indexOf('function xrefPanelHTML'), app.indexOf('function xrefPanelHTML') + 4000)), 'the win-rate line sits in the skirmish details (xrefPanelHTML)');
const html = fs.readFileSync(path.join(ROOT, 'index.html'), 'utf8'), mm = html.match(/const BAL24_PRO_MARKS = (\{.*?\});\n/);
ok(!!mm, 'index.html carries the baked marks');
const MK = mm ? JSON.parse(mm[1]) : { marks: {} };
// the newest pro_ease file with the ladder, recomputed
{ const dir = path.join(ROOT, 'docs', 'balance'); let best = null;
  fs.readdirSync(dir).filter(f => /^pro-ease-.*\.json$/.test(f)).forEach(f => { let d; try { d = JSON.parse(fs.readFileSync(path.join(dir, f), 'utf8')); } catch (e) { return; } const r = (d.settings || {}).refs || [];
    if (r.includes('map') && r.some(x => /^ladder-/.test(x)) && (!best || (d.generated || '') > (best.d.generated || ''))) best = { f, d }; });
  ok(!!best && MK.file === 'docs/balance/' + best.f, 'the marks come from the newest pro_ease file with the ladder (' + (best && best.f) + ')');
  if (best) { const rows = {}; best.d.rows.forEach(r => (rows[r.id] = rows[r.id] || []).push(r)); let n = 0, wpro = 0;
    for (const id of ids) { const m = pro.maps[id];
      for (const [decks, sfx, weak] of [[(m.bpro && m.bpro.length ? m.bpro : m.pro) || [], '-SK', false], [m.wpro || [], '-WK', true]]) { if (!decks.length) continue;
        const key = decks[0].id.replace(/-[BW]?PRO-\d+$/, '') + sfx, rs = decks.flatMap(e => rows[e.id] || []), lad = rs.filter(r => /^ladder-/.test(r.ref)), mp = rs.filter(r => r.ref === 'map');
        if (!lad.length) { ok(false, key + ': no ladder rows in ' + best.f); continue; } n++; if (weak) wpro++;
        const win = Math.round(lad.reduce((t, r) => t + r.losses, 0) / lad.reduce((t, r) => t + r.n, 0) * 1000) / 1000, mref = Math.round(mp.reduce((t, r) => t + r.wins, 0) / mp.reduce((t, r) => t + r.n, 0) * 1000) / 1000;
        // the flag is per deck: any PRO / BPRO deck the Map reference beats over 85% (N-SK), any WPRO deck under 50% (N-WK)
        const judged = weak ? decks : (m.pro || []).concat(m.bpro || []), hit = judged.map(e => { const rs = (rows[e.id] || []).filter(r => r.ref === 'map'); return rs.length ? [e.id, Math.round(rs.reduce((t, r) => t + r.wins, 0) / rs.reduce((t, r) => t + r.n, 0) * 1000) / 1000] : null; }).filter(x => x && (weak ? x[1] < 0.5 : x[1] > 0.85));
        const flag = hit.length ? (weak ? 'strong' : 'weak') : null, got = MK.marks[key] || {};
        ok(got.win === win && got.mapRef === mref && got.flag === flag && JSON.stringify(got.flagDecks) === JSON.stringify(hit.map(x => x[0])), `${key}: baked mark ${JSON.stringify(got)} = win ${win}, Map reference ${mref}, flag ${flag} ${hit.map(x => x[0])}`); } }
    ok(n >= 60 && wpro >= 30, `marks for every N-SK and N-WK of Maps 0-20 (${n}, ${wpro} N-WK)`); } }
// headless: the pill and the line, Admin on and off
{ const fx = new Function('BAL24_PRO_MARKS', 'TX', 'escapeAttr', 'escapeHtml', 'let adminModeEnabled = false;\n' + B.grab('bal24Mark') + '\n' + B.grab('bal24PillHTML') + '\n' + B.grab('bal24WinLineHTML') + '\nreturn {set: v => { adminModeEnabled = v; }, bal24PillHTML, bal24WinLineHTML};');
  const tx = require(path.join(ROOT, 'bramblewood-texts.js')), T = (k, o) => String(tx.TEXT[k] || k).replace(/\{(\w+)\}/g, (a, b) => o && o[b] != null ? o[b] : a), esc = s => String(s).replace(/"/g, '&quot;');
  const F = fx({ rule: { band: [0.15, 0.3], skEasy: 0.85, wkStrong: 0.5 }, marks: { '3-SK': { win: 0.1, mapRef: 0.6, flag: 'weak', flagDecks: ['3-PRO-2'], flagRef: 0.9 }, '3-WK': { win: 0.6, mapRef: 0.4, flag: 'strong', flagDecks: ['3-WPRO-1'], flagRef: 0.4 }, '4-SK': { win: 0.22, mapRef: 0.7, flag: null } } }, T, esc, esc);
  ok(F.bal24PillHTML('3-SK') === '' && F.bal24WinLineHTML('3-SK', false) === '', 'players see no pill and no line (Admin off)');
  F.set(true);
  ok(/TOO WEAK/.test(F.bal24PillHTML('3-SK')) && /wins 90% against 3-PRO-2/.test(F.bal24PillHTML('3-SK')) && /TOO STRONG/.test(F.bal24PillHTML('3-WK')) && F.bal24PillHTML('4-SK') === '', 'Admin: N-SK "TOO WEAK", N-WK "TOO STRONG", none when unflagged');
  ok(/PRO decks win 22% vs your reference decks/.test(F.bal24WinLineHTML('4-SK', false)) && /data-band="in"/.test(F.bal24WinLineHTML('4-SK', false)), 'Admin: "PRO decks win 22% vs your reference decks", in band');
  ok(/WPRO decks win 60%/.test(F.bal24WinLineHTML('3-WK', true)) && /data-band="out"/.test(F.bal24WinLineHTML('3-WK', true)) && /outside the 15-30% band/.test(F.bal24WinLineHTML('3-WK', true)), 'Admin: an N-WK line out of band'); }
ok(/\.bal24-pill\{/.test(fs.readFileSync(path.join(ROOT, 'arena_template.html'), 'utf8')), 'arena_template.html styles the pill and the line');

// ---- 3. tools, texts, docs ----
const pe = fs.readFileSync(path.join(ROOT, 'tools', 'opt', 'pro_ease.js'), 'utf8'); ok(/'wpro'/.test(pe) && /kindsOf\(o\)/.test(pe), 'pro_ease plays the WPRO decks (--kind all / wpro)');
const texts = fs.readFileSync(path.join(ROOT, 'bramblewood-texts.js'), 'utf8'), keys = ['ui.bal24-too-weak', 'ui.bal24-too-strong', 'ui.bal24-sk-tip', 'ui.bal24-wk-tip', 'ui.bal24-pro-win', 'ui.bal24-wpro-win', 'ui.bal24-band-in', 'ui.bal24-band-out'];
const en = {}; keys.forEach(k => { const m = texts.match(new RegExp('"' + k.replace(/\./g, '\\.') + '": "([^"]+)"')); ok(!!m, 'TX ' + k); if (m) en[k] = m[1]; });
fs.readdirSync(path.join(ROOT, 'lang')).filter(f => f.endsWith('.json')).forEach(f => { const L = J('lang/' + f); Object.values(en).forEach(e => ok(L[e] && L[e] !== e && (e.match(/\{\w+\}/g) || []).every(p => L[e].includes(p)), `lang/${f}: "${e}" translated with its placeholders`)); });
const ep = fs.readFileSync(path.join(ROOT, 'docs', 'evaluation-protocol.md'), 'utf8');
ok(/BAL24/.test(ep) && /ladder_sim_2026_11_07\.js/.test(ep) && /under 50%/.test(ep) && /15-30%/.test(ep), 'docs/evaluation-protocol.md: the ladder method and the N-WK threshold');
const dec = J('docs/decisions.json').items.filter(x => /^BAL24-\d+$/.test(x.id)); ok(dec.length >= 1, 'decisions BAL24-n: ' + dec.length);
dec.forEach(x => { const w = (x.body + ' ' + (x.options || []).join(' ')).split(/\s+/).filter(Boolean).length; ok(w < 100, `${x.id}: ${w} words (under 100)`); ok(x.group === 'game', x.id + ': group game'); });
ok(/^## 2026-11-07 Package BAL24/m.test(fs.readFileSync(path.join(ROOT, 'docs', 'CHANGELOG.md'), 'utf8')), 'CHANGELOG has the BAL24 entry');
ok(/## 11-07: Package BAL24 \(on its branch, not released\)/.test(fs.readFileSync(path.join(ROOT, 'docs', 'action-items.md'), 'utf8')), 'action-items has the BAL24 section');
ok(!/BAL24/.test(fs.readFileSync(path.join(ROOT, 'canonical', 'cards.json'), 'utf8')), 'cards.json: no BAL24 edit');
console.log(`bal24-2026-11-07: ${pass}/${pass + fail} checks passed`);
process.exit(fail ? 1 : 0);
