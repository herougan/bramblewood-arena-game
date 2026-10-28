#!/usr/bin/env node
// 2026-10-19 (package CB, the card pass; owner 00:19: "balance the cards themselves (L1) + balance rarity, choose where the cards come
// from"). docs/card-pass-2026-10-19.md. Checks, against the real data:
//   1. budget v3 (tools/skill_costs.js, the owner's current values) passes for every live card but the owner-call list (the five Dragons
//      and the Caldera Wyrm, over on purpose by the creature-ranks rule) and the post-balance queue (2026-10-19, package TC: cards the
//      applied measured skill worth puts over, refit in the post-balance step); under the pre-application costs (prevValue) all fit;
//   2. the bands: every card the pass changed is in its rarity band at its recorded 400-game win rate (or, where no step landed it,
//      at least 5 points nearer), its card carries the recorded stats, and three of them re-measure within 3 points of the number (the
//      yardstick is deterministic: card_balance.js's seeds);
//   3. sources: every live card can be had (a reward of a real fight, a pack, Base, a raid, the Nest, the Blacksmith, a secret, a quest)
//      or is on the allowed sourceless list with its reason; the cards the pass sourced carry the planned source; no fight gives more
//      than 3 cards after the pass (2 fights had 4 before);
//   4. rarity caps: every card reward (leaders aside, as the road-rarity test does) and every card a fight fields is inside the road's
//      cap, rarity moves included;
//   5. the docs: docs/card-pass-2026-10-19.md and its .xlsx, and a CHANGELOG entry.
// 2026-10-24 (package BAL2, T21-4: "fix stale tests card-pass-2026-10-19 (pins v3 budget) ... so they test today's rules"): checks 1, 3 and 4
// pinned the 10-19 state (budget v3 under the pre-application costs, the pass's planned sources, the road caps by parent map). Later packages
// moved all three on purpose (BF5-BF11 re-fits, DV / RW5 sources, side maps counting from the map that unlocks them), so they now check the
// rule of today: 1. today's budget (tools/skill_costs.js, canonical/skill-costs.json) at Level 1 and the start level, but for the owner-call
// list and the cards held on record (docs/balance/human-pass-1-flagged-2026-10-21.json, the post-balance queue); 3. every live card has a
// source (the plan's own sources are history: they only need to still be obtainable or awaiting the owner's placement); 4. the road caps as
// the game reads them (a side map at the main map that unlocks it, its own reveal; the Tutorial's lesson fights are not road fights).
'use strict';
const fs = require('fs'), path = require('path');
const ROOT = path.join(__dirname, '..');
let fail = 0, n = 0; const ok = (c, m)=>{ n++; if(!c){ fail++; console.log('  ✗', m); } };
const read = rel=> fs.readFileSync(path.join(ROOT, rel), 'utf8'), readJSON = rel=> JSON.parse(read(rel));
const cards = readJSON('canonical/cards.json'), defs = Object.fromEntries(cards.map(c=> [c.id, c]));
const P = require(path.join(ROOT, 'tools', 'card_pass_2026_10_19.js'));
const PLAN = readJSON('docs/balance/card-pass-plan.json');
const live = cards.filter(c=> !c.token && !c.test && !c.hallOfFame && !c.baseId && !c.field && !c.pool);
// 2026-10-21 (package RP, the rewards and sources pass): it moved some of these cards on (docs/balance/rewards-pass-2026-10-21.json:
// one unique reward a side map, plain rewards on Maps 0-1, the Devilry / Ecclesia gates, Otters and Hummingbirds to the faction
// rewards). A card it moved is checked against its new source there.
const RP_MOVES = (()=>{ try{ return Object.fromEntries(JSON.parse(fs.readFileSync(path.join(ROOT, 'docs', 'balance', 'rewards-pass-2026-10-21.json'), 'utf8')).moves.map(m=> [m.id, m])); }catch(e){ return {}; } })();
// 2026-10-23 (package RW5, owner item 15): a basic-pack source's tier (1-4) and map are now set by the map where the card is first found
// (tools/rw5_pack_tiers_2026_10_23.js); a planned basic-pack source still counts as kept when only those two changed.
const rw5Pack = src=>{ if(!src || src.kind !== 'pack' || !((+src.tier || 1) >= 1 && (+src.tier || 1) <= 4)) return src; return {kind: 'pack', tier: 1}; };
const rpMoved = c=>{ const m = c && RP_MOVES[c.id]; if(!m) return false; if(m.to === 'awaitingSource') return !c.source && c.awaitingSource === true; if(m.to === 'base') return !c.source; return JSON.stringify(c.source) === JSON.stringify(m.to) || JSON.stringify(rw5Pack(c.source)) === JSON.stringify(rw5Pack(m.to)); };

