# Bramblewood Arena — Decisions

_Generated from `decisions.json` (2026-10-10). The hub has a searchable, filterable version: YET (waiting on you) and DONE._

## Waiting on you

**T3. Apply the server-checked fights migration** · Decide · Server · asked 2026-10-03
- The fight_sessions migration (single-use seed, transcript, server replay) is written and the client is ready. Nothing changes until it is applied.
  - Say "apply it" and I run supabase/migrations/20261003_fight_sessions.sql
  - Wait
- **Default:** Wait (local seeds keep working)

**D17. Sound direction and sourcing** · Decide · Sound · asked 2026-10-03
- Overall feel for the cue sheet (sfx-cue-sheet.md), and whether to use CC0 packs or your own recordings. Real samples will beat more synthesis; I can't download them from here.
  - A. Cosy and organic
  - B. Chiptune
  - C. Mixed (organic world, chiptune UI)
  - Drop CC0 files (Kenney Impact/Casino) into audio/
  - Send your own files
- **Default:** C, CC0 when files arrive

**D18. Play Maps 1–4 and say how difficulty and rewards feel** · Feedback · Balance · asked 2026-10-03
- Map 1 is an on-ramp; Maps 1–2 have reward cards; Map 2 retuned. Note: since 2026-10-08 Conquest fights default to Open mode (no collapsing), which changes how the AI and positions play, so the old difficulty numbers need a re-check.
- **Default:** I re-simulate win rates under Open mode next

**L1. Which beasts the Hummingbirds befriend; proposed card renames** · Decide · Lore · asked 2026-10-06
- Open questions from lore-bible.md. Dogs and cats are settled (see L2).
- **Default:** Keep current names

**I1. Native-speaker review for Tagalog, Tamil, Japanese and Korean** · Decide · Languages · asked 2026-10-06
- Machine-quality translations ship now (including card names). A native pass would catch tone and idiom.
  - Find reviewers
  - Ship as is
- **Default:** Ship as is

**I2. Translate text that contains numbers** · Decide · Languages · asked 2026-10-08
- Lines like "3 cards", "Pack 2 of 10", "N new cards!" stay English because the translator matches whole strings. Fix: number-aware templates for each language.
  - Approve the template change
  - Leave English
- **Default:** Approve

**H1. Hero levelling pace, stat prices, and Materia socketing (v2)** · Feedback · Hero · asked 2026-10-06
- Play a few fights with a Hero and say how it feels; do you want Materia socketing next?

**H2. The 3-part Hero XP bar (feedback item 17)** · Decide · Hero · asked 2026-10-08
- How the three XP bars should split (battle XP, Materia XP, ...?) — needs your picture of it.

**E1. A free pack for guests before sign-in** · Decide · Economy · asked 2026-10-08
- Let a guest open one Sprout Pouch before asking them to sign in.
  - Yes
  - No
- **Default:** Yes

**E2. Disenchant values (Magic Dust per extra copy)** · Confirm · Economy · asked 2026-10-08
- Built with: Common 5, Uncommon 8, Rare 15, Very Rare 20, Super Rare 30, Epic 40, Heroic 50, Unique 60, Legendary 100, Mythic 150, Ancient 200. Never Base/Quest/levelled/foil/Shiny; keeps one copy.
  - Keep
  - Change the numbers
- **Default:** Keep

**C1. Which cards get the six new finishes** · Decide · Cards · asked 2026-10-08
- Hex, Etched, Ice, Gold leaf, Reverse and Prism are built (Effects Lab → Card treatment centre). Who gets them: rarities, events, pack tiers, prestige?

**G1. Combo counter** · Decide · Battle · asked 2026-10-07
- A counter for chains of triggered abilities in one round, with escalating sound/visuals.
  - Build it
  - Skip

**G2. Siding with Otters or Hummingbirds (proposal)** · Decide · Lore · asked 2026-10-08
- See siding-proposal-2026-10-08.md: a standing meter moved by dialogue choices and which side's fights you take, unlocking side-specific rewards, titles and a late-game fork.
  - Approve as written
  - Change parts
  - Not yet

**T1. Catch-up mechanics** · Discuss · Design · asked 2026-10-03
- Rested XP, a weekly comeback quest tier, cheaper early Conquest once you've cleared further, a gentler curve.

**T2. Replays** · Discuss · Design · asked 2026-10-03
- Watch-only or re-fight this deck? Share links? How many to keep?

**N1. The Nest repeats the Codex** · Discuss · Design · asked 2026-10-08
- You noted the Nest overlaps the Codex. Kept for now. Ideas when you're ready: the Nest as your trophy shelf (Shinies, foils, prestige), or merge it into Codex as an Owned filter.
- **Default:** Keep for now

**S1. Apply the admin player list function** · Decide · Server · asked 2026-10-08
- The Admin → Players portal reads one admin-only, read-only database function (admin_list_players: profiles, levels, currencies, cards, matches; no emails). Written in supabase/proposed/20261008_admin_list_players.sql. Applying it (and the panel that reads it, already drafted) was held for your OK.
  - Say "apply it" (admin list)
  - Wait
- **Default:** Apply

**S2. Anti-cheat tier 1** · Decide · Security · asked 2026-10-08
- Players can currently edit their own rating and currencies from the browser console. Tier 1 makes rating read-only and refuses any single write that adds more than 2,000 Maple / 200 Gold Leaves. supabase/proposed/20261008_anticheat_tier1.sql.
  - Apply tier 1
  - Change the caps
  - Wait
