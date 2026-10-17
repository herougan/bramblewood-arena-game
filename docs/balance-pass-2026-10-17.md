# Balance pass, 2026-10-17

A rough one-pass balance of every real card after today's reworks (stat budget v3, stronger Cleave, the fork family as one swing, Crab Claws, Stun 1-in-3, Expose counters, the Ambush / Bloodlust / Reflect reworks, the Wet rule and Chain Lightning).

**How it was measured.** The same test as `tools/card_balance.js`: each card at Level 1, 8 copies (6 / 4 / 3 if it costs 1 / 2 / 3+ Lumber) in a deck of the reference filler, against 20 filler cards, 40 games per measurement with the tool's fixed seeds, so every variant of a card plays the same 40 fights. Bands per rarity as in the tool (Common 35–60%, Uncommon 45–68%, Rare 52–75%, Very Rare 56–80%, Super Rare 60–84%, Epic 62–87%, Heroic 64–89%, Legendary 70–97%). 40 games is still noisy (about ±8 points on one card), so read single numbers as "which way and roughly how far".

**What moved.** (1) Cards over stat budget v3 were brought under it with the Test Lab's Fit values (lower Attack, then Health). (2) Cards more than 8 points outside their band were moved **half-way toward the band**: a ladder of small changes (Attack ±1 / ±2, Health ±15% / ±30%, then finer Health steps) was simulated and the one landing nearest the half-way point kept, as long as it improved the card by at least 5 points and did not overshoot past the band's other side. Every buff stays within budget v3. Skills are untouched; only Attack, Health and, for three rework cards, Lumber changed. Each changed card's creatorNote says what changed and why.

**Result:** 173 cards changed (9 budget, 151 win-rate, 13 rework). Cards in band (all 627 the tool measures, skipped kinds included): **157 → 233**.

## 1. Stat budget v3

| Card | Rarity | Lumber/Wait | Was | Now | Win rate before → after |
|---|---|---|---|---|---|
| Great Horned Owl | Common | 2/3 | 7/22 | 6/21 | 35% → 32.5% |
| Eyrie Warden | Common | 3/3 | 9/28 | 7/24 | 32.5% → 32.5% |
| Raven Harbinger | Common | 2/2 | 5/20 | 5/19 | 32.5% → 32.5% |
| Reef Manta Glider | Common | 2/1 | 5/16 | 4/15 | 32.5% → 27.5% |
| Humpback Elder | Common | 3/3 | 8/40 | 8/39 | 32.5% → 32.5% |
| Kraken Spawnling | Common | 3/2 | 9/34 | 9/31 | 32.5% → 32.5% |
| Grindstone Boar | Common | 1/1 | 7/20 | 6/19 | 65% → 52.5% |
| Irradiated Couatl | Epic | 2/3 | 9/26 | 8/24 | 22.5% → 22.5% |
| Cathedral Eagle | Legendary | 0/1 | 5/14 | 4/14 | 10% → 10% |

**Left over budget on purpose (listed, not changed):**
- The five Legendary dragons (Red, White, Blue, Green, Black; 10/44 or 10/50 at 4 Lumber / Wait 5): enemy-only, over budget by design.
- The Caldera Wyrm (Legendary world boss, 6/36): enemy-only boss.
- Great Gate (0/45, Armor 3, Guardian): the enemy-only gate the player breaks in 23-7 and 24-1 (its creatorNote). Fit would make it 0/28; left for you, since it changes those two fights.
- MissingNo. (Unique, 3/33 Evasive): the secret card #0, unobtainable and in no deck.
- The Sixfold (Epic 8/20, 0 Lumber, Ritual 6/6/6): the budget has no term for its Ritual, which keeps it from acting until 6 units perished, 6 cards drawn and 6 castle damage. Fit (5/16) or 6/14 drops it from 37.5% to about 12%, far below its band (62–87%), and 2 Lumber at 8/19 to 23%. Left at 8/20; a Ritual discount in the skill-cost table (an editor change) would settle it.

After the pass every card that is not a test card passes budget v3 except these nine.

## 2. Cards hit by today's reworks

