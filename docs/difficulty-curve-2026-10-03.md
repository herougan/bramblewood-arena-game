# Difficulty curve check (2026-10-03, game-design pass)

**Tool:** `node tools/difficulty_curve.js [games] [otters|hummingbirds]`
- It plays the deck a player has right after the tutorial (the faction Basics) against every Conquest node.
- The engine's AI pilots both sides, with real castle HP and seeded games.
- An AI isn't a human, but the *shape* of the curve is what matters: no free nodes, no walls.

## What I found

**Map 1 was a wall.** Before this change, the Otter starter deck won:
- 0% vs Otter Patrol (1-1);
- 3% vs Scorpion Ambush (1-2);
- 0% vs Raccoon Heist (1-3);
- 1% vs the boss (1-4).

The decks there used cards like Caustic Scorpion (5/15), Sandstorm Roc (6/18) and a Yeti (10/50), against Basics that top out at 3/8.

**Fixed: Map 1 is now an on-ramp.** The decks are built from Basics plus one "signature" threat each.

| Node | New deck | HP | Otter starter | Hummingbird starter | A rebuilt deck* |
|---|---|---|---|---|---|
| 1-1 Otter Patrol | Otter Kit ×4, Otter Paddler ×4, Honey Bee ×4 | 16 | ~93% | ~100% | ~100% |
| 1-2 Scorpion Ambush | Worker Ant ×4, Tunnel Ant ×4, Ant Scout ×2, **Caustic Scorpion ×1** | 20 | ~80% | ~97% | ~100% |
| 1-3 Raccoon Heist | Trash Panda ×4, Meadow Rabbit ×3, Pond Trout ×3, **Raccoon Nightcrew ×1** | 20 | ~40% | ~70% | ~99% |
| 1-4 Frost Vanguard (boss) | Glacier Wolf Pack ×3, Quillback Elder ×2, Pond Duck ×4 | 30 | ~3% | ~15% | ~59% |

\* "Rebuilt" means using what a new player owns:
- Otter Centurion ×4 and Soldier Ant ×4 (unlocked for everyone);
- the tutorial's River Warden ×2;
- the best Basics.

The boss now *teaches deck building*: the starter deck can't win, a sensibly rebuilt one usually can.

## Still a wall (needs your call → D18)

**From Map 2 onwards the starter deck wins about 0–10% almost everywhere.** One exception: 2-2 Tidal Ring, which is 73–92%, an outlier that is too easy.

**No Conquest node grants a card yet.** No card has `source: {kind:'map', node:…}`. So the only card progression is:
- the Sprout Pouch (50 🍁 for 3 cards);
- the 5 unlocked commons.

A new player who beats Map 1 will likely hit a hard wall at 2-1.

Options:
1. **Assign skirmish reward cards.** The node rewards editor already exists: Admin Mode → a node → Rewards. Each Map 1–2 node grants 1–2 cards that answer the next map's threats. This is the most "earned" feeling.
2. **Retune Maps 2–4 the way Map 1 was:** curve the decks to a target win rate for a deck built from Map 1 rewards plus a pack or two.
3. **Both** (recommended). Rewards make progress feel earned; the retune keeps the steps even.

Targets I'd use: first node of a map ~80%, the middle ~60%, elites ~45%, the boss ~35–45% with a deck that uses that map's rewards.

## D18 draft applied (2026-10-04): review and adjust in the skirmish editor

### Skirmish reward cards (first clear only)

| Node | Reward | Why |
|---|---|---|
| 1-1 Otter Patrol | Feral Tomcat (3/5, Quick, free) | an early free attacker |
| 1-2 Scorpion Ambush | Chipmunk Cavalry (4/9, Quick, 1🪵) | the first Lumber card worth saving for |
| 1-3 Raccoon Heist | Owl Nightwatch (4/10, Stealth, Flying) | answers flyers |
| 1-4 Frost Vanguard | Otter Riverguard (5/20, Armor) and Shepherd's Bark (4/16, Guardian) | the boss pays twice: a wall and a protector |
| 2-1 Reef Skirmishers | Jackrabbit Sprinter (5/8, Quick) | |
| 2-2 Tidal Ring | Cuttlefish Illusionist (3/12, Evasive) | |
| 2-3 Cetacean Pod | Migration Leader (3/12, Flying) | |
| 2-4 The Kraken's Maw | Rootworm Colony (3/14, Poison) | |
| 2-5 The Drowned Colossus | Reef Manta Glider (5/16, Evasive) | the boss's own signature card |

