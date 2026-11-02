#!/usr/bin/env node
// 2026-11-02 (package BAL13, owner 19:56): (1) no Beetle Battering-Ram / Siege Rhino / Hercules Beetle in a road or PRO / BPRO / WPRO deck of a
// map before the one it is priced for (BAL11-3 b; a fight's own first-clear card excepted), the swapped decks keep their size; (2) the reference
// ladder: every PRO entry has 10 legal decks from its map-true pool, ranked weak to strong, checked by tools/opt/ref_decks.js and not baked;
// (3) the summary tool's output (docs/balance/bal13/summary-<date>.md / .json) holds the three parts and the 15% flag; (4) no deck over its
// copy cap under RAR-1 (coordinator 20:19); (5) the card flags file. (Item 4, the strong retune, was dropped by the owner at 20:19.) No games.
'use strict';
const path = require('path'), fs = require('fs'), cp = require('child_process');
const ROOT = path.join(__dirname, '..');
let fail = 0, n = 0; const ok = (c, m) => { n++; if (!c) { fail++; console.log('  ✗', m); } };
const B = require(path.join(ROOT, 'tools', 'lib_bramble.js')), G = B.G;
const DK = require(path.join(ROOT, 'tools', 'bal13', 'decks_2026_11_02.js')), LD = require(path.join(ROOT, 'tools', 'bal13', 'ladder_2026_11_02.js'));
const O = require(path.join(ROOT, 'tools', 'opt', 'deckopt.js')), gm = O.loadGame(ROOT);
const pro = JSON.parse(fs.readFileSync(path.join(ROOT, 'canonical', 'pro-skirmishes.json'), 'utf8'));
const tot = d => Object.values(d).reduce((t, k) => t + k, 0);

// 1. the late-priced cards
const p = DK.plan(); ok(p.rows.length === 0, 'no deck holds a late-priced card before its map: ' + p.rows.map(r => r.where).join(', '));
ok(p.kept.every(k => /first-clear|leader/.test(k.why)), 'the only late copies left are a fight\'s own first-clear card or an explicit leader: ' + p.kept.map(k => k.where + ' ' + k.card).join(', '));
const late = JSON.parse(fs.readFileSync(path.join(ROOT, 'docs', 'balance', 'bal13', 'late-cards-2026-11-02.json'), 'utf8'));
ok(late.rows.length >= 7, 'the applied plan lists the swapped decks (' + late.rows.length + ')');
late.rows.forEach(r => ok(tot(r.after) === tot(r.before), r.where + ': size kept (' + tot(r.before) + ')'));
late.rows.filter(r => r.pro).forEach(r => { const x = (pro.maps[r.loc][r.pro.kind] || []).find(y => y.id === r.pro.id);
  ok(x && /BAL13/.test(x.bal13 || ''), r.where + ': dated bal13 note'); ok(x && Object.keys(x.deck).length <= 6 && Object.values(x.deck).every(k => k <= 4), r.where + ': 6/4 rule'); });
const app = fs.readFileSync(path.join(ROOT, 'arena_app.js'), 'utf8');
late.rows.filter(r => !r.pro).forEach(r => ok(new RegExp(`key:"${r.key}"[^\\n]*BAL13, owner 19:56 on BAL11-3 b`).test(app), r.where + ': dated comment on the deck'));

// 2. the reference ladder
const set = JSON.parse(fs.readFileSync(path.join(ROOT, 'docs', 'balance', 'ref', 'ref-ladder.json'), 'utf8'));
ok(set.id === 'ladder' && set.ladder && !set.decks && set.bake && set.byMapId, 'ref-ladder.json: id "ladder", a per-map "ladder" by map id, baked (owner 22:15)');
Object.keys(pro.maps).forEach(id => { const L = set.ladder[id]; ok(!!L, id + ': has a ladder'); if (!L) return;
  const map = G.CONQUEST_MAPS.find(m => m.id === id), pool = LD.poolOf(gm, map);
  ok(L.decks.length >= 10, `${id}: ${L.decks.length} decks (at least 10)`);
  L.decks.forEach(d => ok(LD.legal(gm, d.counts, pool), `${id} rank ${d.rank}: 20 cards, the caps, every card in the map-true pool`));
  ok(L.decks.every((d, i) => d.rank === i + 1 && (i === 0 || d.selectWin >= L.decks[i - 1].selectWin)), id + ': ranked weak to strong');
  ok(L.decks[L.decks.length - 1].selectWin > L.decks[0].selectWin, id + ': a spread (rank 10 over rank 1)');
  ok(L.decks.every(d => d.name && gm.D[d.name.lead] && d.counts[d.name.lead] && d.name.tactic && d.title), id + ': every deck has a name from its make-up (lead card in the deck, a tactic word)');
  ok(new Set(L.decks.map(d => d.title)).size === L.decks.length, id + ': the names differ within the map');
  ok(L.decks.every(d => d.leader && gm.D[d.leader]), id + ': every deck names its leader (owner 21:37)'); });
