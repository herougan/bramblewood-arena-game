#!/usr/bin/env node
// 2026-11-02 (package BAL9; owner 11-02 00:18 JJ28: "more defenders (Bulwark and similar) as an important part of strategy: measure how many
// defender cards each map list and deck holds, propose where to add or retune defenders (Bulwark's worth included)").
//   node tools/bal9/defenders_2026_11_02.js [--apply]   -> docs/balance/bal9/defenders-plan-2026-11-02.json (+ the density report
//                                                         docs/balance/bal9/defenders-2026-11-02.json, tools/bal9/decks_2026_11_02.js defenders)
// THE RULE (Claude's call, owner: "you decide"): each main map 1-19 whose own list (MAP tier + SPECIAL) holds no defender gets ONE: the list's
// best wall gains Guardian (it steps in for an adjacent ally's plain swings while Ready). The wall: a card of the map's MAP tier, not Base,
// not a leader, not an owner-named card, with at most one counted skill (Flying, Tide and the time-of-day skills don't count, owner HB2-1),
// Health 8 or more and Attack / Health at most 0.4 (a wall or balanced body); the most Health first, then the lowest Attack. Guardian is
// priced 0 (measured -0.41 [-0.74, -0.11] on the canon's carriers, SKILL2), so no stats move; the cap check is re-read after. Map 0 (the
// new player's first fights, BAL7-2) and the side maps are left out.
'use strict';
const fs = require('fs'), path = require('path');
const L = require('./lib_bal9.js'), ROOT = L.ROOT;
const { G, D, LP, pools } = L.game();
const DK = require('./decks_2026_11_02.js');
const CFG = L.readJson('tools/pipeline/config.json');
const FREE = new Set(['flying', 'tide', 'diurnal', 'nocturnal', 'crepuscular']);
const counted = e => Object.keys(e || {}).filter(k => !FREE.has(k) && e[k] !== false && e[k] != null);
const maps = G.CONQUEST_MAPS.filter(m => !m.sub && !m.reserved && G.mapNumberOf(m.id) >= 1 && G.mapNumberOf(m.id) <= 19).sort((a, b) => G.mapNumberOf(a.id) - G.mapNumberOf(b.id));
const plan = { _about: 'BAL9 JJ28 (2026-11-02): one Guardian wall for each main map 1-19 whose list has no defender; tools/bal9/defenders_2026_11_02.js', built: '2026-11-02', edits: [], none: [] };
for (const m of maps) {
  const e = LP.normalizeEntry(pools.maps[m.id] || {}), list = [...new Set(e.cards.concat(e.special))];
  if (list.some(id => DK.defenderKeysOf(id).length || plan.edits.some(x => x.id === id))) continue; // a card given Guardian on an earlier map counts
  const cand = e.cards.filter(id => { const d = D[id]; if (!d || d.token || d.health == null) return false; const s = G.cardSourceOf(d);
    if (s.kind === 'base' || (d.archetypes || []).includes('Leader') || CFG.refit.ownerCards.includes(id)) return false;
    if (counted(d.effects).length > 1 || (d.effects || {}).guardian) return false; const A = +d.attack || 0; return d.health >= 8 && A / d.health <= 0.4; })
    .sort((a, b) => D[b].health - D[a].health || (+D[a].attack || 0) - (+D[b].attack || 0) || (a < b ? -1 : 1));
  if (!cand.length) { plan.none.push({ map: G.mapNumberOf(m.id), id: m.id, name: m.name, why: 'no wall on its MAP tier fits the rule' }); continue; }
  const id = cand[0], d = D[id];
  plan.edits.push({ id, map: G.mapNumberOf(m.id), mapName: m.name, set: { effects: Object.assign({}, d.effects || {}, { guardian: true }) }, note: `+ Guardian (owner JJ28: more defenders): ${m.name} (Map ${G.mapNumberOf(m.id)}) had no defender on its list; its sturdiest wall (${d.attack}/${d.health}) now guards its neighbours. Guardian is priced 0 (SKILL2 measure -0.41), so its stats stay` });
}
L.writeJson(path.join(ROOT, 'docs', 'balance', 'bal9', 'defenders-plan-2026-11-02.json'), plan);
plan.edits.forEach(x => console.log(`Map ${String(x.map).padStart(2)} ${x.mapName.padEnd(22)} + Guardian: ${x.id} ${D[x.id].attack}/${D[x.id].health} ${JSON.stringify(D[x.id].effects)}`));
plan.none.forEach(x => console.log(`Map ${x.map} ${x.name}: ${x.why}`));
if (process.argv.includes('--apply')) { const cp = require('child_process'); const r = cp.spawnSync('python3', [path.join(__dirname, 'apply_cards_2026_11_02.py'), 'docs/balance/bal9/defenders-plan-2026-11-02.json'], { cwd: ROOT, encoding: 'utf8' }); process.stdout.write(r.stdout || ''); process.stderr.write(r.stderr || ''); }
