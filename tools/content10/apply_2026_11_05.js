#!/usr/bin/env node
// 2026-11-05 (package CONTENT10): the map lists pass. One tool, two stages, run on the files as they stand:
//   A  the owner's named swaps (decisions LIST-1104, LISTFIX2-1 b, LISTFIX2-2 b) and the Map 20+ archetype rule, with the deck copies they move
//   B  THEME6-1's own / carried counts on main Maps 2-24 (th6Targets below; arena_app.js rv2TargetsOf holds the same rule for the Map cards window)
// Usage: node tools/content10/apply_2026_11_05.js            dry run: prints the plan, writes docs/balance/content10/plan-2026-11-05.json
//        node tools/content10/apply_2026_11_05.js --apply    also writes canonical/map-pools.json, canonical/map-review.json, canonical/cards.json
//                                                            (sources only) and arena_app.js (road decks, SKIRMISH_FIRST_PACK_CARDS)
// Run --apply once, on the files before CONTENT10 (stage A is not idempotent). Then regenerate canonical/card-obtain-maps.json
// (node tools/forge_curve_2026_10_19.js maps) and rebuild.
// Rules (owner 11-04 22:34 / 23:17 / 23:36-23:40, 11-05 08:08):
//   - own = a list's chosen entries without "Carried" in their why and not Baby (the window's count: rv2IsCarried, ui13IsBaby)
//   - a cut never takes a card a fight of that map gives (reward, first-clear, challenge), a fight's named leader / showcase, a SPECIAL card or an
//     owner 11-04 23:17 pick; weakest thematic fit first, near-duplicates (an animal the list already holds) before others; a card a later list
//     carries from here is cut last (it would change that list's own / carried split)
//   - a carried add is a card of an earlier list (road order, side maps by the map they open on), thematic (unit-themes biome fit >= 1), inside
//     the map's rarity cap and obtainable by then, not Baby, faction, leader, challenge, archetype (Devilry, Ecclesia, Scrappers, Evomax ...) or
//     anything this package took off a list; THEME5's carried picks first, then Claude New (canonical/claude-new-cards.json), then fit, active
//     skills and skills new to the list (EFFECTS-1); never an animal the list already holds ("Each card must feel distinct!")
//   - decks: only stage A moves deck copies (a removed card's copies to the nearest card of the fight's list, BAL9's distance); stage B's cuts
//     leave the decks to BAL16
'use strict';
const fs = require('fs'), path = require('path');
const ROOT = path.join(__dirname, '..', '..');
if (process.argv.includes('--flags')) { // node tools/content10/apply_2026_11_05.js --flags   (after --apply and the obtain-maps step: a fresh read of the files)
  const B0 = require(path.join(ROOT, 'tools', 'lib_bramble.js')), LP0 = require(path.join(ROOT, 'tools', 'lib_map_pools.js')), F = path.join(ROOT, 'canonical', 'cards.json');
  const cs = JSON.parse(fs.readFileSync(F, 'utf8')), BD = B0.CARD_DEFS_BASELINE, changed = [], KEEP = new Set(['glacial-ape-king']); // CUT3-1 is the owner's
  cs.forEach(c => { if (KEEP.has(c.id) || c.pool || c.token || c.test || c.hero || c.easterEgg || ['materia', 'spell', 'equipment'].includes(c.cardType) || !BD[c.id]) return;
    const out = LP0.isOutOfPlay(B0.G, BD[c.id]), so = c.source || {};
    const placedRule = so.kind === 'pack' && ![11, 99].includes(+so.tier) && !so.map; // a basic-pack card with no map is not placed: it keeps its flag (BAL7 M3)
    if (out && !c.unattainable) { c.unattainable = true; changed.push('+' + c.id); } else if (!out && c.unattainable && so.kind && !c.awaitingSource && !placedRule) { delete c.unattainable; changed.push('-' + c.id); } });
  const esc = s => s.replace(/[\u007f-\uffff]/g, ch => '\\u' + ch.charCodeAt(0).toString(16).padStart(4, '0'));
  if (changed.length) fs.writeFileSync(F, esc(JSON.stringify(cs, null, 2)) + '\n'); console.log('unattainable flags: ' + (changed.join(' ') || 'all current')); process.exit(0);
}
const opt = require(path.join(ROOT, 'tools', 'opt', 'deckopt.js'));
const gm = opt.loadGame(ROOT), G = gm.G, D = gm.D;
const LP = require(path.join(ROOT, 'tools', 'lib_map_pools.js'));
const APPLY = process.argv.includes('--apply');
const rd = rel => JSON.parse(fs.readFileSync(path.join(ROOT, rel), 'utf8'));
const POOLS_F = 'canonical/map-pools.json', REVIEW_F = 'canonical/map-review.json', CARDS_F = 'canonical/cards.json', APP_F = 'arena_app.js';
const poolsFile = rd(POOLS_F), P = poolsFile.maps, reviewFile = rd(REVIEW_F), R = reviewFile.maps, cards = rd(CARDS_F), CARD = {};
cards.forEach(c => { CARD[c.id] = c; });
let app = fs.readFileSync(path.join(ROOT, APP_F), 'utf8');
const T5 = rd('docs/balance/theme5/carried-picks-2026-11-03.json').picks, CN = rd('canonical/claude-new-cards.json');
const NOTE = 'CONTENT10 (11-05)';
const log = [], plan = { _about: 'CONTENT10 (2026-11-05): the map lists pass; tools/content10/apply_2026_11_05.js', targets: [], stageA: [], decks: [], sources: [], firstPack: [], maps: {} };
const mainMaps = G.CONQUEST_MAPS.filter(m => !m.sub && !m.reserved && G.mapNumberOf(m.id) != null && P[m.id]).sort((a, b) => G.mapNumberOf(a.id) - G.mapNumberOf(b.id));
const byId = id => G.CONQUEST_MAPS.find(m => m.id === id);
const nm = id => (D[id] && D[id].name) || id;
const step = r => G.roadRarityStep(r);

