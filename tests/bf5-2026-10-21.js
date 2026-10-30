#!/usr/bin/env node
// Package BF5 (2026-10-19 owner 21:36 "HALF everything" = the total N; the 10-21 rulings): pins the halving, the N multipliers, the
// two-skill rule, the owner's ants, the re-derive (every live card inside the band or a listed owner call), the halved brambles at fight
// build (raids.json full-size), the fold of the owner's later live edits and the proposed (not applied) SQL.
'use strict';
const fs = require('fs'), path = require('path');
const ROOT = path.join(__dirname, '..'), read = p=> fs.readFileSync(path.join(ROOT, p), 'utf8');
let pass = 0, fail = 0; const ok = (c, m)=>{ if(c) pass++; else { fail++; console.log('  ✗ ' + m); } };
const BB = require(path.join(ROOT, 'bramblewood-budget.js'));
const table = JSON.parse(read('canonical/skill-costs.json')), cards = JSON.parse(read('canonical/cards.json')), byId = Object.fromEntries(cards.map(c=> [c.id, c]));
const src = read('arena_app.js');

// 1. N halved, one constant; S unchanged; Bounty 1
// 2026-10-31 (package BUDGET2, owner RECOST1-6: 3A + H): the whole N x scale 1.13 on top of BF6's halved coefficients (fitted to keep the
// in-play cards' median cap-1 use); base 10 stays
const K = BB.DEFAULTS.scale;
ok(K === 1.13 && table.budget.scale === K && BB.DEFAULTS.base === 10 && table.budget.base === 10, '1. BF6 (owner 15:09): the coefficients halved instead of N x 0.5 (base 10) in bramblewood-budget.js DEFAULTS and the skill-costs budget line; BUDGET2: scale 1.13');
ok(Math.abs(BB.nAt(11, 1) - K * (11 + 1 / 15) * (1 + 1 / 30)) < 0.011, `1. BF6: nAt(11, 1) = 1.13 x (Base + 1/15)(1 + 1/30) (${BB.nAt(11, 1)})`);
ok(Math.abs(BB.nAt(11, 0) - K * 10) < 0.011, '1. BF6: Level 0 is 1.13 x (Base - 1)');
const bounty = [].concat(table.skills || [], table.triggers || []).find(s=> s.id === 'bounty');
ok(bounty && bounty.value === 1, `1. Bounty 1 a point (owner 21:36: "Let bounty N = N * 2"; got ${bounty && bounty.value})`);

// 2. the N multipliers (named constants; shown in the budget panel and the Test Lab)
ok(BB.DEFAULTS.plainBonus === 1.05 && BB.DEFAULTS.lightBonus === 1.02 && BB.DEFAULTS.fragileUse === 0.7, '2. plainBonus 1.05, lightBonus 1.02, fragileUse 0.7 (BF7, 2026-10-22: Fragile is no longer an N multiplier, fragileMult 0.75)');
ok(table.budget.plainBonus === 1.05 && table.budget.lightBonus === 1.02 && table.budget.fragileUse === 0.7, '2. the same in the skill-costs budget line');
ok(BB.nMultOf({}, BB.DEFAULTS) === 1.05, '2. no abilities: x1.05');
ok(BB.nMultOf({flying: true}, BB.DEFAULTS) === 1.02 && BB.nMultOf({tide: true, diurnal: true}, BB.DEFAULTS) === 1.02, '2. only Flying / Tide / time of day: x1.02');
ok(BB.nMultOf({flying: true, poison: 1}, BB.DEFAULTS) === 1, '2. a light ability beside another: x1');
ok(BB.nMultOf({flying: true, fragile: true}, BB.DEFAULTS) === 1 && BB.fragileUseOf({fragile: true}, BB.DEFAULTS) === 0.7 && BB.fragileUseOf({}, BB.DEFAULTS) === 1, '2. Fragile: no N multiplier (x1 with Flying), fragileUse x0.7 on the caps (BF7, 2026-10-22; was x0.75 on N)');
const vul = (table.skills || []).find(s=> s.id === 'vulnerable'); ok(vul && vul.value < 0, '2. passive Vulnerable is a negative skill value');
ok(/function sbNMultLine\(d\)/.test(src) && /ui\.budget-lab-nmult/.test(src), '2. the card editor\'s budget panel and the Test Lab show the multipliers');

