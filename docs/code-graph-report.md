# Graph Report - bw-graph  (2026-10-03)

## Corpus Check
- 27 files · ~290,237 words
- Verdict: corpus is large enough that graph structure adds value.

## Summary
- 1391 nodes · 3849 edges · 81 communities (68 shown, 13 thin omitted)
- Extraction: 95% EXTRACTED · 5% INFERRED · 0% AMBIGUOUS · INFERRED: 192 edges (avg confidence: 0.85)
- Token cost: 0 input · 0 output

## Community Hubs (Navigation)
- arena_app.js
- makeSimEngine
- renderMatchUI
- isSignedIn
- resolveRound
- switchTab
- renderVfxForEvent
- bramblewood-autobattle.js
- renderEditor
- renderPlayerSubTab
- bramblewood-ghosts.js
- cardTileHTML
- getCardDefs
- renderCodex
- escapeHtml
- testKitBuildField
- live_two_player.py
- conquestNodeId
- openTrenchMatch
- card-matrix.js
- harness.js
- openSkirmishEditor
- wireSettingsButton
- integrity.js
- raid.js
- scenarios.js
- renderConquestSubTab
- trench.js
- renderHome
- renderAdmin
- claimQuest
- settleOfflineRaidAfterMatch
- async-raid.js
- renderAutobattleSubTab
- abFight
- renderRaidSubTab
- openTrenchSetup
- startConquestMatch
- fitBattlefieldZoom
- buyPack
- autobattle.js
- claimTutorialWin
- renderForge
- two-player.js
- bramblewood-raid.js
- bramblewood-shaders.js
- renderPlay
- maybeRemindSignIn
- awardXp
- openCardEditor
- renderGuild
- matchStatsHTML
- unlockCardForPlayer
- achievementsPanelHTML
- showFacing
- runPowerTest
- liveMatchChannel
- beginDrag
- scheduleAmbient
- simResultsRowHTML
- bramblewood-integrity.js
- renderTxnsTab
- ensureStarLayer
- logText
- exportDeckCode
- updateVisibility
- loadRecentRaidAttempts
- wireRollTableAdmin
- run-all.sh
- burst
- cardUsageStats
- renderDeletedTab
- pitchValueStatDisplay
- entranceCardTweenDur
- initDb
- logMatchHistory
- rewardsCheer
- saveAndExitAsyncMatch
- testKitLoadPrefs
- wireLeaderWidget

## God Nodes (most connected - your core abstractions)
1. `getCardDefs()` - 122 edges
2. `makeSimEngine()` - 83 edges
3. `escapeHtml()` - 78 edges
4. `renderMatchUI()` - 64 edges
5. `resolveRound()` - 62 edges
6. `escapeAttr()` - 53 edges
7. `renderVfxForEvent()` - 39 edges
8. `cardTileHTML()` - 36 edges
9. `renderConquestSubTab()` - 36 edges
10. `isSignedIn()` - 35 edges

## Surprising Connections (you probably didn't know these)
- `reflowAfterKills()` --indirect_call--> `sideOf()`  [INFERRED]
  bramblewood-engine.js → tests/lib/harness.js
- `startTurn()` --indirect_call--> `sideOf()`  [INFERRED]
  bramblewood-trench.js → tests/lib/harness.js
- `abFight()` --indirect_call--> `boardSignature()`  [INFERRED]
  arena_app.js → bramblewood-engine.js
- `abFight()` --indirect_call--> `makeSimEngine()`  [INFERRED]
  arena_app.js → bramblewood-engine.js
- `abFight()` --indirect_call--> `noActionsLeft()`  [INFERRED]
  arena_app.js → bramblewood-engine.js

## Import Cycles
- None detected.

## Communities (81 total, 13 thin omitted)

