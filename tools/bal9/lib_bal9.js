'use strict';
// 2026-11-02 (package BAL9): shared pieces for the BAL9 tools (tools/bal9/*.js): the game through tools/lib_bramble.js, the map lists, a
// seeded generator, the card cap rules (JJ12) and the Map 40+ deck-fill rule (JJ22, fillDeckToSize).
const fs = require('fs'), path = require('path');
const ROOT = path.join(__dirname, '..', '..');
let _g = null;
function game() {
  if (_g) return _g;
  const B = require(path.join(ROOT, 'tools', 'lib_bramble.js')), G = B.G, D = B.CARD_DEFS_BASELINE;
  const LP = require(path.join(ROOT, 'tools', 'lib_map_pools.js'));
  const pools = JSON.parse(fs.readFileSync(path.join(ROOT, 'canonical', 'map-pools.json'), 'utf8'));
  _g = { B, G, D, LP, pools, ROOT };
  return _g;
}
function rng(seedStr) { let h = 2166136261; for (let i = 0; i < seedStr.length; i++) { h ^= seedStr.charCodeAt(i); h = Math.imul(h, 16777619); } let s = h >>> 0;
  return () => { let t = (s = (s + 0x6D2B79F5) >>> 0); t = Math.imul(t ^ (t >>> 15), t | 1); t ^= t + Math.imul(t ^ (t >>> 7), t | 61); return ((t ^ (t >>> 14)) >>> 0) / 4294967296; }; }
function readJson(f, d) { try { return JSON.parse(fs.readFileSync(path.isAbsolute(f) ? f : path.join(ROOT, f), 'utf8')); } catch (e) { if (d !== undefined) return d; throw e; } }
function writeJson(f, j) { fs.writeFileSync(path.isAbsolute(f) ? f : path.join(ROOT, f), JSON.stringify(j, null, 1) + '\n'); }
// the GD5 first-clear pack cards (SKIRMISH_FIRST_PACK_CARDS), read from arena_app.js
function firstPackTable(src) {
  const a = src.indexOf('const SKIRMISH_FIRST_PACK_CARDS = {'), b = src.indexOf('};', a); const out = {};
  src.slice(a, b).split('\n').forEach(l => { const m = /^\s*'([^']+)':\s*'([^']+)'/.exec(l); if (m) out[m[1]] = m[2]; });
  return out;
}
// Locations whose lists BAL9 leaves alone: the tutorial side map (packs skip it) and the Old Bramble (its fights sit at Map 0's Common cap
// though it opens at Map 21: an open question, reported).
const SKIP_LOCS = new Set(['mtut', 'mtut12', 'mo']);
const step = r => game().G.roadRarityStep(r);
// a fight's rarity cap (the game's roadRarityCap: a side map's fights by its own map number)
function nodeCap(loc, node) { const { G } = game(); return G.roadRarityCap(G.mapNumberOf(loc), (node && node.kind) || 'skirmish', loc); }
function listCap(loc) { const { G } = game(); return G.roadRarityCap(G.mapNumberOf(loc), 'boss', loc); }

// JJ22 (owner 11-02 00:17: "Map 40+: when the rarity cap cannot fill a 20-card deck, add +1 carried card (lower rarity first), and so on").
// fillDeckToSize(deck, opts): deck {id: copies}; opts.size (20), opts.capOf(id) the copy cap, opts.own the map's own cards (list order),
// opts.carried the cards the map may carry (earlier maps' cards, each {id, rarity}), opts.rarityStep(r). The deck is filled from its own
// cards first (each to its copy cap, the existing ones first); while it is still short, ONE carried card is added (the lowest rarity first,
// then the list order) and filled to its cap, and so on. Returns {deck, added: [ids carried in], short: copies still missing}.
function fillDeckToSize(deck, opts) {
  const size = opts.size || 20, capOf = opts.capOf, rs = opts.rarityStep || step, out = Object.assign({}, deck), added = [];
  const total = () => Object.values(out).reduce((t, k) => t + (k | 0), 0);
  const top = id => { while (total() < size && (out[id] || 0) < capOf(id)) out[id] = (out[id] || 0) + 1; };
  Object.keys(out).forEach(top); (opts.own || []).forEach(top);
  const carried = (opts.carried || []).filter(c => out[c.id] == null).map((c, i) => Object.assign({ i }, c)).sort((a, b) => rs(a.rarity) - rs(b.rarity) || a.i - b.i);
  for (const c of carried) { if (total() >= size) break; added.push(c.id); top(c.id); }
  return { deck: out, added, short: Math.max(0, size - total()) };
}
module.exports = { ROOT, game, rng, readJson, writeJson, firstPackTable, SKIP_LOCS, step, nodeCap, listCap, fillDeckToSize };
