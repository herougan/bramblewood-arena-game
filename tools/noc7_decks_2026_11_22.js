#!/usr/bin/env node
// 2026-11-22 (package NOC7, step B, owner 13:22 SGT): Moonlit Hare is on no map list now. Every deck that holds it gets its copies on the legal list
// card nearest in power (budget x1 at Level 1; the map's list under the PROLIST map rule, deck1Pools anchor; a PvP deck: the in-play pool, same rarity first),
// the copy cap kept; nothing else in the deck changes. Decks: canonical/pro-skirmishes.json (current N-PRO / BPRO / WPRO decks, not `history`),
// docs/balance/ref/ref-ladder.json, ref5-prog.json, canonical/pvp-test-decks.json (+ its deck code), the Thistle Baron road deck (arena_app.js 1-5).
//   node tools/noc7_decks_2026_11_22.js [--apply]
'use strict';
const fs = require('fs'), path = require('path'), ROOT = path.join(__dirname, '..'), APPLY = process.argv.includes('--apply');
const O = require('./opt/deckopt.js'), D1 = require('./opt/deck1_2026_10_30.js'), SC = require('./skill_costs.js'), PL = require('./pvp1/lib.js');
const T = SC.make(JSON.parse(fs.readFileSync(path.join(ROOT, 'canonical', 'skill-costs.json'), 'utf8')));
const HARE = 'moonlit-hare', gm = O.loadGame(ROOT), G = gm.G, D = gm.D;
const cards = JSON.parse(fs.readFileSync(path.join(ROOT, 'canonical', 'cards.json'), 'utf8')), by = Object.fromEntries(cards.map(c => [c.id, c]));
const pw = id => T.budget(by[id], { level: 1 }).x1, hp = pw(HARE);
const log = [], rd = f => fs.readFileSync(path.join(ROOT, f), 'utf8');
// counts {id: n} -> same with the hare's copies on the nearest legal card (not the hare; merged copies stay within `cap`)
function swap(counts, pool, where, rarityFirst) {
  const n = counts[HARE]; if (!n) return counts; const cap = Math.max(4, ...Object.values(counts).filter((v, i) => Object.keys(counts)[i] !== HARE));
  const ok = pool.filter(id => id !== HARE && by[id] && (counts[id] || 0) + n <= cap), r0 = by[HARE].rarity;
  if (!ok.length) throw new Error('no replacement for ' + where);
  ok.sort((a, b) => (rarityFirst ? (by[a].rarity === r0 ? 0 : 1) - (by[b].rarity === r0 ? 0 : 1) : 0) || Math.abs(pw(a) - hp) - Math.abs(pw(b) - hp) || (a < b ? -1 : 1));
  const to = ok[0], out = {}; Object.keys(counts).forEach(k => { if (k !== HARE) out[k] = counts[k]; }); out[to] = (out[to] || 0) + n;
  swap.last = to; log.push(`${where}: ${HARE} x${n} -> ${to} (${by[to].attack}/${by[to].health}, ${by[to].rarity})`); return Object.keys(out).sort().reduce((o, k) => (o[k] = out[k], o), {});
}
// a `parts` list ([id, copies, level]): the hare's rows go to `to` (rows of one id and level merged), sorted by id
const reparts = (parts, to) => { const m = {}; parts.forEach(([id, n, lv]) => { const k = (id === HARE ? to : id) + '|' + lv; m[k] = (m[k] || 0) + n; });
  return Object.keys(m).map(k => { const [id, lv] = k.split('|'); return [id, m[k], +lv]; }).sort((a, b) => a[0] < b[0] ? -1 : a[0] > b[0] ? 1 : a[2] - b[2]); };
