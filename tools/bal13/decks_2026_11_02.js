#!/usr/bin/env node
// 2026-11-02 (package BAL13, owner 19:56 on BAL11-3: "b) take Beetle Battering-Ram and Siege Rhino (and Hercules Beetle) out of the earlier
// fights' decks"): the three cards are priced for a later map than the fights that field them (Beetle Battering-Ram and Siege Rhino as Map 23
// cards, Hercules Beetle as a Map 18 card; docs/balance/bal11/blind-spots-2026-11-02.md), so every copy in a road fight or a PRO / BPRO / WPRO
// deck of an earlier map goes to the nearest card of that fight's own list, the way BAL9 swapped the cut cards (tools/bal9/decks_2026_11_02.js).
//
//   node tools/bal13/decks_2026_11_02.js            dry run: every deck that holds one of the cards too early, and its swap
//   node tools/bal13/decks_2026_11_02.js --apply    write the road decks (arena_app.js CONQUEST_MAPS nodes, a dated comment on each) and the
//                                                   PRO / BPRO / WPRO decks (canonical/pro-skirmishes.json, a dated `bal13` note on each)
//   node tools/bal13/decks_2026_11_02.js --check    exit 1 when a deck still holds one of them too early (kept first-clear cards excepted)
//
// "Too early": the fight's map number (a side map counts as its main map, G.mapNumberOf) is below the card's priced map (LATE below). The map
// lists are not touched (the owner chooses the lists).
// THE SWAP (BAL9's): the copies go to ONE card of the fight's own list (tools/lib_map_pools.js fightPool: a main map's MAP + SPECIAL, a side
// map's SUBMAP + SPECIAL), inside the fight's rarity cap and the card's copy cap: the nearest by Lumber, Wait and 2A + H (+ Stone / Metal and
// the rarity step), a card the deck already holds first at equal distance; the rest of the copies to the next nearest. Never a Baby card or
// egg (BAL11), another fight's own reward card, or one of the late cards. Kept: the deck's size, its first-clear cards (a late card that is
// the fight's own first-clear card stays and is reported), an explicit leader (node.leaders / leaderId / showcase), and K14 (BAL7: a card not
// unique to the map at most 1 copy, 6 such copies in all; a swap may not add a K14 problem nor non-unique copies past 6). An Auto leader
// (the deck's showcase pick) moves with the deck, as it did in BAL9. PRO / BPRO / WPRO decks: DECK1's 6/4 rule (at most 4 copies, 6
// different cards) inside the deck's own rarity cap; they are not re-searched (their h2h scores are from before the swap).
'use strict';
const fs = require('fs'), path = require('path');
const L = require('../bal9/lib_bal9.js'), ROOT = L.ROOT;
const { G, D, LP, pools } = L.game();
const K14 = require(path.join(ROOT, 'tools', 'bal7_k14_decks_2026_10_28.js'));
const DATE = '2026-11-02', OUTDIR = path.join(ROOT, 'docs', 'balance', 'bal13');
const APP = path.join(ROOT, 'arena_app.js'), PRO = path.join(ROOT, 'canonical', 'pro-skirmishes.json');
// the card -> the map it is priced for (BAL11-3: Map 23 for the two siege cards, Map 18 for Hercules Beetle)
const LATE = { 'beetle-battering-ram': 23, 'siege-rhino': 23, 'hercules-beetle': 18 };
const maps = G.CONQUEST_MAPS;
// 2026-11-02 (BAL13, coordinator 20:19): RAR-1 (owner 19:52, applied by BAL12 in canonical/cards.json in parallel): 13 cards one rarity up. This
// worktree's cards.json does not have them yet, so the new rarities are hard-coded here for the copy-cap trim (`trim`) and the swap's caps.
const RAR1 = { 'beetle-battering-ram': 'veryrare', 'siege-rhino': 'veryrare', 'nautilus-drifter': 'veryrare', 'tide-spirit': 'veryrare', 'trapdoor-spider': 'veryrare', 'magma-salamander': 'veryrare',
  'echidna-quillshot': 'superrare', 'pangolin-roller': 'rare', 'vampire-bat': 'rare', 'dune-packrat': 'rare', 'coral-polyp-colony': 'uncommon', 'thorny-devil': 'uncommon', 'dung-beetle': 'uncommon' };
