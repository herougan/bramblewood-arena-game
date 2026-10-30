#!/usr/bin/env node
// 2026-10-31 (package SKILL2, decision DECK1-2, owner 10-30 23:25: "OK. Rebuild BPRO with the DECK1 tool from the map's list only"): the
// BPRO decks (Basic Pro: only the map's own cards) rebuilt under DECK1's 6/4 rule with DECK1's focused search, from the map's current list
// only: no held cards and no card that is the map's only through a road fight's deck (THEME3 cut those from the lists).
//
//   node tools/opt/bpro2_2026_10_31.js plan [--maps 0-20]      per map: the list (DECK1's anchor), its focuses -> docs/balance/bpro2-2026-10-31.json
//   node tools/opt/bpro2_2026_10_31.js run --map mb [--force]  the focused search (tools/bench/bench.js deck) -> docs/balance/bpro2/bench-deck-mapNN-<id>-2026-10-31.json
//   node tools/opt/bpro2_2026_10_31.js run --maps 0-20 [--minutes 9]   every planned map not yet run; stops starting a new map after --minutes
//   node tools/opt/bpro2_2026_10_31.js apply [--dry]           canonical/pro-skirmishes.json: the decks become each map's `bpro`; the old BPRO decks go to `history`
//   node tools/opt/bpro2_2026_10_31.js check                   every BPRO deck: 20 cards, the caps, the 6/4 rule, every card on the map's list (exit 1 on a problem)
//
// The pool: tools/opt/deck1_2026_10_30.js deck1Pools(map).anchor (a main map's MAP tier, a side map's own SUBMAP list, + SPECIAL, within the
// map's rarity cap, no faction card). A map with no list inside its cap (the Old Bramble: its list is over its fights' Common cap) gets no
// BPRO deck; its old ones stay under history and it is reported. Focuses: DECK1's (tools/bench/deck.js focusesFor, priority stone / metal,
// economy, big, swarm, then the list's skill families; at most 3, then `open`), each fillable under 4 copies. Search budget 6,000 games a map
// (DECK1 used 12,000 over a pool of up to 25 cards; a list is 10-20), 24 games an entry for the score, seed 'bpro2', Level 1. Kept: decks
// at or above max(50%, the map's best - 15 points), at least 2, at most 4 (DECK1's rule).
'use strict';
const path = require('path'), fs = require('fs');
const ROOT = path.resolve(__dirname, '..', '..');
const O = require('./deckopt.js'), P = require('./pro_skirmishes.js'), T3 = require('../bench/deck.js'), D1 = require('./deck1_2026_10_30.js');
const DATE = '2026-10-31', PLAN = path.join(ROOT, 'docs', 'balance', 'bpro2-' + DATE + '.json'), OUTDIR = path.join(ROOT, 'docs', 'balance', 'bpro2');
const PRO_FILE = path.join(ROOT, 'canonical', 'pro-skirmishes.json');
const RULE = D1.RULE, MAX_FOCUS = 3, BUDGET = 6000, FINAL = 24, LEVEL = 1, HARD_GAP = 0.15;
const PRIORITY = ['stone/metal', 'economy', 'big', 'swarm'];
const uniq = a => [...new Set(a)];
function mapRange(spec) { if (spec == null) return null; const out = new Set(); String(spec).split(',').forEach(p => { const m = /^(\d+)-(\d+)$/.exec(p); if (m) { for (let i = +m[1]; i <= +m[2]; i++) out.add(i); } else out.add(+p); }); return out; }

