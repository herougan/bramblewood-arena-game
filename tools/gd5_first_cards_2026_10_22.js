#!/usr/bin/env node
// 2026-10-22 (package GD2, owner GD-5, 19:27: "There should be a mix of 'no first clear card', 'first clear skirmish-exclusive card', 'first
// clear pack card reward' and of course pack rewards.. Skirmish exclusive makes up 1-2 (max 3). The rest are a mix of the rest. If it turns
// out there is not much left, then okay."): the skirmishes' first-clear rewards, per main map.
//   node tools/gd5_first_cards_2026_10_22.js plan    -> prints every main map's skirmishes before / after (no files written)
//   node tools/gd5_first_cards_2026_10_22.js apply   -> writes SKIRMISH_FIRST_PACK_CARDS into arena_app.js (between the GD5-TABLE markers)
//                                                       and docs/balance/gd5-first-cards-2026-10-22.json
// The rules:
//  - A skirmish that pays a skirmish-exclusive card (a card whose source is that fight, nodeRewardCardIds) keeps it. Every main map has 0-2
//    of them today, so none is moved (the cap is 3). A map with none keeps none: its own cards sit on its elites and boss, or are its
//    pack cards (call GD2-3).
//  - A skirmish that pays a pack or a token (Map 0's 0-2 faction pack, an ✏️ Edit-rewards token) keeps it. No new free pack or token is
//    added (the economy is tuned around them: call GD2-4).
//  - The other skirmishes alternate, in road order: a first-clear PACK card, then none, then a pack card ... (so ceil(rest / 2) of them pay
//    one). The card: one of that map's own basic-pack cards (canonical/map-pools.json's cards with source {kind:'pack', tier 1, map: this
//    map}), the road's rarity cap for the map holding (roadRarityOk), plain (no skills) on Maps 0-1 (PLAIN_REWARDS_UPTO_MAP), not used by
//    another fight of the map; one that fights in that skirmish's enemy deck first, then the lowest rarity, then the pool's order.
'use strict';
const fs = require('fs'), path = require('path');
const ROOT = path.join(__dirname, '..');
const APP = path.join(ROOT, 'arena_app.js');
const OUT = path.join(ROOT, 'docs', 'balance', 'gd5-first-cards-2026-10-22.json');
const B = require('./lib_bramble.js'), G = B.G, MAPS = G.CONQUEST_MAPS;
const cards = JSON.parse(fs.readFileSync(path.join(ROOT, 'canonical', 'cards.json'), 'utf8')), byId = Object.fromEntries(cards.map(c=> [c.id, c]));
const pools = JSON.parse(fs.readFileSync(path.join(ROOT, 'canonical', 'map-pools.json'), 'utf8')).maps || {};
const mains = MAPS.filter(m=> !m.sub && !m.reserved);
const PLAIN_UPTO = 1;
const LADDER = ['starter', 'common', 'uncommon', 'rare', 'veryrare', 'superrare', 'epic', 'heroic', 'unique', 'legendary', 'mythic'];
const rStep = r=> { const i = LADDER.indexOf(r); return i < 0 ? 99 : i; };
const isSkirmish = n=> (n.kind || 'skirmish') === 'skirmish' && !n.tower && !n.virtual;
const exclusiveOf = (m, n)=> cards.filter(c=> c.source && c.source.kind === 'map' && c.source.id === m.id && c.source.node === n.key && !c.easterEgg && !c.awaitingSource).map(c=> c.id);
const packPaid = n=> !!(n.firstPack || n.firstFactionPack || (n.rewardTokens || []).length);
const plain = c=> !Object.keys(c.effects || {}).length;
const base = id=> String(id).replace(/~(raid|exposed|illusory)$/, '');