const rarityOf = id => (D[id] || {}).rarity; // 2026-11-03: BAL12 merged, cards.json has the RAR-1 rarities (RAR1 stays as the list)
const capOf = id => G.maxCopiesForRarity(rarityOf(id));
const stat = id => { const d = D[id] || {}; return 2 * (+d.attack || 0) + (+d.health || 0); };
const dist = (a, b) => { const x = D[a] || {}, y = D[b] || {}; return 3 * Math.abs((+x.cost || 0) - (+y.cost || 0)) + Math.abs((+x.wait || 0) - (+y.wait || 0)) + Math.abs(stat(a) - stat(b)) / 3 + 2 * Math.abs(((+x.stoneCost || 0) + (+x.metalCost || 0)) - ((+y.stoneCost || 0) + (+y.metalCost || 0)))
  + 4 * Math.abs(L.step(rarityOf(a)) - L.step(rarityOf(b))) + (L.step(rarityOf(b)) > L.step(rarityOf(a)) ? 2 : 0); }; // tools/bal9/decks_2026_11_02.js dist (RAR-1 rarities)
const isBaby = id => /^egg-/.test(id) || (D[id] || {}).kind === 'baby';
const otherReward = (c, keep) => { const s = (D[c] || {}).source; return !!(s && s.kind === 'map') && !(keep && keep.has(c)); };
const lateFor = (id, mapNo) => LATE[id] != null && mapNo != null && mapNo < LATE[id];
function poolFor(m) { const p = LP.fightPool(pools, m.id, m.sub ? m.parent : null); return p ? [...p] : []; }
const firstPack = (() => { try { return L.firstPackTable(fs.readFileSync(APP, 'utf8')); } catch (e) { return {}; } })();
function firstClearOf(m, n) { const s = new Set(); try { (G.nodeRewardCardIds(m.id, n.key) || []).forEach(id => s.add(id)); } catch (e) {} if (firstPack[m.id + ':' + n.key]) s.add(firstPack[m.id + ':' + n.key]); if (n.firstCard) [].concat(n.firstCard).forEach(id => s.add(id)); return s; }
function explicitLeaders(n) { return new Set([].concat(Array.isArray(n.leaders) ? n.leaders : [], n.leaderId ? [n.leaderId] : [], n.showcase ? [n.showcase] : [])); }

