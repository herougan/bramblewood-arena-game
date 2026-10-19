#!/usr/bin/env node
// The 2026-10-19 candidate card pool (package AN, owner 23:04: "More thematic animals ... I'll pick and choose when balancing for a
// map (5–10 new cards per map — from skirmish-only rewards and pack), like pin cushions (uni = sea urchins) and sea snakes.
// (Temperate water-going mammals?) (Do the polar ones in advance — walruses and stuff.)"; 23:32: "We don't have a really scary
// spider. Not trapdoor or cute.").
// Each SPEC below becomes a card in canonical/cards.json marked "pool": true + "poolMap" + "poolSlot": not live (assemble_arena.py,
// the engine's pools, the ghost / auto-battle / deck tools and the card hash all skip it) until the owner places it from Admin's
// "Pool cards" filter. Names and flavour lines (12 languages) are in tools/i18n_2026_10_19_pool.py; the flavour is read from there.
//
//   node tools/card_pool_2026_10_19.js tune [shard/of]   measure each card (120 games, the card_balance.js yardstick) and step its
//                                                        stats into its rarity band inside budget v3 -> docs/balance/pool-tune-<shard>.json
//   node tools/card_pool_2026_10_19.js write             write the tuned cards (with their creatorNotes) into canonical/cards.json
//   node tools/card_pool_2026_10_19.js check             budget + win rate of the pool cards as written (no tuning)
'use strict';
const fs = require('fs'), path = require('path'), crypto = require('crypto');
const ROOT = path.join(__dirname, '..');
const GAMES = 120;

// [id, name, icon, rarity, lumber, wait, attack, health, species, archetypes, effects, poolMap, poolSlot, idea, extra]
// Rarity is within each map's skirmish cap (Maps 0-12: Rare; the taiga / tundra maps 16-17: Very Rare). Stats are the start of
// the tuning; `tune` moves Attack / Health only.
const S = (id, name, icon, rarity, cost, wait, attack, health, species, archetypes, effects, poolMap, poolSlot, idea, extra)=>
  ({id, name, icon, rarity, cost, wait, attack, health, species, archetypes, effects, poolMap, poolSlot, idea, extra: extra || {}});