// ---- THEME6-1 (owner 11-04 23:36-23:40; Map 41+ carried owner 11-05 08:08). Keep in step with arena_app.js th6Targets.
function th6Targets(n) {
  if (n == null || n < 0) return null;
  const own = n <= 20 ? Math.round(10 - 2 * Math.max(0, n - 2) / 18) : n <= 40 ? Math.round(7 - (n - 21) / 19) : 5;
  const carried = n <= 8 ? 5 : n <= 20 ? Math.round(5 + 8 * (n - 8) / 12) : n <= 40 ? Math.round(14 + 2 * (n - 21) / 19) : 16 + Math.floor((n - 41) / 20);
  return { own, carried };
}
for (let n = 0; n <= 81; n++) { const t = th6Targets(n); if (n <= 42 || n % 20 === 1 || n % 20 === 0) plan.targets.push({ map: n, own: t.own, carried: t.carried }); }

// ---- helpers
const isCarriedE = e => /carried/i.test(String((e && e.why) || ''));
const isBaby = id => (D[id] || {}).kind === 'baby';
const archOf = id => { const x = CARD[id]; if (!x) return null; const ml = x.mechanicLine; if (ml && ml !== 'none' && ml !== 'None') return ml;
  if (x.graceCost || x.prayerReq) return 'grace'; if (x.exileCost) return 'exile'; if (x.devilryCost) return 'devilry'; if ((x.archetypes || []).includes('Ecclesia')) return 'grace';
  const e = x.effects || {}; if (e.evolute || e.evoluteAlpha || e.evoluteOmega) return 'evolution'; if (e.stem || e.chrysalis || (e.stemGrant && typeof e.stemGrant === 'object')) return 'evolution'; return null; };
const rv = mid => (R[mid] = R[mid] || { chosen: [], cut: [], maybe: [] });
function listRemove(mid, id, why, opts) { // off the MAP list (and SPECIAL unless opts.keepSpecial), the review entry to cut
  opts = opts || {}; const e = P[mid];
  e.cards = e.cards.filter(x => x !== id); if (!opts.keepSpecial) e.special = (e.special || []).filter(x => x !== id);
  const r = rv(mid), had = r.chosen.find(x => x.id === id); r.chosen = r.chosen.filter(x => x.id !== id);
  const old = r.cut.find(x => x.id === id);
  if (old) { old.statusWhy = why; } else r.cut.push(Object.assign({ id, why, by: opts.by || 'claude' }, had && had.flag ? {} : {}));
}
function listAdd(mid, id, why, by) { const e = P[mid]; if (!e.cards.includes(id)) e.cards.push(id); const r = rv(mid); r.cut = r.cut.filter(x => x.id !== id); r.maybe = (r.maybe || []).filter(x => x.id !== id);
  if (!r.chosen.some(x => x.id === id)) r.chosen.push({ id, why, by }); }
function setSource(id, src, why) { const c = CARD[id]; plan.sources.push({ id, from: c.source || null, to: src, why }); c.source = src; }
const packTier = n => G.packTierOfMapNumber(n);
// the first list in road order that holds a card (THEME3 / THEME5's rule: by the map a player reaches it on, a main map before its side maps)
const ORDER = []; G.CONQUEST_MAPS.forEach((m, i) => { if (m.reserved || m.endless || m.tower || ['mtut', 'mm', 'muc', 'mlb'].includes(m.id)) return;
  const side = !!m.sub; if (side && !(P[m.parent] && (P[m.parent].submaps || {})[m.id])) return; if (!side && !P[m.id]) return;
  ORDER.push({ id: m.id, side, parent: side ? m.parent : null, unlock: side ? G.mapUnlockNumberOf(m.id) : G.mapNumberOf(m.id), no: G.mapNumberOf(m.id), i }); });
ORDER.sort((a, b) => a.unlock - b.unlock || (a.side ? 1 : 0) - (b.side ? 1 : 0) || a.i - b.i);
const listOf = x => x.side ? (P[x.parent].submaps[x.id] || []) : P[x.id].cards.concat(P[x.id].special || []);
function firstList(id) { for (const x of ORDER) if (listOf(x).includes(id)) return x; return null; }
const label = x => x.side ? (byId(x.id).name + ' (side map of Map ' + x.no + ')') : (byId(x.id).name + ' (Map ' + x.no + ')');

// ---- what a map's fights give and lean on
function firstPackTable() { const FP = {}, s = app.indexOf('const SKIRMISH_FIRST_PACK_CARDS'), e = app.indexOf('};', s); for (const m of app.slice(s, e).matchAll(/'(\w+):([\w-]+)': '([\w-]+)'/g)) FP[m[1] + ':' + m[2]] = m[3]; return FP; }
function protectedOf(mid) {
  const FP = firstPackTable(); // read after stage A's first-clear swaps
  const m = byId(mid), s = new Set(), why = {};
  const add = (id, w) => { if (id) { s.add(id); why[id] = why[id] || w; } };
  Object.values(CARD).forEach(c => { const so = c.source || {}; if (so.kind === 'map' && so.id === mid) add(c.id, (so.challenge ? 'challenge card' : 'skirmish reward') + ' of ' + so.node); });
  Object.entries(FP).forEach(([k, v]) => { if (k.startsWith(mid + ':')) add(v, 'first-clear card of ' + k.split(':')[1]); });
  (m.nodes || []).forEach(n => { (n.leaders || []).forEach(id => add(id, 'leader of ' + n.key)); if (n.leaderId) add(n.leaderId, 'leader of ' + n.key); if (n.showcase) add(n.showcase, 'showcase of ' + n.key); if (n.firstCard) add(n.firstCard, 'first-clear card of ' + n.key); });
  (P[mid].special || []).forEach(id => add(id, 'on SPECIAL'));
  (SWAPPED_IN[mid] || new Set()).forEach(id => add(id, 'took a removed card\'s deck copies (CONTENT10 stage A)'));
  return { set: s, why };
}

// ---- deck swaps (BAL9 JJ24's distance: Lumber, Wait, 2A + H, other resources, rarity step)
const stat = id => { const d = D[id] || {}; return 2 * (+d.attack || 0) + (+d.health || 0); };
const dist = (a, b) => { const x = D[a] || {}, y = D[b] || {}; return 3 * Math.abs((+x.cost || 0) - (+y.cost || 0)) + Math.abs((+x.wait || 0) - (+y.wait || 0)) + Math.abs(stat(a) - stat(b)) / 3
  + 2 * Math.abs(((+x.stoneCost || 0) + (+x.metalCost || 0)) - ((+y.stoneCost || 0) + (+y.metalCost || 0))) + 4 * Math.abs(step(x.rarity) - step(y.rarity)) + (step(y.rarity) > step(x.rarity) ? 2 : 0); };