function planMap(gm, map, rules) {
  const G = gm.G, p = D1.deck1Pools(gm, map), pool = p.anchor.slice().sort();
  const base = { id: map.id, num: G.mapNumberOf(map.id), side: map.sub ? map.parent : null, name: map.name, cap: p.cap, pool, anchorDropped: p.anchorDropped, fightOnly: p.fightOnly };
  if (!pool.length) return Object.assign(base, { focuses: [], none: 'no card of the list is inside the map\'s rarity cap (' + p.cap + ')' });
  const room = f => f.cards.reduce((t, id) => t + Math.min(RULE.maxCopies, O.capOf(gm, id)), 0);
  const total = pool.reduce((t, id) => t + Math.min(RULE.maxCopies, O.capOf(gm, id)), 0);
  if (total < RULE.size || pool.length < Math.ceil(RULE.size / RULE.maxCopies)) return Object.assign(base, { focuses: [], none: `the list cannot fill 20 cards under 6 different / 4 copies (${pool.length} cards, ${total} copies)` });
  const all = T3.focusesFor(gm, pool, rules, null), have = id => all.find(f => f.id === id), fit = f => f && f.cards && room(f) >= f.need;
  const chosen = PRIORITY.map(have).filter(fit), fam = all.filter(f => /^family:/.test(f.id) && fit(f));
  return Object.assign(base, { focuses: chosen.concat(fam).slice(0, MAX_FOCUS).map(f => f.id).concat(['open']), focusesAvailable: all.map(f => f.id) });
}
function readPlan() { return fs.existsSync(PLAN) ? JSON.parse(fs.readFileSync(PLAN, 'utf8')) : { about: null, maps: {} }; }
function writePlan(j) { fs.writeFileSync(PLAN, JSON.stringify(j, null, 1) + '\n'); }
const ABOUT = 'Package SKILL2 (2026-10-31, decision DECK1-2): per map the BPRO pool (the map\'s list + SPECIAL within its cap, DECK1\'s anchor), the focuses searched and the decks found. tools/opt/bpro2_2026_10_31.js; report docs/balance/skill2-2026-10-31.md.';
function outFileOf(gm, map) { return path.join(OUTDIR, `bench-deck-map${String(gm.G.mapNumberOf(map.id)).padStart(2, '0')}-${map.id}-${DATE}.json`); }
// the BPRO rule: the 6/4 rule and every card on the map's list (DECK1's anchor)
function bproProblems(gm, map, deck, pools) {
  const p = pools || D1.deck1Pools(gm, map), out = [], ids = Object.keys(deck).filter(id => deck[id] > 0);
  if (ids.length > RULE.maxUnique) out.push(`${ids.length} different cards (at most ${RULE.maxUnique})`);
  ids.forEach(id => { if (deck[id] > RULE.maxCopies) out.push(`${id} x${deck[id]} (at most ${RULE.maxCopies})`); if (!p.anchor.includes(id)) out.push(id + ': not on the map\'s list (' + (p.rule(id) || 'held, not listed') + ')'); });
  return out;
}

async function main(argv) {
  const cmd = argv[0], a = argv.slice(1), opt = {};
  while (a.length) { const k = a.shift(); if (k === '--maps' || k === '--map') opt.maps = a.shift(); else if (k === '--force') opt.force = true; else if (k === '--dry') opt.dry = true;
    else if (k === '--budget') opt.budget = +a.shift(); else if (k === '--minutes') opt.minutes = +a.shift(); else throw new Error('unknown option ' + k); }
  const gm = O.loadGame(ROOT), G = gm.G, rules = O.loadRules(ROOT);
  if (cmd === 'plan') {
    const j = readPlan(); j.about = ABOUT; j.rule = Object.assign({}, RULE, { level: LEVEL, budget: BUDGET, finalGames: FINAL, listOnly: true });
    for (const m of D1.mapsUpTo20(gm, mapRange(opt.maps))) { const old = j.maps[m.id] || {}; j.maps[m.id] = Object.assign(planMap(gm, m, rules), old.result ? { result: old.result } : {});
      const x = j.maps[m.id]; console.log(`${x.side ? '  side' : 'Map'} ${x.num} ${x.id} ${x.name}: list ${x.pool.length}; ${x.none ? 'NONE: ' + x.none : 'focuses ' + x.focuses.join(', ')}`); }
    writePlan(j); console.log('-> ' + path.relative(ROOT, PLAN)); return;
  }
  if (cmd === 'run') {
    const j = readPlan(); if (!opt.maps) throw new Error('run --map <id> | --maps 0-20');
    const maps = /^[\d,-]+$/.test(opt.maps) ? D1.mapsUpTo20(gm, mapRange(opt.maps)) : [G.CONQUEST_MAPS.find(m => m.id === opt.maps)];
    const t0 = Date.now();
    for (const m of maps) { const x = j.maps[m.id]; if (!x) throw new Error('no plan for ' + m.id + ' (run plan first)'); if (x.none) { console.log(m.id + ': no BPRO (' + x.none + ')'); continue; }
      const f = outFileOf(gm, m); if (fs.existsSync(f) && !opt.force) continue;
      if (opt.minutes && (Date.now() - t0) / 60000 > opt.minutes) { console.log(`stopping after ${opt.minutes} minutes: re-run to go on`); break; }
      await T3.main({ map: m.id, mode: 'map-true', pool: x.pool, anchor: null, focus: x.focuses, level: LEVEL, budget: opt.budget || BUDGET, finalGames: FINAL,
        maxUnique: RULE.maxUnique, maxCopies: RULE.maxCopies, size: RULE.size, seed: 'bpro2', workers: 2, out: OUTDIR, tag: DATE, quiet: true });
      console.log(m.id + ': done -> ' + path.relative(ROOT, f) + ' (' + Math.round((Date.now() - t0) / 1000) + ' s)'); }
    return;
  }
  if (cmd === 'apply') return apply(gm, opt);
  if (cmd === 'check') { const p = checkAll(gm); p.forEach(x => console.log('problem: ' + x)); console.log(p.length ? p.length + ' problem(s)' : 'ok'); if (p.length) process.exitCode = 1; return; }
  console.log(fs.readFileSync(__filename, 'utf8').split('\n').slice(1, 12).map(l => l.replace(/^\/\/ ?/, '')).join('\n'));
}

