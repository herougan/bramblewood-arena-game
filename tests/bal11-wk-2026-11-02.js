#!/usr/bin/env node
// 2026-11-02 (package BAL11, owner 14:26: "for every N-SK, there is a N-WK (weak)"): every map with BPRO decks has WPRO decks (the weakest legal
// decks of its list, no Baby cards; tools/opt/wpro_2026_11_02.js), they keep the BPRO deck rule and sit below the map's strongest deck, the build
// bakes them in, and the game's skirmish code gives each such map an N-WK fight beside N-SK that draws from them (no SPECIAL swap). No games.
'use strict';
const path = require('path'), fs = require('fs'), vm = require('vm');
const ROOT = path.join(__dirname, '..');
let fail = 0, n = 0; const ok = (c, m) => { n++; if (!c) { fail++; console.log('  ✗', m); } };
const O = require(path.join(ROOT, 'tools', 'opt', 'deckopt.js')), W = require(path.join(ROOT, 'tools', 'opt', 'wpro_2026_11_02.js')), P = require(path.join(ROOT, 'tools', 'opt', 'pro_skirmishes.js'));
const gm = O.loadGame(ROOT), file = JSON.parse(fs.readFileSync(path.join(ROOT, 'canonical', 'pro-skirmishes.json'), 'utf8'));

// 1. the WPRO decks: legal under the BPRO rule, from the map's list, no Baby card; one entry per map with BPRO decks
const probs = W.checkAll(gm); probs.forEach(p => ok(false, p)); ok(probs.length === 0, 'every WPRO deck: 20 cards, 6 different / 4 copies, the caps, the map\'s list, no Baby card');
const withB = Object.keys(file.maps).filter(id => (file.maps[id].bpro || []).length);
withB.forEach(id => { const e = file.maps[id], w = e.wpro || [];
  ok(w.length >= 1 && w.length <= 2, `${id}: ${w.length} WPRO decks (1-2)`);
  ok(w.every((x, i) => /-WPRO-\d+$/.test(x.id) && x.id.endsWith('-WPRO-' + (i + 1))), id + ': ids ' + w.map(x => x.id).join(', '));
  const best = Math.max(...e.bpro.map(b => (b.source && b.source.score) || 0)); ok(w.every(x => x.source && x.source.score < best), `${id}: the weak decks score under the map's best BPRO (${best})`); });
// 2. the build bakes them in
const html = fs.readFileSync(path.join(ROOT, 'index.html'), 'utf8'), m = /const PRO_SKIRMISHES = (\{.*?\});\n/.exec(html);
ok(!!m, 'index.html holds PRO_SKIRMISHES (rebuild: python3 assemble_arena.py && mv bramblewood-arena.html index.html)');
const baked = m ? JSON.parse(m[1]) : { maps: {} };
ok(withB.every(id => ((baked.maps[id] || {}).wpro || []).length === (file.maps[id].wpro || []).length), 'index.html bakes every map\'s WPRO decks');
// 3. the game's skirmish code (arena_app.js, run in a sandbox with the baked data): N-WK beside N-SK, drawn from the weak decks, no SPECIAL swap
const src = fs.readFileSync(path.join(ROOT, 'arena_app.js'), 'utf8');
const fnSrc = name => { const i = src.indexOf('function ' + name + '('); if (i < 0) throw new Error('no ' + name); let d = 0, j = src.indexOf('{', i);
  for (; j < src.length; j++) { if (src[j] === '{') d++; else if (src[j] === '}' && --d === 0) break; } return src.slice(i, j + 1); };
const reLine = /const PRO_KEY_RE = (\/.*\/);/.exec(src);
const sb = { PRO_SKIRMISHES: baked, SKIRM_SPECIAL_ODDS: 1, getCardDefs: () => gm.D, mpEntry: () => ({ special: Object.keys(gm.D).slice(0, 50) }), mpTopOf: x => x, Math, Object, String, Array };
vm.createContext(sb); vm.runInContext(['skirmDecksOf', 'skirmWeakDecksOf', 'proEntriesOf', 'drawSkirmEnemy'].map(fnSrc).join('\n') + '\nPRO_KEY_RE = ' + reLine[1] + ';', sb);
ok(sb.PRO_KEY_RE.test('3-WK') && sb.PRO_KEY_RE.test('2-B-WK') && sb.PRO_KEY_RE.test('3-SK'), 'PRO_KEY_RE takes N-WK and N-L-WK');
withB.forEach(id => { const ent = JSON.parse(JSON.stringify(baked.maps[id])), list = sb.proEntriesOf(ent), sk = list.find(e => !e.weak), wk = list.find(e => e.weak);
  ok(sk && /-SK$/.test(sk.id) && wk && wk.id === sk.id.replace(/-SK$/, '-WK'), `${id}: N-SK and N-WK (${list.map(e => e.id).join(', ')})`);
  if (!wk) return; const d = sb.drawSkirmEnemy(id, wk, () => 0.01);
  ok(d && !d.special && ent.wpro.some(x => JSON.stringify(x.deck) === JSON.stringify(d.deck)), `${id}: an N-WK draw is one of the map's weak decks, with no SPECIAL card`);
  ok(wk.skirm && wk.decks.length === ent.wpro.length, id + ': N-WK runs as the map\'s skirmish (free, no rewards, a random draw)'); });
// 4. its English labels
const tx = fs.readFileSync(path.join(ROOT, 'bramblewood-texts.js'), 'utf8');
ok(/"ui\.bal11-wk-enemy":/.test(tx) && /"ui\.bal11-wk-node-tip":/.test(tx), 'the N-WK texts are in bramblewood-texts.js');
// 5. the strong / weak report
ok(fs.existsSync(path.join(ROOT, 'docs', 'balance', 'bal11', 'strong-weak-2026-11-02.md')), 'the strong / weak table exists (tools/opt/wpro_2026_11_02.js summary)');
console.log(`bal11-wk: ${n - fail}/${n} checks passed`); process.exit(fail ? 1 : 0);
