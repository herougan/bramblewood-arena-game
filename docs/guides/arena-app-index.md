# arena_app.js and engine index (generated)

> Written by `python3 tools/code_map.py` with docs/code-map.md. Names only: `grep -n "function NAME" FILE`, then read about 80 lines
> around the hit. Never read arena_app.js (about 110 characters a line) or arena_template.html (about 220) from the top.

## Anchors per feature

- **Shell and common helpers** (arena_app.js): `switchTab`, `showToast`, `bwConfirm`, `bwChoice`, `escapeHtml`, `escapeAttr`, `iconHTML`, `numOr`
- **Battle** (arena_app.js): `matchState`, `startMatch`, `startConquestMatch`, `resolveRound`, `endMatch`, `renderMatchUI`, `renderBoard`, `renderHand`, `renderHUD`, `boardCardHTML`, `boardCardEl`, `renderVfxForEvent`, `vfxKindOf`, `floatText`, `fightSafe`
- **Cards and skills** (arena_app.js): `getCardDefs`, `invalidateCardDefs`, `cardTileHTML`, `openCardDetail`, `openCardEditor`, `renderEditor`, `skillDefOf`, `skillText`, `sk1Patch`, `PASSIVE_DEFS`, `TRIGGER_DEFS`, `ACTION_DEFS`, `SKILL_DEFS`, `RARITY_DEFS`
- **Map, road and skirmish** (arena_app.js): `CONQUEST_MAPS`, `mainConquestMaps`, `renderConquestSubTab`, `renderConquestWorld`, `findConquestNode`, `mapNumberOf`, `fightRules`, `skirmishCastle`, `roadRarityCap`, `roadCurveTarget`, `skirmishTargetBand`, `ROAD_CURVE_TOL`, `referenceDeckFor`, `dealPlayerLeader`, `openSkirmishEditor`
- **Deck, Codex, Forge, Nest, Shop** (arena_app.js): `renderDeckSection`, `openDeckBuilderPopup`, `deckTotal`, `maxCopiesForRarity`, `renderCodex`, `renderCodexGrid`, `renderSkillBook`, `renderForge`, `renderNest`, `renderShop`, `openPackAnimation`, `myCurrencies`, `grantCurrency`, `saveCurrencies`, `unlockCardForPlayer`
- **Raid, multiplayer, social** (arena_app.js): `renderRaidSubTab`, `startOfflineRaidMatch`, `startRaidPartMatch`, `renderArenaSubTab`, `startLiveRankedMatch`, `renderGuild`, `renderFriends`, `renderFleaMarket`
- **Tutorial and dialogue** (arena_app.js): `startTutorialMatch`, `playDialogue`, `DIALOGUES`, `showCoachTip`
- **Cloud, saves, admin** (arena_app.js): `initCloudSync`, `isSignedIn`, `requireSignIn`, `cloudPullState`, `cloudPushDecks`, `PROGRESS_KEYS`, `livePullProgress`, `livePushProgress`, `pollCloudOverrides`, `loadCloudCardOverrides`, `applyCloudCfgRow`, `cloudWriteCardOverride`, `renderAdmin`, `adminAllowed`
- **Effects and sound** (arena_app.js): `fxLevel`, `fxAtLeast`, `reducedMotion`, `hasGsap`, `syncPageFlags`, `SoundKit`, `tone`
- **Engine** (bramblewood-engine.js): `makeSimEngine`, `simulateOneMatch`, `mulberry32`, `TRIGGER_KEYS`, `ACTION_KEYS`, `newPlayer`, `canPlay`, `placeCard`, `roundStart`, `resolveCombat`, `computeHitDamage`, `applyDamage`, `damageHQ`, `fireReadyFor`, `fireOnKillTriggers`, `endOfRoundUpkeep`, `aiTakeTurn`, `aiPlanPlay`, `aiChooseSlot`, `aiPitch`

## Screens

`switchTab(tab)` (renders through `safeRender`): home → `renderHome`, codex → `renderCodex`, play → `renderPlay`, deck → `renderDeckSection`, shop → `renderShop`, nest → `renderNest`, promotion → `renderPromotionPage`, market → `renderFleaMarket`, profile → `renderProfile`, ranking → `renderRanking`, achievements → `renderAchievementsPage`, inventory → `renderInventory`, trail → `renderTrailPage`, stomp → `renderStomp`, paths → `renderWildpaths`, guild → `renderGuild`, friends → `renderFriends`, admin → `renderAdmin`
`renderPlay` by `playSubTab`: dungeons → `renderDungeonsSubTab`, arena → `renderArenaSubTab`, raid → `renderRaidSubTab`, autobattle → `renderAutobattleSubTab`, sandbox → `renderSandboxSubTab`, conquest → `renderConquestSubTab`
`renderCodex` by `codexSubTab`: brambles → `bramblesTabHTML`, skills → `renderSkillBook`, maps → `mapCodexHTML`, reference → `referenceHTML`, halloffame → `hallOfFameTabHTML`, deleted → `renderDeletedTab`, txns → `renderTxnsTab`

## Most-called helpers in arena_app.js (reuse before writing a new one)

