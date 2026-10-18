# The Pale Desert: side map 18-A (package PD, 2026-10-18)

Owner (20:55): "Add the submap that we and codex suggested, the pale desert. Locked till Map 18 is complete."

## The map

- **Where:** a side map of Map 18, The Glass Dunes (map id `mpd`, fight codes 18-A-1 to 18-A-9). Its entrance, "The pale sands", sits on the Glass Dunes after their last fight (18-7). It stays locked until **every** Map 18 fight is won (`entry.afterMapCleared: "md"`). Until then it shows the standard locked emblem with the line "The pale sands — Clear The Glass Dunes (Map 18) to open". A save that has already fought there keeps it open, as with every side map.
- **Identity:** an open, bleached, bone-white sand sea under a white sun. The themes are heat, thirst, mirages, sandstorms and quicksand. The Glass Dunes are glass and obsidian; the Pale Desert has neither: no glass or obsidian cards, no Glass-storm, no cacti.
- **Field rules:** only existing rules are used, so nothing new went into the engine.

  | Rule | What it does | Used on |
  |---|---|---|
  | Scorching, level 1 or 2 (`field: heatwave`) | The white sun: each round 2 or 3 random units a side take 1 or 2 fire damage. Dry and heat-resistant units are spared. | every fight |
  | Sandstorm | Attacks at units miss 1 in 4, except from Dry units. The wind is random each round. | 18-A-3, 18-A-4, 18-A-7, the elite |
  | Mirage | Each round a random unit gets a 1/1 Illusion beside it. | 18-A-2, 18-A-6, the boss |

  Quicksand lives in the boss's own card: the Quicksand Queen's Trap and Tangle. Thirst is in the flavour (the Dry Well, the Last Oasis). No new field effect was needed.
- **Trail:** 18-A-1 → 18-A-2 and 18-A-3 (two branches) → 18-A-4 → 18-A-5 → 18-A-6 and 18-A-7 (two branches) → 18-A-8, the elite → 18-A-9, the boss.
- **Bramble:** each fight uses the plain enemy bramble with the Shield rule for Map 18: skirmish 18, elite 27, boss 54. No overrides were needed. The boss defends **The Last Oasis**, a new bramble (🌴, 22 Health, Rare, Regeneration 1, `unlockMap: "mpd"`), and its first win gives it to you, as the Logjam does on Lilypad Reach.
- **Rewards:** each fight gives a card on its first clear (below), plus Gold and Dust: 90/11 rising to 140/16 for the skirmishes, 180/25 for the elite and 240/35 for the boss. Egg drops, the boss's free Base copy and the S-rank spare bramble all follow the usual rules by kind.
- **Look:**
  - a procedural pale-sand background (`tools/make_map_backgrounds.py mpd` → `art/maps/mpd.png`): bone-white dunes, salt pans, skulls and ribs, dark quicksand swirls and a white glare;
  - the battlefield class `map-mpd`, with a gradient fallback and a scene layer: a white sun's glare that breathes slowly, and two heat-haze bands;
  - the map theme `map-theme-mpd`;
  - its own emblem on the Glass Dunes: a white sun over a dune with a horned skull;
  - the map view's ambience (`FX.E` `paledesert`, with a sand-gust B look), the heat-shimmer shader and decor of rocks, bones and dry tufts with a vulture;
  - the desert music and ambient sound.

## The fights

