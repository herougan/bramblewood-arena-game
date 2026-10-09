# How to tune a skirmish (2026-10-09)

Everything here happens in the game. Turn on Admin Mode, open Conquest, pick a fight, then 🛠️ Edit skirmish.

## The target

Each fight aims at a win rate for **a new player's likely deck**: the Base cards, plus every card won in earlier fights.

| Fight | Target |
|---|---|
| First skirmish on a map | ~85% |
| Last skirmish on a map | ~60% (the ones between step down evenly) |
| Elite | ~45% |
| Boss | ~35% |
| Raid boss | ~20% (tuned in the Raid editor) |

## The tools in the editor

- **📊 Simulate 200 vs my deck.** How *your* current deck does. It's useful for feel, but your deck is usually far stronger than a new player's.
- **📊 vs a new player's deck.**
  - Runs 200 games with the deck a player would likely own here, and shows that deck.
  - Compare the result with the target shown.
- **🎯 Auto-tune Armour.**
  - Finds the Skirmish Armour (the blue bar over the castle) that brings the new player's deck closest to the target.
  - It isn't saved until you press Save.
  - If it says "too easy even at the top" or "too hard even with no Armour", change the enemy deck instead (below).
- **Check the whole map.** Fills the strip of chips under the tools, one per fight, coloured against each fight's target:
  - green is on target;
  - blue is too easy;
  - red is too hard.

## When Armour isn't enough

Change the enemy deck:
- **Too easy:** swap 2 copies of its weakest card for a stronger card that fits the map's theme. A card from a later map with the same theme works well.
- **Too hard:** do the reverse.

Then run Auto-tune Armour again. Keep at least 3 different cards so the fight has a recognisable plan.

## Whole campaign

`node tools/retune_all.js 60` re-measures every fight against the same targets and prints before → after. Options:
- `--apply` writes the changes.
- `--only=m2,3-2` limits the run to those maps or fights.
- `--borrow=m2:m7+mb` lets a map borrow themed cards from other maps.

The last full run's table is `docs/balance/retune-all.json`.

## Caveats

- The new-player deck ignores pack cards, so later maps are tuned a little easy for players who buy packs.
- The opponent and the "player" are both the game's AI. Real players play better, so treat ±10 points as on target.
