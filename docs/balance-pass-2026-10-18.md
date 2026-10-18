# Balance pass 2, 2026-10-18

A second rough pass over every real card after today's rule changes: Bleed and Poison tick down 1 a round (heals only stanch Bleed, Cure only takes Poison), Wave N crashes (both take N), shooter and skill kills are credited (On Kill, Midas, Crown), both seats pitch by the same rules, the CPU sacrifices, lightning grounded at brambles (reverted by X2 during this pass: a bolt at a bramble deals its damage again, but never Shocks it; the final numbers include that and X2's Flood-wets-land-units rule; section 7 also uses X3's bramble Shields). The CPU levels don't touch these numbers: the sims run with `aiAim` off.

**The owner's answers that shaped it (15:05):** "General balance pass sticking religiously to N" (budget v3 is a hard rule for every card not on the skip list); "Yea, don't let high lumber cost be normal" (Lumber cuts approved for the slow 2+ Lumber cards); "Okay" (fit the Great Gate); Ritual "increases N".

**How it was measured.** As on 10-17: `tools/card_balance.js`'s test (each card at Level 1, 8 copies, or 6 / 4 / 3 at 1 / 2 / 3+ Lumber, in a deck of the reference filler, against 20 filler cards), 40 games per measurement on the tool's fixed seeds, so every variant of a card plays the same 40 fights. The bands are the tool's (Common 35–60%, Uncommon 45–68%, Rare 52–75%, Very Rare 56–80%, Super Rare 60–84%, Epic 62–87%, Heroic 64–89%, Unique 66–92%, Legendary 70–97%). 40 games is noisy (about ±8 points on one card): read one number as "which way and roughly how far".

**What moved.** (1) Budget v3 first: a Ritual term in N, then the two cards still over it fitted. (2) Cards more than 8 points outside their band moved **half-way toward it** with small Attack / Health steps (Attack ±1 / ±2, Health ±15% / ±30%, then finer Health steps and one-for-one trades), the step landing nearest the half-way point, at least 5 points better, and **never past the band's far edge** (stricter than 10-17, which allowed 5 points of slack). Every buff stays within budget v3. (3) The 2+ Lumber cards that sit at 22–37% whatever their stats got **one Lumber less, or two for 3+ Lumber cards (never below 1)**, their stats re-fit to budget v3 at the new Lumber, then at most ±2 Attack / ±30% Health to land **inside** their band; a card that no such variant put in band keeps its Lumber. Wait, rarity and skills are untouched. Each changed card's creatorNote has a `2026-10-18 (balance pass 2)` line saying what changed and why.

**Result:** 108 cards changed: 51 Attack / Health (23 toned down, 28 lifted), 55 Lumber cuts, 2 budget fits. Cards in their band (all 631 the tool measures, skipped kinds included): **233 → 309**. The 233 before is today's main as it stood, the same count the 10-17 pass ended on: today's rule changes moved few cards (section 2).

**Lumber, the player cards** (the cards the tool measures, less the skip list below):

| Lumber | 0 | 1 | 2 | 3+ |
|---|---|---|---|---|
| Cards before | 172 | 206 | 113 | 43 |
| Cards after | 172 | 261 | 71 | 30 |
| Median win rate before | 50% | 52.5% | 30% | 32.5% |
| Median win rate after | 52.5% | 57.5% | 32.5% | 32.5% |

## 1. Budget v3 as a hard rule