| Card | Rarity | Lumber/Wait | Was | Now | Win rate before → after | Band | Why |
|---|---|---|---|---|---|---|---|
| Sulfur Vent Crab | Uncommon | 0/1 | 1/9 | 1/8 | 85% → 77.5% | 45–68% | above its band (45-68%); Crab Claws instead of Fork |
| Fiddler Crab Swarm | Common | 0/0 | 1/3 | 2/3 | 7.5% → 27.5% | 35–60% | below its band (35-60%); Crab Claws instead of Fork |
| Voltwing Bat | Common | 0/1 | 2/4 | 1/4 | 77.5% → 55% | 35–60% | above its band (35-60%); Electricity and the Wet rule |
| Duckling Squadron | Common | 0/0 | 1/3 | 1/4 | 25% → 55% | 35–60% | below its band (35-60%); Fork is now one swing along two lines |
| Cave Bat Swarm | Rare | 0/0 | 2/3 | 2/2 | 97.5% → 75% | 52–75% | above its band (52-75%); Fork is now one swing along two lines |
| Mirror Moth | Rare | 1/1 | 2/6 | 3/6 | 42.5% → 65% | 52–75% | below its band (52-75%); Reflect rework |
| Beetle Battering-Ram | Rare | 1/2 | 5/20 | 4/14 | 95% → 82.5% | 52–75% | above its band (52-75%); Cleave 1 -> 3 today |
| Subterraneaner | Uncommon | 1/1 | 5/8 | 7/10 | 7.5% → 20% | 45–68% | below its band (45-68%); Ambush rework |
| Piranha Shoal | Uncommon | 1/0 | 3/6 | 4/6 | 32.5% → 55% | 45–68% | below its band (45-68%); Bloodlust rework |
| Voltaic Eel | Rare | 3/0 | 3/10, 3 Lumber | 3/10, 2 Lumber | 30% → 42.5% | 52–75% | below its band (52-75%); Chain Lightning and the Wet rule; 3 Lumber at Wait 0 kept it out of most fights |
| Swordfish Spearman | Rare | 2/2 | 4/9, 2 Lumber | 4/9, 1 Lumber | 27.5% → 50% | 52–75% | below its band (52-75%); Trident is now one swing, half damage to the sides |
| Caldera Snow Leopard | Super Rare | 2/1 | 4/7, 2 Lumber | 4/7, 1 Lumber | 25% → 77.5% | 60–84% | below its band (60-84%); Ambush and Bloodlust reworks |
| Snow Owl Sentinel | Super Rare | 1/1 | 3/10 | 3/9 | 87.5% → 77.5% | 60–84% | above its band (60-84%); Expose counters |

Also checked and left: Two-Headed Calf (Fork, 60%, in band), Brimstone Hound (Pitchfork, 70%, 2 over), Open-Ocean Hermit Crab (Crab Claws, 45%), Boar Rampager (Cleave 3, 82.5%), Cinder Hornet (Stun, 35%), Static Bat and Arc Bat (Electricity, in band), Sea Cucumber (52.5%). The Cleave cards that cost 2+ Lumber (all but Beetle Battering-Ram and Boar Rampager) and the 2+ Lumber Fork cards sit at 27–35% whatever their stats (see section 4). Narwhal Lancer (Expose 2, 27.5%): 1 Lumber shoots it to 80–97%, so it is left for a skill-level look.

## 3a. Too strong: toned down (65)