- **Default:** Apply tier 1

**S3. Turn on leaked-password protection** · Do · Security · asked 2026-10-08
- Supabase dashboard → Auth → Passwords → leaked password protection. Free, one click, needs your login.
  - Done
  - Skip
- **Default:** Done

**S4. SonarCloud as well as CodeQL?** · Decide · Security · asked 2026-10-08
- CodeQL now scans every push (free, GitHub → Security). SonarCloud adds code-quality and duplication reports; it needs you to sign in at sonarcloud.io and add a token.
  - Add SonarCloud
  - CodeQL is enough
- **Default:** CodeQL is enough

**A1. API keys + monthly caps for GPT Image and fal/Kling** · Do · Art · asked 2026-10-08
- Create the keys yourself, keep them as local environment variables (never in the repo), set a monthly cap in each dashboard. Nothing is bought without your OK. See asset-pipeline-action-items.md.
  - Done
  - Not yet
- **Default:** Not yet

**A2. Train a Bramblewood pixel LoRA?** · Decide · Art · asked 2026-10-08
- FLUX.2 [dev] trained on ~30 of our PixelLab cards (~$6.40 per 1,000 steps on fal), for Maps 9–10 cards and Home sprites while PixelLab is capped.
  - Yes, test on 10 cards
  - Not yet
- **Default:** Yes, test on 10 cards

**A3. 30 s trailer from Kling clips** · Decide · Marketing · asked 2026-10-08
- 5–6 Kling 3.0 image-to-video clips (splash crowd, pack tear, Shiny reveal, Ember Chipmunk fire, castle fall) cut with gameplay capture.
  - Go
  - Later
- **Default:** Later

**F3. Enchant and Refine numbers** · Confirm · Cards · asked 2026-10-08
- Enchant: Ember +1⚔ (scorch), Stone +3❤, Tide +2❤, Grove +1⚔+1❤. Refine costs from 40✨+100🍁 (Foil) up to 200✨+450🍁+10🍂 (Gold leaf). Tide is currently a weaker Stone; give it something of its own?
  - Keep
  - Retune
- **Default:** Keep

**C3. Victory shift and the castle's white gradient** · Clarify · Battle · asked 2026-10-09
- Couldn't reproduce either. Which cards move at the end of a fight, and when? Where does the white gradient on the castle show (fight, map, results)? A screenshot would settle both.

**E9. What do Krooni 👑 buy?** · Decide · Economy · asked 2026-10-09
- The Golden case gives 3 Krooni. Nothing spends them yet, and they're kept on this device only (no database column). Ideas: cosmetic finishes, a Krooni-only pack, or Hero rarity boosts.
  - Cosmetics
  - A Krooni pack
  - Hero boosts
  - Decide later
- **Default:** Decide later

**E10. Promotion cost and level** · Decide · Economy · asked 2026-10-09
- Worker Ant promotes at Lv 3 for 60 Maple Leaves + 20 Dust. The ant goes back to Lv 0, so it can be promoted again into the other choices. Ant Warrior uses the Soldier Ant's art for now.
  - Keep
  - Higher level (5)
  - Free promotion, keep the level
- **Default:** Keep

**E11. Nurse master bonus** · Decide · Economy · asked 2026-10-09
- The Nest Nurse (a Unique+ card or the Wandering Traveller) is in, but what it does is still open. Ideas: eggs hatch 25% faster; a small chance a hatch comes out Shiny.
  - Faster hatching
  - Shiny chance
  - Both
- **Default:** Faster hatching

**D20. Devilry: my readings of your list (all built, all revertible)** · Decide · Design · asked 2026-10-10
- Built as I read them: (1) Dark Summon is a second play each turn, just for ⛧ cards, and every Dark Summon card also costs Darkness (a free extra play measured at 100%). (2) Darkness comes from your own units perishing (+1 each); 'dark actions' were left open. (3) Devour uses your play for the turn and works once per devourer. (4) Ritual's 'units perished' counts both sides. (5) Sacrifice N sits on the fodder; the discount comes off Darkness first, then Lumber. (6) Your blank keyword is named Offering N. 2026-10-10 (you: 'darkness is not clear. Is it gained? idk'): yes, it is gained: +1 each time one of YOUR units perishes (Ash Imp adds +1 on arrival). It's shown only if your deck has at least one Devilry card: the pill reads '★ 3 · ⛧ 1' (Darkness held, dark summons left this turn), and each gain floats a ★ +1. You gain 1 dark summon per turn; it doesn't stack.
  - Keep all six
  - Change some (tell me which)
- **Default:** Keep all six

**D21. Backstab: what should it do?** · Decide · Design · asked 2026-10-10
- You listed Backstab as a neutral skill without a rule. Suggestion: Backstab N, +N damage when it hits a unit that is facing a different target (rewards Pitchfork, Sweep and off-centre angles).
  - Use the suggestion
  - Something else (tell me)
  - Drop it
- **Default:** Use the suggestion

**D22. Fast Forward counters: build next?** · Decide · Design · asked 2026-10-10
- Your rule: with N counters, a unit runs its turn, upkeep included, N extra times before joining the main action order. It needs a pre-combat pass in the engine, about half a day of work with tests.
  - Build it next
  - After Ecclesia
  - Later
- **Default:** After Ecclesia

