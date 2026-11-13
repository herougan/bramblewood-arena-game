#!/usr/bin/env node
// Package SKIR1 (2026-11-11, owner 00:16: "update ALL the skirmishes! ... No stone until Map 21+. Focus on lumber. Good mix of lumber cards, no
// lumber cards, wait/nowait cards, lumber generators and normal animals ... try not to use a card too much"): every road fight of Maps 0-20 and
// their side maps rebuilt from its map's new list (tools/skir1/build_2026_11_11.js, then fit_2026_11_11.js). No games are played.
//   1. the lists: Maps 0-11 = the owner's Yes + UI47_ADMIN_ADD (+ SKIR1's extras), Map 12 = his 3 + UI47_SUGGEST, Maps 13-20 and the THEME8 side
//      maps = UI47_SUGGEST; no list a player meets before Map 21 holds a card that costs or makes Stone.
//   2. every fight: in the build plan; its deck size kept; every card from the fight's pool (its map's list + SPECIAL, its own first-clear
//      cards and leaders; within the road's rarity cap; not another fight's reward); copy caps, K14, 5-6 different cards (5-8 elite / boss);
//      no Stone card before Map 21; its leaders, showcase and first-clear cards kept (an Auto showcase leader that cost Stone excepted).
//   3. every map: its decks together show each mix kind (lumber-cost, no-lumber, Wait, no-Wait, Lumber makers, plain animals, a status card) up
//      to THEME8's minimum or all its fights' pools hold; a card in at most max(2, half the map's fights) (kept cards aside); two cards of a
//      family the list holds only two of never share a fight.
//   4. the record files exist; decisions SKIR1-n under 100 words.
//   node tests/skir1-2026-11-11.js
'use strict';
const fs = require('fs'), path = require('path');
const ROOT = path.join(__dirname, '..');
const J = f => JSON.parse(fs.readFileSync(path.join(ROOT, f), 'utf8'));
const L = require(path.join(ROOT, 'tools', 'skir1', 'lib_fight_2026_11_11.js')), G = L.G, D = L.D, M = L.M;
let fail = 0, pass = 0; const ok = (c, m) => { if (c) pass++; else { fail++; console.log('  ✗ ' + m); } };
const src = fs.readFileSync(path.join(ROOT, 'arena_app.js'), 'utf8'), grab = n => JSON.parse((src.match(new RegExp('const ' + n + ' = (\\{.*?\\});\\n')) || [0, '{}'])[1]);
const pools = J('canonical/map-pools.json').maps, SUG = J('docs/design/map-suggestions-2026-11-11.json'), PICKS = J('docs/design/map-picks-owner-2026-11-11.json').maps;
const EXTRA = require(path.join(ROOT, 'tools', 'skir1', 'extra_2026_11_11.js')), UI47_SUGGEST = grab('UI47_SUGGEST'), UI47_ADMIN_ADD = grab('UI47_ADMIN_ADD');
const same = (x, y) => JSON.stringify([...new Set(x)].sort()) === JSON.stringify([...new Set(y)].sort());

// ---- 1. the lists ----
// 2026-11-12 (SKIR3): the lists are now the owner's 11-12 picks under the NEW! / Carried limits (tools/skir3/lists_2026_11_12.js): each MAP tier and
// side list is the SKIR3 record's; SKIR1's 11-11 fold below no longer applies
const S3 = J('docs/balance/skir3/lists-2026-11-12.json'), L1main = J('docs/balance/list1/fold-2026-11-13.json').main; // 2026-11-13 (SIDE2): LIST1's main maps are tests/list1's
Object.entries(S3.main).filter(([id]) => !L1main[id]).forEach(([id, r]) => ok(same(pools[id].cards, r.list), `Map ${r.mapNo} (${id}): the MAP tier is SKIR3's (the owner's 11-12 picks under the limits)`));
// 2026-11-13 (SIDE2): LIST1 (2026-11-13) folded the owner's 11-13 picks into the lists (docs/balance/list1/fold-2026-11-13.json): a main map it
// records is checked by tests/list1-2026-11-13.js (MAP tier = his Yes + admin adds), a side list here against LIST1's record (his Yes + the kept
// Carried cards); SKIR3's record stays the expectation for a map LIST1 does not record
const L1 = J('docs/balance/list1/fold-2026-11-13.json'), sameSet = (a, b) => JSON.stringify([...new Set(a)].sort()) === JSON.stringify([...new Set(b)].sort());
Object.entries(S3.side).forEach(([sid, r]) => { const l1 = L1.side[sid], want = l1 ? l1.ownerYes.concat(l1.keptCarried) : r.list;
  ok(sameSet(((pools[r.parent] || {}).submaps || {})[sid] || [], want), `${sid}: its list is ${l1 ? 'LIST1' : 'SKIR3'}'s`); });
