# Hero card (2026-10-05)

**The request:** "new card type: Hero — gains experience from battling and crafting materia. Gains up to L100 — gains skills and etc. you get to pick your stat points! basically build your own card!"

**Status:** ✅ v1 built. The Hero lives on this device and plays in single-player modes. Live and online play come later (see Limits).

## What the player does

1. **Raise a Hero:** Deck → **🦸 Hero**. Pick one of three peoples (from the lore bible) and a name.

   | People | Starts | Skill pool (flavour) |
   |---|---|---|
   | 🦦 Rivergate Legionary | ⚔2 ❤9 | Guardian, Armor, Bulwark, Shell, Thorns, Sturdy, Siege, Reflect, Regen |
   | 🐦 Sunfeather Warrior | ⚔3 ❤6 | Flying, Evasive, Swift, Quick, Crit, Frenzy, Pierce, Ambush, Momentum |
   | 🐭 Road-folk Wanderer | ⚔2 ❤7 | Stealth, Poison, Bleed, Expose, Gash, Render, Arrow, Corrode, Fester |

2. **Add it to the deck.** The Hero takes one of the 20 slots and is limited to one copy. If the deck was full, the game says to take one card out.
3. **Earn XP:**
   - A win with the Hero in your deck gives +30 XP, plus another +10 if it was played.
   - A loss or draw gives +10 XP.
   - Each craft of 💎 **Materia** gives +30 XP.
   - XP counts in any played fight where the Hero was really in the deck you fought with: Conquest, the Arena modes and PvP tickets. Raids and the Autobattler use other decks, so they don't count. Neither do the tutorial, the sandbox, the PC test or Live Ranked.
4. **Spend stat points.** Each level gives 1 point, and every 10th level gives 3 more, so Level 100 has 129 points. The prices:
   - **+1 Attack:** 5 points.
   - **+1 Health:** 1 point.
   - **Wait 1 → 0:** 25 points, once.

   Resetting your points is free for now.
5. **Pick skills** at Levels 5, 15, 30, 50, 75 and 100:
   - Each slot offers 3 skills from your people's pool. The offer is seeded, so it doesn't change if you reroll the page.
   - Skill strength grows with level: value 1 + ⌊Level / 25⌋, so 5 at Level 100.
6. **Cost rises with level:** 1 to start, 2 from Level 20, 3 from Level 50 and 4 from Level 80.

## Pacing and power

- **XP curve:** reaching the next level from level L takes 10 + 1.5L + 0.04L² XP.
  - Level 5 takes 57 XP (about 2 wins).
  - Level 20 takes about 575 XP (about 15 wins).
  - Level 50 takes about 3,950 XP (about 110 wins).
  - Level 100 takes about 21,500 XP (about 600 wins, fewer with Materia).
- **Power budget:** stat prices are set from the roster, where Health runs about 5× Attack. For comparison, the median cost-2 card is 6/20, cost-3 is 8/34 and cost-4 is 10/50.
  - A Level 20 Hero at cost 2 can be about 4/24.
  - A Level 50 Hero at cost 3 is about 8/34.
  - A Level 100 Hero at cost 4, with 129 points and 6 skills, sits at roughly 13/60. That's level with the top Legendaries (Glacial Ape-King is 13/62), not above them.

## Materia v1

Materia is crafted in two places, which do the same thing:
- **Codex → Forge**, on the 💎 **Materia bench**;
- the Hero Hall.

Each craft costs 25 ✨ Magic Dust and gives +30 Hero XP and one crystal: 🔥 Ember, 💧 Tide, 🌿 Grove or 🪨 Stone. **Crystals don't do anything yet.** They're kept for socketing in v2. A proposal for v2: socket up to 3 crystals into the Hero for small elemental riders (Ember gives a burn on hit, Tide heals, Grove gives thorns, Stone gives armour).

## Limits (v1)

- **On this device only:** the Hero is saved in localStorage (`bramblewood_hero_v1`). It's also in the progress sync list, so signed-in players carry it between browsers.
- **Single-player only:** the Hero is removed from every deck that leaves the device:
  - PvP ghosts;
  - raid pools;
  - Live Ranked;
  - `p_deck`.

  Other players would otherwise face a card they can't see the rules for, and the server can't check a client-built card. The cost is that your ghost plays with 19 cards. Fixing this needs the Hero's definition sent with the deck and checked by the server, which waits on T3.
- **Art:** the Hero borrows its people's art (River Warden, Crimson Wing Recruit, Wandering Traveller). Proper Hero portraits, ideally changing at Levels 25, 50 and 100, are a PixelLab job once credits are available.
- **Translation:** the Hero Hall text is English only for now.

## Where

- **`arena_app.js`:**
  - the Hero data: `HERO_PEOPLES`, `HERO_COSTS`, `heroXpToNext`, `heroDef`, `heroGainXp`, `heroAwardBattle`;
  - Materia: `craftMateria`, `forgeMateriaBenchHTML`;
  - `publicDeck`;
  - the Hall: `renderHeroHall`;
  - `getCardDefs` injects the Hero.
- **CSS:** "Hero Hall" in `arena_template.html`.
- **Test:** `tests/e2e/hero.py`, part of `run-all.sh --e2e`. It covers:
  - create, level, spend and pick;
  - craft;
  - adding to the deck;
  - winning a Conquest skirmish → XP;
  - no leak into public decks.
