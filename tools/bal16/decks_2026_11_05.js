#!/usr/bin/env node
// 2026-11-05 (package BAL16; owner 11-04 23:37 "you can also start editting the skirmishes", decisions CUT3-1 a, LIST-1104, THEME6-1,
// IDEA-EARLY-5): the road / skirmish decks that hold a card no longer on their fight's list, rebuilt from that list.
//   node tools/bal16/decks_2026_11_05.js audit            every road fight deck (main and side maps, Maps 0-24+; K14's fight list plus Map 0) with a
//                                                         card off its fight's list -> printed
//   node tools/bal16/decks_2026_11_05.js plan             -> docs/balance/bal16/decks-plan-2026-11-05.json (before, after, why per fight)
//   node tools/bal16/decks_2026_11_05.js apply            the plan's decks (and new showcase leaders) into arena_app.js (rebuild the game after)
//   node tools/bal16/decks_2026_11_05.js check            exit 1 when a covered deck still holds an off-list card
//
// OFF-LIST: a deck card that is not in the fight's pool (tools/lib_map_pools.js fightPool: a main map's MAP + SPECIAL, a side map's SUBMAP +
// SPECIAL), is not a Base / starter card (every player's cards; BAL9's rule) or a token, and is not one of the fight's kept cards: its rewards
// and first-clear cards (nodeRewardCardIds, SKIRMISH_FIRST_PACK_CARDS). A leader is kept only while it is on the list: Glacial Ape-King, cut by
// CUT3, led 17-1, 17-3, 17-8 and 17-A-1; those get a new showcase leader from their list (LEADERS below, with the reason).
// THE REBUILD (the brief: "build from each fight's own map list, keep the deck's size, leader and reward / first-clear cards, copy and rarity
// caps, and the road curve target"): the deck's on-list cards stay; the off-list copies go one at a time to the best card of the list by
//   score = BAL9's distance to the card taken out (Lumber, Wait, 2A + H, other resources, rarity step: the fight's strength moves least)
//           - 1.5 x shared types with the deck's other cards (a tribe / family the deck already plays: synergy)
//           - 1.0 x the card's active skills (triggers 2 each, other non-passive keys 1, capped at 3; EFFECTS-1 "stronger effects > stats")
//           + 3 when the card is not unique to the map (K14 prefers map-unique cards)
// inside the fight's rarity cap, the card's copy cap, K14 (BAL7: a card not unique to the map at most 1 copy, 6 copies in all; a rebuild may
// not add a K14 violation), never another fight's reward, no Moonpull on Maps 0-10 (tests/road-rarity), and the fight's leader unchanged
// (the game's auto showcase must still pick it). The road curve target is then pulled by the BAL16 retune (tools/skirmish_pass.js curve).
// COMBOS (IDEA-EARLY-5, owner 11-04 22:34: "you can design skirmishes this way. No need for hints or playing it for rewards."): on the early
// maps a few skirmishes are built around a two-card combo of the map's list (COMBOS below): both cards at the copies given, the rest filled by
// the rule above. No hint, no reward.
'use strict';
const fs = require('fs'), path = require('path');
const L = require('../bal9/lib_bal9.js'), ROOT = L.ROOT;
const { G, D, LP, pools } = L.game();
const K = require(path.join(ROOT, 'tools', 'bal7_k14_decks_2026_10_28.js'));
const DATE = '2026-11-05', OUT = path.join(ROOT, 'docs', 'balance', 'bal16', `decks-plan-${DATE}.json`), APP = path.join(ROOT, 'arena_app.js');
const SRC = fs.readFileSync(APP, 'utf8'), FIRST = L.firstPackTable(SRC);
const step = r => G.roadRarityStep(r), capOf = id => G.maxCopiesForRarity((D[id] || {}).rarity);
const isBase = id => { const d = D[id]; return !!d && (G.cardSourceOf(d).kind === 'base' || d.rarity === 'starter'); };
const PASSIVE = new Set(['flying', 'tide', 'swimmer', 'diurnal', 'nocturnal', 'armor', 'swarm', 'leader', 'evasive']);
const effKeys = id => { const e = (D[id] || {}).effects || {}; return Object.keys(e).filter(k => e[k] !== false && e[k] != null && k !== 'triggers').concat((e.triggers || []).map(t => 'trig:' + (t.on || '?') + '/' + (t.do || '?'))); };
const activeScore = id => Math.min(3, effKeys(id).reduce((t, k) => t + (k.startsWith('trig:') ? 2 : PASSIVE.has(k) ? 0 : 1), 0));
const typesOf = id => [...((D[id] || {}).archetypes || []), ...((D[id] || {}).species || [])].filter(t => !['Structure', 'Leader'].includes(t));
const stat = id => { const d = D[id] || {}; return 2 * (+d.attack || 0) + (+d.health || 0); };
const dist = (a, b) => { const x = D[a] || {}, y = D[b] || {}; return 3 * Math.abs((+x.cost || 0) - (+y.cost || 0)) + Math.abs((+x.wait || 0) - (+y.wait || 0)) + Math.abs(stat(a) - stat(b)) / 3
  + 2 * Math.abs(((+x.stoneCost || 0) + (+x.metalCost || 0)) - ((+y.stoneCost || 0) + (+y.metalCost || 0))) + 4 * Math.abs(step(x.rarity) - step(y.rarity)) + (step(y.rarity) > step(x.rarity) ? 2 : 0); };