### Community 0 - "arena_app.js"
Cohesion: 0.01
Nodes (146): _abPoolCache, ACHIEVEMENT_DEFS, ACTION_DEFS, ACTIVE_PRESETS, activeDeckId, ADMIN_RESET_LOCAL_KEYS, ANIMAL_TYPE_ARCHETYPES, ATMOSPHERES (+138 more)

### Community 1 - "makeSimEngine"
Cohesion: 0.07
Nodes (91): ACTION_KEYS, boardSignature(), buildDeckIdsFrom(), ensureStat(), makeSimEngine(), aiTakeTurn(), allBoardCards(), applyDecayTicks() (+83 more)

### Community 2 - "renderMatchUI"
Cohesion: 0.06
Nodes (66): activePlayerId(), afterPlayerAction(), aiActNow(), attachTieredHoverReveal(), attemptSummonLeader(), broadcastLiveState(), castleCharOf(), clearAsyncMatchState() (+58 more)

### Community 3 - "isSignedIn"
Cohesion: 0.06
Nodes (62): applySessionIdentity(), asyncRunSummaryHTML(), asyncStagePool(), authErrorText(), avatarCustomizerHTML(), avatarHTML(), avatarTitleLabel(), clearMyProfile() (+54 more)

### Community 4 - "resolveRound"
Cohesion: 0.06
Nodes (56): acceptDrawOffer(), applyMyriad(), buildWorkerBlobURL(), cancelLiveRankedQueue(), clearDungeonRun(), deckTotal(), delayForEvent(), diffUnlocks() (+48 more)

### Community 5 - "switchTab"
Cohesion: 0.08
Nodes (47): beginTutorialStage(), cancelMyInvite(), clearResumeSnapshot(), continueTutorialFromHome(), defaultAvatar(), enterLiveMatch(), friendsListHTML(), hasPlayedBefore() (+39 more)

### Community 6 - "renderVfxForEvent"
Cohesion: 0.09
Nodes (43): animateAttacker(), animateOverdraw(), animMs(), boardCardEl(), clearPlacementPreview(), currentCardByUid(), deathVfx(), dmgGlyph() (+35 more)

### Community 7 - "bramblewood-autobattle.js"
Cohesion: 0.11
Nodes (34): afterFight(), applyBoon(), applyDraftPick(), baseId(), boonOffers(), canSwapSubLeader(), castleHealthFor(), deckLevelOf() (+26 more)

### Community 8 - "renderEditor"
Cohesion: 0.11
Nodes (31): actionFieldsHTML(), cardName(), closeCardEditor(), cloudWriteCardOverride(), defaultSkillValue(), deleteCustomCard(), deriveSkillRows(), describeEffects() (+23 more)

### Community 9 - "renderPlayerSubTab"
Cohesion: 0.11
Nodes (31): b64DecodeUnicode(), createNewDeck(), deckCardClick(), deckHeroBannerHTML(), deckHeroHalfHTML(), deckSizeBadgeHTML(), decodeDeckCode(), deleteDeck() (+23 more)

### Community 10 - "bramblewood-ghosts.js"
Cohesion: 0.14
Nodes (22): buildStagePool(), capOf(), cardPower(), deckPower(), featuredRaidBoss(), fieldable(), generateGhostDeck(), ghostIdentity() (+14 more)

### Community 11 - "cardTileHTML"
Cohesion: 0.13
Nodes (27): abilityBadges(), adminManageCardsGridHTML(), adminManageCardsHTML(), biomeClass(), boardCardHTML(), bramblesTabHTML(), cardActionLogHTML(), cardIcoHTML() (+19 more)

### Community 12 - "getCardDefs"
Cohesion: 0.13
Nodes (25): antiqueCheck(), cardPowerScore(), coachBoardEl(), coachHandEl(), deckPreviewPillsHTML(), getCardDefs(), getDraftableIds(), getMyriadIds() (+17 more)

