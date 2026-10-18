#!/usr/bin/env node
// The thematic pass's choices (2026-10-19, package TH), written out so the owner can read and revert them: which pool cards are placed and
// where they come from, and each fight's swaps and new fields. `node tools/thematic_plan_2026_10_19.js` writes
// docs/balance/thematic-pass-2026-10-19.json, which `node tools/thematic_pass_2026_10_19.js apply` puts into the game.
'use strict';
const fs = require('fs'), path = require('path');
const OUT = path.join(__dirname, '..', 'docs', 'balance', 'thematic-pass-2026-10-19.json');

// ---- the pool cards placed: [id, 'skirmish' (a skirmish-only reward: node) | 'pack' (the basic pack pool), node, why]
const place = [
  // Map 0 Bramblewood Outskirts: the river bank and the hedge (all six)
  ['water-vole', 'skirmish', '0-1', 'the river bank vole on the Otter Patrol'],
  ['river-mink', 'skirmish', '0-2', 'a hedge-and-river raider for the fight that had no reward'],
  ['grass-snake', 'skirmish', '0-2', 'the swimming snake that plays dead, in the ambush'],
  ['pine-marten', 'skirmish', '0-3', 'the chipmunk hunter, beside the Chipmunk Cavalry reward'],
  ['signal-crayfish', 'pack'], ['woodcock-lookout', 'pack'],
  // Map 1 Thistlewood (all six, and package GI's Rivergate Drummer)
  ['robin-redbreast', 'skirmish', '1-1', 'the garden robin with the hedgerow scouts'],
  ['ladybird-guard', 'skirmish', '1-2', 'an insect for the Cricket Chorus'],
  ['rivergate-drummer', 'skirmish', '1-3', 'package GI\'s Kin Rally Otter, on the Otter road (GI note: Thistlewood)'],
  ['stag-beetle', 'skirmish', '1-5', 'the Thistle Baron\'s beetle: it fights in his deck too'],
  ['hedgerow-shrew', 'pack'], ['slow-worm', 'pack'], ['field-vole', 'pack'],
  // Map 2 Pebble Beach (Sanderling left in the pool: a fourth "Tide, Evasive" small card)
  ['pincushion-urchin', 'skirmish', '2-1', 'owner\'s example (sea urchin), in the rock pools'],
  ['tidepool-trapper-crab', 'skirmish', '2-3', 'package GI\'s Crab Trap (Hunter vs Wet) on the Tide beach, with the hermit crabs'],
  ['grey-seal-bull', 'skirmish', '2-5', 'the bull guarding the shingle, The Old Shell\'s guard'],
  ['rock-pool-starfish', 'pack'], ['oystercatcher', 'pack'], ['limpet-clinger', 'pack'],
  // Map 3 Gannet Cliffs: the seabirds that replace the Pelican Divers (all six)
  ['puffin-diver', 'skirmish', '3-2', 'the cliff\'s sea parrot'],
  ['fulmar-spitter', 'skirmish', '3-4', 'rides the thermals with the condors'],
  ['peregrine-stooper', 'skirmish', '3-5', 'the stoop itself (Eagle Stoop)'],
  ['razorbill', 'pack'], ['kittiwake-flock', 'pack'], ['red-billed-chough', 'pack'],
  // Map 4 Sunken Hollow: the temperate water mammals and the river's old fish (all six)
  ['pyrenean-desman', 'skirmish', '4-1', 'the trunked swimmer'],
  ['muskrat-lodgekeeper', 'skirmish', '4-2', 'the reed lodge, in the Beaver Builders\' place'],
  ['old-sturgeon', 'skirmish', '4-4', 'the ancient fish in the Kraken\'s Maw'],
  ['water-shrew', 'pack'], ['great-crested-grebe', 'pack'], ['diving-bell-spider', 'pack'],
  // Map 5 Gatorback Swamp: package GI's swamp poison kit and the swamp pool (Roseate Spoonbill left: the weakest, 39%)
  ['plague-gnat-cloud', 'skirmish', '5-1', 'GI: Proliferate with Swamp Fever and the leeches'],
  ['anhinga-spearbird', 'skirmish', '5-2', 'the snakebird of Toad Hollow'],
  ['fire-ant-raft', 'skirmish', '5-3', 'the floating colony in the cypress roots'],
  ['fen-mink', 'skirmish', '5-5', 'GI: Hunter (Poisoned) beside the gators and vipers'],
  ['alligator-gar', 'skirmish', '5-6', 'the gator-toothed fish of Behemoth Bog'],
  ['swamp-rabbit', 'pack'], ['mosquito-cloud', 'pack'],
  // Map 6 Sable Swampmire (Water Scorpion left: weak, 37%, and the Water Bug covers it)
  ['giant-water-bug', 'skirmish', '6-3', 'the toe-biter in the Toad Chorus'],
  ['booming-bittern', 'skirmish', '6-4', 'the reed-hider of the Root Snare'],
  ['bogfire-newt', 'skirmish', '6-5', 'GI: Detonate on the Venomlord\'s poison'],
  ['greater-siren', 'skirmish', '6-6', 'the eel-salamander of the Crocodile Run'],
  ['marsh-harrier', 'pack'], ['raft-spider', 'pack'],
  // Map 7 The Morel Hollow (all six)
  ['truffle-piglet', 'skirmish', '7-1', 'it finds what grows under the spores'],
  ['wolf-spider-mother', 'skirmish', '7-5', 'the Oath Ring\'s hunter'],
  ['leopard-slug', 'pack'], ['fungus-gnat-cloud', 'pack'], ['springtail-hopper', 'pack'], ['red-backed-salamander', 'pack'],
  // Map 8 Caves & Alcoves: the owner's scary spider and the cave pool (all seven)
  ['ghost-crayfish', 'skirmish', '8-2', 'the pale crayfish of the Glowworm Grotto pools'],
  ['whip-spider', 'skirmish', '8-4', 'feels its way through the Echo Chamber'],
  ['giant-cave-huntsman', 'skirmish', '8-6', 'owner request 23:32 (the scary spider), in the Glowworm Deep'],
  ['cave-cricket', 'pack'], ['cave-swiftlet', 'pack'], ['cave-pseudoscorpion', 'pack'], ['guano-beetle', 'pack'],
  // Map 9 The Kelp Mangroves (all six)
  ['banded-sea-krait', 'skirmish', '9-4', 'owner\'s example (sea snakes), night hunter in the Kelp Curtains'],
  ['fishing-cat', 'skirmish', '9-5', 'dives for the fish of the Moray Den'],
  ['mangrove-manatee', 'skirmish', '9-7', 'the Kelp Witch\'s great guardian'],
  ['proboscis-monkey', 'pack'], ['horseshoe-crab', 'pack'], ['sea-hare', 'pack'],
  // Map 10 Coral Current (all seven)
  ['crown-of-thorns-star', 'skirmish', '10-2', 'a second reward for the Moray Ambush'],
  ['yellow-bellied-sea-snake', 'skirmish', '10-5', 'owner\'s example (sea snakes), for the fight that had no reward'],
  ['great-barracuda', 'skirmish', '10-6', 'with the Reef Shark Pack (no reward before)'],
  ['whale-shark', 'skirmish', '10-8', 'the Sea Turtle Elder\'s court (no reward before)'],
  ['parrotfish', 'pack'], ['lionfish', 'pack'], ['giant-clam', 'pack'],
  // Map 11 Eyrie Heights (Wallcreeper left: the weakest, 38%)
  ['mountain-hare', 'skirmish', '11-1', 'with the goat-trail runners'],
  ['apollo-butterfly', 'skirmish', '11-3', 'the alpine butterfly over the herd'],
  ['chamois-leaper', 'skirmish', '11-9', 'for the Condor Sovereign\'s fight, which had no reward'],
  ['alpine-swift', 'pack'], ['alpine-salamander', 'pack'],
  // Map 12 The Briar Maze (all six)
  ['thorn-shrike', 'skirmish', '12-4', 'the butcher bird of the Thornvine Arch'],
  ['hedge-weasel', 'skirmish', '12-6', 'follows the mice into the Rodent Court'],
  ['hawthorn-shieldbug', 'pack'], ['muntjac-barker', 'pack'], ['anvil-thrush', 'pack'], ['garden-tiger-moth', 'pack'],
  // package GI's examples where their notes put them
  ['grave-grin-hyena', 'skirmish', '14-2', 'GI: Executioner, in the Hyena Chorus (Savanna Reaches)'],
  ['glasswing-moth', 'skirmish', '18-5', 'GI: Brittle beside the Obsidian Scorpions and the Glass-storm (Glass job for Shatter)'],
  ['chapel-tortoise', 'skirmish', '21-3', 'GI: Prayer Bastion on the Quiet Summit (the Cathedral Eagle\'s Worship is two fights on)'],
  ['weathervane-swift', 'skirmish', '22-7', 'GI: Field Breaker as a late reward on the heaviest field fight (Heatwave + Hail)'],
  ['frostmoon-howler', 'skirmish', '17-7', 'GI: Pack Howl, the wolves\' identity, at the Alpha Howler\'s Den'],
  // the polar set: Map 16 (both) and Map 17 with the Ice Hollow (all eight)
  ['woodland-caribou', 'skirmish', '16-3', 'crosses with the elk'],
  ['musk-ox-calf', 'pack'],
  ['beluga', 'skirmish', '17-4', 'the sea canary by the seals'],
  ['polar-bear', 'skirmish', '17-5', 'for the Musk Ox Bulwark, which had no reward'],
  ['greenland-shark', 'skirmish', '17-A-4', 'under the ice, the Hollow King\'s'],
  ['harp-seal-pup', 'pack'], ['arctic-tern', 'pack'], ['lemming-swarm', 'pack'], ['krill-swarm', 'pack'], ['ringed-seal', 'pack'],
].map(([id, slot, node, why])=> Object.assign({id, slot}, node ? {node} : {}, why ? {why} : {}));

