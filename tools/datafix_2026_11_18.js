#!/usr/bin/env node
// Package DATAFIX (2026-11-18): the data TESTFIX's triage found against standing rules. One dated pass: card edits (budget-checked) + list edits.
//   node tools/datafix_2026_11_18.js [apply]
'use strict';
const fs = require('fs'), path = require('path'), ROOT = path.join(__dirname, '..');
const L = require('./datafix_lib_2026_11_18.js'), FMP = require('./fold_map_pools.js');
const apply = process.argv.includes('apply');
const cards = L.load(), by = Object.fromEntries(cards.map(c => [c.id, c]));
const D = '2026-11-18 (DATAFIX)';
const edit = (id, why, f, fit) => { const c = by[id], was = L.use(c), h0 = c.health; f(c); if (fit) while (!L.use(c).ok && c.health > 1) c.health--; if (c.health !== h0 && fit) why += ` Re-fit ${c.attack}/${h0} -> ${c.attack}/${c.health}.`; const now = L.use(c); c.creatorNote = (c.creatorNote ? c.creatorNote + ' ' : '') + `${D}: ${why}`;
  console.log(`${id.padEnd(22)} ${c.attack}/${c.health} ok=${now.ok} use ${was.use} -> ${now.use}`); if (!now.ok && was.ok) throw new Error(id + ' left the budget'); };

// 1. Stone before Map 21 (SKIR1): Lumber at the same price
edit('phoenix-mushrooms', 'cost 1 + Stone 1 -> Lumber 2 (SKIR1: no Stone before Map 21); the Map 7 list is Rare at most, so Epic -> Rare, re-fit.', c => { c.cost = 2; delete c.stoneCost; c.rarity = 'rare'; }, true);
edit('pumice-beetle', 'On Spawn gains 2 Lumber instead of 2 Stone (SKIR1: no Stone before Map 21).', c => { c.effects.triggers[0].resource = 'lumber'; }, true);
edit('caldera-wyrm', 'cost 0 + Stone 2 + Metal 1 -> Lumber 3 (SKIR1: no Stone before Map 21; the leader of 20-B-4 is a Map 20 card).', c => { c.cost = 3; delete c.stoneCost; delete c.metalCost; });
// 3. identical lines (CONTENT11-1): one small stat step each, inside the budget
edit('barrel-cactus', '1/18 -> 1/19 (the Strangler Vine had the same line; Content12 no identical lines).', c => { c.health = 19; });
edit('plains-zebra', '1/7 -> 1/9 (the Snowshoe Hare had the same line; the Mountain Goat Climber is 1/8).', c => { c.health = 9; });
edit('hedgerow-shrew', '2/5 -> 2/4 (the Dormouse, the owner\'s FOLD5 card, had the same line; the owner-set card is left alone).', c => { c.health = 4; });
edit('fishing-cat', '1/14 -> 1/15 (the Pine Marten had the same line).', c => { c.health = 15; });
// 4. over 2.5 skills (BF5)
edit('dust-hyena', 'Pack dropped (Pack + Carnage + Lumber on kill was three skills), 2/5 -> 2/6.', c => { delete c.effects.pack; c.health = 6; });
edit('barrow-leech-bat', 'Sap dropped (Flying + Nocturnal + Parasite + Sap was too many), 1/8 -> 1/9.', c => { delete c.effects.sap; c.health = 9; });
// 5. the reward moves put two cards on early lists as their first map (card-pass: over the budget there): Health down to the line
edit('fawn-scout', '2/5 -> 2/4: its 13-1 slot moved; first listed on Map 12 now (Pack 2), where 2/5 read over the budget.', c => { c.health = 4; });
edit('pika-hoarder', '3/7 -> 2/5: its 21-1 slot moved; first listed on Map 3 now (Pack 1), where 3/7 read 1.37 of N.', c => { c.attack = 2; c.health = 5; });
// the Wyrm and the shrew-twin edits above keep their stats' budget as they were; a card already over stays listed (caldera-wyrm, see report)

// lists
const pf = path.join(ROOT, 'canonical', 'map-pools.json'), doc = JSON.parse(fs.readFileSync(pf, 'utf8')), P = doc.maps;
const add = (m, tier, id) => { const a = tier === 'cards' ? P[m].cards : P[m][tier]; if (!a.includes(id)) a.push(id); };
const del = (m, id) => { const a = P[m].cards, i = a.indexOf(id); if (i < 0) throw new Error(m + ' lacks ' + id); a.splice(i, 1); };
const toSpecial = (m, id) => { del(m, id); add(m, 'special', id); }; // N221: the MAP tier is capped at 23; the overflow card stays in the map's fights through its SPECIAL list
add('mw', 'cards', 'cypress-root-lurker');   // JJ28: a defender (Guardian) on Map 5 (its own Pack 1 card)
add('m7', 'cards', 'fiddler-crab-swarm');    // JJ28: a defender (Guardian) on Map 10
add('mw', 'special', 'constrictor-coil');    // REFIT4-2 a: 5-3's venomGlands boon
del('m2', 'dolphin-knight');                 // opt2: Rare over Map 4's cap (it stays on Pebble Beach, owner HH6)
['ur-elk', 'cinder-hornet', 'pumice-beetle'].forEach(id => toSpecial('m21', id));                      // N221: 26 -> 23 (the MAP tier; they stay on Map 21's SPECIAL list)
['glacier-yak', 'fumarole-ibex', 'obsidian-scorpion', 'ash-cloud-condor', 'ravenous-wolverine'].forEach(id => toSpecial('m22', id)); // 27 -> 22 (+ the pending Petrified Tree = 23)
['pack-mule', 'lodge-engineer'].forEach(id => toSpecial('m23', id));                                   // 25 -> 23
if (apply) { L.save(cards); fs.writeFileSync(pf, FMP.serialize(doc)); console.log('applied'); }