### Community 13 - "renderCodex"
Cohesion: 0.15
Nodes (24): archetypesOf(), battleRecommendation(), cardObtainableFrom(), cardSourceOf(), cardWhereToGetText(), cmpOrder(), codexPlacementHTML(), codexSectionOf() (+16 more)

### Community 14 - "escapeHtml"
Cohesion: 0.15
Nodes (25): currencyPillHTML(), escapeAttr(), escapeHtml(), friendRowHTML(), guildBrowseListHTML(), hpRibbonHTML(), mapSpotsHTML(), marketBrowseHTML() (+17 more)

### Community 15 - "testKitBuildField"
Cohesion: 0.14
Nodes (24): testKitAllCards(), testKitBuildDefs(), testKitBuildField(), testKitFillerPool(), testKitLogDivider(), testKitPickFiller(), testKitPlayRound(), testKitRefreshStatus() (+16 more)

### Community 16 - "live_two_player.py"
Cohesion: 0.13
Nodes (8): check(), main(), play_my_turn(), run_match(), setup_page(), check(), main(), new_page()

### Community 17 - "conquestNodeId"
Cohesion: 0.18
Nodes (21): achievementContext(), adminJumpToProgress(), avatarUnlockIds(), completeConquestNode(), conquestDeckRevealed(), conquestNodeId(), conquestPanTo(), ensureTutorialMarkersComplete() (+13 more)

### Community 18 - "openTrenchMatch"
Cohesion: 0.19
Nodes (8): openTrenchMatch(), trenchTileHTML(), createTrench(), startTurn(), T, mulberry32(), runTrench(), sideOf()

### Community 19 - "card-matrix.js"
Cohesion: 0.10
Nodes (17): args, defs, diffs, failures, fs, FULL, GOLDEN, H (+9 more)

### Community 20 - "harness.js"
Cohesion: 0.20
Nodes (15): boardCards(), boardEmpty(), checkInvariants(), Engine, fieldableIds(), fightSignature(), fs, hashStr() (+7 more)

### Community 21 - "openSkirmishEditor"
Cohesion: 0.17
Nodes (16): abandonMapLayoutEdit(), addSkirmishToMap(), applyCloudCfgRow(), applyCloudNodeEdits(), applyCloudRaidDef(), applyNodeEdits(), isAddedNode(), loadCloudCardOverrides() (+8 more)

### Community 22 - "wireSettingsButton"
Cohesion: 0.16
Nodes (16): adminEntryVisible(), battlefieldMapClass(), closeAnyOpenSettingsPanel(), loadAtmosphere(), loadBattlefieldBgOverride(), mountEntranceShaders(), mountMapShader(), mountSceneShader() (+8 more)

### Community 23 - "integrity.js"
Cohesion: 0.12
Nodes (13): atk, canon, cos, crypto, defs, del, failures, H (+5 more)

### Community 24 - "raid.js"
Cohesion: 0.12
Nodes (13): att, comp, defs, failures, H, killed, kr, nearly (+5 more)

### Community 25 - "scenarios.js"
Cohesion: 0.12
Nodes (14): coveredByScenario, deadEffects, defs, defsWithDummy, dir, DUMMY, failures, fs (+6 more)

### Community 26 - "renderConquestSubTab"
Cohesion: 0.16
Nodes (14): autoMapNodePositions(), battleModePickerHTML(), compassDiamondSVG(), distToSeg(), generatedMapDecor(), hashStr(), layoutNodePositions(), mapDecorHTML() (+6 more)

### Community 27 - "trench.js"
Cohesion: 0.17
Nodes (13): batch(), defs, EXPOSED, failures, G, H, out, part() (+5 more)

### Community 28 - "renderHome"
Cohesion: 0.19
Nodes (14): activateSpot(), featureUnlocked(), homeSceneHTML(), loadTutorialDone(), loadUnlocks(), migrateFeatureUnlocks(), nextBattleButtonHTML(), renderHome() (+6 more)

