# Bramblewood Arena — Master Doc

**Purpose:** the short list of what matters most in this game, its status, and where each thing is defined.

> ➡️ **Waiting on you** (details in [`decisions.md`](decisions.md), `claude/decisions.md` in the project):
> - **T3:** say "apply it" to switch on server-checked fights.
> - **D17:** sound direction (cosy, chiptune, or a mix, which is the current default).
> - **D18:** play Maps 1–4 and tell me how the difficulty and rewards feel.
> - **Lore:** your comments on [`lore-bible.md`](lore-bible.md); are dogs Legion war-dogs or wild beasts; which beasts the Hummingbirds befriend; the proposed card renames.
> - **Play-test:** the new sound, effects and immersion work has only been checked by tests and screenshots; it needs your eyes and ears.
> - **Languages:** translate card names, or keep them English? Native-speaker review for Tagalog, Tamil, Japanese and Korean.
> - **Hero:** play a few fights with one and say how the levelling pace and stat prices feel; do you want Materia socketing (v2) next?
> - **Sound samples (optional):** drop CC0 files for card play, draw, hit, heavy hit and death into `audio/` (Kenney's Impact and Casino packs are ideal). Real recordings will beat further synthesis, and I can't download them from here.
> - **Two discussion topics:** T1 and T2.

**🧭 Master hub:** [one page with tabs for this doc, the Effects Lab and the Visual Library, plus links to every other Bramblewood page](https://claude.ai/artifact/45sGJuWwy9T6ocC1D4K99J). The Effects Lab tab has a "Coming next" list of effects marked TBC. The library tab holds 439 shots; near-duplicates were pruned so everything fits in one page.

**⚡ Performance:** [`perf-2026-10-06.md`](perf-2026-10-06.md) explains why the game slowed with many cards, and what was cut (about 42% less main-thread work).

**🖼️ Screenshots:** shots before 5 Oct evening show fallback fonts (Claude's test browser couldn't load them); players always had the real fonts.

**Rules for this doc**
- Keep it **under 20 items**. Anything else lives in the detailed docs.
- Each item gives:
  - **Status:** ✅ Built · 🟡 Partly built · 📝 Designed, not built · ⛔ Not in the game
  - **Where:** the file, function or doc that defines it
- When something ships or changes, edit its item here in place.

_Last updated: 2026-10-06 (late morning): Master hub (this doc, Effects Lab and Visual Library as tabs); the Graveyard is its own pile on the right, and its +Lumber tip follows the held card and only shows over the Graveyard; no attack-line preview while holding a card; "👁 Show / 🙈 Hide" on the deck toggle; a loading screen that warms the shaders; castle cracks, low-HP tremble and idle breathing on the board; a "think contextually" rule in the style guide; 16 TBC effects listed in the lab. Earlier 2026-10-06 (morning): bow-shot choreography for Arrow and Fire Arrow, a crit symbol, damage-type icons, a normal knock-out death, heal sound v2, the card face (name at the top, cost and Wait as pips, larger wing), and 8 new skill prototypes in the Effects Lab. Earlier 2026-10-06: your 11-point feedback (victory rush fixed, thinner HP bars, laptop-fit results, attack line under cards, pitch badge, anchored tutorial tips, castle/leader picker, deck view polish, performance pass, Outskirts rain) plus the Effects Lab. Before that, 2026-10-05 (night): visual library; card legibility, deck top and card detail; shadows, hit-stop and danger layer. Before that: effects recommendations, felt shockwave and panned hits (item 20); 🦸 Hero card (item 1). Before that: languages; places (Tent, Cart, Nest); world, look and sound (item 20), asset split, snap test. Earlier: `game-design-v40-addendum.md`._

## Quick check: what we do NOT have
- ⛔ **NFTs or blockchain:** none.
- ⛔ **Real-money purchases:** none. Gold Leaves is the "premium" currency, but nothing sells it for money.
- ⛔ **Loot boxes for money:** none. Card packs are bought with in-game currency only.
- ⛔ **Catch-up mechanics:** still a design (item 10).
- ⛔ **Steering a raid fight:** trench fights auto-play; you choose your row but don't act during the fight (item 14).

---

## Top of mind (20)

### Game core

**1. Cards** ✅
- 341 cards: units, structures and tokens.
- Stats: Attack, Health, Wait, Cost.
- Effects: passives, skills, and custom triggers.
- Rarity sets the copy limit per deck: Common 10 · Uncommon 5 · Rare 4 · Very/Super Rare 3 · Epic/Heroic 2 · Unique/Legendary/Mythic/Ancient 1.
- Hall of Fame editions (Classic/Antique) share their base card's limit.
- **Card legibility** (2026-10-05):
  - Cost and Wait pills are dark enamel with a bright rim.
  - Attack and Health sit on dark chips.
  - Damage numbers use a chunky face with a lit gradient over a separate outline, tinted by type and bigger for 8+.
  - Names are a step smaller, more so on tablets.
  - The card detail view has two columns (the card, then name, chips, stat tiles, abilities and where to get it).
  - The UI fonts are now hosted with the game (`fonts/`).
- **Card sizes scale** with each card's own width (size tokens xs–xl). Names sit on a parchment scroll. Card levels show only in the Nest, the Forge and the deck builder's level filter.
- **🦸 Hero card** ✅ (new, [design](hero-design.md)): your own card, built from Deck → 🦸 Hero.
  - Pick a people (Legion, Sunfeather or Road-folk) and a name; it takes one deck slot.
  - It levels to **100** from battles (win +30, +10 if played; loss +10) and from crafting 💎 Materia (25 ✨ → +30 XP, in the Hall or the Forge bench).
  - You spend stat points (+1 Attack = 5, +1 Health = 1, Wait 0 = 25) and pick 1 of 3 skills at Levels 5/15/30/50/75/100.
  - Cost rises 1 → 4 with level. A maxed Hero is level with the top Legendaries.
  - **Single-player only for now:** it's removed from ghost, raid and live decks until the server can check it.
- **Where:**
  - `canonical/cards.json` (the data)
  - `RARITY_MAX_COPIES` and `editionCapReached` in `arena_app.js`
  - `heroDef`, `renderHeroHall`, `craftMateria` in `arena_app.js`
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

**3. Sudden death, draws and surrender** ✅
- From **turn 20**, any hit that lands kills the unit it hits, and any hit on a castle ends the game. A banner announces it.
  - **Raids:** only the unit half applies. Otherwise surviving to turn 20 would hand anyone the whole boss castle.
  - This is my reading of "1 hit = die"; it's one setting if you meant otherwise.
- **Auto-draw:** when neither player has a card left in hand or deck and the board hasn't changed for 2 rounds. Also at **turn 100**.
- **Forfeit:** a 🏳️ button in single-player modes. It counts as a loss and shows the normal results screen.
- **Enemy behaviour when it runs dry** (nothing playable, no damage dealt last round, nothing still under Wait). Picked per opponent from the seed, or set per node:
  - **Surrender** (~70%): you win.
  - **Offer a draw** (~20%): a popup, and the offer stays in ⚙️.
  - **Never surrender** (~10%, and every boss): it keeps throwing 1/1 Frog & Fly Imps (`loopCards`).
- **Where:**
  - Engine: `SUDDEN_DEATH_ROUND`, `setSuddenDeath`, `boardSignature`, `noActionsLeft`, `DRAW_ROUND_CAP`
  - App: `resolveRound`, `forfeitMatch`, `setupEnemyBehaviour`, `enemyIsSpent` in `arena_app.js`
  - Tests: `tests/scenarios/sudden-death.json`

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
- The deck builder opens with the castle and leader as real cards, beside the deck's archetypes, average attack, health and cost, size, level and Hero. **Tap the castle or leader to choose a new one** in a picker; the old inline Bramble and Leader sections are gone.
- Your **castle ("Bramble")** comes from a character pick that sets its HP and passive.
- **Deck level** = Σ rarity weight × card level, with the leader counted double.
  - Weights run Common 1 → Mythic 9 → Ancient 10.
  - So 20 Commons at level 1 is a level-20 deck. Shown on each deck.
- **Where:**
  - `deckSizeOkOrWarn`, `myLeaderId`, `mainDeckLevel` in `arena_app.js`
  - `deckLevelOf` in `bramblewood-autobattle.js`
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
- 🎟️ **PvP Tickets** ✅: **10 per day**, refilled at local midnight, spent on PvP (item 12). Stored in this browser only.
- 🎫 **Raid Points** ✅: max 5, 1 per 6 hours. Each Goliath fight costs 1🎫 + 4⚡ (set in the Raid editor).
- **Where:** `ENERGY_MAX`, `ENERGY_COST`, `spendEnergy`, `PVP_TICKETS_PER_DAY`, `usePvpTicket` in `arena_app.js`.

**9. Getting cards** ✅
- Every card has one source:
  - **Base** (available from the start)
  - **Conquest node reward**
  - **Card pack** (by tier)
  - **Event** (no live events yet)
- **Pack 1 = 33 cards.** Packs give real cards (3/5/8; the bigger two guarantee one new card) with a pack-opening animation.
- Owned copies show in the **Nest**. The **Forge** levels cards up with currency.
- **Where:**
  - `cardSourceOf`, `cardWhereToGetText`, `SHOP_PACKS_DEFAULT`, `levelUpCost` in `arena_app.js`
  - `context-economy-progression.md`

**10. Rewards, XP and levels** 🟡 (the reward principle guides every number)
- Raw rewards from playing are deliberately **low**, so the gap between grinders and non-grinders stays small.
  - PvP pays 18 / 6 Maple Leaves for a win / loss.
  - An Autobattler run pays 8 per win, plus a bonus at 10 wins.
- The real rewards come from **limited** sources: quests (item 15).
- **Statistics medals** ✅ are built. Lifetime totals of units defeated, wins, PvP wins, Conquest clears, raid damage and Energy spent earn Bronze → Silver → Gold → Platinum. They're recognition, not power.
- **Player level** ✅ — uncapped. Each level needs 18% more XP than the last (100 to reach level 2).
  - Playing pays a trickle: 3 XP per win.
  - The real XP comes from quests (tier 1 daily 100, tier 1 weekly 400).
  - …and one-time milestones: first clears, map clears, collection size, rating reached, medals, Autobattler 10 wins.
- **Catch-up mechanics:** to discuss — see T1 in `decisions.md`.
- **Where:** `STAT_MEDALS`, `bumpQuestCounter`, `awardXp`, `xpMilestones` in `arena_app.js`; quest rewards in `QUEST_TIERS`.

### Modes

**11. Conquest, onboarding and dialogue** ✅
- 11 maps of skirmish, elite, boss and raid-boss nodes. Each costs Energy.
- **Joined world:** unlocked maps with progress, plus one "Next: … 🔒". Neighbour maps peek in at the edges; tabs, edges and swipes pan the world to that map.
- Results show rank, rewards, unlocks and a Next Battle button. Admins can drag nodes on the map.
- **Conquest-first onboarding:**
  - After the seeded tutorial, the leaves part to reveal the map. A new player has only Play, Settings and Profile.
  - Features are found as **! icons on the map**:
    - ⛺ Deck/Codex after 1-1
    - 🪺 Nest after 1-2
    - 📜 Quests after 1-3
    - 🏟️ Arena when map 2 opens
    - 🛒 Shop when map 3 opens
    - 🧩 Autobattler after 3-2
    - 🐲 Raid when map 4 opens
  - Clicking one: a short speech, then straight in.
  - Players who were already past the tutorial keep what their progress earned.
- **Dialogue:** the lore cast talks in non-blocking bubbles (top-left). When they address you, you have 30 s to reply; silence counts as "…" and takes its own branch.
- **Where:**
  - `CONQUEST_MAPS`, `startConquestMatch`, `mapNodePositions`
  - `FEATURE_SPOTS`, `tabOpen`, `leavesRevealToMap`
  - `DIALOGUES`, `playDialogue`
  - …all in `arena_app.js`; also `game-design-v36`–`v38` addenda

**12. PvP: ticket battles** ✅
- Spend 1 of your **10 daily tickets** to fight a **random stranger's deck, played by the AI**.
- **"They always go first":** the stranger plays its card at the start of every round, before you plan, and wins every same-column tie.
- Strangers come from the ghost pool at the stage that matches your rating. Every PvP match also records your deck, so you become a stranger for others.
- Wins and losses move your rating.
- It's the ⚔️ PvP tile in Arena. The old 7-win / 3-loss Async Arena tile is hidden.
- **Where:** `pvpOpponentPool`, `settlePvpAfterMatch` in `arena_app.js`; `buildStagePool` in `bramblewood-ghosts.js`.
- **Next:** a cloud table so strangers are other real players, not only this browser's decks plus seeds.

**13. Autobattler: draft run** ✅ (like Super Auto Pets / Bazaar-style async battlers; its own 🧩 tab in Play)
- **Draft:** pick 1 of 3 for your castle, leader and sub-leader, then 10 card picks. That makes a **10-card deck + 2 leaders**.
- **Bench:** holds up to 6 stored cards, swapped in between fights. Duplicates land there when the deck is full.
- **Levels:** every card starts at level 1, and each +1/+1 or passive boon adds a level. Deck level is shown (leaders count double). Castles gain +10% health per fight.
- **Leaders:** the leader starts every fight on the board. The sub-leader joins on round 4 and can be swapped between fights (1 of 2 offers, once per fight).
- **Health:** 5. A loss in fights 1–3 costs 1; later losses cost 2.
- **Goal:** 10 wins, then **cash out or go Endless**. Endless hard-stops at fight 100.
- **Boon after every fight:** pick 1 of 3 — duplicate a card, +1/+1, or add a passive (Armor, Thorns, Poison, Flying, …). Changed cards are run-only copies, never the real card.
- **Fights are CPU vs CPU** and resolve instantly (about 35 ms). The results screen shows castles, rounds and your MVP card.
- **Opponents:** ghost runs at the same number of wins, at least 12 per stage including Endless, topped up with seeded ghosts. Your run is recorded as a ghost each fight.
- **Where:**
  - Rules and simulation: `bramblewood-autobattle.js`
  - UI: `renderAutobattleSubTab` in `arena_app.js`
  - Tests: `tests/autobattle.js`
- **Next:**
  - a "watch the fight" replay;
  - a cloud ghost table, so you meet real players.

**14. Raids** 🟡 — full design and editor plan in `raid-design.md`
- **Target version:** async multiplayer. You and **N async players' decks, in rows, against one boss**, but you only fight **a fragment** of it, e.g. the head or the tail.
- The boss has **one global HP bar** worn down by everyone's chip damage. It goes through **stages** as the bar drops.
- **If it dies, everyone gets rewards. If it survives, everyone gets compensation rewards.**
- **Later kinds** (parked):
  - Full online, real-time with multi-castle mechanics (think tentacle boss)
  - Single-player async, where you can't win alone but your score chips the bar
- **Built today (Raid P1, 2026-10-03):** 🐙 **The Goliath**
  - Four parts with stacked 80,000-HP bars: Left Tentacle, Right Tentacle, Tail (3 bars each) and the Core (8 bars, **locked until all three fall**, globally).
  - **Trenches (P2):** each fight is 3 rows: you play yours turn by turn; the two allies are CPU on other raiders' recent decks, or the raid's default ally decks. Telegraphed columns glow soft red. Boss hits roll through empty front columns to the rows behind; Tentacle Smack hits a telegraphed column; the Core has three stumps that buff each other and shield its castle, plus +1 Wait and 67% dodge.
  - You pick an open part and a row; the fight lasts **12 turns**. Castle damage × 15 (Core stumps × 140) = raid damage, capped at **5,000**; destroying the part's castle (an **overwhelm**) scores **10,000**.
  - Tuned so a typical trench scores ≈4.5k on an outer part (0–10% overwhelms) and ≈2.2k on the Core (0% overwhelms).
  - Stages: Enraged < 75%, Thrashing < 50%, **Exposed < 1%** (enemy cards lose their abilities).
  - Everyone who fought claims the kill reward when it falls (400 gold, 60 dust, 3 metal), or 40% as compensation if it survives the week, plus Top 1/10/50% extras.
  - Pools are live (`raid_week_attempts`), with stand-in raiders at 12%/day so a quiet week can still finish it.
  - The older single weekly boss shows only if no raid is live. Online Raid stays **hidden**.
- **Where:** `bramblewood-raid.js`, `bramblewood-trench.js`, `canonical/raids.json`, `openTrenchSetup` / `openTrenchMatch`, `raidPanelHTML` / `startRaidPartMatch` / `openRaidEditor` in `arena_app.js`, `tests/raid.js`, `tests/trench.js`.

**15. Quests: daily and weekly** ✅ (📜 Quests on Home, with a badge when something is claimable)
- Each tier appears once the tier above is fully claimed, and rewards shrink tier by tier.
- **Daily** (resets at local midnight):
  - **Tier 1** (60 🍁 + 8 ✨ each): use 40 ⚡ on Conquest, use 3 PvP tickets, defeat 12 units.
  - **Tier 2** (30 + 4): join a Raid, win 2 matches, clear 2 Conquest fights.
  - **Tier 3** (15 + 2): defeat 30 units, win 2 PvP matches.
- **Weekly** (resets Monday): the same shape with bigger goals. Tier 1 pays 300 🍁 + 40 ✨ + 3 🔩 each.
- **Where:** `QUEST_TIERS`, `bumpQuestCounter`, `openQuestsModal` in `arena_app.js`. Counters are local for now.

**16. Ranked and rating** ✅
- Rating with tiers.
- Live Ranked 1v1: real-time, host-authoritative.
- Leaderboard.
- **Where:**
  - `findLiveRankedMatch`, `startLiveRankedMatch` in `arena_app.js`
  - Supabase `live_queue`, `live_matches`, `profiles.rating`

### Platform

**17. Accounts, sync, live data and social** 🟡
- Google or email sign-in; accounts with the same email are joined.
- **Synced:** currencies, card unlocks, decks.
- **Live tables** ✅ (migration applied 2026-10-03):
  - `ghost_decks`: PvP strangers and Autobattler runs
  - `raid_week_attempts`: the weekly raid party and shared pool
  - `player_progress`: Conquest, quests, stats, XP, tickets, autobattler run, unlocks, dialogue
  - If the cloud is unreachable, the game falls back to this browser's copy.
- Friends, private match invites (with battle mode) and the public market ✅ (social migration applied 2026-10-03).
- **Where:**
  - `supabase/migrations/20261003_live_ghosts_raid_progress.sql`
  - `supabase/migrations/20261002_social_friends_invites_market.sql`
  - `LiveData`, `cloudPullState` in `arena_app.js`

**18. Admin tools and editors** 🟡
- **Ready:** card editor (publishes live through `card_overrides`), map layout editor, node rewards, **Skirmish editor**, **Raid editor** (parts, bars, locks, decks, turns, stages, scoring, rewards, simulate vs your deck; Raid tab → ✏️ Edit raid, or Admin → 🐙 Raids), Test Kit, and "Unlock all features / Replay onboarding".
- **Simulator:** lists the decks you've fought recently, with "Simulate vs my deck".
- **Not built:** a visual grid editor for raid entities (they're edited as lists today).
- The Admin tile is still visible to everyone; server-side writes are admin-only.
- **Where:** `setAdminMode`, `renderAdmin`, `cloudWriteCardOverride`, `wireMapLayoutEditor` in `arena_app.js`.

**19. Tests** ✅
- `tests/run-all.sh` covers:
  - **Card matrix:** 81k fights, golden snapshots
  - **Mechanic scenarios**
  - **Two-player:** policies, seat fairness, replay
  - **Async/raid pools**
  - **Autobattler:** draft, health, boons, leaders, ghosts, and 30 full runs
- `--e2e` adds:
  - a two-browser live match;
  - the UI smoke test;
  - flows (quit from every mode, the tutorial lock);
  - **snaps:** no card, castle or hand tile may jump between frames, desktop and phone;
  - **i18n:** every language pack loads and translates;
  - **hero:** create, level, spend, pick, craft, and win a fight for XP.
- 54 user stories with acceptance criteria.
- **Where:**
  - `docs/testing-strategy.md`
  - `docs/user-stories.md`
  - `tests/`

### World

**20. World, look, sound and language** 🟡 (lore and art direction are set; the art is partly placeholder)
- **Lore:** [`lore-bible.md`](lore-bible.md) defines seven peoples:
  - the Rivergate Legion (Otters: pre-Roman, trains fish);
  - the Sunfeather Tribes (Hummingbirds: colourful, beast-friends);
  - road-folk (mice and rats);
  - supporting folk (other mammals);
  - beasts (carnivores);
  - hives;
  - the Deep.

  Skirmish rivals speak and are labelled by their people.
- **Map art:** procedural pixel terrain for all 11 maps (`tools/make_map_backgrounds.py`). Battles are fought on that terrain. AI art can replace it through `tools/gen_map_bg_ai.py` (OpenRouter; blocked from Claude's workspace).
- **Effects** ([catalogue](effects-catalogue.md)):
  - holo foil by rarity; gold-leaf rims on Legendary+;
  - bleed-out and burn deaths, castle collapse;
  - a lit felt texture with coloured impact lights;
  - splash depth parallax and a water mask;
  - Arrow and Fire Arrow projectiles;
  - a shockwave across the felt on castle hits and heavy blows;
  - cards cast soft shadows on the felt, away from the lamp;
  - struck cards squash and recoil, with a short hit-stop on heavy blows;
  - a heartbeat and a red edge pulse while your castle is under 25%;
  - a sting at sudden death;
  - the ambience dips under big moments;
  - each map's ground has its own material (wet glints, ember cracks, frost, sand ripples);
  - rivals babble their taunt in a voice for their people.
- **Next for effects:** a ranked list of animation, shader and sound additions, in [effects-catalogue.md → Recommendations](effects-catalogue.md). Done so far: hit-stop, card shadows, ducking, the danger layer. Also done: map materials, rival voices. Also done: the pack reveal build-up. Next: real sound samples (S3, needs your files), the walking map pawn (A6), the hourglass flip on Wait (A7).
- **Sound:** synthesised cues ([cue sheet](sfx-cue-sheet.md)), with hits and deaths panned left or right to where they happen; per-place ambience on the "🎵 Music & ambience" slider; the live clock adds crickets and a dawn chorus.
- **Immersion** ([doc](immersion-2026-10-05.md)):
  - ✅ per-place ambience;
  - ✅ fights on the map's own ground;
  - ✅ a versus opener with the rival's people and lines;
  - ✅ a live clock (dawn, day, dusk and night tints, default on, `?tod=` to preview);
  - ✅ diegetic screens, each with its own entrance and sound:
    - Deck is the Armoury Tent;
    - Shop is the Traveller's Cart;
    - Nest is the Old Nest;
    - Codex → Forge is the Forge;
    - other screen changes get a gust of leaves.
- **Languages** ([doc](i18n.md)):
  - English plus 12 languages: FR, DE, ES, IT, PT, Tagalog, Tamil, Indonesian, Simplified and Traditional Chinese, Japanese, Korean.
  - Picked in Settings → 🌐 Language.
  - The main frame is translated (about 130 strings); the rest falls back to English.
  - Card names stay English for now (your call).
- **Delivery:** art loads from `assets/` (content-hashed URLs, idle warm-up). The page dropped from 7.8 MB to 3.2 MB (1.0 MB compressed). `BW_INLINE=1` gives a single-file build.
- **Where:**
  - `PLACES`, `Ambience`, `showVersusOpener`, `peopleOfDeck`, `setAtmosphere('live')`, `battleLightAt` and `boardSnapGuard` in `arena_app.js`
  - `bramblewood-shaders.js`
  - `bramblewood-i18n.js` and `lang/*.json`
  - `assemble_arena.py`

---

## Parked (hidden, kept in code)
- **Online Raid:** hidden 2026-10-03.
- **Async Arena (7W/3L ghost run):** hidden; replaced by PvP + Autobattler. The code and its saved-match Continue are kept.
- **Gauntlet, Dungeon, Pass & Play:** still in Arena; likely folded into PvP / Autobattler later.
- **Card pairings that never damage each other** (mostly armor walls): accepted as fine. Players will build decks that get through.

## Next 20 (later)
Not filled in yet, by request.