// ---- the fights: [map, key, out "id:k,id:k", in "id:k,...", rules, why]
const F = (map, key, out, inn, rules, why)=> ({map, key, out: kv(out), in: kv(inn), rules: rules || undefined, why});
const kv = s=> s ? Object.fromEntries(s.split(',').map(x=> x.trim().split(':')).map(([id, k])=> [id, +k])) : undefined;
const fights = [
  // Map 0
  F('m1', '0-1', 'pond-trout:2', 'water-vole:2', null, 'its new reward on the river bank'),
  F('m1', '0-4', 'badger-berserker:2', 'pine-marten:2', null, 'Badger Berserker is a badger-map card (Ashen Spurn); the hedge\'s own hunter instead'),
  // Map 1
  F('mf', '1-1', 'burrow-rabbit:2', 'robin-redbreast:2', null, 'its new reward'),
  F('mf', '1-2', 'duckling:3,chipmunk-skirmisher:2', 'harvest-mouse:3,ladybird-guard:2', null, 'no ducklings in the hedgerow (R2 filler): the field\'s mice, and its new reward'),
  F('mf', '1-3', 'badger-berserker:2,duckling:2', 'stag-beetle:2,harvest-mouse:2', null, 'Badger Berserker and ducklings off; the woodland\'s Stag Beetle'),
  F('mf', '1-4', 'duckling:3', 'field-vole:3', null, 'no ducklings: the hedge\'s voles'),
  F('mf', '1-5', 'badger-berserker:2', 'stag-beetle:2', null, 'the Thistle Baron\'s beetles, not Ashen Spurn\'s badgers'),
  // Map 2
  F('mb', '2-1', 'tide-pool-crab:2', 'pincushion-urchin:2', null, 'its new reward in the rock pools'),
  F('mb', '2-3', 'tide-pool-crab:2', 'tidepool-trapper-crab:2', null, 'its new reward (GI Crab Trap on the Tide)'),
  F('mb', '2-4', 'mallard-marauder:2', 'grey-seal-bull:2', null, 'the shingle\'s seal, not the Goldfeather mallards'),
  F('mb', '2-5', 'mallard-marauder:2', 'grey-seal-bull:2', null, 'The Old Shell\'s guard is a seal, not a mallard'),
  // Map 3: the Pelican Divers flood (4 in six fights) gives way to the cliff's own seabirds; two keep 2 Pelicans
  F('mc', '3-1', 'pelican-diver:4,duck-paddler:2', 'puffin-diver:2,red-billed-chough:2,kittiwake-flock:2', null, 'seabirds of the cliff for the Pelicans and ducks'),
  F('mc', '3-2', 'pelican-diver:4', 'razorbill:2,puffin-diver:2', null, 'seabirds for the Pelicans'),
  F('mc', '3-3', 'pelican-diver:4', 'fulmar-spitter:2,razorbill:2', null, 'seabirds for the Pelicans'),
  F('mc', '3-4', 'pelican-diver:4', 'fulmar-spitter:2,razorbill:2', null, 'seabirds for the Pelicans'),
  F('mc', '3-5', 'sparrow-chick:2', 'peregrine-stooper:2', null, 'the Eagle Stoop\'s own falcon (keeps its 2 Pelicans)'),
  F('mc', '3-6', 'pelican-diver:4', 'razorbill:2,fulmar-spitter:2', null, 'seabirds for the Pelicans'),
  F('mc', '3-7', 'pelican-diver:2', 'peregrine-stooper:2', null, 'the Gannet Queen keeps 2 Pelicans; a falcon for the other 2'),
  // Map 4: hardly any drift (the flood brought the sea in); its pool cards join
  F('m2', '4-1', 'pond-trout:2', 'pyrenean-desman:2', null, 'its new reward'),
  F('m2', '4-2', 'beaver-builder:2', 'muskrat-lodgekeeper:2', null, 'its new reward, a lodge-builder for a lodge-builder'),
  F('m2', '4-4', 'truce-heron:1', 'old-sturgeon:1', null, 'its new reward for a stray pack heron'),
  // Map 5: no Open-Ocean crabs, Goldfeather mallards or beavers in the gator swamp
  F('mw', '5-1', 'open-ocean-hermit-crab:2', 'plague-gnat-cloud:2', null, 'swamp insects for the ocean crabs'),
  F('mw', '5-2', 'puddle-hopper:2', 'anhinga-spearbird:2', null, 'its new reward'),
  F('mw', '5-3', 'echo-keeper:2', 'fire-ant-raft:2', null, 'its new reward'),
  F('mw', '5-4', 'open-ocean-hermit-crab:2,mallard-marauder:2', 'mosquito-cloud:2,alligator-gar:2', null, 'swamp cards for the ocean crabs and the mallards'),
  F('mw', '5-5', 'mallard-marauder:1', 'fen-mink:1', null, 'GI Fen Mink for the mallard'),
  F('mw', '5-6', 'open-ocean-hermit-crab:1,mallard-marauder:1', 'fire-ant-raft:1,alligator-gar:1', null, 'swamp cards for the ocean crab and the mallard'),
  F('mw', '5-7', 'open-ocean-hermit-crab:2,beaver-builder:1', 'fire-ant-raft:2,fen-mink:1', null, 'swamp cards for the ocean crabs and the beaver'),
  // Map 6: no beavers, ocean crabs or mallards in the night swamp
  F('m8', '6-2', 'open-ocean-hermit-crab:2,mallard-marauder:2', 'raft-spider:2,booming-bittern:2', null, 'swamp cards for the ocean crabs and the mallards'),
  F('m8', '6-3', 'beaver-builder:2,mallard-marauder:2', 'giant-water-bug:2,marsh-harrier:2', null, 'swamp cards for the beavers and the mallards'),
  F('m8', '6-5', 'beaver-builder:3', 'bogfire-newt:2,marsh-wisp:1', null, 'its new reward (GI Detonate) and a wisp for the beavers'),
  F('m8', '6-6', 'beaver-builder:2', 'greater-siren:2', null, 'its new reward for the beavers'),
  F('m8', '6-7', 'beaver-builder:2', 'marsh-wisp:2', null, 'wisps for the beavers'),
  F('m8', '6-8', 'beaver-builder:3,open-ocean-hermit-crab:1,mallard-marauder:2', 'greater-siren:2,marsh-wisp:1,raft-spider:1,giant-water-bug:2', null, 'the swamp\'s own for the beavers, the crab and the mallards'),
  // Map 7: the raccoons leave the fungus wood; Spore Cloud on the elite and the boss
  F('mu', '7-1', 'garden-snail:2', 'truffle-piglet:2', null, 'its new reward'),
  F('mu', '7-4', 'compost-grub:2', 'leopard-slug:2', null, 'a night slug in the Moonlit Gills'),
  F('mu', '7-5', null, null, {sporeCloud: true}, 'Spore Cloud (the Morel Hollow\'s field, GI note: elites and boss)'),
  F('mu', '7-6', 'raccoon-nightcrew:1,trash-panda-trickster:2', 'wolf-spider-mother:2,truffle-piglet:1', {sporeCloud: true}, 'spiders and a piglet for the raccoons; Spore Cloud'),
  // Map 8: no bees in the dark; the cave pool
  F('m4', '8-1', 'honey-bee:2,beetle-grunt:2', 'guano-beetle:2,cave-swiftlet:2', null, 'cave dwellers for the bees and the Thistlewood beetles'),
  F('m4', '8-3', 'honey-bee:2', 'cave-cricket:2', null, 'a cave cricket for the bees'),
  F('m4', '8-5', 'honey-bee:2,swarm-matriarch:2', 'guano-beetle:2,whip-spider:2', null, 'cave dwellers for the bees'),
  F('m4', '8-6', 'swarm-matriarch:2', 'giant-cave-huntsman:2', null, 'its new reward (the scary spider) for the bees'),
  F('m4', '8-7', 'swarm-matriarch:2', 'cave-bat-swarm:2', null, 'bats for the bees in The Roost Above'),
  F('m4', '8-8', 'beetle-grunt:2,swarm-matriarch:2', 'cave-pseudoscorpion:2,whip-spider:2', null, 'cave dwellers for the bees and the beetles'),
  // Map 9: no narwhals in the warm mangroves; Tangled Roots on the elites
  F('mk', '9-1', 'narwhal-lancer:2', 'horseshoe-crab:2', null, 'a mudflat crab for the arctic narwhals'),
  F('mk', '9-4', 'narwhal-lancer:2', 'banded-sea-krait:2', null, 'its new reward (sea snakes) for the narwhals'),
  F('mk', '9-5', null, null, {tangledRoots: true}, 'Tangled Roots (GI note: Kelp Mangroves elites)'),
  F('mk', '9-6', null, null, {tangledRoots: true}, 'Tangled Roots'),
  F('mk', '9-7', 'narwhal-lancer:1', 'mangrove-manatee:1', null, 'its new reward for the narwhal'),
  // Map 10: the pool joins; Thunderstorm on the Eel Nest and the boss
  F('m7', '10-1', 'tide-pool-crab:2', 'parrotfish:2', null, 'a reef fish for the beach crabs'),
  F('m7', '10-6', 'abyss-lantern-squid:2', 'great-barracuda:2', null, 'its new reward'),
  F('m7', '10-7', null, null, {thunderstorm: 2}, 'Thunderstorm (GI note: Coral Current elites / boss), on the eels\' nest'),
  F('m7', '10-8', 'lions-mane-jelly:1', 'whale-shark:1', null, 'its new reward'),
  F('m7', '10-9', 'gull-thief:1', 'lionfish:1', {thunderstorm: 2}, 'a reef fish for the beach gull; Thunderstorm'),
  // Map 11: the Briar Maze porcupines and the swamp's Echo Keepers leave the heights
  F('m10', '11-6', 'quillguard:1', 'chamois-leaper:1', null, 'a ledge leaper for the hedge porcupine'),
  F('m10', '11-7', 'quill-volley:2', 'alpine-swift:2', null, 'swifts for the porcupine volleys'),
  F('m10', '11-9', 'chipmunk-hoarder:2', 'chamois-leaper:2', null, 'its new reward'),
  F('m10', '11-10', 'echo-keeper:2', 'alpine-salamander:2', null, 'an alpine salamander for the swamp\'s Echo Keepers'),
  // Map 12: the pool joins
  F('mh', '12-4', 'bramble-sprout:2', 'thorn-shrike:2', null, 'its new reward, the butcher bird of the thorns'),
  F('mh', '12-7', 'harvest-mouse:2', 'hedge-weasel:2', null, 'a weasel at the Briar Queen\'s court'),
  // Map 13: village dogs, chipmunks, sergeants and pack macaques out of the deep forest; bears, boars, deer and foxes in
  F('mr', '13-1', 'shieldbearer-hound:4', 'stag-knight:2,berserker-boar:2', null, 'forest beasts for the village hounds'),
  F('mr', '13-2', 'shieldbearer-hound:4,buzzed-chipmunk:2', 'fox-kit:2,swift-fox:2,fox-sharpshot:2', null, 'foxes for the Fox Run (village hounds and chipmunks out)'),
  F('mr', '13-3', 'shieldbearer-hound:2,border-collie:1,buzzed-chipmunk:1,bramblewood-macaque:4', 'stag-knight:2,fawn-scout:1,fox-kit:1,bramblewood-lynx:2,shimmerwing-stag:2', null, 'the Antler Grove\'s deer and lynx'),
  F('mr', '13-4', 'shieldbearer-hound:4,buzzed-chipmunk:1', 'berserker-boar:2,swift-fox:2,fox-kit:1', null, 'boars and foxes for the village folk'),
  F('mr', '13-5', 'border-collie:2,buzzed-chipmunk:2,parish-sergeant:2,bramblewood-macaque:2,shieldbearer-hound:2', 'badger-sapper:2,fox-kit:2,honey-badger-fury:2,feral-tuskboar:2,bear-cub:2', null, 'the Badger Setts\' badgers (its own reward) and forest beasts'),
  F('mr', '13-6', 'shieldbearer-hound:2,border-collie:2,buzzed-chipmunk:2,parish-sergeant:1,bramblewood-macaque:4', 'bear-cub:2,grizzly-vanguard:2,swift-fox:2,honey-badger-fury:1,feral-tuskboar:2,bramblewood-lynx:2', null, 'the Grizzly Ridge\'s bears (its own reward)'),
  F('mr', '13-7', 'shieldbearer-hound:2,border-collie:2,buzzed-chipmunk:2,parish-sergeant:2,bramblewood-macaque:2', 'bear-cub:2,fox-kit:2,swift-fox:2,honey-badger-fury:2,feral-tuskboar:2', null, 'forest beasts at the King\'s Den'),
  F('mr', '13-8', 'border-collie:2,shieldbearer-hound:2', 'stag-knight:2,shimmerwing-stag:2', null, 'the Stag-Lord\'s stags'),
  // Map 14
  F('m5', '14-2', 'dust-hyena:2', 'grave-grin-hyena:2', null, 'its new reward (GI Executioner) in the Hyena Chorus'),
  F('m5', '14-6', 'alley-cat:1', 'grave-grin-hyena:1', null, 'a savanna hunter for the town\'s alley cat'),
  F('m5', '14-7', 'alley-cat:1,bramblewood-macaque:2', 'spitting-cobra:1,grave-grin-hyena:2', null, 'savanna cards for the alley cat and the pack macaques'),
  F('m5', '14-8', 'bramblewood-macaque:2', 'marching-elephant:2', null, 'the Warlord\'s elephants for the pack macaques'),
  // Map 15
  F('ml', '15-5', 'plains-zebra:3', 'warhorse-charger:3', null, 'the Charge of the Warhorses has warhorses, not savanna zebras'),
  // Map 16: village dogs and the redwood fox leave the taiga
  F('mt', '16-1', 'firetail-trickster:2', 'trickster-fox:2', null, 'the taiga\'s fox for the redwood one'),
  F('mt', '16-2', 'firetail-trickster:1', 'trickster-fox:1', null, 'the taiga\'s fox'),
  F('mt', '16-3', 'shieldbearer-hound:2,war-hound:2', 'woodland-caribou:2,timber-wolf-pack:2', null, 'its new reward and wolves for the village dogs'),
  F('mt', '16-4', 'shieldbearer-hound:1', 'musk-ox-calf:1', null, 'a musk ox calf for the village hound'),
  F('mt', '16-5', 'shieldbearer-hound:1', 'musk-ox-calf:1', null, 'a musk ox calf for the village hound'),
  F('mt', '16-6', 'firetail-trickster:2,warren-scout:2,weredog:1', 'trickster-fox:2,snowshoe-hare:2,pack-wolf-reaver:1', null, 'the Reaver\'s Hollow gets its Pack Wolf Reaver (its reward); taiga fox and hares'),
  // Map 17: the polar set replaces the beavers, chipmunks, porcupines, mice, eagles and dogs
  F('m6', '17-1', 'golden-eagle-diver:2,chipmunk-hoarder:2', 'arctic-tern:2,lemming-swarm:2', null, 'terns and lemmings for the mountain eagles and the chipmunks'),
  F('m6', '17-2', 'golden-eagle-diver:2,beaver-builder:2,harvest-mouse:2', 'arctic-tern:2,harp-seal-pup:2,krill-swarm:2', null, 'polar cards for the eagles, beavers and mice'),
  F('m6', '17-3', 'beaver-builder:2,dynamite-packrat:2,star-nosed-mole:2,harvest-mouse:2', 'harp-seal-pup:2,ringed-seal:2,krill-swarm:2,lemming-swarm:2', null, 'polar cards for the beavers, packrats, moles and mice'),
  F('m6', '17-4', 'beaver-builder:3,golden-eagle-diver:4,porcupine-roller:2,dynamite-packrat:2', 'beluga:2,harp-seal-pup:1,arctic-tern:2,snow-bunting-archer:2,snow-ermine:2,ringed-seal:2', null, 'its new reward (Beluga) by the seals; polar cards for the rest'),
  F('m6', '17-5', 'beaver-builder:3,porcupine-roller:2,chipmunk-hoarder:1', 'polar-bear:2,harp-seal-pup:1,tundra-musk-ox:2,snow-ermine:1', null, 'the Musk Ox Bulwark gets its musk oxen, and its new reward'),
  F('m6', '17-6', 'beaver-builder:1,porcupine-roller:2,war-hound:2', 'harp-seal-pup:1,tundra-musk-ox:2,frostmoon-howler:2', null, 'the Glacier Herd\'s musk oxen; GI Pack Howl wolves for the war hounds'),
  F('m6', '17-7', 'porcupine-roller:2,chipmunk-hoarder:2,dynamite-packrat:2', 'frostmoon-howler:2,timber-wolf-pack:2,ice-crevasse-wolf:2', null, 'wolves in the Alpha Howler\'s Den (its new reward: Frostmoon Howler)'),
  F('m6', '17-8', 'porcupine-roller:1,chipmunk-forager:1,harvest-mouse:1,buzzed-chipmunk:1,star-nosed-mole:2,beaver-builder:2', 'lemming-swarm:2,snow-ermine:2,krill-swarm:2,harp-seal-pup:2', null, 'polar cards for the rodents'),
  // Map 18
  F('md', '18-1', 'snapper-hatchling:2', 'thorny-devil:2', null, 'its own desert lizard for the swamp turtle'),
  F('md', '18-2', 'snapper-hatchling:2,grass-viper:1', 'thorny-devil:2,horned-lizard:1', null, 'desert lizards for the swamp turtle and the meadow viper'),
  F('md', '18-5', 'trapdoor-spider:2', 'glasswing-moth:2', null, 'its new reward (GI Brittle) beside the Obsidian Scorpions'),
  // Map 19: the Battering-Ram beetles and the beavers leave the bastions; Badger Berserker comes home; Ash Rain and Ashy
  F('m3', '19-2', 'chipmunk-stockpiler:1,beaver-builder:2', 'porcupine-roller:1,badger-trench-digger:2', null, 'the bastion\'s porcupine and badgers for the chipmunk and the beavers'),
  F('m3', '19-3', 'beetle-battering-ram:1', 'badger-berserker:1', {ashRain: true}, 'a badger for the beetle; Ash Rain (Codex: Ashen Spurn\'s signature, GI placement)'),
  F('m3', '19-4', 'beetle-battering-ram:2', 'badger-berserker:2', null, 'badgers for the beetles'),
  F('m3', '19-5', 'beaver-builder:2', 'badger-trench-digger:2', {ashRain: true}, 'badgers for the beavers; Ash Rain'),
  F('m3', '19-6', 'beetle-battering-ram:2', 'badger-berserker:2', {ashy: true}, 'badgers for the beetles; Ashy on the boss'),
  // Map 20: The Ancient Sloth Titan gets its Sloth Titan back (R2 had taken the only copy out)
  F('m11', '20-9', 'beaver-lumberjack:1', 'ancient-sloth-titan:1', null, 'the fight\'s namesake back, for a stray beaver'),
  // Map 21: no badgers on the Quiet Summit (R2 put them in because the bird flocks barely hurt you); the Summit's big elk and the
  // rams take their place, and the chapel's tortoise stands by the Cathedral Eagle. (Snow leopards were tried first: too weak, the
  // fights went to 97-100% and the tuner wanted Shields of 100-250.)
  F('m21', '21-2', 'badger-berserker:2', 'ur-elk:1,fumarole-ibex:1', null, 'the Summit\'s Ür-Elk and an ibex for the badgers (a Rare, for the Map 21 quarter)'),
  F('m21', '21-3', 'badger-berserker:2', 'ur-elk:1,rockslide-ram:1', null, 'Ür-Elk and a ram for the badgers (its new reward: Chapel Tortoise)'),
  F('m21', '21-4', 'badger-berserker:1', 'ur-elk:1', null, 'an Ür-Elk for the badger'),
  F('m21', '21-5', 'badger-berserker:2', 'ur-elk:1,rockslide-ram:1', null, 'Ür-Elk and a ram for the badgers'),
  F('m21', '21-6', 'badger-berserker:4,alpine-marmot:2', 'ur-elk:2,rockslide-ram:2,chapel-tortoise:2', null, 'the Prayer Bastion beside the Cathedral Eagle; Ür-Elk and rams for the badgers'),
  // Map 22: the Badger Berserkers stay. The Long Burrow, the badgers' endless sett, is a side map of the Rimefire Caldera and opens
  // here, so its badgers belong (THEMES: m22 takes Badger)
  F('m22', '22-7', 'cinder-stoker:2', 'weathervane-swift:2', null, 'its new reward (GI Field Breaker) in the field-heavy Steam Wall'),
  // Map 24
  F('m24', '24-5', 'howdah-archers:2', 'goose-sentry:2', null, 'the keep\'s own geese on its battlements (the howdahs are the besiegers\')'),
  // side maps
  F('mq', '1-A-2', 'badger-berserker:2', 'stag-beetle:2', null, 'a meadow beetle for the badgers'),
  F('mp', '2-A-1', 'quill-volley:2', 'great-crested-grebe:2', null, 'a pond grebe for the hedge porcupines'),
  F('mp', '2-A-3', 'quill-volley:2', 'muskrat-lodgekeeper:2', null, 'the lodge muskrats for the porcupines'),
  F('mp', '2-A-6', 'quill-volley:2', 'water-shrew:2', null, 'water shrews for the porcupines'),
  F('mg', '2-B-3', 'quill-volley:2', 'pincushion-urchin:2', null, 'the pool\'s urchins for the porcupines'),
  F('ms', '5-A-1', 'open-ocean-hermit-crab:3,mallard-marauder:2', 'mosquito-cloud:2,swamp-rabbit:1,anhinga-spearbird:2', null, 'swamp cards for the ocean crabs and the mallards'),
  F('ms', '5-A-4', 'mallard-marauder:2', 'alligator-gar:2', null, 'gars for the mallards'),
  F('mv', '11-A-2', 'echo-keeper:2', 'alpine-swift:2', null, 'swifts for the swamp\'s Echo Keepers'),
  F('mi', '17-A-1', 'chipmunk-hoarder:4,porcupine-roller:3', 'ringed-seal:2,lemming-swarm:2,snow-ermine:2,harp-seal-pup:1', null, 'polar cards for the chipmunks and porcupines'),
  F('mi', '17-A-2', 'beaver-builder:4,chipmunk-hoarder:2', 'greenland-shark:2,harp-seal-pup:2,krill-swarm:2', null, 'the Greenland Shark under the ice for the beavers'),
  F('mi', '17-A-3', 'chipmunk-hoarder:3,golden-eagle-diver:3,harvest-mouse:2', 'lemming-swarm:3,arctic-tern:3,krill-swarm:2', null, 'polar cards for the chipmunks, eagles and mice'),
  F('mi', '17-A-4', 'porcupine-roller:2,dynamite-packrat:2,quill-volley:2', 'ringed-seal:2,greenland-shark:2,ice-crevasse-wolf:2', null, 'the Hollow King\'s seals, shark and ice wolves'),
  F('m9', '19-A-2', 'echo-keeper:2', 'fire-salamander:2', null, 'salamanders for the swamp\'s Echo Keepers'),
  F('m9', '19-A-9', 'echo-keeper:2', 'cinder-gecko:2', null, 'geckos for the Echo Keepers'),
  F('m9', '19-A-10', 'echo-keeper:1,trapdoor-spider:1', 'fire-salamander:1,obsidian-scorpion:1', null, 'forge cards for the swamp and fungus-wood strays'),
  F('me', '20-A-3', 'echo-keeper:1', 'cinder-skeleton:1', null, 'a skeleton for the Echo Keeper in the Lich\'s Kiln'),
  F('me', '20-A-5', 'echo-keeper:2', 'cinder-gecko:2', null, 'geckos for the Echo Keepers'),
  F('me', '20-A-7', 'fungal-colossus:1', 'cinder-gecko:1', null, 'a gecko for the Morel Hollow\'s fungus'),
].map(f=>{ Object.keys(f).forEach(k=> f[k] === undefined && delete f[k]); return f; });

fs.writeFileSync(OUT, JSON.stringify({note: 'Package TH (2026-10-19), the thematic pass: tools/thematic_plan_2026_10_19.js writes this; tools/thematic_pass_2026_10_19.js apply puts it in the game. Revert a choice by deleting it here and re-applying from main.', place, fights}, null, 1) + '\n');
console.log(place.length, 'placements,', fights.length, 'fights');