// 3. two skills at most (special / thematic cards keep more); the owner's ants
const TS = JSON.parse(read('docs/balance/two-skills-2026-10-21.json'));
const SPECIAL = new Set(['epic', 'heroic', 'unique', 'questunique', 'legendary', 'mythic', 'ancient', 'divine', 'void', 'daemonic']);
const isEgg = c=> !!(c.easterEgg || (c.source && c.source.kind === 'easteregg'));
const THEMATIC = new Set(['puffball-bombardier' /* 2026-10-23 (package BL, call BL-4): Arrow, Poison and its fungal Bloom */]); // 2026-10-21 (HB2): named thematic exceptions to the two-skill rule; empty since TR (HB2-1's count: the Swordbill Challenger counts two)
const special = c=> SPECIAL.has(c.rarity) || isEgg(c) || c.token || !!(c.effects && c.effects.supreme) || !!c.hidden || THEMATIC.has(c.id);
const R = require(path.join(ROOT, 'tools', 'card_retune_2026_10_19.js')), PARAMS = BB.PARAMS.concat(['arrowCount', 'hunterVs']);
const over = cards.filter(c=> R.live(c) && !special(c) && BB.skillCountOf(c.effects, PARAMS) > 2); // 2026-10-21 (TR, owner HB2-1): plain Flying / Tide / Diurnal / Nocturnal don't count; several count 1
ok(!over.length, '3. no live, non-special card has more than two skills: ' + over.slice(0, 6).map(c=> c.id + ' ' + BB.abilitiesOf(c.effects, PARAMS).join('+')).join('; '));
ok(TS.cut >= 90 && TS.rows.filter(r=> r.dropped.length).every(r=> byId[r.id] && r.dropped.every(k=> !k.startsWith('trigger:') && ((byId[r.id].effects || {})[k] == null || /TR, owner HB2-1/.test(byId[r.id].creatorNote || '')) || k.startsWith('trigger:'))), `3. the record's ${TS.cut} cuts are in the cards (or given back by TR, HB2-1)`);
const sc = byId['ant-scout'], so = byId['soldier-ant'], tu = byId['tunnel-ant'];
ok(sc && JSON.stringify(Object.keys(sc.effects)) === '["swarm"]' && (sc.wait || 0) === 0 && (sc.cost || 0) === 0, '3. Ant Scout: Swarm alone, cheap (Wait 0, Lumber 0)');
ok(so && so.effects.swarm && so.effects.formation === 1 && so.wait === 1 && (so.cost || 0) === 0, '3. Soldier Ant: Swarm + Formation 1, Wait 1');
ok(tu && tu.effects.swarm && tu.effects.ambush === 2 && tu.wait === 1 && tu.cost === 1, '3. Tunnel Ant: Swarm + Ambush 2, Wait 1, Lumber 1');
ok(byId['giant-cave-huntsman'].effects.poison != null && byId['giant-cave-huntsman'].effects.pounce != null, '3. the owner\'s scary spider keeps Poison + Pounce');
ok(byId['moon-jelly'].effects.moonpull != null && byId['moon-jelly'].effects.tide, '3. Moon Jelly keeps Tide + Moonpull');