| Card | Rarity | Lumber/Wait | Was | Now | Win rate before → after | Band | Why |
|---|---|---|---|---|---|---|---|
| Adder Ambusher | Rare | 1/1 | 4/10 | 3/10 | 95% → 70% | 52–75% | above its band (52-75%) |
| Alley Cat | Rare | 0/0 | 3/4 | 2/2 | 100% → 80% | 52–75% | above its band (52-75%): Twin Strike doubles every point of Attack |
| Badger Berserker | Rare | 1/1 | 6/14 | 5/14 | 97.5% → 90% | 52–75% | above its band (52-75%) |
| Battlement Heron | Rare | 1/1 | 3/7 | 3/6 | 97.5% → 90% | 52–75% | above its band (52-75%) |
| Carrion Fly Swarm | Rare | 0/1 | 3/5 | 2/3 | 97.5% → 85% | 52–75% | above its band (52-75%) |
| Caustic Scorpion | Uncommon | 1/2 | 5/13 | 3/13 | 77.5% → 70% | 45–68% | above its band (45-68%) |
| Cave Centipede | Common | 0/1 | 3/6 | 2/6 | 82.5% → 45% | 35–60% | above its band (35-60%) |
| Cave Flitter | Uncommon | 0/0 | 3/3 | 2/3 | 87.5% → 55% | 45–68% | above its band (45-68%) |
| Cinder Skeleton | Common | 1/0 | 4/5 | 3/5 | 75% → 45% | 35–60% | above its band (35-60%) |
| Clover Butterfly | Common | 0/0 | 1/4 | 1/3 | 90% → 40% | 35–60% | above its band (35-60%) |
| Cunning Vixen | Uncommon | 1/1 | 3/8 | 2/8 | 80% → 70% | 45–68% | above its band (45-68%) |
| Dust Hyena | Uncommon | 0/0 | 2/8 | 2/6 | 87.5% → 75% | 45–68% | above its band (45-68%) |
| Eagle Diver | Rare | 1/1 | 3/6 | 3/5 | 95% → 90% | 52–75% | above its band (52-75%) |
| Eagle-Owl Quartermaster | Rare | 1/1 | 2/8 | 1/8 | 97.5% → 90% | 52–75% | above its band (52-75%) |
| Echo Screecher | Rare | 1/1 | 4/6 | 3/6 | 90% → 62.5% | 52–75% | above its band (52-75%) |
| Ent | Rare | 0/3 | 3/20 | 2/20 | 95% → 70% | 52–75% | above its band (52-75%) |
| Field Crow | Common | 0/0 | 2/4 | 2/3 | 87.5% → 52.5% | 35–60% | above its band (35-60%) |
| Firetail Trickster | Rare | 1/0 | 3/9 | 2/9 | 87.5% → 55% | 52–75% | above its band (52-75%) |
| Fox Kit | Uncommon | 0/0 | 3/5 | 2/5 | 80% → 42.5% | 45–68% | above its band (45-68%) |
| Glasswing Butterfly | Rare | 1/1 | 4/7 | 3/7 | 85% → 60% | 52–75% | above its band (52-75%) |
| Grass Viper | Uncommon | 0/0 | 2/5 | 1/5 | 87.5% → 47.5% | 45–68% | above its band (45-68%) |
| Gull Thief | Common | 0/0 | 2/3 | 1/6 | 72.5% → 57.5% | 35–60% | above its band (35-60%) |
| Hanging Loafer | Common | 1/4 | 4/22 | 3/22 | 70% → 42.5% | 35–60% | above its band (35-60%) |
| Harbor Seal | Common | 1/1 | 3/11 | 2/11 | 77.5% → 37.5% | 35–60% | above its band (35-60%) |
| Honeyjoe Brewer | Uncommon | 0/0 | 1/5 | 1/4 | 100% → 95% | 45–68% | above its band (45-68%) |
| Howdah Archers | Rare | 1/1 | 3/7 | 2/7 | 85% → 67.5% | 52–75% | above its band (52-75%) |
| Howler Monkey | Uncommon | 0/0 | 2/6 | 2/4 | 92.5% → 82.5% | 45–68% | above its band (45-68%) |
| Hummingbird Needler | Uncommon | 0/0 | 1/4 | 1/3 | 77.5% → 42.5% | 45–68% | above its band (45-68%) |
| Inside-Out Hedgehog | Uncommon | 0/0 | 1/7 | 1/6 | 95% → 90% | 45–68% | above its band (45-68%) |
| Lantern Bearer | Uncommon | 0/1 | 2/6 | 2/5 | 80% → 65% | 45–68% | above its band (45-68%) |
| Lucky Hopper | Rare | 1/0 | 4/11 | 3/11 | 97.5% → 85% | 52–75% | above its band (52-75%) |
| Mallard Marauder | Rare | 1/0 | 4/10 | 3/8 | 97.5% → 90% | 52–75% | above its band (52-75%) |
| Mirrorhide Mutant | Rare | 0/2 | 4/6 | 3/6 | 97.5% → 82.5% | 52–75% | above its band (52-75%) |
| Monarch Wingblade | Rare | 1/1 | 5/9 | 3/6 | 97.5% → 82.5% | 52–75% | above its band (52-75%) |
| Mudpuppy | Common | 0/1 | 2/9 | 2/8 | 90% → 80% | 35–60% | above its band (35-60%) |
| Otter Shieldback | Uncommon | 1/2 | 4/18 | 3/18 | 80% → 65% | 45–68% | above its band (45-68%) |
| Owl Fletcher | Rare | 0/1 | 3/3 | 2/3 | 90% → 85% | 52–75% | above its band (52-75%) |
| Owl Sentinel | Common | 1/2 | 3/12 | 2/10 | 77.5% → 67.5% | 35–60% | above its band (35-60%) |
| Pike Lancer | Rare | 0/1 | 4/6 | 3/6 | 90% → 57.5% | 52–75% | above its band (52-75%) |
| Pond Paddler | Rare | 0/0 | 2/4 | 2/3 | 87.5% → 52.5% | 52–75% | above its band (52-75%) |
| Porcupine Roller | Common | 0/0 | 1/8 | 1/6 | 80% → 60% | 35–60% | above its band (35-60%) |
| Puffball Bombardier | Uncommon | 0/1 | 1/8 | 1/6 | 97.5% → 85% | 45–68% | above its band (45-68%) |
| Pufferfish Bulwark | Common | 1/2 | 2/20 | 1/20 | 72.5% → 32.5% | 35–60% | above its band (35-60%) |
| Quill Volley | Rare | 1/0 | 4/14 | 3/10 | 100% → 87.5% | 52–75% | above its band (52-75%) |
| Quillguard | Rare | 1/2 | 4/22 | 3/22 | 87.5% → 72.5% | 52–75% | above its band (52-75%) |
| Raven Scout | Rare | 0/0 | 2/3 | 1/3 | 95% → 57.5% | 52–75% | above its band (52-75%) |
| Ravenous Wolverine | Rare | 1/0 | 2/12 | 1/12 | 92.5% → 75% | 52–75% | above its band (52-75%) |
| Rimefire Salamander | Rare | 1/1 | 3/8 | 2/7 | 87.5% → 60% | 52–75% | above its band (52-75%) |
| Ruby-Throat Duelist | Rare | 0/1 | 3/3 | 2/3 | 95% → 90% | 52–75% | above its band (52-75%) |
| Slowpoke Sentinel | Common | 0/1 | 1/12 | 1/10 | 77.5% → 72.5% | 35–60% | above its band (35-60%) |
| Snow Ermine | Common | 0/0 | 2/5 | 2/3 | 80% → 60% | 35–60% | above its band (35-60%) |
| Squire's Mount | Rare | 1/1 | 4/14 | 4/12 | 85% → 77.5% | 52–75% | above its band (52-75%) |
| Stable Colt | Uncommon | 0/0 | 2/9 | 2/8 | 77.5% → 65% | 45–68% | above its band (45-68%) |
| Sunfeather Scout | Common | 0/1 | 2/5 | 1/5 | 82.5% → 37.5% | 35–60% | above its band (35-60%) |
| Swarm Matriarch | Rare | 1/1 | 2/15 | 1/13 | 95% → 87.5% | 52–75% | above its band (52-75%) |
| Talon Archer | Rare | 1/1 | 1/6 | 1/5 | 85% → 72.5% | 52–75% | above its band (52-75%) |
| Tax-Collector Teal | Uncommon | 0/0 | 2/4 | 1/4 | 100% → 90% | 45–68% | above its band (45-68%) |
| Thornvine Lasher | Rare | 0/1 | 3/9 | 3/7 | 92.5% → 82.5% | 52–75% | above its band (52-75%) |
| Thornwood Palisade | Rare | 1/1 | 4/22 | 2/19 | 90% → 82.5% | 52–75% | above its band (52-75%) |
| Tomcat | Common | 0/0 | 3/3 | 2/3 | 75% → 32.5% | 35–60% | above its band (35-60%) |
| Tunnel Wyrm | Uncommon | 1/2 | 4/16 | 3/16 | 82.5% → 65% | 45–68% | above its band (45-68%) |
| Tusked Vanguard | Rare | 0/0 | 3/7 | 2/7 | 95% → 65% | 52–75% | above its band (52-75%) |
| Vampire Bat | Uncommon | 0/1 | 3/4 | 2/4 | 95% → 72.5% | 45–68% | above its band (45-68%) |
| Wandering Mage | Rare | 0/3 | 5/12 | 5/10 | 90% → 85% | 52–75% | above its band (52-75%) |
| Woodland Brawler | Rare | 1/1 | 5/16 | 4/14 | 92.5% → 85% | 52–75% | above its band (52-75%) |