**How they're stored:** `source: {kind:'map', id, node}` in `canonical/cards.json`. The game grants them on the first clear and shows them under "Cards won". The Codex shows where each one comes from.

### Map 2 retuned

The new Map 2 decks are lighter water decks with fewer Krakens and Humpbacks, and lower castle HP. Each row shows the old deck and HP, then the new.

| Node | Deck, old → new | HP, old → new | Win %, old → new |
|---|---|---|---|
| 2-1 | Manta ×4, Hermit Crab ×4, Narwhal ×2 → Hermit Crab ×4, Pond Trout ×4, Silver Minnow ×2, Manta ×1 | 30 → 26 | ~0% → ~93% |
| 2-2 | Kraken ×2, Riverguard ×4, Bell-Ringer ×4 → Riverguard ×2, Bell-Ringer ×4, Hermit Crab ×4 | 32 → 28 | ~100% → ~59% |
| 2-3 elite | → Manta ×2, Hermit Crab ×4, River Carp ×3, Pond Trout ×2 (the Collapsed Mine castle is gone) | 40 → 34 | ~0% → ~48% |
| 2-4 elite | → Kraken ×1, Hermit Crab ×4, River Carp ×3, Pond Trout ×3 | 60 → 38 | ~0% → ~45% |
| 2-5 boss | → Kraken ×1, Humpback ×1, Manta ×1, Hermit Crab ×4, River Carp ×3 | 100 → 40 | ~0% → ~20%, rising with Map 2's own rewards |

The win rates are for a deck built from what a player owns after Map 1, with the AI piloting both sides. 2-2 used to be the outlier (100%); it is now the step up after 2-1.

## Maps 3–4 (2026-10-04, auto-tuned)

**The tool:** `node tools/autotune_map.js <mapId> [games]`. For each node, in order, it builds the deck a player would own arriving there: base cards plus every earlier skirmish reward. Then it adjusts the node toward a target win rate:
- too hard: lower the castle HP, then swap a copy of the node's strongest card for its weakest;
- too easy: the reverse, and raise HP.

**Targets:** first skirmish ~85%, sliding to ~60% by the last skirmish; elites ~45%; boss ~35%; raid boss ~20–35%. It only prints a proposal; I applied it by hand, clamping any card to 6 copies.

**New reward cards:**
- **Map 3:** Pack Rat Looter (3-1), Camouflage Frog (3-2), Slowpoke Sentinel (3-3), Duckling Squadron (3-4), Canopy Sloth Guardian (3-5), Glacier Wolf Pack (3-6, boss).
- **Map 4:** Blind Cave Fish (4-2), Sulfur Cinder Moth (4-4), Echo Screecher (4-6), Vampire Roost (4-7), Stalactite Golem (4-8, boss).
- **Swapped out:** I first gave Narwhal Lancer (7/20) for 3-5. It made all of Map 4 trivial, so it's now Canopy Sloth Guardian.

Win rates, old → new:

| Node | Win % | Castle HP |
|---|---|---|
| 3-1 | 13 → 85 | 36 → 16 |
| 3-2 | 30 → 62 | 40 → 16 |
| 3-3 elite | 0 → 47 | |
| 3-4 elite | 28 → 45 | |
| 3-5 elite | 7 → 45 | 80 → 45 |
| 3-6 boss | 32 (unchanged) | |
| 4-1 | 43 → 82 | |
| 4-2 | 100 → 77 | |
| 4-3 | 3 → 70 | |
| 4-4 | 98 → 80 | |
| 4-5 | 3 → 65 | |
| 4-6 | 100 → 72 | |
| 4-7 elite | 87 → 53 | |
| 4-8 boss | 67 → 47 | |
| Deep Troll raid | 82 → 35 | |

