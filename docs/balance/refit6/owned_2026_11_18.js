#!/usr/bin/env node
// 2026-11-18 (package REFIT6): which cards of each Map reference deck (arena_app.js WINRATE_REF_DECKS.road) a player does not own on that
// map. "Owned" as tools/skirmish_pass.js ownedAt (the pool the `decks` command builds from): base cards plus every earlier main map's
// reward cards, no packs. Also checks docs/balance/skirmish-pass-decks.json (the report `decks` starts each map from).
//   node docs/balance/refit6/owned_2026_11_18.js [--maxmap=20] [--json]
'use strict';
const path = require('path'), fs = require('fs'), ROOT = path.resolve(__dirname, '..', '..', '..');
const B = require(path.join(ROOT, 'tools', 'lib_bramble.js')), G = B.G;
const a = process.argv.slice(2), MAX = +((a.find(x => x.startsWith('--maxmap=')) || '--maxmap=20').slice(9));
const playable = c => c && !c.token && !c.test && !c.hallOfFame && !c.hero && c.cardType !== 'materia' && c.cardType !== 'equipment' && c.id !== 'wandering-traveller' && c.id !== 'missingno' && !(c.effects||{}).leader && !(c.archetypes||[]).includes('Leader') && !(c.source && c.source.kind === 'secret');
const mains = G.CONQUEST_MAPS.filter(m => !m.sub);
function ownedAt(no){ const s = new Set(); G.resetOverlay(); const defs = G.getCardDefs();
  Object.keys(defs).forEach(id => { const d = defs[id]; if (playable(d) && (G.cardSourceOf ? G.cardSourceOf(d).kind : 'base') === 'base') s.add(id); });
  for (const m of mains.slice(0, no)) m.nodes.forEach(n => G.nodeRewardCardIds(m.id, n.key).forEach(id => s.add(id)));
  return new Set([...s].filter(id => playable(defs[id]))); }
let rep = {}; try { rep = JSON.parse(fs.readFileSync(path.join(ROOT, 'docs/balance/skirmish-pass-decks.json'), 'utf8')).road || {}; } catch (e) {}
const out = {};
for (let no = 0; no <= MAX; no++) { const d = G.WINRATE_REF_DECKS.road[no]; if (!d) continue; const own = ownedAt(no);
  const bad = Object.keys(d).filter(id => !own.has(id)), r = rep[no] ? Object.fromEntries(rep[no].cards.map(c => [c.id, c.n])) : null;
  const same = r && JSON.stringify(Object.entries(r).sort()) === JSON.stringify(Object.entries(d).sort());
  out[no] = {bad, size: Object.values(d).reduce((x, y) => x + y, 0), reportSame: !!same, reportBad: r ? Object.keys(r).filter(id => !own.has(id)) : null};
  if (!a.includes('--json')) console.log(`Map ${no}: ${out[no].size} cards, ${bad.length ? 'NOT OWNED ' + bad.join(' ') : 'all owned'}; report ${same ? 'same' : 'differs' + (out[no].reportBad && out[no].reportBad.length ? ' (unowned ' + out[no].reportBad.join(' ') + ')' : '')}`); }
if (a.includes('--json')) console.log(JSON.stringify(out));
