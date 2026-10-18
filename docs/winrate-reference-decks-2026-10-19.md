# Win-rate panel: reference decks, 2026-10-19 (package W2)

Owner: "Sometimes checking the win-rate of a map hangs on skirmish 2 onwards. Does your comparison deck become stronger as we progress throughout the maps? It has to match progression. So for now, ill trust your guess, and we'll work on this next time."

This covers the skirmish editor's **"This map, new-player win rate:"** panel. Each pill is one fight on the map, shown with its own icon (🐌 🐝 🦝 🦊 on your map). The pills are not decks. Every pill is played by one comparison deck, the **reference deck** for that point of the road.

## Short answers

- **The hang.** A fight whose deck names a card the game doesn't know threw an error inside the engine (`costOfCard`). The card might have been deleted, renamed, or made in another browser. The check's loop had no catch, so the button stayed on "Checking 2/4…" and never came back.
  - Now each fight runs on its own. A broken fight shows **"!"**, and hovering it gives the reason (for example "its deck names cards the game doesn't know (x)"). The check then moves on to the next fight.
  - There are also time limits:
    - a game ends at 100 rounds or 3 s;
    - a fight stops after 12 s, and its pill says how many games it got;
    - a map stops after 90 s, and the fights left over show **⏱**. Click again to carry on; finished fights are kept.
  - The check pauses every ~40 ms so the counter moves and the editor stays usable.
- **Did the comparison deck get stronger along the road? No.** The panel used `expectedPlayerDeck`: the 20 top cards by stat score. That is all 0-Lumber chaff, and it stops improving after Map 3. It also played at *your own* card levels, with a CPU that didn't aim, against the enemy deck at its printed level. So it never matched `tools/skirmish_pass.js`.
- **Now it does.** The panel, the editor's "📊 vs a new player's deck" and "🎯 Auto-tune Armour", and `tools/skirmish_pass.js` all play one function, `simulateReferenceFight` in `arena_app.js`, on the same seeds. The decks below grow map by map, and so do the card levels.

## The road curve: what green means (2026-10-19, package R2)

Owner (20:39): "The balance should be such that the constructed deck wins in the green zone for every map it's in. Maybe if there are 10 skirmishes, it starts at 90%, and drops to 60%. Then at the boss fight, <50%. (The deck consists of cards earned from the previous map)."

The panel's pills are now coloured against this curve (`roadCurveTarget` / `skirmishTargetBand` in `arena_app.js`). On each main map, and each side map, the fights go in road order:

