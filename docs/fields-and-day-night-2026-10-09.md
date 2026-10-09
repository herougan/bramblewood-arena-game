# Fields, day and night, and Lumber from cards (2026-10-09)

**Your direction:**
- "I don't want giving too much free Lumber because it blows up Lumber costs. We can get cards to draw cards or gain Lumber another way."
- "I like the idea of day and night and other things like that — making the game more fluid — not every turn is the same."
- "Field effect card(s) like freezing."

**Status:** ✅ built and live. The experimental Lumber trickle is removed.

## Day and night

- **The cycle:** a fight alternates **Day** (rounds 1–3) and **Night** (rounds 4–6), and so on.
  - A badge next to the enemy deck shows the phase and the round within it (☀️ Day 2/3).
  - At night the battlefield dims.
- **Dawn:** the first round of each new day, both sides draw a card. This is the only "free" resource, and it's a card, not Lumber.
- **Nocturnal** (23 cards: owls, bats, raccoons, moths, glowworms…) hit +1 at night.
- **Diurnal** (19 cards: the Sunfeather hummingbirds, bees, eagles, toucans, sparrows) hit +1 by day.
- **Where it runs:** every fight except the tutorial and live ranked matches.
  - Live ranked will join once both players' games are checked to stay in step.
- **Where it lives:** `roundStart`, `getPhase` and `phaseBonus` in `bramblewood-engine.js`. Simulations, the skirmish editor and the map tuner all run it too.

## Fields

- **One field at a time.** A map can bring its own: Wolfsbane Tundra is fought on permanent **Frozen Ground**. A field card replaces it for a few rounds, then the map's field returns.
- **Field cards cost 0, are a free extra action, and draw a card.**
  - They don't use your play for the turn, but you can play only one a turn.
  - **Why:** in simulation, a field card that cost Lumber and used your play cut its deck from ~47% to ~30%, whatever the effect. Any card slot that isn't a unit is expensive in this format. As free actions that replace themselves, they come out roughly even (52–60%), with a small edge in the right deck (Thick Fog with flyers).

| Card | Field | Rounds | Effect | Where to get it |
|---|---|---|---|---|
| 🌨️ Blizzard | Frozen Ground | 4 | each round one random card on each side gets +1 Wait | Wolfsbane Tundra, 6-1 |
| 🔥 Heatwave | Heatwave | 3 | each round every unit takes 1 (heat-resistant spared) | Savanna Reaches, 5-1 |
| 🌧️ Spring Rain | Spring Rain | 3 | each round every unit heals 2 | Base card |
| 🌫️ Thick Fog | Thick Fog | 3 | every attack has a 1-in-3 chance to miss; Flying sees over it | Pebble Beach, Hermit Row (b-3) |
| 🌕 Full Moon | Full Moon | 3 | it stays night: Nocturnal +1 | Smugglers' Grotto, Smugglers' Stash (g-2) |

The computer plays a field card about half the time it holds one, as well as its normal play.

## Lumber and draws from cards

These replace the free income you didn't want.

- **🦫 Beaver Lumberjack** (Base, 0 cost, 1/4, Wait 1): gain 2 Lumber when played.
  - In simulation, 3 dragons alone win 38%; with 4 Beavers they win 82%.
  - This is how expensive cards become playable.
- **🕊️ Courier Pigeon** (Base, 0 cost, 1/2, Flying): draw a card when played. 3 Pigeons: 60%.

## What it did to difficulty

Day and night, the new tags and the new cards moved 56 of 96 fights more than 12 points off target, mostly harder: the bat-heavy caves at night, for example.
- I re-ran the whole-campaign retune: 72 fights were adjusted, and the rest kept as they were.
- Wolfsbane Tundra was too easy on Frozen Ground, so it was retuned with borrowed alpine cards.
- Its boss is still at ~80%, because its deck relies on 4-cost cards.

## Arena rules (2026-10-10)

**Your direction:** "Im thinking if the day night thing is normal, or if the skirmish always starts light or night. ... draw 1 per turn, draw 2 if you start 2nd. Gaining 1 lumber per three turns. All these are field effects. I'm thinking the arena mode changes rapidly."

- **Built:** every Arena fight that day (Quick Battle, Gauntlet, Pass & Play, PvP, Async) uses the day's rule set. The Arena tab shows it under "Today's Arena", and a pill shows it in the match.

| Rule set | Rules |
|---|---|
| 🌗 Standard | Day first, then night every 3 rounds |
| 🌙 The Long Night | Always night |
| ☀️ Midsummer | Always day |
| 🌆 Dusk Start | Night first |
| 🪵 Timber Fair | +1 Lumber to both sides every 3 rounds |
| ❄️ Frost Week | Frozen Ground all match |
| 🌫️ Fog on the Moor | Thick Fog all match |

- **Draws:** every set draws 1 a turn (as before), and whoever plays second opens with 1 extra card.
- **Live Ranked** plays Standard until lockstep is verified.
- **Conquest** is unchanged; a fight can set its own `rules` ({phase, lumberEvery, field}).
- **Engine:** `makeSimEngine(..., {rules})`.

## Ideas for later

- More fields: Rainstorm (Flying grounded), Earthquake (shuffle positions), Eclipse (no day/night bonus), Tailwind (Quick for everyone).
- Map-based phases: caves always night, Pebble Beach tides (the Tide archetype).
- Fields as rewards or modifiers for elite fights ("This fight is fought in fog").