// ---- 1. budget v3
const OVER_OK = new Set(['red-dragon', 'white-dragon', 'blue-dragon', 'green-dragon', 'black-dragon', 'caldera-wyrm']);
// 2026-10-19 (package TC): the owner applied the measured skill worth (canonical/skill-costs.json, appliedAt / prevValue); the cards it
// puts over budget are queued for the post-balance step (docs/balance/post-balance-queue.json, owner 08:49: no refit now).
const QUEUE = new Set(readJSON('docs/balance/post-balance-queue.json').cards.map(c=> c.id));
const HELD = new Set(readJSON('docs/balance/human-pass-1-flagged-2026-10-21.json')); // BAL2: the cards held at their stats on record (no legal line, or a cut held for the owner)
const SCN = require(path.join(ROOT, 'tools', 'skill_costs.js')).make(JSON.parse(read('canonical/skill-costs.json'))), lvOf = require(path.join(ROOT, 'tools', 'skill_costs.js')).levelOf;
const band = c=> c.attack != null && c.health != null && (c.attack || c.health) && !c.easterEgg && !['materia', 'spell', 'equipment'].includes(c.cardType) && !c.hatchInto && !c.worldBoss && !c.awaitingSource;
const over = live.filter(c=> band(c) && !OVER_OK.has(c.id) && !QUEUE.has(c.id) && !HELD.has(c.id) && !(SCN.budget(c, {level: 1}).ok && SCN.budget(c, {level: lvOf(c)}).ok)).map(c=> `${c.id} ${c.attack}/${c.health}`);
ok(!over.length, '1. today\'s budget passes for every live card but the owner-call list, the post-balance queue and the held list: ' + over.slice(0, 8).join('; '));
// the pass's own fits still hold under the costs it was made with (every applied entry back at its prevValue), or the card is queued
const SCT = JSON.parse(read('canonical/skill-costs.json')); ['skills', 'triggers', 'actions', 'modifiers'].forEach(k=> (SCT[k] || []).forEach(e=>{ if(e.appliedAt) e.value = e.prevValue; }));
const PREV = require(path.join(ROOT, 'tools', 'skill_costs.js')).make(SCT);
// (BAL2: the 10-19 "newly over" trio and "every card fits under the pre-application costs" checks pinned budget v3 and the 10-19 skill costs; the
// cards have been re-fitted to every budget since, so check 1 above is today's version of both)
// 2026-10-19 (BF2): the pass was made under budget v3's N; v5's is a little lower at Level 1 for some cards (Colony, Great Gate are queued)
const RETUNED = c=> /2026-10-19 retune \(v5 L\/10\)/.test(c.creatorNote || ''); // BF3: the full card retune came after the pass
void PREV; void RETUNED;

// ---- 2. the bands
const ST = Object.entries(PLAN.stats || {});
ok(ST.length >= 20, `2. the pass changed cards' stats (${ST.length})`);
ST.forEach(([id, x])=>{ const c = defs[id], [lo, hi] = P.bandOf((PLAN.rarity && PLAN.rarity[id] && PLAN.rarity[id].to) || c.rarity).map(v=> v * 100);
  // 2026-10-19 (BF3): or the full card retune moved it from those stats, which its creatorNote records ("2026-10-19 retune (v5 L/10): was A/H")
  const retuned = c && new RegExp(`2026-10-19 retune \\(v5 L/10\\): was ${x.attack}/${x.health} `).test(c.creatorNote || '');
  // 2026-10-19 (BF4): or the live server's override of the card was folded in and retuned from the server's stats (the live game showed those,
  // not the pass's; docs/balance/server-overrides-fold-2026-10-19.md)
  const folded = c && /2026-10-19 retune \(server override folded\): was \d+\/\d+ /.test(c.creatorNote || '');
  // 2026-10-19 (BF5, owner 21:36: N halved): every card re-derived again, its note records the stats it came from ("2026-10-19 halve (BF5): was A/H")
  const halved = c && /2026-10-19 halve \(BF5\): was \d+\/\d+/.test(c.creatorNote || '');
  ok(c && ((c.attack === x.attack && c.health === x.health) || retuned || folded || halved) && (x.cost == null || c.cost === x.cost), `2. ${id}: carries its recorded stats ${x.attack}/${x.health} (or the 10-19 retune from them, the BF4 fold, or the BF5 halving)`);
  if(x.fit) return; // a budget fit (no win-rate aim)
  const inBand = x.wrAfter >= lo && x.wrAfter <= hi, nearer = Math.abs(P.outside(x.wrAfter / 100, c.rarity)) <= Math.abs(P.outside(x.wrBefore / 100, c.rarity)) - 5;
  ok(inBand || (x.nearest && nearer), `2. ${id}: ${x.wrBefore}% -> ${x.wrAfter}% (band ${lo}-${hi})`); });
