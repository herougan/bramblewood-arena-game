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
'use strict';
const fs = require('fs'), path = require('path');
const ROOT = path.join(__dirname, '..');
let fail = 0, n = 0; const ok = (c, m)=>{ n++; if(!c){ fail++; console.log('  ✗', m); } };
const read = rel=> fs.readFileSync(path.join(ROOT, rel), 'utf8'), readJSON = rel=> JSON.parse(read(rel));
const cards = readJSON('canonical/cards.json'), defs = Object.fromEntries(cards.map(c=> [c.id, c]));
const P = require(path.join(ROOT, 'tools', 'card_pass_2026_10_19.js'));
const PLAN = readJSON('docs/balance/card-pass-plan.json');
const live = cards.filter(c=> !c.token && !c.test && !c.hallOfFame && !c.baseId && !c.field && !c.pool);

// ---- 1. budget v3
const OVER_OK = new Set(['red-dragon', 'white-dragon', 'blue-dragon', 'green-dragon', 'black-dragon', 'caldera-wyrm']);
// 2026-10-19 (package TC): the owner applied the measured skill worth (canonical/skill-costs.json, appliedAt / prevValue); the cards it
// puts over budget are queued for the post-balance step (docs/balance/post-balance-queue.json, owner 08:49: no refit now).
const QUEUE = new Set(readJSON('docs/balance/post-balance-queue.json').cards.map(c=> c.id));
const over = live.filter(c=> !OVER_OK.has(c.id) && !QUEUE.has(c.id) && !P.SC.budget(c).ok).map(c=> `${c.id} ${c.attack}/${c.health}`);
ok(!over.length, '1. budget v3 passes for every live card but the Dragons / Caldera Wyrm and the post-balance queue: ' + over.slice(0, 8).join('; '));
// the pass's own fits still hold under the costs it was made with (every applied entry back at its prevValue), or the card is queued
const SCT = JSON.parse(read('canonical/skill-costs.json')); ['skills', 'triggers', 'actions', 'modifiers'].forEach(k=> (SCT[k] || []).forEach(e=>{ if(e.appliedAt) e.value = e.prevValue; }));
const PREV = require(path.join(ROOT, 'tools', 'skill_costs.js')).make(SCT);
['raven-harbinger', 'bone-diviner', 'magnate-duck'].forEach(id=> ok(PREV.budget(defs[id]).ok && (P.SC.budget(defs[id]).ok || QUEUE.has(id)), `1. ${id} (newly over on 10-19) fits under prevValue, and fits now or is queued`));
// 2026-10-19 (BF2): the pass was made under budget v3's N; v5's is a little lower at Level 1 for some cards (Colony, Great Gate are queued)
const fitsPrev = live.filter(c=> !OVER_OK.has(c.id) && !PREV.budget(c, {N: PREV.budgetV3N(c)}).ok).map(c=> c.id);
ok(!fitsPrev.length, '1. under the pre-application costs every live card but the owner-call list fits (the pass as made): ' + fitsPrev.slice(0, 8).join(', '));

// ---- 2. the bands
const ST = Object.entries(PLAN.stats || {});
ok(ST.length >= 20, `2. the pass changed cards' stats (${ST.length})`);
ST.forEach(([id, x])=>{ const c = defs[id], [lo, hi] = P.bandOf((PLAN.rarity && PLAN.rarity[id] && PLAN.rarity[id].to) || c.rarity).map(v=> v * 100);
  ok(c && c.attack === x.attack && c.health === x.health && (x.cost == null || c.cost === x.cost), `2. ${id}: carries its recorded stats ${x.attack}/${x.health}`);
  if(x.fit) return; // a budget fit (no win-rate aim)
  const inBand = x.wrAfter >= lo && x.wrAfter <= hi, nearer = Math.abs(P.outside(x.wrAfter / 100, c.rarity)) <= Math.abs(P.outside(x.wrBefore / 100, c.rarity)) - 5;
  ok(inBand || (x.nearest && nearer), `2. ${id}: ${x.wrBefore}% -> ${x.wrAfter}% (band ${lo}-${hi})`); });
