# Action items

_Updated 2026-10-10, 9 pm. The short list of what matters now. Everything else is in the other tabs._

## 1. Your calls

| ID | What | My suggestion |
|---|---|---|
| **B6** ✅ | Your new basic set fixes it: otter starter vs hummingbird starter is **52.9%**. The per-card spread inside the set is wide (Duck Paddler 79% … Otter Kit 26%): see the [starter-decks note](starter-decks-2026-10-10.md) | Balance within the set (your pass) |
| **D20** | Devilry is built from your list. Six of the rules were my readings. **Darkness is gained:** +1 each time one of your units perishes, shown only if your deck has a Devilry card | Keep all six |
| **D23** ✅ | Ecclesia is built (Prayer, the offering, 6 keywords, 9 cards). Satiety's rule was my reading of the name | Check Satiety |
| **D21 / D22** | Backstab's rule (suggestion: +N vs a unit facing someone else); Fast Forward counters, build when? | Suggestion; after Ecclesia |
| **D24** | Arena rules rotate daily, and the second player opens with an extra card. Add that card to Conquest too? | Keep Conquest as is |
| **S1 👥** | Admin → Players (now with each player's tutorial level) is built and waits on the admin_list_players function | Say "apply it" |
| **D26** | Readings I took tonight: Anti-Air went on **Otter Centurion** (2/8), because on Otter Kit it broke the tutorial for Hummingbird players. "SSS fast" means a win by **round 8**. The rare S find starts at **map 5** at **12%**. Laurels (PvP) buy nothing yet | Keep, or say otherwise |
| **D27** | Readings from the 20:32 list: Sweep is now a cleave (N to each unit beside the target); "Trample" already existed as Overwhelm and is renamed **Stampede**; Bleed no longer hurts when hit; the CPU's new card choice moved Otters vs Hummingbirds starters to ~66% (your balance pass) | Keep, or say otherwise |
| **T3 / S1 / S2** | Server: one-use fight seeds, admin player list, anti-cheat tier 1. Each waits for "apply it" | Apply all three |

All 30 open items, with filters, are in the 🗳️ Decisions tab. Reply with the ID and your choice, e.g. "D19 Tide".

## 2. Where things stand

- **New tonight:** Caged Fight (Arena → Challenges), red top edges on opponent cards, the victory-shift fix, and the Codex reveal-as-you-go. Hearthstone ideas are in [their own note](inspo-hearthstone-2026-10-10.md).
- **Starter decks:** you're reorganising them. Every Basic is in [the list](starter-decks-2026-10-10.md), with suggestions (shared leader, 2 shared cards, rival cards as map 1–2 rewards).

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
  - **Devilry** (new): Dark Summons ⛧, Darkness ★ from perished units, Devour, Ritual, Pitchfork, Sacrifice, Offering, Beware, Scare and Desecrate, plus ten new cards (Cinder Imp, then the Basalt Foundry rewards).
- **Arena rules** (new): a different rule set every day (always night, always day, night first, Lumber every 3 rounds, Frost, Fog), shown on the Arena tab.
- **Draggable map tiles** are in the layout editor.

## 3. Things only you can do (outside chat)

- **The claude.ai project is full.** Today's design notes are in this hub but couldn't be saved there. The old game-design v30–v40 addenda are the easiest to remove.
- **Supabase:** turn on leaked-password protection (Auth → Passwords, one click).
- **Art:** PixelLab credits or image API keys (A1). These cards use stand-in art or an emoji:
  - the five field cards, Beaver Lumberjack, Courier Pigeon, Echo Keeper, Marsh Wisp, Bog Revenant, The Unremembered and the ten Devilry cards;
  - Ant Warrior, the critters and the Grotto rewards.

## ⚠️ Earlier today

The live game failed to load from 09:10 to 10:12 (a broken line in the main script). It's fixed, and every release now passes a syntax check first.