const COLD = {resist: ['cold']};
const SPECS = [
  // ---- Map 0, Bramblewood Outskirts (m1): the river bank and the wood's edge
  S('water-vole', 'Water Vole', '🐀', 'common', 0, 0, 1, 5, ['Rodent'], ['River', 'Mouse'], {tide: true, evasive: true}, 'm1', 'skirmish', 'Temperate water mammal: the bank vole that plops into the river (Evasive) and swims (Tide).'),
  S('river-mink', 'River Mink', '🦦', 'uncommon', 1, 1, 4, 7, ['Mustelid'], ['River', 'Forest'], {tide: true, pounce: 2}, 'm1', 'skirmish', 'Temperate water mammal: a small fierce mustelid that swims (Tide) and lunges at what it sees (Pounce 2). Not an Otter-faction card.'),
  S('signal-crayfish', 'Signal Crayfish', '🦞', 'common', 1, 1, 2, 10, ['Crustacean'], ['River'], {armor: 1, crabClaws: true}, 'm1', 'pack', 'The invasive river crayfish with white claw patches: a shell (Armor 1) and pinching claws (Crab Claws).'),
  S('pine-marten', 'Pine Marten', '🦡', 'rare', 1, 1, 4, 8, ['Mustelid'], ['Forest'], {quick: true, pounce: 2}, 'm1', 'skirmish', 'The squirrel hunter that runs down trunks: Quick, Pounce 2.'),
  S('woodcock-lookout', 'Woodcock Lookout', '🐦', 'common', 0, 1, 1, 6, ['Bird'], ['Forest', 'Bird'], {crepuscular: 1, keenEye: true}, 'm1', 'pack', 'All-round eyes, out at dusk: Crepuscular 1 and Keen Eye.'),
  S('grass-snake', 'Grass Snake', '🐍', 'uncommon', 1, 1, 3, 8, ['Reptile'], ['River', 'Snake'], {tide: true, revive: true}, 'm1', 'skirmish', 'Britain\'s swimming snake that plays dead: Tide, and Revive (the first time it dies it comes back with 1 Health).'),
  // ---- Map 1, Thistlewood (mf): the meadow and its hedges
  S('ladybird-guard', 'Ladybird Guard', '🐞', 'common', 0, 0, 1, 6, ['Insect'], ['Insect', 'Field'], {guardian: true}, 'mf', 'skirmish', 'Warning colours that protect the row: Guardian.'),
  S('hedgerow-shrew', 'Hedgerow Shrew', '🐁', 'common', 0, 0, 2, 3, ['Mammal'], ['Field'], {quick: true}, 'mf', 'pack', 'Always in a hurry: Quick.'),
  S('stag-beetle', 'Stag Beetle', '🪲', 'rare', 1, 2, 5, 14, ['Insect'], ['Insect', 'Forest', 'Beetle'], {armor: 1, sweep: 1}, 'mf', 'skirmish', 'Antler jaws for wrestling: Armor 1, Cleave (Sweep) 1.'),
  S('slow-worm', 'Slow-worm', '🦎', 'common', 0, 1, 2, 6, ['Reptile'], ['Field', 'Reptile'], {revive: true}, 'mf', 'pack', 'The legless lizard that drops its tail: Revive (comes back once with 1 Health).'),
  S('robin-redbreast', 'Robin Redbreast', '🐦', 'uncommon', 0, 0, 2, 4, ['Bird'], ['Bird', 'Field'], {flying: true, diurnal: true}, 'mf', 'skirmish', 'The fierce garden robin: Flying, Diurnal.'),
  S('field-vole', 'Field Vole', '🐁', 'common', 0, 0, 1, 4, ['Rodent'], ['Field', 'Mouse'], {swarm: true}, 'mf', 'pack', 'Never just one: Swarm.'),
  // ---- Map 2, Pebble Beach (mb): rock pools and shingle
  S('pincushion-urchin', 'Pincushion Urchin', '🌰', 'common', 0, 1, 1, 10, ['Echinoderm'], ['Coastal', 'Ocean'], {thorns: 2, tide: true}, 'mb', 'skirmish', 'Owner\'s example ("pin cushions (uni = sea urchins)"): a spiny rock-pool urchin, Thorns 2 and Tide. No urchin emoji exists: the spiky chestnut 🌰 stands in.'),
  S('rock-pool-starfish', 'Rock Pool Starfish', '⭐', 'common', 0, 1, 1, 9, ['Echinoderm'], ['Coastal'], {regen: 2, tide: true}, 'mb', 'pack', 'Regrows its arms: Regen 2, Tide.'),
  S('oystercatcher', 'Oystercatcher', '🐦', 'common', 1, 1, 3, 7, ['Bird'], ['Coastal', 'Bird'], {flying: true, pierce: 2}, 'mb', 'pack', 'The shell-opening bill: Flying, Pierce 2 (ignores 2 Armor).'),
  S('sanderling', 'Sanderling', '🐦', 'common', 0, 0, 2, 3, ['Bird'], ['Coastal', 'Bird'], {tide: true, evasive: true}, 'mb', 'pack', 'Runs with the waves: Tide, Evasive.'),
  S('grey-seal-bull', 'Grey Seal Bull', '🦭', 'rare', 1, 2, 5, 16, ['Pinniped'], ['Coastal', 'Ocean'], {tide: true, guardian: true}, 'mb', 'skirmish', 'Temperate water mammal: the big bull guarding his pups on the shingle: Tide, Guardian.'),
  S('limpet-clinger', 'Limpet Clinger', '🐚', 'common', 0, 0, 1, 8, ['Mollusc'], ['Coastal'], {shell: 2, tide: true}, 'mb', 'pack', 'Clamps down: Shell 2, Tide.'),
  // ---- Map 3, Gannet Cliffs (mc): the seabird cliffs
  S('puffin-diver', 'Puffin Diver', '🦜', 'common', 1, 1, 3, 8, ['Bird'], ['Coastal', 'Bird'], {flying: true, tide: true}, 'mc', 'skirmish', 'The sea parrot (🦜) that flies and dives: Flying, Tide.'),
  S('razorbill', 'Razorbill', '🐦', 'uncommon', 1, 1, 4, 8, ['Bird'], ['Coastal', 'Bird'], {flying: true, bleed: 1}, 'mc', 'pack', 'A bill like a razor: Flying, Bleed 1.'),
  S('kittiwake-flock', 'Kittiwake Flock', '🕊️', 'common', 0, 0, 1, 4, ['Bird'], ['Coastal', 'Bird'], {flying: true, swarm: true}, 'mc', 'pack', 'A colony of gulls: Flying, Swarm.'),
  S('peregrine-stooper', 'Peregrine Stooper', '🦅', 'rare', 1, 1, 4, 7, ['Bird'], ['Mountain', 'Bird'], {flying: true, quick: true, pounce: 2}, 'mc', 'skirmish', 'The fastest dive alive: Flying, Quick, Pounce 2.'),
  S('fulmar-spitter', 'Fulmar Spitter', '🪶', 'uncommon', 1, 1, 2, 9, ['Bird'], ['Coastal', 'Bird'], {flying: true, thorns: 2}, 'mc', 'skirmish', 'Spits stinking oil at anything that comes close: Flying, Thorns 2.'),
  S('red-billed-chough', 'Red-billed Chough', '🐦‍⬛', 'common', 0, 1, 2, 6, ['Bird'], ['Mountain', 'Bird', 'Raven'], {flying: true, mountainClimber: true}, 'mc', 'pack', 'The cliff-tumbling crow: Flying, Mountain Climber.'),
  // ---- Map 4, Sunken Hollow (m2): the flooded lake
  S('muskrat-lodgekeeper', 'Muskrat Lodgekeeper', '🦫', 'uncommon', 1, 2, 3, 16, ['Rodent'], ['River', 'Pond'], {tide: true, bulwark: 1}, 'm2', 'skirmish', 'Temperate water mammal: the reed lodge (Bulwark 1: your bramble takes 1 less per hit), Tide.'),
  S('water-shrew', 'Water Shrew', '🐁', 'common', 0, 0, 2, 4, ['Mammal'], ['River'], {tide: true, venomous: 1}, 'm2', 'pack', 'Temperate water mammal with a venomous bite: Tide, Venomous 1.'),
  S('pyrenean-desman', 'Pyrenean Desman', '🐀', 'uncommon', 0, 1, 2, 7, ['Mammal'], ['River'], {tide: true, keenSense: true}, 'm2', 'skirmish', 'Temperate water mammal: the near-blind trunked swimmer that hunts by touch: Tide, Keen Sense.'),
  S('great-crested-grebe', 'Great Crested Grebe', '🦆', 'common', 1, 1, 3, 8, ['Bird'], ['River', 'Bird'], {tide: true, evasive: true}, 'm2', 'pack', 'Sinks instead of flying: Tide, Evasive.'),
  S('old-sturgeon', 'Old Sturgeon', '🐟', 'rare', 1, 3, 4, 24, ['Fish'], ['River', 'Fish'], {armor: 2, tide: true}, 'm2', 'skirmish', 'Armoured plates, ancient and slow: Armor 2, Tide, Wait 3.'),
  S('diving-bell-spider', 'Diving Bell Spider', '🕷️', 'uncommon', 1, 1, 3, 7, ['Arachnid'], ['River', 'Arachnid'], {tide: true, ambush: 2}, 'm2', 'pack', 'Waits in its underwater silk bell: Tide, Ambush 2.'),
  // ---- Map 5, Gatorback Swamp (mw): the southern swamp
  S('alligator-gar', 'Alligator Gar', '🐟', 'rare', 1, 2, 5, 14, ['Fish'], ['Swamp', 'Fish'], {tide: true, armor: 1, bleed: 1}, 'mw', 'skirmish', 'Armoured scales and a gator\'s teeth: Tide, Armor 1, Bleed 1.'),
  S('swamp-rabbit', 'Swamp Rabbit', '🐇', 'common', 0, 0, 2, 4, ['Lagomorph'], ['Swamp', 'Rabbit'], {tide: true, evasive: true}, 'mw', 'pack', 'The rabbit that dives to escape: Tide, Evasive.'),
  S('mosquito-cloud', 'Mosquito Cloud', '🦟', 'common', 0, 0, 1, 3, ['Insect'], ['Swamp', 'Insect'], {flying: true, bleed: 1}, 'mw', 'pack', 'A blood tax: Flying, Bleed 1.'),
  S('fire-ant-raft', 'Fire Ant Raft', '🐜', 'uncommon', 1, 1, 2, 10, ['Insect'], ['Swamp', 'Ants', 'Insect'], {tide: true, poison: 1, swarm: true}, 'mw', 'skirmish', 'The floating colony that stings: Tide, Poison 1, Swarm.'),
  S('anhinga-spearbird', 'Anhinga Spearbird', '🐦‍⬛', 'uncommon', 1, 1, 4, 7, ['Bird'], ['Swamp', 'Bird'], {tide: true, pounce: 2}, 'mw', 'skirmish', 'The snakebird that swims and spears: Tide, Pounce 2.'),
  S('roseate-spoonbill', 'Roseate Spoonbill', '🦩', 'common', 1, 1, 2, 10, ['Bird'], ['Swamp', 'Bird'], {flying: true, sweep: 1}, 'mw', 'pack', 'Sweeps its spoon side to side: Flying, Cleave (Sweep) 1.'),
  // ---- Map 6, Sable Swampmire (m8): the dark marsh
  S('booming-bittern', 'Booming Bittern', '🦤', 'uncommon', 1, 1, 3, 9, ['Bird'], ['Swamp', 'Bird'], {invisible: 2, daunt: 1}, 'm8', 'skirmish', 'Hides frozen in the reeds (Invisible 2) and booms (Daunt 1).'),
  S('giant-water-bug', 'Giant Water Bug', '🪲', 'uncommon', 1, 1, 4, 8, ['Insect'], ['Swamp', 'Insect'], {tide: true, venomous: 2}, 'm8', 'skirmish', 'The toe-biter: Tide, Venomous 2.'),
  S('water-scorpion', 'Water Scorpion', '🦂', 'common', 1, 1, 3, 8, ['Insect'], ['Swamp', 'Insect'], {tide: true, sentry: true}, 'm8', 'pack', 'Snorkel tail, grabs what swims by: Tide, Sentry.'),
  S('greater-siren', 'Greater Siren', '🦎', 'rare', 1, 2, 3, 18, ['Amphibian'], ['Swamp', 'Newt'], {tide: true, regen: 3}, 'm8', 'skirmish', 'The eel-like salamander that waits out droughts in mud: Tide, Regen 3.'),
  S('marsh-harrier', 'Marsh Harrier', '🦅', 'uncommon', 1, 1, 4, 7, ['Bird'], ['Swamp', 'Bird'], {flying: true, predator: 1}, 'm8', 'pack', 'Quarters low and drops on the small: Flying, Predator 1.'),
  S('raft-spider', 'Raft Spider', '🕷️', 'common', 1, 1, 3, 7, ['Arachnid'], ['Swamp', 'Arachnid'], {tide: true, darksight: true}, 'm8', 'pack', 'Feels for ripples in the dark: Tide, Darksight.'),
  // ---- Map 7, The Morel Hollow (mu): the fungus wood floor
  S('leopard-slug', 'Leopard Slug', '🐌', 'common', 0, 1, 1, 9, ['Mollusc'], ['Forest', 'Snail'], {regen: 1, nocturnal: true}, 'mu', 'pack', 'Slow, spotted, out at night: Regen 1, Nocturnal.'),
  S('wolf-spider-mother', 'Wolf Spider Mother', '🕷️', 'rare', 1, 1, 4, 8, ['Arachnid'], ['Forest', 'Arachnid'], {brood: 2, pounce: 2}, 'mu', 'skirmish', 'Carries her spiderlings and runs prey down: Brood 2, Pounce 2.'),
  S('truffle-piglet', 'Truffle Piglet', '🐗', 'uncommon', 1, 1, 3, 9, ['Suid'], ['Forest', 'Boar'], {onReadyGold: 1}, 'mu', 'skirmish', 'Finds treasure: On Ready, +1 Lumber.'),
  S('fungus-gnat-cloud', 'Fungus Gnat Cloud', '🦟', 'common', 0, 0, 1, 3, ['Insect'], ['Insect', 'Forest'], {flying: true, swarm: true}, 'mu', 'pack', 'A haze from the gills: Flying, Swarm.'),
  S('springtail-hopper', 'Springtail Hopper', '🦗', 'common', 0, 0, 1, 3, ['Insect'], ['Insect'], {evasive: true, quick: true}, 'mu', 'pack', 'The spring-loaded speck: Evasive, Quick.'),
  S('red-backed-salamander', 'Red-backed Salamander', '🦎', 'common', 0, 1, 2, 7, ['Amphibian'], ['Forest', 'Newt'], {regen: 2}, 'mu', 'pack', 'The lungless log-dweller: Regen 2.'),
  // ---- Map 8, Caves & Alcoves (m4): the dark caves (and the scary spider)
  S('cave-cricket', 'Cave Cricket', '🦗', 'common', 0, 0, 2, 3, ['Insect'], ['Cave', 'Insect'], {darksight: true, evasive: true}, 'm4', 'pack', 'All legs and listening: Darksight, Evasive.'),
  S('ghost-crayfish', 'Ghost Crayfish', '🦞', 'uncommon', 1, 2, 2, 16, ['Crustacean'], ['Cave'], {darksight: true, armor: 1, regen: 1}, 'm4', 'skirmish', 'The pale, blind, century-old cave crayfish: Darksight, Armor 1, Regen 1.'),
  S('cave-swiftlet', 'Cave Swiftlet', '🐦', 'common', 0, 1, 2, 5, ['Bird'], ['Cave', 'Bird'], {flying: true, sonar: true}, 'm4', 'pack', 'Echolocates by clicks: Flying, Sonar.'),
  S('cave-pseudoscorpion', 'Cave Pseudoscorpion', '🦂', 'common', 0, 0, 1, 4, ['Arachnid'], ['Cave', 'Arachnid'], {darksight: true, poison: 1}, 'm4', 'pack', 'Venom-tipped claws: Darksight, Poison 1.'),
  S('whip-spider', 'Whip Spider', '🕷️', 'uncommon', 1, 1, 3, 8, ['Arachnid'], ['Cave', 'Arachnid'], {sonar: true, bleed: 1}, 'm4', 'skirmish', 'Feels the dark with its whip legs, strikes with spiny arms: Sonar, Bleed 1.'),
  S('giant-cave-huntsman', 'Giant Cave Huntsman', '🕷️', 'rare', 1, 2, 6, 14, ['Arachnid'], ['Cave', 'Arachnid'], {poison: 2, pounce: 3, darksight: true, daunt: 1}, 'm4', 'skirmish',
    'Owner request (23:32: "We don\'t have a really scary spider. Not trapdoor or cute."): a huge hairy hunting spider, part Goliath birdeater, part huntsman, part funnel-web. It sees in the dark (Darksight), rushes the first thing it sees (Pounce 3), its bite is venom (Poison 2) and it is terrifying (Daunt 1: its hits lower the target\'s Attack).',
    {art: 'NightCafe prompt: "A huge hairy hunting spider the size of a dinner plate, crouched on wet black cave rock, long thick banded legs, dense bristling brown hair, eight glossy black eyes catching a faint light, deep limestone cave background with dripping stalactites and a thin blue glow from a crack above, dark eerie atmosphere, detailed pixel art, full background"'}),
  S('guano-beetle', 'Guano Beetle', '🪲', 'common', 0, 1, 1, 8, ['Insect'], ['Cave', 'Insect', 'Beetle'], {darksight: true, carrion: 2}, 'm4', 'pack', 'Lives on what falls from the roost: Darksight, Carrion 2.'),
  // ---- Map 9, The Kelp Mangroves (mk): the roots and the sea snake
  S('banded-sea-krait', 'Banded Sea Krait', '🐍', 'uncommon', 1, 1, 3, 8, ['Reptile'], ['Mangrove', 'Snake', 'Ocean'], {tide: true, venomous: 2, nocturnal: true}, 'mk', 'skirmish', 'Owner\'s example (sea snakes): hunts eels by night in the roots: Tide (the Swimmer), Venomous 2, Nocturnal.'),
  S('fishing-cat', 'Fishing Cat', '🐈', 'rare', 1, 1, 5, 9, ['Felid'], ['Mangrove', 'Cat'], {tide: true, pounce: 2}, 'mk', 'skirmish', 'The cat that dives for fish: Tide, Pounce 2.'),
  S('proboscis-monkey', 'Proboscis Monkey', '🐒', 'uncommon', 1, 1, 3, 10, ['Primate'], ['Mangrove', 'Ape'], {tide: true, taunt: true}, 'mk', 'pack', 'Everyone looks at that nose: Tide, Taunt.'),
  S('horseshoe-crab', 'Horseshoe Crab', '🦀', 'common', 1, 1, 1, 13, ['Arachnid'], ['Mangrove', 'Ocean'], {armor: 2, tide: true}, 'mk', 'pack', 'Not a crab: a living fossil, closer kin to spiders: Armor 2, Tide.'),
  S('sea-hare', 'Sea Hare', '🐌', 'common', 0, 1, 1, 7, ['Mollusc'], ['Mangrove', 'Ocean'], {tide: true, smokeBomb: true}, 'mk', 'pack', 'Hides in a cloud of ink: Tide, Smoke Bomb.'),
  S('mangrove-manatee', 'Mangrove Manatee', '🦭', 'rare', 1, 3, 3, 28, ['Mammal'], ['Mangrove', 'Ocean'], {tide: true, regen: 2, guardian: true}, 'mk', 'skirmish', 'Half a tonne of patience (no manatee emoji: the seal stands in): Tide, Regen 2, Guardian.'),
  // ---- Map 10, Coral Current (m7): the reef
  S('yellow-bellied-sea-snake', 'Yellow-bellied Sea Snake', '🐍', 'rare', 1, 1, 4, 8, ['Reptile'], ['Ocean', 'Snake', 'Coral Reef'], {tide: true, poison: 3}, 'm7', 'skirmish', 'Owner\'s example (sea snakes): the open-ocean drifter: Tide (the Swimmer), Poison 3.'),
  S('crown-of-thorns-star', 'Crown-of-thorns Star', '⭐', 'uncommon', 1, 1, 2, 12, ['Echinoderm'], ['Coral Reef'], {thorns: 2, poison: 1, tide: true}, 'm7', 'skirmish', 'The venom-spined reef eater: Thorns 2, Poison 1, Tide.'),
  S('parrotfish', 'Parrotfish', '🐠', 'common', 0, 1, 2, 7, ['Fish'], ['Coral Reef', 'Fish'], {tide: true, pierce: 1}, 'm7', 'pack', 'Bites coral to sand: Tide, Pierce 1.'),
  S('lionfish', 'Lionfish', '🐡', 'uncommon', 1, 1, 3, 8, ['Fish'], ['Coral Reef', 'Fish'], {tide: true, thorns: 2}, 'm7', 'pack', 'Every fin a venomous spine: Tide, Thorns 2.'),
  S('giant-clam', 'Giant Clam', '🦪', 'common', 1, 2, 1, 20, ['Mollusc'], ['Coral Reef'], {shell: 2, regen: 1, tide: true}, 'm7', 'pack', 'Closes like a door and farms algae: Shell 2, Regen 1, Tide.'),
  S('great-barracuda', 'Great Barracuda', '🐟', 'rare', 1, 1, 6, 7, ['Fish'], ['Ocean', 'Fish'], {tide: true, quick: true}, 'm7', 'skirmish', 'The silver blade: Tide, Quick.'),
  S('whale-shark', 'Whale Shark', '🦈', 'rare', 1, 3, 5, 28, ['Fish'], ['Ocean', 'Fish'], {tide: true, armor: 1, scare: 1}, 'm7', 'skirmish', 'The biggest fish: Tide, Armor 1, Scare 1.'),
  // ---- Map 11, Eyrie Heights (m10): the high cliffs
  S('chamois-leaper', 'Chamois Leaper', '🐐', 'uncommon', 1, 1, 3, 9, ['Bovine'], ['Mountain'], {mountainClimber: true, pounce: 2}, 'm10', 'skirmish', 'Ledge to ledge: Mountain Climber, Pounce 2.'),
  S('alpine-swift', 'Alpine Swift', '🐦', 'common', 0, 1, 2, 4, ['Bird'], ['Mountain', 'Bird'], {flying: true, quick: true}, 'm10', 'pack', 'Lives on the wing: Flying, Quick.'),
  S('wallcreeper', 'Wallcreeper', '🐦', 'common', 0, 1, 2, 6, ['Bird'], ['Mountain', 'Bird'], {mountainClimber: true, invisible: 1}, 'm10', 'pack', 'A grey speck on the rock: Mountain Climber, Invisible 1.'),
  S('alpine-salamander', 'Alpine Salamander', '🦎', 'common', 1, 1, 2, 12, ['Amphibian'], ['Mountain', 'Newt'], {regen: 1, scare: 1}, 'm10', 'pack', 'Black and hard to impress: Regen 1, Scare 1.'),
  S('apollo-butterfly', 'Apollo Butterfly', '🦋', 'uncommon', 0, 1, 1, 6, ['Insect'], ['Mountain', 'Insect'], {flying: true, thorns: 1}, 'm10', 'skirmish', 'Warning eyespots, bad to eat: Flying, Thorns 1.'),
  S('mountain-hare', 'Mountain Hare', '🐇', 'common', 0, 0, 2, 4, ['Lagomorph'], ['Mountain', 'Rabbit', 'Frost'], {evasive: true, frostbite: 1}, 'm10', 'skirmish', 'Turns white for winter: Evasive, Frostbite 1.'),
  // ---- Map 12, The Briar Maze (mh): the hedges and their thorns
  S('thorn-shrike', 'Thorn Shrike', '🐦', 'rare', 1, 1, 4, 7, ['Bird'], ['Bird', 'Field'], {flying: true, bleed: 2}, 'mh', 'skirmish', 'The butcher bird that impales its prey on thorns: Flying, Bleed 2.'),
  S('hedge-weasel', 'Hedge Weasel', '🦡', 'uncommon', 0, 1, 3, 5, ['Mustelid'], ['Field'], {predator: 2}, 'mh', 'skirmish', 'Follows the mouse into its hole: Predator 2.'),
  S('hawthorn-shieldbug', 'Hawthorn Shieldbug', '🪲', 'common', 1, 1, 2, 12, ['Insect'], ['Insect', 'Field'], {armor: 1, daunt: 1}, 'mh', 'pack', 'A green shield and a stink: Armor 1, Daunt 1.'),
  S('muntjac-barker', 'Muntjac Barker', '🦌', 'uncommon', 1, 1, 3, 10, ['Cervid'], ['Deer', 'Field'], {sentry: true}, 'mh', 'pack', 'The barking deer: Sentry.'),
  S('anvil-thrush', 'Anvil Thrush', '🐦', 'common', 0, 1, 2, 6, ['Bird'], ['Bird', 'Field'], {flying: true, pierce: 2}, 'mh', 'pack', 'Smashes snail shells on its stone: Flying, Pierce 2.'),
  S('garden-tiger-moth', 'Garden Tiger Moth', '🦋', 'common', 0, 0, 1, 4, ['Insect'], ['Insect'], {flying: true, nocturnal: true, thorns: 1}, 'mh', 'pack', 'The woolly bear\'s bristles and the moth\'s bad taste: Flying, Nocturnal, Thorns 1.'),
  // ---- The polar set (Maps 16-17: The Pinewood Taiga mt, Wolfsbane Tundra m6 and its Ice Hollow mi); all resist Cold
  S('polar-bear', 'Polar Bear', '🐻‍❄️', 'veryrare', 1, 2, 5, 10, ['Ursid'], ['Tundra', 'Frost', 'Bear'], {ambush: 4, tide: true}, 'm6', 'skirmish', 'Waits at the seal\'s breathing hole: Ambush 4 (hits whatever enters the slot facing it), Tide.', COLD),
  S('harp-seal-pup', 'Harp Seal Pup', '🦭', 'common', 0, 0, 1, 6, ['Pinniped'], ['Tundra', 'Frost'], {tide: true, molting: 1}, 'm6', 'pack', 'Grows fast on rich milk: Tide, Molting 1 (+1/+1 every 2 rounds).', COLD),
  S('beluga', 'Beluga', '🐋', 'rare', 1, 2, 3, 18, ['Cetacean'], ['Tundra', 'Ocean'], {tide: true, sonar: true, inspiring: 1}, 'm6', 'skirmish', 'The singing sea canary: Tide, Sonar, Inspiring 1.', COLD),
  S('arctic-tern', 'Arctic Tern', '🕊️', 'uncommon', 0, 1, 2, 5, ['Bird'], ['Tundra', 'Bird', 'Coastal'], {flying: true, diurnal: true}, 'm6', 'pack', 'Pole to pole, the most daylight of any animal: Flying, Diurnal.', COLD),
  S('lemming-swarm', 'Lemming Swarm', '🐁', 'common', 0, 0, 1, 3, ['Rodent'], ['Tundra', 'Mouse'], {swarm: true, brood: 1}, 'm6', 'pack', 'Millions in a boom year: Swarm, Brood 1.', COLD),
  S('krill-swarm', 'Krill Swarm', '🦐', 'common', 0, 0, 1, 3, ['Crustacean'], ['Tundra', 'Ocean'], {tide: true, swarm: true}, 'm6', 'pack', 'Feeds the cold sea: Tide, Swarm.', COLD),
  S('greenland-shark', 'Greenland Shark', '🦈', 'rare', 1, 3, 4, 26, ['Fish'], ['Tundra', 'Ocean'], {tide: true, carrion: 2, armor: 1}, 'mi', 'skirmish', 'Four hundred years under the ice, a scavenger: Tide, Carrion 2, Armor 1.', COLD),
  S('ringed-seal', 'Ringed Seal', '🦭', 'common', 1, 1, 2, 10, ['Pinniped'], ['Tundra', 'Frost'], {tide: true, invisible: 2}, 'mi', 'pack', 'The polar bear\'s seal, hidden in its snow lair: Tide, Invisible 2.', COLD),
  S('woodland-caribou', 'Woodland Caribou', '🦌', 'uncommon', 1, 1, 3, 11, ['Cervid'], ['Taiga', 'Deer'], {mountainClimber: true, frostbite: 1}, 'mt', 'skirmish', 'Snowshoe hooves and a herd that never stops: Mountain Climber, Frostbite 1.', COLD),
  S('musk-ox-calf', 'Musk Ox Calf', '🐂', 'uncommon', 1, 1, 2, 12, ['Bovine'], ['Taiga', 'Tundra', 'Frost'], {armor: 1, frostbite: 1}, 'mt', 'pack', 'In the middle of the ring: Armor 1, Frostbite 1.', COLD),
];