**D24. Arena rules: daily rotation and the second-player card** · Decide · Balance · asked 2026-10-10
- Built: the Arena's rule set changes daily (Standard, Long Night, Midsummer, Dusk Start, Timber Fair with +1 Lumber every 3 rounds, Frost Week, Fog on the Moor). In every Arena set, whoever plays second opens with an extra card. Conquest keeps day-first, no extra card and no free Lumber unless a fight sets its own rules; Live Ranked plays Standard. Should Conquest also give the second player the extra card (it would need a retune)?
  - Keep Conquest as is
  - Add the second-player card to Conquest too
  - Change the rotation
- **Default:** Keep Conquest as is

**D19. Archetypes: which to build first** · Decide · Design · asked 2026-10-09
- archetypes-design-2026-10-09.md has 10 archetypes plus the Elder / Outer / Forgotten trio. Suggested order: an active Exile zone, Swarm, Tide, Devilry circles, Elder Ones, then Evolution ride. Each archetype lists its open questions. 2026-10-09 (default taken on 'continue'): Swarm built first (Swarm N + Hive Mind on ants and bees). Then Tide (taken on 'continue', revertible): Flow/Ebb each round from round 2; Tide +1 on Flow, -1 damage taken on Ebb; Wash pushes the facing enemy +1 Wait once; 18 water cards tagged, 7 trimmed back into band, 28 water fights retuned. Then the active Exile zone (also on 'continue', revertible): Echoes 🕯️ (+1 per card sent to your Removal Zone) and Remember N (returns from the zone at N Echoes), with Echo Keeper, Marsh Wisp and Bog Revenant. Then the Forgotten Ones (also on 'continue', revertible): Remember returns +1/+1 per Echo spent, the Forgotten tag, and The Unremembered (Swampmire boss reward). 2026-10-10: Devilry built from your new list (see D20). Next suggested: Ecclesia with your Prayer value (D23).
  - Ecclesia next (D23)
  - Scrapper next
  - Evolution next
  - Pause archetypes
- **Default:** Ecclesia next (D23)

## Decided

**E3. Shiny look** · Decide · Cards · asked 2026-10-08 · decided 2026-10-08
- **Outcome:** Hue shift, not a foil: the art is recoloured by a fixed per-card hue (90–270°), soft white glow, twinkling ✦. Prism stays a foil treatment.

**E4. Pack set discounts** · Decide · Economy · asked 2026-10-08 · decided 2026-10-08
- **Outcome:** Revised 2026-10-08: 1/10/25/50/100 packs = 0/5/6/7/7.5% off. Built.

**G3. Skirmish default mode** · Decide · Battle · asked 2026-10-08 · decided 2026-10-08
- **Outcome:** All Conquest skirmishes default to Open (no collapsing). Gravity (collapsing) is special, set per skirmish. Built.

**G4. Frozen field effect** · Decide · Battle · asked 2026-10-08 · decided 2026-10-08
- **Outcome:** Tundra fights: Field card by the enemy deck, snowfall, one card per side +1 Wait each turn with an ice pulse. Built.

**L2. Dogs and cats** · Decide · Lore · asked 2026-10-06 · decided 2026-10-08
- **Outcome:** Neutral creatures, not pets: friends of both peoples. War dogs carry weapons in their mouths and stay four-legged. Recorded in lore-bible.md.

**I3. Translate card names** · Decide · Languages · asked 2026-10-06 · decided 2026-10-08
- **Outcome:** Yes: card names are translated in all 12 languages.

**E5. Disenchanting rules** · Decide · Economy · asked 2026-10-08 · decided 2026-10-08
- **Outcome:** Base and Quest cards can't be disenchanted (Base cards level up through play, 1–10). Levelled cards and cards with a skin are never disenchanted. A quick Disenchant extras button keeps one of each.

**E6. Shiny chance** · Decide · Cards · asked 2026-10-08 · decided 2026-10-08
- **Outcome:** 0.5% for every card received, Base and Quest included.

**U1. Unfinished fights** · Decide · UI · asked 2026-10-08 · decided 2026-10-08
- **Outcome:** No Resume/Discard pop-up; Home's Play tile turns into a green Continue with the fight as its subtitle.

**U2. Tutorial hands over the starter deck** · Decide · UI · asked 2026-10-08 · decided 2026-10-08
- **Outcome:** After the last tutorial win the player presses Add to deck and watches the cards go in.

**D15. PixelLab credits** · Decide · Art · asked 2026-10-03 · decided 2026-10-03
- **Outcome:** Wait for the monthly reset, then finish Maps 8–10 and the Home sprites. No purchases.

**T4. Currencies and Materia** · Decide · Economy · asked 2026-10-03 · decided 2026-10-03
- **Outcome:** Many currencies are fine as long as each shows only where it matters.

**T8. Farms and potions** · Decide · Design · asked 2026-10-03 · decided 2026-10-03
- **Outcome:** Approved as sketched: real-time plots, PvE-only potions, sellable once trades are server-side.

**T9. Sound sourcing plan** · Decide · Sound · asked 2026-10-03 · decided 2026-10-03
- **Outcome:** CC0 first (Kenney, OpenGameArt, Freesound) plus our own jsfxr, with audio/ and CREDITS.md.

**T7. Effects picks** · Decide · Effects · asked 2026-10-03 · decided 2026-10-03
- **Outcome:** Holo foil, depth parallax, battlefield weather.

