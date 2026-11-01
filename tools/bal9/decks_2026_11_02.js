#!/usr/bin/env node
// 2026-11-02 (package BAL9; owner 11-02 00:17 JJ24: "Kelp Mangroves reference / enemy decks still use Minnow Skitter (cut). Remove cut cards
// from every deck."): the deck steps of BAL9.
//   node tools/bal9/decks_2026_11_02.js cuts [--apply]     every road fight deck (CONQUEST_MAPS nodes, the side maps' inserted fights, the
//                                                         endless dungeons' decks) and every PRO deck (canonical/pro-skirmishes.json): each
//                                                         copy of a cut card swapped for a card of that fight's list
//   node tools/bal9/decks_2026_11_02.js defenders [--json] JJ28: defender density per map list and per deck (see DEFENDERS below)
//   node tools/bal9/decks_2026_11_02.js fill --map N       JJ22: the Map 40+ deck-fill rule on map N's list (a dry demonstration)
//
// A CUT card: a card on no map list of any tier (canonical/map-pools.json, the tutorial's and the Old Bramble's lists included), that the game
// treats as out of play (tools/lib_map_pools.js isOutOfPlay: no list, no pack extra, no other source). Base and starter cards are never cut.
// THE SWAP: a cut card's copies go to ONE card of the fight's own list (lib_map_pools fightPool: a main map's MAP + SPECIAL, a side map's SUBMAP +
// SPECIAL), inside the fight's rarity cap and the card's copy cap, not itself cut: the nearest by Lumber, Wait and 2A + H (the 4-round rule's
// stat currency at Attack 2, Health 1), a card the deck already holds first at equal distance; the rest of the copies to the next nearest.
// A road fight's deck keeps its size, its leaders and its first-clear cards; the K14 rule (BAL7: a card not unique to the map at most 1 copy,
// 6 in all) is kept: a candidate that would break it is skipped. A PRO deck is swapped the same way inside the PRO's rarity cap.
'use strict';
const fs = require('fs'), path = require('path');
const L = require('./lib_bal9.js'), ROOT = L.ROOT;
const { G, D, LP, pools, B } = L.game();
const DATE = '2026-11-02', OUTDIR = path.join(ROOT, 'docs', 'balance', 'bal9');
const APP = path.join(ROOT, 'arena_app.js'), PRO = path.join(ROOT, 'canonical', 'pro-skirmishes.json');
const listed = LP.listedIds(pools);
const isBase = id => { const d = D[id]; return !!d && (G.cardSourceOf(d).kind === 'base' || d.rarity === 'starter'); };
// a card only on the tutorial's or the Old Bramble's lists is out of play but still belongs in those fights: cut there only when on no list
let CUT_LOC = null;
const isCut = id => { const d = D[id]; if (!d) return false; if (d.token || d.test || isBase(id)) return false; if (listed.has(id) && (!CUT_LOC || L.SKIP_LOCS.has(CUT_LOC))) { if (!CUT_LOC) return false; return false; } return LP.isOutOfPlay(G, d); };
const maps = G.CONQUEST_MAPS, byMap = id => maps.find(m => m.id === id);
let K14 = null; try { K14 = require(path.join(ROOT, 'tools', 'bal7_k14_decks_2026_10_28.js')); } catch (e) { K14 = null; }
const capOf = id => G.maxCopiesForRarity((D[id] || {}).rarity);
const stat = id => { const d = D[id] || {}; return 2 * (+d.attack || 0) + (+d.health || 0); };
const dist = (a, b) => { const x = D[a] || {}, y = D[b] || {}; return 3 * Math.abs((+x.cost || 0) - (+y.cost || 0)) + Math.abs((+x.wait || 0) - (+y.wait || 0)) + Math.abs(stat(a) - stat(b)) / 3 + 2 * Math.abs(((+x.stoneCost || 0) + (+x.metalCost || 0)) - ((+y.stoneCost || 0) + (+y.metalCost || 0)))
  + 4 * Math.abs(L.step(x.rarity) - L.step(y.rarity)) + (L.step(y.rarity) > L.step(x.rarity) ? 2 : 0); }; // + the rarity step: a swap keeps the fight's strength
