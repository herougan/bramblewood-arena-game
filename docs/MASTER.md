# Bramblewood Arena — Master Doc

**Purpose:** the short list of what matters most in this game, its status, and where each thing is defined.

**Rules for this doc**
- Keep it **under 20 items**. Anything else lives in the detailed docs.
- Each item gives:
  - **Status:** ✅ Built · 🟡 Partly built · 📝 Designed, not built · ⛔ Not in the game
  - **Where:** the file, function or doc that defines it
- When something ships or changes, edit its item here in place.

_Last updated: 2026-10-03_

## Quick check: what we do NOT have
- ⛔ **NFTs or blockchain:** none.
- ⛔ **Real-money purchases:** none. Gold Leaves is the "premium" currency, but nothing sells it for money.
- ⛔ **Loot boxes for money:** none. Card packs are bought with in-game currency only.
- ⛔ **Sudden death, daily/weekly quests, PvP tickets, autobattler draft mode:** designed, not built (items 3, 8, 12, 13, 15).

---

## Top of mind (19)

### Game core

**1. Cards** ✅
- 341 cards: units, structures and tokens.
- Stats: Attack, Health, Wait, Cost.
- Effects: passives, skills, and custom triggers.
- Rarity sets the copy limit per deck: Common 10 · Uncommon 5 · Rare 4 · Very/Super Rare 3 · Epic/Heroic 2 · Unique/Legendary/Mythic/Ancient 1.
- Hall of Fame editions (Classic/Antique) share their base card's limit.
- **Where:**
  - `canonical/cards.json` (the data)
  - `RARITY_MAX_COPIES` and `editionCapReached` in `arena_app.js`
  - `mechanics-guideline.md`

**2. Combat rules** ✅
- Both players plan, then one combat resolves both plans.
- Each card attacks the card across from it; if there is none, it hits the castle.
- Wait counts down before a card can attack.
- One play per turn. Hand limit is 5; extra draws are auto-pitched for Lumber.
- Castle at 0 HP loses.
- Fights are fully seeded and deterministic.
- **Where:**
  - `bramblewood-engine.js` (`resolveCombat`, `placeCard`)
  - `context-combat-engine.md`

**3. Sudden death and draws** 📝
- From **turn 20**: sudden death, **1 hit = die**.
  - To confirm: does this mean any hit kills the unit it lands on, any hit on a castle ends the game, or both?
- **Auto-draw** when nobody has an action they can take and the board isn't changing.
- **Forfeit** is always available.
- A stalled board is hard to detect in general, so the rule only checks "no legal actions + no state change", nothing cleverer.
- **Where:** not built yet. It would go in the engine's round loop, with the turn counter in `resolveRound` in `arena_app.js`.

**4. Battle modes** ✅
- **Gravity** (default): cards slide inward to the centre.
- **Open:** fixed slots.
- **Gladiator:** each side crowns one leader card.
- Chosen per elite node and in friend invites.
- **Where:** `BATTLE_MODES` and `Registry.battleModes()` in `arena_app.js`; `battleMode` in `makeSimEngine`.

**5. In-match resources** ✅
- **Lumber 🪵:** pitch a card for +1, at most once per turn. Pays card costs.
- **Grace 🕊️, Dark Points ★, Stone 🪨:** come from card effects.
- In-match gold is retired.
- **Where:** `newPlayer` and `canPlay` in the engine; `discardCardByUid` in `arena_app.js`.

**6. Deck, Leader, Castle** ✅
- A deck is exactly **20 cards**; every mode checks this before a fight.
- You also bring a **Leader**, summoned from a slot during the match.
- Your **castle ("Bramble")** comes from a character pick that sets its HP and passive.
- **Where:**
  - `deckSizeOkOrWarn`, `myLeaderId` in `arena_app.js`
  - `canonical/characters.json`

### Economy

**7. Account currencies** ✅
- 🍁 **Maple Leaves** (soft currency; called `gold` in the code)
- 🍂 **Gold Leaves** (premium; `gems` in the code)
- ✨ **Magic Dust**
- 🔩 **Metal**
- All four sync to the cloud.
- **Where:** `CURRENCY_META`, `grantCurrency` in `arena_app.js`; Supabase `player_currencies`.

**8. Gates: Energy, Tickets, Raid Points** 🟡
- ⚡ **Energy** ✅
  - Maximum 20, refills 1 per minute.
  - Conquest fights cost 1–5 by node kind.
  - Stored in this browser only.
- 🎟️ **PvP Tickets** 📝: **10 per day**, spent on PvP (item 12).
- 🎫 **Raid Points** ✅: only used by the hidden Online Raid.
- **Where:** `ENERGY_MAX`, `ENERGY_COST`, `spendEnergy` in `arena_app.js`.

**9. Getting cards** ✅
- Every card has one source:
  - **Base** (available from the start)
  - **Conquest node reward**
  - **Card pack** (by tier)
  - **Event** (no live events yet)
- Owned copies show in the **Nest**. The **Forge** levels cards up with currency.
- **Where:**
  - `cardSourceOf`, `cardWhereToGetText`, `SHOP_PACKS_DEFAULT`, `levelUpCost` in `arena_app.js`
  - `context-economy-progression.md`