if (!S3) for (const [id, m] of Object.entries(SUG.maps)) {
  const yes = (PICKS[id] || {}).yes || [], want = (m.mapNo <= 11 ? yes.concat(UI47_ADMIN_ADD[id] || []) : m.mapNo === 12 ? yes.concat(UI47_SUGGEST[id] || []) : UI47_SUGGEST[id] || [])
    .concat(Object.keys((EXTRA.main || {})[id] || {}), Object.keys((EXTRA.batch || {})[id] || {})).filter(x => D[x] && !((EXTRA.drop || {})[id] || {})[x]);
  ok(same(pools[id].cards, want), `Map ${m.mapNo} (${id}): the MAP tier is ${m.mapNo <= 11 ? 'the owner\'s Yes + admin adds' : m.mapNo === 12 ? 'his 3 + the suggestions' : 'the suggestions'}`);
}
if (!S3) for (const [sid, sm] of Object.entries(SUG.submaps)) ok(same(((pools[sm.parent] || {}).submaps || {})[sid] || [], (UI47_SUGGEST[sid] || []).concat(Object.keys((EXTRA.sub || {})[sid] || {})).filter(x => D[x] && !((EXTRA.drop || {})[sid] || {})[x])), `${sm.name} (${sid}): its list is its suggestions`);
const unlockAt = {}; L.maps().forEach(m => { unlockAt[m.id] = L.unlockOf(m); });
Object.entries(pools).forEach(([id, e]) => { const no = G.mapNumberOf(id); if (no == null || no > 20) return;
  const stone = (e.cards || []).filter(x => M.stone(D[x])); ok(!stone.length, `Map ${no} (${id}): no Stone card on its list (${stone.join(', ')})`);
  Object.entries(e.submaps || {}).forEach(([sid, l]) => { if (unlockAt[sid] == null || unlockAt[sid] >= 21) return; const st = (Array.isArray(l) ? l : l.cards || []).filter(x => M.stone(D[x])); ok(!st.length, `${sid} (opens on Map ${unlockAt[sid]}): no Stone card on its list (${st.join(', ')})`); }); });

