# Art reuse map (2026-10-19)

The owner, 09:52: *"After we re-divvy out units, we will try to reuse 99% of the art."*

This lists every unit in `canonical/unit-themes.json`: 792 live, 4 in the pool and 135 proposed later versions. For each one it gives the existing art file it keeps. Built by `python3 tools/art_reuse_map.py`.

## Summary

- **931 of 931 units (100.0%) keep existing art.**
  - 796 have art of their own.
  - 135 proposed versions keep their base card's art.
  - 0 have no art of their own yet. Another card's art of the same animal (or the same kind) stands in for now.
- **0 have no usable match** and need new art. They are flagged below: 0 of them have a loose stand-in of the same species field (a different animal), 0 have nothing.
- The raid's boss units (the Leviathan Elder and the Kraken Brute) borrow their base card's art. Their own epic art is briefed in `docs/art/raid-elder-art-brief.md`.

"Own" art is a file in `art/cards/`, or the art embedded in `cards.json`. The build writes the embedded art to `assets/cards/<id>.webp`. A stand-in is only a placeholder: the card shows another creature's picture until its own is made.

## No usable match (0)

None.

## Stand-ins: no own art yet (0)

| Unit | Status | Animal | Uses for now |
|---|---|---|---|

## Proposed later versions: their base's art (135)

