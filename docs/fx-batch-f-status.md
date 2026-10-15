# Effects batch F — status (2026-10-15)

Batch F: combat-skill (resource gains), ui-feedback, meta-progression, rewards-results, tutorial-dialogue, raid-dungeon-pvp.
Code: `bramblewood-fx-f.js` (`FX.F`, CSS injected under `fxf-`). Lab demos: `tools/effects-lab/manifest/f.js`
(`ui-pixel-reveal`, `ui-deck-riffle` and `ui-toast` A live in `manifest/_existing.js`; f.js adds `ui-toast` B and C).
Contract: `docs/effects-lab-contract.md`.

**164 entries, all registered in the lab with a working demo (197 variants played in Playwright: 0 console errors, nothing left on the page).**
Counts: done-existing: 77, done-existing + hooked: 3, new: 66, new (future concept): 18, with variants: 21.

Status words: **done-existing** — the game already had a good look; the lab replays it with the game's own classes/functions
("now" / "live" in the label; "approximated" where the real function needs a live screen). **+ hooked** — that entry also
gets a batch-F touch in game. **new** — built in this batch and hooked into the game (column 5 says where). **future concept** —
lab-only concept for a planned feature (no game hook yet). **variants** — 2–3 real alternatives side by side; the game uses A
unless the hook column names another.

## Game hooks (all gated by `fxHook`/`fxBatchVfx`: reduced motion and Effects "none" skip everything; heavy looks need `med`)

- Battle (`FX.F.onEvent`): grace/devilry/stone/metal/uranium gains arc into the side's resource pill (B); Midas lumber;
  resource passives (Lumberjack, Timber, Rock-solid, Iron-will, Heavy Metal; once per unit per round); elemental energy;
  Refine and autobattle triggers; exile → Echo candle over the deck pile; raid boss roar (once per fight); tentacle smack / tail sweep.
- `arena_app.js` one-line `fxHook` calls (each tagged `2026-10-15 batch F`): `toast`, `xpGain` (account level-up + XP into the
  badge), `energySpend`, `energyTick`, `energyRefill`, `questProgress`, `noticeSwap`, `errandOffer`, `raidPanel` (stage change,
  parts down, bars, claim), `raidFeed`, `trenchRender`, `replayHits`, `resultsShown` (draw, tutorial result, rank lesson, rating,
  gauntlet streak, dragon scale, materia, egg drop, castle drop, avatar, codex-new, achievement, dungeon floor, XP line),
  `pvpTicketUsed`, `dialogueLine`, `dialogueAfk`, `dialogueAct`, `curioBubble`, `wandererDeal`, `heldPacks`, `skillReveal`,
  `cardPop`, `cloudSync`, `banner`, `deckCardMoved`, `deckFull`, `deckHeroBanner`, `heroStat`, `heroSkillPick`, `nestEggPlaced`,
  `nestTrain`, `factionCrown`.
- Verified firing in the built game (Playwright, spies on `FX.F`): account level-up (`accountLevel` + toast glint), XP into
  the badge, quest progress, energy spend / regen tick / free refill, raid stage change (Enraged banner) + part down + bars.

## Notes and leftovers

- `meta-achv-unlocked-live`: the game only detects new achievements when the results screen is built
  (`newAchievementsChipHTML`), so the pop plays there (`resultsShown` → `.winloss-achv`); there is no earlier moment to hook.
- `res-faction-crown`: hooked in `grantMap20FactionCrown`, which nothing in the game calls yet; it will play once it is wired.
- Future entries (`meta-daily-login`, `meta-monthly-bonus`, `meta-bramble-pass`, `meta-steam-achv`, `meta-attunement`,
  `meta-alchemy`, `meta-dragon-egg-craft`, `meta-materia-socket`, `meta-bring-effect`, `ui-emoji-set`, `coop-*`, `dng-murgle`,
  `pvp-map60`, `world-event`) are concept implementations in the lab only.
- Fixed while reviewing frames: the panel vignette (raid stage change, boss roar) was drawn as a box in the top-left corner
  (`inset:auto` was applied after `left/top`); it now covers its panel, rounded like it.
- Tentacle smack, tail sweep and the dragon-scale shadow are clipped to the battlefield / panel they play on.
- Labels over top-bar pills (energy, XP) sit lower and drift down near the top edge instead of leaving the screen.
- Raid bars fill in once per session, not on every re-render of the raid panel (claims and live refreshes re-render it).
- Banners (sign-in / invite / version): the old flap animated `transform`, which those banners use (with `!important`) for
  their own slide-in; it now waits for the slide and flaps with the independent `scale` property, so the slide is untouched.