// swap `ids` out of `deck`: cand = the fight's list, cap = its rarity cap, check(deck) true when acceptable, rule {maxCopies, maxUnique}
function swapOut(deck, ids, cand, cap, check, keep, rule) {
  rule = rule || {}; const out = Object.assign({}, deck), moves = [];
  const capR = c => Math.min(capOf(c), rule.maxCopies || 99), roomNew = c => out[c] || !rule.maxUnique || Object.keys(out).length < rule.maxUnique;
  const pref = c => rule.prefer && !rule.prefer.has(c) ? 100 : 0; // a PRO deck: DECK1's anchor (the list under the map-true rule) first
  const take = Array.isArray(ids) ? Object.fromEntries(ids.map(id => [id, deck[id]])) : ids; // BAL13 trim: {id: copies to move}
  const order = Object.keys(take); order.forEach(id => { out[id] -= take[id]; if (out[id] <= 0) delete out[id]; }); // every card's copies out first, then placed
  const room = () => Object.keys(out).reduce((t, y) => t + Math.max(0, capR(y) - out[y]), 0);
  for (const [oi, id] of order.entries()) {
    let k = take[id]; const later = order.slice(oi + 1).reduce((t, y) => t + take[y], 0);
    const opts = cand.filter(c => D[c] && !D[c].token && !D[c].test && !isBaby(c) && LATE[c] == null && c !== id && L.step(rarityOf(c)) <= L.step(cap) && !otherReward(c, keep))
      .sort((a, b) => (dist(id, a) + pref(a)) - (dist(id, b) + pref(b)) || ((out[b] ? 1 : 0) - (out[a] ? 1 : 0)) || (a < b ? -1 : 1));
    const got = [];
    for (const c of opts) { if (!k) break; if (rule.maxUnique && !out[c] && Object.keys(out).length === rule.maxUnique - 1 && capR(c) < k + later - room()) continue; // the last free slot: a card that takes every copy the deck has no room for
      while (k && (out[c] || 0) < capR(c) && roomNew(c)) { out[c] = (out[c] || 0) + 1; if (check && !check(out)) { out[c]--; if (!out[c]) delete out[c]; break; } k--; got.push(c); } }
    if (k) Object.keys(out).filter(c => c !== id).sort((a, b) => out[b] - out[a]).forEach(c => { while (k && out[c] < capR(c)) { out[c]++; if (check && !check(out)) { out[c]--; break; } k--; got.push(c); } });
    const to = {}; got.forEach(c => { to[c] = (to[c] || 0) + 1; });
    moves.push({ out: id, copies: take[id], to, left: k });
  }
  return { deck: out, moves };
}
function plan() {
  const rows = [], kept = [], pro = JSON.parse(fs.readFileSync(PRO, 'utf8')), F = {};
  K14.fights().forEach(f => { F[f.map + ':' + f.key] = f; });
  for (const m of maps) {
    if (m.tower || m.reserved) continue; const no = G.mapNumberOf(m.id); if (no == null) continue;
    for (const n of m.nodes || []) {
      if (!n.deck) continue; const late = Object.keys(n.deck).filter(id => lateFor(id, no)); if (!late.length) continue;
      const first = firstClearOf(m, n), lead = explicitLeaders(n), keep = new Set([...first, ...lead]);
      late.filter(id => keep.has(id)).forEach(id => kept.push({ where: `node ${m.id}:${n.key}`, map: no, card: id, copies: n.deck[id], why: first.has(id) ? 'the fight\'s own first-clear card' : 'an explicit leader' }));
      const go = late.filter(id => !keep.has(id)); if (!go.length) continue;
      const cap = G.roadRarityCap(no, n.kind || 'skirmish', m.id) || 'mythic', f = F[m.id + ':' + n.key];
      const VV = d => f ? K14.violations(Object.assign({}, f, { n: Object.assign({}, f.n, { deck: d }) }), d) : [];
      const nu = d => { const x = VV(d).map(s => /^(\d+) non-unique copies$/.exec(s)).find(Boolean); return x ? +x[1] : 0; };
      const v0 = VV(n.deck).length, nu0 = nu(n.deck);
      const check = f ? (d => VV(d).length <= v0 && nu(d) <= Math.max(6, nu0)) : null;
      // the check runs on a partial deck while copies are still being placed; a deck short of copies is fine for K14 (fewer copies)
      const r = swapOut(n.deck, go, poolFor(m), cap, check, keep);
      rows.push({ where: `node ${m.id}:${n.key}`, map: no, loc: m.id, key: n.key, kind: n.kind || 'skirmish', before: n.deck, after: r.deck, moves: r.moves, k14: f ? { before: VV(n.deck), after: VV(r.deck) } : 'exempt' });
    }
  }
  for (const [mid, e] of Object.entries(pro.maps || {})) {
    const m = maps.find(x => x.id === mid); if (!m) continue; const no = G.mapNumberOf(mid);
    for (const kind of ['pro', 'bpro', 'wpro']) for (const x of (e[kind] || [])) {
      const late = Object.keys(x.deck || {}).filter(id => lateFor(id, no)); if (!late.length) continue;
      const cap = (x.source && x.source.cap) || G.roadRarityCap(no, 'boss', mid) || 'mythic';
      const r = swapOut(x.deck, late, poolFor(m), cap, null, new Set(), { maxCopies: 4, maxUnique: 6 });
      rows.push({ where: `${kind} ${x.id}`, map: no, loc: mid, pro: { kind, id: x.id }, before: x.deck, after: r.deck, moves: r.moves });
    }
  }
  return { rows, kept, pro };
}
// BAL13 (coordinator 20:19, RAR-1): every road and PRO / BPRO / WPRO deck holding more copies of a card than its (new) rarity's copy cap gives
// the extra copies to the list's nearest card (the same swap). A kept card (first-clear, explicit leader) is trimmed too: the cap is the rule.
function trimPlan() {
  const rows = [], pro = JSON.parse(fs.readFileSync(PRO, 'utf8')), F = {}, overCap = [];
  K14.fights().forEach(f => { F[f.map + ':' + f.key] = f; });
  for (const m of maps) {
    if (m.tower || m.reserved) continue; const no = G.mapNumberOf(m.id); if (no == null) continue;
    for (const n of m.nodes || []) {
      if (!n.deck) continue; const cap = G.roadRarityCap(no, n.kind || 'skirmish', m.id) || 'mythic';
      Object.keys(n.deck).filter(id => RAR1[id] && !m.endless && L.step(rarityOf(id)) > L.step(cap)).forEach /* the RAR-1 cards only; the endless dungeons' floors are dealt from themes */(id => overCap.push({ where: `node ${m.id}:${n.key}`, map: no, loc: m.id, key: n.key, card: id, rarity: rarityOf(id), cap, copies: n.deck[id], kept: firstClearOf(m, n).has(id) || explicitLeaders(n).has(id) }));
      const extra = {}; Object.keys(n.deck).forEach(id => { const x = n.deck[id] - capOf(id); if (x > 0 && D[id]) extra[id] = x; }); if (!Object.keys(extra).length) continue;
      const keep = new Set([...firstClearOf(m, n), ...explicitLeaders(n)]), f = F[m.id + ':' + n.key];
      const VV = d => f ? K14.violations(Object.assign({}, f, { n: Object.assign({}, f.n, { deck: d }) }), d) : [];
      const nu = d => { const x = VV(d).map(s => /^(\d+) non-unique copies$/.exec(s)).find(Boolean); return x ? +x[1] : 0; };
      const v0 = VV(n.deck).length, nu0 = nu(n.deck), check = f ? (d => VV(d).length <= v0 && nu(d) <= Math.max(6, nu0)) : null;
      const r = swapOut(n.deck, extra, poolFor(m), cap, check, keep);
      rows.push({ where: `node ${m.id}:${n.key}`, map: no, loc: m.id, key: n.key, kind: n.kind || 'skirmish', before: n.deck, after: r.deck, moves: r.moves, k14: f ? { before: VV(n.deck), after: VV(r.deck) } : 'exempt' });
    }
  }
  for (const [mid, e] of Object.entries(pro.maps || {})) {
    const m = maps.find(x => x.id === mid); if (!m) continue; const no = G.mapNumberOf(mid);
    for (const kind of ['pro', 'bpro', 'wpro']) for (const x of (e[kind] || [])) {
      const extra = {}; Object.keys(x.deck || {}).forEach(id => { const k = x.deck[id] - Math.min(4, capOf(id)); if (k > 0 && D[id]) extra[id] = k; }); if (!Object.keys(extra).length) continue;
      const cap = (x.source && x.source.cap) || G.roadRarityCap(no, 'boss', mid) || 'mythic';
      const rule = { maxCopies: 4, maxUnique: 6, prefer: anchorOf(m) }, lead = new Set(x.leaders || []);
      let r = swapOut(x.deck, extra, poolFor(m), cap, null, new Set(), rule), whole = [];
      // a 6-card deck whose cards are all at their caps has no room for the extra copy under the 6/4 rule: then the trimmed card leaves the deck
      // whole and all its copies go to the list's nearest (the freed slot takes a new card); reported as `whole`
      // (the showcase leader is never the card that leaves: then the deck's smallest other card leaves instead)
      if (r.moves.some(v => v.left)) { const ex2 = {}; r.moves.filter(v => v.left).forEach(v => {
          const victim = lead.has(v.out) ? Object.keys(x.deck).filter(id => id !== v.out && !lead.has(id) && !extra[id]).sort((a, b) => x.deck[a] - x.deck[b] || dist(v.out, a) - dist(v.out, b))[0] : v.out;
          if (victim) { whole.push(victim); ex2[victim] = x.deck[victim]; } });
        Object.keys(extra).forEach(id => { if (ex2[id] == null) ex2[id] = extra[id]; }); // the card leaving whole goes first, so its slot is free for the extra copies
        r = swapOut(x.deck, ex2, poolFor(m), cap, null, new Set(), rule); }
      // DECK1's anchor rule (at least 10 copies from the map's list): when the trim left it short, a non-list card (not the leader) leaves whole
      const A = anchorOf(m), ac = d => A ? Object.keys(d).reduce((t, id) => t + (A.has(id) ? d[id] : 0), 0) : 0;
      if (A && ac(r.deck) < Math.min(10, ac(x.deck))) { const victim = Object.keys(x.deck).filter(id => !A.has(id) && !lead.has(id) && !extra[id]).sort((a, b) => x.deck[a] - x.deck[b])[0];
        if (victim) { const ex3 = Object.assign({ [victim]: x.deck[victim] }, extra), r3 = swapOut(x.deck, ex3, poolFor(m), cap, null, new Set(), rule); if (ac(r3.deck) > ac(r.deck) && !r3.moves.some(v => v.left)) { r = r3; whole = whole.concat([victim]); } } }
      rows.push({ where: `${kind} ${x.id}`, map: no, loc: mid, pro: { kind, id: x.id }, before: x.deck, after: r.deck, moves: r.moves, whole });
    }
  }
  return { rows, pro, overCap };
}
let _gm = null, _anchor = {};
function anchorOf(m) { if (_anchor[m.id]) return _anchor[m.id]; try { const O = require(path.join(ROOT, 'tools', 'opt', 'deckopt.js')), D1 = require(path.join(ROOT, 'tools', 'opt', 'deck1_2026_10_30.js')); _gm = _gm || O.loadGame(ROOT); _anchor[m.id] = new Set(D1.deck1Pools(_gm, m).anchor); } catch (e) { _anchor[m.id] = null; } return _anchor[m.id]; }
// a changed PRO deck's showcase leader follows its deck (tools/opt/pro_skirmishes.js leadersFor, as the PRO bake sets it)
function refreshLeaders(pro) { const O = require(path.join(ROOT, 'tools', 'opt', 'deckopt.js')), P = require(path.join(ROOT, 'tools', 'opt', 'pro_skirmishes.js')); _gm = _gm || O.loadGame(ROOT); let n = 0;
  for (const [mid, e] of Object.entries(pro.maps || {})) { const m = maps.find(x => x.id === mid); if (!m) continue;
    for (const kind of ['pro', 'bpro', 'wpro']) for (const x of (e[kind] || [])) { if (!x.bal13 && !x.bal13trim && !x.bal13cap) continue; const l = P.leadersFor(_gm, m, x.deck); if (JSON.stringify(l) !== JSON.stringify(x.leaders || [])) { x.leaders = l; n++; } } }
  return n; }