### Community 29 - "renderAdmin"
Cohesion: 0.20
Nodes (14): adminResetProgress(), currentCardDataHash(), effectiveCardDefsForHash(), formatEnergyCountdown(), loadEnergyState(), msUntilNextEnergyTick(), refreshEnergyHud(), renderAdmin() (+6 more)

### Community 30 - "claimQuest"
Cohesion: 0.21
Nodes (14): claimableQuestCount(), claimQuest(), conquestMapCleared(), loadLifetimeStats(), loadQuestState(), localDayKey(), medalTier(), openQuestsModal() (+6 more)

### Community 31 - "settleOfflineRaidAfterMatch"
Cohesion: 0.22
Nodes (14): currentOfflineRaid(), liveCanWrite(), liveFetchRaidAllies(), livePullProgress(), livePushGhost(), livePushProgress(), livePushRaidAttempt(), liveRefreshRaid() (+6 more)

### Community 32 - "async-raid.js"
Cohesion: 0.14
Nodes (11): BOSSES, coverage, defs, failures, G, H, NOW, path (+3 more)

### Community 33 - "renderAutobattleSubTab"
Cohesion: 0.22
Nodes (13): abCardChip(), abDeckSummaryHTML(), abDisplayDef(), abHeartsHTML(), abNextPhaseAfterResult(), abStatusBarHTML(), castleBlurb(), castleTileHTML() (+5 more)

### Community 34 - "abFight"
Cohesion: 0.21
Nodes (13): abFight(), abPool(), currentRaidAttempts(), liveRefreshGhosts(), liveRowToGhost(), loadAbGhosts(), loadRaidPartAttempts(), myGhostOwnerId() (+5 more)

### Community 35 - "renderRaidSubTab"
Cohesion: 0.21
Nodes (13): activeRaidDef(), allRaidDefs(), claimRaidReward(), liveRefreshRaidParts(), loadRaidBosses(), logRaidAttempt(), openRaidEditor(), raidBarsHTML() (+5 more)

### Community 36 - "openTrenchSetup"
Cohesion: 0.32
Nodes (13): bumpQuestCounter(), cloudPullState(), currentEnergy(), currentRaidPoints(), currentRaidStateFor(), deckSizeOkOrWarn(), openTrenchSetup(), saveCurrencies() (+5 more)

### Community 37 - "startConquestMatch"
Cohesion: 0.21
Nodes (13): dialogueDock(), gladiatorPower(), leavesRevealToMap(), loadDialogueFlags(), minusOne(), pickGladiatorLeader(), playDialogue(), seededRng() (+5 more)

### Community 38 - "fitBattlefieldZoom"
Cohesion: 0.23
Nodes (9): applyBattlefieldTransform(), cancelBattlefieldRecenter(), fitBattlefieldZoom(), panCameraToShowUid(), recenterBattlefieldPan(), setAtmosphere(), wireBattlefieldPan(), finish() (+1 more)

### Community 39 - "buyPack"
Cohesion: 0.27
Nodes (12): buyPack(), canAffordPack(), getShopPacks(), openPackAnimation(), packOnSale(), refreshShopAfford(), renderEntranceAuth(), handleLoginSubmit() (+4 more)

### Community 40 - "autobattle.js"
Cohesion: 0.18
Nodes (10): A, autoDraft(), characters, check(), defs, defsBefore, failures, H (+2 more)

### Community 41 - "claimTutorialWin"
Cohesion: 0.22
Nodes (11): basicCardIds(), buildFactionStarterDeck(), claimTutorialWin(), countsFromIds(), grantTutorialSeriesRewards(), rivalOf(), saveTutorialDone(), tutorialBasicsByWait() (+3 more)

### Community 42 - "renderForge"
Cohesion: 0.29
Nodes (11): canAffordLevelUp(), canAffordPrestige(), flipRevealCard(), getCardLevel(), getCardPrestige(), levelUpCost(), nextPrestigeTier(), prestigeUpCard() (+3 more)