const total = d => Object.values(d).reduce((a, b) => a + b, 0);
// the maps whose fights play each card (K14's enemy-only rule reads it: a card on 2+ maps' decks is no map's own already)
const USED = {}; G.CONQUEST_MAPS.filter(x => !x.reserved && !x.tower).forEach(x => (x.nodes || []).forEach(n => Object.keys(n.deck || {}).forEach(id => (USED[id] = USED[id] || new Set()).add(x.sub ? x.parent : x.id))));

// the four Glacial Ape-King leaders (CUT3-1 a): a new showcase leader from the fight's own list, and why
const LEADERS = {
  '17-1': { id: 'beluga', why: 'Ice Fang Patrol: the tundra pack\'s own Rare with active skills (Sonar, Inspiring 1; EFFECTS-1)' },
  '17-3': { id: 'polar-bear', why: 'Snowshoe Line: the tundra\'s Very Rare ambusher (Ambush 4, Hibernate)' },
  '17-8': { id: 'walrus-icebreaker', why: 'the map\'s ender: its own reward card leads it (Freeze, Shatter 2); the fight keeps its name The Glacial Ape-King (owner call BAL16-2)' },
  '17-A-1': { id: 'greenland-shark', why: 'Frost Tunnel: the Ice Hollow\'s own Rare (Carrion 2, Armor 1)' },
};
// IDEA-EARLY-5: two-card combos of the map's own list on early skirmishes (key -> the combo and the copies of each)
const COMBOS = {
  '0-2': { cards: { 'ant-scout': 4, 'soldier-ant': 4 }, why: 'Ant Scout + Soldier Ant: two Swarm ants that grow with each other' },
  '2-1': { cards: { 'pincushion-urchin': 5, 'rock-pool-starfish': 4 }, why: 'Pincushion Urchin + Rock Pool Starfish: a Thorns wall that heals itself (Regen 2)' },
  '3-4': { cards: { 'gannet-nestweaver': 3, 'peak-condor': 3 }, why: 'Gannet Nestweaver + Peak Condor: the Nestweaver\'s Lumber on spawn pays for the 1-Lumber Condor early' },
  '4-1': { cards: { 'muskrat-lodgekeeper': 3, 'platypus-spur': 3 }, why: 'Muskrat Lodgekeeper + Platypus Spur: a Bulwark guard in front of a Venomous striker' },
};

function fights() {
  const out = K.fights(), have = new Set(out.map(f => f.map + '|' + f.key));
  // Map 0 (K14's exempt map) is covered here too: its decks held Fox Kit, Feral Tomcat and Cobalt Talon Fledgling off its list
  const m0 = G.CONQUEST_MAPS.find(m => m.id === 'm1');
  (m0.nodes || []).forEach(n => { if (n.deck && !have.has('m1|' + n.key) && !/^T-/.test(n.key)) out.push({ map: 'm1', mapNo: 0, side: false, key: n.key, kind: n.kind || 'skirmish', name: n.name, m: m0, n, k14exempt: true }); });
  return out;
}
const keptOf = f => { const k = new Set(); try { (G.nodeRewardCardIds(f.map, f.key) || []).forEach(x => k.add(x)); } catch (e) { } if (FIRST[f.key]) k.add(FIRST[f.key]); return k; };
const leaderOf = (f, deck) => { try { return (G.skirmishLeadersOf(Object.assign({}, f.n, { deck }), f.map) || [])[0] || null; } catch (e) { return null; } };
const poolOf = f => { const p = LP.fightPool(pools, f.map, f.m.sub ? f.m.parent : null); return p || new Set(); };
const otherReward = (f, id, kept) => { const s = (D[id] || {}).source; return !!(s && s.kind === 'map') && !kept.has(id); };
function offOf(f) {
  const p = poolOf(f), kept = keptOf(f), lead = leaderOf(f, f.n.deck);
  return Object.keys(f.n.deck).filter(id => D[id] && !D[id].token && !isBase(id) && !p.has(id) && !kept.has(id));
}

