#!/usr/bin/env node
// Package BAL7 (2026-10-28): M1 changed card stats, so a PRO / BPRO deck's showcase (the leader a PRO fight leads with from Map 2, the map
// rule G.nodeShowcaseId({deck})) moved on a few decks. This re-derives each entry's `leaders` in canonical/pro-skirmishes.json by that rule;
// the decks themselves are unchanged.   node tools/bal7_pro_leaders_2026_10_28.js [apply]
'use strict';
const fs = require('fs'), path = require('path'), ROOT = path.join(__dirname, '..');
const G = require('./lib_bramble.js').G, F = path.join(ROOT, 'canonical', 'pro-skirmishes.json'), data = JSON.parse(fs.readFileSync(F, 'utf8'));
const changed = [];
Object.entries(data.maps).forEach(([mid, ent])=>{ const no = G.mapNumberOf(mid);
  ['pro', 'bpro'].forEach(k=> (ent[k] || []).forEach(e=>{ const lead = no >= G.SKIRMISH_LEADER_FROM_MAP ? [G.nodeShowcaseId({deck: e.deck})] : [];
    if(JSON.stringify(e.leaders) !== JSON.stringify(lead)){ changed.push(`${e.id}: ${JSON.stringify(e.leaders)} -> ${JSON.stringify(lead)}`); e.leaders = lead; } })); });
changed.forEach(x=> console.log('  ' + x)); console.log(changed.length + ' leaders re-derived');
if(process.argv.includes('apply') && changed.length) fs.writeFileSync(F, JSON.stringify(data, null, 1) + '\n');