// ---- shared helpers
const read = rel=> fs.readFileSync(path.join(ROOT, rel), 'utf8');
function flavours(){ // the English flavour lines, paired with the names in tools/i18n_2026_10_19_pool.py (same order)
  const src = read('tools/i18n_2026_10_19_pool.py'), nm = src.slice(src.indexOf('NAMES = {'), src.indexOf('FLAVOR = {')), fl = src.slice(src.indexOf('FLAVOR = {'), src.indexOf('TEXTS = {'));
  const keys = s=> [...s.matchAll(/^"((?:[^"\\]|\\.)*)": \[/gm)].map(m=> JSON.parse('"' + m[1] + '"'));
  const names = keys(nm), lines = keys(fl), out = {}; names.forEach((n, i)=> out[n] = lines[i]); return out;
}
function uuid5(name){ const ns = Buffer.from('6ba7b8119dad11d180b400c04fd430c8', 'hex'); const h = crypto.createHash('sha1').update(Buffer.concat([ns, Buffer.from(name)])).digest();
  h[6] = (h[6] & 0x0f) | 0x50; h[8] = (h[8] & 0x3f) | 0x80; const x = h.slice(0, 16).toString('hex'); return `${x.slice(0, 8)}-${x.slice(8, 12)}-${x.slice(12, 16)}-${x.slice(16, 20)}-${x.slice(20)}`; }