| Proposed name | Internal | Keeps |
|---|---|---|
| Peakroot Olm | `dire-cave-olm` | `art/cards/cave-olm.png` (its base, Cave Olm) |
| Sundered Whip Spider | `dire-whip-spider` | `art/cards/whip-spider.png` (its base, Whip Spider) |
| Sundered Gallery Orb-Weaver | `elder-gallery-orb-weaver` | `art/cards/gallery-orb-weaver.png` (its base, Gallery Orb-Weaver) |
| Sundered Ghost Crayfish | `dire-ghost-crayfish` | `art/cards/ghost-crayfish.png` (its base, Ghost Crayfish) |
| Glimmerdeep Cavefish | `dire-blind-cave-fish` | `art/cards/blind-cave-fish.png` (its base, Blind Cave Fish) |
| Sundered Sulfur Cinder Moth | `dire-sulfur-cinder-moth` | `art/cards/sulfur-cinder-moth.png` (its base, Sulfur Cinder Moth) |
| Sundered Beetle Grunt | `elder-beetle-grunt` | `art/cards/beetle-grunt.png` (its base, Beetle Grunt) |
| Sundered Echo Screecher | `dire-echo-screecher` | `art/cards/echo-screecher.png` (its base, Echo Screecher) |
| Sundered Subterraneaner | `elder-subterraneaner` | `art/cards/subterraneaner.png` (its base, Subterraneaner) |
| Glimmer Octopus Admiral | `dire-octopus-tactician` | `art/cards/octopus-tactician.png` (its base, Octopus Tactician) |
| Ironcoil Millipede | `dire-millipede-hauler` | `art/cards/millipede-hauler.png` (its base, Millipede Hauler) |
| Stormdiver Eagle | `dire-golden-eagle-diver` | `art/cards/golden-eagle-diver.png` (its base, Golden Eagle Diver) |
| Quiet Puffin Diver | `elder-puffin-diver` | `art/cards/puffin-diver.png` (its base, Puffin Diver) |
| Kelp Kittiwake Flock | `dire-kittiwake-flock` | `art/cards/kittiwake-flock.png` (its base, Kittiwake Flock) |
| Wolfsbane Fulmar Spitter | `elder-fulmar-spitter` | `art/cards/fulmar-spitter.png` (its base, Fulmar Spitter) |
| Kelp Fiddler Crab Swarm | `dire-fiddler-crab-swarm` | `art/cards/fiddler-crab-swarm.png` (its base, Fiddler Crab Swarm) |
| Wolfsbane Tidepool Trapper Crab | `elder-tidepool-trapper-crab` | `art/cards/tidepool-trapper-crab.png` (its base, Tidepool Trapper Crab) |
| Undertow Eel | `dire-riptide-eel` | `art/cards/riptide-eel.png` (its base, Riptide Eel) |
| Breakwater Seal Bull | `dire-grey-seal-bull` | `art/cards/grey-seal-bull.png` (its base, Grey Seal Bull) |
| Spiral-Fort Conch | `dire-conch-crawler` | `art/cards/conch-crawler.png` (its base, Conch Crawler) |
| Wolfsbane Oyster Bank | `elder-oyster-bank` | `art/cards/oyster-bank.png` (its base, Oyster Bank) |
| Needlebed Urchin | `dire-pincushion-urchin` | `art/cards/pincushion-urchin.png` (its base, Pincushion Urchin) |
| Pale Obsidian Scorpion | `dire-obsidian-scorpion` | `art/cards/obsidian-scorpion.png` (its base, Obsidian Scorpion) |
| Pale Caustic Scorpion | `elder-caustic-scorpion` | `cards.json (embedded; built to assets/cards/caustic-scorpion.webp)` (its base, Caustic Scorpion) |
| Pale Roadrunner Courier | `dire-roadrunner-courier` | `art/cards/roadrunner-courier.png` (its base, Roadrunner Courier) |
| Pale Antlion Pit | `dire-antlion-pit` | `art/cards/antlion-pit.png` (its base, Antlion Pit) |
| Pale Dromedary | `dire-dromedary` | `art/cards/dromedary.png` (its base, Dromedary) |
| Pale Fennec Fox | `elder-fennec-fox` | `art/cards/fennec-fox.png` (its base, Fennec Fox) |
| Pale Sandfish | `dire-sandfish` | `art/cards/sandfish.png` (its base, Sandfish) |
| Pale Frillneck Duelist | `elder-frillneck-duelist` | `art/cards/frillneck-duelist.png` (its base, Frillneck Duelist) |
| Caves Wolf Spider Mother | `dire-wolf-spider-mother` | `art/cards/wolf-spider-mother.png` (its base, Wolf Spider Mother) |
| Caves Owl Nightwatch | `dire-owl-nightwatch` | `art/cards/owl-nightwatch.png` (its base, Owl Nightwatch) |
| Caves Dung Beetle | `dire-dung-beetle` | `art/cards/dung-beetle.png` (its base, Dung Beetle) |
| Deep-Truffle Hog | `dire-truffle-piglet` | `art/cards/truffle-piglet.png` (its base, Truffle Piglet) |
| Mouldering Grub | `dire-compost-grub` | `art/cards/compost-grub.png` (its base, Compost Grub) |
| Cloudbeak Toucan | `dire-toucan-courier` | `art/cards/toucan-courier.png` (its base, Toucan Courier) |
| Sundered Glasswing Butterfly | `dire-glasswing-butterfly` | `art/cards/glasswing-butterfly.png` (its base, Glasswing Butterfly) |
| Peakbreaker Gorilla | `dire-ironback-gorilla` | `art/cards/ironback-gorilla.png` (its base, Ironback Gorilla) |
| Carrion Bloom | `dire-rafflesia` | `art/cards/rafflesia.png` (its base, Rafflesia) |
| Goldfeather Stable Colt | `dire-stable-colt` | `art/cards/stable-colt.png` (its base, Stable Colt) |
| Goldfeather Warhorse Charger | `elder-warhorse-charger` | `art/cards/warhorse-charger.png` (its base, Warhorse Charger) |
| Coral Mangrove Kingfisher | `dire-mangrove-kingfisher` | `art/cards/mangrove-kingfisher.png` (its base, Mangrove Kingfisher) |
| Coral Ironclaw Fiddler | `dire-ironclaw-fiddler` | `art/cards/ironclaw-fiddler.png` (its base, Ironclaw Fiddler) |
| Current Mudskipper | `dire-mangrove-mudskipper` | `art/cards/mangrove-mudskipper.png` (its base, Mangrove Mudskipper) |
| Coral Archerfish | `elder-archerfish` | `art/cards/archerfish.png` (its base, Archerfish) |
| Current Sea-Cow | `dire-mangrove-manatee` | `art/cards/mangrove-manatee.png` (its base, Mangrove Manatee) |
| Coral Fishing Cat | `elder-fishing-cat` | `art/cards/fishing-cat.png` (its base, Fishing Cat) |
| Coral Sea Hare | `dire-sea-hare` | `art/cards/sea-hare.png` (its base, Sea Hare) |
| Reefwalker Monitor | `dire-mangrove-monitor` | `art/cards/mangrove-monitor.png` (its base, Mangrove Monitor) |
| Redwood Quill-Thorn Boar | `dire-quill-thorn-boar` | `art/cards/quill-thorn-boar.png` (its base, Quill-Thorn Boar) |
| Old Meadow Frog | `dire-meadow-frog` | `art/cards/meadow-frog.png` (its base, Meadow Frog) |
| Old Lyrebird Mimic | `dire-lyrebird-mimic` | `art/cards/lyrebird-mimic.png` (its base, Lyrebird Mimic) |
| Old Woodpecker Sapper | `elder-woodpecker-sapper` | `art/cards/woodpecker-sapper.png` (its base, Woodpecker Sapper) |
| Rootdelve Ant | `dire-tunnel-ant` | `art/cards/tunnel-ant.png` (its base, Tunnel Ant) |
| Old Leafcutter Gardener | `elder-leafcutter-gardener` | `art/cards/leafcutter-gardener.png` (its base, Leafcutter Gardener) |
| Old Bison Bulldozer | `dire-bison-bulldozer` | `art/cards/bison-bulldozer.png` (its base, Bison Bulldozer) |
| Old Hedge Weasel | `elder-hedge-weasel` | `art/cards/hedge-weasel.png` (its base, Hedge Weasel) |
| Old Moonshell Snail | `dire-moonshell-snail` | `art/cards/moonshell-snail.png` (its base, Moonshell Snail) |
| Old Leopard Slug | `elder-leopard-slug` | `art/cards/leopard-slug.png` (its base, Leopard Slug) |
| Thornshoot Sprout | `dire-bramble-sprout` | `art/cards/bramble-sprout.png` (its base, Bramble Sprout) |
| Old Heartwood | `elder-heartwood-treant` | `art/cards/heartwood-treant.png` (its base, Heartwood Treant) |
| Brambleshade Slow-worm | `dire-slow-worm` | `art/cards/slow-worm.png` (its base, Slow-worm) |
| Rootbound Oath-Keeper | `dire-hollow-oath-keeper` | `art/cards/hollow-oath-keeper.png` (its base, Hollow Oath-Keeper) |
| Old Tunnel Wyrm | `dire-tunnel-wyrm` | `cards.json (embedded; built to assets/cards/tunnel-wyrm.webp)` (its base, Tunnel Wyrm) |
| Summit Salamander | `dire-alpine-salamander` | `art/cards/alpine-salamander.png` (its base, Alpine Salamander) |
| Quiet Eyrie Warden | `dire-eyrie-warden` | `art/cards/eyrie-warden.png` (its base, Eyrie Warden) |
| Grand Summit Condor | `elder-peak-condor` | `art/cards/peak-condor.png` (its base, Peak Condor) |
| Summit Apollo | `dire-apollo-butterfly` | `art/cards/apollo-butterfly.png` (its base, Apollo Butterfly) |
| Summit Marmot | `dire-alpine-marmot` | `art/cards/alpine-marmot.png` (its base, Alpine Marmot) |
| Quiet Mountain Goat Climber | `elder-mountain-goat-climber` | `art/cards/mountain-goat-climber.png` (its base, Mountain Goat Climber) |
| Scarstone Reaver | `dire-wound-reaver` | `art/cards/wound-reaver.png` (its base, Wound Reaver) |
| Alcove Trapdoor Spider | `dire-trapdoor-spider` | `art/cards/trapdoor-spider.png` (its base, Trapdoor Spider) |
| Pinewood Redwood Woodpecker | `dire-redwood-woodpecker` | `art/cards/redwood-woodpecker.png` (its base, Redwood Woodpecker) |
| Pinewood Stag Knight | `dire-stag-knight` | `art/cards/stag-knight.png` (its base, Stag Knight) |
| Old Fawn Scout | `elder-fawn-scout` | `art/cards/fawn-scout.png` (its base, Fawn Scout) |
| Sunken Hermit Crab | `dire-open-ocean-hermit-crab` | `art/cards/open-ocean-hermit-crab.png` (its base, Open-Ocean Hermit Crab) |
| Sunken Mantis Shrimp | `elder-mantis-shrimp` | `art/cards/mantis-shrimp.png` (its base, Mantis Shrimp) |
| Scarred Reef Shark | `elder-reef-shark` | `art/cards/reef-shark.png` (its base, Reef Shark) |
| Sunken Dolphin Knight | `elder-dolphin-knight` | `art/cards/dolphin-knight.png` (its base, Dolphin Knight) |
| Sunken Yellow-bellied Sea Snake | `dire-yellow-bellied-sea-snake` | `art/cards/yellow-bellied-sea-snake.png` (its base, Yellow-bellied Sea Snake) |
| Kelp Lotus Frog | `dire-lotus-frog` | `art/cards/lotus-frog.png` (its base, Lotus Frog) |
| Old Ferry Toll-Frog | `elder-ferry-toll-frog` | `art/cards/ferry-toll-frog.png` (its base, Ferry Toll-Frog) |
| Kelp Bell Spider | `dire-diving-bell-spider` | `art/cards/diving-bell-spider.png` (its base, Diving Bell Spider) |
| Coral Sunbittern | `dire-sunbittern-strider` | `art/cards/sunbittern-strider.png` (its base, Sunbittern Strider) |
| Old Ford Kingfisher | `elder-ford-kingfisher` | `art/cards/ford-kingfisher.png` (its base, Ford Kingfisher) |
| Kelp Signal Crayfish | `dire-signal-crayfish` | `art/cards/signal-crayfish.png` (its base, Signal Crayfish) |
| Old Shallows Fry | `dire-shallows-fry` | `art/cards/shallows-fry.png` (its base, Shallows Fry) |
| Old Pufferfish Bulwark | `elder-pufferfish-bulwark` | `art/cards/pufferfish-bulwark.png` (its base, Pufferfish Bulwark) |
| Kelp Mayfly | `dire-mayfly-dancer` | `art/cards/mayfly-dancer.png` (its base, Mayfly Dancer) |
| Rootlodge Muskrat | `dire-muskrat-lodgekeeper` | `art/cards/muskrat-lodgekeeper.png` (its base, Muskrat Lodgekeeper) |
| Old Water Vole | `elder-water-vole` | `art/cards/water-vole.png` (its base, Water Vole) |
| Kelp Water Snake | `dire-grass-snake` | `art/cards/grass-snake.png` (its base, Grass Snake) |
| Old Planarian Splitter | `dire-planarian-splitter` | `art/cards/planarian-splitter.png` (its base, Planarian Splitter) |
| Canopy Hoopoe Herald | `dire-hoopoe-herald` | `art/cards/hoopoe-herald.png` (its base, Hoopoe Herald) |
| Goldfeather Weaver Bird | `elder-weaver-bird` | `art/cards/weaver-bird.png` (its base, Weaver Bird) |
| Canopy Termite Forager | `dire-termite-forager` | `art/cards/termite-forager.png` (its base, Termite Forager) |
| Canopy Marula Elephant | `dire-marula-elephant` | `art/cards/marula-elephant.png` (its base, Marula Elephant) |
| Goldfeather Pangolin Roller | `elder-pangolin-roller` | `art/cards/pangolin-roller.png` (its base, Pangolin Roller) |
| Bramble Bog-Hopper | `dire-puddle-hopper` | `art/cards/puddle-hopper.png` (its base, Puddle Hopper) |
| Kelp Bogfire Newt | `elder-bogfire-newt` | `art/cards/bogfire-newt.png` (its base, Bogfire Newt) |
| Kelp Raft Spider | `dire-raft-spider` | `art/cards/raft-spider.png` (its base, Raft Spider) |
| Kelp Booming Bittern | `dire-booming-bittern` | `art/cards/booming-bittern.png` (its base, Booming Bittern) |
| Kelp Raven Scout | `elder-raven-scout` | `art/cards/raven-scout.png` (its base, Raven Scout) |
| Swampmire Gar | `dire-alligator-gar` | `art/cards/alligator-gar.png` (its base, Alligator Gar) |
| Mangrove-o'-Wisp | `dire-willow-o-wisp` | `art/cards/willow-o-wisp.png` (its base, Willow-o'-Wisp) |
| Kelp Nightshade Moth | `elder-nightshade-moth` | `art/cards/nightshade-moth.png` (its base, Nightshade Moth) |
| Kelp Vampire Bat | `dire-vampire-bat` | `art/cards/vampire-bat.png` (its base, Vampire Bat) |
| Kelp Fen Mink | `elder-fen-mink` | `art/cards/fen-mink.png` (its base, Fen Mink) |
| Swampmire Root Lurker | `dire-cypress-root-lurker` | `art/cards/cypress-root-lurker.png` (its base, Cypress Root Lurker) |
| Swampmire Constrictor | `dire-constrictor-coil` | `art/cards/constrictor-coil.png` (its base, Constrictor Coil) |
| Kelp Swamp Alligator | `elder-swamp-alligator` | `art/cards/swamp-alligator.png` (its base, Swamp Alligator) |
| Mangrove Wisp | `dire-marsh-wisp` | `art/cards/marsh-wisp.png` (its base, Marsh Wisp) |
| Kelp Bog Revenant | `elder-bog-revenant` | `art/cards/bog-revenant.png` (its base, Bog Revenant) |
| Swampmire Leech | `dire-bog-leech` | `art/cards/bog-leech.png` (its base, Bog Leech) |
| Old Bloat Leech | `elder-gangrenous-leech` | `art/cards/gangrenous-leech.png` (its base, Gangrenous Leech) |
| Wolfsbane Bramblewood Lynx | `dire-bramblewood-lynx` | `cards.json (embedded; built to assets/cards/bramblewood-lynx.webp)` (its base, Bramblewood Lynx) |
| Rimefire Snowshoe Hare | `elder-snowshoe-hare` | `art/cards/snowshoe-hare.png` (its base, Snowshoe Hare) |
| Wolfsbane Pinecone Sapper | `dire-pinecone-sapper` | `art/cards/pinecone-sapper.png` (its base, Pinecone Sapper) |
| Rimefire Ashwing Ptarmigan | `dire-ashwing-ptarmigan` | `art/cards/ashwing-ptarmigan.png` (its base, Ashwing Ptarmigan) |
| Rimefire Arctic Tern | `elder-arctic-tern` | `art/cards/arctic-tern.png` (its base, Arctic Tern) |
| Rimefire Snow Ermine | `dire-snow-ermine` | `art/cards/snow-ermine.png` (its base, Snow Ermine) |
| Rimefire Ravenous Wolverine | `elder-ravenous-wolverine` | `art/cards/ravenous-wolverine.png` (its base, Ravenous Wolverine) |
| Goldfeather Webspire Sentinel | `dire-webspire-sentinel` | `art/cards/webspire-sentinel.png` (its base, Webspire Sentinel) |
| Goldfeather Mallard Marauder | `dire-mallard-marauder` | `art/cards/mallard-marauder.png` (its base, Mallard Marauder) |
| Goldfeather Beetle Battering-Ram | `dire-beetle-battering-ram` | `art/cards/beetle-battering-ram.png` (its base, Beetle Battering-Ram) |
| Goldfeather Paper Wasp | `elder-paper-wasp` | `art/cards/paper-wasp.png` (its base, Paper Wasp) |
| Goldfeather War Panther | `dire-war-panther` | `cards.json (embedded; built to assets/cards/war-panther.webp)` (its base, War Panther) |
| Goldfeather Margay | `elder-margay` | `art/cards/margay.png` (its base, Margay) |
| Sundered Cinder Stoker | `dire-cinder-stoker` | `art/cards/cinder-stoker.png` (its base, Cinder Stoker) |
| Sundered Fire Salamander | `elder-fire-salamander` | `art/cards/fire-salamander.png` (its base, Fire Salamander) |
| Glimmer Vent Crab | `dire-sulfur-vent-crab` | `art/cards/sulfur-vent-crab.png` (its base, Sulfur Vent Crab) |
| Sundered Ember Tetra | `dire-ember-tetra` | `art/cards/ember-tetra.png` (its base, Ember Tetra) |
| Sundered Pumice Beetle | `dire-pumice-beetle` | `art/cards/pumice-beetle.png` (its base, Pumice Beetle) |
| Sundered Firefly Swarm | `elder-firefly-swarm` | `art/cards/firefly-swarm.png` (its base, Firefly Swarm) |
| Sundered Pall Wraith | `dire-pall-wraith` | `art/cards/pall-wraith.png` (its base, Pall Wraith) |

