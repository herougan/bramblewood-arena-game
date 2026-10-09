# Action items

_Updated 2026-10-10, 12:20 am. The short list of what matters now. Everything else is in the other tabs._

## 1. Your calls

| ID | What | My suggestion |
|---|---|---|
| **B6** ⚠️ | The hummingbird starter deck beats the otter starter deck **~99%** of the time (all flyers, Diurnal, 2 copies each of 10 solid cards) | F: hummingbird Basics with 2+ Attack lose 1 Attack, otter 1-Attack fillers gain 1, Otter Guard and River Carp get **Reach** (ignores the Flying dodge). Measured ~47% |
| **D19** | Archetypes: Swarm, Tide, the Exile zone and the Forgotten Ones are built. What next? | Devilry circles |
| **T3 / S1 / S2** | Server: one-use fight seeds, admin player list, anti-cheat tier 1. Each waits for "apply it" | Apply all three |
| **C2** | The skirmish editor's battle type: a bug that reverts, or lock it after the first save? | Tell me which |

All 30 open items, with filters, are in the 🗳️ Decisions tab. Reply with the ID and your choice, e.g. "D19 Tide".

## 2. Where things stand

- **Card balance** (⚖️ Balance tab, [report](card-balance-2026-10-09.md)):
  - every card has a rarity and is measured in simulated matches;
  - two passes moved outliers half-way toward balance: 171 of 294 cards are now in band;
  - still out of band: Rares that are only Rare because the rarity pass was capped at Rare, walls and Lumber makers (a win-rate test can't value them), and the 3+ cost cards.
- **Big cards now come out:**
  - you chose Lumber from cards, not free income (B4);
  - 31 enemy decks with 3+ cost cards now carry their map's Lumber maker (Toucan Courier on the savanna, Coral Polyp Colony on the reef, Beaver Builders on the Tundra…);
  - enemy big cards now get played about half the time they're drawn (before: almost never);
  - players have Beaver Lumberjack (+2 Lumber) and Courier Pigeon (draw 1) from the start.
- **Day and night and fields** ([design note](fields-and-day-night-2026-10-09.md)):
  - Day and night alternate every 3 rounds; at dawn both sides draw. Nocturnal cards hit +1 at night, Diurnal by day.
  - Five field cards: Blizzard, Heatwave, Spring Rain, Thick Fog and Full Moon. They're free, take no play and draw a card.
  - Each field now has its own look on the board: rain, drifting fog, heat shimmer, moonlight.
- **Difficulty:**
  - every map was retuned for the new rules against a new player's likely deck;
  - bosses keep their namesake card (the Glacial Ape-King fights with its Ape-King);
  - the editor's tuning tools and the [tuning guide](skirmish-tuning-guide.md) are in place.
- **Archetypes:**
  - **Swarm** (ants and bees) is the first.
  - **Tide** (reef and beach) is new tonight. 🌊 Flow and 🐚 Ebb alternate each round: Tide units hit +1 on Flow and take 1 less on Ebb, and Wash pushes the enemy opposite back once. The water fights were retuned for it.
  - **The Exile zone and the Forgotten Ones** (new tonight): cards sent there give Echoes 🕯️; Remember cards come back once you have enough, +1/+1 per Echo. New cards: Echo Keeper, Marsh Wisp, Bog Revenant and The Unremembered.
- **Fixed tonight:** ten fights that were far too hard, including Map 1's boss (~5% → ~43%), the Thistle Baron (~12% → ~32%) and the Condor Sovereign (10-9).
- **Draggable map tiles** are in the layout editor.

## 3. Things only you can do (outside chat)

- **The claude.ai project is full.** Today's design notes are in this hub but couldn't be saved there. The old game-design v30–v40 addenda are the easiest to remove.
- **Supabase:** turn on leaked-password protection (Auth → Passwords, one click).
- **Art:** PixelLab credits or image API keys (A1). These cards use stand-in art or an emoji:
  - the five field cards, Beaver Lumberjack, Courier Pigeon, Echo Keeper, Marsh Wisp, Bog Revenant and The Unremembered;
  - Ant Warrior, the critters and the Grotto rewards.

## ⚠️ Earlier today

The live game failed to load from 09:10 to 10:12 (a broken line in the main script). It's fixed, and every release now passes a syntax check first.