// deterministic re-measure of three changed cards (400 games each, the record's own number)
// 2026-10-19 (BF follow-up): within 3 points, not to the game. The record was made on the 10-19 morning engine; package BU's centre-column
// rule (slot 0 always legal when empty, the CPU fills it first) moves every simulated game a little (39.5 -> 39.3, 60 -> 59.3, 70.5 ->
// 68.5). 3 points is about 1.2 standard errors at 400 games: a real stat or record mix-up still shows, an engine rule's nudge doesn't.
ST.filter(([, x])=> !x.fit).slice(0, 3).forEach(([id, x])=>{ const wr = Math.round(P.winRate(id, null, 400) * 1000) / 10; ok(Math.abs(wr - x.wrAfter) <= 3, `2. ${id} re-measures ${wr}% (recorded ${x.wrAfter}%, within 3 points)`); });
Object.entries(PLAN.rarity || {}).forEach(([id, x])=> ok(defs[id] && defs[id].rarity === x.to, `2. ${id}: rarity ${x.to}`));

// ---- 3. sources
const B = require(path.join(ROOT, 'tools', 'lib_bramble.js')), G = B.G, MAPS = B.MAPS;
const obtainable = c=>{ const s = G.cardSourceOf(c); if(['pack', 'base', 'raid', 'nest', 'smith', 'secret', 'quest'].includes(s.kind)) return true;
  if(s.kind !== 'map' || !s.node) return false; const m = MAPS.find(x=> x.id === s.id); return !!(m && (m.nodes || []).some(x=> x.key === s.node)); };
const none = live.filter(c=> c.cardType !== 'materia' && !c.easterEgg && !obtainable(c) && !P.SOURCELESS[c.id]).map(c=> c.id);   // 2026-10-19 (EE): Easter eggs are ungettable on purpose
ok(!none.length, '3. every live card has a source or is on the allowed sourceless list: ' + none.slice(0, 10).join(', '));
Object.keys(P.SOURCELESS).forEach(id=> ok(defs[id] && !obtainable(defs[id]) && P.SOURCELESS[id].length > 10, `3. ${id} stays sourceless, with its reason`));
(PLAN.sources || []).forEach(s=> ok(defs[s.id] && JSON.stringify(defs[s.id].source) === JSON.stringify(s.source) && /package CB/.test(defs[s.id].creatorNote || ''), `3. ${s.id}: sourced as planned (${s.where})`));
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
live.forEach(c=>{ const s = c.source; if(!s || s.kind !== 'map' || !s.node || isLeader(c)) return; const m = RAWMAPS.find(x=> x.id === s.id), node = m && m.nodes.find(x=> x.key === s.node);
  if(node && !G.roadRarityOk(c.rarity, numOf(m), node.kind)) capBad.push(`${c.id} (${c.rarity}) reward of ${s.node}`); });
RAWMAPS.forEach(m=>{ if(m.reserved) return; (m.nodes || []).forEach(x=> Object.keys(x.deck || {}).forEach(id=>{ const d = defs[id]; if(d && !G.roadRarityOk(d.rarity, numOf(m), x.kind)) capBad.push(`${x.key} fields ${id} (${d.rarity})`); })); });
ok(!capBad.length, '4. rewards and fights inside the road\'s rarity caps: ' + capBad.slice(0, 8).join('; '));

// ---- 5. the docs
const md = read('docs/card-pass-2026-10-19.md');
ok(fs.existsSync(path.join(ROOT, 'docs', 'card-pass-2026-10-19.xlsx')), '5. the spreadsheet');
ok(ST.every(([id])=> md.includes(defs[id].name)), '5. the doc lists every changed card');
ok(Object.keys(P.SOURCELESS).every(id=> md.includes(defs[id].name)), '5. the doc lists the cards that stay sourceless');
ok(read('docs/CHANGELOG.md').slice(0, 60000).includes('package CB'), '5. a CHANGELOG entry near the top'); // 2026-10-19 (LV): later packages' entries sit above it (BF: 60,000 characters)

console.log(fail ? `card-pass-2026-10-19: ${fail} of ${n} failed` : `card-pass-2026-10-19: all ${n} passed`);
process.exit(fail ? 1 : 0);