// ---- 2. every fight ----
// 2026-11-13 (SIDE2): fights the thin side lists (LIST1's fold of the owner's 11-13 picks) cannot fill by the deck rules, held for the owner's
// call (decision SIDE2-2): K14 leaves too few copies for the deck size (0-B-3: 11 own copies + 3 carried for 16; 2-A-6: 12 + 4 for 17;
// 14-A-5: 14 + 3 for 20). They keep their decks until he decides; nothing else is excused
const SIDE2_OPEN = { '0-B-3': 'SIDE2-2', '2-A-6': 'SIDE2-2', '14-A-5': 'SIDE2-2' };
const SIDE2_DEC = new Set((J('docs/decisions.json').items || []).filter(x => x.status === 'YET').map(x => x.id));
Object.entries(SIDE2_OPEN).forEach(([code, id]) => ok(SIDE2_DEC.has(id), `${code}: held for open decision ${id}`));
const PLAN = J('docs/balance/skir1/build-plan-2026-11-11.json'), planBy = {}; PLAN.maps.forEach(p => p.fights.forEach(x => { planBy[x.code] = x; }));
const lineOf = code => (src.match(new RegExp(`^\\s*\\{ ?key:\\s*"${code.replace(/-/g, '\\-')}",.*$`, 'm')) || [''])[0];
const byMap = {};
for (const m of L.maps()) for (const n of L.fightsOf(m)) {
  const code = n.key, p = planBy[code], f = L.fight(m, n), d = n.deck, ids = Object.keys(d); (byMap[m.id] = byMap[m.id] || []).push({ f, n });
  ok(p, code + ': in the SKIR1 build plan'); if (!p) continue;
  // 2026-11-13 (SIDE2): a side-map fight re-carded on the LIST1 side lists carries a SIDE2 comment (re-card, SK anchor or SIDE2 fit) instead
  ok(/\((SKIR1( fit)?\)|SIDE2[ )])/.test(lineOf(code)) || L.keyOf(p.old) === L.keyOf(d) || SIDE2_OPEN[code], code + ': rebuilt by SKIR1 or re-carded by SIDE2 (dated comment)');
  ok(L.size(d) === p.size, `${code}: deck size kept (${p.size})`);
  ids.forEach(id => ok(f.pool.includes(id) || SIDE2_OPEN[code], `${code}: ${id} is from the fight's pool (its map's list, its own first-clear cards or leaders, in the rarity cap)`));
  ok(ids.length >= f.dMin && ids.length <= f.dMax, `${code}: ${ids.length} different cards (${f.dMin}-${f.dMax})`);
  ids.forEach(id => ok(d[id] <= f.cap(id), `${code}: ${id} x${d[id]} within its cap ${f.cap(id)}`));
  ok(!f.k14(d).length || SIDE2_OPEN[code], `${code}: K14 (${f.k14(d).join('; ')})`);
  if (f.unlock < 21) ids.forEach(id => ok(!M.stone(D[id]), `${code}: no Stone card before Map 21 (${id})`));
  G.NODE_MAP_HINT.set(n, m.id); const now = G.skirmishLeadersOf(n, m.id) || [];
  ok(p.stoneLeader || p.leaders0.some(f.cutOut) || p.leaders0.some(id => !f.pool.includes(id)) /* 2026-11-12 (SKIR3): a SKIR1 leader off the fight's 11-12 pool (back in play elsewhere) cannot lead here */ || JSON.stringify(now) === JSON.stringify(p.leaders0), `${code}: its leaders are kept (${p.leaders0} -> ${now})`);
  if (/boss/.test(n.kind || '')) ok(p.stoneLeader || p.leaders0.some(f.cutOut) || JSON.stringify(now) === JSON.stringify(p.leaders0), `${code}: a boss keeps its leader (a Stone leader left before Map 21)`);
  ok((n.showcase || null) === p.showcase || (!p.showcase && !p.explicitLeaders && p.leaders0.length === 1 && n.showcase === p.leaders0[0] && /Auto showcase leader, pinned/.test(lineOf(code))), `${code}: its showcase is kept (${p.showcase}), or its Auto showcase leader pinned (${n.showcase})`);
  ((G.nodeFirstClearCardIds || G.nodeRewardCardIds)(m.id, code) || []).filter(id => p.old[id] && !(f.unlock < 21 && M.stone(D[id])) && !f.cutOut(id) /* 2026-11-11: a card on no list leaves (BAL9 JJ24) */).forEach(id => ok(d[id] > 0, `${code}: first-clear card ${id} kept in the deck`));
}
// ---- 3. every map ----
const MIN = { cost1: 4, cost0: 3, wait1: 4, wait0: 3, lumber: 2, plain: 2, status: 2 };
const UT = {}; J('canonical/unit-themes.json').units.forEach(u => { UT[u.id] = u; }); const AT = {}; J('canonical/animal-tags.json').cards.forEach(t => { AT[t.id] = t; });
const family = id => (UT[id] || {}).animalGroup || (AT[id] || {}).group || (D[id] || {}).animal || id;
Object.entries(L.slackMaps()).forEach(([id, why]) => ok(typeof why === 'string' && why.length > 20, `slack map ${id} says why (${why})`));
for (const [mid, fl] of Object.entries(byMap)) {
  const shown = new Set([].concat(...fl.map(x => Object.keys(x.n.deck)))), avail = [...new Set([].concat(...fl.map(x => x.f.pool)))];
  for (const k of Object.keys(MIN)) { const a = avail.filter(id => M.kinds(D[id])[k]).length, s = [...shown].filter(id => M.kinds(D[id])[k]).length;
    ok(s >= Math.min(MIN[k], a), `${mid}: its decks show ${s} ${k} card(s) (the pools hold ${a}; minimum ${MIN[k]})`); }
  // half the map's fights (2 at least), one more on a map docs/balance/skir1/slack-2026-11-11.json names with its reason; a fight that keeps the
  // card (its leader, showcase, first-clear card) does not count
  // 2026-11-12 (SKIR3): + the extra docs/balance/skir3/slack-2026-11-12.json names for a map, with its reason (a thin 11-12 list, or a refill / search)
  const S3SLACK = (() => { try { return J('docs/balance/skir3/slack-2026-11-12.json').maps || {}; } catch (e) { return {}; } })();
  const ucap = L.ucapOf(fl[0].f.m) + ((S3SLACK[mid] || {}).extra || 0), use = {};
  fl.forEach(x => Object.keys(x.n.deck).forEach(id => { if (!x.f.keep.has(id)) use[id] = (use[id] || 0) + 1; }));
  Object.entries(use).filter(([, k]) => k > ucap).forEach(([id, k]) => ok(false, `${mid}: ${id} in ${k} of ${fl.length} fights besides the ones that keep it (at most ${ucap})`));
  ok(true, `${mid}: no card in more than ${ucap} of its ${fl.length} fights`);
  const fam = {}; avail.forEach(id => { fam[family(id)] = (fam[family(id)] || 0) + 1; });
  fl.forEach(x => { const by = {}; Object.keys(x.n.deck).filter(id => fam[family(id)] === 2).forEach(id => { (by[family(id)] = by[family(id)] || []).push(id); });
    Object.values(by).filter(p => p.length > 1 && !p.every(id => x.f.keep.has(id))).forEach(p => ok(false, `${x.n.key}: two cards of a two-card family share the fight (${p.join(', ')})`)); });
}
// ---- 4. files and decisions ----
['docs/balance/skir1/lists-2026-11-11.json', 'docs/balance/skir1/build-plan-2026-11-11.json', 'docs/balance/skir1/pending-budget-2026-11-11.json'].forEach(f => ok(fs.existsSync(path.join(ROOT, f)), f + ' exists'));
const words = s => String(s || '').split(/\s+/).filter(Boolean).length;
(J('docs/decisions.json').items || []).filter(x => /^SKIR1-\d/.test(x.id || '')).forEach(x => ok(words(x.body) + words((x.options || []).join(' ')) < 100, x.id + ': body and options under 100 words'));
console.log(`skir1: ${pass} passed, ${fail} failed`); process.exit(fail ? 1 : 0);