## 3b. Too weak: lifted (86)

| Card | Rarity | Lumber/Wait | Was | Now | Win rate before → after | Band | Why |
|---|---|---|---|---|---|---|---|
| Aye-aye Prowler | Common | 0/0 | 2/6 | 3/6 | 10% → 17.5% | 35–60% | below its band (35-60%) |
| Baby Bat | Common | 0/1 | 1/5 | 2/5 | 12.5% → 65% | 35–60% | below its band (35-60%) |
| Beaver Builder | Common | 0/0 | 1/8 | 1/9 | 20% → 30% | 35–60% | below its band (35-60%) |
| Bee Drone | Rare | 0/0 | 0/5 | 0/6 | 10% → 15% | 52–75% | below its band (52-75%) |
| Beetle Grunt | Common | 0/1 | 2/4 | 3/4 | 10% → 35% | 35–60% | below its band (35-60%) |
| Border Collie | Uncommon | 1/1 | 3/7 | 4/7 | 27.5% → 45% | 45–68% | below its band (45-68%) |
| Bramble Hoglet | Common | 0/0 | 1/6 | 1/8 | 20% → 25% | 35–60% | below its band (35-60%) |
| Carrion Beetle | Uncommon | 1/1 | 3/8 | 4/8 | 32.5% → 47.5% | 45–68% | below its band (45-68%) |
| Cave Olm | Common | 0/1 | 1/9 | 1/11 | 20% → 27.5% | 35–60% | below its band (35-60%) |
| Chilli Parrot | Uncommon | 1/1 | 3/8 | 4/8 | 30% → 35% | 45–68% | below its band (45-68%) |
| Chipmunk Hoarder | Common | 0/1 | 1/5 | 2/5 | 20% → 42.5% | 35–60% | below its band (35-60%) |
| Chipmunk Stockpiler | Common | 0/0 | 1/7 | 1/9 | 20% → 30% | 35–60% | below its band (35-60%) |
| Cinder Stoker | Common | 0/0 | 1/7 | 1/9 | 20% → 30% | 35–60% | below its band (35-60%) |
| Cleaner Wrasse | Uncommon | 1/1 | 3/8 | 4/8 | 30% → 67.5% | 45–68% | below its band (45-68%) |
| Conch Herald | Uncommon | 1/1 | 2/9 | 3/9 | 10% → 37.5% | 45–68% | below its band (45-68%) |
| Coral Current Eel | Rare | 1/0 | 2/5 | 2/6 | 30% → 37.5% | 52–75% | below its band (52-75%) |
| Cottonmouth Matriarch | Rare | 1/2 | 3/9 | 3/10 | 12.5% → 30% | 52–75% | below its band (52-75%) |
| Crown Pretender | Uncommon | 1/1 | 2/10 | 3/10 | 25% → 35% | 45–68% | below its band (45-68%) |
| Dolphin Knight | Rare | 0/1 | 3/3 | 4/3 | 17.5% → 37.5% | 52–75% | below its band (52-75%) |
| Dominion Nestguard | Uncommon | 1/1 | 3/4 | 4/4 | 32.5% → 55% | 45–68% | below its band (45-68%) |
| Dune Jackal | Common | 1/0 | 2/10 | 2/12 | 25% → 30% | 35–60% | below its band (35-60%) |
| Electric Ray | Uncommon | 1/1 | 3/8 | 4/8 | 36.3% → 70% | 45–68% | below its band (45-68%) |
| Ember Jackal | Rare | 1/0 | 3/8 | 3/9 | 42.5% → 52.5% | 52–75% | below its band (52-75%) |
| Ember Wisp | Rare | 0/0 | 3/3 | 4/3 | 20% → 60% | 52–75% | below its band (52-75%) |
| Fennec Fox | Uncommon | 1/1 | 2/10 | 3/10 | 5% → 22.5% | 45–68% | below its band (45-68%) |
| Field Mouse | Common | 0/0 | 1/5 | 2/5 | 7.5% → 40% | 35–60% | below its band (35-60%) |
| Fox Sharpshot | Common | 1/2 | 2/9 | 3/10 | 25% → 40% | 35–60% | below its band (35-60%) |
| Frostbitten Wolverine | Uncommon | 1/1 | 3/12 | 3/13 | 32.5% → 37.5% | 45–68% | below its band (45-68%) |
| Fruit-bat Familiar | Uncommon | 1/1 | 3/8 | 4/8 | 32.5% → 55% | 45–68% | below its band (45-68%) |
| Fumarole Ibex | Rare | 1/1 | 3/8 | 4/8 | 30% → 75% | 52–75% | below its band (52-75%) |
| Gallery Orb-Weaver | Rare | 1/1 | 3/8 | 4/9 | 30% → 37.5% | 52–75% | below its band (52-75%) |
| Glass Golem | Rare | 1/1 | 7/1 | 8/1 | 15% → 22.5% | 52–75% | below its band (52-75%) |
| Glimmer Spider | Uncommon | 1/1 | 3/9 | 4/9 | 27.5% → 37.5% | 45–68% | below its band (45-68%) |
| Glowing Gecko | Uncommon | 1/1 | 3/9 | 5/12 | 2.5% → 17.5% | 45–68% | below its band (45-68%) |
| Goose Sentry | Rare | 1/1 | 2/12 | 3/12 | 30% → 60% | 52–75% | below its band (52-75%) |
| Horned Lizard | Uncommon | 1/1 | 3/5 | 4/6 | 17.5% → 32.5% | 45–68% | below its band (45-68%) |
| Irradiated Axolotl | Uncommon | 1/1 | 2/10 | 3/10 | 25% → 35% | 45–68% | below its band (45-68%) |
| Kinkajou Lurker | Uncommon | 1/1 | 3/7 | 4/7 | 20% → 52.5% | 45–68% | below its band (45-68%) |
| Lion's Mane Jelly | Uncommon | 1/2 | 3/13 | 4/13 | 27.5% → 40% | 45–68% | below its band (45-68%) |
| Lotus Frog | Uncommon | 1/1 | 3/7 | 4/7 | 32.5% → 52.5% | 45–68% | below its band (45-68%) |
| Lyrebird Mimic | Uncommon | 1/1 | 3/8 | 4/8 | 27.5% → 55% | 45–68% | below its band (45-68%) |
| Mallard Halberdier | Rare | 1/1 | 3/8 | 4/8 | 20% → 65% | 52–75% | below its band (52-75%) |
| Mayfly Dancer | Common | 0/0 | 2/5 | 3/5 | 20% → 47.5% | 35–60% | below its band (35-60%) |
| Meerkat Burrower | Common | 1/1 | 2/8 | 3/8 | 7.5% → 15% | 35–60% | below its band (35-60%) |
| Moon Jerboa | Uncommon | 1/1 | 3/7 | 4/7 | 32.5% → 52.5% | 45–68% | below its band (45-68%) |
| Moonlit Hare | Uncommon | 0/1 | 1/8 | 2/8 | 7.5% → 40% | 45–68% | below its band (45-68%) |
| Moray Ambusher | Common | 1/2 | 6/12 | 7/14 | 10% → 15% | 35–60% | below its band (35-60%) |
| Mudflat Godwit | Uncommon | 1/1 | 3/7 | 4/7 | 20% → 52.5% | 45–68% | below its band (45-68%) |
| Nectar Sipper | Common | 0/0 | 1/4 | 2/2 | 25% → 40% | 35–60% | below its band (35-60%) |
| Nightjar Drifter | Common | 1/0 | 3/5 | 4/5 | 20% → 65% | 35–60% | below its band (35-60%) |
| Oilbird | Uncommon | 1/1 | 3/8 | 4/8 | 32.5% → 55% | 45–68% | below its band (45-68%) |
| Ore-Smelter Mole | Uncommon | 1/1 | 1/10 | 3/10 | 0% → 22.5% | 45–68% | below its band (45-68%) |
| Otter Angler | Common | 0/1 | 1/7 | 1/11 | 25% → 35% | 35–60% | below its band (35-60%) |
| Otter Guard | Uncommon | 1/1 | 2/5 | 2/6 | 25% → 32.5% | 45–68% | below its band (45-68%) |
| Pack Mule | Common | 0/0 | 1/10 | 1/11 | 22.5% → 30% | 35–60% | below its band (35-60%) |
| Paper Wasp | Common | 0/0 | 2/5 | 2/7 | 17.5% → 27.5% | 35–60% | below its band (35-60%) |
| Peak Condor | Common | 1/1 | 4/8 | 5/8 | 25% → 40% | 35–60% | below its band (35-60%) |
| Pill Bug | Uncommon | 0/0 | 1/4 | 2/4 | 5% → 47.5% | 45–68% | below its band (45-68%) |
| Pinecone Sapper | Common | 0/1 | 0/6 | 0/7 | 15% → 27.5% | 35–60% | below its band (35-60%) |
| Puddle Skimmer | Uncommon | 0/1 | 2/6 | 3/6 | 12.5% → 57.5% | 45–68% | below its band (45-68%) |
| Quarry Mole | Common | 1/1 | 2/10 | 3/10 | 5% → 27.5% | 35–60% | below its band (35-60%) |
| Rabbit Kit | Common | 0/0 | 1/1 | 2/1 | 5% → 37.5% | 35–60% | below its band (35-60%) |
| Raccoon Bandit | Rare | 0/1 | 3/6 | 4/6 | 37.5% → 67.5% | 52–75% | below its band (52-75%) |
| Raccoon Nightcrew | Common | 1/1 | 7/12 | 8/12 | 20% → 35% | 35–60% | below its band (35-60%) |
| Rainmaker Frog | Uncommon | 1/1 | 2/10 | 3/12 | 2.5% → 22.5% | 45–68% | below its band (45-68%) |
| Riptide Eel | Uncommon | 1/1 | 7/5 | 8/5 | 7.5% → 25% | 45–68% | below its band (45-68%) |
| Riverwing Envoy | Uncommon | 0/0 | 1/4 | 2/4 | 35% → 65% | 45–68% | below its band (45-68%) |
| Sawfish | Uncommon | 1/1 | 3/8 | 4/8 | 32.5% → 60% | 45–68% | below its band (45-68%) |
| Shallows Fry | Common | 0/0 | 1/2 | 2/2 | 0% → 15% | 35–60% | below its band (35-60%) |
| Slow Loris | Common | 0/0 | 2/6 | 3/7 | 22.5% → 37.5% | 35–60% | below its band (35-60%) |
| Smokescreen Raccoon | Uncommon | 1/1 | 3/7 | 4/7 | 27.5% → 52.5% | 45–68% | below its band (45-68%) |
| Snapper Hatchling | Common | 0/0 | 1/12 | 1/13 | 17.5% → 27.5% | 35–60% | below its band (35-60%) |
| Snapstick Turtle | Common | 1/1 | 2/14 | 3/14 | 10% → 40% | 35–60% | below its band (35-60%) |
| Snowshoe Hare | Common | 0/0 | 1/4 | 1/6 | 25% → 35% | 35–60% | below its band (35-60%) |
| Soldier Ant | Uncommon | 0/1 | 2/5 | 3/5 | 27.5% → 60% | 45–68% | below its band (45-68%) |
| Springbok Pronker | Common | 1/0 | 3/5 | 4/5 | 25% → 55% | 35–60% | below its band (35-60%) |
| Star-nosed Mole | Common | 0/0 | 2/6 | 3/6 | 10% → 17.5% | 35–60% | below its band (35-60%) |
| Sunspire Envoy | Rare | 1/1 | 1/6 | 2/6 | 12.5% → 35% | 52–75% | below its band (52-75%) |
| Sunthroat Courier | Uncommon | 0/1 | 1/3 | 2/3 | 10% → 47.5% | 45–68% | below its band (45-68%) |
| Sworn Shieldbearer | Uncommon | 1/1 | 2/12 | 3/12 | 5% → 30% | 45–68% | below its band (45-68%) |
| Tarantula Hawk | Uncommon | 1/1 | 3/8 | 4/8 | 32.5% → 55% | 45–68% | below its band (45-68%) |
| Tide Spirit | Rare | 0/1 | 2/5 | 3/5 | 2.5% → 32.5% | 52–75% | below its band (52-75%) |
| Tiny Cave Dweller | Uncommon | 0/0 | 1/4 | 2/4 | 7.5% → 30% | 45–68% | below its band (45-68%) |
| Trash Panda Trickster | Common | 0/0 | 2/5 | 3/3 | 15% → 30% | 35–60% | below its band (35-60%) |
| Tunnel Ant | Rare | 1/1 | 2/4 | 3/5 | 12.5% → 20% | 52–75% | below its band (52-75%) |
| Vampire Finch | Uncommon | 1/1 | 4/7 | 5/7 | 25% → 40% | 45–68% | below its band (45-68%) |