- **Ritual raises N:** N = 20 + 2×Level + Rarity + 6×Wait + 0.5×Wait² + 4×Lumber + 0.4×Lumber² **+ 1×Ritual points**, the Ritual points being the sum of its counts. One point per count, like a small Wait: each count is a unit perished, a card drawn or a point of bramble damage the card waits for. The Sixfold (Epic 8/20, 0 Lumber, Ritual 6 perished / 6 drawn / 6 bramble damage = 18 points): N 28 → 46, (N/3)² 87.1 → 235.1; its 2A+H+S = 37 and A·H+S = 161 now pass, so its 8/20 stays. In code: `SB_V3_DEFAULTS.perRitual` and `sbRitualPts` in `arena_app.js` (the Test Lab's Stat budget panel has a "Per Ritual point" box and the formula line shows the term), each row's new `budget` field in `tools/card_balance.js` (N, S, both scores, pass), and the legend of `tools/cardplan/plan_sheets.py`.
- **Great Gate** 0/45 → 0/28, the Test Lab's Fit value: the enemy gate of 23-7 and 24-1 (owner: "Okay"); those two fights get easier.
- **MissingNo.** 3/33 → 3/13, the Test Lab's Fit value: the secret card #0 (Evasive ×1.5).
- **Still over, on the skip list:** the five Legendary Dragons (Red, White, Blue, Green, Black; rank 1 cards, over the budget on purpose by the creature-ranks rule; Fit would be 10/37 to 10/39) and the Caldera Wyrm (the Map 20 world boss's leader, species Dragon, 6/36; Fit 6/19). **Your call** whether "religiously" covers them.
- Every other card that is not a test card passes budget v3, and every change in this pass keeps it.

## 2. Today's rule changes: who moved

Yesterday's after-pass numbers against today's main before this pass (same seeds, same decks). Of 627 cards measured both times the median moved 0 points and 9 moved 10 or more. By the mechanics the brief named:

| Mechanic | Cards | Median shift | Moved 10+ points |
|---|---|---|---|
| Bleed | 15 | +0 | Hummingbird Needler 42.5% → 22.5%, Bog Leech 75% → 57.5%, Alley Cat 80% → 70% |
| Poison | 34 | +0 | none |
| Cure | 1 | +0 | none |
| Healing | 21 | +0 | none |
| Wave | 5 | +2.5 | Tide Pool Crab 32.5% → 75% |
| Shooter | 30 | +0 | none |
| Lightning | 9 | +0 | none |

- **Bleed ticking down** cost the 1-Bleed cards their slow kill: Hummingbird Needler 42.5% → 22.5% (lifted here, 1/3 → 2/3), Bog Leech 75% → 57.5% and Alley Cat 80% → 70% (now in band, left).
- **Wave N** made Tide Pool Crab (Wave left, Armor 1, Molting) a wall that hurts what it shoves: 32.5% → 75% (toned down here, 1/5 → 1/4). The other Wave cards barely moved.
- **Poison, Cure, healing, shooters and lightning:** no card moved 10 points. The filler's poisoner sees the tick-down on both sides, shooter credit only matters to On Kill / Midas / Crown cards (few in the test), and the test has no bramble-targeted lightning to ground.
- **Also moved, outside those mechanics:** Cinder Imp 72.5% → 97.5% and Ash Imp 82.5% → 95% (Sacrifice cards: the CPU now sacrifices, and both seats pitch by the same rules; deck-plan cards, left), Puppeteer Imp 85% → 100% and Dread Bell 75% → 92.5% (left: no small fix / a 0-Attack Structure), Brimstone Hound (Pitchfork) 70% → 95% (toned down here, 4/9 → 3/6; the cause isn't traced). The three new great beasts (Fathom Leviathan, Grovebearer Dragon-Turtle, Ashmantle Fiend) measure 30–32.5% and are rank / raid cards, left.

## 3. Lumber cuts (55)

| Card | Rarity | Wait | Was | Now | Win rate before → after | Band | Why |
|---|---|---|---|---|---|---|---|
| Ice Fish | Epic | 3 | 5/11, 3 Lumber | 5/11, 1 Lumber | 32.5% → 70% | 62–87% | below its band (62-87%) at 3 Lumber whatever its stats; owner 2026-10-18: high Lumber shouldn't be normal |
| Iron Warden | Epic | 3 | 3/18, 3 Lumber | 4/18, 1 Lumber | 30% → 75% | 62–87% | below its band (62-87%) at 3 Lumber whatever its stats; owner 2026-10-18: high Lumber shouldn't be normal; then 4/18 to land in its band |
| Ironback Gorilla | Rare | 4 | 8/20, 3 Lumber | 8/20, 1 Lumber | 30% → 60% | 52–75% | below its band (52-75%) at 3 Lumber whatever its stats; owner 2026-10-18: high Lumber shouldn't be normal |
| Lone Grey Wolf | Very Rare | 2 | 4/18, 3 Lumber | 4/18, 1 Lumber | 32.5% → 77.5% | 56–80% | below its band (56-80%) at 3 Lumber whatever its stats; owner 2026-10-18: high Lumber shouldn't be normal |
| Old Willow of the Ford | Legendary | 4 | 6/40, 3 Lumber | 6/40, 1 Lumber | 30% → 92.5% | 70–97% | below its band (70-97%) at 3 Lumber whatever its stats; owner 2026-10-18: high Lumber shouldn't be normal |
| Pride Queen | Heroic | 1 | 5/16, 3 Lumber | 4/14, 1 Lumber | 32.5% → 87.5% | 64–89% | below its band (64-89%) at 3 Lumber whatever its stats; owner 2026-10-18: high Lumber shouldn't be normal; then 4/14 to land in its band |
| Salamander Pyromancer | Epic | 3 | 4/12, 3 Lumber | 4/12, 1 Lumber | 30% → 85% | 62–87% | below its band (62-87%) at 3 Lumber whatever its stats; owner 2026-10-18: high Lumber shouldn't be normal |
| Sperm Whale Elder | Epic | 3 | 5/11, 3 Lumber | 5/11, 1 Lumber | 30% → 77.5% | 62–87% | below its band (62-87%) at 3 Lumber whatever its stats; owner 2026-10-18: high Lumber shouldn't be normal |
| Sunspire Sky-Sovereign | Heroic | 1 | 7/18, 3 Lumber | 3/15, 1 Lumber | 30% → 87.5% | 64–89% | below its band (64-89%) at 3 Lumber whatever its stats; owner 2026-10-18: high Lumber shouldn't be normal; 4/15 is budget v3's Fit at 1 Lumber; then 3/15 to land in its band |
| The Contradiction | Unique | 2 | 7/24, 3 Lumber | 6/17, 1 Lumber | 32.5% → 90% | 66–92% | below its band (66-92%) at 3 Lumber whatever its stats; owner 2026-10-18: high Lumber shouldn't be normal; then 6/17 to land in its band |
| The Drowned Matriarch | Heroic | 2 | 4/20, 3 Lumber | 3/20, 1 Lumber | 30% → 67.5% | 64–89% | below its band (64-89%) at 3 Lumber whatever its stats; owner 2026-10-18: high Lumber shouldn't be normal; then 3/20 to land in its band |
| Wolfsbane Alpha | Heroic | 2 | 5/18, 3 Lumber | 5/18, 1 Lumber | 32.5% → 77.5% | 64–89% | below its band (64-89%) at 3 Lumber whatever its stats; owner 2026-10-18: high Lumber shouldn't be normal |
| Yeti Chieftain | Heroic | 3 | 6/24, 3 Lumber | 6/24, 1 Lumber | 32.5% → 75% | 64–89% | below its band (64-89%) at 3 Lumber whatever its stats; owner 2026-10-18: high Lumber shouldn't be normal |
| Anaconda Coil | Rare | 2 | 4/9, 2 Lumber | 5/10, 1 Lumber | 25% → 52.5% | 52–75% | below its band (52-75%) at 2 Lumber whatever its stats; owner 2026-10-18: high Lumber shouldn't be normal; then 5/10 to land in its band |
| Balloon Archer | Uncommon | 2 | 1/8, 2 Lumber | 1/8, 1 Lumber | 32.5% → 52.5% | 45–68% | below its band (45-68%) at 2 Lumber whatever its stats; owner 2026-10-18: high Lumber shouldn't be normal |
| Basalt Boar | Common | 1 | 4/20, 2 Lumber | 2/20, 1 Lumber | 25% → 40% | 35–60% | below its band (35-60%) at 2 Lumber whatever its stats; owner 2026-10-18: high Lumber shouldn't be normal; then 2/20 to land in its band |
| Bison Bulldozer | Uncommon | 1 | 4/7, 2 Lumber | 4/7, 1 Lumber | 25% → 57.5% | 45–68% | below its band (45-68%) at 2 Lumber whatever its stats; owner 2026-10-18: high Lumber shouldn't be normal |
| Blue-ringed Octopus | Rare | 2 | 4/9, 2 Lumber | 3/9, 1 Lumber | 35% → 55% | 52–75% | below its band (52-75%) at 2 Lumber whatever its stats; owner 2026-10-18: high Lumber shouldn't be normal; then 3/9 to land in its band |
| Corpse-flower Beetle | Rare | 2 | 4/9, 2 Lumber | 5/12, 1 Lumber | 22.5% → 60% | 52–75% | below its band (52-75%) at 2 Lumber whatever its stats; owner 2026-10-18: high Lumber shouldn't be normal; then 5/12 to land in its band |
| Dust-devil Kestrel | Rare | 2 | 4/9, 2 Lumber | 5/9, 1 Lumber | 22.5% → 52.5% | 52–75% | below its band (52-75%) at 2 Lumber whatever its stats; owner 2026-10-18: high Lumber shouldn't be normal; then 5/9 to land in its band |
| Echidna Quillshot | Rare | 2 | 4/9, 2 Lumber | 4/9, 1 Lumber | 30% → 62.5% | 52–75% | below its band (52-75%) at 2 Lumber whatever its stats; owner 2026-10-18: high Lumber shouldn't be normal |
| Echo Matriarch | Heroic | 2 | 4/12, 2 Lumber | 4/12, 1 Lumber | 35% → 85% | 64–89% | below its band (64-89%) at 2 Lumber whatever its stats; owner 2026-10-18: high Lumber shouldn't be normal |
| Electric Catfish | Rare | 1 | 3/10, 2 Lumber | 2/10, 1 Lumber | 35% → 75% | 52–75% | below its band (52-75%) at 2 Lumber whatever its stats; owner 2026-10-18: high Lumber shouldn't be normal; then 2/10 to land in its band |
| Fire Hawk | Rare | 2 | 4/9, 2 Lumber | 5/10, 1 Lumber | 25% → 65% | 52–75% | below its band (52-75%) at 2 Lumber whatever its stats; owner 2026-10-18: high Lumber shouldn't be normal; then 5/10 to land in its band |
| Geode Scorpion | Rare | 2 | 4/9, 2 Lumber | 4/10, 1 Lumber | 22.5% → 62.5% | 52–75% | below its band (52-75%) at 2 Lumber whatever its stats; owner 2026-10-18: high Lumber shouldn't be normal; then 4/10 to land in its band |
| Gilded Swan Knight | Super Rare | 2 | 3/12, 2 Lumber | 2/8, 1 Lumber | 35% → 77.5% | 60–84% | below its band (60-84%) at 2 Lumber whatever its stats; owner 2026-10-18: high Lumber shouldn't be normal; then 2/8 to land in its band |
| Gloom Gibbon | Rare | 1 | 4/8, 2 Lumber | 4/8, 1 Lumber | 25% → 55% | 52–75% | below its band (52-75%) at 2 Lumber whatever its stats; owner 2026-10-18: high Lumber shouldn't be normal |
| Hagfish Silencer | Rare | 1 | 4/8, 2 Lumber | 4/8, 1 Lumber | 25% → 55% | 52–75% | below its band (52-75%) at 2 Lumber whatever its stats; owner 2026-10-18: high Lumber shouldn't be normal |
| Hercules Beetle | Rare | 2 | 4/9, 2 Lumber | 4/10, 1 Lumber | 27.5% → 57.5% | 52–75% | below its band (52-75%) at 2 Lumber whatever its stats; owner 2026-10-18: high Lumber shouldn't be normal; then 4/10 to land in its band |
| Ibex Rockcaller | Rare | 2 | 4/9, 2 Lumber | 3/9, 1 Lumber | 25% → 55% | 52–75% | below its band (52-75%) at 2 Lumber whatever its stats; owner 2026-10-18: high Lumber shouldn't be normal; then 3/9 to land in its band |
| Leopard Seal | Rare | 2 | 4/9, 2 Lumber | 6/10, 1 Lumber | 22.5% → 52.5% | 52–75% | below its band (52-75%) at 2 Lumber whatever its stats; owner 2026-10-18: high Lumber shouldn't be normal; then 6/10 to land in its band |
| Lichen Tortoise | Rare | 2 | 4/9, 2 Lumber | 5/9, 1 Lumber | 22.5% → 57.5% | 52–75% | below its band (52-75%) at 2 Lumber whatever its stats; owner 2026-10-18: high Lumber shouldn't be normal; then 5/9 to land in its band |
| Lunar Howler | Rare | 2 | 3/14, 2 Lumber | 4/16, 1 Lumber | 25% → 70% | 52–75% | below its band (52-75%) at 2 Lumber whatever its stats; owner 2026-10-18: high Lumber shouldn't be normal; then 4/16 to land in its band |
| Marching Elephant | Rare | 3 | 7/30, 2 Lumber | 6/30, 1 Lumber | 27.5% → 75% | 52–75% | below its band (52-75%) at 2 Lumber whatever its stats; owner 2026-10-18: high Lumber shouldn't be normal; then 6/30 to land in its band |
| Mongoose Duelist | Uncommon | 1 | 4/7, 2 Lumber | 4/7, 1 Lumber | 25% → 52.5% | 45–68% | below its band (45-68%) at 2 Lumber whatever its stats; owner 2026-10-18: high Lumber shouldn't be normal |
| Monitor Rambler | Uncommon | 2 | 4/16, 2 Lumber | 2/16, 1 Lumber | 25% → 67.5% | 45–68% | below its band (45-68%) at 2 Lumber whatever its stats; owner 2026-10-18: high Lumber shouldn't be normal; then 2/16 to land in its band |
| Obsidian Lich | Rare | 2 | 5/18, 2 Lumber | 3/18, 1 Lumber | 25% → 60% | 52–75% | below its band (52-75%) at 2 Lumber whatever its stats; owner 2026-10-18: high Lumber shouldn't be normal; then 3/18 to land in its band |
| Old-Growth Tortoise | Common | 2 | 3/20, 2 Lumber | 3/20, 1 Lumber | 25% → 45% | 35–60% | below its band (35-60%) at 2 Lumber whatever its stats; owner 2026-10-18: high Lumber shouldn't be normal |
| Quarry Troll | Rare | 2 | 3/16, 2 Lumber | 4/16, 1 Lumber | 25% → 70% | 52–75% | below its band (52-75%) at 2 Lumber whatever its stats; owner 2026-10-18: high Lumber shouldn't be normal; then 4/16 to land in its band |
| Reef Admiral | Heroic | 2 | 4/16, 2 Lumber | 4/16, 1 Lumber | 32.5% → 85% | 64–89% | below its band (64-89%) at 2 Lumber whatever its stats; owner 2026-10-18: high Lumber shouldn't be normal |
| Scree Goat | Uncommon | 2 | 5/14, 2 Lumber | 4/14, 1 Lumber | 25% → 65% | 45–68% | below its band (45-68%) at 2 Lumber whatever its stats; owner 2026-10-18: high Lumber shouldn't be normal; then 4/14 to land in its band |
| Shimmerwing Stag | Rare | 2 | 6/18, 2 Lumber | 3/18, 1 Lumber | 32.5% → 62.5% | 52–75% | below its band (52-75%) at 2 Lumber whatever its stats; owner 2026-10-18: high Lumber shouldn't be normal; 5/18 is budget v3's Fit at 1 Lumber; then 3/18 to land in its band |
| Shoal Shark | Uncommon | 2 | 6/16, 2 Lumber | 6/14, 1 Lumber | 27.5% → 52.5% | 45–68% | below its band (45-68%) at 2 Lumber whatever its stats; owner 2026-10-18: high Lumber shouldn't be normal; then 6/14 to land in its band |
| Siege Rhino | Rare | 3 | 8/24, 2 Lumber | 7/20, 1 Lumber | 32.5% → 75% | 52–75% | below its band (52-75%) at 2 Lumber whatever its stats; owner 2026-10-18: high Lumber shouldn't be normal; then 7/20 to land in its band |
| Snow Leopard | Rare | 1 | 4/8, 2 Lumber | 4/8, 1 Lumber | 25% → 55% | 52–75% | below its band (52-75%) at 2 Lumber whatever its stats; owner 2026-10-18: high Lumber shouldn't be normal |
| Spitting Cobra | Rare | 2 | 5/7, 2 Lumber | 4/7, 1 Lumber | 30% → 67.5% | 52–75% | below its band (52-75%) at 2 Lumber whatever its stats; owner 2026-10-18: high Lumber shouldn't be normal; then 4/7 to land in its band |
| Supernova Jelly | Rare | 1 | 4/9, 2 Lumber | 3/8, 1 Lumber | 32.5% → 62.5% | 52–75% | below its band (52-75%) at 2 Lumber whatever its stats; owner 2026-10-18: high Lumber shouldn't be normal; then 3/8 to land in its band |
| Tardigrade | Rare | 1 | 4/8, 2 Lumber | 4/8, 1 Lumber | 25% → 67.5% | 52–75% | below its band (52-75%) at 2 Lumber whatever its stats; owner 2026-10-18: high Lumber shouldn't be normal |
| The Heron Hag | Heroic | 2 | 3/14, 2 Lumber | 3/14, 1 Lumber | 27.5% → 65% | 64–89% | below its band (64-89%) at 2 Lumber whatever its stats; owner 2026-10-18: high Lumber shouldn't be normal |
| The Old Shell | Heroic | 3 | 2/30, 2 Lumber | 3/30, 1 Lumber | 25% → 80% | 64–89% | below its band (64-89%) at 2 Lumber whatever its stats; owner 2026-10-18: high Lumber shouldn't be normal; then 3/30 to land in its band |
| The Thistle Baron | Heroic | 2 | 3/18, 2 Lumber | 3/18, 1 Lumber | 25% → 82.5% | 64–89% | below its band (64-89%) at 2 Lumber whatever its stats; owner 2026-10-18: high Lumber shouldn't be normal |
| Thorny Devil | Common | 2 | 2/14, 2 Lumber | 2/14, 1 Lumber | 22.5% → 45% | 35–60% | below its band (35-60%) at 2 Lumber whatever its stats; owner 2026-10-18: high Lumber shouldn't be normal |
| Timber Wolf Pack Leader | Common | 1 | 4/14, 2 Lumber | 3/14, 1 Lumber | 25% → 42.5% | 35–60% | below its band (35-60%) at 2 Lumber whatever its stats; owner 2026-10-18: high Lumber shouldn't be normal; then 3/14 to land in its band |
| Walrus Icebreaker | Very Rare | 2 | 3/11, 2 Lumber | 4/13, 1 Lumber | 25% → 72.5% | 56–80% | below its band (56-80%) at 2 Lumber whatever its stats; owner 2026-10-18: high Lumber shouldn't be normal; then 4/13 to land in its band |
| Ür-Elk | Very Rare | 3 | 8/26, 2 Lumber | 7/22, 1 Lumber | 30% → 80% | 56–80% | below its band (56-80%) at 2 Lumber whatever its stats; owner 2026-10-18: high Lumber shouldn't be normal; then 7/22 to land in its band |

Of these, 55 are in their band on the final run (the search's 40 games and the tool's 40 games are the same fights, so they agree unless another changed card is in the filler; it isn't).

## 4a. Too strong: toned down (23)

| Card | Rarity | Wait | Was | Now | Win rate before → after | Band | Why |
|---|---|---|---|---|---|---|---|
| Badger Berserker | Rare | 1 | 5/14 | 5/12 | 90% → 82.5% | 52–75% | above its band (52-75%) |
| Battlement Heron | Rare | 1 | 3/6 | 2/6 | 90% → 75% | 52–75% | above its band (52-75%); Shooter card, checked against today's rules |
| Brimstone Hound | Uncommon | 1 | 4/9 | 3/6 | 95% → 85% | 45–68% | above its band (45-68%); 70% on 10-17, 95% with today's rules |
| Carrion Fly Swarm | Rare | 1 | 2/3 | 1/3 | 85% → 77.5% | 52–75% | above its band (52-75%); Poison card, checked against today's rules |
| Eagle Diver | Rare | 1 | 3/5 | 2/5 | 90% → 77.5% | 52–75% | above its band (52-75%) |
| Eagle-Owl Quartermaster | Rare | 1 | 1/8 | 1/6 | 90% → 77.5% | 52–75% | above its band (52-75%); Shooter card, checked against today's rules |
| Honeyjoe Brewer | Uncommon | 0 | 1/4 | 1/3 | 95% → 75% | 45–68% | above its band (45-68%) |
| Howler Monkey | Uncommon | 0 | 2/4 | 2/3 | 82.5% → 60% | 45–68% | above its band (45-68%) |
| Inside-Out Hedgehog | Uncommon | 0 | 1/6 | 1/5 | 90% → 85% | 45–68% | above its band (45-68%) |
| Lucky Hopper | Rare | 0 | 3/11 | 2/14 | 85% → 67.5% | 52–75% | above its band (52-75%) |
| Mallard Marauder | Rare | 0 | 3/8 | 3/7 | 90% → 85% | 52–75% | above its band (52-75%) |
| Mudpuppy | Common | 1 | 2/8 | 2/7 | 80% → 55% | 35–60% | above its band (35-60%); Healing card, checked against today's rules |
| Owl Fletcher | Rare | 1 | 2/3 | 1/3 | 85% → 60% | 52–75% | above its band (52-75%); Shooter card, checked against today's rules |
| Puffball Bombardier | Uncommon | 1 | 1/6 | 1/5 | 85% → 65% | 45–68% | above its band (45-68%); Poison/Shooter card, checked against today's rules |
| Quill Volley | Rare | 0 | 3/10 | 2/10 | 87.5% → 72.5% | 52–75% | above its band (52-75%) |
| Ruby-Throat Duelist | Rare | 1 | 2/3 | 1/6 | 90% → 85% | 52–75% | above its band (52-75%) |
| Slowpoke Sentinel | Common | 1 | 1/10 | 1/8 | 72.5% → 62.5% | 35–60% | above its band (35-60%) |
| Sulfur Vent Crab | Uncommon | 1 | 1/8 | 1/7 | 77.5% → 72.5% | 45–68% | above its band (45-68%) |
| Swarm Matriarch | Rare | 1 | 1/13 | 1/10 | 87.5% → 82.5% | 52–75% | above its band (52-75%) |
| Tax-Collector Teal | Uncommon | 0 | 1/4 | 1/3 | 90% → 75% | 45–68% | above its band (45-68%) |
| Tide Pool Crab | Common | 0 | 1/5 | 1/4 | 75% → 55% | 35–60% | above its band (35-60%); 32.5% on 10-17, 75% with today's rules (Wave N now crashes (both take N)) |
| Wandering Mage | Rare | 3 | 5/10 | 5/8 | 85% → 62.5% | 52–75% | above its band (52-75%) |
| Woodland Brawler | Rare | 1 | 4/14 | 4/12 | 85% → 77.5% | 52–75% | above its band (52-75%) |

## 4b. Too weak: lifted (28)

| Card | Rarity | Wait | Was | Now | Win rate before → after | Band | Why |
|---|---|---|---|---|---|---|---|
| Aye-aye Prowler | Common | 0 | 3/6 | 4/3 | 17.5% → 27.5% | 35–60% | below its band (35-60%) |
| Bee Drone | Rare | 0 | 0/6 | 0/7 | 15% → 40% | 52–75% | below its band (52-75%) |
| Bramble Hoglet | Common | 0 | 1/8 | 1/9 | 25% → 35% | 35–60% | below its band (35-60%); Healing card, checked against today's rules |
| Chilli Parrot | Uncommon | 1 | 4/8 | 4/9 | 35% → 40% | 45–68% | below its band (45-68%) |
| Coral Current Eel | Rare | 0 | 2/6 | 3/6 | 37.5% → 45% | 52–75% | below its band (52-75%); Poison card, checked against today's rules |
| Cottonmouth Matriarch | Rare | 2 | 3/10 | 4/12 | 30% → 42.5% | 52–75% | below its band (52-75%); Poison card, checked against today's rules |
| Crown Pretender | Uncommon | 1 | 3/10 | 4/10 | 35% → 67.5% | 45–68% | below its band (45-68%) |
| Dolphin Knight | Rare | 1 | 4/3 | 4/4 | 42.5% → 75% | 52–75% | below its band (52-75%); Wave card, checked against today's rules |
| Fennec Fox | Uncommon | 1 | 3/10 | 4/10 | 22.5% → 62.5% | 45–68% | below its band (45-68%) |
| Gallery Orb-Weaver | Rare | 1 | 4/9 | 4/10 | 37.5% → 42.5% | 52–75% | below its band (52-75%); Poison card, checked against today's rules |
| Glass Golem | Rare | 1 | 8/1 | 8/4 | 22.5% → 37.5% | 52–75% | below its band (52-75%) |
| Glowing Gecko | Uncommon | 1 | 5/12 | 6/12 | 17.5% → 35% | 45–68% | below its band (45-68%) |
| Horned Lizard | Uncommon | 1 | 4/6 | 5/6 | 32.5% → 52.5% | 45–68% | below its band (45-68%) |
| Hummingbird Needler | Uncommon | 0 | 1/3 | 2/3 | 22.5% → 65% | 45–68% | below its band (45-68%); 42.5% on 10-17, 22.5% with today's rules (Bleed now ticks down 1 a round) |
| Irradiated Axolotl | Uncommon | 1 | 3/10 | 4/10 | 35% → 67.5% | 45–68% | below its band (45-68%) |
| Meerkat Burrower | Common | 1 | 3/8 | 4/8 | 15% → 50% | 35–60% | below its band (35-60%) |
| Moray Ambusher | Common | 2 | 7/14 | 8/14 | 15% → 25% | 35–60% | below its band (35-60%); Wave card, checked against today's rules |
| Ore-Smelter Mole | Uncommon | 1 | 3/10 | 4/10 | 22.5% → 62.5% | 45–68% | below its band (45-68%) |
| Otter Guard | Uncommon | 1 | 2/6 | 3/6 | 32.5% → 42.5% | 45–68% | below its band (45-68%); Shooter card, checked against today's rules |
| Rainmaker Frog | Uncommon | 1 | 3/12 | 4/12 | 15% → 55% | 45–68% | below its band (45-68%) |
| Riptide Eel | Uncommon | 1 | 8/5 | 9/5 | 25% → 35% | 45–68% | below its band (45-68%) |
| Shallows Fry | Common | 0 | 2/2 | 3/2 | 15% → 32.5% | 35–60% | below its band (35-60%) |
| Star-nosed Mole | Common | 0 | 3/6 | 4/3 | 17.5% → 27.5% | 35–60% | below its band (35-60%) |
| Subterraneaner | Uncommon | 1 | 7/10 | 8/10 | 20% → 37.5% | 45–68% | below its band (45-68%) |
| Sunspire Envoy | Rare | 1 | 2/6 | 3/6 | 35% → 75% | 52–75% | below its band (52-75%) |
| Sworn Shieldbearer | Uncommon | 1 | 3/12 | 3/13 | 30% → 35% | 45–68% | below its band (45-68%) |
| Tide Spirit | Rare | 1 | 3/5 | 4/5 | 32.5% → 75% | 52–75% | below its band (52-75%) |
| Tunnel Ant | Rare | 1 | 3/5 | 5/5 | 20% → 30% | 52–75% | below its band (52-75%) |

## 5. Lumber candidates left at their Lumber (23)

Every 2+ Lumber card stuck below its band was measured at one Lumber less (and two less for 3+ Lumber cards, never below 1), stats re-fit to budget v3. These are the ones no small stat step put inside the band; the table gives the win rate at the cut, so you can pick by hand.

| Card | Rarity | Lumber/Wait | Atk/HP | Win rate now | At −1 Lumber | Nearest variant tried | Band | Note |
|---|---|---|---|---|---|---|---|---|
| Bone Diviner | Uncommon | 2/2 | 5/20 | 35% | 90% at 5/17 | 1 Lumber 5/7: 72.5% | 45–68% | too strong at −1 Lumber; only a big stat cut lands it |
| Colossal Squid | Rare | 4/3 | 4/10 | 32.5% | 30% at 4/10 | 2 Lumber 5/13: 35% | 52–75% | still weak at −1 Lumber and −2: not a Lumber problem (skills / role) |
| Coral Reef Shark | Uncommon | 2/1 | 7/14 | 35% | 95% at 7/14 | 1 Lumber 7/6: 67.5% | 45–68% | too strong at −1 Lumber; only a big stat cut lands it |
| Dhole Matriarch | Rare | 2/2 | 5/7 | 22.5% | 25% at 5/7 | 1 Lumber 5/10: 45% | 52–75% | still weak at −1 Lumber: not a Lumber problem (skills / role) |
| Ember Revenant | Epic | 2/1 | 7/22 | 37.5% | 100% at 6/21 | 1 Lumber 4/21: 97.5% | 62–87% | too strong at −1 Lumber; only a big stat cut lands it |
| Frillneck Duelist | Rare | 2/1 | 3/11 | 25% | 50% at 3/11 | 1 Lumber 3/11: 50% | 52–75% | still weak at −1 Lumber: not a Lumber problem (skills / role) |
| Ironmaw Warwolf | Epic | 3/2 | 9/26 | 32.5% | 37.5% at 9/26 | 1 Lumber 7/25: 95% | 62–87% | weak at −1 Lumber, over the band at −2 (97.5% at 1 Lumber); no small stat step lands it |
| Irradiated Couatl | Epic | 2/3 | 8/24 | 22.5% | 15% at 7/22 | 1 Lumber 7/22: 15% | 62–87% | still weak at −1 Lumber: not a Lumber problem (skills / role) |
| Malachite Golem | Rare | 2/3 | 8/34 | 22.5% | 15% at 8/31 | 1 Lumber 8/31: 15% | 52–75% | still weak at −1 Lumber: not a Lumber problem (skills / role) |
| Mantis Shrimp | Rare | 2/1 | 3/10 | 22.5% | 7.5% at 3/10 | 1 Lumber 5/12: 47.5% | 52–75% | still weak at −1 Lumber: not a Lumber problem (skills / role) |
| Margay | Rare | 2/2 | 3/8 | 22.5% | 20% at 3/8 | 1 Lumber 4/10: 40% | 52–75% | still weak at −1 Lumber: not a Lumber problem (skills / role) |
| Marshal of Rivergate | Epic | 2/2 | 8/26 | 35% | 97.5% at 8/25 | 1 Lumber 8/25: 97.5% | 62–87% | too strong at −1 Lumber; only a big stat cut lands it |
| Marula Elephant | Uncommon | 2/2 | 4/8 | 22.5% | 10% at 4/8 | 1 Lumber 4/13: 20% | 45–68% | still weak at −1 Lumber: not a Lumber problem (skills / role) |
| Octopus Tactician | Rare | 2/2 | 6/22 | 35% | 95% at 6/22 | 1 Lumber 6/9: 62.5% | 52–75% | too strong at −1 Lumber; only a big stat cut lands it |
| River Warden | Rare | 2/1 | 4/14 | 25% | 77.5% at 4/14 | 1 Lumber 4/14: 77.5% | 52–75% | 2.5 points over the band at −1 Lumber: within noise, a good hand pick |
| Rivergate Tribune | Heroic | 3/2 | 8/30 | 32.5% | 35% at 8/30 | 1 Lumber 7/28: 97.5% | 64–89% | weak at −1 Lumber, over the band at −2 (100% at 1 Lumber); no small stat step lands it |
| Sea Turtle Elder | Common | 2/3 | 2/30 | 25% | 67.5% at 2/30 | 1 Lumber 2/30: 67.5% | 35–60% | too strong at −1 Lumber; only a big stat cut lands it |
| Shieldbearer Hound | Rare | 2/2 | 2/5 | 22.5% | 12.5% at 2/5 | 1 Lumber 4/7: 22.5% | 52–75% | still weak at −1 Lumber: not a Lumber problem (skills / role) |
| Starfall Owl | Legendary | 4/4 | 5/12 | 32.5% | 30% at 5/12 | 2 Lumber 5/19: 32.5% | 70–97% | still weak at −1 Lumber and −2: not a Lumber problem (skills / role) |
| Sunspire Choirmother | Very Rare | 2/2 | 5/10 | 32.5% | 97.5% at 5/10 | 1 Lumber 3/8: 82.5% | 56–80% | too strong at −1 Lumber; only a big stat cut lands it |
| Voltaic Eel | Rare | 2/0 | 3/10 | 42.5% | 97.5% at 3/10 | 1 Lumber 2/8: 92.5% | 52–75% | too strong at −1 Lumber; only a big stat cut lands it |
| War Elephant | Super Rare | 3/3 | 2/22 | 35% | 50% at 2/22 | 2 Lumber 2/22: 50% | 60–84% | weak at −1 Lumber, over the band at −2 (100% at 1 Lumber); no small stat step lands it |
| Werebadger | Rare | 2/2 | 4/9 | 22.5% | 30% at 4/9 | 1 Lumber 5/12: 45% | 52–75% | still weak at −1 Lumber: not a Lumber problem (skills / role) |

## 6. Left alone

- **No small stat change helped** (need a skill or cost look): Chained Binturong (10%), Dynamite Packrat (10%), Irradiated Glow Wyrm (15%), Marsh Gas Toad (22.5%), Owl Nightwatch (15%), Petal Fletcher (87.5%), Puppeteer Imp (100%), Rafflesia (22.5%), Tiny Cave Dweller (30%), Upside-Down Bat (82.5%). Also Bramblewood Macaque (Banana, 100%): only 2/4 moved it (2/6 still 97.5%), a cliff rather than a step, so it is left.
- **Starter and Basic cards (the tutorial and starter decks):** Ant Scout (5%), Burrow Rabbit (92.5%), Chipmunk Forager (2.5%), Cobalt Talon Skirmisher (57.5%), Crimson Recruit (80%), Duckling (0%), Earthworm (0%), Forager Ant (2.5%), Garden Snail (0%), Guppy (0%), Harvest Mouse (0%), Honey Bee (5%), Mosswing (2.5%), Otter Kit (2.5%), Silver Minnow (0%).
- **Deck-plan cards the test can't see (Ecclesia, Devilry, Remember, Changeling, Lumber makers):** Abbey Goose (10%), Ash Imp (95%), Ashbone Ghoul (87.5%), Badger Lumberjack (32.5%), Blessed Avatar (10%), Candle Moth (12.5%), Cathedral Eagle (10%), Cinder Imp (97.5%), Friar Badger (10%), Glass Changeling (40%), Glowworm Cluster (2.5%), Golden Magpie (10%), Heartwood Treant (22.5%), Hedge Changeling (85%), Hymn Wren (25%), Lurking Dread (95%), Marsh Wisp (20%), Newt Doctor (35%), Puddle Changeling (90%), Storm Heron (10%), The Unremembered (40%), Vigil Owl (10%).
- **The reference filler (changing it moves every number):** Fawn Scout (82.5%), Mouse Sapper (25%).
- **Walls (0-Attack Structures):** Barnacle Fortress (0%), Colony (100%), Coral Polyp Colony (20%), Dam Wall (7.5%), Dread Bell (92.5%), Nest (15%), Termite Mound (0%), Trebuchet Crew (40%).
- **Enemy-only bosses:** Marshal Tuskwell (35%), Rimeheart Colossus (30%), The Caldera Wyrm (10%), The Magnate Duck (32.5%).
- **Enemy-only Leaders with no source:** Old Snapjaw (25%), The Gannet Queen (35%), Triumphvirate (32.5%).
- **The Legendary Dragons:** Black Dragon (32.5%), Blue Dragon (32.5%), Green Dragon (32.5%), Red Dragon (32.5%), White Dragon (32.5%).
- **Rank cards and other Dragon-type cards:** Ashmantle Fiend (30%), Grovebearer Dragon-Turtle (32.5%), Thunder Lizard (30%).
- **Raid cards:** Abyss Lantern Squid (12.5%), Fathom Leviathan (32.5%), Glass Octopus (0%), Goliath Broodmother (32.5%), Goliath Tentacle (32.5%), Inkcloud Squid (87.5%), Vampire Squid (27.5%).
- **Materia:** Abyssal Ink (15%), Dragon Scale (15%), Ember Core (15%), Iron Shard (15%), River Pearl (15%), Strange Materia (15%), Tempering Stone (15%).
- **Equipment:** Bark Buckler (92.5%), Dragonscale Mail (25%), Siege Hammer (25%).
- **Spells:** Tailwind (17.5%).
- **Eggs:** Cocoon (5%), Den Bundle (0%), Leathery Egg (0%), Red Dragon Egg (5%), River Bundle (2.5%), Roe Pearl (5%), Speckled Egg (0%), Woodland Egg (2.5%).
- **Over budget on 10-17, settled by the Ritual term instead:** The Sixfold (37.5%).
- Wait, rarity and skills: unchanged on every card.
- **Dromedary** (new on main during the pass, Package X1: Uncommon, 2 Lumber, Wait 2, 5/26, the owner's own card) measures 25% (band 45–68%) on the final run. Not tuned: it arrived after the search, and its stats are yours. At 1 Lumber it would be a natural candidate like the cards in section 3.
- `tests/golden/card-matrix.json` re-baselined with `node tests/card-matrix.js --update` (the stat and Lumber changes move duels). The other test suites were not run.

## 7. The CPU levels on the road (Map 5+)

The owner asked (15:37, "B. Okay") how much harder the new CPU makes the late road. Every fight on Map 21+ (and, for context, every Map 5–20 fight whose CPU is Smart: elites, bosses, champions, world bosses) was played with the CPU at its real level (`cpuAiLevelForNode`: Map 21+ Smartest, Map 5+ elite / boss Smart, a node's own Difficulty when set) and again with the old CPU (Basic, `aiLevel` 0, the CPU before 2026-10-18), both with `aiAim` on as in the game. The player's seat is played by the engine at Smart in both, so only the CPU differs. Decks: the difficulty curve's Mid-road and Strong reference decks (`docs/balance/difficulty-curve.json`; Map 5–20 Strong only), 40 games a fight on the tool's seeds, your bramble 30 HP, the enemy bramble as the game builds it since X3 (its Health, at most `hqHp`, plus the Shield rule: map number × 1 / 1.5 / 2 / 3 by kind). "Sim" is the same fight with `aiAim` off, the way the balance tools have always measured. No map deck was changed.

**Map 21+ by map** (mean win rate over the map's fights):

Win rates are yours (the reference deck's); a change below 0 means the Smartest CPU made the fight harder.

| Map | Fights | Mid: sim / Basic / Smartest | Mid change | Strong: sim / Basic / Smartest | Strong change | Strong HP lost, Basic → Smartest |
|---|---|---|---|---|---|---|
| 21 The Quiet Summit | 6 | 72.1% / 84.2% / 77.9% | -6.3 | 83.8% / 89.6% / 88.3% | -1.3 | 42.4% → 44.2% |
| 22 The Rimefire Caldera | 8 | 68.1% / 70.9% / 68.8% | -2.1 | 84.1% / 84.7% / 85.3% | +0.6 | 46.6% → 46.4% |
| 23 The Goldfeather Siege | 8 | 60.9% / 52.5% / 55.0% | +2.5 | 75.6% / 71.2% / 70.9% | -0.3 | 51.9% → 54.3% |
| 24 Goldfeather Keep | 8 | 54.7% / 56.2% / 60.3% | +4.1 | 69.1% / 77.5% / 78.8% | +1.3 | 49.4% → 50.7% |

- **Mid-road deck, all 30 Map 21+ fights:** 64.8% with the Basic CPU → 64.7% with the Smartest (-0.1 points); 1 fights 10+ points harder, 2 10+ points easier.
- **Strong deck, all 30 Map 21+ fights:** 80.2% with the Basic CPU → 80.3% with the Smartest (+0.1 points); 1 fights 10+ points harder, 1 10+ points easier.

**Map 21+ fight by fight:**

| Fight | Kind | CPU | Mid: Basic → Smartest | Strong: Basic → Smartest | Strong sim |
|---|---|---|---|---|---|
| 21-1 Thaw Path | skirmish | Smartest | 80% → 77.5% | 90% → 75% | 75% |
| 21-2 Tarn Shore | skirmish | Smartest | 92.5% → 82.5% | 82.5% → 80% | 77.5% |
| 21-3 Cloud Ledge | skirmish | Smartest | 100% → 97.5% | 100% → 100% | 87.5% |
| 21-4 The Avalanche's Wake | elite | Smartest | 85% → 80% | 85% → 92.5% | 90% |
| 21-5 Snow Owl Parliament | elite | Smartest | 77.5% → 75% | 90% → 90% | 82.5% |
| 21-6 The Cathedral Eagle | boss | Smartest | 70% → 55% | 90% → 92.5% | 90% |
| 22-1 Snowmelt Switchbacks | skirmish | Smartest | 97.5% → 97.5% | 95% → 90% | 80% |
| 22-2 Steam Vents | skirmish | Smartest | 45% → 45% | 47.5% → 50% | 45% |
| 22-3 Frozen Lava Flow | skirmish | Smartest | 100% → 95% | 90% → 97.5% | 87.5% |
| 22-4 Hailstone Ridge | skirmish | Smartest | 90% → 90% | 100% → 100% | 100% |
| 22-5 The Geyser Field | skirmish | Smartest | 97.5% → 92.5% | 95% → 97.5% | 100% |
| 22-6 Ashfall Cornice | elite | Smartest | 90% → 87.5% | 95% → 90% | 95% |
| 22-7 The Steam Wall | elite | Smartest | 0% → 0% | 55% → 57.5% | 65% |
| 22-8 The Rimeheart Colossus | boss | Smartest | 47.5% → 42.5% | 100% → 100% | 100% |
| 23-1 The Picket Line | skirmish | Smartest | 55% → 52.5% | 55% → 45% | 60% |
| 23-2 Trench Works | skirmish | Smartest | 92.5% → 92.5% | 77.5% → 80% | 100% |
| 23-3 Elephant Road | skirmish | Smartest | 50% → 52.5% | 47.5% → 45% | 37.5% |
| 23-4 Siege Camp | skirmish | Smartest | 55% → 62.5% | 57.5% → 67.5% | 70% |
| 23-5 Under the Walls | skirmish | Smartest | 90% → 82.5% | 100% → 97.5% | 100% |
| 23-6 The Elephant Line | elite | Smartest | 30% → 32.5% | 70% → 67.5% | 80% |
| 23-7 The Barbican | elite | Smartest | 32.5% → 47.5% | 90% → 90% | 82.5% |
| 23-8 Marshal Tuskwell | boss | Smartest | 15% → 17.5% | 72.5% → 75% | 75% |
| 24-1 Breach the Gate | skirmish | Smartest | 47.5% → 52.5% | 90% → 85% | 90% |
| 24-2 The Bailey | skirmish | Smartest | 85% → 92.5% | 82.5% → 85% | 75% |
| 24-3 The Counting House | skirmish | Smartest | 37.5% → 50% | 77.5% → 80% | 75% |
| 24-4 The Courtyard Fountain | skirmish | Smartest | 95% → 92.5% | 87.5% → 85% | 82.5% |
| 24-5 The Battlements | skirmish | Smartest | 40% → 42.5% | 67.5% → 82.5% | 55% |
| 24-6 The Gilded Guard | elite | Smartest | 100% → 100% | 97.5% → 100% | 95% |
| 24-7 The Treasury | elite | Smartest | 30% → 32.5% | 60% → 55% | 37.5% |
| 24-8 The Magnate Duck | boss | Smartest | 15% → 20% | 57.5% → 57.5% | 42.5% |

**Map 5–20, the Smart CPU's fights** (elite, boss and the like; ordinary skirmishes there stay Basic), Strong deck:

| Map | Fights | Basic → Smart | Change |
|---|---|---|---|
| 5 Gatorback Swamp | 3 | 70.8% → 70.8% | +0.0 |
| 6 Sable Swampmire | 4 | 66.9% → 66.9% | +0.0 |
| 7 The Morel Hollow | 2 | 32.5% → 32.5% | +0.0 |
| 8 Caves & Alcoves | 2 | 56.2% → 56.2% | +0.0 |
| 9 The Kelp Mangroves | 3 | 42.5% → 42.5% | +0.0 |
| 10 Coral Current | 4 | 29.4% → 29.4% | +0.0 |
| 11 Eyrie Heights | 6 | 59.6% → 59.6% | +0.0 |
| 12 The Briar Maze | 3 | 50.8% → 50.8% | +0.0 |
| 13 The Redwood Deep | 4 | 23.1% → 23.1% | +0.0 |
| 14 Savanna Reaches | 4 | 68.1% → 68.1% | +0.0 |
| 15 The Long Grass | 3 | 54.2% → 54.2% | +0.0 |
| 16 The Pinewood Taiga | 3 | 60.8% → 60.8% | +0.0 |
| 17 Wolfsbane Tundra | 4 | 44.4% → 44.4% | +0.0 |
| 18 The Glass Dunes | 3 | 67.5% → 67.5% | +0.0 |
| 19 Ashen Spurn | 4 | 63.8% → 63.8% | +0.0 |
| 20 The Sundered Peak | 6 | 77.9% → 77.9% | +0.0 |
| 19-A Basalt Foundry | 4 | 66.9% → 66.9% | +0.0 |
| 10-A The Sunken Depths | 2 | 85.0% → 82.5% | -2.5 |
| 7-A The Mycelium Deep | 3 | 85.0% → 85.0% | +0.0 |
| 14-A The Canopy | 2 | 60.0% → 60.0% | +0.0 |
| 20-A Eye of the Volcano | 7 | 77.1% → 77.1% | +0.0 |
| 20-B Volcano Lair | 1 | 52.5% → 52.5% | +0.0 |
| 5-A The Sunken Grove | 1 | 95.0% → 95.0% | +0.0 |
| 8-A The Glimmer Depths | 1 | 100.0% → 100.0% | +0.0 |
| 11-A The Aerie Vault | 1 | 62.5% → 62.5% | +0.0 |
| 17-A The Ice Hollow | 1 | 90.0% → 90.0% | +0.0 |

All 81: 61.5% → 61.4% (-0.1 points). The Smart CPU plays exactly like the Basic one unless the fight has field rules it reads (darkness, Sun-shy / Night-blind sight, the Tide, wind, Landslide) or a field card in its hand: checked game by game on 5-5, 10-6 and 21-1 (levels 0 and 1 made identical moves in 10 of 10 games; level 2 differed in all 10). Few Map 5–20 fights have those rules, so Smart there is the old CPU in practice.

**What it means for Map 21+:** the Smartest CPU does not make Map 21+ harder on the whole for these decks (your win rate moves -0.1 points for the Mid-road deck and +0.1 for the Strong one). The biggest single swings: harder Strong 21-1 Thaw Path 90% → 75%, Mid 21-6 The Cathedral Eagle 70% → 55%; easier Strong 24-5 The Battlements 67.5% → 82.5%, Mid 23-7 The Barbican 32.5% → 47.5%, about what 40 games and a different line of play can give. Turning the CPU's aim on at all (sim → Basic) moves fights about as much as the level does.

Read with care: 40 games a fight, the engine plays your side, and the Strong deck is built from every card in the game, so it beats most fights whatever the CPU does; the Mid-road deck (Base plus map rewards up to Map 9) is the one that shows a harder CPU. Data: `docs/balance/cpu-levels.jsonl`, one line per fight; re-run with `node tools/cpu_levels.js 40` after deleting it (about 20 minutes on two cores).

Re-run: `node tools/card_balance.js 40` (about 10 minutes on two cores); `docs/balance/card-balance.json` is that run after this pass, and each row now carries its budget v3 check.
