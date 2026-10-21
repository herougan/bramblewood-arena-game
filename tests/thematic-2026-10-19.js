#!/usr/bin/env node
// 2026-10-19 (package TH, the thematic pass; owner 00:19: "reassign skirmishes based on thematics", "5–10 new cards per map — from
// skirmish-only rewards and pack"). Checks, against the real data:
//   1. the placed pool cards are live: no pool fields, a live card number after the old highest (the Admin placement's next number),
//      a source that matches the slot they were made for (a skirmish reward on a real fight of their map's family, or the basic pack
//      pool); 5–10 a map for Maps 0–12 (Map 16 has only its two), the polar set placed, the four left still in the pool;
//   2. every card a fight fields or gives exists and is live (no pool card in a deck or a reward);
//   3. the road's rarity caps and copy limits on every fight and reward;
//   4. the themes: tools/thematic_pass_2026_10_19.js finds no off-theme card in any fight, the Pelican Divers are capped on Gannet
//      Cliffs, no Badger Berserker outside the badger maps (Ashen Spurn, the Long Burrow and its parent map, the Rimefire Caldera);
//   5. the new fields sit on a few fights of their maps, not all: Spore Cloud (7), Tangled Roots (9), Thunderstorm (10), Ash Rain and
//      Ashy (19);
//   6. the road curve: the final measure (docs/balance/skirmish-pass-th-after.jsonl, 120 games on the measure seeds, the reference
//      decks rebuilt after the placement) has every main-map fight inside its green band (bosses 30–49%), and it measured the decks
//      the game has now;
//   7. the docs: docs/thematic-pass-2026-10-19.md and its .xlsx, and a CHANGELOG entry.
'use strict';
const fs = require('fs'), path = require('path');
const ROOT = path.join(__dirname, '..');
let fail = 0, n = 0; const ok = (c, m)=>{ n++; if(!c){ fail++; console.log('  ✗', m); } };
const read = rel=> fs.readFileSync(path.join(ROOT, rel), 'utf8'), readJSON = rel=> JSON.parse(read(rel));
const src = read('arena_app.js'), cards = readJSON('canonical/cards.json'), defs = Object.fromEntries(cards.map(c=> [c.id, c]));
// 2026-10-21 (package RP, the rewards and sources pass): it moved some of these cards on (docs/balance/rewards-pass-2026-10-21.json:
// one unique reward a side map, plain rewards on Maps 0-1, the Devilry / Ecclesia gates, Otters and Hummingbirds to the faction
// rewards). A card it moved is checked against its new source there.
const RP_MOVES = (()=>{ try{ return Object.fromEntries(JSON.parse(fs.readFileSync(path.join(ROOT, 'docs', 'balance', 'rewards-pass-2026-10-21.json'), 'utf8')).moves.map(m=> [m.id, m])); }catch(e){ return {}; } })();
const rpMoved = c=>{ const m = c && RP_MOVES[c.id]; if(!m) return false; if(m.to === 'awaitingSource') return !c.source && c.awaitingSource === true; if(m.to === 'base') return !c.source; return JSON.stringify(c.source) === JSON.stringify(m.to); };
const slice = (a, b)=>{ const i = src.indexOf(a), j = src.indexOf(b, i); if(i < 0 || j < 0) throw new Error('missing ' + a); return src.slice(i, j); };
// eslint-disable-next-line no-eval
const RR = eval(slice('// ROAD_RARITY:BEGIN', '// ROAD_RARITY:END') + ';({roadRarityCap, roadRarityStep, roadRarityOk})');
// eslint-disable-next-line no-eval
const MAXC = eval(slice('const RARITY_MAX_COPIES = {', '// Rarity on the road') + ';maxCopiesForRarity');
const i0 = src.indexOf('const CONQUEST_MAPS = ['), j0 = src.indexOf('\n];', i0);
// eslint-disable-next-line no-eval
const MAPS = eval(src.slice(i0 + 'const CONQUEST_MAPS = '.length, j0 + 2));
const mains = MAPS.filter(m=> !m.sub && !m.reserved);
const numOf = m=> mains.indexOf(m.sub ? MAPS.find(x=> x.id === m.parent) : m);
const family = id=>{ const m = MAPS.find(x=> x.id === id), main = m.sub ? MAPS.find(x=> x.id === m.parent) : m; return MAPS.filter(x=> x === main || (x.sub && x.parent === main.id)); };