`escapeHtml` 1815, `escapeAttr` 1275, `getCardDefs` 620, `numOr` 392, `boardCardEl` 352, `showToast` 307, `reducedMotion` 255, `floatText` 206, `fxAtLeast` 163, `hasGsap` 162, `iconHTML` 153, `cardTileHTML` 136, `switchTab` 119, `fnoise` 106, `mapNumberOf` 96, `sk1Patch` 90, `fightSafe` 90, `denyShake` 87, `loadConquestProgress` 83, `isSignedIn` 78, `conquestNodeId` 76, `renderBoard` 72, `fxHook` 72, `sleep` 71, `hqTileEl` 71, `cardBaseLevel` 71, `viewerHandPid` 61, `grantText` 61, `grantCurrency` 59, `findConquestNode` 58, `baseKind` 57, `mainConquestMaps` 53, `renderPlay` 52, `parseGrantText` 50, `saveCurrencies` 48, `updateCardHpDisplay` 47, `unlockCardForPlayer` 47, `updateCardStatusDisplay` 46, `loadDialogueFlags` 46, `loadTutorialDone` 45, `isMapUnlocked` 45, `deckTotal` 45, `dnFloat` 41, `renderForge` 40, `fxLevel` 40, `animMs` 40, `maxCopiesForRarity` 38, `tabOpen` 37, `mapIdAt` 37, `loadFactionChoice` 36, `cardSourceOf` 36, `loadTutorial2Done` 34, `resolveRound` 33, `pushLog` 33, `featureUnlocked` 33, `dnLogNum` 33, `skillDefOf` 32, `setDialogueFlag` 32, `getCardLevel` 32, `blip` 32

## Blocks that tests cut out and evaluate (keep the `NAME:BEGIN` / `NAME:END` lines; edit inside them with care)

- `ROAD_RARITY`: card-pool-2026-10-19.js, content14-2026-11-07.js, decisions-2026-10-18.js, pale-desert-2026-10-19.js
- `CHEAT2`: cheat2-2026-11-16.js
- `NET1_OVR`: net1-2026-11-12.js
- `CODEX_ANIMAL_UT`: animal-tags-2026-10-19.js
- `CODEX_UX`: ux-2026-10-19.js
- `UI18_CODEX_SKILLS`: ui18-2026-11-03.js
- `UI36_ACHVCARDS`: no test names it
- `NET1_CARDS`: net1-2026-11-12.js
- `DECK_SYNC_SY`: deck-sync-2026-10-19.js
- `ECON1_INCOME`: econ1-2026-10-30.js, econ3-2026-11-03.js
- `ECON1_BLOSSOMS`: econ1-2026-10-30.js
- `CARD_COPIES_NF`: deck-sync-2026-10-19.js, fg-2026-10-19.js, nf-2026-10-19.js
- `FORGE_RESET_FG`: fg-2026-10-19.js
- `BRAMBLES_UX`: ux-2026-10-19.js
- `DECK_LEADER_SY2`: deck-sync-2026-10-19.js
- `MATERIA_SOCKET_H1`: h1-2026-10-24.js
- `SAVE_GUARD_UI12`: ui12-save-guard-2026-10-31.js
- `PALE_DESERT`: no test names it
- `C13_ADMIN_SUBMAPS`: content13-2026-11-07.js
- `NET1_RAID`: net1-2026-11-12.js
- `TUTORIAL_LEVEL0_UT`: animal-tags-2026-10-19.js
- `UI19_MC_SKILLS`: no test names it
- `UI17_OVERVIEW`: ui17-2026-11-03.js
- `NE_DECK`: ne-2026-10-24.js
- `FORGE_UX`: ux-2026-10-19.js
- `SCALE_TRAIL`: scale-trail-2026-10-18.js
- `FORGE_FG`: fg-2026-10-19.js
- `NEST_SLOTS_NF`: ne-2026-10-24.js, nf-2026-10-19.js
- `FACTION_REWARD_TRACK`: content14-2026-11-07.js, rw5-2026-10-23.js
- `UI17_FULL_RESET`: ui17-2026-11-03.js

## Engine: AI (CPU) functions

`aiDevourPlan`, `aiEvoluteBase`, `aiEquipWorth`, `aiEquipPlay`, `aiHazardPick`, `aiHazardWorth`, `aiChooseSlot`, `aiLaneWeight`, `aiLanePick`, `aiLaneBonus`, `aiLaneTie`, `aiPowderVs`, `aiBonusVs`, `aiGiWorth`, `aiCanSwing`, `aiSwingOdds`, `aiChooseSlotSmartest`, `aiSlotScorerSmartest`, `aiBloomOdds`, `aiBloomSlotTerm`, `aiWinEnds`, `aiDeckAvgCost`, `aiReserveOf`, `aiPlanPlay`, `aiLosingBadly`, `aiSavePlan`, `aiLeaderToGather`, `aiFreeCard`, `aiBestKillNow`, `aiDoomed`, `aiSacrificePick`, `aiFieldWorth`, `aiDarkCastWorth`, `aiSightMissAt`, `aiPitch`, `aiSpellGainNow`, `aiUsefulNow`, `aiResourceGap`, `aiIncomingOnBramble`, `aiLethalBlock`, `aiShortOfResources`, `aiFogFor`, `aiSees`, `aiFront`, `aiFoes`, `aiTakeTurn`, `aiTakeTurnInner`, `aiTakeTurnOnce`

## Engine: Trigger and effect firing

`fireOnSacrifice`, `fireOnExile`, `fireDamageAction`, `fireHitLands`, `firePitchTriggers`, `fireFireball`, `fireMeteor`, `fireDynamite`, `fireRocket`, `fireLandslide`, `fireEarthquake`, `fireArrowVolley`, `fireShotsOf`, `fireMissile`, `fireGash`, `fireRender`, `fireSpawnFamilyTriggers`, `fireRoundStartTriggers`, `fireHealTriggers`, `fireReadyFor`, `firePositionBeam`, `fireOnKillTriggers`

## Saved state

167 localStorage key constants: `grep -n "_KEY = '" arena_app.js`. The cloud save is the `PROGRESS_KEYS` blob
(docs/guides/networking-api.md).
