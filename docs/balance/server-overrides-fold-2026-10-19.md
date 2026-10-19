# The live server's card overrides folded into the file, 2026-10-19 (package BF4)

Owner (19:34): "can i check that every card has ran through ur budget limitation? even the mythics and divines need to be balanced first pass this way".

The live Supabase table `card_overrides` held 72 cards saved from the in-game card editor between 10-11 and 10-18. The game lays each one over `canonical/cards.json`, so on the live site these cards were the server version, not BF3's retune. Among them are the four Dragons, which are Mythic, Divine and Ancient on the server.

The read-only dump is `docs/balance/server-overrides/card-overrides-dump-2026-10-19.json`, and the tool is `tools/fold_server_overrides_2026_10_19.js`. Its plan, with every field change, conflict and budget, is `docs/balance/server-overrides/fold-plan-2026-10-19.json`.

## The rules

- **The server's design choices win:** rarity, skills, cost, Wait, name, art and the other fields. The exception is a field the file changed after the server save, judged by the commit time of the file's last change against the row's `updated_at` (`tools/server_overrides_history_2026_10_19.py`). Then the file's newer value stays, and the conflict is listed below.
- **Skills merge key by key:** the server's skills, plus any skill the file added after the save.
- **The game's own load rules come first:** Worthy becomes Bounty, and an art path that is just the card's own built asset keeps the file's art.
- **Editor defaults are skipped:** a value like `0`, `""`, `[]`, `"none"`, `"physical"`, empty speeches or `locked: false` on the server row never replaces a real value in the file.
- **Stats are re-derived from the server's A/H** with BF3's retune rules: budget v5 at Level 1 with L/10 and the map term, both rules inclusive. A card is within when it is above 60% of N and inside both rules; a card well under is raised to 65% of N; an over card is fitted down. The shape is kept.
- **Rarity on the budget ladder:** legendary 9, mythic 10, ancient 11, divine 12 (`bramblewood-budget.js` LADDER, the same order as the game's `ROAD_RARITY_STEPS`), at 1 point a rank.
- **The creatorNote** reads "2026-10-19 retune (server override folded): was A/H <rarity>". BF3's "v5 L/10" note on these cards is removed, because its "was" held the file's stats, not the live ones.

## Summary

| | Cards |
|---|---|
| Folded | 72 |
| Within budget as the server had them | 14 |
| Raised (well under) | 51 |
| Fitted down (over) | 6 |
| Owner calls | 1 |
| Field conflicts listed | 25 |

**Over budget before** (the live server versions): black-dragon 1.2×, cataphract-destrier 1.04×, cave-bat-swarm 1.2×, cave-flitter 1.01×, green-dragon 1.26×, red-dragon 1.11×, white-dragon 1.11×.

**Over budget after:** cave-bat-swarm 1.2×.

## The Dragons

| Card | Rarity (server / file before) | Server A/H | File before | Now | N (Lv 1) | 2A+H+S | Skills now | Resist |
|---|---|---|---|---|---|---|---|---|
| Black Dragon | ancient / legendary | 10/50 | 8/40 | **8/41** | 99.2 | 0.99× | flying, bounty, corrode, darksight, supreme | decay |
| Green Dragon | mythic / legendary | 10/50 | 7/37 | **8/38** | 98.17 | 1× | bounty, flying, poison, supreme, overwhelm | poison |
| Red Dragon | mythic / legendary | 10/44 | 9/39 | **9/39** | 98.17 | 0.99× | flying, bounty, stunOnHit, fireArrow, supreme | heat |
| White Dragon | divine / legendary | 10/44 | 8/37 | **8/37** | 100.23 | 0.96× | scare, bounty, flying, freeze, supreme, trueStrike | cold |

The server rows also carried each Dragon's resistance as a copy inside its skills (`effects.resist`, which the editor writes). It is now one list, the card's `resist`. The engine reads both lists, but the heat-proof check only reads the card's own, so nothing is lost. Past that, the server's skills differ from the file only by the Green Dragon's Overwhelm. The White Dragon keeps True Strike, which package D added after the save (a conflict, listed).

## Every card

| Card | Server saved | Rarity | Server → now | File before | Budget (server → now) | Fields folded | Conflicts |
|---|---|---|---|---|---|---|---|
| Acorn Chipmunk | 2026-10-12 | starter | 2/2 → **5/5** | 5/5 | 0.29× → 0.72× | — | faction: kept file (changed after the server save) |
| Alley Cat | 2026-10-11 | rare | 3/4 → **4/5** | 5/5 | 0.55× → 0.67× | — | — |
| Ant Scout | 2026-10-12 | starter | 1/2 → **4/7** | 4/7 | 0.19× → 0.72× | — | faction: kept file (changed after the server save) |
| Armored Mastiff | 2026-10-15 | common | 6/28 → **6/28** | 6/28 | 0.7× → 0.7× | art | — |
| Barrow Leech | 2026-10-16 | rare | 2/7 → **2/7** | 2/7 | 0.96× → 0.96× | skills +darksight −sap ~nocturnal | — |
| Bee Drone | 2026-10-12 | rare | 0/5 → **0/5** | 0/7 | 0.71× → 0.71× | — | — |
| Bee Forager | 2026-10-12 | starter | 0/3 → **0/8** | 0/8 | 0.32× → 0.69× | — | faction: kept file (changed after the server save) |
| Bee Knight | 2026-10-12 | uncommon | 1/2 → **3/5** | 3/5 | 0.26× → 0.72× | — | — |
| Bee Sentry | 2026-10-12 | starter | 2/3 → **3/4** | 3/4 | 0.55× → 0.72× | — | faction: kept file (changed after the server save) |
| Beetle Grunt | 2026-10-12 | common | 2/4 → **4/8** | 5/6 | 0.37× → 0.65× | — | — |
| Black Dragon | 2026-10-16 | ancient | 10/50 → **8/41** | 8/40 | 1.2× (over) → 0.99× | rarity "legendary" → "ancient" | — |
| Cataphract Destrier | 2026-10-16 | common | 11/52 → **10/49** | 11/52 | 1.04× (over) → 0.98× | skills +pounce | flavor: kept file (changed after the server save); effects: kept server (the file's newer change is compatible: no skill of its own) |
| Cave Bat Swarm | 2026-10-16 | rare | 2/3 → **2/3** | 2/2 | 1.2× (over) → 1.2× (over) | skills +darksight ~nocturnal | — |
| Cave Flitter | 2026-10-16 | uncommon (server rare) | 3/3 → **2/2** | 2/3 | 1.01× (over) → 0.87× | skills +darksight ~nocturnal | rarity: kept file (changed after the server save) |
| Chipmunk Forager | 2026-10-12 | starter | 1/4 → **2/10** | 2/10 | 0.29× → 0.67× | — | faction: kept file (changed after the server save) |
| Cobalt Talon Skirmisher | 2026-10-12 | starter | 1/4 → **2/6** | 2/6 | 0.51× → 0.73× | — | — |
| Colony | 2026-10-16 | rare | 0/21 → **0/21** | 0/17 | 0.89× → 0.89× | wait 0 → 1 | — |
| Cottontail | 2026-10-12 | starter | 3/1 → **6/2** | 6/2 | 0.34× → 0.67× | — | faction: kept file (changed after the server save) |
| Crimson Recruit | 2026-10-12 | starter | 2/1 → **2/1** | 2/1 | 0.61× → 0.61× | — | — |
| Crimson Wing Duelist Cadet | 2026-10-12 | starter | 2/2 → **3/3** | 3/3 | 0.51× → 0.68× | — | — |
| Crossed-Eyes | 2026-10-13 | starter | 2/2 → **5/5** | 5/5 | 0.29× → 0.72× | — | — |
| Dominion Nestguard | 2026-10-12 | uncommon | 3/4 → **5/6** | 5/5 | 0.44× → 0.7× | — | — |
| Duck Paddler | 2026-10-12 | starter | 3/5 → **5/8** | 5/8 | 0.4× → 0.65× | — | faction: kept file (changed after the server save) |
| Duckling | 2026-10-12 | starter | 1/1 → **5/5** | 5/5 | 0.14× → 0.72× | — | faction: kept file (changed after the server save) |
| Earthworm | 2026-10-14 | starter | 0/4 → **0/14** | 0/14 | 0.19× → 0.67× | — | — |
| Fleetfoot'd | 2026-10-12 | uncommon | 2/4 → **2/4** | 2/4 | 0.8× → 0.8× | — | faction: kept file (changed after the server save) |
| Forager Ant | 2026-10-12 | common | 1/4 → **2/9** | 2/9 | 0.34× → 0.67× | — | — |
| Garden Snail | 2026-10-12 | starter | 0/4 → **0/11** | 0/11 | 0.32× → 0.66× | — | — |
| Gold-throated Acolyte | 2026-10-12 | uncommon | 2/3 → **3/5** | 3/5 | 0.42× → 0.66× | — | — |
| Green Dragon | 2026-10-18 | mythic | 10/50 → **8/38** | 7/37 | 1.26× (over) → 1× | rarity "legendary" → "mythic"; skills +overwhelm | — |
| Guppy | 2026-10-12 | starter | 1/2 → **3/5** | 3/5 | 0.33× → 0.66× | — | — |
| Harvest Mouse | 2026-10-12 | starter | 1/2 → **4/7** | 4/7 | 0.19× → 0.72× | — | — |
| Honey Bee | 2026-10-12 | starter | 1/2 → **3/5** | 3/5 | 0.29× → 0.79× | — | faction: kept file (changed after the server save) |
| Meadow Frog | 2026-10-14 | common | 3/3 → **5/5** | 5/5 | 0.41× → 0.68× | — | — |
| Meadow Rabbit | 2026-10-12 | starter | 2/1 → **6/3** | 6/3 | 0.24× → 0.72× | — | faction: kept file (changed after the server save) |
| Meerkat Wayfarer | 2026-10-12 | uncommon | 2/5 → **4/9** | 4/9 | 0.41× → 0.68× | — | — |
| Mosswing | 2026-10-12 | starter | 0/4 → **0/10** | 0/10 | 0.29× → 0.72× | — | — |
| Otter Centurion | 2026-10-12 | rare | 3/5 → **5/9** | 5/9 | 0.39× → 0.65× | — | — |
| Otter Guard | 2026-10-12 | uncommon | 2/5 → **5/11** | 5/11 | 0.32× → 0.67× | — | faction: kept file (changed after the server save) |
| Otter Paddler | 2026-10-12 | starter | 2/4 → **4/7** | 4/7 | 0.39× → 0.72× | — | faction: kept file (changed after the server save) |
| Otter Riverguard | 2026-10-13 | common | 5/20 → **5/20** | 5/20 | 0.92× → 0.92× | — | — |
| Otter Shieldback | 2026-10-18 | uncommon | 3/18 → **4/21** | 4/20 | 0.57× → 0.69× | art | — |
| Owl Nightwatch | 2026-10-12 | common | 1/4 → **2/7** | 2/7 | 0.44× → 0.67× | — | — |
| Pill Bug | 2026-10-12 | uncommon | 1/4 → **2/9** | 3/7 | 0.38× → 0.68× | — | — |
| Pond Duck | 2026-10-12 | starter | 2/3 → **4/6** | 4/6 | 0.34× → 0.67× | — | faction: kept file (changed after the server save) |
| Pond Trout | 2026-10-12 | starter | 2/3 → **4/6** | 4/6 | 0.34× → 0.67× | — | faction: kept file (changed after the server save) |
| Quarry Mole | 2026-10-14 | common | 2/10 → **2/10** | 3/10 | 0.7× → 0.7× | — | — |
| Rabbit Kit | 2026-10-12 | common | 1/1 → **4/4** | 4/2 | 0.21× → 0.83× | — | — |
| Rabid Jackal | 2026-10-14 | uncommon | 2/3 → **3/5** | 3/5 | 0.54× → 0.69× | — | — |
| Red Dragon | 2026-10-16 | mythic | 10/44 → **9/39** | 9/39 | 1.11× (over) → 0.99× | rarity "legendary" → "mythic" | — |
| River Carp | 2026-10-12 | starter | 3/5 → **5/8** | 5/8 | 0.4× → 0.65× | — | faction: kept file (changed after the server save) |
| River Warden | 2026-10-14 | rare | 4/14 → **5/16** | 7/14 | 0.6× → 0.69× | — | — |
| Riverwing Envoy | 2026-10-12 | uncommon | 1/4 → **3/10** | 4/7 | 0.26× → 0.7× | — | — |
| Royal Guard | 2026-10-12 | veryrare | 4/6 → **6/9** | 6/9 | 0.48× → 0.67× | — | faction: kept file (changed after the server save) |
| Sergeant Bramblefox | 2026-10-12 | heroic | 4/8 → **6/11** | 6/11 | 0.49× → 0.71× | — | — |
| Shepherd | 2026-10-12 | common | 2/12 → **3/15** | 3/15 | 0.51× → 0.67× | — | — |
| Silver Minnow | 2026-10-13 | starter | 1/2 → **4/7** | 4/7 | 0.19× → 0.72× | — | faction: kept file (changed after the server save) |
| Soldier Ant | 2026-10-12 | uncommon | 2/5 → **5/11** | 6/9 | 0.3× → 0.71× | — | — |
| Sparrow Chick | 2026-10-12 | starter | 1/2 → **2/3** | 2/3 | 0.48× → 0.7× | — | — |
| Stalactite Golem | 2026-10-11 | common | 6/26 → **6/26** | 6/26 | 0.81× → 0.81× | — | — |
| Sulfur Cinder Moth | 2026-10-16 | common | 2/6 → **2/6** | 2/6 | 0.82× → 0.82× | skills +illuminate ~nocturnal | — |
| Sunspire Choirmother | 2026-10-12 | veryrare | 5/10 → **5/10** | 3/10 | 0.73× → 0.81× | — | cost: kept file (changed after the server save) |
| Sunspire Envoy | 2026-10-14 | rare | 1/6 → **2/12** | 4/8 | 0.33× → 0.66× | — | — |
| Sunthroat Courier | 2026-10-12 | uncommon | 1/3 → **3/8** | 4/5 | 0.25× → 0.71× | — | — |
| Tomcat | 2026-10-12 | common | 3/3 → **3/3** | 2/3 | 0.76× → 0.76× | — | — |
| Trash Panda Trickster | 2026-10-13 | common | 2/5 → **3/6** | 4/4 | 0.53× → 0.66× | — | — |
| Tunnel Ant | 2026-10-12 | rare | 2/4 → **6/11** | 7/9 | 0.23× → 0.65× | — | faction: kept file (changed after the server save) |
| Violet Vane Fletcher | 2026-10-12 | starter | 1/3 → **1/3** | 1/3 | 0.69× → 0.69× | — | — |
| Voidfeather Scout | 2026-10-13 | uncommon | 2/4 → **3/5** | 3/5 | 0.56× → 0.71× | — | — |
| Wandering Traveller | 2026-10-16 | rare | 4/4 → **6/6** | 6/6 | 0.5× → 0.75× | — | — |
| White Dragon | 2026-10-16 | divine | 10/44 → **8/37** | 8/37 | 1.11× (over) → 0.96× | rarity "legendary" → "divine"; skills | effects: kept both: the server's skills, plus trueStrike (the file added after the save) |
| Worker Ant | 2026-10-12 | starter | 1/3 → **1/3** | 1/3 | 0.98× → 0.98× | — | faction: kept file (changed after the server save) |

## Conflicts

These are fields where the file changed after the server save. The file's newer value stays unless the note says otherwise. To flip one, edit `canonical/cards.json`.

| Card | Field | Server | File (changed) | Kept |
|---|---|---|---|---|
| Acorn Chipmunk | faction | "otters" | "base" (2026-10-19) | file (changed after the server save) |
| Ant Scout | faction | "otters" | "base" (2026-10-19) | file (changed after the server save) |
| Bee Forager | faction | "otters" | "base" (2026-10-19) | file (changed after the server save) |
| Bee Sentry | faction | "otters" | "base" (2026-10-19) | file (changed after the server save) |
| Cataphract Destrier | flavor | "Armored nose to tail in wood-fired steel. The rider is almost beside the point." | "Gilded from crest to hoof, it keeps the old road out of the wood. Most who meet it there turn back. The wise ones come back later." (2026-10-16) | file (changed after the server save) |
| Cataphract Destrier | effects | bounty, pounce, overwhelm | bounty, overwhelm (2026-10-16) | server (the file's newer change is compatible: no skill of its own) |
| Cave Flitter | rarity | "rare" | "uncommon" (2026-10-17) | file (changed after the server save) |
| Chipmunk Forager | faction | "otters" | "base" (2026-10-19) | file (changed after the server save) |
| Cottontail | faction | "otters" | "base" (2026-10-19) | file (changed after the server save) |
| Duck Paddler | faction | "otters" | "base" (2026-10-19) | file (changed after the server save) |
| Duckling | faction | "otters" | "base" (2026-10-19) | file (changed after the server save) |
| Fleetfoot'd | faction | "otters" | "base" (2026-10-19) | file (changed after the server save) |
| Honey Bee | faction | "otters" | "base" (2026-10-19) | file (changed after the server save) |
| Meadow Rabbit | faction | "otters" | "base" (2026-10-19) | file (changed after the server save) |
| Otter Guard | faction | "otters" | "base" (2026-10-19) | file (changed after the server save) |
| Otter Paddler | faction | "otters" | "base" (2026-10-19) | file (changed after the server save) |
| Royal Guard | faction | "otters" | "base" (2026-10-19) | file (changed after the server save) |
| Pond Duck | faction | "otters" | "base" (2026-10-19) | file (changed after the server save) |
| Pond Trout | faction | "otters" | "base" (2026-10-19) | file (changed after the server save) |
| River Carp | faction | "otters" | "base" (2026-10-19) | file (changed after the server save) |
| Silver Minnow | faction | "otters" | "base" (2026-10-19) | file (changed after the server save) |
| Sunspire Choirmother | cost | 2 | 1 (2026-10-19) | file (changed after the server save) |
| Tunnel Ant | faction | "otters" | "base" (2026-10-19) | file (changed after the server save) |
| White Dragon | effects | scare, bounty, flying, freeze, supreme | flying, bounty, freeze, scare, supreme, trueStrike (2026-10-18) | both: the server's skills, plus trueStrike (the file added after the save) |
| Worker Ant | faction | "otters" | "base" (2026-10-19) | file (changed after the server save) |

## Editor defaults left out

None.

## The node edits (Map 0 and the Tutorial, 10-18)

These rows were folded into `CONQUEST_MAPS` in `arena_app.js` the way the game applies them (each patch laid over the node). Before, they overrode the road on the live site.

| Row | Node | Field | File before | Now (the owner's) |
|---|---|---|---|---|
| m1 | 0-1 | name | "Otter Patrol" | "Pond Patrol" |
| m1 | 0-1 | icon | "🦦" | "🐌" |
| m1 | 0-1 | deck | {"otter-kit":2,"otter-paddler":2,"meadow-rabbit":3,"pond-duck":2,"water-vole":2} | {"honey-bee":2,"pond-duck":2,"cottontail":2,"pond-trout":2,"meadow-frog":2,"crossed-eyes":2,"garden-snail":2,"meadow-rabbit":2,"acorn-chipmunk":2,"chipmunk-forager":2} |
| m1 | 0-1 | hqHp | 20 | 30 |
| m1 | 0-2 | name | "Scorpion Ambush" | "Thicket Swarm" |
| m1 | 0-2 | icon | "🦂" | "🐝" |
| m1 | 0-2 | deck | {"tunnel-ant":4,"otter-kit":4,"earthworm":3,"trash-panda-trickster":2,"dynamite-packrat":2} | {"ant-scout":2,"honey-bee":2,"pond-duck":2,"bee-sentry":2,"cottontail":1,"pond-trout":2,"worker-ant":2,"bee-forager":2,"forager-ant":2,"acorn-chipmunk":1,"bee-knight":2} |
| m1 | 0-2 | requires | [] | ["0-1"] |
| m1 | 0-2 | hqHp | null | 28 |
| m1 | 0-3 | deck | {"trash-panda-trickster":5,"meadow-rabbit":2,"pond-trout":2,"tunnel-ant":4,"burrow-rabbit":2} | {"pond-duck":2,"cottontail":2,"fleetfootd":2,"pond-trout":2,"crossed-eyes":1,"meadow-rabbit":2,"chipmunk-skirmisher":1,"trash-panda-trickster":3} |
| m1 | 0-3 | hqHp | 22 | 28 |
| m1 | 0-3 | requires | ["0-1","0-2"] | ["0-2"] |
| m1 | 0-4 | kind | "boss" | "skirmish" |
| m1 | 0-4 | icon | "❄️" | "🦊" |
| m1 | 0-4 | deck | {"glacier-wolf-pack":3,"pond-duck":4,"otter-kit":1,"otter-royal-guard":3,"pine-marten":2,"trash-panda-trickster":2,"otter-paddler":2,"helmeted-otter":2,"meadow-rabbit":1} | {"fox-kit":2,"pond-duck":3,"bee-sentry":1,"beetle-grunt":2,"crossed-eyes":2,"acorn-chipmunk":1,"chipmunk-forager":1,"chipmunk-skirmisher":1,"trash-panda-trickster":2} |
| m1 | 0-4 | hqHp | 52 | 25 |
| m1 | 0-4 | revealDeck | "win" | null |
| m1 | 0-4 | ender | null | true |
| mtut | tutorial | hqHp | 20 | 28 |
| mtut | tutorial | deck | null | {} |
| mtut | tutorial | tutHp | null | 9 |
| mtut | tutorial2 | hqHp | 20 | 28 |
| mtut | tutorial2 | deck | null | {} |
| mtut | tutorial2 | tutHp | null | 11 |

- 0-1: armour 0. (`node.armour` is not written: the game ignores it since 10-18, the Shield rule.)
- 0-2: bee-knight-classic -> bee-knight (no such card since 10-13); armour 0. (`node.armour` is not written: the game ignores it since 10-18, the Shield rule.)
- 0-4: armour 5. (`node.armour` is not written: the game ignores it since 10-18, the Shield rule.)

## The road, re-checked (not retuned)

61 fights use a folded card that changed. Some hold it in their enemy deck; the rest play the Maps 0–3 reference decks, whose Bee Drone, Riverwing Envoy and Rabbit Kit changed. All of them were re-measured (120 games, the measure seeds; `docs/balance/server-overrides/road-recheck-2026-10-19.json`).

- **Main maps on target:** 150 → **146** of 179. Side maps: 63 → 63 of 77. Fresh seeds, main: 131 → 128.
- **8 fights left their band and 4 came into it.** The gaps list (`docs/balance/road-gaps-2026-10-19.json`) now has 47 fights (was 43).
- **Map 0's fights are the owner's own decks.** They were measured as they are and not tuned.

| Fight | Kind | Before | After | Target (band) | Band before → after |
|---|---|---|---|---|---|
| 0-2 | skirmish | 78.3% | 65.8% | 75% (67–83) | green → hard |
| 3-1 | skirmish | 82.5% | 80% | 90% (82–98) | green → hard |
| 3-7 | elite | 55.8% | 47.5% | 40% (30–49) | easy → green |
| 8-3 | skirmish | 82.5% | 57.5% | 80% (72–88) | green → hard |
| 8-4 | skirmish | 76.7% | 58.3% | 75% (67–83) | green → hard |
| 12-5 | elite | 78.3% | 71.7% | 66% (58–74) | easy → green |
| 15-3 | skirmish | 84.2% | 87.5% | 78% (70–86) | green → easy |
| 20-8 | elite | 56.7% | 50.8% | 60% (52–68) | green → hard |
| 1-A-1 | skirmish | 80.8% | 65% | 88.2% (80.2–96.2) | green → hard |
| 1-A-3 | skirmish | 57.5% | 66.7% | 65.9% (57.9–73.9) | hard → green |
| 0-3 | skirmish | 63.3% | 77.5% | 60% (52–68) | green → easy |
| 3-6 | elite | 68.3% | 60.8% | 60% (52–68) | easy → green |

## Clearing the live rows (proposed, NOT applied)

`supabase/proposed/20261019_clear_folded_overrides.sql` is waiting for the owner's approval. Nothing has touched the live database.
- **The 72 card rows are reset to an empty patch** (`data = {"__patch": true}`). The game reads that as the file's card. The old row is kept in `deleted_snapshot` and in a backup table. **The card rows must not be marked `deleted = true`:** for a card, that is the editor's tombstone, and the game would remove the card from play (`liveDeletes`). The reset also bumps `updated_at`, so open games pick it up on their next 30-second poll.
- **The 2 node rows** (`__cfg:map-nodes:m1` with 0-1 to 0-4, and `__cfg:map-nodes:mtut` with the two tutorials) are marked deleted with their data kept in `deleted_snapshot`, the way the editor's "drop every edit" does. Each row holds only the folded edits.
- **Left alone:** the map-layout rows, the other map-node rows (`requires` links and added nodes on older map ids) and `__cfg:tutorial`.
- **The admin's own browser** also keeps a local copy of its edits (`bramblewood_arena_card_overlay`, and node edits newer than the server are republished). Clear it on that device after the SQL runs.
