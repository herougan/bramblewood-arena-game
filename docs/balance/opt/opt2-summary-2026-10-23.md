# Deck optimizer OPT2: Maps 0-3 (2026-10-23)

Package OPT2, owner 22:23 (OPT-1..3). Tools only: `tools/opt/deckopt.js` 2.0 and `tools/opt/phase2-rules.json`; nothing in the game changed.
Full per-map tables: `deckopt-summary-2026-10-23-opt2.md` (generated) and `deckopt-map0N-<id>-2026-10-23-opt2.json`. Search comparison:
`deckopt-compare-2026-10-23-opt2.md` (8000 games a method a map) and `deckopt-compare-2026-10-23-opt2-20k.md` (20000).

Run: `node tools/opt/deckopt.js --maps 0-3 --budget 16000 --workers 2 --tag 2026-10-23-opt2` (GA, your level 1), then the ladder stage
again with the final ladder code (`--resume --redo ladder`; the ladder has its own generator, so this equals a fresh run). Throughput,
2 workers on a shared machine (load 3-14 from other agents' browser tests): 99 / 141 / 115 / 189 games/s on Maps 0 / 1 / 2 / 3, 3-4.5
minutes a map for the search and the final, plus about a minute for the ladder.

## 1. Phase 2: the logic-filtered candidates (OPT-1 / OPT-2)

25, 25, 25 and 23 cards (cap 25; 54, 36, 32 and 23 qualified). Scores: biome 2, kin biome 1, a fight's terrain type 1, a unit type the
map's own cards share 1 each (max 2), the same animal group 1, a skill family the map's cards share 1 each (max 2), a family the field
rewards 1. Excluded on every map: a later map's leaders (5-6), showcased cards (2-3), boss-only cards (3-4), boss / ender rewards
(18-20, this map's included), challenge cards, strange cards, the unsorted / raid / materia / nest / smith buckets, and anything first
obtainable after Map 39 (a faction card waits for its rarity's gate: Rare Map 14, Heroic Map 30).

- **Map 0** (meadow, Mist, Open Meadow): Fire Ant Raft 6, Mountain Hare 6, Pigeon Peon 6, Swamp Rabbit 6, Hawthorn Shieldbug 5,
  Leafcutter Gardener 5, Balloon Archer 5, Seed-cache Squirrel 5, Swift Fox 5, Stag Beetle 5, Border Collie 5, Pika Hoarder 5, Water
  Vole 4, Anvil Thrush 4, Buzzed Chipmunk 4, Fungus Gnat Cloud 4, Pill Bug 4, Robin Redbreast 4, Shellwright Apprentice 4, Springtail
  Hopper 4, Bombardier Beetle 4, Nightjar Drifter 4, Millipede Hauler 4, Dhole Runner 4, Cunning Vixen 4.
- **Map 1** (meadow, day / night, Old Woods): Lemming Swarm 6, Water Vole 5, Fire Ant Raft 5, Fungus Gnat Cloud 5, Leafcutter Gardener 5,
  Balloon Archer 5, Mountain Hare 5, Swamp Rabbit 5, Moon Jerboa 5, Pika Hoarder 5, Amber Cicada 4, Garden Tiger Moth 4, Woodcock
  Lookout 4, Bombardier Beetle 4, Millipede Hauler 4, Dhole Runner 4, Seed-cache Squirrel 4, Werebadger 4, Box Turtle 3, River Mink 3,
  Hawthorn Shieldbug 3, Leopard Slug 3, Pill Bug 3, Red-backed Salamander 3, Robin Redbreast 3.
- **Map 2** (coast, Tide, Tideline): Limpet Clinger 7, Harbor Seal 7, Puffin Diver 6, Rock Pool Starfish 6, Grotto Lobster 6, Mudflat
  Godwit 6, Whale Shark 6, Krill Swarm 6, Kittiwake Flock 5, Sea Cucumber 5, Swordfish Spearman 5, Yellow-bellied Sea Snake 5, Beluga 5,
  Arctic Tern 5, Fulmar Spitter 4, Razorbill 4, Giant Clam 4, Horseshoe Crab 4, Oystercatcher 4, Proboscis Monkey 4, Banded Sea Krait 4,
  Muskrat Lodgekeeper 3, Lionfish 3, Sea Hare 3, Ghost Crayfish 3.
- **Map 3** (cliffs, wind, High Crags): Alpine Swift 6, Stonedrop Vulture 6, Eagle-Owl Quartermaster 5, Fumarole Ibex 5, Hummingbird
  Needler 4, Apollo Butterfly 4, Sunspire Envoy 4, Swordbill Challenger 4, Sunspire Sky-Sovereign 4, Alpine Salamander 3, Anvil Thrush 3,
  Marsh Harrier 3, Oystercatcher 3, Robin Redbreast 3, Mudflat Godwit 3, Alpine Marmot 3, Mountain Hare 3, Field Crow 3, Thorn Shrike 3,
  Skull Vulture 3, Arctic Tern 3, Pika Hoarder 3, Snow Leopard 3. (Flyers relate through the wind, the "arrows on an arrow map" rule.)

## 2. The optimum at Level 1

| Map | optimum score [95%] | map cards only | candidates in it | fight decks below it (Elo) |
|---|---|---|---|---|
| 0 | 96.9% [95.4, 98.3] | 94.0% | 3x Bombardier Beetle (+2.9 pts) | 470 to 842 |
| 1 | 94.9% [93.3, 96.5] | 92.2% | 4x Pika Hoarder, 1x Lemming Swarm (+2.7) | 394 to 597 |
| 2 | 95.1% [93.6, 96.6] | 93.3% | 2x Grotto Lobster (+1.8) | 597 to 842 |
| 3 | 93.6% [92.1, 95.2] | 85.0% | 3x Stonedrop Vulture (+8.6) | 429 to 842 |

With the candidate list, phase 2 adds 2-9 points (it was 1-23 with every obtainable card). Every fight deck on Maps 0-3 is at least
~400 Elo below the Level 1 optimum, so even the ladder's 600 rung is as hard as or harder than the hardest fight of these maps. Note the
Map 3 optimum is mostly owned cards (House Cat, Otters, Ants) plus Stonedrop Vultures: the strongest deck is not a cliff-themed one; the
map's own birds are weak at Level 1.

## 3. Distinct optima (OPT-3: "Idk if its possible to find multiple local maxima")

Yes. Each map has 3-4 decks within 10 points of the best and 7-15 copies apart. On Maps 0 and 1 the runners-up are as strong as the
optimum head to head (Map 0: #1 at 7 copies apart beats the optimum 51.6%; Map 1: #1 and #2 at 7-8 copies apart, 44-49%), so the
landscape has several near-equal peaks. The farthest ones (15 copies apart, Maps 0, 1, 3) are clearly weaker (25-31% against the optimum).

## 4. The difficulty ladder (Elo gap below the optimum, head to head under the map's fields; copies shared with the optimum of 20)

| Map | 600 | 450 | 300 | 150 |
|---|---|---|---|---|
| 0 | 597 [430, 763], 6 shared | 470 [349, 592], 10 | 283 [202, 363], 11 | 131 [67, 195], 14 |
| 1 | 597 [447, 747], 6 | 370 [283, 456] (nearest), 7 | 285 [212, 357], 10 | 103 [47, 159], 12 |
| 2 | 597 [447, 747], 8 | 436 [336, 537], 9 | 285 [212, 357], 14 | 158 [98, 217], 10 |
| 3 | 515 [411, 619] (nearest), 6 | 446 [358, 533], 6 | 299 [236, 362], 10 | 130 [81, 178], 18 |

14 of 16 rungs within 60 Elo of the target. With 128-224 games a rung the 95% interval is about ±60-170 Elo, so neighbouring rungs
(e.g. 300 and 450) are distinct, but 450 vs 600 is near the resolution limit. The 600 rungs needed the shared core relaxed to 6-8
copies (`--ladder-core-min`); the decks are in the JSON and the generated summary.

## 5. GA vs coordinate descent (equal game budgets, scored on independent seeds)

| budget a map | GA eval at 1/4 · 1/2 · all | descent eval at 1/4 · 1/2 · all | final decks head to head | distinct optima GA / descent |
|---|---|---|---|---|
| 8000 | 80.1 · 80.1 · **86.6%** | 80.1 · 84.7 · 85.1% | GA wins 3 of 4 maps (+38, +30, -44, +79 Elo) | 17 / 5 |
| 20000 | 80.1 · 88.8 · **90.3%** | 84.6 · 86.5 · 90.0% | GA wins 3 of 4 (+27, -4, +13, +41) | 20 / 6 |

Descent climbs faster at small budgets (5000 games: 84.6% vs 80.1%; it was clearly ahead on Map 1 both times) but stalls in local
maxima (7 of its 14 restarts ended at one; random restarts start near 40% and rarely beat the first climb). The GA reaches the same mean
quality at the full budget, beats descent's deck head to head on 6 of 8 map runs (by 13-79 Elo where it wins) and finds 3x more distinct
optima, which the ladder and skirmish designers can use. **Recommendation: keep `--method ga` as the default** (20000+ games a map);
use `--method descent` for quick runs of under ~6000 games. The eval interval is about ±2 points per map, so the quality difference
between the two is not significant; the head-to-head and the diversity decide it.

## Tests (as run)
- `node tests/opt2-2026-10-23.js`: 140 passed. `node tests/opt-2026-10-23.js`: 120 passed (updated for `--budget`, the ladder, `--redo`).
- `node tests/run.js --smoke`: 5 passed, 2 failed (`card-pass-2026-10-19`: 101 of 330 checks; `d-2026-10-19`: 72 of 76): reward / source checks on the
  merged batch; OPT2 changes none of their inputs (tools/opt, tests, docs only). Not re-run at the base commit.
