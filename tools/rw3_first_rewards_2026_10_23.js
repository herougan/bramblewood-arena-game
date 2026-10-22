#!/usr/bin/env node
// 2026-10-23 (package RW3, owner answers of 00:10, items 5 and 6): every skirmish's first clear pays something.
//   GD2-3 (item 5): "Skirmish exclusives have priority. So move the pack cards."
//   GD2-4 (item 6): "A Skirmish must always give either a pack of that 'season', a faction pack or a skirmish exclusive or a card of that
//                    season's pack"
//   RP3 (item 48):  the Quarry Mole leaves Base and becomes Caves & Alcoves' 8-1 reward (its own move, listed with these).
//
//   node tools/rw3_first_rewards_2026_10_23.js plan    -> prints every main map's skirmishes before / after (no files written)
//   node tools/rw3_first_rewards_2026_10_23.js apply   -> writes the two tables into arena_app.js (GD5-TABLE and RW3-PACKS markers),
//                                                       docs/balance/rw3-first-rewards-2026-10-23.json, and the card moves for
//                                                       tools/rw3_first_rewards_apply_2026_10_23.py (cards.json, map-pools.json)
// The rules, per main map, in road order:
//  1. A skirmish that pays an exclusive card (source {kind:'map', id, node}) keeps it; one that pays a pack or a token keeps it.
//  2. A map with NO exclusive gets some (exclusives have priority): 2 on a map with 4 or more skirmishes, else 1 (the owner's "1-2, max
//     3"). Each is a basic-pack card of that map (canonical/map-pools.json, source {kind:'pack', tier 1, map: this map}) that fights in
//     that skirmish's own deck, within the road's rarity cap, plain on Maps 0-1; the card the skirmish already paid as its first-clear
//     pack card (GD2) first, then the highest rarity (an exclusive should be worth the fight), then the pool's order. It stops being a
//     pack card: its source becomes that skirmish.
//  3. Every other skirmish pays a first-clear card of that map's pack (as GD2's did), in the deck first, then the lowest rarity, not one
//     another skirmish of the map already pays; a map with no pack card left gives a pack instead: that season's pack (Maps 0-5 the
//     Hedgerow Pouch, 6-10 the Tidemire Chest, 11+ the Highcrest Case) and your faction's pack, taking turns, the season pack first.
//     No skirmish pays nothing.
'use strict';
const fs = require('fs'), path = require('path');
const ROOT = path.join(__dirname, '..');
const APP = path.join(ROOT, 'arena_app.js');
const OUT = path.join(ROOT, 'docs', 'balance', 'rw3-first-rewards-2026-10-23.json');
const B = require('./lib_bramble.js'), G = B.G, MAPS = G.CONQUEST_MAPS;
const cards = JSON.parse(fs.readFileSync(path.join(ROOT, 'canonical', 'cards.json'), 'utf8')), byId = Object.fromEntries(cards.map(c=> [c.id, c]));
const pools = JSON.parse(fs.readFileSync(path.join(ROOT, 'canonical', 'map-pools.json'), 'utf8')).maps || {};
const PRIOR = fs.existsSync(OUT) ? JSON.parse(fs.readFileSync(OUT, 'utf8')) : null;
// a re-run plans from the cards as they were before RW3 (the moved cards back to pack cards in memory), so it gives the same plan
if(PRIOR) (PRIOR.moves || []).forEach(m=>{ const c = byId[m.id]; if(c) c.source = m.from; });
const mains = MAPS.filter(m=> !m.sub && !m.reserved);
const PLAIN_UPTO = 1;
const LADDER = ['starter', 'common', 'uncommon', 'rare', 'veryrare', 'superrare', 'epic', 'heroic', 'unique', 'legendary', 'mythic'];
const rStep = r=> { const i = LADDER.indexOf(r); return i < 0 ? 99 : i; };
const isSkirmish = n=> (n.kind || 'skirmish') === 'skirmish' && !n.tower && !n.virtual;
const exclusiveOf = (m, n)=> cards.filter(c=> c.source && c.source.kind === 'map' && c.source.id === m.id && c.source.node === n.key && !c.easterEgg && !c.awaitingSource).map(c=> c.id);
const packPaid = n=> !!(n.firstPack || n.firstFactionPack || (n.rewardTokens || []).length);
const plain = c=> !Object.keys(c.effects || {}).length;
const base = id=> String(id).replace(/~(raid|exposed|illusory)$/, '');
const seasonPack = mi=> mi <= 5 ? 'bronze' : mi <= 10 ? 'silver' : 'gold';
const PACK_NAME = {bronze: 'Hedgerow Pouch', silver: 'Tidemire Chest', gold: 'Highcrest Case'};
// The GD2 table as it stands (the skirmishes' first-clear pack cards before RW3)
const src = fs.readFileSync(APP, 'utf8');
const gdTable = (()=>{ const a = src.indexOf('const SKIRMISH_FIRST_PACK_CARDS = {'), b = src.indexOf('/* GD5-TABLE-END */'); const out = {};
  src.slice(a, b).replace(/'([^']+)': '([^']+)'/g, (m, k, v)=>{ out[k] = v; }); return PRIOR && PRIOR.gdTableBefore ? PRIOR.gdTableBefore : out; })();
