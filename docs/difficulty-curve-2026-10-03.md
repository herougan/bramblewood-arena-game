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