- Lab: `raid-part-down` plays on a real `.raid2-panel` part; the banner demo shows the real strip.
- Tests on a loaded box: `tests/autobattle.js` fails only its speed check ("fights are too slow", 3–4/s against 9/s; load
  average 11 with five other batches running); the main checkout fails it the same way (4.5/s). Batch F does not touch the
  engine or autobattle. `tests/e2e/ui_smoke.py` timed out loading the page for its shader section (software WebGL takes
  ~60 s on this box); with a longer navigation timeout it reports 0 failures.

## Entries

| id | area | status | lab variants | in game |
|---|---|---|---|---|
| `sk-echo-gain` | combat-skill | new | A | onEvent: exile (each exile is +1 Echo) |
| `sk-gain-resource` | combat-skill | new · variants | ABCDEFGH | onEvent: grace / devilry / stone / metal / uranium events (variant B); Lumber keeps its lootArc |
| `sk-elemental-energy` | combat-skill | new | A | onEvent: elementalEnergy |
| `sk-refine-action` | combat-skill | new | A | onEvent: triggerFired with action refine |
| `sk-midas` | combat-skill | new | A | onEvent: lumber with cause midas |
| `sk-worthy` | combat-skill | done-existing + hooked | A | renderVfxForEvent: lumber cause worthy → SkillFX.lootArc |
| `sk-resource-passive` | combat-skill | new · variants | ABC | onEvent: lumber / stone / metal gains → the side’s cards with Lumberjack, Timber, Rock-solid, Iron-will or Heavy Metal |
| `ui-deny` | ui-feedback | done-existing + hooked | A | denyShake() |
| `ui-toast` | ui-feedback | new · variants | ABC | showToast → fxHook(toast) (variant B) |
| `ui-hud-pill-bing` | ui-feedback | done-existing | A | demo of the game's own look |
| `ui-pill-gain` | ui-feedback | done-existing | A | demo of the game's own look |
| `ui-tab-emoji` | ui-feedback | done-existing | A | demo of the game's own look |
| `ui-home-buttons` | ui-feedback | done-existing | A | demo of the game's own look |
| `ui-chestnut-knock` | ui-feedback | done-existing | A | demo of the game's own look |
| `ui-codex-page` | ui-feedback | done-existing | A | demo of the game's own look |
| `ui-pixel-reveal` | ui-feedback | done-existing | A | registered in manifest/_existing.js (the game's own look) |
| `ui-versus` | ui-feedback | done-existing + hooked | A | showVersusOpener (Conquest skirmish start) |
| `ui-fight-sign` | ui-feedback | done-existing | A | demo of the game's own look |
| `ui-next-turn` | ui-feedback | done-existing | A | demo of the game's own look |
| `ui-turn-glow` | ui-feedback | done-existing | A | demo of the game's own look |
| `ui-wait-tick` | ui-feedback | done-existing | A | demo of the game's own look |
| `ui-ready` | ui-feedback | done-existing | A | demo of the game's own look |
| `ui-drag-trail` | ui-feedback | done-existing | A | demo of the game's own look |
| `ui-drop-highlight` | ui-feedback | done-existing | A | demo of the game's own look |
| `ui-attack-preview` | ui-feedback | done-existing | A | demo of the game's own look |
| `ui-pitch-preview` | ui-feedback | done-existing | A | demo of the game's own look |
| `ui-pitch` | ui-feedback | done-existing | A | demo of the game's own look |
| `ui-overdraw` | ui-feedback | done-existing | A | demo of the game's own look |
| `ui-draw` | ui-feedback | done-existing | A | demo of the game's own look |
| `ui-deck-shuffle` | ui-feedback | done-existing | A | demo of the game's own look |
| `ui-deck-riffle` | ui-feedback | done-existing | A | registered in manifest/_existing.js (the game's own look) |
| `ui-lumber-nudge` | ui-feedback | done-existing | A | demo of the game's own look |
| `ui-card-hover` | ui-feedback | new · variants | AB | openPopFor → fxHook(cardPop) |
| `ui-bf-pill-tip` | ui-feedback | done-existing | A | demo of the game's own look |
| `ui-tip-ticker` | ui-feedback | done-existing | A | demo of the game's own look |
| `ui-modal-dialog` | ui-feedback | done-existing | A | demo of the game's own look |
| `ui-deck-add` | ui-feedback | new · variants | AB | deckCardClick → fxHook(deckCardMoved) (variant A) |
| `ui-deck-remove` | ui-feedback | new | A | deckCardClick (Shift+click) → fxHook(deckCardMoved) |
| `ui-deck-full` | ui-feedback | new | A | deckCardClick / deck drop at the copy limit → fxHook(deckFull) |
| `ui-deck-swap` | ui-feedback | done-existing | A | demo of the game's own look |
| `ui-deck-hero-banner` | ui-feedback | new | A | refreshDeckHeroBanner → fxHook(deckHeroBanner) |
| `ui-codex-new` | ui-feedback | new | A | results: “New cards seen” → fxHook(resultsShown) |
| `ui-skill-reveal` | ui-feedback | new | A | noteMapEnteredForReveal → fxHook(skillReveal) |
| `ui-rank-hex` | ui-feedback | done-existing | A | demo of the game's own look |
| `ui-avatar-unlock` | ui-feedback | new | A | results: a new character / title → fxHook(resultsShown) |
| `ui-cloud-sync` | ui-feedback | new · variants | AB | setCloudPill → fxHook(cloudSync), only when it changes |
| `ui-banners` | ui-feedback | new | A | showSignInBanner / showInviteBanner / versionBanner → fxHook(banner) |
| `ui-fx-level` | ui-feedback | done-existing | A | demo of the game's own look |
| `ui-emoji-set` | ui-feedback | new (future concept) | A | future |
| `ui-emote` | ui-feedback | done-existing | A | demo of the game's own look |
| `ui-speech` | ui-feedback | done-existing | A | demo of the game's own look |
| `ui-log-row` | ui-feedback | done-existing | A | demo of the game's own look |
| `meta-castle-drop` | meta-progression | new | A | results “Spare castle” and the pack toast (🏰) → fxHook(resultsShown / toast) |
| `meta-hero-level` | meta-progression | done-existing | A | demo of the game's own look |
| `meta-hero-skill-pick` | meta-progression | new | A | Hero Hall skill button → fxHook(heroSkillPick) |
| `meta-hero-stat-spend` | meta-progression | new | A | Hero Hall + button → fxHook(heroStat) |
| `meta-nest-egg-place` | meta-progression | new | A | Nest picker egg → fxHook(nestEggPlaced) |
| `meta-nest-egg-idle` | meta-progression | done-existing | A | demo of the game's own look |
| `meta-nest-hatch` | meta-progression | done-existing | A | demo of the game's own look |
| `meta-nest-kibble-train` | meta-progression | new | A | Nest picker Train → fxHook(nestTrain) |
| `meta-nest-trained` | meta-progression | done-existing | A | demo of the game's own look |
| `meta-nest-egg-drop` | meta-progression | new | A | results “Found” → fxHook(resultsShown) |
| `meta-inventory-new` | meta-progression | new | A | the 🎒 Field kit toast → fxHook(toast) |
| `meta-shop-buy` | meta-progression | done-existing | A | demo of the game's own look |
| `meta-shop-wanderer-deal` | meta-progression | new | A | openWandererDeal → fxHook(wandererDeal) |
| `meta-energy-spend` | meta-progression | new | A | spendEnergy → fxHook(energySpend) |
| `meta-energy-short` | meta-progression | done-existing | A | demo of the game's own look |
| `meta-energy-tick` | meta-progression | new · variants | ABC | settleEnergy tick → fxHook(energyTick) (variant A) |
| `meta-energy-capsule` | meta-progression | new | A | Energy panel → capsule button → fxHook(energyRefill) |
| `meta-energy-free` | meta-progression | new | A | Energy panel → free button → fxHook(energyRefill) |
| `meta-energy-upgrade` | meta-progression | new | A | the “⚡ Max Energy is now N” toast → fxHook(toast) |
| `meta-stamina` | meta-progression | new | A | the “⚡ Max Energy is now N” toast (Camp / Forge) → fxHook(toast) |
| `meta-achv-ready` | meta-progression | done-existing | A | demo of the game's own look |
| `meta-achv-claim` | meta-progression | done-existing | A | demo of the game's own look |
| `meta-achv-unlocked-live` | meta-progression | new · variants | AB | results: .winloss-achv → fxHook(resultsShown) (variant A) |
| `meta-quest-ready` | meta-progression | done-existing | A | demo of the game's own look |
| `meta-quest-claim` | meta-progression | done-existing | A | demo of the game's own look |
| `meta-quest-progress` | meta-progression | new | A | bumpQuestCounter → fxHook(questProgress) when the Quests button is on screen |
| `meta-errand-offer` | meta-progression | new | A | maybeOfferErrand → fxHook(errandOffer) |
| `meta-errand-claim` | meta-progression | done-existing | A | demo of the game's own look |
| `meta-daily-notice-swap` | meta-progression | new | A | Quests → Swap → fxHook(noticeSwap) |
| `meta-account-level` | meta-progression | new · variants | ABC | awardXp level-up → fxHook(xpGain) (variant A) |
| `meta-xp-gain` | meta-progression | new | A | awardXp → fxHook(xpGain) when the level badge is on screen |
| `meta-wildpath-learn` | meta-progression | done-existing | A | demo of the game's own look |
| `meta-card-unlock` | meta-progression | done-existing | A | demo of the game's own look |
| `meta-card-level-codex` | meta-progression | done-existing | A | demo of the game's own look |
| `meta-daily-login` | meta-progression | new (future concept) · variants | AB | future |
| `meta-monthly-bonus` | meta-progression | new (future concept) | A | future |
| `meta-bramble-pass` | meta-progression | new (future concept) | A | future |
| `meta-steam-achv` | meta-progression | new (future concept) | A | future |
| `meta-attunement` | meta-progression | new (future concept) | A | future |
| `meta-alchemy` | meta-progression | new (future concept) | A | future |
| `meta-dragon-egg-craft` | meta-progression | new (future concept) | A | future |
| `meta-materia-socket` | meta-progression | new (future concept) | A | future |
| `meta-bring-effect` | meta-progression | new (future concept) | A | future |
| `res-victory` | rewards-results | done-existing | A | demo of the game's own look |
| `res-defeat` | rewards-results | done-existing | A | demo of the game's own look |
| `res-draw` | rewards-results | new · variants | AB | results (winner 0) → fxHook(resultsShown) (variant A) |
| `res-victory-toss` | rewards-results | done-existing | A | demo of the game's own look |
| `res-loss-scatter` | rewards-results | done-existing | A | demo of the game's own look |
| `res-first-clear` | rewards-results | done-existing | A | demo of the game's own look |
| `res-rank-stamp` | rewards-results | done-existing | A | demo of the game's own look |
| `res-rank-lesson` | rewards-results | new | A | results: .wl-rank-lesson → fxHook(resultsShown) |
| `res-reward-reveal` | rewards-results | done-existing | A | demo of the game's own look |
| `res-reward-cards` | rewards-results | done-existing | A | demo of the game's own look |
| `res-coin-shower` | rewards-results | done-existing | A | demo of the game's own look |
| `res-count-up` | rewards-results | done-existing | A | demo of the game's own look |
| `res-pack-won` | rewards-results | done-existing | A | demo of the game's own look |
| `res-held-packs` | rewards-results | new | A | Armoury opens → releaseHeldPacks → fxHook(heldPacks) |
| `res-achv-on-results` | rewards-results | done-existing | A | demo of the game's own look |
| `res-star-fall` | rewards-results | done-existing | A | demo of the game's own look |
| `res-dragon-scale` | rewards-results | new · variants | AB | results: .rw-scale → fxHook(resultsShown) (variant A) |
| `res-boss-leader` | rewards-results | new | A | the “👑 … joins you” toast → fxHook(toast) |
| `res-faction-crown` | rewards-results | new · variants | AB | grantMap20FactionCrown → fxHook(factionCrown) |
| `res-materia-drop` | rewards-results | new | A | results: .rw-materia → fxHook(resultsShown) |
| `res-card-drop` | rewards-results | done-existing | A | demo of the game's own look |
| `res-xp-line` | rewards-results | new | A | results (a win) → fxHook(resultsShown) |
| `res-tutorial-result` | rewards-results | new · variants | AB | results (tutorial) → fxHook(resultsShown) |
| `res-castle-falls` | rewards-results | done-existing | A | demo of the game's own look |
| `tut-coach-tip` | tutorial-dialogue | done-existing | A | demo of the game's own look |
| `tut-coach-pointer` | tutorial-dialogue | done-existing | A | demo of the game's own look |
| `tut-coach-phantom` | tutorial-dialogue | done-existing | A | demo of the game's own look |
| `tut-highlight` | tutorial-dialogue | done-existing | A | demo of the game's own look |
| `tut-lumber-lesson` | tutorial-dialogue | done-existing | A | demo of the game's own look |
| `tut-faction-pick` | tutorial-dialogue | done-existing | A | demo of the game's own look |
| `tut-faction-showcase` | tutorial-dialogue | done-existing | A | demo of the game's own look |
| `tut-leader-join` | tutorial-dialogue | done-existing | A | demo of the game's own look |
| `tut-dialogue-dock` | tutorial-dialogue | done-existing | A | demo of the game's own look |
| `tut-dialogue-question` | tutorial-dialogue | done-existing | A | demo of the game's own look |
| `tut-dialogue-portrait` | tutorial-dialogue | new · variants | AB | playDialogue line → fxHook(dialogueLine) (variant A) |
| `tut-dialogue-act` | tutorial-dialogue | new | A | performDialogueAct → fxHook(dialogueAct) |
| `tut-faction-warning` | tutorial-dialogue | new · variants | AB | playFactionWarning → playDialogue("warn:…") → fxHook(dialogueLine) |
| `tut-curio-bubble` | tutorial-dialogue | new | A | visitCuriosity (repeat visit) → fxHook(curioBubble) |
| `tut-rival-babble` | tutorial-dialogue | done-existing | A | demo of the game's own look |
| `tut-afk` | tutorial-dialogue | new | A | playDialogue AFK goodbye → fxHook(dialogueAfk) |
| `raid-telegraph` | raid-dungeon-pvp | done-existing | A | demo of the game's own look |
| `raid-trench-danger` | raid-dungeon-pvp | done-existing | A | demo of the game's own look |
| `raid-trench-hit` | raid-dungeon-pvp | new | A | fight replay hit step → fxHook(replayHits) |
| `raid-boss-roar` | raid-dungeon-pvp | new | A | onEvent: raidBossUnit (once per fight) |
| `raid-tentacle-smack` | raid-dungeon-pvp | new | A | onEvent: raidSmack (column) |
| `raid-tail-sweep` | raid-dungeon-pvp | new | A | onEvent: raidSmack (front row) |
| `raid-stage-change` | raid-dungeon-pvp | new · variants | ABC | renderRaidSubTab → wireRaidPanel → fxHook(raidPanel) |
| `raid-part-down` | raid-dungeon-pvp | new | A | raid panel: a part newly down → fxHook(raidPanel) |
| `raid-bars` | raid-dungeon-pvp | new · variants | AB | raid panel → fxHook(raidPanel): fill-in once per session, drain since last view |
| `raid-feed` | raid-dungeon-pvp | new | A | renderOnlineRaidFeed → fxHook(raidFeed) |
| `raid-claim` | raid-dungeon-pvp | new | A | raid panel Claim button → fxHook(raidPanel) listener |
| `raid-core-stumps` | raid-dungeon-pvp | new | A | trench match render → fxHook(trenchRender) (round 1, then every 3 rounds) |
| `dng-wave` | raid-dungeon-pvp | done-existing | A | demo of the game's own look |
| `dng-floor` | raid-dungeon-pvp | new | A | results (next fight is “floor N”) → fxHook(resultsShown) |
| `pvp-ticket` | raid-dungeon-pvp | new | A | startMatch("pvp") after usePvpTicket → fxHook(pvpTicketUsed) |
| `pvp-portent` | raid-dungeon-pvp | done-existing | A | demo of the game's own look |
| `pvp-rating` | raid-dungeon-pvp | new · variants | ABC | results: rating pill → fxHook(resultsShown) (variant A) |
| `pvp-queue` | raid-dungeon-pvp | done-existing | A | demo of the game's own look |
| `pvp-rejoin` | raid-dungeon-pvp | done-existing | A | demo of the game's own look |
| `pvp-gauntlet-streak` | raid-dungeon-pvp | new · variants | AB | results (Gauntlet) → fxHook(resultsShown) |
| `pvp-autobattle` | raid-dungeon-pvp | new | A | onEvent: triggerFired on a card with a trigger badge |
| `coop-shared-cell` | raid-dungeon-pvp | new (future concept) | A | future |
| `coop-lock` | raid-dungeon-pvp | new (future concept) | A | future |
| `coop-resolve` | raid-dungeon-pvp | new (future concept) | A | future |
| `coop-cell-clash` | raid-dungeon-pvp | new (future concept) | A | future |
| `coop-floor-mechanic` | raid-dungeon-pvp | new (future concept) | A | future |
| `dng-murgle` | raid-dungeon-pvp | new (future concept) | A | future |
| `pvp-map60` | raid-dungeon-pvp | new (future concept) | A | future |
| `world-event` | raid-dungeon-pvp | new (future concept) · variants | AB | future |
