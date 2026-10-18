# Codex backlog review (2026-10-19)

I checked every Codex row against the engine, `canonical/cards.json` and the map data. The verdict for each row is in `codex-backlog-review-2026-10-19.xlsx` (sheets Maps, Skills, Field Effects). This is a review only: no game code or card data changed.

## How well it fits

It fits loosely. Codex wrote a general catalogue without seeing the game.

| Sheet | Rows | Exist | Adjust | Propose | Future | Dup | Reject |
|---|---|---|---|---|---|---|---|
| Skills | 303 | 125 | 8 | 8 | 28 | 111 | 23 |
| Fields | 77 | 19 | 5 | 3 | 22 | 21 | 7 |
| Maps | 22 | 11 | 5 | 4 | 1 | – | 1 |

- **Maps 0–20:** Codex's names and numbers match ours. It misses the side maps, Maps 21–24 and the hidden fights. Lilypad Reach is side map 2-A, Komodo Wallow is fight 18-6 and the Rimefire Caldera is Map 22. The White Waste is our old tundra name.
- **"Missing" ideas we already have:** collision damage (the Wave crash), forced movement (Wave, Tornado, Converge), Rockfall (Landslide), concealment (Tall Grass), and water with lightning (Wet).
- **Not our rules:** its Decay N, Molt N, Swift N, Forager N, Unearth and Burrow.

## Best ideas to build next

Each is one rule or one card skill:

1. **Spore Cloud** (field): one random unit a side Asleep for a round. Morel Hollow (7) elites and boss; it must respect the Sleep N+1 cap.
2. **Thunderstorm** (field): lightning hits one unit a side each round, and Wet units take more. Coral Current (10) or 10-A.
3. **Ash Rain and Ashy on Ashen Spurn (19):** placement only, as both already exist. It is the last map without a signature.
4. **Proliferate:** Poison jumps to a unit beside the target. Gatorback Swamp (5).
5. **Detonate Poison:** the hit deals the target's Poison as damage, then clears it. Maps 5–6.
6. **Executioner N:** +N against units below half Health. Wolves and hyenas, Maps 14–17.
7. **Field Breaker:** stops the weather for N rounds, so players can answer a field.
8. **Tangled Roots** (field): a random unit a side is Webbed, a counter to Wave cards. Kelp Mangroves (9).
9. **Brittle:** counts as Frozen for Shatter. Glass Dunes (18).
10. **Crab Trap:** Crab Claws +1 against Wet units. Maps 2 and 9. Its text must not say "Awash".

## Reject

- **Isolation and its counters:** they fight Lone Wolf.
- **Rescue Chain and Death Spiral:** loop and snowball risks.
- **Metal fields:** Metal is rare and no units use it.
- **Curse of Empty Hand, Curse of Misfortune and Cleansed Too Soon:** they feel bad and are hard to read.
- **Darkness on Sunken Hollow:** it is a flooded lowland, and Darkness is already taught at 2-B and Map 8.
- **Rotting Sands:** Poison stays in the swamps.
- **Name clashes:** we keep our own Evasive, Expose, Charge, Nullify, Renewal, Haunted and Dawn, and "Awash" stays Wave.

## rules.txt

**We already follow:**
- Triggers are primitives, not keywords.
- Bounty is unchanged.
- Played and spawned units are separate: tokens and summons fire **On Ally Spawn**, never **On Ally Played**.
- A unit's own death is not an ally death.
- A heal of 0 fires no trigger.
- Resource loops can't happen: nothing triggers on gaining resources.
- Revive is not a death.
- There is no elemental matrix.

**We differ on purpose:**
- Positioning already exists.
- Darkness is on Maps 8 and 2-B.
- Cure removes Poison only, and heals stanch Bleed only.

## Open questions for you

1. **Loop cap:** only the death sweep is capped (6 passes). Everything else stops on its own: "once" triggers, a full board, hand 5, the Darkness cap 10 and the 100-round draw. Do you want a trigger-chain cap? Codex suggests 5.
2. **Tokens:** tokens fire On Death and On Ally Die today, so brood swarms can flood triggers. Keep that?
3. **Esprit:** it counts Kin tokens as well as played cards. Keep?
4. **Simultaneous triggers:** they run in board order, and units dying in the same sweep don't see each other's On Ally Die. Make that a rule?
5. **Evasive:** Codex says it dodges skills only. Ours dodges half of attacks and skills. Which did you mean?
6. **Vestige:** is the leftover a spawn (On Ally Spawn, Ambush, Sentry), and does that death still pay Bounty and Darkness?
7. **Enemy graveyard exile:** our action only takes cards from the owner's own graveyard. Should enemy cards be exilable too?
8. **Costs:** each new skill above needs a cost under the trigger frequency × action strength formula.