const REMOVED = {}; // mapId -> Set of ids taken off that map's MAP + SPECIAL in stage A (deck copies move)
const noteRemoved = (mid, id) => { (REMOVED[mid] = REMOVED[mid] || new Set()).add(id); };
const FIXED = {}; // mapId -> {cut: replacement} copy-for-copy swaps the owner named (Rock Pool Starfish for Sea Turtle Elder ...)
let K14 = null; try { K14 = require(path.join(ROOT, 'tools', 'bal7_k14_decks_2026_10_28.js')); } catch (e) { K14 = null; }
const ORIG_SPECIAL = {}; Object.entries(P).forEach(([k, e]) => { ORIG_SPECIAL[k] = (e.special || []).slice(); });
const deckEdits = {}, SWAPPED_IN = {}; // SWAPPED_IN: mapId -> cards that took a removed card's deck copies (stage B keeps them on the list) // "mid|key" -> {deck, notes[]}
function nodeDeck(mid, n) { const k = mid + '|' + n.key; return deckEdits[k] ? deckEdits[k].deck : n.deck; }
function setDeck(mid, n, deck, note) { const k = mid + '|' + n.key; (deckEdits[k] = deckEdits[k] || { mid, key: n.key, before: n.deck, deck: null, notes: [] }); deckEdits[k].deck = deck; deckEdits[k].notes.push(note); }
function otherReward(mid, id) { const so = (CARD[id] || {}).source || {}; return so.kind === 'map'; }
function swapNodeDecks(mid, parent) {
  const m = byId(mid), fixed = FIXED[parent || mid] || {};
  // a side map's fights draw from its own list + the parent's SPECIAL: a card the parent lost from SPECIAL leaves them unless the side map lists it
  const rm = parent ? new Set([...(REMOVED[parent] || [])].filter(id => (ORIG_SPECIAL[parent] || []).includes(id) && !((P[parent].submaps || {})[mid] || []).includes(id))) : (REMOVED[mid] || new Set());
  for (const n of m.nodes || []) {
    if (!n.deck || /raidboss/.test(n.kind || '')) continue; let deck = Object.assign({}, nodeDeck(mid, n)); const hits = Object.keys(deck).filter(id => rm.has(id)); if (!hits.length) continue;
    const cap = G.roadRarityCap(G.mapNumberOf(mid), n.kind || 'skirmish', mid) || 'mythic';
    const pool = LP.fightPool({ maps: P }, mid, parent || null); const moves = [];
    const carried = new Set(((R[mid] || {}).chosen || []).filter(isCarriedE).map(e => e.id)), U = K14 ? K14.uniqueOf(mid) : new Set(), PR = protectedOf(parent || mid).set, carPen = c => (carried.has(c) ? 3 : 0) + (U.has(c) ? 0 : 3) + (PR.has(c) ? 0 : 2); // + a card the map keeps anyway (a reward, first-clear, showcase) before one stage B could cut // the map's own cards first (BAL9's K14 preference)
    let L = new Set(); try { L = new Set(G.skirmishLeadersOf(n, mid) || []); } catch (e) {}
    for (const id of hits) {
      let k = deck[id]; delete deck[id]; const to = {};
      // K14 (BAL7, owner 10-27): a card not unique to the map at most 1 copy; the map's own cards first
      const capFor = c => { const top = G.maxCopiesForRarity(D[c].rarity); return (U.has(c) || L.has(c) || c === fixed[id]) ? top : Math.max(1, Math.min(top, deck[c] || 0)); };
      const put = c => { while (k && (deck[c] || 0) < capFor(c)) { deck[c] = (deck[c] || 0) + 1; to[c] = (to[c] || 0) + 1; k--; } };
      if (fixed[id] && D[fixed[id]]) put(fixed[id]);
      if (k) { const opts = [...pool].filter(c => D[c] && !rm.has(c) && !D[c].token && step(D[c].rarity) <= step(cap) && c !== id && !(otherReward(mid, c) && !deck[c])
            && !(G.mapNumberOf(mid) <= 10 && ((D[c].effects || {}).moonpull))) // tests/road-rarity 4: no Moonpull in Maps 0-10 decks
          .sort((a, b) => (dist(id, a) + carPen(a)) - (dist(id, b) + carPen(b)) || ((deck[b] ? 1 : 0) - (deck[a] ? 1 : 0)) || (a < b ? -1 : 1));
        for (const c of opts) { if (!k) break; put(c); } }
      // nothing on the list takes the rest: the deck's own cards (most copies first) up to their copy caps (BAL9's fallback)
      if (k) Object.keys(deck).sort((a, b) => deck[b] - deck[a]).forEach(c => { while (k && deck[c] < G.maxCopiesForRarity(D[c].rarity)) { deck[c]++; to[c] = (to[c] || 0) + 1; k--; } });
      moves.push({ cut: id, copies: (nodeDeck(mid, n))[id], to, left: k }); Object.keys(to).forEach(c => (SWAPPED_IN[mid] = SWAPPED_IN[mid] || new Set()).add(c));
    }
    setDeck(mid, n, deck, moves.map(v => `${v.cut} x${v.copies} -> ${Object.entries(v.to).map(([c, x]) => c + ' x' + x).join(' + ')}${v.left ? ' (' + v.left + ' short)' : ''}`).join('; '));
  }
}

// ================================================================== STAGE A
const A = (what, detail) => { plan.stageA.push({ what, detail }); };
// sync: a list card with no review entry (CONTENT8's jellies) gets one, so the window counts it
for (const m of mainMaps) { const r = rv(m.id); P[m.id].cards.forEach(id => { if (!r.chosen.some(e => e.id === id) && !r.cut.some(e => e.id === id)) {
  const fl = firstList(id), carried = fl && fl.id !== m.id; r.chosen.push({ id, why: (carried ? 'Carried from ' + label(fl) + '; ' : '') + 'on the list since CONTENT8 (11-02, KK16 / KK17; owner 21:12: "I want jellyfish in the game"); review entry added by ' + NOTE, by: 'kept' }); A('review entry added', m.id + ' ' + id); } }); }

