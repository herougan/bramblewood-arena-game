# Field effects: one of its own per map (JJ18), Quicksand (JJ19), the wind (WIND-2), 2026-11-02

Package ENG16. Owner, 11-02 00:17 (asleep; "Decisions - you decide"):
- JJ18: "which maps lack a field effect or combo of their own; give each one (e.g. Aerie Vault: thunderstorm). Wind is too strong."
- JJ19: "new field effect Quicksand: a creature ending its turn under N Health dies."
- WIND-2 (a): Tailwind gives Flyers Quick, Headwind gives Flyers -1 Attack, no double triggers; odds stay 1/3 back, face, calm.

Decisions recorded: ENG16-1 (Quicksand), ENG16-2 (the map picks), ENG16-4 (the wind details) in `docs/decisions.json`.

## What counts
A map's field set is what every one of its fights has after `fightRules` (the map's tables, its `mapField`, and what all its nodes share), as in CONTENT4 (`tests/content4-2026-10-28.js`). Darkness and Pitch Black count as one family; Windy and Gale are different; Windfall comes with the wind on Maps up to 20. One-fight effects (a boss's own rule, a boon) do not count. Left out: the Tutorial (Map 0's own Mist) and the endless dungeons (owner call CONTENT4-2).

## The audit (before)
Maps that shared their set with another map:

| Set | Maps |
|---|---|
| Mist | Bramblewood Outskirts, **The Old Bramble** (and the Tutorial) |
| Undergrowth | Thistlewood, **The Long Grass** |
| Tide | Pebble Beach, **The Kelp Mangroves**, **Coral Current** |
| Windy + Windfall | Gannet Cliffs, **The Glass Dunes**, **Ashen Spurn** |
| Gale + Windfall | Eyrie Heights, **The Aerie Vault** |
| Swamp Fever | Gatorback Swamp, **The Sunken Grove** |
| High Canopy | The Redwood Deep, **The Canopy** |
| Arrow Slits | The Goldfeather Siege, **Goldfeather Keep** |
| Darkness | Smugglers' Grotto, **The Mycelium Deep**, **Caves & Alcoves** (Caves had Pitch Black on one fight and Landslide on three) |

Every other map already had a set of its own: Sunken Hollow (River Rapids), Sable Swampmire (Night), The Morel Hollow (Spore Cloud), Eyrie Heights and Gannet Cliffs (once their partners changed), The Briar Maze (Grasping Briars), Savanna Reaches (First Blood), The Pinewood Taiga (Frigid + Night), Wolfsbane Tundra (Frigid), The Sundered Peak (Windy + Volcano Glow), The Rimefire Caldera (Frigid + Volcano Glow), Clovermead (Thunderstorm), Lilypad Reach (Spring Rain + Tide), Basalt Foundry (Ashy), The Sunken Depths (Pitch Black + Crushing Depths), Eye of the Volcano (Scorched Ground + Volcano Glow), Volcano Lair (Sulphur Fumes), The Glimmer Depths (Mirage), The Ice Hollow (Slippery), The Pale Desert (Scorching). **The Quiet Summit** stays the one vanilla map (CONTENT4: "the storm has passed"); vanilla is its identity.

## The picks (built: `mapField` on each map in `CONQUEST_MAPS`)
Existing effects in new combinations; the only new effect is Quicksand (JJ19). The map that keeps the plain set is the earlier one (or the main map), so the partner gets the addition.

