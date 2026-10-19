# The full card retune, 2026-10-19 (package BF3)

Owner (15:48): "Retune to our L/10 stats. Retune all cards base on your assumptions in the balance calculation in master hub. Balance our dragons and everything."

## The rule

- **The budget:** v5, N = (Base + L/10) × (1 + L/30), at **Level 1**, and a card must also pass at the level it starts at (a Base card's Lv 0: Base − 1). Base = 20 + Rarity + 6×Wait + 0.5×Wait² + 4×Lumber + 0.4×Lumber² + Ritual + 0.2 × Map (the map it becomes obtainable on).
- **The skill costs:** `canonical/skill-costs.json` as it is, the applied measured S included.
- **The band:** the master hub's Skill costs tab. A card is **over** when 2A+H+S ≥ N or A·H+S ≥ (N/3)² (both ×1.5 per half-miss skill), **well under** (pink) when 2A+H+S ≤ 60% of N, and **within** between. Over cards come down until both rules pass; well-under cards go up to 65% of N, a few points inside the band so rounding never puts them back; cards within are left alone.
- **The shape:** Attack and Health move by one factor, so a wall keeps 0 Attack and a glass cannon stays glass. Where a high-Attack card would break the A·H rule first, only its Health grows.
- **Not changed:** costs, Wait, rarities and skills. A card that stats can't fix is an owner call (below).

## Summary

| | Cards |
|---|---|
| Live cards checked | 709 |
| Within, unchanged | 290 |
| Over, fitted down | 25 |
| Well under, raised | 393 |
| Owner calls | 1 |

## Every change

| Card | Rarity | Wait / Lumber | Was | Now | N (Lv 1) | 2A+H+S was | now | Why |
|---|---|---|---|---|---|---|---|---|
| Abyss Lantern Squid | uncommon | 2 / 1 | 3/11 | 5/17 | 44.54 | 46.7% | 69.1% | well under |
| Acorn Chipmunk | starter | 0 / 0 | 2/2 | 5/5 | 20.77 | 28.9% | 72.2% | well under |
| Alley Cat | rare | 0 / 0 | 2/2 | 5/5 | 24.9 | 39% | 75.1% | well under |
| Alpine Marmot | common | 1 / 0 | 2/8 | 4/14 | 33.07 | 39.3% | 69.5% | well under |
| Anaconda Coil | rare | 2 / 1 | 5/10 | 7/13 | 43.92 | 50.1% | 66% | well under |
| Ant Scout | starter | 0 / 0 | 1/2 | 4/7 | 20.77 | 19.3% | 72.2% | well under |
| Ant Warrior | uncommon | 0 / 0 | 2/3 | 4/7 | 24.28 | 32.9% | 65.9% | well under |
| Antler Skirmisher | rare | 1 / 1 | 4/12 | 5/15 | 37.82 | 52.9% | 66.1% | well under |
| Antlion Pit | uncommon | 1 / 1 | 3/11 | 4/15 | 37.82 | 50.5% | 66.4% | well under |
| Anvil Thrush | common | 1 / 0 | 2/4 | 3/7 | 29.55 | 40.6% | 66% | well under |
| Apollo Butterfly | uncommon | 1 / 0 | 1/6 | 2/9 | 31.83 | 42.4% | 66% | well under |
| Archerfish | uncommon | 1 / 1 | 3/8 | 5/12 | 35.96 | 44.5% | 66.7% | well under |
| Arctic Tern | uncommon | 1 / 0 | 1/4 | 2/6 | 30.59 | 46.3% | 65.9% | well under |
| Armadillo Guard | common | 0 / 1 | 3/5 | 5/8 | 30.07 | 43.2% | 66.5% | well under |
| Ash Imp | common | 0 / 0 | 1/3 | 4/11 | 25.73 | 19.4% | 73.8% | well under |
| Ashbone Ghoul | common | 1 / 0 | 2/5 | 5/12 | 32.65 | 27.6% | 67.4% | well under |
| Aye-aye Prowler | common | 0 / 0 | 4/4 | 6/6 | 24.7 | 48.6% | 72.9% | well under |
| Baby Bat | common | 1 / 0 | 2/5 | 3/6 | 30.17 | 58.1% | 73% | well under |
| Baby Horned Capybara | common | 1 / 0 | 2/6 | 4/11 | 29.55 | 37.2% | 67.7% | well under |
| Badger Berserker | rare | 1 / 1 | 3/12 | 4/18 | 39.68 | 46.6% | 66.8% | well under |
| Badger Lumberjack | uncommon | 1 / 1 | 2/10 | 3/13 | 35.13 | 55.4% | 69.6% | well under |
| Balloon Archer | uncommon | 2 / 1 | 1/8 | 2/14 | 44.12 | 40.8% | 68% | well under |
| Battlement Heron | rare | 1 / 1 | 2/6 | 4/12 | 40.09 | 40.9% | 65.9% | well under |
| Bear Cub | uncommon | 0 / 0 | 2/8 | 3/12 | 26.97 | 44.5% | 66.7% | well under |
| Beaver Lumberjack | common | 1 / 0 | 3/4 | 6/7 | 28.52 | 38.6% | 70.1% | well under |
| Bee Forager | starter | 0 / 0 | 0/3 | 0/8 | 20.77 | 32.5% | 68.6% | well under |
| Bee Knight | uncommon | 0 / 0 | 1/2 | 3/5 | 22.84 | 26.3% | 72.2% | well under |
| Bee Sentry | starter | 1 / 0 | 2/3 | 3/4 | 27.49 | 55.3% | 71.7% | well under |
| Beetle Grunt | common | 1 / 0 | 3/4 | 5/6 | 28.73 | 44.3% | 65.2% | well under |
| Bison Bulldozer | uncommon | 1 / 1 | 4/7 | 5/9 | 37.2 | 55.1% | 65.9% | well under |
| Black Dragon | legendary | 5 / 4 | 10/50 | 8/40 | 97.13 | 121.4% | 99.8% | over budget |
| Blackmass Acolyte | uncommon | 1 / 0 | 1/6 | 2/9 | 33.48 | 52% | 66.9% | well under |
| Blind Cave Fish | common | 0 / 0 | 1/6 | 1/5 | 23.46 | 101.7% | 95.4% | over budget |
| Blister Beetle | common | 1 / 0 | 1/5 | 2/8 | 29.55 | 50.9% | 67.9% | well under |
| Blue Dragon | legendary | 5 / 4 | 10/44 | 9/39 | 97.13 | 110.1% | 99.3% | over budget |
| Blue-ringed Octopus | rare | 2 / 1 | 3/9 | 6/17 | 44.95 | 35.6% | 66.7% | well under |
| Boar Rampager | rare | 2 / 1 | 4/9 | 5/11 | 45.57 | 58.3% | 67.1% | well under |
| Bog Leech | uncommon | 0 / 0 | 2/5 | 3/7 | 23.87 | 49% | 65.8% | well under |
| Bog Revenant | rare | 1 / 1 | 4/7 | 7/11 | 36.37 | 41.2% | 68.7% | well under |
| Bogfire Newt | uncommon | 1 / 0 | 1/13 | 1/15 | 30.79 | 58.9% | 65.4% | well under |
| Bombardier Beetle | uncommon | 2 / 1 | 3/10 | 5/16 | 43.3 | 43.9% | 67% | well under |
| Bone Diviner | uncommon | 2 / 2 | 5/19 | 5/18 | 47.22 | 100.8% | 97.6% | over budget |
| Bonebreaker | common | 2 / 2 | 6/12 | 7/15 | 50.32 | 56.4% | 66.4% | well under |
| Booming Bittern | uncommon | 1 / 1 | 3/8 | 4/10 | 35.34 | 56% | 67.3% | well under |
| Border Collie | uncommon | 1 / 1 | 4/7 | 7/11 | 37.2 | 40.3% | 67.2% | well under |
| Box Turtle | common | 0 / 0 | 2/5 | 3/9 | 22.63 | 39.8% | 66.3% | well under |
| Bramble Hoglet | common | 0 / 0 | 1/9 | 1/11 | 24.28 | 58.1% | 66.3% | well under |
| Bramble Sprout | common | 0 / 0 | 2/6 | 3/10 | 23.25 | 43% | 68.8% | well under |
| Bramblewood Lynx | rare | 1 / 1 | 6/6 | 9/9 | 37.82 | 48.9% | 72.7% | well under |
| Brimstone Hound | uncommon | 1 / 0 | 3/3 | 6/6 | 33.48 | 39.1% | 66% | well under |
| Burrow Rabbit | starter | 1 / 0 | 3/7 | 4/10 | 27.49 | 47.3% | 65.5% | well under |
| Buzzed Chipmunk | common | 2 / 1 | 3/7 | 6/15 | 41.85 | 32.1% | 65.6% | well under |
| Candle Moth | common | 0 / 0 | 1/4 | 2/6 | 24.08 | 43.6% | 68.5% | well under |
| Carrion Beetle | uncommon | 1 / 1 | 4/8 | 6/11 | 35.34 | 45.3% | 65.1% | well under |
| Carrion Fly Swarm | rare | 1 / 0 | 1/3 | 2/5 | 32.03 | 53.1% | 71.8% | well under |
| Cave Swiftlet | common | 1 / 0 | 2/4 | 3/7 | 29.55 | 40.6% | 66% | well under |
| Chained Binturong | uncommon | 0 / 1 | 3/6 | 5/10 | 31.31 | 41.5% | 67.1% | well under |
| Chamois Leaper | uncommon | 1 / 1 | 3/9 | 4/11 | 36.37 | 57.2% | 68.2% | well under |
| Chapel Sparrow | common | 0 / 0 | 2/3 | 3/4 | 22.01 | 54.5% | 75% | well under |
| Chilli Parrot | uncommon | 1 / 1 | 4/11 | 5/15 | 36.99 | 51.4% | 67.6% | well under |
| Chipmunk Forager | starter | 0 / 0 | 1/4 | 2/10 | 20.77 | 28.9% | 67.4% | well under |
| Chipmunk Hoarder | common | 1 / 0 | 2/5 | 5/11 | 30.79 | 32.5% | 71.5% | well under |
| Chipmunk Skirmisher | common | 0 / 0 | 2/5 | 3/9 | 22.01 | 40.9% | 68.2% | well under |
| Cinder Imp | common | 0 / 0 | 2/3 | 5/7 | 25.73 | 27.2% | 66.1% | well under |
| Cinder Skeleton | common | 0 / 1 | 3/5 | 4/7 | 30.48 | 53.7% | 66.8% | well under |
| Cleaner Wrasse | uncommon | 1 / 1 | 4/8 | 6/12 | 36.17 | 44.2% | 66.4% | well under |
| Clover Butterfly | common | 0 / 0 | 1/3 | 2/5 | 22.01 | 57.5% | 84.7% | well under |
| Clownfish Scout | common | 0 / 0 | 1/5 | 2/8 | 22.84 | 47.2% | 69.1% | well under |
| Cobalt Fledgling | starter | 0 / 0 | 1/2 | 2/3 | 20.77 | 53.7% | 75.3% | well under |
| Cobalt Talon Skirmisher | starter | 1 / 0 | 1/4 | 2/6 | 27.49 | 51.5% | 73.3% | well under |
| Colony | rare | 0 / 0 | 0/20 | 0/17 | 23.87 | 110.4% | 97.9% | over budget |
| Colossal Squid | rare | 3 / 4 | 4/10 | 9/21 | 72.33 | 38.6% | 67.6% | well under |
| Compost Grub | common | 0 / 0 | 1/10 | 1/14 | 23.25 | 51.6% | 68.8% | well under |
| Conch Herald | uncommon | 1 / 1 | 3/9 | 4/11 | 35.13 | 56.8% | 68.2% | well under |
| Cone Snail | uncommon | 1 / 1 | 3/8 | 4/10 | 36.17 | 55.9% | 66.9% | well under |
| Corpse-flower Beetle | rare | 2 / 1 | 5/12 | 6/13 | 42.88 | 58.2% | 65.2% | well under |
| Cottonmouth Matriarch | rare | 2 / 1 | 4/12 | 5/16 | 44.12 | 52.4% | 66% | well under |
| Cottontail | starter | 0 / 0 | 3/1 | 6/2 | 20.77 | 33.7% | 67.4% | well under |
| Cricket Drummer | common | 0 / 0 | 2/5 | 3/9 | 22.01 | 40.9% | 68.2% | well under |
| Crimson Wing Duelist Cadet | starter | 1 / 0 | 2/2 | 3/3 | 27.49 | 51.5% | 67.8% | well under |
| Crossed-Eyes | starter | 0 / 0 | 2/2 | 5/5 | 20.77 | 28.9% | 72.2% | well under |
| Crown Pretender | uncommon | 1 / 1 | 4/10 | 5/13 | 35.13 | 51.2% | 65.5% | well under |
| Cypress Root Lurker | common | 2 / 1 | 4/13 | 5/17 | 41.85 | 52.6% | 66.9% | well under |
| Dam Wall | common | 2 / 1 | 0/20 | 0/27 | 41.23 | 49.7% | 66.7% | well under |
| Dhole Matriarch | rare | 2 / 2 | 5/7 | 10/14 | 51.56 | 33% | 65.9% | well under |
| Dhole Runner | common | 1 / 1 | 4/6 | 7/10 | 36.37 | 38.5% | 66% | well under |
| Dolphin Knight | rare | 1 / 0 | 4/4 | 5/5 | 31.62 | 59.8% | 69.3% | well under |
| Dominion Nestguard | uncommon | 1 / 1 | 4/4 | 5/5 | 34.1 | 52.8% | 66% | well under |
| Dormouse | common | 0 / 0 | 2/5 | 3/9 | 22.01 | 40.9% | 68.2% | well under |
| Dread Bell | uncommon | 0 / 0 | 0/10 | 0/16 | 26.76 | 44.4% | 66.9% | well under |
| Duck Paddler | starter | 1 / 0 | 3/5 | 5/8 | 27.49 | 40% | 65.5% | well under |
| Duckling | starter | 0 / 0 | 1/1 | 5/5 | 20.77 | 14.4% | 72.2% | well under |
| Dune Jackal | common | 0 / 1 | 2/12 | 2/10 | 27.38 | 107% | 99.7% | over budget |
| Dung Beetle | common | 0 / 0 | 1/4 | 3/10 | 23.25 | 30.1% | 73.1% | well under |
| Dust Hyena | uncommon | 0 / 0 | 2/6 | 3/10 | 26.56 | 42.8% | 65.4% | well under |
| Dust-devil Kestrel | rare | 2 / 1 | 5/9 | 8/14 | 46.6 | 45.4% | 69% | well under |
| Eagle-Owl Quartermaster | rare | 1 / 1 | 1/6 | 2/12 | 37.41 | 36.1% | 68.2% | well under |
| Earthworm | starter | 0 / 0 | 0/4 | 0/14 | 20.77 | 19.3% | 67.4% | well under |
| Echidna Quillshot | rare | 2 / 1 | 4/9 | 7/16 | 46.81 | 38.5% | 66.2% | well under |
| Echo Keeper | common | 0 / 0 | 2/6 | 3/9 | 23.04 | 43.4% | 65.1% | well under |
| Electric Catfish | rare | 1 / 1 | 2/10 | 3/16 | 36.17 | 44.2% | 66.4% | well under |
| Electric Ray | uncommon | 1 / 1 | 4/8 | 5/10 | 36.17 | 55.9% | 67% | well under |
| Elephant-nose Fish | uncommon | 1 / 1 | 3/8 | 5/12 | 35.13 | 45.7% | 68.4% | well under |
| Ember Jackal | rare | 0 / 1 | 3/9 | 5/14 | 32.55 | 46.1% | 73.7% | well under |
| Ember Wisp | rare | 0 / 0 | 4/3 | 6/4 | 23.87 | 50.3% | 71.2% | well under |
| Ent | rare | 3 / 0 | 2/20 | 3/25 | 47.12 | 50.9% | 65.8% | well under |
| Eyrie Warden | common | 3 / 3 | 7/24 | 7/22 | 63.45 | 104.4% | 99.6% | over budget |
| Farm Dog | common | 0 / 0 | 2/5 | 3/9 | 22.01 | 40.9% | 68.2% | well under |
| Fawn Scout | rare | 0 / 0 | 2/7 | 3/12 | 26.56 | 41.4% | 67.8% | well under |
| Fen Mink | uncommon | 1 / 0 | 2/9 | 3/12 | 30.59 | 49% | 65.4% | well under |
| Ferry Toll-Frog | common | 0 / 0 | 2/5 | 3/6 | 22.84 | 57.6% | 70.8% | well under |
| Fiddler Crab Swarm | common | 0 / 0 | 2/3 | 4/5 | 22.22 | 44.1% | 71.1% | well under |
| Field Crow | common | 0 / 0 | 2/3 | 3/4 | 22.01 | 47.7% | 68.2% | well under |
| Field Mouse | common | 0 / 0 | 2/5 | 4/9 | 24.28 | 39.1% | 72.1% | well under |
| Field Vole | common | 0 / 0 | 1/5 | 2/11 | 22.84 | 30.6% | 65.7% | well under |
| Fire Drake Hatchling | common | 2 / 2 | 6/13 | 8/16 | 50.32 | 53.7% | 67.6% | well under |
| Fire Hawk | rare | 2 / 1 | 5/10 | 8/15 | 47.02 | 44.4% | 67.8% | well under |
| Fire Salamander | uncommon | 1 / 1 | 3/8 | 5/13 | 38.03 | 42.1% | 65.7% | well under |
| Firefly Swarm | uncommon | 1 / 1 | 3/8 | 5/13 | 38.23 | 41.9% | 65.4% | well under |
| Firetail Trickster | rare | 0 / 1 | 2/9 | 2/11 | 31.1 | 58.8% | 65.3% | well under |
| Flagellant Vulture | uncommon | 1 / 1 | 4/7 | 7/12 | 38.03 | 37.8% | 66.7% | well under |
| Forager Ant | common | 0 / 0 | 1/4 | 2/9 | 21.8 | 34.4% | 66.5% | well under |
| Fox Kit | uncommon | 0 / 0 | 2/5 | 4/9 | 25.52 | 35.3% | 66.6% | well under |
| Fox Sharpshot | common | 2 / 1 | 3/10 | 5/16 | 43.3 | 43.9% | 67% | well under |
| Frost Hare Sprinter | common | 0 / 0 | 2/3 | 3/5 | 25.11 | 41.8% | 65.7% | well under |
| Frostbitten Wolverine | uncommon | 1 / 1 | 3/13 | 4/15 | 35.13 | 54.1% | 65.5% | well under |
| Frostmoon Howler | rare | 1 / 0 | 2/9 | 3/14 | 34.1 | 45.5% | 66% | well under |
| Fruit-bat Familiar | uncommon | 1 / 1 | 4/8 | 6/13 | 38.03 | 42.1% | 65.7% | well under |
| Fungus Gnat Cloud | common | 0 / 0 | 1/3 | 2/6 | 22.84 | 32.8% | 65.7% | well under |
| Gale Sprite | common | 0 / 1 | 4/6 | 5/8 | 26.35 | 53.1% | 68.3% | well under |
| Gallery Orb-Weaver | rare | 1 / 1 | 4/10 | 5/11 | 36.58 | 58.7% | 66.9% | well under |
| Garden Snail | starter | 0 / 0 | 0/4 | 0/11 | 20.77 | 32.5% | 66.2% | well under |
| Gatling Hog | rare | 1 / 1 | 2/7 | 4/13 | 35.34 | 36.8% | 65.1% | well under |
| Geode Scorpion | rare | 2 / 1 | 4/10 | 6/15 | 42.88 | 45.2% | 66.2% | well under |
| Gilded Swan Knight | superrare | 2 / 1 | 2/8 | 4/16 | 49.91 | 41.4% | 65.4% | well under |
| Glass Changeling | rare | 1 / 1 | 3/8 | 4/9 | 37.82 | 55.5% | 67.4% | well under |
| Glass Golem | rare | 1 / 1 | 8/5 | 10/6 | 37.82 | 55.5% | 68.7% | well under |
| Glass Octopus | rare | 2 / 1 | 4/14 | 5/17 | 45.57 | 54.9% | 65.8% | well under |
| Glasswing Butterfly | rare | 1 / 1 | 3/7 | 6/13 | 39.27 | 35.7% | 66.2% | well under |
| Glasswing Moth | common | 0 / 0 | 2/6 | 3/9 | 25.52 | 48.1% | 67.7% | well under |
| Gloom Gibbon | rare | 1 / 1 | 4/8 | 6/11 | 35.13 | 45.5% | 65.5% | well under |
| Glowworm Cluster | common | 1 / 0 | 2/6 | 3/10 | 29.55 | 46.3% | 66.6% | well under |
| Gold-throated Acolyte | uncommon | 2 / 0 | 2/3 | 3/5 | 37.3 | 42.2% | 66.4% | well under |
| Goose Sentry | rare | 1 / 1 | 3/12 | 4/14 | 40.09 | 55.9% | 65.9% | well under |
| Grave-Grin Hyena | uncommon | 1 / 0 | 2/9 | 3/15 | 32.45 | 40.7% | 65.3% | well under |
| Great Gate | common | 0 / 2 | 0/28 | 0/22 | 31.72 | 117.3% | 98.4% | over budget |
| Green Dragon | legendary | 5 / 4 | 10/50 | 7/37 | 97.13 | 124.9% | 95.6% | over budget |
| Guppy | starter | 0 / 0 | 1/2 | 3/5 | 20.77 | 32.7% | 66.4% | well under |
| Hagfish Silencer | rare | 1 / 1 | 4/8 | 6/11 | 35.13 | 45.5% | 65.5% | well under |
| Hanging Loafer | common | 4 / 1 | 3/22 | 4/33 | 62.31 | 45.7% | 66.6% | well under |
| Harp Seal Pup | common | 0 / 0 | 2/5 | 3/6 | 22.84 | 56% | 69.1% | well under |
| Harvest Mouse | starter | 0 / 0 | 1/2 | 4/7 | 20.77 | 19.3% | 72.2% | well under |
| Heartwood Treant | rare | 2 / 2 | 2/14 | 3/23 | 49.29 | 43.2% | 65.5% | well under |
| Hedge Changeling | uncommon | 1 / 0 | 2/7 | 4/12 | 30.59 | 36% | 65.4% | well under |
| Hedge Weasel | uncommon | 1 / 0 | 3/5 | 6/9 | 32.03 | 38.8% | 70% | well under |
| Hedgehog Scout | common | 0 / 0 | 2/4 | 4/7 | 22.01 | 40.9% | 72.7% | well under |
| Hellbender | common | 0 / 0 | 2/6 | 4/11 | 25.73 | 38.9% | 73.8% | well under |
| Helmeted Otter | common | 1 / 0 | 2/8 | 3/14 | 29.55 | 40.6% | 67.7% | well under |
| Hercules Beetle | rare | 2 / 1 | 4/10 | 5/13 | 45.78 | 54.9% | 65.9% | well under |
| Honey Badger Fury | common | 0 / 1 | 2/10 | 3/13 | 27.38 | 54.8% | 73% | well under |
| Honey Bee | starter | 0 / 0 | 1/2 | 3/5 | 20.77 | 28.9% | 79.4% | well under |
| Honeyjoe Brewer | uncommon | 0 / 0 | 1/2 | 3/5 | 23.87 | 32.8% | 76.8% | well under |
| Hoopoe Herald | common | 0 / 0 | 2/6 | 4/11 | 24.7 | 40.5% | 76.9% | well under |
| House Cat | common | 0 / 0 | 3/3 | 5/5 | 22.01 | 40.9% | 68.2% | well under |
| Howdah Archers | rare | 1 / 1 | 2/7 | 3/11 | 39.89 | 51.5% | 66.6% | well under |
| Howler Monkey | uncommon | 0 / 0 | 2/3 | 4/5 | 23.87 | 44.7% | 69.9% | well under |
| Humpback Elder | common | 3 / 3 | 8/39 | 7/36 | 62 | 105% | 97% | over budget |
| Hymn Wren | common | 0 / 0 | 2/5 | 4/9 | 24.08 | 37.4% | 70.6% | well under |
| Ibex Rockcaller | rare | 2 / 1 | 3/9 | 6/17 | 45.16 | 35.4% | 66.4% | well under |
| Ice Fish | epic | 3 / 1 | 5/11 | 8/19 | 54.77 | 40.2% | 65.7% | well under |
| Ice Petrel | uncommon | 1 / 1 | 3/6 | 6/12 | 38.65 | 36.2% | 67.3% | well under |
| Ice-Crevasse Wolf | rare | 1 / 1 | 3/10 | 4/12 | 36.17 | 59.2% | 70.2% | well under |
| Inside-Out Hedgehog | uncommon | 0 / 0 | 1/2 | 3/5 | 25.52 | 41.1% | 68.5% | well under |
| Iron Warden | epic | 3 / 1 | 4/18 | 6/27 | 59.73 | 43.5% | 65.3% | well under |
| Ironback Gorilla | rare | 4 / 1 | 8/20 | 9/22 | 62.52 | 59.2% | 65.6% | well under |
| Ironmaw Warwolf | epic | 2 / 3 | 9/26 | 8/24 | 58.59 | 102.4% | 95.6% | over budget |
| Irradiated Axolotl | uncommon | 1 / 1 | 4/10 | 5/13 | 36.79 | 51.6% | 65.2% | well under |
| Jay Pilferer | common | 0 / 1 | 3/5 | 5/8 | 26.56 | 45.2% | 71.5% | well under |
| King Maker | rare | 1 / 1 | 4/11 | 5/15 | 37.82 | 50.2% | 66.1% | well under |
| Kinkajou Lurker | uncommon | 1 / 1 | 4/7 | 6/10 | 36.99 | 50.5% | 69.4% | well under |
| Kittiwake Flock | common | 0 / 0 | 1/3 | 2/6 | 22.84 | 32.8% | 65.7% | well under |
| Kraken Spawnling | common | 2 / 3 | 9/31 | 9/29 | 54.46 | 103.1% | 99.4% | over budget |
| Krill Swarm | common | 0 / 0 | 2/3 | 4/5 | 22.84 | 42.9% | 69.1% | well under |
| Ladybird Guard | common | 0 / 0 | 1/6 | 2/10 | 22.01 | 40.9% | 68.2% | well under |
| Lamprey | common | 0 / 1 | 3/5 | 5/8 | 27.59 | 43.5% | 68.9% | well under |
| Land Tiller | common | 0 / 0 | 1/5 | 2/10 | 22.84 | 35% | 65.7% | well under |
| Lantern Bearer | uncommon | 1 / 0 | 2/5 | 3/8 | 30.59 | 44.1% | 68.6% | well under |
| Lantern Spark Fly | uncommon | 1 / 0 | 2/5 | 3/8 | 31.21 | 43.3% | 67.3% | well under |
| Leaf Chameleon | uncommon | 1 / 1 | 3/10 | 4/14 | 36.99 | 50% | 66.2% | well under |
| Leafcutter Gardener | common | 0 / 0 | 2/6 | 3/10 | 23.25 | 43% | 68.8% | well under |
| Lemming Swarm | common | 0 / 0 | 1/2 | 3/6 | 22.84 | 31.6% | 66.6% | well under |
| Leopard Seal | rare | 2 / 1 | 6/10 | 8/13 | 42.88 | 53% | 69.3% | well under |
| Lichen Tortoise | rare | 2 / 1 | 5/9 | 8/14 | 42.88 | 44.3% | 70% | well under |
| Lionfish | uncommon | 1 / 1 | 3/8 | 4/11 | 35.13 | 53.5% | 67.7% | well under |
| Lone Grey Wolf | veryrare | 2 / 1 | 4/18 | 5/20 | 47.43 | 59% | 67.5% | well under |
| Lotus Frog | uncommon | 1 / 1 | 4/7 | 6/11 | 34.51 | 43.5% | 66.6% | well under |
| Lovebird | common | 0 / 1 | 4/5 | 6/8 | 29.24 | 44.5% | 68.4% | well under |
| Lurking Dread | rare | 1 / 1 | 3/8 | 4/12 | 39.06 | 49.9% | 65.2% | well under |
| Lyrebird Mimic | uncommon | 1 / 1 | 4/8 | 5/11 | 36.58 | 53.1% | 66.7% | well under |
| Magma Salamander | rare | 1 / 1 | 4/7 | 7/11 | 39.27 | 40.7% | 66.2% | well under |
| Magma Wraith | uncommon | 1 / 1 | 1/9 | 1/13 | 38.23 | 51% | 66.7% | well under |
| Malachite Golem | rare | 3 / 2 | 8/34 | 7/30 | 58.07 | 108.8% | 98.5% | over budget |
| Mallard Halberdier | rare | 1 / 1 | 4/8 | 7/13 | 40.09 | 42.4% | 69.8% | well under |
| Mangrove Monitor | common | 1 / 1 | 3/9 | 5/14 | 34.93 | 44.4% | 70.1% | well under |
| Mantis Shrimp | rare | 1 / 2 | 3/10 | 5/16 | 42.57 | 42.3% | 65.8% | well under |
| Margay | rare | 2 / 2 | 3/8 | 5/13 | 50.94 | 41.2% | 67.7% | well under |
| Marsh Gas Toad | common | 1 / 1 | 2/11 | 2/13 | 34.1 | 59.2% | 65.1% | well under |
| Marsh Harrier | uncommon | 1 / 1 | 3/6 | 4/7 | 35.13 | 54.3% | 67.1% | well under |
| Marsh Wisp | common | 1 / 0 | 2/4 | 5/10 | 29.76 | 26.9% | 67.2% | well under |
| Marshal of Rivergate | epic | 2 / 2 | 8/26 | 6/21 | 52.39 | 116.6% | 99.4% | over budget |
| Marula Elephant | uncommon | 2 / 2 | 4/8 | 8/17 | 50.12 | 31.9% | 65.8% | well under |
| Marula Monkey | common | 0 / 1 | 3/5 | 5/8 | 29.24 | 43.2% | 67.1% | well under |
| Mayfly Dancer | common | 0 / 0 | 3/5 | 4/7 | 22.22 | 49.5% | 67.5% | well under |
| Meadow Frog | common | 0 / 0 | 3/3 | 5/5 | 22.01 | 40.9% | 68.2% | well under |
| Meadow Rabbit | starter | 0 / 0 | 2/1 | 6/3 | 20.77 | 24.1% | 72.2% | well under |
| Meerkat Sentry | common | 1 / 1 | 2/7 | 3/11 | 36.79 | 51% | 67.3% | well under |
| Meerkat Wayfarer | uncommon | 1 / 0 | 2/5 | 4/9 | 29.55 | 41.2% | 68.2% | well under |
| Minnow Skitter | common | 0 / 0 | 2/5 | 3/6 | 22.22 | 53.1% | 66.6% | well under |
| Mire Witch-Heron | common | 1 / 1 | 2/8 | 2/10 | 34.31 | 56.8% | 65.6% | well under |
| Mirrorhide Mutant | rare | 2 / 0 | 3/6 | 6/12 | 38.34 | 33.9% | 65.2% | well under |
| Monarch Wingblade | rare | 1 / 1 | 2/6 | 3/8 | 36.58 | 55.9% | 72.3% | well under |
| Mongoose Duelist | uncommon | 1 / 1 | 4/7 | 7/11 | 36.99 | 40.6% | 67.6% | well under |
| Monitor Rambler | uncommon | 2 / 1 | 2/16 | 2/19 | 44.74 | 59.2% | 65.9% | well under |
| Moon Jelly | common | 1 / 0 | 1/7 | 2/11 | 28.52 | 52.3% | 73.4% | well under |
| Mosquito Cloud | common | 0 / 0 | 1/4 | 1/6 | 22.84 | 57.1% | 70.3% | well under |
| Mosswing | starter | 0 / 0 | 0/4 | 0/10 | 20.77 | 28.9% | 72.2% | well under |
| Mountain Goat Climber | uncommon | 0 / 0 | 1/7 | 1/9 | 23.46 | 57.5% | 70.3% | well under |
| Mountain Hare | common | 0 / 0 | 2/3 | 3/5 | 24.08 | 43.6% | 68.5% | well under |
| Mouse Sapper | common | 1 / 1 | 3/9 | 5/14 | 35.55 | 42.2% | 67.5% | well under |
| Mudflat Godwit | uncommon | 1 / 1 | 4/7 | 5/10 | 35.96 | 52.3% | 66.2% | well under |
| Mudpuppy | common | 1 / 0 | 2/6 | 3/8 | 29.55 | 53.8% | 67.3% | well under |
| Muntjac Barker | uncommon | 1 / 1 | 3/8 | 4/12 | 35.13 | 49.5% | 66.6% | well under |
| Musk Ox Calf | uncommon | 1 / 1 | 3/12 | 4/14 | 35.13 | 59% | 70.4% | well under |
| Muskrat Lodgekeeper | uncommon | 2 / 1 | 3/14 | 4/16 | 42.68 | 55.7% | 65.1% | well under |
| Narwhal Lancer | common | 1 / 2 | 7/20 | 7/19 | 39.47 | 102.4% | 99.9% | over budget |
| Nautilus Drifter | rare | 3 / 1 | 3/24 | 3/28 | 53.53 | 58.8% | 66.3% | well under |
| Nectar Sipper | common | 0 / 0 | 2/2 | 3/3 | 22.84 | 59.8% | 79.5% | well under |
| Net Thrower | uncommon | 1 / 1 | 4/7 | 6/10 | 35.13 | 45.5% | 65.5% | well under |
| Newt Doctor | uncommon | 1 / 0 | 1/6 | 2/10 | 29.97 | 45.5% | 65.5% | well under |
| Nightjar Drifter | common | 0 / 1 | 4/5 | 5/7 | 27.8 | 54% | 68.3% | well under |
| Oilbird | uncommon | 1 / 1 | 4/8 | 6/12 | 35.75 | 44.8% | 67.1% | well under |
| Open-Ocean Hermit Crab | common | 0 / 0 | 1/4 | 2/6 | 22.84 | 54.9% | 72.4% | well under |
| Optio of the Ford | rare | 1 / 1 | 4/12 | 5/14 | 36.17 | 58.1% | 69.1% | well under |
| Orca Vanguard | common | 3 / 3 | 9/36 | 8/32 | 63.24 | 108.1% | 98.6% | over budget |
| Ossuary Lammergeier | veryrare | 1 / 1 | 3/6 | 4/7 | 40.3 | 55% | 66.2% | well under |
| Otter Angler | common | 1 / 0 | 1/11 | 1/14 | 29.55 | 56.8% | 67% | well under |
| Otter Centurion | rare | 1 / 0 | 3/5 | 5/9 | 30.59 | 39.2% | 65.4% | well under |
| Otter Ferryman | common | 1 / 0 | 3/5 | 5/8 | 29.55 | 46.7% | 70.4% | well under |
| Otter Flag Bearer | uncommon | 1 / 0 | 2/6 | 4/11 | 30.59 | 39.8% | 69.2% | well under |
| Otter Guard | uncommon | 1 / 1 | 3/6 | 5/11 | 34.1 | 41.1% | 67.4% | well under |
| Otter Kit | starter | 0 / 0 | 1/3 | 3/8 | 20.77 | 24.1% | 67.4% | well under |
| Otter Lantern Bearer | uncommon | 1 / 0 | 3/6 | 5/10 | 30.59 | 39.2% | 65.4% | well under |
| Otter Netmender | common | 0 / 0 | 2/4 | 3/7 | 22.84 | 47% | 68.9% | well under |
| Otter Paddler | starter | 0 / 0 | 2/4 | 4/7 | 20.77 | 38.5% | 72.2% | well under |
| Otter Scout | rare | 0 / 0 | 2/6 | 3/10 | 24.9 | 42.2% | 66.3% | well under |
| Otter Shieldback | uncommon | 2 / 1 | 3/14 | 4/20 | 42.88 | 47.8% | 66.5% | well under |
| Owl Fletcher | rare | 1 / 0 | 1/3 | 2/7 | 31.62 | 41.2% | 69.6% | well under |
| Owl Nightwatch | common | 1 / 1 | 1/4 | 2/7 | 33.07 | 43.9% | 66.6% | well under |
| Oystercatcher | common | 1 / 1 | 3/6 | 4/7 | 34.1 | 52.8% | 66% | well under |
| Pack Mule | common | 0 / 0 | 1/11 | 1/15 | 25.94 | 52% | 67.5% | well under |
| Pack Rat Looter | common | 0 / 1 | 2/10 | 3/13 | 28.83 | 53.3% | 70.7% | well under |
| Paper Wasp | common | 0 / 0 | 2/7 | 3/9 | 22.01 | 54.5% | 72.7% | well under |
| Parish Sergeant | uncommon | 1 / 1 | 3/7 | 5/12 | 35.13 | 39.9% | 65.5% | well under |
| Parrotfish | common | 1 / 0 | 2/7 | 3/11 | 29.55 | 46.7% | 67% | well under |
| Petal Fletcher | common | 0 / 0 | 1/1 | 3/3 | 22.84 | 26.3% | 65.7% | well under |
| Pigeon Peon | common | 0 / 0 | 2/3 | 3/4 | 22.01 | 47.7% | 68.2% | well under |
| Pika Hoarder | common | 0 / 0 | 3/7 | 4/9 | 26.14 | 49.7% | 65% | well under |
| Pike Lancer | rare | 1 / 0 | 3/6 | 5/9 | 31 | 47.7% | 70.3% | well under |
| Pill Bug | uncommon | 0 / 0 | 2/4 | 3/7 | 23.04 | 46.6% | 68.3% | well under |
| Pincushion Urchin | common | 1 / 0 | 1/6 | 2/11 | 28.93 | 44.2% | 68.4% | well under |
| Pinecone Sapper | common | 1 / 0 | 0/7 | 0/16 | 31.83 | 38.3% | 66.6% | well under |
| Piranha Shoal | uncommon | 0 / 1 | 4/6 | 6/8 | 29.24 | 47.9% | 68.4% | well under |
| Pit Glutton | rare | 1 / 1 | 3/9 | 5/15 | 39.06 | 41% | 66.6% | well under |
| Planarian Splitter | uncommon | 1 / 1 | 3/10 | 4/15 | 35.55 | 47.8% | 67.5% | well under |
| Poison Dart Frog | common | 0 / 1 | 1/6 | 1/8 | 29.24 | 59.5% | 66.3% | well under |
| Pond Duck | starter | 0 / 0 | 2/3 | 4/6 | 20.77 | 33.7% | 67.4% | well under |
| Pond Paddler | rare | 0 / 0 | 2/3 | 3/5 | 24.28 | 43.2% | 68% | well under |
| Pond Trout | starter | 0 / 0 | 2/3 | 4/6 | 20.77 | 33.7% | 67.4% | well under |
| Porcupine Roller | common | 0 / 0 | 1/6 | 2/9 | 22.84 | 43.8% | 65.7% | well under |
| Pronghorn Racer | common | 0 / 1 | 3/5 | 5/8 | 29.45 | 50.6% | 74.4% | well under |
| Puddle Changeling | common | 0 / 0 | 2/3 | 4/6 | 22.84 | 35% | 65.7% | well under |
| Puddle Hopper | common | 0 / 0 | 2/6 | 3/8 | 22.01 | 58.1% | 76.3% | well under |
| Puddle Skimmer | uncommon | 1 / 0 | 3/6 | 5/9 | 30.59 | 45.8% | 68.6% | well under |
| Puffball Bombardier | uncommon | 1 / 0 | 1/5 | 2/12 | 30.59 | 36.4% | 65.8% | well under |
| Pufferfish Bulwark | common | 2 / 1 | 1/20 | 1/23 | 42.68 | 59.3% | 66.3% | well under |
| Puppeteer Imp | rare | 1 / 0 | 2/6 | 4/11 | 34.51 | 46.4% | 72.4% | well under |
| Pyroclast Wyrm | common | 2 / 3 | 7/16 | 8/19 | 56.52 | 56.6% | 65.5% | well under |
| Quill Volley | rare | 0 / 1 | 2/10 | 2/12 | 32.34 | 59.7% | 65.9% | well under |
| Quill-Thorn Boar | rare | 1 / 1 | 1/14 | 1/20 | 37.61 | 50.5% | 66.5% | well under |
| Rabbit Kit | common | 0 / 0 | 2/1 | 4/2 | 21.8 | 34.4% | 68.8% | well under |
| Rabid Jackal | uncommon | 0 / 0 | 2/3 | 3/5 | 26.56 | 53.6% | 68.6% | well under |
| Raccoon Bandit | rare | 1 / 0 | 4/6 | 6/8 | 33.69 | 51% | 68.8% | well under |
| Raven Harbinger | common | 2 / 2 | 5/18 | 4/16 | 46.19 | 112.9% | 99.9% | over budget |
| Raven Scout | rare | 0 / 0 | 1/3 | 2/5 | 25.11 | 58.5% | 82.4% | well under |
| Ravenous Wolverine | rare | 0 / 1 | 1/12 | 1/9 | 31.93 | 106.4% | 97% | over budget |
| Red Dragon | legendary | 5 / 4 | 10/44 | 9/39 | 97.13 | 110.5% | 99.7% | over budget |
| Red-backed Salamander | common | 1 / 0 | 1/6 | 2/10 | 29.55 | 48.1% | 68.4% | well under |
| Red-billed Chough | common | 1 / 0 | 2/4 | 3/6 | 29.55 | 45.7% | 66% | well under |
| Reef Manta Glider | common | 1 / 2 | 4/15 | 3/13 | 39.27 | 114.2% | 98.9% | over budget |
| Rimefire Salamander | rare | 1 / 1 | 2/7 | 4/16 | 39.68 | 32.8% | 65.5% | well under |
| River Carp | starter | 1 / 0 | 3/5 | 5/8 | 27.49 | 40% | 65.5% | well under |
| Riverbed Diver | uncommon | 1 / 1 | 3/8 | 4/9 | 35.13 | 59.8% | 72.6% | well under |
| Rivergate Recruit | common | 1 / 0 | 2/9 | 3/14 | 29.55 | 44% | 67.7% | well under |
| Riverside Peddler | common | 0 / 0 | 2/5 | 3/9 | 22.84 | 41.6% | 67.9% | well under |
| Riverstone Slinger | uncommon | 1 / 0 | 3/6 | 5/9 | 30.59 | 42.5% | 65.4% | well under |
| Riverwing Envoy | uncommon | 0 / 0 | 2/4 | 4/7 | 22.84 | 35% | 65.7% | well under |
| Roadrunner Courier | common | 0 / 1 | 3/5 | 5/9 | 30.07 | 39.9% | 66.5% | well under |
| Robin Redbreast | uncommon | 0 / 0 | 1/3 | 2/5 | 23.04 | 54.9% | 80.9% | well under |
| Royal Guard | veryrare | 1 / 1 | 4/6 | 6/9 | 37.2 | 47.7% | 66.5% | well under |
| Ruby-Throat Duelist | rare | 1 / 0 | 1/6 | 1/4 | 31.62 | 110.7% | 96.4% | over budget |
| Salamander Pyromancer | epic | 3 / 1 | 4/12 | 6/17 | 54.77 | 51.1% | 67.6% | well under |
| Sawfish | uncommon | 1 / 1 | 4/8 | 6/11 | 36.17 | 48.3% | 67.7% | well under |
| Scree Goat | uncommon | 2 / 1 | 4/14 | 5/16 | 45.78 | 56.8% | 65.5% | well under |
| Sea Hare | common | 1 / 0 | 2/8 | 3/10 | 29.55 | 57.5% | 71% | well under |
| Seed-cache Squirrel | common | 0 / 1 | 3/5 | 5/8 | 28.83 | 49.2% | 73.5% | well under |
| Sergeant Bramblefox | heroic | 0 / 1 | 4/8 | 6/11 | 32.55 | 49.2% | 70.7% | well under |
| Shallows Fry | common | 0 / 0 | 3/2 | 5/3 | 22.22 | 48.6% | 71.1% | well under |
| Sheep | starter | 0 / 0 | 1/5 | 2/10 | 20.77 | 33.7% | 67.4% | well under |
| Shell-Cracker | common | 0 / 0 | 2/5 | 3/9 | 22.84 | 39.4% | 65.7% | well under |
| Shellwright Apprentice | common | 1 / 0 | 2/6 | 4/11 | 29.55 | 42.9% | 73.4% | well under |
| Shepherd | common | 1 / 1 | 2/12 | 3/15 | 33.07 | 51.4% | 66.5% | well under |
| Shieldbearer Hound | rare | 2 / 2 | 2/5 | 7/19 | 49.29 | 18.3% | 67% | well under |
| Shrine Acolyte | common | 1 / 0 | 2/8 | 4/14 | 32.65 | 39.8% | 70.4% | well under |
| Shrine Bell-Ringer | common | 1 / 1 | 3/12 | 3/14 | 37.2 | 59.8% | 65.1% | well under |
| Signal Crayfish | common | 1 / 1 | 2/12 | 3/15 | 34.1 | 55% | 69.6% | well under |
| Silver Minnow | starter | 0 / 0 | 1/2 | 4/7 | 20.77 | 19.3% | 72.2% | well under |
| Skunk Gasser | uncommon | 1 / 1 | 3/7 | 5/12 | 36.58 | 41% | 65.6% | well under |
| Slow Loris | common | 0 / 0 | 3/7 | 4/9 | 24.7 | 52.6% | 68.8% | well under |
| Slow-worm | common | 1 / 0 | 2/5 | 3/8 | 29.55 | 48.6% | 65.5% | well under |
| Slowpoke Sentinel | common | 1 / 0 | 1/8 | 2/12 | 31.41 | 49.3% | 68.4% | well under |
| Smokescreen Raccoon | uncommon | 1 / 1 | 4/7 | 6/10 | 35.13 | 49% | 68.9% | well under |
| Snail Mail | uncommon | 2 / 0 | 0/8 | 0/14 | 39.99 | 52.5% | 67.5% | well under |
| Snow Bunting Archer | uncommon | 1 / 1 | 3/6 | 6/11 | 37.61 | 37.2% | 66.5% | well under |
| Snow Ermine | common | 0 / 0 | 2/3 | 3/5 | 25.32 | 41.5% | 65.2% | well under |
| Snow Leopard | rare | 1 / 1 | 4/8 | 6/11 | 35.13 | 48.4% | 68.3% | well under |
| Snowshoe Hare | common | 0 / 0 | 1/6 | 1/8 | 22.84 | 52.5% | 65.7% | well under |
| Soldier Ant | uncommon | 1 / 0 | 3/5 | 6/9 | 29.55 | 37.2% | 71.1% | well under |
| Sparrow Chick | starter | 0 / 0 | 1/2 | 2/3 | 20.77 | 48.4% | 70.1% | well under |
| Sperm Whale Elder | epic | 3 / 1 | 5/11 | 8/19 | 54.77 | 40.2% | 65.7% | well under |
| Spitting Cobra | rare | 2 / 1 | 4/7 | 8/13 | 45.78 | 37.1% | 67.7% | well under |
| Spitting Spider | uncommon | 1 / 1 | 3/8 | 5/13 | 37.61 | 42.5% | 66.5% | well under |
| Springbok Pronker | common | 0 / 1 | 4/5 | 6/8 | 29.24 | 44.5% | 68.4% | well under |
| Squire's Mount | rare | 1 / 1 | 3/12 | 4/17 | 38.23 | 48.4% | 66.7% | well under |
| Stable Colt | uncommon | 0 / 0 | 2/8 | 3/11 | 25.94 | 46.3% | 65.5% | well under |
| Stag Beetle | rare | 2 / 1 | 4/10 | 5/11 | 43.09 | 58.7% | 65.6% | well under |
| Star-nosed Mole | common | 0 / 0 | 4/4 | 5/5 | 22.84 | 52.5% | 65.7% | well under |
| Starfall Owl | legendary | 4 / 4 | 5/12 | 11/25 | 86.28 | 38.2% | 67.2% | well under |
| Stoat Cutthroat | rare | 1 / 1 | 3/9 | 5/14 | 38.23 | 48.6% | 72.1% | well under |
| Stone Turtle Warden | common | 2 / 2 | 4/30 | 3/26 | 47.02 | 110.1% | 97.3% | over budget |
| Stonedrop Vulture | uncommon | 1 / 1 | 3/6 | 4/7 | 37.82 | 57.8% | 69.7% | well under |
| Storm Heron | rare | 1 / 0 | 3/7 | 5/11 | 32.86 | 45.6% | 70% | well under |
| Strangler Vine | rare | 2 / 1 | 3/14 | 4/20 | 45.78 | 48.1% | 65.5% | well under |
| Subterraneaner | uncommon | 1 / 1 | 8/10 | 7/9 | 35.75 | 107.5% | 99.1% | over budget |
| Sulfur Vent Crab | uncommon | 1 / 0 | 1/7 | 2/11 | 29.97 | 46% | 66% | well under |
| Sunbittern Strider | uncommon | 1 / 1 | 3/7 | 5/11 | 35.96 | 48.5% | 70.7% | well under |
| Sunfeather Scout | common | 1 / 0 | 1/5 | 2/8 | 29.55 | 40.6% | 66% | well under |
| Sunspire Choirmother | veryrare | 2 / 1 | 2/6 | 3/10 | 44.95 | 48% | 68% | well under |
| Sunspire Envoy | rare | 1 / 1 | 3/6 | 4/8 | 36.17 | 49.8% | 66.4% | well under |
| Sunthroat Courier | uncommon | 1 / 0 | 2/3 | 4/5 | 29.55 | 35.5% | 66% | well under |
| Supernova Jelly | rare | 1 / 1 | 3/8 | 5/12 | 35.13 | 45.5% | 68.3% | well under |
| Swarm Matriarch | rare | 1 / 1 | 1/7 | 2/11 | 36.58 | 50.1% | 74.7% | well under |
| Swordfish Spearman | rare | 2 / 1 | 4/9 | 7/15 | 44.95 | 40% | 66.7% | well under |
| Sworn Shieldbearer | uncommon | 1 / 1 | 3/13 | 4/15 | 35.13 | 54.1% | 65.5% | well under |
| Talon Archer | rare | 1 / 1 | 1/5 | 2/8 | 38.23 | 48.8% | 68.4% | well under |
| Tarantula Hawk | uncommon | 1 / 1 | 4/8 | 6/13 | 37.82 | 42.3% | 66.1% | well under |
| Tardigrade | rare | 1 / 1 | 4/8 | 6/11 | 35.13 | 48.4% | 68.3% | well under |
| Tasmanian Devil | uncommon | 1 / 1 | 3/8 | 4/11 | 36.79 | 51.7% | 65.3% | well under |
| Tax-Collector Teal | uncommon | 0 / 0 | 1/3 | 3/8 | 27.8 | 32.4% | 80.9% | well under |
| Teatime Toad | uncommon | 1 / 0 | 1/10 | 1/13 | 32.24 | 56.5% | 65.8% | well under |
| Terrier Pup | uncommon | 0 / 0 | 2/6 | 3/10 | 23.87 | 41.9% | 67% | well under |
| Testudo Tortoise | rare | 2 / 2 | 2/14 | 3/19 | 53.01 | 53.2% | 66.4% | well under |
| The Magnate Duck | legendary | 4 / 4 | 6/59 | 6/56 | 86.28 | 103.2% | 99.7% | over budget |
| The Thistle Baron | heroic | 2 / 1 | 3/18 | 4/21 | 47.22 | 55.1% | 65.7% | well under |
| The Unremembered | rare | 1 / 1 | 3/6 | 6/12 | 36.37 | 33% | 66% | well under |
| Thornvine Lasher | rare | 1 / 0 | 3/7 | 5/12 | 33.07 | 39.3% | 66.5% | well under |
| Thorny Devil | common | 2 / 1 | 2/14 | 3/18 | 44.54 | 57.8% | 71.3% | well under |
| Thunder Lizard | epic | 3 / 3 | 5/11 | 9/19 | 66.34 | 43% | 67.1% | well under |
| Tide Spirit | rare | 1 / 0 | 4/5 | 6/7 | 32.45 | 48.7% | 67.1% | well under |
| Tidepool Trapper Crab | common | 0 / 0 | 1/9 | 1/12 | 22.22 | 54% | 67.5% | well under |
| Timber Wolf Pack Leader | common | 1 / 1 | 3/14 | 4/16 | 34.1 | 58.7% | 70.4% | well under |
| Tiny Cave Dweller | uncommon | 0 / 0 | 2/4 | 3/5 | 23.66 | 58.8% | 71.5% | well under |
| Tithe Collector | uncommon | 1 / 0 | 5/8 | 6/10 | 33.48 | 53.8% | 65.7% | well under |
| Toucan Courier | common | 0 / 0 | 1/4 | 2/9 | 24.7 | 40.2% | 68.5% | well under |
| Trapdoor Spider | rare | 1 / 0 | 4/5 | 6/7 | 32.03 | 50.4% | 69.1% | well under |
| Trash Panda Trickster | common | 0 / 0 | 3/3 | 4/4 | 22.84 | 53.3% | 66.5% | well under |
| Trebuchet Crew | rare | 3 / 2 | 0/24 | 0/39 | 61.79 | 42.1% | 66.4% | well under |
| Trickster Fox | common | 0 / 1 | 3/7 | 5/11 | 29.66 | 43.8% | 70.8% | well under |
| Truffle Piglet | uncommon | 1 / 1 | 2/8 | 4/15 | 35.55 | 36.6% | 67.5% | well under |
| Tunnel Ant | rare | 1 / 1 | 5/7 | 7/9 | 35.13 | 48.4% | 65.5% | well under |
| Tunnel Wyrm | uncommon | 2 / 1 | 3/16 | 4/20 | 43.3 | 52% | 65.8% | well under |
| Tusked Vanguard | rare | 0 / 0 | 2/7 | 3/12 | 26.56 | 41.4% | 67.8% | well under |
| Two-Headed Calf | rare | 1 / 1 | 3/10 | 4/12 | 37.82 | 55.9% | 66.5% | well under |
| Upside-Down Bat | uncommon | 0 / 0 | 1/2 | 2/4 | 25.52 | 43.7% | 67.2% | well under |
| Vampire Bat | uncommon | 1 / 0 | 2/4 | 3/5 | 31 | 56.5% | 71% | well under |
| Vampire Finch | uncommon | 1 / 1 | 5/7 | 8/12 | 38.03 | 38.5% | 67.4% | well under |
| Vampire Roost | common | 3 / 2 | 5/18 | 6/21 | 56.63 | 56.8% | 65.7% | well under |
| Velvet Worm | uncommon | 1 / 1 | 3/8 | 5/13 | 36.99 | 43.3% | 67.6% | well under |
| Village Miller | common | 0 / 0 | 2/4 | 4/7 | 22.84 | 37.2% | 67.9% | well under |
| Voidfeather Scout | uncommon | 1 / 0 | 2/4 | 3/5 | 29.55 | 55.8% | 71% | well under |
| Walrus Icebreaker | veryrare | 2 / 1 | 4/13 | 5/17 | 47.43 | 54% | 66.7% | well under |
| Wandering Mage | rare | 3 / 0 | 5/8 | 7/12 | 47.12 | 49.1% | 66% | well under |
| Wandering Traveller | rare | 0 / 0 | 3/3 | 6/6 | 23.87 | 37.7% | 75.4% | well under |
| War Elephant | superrare | 3 / 3 | 2/22 | 3/30 | 70.06 | 52.1% | 66.3% | well under |
| War Hound | rare | 1 / 1 | 3/12 | 4/16 | 36.17 | 51.1% | 67.7% | well under |
| War Panther | common | 3 / 2 | 7/20 | 8/22 | 57.66 | 59.8% | 66.8% | well under |
| Warren Scout | rare | 0 / 0 | 3/4 | 6/7 | 26.35 | 38% | 72.1% | well under |
| Weathervane Swift | rare | 1 / 1 | 4/9 | 6/14 | 39.68 | 42.8% | 65.5% | well under |
| Weaver Bird | common | 0 / 1 | 3/5 | 5/9 | 29.24 | 41% | 68.4% | well under |
| Werebadger | rare | 2 / 2 | 5/13 | 8/20 | 53.01 | 45.3% | 69.8% | well under |
| Weredog | rare | 1 / 1 | 4/7 | 5/10 | 36.17 | 52.3% | 66.1% | well under |
| Whip Spider | uncommon | 1 / 1 | 4/9 | 5/11 | 35.75 | 55.1% | 66.3% | well under |
| White Dragon | legendary | 5 / 4 | 10/44 | 8/37 | 97.13 | 115.6% | 98.6% | over budget |
| Wolf Pack Runner | rare | 1 / 1 | 4/9 | 6/13 | 38.44 | 45.5% | 66.3% | well under |
| Woodcock Lookout | common | 1 / 0 | 2/7 | 4/12 | 29.55 | 40.6% | 71.1% | well under |
| Woodland Brawler | rare | 1 / 1 | 3/12 | 4/18 | 39.27 | 47.1% | 67.5% | well under |
| Woodland Caribou | uncommon | 1 / 1 | 4/9 | 6/12 | 37.41 | 48.1% | 66.8% | well under |
| Woodpecker Sapper | uncommon | 1 / 1 | 3/7 | 4/9 | 36.79 | 55.6% | 66.4% | well under |
| Wrong-Way Salmon | uncommon | 0 / 0 | 1/3 | 2/7 | 25.52 | 44.6% | 68.1% | well under |

## Owner calls

| Card | Stats | N | Why |
|---|---|---|---|
| The Caldera Wyrm | 6/36 | 36.79 | fitting it needs 2/13 (×0.37): its 0 Lumber / Wait 1 at legendary (N 36.79) is too little for its skills (S 19.03); a cost change, not a stat cut |