function rebuild(f) {
  const p = poolOf(f), kept = keptOf(f), cap = G.roadRarityCap(f.mapNo, f.kind, f.map) || 'mythic', U = K.uniqueOf(f.map);
  const before = Object.assign({}, f.n.deck), off = offOf(f), combo = COMBOS[f.key], newLead = LEADERS[f.key];
  if (!off.length && !combo) return null;
  const oldLead = leaderOf(f, before), deck = Object.assign({}, before), why = [];
  off.forEach(id => delete deck[id]);
  let k = total(before) - total(deck);
  // K14's excess (BAL9's k14Score: copies past 1 of a card not unique to the map + copies past 6 of those cards): a rebuild may not raise it
  // above the deck's own once its off-list copies are out
  const k14Score = d => { const L0 = new Set(oldLead ? [oldLead] : []); let tot = 0, ex = 0; Object.entries(d).forEach(([id, n]) => { if (U.has(id) || L0.has(id)) return; tot += n; ex += Math.max(0, n - 1); }); return ex + Math.max(0, tot - 6); };
  const v0 = f.k14exempt ? 0 : k14Score(deck), k14ok = d => f.k14exempt || k14Score(d) <= v0;
  const okCard = c => D[c] && !D[c].token && D[c].kind !== 'baby' && !/^egg-/.test(c) && step(D[c].rarity) <= step(cap) && !otherReward(f, c, kept) && !(f.mapNo <= 10 && (D[c].effects || {}).moonpull) && (p.has(c) || isBase(c))
    // a card with no source (Beaver Lumberjack ...) counts for K14 as one map's own while only that map's fights play it: never spread it to a new deck
    && (((D[c].source || {}).kind) || before[c] != null || (USED[c] && USED[c].size > 1));
  let showcase = null;
  if (newLead) { if (!p.has(newLead.id) || step(D[newLead.id].rarity) > step(cap)) throw new Error(f.key + ': leader ' + newLead.id + ' is not on the list inside the cap');
    const add = Math.min(capOf(newLead.id), k, Math.max(2, before['glacial-ape-king'] || 2) - (deck[newLead.id] || 0)); deck[newLead.id] = (deck[newLead.id] || 0) + Math.max(0, add); k -= Math.max(0, add);
    showcase = newLead.id; why.push(`new showcase leader ${newLead.id} (${newLead.why})`); }
  if (combo) { Object.entries(combo.cards).forEach(([c, n]) => { if (!p.has(c)) throw new Error(f.key + ': combo card ' + c + ' is off the list');
    // the combo's copies come out of the deck's other on-list cards first (most copies first), then out of the off-list copies
    while ((deck[c] || 0) < n) { if (k > 0) { k--; } else { const donor = Object.keys(deck).filter(x => !combo.cards[x] && !kept.has(x) && x !== oldLead && x !== showcase).sort((a, b) => deck[b] - deck[a])[0]; if (!donor) break; if (!--deck[donor]) delete deck[donor]; }
      deck[c] = (deck[c] || 0) + 1; } }); why.push('IDEA-EARLY-5 combo: ' + combo.why); }
  const removedFor = off.length ? off.slice().sort((a, b) => before[b] - before[a]) : [];
  const leadWant = showcase || (oldLead && !off.includes(oldLead) ? oldLead : null);
  const leadOk = d => { if (showcase) return true; if (!leadWant) return true; return leaderOf(f, d) === leadWant; };
  const syn = c => { const ts = new Set(typesOf(c)); let n = 0; Object.keys(deck).forEach(x => { if (x !== c && typesOf(x).some(t => ts.has(t))) n += 1; }); return Math.min(3, n); };
  // one entry per off-list copy still to place (the card it replaces), the off card with most copies first
  const queue = []; removedFor.forEach(id => { for (let i = 0; i < before[id]; i++) queue.push(id); }); while (queue.length > k) queue.shift();
  let ref = queue[0] || null, guard = 0;
  while (k > 0 && guard++ < 200) {
    ref = queue.shift() || ref;
    // the card being replaced: the off-list card with copies still unplaced (the one with most copies first)
    const cands = [...p].filter(okCard).filter(c => (deck[c] || 0) < capOf(c));
    const scored = cands.map(c => ({ c, s: (ref ? dist(ref, c) : 0) - 1.5 * syn(c) - 1.0 * activeScore(c) + (U.has(c) || f.k14exempt ? 0 : 3) - (deck[c] ? 0.5 : 0) })).sort((a, b) => a.s - b.s || (a.c < b.c ? -1 : 1));
    let placed = false;
    for (const { c } of scored) { deck[c] = (deck[c] || 0) + 1; if (k14ok(deck) && leadOk(deck)) { placed = true; k--; break; } if (!--deck[c]) delete deck[c]; }
    if (!placed) { // nothing new fits: the deck's own on-list cards up to their caps (BAL9's fallback)
      const own = Object.keys(deck).filter(c => p.has(c) && deck[c] < capOf(c)).sort((a, b) => deck[b] - deck[a]); let ok2 = false;
      for (const c of own) { deck[c]++; if (leadOk(deck)) { ok2 = true; k--; break; } deck[c]--; }
      if (!ok2) break; }
  }
  const after = Object.fromEntries(Object.keys(deck).filter(c => deck[c] > 0).sort().map(c => [c, deck[c]]));
  const newLeader = leaderOf(f, after), lead = showcase || newLeader;
  if (off.length) why.unshift(`off-list ${off.map(id => id + ' x' + before[id]).join(', ')} rebuilt from the fight's list`);
  return { map: f.map, mapNo: f.mapNo, side: f.side, key: f.key, name: f.name, kind: f.kind, cap, before, after, off, short: k, oldLeader: oldLead, leader: showcase ? showcase : newLeader,
    leaderChanged: (showcase || newLeader) !== oldLead, showcase, why: why.join('; '), k14: f.k14exempt ? null : K.violations(f, after) };
}