const mapOf = id => G.CONQUEST_MAPS.find(m => m.id === id);
const poolOf = id => { const m = mapOf(id); if (!m) throw new Error('no map ' + id); const p = D1.deck1Pools(gm, m); return p.anchor.length ? p.anchor : p.list.filter(x => O.deckable(gm, x) && !p.rule(x)); };
const save = (f, j, k) => APPLY && fs.writeFileSync(path.join(ROOT, f), JSON.stringify(j, null, k) + '\n');
// 1. PRO file: the current decks only (history keeps what was played)
{ const f = 'canonical/pro-skirmishes.json', j = JSON.parse(rd(f));
  Object.keys(j.maps).forEach(mid => ['pro', 'bpro', 'wpro'].forEach(k => (j.maps[mid][k] || []).forEach(e => { if (e.deck && e.deck[HARE]) { e.deck = swap(e.deck, poolOf(mid), `${f} ${mid} ${e.id}`); e.leaders = (e.leaders || []).map(l => l === HARE ? swap.last : l); } })));
  save(f, j, 1); }
// 2. reference ladder (each map's decks, by that map's list)
{ const f = 'docs/balance/ref/ref-ladder.json', j = JSON.parse(rd(f));
  Object.keys(j.ladder).forEach(mid => (j.ladder[mid].decks || []).forEach((d, i) => { if (d && d.counts && d.counts[HARE]) { d.counts = swap(d.counts, poolOf(mid), `${f} ${mid} deck ${i}`); if (d.parts) d.parts = reparts(d.parts, swap.last);
      if (d.name && d.name.lead === HARE) { d.name.lead = swap.last; d.title = d.title.replace(by[HARE].name, by[swap.last].name); } } }));
  save(f, j, 1); }
// 3. REF5 progression decks (map number -> the main map's list); the file is one row per line
{ const f = 'docs/balance/ref/ref5-prog.json', lines = rd(f).split('\n'), mainOf = { 10: 'm7', 12: 'mh', 13: 'mr', 14: 'm5', 15: 'ml', 16: 'mt', 17: 'm6' };
  const PP = JSON.parse(rd('docs/balance/ref/ref5-prog-pools.json')), out = lines.map(line => { if (!line.includes(HARE)) return line; const m = /^"(\d+)":(\[.*\])(,?)$/.exec(line); const arr = JSON.parse(m[2]);
    arr.forEach((d, i) => { if (d.counts && d.counts[HARE]) { const own = PP.maps[m[1]].seeds[d.seed], list = poolOf(mainOf[m[1]]); // the seed's collection: the replacement must be one it holds (copies too)
      d.counts = swap(d.counts, list.filter(id => own.pool.includes(id) && (own.copies[id] == null || own.copies[id] >= (d.counts[HARE] + (d.counts[id] || 0)))), `${f} Map ${m[1]} deck ${i}`); if (d.parts) d.parts = reparts(d.parts, swap.last); } });
    return `"${m[1]}":${JSON.stringify(arr)}${m[3]}`; });
  if (APPLY) fs.writeFileSync(path.join(ROOT, f), out.join('\n')); }
// 4. PvP test decks (+ the deck code, as arena_app.js encodeDeckCode); pool: the in-play cards
{ const f = 'canonical/pvp-test-decks.json', j = JSON.parse(rd(f)), pool = PL.pool();
  j.decks.forEach(d => { if (d.cards[HARE]) { d.cards = swap(d.cards, pool.filter(id => !d.cards[id]), `${f} ${d.id}`, true);
    d.code = 'BWD1:' + Buffer.from(JSON.stringify({ n: d.name.slice(0, 40), c: 'castle', l: d.leader, d: d.cards }), 'utf8').toString('base64'); } });
  save(f, j, 1); }
// 5. the road: 1-5 The Thistle Baron (Map 1, mf)
{ const f = 'arena_app.js', src = rd(f), re = /(key:"1-5"[^\n]*?\bdeck:)(\{[^{}]*"moonlit-hare":4[^{}]*\})/, m = re.exec(src);
  if (!m) console.log('1-5 deck: no Moonlit Hare left (already swapped)'); else { const nd = swap(JSON.parse(m[2]), poolOf('mf'), 'arena_app.js 1-5');
  if (APPLY) fs.writeFileSync(path.join(ROOT, f), src.replace(re, (_, a) => a + JSON.stringify(nd))); } }
console.log(log.join('\n') + `\n${log.length} deck(s)${APPLY ? ' written' : ' (dry run)'}`);