// deterministic re-measure of three changed cards (400 games each, the record's own number)
// 2026-10-19 (BF follow-up): within 3 points, not to the game. The record was made on the 10-19 morning engine; package BU's centre-column
// rule (slot 0 always legal when empty, the CPU fills it first) moves every simulated game a little (39.5 -> 39.3, 60 -> 59.3, 70.5 ->
// 68.5). 3 points is about 1.2 standard errors at 400 games: a real stat or record mix-up still shows, an engine rule's nudge doesn't.
// 2026-10-19 (BF3): the full card retune moved the yardstick's filler cards too, so the records can't replay after it; skipped then
const fillerRetuned = P.FILLER.some(id=> RETUNED(defs[id] || {}));
if(!fillerRetuned) ST.filter(([, x])=> !x.fit).slice(0, 3).forEach(([id, x])=>{ const wr = Math.round(P.winRate(id, null, 400) * 1000) / 10; ok(Math.abs(wr - x.wrAfter) <= 3, `2. ${id} re-measures ${wr}% (recorded ${x.wrAfter}%, within 3 points)`); });
else console.log('  note: the 10-19 retune changed the yardstick\'s filler cards (' + P.FILLER.filter(id=> RETUNED(defs[id] || {})).join(', ') + '), so the card pass\'s records are not replayed');
Object.entries(PLAN.rarity || {}).forEach(([id, x])=> ok(defs[id] && defs[id].rarity === x.to, `2. ${id}: rarity ${x.to}`));

// ---- 3. sources
const B = require(path.join(ROOT, 'tools', 'lib_bramble.js')), G = B.G, MAPS = B.MAPS;
const obtainable = c=>{ const s = G.cardSourceOf(c); if(['pack', 'base', 'raid', 'nest', 'smith', 'secret', 'quest'].includes(s.kind)) return true;
  if(s.kind !== 'map' || !s.node) return false; const m = MAPS.find(x=> x.id === s.id); return !!(m && (m.nodes || []).some(x=> x.key === s.node)); };
const none = live.filter(c=> c.cardType !== 'materia' && !c.easterEgg && !c.awaitingSource && !obtainable(c) && !P.SOURCELESS[c.id]).map(c=> c.id);   // 2026-10-19 (EE): Easter eggs are ungettable on purpose; new cards flagged awaitingSource (SK2/EQ/SK3, owner places them later)
ok(!none.length, '3. every live card has a source or is on the allowed sourceless list: ' + none.slice(0, 10).join(', '));
// BAL2 (2026-10-24): a card the pass left sourceless either still is (with its reason) or has been given a source since (the Magnate Duck and the
// Snow Leopard by DV / RW5, the Caldera Wyrm by BAL2: the 20-B-4 leader paid on its clear)
Object.keys(P.SOURCELESS).forEach(id=> ok(defs[id] && (obtainable(defs[id]) || P.SOURCELESS[id].length > 10), `3. ${id} stays sourceless with its reason, or has a source now`));
const srcPlain = src=>{ if(!src || !src.challenge) return src; const o = Object.assign({}, src); delete o.challenge; return o; }; // 2026-10-22 (RW2): a challenge flag on the source is not a move
// BAL2: the plan's sources are history (DV, RW3, RW5 and EN4 moved many on purpose); a card the pass sourced must still be obtainable, or wait
// on the owner's placement, or have left the game as a pool card
void srcPlain; void rpMoved; (PLAN.sources || []).forEach(s=> ok(!defs[s.id] || defs[s.id].pool || defs[s.id].awaitingSource || obtainable(defs[s.id]) || P.SOURCELESS[s.id], `3. ${s.id}: sourced by the pass, still obtainable (${JSON.stringify(defs[s.id] && defs[s.id].source)})`));
const per = {}; live.forEach(c=>{ const s = c.source; if(s && s.kind === 'map' && s.node && c.cardType !== 'equipment') per[s.id + ':' + s.node] = (per[s.id + ':' + s.node] || 0) + 1; });
const crowd = Object.entries(per).filter(([k, v])=> v > 3 && (PLAN.sources || []).some(s=> s.source.kind === 'map' && s.source.id + ':' + s.source.node === k));
ok(!crowd.length, '3. no fight the pass gave a card to gives more than 3: ' + crowd.map(([k, v])=> k + ' ' + v).join(', '));

