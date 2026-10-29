#!/usr/bin/env node
// Package BAL7 (2026-10-28): the batch's balance package.
//   ENG12-2 A unit woken by a hit loses the rest of that round: no swing, no counter, no trigger (it wakes groggy); it acts from the next round.
'use strict';
const path = require('path');
const H = require('./lib/harness.js');
const E = H.Engine, ROOT = path.join(__dirname, '..');
let fail = 0, n = 0; const ok = (c, m)=>{ n++; if(!c){ fail++; console.log('  ✗', m); } else console.log('  ✓', m); };
const so = id=> id === 1 ? 'A' : 'B';
const U = (id, effects, o)=> Object.assign({id, name:id, attack:1, health:100, wait:0, cost:0, effects}, o || {});
const defs = Object.assign({}, H.loadCardDefs(), {
  'x-sleeper': U('x-sleeper', {}, {attack:5, health:100, wait:0}),
  'x-hitter': U('x-hitter', {quick:true}, {attack:2, health:100, wait:0}),
  'x-counter': U('x-counter', {counterattack:true}, {attack:4, health:100, wait:0}),
});
const all = pl=> [...pl.row.left, ...pl.row.center, ...pl.row.right];
function mk(seed){ const e = E.makeSimEngine(defs, E.mulberry32(seed || 5), {recordEvents:true, battleMode:'open', rules:{}});
  return {e, P:{1: e.newPlayer(1, {}, {id:'st-hq', health:200, effects:{}}), 2: e.newPlayer(2, {}, {id:'st-hq', health:200, effects:{}})}}; }
function put(e, P, pid, id, slot){ const pl = P[pid]; e.debugSpawnCard(P, so, pid, id, slot, {}, []);
  const c = all(pl).reduce((a, x)=> (!a || x.uid > a.uid) ? x : a, null); c.slot = slot;
  const cs = all(pl); pl.row.center = cs.filter(x=> x.slot === 0); pl.row.left = cs.filter(x=> x.slot < 0).sort((a, b)=> b.slot - a.slot); pl.row.right = cs.filter(x=> x.slot > 0).sort((a, b)=> a.slot - b.slot);
  e.syncSlots(pl); return c; }
const hitsBy = (ev, uid)=> ev.filter(x=> (x.type === 'hit' || x.type === 'hitHQ') && x.attUid === uid);

// ---- ENG12-2: woken by a hit, no swing that round ------------------------------------------------------------------------------
{ const {e, P} = mk(31); const s = put(e, P, 1, 'x-sleeper', 0); const h = put(e, P, 2, 'x-hitter', 0);
  e.roundStart(P, 1, so, {}, []); s.asleep = 1;
  const ev = []; e.resolveCombat(P, so, {}, ev, 2);
  ok(s.hp < 100 && !(s.asleep > 0), `ENG12-2 the Quick hit wakes the sleeper (Health ${s.hp}, Asleep ${s.asleep})`);
  ok(hitsBy(ev, s.uid).length === 0 && h.hp === 100, `ENG12-2 ... and the woken unit does not swing that round (${hitsBy(ev, s.uid).length} hits, foe Health ${h.hp})`);
  e.endOfRoundUpkeep(P, so, {}, []); e.roundStart(P, 2, so, {}, []);
  const ev2 = []; e.resolveCombat(P, so, {}, ev2, 2);
  ok(hitsBy(ev2, s.uid).length >= 1, `ENG12-2 ... it swings again the next round (${hitsBy(ev2, s.uid).length} hits)`); }
// control: the same unit, never asleep, swings in round 1
{ const {e, P} = mk(31); const s = put(e, P, 1, 'x-sleeper', 0); put(e, P, 2, 'x-hitter', 0);
  e.roundStart(P, 1, so, {}, []); const ev = []; e.resolveCombat(P, so, {}, ev, 2);
  ok(hitsBy(ev, s.uid).length >= 1, `ENG12-2 control: an awake unit swings in that round (${hitsBy(ev, s.uid).length} hits)`); }
// a Counterattack unit woken by a hit does not strike back that round, and does the next
{ const {e, P} = mk(32); const c = put(e, P, 1, 'x-counter', 0); const h = put(e, P, 2, 'x-hitter', 0);
  e.roundStart(P, 1, so, {}, []); c.asleep = 1;
  const ev = []; e.resolveCombat(P, so, {}, ev, 2);
  ok(!(c.asleep > 0) && h.hp === 100, `ENG12-2 a sleeping Counterattack unit, woken by the hit, does not counter that round (foe Health ${h.hp})`);
  e.endOfRoundUpkeep(P, so, {}, []); e.roundStart(P, 2, so, {}, []);
  const ev2 = []; e.resolveCombat(P, so, {}, ev2, 2);
  ok(h.hp < 100, `ENG12-2 ... and counters the next round (foe Health ${h.hp})`); }