// LIST-1104 (owner 11-04 23:17 / 23:18)
listRemove('mb', 'sea-turtle-elder', 'Owner 11-04 23:17 (LIST-1104): cut; Rock Pool Starfish takes its place in Pebble Beach\'s decks', { by: 'owner' }); noteRemoved('mb', 'sea-turtle-elder');
FIXED.mb = Object.assign(FIXED.mb || {}, { 'sea-turtle-elder': 'rock-pool-starfish' });
{ const e = rv('mb').chosen.find(x => x.id === 'rock-pool-starfish'); if (e) e.why = 'Owner 11-01: kept; owner 11-04 23:17 (LIST-1104): takes Sea Turtle Elder\'s place in the decks'; }
A('LIST-1104 Pebble Beach', 'cut Sea Turtle Elder; Rock Pool Starfish takes its deck slots');
listAdd('m2', 'shoal-shark', 'Owner 11-04 23:17 (LIST-1104): back on the list', 'owner');
CARD['shoal-shark'].source = Object.assign({}, CARD['shoal-shark'].source, { kind: 'pack', tier: packTier(4), map: 'm2' }); delete CARD['shoal-shark'].unattainable; plan.sources.push({ id: 'shoal-shark', to: CARD['shoal-shark'].source, why: 'LIST-1104: on Sunken Hollow\'s list again' });
listRemove('m2', 'muskrat-reedgatherer', 'Owner 11-04 23:17 (LIST-1104): cut for Alley Cat', { by: 'owner' }); noteRemoved('m2', 'muskrat-reedgatherer');
FIXED.m2 = Object.assign(FIXED.m2 || {}, { 'muskrat-reedgatherer': 'alley-cat' });
listAdd('m2', 'alley-cat', 'Owner 11-04 23:17 (LIST-1104): on the list for Muskrat Reedgatherer', 'owner');
A('LIST-1104 Sunken Hollow', 'Shoal Shark back; Muskrat Reedgatherer cut for Alley Cat (deck copies follow)');
// The Sundered Peak: Glacier Wolf Pack -> a mountain card (Claude's pick below, after the candidate scan)
const PEAK_PICK = 'chamois-leaper';
// Maps 20+: no archetype cards on the lists or in the decks (all archetypes wait; Evomax with its planning)
const ARCH_OUT = [];
for (const m of mainMaps) { const n = G.mapNumberOf(m.id); if (n < 20) continue;
  const ids = new Set(P[m.id].cards.concat(P[m.id].special || [])); (m.nodes || []).forEach(nd => Object.keys(nd.deck || {}).forEach(id => ids.add(id)));
  [...ids].filter(archOf).forEach(id => { ARCH_OUT.push({ map: m.id, no: n, id, arch: archOf(id) }); listRemove(m.id, id, 'Owner 11-04 23:18 (LIST-1104): no archetype cards on Map 20+ for now (' + archOf(id) + '); the archetypes wait', { by: 'owner' }); noteRemoved(m.id, id); }); }
A('LIST-1104 Maps 20+ archetypes', ARCH_OUT.map(x => x.id + ' (' + x.arch + ', Map ' + x.no + ')').join(', '));

// LISTFIX2-1 b / LISTFIX2-2 b: each fight gets another card from its map's own list; the cut card leaves the map's MAP + SPECIAL
const LF = [
  { mid: 'mb', id: 'fiddler-crab-swarm', node: '2-1', kind: 'reward', to: 'rock-pool-starfish' },
  { mid: 'mb', id: 'grey-seal-bull', node: '2-5', kind: 'reward', to: 'driftwood-crab' },
  { mid: 'mb', id: 'tidepool-trapper-crab', node: '2-3', kind: 'first', to: 'open-ocean-hermit-crab' },
  { mid: 'm2', id: 'old-sturgeon', node: '4-5', kind: 'reward', to: 'pyrenean-desman' },
  { mid: 'm2', id: 'stone-turtle-warden', node: '4-2', kind: 'first', to: 'water-shrew' },
  { mid: 'mw', id: 'venomlord-serpent', node: '5-3', kind: 'first', to: 'swamp-alligator' },
  { mid: 'mw', id: 'snapper-hatchling', node: '5-1', kind: 'first', to: 'cypress-root-lurker' },
  { mid: 'm8', id: 'marsh-wisp', node: '6-4', kind: 'first', to: 'lamprey' },
  { mid: 'm5', id: 'weaver-bird', node: '14-3', kind: 'first', to: 'marula-elephant' },
  { mid: 'm11', id: 'woodland-brawler', node: '20-9', kind: 'reward', to: 'magma-salamander' },
  { mid: 'mc', id: 'the-gannet-queen', node: '3-7', kind: 'reward', to: 'razorbill', boss: true },
  { mid: 'm3', id: 'yeti-chieftain', node: '19-6', kind: 'reward', to: 'yeti', boss: true, challenge: true },
];
for (const x of LF) {
  if (!P[x.mid].cards.includes(x.to)) throw new Error(x.to + ' is not on ' + x.mid + '\'s list');
  const no = G.mapNumberOf(x.mid), nodeKind = (byId(x.mid).nodes.find(n => n.key === x.node) || {}).kind, cap = G.roadRarityCap(no, nodeKind, x.mid);
  if (step(D[x.to].rarity) > step(cap)) throw new Error(x.to + ' over ' + x.node + '\'s cap ' + cap);
  if (x.kind === 'reward') {
    setSource(x.to, Object.assign({ kind: 'map', id: x.mid, node: x.node }, x.challenge ? { challenge: true } : {}), (x.boss ? 'LISTFIX2-2 b' : 'LISTFIX2-1 b') + ': ' + x.node + '\'s ' + (x.challenge ? 'reward and challenge card' : 'reward') + ' for ' + nm(x.id));
  } else {
    const k = x.mid + ':' + x.node, re = new RegExp(`(  '${k}': )'${x.id}',[^\\n]*`);
    if (!re.test(app)) throw new Error('first-pack line ' + k + ' not found');
    app = app.replace(re, `$1'${x.to}', // 2026-11-05 (CONTENT10, LISTFIX2-1 b): was ${x.id} (cut by the owner 11-01)`); plan.firstPack.push({ fight: k, from: x.id, to: x.to });
  }
  // the cut card: off the map's MAP + SPECIAL; its source follows the lists it is still on
  const why = `${NOTE} (${x.boss ? 'LISTFIX2-2 b' : 'LISTFIX2-1 b'}): off this map fully; ${x.node}'s ${x.kind === 'first' ? 'first-clear card' : x.challenge ? 'reward and challenge card' : 'reward'} is now ${nm(x.to)}`;
  P[x.mid].cards = P[x.mid].cards.filter(id => id !== x.id); P[x.mid].special = (P[x.mid].special || []).filter(id => id !== x.id);
  const r = rv(x.mid); r.chosen = r.chosen.filter(e => e.id !== x.id); const c = r.cut.find(e => e.id === x.id); if (c) c.statusWhy = why; else r.cut.push({ id: x.id, why: 'Owner 11-01: cut', by: 'owner', statusWhy: why });
  noteRemoved(x.mid, x.id);
  const fl = firstList(x.id), so = CARD[x.id].source || {};
  // a reward becomes a pack card of its first list's main map (a side map's card counts for its parent: K14's uniqueOf, the side map fights' decks);
  // a pack card keeps its source
  if (so.kind === 'map' && so.id === x.mid) setSource(x.id, fl ? { kind: 'pack', tier: packTier(G.mapNumberOf(fl.side ? fl.parent : fl.id)), map: fl.side ? fl.parent : fl.id } : { kind: 'pack', tier: packTier(no) }, fl ? 'a pack card, first listed on ' + label(fl) : 'on no list now (out of play)');
  A(x.boss ? 'LISTFIX2-2' : 'LISTFIX2-1', `${x.node}: ${nm(x.id)} -> ${nm(x.to)} (${x.kind === 'first' ? 'first clear' : x.challenge ? 'reward + challenge' : 'reward'})`);
}
// FIX8-1: Pelican Point (2-4) a little easier for a starter deck: Tide Pool Crab (owner 11-01 cut from Pebble Beach, on no Pebble Beach list) x5
// out for the list's softest card, Gull Thief (1/4), and one Conch Crawler fewer for a Rock Pool Starfish (2/1). Applied after the swaps.
const FIX8 = { 'tide-pool-crab': 'gull-thief' };

