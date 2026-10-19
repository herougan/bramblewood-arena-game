# Art reuse map (2026-10-19)

The owner, 09:52: *"After we re-divvy out units, we will try to reuse 99% of the art."*

This lists every unit in `canonical/unit-themes.json`: 721 live, 4 in the pool and 109 proposed later versions. For each one it gives the existing art file it keeps. Built by `python3 tools/art_reuse_map.py`.

## Summary

- **804 of 834 units (96.4%) keep existing art.**
  - 621 have art of their own.
  - 81 proposed versions keep their base card's art.
  - 102 have no art of their own yet. Another card's art of the same animal (or the same kind) stands in for now.
- **30 have no usable match** and need new art. They are flagged below: 30 of them have a loose stand-in of the same species field (a different animal), 0 have nothing.
- The raid's boss units (the Leviathan Elder and the Kraken Brute) borrow their base card's art. Their own epic art is briefed in `docs/art/raid-elder-art-brief.md`.

"Own" art is a file in `art/cards/`, or the art embedded in `cards.json`. The build writes the embedded art to `assets/cards/<id>.webp`. A stand-in is only a placeholder: the card shows another creature's picture until its own is made.

## No usable match (30)

| Unit | Status | Animal | Note |
|---|---|---|---|
| Water Vole (`water-vole`) | live | vole | NO USABLE MATCH (needs new art); the nearest, loosely: Acorn Chipmunk (chipmunk): `art/cards/acorn-chipmunk.png` |
| Pine Marten (`pine-marten`) | live | pine marten | NO USABLE MATCH (needs new art); the nearest, loosely: Badger Berserker (badger): `art/cards/badger-berserker.png` |
| Hedgerow Shrew (`hedgerow-shrew`) | live | shrew | NO USABLE MATCH (needs new art); the nearest, loosely: Chained Binturong (binturong): `art/cards/chained-binturong.png` |
| Field Vole (`field-vole`) | live | vole | NO USABLE MATCH (needs new art); the nearest, loosely: Acorn Chipmunk (chipmunk): `art/cards/acorn-chipmunk.png` |
| Pincushion Urchin (`pincushion-urchin`) | live | sea urchin | NO USABLE MATCH (needs new art); the nearest, loosely: Sea Cucumber (sea cucumber): `art/cards/sea-cucumber.png` |
| Rock Pool Starfish (`rock-pool-starfish`) | live | starfish | NO USABLE MATCH (needs new art); the nearest, loosely: Sea Cucumber (sea cucumber): `art/cards/sea-cucumber.png` |
| Limpet Clinger (`limpet-clinger`) | live | limpet | NO USABLE MATCH (needs new art); the nearest, loosely: Abyss Lantern Squid (squid): `art/cards/abyss-lantern-squid.png` |
| Muskrat Lodgekeeper (`muskrat-lodgekeeper`) | live | muskrat | NO USABLE MATCH (needs new art); the nearest, loosely: Acorn Chipmunk (chipmunk): `art/cards/acorn-chipmunk.png` |
| Water Shrew (`water-shrew`) | live | shrew | NO USABLE MATCH (needs new art); the nearest, loosely: Chained Binturong (binturong): `art/cards/chained-binturong.png` |
| Leopard Slug (`leopard-slug`) | live | leopard slug | NO USABLE MATCH (needs new art); the nearest, loosely: Abyss Lantern Squid (squid): `art/cards/abyss-lantern-squid.png` |
| Fungus Gnat Cloud (`fungus-gnat-cloud`) | live | fungus gnat | NO USABLE MATCH (needs new art); the nearest, loosely: Amber Cicada (cicada): `art/cards/amber-cicada.png` |
| Springtail Hopper (`springtail-hopper`) | live | springtail | NO USABLE MATCH (needs new art); the nearest, loosely: Amber Cicada (cicada): `art/cards/amber-cicada.png` |
| Cave Pseudoscorpion (`cave-pseudoscorpion`) | live | pseudoscorpion | NO USABLE MATCH (needs new art); the nearest, loosely: Caustic Scorpion (scorpion): `cards.json (embedded; built to assets/cards/caustic-scorpion.webp)` |
| Whip Spider (`whip-spider`) | live | whip spider | NO USABLE MATCH (needs new art); the nearest, loosely: Caustic Scorpion (scorpion): `cards.json (embedded; built to assets/cards/caustic-scorpion.webp)` |
| Horseshoe Crab (`horseshoe-crab`) | live | horseshoe crab | NO USABLE MATCH (needs new art); the nearest, loosely: Caustic Scorpion (scorpion): `cards.json (embedded; built to assets/cards/caustic-scorpion.webp)` |
| Sea Hare (`sea-hare`) | live | sea slug | NO USABLE MATCH (needs new art); the nearest, loosely: Abyss Lantern Squid (squid): `art/cards/abyss-lantern-squid.png` |
| Mangrove Manatee (`mangrove-manatee`) | live | manatee | NO USABLE MATCH (needs new art); the nearest, loosely: Chained Binturong (binturong): `art/cards/chained-binturong.png` |
| Crown-of-thorns Star (`crown-of-thorns-star`) | live | starfish | NO USABLE MATCH (needs new art); the nearest, loosely: Sea Cucumber (sea cucumber): `art/cards/sea-cucumber.png` |
| Giant Clam (`giant-clam`) | live | giant clam | NO USABLE MATCH (needs new art); the nearest, loosely: Abyss Lantern Squid (squid): `art/cards/abyss-lantern-squid.png` |
| Hawthorn Shieldbug (`hawthorn-shieldbug`) | live | shieldbug | NO USABLE MATCH (needs new art); the nearest, loosely: Amber Cicada (cicada): `art/cards/amber-cicada.png` |
| Arctic Tern (`arctic-tern`) | live | arctic tern | NO USABLE MATCH (needs new art); the nearest, loosely: Abbey Goose (goose): `art/cards/abbey-goose.png` |
| Lemming Swarm (`lemming-swarm`) | live | lemming | NO USABLE MATCH (needs new art); the nearest, loosely: Acorn Chipmunk (chipmunk): `art/cards/acorn-chipmunk.png` |
| Shardclaw Pseudoscorpion (`dire-cave-pseudoscorpion`) | proposed | pseudoscorpion | NO USABLE MATCH (needs new art); the nearest, loosely: Caustic Scorpion (scorpion): `cards.json (embedded; built to assets/cards/caustic-scorpion.webp)` |
| Grandmother Whip Spider (`elder-whip-spider`) | proposed | whip spider | NO USABLE MATCH (needs new art); the nearest, loosely: Caustic Scorpion (scorpion): `cards.json (embedded; built to assets/cards/caustic-scorpion.webp)` |
| Needlebed Urchin (`dire-pincushion-urchin`) | proposed | sea urchin | NO USABLE MATCH (needs new art); the nearest, loosely: Sea Cucumber (sea cucumber): `art/cards/sea-cucumber.png` |
| Coralplate Horseshoe Crab (`dire-horseshoe-crab`) | proposed | horseshoe crab | NO USABLE MATCH (needs new art); the nearest, loosely: Caustic Scorpion (scorpion): `cards.json (embedded; built to assets/cards/caustic-scorpion.webp)` |
| Current Sea-Cow (`dire-mangrove-manatee`) | proposed | manatee | NO USABLE MATCH (needs new art); the nearest, loosely: Chained Binturong (binturong): `art/cards/chained-binturong.png` |
| Shadowbough Marten (`dire-pine-marten`) | proposed | pine marten | NO USABLE MATCH (needs new art); the nearest, loosely: Badger Berserker (badger): `art/cards/badger-berserker.png` |
| Oldwood Leopard Slug (`dire-leopard-slug`) | proposed | leopard slug | NO USABLE MATCH (needs new art); the nearest, loosely: Abyss Lantern Squid (squid): `art/cards/abyss-lantern-squid.png` |
| Rootlodge Muskrat (`dire-muskrat-lodgekeeper`) | proposed | muskrat | NO USABLE MATCH (needs new art); the nearest, loosely: Acorn Chipmunk (chipmunk): `art/cards/acorn-chipmunk.png` |

## Stand-ins: no own art yet (102)