**Known quirk:** some early Map 3–4 castles now have low HP (16–19). The difficulty comes from their decks instead. If you'd rather castles always grow map to map, raise HP and soften the decks in the skirmish editor.

**Next:** Maps 5–11, with the same tool, once you've played Maps 1–4.

## 2026-10-18 note: Shield by rule, the base bramble on Map 0 (package X3)

Owner (15:05): "For shields, lower the amount of shields in all skirmishes. About Shield = Map. For Elites, Map * 1.5, up to 3x for bosses. HP of brambles in Tutorial and Map 0 Skirmishes should be unnaturally low."

**The rule** (`ruleShieldOf` in `arena_app.js`, worked out when the fight is built):

| Kind | Shield |
|---|---|
| Skirmish | map number |
| Elite, Champion, Dungeon | round(map × 1.5) |
| Mini-boss, Sub-boss | map × 2 |
| Boss, Campaign Boss, World Boss, Raid | map × 3 |
| Tutorial | 0 |

- Health is now the bramble's own Health (castle + level). A node's `hqHp` can only lower it; it no longer adds Shield on top. Before, everything above the bramble's Health was Shield, which reached 150–400 on Maps 18–24.
- The skirmish editor's override is a new field, `shieldOverride` (a number or up to 4 layers). Old saved `armour` / `armourLayers` values are ignored.
- **Map 0's road fights a Lv 0 base bramble:** 0-1 has 10 Health, 0-2 has 12, 0-3 has 14 (later skirmishes 15), elites 16, the boss 20, all with no Shield. The tutorial's rival keeps the tutorial config's 6 Health (8 in part 2). The Tutorial side map's T-2…T-4 and the Old Bramble keep their bramble's Health.

**Average enemy total per main map, before → after (Health + Shield):**

| Map | Skirmish | Elite | Boss |
|---|---|---|---|
| 0 Outskirts | 22 → 12+0 | | 52 → 20+0 |
| 1 Thistlewood | 15 → 15+1 | | 35 → 28+3 |
| 2 Pebble Beach | 32 → 29+2 | | 167 → 38+6 |
| 3 Gannet Cliffs | 47 → 28+3 | 59 → 30+5 | 56 → 30+9 |
| 4 Sunken Hollow | 40 → 18+4 | 101 → 25+6 | 187 → 30+12 |
| 5 Gatorback Swamp | 92 → 28+5 | 102 → 30+8 | 87 → 30+15 |
| 6 Sable Swampmire | 168 → 26+6 | 74 → 27+9 | 34 → 34+18 |
| 8 Caves & Alcoves | 38 → 21+8 | 29 → 23+12 | 81 → 30+24 |
| 10 Coral Current | 60 → 24+10 | 60 → 25+15 | 93 → 32+30 |
| 12 The Briar Maze | 24 → 24+12 | 28 → 28+18 | 45 → 30+36 |
| 14 Savanna Reaches | 50 → 28+14 | 74 → 28+21 | 30 → 30+42 |
| 17 Wolfsbane Tundra | 28 → 24+17 | 69 → 28+26 | 30 → 30+51 |
| 18 The Glass Dunes | 135 → 30+18 | 110 → 30+27 | 65 → 30+54 |
| 20 The Sundered Peak | 52 → 29+20 | 94 → 28+30 | 140 → 30+60 |
| 22 The Rimefire Caldera | 278 → 30+22 | 310 → 30+33 | 340 → 30+66 |
| 24 Goldfeather Keep | 352 → 30+24 | 385 → 30+36 | 420 → 30+72 |

Most fights get shorter, and the late maps much shorter. A few bosses that had a small total now get more: 14-8, 17-8 and 6-8 had 30–34, and now have 72, 81 and 52. Bosses now rise smoothly with the map. The decks, the CPU level and the card levels carry the difficulty now. `tools/curve_tune.js`, `tools/autotune_map.js` and `tools/retune_all.js` still tune `hqHp` as a total, so they no longer move the Shield. Retune with the editor's 🎯 button instead, which sets `shieldOverride`.

