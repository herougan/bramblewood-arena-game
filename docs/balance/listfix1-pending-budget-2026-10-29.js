#!/usr/bin/env node
// 2026-10-29 LISTFIX1 (decision APPLY1-2; owner 22:47 "Don't worry about the other cards"): the cards on a map list (in play) that are over
// their budget for their first map (the budget at the card's start level, tools/skill_costs.js with canonical/card-obtain-maps.json, as the
// hub prices it). Re-fitting them is the owner's step 3 (per-card balance), so they wait here, and the budget checks that would fail on
// them (card-pool, en2, en4, en5, en6, eng10, eng12, content2, content3) report them as "pending step 3" instead. Cards out of play (on no
// list, not in pack-extras, given by nothing else: tools/lib_map_pools.js isOutOfPlay) are not here: the checks skip them as "unplaced".
// When a card is re-fitted, run this again: it leaves the list.
//   node docs/balance/listfix1-pending-budget-2026-10-29.js [--write]
'use strict';
const fs = require('fs'), path = require('path');
const ROOT = path.join(__dirname, '..', '..');
const B = require(path.join(ROOT, 'tools', 'lib_bramble.js')), G = B.G, D = B.CARD_DEFS_BASELINE;
const L = require(path.join(ROOT, 'tools', 'lib_map_pools.js'));
const SC = require(path.join(ROOT, 'tools', 'skill_costs.js'));
const T = SC.make(JSON.parse(fs.readFileSync(path.join(ROOT, 'canonical', 'skill-costs.json'), 'utf8')));
const cards = JSON.parse(fs.readFileSync(path.join(ROOT, 'canonical', 'cards.json'), 'utf8'));
const OUT = path.join(ROOT, 'docs', 'balance', 'listfix1-pending-budget-2026-10-29.json');
const rows = [];
cards.forEach(c=>{
  const d = D[c.id]; if(!d || c.pool || c.token || c.test || c.easterEgg || !SC.measured(c)) return;
  if(L.isOutOfPlay(G, d)) return;
  const f = G.cardFirstMapList(d); if(!f) return; // on a list
  const b = T.budget(c), b1 = T.budget(c, {level: 1});
  if(b.ok && b1.ok) return;
  rows.push({id: c.id, name: c.name, rarity: c.rarity || 'common', firstList: f.loc, map: G.cardObtainMap(d), stats: `${c.attack || 0}/${c.health}`,
    x1: b.ok ? b1.x1 : b.x1, N: b.ok ? b1.N : b.N, at: b.ok ? 'level 1' : 'start level'});
});
const out = {_about: 'LISTFIX1 (2026-10-29): cards on a map list that are over their budget for their first map, waiting for the owner\'s step 3 (re-fit). '
  + 'The budget checks report these as pending instead of failing. Built by node docs/balance/listfix1-pending-budget-2026-10-29.js --write.',
  built: '2026-10-29', count: rows.length, cards: rows};
console.log(`${rows.length} listed cards over budget for their first map:`, rows.map(r=> `${r.id} (${r.firstList}, Map ${r.map}, ${r.x1} > ${r.N})`).join(', '));
if(process.argv.includes('--write')){ fs.writeFileSync(OUT, JSON.stringify(out, null, 1) + '\n'); console.log('wrote', path.relative(ROOT, OUT)); }
