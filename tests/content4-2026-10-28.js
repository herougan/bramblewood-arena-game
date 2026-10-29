#!/usr/bin/env node
// 2026-10-28 (package CONTENT4): the map field effects (L2) and the map card pool proposal (L7). docs/balance/content4-2026-10-28.md.
//   1. the eleven maps carry their mapField, and fightRules puts it on every fight of that map (a fight's own rule wins, false switches it off);
//   2. every main and side map has a map-level field effect (shared by all its fights, or the board's Tundra-family Frigid), except the endless
//      dungeons and exactly one vanilla map in Maps 20-40: the Quiet Summit;
//   3. the before / after measures exist for every fight of the changed maps;
//   4. L7 is a proposal: the plan files and script exist and agree with the live pools, which are unchanged; no card was sent to awaiting by it;
//   5. the owner calls CONTENT4-1 .. 5 and the CHANGELOG entry.
'use strict';
const fs = require('fs'), path = require('path');
const ROOT = path.join(__dirname, '..'), R = f=> fs.readFileSync(path.join(ROOT, f), 'utf8'), J = f=> JSON.parse(R(f));
let fail = 0, n = 0; const ok = (c, m)=>{ n++; if(!c){ fail++; console.log('  ✗', m); } };
const G = require(path.join(ROOT, 'tools', 'lib_bramble.js')).G, MAPS = G.CONQUEST_MAPS;

// ---- 1. mapField
const WANT = {mf: {undergrowth: true}, mq: {thunderstorm: true}, mu: {sporeCloud: true}, mn: {mirage: true}, mh: {graspingBriars: true}, my: {canopy: true},
  mi: {slippery: 30}, m9: {ashy: true}, mx: {sulphurFumes: true}, m23: {arrowSlits: true}, m24: {arrowSlits: true}};
const fights = m=> m.nodes.filter(nd=> !/tutorial|raidboss/.test(nd.kind || '') && !nd.virtual);
Object.entries(WANT).forEach(([id, rules])=>{ const m = MAPS.find(x=> x.id === id);
  ok(m && JSON.stringify(m.mapField) === JSON.stringify(rules), `1. ${id} carries mapField ${JSON.stringify(rules)} (${m && JSON.stringify(m.mapField)})`);
  if(m) fights(m).forEach(nd=>{ const r = G.fightRules(id, nd); Object.entries(rules).forEach(([k, v])=> ok(r[k] === ((nd.rules || {})[k] != null ? nd.rules[k] : v), `1. ${id} ${nd.key}: ${k} is on`)); }); });
ok(MAPS.filter(m=> m.mapField).length === Object.keys(WANT).length + 3 /* 2026-10-28 (BAL7, CONTENT4-4): + the Tundra family's Frigid (mt, m6, m22: field frozen) */, '1. no other map carries a mapField');
{ const m = MAPS.find(x=> x.id === 'mu'), nd = Object.assign({}, fights(m)[0], {rules: {sporeCloud: false}});
  ok(G.fightRules('mu', nd).sporeCloud === false, "1. a fight's own rule wins (false switches the map's effect off)"); }
ok(/\.mapField; if\(mf\) Object\.keys\(mf\)\.forEach\(k=>\{ if\(r\[k\] == null\) r\[k\] = mf\[k\]; \}\)/.test(R('arena_app.js')), '1. fightRules reads mapField, the fight first');

// ---- 2. every map has a map-level field effect but the endless dungeons and the Quiet Summit
const FIELD2 = 'landslide consternation crushingDepths rookRow bishopPath mirage canopy undergrowth tallGrass slippery glassStorm hail lavaSpout leylines1 leylines2 leylines3 haunted sulphurFumes ashRain ashy arrowSlits psychicDampener awash quietContemplation sporeCloud thunderstorm tangledRoots graspingBriars fogOfWar wildfire windfall seasons'.split(' ');
function keysOf(r){ const k = new Set();
  if(r.volcano || r.lavaTideChance != null || r.petrifyChance != null || r.eruptionChance != null) k.add('volcano'); else if(Number(r.eruption) > 0) k.add('scorched');
  if(r.wind || r.sandstorm || r.glassStorm) k.add('wind'); if(r.dark) k.add('dark'); if(r.cloudy) k.add('cloudy'); if(r.misty) k.add('misty'); if(r.phase === 'night') k.add('night');
  if(r.twilight) k.add('twilight'); if(r.permaTide) k.add('permaTide'); if(r.swampFever) k.add('swampFever'); if(r.freezing) k.add('freezing'); if(r.sandstorm) k.add('sandstorm');
  if(r.tide || r.highTide || r.tideSpout) k.add('tide'); if(r.frostWait || r.frostCount || r.frostbite) k.add('frost'); if(r.field) k.add('field:' + r.field); if(r.firstBlood) k.add('firstBlood');
  FIELD2.forEach(f=>{ if(r[f]) k.add(f); });
  if((r.phase === 'cycle' || r.phase === 'nightFirst') && (Number(r.phaseDay) > 0 || Number(r.phaseNight) > 0) && Number(r.phaseDay) !== Number(r.phaseNight)) k.add('glow');
  return k; }
