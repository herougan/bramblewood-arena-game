#!/usr/bin/env node
// Package CONTENT12 (2026-11-06): the owner's live card_overrides edits folded into canonical/cards.json (CONTENT11-2 a), one job per card
// (CONTENT11-1 a), carriers for Relict / Meld / Immunity / Sequestration (CONTENT11-3 a) and Tally / Almanac / Onslaught / Riled (ENG22-1 a),
// the Shell cards re-fitted (FIX9-1 a), Delivery's home price (DELIV-1 a), 17-8 renamed (BAL16-2 a), Lilypad Reach's attackers (BAL18-1 b).
//   node tests/content12-2026-11-06.js
'use strict';
const fs = require('fs'), path = require('path');
const ROOT = path.join(__dirname, '..');
const J = f=> JSON.parse(fs.readFileSync(path.join(ROOT, f), 'utf8'));
const cards = J('canonical/cards.json').map(c=> c && require('../bramblewood-skillparams.js').expandDef(c)) /* ENG35 (2026-11-07): fused skills read as their flat keys */, by = Object.fromEntries(cards.map(c=> [c.id, c]));
const SC = require(path.join(ROOT, 'tools', 'skill_costs.js')), T = SC.make(J('canonical/skill-costs.json'));
const src = fs.readFileSync(path.join(ROOT, 'arena_app.js'), 'utf8');
let fail = 0, pass = 0; const ok = (c, m)=>{ if(c) pass++; else { fail++; console.log('  ✗ ' + m); } };
// 2026-11-12 (TESTFIX1): a card SKIR3 took off every list ('unplaced') or that waits for the owner's re-fit ('pending') is exempt from the band, as in every other budget check (LMP.budgetHold)
const inBand = id=>{ if(['unplaced', 'pending'].includes(require(path.join(ROOT, 'tools', 'lib_map_pools.js')).budgetHold(id))) return true; const b = T.budget(by[id], {}); return b && b.ok && !b.wellUnder; };

// 1. the fold: every plan row's result is in the file (stats and skills), the clear is only proposed
const plan = J('docs/balance/server-overrides/fold-plan-2026-11-06.json');
ok(plan.cards === 59 && plan.alreadyFolded.length === 9, 'fold plan: 59 rows to fold, 9 folded on 10-26');
const EDITED = new Set(J('docs/balance/content12-cards-2026-11-06.json').rows.map(r=> r.id));
plan.rows.filter(r=> !EDITED.has(r.id)).forEach(r=>{ const c = by[r.id];
  ok(c && c.attack === r.now[0] && c.health === r.now[1], `fold: ${r.id} is ${r.now.join('/')} (file ${c && c.attack}/${c && c.health})`);
  const srt = o=> JSON.stringify(Object.keys(o || {}).sort().reduce((m, k)=> (m[k] = o[k], m), {})); // ENG35 (2026-11-07): a fused skill comes back flat, its parts after the other keys
  ok(c && srt(c.effects) === srt(r.effects), `fold: ${r.id} effects`); });
ok(by['terrier-pup'].effects.guardian === true && by['terrier-pup'].health === 5, 'Terrier Pup 2/5 Guardian (owner 11-03)');
ok(by['field-mouse'].effects.pickpocket === 1, 'Field Mouse Pickpocket 1 (owner 11-05)');
ok(!by['driftwood-crab'].effects.delivery && by['driftwood-crab'].effects.crabClaws, 'Driftwood Crab: his On Attacked Lumber, no renamed Delivery');
ok(by['bee-knight'].name === 'Bee Warden', 'Bee Warden keeps its TEXT1-1 name');
// 2026-11-12 (TESTFIX1): the clearing SQL was applied (CONTENT12-4) and moved from supabase/proposed/ to supabase/oneoff/; read it from either place. Not a SKIR3 break.
const sqlP = ['proposed', 'oneoff'].map(d=> path.join(ROOT, 'supabase', d, '20261106_clear_folded_overrides_4.sql')).find(f=> fs.existsSync(f));
const sql = fs.readFileSync(sqlP, 'utf8');
ok(/(PROPOSED, NOT APPLIED|APPLIED 2026-11-06)/.test(sql) && /o\.updated_at = f\.at/.test(sql), 'clearing SQL is proposed / applied and matches on updated_at' /* 2026-11-12 (TESTFIX1): the header now says APPLIED (CONTENT12-4) */);
const cfg = J('tools/pipeline/config.json');
ok(['moon-jelly', 'old-sturgeon', 'fire-ant-raft', 'terrier-pup'].every(id=> cfg.refit.ownerCards.includes(id)), 'the folded cards are owner cards for the pipeline refit');

