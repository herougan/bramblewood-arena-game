# Action items

_Updated 2026-10-09, 10:20 am. The short list of what matters now. Everything else is in the other tabs._

## 1. Your calls that unblock the most

| ID | What | My suggestion |
|---|---|---|
| **B4** | Cards costing 3+ Lumber (all five dragons included) lose in simulation; no number tweak fixed it | Big cards do something the moment they're played |
| **D19** | Which archetype to build first | Active Exile zone, then Swarm |
| **T3 / S1 / S2** | Server: one-use fight seeds, admin player list, anti-cheat tier 1. Each waits for "apply it" | Apply all three |
| **C2** | The skirmish editor's battle type: a bug that reverts, or lock it after the first save? | Tell me which |

All 31 open items, with filters, are in the 🗳️ Decisions tab. Reply with the ID and your choice, e.g. "B5 yes".

## 2. What I'm working on

- **Card balancing** (⚖️ Balance tab, [report](card-balance-2026-10-09.md)): done on "continue" with my defaults (B5, revertible):
  - every card now has a rarity (capped at Rare for now);
  - 39 extreme outliers moved half-way toward their fix;
  - 162 of 288 cards are now in their rarity's band (was 124).
  - Next: expensive cards (B4) once you pick a direction.
- **Skirmish editing:** the editor can now:
  - simulate a fight against a new player's likely deck at that point;
  - auto-tune the Skirmish Armour to the fight's target win rate;
  - show the whole map's difficulty as a coloured strip.

  - **Every map retuned** (B2, revertible): 85 of 96 fights moved toward their target win rate. The table is in `docs/balance/retune-all.json`.
  - Still too easy: Sunken Hollow and 3-2. They need stronger cards than their maps have.
- **CPU opponent:** it now saves Lumber for costly cards. Before this, enemies almost never played them.

## ⚠️ Incident today

The live game failed to load from **09:10 to 10:12**: a stray comment broke the main script. Fixed and redeployed. The test suite now parses every script before anything ships, and it catches this exact bug.

## 3. Things only you can do (outside chat)

- **Free up room in the claude.ai project.** It's full, so the archetype sheet and three audits couldn't be saved there (they're in this hub). The old game-design v30–v40 addenda are the easiest to remove.
- **Supabase:** turn on leaked-password protection (Auth → Passwords, one click).
- **Art:** PixelLab credits or the image API keys (A1) for the new cards: Ant Warrior, the critters and the Grotto rewards still use stand-in art.

## 4. Shipped recently

- Two new maps, Thistle Fields and Pebble Beach, plus the Smugglers' Grotto cave sub-map with the first elites.
- Promotion (Worker Ant → three ant cards). The Hero's rarity rises with its level. The first Nest egg drops on the 4th map.
- A new opening screen, and the 📐 Design tab (archetypes and audits).
- The CPU saves Lumber; the skirmish editor's tuning tools; the three new maps retuned with them.

The full list is in the 🗒️ Changelog tab.