| Unit | Status | Animal | Uses for now |
|---|---|---|---|
| Fen Mink (`fen-mink`) | live | mink | `art/cards/frostbitten-wolverine.png`: same kind: Frostbitten Wolverine (wolverine), until it has its own |
| Tidepool Trapper Crab (`tidepool-trapper-crab`) | live | crab | `art/cards/sulfur-vent-crab.png`: same animal: Sulfur Vent Crab (crab), until it has its own |
| Grave-Grin Hyena (`grave-grin-hyena`) | live | hyena | `art/cards/ashbone-ghoul.png`: same animal: Ashbone Ghoul (hyena), until it has its own |
| Bogfire Newt (`bogfire-newt`) | live | newt | `art/cards/marsh-wisp.png`: same animal: Marsh Wisp (newt), until it has its own |
| Plague Gnat Cloud (`plague-gnat-cloud`) | live | gnat | `art/cards/carrion-fly-swarm.png`: same kind: Carrion Fly Swarm (carrion fly), until it has its own |
| Glasswing Moth (`glasswing-moth`) | live | moth | `art/cards/ash-moth.png`: same animal: Ash Moth (moth), until it has its own |
| Rivergate Drummer (`rivergate-drummer`) | live | otter | `art/cards/fleetfootd.png`: same animal: Fleetfoot'd (otter), until it has its own |
| Frostmoon Howler (`frostmoon-howler`) | live | wolf | `art/cards/alpha-howler.png`: same animal: Alpha Howler (wolf), until it has its own |
| Chapel Tortoise (`chapel-tortoise`) | live | tortoise | `art/cards/elder-tortoise.png`: same animal: Elder Tortoise (tortoise), until it has its own |
| Weathervane Swift (`weathervane-swift`) | live | swift | `art/cards/gale-sprite.png`: same animal: Gale Sprite (swift), until it has its own |
| Pall Wraith (`pall-wraith`) | live | raven | `art/cards/bone-diviner.png`: same animal: Bone Diviner (raven), until it has its own |
| Sandfish (`sandfish`) | live | sandfish skink | `art/cards/cinder-gecko.png`: same kind: Cinder Gecko (gecko), until it has its own |
| Pale Oryx (`pale-oryx`) | live | oryx | `art/cards/pronghorn-racer.png`: same kind: Pronghorn Racer (pronghorn), until it has its own |
| Quicksand Queen (`quicksand-queen`) | live | ant | `art/cards/ant-hill.png`: same animal: Ant Hill (ant), until it has its own |
| River Mink (`river-mink`) | live | mink | `art/cards/frostbitten-wolverine.png`: same kind: Frostbitten Wolverine (wolverine), until it has its own |
| Signal Crayfish (`signal-crayfish`) | live | crayfish | `art/cards/grotto-lobster.png`: same kind: Grotto Lobster (lobster), until it has its own |
| Woodcock Lookout (`woodcock-lookout`) | live | woodcock | `art/cards/mudflat-godwit.png`: same kind: Mudflat Godwit (godwit), until it has its own |
| Grass Snake (`grass-snake`) | live | grass snake | `art/cards/adder-ambusher.png`: same kind: Adder Ambusher (adder), until it has its own |
| Ladybird Guard (`ladybird-guard`) | live | ladybird | `art/cards/beetle-battering-ram.png`: same kind: Beetle Battering-Ram (beetle), until it has its own |
| Stag Beetle (`stag-beetle`) | live | stag beetle | `art/cards/beetle-battering-ram.png`: same kind: Beetle Battering-Ram (beetle), until it has its own |
| Slow-worm (`slow-worm`) | live | slow-worm | `art/cards/cinder-gecko.png`: same kind: Cinder Gecko (gecko), until it has its own |
| Robin Redbreast (`robin-redbreast`) | live | robin | `art/cards/chapel-sparrow.png`: same kind: Chapel Sparrow (sparrow), until it has its own |
| Oystercatcher (`oystercatcher`) | live | oystercatcher | `art/cards/mudflat-godwit.png`: same kind: Mudflat Godwit (godwit), until it has its own |
| Sanderling (`sanderling`) | pool | sanderling | `art/cards/mudflat-godwit.png`: same kind: Mudflat Godwit (godwit), until it has its own |
| Grey Seal Bull (`grey-seal-bull`) | live | grey seal | `art/cards/harbor-seal.png`: same kind: Harbor Seal (harbor seal), until it has its own |
| Puffin Diver (`puffin-diver`) | live | puffin | `art/cards/ice-petrel.png`: same kind: Ice Petrel (petrel), until it has its own |
| Razorbill (`razorbill`) | live | razorbill | `art/cards/ice-petrel.png`: same kind: Ice Petrel (petrel), until it has its own |
| Kittiwake Flock (`kittiwake-flock`) | live | kittiwake | `art/cards/gull-thief.png`: same kind: Gull Thief (gull), until it has its own |
| Peregrine Stooper (`peregrine-stooper`) | live | peregrine falcon | `art/cards/dust-devil-kestrel.png`: same kind: Dust-devil Kestrel (kestrel), until it has its own |
| Fulmar Spitter (`fulmar-spitter`) | live | fulmar | `art/cards/ice-petrel.png`: same kind: Ice Petrel (petrel), until it has its own |
| Red-billed Chough (`red-billed-chough`) | live | chough | `art/cards/bone-diviner.png`: same kind: Bone Diviner (raven), until it has its own |
| Pyrenean Desman (`pyrenean-desman`) | live | desman | `art/cards/ore-smelter-mole.png`: same kind: Ore-Smelter Mole (mole), until it has its own |
| Great Crested Grebe (`great-crested-grebe`) | live | grebe | `art/cards/abbey-goose.png`: same kind: Abbey Goose (goose), until it has its own |
| Old Sturgeon (`old-sturgeon`) | live | sturgeon | `art/cards/archerfish.png`: same kind: Archerfish (archerfish), until it has its own |
| Diving Bell Spider (`diving-bell-spider`) | live | diving bell spider | `art/cards/gallery-orb-weaver.png`: same kind: Gallery Orb-Weaver (orb-weaver spider), until it has its own |
| Alligator Gar (`alligator-gar`) | live | gar | `art/cards/archerfish.png`: same kind: Archerfish (archerfish), until it has its own |
| Swamp Rabbit (`swamp-rabbit`) | live | rabbit | `art/cards/buck-brawler.png`: same animal: Buck Brawler (rabbit), until it has its own |
| Mosquito Cloud (`mosquito-cloud`) | live | mosquito | `art/cards/carrion-fly-swarm.png`: same kind: Carrion Fly Swarm (carrion fly), until it has its own |
| Fire Ant Raft (`fire-ant-raft`) | live | fire ant | `art/cards/ant-hill.png`: same kind: Ant Hill (ant), until it has its own |
| Anhinga Spearbird (`anhinga-spearbird`) | live | anhinga | `art/cards/battlement-heron.png`: same kind: Battlement Heron (heron), until it has its own |
| Roseate Spoonbill (`roseate-spoonbill`) | pool | spoonbill | `art/cards/battlement-heron.png`: same kind: Battlement Heron (heron), until it has its own |
| Booming Bittern (`booming-bittern`) | live | bittern | `art/cards/battlement-heron.png`: same kind: Battlement Heron (heron), until it has its own |
| Giant Water Bug (`giant-water-bug`) | live | water bug | `art/cards/puddle-skimmer.png`: same kind: Puddle Skimmer (pond skater), until it has its own |
| Water Scorpion (`water-scorpion`) | pool | water scorpion | `art/cards/puddle-skimmer.png`: same kind: Puddle Skimmer (pond skater), until it has its own |
| Greater Siren (`greater-siren`) | live | siren | `art/cards/cave-olm.png`: same kind: Cave Olm (olm), until it has its own |
| Marsh Harrier (`marsh-harrier`) | live | harrier | `art/cards/fire-hawk.png`: same kind: Fire Hawk (kite), until it has its own |
| Raft Spider (`raft-spider`) | live | raft spider | `art/cards/gallery-orb-weaver.png`: same kind: Gallery Orb-Weaver (orb-weaver spider), until it has its own |
| Wolf Spider Mother (`wolf-spider-mother`) | live | wolf spider | `art/cards/gallery-orb-weaver.png`: same kind: Gallery Orb-Weaver (orb-weaver spider), until it has its own |
| Truffle Piglet (`truffle-piglet`) | live | pig | `art/cards/basalt-boar.png`: same kind: Basalt Boar (boar), until it has its own |
| Red-backed Salamander (`red-backed-salamander`) | live | salamander | `art/cards/cinder-stoker.png`: same animal: Cinder Stoker (salamander), until it has its own |
| Cave Cricket (`cave-cricket`) | live | cave cricket | `art/cards/cricket-drummer.png`: same kind: Cricket Drummer (cricket), until it has its own |
| Ghost Crayfish (`ghost-crayfish`) | live | crayfish | `art/cards/grotto-lobster.png`: same kind: Grotto Lobster (lobster), until it has its own |
| Cave Swiftlet (`cave-swiftlet`) | live | swiftlet | `art/cards/gale-sprite.png`: same kind: Gale Sprite (swift), until it has its own |
| Giant Cave Huntsman (`giant-cave-huntsman`) | live | huntsman spider | `art/cards/gallery-orb-weaver.png`: same kind: Gallery Orb-Weaver (orb-weaver spider), until it has its own |
| Guano Beetle (`guano-beetle`) | live | beetle | `art/cards/beetle-battering-ram.png`: same animal: Beetle Battering-Ram (beetle), until it has its own |
| Banded Sea Krait (`banded-sea-krait`) | live | sea krait | `art/cards/adder-ambusher.png`: same kind: Adder Ambusher (adder), until it has its own |
| Fishing Cat (`fishing-cat`) | live | fishing cat | `cards.json (embedded; built to assets/cards/alley-cat.webp)`: same kind: Alley Cat (cat), until it has its own |
| Proboscis Monkey (`proboscis-monkey`) | live | proboscis monkey | `art/cards/bramblewood-macaque.png`: same kind: Bramblewood Macaque (macaque), until it has its own |
| Yellow-bellied Sea Snake (`yellow-bellied-sea-snake`) | live | sea snake | `art/cards/adder-ambusher.png`: same kind: Adder Ambusher (adder), until it has its own |
| Parrotfish (`parrotfish`) | live | parrotfish | `art/cards/archerfish.png`: same kind: Archerfish (archerfish), until it has its own |
| Lionfish (`lionfish`) | live | lionfish | `art/cards/archerfish.png`: same kind: Archerfish (archerfish), until it has its own |
| Great Barracuda (`great-barracuda`) | live | barracuda | `art/cards/archerfish.png`: same kind: Archerfish (archerfish), until it has its own |
| Whale Shark (`whale-shark`) | live | whale shark | `art/cards/coral-reef-shark.png`: same kind: Coral Reef Shark (shark), until it has its own |
| Chamois Leaper (`chamois-leaper`) | live | chamois | `art/cards/fumarole-ibex.png`: same kind: Fumarole Ibex (ibex), until it has its own |
| Alpine Swift (`alpine-swift`) | live | swift | `art/cards/gale-sprite.png`: same animal: Gale Sprite (swift), until it has its own |
| Wallcreeper (`wallcreeper`) | pool | wallcreeper | `art/cards/chapel-sparrow.png`: same kind: Chapel Sparrow (sparrow), until it has its own |
| Alpine Salamander (`alpine-salamander`) | live | salamander | `art/cards/cinder-stoker.png`: same animal: Cinder Stoker (salamander), until it has its own |
| Apollo Butterfly (`apollo-butterfly`) | live | butterfly | `art/cards/clover-butterfly.png`: same animal: Clover Butterfly (butterfly), until it has its own |
| Mountain Hare (`mountain-hare`) | live | hare | `art/cards/frost-hare-sprinter.png`: same animal: Frost Hare Sprinter (hare), until it has its own |
| Thorn Shrike (`thorn-shrike`) | live | shrike | `art/cards/chapel-sparrow.png`: same kind: Chapel Sparrow (sparrow), until it has its own |
| Hedge Weasel (`hedge-weasel`) | live | weasel | `art/cards/frostbitten-wolverine.png`: same kind: Frostbitten Wolverine (wolverine), until it has its own |
| Muntjac Barker (`muntjac-barker`) | live | muntjac | `art/cards/antler-skirmisher.png`: same kind: Antler Skirmisher (deer), until it has its own |
| Anvil Thrush (`anvil-thrush`) | live | thrush | `art/cards/chapel-sparrow.png`: same kind: Chapel Sparrow (sparrow), until it has its own |
| Garden Tiger Moth (`garden-tiger-moth`) | live | moth | `art/cards/ash-moth.png`: same animal: Ash Moth (moth), until it has its own |
| Polar Bear (`polar-bear`) | live | polar bear | `art/cards/alpine-avalanche.png`: same animal: Alpine Avalanche (polar bear), until it has its own |
| Harp Seal Pup (`harp-seal-pup`) | live | harp seal | `art/cards/harbor-seal.png`: same kind: Harbor Seal (harbor seal), until it has its own |
| Beluga (`beluga`) | live | beluga | `art/cards/fathom-leviathan.png`: same kind: Fathom Leviathan (whale), until it has its own |
| Krill Swarm (`krill-swarm`) | live | krill | `art/cards/mantis-shrimp.png`: same kind: Mantis Shrimp (mantis shrimp), until it has its own |
| Greenland Shark (`greenland-shark`) | live | greenland shark | `art/cards/coral-reef-shark.png`: same kind: Coral Reef Shark (shark), until it has its own |
| Ringed Seal (`ringed-seal`) | live | ringed seal | `art/cards/harbor-seal.png`: same kind: Harbor Seal (harbor seal), until it has its own |
| Woodland Caribou (`woodland-caribou`) | live | caribou | `art/cards/antler-skirmisher.png`: same kind: Antler Skirmisher (deer), until it has its own |
| Musk Ox Calf (`musk-ox-calf`) | live | musk ox | `art/cards/tundra-musk-ox.png`: same animal: Tundra Musk Ox (musk ox), until it has its own |
| Old Pale Crayfish (`elder-ghost-crayfish`) | proposed | crayfish | `art/cards/grotto-lobster.png`: same kind: Grotto Lobster (lobster), until it has its own |
| Breakwater Seal Bull (`dire-grey-seal-bull`) | proposed | grey seal | `art/cards/harbor-seal.png`: same kind: Harbor Seal (harbor seal), until it has its own |
| Old Brood Wolf Spider (`elder-wolf-spider-mother`) | proposed | wolf spider | `art/cards/gallery-orb-weaver.png`: same kind: Gallery Orb-Weaver (orb-weaver spider), until it has its own |
| Deep-Truffle Hog (`dire-truffle-piglet`) | proposed | pig | `art/cards/basalt-boar.png`: same kind: Basalt Boar (boar), until it has its own |
| Grand Proboscis Monkey (`elder-proboscis-monkey`) | proposed | proboscis monkey | `art/cards/bramblewood-macaque.png`: same kind: Bramblewood Macaque (macaque), until it has its own |
| Thornbreast Robin (`dire-robin-redbreast`) | proposed | robin | `art/cards/chapel-sparrow.png`: same kind: Chapel Sparrow (sparrow), until it has its own |
| Brambleshade Slow-worm (`dire-slow-worm`) | proposed | slow-worm | `art/cards/cinder-gecko.png`: same kind: Cinder Gecko (gecko), until it has its own |
| Summit Salamander (`dire-alpine-salamander`) | proposed | salamander | `art/cards/cinder-stoker.png`: same animal: Cinder Stoker (salamander), until it has its own |
| Summit Apollo (`dire-apollo-butterfly`) | proposed | butterfly | `art/cards/clover-butterfly.png`: same animal: Clover Butterfly (butterfly), until it has its own |
| Old Summit Chamois (`elder-chamois-leaper`) | proposed | chamois | `art/cards/fumarole-ibex.png`: same kind: Fumarole Ibex (ibex), until it has its own |
| Kelp Bell Spider (`dire-diving-bell-spider`) | proposed | diving bell spider | `art/cards/gallery-orb-weaver.png`: same kind: Gallery Orb-Weaver (orb-weaver spider), until it has its own |
| Kelp Signal Crayfish (`dire-signal-crayfish`) | proposed | crayfish | `art/cards/grotto-lobster.png`: same kind: Grotto Lobster (lobster), until it has its own |
| Old Brook Desman (`elder-pyrenean-desman`) | proposed | desman | `art/cards/ore-smelter-mole.png`: same kind: Ore-Smelter Mole (mole), until it has its own |
| Kelp Water Snake (`dire-grass-snake`) | proposed | grass snake | `art/cards/adder-ambusher.png`: same kind: Adder Ambusher (adder), until it has its own |
| Mangrove Bogfire Newt (`dire-bogfire-newt`) | proposed | newt | `art/cards/marsh-wisp.png`: same animal: Marsh Wisp (newt), until it has its own |
| Kelp Raft Spider (`dire-raft-spider`) | proposed | raft spider | `art/cards/gallery-orb-weaver.png`: same kind: Gallery Orb-Weaver (orb-weaver spider), until it has its own |
| Old Anhinga (`elder-anhinga-spearbird`) | proposed | anhinga | `art/cards/battlement-heron.png`: same kind: Battlement Heron (heron), until it has its own |
| Swampmire Gar (`dire-alligator-gar`) | proposed | gar | `art/cards/archerfish.png`: same kind: Archerfish (archerfish), until it has its own |
| Grand Fire Ant Raft (`elder-fire-ant-raft`) | proposed | fire ant | `art/cards/ant-hill.png`: same kind: Ant Hill (ant), until it has its own |
| Swampmire Mink (`dire-fen-mink`) | proposed | mink | `art/cards/frostbitten-wolverine.png`: same kind: Frostbitten Wolverine (wolverine), until it has its own |

## Proposed later versions: their base's art (81)