| Map | Was | Now | Why |
|---|---|---|---|
| The Old Bramble (side of 0) | Mist | Mist + **Tangled Roots** | the thorns older than the village: their roots |
| The Long Grass (15) | Undergrowth | Undergrowth + **Tall Grass** | on 2 fights already; the map's name |
| The Kelp Mangroves (9) | Tide | Tide + **Tangled Roots** | mangrove roots; on 2 fights already (package GI's intended home) |
| Coral Current (10) | Tide | **Perma-tide** (a standing Flood) | "fast currents"; Thunderstorm tried first (below) |
| The Glass Dunes (18) | Windy | Windy + **Quicksand** | the desert; JJ19's home |
| Ashen Spurn (19) | Windy | Windy + **Scorching I** | "scorched high ground"; a fight's own Ash Rain / Ashy stays |
| The Aerie Vault (side of 11) | Gale | Gale + **Thunderstorm** | the owner's example |
| The Sunken Grove (side of 5) | Swamp Fever | Swamp Fever + **Tide** | "the swamp swallowed an old forest ... up to their necks" |
| The Canopy (side of 14) | High Canopy | High Canopy + **Spring Rain** | the rainforest's rain |
| Goldfeather Keep (24) | Arrow Slits | Arrow Slits + **Bishop's Path** | the keep's slanted halls; Rook's Row tried first (below) |
| Caves & Alcoves (8) | Darkness | Darkness + **Landslide** | on 3 fights already |
| The Mycelium Deep (side of 7) | Darkness | Darkness + **Spore Cloud** | under the Morel Hollow |

Pinned by `tests/eng16-2026-11-02.js`: no two maps share a set; the Quiet Summit is the only vanilla map.

## Quicksand (JJ19, ENG16-1)
`rules.quicksand` N (true = 2). At the end of every round from round 2 (`endOfRoundUpkeep`: after the fighting, the ticks and the Charges, before the round's death sweep), every unit with less than N Health sinks and dies: a true death (On Death, Revive and the rest work as for any death; no kill credit). With N = 2, any unit left on 1 Health. Flyers are above the sand and Structures stand firm (the exemptions of Tangled Roots and Grasping Briars); a Field Breaker pauses it like the other field hazards. The board: an Environment card (FIELD2 `quicksand`, art borrowed from the Sandstorm scene until it has its own), a log line per round it takes something and per unit, the card slides down into a sand glow as it sinks, and a ⏬ pip warns on every unit that would sink at the round's end. In the Effects library. Homes: The Glass Dunes (every fight) and the Pale Desert's boss, 18-A-9 **the Quicksand Queen**. N = 2 because the field effects hit for 1 (FX, 2026-10-22): it finishes what the round left on 1 Health without wiping 2-Health tokens.

## Measured
`node tools/skirmish_pass.js measure 40 --ref=map --only=<maps>`, seeds 9100 + 37g, 40 games a fight (one fight carries about +/-15 points; map means are steadier). Before: the base commit (old wind, old picks): `docs/balance/skirmish-pass-eng16-before.jsonl`. After: this package (new wind, Milling, Quicksand, picks): `docs/balance/skirmish-pass-eng16-after.jsonl`. No deck was retuned (BAL9's job).

| Map | Change | Mean win rate | Target (mean) | Fights in the green band |
|---|---|---|---|---|
| Gannet Cliffs | wind only | 73.9 -> 81.4 | 70 | 2 -> 3 of 7 |
| Eyrie Heights | wind only | 50.0 -> 54.0 | 72 | 0 -> 1 of 10 |
| The Sundered Peak | wind only | 85.8 -> 82.2 | 68 | 1 -> 1 of 10 |
| The Glass Dunes | wind + Quicksand | 52.9 -> 52.1 | 69 | 3 -> 3 of 7 |
| The Aerie Vault | wind + Thunderstorm | 51.2 -> 44.4 | 64 | 2 -> 2 of 4 |
| Ashen Spurn | wind + Scorching I | 73.3 -> 67.5 | 69 | 5 -> 3 of 6 |
| The Old Bramble | Tangled Roots | 75.6 -> 76.9 | 66 | 1 -> 1 of 4 |
| The Long Grass | Tall Grass | 53.2 -> 54.3 | 70 | 1 -> 1 of 7 |
| The Kelp Mangroves | Tangled Roots | 27.1 -> 29.6 | 69 | 0 -> 0 of 7 |
| Coral Current | Perma-tide | 64.4 -> 63.6 | 71 | 4 -> 3 of 9 |
| The Sunken Grove | Tide | 65.0 -> 57.5 | 64 | 2 -> 2 of 4 |
| The Canopy | Spring Rain | 9.5 -> 8.0 | 68 | 0 -> 0 of 5 |
| Goldfeather Keep | Bishop's Path | 76.6 -> 76.6 | 71 | 3 -> 3 of 8 |
| Caves & Alcoves | Landslide | 27.5 -> 22.2 | 69 | 1 -> 0 of 8 |
| The Mycelium Deep | Spore Cloud | 29.0 -> 29.0 | 66 | 0 -> 1 of 5 |
| The Pale Desert | Quicksand on 18-A-9 | 28.6 -> 30.3 | 70 | 0 -> 0 of 9 |

Picks tried and dropped (same measure, the map's fights only): Coral Current with Thunderstorm 64 -> 49, Wave 41, Leylines I 48; Ashen Spurn with Ash Rain 73 -> 58, Ashy 66; Goldfeather Keep with Rook's Row 77 -> 58 (CONTENT4 found 74 -> 56 too), Haunted 80.

## Findings for BAL9
- The wind change helps the player on the windy road maps (Gannet Cliffs +7.5, Eyrie Heights +4): the CPU's Headwind double shots were the larger effect. The Sundered Peak moves the other way (-3.6, inside noise).
- Four maps sit far under their targets before and after, whatever the field: The Canopy (9.5%), The Kelp Mangroves (27%), Caves & Alcoves (27%), The Pale Desert (29%), The Mycelium Deep (29%). That is their decks (reference or enemy), not the field: a deck pass (JJ7 / JJ21) is the fix.
- Caves & Alcoves' Landslide costs it about 5 points (8-3 and 8-8 fell 20 each; inside the noise at one fight, but in the same direction). If BAL9 wants it back, set `landslide: false` on 8-3 / 8-8 (the map keeps the combo on its other fights) or swap the map pick.
