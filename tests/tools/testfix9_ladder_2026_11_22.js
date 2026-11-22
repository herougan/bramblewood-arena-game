#!/usr/bin/env node
// 2026-11-22 (TESTFIX9): NOC7's deck swap (tools/noc7_decks_2026_11_22.js) put a Moonlit Hare's copies on the nearest card of the MAP's list, so ten
// bal24 ladder decks hold a card their player's saved collection (docs/balance/bal24/pools) does not. This redoes only those swaps, the way the NOC7 tool
// does (nearest budget x1 to the hare, map list, copy cap kept) but from the player's collection and owned copies. It starts from the pre-NOC7 decks
// (the file at NOC7's parent commit, passed as --old <path>); decks that already fit are left as NOC7 wrote them.
//   node tests/tools/testfix9_ladder_2026_11_22.js --old <pre-NOC7 ref-ladder.json> [--apply]
'use strict';
const fs = require('fs'), path = require('path'), ROOT = path.join(__dirname, '..', '..'), APPLY = process.argv.includes('--apply');
const oldPath = process.argv[process.argv.indexOf('--old') + 1];
const O = require(path.join(ROOT, 'tools/opt/deckopt.js')), D1 = require(path.join(ROOT, 'tools/opt/deck1_2026_10_30.js')), SC = require(path.join(ROOT, 'tools/skill_costs.js'));
const T = SC.make(JSON.parse(fs.readFileSync(path.join(ROOT, 'canonical/skill-costs.json'), 'utf8')));
const HARE = 'moonlit-hare', gm = O.loadGame(ROOT), cards = JSON.parse(fs.readFileSync(path.join(ROOT, 'canonical/cards.json'), 'utf8')), by = Object.fromEntries(cards.map(c => [c.id, c]));
const pw = id => T.budget(by[id], { level: 1 }).x1, hp = pw(HARE);
const f = path.join(ROOT, 'docs/balance/ref/ref-ladder.json'), j = JSON.parse(fs.readFileSync(f, 'utf8'));
const old = JSON.parse(fs.readFileSync(oldPath, 'utf8'));
const poolOf = id => { const m = gm.G.CONQUEST_MAPS.find(x => x.id === id), p = D1.deck1Pools(gm, m); return p.anchor.length ? p.anchor : p.list.filter(x => O.deckable(gm, x) && !p.rule(x)); };
const reparts = (parts, to) => { const m = {}; parts.forEach(([id, n, lv]) => { const k = (id === HARE ? to : id) + '|' + lv; m[k] = (m[k] || 0) + n; });
  return Object.keys(m).map(k => { const [id, lv] = k.split('|'); return [id, m[k], +lv]; }).sort((a, b) => a[0] < b[0] ? -1 : a[0] > b[0] ? 1 : a[2] - b[2]); };
let n = 0;
Object.keys(j.ladder).forEach(mid => { const L = j.ladder[mid]; if (L.source !== 'bal24-sim') return;
  const P = JSON.parse(fs.readFileSync(path.join(ROOT, 'docs/balance/bal24/pools', mid + '.json'), 'utf8')), seeds = Object.values(P.maps)[0].seeds, list = poolOf(mid);
  L.decks.forEach((d, i) => { const s = seeds[d.player]; if (Object.keys(d.counts).every(c => s.pool.includes(c) && (s.copies[c] == null || d.counts[c] <= s.copies[c])) && d.counts[d.name.lead]) return;
    const od = old.ladder[mid].decks[i], k = od.counts[HARE]; if (!k) throw new Error(`${mid} deck ${i}: pre-NOC7 deck has no hare`);
    const cap = Math.max(4, ...Object.keys(od.counts).filter(c => c !== HARE).map(c => od.counts[c]));
    const ok = list.filter(id => id !== HARE && by[id] && s.pool.includes(id) && (s.copies[id] == null || s.copies[id] >= (od.counts[id] || 0) + k) && (od.counts[id] || 0) + k <= cap)
      .sort((a, b) => Math.abs(pw(a) - hp) - Math.abs(pw(b) - hp) || (a < b ? -1 : 1));
    const to = ok[0]; if (!to) throw new Error(`${mid} deck ${i}: no replacement`);
    const c = {}; Object.keys(od.counts).forEach(x => { if (x !== HARE) c[x] = od.counts[x]; }); c[to] = (c[to] || 0) + k; d.counts = Object.keys(c).sort().reduce((o, x) => (o[x] = c[x], o), {});
    if (d.parts) d.parts = reparts(od.parts, to); if (d.name && (d.name.lead === HARE || !d.counts[d.name.lead])) { d.title = d.title.replace(by[d.name.lead].name, by[to].name); d.name.lead = to; }
    console.log(`${mid} rank ${d.rank}: ${HARE} x${k} -> ${to}`); n++; }); });
console.log(n + ' deck(s)' + (APPLY ? ' written' : ' (dry run)')); if (APPLY) fs.writeFileSync(f, JSON.stringify(j, null, 1) + '\n');