| Proposed name | Internal | Keeps |
|---|---|---|
| Peakroot Olm | `dire-cave-olm` | `art/cards/cave-olm.png` (its base, Cave Olm) |
| Crag Oilbird | `dire-oilbird` | `art/cards/oilbird.png` (its base, Oilbird) |
| Glimmer Vent Crab | `dire-sulfur-vent-crab` | `art/cards/sulfur-vent-crab.png` (its base, Sulfur Vent Crab) |
| Glimmerdeep Cavefish | `dire-blind-cave-fish` | `art/cards/blind-cave-fish.png` (its base, Blind Cave Fish) |
| Starceiling Glowworms | `dire-glowworm-cluster` | `art/cards/glowworm-cluster.png` (its base, Glowworm Cluster) |
| Grand Cinder Moth | `elder-sulfur-cinder-moth` | `art/cards/sulfur-cinder-moth.png` (its base, Sulfur Cinder Moth) |
| Peak Bat Cloud | `dire-cave-bat-swarm` | `art/cards/cave-bat-swarm.png` (its base, Cave Bat Swarm) |
| Grey Echo-Screecher | `elder-echo-screecher` | `art/cards/echo-screecher.png` (its base, Echo Screecher) |
| Glimmer Octopus Admiral | `dire-octopus-tactician` | `art/cards/octopus-tactician.png` (its base, Octopus Tactician) |
| Ironcoil Millipede | `dire-millipede-hauler` | `art/cards/millipede-hauler.png` (its base, Millipede Hauler) |
| Stormdiver Eagle | `dire-golden-eagle-diver` | `art/cards/golden-eagle-diver.png` (its base, Golden Eagle Diver) |
| Grand Summit Condor | `elder-peak-condor` | `art/cards/peak-condor.png` (its base, Peak Condor) |
| Eyrie Snowslide | `dire-alpine-avalanche` | `art/cards/alpine-avalanche.png` (its base, Alpine Avalanche) |
| Ledgehorn Goat | `dire-mountain-goat-climber` | `art/cards/mountain-goat-climber.png` (its base, Mountain Goat Climber) |
| Kelp Gull Corsair | `dire-gull-thief` | `art/cards/gull-thief.png` (its base, Gull Thief) |
| Old Floe Pelican | `elder-pelican-diver` | `art/cards/pelican-diver.png` (its base, Pelican Diver) |
| Kelpshell Crab | `dire-tide-pool-crab` | `art/cards/tide-pool-crab.png` (its base, Tide Pool Crab) |
| Grand Fiddler Host | `elder-fiddler-crab-swarm` | `art/cards/fiddler-crab-swarm.png` (its base, Fiddler Crab Swarm) |
| Undertow Eel | `dire-riptide-eel` | `art/cards/riptide-eel.png` (its base, Riptide Eel) |
| Spiral-Fort Conch | `dire-conch-crawler` | `art/cards/conch-crawler.png` (its base, Conch Crawler) |
| Bone-Dune Scorpion | `dire-caustic-scorpion` | `cards.json (embedded; built to assets/cards/caustic-scorpion.webp)` (its base, Caustic Scorpion) |
| Alcove Trapdoor Spider | `dire-trapdoor-spider` | `art/cards/trapdoor-spider.png` (its base, Trapdoor Spider) |
| Alcove Nightjar | `dire-nightjar-drifter` | `art/cards/nightjar-drifter.png` (its base, Nightjar Drifter) |
| Deepcap Colossus | `dire-fungal-colossus` | `art/cards/fungal-colossus.png` (its base, Fungal Colossus) |
| Gloamshade Moth | `dire-nightshade-moth` | `art/cards/nightshade-moth.png` (its base, Nightshade Moth) |
| Old Monarch Bladewing | `elder-monarch-wingblade` | `art/cards/monarch-wingblade.png` (its base, Monarch Wingblade) |
| Thornshoot Sprout | `dire-bramble-sprout` | `art/cards/bramble-sprout.png` (its base, Bramble Sprout) |
| Rootbound Oath-Keeper | `dire-hollow-oath-keeper` | `art/cards/hollow-oath-keeper.png` (its base, Hollow Oath-Keeper) |
| Mouldering Grub | `dire-compost-grub` | `art/cards/compost-grub.png` (its base, Compost Grub) |
| Old Bloat Leech | `elder-gangrenous-leech` | `art/cards/gangrenous-leech.png` (its base, Gangrenous Leech) |
| Cloudbeak Toucan | `dire-toucan-courier` | `art/cards/toucan-courier.png` (its base, Toucan Courier) |
| Peakbreaker Gorilla | `dire-ironback-gorilla` | `art/cards/ironback-gorilla.png` (its base, Ironback Gorilla) |
| Carrion Bloom | `dire-rafflesia` | `art/cards/rafflesia.png` (its base, Rafflesia) |
| Coral Sunbittern | `dire-sunbittern-strider` | `art/cards/sunbittern-strider.png` (its base, Sunbittern Strider) |
| Old Tideflat Godwit | `elder-mudflat-godwit` | `art/cards/mudflat-godwit.png` (its base, Mudflat Godwit) |
| Current Mudskipper | `dire-mangrove-mudskipper` | `art/cards/mangrove-mudskipper.png` (its base, Mangrove Mudskipper) |
| Scarred Reef Shark | `elder-reef-shark` | `art/cards/reef-shark.png` (its base, Reef Shark) |
| Deepchamber Nautilus | `dire-nautilus-drifter` | `art/cards/nautilus-drifter.png` (its base, Nautilus Drifter) |
| Reefwalker Monitor | `dire-mangrove-monitor` | `art/cards/mangrove-monitor.png` (its base, Mangrove Monitor) |
| Current Spirit | `dire-tide-spirit` | `art/cards/tide-spirit.png` (its base, Tide Spirit) |
| Bramble Bog-Hopper | `dire-puddle-hopper` | `art/cards/puddle-hopper.png` (its base, Puddle Hopper) |
| Old Meadow Croaker | `elder-meadow-frog` | `art/cards/meadow-frog.png` (its base, Meadow Frog) |
| Old Bramble Crow | `elder-field-crow` | `art/cards/field-crow.png` (its base, Field Crow) |
| Sporeburst Puffball | `dire-puffball-bombardier` | `art/cards/puffball-bombardier.png` (its base, Puffball Bombardier) |
| Rootdelve Ant | `dire-tunnel-ant` | `art/cards/tunnel-ant.png` (its base, Tunnel Ant) |
| Old Bramble Drummer | `elder-cricket-drummer` | `art/cards/cricket-drummer.png` (its base, Cricket Drummer) |
| Grand Dormouse | `elder-dormouse` | `art/cards/dormouse.png` (its base, Dormouse) |
| Bramblewatch Ent | `dire-ent` | `cards.json (embedded; built to assets/cards/ent.webp)` (its base, Ent) |
| Old Heartwood | `elder-heartwood-treant` | `art/cards/heartwood-treant.png` (its base, Heartwood Treant) |
| Summit Eagle-Owl | `dire-eagle-owl-quartermaster` | `art/cards/eagle-owl-quartermaster.png` (its base, Eagle-Owl Quartermaster) |
| Grand Eyrie Warden | `elder-eyrie-warden` | `art/cards/eyrie-warden.png` (its base, Eyrie Warden) |
| Summit Marmot | `dire-alpine-marmot` | `art/cards/alpine-marmot.png` (its base, Alpine Marmot) |
| Scarstone Reaver | `dire-wound-reaver` | `art/cards/wound-reaver.png` (its base, Wound Reaver) |
| Rimefire Stonedrop | `dire-stonedrop-vulture` | `art/cards/stonedrop-vulture.png` (its base, Stonedrop Vulture) |
| Sunken Hermit Crab | `dire-open-ocean-hermit-crab` | `art/cards/open-ocean-hermit-crab.png` (its base, Open-Ocean Hermit Crab) |
| Sunken Clownfish | `dire-clownfish-scout` | `art/cards/clownfish-scout.png` (its base, Clownfish Scout) |
| Old Wreck Shark | `elder-coral-reef-shark` | `art/cards/coral-reef-shark.png` (its base, Coral Reef Shark) |
| Grand Narwhal | `elder-narwhal-lancer` | `art/cards/narwhal-lancer.png` (its base, Narwhal Lancer) |
| Kraken Yearling | `dire-kraken-spawnling` | `art/cards/kraken-spawnling.png` (its base, Kraken Spawnling) |
| Mossveil Frog | `dire-camouflage-frog` | `art/cards/camouflage-frog.png` (its base, Camouflage Frog) |
| Old Lotus Frog | `elder-lotus-frog` | `art/cards/lotus-frog.png` (its base, Lotus Frog) |
| Bramble Pond Drake | `dire-pond-paddler` | `art/cards/pond-paddler.png` (its base, Pond Paddler) |
| Old Ford Kingfisher | `elder-ford-kingfisher` | `art/cards/ford-kingfisher.png` (its base, Ford Kingfisher) |
| Kelp Manta | `dire-reef-manta-glider` | `art/cards/reef-manta-glider.png` (its base, Reef Manta Glider) |
| Old Silverside | `elder-minnow-skitter` | `art/cards/minnow-skitter.png` (its base, Minnow Skitter) |
| Kelp Mayfly | `dire-mayfly-dancer` | `art/cards/mayfly-dancer.png` (its base, Mayfly Dancer) |
| Mirage Cuttlefish | `dire-cuttlefish-illusionist` | `art/cards/cuttlefish-illusionist.png` (its base, Cuttlefish Illusionist) |
| Old Mangrove Behemoth | `elder-bog-behemoth` | `art/cards/bog-behemoth.png` (its base, Bog Behemoth) |
| Mangrove Raven | `dire-raven-scout` | `art/cards/raven-scout.png` (its base, Raven Scout) |
| Mangrove-o'-Wisp | `dire-willow-o-wisp` | `art/cards/willow-o-wisp.png` (its base, Willow-o'-Wisp) |
| Swampmire Root Lurker | `dire-cypress-root-lurker` | `art/cards/cypress-root-lurker.png` (its base, Cypress Root Lurker) |
| Swampmire Constrictor | `dire-constrictor-coil` | `art/cards/constrictor-coil.png` (its base, Constrictor Coil) |
| Venom Patriarch | `elder-venomlord-serpent` | `art/cards/venomlord-serpent.png` (its base, Venomlord Serpent) |
| Mangrove Wisp | `dire-marsh-wisp` | `art/cards/marsh-wisp.png` (its base, Marsh Wisp) |
| Old Echo Keeper | `elder-echo-keeper` | `art/cards/echo-keeper.png` (its base, Echo Keeper) |
| Swampmire Leech | `dire-bog-leech` | `art/cards/bog-leech.png` (its base, Bog Leech) |
| Tundra Moon Howler | `dire-lunar-howler` | `art/cards/lunar-howler.png` (its base, Lunar Howler) |
| Rimefire Wolf Pack | `dire-glacier-wolf-pack` | `cards.json (embedded; built to assets/cards/glacier-wolf-pack.webp)` (its base, Glacier Wolf Pack) |
| Old Rimefire Wolverine | `elder-frostbitten-wolverine` | `art/cards/frostbitten-wolverine.png` (its base, Frostbitten Wolverine) |
| Peak Ash Condor | `dire-ash-cloud-condor` | `cards.json (embedded; built to assets/cards/ash-cloud-condor.webp)` (its base, Ash Cloud Condor) |
| Peak Gorge Wyrm | `dire-gorge-wyrm` | `art/cards/gorge-wyrm.png` (its base, Gorge Wyrm) |

## Non-player units

| Unit | Kind | Art |
|---|---|---|
| Kraken Brute (`kraken-spawnling~boss`) | raid-boss-unit | `art/cards/kraken-spawnling.png` (its base card; wants its own epic art (docs/art/raid-elder-art-brief.md)) |
| Leviathan Elder (`humpback-elder~boss`) | raid-boss-unit | `art/cards/humpback-elder.png` (its base card; wants its own epic art (docs/art/raid-elder-art-brief.md)) |
| The Drowned Colossus (`the-drowned-colossus`) | raid-boss | `art/raids/the-drowned-colossus.png` (raid boss portrait) |
| The Frost Yeti King (`the-frost-yeti-king`) | raid-boss | `art/raids/the-frost-yeti-king.png` (raid boss portrait) |
| The Deep Troll King (`the-deep-troll-king`) | raid-boss | `art/raids/the-deep-troll-king.png` (raid boss portrait) |
| The Savanna Warlord (`the-savanna-warlord`) | raid-boss | `art/raids/the-savanna-warlord.png` (raid boss portrait) |
| The Glacial Ape-King (`the-glacial-ape-king`) | raid-boss | `art/raids/the-glacial-ape-king.png` (raid boss portrait) |
| The Orca Vanguard King (`the-orca-vanguard-king`) | raid-boss | `art/raids/the-orca-vanguard-king.png` (raid boss portrait) |
| Wound Reaver's Domain (`wound-reavers-domain`) | raid-boss | `art/raids/wound-reavers-domain.png` (raid boss portrait) |
| The Phoenix Ember King (`the-phoenix-ember-king`) | raid-boss | `art/raids/the-phoenix-ember-king.png` (raid boss portrait) |
| The Avalanche Colossus (`the-avalanche-colossus`) | raid-boss | `art/raids/the-avalanche-colossus.png` (raid boss portrait) |
| The Rootworm Hive Mind (`the-rootworm-hive-mind`) | raid-boss | `art/raids/the-rootworm-hive-mind.png` (raid boss portrait) |
| The Hollow Oath (`the-hollow-oath`) | raid-boss | `art/raids/the-hollow-oath.png` (raid boss portrait) |
| The Warhorse Sovereign (`the-warhorse-sovereign`) | raid-boss | `art/raids/the-warhorse-sovereign.png` (raid boss portrait) |
| The Cave Warlord (`the-cave-warlord`) | raid-boss | `art/raids/the-cave-warlord.png` (raid boss portrait) |

## Units with their own art (621)