| Fight | Target | Green |
|---|---|---|
| The fights before the boss (skirmishes **and elites**) | a straight line: **90%** for the first, down to **60%** for the last one before the boss. An elite sits on the line at its place. | target ±8 points |
| A boss or mini-boss that isn't the map's last fight (20-9 The Ancient Sloth Titan) | **50%** | 42–58% |
| The map's boss fight: its last fight, whatever kind the game gives it (an elite on Maps 1–4, a mini-boss, a boss, the Map 20 world boss) | **40%**; Map 0's Frost Vanguard **45%** | **30–49%** (the owner's "<50%") |

- **Green** is inside the band. **Blue** is above it (too easy). **Red** is below it (too hard). The pill's tooltip gives the target, the band and the fight's place, for example "target ~75% (green 67–83%, fight 3 of 5 before the boss)".
- **Example:** Map 3 has six fights before its boss. They go 90, 84, 78, 72, 66, 60%, and the boss is 40%.
- **Not on the curve:** the Tutorial (untouched), its come-back-later fights T-2 to T-4, The Old Bramble, the Eye of the Volcano (20-A), the Volcano Lair (20-B), the endless dungeons and the Babel Spire. They keep the older targets (skirmishes 85% → 60%, elites 45%, bosses 35%, green ±12).
- The 2026-10-19 retune against this curve is `docs/road-curve-2026-10-19.md`.

## The reference player (my guess, documented so it can be changed)

| | Assumption |
|---|---|
| **Card pool** | Base cards plus every reward of every earlier **main** map. Side-map rewards and packs are not counted. This is the "new player" who clears the road and opens no packs. |
| **Deck** | 20 cards, at most 4 copies, and fewer for higher rarities (Very Rare 3, Epic 2, Legendary/Unique 1). Built by `node tools/skirmish_pass.js decks`:<ul><li>cards are ranked by their card-pass win rate;</li><li>Lumber makers go in when the deck needs them;</li><li>a 40-step hill-climb keeps a swap only if it wins more on that map's own fights.</li></ul>So this is a player who builds a good deck from what they own. It is not a perfect one: 12 games a trial. |
| **Which map counts** | The map the fight *counts as* (`nodeMapNumber`): T-2 = Map 1, T-3 = Map 8, T-4 = Map 18, the Old Bramble = Map 17, and a side map = its parent. Past the last built map (24), the Map 24 deck. The Babel Spire uses the last deck; it isn't modelled. |
| **Card level** | `referencePlayerLevel(map)`: the same level the road's skirmish CPU plays at (Lv 1 to Map 4, Lv 2 from Map 5, +1 every 5 maps), but never past the Forge's level gates (Lv 5+ opens at Map 16). Stats only move at Lv 1, 3, 6 and 9, so in practice:<ul><li>+10% to Map 9;</li><li>+20% from Map 10;</li><li>+30% from Map 25.</li></ul> |
| **Bramble / leader** | The plain 30-Health castle; no leader. |
| **The enemy** | As the game builds the fight:<ul><li>its road level (`levelledEnemyDeck`);</li><li>leader grants;</li><li>the map's bramble, with the Shield by rule;</li><li>the map's rules (day/night, Mist, Tide…);</li><li>endless floors +4% a floor;</li><li>the CPU at its real level with aiAim on.</li></ul>Your seat plays at Smart. |
| **Card stats** | The shipped cards plus live card edits. Never the viewer's own levels or enchantments (the old panel used them). |

### Decks by map

`WINRATE_REF_DECKS` in `arena_app.js` (one line, written by the tool) and `docs/balance/skirmish-pass-decks.json` (the report: pool size and score).

| Map | Lv | Pool | Deck |
|---|---|---|---|
| 0 | 1 | starter | 2× Duck Paddler, 2× Pond Trout, 1× Meadow Frog, 1× Otter Kit, 1× Otter Centurion, 1× Fleetfoot'd, 3× Honey Bee, 3× Silver Minnow, 3× Sparrow Chick, 1× Rabbit Kit (the 18-card Otter starter) |
| 1 | 1 | 54 | 4× Burrow Rabbit, 4× Crimson Recruit, 4× Riverwing Envoy, 4× Otter Guard, 4× Otter Centurion |
| 2 | 1 | 58 | 4× Burrow Rabbit, 4× Otter Guard, 4× Otter Centurion, 4× Meadow Frog, 4× Bee Drone |
| 3 | 1 | 63 | 4× Burrow Rabbit, 4× Otter Centurion, 4× Pelican Diver, 4× Hedgehog Scout, 4× Bee Drone |
| 4 | 1 | 70 | 4× Burrow Rabbit, 4× Otter Centurion, 4× Pelican Diver, 4× Bee Drone, 4× Gold-throated Acolyte |
| 5 | 2 | 78 | 4× Burrow Rabbit, 4× Otter Centurion, 4× Box Turtle, 4× Chipmunk Cavalry, 4× Courier Pigeon |
| 6 | 2 | 85 | 4× Burrow Rabbit, 4× Otter Centurion, 4× Courier Pigeon, 4× Pelican Diver, 4× Fleetfoot'd |
| 7 | 2 | 94 | 4× Otter Centurion, 4× Courier Pigeon, 4× Pelican Diver, 4× Rockslide Ram, 4× Meerkat Wayfarer |
| 8 | 2 | 103 | 4× Rockslide Ram, 4× Meerkat Wayfarer, 4× Gull Thief, 4× Mountain Goat Climber, 4× Migration Leader |
| 9 | 2 | 111 | 4× Crimson Recruit, 4× Otter Centurion, 4× Eagle Diver, 4× Rockslide Ram, 4× Mountain Goat Climber |
| 10 | 3 | 122 | 4× Crimson Recruit, 4× Nautilus Drifter, 4× Otter Centurion, 4× Tide Spirit, 4× Archerfish |
| 11 | 3 | 128 | 4× Crimson Recruit, 4× Nautilus Drifter, 4× Otter Centurion, 4× Archerfish, 4× Pelican Diver |
| 12 | 3 | 138 | 4× Nautilus Drifter, 4× Otter Centurion, 4× Archerfish, 4× Meerkat Wayfarer, 4× Eagle Diver |
| 13 | 3 | 150 | 4× Nautilus Drifter, 4× Archerfish, 4× Skunk Gasser, 4× Tide Spirit, 4× Quillguard |
| 14 | 3 | 161 | 4× Boar Rampager, 4× Crimson Recruit, 4× Nautilus Drifter, 4× Quillguard, 4× Pelican Diver |
| 15 | 4 | 172 | 4× Burrow Rabbit, 4× Boar Rampager, 4× Bramblewood Lynx, 4× Otter Centurion, 4× Tunnel Wyrm |
| 16 | 4 | 182 | 4× Burrow Rabbit, 4× Boar Rampager, 4× Bramblewood Lynx, 4× Crimson Recruit, 4× Nautilus Drifter |
| 17 | 4 | 191 | 4× Boar Rampager, 4× Bramblewood Lynx, 4× Crimson Recruit, 4× Nautilus Drifter, 4× Monitor Rambler |
| 18 | 4 | 196 | 4× Burrow Rabbit, 4× Boar Rampager, 4× Bramblewood Lynx, 4× Nautilus Drifter, 3× Lone Grey Wolf, 1× Crimson Recruit |
| 19 | 4 | 213 | same as Map 18 |
| 20 | 5 | 221 | 4× Burrow Rabbit, 4× Nautilus Drifter, 3× Lone Grey Wolf, 4× Quillguard, 1× Monitor Rambler, 1× Cinder Imp, 3× Millipede Hauler |
| 21 | 5 | 225 | 4× Burrow Rabbit, 4× Nautilus Drifter, 3× Lone Grey Wolf, 4× Quillguard, 1× Monitor Rambler, 1× Cinder Imp, 3× Spitting Cobra |
| 22 | 5 | 227 | 4× Burrow Rabbit, 4× Nautilus Drifter, 3× Lone Grey Wolf, 1× Cinder Imp, 1× King Maker, 3× Bramblewood Lynx, 4× Eagle-Owl Quartermaster |
| 23 | 5 | 231 | 4× Cinder Imp, 4× Burrow Rabbit, 4× Boar Rampager, 4× Bramblewood Lynx, 4× Squire's Mount |
| 24 | 5 | 236 | 4× Burrow Rabbit, 4× Boar Rampager, 4× Bramblewood Lynx, 4× Nautilus Drifter, 4× Crimson Recruit |

Maps 1–9 are the Road decks from the 2026-10-18 skirmish pass, unchanged. Maps 10–24 are new. The pass had used two fixed decks there:
- the curve's Mid-road deck on Maps 10–17;
- its Strong deck on Maps 18–24, which held pack cards (Owl Fletcher, Cave Bat Swarm, the Mystery Booster's Inside-Out Hedgehog) and a Map 19 reward (Puppeteer Imp) that a Map 18 player can't have.

The pass also played Lv 1 everywhere.

## Two fixes that came out of matching the tool

- **Map enders' kinds.** At load the game gives each main map's last fight its kind (`applyRoadKinds`):
  - Map 0: a skirmish;
  - Maps 1–4: an elite;
  - every 5th map: a boss;
  - every other map: a mini-boss.

  The tools read the kinds written in the source, so every map's last fight was measured with the wrong Shield, castle level, CPU level and boss enemy level. For example, 1-5 was measured as a boss; in the game it is an elite. `tools/lib_bramble.js` now applies the same step, so all the balance tools see the game's kinds.
- **The tool's leader grants** were commented out by accident, and a tool's trial copy of a fight fought at enemy Level 0. Both are fixed. A trial copy, like an editor draft, now finds its map through `NODE_MAP_HINT` in `roadEnemyLevel`.

## What the numbers say now

These are all 262 fights from the 2026-10-18 pass, measured over 60 games each. The full results are in `docs/balance/skirmish-pass-w2.jsonl`.

| Counts as map | Fights | Your deck | Level | Before (10-18 pass) | Now | Over 92% | Under 12% |
|---|---|---|---|---|---|---|---|
| 0 | 4 | Starter | 1 | 61% | 64% | 0 | 0 |
| 1 | 11 | Map 1 road | 1 | 61% | 61% | 0 | 0 |
| 2 | 9 | Map 2 road | 1 | 78% | 78% | 0 | 0 |
| 3 | 7 | Map 3 road | 1 | 77% | 78% | 0 | 0 |
| 4 | 5 | Map 4 road | 1 | 27% | 28% | 0 | 0 |
| 5 | 11 | Map 5 road | 2 | 67% | 67% | 0 | 0 |
| 6 | 19 | Map 6 road | 2 | 45% | 46% | 0 | 3 |
| 7 | 11 | Map 7 road | 2 | 39% | 41% | 0 | 0 |
| 8 | 13 | Map 8 road | 2 | 55% | 56% | 0 | 0 |
| 9 | 7 | Map 9 road | 2 | 40% | 43% | 0 | 0 |
| 10 | 14 | Map 10 road | 3 | 28% | 45% | 0 | 0 |
| 11 | 14 | Map 11 road | 3 | 55% | 80% | 5 | 0 |
| 12 | 7 | Map 12 road | 3 | 51% | 73% | 1 | 0 |
| 13 | 8 | Map 13 road | 3 | 29% | 75% | 1 | 0 |
| 14 | 13 | Map 14 road | 3 | 36% | 85% | 3 | 0 |
| 15 | 7 | Map 15 road | 4 | 46% | 84% | 2 | 0 |
| 16 | 7 | Map 16 road | 4 | 43% | 88% | 3 | 0 |
| 17 | 16 | Map 17 road | 4 | 52% | 93% | 11 | 0 |
| 18 | 8 | Map 18 road | 4 | 72% | 85% | 3 | 0 |
| 19 | 16 | Map 19 road | 4 | 62% | 83% | 5 | 0 |
| 20 | 21 | Map 20 road | 5 | 71% | 77% | 10 | 2 |
| 21 | 6 | Map 21 road | 5 | 86% | 99% | 6 | 0 |
| 22 | 12 | Map 22 road | 5 | 52% | 52% | 2 | 3 |
| 23 | 8 | Map 23 road | 5 | 55% | 79% | 3 | 0 |
| 24 | 8 | Map 24 road | 5 | 80% | 88% | 4 | 0 |

- **Maps 0–9 are unchanged.** The same decks and levels are used. The only moves are the map enders, now measured as the kind the game gives them, and they all got a little easier: 7-6 went 22% → 48%, 9-7 33% → 53%, 0-4 35% → 47%.
- **From Map 10 on, the road is much easier for this reference player:** 59 fights are now over 92% and 8 under 12%. Splitting the Maps 10–17 jump (20 games a fight):
  - old deck at Lv 1: 43%;
  - new deck at Lv 1: 68%;
  - new deck at its level: 78%.

  So most of it is the deck: a deck built from the rewards beats the old fixed Mid-road deck. The level adds about 10 points more.
- Nothing was retuned. The owner said "we'll work on this next time." `node tools/skirmish_pass.js tune --from=w2` would retune these outliers against the new reference player.

## Decisions for the owner

1. **Packs in the pool?** These decks assume no packs. A player who opens packs is stronger, so fights on target here are a little easier for them.
2. **Card level curve.** I chose "your level = the road CPU's skirmish level". If players really reach Lv 3 by Map 10, Maps 11–24 need to get harder (59 auto-winnable fights). If they don't, lower the curve: `referencePlayerLevel` in `arena_app.js` is one line, and the tool and the panel both follow it.
3. **How good a deckbuilder?** The decks are hill-climbed against each map's own fights, so they play like a player who builds well from what they own. A weaker "casual" reference would be the top cards without the climb.
4. **Side-map rewards** are not in the pool. A player who does the side maps has more cards.

## Files

- **`arena_app.js`:**
  - `WINRATE_REF_DECKS`, `referencePlayerLevel`, `referenceDeckFor`, `referenceFightSetup`, `playReferenceGame`, `simulateReferenceFight`;
  - the panel's `checkSkirmishCurve` / `runSkirmishCurveCheck` / `skirmishCurveChipHTML`;
  - the editor's "vs a new player's deck" and Auto-tune use the reference player;
  - `roadEnemyLevel` uses `mapOfNode`.
- **`arena_template.html`:** the "!" and ⏱ pill styles.
- **`tools/lib_bramble.js`:** reads the new functions, applies `applyRoadKinds`, handles `async function`.
- **`tools/skirmish_pass.js`:** uses the library and `simulateReferenceFight`. `decks --from --to` builds any range of maps and writes `arena_app.js` and the report.
- **`tests/winrate-panel-2026-10-19.js`** (in `tests/run-all.sh`, ~15 s): checks every fight on every map within a budget; a broken fight gets "!" and the check moves on; the budgets work; the late deck beats Map 0's deck (91% vs 4% on Maps 8 and 12); the panel matches the tool.