The fights were measured with `simulateReferenceFight` (the same function `tools/skirmish_pass.js` and the editor's win-rate panel use). The player side is the **Map 18 reference deck** at Lv 4 (a side map counts as its parent): 4× Burrow Rabbit, 4× Boar Rampager, 4× Bramblewood Lynx, 4× Nautilus Drifter, 3× Lone Grey Wolf, 1× Crimson Recruit. The table gives 120 games on the standard seeds (9100) and 120 on fresh seeds (5100). They are stored in `docs/balance/pale-desert-2026-10-19.json`; re-measure with `node tests/pale-desert-2026-10-19.js --measure`.

The curve is the owner's new one: the skirmishes, in trail order, run from 90% down to 60%, the elite sits on the same line, and the boss is about 40% (band 30–49%). A fight is green within ±8 points.

| Code | Kind | Fight | Rules | Enemy deck | Card reward | Target | Win (9100) | Fresh (5100) |
|---|---|---|---|---|---|---|---|---|
| 18-A-1 | Skirmish | 🦴 Bleached Flats | Scorching 1 | 2 Sandfish, 2 Dune Jackal, 4 Caustic Scorpion, 3 Thorny Devil, 1 Meerkat Sentry, 2 Roadrunner Courier, 1 Dune Jackal Scout, 1 Sand Widow | **Sandfish** (new) | 90% | **90.0%** | 89.2% |
| 18-A-2 | Skirmish | 🐕 Mirage Jackals | Scorching 1, Mirage | 3 Dune Jackal, 2 Dune Jackal Scout, 2 Rabid Jackal, 1 Sandfish, 2 Fennec Fox, 2 Moon Jerboa, 3 Caustic Scorpion, 2 Dust Hyena | Rabid Jackal | 86% | **91.7%** | 90.8% |
| 18-A-3 | Skirmish | 🌪️ Dust Devils | Scorching 1, Sandstorm | 1 Dust-devil Kestrel, 2 Sandstorm Roc, 2 Roadrunner Courier, 2 Horned Lizard, 4 Caustic Scorpion, 2 Armadillo Guard, 1 Sand Widow | Dust-devil Kestrel | 81% | **79.2%** | 85.8% |
| 18-A-4 | Skirmish | 🕳️ Meerkat Warrens | Scorching 1, Sandstorm | 3 Meerkat Burrower, 3 Meerkat Sentry, 3 Fennec Fox, 3 Caustic Scorpion, 4 Sand Widow | Meerkat Burrower | 77% | **75.0%** | 75.8% |
| 18-A-5 | Skirmish | 🪶 Vulture Road | Scorching 2 | 2 Stonedrop Vulture, 2 Skull Vulture, 3 Dust Hyena, 1 Rabid Jackal, 2 Caustic Scorpion, 3 Sand Widow | Stonedrop Vulture | 73% | **70.0%** | 73.3% |
| 18-A-6 | Skirmish | 🧂 The Salt Pan | Scorching 2, Mirage | 1 Glowing Gecko, 2 Horned Lizard, 3 Sandfish, 3 Caustic Scorpion, 3 Thorny Devil, 1 Sand Widow | Glowing Gecko | 69% | **66.7%** | 75.8% |
| 18-A-7 | Skirmish | 🦌 Oryx Crossing | Scorching 2, Sandstorm | 3 Pale Oryx, 2 Dromedary, 2 Dune Jackal Scout, 2 Meerkat Sentry, 2 Sandstorm Roc, 2 Armadillo Guard, 1 Caustic Scorpion | **Pale Oryx** (new) | 64% | **59.2%** | 69.2% |
| 18-A-8 | Elite | 🪣 The Dry Well | Scorching 2, Sandstorm | 4 Dust Hyena, 2 Komodo Warlord, 4 Sand Widow, 2 Pale Oryx, 2 Antlion Pit, 1 Dust-devil Kestrel, 2 Thorny Devil | Dust Hyena | 60% | **60.8%** | 58.3% |
| 18-A-9 | Boss | 👑 The Quicksand Queen | Scorching 2, Mirage | 1 Quicksand Queen, 3 Antlion Pit, 2 Sand Widow, 4 Caustic Scorpion, 3 Pale Oryx, 2 Sandfish, 2 Horned Lizard, 1 Glowing Gecko | **Quicksand Queen** (new) + The Last Oasis | 40% (30–49) | **41.7%** | 43.3% |

All nine fights are green on the standard seeds. On the fresh seeds 18-A-2 (+5), 18-A-3 (+4) and 18-A-6 (+7) are still inside ±8, and 18-A-7 (+5) too. The curve falls along the trail: no fight is more than 2 points easier than the one before it.

**What the tuning found:**
- The heat is the strongest lever by far. Most of the reference deck isn't Dry, while most desert cards are, so Scorching works one way. The boss at Scorching 3 won 0%; at Scorching 2 it is 42%.
- Caustic Scorpion (Poison 2, Thorns 1, Dry) is the strongest desert card against this deck. One more or one less in the elite swung it by 15–20 points, so the elite uses Thorny Devils for its last step instead.
- Every enemy deck is 13–18 cards of Commons to Rares, with one Very Rare (the Queen) in the boss. All are inside Map 18's rarity caps.

## New cards

None has art yet; each card shows its emoji until art arrives. The NightCafe prompts are in each card's `creatorNote` and repeated here. Each card's skills stay "?" until Map 18 is cleared (`revealAfter: {map: "md"}`). They then read in full, which is when the Pale Desert opens. Budget v3 uses `canonical/skill-costs.json`. The win rates are from `tools/card_balance.js`, 40 games.

| Card | Rarity | Lumber / Wait | Stats | Skills | Budget v3 (2A+H+S < N; A·H+S < (N/3)²) | Card win rate | Art to generate |
|---|---|---|---|---|---|---|---|
| 🦎 **Sandfish** | Common | 1 / 1 | 3/11 | Dry, Invisible 2 | 20 < 33.9; 36 < 127.7 | 57.5% (band 35–60) | a pale sand skink diving into a white dune |
| 🦌 **Pale Oryx** | Uncommon | 1 / 1 | 3/17 | Dry, Pierce | 25 < 34.9; 53 < 135.3 | 62.5% (45–68) | a white oryx with long straight horns in a heat haze |
| 🐜 **Quicksand Queen** | Very Rare | 1 / 2 | 3/28 | Dry, Trap 6, Tangle 1 | 40 < 44.4; 90 < 219 | 77.5% (56–80) | a huge pale antlion queen at the bottom of a sand funnel, white sun overhead |

The first stats were stronger. Sandfish at 0 Lumber won 100%. The Pale Oryx at 5/17 won 92.5%. The Queen at 2 Lumber with 6/30 won only 27.5%. Each was moved into its band before the fights were tuned around it.

The six other card rewards had no source, so nothing in the game gave them out: Rabid Jackal, Dust-devil Kestrel, Meerkat Burrower, Stonedrop Vulture, Glowing Gecko and Dust Hyena. Each now comes from one Pale Desert fight (its `creatorNote` says which). All six pass budget v3 unchanged.

The Last Oasis (bramble) has stand-in pixel art from `tools/make_pale_desert_art.py`. A NightCafe portrait (a small palm oasis on bone-white sand under a white sun) can replace it.

## Texts

- **TX keys:** the map's name, blurb and entrance label, and the nine fights' names and flavour, are 21 keys (`map.mpd-*` in `bramblewood-texts.js`). `applyPaleDesertTexts()` in `arena_app.js` writes them onto the map before the baseline copy.
- **Data literals:** the `CONQUEST_MAPS` entry keeps the English as literals, because the balance tools and the map tests evaluate that array without `TX`.
- **Translations:** all 12 packs have every text, the three card names (`lang/cards`), the cards' flavour, and The Last Oasis's name and flavour (`tools/i18n_2026_10_19_pale_desert.py`).
- The game-texts sheet files `map.*` keys under "Conquest map".

## Tools

- `tools/lib_bramble.js` and `tools/skirmish_pass.js` needed no change. They read every `CONQUEST_MAPS` entry, a side map counts as its parent (`nodeMapNumber`), and `skirmish_pass.js list` shows 18-A-1 … 18-A-9 with "deck road 18".
- `decks` keeps building the Road decks from main maps only, so the Pale Desert's rewards aren't in any reference deck. This matches the other side maps.
- `tests/node-ids-2026-10-14.js` now accepts side-map keys (`18-A-1`) on maps that never needed a rename.

## Files

- **Map and look:**
  - `arena_app.js`:
    - the map, between `// PALE_DESERT:BEGIN` and `END`;
    - `applyPaleDesertTexts`;
    - the battlefield class, art id, emblem, music, ambient sound, decor biome and scene layer.
  - `arena_template.html`: the theme, the floor fallback, the sun and haze.
  - `bramblewood-fx-e.js`, `bramblewood-fx-g.js` and `bramblewood-shaders.js`: the ambience, the title theme and the shader kind.
  - `assemble_arena.py`: bakes in the `mpd` art.
- **Art tools:**
  - `tools/make_map_backgrounds.py`: the `mpd` painter;
  - `tools/make_pale_desert_art.py` (new): the Last Oasis portrait.
- **Data:**
  - `canonical/cards.json`: three new cards and six placements;
  - `canonical/characters.json`: The Last Oasis.
- **Texts:**
  - `bramblewood-texts.js`: 21 TX keys;
  - `tools/text/textlib.py`: files `map.*` under "Conquest map";
  - `tools/i18n_2026_10_19_pale_desert.py` (new), `lang/*.json` and `lang/cards/*.json`.
- **Tests and data:**
  - `tests/pale-desert-2026-10-19.js` (new, in `run-all.sh`);
  - `tests/node-ids-2026-10-14.js`;
  - `tests/golden/card-matrix.json` (re-baselined);
  - `docs/balance/pale-desert-2026-10-19.json` (the stored measure).

## Decisions for the owner

1. **Art to generate (NightCafe):** Sandfish, Pale Oryx and Quicksand Queen (prompts above), and a portrait for The Last Oasis to replace the stand-in. A painted Pale Desert map background could also replace the procedural one.
2. **The six homeless cards placed here.** Two of them had other suggested homes in their notes: Dust-devil Kestrel "suggested: Map 28" and Glowing Gecko "suggested: Map 33". Moving either is a one-line `source` change, and its fight then needs another reward.
3. **Quicksand as a field effect?** Quicksand lives in the boss's card for now (Trap and Tangle). If you want it on the field too, a simple rule could be "each round, one random non-Flying unit a side is Bound for 1 round". It would be a new engine rule with its own Codex row.
4. **Day and night:** the map has the normal day/night cycle. "Always day under the white sun" is one line (`MAP_DAYNIGHT.mpd = 'day'`), but it would make Nocturnal desert cards weaker here.
5. **The reference deck only.** The curve assumes the Map 18 reference deck (no packs, no side-map rewards). A player who has done other side maps will find it easier.
