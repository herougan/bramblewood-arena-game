#!/usr/bin/env node
// 2026-11-11 (package LISTFIX3): the PvP test decks (canonical/pvp-test-decks.json, tools/pvp1) that field a card now out of play. Each such card's
// copies go, as PVP1's own fill step moves copies (tools/pvp1/pvp1.js), to the best in-play card of the deck's 25 seeded cards or the deck itself,
// by PVP1's search measure (2 games an opponent against its gauntlet, the same seeded games for every option); legal (validateDeck with the
// leader; a leader no longer valid is re-picked by the same measure), at most 10 copies shared with any other deck; then PVP1's final measure
// (8 games an opponent) for gauntletWin. fieldWin stays the 11-06 round robin's (marked). Then: node tools/pvp1/pvp1.js apply
//   node tools/listfix3/pvp_2026_11_11.js [--apply] [--workers 2]
'use strict';
const fs = require('fs'), path = require('path');
const L = require('../pvp1/lib.js'), P = require('../pvp1/pvp1.js');
const ROOT = L.ROOT, FILE = path.join(ROOT, 'canonical', 'pvp-test-decks.json'), RAW = JSON.parse(fs.readFileSync(path.join(ROOT, 'docs', 'balance', 'pvp1-2026-11-06.json'), 'utf8'));
const a = process.argv.slice(2), APPLY = a.includes('--apply'), wi = a.indexOf('--workers'), WORKERS = wi >= 0 ? +a[wi + 1] : 2;
const SEARCH_G = 2, FINAL_G = 8, total = d => Object.values(d).reduce((t, k) => t + k, 0), pct = v => Math.round(v * 1000) / 10;
// pvp1.js labelOf / deckCode (not exported there): the main tribe, the curve word, the lead card's name; the Camp > Import code
function labelOf(D, deck) {
  const t = {}; Object.keys(deck).forEach(id => (D[id].archetypes || []).forEach(x => t[x] = (t[x] || 0) + deck[id]));
  const tribe = Object.keys(t).sort((x, y) => t[y] - t[x] || (x < y ? -1 : 1))[0] || 'Mixed';
  const avg = Object.keys(deck).reduce((s, id) => s + (D[id].cost || 0) * deck[id], 0) / 20, free = Object.keys(deck).reduce((s, id) => s + (D[id].cost ? 0 : deck[id]), 0);
  const shape = free >= 14 ? 'Swarm' : avg >= 1.2 ? 'Heavy' : avg >= 0.8 ? 'Midrange' : 'Tempo', lead = Object.keys(deck).sort((x, y) => deck[y] - deck[x] || (x < y ? -1 : 1))[0];
  return { tribe, shape, avgCost: Math.round(avg * 100) / 100, name: tribe + ' ' + shape + ': ' + D[lead].name };
}
const deckCode = d => 'BWD1:' + Buffer.from(JSON.stringify({ n: d.name.slice(0, 40), c: 'castle', l: d.leader, d: d.cards }), 'utf8').toString('base64');
(async () => {
  const gm = L.game(), D = gm.D, inPlay = new Set(L.pool()), leaders = L.leaders(), c = JSON.parse(fs.readFileSync(FILE, 'utf8')), opps = P.gauntlet(), pool = new L.Pool(WORKERS), rows = [];
  const score = async (cand, key, games) => { const r = await pool.run(opps.map(o => ({ a: cand, b: { deck: o.deck, leader: o.leader }, key: key + '|' + o.id, from: 0, to: games }))); return { mean: r.reduce((t, s) => t + s, 0) / (games * opps.length), per: r.map(s => s / games) }; };
  const canAdd = (deck, id, leader) => (deck[id] || 0) < gm.G.maxCopiesForRarity(D[id].rarity) && !(() => { try { return gm.Budget.deckRankBlock(deck, id, D, leader ? [leader] : []); } catch (e) { return false; } })();
  for (const d of c.decks) {
    const out = Object.keys(d.cards).filter(id => !inPlay.has(id)); if (!out.length) continue;
    const raw = RAW.decks.find(x => x.id === d.id) || {}, base = Object.assign({}, d.cards); out.forEach(id => { delete base[id]; });
    const k = total(d.cards) - total(base), others = c.decks.filter(x => x.id !== d.id), key = 'lf3-' + d.id;
    const cands = [...new Set((raw.seedCards || []).concat(Object.keys(base)))].filter(id => inPlay.has(id) && !out.includes(id) && D[id]);
    let leader = leaders.includes(d.leader) ? d.leader : null, best = null;
    for (const first of cands) { // the copies to one card first (up to its cap), the rest to the next best by this order: the deck's own cards
      const deck = Object.assign({}, base); let left = k;
      for (const id of [first].concat(Object.keys(base).filter(x => x !== first))) while (left && canAdd(deck, id, leader)) { deck[id] = (deck[id] || 0) + 1; left--; }
      if (left || L.validate(deck, leader).length || others.some(o => P.shared(o.cards, deck) > P.MAX_SHARED)) continue;
      const s = (await score({ deck, leader }, key, SEARCH_G)).mean; if (!best || s > best.s) best = { deck, s, first };
    }
    if (!best) { rows.push({ id: d.id, out, problem: 'no legal fill' }); console.log(d.id, 'no legal fill for', out.join(', ')); continue; }
    if (!leader) { let top = null; for (const id of leaders.filter(x => !best.deck[x] && !L.validate(best.deck, x).length)) { const s = (await score({ deck: best.deck, leader: id }, key + '|lead', SEARCH_G)).mean; if (!top || s > top.s) top = { id, s }; } leader = top && top.id; }
    const fin = await score({ deck: best.deck, leader }, key + '|final', FINAL_G), lab = labelOf(D, best.deck);
    const row = { id: d.id, out: out.map(id => id + ' x' + d.cards[id]), to: best.first, before: d.cards, after: best.deck, leaderBefore: d.leader, leader, gauntletWinBefore: d.gauntletWin, gauntletWin: pct(fin.mean), name: lab.name };
    rows.push(row); console.log(`${d.id} ${row.out.join(', ')} -> ${best.first} | leader ${d.leader}${leader !== d.leader ? ' -> ' + leader : ''} | gauntlet ${d.gauntletWin} -> ${row.gauntletWin}% | ${lab.name}`);
    if (APPLY) Object.assign(d, { name: lab.name, leader, cards: best.deck, gauntletWin: row.gauntletWin, tribe: lab.tribe, shape: lab.shape, avgCost: lab.avgCost,
      listfix3: `2026-11-11 (LISTFIX3): ${row.out.join(', ')} out of play since SKIR1's lists; the copies to ${best.first} (PVP1's fill measure); gauntletWin re-measured, fieldWin is the 11-06 round robin's` }, { code: null });
    if (APPLY) d.code = deckCode(d);
  }
  pool.close();
  if (APPLY) { fs.writeFileSync(FILE, JSON.stringify(c, null, 1) + '\n'); fs.mkdirSync(path.join(ROOT, 'docs', 'balance', 'listfix3'), { recursive: true });
    fs.writeFileSync(path.join(ROOT, 'docs', 'balance', 'listfix3', 'pvp-2026-11-11.json'), JSON.stringify({ about: 'LISTFIX3 PvP test deck swaps (tools/listfix3/pvp_2026_11_11.js)', rows }, null, 1) + '\n'); }
  console.log(rows.length, 'decks', APPLY ? 'written; next: node tools/pvp1/pvp1.js apply' : '(dry run)');
})().catch(e => { console.error(e); process.exit(1); });