### Community 43 - "two-player.js"
Cohesion: 0.20
Nodes (9): apply(), defs, failures, fair, H, ids, names, playMatch() (+1 more)

### Community 44 - "bramblewood-raid.js"
Cohesion: 0.31
Nodes (7): claimableReward(), contributionTier(), cycleOf(), fightFor(), fightRounds(), partTotal(), raidState()

### Community 45 - "bramblewood-shaders.js"
Cohesion: 0.38
Nodes (8): compile(), destroy(), destroyAll(), isSupported(), loop(), mount(), layer, program()

### Community 46 - "renderPlay"
Cohesion: 0.36
Nodes (9): attachDelayedTooltip(), getActiveDeck(), nextMatchRng(), renderPlay(), renderSandboxSubTab(), startLiveRankedMatch(), startOfflineRaidMatch(), startSandboxMatch() (+1 more)

### Community 47 - "maybeRemindSignIn"
Cohesion: 0.22
Nodes (9): authFormHTML(), authGateModalHTML(), cloudSignInWithGoogle(), hideSignInBanner(), isHostedOnline(), maybeRemindSignIn(), openAuthGateModal(), showSignInBanner() (+1 more)

### Community 48 - "awardXp"
Cohesion: 0.33
Nodes (9): awardXp(), checkXpMilestones(), levelBadgeHTML(), levelFromXp(), loadXp(), playerLevelInfo(), refreshLevelBadge(), saveXp() (+1 more)

### Community 49 - "openCardEditor"
Cohesion: 0.29
Nodes (8): blankCard(), blankSpeeches(), ensureCardMeta(), genUUID(), nextNumericId(), openCardEditor(), wireAdminManageCards(), wireAdminManageGrid()

### Community 50 - "renderGuild"
Cohesion: 0.29
Nodes (8): createGuild(), guildBrowseCreatePanelHTML(), guildRosterPanelHTML(), joinGuild(), leaveGuild(), loadGuildBrowseList(), loadMyGuild(), renderGuild()

### Community 51 - "matchStatsHTML"
Cohesion: 0.33
Nodes (7): cnpRewardsPreviewHTML(), computeMatchStats(), mapleLeafIconHTML(), matchStatsHTML(), packCostHTML(), rewardCountSpan(), rewardsPanelHTML()

### Community 52 - "unlockCardForPlayer"
Cohesion: 0.29
Nodes (7): grantCardCopy(), migrateCardCopiesFromUnlocks(), nestCardHTML(), renderNest(), saveCardCopies(), toggleCardCopyFoil(), unlockCardForPlayer()

### Community 53 - "achievementsPanelHTML"
Cohesion: 0.40
Nodes (6): achievementRewardChipsHTML(), achievementsPanelHTML(), achievementStatus(), claimAchievement(), saveClaimedAchievements(), wireAchievementsPanel()

### Community 54 - "showFacing"
Cohesion: 0.40
Nodes (6): allCardsOnBoard(), boardOrderOf(), clearFacing(), facingOf(), showFacing(), wireFacingHover()

### Community 55 - "runPowerTest"
Cohesion: 0.33
Nodes (6): effectiveScoreColor(), effectiveScoreOf(), powerRowsHTML(), renderPowerResults(), runOneTypicalTrial(), runPowerTest()

### Community 56 - "liveMatchChannel"
Cohesion: 0.40
Nodes (5): applyLiveStateSnapshot(), cleanupLiveMatch(), handlePeerAbandoned(), leaveLiveMatch(), liveMatchChannel()

### Community 57 - "beginDrag"
Cohesion: 0.40
Nodes (5): beginDrag(), elementUnderGhost(), endDrag(), fireDragEvent(), makeDataTransfer()

### Community 58 - "scheduleAmbient"
Cohesion: 0.50
Nodes (5): offPlayTab(), pickLayer(), scheduleAmbient(), scheduleGust(), spawnLeaf()