// ---- 1. the placed cards
const REC = readJSON('docs/balance/thematic-placed-2026-10-19.json').placed, PLAN = readJSON('docs/balance/thematic-pass-2026-10-19.json');
ok(REC.length === PLAN.place.length && REC.length >= 90, `1. every planned placement is recorded (${REC.length})`);
const OLD_MAX = 1234; // the highest live card number before the pass
REC.forEach(p=>{ const c = defs[p.id];
  ok(c && !c.pool && !('poolMap' in c) && !('poolSlot' in c), `1. ${p.id}: live, its pool fields gone`);
  ok(c && c.numericId === p.numericId && c.numericId > OLD_MAX && c.numericId < 9001, `1. ${p.id}: a live card number (#${c && c.numericId}), not its pool #${p.poolNo}`);
  const s = c && c.source;
  if(rpMoved(c)) ok(true, `1. ${p.id}: moved on by package RP (${JSON.stringify(RP_MOVES[p.id].to)})`);
  else if(p.poolSlot === 'pack') ok(s && s.kind === 'pack' && s.tier === 1, `1. ${p.id}: made for a pack, in the basic pack pool (tier 1)`);
  else { const fam = family(p.poolMap), host = s && fam.find(m=> m.id === s.id), node = host && host.nodes.find(x=> x.key === s.node);
    ok(s && s.kind === 'map' && node, `1. ${p.id}: a skirmish-only reward on a fight of its map (${p.poolMap}): ${s && s.id}/${s && s.node}`);
    ok(node && RR.roadRarityOk(c.rarity, numOf(host), node.kind), `1. ${p.id}: ${c && c.rarity} within the ${s && s.node} (${node && node.kind}) cap`); }
  ok(/package TH/.test(c && c.creatorNote || ''), `1. ${p.id}: its note says where it was placed`); });
const nums = REC.map(p=> p.numericId).sort((a, b)=> a - b);
ok(nums.every((x, i)=> x === OLD_MAX + 1 + i), '1. the new numbers run on from the last live card, one each, as the Admin placement gives them');
ok(new Set(cards.map(c=> c.numericId)).size === cards.length, '1. numericIds unique');
const perMap = {}; REC.forEach(p=>{ const k = numOf(family(p.poolMap)[0]); perMap[k] = (perMap[k] || 0) + 1; });
for(let k = 0; k <= 12; k++) ok(perMap[k] >= 5 && perMap[k] <= 10, `1. Map ${k}: 5–10 new cards (${perMap[k] || 0})`);
ok(perMap[16] === 2 && perMap[17] >= 5 && perMap[17] <= 10, `1. the polar maps: Map 16 both its cards, Map 17 and the Ice Hollow 5–10 (${perMap[16]}, ${perMap[17]})`);
const left = cards.filter(c=> c.pool).map(c=> c.id).sort();
ok(JSON.stringify(left) === JSON.stringify(['roseate-spoonbill', 'sanderling', 'wallcreeper', 'water-scorpion']), '1. four left in the pool: ' + left);
['pincushion-urchin', 'banded-sea-krait', 'yellow-bellied-sea-snake', 'giant-cave-huntsman', 'polar-bear', 'walrus-icebreaker'].forEach(id=> ok(defs[id] && !defs[id].pool && defs[id].source, `1. the owner's examples are placed: ${id}`));
const GI = ['fen-mink', 'tidepool-trapper-crab', 'grave-grin-hyena', 'bogfire-newt', 'plague-gnat-cloud', 'glasswing-moth', 'rivergate-drummer', 'frostmoon-howler', 'chapel-tortoise', 'weathervane-swift'];
const GI_MAP = {'fen-mink': 'mw', 'plague-gnat-cloud': 'mw', 'tidepool-trapper-crab': 'mb', 'grave-grin-hyena': 'm5', 'bogfire-newt': 'm8', 'glasswing-moth': 'md', 'rivergate-drummer': 'mf', 'frostmoon-howler': 'm6', 'chapel-tortoise': 'm21', 'weathervane-swift': 'm22'};
GI.forEach(id=>{ const c = defs[id]; ok(c && (rpMoved(c) || (c.source && c.source.kind === 'map' && family(GI_MAP[id]).some(m=> m.id === c.source.id))), `1. GI example ${id} placed where its note says (${GI_MAP[id]}): ${c && c.source && c.source.node}`); });