// 4. every live card re-derived: inside the band, or a listed owner call
const SC = require(path.join(ROOT, 'tools', 'skill_costs.js')), T = SC.make(table);
const P = JSON.parse(read('docs/balance/halve-plan-2026-10-19.json')), ownerIds = new Set(P.rows.filter(r=> r.verdict === 'owner' || r.verdict === 'target').map(r=> r.id));
const bad = [];
cards.filter(R.live).forEach(c=>{ const b = T.budget(c, {level: 1}); if(!(b.ok && !b.missing.length) && !ownerIds.has(c.id) && !(c.id === 'caldera-wyrm')) bad.push(`${c.id} ${c.attack}/${c.health} x1 ${b.x1} N ${b.N}`); });
ok(!bad.length, '4. every live card fits the halved budget at Level 1, or is a listed owner call: ' + bad.slice(0, 6).join('; '));
const under = cards.filter(R.live).filter(c=>{ const b = T.budget(c, {level: 1}); return b.ok && b.x1 / b.N <= 0.6 && !ownerIds.has(c.id) && !P.prop.some(r=> r.id === c.id) && P.rows.some(r=> r.id === c.id && r.verdict === 'band'); });
ok(!under.length, '4. the re-derived cards sit over 60% of N: ' + under.slice(0, 6).map(c=> c.id).join(', '));
ok(P.owner === 16 && P.skillsFillN.length === 2, `4. the plan lists 16 owner calls (17 before main's obtain maps moved the Cinder Gecko into the band), 2 of them skills that alone fill N (${P.owner}, ${P.skillsFillN})`);
ok(byId['cave-bat-swarm'].attack === 1 && byId['cave-bat-swarm'].health === 2, '4. the Cave Bat Swarm is 1/2 (owner 21:36)');
ok(byId.terraumbra.attack === 1 && byId.terraumbra.health === 1, '4. Terraumbra (an equipment Easter egg, measured with its grant) is 1/1');

// 5. the brambles halved when a fight is built; the stored numbers stay full-size
ok(/const BRAMBLE_SCALE = 0\.5;/.test(src) && /function brambleHp\(v\)/.test(src), '5. BRAMBLE_SCALE 0.5 and brambleHp');
const raids = JSON.parse(read('canonical/raids.json')), g = raids.find(r=> r.id === 'goliath') || raids[0];
ok(g.bossHpBonusMax === 55 && g.shield === 50 && g.parts.some(p=> p.fight && p.fight.castleHp === 780), '5. raids.json keeps the full-size numbers: 780 (RAIDBAL1 2026-10-30; was 410, B12, BF6) / 55 / Shield 50');
ok(/function raidDefScaled\(def\)[\s\S]{0,600}shield: sh\(/.test(src), '5. raidDefScaled halves the raid bramble\'s Shield too (MX, merged in BF5)');
ok((src.match(/RaidM\.raidShield\(raidDefScaled\(def\), st, (partId|ps\.id)\)/g) || []).length === 3, '5. every raid Shield the game builds or shows goes through raidDefScaled');

// 6. the owner's later live edits folded; the SQL prepared, not applied
const F = JSON.parse(read('docs/balance/server-overrides/fold-plan-2026-10-21.json'));
ok(F.rows.length === 13, `6. the fold plan holds the owner's 13 card edits (${F.rows.length})`);
const OE = JSON.parse(read('docs/balance/owner-edits-bf5-2026-10-21.json'));
ok(OE.rows.length === 13 && OE.rows.every(r=> byId[r.id] && byId[r.id].attack === r.now.stats[0] && byId[r.id].health === r.now.stats[1]), '6. the owner-edit evaluation matches the cards as they are now');
ok(F.rows.every(r=> /2026-10-21 \(BF5\): the owner's live edit of/.test(byId[r.id].creatorNote || '')), '6. each folded card notes the owner\'s edit');
const sql = read('supabase/proposed/20261021_clear_folded_overrides_2.sql');
ok(/card_overrides_backup_20261021/.test(sql) && /__cfg:raid:goliath/.test(sql) && /__cfg:tutorial/.test(sql), '6. the proposed SQL backs up and clears the folded rows (cards, nodes, tutorial, raid)');

// 7. docs
const md = read('docs/balance/halve-2026-10-19.md');
ok(/## The 10-21 rulings/.test(md) && /## The owner's 13 live edits/.test(md) && /## Two skills at most/.test(md) && /## The raid, re-measured/.test(md), '7. the halve doc has the 10-21 rulings, the owner\'s edits, the two-skill list and the raid');
ok(/Limit break balances a card to the next series/.test(md) && /Map × 0\.2 term stays/.test(md), '7. the doc keeps the Map x 0.2 term and notes the limit break');
console.log(`bf5-2026-10-21: ${pass} passed, ${fail} failed`); process.exit(fail ? 1 : 0);
