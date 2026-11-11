#!/usr/bin/env node
// 2026-11-12 (package SKIR3): the road fights the swap (tools/skir3/decks_2026_11_12.js swap) could not make legal on the owner's 11-12 lists: each is
// filled again with SKIR1's builder (tools/skir1/build_2026_11_11.js fill: the fight's own rules from tools/skir1/lib_fight_2026_11_11.js) from the
// cards of its deck still in its pool (their copies wanted first), then the pool by weight (cards the map's other fights use less weigh more), inside
// the map's usage line (a card in at most half its fights, one more after 20 tries) and the two-card family rule. Seeded per fight; the fit
// (tools/skir1/fit_2026_11_11.js) then moves it onto the road curve.
//   node tools/skir3/refill_2026_11_12.js [--apply]   -> arena_app.js, docs/balance/skir3/refill-2026-11-12.json
'use strict';
const fs = require('fs'), path = require('path');
const ROOT = path.resolve(__dirname, '..', '..'), APP = path.join(ROOT, 'arena_app.js');
// build_2026_11_11.js runs its own command on load (plan by default): it is loaded with a neutral argument so it only exports its builder
const ARGV = process.argv.splice(2, process.argv.length, 'lib');
const L = require('../skir1/lib_fight_2026_11_11.js'), B = require('../skir1/build_2026_11_11.js');
process.argv.splice(2, 1, ...ARGV);
const APPLY = process.argv.includes('--apply');
function fnv(s) { let h = 2166136261; for (let i = 0; i < s.length; i++) { h ^= s.charCodeAt(i); h = Math.imul(h, 16777619); } return h >>> 0; }
function rng(seed) { let t = fnv(seed); return () => { t += 0x6D2B79F5; let r = Math.imul(t ^ t >>> 15, 1 | t); r ^= r + Math.imul(r ^ r >>> 7, 61 | r); return ((r ^ r >>> 14) >>> 0) / 4294967296; }; }
const sorted = d => Object.fromEntries(Object.keys(d).sort().map(k => [k, d[k]]));
const BOON_OFF = { '13-4': 'Wild Rage: one Wild Rage card (Grizzly Vanguard) on the Map 13 list; a carried one (K14) holds 1 copy', '20-4': 'Restless Dead: no undead card is on the Map 20 list (the owner\'s 11-12 picks) or any earlier one' };
let s = fs.readFileSync(APP, 'utf8'); const rows = [];
for (const m of L.maps()) {
  const nodes = L.fightsOf(m), F = nodes.map(n => L.fight(m, n)), ucap = L.ucapOf(m);
  const listAll = [...new Set([].concat(...F.map(f => f.pool)))], fam = {}; listAll.forEach(id => { fam[B.family(id)] = (fam[B.family(id)] || 0) + 1; });
  for (const f of F) {
    // a challenge fight whose boon theme no card of the 11-12 list holds keeps its boon rule but plays without it (BOON_OFF; draft decision SKIR3-3)
    if (BOON_OFF[f.code]) { const p0 = f.problems; f.problems = d => p0(d).filter(x => !/challenge boon/.test(x)); f.legal = d => !f.problems(d).length; }
    if (f.legal(f.n.deck)) continue;
    const usage = {}; F.filter(g => g !== f).forEach(g => Object.keys(g.n.deck).forEach(id => { if (!g.keep.has(id)) usage[id] = (usage[id] || 0) + 1; }));
    const want = {}; Object.entries(f.n.deck).forEach(([id, k]) => { if (f.pool.includes(id)) want[id] = k; });
    const R = rng('skir3|' + f.code), weight = id => Math.pow(0.45, usage[id] || 0) * (1 + 0.2 * R());
    const avoidFor = slack => (d, id) => { const pf = fam[B.family(id)] === 2 ? B.family(id) : null; if (pf && !f.keep.has(id) && Object.keys(d).some(x => x !== id && B.family(x) === pf)) return true; return !f.keep.has(id) && (usage[id] || 0) >= ucap + slack; };
    let d = null, t = 0; for (; t < 40 && !d; t++) d = B.fill(f, want, weight, R, avoidFor(t < 20 ? 0 : t < 30 ? 1 : 3));
    const row = { code: f.code, map: m.id, mapNo: f.mapNo, side: f.side, before: f.n.deck, after: d ? sorted(d) : null, slack: d ? (t <= 20 ? 0 : t <= 30 ? 1 : 3) : null, problems: d ? [] : (B.fill.last || ['no legal deck']) };
    rows.push(row); console.log(`${f.code.padEnd(8)} ${d ? JSON.stringify(row.after) : 'PROBLEMS ' + row.problems.join('; ')}`);
    if (!d) continue;
    f.n.deck = row.after;
    if (APPLY) { const re = new RegExp(`^(\\s*\\{ ?key:\\s*"${f.code.replace(/-/g, '\\-')}",.*)$`, 'm'), mm = s.match(re); if (!mm) throw new Error('no line ' + f.code);
      s = s.replace(mm[1], mm[1].replace(/deck:\{[^}]*\}/, 'deck:' + JSON.stringify(row.after) + ` /* 2026-11-12 (SKIR3): refilled on the owner's 11-12 list (SKIR1's builder from its cards still listed: ${Object.keys(want).join(', ') || 'none'}); deck (was ${JSON.stringify(row.before)}) */`)); }
  }
}
if (APPLY) { fs.writeFileSync(APP + '.skir3tmp', s); fs.renameSync(APP + '.skir3tmp', APP);
  fs.writeFileSync(path.join(ROOT, 'docs', 'balance', 'skir3', 'refill-2026-11-12.json'), JSON.stringify({ about: 'SKIR3 refills (tools/skir3/refill_2026_11_12.js)', rows }, null, 1) + '\n'); }
console.log(rows.length, 'fights', rows.filter(r => !r.after).length, 'without a legal deck', APPLY ? 'written' : '(dry run)');