// the engine source: one helper gates every action check
{ const src = require('fs').readFileSync(path.join(ROOT, 'bramblewood-engine.js'), 'utf8');
  ok(/function dozing\(c\)\{[^\n]*_wokeRound === turnNo/.test(src) && /card\._wokeRound = turnNo/.test(src), 'ENG12-2 the wake marks the round (_wokeRound) and dozing() reads it'); }

// ---- CONTENT4-4: the Tundra family's Frigid is the maps' mapField, so fightRules (and every tool) sees it -----------------------------------
const fsx = require('fs'), J = f=> JSON.parse(fsx.readFileSync(path.join(ROOT, f), 'utf8'));
const G = require(path.join(ROOT, 'tools', 'lib_bramble.js')).G, MAPS = G.CONQUEST_MAPS;
['mt', 'm6', 'm22'].forEach(id=>{ const m = MAPS.find(x=> x.id === id), fs2 = m.nodes.filter(nd=> nd.deck && !/tutorial|raidboss/.test(nd.kind || ''));
  ok(m.mapField && m.mapField.field === 'frozen', `CONTENT4-4 ${id} carries mapField field:'frozen'`);
  const bad = fs2.filter(nd=>{ const own = (nd.rules || {}).field, r = G.fightRules(id, nd); return own != null && !r.scorchedOverScorching ? r.field !== own : r.field !== 'frozen'; }); // 22-7: its Scorching gives way to Scorched Ground (FX3), and the frost comes back, as the board laid it
  ok(fs2.length > 0 && !bad.length, `CONTENT4-4 ${id}: every fight's fightRules has the frost, or the fight's own field (${fs2.length} fights${bad.length ? ', off: ' + bad.map(x=> x.key).join(' ') : ''})`); });
{ const n23 = ['mt', 'm6', 'm22'].reduce((a, id)=> a + MAPS.find(x=> x.id === id).nodes.filter(nd=> nd.deck && G.fightRules(id, nd).field === 'frozen').length, 0);
  ok(n23 === 23, `CONTENT4-4 23 fights play Frigid by their rules (${n23})`); }
// the game still starts those fights with the frost (the engine takes rules.field as its starting field), and the board's fallback stays
{ const e = E.makeSimEngine(defs, E.mulberry32(3), {rules: {field: 'frozen'}}); ok(e.getField() && e.getField().id === 'frozen', 'CONTENT4-4 the engine starts a fight with rules.field frozen on'); }

// ---- FIN2-2: Give Shield and Bulwark priced from Shield = 0.8 Health ----------------------------------------------------------------------
{ const sc = J('canonical/skill-costs.json'), sh = sc.actions.find(a=> a.id === 'shield'), bul = sc.skills.find(s=> s.id === 'bulwark'), hp = sc.actions.find(a=> a.id === 'buff.amount2');
  ok(Math.abs(sh.value - sc.budget.shieldPerHealth * hp.value) < 1e-9, `FIN2-2 Give Shield a point = 0.8 x +1 Health given (${sh.value} = ${sc.budget.shieldPerHealth} x ${hp.value})`);
  ok(Math.abs(bul.value - 9 * sc.budget.shieldPerHealth) < 1e-9, `FIN2-2 Bulwark a point = the owner's 9 x 0.8 (${bul.value})`);
  const rf = J('docs/balance/bal7-shield-refit-2026-10-28.json'), cards = J('canonical/cards.json'), by = Object.fromEntries(cards.map(c=> [c.id, c]));
  rf.moves.forEach(m=> ok(`${by[m.id].attack || 0}/${by[m.id].health}` === m.to, `FIN2-2 re-fit ${m.id} ${m.from} -> ${m.to}`)); }

// ---- M2: the Test Lab's Card check takes the basic-pack cards a player can hold by then -------------------------------------------------
{ const src = fsx.readFileSync(path.join(ROOT, 'arena_app.js'), 'utf8'), i = src.indexOf('function cardCheckPool(upTo)'), body = src.slice(i, src.indexOf('\n}', i));
  ok(/src\.kind === 'pack' && Number\(src\.tier\) !== 99\)\{ const n = cardObtainMap\(d\); return n != null && n <= upTo; \}/.test(body), 'M2 cardCheckPool takes pack cards with cardObtainMap <= upTo');
  const pool = (()=>{ try{ return G.cardCheckPool(24); }catch(e){ return null; } })();
  if(pool) ok(pool.includes('owl-nightwatch'), `M2 the Owl Nightwatch is in the Card check pool to Map 24 (${pool.length} cards)`); }

