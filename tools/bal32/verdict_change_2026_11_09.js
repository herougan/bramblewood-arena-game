#!/usr/bin/env node
// 2026-11-09 (package BAL32, copied from tools/bal30/verdict_change_2026_11_08.js): which cards on Maps 0-20 change their budget verdict (BUDGET2: over = cap 1 or cap 2 broken at the start level
// or Level 1; well under = cap 1 at or below 60% of N) between the skill table before BAL32 (git rev given, default origin/batch-1023e) and the
// live canonical/skill-costs.json. Report only; no card is touched. Same machinery as tools/bal29/reprice_2026_11_08.js (half-miss swap).
//   node tools/bal32/verdict_change_2026_11_09.js [oldRev] -> docs/balance/bal32/verdict-change-2026-11-09.json
'use strict';
const fs = require('fs'), path = require('path'), cp = require('child_process');
const ROOT = path.join(__dirname, '..', '..'), OUTD = path.join(ROOT, 'docs', 'balance', 'bal32');
const LB = require(path.join(ROOT, 'tools', 'lib_bramble.js')), G = LB.G;
const LMP = require(path.join(ROOT, 'tools', 'lib_map_pools.js')), SC = require(path.join(ROOT, 'tools', 'skill_costs.js')), BB = require(path.join(ROOT, 'bramblewood-budget.js'));
const J = f => JSON.parse(fs.readFileSync(path.join(ROOT, f), 'utf8'));
const r2 = v => Math.round(v * 100) / 100, WELL_UNDER = 0.6;
const rev = process.argv[2] || 'origin/batch-1023e';
const OLDT = JSON.parse(cp.execFileSync('git', ['show', rev + ':canonical/skill-costs.json'], { cwd: ROOT, maxBuffer: 1 << 26 }).toString()), NEWT = J('canonical/skill-costs.json');
const cards = J('canonical/cards.json'), byId = new Map(cards.map(c => [c.id, c])), pools = J('canonical/map-pools.json');
const onMap = new Set(); Object.entries(pools.maps).forEach(([m, v]) => { const no = G.mapNumberOf(m); if (no == null || no > 20) return; const n = LMP.normalizeEntry(v);
  n.cards.concat(n.special, ...Object.values(n.submaps)).forEach(id => onMap.add(id)); });
const flat = e => BB.XP ? BB.XP(e || {}) : (e || {});
function maker(table) { const T = SC.make(table), Bt = table.budget || {}, f = T.budget;
  T.budget = function (d, o) { const b = f(d, o), e = (d && d.effects) || {}, mNew = BB.missMultOf(e, Bt); if (!(b.m > 0) || Math.abs(mNew - b.m) < 1e-9) return b;
    const fz = b.f || 1, q = mNew / b.m, cs = BB.cap2SOf ? BB.cap2SOf(b.S, Bt) : (b.S * Math.abs(b.S)), x1 = r2(fz * ((b.x1 / fz - b.S) * q + b.S)), x2 = r2(fz * ((b.x2 / fz - cs) * q + cs)), ok = x1 <= b.N && x2 <= b.N2;
    return Object.assign({}, b, { x1, x2, ok, wellUnder: ok && x1 <= b.N * 0.6, m: mNew }); }; return T; }
function verdict(T, c) { const b = T.budget(c), b1 = T.budget(c, { level: 1 }), over = !b.ok || !b1.ok, under = !over && b.x1 <= b.N * WELL_UNDER;
  return { v: over ? 'over' : under ? 'under' : 'ok', use: b.N ? r2(b.x1 / b.N) : null, S: b.S }; }
