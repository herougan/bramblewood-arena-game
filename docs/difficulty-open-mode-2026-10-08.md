# Difficulty with Open fights (2026-10-08)

Conquest fights now default to **Open**: fixed slots, no collapsing. This re-runs the 2026-10-03 curve check under Open, next to the old Gravity numbers.

**How the numbers were made:**
- Command: `node tools/difficulty_curve.js 80 <faction> <mode>`.
- Each faction's 20-card starter deck, AI-piloted, played 80 seeded games against each skirmish deck.
- These are AI-vs-AI results, so read them for the **shape** of the curve, not exact human odds.

## Win rate with the starter deck only

| Skirmish | Castle HP | Otters, Gravity | Otters, **Open** | Hummingbirds, Gravity | Hummingbirds, **Open** |
|---|---:|---:|---:|---:|---:|
| 1-1 Otter Patrol | 16 | 94% | **96%** | 100% | **100%** |
| 1-2 Scorpion Ambush | 20 | 83% | **93%** | 98% | **99%** |
| 1-3 Raccoon Heist | 20 | 43% | **56%** | 70% | **84%** |
| 1-4 Frost Vanguard (boss) | 30 | 1% | **11%** | 13% | **18%** |
| 2-1 Reef Skirmishers | 26 | 3% | **34%** | 41% | **66%** |
| 2-2 Tidal Ring | 28 | 0% | **28%** | 16% | **54%** |
| 2-3 Cetacean Pod (elite) | 34 | 0% | **0%** | 13% | **8%** |
| 2-5 Drowned Colossus (boss) | 40 | 0% | **3%** | 5% | **13%** |
| 3-1 Badger Warband | 16 | 30% | **81%** | 56% | **95%** |
| 3-2 Quill Line | 16 | 20% | **61%** | 43% | **86%** |
| 3-4 Sky Marks (elite) | 44 | 3% | **53%** | 29% | **76%** |
| 3-6 Frost Yeti King (boss) | 130 | 0% | **0%** | 20% | **0%** |
| 4-1 Roost Flurry | 17 | 5% | **28%** | 15% | **34%** |
| 4-2 Glowworm Grotto | 40 | 3% | **38%** | 4% | **63%** |

From Map 5 on, a starter-only deck wins almost nothing in either mode. That is expected: by then a player has a collection and Forge levels, which this tool doesn't model.

## What changed

1. **Open is friendlier to the player on Maps 1–4.** Win rates rise by 10–50 points, because cards no longer slide into the centre to trade.
2. **Fights are shorter and closer.** They take about 2 fewer rounds. A player who wins keeps 12–25 castle HP instead of about 30, so fights feel tenser.
3. **Map 3 opens easier than Map 2 ends.** Badger Warband and Quill Line (16 HP each) now win at 61–95%, against 28–66% for Map 2's skirmishes. That is a dent in the curve: a new map should feel slightly harder, not easier.
4. **The Frost Yeti King (3-6) became a hard wall:** 0% for both factions in Open. Under Gravity, Hummingbirds won 20%. It has 130 castle HP, against 44–45 for the elites before it.
5. **The first boss, Frost Vanguard,** is 11–18% with the starter deck alone. The three skirmishes before it give reward cards, so a real player arrives stronger. That still looks right for a first boss.

## Suggested tweaks (not applied; decision **B1**)

- **Smooth Map 3's start:**
  - Raise Badger Warband and Quill Line to about 22 castle HP.
  - Or move them before Map 2's elites.
  - Simulated target: about 55–70% with the starter deck.
- **Soften the Frost Yeti King:** 130 → about 90 castle HP, or give its node `battleMode: 'gravity'` as a "collapsing" special fight. Collapsing as a special rule fits your earlier call: "Collapsing is special."
- **Re-check later maps with a realistic deck:** extend the tool to give the player the reward cards of every earlier skirmish, plus average Forge levels, before tuning Maps 5–11.