const table = {}, report = [];
mains.forEach((m, mi)=>{
  const sk = m.nodes.filter(isSkirmish);
  const own = (pools[m.id] || {}).cards || [];
  const cands = own.map(id=> byId[id]).filter(c=> c && c.source && c.source.kind === 'pack' && Number(c.source.tier || 1) !== 11 && c.source.map === m.id
    && !c.token && !c.test && !c.easterEgg && c.cardType !== 'equipment' && G.roadRarityOk(c.rarity, mi, 'skirmish', m.id) && (mi > PLAIN_UPTO || plain(c)));
  const used = new Set();
  let flip = true; // the first open skirmish gets a pack card
  const rows = sk.map(n=>{
    const ex = exclusiveOf(m, n);
    if(ex.length) return {key: n.key, kind: 'exclusive', cards: ex};
    if(packPaid(n)) return {key: n.key, kind: 'pack-or-token', what: n.firstFactionPack ? 'faction pack' : n.firstPack ? 'free pack ' + n.firstPack : (n.rewardTokens || []).join(',')};
    const give = flip; flip = !flip;
    if(!give) return {key: n.key, kind: 'none'};
    const inDeck = new Set(Object.keys(n.deck || {}).map(base));
    const pick = cands.filter(c=> !used.has(c.id)).sort((a, b)=> (inDeck.has(b.id) - inDeck.has(a.id)) || (rStep(a.rarity) - rStep(b.rarity)) || (own.indexOf(a.id) - own.indexOf(b.id)))[0];
    if(!pick) return {key: n.key, kind: 'none', note: 'no pack card left'};
    used.add(pick.id); table[m.id + ':' + n.key] = pick.id;
    return {key: n.key, kind: 'packCard', cards: [pick.id], rarity: pick.rarity, inDeck: inDeck.has(pick.id)};
  });
  const count = k=> rows.filter(r=> r.kind === k).length;
  const before = {skirmishes: sk.length, exclusive: count('exclusive'), packOrToken: count('pack-or-token'), packCard: 0, none: sk.length - count('exclusive') - count('pack-or-token')};
  const after = {skirmishes: sk.length, exclusive: count('exclusive'), packOrToken: count('pack-or-token'), packCard: count('packCard'), none: count('none')};
  report.push({map: mi, id: m.id, name: m.name, before, after, rows, candidates: cands.length});
});

const mode = process.argv[2] || 'plan';
const line = r=> `Map ${String(r.map).padStart(2)} ${r.id.padEnd(4)} ${r.name.padEnd(24)} skirmishes ${r.before.skirmishes} | before: excl ${r.before.exclusive}, pack/token ${r.before.packOrToken}, none ${r.before.none} | after: excl ${r.after.exclusive}, pack card ${r.after.packCard}, pack/token ${r.after.packOrToken}, none ${r.after.none} | ` +
  r.rows.map(x=> x.key + ':' + (x.kind === 'packCard' ? '🃏' + x.cards[0] + '(' + x.rarity + (x.inDeck ? ',deck' : '') + ')' : x.kind === 'exclusive' ? '★' + x.cards.join('+') : x.kind === 'pack-or-token' ? '🎁' + x.what : '—')).join(' ');
report.forEach(r=> console.log(line(r)));
const tot = k=> report.reduce((t, r)=> t + r.after[k], 0);
console.log(`totals after: exclusive ${tot('exclusive')}, pack card ${tot('packCard')}, pack/token ${tot('packOrToken')}, none ${tot('none')} (of ${tot('skirmishes')} skirmishes)`);
if(mode === 'apply'){
  const src = fs.readFileSync(APP, 'utf8');
  const a = src.indexOf('/* GD5-TABLE-START'), b = src.indexOf('/* GD5-TABLE-END */');
  if(a < 0 || b < 0) throw new Error('GD5 markers not found in arena_app.js');
  const head = src.slice(a, src.indexOf('\n', a) + 1);
  const body = 'const SKIRMISH_FIRST_PACK_CARDS = {\n' + Object.entries(table).map(([k, v])=> `  '${k}': '${v}',`).join('\n') + '\n};\n';
  fs.writeFileSync(APP, src.slice(0, a) + head + body + src.slice(b));
  fs.writeFileSync(OUT, JSON.stringify({_about: 'GD2 / GD-5 (2026-10-22): skirmish first-clear rewards per main map, before and after. Generated by tools/gd5_first_cards_2026_10_22.js.', table, maps: report}, null, 1) + '\n');
  console.log('wrote', Object.keys(table).length, 'first-clear pack cards into arena_app.js and', path.relative(ROOT, OUT));
}
