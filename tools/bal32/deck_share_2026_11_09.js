#!/usr/bin/env node
// 2026-11-09 (package BAL32, owner BAL31-3): the share of decks on Maps 0-20 that hold each enabler's partner, for the enabler price
// (gain with the partner x the share of decks the partner is in). Three deck sets, each a deck once:
//   road:      every fight deck of Maps 0-20 and their side maps (the game's CONQUEST_MAPS nodes with a deck; tutorials and raids left out,
//              as tools/opt/deckopt.js fightsOf);
//   reference: the Map reference (WINRATE_REF_DECKS, one deck per map 0-20 as referenceDeckFor deals it) and the per-map reference sets
//              baked into the game (REF_DECK_SETS with decks by map: the REF5 progression decks and the BAL13 reference ladder), Maps 0-20;
//   skirmish:  the PRO / BPRO decks of Maps 0-20 (canonical/pro-skirmishes.json).
// A deck holds the partner when any card in it (count > 0) carries the partner's skill (bramblewood-budget.js XP flattens families).
// Own-side partners (Shatter, Bleed, Poison) are counted in the enabler's own decks; foe-side partners (Armor, dodgers, equipment) in the
// decks it fights. Every set is shown; the price uses all decks pooled (a player's card meets road decks, a CPU card meets the player's).
//   node tools/bal32/deck_share_2026_11_09.js -> docs/balance/bal32/deck-share-2026-11-09.json
'use strict';
const fs = require('fs'), path = require('path');
const ROOT = path.join(__dirname, '..', '..'), LB = require(path.join(ROOT, 'tools', 'lib_bramble.js')), G = LB.G, BB = require(path.join(ROOT, 'bramblewood-budget.js'));
const J = f => JSON.parse(fs.readFileSync(path.join(ROOT, f), 'utf8'));
const D = Object.assign({}, LB.CARD_DEFS_BASELINE), flat = e => BB.XP ? BB.XP(e || {}) : (e || {});
const MAXMAP = 20;
const PARTNERS = {
  shatter: { label: 'Shatter (own deck)', test: (e, d) => e.shatter != null && e.shatter !== false },
  bleed: { label: 'Bleed (own deck)', test: e => e.bleed != null && e.bleed !== false && e.bleed !== 0 },
  poison: { label: 'Poison / Venomous (own deck)', test: e => (e.poison != null && e.poison !== false && e.poison !== 0) || (e.venomous != null && e.venomous !== false) },
  armor: { label: 'Armor (foe deck)', test: e => (+e.armor || 0) > 0 },
  dodge: { label: 'Evasive / Swift / Flying / Prey (foe deck)', test: e => !!(e.evasive || e.swift || e.flying || e.prey) },
  equipment: { label: 'equipment cards or a smith that lays a piece (Forge Weapon) (foe deck)', test: (e, d) => !!(d && (d.cardType === 'equipment' || d.equip || /forgeWeapon/.test(JSON.stringify(d.effects || {})))) },
};
const idOf = k => String(k).replace(/@.*$/, '');
function has(deck, test) { return Object.entries(deck || {}).some(([k, n]) => { const d = D[idOf(k)]; return (n | 0) > 0 && d && test(flat(d.effects), d); }); }
const sets = { road: [], reference: [], skirmish: [] };
// road
(G.CONQUEST_MAPS || []).forEach(m => { const no = G.mapNumberOf(m.id); if (no == null || no > MAXMAP) return;
  (m.nodes || []).filter(n => n.deck && Object.keys(n.deck).length && n.kind !== 'tutorial' && !/raidboss|megaraid/.test(n.kind || '')).forEach(n => sets.road.push({ id: m.id + ':' + (n.id || n.code || ''), deck: n.deck })); });
// reference: the Map reference per map, and the per-map sets
const W = G.WINRATE_REF_DECKS || {}; const seen = new Set();
for (let no = 0; no <= MAXMAP; no++) { const built = Object.keys(W.road || {}).map(Number).filter(Number.isFinite).sort((a, b) => a - b), at = no <= 0 ? 0 : (built.filter(k => k <= no).pop() || built[0] || 0);
  const deck = no <= 0 || !at ? W.starter : W.road[at], key = 'map-ref:' + (no <= 0 || !at ? 'starter' : at); if (deck && !seen.has(key)) { seen.add(key); sets.reference.push({ id: key, deck }); } }
const RS = G.REF_DECK_SETS || {};
Object.entries(RS).forEach(([sid, s]) => {
  if (s.decks) Object.entries(s.decks).forEach(([k, list]) => { const no = /^\d+$/.test(k) ? +k : G.mapNumberOf(k); if (no == null || no > MAXMAP) return; (list || []).forEach((e, i) => { if (e && e.counts) sets.reference.push({ id: sid + ':' + k + ':' + (i + 1), deck: e.counts }); }); });
  else if (s.counts) sets.reference.push({ id: sid, deck: s.counts }); });
// skirmish (PRO / BPRO)
const PS = J('canonical/pro-skirmishes.json');
Object.entries(PS.maps || {}).forEach(([mid, e]) => { const no = e.map != null ? e.map : G.mapNumberOf(mid); if (no == null || no > MAXMAP) return;
  ['pro', 'bpro'].forEach(kind => (e[kind] || []).forEach(p => { if (p && p.deck) sets.skirmish.push({ id: kind + ':' + (p.id || mid), deck: p.deck }); })); });
const all = [].concat(sets.road, sets.reference, sets.skirmish);
const r3 = v => Math.round(v * 1000) / 1000, out = { tool: 'tools/bal32/deck_share_2026_11_09.js 1.0.0 (2026-11-09, BAL32)', generated: new Date().toISOString(), maps: '0-' + MAXMAP,
  decks: { road: sets.road.length, reference: sets.reference.length, skirmish: sets.skirmish.length, all: all.length }, partners: {} };
Object.entries(PARTNERS).forEach(([k, p]) => { const row = { label: p.label };
  Object.entries(sets).forEach(([s, list]) => { const n = list.filter(x => has(x.deck, p.test)).length; row[s] = { n, of: list.length, share: list.length ? r3(n / list.length) : null }; });
  const n = all.filter(x => has(x.deck, p.test)).length; row.all = { n, of: all.length, share: r3(n / all.length) };
  row.carriers = Object.keys(D).filter(id => { const d = D[id]; return d && !d.token && !d.test && p.test(flat(d.effects), d); }).length;
  out.partners[k] = row; });
fs.mkdirSync(path.join(ROOT, 'docs', 'balance', 'bal32'), { recursive: true });
fs.writeFileSync(path.join(ROOT, 'docs', 'balance', 'bal32', 'deck-share-2026-11-09.json'), JSON.stringify(out, null, 1) + '\n');
console.log(JSON.stringify(out.decks)); Object.entries(out.partners).forEach(([k, r]) => console.log(k.padEnd(10), 'road', r.road.share, 'ref', r.reference.share, 'skirmish', r.skirmish.share, 'all', r.all.share, `(${r.all.n}/${r.all.of})`));