function deckLit(orig, deck, note) { const dbl = orig.includes('"'); const j = JSON.stringify(deck); return 'deck:' + (dbl ? j : j.replace(/"/g, "'")) + ' /* ' + note + ' */'; }
function mainTrim(argv) {
  if (argv.includes('--redo-pro')) { // restore the PRO decks of the saved trim plan to their `before` (the trim then runs again from them)
    const prev = L.readJson(path.join(OUTDIR, `rar1-trim-${DATE}.json`)), pro = JSON.parse(fs.readFileSync(PRO, 'utf8')); let k = 0;
    prev.rows.filter(r => r.pro).forEach(r => { const x = (pro.maps[r.loc][r.pro.kind] || []).find(y => y.id === r.pro.id); if (x) { x.deck = r.before; delete x.bal13trim; k++; } });
    fs.writeFileSync(PRO, JSON.stringify(pro, null, 1) + '\n'); console.log('restored ' + k + ' PRO decks'); }
  const apply = argv.includes('--apply'), check = argv.includes('--check'), { rows, pro, overCap } = trimPlan();
  const txt = v => `${v.out} -${v.copies} -> ${Object.entries(v.to).map(([c, k]) => c + ' x' + k).join(' + ') || '-'}${v.left ? ' (' + v.left + ' left)' : ''}`;
  console.log(`decks over a copy cap under RAR-1: ${rows.length} (road ${rows.filter(r => !r.pro).length}, PRO/BPRO/WPRO ${rows.filter(r => r.pro).length}); RAR-1 cards now over their fight's rarity cap: ${overCap.length}`);
  rows.forEach(r => console.log(`  ${r.where.padEnd(22)} Map ${r.map}: ${r.moves.map(txt).join('; ')}${r.k14 && r.k14.after ? '  K14 ' + r.k14.before.length + '->' + r.k14.after.length : ''}`));
  overCap.forEach(o => console.log(`  over the fight's rarity cap (flag): ${o.where} ${o.card} (${o.rarity} > ${o.cap})`));
  if (check) { if (rows.length) { console.log('not clean: run trim --apply'); process.exit(1); } console.log('clean'); return; }
  if (!apply) return;
  let src = fs.readFileSync(APP, 'utf8'), n = 0;
  const a = src.indexOf('const CONQUEST_MAPS = ['), b = src.indexOf('\n];', a); let body = src.slice(a, b);
  for (const r of rows.filter(r => !r.pro)) {
    const note = `${DATE} (BAL13, RAR-1 copy caps): ${r.moves.map(v => v.out + ' -' + v.copies).join(', ')} (its new rarity's copy cap), copies to the list's nearest (tools/bal13/decks_2026_11_02.js trim)`;
    const re = new RegExp(`\\{ ?key:\\s*['"]${r.key.replace(/[-]/g, '\\-')}['"],[^\\n]*`), mm = re.exec(body); if (!mm) { console.log('not found: ' + r.where); continue; }
    const line = mm[0].replace(/deck:\{[^}]*\}/, d => deckLit(d, r.after, note)); body = body.replace(mm[0], () => line); n++;
  }
  src = src.slice(0, a) + body + src.slice(b); fs.writeFileSync(APP, src);
  for (const r of rows.filter(r => r.pro)) { const x = (pro.maps[r.loc][r.pro.kind] || []).find(y => y.id === r.pro.id); if (!x) continue; x.deck = r.after;
    x.bal13trim = `${DATE} (BAL13, RAR-1 copy caps): ${r.moves.map(txt).join('; ')}${r.whole && r.whole.length ? ' (' + r.whole.join(', ') + ' left the deck whole: no room under 6/4)' : ''} (the list's nearest under the 6/4 rule, the map's list first); not re-searched`; }
  console.log('PRO leaders refreshed: ' + refreshLeaders(pro));
  fs.writeFileSync(PRO, JSON.stringify(pro, null, 1) + '\n');
  fs.mkdirSync(OUTDIR, { recursive: true });
  L.writeJson(path.join(OUTDIR, `rar1-trim-${DATE}.json`), { _about: 'BAL13 (2026-11-02, coordinator 20:19): RAR-1 copy-cap trims of the road and PRO decks; tools/bal13/decks_2026_11_02.js trim', rar1: RAR1, rows, overCap });
  console.log(`written: ${n} road decks, ${rows.filter(r => r.pro).length} PRO decks -> docs/balance/bal13/rar1-trim-${DATE}.json`);
}
// 2026-11-03 (BAL13, coordinator for BAL12-6): a road fight's copies of a card above the fight's rarity cap (roadRarityCap; RAR-1 raised 13
// cards) go to the nearest card of the fight's list within the cap (the same swap; size, K14 kept). A card that is the fight's own first-clear
// card or explicit leader is not swapped: it is listed for the owner (a card-data call).
function mainOvercap(argv) {
  const apply = argv.includes('--apply'), check = argv.includes('--check'), F = {}, rows = [], flagged = [];
  K14.fights().forEach(f => { F[f.map + ':' + f.key] = f; });
  const { overCap } = trimPlan();
  const byNode = {}; overCap.forEach(o => { (byNode[o.loc + ':' + o.key] = byNode[o.loc + ':' + o.key] || []).push(o); });
  for (const [k, list] of Object.entries(byNode)) {
    const [loc, key] = [k.slice(0, k.indexOf(':')), k.slice(k.indexOf(':') + 1)], m = maps.find(x => x.id === loc), n = m.nodes.find(x => x.key === key), no = G.mapNumberOf(loc);
    list.filter(o => o.kept).forEach(o => flagged.push(o)); const go = list.filter(o => !o.kept).map(o => o.card); if (!go.length) continue;
    const cap = G.roadRarityCap(no, n.kind || 'skirmish', loc) || 'mythic', f = F[k], keep = new Set([...firstClearOf(m, n), ...explicitLeaders(n)]);
    const VV = d => f ? K14.violations(Object.assign({}, f, { n: Object.assign({}, f.n, { deck: d }) }), d) : [];
    const nu = d => { const x = VV(d).map(s => /^(\d+) non-unique copies$/.exec(s)).find(Boolean); return x ? +x[1] : 0; };
    const v0 = VV(n.deck).length, nu0 = nu(n.deck), chk = f ? (d => VV(d).length <= v0 && nu(d) <= Math.max(6, nu0)) : null;
    const r = swapOut(n.deck, go, poolFor(m), cap, chk, keep);
    rows.push({ where: 'node ' + k, map: no, loc, key, kind: n.kind || 'skirmish', cap, before: n.deck, after: r.deck, moves: r.moves });
  }
  const txt = v => `${v.out} x${v.copies} -> ${Object.entries(v.to).map(([c, kk]) => c + ' x' + kk).join(' + ') || '-'}${v.left ? ' (' + v.left + ' left)' : ''}`;
  console.log(`road fights with a card over their rarity cap: ${rows.length} to swap, ${flagged.length} kept and flagged`);
  rows.forEach(r => console.log(`  ${r.where.padEnd(22)} cap ${r.cap}: ${r.moves.map(txt).join('; ')}`)); flagged.forEach(o => console.log(`  flagged (first-clear / leader): ${o.where} ${o.card} (${o.rarity} > ${o.cap})`));
  if (check) { if (rows.length) process.exit(1); console.log('clean'); return; }
  if (!apply) return;
  let src = fs.readFileSync(APP, 'utf8'), n = 0; const a = src.indexOf('const CONQUEST_MAPS = ['), b = src.indexOf('\n];', a); let body = src.slice(a, b);
  for (const r of rows) { const note = `2026-11-03 (BAL13, BAL12-6 / RAR-1): ${r.moves.map(v => v.out).join(', ')} over the fight's rarity cap (${r.cap}), copies to the list's nearest within it (tools/bal13/decks_2026_11_02.js overcap)`;
    const re = new RegExp(`\\{ ?key:\\s*['"]${r.key.replace(/[-]/g, '\\-')}['"],[^\\n]*`), mm = re.exec(body); if (!mm) { console.log('not found: ' + r.where); continue; }
    const line = mm[0].replace(/deck:\{[^}]*\}/, d => deckLit(d, r.after, note)); body = body.replace(mm[0], () => line); n++; }
  src = src.slice(0, a) + body + src.slice(b); fs.writeFileSync(APP, src);
  L.writeJson(path.join(OUTDIR, 'overcap-2026-11-03.json'), { _about: 'BAL13 (2026-11-03, BAL12-6): RAR-1 cards over their road fight\'s rarity cap swapped; tools/bal13/decks_2026_11_02.js overcap', rows, flagged });
  console.log(`written: ${n} road decks -> docs/balance/bal13/overcap-2026-11-03.json`);
}
// the same for the PRO / BPRO / WPRO decks: a card above the deck's own rarity cap (source.cap) goes to the list's nearest within it (6/4, the
// map's list first); the showcase leader follows the deck
function mainOvercapPro(argv) {
  const apply = argv.includes('--apply'), pro = JSON.parse(fs.readFileSync(PRO, 'utf8')), rows = [];
  for (const [mid, e] of Object.entries(pro.maps || {})) { const m = maps.find(x => x.id === mid); if (!m) continue; const no = G.mapNumberOf(mid);
    for (const kind of ['pro', 'bpro', 'wpro']) for (const x of (e[kind] || [])) { const cap = (x.source && x.source.cap) || G.roadRarityCap(no, 'boss', mid) || 'mythic';
      const bad = Object.keys(x.deck).filter(id => D[id] && L.step(rarityOf(id)) > L.step(cap)); if (!bad.length) continue;
      const r = swapOut(x.deck, bad, poolFor(m), cap, null, new Set(), { maxCopies: 4, maxUnique: 6, prefer: anchorOf(m) });
      rows.push({ where: `${kind} ${x.id}`, loc: mid, pro: { kind, id: x.id }, cap, before: x.deck, after: r.deck, moves: r.moves });
      if (apply) { x.deck = r.deck; x.bal13cap = `2026-11-03 (BAL13, BAL12-6 / RAR-1): ${r.moves.map(v => v.out + ' x' + v.copies + ' -> ' + Object.entries(v.to).map(([c, k]) => c + ' x' + k).join(' + ') + (v.left ? ' (' + v.left + ' left)' : '')).join('; ')} (over the deck's ${cap} cap); not re-searched`; } } }
  rows.forEach(r => console.log(`  ${r.where.padEnd(18)} cap ${r.cap}: ${r.moves.map(v => v.out + ' x' + v.copies + ' -> ' + JSON.stringify(v.to) + (v.left ? ' LEFT ' + v.left : '')).join('; ')}`));
  if (!apply) return; console.log('PRO leaders refreshed: ' + refreshLeaders(pro)); fs.writeFileSync(PRO, JSON.stringify(pro, null, 1) + '\n');
  const f = path.join(OUTDIR, 'overcap-2026-11-03.json'), j = L.readJson(f, { rows: [], flagged: [] }); j.proRows = rows; L.writeJson(f, j); console.log('written: ' + rows.length + ' PRO decks');
}
function main(argv) {
  if (argv[0] === 'trim') return mainTrim(argv.slice(1));
  if (argv[0] === 'overcap-pro') return mainOvercapPro(argv.slice(1));
  if (argv[0] === 'overcap') return mainOvercap(argv.slice(1));
  const apply = argv.includes('--apply'), check = argv.includes('--check'), { rows, kept, pro } = plan();
  const txt = v => `${v.out} x${v.copies} -> ${Object.entries(v.to).map(([c, k]) => c + ' x' + k).join(' + ') || '-'}${v.left ? ' (' + v.left + ' left)' : ''}`;
  console.log(`decks holding Beetle Battering-Ram / Siege Rhino / Hercules Beetle before their priced map: ${rows.length} (road ${rows.filter(r => !r.pro).length}, PRO/BPRO/WPRO ${rows.filter(r => r.pro).length}); kept ${kept.length}`);
  rows.forEach(r => console.log(`  ${r.where.padEnd(22)} Map ${r.map}: ${r.moves.map(txt).join('; ')}${r.k14 && r.k14.after ? '  K14 ' + r.k14.before.length + '->' + r.k14.after.length : ''}`));
  kept.forEach(k => console.log(`  kept: ${k.where} ${k.card} x${k.copies} (${k.why})`));
  if (check) { if (rows.length) { console.log('not clean: run with --apply'); process.exit(1); } console.log('clean'); return; }
  if (!apply) return;
  let src = fs.readFileSync(APP, 'utf8'), n = 0;
  const a = src.indexOf('const CONQUEST_MAPS = ['), b = src.indexOf('\n];', a); let body = src.slice(a, b);
  for (const r of rows.filter(r => !r.pro)) {
    const note = `${DATE} (BAL13, owner 19:56 on BAL11-3 b): ${r.moves.map(v => v.out).join(', ')} out (priced for Map ${Math.min(...r.moves.map(v => LATE[v.out]))}+), copies to the list's nearest (Lumber, Wait, 2A+H; tools/bal13/decks_2026_11_02.js)`;
    const re = new RegExp(`\\{ ?key:\\s*['"]${r.key.replace(/[-]/g, '\\-')}['"],[^\\n]*`), mm = re.exec(body); if (!mm) { console.log('not found: ' + r.where); continue; }
    const line = mm[0].replace(/deck:\{[^}]*\}/, d => deckLit(d, r.after, note)); body = body.replace(mm[0], () => line); n++;
  }
  src = src.slice(0, a) + body + src.slice(b); fs.writeFileSync(APP, src);
  for (const r of rows.filter(r => r.pro)) { const x = (pro.maps[r.loc][r.pro.kind] || []).find(y => y.id === r.pro.id); if (!x) continue; x.deck = r.after;
    x.bal13 = `${DATE} (BAL13, owner 19:56 on BAL11-3 b): ${r.moves.map(txt).join('; ')} (the card is priced for a later map; the list's nearest by Lumber, Wait, 2A+H under the 6/4 rule); not re-searched`; }
  fs.writeFileSync(PRO, JSON.stringify(pro, null, 1) + '\n');
  fs.mkdirSync(OUTDIR, { recursive: true });
  L.writeJson(path.join(OUTDIR, `late-cards-${DATE}.json`), { _about: 'BAL13 item 1 (2026-11-02, owner 19:56 on BAL11-3 b): the late-priced cards swapped out of the earlier fights\' decks; tools/bal13/decks_2026_11_02.js', late: LATE, rows, kept });
  console.log(`written: ${n} road decks, ${rows.filter(r => r.pro).length} PRO decks -> docs/balance/bal13/late-cards-${DATE}.json`);
}
if (require.main === module) main(process.argv.slice(2));
module.exports = { LATE, lateFor, plan, trimPlan, RAR1, rarityOf };