// archetype and LISTFIX2 cuts out of the decks of their map's own fights
// the main map's own fights only: a side map's decks that still hold a card the parent took off SPECIAL (Pebble Beach's 2-A / 2-B: Fiddler Crab
// Swarm, Tidepool Trapper Crab) wait for BAL16's rebuild, since swapping them in place breaks K14 (the side map's list is mostly other maps' cards).
// swapNodeDecks(sub, parent) does that swap when wanted.
Object.keys(REMOVED).forEach(mid => swapNodeDecks(mid));
{ const n = byId('mb').nodes.find(x => x.key === '2-4'); const d = Object.assign({}, nodeDeck('mb', n)), before = JSON.stringify(d);
  for (const [a, b] of Object.entries(FIX8)) { const k = d[a] || 0; delete d[a]; d[b] = (d[b] || 0) + k; }
  if (d['conch-crawler'] > 1) { d['conch-crawler']--; d['rock-pool-starfish'] = (d['rock-pool-starfish'] || 0) + 1; }
  Object.keys(d).forEach(c => { if (d[c] > G.maxCopiesForRarity(D[c].rarity)) throw new Error('2-4 over copy cap: ' + c); });
  setDeck('mb', n, d, 'FIX8-1: tide-pool-crab x5 -> gull-thief; conch-crawler -1 -> rock-pool-starfish +1 (was ' + before + ')'); }

// The Sundered Peak (owner 23:17): Glacier Wolf Pack off; a mountain card from the pool in its place (carried)
{ const fl = firstList(PEAK_PICK); if (!fl || fl.unlock >= 20) throw new Error(PEAK_PICK + ' is on no earlier list');
  listRemove('m11', 'glacier-wolf-pack', 'Owner 11-04 23:17 (LIST-1104): replaced by ' + nm(PEAK_PICK), { by: 'owner' }); noteRemoved('m11', 'glacier-wolf-pack');
  listAdd('m11', PEAK_PICK, 'Carried from ' + label(fl) + '; LIST-1104 (owner 23:17: "a thematic mountain card"): Claude\'s pick for Glacier Wolf Pack: a cliff goat of the peak (Mountain & sky)', 'claude');
  A('LIST-1104 The Sundered Peak', 'Glacier Wolf Pack -> ' + nm(PEAK_PICK)); }

// ================================================================== STAGE B (THEME6-1 counts)
const themes = gm.themes, units = {}; (themes.units || []).forEach(u => { units[u.id] = u; }); const umap = {}; (themes.maps || []).forEach(m => { umap[m.id] = m; });
const bkin = {}; themes.vocab.biomes.forEach(b => { bkin[b.id] = new Set(b.kin || []); }); const more = themes.vocab.mapBiomesMore || {};
const fitOf = (id, mid) => { const cb = new Set((units[id] || {}).biomes || []); const prim = new Set([(umap[mid] || {}).biome].filter(Boolean)), oth = new Set(more[mid] || []);
  const kin = new Set(); [...prim, ...oth].forEach(b => { (bkin[b] || new Set()).forEach(k => kin.add(k)); Object.keys(bkin).forEach(k => { if (bkin[k].has(b)) kin.add(k); }); });
  if ([...cb].some(b => prim.has(b))) return 4; if ([...cb].some(b => oth.has(b))) return 3; if ([...cb].some(b => kin.has(b))) return 1; return cb.size ? -3 : 0; };