const KIND5 = (()=>{ const m = /const MAP_KIND = (\{[^}]*\})/.exec(R('bramblewood-shaders.js')); const o = m ? Function('return ' + m[1].replace(/\/\*[^]*?\*\//g, ''))() : {}; return new Set(Object.keys(o).filter(k=> o[k] === 5)); })();
ok(['m6', 'mt', 'm22'].every(id=> KIND5.has(id)), '2. the Tundra-family maps get the board\'s Frigid (MAP_KIND 5)');
const ENDLESS = new Set(['mm', 'muc', 'mlb']), none = [];
MAPS.forEach(m=>{ const f = fights(m); if(!f.length || ENDLESS.has(m.id)) return; if(KIND5.has(m.id)) return;
  const sets = f.map(nd=> keysOf(G.fightRules(m.id, nd))), shared = [...sets[0]].filter(k=> sets.every(s=> s.has(k)));
  if(!shared.length) none.push(m.id); });
ok(JSON.stringify(none) === '["m21"]', `2. the only map without a map-level field effect is the Quiet Summit (${none.join(', ')})`);
ok(G.mapNumberOf('m21') >= 20 && G.mapNumberOf('m21') <= 40, '2. and it sits in Maps 20-40');

// ---- 3. the measures
{ const rd = f=> R(f).trim().split('\n').map(l=> JSON.parse(l)), b = rd('docs/balance/skirmish-pass-content4-l2-before.jsonl'), a = rd('docs/balance/skirmish-pass-content4-l2-after.jsonl');
  Object.keys(WANT).forEach(id=>{ const m = MAPS.find(x=> x.id === id); fights(m).forEach(nd=>{
    ok(b.some(x=> x.map === id && x.key === nd.key && x.games === 40) && a.some(x=> x.map === id && x.key === nd.key && x.games === 40), `3. ${id} ${nd.key} measured before and after (40 games)`); }); }); }

// ---- 4. L7 is a proposal
{ const plan = J('docs/balance/content4-map-pools-plan-2026-10-28.json'), pools = J('canonical/map-pools.json').maps, cards = J('canonical/cards.json'), by = Object.fromEntries(cards.map(c=> [c.id, c]));
  ok(fs.existsSync(path.join(ROOT, 'docs/balance/content4-map-pools-trim-2026-10-28.js')) && fs.existsSync(path.join(ROOT, 'docs/balance/content4-map-pools-apply-2026-10-28.py')) && fs.existsSync(path.join(ROOT, 'docs/balance/content4-map-pools-plan-2026-10-28-keeppro.json')), '4. the script, the apply step and both plans exist');
  // 2026-10-28 APPLY1: lists follow THEME2 (owner 23:05). The lists THEME2 rewrote are its proposal now (main map: the proposal; submap: the
  // proposal minus the parent's MAP cards, tools/apply1_theme2_2026_10_28.py); L7 stays not applied, and the lists THEME2 kept are L7's "before".
  const T2 = Object.fromEntries(J('docs/balance/theme2-proposal-2026-10-28.json').maps.filter(m=> !m.skipped).map(m=> [m.key, m]));
  Object.entries(plan.lists).forEach(([k, L])=>{ const live = L.sub ? (pools[L.map].submaps || {})[L.sub] : pools[L.map].cards;
    const t2 = T2[L.sub || L.map];
    // 2026-10-29 LISTFIX1 (decision APPLY1-1): a submap stores its whole proposal (a submap fight reads only its own list + SPECIAL)
    if(t2){ const want = t2.proposed;
      ok(live && JSON.stringify(live) === JSON.stringify(want), `4. ${k}: the live list is THEME2's (APPLY1; ${live && live.length} vs ${want.length})`); return; }
    ok(live && live.length === L.before, `4. ${k}: the live pool is the plan's "before" (${live && live.length} vs ${L.before}): not applied`);
    if(!L.skipped){ ok(L.afterNew <= Math.max(7, L.keptNew.filter(s=> / \(/.test(s)).length), `4. ${k}: new cards capped (${L.afterNew})`);
      ok(L.keep.every(id=> live.includes(id) || (L.addedOld || []).includes(id)), `4. ${k}: the plan keeps only cards of its list (or carried deck cards)`); } });
  ok(plan.awaiting.every(a=> by[a.id] && !by[a.id].awaitingSource && by[a.id].source), '4. none of the plan\'s cards was sent to awaiting (nothing applied)');
  ok(plan.summary.awaiting === plan.awaiting.length && plan.awaiting.length > 0, `4. the plan names the cards that would wait (${plan.awaiting.length})`); }

// ---- 5. decisions and changelog
{ const d = J('docs/decisions.json').items, ids = ['CONTENT4-1', 'CONTENT4-2', 'CONTENT4-3', 'CONTENT4-4', 'CONTENT4-5'];
  // 2026-10-28 (RELFIX2): CONTENT4-1 was re-opened (owner 16:43) as YET with new options and a proposal as its default, which is not one of the options' wording; a re-opened call needs options and a default, a filled one its default among the options
  ids.forEach(id=>{ const x = d.find(y=> y.id === id); ok(x && (x.status === 'YET' || (x.status === 'DONE' && x.outcome)) /* 2026-10-28 (BAL7): the calls were filled (owner 10-26 23:33) */ && x.options && (x.options.includes(x.default) || (x.status === 'YET' && x.options.length >= 2 && x.default)), `5. ${id} is an open owner call with its default among the options (or a re-opened call with options)`); });
  ok(/^## 2026-10-28 \(package CONTENT4/m.test(R('docs/CHANGELOG.md')), '5. the CHANGELOG entry');
  ok(fs.existsSync(path.join(ROOT, 'docs/balance/content4-2026-10-28.md')), '5. the report'); }

console.log(`content4-2026-10-28: ${n - fail}/${n} ok`);
process.exit(fail ? 1 : 0);