// ---- 2. every card a fight fields or gives exists and is live
const bad = [];
MAPS.forEach(m=> (m.nodes || []).forEach(nd=>{ const ids = new Set(Object.keys(nd.deck || {})); (nd.leaders || []).forEach(id=> ids.add(id));
  ((nd.dungeon && nd.dungeon.waveDecks) || []).forEach(w=> w && Object.keys(w).forEach(id=> ids.add(id)));
  ids.forEach(id=>{ if(!defs[id]) bad.push(`${nd.key}: no card ${id}`); else if(defs[id].pool) bad.push(`${nd.key}: pool card ${id}`); }); }));
cards.filter(c=> c.source && c.source.kind === 'map' && c.source.node).forEach(c=>{ const m = MAPS.find(x=> x.id === c.source.id); if(!m || !m.nodes.some(x=> x.key === c.source.node)) bad.push(`${c.id}: reward of a missing fight ${c.source.id}/${c.source.node}`); if(c.pool) bad.push(`${c.id}: a pool card with a source`); });
ok(!bad.length, '2. every deck card and every reward is a live card on a real fight: ' + bad.slice(0, 6).join('; '));

// ---- 3. rarity caps and copies
const capBad = [];
MAPS.forEach(m=>{ if(m.reserved) return; const k = numOf(m); (m.nodes || []).forEach(nd=> Object.entries(nd.deck || {}).forEach(([id, c])=>{ const d = defs[id]; if(!d) return;
  if(!RR.roadRarityOk(d.rarity, k, nd.kind)) capBad.push(`${nd.key} fields ${id} (${d.rarity}) over the Map ${k} ${nd.kind} cap`);
  if(nd.kind !== 'raidboss' && c > MAXC(d.rarity)) capBad.push(`${nd.key}: ${c}x ${id} over its ${d.rarity} copy limit ${MAXC(d.rarity)}`); })); });
ok(!capBad.length, '3. rarity caps and copy limits: ' + capBad.slice(0, 6).join('; '));
// the plan's fights keep their size (a swap is copy for copy)
PLAN.fights.forEach(f=>{ const o = Object.values(f.out || {}).reduce((a, b)=> a + b, 0), i = Object.values(f.in || {}).reduce((a, b)=> a + b, 0); ok(o === i, `3. ${f.key}: the swap is copy for copy (${o} out, ${i} in)`); });

// ---- 4. the themes
const TH = require(path.join(ROOT, 'tools', 'thematic_pass_2026_10_19.js'));
// 2026-10-19 (BF4): Map 0's four decks are the owner's own (the live server's node edits of 10-18, folded in; the owner's choice wins),
// so their cards are the owner's theme for the Outskirts, not the TH pass's (docs/balance/server-overrides-fold-2026-10-19.md)
// 2026-10-21 (BF5): and the Hedgerow's and the Shallows' (Maps 1 and 2) node decks, the owner's live edits of 10-19 / 10-20, folded in
// (docs/balance/server-overrides/fold-plan-2026-10-21.json)
const OWNER_DECKS = new Set(['0-1', '0-2', '0-3', '0-4', '1-1', '1-2', '1-3', '1-4', '1-5', '2-1', '2-2', '2-3', '2-4', '2-5']);
const aud = TH.audit(), offs = aud.filter(f=> f.off.length && !OWNER_DECKS.has(f.key));
ok(aud.length > 200 && !offs.length, `4. no off-theme card in any of ${aud.length} fights: ` + offs.slice(0, 5).map(f=> f.key + ' ' + f.off.map(o=> o.id).join('/')).join('; '));
const mc = MAPS.find(m=> m.id === 'mc'), pel = mc.nodes.filter(x=> (x.deck || {})['pelican-diver']);
ok(pel.length <= 2 && pel.every(x=> x.deck['pelican-diver'] <= 2), `4. Gannet Cliffs: Pelican Divers in at most 2 fights, 2 copies each (${pel.map(x=> x.key)})`);
const bb = []; MAPS.forEach(m=> (m.nodes || []).forEach(x=>{ if((x.deck || {})['badger-berserker'] && !['m3', 'mlb', 'm22', 'mtut'].includes(m.id)) bb.push(x.key); }));
ok(!bb.length, '4. Badger Berserkers only on the badger maps (Ashen Spurn, the Long Burrow and its parent the Rimefire Caldera; the Tutorial\'s mixed come-back fights): ' + bb);
ok(Object.keys(TH.THEMES).length >= 40 && mains.every(m=> TH.THEMES[m.id] && TH.THEMES[m.id].name), '4. every main map has a theme');

