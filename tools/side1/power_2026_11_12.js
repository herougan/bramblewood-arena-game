#!/usr/bin/env node
// 2026-11-12 (package SIDE1, phase A; owner 23:50: "Let's also re-assess card power for my assessment when editting cards. (I want to be strict
// with 1-3 skills per map)"): every card in play on the 11-12 lists (main lists of Maps 0-21 and the side lists of their side maps) against its
// budget N at the map where a player first gets it, read exactly as the card editor's budget box reads it: the editor's own functions
// (sbBudgetAt at Level 1, sbPriceS, sbCheck, sbMissMult, sbFragileUse, sbShieldH) evaluated from arena_app.js with the game's cardObtainMap
// (tools/lib_bramble.js, which loads canonical/map-pools.json), so B = f x ((3A + H) x m + S) against N, and the product cap.
// Also: the tools' copy of the obtain map (canonical/card-obtain-maps.json, read by tools/skill_costs.js and the hub) against the game's, and each
// card's first map before the 11-12 lists (git b6162b29, the batch tip before SKIR3) with its budget reading then; the skills of every map's NEW! cards.
//   node tools/side1/power_2026_11_12.js      -> docs/balance/card-power-2026-11-12.json and .md
'use strict';
const fs = require('fs'), path = require('path'), cp = require('child_process');
const L = require('./lib_side1_2026_11_12.js'), { ROOT, J, C } = L;
const BASE = 'b6162b29';
// the editor's budget box in a sandbox: read(d, om) -> its numbers; om (a map number), when given, stands in for cardObtainMap
function editor() {
  const LB = require('../lib_bramble.js'), grab = LB.grab, G = LB.G;
  const names = ['SB_DEFAULT_SKILLS', 'SB_HALF_MISS', 'SB_PAY_DEF', 'SB_V3_DEFAULTS', 'sbRitualPts', 'sbSkillCost', 'sbMissMult', 'sbFragileUse', 'sbBudgetAt', 'SB_WELL_UNDER', 'sbCheck', 'sbShieldH', 'sbCanon', 'sbPriceS', 'sbAttackMult', 'sbAttackOf', 'sbEffectsOf' /* SIDE2 (11-13): the Attack that counts */];
  const BB = require(path.join(ROOT, 'bramblewood-budget.js')), SC = require(path.join(ROOT, 'tools', 'skill_costs.js'));
  const body = ['let SB_SC = null, sbFbSkills = null, OM = null; const SKILL_COSTS_TABLE = TABLE; const cardObtainMap = d=> OM != null ? OM : OBTAIN(d);',
    'function sbLoad(){ return Object.assign({}, SB_V3_DEFAULTS, {skills: SB_DEFAULT_SKILLS, halfMiss: SKILL_COSTS_TABLE.halfMiss || SB_HALF_MISS}); }',
    ...names.map(n => grab(n)),
    // ceBudgetHTML's numbers (A, H as printed; N at Level 1; S from the canonical table)
    'return function read(d, om){ OM = om == null ? null : om; try{ const cfg = sbLoad(), A = sbAttackOf(d), D = Number(d.health)||0, S = sbPriceS(d, cfg).S, N = sbBudgetAt(d, cfg, 1), M = sbMissMult(d, cfg), F = sbFragileUse(d, cfg), SH = sbShieldH(d), c = sbCheck(A, D, S, N, M, F, SH, sbEffectsOf(d)); return {om: cardObtainMap(d), N, S, B: c.x1, P: c.x2, N2: c.N2, ok: c.ok, r1: c.r1, r2: c.r2, wellUnder: c.wellUnder}; }finally{ OM = null; } };'].join('\n');
  const read = new Function('BramblewoodBudget', 'SkillCosts', 'TABLE', 'OBTAIN', 'RARITY_DEFS', 'localStorage', body)(BB, SC, J('canonical/skill-costs.json'), d => G.cardObtainMap(d), G.RARITY_DEFS || [], { getItem: () => null });
  return { read, G, defs: LB.CARD_DEFS_BASELINE };
}
const r2 = v => Math.round(v * 100) / 100, pct = (b, n) => Math.round(100 * b / n);
const verdict = x => !x.ok ? 'over' : x.wellUnder ? 'under' : 'in';
// the lists now
const P = L.pools(), NOW = editor(), G = NOW.G;
const mains = L.mainByNo().filter(m => m.n <= 21);
const inPlay = new Map(); // id -> [where]
mains.forEach(({ id, n }) => (P[id].cards || []).forEach(c => { if (!inPlay.has(c)) inPlay.set(c, []); inPlay.get(c).push('Map ' + n); }));
L.SIDES.forEach(s => { const par = L.parentOf(s, P); (P[par].submaps[s] || []).forEach(c => { if (!inPlay.has(c)) inPlay.set(c, []); inPlay.get(c).push(L.mapName(s)); }); });
// the first map before the 11-12 lists: the tools' copy at the batch tip before SKIR3 (git b6162b29, generated from cardObtainMap then);
// the reading then = the same card read at that map (only the map term moves)
const OLDMAP = JSON.parse(cp.execSync('git show ' + BASE + ':canonical/card-obtain-maps.json', { cwd: ROOT, maxBuffer: 1 << 28 }).toString()).maps;
const obtainJson = J('canonical/card-obtain-maps.json').maps, OWNERCARDS = new Set(((J('tools/pipeline/config.json').refit || {}).ownerCards) || []);
const rows = [], TOOLS = require('../skill_costs.js').make(J('canonical/skill-costs.json'));
[...inPlay.keys()].sort().forEach(id => {
  const d = NOW.defs[id]; if (!d) return;
  const x = NOW.read(d), o = OLDMAP[id] != null ? NOW.read(d, OLDMAP[id]) : null;
  // the tools' reading (tools/skill_costs.js budget at Level 1, the same map): the re-fits and the hub use it; recorded where it differs
  const t = TOOLS.budget(Object.assign({}, d, { obtainMap: x.om }), { level: 1 });
  rows.push({ toolsUse: pct(t.x1, t.N), id, name: d.name, rarity: d.rarity, stats: `${d.attack}/${d.health}`, cost: d.cost, wait: d.wait, lists: inPlay.get(id), firstMap: x.om, N: r2(x.N), B: r2(x.B), S: r2(x.S), use: pct(x.B, x.N), margin: r2(x.N - x.B), cap2: { P: r2(x.P), N2: r2(x.N2), ok: x.r2 }, verdict: verdict(x),
    toolsMap: obtainJson[id] == null ? null : obtainJson[id], before: o ? { firstMap: o.om, N: r2(o.N), B: r2(o.B), use: pct(o.B, o.N), verdict: verdict(o) } : null,
    owner: OWNERCARDS.has(id) });
});
// skills a map: the NEW! cards of each main map (not on an earlier main list; Map 0-1 also not on the T-1 / T-2 list) and each side map (lib carriedIndex)
const skillMaps = [];
const tut = new Set(P.m1.submaps.mtut12 || []);
mains.forEach(({ id, n }, i) => { const seen = new Set(); mains.slice(0, i).forEach(m => P[m.id].cards.forEach(c => seen.add(c))); if (n <= 1) tut.forEach(c => seen.add(c));
  const neu = P[id].cards.filter(c => !seen.has(c) && C[c]); skillMaps.push({ map: id, name: L.mapName(id), no: n, side: false, neu }); });
