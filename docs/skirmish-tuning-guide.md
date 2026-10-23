# How to tune a skirmish (2026-10-09)

Everything here happens in the game. Turn on Admin Mode, open Conquest, pick a fight, then 🛠️ Edit skirmish.

## Design restrictions we set ourselves

The standing rules that limit how a skirmish is built (2026-10-23). A tuning move that breaks one of them is the wrong move, even when it hits the win-rate target. Each rule names its source (a decision id in `docs/decisions.json`, or a dated owner note in `docs/action-items.md`) and, where code enforces it, the file and constant. The engine and data win over dated docs: where they disagree, the last group says so. The rarity numbers are Map numbers on the main road.

### 1. Deck shape
- **5-7 different cards per skirmish.** Owner 10-22 09:52 (SK) and SK-3. Today 47 have 5, 94 have 6, 8 have 7. Not covered: the Tutorial's lesson fights, endless floors, elites and bosses. `tools/skirmish_sizes_2026_10_22.js check`.
- **A 7 is rare, and only with a clear leader** ("6 cronies and 1 bigger unit"). SK-3 (owner 10-23: "7 cards should be rare - 8 7s is okay"). Same tool.
- **Copies per card: Common 5, Uncommon 4, Rare 3, Very Rare 2, anything above 1.** PG-1. `RARITY_MAX_COPIES` in `arena_app.js`. It binds the player's decks. Enemy decks are left off the ladder (PG-6), but the theme pass and the sizes tool still apply it to cards they put in.
- **Per-deck rank caps, leader counted:** 3 Legendary, 2 Mythic, 1 of each rank above. Owner 10-22 (package DR). `BramblewoodBudget.deckRankOver`. The sizes tool honours it.
- **Keep the battle rating when you resize a deck.** SK-3: within about 10%, and the leader counts double. Three fights stay above (16-4, 21-2, 20-B-3), where the Common rest of the deck cannot offset a Rare leader.
- **The printed card is the card.** B10 (owner 10-19 16:22): an enemy card has its printed stats plus its level. Difficulty comes from levels, decks, synergy and fields, never from altered stats, new Shield overrides or field buffs ("let them be strong full stop for now").
- **Skirmishes default to Open mode.** G3 (10-08). Gravity (collapsing) is a special case, set per skirmish.

### 2. Leaders
- **Every skirmish from Map 2 leads with its highlighted (showcase) card, unshown.** SK (owner 10-22 09:52) and LEAD-5. `SKIRMISH_LEADER_FROM_MAP = 2` in `arena_app.js`. This covers the owner's later "normal skirmishes past Map 10 should have leaders" (01:03 note).
- **Elites and above lead on every map, Map 0 included, and their leader is shown** on the VS opener. LEAD (owner 10-23 01:03). `LEADER_KINDS`, `leadersShownFor`. Not the Tutorial's lessons or the endless and Tower floors.
- **Usually the boss unit leads, but any deck card can.** Owner 01:03 ("they can use any card as leader btw"). LEAD-3: on 11 fights another card leads (1-5, 3-6, 3-7, 6-6, 10-6, 11-9, 14-8, 22-8, 2-A-7, 20-A-2, 20-A-6), so the rating stays within 5%.
- **Twin bosses lead with 2 cards.** LEAD-1: only 24-8 (Magnate Duck + Iron Warden) and 23-8 (Marshal Tuskwell + War Elephant). Set with `node.leaders`. Every other fight has 1.
- **Where the Auto pick is a small card beside a big unit, the showcase is set by hand** (14 fights, SK-2). Auto = top rarity, then Attack + Health/2.
- **The battle rating counts a leader double and at the enemy's level**, while it fights at its printed level. LEAD-2 (held within 5% by the retune).
- **A map leader card is paid on clearing the fight it leads** (`grantClearedBossLeaders`; SK-1: Sergeant Bramblefox leads 13-2).