**T6. Alt-art** · Decide · Cards · asked 2026-10-03 · decided 2026-10-03
- **Outcome:** Opponents see your alt-art, with a fallback to default art.

**T5. Apple sign-in** · Decide · Accounts · asked 2026-10-02 · decided 2026-10-03
- **Outcome:** Cancelled.

**D12. Passwords** · Decide · Accounts · asked 2026-10-03 · decided 2026-10-03
- **Outcome:** Minimum length 8; leaked-password check waits for the Pro plan.

**D13. World map** · Decide · Maps · asked 2026-10-03 · decided 2026-10-03
- **Outcome:** Compass diamonds on one winding trail; click to zoom into a map.

**D14. Packs on sale** · Decide · Economy · asked 2026-10-03 · decided 2026-10-03
- **Outcome:** Only the Sprout Pouch; the others show Coming soon.

**D16. UI/UX review** · Decide · UI · asked 2026-10-03 · decided 2026-10-03
- **Outcome:** Ongoing Polish track.

**D10. Native builds** · Decide · Platform · asked 2026-10-02 · decided 2026-10-03
- **Outcome:** Not yet.

**D1. Header and Home** · Decide · UI · asked 2026-10-02 · decided 2026-10-03
- **Outcome:** Built: Play as hero, 2×2 grid, Quests and Community extras.

**D2. Shop and Pack 1** · Decide · Economy · asked 2026-10-02 · decided 2026-10-03
- **Outcome:** Built: 33-card Pack 1, real cards, pack opening.

**D4. Simulator** · Decide · Tools · asked 2026-10-02 · decided 2026-10-03
- **Outcome:** Admin-only; players see Recent opponents.

**D7. Raid damage** · Decide · Raids · asked 2026-10-02 · decided 2026-10-03
- **Outcome:** Core lock global; equal base + tiers; Maple Leaves; overflow damage counts.

**D8. Trench** · Decide · Raids · asked 2026-10-02 · decided 2026-10-03
- **Outcome:** Built: you play your row; allies CPU; telegraphed columns.

**E7. Pack contents and foil odds** · Decide · Economy · asked 2026-10-08 · decided 2026-10-08
- **Outcome:** Pack editor (Admin): per pack price, size, pool, rarity weights, foil chance per card, guaranteed foil, and finish weights (By rarity 60, Prism 9, Hex 8, Etched 7, Ice 7, Reverse 6, Gold 3). Sprout Pouch 4% foil per card, Acorn Chest 8%, Golden Bramble Case 12% with one guaranteed. A card's From picks its pack pool. Publishes live as __cfg:shop-packs.

**E8. Over-size decks and the main deck** · Decide · Decks · asked 2026-10-08 · decided 2026-10-08
- **Outcome:** Decks can hold any number of cards while building (calm 'N over' note, no red shake). ★ Main deck is chosen explicitly and is what you play with; only a 20-card main deck can be played.

**F1. Upgrade / Refine / Enchant** · Decide · Cards · asked 2026-10-08 · decided 2026-10-08
- **Outcome:** Forge has three tabs. Upgrade = level 1–10 then Prestige. Refine = your best copy up the finish ladder Plain → Foil → Hex → Etched → Cracked ice → Reverse → Prism → Gold leaf (costs rise; Prism/Gold need Gold Leaves); never makes Shiny. Enchant = socket one Materia (Ember +1⚔ and scorching hits, Stone +3❤, Tide +2❤, Grove +1⚔+1❤); crystals are the player's now, crafted from Dust without a Hero.

**F2. Shiny in battle** · Decide · Cards · asked 2026-10-08 · decided 2026-10-08
- **Outcome:** Shiny is rolled in the one grant function, so any card received can be Shiny. A card you own a Shiny copy of is Shiny in your hand and on the board, and units it spawns are Shiny too.

**B1. Open-mode difficulty tweaks** · Decide · Balance · asked 2026-10-08 · decided 2026-10-09
- Re-simulated under Open fights (difficulty-open-mode-2026-10-08.md): Maps 1–4 got easier; Map 3's first two skirmishes (16 HP) are now easier than Map 2's; the Frost Yeti King (130 HP) is a 0% wall. Proposed: Badger Warband and Quill Line to ~22 HP; Yeti King to ~90 HP or make its fight Gravity (collapsing) as a special. Superseded if B2 retunes all maps.
  - Apply both
  - Only Map 3
  - Only Yeti King
  - Leave as is
- **Default:** Apply both
- **Outcome:** Superseded by B2's full retune.

**B2. Skirmish balance audit proposals** · Decide · Balance · asked 2026-10-09 · decided 2026-10-09
- skirmish-balance-audit-2026-10-08.md proposed HP changes on 72 nodes and 33 deck swaps. It was measured before today's CPU fix (the enemy now plays its Lumber cards), so its numbers are stale. Better route: retune every map with the skirmish editor's new Auto-tune against a new player's likely deck at each fight, as was done for Thistle Fields, Pebble Beach and the Grotto on 2026-10-09.
  - Retune all maps with the new tools
  - Only the walls and trivial fights
  - Leave as is
- **Default:** Retune all maps with the new tools
- **Outcome:** Taken as default on 'continue' (revertible): tools/retune_all.js retuned 85 of 96 fights against a new player's likely deck; 11 kept as they were; HP floors 14/25/30 for skirmish/elite/boss; raid bosses untouched. Before → after table in docs/balance/retune-all.json. Still too easy after the retune: Sunken Hollow (needs stronger cards than its map has) and 3-2.