// RP3: the Quarry Mole to Caves & Alcoves' 8-1 (a card move of its own, not one of the pack-card moves)
const EXTRA_MOVES = [{id: 'quarry-mole', map: 'm4', node: '8-1', why: 'RP3: out of Base, a Caves & Alcoves reward (owner: "YES! See earlier non-registered complaint")'}];

const table = {}, packs = {}, report = [], moves = [];
mains.forEach((m, mi)=>{
  const sk = m.nodes.filter(isSkirmish);
  const own = (pools[m.id] || {}).cards || [];
  const cands = own.map(id=> byId[id]).filter(c=> c && c.source && c.source.kind === 'pack' && Number(c.source.tier || 1) !== 11 && c.source.map === m.id
    && !c.token && !c.test && !c.easterEgg && c.cardType !== 'equipment' && G.roadRarityOk(c.rarity, mi, 'skirmish', m.id) && (mi > PLAIN_UPTO || plain(c)));
  const extra = EXTRA_MOVES.filter(x=> x.map === m.id);
  const exOf = n=> exclusiveOf(m, n).concat(extra.filter(x=> x.node === n.key && !exclusiveOf(m, n).includes(x.id)).map(x=> x.id));
  const before = sk.map(n=> exclusiveOf(m, n).length ? 'exclusive' : packPaid(n) ? 'pack-or-token' : gdTable[m.id + ':' + n.key] ? 'packCard' : 'none');
  const exCount = sk.filter(n=> exclusiveOf(m, n).length).length;
  const used = new Set();
  // step 2: exclusives for a map with none
  const want = exCount ? 0 : (sk.length >= 4 ? 2 : 1), newEx = {};
  if(want){
    const open = sk.filter(n=> !packPaid(n));
    for(const n of open){ if(Object.keys(newEx).length >= want) break;
      const inDeck = new Set(Object.keys(n.deck || {}).map(base)), prev = gdTable[m.id + ':' + n.key];
      const pick = cands.filter(c=> !used.has(c.id) && inDeck.has(c.id)).sort((a, b)=> ((b.id === prev) - (a.id === prev)) || (rStep(b.rarity) - rStep(a.rarity)) || (own.indexOf(a.id) - own.indexOf(b.id)))[0];
      if(!pick) continue;
      used.add(pick.id); newEx[n.key] = pick.id;
      moves.push({id: pick.id, map: m.id, mapNo: mi, node: n.key, rarity: pick.rarity, from: pick.source, to: {kind: 'map', id: m.id, node: n.key}, why: 'GD2-3: a map with no skirmish-exclusive card (was a pack card of this map)'}); }
  }
  extra.forEach(x=>{ const c = byId[x.id]; if(c) moves.push({id: x.id, map: m.id, mapNo: mi, node: x.node, rarity: c.rarity, from: c.source || 'base', to: {kind: 'map', id: m.id, node: x.node}, why: x.why}); });
  // the exclusives already there, and the new ones, are no pack-card candidates
  sk.forEach(n=> exOf(n).forEach(id=> used.add(id))); Object.values(newEx).forEach(id=> used.add(id));
  // step 3: the rest
  let alt = 0;
  const rows = sk.map(n=>{
    const ex = exOf(n).concat(newEx[n.key] ? [newEx[n.key]] : []);
    if(ex.length) return {key: n.key, kind: 'exclusive', cards: ex, isNew: !!newEx[n.key] || extra.some(x=> x.node === n.key)};
    if(packPaid(n)) return {key: n.key, kind: 'pack-or-token', what: n.firstFactionPack ? 'faction pack' : n.firstPack ? 'free pack ' + n.firstPack : (n.rewardTokens || []).join(',')};
    const inDeck = new Set(Object.keys(n.deck || {}).map(base));
    const pick = cands.filter(c=> !used.has(c.id)).sort((a, b)=> (inDeck.has(b.id) - inDeck.has(a.id)) || (rStep(a.rarity) - rStep(b.rarity)) || (own.indexOf(a.id) - own.indexOf(b.id)))[0];
    if(pick){ used.add(pick.id); table[m.id + ':' + n.key] = pick.id; return {key: n.key, kind: 'packCard', cards: [pick.id], rarity: pick.rarity, inDeck: inDeck.has(pick.id)}; }
    const ref = (alt++ % 2 === 0) ? {kind: 'free', id: seasonPack(mi)} : {kind: 'faction', id: 'mine'};
    packs[m.id + ':' + n.key] = ref;
    return {key: n.key, kind: 'pack', what: ref.kind === 'free' ? PACK_NAME[ref.id] : 'your faction pack'};
  });
  const count = k=> rows.filter(r=> r.kind === k).length, cb = k=> before.filter(x=> x === k).length;
  report.push({map: mi, id: m.id, name: m.name,
    before: {skirmishes: sk.length, exclusive: cb('exclusive'), packCard: cb('packCard'), packOrToken: cb('pack-or-token'), none: cb('none')},
    after: {skirmishes: sk.length, exclusive: count('exclusive'), packCard: count('packCard'), pack: count('pack'), packOrToken: count('pack-or-token'), none: 0},
    rows, candidates: cands.length});
});