// ---- M3: no card with a source carries the stale unattainable flag ------------------------------------------------------------------------
{ const cards = J('canonical/cards.json'), listed = new Set(); Object.values(J('canonical/map-pools.json').maps).forEach(e=> e.cards.concat(e.special || [], ...Object.values(e.submaps || {})).forEach(id=> listed.add(id)));
  const stale = cards.filter(c=> c.unattainable && c.source && c.source.kind && !c.awaitingSource && !(c.source.kind === 'pack' && ![11, 99].includes(+c.source.tier) && !(c.source.map && listed.has(c.id)))); // a basic-pack card with no map or in no map list is not placed: it keeps the flag
  // 2026-10-29 LISTFIX1 (decision APPLY1-2; owner 22:47): cards on no list are out of play. "On a list" is the game's (cardFirstMapList: the
  // tutorial, endless dungeon and tower lists name no card's map), so a card only on those is out of play and keeps the flag; the flag follows
  // tools/lib_map_pools.js isOutOfPlay both ways (docs/balance/listfix1-cards-2026-10-29.py)
  const LMP = require(path.join(ROOT, 'tools', 'lib_map_pools.js')), BD = require(path.join(ROOT, 'tools', 'lib_bramble.js')).CARD_DEFS_BASELINE;
  const stale2 = stale.filter(c=> BD[c.id] && !LMP.isOutOfPlay(G, BD[c.id]));
  ok(stale2.length === 0, `M3 no card with a source and in play is flagged unattainable (${stale2.map(c=> c.id).join(', ') || stale2.length}; ${stale.length - stale2.length} only on the tutorial / endless / tower lists, out of play)`);
  const unflagged = cards.filter(c=> !c.unattainable && !c.pool && !c.token && !c.test && !c.hero && !c.easterEgg && !['materia', 'spell', 'equipment'].includes(c.cardType) && BD[c.id] && LMP.isOutOfPlay(G, BD[c.id]));
  ok(unflagged.length === 0, `M3 every card out of play carries the flag (LISTFIX1; ${unflagged.map(c=> c.id).join(', ') || 'all'})`); }

// ---- K14: skirmish decks, non-map-unique cards at most 1 copy each and 6 in all ---------------------------------------------------------
{ const K = require(path.join(ROOT, 'tools', 'bal7_k14_decks_2026_10_28.js')), F = K.fights(), bad = F.filter(f=> K.violations(f, f.n.deck).length);
  ok(F.length > 200 && !bad.length, `K14 every covered fight follows the rule (${F.length} fights${bad.length ? '; breaking: ' + bad.map(f=> f.key).join(' ') : ''})`);
  const plan = J('docs/balance/bal7-k14-plan-2026-10-28.json');
  ok(plan.summary.changed > 100 && plan.rows.filter(r=> r.changed).every(r=> Object.values(r.before).reduce((a, b)=> a + b, 0) === Object.values(r.after).reduce((a, b)=> a + b, 0)), `K14 the changed decks kept their size (${plan.summary.changed} decks, ${plan.summary.copiesMoved} copies moved)`);
  const lead = plan.rows.filter(r=> r.changed).filter(r=>{ const f = F.find(x=> x.key === r.key); let L = []; try{ L = G.skirmishLeadersOf(f.n, f.map) || []; }catch(e){} return L.some(id=> r.before[id] && !r.after[id]); });
  ok(!lead.length, `K14 no fight lost its leader (${lead.map(r=> r.key).join(' ')})`); }

// ---- CONTENT4-1 is NOT applied (coordinator, 2026-10-28: the owner decides after HUB9's view): the map lists are as CONTENT4 left them ----
{ const base = J('docs/balance/content4-map-pools-plan-2026-10-28.json'), pools = J('canonical/map-pools.json').maps, len = Object.values(pools).reduce((a, e)=> a + e.cards.length + Object.values(e.submaps || {}).reduce((s, l)=> s + l.length, 0), 0);
  // 2026-10-28 APPLY1: lists follow THEME2 (owner 23:05 "Okay to THEME1-1"), not CONTENT4-1's cap: every main map's MAP list is THEME2's proposal
  const T2 = J('docs/balance/theme2-proposal-2026-10-28.json').maps.filter(m=> !m.skipped && !m.sub), off = T2.filter(m=> JSON.stringify(pools[m.key].cards) !== JSON.stringify(m.proposed));
  ok(len !== base.summary.cardsBefore && !off.length, `CONTENT4-1 not applied: the map lists are THEME2's (APPLY1; ${len} entries; off THEME2: ${off.map(m=> m.key).join(' ')})`); }

console.log(`\nbal7: ${n - fail}/${n} passed`);
process.exit(fail ? 1 : 0);