function plan() {
  const rows = []; for (const f of fights()) { const r = rebuild(f); if (r) rows.push(r); }
  const j = { _about: 'BAL16 (2026-11-05): road decks with off-list cards rebuilt from their fight\'s list; IDEA-EARLY-5 combos; tools/bal16/decks_2026_11_05.js', built: DATE, combos: COMBOS, leaders: LEADERS, rows };
  fs.mkdirSync(path.dirname(OUT), { recursive: true }); fs.writeFileSync(OUT, JSON.stringify(j, null, 1) + '\n'); return j;
}
// the deck literal of node `key` in arena_app.js (BAL9's replace, plus the showcase field when the leader changes)
function writeNode(s, r) {
  const re = new RegExp(`key:\\s*['"]${r.key.replace(/-/g, '\\-')}['"]`, 'g'); let m, hit = null;
  while ((m = re.exec(s))) { const i = s.indexOf('deck:{', m.index); if (i < 0 || i - m.index > 4000) continue; const j = s.indexOf('}', i); let lit; try { lit = JSON.parse(s.slice(i + 5, j + 1).replace(/'/g, '"')); } catch (e) { continue; }
    if (JSON.stringify(Object.keys(lit).sort().map(x => [x, lit[x]])) === JSON.stringify(Object.keys(r.before).sort().map(x => [x, r.before[x]]))) { hit = { i, j, at: m.index }; break; } }
  if (!hit) return null;
  const dbl = s.slice(hit.i, hit.j).includes('"'), body = JSON.stringify(r.after), lit = 'deck:' + (dbl ? body : body.replace(/"/g, "'"));
  const note = ` /* ${DATE} (BAL16): ${r.why.replace(/\*\//g, '')} */`;
  let out = s.slice(0, hit.i) + lit + note + s.slice(hit.j + 1);
  if (r.showcase) { const lineEnd = out.indexOf('\n', hit.at), line = out.slice(hit.at, lineEnd);
    const nl = /showcase:\s*(['"])[^'"]*\1/.test(line) ? line.replace(/showcase:\s*(['"])[^'"]*\1/, `showcase:"${r.showcase}"`) : line.replace(/deck:\{/, `showcase:"${r.showcase}", deck:{`);
    out = out.slice(0, hit.at) + nl + out.slice(lineEnd); }
  return out;
}
function apply() {
  const j = JSON.parse(fs.readFileSync(OUT, 'utf8')); let s = fs.readFileSync(APP, 'utf8'), n = 0; const miss = [];
  for (const r of j.rows) { const s2 = writeNode(s, r); if (s2 == null) { miss.push(r.key); continue; } s = s2; n++; }
  fs.writeFileSync(APP, s); console.log(`written: ${n} decks${miss.length ? '; not found: ' + miss.join(', ') : ''}`);
}
// SHAPE (2026-11-05, after the retune): the road deck rules the rebuild's one-copy fills broke (tests/bal3 5, tests/df3 3 / 4, tests/content2):
// a skirmish holds 5-7 different cards, every deck keeps the road's copy ladder (the leader's copies included) and a challenge deck keeps its
// selfish boon on. Over 7: the one-copy cards that are not kept (leader, rewards, first-clear, combo) leave, a card not unique to the map
// first, and their copies go to the deck's own map-unique cards with room (the boon's cards first). Under 5: the deck's biggest stack gives
// copies to the nearest list card it does not hold. Over the ladder: the excess goes to the deck's other cards with room.
const E = require(path.join(ROOT, 'bramblewood-engine.js'));
function shapeOne(f) {
  const before = Object.assign({}, f.n.deck), d = Object.assign({}, before), kept = keptOf(f), lead = leaderOf(f, before), combo = COMBOS[f.key] ? Object.keys(COMBOS[f.key].cards) : [];
  const keep = id => kept.has(id) || id === lead || combo.includes(id) || id === f.n.showcase;
  const U = K.uniqueOf(f.map), p = poolOf(f), cap = G.roadRarityCap(f.mapNo, f.kind, f.map) || 'mythic', boon = f.n.rules && f.n.rules.boon;
  const ladder = id => { try { return G.roadCopyCap ? G.roadCopyCap(D[id].rarity, f.mapNo) : capOf(id); } catch (e) { return capOf(id); } };
  const room = id => Math.min(capOf(id), ladder(id)) - (d[id] || 0);
  const boonOk = x => !boon || !E.selfishBoonCount || (E.selfishBoonCount(D, x, boon) || { on: true }).on;
  const theme = id => boon && E.selfishBoonThemeOf ? !!E.selfishBoonThemeOf(D[id], E.SELFISH_BOONS[boon]) : false;
  // K14: copies go only to the map's own cards (or the leader) unless the map is K14-exempt
  const give = (k, avoid) => { const order = Object.keys(d).filter(id => id !== avoid && room(id) > 0 && (f.k14exempt || U.has(id) || id === lead)).sort((a, b) => (theme(b) - theme(a)) || ((U.has(b) ? 1 : 0) - (U.has(a) ? 1 : 0)) || (d[b] - d[a]) || (a < b ? -1 : 1));
    for (const id of order) { while (k > 0 && room(id) > 0) { d[id]++; k--; } if (!k) break; } return k; };
  const why = [];
  // the copy ladder
  Object.keys(d).forEach(id => { const over = d[id] - Math.min(capOf(id), ladder(id)); if (over > 0) { d[id] -= over; const left = give(over, id); d[id] += left; why.push(`${id} x${before[id]} -> x${d[id]} (the copy ladder)`); } });
  if ((f.kind || 'skirmish') === 'skirmish') {
    let guard = 0;
    while (Object.keys(d).length > 7 && guard++ < 20) {
      const out = Object.keys(d).filter(id => d[id] === 1 && !keep(id)).sort((a, b) => ((U.has(a) ? 1 : 0) - (U.has(b) ? 1 : 0)) || (theme(a) - theme(b)) || (a < b ? -1 : 1))[0];
      if (!out) break; delete d[out]; const left = give(1, out); if (left) { d[out] = 1; break; } why.push(`${out} x1 folded into the deck's own cards (5-7 different cards)`); }
    guard = 0;
    while (Object.keys(d).length < 5 && guard++ < 5) {
      const big = Object.keys(d).filter(id => !keep(id) || d[id] > 2).sort((a, b) => d[b] - d[a])[0]; if (!big) break;
      const cand = [...p].filter(c => D[c] && !d[c] && !D[c].token && D[c].kind !== 'baby' && step(D[c].rarity) <= step(cap) && !otherReward(f, c, kept) && ((D[c].source || {}).kind) && (U.has(c) || f.k14exempt) && !(f.mapNo <= 10 && (D[c].effects || {}).moonpull))
        .sort((a, b) => dist(big, a) - dist(big, b) || (a < b ? -1 : 1))[0]; if (!cand) break;
      const n = Math.min(2, d[big] - 1, Math.min(capOf(cand), ladder(cand))); if (n <= 0) break; d[big] -= n; d[cand] = n; why.push(`${big} x${n} -> ${cand} (5-7 different cards)`); }
  }
  // 23-5 (siegeTrain): its list's siege cards are Beetle Battering Ram and Siege Rhino (Very Rare, 2 copies each) and Mouse Sapper; the cut
  // Trebuchet Crew held the boon before, so a fourth Mouse Sapper keeps it on (8 of 16; K14 gives way to the challenge's boon here)
  if (f.key === '23-5' && boon === 'siegeTrain' && !boonOk(d) && (d['badger-trench-digger'] || 0) > 1) { while (!boonOk(d) && d['badger-trench-digger'] > 1 && room('mouse-sapper') > 0) { d['badger-trench-digger']--; d['mouse-sapper'] = (d['mouse-sapper'] || 0) + 1; } why.push('Mouse Sapper up to keep siegeTrain on'); }
  if (!boonOk(d) && boonOk(before)) return null; // never turn a challenge's boon off
  if (JSON.stringify(d) === JSON.stringify(before) && !why.length) return null;
  const after = Object.fromEntries(Object.keys(d).filter(c => d[c] > 0).sort().map(c => [c, d[c]]));
  if (JSON.stringify(after) === JSON.stringify(Object.fromEntries(Object.keys(before).sort().map(c => [c, before[c]])))) return null;
  return { map: f.map, key: f.key, before, after, why: 'shaped to the road deck rules: ' + why.join('; '), showcase: null, boon: boon ? E.selfishBoonCount(D, after, boon) : null };
}
const cmd = process.argv[2];
if (require.main === module && cmd === 'shape') {
  const rows = fights().map(shapeOne).filter(Boolean); rows.forEach(r => console.log(r.key.padEnd(8), r.why, JSON.stringify(r.after), r.boon ? JSON.stringify(r.boon) : ''));
  if (process.argv.includes('--apply')) { let s = fs.readFileSync(APP, 'utf8'), n = 0; for (const r of rows) { const s2 = writeNode(s, r); if (s2) { s = s2; n++; } else console.log('not found ' + r.key); } fs.writeFileSync(APP, s); console.log('shaped ' + n);
    fs.writeFileSync(path.join(ROOT, 'docs', 'balance', 'bal16', `decks-shape-${DATE}.json`), JSON.stringify({ about: 'BAL16 shape pass (tools/bal16/decks_2026_11_05.js shape)', rows }, null, 1) + '\n'); }
}
if (require.main === module) {
  if (cmd === 'audit' || cmd === 'check') { const bad = fights().map(f => ({ f, off: offOf(f) })).filter(x => x.off.length);
    bad.forEach(x => console.log(`${x.f.map} ${x.f.key} ${x.off.map(id => id + ' x' + x.f.n.deck[id]).join(', ')}`)); console.log(`${bad.length} decks with off-list cards`); if (cmd === 'check' && bad.length) process.exitCode = 1; }
  else if (cmd === 'plan') { const j = plan(); j.rows.forEach(r => console.log(`${r.key.padEnd(8)} ${r.short ? 'SHORT ' + r.short + ' ' : ''}${r.leaderChanged ? '[leader ' + r.oldLeader + ' -> ' + r.leader + '] ' : ''}${(r.k14 || []).length ? '[K14 ' + r.k14.join(', ') + '] ' : ''}${JSON.stringify(r.after)}`));
    console.log(`${j.rows.length} decks planned; short ${j.rows.filter(r => r.short).length}; leaders changed ${j.rows.filter(r => r.leaderChanged).length} -> ${path.relative(ROOT, OUT)}`); }
  else if (cmd === 'apply') apply();
  else if (cmd !== 'shape') console.log(fs.readFileSync(__filename, 'utf8').split('\n').slice(1, 7).map(l => l.replace(/^\/\/ ?/, '')).join('\n'));
}
module.exports = { fights, offOf, rebuild, COMBOS, LEADERS };