const animalOf = id => String((CARD[id] || {}).animal || (units[id] || {}).animal || id).toLowerCase();
const effKeys = id => { const e = (D[id] || {}).effects || {}; return Object.keys(e).filter(k => e[k] !== false && e[k] != null && k !== 'triggers').concat((e.triggers || []).map(t => 'trig:' + (t.on || t.when || '?') + '/' + (t.do || '?'))); };
const PASSIVE = new Set(['flying', 'tide', 'swimmer', 'diurnal', 'nocturnal', 'armor', 'swarm']);
const activeScore = id => { const k = effKeys(id); return k.filter(x => x.startsWith('trig:')).length * 2 + k.filter(x => !x.startsWith('trig:') && !PASSIVE.has(x)).length; };
const isFaction = id => { const s = (CARD[id] || {}).source || {}; return s.kind === 'pack' && +s.tier === 11; };
const CUT_EVERYWHERE = new Set(['glacial-ape-king']); // CUT3
const removedAny = new Set(); Object.values(REMOVED).forEach(s => s.forEach(id => removedAny.add(id))); ['muskrat-reedgatherer', 'sea-turtle-elder'].forEach(id => removedAny.delete(id)); // the owner's per-map swaps; other maps may still carry them
const T5BY = {}; T5.forEach(p => { (T5BY[p.map] = T5BY[p.map] || new Set()).add(p.card); });
const CNBY = {}; Object.entries(CN.theme5 || {}).forEach(([mid, l]) => l.forEach(e => { (CNBY[mid] = CNBY[mid] || new Set()).add(e.id); }));
Object.entries(CN.skillrec || {}).forEach(([lab, l]) => { const m = /^(\d+)$/.exec(lab); if (!m) return; const mm = mainMaps.find(x => G.mapNumberOf(x.id) === +m[1]); if (mm) l.forEach(e => { (CNBY[mm.id] = CNBY[mm.id] || new Set()).add(e.id); }); });
const OWNER_1104 = { mb: ['rock-pool-starfish'], m2: ['shoal-shark', 'alley-cat'], m11: [PEAK_PICK] };
const byRank = { claude: 0, kept: 1, owner: 3 };
// the boss units: an elite's / boss's leader or showcase on any map (deckopt phase 2's rule: never a later map's leaders or boss-only cards)
const BOSSY = new Set(); G.CONQUEST_MAPS.forEach(m => (m.nodes || []).forEach(n => { if (!/boss|dungeon/.test(n.kind || '')) return; /* bosses, minibosses, world bosses (an elite's leader may be carried) */ let L = []; try { L = G.skirmishLeadersOf(n, m.id) || []; } catch (e) {} L.forEach(id => BOSSY.add(id)); if (n.showcase) BOSSY.add(n.showcase); }));
// animal kinds over the owner's caps (11-05 08:08): an add of one of them scores lower
const SOCIETY = new Set(['otter', 'hummingbird', 'ant', 'bee', 'honey bee']), MYTH = new Set(['yeti', 'unicorn', 'dragon', 'phoenix', 'kraken', 'griffin', 'wyrm']);
const animalCap = a => SOCIETY.has(a) ? 15 : a === 'beaver' ? 6 : MYTH.has(a) ? 1 : 3;
const OVERCAP = new Set(); { const listed0 = LP.listedIds({ maps: P }), c = {}; cards.forEach(x => { if (!listed0.has(x.id) || isBaby(x.id)) return; const a = animalOf(x.id); c[a] = (c[a] || 0) + 1; }); Object.entries(c).forEach(([a, k]) => { if (k >= animalCap(a)) OVERCAP.add(a); }); }
const laterCarriers = (id, mid) => { const me = ORDER.findIndex(x => x.id === mid); return ORDER.slice(me + 1).filter(x => listOf(x).includes(id) && x.id !== mid).length; };
const deckCopies = (mid, id) => (byId(mid).nodes || []).reduce((t, n) => t + ((nodeDeck(mid, n) || {})[id] || 0), 0);
const bigReward = id => { const so = (CARD[id] || {}).source || {}; if (so.kind !== 'map') return false; const mm = byId(so.id), nd = mm && (mm.nodes || []).find(n => n.key === so.node); return !nd || !/^skirmish$/.test(nd.kind || 'skirmish') || !!so.challenge; };
const ADDED = {}; // id -> carried adds so far in this package (a card carried everywhere reads as filler)
const groupOf = id => String((units[id] || {}).animalGroup || animalOf(id)).toLowerCase();
const fitText = f => f >= 4 ? 'the map\'s own biome' : f >= 3 ? 'one of the map\'s biomes' : f === 2 ? 'a biome the list already shares' : 'a kin biome';

