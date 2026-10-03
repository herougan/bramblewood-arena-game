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

**Next:** Maps 3+ still start at about 0–40%. Same treatment once you're happy with these two.