**10. Reward philosophy** 📝 (principle; guides every reward number)
- Raw rewards from playing are deliberately **low**, so the gap between grinders and non-grinders stays small.
- The real rewards come from **limited** sources: quests (item 15).
- **Grinders get statistics medals:** recognition, not power, so they don't feel they lost out.
- **Catch-up mechanics:** to decide. One option is to make the game less punishing as it goes on.
- **Where:** this doc for now.

### Modes

**11. Conquest (campaign)** ✅
- 11 maps of skirmish, elite, boss and raid-boss nodes. Each costs Energy.
- Results show rank, rewards, unlocks and a Next Battle button.
- Starts with the seeded tutorial node.
- Admins can drag nodes on the map.
- **Where:**
  - `CONQUEST_MAPS`, `startConquestMatch`, `mapNodePositions` in `arena_app.js`
  - `game-design-v36`–`v38` addenda

**12. PvP: ticket battles** 📝
- Spend 1 of your **10 daily tickets** to fight a **random stranger's deck, played by the AI**.
- The stranger's deck **always goes first**.
- **Where:** not built. The deck pool can reuse the ghost decks (`bramblewood-ghosts.js` `buildStagePool`).
- Today's "Async Arena" (a 7-win / 3-loss run against ghosts, see `game-design-v39-addendum.md`) gets replaced by this mode and the draft mode below.

**13. Autobattler: draft run** 📝 (like Super Auto Pets / Bazaar-style async battlers)
- **Draft everything at the start:** your cards, your castle and your leader.
- You get **two leaders**; the **second (sub-leader) can be swapped** as you go.
- **Health:** start with **5**. Lose **1 per loss in rounds 1–3**, then **2 per loss**.
- **Goal:** reach **10 wins**. After that, **Endless** (11, 12, …) is optional, with a hard stop at **round 100**.
- **Boon after each round:** e.g. duplicate a card, +1/+1 a card, or add a passive.
- **Fights are CPU vs CPU**, so they're fast. The skill is deck-building, not piloting.
- Opponents are other players' runs at the same win count (ghosts). Each win stage needs ≥ 10 active decks, a requirement the ghost pool already meets.
- **Where:** not built.
  - Ghost pool and tests: `bramblewood-ghosts.js`, `tests/async-raid.js`
  - CPU vs CPU fight loop: `simulateOneMatch` in the engine

**14. Raids** 🟡
- **Target version:** async multiplayer. You and **N async players' decks, in rows, against one boss**, but you only fight **a fragment** of it, e.g. the head or the tail.
- The boss has **one global HP bar** worn down by everyone's chip damage. It goes through **stages** as the bar drops.
- **If it dies, everyone gets rewards. If it survives, everyone gets compensation rewards.**
- **Later kinds** (parked):
  - Full online, real-time with multi-castle mechanics (think tentacle boss)
  - Single-player async, where you can't win alone but your score chips the bar
- **Built today:**
  - A weekly offline boss with a shared pool, your recorded attempts, and 8 simulated stand-ins.
  - Online Raid is **hidden**, per your call.
- **Where:**
  - `raidState`, `simulateRaidFight` in `bramblewood-ghosts.js`
  - `offlineRaidPanelHTML` in `arena_app.js`
  - `canonical/raid-bosses.json`

**15. Quests: daily and weekly** 📝
- Rewards are tiered and decrease as you complete more.
- **Daily, tier 1:**
  - Use 40 Energy on Skirmishes
  - Use 3 PvP tickets
  - Defeat 12 units
- **Daily, tier 2 (smaller rewards):** Join a Raid, …
- **Weekly:** very rewarding, with the same internal tiers.
- **Where:** not built.

**16. Ranked and rating** ✅
- Rating with tiers.
- Live Ranked 1v1: real-time, host-authoritative.
- Leaderboard.
- **Where:**
  - `findLiveRankedMatch`, `startLiveRankedMatch` in `arena_app.js`
  - Supabase `live_queue`, `live_matches`, `profiles.rating`

### Platform

**17. Accounts, sync and social** 🟡
- Google or email sign-in; accounts with the same email are joined.
- **Synced:** currencies, card unlocks, decks.
- **Local only:** Conquest progress, avatar, Energy.
- Friends, private match invites (with battle mode) and the public market are built, but the **social migration is not applied yet**.
- **Where:**
  - `supabase/migrations/20261002_social_friends_invites_market.sql`
  - `cloudPullState` in `arena_app.js`

**18. Admin tools** ✅
- Admin Mode: card editor (publishes live through `card_overrides`), map layout editor, node rewards, Test Kit.
- The Admin tile is still visible to everyone; server-side writes are admin-only.
- **Where:** `setAdminMode`, `renderAdmin`, `cloudWriteCardOverride`, `wireMapLayoutEditor` in `arena_app.js`.

**19. Tests** ✅
- `tests/run-all.sh` covers:
  - **Card matrix:** 81k fights, golden snapshots
  - **Mechanic scenarios**
  - **Two-player:** policies, seat fairness, replay
  - **Async/raid pools**
- `--e2e` adds a two-browser live match.
- 54 user stories with acceptance criteria.
- **Where:**
  - `docs/testing-strategy.md`
  - `docs/user-stories.md`
  - `tests/`

---

## Parked (hidden, kept in code)
- **Online Raid:** hidden 2026-10-03.
- **Gauntlet, Dungeon, Pass & Play:** still in Arena; likely folded into PvP / Autobattler later.
- **Card pairings that never damage each other** (mostly armor walls): accepted as fine. Players will build decks that get through.

## Next 20 (later)
Not filled in yet, by request.