## 4. Left alone

- **77 cards that cost 2+ Lumber and measure 22–37%** whatever their stats: the biggest buff that still fits the budget (about +2 Attack and +30% Health) moved them by 0–8 points. That is decision B4 (Lumber only comes from discards, so a 2–3 Lumber card costs three or four cards and arrives late); stats won't fix it. Median win rate by cost before the pass: 0 Lumber 50%, 1 Lumber 49%, 2 Lumber 27.5%, 3+ 32.5%. Lowering a card's Lumber does move it, often too far (Voltaic Eel 3 → 1 Lumber: 30% → 97.5%; Narwhal Lancer 2 → 1: 27.5% → 97.5%), so only three rework cards got one Lumber less. The cards: Anaconda Coil, Balloon Archer, Basalt Boar, Bison Bulldozer, Blue-ringed Octopus, Bone Diviner, Colossal Squid, Coral Reef Shark, Corpse-flower Beetle, Dhole Matriarch, Dust-devil Kestrel, Echidna Quillshot, Echo Matriarch, Electric Catfish, Ember Revenant, Fire Hawk, Frillneck Duelist, Geode Scorpion, Gilded Swan Knight, Gloom Gibbon, Hagfish Silencer, Hercules Beetle, Ibex Rockcaller, Ice Fish, Iron Warden, Ironback Gorilla, Ironmaw Warwolf, Leopard Seal, Lichen Tortoise, Lone Grey Wolf, Lunar Howler, Malachite Golem, Mantis Shrimp, Marching Elephant, Margay, Marshal of Rivergate, Marula Elephant, Mongoose Duelist, Monitor Rambler, Obsidian Lich, Octopus Tactician, Old Willow of the Ford, Old-Growth Tortoise, Pride Queen, Quarry Troll, Reef Admiral, River Warden, Rivergate Tribune, Salamander Pyromancer, Scree Goat, Sea Turtle Elder, Shieldbearer Hound, Shimmerwing Stag, Shoal Shark, Siege Rhino, Snow Leopard, Sperm Whale Elder, Spitting Cobra, Starfall Owl, Sunspire Choirmother, Sunspire Sky-Sovereign, Supernova Jelly, Tardigrade, The Contradiction, The Drowned Matriarch, The Heron Hag, The Old Shell, The Thistle Baron, Thorny Devil, Thunder Lizard, Timber Wolf Pack Leader, Walrus Icebreaker, War Elephant, Werebadger, Wolfsbane Alpha, Yeti Chieftain, Ür-Elk.
- **Still out of band, no small stat change helped** (need a skill or cost look): Bramblewood Macaque (100%), Chained Binturong (10%), Dynamite Packrat (10%), Irradiated Glow Wyrm (15%), Marsh Gas Toad (22.5%), Owl Nightwatch (15%), Petal Fletcher (87.5%), Puppeteer Imp (85%), Rafflesia (22.5%), Upside-Down Bat (82.5%).
- **Starter and Basic cards (the tutorial and the starter decks are built from them; untouched as before):** Ant Scout (5%), Burrow Rabbit (92.5%), Chipmunk Forager (2.5%), Cobalt Talon Skirmisher (57.5%), Crimson Recruit (80%), Duckling (0%), Earthworm (0%), Forager Ant (2.5%), Garden Snail (0%), Guppy (0%), Harvest Mouse (0%), Honey Bee (5%), Mosswing (2.5%), Otter Kit (2.5%), Silver Minnow (0%).
- **Cards whose value comes from a deck plan the test can't see (Ecclesia, Devilry, Remember, Changeling, Lumber makers):** Abbey Goose (10%), Ash Imp (82.5%), Ashbone Ghoul (87.5%), Badger Lumberjack (25%), Blessed Avatar (10%), Candle Moth (12.5%), Cinder Imp (72.5%), Friar Badger (10%), Glass Changeling (40%), Glowworm Cluster (2.5%), Golden Magpie (10%), Heartwood Treant (22.5%), Hedge Changeling (85%), Hymn Wren (25%), Lurking Dread (95%), Marsh Wisp (20%), Newt Doctor (35%), Puddle Changeling (90%), Storm Heron (10%), The Unremembered (40%), Vigil Owl (10%).
- **The reference filler the test is measured against (changing them moves every number):** Fawn Scout (82.5%), Mouse Sapper (25%).
- **Walls (0-Attack Structures):** Barnacle Fortress (0%), Colony (100%), Coral Polyp Colony (20%), Dam Wall (7.5%), Nest (15%), Termite Mound (0%), Trebuchet Crew (40%).
- **Enemy-only bosses:** Marshal Tuskwell (35%), Rimeheart Colossus (30%), The Caldera Wyrm (10%), The Magnate Duck (32.5%).
- **Enemy-only Leaders with no source (bosses):** Old Snapjaw (25%), The Gannet Queen (35%), Triumphvirate (32.5%).
- **Raid-only cards (the raid agent is rebalancing them):** Abyss Lantern Squid (12.5%), Glass Octopus (0%), Goliath Broodmother (32.5%), Goliath Tentacle (32.5%), Inkcloud Squid (87.5%), Vampire Squid (30%).
- **Materia:** Abyssal Ink (15%), Dragon Scale (15%), Ember Core (15%), Iron Shard (15%), River Pearl (15%), Strange Materia (15%), Tempering Stone (15%).
- **Equipment:** Bark Buckler (92.5%), Dragonscale Mail (25%), Siege Hammer (25%).
- **Spells:** Tailwind (17.5%).
- **Eggs:** Cocoon (5%), Den Bundle (0%), Leathery Egg (0%), Red Dragon Egg (2.5%), River Bundle (2.5%), Roe Pearl (5%), Speckled Egg (0%), Woodland Egg (2.5%).
- **Cards you set by hand:** no creatorNote records a stat you set. The 19 notes that quote you are skill changes (17 Cleave buffs, Voltaic Eel's Chain Lightning) and the Sea Cucumber request; their skills are kept. Of them only Beetle Battering-Ram (95%, Rare) lost stats (5/20 → 4/14, its Cleave 3 kept) and Voltaic Eel lost a Lumber (3 → 2).
- Not run: the test suites. `tests/golden/card-matrix.json` will show the stat changes as diffs; accept with `node tests/card-matrix.js --update` at the next rebuild.

Re-run: `node tools/card_balance.js 40` (about 5 minutes on an idle machine; `docs/balance/card-balance.json` is from that run after the pass).