// ---- 5. the new fields: a few fights each, on their maps
const FIELDS = {sporeCloud: 'mu', tangledRoots: 'mk', thunderstorm: 'm7', ashRain: 'm3', ashy: 'm3'};
Object.entries(FIELDS).forEach(([k, mid])=>{ const m = MAPS.find(x=> x.id === mid), on = m.nodes.filter(x=> x.rules && x.rules[k]);
  ok(on.length >= 1 && on.length <= Math.ceil(m.nodes.filter(x=> x.deck).length / 2), `5. ${k} on ${on.length} of ${m.name}'s fights (${on.map(x=> x.key)})`); });
ok(MAPS.find(x=> x.id === 'm3').nodes.some(x=> x.rules && x.rules.ashy && /boss/.test(x.kind)), '5. Ashy on the Ashen Spurn boss');
const NEW = ['sporeCloud', 'tangledRoots', 'thunderstorm'];
ok(MAPS.every(m=> m.id === 'mu' || m.id === 'mk' || m.id === 'm7' || m.nodes.every(x=> !x.rules || !NEW.some(k=> x.rules[k]))), '5. the GI fields only on their own maps');

// ---- 6. the road curve
// 2026-10-19 (package CB): the card pass changed card stats, rebuilt the reference decks and retuned the curve after TH, so the latest
// road-curve measure is the card pass's (TH's own final is docs/balance/skirmish-pass-th-after.jsonl)
// 2026-10-19 (package LV): the level curve rebuilt the reference decks and retuned every fight after CB, so the latest is LV's
// 2026-10-19 (package BF3): the card retune and the honest-lever road retune rebuilt the decks again, so the latest is BF3's; a fight off its
// band is a listed gap (docs/balance/road-gaps-2026-10-19.json, owner 16:22: "LEAVE it and list the gap")
const rows = read('docs/balance/skirmish-pass-bf-after.jsonl').split('\n').filter(Boolean).map(l=> JSON.parse(l));
const GAPS = new Set(JSON.parse(read('docs/balance/road-gaps-2026-10-19.json')).gaps.list.map(g=> g.map + ':' + g.code));
const mainFights = []; mains.forEach(m=>{ if(m.id === 'mtut') return; m.nodes.forEach(x=>{ if(x.deck && Object.keys(x.deck).length && x.kind !== 'tutorial' && !/raidboss/.test(x.kind || '')) mainFights.push([m.id, x]); }); });
ok(mainFights.length >= 179, `6. the main maps' fights (${mainFights.length})`);
const miss = [], off = [], stale = [];
mainFights.forEach(([mid, x])=>{ const r = rows.find(y=> y.map === mid && y.key === x.key); if(!r){ miss.push(x.key); return; }
  if(r.green !== 'green' && !GAPS.has(mid + ':' + r.code)) off.push(`${x.key} ${r.win}% (${r.lo}–${r.hi})`);
  if(r.deck && JSON.stringify(r.deck) !== JSON.stringify(x.deck)) stale.push(x.key);
  if(r.role === 'boss') ok(r.lo === 30 && r.hi === 49, `6. ${x.key}: the boss band is 30–49%`); });
ok(!miss.length, '6. every main fight measured: ' + miss.slice(0, 8));
ok(!off.length, '6. every main fight on its green band or a listed honest gap (120 games, the measure seeds): ' + off.slice(0, 8).join('; '));
ok(!stale.length, '6. the measure played the decks the game has now: ' + stale.slice(0, 8));
ok(rows.every(r=> r.games === 120), '6. 120 games a fight');

// ---- 7. the docs
const md = read('docs/thematic-pass-2026-10-19.md');
ok(fs.existsSync(path.join(ROOT, 'docs', 'thematic-pass-2026-10-19.xlsx')), '7. the spreadsheet');
ok(REC.every(p=> md.includes(p.name)) && left.every(id=> md.includes(defs[id].name)), '7. the doc lists every placed card and the ones left in the pool');
ok(/^# /.test(md) && md.includes('Badger Berserker') && md.includes('Pelican Diver'), '7. the doc names the drift it fixed');
// 2026-10-19 (LV): later packages' entries sit above it; 2026-10-21 (package TT): so many now that a fixed window misses it: its own dated heading
ok(/^## 2026-10-19 \(package TH: the thematic pass\)$/m.test(read('docs/CHANGELOG.md')), '7. a CHANGELOG entry (its dated heading)');

console.log(fail ? `thematic-2026-10-19: ${fail} of ${n} failed` : `thematic-2026-10-19: all ${n} checks passed`);
process.exit(fail ? 1 : 0);
