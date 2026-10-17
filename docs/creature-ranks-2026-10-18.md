# Creature ranks: Dragons, Leviathans, Dragon-Turtles, Fiends (2026-10-18)

The request (2026-10-18 00:52): *"Add a legendary leviathan to the game. These 'leviathan' types are second in rank as Dragons. Add a unique balrog if not yet. third in rank. For the land... we have grand tortoises, but im not sure what name to give them, maybe Dragon-Turtles? also legendary, equal to leviathan's rank."*

## How rank works

Before this, nothing in the data said that Dragons outrank everything else. They were set apart only by being Legendary, Supreme, hidden and over the stat budget. Now a card can carry `creatureRank`:

| Rank | Family (the card's first type tag) | Cards today | Rule |
|---|---|---|---|
| 1 | Dragon | Red, White, Blue, Green and Black Dragon | The top. Legendary, Supreme, Flying, over the stat budget on purpose. |
| 2 | Leviathan, Dragon-Turtle | Fathom Leviathan, Grovebearer Dragon-Turtle | Legendary. Under the Dragons in stats and skills, over an ordinary Legendary. Within the stat budget. |
| 3 | Fiend | Ashmantle Fiend | Unique. Under rank 2. Within the stat budget. |

- The engine doesn't read the rank. It is a rule for whoever designs the next card of that family.
- The Codex card detail shows one line under the chips, built from the first type tag: "Rank: Dragon — first of the great beasts", "Rank: Leviathan — second only to Dragons", "Rank: Fiend — third, after Dragons, Leviathans and Dragon-Turtles" (`creatureRankText` in `arena_app.js`).
- The Caldera Wyrm (the Map 20 world boss, species Dragon) has no rank. It is a weaker boss-leader (6/36), so ranking it 1 would break the rule.
- Supreme stays on the families the earlier request named ("Dragons and Sphinxes are supreme beasts. Leviathans too"). The Dragon-Turtle doesn't have it.

## The three cards

Stat budget v3 at Level 1: N = 20 + 2L + Rarity + 6W + 0.5W² + 4·Lumber + 0.4·Lumber².

| Card | Rarity | Lumber / Wait | Atk / HP | Skills | Budget (2A+H+S vs N; A·H+S vs (N/3)²) |
|---|---|---|---|---|---|
| Red Dragon (for comparison) | Legendary | 4 / 5 | 10 / 44 | Supreme, Flying, Fire Arrow 4, Stun 1, Bounty | 103.5 vs 95.9: over (Flying ×1.5) |
| **Fathom Leviathan** 🌊 | Legendary | 4 / 4 | 9 / 40 | Supreme, Tide, Tsunami 2, Wave (alternate), Bounty 1 | 63 < 85.4; 365 < 810.4 |
| **Grovebearer Dragon-Turtle** 🐢 | Legendary | 4 / 5 | 6 / 48 | Sturdy, Regeneration 3, Guardian, Sprout 2, Tide | 68 < 95.9; 296 < 1021.9 |
| **Ashmantle Fiend** 👺 | Unique | 3 / 3 | 8 / 30 | Immolation 2, Shade, Scare 2 (fire damage, resists fire; Devilry line) | 51 < 68.1; 245 < 515.3 |

- **The Leviathan** uses the water systems: a Tide unit, Tsunami 2 on arrival (every enemy +1 Wait, 2 water damage to those that can't swim, the Tide comes in, which also feeds the Wet rule for shock), and Wave to shove what it hits. Supreme makes its hits magic and crushes Armor and shells.
- **The Dragon-Turtle** is the land's great tortoise: slow, armoured and old, with a wood on its back (Sprout 2). The name comes from old Chinese tales. Elder Tortoise, Old-Growth Tortoise and the other turtles keep their names.
- **The Fiend** is the volcano's fire-and-shadow demon, the "something bigger" the Ashen Choir sings for. It isn't called a Balrog or Balor: the Balrog is Tolkien's. No fire demon of this size existed before: the nearest were The Sixfold (Epic Devil, the Basalt Foundry boss's reward) and the imps.

## Where they come from

| Card | Source | Why it fits the rarity rules |
|---|---|---|
| Fathom Leviathan | The Goliath raid drops it (source `raid: goliath`, in the raid's card list) | Raids are outside the road rarity rule. The lore puts the deep things in raids, and the Goliath Broodmother (Legendary) already drops there. It isn't in a raid fight's deck. |
| Grovebearer Dragon-Turtle | 23-8 Marshal Tuskwell (the Goldfeather Siege): 1 in the boss deck and its second card reward, beside the War Elephant | A boss on Map 21+ may field and pay a Legendary. Map 23 already has the Testudo Tortoise. |
| Ashmantle Fiend | 20-A-4 Heart of the Mountain (Eye of the Volcano): 1 in the last door's deck and the dungeon's second card reward, beside the Contradiction | A Map 20 dungeon counts as a boss, and its cap is Unique. Map 19's bosses cap at Epic, so the Foundry couldn't take it. |

## Open decisions

1. **Dragon-Turtle placement.** No land or forest map past Map 20 exists yet, so it went to the Map 23 siege boss. The other option is to hold it back for a future forest map (25+), the way the Dragons wait for Map 50.
2. **Leviathan in a raid fight.** It only drops. It could also swim in the Goliath's Tail or Core fight, but as the strongest card there it would become that fight's boss unit (×1.5–3 Health), which needs a balance look.
3. **Supreme on the Dragon-Turtle?** It is equal in rank to the Leviathan but has no Supreme. It gets Sturdy (half damage from every hit) instead.
4. **Art.** All three show their emoji for now.