// another fight's skirmish-exclusive reward is never swapped in (keep = this fight's own leaders and first-clear cards)
const otherReward = (c, keep) => { const s = (D[c] || {}).source; return !!(s && s.kind === 'map') && !(keep && keep.has(c)); };
// K14's excess (BAL7: a card not unique to the map at most 1 copy, 6 copies in all): a swap may not raise it
function k14Score(f, deck) { const U = K14.uniqueOf(f.map); let L0 = new Set(); try { L0 = new Set(G.skirmishLeadersOf(f.n, f.map) || []); } catch (e) {}
  let tot = 0, ex = 0; Object.entries(deck).forEach(([id, k]) => { if (U.has(id) || L0.has(id) || isCut(id)) return; tot += k; ex += Math.max(0, k - 1); }); return ex + Math.max(0, tot - 6); }
let PREFER = null; // the map's K14-unique cards: a swap tries them first at near-equal distance
const pen = c => (PREFER && !PREFER.has(c) ? 3 : 0);
function poolFor(m) { const parent = m.sub ? m.parent : null; const p = LP.fightPool(pools, m.id, parent); return p ? [...p] : []; }

// swap the cut copies of `deck`; cand = the fight's list; cap = rarity cap; check(deck) -> true when the deck is acceptable (K14)
// rule (PRO decks, DECK1 6/4): {maxCopies, maxUnique}: no card past maxCopies, no new card once the deck holds maxUnique different ones
function swapDeck(deck, cand, cap, check, keep, rule) {
  rule = rule || {}; const capR = c => Math.min(capOf(c), rule.maxCopies || 99), roomNew = c => out[c] || !rule.maxUnique || Object.keys(out).length < rule.maxUnique;
  const out = Object.assign({}, deck), moves = [], cuts = Object.keys(deck).filter(isCut);
  if (!cuts.length) return null;
  for (const id of cuts) {
    let k = out[id]; delete out[id];
    const opts = cand.filter(c => D[c] && !isCut(c) && !D[c].token && L.step(D[c].rarity) <= L.step(cap) && c !== id && !otherReward(c, keep)).sort((a, b) => (dist(id, a) + pen(a)) - (dist(id, b) + pen(b)) || ((out[b] ? 1 : 0) - (out[a] ? 1 : 0)) || (a < b ? -1 : 1));
    const got = [];
    for (const c of opts) { if (!k) break; while (k && (out[c] || 0) < capR(c) && roomNew(c)) { out[c] = (out[c] || 0) + 1; if (check && !check(out)) { out[c]--; if (!out[c]) delete out[c]; break; } k--; got.push(c); } }
    // nothing on the list takes them: the deck's own cards (most copies first) up to their caps
    if (k) { Object.keys(out).sort((a, b) => out[b] - out[a]).forEach(c => { while (k && out[c] < capR(c)) { out[c]++; if (check && !check(out)) { out[c]--; break; } k--; got.push(c); } }); }
    const tally = {}; got.forEach(c => { tally[c] = (tally[c] || 0) + 1; });
    moves.push({ cut: id, copies: deck[id], to: tally, left: k });
  }
  return { deck: out, moves };
}
// the deck literal that follows `anchor` in the source (a node's key, an endless dungeon's id)
function replaceDeckAfter(s, anchorRe, deck, note) {
  const m = anchorRe.exec(s); if (!m) return null; const i = s.indexOf('deck:{', m.index); if (i < 0 || i - m.index > 4000) return null;
  const j = s.indexOf('}', i); let tail = s.slice(j + 1, j + 400); const cm = /^\s*\/\*[^*]*\*\//.exec(tail);
  const lit = 'deck:' + JSON.stringify(deck).replace(/"/g, "'").replace(/','/g, "', '").replace(/':/g, "':") + ' /* ' + note + ' */';
  // keep the deck's quote style: node lines use JSON quotes
  const orig = s.slice(i, j + 1), useDouble = orig.includes('"');
  const lit2 = useDouble ? 'deck:' + JSON.stringify(deck) + ' /* ' + note + ' */' : lit;
  return s.slice(0, i) + lit2 + s.slice(j + 1);
}
function cmdCuts(apply) {
  const rows = [], pro = JSON.parse(fs.readFileSync(PRO, 'utf8'));
  let src = fs.readFileSync(APP, 'utf8');
  const fightsK = K14 ? K14.fights() : [];
  for (const m of maps) {
    if (m.tower || m.reserved) continue; const cand = poolFor(m); CUT_LOC = m.id; PREFER = K14 && !m.endless ? K14.uniqueOf(m.id) : null;
    const nodes = m.endless ? [{ key: '(base deck)', deck: m.deck || (m.nodes && m.nodes[0] && m.nodes[0].deck) || {}, kind: 'skirmish', endless: true }] : (m.nodes || []);
    for (const n of nodes) {
      if (!n.deck) continue; if (m.endless && !Object.keys(n.deck).some(isCut)) continue;
      const cap = G.roadRarityCap(G.mapNumberOf(m.id), n.kind || 'skirmish', m.id) || 'mythic';
      const f = fightsK.find(x => x.map === m.id && x.key === n.key), keep = new Set();
      try { (G.skirmishLeadersOf(n, m.id) || []).forEach(id => keep.add(id)); } catch (e) {}
      try { (G.nodeRewardCardIds(m.id, n.key) || []).forEach(id => keep.add(id)); } catch (e) {}
      const check = f && K14 ? (dk => k14Score(f, dk) <= k14Score(f, n.deck)) : null;
      const r = swapDeck(n.deck, cand, cap, check, keep); if (!r) continue;
      rows.push({ where: m.endless ? `endless ${m.id}` : `node ${m.id}:${n.key}`, map: G.mapNumberOf(m.id), loc: m.id, key: n.key, before: n.deck, after: r.deck, moves: r.moves });
    }
  }
  // the endless dungeons: their one deck sits in the endlessDungeon({id: ...}) call; collect what the maps report
  const endless = maps.filter(m => m.endless);
  // PRO / BPRO decks
  for (const [mid, e] of Object.entries(pro.maps || {})) {
    const m = byMap(mid); if (!m) continue; const cand = poolFor(m); CUT_LOC = mid; PREFER = null;
    for (const kind of ['pro', 'bpro']) for (const x of (e[kind] || [])) {
      const cap = (x.source && x.source.cap) || G.roadRarityCap(G.mapNumberOf(mid), 'boss', mid) || 'mythic';
      const r = swapDeck(x.deck, cand, cap, null, new Set()); if (!r) continue;
      rows.push({ where: `${kind} ${x.id}`, map: G.mapNumberOf(mid), loc: mid, pro: { kind, id: x.id }, before: x.deck, after: r.deck, moves: r.moves });
      if (apply) { x.deck = r.deck; x.bal9 = `2026-11-02 (BAL9, JJ24): cut cards swapped for cards of the map's list (${r.moves.map(v => v.cut + ' x' + v.copies).join(', ')}); not re-searched`; }
    }
  }
  // the reference decks the tools and the game deal (WINRATE_REF_DECKS): report only (the Map reference is rebuilt by tools/skirmish_pass.js decks)
  const W = G.WINRATE_REF_DECKS, refCut = []; Object.entries(W.road).concat([['starter', W.starter]]).forEach(([k, d]) => Object.keys(d).filter(isCut).forEach(id => refCut.push(k + ':' + id)));
  const plan = { _about: 'BAL9 JJ24 (2026-11-02): cut cards swapped out of every road and PRO deck; tools/bal9/decks_2026_11_02.js cuts', built: DATE, cutCards: [...new Set(rows.flatMap(r => r.moves.map(v => v.cut)))].sort(), refDeckCuts: refCut, rows };
  if (!fs.existsSync(OUTDIR)) fs.mkdirSync(OUTDIR, { recursive: true });
  if (!process.argv.includes("--check") && (rows.length || !fs.existsSync(path.join(OUTDIR, `cuts-${DATE}.json`)))) L.writeJson(path.join(OUTDIR, `cuts-${DATE}.json`), plan); // a clean re-run keeps the applied plan
  const left = rows.reduce((t, r) => t + r.moves.reduce((a, v) => a + v.left, 0), 0);
  console.log(`decks with cut cards: ${rows.length} (road ${rows.filter(r => !r.pro).length}, PRO/BPRO ${rows.filter(r => r.pro).length}); cut cards ${plan.cutCards.length}; copies with no home ${left}; reference decks: ${refCut.join(', ') || 'clean'}`);
  rows.slice(0, 400).forEach(r => console.log(`  ${r.where.padEnd(22)} ${r.moves.map(v => `${v.cut} x${v.copies} -> ${Object.entries(v.to).map(([c, k]) => c + ' x' + k).join(' + ')}${v.left ? ' (' + v.left + ' left)' : ''}`).join('; ')}`));
  if (!apply) return;
  let n = 0;
  for (const r of rows.filter(r => !r.pro)) {
    const note = `2026-11-02 (BAL9, JJ24): cut card${r.moves.length > 1 ? 's' : ''} ${r.moves.map(v => v.cut).join(', ')} swapped for the list's nearest (Lumber, Wait, 2A+H)`;
    const re = r.where.startsWith('endless') ? new RegExp(`endlessDungeon\\(\\{id:'${r.loc}'`) : new RegExp(`key:\\s*['"]${r.key.replace(/[-]/g, '\\-')}['"]`);
    const s2 = replaceDeckAfter(src, re, r.after, note); if (s2 == null) { console.log('not found in arena_app.js: ' + r.where); continue; } src = s2; n++;
  }
  fs.writeFileSync(APP, src); fs.writeFileSync(PRO, JSON.stringify(pro, null, 1) + '\n');
  console.log(`written: ${n} road decks, ${rows.filter(r => r.pro).length} PRO decks`);
}