**Come-back-later fights** (coordinator, 10-18): the rule counts each one as the map that opens it, not Map 0 (`nodeMapNumber`). T-2 / T-3 / T-4 count as Maps 1 / 8 / 18 (`TUT_SIDE_GATE`). The Old Bramble counts as Map 17 (`shieldMap:17` on the map, since it opens after the Ice Hollow). Totals before → after (Health + Shield):
- T-2: 90 → 28+1 = 29
- T-3: 60 → 28+8 = 36
- T-4 (elite): 220 → 31+27 = 58
- 0-B-1…3: 43 / 53 / 63 → 28+17 = 45 each
- 0-B-4 (boss): 80 → 36+51 = 87

Any node or map can carry `shieldMap` to do the same.

**Your own bramble** (owner 15:37, "D. Tutorial only"): your bramble has 8 Health in both tutorial fights. It was 16, and the rival has 6, then 8. It is capped at 8 (`TUTORIAL_MY_HP_MAX`) even if a saved tutorial config says more. In Map 0's skirmishes your bramble keeps its own Health (28–30) against the enemy's 10–20.

The AI-vs-AI tutorial simulation pilots your side with the plain CPU (no guidance), so it is pessimistic. It is 60 seeds of part 1 / part 2, open rules. Your win rate at 16 Health → 8:
- Hummingbirds: 83 / 82% → 58 / 62%
- Otters and Both: 15 / 10% → 7 / 8%

The fixed tutorial seed lost the simulation at 16 already, so `tests/e2e/ui_smoke.py` 7b (wants 70%+ and a fixed-seed win) did not pass before this change either. The guided steps are what make the tutorial winnable; worth a hand playthrough at 8.

## 2026-10-18: the skirmish pass (package SKB)

Owner (15:56): "a skirmish rough balancing pass. as long it's not auto winnable or always loseable." Full tables: `docs/skirmish-pass-2026-10-18.md` and `.xlsx`. Tool: `tools/skirmish_pass.js`, which reads the game's own fight build from `arena_app.js` through `tools/lib_bramble.js`.

**How it was measured:**
- Every Conquest fight was played: main maps, side maps, the dungeon and four floors of each endless dungeon. The tutorial, raids and the Babel Spire were left out.
- 60 games a fight, with `aiAim` on and the CPU at its real level.
- The enemy bramble and deck are built as the game builds them: the Shield rule or override, and the road levels.
- Your deck is the stage deck:
  - Starter on Map 0;
  - a new **Road deck** per map on Maps 1–9, built from `expectedPlayerDeck`'s pool the way this tool builds Mid-road and Strong;
  - Mid-road on Maps 10–17;
  - Strong on Maps 18–24.

**Results:**
- **Before:** 63 fights outside 12–92% (39 auto-winnable, 24 always losable, 5 of them endless floors), and 13 maps whose elites or boss were easier than their skirmishes.
- **After:**
  - 7 outliers on the measure seeds: 21-3 Cloud Ledge, 24-6 The Gilded Guard, and the 5 endless floors;
  - 8 over 120 games: the same plus 24-1 at 92.5%;
  - 1 map whose elites or boss are easier than its skirmishes: the Sunken Depths.

**What changed:**
- 90 fights. Almost all of them changed only the CPU deck: up to 2 copies a move, themed, inside the road's rarity caps.
- 4 fights also got a `shieldOverride`: 3-1, 3-5, 10-7 and 18-4.
- 8-7 got a lower Health.
- The Dromedary now costs 1 Lumber and is 3/26 (65.8%, band 45–68%).

The curve's shape now:
- Map 3 is no longer free (98% → 77%).
- Maps 4, 10 and 13 are the stiff ones (27–30% mean).
- The late maps settle at 55–86% for the Strong deck.
- Every main map's bosses and elites sit under its skirmishes.

**Tools:** `tools/curve_tune.js`, `tools/retune_all.js` and `tools/autotune_map.js` now tune the bramble's total under the rule. On `--apply` they write a `shieldOverride`, or a lower `hqHp` with no Shield, instead of `hqHp`.