const OLD = maker(OLDT), NEW = maker(NEWT), rows = [], tally = { cards: 0, before: { ok: 0, over: 0, under: 0 }, after: { ok: 0, over: 0, under: 0 } };
[...onMap].sort().forEach(id => { const c = byId.get(id); if (!c || c.token || c.test || !SC.measured(c) || c.health == null) return; tally.cards++;
  const a = verdict(OLD, c), b = verdict(NEW, c); tally.before[a.v]++; tally.after[b.v]++;
  if (a.v === b.v && Math.abs(a.S - b.S) < 0.005) return;
  rows.push({ id, name: c.name, rarity: c.rarity || 'common', stats: `${c.attack == null ? '-' : c.attack}/${c.health}`, skills: Object.keys(flat(c.effects)).filter(k => JSON.stringify(OLDT.skills.find(x => x.id === k)) !== JSON.stringify(NEWT.skills.find(x => x.id === k))),
    S: [a.S, b.S], use: [a.use, b.use], verdict: [a.v, b.v] }); });
fs.mkdirSync(OUTD, { recursive: true });
const flips = rows.filter(r => r.verdict[0] !== r.verdict[1]);
// 2026-11-09 (BAL32): the live cards on no Map 0-20 list (later maps, packs) whose verdict flips too: reported apart (the owner tunes Maps
// 0-20 only, BAL17-2) and held by tools/lib_map_pools.js budgetHold with the Maps 0-20 flips, so the budget tests wait for the re-fit step
const beyond = []; cards.forEach(c => { if (onMap.has(c.id) || c.token || c.test || !SC.measured(c) || c.health == null || LMP.isOutOfPlay(G, c)) return;
  const a = verdict(OLD, c), b = verdict(NEW, c); if (a.v !== b.v) beyond.push({ id: c.id, name: c.name, rarity: c.rarity || 'common', stats: `${c.attack == null ? '-' : c.attack}/${c.health}`, S: [a.S, b.S], use: [a.use, b.use], verdict: [a.v, b.v] }); });
// 2026-11-09 (package FIX11): the miss. Unplaced cards (isOutOfPlay: on no list, e.g. CONTENT7's bloodworm) were skipped above, yet their own tests
// judge them at the proposed home map in creatorNote ("proposed home ... (Map N"). Judge them there too; listed apart as `unplaced`, held the same way.
const unplaced = []; cards.forEach(c => { if (onMap.has(c.id) || c.token || c.test || !SC.measured(c) || c.health == null || !LMP.isOutOfPlay(G, c)) return;
  const m = /proposed home[^(]*\(Map (\d+)/.exec(c.creatorNote || ''); if (!m || +m[1] > 20) return; const d = Object.assign({}, c, { obtainMap: +m[1] });
  const a = verdict(OLD, d), b = verdict(NEW, d); if (a.v !== b.v) unplaced.push({ id: c.id, name: c.name, rarity: c.rarity || 'common', stats: `${c.attack == null ? '-' : c.attack}/${c.health}`, map: +m[1], S: [a.S, b.S], use: [a.use, b.use], verdict: [a.v, b.v] }); });
console.log('unplaced (proposed home Map 0-20) flips', unplaced.length); unplaced.forEach(r => console.log(' ', r.id, r.stats, 'Map', r.map, 'S', r.S.join('->'), 'use', r.use.join('->'), r.verdict.join('->')));
fs.writeFileSync(path.join(OUTD, 'verdict-change-2026-11-09.json'), JSON.stringify({ _about: 'BAL32: Maps 0-20 budget verdicts before (' + rev + ') and after the BAL31-1/2/3 prices (on-hit riders, enablers, merged keys); beyond = live cards on no Map 0-20 list that flip; unplaced = unlisted cards that flip at their proposed home map (FIX11). Report only.', tally, flips, beyond, unplaced, otherChanged: rows.filter(r => r.verdict[0] === r.verdict[1]) }, null, 1) + '\n');
console.log('beyond Maps 0-20 flips', beyond.length); beyond.forEach(r => console.log(' ', r.id, r.stats, 'S', r.S.join('->'), 'use', r.use.join('->'), r.verdict.join('->')));
console.log(JSON.stringify(tally)); console.log('flips', flips.length); flips.forEach(r => console.log(r.id, r.stats, r.skills.join(','), 'S', r.S.join('->'), 'use', r.use.join('->'), r.verdict.join('->')));
console.log('changed S, same verdict:', rows.length - flips.length);