const SC = require('./skill_costs.js'), T = SC.make(JSON.parse(read('canonical/skill-costs.json')));
const BANDS = {common:[.35, .60], uncommon:[.45, .68], rare:[.52, .75], veryrare:[.56, .80], superrare:[.60, .84], epic:[.62, .87]};
const RNAME = {common:'Common', uncommon:'Uncommon', rare:'Rare', veryrare:'Very Rare'};

function cardOf(sp, i, flav){
  const c = {id: sp.id, name: sp.name, icon: sp.icon, cost: sp.cost, wait: sp.wait, attack: sp.attack, health: sp.health, rarity: sp.rarity,
    species: sp.species, archetypes: sp.archetypes, effects: sp.effects, flavor: flav[sp.name], dmgType: 'physical', resist: sp.extra.resist || [], tags: [],
    locked: true, test: false, pool: true, poolMap: sp.poolMap, poolSlot: sp.poolSlot, numericId: 9001 + i, uuid: uuid5('bramblewood-card:' + sp.id)};
  if(!c.flavor) throw new Error('no flavour line for ' + sp.name);
  return c;
}

// ---- the yardstick: card_balance.js's winRate, same filler, seeds and copies (so `node tools/card_balance.js 120 --pool` agrees)
let E, defs, OPP, FILLER;
function setup(){
  E = require(path.join(ROOT, 'bramblewood-engine.js'));
  const cards = JSON.parse(read('canonical/cards.json')); defs = {};
  cards.filter(c=> !c.pool).forEach(c=>{ const d = Object.assign({effects:{}}, c); delete d.art; defs[c.id] = d; });
  FILLER = ['warren-scout', 'fawn-scout', 'bee-sentry', 'mouse-sapper', 'poison-dart-croaker'].filter(id=> defs[id]);
  const RAW = {}; cards.forEach(c=> RAW[c.id] = c);
  FILLER.forEach(id=>{ const d = Object.assign({effects:{}}, RAW[id]); delete d.art; d.effects = Object.assign({}, d.effects); ['swimmer','tailwind','headwind','darksight','dry'].forEach(k=> delete d.effects[k]); defs[id] = d; });
  OPP = fillerDeck(20);
}
function fillerDeck(n){ const d = {}; for(let i=0;i<n;i++){ const id = FILLER[i % FILLER.length]; d[id] = (d[id]||0) + 1; } return d; }
const COPIES_BY_COST = [8, 6, 4, 3];
function winRate(card){
  const D = Object.assign({}, defs, {[card.id]: Object.assign({effects:{}}, card)});
  const k = COPIES_BY_COST[Math.min(3, card.cost||0)], deck = fillerDeck(20 - k); deck[card.id] = (deck[card.id]||0) + k;
  let w = 0;
  for(let g=0; g<GAMES; g++){
    const r = E.simulateOneMatch(D, g%2 ? deck : OPP, g%2 ? OPP : deck, {rnd: E.mulberry32(7700 + g*131), maxRounds: 60, battleMode: 'open'});
    const mine = g%2 ? 1 : 2; w += r.winner===mine ? 1 : r.winner===0 ? 0.5 : 0;
  }
  return w / GAMES;
}
function tune(card){
  // 1. step Attack until the win rate crosses the band; 2. then step Health on the strong side down / the weak side up (Attack is
  // the coarse lever, Health the fine one). Every point tried is kept; the first in band wins, else the one nearest the band.
  const [lo, hi] = BANDS[card.rarity], mid = (lo + hi) / 2, tried = [], seen = {};
  const at = (a, h)=>{ const k = a + '/' + h; if(seen[k]) return seen[k]; const c = Object.assign({}, card, {attack: a, health: h}), b = T.budget(c);
    const r = {attack: a, health: h, ok: b.ok, wr: b.ok ? winRate(c) : null}; tried.push(r); seen[k] = r; return r; };
  const inBand = r=> r.ok && r.wr >= lo && r.wr <= hi, done = r=> ({card: Object.assign({}, card, {attack: r.attack, health: r.health}), wr: r.wr, tried});
  let r = at(card.attack, card.health); if(inBand(r)) return done(r);
  let strong = r.ok && r.wr > hi ? r : null, weak = r.ok && r.wr < lo ? r : null;
  for(let i = 0, a = card.attack; i < 4 && !(strong && weak); i++){
    a += (strong || !r.ok) ? -1 : 1; if(a < (card.attack > 0 ? 1 : 0)) break;
    r = at(a, card.health); if(inBand(r)) return done(r); if(!r.ok){ if(!strong && !weak) continue; break; }
    if(r.wr > hi) strong = r; else weak = r;
  }
  if(strong) for(let i = 0, h = strong.health; i < 8 && h > 1; i++){ h = Math.max(1, h - Math.max(1, Math.round(strong.health * 0.1))); const x = at(strong.attack, h); if(inBand(x)) return done(x); if(x.ok && x.wr < lo) break; }
  if(weak) for(let i = 0, h = weak.health; i < 8; i++){ h += Math.max(1, Math.round(weak.health * 0.12)); const x = at(weak.attack, h); if(inBand(x)) return done(x); if(!x.ok || x.wr > hi) break; }
  const best = tried.filter(t=> t.ok).sort((p, q)=> Math.abs(p.wr - mid) - Math.abs(q.wr - mid))[0];
  return Object.assign(done(best || r), {out: true});
}
function note(sp, card, wr){
  const b = T.budget(card), L = SC.levelOf(card), R = SC.rankOf(card), W = card.wait, C = card.cost, band = BANDS[card.rarity].map(x=> x * 100);
  const parts = b.parts.map(p=> `${p[1]} ${p[2]}`).join(', ');
  // 2026-10-19 (package BF2): budget v5, N = (Base + L/10) x (1 + L/30), Level 0 Base - 1
  const nTerms = `${L ? `(Base ${T.budgetBase(card)} + ${L}/10) x (1 + ${L}/30)` : `Base ${T.budgetBase(card)} - 1`}, Base = 20 + ${R} + ${6 * W} + ${0.5 * W * W} + ${4 * C} + ${Math.round(0.4 * C * C * 100) / 100}`;
  const m = b.m !== 1 ? ` (x${b.m} half-miss)` : '';
  return `2026-10-19 (package AN, owner 23:04: "More thematic animals ... I'll pick and choose when balancing for a map"): POOL candidate for ${sp.poolMap} (${sp.poolSlot === 'pack' ? 'a pack card' : 'a skirmish-only reward'}), not live until placed from Admin's Pool cards filter. ${sp.idea}`
    + ` Budget v5 at Level ${L}, ${RNAME[card.rarity]}, Wait ${W}, Lumber ${C}: N = ${nTerms} = ${b.N}; S = ${b.S} (${parts}); 2A+H+S = ${2 * card.attack} + ${card.health} + ${b.S}${m} = ${b.x1} < ${b.N} and A*H+S = ${card.attack * card.health} + ${b.S}${m} = ${b.x2} < (N/3)^2 = ${b.N2}.`
    + ` Measured ${Math.round(wr * 1000) / 10}% over ${GAMES} games (tools/card_balance.js yardstick; ${RNAME[card.rarity]} band ${band[0]}-${band[1]}%).`
    + (sp.extra.art ? ' Art: ' + sp.extra.art + '.' : '');
}

