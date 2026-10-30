#!/usr/bin/env node
// 2026-10-30 (package DECK1, owner step 4: "Several hard optimised decks per map with different focuses; at most 6 different cards, at most 4
// copies each"): every PRO deck of Maps 0-20 and their side maps with their own list keeps the 6/4 rule and is legal (20 cards, the rarity and
// top-rank caps, the PRO map rule with the map's current list, no road-deck-only card), 2-4 decks a map each with a focus, the previous decks
// kept under `history`, the tools' DECK1 rules (pro_skirmishes 6/4, pro_ease's PREF-3 level) and the build bakes the new decks in. No games.
'use strict';
const path = require('path'), fs = require('fs');
const ROOT = path.join(__dirname, '..');
let fail = 0, n = 0; const ok = (c, m) => { n++; if (!c) { fail++; console.log('  ✗', m); } };
const O = require(path.join(ROOT, 'tools', 'opt', 'deckopt.js')), D1 = require(path.join(ROOT, 'tools', 'opt', 'deck1_2026_10_30.js'));
const P = require(path.join(ROOT, 'tools', 'opt', 'pro_skirmishes.js')), E = require(path.join(ROOT, 'tools', 'opt', 'pro_ease.js'));
const gm = O.loadGame(ROOT), G = gm.G, file = JSON.parse(fs.readFileSync(path.join(ROOT, 'canonical', 'pro-skirmishes.json'), 'utf8'));

// 1. the check of every PRO deck (the 6/4 rule, legality, the map rule, a focus)
const problems = D1.checkAll(gm); problems.forEach(p => ok(false, p)); ok(problems.length === 0, 'every PRO deck: 6 different cards, 4 copies, legal, a focus');
// 2. every map 0-20 with its own list has 2-4 DECK1 decks, distinct focuses, ids N-PRO-k / N-L-PRO-k in order
const maps = D1.mapsUpTo20(gm, null); ok(maps.length >= 30, `the maps 0-20 with their own list (${maps.length})`);
maps.forEach(m => { const e = file.maps[m.id]; if (!e) { ok(false, m.id + ': no PRO entry'); return; }
  const pro = e.pro || [], pre = P.proPrefix(gm, m);
  ok(pro.length >= 2 && pro.length <= 4, `${m.id}: ${pro.length} PRO decks (2-4)`);
  ok(pro.every(x => x.source && x.source.mode === 'deck1'), m.id + ': the PRO decks are DECK1\'s');
  ok(new Set(pro.map(x => x.focus)).size === pro.length, m.id + ': one focus a deck');
  ok(pro.every((x, i) => x.id === `${pre}-PRO-${i + 1}`), m.id + ': ids ' + pro.map(x => x.id).join(', '));
  ok(pro.every((x, i) => i === 0 || x.source.score <= pro[i - 1].source.score), m.id + ': PRO-1 is the strongest on the gauntlet');
  ok(pro.every(x => Object.keys(x.deck).filter(id => D1.deck1Pools(gm, m).anchor.includes(id)).reduce((t, id) => t + x.deck[id], 0) >= (D1.deck1Pools(gm, m).anchor.length ? D1.ANCHOR_MIN : 0)), m.id + ': at least 10 copies from the map\'s list');
  ok(pro.every(x => JSON.stringify(x.leaders) === JSON.stringify(P.leadersFor(gm, m, x.deck))), m.id + ': the showcase leader (from Map 2)'); });
// 3. nothing lost: the previous PRO decks are under history
const withHist = Object.values(file.maps).filter(e => (e.history || []).some(h => h.package === 'DECK1' && (h.pro || []).length));
ok(withHist.length >= 30, `the previous PRO decks are kept under history (${withHist.length} maps)`);
// 4. the tools: pro_skirmishes holds PRO decks to 6/4; pro_ease plays a late side map at PREF-3's level
ok(P.limitProblems({ a: 5, b: 3, c: 3, d: 3, e: 2, f: 2, g: 2 }, { maxUnique: 6, maxCopies: 4 }).length === 2, 'pro_skirmishes: 7 cards and 5 copies are both flagged');
ok(P.limitProblems({ a: 4, b: 4, c: 4, d: 4, e: 2, f: 2 }, { maxUnique: 6, maxCopies: 4 }).length === 0, 'pro_skirmishes: a 6/4 deck passes');
ok(P.parseArgs([]).maxUnique === 6 && P.parseArgs([]).maxCopies === 4, 'pro_skirmishes: 6/4 by default');
const lateMo = E.lateLevelOf(gm, 'mo'); ok(lateMo > 1, `pro_ease: the Old Bramble's PRO plays at PREF-3's level (${lateMo})`);
ok(E.lateLevelOf(gm, 'mb') == null, 'pro_ease: a main map keeps Level 1');
// 5. the build bakes the DECK1 decks in
const html = fs.readFileSync(path.join(ROOT, 'index.html'), 'utf8'), d0 = file.maps.mb.pro[0];
// (assemble_arena.py bakes the game's own fields only: the deck, not the focus; json.dumps spacing)
ok(html.includes(Object.entries(d0.deck).map(([k, v]) => `"${k}": ${v}`).join(', ')), 'index.html holds the DECK1 decks (rebuild: python3 assemble_arena.py && mv bramblewood-arena.html index.html)');
// 6. the report and data
ok(fs.existsSync(path.join(ROOT, 'docs', 'balance', 'deck1-2026-10-30.md')) && fs.existsSync(path.join(ROOT, 'docs', 'balance', 'pro-ease-deck1-2026-10-30.json')), 'the report and the ease measure exist');
console.log(`deck1: ${n - fail}/${n} checks passed`); process.exit(fail ? 1 : 0);