function apply(gm, opt) {
  const G = gm.G, j = readPlan(), file = JSON.parse(fs.readFileSync(PRO_FILE, 'utf8'));
  for (const m of D1.mapsUpTo20(gm, mapRange(opt.maps))) {
    const x = j.maps[m.id], old = file.maps[m.id]; if (!x || !old) { console.log(m.id + ': no plan or no PRO entry'); continue; }
    const isB2 = e => e.source && e.source.mode === 'bpro2', prevB = (old.bpro || []).filter(e => !isB2(e));
    const f = outFileOf(gm, m), entry = JSON.parse(JSON.stringify(old));
    let bpro = [];
    if (!x.none) { if (!fs.existsSync(f)) { console.log(m.id + ': no run yet'); continue; }
      const res = JSON.parse(fs.readFileSync(f, 'utf8')), best = res.decks[0].score, floor = Math.max(0.5, best - HARD_GAP);
      const decks = res.decks.filter((d, i) => i < 2 || d.score >= floor).slice(0, 4), prefix = P.proPrefix(gm, m);
      x.leftOut = res.decks.filter(d => !decks.includes(d)).map(d => ({ focus: d.focus, score: d.score, why: `under ${Math.round(floor * 1000) / 10}%` }));
      bpro = decks.map((d, i) => { const id = `${prefix}-BPRO-${i + 1}`, deck = Object.fromEntries(Object.keys(d.deck).sort().map(k => [k, d.deck[k]]));
        return { id, name: id, focus: d.focus, labels: d.labels, level: LEVEL, leaders: P.leadersFor(gm, m, deck), deck,
          source: { file: path.relative(ROOT, f), mode: 'bpro2', tool: res.tool, reproduce: res.reproduce, score: d.score, ci: d.ci, avgLumber: d.avgLumber, generated: res.generated }, h2h: null, later: [] }; });
      x.result = { file: path.relative(ROOT, f), bpro: bpro.map(p => ({ id: p.id, focus: p.focus, score: p.source.score, ci: p.source.ci, deck: p.deck, leaders: p.leaders })) }; }
    if (prevB.length) entry.history = (entry.history || []).concat([{ package: 'SKILL2', on: DATE, why: 'BPRO rebuilt under the 6/4 rule from the map\'s list only (decision DECK1-2)' + (x.none ? '; no new BPRO: ' + x.none : ''), bpro: prevB }]);
    entry.bpro = bpro;
    entry.notes = (entry.notes || []).filter(s => !/^SKILL2 BPRO: /.test(s)).concat(['SKILL2 BPRO: ' + (bpro.length ? bpro.length + ' focused decks from the map\'s list (' + bpro.map(p => p.id + ' ' + p.focus).join(', ') + ')' : 'none (' + x.none + ')') + '; the previous BPRO decks are under history']);
    file.maps[m.id] = entry;
    console.log(`${m.id}: ${bpro.length ? bpro.map(p => p.id + ' ' + p.focus + ' ' + p.source.score).join('; ') : 'no BPRO (' + x.none + ')'}`);
  }
  file.updated = DATE; file.bpro2 = { rule: Object.assign({}, RULE, { listOnly: true }), tool: 'tools/opt/bpro2_2026_10_31.js', note: 'BPRO decks of Maps 0-20 and their side maps with their own list rebuilt by SKILL2 (decision DECK1-2): 6 different cards, 4 copies, only the map\'s list.' };
  if (opt.dry) return;
  fs.writeFileSync(PRO_FILE, JSON.stringify(file, null, 1) + '\n'); writePlan(j); console.log('-> ' + path.relative(ROOT, PRO_FILE) + ' (rebuild the game to bake it in)');
}
function checkAll(gm) {
  const G = gm.G, file = JSON.parse(fs.readFileSync(PRO_FILE, 'utf8')), out = [];
  D1.mapsUpTo20(gm, null).forEach(m => { const ent = file.maps[m.id]; if (!ent) return; const pools = D1.deck1Pools(gm, m);
    (ent.bpro || []).forEach(e => { P.deckProblems(gm, e.deck, e.leaders).concat(bproProblems(gm, m, e.deck, pools)).forEach(p => out.push(`${e.id}: ${p}`));
      if (!e.focus) out.push(e.id + ': no focus'); if (!(e.source && e.source.mode === 'bpro2')) out.push(e.id + ': not a SKILL2 BPRO deck'); }); });
  return out;
}
module.exports = { planMap, bproProblems, checkAll, RULE };
if (require.main === module) main(process.argv.slice(2)).catch(e => { console.error(e && e.stack || e); process.exit(1); });