const cmd = require.main === module ? (process.argv[2] || 'check') : null;
if(cmd === 'tune'){
  const [k, n] = (process.argv[3] || '0/1').split('/').map(Number), flav = flavours(); setup();
  const only = (process.argv[4] || '').split(',').filter(Boolean), out = {};
  SPECS.forEach((sp, i)=>{ if(only.length ? !only.includes(sp.id) || only.indexOf(sp.id) % n !== k % n : i % n !== k) return; const c = cardOf(sp, i, flav), t = tune(c);
    out[sp.id] = {attack: t.card.attack, health: t.card.health, wr: t.wr, out: !!t.out, tried: t.tried};
    console.log(sp.id, sp.rarity, `${c.attack}/${c.health} -> ${t.card.attack}/${t.card.health}`, t.wr == null ? '-' : (t.wr * 100).toFixed(1) + '%', t.out ? 'OUT OF BAND' : ''); });
  fs.mkdirSync(path.join(ROOT, 'docs', 'balance'), {recursive: true});
  fs.writeFileSync(path.join(ROOT, 'docs', 'balance', `pool-tune-${k}.json`), JSON.stringify(out, null, 1) + '\n');
} else if(cmd === 'write'){
  const flav = flavours(), tuned = {};
  fs.readdirSync(path.join(ROOT, 'docs', 'balance')).filter(f=> /^pool-tune-\d+\.json$/.test(f)).sort((x, y)=> parseInt(x.slice(10)) - parseInt(y.slice(10))).forEach(f=> Object.assign(tuned, JSON.parse(read('docs/balance/' + f))));
  const file = path.join(ROOT, 'canonical', 'cards.json'), cards = JSON.parse(fs.readFileSync(file, 'utf8')).filter(c=> !c.pool);
  const rows = [];
  SPECS.forEach((sp, i)=>{ const t = tuned[sp.id]; if(!t || t.wr == null) throw new Error('not tuned: ' + sp.id);
    const c = Object.assign(cardOf(sp, i, flav), {attack: t.attack, health: t.health}); c.creatorNote = note(sp, c, t.wr); cards.push(c);
    const b = T.budget(c); rows.push({id: c.id, name: c.name, icon: c.icon, map: sp.poolMap, slot: sp.poolSlot, rarity: c.rarity, lumber: c.cost, wait: c.wait, attack: c.attack, health: c.health,
      skills: Object.entries(c.effects).map(([k, v])=> v === true ? k : `${k} ${typeof v === 'object' ? JSON.stringify(v) : v}`).join(', '), resist: c.resist.join(', '), N: b.N, S: b.S, x1: b.x1, x2: b.x2, N2: b.N2,
      winRate: Math.round(t.wr * 1000) / 10, band: BANDS[c.rarity].map(x=> x * 100).join('-'), inBand: !t.out, idea: sp.idea, art: sp.extra.art || '', flavor: c.flavor}); });
  // the file's own format (Python json.dump indent=2, ensure_ascii): non-ASCII as \uXXXX, so only the pool rows change
  fs.writeFileSync(file, JSON.stringify(cards, null, 2).replace(/[\u0080-\uffff]/g, ch=> '\\u' + ch.charCodeAt(0).toString(16).padStart(4, '0')) + '\n');
  fs.writeFileSync(path.join(ROOT, 'docs', 'balance', 'card-pool-2026-10-19.json'), JSON.stringify(rows, null, 1) + '\n');
  console.log('wrote', rows.length, 'pool cards;', rows.filter(r=> !r.inBand).length, 'out of band');
} else if(cmd === 'check'){
  setup(); const pool = JSON.parse(read('canonical/cards.json')).filter(c=> c.pool);
  pool.forEach(c=>{ const b = T.budget(c), wr = winRate(c), [lo, hi] = BANDS[c.rarity]; console.log(c.id, b.ok ? 'budget ok' : 'OVER', (wr * 100).toFixed(1) + '%', wr >= lo && wr <= hi ? '' : 'OUT'); });
}
module.exports = {SPECS, setup: ()=> setup(), winRate: c=> winRate(c), cardOf, flavours, T};
