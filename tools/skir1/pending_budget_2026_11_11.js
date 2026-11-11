#!/usr/bin/env node
// 2026-11-11 (package SKIR1, phase A): the listed cards SKIR1's lists put over their budget (card-pass-2026-10-19 check 1 after the fold and
// `node tools/forge_curve_2026_10_19.js maps`: each was out of play or on a later map before). Card stats are the owner's (BAL-ROLES), so they
// wait for his re-fit step like LISTFIX1's (tools/lib_map_pools.js budgetHold reads this file as 'pending'). Writes each card's readings.
//   node tools/skir1/pending_budget_2026_11_11.js   -> docs/balance/skir1/pending-budget-2026-11-11.json
'use strict';
const fs = require('fs'), path = require('path');
const ROOT = path.resolve(__dirname, '..', '..');
const SC = require('../skill_costs.js'), SCN = SC.make(JSON.parse(fs.readFileSync(path.join(ROOT, 'canonical', 'skill-costs.json'), 'utf8')));
const OBT = JSON.parse(fs.readFileSync(path.join(ROOT, 'canonical', 'card-obtain-maps.json'), 'utf8')).maps || {};
const CARDS = {}; JSON.parse(fs.readFileSync(path.join(ROOT, 'canonical', 'cards.json'), 'utf8')).forEach(c => { CARDS[c.id] = c; });
const LISTS = JSON.parse(fs.readFileSync(path.join(ROOT, 'docs', 'balance', 'skir1', 'lists-2026-11-11.json'), 'utf8'));
const IDS = ['moray-ambusher', 'raccoon-nightcrew', 'mudpuppy', 'planarian-splitter', 'peat-cutter-vole'];
const where = id => Object.entries(LISTS.main).filter(([, r]) => r.list.includes(id)).map(([k, r]) => `Map ${r.mapNo} (${k})`)
  .concat(Object.entries(LISTS.submaps).filter(([, r]) => r.list.includes(id)).map(([k, r]) => `${r.name} (${k})`));
const cards = IDS.map(id => { const c = CARDS[id], b1 = SCN.budget(c, { level: 1 }), bl = SCN.budget(c, { level: SC.levelOf(c) });
  return { id, name: c.name, rarity: c.rarity, stats: `${c.attack}/${c.health}`, cost: c.cost || 0, wait: c.wait || 0, obtainMap: OBT[id], lists: where(id),
    level1: { x1: b1.x1, N: b1.N, x2: b1.x2, N2: b1.N2, ok: b1.ok }, ownLevel: { level: SC.levelOf(c), x1: bl.x1, N: bl.N, ok: bl.ok } }; });
const out = { _about: 'SKIR1 (2026-11-11): cards on a SKIR1 list over their first map\'s budget; they wait for the owner\'s re-fit step (tools/lib_map_pools.js budgetHold "pending"). No stat was changed.', built: '2026-11-11', count: cards.length, cards };
fs.writeFileSync(path.join(ROOT, 'docs', 'balance', 'skir1', 'pending-budget-2026-11-11.json'), JSON.stringify(out, null, 1) + '\n');
cards.forEach(c => console.log(c.id.padEnd(20), c.stats, 'map', c.obtainMap, 'L1', c.level1.x1, '<=', c.level1.N, c.level1.ok ? 'ok' : 'OVER', '|', c.lists.join(', ')));