// ---------------------------------------------------------------- DEFENDERS (JJ28)
// A defender: a card whose skills make the enemy hit it instead of others or soak hits for its neighbours: Bulwark, Guardian, Taunt / Provoke,
// Shieldwall, Bodyguard-style keys (DEFENDER_KEYS below; the engine's names). Density = defender copies / deck size; per map list = defender
// cards / list size.
const DEFENDER_KEYS = ['bulwark', 'guardian', 'taunt', 'provoke', 'shieldwall', 'bodyguard', 'protector', 'intercept', 'sentinel', 'warden', 'shieldAlly', 'cover'];
function defenderKeysOf(id) { const e = (D[id] || {}).effects || {}; return DEFENDER_KEYS.filter(k => e[k] != null && e[k] !== false); }
function cmdDefenders(asJson) {
  const out = { keys: DEFENDER_KEYS, lists: [], decks: [] };
  Object.entries(pools.maps).forEach(([mid, e]) => { const n = LP.normalizeEntry(e), m = byMap(mid);
    const row = (loc, list) => { const ds = list.filter(id => defenderKeysOf(id).length); return { loc, map: G.mapNumberOf(loc), name: (byMap(loc) || {}).name, size: list.length, defenders: ds.map(id => id + ':' + defenderKeysOf(id).join('+')), share: list.length ? ds.length / list.length : 0 }; };
    out.lists.push(row(mid, n.cards.concat(n.special))); Object.entries(n.submaps).forEach(([s, l]) => out.lists.push(row(s, l.concat(n.special)))); });
  maps.filter(m => !m.tower && !m.reserved && !m.endless).forEach(m => (m.nodes || []).forEach(nd => { if (!nd.deck) return; const tot = Object.values(nd.deck).reduce((a, b) => a + b, 0), def = Object.entries(nd.deck).filter(([id]) => defenderKeysOf(id).length).reduce((a, [, k]) => a + k, 0);
    out.decks.push({ where: m.id + ':' + nd.key, map: G.mapNumberOf(m.id), size: tot, defenders: def }); }));
  const pro = JSON.parse(fs.readFileSync(PRO, 'utf8')); Object.entries(pro.maps).forEach(([mid, e]) => ['pro', 'bpro'].forEach(k => (e[k] || []).forEach(x => { const tot = Object.values(x.deck).reduce((a, b) => a + b, 0), def = Object.entries(x.deck).filter(([id]) => defenderKeysOf(id).length).reduce((a, [, kk]) => a + kk, 0); out.decks.push({ where: k + ' ' + x.id, map: G.mapNumberOf(mid), size: tot, defenders: def }); })));
  if (asJson) L.writeJson(path.join(OUTDIR, `defenders-${DATE}.json`), out);
  return out;
}

