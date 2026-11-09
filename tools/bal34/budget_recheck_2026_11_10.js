#!/usr/bin/env node
// 2026-11-10 (package BAL34): the budget re-check after this package's decided changes, no re-fits (no card stat changes):
//   1. the Dive cards (BAL33-1: Dive -3.3 + 0.8 N, was -1 + 0.5 N), the Bulwark cards (ENG40-2 a: 6.3 x N^0.47, was 6.65) and the Hoard cards
//      (ENG40-1 a: Tax-Collector Teal and The Magnate Duck to Hoard 1): each card's cap-1 use (x1 / N, tools/skill_costs.js T.budget) under a base
//      checkout's canonical/skill-costs.json, canonical/cards.json and bramblewood-budget.js against this checkout's (as tools/eng27_budget_moves_2026_11_06.js).
//   2. the two-skill count (UI27-4 a, bramblewood-budget.js skillCountOf: each ability 1, a plain light one 0.5): the Maps 0-20 cards (the BAL25
//      scope: canonical/card-obtain-maps.json map <= 20, plus unlisted faction, Starter and Base cards) now over 2, with the old count beside it.
//   node tools/bal34/budget_recheck_2026_11_10.js <base checkout dir>   -> docs/balance/bal34/budget-recheck-2026-11-10.json
'use strict';
const fs = require('fs'), path = require('path');
const ROOT = path.join(__dirname, '..', '..'), BASE = process.argv[2];
if(!BASE || !fs.existsSync(path.join(BASE, 'bramblewood-budget.js'))){ console.error('usage: node tools/bal34/budget_recheck_2026_11_10.js <base checkout dir>'); process.exit(2); }
const fresh = f=>{ delete require.cache[require.resolve(f)]; return require(f); };
const J = (dir, f)=> JSON.parse(fs.readFileSync(path.join(dir, f), 'utf8'));
const r1 = v=> Math.round(v * 10) / 10;
function load(dir){
  dir = path.resolve(dir);
  const SC = fresh(path.join(dir, 'tools', 'skill_costs.js')), BB = fresh(path.join(dir, 'bramblewood-budget.js'));
  const T = SC.make(J(dir, 'canonical/skill-costs.json')), cards = J(dir, 'canonical/cards.json'), out = {};
  cards.forEach(c=>{ if(c.pool || c.test || c.token) return; const b = T.budget(c, {}); const fx = c.effects || {};
    out[c.id] = {use: b && b.N > 0 ? r1(100 * b.x1 / b.N) : null, x1: b ? r1(b.x1) : null, N: b ? r1(b.N) : null, S: b ? r1(b.S) : null, count: BB.skillCountOf(fx), parts: BB.skillCountParts ? BB.skillCountParts(fx) : null}; });
  Object.keys(require.cache).filter(k=> k.startsWith(dir)).forEach(k=> delete require.cache[k]);
  return out;
}
const was = load(BASE), now = load(ROOT);
const cards = J(ROOT, 'canonical/cards.json'), by = {}; cards.forEach(c=> by[c.id] = c);
const OBTAIN = J(ROOT, 'canonical/card-obtain-maps.json').maps || {};
const inScope = c=>{ const m = OBTAIN[c.id], k = c.source && c.source.kind; if(m != null) return m <= 20; return !!(c.faction || c.rarity === 'starter' || k === 'base'); };
const row = (id, why)=>{ const c = by[id], w = was[id] || {}, n = now[id] || {};
  return {id, name: c.name, why, map: OBTAIN[id] != null ? OBTAIN[id] : null, stats: `${c.attack}/${c.health} cost ${c.cost}`, N: n.N, S: {was: w.S, now: n.S}, use: {was: w.use, now: n.use}, verdict: n.use == null ? null : (n.use > 100 ? 'over' : (n.use < 70 ? 'well under' : 'within'))}; };
const pick = (k, fx)=> fx && fx[k] != null && fx[k] !== false;
const dive = cards.filter(c=> now[c.id] && pick('dive', c.effects)).map(c=> row(c.id, 'Dive ' + c.effects.dive));
const bulwark = cards.filter(c=> now[c.id] && pick('bulwark', c.effects)).map(c=> row(c.id, 'Bulwark ' + c.effects.bulwark));
const hoard = cards.filter(c=> now[c.id] && pick('hoard', c.effects)).map(c=> row(c.id, 'Hoard ' + JSON.stringify(c.effects.hoard)));
const label = k=> /^trigger:/.test(k) ? k : k;
const over = cards.filter(c=> now[c.id] && !c.hallOfFame && !c.baseId && !c.field && inScope(c) && now[c.id].count > 2)
  .map(c=> ({id: c.id, name: c.name, map: OBTAIN[c.id] != null ? OBTAIN[c.id] : null, count: now[c.id].count, was: was[c.id] ? was[c.id].count : null,
    sum: now[c.id].parts.map(p=> `${label(p.k)} ${p.w}`).join(' + ')}))
  .sort((a, b)=> b.count - a.count || (a.map == null ? 99 : a.map) - (b.map == null ? 99 : b.map) || a.id.localeCompare(b.id));
const out = {when: '2026-11-10', package: 'BAL34', rule: 'cap-1 use = x1 / N (tools/skill_costs.js budget, Level as card_balance); within 70-100%', base: path.resolve(BASE) === ROOT ? 'self' : 'base checkout (batch-1023e e958d6b8)',
  dive, bulwark, hoard, twoSkill: {rule: 'bramblewood-budget.js skillCountOf: each ability 1, plain Flying / Tide / Diurnal / Nocturnal / Crepuscular / Sun-shy / Night-blind / Purblind 0.5; over 2 breaks the rule', scope: 'Maps 0-20 (BAL25 scope)', over, newlyOver: over.filter(o=> o.was != null && o.was <= 2).map(o=> o.id),
    overAnyMap: cards.filter(c=> now[c.id] && now[c.id].count > 2).map(c=> c.id).sort() /* every live card, any map (tests read it) */}};
fs.mkdirSync(path.join(ROOT, 'docs', 'balance', 'bal34'), {recursive: true});
fs.writeFileSync(path.join(ROOT, 'docs', 'balance', 'bal34', 'budget-recheck-2026-11-10.json'), JSON.stringify(out, null, 1) + '\n');
const show = (h, rs)=>{ console.log(h); rs.forEach(r=> console.log(`  ${r.name.padEnd(24)} ${r.why.padEnd(22)} map ${String(r.map).padEnd(4)} ${r.stats.padEnd(14)} S ${r.S.was} -> ${r.S.now}  use ${r.use.was}% -> ${r.use.now}% (${r.verdict})`)); };
show('Dive:', dive); show('Bulwark:', bulwark); show('Hoard:', hoard);
console.log(`Maps 0-20 cards over two skills: ${over.length} (newly over: ${out.twoSkill.newlyOver.length})`);
over.forEach(o=> console.log(`  ${o.name.padEnd(26)} map ${String(o.map).padEnd(4)} ${o.count} (was ${o.was}): ${o.sum}`));