### 3. Rarity by map
- **The ladder (when a rarity is revealed):** Common 0, Uncommon 1, Rare 5, Very Rare 10, Super Rare 20, Epic 22, Heroic 25, Unique 30, Legendary 40, Mythic 60. Owner 10-22 07:41 (DV1). `RARITY_INTRO` with `ROAD_MAIN_FROM` (Epic 22, Heroic 25). The Eye of the Volcano and the Volcano Lair reveal Epic and Heroic on their own side maps earlier (`SIDE_RARITY_INTRO`).
- **Ancient, Divine, Void and Daemonic never appear on the road** (skirmishes, rewards, packs, tracks). Quests and dungeons only. Mythic is the road's top. DV1, `ROAD_NEVER`.
- **A skirmish's top rarity by map:** Common to Map 1, Uncommon from 2, Rare 5, Very Rare 10, Super Rare 20, Epic 30, Heroic 40, Unique 50, Legendary 60, Mythic 70. **An elite gets one step more, a boss two**, never past what is revealed. `roadSkirmishCap`, `roadRarityCap`. Enemy decks and reward cards both obey it (`tests/card-pass-2026-10-19.js`).
- **The 11 Heroic map leaders (Maps 0-19) and the Triumvirate (Unique, 23-8) sit outside the ladder.** DV2.
- **Skirmish card drops by map:** Maps 0-9 Common only; 10-29 Common 80% / Uncommon 20%; 30+ 70 / 25 / 5; then a 5% shift down and a 5% shift up. RW-2 (owner 10-22: "80/20 and 70/25/5 is fine"). `SKIRMISH_DROP_RARITY`. They draw from the basic pack pool, never the faction pool (RW-3).
- **Packs are fully random.** No map gate, no rarity gate, no memory of earlier packs. DV4 (owner 10-23 00:10: "Packs outputs can never be changed by anything"). The card drop, the base track and a raid claim keep the gate.
- **Faction rewards climb from the lowest rarity,** counted in cards received (duplicates count). Uncommon after 25; Rare after 40 and **not before Map 14**; Very Rare 50 (Map 20 and the Volcano Lair cleared); Super Rare 60 (Map 22); Epic 70 (Map 26); Heroic 80 (Map 30); Unique and up 90 (Map 40). RP, DV6. `FACTION_RARITY_GATES`. Only the first three steps are firm; the later ones are proposals the owner kept.
- **Rewards are plain on Maps 0-1** (`PLAIN_REWARDS_UPTO_MAP = 1`; RP, owner: only plain cards as rewards at the start), and a card has two skills at most, except special or thematic creatures (`docs/workflows/card-data.md`; HB2-1 keeps the Swordbill Challenger's three).

### 4. Enemy levels by map
- **Map 0: every enemy card fights at Level 0.** Map 1: 0 / 25 / 25 / 50 / 50% of the copies are Level 1 by the fight's place. Map 2 on follows the schedule below. EB-3 (owner 10-23 01:57). `EARLY_ENEMY_LEVEL`. The fight panel still shows printed stats. The owner rebalances Maps 0-2 himself.
- **The schedule:** Maps 1-4 Level 1; Maps 5-9 rise from 1 to 2; Map 10 Level 2, then +0.2 a map (Level 4 at Map 20, 4.8 at Map 24). A boss counts 2 maps further on, a side map 1. Owner 10-19 16:22 (B10, BF3). `roadEnemyScheduleLevel`, `ROAD_LEVEL_CURVE.enemySchedule`.
- **No Forge before Map 11:** Maps 0-10 are won by deck building. B7 (owner 10-19 09:52: "The player has to deck build to win"). `ROAD_LEVEL_CURVE.playerForgeMap = 11`.
- **Levels gate by map, not by resources, and Base cards stop at Level 4.** DF-2 (owner 10-23 17:34, and the grind to each gate still counts). A card's Map term in the stat budget is 0.2 a map (DF-1; to be set in `bramblewood-budget.js`).
- **A fight's Level is read from its map number, not set per fight,** unless the skirmish editor's Enemy level overrides it.
- **Limit breaks open at Map 50** (a dated note, `docs/progression-2026-10-12.md`; B9: older cards get a bigger step).

### 5. Brambles
- **Enemy brambles in T-1, T-2 and Map 0 have no effect,** except 0-4, which keeps the Plains Terrace (+1 Attack to the first unit). EB-6 (owner 10-23 01:57).
- **Map 1 (1-1 to 1-4) has plain brambles too;** only the Baron keeps the Plains Terrace. EB-2.
- **Your bramble starts above the enemy's Health + Shield + 3** in T-1, T-2 and on Maps 0-1. EB-6. `EARLY_BRAMBLE_LEAD = 3`, `EARLY_BRAMBLE_LAST_MAP = 1`, `earlyBrambleHp`.
- **Bramble Health floors:** 14 for a skirmish, 25 for an elite, 30 for a boss (B2 retune, `tools/retune_all.js`). The tutorial brambles keep 9 and 11, and the editor's value will become the one the fights use (TU2-3, to build).

### 6. Field effects
- **Damage per tick:** every hazard does 1 a unit a round; a single-target hazard 2; a rare single-target hazard up to 3. FX3-3 (owner 10-23 11:11). Exact damage, rounded once, half up (N22-13); half of 1 is 1, so Resist and the like cannot stop a 1 (FX2-3).
- **The volcano is gentler by design:** Lava Tide at 50% (FX3-3); Scorched Ground hits one random unit a side for 1 each round from round 2 (FX3-1, FX4-3); Wildfire Front burns every front-line unit for 1 each round from round 2 (FX4-2); after an Eruption the volcano drops to Very Low and climbs one level a round (FX2-1, EN-7).
- **One ground fire a fight:** where Scorching and Scorched Ground were both on, only Scorched Ground stays. FX3-2 (`fightRules`).
- **Fog of War is information only,** for both sides: it limits what a side knows and chooses, never what a skill can reach. FOG1, EN-8. Reach is the unit's column and the ones beside it; revealers add only permanence (FOG2).
- **Selfish map boons from Map 5 (decided, not built yet):** one boon per map, on every fight of that map, active only when at least half the enemy deck shares the map's theme, so copying the deck gains nothing. Maps 6, 11, 14, 15 and 21 get none. DF-3 (owner 10-23 17:34), queued as package DF3.

### 7. Rewards
- **Every skirmish pays something on its first clear:** that season's pack, a faction pack, a skirmish exclusive, or a card of that season's pack. Never nothing. GD2-4 (owner 10-23 00:10). Today 36 exclusives, 64 pack cards, 1 pack (0-2). `SKIRMISH_FIRST_PACKS` is the empty fallback.
- **Skirmish exclusives have priority, and every main map has at least one.** GD2-3 (owner 10-23 00:10: "move the pack cards"), RW3-8. A map pays 3 exclusives for 10 new cards, 2 for 6-9, 1 for fewer (DV3, `docs/workflows/card-data.md`); GD-5 caps a mix at 1-2, max 3.
- **A skirmish reward is never a pack card, and faction rewards are their own category.** RP (owner 10-21). Faction rewards come on a main map's last fight, every 8th first clear, Map 0's 0-2 pack, the 3-2 ambush and some achievements (`FACTION_REWARD_TRACK`). Otters and Hummingbirds should end up symmetric (RP4).
- **The first-clear rank gate:** B for a Common or Uncommon, S for a Rare or above, one step up every 20 maps, **capped at S** (Maps 0-19 B/S, 20-39 A/S, 40+ S). Elites and bosses ask S. A challenge card (six, one per four maps from Map 4) asks SS. RW-1, RW2-2. `CARD_RANK_CAP`, `CARD_RANK_STEP_MAPS`, `cardRewardRankFor`.
- **Card drops: about 1% per Energy tier, plus a shield bonus:** elite +1, sub-boss +2, boss +3, world, raid and final boss +4. So a skirmish 1%, elite 3%, boss 6%. A skirmish with a first-clear card rolls 3x on repeats, then that card's rarity share (Common 60% ... 1% from Ancient). Owner 10-23 00:10 (RW2-3, RW3-1). `DROP_PER_ENERGY_RW3`, `DROP_SHIELD_BONUS`. Ticketed dungeons keep 7% a tier, capped at 25%.
- **Map 0's sure card comes on the first clear only;** replays roll the panel's drop. PR-1.
- **Items roll 2% per Energy the fight cost, at most 3 a day;** an Energy capsule (8 Energy) is a first-clear reward every third map. EB-4, EB-5.

### 8. Theme and diegesis
- **Maps 0-5 are very cute; Map 5 starts slightly more imposing creatures.** Owner 10-21 (N21-2). The theme pass took the Kraken Spawnling, Humpback Elder, Reef Manta Glider and every Shark, Whale and Orca out of Maps 1-4; no Shark before Map 9. Map 5 keeps its crocodiles and Bog Behemoth.
- **Thematicism is key:** a map's recommended biome cards are assigned to its fights, and off-biome cards are swapped for the nearest in rarity, Wait, cost and power. Owner 10-21 (`docs/skirmish-theme-pass-2026-10-21.md`). Biome tags in `canonical/unit-themes.json`; `tests/thematic-2026-10-19.js`.
- **Enemies come from their map's pool:** the map's own cards, its submap's, and its Special list (`canonical/map-pools.json`). A submap fight does not see its parent's Special cards (MP-3).
- **A place should feel like itself** (the beach pass, N21-1), so card and name choices follow the biome before they follow the numbers.
- **A few cards are placement-limited by theme:** Pelican Divers on Gannet Cliffs only, Badger Berserker on badger maps only (`tests/thematic-2026-10-19.js`).

### 9. Road structure
- **Bosses from Map 5 on** (at least 95 bosses and 100+ elites over Maps 0-100), **5 world bosses and 1 super world boss.** Owner 10-21 (RP).
- **A map's fights unlock only after the previous map is cleared,** and side maps are gated "after Map N cleared", counting as Map N (PG-4, DV7). The Pale Desert is after Map 19, the Eye and the Lair after 20-10.
- **Fights are always rated against a reference player's deck:** the Base ant synergy deck, and a collected deck (DF-1, DF-4).

### 10. Win-rate bands
- **The road curve, in the game:** a map's first skirmish ~90%, stepping down evenly to ~60% before the boss; elites on the line; a mini-boss that is not the map's last fight 50%; the map's boss 40% (green 30-49%), Map 0's boss 45%; green band is the target +/- 8 points. Owner 10-19 20:39. `roadCurveTarget`, `skirmishTargetBand`, `ROAD_CURVE_TOL = .08`. Side maps sit lower by `ROAD_CURVE_SIDE_DR` (0.19 logit) a map ahead.
- **The curve is measured against the reference decks** (the ant deck and a collected deck), not a hand-built deck. `tools/skirmish_pass.js`.
- **Raid bosses ~20%,** tuned in the Raid editor.
- **Difficulty should not fall after Map 16.** DF-1 found the road getting easier; the fix (a pace curve, drifting targets) waits for the owner's play-through (DF-1b, open).

### 11. CPU rules
- **The CPU has no side preference and likes the middle lanes.** With no kill or trade to make, its slot choice is weighted to the middle three slots and to slots facing or beside your units; the smartest CPU breaks ties toward your units, else a coin. EN2-2 (owner 10-23 19:30). `tests/en2-cpu-side-sim-2026-10-23.js`.
- **The CPU does not save Lumber for its leader,** so costly leaders rarely come out. LEAD-4 (revisit with DF-1b).
- **The CPU plays through the fog from its side;** it never sees a fogged unit it could not reach. FOG1, EN-8.

### Where sources disagree (the engine and data win)
- **Enemy levels.** The request quoted Map 20 Lv 5, 40 Lv 7, 60 Lv 8, 80 Lv 9, 100 Lv 10 with a limit break for the mega boss. No decision or doc defines that. The old closed note BAL says Lv 5 at Map 20, but `roadEnemyScheduleLevel` gives Lv 4 at Map 20, and nothing sets levels past Map 24 (the line would give Lv 8 at Map 40). Needs an owner call before it is written as a rule.
- **Win-rate targets.** The table below (85 / 60 / 45 / 35) is older than the game's road curve (90 to 60, mini-boss 50, boss 40). The game's curve wins.
- **Fewest cards.** "Keep at least 3 different cards" (below) is old; the rule is 5-7 (SK).
- **Leaders from Map 11.** The owner's 01:03 note said past Map 10; SK's Map 2 rule already covers it (LEAD-5).
- **First-clear rank.** The comments above `cardRewardRankFor` still describe SS / SSS and elites asking SS. `CARD_RANK_CAP = 'S'` and RW-1's outcome win: S is the cap, SS only for challenge cards.
- **Card-drop rates.** RW-2, RW-3, RW2-1, RW2-3 and GD-5 / GD-6 still quote 7% a win, 7% per tier or 21%. RW2-3's owner answer and RW3 replaced them (1% per Energy tier plus the shield bonus; 3% on repeats with a first-clear card).
- **Rare.** Rare enemy and pack cards start at Map 5 (the ladder). The faction track's Rare waits for Map 14. Both hold, on different tracks; PP-2 (open) asks whether the faction pattern's 10th reward (about Map 3) may be a Rare.
- **Rarity constants.** `RARITY_INTRO` still lists Epic and Heroic at 21; `ROAD_MAIN_FROM` (22 and 25) overrides it.
- **Enemy copies.** 122 of 467 enemy decks hold more copies than the ladder allows (PG-6, left as is), while the theme pass says copy limits hold for the cards it placed.
- **Map pools.** MP-1: the pool guides the editor (a warning chip) and refuses nothing, so "enemies come from their map's pool" is held by the tools and tests, not by the game.
- **Selfish boons** (DF-3) are decided but not built, so no fight enforces them yet.

## The target

Each fight aims at a win rate for **a new player's likely deck**: the Base cards, plus every card won in earlier fights.

| Fight | Target |
|---|---|
| First skirmish on a map | ~85% |
| Last skirmish on a map | ~60% (the ones between step down evenly) |
| Elite | ~45% |
| Boss | ~35% |
| Raid boss | ~20% (tuned in the Raid editor) |

## The tools in the editor

- **📊 Simulate 200 vs my deck.** How *your* current deck does. It's useful for feel, but your deck is usually far stronger than a new player's.
- **📊 vs a new player's deck.**
  - Runs 200 games with the deck a player would likely own here, and shows that deck.
  - Compare the result with the target shown.
- **🎯 Auto-tune Armour.**
  - Finds the Skirmish Armour (the blue bar over the castle) that brings the new player's deck closest to the target.
  - It isn't saved until you press Save.
  - If it says "too easy even at the top" or "too hard even with no Armour", change the enemy deck instead (below).
- **Check the whole map.** Fills the strip of chips under the tools, one per fight, coloured against each fight's target:
  - green is on target;
  - blue is too easy;
  - red is too hard.

## When Armour isn't enough

Change the enemy deck:
- **Too easy:** swap 2 copies of its weakest card for a stronger card that fits the map's theme. A card from a later map with the same theme works well.
- **Too hard:** do the reverse.

Then run Auto-tune Armour again. Keep at least 3 different cards so the fight has a recognisable plan.

## Whole campaign

`node tools/retune_all.js 60` re-measures every fight against the same targets and prints before → after. Options:
- `--apply` writes the changes.
- `--only=m2,3-2` limits the run to those maps or fights.
- `--borrow=m2:m7+mb` lets a map borrow themed cards from other maps.

The last full run's table is `docs/balance/retune-all.json`.

## Caveats

- The new-player deck ignores pack cards, so later maps are tuned a little easy for players who buy packs.
- The opponent and the "player" are both the game's AI. Real players play better, so treat ±10 points as on target.