L.SIDES.forEach(s => { const un = L.unlockOf(s), idx = L.carriedIndex(un, P), par = L.parentOf(s, P); skillMaps.push({ map: s, name: L.mapName(s), no: G.mapNumberOf(s), opensAfter: un, side: true, neu: P[par].submaps[s].filter(c => !idx.has(c) && C[c]) }); });
skillMaps.forEach(m => {
  const by = new Map(), light = new Set();
  m.neu.filter(c => !L.baby(c)).forEach(c => L.skillsOf(C[c]).forEach(x => { if (x.light) { light.add(x.label); return; } if (!by.has(x.key)) by.set(x.key, { label: x.label, cards: [] }); by.get(x.key).cards.push(c); }));
  m.skills = [...by.values()].map(v => ({ skill: v.label, cards: v.cards.map(c => C[c].name) })); m.lightSkills = [...light]; m.count = by.size;
  // the odd ones out: skills on one card only, the card whose skills are least shared first
  const share = c => L.skillsOf(C[c]).filter(x => !x.light).reduce((t, x) => t + by.get(x.key).cards.length - 1, 0);
  m.oddOut = m.count > 3 ? m.neu.filter(c => !L.baby(c) && L.skillsOf(C[c]).some(x => !x.light && by.get(x.key).cards.length === 1)).sort((a, b) => share(a) - share(b)).map(c => ({ card: C[c].name, solo: L.skillsOf(C[c]).filter(x => !x.light && by.get(x.key).cards.length === 1).map(x => x.label) })) : [];
  m.neu = m.neu.map(c => C[c].name);
});
const moved = rows.filter(r => r.before && r.before.firstMap !== r.firstMap);
const stale = rows.filter(r => r.toolsMap != null && r.toolsMap !== r.firstMap);
const outJ = { about: 'Card power against N at the first map (the card editor\'s reading: Level 1, cardObtainMap, canonical skill prices), cards in play on the 11-12 lists, Maps 0-21 and their side maps (tools/side1/power_2026_11_12.js)', built: '2026-11-12',
  budget: 'bramblewood-budget.js (DEFAULTS, BUDGET2 3A + H)', base: BASE, counts: { cards: rows.length, over: rows.filter(r => r.verdict === 'over').length, in: rows.filter(r => r.verdict === 'in').length, under: rows.filter(r => r.verdict === 'under').length, firstMapMoved: moved.length, toolsMapStale: stale.length },
  cards: rows, skillsAMap: skillMaps };