// ---------------------------------------------------------------- FILL (JJ22): a dry demonstration of fillDeckToSize on a map's list
function cmdFill(no) {
  const m = maps.find(x => !x.sub && G.mapNumberOf(x.id) === no); if (!m) throw new Error('no main map ' + no);
  const cap = G.roadRarityCap(no, 'skirmish', m.id), own = poolFor(m).filter(id => D[id] && L.step(D[id].rarity) <= L.step(cap));
  const carried = []; maps.filter(x => !x.sub && G.mapNumberOf(x.id) != null && G.mapNumberOf(x.id) < no).sort((a, b) => G.mapNumberOf(b.id) - G.mapNumberOf(a.id)).forEach(x => poolFor(x).forEach(id => { if (D[id] && !own.includes(id) && !carried.some(c => c.id === id)) carried.push({ id, rarity: D[id].rarity }); }));
  const r = L.fillDeckToSize({}, { size: 20, capOf, own, carried });
  console.log(`Map ${no} ${m.name}: cap ${cap}, own cards inside it ${own.length}; deck ${JSON.stringify(r.deck)}; carried in ${r.added.join(', ') || 'none'}; short ${r.short}`);
}

// PRO decks again from their original decks (the cuts plans' `before`) under DECK1's 6/4 rule (at most 4 copies, 6 different cards): the first
// swap of 11-02 let a PRO deck reach 5 copies of a Common or 7 different cards
function cmdProRedo() {
  const pro = JSON.parse(fs.readFileSync(PRO, 'utf8')), orig = {};
  ['cuts-pass1', 'cuts'].forEach(f => { const p = L.readJson(path.join(OUTDIR, `${f}-${DATE}.json`), { rows: [] }); p.rows.filter(r => r.pro && r.pro.kind === 'pro').forEach(r => { if (!orig[r.pro.id]) orig[r.pro.id] = r.before; }); });
  const rows = [];
  for (const [mid, e] of Object.entries(pro.maps || {})) { const m = byMap(mid); if (!m) continue; const cand = poolFor(m); CUT_LOC = mid; PREFER = null;
    for (const x of (e.pro || [])) { const b = orig[x.id]; if (!b) continue; const cap = (x.source && x.source.cap) || G.roadRarityCap(G.mapNumberOf(mid), 'boss', mid) || 'mythic';
      const r = swapDeck(b, cand, cap, null, new Set(), { maxCopies: 4, maxUnique: 6 }); if (!r) continue;
      x.deck = r.deck; x.bal9 = `2026-11-02 (BAL9, JJ24): cut cards swapped for cards of the map's list under DECK1's 6/4 rule (${r.moves.map(v => v.cut + ' x' + v.copies).join(', ')}); not re-searched`;
      rows.push({ where: 'pro ' + x.id, map: G.mapNumberOf(mid), loc: mid, pro: { kind: 'pro', id: x.id }, before: b, after: r.deck, moves: r.moves }); } }
  fs.writeFileSync(PRO, JSON.stringify(pro, null, 1) + '\n'); L.writeJson(path.join(OUTDIR, `cuts-pro-${DATE}.json`), { _about: 'BAL9 JJ24 (2026-11-02): the PRO decks\' cut-card swaps redone from the original decks under the 6/4 rule; tools/bal9/decks_2026_11_02.js pro-redo', rows });
  const short = rows.filter(r => r.moves.some(v => v.left)); console.log(`PRO decks redone: ${rows.length}; short of 20: ${short.map(r => r.where).join(', ') || 'none'}`);
}
// put the road decks of the applied plan back to their `before` (to run the swap again from the original decks)
function cmdRestore() {
  const plan = L.readJson(path.join(OUTDIR, `cuts-${DATE}.json`)); let s = fs.readFileSync(APP, 'utf8'), n = 0;
  for (const r of plan.rows.filter(r => !r.pro)) {
    const re = r.where.startsWith('endless') ? new RegExp(`endlessDungeon\\(\\{id:'${r.loc}'`) : new RegExp(`key:\\s*['"]${r.key.replace(/[-]/g, '\\-')}['"]`);
    const m = re.exec(s); if (!m) continue; const i = s.indexOf('deck:{', m.index), j = s.indexOf('}', i);
    let k = j + 1; const c = /^ \/\* 2026-11-02 \(BAL9, JJ24\)[^*]*\*\//.exec(s.slice(k)); if (c) k += c[0].length;
    const dbl = s.slice(i, j).includes('"'); s = s.slice(0, i) + 'deck:' + (dbl ? JSON.stringify(r.before) : JSON.stringify(r.before).replace(/"/g, "'")) + s.slice(k); n++;
  }
  fs.writeFileSync(APP, s); console.log('restored ' + n + ' road decks');
}
const cmd = require.main === module ? process.argv[2] : null, apply = process.argv.includes("--apply");
if (cmd === 'restore') cmdRestore();
else if (cmd === 'pro-redo') cmdProRedo();
else if (cmd === 'cuts') cmdCuts(apply);
else if (cmd === 'defenders') { const o = cmdDefenders(process.argv.includes('--json')); o.lists.forEach(l => console.log(`${String(l.map).padStart(3)} ${l.loc.padEnd(6)} ${String(l.name).padEnd(24)} ${l.defenders.length}/${l.size}  ${l.defenders.join(', ')}`)); }
else if (cmd === 'fill') cmdFill(+process.argv[process.argv.indexOf('--map') + 1]);
else if (cmd) console.log(fs.readFileSync(__filename, 'utf8').split('\n').slice(1, 9).map(l => l.replace(/^\/\/ ?/, '')).join('\n'));
module.exports = { isCut, defenderKeysOf, DEFENDER_KEYS, cmdDefenders, swapDeck };