## Non-player units

| Unit | Kind | Art |
|---|---|---|
| Kraken Brute (`kraken-spawnling~boss`) | raid-boss-unit | `art/cards/kraken-spawnling.png` (its base card; wants its own epic art (docs/art/raid-elder-art-brief.md)) |
| Vampyre Matriarch (`vampire-squid~boss`) | raid-boss-unit | `art/cards/vampire-squid.png` (its base card; wants its own epic art (docs/art/raid-elder-art-brief.md)) |
| Leviathan Elder (`humpback-elder~boss`) | raid-boss-unit | `art/cards/humpback-elder.png` (its base card; wants its own epic art (docs/art/raid-elder-art-brief.md)) |
| Broodmother Ascendant (`goliath-broodmother~boss`) | raid-boss-unit | `art/cards/goliath-broodmother.png` (its base card; wants its own epic art (docs/art/raid-elder-art-brief.md)) |
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

## Units with their own art (796)

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
| Gilded Roadwarden (`cataphract-destrier`) | live | horse | `art/cards/cataphract-destrier.png` |
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
| Fen Mink (`fen-mink`) | live | mink | `art/cards/fen-mink.png` |
| Tidepool Trapper Crab (`tidepool-trapper-crab`) | live | crab | `art/cards/tidepool-trapper-crab.png` |
| Grave-Grin Hyena (`grave-grin-hyena`) | live | hyena | `art/cards/grave-grin-hyena.png` |
| Bogfire Newt (`bogfire-newt`) | live | newt | `art/cards/bogfire-newt.png` |
| Plague Gnat Cloud (`plague-gnat-cloud`) | live | gnat | `art/cards/plague-gnat-cloud.png` |
| Glasswing Moth (`glasswing-moth`) | live | moth | `art/cards/glasswing-moth.png` |
| Rivergate Drummer (`rivergate-drummer`) | live | otter | `art/cards/rivergate-drummer.png` |
| Frostmoon Howler (`frostmoon-howler`) | live | wolf | `art/cards/frostmoon-howler.png` |
| Chapel Tortoise (`chapel-tortoise`) | live | tortoise | `art/cards/chapel-tortoise.png` |
| Weathervane Swift (`weathervane-swift`) | live | swift | `art/cards/weathervane-swift.png` |
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
| Pall Wraith (`pall-wraith`) | live | raven | `art/cards/pall-wraith.png` |
| Obsidian Lich (`obsidian-lich`) | live | lizard | `art/cards/obsidian-lich.png` |
| Ember Revenant (`ember-revenant`) | live | boar | `art/cards/ember-revenant.png` |
| Meerkat Wayfarer (`meerkat-wayfarer`) | live | meerkat | `art/cards/meerkat-wayfarer.png` |
| Creeper (`creeper`) | live | beetle | `art/cards/creeper.png` |
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
| Sandfish (`sandfish`) | live | sandfish skink | `art/cards/sandfish.png` |
| Pale Oryx (`pale-oryx`) | live | oryx | `art/cards/pale-oryx.png` |
| Quicksand Queen (`quicksand-queen`) | live | ant | `art/cards/quicksand-queen.png` |
| Water Vole (`water-vole`) | live | vole | `art/cards/water-vole.png` |
| River Mink (`river-mink`) | live | mink | `art/cards/river-mink.png` |
| Signal Crayfish (`signal-crayfish`) | live | crayfish | `art/cards/signal-crayfish.png` |
| Pine Marten (`pine-marten`) | live | pine marten | `art/cards/pine-marten.png` |
| Woodcock Lookout (`woodcock-lookout`) | live | woodcock | `art/cards/woodcock-lookout.png` |
| Grass Snake (`grass-snake`) | live | grass snake | `art/cards/grass-snake.png` |
| Ladybird Guard (`ladybird-guard`) | live | ladybird | `art/cards/ladybird-guard.png` |
| Hedgerow Shrew (`hedgerow-shrew`) | live | shrew | `art/cards/hedgerow-shrew.png` |
| Stag Beetle (`stag-beetle`) | live | stag beetle | `art/cards/stag-beetle.png` |
| Slow-worm (`slow-worm`) | live | slow-worm | `art/cards/slow-worm.png` |
| Robin Redbreast (`robin-redbreast`) | live | robin | `art/cards/robin-redbreast.png` |
| Field Vole (`field-vole`) | live | vole | `art/cards/field-vole.png` |
| Pincushion Urchin (`pincushion-urchin`) | live | sea urchin | `art/cards/pincushion-urchin.png` |
| Rock Pool Starfish (`rock-pool-starfish`) | live | starfish | `art/cards/rock-pool-starfish.png` |
| Oystercatcher (`oystercatcher`) | live | oystercatcher | `art/cards/oystercatcher.png` |
| Sanderling (`sanderling`) | pool | sanderling | `art/cards/sanderling.png` |
| Grey Seal Bull (`grey-seal-bull`) | live | grey seal | `art/cards/grey-seal-bull.png` |
| Limpet Clinger (`limpet-clinger`) | live | limpet | `art/cards/limpet-clinger.png` |
| Puffin Diver (`puffin-diver`) | live | puffin | `art/cards/puffin-diver.png` |
| Razorbill (`razorbill`) | live | razorbill | `art/cards/razorbill.png` |
| Kittiwake Flock (`kittiwake-flock`) | live | kittiwake | `art/cards/kittiwake-flock.png` |
| Peregrine Stooper (`peregrine-stooper`) | live | peregrine falcon | `art/cards/peregrine-stooper.png` |
| Fulmar Spitter (`fulmar-spitter`) | live | fulmar | `art/cards/fulmar-spitter.png` |
| Red-billed Chough (`red-billed-chough`) | live | chough | `art/cards/red-billed-chough.png` |
| Muskrat Lodgekeeper (`muskrat-lodgekeeper`) | live | muskrat | `art/cards/muskrat-lodgekeeper.png` |
| Water Shrew (`water-shrew`) | live | shrew | `art/cards/water-shrew.png` |
| Pyrenean Desman (`pyrenean-desman`) | live | desman | `art/cards/pyrenean-desman.png` |
| Great Crested Grebe (`great-crested-grebe`) | live | grebe | `art/cards/great-crested-grebe.png` |
| Old Sturgeon (`old-sturgeon`) | live | sturgeon | `art/cards/old-sturgeon.png` |
| Diving Bell Spider (`diving-bell-spider`) | live | diving bell spider | `art/cards/diving-bell-spider.png` |
| Alligator Gar (`alligator-gar`) | live | gar | `art/cards/alligator-gar.png` |
| Swamp Rabbit (`swamp-rabbit`) | live | rabbit | `art/cards/swamp-rabbit.png` |
| Mosquito Cloud (`mosquito-cloud`) | live | mosquito | `art/cards/mosquito-cloud.png` |
| Fire Ant Raft (`fire-ant-raft`) | live | fire ant | `art/cards/fire-ant-raft.png` |
| Anhinga Spearbird (`anhinga-spearbird`) | live | anhinga | `art/cards/anhinga-spearbird.png` |
| Roseate Spoonbill (`roseate-spoonbill`) | pool | spoonbill | `art/cards/roseate-spoonbill.png` |
| Booming Bittern (`booming-bittern`) | live | bittern | `art/cards/booming-bittern.png` |
| Giant Water Bug (`giant-water-bug`) | live | water bug | `art/cards/giant-water-bug.png` |
| Water Scorpion (`water-scorpion`) | pool | water scorpion | `art/cards/water-scorpion.png` |
| Greater Siren (`greater-siren`) | live | siren | `art/cards/greater-siren.png` |
| Marsh Harrier (`marsh-harrier`) | live | harrier | `art/cards/marsh-harrier.png` |
| Raft Spider (`raft-spider`) | live | raft spider | `art/cards/raft-spider.png` |
| Leopard Slug (`leopard-slug`) | live | leopard slug | `art/cards/leopard-slug.png` |
| Wolf Spider Mother (`wolf-spider-mother`) | live | wolf spider | `art/cards/wolf-spider-mother.png` |
| Truffle Piglet (`truffle-piglet`) | live | pig | `art/cards/truffle-piglet.png` |
| Fungus Gnat Cloud (`fungus-gnat-cloud`) | live | fungus gnat | `art/cards/fungus-gnat-cloud.png` |
| Springtail Hopper (`springtail-hopper`) | live | springtail | `art/cards/springtail-hopper.png` |
| Red-backed Salamander (`red-backed-salamander`) | live | salamander | `art/cards/red-backed-salamander.png` |
| Cave Cricket (`cave-cricket`) | live | cave cricket | `art/cards/cave-cricket.png` |
| Ghost Crayfish (`ghost-crayfish`) | live | crayfish | `art/cards/ghost-crayfish.png` |
| Cave Swiftlet (`cave-swiftlet`) | live | swiftlet | `art/cards/cave-swiftlet.png` |
| Cave Pseudoscorpion (`cave-pseudoscorpion`) | live | pseudoscorpion | `art/cards/cave-pseudoscorpion.png` |
| Whip Spider (`whip-spider`) | live | whip spider | `art/cards/whip-spider.png` |
| Giant Cave Huntsman (`giant-cave-huntsman`) | live | huntsman spider | `art/cards/giant-cave-huntsman.png` |
| Guano Beetle (`guano-beetle`) | live | beetle | `art/cards/guano-beetle.png` |
| Banded Sea Krait (`banded-sea-krait`) | live | sea krait | `art/cards/banded-sea-krait.png` |
| Fishing Cat (`fishing-cat`) | live | fishing cat | `art/cards/fishing-cat.png` |
| Proboscis Monkey (`proboscis-monkey`) | live | proboscis monkey | `art/cards/proboscis-monkey.png` |
| Horseshoe Crab (`horseshoe-crab`) | live | horseshoe crab | `art/cards/horseshoe-crab.png` |
| Sea Hare (`sea-hare`) | live | sea slug | `art/cards/sea-hare.png` |
| Mangrove Manatee (`mangrove-manatee`) | live | manatee | `art/cards/mangrove-manatee.png` |
| Yellow-bellied Sea Snake (`yellow-bellied-sea-snake`) | live | sea snake | `art/cards/yellow-bellied-sea-snake.png` |
| Crown-of-thorns Star (`crown-of-thorns-star`) | live | starfish | `art/cards/crown-of-thorns-star.png` |
| Parrotfish (`parrotfish`) | live | parrotfish | `art/cards/parrotfish.png` |
| Lionfish (`lionfish`) | live | lionfish | `art/cards/lionfish.png` |
| Giant Clam (`giant-clam`) | live | giant clam | `art/cards/giant-clam.png` |
| Great Barracuda (`great-barracuda`) | live | barracuda | `art/cards/great-barracuda.png` |
| Whale Shark (`whale-shark`) | live | whale shark | `art/cards/whale-shark.png` |
| Chamois Leaper (`chamois-leaper`) | live | chamois | `art/cards/chamois-leaper.png` |
| Alpine Swift (`alpine-swift`) | live | swift | `art/cards/alpine-swift.png` |
| Wallcreeper (`wallcreeper`) | pool | wallcreeper | `art/cards/wallcreeper.png` |
| Alpine Salamander (`alpine-salamander`) | live | salamander | `art/cards/alpine-salamander.png` |
| Apollo Butterfly (`apollo-butterfly`) | live | butterfly | `art/cards/apollo-butterfly.png` |
| Mountain Hare (`mountain-hare`) | live | hare | `art/cards/mountain-hare.png` |
| Thorn Shrike (`thorn-shrike`) | live | shrike | `art/cards/thorn-shrike.png` |
| Hedge Weasel (`hedge-weasel`) | live | weasel | `art/cards/hedge-weasel.png` |
| Hawthorn Shieldbug (`hawthorn-shieldbug`) | live | shieldbug | `art/cards/hawthorn-shieldbug.png` |
| Muntjac Barker (`muntjac-barker`) | live | muntjac | `art/cards/muntjac-barker.png` |
| Anvil Thrush (`anvil-thrush`) | live | thrush | `art/cards/anvil-thrush.png` |
| Garden Tiger Moth (`garden-tiger-moth`) | live | moth | `art/cards/garden-tiger-moth.png` |
| Polar Bear (`polar-bear`) | live | polar bear | `art/cards/polar-bear.png` |
| Harp Seal Pup (`harp-seal-pup`) | live | harp seal | `art/cards/harp-seal-pup.png` |
| Beluga (`beluga`) | live | beluga | `art/cards/beluga.png` |
| Arctic Tern (`arctic-tern`) | live | arctic tern | `art/cards/arctic-tern.png` |
| Lemming Swarm (`lemming-swarm`) | live | lemming | `art/cards/lemming-swarm.png` |
| Krill Swarm (`krill-swarm`) | live | krill | `art/cards/krill-swarm.png` |
| Greenland Shark (`greenland-shark`) | live | greenland shark | `art/cards/greenland-shark.png` |
| Ringed Seal (`ringed-seal`) | live | ringed seal | `art/cards/ringed-seal.png` |
| Woodland Caribou (`woodland-caribou`) | live | caribou | `art/cards/woodland-caribou.png` |
| Musk Ox Calf (`musk-ox-calf`) | live | musk ox | `art/cards/musk-ox-calf.png` |
| Exo-podas (`exo-podas`) | live | insect | `art/cards/exo-podas.png` |
| Galactic Condor (`galactic-condor`) | live | condor | `art/cards/galactic-condor.png` |
| Pink Maus (`pink-maus`) | live | mouse | `art/cards/pink-maus.png` |
| Nyoogle (`nyoogle`) | live | cat | `art/cards/nyoogle.png` |
| Habanero Drakon (`tobasco-drakon`) | live | dragon | `art/cards/tobasco-drakon.png` |
| Kegfuse Panda (`demo-panda`) | live | panda | `art/cards/demo-panda.png` |
| Petrified Tree (`petrified-tree`) | live | owl | `art/cards/petrified-tree.png` |
| Bucketknee Wolf (`bucketknee-wolf`) | live | wolf | `art/cards/bucketknee-wolf.png` |
| Armory (`armory`) | live | beaver | `art/cards/armory.png` |
| Anvilwhisker Otter (`anvilwhisker-otter`) | live | otter | `art/cards/anvilwhisker-otter.png` |
| Glintsnatch Magpie (`glintsnatch-magpie`) | live | magpie | `art/cards/glintsnatch-magpie.png` |
| Greyplume Fledgling (`greyplume-fledgling`) | live | hummingbird | `art/cards/greyplume-fledgling.png` |
| Swordbill Challenger (`swordbill-challenger`) | live | hummingbird | `art/cards/swordbill-challenger.png` |
| Ember Tetra (`ember-tetra`) | live |  | `art/cards/ember-tetra.png` |
| Coffer Mimic (`coffer-mimic`) | live |  | `art/cards/coffer-mimic.png` |
| Ironclaw Fiddler (`ironclaw-fiddler`) | live | fiddler crab | `art/cards/ironclaw-fiddler.png` |
| Pond Algae (`pond-algae`) | live | algae | `art/cards/pond-algae.png` |
| Dam-Keeper Beaver (`dam-keeper-beaver`) | live | beaver | `art/cards/dam-keeper-beaver.png` |
| Moat Snapper (`moat-snapper`) | live | snapping turtle | `art/cards/moat-snapper.png` |
| Briarback Hedgehog (`briarback-hedgehog`) | live | hedgehog | `art/cards/briarback-hedgehog.png` |
| Barkplate Beetle (`barkplate-beetle`) | live | bark beetle | `art/cards/barkplate-beetle.png` |
| Great Skua (`great-skua`) | live | great skua | `art/cards/great-skua.png` |
| Bloodscent Shark (`bloodscent-shark`) | live | shark | `art/cards/bloodscent-shark.png` |
| Cane Toad (`cane-toad`) | live | cane toad | `art/cards/cane-toad.png` |
| Inland Taipan (`inland-taipan`) | live | taipan | `art/cards/inland-taipan.png` |
| Oyster Bank (`oyster-bank`) | live | oyster | `art/cards/oyster-bank.png` |
| Musk Ox Matriarch (`musk-ox-matriarch`) | live | musk ox | `art/cards/musk-ox-matriarch.png` |
| Clinging Leech (`clinging-leech`) | live | leech | `art/cards/clinging-leech.png` |
| Barnacle Bulwark (`barnacle-bulwark`) | live | crab | `art/cards/barnacle-bulwark.png` |
| Reefback Turtle (`reefback-turtle`) | live | sea turtle | `art/cards/reefback-turtle.png` |
| Driftwood Crab (`driftwood-crab`) | live | crab | `art/cards/driftwood-crab.png` |
| Gannet Nestweaver (`gannet-nestweaver`) | live | gannet | `art/cards/gannet-nestweaver.png` |
| Nutria Reedcutter (`nutria-reedcutter`) | live | nutria | `art/cards/nutria-reedcutter.png` |
| Redwood Woodpecker (`redwood-woodpecker`) | live | woodpecker | `art/cards/redwood-woodpecker.png` |
| Termite Forager (`termite-forager`) | live | termite | `art/cards/termite-forager.png` |
| Cone-cutter Squirrel (`cone-cutter-squirrel`) | live | red squirrel | `art/cards/cone-cutter-squirrel.png` |
| Talus Pika (`talus-pika`) | live | pika | `art/cards/talus-pika.png` |
| Dune Packrat (`dune-packrat`) | live | pack rat | `art/cards/dune-packrat.png` |
| Gravel Mole (`gravel-mole`) | live | mole | `art/cards/gravel-mole.png` |
| Badger Stonemason (`badger-stonemason`) | live | badger | `art/cards/badger-stonemason.png` |
| Pumice Beetle (`pumice-beetle`) | live | dung beetle | `art/cards/pumice-beetle.png` |
| Bog Shrew (`bog-shrew`) | live | shrew | `art/cards/bog-shrew.png` |
| Mire Rat (`mire-rat`) | live | rat | `art/cards/mire-rat.png` |
| Hollow-belly Rat (`hollow-belly-rat`) | live | rat | `art/cards/hollow-belly-rat.png` |
| Gnawed Matriarch (`gnawed-matriarch`) | live | rat | `art/cards/gnawed-matriarch.png` |
| Kelpborn Otter (`kelpborn-otter`) | live | sea otter | `art/cards/kelpborn-otter.png` |
| Conger Eel (`conger-eel`) | live | eel | `art/cards/conger-eel.png` |
| Selkie Wavebinder (`selkie-wavebinder`) | live | grey seal | `art/cards/selkie-wavebinder.png` |
| Marmot Stonecutter (`marmot-stonecutter`) | live | marmot | `art/cards/marmot-stonecutter.png` |
| Prospector Mole (`prospector-mole`) | live | mole | `art/cards/prospector-mole.png` |
| Beaver Feller (`beaver-feller`) | live | beaver | `art/cards/beaver-feller.png` |
| Salvager Hermit Crab (`salvager-hermit-crab`) | live | hermit crab | `art/cards/salvager-hermit-crab.png` |
| Carrion Crow (`carrion-crow`) | live | crow | `art/cards/carrion-crow.png` |
| Hazel Coppice (`hazel-coppice`) | live |  | `art/cards/hazel-coppice.png` |
| Beachcomber Sanderling (`beachcomber-sanderling`) | live | sanderling | `art/cards/beachcomber-sanderling.png` |
| Moonshell Snail (`moonshell-snail`) | live | snail | `art/cards/moonshell-snail.png` |
| Phoenix Mushrooms (`phoenix-mushrooms`) | live | mushroom | `art/cards/phoenix-mushrooms.png` |
| Sleepless Shrew (`sleepless-shrew`) | live | shrew | `art/cards/sleepless-shrew.png` |
| Marsh-mallow Hare (`marsh-mallow-hare`) | live | hare | `art/cards/marsh-mallow-hare.png` |
| Sphagnum Vole (`sphagnum-vole`) | live | water vole | `art/cards/sphagnum-vole.png` |
| Mist-net Otter (`mist-net-otter`) | live | otter | `art/cards/mist-net-otter.png` |
| Clap-net Trapper (`clap-net-trapper`) | live | otter | `art/cards/clap-net-trapper.png` |
| Birdlime Dauber (`birdlime-dauber`) | live | otter | `art/cards/birdlime-dauber.png` |
| Gale Swift (`gale-swift`) | live | swift | `art/cards/gale-swift.png` |
| Static Fennec (`static-fennec`) | live | fennec fox | `art/cards/static-fennec.png` |
| Muskrat Reedgatherer (`muskrat-reedgatherer`) | live | muskrat | `art/cards/muskrat-reedgatherer.png` |
| Peat-cutter Vole (`peat-cutter-vole`) | live | vole | `art/cards/peat-cutter-vole.png` |
| Magpie Collector (`magpie-collector`) | live | magpie | `art/cards/magpie-collector.png` |
| Mother Carrier (`mother-carrier`) | live | hummingbird | `art/cards/mother-carrier.png` |
| Laden Hummingbird (`laden-hummingbird`) | live | hummingbird | `art/cards/laden-hummingbird.png` |
| Granite Ox Golem (`granite-ox-golem`) | live | ox | `art/cards/granite-ox-golem.png` |
