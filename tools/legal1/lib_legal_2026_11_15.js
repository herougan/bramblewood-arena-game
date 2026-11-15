// 2026-11-15 (package BAL-LEGAL1): one road fight's full deck legality, for the legal re-fit of BALREL1's 30 held fights.
//   - SKIR1's fight rules: tools/skir1/lib_fight_2026_11_11.js fight(m, n).problems(deck) after SIDE2's holds patch (Carried x2 on side maps built in);
//     a side deck may be smaller than its size (SIDE2-2 e; tests/skir1 accepts it), down to `sideMin` (default: its size - 4, 10 at least);
//   - the map-level lines tests/skir1-2026-11-11.js adds (read the same way, so the search can use them; the test itself stays the final gate):
//     the usage line (a card in at most ucap of the map's fights besides those that keep it, ucap = L.ucapOf + SKIR3's slack extra), the two-card
//     family rule and the mix minimums. Only a NEW or WORSE map line counts against a deck (a line the live decks already break is not this fit's).
// No app logic here: the rules come from lib_fight; the map lines are the test's own reading.
'use strict';
const fs = require('fs'), path = require('path'), ROOT = path.resolve(__dirname, '..', '..');
require('../side2/holds_2026_11_13.js').patch();
const L = require('../skir1/lib_fight_2026_11_11.js'), G = L.G, D = L.D, M = L.M;
const J = f => JSON.parse(fs.readFileSync(path.join(ROOT, f), 'utf8'));
const UT = {}; J('canonical/unit-themes.json').units.forEach(u => { UT[u.id] = u; });
const AT = {}; J('canonical/animal-tags.json').cards.forEach(t => { AT[t.id] = t; });
const family = id => (UT[id] || {}).animalGroup || (AT[id] || {}).group || (D[id] || {}).animal || id;
const MIN = { cost1: 4, cost0: 3, wait1: 4, wait0: 3, lumber: 2, plain: 2, status: 2 };
const S3SLACK = (() => { try { return J('docs/balance/skir3/slack-2026-11-12.json').maps || {}; } catch (e) { return {}; } })();
const byCode = {}, byMap = {};
for (const m of L.maps()) { byMap[m.id] = []; for (const n of L.fightsOf(m)) { const f = L.fight(m, n); byCode[n.key] = { m, n, f }; byMap[m.id].push(n.key); } }
const deckOf = (code, fx) => (fx && fx[code]) || byCode[code].n.deck;
// the map lines for a set of decks (fx: code -> deck overrides): usage overs, family pairs per fight, mix shortfalls
function mapLines(mid, fx) {
  const codes = byMap[mid], out = new Set(), fl = codes.map(c => byCode[c]);
  const shown = new Set([].concat(...codes.map(c => Object.keys(deckOf(c, fx))))), avail = [...new Set([].concat(...fl.map(x => x.f.pool)))];
  for (const k of Object.keys(MIN)) { const a = avail.filter(id => M.kinds(D[id])[k]).length, s = [...shown].filter(id => M.kinds(D[id])[k]).length; if (s < Math.min(MIN[k], a)) out.add(`${mid} mix ${k} ${s}/${Math.min(MIN[k], a)}`); }
  const ucap = L.ucapOf(fl[0].m) + ((S3SLACK[mid] || {}).extra || 0), use = {};
  codes.forEach(c => Object.keys(deckOf(c, fx)).forEach(id => { if (!byCode[c].f.keep.has(id)) use[id] = (use[id] || 0) + 1; }));
  Object.entries(use).filter(([, k]) => k > ucap).forEach(([id, k]) => out.add(`${mid} usage ${id} ${k}>${ucap}`));
  const fam = {}; avail.forEach(id => { fam[family(id)] = (fam[family(id)] || 0) + 1; });
  codes.forEach(c => { const by = {}, d = deckOf(c, fx), f = byCode[c].f; Object.keys(d).filter(id => fam[family(id)] === 2).forEach(id => { (by[family(id)] = by[family(id)] || []).push(id); });
    Object.values(by).filter(p => p.length > 1 && !p.every(id => f.keep.has(id))).forEach(p => out.add(`${c} family ${p.sort().join('+')}`)); });
  return out;
}
const baseLines = {}; Object.keys(byMap).forEach(mid => { baseLines[mid] = mapLines(mid, {}); });
// a usage line is "worse" when its count rises; "x usage id 5>4" and "x usage id 6>4" differ, so a rise shows as a new line
function problemsFull(code, deck, fx, opt) {
  const { m, f } = byCode[code], o = opt || {}, S = L.size(deck);
  const sideMin = o.sideMin != null ? o.sideMin : Math.max(10, f.S - 4);
  let p = f.problems(deck);
  if (f.side && S < f.S && S >= sideMin) p = p.filter(x => x !== `${S} cards, not ${f.S}`);
  const all = Object.assign({}, fx || {}, { [code]: deck }), now = mapLines(m.id, all);
  now.forEach(x => { if (!baseLines[m.id].has(x)) p.push('map: ' + x); });
  return p;
}
module.exports = { L, G, D, byCode, byMap, mapLines, baseLines, problemsFull, family };
if (require.main === module) { // node tools/legal1/lib_legal_2026_11_15.js [--fixes file.jsonl] CODE...   (problems of the decks in the file, or as they stand)
  const a = process.argv.slice(2), i = a.indexOf('--fixes'), fx = {};
  if (i >= 0) fs.readFileSync(a[i + 1], 'utf8').trim().split('\n').filter(Boolean).map(JSON.parse).forEach(x => { if (x.deck && byCode[x.key]) fx[x.key] = x.deck; });
  const codes = a.filter((x, j) => !x.startsWith('--') && !(j > 0 && a[j - 1] === '--fixes'));
  (codes.length ? codes : Object.keys(fx)).forEach(c => { if (!byCode[c]) return; const others = Object.assign({}, fx); delete others[c]; console.log(c, JSON.stringify(deckOf(c, fx)), JSON.stringify(problemsFull(c, deckOf(c, fx), others))); });
}