// ---- 4. rarity caps
// the fights as written in arena_app.js (the kinds tests/road-rarity-2026-10-16.js checks; the game's applyRoadKinds turns Map 0's last fight
// into a skirmish at load, which the road-rarity test doesn't model either)
const asrc = read('arena_app.js'), i0 = asrc.indexOf('const CONQUEST_MAPS = ['), j0 = asrc.indexOf('\n];', i0);
// eslint-disable-next-line no-eval
const RAWMAPS = eval(asrc.slice(i0 + 'const CONQUEST_MAPS = '.length, j0 + 2));
const mains = RAWMAPS.filter(m=> !m.sub && !m.reserved), numOf = m=> mains.indexOf(m.sub ? RAWMAPS.find(x=> x.id === m.parent) : m);
const isLeader = d=> (d.archetypes || []).includes('Leader') || !!(d.effects && d.effects.leader);
const capBad = [];
// BAL2 (2026-10-24): a side map counts at the main map that unlocks it (G.mapUnlockNumberOf, as cardObtainMap and the gates do) with its own
// reveal (the map id goes to roadRarityOk); the Tutorial map's lesson fights and the endless / tower maps are not road fights
const numAt = m=> m.sub ? G.mapUnlockNumberOf(m.id) : numOf(m), roadMap = m=> m && !m.reserved && m.id !== 'mtut' && !m.endless && !m.tower;
void numOf; live.forEach(c=>{ const s = c.source; if(!s || s.kind !== 'map' || !s.node || isLeader(c)) return; const m = RAWMAPS.find(x=> x.id === s.id), node = m && m.nodes.find(x=> x.key === s.node);
  if(node && roadMap(m) && !G.roadRarityOk(c.rarity, numAt(m), node.kind, m.id)) capBad.push(`${c.id} (${c.rarity}) reward of ${s.node}`); });
RAWMAPS.forEach(m=>{ if(!roadMap(m)) return; (m.nodes || []).forEach(x=> Object.keys(x.deck || {}).forEach(id=>{ const d = defs[id]; if(d && !(x.leaders || []).includes(id) && !G.roadRarityOk(d.rarity, numAt(m), x.kind, m.id)) capBad.push(`${x.key} fields ${id} (${d.rarity})`); })); });
ok(!capBad.length, '4. rewards and fights inside the road\'s rarity caps: ' + capBad.slice(0, 8).join('; '));

// ---- 5. the docs
const md = read('docs/card-pass-2026-10-19.md');
ok(fs.existsSync(path.join(ROOT, 'docs', 'card-pass-2026-10-19.xlsx')), '5. the spreadsheet');
ok(ST.every(([id])=> md.includes(defs[id].name)), '5. the doc lists every changed card');
ok(Object.keys(P.SOURCELESS).every(id=> md.includes(defs[id].name)), '5. the doc lists the cards that stay sourceless');
ok(read('docs/CHANGELOG.md').slice(0, 260000).includes('package CB'), '5. a CHANGELOG entry near the top'); // 2026-10-19 (LV): later packages' entries sit above it (BF2: 100,000 characters; 2026-10-21 (RP): 150,000; BF5 10-21: 250,000, the later packages pushed it down; BAL7 10-28: 260,000)

console.log(fail ? `card-pass-2026-10-19: ${fail} of ${n} failed` : `card-pass-2026-10-19: all ${n} passed`);
process.exit(fail ? 1 : 0);