const mode = process.argv[2] || 'plan';
const line = r=> `Map ${String(r.map).padStart(2)} ${r.id.padEnd(4)} ${r.name.padEnd(24)} sk ${r.before.skirmishes} | before: excl ${r.before.exclusive}, pack card ${r.before.packCard}, pack/token ${r.before.packOrToken}, none ${r.before.none} | after: excl ${r.after.exclusive}, pack card ${r.after.packCard}, pack ${r.after.pack + r.after.packOrToken}, none 0 | ` +
  r.rows.map(x=> x.key + ':' + (x.kind === 'packCard' ? '🃏' + x.cards[0] : x.kind === 'exclusive' ? (x.isNew ? '★NEW ' : '★') + x.cards.join('+') : x.kind === 'pack' ? '🎁' + x.what : x.kind === 'pack-or-token' ? '🎁' + x.what : '—')).join(' ');
report.forEach(r=> console.log(line(r)));
const tot = (w, k)=> report.reduce((t, r)=> t + (r[w][k] || 0), 0);
console.log(`totals before: exclusive ${tot('before', 'exclusive')}, pack card ${tot('before', 'packCard')}, pack/token ${tot('before', 'packOrToken')}, none ${tot('before', 'none')}`);
console.log(`totals after:  exclusive ${tot('after', 'exclusive')}, pack card ${tot('after', 'packCard')}, pack ${tot('after', 'pack')}, pack/token ${tot('after', 'packOrToken')}, none 0 (of ${tot('after', 'skirmishes')} skirmishes)`);
console.log('moves:'); moves.forEach(x=> console.log(`  ${x.id} (${x.rarity}) -> Map ${x.mapNo} ${x.node} [${x.why}]`));
if(mode === 'apply'){
  let s = src;
  const put = (startTag, endTag, body)=>{ const a = s.indexOf(startTag), b = s.indexOf(endTag); if(a < 0 || b < 0) throw new Error('markers not found: ' + startTag); const head = s.slice(a, s.indexOf('\n', a) + 1); s = s.slice(0, a) + head + body + s.slice(b); };
  put('/* GD5-TABLE-START', '/* GD5-TABLE-END */', 'const SKIRMISH_FIRST_PACK_CARDS = {\n' + Object.entries(table).map(([k, v])=> `  '${k}': '${v}',`).join('\n') + '\n};\n');
  put('/* RW3-PACKS-START', '/* RW3-PACKS-END */', 'const SKIRMISH_FIRST_PACKS = {\n' + Object.entries(packs).map(([k, v])=> `  '${k}': {kind:'${v.kind}', id:'${v.id}'},`).join('\n') + '\n};\n');
  fs.writeFileSync(APP, s);
  fs.writeFileSync(OUT, JSON.stringify({_about: 'RW3 (2026-10-23, owner GD2-3 / GD2-4 / RP3): skirmish first-clear rewards per main map, before and after, and the cards moved out of the packs. Generated by tools/rw3_first_rewards_2026_10_23.js.', gdTableBefore: gdTable, table, packs, moves, maps: report}, null, 1) + '\n');
  console.log('wrote', Object.keys(table).length, 'first-clear pack cards and', Object.keys(packs).length, 'first-clear packs into arena_app.js;', moves.length, 'card moves into', path.relative(ROOT, OUT), '(apply them with python3 tools/rw3_first_rewards_apply_2026_10_23.py)');
}