for (const m of mainMaps) {
  const no = G.mapNumberOf(m.id); if (no < 2 || no > 24) continue;
  const tg = th6Targets(no), r = rv(m.id), prot = protectedOf(m.id), out = { no, name: m.name, target: tg, cuts: [], adds: [], before: null, after: null, short: null };
  const counts = () => { const nb = r.chosen.filter(e => !isBaby(e.id)); return { own: nb.filter(e => !isCarriedE(e)).length, carried: nb.filter(isCarriedE).length }; };
  out.before = counts();
  const animalsOn = () => { const c = {}; r.chosen.forEach(e => { const a = animalOf(e.id); c[a] = (c[a] || 0) + 1; }); return c; };
  const groupsOn = () => { const c = {}; r.chosen.forEach(e => { const a = groupOf(e.id); c[a] = (c[a] || 0) + 1; }); return c; };
  const cutRank = e => { const an = animalsOn(); return [e.by === 'owner' || /want jellyfish/.test(e.why || '') ? 1 : 0, -(an[animalOf(e.id)] > 1 ? 1 : 0), -(e.flag === 'unlikely' ? 1 : 0), laterCarriers(e.id, m.id) ? 1 : 0, byRank[e.by] == null ? 1 : byRank[e.by], fitOf(e.id, m.id), activeScore(e.id) > 0 ? 1 : 0, deckCopies(m.id, e.id)]; };
  const cmpRank = (a, b) => { const x = cutRank(a), y = cutRank(b); for (let i = 0; i < x.length; i++) if (x[i] !== y[i]) return x[i] - y[i]; return a.id < b.id ? -1 : 1; };
  const cutOne = (carried) => {
    const pool = r.chosen.filter(e => !isBaby(e.id) && isCarriedE(e) === carried && !prot.set.has(e.id) && !(OWNER_1104[m.id] || []).includes(e.id) && animalOf(e.id) !== 'jellyfish'); if (!pool.length) return false; // the jellyfish stay (owner 11-02 21:12: "I want jellyfish in the game")
    const e = pool.sort(cmpRank)[0], an = animalsOn(), f = fitOf(e.id, m.id);
    const reason = [an[animalOf(e.id)] > 1 ? 'a second ' + animalOf(e.id) + ' on this list ("each card must feel distinct")' : '', e.flag === 'unlikely' ? 'flagged Unlikely (THEME4)' : '', f < 3 ? 'weak theme fit (' + (f >= 1 ? 'kin biome only' : 'off-biome') + ')' : 'the weakest fit left by the order (fit, active skills, deck use)'].filter(Boolean).join('; ');
    const why = `${NOTE} (THEME6-1 count: ${carried ? 'carried' : 'own'} ${carried ? tg.carried : tg.own} on Map ${no}): cut by Claude, ${reason}. Flip it to keep it.`;
    listRemove(m.id, e.id, why, { keepSpecial: true }); out.cuts.push({ id: e.id, name: nm(e.id), carried, why: reason, wasBy: e.by }); return true; };
  while (counts().own > tg.own && cutOne(false));
  while (counts().carried > tg.carried && cutOne(true));
  // carried adds
  const cap = opt.mapRarityCap(gm, m, 'map'), scap = G.roadRarityCap(no, 'skirmish', m.id), me = ORDER.findIndex(x => x.id === m.id);
  const lateMaps = ORDER.slice(0, me).filter(x => x.unlock < no || (x.unlock === no && !x.side && false));
  const listSkills = new Set(); r.chosen.forEach(e => effKeys(e.id).forEach(k => listSkills.add(k)));
  const ownerCut = new Set((r.cut || []).filter(c => c.by === 'owner').map(c => c.id).concat(out.cuts.map(c => c.id)));
  let need = tg.carried - counts().carried; const seen = new Set();
  const cands = [], MAYBE = new Set((r.maybe || []).map(e => e.id)); // THEME3's maybes for this list (cards that would fit, best first)
  // the theme fit: unit-themes' biome fit (4 the map's biome, 3 one of its biomes, 1 a kin biome), else 2 when the card shares a biome with at
  // least three of the list's own cards (THEME3 read the coast cards as Gannet Cliffs' theme that way)
  const listBiomes = {}; r.chosen.filter(e => !isCarriedE(e)).forEach(e => ((units[e.id] || {}).biomes || []).forEach(b => { listBiomes[b] = (listBiomes[b] || 0) + 1; }));
  const fit2 = id => { const f = fitOf(id, m.id); if (f >= 1) return f; return ((units[id] || {}).biomes || []).some(b => (listBiomes[b] || 0) >= 3) ? 2 : f; };
  const REJ = {}, rej = (k, id) => { (REJ[k] = REJ[k] || []).push(id); };
  const why0 = id => { // why a card of an earlier list is not a candidate ('' = it is one)
    const d = D[id]; if (!d || P[m.id].cards.includes(id) || (P[m.id].special || []).includes(id) || r.chosen.some(e => e.id === id)) return 'here';
    if (d.token || d.test || d.easterEgg || CARD[id].unattainable || d.cardType === 'spell' || d.cardType === 'equipment' || d.spell || d.equip || d.hero || d.pool || id === 'wandering-traveller') return 'odd';
    if (d.rarity === 'starter' || ((CARD[id].source || {}).kind === 'base')) return 'starter'; // a Base / starter card adds nothing a player lacks
    const t5 = !!(T5BY[m.id] && T5BY[m.id].has(id)); // THEME5's picks were proposed to the owner with their own checks: boss, reward and fit do not hold them back
    if (BOSSY.has(id) && !t5) return 'boss'; // a fight's boss unit stays its fight's
    if (!t5 && bigReward(id)) return 'reward'; // an elite's / boss's / dungeon's prize stays that fight's; a plain skirmish's reward may be carried (as THEME3 did)
    if (isBaby(id) || isFaction(id) || archOf(id) || CUT_EVERYWHERE.has(id) || removedAny.has(id) || ownerCut.has(id)) return 'excluded';
    const e = d.effects || {}; if (e.leader || ((CARD[id].source || {}).challenge)) return 'leader';
    if (step(d.rarity) > step(cap)) return 'rarity'; if (opt.obtainOf(gm, id) > no) return 'obtain';
    if (fit2(id) < 1 && !t5) return 'fit'; return ''; };
  for (const y of lateMaps.slice().reverse()) (y.side ? listOf(y) : P[y.id].cards).forEach(id => { // MAP and SUBMAP lists, not SPECIAL (fight-only cards)
    if (seen.has(id)) return; seen.add(id); const no0 = why0(id); if (no0) { rej(no0, id); return; }
    const d = D[id], f = Math.max(1, fit2(id)), fresh = effKeys(id).filter(k => !listSkills.has(k)).length;
    const score = (T5BY[m.id] && T5BY[m.id].has(id) ? 100 : 0) + (CNBY[m.id] && CNBY[m.id].has(id) ? 50 : 0) + f * 10 + Math.min(6, activeScore(id)) * 2 + Math.min(4, fresh) * 2 + (step(d.rarity) <= step(scap) ? 3 : 0) - (OVERCAP.has(animalOf(id)) ? 8 : 0) + Math.max(0, 6 - (no - y.unlock)) * 1.5 - 6 * (ADDED[id] || 0) + (MAYBE.has(id) ? 30 : 0);
    cands.push({ id, from: y, fit: f, score, t5: !!(T5BY[m.id] && T5BY[m.id].has(id)), cn: !!(CNBY[m.id] && CNBY[m.id].has(id)), fresh }); });
  cands.sort((a, b) => b.score - a.score || (a.id < b.id ? -1 : 1));
  if (process.argv.includes('--cands=' + m.id)) { console.log('CANDS ' + m.id + ' cap ' + cap + ': ' + cands.slice(0, 30).map(c => `${c.id}[${animalOf(c.id)} f${c.fit} ${Math.round(c.score)}]`).join(' ')); Object.entries(REJ).forEach(([k, l]) => console.log('  rej ' + k + ' ' + l.length + ': ' + l.slice(0, 50).join(' '))); }
  for (const c of cands) { if (need <= 0) break; const an = animalsOn(), gr = groupsOn(); if (an[animalOf(c.id)] || gr[groupOf(c.id)]) continue; // distinct: no animal (or animal group) the list holds
    const src = c.t5 ? 'THEME5 carried pick' : c.cn ? 'Claude New pick' : 'thematic fit';
    const fl = firstList(c.id);
    const why = `Carried from ${label(fl || c.from)}; ${fitText(c.fit)}; ${src}${activeScore(c.id) ? ', active skills (' + effKeys(c.id).filter(k => !PASSIVE.has(k)).slice(0, 3).join(', ') + ')' : ''}; ${NOTE} (THEME6-1: carried ${tg.carried} on Map ${no})`;
    ADDED[c.id] = (ADDED[c.id] || 0) + 1; listAdd(m.id, c.id, why, 'claude'); effKeys(c.id).forEach(k => listSkills.add(k)); out.adds.push({ id: c.id, name: nm(c.id), from: (fl || c.from).id, fit: c.fit, src }); need--; }
  out.after = counts(); if (out.after.carried < tg.carried) out.short = 'carried ' + out.after.carried + '/' + tg.carried + ' (no more thematic, distinct candidates in the cap)';
  if (out.after.own < tg.own) out.short = (out.short ? out.short + '; ' : '') + 'own ' + out.after.own + '/' + tg.own + ' (below the target: no own card added)';
  plan.maps[m.id] = out;
}

