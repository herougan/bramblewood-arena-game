# Grab-bag randomness: analysis (2026-10-08)

Owner concept: replace 1/2 coin flips with a grab bag. Variant A: a 20-ball bag (10 hit, 10 miss). Variant B: a 100-ball bag per player (50 positive, 50 negative) shared by all that player's skills, plus one positive and one negative ball added back each turn.

## How chance works today

`bramblewood-engine.js` takes one `rnd` function per match (`makeSimEngine(defs, rnd)`). The app seeds it with `mulberry32` via `nextMatchRng()`; the tutorial uses a fixed seed. That **single stream** feeds everything: deck shuffles, AI play choices, random targets, interlock Left/Right picks, and every proc:

- Evade, Swift, Flying dodges: independent `rnd() < 0.5` each, stacking (Swift + Flying + Evade = 7/8 dodge).
- Crit: 1/2, max once per round. Paralyze: 1/2 skip. Reflect and on-hit Stun: arbitrary %. Illusory (raid): 2/3.

Fair but streaky, and not every roll is 50%.

## Simulation

`/tmp/bagsim.js`, 20,000 matches each, 60 rolls per player (15 turns x 4). "Hot start" = 9+ hits in the first 12 rolls; the column shows the hit rate for the rest of the match.

| Model | Avg longest streak | 6+ misses in a row | Match hit-rate spread (SD) | Rest of match after hot start | after cold start |
|---|---|---|---|---|---|
| Independent 50% (today) | 6.3 | 37% | 6.4 pts | 49.8% | 50.1% |
| 20-ball bag | 5.2 | 22% | 0 (60 = 3 full bags) | 43.7% | 56.3% |
| 100-ball bag per player | 6.0 | 36% | 4.1 pts | 46.2% | 53.9% |
| 100-ball bag + 1/1 per turn | 6.1 | 36% | 4.6 pts | 46.8% | 53.1% |
| (for reference) 6-ball bag | 4.0 | 2% | 0 | n/a | n/a |

## How each feels

- **Independent:** simple and swingy. 6+ misses in a row in over a third of matches; players call that "rigged".
- **20-ball bag:** fairer over a match, about 40% fewer long droughts, but 5-streaks still happen inside a bag.
- **100-ball shared bag:** barely different from coin flips (about 4 points of correction). The refill weakens it further by pulling the bag back to 50/50 each turn.

## Cross-skill effect (shared bag)

Real but small, with odd incentives:

- Frequent evades lower your crit odds a few points. Too small to feel, but easy to resent once known ("my evades steal my crits").
- "Positive" is ambiguous: an enemy dodge against you, whose bag? If the defender draws, your attacks drain the enemy's bag, so evasive decks quietly counter Crit decks. A hidden rule.
- Non-50% rolls (Stun %, Reflect %, Illusory 2/3) do not fit a 50/50 bag.

## Exploitability

- Small bags are countable ("3 misses left in 5"), so trackers can time key plays. Fine if the UI shows it, unfair if it does not.
- Shared bags let players "burn" bad balls on cheap chaff before a key fight. Weak at 100 balls, strong at 20.

## Determinism, replays, PvP

- Bags stay deterministic if shuffled with the seeded `rnd`, so replays still work.
- But the number and order of `rnd()` calls changes, so every seeded fight plays out differently. Re-check the tutorial seed (20261003).
- Per-player (or per-card) bags help PvP fairness: today one extra dodge roll shifts all later rolls for both sides.
- Ghosts and the Autobattler run the same engine with their own seeds; apply the change everywhere at once.

## Test impact

`tests/golden/card-matrix.json` holds 11,920 fight fingerprints (including `evaded` counts). Any bag variant diffs most fights with Flying, Swift, Evade, Crit or Paralyze. Treat it as intended: `node tests/card-matrix.js --update`, review a sample, and re-run `tools/difficulty_curve.js`, since Conquest was tuned on coin flips.

## Recommendation

Do not adopt the 100-ball shared bag. It costs complexity and a hidden cross-skill rule for almost no change in feel.

If streaks are the complaint, use **small per-card bags**: each card's 50% proc draws from its own 6-ball bag (3 hit, 3 miss), shuffled with the match `rnd`. Six misses in a row drops from 37% to about 2%, the rule is easy to explain ("evades 3 of every 6"), and there is no cross-skill coupling.

**Small first step:** add an engine option `opts.procBag` (off by default) and route only `evasiveGate()` through a per-card 6-ball bag. Goldens stay unchanged while it is off. Compare streaks and win rates with `tools/difficulty_curve.js` in both modes, then playtest one map before extending to Flying, Swift and Crit.