fs.writeFileSync(path.join(ROOT, 'docs', 'balance', 'card-power-2026-11-12.json'), JSON.stringify(outJ, null, 1) + '\n');
// the owner-facing page: outliers first
const lines = [], fm = r => `${r.name} (${r.rarity}, ${r.stats}, Map ${r.firstMap})`;
lines.push('# Card power, 2026-11-12 (the 11-12 lists)', '', 'Every card in play on the 11-12 lists (main Maps 0-21 and their side maps), read as the card editor reads it: **B** (cap 1 score, f x ((3A + H) x m + S)) against **N** at Level 1 for the map where a player first gets it (cardObtainMap). Use = B / N. "Over" breaks a cap; "under" is at or below 60% of N. Formula: `bramblewood-budget.js`. Data: `docs/balance/card-power-2026-11-12.json`. Tool: `node tools/side1/power_2026_11_12.js`.', '');
lines.push(`${rows.length} cards: ${outJ.counts.over} over, ${outJ.counts.in} in, ${outJ.counts.under} well under. First map moved with the 11-12 lists: ${moved.length}.`, '');
const over = rows.filter(r => r.verdict === 'over').sort((a, b) => b.use - a.use);
lines.push('## Over budget', '', '| Card | Lists | B / N | Use | Margin | Cap 2 | Owner-set |', '|---|---|---|---|---|---|---|');
over.forEach(r => lines.push(`| ${fm(r)} | ${r.lists.join(', ')} | ${r.B} / ${r.N} | ${r.use}% | ${r.margin} | ${r.cap2.ok ? 'ok' : r.cap2.P + ' > ' + r.cap2.N2} | ${r.owner ? 'yes' : ''} |`));
const under = rows.filter(r => r.verdict === 'under').sort((a, b) => a.use - b.use);
lines.push('', '## Well under (60% of N or less)', '', '| Card | Lists | B / N | Use |', '|---|---|---|---|');
under.forEach(r => lines.push(`| ${fm(r)} | ${r.lists.join(', ')} | ${r.B} / ${r.N} | ${r.use}% |`));
lines.push('', '## First map moved with the 11-12 lists', '', 'Before = the batch before SKIR3 (git ' + BASE + ').', '', '| Card | First map | N | Use | Reading |', '|---|---|---|---|---|');
moved.sort((a, b) => Math.abs(b.use - b.before.use) - Math.abs(a.use - a.before.use)).forEach(r => lines.push(`| ${r.name} | ${r.before.firstMap} -> ${r.firstMap} | ${r.before.N} -> ${r.N} | ${r.before.use}% -> ${r.use}% | ${r.before.verdict} -> ${r.verdict} |`));
lines.push('', '## Skills a map (NEW! cards; light skills and Baby cards not counted)', '', '| Map | Count | Skills | Odd one out |', '|---|---|---|---|');
skillMaps.forEach(m => lines.push(`| ${m.side ? m.name + ' (side, opens after ' + m.opensAfter + ')' : 'Map ' + m.no + ' ' + m.name} | ${m.count}${m.count > 3 ? ' **over**' : ''} | ${m.skills.map(s => s.skill + (s.cards.length > 1 ? ' x' + s.cards.length : '')).join(', ')} | ${m.oddOut.slice(0, 4).map(o => o.card + ' (' + o.solo.join(', ') + ')').join('; ')} |`));
lines.push('', '## Every card', '', '| Card | Rarity | Stats | First map | B / N | Use | Reading | Lists |', '|---|---|---|---|---|---|---|---|');
rows.forEach(r => lines.push(`| ${r.name} | ${r.rarity} | ${r.stats} | ${r.firstMap} | ${r.B} / ${r.N} | ${r.use}% | ${r.verdict} | ${r.lists.join(', ')} |`));
const diff = rows.filter(r => Math.abs(r.toolsUse - r.use) >= 5);
if (diff.length) lines.splice(lines.indexOf('## Well under (60% of N or less)'), 0, '## Editor and tools read differently', '', 'The editor\'s box (this table) and tools/skill_costs.js (the re-fits, the hub) at the same map and Level 1; 5+ points apart:', '', '| Card | Editor | Tools | Why |', '|---|---|---|---|',
  ...diff.map(r => `| ${r.name} (${r.stats}) | ${r.use}% | ${r.toolsUse}% | ${(NOW.defs[r.id].effects || {}).arrow && /never/.test(JSON.stringify(NOW.defs[r.id].effects.arrow)) ? 'it never swings: the tools leave its Attack out, the editor counts it' : 'see the two readings'} |`), '');
if (stale.length) lines.push('', `Tools' copy (canonical/card-obtain-maps.json) differs from the game for ${stale.length} cards: ${stale.slice(0, 12).map(r => r.name + ' ' + r.toolsMap + ' vs ' + r.firstMap).join(', ')}.`);
fs.writeFileSync(path.join(ROOT, 'docs', 'balance', 'card-power-2026-11-12.md'), lines.join('\n') + '\n');
console.log(`${rows.length} cards: ${outJ.counts.over} over, ${outJ.counts.in} in, ${outJ.counts.under} under; first map moved ${moved.length}; tools' obtain map stale ${stale.length}`);
console.log('top over:', over.slice(0, 8).map(r => `${r.name} ${r.use}%`).join(', '));
console.log('maps over 3 skills:', skillMaps.filter(m => m.count > 3).map(m => `${m.side ? m.name : 'Map ' + m.no} ${m.count}`).join(', '));