// the game deals it (owner 22:15): "Reference (Random)" = the ladder, one of the map's decks uniformly, its name in the label; side maps their own
ok(G.REF_DECK_SETS.ladder && G.REF_DECK_SETS.ladder.perMap && G.REF_DECK_SETS.ladder.byMapId && G.refSetIds()[0] === 'ladder', 'arena_app.js bakes the ladder first (the default "Reference (Random)")');
{ const tx = fs.readFileSync(path.join(ROOT, 'bramblewood-texts.js'), 'utf8'); ok(/"ui\.bal13-ref-deck":/.test(tx) && /"ui\.bal13-deck-name":/.test(tx) && /"ui\.bal13-tactic-band":/.test(tx), 'the name texts are in bramblewood-texts.js');
  for (const id of ['mf', 'mp', 'm6']) { const m = G.CONQUEST_MAPS.find(x => x.id === id), n = m.nodes.find(x => x.deck), L = set.ladder[id], seen = new Set();
    for (let i = 0; i < 400; i++) { let x = (i + 0.5) / 400; const r = G.refSetFor('ladder', id, n, { rnd: () => x }); seen.add(r.pick); if (i === 0) ok(r.deckMap === id && /: /.test(r.label) && r.leader === L.decks[0].leader, id + ': refSetFor deals the map\'s own ladder with its name and leader (' + r.label + ')'); }
    ok(seen.size === L.decks.length, `${id}: the random pick reaches every deck (${seen.size} of ${L.decks.length}, uniform: floor(rnd x n))`);
    const r3 = G.refSetFor('ladder-3', id, n); ok(JSON.stringify(r3.deck) === JSON.stringify(L.decks[2].counts), id + ': ladder-3 is rank 3'); } }
const rd = cp.spawnSync(process.execPath, [path.join(ROOT, 'tools', 'opt', 'ref_decks.js'), '--check'], { encoding: 'utf8' });
ok(rd.status === 0, 'tools/opt/ref_decks.js --check passes (the ladder baked): ' + (rd.stdout || '').split('\n').filter(l => /problem|out of date/.test(l)).join('; '));
ok(/ladder \(Reference ladder/.test(rd.stdout || ''), 'ref_decks.js lists the ladder');

// 3. the summary
const sums = fs.readdirSync(path.join(ROOT, 'docs', 'balance', 'bal13')).filter(f => /^summary-\d{4}-\d\d-\d\d\.json$/.test(f)).sort();
ok(sums.length > 0, 'a summary JSON in docs/balance/bal13/');
if (sums.length) { const s = JSON.parse(fs.readFileSync(path.join(ROOT, 'docs', 'balance', 'bal13', sums[sums.length - 1]), 'utf8')), md = fs.readFileSync(path.join(ROOT, 'docs', 'balance', 'bal13', sums[sums.length - 1].replace(/json$/, 'md')), 'utf8');
  ok(s.totals && s.totals.fights > 200 && s.totals.green <= s.totals.within10 && s.totals.beyond20 === s.totals.beyond20Fights.length, 'summary totals: fights, green, within 10, beyond 20 (+ the list)');
  ok(s.maps.length === Object.keys(set.ladder).length, `summary: every ladder map (${s.maps.length})`);
  ok(s.maps.every(m => m.road && 'weakest' in m.road && 'strongest' in m.road && m.wpro && m.bpro), 'summary: (a) vs WPRO / BPRO and (b) weakest / strongest per map');
  ok(s.strongCap === 0.15 && Array.isArray(s.overStrongCap) && /Map ref vs BPRO-1 \| Flag/.test(md), 'summary: the 15% flag against the strongest deck');
  ok(s.settings.games > 0 && s.settings.roadGames > 0, 'summary: games per pairing stated');
  ok(s.settings.leaders === true && /\*\*Leaders:\*\*/.test(md) && s.maps.every(m => m.leader), 'summary: played with leaders, each map\'s leader named (owner 21:37)');
  ok(/## Road totals/.test(md) && /## Per map/.test(md) && /## Fights more than 20 points off/.test(md), 'summary markdown: the three sections'); }
const ep = fs.readFileSync(path.join(ROOT, 'docs', 'evaluation-protocol.md'), 'utf8');
ok(/summary_2026_11_02\.js/.test(ep) && /ref-ladder\.json/.test(ep), 'docs/evaluation-protocol.md documents the summary and the ladder');

// 4. RAR-1 copy caps (the 13 cards one rarity up, hard-coded in the tool until BAL12's cards.json lands): no road / PRO deck over a copy cap
const t = DK.trimPlan(); ok(t.rows.length === 0, 'no deck over its RAR-1 copy cap: ' + t.rows.map(r => r.where).join(', '));
ok(Object.keys(DK.RAR1).length === 13, 'RAR-1: 13 cards');
const tr = JSON.parse(fs.readFileSync(path.join(ROOT, 'docs', 'balance', 'bal13', 'rar1-trim-2026-11-02.json'), 'utf8'));
tr.rows.forEach(r => ok(tot(r.after) === tot(r.before), r.where + ': size kept after the trim'));
tr.rows.filter(r => r.pro).forEach(r => { const x = (pro.maps[r.loc][r.pro.kind] || []).find(y => y.id === r.pro.id); ok(x && Object.keys(x.deck).length <= 6 && Object.values(x.deck).every(k => k <= 4), r.where + ': 6/4 rule after the trim'); });
// 5. the card flags for the fights more than 20 points off (flags only)
ok(fs.existsSync(path.join(ROOT, 'docs', 'balance', 'bal13', 'card-flags-2026-11-02.md')), 'docs/balance/bal13/card-flags-2026-11-02.md');
ok(/at most 15%/.test(ep) && /owner 2026-11-02 20:19/.test(ep), 'docs/evaluation-protocol.md records the 15% cap against the strongest deck');

console.log(`bal13: ${n - fail}/${n} checks passed`);
process.exit(fail ? 1 : 0);