// 2. no two in-play non-starter cards share a whole line (CONTENT11-1)
const LMP = require(path.join(ROOT, 'tools', 'lib_map_pools.js'));
const sk = v=> Array.isArray(v) ? v.map(sk) : v && typeof v === 'object' ? Object.fromEntries(Object.keys(v).sort().map(k=> [k, sk(v[k])])) : v;
const seen = {}; cards.forEach(c=>{ if(c.token || c.test || c.pool || c.field || c.hidden || c.rarity === 'starter' || c.basic || c.attack == null || c.id === 'house-cat') return;
  if(LMP.budgetHold(c.id) === 'unplaced') return; const e = Object.assign({}, c.effects || {}); delete e.resist;
  const k = JSON.stringify([c.cost || 0, c.stoneCost || 0, c.metalCost || 0, c.wait || 0, c.attack, c.health, sk(e), sk(c.levelSkills || {})]); (seen[k] = seen[k] || []).push(c.id); });
const twins = Object.values(seen).filter(v=> v.length > 1); ok(!twins.length, 'no identical lines: ' + JSON.stringify(twins));

// 3. carriers, each in band
const CARRY = {'horseshoe-crab': 'relict', 'nautilus-drifter': 'relict', 'leafcutter-gardener': 'meld', 'coral-polyp-colony': 'meld', 'hedgehog-herbalist': 'immunity',
  'venomlord-serpent': 'immunity', 'poison-dart-croaker': 'sequestration', 'raven-scout': 'tally', 'cone-cutter-squirrel': 'almanac', 'bison-bulldozer': 'onslaught', 'boreal-elk': 'riled',
  'dormouse': 'nocturnal', 'torch': 'illuminate', 'meadow-frog': 'tide', 'caiman-hatchling': 'ambush', 'pike-lancer': 'pierce', 'dolphin-knight': 'sonar', 'irradiated-glow-wyrm': 'irradiated', 'mangrove-mudskipper': 'skitter'};
Object.entries(CARRY).forEach(([id, k])=>{ ok(by[id] && by[id].effects[k] != null, `${id} carries ${k}`); ok(inBand(id), `${id} in band`); });
ok(by['leafcutter-gardener'].effects.meld.quick === true && by['coral-polyp-colony'].effects.meld.armor === 1, 'Meld {Quick} / Meld {Armor 1}');
ok(!by['caiman-hatchling'].effects.quick && by['caiman-hatchling'].levelSkills['1'].ambush === 1 && !by['caiman-hatchling'].levelSkills['1'].quick, 'Caiman Hatchling: Ambush 1 at Level 1 too');
ok(!by['old-sturgeon'].effects.relict && !by['ant-warrior'].effects.meld && !by['fire-ant-raft'].effects.meld, 'the owner\'s cards were not given a skill');

// 4. Shell cards and the trims in band
['stalactite-golem', 'conch-crawler', 'malachite-golem', 'shellwright-apprentice', 'limpet-clinger', 'reefback-turtle', 'giant-clam', 'sawfish'].forEach(id=> ok(inBand(id), `${id} in band`));

// 5. Delivery's home price
ok((J('canonical/skill-costs.json').lumberHomeKeys || {}).keys.includes('delivery'), 'lumberHomeKeys lists delivery');
const parts = T.cardS(by['beaver-lumberjack'].effects, by['beaver-lumberjack']).parts.find(p=> p[1] === 'delivery');
ok(parts && /at home/.test(parts[3]), 'Beaver Lumberjack\'s Delivery is priced at home: ' + JSON.stringify(parts));
const gm = T.cardS(by['gravel-mole'].effects, by['gravel-mole']).parts.find(p=> p[1] === 'delivery');
ok(!gm || !/at home/.test(gm[3]), 'a Stone Delivery keeps its flat price');

// 6. 17-8 renamed, 12 packs
ok(/key:"17-8", kind:"boss", name:"The Walrus Icebreaker"/.test(src) && !/name:"The Glacial Ape-King"/.test(src), '17-8 is The Walrus Icebreaker');
['fr', 'de', 'es', 'it', 'pt', 'tl', 'ta', 'id', 'zh-Hans', 'zh-Hant', 'ja', 'ko'].forEach(code=>{ const p = J('lang/ui/' + code + '.json');
  ok(p['The Walrus Icebreaker'] && p['Beat the Walrus Icebreaker flawlessly…'], code + ': 17-8 name and hint'); });

// 7. Lilypad Reach's attackers
const mp = J('canonical/map-pools.json').maps.mb.submaps.mp;
// 2026-11-12 (TESTFIX1): SKIR3 cut the side lists to the map's own cards (Lilypad Reach: 3 NEW! + Carried); the rule BAL18-1 b guarded is "it has attackers", checked on the current list
ok(mp.filter(id=> by[id] && by[id].attack >= 2).length >= 3, 'Lilypad Reach lists at least 3 attackers (attack 2+): ' + mp.filter(id=> by[id] && by[id].attack >= 2).join(', '));

console.log(`content12: ${pass} passed, ${fail} failed`);
process.exit(fail ? 1 : 0);