**B3. Enemy deck level reads 0 on most nodes** · Decide · Balance · asked 2026-10-09 · decided 2026-10-09
- The Enemy deck Lv is rarity × (1 + card level) − 1 per card. Enemy cards are all level 0 and mostly Common or unrated, so nearly every node reads 0, and it ignores castle HP. Tried weighing unrated cards by their power (2026-10-09): most nodes still read 0 and the numbers jumped about (Map 2's boss 0, a Map 4 skirmish 4), so it wasn't shipped. Options: give enemy cards levels that rise map by map (also makes later maps harder); fill in rarities on all cards; or base the badge on simulated win rate instead.
  - Enemy card levels rise by map
  - Rarity pass on all cards
  - Badge from simulated win rate
  - Leave as is
- **Default:** Badge from simulated win rate
- **Outcome:** Mostly resolved by B5: every card now has a rarity, so the enemy deck level is no longer 0 everywhere.

**C2. Lock the battle type in the skirmish editor?** · Clarify · Conquest · asked 2026-10-09
- You said 'You CANNOT change the battle type once it's been set in the skirmish editor'. In a local test the change saved fine. Is that a bug you hit (it reverted?), or a request to lock the field after the first save? 2026-10-10: fixed. The battle type is set only in Edit skirmish (the picker outside the editor is gone), and a local save no longer gets overwritten by an older cloud copy.
  - It's a bug: it reverts
  - Lock it after the first save

**D23. Ecclesia next, with your Prayer value?** · Decide · Design · asked 2026-10-10
- Prayer value = the sum of Prayer N on your board + the cards in your Removal Zone, +1 once a turn by exiling a hand card when summoning an Ecclesia card. Ecclesia cards need a Prayer value (a threshold, not spent). Effect ideas: Worship, Divine Retribution, Lightning, Midas Touch, Healing, Satiety. 2026-10-10 (taken on 'continue'): built. See the archetypes note for every rule, the nine cards and the measurements.
  - Build Ecclesia next
  - Scrapper next
  - Evolution next
- **Default:** Build Ecclesia next

**B6. The hummingbird starter deck beats the otter starter deck ~99% of the time** · Decide · Balance · asked 2026-10-09
- Starter vs starter in simulation (300 matches): otters win 0.9%. All 10 hummingbird Basics fly (dodge half of ground attacks), most are Diurnal (+1 by day), and they run 2 copies each of 10 solid cards against the otters' 20 singles with several 1-Attack fillers. Removing Diurnal alone: 3.7%; a gentler 1-in-3 dodge: 3.3%. Packages that land near even: (C) the 7 hummingbird Basics with 2+ Attack lose 1 Attack, and 5 otter ground Basics (Otter Guard, River Carp, Otter Paddler, Burrow Rabbit, Ant Scout) gain Reach (their attacks ignore the Flying dodge): 47.7%. (F) the same hummingbird nerf, +1 Attack on 6 otter 1-Attack fillers (Honey Bee, Silver Minnow, Duckling, Otter Kit, Worker Ant, Chipmunk Forager), and Reach on Otter Guard and River Carp only: 46.8%. Reach is already in the engine (no card uses it yet). Not applied because it changes the faction players picked, their saved decks and the tutorial. 2026-10-10: superseded by your new basic set (shared six + three per side): the starter mirror now measures 52.9%.
  - F: nerf hummingbirds, lift otter fillers, Reach on 2
  - C: nerf hummingbirds, Reach on 5 otters
  - Something else (tell me)
  - Leave as is
- **Default:** F: nerf hummingbirds, lift otter fillers, Reach on 2

**T10. New Unique cards can break the raid ghost generator** · Note · Tech · asked 2026-10-09
- Making the Wandering Traveller Unique left stage-5 ghost decks under 20 cards, so it was reverted. The generator needs a fallback before more Unique cards are added.
  - Fix the generator next
  - Later
- **Default:** Fix the generator next
- **Outcome:** Fixed 2026-10-09: ghost decks widen to nearby cards when the band runs out of copies; tests/ghost-unique.js marks every third card Unique and checks all stages.

**B4. Cards that cost 3+ Lumber don't pay off** · Decide · Balance · asked 2026-10-09 · decided 2026-10-09
- Cards costing 3+ Lumber (all five dragons included) score ~38% in simulation. 2026-10-09, taking the default on 'continue': all 30 got an arrival effect (dragons breathe 4 on every enemy; brutes hit the enemy opposite for 2× their cost; Elder Willow, Elderhorn Monarch and Riverworks Bastion refund 2 Lumber; the slow small ones delay the enemy opposite by 2 Wait). It didn't move them: the real cause is that Lumber only comes from discarding cards, so a 4-cost card costs five cards in all. Tested a passive income with the CPU saving properly: +1 Lumber every 2 rounds gives cost-2 cards 75%, cost-3+ 51%, dragons 60% (free cards fall to ~24%, as cheap cards should); every round is too much (dragons 96%); every 3 rounds is too little (45%).
  - +1 Lumber every 2 rounds (core rules change)
  - +1 every 3 rounds
  - Keep discard-only Lumber; make big cards cheaper
  - Leave as is
- **Default:** +1 Lumber every 2 rounds (core rules change)
- **Outcome:** You chose no free Lumber income (it inflates Lumber costs). Instead, cards that give Lumber or draws (Beaver Lumberjack: +2 Lumber; Courier Pigeon: draw 1), plus a day/night cycle and field cards to make rounds vary. The experimental trickle setting was removed. See fields-and-day-night-2026-10-09.md.

**B5. Rarity pass and stat fixes from the balance report** · Decide · Balance · asked 2026-10-09 · decided 2026-10-09
- card-balance-2026-10-09.md: 199 of 288 cards have no rarity; giving each one the rarity its measured strength suggests would also fix the enemy deck Lv badge (B3). 64 rated cards are outside their rarity's band, each with a one-stat fix (e.g. Chipmunk Cavalry 4→3 Attack, Raccoon Nightcrew 5→8 Attack). Many free cards measure as Legendary-strong: make them rarer, or weaker.
  - Rarity pass, then stat fixes
  - Rarity pass only
  - Stat fixes only
  - Leave as is
- **Default:** Rarity pass, then stat fixes
- **Outcome:** Taken as default on 'continue' (revertible): the 199 unrated cards got a rarity from measured strength, capped at Rare for now (114 Common, 11 Uncommon, 74 Rare), and 39 extreme outliers moved half-way toward their suggested stat (e.g. Feral Tomcat 3/5 → 3/3, Honey Badger Fury 5 → 3 Attack, Raccoon Nightcrew 5 → 7 Attack). Cards in band: 124 → 162 of 288. Walls, 3+ cost cards (B4) and the Wandering Traveller were left alone.

## Stated rules · 2026-10-18

The owner's notes (23:05) on a far-future map and the Legendary ability tier. Pinned by `tests/legendary-2026-10-19.js`.

- **Shadow of the Valley of Death is a very far future map.** It is not on the road yet and nothing is planned for it now. The Pall Wraith (`pall-wraith`, Cast Darkness + Darksight) lives in the Eye of the Volcano (20-A, the 20-A-2 Wraith Vents deck and card reward) until that map exists.
- **Legendary abilities are a tier of their own.** A skill or passive marked `legendary: true` (PASSIVE_DEFS / SKILL_DEFS in `arena_app.js`, and `canonical/skill-costs.json`) shows a gold Legendary tag on the card's line, in the Skills Codex and in the card's glossary: "A legendary power. Rarely found on cards you can own — dragons are the exception." They are typically not given to cards players can get, except dragons. Legendary now: True Strike ("White Dragon's True Strike is legendary in itself"), Supreme and Supreme Tide.
- **True Strike is affected by Legendary dodges.** It still ignores every plain miss or dodge: Darkness, Blind, Sun-shy, Night-blind, Evasive, Swift, Flying, Prey, Tide-evade, canopy, Smoke, Fog, Sandstorm, Ashy, Slippery, Shadow and Illusory. A Legendary dodge still rolls against it as against anyone. It still can't hit Invisible.
- **Illusory is not Legendary** ("the illusory dodge is a token thing anyway, so it's not particularly legendary"). No dodge is Legendary yet. The engine hook is ready: a dodge source is Legendary when its reason is in `LEGENDARY_DODGES` or the defender's effect value carries `legendary: true` (e.g. `evasive: {legendary: true}`, `illusory: {chance: 0.5, legendary: true}`) (`legendaryDodge` in `bramblewood-engine.js`).

## Stated rules · 2026-10-19

The owner's answers (20:31) to the design review's questions on triggers, now rules of the engine (`bramblewood-engine.js`). Pinned by `tests/trigger-layers-2026-10-19.js`.

- **Trigger chains stop at 5 layers (layers, not count).** The original event's triggers are layer 1. A trigger that goes off while another trigger is resolving is one layer deeper. Layers 1 to 5 resolve; a 6th-layer trigger does not fire (`TRIGGER_LAYER_CAP = 5`). Any number of triggers at the same layer (siblings) all resolve.
- **A death sweep counts in layers too.** The deaths settled in a sweep's first pass fire layer-1 triggers (counted from where the sweep starts: a sweep opened inside a layer-2 trigger starts at layer 3). The deaths those triggers cause settle in the next pass, one layer deeper. The sweep's 6-pass limit is the cap plus one: the 6th pass clears the bodies and fires no triggers.
- **A unit killed during a death sweep dies in the next pass** (Claude's fix, 2026-10-19). A unit killed by a death effect (Nova, Landslide, an On Death or On Ally Die trigger) dies properly, with its own death effects, graveyard and Darkness. It used to vanish with no death at all.
- **Tokens fire death triggers.** A token's own On Death fires, and its allies fire On Ally Die for it, like any unit.
- **Evasive covers both.** It dodges half of single-target attacks and skills.
- **Simultaneous triggers resolve in board order:** the first player's units, then the second player's, lane by lane (left, centre, right).
- **Units dying in the same sweep don't see each other's On Ally Die.** Units that die in the same pass of a sweep are all gone together: only units still alive in that pass fire it.
- **Summoned and token units fire On Ally Spawn, not On Ally Played.** A unit an effect puts on the board (a token, a summon, a split, a hatch) is spawned. On Ally Played is for a card played from hand (leaders included).
- **A unit's own death is not an ally death.** It fires its own On Death, never its own On Ally Die.
- **0 healing fires no heal trigger.** Healing a unit already at full Health fires no On Heal, On Healed or On Ally Healed.

## Stated rules · 2026-10-19

The owner's rules (23:32) on Freeze and Confuse, now rules of the engine (`bramblewood-engine.js`, package FZ). Pinned by `tests/fz-2026-10-19.js`.

- **A unit frozen before its turn arrives fails to take its action.** Frozen earlier in the round (an earlier unit's Freeze or Ice Arrow), it skips its place in that round's order: no swing, no shot, no On Attack, no on-hit skill. That freeze is then spent: it melts at this round's end, so Freeze N costs N actions (Claude's reading, 2026-10-19: it used to swing anyway and then lose the next round).
- **Frozen after it acted** (a later hit that round, from the opponent's units) **it skips its next round**, then thaws, as before. Frozen before the round starts, it skips that round.
- **Confused: 1 in 2 that each of its triggers, skills and actions fails to activate.** Every trigger, every on-hit chance skill, and every action (its swing, its shots, a reserve strike, a Counterattack, a Sentry or Ambush strike) rolls on its own; on a fail nothing happens and the log says "😵 X is confused and fumbles." The rolls use the match's seeded random, so sims and replays repeat.
- **Confuse's swing (Claude's choice, 2026-10-19):** Confuse had no other effect on the attack, so the attack counts as an action: a fumbled swing is no swing at all (no On Attack, no on-hit skills, no Bleed tick). A swing that goes off still rolls each of its on-hit chance skills, as before.

## Stated rules · 2026-10-18

The owner's notes (21:26) on emoji with cultural meaning.

- **Ward uses 🧿 Nazar.** When a Ward skill is made (e.g. Prayer Ward in docs/gameplay-ideas-2026-10-19.md, or a ward against Blind / curses), its icon is the nazar, or a white/yellow East Asian paper talisman (no emoji exists, so that would be a drawn icon).
- **🪬 Hamsa is never a generic effect icon.** It carries real cultural and religious meaning, so it appears only inside one animal society's own identity (its cards, banner or rites), never as an effect any unit can get. Which society is still open.

## Stated rules · 2026-10-19

The owner's note (00:07): "Healing & the like: if there's nothing to heal, it doesn't occur, and no animation plays." Now a rule of the engine (`bramblewood-engine.js`) and the board (`arena_app.js`). Pinned by `tests/hn-2026-10-19.js`.

- **A heal with nothing to heal doesn't happen.** Every heal-like effect (the Heal action, Regeneration, Bloom, Nursing, Healing N, Leech, Carrion, Banana, Cower (Flee), Spring Rain, the Herb Refinery, Herbalist's bonus, Rebuild and the Rebuild bramble action, the bramble's own regeneration, Cure) on a unit already at full Health (a bramble at full Health) heals nothing and shows nothing: no heal event, no battle-log line, no floating "+0", no heal look or sound, and no beat in the replay. (A Cower (Flee) unit still backs off, only without a heal number; a Mend spell is still cast, without the green heal look when no one is hurt.)
- **0 healing fires no heal trigger** (kept from the trigger rules above): no On Heal, On Healed or On Ally Healed.
- **A Heal or Rebuild trigger with nothing to heal doesn't go off.** Its trigger rune isn't shown, and a "once" Heal trigger isn't used up (it waits for a real wound). One that paid a cost first (Burn 1 Lumber) did go off.
- **Bleed counts as something to heal** (Claude's choice, the recommended one). A heal on a full-Health unit that Bleeds happens: it stanches the Bleed (the Bleed-removal look only, 🩹 -N 🩸), with no green heal look, no "+0" and no heal triggers. Regeneration is the exception and keeps the owner's 2026-10-14 rule ("Do not regenerate when the unit is at full health"): at full Health it doesn't stanch either.
- **Old fights and replays too.** The board skips any 0-amount heal event that still turns up (a saved fight or replay from before this rule): no look, no sound, no beat, no log line (`emptyHealEvent` in `arena_app.js`).

## Stated rules · 2026-10-19

The owner's rules (00:19): "Revive is true death, but Rescue no." and "Quiet Contemplation on Map 21's boss: no 2x and re-enablement effects." Now rules of the engine (`bramblewood-engine.js`, package RV), replacing the earlier rule that a Revive death was no death (no death triggers, only the killer's On Kill). Pinned by `tests/rv-2026-10-19.js`.

- **Revive is a true death.** The first death, the one Revive answers, happens in full: the unit's On Death, its allies' On Ally Die (and Berserk, Divine Retribution, Hive Mind), the killer's On Kill and kill stat (Crown of Thorns, Midas Touch), Bounty, Darkness from the loss, the Ritual count, the deaths stat, Amore, Carrion, On Death: Spawn, Landslide, Nova, and the trip to the graveyard (or the Removal Zone). Then the unit returns: out of that zone, into its own slot, at 1 Health with every status cleared. Its second death is final (the Removal Zone), as before.
- **What would replace the body doesn't happen on a Revive death** (Claude's call): no Relic 1/1 (the unit itself comes back; its final death leaves the Relic), no Crystallise crystal, no Meiosis split. An On Death: Spawn token goes beside it, not into its slot. Its equipment stays on; its Prayer tokens are gone with the death.
- **Revive loops stop at the layer cap.** Revive is once per unit. The triggers a Revive death sets off are ordinary trigger layers of the death sweep, so a revive whose death kills another reviving unit, and so on, stops at layer 5 (`TRIGGER_LAYER_CAP`) like any chain. A Nullify kill still gets no Revive.
- **Rescue is not a death.** A unit moved or saved before it would die fires none of the above: no death event, no On Death, On Ally Die, On Kill, Bounty, Darkness, Ritual count or deaths stat, and its Revive stays unspent. Today that is Shield Call (the ally steps aside and a shield takes the skill) and Guardian (an adjacent protector takes the hit); no effect called Rescue exists yet.
- **Quiet Contemplation (the Cathedral Eagle's fight, 21-6): nothing happens twice.** Doubling, off: Headwind (a Flyer's triggers and skills twice), Twin Strike and Frenzy's second swing, Twin Shot's second arrow, Twin (the copy on arrival), Echoing Wood's copy, Crit, an Expose counter's crit (the counter is still used up), Rage's ×2, Mighty's ×2, Tall Grass's double Backstab / Pounce, Supreme Tide (plain Tide bonuses instead) and Double Time (1 play a turn, no second-player bonus for it). Re-enablement, off: every extra turn (Fast Forward N, the Tailwind spell's turn, a strong wind's Tailwind, a Swimmer's Quick Attack on a Flood) and Wildpath's Second Pitch. Both sides.
- **Quiet Contemplation leaves these alone** (Claude's reading; say if any should go): plain Wait cuts (Hasten, Reduce Wait), multi-target skills (Volley, Sweep, Fork, a trigger's N targets), the target's own weakness or Fragile (double damage taken), Boomerang's return (it is that round's attack), Banana / Durian snacks, a Charge's cycle, Rage's half damage taken, and Revive (once, and a true death).

## Stated rules · 2026-10-19

Package GI (owner 00:19: "continue with action items, and considering our gameplay-ideas ... After running through the ideas, create what you want to create"): the skills and field effects built from docs/gameplay-ideas-2026-10-19.md, now rules of the engine (`bramblewood-engine.js`, the Package GI block). Only POOL example cards carry them; no live card or map does yet. Details: docs/gameplay-ideas-built-2026-10-19.md. Pinned by `tests/gi-2026-10-19.js`.

- **A trigger can target the card it is about** (the owner's question 7 in gameplay-ideas-2026-10-19: yes, it targets the played card). A trigger's subject is the ally played (or the unit that died, was healed, got Ready or moved): `sub:'subject'` is that unit, `sub:'subjectFacing'` the unit facing it, and `filterKin` keeps only a subject that is the acting unit's Kin.
- **Kin Rally N** (On Ally Played (Kin): that ally +N/+N) and **Pack Howl N** (On Ally Played (Wolf): Bleed N on the enemy facing it) are ordinary On Ally Played triggers: off while the unit is Waiting, Stunned, Frozen or Asleep; Confused fumbles them; the 5-layer cap holds; a card played from hand only (a token is On Ally Spawn). A Changeling passes both filters. Nobody facing the Wolf: no Bleed.
- **Hunter N is one keyword with a status picker**: Poisoned (the default), Bleeding, Wet or Exposed; Shatter stays the Frozen case. Exposed is read before the hit uses up its counter. Hunter and **Executioner N** (strictly below half Health) add to hits and shots, never to a status tick or a bramble.
- **Detonate** (Claude's reading): its hit or shot deals the target's whole Poison as extra damage, 1 for 1, then that Poison is gone. Poison ticks at the round's start first, so it cashes in what the tick left.
- **Proliferate N**: from round 2, at each round's start, up to N Poisoned enemies (picked at random) each give 1 Poison to a random unit beside them. It spreads (the carrier keeps its own); poison-proof units never catch it. A passive, so it works while its unit is Waiting.
- **Brittle** (a status from Brittle N hits) counts as Frozen for Shatter only: the unit still acts and its Wait still ticks. It wears off like Webbed; Revive clears it, Cure doesn't (as Webbed).
- **Prayer Ward N**: Armor N while the unit holds Prayer tokens (the player's own offering tokens are not on the unit, so they don't count). Its icon is 🧿 Nazar (owner, 2026-10-18 21:26).
- **Field Breaker N** (Claude's scope): when it arrives, the field's round-start effects are skipped for the next N rounds, for both sides: every Field effects 2 and 3 tick (the hazards, the Leylines' gifts and burn, Haunted, Mirage, Wave, Consternation, and the three new fields), Swamp Fever, the Tide-spout and the volcano's eruptions, comets and lava. Day and night, the Tide, Darkness, wind, the always-on field rules (Sandstorm misses, Ashy, Slippery ...) and a played field card go on. Two breaks don't add up: the later end wins.
- **Spore Cloud** (for The Morel Hollow): from round 2, one random unit a side that isn't poison-proof falls Asleep for the round, as Sleep 1, so the Sleep cap (N+1) holds it at 2 at most; a hit wakes it.
- **Thunderstorm N** (2; for Coral Current): from round 2, lightning (shock) strikes one random unit a side for N; each Wet counter adds 1, shock Resist halves it.
- **Tangled Roots** (for the Kelp Mangroves): from round 2, one random unit a side that isn't Flying or a Structure is Webbed for the round.
- **Crab Trap is data, not a rule** (Claude's call): a Crab Claws card with Hunter 1 (Wet) (the pool card Tidepool Trapper Crab). Crab Claws itself is unchanged, so no live crab changed.
- **Skipped, each against a standing rule or the owner's earlier no**: Isolation (fights Lone Wolf), Rescue Chain and Death Spiral (loops), a generic Contagion (folded into Proliferate), and Hallowed Ground and Blood in the Water (left for the placement phase: small-engine but each one fight).