| Unit | Status | Animal | File |
|---|---|---|---|
| Otter Centurion (`otter-centurion`) | live | otter | `art/cards/otter-centurion.png` |
| Ent (`ent`) | live | owl | `cards.json (embedded; built to assets/cards/ent.webp)` |
| Dolphin Knight (`dolphin-knight`) | live | dolphin | `art/cards/dolphin-knight.png` |
| Bee Knight (`bee-knight`) | live | bee | `art/cards/bee-knight.png` |
| Bee Drone (`bee-drone`) | live | bee | `art/cards/bee-drone.png` |
| Caustic Scorpion (`caustic-scorpion`) | live | scorpion | `cards.json (embedded; built to assets/cards/caustic-scorpion.webp)` |
| Yeti (`yeti`) | live | yeti | `art/cards/yeti.png` |
| Scraper of Skies (`scraper-of-skies`) | live | bee | `art/cards/scraper-of-skies.png` |
| Bee Swarmling (`bee-swarmling`) | live | bee | `cards.json (embedded; built to assets/cards/bee-swarmling.webp)` |
| Forager Ant (`forager-ant`) | live | ant | `cards.json (embedded; built to assets/cards/forager-ant.webp)` |
| Soldier Ant (`soldier-ant`) | live | ant | `art/cards/soldier-ant.png` |
| Ant Warrior (`ant-warrior`) | live | ant | `art/cards/ant-warrior.png` |
| Ant Hill (`ant-hill`) | live | ant | `art/cards/ant-hill.png` |
| Otter Scout (`otter-scout`) | live | otter | `cards.json (embedded; built to assets/cards/otter-scout.webp)` |
| Otter Shieldback (`otter-shieldback`) | live | otter | `cards.json (embedded; built to assets/cards/otter-shieldback.webp)` |
| Owl Fletcher (`owl-fletcher`) | live | owl | `art/cards/owl-fletcher.png` |
| Owl Sentinel (`owl-sentinel`) | live | owl | `art/cards/owl-sentinel.png` |
| Great Horned Owl (`great-horned-owl`) | live | great horned owl | `cards.json (embedded; built to assets/cards/great-horned-owl.webp)` |
| Terrier Pup (`terrier-pup`) | live | dog | `cards.json (embedded; built to assets/cards/terrier-pup.webp)` |
| War Hound (`war-hound`) | live | dog | `art/cards/war-hound.png` |
| Armored Mastiff (`armored-mastiff`) | live | dog | `cards.json (embedded; built to assets/cards/armored-mastiff.webp)` |
| Alley Cat (`alley-cat`) | live | cat | `cards.json (embedded; built to assets/cards/alley-cat.webp)` |
| Bramblewood Lynx (`bramblewood-lynx`) | live | lynx | `cards.json (embedded; built to assets/cards/bramblewood-lynx.webp)` |
| War Panther (`war-panther`) | live | panther | `cards.json (embedded; built to assets/cards/war-panther.webp)` |
| Bramblewood Macaque (`bramblewood-macaque`) | live | macaque | `art/cards/bramblewood-macaque.png` |
| Silverback Brawler (`silverback-brawler`) | live | gorilla | `cards.json (embedded; built to assets/cards/silverback-brawler.webp)` |
| Trapdoor Spider (`trapdoor-spider`) | live | trapdoor spider | `art/cards/trapdoor-spider.png` |
| Webspire Sentinel (`webspire-sentinel`) | live | spider | `art/cards/webspire-sentinel.png` |
| Compost Grub (`compost-grub`) | live | grub | `art/cards/compost-grub.png` |
| Tunnel Wyrm (`tunnel-wyrm`) | live | worm | `cards.json (embedded; built to assets/cards/tunnel-wyrm.webp)` |
| Gorge Wyrm (`gorge-wyrm`) | live | worm | `art/cards/gorge-wyrm.png` |
| Cricket Drummer (`cricket-drummer`) | live | cricket | `art/cards/cricket-drummer.png` |
| Carrion Fly Swarm (`carrion-fly-swarm`) | live | carrion fly | `art/cards/carrion-fly-swarm.png` |
| Monarch Wingblade (`monarch-wingblade`) | live | monarch butterfly | `art/cards/monarch-wingblade.png` |
| Bramble Sprout (`bramble-sprout`) | live | hedgehog | `art/cards/bramble-sprout.png` |
| Thornvine Lasher (`thornvine-lasher`) | live | lizard | `art/cards/thornvine-lasher.png` |
| Fungal Colossus (`fungal-colossus`) | live | bear | `art/cards/fungal-colossus.png` |
| Elder Willow (`elder-willow`) | live | heron | `art/cards/elder-willow.png` |
| Ember Wisp (`ember-wisp`) | live | firefly | `art/cards/ember-wisp.png` |
| Tide Spirit (`tide-spirit`) | live | seahorse | `art/cards/tide-spirit.png` |
| Stoneheart Golem (`stoneheart-golem`) | live | gorilla | `art/cards/stoneheart-golem.png` |
| Gale Sprite (`gale-sprite`) | live | swift | `art/cards/gale-sprite.png` |
| Stormcaller (`stormcaller`) | live | owl | `art/cards/stormcaller.png` |
| Minnow Skitter (`minnow-skitter`) | live | minnow | `art/cards/minnow-skitter.png` |
| Pike Lancer (`pike-lancer`) | live | pike | `art/cards/pike-lancer.png` |
| Pufferfish Bulwark (`pufferfish-bulwark`) | live | pufferfish | `art/cards/pufferfish-bulwark.png` |
| Reef Shark (`reef-shark`) | live | shark | `art/cards/reef-shark.png` |
| Quillguard (`quillguard`) | live | porcupine | `art/cards/quillguard.png` |
| Komodo Warlord (`komodo-warlord`) | live | komodo dragon | `art/cards/komodo-warlord.png` |
| Raccoon Bandit (`raccoon-bandit`) | live | raccoon | `art/cards/raccoon-bandit.png` |
| Raccoon Warlord (`raccoon-warlord`) | live | raccoon | `art/cards/raccoon-warlord.png` |
| Badger Berserker (`badger-berserker`) | live | badger | `art/cards/badger-berserker.png` |
| Beetle Battering-Ram (`beetle-battering-ram`) | live | beetle | `art/cards/beetle-battering-ram.png` |
| Crocodile Ambusher (`crocodile-ambusher`) | live | crocodile | `art/cards/crocodile-ambusher.png` |
| Raven Scout (`raven-scout`) | live | raven | `art/cards/raven-scout.png` |
| Wolf Pack Runner (`wolf-pack-runner`) | live | wolf | `art/cards/wolf-pack-runner.png` |
| Boar Rampager (`boar-rampager`) | live | boar | `art/cards/boar-rampager.png` |
| Turtle Bastion (`turtle-bastion`) | live | turtle | `art/cards/turtle-bastion.png` |
| Chipmunk Skirmisher (`chipmunk-skirmisher`) | live | chipmunk | `art/cards/chipmunk-skirmisher.png` |
| Eagle Diver (`eagle-diver`) | live | eagle | `art/cards/eagle-diver.png` |
| Octopus Tactician (`octopus-tactician`) | live | octopus | `art/cards/octopus-tactician.png` |
| Nautilus Drifter (`nautilus-drifter`) | live | nautilus | `art/cards/nautilus-drifter.png` |
| Alpha Howler (`alpha-howler`) | live | wolf | `art/cards/alpha-howler.png` |
| Tusked Vanguard (`tusked-vanguard`) | live | boar | `art/cards/tusked-vanguard.png` |
| Snapper Hatchling (`snapper-hatchling`) | live | snapping turtle | `art/cards/snapper-hatchling.png` |
| Snapstick Turtle (`snapstick-turtle`) | live | snapping turtle | `art/cards/snapstick-turtle.png` |
| Chipmunk Stockpiler (`chipmunk-stockpiler`) | live | chipmunk | `art/cards/chipmunk-stockpiler.png` |
| Eyrie Warden (`eyrie-warden`) | live | eagle | `art/cards/eyrie-warden.png` |
| Badger Sapper (`badger-sapper`) | live | badger | `art/cards/badger-sapper.png` |
| Raven Harbinger (`raven-harbinger`) | live | raven | `art/cards/raven-harbinger.png` |
| Bear Cub (`bear-cub`) | live | bear | `art/cards/bear-cub.png` |
| Woodland Brawler (`woodland-brawler`) | live | bear | `art/cards/woodland-brawler.png` |
| Grizzly Vanguard (`grizzly-vanguard`) | live | bear | `art/cards/grizzly-vanguard.png` |
| Cave Warlord (`cave-warlord`) | live | bear | `art/cards/cave-warlord.png` |
| Fawn Scout (`fawn-scout`) | live | deer | `art/cards/fawn-scout.png` |
| Antler Skirmisher (`antler-skirmisher`) | live | deer | `art/cards/antler-skirmisher.png` |
| Stag Knight (`stag-knight`) | live | deer | `art/cards/stag-knight.png` |
| Elderhorn Monarch (`elderhorn-monarch`) | live | deer | `art/cards/elderhorn-monarch.png` |
| Fox Kit (`fox-kit`) | live | fox | `art/cards/fox-kit.png` |
| Firetail Trickster (`firetail-trickster`) | live | fox | `art/cards/firetail-trickster.png` |
| Fox Warchief (`fox-warchief`) | live | fox | `art/cards/fox-warchief.png` |
| Beaver Builder (`beaver-builder`) | live | beaver | `art/cards/beaver-builder.png` |
| Dam Wall (`dam-wall`) | live | beaver | `art/cards/dam-wall.png` |
| Lodge Engineer (`lodge-engineer`) | live | beaver | `art/cards/lodge-engineer.png` |
| Riverworks Bastion (`riverworks-bastion`) | live | beaver | `art/cards/riverworks-bastion.png` |
| Grass Viper (`grass-viper`) | live | viper | `art/cards/grass-viper.png` |
| Adder Ambusher (`adder-ambusher`) | live | adder | `art/cards/adder-ambusher.png` |
| Constrictor Coil (`constrictor-coil`) | live | python | `art/cards/constrictor-coil.png` |
| Venomlord Serpent (`venomlord-serpent`) | live | viper | `art/cards/venomlord-serpent.png` |
| Cave Flitter (`cave-flitter`) | live | bat | `art/cards/cave-flitter.png` |
| Echo Screecher (`echo-screecher`) | live | bat | `art/cards/echo-screecher.png` |
| Bat Swarmling (`bat-swarmling`) | live | bat | `art/cards/bat-swarmling.png` |
| Vampire Roost (`vampire-roost`) | live | vampire bat | `art/cards/vampire-roost.png` |
| Field Mouse (`field-mouse`) | live | mouse | `art/cards/field-mouse.png` |
| Mouse Sapper (`mouse-sapper`) | live | mouse | `art/cards/mouse-sapper.png` |
| Rodent King (`rodent-king`) | live | mouse | `art/cards/rodent-king.png` |
| Stable Colt (`stable-colt`) | live | horse | `art/cards/stable-colt.png` |
| Squire's Mount (`squires-mount`) | live | horse | `art/cards/squires-mount.png` |
| Warhorse Charger (`warhorse-charger`) | live | horse | `art/cards/warhorse-charger.png` |
| Cataphract Destrier (`cataphract-destrier`) | live | horse | `art/cards/cataphract-destrier.png` |
| Puddle Hopper (`puddle-hopper`) | live | frog | `art/cards/puddle-hopper.png` |
| Poison Dart Croaker (`poison-dart-croaker`) | live | frog | `art/cards/poison-dart-croaker.png` |
| Bog Behemoth (`bog-behemoth`) | live | frog | `art/cards/bog-behemoth.png` |
| Warren Scout (`warren-scout`) | live | rabbit | `art/cards/warren-scout.png` |
| Lucky Hopper (`lucky-hopper`) | live | rabbit | `art/cards/lucky-hopper.png` |
| Buck Brawler (`buck-brawler`) | live | rabbit | `art/cards/buck-brawler.png` |
| Hanging Loafer (`hanging-loafer`) | live | sloth | `art/cards/hanging-loafer.png` |
| Ancient Sloth Titan (`ancient-sloth-titan`) | live | sloth | `art/cards/ancient-sloth-titan.png` |
| Pond Paddler (`pond-paddler`) | live | duck | `art/cards/pond-paddler.png` |
| Mallard Marauder (`mallard-marauder`) | live | mallard | `art/cards/mallard-marauder.png` |
| Glacial Ape-King (`glacial-ape-king`) | live | ape | `art/cards/glacial-ape-king.png` |
| Sand Widow (`sand-widow`) | live | widow spider | `art/cards/sand-widow.png` |
| Orca Vanguard (`orca-vanguard`) | live | orca | `art/cards/orca-vanguard.png` |
| Quill Volley (`quill-volley`) | live | porcupine | `art/cards/quill-volley.png` |
| Stone Turtle Warden (`stone-turtle-warden`) | live | turtle | `art/cards/stone-turtle-warden.png` |
| Quill-Thorn Boar (`quill-thorn-boar`) | live | boar | `art/cards/quill-thorn-boar.png` |
| Berserker Boar (`berserker-boar`) | live | boar | `art/cards/berserker-boar.png` |
| Pack Wolf Reaver (`pack-wolf-reaver`) | live | wolf | `art/cards/pack-wolf-reaver.png` |
| Raven Hexcaller (`raven-hexcaller`) | live | raven | `art/cards/raven-hexcaller.png` |
| Eagle Sharpshooter (`eagle-sharpshooter`) | live | eagle | `art/cards/eagle-sharpshooter.png` |
| Hawk Arrowkeeper (`hawk-arrowkeeper`) | live | hawk | `art/cards/hawk-arrowkeeper.png` |
| Shrine Acolyte (`shrine-acolyte`) | live | cat | `art/cards/shrine-acolyte.png` |
| Shrine High Priest (`shrine-high-priest`) | live | fox | `art/cards/shrine-high-priest.png` |
| Blessed Avatar (`blessed-avatar`) | live | deer | `art/cards/blessed-avatar.png` |
| Hollow Oath-Keeper (`hollow-oath-keeper`) | live | salamander | `art/cards/hollow-oath-keeper.png` |
| Bone Diviner (`bone-diviner`) | live | raven | `art/cards/bone-diviner.png` |
| Insect Swarmling (`insect-swarmling`) | live | beetle | `art/cards/insect-swarmling.png` |
| Colony (`colony`) | live | ant | `art/cards/colony.png` |
| Nest (`nest`) | live | wasp | `art/cards/nest.png` |
| Howler Monkey (`howler-monkey`) | live | howler monkey | `art/cards/howler-monkey.png` |
| Jaguar Stalker (`jaguar-stalker`) | live | jaguar | `cards.json (embedded; built to assets/cards/jaguar-stalker.webp)` |
| Toucan Courier (`toucan-courier`) | live | toucan | `art/cards/toucan-courier.png` |
| Poison Dart Frog (`poison-dart-frog`) | live | frog | `art/cards/poison-dart-frog.png` |
| Strangler Vine (`strangler-vine`) | live | snake | `art/cards/strangler-vine.png` |
| Acacia Giraffe (`acacia-giraffe`) | live | giraffe | `art/cards/acacia-giraffe.png` |
| Savanna Cheetah (`savanna-cheetah`) | live | cheetah | `art/cards/savanna-cheetah.png` |
| Dust Hyena (`dust-hyena`) | live | hyena | `art/cards/dust-hyena.png` |
| Termite Mound (`termite-mound`) | live | termite | `art/cards/termite-mound.png` |
| Plains Zebra (`plains-zebra`) | live | zebra | `art/cards/plains-zebra.png` |
| Snow Owl Sentinel (`snow-owl-sentinel`) | live | snowy owl | `art/cards/snow-owl-sentinel.png` |
| Tundra Musk Ox (`tundra-musk-ox`) | live | musk ox | `art/cards/tundra-musk-ox.png` |
| Arctic Fox Raider (`arctic-fox-raider`) | live | arctic fox | `art/cards/arctic-fox-raider.png` |
| Permafrost Mammoth (`permafrost-mammoth`) | live | mammoth | `art/cards/permafrost-mammoth.png` |
| Ice-Crevasse Wolf (`ice-crevasse-wolf`) | live | wolf | `art/cards/ice-crevasse-wolf.png` |
| Clownfish Scout (`clownfish-scout`) | live | clownfish | `art/cards/clownfish-scout.png` |
| Coral Reef Shark (`coral-reef-shark`) | live | shark | `art/cards/coral-reef-shark.png` |
| Moray Ambusher (`moray-ambusher`) | live | moray eel | `art/cards/moray-ambusher.png` |
| Sea Turtle Elder (`sea-turtle-elder`) | live | sea turtle | `art/cards/sea-turtle-elder.png` |
| Coral Polyp Colony (`coral-polyp-colony`) | live | coral | `art/cards/coral-polyp-colony.png` |
| Mountain Goat Climber (`mountain-goat-climber`) | live | mountain goat | `art/cards/mountain-goat-climber.png` |
| Golden Eagle Diver (`golden-eagle-diver`) | live | eagle | `art/cards/golden-eagle-diver.png` |
| Alpine Avalanche (`alpine-avalanche`) | live | polar bear | `art/cards/alpine-avalanche.png` |
| Rockslide Ram (`rockslide-ram`) | live | ram | `art/cards/rockslide-ram.png` |
| Peak Condor (`peak-condor`) | live | condor | `art/cards/peak-condor.png` |
| Bog Leech (`bog-leech`) | live | leech | `art/cards/bog-leech.png` |
| Swamp Alligator (`swamp-alligator`) | live | alligator | `art/cards/swamp-alligator.png` |
| Mire Witch-Heron (`mire-witch-heron`) | live | heron | `art/cards/mire-witch-heron.png` |
| Marsh Gas Toad (`marsh-gas-toad`) | live | toad | `art/cards/marsh-gas-toad.png` |
| Cypress Root Lurker (`cypress-root-lurker`) | live | alligator | `art/cards/cypress-root-lurker.png` |
| Cave Bat Swarm (`cave-bat-swarm`) | live | bat | `art/cards/cave-bat-swarm.png` |
| Blind Cave Fish (`blind-cave-fish`) | live | cavefish | `art/cards/blind-cave-fish.png` |
| Stalactite Golem (`stalactite-golem`) | live | gorilla | `art/cards/stalactite-golem.png` |
| Glowworm Cluster (`glowworm-cluster`) | live | glowworm | `art/cards/glowworm-cluster.png` |
| Cave Bear (`deep-cave-troll`) | live | bear | `art/cards/deep-cave-troll.png` |
| Magma Salamander (`magma-salamander`) | live | salamander | `art/cards/magma-salamander.png` |
| Ash Cloud Condor (`ash-cloud-condor`) | live | condor | `cards.json (embedded; built to assets/cards/ash-cloud-condor.webp)` |
| Obsidian Scorpion (`obsidian-scorpion`) | live | scorpion | `art/cards/obsidian-scorpion.png` |
| Sulfur Vent Crab (`sulfur-vent-crab`) | live | crab | `art/cards/sulfur-vent-crab.png` |
| Fire Drake Hatchling (`fire-drake-hatchling`) | live | dragon | `art/cards/fire-drake-hatchling.png` |
| Taiga Lynx (`taiga-lynx`) | live | lynx | `art/cards/taiga-lynx.png` |
| Boreal Elk (`boreal-elk`) | live | elk | `art/cards/boreal-elk.png` |
| Pinecone Sapper (`pinecone-sapper`) | live | pangolin | `art/cards/pinecone-sapper.png` |
| Snowshoe Hare (`snowshoe-hare`) | live | hare | `art/cards/snowshoe-hare.png` |
| Timber Wolf Pack Leader (`timber-wolf-pack`) | live | wolf | `art/cards/timber-wolf-pack.png` |
| Tide Pool Crab (`tide-pool-crab`) | live | crab | `art/cards/tide-pool-crab.png` |
| Gull Thief (`gull-thief`) | live | gull | `art/cards/gull-thief.png` |
| Riptide Eel (`riptide-eel`) | live | eel | `art/cards/riptide-eel.png` |
| Barnacle Fortress (`barnacle-fortress`) | live | barnacle | `art/cards/barnacle-fortress.png` |
| Pelican Diver (`pelican-diver`) | live | pelican | `art/cards/pelican-diver.png` |
| Mangrove Mudskipper (`mangrove-mudskipper`) | live | mudskipper | `art/cards/mangrove-mudskipper.png` |
| Mangrove Monitor (`mangrove-monitor`) | live | monitor lizard | `art/cards/mangrove-monitor.png` |
| Fiddler Crab Swarm (`fiddler-crab-swarm`) | live | fiddler crab | `art/cards/fiddler-crab-swarm.png` |
| Mangrove Kingfisher (`mangrove-kingfisher`) | live | kingfisher | `art/cards/mangrove-kingfisher.png` |
| Gangrenous Leech (`gangrenous-leech`) | live | leech | `art/cards/gangrenous-leech.png` |
| Wound Reaver (`wound-reaver`) | live | lizard | `art/cards/wound-reaver.png` |
| War-Drum Mandrill (`war-drum-mandrill`) | live | mandrill | `art/cards/war-drum-mandrill.png` |
| Swarm Matriarch (`swarm-matriarch`) | live | bee | `art/cards/swarm-matriarch.png` |
| Feral Tuskboar (`feral-tuskboar`) | live | boar | `art/cards/feral-tuskboar.png` |
| Ravenous Wolverine (`ravenous-wolverine`) | live | wolverine | `art/cards/ravenous-wolverine.png` |
| Trickster Fox (`trickster-fox`) | live | fox | `art/cards/trickster-fox.png` |
| Old-Growth Tortoise (`old-growth-tortoise`) | live | tortoise | `art/cards/old-growth-tortoise.png` |
| Shimmerwing Stag (`shimmerwing-stag`) | live | deer | `art/cards/shimmerwing-stag.png` |
| Open-Ocean Hermit Crab (`open-ocean-hermit-crab`) | live | hermit crab | `art/cards/open-ocean-hermit-crab.png` |
| Reef Manta Glider (`reef-manta-glider`) | live | manta ray | `art/cards/reef-manta-glider.png` |
| Narwhal Lancer (`narwhal-lancer`) | live | narwhal | `art/cards/narwhal-lancer.png` |
| Humpback Elder (`humpback-elder`) | live | humpback whale | `art/cards/humpback-elder.png` |
| Dune Jackal (`dune-jackal`) | live | jackal | `art/cards/dune-jackal.png` |
| Sandstorm Roc (`sandstorm-roc`) | live | eagle | `art/cards/sandstorm-roc.png` |
| Frost Hare Sprinter (`frost-hare-sprinter`) | live | hare | `art/cards/frost-hare-sprinter.png` |
| Glacier Wolf Pack (`glacier-wolf-pack`) | live | wolf | `cards.json (embedded; built to assets/cards/glacier-wolf-pack.webp)` |
| Porcupine Roller (`porcupine-roller`) | live | porcupine | `art/cards/porcupine-roller.png` |
| Quillback Elder (`quillback-elder`) | live | porcupine | `art/cards/quillback-elder.png` |
| Trash Panda Trickster (`trash-panda-trickster`) | live | raccoon | `art/cards/trash-panda-trickster.png` |
| Raccoon Nightcrew (`raccoon-nightcrew`) | live | raccoon | `art/cards/raccoon-nightcrew.png` |
| Honey Badger Fury (`honey-badger-fury`) | live | honey badger | `art/cards/honey-badger-fury.png` |
| Badger Trench Digger (`badger-trench-digger`) | live | badger | `art/cards/badger-trench-digger.png` |
| Chipmunk Hoarder (`chipmunk-hoarder`) | live | chipmunk | `art/cards/chipmunk-hoarder.png` |
| Chipmunk Cavalry (`chipmunk-cavalry`) | live | chipmunk | `art/cards/chipmunk-cavalry.png` |
| Cuttlefish Illusionist (`cuttlefish-illusionist`) | live | cuttlefish | `art/cards/cuttlefish-illusionist.png` |
| Kraken Spawnling (`kraken-spawnling`) | live | octopus | `art/cards/kraken-spawnling.png` |
| Slowpoke Sentinel (`slowpoke-sentinel`) | live | sloth | `art/cards/slowpoke-sentinel.png` |
| Canopy Sloth Guardian (`canopy-sloth-guardian`) | live | sloth | `art/cards/canopy-sloth-guardian.png` |
| Duckling Squadron (`duckling-squadron`) | live | duck | `art/cards/duckling-squadron.png` |
| Migration Leader (`migration-leader`) | live | duck | `art/cards/migration-leader.png` |
| Otter Riverguard (`otter-riverguard`) | live | otter | `art/cards/otter-riverguard.png` |
| Owl Nightwatch (`owl-nightwatch`) | live | owl | `art/cards/owl-nightwatch.png` |
| Shepherd (`shepherds-bark`) | live | dog | `art/cards/shepherds-bark.png` |
| Tomcat (`feral-tomcat`) | live | cat | `art/cards/feral-tomcat.png` |
| Rootworm Colony (`rootworm-colony`) | live | worm | `art/cards/rootworm-colony.png` |
| Pack Rat Looter (`pack-rat-looter`) | live | pack rat | `art/cards/pack-rat-looter.png` |
| Camouflage Frog (`camouflage-frog`) | live | frog | `art/cards/camouflage-frog.png` |
| Jackrabbit Sprinter (`jackrabbit-sprinter`) | live | hare | `art/cards/jackrabbit-sprinter.png` |
| Shrine Bell-Ringer (`shrine-bell-ringer`) | live | sparrow | `art/cards/shrine-bell-ringer.png` |
| Ember Jackal (`ember-jackal`) | live | jackal | `art/cards/ember-jackal.png` |
| Magma Titan (`magma-titan`) | live | gorilla | `art/cards/magma-titan.png` |
| Phoenix Fledgling (`phoenix-fledgling`) | live | phoenix | `art/cards/phoenix-fledgling.png` |
| Basalt Boar (`basalt-boar`) | live | boar | `art/cards/basalt-boar.png` |
| Pyroclast Wyrm (`pyroclast-wyrm`) | live | dragon | `art/cards/pyroclast-wyrm.png` |
| Barrow Leech (`barrow-leech-bat`) | live | leech | `art/cards/barrow-leech-bat.png` |
| Coral Current Eel (`coral-current-eel`) | live | eel | `art/cards/coral-current-eel.png` |
| Frost Thistle Lynx (`frost-thistle-lynx`) | live | lynx | `art/cards/frost-thistle-lynx.png` |
| Dune Jackal Scout (`dune-jackal-scout`) | live | jackal | `art/cards/dune-jackal-scout.png` |
| Sulfur Cinder Moth (`sulfur-cinder-moth`) | live | moth | `art/cards/sulfur-cinder-moth.png` |
| Glacier Yak (`glacier-yak`) | live | yak | `art/cards/glacier-yak.png` |
| Nightshade Moth (`nightshade-moth`) | live | moth | `art/cards/nightshade-moth.png` |
| Voltaic Eel (`voltaic-eel`) | live | electric eel | `art/cards/voltaic-eel.png` |
| Cinder Hornet (`cinder-hornet`) | live | hornet | `art/cards/cinder-hornet.png` |
| Elder Tortoise (`elder-tortoise`) | live | tortoise | `art/cards/elder-tortoise.png` |
| Maggot (`maggot-swarmling`) | live | maggot | `art/cards/maggot-swarmling.png` |
| Rot-Swollen Carcass (`rot-swollen-carcass`) | live | maggot | `art/cards/rot-swollen-carcass.png` |
| King Maker (`king-maker`) | live | fox | `art/cards/king-maker.png` |
| Otter Kit (`otter-kit`) | live | otter | `art/cards/otter-kit.png` |
| Otter Paddler (`otter-paddler`) | live | otter | `art/cards/otter-paddler.png` |
| Otter Guard (`otter-guard`) | live | otter | `art/cards/otter-guard.png` |
| Honey Bee (`honey-bee`) | live | honey bee | `art/cards/honey-bee.png` |
| Bee Forager (`bee-forager`) | live | bee | `art/cards/bee-forager.png` |
| Bee Sentry (`bee-sentry`) | live | bee | `art/cards/bee-sentry.png` |
| Worker Ant (`worker-ant`) | live | ant | `art/cards/worker-ant.png` |
| Tunnel Ant (`tunnel-ant`) | live | ant | `art/cards/tunnel-ant.png` |
| Ant Scout (`ant-scout`) | live | ant | `art/cards/ant-scout.png` |
| Silver Minnow (`silver-minnow`) | live | minnow | `art/cards/silver-minnow.png` |
| Pond Trout (`pond-trout`) | live | trout | `art/cards/pond-trout.png` |
| River Carp (`river-carp`) | live | carp | `art/cards/river-carp.png` |
| Duckling (`duckling`) | live | duck | `art/cards/duckling.png` |
| Pond Duck (`pond-duck`) | live | duck | `art/cards/pond-duck.png` |
| Duck Paddler (`duck-paddler`) | live | duck | `art/cards/duck-paddler.png` |
| Meadow Rabbit (`meadow-rabbit`) | live | rabbit | `art/cards/meadow-rabbit.png` |
| Cottontail (`cottontail`) | live | rabbit | `art/cards/cottontail.png` |
| Burrow Rabbit (`burrow-rabbit`) | live | rabbit | `art/cards/burrow-rabbit.png` |
| Chipmunk Forager (`chipmunk-forager`) | live | chipmunk | `art/cards/chipmunk-forager.png` |
| Acorn Chipmunk (`acorn-chipmunk`) | live | chipmunk | `art/cards/acorn-chipmunk.png` |
| Cobalt Fledgling (`cobalt-talon-fledgling`) | live | hummingbird | `art/cards/cobalt-talon-fledgling.png` |
| Crimson Recruit (`crimson-wing-recruit`) | live | hummingbird | `art/cards/crimson-wing-recruit.png` |
| Mosswing (`mosswing-laborer`) | live | hummingbird | `art/cards/mosswing-laborer.png` |
| Gold-throated Acolyte (`gold-throated-acolyte`) | live | hummingbird | `art/cards/gold-throated-acolyte.png` |
| Violet Vane Fletcher (`violet-vane-fletcher`) | live | hummingbird | `art/cards/violet-vane-fletcher.png` |
| Sunthroat Courier (`sunthroat-courier`) | live | hummingbird | `art/cards/sunthroat-courier.png` |
| Voidfeather Scout (`voidfeather-scout`) | live | hummingbird | `art/cards/voidfeather-scout.png` |
| Crimson Wing Duelist Cadet (`crimson-wing-duelist-cadet`) | live | hummingbird | `art/cards/crimson-wing-duelist-cadet.png` |
| Cobalt Talon Skirmisher (`cobalt-talon-skirmisher`) | live | hummingbird | `art/cards/cobalt-talon-skirmisher.png` |
| Dominion Nestguard (`dominion-nestguard`) | live | hummingbird | `art/cards/dominion-nestguard.png` |
| River Warden (`river-warden`) | live | otter | `art/cards/river-warden.png` |
| Sunspire Envoy (`sunspire-envoy`) | live | hummingbird | `art/cards/sunspire-envoy.png` |
| Quarry Mole (`quarry-mole`) | live | mole | `art/cards/quarry-mole.png` |
| Bonebreaker (`bramblewood-bonebreaker`) | live | bear | `art/cards/bramblewood-bonebreaker.png` |
| Big Bee (`bee-tank`) | live | bee | `art/cards/bee-tank.png` |
| Wandering Traveller (`wandering-traveller`) | live | rat | `art/cards/wandering-traveller.png` |
| Red Dragon (`red-dragon`) | live | dragon | `art/cards/red-dragon.png` |
| White Dragon (`white-dragon`) | live | dragon | `art/cards/white-dragon.png` |
| Blue Dragon (`blue-dragon`) | live | dragon | `art/cards/blue-dragon.png` |
| Green Dragon (`green-dragon`) | live | dragon | `art/cards/green-dragon.png` |
| Black Dragon (`black-dragon`) | live | dragon | `art/cards/black-dragon.png` |
| Frog (`frog-imp`) | live | frog | `art/cards/frog-imp.png` |
| Fly (`fly-imp`) | live | fly | `art/cards/fly-imp.png` |
| Harvest Mouse (`harvest-mouse`) | live | mouse | `art/cards/harvest-mouse.png` |
| Garden Snail (`garden-snail`) | live | snail | `art/cards/garden-snail.png` |
| Hedgehog Scout (`hedgehog-scout`) | live | hedgehog | `art/cards/hedgehog-scout.png` |
| Meadow Frog (`meadow-frog`) | live | frog | `art/cards/meadow-frog.png` |
| Pill Bug (`pill-bug`) | live | pill bug | `art/cards/pill-bug.png` |
| Sparrow Chick (`sparrow-chick`) | live | sparrow | `art/cards/sparrow-chick.png` |
| Rabbit Kit (`rabbit-kit`) | live | rabbit | `art/cards/rabbit-kit.png` |
| Beetle Grunt (`beetle-grunt`) | live | beetle | `art/cards/beetle-grunt.png` |
| Earthworm (`earthworm`) | live | earthworm | `art/cards/earthworm.png` |
| Dormouse (`dormouse`) | live | dormouse | `art/cards/dormouse.png` |
| Guppy (`guppy`) | live | guppy | `art/cards/guppy.png` |
| Tiny Cave Dweller (`tiny-cave-dweller`) | live | isopod | `art/cards/tiny-cave-dweller.png` |
| Beaver Lumberjack (`beaver-lumberjack`) | live | beaver | `art/cards/beaver-lumberjack.png` |
| Courier Pigeon (`courier-pigeon`) | live | pigeon | `art/cards/courier-pigeon.png` |
| Echo Keeper (`echo-keeper`) | live | crow | `art/cards/echo-keeper.png` |
| Marsh Wisp (`marsh-wisp`) | live | newt | `art/cards/marsh-wisp.png` |
| Bog Revenant (`bog-revenant`) | live | bog turtle | `art/cards/bog-revenant.png` |
| The Unremembered (`the-unremembered`) | live | heron | `art/cards/the-unremembered.png` |
| Cinder Imp (`cinder-imp`) | live | fox | `art/cards/cinder-imp.png` |
| Ash Imp (`ash-imp`) | live | cat | `art/cards/ash-imp.png` |
| Pit Glutton (`pit-glutton`) | live | toad | `art/cards/pit-glutton.png` |
| Brimstone Hound (`brimstone-hound`) | live | dog | `art/cards/brimstone-hound.png` |
| Blackmass Acolyte (`blackmass-acolyte`) | live | rat | `art/cards/blackmass-acolyte.png` |
| Dread Bell (`dread-bell`) | live | bat | `art/cards/dread-bell.png` |
| Tithe Collector (`tithe-collector`) | live | cat | `art/cards/tithe-collector.png` |
| Lurking Dread (`lurking-dread`) | live | cat | `art/cards/lurking-dread.png` |
| Puppeteer Imp (`puppeteer-imp`) | live | fox | `art/cards/puppeteer-imp.png` |
| The Sixfold (`the-sixfold`) | live | cat | `art/cards/the-sixfold.png` |
| Fleetfoot'd (`fleetfootd`) | live | otter | `art/cards/fleetfootd.png` |
| Crossed-Eyes (`crossed-eyes`) | live | pigeon | `art/cards/crossed-eyes.png` |
| Chapel Sparrow (`chapel-sparrow`) | live | sparrow | `art/cards/chapel-sparrow.png` |
| Candle Moth (`candle-moth`) | live | moth | `art/cards/candle-moth.png` |
| Hymn Wren (`hymn-wren`) | live | wren | `art/cards/hymn-wren.png` |
| Abbey Goose (`abbey-goose`) | live | goose | `art/cards/abbey-goose.png` |
| Golden Magpie (`golden-magpie`) | live | magpie | `art/cards/golden-magpie.png` |
| Friar Badger (`friar-badger`) | live | badger | `art/cards/friar-badger.png` |
| Storm Heron (`storm-heron`) | live | heron | `art/cards/storm-heron.png` |
| Vigil Owl (`vigil-owl`) | live | owl | `art/cards/vigil-owl.png` |
| Cathedral Eagle (`cathedral-eagle`) | live | eagle | `art/cards/cathedral-eagle.png` |
| MissingNo. (`missingno`) | live | bird | `art/cards/missingno.png` |
| Ironmaw Warwolf (`ironmaw-warwolf`) | live | wolf | `art/cards/ironmaw-warwolf.png` |
| Weredog (`weredog`) | live | dog | `art/cards/weredog.png` |
| Parish Sergeant (`parish-sergeant`) | live | badger | `art/cards/parish-sergeant.png` |
| Land Tiller (`land-tiller`) | live | mouse | `art/cards/land-tiller.png` |
| Village Miller (`village-miller`) | live | mouse | `art/cards/village-miller.png` |
| Night Watchman (`night-watchman`) | live | owl | `art/cards/night-watchman.png` |
| Otter Ferryman (`otter-ferryman`) | live | otter | `art/cards/otter-ferryman.png` |
| Otter Netmender (`otter-netmender`) | live | otter | `art/cards/otter-netmender.png` |
| Nectar Vintner (`nectar-vintner`) | live | hummingbird | `art/cards/nectar-vintner.png` |
| Dawn Bellringer (`dawn-bellringer`) | live | hummingbird | `art/cards/dawn-bellringer.png` |
| Guardian Shield (`summoned-shield`) | live | pangolin | `art/cards/summoned-shield.png` |
| Shieldbearer Hound (`shieldbearer-hound`) | live | dog | `art/cards/shieldbearer-hound.png` |
| Stoat Cutthroat (`stoat-cutthroat`) | live | stoat | `art/cards/stoat-cutthroat.png` |
| Two-Headed Calf (`two-headed-calf`) | live | cow | `art/cards/two-headed-calf.png` |
| Upside-Down Bat (`upside-down-bat`) | live | bat | `art/cards/upside-down-bat.png` |
| Teatime Toad (`teatime-toad`) | live | toad | `art/cards/teatime-toad.png` |
| Mirror Moth (`mirror-moth`) | live | moth | `art/cards/mirror-moth.png` |
| Snail Mail (`snail-mail`) | live | snail | `art/cards/snail-mail.png` |
| Glass Golem (`glass-golem`) | live | armadillo | `art/cards/glass-golem.png` |
| Wrong-Way Salmon (`wrong-way-salmon`) | live | salmon | `art/cards/wrong-way-salmon.png` |
| Inside-Out Hedgehog (`inside-out-hedgehog`) | live | hedgehog | `art/cards/inside-out-hedgehog.png` |
| Talon Archer (`talon-archer`) | live | hawk | `art/cards/talon-archer.png` |
| Sergeant Bramblefox (`sergeant-bramblefox`) | live | fox | `art/cards/sergeant-bramblefox.png` |
| The Thistle Baron (`thistle-baron`) | live | badger | `art/cards/thistle-baron.png` |
| The Old Shell (`old-shell`) | live | sea turtle | `art/cards/old-shell.png` |
| The Drowned Matriarch (`drowned-matriarch`) | live | octopus | `art/cards/drowned-matriarch.png` |
| Yeti Chieftain (`yeti-chieftain`) | live | yeti | `art/cards/yeti-chieftain.png` |
| Echo Matriarch (`echo-matriarch`) | live | bat | `art/cards/echo-matriarch.png` |
| Pride Queen (`pride-queen`) | live | lion | `art/cards/pride-queen.png` |
| Wolfsbane Alpha (`wolfsbane-alpha`) | live | wolf | `art/cards/wolfsbane-alpha.png` |
| Reef Admiral (`reef-admiral`) | live | clownfish | `art/cards/reef-admiral.png` |
| The Heron Hag (`heron-hag`) | live | heron | `art/cards/heron-hag.png` |
| Shell-Cracker (`shell-cracker`) | live | otter | `art/cards/shell-cracker.png` |
| Rivergate Recruit (`rivergate-recruit`) | live | otter | `art/cards/rivergate-recruit.png` |
| Riverstone Slinger (`riverstone-slinger`) | live | otter | `art/cards/riverstone-slinger.png` |
| Net Thrower (`net-thrower`) | live | otter | `art/cards/net-thrower.png` |
| Optio of the Ford (`optio-of-the-ford`) | live | otter | `art/cards/optio-of-the-ford.png` |
| Marshal of Rivergate (`marshal-of-rivergate`) | live | otter | `art/cards/marshal-of-rivergate.png` |
| Daily Post (`daily-post`) | live | hummingbird | `art/cards/daily-post.png` |
| Petal Fletcher (`petal-fletcher`) | live | hummingbird | `art/cards/petal-fletcher.png` |
| Nectar Sipper (`nectar-sipper`) | live | hummingbird | `art/cards/nectar-sipper.png` |
| Sunfeather Scout (`sunfeather-scout`) | live | hummingbird | `art/cards/sunfeather-scout.png` |
| Lantern Bearer (`lantern-bearer`) | live | hummingbird | `art/cards/lantern-bearer.png` |
| Hush-Wing Spy (`hush-wing-spy`) | live | hummingbird | `art/cards/hush-wing-spy.png` |
| Ruby-Throat Duelist (`ruby-throat-duelist`) | live | hummingbird | `art/cards/ruby-throat-duelist.png` |
| Sunspire Choirmother (`sunspire-choirmother`) | live | hummingbird | `art/cards/sunspire-choirmother.png` |
| Ferry Toll-Frog (`ferry-toll-frog`) | live | frog | `art/cards/ferry-toll-frog.png` |
| Riverside Peddler (`riverside-peddler`) | live | mouse | `art/cards/riverside-peddler.png` |
| Ford Kingfisher (`ford-kingfisher`) | live | kingfisher | `art/cards/ford-kingfisher.png` |
| Truce Heron (`truce-heron`) | live | heron | `art/cards/truce-heron.png` |
| Old Willow of the Ford (`old-willow-of-the-ford`) | live | heron | `art/cards/old-willow-of-the-ford.png` |
| Puddle Changeling (`puddle-changeling`) | live | fox | `art/cards/puddle-changeling.png` |
| Hedge Changeling (`hedge-changeling`) | live | cat | `art/cards/hedge-changeling.png` |
| Glass Changeling (`glass-changeling`) | live | fox | `art/cards/glass-changeling.png` |
| Willow-o'-Wisp (`willow-o-wisp`) | live | beetle | `art/cards/willow-o-wisp.png` |
| Cinder Stoker (`cinder-stoker`) | live | salamander | `art/cards/cinder-stoker.png` |
| Pack Mule (`pack-mule`) | live | mule | `art/cards/pack-mule.png` |
| Thornwood Palisade (`thornwood-palisade`) | live | hedgehog | `art/cards/thornwood-palisade.png` |
| Conch Crawler (`conch-crawler`) | live | conch | `art/cards/conch-crawler.png` |
| Conch Herald (`conch-herald`) | live | hermit crab | `art/cards/conch-herald.png` |
| Shoal Shark (`shoal-shark`) | live | shark | `art/cards/shoal-shark.png` |
| Malachite Golem (`malachite-golem`) | live | beetle | `art/cards/malachite-golem.png` |
| Irradiated Axolotl (`irradiated-axolotl`) | live | axolotl | `art/cards/irradiated-axolotl.png` |
| Irradiated Glow Wyrm (`irradiated-glow-wyrm`) | live | worm | `art/cards/irradiated-glow-wyrm.png` |
| Irradiated Couatl (`irradiated-couatl`) | live | snake | `art/cards/irradiated-couatl.png` |
| Heartwood Treant (`heartwood-treant`) | live | bear | `art/cards/heartwood-treant.png` |
| Quarry Troll (`quarry-troll`) | live | donkey | `art/cards/quarry-troll.png` |
| Iron Warden (`iron-warden`) | live | badger | `art/cards/iron-warden.png` |
| Badger Lumberjack (`badger-lumberjack`) | live | badger | `art/cards/badger-lumberjack.png` |
| Ore-Smelter Mole (`ore-smelter-mole`) | live | mole | `art/cards/ore-smelter-mole.png` |
| Sworn Shieldbearer (`sworn-shieldbearer`) | live | stoat | `art/cards/sworn-shieldbearer.png` |
| Crown Pretender (`crown-pretender`) | live | fox | `art/cards/crown-pretender.png` |
| Grindstone Boar (`grindstone-boar`) | live | boar | `art/cards/grindstone-boar.png` |
| Rainmaker Frog (`rainmaker-frog`) | live | frog | `art/cards/rainmaker-frog.png` |
| Puddle Skimmer (`puddle-skimmer`) | live | pond skater | `art/cards/puddle-skimmer.png` |
| Moonlit Hare (`moonlit-hare`) | live | hare | `art/cards/moonlit-hare.png` |
| Lunar Howler (`lunar-howler`) | live | wolf | `art/cards/lunar-howler.png` |
| Frostbitten Wolverine (`frostbitten-wolverine`) | live | wolverine | `art/cards/frostbitten-wolverine.png` |
| Skull Vulture (`skull-vulture`) | live | vulture | `art/cards/skull-vulture.png` |
| The Caldera Wyrm (`caldera-wyrm`) | live | dragon | `art/cards/caldera-wyrm.png` |
| The Contradiction (`the-contradiction`) | live | polar bear | `art/cards/the-contradiction.png` |
| Ashbone Ghoul (`ashbone-ghoul`) | live | hyena | `art/cards/ashbone-ghoul.png` |
| Cinder Skeleton (`cinder-skeleton`) | live | horse | `art/cards/cinder-skeleton.png` |
| Magma Wraith (`magma-wraith`) | live | wolf | `art/cards/magma-wraith.png` |
| Obsidian Lich (`obsidian-lich`) | live | lizard | `art/cards/obsidian-lich.png` |
| Ember Revenant (`ember-revenant`) | live | boar | `art/cards/ember-revenant.png` |
| Meerkat Wayfarer (`meerkat-wayfarer`) | live | meerkat | `art/cards/meerkat-wayfarer.png` |
| Creeper (`creeper`) | live | bee | `art/cards/creeper.png` |
| Pigeon Peon (`pigeon-peon`) | live | pigeon | `art/cards/pigeon-peon.png` |
| Marching Elephant (`marching-elephant`) | live | elephant | `art/cards/marching-elephant.png` |
| Siege Rhino (`siege-rhino`) | live | rhino | `art/cards/siege-rhino.png` |
| Stonedrop Vulture (`stonedrop-vulture`) | live | vulture | `art/cards/stonedrop-vulture.png` |
| Newt Doctor (`newt-doctor`) | live | newt | `art/cards/newt-doctor.png` |
| Gatling Hog (`gatling-hog`) | live | hedgehog | `art/cards/gatling-hog.png` |
| Dung Beetle (`dung-beetle`) | live | dung beetle | `art/cards/dung-beetle.png` |
| Ür-Elk (`ur-elk`) | live | elk | `art/cards/ur-elk.png` |
| Subterraneaner (`subterraneaner`) | live | mole | `art/cards/subterraneaner.png` |
| Farm Dog (`farm-dog`) | live | dog | `art/cards/farm-dog.png` |
| House Cat (`house-cat`) | live | cat | `art/cards/house-cat.png` |
| Shellwright Apprentice (`shellwright-apprentice`) | live | otter | `art/cards/shellwright-apprentice.png` |
| Royal Guard (`otter-royal-guard`) | live | otter | `art/cards/otter-royal-guard.png` |
| Otter Flag Bearer (`otter-flag-bearer`) | live | otter | `art/cards/otter-flag-bearer.png` |
| Otter Lantern Bearer (`otter-lantern-bearer`) | live | otter | `art/cards/otter-lantern-bearer.png` |
| Riverbed Diver (`riverbed-diver`) | live | otter | `art/cards/riverbed-diver.png` |
| Hummingbird Needler (`hummingbird-needler`) | live | hummingbird | `art/cards/hummingbird-needler.png` |
| Riverwing Envoy (`riverwing-envoy`) | live | otter | `art/cards/riverwing-envoy.png` |
| Trojan Raider (`trojan-raider`) | live | raccoon | `art/cards/trojan-raider.png` |
| Nest Hatchling (`nest-hatchling`) | live | hummingbird | `art/cards/nest-hatchling.png` |
| Triumphvirate (`triumvirate`) | live | lion | `art/cards/triumvirate.png` |
| Inkcloud Squid (`inkcloud-squid`) | live | squid | `art/cards/inkcloud-squid.png` |
| Abyss Lantern Squid (`abyss-lantern-squid`) | live | squid | `art/cards/abyss-lantern-squid.png` |
| Glass Octopus (`glass-octopus`) | live | octopus | `art/cards/glass-octopus.png` |
| Vampire Squid (`vampire-squid`) | live | vampire squid | `art/cards/vampire-squid.png` |
| Goliath Tentacle (`goliath-tentacle`) | live | octopus | `art/cards/goliath-tentacle.png` |
| Goliath Broodmother (`goliath-broodmother`) | live | octopus | `art/cards/goliath-broodmother.png` |
| Cave Centipede (`cave-centipede`) | live | centipede | `art/cards/cave-centipede.png` |
| Millipede Hauler (`millipede-hauler`) | live | millipede | `art/cards/millipede-hauler.png` |
| Thorny Devil (`thorny-devil`) | live | thorny devil | `art/cards/thorny-devil.png` |
| Fennec Fox (`fennec-fox`) | live | fennec fox | `art/cards/fennec-fox.png` |
| Meerkat Sentry (`meerkat-sentry`) | live | meerkat | `art/cards/meerkat-sentry.png` |
| Lone Grey Wolf (`lone-grey-wolf`) | live | wolf | `art/cards/lone-grey-wolf.png` |
| Buzzed Chipmunk (`buzzed-chipmunk`) | live | chipmunk | `art/cards/buzzed-chipmunk.png` |
| Scree Goat (`scree-goat`) | live | mountain goat | `art/cards/scree-goat.png` |
| Rivergate Tribune (`rivergate-tribune`) | live | otter | `art/cards/rivergate-tribune.png` |
| Sunspire Sky-Sovereign (`sunspire-sky-sovereign`) | live | hummingbird | `art/cards/sunspire-sky-sovereign.png` |
| Bombardier Beetle (`bombardier-beetle`) | live | bombardier beetle | `art/cards/bombardier-beetle.png` |
| Cunning Vixen (`cunning-vixen`) | live | fox | `art/cards/cunning-vixen.png` |
| Fox Sharpshot (`fox-sharpshot`) | live | fox | `art/cards/fox-sharpshot.png` |
| Balloon Archer (`balloon-archer`) | live | mouse | `art/cards/balloon-archer.png` |
| Frillneck Duelist (`frillneck-duelist`) | live | frilled lizard | `art/cards/frillneck-duelist.png` |
| Monitor Rambler (`monitor-rambler`) | live | monitor lizard | `art/cards/monitor-rambler.png` |
| Dynamite Packrat (`dynamite-packrat`) | live | pack rat | `art/cards/dynamite-packrat.png` |
| Helmeted Otter (`helmeted-otter`) | live | otter | `art/cards/helmeted-otter.png` |
| Bramble Hoglet (`bramble-hoglet`) | live | hedgehog | `art/cards/bramble-hoglet.png` |
| Clover Butterfly (`clover-butterfly`) | live | butterfly | `art/cards/clover-butterfly.png` |
| The Gannet Queen (`the-gannet-queen`) | live | gannet | `art/cards/the-gannet-queen.png` |
| Old Snapjaw (`old-snapjaw`) | live | crocodile | `art/cards/old-snapjaw.png` |
| Alpine Marmot (`alpine-marmot`) | live | marmot | `art/cards/alpine-marmot.png` |
| Meerkat Burrower (`meerkat-burrower`) | live | meerkat | `art/cards/meerkat-burrower.png` |
| Moon Jelly (`moon-jelly`) | live | jellyfish | `art/cards/moon-jelly.png` |
| Lion's Mane Jelly (`lions-mane-jelly`) | live | jellyfish | `art/cards/lions-mane-jelly.png` |
| Caiman Hatchling (`caiman-hatchling`) | live | caiman | `art/cards/caiman-hatchling.png` |
| Mudpuppy (`mudpuppy`) | live | mudpuppy | `art/cards/mudpuppy.png` |
| Harbor Seal (`harbor-seal`) | live | harbor seal | `art/cards/harbor-seal.png` |
| Snow Ermine (`snow-ermine`) | live | stoat | `art/cards/snow-ermine.png` |
| Ember Centipede (`ember-centipede`) | live | centipede | `art/cards/ember-centipede.png` |
| Cinder Gecko (`cinder-gecko`) | live | gecko | `art/cards/cinder-gecko.png` |
| Ash Moth (`ash-moth`) | live | moth | `art/cards/ash-moth.png` |
| Cave Olm (`cave-olm`) | live | olm | `art/cards/cave-olm.png` |
| Glimmer Spider (`glimmer-spider`) | live | spider | `art/cards/glimmer-spider.png` |
| Field Crow (`field-crow`) | live | crow | `art/cards/field-crow.png` |
| Rabid Jackal (`rabid-jackal`) | live | jackal | `art/cards/rabid-jackal.png` |
| Mirrorhide Mutant (`mirrorhide-mutant`) | live | goat | `art/cards/mirrorhide-mutant.png` |
| Growth Sprout (`growth-sprout`) | live | caterpillar | `art/cards/growth-sprout.png` |
| Shallows Fry (`shallows-fry`) | live | minnow | `art/cards/shallows-fry.png` |
| Vampire Bat (`vampire-bat`) | live | bat | `art/cards/vampire-bat.png` |
| Wandering Mage (`wandering-mage`) | live | cat | `art/cards/wandering-mage.png` |
| Rafflesia (`rafflesia`) | live | carrion fly | `art/cards/rafflesia.png` |
| Puffball Bombardier (`puffball-bombardier`) | live | toad | `art/cards/puffball-bombardier.png` |
| Otter Angler (`otter-angler`) | live | otter | `art/cards/otter-angler.png` |
| Honeyjoe Brewer (`honeyjoe-brewer`) | live | hummingbird | `art/cards/honeyjoe-brewer.png` |
| Voltwing Bat (`voltwing-bat`) | live | bat | `art/cards/voltwing-bat.png` |
| Static Bat (`static-bat`) | live | bat | `art/cards/static-bat.png` |
| Arc Bat (`arc-bat`) | live | bat | `art/cards/arc-bat.png` |
| Hammerhead Shark (`hammerhead-shark`) | live | hammerhead shark | `art/cards/hammerhead-shark.png` |
| Ironback Gorilla (`ironback-gorilla`) | live | gorilla | `art/cards/ironback-gorilla.png` |
| Smokescreen Raccoon (`smoke-raccoon`) | live | raccoon | `art/cards/smoke-raccoon.png` |
| Blister Beetle (`blister-beetle`) | live | blister beetle | `art/cards/blister-beetle.png` |
| Colossal Squid (`colossal-squid`) | live | squid | `art/cards/colossal-squid.png` |
| Lantern Spark Fly (`lantern-spark-fly`) | live | moth | `art/cards/lantern-spark-fly.png` |
| Baby Bat (`baby-bat`) | live | bat | `art/cards/baby-bat.png` |
| Baby Horned Capybara (`baby-horned-capybara`) | live | capybara | `art/cards/baby-horned-capybara.png` |
| Sheep (`sheep`) | live | sheep | `art/cards/sheep.png` |
| Jay Pilferer (`jay-pilferer`) | live | jay | `art/cards/jay-pilferer.png` |
| Border Collie (`border-collie`) | live | dog | `art/cards/border-collie.png` |
| Mongoose Duelist (`mongoose-duelist`) | live | mongoose | `art/cards/mongoose-duelist.png` |
| Dhole Runner (`dhole-runner`) | live | dhole | `art/cards/dhole-runner.png` |
| Dhole Matriarch (`dhole-matriarch`) | live | dhole | `art/cards/dhole-matriarch.png` |
| Nightjar Drifter (`nightjar-drifter`) | live | nightjar | `art/cards/nightjar-drifter.png` |
| Aye-aye Prowler (`aye-aye-prowler`) | live | aye-aye | `art/cards/aye-aye-prowler.png` |
| Hoopoe Herald (`hoopoe-herald`) | live | hoopoe | `art/cards/hoopoe-herald.png` |
| Sunbittern Strider (`sunbittern-strider`) | live | sunbittern | `art/cards/sunbittern-strider.png` |
| Kinkajou Lurker (`kinkajou-lurker`) | live | kinkajou | `art/cards/kinkajou-lurker.png` |
| Mudflat Godwit (`mudflat-godwit`) | live | godwit | `art/cards/mudflat-godwit.png` |
| Moon Jerboa (`moon-jerboa`) | live | jerboa | `art/cards/moon-jerboa.png` |
| Werebadger (`werebadger`) | live | badger | `art/cards/werebadger.png` |
| Carrion Beetle (`carrion-beetle`) | live | carrion beetle | `art/cards/carrion-beetle.png` |
| Marula Elephant (`marula-elephant`) | live | elephant | `art/cards/marula-elephant.png` |
| Star-nosed Mole (`star-nosed-mole`) | live | mole | `art/cards/star-nosed-mole.png` |
| Pika Hoarder (`pika-hoarder`) | live | pika | `art/cards/pika-hoarder.png` |
| Tarantula Hawk (`tarantula-hawk`) | live | tarantula hawk | `art/cards/tarantula-hawk.png` |
| Swordfish Spearman (`swordfish-spearman`) | live | swordfish | `art/cards/swordfish-spearman.png` |
| Blue-ringed Octopus (`blue-ringed-octopus`) | live | blue-ringed octopus | `art/cards/blue-ringed-octopus.png` |
| Pronghorn Racer (`pronghorn-racer`) | live | pronghorn | `art/cards/pronghorn-racer.png` |
| Roadrunner Courier (`roadrunner-courier`) | live | roadrunner | `art/cards/roadrunner-courier.png` |
| Box Turtle (`box-turtle`) | live | box turtle | `art/cards/box-turtle.png` |
| Glasswing Butterfly (`glasswing-butterfly`) | live | butterfly | `art/cards/glasswing-butterfly.png` |
| Velvet Worm (`velvet-worm`) | live | velvet worm | `art/cards/velvet-worm.png` |
| Glowing Gecko (`glowing-gecko`) | live | gecko | `art/cards/glowing-gecko.png` |
| Gloom Gibbon (`gloom-gibbon`) | live | gibbon | `art/cards/gloom-gibbon.png` |
| Margay (`margay`) | live | margay | `art/cards/margay.png` |
| Seed-cache Squirrel (`seed-cache-squirrel`) | live | squirrel | `art/cards/seed-cache-squirrel.png` |
| Leafcutter Gardener (`leafcutter-gardener`) | live | leafcutter ant | `art/cards/leafcutter-gardener.png` |
| Lotus Frog (`lotus-frog`) | live | frog | `art/cards/lotus-frog.png` |
| Planarian Splitter (`planarian-splitter`) | live | flatworm | `art/cards/planarian-splitter.png` |
| Hagfish Silencer (`hagfish-silencer`) | live | hagfish | `art/cards/hagfish-silencer.png` |
| Electric Ray (`electric-ray`) | live | ray | `art/cards/electric-ray.png` |
| Vampire Bat Nurse (`vampire-bat-nurse`) | live | bat | `art/cards/vampire-bat-nurse.png` |
| Lichen Tortoise (`lichen-tortoise`) | live | tortoise | `art/cards/lichen-tortoise.png` |
| Swift Fox (`swift-fox`) | live | swift fox | `art/cards/swift-fox.png` |
| Slow Loris (`slow-loris`) | live | slow loris | `art/cards/slow-loris.png` |
| Hercules Beetle (`hercules-beetle`) | live | hercules beetle | `art/cards/hercules-beetle.png` |
| Mayfly Dancer (`mayfly-dancer`) | live | mayfly | `art/cards/mayfly-dancer.png` |
| Pangolin Roller (`pangolin-roller`) | live | pangolin | `art/cards/pangolin-roller.png` |
| Sawfish (`sawfish`) | live | sawfish | `art/cards/sawfish.png` |
| Tasmanian Devil (`tasmanian-devil`) | live | tasmanian devil | `art/cards/tasmanian-devil.png` |
| Mantis Shrimp (`mantis-shrimp`) | live | mantis shrimp | `art/cards/mantis-shrimp.png` |
| Fruit-bat Familiar (`fruit-bat-familiar`) | live | bat | `art/cards/fruit-bat-familiar.png` |
| Hellbender (`hellbender`) | live | hellbender | `art/cards/hellbender.png` |
| Woodpecker Sapper (`woodpecker-sapper`) | live | woodpecker | `art/cards/woodpecker-sapper.png` |
| Snow Bunting Archer (`snow-bunting-archer`) | live | snow bunting | `art/cards/snow-bunting-archer.png` |
| Spitting Cobra (`spitting-cobra`) | live | cobra | `art/cards/spitting-cobra.png` |
| Echidna Quillshot (`echidna-quillshot`) | live | echidna | `art/cards/echidna-quillshot.png` |
| Firefly Swarm (`firefly-swarm`) | live | firefly | `art/cards/firefly-swarm.png` |
| Archerfish (`archerfish`) | live | archerfish | `art/cards/archerfish.png` |
| Spitting Spider (`spitting-spider`) | live | spitting spider | `art/cards/spitting-spider.png` |
| Ice Petrel (`ice-petrel`) | live | petrel | `art/cards/ice-petrel.png` |
| Electric Catfish (`electric-catfish`) | live | electric catfish | `art/cards/electric-catfish.png` |
| Dust-devil Kestrel (`dust-devil-kestrel`) | live | kestrel | `art/cards/dust-devil-kestrel.png` |
| Ibex Rockcaller (`ibex-rockcaller`) | live | ibex | `art/cards/ibex-rockcaller.png` |
| Sperm Whale Elder (`sperm-whale-elder`) | live | sperm whale | `art/cards/sperm-whale-elder.png` |
| Thunder Lizard (`thunder-lizard`) | live | lizard | `art/cards/thunder-lizard.png` |
| Corpse-flower Beetle (`corpse-flower-beetle`) | live | beetle | `art/cards/corpse-flower-beetle.png` |
| Salamander Pyromancer (`salamander-pyromancer`) | live | salamander | `art/cards/salamander-pyromancer.png` |
| Starfall Owl (`starfall-owl`) | live | owl | `art/cards/starfall-owl.png` |
| Armadillo Guard (`armadillo-guard`) | live | armadillo | `art/cards/armadillo-guard.png` |
| Elephant-nose Fish (`elephant-nose-fish`) | live | elephantnose fish | `art/cards/elephant-nose-fish.png` |
| Piranha Shoal (`piranha-shoal`) | live | piranha | `art/cards/piranha-shoal.png` |
| Chilli Parrot (`chilli-parrot`) | live | parrot | `art/cards/chilli-parrot.png` |
| Platypus Spur (`platypus-spur`) | live | platypus | `art/cards/platypus-spur.png` |
| Cone Snail (`cone-snail`) | live | cone snail | `art/cards/cone-snail.png` |
| Lamprey (`lamprey`) | live | lamprey | `art/cards/lamprey.png` |
| Paper Wasp (`paper-wasp`) | live | paper wasp | `art/cards/paper-wasp.png` |
| Bison Bulldozer (`bison-bulldozer`) | live | bison | `art/cards/bison-bulldozer.png` |
| Weaver Bird (`weaver-bird`) | live | weaver bird | `art/cards/weaver-bird.png` |
| Anaconda Coil (`anaconda-coil`) | live | anaconda | `art/cards/anaconda-coil.png` |
| Tardigrade (`tardigrade`) | live | tardigrade | `art/cards/tardigrade.png` |
| Leaf Chameleon (`leaf-chameleon`) | live | chameleon | `art/cards/leaf-chameleon.png` |
| Oilbird (`oilbird`) | live | oilbird | `art/cards/oilbird.png` |
| Skunk Gasser (`skunk-gasser`) | live | skunk | `art/cards/skunk-gasser.png` |
| Ice Fish (`ice-fish`) | live | icefish | `art/cards/ice-fish.png` |
| Fire Salamander (`fire-salamander`) | live | salamander | `art/cards/fire-salamander.png` |
| Fire Hawk (`fire-hawk`) | live | kite | `art/cards/fire-hawk.png` |
| Flagellant Vulture (`flagellant-vulture`) | live | vulture | `art/cards/flagellant-vulture.png` |
| Vampire Finch (`vampire-finch`) | live | finch | `art/cards/vampire-finch.png` |
| Antlion Pit (`antlion-pit`) | live | antlion | `art/cards/antlion-pit.png` |
| Leopard Seal (`leopard-seal`) | live | leopard seal | `art/cards/leopard-seal.png` |
| Springbok Pronker (`springbok-pronker`) | live | springbok | `art/cards/springbok-pronker.png` |
| Supernova Jelly (`supernova-jelly`) | live | jellyfish | `art/cards/supernova-jelly.png` |
| Geode Scorpion (`geode-scorpion`) | live | scorpion | `art/cards/geode-scorpion.png` |
| Cleaner Wrasse (`cleaner-wrasse`) | live | wrasse | `art/cards/cleaner-wrasse.png` |
| Snow Leopard (`snow-leopard`) | live | snow leopard | `art/cards/snow-leopard.png` |
| Lovebird (`lovebird`) | live | lovebird | `art/cards/lovebird.png` |
| Horned Lizard (`horned-lizard`) | live | horned lizard | `art/cards/horned-lizard.png` |
| Dromedary (`dromedary`) | live | camel | `art/cards/dromedary.png` |
| Marula Monkey (`marula-monkey`) | live | vervet monkey | `art/cards/marula-monkey.png` |
| Lyrebird Mimic (`lyrebird-mimic`) | live | lyrebird | `art/cards/lyrebird-mimic.png` |
| Chained Binturong (`chained-binturong`) | live | binturong | `art/cards/chained-binturong.png` |
| Rimefire Salamander (`rimefire-salamander`) | live | salamander | `art/cards/rimefire-salamander.png` |
| Fumarole Ibex (`fumarole-ibex`) | live | ibex | `art/cards/fumarole-ibex.png` |
| Ashwing Ptarmigan (`ashwing-ptarmigan`) | live | ptarmigan | `art/cards/ashwing-ptarmigan.png` |
| Caldera Snow Leopard (`caldera-snow-leopard`) | live | snow leopard | `art/cards/caldera-snow-leopard.png` |
| Rimeheart Colossus (`rimeheart-colossus`) | live | gorilla | `art/cards/rimeheart-colossus.png` |
| War Elephant (`war-elephant`) | live | elephant | `art/cards/war-elephant.png` |
| Howdah Archers (`howdah-archers`) | live | langur | `art/cards/howdah-archers.png` |
| Testudo Tortoise (`testudo-tortoise`) | live | tortoise | `art/cards/testudo-tortoise.png` |
| Trebuchet Crew (`trebuchet-crew`) | live | beaver | `art/cards/trebuchet-crew.png` |
| Marshal Tuskwell (`marshal-tuskwell`) | live | elephant | `art/cards/marshal-tuskwell.png` |
| Great Gate (`great-gate`) | live | duck | `art/cards/great-gate.png` |
| Goose Sentry (`goose-sentry`) | live | goose | `art/cards/goose-sentry.png` |
| Mallard Halberdier (`mallard-halberdier`) | live | mallard | `art/cards/mallard-halberdier.png` |
| Tax-Collector Teal (`tax-collector-teal`) | live | teal | `art/cards/tax-collector-teal.png` |
| Battlement Heron (`battlement-heron`) | live | heron | `art/cards/battlement-heron.png` |
| Gilded Swan Knight (`gilded-swan-knight`) | live | swan | `art/cards/gilded-swan-knight.png` |
| The Magnate Duck (`magnate-duck`) | live | duck | `art/cards/magnate-duck.png` |
| Gallery Orb-Weaver (`gallery-orb-weaver`) | live | orb-weaver spider | `art/cards/gallery-orb-weaver.png` |
| Cottonmouth Matriarch (`cottonmouth-matriarch`) | live | cottonmouth | `art/cards/cottonmouth-matriarch.png` |
| Hedgehog Herbalist (`hedgehog-herbalist`) | live | hedgehog | `art/cards/hedgehog-herbalist.png` |
| Eagle-Owl Quartermaster (`eagle-owl-quartermaster`) | live | eagle owl | `art/cards/eagle-owl-quartermaster.png` |
| Ossuary Lammergeier (`ossuary-lammergeier`) | live | lammergeier | `art/cards/ossuary-lammergeier.png` |
| Walrus Icebreaker (`walrus-icebreaker`) | live | walrus | `art/cards/walrus-icebreaker.png` |
| Sea Cucumber (`sea-cucumber`) | live | sea cucumber | `art/cards/sea-cucumber.png` |
| Fathom Leviathan (`fathom-leviathan`) | live | whale | `art/cards/fathom-leviathan.png` |
| Grovebearer Dragon-Turtle (`grovebearer-dragon-turtle`) | live | tortoise | `art/cards/grovebearer-dragon-turtle.png` |
| Ashmantle Fiend (`ashmantle-fiend`) | live | bat | `art/cards/ashmantle-fiend.png` |
| Grotto Lobster (`grotto-lobster`) | live | lobster | `art/cards/grotto-lobster.png` |
| Amber Cicada (`amber-cicada`) | live | cicada | `art/cards/amber-cicada.png` |