### Community 59 - "simResultsRowHTML"
Cohesion: 0.40
Nodes (5): renderSimResults(), simResultsRowHTML(), statColorClassForInfluence(), statColorClassForWinPct(), statSpan()

### Community 60 - "bramblewood-integrity.js"
Cohesion: 0.70
Nodes (4): cardDataHash(), gameplayView(), sha256(), stableStringify()

### Community 61 - "renderTxnsTab"
Cohesion: 0.50
Nodes (4): diffSummary(), fetchTxns(), renderTxnsTab(), txnRowHTML()

### Community 62 - "ensureStarLayer"
Cohesion: 0.67
Nodes (4): ensureStarLayer(), spawnCardStarPop(), spawnStar(), starFallCelebration()

### Community 63 - "logText"
Cohesion: 0.50
Nodes (4): logText(), renderLogLine(), sideLabel(), wireMatchHistoryPanel()

### Community 65 - "exportDeckCode"
Cohesion: 0.67
Nodes (3): b64EncodeUnicode(), encodeDeckCode(), exportDeckCode()

### Community 66 - "updateVisibility"
Cohesion: 0.67
Nodes (3): inBarRect(), inTopMiddleZone(), updateVisibility()

### Community 67 - "loadRecentRaidAttempts"
Cohesion: 0.67
Nodes (3): loadRecentRaidAttempts(), raidAttemptRowHTML(), renderOnlineRaidFeed()

### Community 68 - "wireRollTableAdmin"
Cohesion: 0.67
Nodes (3): resetShopPacksOverride(), saveShopPacksOverride(), wireRollTableAdmin()

## Knowledge Gaps
- **244 isolated node(s):** `PASSIVE_DEFS`, `ACTIVE_PRESETS`, `TRIGGER_DEFS`, `TRIGGER_FAMILIES`, `ACTION_DEFS` (+239 more)
  These have ≤1 connection - possible missing edges. (Counts symbols only; 317 node(s) total have ≤1 connection when file, concept and rationale nodes are included.)
- **13 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `sideOf()` connect `openTrenchMatch` to `makeSimEngine`, `harness.js`?**
  _High betweenness centrality (0.201) - this node is a cross-community bridge._
- **Why does `openTrenchMatch()` connect `openTrenchMatch` to `arena_app.js`, `renderMatchUI`, `abFight`, `renderRaidSubTab`, `switchTab`, `openTrenchSetup`, `cardTileHTML`, `escapeHtml`?**
  _High betweenness centrality (0.200) - this node is a cross-community bridge._
- **Why does `makeSimEngine()` connect `makeSimEngine` to `abFight`, `renderRaidSubTab`, `openTrenchSetup`, `settleOfflineRaidAfterMatch`?**
  _High betweenness centrality (0.100) - this node is a cross-community bridge._
- **Are the 28 inferred relationships involving `makeSimEngine()` (e.g. with `abFight()` and `currentOfflineRaid()`) actually correct?**
  _`makeSimEngine()` has 28 INFERRED edges - model-reasoned connections that need verification._
- **Are the 2 inferred relationships involving `escapeHtml()` (e.g. with `testKitPanelHTML()` and `testKitSelectedSummaryHTML()`) actually correct?**
  _`escapeHtml()` has 2 INFERRED edges - model-reasoned connections that need verification._
- **Are the 3 inferred relationships involving `renderMatchUI()` (e.g. with `forfeitMatch()` and `maybeShowCoachTip()`) actually correct?**
  _`renderMatchUI()` has 3 INFERRED edges - model-reasoned connections that need verification._
- **What connects `PASSIVE_DEFS`, `ACTIVE_PRESETS`, `TRIGGER_DEFS` to the rest of the system?**
  _244 weakly-connected nodes found - possible documentation gaps or missing edges._