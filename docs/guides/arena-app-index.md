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

`escapeHtml` 1754, `escapeAttr` 1233, `getCardDefs` 615, `numOr` 374, `boardCardEl` 343, `showToast` 323, `reducedMotion` 244, `floatText` 207, `hasGsap` 160, `iconHTML` 152, `fxAtLeast` 145, `cardTileHTML` 136, `switchTab` 118, `fightSafe` 90, `mapNumberOf` 88, `sk1Patch` 87, `denyShake` 87, `fnoise` 82, `loadConquestProgress` 80, `isSignedIn` 76, `conquestNodeId` 74, `sleep` 71, `renderBoard` 71, `fxHook` 70, `hqTileEl` 69, `grantText` 61, `cardBaseLevel` 61, `viewerHandPid` 60, `grantCurrency` 59, `findConquestNode` 58, `baseKind` 57, `renderPlay` 51, `parseGrantText` 50, `mainConquestMaps` 49, `saveCurrencies` 48, `updateCardHpDisplay` 47, `unlockCardForPlayer` 47, `tabOpen` 47, `updateCardStatusDisplay` 46, `deckTotal` 46, `loadTutorialDone` 44, `isMapUnlocked` 44, `dnFloat` 41, `renderForge` 40, `loadDialogueFlags` 40, `animMs` 40, `maxCopiesForRarity` 38, `mapIdAt` 37, `loadFactionChoice` 36, `fxLevel` 36, `cardSourceOf` 36, `resolveRound` 33, `pushLog` 33, `puff` 33, `loadTutorial2Done` 33, `featureUnlocked` 33, `dnLogNum` 33, `blip` 32, `copyModelOn` 31, `getCardLevel` 30

## Blocks that tests cut out and evaluate (keep the `NAME:BEGIN` / `NAME:END` lines; edit inside them with care)

- `ROAD_RARITY`: card-pool-2026-10-19.js, content14-2026-11-07.js, decisions-2026-10-18.js, pale-desert-2026-10-19.js
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

`aiDevourPlan`, `aiEvoluteBase`, `aiEquipWorth`, `aiEquipPlay`, `aiHazardPick`, `aiHazardWorth`, `aiChooseSlot`, `aiLaneWeight`, `aiLanePick`, `aiLaneBonus`, `aiLaneTie`, `aiBonusVs`, `aiGiWorth`, `aiCanSwing`, `aiSwingOdds`, `aiChooseSlotSmartest`, `aiSlotScorerSmartest`, `aiBloomOdds`, `aiBloomSlotTerm`, `aiWinEnds`, `aiDeckAvgCost`, `aiReserveOf`, `aiPlanPlay`, `aiLosingBadly`, `aiSavePlan`, `aiLeaderToGather`, `aiFreeCard`, `aiBestKillNow`, `aiDoomed`, `aiSacrificePick`, `aiFieldWorth`, `aiDarkCastWorth`, `aiSightMissAt`, `aiPitch`, `aiSpellGainNow`, `aiUsefulNow`, `aiResourceGap`, `aiIncomingOnBramble`, `aiLethalBlock`, `aiShortOfResources`, `aiFogFor`, `aiSees`, `aiFront`, `aiFoes`, `aiTakeTurn`, `aiTakeTurnInner`, `aiTakeTurnOnce`

## Engine: Trigger and effect firing

`fireOnSacrifice`, `fireOnExile`, `fireDamageAction`, `fireHitLands`, `firePitchTriggers`, `fireFireball`, `fireMeteor`, `fireDynamite`, `fireRocket`, `fireLandslide`, `fireEarthquake`, `fireArrowVolley`, `fireShotsOf`, `fireMissile`, `fireGash`, `fireRender`, `fireSpawnFamilyTriggers`, `fireRoundStartTriggers`, `fireHealTriggers`, `fireReadyFor`, `firePositionBeam`, `fireOnKillTriggers`

## Saved state

166 localStorage key constants: `grep -n "_KEY = '" arena_app.js`. The cloud save is the `PROGRESS_KEYS` blob
(docs/guides/networking-api.md).