// the unattainable flags: `--flags` after --apply (tools/lib_map_pools.js isOutOfPlay on the new files, tests/bal7 M3)
const listedNow = LP.listedIds({ maps: P }); plan.unattainable = 'see --flags';

// ---- deck edits into arena_app.js (BAL9's literal replace after the node's key)
function replaceDeckAfter(s, key, deck, note) {
  const re = new RegExp(`key:\\s*['"]${key.replace(/-/g, '\\-')}['"]`); const m = re.exec(s); if (!m) return null; const i = s.indexOf('deck:{', m.index); if (i < 0 || i - m.index > 4000) return null;
  const j = s.indexOf('}', i), orig = s.slice(i, j + 1), dbl = orig.includes('"');
  const lit = 'deck:' + (dbl ? JSON.stringify(deck) : JSON.stringify(deck).replace(/"/g, "'")) + ' /* ' + note + ' */';
  return s.slice(0, i) + lit + s.slice(j + 1);
}
for (const k of Object.keys(deckEdits)) { const x = deckEdits[k], tot = o => Object.values(o).reduce((a, b) => a + b, 0);
  if (tot(x.deck) !== tot(x.before)) log.push(`deck size changed ${k}: ${tot(x.before)} -> ${tot(x.deck)}`);
  plan.decks.push({ fight: x.mid + ':' + x.key, before: x.before, after: x.deck, notes: x.notes });
  const s2 = replaceDeckAfter(app, x.key, x.deck, `2026-11-05 (CONTENT10): ${x.notes.join('; ')}`.replace(/\*\//g, '* /')); if (s2 == null) throw new Error('deck not found ' + k); app = s2; }

// ---- the animal kinds over the owner's caps (11-05 08:08), counted over the cards in play (on a list or given by a fight)
{ const inPlay = id => { const c = CARD[id]; if (!c || c.token || c.test || c.hidden === true && false) return false; const so = c.source || {}; return listedNow.has(id) || (so.kind === 'map'); };
  const cnt = {}; cards.forEach(c => { if (!inPlay(c.id) || isBaby(c.id)) return; const a = animalOf(c.id); (cnt[a] = cnt[a] || []).push(c.id); });
  const SOCIETY = new Set(['otter', 'hummingbird', 'ant', 'bee', 'honey bee']), BEAVER = new Set(['beaver']), MYTH = new Set(['yeti', 'unicorn', 'dragon', 'phoenix', 'kraken', 'griffin', 'wyrm']);
  plan.animals = Object.entries(cnt).map(([a, ids]) => { const cap = SOCIETY.has(a) ? 15 : BEAVER.has(a) ? 6 : MYTH.has(a) ? 1 : 3; return { animal: a, count: ids.length, cap, over: ids.length > cap, ids }; }).filter(x => x.over).sort((a, b) => b.count - a.count); }

// ---- write
const dir = path.join(ROOT, 'docs', 'balance', 'content10'); fs.mkdirSync(dir, { recursive: true });
plan.archetypesOut = ARCH_OUT; plan.log = log;
fs.writeFileSync(path.join(dir, 'plan-2026-11-05.json'), JSON.stringify(plan, null, 1) + '\n');
console.log('targets', plan.targets.filter(t => t.map <= 24).map(t => t.map + ':' + t.own + '/' + t.carried).join(' '));
plan.stageA.forEach(x => console.log('A', x.what, '|', x.detail));
Object.values(plan.maps).forEach(o => console.log(`Map ${o.no} ${o.name}: own ${o.before.own}->${o.after.own}/${o.target.own}, carried ${o.before.carried}->${o.after.carried}/${o.target.carried}` + (o.cuts.length ? ' | cut ' + o.cuts.map(c => c.name + (c.carried ? ' (c)' : '')).join(', ') : '') + (o.adds.length ? ' | add ' + o.adds.map(c => c.name).join(', ') : '') + (o.short ? ' | SHORT ' + o.short : '')));
console.log('decks', plan.decks.length, 'sources', plan.sources.length, 'unattainable', JSON.stringify(plan.unattainable)); log.forEach(l => console.log('!', l));
if (APPLY) {
  reviewFile.content10 = 'CONTENT10 (2026-11-05): THEME6-1 counts (cut entries by Claude carry a why that says so: flip to keep), LIST-1104 and LISTFIX2 swaps; tools/content10/apply_2026_11_05.js, plan in docs/balance/content10/plan-2026-11-05.json.';
  // the files' own layouts: map-pools as tools/fold_map_pools.js serializes it, map-review indent 1, cards.json indent 2 with \u escapes
  const ids = a => '[' + a.map(x => JSON.stringify(x)).join(', ') + ']', lines = ['{', ' "_about": ' + JSON.stringify(poolsFile._about) + ',', ' "maps": {'], mk = Object.keys(P);
  mk.forEach((id, i) => { const e = LP.normalizeEntry(P[id]), subs = Object.keys(e.submaps); lines.push(`  ${JSON.stringify(id)}: {`, `   "cards": ${ids(e.cards)},`);
    if (!subs.length) lines.push('   "submaps": {},'); else { lines.push('   "submaps": {'); subs.forEach((s, j) => lines.push(`    ${JSON.stringify(s)}: ${ids(e.submaps[s])}` + (j < subs.length - 1 ? ',' : ''))); lines.push('   },'); }
    lines.push(`   "special": ${ids(e.special)}`, '  }' + (i < mk.length - 1 ? ',' : '')); });
  lines.push(' }', '}', '');
  fs.writeFileSync(path.join(ROOT, POOLS_F), lines.join('\n'));
  fs.writeFileSync(path.join(ROOT, REVIEW_F), JSON.stringify(reviewFile, null, 1) + '\n');
  const esc = s => s.replace(/[\u007f-\uffff]/g, ch => '\\u' + ch.charCodeAt(0).toString(16).padStart(4, '0'));
  fs.writeFileSync(path.join(ROOT, CARDS_F), esc(JSON.stringify(cards, null, 2)) + '\n');
  fs.writeFileSync(path.join(ROOT, APP_F), app);
  console.log('written');
}
