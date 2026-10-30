# Changelog

Headline changes only, newest first. The detail lives in git history, `MASTER.md` and the design addenda.

## 2026-10-30 (package ECON1: Briar Blossoms, halved income, the first two daily dungeons; owner BRUP-1)
- **Briar Blossoms 💮 (placeholder name):** Reinforcing a bramble now costs Blossoms (the step's old Dust) plus a quarter of the old Dust and Leaves. Levels already bought stay. Spare-bramble credit moved over once, so it pays off the same steps. A won Conquest fight pays Blossoms (skirmish 4, elite 8, boss 15, raid boss 20, final boss 30, +10% a map number); a lost or drawn fight pays a quarter of that, times the share of the enemy bramble you took. Fights pay them once Reinforce is open (Map 28). They show in the results, on the Reinforce tab (its wallet, cost pills and a note) and in the Inventory and Profile wallets.
- **Income halved except first-time rewards:** fight repeats (and a repeat boss's Metal), Sweep, notices, quest tiers, errands, quick battles, PvP, Ghost runs, Gauntlet, raids, the group dungeon, the Auto-battler, the Trail's free lane, boosters' Dust and the Long Burrow's every-clear Gold Leaves now pay half. Each source has its own multiplier in `ECON_INCOME_MULT`. Kinds halved: Leaves, Dust, Gold Leaves, Metal. First clears, achievements, the level track and gifts are unchanged.
- **The first two daily dungeons (still hidden):** Murgle Mayhem pays 69 Dust + 46 Leaves for every won floor, the Undercroft 63 Blossoms, with no halving and no rank bonus. A week of 22 keys split 11/11 = a Common card Lv 0 → 10 (759 Dust, 504 Leaves) and a Common bramble Lv 0 → 10 (690 Blossoms). Arithmetic and days-to-level before/after: `docs/balance/econ1-2026-10-30.md`.
- **Cloud:** `supabase/proposed/20261030_bramble_resource.sql` adds `player_currencies.blossoms` (not applied; Blossoms stay in the browser until then). Owner calls BRUP-2 to BRUP-5. Tests: `tests/econ1-2026-10-30.js`.

## 2026-10-30 Release 10-30a (owner 09:18 "ok")
- Shipped: UI2 (pack-opener crash guard + gentler entrance, zoom only on overflow, Ambush jab, battery sparks, Shift+click pitch, PRO/BPRO deck preview), UI3 (status pills, emblem flight target, Map cards per list + hover detail + Export all, keyword tints, map-bar Players button, solo group dungeon fillers and uninterrupted win screen), ENG13 (optional hard Ambush, Slow keyword, Canopy Cover only vs ranged/flying, admin currency tap), ART2 (68 card arts), Stealth cost 1.5 -> 2.
- Checks: smoke (only the known d-2026-10-19) and the packages' own tests (8/8 on the merged batch); each package ran its own e2e. No full run for this release.

## 2026-10-29 (package UI3: pills, emblem landing, Map cards gallery, card tints, Players button, solo group dungeon)
- **Pills (owner 23:01 "If a status/context pill is irrelevant e.g. night-blind, don't show it. In fact, just show that the blind context pill is sufficient."):** in a fight a Night-blind / Sun-shy unit shows no pip while it sees (night-blind by day), the plain Blind pip while it is blind right now, and none at all when it already carries the Blind status chip (one Blind). Hand, Codex and detail keep the trait pip. Lit by its own Illuminate unit or True Strike: no pip. (S2)
- **Emblem landing:** the rank emblem's flight now lands on its own fight (the open fight panel's emblem, else the fight's node), read every frame so a panned, zoomed or scrolled map cannot leave it behind; the page's bottom-right corner is only the fallback when the node is off screen. (S3; see the open question in the report)
- **Map cards gallery:** a main map's overlay shows its MAP list and SPECIAL only; a submap's shows its own list and SPECIAL (S4). Hovering or tapping a card shows the full card detail, now above the overlay (it was drawn under it), with the reason as a line under it; the native title and the "?" marker and cursor are gone (S6). **Export all** beside Copy my picks: every list of every map in map order with chosen / maybe / cut and your Cut / Keep toggles (kept for the session), copied and offered as .txt and .json (S10).
- **Card tints (S5):** a very faint wash and inner glow on every card face: poison resist green, heat / fire (Dry) orange-red, cold icy blue, Darksight / Sonar / Keen Sense blue-black, Diurnal warm yellow, Nocturnal dark blue; up to three blend; under the name and numbers; flat on Low effects, off on No effects.
- **Players button (S8):** 👥 Players on the conquest map's admin bar (after Unclear map) opens the same overlay as Admin > Players (it still needs the database function the owner has not applied).
- **Solo group dungeon (S9):** the generic "Victory! Play again" card opened first and sat under the floor / run panel (and Play again would have restarted a fight); it never shows in a group dungeon now. The CPU ally plays its own random ghost deck (was a copy of yours), the lobby says so; Back and Leave from a run land on the Arena page with the Co-op pane open.
- Tests: `tests/ui3-2026-10-29.js`, `tests/e2e/ui3_2026_10_29.py` (shots in `docs/screens/ui3/`); stale checks updated with a dated note in `tests/review1-2026-10-29.js`, `tests/res3-2026-10-26.js`. Texts: `tools/i18n_2026_10_29_ui3.py` (7 keys, 12 packs).

## 2026-10-29 (package ENG13: the optional Ambush, Slow, Canopy Cover narrowed, the admin currency tap)
- **The Ambush no longer blocks the road (owner 21:36 "Ambushes - no need to be completed to progress - but typically very hard."):** Map 3's Ambush locks no fight (3-2 and the road past it stay open; "Blocked by the ambush" is gone) and Map 4 / the map-cleared check do not wait on it. It stays on the map with its Faction Growth reward. It is hard now: each side fields its strongest Common / Uncommon faction cards (`AMBUSH_DECKS`, 18 cards) on a Smart CPU at Enemy level 10 (Hummingbirds) / 6 (Otters) (`AMBUSH_HARD`). The Map 3 reference deck (80 games, seeds 9100 / 5100): Hummingbird Ambush 99% / 98% -> 28% / 25%, Otter Ambush 45% / 41% -> 31% / 24%; the map's road fights 79-93%. The first tap on 3-2 still springs it (call ENG13-4). The fights merely named "Ambush" (6-2, 10-2, 15-3, 17-4) are unchanged.
- **Slow 🐌 (new keyword, owner "loses tie when same speed"):** inside one Speed a Slow unit's swing, shot or action goes after every non-Slow one; two Slow units order as usual. Priced -0.8 (`bench.js skill slow`: -0.9 ± 0.9 at 80, -0.8 ± 0.5 at 200, test carriers in memory). On no live card (call ENG13-2).
- **Canopy Cover (owner "only blocks 50% attacks from ranged and flying attacks"):** it already dodged 1 in 2 on the seeded roll but against every single-target attack; now only shots, skills and Flying or thrown (Boomerang) swings. A ground unit's melee swing hits. Card text in 12 packs. Price unchanged (call ENG13-3). The card-matrix golden file has no diffs (its fights have no woods).
- **Admin currency tap (owner "clicking the currencies +100 then doubles it"):** no such control existed. In Admin Mode a tap on a wallet currency (Profile, Shop, Forge, Nest, Inventory) adds 100 under 100, then doubles, up to 99,999 (call ENG13-1).
- Tests: `tests/eng13-2026-10-29.js`, `tests/e2e/eng13_2026_10_29.py`; stale checks updated with a dated note in `tests/map-2026-10-24.js`, `tests/e2e/map_2026_10_24.py`, `tests/bal2-2026-10-24.js`, `tests/en5-2026-10-24.js`, `tests/keywords-2026-10-15r.js`. Texts: `tools/i18n_2026_10_29_eng13.py` (6 rows x 12 packs; Tagalog, Tamil, Japanese, Korean deserve a native read).
## 2026-10-29 (package ART2: card art for 68 listed cards)
- **68 cards on the map lists now have art** (owner 22:23 R9): 56 from Gemini (14 sheets) and 12 from ChatGPT (thorn-shrike, wolf-spider-mother, field-vole, hedgerow-shrew, old-sturgeon, water-shrew, muskrat-lodgekeeper, pyrenean-desman, razorbill, gannet-nestweaver, alligator-gar, fen-mink), all in the pixel style beside the existing cards. NightCafe was tried; no NightCafe art shipped (frames, a wrong ant raft, and Chrome blocked repeat downloads from the site).
- Method: one 2x2 sheet per four cards, cut by `tools/art/art2_import_2026_10_29.py` (gap, border and frame trim, centred square), pixel pass to 128 px on `tools/art/palette.json`, x2 nearest to 256 px, palette PNG in `art/cards/<id>.png` with its `<id>.prompt.txt`, the data URI in that card's `art` field (targeted line edit), built to `assets/cards/`. Sheet map: `docs/art/art2-sheets-2026-10-29.json`; prompts: `docs/art/art2-plan-2026-10-29.json`; contact sheet: `docs/art/art2-contact-2026-10-29.png`.
## 2026-10-29 (package UI2: pack opener crash, no early zoom-out, Ambush, capsule sparks, Shift+click pitch, PRO decks)
- **R2 The pack opener can no longer get stuck:** a card the opener could not draw (a pulled card id the card list lacks, or a card face that throws) threw inside the tear's timer, so the torn pack stayed on screen with its card back half out, and Skip / Open all drew the same card and threw again. Such a card now shows as a plain tile with its name, each stage falls through to a simpler one (the reveal to the pack's summary, a summary or Open all to closing), and the opener always closes; the cards were already credited. The reward pack now glides gently to the centre, growing to 80%, and the opener's pack pops in with a small bounce (none with reduced motion or Effects Off / Low).
- **R1 No zoom-out in advance:** the board sized its cards for every column of the row, the empty edge columns too (seven units drew nine columns), so cards shrank before any unit was near the edge. Cards and the zoom now count only the columns the units stand in; they shrink only when the units would leave the field. Checked at 1366x768, 1920x1080, iPad 820x1180 / 1180x820 and 390x844 (shots of 7, 9 and 12 units in `docs/screens/ui2/`).
- **R3 Ambush:** a card killed as it lands (by an Ambush, a trap, a Pounce...) was never drawn, so it seemed to phase out; it now lands, the ambusher strikes it with a short jab (shorter and quicker than an attack), then it dies with the normal death. Its on-play effects still happen first; the engine is unchanged.
- **R5** Using an Energy capsule sends ⚡ sparks into the Energy pill, which pulses as they land (one pulse with reduced motion / low effects). **R7** Shift+click a card in your hand to pitch it (same rules as dropping it on the Graveyard; the Graveyard's tooltip says so). **R8** PRO / BPRO (and X-REF) fights always show their deck strip.
- Tests: `tests/ui2-2026-10-29.js`, `tests/e2e/ui2_2026_10_29.py` (the Morel Hollow packs with a broken card, Skip / Open all, zoom at five sizes, Ambush, capsule, Shift+click, PRO). Texts: `tools/i18n_2026_10_29_ui2.py` (1 row x 12 packs).

## 2026-10-29 Release 10-29b (owner 21:36 "Push to online anyway")
- Shipped: REVIEW2 (Map cards gallery panels, pills, large cards, counts; the Ambush at the middle of its road), UI1 (raid deck card shape, touch dragging, battle camera on the units, Match log only, Errands → Quests + Dailies tab), HUBDEC1 (decision groups and hub tabs), ADMINU1 (admin player list; needs its proposed SQL applied), CARDSIZE1 (design proposal only).
- Checks: smoke (only the known d-2026-10-19) and the packages' own tests (12/12); each package ran its own e2e. No full run for this release (owner asked to push).

## 2026-10-29 (package ADMINU1: Admin > Players overlay)
- **Player list for the owner (10-28 23:35, 10-29 19:14):** Admin tab > Players has a new **Open the player list** button (Admin Mode on only). It opens an overlay with every profile: name, level, highest map, cards, fights, last seen (relative) and joined, sortable by any column, with a name search and an "x of y players" count. Works at 390 and 1366. An older "Load players" list (admin_list_players, applied 10-16) was already there and stays.
- **Waiting for "apply it":** `supabase/proposed/20261029_admin_user_list.sql` adds the read-only, admin-only `admin_user_list()`. Until it is applied the overlay says "The player list needs the database function from supabase/proposed/20261029_admin_user_list.sql (owner: 'apply it')." Decision ADMINU1-1. No emails or auth data are returned.
- Tests: `tests/adminu1-2026-10-29.js`, `tests/e2e/adminu1_2026_10_29.py` (stubbed rpc). Shots: `docs/screens/adminu1/`. Texts: `tools/i18n_2026_10_29_adminu1.py` (26 rows x 12 packs; Tagalog, Tamil, Japanese, Korean deserve a native read).
## 2026-10-29 (package UI1: raid Deck card, touch drags, camera on the mass of units, one Match log, Quests vs Dailies)
- **O1 Raid decks no longer stretched:** on a desktop window the raid's enemy Deck, castle and Environment cards got the big card height with the raid's small width (64 x 142). They are card-shaped again (64 x 80 at 1366, 51 x 64 at 390), the same height as the Environment cards beside them.
- **O2 Dragging a card no longer drags the screen (phone):** cards that drag at once (hand, leader, board) and the drop zones take every touch move (`touch-action: none`; `pan-x` while the hand itself scrolls sideways, where a mostly sideways move scrolls the hand and a mostly vertical one drags); while a drag lasts the page takes no touch scroll or overscroll (`body.bw-touch-dragging`); the touch handlers are also bound to the touched card, so a hand redraw mid-drag no longer freezes the ghost and scrolls the page. A touch that starts outside a card still scrolls; the deck builder keeps its hold-to-drag.
- **O3 Camera on the mass of units:** the battle camera rests on the average position of the units on the board (both sides); it keeps still until the mass has moved about a third of a column (no jitter), never lets a card leave the frame, and goes back to the middle on an empty board. The old "stay put while every card is in the middle five columns" rule is gone. Phone and raid fights keep their column-window framing.
- **O4 One list:** the Profile's Match History panel is gone; the Match log stays. The `match_history` rows are still written and read (the stats panel uses them); no table was touched.
- **O8 Quests are the errands:** "Errand(s)" now reads "Quest(s)" everywhere the player sees it (writs, limit line, toasts, Shieldback's line). The Quests tab shows only those; dailies, weeklies and journeys (and the "Your dailies" list) moved to a Dailies tab beside it. The Quests tab shows once the Quest Board is open. The home note is the Notices board ("Dailies & quests").
- Tests: `tests/ui1-2026-10-29.js`, `tests/e2e/ui1_2026_10_29.py` (touch emulation, O2 and O1); `tests/bv-2026-10-24.js` follows the camera (O3). Shots: `docs/screens/ui1/`. Texts: `tools/i18n_2026_10_29_ui1.py` (Tagalog, Tamil, Japanese, Korean deserve a native read).
## 2026-10-29 (package HUBDEC1: the hub's Decisions tab in three sub-tabs)
- **🎮 Game / 🏗️ Architecture / 💰 Finance** (owner 10-29 19:14). Every item in `docs/decisions.json` has a `group` (465+6 game, 17+1 architecture, 1+2 finance, DONE+YET); each sub-tab has its own YET / DONE counts, status, area, type and search filters. Game opens first; the last sub-tab is remembered (localStorage); an item with no group counts as Game; a search or Home link to a decision switches to its sub-tab.
- Tools: `tools/hub/decisions_add_group.py` (one-off, rewrites only the changed lines); every `tools/*decisions*.py` writer now sets `group` (default game) on the items it adds. Test: `tests/hubdec1-2026-10-29.js`.
## 2026-10-29 (package REVIEW2: the 🃏 Map cards gallery in panels with pills and large cards; the Ambush lies on its road)
- **Map cards (admin):** every list is a panel of its own with Chosen, then Maybe, then Cut cards in boxed parts (readable at 390 and 1366). Cards are the deck-size card with the same hover / tap zoom; the ✂ Cut / ↩ Keep button stays under each. The reason text is gone from under the cards (it stays as the hover title); short pills replace it: Skirmish (a skirmish reward or first-clear card), Carried or Unique, Your note (you asked for it), Claude's pick, and the basic pack. No "kept" pill.
- **Copy my picks** has a tooltip (hover and keyboard focus): "Copies your Cut/Keep choices as text, ready to paste to Claude". Beside it a live line per list, "X/N new cards, Y/M carried cards", that follows each Cut / Keep. Targets: main map N = the list's unique count when it is 8-11, else 11; M = its carried count when 4-5, else 5 (none for a map nothing is carried to); submap N by class (new location 3, challenge 1, Volcano Lair 5, `docs/balance/theme2-proposal-2026-10-28.json`), M = 10 (more if the list already carries more); the Tutorial's lists and SPECIAL: no target.
- **The Ambush has no link and stands on its road:** it was already unlinked (requires nothing); it now stands at the computed middle of the road it interrupted (3-1 to 3-2) instead of a saved offset, follows its neighbours in the layout editor, is not draggable or linkable there, and never bows the road it sits on. Unlock order unchanged (3-2 stays locked until it is won). The fights named "... Ambush" (6-2, 10-2, 15-3, 17-4) are ordinary linked skirmishes and were not touched.
- Tests: `tests/review2-2026-10-29.js`; `tests/review1-2026-10-29.js` and `tests/e2e/review1_2026_10_29.py` follow the new markup. Shots: `docs/screens/review2/`. Texts: `tools/i18n_2026_10_29_review2.py` (12 keys, 12 packs).

## 2026-10-29 Release 10-29a (batch-1023e round 1: the new map lists)
- Shipped: PACK1 (packs from the map lists, 🃏 Map cards admin button), APPLY1 + LISTFIX1 + THEME3 (the owner-approved map lists, submaps on their own list, the owner's 23:35 / 00:10 notes, tutorial T-1/T-2 list), REVIEW1 (Map cards gallery: Chosen / Cut cards / Maybe), FLAIR1 (the Dragon Lair's final-boss look), SKL0 (T-1/T-2 skills "?" except Flying; Bee Knight's Swarm at Level 1), TOOLS1 (balance workbench), RELFIX3 (PRO/BPRO reference decks rebuilt).
- Checks: full unit run in chunks (no new failures; older failures unchanged), card-matrix (0 failures, 0 golden diffs), e2e ui_smoke (only the known tutorial 53%, TUT-1), flows (0 issues), flair1 and review1 (all pass).
- Not in this release (round 2): per-card re-fit and skill recosting (step 3), skirmish enemy decks rebuilt on the new lists (step 4).

## 2026-10-29 (package RELFIX3: PRO / BPRO reference decks rebuilt from the new map lists; boss cards to SPECIAL; tests follow)
- **PRO / BPRO decks hold only cards their map can give** (after THEME2 / APPLY1, LISTFIX1, THEME3 and the Rafflesia change). Every PRO / BPRO deck that broke its map rule (a card off the map's own pool, or one a player cannot hold by then) was dropped to `replaced` and the map refilled from new optimizer runs (`tools/opt/deckopt.js`, budget 8000, `--ladder none`, tag `2026-10-29-relfix3-maptrue` / `-bpro`; `docs/balance/opt/`): map-true runs on mo, mf, mq, mb, mg, mc, m2, mw, m8, mu, m4, m7, m10, mv, m5, mt, mi, md, mpd, m3, m11, me; bpro runs on every map and side map 0-20 but mq, mp, mz, mt (their BPROs were legal). `node tools/opt/pro_skirmishes.js --apply` per map range wrote `canonical/pro-skirmishes.json`; all 198 PRO / BPRO decks now pass the map rule. Skirmish enemy decks are not touched (step 4).
- **Boss cards moved from MAP to SPECIAL** where they sat over the map's rarity cap (old-shell, the-gannet-queen, drowned-matriarch, old-snapjaw, heron-hag, echo-matriarch, reef-admiral, pride-queen, wolfsbane-alpha, yeti-chieftain, triumvirate; `tools/opt/relfix3_boss_special_2026_10_29.py`). They still come from their boss fight.
- PRO ease re-measured on the new decks: `docs/balance/pro-ease-2026-10-29-relfix3.json` (`tools/opt/pro_ease.js`, 40 games, the map reference and Reference-2): 54 of 396 pairings over 85% (11 against the map reference), was 30 of 376.
- Tests follow the new lists (dated "2026-10-29 RELFIX3" notes): codex-book harness (PACK1's pack grouping), fin2 / skills-sk2 / skills-sk2b (out-of-play cards skipped), rw5, bal2, eb, gd2, opt2, content4, bal7, pref (reads the newest PRO ease measure), the CHANGELOG windows of bl, card-pass and the others SKL0 / RELFIX3 pushed down. Decks over the copy ladder after THEME3's re-ranks join the step-4 list (`docs/balance/listfix1-decks-2026-10-29.json` `overCopies`).

## 2026-10-29 (package SKL0: every skill "?" in T-1 / T-2 except Flying; Bee Knight's Swarm arrives at Level 1)
- **T-1 / T-2 show no skill but Flying** (owner 10-28 23:35 "all should be locked in T1/T2 except flying", 10-29 13:07 "all skills to be "?" until Map 0"). While a T-1 / T-2 fight is on screen (its results too) or the faction screen before it is open, every skill of every card, yours and the rival's, reads as the one "?" chip on card faces, in the zoom and tooltips, and the battle log names no skill but Flying; the keyword coach and codex book treat them as hidden. One central check in the reveal machinery (`arena_app.js` `revealTut12`, used by `maskHiddenSkills`, `hiddenSkillSet` / `skillHiddenNow` and `logText`). T-3 to T-5 and Map 0 follow the reveal map as before; the codex and collection outside the tutorial are unchanged; Admin Mode shows everything. Display only: the engine plays the real cards.
- **Bee Knight: Swarm arrives at Level 1** (owner 13:07: "the lvl 0 <-> lvl 1 skills trick"; `canonical/cards.json` `levelSkills: {1: {swarm}}`, its printed Level 1 card keeps Flying + Swarm). In T-1 / T-2 a card with a skill that arrives at a later level fights as a Level 0 copy without it, on both sides (`tutorialPlainDeck` / `tutorialLevel0Def`): a T-1 / T-2 Bee Knight is a 1/1 with Flying only. Budget (`bramblewood-budget.js`): Level 0 Flying 2A+H+S 4.5 <= N 10.2 (cap 2 1.5 <= 23.12); Level 1 Flying + Swarm 7 <= N 11.44 (cap 2 7.75 <= 29.08). No other T-1 / T-2 card has a skill; today's live tutorial decks hold no Bee Knight.
- Not done (owner call): all T-1 / T-2 cards at Level 0 (Duckling, Pond Trout, Silver Minnow, Cottontail and the other Base cards are Level 1 on a first T-1, on both sides). Measured: T-1 would fall from 66% to 44% simulated wins (200 seeds, CPU for you, the fixed seed lost); T-2 78% -> 80%.
- Tests: `tests/skl0-2026-10-29.js`; `tests/tx-2026-10-21.js` 7 now expects Diurnal "?" in a tutorial fight. Shots: `docs/screens/skl0/` (a T-1 fight at 390 and 1366, a test deck with Bee Knight and Caustic Scorpion).

## 2026-10-29 (package REVIEW1: Chosen / Cut cards / Maybe in the 🃏 Map cards overlay; admin only)
- **The overlay shows the map list review** (owner 10-29 00:13: "also show what you would have cut ... Cut cards ... 'maybe's in a 3rd section"). Data: `canonical/map-review.json` (an empty stub for now; THEME3 fills it), inlined at build like the pack extras. For each list (the map, each side map, SPECIAL as `<map>:special`) with review data: **Chosen** (the cards as before, each with its one-line why and an owner / Claude / kept badge; the why is also the hover / tap title), **Cut cards** (dimmed, ✂) and **Maybe** (?). Without review data a list shows as before plus "No review yet". Tiles still zoom.
- **Telling Claude your call:** each tile has a small button (✂ Cut on a chosen card, ↩ Keep on a cut or maybe card); **Copy my picks** copies e.g. `Sunken Hollow / Map: keep A, B; cut C` to paste into the chat.
- The 🃏 Map cards button is in the build after ✅ Mark cleared (checked at 1366 and 390; the owner's 09:29 screenshot without it is most likely the live site, which is built from `main` and has only what is pushed).
- Texts in 12 packs (`tools/i18n_2026_10_29_review1.py`; Tagalog, Tamil, Japanese and Korean deserve a native read). Tests: `tests/review1-2026-10-29.js`, `tests/e2e/review1_2026_10_29.py`; shots in `docs/screens/review1/` (fake entries, in the test page only).
## 2026-10-29 (package THEME3: the owner's list notes applied, then Claude's own cuts and adds by theme; the review data)
- **Map lists** (`canonical/map-pools.json`, tool `python3 tools/theme3_2026_10_29.py`, idempotent): the owner's notes of 10-28 23:35 (O7, O9, C2, L1-L5) and 10-29 00:10 (Q1-Q7) applied, then Claude's theme cuts / adds (L5). Per list in / out and counts: `docs/balance/theme3-2026-10-29.md`.
  - Tutorial split (O7 / L1): a new list `mtut12` (T-1 / T-2) holds only Bee Knight, Earthworm, Pond Trout, Silver Minnow, Duckling, Cottontail and Crossed-Eyes; `mtut` (T-3 to T-5) is unchanged. `arena_app.js` `MP_EXTRA_LISTS` (a list that is not a map): its own section in the 🃏 Map cards overlay and editor; `mapNumberOf('mtut12')` reads as the Tutorial. No fight draws on it.
  - Map 0 (O9 / L2 / L3): carries only Crossed-Eyes, Bee Knight and Cottontail; 9 new (Bee Forager, Bee Sentry, Ant Scout, Ant Hill, the two skirmish rewards, House Cat, Beaver Lumberjack, Owl Sentinel): 12.
  - The Old Bramble (Q7): the Ent + 12 Rare / Very Rare woodland, thorn and taiga cards from Maps 7-19, in place of Map 0's commons. Rafflesia (C2) on The Canopy, whose savanna carry-overs gave way to forest-roof cards.
  - First-clear cards and skirmish rewards the owner cut stay reachable on their map's SPECIAL (Map 2: Grey Seal Bull, Fiddler Crab Swarm, Tidepool Trapper Crab; Map 4: Old Sturgeon, Stone Turtle Warden; Map 5: Venomlord Serpent; Map 6: Marsh Wisp; Map 14: Hoopoe Herald; Map 20: Woodland Brawler).
- **Fungal Colossus** (Q5): Common -> Uncommon (`canonical/cards.json`); its retheme is noted, not done.
- **Review data** (owner 00:13, Q14): `canonical/map-review.json`, per list `chosen` / `cut` / `maybe` with one line of why and who (owner / claude / kept), for the in-game gallery (REVIEW1).
- `canonical/card-obtain-maps.json` regenerated. Stale tests that pinned THEME2's lists now read THEME3's (content2, content3, content4, bal7 CONTENT4-1); card-pass skips cards out of play (LISTFIX1's budgetHold).

## 2026-10-28 (package TOOLS1: the balance workbench, tools only; no card, deck, price or game change)
- **`node tools/bench/bench.js`** (owner 10-28 21:40, tools T1-T3 of the balancing plan), documented in `docs/workflows/balance.md`:
  - `contrib` (T1): a card's contribution by paired swaps (the same fights with k copies of the card and with k Blanks), any card subset, a map's context (`--map N`) or the global one; cached and resumable, about 15 s a card; reports contribution ± 95%, value per budget point (per copy / N) and the distance from the fair line.
  - `skill` (T2): a skill's worth in budget points measured on its carriers (with / without at the same stats) against a +1 Attack / +1 Health yardstick, compared with its price; `--all` ranks every skill by mispricing (vanilla carriers for skills on one card) and writes a suggested-price file for review (`canonical/skill-costs.json` untouched).
  - `deck` (T3): strong decks with different focuses (open, big, economy, stone / metal, swarm, the list's skill families) from a card list under the owner's step-4 rule (at most 6 different cards, 4 copies), over deckopt's gauntlet.
- First runs: `docs/balance/bench-skills-2026-10-28.md` (+ `bench-skill-prices-2026-10-28.json`), `docs/balance/bench-contrib-global-2026-10-28.md`, `docs/balance/bench-deck-map12-mh-2026-10-28.md`.
- Hub: a 🧪 Workbench section in the 🧬 Deck optimizer tab (the mispriced skills, value per budget point for every card, the focused decks).
- `tools/opt/deckopt.js` exports its evaluation helpers (no behaviour change). Test: `tests/tools1-2026-10-28.js`.
## 2026-10-28 (package FLAIR1: the Dragon Lair's own final-boss flair)
- **The Dragon Lair (Volcano Lair, Map 20) is the 0-20 road's last boss and looks it** (owner 23:06: "a flair that's not the normal boss flair"). Driven by `finalBoss:true` on the map `mx` and its node 20-B-4 (`flairLairMap` / `flairLairNode`), not by a name; molten gold and ember where the normal boss is blood red with a skull. CSS and existing glyphs only.
- **Map:** the lair's entrance on Map 20 gets an ember ring with a slow glow and a crown; the 20-B-4 node a turning molten ring, a crown and a flame.
- **Fight intro:** the versus opener turns molten gold, with a "Final boss of the road / The Dragon's Lair" banner and a subtitle, held 4.3 s (a retry keeps the short beat); a tap still skips it. The title card after it carries the same name for 3.4 s.
- **Battle:** a quiet ember edge under the board (z-index -1, click-through), never over a card.
- **Victory:** "THE DRAGON FALLS" with a crown; the first clear adds "The road from Map 0 to Map 20 is walked to its end."
- Reduced motion and low / no effects stop every animation. Texts in 12 packs (`tools/i18n_2026_10_28_flair1.py`; Tagalog, Tamil, Japanese, Korean deserve a native read). Tests: `tests/flair1-2026-10-28.js`, `tests/e2e/flair1_2026_10_28.py`; shots in `docs/screens/flair1/`.
## 2026-10-29 (package LISTFIX1: submap fights read their own list; the APPLY1 follow-ups; decisions APPLY1-1..4 filled per the owner's 10-26 "fill in the decisions")
- **A submap fight draws only its own list + SPECIAL** (APPLY1-1; owner 22:47 "Submaps would be 1-3 cards + 10+ carried over, so 11-14"), no longer the parent's MAP list too. Each submap stores THEME2's whole proposed list (12-15); a submap fight's pool is 12-19 with the parent's SPECIAL (was 16-27). Game: `mapPoolTiers` (enemy deck ⚠ marks, + Load any card, VIS4 "This map's cards"), the 🃏 Map cards editor (a card may sit on MAP and a SUBMAP at once; add no longer takes it off the other lists, a move takes it off its own list only); packs still count a submap's cards from the map that unlocks it. `tools/lib_map_pools.js` (`fightPool`, `isOutOfPlay`, `budgetHold`) and `tools/apply1_theme2_2026_10_28.py` (reproduces the file) follow; the old shape still reads.
- **First clears give their card again**: the 5 first-clear pack cards off their map's list are on its SPECIAL list (mf compost-grub, mc hawk-arrowkeeper, mu sleepless-shrew, m4 blind-cave-fish, mr fox-kit; 3 of them were on no list, so the first clear gave nothing). APPLY1's SPECIAL drops that main-map fights still need are back (m7 orca-vanguard, m10 wound-reaver, md sand-widow, m8 venomlord-serpent, m22 rimeheart-colossus).
- **Sources** (APPLY1-4): the 12 listed cards with none get the pack of their first map: ant-hill Pack 1, 11 cards Pack 4. Packs: 1 53, 2 59, 3 59, 4 35 (APPLY1: 50 / 57 / 59 / 24). `unattainable` (data only) follows the lists: 7 listed cards lose it, 219 out-of-play cards get it (`docs/balance/listfix1-cards-2026-10-29.py`, targeted edits). `canonical/card-obtain-maps.json` regenerated.
- **Cards on no list are out of play** (APPLY1-2): budget checks skip them and report them as unplaced (`card-pool`, `en2`, `en4`, `en5`, `en6`, `eng10`, `eng12`, `content2`, `content3`; also `en8`'s Stem rule for harp-seal-pup). Listed cards over budget for their first map (7: ant-warrior, coral-polyp-colony, bog-leech, bogfire-newt, ash-imp, ember-centipede, war-elephant) wait for the owner's re-fit in `docs/balance/listfix1-pending-budget-2026-10-29.json`.
- **Decks not rebuilt** (step 4): the deck-vs-pool checks report; 305 fights hold a card off their pool under the new rule (142 of them the endless dungeons and the tower), `docs/balance/listfix1-decks-2026-10-29.json`. Tests brought along with dated notes: `n221`, `bal7` M3, `content4`.

## 2026-10-28 (package APPLY1: the THEME2 map lists applied)
- **Every map's card list is THEME2's** (owner 23:05 "Okay to THEME1-1"; 23:06 submap classes). 25 main maps: 15 cards each (8-11 unique + 4-5 carried). 15 submaps: the proposal's cards that are not already on the parent's list (a submap fight draws its parent's list + its own + special, so those come in anyway); a submap fight's pool is 16-27 cards, not the proposal's 11-14 (call in the report). The tutorial, endless dungeons and tower lists are unchanged; 6 special cards now on their map's list dropped as duplicates. List entries 736 -> 554. `python3 tools/apply1_theme2_2026_10_28.py` (targeted rewrite of `canonical/map-pools.json`).
- **Packs follow** (PACK1's derived pools): Pack 1 92 -> 50, Pack 2 128 -> 57, Pack 3 116 -> 59, Pack 4 29 -> 24; basic-pack cards in no pack ("Not obtainable yet") 91 -> 266. `canonical/card-obtain-maps.json` regenerated (170 cards' map changed).
- **Not done here (the owner's steps 3-4):** no card re-fitted (109 cards newly over budget, all because they are on no list now and read Map 0; 5 newly inside), no deck rebuilt (173 fights now hold a card off their pool). Also listed: 5 first-clear pack cards off their map's list, 12 listed cards with no source, unattainable flags out of date. Report: `docs/balance/apply1-2026-10-28.md` / `.json` (`... report`).
- Tests brought to THEME2's lists with dated notes: `content2`, `content3`, `content4`, `bal7`, `en`, `en4`, `en8`, `fx4`, `n221`. Left failing on purpose (real, waiting on the owner's re-fit / deck rebuild / sourcing): budget checks for cards now read at Map 0 (`card-pool`, `en2`, `en4`, `en6`, `eng10`, `eng12`, `content2`, `content3`), off-pool skirmish decks (`content2` 2-1/2-2/2-3/3-3), THEME2 cards with no source (`n221`), sourced cards still flagged unattainable (`bal7` M3), harp-seal-pup's Chrysalis now before Map 20 (`en8`).

## 2026-10-28 (package THEME2: the per-map proposal re-sized to the owner's 22:47 numbers; nothing applied)
- **Still a proposal** (owner 10-28 22:47: "main maps ... 8-11 cards + 4-5 carried over, 12-16 in total. Submaps would be 1-3 cards + 10+ carried over, so 11-14. Don't worry about the other cards"). Main maps now 11 unique (slots 9-11 only for strongly themed cards; Map 0 and Gannet Cliffs 10) + 4-5 carried picked for the mix (a high-cost card, a generator, a creature): 15 a map. Submaps keep THEME1's delve / challenge table and carry 10-11 parent / earlier cards that fit them: 12-13 a submap. Lists 613 -> 559 entries, 307 different cards on a list; the 426 cards on no list are simply listed per old pack. Only flag: Volcano Lair's 2 skirmish rewards over its 1. Files: `tools/theme2_proposal_2026_10_28.py`, `docs/balance/theme2-proposal-2026-10-28.md` / `.json` (THEME1's kept as history).
- Hub, 🗺️ Map cards: the Proposal toggle reads THEME2; its summary shows "on no list" per old pack instead of pack-only / no-home. THEME1-1's body points at THEME2 (`tools/theme2_decisions_2026_10_28.py`), still open.
## 2026-10-28 (package PACK1: packs draw from the map lists; 🃏 Map cards on the skirmish panel)
- **Packs hold only the cards on their maps' lists** (owner 22:47: "For now, remove all cards from the packs. We'll be more deliberate of our choices."). A basic pack's pool is derived at load: the basic-pack cards whose first map list (`canonical/map-pools.json`, live edits included) is on its maps (Pack 1 Maps 0-6, 2 7-13, 3 14-20, 4 21-27), plus `canonical/pack-extras.json` (empty; the Pack editor's "Add a card" now edits a pack's extras). Pools: Pack 1 143 -> 92, Pack 2 154 -> 128, Pack 3 126 -> 116, Pack 4 33 -> 29. 91 cards are in no pack now and read "Not obtainable yet" (data kept). The packs' sizes, rarity weights and foils are unchanged; the Mystery Booster and the Factions pool are unchanged. Every giver that reads the basic pool (base track, card drop, raid claim, bundles' general card) follows.
- **Budget's map term:** a pack card's map is its first map list; a card in no pack is Map 0. `canonical/card-obtain-maps.json` regenerated (76 cards changed). Report: `node tools/pack1_pools_2026_10_28.js` -> `docs/balance/pack1-pools-2026-10-28.json`.
- **🃏 Map cards** (admin) with Edit skirmish / Edit rewards / Mark cleared: the map's whole list as an overlay, one section per list (map, each side map, special), VIS4's tiles with zoom tooltips and a "📦 Pack N" tag. VIS4's section at the foot of the panel stays.
- Owner calls PACK1-1..3 (`tools/pack1_decisions_2026_10_28.py`). Texts in 12 packs (`tools/i18n_2026_10_28_pack1.py`). Test: `tests/pack1-2026-10-28.js`.

## 2026-10-28 (package THEME1: the balancing plan's steps 1 and 2 as a per-map proposal; nothing applied)
- **A proposal, not a change** (owner 10-28 21:40: "Thematic 1st, winnowing 2nd"; 21:49: "submaps should have only 1-3 unique cards"). Every map 0-24 and every side map in road order: its theme (biome, story, field effect, the skills its fights bring), the cards unique to it by theme (one home a card; a card that fits several maps is noted), 3-5 carried cards, the cut with each card's destination (another map, pack only, no home yet), and the mix (high-cost, generator and plain shares, average cost, Stone / Metal). Main maps 8 unique + 3 carried; side maps 1-3 unique by the delve / challenges call (5 marked "ask owner"). Totals: list entries 613 -> 395; 229 cards with a unique home (108 skirmish rewards); 341 pack cards of Packs 1-4 become pack only; 94 creatures stay with no home. `docs/balance/theme1-proposal-2026-10-28.md` / `.json`, built by `tools/theme1_proposal_2026_10_28.py`; canonical files unchanged.
- **Hub, 🗺️ Map cards: a Current / Proposal toggle.** Proposal shows each map's current list beside its proposed unique and carried cards (added green, moved amber, cut red with where it goes), the mix and side-map chips, and a summary: totals, packs against the proposal, the side-map calls, the pack-only and no-home names. Files: `tools/hub/mapcards_data.py`, `mapcards_tab.js` / `.css`.
- Owner call THEME1-1 (`tools/theme1_decisions_2026_10_28.py`).

## 2026-10-28 release 10-28a (batch: ENG11, VIS4, ENG12, VIS5, CONTENT4, BAL6, HUB8, COOP2, HUB9, BAL7, RELFIX2, plus HUB7 / FIN1 / FIN2 held from 10-27)
- Rules: Coffee N; dark maps count as night; Scorching by day; Ambush fires at once; Shock priced by its numbers; Nocturnal / Diurnal priced by uptime; a woken unit loses its round; Frigid set as a map field; Give Shield / Bulwark at Shield 0.8.
- Cards: 69 re-balanced by the contribution test (BAL7 M1), Nocturnal re-fits (ENG12), Shield re-fits (FIN2, BAL7).
- Road: K14 (non-map-unique cards at most 1 copy each, 6 in all; Map 0 and T-2..T-4 out), decks checked against every deck rule; 11 maps given a field effect; the Map reference decks rebuilt. No retune toward the curve (BAL7-3 is the owner's).
- Visuals: Rampart / Guardian block, Shield ripple and count-down, boss / elite nodes, map cards in the fight panel, faster avalanche, copy-cap tips, leader slam and Danger warning, trap pip and trap spring, fight controls that never squeeze, a full-height Codex.
- The Tidelock Vault rebuilt as a normal 2-player raid-style fight. The card editor works again; Bramble Armor reads Fortify.
- Hub: card contribution, the Map 0-24 heatmap with three references, clickable card names with rarity colours, the 🗺️ Map cards tab with oddities and the packs summary.
- Deploy: .vercelignore now ships only the live page's files (~87 MB a deploy, was ~706 MB).
- Checks (one final run): full unit tier (RELFIX2's run: no new failures against the known list except mk (passes alone), nv and ts-status-chips (both failing since 10-26)); ui_smoke 3 failures, the tutorial check (TUT-1, the owner's); flows 0 issues; card-matrix golden refreshed for the batch's card and rule changes (0 failures).

## 2026-10-28 (package RELFIX2: release triage of the 10-28 batch)
- **Road decks** (K14's swaps broke two older rules): five skirmishes had 8 different cards (5-7 is the rule): 1-1, 1-A-2, 2-A-3, 8-A-2, 0-B-3, each now drops one non-map card and gives its copy to one of the map's own cards. **23-5 Under the Walls** has its Siege Train boon back (9/16 Siege cards; K14 had moved the Mouse Sappers to the off-theme Badger Trench Digger): 2 Trebuchet Crew, the map's own Siege card. K14's rule still holds everywhere; `tools/bal7_k14_decks_2026_10_28.js check` also names a skirmish outside 5-7 cards and a challenge deck whose boon is off.
- **Offline raid**: a stand-in raider's fight left the cards it derived (`~dv`, `~evo`) in the shared card list, so the seeded raiders and the raid's pool changed between two reads; each simulated fight now has its own copy of the list (`bramblewood-ghosts.js`).
- Tests brought up to date with dated notes: `en3` (Bulwark 7.2), `en4` / `en6` (CHANGELOG windows), `en5` (COOP2 dropped one EN5 key), `bal2` / `bal3` (BAL7's re-fits), `content4` (CONTENT4-1 re-opened with options), `y-2026-10-18` (Sacrifice reads `dozing()`), `keywords-2026-10-14g` / `raid-row-parity` (G2 Fork: C and one side), `raid-ops` (the hub's ticket and rank stand-ins), `trench` (Core floor 10 after BAL7's cards, call RELFIX2-1).

## 2026-10-28 (package HUB9: the hub's 🗺️ Map cards tab; hub only, no game code)
- **Hub, 🗺️ Map cards** (owner 10-28 16:43: "Can the map cards also be included in the master-hub? We can note oddities in card selection, rarity oddities, or size of map cards oddities ... balancing this way may make our pack size and unique card total not match."). Every map and side map in road order, each with its card list (name opens the card detail, rarity in its colour, pack tier, role: new / carried / Base / reward / showcase / first-clear pack, fights of the map that play it), its new / carried / total against the proposed CONTENT4 L7 cap, and oddity chips: rarity (not revealed yet, above the map's cap, a big jump from the map before), size (over the cap, far from its neighbours, too few new cards), selection (first obtainable after this map, no pack or other source, on 4+ lists, possible theme misfit, never played in a fight of the map). Filters: all / with oddities / rarity / size / selection, main / side, search. A **Packs against the map lists** box: per pack the cards in it, how many sit on a list of its maps, on a list elsewhere, on no list (named), and the unique totals (obtainable, map-listed), plus what the proposed trim would leave. Files: `tools/hub/mapcards_tab.js` / `.css`, `mapcards_data.py` (reads `canonical/map-pools.json`, `cards.json`, `card-obtain-maps.json`, `unit-themes.json`, `docs/balance/decks.json` and the CONTENT4 plan), `mapcards_caps.js` (the game's own `roadRarityCap`), `build_hub.py`.
## 2026-10-28 (package BAL7: woken units lose the round, 69 cards re-balanced, map-unique skirmish decks)
- **A unit woken by a hit loses the rest of that round** (ENG12-2): no swing, shot, counter, block or trigger; it acts from the next round (`dozing()` in `bramblewood-engine.js`, `_wokeRound`).
- **69 cards re-balanced by their measured contribution** (M1; 70,000 random fights before and after, `tools/balance/contribution.js`, reliability 0.96, a card's 95% interval about ±1.8 points). 68 too strong lose stats on their own shape (16-30% of 2A + H by the gap), 7 of them a skill level too (Fire Salamander 4/11 -> 3/7 Spitfire 1, Archerfish 4/9 -> 3/6 Acid Bolt 1, Spitting Cobra 6/10 -> 4/7 Twin Shot 1, Mire Rat, Ashbone Ghoul, Hedge Weasel, Tax Collector Teal); the Petrified Tree 0/37 -> 0/42. Their mean distance above their band fell from +10.6 to +5.0 points; 14 stay 8+ over (skill-driven) and 5 too-weak cards sit on their budget line (call BAL7-4). Table: `docs/balance/bal7-m1-compare-2026-10-28.json`; tool `tools/bal7_m1_rebalance_2026_10_28.js`.
- **Skirmish decks: cards not unique to the map, 1 copy each and 6 in all** (owner K14). 126 fights changed, 491 copies moved to the map's own pack, reward and showcase cards by theme (a side map counts its parent's; leaders, first-clear cards and deck sizes kept). Map 0 and the come-back fights T-2..T-4 left out (call BAL7-2). `tools/bal7_k14_decks_2026_10_28.js plan|apply|check`.
- **Map card lists: not capped** (CONTENT4-1 held back by the coordinator, 10-28: the owner decides after HUB9's view of pack sizes). Applied and then reverted in this package: `canonical/map-pools.json` and `card-obtain-maps.json` are as CONTENT4 left them, no PRO / BPRO run was made for it. The script that would apply it (lists only, sources kept, carried cards a PRO / BPRO deck holds kept) stays: `tools/bal7_pool_cap_2026_10_28.py`.
- **Give Shield and Bulwark priced from Shield = 0.8 Health** (FIN2-2): Give Shield 0.35 -> 0.40 a point, Bulwark 9 -> 7.2 (call BAL7-1); Ancient Sloth Titan 2/28 -> 2/31, Muskrat Lodgekeeper 1/5 -> 1/7.
- **The Tundra family's Frigid is the maps' `mapField`** (CONTENT4-4; Wolfsbane Tundra, the Pinewood Taiga, the Rimefire Caldera, 23 fights incl. 22-7 under its Scorched Ground): the game plays as before (the board's fallback stays), and `fightRules`, the skirmish editor's panel and every balance tool now see the frost; the fight panel lists Frigid on those fights.
- **Test Lab Card check** takes the basic-pack cards a player can hold by then (M2: `cardCheckPool`, `cardObtainMap <= upTo`; the Owl Nightwatch is in). **Stale `unattainable` cleared** from 225 cards with a placed source (M3); 91 basic-pack cards keep it because they are not placed (45 with no map, 46 in no map list; call BAL7-5).
- **The Map reference decks rebuilt** after M1 (`skirmish_pass.js decks --keep`): with the old ones (4-5 Dung Beetles and Archerfish from Map 10) the road read 61.5% -> 43.3%. The road (275 fights, 40 games): K14 alone 43.4% -> 43.3% (paired, old reference); final 61.7%, 57 of 256 curve fights green, 83 too easy, 116 too hard (call BAL7-3: no retune, owner "no retune yet"). Cave and Scorching fights measured, flagged, not tuned (ENG11-4). `docs/balance/bal7-road-2026-10-28.json`, `docs/balance/bal7-2026-10-28.md`.
- **The Pool reference, Maps 13-24** (M4): `deckopt.js --seed-ref` (every restart starts from the Map reference deck and its neighbours), 32,000 search games a map (was 16,000): its heatmap row (200 games a cell against each map's HUB7 optimum, `docs/balance/bal7-ref-vs-optimum-2026-10-28.json`, which the hub now reads) Maps 13-24 mean 18% -> 70%, level with the Map reference's 70% there (it trailed it by 20 points); Maps 0-24 27% -> 53%. Every row rose (Map reference 30% -> 61%, Reference-2 52% -> 75%) because M1 weakened cards the optimum decks hold: the optima need a re-run on the new cards. `docs/balance/ref/ref-pool.json` updated (Maps 13-24).
- PRO: 5 PRO / BPRO leaders re-derived after M1 (`tools/bal7_pro_leaders_2026_10_28.js`); no PRO / BPRO re-run needed. Tests: `tests/bal7-2026-10-28.js` (new); dated notes in `tests/content4` (the Tundra mapField, the filled calls), `en` (Bulwark 7.2), `eng10` and `eng12` (cards M1 moved again). Owner calls BAL7-1..5 (`tools/bal7_decisions_2026_10_28.py`).

## 2026-10-28 (package HUB8: card names open the card detail in the hub, rarity in colour)
- **Hub only, no game code** (owner L8: "let the card names be clickable, opening card detail ... Color the rarity by its rarity"). A card's name is now a real button (Enter / Space open it) in the Balance tab's card table, the Budget & stats tab (Cards view rows and the cards that flip), the Card table and its Contribution view (including the top-20 tables). It opens the 🎴 Cards tab's detail sheet where you are, with no tab switch. The detail gained an **Edit card** button (it had none): it goes to that card's row in Budget & stats > Cards, searched and open, where Attack and Health are edited. Rarity text wears its rarity colour everywhere (the Card table's light and dark colours); the Cards tab's pills and the detail too. Cards the Cards tab does not hold (MissingNo., 15 hidden cards in the Contribution view) stay plain text. Files: `tools/hub/hub_app.js`, `hub_app.css`, `balance_edit_tab.js`, `cardtable_tab.js`, `build_hub.py`.
## 2026-10-28 (package COOP2: the Tidelock Vault as a normal fight, like a raid; owner K12)
- **The group dungeon is the normal game now** (K12: "It should be a normal game, but like, raid"). Each floor is a normal fight on the normal battle board, built as a raid fight is: the same cards, hand, Lumber, pitch, Pass turn, lanes, rounds and field effects; the vault's floor (its deck and bramble, the Tidewarden on the last floor) is the enemy. The party has one bramble (the players' brambles added up, passives merged) and a row per player: player 1 (the host) the front row, player 2 the middle row; each leader opens in its row's centre; a unit holds its player's row.
- **Players by type, not by lobby** (K12: "not selectable depends on the multi-dungeon type"): the vault is a 2-player type (`DUNGEONS.hollow.players`, call COOP2-1). An empty seat at Start is a CPU ally; Solo is you and a CPU ally.
- **Allied slots, synced plays, the race rule** (K12): you may play into your ally's empty slots too. Every play, pitch and pass is a claim to the room's host, which lands the claims of one moment (120 ms) lower player index first and numbers them; every page applies them in that order, so your play shows on your friend's screen as you playing that card (the ally's hand fan, the flight, the name tag) and the slot is taken. Of two claims on one slot, player 1's lands and player 2's card goes back to its hand with a note naming who took it. The round starts when everyone here has played or passed; the CPU plays an away seat. Each round carries the host's table hash; a client out of step catches up from the act log (also how a returning player rejoins, and how two hosts after a cut-off settle: the longer log keeps the room).
- **Removed** (AR3's custom game): the overlay board and its hand, planning together on a 30 / 60 s timer, the shared centre column and its lock order, cave-ins, the cursed centre, the marked column, the 4-seat lobby (C / D / B seats, the "use all four seats" and casual options, add / remove CPU), the floor chests and the once-a-day pick of three. Kept: the lobby (Create, Join by code, Solo, invites), FIN1's names, the Map 16 spot, the Arena's Co-op pane, the Energy price, the transports.
- **Rewards as a raid fight** (call COOP2-6): each floor's rank on the shared bramble (the rank emblem), the bramble damage x 50 or the overwhelm figure, x the rank, paid at the raid's rates; a card from the vault's own cards at the raid's odds; an egg roll on a win.
- Server: no change needed (the live coop_rooms row seats a host and a guest; the 4-player SQL applied 10-24 stays usable). Cards that need a target the claim can't carry yet (equipment, hazards, evolutes, Parasites, prayer offerings) are refused with a note (COOP2-3).
- Texts: 29 new keys in 12 packs (`tools/i18n_2026_10_28_coop2.py`, which also drops the 53 AR3 keys nothing reads). Owner calls COOP2-1 to COOP2-7 (`tools/coop2_decisions_2026_10_28.py`). Tests: `tests/coop2-2026-10-28.js` (new), `tests/e2e/coop2_2026_10_28.py` (new: two clients in one page, the race, page vs headless in step, a floor won, solo; shots in `docs/screens/COOP2/`); rewritten with dated notes: `tests/coop-dungeon-2026-10-23.js`, `tests/coop-lobby-2026-10-23.js`, `tests/e2e/coop_dungeon_2026_10_23.py` (two real pages over the relay); a dated line in `tests/en5-2026-10-24.js`.

## 2026-10-28 (package CONTENT4: a field effect on every map, the map card pool cap proposed)
- **Every map has a field effect now, but one** (owner L2: "Ice Hollow strangely has no field effect ... It should be a rare thing for a map not to have a field effect"). Eleven maps had none shared by their fights and get one from the existing rules, on every fight: Thistlewood Undergrowth, Clovermead Thunderstorm, the Morel Hollow Spore Cloud, the Glimmer Depths Mirage, the Briar Maze Grasping Briars, the Canopy High Canopy, the Ice Hollow Slippery ice, Basalt Foundry Ashy, Volcano Lair Sulphur Fumes, the Goldfeather Siege and Goldfeather Keep Arrow Slits. The Quiet Summit (Map 21) stays the one vanilla map of Maps 20-40. A map's `mapField` in `CONQUEST_MAPS`; `fightRules` puts it on each fight unless the fight sets that rule. Measured on the road measure (40 games a fight), no deck retuned: `docs/balance/content4-2026-10-28.md`.
- **Map card pools: the cap is a proposal, not applied** (L7). Capping the pools at about 7 new and 3-5 carried cards would leave 187 cards in no pool (out of the packs) and break the PRO / BPRO decks; the plan, the per-map table and the script wait for the owner (CONTENT4-1).
- Owner calls CONTENT4-1 to CONTENT4-5 in `docs/decisions.json`.

## 2026-10-28 (package VIS5: the leader's slam, the Danger warning, the trap's spring, the fight's controls, the Codex's height)
- **A leader joining the fight is a moment** (owner L3: "not ... iconic enough"). A band of gold (crimson for theirs) opens across the field, the leader's own card is slammed down from 2.8x with a ring rolling out and a field shake, and the name banner snaps in from the side ("Name joins the fight!", still one sentence for the translator), under a thud and a chord (`SoundKit.leaderSlam`). 1.4 s whole (was 1.92 s). FX Low and reduced motion: the card and banner fade in and out, nothing moves; FX None: the banner alone. `vis5LeaderSlam`, `LEADER_CALLOUT_MS`.
- **Danger is a warning** (L3). The field's edges flare red and pulse twice, a red light sweeps across, and a hazard-striped DANGER plate (two ⚠️, the card's name and rarity) slams in, with two siren pulses (`SoundKit.dangerSting`). 1.5 s (was 3 s). Calm forms as above. `vis5DangerPlate`. New text `ui.vis5-danger` in 12 languages.
- **A laid trap keeps its pip** (L4). The engine settles a turn at once, so when the CPU's card stepped on the trap the engine list was already empty and the pip (drawn from it) was gone as soon as the drop ended. The replay now arms the pip on `hazardSet` and removes it on `hazardSprung` (`vis5HazardMap`, `m.vis5Hz`), so it stays on the slot (and on the card that lands on it) until the trap springs.
- **The trap springs with a jolt** (L4). The card played onto it jumps (about 38 px), lands, wobbles into a dizzy tilt (10 deg, settling), three dizzy stars circle its head, and its damage number flies out; a card still in flight is waited for (it used to get nothing). Reduced motion / FX None: a flash and the number. Effects Lab: `tools/effects-lab/manifest/vis5.js` (sk-trap-snap J, castle-enemy-leader-banner C and D, castle-danger B).
- **The fight's top-right controls never squeeze** (L6; Wolfsbane Tundra's four Environment cards left buttons 17 to 22 px tall under the cards). `fitTopRowControls` now has three stages, measured with every part at its natural width: words, icons, then speed, log, settings and a **⋯ menu** (full screen, Forfeit, Auto-play, the admin tools and Quit live in it; its items click the real buttons); if even four buttons do not fit beside the cards they take their own line. Icon buttons are one size. Checked at 390, 768, 1366 and 1920 on Wolfsbane 17-5 and the most crowded fights (22-8, seven Environment cards; 20-10). New text `ui.vis5-more-controls`.
- **The Codex album keeps its full height** (L12). Empty slots were 1 px high, so a search or a last page with a few cards shrank the book; an empty slot now has a sleeve's proportions (`codexSleeveAR`).
- Tests: `tests/e2e/vis5_2026_10_28.py` (new); `tests/bp-2026-10-19.js` updated (the callout is 1.4 s). Texts: `tools/i18n_2026_10_28_vis5.py`. Owner calls: VIS5-1, VIS5-2 (`tools/vis5_decisions_2026_10_28.py`).

## 2026-10-28 (package ENG12: Ambush at once, no swing while asleep, Shock and the time of day re-priced)
- **Ambush strikes the moment a unit comes in** (owner L1: "Currently, it waits till you play a card."). Ambush / Sentry looked again only when the next card landed, so a unit that walked into the watch at the round's start (Restless, the wind, a reserve stepping up, a field's push) was struck only once someone played a card. Now they also look as the round's start ends, after a spell and after a pitch (`roundStart` wraps `roundStartInner` + `watchScan`). A card played into the slot is struck as before.
- **A sleeping unit never swings** (owner L10: an Owl Nightwatch with zZ1 that struck). The engine's swing order already skipped Asleep units (ENG9 G4): 400 Spore Cloud fights of Stealth / Flying / Nocturnal decks (14,935 hits checked) found no swing while Asleep, and 400 with every card (28,756 hits) found only Ambush, Banana, Boomerang-return and Explode hits. What the screenshot shows: a hit **wakes** a sleeper (Sleep's rule), and the woken unit may swing that round, but the replay kept its 💤 badge from the round's start, so it looked asleep as it struck. The badge now clears on the wake (`w2SkillVfx`, statusEnd asleep). Two real paths were closed: an **Asleep Ambush unit** no longer strikes, and an **Asleep Banana unit** no longer eats or throws (nor Stunned, Frozen or stone; Ambush not while Chained either). Left as is: a Boomerang's return (the throw is already in the air) and an Explode fuse.
- **Shock re-priced by the 4-round rule** (owner L5: "Shock is too strong."). The rule is unchanged (a Shocked unit takes 1.5x from every source); the price now follows the card's own chance, rounds and Attack (it was a flat 0.93): 0.67 x 0.5 x [Shocked rounds x (Attack + 1.05) + 4 x 0.75p x 0.5 x 1.05]. Shock 40%/1 at Attack 1: 0.93 → 0.83 (Voltaic Eel); 30%/1 at Attack 3: 0.93 → 1.07 (Abyss Lantern Squid); 100%/2 at Attack 3: 4.09. **Shock Bolt N**: Arrow N's price + its Shock (Shock Bolt 2: 6 → 7.98, Electric Catfish).
- **Nocturnal / Diurnal / Crepuscular priced by their uptime** (owner L11 on the editor's Nocturnal +4/+0: "how can this be 2.5?"; each was a fixed 1 or 3 whatever its numbers). Now uptime x (2 x Attack + Health) of the bonus: Nocturnal 0.53 (night + Twilight, the dark places count as night since ENG11), Diurnal 0.38 (day + Twilight, clouds and ash at half), Crepuscular 0.99 (day + night + 2 x Twilight); Nocturnal also pays Darksight's 3 x 0.1 for its dark-sight. Their braces use the same shares (were 0.4). Measured over every conquest fight's rules: `tools/eng12_uptime_2026_10_28.js`, `docs/balance/eng12-uptime-2026-10-28.json`. Nocturnal 4: 1 → 4.54; plain Nocturnal 1 → 1.36; Diurnal 1 → 0.76; Crepuscular 1 → 1.98.
- **Cards re-fitted** (the smallest cut that holds both caps, shape kept): Owl Nightwatch 1/8 → 1/6 (5/6 by night), Weredog 2/14 → 2/7 (7/13 by night), Night Watchman 1/4 → 1/3, Great Horned Owl 2/15 → 2/14, Raccoon Bandit 4/8 → 4/7, Vampire Bat 2/6 → 2/5, Kinkajou Lurker 5/10 → 5/9, Sunspire Choirmother 3/5 → 3/4, Electric Catfish 2/9 → 2/8. Diurnal and Crepuscular cards got cheaper by less than a stat point and keep their stats. The Voltaic Eel was over cap 2 before this package (its Chain Lightning) and has no legal line; left as it was.
- Prices in `bramblewood-budget.js` (`zeitS`, `shockS`, `shockBoltShockS`), wired in `tools/skill_costs.js`; `canonical/skill-costs.json` entries carry `logic`. Texts: 2 keys in 12 packs (`tools/i18n_2026_10_28_eng12.py`): the Codex notes for Ambush and Banana. Test: `tests/eng12-2026-10-28.js`.

## 2026-10-27 (package VIS4: the Rampart block you can see, a cleaner Shield hit, the map's cards on the fight panel, cap tips)
- **Rampart's block plays visibly in a real fight** (owner K4: "Rampart animation as described not done"). VIS3's step and aura did fire, but a beat early: the 'rampart' event comes just before the hit it shares and took the generic 150 ms beat, so the unit was heading home as the blow landed; the step was at most 38 px and the aura one thin ring under the hit's own effects. Now the rampart (and Fortify) event takes no beat of its own, the unit steps up to 45% of a card toward its bramble and holds through the blow, shakes harder, flashes, and two gold rings grow out of it (the Guardian's step-in uses the same pulse). Checked on recorded frames of a real round (`tests/e2e/vis4_2026_10_27.py`).
- **The Shield's hit is cleaner** (K7): the VIS3 rectangle lights up and ripples out (no ring, hex chips or white zig-zag cracks); a break falls apart into glass panes. It lands with the blow (the soak event takes no beat either). The blue number counts down, and a broken Shield counts to 0, holds, then fades (it used to vanish).
- **The boss node's teeth** (K1: "looks like meat and ribs"): shorter, thinner, closer to the node and ember red; the crest's ring is red.
- **The fight panel lists the map's cards** (K8): the map's pool as small cards (zoom on hover / tap); never-seen cards are the ❓ back, cards of rarities you have not reached are only counted (🔒 +N); an admin sees all.
- **Ibex Rockcaller's avalanche** (K9): the wait between its hits is 70% shorter.
- **Copy-cap tips** (K16): the first time a deck card reaches its cap (5/5) a one-line tip says so; a rarer card's lower cap (e.g. 3/3) has its own tip; each shows once.
- Texts: 4 keys in 12 packs (`tools/i18n_2026_10_27_vis4.py`). Effects lab: `manifest/vis4.js` (variants I). Shots and frame sheets: `docs/screens/VIS4/`. `tests/e2e/vis3_2026_10_26.py` updated (dated note) for the Shield's new look and count-down.

## 2026-10-27 (package ENG11: Coffee N, the Vampire Bat in the caves, Scorching by day)
- **Coffee N is a new skill** (owner K2: "Double Actions every N turns. Stunned after."): every Nth round the unit acts (waiting, Stunned, Frozen or asleep rounds don't count) it acts twice: its shots go twice and it swings once more; the next round it is Stunned. It replaces the old Coffee (Wait −N on play, a nap later; no longer a one-off). Priced 1.5 / N by the 4-round rule (`canonical/skill-costs.json`: a cycle holds as many actions as without it, so it is tempo). In the editor (default 2), the Codex, card text, log ("is wired on coffee") and float "☕ ×2". Its cards keep their stats (re-fit by the formula, both lines hold; `tools/eng11_coffee_refit_2026_10_27.js`, `docs/balance/eng11-coffee-refit-2026-10-27.json`): **Buzzed Chipmunk** (Map 5, Coffee 2, 3/14) and **Honeyjoe Brewer** (Hummingbird faction, Coffee 1, 1/4).
- **The Vampire Bat sees in the caves** (owner K6): the caves have no day or night, so Nocturnal units never had their night there, and the cave's Darkness made them miss 1 in 4 like any unit without Darksight. Now a fight with its own darkness is night for Nocturnal / Diurnal / Crepuscular (`zeitPhase`): Nocturnal units get their night bonus and don't miss in the dark; Diurnal units get no day bonus and stay dark-blind. Dark maps: Map 8 Caves & Alcoves, 2-B Smugglers' Grotto, 7-A the Mycelium Deep (Darkness), 10-A the Sunken Depths (Pitch Black). The phase pill, dawn, moon, Night-blind and Sun-shy are unchanged. The Codex says so on Nocturnal, Diurnal and the Darkness entry.
- **Scorching burns only by day** (owner K10): Day and Twilight rounds; at night it rests; where there is no day or night it burns every round. The 18 Scorching fights (14-5, 14-7, 18-7, 18-A, 11-UC) are all on day / night maps. Field texts in 12 languages.
- Texts: 9 keys in 12 packs (`tools/i18n_2026_10_27_eng11.py`). Owner calls ENG11-1..4 in `docs/decisions.json`. Golden diffs expected wherever a Coffee card, a Nocturnal / Diurnal card in a dark fight, or a Scorching fight is played (not accepted here: the batch's release).
- Test: `tests/eng11-2026-10-27.js`; `tests/skills-1013.js` and `tests/keywords-2026-10-15c.js` updated (dated notes) for the old Coffee.
## 2026-10-27 (package BAL6: card contribution, the Pool reference)
- **Hub, 🗃️ Card table → 🏅 Contribution** (K5, owner: "show the general 'contribution' of each card with our myriad testing ... maybe test w 30 hp brambles w random effects"): each card's contribution to its deck's win rate over 135,000 random CPU-vs-CPU fights (random legal 20-card decks from all 767 playable cards, any source; 30-Health brambles, a field drawn from the maps' 410 road fights, Smart CPU both sides). Sortable, filterable, with the top 20 too strong and too weak for their rarity band flagged, plus owner-flagged cards. Split-half reliability 0.98; a card's 95% interval is about ±1.3 points. Owl Nightwatch (owner-flagged 10-28 09:48): +3.9 points, rank 166 of 767, 47th of 324 Commons (+5.9 over the Common median, z 9.3); +11.0 under night fields, -6.4 in plain day. Its Nocturnal 4 is priced like Nocturnal 1 (`canonical/skill-costs.json` nocturnal: scale "fixed", value 1): an owner call for the next balance package.
- New `tools/balance/contribution.js` (`--check`, `--quick`, `--analyze`); data `docs/balance/contribution-2026-10-27.json` / `.md` (re-run 10-28 over every playable card: the first run had left out the 92 source-"unsorted" cards). No card changed. The in-game Test Lab's 📊 Card check never tests basic-pack cards (`cardCheckPool` in `arena_app.js` takes Base, starter, map-reward and faction cards only), which is why the Owl never showed there; not changed here.
- **Pool reference (`ref-pool`)** (K17, owner: "make the best deck we can given the deck unlocks and random 5 common cards unlocked every map (from packs)"): per Map 0-24 the deck optimizer's best deck from what a player holds arriving there (starter, earlier maps' first-clear cards, faction rewards, 5 random pack Commons a map; seeded). `tools/opt/ref_pool.js` (pools, collect, report), `deckopt.js --mode ref-pool`; `--ref ref-pool` works in `pro_ease.js`, `ref_vs_optimum.js` and `skirmish_pass.js measure`. A per-map set: the tools play it, the game does not deal it yet (`REF_DECK_SETS` / `arena_app.js` unchanged).
- Hub, 🧬 Deck optimizer heatmap: the Pool reference is a third row (200 games a cell, `docs/balance/bal6-ref-vs-optimum-2026-10-27.json`; the Map reference and Reference-2 rows re-measured, identical to HUB7's). Means: Map reference 31%, Reference-2 52%, Pool reference 27%. The Pool reference beats the Map reference on Maps 0-2 (90 / 37 / 32 vs 42 / 1 / 1) but trails it from Map 13: with pools of 175-275 cards the optimizer's 16,000-game search does not converge (decks of 1-copy singles). Summary: `docs/balance/ref-pool-2026-10-27.md`.

## 2026-10-27 release 10-27a (batch: HUB7, FIN1, FIN2)
- The card editor works again (ENG9's Render note had added an unlabelled skill that crashed the skill picker; a plain Save also no longer drops trigger fields, Marsh Wisp's exile, On Ready Gold and other row-less effects). Render is back in the Codex.
- Bramble Armor reads Fortify. Shield counts 0.8 Health in the budget: Tide Pool Crab 1/2 -> 1/3, Conch Crawler 1/1 -> 2/2.
- The Tidelock Vault's floors and boss: The Dripping Roost, The Sunken Galleries, The Brine Pools, The Tidewarden's Hall, The Tidewarden. Tokens on the board get a pale wash.
- Hub: the Maps 0-24 heatmap (each reference deck against each map's optimum, 200 games a cell; the optimum re-run for every map on this batch).
- Owner 10-26 23:33: the open decisions filled by Claude (RES4, CONTENT3, AI3, VIS3, FIN2); only S3, A1, A2 wait for the owner.
- Checks (one final run): full unit tier against 10-24e's list: new failures autobattle (speed) and nv (this 2-core machine) and ts-status-chips-2026-10-19 (its browser part throws on every release back to 10-26a; it was masked by the runner's cache; logged, not from this batch). ui_smoke 3 failures, the tutorial check (TUT-1, the owner's). flows 0 issues. card-matrix 0 failures; 107 golden diffs, all duels of the re-fit Tide Pool Crab / Conch Crawler, accepted.

## 2026-10-26 (package FIN2: the card editor works again, Bramble Armor is Fortify, Shield at 0.8 Health)
- **The admin card editor opens and saves again** (FIN2-b, owner: "The card edit - doesn't work anymore"). ENG9 patched Render's Codex note onto the passive list, where Render isn't, so a label-less stub joined the skill list; the editor's skill picker sorts by label and threw on open (every card with a skill row), and the stub also hid Render from the Codex. The note now sits on Render itself and a patch with no label can't add a stub. Server side was fine (RLS and columns unchanged, read-only check). A plain Save also stopped dropping what the form can't show: a trigger's When Ready / once / other fields while its On and Do are unchanged (Scraper of Skies, Nest, Sea Cucumber, Mother Carrier ...), an action the list lacks (Marsh Wisp's exileSelf used to turn into Arrow), and effects with no "+ Add Skill" row (On Ready Gold, Scar, Grit, Devour, Beware ...).
- **Bramble Armor is called Fortify** (FIN2-a; engine key `brambleArmor` kept): card text, Codex, editor, log ("{name} fortifies its bramble: the hit is 1 less.") and the Breach / bramble-shot notes, in all 12 languages (`tools/i18n_2026_10_26_fin2.py`). Each language's Fortify is a different word from Fortification's (SK2, builds a Palisade).
- **Shield is priced at 0.8 Health** (FIN2-c): a unit's own Shield N counts as 0.8 x N Health in both caps' stat terms (`bramblewood-budget.js` shieldHealthOf, `budget.shieldPerHealth` in `canonical/skill-costs.json`; its skill price is 0, was 1 + floor(N/2) in S, which cap 2 squared). A Shield in braces counts the same way; Give Shield N and Bulwark keep their prices (call FIN2-2). Re-fit by the formula (`tools/fin2_shield_refit_2026_10_26.js`, `docs/balance/fin2-shield-refit-2026-10-26.json`): **Tide Pool Crab 1/2 -> 1/3** (the smallest step up; win rate 28% -> 30% at 400 games, Common band 35-60%; call FIN2-1 offers Shield 4, 47%), **Conch Crawler 1/1 -> 2/2** (was over its budget; 59%), Armadillo Guard stays 3/8. Skirmish decks unchanged. The editor's budget lines show the Shield's share as "(H + 2.4💠)".
- Test: `tests/fin2-2026-10-26.js` (the editor opens on every card, a Save as a cloud admin with Supabase stubbed, the kept fields, Render in the Codex, Fortify in 12 packs, the Shield price and the re-fit).

## 2026-10-26 (package FIN1: RES4-3 the Tidelock Vault's names, VIS3-1 the token wash)
- **The Tidelock Vault's floors and boss are aqua too** (RES4-3, ids unchanged): the Bat Roost is **The Dripping Roost**, the Mole Galleries **The Sunken Galleries**, the Salamander Pools **The Brine Pools**, the Matriarch's Hall **The Tidewarden's Hall**, and the Hollow Matriarch **The Tidewarden**. The boss's column warning, the "out of rounds" line ("The tide came back"), the lobby line and the cleared line say the vault too. In all 12 languages (`tools/i18n_2026_10_26_fin1.py`).
- **Board tokens get a pale wash** (VIS3-1, no ribbon): Bloom copies, Undead units back as tokens and every other token keep the dashed edge and now carry a pale, cool veil over their art (a light film in the light theme, a soft grey-blue one in the dark theme).
## 2026-10-27 (package HUB7: Map 0-24 difficulty heatmap)
- **Hub, 🧬 Deck optimizer summary**: a heatmap at the top, one row per reference deck (map reference, Reference-2, Reference-3 pending), one column per Map 0-24 plus the mean. Each cell is the reference's win rate against that map's strongest optimizer deck (red = hard, green = easy, steps of the DF-1b tolerance widths around 50%). Hover or tap a cell for its games, wins and the optimum's cards. The table scrolls inside its box on phones.
- New `tools/opt/ref_vs_optimum.js` (measurement only, plays as `pro_ease.js` does). Data: `docs/balance/hub7-ref-vs-optimum-2026-10-27.json` / `.md`, 200 games a pairing. Optimizer re-run on the current engine for Maps 0-15 and 21-24 (tag `2026-10-27-hub7-maptrue`); Maps 16-20 reuse the 10-25 PRO3 optimum. `canonical/pro-skirmishes.json` unchanged.

## 2026-10-26 release 10-26e (batch: RES4)
- Trail Mix Trek: the monthly pass (Stickers from notices, the first win, weekly quests and three weekly challenges; 30 tiers, a free lane of 6 packs and resources, premium shown locked); level packs only at 5 / 10 / 15 / 20 / 25. Forge tabs open on Maps 11-34. The first group dungeon is The Tidelock Vault.
- Owner 10-26 14:14 recorded (TUT-1 his; live rows he edited stay unless re-balanced; ENG10 recommendations).
- Checks (one final run, owner 14:14): full unit tier against 10-24e's list: new failures only autobattle (speed) and nv-2026-10-19, both failing the same way on 10-25b on this 2-core machine; ui_smoke 3 failures, all the tutorial check (53%, TUT-1, the owner's); flows 0 issues; card-matrix 0 failures, 0 golden diffs.

## 2026-10-26 (package RES4: PROP1-2 the monthly pass, RES3-3 Forge tabs, RES3-4 the group dungeon's name)
- **Trail Mix Trek** (PROP1-2, renamed for the owner's "trail mix-y and camper vanny"; call RES4-1 has the other names): a monthly pass on its own page, from a Home note and the map's 🚐. A camper van drives a road of 30 tiers (150 **Stickers** 🏷️ each); the free lane is the proposal's table (6 packs: your pack tier at 5 / 15 / 25, faction at 10 / 20, a Tidemire Chest of 5 at 30; about 900 Maple Leaves and 900 Dust, 2 Energy capsules, a Raid Ticket, kit items, Kibble, Metal, the month's title "Trail Trekker of <month>"); past tier 30 a Trail Chest every 600, 3 a month. The premium lane is a locked "Coming later" placeholder with no price. Stickers: notices D-B 10, A 20, S 40, SS 60, SSS 100; the day's tiers at 3 / 5 / 6 notices claimed (20 / 10 / 10; call RES4-4); first win of the day 10; weekly tiers 100 / 60 / 40; three Trail challenges a week (50 each, seeded by the week) with progress bars. Resets on the 1st, paying tiers reached and not claimed; days left on the page and the note. Four new quest counters: challengeClears, bossWins, forgeLevels, decksWon.
- **Level track** (PROP1-2): single cards to Level 5, a pack only at 5, 10, 15, 20, 25 (faction at 5 / 15 / 25, your pack tier at 10 / 20; the rhythm continues), 100 Maple Leaves + 50 Dust on the other levels (was a pack a level).
- **Forge tabs** (RES3-3, "spread from Map 0 to 40"; call RES4-2): Upgrade 11, Upgrades 13, Fuse 14, Raid 15, Blacksmith 18, Finish 24, Reinforce 28 (a locked "?" from 11), Socket 34. Nothing before Map 11 (the Forge's own map, B7).
- **The Tidelock Vault** (RES3-4, aqua-themed; call RES4-3): the first group dungeon's name (was The Warren Heist).
- Texts in 12 packs (`tools/i18n_2026_10_26_res4.py`); owner calls RES4-1..4 (`tools/res4_decisions_2026_10_26.py`). Tests: `tests/res4-2026-10-26.js` (new), `tests/e2e/res4_2026_10_26.py` (new, shots in `docs/screens/RES4/`); updated with dated notes: `tests/res3-2026-10-26.js` (B1 rows, G18 maps, B3 name), `tests/e2e/res3_2026_10_26.py` (Forge tabs at Map 11, B3 name).

## 2026-10-26 release 10-26d (batch: HUB6, ENG10)
- Rules: Armor stops arrows and spits and is priced 1.68 x N^1.43 (21 armoured cards re-fitted, the two held cards cut, the Caldera Wyrm to Armor 1); the spits read Cinder / Acid / Venom / Ice / Spark; Charge recharges, Reload costs more; On Ready fires on the turn a Wait-0 unit is played; Grasping Briars (Tangled) on 12-4 and 12-7; Hardy N with Sunder and Dismantle; Gorge (was Fester); the six threshold skills on their cards; Flora phylum with Tree / Fruit / Flower / Vine / Mushroom; PvP strangers levelled to your BR; late side maps' PRO fights at their opening map's enemy level.
- Hub: the Deck optimizer summary (three reference decks with their win rates, What is Elo?, the per-map table).
- Checks: full unit tier against 10-24e's list: new failures autobattle (speed) and nv (both fail on 10-25b on this machine), bal2 (an ENG10 re-fit and the Caldera Wyrm's budget: fixed) and coop-dungeon (the boss's derived def from On Ready at play: test updated); smoke after the fixes: 6 passed, 1 failed (d-2026-10-19, known). flows 0 issues. ui_smoke: 3 failures, the tutorial check (53%, owner call TUT-1), unchanged from 10-26c. card-matrix golden refreshed for ENG10 (0 failures).

## 2026-10-26 package HUB6 (hub only)
- Hub, 🧬 Deck optimizer tab: a summary on top with the three reference decks (Map reference with a per-map picker, Reference-2 the Ant Deck, Reference-3 pending), their road and PRO / BPRO win rates with the source file named, a plain "What is Elo?" box with a win-rate / Elo table, and a sortable per-map table. Built by `tools/hub/deckopt_summary.py`. No game code.
## 2026-10-26 (package ENG10: the owner's 10-26 11:19 answers ENG9-3..10, PROP1-1, PROP1-3, PROP1-4, FIX3-4, PREF-3)
- **Rules:** the elemental spits read by their element alone, Cinder / Acid / Venom / Ice / Spark (Ember is a gem, Frost a skill; call ENG10-1) (ENG9-3). Charge recharges again (ENG9-4). Armor also stops arrows and spits; magic, Missiles and Fireballs still pass (ENG9-6). A Wait-0 unit's On Ready fires on the turn it is played (ENG9-7). **Grasping Briars**, a field rule: one random unit a side Tangled each round (not Flyers or Structures), on 12-4 Thornvine Arch and 12-7 the Briar Queen (ENG9-10).
- **Equipment (PROP1-1):** **Hardy N** lives on top of durability: a break takes a life and refills the durability, at 0 the piece is destroyed; gold rings above the pips, a 💍N badge, a crack float and log line. **Sunder** (On Hit, 50%) and **Dismantle** (On Play, 50%, the facing enemy's piece or a loose one); **Pulverise** takes one life for sure. Dragonscale Mail is Hardy 2.
- **Gorge (PROP1-3):** the Fester key reads Gorge: a hooked Parasite feeds again at round end at half its Attack. The Gangrenous Leech is a Parasite with Gorge (4/4 -> 3/3; call ENG10-5).
- **Threshold skills (PROP1-4):** Requiem 5, Dirge 3, Carnage 3, Muster 6, Beset 6, Throng 10 – {+2/+2}, priced by the measured uptime at their N (`bramblewood-budget.js` thrS: 3.2 / 2.8 / 2.5 / 2.9 / 1.8 / 3.8 at the defaults); in the editor, the Codex and the texts. Homes (call ENG10-4): Carrion Fly Swarm (Throng, Map 8), Dust Hyena (Carnage, 14), Wolf Pack Runner (Muster, 16), Wolfsbane Alpha (Dirge) and Ravenous Wolverine (Beset, for its Scarcity; 17), Cinder Skeleton (Requiem, 20).
- **Taxonomy (ENG9-5):** Flora is the phylum (Plant and Fungi); Tree, Fruit, Flower, Vine and Mushroom are its types and count as Flora. The Fungi cards are Mushroom; 11 Flora cards got Tree / Flower / Vine; icons in the filters (call ENG10-3 on the Elemental-species plants).
- **PvP and PRO:** a Collection PvP stranger fights at Level 1 + (your BR / its BR at Level 1 - 1) / 0.31, clamped 1-10 (FIX3-4, call ENG10-6). A side map that opens late fights its own PRO / BPRO decks at the road's enemy level of the map it opens on (PREF-3; the Old Bramble 4.67, the Pale Desert 4, Clovermead 2.71 ...).
- **Prices** (`tools/eng10_skill_costs_2026_10_26.py`): **Armor 1.68 x N^1.43** (Armor 5 = 10x Armor 1; measured by `tools/eng10_armor_hits_2026_10_26.js`, `docs/balance/eng10-armor-hits-2026-10-26.json`: Armor 2 cancels 63% of the landed hits, Armor 5 97%), Charge 1.2 -> 3, Reload -4 -> -6, Pulverise 1.6 -> 2.1, Gorge 2.8, Sunder 1.0, Dismantle 0.5; Hardy in `equipLifeMult`.
- **Re-fit** (`tools/eng10_cards_2026_10_26.js`, `docs/balance/eng10-refit-2026-10-26.json`; both ways, owner ENG9-9 "Cut to new armor formula"): raised Peak Condor 4/6 -> 4/7, Riptide Eel 8/5 -> 9/6, Barnacle Fortress 0/6 -> 0/10 (Armor 5 -> 3); cut Tide Pool Crab 1/4 -> 1/2, Hawthorn Shieldbug 2/13 -> 2/12, Electric Ray 4/10 -> 4/9, Termite Mound 0/15 -> 0/11, Old Shell 2/23 -> 2/19, Quillback Elder 6/6 -> 5/5, Sea Turtle Elder 5/10 -> 4/9, Testudo Tortoise 5/13 -> 4/12, Stone Turtle Warden 5/5 -> 4/4 (Armor 4 -> 3), Marshal Tuskwell 1/29 -> 1/26, Horseshoe Crab 2/11 -> 2/9 and 14 more by 1 Health; the six threshold cards and the leech as above.
- PRO data: 17-A-PRO-2 and 20-A-PRO-1 lead with their deck's showcase card again (Mangrove Manatee, Anaconda Coil): the re-fit Wolf Pack Runner is no longer it (the map rule). Wait-0 Rocket / Fireball / Meteor / Chilli of a played unit go off once, from the On Ready at play (no double fire).
- Texts in 12 packs (`tools/i18n_2026_10_26_eng10.py`); owner calls ENG10-1..6. Test: `tests/eng10-2026-10-26.js` (new); updated with dated notes: `tests/eng9-2026-10-26.js` (G23 at play, G24 recharging, the ENG9 price notes), `tests/keywords-2026-10-14d.js` and `tests/position-beam-2026-10-19.js` (Charge recharges), `tests/en-2026-10-23.js` (Armor 2 read from the table), `tests/en6-2026-10-24.js` (the Wolverine's Beset, the CHANGELOG window).
- Card matrix: 0 failures, 16,711 golden diffs (14,794 only the event order: a Wait-0 unit's Ready now comes at play; the rest from Armor on shots, the re-fit stats, Charge, Gorge and Ready kills before the first upkeep); not accepted.

## 2026-10-26 release 10-26c (batch: AI3 + VIS3, CONTENT3)
- CPU: Smart / Smartest score every card in every slot (Bloom room included); every level keeps a Lumber reserve (deck average cost - 1). Maps 0-20: Basic fights +0.6, Smart fights -1.8 points for a new player; no deck retuned.
- Visuals: the trap ring, the token look on Bloom / Undead copies, no unit Health bars (Shield is a blue number, a rectangle on hit), Rampart / Guardian block motion, boss and elite nodes with a boss intro and sting, centred pips.
- Content: the owner's 144 live card rows folded (8 cards changed, Phoenix Mushrooms added; the live clear waits for "apply it"); Sleepless Shrew before 7-5, swamp cures on 5-1 / 5-2, Otter anti-air (Mist-net Otter, Clap-net Trapper, Birdlime Dauber), Gale Swift and Static Fennec with a blinding Sandstorm on 18-4, Lumber and draw cards, the Mother Carrier (Platform), the Granite Ox Golem; Pulverise, Detonate N, Socket N, Tamper-proof, the equip-time badge, gem fusion; Hollow Oath-Keeper to Map 13; Lilypad Reach rain; the Tide on 5-A-2 and 10-A-2.
- Checks: full unit tier against 10-24e's list: new failures autobattle (speed) and nv (both fail the same way on 10-25b on this machine); eb, en3, n221 and pref updated for CONTENT3 (the two new waiting cards given owner-call homes; the missing PRO-ease pairings measured). flows 0 issues. ui_smoke: 3 failures, all the tutorial check (53% CPU-vs-CPU, rule 70%+), caused by the folded card edits the live site already plays; owner call TUT-1. card-matrix golden refreshed for the 14 new cards (0 failures).

## 2026-10-26 (package CONTENT3: OVR, G3, G5, C1-C6, E14-E18, OWN-Q5, BAL3-1)
- **New cards (14, on their formula line, emoji art until painted; prompts in `docs/art/content3-2026-10-26-briefs.md`):** the Sleepless Shrew (Common 3/9, **Wakeful**: never Asleep), 7-4's first-clear card before 7-5's Spore Cloud (G5); the Marsh-mallow Hare (Common 1/10, Cure 1) and the Sphagnum Vole (Common 3/10, Cure 2), the first-clear cards of 5-1 and 5-2 (C1); Otter faction bird-catchers, the Mist-net Otter (Common 2/10, Reach + Web 1), the Clap-net Trapper (Common 2/11, On Play: every enemy Flyer grounded) and the Birdlime Dauber (Uncommon 2/12, Reach + Strangle 1) (C2, C3); Storm cards, the Gale Swift (Common 1/4, Flying, Eyrie Heights) and the Static Fennec (Uncommon 3/9, Dry, the Glass Dunes) (C4); the Muskrat Reedgatherer (Stockpile 2, Sunken Hollow), the Peat-cutter Vole (On Ready +1 Lumber, Sable Swampmire), the Magpie Collector (On Death: draw 1, The Briar Maze) and the old Courier Pigeon placed (On Play: draw 1, The Long Grass, 2/2) (C6); the **Mother Carrier** (Heroic Hummingbird **Platform**, 0/25: each round a Laden Hummingbird with two arrows; Fletcher 1 = Arrow Master; awaiting a source) (E16); the **Granite Ox Golem** (Rare 3/17, Wait 4, Recoil 2: On Play stuns every unit but the enemy's last-played one; Ashen Spurn) (E17).
- **Rules (engine):** Wakeful; **Detonate N** (the target's Poison ticks N times at once, a counter each, animated in a row; was a cash-in) (E18); **Pulverise** (ignores Armor, breaks Armor, Magic Armor and equipment, double damage to Structures) (OWN-Q5); **Tamper-proof** equipment can't be stolen, **Equip Time N** shown as a top-right ⚔️ badge and set in the card editor (E15); the Platform type follows the Structure rules (E16); a Sandstorm counts as a Storm, and the **blinding Sandstorm** (`sandstorm: 'blind'`) makes every unit Blind but Dry / Keen Sense / Sonar units (C4).
- **Forge:** **Socket N** (N more gem sockets a copy; priced 0) and **gem fusion** in the Socket tab: two gems of one kind -> a Greater gem, twice the bonus, 30 Dust (E14).
- **Maps:** the Hollow Oath-Keeper moves to The Redwood Deep (Map 13); in Map 7's decks Truffle Piglets (and a Leafcutter Gardener or Dung Beetle for the copy caps) take its places; 7-5's showcase follows (G3). Lilypad Reach has constant Rain (C5). 5-A-2 and 10-A-2 have the Tide, so Rising Tide turns on: 64.5% and 69% at 200 games (targets 65, 70) (BAL3-1). 18-4 blows the blinding Sandstorm.
- **OVR, the owner's live card edits folded** (`tools/fold_server_overrides_2026_10_26.js`, read-only dump `docs/balance/server-overrides/card-overrides-dump-2026-10-26.json`): Earthworm 0/6, Silver Minnow 2/4, Duckling 1/5, Harvest Mouse 1/6, Otter Kit 2/5, Sea Turtle Elder 5/10 Armor 3 (no Undead), Soldier Ant without Formation, Green Dragon without Poison 3, and the new Phoenix Mushrooms (Epic, Fungi; id from `phoenix-mushrooms-u248`, CARD_ID_RENAMED). The map-nodes and tutorial rows are owner calls (OVR-1, OVR-2). Clear SQL proposed, **not applied**: `supabase/proposed/20261026_clear_folded_overrides_3.sql`.
- **Measured** (map reference, 40 games, `docs/balance/skirmish-pass-content3-{before,after,after3,bal3-200}.jsonl`): Lilypad Reach is much easier in the Rain (call CONTENT3-2); the Morel Hollow is much harder (7-2 85% -> 50%, 7-4 55% -> 35%, 7-5 65% -> 22.5%, 7-6 22.5% -> 12.5%), mostly from the folded Soldier Ant (in the reference deck) losing Formation (call OVR-3); 18-4 72.5% -> 75%. No deck was retuned (BAL4).
- **Prices** (`tools/content3_skill_costs_2026_10_26.py`, 4-round rule): Wakeful 0.5, Pulverise 1.6, Socket 0, Tamper-proof 0.1, Detonate 0.2 a tick (the Bogfire Newt held at 1/11 for the owner).
- Texts in 12 packs (`tools/i18n_2026_10_26_content3.py`); owner calls OVR-1..3, CONTENT3-1..6 in `docs/decisions.json`. PRO decks of Maps 2 and 11 refreshed (11-PRO-2 held the Oath-Keeper; Lilypad's field has the Rain). Tests: `tests/content3-2026-10-26.js` (new); `tests/h1-2026-10-24.js`, `tests/gi-2026-10-19.js`, `tests/eng9-2026-10-26.js`, `tests/lead-2026-10-23.js`, `tests/skills-sk2b-2026-10-19.js` updated with dated notes.

## 2026-10-26 (package AI3 + VIS3: A1, A2, V1-V5, G8)
- **CPU:** the Smart and Smartest CPUs plan their turn: every playable card in every slot is scored on the board after the play (the kill, the block, a death, a win this round, the room a Bloom needs or a Bloom unit would lose) and the best is played; Basic keeps its own pick (A1). Every CPU keeps a Lumber reserve of its deck's average cost - 1 and pitches only for it, for a high-value card within two pitches, or with a full hand; a cheap deck no longer pitches its cards away (A2). Measured on Maps 0-20 (`docs/balance/ai3-2026-10-26.md`): the Smart CPU about 2 points harder, the Basic CPU about 0.6 easier, the road about where it was; no deck retuned (calls AI3-1, AI3-2).
- **Board:** a trapped slot shows light-red drops falling into its centre round a circle (V1). Bloom copies and Undead tokens wear the token look (V2, call VIS3-1). No Health bar on units; a Shield (and Shell / Bolster's temporary Health) is a blue number above the Health, and its hit is a rectangle over the card (V3). Rampart units slide toward their bramble, shake with an aura as they take their share and slide back; Guardians pulse the same as they block; one that dies blocking dies there (V4). Every skill pip's glyph is centred (the turtle sat low) (G8).
- **Map:** boss nodes are bigger and dark in a ring of bone teeth with a skull crest; elites get a violet double ring and a star crest; a boss's opener is dark red with the skull frame, a red BOSS and a new sting, SoundKit.bossSting (V5).
- Tests: `tests/ai3-2026-10-26.js` (new); `tests/engine-parity-2026-10-18.js` and `tests/keywords-2026-10-14f.js` updated with dated notes (the smart CPU plans, the pitch needs a reason, the Shield's number); browser `tests/e2e/vis3_2026_10_26.py`; screens in `docs/screens/VIS3/`; Effects Lab `tools/effects-lab/manifest/vis3.js`. Card matrix: 0 failures, 98 golden diffs, all from the CPU's new play in the AI matches (not accepted).

## 2026-10-26 release 10-26b (batch: RES3, ENG9)
- Rewards and screens: Cards won fan apart and copies stack; eggs and babies are cards with a reveal; one banner for a new map; the emblem lands bottom right; XP plays on the first screen after a fight; the level reward track (singles to Level 5, then faction / Pack 1, Pack 2 from 15) and the Profile level bar; the Group Dungeon is "The Warren Heist" on Map 16; field-effect tooltips and "New!"; first-clear rewards full colour until won; bigger window, deck editor and x10 pack table; packs give 3 cards (Collector's 5) at the same price per card; Forge tabs open by map.
- Rules: Undead vs Revive N; Poison Barbs; status shots give counters only; elements are physical, only magic passes Armor; Spit renames; Fork L+C / C+R; units slept or stunned mid-round lose their swing; On Ready for Wait-0 units; one-shot skills leave the card; Chained adds up damage; Tangled 50%; Bound half damage and no moving; Daunt falls off on damage actions; Bloom only once Ready, a failed split gives +1/+1; Cleave carries Poison / Bleed; Quick units can Dive; Guardian / Rampart only when Ready; 6-round seasons; Fungi; Stockpile N; four cards re-fitted, two held.
- Checks: full unit tier, new failures only autobattle (speed) and nv-2026-10-19 (both fail the same way on 10-25b on this 2-core machine); ui_smoke 0 failures and flows 0 issues after the e2e test players were given their level rewards (RES3's packs had opened over the flows) and en7's e2e syntax fix; card-matrix 0 failures, 0 golden diffs (the golden already carried the ENG9 rules: the package reported 18039 diffs from Wait-0 On Ready events and the listed rule changes).

## 2026-10-26 (package ENG9: rules E1-E13, E19, G2, G4, G9, G19, G23-G25)
- **Units:** Undead (the old self-Revive) brings the unit back once as a token that leaves no card behind; Revive N is now the graveyard action (On Play: N random creature cards back as real cards; a Revive action in the trigger editor) (E1). Poison Barbs N: Thorns that give Poison (E2). A "– poison / – bleed" shot or action at a unit deals its N as counters and no damage (E2). Stockpile N: On Ready, +N Lumber, once; the Beaver Lumberjack has it (E13).
- **Damage:** Armor now also stops elemental swings (fire, frost, shock, poison, acid, water ...); only magic passes it, and Magic Armor stops magic only (E3). The physical "Bolts" read Ember / Acid / Venom / Frost / Spark Spit (keys unchanged; call ENG9-3).
- **Blocking:** a Guardian steps in for a counter-attack (Thorns still never redirects) (E4); Guardian and Rampart work only while the unit is Ready (E9).
- **Statuses:** Render's Daunt counters fall off one per damage action only (a swing, an Arrow, a damage skill) (E5). Bound (Strangle): the unit swings and shoots at half damage, can't move (Guardian, Rampart, Dive, Charge) and loses Flying's dodge (E19, OWN-Q1). Tangleweed lays Tangled: each swing, shot, action and trigger fails 1 in 2 (G25). A unit put to sleep, stunned, frozen or chained before its turn no longer swings that round (G4: the sleeping House Cat). Decay applies and takes its Attack (checked); Decay +12% in price.
- **Skills:** Bloom tests only once the unit is Ready; with no free slot the split fails (a reddish split on the board) and the unit gets +1/+1 (E6). Cleave's side hits carry Poison and Bleed (E7). A Quick unit can Dive and has no Quick while aloft (E8). Fork strikes up to 2 adjacent enemies (L+C or C+R, never L+R), the bramble only when L, C and R are empty; Trident and Pitchfork hit the bramble only when none of their lines holds an enemy (G2). Chained breaks once its damage adds up to N, has no lock glyph, and is priced as an N multiplier (G19). One-shot On Ready skills fire at the upkeep also for Wait-0 units and leave the card once spent; Charge goes off once and leaves the card (G23, G24). Seasons last 6 rounds (E12).
- **Codex and cards:** Stem and Chrysalis read "?" before Map 15, then the name with "?" for the effect until Map 20 (E10). The Wildpath perks say "Repair Bramble" (E11). Fungi is a type and a Codex kingdom beside Flora (Fungal Colossus, Puffball Bombardier); a joint cost sits side by side with no "/" (G9). Bloom's help lists examples.
- **Prices and re-fit** (4-round rule, `tools/eng9_skill_costs_2026_10_26.py`, `tools/eng9_cards_2026_10_26.js`): Undead 4.3, Revive 6.3 a card, Poison Barbs 1.6, Stockpile 0.9, Tangleweed 2 -> 1.4, Strangle 1 -> 0.8, Decay 1 -> 1.12, Armor 1.5 -> 1.56, Magic Armor 0.4 -> 0.1, Render 0.8 -> 1.1, Charge 3 -> 1.2, Guardian 1.06 -> 1, Rampart 0.25 -> 0.22, Counterattack 2 -> 1.9, Chained -3 -> 0 (x N). Raised: Electric Ray 4/9 -> 4/10, Weaver Bird 4/6 -> 4/7, Chained Binturong 4/9 -> 4/10, Grass Snake 2/9 -> 2/10; held (would drop): Tide Pool Crab, Hawthorn Shieldbug (`docs/balance/eng9-refit-2026-10-26.json`). Owner calls ENG9-1 to ENG9-10.
- Golden diffs (card matrix): expected from E3, E9, E19, G2, G4, G23 and G25; reviewed at release. Texts in 12 packs (`tools/i18n_2026_10_26_eng9.py`). Test: `tests/eng9-2026-10-26.js`.

## 2026-10-26 (package RES3: rewards and results R1-R3, R5-R9, B1, B3, G5, G6, G10, G12, G15, G16, G18)
- **Results:** Cards won are grouped: different cards stand apart with clear gaps, copies of one card stack with a small offset and ×N, and the column scrolls when it runs long (R1, G16). New cards seen use the same layout under them in the same column (R2). An egg found and a rescued baby are cards in the nest's own colours, with an "An egg!" / "A baby!" reveal (R3; the baby's type and icon still come from babyRewardInfo). Kibble's tip reads "For nurturing cards in the Nest". A new map is one banner with its art, name and "N fights", and its fights are no longer listed one by one (R5). The rank-reward ribbon sits on the card's top right (R7).
- **After a fight:** the rank emblem flies in from the left edge, spirals, and lands in the page's bottom-right corner (R6). An Arena win fills its XP bar on its own results. Every other win's XP plays on the first screen you reach afterwards: the map, Home, any page, or after a reload (R8).
- **Levels:** a level reward track (B1): Level 1 (after the tutorials) through Level 5 give single cards, Level 5 adds the first faction pack, then Pack 1 and faction packs alternate, and Pack 2 replaces Pack 1 from Level 15. It is one table, `RES3_LEVEL_TRACK`. Rewards earned before the Armoury wait with the held packs, and saves from before this start at their current level with no back pay. The Profile's level bar shows your level in its left quarter and the next six levels with their rewards on the right (R9).
- **Packs (G15):** every pack gives 3 cards and a Collector pack gives 5, at the same price per card as before. Tidemire Chest 120+10 → 72+6; Highcrest Case 250+30 → 94+11; Collector packs 300 / 720+60 / 1500+180 (decision RES3-2). The x10 opening table's packs are up to 150px wide (were 86px). The packs' summary stacks copies and scrolls (G16).
- **Map and fight panel:** the Group Dungeon's spot moves to Map 16 and is named "The Warren Heist" (B3). Every field pill in the fight preview uses the cream tooltip, and a field effect never seen before shows a "New!" that pops and fades, on the preview and the board (G5). First-clear rewards keep their colour until won, then grey out with a ✓; cards, items, packs and currencies all follow this (G6).
- **Screens:** a desktop window that isn't full screen grows the match to fill its height, up to ×1.45 (G10; a 1440×780 window goes from 124px to about 146px cards). The deck editor's deck cards are 72-104px (were 66px) and its card pool is a 112-150px grid, taller (was 90px) (G12). Forge tabs appear as their maps are reached: Upgrade and Fuse 11, Upgrades 12, Blacksmith and Raid 13, Finish 15, Reinforce 17, Socket 20. Reinforce shows early as a locked "?" (G18, decision RES3-3).
- Texts in 12 packs (`tools/i18n_2026_10_26_res3.py`). Tests: `tests/res3-2026-10-26.js`, browser `tests/e2e/res3_2026_10_26.py`. Screens in `docs/screens/RES3/`.

## 2026-10-26 release 10-26a (batch: PREF, DOCS1 + HUB5, PROP1, FIX3)
- Admin: X-REF fights on every PRO map and a "Play with the map's reference deck" switch (map reference or Reference-2, the owner's Ant Deck); the PRO-ease report (docs/balance/pro-ease-2026-10-25.md).
- Fixes: a fight opens when any linked fight is won (6-3 -> 6-6; 34 joins); map switching keeps the last map asked; round-end lag (worst frame 3.5 s -> 0.8 s in the test machine's 5-1 profile); token blinks; 1 XP on a loss; sign-up saves (unconfirmed email sign-ups are no longer treated as signed in); "View all"; a second click skips dialogue; baby icon; Train bar; x10 card detail; raid rank on the reward screen; Map 0 tooltips after Map 10; PvP auto-play for Admin and past Map 25.
- Hub: Card table (with the pack-art candidates), Curves, the Difficulty road check. Docs: project-state.md, evaluation-protocol.md, proposals-2026-10-26.md.
- Checks: full unit tier against 10-24e's list: new failures autobattle (speed; fails on this 2-core machine), nv-2026-10-19 (fails the same way on 10-25b here) and mk-2026-10-23 (passes alone, 38/38); six stale tests updated. ui_smoke 0 failures and flows 0 issues on a quiet machine (ui_smoke failed at varying steps three times while agents ran); card-matrix 0 failures, 0 golden diffs.

## 2026-10-26 (package PROP1: four design proposals; docs and a measurement tool only, no game code)
- **`docs/proposals-2026-10-26.md`**, the owner's 10-25 23:58 asks:
  1. **Equipment hardiness:** Lives (Hardy N, default 1) on top of EQ2's durability. A break takes a life. New skills Sunder (On Hit, 50%) and Dismantle (On Play, 50%); Pulverise breaks a life outright.
  2. **The Moon Trail:** a monthly, gameplay-locked battle pass built on the daily notices, daily and weekly tiers and weekly Trail challenges. It has 30 tiers, a free lane with 6 packs a month and a placeholder premium lane. Level packs move to every 5th level.
  3. **Three Fester reworks** around Parasites: Gorge, Brood-mother and Spreading.
  4. **Six threshold skills** at +2/+2: Requiem, Dirge, Carnage, Muster, Beset and Throng, priced by measured uptime.
- **`tools/prop1_threshold_uptime_2026_10_26.js`** (EN6's uptime method, 1,500 CPU fights) writes `docs/balance/prop1-threshold-uptime-2026-10-26.json`: shares of unit-rounds by deaths this fight and by units on each side. A unit lives 4.4 rounds on average.
- Decisions PROP1-1 .. PROP1-4 (YET) in `docs/decisions.json`.
## 2026-10-25 (package FIX3: bugs and small fixes F1-F6, G1, G7, G13, G14, G17, G20-G22, the round-end lag)
- **A win opens every fight it links to** (F1, owner #9). A fight now opens once ANY fight linked to it is won (it waited for all of them: on the live map edits 6-6 is linked from 6-5 and 6-3, so winning 6-3 drew a line to 6-6 that stayed shut). The skirmish editor's "Unlocked after" keeps "all of these are cleared" as an opt-in, drawn dotted. 34 two-branch joins on the road now open from either branch (decision FIX3-1). Every map is checked: each link opens its fight, every fight can be reached.
- **Fast map switching** (F2): each switch takes a load token; only the newest one draws, a switch back to the map on screen cancels the one in flight (it was ignored, so the earlier map came up), fades no longer stack, and a map's own timers (first-visit zoom and drop, the Spire scroll, the art zoom) stop once you leave it.
- **The round-end lag** (F3 + G26): profiled whole fights headless (`tools/perf/fight_profile_2026_10_25.py`: long animation frames, the page's render functions, a V8 CPU profile). Causes, all forced style/layout passes in a row: the battle log read and pinned its box for every line (now once a frame); every damage number and poison bubble was started by GSAP, which reads a new element's computed transform (now the Web Animations API, same motion, no reads); leaf puffs and the light pools read, wrote, read (now read all, then write). Map 5's Swamp Fever fight (5-1) on Auto, headless in software on a shared machine (several times slower than a laptop; compare the two, not the absolute), back to back: worst frame 3,548 -> 803 ms; one poison tick's effects 412 -> 77 ms on average (622 -> 127 at most); forced style/layout inside long frames 6.3 -> 2.0 s a round; a battle-log line 29 -> 1.6 ms.
- **Tokens no longer blink** (F5). Every card's element is rebuilt at round end (its art already decoded, no blank frame). Three blinks were found on tokens, headless, with a Brood and Sprout deck (one a run, 290-600 ms, round 1): a token a spawn put on the board during the replay was never marked seen, so the round-end render played its entrance again from opacity 0; the spawn portal and the Growth Sprout's pop dimmed the already-landed token's tile and grew it back. A card on screen before the rebuild now counts as seen, and the portal and the sprout pop play over the token on an empty stand-in (rune, soil, seed and leaves as before). Three runs after: no blink.
- **1 XP for a lost or drawn fight** (F4), on the same terms as a win's 3 (never a free Spire replay, a fight already paid, a PRO fight or an admin test); the auto-battler too.
- **Pack opener: "View all"** (F6), was "All N packs".
- **A second tap opens a feature at once** (G1): Camp, Codex, Forge and the other map spots open on a second tap within 20 s, while an NPC is still talking or a first visit's conversation waits for its reply.
- **Signing up and in** (G7): an email sign-up that waits for its confirmation link is no longer taken as signed in (the owner's second account: unconfirmed, no profile, nothing saved; every push had been refused silently). The link brings you back to the game; that account's first sign-in sends this device's progress, decks, cards and currencies up instead of loading its empty rows. After any sign-in (the Profile form, the sign-in popup, Google) the game syncs and returns to the screen you were on. Supabase needs the game's address in its Redirect URLs (decision FIX3-3).
- **One source for a rescued baby** (G13): the results pill shows the baby's type and icon, the same as its toast (a 🐞 Bug baby, not 🐣).
- **Train Younglings** (G14): the younglings scroll in their own box and the Train bar is its own band under them, never over a card.
- **Pack card detail** (G17): in Admin Mode the row of finish buttons set the card column's width (968 px at 1440), so the card sat far left and its text far right. The buttons now wrap under the card; card and details sit side by side, centred.
- **Map 0 after Map 10** (G20): the signpost and the old well answer a tap with a short tip, never a conversation (decision FIX3-2).
- **Overall raid rank on the raid reward screen** (G21), always, under its caption ("No raid rank yet" below F); an admin test fight's results show it too.
- **PvP auto-play** (G22) for Admin Mode and for players past Map 25 (ghost PvP only, never a live match). PvP is not scaled to your battle rating: Elo tier first, a 60% pull toward decks of a near BR (decision FIX3-4).
- **Tests found wrong, not the game:** `e2e/pro_2026_10_23.py` opened Admin's PRO list without Admin Mode (a player's click on a fight whose map is locked starts it at once, PL2); `e2e/rw6_2026_10_24.py` waited for every PRO map to draw for a player who has only Map 0 (a locked map shows its lock notice since PG), and a PRO tap now opens the fight's panel first (PL2). The fixed rw6 test then found Admin's PRO nodes running off the map at 390 (up to 9 a map since BPRO and X-REF): they wrap onto a second line.
- Texts: 5 new or changed texts in all 12 packs (`tools/i18n_2026_10_25_fix3.py`). Tests: `tests/fix3-2026-10-25.js`, `tests/e2e/fix3_2026_10_25.py`; `bp-2026-10-19.js`, `e2e/pro_2026_10_23.py` and `e2e/rw6_2026_10_24.py` updated.

## 2026-10-25 (package DOCS1 + HUB5: project state, evaluation protocol, Card table, Curves, road check; docs and the hub only, no game code)
- **`docs/project-state.md`** (D1): the settled rules (combat and damage types, keywords, resources, progression and rewards, maps and road, CPU, cards and budget), each a short line with its decision id and the canonical file; rules decided 10-25 17:53 and not built are marked "decided, not built yet (action item ...)". **`docs/evaluation-protocol.md`** (D2): PRO / BPRO rules, the reference decks (map reference, Reference-2, Reference-3 pending), the difficulty metrics with the owner's DF-1b tolerance, the testing procedure. Both are rows in CLAUDE.md's source-of-truth table and in the hub's Library.
- **Hub, 🗃️ Card table** (H2): all 879 cards of `canonical/cards.json`, 100 a page, sortable by any column, filters for text, rarity, pack tier, first-obtain map, faction, type and skill. Its **Packs** view (G11) shows each pack's name, tier and price with the rare-and-higher cards that have art as thumbnails (show only, nothing stored).
- **Hub, 📊 Curves** (H3): XP per level and in total read from the game's own `xpToNext` (Levels 15-25 marked, with a try-a-curve overlay that is not saved), Forge and crafting costs from `canonical/upgrade-costs.json`, Energy and resource curves; values on hover.
- **Hub, 📈 Difficulty** (H1): a road check at the top lists the 53 on-curve fights PRO3 left too hard (EN8-10 still open) and colours all 241 measured fights by their gap to the road target with the DF-1b bands.
- The Cards tab's thumbnails now come from `canonical/cards.json` (the old `docs/balance/hub-cards.json` export had stale stats).
## 2026-10-25 (package PREF: X-REF fights, the reference-deck switch, Reference-2, PRO ease)
- **X-REF fights** (P1, owner #32): each map with PRO fights has one more hidden fight, `<X>-REF` (a side map: `2-B-REF`), drawn as a 🎯 node beside the PRO nodes and listed last in Admin's 🏆 PRO fights. You play the chosen reference deck against one of the map's PRO / BPRO decks, picked in its panel (PRO-1 by default). It opens the same free preview as a PRO fight and costs no Energy and pays nothing.
- **Admin switch "Play with the map's reference deck"** (P1, 17:53), in the Admin Mode panel and the PRO fights panel. While it is on, any Conquest fight (road, PRO, BPRO, X-REF) deals the chosen reference set at that map's levels, with the set's leader, instead of your deck. The fight is free and unpaid, the top bar shows a REF tag and the results say "no rewards". It is off by default, kept on this device, and works only in Admin Mode.
- **Reference-2** (REF-2): the owner's Ant Deck (`docs/balance/ref/ref2-owner-main-deck-2026-10-25.json`). It is unlevelled at Map 0, then gains +5 Forge levels a map, seeded per map, on 5 different copies while 5 are below their cap: 100 levels at Map 20, capped at 102. Reference sets are files: `node tools/opt/ref_decks.js --apply` bakes `docs/balance/ref/*.json` into `arena_app.js` (`REF_DECK_SETS`), so Reference-3 is one file. Tools: `skirmish_pass.js measure --ref=ref2` and the new `tools/opt/pro_ease.js --ref map,ref2`.
- **PRO ease** (P3): every PRO / BPRO deck against both references, 80 games each (`docs/balance/pro-ease-2026-10-25.md`, `.json`). 47 of 374 pairings are over 85%, 42 of them BPROs. The easiest are the BPROs of side maps that open late (0-B, 1-A, 2-B, 5-A) and of Maps 0-2 against Reference-2. Map 2's PROs: the map reference wins 1-6%, Reference-2 50-61%, and Reference-2 wins 96-99% against its BPROs (Uncommon cap, a 15-card pool, Reference-2's Rare and Very Rare at +10 levels). No skirmish or PRO deck changed. Owner calls PREF-1 to PREF-3.
- Texts: 12 new TX keys in all 12 packs (`tools/i18n_2026_10_25_pref.py`). Tests: `tests/pref-2026-10-25.js`, `tests/e2e/pref_2026_10_25.py`; `pro-2026-10-23.js`, `e2e/pro_2026_10_23.py` and `e2e/rw6_2026_10_24.py` updated for the X-REF row and node.

## 2026-10-25 release 10-25b (batch: PRO3)
- PRO and BPRO fights for Maps 0-20 and 15 side maps (87 PRO, 100 BPRO decks), optimized against the pitching CPU, no faction cards; side-map PRO fights use the side map's codes (e.g. 2-B-PRO-1).
- EN8 resource cards on 14 more map lists (Oyster Bank, Beachcomber Sanderling, Giant Clam, Salvager Hermit Crab, Prospector Mole, Marmot Stonecutter, Beaver Feller, Carrion Crow).
- Road retuned toward the agreed curve after EN8 (131 enemy decks, card swaps only): fights in band 68 -> 117 of 241; main-map new-player mean 64.0% -> 67.2%.
- Checks: full unit tier, no new failures against 10-24e after bl's CHANGELOG window was widened (autobattle failed on speed under load and passes alone); ui_smoke 0 failures; flows 0 issues; card-matrix 0 failures, 0 golden diffs.

## 2026-10-25 (package PRO3: PRO pass for Maps 0-20 and their side maps, road check after EN8)
- **PRO and BPRO fights for every map 0-20 and 15 side maps** (owner 10-24 22:28 #3 / #11), from new optimizer runs against the current engine (the CPU pitches and guards): `tools/opt/deckopt.js --maps 0-20 --side --budget 16000 --ladder none` in both modes; outputs `docs/balance/opt/*-2026-10-25-pro3-{maptrue,bpro}.json` and their summaries. Faction cards (faction-pack cards, `source` pack tier 11) are left out of PRO pools by default (`--no-faction` / `--faction`). A side map gets its own fights, named after its fight codes (`2-B-PRO-1`); the game shows a side map's own PRO fights on it (`proEntryIdOf`, `PRO_KEY_RE`). Not done: the tutorial and the endless dungeons (Murgle Mayhem, the Undercroft).
- **EN8's resource cards on more maps:** Oyster Bank (Gannet Cliffs, Kelp Mangroves, Smugglers' Grotto), Beachcomber Sanderling (Gannet Cliffs, Kelp Mangroves), Giant Clam and Salvager Hermit Crab (the Sunken Depths), Prospector Mole (the Glimmer Depths), Marmot Stonecutter (the Aerie Vault, the Sundered Peak), Beaver Feller (the Redwood Deep), Carrion Crow (the Long Grass, the Canopy, the Pale Desert). Only maps at or after each card's first map, so no card's first obtainable map moved (`tools/opt/pro3_map_lists_2026_10_25.js`).
- **Road check (EN8-10):** every fight of Maps 0-20 and their side maps measured against the road curve, then CPU deck swaps only (leader, first-clear card and deck size kept): green 68 -> 117 of 226, main-map new-player mean 64.0% -> 67.2%, 131 decks changed (`docs/balance/pro3-road-check-2026-10-25.md`). `tools/skirmish_pass.js` gained `--keep-first`, `--keep-size` and `--maxmap`.

## 2026-10-25 release 10-25a (batch: PL1, PRO2, EN8, PL2)
- The CPU pitches cards for resources, guards against lethal hits, and its brambles heal allies; Rampart covers only its own and neighbouring columns. Resource skills (Stonecutter, Prospector, Felling, Salvage, Scavenger, Coppice, Windfall, Driftwood) and Pearls/Shellfish.
- PRO fights follow the map's rarity and cards, plus BPRO; clicking a PRO node opens a free preview with Fight.
- Playtest fixes: no bramble remnant, no end-of-game redraw, ☠N poison, Inspiring burst, number bounce, eased bramble bars and hit/mend effects; XP for every skirmish plays on the map; stacked card rewards with an "S reward" ribbon; one-step trigger lesson; simpler Energy panel; opponent resources on Shift; Whisper's Game and the Dungeons tab admin-only; Arena Co-op tab with the Group Dungeon; Fork/Pitchfork/Trident sounds; results music order.
- Checks: full unit tier, no new failures against 10-24e after four stale tests were updated (en4, z, t, rebuild); ui_smoke 0 failures (after making its auto-battler step use Admin Mode); flows 0 issues; card-matrix golden refreshed (0 failures, 0 diffs).

## 2026-10-25 (package PL2: the owner's playtest notes 10-24 22:28 and 10-25 00:02: UI, VFX, rewards and audio; 21:54; PL1-1, PL1-3, PRO-UI)
- **The board:** a fallen bramble leaves nothing behind (BV's mound of earth read as a leftover, 22:28 #1). The round that decides a match no longer
  rebuilds both rows at the end: a cell holding the same unit keeps its element and has its numbers patched, so the cards just played no longer
  blink out and back (00:02 #1; not reproduced headless, the rebuild was the one place every card was replaced). A flyer's / floater's Health
  bar rides in its `.fly-body` (it stayed still while the card swayed, so it crossed the plates: SS#1's "green bars"); an artless card's emoji is
  drawn whole (the Fire Ant Raft's "ghost art"; it and the Ember Tetra still need art, call PL2-5).
- **Inspiring (22:28 #4):** one 📯 burst over the inspirer (it pops in, shakes as it grows, fades up with a gold ring and three notes); 0.3 s
  later each neighbour's Attack goes up, a Waiting one too, and stacks; the swing that spends it brings the plate back. Was a "+1⚔ next swing"
  float on each ally and no number change until the next turn.
- **Numbers bounce (22:28 #5):** a changed Attack, or a Health that rises (not damage), shrinks a touch, swaps, springs past its size and
  settles (`pl2SetStat`; also after a redraw that changed it). **Bramble bars ease (22:28 #7)** in 0.42 s, across redraws too, with a pale
  chip of the Health lost that drains after; the number counts; a repair glints. **Bramble animations (21:54):** a hit flashes white on the tile
  and throws bark / stone chips off its top (the fall's palette, more for a bigger hit); a repair draws chips back in with a green rim.
- **Poison** floats ☠N again (00:02 #4). **The opponent's resource pills** show only while Shift is held, or in their deck's tooltip (00:02 #8).
- **XP on the map for every fight (22:28 #8, PL1-1):** no won fight's results show the XP bar (Arena, Spire, dungeon floors too); it waits,
  stored, and fills on the Conquest map after that map's moments. Each Conquest win is queued and its emblem plays over the fight when the map is
  really in view, however many Next fight wins came first, or after a reload (calls PL2-3).
- **Card rewards (00:02 #3 #5):** every card reward is a card (egg cards and card-form materia too); two or more are one stack with a count,
  fanned on hover or tap. The top-rank rare find and a rank-gated drop flash and wear the rank emblem with "reward"; no "Rare find" pill (PL2-4).
- **Pack card detail (22:28 #9):** where it comes from is a square "📦 Pack 1" pill (its pack's name in the tooltip); the Abilities heading
  follows the theme (it was dark on dark); the card popover opens over the pack opener on a 1 s hover or a hold (it opened under it).
- **The trigger lesson** is one step, "This chip is a trigger — read the card." (00:02 #6). **The Energy panel:** the count, the refill line,
  then free Energy and a 🔋×N Use; the capsules and the Nest line are tooltips (00:02 #7). **Whisper's Game** is Admin Mode only (22:28 #6).
- **Dungeons (PL1-3):** no Dungeons tab for players (Admin Mode keeps it, PL2-1); the Group Dungeon is the Arena's Co-op tab and a 👥 spot on
  Map 3 after its last fight (PL2-2).
- **PRO-UI:** a PRO or BPRO fight (admin map nodes, Admin's list, the skirmish editor, a #pro= link) opens the map's normal fight panel (deck,
  field, leader, battle rating; no rewards) with a Fight button that starts it free. BPRO is baked into the game (`_pro_for_game`), `N-BPRO-k`
  keys work, and every list shows both kinds.
- **Sound (00:02 #9 #10):** Fork, Trident and Pitchfork each have their own tings over the swing (`SoundKit.prongTone`). After a fight the
  victory sting plays over the fight's theme at 30%; the map's theme starts only when you are back on the map and fades in over 4 s (PL2-6).
- **i18n-templates:** PL1's word-less "{have}/{total} {theme}" key (no pack could compile it) is gone; the boon card's line is built in place.
- Texts: 5 TX keys in 12 packs (`tools/i18n_2026_10_25_pl2.py`). Effects Lab: `tools/effects-lab/manifest/pl2.js` (Inspiring, the bounce, the
  bars, the bramble's hit / repair / fall, the prong sounds). Tests: `tests/pl2-2026-10-25.js` (new, run-all), `tests/e2e/pl2_2026_10_25.py`
  (new, 390 and 1366, frame sheets in `docs/screens/PL2/`); dated updates to `tests/en7-2026-10-24.js` and its e2e (☠N), `tests/tt-2026-10-24.js`
  and its e2e (one step), `tests/rw4-2026-10-23.js` and its e2e (the Use button), `tests/pl1-2026-10-24.js` and its e2e (the boon line, the
  Dungeons tab), `tests/coop-dungeon-2026-10-23.js` (Co-op), `tests/pro-2026-10-23.js` and its e2e (the preview, BPRO). Owner calls PL2-1 .. PL2-6.

## 2026-10-24 (package EN8: the CPU pitches and guards, Guardian vs Thorns, Armor vs magic, brambles mend allies, Rampart's columns, the resource skills and Pearls; owner 21:20 #4 #7, 21:41 #5, 22:28 #1-#3 #10, P24-7 / 15 / 16 / 17, LUM-1)
- **The CPU pitches before it plays** (every level; the game, `tools/skirmish_pass.js` and `tools/opt` all use the engine's `aiTakeTurn`): with
  nothing useful to play it pitches its least valuable card (keeping the one nearest to affordable); holding a card it can't afford with 3+
  in hand it pitches a spare card and still plays; a held useless spell no longer passes the turn. The owner's 5-3-like deck (4 zero-cost
  of 20): first play round 2.59 -> 1.54 (Basic, Smart and Smartest alike); Maps 0-20, every fight: 1.19 -> 1.01.
- **The lethal guard (P24-7):** from Map 1 (`rules.aiGuardLethal`), when your swings into open columns would finish its bramble and it can't
  win that round itself, the CPU plays the unit that blocks the most into the attacker's column.
- **Guardian vs Thorns (P24-15):** a Guardian never steps in for a Thorns unit; its Thorns answer. **Armor vs magic (P24-16):** Armor stops
  only physical hits; magic and elemental hits go past it; new **Magic Armor N** 🔮 stops only those. **Brambles (P24-17):** a bramble's healing
  heals a random wounded ally unit (never itself or a Structure); Structures are only repaired. **Rampart (21:41 #5):** covers only hits from
  its column and the ones beside it (price 0.5 -> 0.25).
- **Resource skills (LUM-1, default 1, 4-round prices):** Stonecutter N (every 2nd Ready turn +N Stone, 1.8), Prospector N (On Kill +N Metal,
  1.2), Felling N (On Kill +N Lumber, 0.8), Pearl Bed N (On Ready +N Pearl, 0.9), Coppice N (+N Lumber after a round undamaged, 1.1),
  Driftwood N (+N Lumber at Ebb on the beach, 0.75), Scavenge N (an ally dies: +N Lumber, 1.5) and Salvage N (a Structure of yours dies: +2N
  Lumber, 0.75) take SK2's two unused names; the Windfall field (after a Storm round both sides +1 Lumber) on the windy maps up to 20.
  **Pearls** ⚪ pay a Lumber or Stone shortfall (their own pill and float). Editor, Codex lines and texts in 12 packs.
- **Cards:** Beachcomber Sanderling (Map 2), Beaver Feller (7), Prospector Mole (8), Salvager Hermit Crab (10), Marmot Stonecutter (11),
  Carrion Crow (12), Hazel Coppice (13), Moonshell Snail (15), pack cards on the formula line (prompts `docs/art/en8-2026-10-24-briefs.md`);
  Pearl Bed on the Oyster Bank and the Giant Clam; the Leafcutter Gardener's Growth -> On Ready +1 Lumber (22:28 #10). **Stem (21:20 #7)** is
  an Evomax skill: Fodder came off the 20 baby-like cards first obtainable before Map 20 and the Speckled Egg; the Cocoon's Chrysalis reads "?".
- **Render gives Daunt counters (owner 00:02 #2):** Render N puts N Daunt counters on the enemy facing it: each is -1 Attack and -1 skill
  damage; one falls off each round, each swing and each skill it uses (was: N Attack lost for good). Price 0.8 a point; Raven Hexcaller and
  Mire-witch Heron re-fitted (fit unchanged). The 😨N badge, float, log line; texts in 12 packs.
- **Difficulty moved:** the new-player win rate over every Map 0-20 fight fell 76.0% -> 64.4% (pitch ~5.5, the bramble mend ~3.7, guard ~0.6;
  `docs/balance/en8-cpu-pitch-*.json`, `tools/en8_cpu_pitch_2026_10_24.js`); not retuned here (call EN8-10).
- Tests: `tests/en8-2026-10-24.js` (new, run-all), `tests/e2e/en8_2026_10_24.py` (390 and 1366, `docs/screens/EN8/`); `tests/skills-sk2-2026-10-19.js`
  (the new Scavenge / Salvage), `tests/skills-sk2b-2026-10-19.js` (8 cards appended), `tests/pro-2026-10-23.js` (EN8's field flags; 2-BPRO-3's
  showcase is the Driftwood Crab now), `tests/en-2026-10-23.js` (Fodder only from Map 20), `tests/en3-2026-10-23.js` (Rampart 0.25), `tests/n221-2026-10-24.js`
  (its entry is no longer in the first 6000 characters). Owner calls EN8-1 .. EN8-11; LUM-1 done.

## 2026-10-24 (package PRO2: PRO fights by the map's rarity and cards, plus BPRO; owner 21:20 #9-#11)
- **PRO fights follow the map's rarity and cards.** The old 0-PRO-3 held 2 Ents (a Rare reward of the Old Bramble, Map 0's side map that opens after Map 21). Most other old PROs held a Rare Otter Centurion or cards first obtainable 5-40 maps later. The optimizer's classic pool took every submap's list as the map's cards and owned cards at any rarity. New `deckopt --mode map-true` (now the default) uses the map's own cards plus what a player holds by then: plan-owned cards, earlier maps' cards and submaps already open. Every card must be within the map's rarity cap (the rarest any of its fights may hold: Map 0 Common, Maps 1-3 Uncommon), and an outside card must be first obtainable by this map. All 9 old Map 0-3 PROs broke the rule: they were dropped to `replaced` with their reasons.
- **BPRO (Basic Pro):** `N-BPRO-k` decks use only the map's own pool (MAP + SPECIAL + its fight decks), within the cap (`deckopt --bpro`, no phase 2). `pro_skirmishes.js` handles both kinds (`--kind pro|bpro|both`) with the same replace rule. BPRO is stored under the map's `bpro` and is not baked into the game yet; the PRO preview package wires it in.
- New decks (budget 6000 games a map; 82-168 games/s on 2 workers): Maps 0-3 have 1 / 1 / 3 / 4 PRO and 4 / 4 / 4 / 4 BPRO. Outputs: `docs/balance/opt/deckopt-*-2026-10-24-{maptrue,bpro}.*`.
- **Alley Cat moved out of Map 0's card list.** RW5 had homed this map-less Rare there; Map 0's fights are Common only. It now lives in the Gatorback Swamp (Map 5), still Pack 1 and first obtainable on Map 5, so its stats are unchanged (owner call PRO2-2). No other map 0-40 lists a card over its fights' cap.
- Tests: `tests/pro-2026-10-23.js` checks both kinds: no card over the map's cap, BPRO cards all from the map's own pool, each deck from a run of its own mode, and an old deck that breaks the rule is dropped. `tests/opt2-2026-10-23.js` checks the modes' pools, the caps and the Alley Cat. `tests/opt-2026-10-23.js` runs `--mode classic`. Owner calls PRO2-1 (the cap) and PRO2-2 (the Alley Cat's home).
## 2026-10-24 (package PL1: the owner's 10-24 playtest, UI and bugs: P24-1..6, 8, 9, 11..13, 18..20 and 21:20 #1 #2 #4)
- **Packs after a map (P24-6, P24-19):** the order is the map's veil and title banner, then the packs, then the swap window (the packs used to
  open under the banner). The pack count runs across every pack waiting ("Next pack (5 left)" goes on into the next kind of pack), and with
  more than one kind the last pack leads to one page of every card ("All 6 packs"). Reward packs no longer wait for a tap on the Camp's map
  tile: the Camp counts as open once it is there (call PL1-4); packs held in older saves open on the next map shown.
- **XP (P24-3):** a Conquest fight's results have no XP bar; it fills at the top of the map when you are back (call PL1-1).
- **Map (21:20 #4, P24-5, P24-18):** X after a first clear lets go of the fight and the pawn walks on to the next one (a replay keeps MK's
  behaviour; call PL1-5). A cleared fight shows the normal rank emblem: it fades in on the fight, hops and spirals into the bottom right (the
  fight panel's corner emblem when it is open), no red seal or floating chip. The Wandering Traveller's leader lesson ("Show me" -> Camp)
  waits until the Camp is open (it used to end in "That opens up later").
- **Fights (P24-9, P24-11, P24-12, 21:20 #2):** the hand's would-be numbers redraw on the day / night turn and state-skill changes. The bonus
  Health bar (EQ2) sits above the Attack and Health plates (it ran across them: Voidfeather's night +1/+1). The Attack plate counts Kinship,
  Nature's Force and Lone Wolf / Sociable (Honeyjoe Brewer showed 1 and hit for 2). Lethal Poison (Poison >= Health): the Health turns poison
  green with bubbles and the pool stands higher.
- **Words (21:20 #1):** a selfish boon's Environment card says "11/17 Reptile"; its detail is the effect and "Theirs: half their deck Reptile".
- **Screens (P24-1, P24-2, P24-4, P24-8, P24-13, P24-20):** the faction pick's example cards start as three Commons and turn over to other
  faction cards (call PL1-6); no names under Tut2's reward cards; no name band on a single pack, a red ribbon with the count round a set (call
  PL1-2); the swap window's right column never offers Basic / Starter / baby cards or a card a swap took out; the Dungeons tab opens after
  Map 3 or with the first daily dungeon (call PL1-3, changes AR3-2); the deck's copy pill is smaller and out in the card's corner.
- Texts: 29 TX keys (`ui.pl1-*`) in 12 packs (`tools/i18n_2026_10_24_pl1.py`; the boons' one-line effects are each pack's DF3 sentence cut
  before its "Theirs only" part). Tests: `tests/pl1-2026-10-24.js` (new, in run-all), `tests/e2e/pl1_2026_10_24.py` (new, 390 and 1366);
  `tests/mk-2026-10-23.js` and `tests/e2e/df3_2026_10_24.py` follow #4 and #1. Shots: `docs/screens/PL1/`.

## 2026-10-24 release 10-24e (batch: BAL3, H1, CONTENT2, N221, RELFIX, HUB4)
- Balance by the agreed rules: every fight on the level schedule, side-map Rares from Map 10, 130 decks retuned (48 -> 80 of 179 fights in band), the 10 held cards on their formula, Rising Tide = Quick +1 Attack.
- Materia socket (Unique and above, one gem; apply/remove costs in the hub). Lumber gatherers per biome, the Stone loop, the beach, cuter early maps, Gnawed/Tidefolk cards (awaiting), Gilded Roadwarden. Maps 21-40 plan; the Petrified Tree on Map 22. 1-3 back to 20 cards.
- Hub: the Library tab (all docs in one place).
- Checks: full unit tier, no new failures against 10-24d (autobattle passes alone); ui_smoke 0 failures; flows 0 issues; card-matrix golden refreshed.

## 2026-10-24 (package HUB4: the master hub's 📖 Library tab, owner G2 / item 71)
- **Every doc is read in the hub:** a new 📖 Library tab (`tools/hub/library.py`) lists all of `docs/**/*.md` (not the raw `docs/balance` outputs or the `docs/art` prompt files): canonical docs (code map, style guideline, art prompts, lore bible, effects catalogue, tuning guide, the six workflows) and still-relevant reference docs are rendered in full with their path and last-changed date (git); the dated snapshots sit in a collapsed History group (title and one line each, opened on demand). Docs that already have a tab (Action items, Changelog, Decisions, Progression plan, the Design sheets, Claude's guide) link to it instead of repeating. The hub search covers all of it (new Library and History result types). The files stay on disk; no extra hub files. Test: `tests/hub4-2026-10-24.js`. A short "Where docs live" note is at the top of `docs/action-items.md`.

## 2026-10-24 (package N221: the Maps 21-40 divvy, owner N22-1)
- **The Petrified Tree has a home:** a Pack 4 card of the Rimefire Caldera (Map 22; petrified forests form under volcanic ash). It is the only waiting card that fits a map that exists without a new skill or an era hold (owner call N221-3). `canonical/card-obtain-maps.json` and `canonical/unit-themes.json` regenerated.
- **Every other card that waited for a source (72) has one home, proposed or held** (`docs/balance/n221-divvy-2026-10-24.md` / `.json`, `tools/n221_divvy_2026_10_24.js plan|apply|check`): 20 on a proposed map (the rainforest set on 25, the ants on 26, the Evomax sloths on 30, the Grovebearer on 40, the Armory on Goldfeather Keep, held ...), the Thistle Baron as a quest-only special (Map 32), Pack Secrets I (MissingNo., Glowing Gecko), the faction pool (Anvilwhisker Otter, Greyplume Fledgling), the Blacksmith (Crowbar); the Gnawed and Tidefolk wait for CONTENT2-3; spells, Devilry (66) and Ecclesia (77) stay held. Nothing applied but the tree.
- **Maps 25-40 as a proposal table** (not built): biome, pool of 6-10, two skirmish-base cards, pack tier and caps each; Map 40 is a seed for the owner's one-map-at-a-time process. Pack 4 / 5 / 6 = Maps 21-27 / 28-34 / 35-41 (N221-1). `docs/progression-plan.md` has a Maps 21-40 section.
- Owner calls N221-1 .. N221-7 in docs/decisions.json (pack tiers, eight cards that would bring a new skill onto Maps 21-40, the tree, pool sizes on 22 / 23, the table, CONTENT2-3's alternative homes, the homes outside the maps). Tests: `tests/n221-2026-10-24.js`.
## 2026-10-24 (package RELFIX: batch-1023e release failures)
- **1-3 Burrow Line holds 20 cards again** (EB: Map 1's decks hold 20): BAL3's 8 -> 7 different cards step left 19; Cottontail 2 -> 3
  (66% -> 68% at 100 games, band 62-78), still 7 different cards.
- Tests that followed the batch's intended changes: async-raid measures the stage power curve on the generated ghosts (TS2's themed
  decks are placed by fights; Sunfeather Scout's BAL3 cut left the mixed average 0.004 short); bl / en3 accept BAL3's ten formula-line
  cards (owner BAL2-5) and the shorter flagged list; skills-sk2 lets CONTENT2's new Redwood Woodpecker (Milling) and Badger Stonemason
  (Quarry) carry SK2 skills.

## 2026-10-24 (package CONTENT2: Lumber gatherers per biome, the Stone loop, the Gnawed and the Tidefolk, the beach)
- **Lumber gatherers in every biome (owner 13:12 #8):** eight new pack cards, one per main biome of Maps 0-20 that had none: Driftwood Crab (Pebble Beach), Gannet Nestweaver (Gannet Cliffs), Nutria Reedcutter (Gatorback Swamp), Redwood Woodpecker (Redwood Deep, Milling 1), Termite Forager (Savanna), Cone-cutter Squirrel (Taiga), Talus Pika (Tundra), Dune Packrat (Glass Dunes), On Ready / On Play +1 to +3 Lumber. Land Tiller, Coral Polyp Colony and Rodent King, gatherers in no pool, joined the Long Grass, Coral Current and the Briar Maze.
- **The Stone loop:** Badger Stonemason (Caves & Alcoves, the engine's Quarry 1: each turn 1 Lumber -> 1 Stone), Gravel Mole (On Ready +1 Stone) and Pumice Beetle (Ashen Spurn, On Play +2 Stone). No engine change. Owner call CONTENT2-2 (Quarry's 1 : 1 or a 2 -> 1 converter).
- **The Gnawed (4) and the Tidefolk (3 more):** Bog Shrew, Mire Rat, Hollow-belly Rat, Gnawed Matriarch; Kelpborn Otter, Conger Eel, Selkie Wavebinder. Awaiting a source (proposed in CONTENT2-3); lore bible appended.
- All 18 priced by the formula (the line on their shape, `tools/content2_2026_10_24.js fit`); placeholder art (emoji), prompts in `docs/art/content2-2026-10-24-briefs.md`.
- **Pebble Beach feels like a beach (N21-1):** the Rock Pool Starfish fights in Rock Pool Raiders (2-1, 81.5% -> 86.5%, target 90), Gull Gang gets Oystercatchers (83.5 -> 84.5, target 80), Hermit Row the Driftwood Crab (79 -> 64, target 70). **Cute early maps (N21-2):** Gannet Nestweavers replace the Hawk Arrowkeepers in 3-1 (97.5 -> 92.5) and 3-3 (98 -> 96); the Leech Pools (5-1) get Bog Leeches for the Venomlord Serpents (100 -> 91, target 90). 200 games each, `docs/balance/skirmish-pass-content2-{before,after}.jsonl`.
- **Cataphract Destrier is the Gilded Roadwarden** (id kept); **Mirrorhide Mutant's** flavour fits Mimic (C21-2). Names and flavours in 12 packs (`tools/i18n_2026_10_24_content2.py`).
- Reported, not changed: the 10-16 editor-era skills (Earthworm, the starter fish, Meadow Frog, the Traveller) were lost in the 10-15 fold, not dropped on purpose (CONTENT2-5); the unlocks on uncharted maps stay (CONTENT2-4, proposed Maps 21-24); Sunken Hollow's whale and kraken fight names (CONTENT2-6). Tests: `tests/content2-2026-10-24.js`.

## 2026-10-24 (package H1: Materia gem sockets, owner decision H1)
- **The Forge's Enchant tab is now 💎 Socket:** every copy of a Unique or rarer creature has one gem socket (a small diamond on the card's right edge: hollow when empty, glowing in the gem's colour when filled). Setting a Materia gem costs one crystal plus Dust and Maple Leaves; taking it out costs Dust and Maple Leaves and the gem comes back (owner call H1-a). One gem per copy: a filled socket is emptied first. The tab lists only cards with a socket and works on one copy (copy picker, copies sheet).
- **Gem effects unchanged** (the old Enchant ones: Ember +1 Attack, Tide +2 Health, Grove +1/+1, Stone +3 Health). Each copy fights with its own gem (`<id>~cp<L>g<gem>` copies); the card's own face shows its best copy's gem. A gem is a progression bonus outside the printed budget (docs/workflows/balance.md).
- **Costs:** `canonical/upgrade-costs.json` `materiaSocket` (apply / remove per rank, placeholders, H1-b), editable in the hub's 💰 Upgrade costs tab (group "Gem sockets", 28 numbers; the fold tool takes them).
- **Data:** sockets per copy (`bramblewood_card_sockets_v1`, {card: {copy uid: gem}}) ride the progress blob together with the Materia crystals (`bramblewood_materia_v1`, newly synced), read back after a pull. A socket whose copy is gone moves to the best empty copy; a socketed copy is never a spare. The old per-card enchantments move once onto the card's best copy (a card without a socket gets its crystal back).
- Card detail: a 💎 Socket line (the gems in your copies, how many are empty). Texts in 12 packs. Owner calls H1-a .. H1-c in docs/decisions.json.
- Tests: tests/h1-2026-10-24.js (134 checks), tests/e2e/h1_2026_10_24.py (390 and 1366; shots in docs/screens/H1/); fg / ne source checks accept the Socket mode and the gem argument.

## 2026-10-24 release 10-24d (batch: EQ2, RW6, EN6, EN7)
- Equipment durability, Bolster and the Health bar, Parasite, raid Beak Strike and two Guardian raiders; Dive in two turns (aloft / under, then strike); Guardian tilt; Poison pool sink and 🤢N floats; Poison/Bleed on Pounce/Ambush, "– poison"/"– bleed"; Parasite x Bloom.
- Hand states (Plenty, Scarcity, Foe's), Full Hand / Lean, Heat, Frost, Rain, Storm, Fog, Salt, Drought, Season (field option), Hibernate, "– bramble"; Bounty only on loot carriers (Beaver Lumberjack: On Ready +1 Lumber).
- Results: no rank-locked chips, Base cards as card tiles; PRO fights as map nodes in Admin Mode.
- Checks: full unit tier, no new failures against 10-24c (t test updated for RW6; autobattle passes alone); ui_smoke 0 failures; flows 0 issues; card-matrix golden refreshed.
## 2026-10-24 (package BAL3: the road by the agreed rules, LEAD's levels gone, side-map Rares, the ten held cards, Rising Tide +1 Attack)
- **The road retuned by the rules only (owner BAL2-3, 12:02 "use our agreed philosophy and schedule"):** 130 enemy decks of Maps 0-24 and the
  Pale Desert moved inside their map's pool and theme, the copy ladder and 5-7 different cards, leaders kept, no new Shield. Fights on their
  road-curve band: 48 -> 80 of 179 (the Pale Desert 0 -> 4 of 9), 100 games a fight (docs/balance/bal3-road-table-2026-10-24.md). Maps 3,
  5, 13, 18 and 23 stay too easy, Sunken Hollow's first two too hard: BAL3-2.
- **No hand-set Enemy levels (BAL2-1):** LEAD's 57 per-fight levels are gone; every fight plays at the level schedule. The DF3 challenges keep
  their one level up.
- **Side maps follow the road's Rare rule (BAL2-2):** no Rare in a normal skirmish before Map 10, no Very Rare before 15. 2-B-1 fields Grey
  Seal Bulls for its Mallard Marauders, 7-A-1 a Bombardier Beetle for its Swarm Matriarch, 7-A-2 a Hawthorn Shieldbug for its Wolf Spider
  Mother; 1-3 Burrow Line has 7 different cards (was 8).
- **Ten cards on their formula line (BAL2-5):** Alley Cat 1/1, Honey Badger Fury 1/6, Chipmunk Hoarder 2/6, Chipmunk Cavalry 2/2, Pyroclast
  Wyrm 3/12, Plague Gnat Cloud 2/2, Sunfeather Scout 1/4, Lone Grey Wolf 2/9, Rock-pool Starfish 1/1, Muskrat Lodgekeeper 1/5 (BAL3-3).
- **Rising Tide (DF3-3):** their Tide units are Quick and have +1 Attack while the tide is in (12 packs). 5-A-2 and 10-A-2 have no tide, so
  it never fires there: BAL3-1.
- Tools: `tools/skirmish_pass.js curve --all --pool --distinct` (and `moves`, a challenge's target minus 10), `tools/bal3_2026_10_24.js`;
  PRO fights re-run (dry): no stronger deck, nothing applied. `tests/bal3-2026-10-24.js`.

## 2026-10-24 (package EN7: Dive in two turns, the Guardian's tilt, Poison's pool and floats, Poison / Bleed on extra hits, Parasite x Bloom)
- **Dive ⤵️ N, in two turns (13:12 #3, "like pokemon"; calls EN7-1, EN7-4):** replaces EQ2's one-swing dive. Turn 1 (its swing, with an enemy
  unit in its row): a Flyer rises off the board, its shadow left below, a ☁️ tag; a Tide unit sinks under a band of water, a 🌊 tag. Nothing
  can find or hit it (a Spotter neither; swings at it float "Out of reach"), it doesn't swing and can't step in as a Guardian. Turn 2: it
  plunges (or bursts out with a splash) onto the weakest enemy of its row, past Taunt (a Guardian beside the target still steps in), for N
  more, and is Exposed that round (no Flying dodge, no Tide evade). Once a fight. A diver that can't strike comes down ("🪶 Lands"). Price
  (4-round rule) 1.25 x N^0.5 (was 0.75 N). On **Puffin Diver** (Dive 2, 2/6 -> 2/5, aloft) and **Harbor Seal** (Dive 2, 1/10 -> 1/9, under).
- **Guardian (#4):** the unit that steps in tilts 10° toward the attacker while it takes the hit, then settles as it slides home.
- **Poison (#6, #7):** when Poison runs out the green pool sinks below the card's foot as it fades. Applied Poison floats "🤢N" (was
  "🤢 💀 +1" from Swamp Fever and "☠ +N" elsewhere); Bleed "🩸N" (was "🩸 +N"), Deadly Poison "💀N" (was "💀 +N").
- **Poison / Bleed on extra hits (#5, call EN7-3):** a unit's Poison N / Bleed N now also ride on its Pounce and its Ambush strike (swings,
  Frenzy / Twin Strike, Fork / Trident / Pitchfork prongs and Octolash already carried them; Cleave's spread does not). Shots and actions
  (Arrow, Missile, Bolts, Deal damage ...) carry none unless the card says **– poison** / **– bleed** ("Arrow 2 – poison": the unit's N, at
  least 1); a box for each on the Arrow, Missile and Deal damage actions in the card editor, and Arrow / Fire Arrow / Fire Bolt – poison /
  – bleed as skills. Prices: Pounce / Ambush on a Poison / Bleed card + 0.33 / 0.3 x that status's price (no card has both); – poison / –
  bleed on a shot 0.9 x the status's price at the unit's N; on an action + 0.9 x the Poison / Bleed action's value.
- **Parasite x Bloom (#2, call EN7-2):** a Parasite's bloom copy (+1/+1) hooks onto an enemy unit beside its host that has no parasite (a 🪱
  flies over); played as a plain unit, onto an enemy facing it or one column beside. None free: it waits and tries again next round.
- Housekeeping (#6 of the brief): RW6's note inside the results template (`matchStatsHTML`) moved out of the template string: it printed into
  the page and `tools/text/keyify.py` keyed it as `results.2026-10-24-rw6-owner-no`. keyify --dry-run: 0 edits, 0 new keys.
- Engine: the EN7 blocks (`en7DiveRise`, the strike in resolveCombat, `en7HitStatuses`, `en7ShotTip` / `en7TrigTip`, `en7ParasiteBloom`);
  events `diveRise`, `diveLand`, `dive {strike, mode}`, `evaded {reason: 'aloft' | 'under'}`, `statusFx poison / bleed {via}`, `bloom
  {parasite}`, `parasiteAttach {bloom}`. Prices `tools/en7_skill_costs_2026_10_24.py`, cards `tools/en7_cards_2026_10_24.py`, the S check
  `tools/en7_budget_check_2026_10_24.js` (`docs/balance/en7-prices-2026-10-24.json`), texts `tools/i18n_2026_10_24_en7.py`, calls
  `tools/en7_decisions_2026_10_24.py`. Tests: `tests/en7-2026-10-24.js`, `tests/e2e/en7_2026_10_24.py` (shots `docs/screens/EN7/`);
  `tests/eq2-2026-10-24.js` follows the two-turn Dive (dated note).

## 2026-10-24 (package EN6: hand, heat / frost, weather and season states, Full Hand / Lean, Hibernate, – bramble, the Bounty clean-up)
- **Hand states (03:17 #1):** 🃏 **Plenty – {…}** while you hold 4+ cards (default +1/+1), 🫗 **Scarcity** 1 or none (+1/+0), 🎴 **Foe's Plenty**
  the opponent holds 4+ (+0/+2), 🪹 **Foe's Scarcity** 1 or none (+1/+0). **Full Hand N** / **Lean N** (+N Attack per card in hand / per empty
  slot) and the Foe's pair ("Hoard" was taken: call EN6-1). EN5's pattern: braces or the default, a lit gold pip while on, a float and a log line.
- **Heat / Frost (03:17 #3):** 🌡️ **Heat – {…}** while the field is hot (Scorching, the volcano / forge / frostfire / desert maps, the volcano's
  fires, Summer; +1/+0), ❄️ **Frost – {…}** while it is cold (Frigid, Hail, Freezing, the map's frost, tundra and frostfire, Winter; +0/+2).
  Heat and cold resistance are unchanged beside them. New map flags `hotMap` / `coldMap` / `saltMap` / `weatherMap` (`fightRules`, by biome).
- **Weather (03:17 #4):** ☔ **Rain** (Spring Rain or a Thunderstorm; +1/+1), ⛈️ **Storm** (a Thunderstorm or a strong-wind round; +2/+0),
  🌁 **Fog** (Thick Fog or the Mist; Evasive), 🧂 **Salt** (a beach or reef map while the tide is out (Ebb); Armor 1), 🔆 **Drought** (3 rounds in
  a row without rain on a dry map with weather; +1/+0), 🍂 **Season (X) – {…}** (+1/+1) with the new **Seasons** field option (Edit skirmish;
  off by default, on no map yet: Spring, Summer, Autumn, Winter, 3 rounds each; Summer is hot, Winter cold; call EN6-4).
- **Hibernate N 🛌 (03:17 #4):** in a cold field, or at night on a cold map, the unit sleeps (no attack, Taunt / Guardian off, a hit does not wake
  it, its Wait waits), heals N (plain 2) each round, and wakes when the cold ends. A pale blue 🛌 pip and floats (call EN6-8).
- **– bramble (03:17 #2):** Arrow / Fire Arrow / Fire Bolt – bramble (card text "Arrow 2 – bramble") shoot the enemy bramble instead of a unit;
  in the card editor a "– bramble" box on the Arrow, Missile and Deal damage (one opponent) actions; a 🏹 flies into the bramble.
- **Prices (4-round rule x measured uptime, call EN6-2):** `tools/en6_state_uptime_2026_10_24.js` (`docs/balance/en6-state-uptime-2026-10-24.json`):
  plain Plenty 0.45, Scarcity 1.58, Foe's Plenty 0.1, Foe's Scarcity 1.54, Heat 1.2, Frost 1.12, Rain 0.15, Storm 1.8, Fog 2.7, Salt 0.38,
  Drought 1.0, Season 0.75 (braces: the same uptime x their S); Full Hand 3.0 / Lean 7.5 / Foe's Full Hand 2.4 / Foe's Lean 7.5 a point; Hibernate
  0.95 a point with its Attack counted x0.53; – bramble x0.9 (the `bramble` modifier). The CPU holds 1 card 73% of the time as combat starts, so
  Plenty is rare against it (call EN6-3).
- **Cards (thematic, all already placed):** Polar Bear (Hibernate, Map 6), Snow Ermine (Frost), Cinder Stoker (Heat), Dromedary (Drought), Fulmar
  Spitter (Storm), Horseshoe Crab (Salt), Puddle Hopper (Rain), Ent (Fog), Seed-cache Squirrel (Plenty), Ravenous Wolverine (Scarcity), Gull Thief
  (Foe's Plenty), Stoat Cutthroat (Foe's Scarcity), Balloon Archer (Arrow – bramble); re-fit (`docs/balance/en6-refit-2026-10-24.json`): 3 up,
  7 down, none held. No Season, Full Hand or Lean card (calls EN6-4, EN6-5).
- **Bounty (12:02 #5):** off the Beaver Lumberjack, which gets On Ready: gain 1 Lumber (stays 4/4; call EN6-6). Kept on the loot carriers: the
  raccoons and Trash Panda, Riverside Peddler, Pack Mule, The Magnate Duck, Chipmunk Stockpiler (call EN6-7).
- Engine: the EN6 block (`EN6_STATES` beside EN5's in `condStatsOf`, `en6HandAtk`, `en6HibernateSync`, `en6RoundStart`); events `season`,
  `statusFx hibernate`, `heal {cause:'hibernate'}`, `brambleShot`. card-matrix golden diffs expected from the 15 re-fitted / changed cards.
  Texts in the 12 packs (`tools/i18n_2026_10_24_en6.py`). Tests: `tests/en6-2026-10-24.js`, `tests/e2e/en6_2026_10_24.py` (shots `docs/screens/EN6/`).

## 2026-10-24 (package RW6: results without locked chips, Base cards as cards, PRO fights on the map)
- **Results:** the lock + card + rank emblem chips for rewards your rank was too low for are gone from the post-fight list (owner 12:02, #1).
- **Base cards:** a Base card won (Sheep and the rest) is a normal card tile in Cards won, hover shows the card; the "spare copy ... feed it in the Forge" chip is gone (#2).
- **PRO fights on the map:** with Admin Mode on, each main map with PRO fights shows them as small gold trophy nodes beside its boss, labelled N-PRO-k; a tap starts the fight (free, no rewards, as from Admin's list). Not shown to players (#3).
- Tests: tests/rw6-2026-10-24.js, tests/e2e/rw6_2026_10_24.py (shots in docs/screens/RW6/).
## 2026-10-24 release 10-24c (batch: BAL2, DF3)
- Enemy levels on the owner's schedule (a new level first in a map's hardest fights), enemy decks within copy limits, ambush decks 16-20, Rares from Map 10 (Map 5's is the boss leader), Map term 0.2 with a re-fit, base cards stop at Lv 4, own first-clear card 10% on repeats, notice rates, Bounty 2.5; Caldera Wyrm placed; 18-A-5 retuned.
- Selfish boons (12) on 19 challenge fights with a red Theirs card; Maps 7, 11, 14 retuned toward target.
- Checks: full unit tier, no new failures against 10-24b (6 old failures fixed); ui_smoke 0 failures; flows 0 issues; card-matrix golden refreshed.
## 2026-10-24 (package EQ2: equipment durability, Dive, Bolster and the Health bar, Parasite, the Beak Strike and two guardian raiders)
- **Equipment durability (EQ-1, call EQ2-1):** every piece has durability, its card's own (`equip.durability`) or by rarity: Common and
  Uncommon 3, Rare to Super Rare 4, Epic and up 5. A hit on the wearer takes 1 (swing, shot, bolt, raid smack, a floor's burn; a status tick
  is no hit), an acid hit 2, each Corrode applied 2. At 0 the piece breaks and leaves play; its Attack, Health (never below 1) and skills come
  off. A dropped or stolen piece keeps its wear; one worn out by the killing blow breaks instead of dropping. The carried piece now sits on
  the card's left edge with a column of pips (the last one red); a break shatters it off with "💥 Broken!". An equipment card's details say
  its durability. Price: `bramblewood-budget.js` `equipLifeMult` (min(durability, 4) / 4; x0.75 Common / Uncommon); no card changed
  (`docs/balance/eq2-equipment-2026-10-24.json`, `tools/eq2_equipment_2026_10_24.js`).
- **Dive ⤵️ N (N21-5, call EQ2-2):** once a fight, the swing dives on the weakest enemy unit of the row it faces (past any Taunt) for N more;
  a diving Flyer is exposed (no Flying dodge) for the rest of that round. Only a Flyer, a Tide unit or a Sprinter dives. No move (the
  simplest form of the ramming proposal's option C). The card swoops; the log says so. Priced 0.75 a point; on no card yet.
- **Bolster 🫧 N and the Health bar (N21-7, call EQ2-3):** N temporary Health (default 2) as each round's fight begins, spent first, gone
  at the next round's start. A unit with bonus or temporary Health shows a bar above its numbers: printed Health green, bonus Health gold,
  temporary Health pale blue. Priced 2.5 a point. Plain Crepuscular is unchanged (CX2 and the 10-23 #4 default are later than the example);
  Crepuscular – {+1/+0}{Bolster 2} works per card.
- **Parasite 🪱 (the 10-21 note, call EQ2-4):** played onto an enemy unit in your reach (held, those units light up pink), it rides its host
  (no slot, can't be hit), waits its Wait, then feeds each round (its Attack as a flat hit, healing as much); it drops onto your side when
  the host dies (if the slot is free). The CPU uses it. New card **Clinging Leech** (Uncommon, 4/9, awaiting a source). Priced 1.
- **Raids (N22-12, call EQ2-5):** a single-target raid attack (`pattern: 'single'`, in the raid editor): the Goliath Core's **Beak Strike**,
  3 to your unit with the most Attack every 2 turns; a Guardian beside it (left, right, in front, behind) takes it. Two tanky Guardian raiders
  in the Forge's Raid tab: **Barnacle Bulwark** (Rare, Guardian + Armor 1, 2/21) and **Reefback Turtle** (Very Rare, Guardian + Shell 2, 2/20).
- Engine: the Package EQ2 block (`EQ2_DEF`, `eqDurMaxOf`, `eq2Wear`, `eq2Bolster`, `eq2DivePick`, `parasiteTargets`, `eq2ParasiteTick`,
  `eq2Drops`); new events `equipWear`, `equipBreak`, `tempSoak`, `dive`, `parasiteAttach`, `parasiteDrain`, `parasiteDrop`, `raidStrike`.
  card-matrix golden diffs (new cards reshuffle the sampled duels; the new events in the histograms): 0 failures, to accept at release.
- Texts in the 12 packs (`tools/i18n_2026_10_24_eq2.py`); skill prices `tools/eq2_skill_costs_2026_10_24.py`; cards
  `tools/eq2_cards_2026_10_24.py` + `tools/eq2_cards_fit_2026_10_24.js`; `canonical/unit-themes.json` regenerated. Tests:
  `tests/eq2-2026-10-24.js`, `tests/e2e/eq2_2026_10_24.py` (shots in `docs/screens/EQ2/`).

## 2026-10-24 (package DF3: selfish boons on challenge skirmishes; DF-4 retunes Maps 7, 11 and 14)
- **Selfish boons (DF-3, narrowed by your 22:23 #6):** a field effect that helps the enemy only, on while at least half the enemy deck as dealt
  shares its theme (so copying the deck gains nothing). Its Environment card has a red frame, a red "Theirs" ribbon and the count ("On: 16 of 16
  enemy cards share the theme"); it shines red and the helped unit glows when it acts; the log says "Blind Fury helps the enemy: …".
  12 boons, each a synergy rather than +stats, reusable in similar biomes and raids (Edit skirmish and the raid editor list them): Blind Fury
  (Cave: a unit fighting blind hits 2x), Hive Chorus (Insect: Swarm counts allies twice), Rising Tide (Tide: Quick at Flood), Second Burrow
  (burrowers: the first death goes back to the hand), Wild Rage (Rage at 3/4 Health), Snow Veil (cold: Evasive 2 in 3), Sand Veil (Desert:
  1 in 2 misses in a Sandstorm), Restless Dead (Undead: Revive at full Health), Ember-born (Volcanic: immune to heat), Siege Train (Siege x2),
  Venom Glands (Reptile: Poison x2), Sky Ambush (Flying: Quick). Worth by the 4-round rule: `docs/balance/df3-boons-2026-10-24.md`.
- **Only on challenge skirmishes** (a "⚔️ Challenge" pill in the fight panel), never a normal skirmish, an elite or a boss: 5-3, 8-5, 9-4,
  12-3, 13-4, 16-3, 18-4, 20-4, 22-5, 23-5 on the main road; 5-A-2, 7-A-2, 8-A-3, 10-A-2, 11-A-1, 17-A-1, 18-A-3, 19-A-3, 20-B-1 on side
  maps (none on the Eye of the Volcano, elites only, or the Canopy). Each has a deck built on its boon's theme inside the deck rules, its leader
  kept (`tools/df3_boons_2026_10_24.js`), aimed 10 points under its road-curve slot (call DF3-1); 13-4 is one Enemy level up (DF3-2).
  Measured with and without the boon (200 games, `docs/balance/df3-boons-2026-10-24.json`): the boon is worth 28 points on 8-A-3, 27 on 8-5,
  23 on 7-A-2, 16.5 on 5-3, 8 on 17-A-1; Rising Tide 0 (call DF3-3); Maps 16-24's challenges stay at 96-100% (the DF-1b gap).
- **DF-4:** Maps 7, 11 and 14 retuned with deck moves only (leaders kept, no Shield): map means 51.2 -> 67.8% (target 69.2), 42.9 -> 68.4%
  (71.5), 58.0 -> 66.9% (70.6). `tools/skirmish_pass.js curve --keep-leaders` (new: keeps a fight's leaders and keeps other fights' reward
  cards out). Five fights still under their band: call DF3-4.
- Engine: `rules.boon` (side B; `boonState`), `boonFire` events; no boon, no change (a seeded match plays the same; Maps 7 / 11 / 14
  measured identical to BAL2 before the retune). Texts in 12 packs (`tools/i18n_2026_10_24_df3.py`). Tests: `tests/df3-2026-10-24.js`, `tests/e2e/df3_2026_10_24.py` (390 and 1366,
  `docs/screens/DF3/`); `tests/keywords-2026-10-16b.js`, `tests/field-effects-2026-10-16.js` and `tools/lead_2026_10_23.js check` follow the
  boon group and DF-4's re-decked fights.

## 2026-10-24 release 10-24b (batch: BV, EN5, NE, TT, PRFIX)
- Board visuals (wind turn, tide, camera, castle drop, smoke, pack shine, night water, squashed cards, snail shields), Breach, Canopy Cover, Timbered/Bedrock/Forged/Last Stand, Bleed/Poison curve, Bloom chains, Deadly Poison, Group Dungeon people; Nest/Camp/Codex/deck editor; Triggers lesson.
- Release fixes: tests follow NE and TT (the Triggers lesson pauses a fight until Next/Skip); disk cleanup (old worktrees) ended the browser crashes.
- Checks: full unit tier, no new failures against 10-24a after the test updates; ui_smoke 0 failures; flows 0 issues; pr 33/33; card-matrix golden refreshed.

## 2026-10-24 (package PRFIX: the PR test follows TT's Triggers lesson)
- **No game change.** `tests/pr-2026-10-23.js` failed 2 checks on batch-1023e (a repeat 0-1 win whose drop roll hits paid nothing; Map 1 not
  open after Map 0). Both were the test's: TT's Triggers lesson pauses the fight on its first trigger chip (as TT intends) and the test never
  pressed Next, so a fight whose hand drew a trigger card never reached its rewards. The test now marks the lesson seen (`skipTriggerLesson`).
  The drop on a repeat win and Map 1 opening after Map 0 both work.
## 2026-10-24 (package BAL2: the balance pass)
- **Enemy levels by the owner's map (10-23 20:44 / 22:23 #1):** Lv 5 at Map 20, 7 at 40, 8 at 60, 9 at 80, 10 at 100 (with Lv 2 / 3 / 4 / 6 at Maps
  5 / 10 / 15 / 30 between them), the mega boss Lv 11. A level arrives in its map's hardest fights first (the boss, mini-bosses and elites; also the
  last skirmish or two when the level before waited 10 maps or more) and spreads to every fight a few maps on. Maps 0-1 and 2-4 stay as the owner
  set them. `roadEnemyScheduleLevel`, `roadFightHardness`. LEAD's 57 per-fight Enemy levels were re-based keeping their strength (owner call BAL2-1).
- **Enemy decks follow the copy limits** (22:23 #4): the 6 road decks and the Long Burrow's floors that held too many copies are fitted (an excess copy
  goes to a card of the same deck); the ambush deck holds 16-20 cards (#5).
- **Rares (22:23 #2):** Map 5's only Rare is its boss's leader (the Alligator Gar left 5-4, 5-5, 5-6); no normal skirmish holds a Rare before Map 10
  (6-4, 7-3, 8-4, 8-5, 8-6, 9-3, 9-4 re-decked with the map's Uncommons, 2 copies of the new leader), nor a Very Rare before Map 15 (10-5, 13-4).
  `roadSkirmishCap` (main road; side maps keep the older steps, BAL2-2). Battle ratings: `docs/balance/bal2-decks-2026-10-24.json`.
- **DF-1:** the budget's Map term is 0.2 a map again; a card's map is the first main-line map it can be had on (a reward there, or out of the pack
  that map pays: Pack 1 Map 0, Pack 2 Map 7, Pack 3 Map 14). `canonical/card-obtain-maps.json` regenerated; 254 cards on their line rose to the new
  one, 36 over the new budget went down, 10 big cuts held (BAL2-5). `tools/bal2_refit_2026_10_24.js`, `docs/balance/bal2-refit-2026-10-24.json`.
- **DF-2:** Base cards stop at Lv 4 and pay the full Forge cost (the Forge says so; no limit break or Prestige for them); a skirmish's own first-clear
  card drops 10% of its repeat wins, any rarity. The grind to each Forge tier is in `docs/progression-plan.md`.
- **RW3-2:** SS notices about once a month and SSS every 2-3 months for a full-clearing player (SS 0.8% -> 0.5%); the SS / SSS tickets go back to 60% /
  100% so the two cuts don't stack.
- **N22-10:** Bounty re-measured on randomised Lumber / Wait units: 2.5 a point (was 3); four Bounty cards rose a point; Bounty 2+ measures less than
  Bounty 1 (BAL2-4).
- **T21-2:** the Caldera Wyrm is now the 20-B-4 leader you get for clearing it (4/7 at Level 1, its 29 lost Health on that bramble); 18-A-5 Vulture
  Road retuned 96% -> 82.5% (the whole Pale Desert sits at 94-100%, BAL2-3).
- **T21-4:** `tests/card-pass-2026-10-19.js` and `tests/shield-call.js` test today's rules and pass; the notes above `cardRewardRankFor` say the rule
  of today (S cap, SS for challenge cards); `rarityIntroMap` reads the main-line reveal (Epic 22, Heroic 25). Stale checks in level-curve, side-maps,
  gd, gd2, rw3 and forge-curve updated with dated notes.
- **The road (Maps 0-24):** 31 of 179 fights green (29 before BAL2): `docs/balance/bal2-road-2026-10-24.md`. New test `tests/bal2-2026-10-24.js`.

## 2026-10-24 (package TT: the Triggers lesson)
- **A tutorial for triggers (owner 13:16 #4):** the first time a card with a trigger is in your hand or on the field (the enemy's too), play pauses
  on a spotlight over its trigger chip (⚡ → what it does). Step 1: what a trigger is (left says when, right says what; rest the pointer on it to
  read it). Step 2: the moments, with the game's own names: On Spawn, On Attack, On Hit, On Attacked, On Kill, On Death, On Turn Start. Each step
  has Skip and Next / Got it; it never repeats. Skip also ends the two later trigger tips (grey / lit). It comes after the Pitching lesson, never in
  the Tutorial or Sandbox.
- **It is a coach tip, not an NPC talk:** it uses the same bubble and spotlight as the other lessons, so a map tile is never held back while it is up
  (MAP-3); it locks nothing in the fight.
- **Replay:** a "🎓 Triggers lesson" button in the Skill Codex's bar clears it to play in the next fight with a trigger chip. The Skill Codex opens
  on Map 9; where all lessons should be replayable from is call TT-1.
- Texts: `coach.tl-what`, `coach.tl-when`, `ui.tl-replay*` in 12 packs (`tools/i18n_2026_10_24_tt.py`; the trigger names reuse each pack's own chip
  words, English where a pack has none), and "Next ▶" had no translation until now. Tagalog, Tamil, Japanese and Korean deserve a native read.
- Tests: `tests/tt-2026-10-24.js`, `tests/e2e/tt_2026_10_24.py` (390 and 1366, shots in `docs/screens/TT/`).

## 2026-10-24 (package NE: the Nest, the Camp's copy fan, deck slots, the Codex's copies, the fight panel, the pack viewer, filters reset)
- **What you hold where you spend it (17:01 #9):** a "You have" row of the currencies a place spends: the Nest (Maple Leaves, Dust, Kibble), its
  subwindow, the Tavern (Maple Leaves, Dust, Beer) and the Camp's deck slots (the Shop, Forge and Profile had one).
- **The Nest (#10, #11, #26):** a locked nest says only "Locked for now" (no map number, also in Upgrades); tapped, it shakes and shows "Locked for
  now — progress further". Tabs are 🪺 Hatchery | ⬆️ Upgrades; an empty nest opens a subwindow with 🥚 Eggs | 🌱 Younglings (the Level 0 cards, renamed).
  A Nurse swap never changes what is already growing (the hatch time is fixed when it is set; tested), and the Nest says so (call NE-1).
- **The Camp's card pool (11:15, 17:34 #17):** the "2/3" chip shows only while Shift is held (a "⇧ Hold Shift: copy limits" button says so and
  toggles it on a phone); the leader counts as a copy (Wandering Traveller as leader: 1/3); a card that can't take one more is greyed. One stack
  per card with a copy fan: a click adds your best copy; hover or a long press fans out every copy (level, foil / Shiny / alt art), a fanned copy
  goes in exactly (the deck remembers it and fights it at its own level), copies in the deck are greyed (call NE-3).
- **Decks (#13, #19):** each open deck slot is an empty leather deck case the size of a deck preview (tap: a new deck there; a newly opened one
  stitches in). The deck card's type emojis are large, on its right; the editor's Main deck tag has "You play with this one".
- **Navigation (#21):** 🗺️ Conquest map leads the places bar (Camp, Grounds, Codex, Forge, Nest, Inventory); Home is the 🏠 icon alone.
- **The Codex (#12, 19:27):** a card's detail shows every copy you own as a small card, by treatment; tapping one shows its level. Entering any page
  clears every filter (the sort and the view stay; call NE-2).
- **The fight panel (11:26):** the field is a row of pills in the head under the BR (no "Field" block); the bramble's Health is a pill like the BR;
  one left edge for the rows; less room above the deck preview.
- **Shop and packs (19:27 #12, #13):** tapping a shelf item scrolls the counter (×1 / ×10, Open) onto a tall phone's screen. A card from a pack opens
  with the big card on the left and its details (abilities, flavour, where to get it) on the right (below on a phone), flying in from the card tapped.
- **Guardian step-in (EN5's find):** the card itself is tweened over 200-300 ms (was a 120 ms tween of a plain object that could finish between two
  frames at 3x: 113-118 px jumps in tests/e2e/snaps.py on 4-5).
- Tests: `tests/ne-2026-10-24.js`, `tests/e2e/ne_2026_10_24.py` (shots in `docs/screens/NE/`); dk, tu2 and pg updated for the new Nest tabs and pool.
  Texts: 22 TX keys, `tools/i18n_2026_10_24_ne.py` (12 packs; 17 removed UI rows dropped).

## 2026-10-24 (package EN5: Deadly Poison, Breach, Canopy Cover, state skills, Bleed / Poison by measurement, Bloom chains, tutorials first, people in the Group Dungeon)
- **Deadly Poison (owner 02:59 #3):** Greater Poison is called Deadly Poison everywhere players read it (skill, status, tips, log, Pulse's texts, 12 packs);
  the key stays `greaterPoison`.
- **Breach 🧱 N (02:59 #6, name EN5-1):** every landed melee hit on a unit also deals N to the enemy bramble (a dodged swing gives none); a brick
  chip flies to the bramble, which knocks back. Priced 1.9 a point (the robust test: Breach 1 / 2 worth 1.82 / 3.76). On the Beetle Battering-Ram
  (Breach 2, 5/12 -> 4/10) and the Badger Sapper (Breach 1, 3/16 -> 3/15). Puncture is the same rule (call EN5-2).
- **Canopy Cover 🌳 (FLY-1):** a ground unit dodges 1 in 2 single-target attacks under the trees: any fight on a forest-biome map (`rules.woods`, set
  for every fight there), the Old Woods terrain, High Canopy or the Undergrowth (40 of 267 conquest fights). One roll like Evasive; leaves spray off
  it. Priced as Evasive x uptime 0.4 on the stats (call EN5-3). On the Fawn Scout (Map 13, 2/9 -> 2/7).
- **State skills (03:12 / 03:12b):** 🪵 **Timbered – {…}** while you hold 3+ Lumber (default +0/+2), 🪨 **Bedrock** 2+ Stone (Armor 1), 🔩 **Forged** 1+
  Metal (+1/+0), 🏳️ **Last Stand** while your bramble is at a third of its Health or less (+1/+1). Stone and Metal are the fight's own counts. They
  turn on and off with the state: a ring and a float as one turns on, a lit gold pip while it holds. Priced default x uptime (0.5 / 0.3 / 1.0 /
  0.6; braces x the same uptime; call EN5-4). Cards: Lodge Engineer (Timbered), Quarry Mole (Bedrock), Badger Trench Digger (Last Stand).
  In the card editor (plain = the default braces, a bare name), the skill lists and the Codex.
- **Bleed / Poison re-priced from simulation (BP-1, call EN5-5):** `tools/skill_test_robust.js --mono --multi`, N 1-4, units at a trial price so the
  decks stay off the floor (`--table`, new): worth with companions Bleed 3.5 / 6.2 / 6.6 / 6.3, Poison 2.9 / 5.7 / 5.9 / 5.4. Priced S(N) = 3.6 x
  N^0.6 and 3.0 x N^0.7 (new `pow` on an 'n' skill in `tools/skill_costs.js`): Bleed 3.6 / 5.5 / 7.0, Poison 3.0 / 4.9 / 6.5 (were 2.6 a point).
  EN4's "about 2 for Bleed 2" was a floor reading (those decks lost 97%).
- **Hemorrhage N (EN4-1):** N 0 by default (plain Hemorrhage adds no Bleed of its own); Hemorrhage N adds N after the doubling; priced 2 + Bleed N.
- **Bloom (BL-1, BL-2, 03:12):** the copy can bloom too (once per unit), and on a raid or Group Dungeon board it may grow in front or behind as well
  as left or right. Priced with the chain (p x (1 + q + q²), q 0.43). BL's held cards re-fitted, at most 1% over N (owner: "err on slightly
  overbudget"): Fungal Colossus 2/21 -> 2/14, Puffball Bombardier 1/10 -> 1/5, Lotus Frog 3/12 -> 3/6, Pond Algae 1/9 -> 1/7.
- **Re-fit (call EN5-6; `tools/en5_cards_2026_10_24.js`, `docs/balance/en5-refit-2026-10-24.json`):** 28 cards moved, 5 up, 23 down, none cut by a
  quarter or more (none held); Alley Cat and Poison Dart Frog have no legal line (already flagged).
- **Tutorials first (MAP-3):** a tutorial lesson (the coach tips and their spotlight, and the lesson scripts) never counts as an NPC conversation
  for blocking map tiles, and while a lesson is on screen no tile is held back.
- **Group Dungeon (AR3-6):** 👤 people: 👤👤 + two lighter and "2 to 4 players" on the dungeon card; in the lobby a lit 👤 per player, 🤖 per CPU
  ally, a dim one per free seat and "N / M".
- **tests/e2e/snaps.py** crashed on HEAD ("Cannot set properties of null (setting 'speedMult')"): the fresh profile's deck held cards it did not own,
  so the fight never started. The script owns its deck now; it then reports snaps at 1366 (phones clean), each one looked at an EN2
  Guardian step-in moving 13-48 px in a frame (call EN5-7).
- Tools and data: `tools/en5_skill_costs_2026_10_24.py`, `tools/en5_cards_2026_10_24.js`, `tools/en5_state_uptime_2026_10_24.js`,
  `tools/i18n_2026_10_24_en5.py`; `docs/balance/en5-bleed-poison-2026-10-24.*`, `en5-breach-states-2026-10-24.*`, `en5-state-uptime-2026-10-24.json`.
  Tests `tests/en5-2026-10-24.js`, `tests/e2e/en5_2026_10_24.py` (shots `docs/screens/EN5/`); `bl` and `en4` follow the new rules.

## 2026-10-24 release 10-24a (batch: DC3, HUB2, EN2, BL, HUB3, EN3, OPT, RW5, OPT2, EN4, PRO, MAP)
- Rules: Windy (Headwind skills twice, Tailwind = Quick), Boomerang (Speed 0, return path, throws on a miss), Guardian (steps in, no chain), Swarm by Type, live stats; Bleed/Poison order; Rampart, Bramble Armor, Hemorrhage, Greater Poison, Shore Up, Pulse; Bloom rebuilt; CPU lanes. New cards placed in Maps 1-18.
- Rewards: packs by map range, faction pool and pattern, end-of-map packs, Collector packs, speed unlocks, admin resource buttons, guild shop.
- Map: resume where you left off, floating ambushes, raiders once, locked tiles, admin bramble editor. Hidden N-PRO-k fights (admin, editor, #pro= link).
- Hub: Upgrade costs, Progression plan, Resources, Deck optimizer tabs; decision sweep. Tools: deck optimizer (tools/opt, exe, GitHub Action).
- Server: AR3-6 applied (2-4 player online co-op rooms).
- Checks: full unit tier, no new failures against release 10-23d (4 stale tests updated, two-player test fixed); ui_smoke 0 failures; flows 0 issues; card-matrix golden refreshed.
## 2026-10-24 (package BV: the wind turns, one leader arrival, the Flood's high side, brambles drop into the ground, smoke, camera and freeze fixes)
- **The wind turns (owner 17:34 #1):** no more swirl. When the wind changes direction, a few of the wind lines already on the board slow and
  draw in to a point, rest a beat, then draw out the other way and speed off as the new wind fades in (`FX.B.windTurn`).
- **One leader arrival (17:34 #16):** the CPU's leader falls in from their hand once; the throne moment (banner, ring, beam, crown) starts as
  it lands instead of dropping it a second time. Root cause: the throne moment played its own drop 0.38 s after the normal entrance.
- **The Flood comes in calmly (17:01 #2):** no arrival swell and no second crest lift, and a settled Flood rests 12 px higher so its slosh no
  longer brings the front wave down into view below the top border and out again (the "bounce"). Each Flood picks its own high side, a tilt
  from -10 to +10 degrees (left, right or level); an Ebb leans by at most 10 px end to end (it leaned 5 degrees, 100+ px on a wide board).
- **One wind pip (17:01 #4):** a Flyer's wing and its Tailwind boot, or its wing and Headwind ×2, share one lit pill.
- **No jump and rubber band (17:01 #6):** root cause: the board's snap guard measured cards in screen px, so a camera zoom (the phone's one-step
  re-frame after a play) read as every card snapping; it pushed the whole board sideways by up to a card's width and glided it back. It now
  measures in the board's own px. The computer camera also no longer leans or turns toward the cards: it moves only to bring an off-screen card
  into view (owner call BV-1).
- **Brambles drop into the ground (19:30):** both sides' brambles fall the same way, a shudder, a crack along the foot, then straight down
  into the ground in a bank of dust with a few pebbles (`FX.C.castleSink`); the laggy cellular crumble is gone. After the fight a fallen
  bramble stays down on every redraw (`.castle-fallen`: its spot and a mound of earth), not back at 0 HP.
- **Smoke (19:39):** the Smoke Bomb is a fused bomb lobbed in a spinning arc that bursts into a ring of billows, pale for an ally hidden in
  Smoke, dark for a Blinded enemy, thin when it is sniffed off (`FX.C.smokeBomb`). Smoke on a unit is four soft billows curling over the card.
- **Pack summary (19:27 #1):** no stray glowing card off to the side. Root cause: the last card's flight to the little pile kept going after
  the summary had replaced the pile. Also no dangling "·" after "3 new cards!".
- **Water at night, bars and the day/night change (19:27 #20):** the River Rapids current is soft streaks at random places and heights
  (x0.9 to 1.1) at about a third of its old strength (it was evenly spaced stripes); dusk's shadow bars are 50% more transparent; the change
  between day and night is one gentle 10 s curve (the creep from the left is slow and faint, the old tint holds while the new comes in).
- **Squashed or stretched cards (13:16 #1):** root cause: a card hit and then swinging straight away had its squash cut off with its
  scaleX/scaleY left behind (the kill named only `scale`), so it stayed 1.07 x 0.90 or 0.97 x 1.04 for good. The kill takes them now, and the
  play-animation watchdog eases back any card face left off its rest pose with nothing animating it.
- **Armor pips (13:16 #21):** 1 to 4 shields overlap evenly inside their pip (they piled out to the left); 5 or more is one shield with the number.
- **Shield chip (13:16 #23):** a unit joining the board mid-round keeps its 💠 Shield (and Shell, Durian thorns) through the replay's redraws.
- **Enemy hand count on phones (13:16 #24):** inside their Deck's top edge, smaller; it was cut by the top of the screen (owner call BV-2).
- **Effects Lab:** before / after variants (labels "BV ·") on wt-wind-swap, wt-tide-flow, castle-crumble, sk-smoke-bomb, st-smoke-apply and
  wt-perma-tide. Tests: `tests/bv-2026-10-24.js`, `tests/e2e/bv_2026_10_24.py` (frame sequences at 390 and 1366; sheets in `docs/screens/BV/`).

## 2026-10-24 (package MAP: back where you left off, the floating Ambush, locked map tiles, an admin bramble editor)
- **Back where you left off (owner 17:01 #1):** a reload or a new session on the same device opens the Conquest pane on the map you last stood on,
  with the pawn at its fight (no walk from Map 0). A map that is not open, a hidden daily dungeon or a corrupt value falls back to the old rules;
  MK's `healMapProgress` is kept. Kept in `bramblewood_last_map_v1` (this device; not in the cloud save).
- **The Ambush floats (17:01 #3):** it has no trail to or from it, is open the moment you see it and stays on the map for good. The fight it
  stopped (3-2, and so everything after it) is drawn locked, "Blocked by the ambush", until the Ambush is **won** (owner call MAP-1).
- **The raiders, once (17:01 #5):** "The raiders ran off with N Maple Leaves" and the loss itself happen on the first lost Ambush only (MAP-2).
- **Tiles that will not open (13:16 #19, #20):** while an NPC conversation is on, a map tile (spots, well, cave, curiosities, courier, wanderer)
  makes a dull knock and shakes instead of opening (MAP-3). The Quest Board waits for the Notices: a lock on the tile, a dull knock, a shake and
  a small "Locked for now" label; an NPC reply that would open the Notices does nothing before they are unlocked.
- **Admin bramble editor (13:16 #16):** in the fight panel the admin's bramble line (❤️ N) is a button that opens a small inline editor: Health
  (the number the panel and the fight use) and the bramble (its effect shown). Saved as `node.brambleHealth` / `characterId` through
  `saveNodeField`, like the other skirmish edits; "Back to the rule" clears both. No database change (the existing map-nodes row; nothing in
  `supabase/proposed/`) (MAP-5).
- **Tests:** `tests/map-2026-10-24.js` (55 checks), `tests/e2e/map_2026_10_24.py` (390 and 1366, shots in `docs/screens/MAP/`). Texts "Locked for
  now" and "Blocked by the ambush" in 12 packs (`tools/i18n_2026_10_24_map.py`).

## 2026-10-24 (package PRO: hidden PRO fights per map)
- **PRO fights (owner 00:28: "a special hidden skirmish in each map, with the best deck you could make ... Name them as N-PRO-1, -2 -3"):**
  7 fights from OPT2's distinct optima: Map 0 `0-PRO-1..3`, Map 1 `1-PRO-1..2`, Map 2 `2-PRO-1`, Map 3 `3-PRO-1`. Each is a skirmish of
  its map that is not in the map's nodes: never on the road, not counted for progress, no Energy, no rank, cards, XP or quest counts (a
  resumed one too); the results say so. Field = the value most of the map's fights have per rule, a tie the boss's (Map 0 Mist; Map 1
  day / night + Old Woods I; Map 2 day / night, Tide, Wet, Tideline I; Map 3 day / night, wind, High Crags II by the boss tie-break). Enemy
  at Level 1, the Smart CPU the decks were measured with, from Map 2 the deck's showcase card as leader.
- **Where:** Admin → 🏆 PRO fights (per map: field, gauntlet score, Elo vs PRO-1, leader, the deck, Fight and Copy link); the skirmish
  editor's "PRO fights on this map" row; the link `#pro=3-PRO-1` (after the tutorial; the hash is cleared). Shots `docs/screens/PRO/`.
- **Data and tool:** `canonical/pro-skirmishes.json` (baked in by `assemble_arena.py` as `PRO_SKIRMISHES`), kept by
  `tools/opt/pro_skirmishes.js` (dry run by default, `--apply`): PRO-1 is replaced only by a deck beating it 55%+ over 400+ games with
  the interval above 50%; more PROs within 100 Elo and 6+ copies apart, at most 4 a map; head to head under the PRO's own field, seeded.
  Routine in `docs/workflows/balance.md` ("PRO fights"). `deckopt.js` exports `mineFor` and `playOne`.
- **Tests:** `tests/pro-2026-10-23.js`, `tests/e2e/pro_2026_10_23.py`. `tests/opt-2026-10-23.js`: the Base-card check reads the plan
  (RW5 made the Voidfeather Scout a Map 5 faction card); the resume check now says whether the run resumed and which part differs.
- Owner calls PRO-1 (reveal after a map's boss, default No), PRO-2 (a win's reward, default nothing), PRO-3 (re-run the optimizer on
  today's cards first: the decks predate RW5 / EN4, e.g. the Ember Tetra 3/7 -> 2/6). Texts in 12 packs.

## 2026-10-23 (package EN4: no Guardian for a Guardian, Hemorrhage, Greater Poison, Shore Up, Pulse, six new cards, RW5's held cards)
- **Guardian (22:23 #9: "Guardian shouldn't intercept an intercepting guardian."):** EN3's one hop is reverted. One Guardian steps in for the
  ally and takes the swing; the Guardian beside it doesn't cover it. Kept from EN3: no guard line, never the bramble. The hit has no
  `guardChain`; the board's `en3GuardChain` is gone; Guardian's text says so (12 packs). Call EN4-5 (a Guardian aimed at directly is still
  covered, as before EN3).
- **Bleed / Poison payoffs (22:23 #7; already there: Hunter (Bleeding), Venom Pulse):** 🩸² **Hemorrhage**: its landed swing doubles the Bleed
  the target already has, then its own Bleed adds (name and order: call EN4-1); the card pulses red twice and two drops split off.
  💀 **Greater Poison N** (1 by default): its swing that gets through turns ALL the target's Poison into Greater Poison and adds N; its own
  Poison then lands plain for the next hit to turn. A Greater Poison stack deals 1 a round and never wears down (owner 23:45, EN4-2 done).
  Cure takes Poison first, then Greater Poison; Pulse ticks both; Hunter (Poisoned) counts it; Shed and Revive clear it. A violet 💀 pip
  beside the green ☠, its own line under the unit, its own tick.
- **Pulse (owner 23:45):** Venom Pulse is called 💉 **Pulse N** (default 1) and makes the target's Poison AND Bleed tick N more times at once.
  The Poison Tick action is retired (hidden; it reads as Pulse; a saved card on it migrates to Pulse with the same N; no card in cards.json
  had it). Priced: the Pulse action 1.3 a tick, Pulse 1 = 2.7 (was 2.1); no card carries it, nothing re-fits.
- **Shore Up (19:27 #4, option B):** 🛡️↔️ when it is hit and lives (a swing, a shot or a skill), the allies beside it in its row get Shield 1;
  a small shield hops to each. Braces while Waiting.
- **Prices (call EN4-3):** Hemorrhage 2, Greater Poison 2.5 (scale half), Shore Up 2.2, Pulse 1.3 a tick, by the owner's 4-round rule; `tools/skill_test_robust.js
  --mono --multi` (3000 games a setup, `docs/balance/en4-skill-test-2026-10-23.md`) read Shore Up 2.68 / 2.26 and can't price the two payoffs
  (their Bleed 2 / Poison 2 enabler decks lose nearly every game; side finding: Bleed 2 and Poison 2 read about 2 against their 5.2 there).
  `tools/skill_worth.js` gives the two payoffs their enabler.
- **Six new cards (call EN4-4), pack cards placed lightly in Maps 2-18:** 🦪 Oyster Bank (common, 0/15, Shore Up) Map 2; 🐦 Great Skua (common,
  2/6, Flying, Hemorrhage) Map 3; 🐸 Cane Toad (uncommon, 2/15, Poison 1, Greater Poison 1) Map 6; 🦈 Bloodscent Shark (uncommon, 5/13,
  Hemorrhage) Map 10; 🐂 Musk Ox Matriarch (uncommon, 3/16, Shore Up, Armor 1) Map 17; 🐍 Inland Taipan (rare, 4/11, Poison 2, Greater Poison
  1) Map 18. Fitted by formula with their map's term (`tools/en4_new_cards_2026_10_23.js`), emoji placeholders, NightCafe prompts in
  `docs/art/new-cards-2026-10-23-en4.md`; `card-obtain-maps.json` and `unit-themes.json` regenerated.
- **RW5's calls (owner 23:45; `tools/en4_rw5_followups_2026_10_23.js`):** RW5-3: Lodge Engineer to Lilypad Reach (opens at Map 6, Pack 1;
  3/14 -> 3/13), Mallard Marauder to Smugglers' Grotto (Map 7, Pack 2; 2/6 -> 2/5); the other eight kept (theme already right; Mudpuppy is
  9-4's first-clear pack card, so it stays a Kelp Mangroves card). RW5-7: the Mangrove Kingfisher (Rare) is 9-6's elite reward, not 9-3's
  skirmish reward; the Banded Sea Krait (Uncommon) moves from 9-5 to 9-3 (one Reef Shark in 9-3's deck for it) so Map 9 keeps a
  skirmish-exclusive card (`tools/map_divvy_2026_10_22.js` POOLS too). RW5-4: the Ember Tetra is a Pack 1 card of the Sunken Hollow (Map 4), 3/7 -> 2/6.
- In the card editor, the skill lists, the Codex (notes) and the log; texts in 12 packs (`tools/i18n_2026_10_23_en4.py`). Card matrix: the
  Guardian revert moves duels with two Guardians side by side (diffs, not failures; accept with `--update` at the release).
- Files: engine `redirectToGuardian`, `en4GreaterPoison`, `en4Hemorrhage`, `GP_PER_STACK`, the Greater Poison tick in `applyPoisonTicks`,
  `en4ShoreUp` (runCustomTriggers' On Attacked), Cure, Poison Tick, Hunter; `arena_app.js` EN4 blocks (`en4Vfx`, `en4LogText`,
  `en4StatusBadges`); styles in `arena_template.html`; TX `ui.skn-hemorrhage` ... `ui.en4-float-shore-up`; `tools/en4_skill_costs_2026_10_23.py`;
  tests `tests/en4-2026-10-23.js`, `tests/e2e/en4_2026_10_23.py` (shots `docs/screens/EN4/`); `tests/en3-2026-10-23.js` and its e2e follow the
  revert (dated notes). Decisions EN4-1 .. EN4-5.
## 2026-10-23 (package RW5: packs by map, the standard faction rewards, Level 0, Collector packs, 2× from Map 0, admin resources, the guild shop)
- **Each pack has its own cards, by map (#15, PP-1 default 0-6 / 7-13 / 14-20).** The Hedgerow Pouch sells only cards first found on Maps 0-6, the Tidemire Chest 7-13, the Highcrest Case 14-20 (a side map counts from the map that unlocks it; tier 4 after Map 20 is in no pack yet). No volcanic card is in the Hedgerow Pouch any more. `tools/rw5_pack_tiers_2026_10_23.js` set every basic-pack card's tier and map: the 39 cards with no map and no pool got one by theme, 31 more took the map of the pool that holds them, 18 whose map disagreed with the pools were re-pointed (10 held: 6 where re-pointing would put them over budget, 4 that are a map's first-clear pack card; call RW5-3), and 92 joined their map's pool. The base track, drops, raid claims and bundles read every tier (gated by your map). The Codex names each pack's section; the Shop says which maps each pack covers.
- **Faction rewards (#10, #11, PP-2 default).** The faction pool holds both sides, the shared cards and 1 copy of each Base card; a card's copies = the most a deck may hold. Set rewards (the tutorial, map milestones, every 8th first clear, achievements) follow C, C, C, U, C, C, U, C, U, R with the R skipped before Map 14, climbing a rarity once you hold 2 of each of your side's cards (1 of the other side's; call RW5-2); random rewards (the 🎁 token, faction packs) keep the gates. The tutorial pays faction rewards ×3, then ×3 again (C, C, C / U, C, C), instead of the fixed Otter / Hummingbird cards. Pacing as built (median of 20 seeds, `docs/balance/rw5-faction-pacing-2026-10-23.json`): otters first Rare Map 14, last standard Uncommon Map 15; hummingbirds 14 / 16; no Very Rare by Map 15.
- **The end of each map: a pack of 3 + 1 faction pack (19:36, on as call RW5-1),** new cards first, as are the set faction rewards and the card drops (19:36: "only give 1 per card"). Bought packs stay random.
- **New cards in Maps 1-9, lightly (22:23 #10, call RW5-8):** Briarback Hedgehog (Map 1), Dam-Keeper Beaver and Pond Algae (Map 4), Moat Snapper (Map 5), Barkplate Beetle (Map 7), Ironclaw Fiddler (Map 9) are pack cards of those maps now: bramble protection, the first Bloom card, Tide. The faction Rare stays at Map 14; one normal-skirmish Rare before Map 10 is listed for you (RW5-7).
- **Level 0 (PP-3 default):** only the tutorial base and the babies start at Level 0; the Bee Knight and Forager Ant start at 1, and new faction copies come at their own level (TU2's Level 0 copies off).
- **Data:** the 8 Hummingbird cards that came "from the start" are in the faction pool; `ember-tetra-3caj` is `ember-tetra` (its live row skipped; `supabase/proposed/20261023_rw5_clear_ember_tetra.sql` on "apply it"; its source is call RW5-4). HUB3's mistakes list re-checks itself and ticks what RW5 fixed.
- **Collector packs (#14)** (were "Advanced"); Refine steps cost 10% more (call RW5-6). **2× (#18)** opens with Map 0 cleared, the next fight says "2× unlocked!", and your speed is kept from fight to fight; 3×/4×/5× stay at Maps 20/40/60. **Admin (#10):** every resource to 99,999 or 0. **Guilds (#16):** the Rename Ticket shows in the Shop only for a guild owner, and the guild page has a 🛒 Guild shop; the Raid Ticket costs 400 Maple Leaves + 5 Gold Leaves (call RW5-5). **Packs (#13):** the bundle summary names its free level-ups (five on the line, all in the tooltip).
- Tests: `tests/rw5-2026-10-23.js`, `tests/e2e/rw5_2026_10_23.py` (shots in `docs/screens/RW5/`); `tests/card-pass-2026-10-19.js` reads a re-tiered pack source as kept (dated note). Texts in 12 packs (`tools/i18n_2026_10_23_rw5.py`).
## 2026-10-23 (package OPT2: the deck optimizer, logic first, at Level 1, with a difficulty ladder)
- **Tools only; nothing in the game changed.** `tools/opt/deckopt.js` 2.0 (owner 22:23, OPT-1..3).
- **Phase 2 is a logic-filtered list of 5-25 related cards a map** (OPT-1/2), each printed with its reasons; the rules are a small
  config, `tools/opt/phase2-rules.json` (biome / kin biome, terrain types, shared unit types and animal groups, shared skill families
  such as ranged skills on an arrow map, skill families the field rewards; never a later map's leaders, showcased, boss-only or boss /
  ender reward cards, strange cards, challenge cards or Map 40+ cards). `--candidates-only` prints the lists with no games.
- **The optimum at Level 1 first** (`--level 1` default), then a **difficulty ladder** (OPT-3): legal decks from the same pool at Elo
  gaps 600 / 450 / 300 / 150 below the optimum, sharing 6-18 of its 20 copies, measured head to head under the map's fields.
- **Several local maxima, reported**: GA restarts and niching, a new discrete coordinate descent (`--method descent`), the distinct
  optima (6+ copies apart) with their head-to-head; `--compare` runs both searches at equal game budgets on independent eval seeds.
- Game budgets (`--budget`) instead of generation counts, so runs reproduce exactly; per-stage checkpoints with `--resume` / `--redo`.
- Results for Maps 0-3: `docs/balance/opt/opt2-summary-2026-10-23.md`. Tests: `tests/opt2-2026-10-23.js`, `tests/opt-2026-10-23.js`.

## 2026-10-23 (package SKD: design restrictions in the skirmish tuning guide)
- **The hub's Design tab now lists the rules we set ourselves** (owner 21:07). `docs/skirmish-tuning-guide.md` has a new section near the top, "Design restrictions we set ourselves": 11 groups (deck shape, leaders, rarity by map, enemy levels, brambles, field effects, rewards, theme, road structure, win-rate bands, CPU), each rule with its decision id or owner note and, where code enforces it, the constant. A last list names where dated docs and code disagree. No code or card changed.
## 2026-10-23 (package EN3: Bleed bleeds first, a Boomerang thrown on a miss, a Guardian for a Guardian, Rampart and Bramble Armor, Bleed / Poison and Bulwark re-priced)
- **Bleed and Poison: the damage first, then the stack (19:27 #5):** Bleed lost its stack at each round's START, before the unit acted, so Bleed 3
  dealt 2 + 1. It now fades at the round's END (`bleedFadeAtEnd`), for a unit that started the round Bleeding or bled in it: Bleed 3 deals 3, 2, 1. A stack
  that lands after the unit's last action waits a round; a Waiting unit still loses 1 a round; Festering holds it. BL's grey 🩸 drop is kept (it plays at
  the round's end). Poison's engine tick was already the whole stack then -1; the board now drops the badge and the grey ☠−1 about half a second after
  the damage float (it showed both at once). Texts (`ui.st-bleed`, `ui.ls-bleed`, the Bleeding tip) say "then −1 stack at the round's end". Call EN3-2.
- **Boomerang throws on a miss (#7):** a Blind or dark miss and a dodge throw too (a Blind / dark miss used not to throw at all, and no miss showed the
  throw); the boomerang flies just past its target and comes back next round as built in EN2. New event `boomerangThrow {miss}`.
- **A Guardian for a Guardian (#8), no guard line (#19):** a Guardian adjacent to the Guardian that stepped in takes the swing in its place (one hop;
  call EN3-3); the hit carries `guardChain`; on the board both step in ("🦺 Covered!"). The dashed line from the attacker to the Guardian is gone
  (FX.A.guardPull swapped in arena_app.js; its shield still pops in).
- **Guardian and the bramble (#2):** unchanged (Guardian guards adjacent allies, never the bramble); its texts now say so. Call EN3-1 (default No).
- **Two new bramble skills (#3; names: call EN3-4):** 🚧 **Rampart** takes ceil(half) of each unit-dealt hit on its bramble (5: 3 and 2), the one
  nearest the attacker's column when there are several; the field's own bramble damage isn't shared; a gold streak runs from the bramble to it.
  🌿🛡️ **Bramble Armor**: the bramble takes 1 less a hit, after Rampart; several still 1 (call EN3-5); a shield ting on the bramble. Supreme crushes
  both. In the card editor, the skill lists, the log and the Codex; texts in 12 packs. Measured with `tools/skill_test_robust.js --mono --multi`
  (3000 games a setup, `docs/balance/en3-skill-test-2026-10-23.md`): Rampart worth 0.44 (-0.13 with companions), priced 0.5; Bramble Armor 1.15
  (1.06), priced 1.1 (the owner's 20:44 logic, 1 Health a round for Bramble Armor, agrees). Rampart is on **Riverworks Bastion** (0/32 -> 0/30 by formula).
- **Four new cards (owner 20:44: "implement them in new cards"):** 🦫 **Dam-Keeper Beaver** (common, W1, Rampart) 2/11, 🐢 **Moat Snapper** (uncommon, W2,
  Rampart, Armor 1) 4/14, 🦔 **Briarback Hedgehog** (common, W1, Bramble Armor) 2/11, 🪲 **Barkplate Beetle** (uncommon, W2, Bramble Armor, Thorns 1) 4/14;
  fitted by formula (`tools/en3_new_cards_2026_10_23.js`), awaitingSource (proposed Pack 1 / Pack 2: call EN3-8), emoji placeholders, NightCafe prompts in
  `docs/art/new-cards-2026-10-21-briefs.md`, names and flavour in 12 packs.
- **Prices (#6, #9):** the Bleed / Poison family up to the next tenth, +0.1 where already on one: Poison and Bleed 2.5 -> 2.6, Gash 1.5 -> 1.6,
  Venomous / Poison Bolt / Poison Gas 3 -> 3.1, Rabid and Venom Master 5 -> 5.1, Proliferate 6 -> 6.1, Perforate 3.5 -> 3.6, the Poison / Bleed actions
  1.3 -> 1.4 and 0.9 -> 1.0 (Toxin, Detonate, Hunter, Poison Tick left: no wearing stack). Bulwark 6 -> 9. `bramblewood-budget.js` has no skill weights.
  Re-fit (`tools/en3_refit_2026_10_23.js`, `docs/balance/en3-refit-2026-10-23.json`): 66 cards' S moved; 3 band cards had room and went up
  (Ironmaw Warwolf 6/6 -> 7/7, Fire Ant Raft 2/7 -> 2/8, Whip Spider 3/7 -> 3/8); 13 that would drop are held at their stats (call EN3-6, as BF11-1);
  Poison Dart Frog has no legal line (merged into `human-pass-1-flagged-2026-10-21.json`).
- **Shore Up (#4):** not built; three proposals with price estimates in call EN3-7.
- Card matrix: against a golden regenerated on batch-1023e's engine, 1433 diffs (1345 duels, 70 squads, 18 matches), 137 winner changes, 0 failures;
  1309 of them have Bleed in play (the fade moved), the rest the re-fits and Bulwark. The stale golden reads 53872 (53566 before EN3).
- Files: engine `bleedFadeAtEnd`, `redirectToGuardian` (one hop, `lastGuardHop`), `rampartShare` / `brambleArmorCut` in `damageHQ`, the Boomerang throw on
  a miss; `arena_app.js` EN3 block (`en3Vfx`, `en3GuardChain`, `en3BoomMissThrow`, `en3RampartVfx`, `en3BrambleArmorVfx`, `en3PatchGuardPull`), the
  poisonTick replay, the editor rows; styles in `arena_template.html`; TX keys `ui.skn-rampart` ... `ui.en3-float-*`; `tools/i18n_2026_10_23_en3.py`,
  `tools/en3_skill_costs_2026_10_23.py`; tests `tests/en3-2026-10-23.js`, `tests/e2e/en3_2026_10_23.py` (screens `docs/screens/EN3/`); `bl`, `en2` and
  `poison-fx` follow the new texts and the poisonTick code. Decisions EN3-1 .. EN3-8.
## 2026-10-23 (package OPT: the deck optimizer, a tool that needs no Claude)
- **`tools/opt/deckopt.js`** (owner 20:44: "find the most optimum combination of cards given the typical field effect ... also finding cards in
  the whole spectrum ... a constructed exe"): per map, a genetic search with successive halving over the real seeded engine finds the
  strongest legal deck from the map's cards (+ what a player owns by then), fighting the map's fight decks and the reference decks in a fair
  mirror under each fight's field, plus the fights as the game builds them. Phase 2 (`--cross-share`, default 0.3, OPT-1) screens every
  other obtainable card as a swap and searches the whole list. Output per map in `docs/balance/opt/`: the best decks, win rates per
  opponent with 95% intervals, the field effects' impact, and each fight deck's gap to the optimum (Elo and win-rate points). Worker
  threads, deterministic seeds (same result on any worker count), checkpoints and `--resume`.
- **Without Claude:** `tools/opt/build-exe.sh` builds one executable (Node SEA); `.github/workflows/deckopt.yml` runs it on GitHub's free
  runners by hand and uploads the results. No game code changed; first results for Maps 0-3 in `docs/balance/opt/deckopt-summary-2026-10-23.md` (map cards + owned) and `deckopt-summary-2026-10-23-mapcards.md` (map cards only).

## 2026-10-23 (package BL: Bloom rebuilt, Nectar Vintner's Heal, default values, Bleed's fade)
- **Bloom – {conditions} (11:23, 17:34 #3 "Bloom hasn't changed"):** a new skill (`effects.bloomCopy`). Once, the first round its conditions hold at
  the round's start, a copy of it grows in a free slot beside it and the copy gains +1/+1 (19:30: "bloom only gives the new one +1/+1, not
  itself"; the unit is unchanged): its Attack and Health with every change made without counters, plus 1/+1, minus its damage, none of its counters or statuses, its printed Wait. The copy can't bloom and leaves no card behind
  (BL-1); with no free slot beside it the bloom waits a round (BL-2). New conditions: **Sunny** (day or Twilight, no Rain / Fog / darkness) and
  **Killed an enemy**; a Lumber price ("+ 1 Lumber"). A short bloom look: petals (spores for a fungus, a green film for an alga) drift into the
  slot and the copy opens out of a ring of light; "🌸 +1/+1" on the copy; the chip greys once spent.
  Cards: Fungal Colossus Bloom (Wet & Sunny + 1 Lumber), Puffball Bombardier Bloom (Wet & Killed an enemy) (a third skill, BL-4), Lotus Frog
  Bloom (Tide & Night) (was Bloom When +2/+2), and a new card, **Pond Algae** (Common Plant, Bloom (Wet & Sunny), 1/9, awaiting a source, BL-3).
  The old Bloom N heal and Bloom When are retired (hidden; the engine still runs them for old custom cards). The Open Meadow grants Healing 1,
  Wildpath's Pollen Drift adds to Healing.
- **Bloom's price** (`bramblewood-budget.js` `bloomOdds`): p = its conditions' odds (estimates, not measured) x 0.85, x 0.85 per Lumber; S = 3p
  (the copy's +1/+1) and cap 1's stat terms x (1 + p). Re-fit (`tools/bl_bloom_2026_10_23.js refit`, through `tools/refit_pass_2026_10_21.js`): the three
  down-moves are held at their stats (Fungal Colossus 2/21, Puffball 1/10, Lotus Frog 3/12; `docs/balance/bl-held-2026-10-23.json`, BL-5); the
  flagged list is merged, not overwritten.
- **Nectar Vintner (11:23):** Healing 1 instead of the old Bloom 1 (same price, stats unchanged at 1/1).
- **Default values (17:34 #4):** Diurnal, Nocturnal and Crepuscular default to +1/+0 (the card editor's default too). A skill at its default value
  has a bare name on its card line: "Diurnal — By day: +1/+0." (was "Diurnal +1/+0 — ..."); the same for every skill with a default (Fire Bolt 2,
  Full Moon 3, Pack 2, Cleave 1 ...). Other values keep their number ("Diurnal +1/+2").
- **Bleed's fade (17:34 #14):** the rule was already: the stack drops by 1 at the start of every round, whether it bled or not (Festering holds it);
  the texts now say so, and that Cleanse (not heals) removes it. As a stack fades, one greyed-out 🩸 drops from the card's Bleed pip to the ground
  under the card.
- Texts in 12 packs (`tools/i18n_2026_10_23_bl.py`); `docs/effects-catalogue.md`; tests `tests/bl-2026-10-23.js`, `tests/e2e/bl_2026_10_23.py`
  (screens in `docs/screens/BL/`); `tests/bf5-2026-10-21.js` lists the Puffball as a thematic exception.
## 2026-10-23 (package HUB3: the progression plan and the resources, in the hub)
- Hub only, no game changes. New tab 📚 Progression plan, next to 🗂 Units by theme, which links to it. It holds the owner's
  definitions of 19:27 / 19:36 (tutorial base, base, skirmish base, Packs 1-3, the faction pool, standard / set / random faction
  rewards, Collector packs, Pack Secrets I, Tavern cards, quest specials, Level 0, babies ...), written in `docs/progression-plan.md`.
  It also shows the targets against today's counts, every card sorted by advancement, 15 leftover mistakes with fixes (for RW5), the
  eggs and babies audit, the skills met in Maps 0-1, Ant cards, faction-reward pacing, the collection by map, and the balancing
  suggestions. Data: `node tools/progression_plan_2026_10_23.js` → `docs/balance/progression-plan-2026-10-23.json`.
- New tab 🪙 Resources: every currency, material and token (where it comes from, what spends it), a dedicated player's week at
  Maps 3 / 10 / 20, the road's first-clear totals, and the sessions to Gannet Cliffs and the Gatorback Swamp.
  `node tools/resources_week_2026_10_23.js` → `docs/balance/resources-2026-10-23.json`.
- Measurements for the suggestions: `tools/hub3_balance_probe_2026_10_23.js` → `docs/balance/hub3-probe-2026-10-23.json`. It
  covers Maps 0-1 with your bramble +5 / +10 and the tutorial-base cards at 80%, and the damage race on Maps 1-4.
  Test: `tests/progression-resources-2026-10-23.js`.

## 2026-10-23 (package DC3: the owner's 17:34 answers, and the easy defaults cleared)
- Decisions only, no code. `docs/decisions.json`: 9 of the owner's 17:34 answers recorded (PR-1, RW4-1, DF-1, DF-2, DF-3, RW3-2,
  TU2-3, A3, H1). At his request (#7, "clear all those easy defaults"), 22 more closed as "Default taken (DC3)": RW4-2..4,
  AR3-1..5, AR3-7..9, FX4-1..4, BF11-1, SX-2, LEAD-4, DF-4, D17, L1, S4. 9 stay open, each titled as one question: FLY-1,
  DF-1b (new: his play-through of Maps 16-24, split from DF-1), AR3-6, EQ-1, C1, G2, S3, A1, A2.
- A1 (owner 17:38) now lists the AI services that could help, free tiers and routers first (OpenRouter, LiteLLM, Google AI
  Studio, DeepL API Free, CodeRabbit, local models, image / sound / voice free tiers), with limits, accounts and sources.
- A3: the trailer's six Kling shot prompts and the 30 s cut, in `docs/art-style-prompts.md` ("Trailer (A3)"). Nothing generated.
- Build list in `docs/action-items.md` ("10-23 17:34: building"): DF-1's Map term (0.2 per map, pack cards from their first
  main-line map), DF-2, DF-3 with DF-4, RW3-2's notice rates, TU2-3's editable tutorial Health, H1's materia socket, AR3-9's port.
## 2026-10-23 (package HUB2: owner 11:11, "put the upgrade and forge costs in the master hub and let them be editable")
- No player-visible change: every card upgrade and Forge cost has the same value as before (checked against the old code).
- The cost tables moved out of `arena_app.js` into `canonical/upgrade-costs.json` (level road, rarity and card-kind multipliers, limit break and its duplicates, duplicate credit, the five Forge tiers, prestige rings, disenchant Dust, Materia Unit / bench, energy upgrade); `assemble_arena.py` bakes it in.
- Master hub: new 💰 Upgrade costs tab, every number an input, with live Lv 1-10 / limit break / duplicate totals per rarity. Edits save in the hub db (`upgradeCosts`); `node tools/fold_upgrade_costs.js edits.json` folds them into the file (`tools/hub/pull_upgrade_costs.md`). New test `tests/upgrade-costs-2026-10-23.js`.
## 2026-10-23 (package EN2: Boomerang, the CPU's lanes, Guardian, the wind, Swarm, live stats, the Ironclaw Fiddler)
- **Boomerang (13:16 #9, 17:34 #2):** the throw swings at Speed 0 (its hidden base of 1 is gone). A throw at the bramble flies on past it at the same
  speed; next round it comes back the same way: the bramble again, then the unit now in its lane, then home. With its thrower dead it still comes home
  and hits the card now in the thrower's slot (a Boomerang card catches it), else your bramble; the board now draws that flight (the engine always
  flew it; the board had no thrower card to draw from). Price 3 → **1.9** (Bananarang too): the robust skill test measured its worth 1.71 → 1.06
  (`tools/skill_test_robust.js --mono --skills boomerang --games 3000`). Re-fit: Otter Centurion 3/6→3/7, Howler Monkey 2/4→2/5, Net Thrower
  3/9→3/10, Otter Royal Guard 4/9→4/10; no card would go down. Call EN2-1.
- **The CPU's lanes (13:16 #2, #11):** measured first (`tests/en2-cpu-side-sim-2026-10-23.js`, `docs/balance/en2-cpu-side-*.json`): the basic and
  smart CPUs had no left lean; the smartest did (40.8% left / 33.3% right) through its ties. Built: the CPU's "anywhere" slot is weighted to the middle
  three slots and to slots facing or beside your units; the smartest adds a small middle bonus and breaks ties toward your units (else a coin).
  Smartest mean slot −0.18 → +0.01; contested placements +1.5 to +3 points; CPU win rate about −2 points. Call EN2-2 (a rule for both sides instead?).
- **Guardian (13:16 #22):** it slides in front of the ally it guards just before the blow, takes it there and slides home; if the blow kills it, it
  flinches and dies on that spot (the hit carries `guardedUid`). Its text says its reach (beside it; in a raid in front / behind; plain attacks only)
  and how Taunt differs; `docs/effects-catalogue.md` has the table.
- **Wind (17:01 #15, 17:34 #15):** Headwind doubles a Flyer's active skills only (Arrow and the other shots, Snipe, Archer's On Action), no longer
  every trigger. Tailwind makes a Flyer Quick for the round (Speed 2), no Fast Forward turn, so a Waiting Flyer still waits. Texts, badges and the log
  say so. Calls EN2-3, EN2-4. **Gannet Cliffs (Map 3), 300 games a fight** (`tests/en2-gannet-sim-2026-10-23.js`, `docs/balance/en2-gannet-*.json`):
  Starter deck 56.7% → 75.8%, Mid deck 58.0% → 82.4% (mean of the 7 fights; 3-4 Condor Thermals 29% → 47% for the Starter). The wind's own cost:
  before 16.5 / 15.4 points (the same fights with no wind: 73.2 / 73.4%), now 6.4 / 3.7 points (82.2 / 86.1%). The no-wind numbers rose too: the
  Kittiwake Flock's Swarm now counts only Bird-typed allies (below) and the CPU's lane weights cost it a little.
- **Swarm by Type (17:34 #18):** Swarm compares the Types a card lists (and the Types above them: Coral Reef is Ocean), never its species or animal;
  the hand's would-be numbers follow. Call EN2-6.
- **Live stats (17:34 #22):** a Swarm unit's Attack on the board now changes as each ally falls during the round's replay (it showed the round's end
  value throughout), and every swing puts the Attack the engine used on the attacker's plate (`liveAtk`). The armour case: 600 seeded fights of armoured
  units found no hit whose shown number disagrees with the damage dealt (deaths matched the hits plus Poison / Bleed ticks); the stale number was
  the attacker's shown Attack, which these two fixes cover.
- **Ironclaw Fiddler (13:16 #17):** new Rare crab with one huge claw: Lumber 2, Wait 3, Tide, Bludgeon, Armor 1, 7/12 by the budget. On play it sways
  side to side for 1 s while its claw clacks; its attack closes the claw on the target (card `fx`). Awaiting its source: proposed The Kelp Mangroves
  basic pack (Map 9; the pool and obtain-map rows are outside this package; then 7/13). Placeholder 🦀; NightCafe prompt in
  `docs/art/new-cards-2026-10-21-briefs.md`. Call EN2-5.
- Texts: 11 strings and the card's name / flavour in the 12 packs. Tests: `tests/en2-2026-10-23.js`, `tests/e2e/en2_2026_10_23.py` (screens in
  `docs/screens/EN2/`). Card matrix: 0 failures; 52,524 golden diffs (the new card shifts the sampled pairings; the throw's Speed, the wind, Swarm and
  the CPU's lanes change results), to accept at release.

## 2026-10-23 release 10-23d (batch: AR3, PR, FX4, RW4)
- Group Dungeon (AR3), Map 0's sure card on first clears only (PR), swaps/fields/Lava Waders (FX4), swap and reward screens (RW4).
- Release fixes: the swap window's mini-card star came back through the FX4 merge (removed again); two old tests follow RW4's code (item tip, NEW! tag loop); card-matrix golden refreshed.
- Checks: full unit tier, no new failures against release 10-23c; ui_smoke 0 failures; flows 0 issues; rw4 e2e passed.

## 2026-10-23 (package RW4: owner's 13:16 list, items 3, 5, 6, 7, 8, 10, 13, 14, 15)
- Swap window (#3): the two columns sit further apart (the several-swap rows too), the star on the mini cards is gone, the mini cards have a squarer
  corner, the "2/8 against 1/6" line is gone (a teaching swap still says what it teaches), "Better card!" is "Good Choice!", and hovering a card
  in the window opens its details over it (it was hidden behind the window). The faction pack's one-row "Swap Again" flow is unchanged.
- Swap rule (#15): from your first fight on Map 2 (2-1) a swap window opens only for a much better card: at least 35% and 2 points above the deck
  card by the stat budget (SWAP_MUCH_BETTER_MARGIN / _MIN_GAIN / _FROM_MAP; "as good in every stat" no longer counts alone). Maps 0 and 1 and the
  forced teaching swaps keep today's 10% rule.
- Map banner first (#5): a waiting swap holds while the new map's title banner is due or playing (at most 9 s), so winning 0-4 shows Map 1's banner,
  then the swap.
- Skills (#6): no "Skill revealed" popup. A skill a map opens wears a NEW! tag in the card details, one skill at a time; Crepuscular and Nocturnal never.
- First-clear box (#7, #14): hovering the Maple Leaves, Magic Dust, an item or a card token says what it is (packs already did). Items (Energy
  capsule, Raid Ticket, field-kit items) are bare icons, never a card shape, with no rank emblem, also on the results. Clicking the Energy meter shows
  the capsule count and a Use button.
- Eggs (#8): no toast; the results chip says "You got an egg!" and its hover "An egg! You'll need a nest to hatch it!".
- Reward dim (#10): the reward stage's dim is lighter and rises with the first card; after "New fight" tokens it no longer darkens the board before
  the results, whose own backdrop fades in as the stage fades out; the Victory sign's own dim is lighter too.
- "Possible drops" (#13): the card chance shows the card back instead of the joker.
- Owner calls in docs/decisions.json (RW4-1 to RW4-4). Texts: 11 new keys in the 12 packs. Tests: `tests/rw4-2026-10-23.js`, `tests/e2e/rw4_2026_10_23.py`;
  UI4's item-chip tip check now expects "name: what it does".

## 2026-10-23 (package PR: Map 0 repeat wins no longer always pay a card)
- Owner: "I played 0-1 5 times and got a card reward 5 times." Map 0's sure card (a Faction Reward, else a base-track card; the 2026-10-13
  rule "every win on Map 0 brings a card") is now paid on a fight's first clear only. A repeat win of a Map 0 fight rolls the normal card
  drop shown on its panel (3% for 0-1). First clears are unchanged (0-1 one card, 0-2 the faction pack, 0-3 / 0-4 their card).
- Checked, not a bug: 0-1 wins are recorded (one first clear, then repeats), and a cloud pull never undoes newer wins on the device
  (headless repro with a mocked row like the owner's newer account). That account's cloud row is old because it has not signed in since
  2026-10-22 15:18 UTC (no requests from it in the logs since); MK's healMapProgress opens Map 1 for a cleared Map 0.
- Test: `tests/pr-2026-10-23.js`.

## 2026-10-23 (release: batch 10-23c)
- Shipped together: LEAD, SX, BF11, BF12, DC2 (decisions sweep), MK (the map marker and the Map 0 self-heal) (entries below). FX4 and AR3 follow in the next release.
- Release checks: full suite as the 10-23b release (darkness-1013 and skills-sk2b now pass); keywords-2026-10-14's Rabid Jackal check follows BF11's re-fit (2/2); raid-rb and shields follow SX's template and LEAD's 20-A-4 shield. e2e ui_smoke 0 failures (a first run timed out loading the page under load; the rerun passed), flows 0 issues.

## 2026-10-23 (package AR3: the Group Dungeon, co-op for 2-4 players)
- Owner 10-23 00:10 #26 (AR-3: "This is a big pass. I like this. Can you launch a big pass for this."). D49 / D76 built. Calls AR3-1..AR3-9.
- **Where it lives:** the Dungeons tab's "Coming soon" Group Dungeon slot is the entrance: Open a room, Play with CPU allies, or Join with a
  6-letter code (invites from friends appear on the card). Players see the tab once the tutorial is done, holding only the Group Dungeon (and
  the Spire): the daily dungeons stay hidden (TU2), so no daily slots, keys row or 🗝️ button for them (`dailyDungeonsOpen` vs `dungeonsTabOpen`).
- **The Hollow Warren:** 4 floors of Hollow Kin country, live cards only: the Bat Roost; the Mole Galleries (cave-ins: the party's fuller row
  takes 2 each, every other round); the Salamander Pools (the centre cursed on even rounds); the Matriarch's Hall (the Hollow Matriarch, a
  fight-only copy of the Cave Warlord, who marks a column and strikes it next round). Health x1.7 for 2 seats, x2.8 for 4 (D49, CPU allies
  counted). A floor lost (or 20 rounds) ends the climb.
- **The room:** 2-4 players: the host in A (front left), then C (back left), D, B; a 3rd player opens the right half and B gets a CPU ally.
  Ready-up, leave (tap twice), the host's CPU allies, casual rooms (60 s). The host dropping hands the room to the next player in seat order,
  who carries the fight on; a player away is played by a CPU ally and gets the state back on return (in step again from the next floor).
- **The turn (D49):** everyone plans at once (30 s, 60 s casual): tap a card, tap a glowing cell of your half or the shared centre, or pitch
  one for +1 Lumber, then Ready. Plays land A, B, C, D, then the dungeon (its front row as a CPU, its back row from its own deck, as the
  raid's rows), then combat on the raid's multi-row board (both rows act). Two players on the same shared cell: who locked first takes it, the
  other card stays in hand, nothing paid. Each seat has its own deck, hand and Lumber; the castle is shared.
- **Netcode:** the Ranked Live host model, extended: the host runs the engine (seeded) and sends each round's plans with a state hash; every
  other player replays them on the same engine, so all screens match (a player out of step mirrors the host's state). Cards fight at Level 1.
  Transports: Supabase Realtime broadcast (online), BroadcastChannel (tabs of one browser), an in-memory hub (solo and tests).
- **Rewards:** each floor's chest per player (40 / 55 / 70 / 120 Maple Leaves, 10 / 14 / 18 / 40 Dust); the Matriarch offers a pick of 3 of
  the dungeon's own cards, once a day. 5 Energy a climb, back if no floor is cleared.
- **Server:** online rooms use the live `coop_rooms` (host + 1 guest) today. `supabase/proposed/20261023_coop_rooms_4p.sql` (NOT applied)
  opens 3-4 player online rooms (seats table, join v2, leave, host promotion) and private room channels; the page detects it by itself.
- Engine (opt-in, no other fight changes): `slotCols` bounds an Open board's columns; `placeCard(..., {freeSlot})` plays any free cell (front
  or reserve row). New: `bramblewood-coop.js` (rules, room, transports), `tools/coop_sim_2026_10_23.js`, `tools/i18n_2026_10_23_ar3.py`
  (114 TX keys, 12 packs). Tests: `tests/coop-dungeon-2026-10-23.js`, `tests/coop-lobby-2026-10-23.js`, `tests/e2e/coop_dungeon_2026_10_23.py`.
  Screens: `docs/screens/ar3/`.
## 2026-10-23 (package FX4: one swap row and Swap Again, Scorched Ground boils under one unit, Wildfire Front, one ground fire, field-number gaps, the Environment card that fires, Lava Tide half as often, Lava Waders, Guardian shields, Backstab's new targets, the starting deck's weak cards, Exit)
- The owner's 11:11 answers on UI4-3, FX3-1, FX3-2, FX3-3, EN-3, EN-5, EB-1 and the Tutorial's way out. New calls FX4-1 .. FX4-4.
- **Swap (UI4-3):** a faction pack's swap is one row again, in the one-card window's style: your deck card on the left (up to 3, ‹ › and
  thumbs), up to 3 pack cards on the right. Swap trades the pair (the cards cross over, "Nice!"); 0.8 s later **Swap Again** appears beside
  Done while a pack card still beats a deck card: the right side moves on to the next one, and a deck card already swapped out is out of the
  running. Was (UI4): a ticked row per pack card and "Swap N". First faction pack free, later ones one of the 10 offers, as before.
- **Scorched Ground (FX3-1):** one random unit a side again, 1 fire, every round from round 2 (fire-resistant units and Mountain Climbers
  never chosen). On screen the ground boils under the chosen card: a lava pool opens at its foot, bubbles rise, a heat haze, then the 🔥1
  (`groundBoilVfx`). Map 20's elite and boss fights and 22-7 carry it (call FX4-3: 1 or 2).
- **Wildfire Front (FX3-1, new field effect):** FX3's line of fire on its own (`rules.wildfire`): from round 2, every round, it crosses both
  front lines left to right and each unit takes 1 fire as the band reaches it, one card after another (`scorchSweepVfx`; events
  `wildfireSweep` / `wildfire`). Placed on **14-6 Jaguar Run** (Savanna Reaches, was Scorching I) and **20-8 The Iron Cataphract**
  (Sundered Peak, was Scorching III). In Edit skirmish and the Effects library. Its card borrows Scorching's picture. Calls FX4-1 (the
  name: Wildfire Front, or Grass Fire / Fire Line) and FX4-2 (how often).
- **One ground fire (FX3-2):** a fight with Wildfire Front drops the volcano's automatic Scorched Ground and any Scorching (`fightRules`; the
  engine also skips Scorched Ground where Wildfire Front is on).
- **Field-number gaps (FX3-2):** two field hits on one unit in one upkeep (a comet and a Lava Tide, say) float 250 ms apart (`FIELD_GAP_MS`,
  `fieldGapStamp`; faster at 2x / 5x), so both numbers read; the upkeep holds for the last one. A field hit now holds the upkeep 900 ms
  (was 650), Scorched Ground's boil 1.25 s.
- **The Environment card that fires (FX3-2):** when a field effect does something at the round's start, its card in the fight's header leaves
  the fan's tilt, lifts a little, a light sweeps across it, and it eases back into the fan 0.26 s before the upkeep ends (`envCardsFire`,
  `.is-firing`, `.env-shine`; reduced motion: a still glow).
- **Lava Tide half as often (FX3-3):** its odds are x0.5 at every level (Very Low 0.5%, Low 5%, Medium 10%, 1 in 2 22.5% rising, High 30%;
  engine `LAVA_TIDE_FACTOR` and the game's odds words); a fight's own Lava Tide chance is kept as set.
- **Lava Waders (FX3-3, new equipment):** Uncommon, Lumber 1, +0/+3 and **Fire Resistance** (`equip.grant {resist:['heat']}`: fire hits
  halved; Scorched Ground, Wildfire Front and Scorching pass the wearer by). Budget by formula, the grant counted as its skills: N 15.88,
  2A+H+S 4. Made at the **Blacksmith** (2 Iron Shards, 1 Ember Core, 1 Basalt Boar from the Sundered Peak; 300 Dust, 400 Leaves): packs and
  skirmish rewards never give equipment. Placeholder 👢, NightCafe prompt in `docs/art/new-cards-2026-10-21-briefs.md` (call FX4-4).
  Engine: a granted Resist / Immune list adds to the unit's own (`deriveDef`); the volcano's ground-fire check reads `effects.resist` too.
  The card reads "Fire Resistance" (`eqResistText`).
- **Bulwark Shields (EN-3):** the two shields Bulwark raises have **Guardian** (were skill-less).
- **Backstab (EN-5):** its +N also lands on a target still **Waiting**, **Shocked** or **Exposed**. Price unchanged (0.6 a point).
- **Starting deck (EB-1):** one Honey Bee and one Silver Minnow are back in the real deck after T-2 for variety (in its hidden places, still
  20 cards, one copy each); the **Sparrow Chick** is out (any saved tutorial config too) and is now a **Gannet Cliffs (Map 3)** basic-pack card
  (`source {pack, map mc}`, `canonical/map-pools.json`, obtain map 3).
- **Tutorial:** the start map's way out says **Exit** (was "↑ To Map 0").
- Effects Lab: "Built 10-21/23" tab, group FX4: Scorched Ground's boil and Wildfire Front, played with the game's code (`groundBoilVfx`,
  `scorchSweepVfx`; `fx-src-extra.txt`); the Smoke & war tab's Wildfire front says where it is used now. The hub is rebuilt at release.
- Texts: 18 TX keys new or changed, 12 packs, the Lava Waders name and flavour (`tools/i18n_2026_10_23_fx4.py`); `ui.ui4-swap-say` /
  `-n` and `ui.fx-scorched-sweep-log` retired. Tests: `tests/fx4-2026-10-23.js` (new, 95 checks), `tests/e2e/fx4_2026_10_23.py` (390 /
  1366); `fx3-2026-10-23`, `keywords-2026-10-14` (Lava Tide x0.5) and `ui4-2026-10-23` (unit and e2e) follow the new rules. Card matrix: 0 failures, golden
  diffs 8341 against 8247 on batch-1023b before FX4 (Backstab, the Guardian shields, Scorched Ground). Screens: `docs/screens/FX4/`.

## 2026-10-23 (package MK: the map marker stays put after a win; a cleared Map 0 no longer strands you)
- **Owner (11:28):** "why does completing a skirmish put my conquest map marker ... move to Map N-1?" The results' Back to map ends the fight inside its own click; that click then reached the map's "click outside the skirmish panel closes it" listener, with the button already gone from the page, so the picked fight was dropped and the pawn walked to the next fight, or to the map's first one (N-1) on a cleared map. A click that began during a fight, or whose target left the page, no longer closes the panel; on a cleared map with nothing picked the pawn keeps its spot.
- **Owner (11:29):** "i'm stuck in Map 0 in my new account." Map 1 was open but out of reach: until Thistlewood's reward fight opens the world, a map shows no map list and no › edge, every page load starts on Map 0, and PG's step onto the next map happened only in memory on the clearing win. `healMapProgress` (on load and each time the map opens) reads old node-id spellings as the new ones and finds the furthest map open in order; with the world still hidden the road opens there, once for each new furthest map. Nothing is marked open: a map whose fights are not won stays locked.
- Test `tests/mk-2026-10-23.js` (Back to map, Fight again, Auto-sweep on Maps 1 / 2 / 5 at 1366 and 390; stuck saves after a reload, old ids, a still-locked save); screenshots in `docs/screens/MK/`.

## 2026-10-23 (package BF12: Evasive ×1.37, Shadow ×1.1)
- **Call BF10-1** (settled by Claude, the owner asked to settle the easy calls): the robust skill test measured both as overpriced at ×1.5 (Evasive worth 5.77 vs 7.14 paid, its deck won 23.8%; Shadow 1.94 vs 7.14, 1.8%). `MISS_MULT_BY` in `bramblewood-budget.js` is now Flying 1.39, Evasive 1.37, Shadow 1.1; Swift stays 1.5. `tools/skill_costs.js` follows.
- **Re-fit:** no card moves up a whole stat point; the Magma Wraith would go down and stays held (BF11-1).

## 2026-10-23 (package BF11: cap 2 doubled, Thorns 1.25, Bulwark 6, two cards trimmed)
- **Owner (11:11):** "Thorn 1 is roughly worse than Attack +1. So it must be less than 2." "Maybe 2*(N/3)^2 since we have A*H + S*|S|." "Bulwark should be scored only for 6." "Those 2 cards have too many skills or at too high number. Trim. For the muskrat, just bulwark 1 and Tide is sufficient." "Thorns 2" (Coffer Mimic).
- **Formula:** cap 2 is A·H×m + S·|S| ≤ **2**×(N/3)² (`cap2Mult` in `bramblewood-budget.js` DEFAULTS, one helper `cap2Limit` read by the helper's level room, `tools/skill_costs.js`, the game's Test Lab (`sbCheck`), the hub's Budget & stats tab and `tools/special_monsters.js`).
- **Prices:** Thorns 2.7 → **1.25** a point (the robust test: Thorns 2 worth 2.48, its deck won 5%); Bulwark 8 → **6** a point.
- **Trims:** The Magnate Duck: Swipe off, Armor 3 → 1, Bounty 3 → 1 (keeps King, Midas 3, Hoard 3): 1/22 → **2/34**. Muskrat Lodgekeeper (Tide, Bulwark 1): 3/13 → 2/10, now inside the formula. Coffer Mimic Thorns 4 → 2.
- **Re-fit** (every card, shape kept): 160 cards applied, almost all up (mean about +3 stat points). Band cards without a legal line: 101 → 24. **23 cards held at their stats** (the formula would cut them; they were over budget before): alley-cat 1/8→1/6, colony 0/11→0/9, honey-badger-fury 2/9→1/7, chipmunk-hoarder 3/8→2/5, pyroclast-wyrm 5/17→3/12, otter-guard 4/8→3/6, tunnel-ant 2/9→2/8, beaver-lumberjack 4/4→2/2, sunfeather-scout 1/7→1/4, sunspire-choirmother 3/6→2/5, old-willow-of-the-ford 2/24→2/20, thornwood-palisade 0/16→0/12, the-contradiction 2/19→1/14, magma-wraith 1/9→1/6, lone-grey-wolf 4/15→1/3, puffball-bombardier 1/10→1/8, sheep 1/7→1/4, starfall-owl 5/26→2/11, fumarole-ibex 1/13→1/11, battlement-heron 1/14→1/10, ashmantle-fiend 5/22→4/17, truffle-piglet 3/11→2/8, krill-swarm 1/7→1/5. Call BF11-1.
## 2026-10-23 (package DC2: the owner's 11:11 answers, and the easy calls settled)
- Decisions only, no code. `docs/decisions.json`: 19 of the owner's 11:11 answers recorded (UI4-1..3, FX3-1..3, EN-1..8, EB-1..5),
  and GD-1 / GD2-5 note his "Adjacent / Surrounding: Okay!". At his request ("many of them are basically confirmed ... make the call"),
  Claude settled 28 more: 24 kept as built, plus TU2-1, RW3-3, BF10-1 (Evasive ×1.37, Shadow ×1.1; later package) and BF10-2
  (superseded by EN-2). 19 stay open for him, with shorter bodies and a recommended default (DF-1..4, SX-2, LEAD-4, TU2-3, RW3-2 among
  them), including the new EQ-1 (how equipment is damaged or removed, 4 designs, recommended: durability with acid / Corrode wear).
- Build list in `docs/action-items.md` ("10-23 11:11: building"): FX4, HUB2, BF11 and two later-package items.

## 2026-10-23 (package SX: target-modifier sounds, poison's crit colour, the 3-part Hero XP bar, number-aware translations)
- Owner 10-23 00:10 #95, #11 (DN2-4), #66 (H2), #64 (I2). Calls SX-1..SX-3.
- **A sound for each damage mark (#95):** every damage number with a mark plays that mark's own SoundKit cue 75 ms after the hit, so the
  hit / element / skill cue still reads first (`SX_MARK_DELAY`; `dnMarkSoundKey` picks it with the mark drawn, `dnFloat` plays it, panned,
  one per kind per 45 ms, at the SFX volume). Cues: `markArmor` (a bright plate ting over a soft konk body), `markBlocked` (a longer
  ring, two strikes), `markShield` (a dull padded thud), `markShell` (a hollow wooden tok), `markSturdy` (a low thunk), `markStone` (a
  gritty clack), `markResist` (a muffled "fff"; Resist, Rage, Scare), `markFragile` (a dry crack), `markWeak` (a rising sting),
  `markShocked` (an electric zap), `markImmune` (an airy whiff). The 10-16 konk now plays only in replays without marks (call SX-1).
- **Poison's crit colour (DN2-4):** `DMG_CRIT_BY_CLASS` beside DN2's knobs: poison (with acid and decay) turns +5 degrees and 16% lighter, a
  light yellow-green instead of teal; every other element keeps +12 degrees and 10%.
- **The Hero XP bar has three parts (H2):** Battle XP fills the first, Materia XP the second, either fills the third, Battle XP there at 75%
  (`HERO_XP_EITHER_BATTLE`). Each part is a third of the level's XP (`heroXpSections`); the level comes from two pools (`heroXpState`), XP
  past a full part waits for the next level. The Hero Hall draws the three parts (the third split Materia violet / Battle striped), the
  rule as the tooltip and a line under the bar, each part's numbers on hover. Battles give Battle XP, Materia crafts Materia XP. Old saves
  keep their level as a base, and the XP into it becomes Battle XP (`heroXpMigrate`; h.xp stays the plain total). Calls SX-2, SX-3.
- **Number-aware translation templates (I2):** 18 TX templates (`ui.i2-*`) replace 33 numbered literals (achievements, daily and weekly
  quests, the Lumber rules, the battle-rating colours, the raid's Top N%) and the 3 `results.raid-tier-top*` keys. The 12 packs: 396
  numbered rows became 216 template rows, every old row still translating to what it said. The page translator writes a template's
  number the language's way (`localNum`: 4.000 in German, 2,5 in French). Tools: `tools/text/templatize_numbers.py` (does it, `--check`),
  `textlib.NumberTemplates`, keyify reuses a number template (and drops only keys it made itself, not the built-name keys), and
  `tools/i18n_ui.py` counts and drops numbered rows a template covers. Left as rows: the loss grades "took 1 / 2 damage or less" (French and
  Italian need the singular) and the Steam achievement descriptions (not shown in the game).
- Texts: 6 TX keys for the bar in the 12 packs (`tools/i18n_2026_10_23_sx.py`). Tests: `tests/sx-2026-10-23.js` (752 checks); dn2 and
  reward-screens follow the renames; `tests/e2e/hero.py` gives both XP kinds. Shots: `docs/screens/sx/`.

## 2026-10-23 (release: batch 10-23b)
- Shipped together: EN, FX3, UI4 (entries below), plus the live RW3-9 tutorial-reward clear (owner: "apply it").
- Release checks: full suite as the 10-23 release, with nv, st and ts-status-chips back to passing; darkness-1013 and skills-sk2b updated to FX3's Scorching II (1) and EN's appended card. e2e ui_smoke 0 failures, flows 0 issues.
## 2026-10-23 (package LEAD: a leader for every elite and boss, two for a paired boss, BR and win rates kept)
- Owner 01:03 #12. Calls LEAD-1..LEAD-5.
- **Before:** every skirmish from Map 2 already had a leader (SK, the showcase card; 134 of 149, all 81 past Map 10). Of 113 elite-and-above fights on Maps 0-24
  only the Caldera Wyrm (20-B-4) had one. **Now all 113 do** (112 new: 76 elites, 16 mini-bosses, 16 bosses, 2 raid bosses, 1 world boss, 1 dungeon; 80 on main maps,
  32 on side maps; 41 on Maps 0-10, 71 on Maps 11-24). The rule: an elite or above leads with its showcase card on every map (`LEADER_KINDS` in `skirmishLeadersOf`).
  The showcase is set to the fight's boss unit on 19 fights (the Glacial Ape-King, the Cave Warlord, the Yeti, the Sand Widow, the Orca Vanguard ...). Left out: the
  Tutorial's T-4, the hidden daily dungeons, the Tower. Skirmishes keep SK's rule.
- **Paired bosses:** no twin- or two-headed boss exists in the data (the Two-Headed Calf is in no enemy deck). Two named pairs get 2 leaders: 24-8 the Magnate Duck +
  Iron Warden, 23-8 Marshal Tuskwell + War Elephant (`node.leaders`). The engine already held several reserve leaders; the VS opener names both and the map
  panel shows both cards.
- **Shown:** an elite's or a boss's leader is named on the VS opener (`leadersShownFor`); a skirmish's stays unshown (SK).
- **BR kept:** 110 of 112 changed fights within 5% of their BR with no leader (mean +1.1%). 20-R +10% (an all-Common deck, BR 20 -> 22) and 20-A-3 -5.3% (36 against 38) are
  named exceptions. Levers: the leader's own copy leaves the deck, single copy edits under PG's ladder (16 decks also trimmed to it), `enemyLevel` on 57 fights, the enemy
  bramble on 23. On 11 fights another deck card leads, where the boss unit moved the win rate more than 8 points (owner: "they can use any card as leader").
- **Win rates (DF ant deck):** each fight's pick was played 400 games against the old fight: 95 of 112 within 3 points, 102 within 5, mean -0.4. Re-measured at 1000
  games on 14 fights: mean -0.2, mean |change| 2.2, largest 3-7 -6.8 and 7-5 -5.7. `tools/lead_2026_10_23.js` (plan, tune, alt, apply, check, report),
  `docs/balance/lead-2026-10-23.json` and `-tune.jsonl`.
- **Found:** Boss surge (+2/+4, out at once) needed a leader, so it now fires on the bosses. A leader that costs 3+ Lumber rarely comes out, because the CPU doesn't
  save for one. In 60 games the 23-8 pair, the Magnate Duck and 22-8's leader never came out (call LEAD-4).
- Texts: 1 TX key in the 12 packs (`tools/i18n_2026_10_23_lead.py`). Tests: `tests/lead-2026-10-23.js` (675 checks), `tests/e2e/lead_2026_10_23.py` (shots at 390 / 1366).

## 2026-10-23 (package UI4: swaps that cross over, several swaps at once, deck slots, the hand's blue numbers, no redraw under the results)
- Owner notes 01:03 #1 #2 #3 #5 #7, 01:09 #2, 01:57 #6 #7 #8 #11, and EB's panel-level note. Owner calls UI4-1..UI4-3.
- **Swap (01:03 #1):** pressing Swap sends the offered card over the top to your deck's side (left) and your card under it to the right
  (`ds2CrossSwap`), then the happy bounce as before.
- **Pack opening (01:03 #2):** the pack's flower badge (`.po2-ico`) hangs from the label's top edge with room kept for it, and the faction
  seal sits on the band over the art (fx-d `.fxd-seal`), so neither covers the pack's name. The yellow box while cutting was the tear
  strip's keyboard focus ring (`.po2-strip:focus-visible`, the strip is focused when the pack opens): it now shows only after a key press,
  never while a pointer cuts; no tap highlight or text selection on the pack.
- **Several swaps at once (01:03 #3):** a faction pack's cards come as one window in the swap window's style: a row per card (your deck card
  left, with ‹ › to pick another; the pack card right; a tick), "Swap N" trades the ticked rows together and the cards cross over. A row
  only where a weak deck card may go (`swapOutAllowed`) and the pack card scores higher; two rows never take the same copy; one row falls
  back to the one-card window. The first faction pack (0-2) always shows it; later ones count as one of the 10 offers (UI4-3).
- **Camp (01:03 #5):** the main deck comes first with a gold "★ Main deck · You play with this one" ribbon and a glowing gold frame; the
  other decks sit a little quieter. **Deck slots:** a new player has 1; more are bought in order under My Decks in the Camp and in the
  Tavern's Upgrades tab: slot 2 ✨150 + 🍁150, slot 3 ✨300 + 🍁250, slot 4 (Map 15 cleared) ✨600 + 🍁350 + River Pearl + Tempering Stone,
  slot 5 (Map 21) ✨900 + 🍁450 + Ember Core, slot 6 (Map 27) ✨1200 + 🍁600 + 2 Ember Cores, slot 7 (Map 33) ✨1500 + 🍁750 + Strange Materia
  + Ember Core (UI4-1). New Deck and Import ask for a free slot (a toast and the slot row lights up). Existing saves keep every deck: the
  slots owned start at the decks a save holds, and a deck arriving from the cloud raises them the same way.
- **Tent deck editor (01:03 #7):** checked after PG's fix: a click (desktop) or a tap (phone) on a pool card adds it.
- **Win screen (01:09 #2):** root cause: `renderMatchUI` rebuilds the whole match screen when the result comes in (`m.over`), so every card
  on the board was thrown away and drawn again under the results (a probe of the results opening: 7 of 7 card elements new), the art
  re-decoded and a token or a card still landing started over. Once the match is decided the board rows are kept and put back into the
  rebuilt screen (`BOARD_ROW_IDS`, `__bwMatch`); renderBoard sees full rows with the same signature and leaves them alone (7 of 7 kept).
- **Desktop field (01:57 #6):** outside full screen, a desktop window (900px and wider, with a mouse) gets the same shift as full screen,
  so the battlefield's middle sits on the window's middle (`is-desk-centre`, `centreFieldInFs`).
- **Fight header (01:57 #7):** the top-right buttons show their words while they fit and go icon-only when they don't (`fitTopRowControls`,
  `.is-compact`; words stay in title / aria-label; labels never wrap). Auto-win and Auto-play now have icon + label. The Environment cards
  fan tighter the more there are, from the old step at 2 to 1.8x closer at 6+ (`--env-tight`); hover or a tap lifts one.
- **Results item (01:57 #8):** the item chip's tip is just what the item does ("Your bramble heals 5 Health."); the old "your first 3
  Conquest wins each day bring an item" text is gone from the game and the 12 packs (both item tips; EB changed the rule).
- **Blue numbers in hand (01:57 #11):** a hand card shows in blue the Attack / Health it would have if played now, where that differs from
  the card: the engine's own rules on a copy of the board (`engine.previewPlayStats`: placeCard's arrival bonuses, now shared as
  `arrivalBoardCard`; Rally / War Banner / Herald / Amplifier, Formation / Isolation, day and night, Pack chains; Swarm, Defiance, Tide,
  Rage at the swing). Nothing real changes (uid counter, full-moon mark and derived defs put back; a seeded fight with previews plays the
  same events). An Ant Scout with 3 ants out shows 4 (the engine counts the other allies; UI4-2 asks about 5).
- **Map panel level (EB):** the fight panels' enemy tiles show the level the fight uses, Level 0 on the early road included (27 tiles on
  Maps 0-11 showed printed stats, e.g. 0-2's Ant Scout 1/5 for a 1/4 fight; now 0 of 471).
- 25 TX keys, 19 new rows in 12 packs (+ "Swap" where a pack lacked it) (`tools/i18n_2026_10_23_ui4.py`), tests/ui4-2026-10-23.js (79 checks), tests/e2e/ui4_2026_10_23.py
  (390 / 1366), docs/screens/ui4/.

## 2026-10-23 (package FX3: the volcano by shape, Scorched Ground as a line of fire, one ground fire a fight)
- Owner 01:57 notes 3 ("a line of fire moves from the left side to the right side. As it touches a card, it takes fire damage") and 7
  ("1 damage for every turn ones, 2 for single target or higher if rare and single-target. (max 3) The burning from scorched ground seems
  to be hitting twice"); DF-4.
- **The volcano family, old -> new** (engine `VOLCANO_EVERY` 1, `VOLCANO_SINGLE` 2, `VOLCANO_RARE_MAX` 3): Scorching I 2 units a side x 1
  (unchanged), II 3 x 2 -> 3 x 1, III 4 x 3 -> 4 x 1; Scorched Ground one random unit a side for the fight's 2 (elites) / 3 (bosses) / 5
  (world bosses) -> the line of fire, 1 to every front unit; comets 1 (unchanged); Lava Spout 1, now capped at 1 whatever its number; Ash
  Rain 1 to brambles, capped at 1; Lava Tide (a unit a side in a column) 1 -> 2; the Eruption (a unit a side) 1 -> 2, a fight's own number up
  to 3 (was 5: boss / miniboss fights 3, world bosses 5 -> 3). No damage: Petrification, Sulphur Fumes, Ashy, Volcano Glow, Boss surge, Deep
  mines. Skills (Immolation, Slash & Burn) are not field hazards and are unchanged.
- **Why FX / FX2 missed Scorched Ground:** FX left the volcano alone (call FX1); FX2 changed the engine's default and the editor preset to
  1, but a volcano map's fights never use the default: `fightRules` in arena_app.js writes the number per fight kind (2 / 3 / 5), and FX2
  only capped it at 5. The field card's short line was a literal (`Burns a unit a side for ${r.eruption}`), so it said 5 on the world
  boss.
- **The double hit:** not an event counted twice (one `scorched` event and one 🔥 number per burn, checked in the page with a hooked
  `floatText`): Map 20's six elite and boss fights and 22-7 set Scorching III themselves and also got the automatic Scorched Ground, so two
  round-start burns hit the same units in the same upkeep with the same 🔥 number. `fightRules` keeps one ground fire: Scorched Ground's
  line (call FX3-2).
- **The line of fire:** the engine's `scorchSweep` crosses both front lines column by column from the left (a raid's back rows are not
  crossed); every unit takes 1 fire, fire-resistant units and Mountain Climbers are spared; no roll, so every replay is the same. One
  `scorchedSweep` header, then one `scorched` event a unit in sweep order. On screen: the Effects Lab's Wildfire front (`FX.B.wildfire`,
  now taking a duration; its lab card says "in game") crosses the battlefield in 1.6 s (faster at 2x / 5x), and each card's 🔥1 floats as
  the band reaches its middle (`scorchSweepVfx`); the upkeep holds until it has crossed. Reduced motion or Effects off: no band, the
  numbers at once. The forecast says Scorched Ground, 1.
- **Map 20, the DF ant deck** (Lv 8 / Lv 4, 40 games, `referenceFightSetup`): 20-5 7.5 / 0 -> 62.5 / 50, 20-6 0 / 0 -> 12.5 / 5, 20-7 2.5 / 0
  -> 92.5 / 75, 20-8 0 / 0 -> 32.5 / 20, 20-9 2.5 / 0 -> 42.5 / 32.5, 20-10 2.5 / 5 -> 35 / 20.
- Texts: TX keys `ui.fx-scorched`, `-short`, `-sweep-log`, `ui.fxx-scorched`, `ui.fx-lava-tide`, `ui.fx-scorching1..3` (the Scorching
  lines were literals that said 2 / 3 damage, and "every unit takes 1"), 12 packs (`tools/i18n_2026_10_23_fx3.py`). Edit skirmish:
  "Scorched Ground", "Volcano eruptions hit 2 / 3" (was Scorched Ground 2 / 3 / 5).
- Tests: `tests/fx3-2026-10-23.js` (new); `fx2-2026-10-22`, `keywords-2026-10-14`, `field-effects-2026-10-16` follow the new numbers.
  Calls FX3-1 .. FX3-3. Screens: `docs/screens/FX3/`.

## 2026-10-23 (release: batch 10-23)
- Shipped together: DOC, TU2, RW3, BF10, DF (study), PG, EB (entries below).
- **Release fixes:** the built-in default deck had 4 Otter Centurions (over PG's Rare limit of 3): now 3, with 5 Bee Knights. The Nest's tab labels keep their emoji outside the translated text, and "Eggs and babies" / "Level 0" were added to the main language packs. A pack's "🪺 Nest" button opens the Nest only when the packs brought a Level 0 recruit, else "⛺ Camp".
- **Release checks:** full suite: the four new failures were tests on the old rules (Nest tabs, Flying ×1.5) and test setups that started fights with a deck they don't own (PG); all updated and passing. e2e ui_smoke 0 failures, flows 0 issues.
## 2026-10-23 (package EN: Spellward, Surrounding, one King, Liege and Assault, Rage {…}, the evolute fixes, the volcano's reset, the second player's Shield, the CPU in the fog, Backstab's edge, Bulwark's shields, the Coffer Mimic, Swarm without Structures)
- Owner's 10-23 00:10 answers GD2-1, GD2-5, TR-4 .. TR-6, EV-1 .. EV-7, FX2-1, D21, D24, FOG1 (items 4, 7, 12, 31-40, 88, 90, 92) and his 01:57 notes 2, 5, 10.
- **Spellward (GD2-1):** Spellshield is Spellward everywhere (engine key `spellward`, texts, 12 packs, Codex, editor, `skill-costs.json`); an
  old card's `spellshield` still reads as it and saved cards are migrated as they load (`enMigrateCard`).
- **Surrounding (GD2-5):** a Codex term beside Adjacent: the 8 places around a unit (diagonals included; a raid's rows too). Dynamite ("to
  every surrounding unit"; on the raid board it now also reaches its own rows in front and behind, `surroundingOwnOf`), Scavenge and
  Salvage say it. Adjacent stays the four directions.
- **One King (TR-4, TR-5):** King is off the Rodent King, the Glacial Ape-King, the Yeti Chieftain and the Gannet Queen (TR had taken Bounty
  off the first two for King; it stays off, BF8's loot-carriers rule); the Magnate Duck is the one King. King 4 -> **1.4** (0.4 x Kingly 3.5: Tribute 1 0.5 + Armor 2 x 1.5). The Duck still has no legal
  line (its five other skills break cap 2): kept 1/22, not floored (call EN-1).
- **Liege {…} and Assault N (TR-4):** Assault N: +N on its own swing (unit, prongs, bramble), never on a Counterattack; **1.8 a point**.
  Liege {…}: its braces while a King of its side (not itself) is on the battlefield, Assault 2 by default; **0.3 x the braces** (plain
  Liege 1.08; `CONTEXT_MULT_BY.liegeGrant`). Editor rows, Codex, texts.
- **Rage {…} (TR-6):** the Enraged preset is gone (a saved one becomes Rage {…}). `rageGrant` beside Rage: Rage as before plus the braces
  while it rages (read without the braces' own Health, so it does not flicker). Cost: Rage's own + **0.4 x the braces** (`CONTEXT_MULT_BY.rageGrant`:
  on for the lower half of its Health, 0.5, x 0.8 for a fall from above half in one blow).
- **Evolute (EV-1 .. EV-7):** an evolute waits its own Wait **plus the base's remaining Wait** (EV-4; the CPU counts it); Alpha and Omega
  cost **3** (EV-5); 23 baby-like cards gain **Stem (Fodder) at Level 1** (`levelSkills`; EV-6, list call EN-6); EV-1/2/3/7 kept as built
  (the Terraumbra is already the Evomax equipment; a stage reads only the type of the card it goes over).
- **The volcano (FX2-1):** after each Eruption it is Very Low the next round and climbs a level a round back to its own; the forecast
  names the level (`volcanoLevel`; speed: call EN-7).
- **Backstab (D21):** still the nearest enemy unit, never the bramble; its +N now lands when that unit is Blind, Stunned, Frozen, Asleep,
  Confused, Tipsy, Staggered, Paralyzed, Bound, Webbed or stone, or would swing blind in the dark while the attacker sees (was: not
  directly in front). **0.6 a point** (an estimate, call EN-5).
- **The second player (D24):** +1 Shield on its bramble, nothing else, wherever a second-player bonus applied (the Arena's rule sets, Double
  Time fights); the Arena texts say so.
- **Fog of War (FOG1):** the CPU plays through the fog from its side (`aiFogFor`, `aiSees` / `aiFront` / `aiFoes` in its slot, card,
  hazard, field and doom choices). Swings and skills still reach fogged units on both sides (call EN-8).
- **Bulwark N (01:57 note 2):** no longer softens bramble hits; as it arrives it raises **two 0/4N Bulwark Shields** (Structure tokens, no
  skill) in the free front-row slots nearest it. **8 a point** (2 x 4N Health). Calls EN-2 (price, the Titan) and EN-3 ("vanguard" read
  as the front line).
- **Coffer Mimic (01:57 note 5, new card):** a treasure chest in Map 8's caves (m4 pool, basic pack): Structure, **Shapeshifter** (new: a
  Changeling for Structures only, `bramblewood-taxonomy.js`; 0.1), Thorns 4, Lumber 1, Wait 1, Uncommon **0/8** (by formula, 2A+H+S <= N;
  cap 2 cannot hold with Thorns 4 at this cost: call EN-4). Placeholder 🧰; NightCafe prompt in `docs/art/new-cards-2026-10-21-briefs.md`.
- **Swarm (01:57 note 10):** Structures don't count (engine and the lines).
- **Re-fit** (`tools/refit_pass_2026_10_21.js`, every card whose S moved): Rodent King 4/14 -> 3/11, Ancient Sloth Titan 4/39 -> 1/14, Yeti Chieftain 3/14 -> 4/20,
  The Gannet Queen 1/13 -> 1/15, Stormcaller 1/28 -> 1/29, Hanging Loafer 2/22 -> 2/23, Raven Hexcaller 1/1 -> 2/2, Bone Diviner 2/2 -> 4/4,
  Stoat Cutthroat 3/11 -> 3/12, Wrong-Way Salmon 1/8 -> 1/10, Cunning Vixen 1/8 -> 1/10. No legal line, kept: Magnate Duck 1/22, Muskrat
  Lodgekeeper 3/13 (flagged list merged). The Glacial Ape-King keeps the owner's hand 6/37 (it fits). `card-obtain-maps.json`
  regenerated (the Coffer Mimic 8; the Magnate Duck 24, stale since DV8).
- Texts: TX keys and the 12 packs (`tools/i18n_2026_10_23_en.py`; the Spellshield and other replaced rows dropped). Decisions: the 16
  items' outcomes say "Built (EN)"; new calls EN-1 .. EN-8. Tests: `tests/en-2026-10-23.js` (new); `backstab`, `gd2-2026-10-22`,
  `keywords-2026-10-11`, `-14` (the volcano), `-14b` (Bulwark) follow the new rules.

## 2026-10-23 (package EB: the early road for a fresh player's real deck, Map 1 beatable, items 2% per Energy, 8-Energy capsules)
- Owner notes of 01:57, items 1, 8 (the rules; the tooltip wording is UI4's) and 9; DF-4 ("Map 1 extremely difficult").
- **Measured** (`tools/eb_early_road_2026_10_23.js`, `docs/balance/eb-2026-10-23.json`, 100 games a fight and side): the starting deck the
  game builds after T-2 (live tutorial lists, one copy each, every copy Level 0, the owner's live stats for the weak Base cards). Before ->
  after, mean of Otters / Hummingbirds / Both (road target): T-1 89 -> 95, T-2 28 -> 78; 0-1 78 -> 94 (90), 0-2 58 -> 81 (75), 0-3 37 -> 64
  (60), 0-4 20 -> 42 (45); **1-1 5.7 -> 83.7 (90), 1-2 7.3 -> 74.7 (80), 1-3 9.3 -> 74 (70), 1-4 6 -> 55.3 (60), the Baron 6 -> 39.3 (40)**.
  The reference deck now wins Map 1 88 / 78 / 78 / 57 / 53% (was 0-12%).
- **The real deck after T-2 (EB-1):** the baby filler no longer joins it; it is topped up, one copy each, with the sturdier cards first (River
  Carp, Burrow Rabbit, Duck Paddler, Farm Dog, Chipmunk Forager ...; `starterTopUp`, a saved config with PG's old list gets the new one).
- **Brambles (EB-6):** the enemy's bramble is plain in T-1, T-2 and on Map 0 (0-2 / 0-3 lost the Outskirts Watchtower, T-2 its rival's);
  0-4 keeps the +1 Attack to the first unit. Your bramble starts at least 3 above the enemy's Health + Shield in T-1, T-2 and on Maps 0-1
  (`earlyHomeBramble`, also in the tools' `referenceFightSetup`): T-1 8 against 5, T-2 9 against 6. 0-3's base bramble 7 -> 12 Health,
  0-4's 8 -> 5 (to their bands).
- **The enemy's level (EB-3):** Level 0 on Map 0 (below a card's own level: a Chipmunk Skirmisher 2/7, not 2/8), on Map 1 0 / 25 / 25 / 50 /
  50% of the copies at Level 1 (`EARLY_ENEMY_LEVEL`); Map 2 on unchanged; the editor's Enemy level still wins.
- **Map 1 (EB-2):** 1-1 to 1-4 defend a plain bramble with less Health (5 / 6 / 7 / 6; the Hedgerow Burrow's +1 Health a unit decided every
  2-Attack trade), the Baron 6 + 2 Shield; decks mix the 2/8 commons with Harvest Mouse, Meadow Rabbit, Cottontail and Ant Scout (Map 1's pool
  `special`), 20 cards each, reward cards kept; 1-2's showcase is the Cricket Drummer.
- **Items (EB-4):** a Conquest win you played rolls 2% per Energy the fight cost (`KIT_DROP_PER_ENERGY`, `energyPaid`), at most 3 items a day;
  was the day's first 3 wins, sure. Notices, weekly tiers and item bosses still come on top. The inventory says so (TX keys).
- **Energy capsules (EB-5):** 8 Energy (was 20); a first-clear 🔋 token on 1-3, 2-1, 4-2, 6-3, 9-3, 12-3, 15-3, 18-3, 21-3, 24-3 (2-1's replaces
  the "first win on Map 2" capsule); the results show it. Item tokens (capsule, Raid Ticket) now come on top of a fight's card reward and
  drop (`itemRewardTokens`), no longer in place of them.
- Texts: 7 TX keys in the 12 packs (`tools/i18n_2026_10_23_eb.py`). Tests: `tests/eb-2026-10-23.js` (new, 213 checks); `pg`, `level-curve`,
  `shields` and `z` follow the new rules. Screens: `docs/screens/EB/`.

## 2026-10-23 (package BF10: Flying ×1.39)
- **Owner (01:03, 01:57):** "I think Flying may be overcosted." "I estimate Flying is worth x1.39."
- **Measured:** the robust skill test (`docs/balance/skill-test-robust-mono-2000-2026-10-22.md`) puts Flying's worth at 5.88 stat points against 6.89 paid at ×1.5 (a Flying deck wins 28.4% against the vanilla deck's 41.1%), which is ×1.398.
- **Formula:** `MISS_MULT_BY = {flying: 1.39}` in `bramblewood-budget.js` (`missMultFor`); every other half-miss skill stays ×1.5. The card editor's budget panel and Test Lab (`sbMissMult`) and `tools/skill_costs.js` read it.
- **Re-fit** (135 Flying cards, shape kept): only 3 gain a whole stat point: Red Dragon 3/17 → 3/19, Blue Dragon 3/17 → 3/19, Ford Kingfisher 0/1 → 0/6. The rest sit within one point of their cap.
## 2026-10-23 (package PG: one copy of each starting card, the copy ladder 5/4/3/2/1, no free unlimited Base cards, the Map 0 signpost, Armor checked)
- Owner report of 01:03, items 4, 6, 8, 9, 10, 13 (and 7: clicking a card in the Camp adds it again).
- **Starting cards, one copy each (items 8, 10). Root cause:** every basic / starter / tutorial-reward card (`cardSourceOf` kind `base`) counted
  as owned by everyone with Infinity copies (`ownedForDeck`, `ownedCopiesOf`), and the starting deck was built from the tutorial lists'
  numbers (Pond Trout x3, Honey Bee x3 ...). So a new account's Camp listed 44 cards after 0-3, 38 of them unlimited. Now a card is in the
  Camp only when you hold a copy, a deck holds only the copies you own, and the starting deck is 20 different cards, one copy each: your
  side's list, the shared list and the filler (their numbers now only say which cards), topped up from `starterTopUp`, plus T-1's and T-2's
  rewards (`starterDeckParts`, `tutorialStarterCopiesLevel0`). Fresh Otters account after 0-3 (live tutorial config): before 25 copies of 15
  cards held and 44 cards in the Camp (38 unlimited); after 25 copies of 24 cards, the Camp lists those 24 (+ the Wandering Traveller,
  your leader), none unlimited (call PG-3).
- **Infinite Quarry Moles (item 6). Root cause:** the Mole was T-1's reward, so it counted as a Base card: unlimited in the deck builder. RW3
  moved it to 8-1; Base cards are no longer unlimited at all. A tutorial reward is no longer held for pitching either (with the live config the
  Mole arrived a second time at 0-1).
- **Saves from before:** once, for a player past the tutorial, each Base card in a saved deck gets real copies up to what that deck holds
  (`grandfatherBaseCopies`), so no deck shrinks; a deck over the ladder shows a pill and can't start a fight until trimmed (call PG-2).
- **Copy ladder (item 9):** Common 5, Uncommon 4, Rare 3, Very Rare 2, every rarity above 1 (Starter as Common, special rarities as their
  tier; was 10 / 5 / 4 / 3 / 3 / 2 / 2), in `RARITY_MAX_COPIES` and `bramblewood-ghosts.js`. Enforced on click, drag, swap offers, deck import
  (cut to the limits and the copies you own, with a note) and the fight gate (named card by card); each Camp pool card shows "in deck / limit"
  (e.g. 2/3). The per-deck Legendary 3 / Mythic 2 caps (DR) still apply on top (call PG-1). Disenchant / Fuse extras follow the ladder.
  Enemy decks are unchanged (122 of 467 hold more; call PG-6).
- **Camp click (item 7):** a click on a pool card threw "fast is not defined" since package ED (10-21), so only drag added cards. Fixed.
- **Map 0 → Map 1 (item 13):** the gate opened Map 1 the moment 0-4 was won (fresh account; Maps 1 → 2 the same). What put the owner on a locked
  "Map 1" was Map 0's 🪧 signpost: "Show me the road" jumped to Clovermead, a side map of Map 1 that waits on Map 12. It points at Thistlewood
  now; a signpost to a locked map stays put and says what opens it (`mapLockReason`); the locked notice names it and offers "Back to …"; and the
  fight that clears a map takes you to the next map when you return to it (call PG-4).
- **Armor (item 4):** not a display or rounding fault in this build: a 3/7 Armor 1 Beetle Grunt hit 4, 4, 2 shows 3, 3, 1 and dies at 0; in 13
  auto-played 0-4 fights the shown Health matched the engine after every hit and round and each death played at 0. The engine removes the dead
  after each attacker's / skill's action. Open: a heal later in the same action can't save a unit at 0 (call PG-5).
- Texts: 14 new rows (13 TX keys + the signpost line) in the 12 packs (`tools/i18n_2026_10_23_pg.py`); two retired UI rows.
- Tests: `tests/pg-2026-10-23.js` (new, 217 checks); `nf-2026-10-19` and `fg-2026-10-19` follow the new rules. Screens: `docs/screens/PG/`.

## 2026-10-23 (package RW3: drops by Energy, every skirmish pays, packs fully random, rare foils, the Shop's Raid Ticket, rarer ticket notices, disenchant table, per-copy Forge levels, PvP pools, the Quarry Mole on 8-1)
- Owner answers of 00:10, items 5, 6, 8, 19, 23, 25, 42, 44, 48, 53, 68, 69 (foils), 86 (GD2-3, GD2-4, GD2-6, RW2-3, AR-1, RK2, RK4, RP3, DV4, E2, C1, E11).
- **Card drops (item 19, RW2-3):** 1% per ⚡ of the fight kind's Energy tier + a shield bonus (elite / champion / miniboss / dungeon +1%, sub-boss +2%,
  boss +3%, world / raid boss, megaraid, final boss +4%), no cap: skirmish 1%, elite 3%, sub-boss 5%, boss 6%, world / raid boss 8%, final boss 9%
  (was 7% a tier capped at 25%). A skirmish with a first-clear card rolls 3x on repeats (3%), then that card's rarity share (RW2-1's 60/50/40...).
  The daily (ticketed) dungeons' floors keep 7% a tier capped at 25% (`ticketedDungeonDropChance`). The drop line shows the new numbers (call RW3-1).
- **Every skirmish pays on its first clear (items 5, 6):** the seven maps with no skirmish-exclusive card got 1-2 (12 cards moved out of the packs,
  `tools/rw3_first_rewards_2026_10_23.js` + `_apply_….py`); every other open skirmish pays a card of its map's pack. 101 main-map skirmishes: exclusive
  23 → 36, pack card 44 → 64, pack 1, nothing 33 → 0. A season / faction pack fallback exists (`SKIRMISH_FIRST_PACKS`, empty: no map ran out of cards).
  `tools/map_divvy_2026_10_22.js` knows the extra rewards (`RW3_EXTRA_REWARDS`) and its check passes (call RW3-8).
- **The Quarry Mole (item 48, RP3):** out of Base, the first-clear card of 8-1 (Caves & Alcoves; two in 8-1's deck); Thistlewood's pool and decks lost it
  (1-4's showcase is the Field Vole). T-1 no longer pays it even though the live tutorial config lists it (`TUTORIAL_REWARD_RETIRED`); the clearing SQL
  is `supabase/proposed/20261023_rw3_tutorial_reward.sql`, not applied (call RW3-9).
- **Packs completely random (item 53, DV4):** no map, rarity or pitching gate on what a pack gives, no recent-pull weight, no new-card guarantee; the
  drop, the base track and raid claims keep the gate (`packCardPool(…, gated)`). Prices and availability unchanged (call RW3-3).
- **Rare foils (item 69, C1):** 1% a card (Hedgerow), 1.5% (Tidemire), 2% (Highcrest, Mystery), faction packs 1%; the Highcrest's guaranteed foil is off
  (about 1.3 foils a Case → 0.16). Advanced packs keep 10x on their first five (call RW3-4).
- **Easter eggs (item 8, GD2-6):** a Mystery Booster card is an Easter egg 0.05% of the time (source `mysteryEgg`); giveaways are the admin grants (call RW3-10).
- **The Shop's Raid Ticket (item 42, RK2):** in stock on 25% of days (one roll a local day), stock 1, "Sold out" once bought, no shelf item on other days
  (`RAID_TICKET_SHOP_*`; the sold day travels with the progress) (call RW3-5).
- **Ticket notices (item 44, RK4):** S, SS, SSS notices bring a Raid Ticket 40% each (was 30 / 60 / 100%): at 6 notices a day, S 0.59 a week, SS + SSS one
  every 1.4 months (call RW3-2).
- **Disenchant (item 68, E2):** Common 5, Uncommon 10, Rare 25, Very Rare 45, Super Rare 65, Epic 100, Heroic 150, Unique 250, Legendary 400, Mythic 700,
  Ancient 1,200, Divine 2,000, Void 3,000, Daemonic 4,500 Magic Dust a plain spare (special rarities as their tier) (call RW3-6).
- **The Nurse (item 86, E11):** already makes eggs, babies and Level-0 training faster (2.5% a mastery point, at most half); never the Shiny chance. Unchanged (call RW3-11).
- **Forge levels per copy again (item 25). Root cause:** package FG (10-21, "forge forges ALL cards of a particular suite") made every copy of a card share
  one level (`setCopyLevel` moved them all, `copyModelSync` held them together). Now each copy is tempered, limit broken, melted and trained on its own
  (NF's model); the duplicate credit stays on the card. **Migration (copy model version 3, once):** every copy keeps the level it had (the shared level
  becomes each copy's), only the best copy counts as paid for (the others' levels are marked inherited, so a melt refunds them once); a version-1 save's
  per-copy levels stand. One toast (`toast.rw3-copy-levels`). Upgrade picks a copy again (call RW3-7).
- **PvP pools (item 23, AR-1):** Standard PvP and Collection PvP meet different strangers (a Standard deck is recorded at `ghost_decks` stage 100 + tier,
  no SQL change); a Standard match keeps your foils and Shinies.
- Texts: 6 TX keys (`ui.rw3-rt-*`, `toast.rw3-copy-levels`) in 12 packs (`tools/i18n_2026_10_23_rw3.py`); `toast.fg-card-levels` retired; two stale `lang/ui`
  rows updated. Tests: `tests/rw3-2026-10-23.js` (new, 10,000-roll checks); `rw2`, `gd`, `gd2` follow the drop numbers; `nf`, `deck-sync`, `ux` back to
  per-copy levels, `fg` section A rewritten. Decisions: Built (RW3) on 12 items; RW3-1 … RW3-11 asked. Screens: `docs/screens/RW3/`.

## 2026-10-23 (package DOC: the owner's 10-23 00:10 answers)
- 78 decisions closed in `docs/decisions.json` with his quotes (the ones that need building name their package: TU2, RW3, EN, SX, AR3); T3, S1, S2 wait for "apply it", S3 and S4 for a Chrome session; A1, A2 and G2 rewritten with the detail he asked for. The build list is at the top of `docs/action-items.md`.
## 2026-10-23 (package TU2: the Tutorial's way out, tutorial Health and rewards editable, T-1 to T-5, the Nest's recruits, Promotion page, Krooni retired, daily dungeons hidden, the Bonus Raid Ticket)
- Owner answers of 00:10, items 1, 2, 15, 74, 85, 84, 24, 41 (TU-1, N1, E10, E9, AR-2, RK1).
- **The Tutorial's way out (item 1):** once T-1 and T-2 are both won (their flags, or `mtut:tutorial` / `mtut:tutorial2` in the progress:
  `tutorialPairDone`), the Tutorial map shows "↑ To Map 0" beside T-2; taking it sets both tutorial flags and walks out to the
  Outskirts. **Self-healing:** `healTutorial2Flag` now restores either flag from the other or from the progress, and runs before the
  boot decides whether to drop the player into the tutorial, so a finished player whose flag was lost lands on the map, not in T-1 again.
- **Tutorial Health and rewards (item 2). Root cause:** the Tutorial editor's "Rival bramble HP" (`tutorialCfg.rivalHp`, live at 12 since
  10-22 15:23) only counts for a tutorial fight with no Health of its own, and both fights carry `tutHp` 9 / 11 in `CONQUEST_MAPS`, so
  that edit never reached a fight; a blanked Bramble Health in Edit skirmish snapped back to 9 / 11; Edit rewards opened the ordinary
  node editor ("No reward cards yet"), while the tutorial pays from `tutorialCfg.rewards` / `rewards2`. Now one number per fight: the
  node's `tutHp`, edited in Edit skirmish (Bramble Health, with "In the fight: N", since every bramble is halved) and in the Tutorial
  editor (Part 1 / Part 2), saved as a fight edit (`__cfg:map-nodes:mtut`) like any fight's; blank falls back for real. Edit rewards on
  a tutorial fight edits its reward cards (Part 2 per side) and publishes them with the tutorial config. The tutorial editor no longer
  shows Bramble level or Shield layers (the tutorial never read them). No live data changed (call TU2-3).
- **T-1 to T-5 (item 15, TU-1):** the Tutorial map's fights read T-1 … T-5 (were T-0 … T-4). Keys stay (`tutorial`, `tutorial2`, `T-2`,
  `T-3`, `T-4`; saves store `mtut:<key>`), so no migration; the labels come from `skirmishCode` and the nodes' `code`. The coach tip names
  T-2 (`coach.tap-t-2-then-press-fight`, 12 packs). Tests and `docs/action-items.md` follow.
- **The Nest lists recruits only (item 74, N1):** tabs 🥚 Eggs and babies (the nests) and 🌱 Level 0 (cards with a Level-0 copy: fresh
  hatchlings, Base cards, the tutorial's copies, faction cards; a Train one button), plus ⬆️ Upgrades; it no longer lists every owned
  card. **Faction cards start at Level 0:** a new copy of a faction card comes as a Level 0 copy (`factionCopyLevel0`, like the
  tutorial's), trained to Level 1 in a nest; a card already raised keeps its level; copies owned before are unchanged (call TU2-2).
- **Promotion (item 85, E10):** its own page (`#view-promotion`, tab `promotion`), "Coming soon", a short honest description, no
  controls. The Forge's card panel, where Promotion lived, points to it instead of the Promote controls (`PROMOTION_PAGE_LIVE = false`;
  the Worker Ant's working Promotion is hidden, its code and data kept; call TU2-4).
- **Krooni retired (item 84, E9):** none earned (`grantCurrency`), not in the wallet, not on the Highcrest Case's shop or opening lines;
  saved balances untouched, Admin Mode still shows them (`KROONI_RETIRED`, `currencyShown`; call TU2-5).
- **Daily dungeons hidden (item 24, AR-2):** Murgle Mayhem, the Undercroft and the Long Burrow are `preview` maps for players
  (`DAILY_DUNGEONS_HIDDEN`): no entrance on their map, no World map stop, no Dungeons tab, no key button; Admin Mode opens them; saves
  keep climbs and keys (call TU2-1; the backlog row is the DOC package's).
- **The Bonus Raid Ticket (item 41, RK1):** a fallen raid's claim at total rank A or better pays a Bonus Raid Ticket, its own item
  (`bramblewood_raid_bonus_tickets_v1`, in the progress blob, outside the Shop's cap of 9) with a gold ring outline (`.rk-tk-ico.is-bonus`);
  it works as a Raid Ticket and is spent first. Inventory shows both.
- Texts: 38 TX keys (`*.tu2-*`), two Nest tips, translated in the 12 packs (`tools/i18n_2026_10_23_tu2.py`). Test `tests/tu2-2026-10-23.js`
  (new); `node-ids`, `gates`, `tu-2026-10-22`, `tutorial-2026-10-18` follow the labels and the hidden Long Burrow. Screens: `docs/screens/TU2/`.

## 2026-10-22 (release: batch 10-22b)
- Shipped together: BF9, ST, GD, GD2 (entries below).
- **Trench Core:** its three stumps 14 → 20 Health (`canonical/raids.json`, Goliath core trench). BF9's cheaper Supreme / Supreme Tide re-fitted the dragons in the raiders' decks, and the Core was overwhelmed in 7% of `tests/trench.js` runs (limit 5%; 3% before). At 20 it is 3% again (core average 79). Raising the Core bramble itself (300 → 380) changed nothing while the stumps stand.
- Release checks: full suite as main plus `trench` back to passing (ed-2026-10-21 and autobattle fail only under load); card-matrix golden accepted (GD2: Guardian no longer takes skills, 21 squad / match fights); e2e ui_smoke 0 failures, flows 0 issues (before GD2).

## 2026-10-22 (package GD2: "adjacent", a random Guardian for swings only, Spellshield, 🗡️ / 🤺, first-clear pack cards, hidden Easter eggs)
- **Owner (19:27, GD-1 .. GD-6 and the phone pills):** "Adjacent is defined as behind, in front, left, right. Only relevant in raids or multi-player dungeons." / "GD-2: Random," / "if it's skills (including arrow), guardianship doesn't help ... There can be a similar skill - but for shielding allies from skills." / "King Slayer: 🗡️, Fencer: 🤺" / "There should be a mix of 'no first clear card', 'first clear skirmish-exclusive card', 'first clear pack card reward' and of course pack rewards" / "They just roll for the skirmish-exclusive, then if they get it, they roll within it" / "Use a symbol like 🚫. Easter egg maybe is only visible for admins in admin mode."
- **Adjacent (GD-1):** one engine helper, `adjacentOf` / `frontBehindOf` (and `adjacentFoesOf` for jumps): left and right in the unit's own row, plus directly in front / behind only where every row fights (the raid board, `RESERVE_ACTS`). Moved onto it: Guardian, Formation (a waiting reserve no longer counts off the raid board), Haste (a raid's middle / back rows too), Shieldwall, Amplifier, Immolation, Irradiated, Inspiring, Friction, Proliferate, Electricity, Chain Lightning, Dragon Lightning, Spitfire's splash, a trigger's Adjacent Ally target. Column shapes keep theirs (call GD2-5). The texts say "adjacent" and the Codex term Adjacent reads "directly left or right; in a raid, also directly in front or behind" (12 packs, `tools/i18n_2026_10_22_gd2.py`).
- **Guardian (GD-2, GD-3):** several adjacent Guardians: one at random (seeded; it rolls only when there are two or more). It takes plain swings only (the main attack and each Fork / Trident / Pitchfork / Octolash prong); arrows, Archer, Snipe, Bolts, damage and status skills reach their target; Cleave's side damage and areas as before (call GD2-2). Text: "Plain attacks aimed at an adjacent ally land on this card instead. Skills and area hits don't."
- **Spellshield 🪬 (new, GD-3, name: call GD2-1):** a single-target enemy skill aimed at an adjacent ally hits it instead (at the skill's target pick, `spellshieldFor` in `shieldCall`; never itself; several at random). Editor row, icon, Codex note, log line and a 🪬 float; price 0.8 in `canonical/skill-costs.json` (an estimate, Guardian 1.06); on no card. (No skill-dodging Ward exists; Helmet and Evasive are the nearest.)
- **Marks (GD-4):** "🗡️ King Slayer! +N" (was 👑💥); a Fencing unit's hit burst is 🤺 (was 💥).
- **First-clear pack cards (GD-5, GD-6):** a skirmish's first clear can pay one of its map's basic-pack cards (`SKIRMISH_FIRST_PACK_CARDS`, `tools/gd5_first_cards_2026_10_22.js`; the card stays a pack card). Exclusive cards unchanged (0-2 per map). Of 101 main-map skirmishes: before 23 exclusive, 1 pack, 77 nothing; after 23 exclusive, 44 pack card (each from that fight's deck), 1 pack, 33 nothing (calls GD2-3, GD2-4). The First Clear box, the grant, Clear map and the drop read `nodeFirstClearCardIds`, so a pack-card skirmish drops like an exclusive one (21% on repeats, the card's rarity share). GD-6: the roll was already one roll (checked, 20,000 rolls).
- **Phone pills and Easter eggs:** the admin's ⛔ "Not obtainable" and 🥚 "Easter egg" Codex pills are small 🚫 / 🥚 symbols on phones (words in `aria-label`, title, and after the symbol on wide screens). Easter eggs exist only for an admin in Admin Mode: everyone else gets no "???" slot, section, count, search or filter hit, or Easter-egg words; one a player owns shows as a plain card (call GD2-6).
- Decisions: GD-1 .. GD-6 DONE; GD2-1 .. GD2-6 asked. Tests: `tests/gd2-2026-10-22.js` (new); `gd-2026-10-22` follows the random order. Screens: `docs/screens/GD2/`.

## 2026-10-22 (package BF9: Legendary skills cheaper, the Red and Blue Dragons trimmed)
- **Owner (18:20, BF8-3):** "Trim + lower the skill score of the legendary skills. I don't think theyre worth that much. Maybe 3-5."
- **Prices (`canonical/skill-costs.json`, owner-set):** Supreme 7 → 5, Supreme Tide 8 → 4. True Strike, the third Legendary skill, is already 1.5.
- **Trim:** Red Dragon loses Stun on Hit, Blue Dragon loses Paralyze. Both now fit the formula: **3/17** each (they were over it at 4/20 and 4/19). Re-fitted with them: White Dragon 2/24, Green Dragon 3/21, Black Dragon 10/10. Fathom Leviathan (Supreme, Tide, Tsunami, Wave) still has no legal line. Band cards without one: 103 → 101.
## 2026-10-22 (package ST: the robust skill test)
- **Owner (18:20):** "Program the more robust way of testing - lumber, wait, multi-skill all need to be taken in account. Field effects of various types need to be taken in to account ..."
- **`tools/skill_test_robust.js`** (new; `tools/skill_test.js` unchanged): `--mono` / `--duo` / `--multi` (each unit the skill + 0-2 live companions, the marginal worth with minus without). Every unit draws a rarity / Wait 0-3 / Lumber 0-3 profile from the 714 live band cards and gets its stats from the budget at Level 1 with its skills' S priced in; the vanilla control and the standard enemy use the same mix (the enemy at 0.8x a vanilla unit's points, `--foe-ratio`: at the owner's 19/16 the vanilla deck wins ~0%, at 1.0 ~5%). Each fight rolls its field (`FIELD_CONFIG`): Day/Night and Tide 20% each; uncommon (darkness, rain, fog, wet ground, wind, Scorching, eruption, Swamp Fever, High Tide, sandstorm, canopy, First Blood, Arrow Slits) 2% each; the 28 rare ones 0.2% each; 20% of fights get one more non-common field. `--census` counts the fields on the 267 conquest-map fights (`docs/balance/field-census-2026-10-22.json`). Report: net (+ = under-priced), stat points paid, worth, and worth per field condition; JSON + markdown in `docs/balance/`. `--seed`, `--games`, `--jobs`, `--skills`, `--quick`.
- Test `tests/st-2026-10-22.js` (field frequencies, the Wait / Lumber mix, budget stats + cap 2, a --quick run, seeding). The full 10,000-game sweep has not been run.
## 2026-10-22 (package GD: Guardian covers four sides, the crit mark is 💥, every skirmish drops a card)
- **Owner (18:20):** "N22-12: Guardian now blocks for all adjacent allies in the 4 cardinal directions" / "DN2-3: 💥 is a better symbol for Crit to me." / "RW2-1: Yes. There are two kinds of first-clear drop card reward skirmishes ... ALL skirmishes have a low chance to get a card from the pack. For skirmishes, the chance of getting a card is tripled. But you mostly (50+%) get THAT card ... Maybe 60/50/40/25/20/10/5/4/3/2/1..." / "FX2-2: OKAY" / "FX2-3: OKAY as is".
- **🦺 Guardian (N22-12):** takes the single-target hits (a swing, an arrow or other shot, a damage skill aimed at one unit) meant for the ally to its left, its right, directly in front of it or directly behind it (same column, the next row toward or away from the enemy). Front / behind exists on the raid board, where every row fights; a waiting reserve doesn't guard (call GD-1). Several Guardians: left, right, in front, behind (GD-2). Never itself; area hits and status-only skills aren't redirected (GD-3). Engine `redirectToGuardian` / `columnNeighboursOf`; the skill's text and its chip in 12 packs. Card matrix against a golden regenerated on main's engine: 0 diffs (its fights have one row); 600 random raid-board fights with Guardians: 508 end differently, 45 change which side leads.
- **💥 is the crit mark (DN2-3):** floating numbers, bramble hits, the battle log ("for 💥14🦴 ❄️ cold damage"), the Codex's damage-number line (12 packs); one constant, `DN_CRIT_MARK`. So 💥 on a number means a crit only: Explode's fuse line and "Boom!" float are 💣, Stampede's log line and carry-over preview (+N) are 🐘. The plain hit burst stays 💥 (call GD-4).
- **Skirmish card drops (RW2-1):** every skirmish win rolls the 7% pack-card drop, including skirmishes whose first clear pays a card, a token or a pack (they had none). A skirmish with a first-clear reward card rolls 21% on repeat wins, and the card that drops is its reward card at that card's rarity share (Common 60, Uncommon 50, Rare 40, Very Rare 25, Super Rare 20, Epic 10, Heroic 5, Unique 4, Legendary 3, Mythic 2, Ancient and up 1%; special rarities as their tier), else a pack card. The rank gate holds. A cleared skirmish's drop line shows the card (tap to zoom), its chance a win and its rank emblem, then 🃏 for the pack share: Common 12.6% + 8.4%, Rare 8.4% + 12.6% (10,000-roll checks). Calls GD-5, GD-6. The drop line is a `div` now (a card tile inside a `p` broke it open).
- Decisions: RW2-1, DN2-3, FX2-2, FX2-3 DONE; N22-12 done in the action items. Texts: TX `ui.gd-drop-own` (`tools/i18n_2026_10_22_gd.py`); the Guardian, crit, Explode and Stampede lines edited in `lang/ui` and `lang`. Test: `tests/gd-2026-10-22.js` (new); `dn2` and `lightning` follow the mark. Screens: `docs/screens/GD/`.

## 2026-10-22 (release: batch 10-22)
- Shipped together: BF8, TU, RW2, FX, DN, FX2, DN2 (entries below). Release checks: `node tests/run.js --full` 50 failing suites against main's 49 (the extra two: ed-2026-10-21 passes alone, 134/134, a load timing; keywords-15r's Bounty check updated for BF8; trench fixed by FX2); card-matrix golden accepted (main's was already stale: 56,437 diffs); e2e ui_smoke 0 failures, flows 0 issues.

## 2026-10-22 (package DN2: every damage number in one format, the elemental crit, marks in the battle log)
- **Owner (15:39):** "DN-1 Yes. DN-3 OKAY. DN-4 Yes. DN-2 Im now thinking, can you just make the damage type emoji bigger if it's non physical. e.g. wand for magic becomes big if its crit! or even colour burn it abit? What would the color of the text be btw? a 10% lighter and higher hue version of the original color?"
- **Every damage number reads `<type><number><mark>`, no minus (DN-1):** Poison ☠️, Bleed 🩸, Decay 🍂, Toxin, Strangle 🪢, Curse 🜏 and Chilli 🌶️ ticks; field damage (scorched ground, eruption, comets, lava tide, hail, the depths, ley lines, landslide, arrow slits, the tide-spout); bramble hits on the HP bar (crit 👊, Bulwark ⛨); Pierce and Stampede; Reflect and Thorns; Friction, Recoil, Ichor 🧪, traps, the meteor's crater, Fire on hit, the firepot; splash; the raid's Tentacle Smack and Tail Sweep stamps (a plain "2"; a unit that took a different number or has a mark gets its own). All go through one helper, `dnFloat`, beside `flashDmg`. Source glyphs give way to the type glyph (none for physical) (call DN2-2). Reflect's second "🪞 -N" number is now a 🪞 cue (the number is the hit's). Heals and stat changes keep their look.
- **Marks on every damage event (engine, display only):** poison / bleed / decay / curse / toxin / strangle ticks, field ticks, the tide-spout, wash crashes, traps, floors, Fire on hit, Friction, Recoil, Ichor, Chilli, the meteor's burn and Blood Tithe carry `mods` (`dnModsFor`). `applyDamage` now sets the last marks on every apply (a raw one clears them), so a tick never shows an older hit's mark. `hitModsFor(uid)` is exported for the raid smacks and the firepot. No number changed: card matrix against goldens regenerated on origin/batch-1022's engine, 30,680 fights, 0 diffs.
- **The elemental crit (DN-2):** a crit that isn't physical draws its type glyph 1.4× on a soft burn in the element's colour, without the 👊 (call DN2-1); its number takes the type's colours 10% lighter and 12° up the hue wheel (fire brighter yellow-orange, magic pinker violet, ice a little bluer: call DN2-4). Marks keep their size; a physical crit keeps 👊 (DN-3); normal hits keep their colours. The knobs sit together in `arena_app.js`: `DMG_CRIT_LIGHTEN = 0.10`, `DMG_CRIT_HUE = 12`, `DMG_CRIT_GLYPH_SCALE = 1.4`, `DMG_CRIT_FIST_ON_ELEMENT = false`.
- **The battle log (DN-4):** damage lines carry 👊 before a crit's number and the mark after it ("hit X for 👊14🦴 ❄️ cold damage", "for 0⛨ — blocked to 0 by Armor! 🛡", "took 3🦴 ☠️ poison damage"), and the element glyph where the line names the type (poison, bleed, fire fields, water, acid, psychic). "💥 Crit!" is the 👊 now (an Ambush keeps the words; call DN2-3). Over the card-matrix duels and squads (1,432,431 log lines), 40,112 lines changed (11,294 unique), none errored; the translated templates still match (the marks sit inside their values). The stale "No mind" UI row left the 12 UI packs (the immune psychic number is 💭0🚫).
- Tests: `tests/dn2-2026-10-22.js` (new: tick marks, no stale marks, the number's parts, the crit colour shift, the log's marks, no "-N" float left); `lightning-2026-10-17` and `bp-2026-10-19` read the new source. Calls DN2-1 to DN2-4. Screens: `docs/screens/DN2/`.

## 2026-10-22 (package FX2: one rounding, half up; Landslide 3; volcano hazards 1; the Goliath's Tail Sweep 2 and smack 1)
- **Owner (14:12, FX-2):** "we shall do normal rounding. if x < 0.5, 0; else 1 ... Only round once, when it comes into fruition on the battlefield. Internal calculations should never round. Even when passing numbers between functions."
- **Damage is exact until it lands.** Resist, Weakness, Fragile, Sturdy, Feeble / Mighty, the Ghost / Supreme / Shade / Atheist halves, Shock ×1.5, Rage's half, stone, Armor, a middle / back-row unit's half share, Bloodlust's half, Fork / Trident / Pitchfork half lines, Stagger's half Attack, the Psychic Dampener and a Swimmer's half in the Crushing Depths no longer round. One function, `applyDamage(card, x, …)` in the engine, rounds once, half up (`roundDmg`: under 0.5 is 0, else the nearest whole number, a half going up), then Shell / Shield soak, Health drops by exactly that, and the follow-ups run (hit note, Punish, sudden death, killer, waking, Shell, Nullify). `damageCard`, `damageCardFlat`, Psychic and Thorns all go through it; a bramble's hit is rounded once as it reaches `damageHQ`. The hit event's number is the rounded one (DN's `mods` unchanged). Poison and Decay conversions use the hit's rounded number. No server copy of the engine exists (no `supabase/functions`); the page and every replay run this one file.
- **"At least 1" floors dropped** (rounding patches: a half of 1 is 0.5, which now lands as 1): after a Resist / Weakness / Fragile / Sturdy factor, after the Atheist half (both pipelines), on a half line, on a Swimmer's half in the Crushing Depths. Kept (rules, not rounding): Armor and Scare never take a hit below 0; a field's castle damage and a payment never take a bramble below 1; sudden death's "a hit soaked to 0 still kills"; the +1 per 4 Prayer of a lightning card and Hoard's +1 per N Lumber (counting steps); stat halvings (Cloudy's day bonus, Meiosis' halves) and heals are untouched.
- **What players see:** a 3 into Resist lands 2 (was 1), a 5 lands 3 (was 2); a Staggered 5 swings for 3 (was 2); a back-row 3 still lands 2; a resisted back-row 3 lands 1 (0.75); a dampened Psychic 3 lands 2 (was 1) and Psychic 1 lands 1 (was nothing); a Ghost takes 1 from a 1-point poison tick (was 0); Crushing Depths 1: Swimmer 1, water-resistant Swimmer 0 (as FX); at 5: Swimmer 3, resistant Swimmer 1.
- **Owner (FX-1):** Landslide 1 in 4 for **3** (was 5). The volcano: Lava Tide **1** (was 3), Eruption **1** (was 2), comets **1** to every unit (was a random 2–5), Scorched Ground's editor preset **1** (was 2). Every chance hazard's number × its chance stays ≤ 1 a unit a round, and a map's own number is capped at 5 (`HAZARD_HIT_MAX`). Measured with 3 units a side, rounds 2–20 (all volcano hazards together): very low 0.10, low 0.41 (the only level the maps use: 22-6, 22-8; about 1.35 before), medium 0.64, rising 1.19, high 1.34 (call FX2-1).
- **Owner (FX-3):** the Goliath's pre-core attacks are all AOE: the **Tail Sweep** (your front row, every 2 turns) is the strongest and deals **2** (was 3); the Tentacles' **Tentacle Smack** (a column or a row, every 3) deals **1** (FX had 1–2). No single-target attacks exist. The Core's smack keeps 1–2 (call FX2-2). The classic trench drops its `trenchDmg` 6 and uses the same numbers; `tests/trench.js` holds with the Core's trench bramble at 300 (was the fight's 200).
- **Guardians (owner, future):** backlog row N22-12 in `docs/action-items.md`; the existing 🦺 Guardian covers left / right in a row, not front / back.
- Texts: Landslide "for 3", Lava Tide "1 fire damage", comets "1 fire", Scorched Ground preset "1 fire damage", and "(rounded down)" taken out of the Psychic Dampener, Ghost, Shade, Feeble and Sturdy texts (12 packs and the UI packs, the translations' own brackets removed).
- **Card matrix** (goldens regenerated on origin/batch-1022's engine, 30,680 fights): 488 changed, 96 of them in winner, rounds, bramble Health or units left (48 winners), the rest only hit numbers; every one traced to a half that now rounds up or a resisted 1 that now lands (e.g. Berserker Boar vs War Panther: the Raging boar takes 3, not 2, and loses). Golden not updated (accepted at release).
- Tests: `tests/fx2-2026-10-22.js` (new: the rounding table, the one apply step, hits, Crushing Depths, Landslide's 1 in 4, volcano 1s, raid data); numbers updated in `field-effects-2026-10-16`, `keywords-2026-10-12`, `-14`, `-14b`, `-15c`, `fork-family-2026-10-17`, `raid-arena-2026-10-17`, `u3-2026-10-19`. Calls FX2-1 to FX2-3. Screens: `docs/screens/FX2/`.

## 2026-10-22 (package DN: damage numbers read type, number, mark)
- **Owner:** "Rule <Damage Type Emoji> <Number> <Target's Damage Modifier> e.g. 🔥20⛨ (blocked slightly). If you crit, for normal attacks you can simply use the crit symbol ... ❇❄️14🦴 (15 ice damage (crit) on a fragile enemy.)"
- **A unit hit's floating number is `<type><number><mark>`:** the element's symbol from the attack label (EL's 🔥 ❄️ 🧪 ☠️ 🍂 🪄 💧 🪨 ⚙️ ⚡; Bleed 🩸 and Psychic 💭 keep theirs), none for a plain physical hit. A crit puts the game's existing crit fist first (👊7, 👊❄️14🦴), used instead of the note's ❇ (call DN-3). No minus sign on hits any more (call DN-1). Colours, the heavy-hit size and the crit burst are unchanged.
- **The mark, one per hit, strongest first:** 🚫 immune (0 from Immune, Invincible or a Cower shell), ⛨ blocked to 0 by Armor, 🦴 Fragile, 💢 Weakness or Shocked, ⛨ any reduction (Armor, Resist, Sturdy, Shell / temporary Health, stone, Rage's half, Scare, Ghost / Atheist halving) (call DN-2).
- **Engine:** every `hit` event carries `mods` (the reasons its number moved: `fragile`, `weak`, `shocked`, `resist`, `sturdy`, `armor`, `shield`, `stone`, `rage`, `scare`, `immune`), collected beside the damage maths in `computeHitDamage`, `damageCard` and `damageCardFlat` and never read by them. No damage number changed: the card-matrix signatures (30,680 fights, event order and every hit's damage) are identical to origin/batch-1022's.
- **Fit:** a hit number is never wider than its unit card: the glyphs shrink first (`.df-tight`), then the number (`floatText`'s new `opts.fit`); its emoji are drawn in the chosen set before it is measured. Checked at 390 and 1366.
- **Codex:** the Skills book's contents page has a "Reading damage numbers" line (2 TX keys, 12 packs, `tools/i18n_2026_10_22_dn.py`). The battle log is unchanged (it has its own wording; call DN-4).
- Tests: `lightning-2026-10-17` reads the new crit line. Screens: `docs/screens/DN/`.

## 2026-10-22 (package RW2: reward ranks capped at S, challenge cards, one card drop for every fight, raid drops lowered)
- **Owner (RW-1):** "The max cap is always S. SS and SSS is only for challenge missions." **First-clear card ranks** never ask above S: B for Commons / Uncommons and S for Rare+ on Maps 0–19, A / S on 20–39, S from 40; elites and bosses ask S (was SS, SSS from Map 20). The card-drop gate follows.
- **Challenge cards** ask SS: six non-pack elite rewards, one per four maps from Map 4, the highest rarity there (`source.challenge: true` in cards.json, `tools/challenge_cards_2026_10_22.js`): The Heron Hag (6-8), Echo Matriarch (8-8), Pride Queen (14-8), Yeti Chieftain (19-6), Triumphvirate (23-8), Iron Warden (24-6). The fight panel shows them with a gold frame, a "Challenge" ribbon and the SS emblem.
- **Skirmish drop shares (RW-2):** Maps 10–29 Common 80% / Uncommon 20% (was 75 / 25); 30+ stays 70 / 25 / 5.
- **One card drop (RW-3):** elites, bosses and the rest use the skirmish's pack-card drop (was a 20–100% roll for an enemy deck card), at 7% per ⚡ of the kind's Energy tier, capped at 25%: skirmish 7%, elite / miniboss 14%, boss 21%, world / raid boss and final boss 25%. The fight panel's drop line shows it. A skirmish with a first-clear reward still drops nothing (call RW2-1).
- **Raid fights (owner 12:13):** a card drops 1% when you only survive (was 0%), 12% when the enemy bramble falls, 25% when it falls at S or better (was 100% for any win); the raid's own card stays 1.5% of those (now at most 0.375% a fight). The raid currency and a fall's claim are unchanged (call RW2-4).
- Texts: 3 TX keys, 12 packs (`tools/i18n_2026_10_22_rw2.py`). Tests: `tests/rw2-2026-10-22.js` (new, 10,000-roll checks); `rc`, `easter-eggs` and `card-pass` follow the new drop and the challenge flag. Calls RW2-1 to RW2-4. Screens: `docs/screens/RW2/`.
## 2026-10-22 (package FX: field damage 1, Tentacle Smack 1–2, the Tail Sweep is a tentacle, a see-through middle slot)
- **Owner (12:10, 12:11):** "Crushing depths and similar field effects need to be nerfed. Starting with 1 damage only. The tentacle should also only do 1-2 damage. (50%). Then on the PC version ... It's still the green connected boxes worm effect hitting the first row only." / "The central slot btw, must be translucent, except for the borders and symbolage ... Can this be abit dynamic?"
- **Field damage is 1 a round** (engine `FIELD_DMG_DEFAULT`): Crushing Depths (was 5; the Goliath raid's 2), Hail (3), Glass-storm (a random 1–3; a number on the flag is now its top roll), Lava Spout (3), Leylines III (3 to units and brambles), Thunderstorm (2), Arrow Slits (2). Map numbers brought to 1 (set back to the default): Hail on 22-4, 22-7, 22-8; Lava Spout on 22-5, 22-8; Thunderstorm on 10-7, 10-9; Arrow Slits on 23-7 (3), 24-5, 24-8; `canonical/raids.json` Crushing Depths 2. Not changed: Landslide (chance event), the volcano hazards and Scorched Ground, Tide-spout (already 1), Ash Rain (call FX1).
- **Halving at 1:** a Tide unit or Swimmer in the Crushing Depths takes half, at least 1, so 1 at the default. A Swimmer or Tide unit that also resists water takes half rounded down, then Resist: 0 at 1 damage, 1 at 5 (call FX2).
- Texts (field cards, Codex, battle log; TX keys and `lang/ui`, 12 packs): "1 water damage a round", "1 ice damage a round", "A column bursts: 1 fire", "The walls shoot 1 a round", Leylines III "1 damage to all", Glass-storm "1 glass a round"; the Crushing Depths Codex line now says a Swimmer or Tide unit with Water Resist takes none.
- **Tentacle Smack deals 1 or 2** (`canonical/raids.json`: `dmgMin 1, dmg 2`, was 6): a seeded 50/50 per smack (`raidSmackRoll`, salt 3, so replays repeat). The tentacle stamps the number it rolled ("🦑 −2") over the struck units, and the log line says it. The bramble's ability line reads "1–2 damage". The Tail Sweep keeps its 3 (its own data). The classic trench keeps its 6 (`trenchDmg`, so `tests/trench.js` balance is unchanged).
- **Desktop "old effect": not a desktop branch.** Reproduced headless at 1366 and 390: the Tentacle Smack plays the purple tentacle at both widths (event path and a real round). The green, scaled "worm" sweeping the front row is the **Tail Sweep**, the Goliath Tail part's own attack (`pattern: frontRow`, always your front row), drawn by `M.tailSweep`. It is now the same purple tentacle lying along your front row, out of the bramble's side (`M.tailSweep` stays for the Effects Lab). Its front-row rule is unchanged (call FX3). Column smacks find their column by the slot (`data-w2cell`), as the red telegraph does.
- **Cache:** no service worker exists, and the whole game is inlined in `index.html`, so a deploy reaches every browser on reload; `version.json` already shows an Update banner. `vercel.json` now also sends `Cache-Control: no-cache, must-revalidate` for `/`, `/index.html` and `/version.json`. The desktop app (`electron/`) runs a local build (`npm run start:staged` copies one into `electron/game/`), so it only updates when rebuilt.
- **Middle slot (✦):** its fill is a faint wash (9%) so the ground shows through. It used to be a solid mix with the page colour, a pale box on the raid's dark sea. The border and the ✦ are fully opaque, in an ink picked from the ground: `syncSlotInk` reads the board's art once per ground (24×24 average luminance, darkened by the tint layers over it) and sets `data-slot-tone`. On a dark ground it is a light gold with a dark outline, and on a light ground a dark bronze with a light outline. Applies to every fight. Under `file://` the art can't be read, so the board colour decides (dark).
- Tests updated for the new numbers: `field-effects-2026-10-16` (the halving rules now checked at an explicit 5, plus the 1 defaults), `raid-arena-2026-10-17`, `raid-stages-2026-10-18`, `u3-2026-10-19`, `x2-2026-10-18`; `tools/raid_full_sim.js` and `mx-2026-10-19` load the new smack helpers.
- Screens: `docs/screens/FX/`.

## 2026-10-22 (package BF8: Bounty only where it fits, Tide without the light bonus, Blinding priced, Purblind ×0.7, the Green Dragon simplified)
- **Owner (11:58 / 12:00):** "Tide: Just the flat charge is enough. Dont do the minor bonus." "Blind*ing gives blind … Blinding will be a flat skill not a multiplier - you guess at what it will be. Purblind will be 0.7x." "Simplify the dragon's skills I guess. 1/7 is too weak." "Remove bounty from all cards with bounty. Only those thematic - like the trash panda."
- **Bounty:** removed from 53 cards. It stays on 8 that carry loot: Trash Panda Trickster, Raccoon Bandit, Raccoon Warlord, The Magnate Duck, Chipmunk Stockpiler, Pack Mule, Riverside Peddler, Beaver Lumberjack. The five dragons lost it too.
- **Green Dragon:** Bounty and Overwhelm off (Flying, Poison, Supreme left): 1/7 → **3/20**. White Dragon 1/11 → 2/23, Black Dragon 8/8 → 9/9. Red and Blue Dragon still have no legal line (call BF8-3).
- **Formula (`bramblewood-budget.js`):** Tide is out of LIGHT, so a plain-Tide card pays its flat 1.5 with no ×1.02 on N; Tide {…} braces stay 0.4 × their contents. Blind is no longer a half-miss quality: the skill is shown as **Blinding** (editor label, 12 packs) and costs 2.5 (estimate, call BF8-1). Purblind takes fragileUse ×0.7 on both caps' left sides, like Fragile. The game's Test Lab list and `tools/skill_costs.js` follow.
- **Re-fit by formula** (`tools/refit_pass_2026_10_21.js`, the 142 Bounty / Tide / Blind / Purblind cards): 62 moved, e.g. Alpha Howler 1/1 → 6/6, Nautilus Drifter 1/3 → 4/12, Elderhorn Monarch 1/14 → 2/28, Horned Lizard 4/5 → 5/7; plain-Tide cards lose about 1 Health. Five flagged cards now fit (Alpha Howler, Boar Rampager, Fox Warchief, Lodge Engineer, Tiny Cave Dweller); 103 band cards still have no legal line (`docs/balance/human-pass-1-flagged-2026-10-21.json`). The re-fit tool gains `--list-all`.
## 2026-10-22 (package TU: the T-0 stall, the start map, tutorial first-clear cards, Profile on phones)
- Owner, 11:58: "After completing T1, it doesn't progress. It's stuck there. (It might be because I reset my account - not sure) I think it's cause, it's
  supposed to be a unique map with T1 and T2 side by side. Only once completing T2 do you see the full map and the tutorials as their own submap."
- **The stall:** Profile → Reset all keeps Admin Mode, and Admin Mode skipped the start map. A reset admin account won T-0 and landed on the
  Outskirts, which show no fights until Tutorial II is won, while T-1 sat on the Tutorial map it was never sent back to. The start map now holds for
  everyone until Tutorial II is won (only the layout editor looks elsewhere). Reproduced headlessly (fresh save, Admin Mode on) before the fix and
  played through after it, at 390 and 1366.
- **The start map stands alone:** T-0 and T-1 side by side in the middle (was their diagonal shape), no map list beside them. A T-0 win no longer
  opens the world early (the Tutorial's own fights don't count), so the "The world opens up" toast waits for the real moment. After Tutorial II:
  the Outskirts with the 🎓 Tutorial submap entrance; inside, all five fights, the later three locked until 0-4, 7-6 and 17-8 (unchanged gates; call TU-1).
- **Saves that already finished the tutorials:** the Tutorial II flag now travels with the cloud progress, and a save whose progress shows Tutorial II
  won (mtut:tutorial2, or any cleared road fight) gets the flag back on load, so a pulled save lands on the full map instead of the start map.
- Owner: "The Skirmish rewards (first time) for Tutorial are not shown." **T-0 and T-1 now show their first-clear cards** in the fight panel (T-0 the
  Quarry Mole; T-1 your side's two cards), with no rank emblem; a won tutorial shows them ticked. T-2 to T-4 already showed theirs.
- Owner: "In mobile mode, the Profile icon should be a button in the main menu." **Phones get a 👤 Profile note** in the Home menu, beside Quests and
  Achievements (TX `ui.home-profile`, `ui.home-profile-sub`, 12 packs). Desktop is unchanged (call TU-2). Calls TU-1 to TU-3.
- Tests: `tests/tu-2026-10-22.js` (new); `tests/tutorial-2026-10-18.js` checks the side-by-side pair. Screens: `docs/screens/TU/`.

## 2026-10-22 (package RW: first-clear card ranks per card, skirmish card drops, the drop line)
- **First-clear card rewards:** the rank is per card now (replaces "none on Maps 0–5, B from 6, A from 21"): at least B, S for a Rare or above, SS for any card in an elite or boss fight,
  one step up every 20 maps (Maps 20–39: A, SS, elites SSS; 40+: S, SSS), capped at SSS. Resources need only the clear; tutorial fights need nothing. A fight paying a Common and a Rare
  shows a different emblem on each card, and a later better win claims the cards it missed. Random card drops land only when the win's rank meets the gate for that card's rarity.
- **Skirmish card drops:** a skirmish with no card reward, token or free pack drops a pack card on 7% of wins (was 10%): Common only on Maps 0–9, Common or Uncommon from Map 10, a rare Rare from
  Map 30, then 5% one rarity down and 5% one up (a second 5% for another up). Half the time it is one of the fight's own pack cards. Other fights keep their old drop. Calls RW-1 to RW-3.
- **The fight panel** shows `Possible drops: 🥚 2% · 🃏 7%` and the rank emblem the card drop needs. Rank words are gone from the results chip, the loss headline, the Dragon Scale trail and the tooltips: the hex emblem instead.
- **Texts:** the six budget strings now describe BF7's rule (f × ((2A+H) × m + S) ≤ N …), and BF7's English fallback lines in the card editor are gone. New texts are translated in the 12 packs (`tools/i18n_2026_10_22_rw.py`).
- Tests: `tests/bf5-2026-10-21.js` asserts `fragileUse` 0.7 (was `fragileMult` 0.75).

## 2026-10-22 (package BF7: pass III applied, the half-miss on stats only, Fragile ×0.7)
- **Card stats:** 124 band cards re-fitted by formula (111 grow, mostly +1 or +2 Health; 12 come down, most of them cards that had no line before: White Dragon 4/19 → 1/11,
  Green Dragon 3/18 → 1/7, Gatling Hog 3/11 → 1/4). Mayfly Dancer 3/7 → 2/7. Band cards with no legal line 130 → 108;
  they keep their stats (`docs/balance/human-pass-1-flagged-2026-10-21.json`), and `docs/balance/hand-pass-2026-10-22.md` gives each the cheapest one change for the owner (not applied).
- **The formula** (owner, calls BF7-1 to BF7-3): the half-miss ×1.5 now counts on Attack and Health only, not on skills; Fragile is ×0.7 on the left side of both caps
  (`fragileUse`, replacing N × 0.75), so a Fragile card gets more stats. One copy, `capScores` in `bramblewood-budget.js`, used by `tools/skill_costs.js`, the editor's budget
  panel, the Test Lab, the hub's Budget & stats and the swap suggestions. Skills priced by a multiplier now cost 0 (Fragile, Blind, Evasive, Swift).
- **Prices:** On Attack 3 → 1.35, Add Wait 3.5 → 2.8, Twin Strike 6 → 3.17, Octolash 25 → 6.48 (their measured worth); Bounty stays 3.
- **The owner's 5 live edits of 10-21** folded in with his stats (call BF7-4): Conch Crawler, Ford Kingfisher, Glacial Ape-King, Tide Pool Crab, and the new Ember Tetra (no source yet).
  `tools/fold_server_overrides_2026_10_22.js`, `tools/hand_pass_2026_10_22.js`.

## 2026-10-22 (skill costs pass III: proposal only, nothing applied)
- **Proposal for the owner, nothing applied:** `canonical/skill-costs.json` and `canonical/cards.json` are unchanged. Five price cuts, each backed by a measurement it sits above: Bounty 3 → 1.84, On Attack 3 → 1.35,
  Add Wait 3.5 → 2.8, Twin Strike 6 → 3.17, Octolash 25 → 6.48. The owner's own pass I cuts are kept. In a dry-run re-fit of every card, the cards with no legal line go from 130 to 116. The owner's further
  options (floor-only measurements, his own prices above the halved-world measure, skills the standard test can't see) would bring it to 54. Each card still without a line gets its cheapest
  one-skill fix, and the doc shows what each Fragile reading (drop the −8 or drop the ×0.75) does to the Mayfly Dancer.
  `docs/balance/pass-3-proposal-2026-10-22.md`, `docs/balance/pass-3-skill-costs-2026-10-22.json` (ready for `tools/hub/apply_skill_costs.js`), `docs/balance/pass-3-dryrun-2026-10-22.json`,
  `tools/pass3_skill_costs_2026_10_22.js`.
## 2026-10-22 (package SK: skirmish sizes 5-7, leaders from Map 2, Sergeant Bramblefox moves to Map 13)
- **Skirmish sizes (owner 09:52):** every skirmish on a main map or side map holds 5-7 different cards (149 fights: 47 with 5, 94 with 6, 8 with 7; was 17 with 4, 28 with 7
  and 14 with 8-12). A 7 only where one card clearly leads (7-2, 22-4, 2-A-3, 19-A-5, 14-A-3, 20-B-1, 18-A-3, 18-A-7). New cards come only from the map's pool and the road's
  rarity ladder; a fight's reward card stays on its deck; total copies and battle rating stay within about 10% (three fights with a Common-only body rise more: call SK-3).
  Not changed: the Tutorial lessons (T-2, T-3), the endless floors, elites, bosses, Map 0 (already 6 each). `tools/skirmish_sizes_2026_10_22.js` plans, applies and checks it.
- **Leaders:** from Map 2 on (a side map counts as its parent) every skirmish's leader is its showcase card, the chosen one or the Auto pick (`skirmishLeadersOf` in
  `arena_app.js`, used by the fight setup, the battle rating, the leader grants, the rank caps and the curve cache). The CPU brings it out from reserve as before; the leader
  stays in the deck too; an explicit `node.leaders` wins; nothing new is shown to players. 14 fights got a hand-picked showcase where Auto is a small card (call SK-2).
  The Edit skirmish screen says which card leads when none is picked.
- **Sergeant Bramblefox:** Heroic -> Rare, 4/12 -> 3/10 (re-fitted by the formula), moved from Map 0 (0-4) to the leader of 13-2 Fox Run (Map 13, the Greenhood Band's
  foxes), paid when 13-2 is cleared and no longer on 0-4; Map 13's pool holds it as SPECIAL. Call SK-1.
- `tools/lib_bramble.js` exposes the leader helper and the battle rating to the balance tools.

## 2026-10-22 (package DV2: skirmish rewards by new cards, the ladder to Mythic, the map pools in three tiers, Load any card as its own modal)
- **Owner (07:41):** DV1, DV3, DV5 and MP's calls answered (DONE in `docs/decisions.json`; new call DV8, the Magnate Duck).
- **Skirmish rewards per map** follow its new cards: "If 10 new cards from that map, 3 skirmish rewards. If 6-9, 2. If <6, 1." New = a pool card that first
  appears on that map (not carried over) and that the map gives out (Base and starter cards don't count). **3:** Maps 2, 3, 4, 5, 8, 9, 10, 14, 15, 16, 17, 18, 19, 20, 22, 24;
  **2:** Maps 0, 1 (the Badger Lumberjack stays at 1-5), 6, 7, 11, 12, 13, 23; **1:** Map 21 (the Eagle Sharpshooter is a pack card again). The 16 third rewards come from
  the stronger, thematic fights (Conch Herald 2-4, Peregrine Stooper 3-5, Polar Bear 17-6, Obsidian Scorpion 18-5 ...) and the rest stay pack cards of their map.
  `canonical/card-obtain-maps.json` regenerated (no change: the map numbers did not move). 10 enemy decks rebuilt (the fight's reward card is always on its deck).
- **The road's ladder:** Epic 22 (as before), **Heroic 25** (was 22), Unique 30, Legendary 40, **Mythic 60** (was 55); **Ancient, Divine, Void and Daemonic never appear
  on road skirmishes, rewards, packs or the faction track** (`ROAD_NEVER`); Mythic is the road's highest rarity. The Volcano Lair and the Eye of the Volcano still introduce
  Heroic and Epic. On Maps 21+ one thing broke: the Magnate Duck (Heroic) in Map 24's boss deck; it is swapped for a third Gilded Swan Knight (DV8).
- **`canonical/map-pools.json`, three tiers** per main map: `{cards: [MAP], submaps: {<id>: [that submap's cards]}, special: [added via + Load any card]}`; one SPECIAL
  covers the map's submaps' fights. Migrated from the old shape (each submap's cards its list; all 13 special entries merged into the maps' one list). The build inline,
  the live `__cfg:map-pools:<mapId>` rows (old rows read as the new shape, written back as new), `tools/fold_map_pools.js`, the usage counters and DV's check all follow
  (`tools/lib_map_pools.js`, `tools/map_pools_migrate_2026_10_22.js`).
- **Map cards editor:** exactly three sections: **MAP**, one **SUBMAP** per submap, **SPECIAL**. Main maps only in the map list (a submap opens its parent, scrolled to it).
  No Cards <-> Special toggle: a card moves to a submap (or back to MAP) from a "Move to..." select, or is removed; Add cards targets MAP or a submap. SPECIAL fills only from Load any card.
- **Skirmish deck pickers** offer MAP + SPECIAL for a main-map fight, MAP + that SUBMAP + SPECIAL for a submap fight. **+ Load any card** opens its **own modal** (the whole
  catalogue, the Codex filter bar and search, large cards) over the picker; picking a card adds it to the deck (a deck cap can refuse it) and to the map's SPECIAL, then closes it.
- Texts: 3 new strings, 7 dead rows pruned, in the 12 packs (`tools/i18n_2026_10_22_dv2.py`). DV's check (`node tools/map_divvy_2026_10_22.js check`) is updated for the reward
  rule, the ladder, the shape and "the reward is on its fight's deck". Checked: JSON, `node --check`, the build, DV's check, a headless run (tiers per fight, Load any card,
  old-shape rows, move and remove) and shots at 390 and 1366 in `docs/screens/dv2/`. No test suites run (owner). Expect `tests/road-rarity-2026-10-16.js`, `tests/rewards-pass-2026-10-21.js` and the card matrix to need their goldens at release.
## 2026-10-22 (package CB: the Galactic Condor turns and manoeuvres to fire its Position Beam)
- **Owner (07:42):** "It must animate to look like it turns and manoeuvres to fire the beam." Before the beam fires, the Condor now takes up the stance for where it stands:
  **centre** rears up, then dips its head forward and aims straight across; **side** banks and turns toward the angle it fires at, with a small lift and a gentle sway;
  **edge** coils, then swings right round to face along the row and keeps turning as the beam sweeps across (nearest unit first). A recoil as the beam fires, then it settles back into its slot.
- GSAP transforms on the card only (no filter, no blend layer); a rising whoosh and hum (`SoundKit.beamTurn`). Effects Low and reduced motion: no manoeuvre, the beam as before.
  Code: `positionBeamVfx` in `arena_app.js` (the `positionBeam` branch of `renderVfxForEvent`; `delayForEvent` waits for the pose). Engine and texts untouched.
- Effects Lab: the Position Beam is on the "Built 10-21/22" tab (7 looks, In game badge). The Lab now carries `hasGsap`, `reducedMotion`, `fxLevel` and `fxAtLeast` shims.

## 2026-10-22 (package DV: the map divvy, the rarity ladder, map pools)
- **Each main map has a pool of 6-10 creatures** (`canonical/map-pools.json`, the map editor's file): its enemy decks are built from it, 1-2 of
  them are its skirmish rewards and the rest are basic-pack cards with that map. 305 former skirmish rewards became pack cards of their map.
- **The rarity ladder:** Map 1's last match brings the first Uncommon (the Badger Lumberjack), Map 2 has two, the first Rare is on Map 5, the
  first Very Rare on Map 10, the first Super Rare on Map 20; the Volcano Lair reveals Heroic and the Eye of the Volcano Epic. Packs, the base
  track and the faction track only give a rarity once it is revealed (and a pack card once its map is reached).
- **175 enemy decks on Maps 1-24 rebuilt** from the pools (sizes, kinds and named bosses kept; Map 0, tutorials and raids untouched).
- **32 cards re-ranked** (Base and faction cards spread out; Rares off Maps 2-4; a Very Rare per map from 10; the Caldera Wyrm, Magnate Duck
  and Fire Drake Hatchling Heroic, The Contradiction Epic) and re-fitted by formula with 25 cards whose obtain map moved.
- **Side maps re-gated** (Clovermead after Map 12, the Mycelium Deep after 8, the Sunken Depths after 11, the Sunken Grove after 13, the
  Glimmer Depths after 16, the Pale Desert after 19); the faction track's Very Rare waits for Map 20 and the Volcano Lair.
- Report: `docs/map-divvy-2026-10-22.md`; owner calls DV1-DV7.

## 2026-10-22 (package MP: Map cards, the card pool of each map; the skirmish deck pickers read it)
- **Owner (00:51):** "Introduce a map editor for cards. It lets me select cards relevant to this map ONLY ... The cards are seen in full, large forms ... when editing the deck of the skirmishes, they only show cards from this set. I have to press a special button if I want to load in a new card (this goes into the map editor set's 2nd tier called special cards)." (00:57): three small usage numbers on every card.
- **Map cards (admin):** from the map's edit bar (🃏), the skirmish editor (next to Edit deck), and Admin. Pick a map or a submap; sections Cards, Special and, for a submap, the parent's Cards (read only, folded). Real card faces, Large or Medium; click a card for its detail sheet; ✕ removes, ⇄ moves Cards ↔ Special. An Add cards panel with the Codex's whole filter bar (types, animal, phylum, rarity, archetype, skills and skill groups, sorts) and a search; click a card to add it to Cards or Special. A summary: rarity counts and the Lumber and Wait spread. On a phone the pool and Add cards are two tabs.
- **Used counters:** each card shows "this map · its submaps · other maps" (copies in normal, elite and boss decks and dungeon wave decks, from the live map data, the owner's edits included; zero is dim), and the Add cards sort has "Used elsewhere".
- **The deck pickers read the pool:** the skirmish editor's Edit deck (and a dungeon's wave decks) and the Card gallery offer the fight's pool under tier headings (a submap fight: parent Cards, its Cards, its Special), in large cards, with the same filter bar. **+ Load any card** shows the whole catalogue; a card picked there joins the deck and the map's (submap's) Special tier, with a note. Deck cards outside every tier get a ⚠ chip with a one-click **Add to Special** (also in the skirmish editor's deck list).
- **Data:** `canonical/map-pools.json` (every map, empty lists until package DV fills it), inlined by `assemble_arena.py`. Live edits save as `__cfg:map-pools:<mapId>` rows through `cloudWriteCardOverride` and win over the file at load (newer of this browser's unpublished edit and the row, as map-nodes). Fold: `node tools/fold_map_pools.js <dump.json>`; clearing SQL proposed in `supabase/proposed/20261022_clear_map_pools.sql` (not applied); steps in `docs/workflows/card-data.md`.
- Texts: 44 TX keys (`ui.mp-*`) in the 12 packs (`tools/i18n_2026_10_22_mp.py`). Owner calls MP-1 to MP-4 in `docs/decisions.json`. Checked: `node --check`, the build, shots at 390 and 1366 in `docs/screens/mp/`, add / move / remove / Load any card run in a headless browser. No test suites run (owner).
## 2026-10-22 (package DR: deck caps on the top ranks)
- **The rule (owner):** per deck, the leader included, at most 3 Legendary, 2 Mythic, and 1 each of Ancient, Divine, Void and Daemonic. Each rank's cap is its own; copies count. A flagged rarity counts as its rank (dev-Legendary is a Legendary). The numbers live in `bramblewood-budget.js` (`DECK_RANK_CAPS`).
- **Deck builders:** a card past its rank's cap can't be added in the Camp/Play deck editor (click, drag), the Standard deck, the leader picker (greyed) or the admin skirmish/dungeon/tutorial deck popups and editor; a chip says why ("Deck limit: 3 Legendaries"). A deck over a cap shows a pill in the editor.
- **Before a fight:** Quick Battle, Conquest, Dungeon, Live Ranked and friend invites refuse a deck over a cap and say which rank and by how many.
- **CPU and generated decks:** enemy decks (`levelledEnemyDeck`, dungeon waves) are fitted before the fight: the weakest excess copies are swapped for the highest card below the caps that shares their theme. Ghost and PvP stranger decks, the vs-AI random deck and the Autobattler draft (offers, boon copies, bench moves, recorded opponents) respect the caps; recorded PvP/Async decks are checked with their leader.
- Texts: 5 new keys, translated in the 12 packs.

## 2026-10-22 (skill costs: human pass I + Claude pass II; 360 cards re-fitted)
- **Pass I (owner):** 259 skill-cost edits from the hub, applied to `canonical/skill-costs.json`.
- **Pass II (Claude):** 16 of the owner's raises were brought down to their strongest measurement where they sat more than 50% above it, e.g. Earthquake 8 → 0.44, Cast Darkness 6 → 0.54, On Ready Gold 10 → 6.24, Vulnerable 4 → 1.93. The hub entries were updated to match.
- **Re-fit by formula:** 360 cards moved to the largest line on their own shape that holds both caps. 124 cards have no legal line under these prices; they keep their stats and are flagged.
- **Fragile:** now −8 as a skill and also ×0.75 on N, which looks like a double count (owner call).
- Report: `docs/balance/human-pass-1-2026-10-22.md`.

## 2026-10-21 (package LAB2: the Effects Lab catches up with today, and its field stays in view)
- **Owner:** "Update the effects lab with all the new effects" and "make the 'field' sticky to the top". Nothing in the game changed; this is
  the Lab only (`tools/effects-lab/`, rebuilt with `python3 tools/effects-lab/build.py`, hub not republished).
- **The field is pinned on every tab that has one**, on a phone too (a third of the screen at most): Skills, Battlefield and Damage numbers
  pin the field; Procedural FX, Card ideas, Cards, Combat and Screens lift the pressed tile's stage into a pinned bar; Card displays and Foils
  pin their controls; the Catalogue's stage is a strip under the tab bar on a phone, showing the battlefield only.
- **New tab "Built 10-21":** 21 entries, 48 looks, of what was built today and the Lab did not show (EV, MT, TR, UI3, EL, RK, BX, FG),
  played with the game's own code, each with "In game: where". (ED, HC, TS2, CX2, CX5 and HB2 added no effect of their own.)
- **New tab "Ideas 10-21":** 29 candidate effects with two to ten looks each, all "Lab only (not used yet)", filter chips: ten element hits,
  an element aura, four title moments, three evolve looks, five weather and time-of-day looks, three status looks, three raid moments
  (`bramblewood-fx-ideas.js`, `window.IdeasFX`; not in the game bundle). Listed in `docs/effects-catalogue.md`.
- Checks run: `node --check` on the changed scripts, the Lab build, a script-syntax pass over the built page, every entry of both tabs played at
  390 and 1366 px with no console errors, screenshots viewed. No test suites were run.

## 2026-10-21 (package AR: the Arena as a place; two PvP buttons; dungeons to the map; the match log; admin raid tickets)
- **Owner (22:41), on the Arena page:** "Background."; "PVP should be top, split into two PVP buttons - Collection PVP or Standard."; "Dungeon games don't belong there. They belong in the Conquest Map."; "Showcase the field effects more centre and prominently, using hover to see the effect. Limit the text on the screen as much as possible."; "recent opponents can be moved to profile instead. With PVP and PVE log."; "give me a way to get more raid tickets as admin."
- **The Arena is a place, like the Stomping Grounds:** the tourney ground (map art `marena`) under a darkening veil, bunting, a hanging plank sign ("🏟️ The Arena"), dust off the sand (off under reduced motion). Laurels, deck and 🏆 as small chips under the sign. Loading (a skeleton) and error ("Try again") states.
- **Two big PvP buttons at the top:** 📚 **Collection PvP** (your cards and decks: the old PvP) and 🃏 **Standard PvP** (the existing Standard format: every card at Level 1, no foils, a Standard deck from any card, against the same strangers at Level 1). Both use the PvP tickets and move the rating (owner call AR-1). Under them: tickets, rank and a **Standard deck n/20** button. A Standard deck is not recorded as a stranger for Collection PvP.
- **Today's field, centre stage:** one big Environment card per rule (150 px; 112 on phones) with its art and one short line. Hover, keyboard focus, a tap or a long press shows what it does in a bubble; the rule texts are off the page otherwise. Tomorrow's icons and the hours left sit in the heading.
- **The other modes are small tiles** (Quick Battle, Pass & Play, Gauntlet with its streak, Caged Fight, Autobattler, Ranked Live), icon and name only, details in their tooltips; the Collection / Standard switch for them is in the heading.
- **Dungeons left the Arena.** The Arena's 3-fight Dungeon became **the Undercroft**, a daily dungeon under Map 11 (the Arena's map; an entrance on the map, a card in Daily Dungeons, a stop on the World map). It uses the daily dungeon keys, 50 floors, each harder; **every 3 floors the land changes** (15 maps' first elite deck and field rules, weakest first by battle rating); a mini-boss every 10th floor fights that land's boss deck (`endlessDungeon` takes a `themeOf`). Owner call AR-2.
- **Group dungeon:** the Daily Dungeons tab ends its list with a **Group Dungeon** slot, "Coming soon": there is no co-op dungeon in the game yet (D49's design only). Owner call AR-3.
- **The match log (Profile):** the Arena's recent opponents are now a **📜 Match log** on the Profile with **⚔️ PvP / 🗺️ PvE** tabs (opponent, mode, Standard, result, date, your deck's name from now on); a row opens the deck you faced. It opens on the tab of your latest fight and keeps 40 fights (was 20). The signed-in Match History stays below it. Owner call AR-4.
- **Admin raid tickets:** 🎫 +1 / +5 / Set (any number, past the cap of 10 too) in Admin and on the raid hub in Admin Mode. It writes `myCurrencies.raidPoints` as the Raid Ticket item does and syncs through `saveCurrencies` (`raid_points`); no SQL.
- Ids kept: `continueAsyncBtn`, `startPvpBtn`, `stdDeckBtn`, `startVsAiBtn`, `startVsPcBtn`, `startGauntletBtn`, `cagedPanel`, `startCagedAiBtn`, `startCagedPcBtn`, `openAutobattleBtn`, `startLiveRankedBtn`, `liveQueueStatus`, `cancelLiveQueueBtn`, `arenaAchvBtn`, `[data-arena-format]`. New: `startPvpStdBtn`, `[data-ar3-field]`, `#matchLogPanel`, `[data-ml-tab]`, `[data-admin-rt]`. Gone from the Arena: `dungeonPanel`, `startDungeonBtn`, `abandonDungeonBtn`, `[data-ro-view]` (now inside `#matchLogPanel`; `tests/e2e/ui_smoke.py` step 7 opens the Profile).
- 36 new TX keys (`ui.ar-*`, `map.uc-*`, `toast.ar-admin-rt`, `toast.admins-only`) in the 12 packs (`tools/i18n_2026_10_21_ar.py`); 13 stale `lang/ui` rows per pack pruned. Map art: `muc` (the caves recoloured to sandstone, `MAP_ART_DERIVED`). Checked: `node --check`, the build, a headless run (Standard and Collection PvP start with the right format and use a ticket; an Undercroft floor starts and uses a key; the admin +5 lifts the hub's tickets 10 → 15), shots at 390 and 1366 in `docs/screens/ar/`. No test suite run (owner).

## 2026-10-21 (package FOG: Fog of War, a per-fight field setting)
- **Owner:** "a fog of war effect": enemy cards in far columns show only their art; details are "?".
- **Switch it on:** the new **Fog of War** field effect, in Edit skirmish ("Add a field effect") or a map node's `rules: {fogOfWar: true}`. Off by default. **Fog of War (advanced)** adds `fogPeek`. It shows as an Environment card (Mist art for now). Not offered in raids.
- **Reach:** a column is in reach if a live unit of yours is in it or beside it (the centre is always open, as for placement). An enemy outside it is fogged.
- **A fogged enemy** keeps its art, name and frame. Attack, Health, Wait, the element plate, the skill chips (one "?" chip) and statuses read "?". The tooltip and hold sheet say "Hidden in the fog" and have no detail page.
- **Revealed** while in reach (so while faced). A unit of yours with **Darksight, Keen Eye or Illuminate** reveals what its column and the two beside it hold for the rest of the fight. A unit that leaves reach unrevealed fogs again. Reveals fade the mist off the card.
- **Advanced peek:** each fogged enemy has a 50% chance, decided once per unit from the fight's seed (a separate stream; the engine's RNG is untouched), that one detail shows: Attack, Health or one skill chip.
- **Information only:** combat, targeting and the CPU never read it, and the CPU's view of you isn't fogged. Single-player and live fights on the Open/Gladiator boards; not Pass & Play, raids, Collapse or the tutorial.
- **The look:** a mist veil on each fogged card (no filter) and one drifting layer over the enemy row with a bank per out-of-reach column, at 30 fps, paused when the page is hidden, still under reduced motion or low effects. The Effects Lab's Fog banks stay Lab-only (a one-shot, not a standing layer).
- Code: `fogOfWarView` and `fogPeekRoll` (pure, end of `bramblewood-engine.js`); the fog block before the Changeling disguise in `arena_app.js`; the CSS block at the end of `arena_template.html`. 11 new TX keys, in the 12 packs.
- Checked: `node --check`, the build, a headless run of the reveal rule (16 checks, plus a seeded sim identical with the rule on) and shots at 390 and 1366. No test suite run (owner's request).

## 2026-10-21 (package TR: titles, transforms and the Crown; HB2-1's two-skill count; CX1–CX4; the structures re-fitted)
- **Owner (18:23, 18:24):** spec and what was built: `docs/titles-transforms-2026-10-21.md`.
- **The Crown.** One on the battlefield.
  - **King** (👑): the first King in play takes the Crown. While it holds it, it has **Kingly**: Tribute 1 and +2 Armor by default, or the
    card's own King – {…}. A King played while another holds the Crown is uncrowned. The holder wears a 👑.
  - **Its holder dies with no source unit** (poison, a spell, the bramble): the Crown falls to the ground. An allied King picks it up, or
    it fades into +1 Gold for that side.
  - **An enemy unit kills it:** a **Usurper** that struck the blow steals the Crown (Usurper is extended; no new skill). Otherwise the liege
    grants it to a random King on the killer's side, or it fades into +1 Gold for the killer's side.
  - A faded Crown is gone for the fight. A holder that leaves play without dying drops it.
  - **King Slayer** now hits Royalty, Kings (the type or the skill) and the crowned unit.
  - Look: a crown flies to the new holder, falls and bounces off a dead King, or fades into the Gold pill. Log lines for each.
- **Gold is back in the fight** (pl.gold, its own 🪙 pill). **Tribute N** (new) pays N Gold each turn while Ready. Nothing spends Gold yet;
  it counts toward Gilded.
- **Transforms** (CX2's format, for the rest of the fight): five new presets.
  - **Gilded:** your resources are worth over 25 (Lumber 1, Stone 2, Metal 3, Gold 5): +5/+10.
  - **Championed:** its own attack (or Counterattack) kills the enemy it fights: +3/+3.
  - **Veteran:** it survives 3 rounds: +2/+4.
  - **Enraged:** its Rage is on: the card's braces.
  - **Matured:** it survives N rounds (2): an evolute played onto it gains +2/+4 Stem stats.
  - Each has its icon, a look on the unit (Gilded's gold sheen and falling leaf) and a log line. Editor: the presets and the unit's
    conditions are in the Transform row; empty braces take the preset's default. No card has one yet.
- **Two skills (HB2-1):** plain Flying, Tide, Diurnal and Nocturnal don't count; several count as 1 (`bramblewood-budget.js`
  `skillCountOf`, `tools/two_skills_2026_10_21.js`, a warning line in the editor's budget panel). The Swordbill Challenger is within the rule.
- **Costs** (`canonical/skill-costs.json`, theoretical, not owner-set): King 2.39, Kingly 5.98, Tribute 0.5 a point, Gilded 8,
  Championed 3.6, Veteran 3.2, Matured 3.2, Enraged 0.4 × its braces, plain Crepuscular 1 → 1.6 (CX2).
- **Cards** (all re-fit by formula with `bf6_rederive --only`; the tool's drift on Tunnel Ant, Dragonscale Mail and Caldera Wyrm not applied):
  - **69 cards got back the skill BF5 cut only because a free skill counted** (`tools/tr_cards_2026_10_21.js`). 45 still fit: e.g.
    Colossal Squid 7/17 → 4/20 (+Tide), Voltaic Eel 3/10 → 1/7 (+Tide), the owls +Nocturnal, the eagles +Diurnal. **24 drop to their
    1/1 floor** (owner call TR-1), e.g. Permafrost Mammoth 2/20, Orca Vanguard 1/21, Mangrove Manatee 2/17. Bounty is back on 7 (TR-2).
  - **King:** Rodent King 4/15 → 4/14 and Glacial Ape-King 7/36 → 7/34 (Bounty off), Yeti Chieftain 5/22 → 5/20, The Gannet Queen
    3/9 → 1/10 (TR-4).
  - **CX2:** Nightjar Drifter 3/6 → 2/8, Woodcock Lookout 3/8 → 2/9.
  - **The structures at Attack 0 (N21-12):** Webspire Sentinel 0/10 → 0/19, Elder Willow 0/29 → 0/39, Riverworks Bastion 0/25 → 0/29,
    Vampire Roost 0/17 → 0/24 (+Bounty), Thornwood Palisade 0/14 → 0/16, Iron Warden 0/22 → 0/32, War Elephant 0/24 → 0/28.
- **Decisions:** CX1–CX4 and HB2-1 are DONE (CX5 already was). New owner calls TR-1 to TR-6.
- Texts: TX keys in the 12 packs (`tools/i18n_2026_10_21_tr.py`). Screens: `docs/screens/tr/`. Test pins updated for the restored skills
  (bf5, lightning, keywords); the card-matrix golden will show the changed cards. Per the owner ("no test runs"), only `node --check`,
  the build and a headless run in scratch: the Crown's rules, the five transforms, Matured under an evolute and 30 AI matches.

## 2026-10-21 (package EV: Evolute, the Evomax archetype)
- **Owner (17:42, 17:49):** "Evolute ... the evolute adds the base unit's remaining stat lines to its own, and inherits every counter";
  "Wrong evolutions are banned"; "I also don't want accidental wrong evolutions". Spec and what was built: `docs/evolute-design-2026-10-21.md`.
- **Evolute / Evolute Alpha / Evolute Omega.** The card is played onto one of your units, never into a slot.
  - **Evolute** goes over a creature that shares any type with it, anywhere in the taxonomy or the same phylum. **Alpha** goes over an
    Evolute or a Chrysalis. **Omega** goes over an Alpha.
  - **No other placement is legal.** The card is greyed without a base, and the engine refuses any other target.
  - **The stack.** The evolute adds its printed stats to the base's current ones: a 2/2 over a 5/8 (printed 4/20) is 7/10. It keeps
    every status and counter, and the skills the base was granted. It pays its Lumber and waits its own Wait.
  - **The base never dies.** It stays under the evolute as a card stack (no On Death, Bounty or grave). The stack goes to the graveyard
    together when the evolute dies.
- **Stem and Chrysalis.**
  - An evolute played onto a **Stem** gains the Stem's {skills}, or +1/+2.
  - A **Chrysalis** is a Stem that an Alpha may ride directly.
- **The CPU** evolves only onto legal bases. It picks the base with the most current stats and never one the stack could not outlive.
- **UI.**
  - Holding an evolute lights only its legal bases (a violet ring and 🧬), dims your other units and hides the empty-slot "+" targets. A
    drop or tap anywhere else plays nothing and shows a hint.
  - A stack shows its cards' edges and a ×N badge whose tooltip lists the stack.
  - The evolve plays a pop, the prismatic sparkle and a log line.
  - Skill chips 🧬 / 🧬α / 🧬Ω / 🌱 / 🐛 are in the registry, "+ Add Skill" and the Codex. Texts are in the 12 packs
    (`tools/i18n_2026_10_21_ev.py`). Screens are in `docs/screens/ev/`.
- **Costs** (`canonical/skill-costs.json`, theoretical, not owner-set). Evolute 3, Alpha 4, Omega 5. Stem / Chrysalis cost 1.6, or 0.4 ×
  their braces' S (`stemGrant` joins CX2's context rule in `bramblewood-budget.js`).
- **Cards.** No Evomax unit existed, so cards no player can get yet became the lines (owner call EV-1). Re-fit by formula with
  `--only`:
  - **Sloth:** Slowpoke Sentinel (Stem – {Armor 1}, 1/1) → Canopy Sloth Guardian (Evolute, 2/18 → 2/15) → Hanging Loafer (Alpha,
    3/23 → 2/21).
  - **Raven mystics:** Raven Harbinger (Evolute) → Raven Hexcaller (Alpha) → Bone Diviner (Omega). All three keep every skill,
    since Flying no longer counts (HB2-1). With Flying's ×1.5 the formula puts them at their 1/1 floor (flagged, EV-7).
  - **Storm:** Gale Sprite (Evolute, 2/10 → 1/8) → Stormcaller (Alpha, 6/17 → 1/23).
  - **Fodder:** the Nest's Speckled Egg is a Stem and the Cocoon a Chrysalis. Each got a species (Bird, Insect), 0/2 → 0/1.
  - The missing stages are listed as cards to make in the doc.
- Owner calls EV-1 to EV-7 are in `docs/decisions.json`. Per the owner ("no test runs"), only `node --check`, the build and a headless
  run in scratch were done. The run covered the owner's example, the bans, Stem / Chrysalis, the CPU's choice and 30 AI matches.

## 2026-10-21 (package UI3: simpler card details, admin card editing from more places, shields on units and on the battlefield bars, no plate for 0 Attack)
- **Owner (18:43, 18:52).** Card details: "Simplify the card details. No need for name again, no need for cost, wait, stats ... Since it deals COLD damage, just the icon change is sufficient." "The card can be larger, but not at expense of the window but instead, the top of the card expands to hover over the top of the window's boundary."
- **Card details (the hover / hold sheet, `fullCardHTML`, and the Codex detail, `openCardDetail`):** no name heading, no cost / Wait / Attack / Health row (a live unit whose numbers differ from the print keeps one short row: Attack as base + bonus, Irradiation, a boss's bonus Health), no species line, no "Wait N: Can't attack..." line, no "Its attacks deal X damage" line (`describeEffects(def, live, {terse:true})`; other callers keep the full list). Kept: rarity and type chips, skills, resistances, flavour. The card is bigger (204 px) and lifted: its top stands above the sheet's top edge, so the sheet is shorter than before; `positionPop` keeps the lifted part and the sheet on screen at 390 and 1366.
- **Admin card editing** (same admin check as the other tools): a reward card in a skirmish's details opens the card editor (`edOpenCardEditor`, the ED flow: closing it brings the map back); each card of a pack opening's review (the summary and Open all) has a ✏️, the opener hides while the editor is open and comes back with the edited card redrawn; a fight has an `✏️ Edit mode` switch beside Auto-win: while on, every pointer, drag and click on a card (hand, board, enemy, leader) is swallowed and the click opens the editor over the fight (`battleEditCardId`, a capture-phase lock like `tutorialLock`). The fight does not reload; the switch is per fight and starts off.
- **Shield on a unit:** its Health number is blue (class `has-shield` on the board card) while it holds a Shield; when it is gone the green, or the low-Health pink, applies again.
- **Shield on the battlefield bars:** each Shield layer (the raid's Shield 50, a skirmish's Armour layers, a dungeon wave's Shield) is a full-length overlay on its side's bar, layer 1 over the Health, layer 2 over layer 1 and so on, 3% to 12% see-through (uneven, higher layers more). The first time it shows (or when it grows) the lowest layer fills slowly, ease in and out; at half full the next one starts; smaller layers fill faster. A layer that reaches 0 breaks with a crack and shards on the bar. Reduced motion: layers shown, no fill, no break effect. `ribbonShieldSync` / `ribShieldBreakVfx`; the fill is a Web Animation from a recorded start time, so a board redraw in the middle continues it.
- **Retired:** the small Health bar and Shield bar on the bramble tiles (`.castle-hp-bar-oncard*`; the tile keeps its Health number and its 🔷 Shield number, which the Shield's dome effect and `tests/mx-2026-10-19.js` read). Nothing in `tests/` reads the removed bars; stale copies of the old markup remain in `hub/effects.html` and `tools/effects-lab/fixtures.json` (generated, not touched).
- **0 Attack (owner 18:52: "things with 0 attack should probably not display their attack anyway!"):** no Attack plate on a card whose Attack is 0 (structures: the card face in hand, board, Codex, drag preview, pack views, raid views; the Health plate stays in its corner). A buff above 0 brings it back on a board unit (`updateCardAtkDisplay` clears `is-atk-zero`); an Attack cut to 0 on a unit printed above 0 still shows its pink 0.
- New text: `ui.ui3-rib-shield`, `ui.ui3-edit-mode`, `-tip`, `-on`, `-off`, `-none`, translated in the 12 packs. Per the owner ("no test runs"): `node --check`, the build and shots at 390 and 1366 only (`docs/screens/UI3/`).
## 2026-10-21 (package RK: the total raid rank F to U, the Raid Ticket item)
- **Owner (18:35):** "How is your TOTAL rank for a raid calculated? I think let it go to rank U. So S, SS, SSS, U … Maybe it's total contribution … S is about 15,000, then 20,000, then 25,000, then 30,000. Maybe A, B, C, D, E, F = 9,000, 7,000, 5,000, 3,000, 1,500, >800 … a usable item you can buy or encounter that lets you go for the raid one more time … completing a raid (with at least A rank) should give you 1x ticket as well."
- **Total raid rank:** your total raid damage in one life of a raid (the sum the Top 1/10/50% tiers already rank) on one ladder, `RAID_TOTAL_RANKS` in `bramblewood-raid.js`: F 800, E 1,500, D 3,000, C 5,000, B 7,000, A 9,000, S 15,000, SS 20,000, SSS 25,000, U 30,000 (below 800: no rank; UU / UUU append to the table). `raidTotalRank` / `raidTotalRankNext` / `raidTotalRankAtLeast`. The fight's own rank (B..SSS, its damage multiplier) and the percentile tiers (the rewards) are unchanged.
- **Where it shows:** the raid hub card (live, with "N more for rank X"), a "Raid rank" chip beside Standing on the raid screen, each claim row, the raid fight's results (after that fight), and the claim screen beside the standing (stamped in after the damage counts up). The badge is the raid rank badge's style (`raidTotalRankBadgeHTML`); F is brown, not the losses' red; U is deep violet with a moving cyan sheen and glow (the sheen stands still under reduced motion and Effects Low / Off).
- **Raid Ticket (new item):** using one adds 1 raid ticket, past the cap of 10 too (`settleTickets` already keeps a stack above the cap; the Online Raid refund no longer clamps it). Held in the Inventory's 🎫 Tickets shelf with a Use button; the raid hub shows "Use a Raid Ticket (n left)" whenever you hold one, and the raid screen beside "no tickets left". **Shop:** 300 Maple Leaves once the Raid tab is open (the Rename Ticket is 250), buying stops at 9 held. **Drops:** an S notice 30%, SS 60%, SSS 100% (once the Raid is open; about 0.7 a week), and a new `raidTicket` reward token for a fight's first clear (✏️ Edit rewards; on no fight yet). **A fallen raid's claim at total rank A or better pays 1 Raid Ticket**, shown on the claim screen. Gifts are never cut by the 9 cap.
- **Server:** none needed. Read-only check of the live database: `player_currencies.raid_points` has no constraint and no trigger rule (`guard_currency_write` checks gold / gems / dust / metal only), and `raid_week_attempts` has no per-player count limit (its insert policy checks owner and cycle; damage 0..10,000 a row). The item count travels in the progress blob like the Rename Ticket's (client-side, as raid tickets always were).
- Texts: TX keys, translated into the 12 packs. Screens: `docs/screens/rk/`. Owner calls RK1–RK5 in `docs/decisions.json`. Per the owner ("no test runs"), only `node --check`, JSON validation, the build and one screenshot pair of the claim screen were run.
## 2026-10-21 (package CX5: the card editor and the Test Lab price skills from the canonical table)
- **Owner call CX5:** the card editor's budget panel and the Test Lab's ⚖️ Stat budget summed S from the in-page `SB_DEFAULT_SKILLS` (2026-10-17), not `canonical/skill-costs.json`. Ford Kingfisher (Uncommon, Lumber 1, Flying, Pounce 2) showed S 2, so 1/6 "fit"; the table prices Pounce 2 at 2.4 × (1 + 1) = 4.8, so even its printed 1/1 is over (Product (1 + 4.8²) × 1.5 = 36.1 > (N/3)² = 25.9, N 15.3).
- **One implementation:** `assemble_arena.py` inlines `tools/skill_costs.js` (already UMD, after `bramblewood-budget.js`) and `canonical/skill-costs.json` (`SKILL_COSTS_TABLE`). Both screens call `SkillCosts.make(table).cardS`, the code the balance tools, the re-fits and the hub use: scales n / half / fixed, triggers × actions with modifiers, aliases, shorthands, context skills at 0.4, the owner-set values; the half-miss list is the table's. Price edits reach the game when the hub's costs are folded into the canonical file (`tools/hub/apply_skill_costs.js`) and deployed.
- **Fallback:** `make(table, {fallback})` (new, optional) lets the game price a keyword skill missing from the table with `SB_DEFAULT_SKILLS` (or the Test Lab's saved stand-in costs); the panel then says "No price in the skill-cost table for …" (TX `ui.budget-price-missing`, 12 packs, `tools/i18n_2026_10_21_cx5.py`) and the Test Lab marks the row "price missing". No canonical card hits it today. `cardS` now also reports misses inside a context skill's braces. The deck-swap suggestions (`swapStrength`) still score with the in-page costs, unchanged.
- N, the two rules and the archer rule are unchanged here (the editor's checks do not apply BX's "Archer's Attack counts 0"; `tools/skill_costs.js budget()` does). Per the owner ("no test runs"), only `node --check`, the build and one 1366 screenshot of Ford Kingfisher's panel (S 4.8, over budget, N 15.3).

## 2026-10-21 (package EL: element symbols on the attack label, Elementals deal elemental damage)
- **Owner (18:29):** "If it does Fire, Ice, Acid, Poison, Decay, Magic, Water, Stone, Metal, Lightning damage, the attack label on the card should use those symbols instead." "This is rare, and we should use it sparingly. Elementals should usually use elemental damage, not physical."
- **Attack label:** a unit whose swing deals an element shows that element's symbol in place of the sword, on a tinted plate: 🔥 fire, ❄️ ice, 🧪 acid, ☠️ poison, 🍂 decay, 🪄 magic, 💧 water, 🪨 stone, ⚙️ metal, ⚡ lightning. Physical keeps the sword. Hand, board, Codex, drag preview and the card-detail line all read one helper (`atkElementOf` / `atkGlyphOf` / `atkPlateCls` in `arena_app.js`; plates in `arena_template.html`). BX's ember plate is now one of the ten; Magic units keep their wand (the separate chip rule is unchanged).
- **Damage types:** Stone and Metal are new basic-attack types (Resist / Weakness matching only, no status). Lightning is the engine's existing `shock` key (Thunderstorm, Sky Bolt, Wet's +1 per counter, Electricity, Chain Lightning): it was only missing from the editor's list, so it is added there as `⚡ Lightning`. Editor labels: `🪨 Stone`, `⚙️ Metal`, `⚡ Lightning`. No skill gives a Lightning resist (Grounded is a status), so none was added; a `shock` Resist also matches attackers that carry the Shock skill, as before. Battle-log icon, name and projectile glyph added for stone and metal.
- **Elementals changed (`canonical/cards.json`, `dmgType`, not priced):** Stoneheart Golem, Stalactite Golem, Malachite Golem, Quarry Troll, Glass Golem to stone; Iron Warden to metal; Stormcaller and Storm Heron to lightning; Tide Spirit cold to water; Marsh Wisp to magic. Ember Wisp, Magma Salamander, Magma Titan, Wound Reaver, Ashmantle Fiend and BX's Cinder Imp were already fire. Elementals with no clear element stay physical (listed in the report).
- No new player-facing text (the element words were already translated). Per the owner ("no test runs"), only JSON validation, `node --check`, the build and one screenshot pair (390 and 1366) were run.
## 2026-10-21 (package HB2: the Swordbill Challenger)
- **Owner (Oct 21):** "A new cool hummingbird character with a needle rapier in its mouth and a shielded rapier on one of its feet. It welcomes fights."
- **New card: Swordbill Challenger** (`swordbill-challenger`, #9086), a Very Rare Hummingbird faction reward (source tribes, tier 11; the track opens Very Rare after 50 received and Map 25). The real sword-billed hummingbird, whose bill is longer than its body, as a courteous duelist. **3/5, Wait 1; Flying, Taunt (it welcomes fights), Counterattack (the guarded foot-fencer answers each hit).** By formula: N 18.41 (Very Rare, Wait 1, Map 5), S 1 (Counterattack 1, Taunt 0, Flying 0 but x1.5 half-miss), 2A+H+S x1.5 = 18 (98% of N), A·H+S·|S| x1.5 = 24 of (N/3)² 37.66. Other names offered: Ensifer, the Swordbill; Mosswing Swordbill.
- **Three skills** are a thematic exception to the two-skill rule: the card is named in a `THEMATIC` set in `tests/bf5-2026-10-21.js` and `tools/two_skills_2026_10_21.js`. Owner call HB2-1 in `docs/decisions.json`.
- **No art yet** (the emoji placeholder shows); NightCafe prompt in `docs/art/new-cards-2026-10-21-briefs.md`. Name and flavour translated into the 12 packs (`tools/i18n_2026_10_21_hb2.py`). `canonical/animal-tags.json` and `canonical/card-obtain-maps.json` regenerated; `canonical/unit-themes.json` was already stale before this package and is left for the merge tool.
- Per the owner ("no test runs"), only JSON validation, `node --check` and the build were run.
## 2026-10-21 (package CX2: context skills priced 0.4 × their braces, Crepuscular {day}{night}, Transform / Lycanthropy, Ritual as a shape, rarity flags)
- **Owner (17:42):** "Tide - {} should be 0.5x the skills contained within … the coefficient should be reduced to 0.4x"; the editor row; "just quest, event, and dev toggles (and also 'special')"; zeitgeber skills get the {} format; conditional transforms; "Ritual … the conditions are splayed out in a triangle".
- **Pricing:** `CONTEXT_MULT = 0.4` in `bramblewood-budget.js` (`contextS`, `CONTEXT`). A context skill costs 0.4 × the S of everything in its braces, across all its phases (Tide: Flood + Ebb; Crepuscular: day + night); stats in braces count 2A + H; the plain flag beside the braces costs 0. Used by `tools/skill_costs.js` and the editor's budget panel, which shows the rule and the card's own sums. Context skills: Tide, Diurnal, Nocturnal, Crepuscular, Rainrunner, Loyal, Usurper, Swimmer (retired), Bloom (with braces), Transform, the old Full Moon {…}.
- **Re-fit by formula** (`bf6_rederive plan`, then `apply --only=` the five brace cards; the tool's drift on Swarm Matriarch, Tunnel Ant, Dragonscale Mail, Caldera Wyrm, Wolf Spider Mother and Banded Sea Krait not applied): Sworn Shieldbearer 3/12 → 3/11, Sunbittern Strider 2/10 → 4/10, Kinkajou Lurker 4/6 → 4/7, Mudflat Godwit 3/9 → 2/10, Werebadger 5/18 → 4/15. `--note=` names the package in the card note.
- **Crepuscular:** +1 Attack by day and +1 at night (was Twilight only); Twilight brings both; a deck with one still adds Twilight. New Crepuscular – {day}{night}. **Nocturnal** checked: +1 Attack at night (Twilight counts as night) and nothing else.
- **New braces:** Rainrunner – {…} (while it rains, instead of +N/+N), Loyal – {…} and Usurper – {…} get editor rows (a save used to drop them), Bloom (…) – {…} (`bloomWhen.grant`). Bloom conditions add Full Moon and Rain.
- **Transform** (new, `effects.transform = {name?, when, gain}`): the first time its condition holds, the unit gains the braces for the rest of the fight. Preset **Lycanthropy**: "Lycanthropy: under {Full Moon}, gain {…}". Werebadger's Full Moon {Regen 2, Thorns 2} converted; Full Moon {…} is hidden from "+ Add Skill" (the engine still runs it). Priced 0.4 × the gain.
- **Ritual:** its conditions drawn at the corners of a regular polygon on the card view and in the editor (3 a triangle, 4 a square …); Ritual has an editor row now (a save used to drop it). The rule is unchanged; the small progress chip on a board unit is unchanged.
- **Editor:** context-skill rows lose the "+ at a later level" button; the text in the braces is muted (still editable); "+ skill" stands out. **Rarity:** a rank dropdown (Common → Daemonic; Starter only on a Starter card) and four one-at-a-time toggles, Quest / Event / Dev / Special. Stored strings unchanged (quest = Quest + Uncommon, special = Special + Rare …); other pairs are derived in the same style (questrare, devepic …) and read as their rank everywhere.
- Texts: TX keys, translated into the 12 packs (`tools/i18n_2026_10_21_cx2.py`). Screens: `docs/screens/cx2/`. Owner calls CX1–CX5 in `docs/decisions.json`. Per the owner ("Dont need to test"), only `node --check`, the build and a small headless run of the new rules.

## 2026-10-21 (package MT: Twin priced 20, the new Mimic skill, B14 / B15 answered, the standard skill test)
- **Owner (B15, 16:33):** "creating a copy of a random ally card — probably 20+. Becoming a copy of a random ally card probably 5+. I think for mirrorhide mutant, they should copy the skills of the card, but their stats = the highest stat of both cards. E.g. 2/3 copying a 4/2 => 4/3."
- **Mimic (new, Mirrorhide Mutant's in place of Twin):** when it enters play it becomes a copy of a random ally unit on your field (the fight's seeded RNG; never itself; no ally: nothing). It takes the ally card's skills and the higher of each printed stat (Attack, Health and max Health), keeps its own name, art and rarity, and shows "Copying <name>" on its card view and a log line. The copied arrival skills (Pounce, Twin, Rally ...) then fire. Engine: `mimicOnArrive` / `mimicDefOf` (a derived card, as Twin builds its own). The look is Twin's mirror sheen, reused. Texts in the 12 packs (`tools/i18n_2026_10_21_mt.py`).
- **Costs (owner-set):** Twin 1 → 20, Mimic 5 (`canonical/skill-costs.json`).
- **Re-fit by formula** (`tools/bf6_rederive_2026_10_21.js plan`, then `apply --only=` the two): Mirrorhide Mutant 3/5 → **2/11**; Puddle Changeling 2/2 → **1/1** (Twin at 20 is more than a Common's N 11.95: the floor of its shape, skills kept, flagged). The new `--only` keeps the apply to the named cards: a re-plan also moves four cards that keep their share (Swarm Matriarch, Tunnel Ant, Dragonscale Mail, Caldera Wyrm), which were not applied.
- **B14 answered (owner 16:42):** cap 2 stays A·H + S·|S| ≤ (N/3)²; the flagged cards keep their floor stats on purpose.
- **`tools/skill_test.js`:** the owner's standard skill test (docs/workflows/balance.md): `--mono` / `--duo`, 3/10 test units against 4/11 vanilla ones whose bramble gives one random creature +1/+0 or +0/+1 each turn, 35-Health brambles, `--games` 10,000 by default, `--skills`, `--jobs`. Output: win rate, gain over vanilla and budget points (tools/skill_worth.js's conversion), plus each pair's synergy in `--duo`. One 200-game run (Quick, Armor): the vanilla 3/10 deck wins 0% against the standard enemy, so every skill read 0% too (S 0, a bound). `--unit` / `--foe` change the stats.
- Per the owner ("no test runs"), only `node --check` and the build were run.

## 2026-10-21 (owner 16:13: relative skills shifted ×0.78; 43 cards re-fitted; no runs)
- **Owner:** "for all skills that have been recalculated, how much were they shifted? Shift the big skills by a similar amount… those about doing damage… don't have to be shifted… I don't want to do runs."
- **The shift:** the same measuring tool, run in both worlds on 202 skills (10-19 full size against BF6's halved partial), puts the halved-world worth at a median ×0.78 of the old (quartiles ×0.56 and ×1.04).
  - Fixed-number skills held or grew: damage, heals, armor, +N stats, poison, bleed (Armor ×1.35, Regen ×1.43, Bleed ×1.12).
  - Relative skills (those that multiply or copy the unit's own stats, speed or odds) shrank (Quick ×0.16, Sturdy ×0.18, Crit ×0.69).
- **Applied:** 22 big relative skills × 0.78 in `canonical/skill-costs.json` (previous value kept in prevValue): Sturdy, Desecrate, Quick, Fast Forward, Mighty, Crit, Bulldoze, Revive, Sleep, Fork, Stagger, Charge, Confuse, Daunt, Stun on Hit, Dry, Scare, True Strike, Smoke Bomb, Keen Sense, Darksight, Swimmer. Damage and the other fixed-number skills are unchanged.
- **Re-fit by formula** (`tools/bf6_rederive_2026_10_21.js plan/apply`): 43 cards gained stats. Examples: Jaguar Stalker 1/1 → 1/12, Cinder Skeleton 1/1 → 1/9, Two-Headed Calf 1/13 → 3/10. No skills changed.
- **Still flagged (B14):** 80 cards at their floor. Cap 2 (A·H + S·|S| ≤ (N/3)²) leaves no room for A·H once a card's total S reaches N/3, which is about 3.8 for a Level 1 Common.

## 2026-10-21 (package TS2: skirmish decks by biome, and 16 themed PvP / Async Arena decks)
- **Owner:** "Recommended cards in each biome to have been assigned to the skirmish. (thematicism is the key, we can change skills and stats later and even images later)"; "More PVP decks maybe, I like PVP to experience some of the cards we made."
- **Skirmish decks:** 132 fights on Maps 1-24 and their side maps (114 main, 18 side) took the cards `docs/map-recommendations-2026-10-21.md` recommends for their map, in place of off-biome cards of similar rarity, wait and cost: beach creatures on the beach, cave creatures in caves. Deck sizes, fight kinds, boss cards and showcase cards are unchanged; Map 0, the tutorials and the raid / dungeon fights are untouched. Maps 1-4 lost their deep-sea cards (Kraken Spawnling, Humpback Elder, Reef Manta Glider); no Shark before Map 8. No card stat, skill or reward changed.
- **PvP and Async Arena:** 16 hand-built seeded decks (beach tide, ants, otters, hummingbirds, bees, caves, desert, swamp, thorns, raptors, frost wolves, ocean, volcano, redwood, duck knights, a whimsy deck) in `THEMED_GHOSTS` (`bramblewood-ghosts.js`), spread over win stages 0-6 and used ahead of the generated seeded decks. Only cards a player can own. The Raid's stand-in raiders are unchanged.
- **Not done:** 26 recommended ideas are not cards yet (table in `docs/skirmish-theme-pass-2026-10-21.md`); Maps 25-28 have no fights yet. Per the owner ("No need for checks or testing, to save tokens"), no tests were run: `node --check` and the build only.

## 2026-10-21 (package BF6: the halved coefficients, cap 2 A·H+S·|S|, Injured, Rally / War Banner, every card re-fitted)
- **N, the owner's halved formula (15:09, replacing BF5's 0.5 on the whole N):** N(L) = (Base + L/15)(1 + L/30), Level 0 Base − 1, Base = 10 + Rarity + 3×Wait + 0.25×Wait² + 2×Lumber + 0.2×Lumber² + 0.5×Ritual + 0.1×Map; scale 1; BF5's multipliers stay. A Common W0 L0 Map 0 at Lv 0 / 1 / 10: 10 / 10.9 / 14.67 → **10 / 11.44 / 15.56**. In `bramblewood-budget.js`, the skill-costs budget line, the Test Lab (its saved numbers start fresh: key v6) and the formula line (+ "{rt}×Ritual").
- **Cap 2 (15:15):** A·H + S·|S| ≤ (N/3)², S the card's total skill worth (signed square, so a drawback still frees room). Helper `productScore`; `tools/skill_costs.js`, the Test Lab and card editor panel, the hub's Budget & stats and Skill costs tabs. Cap 1 unchanged.
- **New skill: Injured N** (owner: "comes in with damage already on it (can be healed). This counts as −N × 0.99"): enters play with Health max − N (at least 1), healable. S −0.99 a point (owner-set; measured −0.88). Editor, Codex, TX `ui.skn-injured` / `ui.sk-injured` in the 12 packs. No card has it yet.
- **Rally / War Banner (15:15):** Rally N is temporary now (on entering play, your units on the field +N Attack until the end of the next round), back in the editor; War Banner N is the passive aura, **+N Attack** only (was +N/+N). The Parish Sergeant's Rally 1 → War Banner 1. **Shield Call → Armor:** Shieldbearer Hound Armor 1; Magnate Duck loses Shield Call (keeps Armor 3); Shield Call retired in the registry (the engine rule stays for old saves).
- **Spawns (15:21):** units an ability puts on an open board's front row go to the free slot nearest the spawner, a tie a seeded coin flip (`nearestFreeSlot`: Spawn, Spawner, Brood, Twin, Sprout, Duplicate, death tokens, On Attacked spawns, Mirage, Relic).
- **Skill worth (owner 15:22: simulate only what has no measured worth):** 165 halved-world runs (`tools/skill_worth.js --world=half`: baselines 1/4, 2/7, 3/11, brambles 50; 30 games a point). 19 values moved, e.g. Rally 3.13, War Banner 8 → 5.04, Spawn 5.26 → 4.08, Shieldwall 4.1 → 5.39, Spotter 4 → 0.72, Buff All 6.66 → 4.4. Everything else keeps its 10-19 measure (B11: no blanket halving). `docs/balance/bf6-skill-costs-2026-10-21.json`.
- **Every card re-fitted by formula (750):** shape kept, both caps, top of the band (the owner's 13 edits keep their share); 665 moved (610 up). The bucket (no room under a cap) held 176, and 11 more were squeezed under the band: 100 took one skill off without thematic loss (Bounty, a time of day or Darksight first), **84 keep their skills at 1/1 and are flagged** (B14), the two Twin cards held (B15). Tokens, the Nest's eggs, equipment and the Caldera Wyrm keep their share of their own N.
- **B12:** the raid's arms and tail store **410** (205 in the fight); not re-run. B11 and B12 answered in `docs/decisions.json`; B14, B15 new.
- Not done (owner): road and raid re-tuning. No test suites run; `tests/shield-call.js` is stale; pins updated in `tests/bf5-2026-10-21.js`, `tests/forge-curve-2026-10-19.js`, `tests/raid-rb2-2026-10-19.js`.
- Tools: `tools/bf6_rederive_2026_10_21.js` (costs, plan, bucket, apply, doc), `tools/bf6_skill_moves_2026_10_21.js`, `tools/i18n_2026_10_21_bf6.py`. Doc: `docs/balance/bf6-2026-10-21.md`.

## 2026-10-21 (package HC: the hub's Chips & FX tab; no game change)
- **Owner:** "Status chips: in Master Hub, let me know all the status chips and context chips (e.g. flying) available and context fx (like blind) available. Maybe we can drop some of them."
- **New hub tab 🏷️ Chips & FX:** every status chip (the pills on a board unit, the live-status lines, the coloured keyword words), every context chip (the skill marks on a card face and the trigger chips) and every context FX (tint classes, overlays, plates, wings, light, battlefield darkness / wind / rain). Each row has its icon, a one-line meaning, where it shows (hand, board, raid, Codex), how many cards can cause it, and the code that draws it. Filter by kind, mark and "near-duplicates only", search, sort by name or card count.
- **Near-duplicates are grouped:** the same picture on different things (`≈ same icon`), nearly the same meaning (`≈ same meaning`), and the same word as status + skill + look (`pair`).
- **Keep / Drop / Merge and a note on every row,** saved to the hub's database (collection `chipReview`); `tools/hub/pull_chip_review.md` says how Claude reads them back. Nothing in the game changes until the owner decides.
- **Generated, never typed:** `node tools/hub/chips_inventory.js` writes `docs/chips-inventory.json` from `arena_app.js` (the game's own tables run in a sandbox, the chip code read with a scanner), `arena_template.html` and `canonical/cards.json`; `--check` says when it is out of date. `tools/hub/build_hub.py` inlines it.
## 2026-10-21 (package TT2: release triage of the SK2b … BF5 batch; one gameplay change, the tutorial's rival deck)
- **The tutorial is winnable again (part 1).** The real part-1 fight (the owner's 10-20 decks, folded by BF5) won 35% of simulated fights on BF5's halved, rounded stats (71% on the pre-BF5 stats; the halved brambles alone move it about 1 point; the two-skill cuts and RP's starters don't touch it). The lever is the rival deck only, no card stats: its 2 Ducklings (3/3) are Pond Ducks (2/3) and its 2 Silver Minnows (2/4) Pond Trout (2/3); the Earthworms and Harvest Mice stay. 78% over 200 seeds, the fixed seed a win. **Live, the server's `__cfg:tutorial` row still overrides the file until B13's clear SQL is applied** (or the owner makes the same edit in the tutorial editor).
- **Stale tests now assert the deliberate changes** (each with a dated comment naming the package):
  - BF5: Cathedral Eagle 1/4 and Shrine High Priest 1/4 (prayer); the Voltaic Eel's Tide cut by the two-skill rule (lightning); the status-chip test's crowded unit is now a Soldier Ant whose Formation aura (SK1) draws its own chip, so the live-patch check clears it (ts-status-chips). It was not a UI regression: one strip, two chips.
  - FG: a Common's levels 1-10 cost 744 Dust, a fed duplicate 40 (ui_smoke).
  - UT (10-19): the Codex search matches the animal too; CX (10-19): 16-card album pages (codex_perf). The shared filter bar (TX) was not involved: a search for "otter" shows exactly the 29 cards whose name or animal says otter.
  - RO (10-19): the Raid tab opens on the raids hub (flows).
  - 10-16 owner rule: the Blacksmith hides a recipe whose card you never held; and Cobble's Forge hello queued ahead of the rarity lesson (rarity_limit_craft). Both also failed on the released build.
  - ui_smoke's tutorial check now simulates part 1 as the game builds it (the config's decks, Open battles, brambles at BRAMBLE_SCALE); it measured the starter-builder fallback in gravity mode.
  - snaps stops watching once a match is decided: with halved brambles its random matches now end, and the castle's fall and the victory dance moved tiles on purpose (the game's own snap guard was smoothing a reflow after the crumble).
  - autobattle's speed floor 9 → 6 fights/s: the released main measures 8.6/s alone on this box, the batch 8.5-8.7/s.
  - skill-worth: 41 entries added after the SW runs (SK1, SK3, EQ, BX, BF5, SK2b) carry a "not yet measured" reason; no value or measured number was invented.
- **Still failing:** `trench` (core 17, band 20-400; balance follow-up from BF5: the Core's 14-Health stumps aren't halved, so halved cards rarely break them; at the game's halved wall the Core reads 7 and the left part is overwhelmed 40%; the trench is admin-only), `nv` B2 (the owner's layout call).

## 2026-10-21 (package BF5: N halved, every card re-derived, road and raid re-measured)
- **Owner (10-19 21:36):** "I think numbers are way too big. Can we HALF everything?" ("Straight up, the total N value"). Then the 10-21 rulings: fold the owner's later live edits and halve them too; N multipliers; two skills at most; re-derive everything; re-measure with honest levers only.
- **N is halved:** one constant, `scale: 0.5` in `bramblewood-budget.js` (also in `canonical/skill-costs.json`'s budget line, the Test Lab and the hub). Base, the Level terms and the Map × 0.2 term all halve; the A·H rule is (N/3)² of the halved N. Skill costs (S) stay. **Bounty 0.5 → 1** a point.
- **N multipliers** (named constants, shown in the card editor's budget panel and the Test Lab): no abilities ×1.05, only light abilities (Flying, Tide, a time-of-day skill) ×1.02, Fragile ×0.75. Passive Vulnerable is a skill worth −1.5.
- **Two skills at most:** 99 cards cut to two (Bounty first, then a time-of-day skill, then Darksight, then the two the name and flavour carry); 17 special cards (Epic and up, Supreme, hidden, Easter eggs, tokens) keep theirs. The owner's ants: Ant Scout Swarm alone, Soldier Ant + Formation 1, Tunnel Ant + Ambush 2.
- **The owner's later live edits folded:** 13 cards, the Map 0 / Hedgerow / Shallows nodes, the tutorial and the Goliath's shards (one conflict: the Swarm Matriarch's art, the file's newer portrait kept). The server rows can be cleared with `supabase/proposed/20261021_clear_folded_overrides_2.sql` (**prepared, not applied**).
- **Every card re-derived:** each keeps its share of N from before the cut and the halving (`docs/balance/halve-ref-2026-10-21.json`), in the band (over 60%, at most 100%). 722 cards: 706 in the band, 16 owner calls (their skills don't fit the halved N: halved in proportion, flagged); 24 halved in proportion (the Caldera Wyrm, tokens, the Nest's eggs, the Blacksmith's equipment). The Easter eggs go through the band; Terraumbra is measured with its grant (3/3 → 1/1). Cave Bat Swarm 1/2 (owner).
- **Brambles halved too** (measured first: full brambles dragged fights toward the turn caps): `BRAMBLE_SCALE = 0.5` in `arena_app.js`, applied when a fight is built (the road, your castle in every mode, the raid 350 → 175 / Core 200 → 100 / elders' floor 55 → 28 / MX's raid Shield 50 → 25, the trench, the tutorial, the dungeon). The stored numbers stay full-size.
- **Forge:** the curve follows the halved N times the card's multiplier; mean gain +1.2% Lv 2, +21.8% Lv 4, +50.4% Lv 7, +79.4% Lv 10, +96.3% Lv 11.
- **Skill numbers that now look big** (flagged, not changed): Meteor 20, Fireball 15, Trap 6, Pounce 6, Armor up to 5 against a median card of 2/5.
- **The road, re-measured (honest levers only: enemy decks, the level schedule, no new Shield, no field buffs):** 15 / 179 main fights on target on the halved cards, 60 / 179 after three tuner rounds (fresh seeds 58; side maps 27 / 77). 169 gaps are listed (160 too easy, 9 too hard) in `docs/balance/road-gaps-2026-10-19.json`; the owner's own node fights (Maps 0-2) are untouched. Test floors follow (level-curve 55 / 50 / 20, side-maps 20).
- **The raid, re-measured:** completion unchanged (100% for 30-250 participants, day 6.53 with 30), but the decks now break the halved bramble about half the time; no lever pulled (owner call B12, with a 410 probe).
- **Owner calls:** B11 (halve the skills' fixed numbers too), B12 (the raid's brambles), B13 (apply the clear SQL) in `docs/decisions.json`.
- Test: `tests/bf5-2026-10-21.js`.
- Docs: `docs/balance/halve-2026-10-19.md`, `docs/balance/owner-edits-bf5-2026-10-21.json`, `docs/balance/two-skills-2026-10-21.json`.
## 2026-10-21 (package TT: test triage after the SK2b … FX-WAR batch; no gameplay or balance change)
- **One tool fix (a merge drop):** `tools/lib_bramble.js` now extracts `nodeEnemyLevelOverride`. Package ED made `roadEnemyLevelExact` call it, but the helper wasn't in the tool's list. Every tool and test that measures a fight crashed (`nodeEnemyLevelOverride is not defined`): the win-rate panel, the Pale Desert, side maps, and the balance tools. The game itself was fine.
- **Stale tests follow the documented changes.** Each edit has a dated comment naming the change.
  - The BF3 retune: Rabid Jackal 3/5, Sheep 2/10.
  - Package EE: Restless only on the Easter eggs Creeper and Nyoogle.
  - The BF4 fold: the Sulfur Cinder Moth's Illuminate. The Nyoogle has it too.
  - TX: eggs hatch by the type hierarchy (Changelings count), the reveal map, and the taxonomy loaded in the legendary test's sandbox.
  - EQ: `...EQ_API` heads the engine's API.
  - SK3: Grounded is the Magnet status now. The old lightning "grounded" event stays gone.
  - ED: the cleared fields gain `enemyLevel`, RESUME_FIELDS starts with `matchUid`, and `!m.rewardDuplicate` guards the refund and the rewards.
  - UX: the tutorial tooltip's summary node.
  - TF: under reduced motion the tentacle lies still.
  - RP: the Pall Wraith reward is at 20-5, the Factions tip says "never from packs", the Chapel Tortoise is held, and Clovermead counts as Map 5, so it is on the main curve.
  - BX: the Greyplume Fledgling makes 13 Hummingbirds.
  - TH: its CHANGELOG entry is found by its heading.
- **Regenerated data:**
  - The emoji used-set gains 12 new emoji, with sets and atlases rebuilt. Additions only.
  - `canonical/animal-tags.json` covers SK2b's and BX's new cards. The Glintsnatch Magpie stays a **magpie**: a hand-checked row in `tools/animal_tags.py`, like the Golden Magpie's, overrides the 🐦‍⬛ icon that read as a raven.
  - `canonical/unit-themes.json`: `tools/unit_themes.js` learns TX's species names (Cephalopod and Cnidaria families, Felid's usual ground). A card RP held back keeps the biome of the map it was made for.
  - `docs/balance/pale-desert-2026-10-19.json` is re-measured, because BX turned the Stonedrop Vulture's Skyfall into Archer.
- **Still failing, for their owners:**
  - `pale-desert` 18-A-5: 80%, band 61-77%, after BX's Archer change. Balance, for BF5.
  - `guild-skills`: the trench core baseline. Same cause as `trench`, for BF5.
  - `nv` B2: on phones, the raid VS screen's MX Shield line pushes the boss art under the sticky Start button. A UI call.

## 2026-10-21 (workflow audit: cheaper, safer development; no gameplay change)
- **Owner:** "Audit and improve our existing workflow before making changes to the game… Do not change gameplay or deploy."
- **`CLAUDE.md`** (new, repo root): the hard rules, one source of truth per kind of information, and the build, test, merge and release commands. Every new chat and agent reads it, so briefs no longer repeat the rules.
- **`docs/workflows/`**: card-data, balance, art, ui, engine and release. Each lists the files that workflow needs, its checks and when it is done.
- **`tests/run.js`**: runs the list in `run-all.sh` (still the one list) with tiers (`--smoke`, default, `--full`, `--e2e`) and quiet output.
  - Two tests run at a time.
  - A test that passed on byte-identical inputs is skipped and reported as cached, never as passed.
  - Timings go to `tests/out/test-timings.json`.
- **`tools/merge/merge_pkg.sh`**: merges a package with the standing rules.
  - Generated files: take ours, then rebuild.
  - Language packs and `cards.json`: three-way, by key or by field.
  - CHANGELOG, run-all.sh and keys both sides appended to the text table: keep both.
  - After merging it drops stale `lang/ui` rows and checks the JSON and the card ids. It stops on any other conflict.
- **`tools/shot.py`**: screenshots any screen at 390 and 1366 (`--screen forge`, `--js "<call>"`).
- **`docs/code-map.md`**: generated by `tools/code_map.py`; where each system lives in `arena_app.js` and the engine.
- `MASTER.md` is marked retired. The 10-21 owner notes are queued as N21-1 to N21-8 in `action-items.md`. The Project has a new `claude/START-HERE.md` for new chats.
- **Found on the way:**
  - The machine has 2 cores, and six parallel agents pushed the load to 15, which slowed every test and screenshot.
  - About 20 older tests had drifted, because packages ran only their own tests.
  - Stale `lang/ui` rows kept coming back after merges (now pruned automatically).

## 2026-10-19 (package SG: Stomping Grounds UI fidelity)
- **Owner (23:43):** "Stomping Grounds UI fidelity should match the rest."
- **Before:** two plain panels on the page backdrop: a text header and the Hero Hall, with the three peoples as bare art squares and the skills as text rows.
- **Now a place, like the Forge and the Nest:** the Arena's training ring (map art `marena`) under a darkening veil, a hanging plank sign ("🐾 Stomping Grounds"), the subtitle on a dark strip, and dust drifting up off the ring (off under reduced motion).
- **The Hero** stands on a mound of trampled earth (168 px card tile); name with a people chip, a proper XP bar, fact chips. The Stat points, Skills and Materia benches are their own panels; stat values sit in their card-badge colours; every skill row has its icon in a round token as in the Codex's skill book (🔒 locked, ✨ to pick), and the pick buttons show the skill icons.
- **Raise a Hero (the empty state):** each people is shown as its Level-1 Hero card (the shared card renderer) instead of bare art. Empty hints on Skills (before Level 5) and Materia (no crystals yet).
- **Loading and error states:** a card-shaped skeleton while the card data isn't ready, and a "Try again" panel if the page fails to draw (it used to stay blank).
- Phone: no horizontal scroll at 390 px; the stat rows put the value under the label; no fixed or transformed layers in the scene. Same buttons, ids and handlers (tests/e2e/hero.py passes). 6 new texts (TX `ui.stomp-*`) in the 12 packs (`tools/i18n_2026_10_19_sg.py`). Screens: `docs/screens/sg/`.

## 2026-10-19 / 10-21 (package FG: Forge and Nest UI; the Forge levels whole cards)
- **Forge levels the whole card (owner 10-21: "forge forges ALL cards of a particular suite"):** tempering, a limit break, melting, a promotion and the Nest's training now move every copy of a card together. This reverses package NF's per-copy levels. Foil, Shiny and skins stay per copy. Forge credit belongs to the card again.
  - **Old saves (move version 2, once):** each card takes the level of its highest copy. The duplicate credit banked on each copy is added up onto the card, so nothing is lost or refunded. A save whose copies differed gets one toast.
  - **Cloud:** `player_card_unlocks.copies` still round-trips. Every copy carries the card's level. A pulled higher level lifts the whole card, and a lower one never lowers it. A row holds at most 200 copies, the limit of the column's check. No SQL change is needed and nothing was written to the live DB.
- **Cost curve (owner 10-21: +10%, "lvl 0-7 slightly less than 8-10, 11+ really expensive"):** `FORGE_STEP_DUST`. On a Common, levels 1→10 cost 744 Dust / 494 Leaves (was 675 / 450). Reaching Lv 7 costs 360 Dust and Lv 8–10 cost 399. The limit break costs 2× the road (`LIMIT_BREAK_COST_MULT`). Other rarities scale by `LEVEL_COST_MULT` as before. Brambles, the Lv 0→1 mote and the Materia Unit are unchanged.
- **Reset Forge (Admin → Profile → resets):** an in-page two-tap confirm. Every card goes back to its starting level. Tutorial and hatched copies (`tut` / the new `lv0` mark) go back to Level 0 as hatchlings. Forge credit and Prestige are cleared and nothing is refunded.
- **Fuse is its own Forge tab (🧩 Fuse):** pick a card with spare copies. The tab shows its spares and how many are extras, the copies window, and the result (level and finishes kept, credit before → after, how far it pays: "Pays for Lv 3 → 5"). Fuse 1 and Fuse all extras play on the centre stage, with the spares flying into the card. The global "Fuse all extras" moved here. The Upgrade anvil's "Feed a duplicate" became a link to the Fuse tab.
- **Extras = copies beyond the deck limit** (`copiesBeyondCap`, `RARITY_MAX_COPIES`: Common 10, Uncommon 5, Rare 4, Very Rare / Super Rare 3, Epic / Heroic 2, Unique and up 1). Disenchant extras and melting used to keep only 1 copy; now they never go below the limit, like Fuse all already did. 5 Commons have no extras. The Codex and the Collection compute no extras of their own.
- **Reinforce (was the Forge's 🏰 Brambles tab):** its own screen with a stonework yard background (ashlar courses, battlements, torchlight). It shows the picked bramble large, Level and Starting Health now → next, its passive, the cost after duplicate credit, the Map 50 gate, Reinforce on the centre stage (stones drop onto the tile), Fuse duplicates, and a grid of your brambles. The deck builder's bramble picker links to it.
- **Raid tab:** a strip of the raid's cards above a large card you can turn. It tilts toward the pointer, a drag turns it (a sideways touch drag too, no gyro), ←/→ or Turn flip it, it shines (your foil copy's finish too) and it stays still under reduced motion. On the right: the recipe (shards, Dust, Leaves, what you have), Craft on the centre stage, and your copies. Phones stack the card over the recipe. The seen rule is kept.
- **Nest hatch:** the egg and its cracks sit on the rays' centre (42% of the stage, 8% higher than before), on phone and desktop.
- **Refine:** the name is one TX key, `ui.fg-refine-name` ("Refine"), used by the tab and the button. The other texts no longer repeat the word, so the rename is a one-line change.
- 66 new TX keys in 12 packs (`tools/i18n_2026_10_19_fg.py`). Tests: `tests/fg-2026-10-19.js`; `tests/e2e/fg_2026_10_19.py` (390 and 1366). NF, UX and deck-sync tests were updated for card levels. Screens: `docs/screens/fg/`.
## 2026-10-21 (package ED: editor tools and fixes)
- **One result per match (owner #9: "If you autowin and quit right after, you get the reward, but then you can press continue ... Will a similar loop be possible for non-admins? Stop it.").** The cause: Quit during the end sign kept the resume save from *before* the winning round while that round, still playing on, paid the reward; Continue then put you back before the win. Players had the same loop with a real last blow (and with Quit during any winning round, or the Async Arena's Save & Exit). Now every match has an id (`matchUid`, in the resume save); the moment the result is decided it is written down (`bramblewood_resolved_matches_v1`, last 60) and its resume save is dropped; a decided match's save is never offered or loaded (no Continue); a stale copy that decides again pays nothing (`m.rewardDuplicate`: no Leaves, cards, XP, quests, Hero XP or Spire refund); Quit waits ("Hold on: this fight's result is being saved.") and Forfeit / Auto-win do nothing once decided; the results' buttons are locked ("Saving your rewards…") until the rewards are recorded and the server's share (claim_fight_reward) is settled.
- **The enemy's level on a skirmish's preview (owner #7).** The deck preview, the showcase, their hover card and their details show each enemy card at the fight's own level (the road curve, a card level set in the editor, or the new per-fight **Enemy level**), from the shared card, never at your Forge level. The skirmish editor's Enemy level (blank = the curve, shown as its placeholder) is saved on the node (`enemyLevel`) and read by `roadEnemyLevelExact`, so the battle rating, `levelledEnemyDeck` and the fight use the same value.
- **Card editing in place (owner #14).** Admins get a ✏️ on each card of the skirmish editor's deck list and of a skirmish's deck preview: it opens the card editor right there (the skirmish editor comes back with its draft when it closes). **Art rejected** with a reason: in the card editor's art panel (saved by its Save) and on the card details (🚫 Reject the art / Clear), stored on the card as `artReview {status:'rejected', reason, at}` through `saveCard` (a `card_overrides` row for a cloud admin; no SQL). Admins see a 🚫 corner on such cards; Admin's Manage Cards has an **Art rejected only (n)** filter that lists them with their reasons.
- **Create card is back on the Codex (owner #26)** for admins, above the toolbar (the toolbar itself is unchanged). No cards were made.
- **The node kind (owner #28)** leads the skirmish editor's header as a coloured chip (Skirmish, ⭐ Elite, 💀 Boss, 🗝️ Dungeon …).
- **Deck editors (owner #10: "Don't redraw, just change the number count. Unless it is 0->1 or 1->0").** The skirmish deck popup and the Camp now rewrite the card's count, its stack and the totals on a +1 / −1; only a card arriving or leaving redraws (in the popup, only the deck row). Playwright at 1366, ms a click: the popup ~1,000-2,600 -> ~70-100; the Camp (126-card pool) ~320 -> ~40 (the deck banner's battle rating follows 250 ms after the clicking stops).
- **Tutorial II's showcase (owner #5)** is the Wandering Traveller: part 2's lesson is your leader joining the fight (its flavour, the card the lesson lights up, `tutorialHighlightId(2)`); part 1 showed the same rival card on both. The tutorial editor's part-2 highlight, or a showcase picked in the skirmish editor, still wins.
- 24 new TX keys (`ui.ed-*`, `results.ed-saving`, `toast.ed-result-saving`) in all 12 packs. Test: `tests/ed-2026-10-21.js` (VM + Playwright at 1366 / 390; screenshots in `docs/screens/ed/`).
## 2026-10-21 (package BX: battle fixes and new cards)
- **Swarm hits the bramble harder too (owner: "Doesn't seem to be doing the bonus damage to the bramble"):** a swing at the bramble added the day/night, Inspired, Flow and First Blood bonuses but left out Swarm, and its mirror Defiance. Both now count (`castleSwingAmt`), the same as on a hit against a unit.
- **Wave at the frontier (owner: "It failed as there were no more units in that direction ... the unit should be pushed by Wave 1"):** the outermost occupied column no longer stops a push. A unit there is pushed one column further out, into the frontier slot (the column a card could be played into beside it). It doesn't go past that slot, and a unit in the way is still crashed into. A Wave with no fixed direction no longer bounces off the edge. The centre column is still always legal (package BU).
- **The rarity frames line up with the card (owner: "The card border shine effect (especially on the dragons) is offset"):** the frame layers (Mythic's heat, Ancient's runes, Divine's rays, the Supreme prismatic edge, the Prestige Gold glint, the boss rivets) were drawn on the rarity band's pseudo-elements at 400% of its height. That only works if the band is a quarter of the card. It is 22% on framed art and a fixed 27.5px elsewhere, so the layers sat about a fifth of the way down the card, worse the bigger the card. They now sit on `.cframe-fx`, a new layer in the frame markup that covers the card exactly, so they match the frame on the hand, board, raid and detail cards and on the CF frames. On a Legendary-and-up card the Supreme prismatic edge runs just inside the rarity rim, so both show. Screens: `docs/screens/bx/` (before and after, 390 and 1366: dragons, the Prestige Gold Ant Scout, Dragonscale Mail).
- **Archer N (new skill; owner: "Cannot attack, instead Arrow N every action"):** the unit never swings. On each of its turns in the fight order it fires one Arrow N, which targets the enemy facing it, else the nearest enemy, else the bramble. Fletcher and Weapon Master add to it, a Helmet can deflect it, Reflect bounces it, an Evasive unit can dodge it, and its kills count for the archer. It acts even at 0 Attack, and it gets no On Attack. It is built as a trigger × action, **On Action × Arrow N**; both are new and also show in the card editor. **Stonedrop Vulture** has Archer 3 in place of Skyfall 3 (stats unchanged, for package BF5 to re-derive; the budget now leaves an Archer's Attack out).
  - **The drop look (`effects.archerStyle: 'drop'`):** the card flies over its target, drops a stone (🪨) and flies back. The hit lands when an arrow's would. The battle log reads "Stonedrop Vulture flies over … and drops a stone". With reduced motion it falls back to the normal arrow. Stonedrop Vulture uses it.
- **Fire attacks:** a unit whose swing deals fire damage (dmgType `heat`, the engine's fire type; `fire` is read the same way) shows 🔥 on its attack label, on an ember plate. **Cinder Stoker** and **Cinder Imp** (Map 20, The Sundered Peak) now deal fire damage. Magic units no longer show the 🪄 chip in the skill strip, because the wand on the attack label already says it.
- **Greyplume Fledgling (new card):** a young Hummingbird warrior who hasn't chosen her plumage colour, Otter Kit's mirror. She is a Starter, Wait 0, free, and a Hummingbird basic, with 2/5 Flying (65% of N, Otter Kit 67%). She is awaiting a source, and she isn't in a starter deck or pack yet. NightCafe brief: `docs/art/new-cards-2026-10-21-briefs.md`.
- **Dive and Sprinter:** Dive isn't defined anywhere yet (no card, rule, text or doc). Its eligibility rule is in the engine (`diveEligible`: Flying, Tide or the new **Sprinter** tag). The tag is on Pronghorn Racer, Savanna Cheetah, Jackrabbit Sprinter, Frost Hare Sprinter, Snowshoe Hare, Mountain Hare and Springbok Pronker (there is no gazelle card). Ramming options are in `docs/ramming-proposal-2026-10-21.md` (not built).
- New texts: 11 TX keys (Archer, On Action, Arrow, the drop look, the log lines), translated in the 12 packs, and the card name in `lang/cards`. Test: `tests/bx-2026-10-21.js` (also in `tests/run-all.sh`). The old Wave tests now expect the frontier push.
## 2026-10-21 (package RP: rewards and sources pass)
- **Owner (Oct 21):** "First pass edit on all the skirmish cards and their rewards. Be strict on what is a Skirmish reward (these CANNOT be pack rewards) and which are faction rewards ..." Card sources and placement only; package BF5 re-derives the stats. `docs/balance/rewards-pass-2026-10-21.md`.
- **158 cards changed source**: 6 to the faction rewards (every Otter and Hummingbird card is a faction reward now, or a starter / tutorial / Nest / Blacksmith card), 8 plain cards and the Lumber card onto Maps 0-1, 71 to main maps, 20 to the basic packs, 31 Devilry and Ecclesia cards and 21 others held (awaitingSource), the Meadow Frog to Base only. No card sits in two categories; no skirmish reward is in any pack pool (a people's bundle no longer tops itself up with map rewards).
- **Faction reward track** (`FACTION_REWARD_TRACK` in `arena_app.js`): rarities open by faction cards received (duplicates count) and map: Uncommon after 25, Rare after 40 and Map 14, Very Rare after 50 and Map 25, later steps proposed. The lowest open rarity almost always comes first, a plain card first on Maps 0-1. Hand-outs: 0-2's faction pack, each main map's last fight (was every elite and boss), every 8th first clear, the 3-2 ambush, and eight achievements (they show "🦦🌺 Faction cards +n"). Simulated: 40 received in Map 13, the Rare from Map 14 (`tools/faction_track_sim_2026_10_21.js`).
- **Maps 0-1 rewards are plain** (Chipmunk Skirmisher, House Cat, Farm Dog, Terrier Pup, Sergeant Bramblefox, Cricket Drummer, Dormouse, Compost Grub, Bramble Sprout) and **Map 1 brings Lumber** with the Badger Lumberjack on 1-4. The keyword-teaching extra cards on Maps 0-1 wins are off.
- **Gates:** no Devilry card before Map 66, no Ecclesia before 77, no Evomax before 30. **Side maps** keep one unique card each (their boss's) and open late: Clovermead after Map 5, Smugglers' Grotto after Map 7, the Sunken Grove 9, the Mycelium Deep 11, the Glimmer Depths 12, the Sunken Depths 14, the Aerie Vault 15, the Canopy 18, the Ice Hollow 21, the Basalt Foundry 23; their fights count as that map.
- The Codex no longer says faction cards come from "any basic pack". `docs/map-recommendations-2026-10-21.md`: up to 10 creatures and the skills for every map 0-28. Decisions recorded (world bosses, bosses from Map 5, limit break, the map term, the eras). `tests/rewards-pass-2026-10-21.js`.

## 2026-10-21 (package TX: types, taxonomy and filters)
- **Owner (Oct 21):** "Specific animals are their greater animal type too. Eagles are birds." / "Aquatic is the geo type (not phyla) ..." / "Changelings count for every type." / "Enhanced filter in codex (and every filter power in codex to be in the deck editors (skirmish included always!) High-low options as well." / "Diurnal is the same as Diurnal {}" / "aggregate filter like lumber-related ..." / "Meadow Frog's Tide should be ? until Map 2+. Diurnal, if seen in Map 0 (not Tutorials), should be ?."
- **One type hierarchy, in one place:** `bramblewood-taxonomy.js` (`BramblewoodTaxonomy`). Its data is written by `python3 tools/type_taxonomy.py` from `canonical/animal-tags.json`. The chain runs animal → group → species → class, for example eagle → Raptor → Bird, otter → Mustelid → Mammal, octopus → Cephalopod → Mollusc. Habitats are in it too: Coral Reef → Ocean → Aquatic, River and Pond → Aquatic, and the water animals (Fish, Cephalopod, Cnidaria, Cetacean, Echinoderm) are Aquatic. The build puts the file ahead of the engine, so the page, the app and the simulator worker all read the same rules.
  - **isA:** a card counts as every type it is, through the hierarchy. **shares:** two cards share a Type when one card's own type is something the other card is. A Bird-typed card and an eagle share a Type. An eagle and an owl that both list no Bird do not.
- **Engine checks that use it:** Kin and `sharesType` (Kin targets, Esprit, Kin Rally, the Kin trigger filter), Swarm (shares a type, and picked types), Kinship, Pack chains and Pack placement, Defiance, the trigger type filter (`filterArchetype`), Resist / Weakness type keys, Atheist (Devilry / Ecclesia), Frost resist, King Slayer, Siege on Structures, Mindless (Elemental / Plant / Flora), Nature's Force, Amore pairs, egg pools and the CPU's Pack Howl wolves. Without the file (a bare copy of the engine) the old rule applies.
- **Changelings count for every type** in all of those checks, by the `changeling` skill or the changeling subtype. One exception: a Changeling still has a mind, so Psychic damage hurts it.
- **Balance effect (measured on the 719 live creature cards):** pairs that share a Type go from 13,976 to 25,157 (+80%). The biggest changes are to Kin partners. Bees and Hummingbirds now share with every Insect-typed or Bird-typed card: Bee Knight 9 → 64 partners, the Sunspire cards 27 → 80, Lovebird 78 → 160, the ants 58 → 75. The Kinship cards hardly change (Otter 30 → 30, Bee 10 → 11). Defiance Snake 13 → 15. Egg pools grow a little (Bird 127 → 138, beasts 288 → 319). No card stats were changed.
- **Aquatic is a habitat now, not a phylum.** The new phyla are Fish 🐟, Cephalopod 🐙, Cnidaria 🪼 and Echinoderm ⭐. Snails, slugs and clams stay with the Crawlers. Species changes in `cards.json` (20 cards):
  - 13 octopus, squid, nautilus and cuttlefish cards: Mollusc → Cephalopod.
  - 4 jellyfish and coral cards: Cnidarian → Cnidaria. No anemone card exists yet.
  - The moray: Cnidarian → Fish.
  - 2 cards: Feline → Felid.
  - A water animal's species line reads "🧬 Fish · 🌊 Aquatic". An old Cnidarian or Feline on a saved card reads as Cnidaria or Felid.
- **Skills that referenced Aquatic:** none named it. The phylum was a display label only. The water-type checks that remain are species checks: the Roe Pearl egg's Fish / Cetacean / Mollusc / Crustacean now also hatches Cephalopods, because a Cephalopod is a Mollusc. "Aquatic" in the filters means the habitat.
- **The Codex filter bar is in every deck editor.** That covers the deck editor in Play and at the Camp, the skirmish, dungeon and tutorial deck builder popup, and the skirmish gallery. The bar has a type filter with Habitats, Animal types and Other types, using the hierarchy: Bird includes the eagles, Aquatic includes the water. It also has the animal, phylum, rarity and archetype filters, the skill picker, and Clear. All of this is `cfBarHTML` / `cfWire` / `cfMatch` / `cfSortFn`, which the Codex shares.
- **Sorts:** Cost, Wait, Attack, Health, Rarity, Level and Battle rating, each high to low or low to high (plus Name, Phylum and Advancement in the Codex). ↓ High to low now puts the highest first for every number. Before, Cost and Wait went the other way.
- **Skill filter, one chip per skill:** Diurnal and Diurnal {…}, Nocturnal, Tide, Full Moon, Swimmer, Bloom and Bloom (when), Arrow and its count, and the two Siege rows.
- **Skill groups, ahead of the skill chips:** Lumber, Stone, Metal, Resources, Damage, Healing, Statuses, Movement, Summons, Defense, Day and night, Tide and water, and Cards and hand. Each group is built from the skill registry's own names and texts (every category) and the trigger actions. A Gain trigger counts for the group of the resource it gains.
- **The reveal map:** `SKILL_REVEAL_MAP` holds "revealed from Map N" per skill, with its parts and a `tutorials` flag. Tide is revealed from Map 2, so the Meadow Frog's Tide on Map 1 shows "?". Diurnal is revealed from Map 1 and shows "?" on Map 0, except in a tutorial fight. What the tutorial shows is not remembered.
- **Texts:** 39 TX keys (`ui.tx-*`) in the 12 packs (`tools/i18n_2026_10_21_tx.py`).
- **Tests:** `tests/tx-2026-10-21.js` covers the hierarchy, Changelings, the families, the groups, the sorts and the reveal map. `tests/e2e/tx_2026_10_21.py` runs Playwright at 390 and 1366 on the Codex and each deck editor; the screenshots are in `docs/screens/tx/`.
## 2026-10-21 (package FX-WAR: smoke and war effects in the Effects Lab, with "in game" badges)
- **Owner:** "add smoke effects if we haven't yet, and others related to war, that we can pick and choose and use. Flag the effect used if it's already used in game, so we know in the future."
- **Audit:** the game already had smoke (Smoke Bomb, evade in smoke and fog, the poison gas cloud, the stampede dust) and war looks (Dynamite, Fireball, fire arrow, Volley rain, Siege ram, Ballista, Rocket, Rally, Shockwave, Scorch, crater, burning ground, the blown-up death, Friction and crit sparks). Three are built but nothing calls them: Rally standard, Wildfire front and Fog banks.
- **16 new effects** in `bramblewood-fx-war.js` (`window.WarFX`): Puff, Smoke bomb burst, Smoke screen, Drifting battlefield smoke, Smoke column, Battle dust, Cannon blast, Catapult lob, Explosion, Flaming arrow volley, Burning ground, Sword clash, War horn, Siege ram slam, Caltrops, Signal flare. Bubbly and cute, no blood; transform and opacity only (no CSS filter, no blend layer); still glyph in reduced motion.
- **Not wired:** nothing in the game calls `WarFX`, `arena_app.js` and `assemble_arena.py` are unchanged. They are Lab only until you pick some.
- **Effects Lab:** a new **Smoke & war** tab with a sticky stage, filters (smoke and dust, war, lab only, in game) and variants per effect, plus the 23 existing looks to compare. Every card shows **In game: <where>** (green) or **Lab only (not used yet)** (brown). The Catalogue tab's rows got the same badge, and an "In game or not" filter with a count.
- **Docs:** `docs/effects-catalogue.md`, "Smoke and war (2026-10-21)": the audit and the new list, each with an in-game column. Screenshots in `docs/screens/fxwar/`.

## 2026-10-19 (package U4: visible toggle states, a Forge shortcut, the deck popup's Advancement sort)
- **Owner (23:20):** "The show unseen and all by ID, -> should show a tick or not if enabled or not - can't tell."
  - **Cause:** the Codex toolbar's text-field rule (`.codex-toolbar input`) stretched those checkboxes into empty 160 px pills, so on and off looked the same.
  - **Show unseen, All by ID and Test cards** are switches now (`role="switch"`): an empty box when off, a gold box with a ✓ when on, and the whole pill turns light gold with a ring while on.
  - **The audit:** any Codex or Brambles filter select set to anything but its "All …" option wears a gold ring. That covers types, animals, phyla, rarities, archetypes, effects, and Owned / Not owned. The chosen chip carries a ✓ as well as its fill: card types, Base level / My best, Brambles' origins, the Forge's All / Ready / Levelled / Max, and the skill filter's picks.
- **Owner (23:34):** "a forge shortcut in the top right corner of the screen, together with arena and home. Home of course comes first."
  - The Play cluster (Conquest, Arena, Raid, Dungeons) is now 🌰 Home, 🏟️ Arena (where it already showed), 🔨 Forge (once the Forge is open), then the key, ⚙️ and Energy.
  - The Forge button goes to the Forge the way the page bar's shortcut does. The Arena button's texts are TX keys too, translated into the 12 packs.
  - It fits on one line at 360, 390 and 1366 px, with no sideways scroller. At 360 px the map strip takes its own line under the cluster (U3's fallback).
- **Owner (23:44):** "skirmish editor - sort by advancement option as well."
  - The skirmish editor's deck popup has **Sort: Advancement**. It uses the Codex's order: Base, then each map's fights along the road with side maps after their parent, then packs and events. The choice is kept on the device.
- **Tests:** `tests/u4-2026-10-19.js` (static), and `tests/e2e/u4_2026_10_19.py` (Playwright, 360 / 390 / 1366). `tests/mobile-nav-2026-10-19.js` now counts the Forge button in its overlap check. Screenshots are in `docs/screens/u4/`.

## 2026-10-19 (package MX: raid Shield 50, trophy shards per fight, random Tentacle Smack rows, the key badge at 0, swaps only for better cards)
- **Raid Shield (owner 22:47: "Add a shield value of 50 to the Raid. As the HP% goes down, this 50 goes down proportionally."):** the boss's bramble in a raid fight opens with a Shield of 50 × the part's remaining Health share (the same share the boss's weakening uses): 50 fresh, 25 at half, 0 at the end. It soaks hits before Health and shows as 🔷 on the bramble, like any Shield. The raid screen and the VS boss card say "Shield 50 (falls as the raid weakens)" (TX keys, 12 packs).
- **Raid editor:** a "Shield" field beside "Energy" for the raid (default 50; 0 turns it off) and for each part (blank = the raid's). A saved raid edit without one gets 50. `canonical/raids.json`: the Goliath's `shield: 50`. `tools/raid_completion_model.js measure --shield N`.
- **Daily Dungeon key (owner 22:47):** the top-right 🗝️ always shows its count. At 0 keys the key greys out, the badge becomes an empty "0", and its tip says when the keys refill. Checked: the Energy pill (0/20) and the raid tickets chip (0/10) already show 0.
- **Swaps (owner 22:47: "Don't recommend cards that are lousier than what i have in my deck."):** the swap window (the Map 0-1 teaching swaps, the Lumber lesson and the later offers) only suggests a swap when the new card is clearly better than the deck card going out. Clearly better means a higher budget score (2A+H+S × the half-miss multiplier), the same Lumber bracket or a cheaper one, and no more Wait. The new card also has to dominate the deck card or beat its score by 10% (at least 1 point). If nothing in the deck is weaker, no window opens. Both columns of the window follow the same rule. The Map 0-1 teaching card is now picked from the keyword cards that beat a deck card, so the lesson still shows. Test: `tests/mx-2026-10-19.js`.
- **Raid trophy shards (owner 23:43: "minimum 1 per game you played ... Maybe 2x and 5x rewards"):** a fall pays 1 shard for each fight you played in that life, or the flat base (6) if that is more. Competent participants get ×2 and Leading ones ×5 (these were ×1.2 / ×1.4 plus +2 / +5). The standing bonuses (top 1% / 10% / 50%) and the held-raid share are unchanged. 40 fights give 40 / 80 / 200. The ticket budget allows about 16 fights a week, so in the model a Leading raider gets 60–80 a fall and a Competent one 14–24. The raid screen, Forge and rules texts are updated in all 12 packs, and `tests/rc-2026-10-19.js` covers the new rule. Recipe costs are unchanged.
- **Measured:** a Map 13 deck deals 252 → 235 damage a fight (−7%; −16% on a fresh arm or tail), and wins 37% → 32% of its fights. Completion at 30 / 40 / 50 players stays 100% (the fall is about 0.05 days later). See `docs/balance/raid-balance-2026-10-19.md`.
- **Tentacle Smack (owner: "The raids tentacles should be hitting a random column or row and not my row everytime btw!"):** a row smack used to hit the front row (yours) 2 times in 3. It now picks the front, middle or back row at even odds. Column smacks still pick among the columns that have units, weighted by how many units each holds. Seeded as before. A test checks that 200 rolls (over fights and over rounds) spread evenly across the rows and columns.
- **Fix:** on small bramble tiles (the fight HUD at phone width) the 🔷 Shield badge covered a 3-digit Health. It now sits just above the Health row.

## 2026-10-19 (package CF: card frames for equipment, Devilry and Evomax)
- **Owner (22:32):** "Equipment & devilry card frame - can it be improved? ... too pink ... I don't want to stray too far from [the normal frame]. Just abit different."
- **Before:** there was no equipment frame. Equipment wore whatever its archetype gave it: Quill Spear and the other plain equipment the normal walnut frame, Terraumbra (an Evomax equipment Easter egg) the pink nacre Evomax frame (`a-evolution.png`). Devilry units wore their own dark-iron frame with blood drips and pentagram studs.
- **Equipment frame (`.fr-equip`, every `cardType: 'equipment'` card):** the normal frame, forged: a gunmetal band instead of walnut, a pewter inlay and corner rivets, a small gear and two rivets on each side band.
  - An archetype's equipment (Terraumbra, a Scrapper Crowbar) keeps the equipment frame and shows its archetype with the corner mark, as other unframed archetype cards do.
- **Devilry:** the normal frame, smouldering: a crimson-to-charcoal band, an ember-red inlay, a seal sigil over each corner pin and a few ember glints that flicker (they hold still under reduced motion and Effects Low). The old Devilry aura stays.
- **Evomax units:** the normal walnut frame with a pearl inlay, shell-rib ticks on the top band and plate, and a spiral shell on each side band, in place of the pink nacre frame. No Evomax unit exists yet; the sheet uses a stand-in.
- CSS only (pixel-grid SVG ornaments on a new `.cframe-orn` layer, so the inlay's tint filter doesn't touch them). No new raster art. Structures keep their `s-<key>` boards; Ecclesia, Scrappers and the other archetypes are unchanged.
- Comparison sheets (before / after, hand and detail size, 390 and 1366): `docs/screens/cf/`, rendered by `node tools/card_frame_sheet.js <tag>`.
## 2026-10-19 (package TF: the raid's Tentacle Smack on desktop Chrome)
- **Owner (22:09):** "in raids, i saw the tentacle slam in mobile, but not in chrome. The tentacle can slam vertical or horizontal."
- **Root cause:** Chrome on a desktop follows the OS's "reduce motion" / "animation effects off" setting (`prefers-reduced-motion`). Under it, the smack drew **no tentacle at all**, only a 420 ms pink flash on the struck cards. There was a second cause: during a fight, GSAP's lag smoothing is off. A slow frame as the round opened could skip the whole 0.7 s slam, so its impact fired with the limb never painted. This was reproduced in headless Chromium at 1920×1080 and 1440×900.
- **Reduced motion:** the tentacle now lies still along the struck column or row. It fades in, holds for about 600 ms and fades out, with the flash on the cards. The Tail Sweep keeps its plain flash.
- **Frame-capped clock:** the tentacle advances at most 1/30 s per frame, so a long frame holds it instead of skipping it. It still follows hit-stop and the Lab's slow motion.
- **Vertical (column):** it comes down its column. It grows out of the bramble when the bramble is above the column (phones). On a wide desktop board it comes out of the board's top edge above the column, leaning at most 16° toward the bramble. Before, it was one long diagonal from the corner tile.
- **Horizontal (row):** unchanged. It lies along the row from the board's edge on the bramble's side.
- **Mask region:** the base's fade mask now covers the limb's own box, not a 30000 px square.
- **Test:** `tests/e2e/tentacle_fx_2026_10_19.py` (run with `--e2e`). It runs at 1366×768 (desktop) and 390×844 (phone), with reduced motion off and on, through the game's event path and a real round. At impact, it checks that the tentacle element is visible, inside the viewport, at opacity > 0.3 and painting pixels, and that it spans the right axis. Screenshots are in `docs/screens/tf/`, including 1920×1080 and 1440×900.
## 2026-10-19 (package RW3: raid reward cards show as cards)
- **Owner (22:14, 22:32):** "What is 'honeybrew'? it was a reward upon completion of the raid" … "The raid just showed Honeybrew, not a card image."
- **What it was:** the card **Honeyjoe Brewer**, an Uncommon pack card. A won raid fight drops one pack card (package RC). The results showed it only as a small "🃏 Honeyjoe Brewer" pill, with no art, no rarity and nothing saying it was a card. No name builder, drink, item or currency called "Honeybrew" exists.
- **Raid fight results:** the pill is gone. The dropped card sits under "Cards won" as the card itself: its tile (art), full name, rarity and "Pack card" (or "Raid card" for one of the raid's own). It flips in on the reward reveal like any victory's card, and a tap opens its details.
- **Raid claim screen:** each card reward shows the tile, the full name, the rarity and "Pack card" / "Faction card". Once the screen has settled, a tap opens the card's details over it, and Esc closes the details, not the screen. The tile's stat glyphs no longer blow up to 32px (the reward-icon rule had reached into the tile).
- New text: "Tap to see the card" (TX `results.rw3-card-open`, 12 packs). Test: `tests/raid-reward-card-2026-10-19.js`. Screens: `docs/screens/rw3/`.

## 2026-10-19 (package SK3: skills batch 3, triggers × actions)
- **Owner (21:56):** "if you can and it makes sense, feel free to use triggers and actions. if they dont suffice, add the required trigger or action." Most new skills are keywords that expand into ordinary triggers (Waiting, the layer cap, Confused and Exhaust all apply).
- **New trigger:** On Any Death (any other unit dies, either side).
- **New actions:** Duplicate, Feed on the graveyard, Buff all allies, Stench, Silence, Stymie, Exhaust, Petrify, Vulnerable, Barrage, Smoke Screen and Magnet.
- **New skills** (on no existing card): Spawner, War Banner, Warcry, Shieldwall, Corpsefeeder, Amplifier, Stench, Broodkeeper, Herald, Harbinger, Spotter, and Silence / Stymie / Exhaust / Petrify as On Attack keywords. Every number is in the engine's `SK3_DEF` (per fight: `rules.sk3`).
- **Aligned:**
  - Executioner N: below 25% Health (was half). Grave-Grin Hyena's bonus now comes later.
  - Shatter N: also hits Petrified and heavily armored (Armor 3+) units. On stone the hit is doubled, not halved.
  - Hunter is shown as **Cull** (the key stays `hunter`; owner call). Its new default pick, Weak, means Attack 2 or less AND Health 4 or less. Fen Mink keeps its Poisoned pick.
- **New spells** at the end of `canonical/cards.json`, with no source yet: Grave Call (Epic, 4), Smoke Screen (Rare, 2) and Magnet (Rare, 1). Their art prompts are in `docs/art/new-cards-2026-10-19-briefs.md`. No Clarity Bomb card (owner 22:08: it is the Spotter skill).
- **Costs:** estimates in `canonical/skill-costs.json` (measuredHow "estimate SK3").
- **Texts:** 102 TX keys in 12 packs (`tools/i18n_2026_10_19_sk3.py`). The Codex skills book, the status chips, log lines and the trigger builder all have them.
- **Docs:** `docs/strategies-2026-10-19.md` (the owner's question 18: the archetypes, the go-wide audit and 8 new directions).
- **Tests:** `tests/skills-sk3-2026-10-19.js`. The GI test follows the Executioner, Hunter and status-list changes.
## 2026-10-19 (package SK1: new combat skills; the Cure / Heal / Cleanse split)
- **Owner (21:36, 21:56):** new combat skills, Expose about hiding, Exploit about damage, Demolition renamed Siege, the Cure / Heal / Cleanse split; "if you can and it makes sense, feel free to use triggers and actions".
- **Triggers × actions:** these five skills are now shorthands built from triggers and actions:
  - Sentry N = On Enemy Enters (Facing): Damage N.
  - Expose N / Exploit N / Venom Pulse N = On Hit: Expose / Exploit / Poison Tick N.
  - Spoils N = On Kill (Creature): Buff itself +0/+N.
  - The three triggers and the Exploit and Poison Tick actions are new. They are in the trigger builder too.
- **New skills (on no card yet):**
  - Formation (+1/+1 for each aligned ally, up to 2).
  - Isolation (a drawback: −4..0 by allies within 2 columns).
  - Anchor (can't be moved).
  - Exploit N (tokens, +1 a hit).
  - Spoils N (+0/+N on killing a creature).
  - Venom Pulse N (the target's Poison ticks again).
  - Punish N, behind a flag (`rules.punishSkill`), with three designs in `docs/skills-punish-proposal.md`.
- **Reworked skills:**
  - Sentry N deals N to each enemy unit entering its 3 facing slots, by play, spawn, move or swap. Before, it hit with its Attack once a round.
  - Expose N strips hiding for N rounds: Invisible, Evasive, Smoke, Shadow and Stealth. Flying and Swift still dodge.
  - Siege N is the old Demolisher plus the old Siege: +N on Structures and on the bramble. The five Demolisher cards and an equipment grant were renamed. `demolisher` is still an alias for old saves and server overrides.
- **Cure / Heal / Cleanse:**
  - Cure removes Poison only.
  - Heal restores Health only, with no more Bleed stanch.
  - Cleanse and Renewal remove the physical debuffs only: Bleed, Scar, Corrosion, Brittle, Exposed, Exploit, Shocked, Staggered, Daunt and shredded Armor. They no longer remove Poison, Freeze or Stun.
  - Phoenix Fledgling keeps its intent with Renewal + Cure 2.
- **Numbers:** every number is a parameter. The defaults are in the engine's SK1_DEF, and one `{sk1:{...}}` object changes them all.
- **Costs:** the new S estimates are in `canonical/skill-costs.json`, marked `measuredHow: "estimate SK1"` with low confidence. The reworked entries carry an `sk1Note` (re-measure).
- **Texts and tests:**
  - 63 new TX keys in the 12 packs (`tools/i18n_2026_10_19_sk1.py`), and the decisions in `docs/decisions.json`.
  - The new test is `tests/skills-sk1-2026-10-19.js`.
  - The Expose, Heal, Cleanse and Sentry checks in older tests were updated.

## 2026-10-19 (package UX2: the Brambles page's filters)
- **Owner (22:16):** "There's no filter in brambles search."
- **The Codex's Brambles page has a filter bar like the card Codex's:**
  - a name search;
  - an Effect filter, listing each castle passive with its count: Starting Lumber, Lumber over time, First unit's Attack, Unit Health, Flyers' Attack, Healing, Enemy Wait, Ballista bolts, Thorns, Herb brew, Summons, Tentacle Smack, Tail Sweep and No passive;
  - Owned / Not owned yet, using `castleUnlocked`;
  - a sort: game order, Health (both ways) or name;
  - "where it's from" chips with counts: Yours to own, Skirmishes, Bosses, Raids, and Tower & dungeons. These come from the fights that use each bramble (`nodeCastleId`, else the map's or the plain Bramble).
- **Count and empty state:** a "N of M brambles" count, and an empty state with Clear filters. Owned brambles carry a ✓, and a bramble's fights show as small icons.
- **Raid brambles:** Kraken's Reef and The Drowned Maw are listed from the live raids, with their Health a fight, the parts that use them and their throws. They are never owned.
- **No "seen" filter:** brambles have no "seen" record, so that filter is left out.
- **Texts and test:** 36 TX keys (`ui.ux2-*`), in the 12 packs via `tools/i18n_2026_10_19_ux.py`. `tests/ux-2026-10-19.js` is extended, including Playwright at 390 and 1366 and the screenshots `docs/screens/ux/brambles-*`.

## 2026-10-19 (package RR: raid row parity)
- **Owner (22:10): "Raid: Back units cleave the same way as the front units. And all the skills should work as if they were at the front okay!"** In a raid, a skill on a middle- or back-row unit now does what it does at the front.
- **Swing shapes on the row it aims at.** A row unit's swing aims at the closest enemy row with a unit in its column (the front row when the column is empty everywhere). Every shape is worked out on that row, the same way as a front swing on the enemy front row:
  - Cleave: the target and both neighbours in its row.
  - Fork / Trident / Pitchfork: the target column ±1 (±2) in that row. Crab claws: L / R in that row. Octolash: the 8 nearest in that row. Tipsy: drifts along that row.
  - Rook's Row / Bishop's Path, Wave (it pushes along the struck unit's row) and Puncture / Overwhelm.
  - Backstab: the nearest unit in that row. With no unit in that row, it takes the closest row that has one. This also fixes a front Backstab holding its swing when only the boss's back rows had units.
  - Taunt: a Taunt unit in that row, within a column, draws the swing. That includes a front-row swing that carries on to the middle row.
  - Bloodlust: it leaps along its own row. Boomerang: thrown and caught from its row.
  - Its prongs and lashes land at the row share too.
- **Shots:** a row unit with Arrow, Bolt, Twin Shot, Volley and the like shoots, from its column. Shots are not cut by the row share.
- **Round start and upkeep for every row:**
  - Every round: Regeneration, Renewal, On Round Start, Per Turn, Bloom / Nursing / Healing / Cure (their allies found in every row), Satiety, Explode, Immolation, Irradiated, Proliferate, Restless (it walks along its row), Dynamite fuses, Charge, Cower and Prayer.
  - While Ready: Lumber / Grace / Darkness, Rebuild and Creative.
  - Auras from any row: Rally, Nature's Force, Kinship, Worship, Haste, Illuminate, Lumberjack, Fletcher and the others counted by `auraN`.
  - A Wait that runs out on a row unit's action gives it Ready and its On Ready skills at that round's upkeep.
  - On Ally / Enemy Ready, Played, Spawn and Healed, Esprit, Carrion, Amore and Ambush / Sentry now see the row units too.
- **Slot refills in the unit's own row:** Revive, On Death: Spawn, Relic, Crystallise, Meiosis, Brood, Twin, Sprout and Spawn triggers. The first goes into its slot, the rest into the nearest free slots of that row.
- **Arrival in a row:** a unit put into a middle or back row (an ally's play, a boss's Commons) arrives there at the start of the next combat. That fires its On Play skills (Pounce, Brood, Bounty, Shield, On Spawn ...) once. It doesn't arrive again if it later steps up.
- **Ally-targeted actions** (Heal, Buff, Shield ...) can pick an ally in any raid row. "Adjacent" and "furthest" ally mean in the unit's own row. A row unit's "adjacent ally" used to hit the front row's leftmost unit.
- **Unchanged, owner to decide:** a row swing still lands for half (rounded up), now one constant, `ROW_SWING_SHARE` (0.5). No owner rule set the half: it was Claude's call on 2026-10-17. Enemy-targeted skill pools (Pounce, Lightning, random-enemy actions) still pick from the enemy front row, as for a front unit.
- Engine only (`bramblewood-engine.js`). Test: `tests/raid-row-parity-2026-10-19.js` (118 checks; 68 of them fail on the engine before RR).
## 2026-10-19 (package EQ: equipment on the slots, Weapon Master, slot hazards, the Crowbar, the Bucketknee Wolf, Creeper's art)
- **Equipment on the slots** (owner 21:36: "Same slot placement rules except you can play over creature units as well ... they take 1 turn to take the benefits"):
  - An equipment card goes into any slot a unit could go to, where it lies alone, or onto a slot holding one of your units, where it goes under the unit. Dragging it onto a unit still works.
  - A unit played, spawned or moved onto a lone piece picks it up.
  - When they meet, the unit is equipping for one round (`equip.turns`, default 1). At the next round's start it gains the piece's Attack, Health and skills.
  - A lone piece does nothing. It can't be hit, and the swing facing it goes past to the bramble, as for an empty slot. It doesn't open the slots beside it.
  - When the unit dies, the piece stays in its slot for the next unit (`equip.breaks: true` sends it to the graveyard instead). An equipped piece moves with its unit. Structures and cages carry nothing.
  - On the board: a lone piece is a small item in its cell, a carried one is tucked under the card (pulsing while equipping), and the card detail says what the unit carries. The CPU puts a piece under its strongest unit.
- **Weapon Master N** (a skill): while it is on the field, its side's arrows deal N more (Arrow, Fire Arrow, Ice Arrow, Twin Shot, Volley) and each equipped ally gets +1/+1. **Armory** (new, Rare Structure, 0/21, Weapon Master 1, no source) is its structure version. **Pry N** (a skill): a landed hit strips N Armor for good.
- **Slot hazards** (owner 21:36), five new hazard spells (no source yet). Each goes on one slot on either side, for 3 or 4 rounds:
  - **Frost Slick** (Ice Floor): a unit coming in slides one slot on.
  - **Magma Vent** (Lava Floor): On Round Start, Damage 2 (fire).
  - **Bog Seep** (Poison Floor): On Enter Slot and On Round Start, Poison 2.
  - **Miasma** (Toxic Gas): On Round Start, Poison 1, flyers too.
  - **Rockfall** (Rubble): the foe can't play into that empty slot.
  - Owner 21:56: their effects are **triggers and actions**, with one new trigger, **On Enter Slot**: it fires on a unit played, spawned or moved into a slot, and units can use it too. Flyers and Mountain Climbers are above the floors, except the gas.
  - Drawn as an overlay on the slot. While a hazard card is held, every cell of both rows is a drop target. The CPU lays them where they bite.
- **New cards** (at the end of `canonical/cards.json`, budgeted with today's helper by `tools/eq_cards_2026_10_19.js`): Crowbar (Rare equipment, +2/+0, Pry 1, 1 Lumber, no source), Bucketknee Wolf (Very Rare Easter egg, 6/14, Armor 1, Helmet, Wait 2), Armory, and the five hazards. The art prompts are in `docs/art/new-cards-2026-10-19-briefs.md`; no art was generated.
- **Creeper** wears its old art again (`art/cards/creeper.png`).
- **Shared code for SK1:** `slotEntries(players, key)` in the engine is the "a unit entered a slot" scan. Each caller keeps its own memory key. The On Enter Slot trigger and the floors use it (`floorScan`, run at the start of `watchScan`).
- **Texts:** 36 new TX keys, in the 12 language packs with the new card names and flavour (`tools/i18n_2026_10_19_eq.py`).
- **Merged with SK2:** the Petrified Tree had no animal, so `tools/animal_tags.py` stopped. It now has a proposed owl, like the Ent (an owner call). SK2's test now finds the tree by id, because the EQ cards come after it. Pry wears 🪝, since 🔧 is SK2's Repair.
- **Tests:** `tests/equipment-hazards-2026-10-19.js` (new, 119 checks). `tests/equipment.js` and `tests/easter-eggs-2026-10-19.js` were updated. There is also a browser smoke test, `tests/e2e/eq_2026_10_19.py`.
## 2026-10-19 (package SK2b: Quarry, Smelter, the economy note)
- **Owner (23:43):** "I want to make resources really a strategic move. Not a simple - just put. Strong creatures can be low costed - and their power is that they are low costed."
- **Three tiers**, each paid with the one below. All are On Turn Start × Gain in the trigger layer, every turn while Ready:
  - **Milling N:** N Lumber, free.
  - **Quarry N (new):** pay 1 Lumber, gain N Stone.
  - **Smelter N (new):** pay 2 Lumber + 2 Stone, gain 1 Metal, up to N times.
  - The ratios are in `SK2_DEFAULTS`. No card has Quarry or Smelter yet.
- **New trigger condition: a price (`t.pay`).** A trigger goes off only if its player holds the whole price, and pays it after every other gate, so a fizzle costs nothing.
  - If it can't pay, nothing happens, and the log says so.
  - Units pay in the upkeep's order, so a Quarry acting first can feed a Smelter the same turn.
- **Docs:**
  - `docs/economy-resources-2026-10-19.md`: what makes each resource today, the tiers, the owner's principle, and budget recommendations. Nothing in the budget was changed.
  - The principle is recorded in `docs/decisions.json` / `decisions.md`.
- **Texts:** TX keys in the 12 packs.
- **Skill costs:** estimates for Quarry (n 2.5) and Smelter (n 1.5).
- **Weapons (owner, Oct 21):**
  - New action **Forge Weapon N**: lay a +N/+0 Forged Blade (an equipment token) in your free slot nearest the unit. With no room, nothing happens and nothing is paid.
  - New skill **Disarm**, built from triggers: On Play takes the foe's nearest lone piece; On Hit takes the hit unit's piece, with its stats and skills. It takes nothing if it already carries one.
  - New cards, at the end of `cards.json` with `awaitingSource`: **Anvilwhisker Otter** (the owner's "Otter Smith": On Turn Start, pay 1 Stone, Forge Weapon 1) and **Glintsnatch Magpie** (Disarm, Flying).
  - Art prompts added to `docs/art/new-cards-2026-10-19-briefs.md`.
- **Equipment rules checked (owner item 17):**
  - The piece goes under a unit.
  - A unit played, spawned or moved onto a lone piece picks it up. One already carrying a piece leaves it lying.
  - The bonus comes after one round.
  - The piece stays in the slot when its unit dies; on a gravity row it goes to the graveyard.
  - It moves with its unit.
- **Map 1 Lumber:** the economy note recommends Milling on Village Miller (a 1-3 reward), Harvest on Harvest Mouse, and Land Tiller re-keyed as Milling, all in Thistlewood. Recommendations only.
- **Tests:** `tests/skills-sk2b-2026-10-19.js` (86 checks).

## 2026-10-19 (package SK2: economy and structure skills)
- **Owner (21:36, 21:56):** economy and structure skills, plus Salvage and a Stone-making Petrified Tree. Use triggers and actions where they fit.
- **Ten new skills, on no existing card yet** (engine: the `[SK2 BEGIN]` block in `bramblewood-engine.js`):
  - **Harvest:** half its swings give 1 Lumber instead. With nothing opposite, it always harvests.
  - **Scavenge N, M:** a death within 1 gives N points. Every M points (3) become 1 Lumber.
  - **Salvage N, M:** like Scavenge, but only Structures count, and the points become Stone.
  - **Repair N:** each turn it mends the most damaged allied structure within 1 column for N. With none, it mends your bramble for N/2.
  - **Foraging N:** 1 Berry a turn. At 3 Berries it heals the most damaged other ally for N (3).
  - **Milling N:** On Turn Start × Gain N Lumber, in the trigger layer. It still attacks.
  - **Pickpocket N:** steals N counters from the unit it hits (Prayer tokens, Berries, points, Creativity; never debuffs). On the bramble it steals N resources, lowest rank first.
  - **Sabotage N:** destroys N of the foe's resources, lowest rank first (Lumber, Stone, Metal, Uranium).
  - **Arson N:** burns N of the foe's Lumber.
  - **Fortification:** on play, it builds a 0/6 Palisade (a Structure token) in an empty slot beside it.
- **Numbers:** every number is in `SK2_DEFAULTS` at the top of the engine. A fight can override any of them with `opts.sk2`. The app's card lines read the same table.
- **Structures** are one unit category: `isStructureCard` covers the Structure type, a legacy type and `cardType: 'structure'`. Repair uses it, and so does Siege.
- **New card:** Petrified Tree (Rare, Lumber 5, Wait 3, 0/45, Flora Structure). It gains 1 Stone each turn through On Turn Start × Gain Stone. It is the last card in `canonical/cards.json` and has no source yet. Its art prompt is in `docs/art/new-cards-2026-10-19-briefs.md`.
- **App:**
  - Skill names, card lines, Codex notes, icons and card-face chips.
  - Berry, scavenge and salvage chips on the unit.
  - Battle-log lines and floats.
  - The Palisade's name, and a Berry keyword.
  - Every string is a TX key, translated into the 12 packs (`tools/i18n_2026_10_19_sk2.py`).
- **Skill costs:** Milling and Fortification are shorthands (trigger × action). The rest have S estimates (`measuredHow: "estimate SK2"`, low confidence).
- **Tests:** `tests/skills-sk2-2026-10-19.js` (260 checks).

## 2026-10-19 (package UX: the tutorial summary, the Forge's copies sheet, count badges and centre stage, the Codex's types and base level)
- **Owner (21:36, UI notes 7, 8a–c, 9, 11).**
- **Tutorial summary (7):** the map panel of T-0 and T-1 now reads like a skirmish's.
  - It shows the rival deck the tutorial really deals (`tutorialDecksFor`, the tutorial editor's deck or the faction default), as card chips. The nodes' own decks are empty and were never used.
  - It shows that deck's BR and the rival bramble's real Health (`tutHp`: 9 / 11, not the map's 28). The hover tooltip lists the same deck.
  - The Field panel is gone ("Mist — There is no day/night cycle." taught nothing).
- **Forge, copies sheet (8a):** picking a card whose copies differ opens a sheet of every copy you own.
  - Copies are grouped by level and treatment, such as "Lv 10 · Plain ×5", strongest first (level, then finish). Plain, Foil steps, Shiny and Alt art are told apart.
  - The tiles sit in a scrolling grid. ⭐ marks the copies your main deck fights with, and 🧩 marks a copy with Forge credit. A tap puts that copy on the anvil, preferring the one with credit.
  - The anvil's two-row chip grid became one line ("Your copies ×8 · On the anvil Lv 2 Plain · 🃏 All copies"). The old selected chip's pale-on-pale text is fixed too.
- **Forge, count badges (8b):** every pool tile shows ×N copies owned. Hovering (title), long-pressing or tapping it gives the breakdown by treatment ("You own 11: Plain ×8, ✨ Hex ×1, …").
- **Forge, centre stage (8c):** tempering, refining, limit breaks, promotions and prestige lift the anvil stage out of the panel.
  - The stage flies to the middle of the screen over a dimmed hearth spotlight and plays the smithing there. Tempering also plays its LEVEL burst there, then the stage flies back.
  - Forging Max Energy (package NF's effect) lifts its Energy panel the same way.
  - Reduced motion and Effects None keep everything in place (`forgeCentreStage`).
- **Codex, base level (9):** card tiles and the card detail opened from the Codex show each card at its starting level (`cardBaseLevel`: Lv 1, or Lv 0 for Base, quest and tutorial cards).
  - A "🌱 Base level / ⭐ My best" toggle at the end of the type row switches to the highest level you own. The detail has a chip that flips it.
  - The choice is kept per device (`bramblewood_codex_level_v1`, try/catch).
- **Codex, card types (11):** a chip row under the toolbar: All, 🐾 Creatures, 🏯 Structures, 📜 Spells, 🛡️ Equipment and 🌿 Brambles.
  - Each chip shows how many cards the other filters leave. An empty type stays at 0, dashed: Spells are shelved, and no Equipment card is obtainable yet.
  - Field cards count as Spells.
  - Brambles are not Codex cards: their chip counts the Brambles page and opens it.
  - On phones the row scrolls sideways.
- **Texts:** 18 TX keys (`ui.ux-*`), in the 12 packs via `tools/i18n_2026_10_19_ux.py`. Rows a pack already had ("Close", "All", "Brambles") are kept.
- **Test:** `tests/ux-2026-10-19.js` covers the base-level default, the storage fallback, the type rules and counts against `canonical/cards.json`, the copy groups and the wiring.
  - With Playwright it also plays all of it at 390×844 (touch) and 1366×768.
  - With `UX_SHOTS=1`, the screenshots go to `docs/screens/ux/`.
## 2026-10-19 (package BF4: the live server's card overrides folded into the file and balanced)
- **Owner (19:34):** "can i check that every card has ran through ur budget limitation? even the mythics and divines need to be balanced first pass this way".
- **What was found:** the live `card_overrides` table held 72 cards saved from the in-game editor between 10-11 and 10-18. The game lays them over `canonical/cards.json`, so on the live site they masked BF3's retune. The four Dragons are Mythic, Divine and Ancient there.
- **Folded into `canonical/cards.json`** (`tools/fold_server_overrides_2026_10_19.js`, from a read-only dump):
  - The server's design choices win: rarity, skills, cost, Wait, name and art.
  - A field the file changed after the server save keeps the file's value and is listed. There are 25 such conflicts: 20 factions from UT's Base cards, Cave Flitter's rarity, Sunspire Choirmother's cost, Cataphract Destrier's flavour, and the effects of the White Dragon and the Cataphract.
  - The editor's copy of a Dragon's resistances inside its skills became one list, the card's own `resist`.
- **Every folded card was run through BF3's retune rules** at its real rarity (budget v5 with L/10 and the map term, inclusive; Legendary 9, Mythic 10, Ancient 11, Divine 12): 14 were within, 51 raised, 6 fitted down, and 1 is an owner call.
  - **Over budget before:** Green Dragon 1.26×, Black Dragon 1.20×, Cave Bat Swarm 1.20×, Red Dragon 1.11×, White Dragon 1.11×, Cataphract Destrier 1.04×, Cave Flitter 1.01×.
  - **Over budget after:** the Cave Bat Swarm only. Its server skills (Darksight, Nocturnal, Fork) would need a cut to 1/1, past the retune's half limit. It is an owner call.
  - **The Dragons:** Green (Mythic) 8/38, Red (Mythic) 9/39, White (Divine) 8/37 with True Strike, Black (Ancient) 8/41.
- **Map 0 and the Tutorial:** the owner's node edits of 10-18 are folded into `CONQUEST_MAPS`.
  - Pond Patrol, Thicket Swarm, Raccoon Heist and Frost Vanguard take the owner's decks, Health and links.
  - The two tutorials get hqHp 28 and tutHp 9 / 11.
  - The server's `bee-knight-classic`, a Classic card removed on 10-13, became `bee-knight`.
- **The road was re-checked, not retuned:** 61 touched fights were re-measured. Main maps on target went from 150 to 146 of 179, and the gaps list from 43 to 47.
- **Proposed, NOT applied:** `supabase/proposed/20261019_clear_folded_overrides.sql`.
  - It resets the 72 card rows to an empty patch, never `deleted = true`, which for a card would remove it from the game.
  - It clears the two node rows, keeping every old row in `deleted_snapshot` and a backup table.
  - The owner must approve it first. Nothing touched the live database.
- **Docs and tests:** the doc is `docs/balance/server-overrides-fold-2026-10-19.md`, and the new test is `tests/server-overrides-fold-2026-10-19.js`. The card-pass, d, thematic, shields and side-maps tests now accept the fold.

## 2026-10-19 (package BF3: L/10, the map term, the full card retune, the honest road)
- **Owner (15:48, 16:22):** "Retune to our L/10 stats. Retune all cards ... Balance our dragons and everything." / "it's fine to be = to budget" / "the cards as seen should be the cards when you get them" / "Thorns is reaallly strong" / "Where honest levers can't reach the target, LEAVE it and list the gap".
- **Budget v5 is now N = (Base + L/10) × (1 + L/30),** with `levelLinDiv` 10 (was 5). Level 0 is Base − 1, and Base includes **0.2 × Map** (`perMap`). The rules are now **inclusive**: 2A+H+S ≤ N and A·H+S ≤ (N/3)². This applies in the helper, the budget panel, the Test Lab, the hub, the queue and the tests.
- **The full card retune at Level 1** (`tools/card_retune_2026_10_19.js`, `docs/balance/card-retune-2026-10-19.md`): of 709 live creatures, 296 are unchanged, 25 were fitted down and 387 were raised to 65% of N.
  - Each changed card carries a creatorNote "2026-10-19 retune (v5 L/10): was A/H".
  - 743 of 744 cards now pass. The Caldera Wyrm is kept as printed.
  - The weak/strong Lv 10 growth ratio is 1.33 / 1.26.
  - Regenerated: the golden card matrix, unit themes and special monsters. The raid tail's elder is now the Orca Warlord.
- **Thorns was re-measured** at 3.23 a point (was 1). The confidence is low, and the value is a floor.
- **Decision B10: the printed card is the obtained card.** Enemy strength comes from levels, decks and fields. The raid's staged decks and elders are flagged, not changed.
- **The road was retuned with honest levers only:**
  - Enemy decks only (`--decks-only`; `--wide` for hard fights).
  - Enemy levels follow the owner's schedule: Maps 1–4 Lv 1, Maps 5–9 Lv 1–2, Map 10 Lv 2, then +0.2 a map.
  - Very Rare is allowed in skirmishes from Map 10 (was 16).
  - No new Shield overrides, no lower Health, no field buffs.
- **Road results:**
  - Main maps 150/179 green and side maps 63/77, on the measure seeds; fresh seeds 131/179.
  - **43 gaps are listed** in `docs/balance/road-gaps-2026-10-19.json` (`tools/road_gaps_2026_10_19.js`): 20 too easy, which would need a future "cheat" field, and 23 too hard.
  - **26 Shield overrides sit above the rule.** On the rule, main greens would drop to 147. They are kept as an owner call.
- **Tests:**
  - The level-curve, side-map, Pale Desert and thematic tests now read the gaps list.
  - Stale pins were updated: the shields test (side maps count a map ahead), road rarity (Map 10) and the win-rate panel (side targets 88.2%).
- **Docs:** `docs/balance/level-curve-2026-10-19c.md` has the BF3 sections.

## 2026-10-19 (package HB: the balance, the monsters and the budget, editable in the hub)
- **Owner (17:44):** "Where is our balance, monsters, and skills file -> can it be put into the artefact for my assessment. Also s.t. i can edit the values".
- **A new hub tab, 🎚️ Budget & stats**, with three views:
  - **Budget:** every budget constant as a number box, from base 20 and the rarity values to the band. The tab shows both files' values, a Reset to file for each, and an N(L) table (Base 14 / 21 / 30 / 40 at Levels 0–11). Any change recomputes every card's Base, N(L1), 2A+H+S and band in the page, and shows the count in band, over and well under, plus the cards that flip.
  - **Cards:** all 740 live cards with Wait, Lumber, Map, Attack / Health (editable in the table), skills with their S, Base, N, both rules and the band. Sort by any column; filter by band, flipped, edited, rarity, map and animal. Tap a card for its breakdown and a note.
  - **Monsters:** the 125 special-monster rows from `canonical/special-monsters.json` (package RJ), with editable Attack / Health and a note. Score, N needed, N at its level, the equivalent card and BR as player recompute; BR as boss is RJ's number.
- Skills keep the 🧮 Skill costs tab (measured S, confidence, Combos), linked from the new tab and from ⚖️ Balance.
- **Edits save in the hub's db:** `budgetEdits`, `cardEdits`, `monsterEdits` (the Skill costs tab's pattern). Without the db, the tab offers Copy JSON.
- **Claude applies them** with `tools/hub/pull_balance_edits.md` and `node tools/hub/apply_balance_edits.js edits.json --dry-run` (then without `--dry-run`). Where each edit goes:
  - budget → skill-costs.json and bramblewood-budget.js DEFAULTS;
  - cards → cards.json, with a creatorNote line;
  - brambles → raids.json castleHp;
  - async bosses → raid-bosses.json hqHp;
  - computed monsters → `docs/balance/monster-overrides.json`, reported.
- Test: `tests/hb-2026-10-19.js` (the tool on a temp copy, and the hub in Chromium with a stub db). Screens: `docs/screens/hb/`.

## 2026-10-19 (package RB2: raid brambles 350, the elders 55)
- **Owner (16:22, 16:28):** "Raids can have special super-high health brambles. Maybe less than 420." / "let it remain at 350HP. Then ... make the raid very slightly harder."
- **The Goliath's arms and tail now have a 350-Health bramble a fight** (was 420). The Core keeps its 200. With the Map 13 deck, a normal raider still ends 96% of fights with the bramble standing, at 168 damage a fight. Wins go 0.3% → 4.0% for that deck and 19% / 31% → 30% / 40% for good / strong decks.
- **A touch harder to make up for it:** the elders start at up to 55 Health (was 50). Map 13's raid damage a fight is now 230, between 420's 214 and plain 350's 254. Completion with 30 players is 95% of weeks (90% at 420, 96.5% at plain 350), and 100% from 40.
- Saved raid edits still at RB's 420 / 50 take the new numbers (scale 3), and the editor's new part starts on 350. The boss already plays 3 cards a turn (front row, then middle and back, rowCap 2): checked, unchanged.
- `tools/raid_completion_model.js measure` takes `--castle`, `--core-castle`, `--elders` and `--stage-atk`. The fights were re-measured on today's cards. See the RB2 section of `docs/balance/raid-balance-2026-10-19.md`. Test: `tests/raid-rb2-2026-10-19.js`.

## 2026-10-19 (package BF2: Base's map term)
- **Owner (15:25): "note that there is a Map * 0.2 number there."** Base is now `+ 0.2 × Map`, where Map is the map at which the card becomes obtainable (`cardObtainMap`):
  - map rewards: that map;
  - pack cards: 5;
  - Mystery Booster and raid cards: 13;
  - Nest eggs: 3;
  - Blacksmith equipment: 11;
  - Base, tutorial, quest and Easter-egg cards: 0.

  The shared constant is `perMap`, the tools read `canonical/card-obtain-maps.json`, and the budget panel's Base line shows "Map 12 × 0.2 = 2.4".
- **At Level 1:** 708 → 718 cards pass, with 10 moving in and none out (Great Horned Owl, Gorge Wyrm, Cave Warlord, Venomlord Serpent, Sand Widow, Permafrost Mammoth, Barnacle Fortress, Ember Revenant, Sea Cucumber, Giant Cave Huntsman). The post-balance queue drops from 30 to 20 cards. No card's stats changed.
- **Limit break comes in waves** (decision B9, design only): `docs/balance/limit-break-waves.md`.

## 2026-10-19 (package RJ: special monsters against the budget, and their BR)
- **Owner (15:48):** "Justify special monster stats like Raid monster stats. What would that card's BR be then?" This is an analysis only: no stats changed.
- **`docs/balance/special-monsters-2026-10-19.md`** has one table per group: the Goliath's brambles, the elders (boss units) through the raid's life, the boss's row-deck copies, its Commons, the Core's stumps, the async raid bosses, the conquest bosses' signature units, and the Tower and dungeon specials. Each row gives the stats the fight really builds, the skills, the score (2A+H+S and A·H+S), the N needed, the equivalent player card ("a Level 4 Epic with Wait 2, Lumber 3", or "exceeds any player budget by Y×"), the BR as a player card and as the boss, and a one-line justification.
- **`tools/special_monsters.js`** regenerates the doc and `canonical/special-monsters.json`. It reads the game's own fight builds (`buildRaidFullFight` at 100% / 50% / 5% of each part, `levelledEnemyDeck`, `towerFloorDeck`) and N from `bramblewood-budget.js` with the table's numbers (v5). It also previews v6: (Base + L/10)(1 + L/30), with 0.2 × Map added to Base until the helper has the Map term.
- **Findings:**
  - A fresh Kraken Brute (3/50) is 1.1× an Epic's N, the size of a Level 4 Epic (BR 21). The raid's BR counts each one at 37.
  - The row copies at 20% / 15% all fit a Level 1 Common, yet they count at their printed rarity: a Broodmother copy at 5/4 adds 21.
  - The brambles (420 a fight) are the over-budget part, which is fine because they share 200,000 raid Health among 250 raiders.
  - **Flagged:** the Caldera Wyrm, 1.82× its N as printed. It has no source. Two options are proposed, neither applied: trim its Health onto the fight's bramble, or list it as non-player.
  - 13 player cards are over their own budget as printed. They are listed for the card pass.
  - `canonical/unit-themes.json`'s elder bodies are stale (⚔10 ❤93 against the built 3/50).
- **Hub, not published:** the Units tab's 👹 Non-player view has columns for score vs N, the equivalent card and BR as player / as boss, plus a table of the other special monsters (`SM_DATA`, inlined by `build_hub.py`).

## 2026-10-19 (package SY2: deck leaders sync)
- **The leader and castle now travel with their deck** (owner 15:48: *"the leader: It's not synced across decks across devices. So I can see my laptop's deck, but it's a different leader."*).
  - **Cause:** each deck already held its leader and castle, and they already went to the cloud (`player_decks.leader_id` / `character_id`). But opening a deck (`switchActiveDeck`) saved its cards first. That save copied the leader and castle still loaded, which were the previous deck's, into the deck it was opening. Then it read them back. The save counted as a fresh edit, so the next push sent the wrong leader to the cloud as the newest version, and the laptop pulled it back. SY's test stubbed `switchActiveDeck`, so it never ran this path.
  - **Fix:** opening a deck sets its cards, looks, castle and leader first, then writes them to this device's keys and leaves the deck unchanged. A leader pick saves to the deck with a new `updatedAt` and is pushed. In the open builder it waits for Save, as before. On a pull, the deck's leader comes with it. When the active deck changes, the leader it plays with changes too. A deck with no leader yet leads with the Wandering Traveller, as it already did after a reload.
  - **Once per device:** its current leader and castle are attached to its active deck and uploaded on the next sync (`deckAttachDeviceLeaderOnce`). From then on the active deck sets the leader at load, not the separate `bramblewood_arena_leader` key.
  - **Card looks (Shiny / alt-art copies) sync without a migration.** With no `looks` column on the server, they ride inside the counts JSON (`counts.__deck.looks`) and are taken out on pull. The deck name already synced. Decks have no per-deck cover, sleeve or card back to sync (card backs are per card kind).
- No migration needed. `tests/deck-sync-2026-10-19.js` has 141 checks, 30 of them new: two devices, the leader set on A and seen on B, merging by timestamp, the attach-once step and looks in counts.

## 2026-10-19 (package BF2: budget v5, a softer Forge curve, the budget panel with Base)
- **Owner (13:52):** "That's too much. ... (Base + L/3) * (1 + L/30) ... Level 0 gives an additional minus 1." **Budget v5:** N = (Base + L/5) × (1 + L/30) from Level 1, and Base − 1 at Level 0, in `bramblewood-budget.js` and `canonical/skill-costs.json`. The owner's example with L/3 checks out: Base 14 gives 14.8 at Lv 1 and 23.1 at Lv 10.
  - **L/5, not L/3** (13:54: "change it to L/4 or L/5" if L/3 favours weak cards). Weak cards' Lv 10 stat growth is 1.82× / 1.74× / 1.65× the strong cards' with L/3 / L/4 / L/5. None meets 1.3×, so the closest, L/5, is used. Most of the gap comes from the absolute conversion. `levelLinDiv` is one constant.
  - **The squared Wait and Lumber terms stay** (14:25). Cards with Wait 3+ or Lumber 3+ use more of their budget yet win 18–26 points under their band, so 0.5×Wait² and 0.4×Lumber² don't over-reward them. No change.
  - **At Level 1:** v3 passes 709 cards, v4 710 and v5 708. Against v3, the Dragon-Turtle moves in, and Sand Widow and Barnacle Fortress move out. Against v4, Sand Widow and Bone Diviner move out. The post-balance queue has 30 cards. No card's stats changed.
- **The Forge curve on v5:** majors 4 / 7 / 10, minor 2 and limit break 11, as before, on v5's smaller gain. The mean card is +6% at Lv 2, +27% at Lv 4 and +96% at Lv 10 (v4: +19% / +65% / +228%). The enemy's pace (`enemyLevelKeepingPace`) follows automatically.
- **The budget panel** in the card editor, the Test Lab and the hub's Skill costs tab:
  - The heading is "⚖️ Within budget · N = 39.4 (Base = 37.9)".
  - The rules read "Stats: … = 34.5 < N = 39.4 ✓" and "Product: … < (N/3)² = 172.2 ✓".
  - Base is shown in its parts ("Base = 20 + Heroic 7 + Wait 6.5 + Lumber 4.4"), the ×1.5 half-miss is explained, and the formula comes from the helper.
  - Every line is a TX key in the 12 packs. The Test Lab's saved numbers start fresh for v5.
- **Follow-up to BF:** the skill-costs browser check loads `bramblewood-budget.js` first (the LADDER crash). card-pass re-measures are within 3 points, after BU's centre-column engine rule. Stale RB rows were taken out of `lang/ui`, and "Deal 4,000 Raid damage" was added.
- **Road retune on v5 and BU's engine:** 38 fights tuned (25 main, 13 side), mostly 1–2 copy moves; 178 of 179 main and 76 of 77 side fights green at 120 games (fresh seeds 151 of 179); 16-6 and 20-A-4 as before. `docs/balance/level-curve-2026-10-19c.md`.

## 2026-10-19 (package U3: the owner's UI notes, 13:41–13:45)
- **🌰 Home is an icon in the top-right cluster** (owner: *"the home button shouldnt be on the btm bar but as an icon beside the fullscreen button and arena button"*). It is the cluster's first icon, before 🏟️, ⚙️ and Energy, and the same size. It shows on Conquest, Arena, Raid and Dungeons, on phones and desktop. NV's Home in the bottom tab bar is gone. The full-screen map's Home is an acorn too. NV's iOS Safari fix stays: only the tab strip scrolls, never the row that holds the cluster.
- **The map strip is back on phones, with no empty margin above it** (owner: *"the map tab on the top is okay. Just that there was a empty margin above for no reason ... can be just number + emoji"*).
  - It shares the cluster's line at the top and stops short of the buttons (`u3FitMapStrip`). On a phone too narrow for that (360 px with the Admin buttons), it takes its own line under them.
  - On phones each chip shows only the map's number and emoji, plus a small ✓ once cleared. The name and progress are in its title and aria-label ("Map 1: Thistlewood (cleared)"). Touch and hold (450 ms) shows them; the hold doesn't change the map.
  - Desktop keeps its side list of full chips (a number-only chip would only add a column there).
  - The world toast reads "every map you can reach is along the top" on phones again ("on the left" on desktop).
- **The raid's bramble is Kraken's Reef, and the Tentacle Smack is its ability** (owner: *"The tentacle smack should be a property of the Raid's bramble. Which should be appropriately named and art'd."*).
  - The boss side's bramble in a Goliath raid fight is named "Kraken's Reef" (`RAID_BRAMBLES`, `raidBrambleOf`). A published raid can name its own with `def.bramble`.
  - Its portrait is a crisp placeholder pixel SVG (`art/raids/krakens-reef.svg`, from `tools/make_raid_bramble_art.py`): a coral reef fortress with a maw-like gate and two tentacles curled around it. The NightCafe prompt for a painted one is in `docs/art/raid-bramble-art-brief.md`; nothing was generated.
  - Its info panel (hover or hold), the VS screen's boss card and the raid's rules list its attacks: "Tentacle Smack: every 3 turns a tentacle lashes out of the reef at one of your columns or rows (a column first, then a row), 6 damage to each unit there ..." and the Tail's Tail Sweep.
  - The tentacle now reaches out of the bramble's tile. A column smack grows from the tile to the struck column, slams, and draws back into it. A row smack comes in from the board's edge on the bramble's side. The tile flares as it strikes.
  - Mechanics and balance are unchanged: the same attacks, rolls and damage, and the same Health with no effects on the castle.
- **The raid rows are about 3% closer, and the cards are bigger.** Each row's spacing is 3 px less. The bottom row's cards meet the board's edge (the HP ribbon), and any height left over goes above the board. Board cards are now 68×86 at 390 px (was 67×84), 77×96 at 430 px (was 75×94) and 64×80 at 1366 px (was 61×77). The hand follows the board's size, as MB2 set it: 69, 77 and 74 px wide. Facing lines and number floats stay on their cards, and the page doesn't scroll.
- **The turn meter is faded out and only ticks on your turn** (owner: *"It only fades in to tick on your turn, then it fades out. It shouldn't say 2/20, but just Turn 2."*).
  - The raid's pill reads "Turn 2" and rests at opacity 0, taking no clicks.
  - At the start of your turn (and for Turn 1 as the fight opens), a copy fades in over it. The old turn rolls up and out, the new one pops in, it holds 1.2 s, then fades out (`u3TurnFlash`). Under reduced motion it is a plain fade.
  - Owner call: in the last 3 turns a second line under it reads "3 turns left", "2 turns left", then "Last turn!". The last-turn banner still plays.
- **Castle damage numbers pop where the HP bar's fill ends again, in every mode** (owner 13:45: *"It comes out at where the health bar% is currently at. We could do that for all games."*). This partly reverses BU.
  - The position is read from the bar's on-screen rect and its fill % (`hqFillEndX`), so MB2's camera can't skew it.
  - At very low or full Health the number is pulled in so it stays fully on screen (`u3ClampOnBar`).
- 14 TX keys, translated in the 12 packs (`tools/i18n_2026_10_19_u3.py`).
- **Tests:**
  - New: `tests/u3-2026-10-19.js` (in run-all) and `tests/e2e/u3_2026_10_19.py` (390, 430 and 1366; not in run-all).
  - Updated: `tests/nv-2026-10-19.js` and `tests/mobile-nav-2026-10-19.js` follow the Home and the strip; `tests/bu-2026-10-19.js` and `tests/e2e/battle_ui_2026_10_19.py` follow the fill-end numbers and the bramble's tentacle.
  - Screenshots are in `docs/screens/u3/`.
## 2026-10-19 (package DC: duo-skill combos and the coverage gaps)
- **Owner (08:10): "Have you tested & costed all skills yet? We can do a sample testing with duo-skill combos, 1,000–2,000 times."** Nothing in the game changed: `value` and every card's S stay as they were.
- **905 skill pairs measured** with `node tools/skill_combo.js` (on SW's lab, the live engine). They are every pair among the 40 skills live cards print most (42 with the ties at the cutoff), every pair live cards print together, and the owner's examples. Each pair is put on one unit (b2, 4/14 Wait 2) and compared with its two singles, on the same seeds. That took 1.24M games: about 880 for the pair's own run (median) plus about 920 for each single, so ~2,700 games behind each interaction. A replicate run on other seeds puts the noise at ±0.5 for one S and ±0.7 for one interaction.
  - **189 interactions are flagged** at medium or high confidence: 139 synergies and 50 anti-synergies.
  - **Biggest synergies:** Freeze + Rage (+28.9), Evasive + On Ready: Gold (+14.6), Evasive + Freeze, Supreme + On Ready: Gold, Flying + On Ready: Gold. Freeze stacks with anything that hits hard or often.
  - **Biggest anti-synergies:** Backstab + Fork (−5.9), Guardian + Rage, Guardian + Fork, Darksight + Keen Sense, Armor + Freeze.
  - **The owner's examples:** Poison + Proliferate +4.9, Flying + Arrow +4.0. Taunt + Thorns reads as additive within noise, and Guardian + Thorns as −1.7.
- **Interaction model** for the budget. A card with skills A and B costs m(family A, family B) × (S(A) + S(B)), with 92 family-pair multipliers. Examples: dot × dot 1.55, control × offense 1.29, dot × evade 1.35, economy × evade 1.84, control × control 0.72. A per-pair adjustment table (273 pairs, shrunk by their noise) covers the measured pairs. One global multiplier is 1.11. Prediction error (RMSE) is 2.26 additive, 1.75 with the family multipliers and 0.64 with the table (in-sample).
- **Coverage:**
  - **The 9 triggers that never fired on plain decks now have scenario decks** (an enabler on the test unit and on its control deck). The weights below are as measured, against today's values in brackets: On Ally Spawn 1.38 (1), On Enemy Spawn 2.26 (0.5), On Move 1.7 (0.5), On Heal 2.73 (2), On Exile 1.14 (0.25), On Charge 1.62 at N 2 (1; 3.05 at N 1, 1.11 at N 3), On Sacrifice 0.29 (0.5). On Discard (0.96) and On Chain Break (0.27) are low confidence.
  - **Crepuscular** is now measured in a fixed twilight: 3.72.
  - **Exile, Mind Control, Tsunami, Acid Bolt, Meteor, Gain and Bounty** are measured as damage-equivalents in a mixed deck (5 copies among 20 vanilla). These are low confidence (a bridge shows the scale is 0.15–2.6× SW's). Exile, Mind Control and Tsunami stay bounds: more than a sure kill a play.
  - Still open: Prayer, Leader, Weakness, Hunter's status parameter, On Any Played (no engine hook), cross-field pairs.
- These are written as measured fields (`measuredS`, `measuredConf`, `measuredSE`, `measuredHow`) in `canonical/skill-costs.json`.
- **Outputs:** `docs/skill-combos-2026-10-19.md`, `.xlsx` and `docs/balance/skill-combos-2026-10-19.json`, plus the checkpoints in `docs/balance/skill-combos-*`.
- **The hub's 🧮 Skill costs tab has a Combos view** with the top 40 synergies and anti-synergies and the family multipliers. New test `tests/skill-combos-2026-10-19.js` (in run-all).

## 2026-10-19 (package CX: the Codex books, the Pale Desert's sand; owner notes 14:07)
- **Short section names in the Bestiary.** Every section is a plain name now: Factions, Base, First to Fourth season, Maps 21–40, Packs, Mystery Booster, Raid, Events, Other, Easter eggs, Blacksmith. The detail they carried ("in every basic pack", the pack names, the map range, "not obtainable yet") is the section's tooltip. All are TX keys (`ui.cx-sec-*`) in all 12 packs. The admin views got short names too (a skirmish is "18-A-1 Bleached Flats", its full label in the tooltip).
- **16 cards a page.** The album's pages are 4 × 4: two pages side by side on a wide screen (32 a spread), one on a phone with smaller cards (about 64 px wide at 390 px).
- **The page turns are on the book.** The bar under the album and the Skills book is gone. ‹ with « under it are tabs on the left edge of the book, › with » on the right edge; they stay in reach while you scroll a tall page. On a phone they sit in the page's top corners. « opens the first page (the book's contents), » the last. The page count and "Go to section" moved above the book. Home / End also go to the first / last page; ← / → and a swipe still turn.
- **Swiping the Skills book on a phone works.** A swipe that started on a book page was taken by the page's own scroll area (pointercancel), so it never turned; the page now leaves sideways gestures to the book.
- **The Pale Desert's sand comes in gusts.** The map used the open plains' soundscape: a noise bed with a 4.6 kHz shimmer that never stopped, which over the white sand sounded like hissing sand all the time. Its own sand hiss played only on the map view, and its fights had no sand. Now there is a quiet low breath of hot air, and gusts of sand: 2–4 s each, fading in and out, after 8–20 s of quiet, with varied loudness, pitch and side. They keep coming on the map and in its fights, stop when you leave, and follow the SFX volume and mute. There are no night crickets there.
- Tests: `tests/sand-gusts-2026-10-19.js` (the gust timing, an hour of gusts, mute, leaving, the wiring), `tests/codex-book-2026-10-19.js` (4 × 4, the short names and tooltips, the edge tabs, first / last, keys, all 12 packs) and `tests/e2e/codex_cx_2026_10_19.py` (390 × 844 touch phone and 1366 × 768: 16 a page, short names, « » ‹ ›, swipes). Screens: `docs/screens/cx/`.

## 2026-10-19 (package TS: Thorns in the raid's rows, status chips on the top edge; owner 13:35 / 13:37)
- **Raids: the middle and back rows fight for real, Thorns included.** Root cause: a middle- or back-row unit's strike (engine `reserveStrike`) was `damageCard` alone, so none of a swing's hooks ran: no Thorns back at it, no Spiteful, Counterattack, Ichor or On Attacked from the unit it hit, no Poison / Bleed / Freeze / Sap / Expose on that unit, no Crit or On Attack, and no kill credit. It is now the unit's own swing in the round's main order (`rowSwing` in `resolveCombat`), at the closest row's unit in its column (else the bramble), for half its swing rounded up, as before. Reactions checked both ways (it strikes / it is struck), both sides, every row pair: Thorns, Spiteful, Counterattack (it answers the closest enemy in its column, any row), Poison, Bleed, Freeze, Sap, Armor, Evasive, Guardian (a neighbour in the struck unit's own row), Cleave (the neighbours in the struck unit's own row, also for a front-row swing into a middle / back unit).
- **The kill from (or in) a back row counts.** The killer lookups (`noteKiller`, `killerCreditOf`, On Kill, Crown of Thorns, On Death's who:'killer') only searched the front row. In a raid a middle- or back-row unit now dies a full death: Bounty, its On Death, On Ally Die / Berserk, Amore, Carrion, the graveyard. What would take its slot (Revive, On Death: Spawn, Relic, Crystallise, Meiosis) still doesn't happen in those rows.
- **The rows' upkeep.** A Frozen or Asleep middle / back-row unit stayed that way for good, and Poison there never ticked. Their statuses (Poison, Bleed, Toxin, Freeze, Sleep, Stun, Reload, Shell...) now tick and wear off like the front row's. Their Wait still counts down on their own action.
- **A raid stage's extra volley** (`reserveVolley`) runs the same swing, one unit at a time.
- **Status chips sit on the card's top edge, at every size.** Owner: "In small mode, the status icon is wrongly sized and not fitting the contents! When in mini mode, should poison and status symbols be on the top boundary instead?" Yes. A board card's live statuses are now small round chips (icon and number) straddling the top edge, the way the skill strip straddles the bottom. They used to be tinted pills over the art, which covered the art and the Health on small cards. The strip starts at the top-left corner and stops short of the Wait clock. Chip size follows the card. A small card (raid rows, a crowded phone row) holds 2 chips, a phone or desktop card 3, a big one 4. Past that, the last chip is "+N". A frozen card's ice frame leaves the strip clear. The status icons over the art (💤, ⚡, 👁...) now scale with the card too. This applies at every size, normal cards included: the same strip read better everywhere.
- Tests: `tests/raid-thorns-rows-2026-10-19.js` (290 checks; 173 fail on the old engine), `tests/ts-status-chips-2026-10-19.js` (Playwright, 390×844 raid + fight, 1366×768). Before / after shots are in `docs/screens/ts/`.

## 2026-10-19 (package BU: battle UI fixes from the owner's iPhone, 12:23)
- **You can always play in the centre column.** Root cause: the engine's `legalSlots` only offered a slot beside one of your live units, so a row thinned or pushed to one side (units at 2..4) could not play the empty centre. The centre (slot 0) is now legal whenever it is empty; every other slot still needs a neighbour. The CPU follows the same rule, so it fills an empty centre first too (`tests/golden/card-matrix.json` re-accepted: 22 open-mode matches changed, all from this rule).
- **The centre column is always on screen, in the middle when it's cheap.** MB2b's phone window framed only the units' span plus one (units at 2..4 framed 1..5, so the centre was off the frame). The window now always holds column 0, and it is centred on column 0 whenever that costs at most one more column (`MB2_CENTRE_SLACK`, -4..3 becomes -4..4). A row far off to one side keeps its tighter, off-centre window, so the cards stay bigger.
- **Castle damage numbers sit in the middle of the HP bar they hit.** They used to pop where the bar's fill ends, at the far right of a healthy bar on a phone. They now use the bar's on-screen rect (`getBoundingClientRect`), so the board's camera can't skew them, and they don't drift sideways.
- **Cleave is a crisp crescent on the target's row.**
  - In the owner's screenshot the arc started at our row's empty left slot and ended on an enemy card. One side point had been read from an element in the other row, which drew a huge loop from the bottom-left corner. Side points now come only from the target's own row.
  - The old stroke was 16 px wide, blurred, and bowed at least 34 px off the row. It is now a filled, tapered blade sized to the card, with a short trail behind its tip.
  - The Effects Lab has a new variant F, "a stray point in the other row".
- **Fast forward: 3× opens at Map 20, 4× at Map 40, 5× at Map 60.** These were Maps 2, 15 and 30. A locked speed is skipped in the cycle, and the button's tooltip lists the locks ("3×: Clear Map 20", TX `ui.speed-locked`, in all 12 packs) for maps that exist on the road. Admin Mode has every speed.
- **The raid's Tentacle Smack, redrawn.** Owner: "I still can't see the tentacle strike".
  - It is one drawn tentacle (inline SVG, no art file): a tapered violet limb with a pale rim and halo, so it reads on the Abyss's dark ground. It has a pink underside with suckers and a coiled tip, about one card wide.
  - It slams down onto the column in 220 ms (a row smack lies across the row), squashes, shakes the struck cards and puffs smoke. Then it pulls back up and out while fading, in 350 ms.
  - It is never clipped by the board frame. It shows from Low effects up, and with reduced motion it is a plain flash.
  - It is in the Effects Lab (the row smack now has an inventory entry).
- Tests: `tests/bu-2026-10-19.js` (speed gates, the centre rule, the framing window, static checks) and `tests/e2e/battle_ui_2026_10_19.py` (430 and 390 phones and 1366 desktop: the centre target, centred castle numbers, the Cleave box over the target, the speed cycle, tentacle frames). Before and after pictures are in `docs/screens/bu/`.
## 2026-10-19 (package BF: budget v4, the budget Forge curve, side maps a map ahead)
- **Owner (09:52):** "(Base-1 + L) * (1+L/20)", "majors to 4, 7, 10, minor to 2 ... divvy out strength updates at all levels", "No Forge is fine. The player has to deck build to win.", "Submap's difficulty floor varies. But at least 1 map ahead of difficulty."
- **Budget v4.** N = (Base − 1 + L) × (1 + L/20), where Base is v3's N without its 2L.
  - It lives in one shared file, `bramblewood-budget.js`. The page inlines it (Test Lab, card editor, Forge), `tools/skill_costs.js` reads it (so every balance tool does), and the hub inlines it.
  - At Level 1 it is 1.05 × Base, against v3's Base + 2: −0.95 at Base 21, the same at 40, +6.65 for the Dragons.
  - Of 744 measured cards, 2 move into budget (Bone Diviner, the Dragon-Turtle) and 1 moves out (Barnacle Fortress). The post-balance queue is 28 cards (was 29). No card's stats changed.
  - The report is in `docs/balance/budget-v4-2026-10-19.json`.
- **The Forge curve follows N(L).** Each level banks its budget gain in 2A+H points:
  - the majors (4, 7, 10) and the limit break spend all of it, always at least 1;
  - the minor (2) spends its smaller bank;
  - every other level spends a third, often 0.

  Attack grows where that keeps the card's shape, the rest goes to Health, and walls only grow Health. No level loses a stat, and every level stays inside N(L).
  - This is much stronger than the old +10% steps. The mean card gains +65% at Lv 4 and +228% at Lv 10 (was +10% / +35%).
  - The anvil shows it: **📈 What each level gives** (TX keys, 12 packs).
  - Test: `tests/forge-curve-2026-10-19.js`.
- **The Forge stays at Map 11** (decision B7). Before Map 11 the reference player is at Lv 0.
- **The enemy keeps pace.** The road's enemy level (`enemyLevelKeepingPace`) keeps the strength ratio each fight had to your reference deck under the old steps, deck by deck, so the late maps aren't handed to the player.
- **Side maps count at least a map past their parent** (`fightMapNumber`) for the enemy's level and the Shield, while your deck stays the parent's. Their road-curve targets sit one map's step lower: 88% → 55%, boss 26–44%. Test: `tests/side-maps-2026-10-19.js`.
- **Retune, measured at 120 games on the measure seeds:**
  - Before: 179 of 179 main-map fights and 76 of 77 side fights green. With the new curve and no retune: 144 main.
  - Three rounds of `skirmish_pass.js curve` changed 54 fights, mostly with 1–2 copy moves. After: 178 of 179 main fights and 76 of 77 side fights green; on fresh seeds, 154 of 179 main.
  - 16-6 Reaver's Hollow stays easy at its 2× Shield cap. 20-A-4 (the four-wave dungeon) was not retuned.
  - The tables are in `docs/balance/level-curve-2026-10-19b.md`.

## 2026-10-19 (package RB: raid balance: no ×15, a win 1,000, 200k ×3 + 500k, the boss weakens, allies keep their rows, 250 an instance)
- **Allies keep their rows.** An ally's play always went into its own row, but the unit then stepped up into your front row, or the back ally's into the middle row, whenever the slot ahead was clear. Ally units and ally leaders now hold their row for the whole fight (`holdRow`; the engine's `advanceReserves` skips them). New test `tests/raid-ally-rows-2026-10-19.js`: 200+ seeded ally plays in the page's raid fight, none outside the ally's row.
- **Raid damage = bramble damage × the rank** (B 1.01 … SSS 2.0), with no ×15 (the Core's ×140 is gone too). The bramble damage is capped at 1,000 per fight. **A win counts 1,000 × the rank** (was 10,000).
- **Health:** 200,000 for each arm and the tail (4 × 50,000) and 500,000 for the Core (5 × 100,000), 1,100,000 in all.
- **The elders** start at 50 Health at most: basic + (50 − basic) × the raid's share (was 100).
- **The boss weakens as it falls.** All its cards scale to `RaidM.bossWeakening`: 100% fresh, 80% at half, 60% at the end. The share is the part's or, when lower, the raid's. The weakening applies after the stage's +Attack. Its floor is `tuning.weakenFloor`, editable as "Boss weakest %".
- **Completion model** (`tools/raid_completion_model.js`, `docs/balance/raid-balance-2026-10-19.md`):
  - A normal deck at the Raid Banner's map deals about 217 bramble damage a fight on the arms and the tail, and 97 to 170 on the Core.
  - With stand-ins at 14% a day (was 12%) and the Core's stumps at 14 Health (was 20), the raid falls in 100% of weeks with 30+ participants and 83% with 20.
- **Instances of 250** (was 100). The server default is a proposal, not applied: `supabase/proposed/20261019_raid_cap_250.sql`. Republishing the raid from the editor does the same.
- **Tiers rescaled** so the same share of raiders reaches each: Participant 1,000 → 500, Competent 10,000 → 2,000, Leading 50,000 → 12,500.
  - Weekly quest: 20,000 → 4,000 raid damage. Medals: /5.
  - Pay for each fight: ×5.25 per raid damage, so a fight pays what it did.
- **Saved edits:** a raid edit saved on the old scale, local or published, is brought onto the new one on load (`RaidM.migrateRaidScale`). The editor stamps `scaleV: 2`, and its defaults follow the new scale.
- **Raid numbers** (Health left, damage, tiers, the claim screen) use thousands separators in the game's language (`raidLocale` / `raidNum`).
- **No damage formula for players:** NV's breakdown line ("28 bramble damage × 15 × 1.01 = 424") shows to admins only. The raid tab's "scores up to 5,000" line now reads "the damage your side deals to the part's bramble counts as raid damage". The rules add "the boss weakens", and "a win counts 1,000, more at a higher rank".
- **The raid's rows from the server** are read a page of 1,000 at a time (up to 20,000), for your instance only. A life now takes thousands of rows, and one request returned at most 1,000.
- New test `tests/raid-rb-2026-10-19.js`. 4 TX keys (new or changed), translated in the 12 packs.

## 2026-10-19 (package MB2b: the field as big as the hand, the raid framed to its columns in use)
- **The field is bigger, not the hand smaller** (follow-up to MB2: the field's cards were about 48 px against the hand's 75).
  - The camera frames the columns in use, plus one empty column on each side. That is at least 3 columns in a normal fight and 5 in a raid. Every unit counts, on both sides and in every row.
  - The cards are sized for that window (`mb2SpanWindow`, `mb2FitPhoneBoard`, `mb2FitRaidCards`). The empty columns outside it sit off the frame.
  - On a phone, a normal fight's cards are the hand's size (75 px) for as long as the window fits at that size. Past that they shrink to fit the window, never below.
- **Re-framing, a deliberate exception to the raid's 2026-10-18 note "the raid shouldn't keep zooming in and out when I place a card":**
  - The camera re-frames only when the column span changes: a unit lands on the window's edge column or past it.
  - It happens once, in one 300 ms step (`mb2FlipReframe`), never every turn or continuously.
  - The window only widens during a fight. A re-frame also happens when the window or the frame changes size.
- **The raid uses the screen's height too.** The spare height is shared out between the six rows. The enemy's row (castle, deck, Environment cards) is a quarter smaller (`--mb2-th`). So are your castle, deck and Graveyard on a phone; on a computer they share the hand's row, so they stay the hand's size.
- **The raid hand** is at least the field's card size and never smaller than it was before MB2 (65 px wide on a phone, 92 px tall on a computer).
  - The "thin sliver" in an MB2 screenshot was a card caught mid-deal by the screenshot (the deal-in transform). It was not an overlap bug.
- **Raid fight controls on a phone** sit in a 4-wide grid of two short lines inside the top row. They no longer take a line of their own.
- **The Codex** no longer opens on the Easter eggs' masked "???" slots when no card has been seen yet. The masked slots join once a real card is seen, and they stay last.
- **Card widths now:**

  | Screen | Normal fight | Raid, 5 columns | Raid, 6 columns | Raid, 7 columns | Raid hand |
  |---|---|---|---|---|---|
  | 390×844 | 75 px (up to 4 framed columns), 69 (5), 57 (6) | 67 px | 58 px | about 49 px (MB2 was 49, before MB2 44) | 67 px |
  | 430×932 | 75 px | 75 px | | | 75 px |
  | 1366×768 | 97 px (unchanged) | | | 61 px (height-bound) | 74 px |

- `tests/e2e/mobile_layout_2026_10_19.py` (about 1.5 min, not in run-all) adds checks for the board cards against the hand and the framed columns, the raid hand's size, the top row being one line, the re-frame when a unit lands on the edge column, and a fresh Codex. Screenshots, including the new `after-raid-reframed-390.png` and `after-*-430.png`: `docs/screens/mb2/`.

## 2026-10-19 (NV: Home on the map and the Arena, the pre-battle screen, the raid's rank emblem, the raid results)
- **Owner (10:55, iPhone):** *"There should be a home button somewhere on mobile. The top bar of the conquest screen is not used - remove this."* / *"Improve the pre-battle A v B screen ... I want to know how i contribute, then our total BR."* / *"Raid complete: Still use our victory emblems ... abit more special looking."*
- **🌰 Home** at the left end of the floating tab bar (Conquest, Arena, Raid, Dungeons), on phones and desktop; the top-right 🏠 steps aside. Why it was missing on the iPhone: the 🏠 / ⚙️ / Energy cluster is a fixed child of the tab bar, and the bar itself scrolled sideways; iOS Safari clips a fixed child of a scrolling box. The tab strip now scrolls inside the bar.
- **No map strip on phones.** Maps change on the 🧭 World atlas (the button on the map) and at the map's edges; desktop keeps its side list.
- **Pre-battle screen v2** (`showVsScreen`): a card a side and a real Start button under the art (a tap anywhere still starts). A raid shows your part first (your BR, your row), then **your side**: you + each ally (leaders 2x) = the side's total, against the boss's framed portrait, name and BR. Names and rows wrap instead of being cut off. Normal fights: you vs them, both BRs.
- **Raid rank emblem** (`raidRankEmblemHTML`): the victory screens' hexagon in an abyssal ring with crimson tentacle curls and a glow, stamped in (S / SS / SSS harder, with a shockwave; still under reduced motion). On the raid results for every rank (a crest for a win) and on the raid claim screen.
- **The turn-1 "Rank SSS, Overwhelm! 10,000" with 0 dealt** was the Admin 👑 Win button: it empties the boss's bramble, and the raid scored that as a real overwhelm (10,000 raid damage, saved, pushed to the shared raid, paid). A raid no longer scores an admin win (the results say so). **Play again** after a raid built a plain Quick Battle (`startMatch('raidOffline')`); it now builds a fresh fight on the same raid part.
- **Raid results say what each number counts**: "424 raid damage" + "28 bramble damage × 15 × 1.01 for Rank B = 424 raid damage"; "Full reward from 40 bramble damage (this fight: 28)"; the stats row adds "🏰 28 to the bramble". "Dealt / taken / best hit" no longer lose hits to the 200-line log (a running tally).
- Tests: `tests/nv-2026-10-19.js`; `tests/mobile-nav-2026-10-19.js` and `tests/raid-rv2-2026-10-19.js` know the new Home and emblem. Screens: `docs/screens/nv/`.

## 2026-10-19 (package MB2: the battle fills a phone screen, bigger raid board, hand = field size, touch-and-hold)
- **Owner (10:55, iPhone):** *"The raid battle btw is too small! we can afford to use all the vertical and horizontal space"*, *"the battle arena should be centered"*, *"our cards in hand/deck/etc. should be as large as the cards in the field"*, *"i can't touch and hold to see the card detail"*.
- **A fight on a phone is one screen tall.** The match is a `100svh` column: the height with Safari's bars showing, plus the safe-area insets. The hand no longer ends up behind the toolbar. The battlefield takes the height that the rows above and below leave, and the board sits in its middle.
- **The raid board fills its frame, on a phone and on a computer.** Its cards are sized from the frame (`mb2FitRaidCards`): seven columns across, six rows down, the same gap in every row so the columns line up, and the spare height shared between the rows. These are real CSS sizes, not a zoom, so the attack lines, floats and FX follow. The page no longer scrolls in a raid (it did by about 400 px on a computer).
  - 390×844: cards 44 → 49 px wide (a 430 px iPhone gets about 55). 1366×768: 48 px on screen (with the page scrolled) → 60 px, the whole board visible.
  - The raid keeps its fixed camera. It is framed again only when the window or the frame's size changes.
- **Hand, deck, castle and Graveyard are the board's card size on a phone:** 75×93 (was 65×81 against the field's 75×93), or 62×78 on a short phone. In a raid they follow the raid's card size, never under 65 px tall on a phone or 92 px on a computer. A crowded hand overlaps to fit, and still scrolls past that. A crowded normal board still shrinks its own cards to fit its columns.
- **Touch-and-hold opens a card's details everywhere:** the Codex, the deck builder, the Nest, deck previews, the skirmish strip, the hand and the board. It takes 450 ms outside a fight; a fight keeps the owner's 0.25 s from 10-12. Moving more than 10 px cancels it. The details stay up after the lift; tapping them opens the card's full page.
  - The lift never plays, arms, adds or removes the card. The click after it is dropped, even after a long hold (before, a hold longer than about 1.2 s played the card). Android's long-press context menu and iOS's own drag are dropped too.
  - Cards get no iOS callout and no text selection.
- New `tests/e2e/mobile_layout_2026_10_19.py` (Playwright, about a minute, not in run-all). It covers 390×844 touch and 1366×768, a normal fight and a raid: no sideways scroll, one screen tall, the hand on screen and board-sized, the raid cards bigger and inside the frame, the board centred, and touch-and-hold in the hand and the Codex. `MB2_SHOTS=docs/screens/mb2` saves the screenshots. Before and after: `docs/screens/mb2/`.

## 2026-10-19 (package SY: decks sync across devices)
- **Owner (10:55):** *"im using the same account in mobile AND web. They don't see each other's decks!"*
- **Root cause:** deck ids were `deck-xxxxxxx`, but the cloud table's `player_decks.id` is a uuid. Every deck upload was refused (22P02), and the client ignored the error. The table holds no deck for any player (read-only check). Pulls also ran only at load, and the cloud list replaced the device's list whole.
- **Fix (client only, works with the table as it is):**
  - Deck ids are uuids. Old ids are moved once at load, and the active and main deck keys follow them.
  - Each deck has an `updatedAt`. A change uploads after a 1.2 s pause, and edits made in a burst go up together. Errors are checked now.
  - The game pulls on load and sign-in, when the tab comes back (focus or visibility, at most every 10 s) and when the browser is back online.
  - The merge goes deck by deck, and the newest edit wins. An older offline edit never overwrites a newer one: the upload checks the cloud's time first.
  - A deck deleted on one device leaves the other devices with a toast, and a copy is kept locally. A deck edited after its last sync is kept and sent back. Decks are never deleted silently.
- **Sync indicator:** "Synced ✓ / Syncing… / Offline" next to the account chip, only when signed in. On phones it is just a coloured dot. It uses TX keys, in 12 languages (`tools/i18n_2026_10_19_sy.py`).
- **Proposed, NOT applied (optional):** `supabase/proposed/20261019_deck_sync.sql`. It adds `looks` (the deck's Shiny and skin picks) and `deleted_at` (delete marks), JSON shape checks, and a trigger that keeps the newer row when a stale write arrives. Until it is applied, the client falls back to working without it.
- **Test:** `tests/deck-sync-2026-10-19.js` runs two devices against a fake cloud (104 checks).

## 2026-10-19 (package UT: animal tags, Base cards, variants balanced by N, raid elder art brief, art reuse map)
- **Owner (09:52):** *"tag an animal to the card. For ghosts and spirits and elementals - they have an animal embodiment, see. But subtype ghost or elemental etc."*
- **Every creature card has an `animal`** (724 tagged here, 349 animals in 140 kinds). Package EE's 7 Easter-egg creatures keep their own tags, reported as an owner call. It names what the card is, or the animal its body takes. 96 beings also have a `subtype` from a fixed list of 15: ghost, spirit, elemental, undead, construct, structure, fiend, conjured, plant, fungus, mythic, changeling, were, mutant, glitch.
  - The tags come from the name, the type, the emoji, and a hand-checked table of art and flavor reads. Examples: the Magma Wraith is a wolf of flame, the Tide Spirit a seahorse wave, the Guardian Shield a pangolin.
  - 30 beings show no animal in their art (the Ent, golems, the storm cloud…). Their animal is a proposal for the owner.
  - `species` is unchanged. 11 places where it disagrees with the animal are listed (the Moray's species is Cnidarian, the moles are Rodent…).
  - Tool: `python3 tools/animal_tags.py`, which writes `cards.json` in place and the report `canonical/animal-tags.json`.
  - Two non-creature cards have an animal too: the River Bundle egg (otter) and the Red Dragon Egg (dragon).
- **The Codex:**
  - The card detail shows 🐾 the animal, the subtype and a 🌰 **Base** chip.
  - A new 🐾 animal filter groups by kind: every spider together.
  - The Codex search also matches the animal.
  - All new text uses TX keys, in 12 languages (`tools/i18n_2026_10_19_ut.py`). The build inlines the animal kinds (`__ANIMAL_GROUPS__`).
- **Base cards (owner: "The starter cards are not Otters. Just considered as 'Base'."):**
  - The 27 cards with faction `otters` are faction `base` now. They are Base cards: earned from skirmish rewards, not card packs. Their Codex "where to get" line says so.
  - Levels and budgets are unchanged: a Base card still starts at Level 1.
  - The Otters / Hummingbirds side pick and `basicSet` are left alone.
  - **The Hummingbirds stay a faction:** 12 cards, all hummingbirds.
- **The tutorial's copies are Level 0** ("The tutorial base cards come as Level 0 is the special thing"):
  - This covers the starting deck, the tutorial rewards and the "both" bonus.
  - A card that starts at Level 1 gets the Nest's hatchling marks (`hatch:1`, plus `tut:1`) and shows Level 0 until the Nest trains it or a Level 1 copy arrives.
  - Base cards won later from skirmishes start at their normal level.
- **Dire / Elder balanced by N (owner: "we can't do 1.4x, 1.5x etc. They should balance based on N"):**
  - The 109 proposed later versions are player units now. Each body comes from the budget N of its rarity, Lumber and Wait, through the shared helper `tools/skill_costs.js`. 2A+H takes 80% of N in the base's shape. The old ×1.4 / ×1.8 draft is kept beside it (`variant.multDraft`).
  - "Dire" / "Elder" stay internal ids. Each version has a thematic name proposal, for example Peakroot Olm, Scarred Reef Shark and Venom Patriarch (`nameProposal: true`).
  - Non-player units keep multipliers. These are the raid's boss units (the Leviathan Elder and the Kraken Brute) and the 13 raid bosses, listed under `nonPlayer` in `canonical/unit-themes.json`.
  - Units are grouped by animal as well as theme.
  - The hub's Units by theme tab is updated but not rebuilt or published. It gets an animal filter, groups by animal and subtype, N-based variant lines and a 👹 Non-player view.
- **Art:**
  - `docs/art/raid-elder-art-brief.md` has prompts for the Leviathan Elder (built on `art/cards/humpback-elder.png`) and the Kraken Brute. No art was generated.
  - `docs/art/art-reuse-map.md` (`python3 tools/art_reuse_map.py`) covers 840 units. 806 (96.0%) keep existing art: their own, their base's, or a same-animal stand-in. 34 have no usable match and are flagged: 30 have only a loose stand-in, and 4 are Easter eggs with no art yet.
- New test `tests/animal-tags-2026-10-19.js` (in run-all). `tests/unit-themes-2026-10-19.js` follows the N-based variants, the names, `nonPlayer` and the animals.

## 2026-10-19 (package EE: Easter eggs, the Condor's beam, Evomax)
- **Owner (09:52): "Easter eggs: Special category, ungettable atm."** This adds a new card category: source `{kind:'easteregg'}` plus `easterEgg: true`, with one list, `EASTER_EGG_IDS` in `arena_app.js`.
  - No source gives one out yet: packs, drops, skirmish rewards, raids, the reward tracks, the Forge, the Nest's hatch.
  - `unlockCardForPlayer` refuses them from every source except an admin's grant.
  - The Codex shows an unseen one as a "???" tile in its own 🥚 Easter eggs section. The hub's card list masks it too.
  - Test: `tests/easter-eggs-2026-10-19.js`. Internal notes and inspirations: `docs/easter-eggs.md`.
- **The eight Easter eggs**, all within budget v3. They use emoji placeholders; the NightCafe prompts are in `docs/art/easter-egg-art-briefs.md` (nothing was generated).
  - Creeper (now Very Rare, an exploding creeping beetle).
  - Terraumbra (Unique Evomax equipment).
  - Exo-podas (Very Rare).
  - Galactic Condor (Epic).
  - Pink Maus (Unique).
  - Nyoogle (Super Rare).
  - Habanero Drakon (id `tobasco-drakon`, Rare).
  - Kegfuse Panda (id `demo-panda`, Super Rare).
- **New action: Position Beam**, used by the Galactic Condor's Charge 2.
  - From the exact centre it hits the unit across and the bramble.
  - From a side it angles inward across the units diagonally across.
  - From the edge (5 out) it hits the whole row inward of the unit opposite.
  - It reuses the lightning bolt with a prismatic glow. Test: `tests/position-beam-2026-10-19.js`.
- **The Evolution archetype is called Evomax** wherever a player sees it: the Codex filter and pie, the corner mark, the editor and the card detail. The detail had been showing such cards as Devilry. The internal id `evolution` is unchanged.

## 2026-10-19 (package RC: raid cards are crafted)
- **Raids almost never give their own cards now** (owner 09:53). A fall's claim gives reward cards from the normal pack pools instead: 1 for taking part (+1 for the top 1% / 10%), with a 10–25% chance that each one is a faction card. Competent participants get a 20% chance of one more and Leading participants get one more for certain. The pack cards have a rarity floor: Competent get Uncommon or better, Leading get Rare or better. A raid's own card comes only at `RAID_CARD_DROP_CHANCE` (1.5%, `bramblewood-raid.js`): once per fall's claim and once per won raid fight. A won raid fight used to drop a boss-deck card every time; it now gives a pack card.
- **Trophy shards:** each raid has its own crafting material ("Goliath trophy shards" 🏆). A fall pays 6 for taking part, 9 for Competent and 13 for Leading, before the top 1% / 10% / 50% bonus (+4 / +2 / +1). A raid that holds pays a share based on how much Health it lost.
- **Forge → 🐙 Raid tab:** lists each raid's cards with a recipe (shards + Magic Dust + Maple Leaves, by rarity: Common 8/40/80 up to Legendary 160/960/1920). A card you haven't met yet shows face-down as "?" with its cost. A craft gives one plain Level-1 copy.
- Shards are saved with the currencies. Cloud sync waits on `supabase/proposed/20261019_raid_shards.sql` (**not applied**); until then they stay in the browser. The reward screen, raid rules and Codex source line no longer promise raid cards. 24 new TX keys + 4 changed, translated in 12 packs. Tests: `tests/rc-2026-10-19.js`.

## 2026-10-19 (package TC: the tests follow the applied skill costs)
- **The owner applied the measured skill worth** to `canonical/skill-costs.json`: 199 entries use their high-confidence `measuredS` (a negative one floored at 0), and each keeps `prevValue` and `appliedAt`. His own values stay: On Death, On Ally Played, Bounty, Supreme, Supreme Tide, True Strike. Owner 08:49: separate the units by theme, he picks the units for each map, then a post-balance step sets skills and stats. **No card was refit.**
- **Post-balance queue: 29 cards** that fitted budget v3 before the new costs and are over it now. Each fails only 2A+H+S < N, by +0.01 (Bone Diviner) to +9.5 (Marshal of Rivergate). The list is in `docs/balance/post-balance-queue.json` (built by `node tools/post_balance_queue.js`, `--check` for staleness) and `docs/post-balance-queue-2026-10-19.md`.
- **Tests now check the current table instead of the old hard-coded costs:** skill-costs, card-pass, gi, card-pool, d and prayer. They accept a queued card as known-over-budget and fail if the queue goes stale. They still check that the owner-set values are unchanged, that every applied entry has prevValue, appliedAt, measuredConf high and value = max(0, measuredS), and that under the pre-application costs every live card fits.
- **`once` fix** (`tools/skill_costs.js`): onceCap is 0.66 now, lower than On Spawn's 1. A `once` on On Spawn, On Death or On Ready (triggers that fire once anyway) no longer makes a card cheaper. Only repeating triggers are capped. No live card changes: the only `once` cards are Nest and Sea Cucumber, on repeating triggers. The old "once caps the weight" failure was a test bug: it compared an unrounded product against the rounded cost.
- The hub was rebuilt: its Skill costs tab shows the applied values.

## 2026-10-19 (package UC: units by theme)
- **Owner (08:49): "let's separate the units thematically? Then we pick and choose, then do post-balancing — meaning we apply skills post-facto. Dangerous versions of a biome monster can come later in the game."**
- **The catalogue** is `canonical/unit-themes.json`, written by `node tools/unit_themes.js`. It covers 725 creature cards: 721 live and 4 still in the pool.
  - Each one is tagged with its biomes (21; the main one first), its family (20), its faction (16: the Otters, the Hummingbirds, the lore bible's sub-factions, the beasts and the wild), its size and its road stage.
  - Its **base body** (Lumber, Wait, Attack, Health, damage type, resists) is kept apart from its current skills.
  - The tags come from the maps' identities, the archetypes and species, names and emoji. A hand-checked table of 22 overrides comes on top, each with its reason.
- **Dangerous versions later:** the variant convention.
  - "Dire" is one road stage later: Attack ×1.4, Health ×1.5, +1 Lumber, rarity +1.
  - "Elder" is two stages later: ×1.8 / ×2.0, +1 Lumber, +1 Wait, rarity +2.
  - "Ancient" is three stages later: ×2.3 / ×2.6, +2 Lumber, +1 Wait, rarity +3.
  - The draft body is fitted under budget v3, with room left for skills, and its skills are applied later.
  - 39 cards are already such versions (Old Snapjaw, the Alphas and Matriarchs, the Kits and Hatchlings, the tortoise line up to the Dragon-Turtle).
  - **109 later versions are proposed** (77 Dire, 32 Elder), 1–2 for each biome and family with an early creature. They are rows marked `proposed`, not cards.
- **The hub's 🗂 Units by theme tab:**
  - Filter and group by biome, family, faction, map, rarity and live / pool / proposed. Tiles show the art or emoji, the base body, and "Skills · applied later". Tiles come 120 at a time.
  - A **per-map picker**: "Picking for" a map, a checkbox on each tile, and a strip with each map's picked count. Picks save in the artifact's db (collection `unitPicks`, `{map, unit, picked, updatedAt}`). Without db, a read-only note and Copy JSON.
  - A **🧰 Post-balance queue** lists each picked unit's remaining work: create, place, re-stage or give skills.
  - The hub must be published with `capabilities: {db: {}}`.
- `tools/hub/pull_unit_picks.md` says how Claude reads the picks and works the queue, with `tools/hub/unit_picks_queue.js`. New test `tests/unit-themes-2026-10-19.js` (in run-all).

## 2026-10-19 (package LV: the level curve)
- **Owner (00:19, the plan's last step): "balance level to balance with the overall linear increase in difficulty over time."** The road curve had been held up by 96 hand-set Shields (47 over 2× the rule, up to 33× / 252). Level curves carry it now.
- **The enemy's level is a straight line:** its cards are 1.25% stronger every map after Map 4: Lv 3 at Map 12, Lv 6 at Map 20, Lv 9 at Map 28. Bosses fight two maps on, and the Map 20 world boss is levelled too (it fought at its printed level). A fractional level is a per-copy mix of its two stat steps.
- **Your expected level follows the Forge:**
  - Lv 0 to Map 10, because the Forge opens on Map 11 (this answers W2's "lower the curve if players don't reach Lv 3 by Map 10");
  - Lv 3 from Map 11;
  - then 6% more of the deck at Lv 6 each map from Map 16 (Lv 4.6 at Map 24), checked against the Dust a player earns (`level_curve econ`).
- **Shield overrides 96 → 35, none over 2× the rule; lower Health 53 → 2.** The reference decks were rebuilt and every fight was retuned from the rule, deck moves first. **179/179 main fights green**, 151 on fresh seeds, 174 on the mean of both. The Eye of the Volcano and the Old Bramble are on the curve now and tuned; the Pale Desert is re-measured.
- **Absolute difficulty** (four fixed yardstick decks, one rating scale) now rises 0.19 DR a map from Map 1, r² 0.80, against 0.135 and r² 0.68 before; the late maps no longer go flat. Maps 8, 13 and 20 stay off the line. They follow their reference decks; the owner decides.
- **Endless floors:** +4% a floor compounding is gone. A floor counts as half a map further down the road (enemy level and Shield). The Murgle King on floor 10 is 38% for a Map 6 deck (was 0%). The Long Burrow got the Caldera's badger warband: its diggers had been 100% on every floor.
- Doc `docs/level-curve-2026-10-19.md` + `.xlsx` + `.png`. Tools: `tools/level_curve_2026_10_19.js`, `tools/level_curve_xlsx.py`; `skirmish_pass.js curve --rule --shieldx --hpfloor --any`. New test `tests/level-curve-2026-10-19.js`; shields, winrate-panel and thematic updated.
## 2026-10-19 (package RV2: the raid round column by column, bigger back rows, the elders' Health, the boss's 3 plays, allies' plays, ranks, Competent / Leading participants)
- **The columns attack for real, 0.25 s apart** (owner 08:42). The engine already resolved a raid round strictly in order (column by column, left to right; front, middle, back; each strike picks its target from the board the strikes before it left, so after a death the next row goes for the next unit). Engine unchanged; a new test pins it. The playback now matches:
  - every middle- and back-row strike is a real attack (lunge, blow, number, shake, squash, sound), like a front-row swing (`raidStrikeVfx`);
  - each strike starts `RAID_COLUMN_STAGGER_MS` (250 ms) after the one before, so the swings overlap in order; a death breaks the run (its blow lands, it falls, then the next strike plays); a blow that may end the fight plays in full; reduced motion / Low effects: 150 ms and a flash instead of a lunge, same order;
  - the middle and back rows replay hit by hit (`m.replayReserve`): before, any mid-round redraw showed their end-of-round state, so units dying later vanished at the first death and their hits played at nothing.
- **The raid's middle and back rows are 15% larger:** .84 → .966 of a front card (`.reserve-row.raid-rows`). It fits at 1366 and 390 px (no sideways scroll).
- **The HP-scaled elders** (Kraken Brute, Leviathan Elder…): Health = basic + (100 − basic) × the raid's remaining share. So 100 on a fresh raid, their basic Health when it is nearly dead, never below basic. `RaidM.bossHpBonus(def, state, basic)`; the raid BR uses it; the editor field is "Boss unit Health, fresh raid"; the raid tab's might line is a TX line.
- **The boss plays 3 cards at once each turn** (owner: "not twice at the start"). Its front-row card comes from the CPU's normal play. With it, one card goes into its middle row and one into its back row (`raidBossRowPlays`), each from that row's own 20-card deck of the part's cards (`rowDecks`). Each goes into the centre-most free slot with a unit in front. No card waits in its middle row at the start any more.
  - They fly in together from its hand, each into its own slot.
  - Balance: new `tuning.rowCap` (2): a back row holding 2 waits. Boss cards are now at 20% Attack / 15% Health (were 35% / 25%). The Commons call-ins are off (`reinforce.max` 0): the row plays replaced them.
- **Allies' plays are unmistakable, and nothing else is redrawn.** The ally's name tag pops and pulses at its row ("Hive Wall plays Forager Ant"). A fan of card backs opens at the row's edge, and the card rises from it face down, turns face up mid-flight and trails sparkles. It lands with the squash, the thud and dust.
  - The card goes into its slot alone (`reserveSlotPut`): measured in Chromium, 0 `renderBoard` / `renderMatchUI` calls, and the other cards keep their DOM nodes.
  - Each turn's ally plays now come after the turn's redraw (before, `renderMatchUI` drew them before their flights, so they looked spawned).
  - Reduced motion / Low effects: the name tag and a fade. The tag-team hook `allyPlayFx(uid, {mode:'tagteam', name})` gets the same.
- **A raid fight's rank multiplies its damage** (owner 08:46).
  - A full-raid fight is ranked on your bramble's Health left (SS: no damage taken; SSS: no damage and no unit lost). B ×1.01, A ×1.1, S ×1.2, SS ×1.5, SSS ×2, capped at 10,000; a win counts 10,000. The attempt and the server row carry the multiplied damage.
  - A win shows the rank **emblemed** (extra rings and a crest) on the results. The claim row and claim screen show your best rank in that life.
  - The raid tab's rules gain three short lines (more damage = a bigger share, a win = 10,000, a higher rank = more damage), with no multipliers shown.
- **Competent participant** (was the strong contributor) needs 10,000 damage (was 5,000). The new **Leading participant** needs 50,000 (4+ fights): +40% of everything and one more raid card for certain. This is a proposal. All of it is in `raids.json` `participation` and the raid editor; the hub, raid tab and claim screen name the tier.
- **Sims** (`tools/raid_full_sim.js`, n = 30, outer parts, damage dealt before → after; it now plays the 3-card boss and prints each fight's rank):
  - starter deck 30–42 → 24–43;
  - Map 6 deck 84–156 → 84–145;
  - Map 20 deck 110–177 → 106–181.
  - The Core is harder: Map 6 88/53/36 → 51/29/21 (fresh / Enraged / Thrashing); Map 20 84/49/56 → 70/53/39.
  - Contributions are up 10–40%, from the rank multiplier.
- Texts: 16 new TX keys, 4 reworded, all 12 packs (`tools/i18n_2026_10_19_rv2.py`; the 3 retired "Strong contributor" pack keys dropped). Test: `tests/raid-rv2-2026-10-19.js` (in run-all). Updated: raid-rx, raid-ops, raid-br, raid-fixes, ui_smoke. Docs: `docs/raid-ops-2026-10-19.md` § 5 / 5b.

## 2026-10-19 (package BR: the raid's battle rating)
- **Owner (08:18): "The raid's BR is being calculated wrongly ... the total of their 3 20-card decks and any other bonus ... played straight away ×2 ... our total BR = sum of total BR with leaders contributing 2×."** The raid now uses the same per-card rating as every fight (rarity weight × level factor; raid and ally cards at their starting level, yours at your copies' levels).
- **Boss BR** = its 3 rows, each a 20-card deck of the part's cards (scaled to 20 like any enemy deck) + every card on its board at the start counted again (×2; a guard, e.g. the Core's stumps, which isn't in the deck, counts 2× its own) + a boss unit for each boss-unit round in the fight (3/7/11/15/19), each × (Health + the super whales' bonus) / Health + the Commons it can call in (its reinforce tuning). Stat shares, a stage's +Attack/+Health and the brambles' Health are left out, as in every fight's BR.
- **Your side's BR** = your BR + each ally's (its deck + its leader 2×). The leaders that start on the board count 2× once, not 4×.
- **Where:** the raid VS screen shows "Your side's BR" against "Boss BR" (coloured by the gap), each ally chip its real BR (it was the old power score); the raid page shows each open part's "Boss BR · your side about" line. The Goliath, fresh: Left 32 → 507, Right 27 → 463, Tail 15 → 339, Core 53 → 483; ally decks 32–44 → 56–67. Normal fights' BR is unchanged.
- New test `tests/raid-br-2026-10-19.js` (in run-all); 5 TX keys in all 12 packs (`tools/i18n_2026_10_19_br.py`).

## 2026-10-19 08:10 — SQL applied (owner "apply it")

- Applied in the Supabase SQL editor (project xjctfwobcsyiztecutrb), each in one transaction, then verified with a read-only query: `20261018_guild_rename.sql` blocks A (rename_guild) and B (the join-as-owner hole closed; block C, server-side tickets, not applied), `20261019_guild_skills.sql` (Guild Seeds, Rooted Walls, upgrade_guild_skill, the Seeds trigger), `20261019_raid_ops.sql` (admin_restart_raid, raid instances, the own-instance trigger) and `20261019_card_copy_levels.sql` (player_card_unlocks.copies + its check; `card_copies_ok` now pins `search_path`). All four moved from supabase/proposed to supabase/migrations; their tests now check the applied files.

## 2026-10-19 (package CB: the card pass)
- **Owner (00:19): "balance the cards themselves (L1) + balance rarity, choose where the cards come from".** Every live card measured at Level 1 on card_balance.js's yardstick: 733 at 100 games, the 133 more than 3 points out again at 400.
- **61 cards changed** (47 now in their band, 11 toward it, 3 budget fits), all within budget v3 at today's `value` S. Toned down: the Bounty fighters at 89–95% (Badger Berserker 5/12 → 3/12, War Hound, Squire's Mount, Woodland Brawler 4/12 → 3/12, Bramblewood Lynx 6/9 → 6/6, Boar Rampager 4/14 → 4/9 …), Pall Wraith 5/15 → 3/13, Lurking Dread 4/9 → 3/8, Bramblewood Macaque 2/10 → 2/4 (100% → 75.5%). Lifted: Tunnel Ant 5/5 → 5/7 (23.5% → 73%), Beaver Builder / Chipmunk Stockpiler / Cinder Stoker 1/9 → 1/13, The Sixfold 8/20 → 9/22, Sunspire Choirmother 5/10 at 2 Lumber → 2/6 at 1. Fitted: Raven Harbinger 5/18, Bone Diviner 5/19, The Magnate Duck 6/59. In band (measured cards): 400 → 444; more than 8 points out: 77 → 27.
- **Rarity:** Fawn Scout and Warren Scout Uncommon → Rare (the yardstick's own filler, 78–82%; their stats can't move). The 27 cards still out are listed for the owner (2+ Lumber cards, Sacrifice, skills).
- **Sources:** 159 cards got one: 118 fight rewards (a fight they fight in, inside the road's cap, no fight over 3), 7 off-theme rewards moved, 34 into packs (2 to the Mystery Booster); the three homeless map leaders now come from their map's last fight (Gannet Queen 3-7, Old Snapjaw 5-7, the Triumvirate 23-8). 37 stay sourceless on an allowed list (Dragons, enemy-only bosses, cards held for maps past 24, parked designs).
- **Road curve:** reference decks rebuilt (`decks --keep`), 88 of 179 main fights green, then two retune rounds (91 fights): **179 of 179 green**, 151 on fresh seeds. The Pale Desert got two hand swaps. Five new Shields over 3× the rule (owner call); 22-6's 182 is gone.
- Doc `docs/card-pass-2026-10-19.md` + `.xlsx`. Tools: `tools/card_pass_2026_10_19.js`, `tools/card_pass_docs_2026_10_19.js`, `tools/card_pass_xlsx.py`; `skirmish_pass.js decks --keep`. New test `tests/card-pass-2026-10-19.js`; thematic (latest curve file), shields (21-1 canary) updated; card-matrix golden re-baselined.

## 2026-10-19 (package TH: the thematic pass)
- **Owner (00:19): "reassign skirmishes based on thematics", "5–10 new cards per map — from skirmish-only rewards and pack".** Every fight's enemy deck was audited against its map's identity (biome, creatures, factions, field), and the drift was fixed:
  - Badger Berserkers are off the Summit and Maps 0–1. They stay on the badger maps: Ashen Spurn, the Long Burrow and its parent, the Rimefire Caldera.
  - Pelican Divers no longer flood Gannet Cliffs; its own seabirds took their place.
  - Out of the places they don't belong: Goldfeather mallards and ocean crabs (beach and swamps), beavers (the swamp and the tundra), village dogs (the Redwood Deep and the Taiga), bees (the caves), narwhals (the warm mangroves) and Echo Keepers (the heights and the volcano).
  - The audit (`tools/thematic_pass_2026_10_19.js`) now finds **no off-theme card in any of 260 fights**. The curve tuner asks it before every move.
- **96 of the 100 pool cards are live:**
  - 52 are skirmish-only rewards and 44 are in the basic pack pool. That is 5–9 new cards a map on Maps 0–12, plus the polar set on 16–17, and package GI's 10 examples where their notes put them (Savanna, Glass Dunes, Quiet Summit, Rimefire Caldera too).
  - They are placed the Admin way: the pool fields drop and they take the next live numbers, #1235–#1330.
  - Most also fight in their map's decks.
  - 4 stay in the pool: Sanderling, Roseate Spoonbill, Water Scorpion and Wallcreeper.
- **New fields on their maps, a few fights each:** 🍄 Spore Cloud (7-5, 7-6), 🪢 Tangled Roots (9-5, 9-6), 🌩️ Thunderstorm (10-7, 10-9), 🌋 Ash Rain (19-3, 19-5), 🌫️ Ashy (19-6).
- **GI's examples were measured first:** 88–100% at their printed stats. Each stepped into its rarity band, e.g. Fen Mink 5/12 → 2/9 (55%).
- **The reference decks were rebuilt** after the placement (Maps 1–24), then the road curve was retuned in four rounds within the themes:
  - **All 179 main fights are green** on the measure seeds; 145 on fresh seeds, and 166 on the mean of both.
  - The changed side fights and the Pale Desert are on their curve too.
  - 13 Shields are now well over the rule, mostly on Wolfsbane Tundra. That is a decision for the owner.
- Doc `docs/thematic-pass-2026-10-19.md` + `.xlsx` (every changed fight: off-theme out, in, rewards, field, retune, before / after). Tools: `tools/thematic_pass_2026_10_19.js` (audit / apply / tunegi), `tools/thematic_plan_2026_10_19.js` (the choices), `tools/thematic_pass_xlsx.py`. New test `tests/thematic-2026-10-19.js`; card-pool, GI, shields, skill-costs and pale-desert tests updated for the placed cards.
## 2026-10-19 (package SW: what each skill is worth, measured)
- **Owner (00:19): "defining the N-worth of skills. Only way is to run experiments with test units with each skill…"** `tools/skill_worth.js` measures every entry in `canonical/skill-costs.json` on the live engine:
  - every skill, trigger, action, modifier and shorthand, plus GI's new skills (pool cards skipped);
  - 1241 runs, 608k seeded games, 40 per point;
  - **test units:** a vanilla 2/8 W1, 4/14 W2 or 6/22 W3 plus the skill, played against vanilla mirrors and calibrated glass cannons, tanks, flyers, swarms and a mix;
  - **worth:** the Health and Attack a vanilla unit needs to match the skilled one, in Budget-v3 S.
  - Field skills are measured under their field.
- **Nothing in the game changed.** Each entry gets `measuredS`, a confidence, and either `measuredOff` (the result is only a bound) or `measuredWhy`. `value` is untouched.
- **The hub's Skill costs tab** shows the measured number next to each value, with Apply and a "biggest gap to measured first" sort.
- **Report:** `docs/skill-worth-2026-10-19.md` (+ `.xlsx`, `docs/balance/skill-worth-2026-10-19.json`).
- **Headlines:**
  - Arrow is strong against glass cannons and against everything else: 100% against the pool at b2, about S 10 at N 2 against S 2 today. Snipe is about right.
  - Quick, Armor, Thorns, Regen and Poison are worth 2–4× their cost. Shadow, Blind and Stealth are worth less than they cost.
  - Gain 1 Lumber and Bounty compound in a 20-copy deck. Exile and Mind Control are off the scale.
- The run is resumable after a restart: it saves results to `docs/balance/skill-worth-partial.jsonl.s*` as it goes and reuses setups saved in `skill-worth-partial-setups/`.

## 2026-10-19 (package R2: the road curve)
- **Owner (20:39): "The balance should be such that the constructed deck wins in the green zone for every map it's in… it starts at 90%, and drops to 60%. Then at the boss fight, <50%."** On every main map (0–24), the map's reference deck now wins its fights in road order on a straight line:
  - 90% for the first fight, down to 60% for the last before the boss; elites sit on the line;
  - a mid-map boss (20-9) 50%;
  - the map's boss fight 40%, green 30–49%; Map 0's Frost Vanguard 45%.
- **All 179 main-map fights are green** on the measure seeds, 120 games each, re-measured on today's rules (Freeze/Confuse, no-op heals, the new cards). Before, 38 were green. On a second seed set 157 are green, and 178 on the mean of both.
  - **144 fights changed:** 138 CPU deck moves inside the map's theme and the road's rarity rules, 53 Shields (38 up, 15 down), and 2 lower Healths.
  - No card stats changed. The Tutorial is untouched.
  - The Quiet Summit (Map 21) was 93–100% at any Shield because its bird flocks barely hurt you. Its fights now mix the Summit's goats and ibex with Badger Berserkers.
- **The skirmish editor's "This map, new-player win rate" pills** are coloured by this curve: green inside the band, blue above, red below. A pill's tooltip gives the target and band, e.g. "target ~75% (green 67–83%, fight 3 of 5 before the boss)".
- Owner decision: 8 fights have a Shield over three times their map number, e.g. 16-6 Reaver's Hollow 105 against a rule of 24. The list is in the doc.
- Doc `docs/road-curve-2026-10-19.md` + `.xlsx` (every fight: before, after, fresh seeds, what changed). The curve is also in `docs/winrate-reference-decks-2026-10-19.md`. Tools: `tools/skirmish_pass.js curve` / `snapshot`, `tools/road_curve_bands.js`, `tools/road_curve_merge.js`, `tools/road_curve_xlsx.py`. `tests/winrate-panel-2026-10-19.js` checks the new bands. `card-matrix`: 0 golden diffs.
## 2026-10-19 (package GI: the gameplay ideas, built)
- From `docs/gameplay-ideas-2026-10-19.md` (owner 00:19: "After running through the ideas, create what you want to create"): **9 skills** and **3 field effects**, with engine rules, the CPU's view, short card lines, Codex entries, skill costs and 12 language packs. Details: `docs/gameplay-ideas-built-2026-10-19.md`.
- **Skills:** 🐆 Hunter N (pick one status: Poisoned, Bleeding, Wet or Exposed), 🪦 Executioner N (below half Health), 🎆 Detonate (cash in the target's Poison), 🧫 Proliferate N (Poison spreads along the enemy row), 🫙 Brittle N (a new status: Frozen for Shatter), 📯 Kin Rally N (the Kin ally you play gets +N/+N), 📣 Pack Howl N (a Wolf played makes its foe Bleed N), 🧿 Prayer Ward N (Armor while holding Prayer tokens), 🧹 Field Breaker N (the field's round effects stop for N rounds).
- **Fields:** 🍄 Spore Cloud (a unit a side falls Asleep; the Sleep cap holds), 🌩️ Thunderstorm N (lightning on a unit a side; Wet adds), 🪢 Tangled Roots (a unit a side is Webbed). They are offered in Edit skirmish; no map has them yet.
- **Triggers can target the card they are about** (your question 7): Kin Rally buffs the played card. The new `sub:'subject'`, `sub:'subjectFacing'` and `filterKin` work for any trigger.
- **The CPU** counts its new bonus damage when it picks a slot, and values the new skills on its board (Kin and Wolves in hand, Poisoned foes, hazards up).
- **10 example POOL cards** (`pool: true`, ids 9501–9510): Fen Mink, Tidepool Trapper Crab, Grave-Grin Hyena, Bogfire Newt, Plague Gnat Cloud, Glasswing Moth, Rivergate Drummer, Frostmoon Howler, Chapel Tortoise, Weathervane Swift. All fit budget v3. The build, the harness and the deck tools leave pool cards out (package AN's filter, mirrored), so no live card, deck or golden result changed.
- Costs in `canonical/skill-costs.json`: Kin Rally and Pack Howl are shorthands (On Ally Played 2.5 × Buff or Bleed; `both` fills +N/+N, in `tools/skill_costs.js`). The rule decisions are in `docs/decisions.json`, and `decisions.md` is regenerated.
- 67 TX keys (`tools/i18n_2026_10_19_gi.py`). The emoji sets gain 🧿, plus 🧘 🧂 🪣, which the game already used but the sets lacked; the atlases are rebuilt. New test `tests/gi-2026-10-19.js` (435 checks).

## 2026-10-19 (package NF: every copy is its own card, the Nest's chosen nest, forging Max Energy, Fuse all order)
- **Every copy of a card has its own level** (owner 23:37: "Each card is unique. Forging one card doesn't mean all copies become stronger!"). Each owned copy now carries its own level and its own Forge credit, next to its foil, Shiny and skin. Forging, limit breaks, promotions, melting and Feed a duplicate work on one copy.
  - **The Forge** shows a copy picker on the anvil (Upgrade and Refine) when a card has more than one copy. Each chip shows the copy's level and finish; ⭐ marks the copies your main deck fights with and 🧩 marks a copy with credit. It opens on your best copy.
  - **Decks** still hold counts. k copies of a card in a deck fight as your k strongest copies: the highest level first, then the finest foil, then the oldest. A weaker copy fights as `<id>~cp<L>` at its own level's stats; the CPU keeps its own `@lv` cards. The leader fights as your best copy. The battle rating counts each copy at its level. Picking which copy a deck uses in the deck builder is not done yet: it needs decks to store copy ids. Standard (every card Lv 1) is unchanged.
  - **Old saves move over once** (flag `bramblewood_card_copy_model_v` = 1). Every copy keeps the card's old level L: before this every copy fought at L, so no deck gets weaker and no best copy drops. The owner's example rule ("one copy at L, the rest at level 1") would have weakened every deck that holds several copies of a levelled card. The best copy keeps the card's Forge credit and counts as paid for. The other copies' levels are marked inherited (`free`), so melting them refunds nothing and the same levels can never be refunded twice. A levelled Base card that a deck holds more of than you own gets those copies too, at L. A save with levelled spare copies gets a one-time note.
  - `myCardLevels[id]` stays the level of your best copy. That is what the Codex, Nest, deck builder and card tiles show, and what the cloud row's `level` holds. Older code that raises a card's level (rewards, the Nest's training, a cloud pull) lifts the best copy and never lowers one.
  - **Cloud:** `player_card_unlocks` rows still send `level` (the best copy) and now also `copies` (`[{u: uid, l: level}]`, best first). **Proposed, not applied:** `supabase/proposed/20261019_card_copy_levels.sql` adds that column with a shape check. Until the owner applies it, the client sees "column missing" and carries on as before. A pull never lowers a copy. The copies themselves still live on each device; they were never synced.
- **Fuse all extras** (owner: "should go into the highest level card first, then if draw, into the highest foil treatment"). All of a card's spare copies feed its best copy: the highest level, then the finest foil, then the oldest. The sheet shows "→ Lv N" under each card. Spares are the weakest plain copies with no levels paid for on them. A Base copy made for a deck is never a spare.
- **The Nest puts an egg where you tap** (owner: "when you insert an egg, it should go into the slot you chose"). Each egg, baby or card in training remembers its nest. Tap the fourth nest and the egg goes there, not into the first empty one. When one hatches, nothing moves up a nest. A taken nest says "That nest is taken. Tap an empty one." and the egg stays in your pack. An unbuilt nest says "That nest isn't built yet." Older saves keep their eggs in order.
- **Forging Max Energy is a moment** (owner: "Forging your energy should have an amazing energy and animation"). Buying a Max Energy step in the Forge's ⬆️ Upgrades tab now plays `FX.D.energyForge` (about 2.6 s):
  - the room dims and motes gather into a bar laid over the panel;
  - the bar charges from the old max to the new one, with lightning along it and sparks off its head;
  - it overflows: a white flash and drops of light spilling off the end;
  - a shockwave and a spark burst; the new pip pops, the number counts up and a bolt jumps to the ⚡ pill;
  - sound: the new layered `SoundKit.energySurge` (charge / overflow / boom).
  - Under reduced motion, Effects Off / Low or without GSAP it plays a calm version: a gold glow, the new pip brightening and one soft chime.
  - Effects Lab: `meta-forge-energy` (`tools/effects-lab/manifest/nf.js`, full and calm) and an inventory row.
- Fight-only copies (the CPU's `@lv`, your `~cp`) no longer show in card pools or the collection count.
- Texts are TX keys (17 new). They are in all 12 packs via `tools/i18n_2026_10_19_nf.py`, which also drops the replaced refine note and three `lang/ui` rows. `tests/nf-2026-10-19.js` (133 checks) covers the chosen nest, per-copy levels, the move of an old save, a deck's copies in a real engine fight, the cloud copies, the Fuse all order, the energy effect and the texts.
## 2026-10-19 (package AN: a candidate pool of 90 new animal cards)
- **Owner (23:04): "More thematic animals — I'll pick and choose when balancing for a map ... like pin cushions (uni = sea urchins) and sea snakes. (Temperate water-going mammals?) (Do the polar ones in advance.)"** and **(23:32) "We don't have a really scary spider."** 90 candidate cards are now in `canonical/cards.json`, marked `"pool": true` with a `poolMap` and a `poolSlot` (skirmish reward or pack). That is 6 or 7 for each of Maps 0–12, plus a polar set of 10 (Polar Bear, Harp Seal Pup, Ringed Seal, Beluga, Arctic Tern, Greenland Shark, Lemming Swarm, Krill Swarm, Woodland Caribou, Musk Ox Calf, all resisting Cold).
- The owner's examples are in: the **Pincushion Urchin** (Thorns 2, Pebble Beach), two sea snakes (**Banded Sea Krait**, **Yellow-bellied Sea Snake**: Tide + Venomous / Poison), and the temperate water mammals (Water Vole, River Mink, Muskrat Lodgekeeper, Water Shrew, Pyrenean Desman, Grey Seal Bull). The scary spider is the **Giant Cave Huntsman**: Rare, Caves & Alcoves, Poison 2, Pounce 3, Darksight, Daunt 1. It is flagged "owner request" and carries a NightCafe art prompt.
- **Players never see a pool card.** It is left out of the build's card list, so no pack, reward, Codex, CPU deck, ghost deck, egg or auto-battle pool has it, and it is left out of the card hash, the card matrix, the deck tools and `card_balance.js`'s full report. **Admin → Manage Cards → "Pool cards (N)"** lists them by map, each tagged Pool. A click opens one in the editor as a new card with its map filled in: pick the skirmish or pack under From and Save.
- Every card uses existing skills. Each is within its map's rarity cap, passes Budget v3 (the creatorNote shows N, S and both rules) and was measured inside its rarity band (`node tools/card_balance.js 120 --pool`: 90/90 in band). Each emoji is in all three sets. Names and flavour are in all 12 packs (`tools/i18n_2026_10_19_pool.py`).
- Docs: `docs/card-pool-2026-10-19.md` + `.xlsx`, by map: stats, skills, rarity, win rate, idea, and the answer on water mammals. Tools: `tools/card_pool_2026_10_19.js` (tune / write / check) and `tools/card_pool_docs_2026_10_19.py`. Test: `tests/card-pool-2026-10-19.js` (733 checks).
## 2026-10-19 (package RO: raid respawns, the admin restart, the Raid hub, instances, rewards for taking part, Auto, raid tickets, the raid editor)
- **A fallen raid returns 24 h after the kill** (owner 21:48: "within 24h"), not at the week's end. It comes back as a fresh life at full Health, with its own rewards. `respawnHours` (24) is editable, and a respawn never runs past the cycle's end. "🌊 The Goliath returns in 19h 4m" now counts to that moment (`raidRespawnAt` reads the state's `respawnAt`).
- **Admin "🔄 Restart raid"** in the raid tab's admin row and in the raid editor. It confirms in-page and starts a fresh life of every instance now. A raid still standing ends that life unbeaten, and its raiders get the held share. Live through `admin_restart_raid` once the SQL is applied; until then the restart is this browser's only, and the toast says so.
- **The Raid hub** (owner 21:49): the Raid tab opens on every live raid as a card, with its art, Health % or "returns in", your part in it, your instance and Auto. Your tickets sit on top, with any waiting claim. A card opens the raid's screen; "← All raids" comes back. With one raid the hub still shows (decision: it is where tickets and status are read).
- **Instances** (owner 00:22): each cycle, a raid has instances of up to 100 players (`instanceCap`, editable), each with its own Health, lives and rewards. Your first fight places you: in a guild-mate's instance with room, else the lowest with room, else a new one. Attempts carry the instance in `boss_id` ("goliath:left@2"; instance 1 is unchanged). Until the SQL is applied, everyone is in instance 1.
- **Rewards follow taking part** (owner 00:29), per life:
  - taking part = 3+ fights and 1,000+ damage; under that, no claim;
  - a fall gives the full rewards;
  - a strong contributor (4+ fights, 5,000+ damage) gets +20% of everything, and a 20% chance of an extra raid card;
  - a raid that holds gives ½ of the Maple Leaves, Dust, Metal and XP; its own cards and extras are scaled to 0–10% by how much of its Health went.
- **Completing a raid opens 🤖 Auto-play in its fights** (owner 21:49). Completing means you took part in a fall; it is kept in the synced progress.
- **Raid tickets** (owner 00:22): the 🎫 Raid Points are the raid's tickets now.
  - Cap 10 (was 5), +1 a day (was 6 h), and each new week tops them up to 10 (decision: both rules).
  - A fight costs 1 ticket + 1–6 Energy, set per part and stage: Goliath outer parts 3, Core 5; Thrashing +1, Exposed −1.
  - At 0 the Fight buttons grey out and say when the next ticket comes; no Energy is taken.
  - Spending below the cap no longer resets the day's clock.
- **The raid editor scrolls** (it had no `.se-body`, so `.skirmish-editor`'s hidden overflow cut it off) and keeps its place on a redraw. It is grouped and furnished: art, tickets, default and per-part Energy, the stage's +Energy, respawn hours, players per instance, the participation and strong thresholds, the kill's XP and raid cards, the held shares, each tier's Leaves / Dust / Metal / title, the ally decks, and Restart.
- **Needs "apply it":** `supabase/proposed/20261019_raid_ops.sql`. It adds `raid_restarts` + `admin_restart_raid` (admins only), `raid_instance_members` + `join_raid_instance` (an advisory lock, guild-mates together), and a trigger that keeps an attempt in your own instance. All are SECURITY DEFINER with `search_path ''`, public read, no client writes; nothing existing is loosened.
- Docs: `docs/raid-ops-2026-10-19.md`. Texts: 38 TX keys (34 pack strings) in all 12 packs (`tools/i18n_2026_10_19_ro.py`); the two old "Not enough Raid Points" texts are retired, with their `lang/ui` rows. Test: `tests/raid-ops-2026-10-19.js` (in run-all).

## 2026-10-19 (package RV: Revive is a true death; Quiet Contemplation on Map 21's boss)
- **Revive is a true death** (owner 00:19: "Revive is true death, but Rescue no."). The first death, the one Revive answers, now does everything a death does: its On Death, the allies' On Ally Die (Berserk, Divine Retribution, Hive Mind), the killer's kill stat and On Kill (Crown of Thorns, Midas), Bounty, Darkness from the loss, the Ritual count, the deaths stat, On Death: Spawn, Landslide, Nova, the graveyard. Then it comes back out of the graveyard, into its own slot, at 1 Health with no statuses. Before, that death fired nothing but the killer's On Kill.
- Claude's calls: on that first death, nothing replaces the body (no Relic 1/1, Crystallise crystal or Meiosis split; the final death still leaves the Relic). On Death: Spawn tokens go beside it. Its equipment stays; its Prayer tokens go. Loops: Revive is once per unit, and its death's triggers are ordinary trigger layers, so any revive chain stops at layer 5.
- **Rescue is no death.** Shield Call (the ally steps aside) and Guardian are the rescue-like effects today. Neither fires any death effect, and the rescued unit's Revive stays unspent.
- On the board, the death a revive follows keeps its tile (no topple). The log reads "X died." then "X rises again at 1 Health! ✨". The Revive skill text says it dies in full.
- **Quiet Contemplation**, a new field on the Cathedral Eagle's fight (21-6): "Nothing happens twice." It turns off the **doubling** effects: Headwind, Twin Strike, Frenzy's second swing, Twin Shot's second arrow, Twin, Echoing Wood, Crit, Expose's crit, Rage ×2, Mighty ×2, Tall Grass ×2, Supreme Tide and Double Time. It also turns off the **re-enablement** effects: the extra turns of Fast Forward, the Tailwind spell, the wind's Tailwind and Quick Attack, and Second Pitch. It is an Environment card (🧘), an Edit skirmish option and an Effects library entry. The Map Codex and the Codex book list everything it blocks; the book's field pages now show each field's Codex line. Each blocked event logs "🧘 Quiet Contemplation stills X."
- Stated rules in `docs/decisions.json` (2026-10-19, replacing "Revive is not a death"), with `decisions.md` regenerated. 7 texts are TX keys in all 12 packs (`tools/i18n_2026_10_19_rv.py`).
- `card-matrix` golden re-accepted: 69 of 25,960 fights changed (Cinder Skeleton 44, Sea Turtle Elder 15, Ember Revenant 6, squads/matches 4). In each, the only change is one more `death` event (the Revive death). No winner, round count or Health changed.
- Tests: `tests/rv-2026-10-19.js` (in run-all); `engine-parity` updated (a revived kill counts as a kill now).

## 2026-10-19 (package HN: nothing to heal, nothing happens)
- **Owner (00:07): "Healing & the like: if there's nothing to heal, it doesn't occur, and no animation plays."** Most heal kinds already made no event at full Health. Two still showed something. A **Heal or Rebuild trigger** with nothing to heal (e.g. Forager Ant / Bee Forager's On Attack Heal 1 at full Health) still flashed its trigger rune and took a 0.3 s beat. A **Cure of 0** still made an event. Now neither does, and a "once" Heal trigger isn't used up until there is something to heal (one that paid a cost, Burn 1 Lumber, still counts as gone off). The engine counts the heals that changed something (`healWork` in `applyHeal` / `rebuildCastle`), so this works the same with or without recorded events.
- **The board skips any 0-amount heal event** (`emptyHealEvent` in `arena_app.js`: heal, Leech, Rebuild, the bramble's regen, Herb Refinery, Carrion, Spring Rain, stanch, Cure): no look, no sound, no float, no beat, no battle-log line. This covers the live fight, the round replay, the match-history log and old saved fights. A Mend spell with no one hurt plays no green heal look (FX.A). A banana eaten only to stanch Bleed no longer says "(+0 Health)".
- **Bleed counts as something to heal** (the recommended choice). A heal on a full-Health unit that Bleeds stanches it: you see only the Bleed coming off (🩹 -N 🩸), with no green heal, no "+0" and no heal triggers. Regeneration keeps the owner's 2026-10-14 rule: at full Health it doesn't stanch either.
- Recorded as a stated rule in `docs/decisions.json` (2026-10-19), with `decisions.md` regenerated. `tests/hn-2026-10-19.js` checks every heal kind at full Health, partial heals, the Bleed case, real heal cards and the app side. `card-matrix`: 0 golden diffs.
## 2026-10-18 late (package DK: dungeon keys are spent, Sweep uses keys, the Key ring, Upgrades tabs)
- **Fix: playing a daily dungeon now uses your key** (owner 23:54: "Playing a dungeon right now doesn't consume my key. It should."). The cause was the 10-16 rule: the key was taken when the fight started, and a won floor gave it back, so a winning climb never used one.
  - Now every floor fight uses a 🗝️ key when it starts, win or lose. Nothing comes back. A lost or forfeited floor still sends the climb back to floor 1.
  - The toast says "A Dungeon key used: N left". The results no longer show "+1 Dungeon key".
  - The admin skirmish test and "jump to progress" tools still skip the key and the Energy.
- **0 keys:** the floor's Fight button, Play again and the next-floor button are greyed. Pressing one gives the reason: "No Dungeon keys left. They fill up to N in Hh." "🗝️ N left" sits under the Fight button. The map headline and the Dungeons tab show "Dungeon keys: N/cap".
- **Sweep uses keys** (owner: "I can't sweep past the number of keys I have"). Package Z made Sweep keyless. Each Sweep run now uses a key, checked before its Energy. The Sweep menu offers no more runs than the keys you hold. With 0 keys it offers none and gives the reason. The Dungeons tab's 🧹 Sweep is greyed. The results say "Dungeon keys used: N (M left)".
- **Key refill:** each new day fills your keys up to your cap. It was one more key a day, banking up to 3. Keys above the cap are kept, and the Monday bonus can still sit one over it.
- **The Forge's 🗝️ Key ring** (owner: "Forge lets you increase the number of keys to 5 (but requires Strange Materia)"). The cap starts at 3. The Key ring raises it in two steps:
  - to 4: 🔮 1 Strange Materia, 800 Maple Leaves, 400 Magic Dust;
  - to 5: 🔮 1 Strange Materia, 2,000 Maple Leaves, 1,000 Magic Dust.
  - The row shows once a daily dungeon is open. Admin Mode skips the Strange Materia, as it does for the Forge tiers.
  - The cap is saved as `bramblewood_dungeon_key_cap_v1` and is in the synced progress blob, where the larger of two copies wins. No SQL is needed: `player_progress.data` is a blob.
- **Upgrades tabs** (owner 00:08: "The forge upgrades on your profile (and nest etc., tavern upgrades) should be on another tab in each of their own respective pages"). The Profile never listed them: they sat at the top of each place's page. Now each place has its own ⬆️ Upgrades tab:
  - **Forge:** a ⬆️ Upgrades mode tab beside Upgrade / Refine / Blacksmith / Brambles / Enchant. It holds the Forge tier, the Forge's Max Energy steps and the Key ring. They are no longer above every Forge tab.
  - **Nest:** 🪺 Cards and eggs | ⬆️ Upgrades. The Upgrades tab holds its Max Energy steps and a "build the next nest" row. The hay's 🔨 build spot is still there too.
  - **Tavern:** 🤝 Recruit | ⬆️ Upgrades, with its Max Energy steps.
  - A red dot on a tab means an upgrade there can be bought now.
  - **Profile:** a new ⬆️ Upgrades panel has one row per open place, e.g. "The Forge · 2/10 upgrades · one is ready". A row opens that place's Upgrades tab.
- Texts are TX keys (39 new; 5 retired: the 10-16 "key in the lock / win gives it back / key back / key lost" lines and the old no-keys toast). They are in all 12 packs via `tools/i18n_2026_10_19_dungeon_keys.py`, which also drops the dead pack and `lang/ui` rows. Test: `tests/dk-2026-10-19.js` (161 checks, in run-all). `tests/z-2026-10-18.js` now checks that a Sweep uses a key.

## 2026-10-19 (package FZ: Freeze before its turn, Confuse on everything)
- **Frozen before its turn = no action** (owner 23:32). A unit frozen earlier in the round (an earlier unit's Freeze or Ice Arrow) used to swing anyway, then lose the next round. Now it skips that action (swing or shot, with its On Attack and on-hit skills), logged once. The freeze is then spent: it melts at round end, so Freeze N costs N actions. Frozen after it acted, it still skips its next round. A freeze laid before the round (e.g. an Ambush during deploy) now costs 1 action, not 2.
- **Confused: 1 in 2 that each trigger, skill and action fails** (owner 23:32). It used to hit only triggers and on-hit skills. Now the swing, shots, reserve strike, Counterattack, Sentry and Ambush strikes each roll too, with the match's seeded random. A fumble does nothing and logs "😵 X is confused and fumbles." A fumbled swing is no swing (no On Attack, on-hit skills or Bleed tick). The Confused gloss (Codex, tooltips) and coach tip say "half the time, its triggers, skills and actions fail." 3 texts are in all 12 packs (`tools/i18n_2026_10_19_fz.py`).
- **CPU**: the smartest slot choice counts a Confused enemy's swing as a half threat (`aiSwingOdds`), and a Confused killer is not "doomed" for the Sacrifice timing.
- `docs/decisions.json` / `decisions.md`: stated rules for 2026-10-19 (Freeze, Confuse).
- `card-matrix` golden re-accepted: 295 of 25,960 fights changed (142 Freeze timing, 103 Confuse fumbles, the rest freeze melt timing and 18 full matches), 63 with a different winner.
- Tests: `tests/fz-2026-10-19.js` (in run-all) and an `engine-parity` check (the smartest CPU faces the Confused one of two killers).
## 2026-10-18 late (RW follow-up: the XP bar on the reward screens)
- **The reward screens show your XP bar filling up at the top, and the XP toasts are gone there** (owner 23:32: "Should the reward screen show the exp bar filling up on the top? Then we can remove the toast.").
  - Where: every Victory card (skirmish, boss crimson, the Spire ascent, any won fight except hot-seat and the tutorial) and the raid claim screen.
  - It shows "Level N", the bar and "+N XP", and fills with the fight's XP. That includes the first-clear milestone that lands a moment later.
  - On each level crossed it bursts, "Level N!" pops on the bar (with the heroLevel sound), the number steps up and the bar fills on from empty.
  - On the claim screen the bar fills as the XP reward comes up. A skip fills it to the end.
  - Reduced motion or Effects Low: the end state with a short fade.
- **No XP toast while the bar shows.** That covers the "Level N" toast, the "+25 XP — First clear" milestone toast and the level badge's own level-up moment. Everywhere else (quests, milestones away from a reward screen, closing the results to look at the board) they stay as before.
- Code: `xpBarSpec`, `rewardXpBarHTML`, `syncRewardXpBar`, `rewardXpBarUp` and `m.xpBefore`, set when the result is decided; `awardXp` and `checkXpMilestones` (`arena_app.js`). `FX.F.xpBarHTML` and `FX.F.xpBarFill` (`bramblewood-fx-f.js`).
- Effects Lab: `res-xp-bar` (A a level-up, B a plain fill, C calm); the raid claim entries now carry the bar. Four TX keys (`results.xp-*`) are in all 12 packs, and `tests/reward-screens-2026-10-19.js` covers it (132 checks).

## 2026-10-18 late (package LG: Legendary abilities; True Strike vs Legendary dodges)
- **Legendary abilities** (owner 23:05: "typically not given to cards players can get (except dragons)"): True Strike, Supreme and Supreme Tide are marked `legendary: true` (PASSIVE_DEFS / SKILL_DEFS, `canonical/skill-costs.json`; costs unchanged). Each shows a gold **Legendary** tag after its name on the card's line, e.g. the White Dragon's True Strike, and in the Skills Codex (the filter finds "legendary"). The card's glossary adds: "Legendary ability: A legendary power. Rarely found on cards you can own — dragons are the exception."
- **True Strike vs Legendary dodges**: True Strike still ignores every plain miss and dodge, Illusory included (owner: "the illusory dodge is a token thing anyway"). A Legendary dodge still rolls against it. No dodge is Legendary yet. The hook is in `bramblewood-engine.js`: `legendaryDodge(reason, value)` is true for a source listed in `LEGENDARY_DODGES` or an effect value carrying `legendary: true` (e.g. `evasive: {legendary: true}`, `illusory: {chance, legendary: true}`), in melee (`combatHitLands`) and for shots and skills (`dodgeCheck`). The CPU's True Strike pick no longer counts Legendary dodgers. True Strike still draws no random numbers unless a Legendary dodge is in play, so `card-matrix` has 0 golden diffs.
- The True Strike Codex note now says "only a Legendary dodge can". 4 texts (3 new TX keys and the re-keyed note) are in all 12 packs.
- `docs/decisions.json` (and the generated `decisions.md`) has a stated-rules section for 23:05. Shadow of the Valley of Death is a very far future map, so the Pall Wraith stays in the Eye of the Volcano (20-A-2) until it exists. It also records the Legendary rules.
- Test: `tests/legendary-2026-10-19.js` (93 checks, in run-all).
## 2026-10-19 (package RX: raid targeting, the stuck play animation, reward contrast, allies' hand plays, an easier raid)

- **Raids target the closest row.** Every unit in all three rows, on both sides, strikes the nearest enemy in its own column: the front row first, then the middle, then the back. It hits the bramble only when no row in that column holds a unit it can hit. Cages and Invisible units are passed over, and Flying and the other dodges still roll. Sweep side hits and Wave pushes stay on front-row targets. A unit that falls in a middle or back row is cleared from the board with a death event. The trench already rolled through to the closest row, so it is unchanged. The engine change is limited to the reserve rows (`rowTargetAt`, `reserveStrike`, the RESERVE_ACTS swing fallback, `sweepDeadReserves`).
- **A played card no longer gets stuck small and see-through mid-drop.** Root cause: card entrances and hand flights run on GSAP's frame clock, and lag smoothing (500 ms / 33 ms outside combat) counts any long frame as 33 ms. On a slow raid board the card stayed at the start of its drop. A 200 ms timer watchdog (`playAnimWatchdog`) now finishes any entrance, flight or landing squash that runs past its length, shows a card left hidden, and removes a leftover flight copy.
- **The raid reward text can be read.** The reward pills on the raid results were fixed dark brown on the theme surface, 1.15:1 in dark mode. They now use the theme's ink: 12.6:1 in dark and 10.8:1 in light. The line under the title was 1.2:1 on the purple card in light mode and is now cream, about 16:1.
- **Allies play from their hand.** A CPU ally's card now flies in from just below its row label and fades in partway along the path. It lands with the normal hand-play landing. Under reduced motion or Low effects it fades in where it stands, and with Effects None nothing plays. `allyPlayFx(uid, {mode:'raid'|'tagteam'})` is the hook for tag-team partners.
- **The raid eases down to your hand** once it loads (600 ms, once per fight). It jumps instead under reduced motion and stops if you scroll yourself.
- **A defeated raid says when it returns:** "🌊 The Goliath returns in 3d 8h", with the local date and time on hover. The respawn time comes from one helper, `raidRespawnAt`.
- **Leader cost cap:** a raid's `leaderCostCap` counts each Lumber in the leader's cost as 1 point, each Stone as 2 and each Metal as 3. The Goliath's cap is 5. The raid tab shows your leader against the cap with a "Change leader" button, and the picker greys out leaders over the cap with the reason ("Leader cost 6/5 — too costly for this raid"). The fight won't start with an over-cap leader. The cap is editable in the raid editor.
- **Play rows** (`playRows: 'own' | 'any'`, default 'own'): `matchPlayRows` / `playRowsOf` / `playRowsSelectHTML` are enforced in the reserve-row targets and in `playCardByUid`. There are no tag-team dungeons in the code yet, so no dungeon carries the field.
- **The raid is easier** (owner: "Make normal decks able to do some damage"). Measured with the new `tools/raid_full_sim.js`, which plays the page's own fight build (`buildRaidFullFight`, split out of `startRaidFullBattle`):
  - The fight's boss bramble is the part's own 420 again. It had been reading the trench's 1250.
  - The Goliath's new `tuning`: boss cards at 35% Attack and 25% Health (were 60% / 70%), both allies play every turn, the raiders' bramble +60, and Commons are called in once every 3 turns, 1 at a time.
  - `minDamage` (the first paying tier) went from 120 to 40.
  - Results at 20 turns, outer parts: a Map 6 deck survives all 20 turns, deals 64–85, and reaches the tier 50–75% of the time. A Map 10 deck deals 71–124 and reaches it 65–95%. The starter deck deals 26–47 and reaches it 20–50%. A Map 20 deck deals 141–219 and overwhelms 0–5%.
  - Before (fresh raid), every deck dealt 0–14 and died by turn 7–13.
- Texts: 12 new TX keys, in all 12 packs (`tools/i18n_2026_10_19_rx.py`). Test: `tests/raid-rx-2026-10-19.js` (in run-all).

## 2026-10-18 late (package C follow-up: filter the Codex by skill)
- **✨ Skills filter in Codex Browse** (owner 23:21: "add a way to filter by skills in codex"). It works in the album, Compressed and Full Art views.
  - The button sits with the other filters and opens a panel of every skill you have seen, each with its icon (admins see all).
  - Pick one or more. The Codex then shows only cards that have **all** the skills picked, so each pick narrows the list.
  - The picks show under the toolbar as removable chips with a Clear button. They count in the ⚙️ Filters badge and are kept between visits like rarity and sort.
  - The panel is built only when first opened, and a pick redraws only the open page.
- **The skills book's skill entries have "🔎 Show cards with this skill"**. It opens Browse with just that skill picked. The search box is emptied and the other filters are kept.
- 7 new TX keys in all 12 packs (`tools/i18n_2026_10_18_codexbook.py`). `tests/codex-book-2026-10-19.js` section 9 covers it.

## 2026-10-18 late (RW follow-up: the Babel Spire's Victory card)
- **A new Babel Spire floor won has its own Victory card** (owner 23:20: "The victory screen for Towers should be very slightly different as well. It's triumphant to know that your deck has reached the next tier.").
  - The card is cool sky and stone-gold: a notch below the boss crimson, and different from the gold card.
  - Under the title is the ascent line. A little tower shows the floor you cleared lit, and a beam climbs to the next one, which glows. It reads "Floor N cleared → Floor N+1" and "Your deck climbs to the next tier."; floor 50 says "the top of the Spire!".
  - When it opens, a light column rises from the lit floor, with sparks and a rising swell (`FX.F.towerAscend`).
  - Under reduced motion or Effects Low the beam stands still and there is no column. Every text is light on dark blue (AA or better) in both themes.
  - Spire Keeper floors (every tenth) get this card too, not the boss crimson.
  - **A free replay of a cleared floor** (0 reward) keeps the ordinary card with its replay line.
- Code: `isTowerResults`, `towerResultsFloor` and `towerAscentHTML` (`arena_app.js`); `.winloss-card.is-glory.is-tower` and `.wl-ascent` (`arena_template.html`); `FX.F.towerAscend` (`bramblewood-fx-f.js`). `isBossResults` leaves Spire floors out.
- Effects Lab: `res-tower-ascent` (A floor 12, B floor 50, C still, D the replay's ordinary card), with an inventory row. Three new TX keys (`results.tower-step-*`), in all 12 packs (`tools/i18n_2026_10_18rw.py`). `tests/reward-screens-2026-10-19.js` covers it.

## 2026-10-18 late (Package BP: wind on the wing, a quicker leader moment, night lines, Stampede's line, the log at the bottom)
- **Wind lights the wing** (owner 21:54 / 21:56): under a strong wind a Flyer's 🪽 gets the same lit blue pill a Tide unit's wave gets on Flood. Tailwind side (the side the wind blows from: an extra quick turn before combat) also shows a lit 👢 Quick boot, so the card reads wing + quick. Headwind side (its skills and triggers go off twice) shows the wing with a small ×2. Calm rounds, no wind and Ashy (Flyers grounded) show nothing. The marks change as the wind is announced mid-replay (`liveWindState`, `syncWindBadges`; tooltips are TX keys `ui.wind-*`). Note: the engine gives the extra turn on the **Tailwind** side, not the Headwind side.
- **Leader summon** ("fade 20% faster ... next queued animation 25% faster"): the "👑 <Leader> joins the fight!" callout runs 1.92 s (`LEADER_CALLOUT_MS`, ×0.8 of 2.4 s, its fade included), and the round's queue now waits `LEADER_THRONE_WAIT_MS` (×0.75 of the 1.7 s throne moment, so 1.275 s) before the next animation. The drop, ring, crown and beam still play in full.
- **Hover lines at night** ("When it's night, hovering over a card doesn't show its lines anymore"): no night rule hides the lines, and the night layers don't take the pointer. The hover check ran only once, as the pointer arrived, and gave up for good if the card or its art was still landing or being nudged. At night that happened far more: the board renders slower under the night filter (2 fps against 8 fps by day, measured headless), so entrances and neighbour shoves run longer. Now a busy card is retried every 120 ms while the pointer stays on it (up to 4 s), and moving inside a card redraws lines that a board re-render wiped.
- **Stampede (Trample)**: its carry-over number pops on the field's HP bar, the same spot as every other bramble hit (Puncture's too); it used to pop on the bramble tile under the board. Its preview line now goes on from the blocker to the enemy HP bar: faint always, so the skill reads, and lit orange with `💥 +N` when the swing as it stands would kill the blocker with damage to spare (shown Attack − blocker Armor − blocker Health). It needs one blocker; with a half swing on two, the plain lines stay.
- **Battle log opens at the bottom** ("should start from the bottom! the latest!"): opening the log used to scroll before the panel was shown, so it opened on the oldest line. It now opens on the newest line and stays pinned as lines arrive. If you scroll up to read, it leaves you there; scroll back to the bottom and it follows again. A board re-render keeps your place. A past match's log (Profile) opens on its last line too, and a card's own "Battle log" lines in its hover now read oldest first, newest at the bottom.
- Tests: `tests/bp-2026-10-19.js` (60 checks: wind sides and rules, the ×0.8 / ×0.75 constants, no night checks in the hover path plus the retry, Stampede's math, anchor and line, the log pin).
## 2026-10-18 (package PD: the Pale Desert, side map 18-A)
- **New side map: The Pale Desert** (owner 20:55: "Add the submap that we and codex suggested, the pale desert. Locked till Map 18 is complete.").
  - It is a side map of Map 18, the Glass Dunes. Its entrance, "The pale sands", sits after 18-7.
  - It shows the standard lock, "Clear The Glass Dunes (Map 18) to open", until every Map 18 fight is won.
  - The land is a bleached, bone-white sand sea under a white sun, with no glass or obsidian. Its field rules are existing ones only: Scorching 1–2 in every fight, Sandstorm and Mirage. Quicksand is the boss's own Trap and Tangle.
- **Nine fights:** 7 skirmishes, the elite The Dry Well, and the boss The Quicksand Queen. The boss defends The Last Oasis, a new bramble (Regeneration 1), and her first win gives it to you.
  - Each fight gives a card reward, Gold and Dust. Six of the reward cards had no source until now: Rabid Jackal, Dust-devil Kestrel, Meerkat Burrower, Stonedrop Vulture, Glowing Gecko and Dust Hyena.
  - Balanced with `simulateReferenceFight` against the Map 18 reference deck (Lv 4) on the owner's new curve, 120 games a fight: 90.0 / 91.7 / 79.2 / 75.0 / 70.0 / 66.7 / 59.2 %, the elite 60.8 % and the boss 41.7 %. All are green (±8; the boss band is 30–49 %).
  - Fresh seeds give 89–58 % and 43 %. The stored result is `docs/balance/pale-desert-2026-10-19.json`.
- **Three new cards**, none with art yet (they show their emoji):
  - 🦎 Sandfish: Common, 3/11, Dry, Invisible 2;
  - 🦌 Pale Oryx: Uncommon, 3/17, Dry, Pierce;
  - 🐜 Quicksand Queen: Very Rare, 3/28, Dry, Trap 6, Tangle 1.

  All three are in budget v3 and their card-balance bands. Their skills read "?" until Map 18 is cleared (`revealAfter`).
- **Look:**
  - a pale-sand map background (`tools/make_map_backgrounds.py mpd`);
  - the battlefield `map-mpd`, with a white-sun glare and heat haze;
  - the map theme, its own emblem (sun, dune, skull), the desert music and sound, the map ambience (`FX.E` paledesert) and the heat-shimmer shader.
- **Texts:** the map's words are 21 TX keys (`map.mpd-*`, applied by `applyPaleDesertTexts`). All texts and card names are in the 12 packs (`tools/i18n_2026_10_19_pale_desert.py`).
- **Tests:**
  - `tests/pale-desert-2026-10-19.js` (new, in run-all);
  - `tests/node-ids-2026-10-14.js` accepts side-map keys born after the rename;
  - the card-matrix golden is re-baselined.
- Docs: `docs/pale-desert-2026-10-19.md`.
## 2026-10-18 (MB: phone map buttons, Home on the full-screen map)
- **Full-screen button back on its row (phones):** on the Conquest and Daily Dungeon maps, ⛶ sits on the 🧭 World row again, at the right end; 🚨 Admin is under it. A 2026-10-13 fix had moved ⛶ down onto the Admin button's spot, so with Admin Mode on the two were stacked. ⛶ steps down only while the map strip is hidden (world not open yet), where it would sit on the Energy pill; 🚨 then goes under it.
- **Home on the full-screen map:** full screen (⛶) hides the header and the 🏠 / ⚙️ / Energy row, which left phones with no way Home. A 🏠 now sits left of 🧭 while the map is full screen. It goes where the header's Home goes and turns full screen off. Its label is the TX key `ui.back-to-home` ("Back to Home", already in all 12 packs).
- Checked in Chromium at 360, 390, 414 and 480 px portrait and 640 to 896 px landscape, Admin Mode on and off. Every other screen already had a reachable Home on phones. New test `tests/mobile-nav-2026-10-19.js`.

## 2026-10-18 (package NA: Grotto Lobster and Amber Cicada, the owner's art)
- **New card: Grotto Lobster** 🦞 (Rare, 1 Lumber, Wait 2, 3/12). Armor 1, Crab Claws, Darksight and Brood 1: its crablings hatch beside it. It is the second card reward of 2-B-3 The Glowing Pool (Smugglers' Grotto, the sea cave off Pebble Beach).
- **New card: Amber Cicada** 🦗 (Uncommon, 1 Lumber, Wait 3, 3/20). It spends three rounds underground (Wait 3). On Ready, its song gives every ally 2 Shield. It also has Scare 1. It is the second card reward of 1-2 Cricket Chorus (Thistlewood, Map 1). There is no cicada emoji, so it uses the cricket.
- Both fit budget v3 (Lobster: N 43.4, S 3, 21 < 43.4 and 39 < 209.3; Cicada: N 50.9, S 3, 29 < 50.9 and 63 < 287.9). Both are inside their rarity band in `tools/card_balance.js` at 120 games: Lobster 64.2% (Rare 52–75%), Cicada 60.0% (Uncommon 45–68%).
- Names are translated in all 12 card packs (`lang/cards`), flavour lines in all 12 `lang/ui` packs. Art: `art/cards/grotto-lobster.png`, `art/cards/amber-cicada.png` (256 px, 256 colours), embedded in cards.json, plus the built `assets/cards/*.webp`.
- Neither card is in an enemy deck yet, because the map decks are being retuned. Suggested placements: the Lobster in 2-B-3 / 2-B-4, the Cicada in 1-2.

## 2026-10-18 (RW: the raid claim screen, crimson boss results)
- **Claiming a raid reward opens its own reward screen** (owner 20:52: "The Raid Claim button → screen should be doubly more exciting than the skirmish reward screen"). It replaces the old toast.
  - The boss looms out of the deep (the Goliath's portrait, huge and dim), and a pressure burst opens the screen: a flash, a water shockwave, an ink cloud and a column of bubbles. Light rays drift and bubbles rise behind it.
  - The title slams in ("The Goliath has fallen!" or "… survived the week"). Your standing (Top 1% / 10% / 50% / Participant) stamps down as a badge, and your raid damage counts up.
  - Then every reward comes one by one: XP, the currencies, the raid cards (as cards) and a title. They come in rising rarity, and each beat is bigger than the last, with more particles and layered SoundKit cues (a bubble, then coins, a chime, the rare rise, and finally the legendary rise with a fanfare and a boom). The top reward shakes the screen.
  - A tap, Space, Enter or Esc skips to the end. **Collect** (or Esc again) closes it.
  - With reduced motion, Effects Off or Low, or no GSAP, you get the calm version: the same screen with fades only.
  - It fits a phone. The XP level-up waits until the screen closes, and the raid-card toast is gone because the screen shows the cards.
- **Boss victories are crimson** (owner: "the boss reward screen should be more crimsony"). A won boss, sub-boss, Campaign Boss, or world or raid boss on the map gets a deep-red Victory card. It has a crimson and ember frame, a title that glows like a coal, crimson rays and embers drifting up, plus an ember burst when it opens. Under reduced motion or Effects Low the embers stay still.
  - Elites, champions, mini-bosses, dungeon floors and raids keep their own look. Every text stays light on dark red (AA or better) in both themes.
- Effects Lab: `res-raid-claim-screen` (A Top 1%, B Top 50%, C compensation, D calm) and `res-boss-crimson` (A the card with its burst, B still, C the ordinary card to compare) (`tools/effects-lab/manifest/rw.js`, inventory rows added).
- Code: `FX.F.raidClaimScreen` and `FX.F.bossVictory` (`bramblewood-fx-f.js`); `claimRaidReward`, `raidClaimScreenSpec`, `showRaidClaimScreen`, `isBossResults` and `bossEmbersHTML` (`arena_app.js`); `.winloss-card.is-glory.is-boss` (`arena_template.html`).
- Texts: 14 new TX keys (`results.raid-claim-*`, `results.raid-tier-*`), in all 12 packs via `tools/i18n_2026_10_18rw.py`. Test: `tests/reward-screens-2026-10-19.js` (in run-all).

## 2026-10-18 late (Package M follow-up: the Ebb grows into the Flood, and laps)
- **One body of water** (owner 21:59: "The ebb effect should grow into the tide effect; currently they cancel each other."): the tilt used to hit full strength on the first frame, pivoting on the board's left edge, so as a Flood started the Ebb band dropped off the board everywhere but its left ~90px, and the caustics blinked out. Now the water level slides (`translate`) while the tilt ramps in and back out, pivoting on the right edge. The Ebb band rises whole and grows into the Flood, the left still leading; a Flood recedes into the band the same way, the left draining first. The crest's surge and the foam build up from rest, and the caustics fade out over half a second instead of blinking (back in once settled, as before). Measured (seeked, 1248×401 board), on the first frame of Ebb → Flood the water line at the right edge was at y 563 (below the board, at 401), now 391.
- **The Ebb laps and drifts** ("It's too static."): once settled, the band laps in and out (`TIDE_EBB_LAP`, 6px) and drifts side to side (`TIDE_EBB_DRIFT`, 10px), in uneven steps over 8.6 s against the 4px, 6 s slosh. Measured over 17 s: in/out 4.0 → 10.6px peak to peak, side to side 0 → 20px, 6 → 12 turns. The water reaches 24px past the board's sides, so the drift shows no gap.
- **The Ebb sits a little lower** ("its centre position should be placed a little lower"): `TIDE_EBB_OFFSET`, 3px (about 10% of the band and its crest); the band's top is at y 391, was 388.
- Low effects, Minimal and reduced motion keep it still, as before. Effects Lab: `wt-tide-ebb` F / G (the settled Ebb now / as it was); D variants relabelled. Tests: `tests/m-2026-10-19.js` (51 checks); `visuals-2026-10-18.js` and `x2-2026-10-18.js` read the new move and fade.
## 2026-10-19 (package F: text filters reset; emoji sets refreshed)
- **Search and filter boxes now start empty** (owner 21:18: "The text filters ... don't reset when I refresh ... or when I move between pages"). A reload, a return from Chrome's back/forward cache (`pageshow`), a new tab or a new Codex / Play sub-tab empties every text filter and redraws its list unfiltered. Redrawing the same page keeps what you typed.
  - Boxes: Codex search, Skill Codex filter, Forge search, Camp card-pool search, Flea Market search, Friends search, Sandbox spawn search, Admin card search, the sim pools, the Test Kit's two searches, the Effects library, and the editor / picker popups (deck picker, loadout, starter deck, node rewards, skirmish / raid editors, skirmish gallery, dialogue editor). Each one is marked `data-text-filter` with `autocomplete="off"`.
  - **Kept on purpose:** the sticky filters the owner asked for on 2026-10-16 still remember the non-text choices: Codex sort / direction / type / line / view mode / separate / all-by-ID, Forge filter / sort / deck, Flea Market rarity / sort, and the Camp's type / kind / level / sort. Only the free-text query (`q`, `deckSearch`) is no longer saved or read back.
  - Code: `resetTextFilters(root)`, `resetTextFilterState()` and `syncTextFilterPage()` next to `uiSticky` in arena_app.js. `switchTab`, `renderCodex` and `renderPlay` call `syncTextFilterPage()`.
- **Emoji sets refreshed.** Added 11 emoji the game used but didn't ship, which drew as the system emoji: 🐪 (the Dromedary), 🐻‍❄️, 🍎, 🗓️, 🚧, 🥒, 🧀, 🧵, 🧶, 🫐, and 💯 (package D's True Strike, found by the new check after merging main). `used.json` now has 550, and the Fluent, Twemoji and Noto sets and sheets were rebuilt. The pictures already in the sets are byte-identical.
  - `scan_emoji.js` now also reads `lang/cards` and `lang/ui`, and decodes `\ufe0f` escapes. cards.json writes 🐻‍❄️ escaped, and the ZWJ sequence was missed without its FE0F.
  - `tests/emoji-atlas-2026-10-18.js` now fails when any card's emoji, or any emoji in the code, texts or lang packs, is missing from `used.json` or from a set.
- Tests: `tests/filters-2026-10-19.js` (run-all) and `tests/e2e/filters_2026_10_19.py` (`--e2e`; Chromium: typed Codex / Skill Codex / Camp filters are gone after a reload and after a page switch, a non-text sort stays).
## 2026-10-18 (package C: the Codex as a card album and a skills book, the collection score)
- **The Codex's Browse tab is a card album** (owner 20:31: "bestiary - look like a card album"). It is now the default view (View: Album; Compressed and Full Art are still in the list).
  - Album pages hold card sleeves, 3 × 3 to a page. A wide screen shows two pages side by side with a ring spine. A tablet shows one 3 × 3 page, and a phone one 2 × 3 page.
  - Each section (the Separated bands, or an admin's View by) starts on a new page. The page header shows the section's name, "N seen · M owned" and the admin buttons.
  - The album holds only cards you have seen (owner 20:36: "cards dont show up if you havent seen them before"). It is the same list the Codex had: seen, owned, or in a pack whose seller is open. Owned cards show in full and seen-only ones dimmed. revealAfter "?" tiles work as before.
  - Turn the page with ‹ ›, the arrow keys or a sideways swipe, or jump with "Go to section…". The search, type, phylum, archetype and sort filters still apply, plus a new rarity filter. Tapping a card opens its detail as before.
  - Only the open spread is drawn (at most 18 tiles, from the tile cache), and the next spread's tiles are built while the browser is idle.
- **The Skills tab is an open book** (owner: "skills - look like pages in a book"). Wide screens show two facing parchment pages, phones one. Page 1 is the contents: chapters with page numbers and an A to Z index. Then come the Skills, Statuses (package D's glossary) and Field effects chapters. Each entry is laid out like a field guide: icon, name, the Codex text (with package D's longer notes), and what answers it. A status is in the book once a skill you've seen names it, or it was put on a unit in a fight.
  - Pages are packed by measuring each entry at the page's real width, translated, so long languages still fit. The filter rebuilds the book from what matches.
  - Turn the page with the buttons, the arrow keys or a swipe. The page turn is a leaf lifting off at the spine, using transform only. There is none with reduced motion or Low/None effects.
  - **Seen rule:** a skill is in the book once it is on a card you have seen or it was met in a fight (its coach tip). A field effect appears once you have seen it happen. SKILL_REVEAL and revealAfter still hide what they hide.
  - **Basic-skill hints:** 8 basic skills (Flying, Taunt, Armor, Shield, Poison, Bleed, Thorns, Stealth) show as a "?" entry once you reach the first map that brings them, and fill in once seen.
- **Collection score**, at the bottom of every Codex tab and on the Profile next to the Achievements card. The score is the game's Collection level: every card you own, added up by its Forge level, out of 10 a card. It counts only what you own. Next to it: cards owned, brambles owned, achievements claimed, and how many are ready to claim (tap to open Achievements).
- **Seen cards follow the account.** `bramblewood_arena_seen` is in the progress blob, merged as a union like the discoveries. Every save is migrated once (`bramblewood_arena_seen_v2`): cards owned or unlocked, discoveries and every enemy deck of a cleared fight (the tutorial's too) count as seen.
- **Open time** (all cards seen, 1366 × 900). The old and new builds were timed side by side on the same, heavily loaded box: median of 5, 1× CPU. Opening Browse: first frame 11.6 s → 10.3 s, long tasks 5.2 s → 2.7 s. Opening Skills: 7.1 s → 4.6 s, long tasks 3.8 s → 1.4 s. Next page: 23.7 s → 13.4 s. The absolute times are the load; read the ratios. On a quieter box earlier the old Codex opened in 1.1 s (1×) / 1.9 s (4×). The score bar is drawn just after the first frame, and the book's entries are kept between visits. `tests/e2e/codex_perf.py` now times the album and still checks the Compressed grid; `tests/e2e/emoji_perf.py` uses the Compressed grid.
- **Texts:** 32 new TX keys (`ui.codex-*`, `ui.book-*`, `ui.score-*`), translated in all 12 packs by `tools/i18n_2026_10_18_codexbook.py`. `skillCodexHTML` and its filter are replaced by the book. `tests/codex-book-2026-10-19.js` is in run-all.

## 2026-10-18 evening: Bug Hunters in the feedback window

- The 💬 feedback window has a 🐞 Bug Hunters box (owner 21:57): pick 🐞 Bug and say how to make it happen again; the first report of each confirmed bug earns 🍁 Maple Leaves, big finds earn more, and top hunters earn the 🐞 Bug Hunter title. Rewards are granted by hand for now (nothing automatic). TX keys `fb.bughunt-*`, translated in all 12 packs (`tools/i18n_2026_10_19_bughunt.py`).
## 2026-10-18 (package D: Cast Darkness, True Strike, Sleep cap, terse descriptions)
- **New card: 🌑 Pall Wraith** (Rare Undead, 5/15, Wait 1, 1 Lumber; Cast Darkness + Darksight). Flavour: "It walks through the valley of the shadow, and brings the shadow with it." No map is called "the Shadow of the Valley of Death", so it joined the dead of the Eye of the Volcano: two in the 20-A-2 Wraith Vents deck (one Ghoul and one Skeleton out) and that fight's card reward. Budget v3: N 35.9, 2A+H+S = 28, A·H+S = 78 < 143.2. No art yet: it shows its emoji (NightCafe later).
- **Cast Darkness** (`effects.castDarkness`): while the unit stands on either board, the fight has Darkness (level 1) as if the map had it. It lifts when the unit dies or leaves. A fight already dark of its own (Darkness, Pitch Black, Absolute) keeps its own level. The engine works it out from the board (`darkRule`), so combat, the CPU, the Environment card, the dark veil and the shut eye on dark-blind units all follow it. The log says "🌘 X casts Darkness over the field." and "The cast Darkness lifts." The CPU values the card by the swings it would cost each side (`aiDarkCastWorth`). Skill cost 2.
- **True Strike** (`effects.trueStrike`, owner 20:01): its attacks never miss. No Darkness, Blind, Sun-shy or Night-blind miss, and no Evasive, Swift, Flying, Smoke, Fog, Sandstorm, Ashy, Slippery, Shadow, Tide-evade or Illusory dodge. It can't be Blinded. It still can't hit an Invisible unit. Skill effects of its own (Gash, Render, trigger actions) roll their dodges as before. **The White Dragon has it** (stats unchanged; it was already over budget v3 with the other Dragons). Skill cost 2.
- **Sleep N stacks up to N+1** (owner: "never exceeds the applied sleep + 1"): Sleep 2 on a unit asleep for 2 makes 3 and caps there. A deeper sleep is never cut short. The Sleep hit still wakes the target first, as any damage does, and its own Sleep then counts the tokens that hit broke. The card line says "stacking to 3" and the board's 💤 count shows the capped stack.
- **Darkness and Blind look the same way:** the Darkness card says just "Dark-blind creatures miss 1/4 the time." (Pitch Black 1/2, Absolute "every attack"). The Illuminate rule moved to the Map Codex line and the new "Dark-blind" keyword gloss. A dark-blind unit's own card detail says "🌘 Darkness: it misses 1/4 the time." **Blind** shows the eye VFX and a 🕶️ pill (was 👁). When FX B draws the eye, the old 👁 overlay hides, so there is one eye.
- **Terse descriptions** (owner: "Check for descriptions with 20+ words, including numbers. That's too much."): 69 short texts of 20+ words were cut below 20: 23 skill lines, 8 card-detail lines (Equipment, Spell and Tailwind, two Egg lines, Field card, Devour, Ritual), 8 status glosses, live-status lines and tips, and 30 Environment-card lines. What they dropped went to the Codex: a note after the skill in the Skills Codex, a new Statuses section there, and a longer line per field effect in the Map Codex. The 8 Prayer / Ecclesia lines (Needs Prayer N, Lightning's "+1 per 4 Prayer") are left for the package reworking them.
- 131 new TX keys, translated in all 12 packs. Pall Wraith, its flavour and the labels Cast Darkness, True Strike and Dark-blind are in `lang/cards` and `lang/ui`.
- Tests: `tests/d-2026-10-19.js` (in `run-all.sh`) covers all of the above. It also fails if any short description reaches 20 words. Six older tests now read the TX texts instead of the old inline wording.

## 2026-10-18 evening (Package M: the Tide's motion, Pounce at the bramble)
- **The Flood comes in more clearly** (owner 20:45: "The movement during flood should be a bit more obvious during transition."): it tilts in steeper from the left (8°, was 5°), its crest surges higher (2.9×, was 1.9×) with the back foam line bright while it climbs, and as it reaches the top the water swells down into view (40px, under the top border's bunting) and settles back. The Ebb's drain is unchanged.
- **The settled water moves more on Flood, less on Ebb** ("during steady state, 70% more movement than now ... In Ebb ... 20% less"): the slosh is 8.5px on Flood and High Tide (was 5px, ×1.7) and 4px on Ebb (×0.8). The knobs are named in arena_app.js: `TIDE_FLOOD_MOTION`, `TIDE_EBB_MOTION` (and `TIDE_RISE_SKEW`, `TIDE_ARRIVE_SWELL`), passed to the CSS as `--tw-slosh` / `--tw-swell`. Measured in headless Chromium at 1366×900 (board 1248×401, animations seeked frame by frame): Flood slosh 5.0 → 8.5px, Ebb 5.0 → 4.0px, the rise's tilt 5° → 8°, the crest 1.9× → 2.9×, the arrival swell 0 → 46px at its deepest. Transforms and opacity only; Low effects, Minimal and reduced motion still keep the water still.
- **Pounce and the bramble** ("Pounce doesn't hit Bramble, methinks."): checked, and it does. A Pounce hits the unit facing it, else the nearest enemy unit, and the enemy bramble when the enemy has no unit it can hit (also with Pounce ⚔, High Canopy and Tall Grass). In a match: Raven Scout onto an empty board, enemy bramble 30 → 28, "Raven Scout struck the enemy bramble for 2." What it does not do is go for the bramble through an open lane while enemy units stand elsewhere (the 2026-10-15 rule, "Otherwise, next nearest"); that rule is unchanged and the card text already says so. One engine for the game, the CPU and the sims; no rule change, the card matrix is unchanged.
- Effects Lab: `wt-tide-flow` D / E and `wt-tide-ebb` D / E play the standing Tide itself, now and with the old numbers (`manifest/m19.js`; the Tide's functions are in `fx-src-extra.txt`).
- `tests/m-2026-10-19.js` (in `tests/run-all.sh`); `tests/visuals-2026-10-18.js` reads the named tilt.
## 2026-10-19 (package G: guild skills, starting with Rooted Walls)
- **Guild skills** (owner 20:45: "Guild skills. Starting with +raid HP to your bramble."). The Guild tab has a 🌱 Guild skills panel. The guild's owner buys levels with **🌱 Guild Seeds**, which members earn in raid fights: 1 per 500 raid damage, at most 250 a player a week.
- **Rooted Walls** (live): +4% bramble Health in raid fights a level, 5 levels (+20%), costing 30/60/100/150/220 Seeds (560 in all). It adds to the stage's own % (Thrashing −10% + 20% = +10%) in the three-row raid, the single-row raid and the classic trench. The raid panel shows "🌳 Guild: +12% bramble Health".
- Six locked "🔒 Coming soon" skills: Sharpened Thorns, Second Wind, Sap Return, Guild Chest, Ally Banners, Seed Satchel. They do nothing; `GUILD_SKILLS_SHOW_SOON = false` hides them.
- **Needs "apply it":** `supabase/proposed/20261019_guild_skills.sql` adds the tables (member-only reads, no client writes), the Seeds trigger on `raid_week_attempts` and the owner-only `upgrade_guild_skill` RPC (SECURITY DEFINER, spends atomically). Until it is applied the panel is a preview, raid fights get no bonus and nothing can be bought.
- Admin mode can preview levels in its own browser.
- Docs: `docs/guild-skills-2026-10-19.md`. Test: `tests/guild-skills-2026-10-19.js` (in run-all).

## 2026-10-19 (Gameplay ideas: Codex backlog review + our synergies, documents only)
- **Renamed:** the Codex backlog review is now `docs/gameplay-ideas-2026-10-19.md` / `.xlsx` (was codex-backlog-review-2026-10-19).
- **Codex's suggestions checked against the game:** every row of maps.tsv (22), skills.tsv (303) and fields.tsv (77) has a Status (Existing / Needs adjustment / Proposed / Duplicate / Future / Reject), what the game has now with card examples, a verdict and an action. Rows Codex missed are added as *Ours*: 7 skills (Hunter, Kin Rally, Pack Howl, Prayer Ward, Vigil Keeper, Brood Mother, Bolt Master), 5 fields (Blood in the Water, Pollen Drift, Spring Rain on The Canopy, Hallowed Ground, a two-fields-per-fight rule) and a suggestion for Maps 21–24 and the side maps.
- **New Synergies sheet:** 30 ideas of our own, 16 implicit (stats, keywords and fields that combine without naming each other: Rain Conductor, Shatter the Arrivals, Wave into the Web, Bramble Bait, Guardian Relic, Prayer Bastion …) and 14 explicit (a skill that names a status or tribe: Hunter, Kin Rally, Pack Howl, Prayer Ward …), each with the cards it ties together, the engine work, a rough trigger × action cost and a priority. The summary highlights the top 10 and lists 7 open rules questions. No game code or card data changed.

## 2026-10-19 (package L: trigger rules from the owner's answers, 20:31)
- **Trigger chains stop at 5 layers** ("Loop cap: okay — layers, not count."). `TRIGGER_LAYER_CAP = 5` in `bramblewood-engine.js`. Every trigger goes through `runCustomTriggers`, which now counts how deep it is: the original event's triggers are layer 1, and a trigger that goes off while another resolves is one layer deeper. A 6th-layer trigger does not fire (it is logged as `triggerCapped`, no text). Any number of siblings at one layer still resolve. Two units that ping-pong On Attacked at each other now stop after 5 rounds of it instead of running until one dies.
- **A death sweep counts in layers.** Each pass of `removeDeadCards` is one layer deeper than the last, so the deaths a death trigger causes settle one layer down. The old 6-pass limit is now `TRIGGER_LAYER_CAP + 1`: the 6th pass clears the bodies and fires no triggers.
- **Fix: a unit killed during a death sweep now dies.** A unit killed by a death effect (Supernova Jelly's Nova, Scree Goat's Landslide, Sulfur Cinder Moth, Caldera Wyrm, any On Death damage) was removed with the dead of that pass without dying: no death, no On Death, no graveyard, no Darkness. It now stays at 0 Health and dies in the next pass. This is the only change to fight results: 35 card-matrix duels now log one more death (same winners and Health). In 3 more duels, a Relic unit (Friar Badger, Shrine High Priest) caught in a Nova or Landslide now leaves its Relic, which turns a draw into a win. 3 of 200 sample matches play out differently (one changes winner). The golden file is updated.
- Kept and pinned as they were: tokens fire On Death and On Ally Die; Evasive dodges half of single-target attacks and skills (its glossary line already says so). The stated rules (board order, no On Ally Die between units dying together, spawned units fire On Ally Spawn, a unit's own death is not an ally death, 0 healing fires no heal trigger) are a new dated section at the end of `docs/decisions.md` (from a new `rules` list in `docs/decisions.json`; `tools/hub/build_hub.py` writes it).
- Test: `tests/trigger-layers-2026-10-19.js` (in `run-all.sh`).
## 2026-10-18 evening: raids, your row only

- In a raid you can no longer play cards into your middle or back row: those are the CPU allies' rows. The rows show no "+" targets for you, and a drop there is refused (`playCardByUid`). Test: tests/raid-rows-2026-10-19.js.

## 2026-10-19 (W2: the map win-rate panel no longer hangs; its comparison deck follows the road)
- **"Check the whole map" can't get stuck any more.** A fight whose deck named an unknown card threw inside the engine, and the button sat on "Checking 2/4…" for good.
  - Each fight now runs on its own. A broken one shows **"!"**, with the reason on hover, and the check carries on.
  - A game is capped at 100 rounds or 3 s, a fight at 12 s (partial results say how many games they got), and a map at 90 s. Fights left over show ⏱; click again to carry on from the cache.
  - The check pauses every ~40 ms, so the counter moves.
- **The comparison deck now grows with the road.** The panel, "📊 vs a new player's deck", "🎯 Auto-tune Armour" and `tools/skirmish_pass.js` all play `simulateReferenceFight`, with the same seeds and the same numbers.
  - The deck is a reference deck per map: the Otter starter on Map 0, then a Road deck per map (1–24) built from Base plus every earlier main map's rewards (no packs).
  - Cards play at the road CPU's own skirmish level (Lv 1 to Map 4, Lv 2 from Map 5, +1 every 5 maps, inside the Forge's level gates).
  - The enemy is built as the real fight builds it.
  - Before, the panel used the stat-score top 20 (flat after Map 3), the viewer's own card levels and a silent CPU.
- New Road decks for Maps 10–24. Maps 1–9 keep the 2026-10-18 pass's decks.
- **Fix in the tools:** `tools/lib_bramble.js` applies the game's `applyRoadKinds`, so each map's last fight is measured as the kind the game gives it (1-5 is an elite, not a boss). The skirmish pass's leader grants and its trial copies' enemy levels work again.
- **Measured with the new reference player** (`docs/balance/skirmish-pass-w2.jsonl`): Maps 0–9 are unchanged except their last fights. From Map 10 the road is much easier (59 of 262 fights over 92%, 8 under 12%). Nothing was retuned; the owner decides the curve first.
- Docs: `docs/winrate-reference-decks-2026-10-19.md`. Test: `tests/winrate-panel-2026-10-19.js` (in run-all).
## 2026-10-19 (package E: Ecclesia Prayer tokens and Relic)
- **Prayer is now tokens** (owner: "prayer cards give prayer per turn and it gets added as tokens onto it ... Your Prayer value = number of tokens on the field. If a Prayer card dies, all its tokens are gone"). A unit with Prayer N arrives with none and gains N 📿 tokens at the end of every round's upkeep, so it has its first N for your next turn (the same Prayer the old static N gave for your next play, then it grows). Your Prayer = the tokens on your living units + your own offering tokens. A unit that dies or leaves the field takes its tokens; the Removal Zone no longer counts. Thresholds (`prayerReq`) are still never spent.
- **Offerings** (owner 19:54): once a turn, when you summon an Ecclesia card, you may exile a hand card to the Removal Zone: it is your pitch for the turn (none after a pitch, no pitch after it) and gives 1 Prayer token attached to you, which no death takes. `removePrayerTokens` takes units' tokens first and the player's last, for anything that spends Prayer later (nothing does yet).
- Worship (+1 Attack per 3 Prayer) and Lightning (+1 per 4) read the tokens. The card shows a 📿 badge, the Prayer pill shows "+N a turn" and your own 📿 tokens, the replay follows each upkeep's gain.
- **Relic**, a new Ecclesia skill: when the unit dies, a ghostly 1/1 "<Card> Relic" appears at once in its slot, art faded, with only the card's plain keywords (Flying, Guardian, Swimmer, Pierce, Reach, Evasive, Stealth, Nocturnal ...): no other skills, no Prayer, no Relic (no loop), no tokens, counters or buffs. Not on Revive, a Nullify kill, a cage or a Sacrifice. It is no spawn (owner 20:31): no On Ally / Enemy Spawn, Ambush, Sentry or trap; the unit's own death pays its Bounty and Darkness once, and the Relic's later death is a token death (death triggers fire) with no Bounty, Darkness or Ritual count. Budget cost 2 (`canonical/skill-costs.json`, package H's table). On Shrine High Priest (3/14 → 3/12), Shrine Bell-Ringer, Friar Badger, Vigil Owl and Cathedral Eagle (4/14 → 4/12, budget v3).
- **Prayer needs retuned for the faster pace:** Golden Magpie 2 → 3, Blessed Avatar 4 → 5, Vigil Owl 3 → 4, Cathedral Eagle 5 → 4.
- **The CPU:** with an Ecclesia card it can't reach, it values Prayer units more; every level keeps a Prayer unit out of a slot where it dies this round; it won't sacrifice a unit holding tokens; its offering is its pitch. Same engine for sims and fights.
- **Balance check** (120 games, `docs/balance/skirmish-pass-prayer.jsonl` for the fights): a themed Ecclesia deck beats the filler 68% → 89%, the Mid-road reference 17% → 57%, the Strong one 5% → 26% (Mid itself beats the filler 91%). With 7 Prayer units in the deck every Ecclesia card is near its band (Friar Badger 72%, 4 over). The 9 fights with Ecclesia cards stay 43–85% (60 games). The Ecclesia cards in the 20-3, 20-5, 21-6, 24-3 and 24-7 enemy decks have no Prayer source, so they are still never played (they weren't before either).
- Texts are TX keys, in all 12 packs (`tools/i18n_2026_10_19_prayer.py`, which also drops the old Prayer texts). Tests: `tests/prayer-2026-10-19.js` (new), `tests/ecclesia.js` updated, card-matrix golden re-baselined.

## 2026-10-18 (package H: Skill costs you can edit in the hub)
- **New 🧮 Skill costs tab in the master hub** (owner 19:54: "Your bramble master hub should let me edit N values of all skills, triggers and actions. Triggers and actions are costed by How often x How strong"). Every trigger weight, action value, keyword cost and modifier is a number box. Change one and every measured card's S, N and both budget rules (2A+H+S < N, A·H+S < (N/3)²) recompute at once. The cards list shows who is over budget, well under, whose S moved or who flipped, sortable, with map, rarity and text filters; tap a card for its S breakdown. Edits save in the hub's database (collection `skillCosts`), so the hub must be published with `capabilities: {db: {}}`. Without it the tab is read-only: it says so and offers Copy JSON. Claude applies saved edits with `tools/hub/pull_skill_costs.md` (`tools/hub/apply_skill_costs.js`).
- **One cost table, `canonical/skill-costs.json`**, read by `tools/skill_costs.js`, the code `tools/card_balance.js` and the hub tab both run. A trigger entry now costs **trigger weight × action value** (it cost 1 for the whole list). The seeds use the owner's numbers: On Death 1, On Ally Played 2.5, On Any Played 5 (no such hook yet), Bounty 0.5 (Bounty N = 0.5 × Gain × N; it cost 0). Keyword costs and N are exactly as before.
- Under the new model 14 cards' S moves by more than 2 (Stormcaller 1 → 8.5, Worker Ant, Ravenous Wolverine and Puppeteer Imp 1 → 6, among others). Three cards go over budget, all by under 1.5%: Raven Harbinger and The Magnate Duck (Bounty) and Bone Diviner (On Kill: Gain 2 Lumber). No card stats were changed. `node tools/skill_costs.js --diff` lists them. `tests/skill-costs-2026-10-19.js` is in run-all.

## 2026-10-18 (package P: Poison visuals)
- **No "cured" when Poison wears off on its own.** The 1-a-round wear-down now drops a grey "☠−1" counter off the unit's Poison badge, and the badge gives a small tick (`FX.D.poisonDrop`, called from the `poisonTick` handler on `ev.decay`). FX.C's "☠ cured" chip and its green drain no longer play when Poison ends. A real Cure still floats "💊 Cured N".
- **The Poisoned look is a boiling pool.** It used to be a CSS stripe sliding at a constant speed. Now a translucent green pool runs along the card's bottom edge. Its surface is redrawn every frame from layered waves at unrelated speeds, a slowly changing amplitude and short local swells, so the motion never visibly repeats. Rare, small bubbles (rings and filled dots) rise from random spots, at most 3 at once, about one every 0.9–2.4 s. All poisoned units share one loop on GSAP's ticker at about 30 fps. The loop stops when nothing is poisoned and skips hidden tabs. With reduced motion or the Low effects level the surface holds still and no bubbles rise.
- **Flurries:** 6 bubbles when Poison first lands on a unit (not on extra stacks, and not when the board redraws). When the last counter goes, the pool fades off over 0.8 s and 3–4 last bubbles leave. If the board redraws during the fade, the fading pool moves onto the new tile.
- **The Effects Lab plays the game's own code path.** Its Poison entries used to call `statusLook` directly, so they had no apply moment and only the old static-looking stripe. They now go through `FX.D.hooks.cardStatusShown` with a lab env, the same hook a fight uses. `st-poison-active` plays the whole life of a stack: flurry on, boiling, three wear-down drops, fade, last bubbles. `st-poison-expire` moved from FX.C to this path, and `st-poison-apply` / `st-poison-tick` show the flurry and the drop too.
- Test: `tests/poison-fx-2026-10-19.js` (in `run-all.sh`) covers the engine decay events, no "cured" chip, the drop hook, the apply and expire flurries and the rebuild case on a small fake DOM, a surface that doesn't repeat, and the lab using the same hook.
## 2026-10-18 (package T, owner list for 10-19: tutorial combat lesson, Outskirts after the deck window, no Quarry Mole toast, brambles as cards)
- **Tutorial: the "Cards hit the card in front of them. No card in front? They hit the Bramble." step shows both rules at once.** By then you have two units out. On that turn the CPU's play is scripted: with one of your lanes already blocked it plays the other way, so your second unit's lane stays open; with none blocked it plays in front of one of your units. The step comes right after that play, before the round's fight, and draws both of your units' attack lines together: one to the enemy unit, one to the enemy bramble. It goes with Next, and the fight then plays out as drawn. Part 1 only, once (`tutorialScriptedCpuPlay`, `tutLessonBoard`, `tutCombatLines`; `showFacing` can add lines). Round 5 is a fallback so the later steps can't stall. It used to show at round 3 with whatever the board held, lines only on hover.
- **After tutorial part 2, the Bramblewood Outskirts load only once your new cards are in the deck.** The "Two more cards!" window now pops over the Tutorial map you came from. That map shows no title. The Outskirts, with their zoom-out and title card, open after "Add to deck" when the window has faded out. Before, the map's title played under the window.
- **The "🪵 You're ready for bigger cards: Quarry Mole joined your collection…" toast is gone.** A Lumber-cost card that waited for pitching to open (the Quarry Mole) now comes up in the central swap window when you're back on the map. It shows as a "New card!" with the line "It costs 🪵 Lumber: pitch a card you don't need to the Graveyard for Lumber, then play it." You can Cancel it, as with Map 0's teaching swaps. The card joins your collection either way.
- **A bramble won is a card on the results screen**, in the "Cards won" row next to the cards, drawn like any bramble card. It used to be a "🏰 New bramble: Farmstead" pill with a Forge tooltip.
  - A new bramble wears NEW! and the usual "now in your collection" hover.
  - A spare (one you already had, including a boss's S-rank spare) wears a blue SPARE tag. Only the spare's hover mentions the Forge: "Farmstead: you already have this bramble. Fuse the spare in the Forge to level it up."
  - The results fx (New bramble! / Spare bramble) finds the card.
  - Packs still announce a bramble with a toast.
- Texts: `ui.swap-teach-lumber`, `results.spare-bramble-tip` and `results.spare` are new TX keys, in all 12 packs (`tools/i18n_2026_10_18t.py`). `toast.you-re-ready-for-bigger-cards` and `results.fuse-it-in-the-forge-castles` are gone, and so are their pack rows and lang/ui's "New bramble". `tests/t-2026-10-19.js` (in run-all) runs the scripted play on the real engine and checks the rest.

## 2026-10-18 (I3: the rest of the UI translated)
- **Most of the UI that stayed English is now translated** (fixed labels and buttons, titles and tooltips, every NPC line and reply, errand writs, skill names and texts, card flavour, map and battle-log texts): their English is harvested into `lang/ui/<code>.json` and the page translator matches it like any pack key (texts with numbers as `{v1}` templates). Coverage of the 5,752 harvested texts (main pack + `lang/ui`): de, fr, es, ja, zh-Hans and zh-Hant 5,607 (97%: every NPC line, errand and flavour text; what is left is admin-only, CSS or regex strings and a few skill lines); it, pt, ko, id, tl and ta 3,099 (54%: all labels, buttons, dialogue, errands and screen texts; card flavour, skill texts and the battle-log/data lines are still English there). zh-Hant is converted from zh-Hans with OpenCC (s2twp). Live numbers: `python3 tools/i18n_ui.py`.
- The 11 placeholder texts from package Z (Wildpaths "learn this" lines and guild renaming / Rename Ticket) are in all 12 main packs, so `tests/i18n-templates-2026-10-18.js` passes again.
- **Text that was cut up before the page saw it now translates whole:** card ability lines (keyword marks split them into pieces) and sentences with an emoji picture in the middle are translated while still one string (`i18nHtmlText` in `keywordizeHTML` and `EmojiStyle`; `BramblewoodI18n.translate` / `translateTextNode`). In other languages the English keyword highlighting is not drawn on those lines. The Codex tile cache keys on the language.
- `tools/i18n_ui.py` harvests the texts (admin, editor, simulator and test-kit screens skipped), reports coverage by kind and lists the sentences split by inline tags that need TX() to translate (`--split`); `tools/i18n_refresh.py` prints the UI coverage too; `assemble_arena.py` merges `lang/ui` first (card names and the main pack win a clash). `tests/i18n-ui-2026-10-18.js` (in run-all): files parse, placeholders and emoji intact, keys exist in the source, built packs carry them, filled texts translate as templates.

## 2026-10-18 evening: trench castle after 20-turn raids

- The raid trench's outer parts (Left / Right Tentacle, Tail) were overwhelmed in every fight once raids went to 20 turns: three rows snowball, dealing about 1,000 Health in 20 turns against 330 in 12. A part's `trench.castleHp` now overrides its fight castle Health for the trench only; the three outer parts use 1250, which brings overwhelm back to about 7% (as at 12 turns). The Core is unchanged.

## 2026-10-18 (package Z: field kit limit, premium dungeon Sweep, free Spire replays, ads notes)
- **Two field-kit items a fight** (owner 17:28: "use two item(s) per map only. then it's grayed then faded out. Some bosses grant an item! In those circumstances, you can use +1 item."). "Per map" is per fight, as the kit always counted.
  - The 🎒 pill shows a "1/2" badge. After the second item it greys ("2/2") and fades out of the HUD. The next fight brings it back.
  - The pop-over heading reads "1/2 used this skirmish". A third item is refused with "2 items a skirmish."
  - **Bosses that grant an item:** no fight's reward had a kit item, so a new node field `grantsItem:true` marks them. It is set on each main map's own boss from Map 12, where the kit opens (`GRANTS_ITEM_FROM_MAP`).
    - In that fight you can use 3 items. The pop-over and the node panel say so.
    - Its first clear gives one kit item, shown in the results' Rewards.
  - The day's 3 win items, notices, weeklies and the cart are unchanged. The Inventory, Shop and traveller lines say two a fight.
- **Daily dungeons: Sweep for premium players** (owner: "once you complete them, you can sweep them if you are a premium player (p2w - spent at least >10 USD on my game)").
  - Each dungeon card in the Dungeons tab has a 🧹 Sweep for your best floor, and a floor's own panel has one for that floor. Both reuse the Conquest Sweep menu (runs × Energy, the CPU plays, a win pays the clear-again reward).
  - A Sweep takes no key and leaves the climb as it is.
  - Non-premium players see it locked with a gold **Premium** badge and "Sweeping daily dungeons is a perk for supporters".
  - `isPremiumPlayer()` reads the player's own profiles row at sign-in (`select('*')`: a `premium` flag or `lifetime_spend_usd` over 10). It is false otherwise. No column was added and there are no payments. Admins count as premium.
- **The Babel Spire: cleared floors are free and pay nothing** (owner: "blue-grey out completed tower floors as there will be 0 reward. Towers just take energy to do, refunding if you fail").
  - Cleared floors are blue-grey on the map with a "0 reward · free" tag. Fighting one again costs 0 Energy and gives no reward of any kind (Leaves, Dust, drops, eggs, kit items, XP, quests). A better rank is still kept.
  - A new floor costs Energy as before, "⚡ N · refunded if you lose". A loss, forfeit or draw gives the Energy back, and the results say so.
  - No Auto-sweep on the Spire. The summit's floor picker says the replays are free.
- **Ads:** `docs/ads-considerations-2026-10-18.md`, notes only, no code. It covers opt-in rewarded ads in five PvE spots, never in battles and never for premium players, the web, desktop and mobile options, Steam's ban on ad-based models, consent banners, and the trade-offs.
- Texts are TX keys (22 new; `toast.one-item-a-skirmish` retired), translated in all 12 packs by `tools/i18n_2026_10_18z.py`. `tests/z-2026-10-18.js` is in `tests/run-all.sh`. `tests/polish-2026-10-18.js` now passes TX and nodeEnergyCost to the Spire card.
## 2026-10-18 (SKB: skirmish pass)
- **Rough balance pass over every Conquest fight** (owner 15:56: "as long it's not auto winnable or always loseable").
  - **Before:** 63 of 262 fights were outside 12–92% for the deck you'd have at that point (39 auto-winnable, 24 always losable).
  - **After:** 7 (21-3 Cloud Ledge, 24-6 The Gilded Guard, and 5 endless-dungeon floors), measured with the CPU at its real level and the enemy bramble as the game builds it.
  - **90 fights changed,** nearly all in their CPU decks: up to 2 copies a move, themed, inside the road's rarity caps.
  - 3-1, 3-5, 10-7 and 18-4 also got a `shieldOverride`, and 8-7 a lower Health.
  - Elites and bosses now sit under their map's skirmishes on every main map. 13 maps had them easier before.
  - Map 3 is no longer free (98% → 77%); Coral Current and the Sunken Depths are no longer walls (3–12% → 15–35%).
  - Tables: `docs/skirmish-pass-2026-10-18.md` / `.xlsx`; summary in `docs/difficulty-curve-2026-10-03.md`.
- **Dromedary:** 2 → 1 Lumber, 5/26 → 3/26 (budget v3: 34 < 42.4, 80 < 199.75). It measured 25% at 2 Lumber and measures 65.8% now (Uncommon band 45–68%).
- **New tools:**
  - `tools/skirmish_pass.js` plays the real fight build, read out of `arena_app.js` by the new `tools/lib_bramble.js`: `skirmishCastle`, `fightRules`, `levelledEnemyDeck` and `cpuAiLevelForNode`.
  - It uses stage decks: Starter on Map 0; new per-map Road decks on Maps 1–9 (`docs/balance/skirmish-pass-decks.json`); Mid-road on 10–17; Strong on 18–24.
  - `tools/skirmish_pass_xlsx.py` writes the workbook.
- **Old tools:** `tools/curve_tune.js`, `tools/retune_all.js` and `tools/autotune_map.js` now tune the bramble's total (Health + Shield) under X3's rule. On `--apply` they write a `shieldOverride` (or a lower `hqHp`) instead of `hqHp`.
- **Tests:** `tests/shields-2026-10-18.js` now allows a node's `shieldOverride` (rule still checked under it). `tests/golden/card-matrix.json` re-baselined: 96 of 25,720 fights changed, all Dromedary ones, no winner changes.

## 2026-10-18 (Goliath raid: row smacks and column smacks)
- **The Tentacle Smack comes in two kinds** (owner 15:56: "there are row-based smacks and column-based smacks. Column-based smacks weight columns by number of units in that column."). They alternate, a column smack first: for a smack every 3 rounds (the Goliath's), rounds 3, 9, 15 are column smacks and rounds 6, 12, 18 are row smacks.
  - **Column smack:** hits every unit of yours in one column (front, middle and back). The column is picked at random, weighted by how many of your units stand in it, so a column of 3 is picked 3 times as often as a column of 1 and an empty column is never picked. With no units on the board it hits your bramble. The tentacle slams down the column through every row.
  - **Row smack:** hits every unit in one of your rows. That is your front row, or 1 time in 3 (the owner's 15:37 rule, kept) your middle or back row, at even odds between the two. An aimed row that is empty passes the smack to the nearest row with units (front first). With no units at all it hits your bramble. The same tentacle turns on its side, whips in from the left or right edge and sweeps along the row, knocking each card as it passes.
  - The target is still picked and telegraphed the round before: the column glows red down all your rows, or the row glows red across. It is seeded by the fight's seed, the round and the attack, so the same fight smacks the same. A telegraphed column that has emptied since hits your bramble, as before.
- New log lines as TX keys (`ui.raid-smack-column`, `-row-front`, `-row-middle`, `-row-back`, `-bramble`), translated in all 12 packs by `tools/i18n_2026_10_18h.py`, along with the raid screen's attack tooltip (`ui.raid-attacks-telegraph-title`, which now says row or column). The 15:37 `ui.raid-smack-back-rows` line is gone. The Effects Lab has a `raid-tentacle-row-smack` entry. The trench (bramblewood-trench.js) keeps its own column attacks.
- `tests/x2-2026-10-18.js` §12b rewritten: the alternation, rows hit about 2/3 front, column weighting about 3:2, bramble fallbacks, the telegraph, the TX keys and packs, and the VFX hooks.
## 2026-10-18 (BAL2: balance pass 2)
- **A second rough balance pass, 108 cards changed** (only numbers; every skill, Wait and rarity kept). Full tables: `docs/balance-pass-2026-10-18.md` and `.xlsx` (Changes, Left alone, Lumber candidates); each changed card's creatorNote has a "2026-10-18 (balance pass 2)" line. Cards in their rarity's band: **233 → 309** of 631 (`docs/balance/card-balance.json`, regenerated with `node tools/card_balance.js 40`).
- **High Lumber is the exception now** (owner: "don't let high lumber cost be normal"): 55 of the 2+ Lumber cards that sat at 22–37% whatever their stats cost 1 Lumber now (42 from 2, 13 from 3, e.g. Old Willow of the Ford, Yeti Chieftain, Pride Queen, Iron Warden), stats re-fit to budget v3 at the new Lumber and nudged into their band; all 55 measure in band. Player cards by Lumber 0 / 1 / 2 / 3+: 172 / 206 / 113 / 43 → 172 / 261 / 71 / 30. 23 more were measured and left (one Lumber less overshoots or still loses; listed with their numbers for a hand pick).
- **Win rate, half-way to the band:** 51 cards (23 toned down, 28 lifted) by small Attack / Health steps, never past the band's far edge, every buff within budget v3. Today's rules moved few cards: Bleed ticking down cost Hummingbird Needler (42.5% → 22.5%, now 2/3), Wave N's crash lifted Tide Pool Crab (32.5% → 75%, now 1/4), Brimstone Hound rose to 95% (now 3/6); Poison, Cure, healing, shooters and lightning: no card moved 10 points.
- **Budget v3 is a hard rule** (owner: "sticking religiously to N"): **Ritual raises N by 1 per Ritual point** (the sum of its counts), so The Sixfold's 8/20 fits (N 28 → 46); in the Test Lab's Stat budget panel ("Per Ritual point"), `tools/card_balance.js` (each row now has its `budget` check) and the card-plan sheet legend. **Great Gate** 0/45 → 0/28 (23-7 and 24-1 get easier) and MissingNo. 3/33 → 3/13. Still over, on the skip list: the five Dragons and the Caldera Wyrm (your call).
- **The Smartest CPU on Map 21+** (new `tools/cpu_levels.js`, data `docs/balance/cpu-levels.jsonl`): with the CPU at its real level against the old Basic CPU, the reference decks' win rate over the 30 Map 21+ fights (enemy brambles by X3's Shield rule) moves −0.1 (Mid-road, 64.8% → 64.7%) and +0.1 points (Strong, 80.2% → 80.3%): not harder on the whole; single fights swing about 15 points either way (21-1 Thaw Path harder, 24-5 The Battlements easier). The Smart CPU of Map 5–20 elites and bosses plays exactly like Basic unless the fight has field rules it reads. No map deck changed.
- `tests/golden/card-matrix.json` re-baselined against main's (`node tests/card-matrix.js --update`: 0 failures; 5,310 of 25,720 fights change, 4,831 duels, 291 squads, 188 matches, 725 of them with a different winner; all from the stat and Lumber changes). Other suites not run.

## 2026-10-18 (Package EMO: emoji speed)
- **Emoji draw from one sprite sheet per set** instead of one small SVG document each (about 8 per card; 460–620 emoji pictures in an open Codex, about 780 in the page during a battle). Fluent, Twemoji and Noto each ship as `assets/emoji/<set>-atlas.webp` (64 px cells, 2x of a 32 px emoji, lossless; 540 / 720 / 1150 KB, only the set in use loads, and its SVG file no longer loads at all). The pictures look the same: the sheet is drawn by Chromium from the same SVGs. Settings → Emoji style (Fluent / Twemoji / Noto / System) works as before.
- **How it draws:** each emoji is still an `<img class="emoji tw-emoji emo e-<key>" alt="🦦">` (screen readers, copy, `EmojiStyle.textOf`, System's restore and the translator see what they did); its src is one shared 1x1 GIF and the picture is the sheet as its background, placed by one generated stylesheet (`#bwEmojiAtlas`, percentages so it fits any size). The sheet is decoded before the first swap, so nothing pops in. `EmojiStyle` keeps its API (`html`, `htmlBlock`, `textOf`, `set`, `apply`…; new `usesSheet()`). With no sheet, a sheet that fails to load, or an emoji the sheet missed, that emoji is drawn the old way from the SVG set.
- **Measured** (headless Chromium, the shared and very busy 2-core test box; renderer CPU from traces, medians): 800 emoji on their own cost **2.3–2.6x less** to insert and repaint (SVG about 350 ms → sheet about 145 ms; first frame 120–195 → 42–61 ms; with the CPU 4x slower 1380 → 400 ms, first frame 725 → 216 ms). **First Codex open** in a fresh page: first frame 1752 → 1116 ms (4x CPU: 3934 → 2197), its layout + paint 338 → 175 ms (4x: 1576 → 1122). **First battle start:** paint 40 → 29 ms (4x: 244 → 145), first frame 4930 → 3240 ms at 4x (at 1x within the box's noise). Repeat renders (a hand or board re-render, a page turn, reopening the Codex) were already cheap in emoji terms and measure the same within noise: only the emoji on screen are painted, and the browser keeps them.
- **Build:** `tools/emoji/build_atlas.py` draws the sheets (playwright + Chromium) into `tools/emoji/atlas/` (committed, with a hash of the set); `assemble_arena.py` (`emoji_atlases()`) puts the current ones in the build and redraws a sheet whose set changed. If it can't (no playwright), that set ships without a sheet and draws as before.
- Tests: `tests/emoji-atlas-2026-10-18.js` (in `tests/run-all.sh`: each set's sheet is built, current and holds exactly the set's emoji; EmojiStyle in a stub DOM writes sheet pictures, every emoji's cell lines up with its box at any size, System clears it, the SVG fallback); `tests/e2e/emoji_perf.py` (in `--e2e`, about 4 minutes: the sheet draws every emoji in the Codex, board and hand in all three sets, the fallback, and the timing: emoji alone must cost clearly less, plus an A/B table in the game page).

## 2026-10-18 (Package X2: owner decisions 15:05: raid stages, lightning at the bramble, the Spire's CPU, the Tide)
- **The Flood fills the whole board** (owner: "Flood should fill the whole board i think, then the water vfx can come into play after the water settles. In Ebb, the water retreats to the bottom borders of the board."): Flood and High Tide rise over the whole board, top to bottom; the caustics and the sheen fade in only once the water has settled; Ebb leaves a thin band along the bottom border. Every board row counts, the raid's middle and back rows too.
- **The Flood makes land units Wet** ("All non swimming, non flying are made 'wet' in flood. Swimming units are always wet in flood or ebb."): in Flood or High Tide every unit on the board that isn't a Swimmer / Tide unit and isn't Flying is Wet (+1 lightning damage per Wet counter); it dries the moment the tide goes out to Ebb, and a unit arriving in a Flood is Wet at once. Swimmers and Tide units stay Wet in Flood and Ebb (as before, also without a tide). Flyers are no longer wetted by the Flood (an Ashy sky grounds them, so they wade in). The counters are now "in the water" and Rain, so a Swimmer in a Flood has 1, not 2. The Codex Wet entry and the Tide field text say so.
- **The look:** the waded ring under each land unit is gone; a wet unit shows a subtle wet look (a faint blue lower edge, a few droplet glints), and Swimmers now and then splash (a ripple or three droplets at their base). Compositor-only animations; Medium effects and up for the splash, none under reduced motion or the Minimal style; Pixel has a stepped waterline and stepped splash.
- **Lightning at a bramble deals its damage again** ("No Shocked status on Brambles."; reverts the morning's "grounded" lightning): a bramble is never Shocked (or given any status) and never counts as Wet. The "grounded" log line and float are gone; the Lightning skill text says "With no enemy unit it strikes the bramble, which is never Shocked." Card-matrix golden re-baselined after merging main: against main's engine, 152 of 25,720 fights change, all of them a bolt that now lands on the bramble (no winner changes; main's committed golden was also stale by the new Dromedary's duels).
- **The Babel Spire plays the smartest CPU on every floor** ("Smartest. - if we progressively make a smarter CPU, use that one in the future."): the engine names its top level, `AI_LEVEL_MAX` (2, Smartest), and the Spire uses it, so a smarter level added later applies there by itself. Edit skirmish's Difficulty still overrides it.
- **Raid stages:** Enraged and Thrashing no longer add an extra round-start volley (the boss's back rows already strike every round): Enraged is +2 Attack; Thrashing +4 Attack, Landslide and your bramble −10%. The raid editor can still set a volley on a custom stage.
- **The Tentacle Smack reaches your back rows 1 time in 3** (owner 15:37: "A. The tentacle slams hit them 1/3 of the time."): a column smack now slams your front-row unit in that column (it hit every row at once); 1 time in 3 (seeded by the fight and the round) it reaches past and slams your middle and back rows in that column instead. Rows it aims at that are empty pass it on to the others; an empty column still hits your bramble. Its VFX lands on the rows it hit, and its log line is a new TX key, `ui.raid-smack-back-rows` (English only until the translation pass).
- `tests/x2-2026-10-18.js` (in `tests/run-all.sh`); raid-stages, raid-fixes, lightning, engine-parity and visuals tests updated.

## 2026-10-18 (X3: enemy bramble Shield and Health)
- **Enemy Shield follows one rule** (owner: "Shield = Map. For Elites, Map * 1.5, up to 3x for bosses"). A skirmish's Shield is its map number. Elites, Champions and Dungeons get round(map × 1.5), Mini- and Sub-bosses map × 2, and Bosses, the Campaign Boss, World Bosses and Raids map × 3. It is worked out when the fight is built (`ruleShieldOf`), and the VS screen, the node tooltip and panel, and the skirmish editor all show the same value. Old `hqHp` above the bramble's Health no longer becomes Shield. On Maps 18–24 that was 150–400; now it is 18–72. A few small bosses get more than before (14-8, 17-8).
- **Map 0's road fights a Lv 0 base bramble:** 10 / 12 / 14 Health for 0-1…0-3 and 20 for the boss, with no Shield. The tutorial's rival keeps its 6 (then 8) Health. **Your own bramble in the two tutorial fights now has 8 Health** (was 16; owner: "D. Tutorial only"), capped even if a saved config says more. In Map 0's skirmishes yours keeps its own Health.
- **Come-back-later fights count as the map that opens them:** T-2 / T-3 / T-4 as Maps 1 / 8 / 18 and the Old Bramble as Map 17 (`shieldMap`). Totals: T-2 29, T-3 36, T-4 58 (was 220), 0-B 45 / 45 / 45 / 87.
- Skirmish editor: the Bonus health box shows "Rule: Map N × k = S". Change a value and it becomes this fight's `shieldOverride`; "↺ Use the rule" clears it. The 🎯 tune sets the override. Old saved `armour` values are ignored, and the editor no longer rewrites `hqHp` as Health + Shield.
- `tests/shields-2026-10-18.js` (in `tests/run-all.sh`) checks the rule on all 408 nodes, the overrides and Map 0's Health. Notes and before/after table: `docs/difficulty-curve-2026-10-03.md` (10-18 note).


## 2026-10-18 (X1: owner decisions of 15:05)
- **The starting bramble is called "Bramble"** (was "Castle"; its id `castle` and saves unchanged). Every UI fallback name says Bramble, and each language pack's "Castle" entry now reads as that pack's bramble word (Dornenhecke, Zarzal, Roncier, …).
- **"Bramble" only means the base:** the courier mouse is now **Burdock** (errand "Win 3 matches escorting Burdock's letters", the map courier, docs/dialogues.json); the middle rank tier is now **Thicket** (Sprout, Sapling, Thicket, Heartwood, Elderwood, Starwood; worked out from the rating, nothing saved). Rival name lists swap Bramble → Briony and Burdock → Teasel.
- **Eggs are rare:** first clears 2% (skirmish), 4% (elite), 6% (mini-boss), 10% (boss), 20% (world boss), was 8/16/25/35/50%; repeat wins 0.1% per energy × 0.5/0.75/1/1.5/2.5 (was ×1/1.5/2/3/5); raids still 1%. **Map 1 (Thistlewood) 1-3 always leaves one egg** on its first clear, once per save (flag `egg:map1`), shown on the results; Map 3's first egg stays.
- **Lilypad Reach waits on Map 6** (Sable Swampmire) instead of Gatorback Swamp; a save that already fought there keeps it. The lock reads "Clear Sable Swampmire (Map 6) to open".
- **A cost of 5+ is one log with its number in the centre**, white with a dark outline (was a black number in the corner).
- **The tutorial always deals the golden card** into the opening hand, so the drag hint animates that card.
- **"Put it in my deck" follows your Collection level** (the Profile's sum of card levels), not the deck's rarity: `DECK_PROMPT_FLOORS` — all rarities below 60, then commons stop (60), uncommons (180), rares (450), very/super rares (900), epics (1600), and from 2600 nothing asks.
- **New card: Dromedary** 🐪 (Uncommon, 2 Lumber, Wait 2, 5/26, Dry, resists Heat, Regeneration 1) with the owner's pixel art; the card reward of 18-3 Widow's Web and one copy in 18-4 Sandstorm (The Glass Dunes); budget v3 38 < 47.6, 132 < 251.8; named in all 12 languages.
- `tests/decisions-2026-10-18.js` (in run-all); `tests/maps-2026-10-18.js` and `tests/ui-2026-10-18.js` updated.
## 2026-10-18 (Package Y: audit 4 fixes)
- **Wave crash kills count for the Wave unit:** a unit killed by crashing into its neighbour is the Wave unit's kill (kill stat, Crown of Thorns, Midas, On Kill); in a swing the dead stay until the swing's own clean-up, so the swing's credit and its other on-hit effects no longer point at a unit already taken away. The Wave field's crashes are still nobody's kill.
- **"Simulate 200 vs my deck" plays the Difficulty picked** in Edit skirmish (the CPU at that level, your deck at Smart); the result line names the CPU level. 200 games cost about the same as before.
- **Texts:** heal triggers say they stanch Bleed first (heals no longer touch Poison); Cure reads "cures your most poisoned unit of up to N Poison". A field row hidden until a later map (Psychic Dampener) says "Win a fight on Map 41 or further on to learn this." instead of "you learn it the first time it happens".
- **Codex:** Quarry Mole's "?" tile redraws once Map 0 is cleared (the tile cache key now carries the reveal state).
- **Smaller:** Creative never gives Creativity to a cage or a structure; a road fight saved before today resumes on its node's CPU level (Map 0–4: Basic), not Smart; the CPU's Sacrifice "about to die" check counts Bleed only when the unit is about to act; the Tutorial map's opening slide no longer plays for saves past T-2 (or with a Map 2+ win).
- **Accessibility/perf:** the dialog watcher (bramblewood-a11y.js) ignores class flips inside the board and on elements that can't be dialogs; the fading faction screen is skipped so the fight starting under it isn't trapped.
- `tests/y-2026-10-18.js` (in `tests/run-all.sh`); `tests/wave-tide-2026-10-17.js` covers crash kills.

## 2026-10-18 (X4: guild rename, for a Rename Ticket)
- **A guild's owner can rename it** (owner: "okay. + rename feature (but takes a rename ticket)"): "✏️ Rename guild · 1 🎫" in the guild panel, owners only. The dialog asks for the new name (same rules as making a guild: trimmed, 3-24 characters, unique; there is no word filter in the game), shows the ticket cost and how many you hold, and spends one ticket only once the server says the rename went through. With no ticket it says so and offers the Shop.
- **🎫 Rename Ticket**, a new item (its own count, not a field-kit item): on the Shop's shelf for 250 Maple Leaves once the Guild tab is open (carry up to 9), shown in the Inventory once held, and one free ticket for the owner of every guild made before 2026-10-26 (once a save). The count travels in the progress blob (player_progress).
- **Not switched on until the SQL is applied:** renaming goes through a new `rename_guild(p_guild, p_name)` function (`supabase/proposed/20261018_guild_rename.sql`, NOT applied; the live tables have no UPDATE policy on guilds). Until then the dialog says "Guild renaming isn't switched on yet" and the ticket is kept. The file also proposes closing the "join any guild as owner" hole in the live insert policy and an optional server-side ticket table.
- Player names are unchanged: changing yours never cost anything, so it doesn't take a ticket.
- `tests/guild-rename-2026-10-18.js` (in `tests/run-all.sh`): the item, shelf and inventory wiring, the founders' gift, owner-only button, name rules, the not-applied fallback (PGRST202 / 42883), refusals keep the ticket, success spends one, and the SQL's checks.

## 2026-10-18 (i18n catch-up, part F)
- **Today's new texts are translated in all 12 packs:** the guild, invite and network-error messages (couldn't load / leave / set up, Retry, Retrying…, matchmaking unreachable), the sign-in screen's guest line, the leaderboard's empty state and rating notes, "An egg! You'll need a place to hatch it.", "There's a Nest on Map {n}{where}." and the Creative / Creativity keyword texts, plus the guild screen's "Join a Guild" and "Join" so the half-done-guild message names words on screen (`tools/i18n_2026_10_18f.py`, 32 strings each). Coverage: 325/325 plain game texts and 171/171 templates per pack, no dead keys (13 texts stay English on purpose).

## 2026-10-18 (V4: Codex speed)
- **The Codex responds faster** (owner: "Codex is still abit laggy"). Main-thread work per action, with every card seen and owned, before → after (normal CPU / 4x slower CPU, about a phone): **open** 304 → 143 ms / 1183 → 678 ms, **sort or filter** 310 → 174 / 1207 → 1088, **search** 352 → 161 / 1138 → 695, **back to a page** 326 → 130 / 1216 → 643, **a new page** 291 → 185 / 1605 → 874, **card detail** about 50 / 130 either way. The Codex shows exactly what it did (the same cards, order, sections, pager); a page's lower cards now appear a moment later.
- **A page draws what's on screen first:** the rows that fit (40 cards on a 1366×900 window, 8 on a phone) go in at once; the rest of the 80 follow two rows at a time as you scroll near them, or by themselves within about a second once the page is still. A sort, search or page turn that comes straight after stops the rest, so it never builds cards nobody saw. It drew all 80 in the same frame before.
- **Tiles are built once:** a card tile's HTML is kept, keyed on the card and everything else it is drawn from (owned, edited, Admin Mode, emoji style, skills not met yet), so going back to a page, flipping a sort or reopening the Codex reuses it. Its emoji are turned into pictures in the string (`EmojiStyle.htmlBlock`, as the board rows do), so the emoji observer no longer replaces about 15 text nodes per tile after each draw.
- **The Codex Stats box** (closed by default) no longer works out its 13 breakdowns on every open; only when you reveal it. That was most of the script time of opening the Codex.
- Smaller: one click handler on the grid instead of one per tile; the sort keys (advancement, phylum) and the "is it shown" check worked out once per card per draw; the search lowercased once; search debounce 160 → 120 ms.
- Measured in headless Chromium on the shared, busy test machine (CPU time from traces, median of 3, two rounds); wall times there are 2–4x the CPU time. The rest of the cost is the browser's own style, layout and paint of each tile (about 37 elements and 8 SVG emoji pictures per card). See `docs/perf-2026-10-06.md`.
- `tests/e2e/codex_perf.py` (in `tests/run-all.sh --e2e`): times open, sort, search, next page and detail at normal and 4x CPU against generous limits, and checks the page still fills, the pager stays last, the stats box opens on demand, a search narrows and a click opens the detail.

## 2026-10-18 (Package B: the base is the bramble)
- **Each side's base is called the bramble in everything players read** (owner: "Call it bramble now, not castle, officially"): skill and Codex text, the battle log (it said "HQ"), tooltips, toasts, coach and tutorial tips, results and ranks, the Forge tab (🏰 Brambles), the deck and bramble pickers, the Autobattler, dungeons ("🗝️ Bramble 2/5", "A new bramble rises"), raids ("Your bramble & Co."), the Wildpaths, the Effects Lab labels, the splash line ("Burn their bramble to the ground"), and card, bramble and raid text in `canonical/`. Code names (`castle`, `hq`, `hitHQ`, `castleSkin`…), CSS classes, data keys and save keys are unchanged.
- **Left as "castle" on purpose:** the world's castle (the Outskirts' "castle walls", map flavour, card flavour about the old castle, a rival's taunt), and the starting bramble, whose name is "Castle".
- **Translations:** the 24 changed lines keep their translation in all 12 packs under the new English, reworded with one word per language (fr roncier, de Dornenhecke, es zarzal, it rovo, pt silvado, tl dawag, ta முட்புதர், id semak, zh 荆棘丛/荊棘叢, ja いばら, ko 덤불), plus "Bramble" itself (`tools/i18n_2026_10_18_bramble.py`). Coverage is as before (no dead keys, placeholders intact).
- Tests updated for the new wording: `tests/rebuild-2026-10-17.js`, `tests/skills-2026-10-16-devilry.js`, `tests/raid-fixes-2026-10-18.js`.

## 2026-10-18 (Package W: 20-turn raids, the super whales, Smart Babel Spire)
- **A raid attempt lasts 20 turns** (or until your bramble falls), was 12: the Goliath's `fightRounds` is 20 and so is the default (`RaidM.FIGHT_ROUNDS_DEFAULT`, the raid editor's). The clock ("🌊 Turn 5 / 20"), the last-turn banner, "THE TIDE TURNS — The raid ends after 20 turns", the VS line and the raid tab ("Each fight lasts 20 turns (or until your bramble falls)") all read it from the data. An admin raid edit saved with the old 12 takes 20 (the editor now stamps `roundsV: 2`, so a 12 picked from now on stays). A raid that ends by turn 20 never goes into sudden death (the engine flag now matches the sky and pill, which already skipped it), and boss units now come in on rounds 3, 7, 11, **15 and 19**.
- **The super whales' might:** the raid's boss unit (Kraken Brute, Crushing Tentacle, Leviathan Elder…) carries **+round(100 × the raid's remaining share) Health** on top of its peer-scaled Health (×1.5–×3): about +100 on a fresh Goliath, about +0 when it is nearly dead. Data: `raids.json` `bossHpBonusMax: 100` (clamped 0–1000; unset = none; also in the raid editor as "Boss unit bonus Health"); `RaidM.bossHpBonus(def, state)`. It is fixed when the fight is built, from the same raid state the tab shows (the cloud's attempts, or this device's own when offline / signed out). The card details show it as a bonus ("❤ 160/160 (60 + 100)"), the log says "(+N from the raid's might)", and the raid tab says "The Goliath's might: its great beasts carry +N Health while the raid is at X%".
- **The Babel Spire is Smart on every floor** (was Smartest from floor 25); Edit skirmish → Difficulty still overrides it.
- Tests: `tests/raid-fixes-2026-10-18.js` (the 20-turn clock, the bonus maths and clamps, the old-edit migration, the wiring), `tests/raid.js` (20 turns), `tests/engine-parity-2026-10-18.js` (the Spire rule).

## 2026-10-18 (Package U: UI polish)
- **"Already played this turn" fades on hover-out.** Clicking a greyed hand card armed and focused it, and `:focus-within` / `.armed` kept its why-not label up after the pointer left. With a mouse the label now follows the hover; keyboard focus (`:focus-visible`) and an armed card on a touch screen still show it.
- **Victory is smoother.** Profiled in headless Chromium at 4x CPU throttle: most of the time behind the results came from GSAP tweens on freshly added elements, each of which read a computed transform and forced a full-page restyle or layout. The win's 28 leaves, the results' sparks, coin shower, padlock shards, the results card's entrance and its reward pop-in now run on the Web Animations API, which reads nothing. The coins read their pills once per frame, at the start of the tick. The castle's victory line waits until the results have painted. Over three traces each, script + style + layout from the win to the results was about 8.1 s before and 5.9 s after (4x); after the results open it was about 4.7 s before and 2.2 s after (about 1.2 s and 0.55 s at full speed).
- **Board card shadows are 10% smaller** (the shader's throw and soft edge x0.9). Hand and Codex tiles have no drop shadow.
- **"?" until earned, per card or field (`revealAfter`):** **Quarry Mole**'s skills read as one "?" until Map 0 (the Outskirts) is cleared (`revealAfter:{map:'m1'}` in canonical/cards.json). The **Psychic Dampener** field row is "?" until a fight on Map 41 or later is won (`revealAfter:{mapNum:41}` in FIELD2), even after it has happened. This uses the existing SKILL_REVEAL mask (card text, skill strip, hand, board, Codex, popover) and `fieldRowState` (Environment card, field lists, Map Codex). Names stay visible, admins see everything, and the engine is unchanged.
- **Results:** title / character / map unlocks share one row with the new fights, in the fights' chip look. **Egg cards won as rewards** (Cocoon and the others) are listed with the egg and the baby in the Rewards block, under "An egg! You'll need a place to hatch it." (plus where the Nest is, if it is still locked). They never get the deck button and are never offered as a swap. **"Put it in my deck" only appears for cards at or above the main deck's rarity floor**, the tier that at least half the deck is at or above (`deckRarityFloor`).
- **The swap window waits for the pack opening.** A won pack floats up out of the results for about a second before the opener exists. The map's swap check used to land in that gap. `packRevealBusy()` (queued, in flight, or open) now gates the swap and the Scale Trail finale. The opener's close offers the swap, and with no pack the map still offers it.
- **Swap window:** the two sides are further apart (34 to 54 px; 18 to 30 px on phones, still no sideways scroll).
- **New skill: Creative N** (effect to come). While Ready, every upkeep, it gives N Creativity counters to a random other unit on its side. The counters show as 🎨 N with the tooltip "no effect yet (reserved)" and do nothing else. It is in the skill editor, the Codex (with an "Effect to come" note), the skill strip and the log. Stat budget 0. It is on no card yet. Five new `ui.*` TX keys and two `results.*` TX keys; `docs/game-texts.xlsx` is re-exported.
- `tests/ui-2026-10-18.js` (in `tests/run-all.sh`), 55 checks.

## 2026-10-18 (Package T: tutorial and onboarding)
- **The "drag a card onto the field" hint shows the highlighted card.** The step now points at the golden card (it pointed at the first playable one), and the phantom that glides to the field is a copy of that card (its art, name, frame, and its shiny look; it is no longer greyed out), moving from where it sits in your hand to the open ✦ slot. It used to copy whichever card you were holding and aim at the middle of the row.
- **No in-between screen after picking a side.** The screen that showed your level ("Level 0 · 0/200 XP · Finish the tutorial to open the map") was Home showing through while the side picker zoomed and faded. The tutorial fight now starts at once under the fading picker, so the picker opens straight onto the battlefield (the cards still fly into your deck).
- **The tutorial board is greener:** a fresh spring-green tint (`.battlefield.bf-tutorial`), mixed into the theme's colours.
- **Tutorial map: T-0 and T-1 sit in the middle** while T-2…T-4 are off the map (until both tutorials are won), with no room kept for the others. When the map opens up, the first visit slides the two to their real spots and the trail and T-2…T-4 fade in (once, `bramblewood_tut_map_opened_v1`; it waits for the card window; no slide with reduced motion). The layout editor always shows the real spots.
- **The tutorial's card windows ("Your first deck", "Two more cards!") close by fading out while shrinking a little** (to 94% over 280 ms) after Add to deck, instead of vanishing; with reduced motion they just go.
- `tests/tutorial-2026-10-18.js` (in `tests/run-all.sh`).

## 2026-10-18 (Package R: raid fixes, notes 13 and 14)
- **Every unit acts, whatever its row.** In the three-row raid the middle and back rows (yours, your allies', the boss's) now take their action in the round's combat, in one order: column by column, left to right, and in each column the front row first, then the middle row, then the back row. A back-row unit's action is the strike it had: half its Attack (rounded up) at the enemy's front unit in its column, or the enemy castle when that column is empty; a Waiting one counts its Wait down instead. The log and the replay follow that order. The round-start volley of your ally rows is gone (it is this strike now). The boss's back rows strike too, every round; a stage's "back-row strikes" (Enraged, Thrashing) are now *extra* strikes as each round starts. Engine: `opts.reserveActs` (`RESERVE_ACTS`, `reserveStrike`).
- **The raid board no longer zooms when you place a card.** It is seven columns from the first frame, its framing is made once and kept for the whole fight (made again only when the window changes size), the camera doesn't lean toward the cards, and a dragged card's placement ghost no longer widens it.
- **Back-row cards are 20% larger**: the middle and back rows' cards are 0.84 of a front card (were 0.7), their rows as tall as the cards.
- **Why a raid ended with your castle above 0:** a raid attempt lasts its turn limit (12 for the Goliath), then the part sinks back and you score what you dealt. That clock was never on screen and the fight ended on "DRAW". Now the turn and the limit sit on the boss's HP ribbon all fight ("🌊 Turn 5 / 12", "🌊 Last turn" glowing), the last turn is announced with a banner and a log line, and the fight ends on "THE TIDE TURNS — The raid ends after 12 turns" (log: "The tide turns: the raid ends after 12 turns"). Also fixed: the castle bars only stepped down on ordinary castle hits during a round's replay, so a back-row strike, a field tick or a smack left the bar above the real Health until the round was over; the bars now step down on back-row strikes and are synced to the real Health as the replay ends, before any end sign.
- **A castle can't be shocked** (every mode, both sides): lightning damage aimed at a castle (the Lightning skill or a Shock Bolt with no unit to hit) is grounded: no damage, a "⚡ Grounded" float and a log line. The Lightning skill's text says so. (No status ever landed on a castle; the castle was only ever hit by lightning damage.)
- **Your merged raid castle is yours "& Co."**: your castle's art, icon and name plus " & Co." (e.g. "Fortified Nest & Co."), still the three castles' Health and passives added up.
- `tests/raid-fixes-2026-10-18.js` (in `tests/run-all.sh`); `tests/raid-arena-2026-10-17.js` updated (the volley now runs in combat; the admin raid damage migration has been applied); card-matrix golden re-baselined (150 fights, all a Lightning bolt grounded at a castle, e.g. Blue Dragon's).
## 2026-10-18 (V1: visual fixes — the Tide, chilled flyers, idle glance, cliff gulls)
- **The Tide is water now.** While a tide runs, a layer of water lies under the cards: Flood fills the board to near its top, High Tide to the brim, Ebb leaves a shallow strip along the bottom. It rises from the bottom, coming in from the left (the left edge leads, then it levels), and on Ebb it drains the same way and leaves wet, darker sand that dries in a few seconds. The surface has a drifting foam edge that surges as it moves, two layers of caustic light and a slow sheen. Land units stand in a ring of water with ripples; Swimmers and Tide units bob in theirs; flyers stay dry. Transforms and opacity only; Low effects keep the water and its rise and fall but nothing drifts, the Minimal level and reduced motion show it still, Pixel style has a stepped edge and chunky caustics. (`syncTideScene` in arena_app.js, `.tide-scene` CSS.)
- **The tide's card lift is small and cheap:** each card lifts 2px (1px on Ebb), column by column from the left, 0.1 s apart, as a CSS animation. The GSAP sway of every card is gone, and batch B no longer draws its own Ebb drain / High Tide crests over the water (High Tide keeps its spray). Measured on the Effects library's Flood (headless Chromium, 3 runs): script time during the tide coming in 315 ms → 91 ms, paints 277 → 186, and no non-composited animation left (the old foam animated background-position).
- **No tide chip over the card.** The skill strip's blue Tide pill says it: a wave on Flood and High Tide, a shell on Ebb.
- **Chilled flyers and swimmers:** the ice frame now sits on the part that hovers, so it stays on the card, and while frozen the hover and its sway are half as high (eased, not a jump).
- **Idle glance:** now and then one land unit's art glances a touch left or right and back (one card at a time, every few seconds at most; not while a round plays, not at Low effects or with reduced motion).
- **Gannet Cliffs:** the gulls in the map's ambience are half the size.
- `tests/visuals-2026-10-18.js` (in `tests/run-all.sh`); `tests/wave-tide-2026-10-17.js` follows the new lift and hover rules.
## 2026-10-18 (Package D: CPU difficulty; Revive and On Kill)
- **A kill answered by Revive still triggers the killer's On Kill** (the owner, 10:33), as before R3-WP1, for melee and shots alike. It still gives no kill stat, Crown or Midas (the unit didn't die), and its kill book entry is spent, so the unit's real death later counts once for whoever lands that blow. The card-matrix golden's `sea-turtle-elder>bone-diviner` duel is back to its pre-R3-WP1 value (the only diff).
- **Three CPU levels** (engine `opts.aiLevel`, `setAiLevel` / `getAiLevel`; read only in the game's own fights, `aiAim`; the silent sims are unchanged whatever they pass). **Basic** (0) is the CPU from before 2026-10-18: the old slot trade check, the field-card coin flip, no battlefield nudges (Sacrifice and the shared pitch rules stay for everyone). **Smart** (1, the default) is R3-WP1's battlefield reading. **Smartest** (2) adds: every slot weighed with no dice (a Ready unit that can kill one of yours this round goes for the best such kill; it blocks the unit hitting its castle hardest, more so when its castle is low; it won't stand across from a unit that kills it outright while an equal slot is free); its card pick favours a unit that can kill now, with less noise; a field card goes down only when clearly worth it (> 0.5) and is otherwise kept; it pitches the card least useful on this battlefield (a held field card is kept); a strong Sacrifice unit about to die to what faces it is spent on the Dark Summon card first; its Dark Summon cards are aimed like its other units.
- **Who gets which** (`cpuAiAutoLevel` in arena_app.js, by the map number, a side map counting as its parent): Maps 0–4 Basic; Map 5+ Smart in elite, champion, mini-boss, sub-boss, boss, dungeon, world boss, raid and campaign-boss fights, Basic in ordinary skirmishes; Map 21+ Smartest everywhere. Defaults waiting on the owner: the Babel Spire Smart below floor 25, Smartest from it; raids, Arena (vs AI, Gauntlet, ranked PvP ghosts), the old Dungeon run and the sandbox Smart (the engine default); the tutorial Basic.
- **Edit skirmish → Difficulty**: Auto (it names what the rule gives) / Basic / Smart / Smartest, stored as `node.ai` ('basic' | 'smart' | 'smartest'; Auto leaves it off) and saved / published / listed in the map's edit list like the other fields; Test fight uses it. A resumed fight keeps its level (`aiLevel` in the resume snapshot).
- **The VS opener shows a "🧠 Smart CPU" pill** (Basic / Smart / Smartest) under the castle line for every elite and boss fight, and for any other fight whose CPU isn't Basic.
- `tests/engine-parity-2026-10-18.js`: Revive and On Kill; the levels (level 0 makes the same choices as the engine of commit d28acb3 on 180 fixed-seed turns, skipped without git history; smart differs; the smartest's slot, focus, held field, pitch and Sacrifice timing; the sims ignore the level); the level rule and the editor field (static).

## 2026-10-18 (V3: world-map fixes)
- **A cleared dark map is evenly dark to the screen's edges.** On the Caves & Alcoves, Smugglers' Grotto, the Sunken Depths, the Mycelium Deep and the Volcano Lair, the map's canvas used to sit in a visibly darker box once the map was cleared: the art under it got both dark layers, the strips round it (behind the map list and the tab bar, past the canvas edge, below a phone's scrolled map) only one, and the cleared map's warm glow painted over that one. The screen-wide layer now leaves a hole the size of the visible canvas for the canvas layer to fill (square-cornered), follows a scroll at once, and sits above the glow and any backdrop shader. Checked at 1366×768, 1920×1080 and 390×844.
- **Lilypad Reach waits for Gatorback Swamp.** Its lotus stays where it is on Pebble Beach, locked (padlock, "The lily ponds — Clear Gatorback Swamp to open") until every Gatorback Swamp fight is won. A save that already fought there keeps it open.
- `tests/maps-2026-10-18.js` (in `tests/run-all.sh`).

## 2026-10-18 (R3-WP1: engine parity)
- **Shooters' kills count.** A kill by Arrow, Fire / Ice Arrow, Twin Shot, Volley, Spitfire, Snipe or a Bolt is credited like a melee kill: the kill stat (results screen, MVP), Wildpath Crown of Thorns, Midas Touch and On Kill. So are kills by the other skills that name their attacker (missiles, Rocket, Fireball, Meteor, Tsunami, Avalanche, Tornado, Landslide, Earthquake, Nova, Ambush / Sentry, Pounce...). How: the killing blow records its unit and side (`noteKiller`), and a death no kill book names is credited to that unit (`killerCreditOf`, never for friendly fire or a death with no attacker); On Kill now fires inside `removeDeadCards` for exactly the kills that sweep settles, once per killer card, so no path can fire it twice. One small change for melee: a unit that Revives is no longer an On Kill (it already gave no kill stat). (Reverted the same day, Package D: it is an On Kill again.)
- **The CPU pitches by the player's rules.** One engine `pitchCard` is used by both seats: the pitch yield, Lumberjack, +1 Dark Point for Devilry-line cards, Core Evil, On Discard gains and Rebuild, Second Pitch, On Pitch. The CPU used to get a flat +1 Lumber. The player's `discardCardByUid` calls it for the rules and keeps its sound, chips and log (same results). The CPU's discard event now carries what it gave.
- **The CPU sacrifices.** With a Dark Summon card in hand it gives up one of its own Sacrifice N units when the unit is expendable (a token, a third of its Health or less, about to die of Poison / Bleed, or worth much less than the new card) and the discount makes the play possible or saves its cost. Deterministic (no dice).
- **The CPU reads the battlefield a little** (the game's own fights only; the silent sims are unchanged): a field card is played only when it helps its board more than yours (Spring Rain when its units are the hurt ones, Fog when your non-flyers hit harder, ...), no longer on a coin flip; its slot choice discounts swings that will miss (Darkness, Sun-shy, Night-blind; an Illuminate unit across lights it) and, under the Tide-evade rule, a non-swimmer facing a swimmer; its card choice leans toward Tide units with the tide in, flyers under wind or Landslide, and away from units that would swing blind. Kept mild: these only matter on maps that have those rules.
- On-hit skills on shots (Poison, Bleed, ...) are untouched (an owner decision). `tests/engine-parity-2026-10-18.js` (in `tests/run-all.sh`); card-matrix golden refreshed (6 diffs: 5 CPU matches, 1 Revive / On Kill duel).

## 2026-10-18 (Package V2: Wave and Awash are one, Wave N)
- **One mechanic, Wave N** (the owner: "Wave and Awash refer to the same skill. We can call all of them wave for now"). The pushed unit rides N columns (the skill's way, or the inward-leaning pick for "Either way" and the field). If it **crashes into a unit** on the way (a pinned or Webbed one, or a cage, too), it stops beside it and **both take N**. The board's edge stops it; with no fixed way, an edge right beside it turns it the other way. **Nothing swaps any more**, and a unit in the way no longer turns a no-fixed-way Wave back. On packed (gravity) rows it crashes into its neighbour. A pinned or Webbed unit still isn't pushed.
- **The Wave skill takes an N**: the editor's Wave row is a way plus a number (`effects.waveN`, left off the card at 1; a bare number in `effects.wave` also counts as N with no fixed way). Card text, tooltip and badge show "Wave N" and describe the crash.
- **The Awash field is called "Wave" everywhere on screen**: the field card, Codex, Edit skirmish, Environment card, Effects library, the log ("〰️ Wave 2: the water takes X") and the float. The internal keys (`rules.awash`, the `awash` art key, `ev.awash`) stay the same for saves and data. The word "Awashed" is kept free for a future mechanic.
- Effects Lab (`manifest/wave17.js`): a new crash look for `sk-wave` (E) and `fld2-awash` (D, which replaces the old boxed-in bob); "Wave" labels; inventory rows renamed. `tests/wave-tide-2026-10-17.js` and `tests/keywords-2026-10-14c.js` updated; card-matrix golden re-baselined (14 diffs, all fights with Wave cards).

## 2026-10-18 (R3-WP5: accessibility)
- **Every dialog now behaves like a modal for keyboard and screen-reader players.** New `bramblewood-a11y.js` (loaded with the other bramblewood-*.js files by `assemble_arena.py`) watches for role=dialog / `.modal-overlay` / the Settings panel appearing: it adds `aria-modal="true"` (and role + label where missing), moves focus inside, keeps Tab / Shift+Tab inside the top dialog (nested: only the top one traps), lets Escape press the dialog's own close button when no existing handler took the key, and gives focus back to the opener on close. Onboarding, the tutorial's starter steps, VS intros, the results animation and hatching ignore Escape (`NO_ESC_SEL`, or `data-no-esc` on any overlay); Leave in a live trench fight is never pressed. Small anchored popovers (Energy, sweep menu, field kit, graveyard peek, draw offer) are left alone.
- **NPC reply choices give you time** (WCAG 2.2.1): the 30 s window follows the dialogue speed (Slow = 45 s, Fast = 18 s) and pauses while the pointer is over the replies or focus is inside them.
- **18 icon-only buttons have labels** (skill / trigger ✕, admin Energy ±, raid editor ✕ / − / +, test-kit damage / heal, simulator presets). No other unlabelled icon-only buttons were found in the player-facing templates.
- `tests/e2e/a11y.py` (in `tests/run-all.sh --e2e`): Settings, a Codex card detail, Notices and the Tavern: focus in, Tab trapped, Escape closes once, focus back; a confirm over the Tavern; an onboarding screen ignoring Escape; the NPC reply timer.

## 2026-10-18 (R3-WP3: network feedback and stale Online Raid copy)
- **A failed load no longer looks like an empty one.** The leaderboard, your guild, the guild list, match history, Friends (connection and list) and the Flea Market's listings / My listings now say "Couldn't load …" with a **Retry** button, instead of "No ranked players yet", "You're not in a guild yet", "No matches recorded yet" or "No friends yet". One shared helper, `netErrorHTML(what, name, retryFn)` (+ `netErrText(err)` for toasts).
- **Writes the player asked for report failure.** Leaving a guild checks its error (toast, and you stay in it); a name change that didn't reach the account says so; cancelling or declining a match invite that didn't reach the server says so (a failed cancel keeps watching the invite); an accepted invite whose match can't be read tells the inviter; Ranked Live tells you once after 3 failed matchmaking polls in a row.
- **No more ownerless guilds left silently.** If the founder's owner row fails, `createGuild` retries it once, then deletes the new guild. The live policies have no delete on `guilds`, so until `supabase/proposed/20261018_guild_creator_delete_empty.sql` is applied the founder is told to re-join it from the list, and joining a guild you founded makes you its owner.
- **Online Raid is only named while it's visible** (`ONLINE_RAID_VISIBLE`): the rank panel, the empty leaderboard, the profile rank tooltip, the guild sign-in line and the entrance note now point at Arena PvP / Ranked Live.
- Progress sync: a failed `player_progress` push now retries on the next 20 s tick instead of being treated as saved.
- 23 new TX keys (`net.*`, `ui.*`, `toast.*`); `docs/game-texts.xlsx` re-exported.

## 2026-10-18 (R3-WP2: raid stages do something)
- **The Goliath's Enraged (below 75%) and Thrashing (below 50%) stages now change the fight** (they were names only). Defaults, waiting on the owner: **Enraged:** every boss card +2 Attack, and its back two rows strike once a round (the volley your ally rows already make). **Thrashing:** every boss card +4 Attack, the back-row volley, Landslide on the field, and your (the raiders') castle 10% less Health. Exposed (below 1%) still strips every ability.
- **The Raid tab** shows the current stage's one-line effect under the boss, a "Stages" panel with every stage (the current one marked), and the field panel includes the stage's field. The VS screen names the stage.
- **The raid editor's stages** each get boss +Attack, boss +Health, back-row strikes, your castle %, and a field effect picker, with the stage's line under them.
- **How:** stage `rules` (an object or the older list) are read by `BramblewoodRaid.stageRules` (keys `bossAtk`, `bossHp`, `field`, `extraVolley`, `castleHpPct`, `stripAbilities`; others ignored); `fightFor` returns them with the merged field; `stageCard` / `scaleCastle` apply them; `setStageRules` is the editor's write side; `describeStage` the line. The benched trench minigame and the editor's Simulate still read only stripAbilities.
- `tests/raid-stages-2026-10-18.js` (in `tests/run-all.sh`).

## 2026-10-18 (R3-WP6: polish and dead code)
- **The Babel Spire has a summit.** With all 50 floors cleared, its Dungeons-tab card shows "🏔️ Summit · all 50 floors" and "You stand atop The Babel Spire…" instead of "Floor 50 / 50 · ▶ Keep climbing"; a floor picker and **🔁 Fight it again** open the Spire with that floor selected (the map scrolls to it, not to the top). The card is headed with the map's name (it said "🗼 The Tower").
- **Backdrops for the Babel Spire and the Long Burrow**, which drew only a gradient: derived at build time like the other side maps (`MAP_ART_DERIVED`): the Spire is Eyrie Heights' stone and sky pools, colder and bluer; the Long Burrow is the caves turned from violet to packed earth. The art loop in `assemble_arena.py` now takes whole map ids, so `tw` (no "m" prefix) fits, and its MAP_ART_IDS check reads any id.
- **Dead code:** the never-read `bramblewood_tut_zoomout_v1` key (written after Tutorial part 2, cleared on the first map visit) and the deck list's Large/Medium handler with its never-read `bramblewood_deck_view` key (its buttons went on 10-13). The errand Iron Shard the audit listed is **not** dead: `hedgehog-bully` and `heron-feast` set `shard:true`, and the writ shows it; left as is.
- **Effects inventory:** `meta-steam-achv`, `meta-dragon-egg-craft`, `dng-murgle`, `world-event` and `amb-arena` now read live (their manifests' `inGameHook` names what the game plays; the rows' trigger/current/quality say so). Now 951 live · 51 lab-only.
- `tests/polish-2026-10-18.js` (in `tests/run-all.sh`).

## 2026-10-18 (I1: translations for texts with placeholders)
- **The 159 game texts with a {placeholder} now translate** in all 12 languages ("📜 Errand: The Old Bramble — 2/5" → "📜 おつかい：古いいばら — 2/5"): toasts, results-screen pills, dialogs, tutorial lines. `TX()` still returns English, so code that compares its result is unaffected.
- **How:** `bramblewood-i18n.js` compiles every pack key with a {placeholder} into a template (once per pack load: ~2 ms). When the exact lookup misses, a text is tried only against the templates whose rarest literal word it contains, and a match fills the translation with the captured values; each value is looked up too, so a map, card or item name inside the sentence translates, as do English tails such as " · published" or ". Journey complete!". Counts only match digits, plural endings a few letters, ranks a capital letter. ~3 µs a string on first sight, cached after.
- **Packs:** `tools/i18n_2026_10_18d.py` and `…e.py` add the 159 templates (plus the pieces that HTML texts reach the page as, the ring colours and other English values the code fills in) to `lang/*.json`. English plural endings ({s}, {plural_*}) are dropped where the language has no use for them. `tools/i18n_refresh.py` now counts them toward coverage (159/159 in every pack) and checks placeholders (none lost, none added, side-by-side ones kept together); it exits 1 on a problem.
- `tests/i18n-templates-2026-10-18.js` (in `tests/run-all.sh`): compile, match, fill and placeholder integrity for every pack, plus a timing run.

## 2026-10-18 (I2: card-name translations)
- **Card names are translated.** 361 player-visible card names (360 that were in no pack, plus Yeti, which half the packs lacked) now have names in all 12 languages, including the new Fathom Leviathan, Grovebearer Dragon-Turtle and Ashmantle Fiend. Every pack covers all 647 visible cards; test and reference cards (`test: true`, hidden by the Codex) are left out, and MissingNo. stays MissingNo. Drafted by Claude in the packs' existing voice and terms (the same word for Otter, Knight, Dragon, Rivergate, Sunfeather… as the 286 names already there); Tagalog, Tamil, Japanese and Korean deserve a native read, as with the other packs.
- They live in `lang/cards/<code>.json` (same `{"English": "translation"}` shape) so they don't collide with edits to `lang/<code>.json`; `assemble_arena.py` merges them into each built pack (`assets/lang/<code>.js`, and the inline copy under `BW_INLINE=1`), the main pack winning on a clash.
- `tools/i18n_cards.py` reports coverage per language and lists the missing names; `tests/i18n-cards-2026-10-18.js` (in `tests/run-all.sh`) checks the files parse, hold only real card names, cover every visible card and reach the built packs.

## 2026-10-18 (package C: leftovers clean-up and Steam achievements)
- **Steam achievements are wired.** 13 achievements (`STEAM_ACHIEVEMENTS` in arena_app.js): First Win, first map cleared, Maps 5 / 10 / 20 cleared, first Legendary pulled, the Scale Trail, the Red Dragon Egg hatched, first raid hit, Babel Spire floors 10 / 25 / 50, 100 wins. `steamUnlock(id)` calls `window.bwDesktop.steam.unlock` only on the desktop build (nothing happens on the website), never twice for an id Steam took, and swallows errors; `steamCheckProgress()` also catches up saved progress 5 s after start-up. The ids (Steamworks API names) are in `docs/platform-roadmap-2026-10-17.md`'s 10-18 section; `tests/steam-ach-2026-10-18.js` checks them against `electron/steam.js`.
- **Dead battle code removed:** the Left/Right `.dropzone` button wiring in `wireDropZones` (`showButtonPreview` / `clearButtonPreview` and their listeners) and the `.dropzone` and `.terrain-pill` CSS; neither is drawn any more. Dropping on the row and on the discard zone are unchanged.
- **Effects Lab:** `ui-cloud-sync` and `ui-deck-hero-banner` are tagged retired (their in-game callers went); both stay playable in the lab. The effects inventory is refreshed.
- **tests/e2e/hero.py** now opens the Hero Hall in the Stomping Grounds (the deck screen's 🦸 button is gone) and pays the current Materia price; it passes again.

## 2026-10-18 (texts, dialogue and translations)
- **Avatar hints:** the Hedgehog now says "Clear Ashen Spurn" (it still named The Ashen Peak, renamed on 10-12), and the Dragon says "Clear The Sundered Peak": it unlocks on Map 20, while the campaign now runs on to Goldfeather Keep, so "Win the whole campaign" was no longer true. The Effects Lab's volcano background is labelled Ashen Spurn too.
- **Boss banter plays:** the `boss_banter` exchange ("That one doesn't surrender…" / "Then we make it a short conversation.") now plays a moment into each boss fight, once per boss per save, never before the tutorial is done, at your NPC dialogue speed. It replaces the one-line warning that stood in for it, and it is used up only once the fight has really started (no longer when an energy or deck check refuses it). Hummingbird players hear Aurelia and Vesper instead of the otter pair.
- **Translations refreshed:** all 12 language packs now cover every game text in `bramblewood-texts.js` that has no {placeholder} (308; was 17 in de and the others), plus 27 map names added or renamed since 10-12. 64 dead keys (texts the game no longer shows: old card and map names, retired buttons) are gone. New tool `tools/i18n_refresh.py` reports coverage and drops dead keys; the translations are `tools/i18n_2026_10_18a/b/c.py`. The defeat-screen pun names stay in English on purpose. The 158 texts with a {placeholder} are still English in every language: TX() fills them before the page translator sees them.
- **Dialogue export:** `tools/dialogues/export_dialogues.py` follows dynamic ids (`playDialogue('forge_cobble_' + key)` inside `cobbleSay`), so the forge_cobble_* lines now list where they play instead of "(not found: maybe unused)". Re-exported `docs/dialogues-2026-10-18.xlsx` and `docs/dialogues.json`; `docs/game-texts.xlsx` regenerated.

## 2026-10-18 (WP4: progression gates and dead code)
- **No more locks you can never meet.** A lock that names a map that isn't charted yet (it doesn't exist, or is a Reserved map with no fights) now reads "Unlocks beyond the charted maps" instead of the map number. That covers nests 6 and 7 (Maps 25 and 30), Forge tiers 4 and 5 (Maps 26 and 31), card Levels 9 and 10 (Maps 26 and 31), limit breaks (Map 50), the Strange Materia tooltip (Maps 25 and 30) and dungeon slot 3 (Map 40). The gates themselves are unchanged: when those maps are built, the locks show their numbers again. One helper, `mapIsCharted(n)` (with `mapLockText` and `UNCHARTED_LOCK`).
- **The Long Burrow** (on Map 22, a real map now) is still held back, but its slot in the Dungeons tab says "🚧 Coming soon" instead of a lock. Releasing it is one switch: `const LONG_BURROW_RELEASED = false;` in arena_app.js, just above the Long Burrow's `endlessDungeon(...)`. A released dungeon with no `after` fight says "Reach <map> to open it" (it opens when its map does).
- Removed `grantMap20FactionCrown` (never called; the crown was retired on 2026-10-13).
- Removed handler code for elements that are never drawn: #cloudSyncPill, #homeProfileBtn (and `homeProfileBtnInner`), #leaderSlotWrap (`wireLeaderSlot`, `leaderSlotHTML` and the text key `toast.leaders-must-be-heroic-or-above`), #terrainPill, #startAsyncBtn, #cnpSweepN / #cnpSweepBtn / #cnpIdleSweep, #cnpAdminClearMap, #homeContinueTutorialBtn (`continueTutorialFromHome`), #deckToCodexBtn, #deckHeroBtn, #dropLeft / #dropRight. #adminTideEvadeChk stays: `testRulesPanelHTML` builds that id.
- `tests/gates-2026-10-18.js` (in `tests/run-all.sh`).
## 2026-10-18 (the dragon thread: Scale Trail)
- **The Scale Trail can be finished.** Finding the eighth Dragon Scale now ends it: once the results close, the Wandering Traveller's finale plays (`DIALOGUES.scale_trail_finale`: one hide, still warm, the Crown carried north, the dragons sleep under the mountains), then a reward screen (the eight scales orbit and fuse in a red glow, the Effects Lab's `meta-dragon-egg-craft` look; the card pops out, the quest ribbon and a toast). Reward: the **Red Dragon Egg** (hatches into the Red Dragon), set in `SCALE_TRAIL_FINALE_REWARD = {card:'egg-red-dragon'}` so it can be changed. Given once (saved flag `scaleTrail:rewarded`); a save that is already at 8/8 gets the finale a few seconds after load.
- **Journal:** a third Notices tab, 🐉 Scale Trail (shown once the first scale is found; Admin always): one writ with x/8, each found scale's fight and line, a hint for each one still hidden (the map and a clue, not the fight), the reward (hidden until 8/8), and a Claim at 8/8 if the finale hasn't given it.
- The trail counts scales **found**, not held: spending scales on Dragonscale Mail, a Mythic's level 10 or a castle's level 25 never undoes it. The scale toast now counts finds ("1/8" for your first, whichever site).
- **Fix: Blacksmith crafts gave nothing.** `cardObtainableFrom` knew no `smith` or `secret` source, so the anvil's equipment (Dragonscale Mail and the rest) and the Map 2 cave's Tiny Cave Dweller were "not obtainable" and `unlockCardForPlayer` refused them after the Materia was spent. Both kinds, and the new `quest` kind (the egg's source: `{kind:'quest', id:'scale-trail'}`), are obtainable now, with a "where to get it" line each.
- The Map 19 scale line says Ashen Spurn (was Ashen Peak). `tests/scale-trail-2026-10-18.js` (in `tests/run-all.sh`).

## 2026-10-18 (FX wiring and the Effects Lab, WP2)
- **Dragons, Supreme beasts and Ghosts now have their own deaths and arrivals in fights.** A Dragon (archetype Dragon: the five Dragons, Thunder Lizard; or creatureRank 1) crashes down, scales scatter and a 🐉 drops; on play the sky darkens, a wing shadow sweeps over, a roar, and it lands. Another Supreme unit, or a rank-2 great beast (Fathom Leviathan, Grovebearer Dragon-Turtle), dies in a slow prismatic burst and arrives in a prismatic shockwave. A Ghost (effects.ghost, e.g. Glasswing Butterfly) turns see-through and drifts up. Who the unit is beats what killed it; exile, egg and petrified deaths still come first. The round waits for the great beasts' falls. The field quake only plays at High effects, so Medium, auto-lower and Minimal (no special deaths, as before) stay calm; Pixel squares the particles.
- A Supreme card on its own is no longer treated as a boss (it got the "Boss · Defeated!" banner wherever it fell); a Supreme leading a boss node still is.
- Effects Lab: death-ghost / death-dragon / death-supreme / sum-dragon / sum-supreme are marked live; the dragon-scale demo reads 2/8 → 3/8 (there are 8 scales); res-faction-crown and FX.F.factionCrown are gone with grantMap20FactionCrown. sk-chain-lightning and sk-shock-bolt (x17) were dropped by the lab for want of an inventory row: they have one now.
- **Effects inventory status:** new `tools/effects-lab/refresh_inventory.py` gives every row a status from the lab manifests (live / lab-only / future / missing / retired, plus `lab` and `inGameHook`) and regenerates the counts and entry tables of `docs/effects-inventory-2026-10-15.md`. Now 1035 rows: live 948, lab-only 56, future 22, missing 0, retired 9; the 140 rows rated "missing" on 10-15 are all built.

## 2026-10-18 (desktop build P6: offline fonts, icon, Steam stub)
- **Desktop only:** Chinese, Japanese, Korean and Tamil now work offline in the Electron build. Noto Sans JP/SC/TC/KR and Baloo Thambi 2 (OFL) ship in `electron/fonts/`, subset to the characters in the language packs (2.3 MB). The website still loads them from Google Fonts (no change in size).
- **Desktop app icon:** an acorn on a round wooden shield with a bramble ring, drawn in code (`electron/build/make_icon.py`), as PNG, ICO and the Linux/icns sizes, wired into electron-builder.
- **Steam stub:** `electron/steam.js` + `preload.js` give the page `window.bwDesktop.steam` (achievements, overlay). It's a no-op unless `BRAMBLE_STEAM=1` is set and `steamworks.js` is installed. Nothing calls it yet.
- Google sign-in stays off in the desktop build (the OAuth redirect can't come back to `app://`). Remaining release work (Steam App ID, Mac notarisation, signing) is in `docs/platform-roadmap-2026-10-17.md`, section "2026-10-18".

## 2026-10-18 (WP5: Arena field scenes)
- **Every Arena day-rule Environment card has its own picture.** Before, they borrowed other cards' scenes. Now: Lumber Rush shows a sawmill and log pile, Timber Fair stalls and bunting in a clearing, Midsummer a high sun over a flowering meadow, Dusk a violet sunset over a lake, Restless wind-tossed trees at night, First Blood one red banner on a dawn field, Double Time twin hourglasses under a clock ring, and Collapse a cliff edge breaking away.
- **Leylines I, II and III are drawn apart.** The same plain and standing stone has one, two and three glowing strands, brighter at each level; at III the sky lights up too.
- The scenes are drawn in code (Pillow + numpy, no art credits) by `tools/make_field_art_2026_10_18.py`. Each is 256x256 and 4-6 KB. `art/fields/leylines.png` is no longer used.

## 2026-10-18 (great beasts: Leviathan, Dragon-Turtle, Fiend)
- **Creature rank:** a new card field, `creatureRank`. 1 = the five Dragons, 2 = Leviathans and Dragon-Turtles, 3 = the volcano's fire fiends. It is a design rule (rank 2 sits under the Dragons and above an ordinary Legendary; rank 3 under rank 2); the engine doesn't read it. The Codex card detail shows one line under the chips, e.g. "Rank: Leviathan — second only to Dragons". The new type tags Dragon 🐉, Leviathan 🐋, Dragon-Turtle 🐢 and Fiend 👺 have icons. See `docs/creature-ranks-2026-10-18.md`.
- **New card: Fathom Leviathan** 🌊 (Legendary, rank 2, Leviathan / Ocean, 9/40, Lumber 4, Wait 4): Supreme, Tide, Tsunami 2, Wave (alternate), Bounty 1. Drops from the Goliath raid, like the Goliath Broodmother.
- **New card: Grovebearer Dragon-Turtle** 🐢 (Legendary, rank 2, Dragon-Turtle / Turtle / Forest, 6/48, Lumber 4, Wait 5): Sturdy, Regeneration 3, Guardian, Sprout 2, Tide. In Marshal Tuskwell's deck (23-8, Howdah Archers ×3 → ×2) and that fight's second card reward. No existing tortoise was renamed.
- **New card: Ashmantle Fiend** 👺 (Unique, rank 3, Fiend / Devil / Volcanic, Devilry line, 8/30, Lumber 3, Wait 3, fire damage, resists fire): Immolation 2, Shade, Scare 2. It guards the last door of the Heart of the Mountain (20-A-4, Magma Titan ×2 → ×1) and is the dungeon's second card reward beside the Contradiction. Not called a Balrog: that name is Tolkien's.
- All three pass stat budget v3 at Level 1, while the Dragons stay over it. Art to come; they show their emoji until then.

## 2026-10-18 (kin target)
- **New target: Kin.** Every action with a target picker now offers Self / Ally / Opponent / **Kin** / Any (Shield: Self / Ally / Kin). Kin = your own units that share at least one Type with the acting card (the rule Esprit uses), never the card itself. Every distance works as for Ally: Adjacent, Any distance, Furthest, All of them ("all your Kin", which skips the card itself), and N targets. No Kin on the board: the action does nothing.
- Kin is on: Deal damage, Buff, Debuff, Poison, Bleed, Expose, Stun, Increase Wait, Heal, Cleanse, Shield and Exile, and on a Charge action ("2, buff 3 kin random").
- Card text: "a random Kin unit", "an adjacent Kin unit", "2 furthest Kin units", "all your Kin". **Kin** is a keyword with a gloss.
- **Esprit has a target:** Kin (the default; every existing Esprit card keeps it) or Any (every unit of yours that arrives, played or spawned, whatever its Type). Saved as `espritWho: 'any'`; the editor row has a Kin / Any picker after the two numbers; an Any card reads "Esprit +1/+1 (Any) — …". Esprit's text now says Kin (it said "another ally", out of date since 2026-10-14), and the Codex adds a note on Any.
- Irradiation narrows a Kin action the way it narrows an Ally one.
- `tests/kin-target-2026-10-18.js` (in `tests/run-all.sh`).

## 2026-10-17 (rebuild)
- **New skill: Rebuild N** 🔨🏰 ("While Ready, restore N Health to your castle every upkeep."). "On Ready" works as the On Ready income does: every round the unit is awake, starting with the upkeep its Wait runs out (a unit played on Wait 0 starts at the next upkeep). Never above the castle's max, nothing for a fallen castle, and a full castle makes no event. It mends the castle, not a unit, so Herbalist doesn't add to it. On no card yet; default 2.
- **New trigger action: Rebuild castle N** (⚡ → 🔨, "…, restore N Health to your castle."): restores N to this card's own castle once, whenever its trigger fires. It works with any trigger, On Discard from the hand too, and the editor row has the = My Attack / = My Health picker.
- **The look:** planks and stones (🪵🧱🪨) fly from the builder into its castle, the castle thunks, and a green "🔨 +N" pops on that side's HP bar as the bar fills. During a round's replay the bar's running number goes up by what was restored. Log: "🔨🏰 Beaver rebuilds your castle: +2 Health" (with "(1 of 2: it is back to full)" when the castle tops out).
- Stat budget: Rebuild costs its value, as Heal does. Effects library: a Rebuild setup and a Rebuild castle setup, both on a castle that starts 12 down (new `hqHurt` setup field: the stage keeps your castle's Health between steps instead of refilling it). Effects Lab: `sk-rebuild` (`tools/effects-lab/manifest/rebuild17.js`, plays the game's `rebuildVfx`), inventory id `sk-rebuild`. It shows up when the lab is next rebuilt.
- `tests/rebuild-2026-10-17.js` (in `tests/run-all.sh`).
## 2026-10-17 (card stats)
- **Your record, per card.** The game now keeps lifetime numbers for each of your cards, in the background: matches, times played, times died, damage dealt, damage taken, kills, and, where the card does it, castle damage, Health healed, Lumber / Grace / Devilry generated, Poison applied, tokens summoned, thorns damage, revives, times Ready, shots fired and times hatched. A match is tallied once, after it ends (from the engine's own per-match tally plus the round logs), never during the fight. Every mode counts (Autobattler fights too) except the Effects library, the Test Lab / sandbox and admin test fights.
- **Shown only in the Codex card detail**, as a small "Your record" block that lists the numbers above zero for that card.
- **Stored compactly and synced:** localStorage `bramblewood_card_stats_v1`, `{cardId: [integers]}` with trailing zeros cut and only cards with a record (about 20 to 40 bytes a card). It is part of the cloud progress blob (`player_progress.data`). On pull, the two copies are merged by keeping the larger count for each number.
## 2026-10-17 (inventory and field kit)
- **Inventory buttons:** "Visit the Nest" is now **🪺 Nest** and "Enchant" is **💎 Enchant**, to match ⚒️ Blacksmith.
- **The Inventory is the traveller's camp shelf:** dark pixel planks, a vine of leaves and berries along the top, warm lantern light from above, an "🎒 Inventory" sign like the Nest's, and each section sitting on a plank ledge. The pixel art is drawn by `tools/art/make_inventory_art.py` and inlined as data URIs.
- **The Field kit is a card with a pixel satchel** (a map, a draught and a sprig peeking out). It now lists every source of items and shows how many daily-win items are left today.
- **Field-kit items from the day's first 3 Conquest wins:** each of your first 3 Conquest wins on a local day (fights you play, not Sweeps) gives one item. It is random, weighted to the everyday ones (Draught and Kindling 5, Map and Honey Cake 4, Whetstone and Caltrops 3, Fire Pot 2), skips items already at the cap of 5, and only starts once the traveller's kit is open. The item shows in the results Rewards with a satchel chip. A notices and above, finished weekly tiers and the traveller's starter fill still give items as before.
- **Using a field-kit item gives feedback:** the item flies from the 🎒 pack to its target (your castle, the Lumber pill, your hand, or each card it touches) and lands with a ring in its colour and a floating number. A callout over the board says what it did ("Your castle heals 5."), the battle log gets a "🎒 You use …" line, and the pack's count ticks down with a bounce. Once used, the pack stays on the HUD greyed with a ✓ and its pop-over says the kit opens again next skirmish. An item with no target right now is greyed with its reason; pressing it shakes the item and says why in a toast. The board now updates when the item lands, so the floating numbers are no longer wiped by the redraw.
## 2026-10-17 (balance pass)
- **A rough balance pass over every real card: 173 changed** (only numbers; every skill kept). Full table: `docs/balance-pass-2026-10-17.md` and `.xlsx`; each changed card's creatorNote says what moved and why. Cards in their rarity's win-rate band: 157 → 233 of 627 (`docs/balance/card-balance.json`, regenerated with `node tools/card_balance.js 40`).
- **Stat budget v3:** 9 of the 18 cards over it now fit, at the Test Lab's Fit values: Great Horned Owl 6/21, Eyrie Warden 7/24, Raven Harbinger 5/19, Reef Manta Glider 4/15, Humpback Elder 8/39, Kraken Spawnling 9/31, Grindstone Boar 6/19, Irradiated Couatl 8/24, Cathedral Eagle 4/14. Left over on purpose: the five dragons, the Caldera Wyrm, the Great Gate (the enemy gate of 23-7 / 24-1), MissingNo. and The Sixfold (the budget doesn't count its Ritual; fitting it would take it from 37.5% to about 12%).
- **Win rate:** 151 cards more than 8 points outside their band moved half-way toward it (65 toned down, 86 lifted), each buff within budget v3. Biggest: Monarch Wingblade 5/9 → 3/6, Thornwood Palisade 4/22 → 2/19, Alley Cat 3/4 → 2/2, Carrion Fly Swarm 3/5 → 2/3, Caustic Scorpion 5/13 → 3/13; Glowing Gecko 3/9 → 5/12, Ore-Smelter Mole 1/10 → 3/10, Baby Bat 1/5 → 2/5, Pill Bug 1/4 → 2/4.
- **Today's reworks (13 cards):** Cave Bat Swarm 2/3 → 2/2 and Duckling Squadron 1/3 → 1/4 (Fork); Swordfish Spearman 2 → 1 Lumber (Trident); Sulfur Vent Crab 1/9 → 1/8 and Fiddler Crab Swarm 1/3 → 2/3 (Crab Claws); Voltaic Eel 3 → 2 Lumber and Voltwing Bat 2/4 → 1/4 (lightning); Beetle Battering-Ram 5/20 → 4/14 (Cleave 3 kept); Caldera Snow Leopard 2 → 1 Lumber, Subterraneaner 5/8 → 7/10, Piranha Shoal 3/6 → 4/6 (Ambush / Bloodlust); Mirror Moth 2/6 → 3/6 (Reflect); Snow Owl Sentinel 3/10 → 3/9 (Expose).
- **Left alone:** Starter and Basic cards, the reference filler, deck-plan cards (Ecclesia, Devilry, Remember, Changeling, Lumber makers), walls, bosses, raid cards, materia, equipment and eggs; 77 cards costing 2+ Lumber that stay at 22–37% whatever their stats (B4); 10 cards no small stat change helped (Bramblewood Macaque, Puppeteer Imp, Petal Fletcher, Upside-Down Bat, Chained Binturong …). No card had a stat you set by hand.

## 2026-10-17 (lightning)
- **Voltaic Eel: Chain Lightning 2 instead of Electricity 1.** New skill **Chain Lightning N** 🌩️: when its attack connects, the bolt jumps from the target to an enemy unit beside it, then on to one more (never the same unit twice). Each unit it jumps to takes N lightning damage. Electricity is the short version: one jump, to a unit beside the target. The Eel's stat budget (v3, Level 1): 2×3 + 10 + 5 = 21 < N 40.6, and 3×10 + 5 = 35 < 183.
- **Wet is a general rule:** every lightning hit (Electricity, Chain Lightning, Shock Bolt, Lightning, any shock hit) deals **+1 for each Wet counter** the unit has. A unit gets one counter for each of these: it is a Swimmer or Tide unit; it is raining (the Rain field); the Tide is in (Flood or High Tide). That makes 0 to 3 counters. Electricity's own wet bonus is gone (the +1 on the arc, and the extra 1-damage zap on a wet target), so nothing counts twice. Its card line no longer mentions wet units. The rule is in the **Wet** keyword's gloss, and the Skills Codex adds it under Electricity, Chain Lightning, Shock Bolt and Lightning.
- **Shock Bolt and Lightning deal lightning damage** (they dealt physical), so the Wet rule counts for them.
- **No lightning attack throws a ball any more.** Each lightning hit draws its own bolt, and the number pops the moment the bolt reaches its unit. Electricity runs attacker → struck unit → the arc. Chain Lightning jumps one unit after another. Dragon Lightning's red bolt goes attacker → target, then target → the unit beside it (it used to flash first, and then each strike threw a ✦ star). The Shock Bolt is a bolt of lightning, not a spit. Lightning's sky bolt now comes down on the unit it hits (it used to strike the caster, and then a stone flew). At Medium effects and up, FX.A had also been throwing a missile for every one of these.
- **Electricity's bolt is 10% more cyan** than the chain lightning bolt, so the two can be told apart (core #daf7ff, glow rgb(135,188,255); the plain bolt stays #f2f6ff / rgb(150,180,255)).
- **Element emoji on every elemental number and log line:** ⚡ lightning, 🔥 fire, ❄️ cold, 💧 water, 🧪 acid, ☠️ poison, 🦠 decay, 🪄 magic, 💭 psychic, 🩸 bleed. A crit keeps its element's emoji next to 👊, castle numbers carry it too, and the battle log reads "for 3 ⚡ lightning damage (Wet 1: +1 💧)".
- Effects Lab manifest (`tools/effects-lab/manifest/x17.js`): Chain Lightning, Shock Bolt, and the new looks of Electricity, Dragon Lightning and Lightning. They show up when the lab is next rebuilt. Tests: `tests/lightning-2026-10-17.js`.
## 2026-10-17 (arena and raid)
- **The Arena's day rules are Environment cards.** Lumber Rush (+1 Lumber to both sides every 2 rounds, the first on round 3), Timber Fair (every 3), Midsummer (always day), Dusk Start, Restless Sky, First Blood, Double Time and Collapse each get a card with a scene in the fight's Environment stack, beside Night and the weather (Frigid, Fog, Rain, Scorching) that already had one. The ruleset pill on the board is gone. The scenes are borrowed for now: Lumber Rush / Timber Fair use the Undergrowth's fallen logs, Midsummer the Tall Grass, Dusk Start and Restless Sky the Twilight, First Blood the Boss surge, Double Time the Leylines, Collapse the Landslide.
- **The Arena tab, redrawn:** a tourney-ground banner (the new pixel coliseum, with bunting) showing your rank, rating, Laurels and deck; today's rules as Environment cards with their full text, when they change and tomorrow's icons; the format switch; and every mode as a tile that says what a win pays (Gauntlet's next win and 10-in-a-row prize, the Dungeon's clear prize, PvP's Laurels, Ranked's rating). It works at phone width.
- **Arena fights stand on the tourney ground** (`art/maps/marena.png`, raked sand, a timber barrier, stone tiers full of crowd, pennants), with bunting along the board's top edge.
- **Raids are in the deep sea.** The Goliath fights in the Abyss (`art/maps/mabyss.png`: dark silt, a rift, whale-fall ribs, bioluminescence, light shafts painted in) with 16 drifting specks of marine snow. Other raid bosses fight on a fitting map (the frost kings on the tundra, the troll in the caves, the Phoenix on the Sundered Peak, ...); a raid can name its own `ground`.
- **The Goliath's field:** Crushing Depths (2 water damage a round, Tide units half), the Tide (Flood then Ebb) and the new **Psychic Dampener**: Psychic damage is halved (rounded down) and a Confuse lasts 1 round less, so a 1-round Confuse doesn't land. Both sides. They show as Environment cards in the fight and on the raid tab, with the "?" until each first happens; admins see every line. Psychic Dampener is in Edit skirmish, the raid editor (which can now add and remove a raid's field effects) and the Effects library, with its own scene.
- **Raid allies play only into their own rows.** The middle-row ally plays into the middle row and the back-row ally into the back row (a slot behind a card first, else any free slot of its row); with its row full it keeps the card. They used to spill into the other ally's row and then into your front row.
- **Your back rows strike.** At the start of each raid round, every unit in your two ally rows strikes its own column for half its Attack (rounded up): the boss's front unit there, or its castle when that column is empty (the Core's shield still holds while its stumps stand). A unit still under Wait counts it down there instead.
- **The boss calls in Commons.** Every round from round 2, on top of its normal play, the boss puts up to 1 Common into its middle row and 1 into its back row (2 a round at most), each into an empty slot with a card right in front of it, and none while those rows already hold 6. The Goliath's are Inkcloud Squid, Cuttlefish Illusionist, Moon Jelly, Open-Ocean Hermit Crab, Blind Cave Fish, Pufferfish Bulwark and Minnow Skitter (scaled like its deck); a raid without a list draws Commons of its decks' kinds, cost 2 or less.
- **The boss unit has its own name and saner Health.** The big card the boss sends in on rounds 3, 7 and 11 was the same card as its deck copy at ×(2 + 10·r²) Health (a 24-Health Kraken Spawnling arrived at 150–290). It is now its own card (the Kraken Brute, the Crushing Tentacle, the Leviathan Elder, ...) with +1 Attack and ×(1.5 + 1.5·r) Health: 72 for a fresh part, 36 for one nearly down.
- **The raid tab, redrawn:** the boss as a framed card over its own ground, one big health bar, your damage / standing / attempts / Raid Points / the cost of a fight, each part's telegraphed attacks, then three panels: how the three rows work, the raid's field cards, and what a fall pays. Admins get 💥 Deal 10% and 💥 Deal 50% (of the boss's total Health, off its open parts in order); live through `admin_raid_damage` once `supabase/proposed/20261017_e_admin_raid_damage.sql` is applied, in this browser only until then.
- **The raid's VS screen shows your allies on your side:** each with a portrait, the row it holds, its battle rating, its leader and best cards, and its castle; you hold the front row; the boss's art on the other side.
- **Your BR on every pre-battle screen:** the VS screens (Arena, PvP, Async, Pass & Play, raids, and now the Dungeon) and the Conquest / Tower opener show "Your BR" beside "Their BR". A Standard deck's BR is rated at Level 1.
- **The Tentacle Smack, redrawn:** a thick tapered limb, dark purple-red with a pale underside and suckers, that rises from the boss's edge, coils, slams down the column, writhes there and sinks back: about 3.4 s instead of 1.25 s. One canvas and transform-only shakes instead of a stretched SVG under a drop-shadow and a whole-board shake: in the same headless run, about 21 ms a frame on average instead of 25–29, p95 17–50 ms instead of 83.
## 2026-10-17 (shop, earthquake, sound, tower)
- **The Shop sits in a market street.** Timber shopfronts with arched doors (one ajar with lamplight), lit windows that flicker, striped stalls, crates and barrels, cobbles, a string of swaying lanterns, and two little pixel shopkeepers (a mouse and a hedgehog) idly bobbing. Inside the cart: two lanterns under the awning and a plank floor with a crate, a sack, a barrel and the mouse, so phones get it too. Still for reduced motion.
- **A field-kit item on the shelf, some days.** Once the traveller's kit is open, each day has a 30% chance that the cart stocks one field-kit item (seeded by the day, so it's the same all day): 70–140 🍁, one a day, sold out once bought, not while you carry 5.
- **Earthquake looks like one.** A harder, longer rumble; first a scatter of hairline cracks flickers open at random spots and is gone in a blink, then a jagged, forked fissure (dark gap, pale broken edge) tears open under each card. Everything clears in about half the time. Follows the fight speed. (Effects Lab entry `sk-earthquake` updated.)
- **Sound at 2×.** Cues are rendered into small buffers up front (a cue that reaches the audio thread late still plays whole), the end-of-round cut-off lets the last short cues ring out, a voice cap steals the oldest cue instead of piling up, and attack / hit-mark sounds no longer depend on the effects level (auto-lower used to silence them).
- **Babel Spire: clicking a floor keeps its fight panel open.** The panel was placed at the bottom of the tower's first screenful, so after the click put the scroll back it was thousands of pixels out of view. It's pinned to the bottom of the view now, the floor scrolls above it, the tower no longer jumps to your next floor on every click, and on phones the 50 floors keep their full height instead of piling on top of each other.
- **Back where you were after a fight.** The page's scroll and the map's scroll are noted when a fight starts and put back when it ends (on the tower: the floor you left from stays in view).
- **Forge: filter by deck.** All cards / In my main deck / In any of my decks, with the chips, search, sort and pages; kept between visits.
- **Fuse all extras and Disenchant extras have a sheet.** What goes (each card ×n and what it gives), the totals, then the cards melt into the total with a burst, a summary and a toast. With nothing to do they say why (they used to be disabled buttons that ignored the click).

## 2026-10-17 (shiny and review)
- **A Shiny card stays Shiny on the board.** Playing a Shiny (or skinned) copy used to land it plain: the board unit gets a new id, and the look stayed behind with the card's id in your hand. The look now moves with the card when you play it (and when Auto-play plays it), so the board unit, its flight from your hand, its zoomed details and its death all wear it. The units it spawns are Shiny too again.
- **No Pass after the match.** Once a match is won or lost, Pass (and Auto-play and the field kit) is gone from the results and from the board you stay to look over; the next match brings them back.
## 2026-10-17 (fork family and lights)
- **Fork, Trident and Pitchfork are one attack along 2 / 3 / 4 lines** (were: the 2 / 3 / 4 nearest units, full damage each). **Fork** strikes the units to its left and right when both are there, otherwise only the one in front (drawn as one prong taking it, the other going into the empty side), otherwise the one unit beside it, otherwise the castle; full damage on each line, never C with a side. **Trident** always aims ahead: full in front (the castle when nobody is there), half to the left and right. **Pitchfork** aims left or right at random: LL/L/C/R or L/C/R/RR, half on every prong (the middle one at the castle when nobody is in front). Half = rounded down, at least 1. One swing: Recoil, Inspiring and the onAttack triggers happen once; each line rolls its own miss and dodge and carries the on-hit effects. A Taunt unit that draws a Fork is always one of its lines.
- **One swing on screen:** the attacker lunges once and every tine thrusts together (struck ones knock their card, half ones are thinner, empty ones go into thin air), the lines' damage numbers land together, and the log says "swings once, N prongs". Editor, card and Codex texts updated; the Effects library notes too.
- **Crabs have Crab Claws instead of Fork** (Sulfur Vent Crab, Fiddler Crab Swarm, Open-Ocean Hermit Crab). Crab Claws has no number and costs 0 in the stat budget; its swing goes left or right on a coin flip (the other side if that one is empty, the castle if both are).
- **Illuminate lights the enemy facing it too** (its "minor bad thing"): that unit doesn't miss for Darkness, Pitch Black, Absolute darkness or Night-blindness, on both sides, and gets a soft pool of the lamp's light.
- **The pointer's light follows the pointer** (the Night light and the darkness lantern): eased toward it every frame with a slight lag, put back after every board redraw (a redraw used to drop it until the next move, and the lantern snapped to the middle), no wandering off while a mouse rests on the board, touch still fades from the touch point. The battle's cave lamp (shader) now reads the pointer against the board, not the whole window. The Night light is a little brighter.
- **Castle bars curve with the board:** they were 8 px tall with 15 px corners, which CSS shrinks to about 8 px; they are now masked with the board's own curve (15 px, 11 px on phones).
- **Heat haze is 5% wavy:** the shimmer on fire creatures (heat damage or the Volcanic type) rises in soft waves instead of straight bands.
- **Landslide (field) hits three neighbouring columns only:** a random occupied column and the one either side of it, both sides, not Flying or Mountain Climbers; the rocks fall only on those cards.

## 2026-10-17 (art)
- **Field art for every field effect** (NightCafe, Flux 2 Klein 9B Fast, 16-bit pixel scenes like the rest of `art/fields/`):
  - New: Tide (Flood/Ebb), Landslide, Consternation, Crushing Depths, Rook's Row, Bishop's Path, Mirage, High Canopy, Undergrowth, Tall Grass, Leylines (I–III share it).
  - Their own picture instead of a borrowed one: Slippery (was Freezing), Glass-storm (Sandstorm), Hail (Frost), Lava Spout (Lava Tide), Haunted (Mist), Sulphur Fumes (Mist), Ash Rain and Ashy (Eruption), Arrow Slits (Gale), Volcano Glow (Twilight).
  - Awash has its scene ready (`art/fields/awash.png`, key `awash`) for when its card lands.
- **Tide Pool Crab:** your orange crab (bottom right of the four), its grey cut away and set in a sunny tide pool.
- **Puffball Bombardier** redrawn as a plant: a cracked puffball fungus puffing green spores, with leafy sprout feet.
- **Shrine High Priest** redrawn as a fox: a golden many-tailed kitsune in a priest's collar and hat on the shrine steps.
## 2026-10-17 (balance)
- **Stat budget v3** in the card editor, the Test Lab's ⚖️ Stat budget page (and its Fit buttons) and the card plan's Skill N sheet: a card passes when **2×Attack + Health + Skills < N** and **Attack × Health + Skills < (N/3)²**, with **N = 20 + 2×Level + Rarity + 6×Wait + 0.5×Wait² + 4×Lumber + 0.4×Lumber²**. Rarity counts one a step (Starter 0, Common 1, Uncommon 2, Rare 3 … Legendary 9, Mythic 10); the map term is gone. Green within both, red over either, pink when the first score is at or below 60% of N. Skill costs and the half-miss ×1.5 stay. 599 of 617 cards pass; no stats were changed.
- **Lumber in the Babel Spire:** a floor whose cards cost a lot of Lumber and that has no Lumber source swaps one copy of its least important card for a Nautilus Drifter (floors 3–23) or a Gilded Swan Knight (floors 24–49); 30 floors changed, each still at its rating. Three other fights got a Bounty card: the Steam Wall (22-7) and the Caldera Wyrm (20-B-4) a pair of Cinder Stokers, Marshal Tuskwell (23-8) a pair of Pack Mules.
- **Cleave hits harder:** 17 cards, from 1 to 2 (Commons), 3 (the big 3-Lumber Commons, the Fox Warchief and the Rares), 4 (Marshal of Rivergate) and 5 (the Goliath's Tentacle).
- **New card: Sea Cucumber** 🥒 (Uncommon, Coral Reef, 2/14, Wait 1, 1 Lumber): Tide, Regeneration 2, the first hit on it stuns the enemy facing it, and whatever kills it gets 3 Poison. In the Tide Pool Line fight (10-3, Coral Current) and its reward. Art to come.
## 2026-10-17 (security)
- **Four database updates ready, not applied yet** (`supabase/migrations/20261017_*.sql`, from the drafts in `supabase/proposed/`). Per your 22:48 call: no limits on how often anything is written (currency saves, feedback, market); hourly gain budgets at 10× the drafted numbers (200,000 Maple Leaves, 10,000 Gold Leaves, 200,000 Dust, 3,000 Metal an hour, gains only); a brand-new currency row starts at most at 20,000 / 2,000 / 20,000 / 500 (10× too, so a guest who makes an account keeps their savings).
- **Market settles on the server:** listing checks you own the card; buying takes the price on the server and refuses if your saved balance is short; the seller is credited on the server, after the 5% fee, when they next open the market. Listing still takes a copy out of your collection until it sells or you cancel (unchanged; your call whether it should). The game uses the new functions and falls back to the old ones until the update is applied; its messages for "not your card" / "not enough Leaves" are plain, and it saves and retries once first.
- **Fight rewards can be paid by the server:** a Conquest win with a fight session asks `claim_fight_reward` for its Leaves, Gold Leaves, Dust and Metal. Until reward rules are filled in (or before the update), the game pays its own reward exactly as before; it never pays both.
- **Currency saves go out one at a time:** a burst of rewards is sent as one save with the latest numbers, so saves can't land out of order.
- **Small fixes:** the raid damage function's search path is pinned; co-op room members can change only the room's state and status, not who is in it.
## 2026-10-17 (menus)
- **Tutorial map:** during the two tutorials only T-0 and T-1 are on it, shown as they always will be (their own spots, the trail between them). Once both are won all five are there; T-2…T-4 not reached yet are locked markers that say "Defeat 0-4 / 7-6 / 17-8 to unlock this" (the boss of the map before Maps 1 / 8 / 18). The map's title sequence waits for your second visit, from the Outskirts.
- **Results:** cards won on the left (one seen for the first time also wears NEW!); on the right "New cards seen" comes first and also lists titles, characters, maps and new fights opened; then one Rewards block with every reward: currencies, packs, Kibble, egg, spare castle, Dungeon key, Base growth.
- **Play again keeps the packs:** a pack won, then Play again (or Next fight), goes straight into the fight; the packs open together once you leave the results any other way.
- **Swap window:** left, your deck cards you could let go (recommended first, ★); right, cards you own that aren't in the deck (the new card first). ‹ › or a tap switches each side; a side with one candidate shows just that one. It fades in growing, fades out shrinking, and after a Swap does a happy bounce first.
- **Settings → 💬 NPC dialogue speed:** Slow (1.5×), Medium (as before), Fast (0.6×) for how long lines stay and how soon the next comes.
- **Forge:** 60 cards a page, the Codex's pager above and below; search, filters and sort kept.
- **Tavern recruits:** cards you already own can turn up too, half as likely as ones you've only met (none you hold a full deck's worth of); the week's three stay put when you recruit one. Empty: "No one at the bar today. Cards you meet on the road may turn up here."
- **Stomping Grounds** opens at its front (top of the page, no card close-up left open) when you come in from another page.
- **World map:** daily dungeons (Murgle Mayhem…) sit twice as far from their map's diamond (on phones, twice as far up the edge column).
- **Wildpaths:** hover (or focus, or tap) a mark for a tooltip: what it does, its cost, ranks and what it needs. Points are now 1 per map cleared and +2 for an S rank on that map's boss (was +1 for every boss-kind fight won at S); the subtitle is just "Passive skills for Conquest", the earning rule is the points' tooltip.
## 2026-10-17 (card play and board)
- **Cards fly in from your hand:** every card you play (any hand position, any slot, tapped or dragged) visibly flies from where it was in your hand, or from where you let go, onto its slot, then squashes into place. The flight is a copy of the card drawn over the page, so the battlefield's edge no longer cuts it off and the field's zoom no longer throws it off course. It starts on the first frame, with no stagger behind the enemy's card. Why it only worked for the middle card before: the start offset was measured in screen pixels but applied inside the zoomed battlefield, so only a card straight under its slot started in the right place.
- **The leader launches from its slot:** it winds back, then slams onto the field (a reverse ease), shoves its neighbours, jolts the field, and the ring, crown and fanfare go off as it lands. Dragged, it flies from where you let go.
- **"👑 Leader" ribbon on arrival, not on death:** the ribbon now pops out under a leader as it lands (yours and theirs). A fallen leader dies its normal death, then its rainbow rim bounces outward a little and fades.
- **No more cards jumping to the left after their action:** Wave, Restless and Bloodlust's push, the Ready pulse, the Changeling unmask and the dying fade all used a CSS `transform` on the card, which overrode the glide that holds the card in its slot while the row moves, so the card showed at the row's left edge until the effect ended. They now use the separate scale / translate / rotate properties, which add to the glide.
- **Phone and iPad:** the battlefield's cards are 15% bigger (the hand stays as it was). A crowded row still fits the width.
- **Stacked symbols:** every two-part symbol stacks the same way, the second glyph tucked over the first: the board's Flood / Ebb / High Tide chip (🐚 and 🛡 closer), the High Tide pill's two waves, Moonpull, Supreme Tide, Twin Strike and the existing pairs.
- **Day and night:** the left-to-right light of a change of phase is half as strong again (the creep at 20%, the morning wash and streaks at half); the 10 s timing is unchanged.
- **Your turn played:** once you have played (or passed), your bottom row (castle, deck, hand, graveyard) dims by 5% until your next turn, fading both ways.
## 2026-10-17 (wave, tide, boomerang)
- **One boomerang comes home, retracing its throw.** Two were drawn because the `boomerangReturn` event played FX.A's inbound swing (in from the edge of the field) while the return's hit, a beat later, flew `SkillFX.boomerangReturn` (down from the top of the screen); the catch then slapped a third one into the hand. Now only `SkillFX.boomerangReturn` flies: it comes straight back in along the line the throw left on, hits the same target, follows the throw's curve home and is caught. A castle throw drops back in the way it bounced out; a whiff flies through the empty spot. FX.A skips its catch and whiff looks while that flight is in the air.
- **Wave and Awash pushes (rules):** a push with no fixed way (Wave set to "Either way", which used to go "toward the side with more room", and the new Awash field) goes inward 55 in 100, outward 45 (a coin flip from the middle column). On an open board it never swaps: it rides up to N free columns, stopping at the first unit or the edge; if it can't move a single column that way it goes the other way instead; boxed in on both sides it stays put and bobs, and the units beside it rock. Packed rows have no free columns, so there it still trades places (N places along). Wave Left, Right and Alternate are unchanged (one column, swapping with a unit there).
- **The Wave push rides a crest to its new slot** (`SkillFX.waveRide`) instead of teleporting: the old `.wave-pushed` CSS nudge overrode the board's glide. Blocked, the card bobs on the passing crest (`SkillFX.waveBob`). The water geyser is gone; the replay gives the ride its beat.
- **New field effect: Awash** (`rules.awash`, 〰️): each round from round 2 one random unit (not a pinned or Webbed one) is washed 1–3 columns by the rules above. Field card, Edit skirmish, Environment row, battle log, Effects library and the Effects Lab (`fld2-awash`). No map carries it yet.
- **The tide moves the cards:** on Flood and Ebb every card on the board rocks a little as the water passes it (`SkillFX.tideSway`), Tide units and Swimmers lifting more. Tide units and Swimmers now float at half a flyer's height (5.2px) with a wet shadow, and flyers hover 15% higher (10.4px).
- **Effects Lab:** new looks on `sk-wave`, `atk-boomerang-return`, `wt-tide-flow`, `wt-tide-ebb`; new entries `sk-wave-bob`, `fld2-awash`, `st-hover-height` (`tools/effects-lab/manifest/wave17.js`, batch W17 in the inventory). Tests: `tests/wave-tide-2026-10-17.js`.
## 2026-10-17 (emoji and effects style)
- **Emoji ship with the game, Fluent is the default:** Settings → Emoji style is now **Fluent / Twemoji / Noto Emoji / System**. Microsoft's Fluent Emoji Flat (MIT) is the default. Each set is one file, `assets/emoji/<set>.js`, with only the 539 emoji the game uses: Fluent 615 KB (199 KB gzipped), Twemoji 661 KB (221 KB), Noto 1.6 MB (491 KB). Only the set in use is loaded. Nothing loads from jsDelivr any more, so emoji work offline, in the Steam build and once the CSP is enforced.
- **One path draws every emoji:** text on screen is swapped for the set's picture before the browser paints, and `iconHTML()` writes the picture directly. Inputs, text boxes, menus, `<svg>`/`<canvas>` and tooltips keep plain emoji. Pictures are 1.2em, the size an emoji font shows at.
- **How the sets are built:** `tools/emoji/scan_emoji.js` lists the emoji in the code, texts, cards and language packs. It includes ZWJ sequences, flags, variation selectors and symbols written without FE0F, such as ⚔ ❤ 🛡. `tools/emoji/build_sets.py` fetches the pinned SVGs, runs svgo and writes `tools/emoji/sets/*.json`. The assembler turns them into hashed assets. Fluent has no flags, so its 15 missing pictures come from Twemoji.
- **Credits:** `CREDITS.md`, licence texts in `licenses/`, and a 📜 Credits line in Settings. The emoji style row credits the set in use.
- **Effects style: Classic / Pixel / Minimal** (Settings, next to Effects):
  - **Classic** is today's look.
  - **Pixel** plays the Lab's pixel/arcade variants where one exists: true-damage hit B, Shadow dodge C, irradiated death B and exploding death B. Ordinary knock-outs break up in the token's pixel shatter. Damage numbers get a hard outline and a two-tone fill. Particles are square, with no blur or glow.
  - **Minimal** caps effects at Low (no particles, flourishes or screen shake), turns off hit-stop and makes deaths 40% shorter.
  - `FX_STYLE_PICKS` in `arena_app.js` lists which variant each style plays. Adding an effect is one line.
- **Auto-lower effects:** if a fight averages over 33 ms a frame across 2 seconds, effects drop one level (never below Low). A toast says "Effects lowered for smoother play". This happens at most once per session. You can switch it off in Settings → Auto-lower effects.

## 2026-10-17 (effects lab)
- **The Effects Lab shows 10-16 and 10-17:** 56 entries added, 28 updated and 8 retired (the inventory holds 1,029; with the lab's own map-title, grandeur and fun entries every one is built). New: Sulphur Fumes, Ash Rain, Ashy (and after an Eruption), Arrow Slits, the volcano's Day 4 / Night 2 pill, High Canopy / Undergrowth, Tall Grass, Leylines I / II; Penance, Blood Tithe, Amore (paired and heartbroken), On Pitch, Burn 1 Lumber and Fire on hit, Pounce <Att> / <Hp>, Ambush on a unit moving in, Reflect's bounced shot, Vanguard, Web, the Bloodlust leap, Sentry, Carrion, the passives (Hoard, Venom Master, Fletcher, Herbalist, Shatter, Atheist), the War Elephant's two arrows, Electricity's ⚡ number, Quick on a miss and at the castle, the trigger badge glow, the killing-blow ✖, Strangle's squeeze; the Revive phoenix mark, Angel wings and used state; the opponent's pitch into a slot, the enemy hand counter, castle numbers on the HP bar, the upkeep lock, the Refinery's 🧪, voice barks with their babble, the 10 s sky steps, nightfall and daybreak (whole board, left-to-right creep, faint sun), the night pointer light; the four card front frames, the nine archetype frames, the four card backs, top rarity frames on a zoomed card, the bonus copy and the pile count-down; the Frostfire and Fortress map titles with the battlements, trails inking in one by one, a hidden skirmish's trail. Retired (still playable, marked): the shiny / foil death sheen, the "×2" duplicate, the "−N ✖" stamp, Bloodlust growing, Worthy's loot, the rank lesson box, the "+3 XP" line, the Lumber lesson window.
- **The lab plays the game's own functions:** the field effects, the 10-16/17 skills, the kill mark, the trigger badge, the opponent's pitch, the castle throw, the sky's steps and changes of phase are the functions in `arena_app.js`, fed the events a fight sends (`manifest/_game.js` stands in for the fight; `tools/effects-lab/fx-src-extra.txt` lists what build.py copies). The field effects 2 entries used hand-made copies (their hail and landslide bands fell down the board; the game's run across).
- **Stages re-captured** from today's game (`capstages.py`, a Map 1 fight under Spring Rain): every tile wears its card front frame and the deck piles their card backs (the frame and back pictures are inlined in the page). Fixed on the way: the draw flip, unit speech, emotes, the curiosity bubble and the rival babble had stopped playing in the lab (they call `cardBackClass` and the shared bubble loop since 10-16/17), and `map-cave-fires` was missing from the inventory. The catalogue marks entries new / updated / retired, filters by them, and the coverage line counts them.

## 2026-10-17 (21:45)
- **Best hit** on the results screen is now everything one unit dealt in one round added up (its arrow, bolts, skill hits and swing), not only its biggest single blow.
- **Home:** no "Start the tutorial" button (the game goes straight into it); a paused tutorial resumes from the 🎓 on the Outskirts map.
- **Final check of the evening batches:** the full test suite was run once over everything merged today. Fixes from it: seven Map 22–24 fight decks now meet the Maps 21–40 rule (at least a quarter Rare or better), "Arrows (count)" is named Arrow Count, and the tests follow the Codex losing its one-off tag.

## 2026-10-17 (new skills on cards)
- **Today's skills are on the Map 22–24 cards** (each still on its stat budget at Level 1):
  - **Vanguard 1:** War Elephant (51 ≤ 51.6), Testudo Tortoise (35 ≤ 38.6), Marshal Tuskwell (boss).
  - **Sentry:** Goose Sentry (27 ≤ 29.8), Battlement Heron (25 ≤ 29.8).
  - **Hoard:** Tax-Collector Teal, Hoard 2, now 2/4 (was 2/5; 16.5 ≤ 18.8). The Magnate Duck, Hoard 3 (boss).
  - **Reflect:** Gilded Swan Knight (40 ≤ 42.8).
  - **Ambush 3 and Bloodlust:** Caldera Snow Leopard, now 4/7 (was 4/8; 35 ≤ 37.4).
- **Six new cards, each the first to carry its skill** (no art yet, so they show their emoji). Each one is in one fight's deck and is that fight's card reward:
  - 🕸️ **Gallery Orb-Weaver** (Rare 3/8, 1/1; Web 1, Poison 1): 7-A-3 Silk Gallery, replacing 2 Garden Snails.
  - 🐍 **Cottonmouth Matriarch** (Rare 3/9, 1/2; Poison 1, Venom Master 1): 6-7 Adder Gauntlet, replacing 1 Beaver Builder.
  - 🦔 **Hedgehog Herbalist** (Rare 2/10, 1/1; Bloom 2, Herbalist 1): 5-A-4 The Grove Warden, replacing 2 Echo-Keepers.
  - 🦉 **Eagle-Owl Quartermaster** (Rare 2/8, 1/1; Flying, Arrow 1, Fletcher 1): 11-8 Summit Approach, replacing 2 Chipmunk Hoarders.
  - 🦅 **Ossuary Lammergeier** (Very Rare 3/6, 1/1; Flying, Carrion 2): 20-A-1 The Ash Ossuary, replacing 2 Cinder Imps. It is that fight's second card reward, next to the Ashbone Ghoul.
  - 🦭 **Walrus Icebreaker** (Very Rare 3/11, 2/2; Freeze 25%, Shatter 2, Armor 1; resists cold): 17-6 Glacier Herd, replacing 2 Chipmunk Hoarders.
- **Leech:** no new card, because the Barrow Leech and the Vampire Bat already have it (`sap`).

## 2026-10-17 (effects)
- **Expose with no one to strike it:** when a side has no units left, every Expose counter on the other side's units goes (checked after each death sweep and at the end of the round); the crosshair fades off and the log says so. The Expose crosshair never just blinks off now: it fades.
- **Expose crits:** a counter used by a crit makes the crosshair shine deep dark red at the hit; when the last counter goes, it flashes dark red and magnifies as it fades (the round-end "wears off" doesn't play a second one).
- **Prism death:** shiny and foil units no longer shed a rainbow sheen when they die. That sheen is now the Prism death, for units with a light or rainbow skill: Illuminate (Lantern), Reflect, and the reserved Prism / Rainbow / Radiant / Dazzle / Refract. In the Effects Lab as death-prism (death-shiny-foil marked retired).
- **Quick on a miss:** the Quick dash plays when the swing is dodged or misses in the dark / blind too, instead of the ordinary lunge.
- **Regeneration** plays about 40% faster (the motes, their stagger, the pluses and the glow).
- **Mythic (and every top rarity frame) on zoomed cards:** the card detail and the inspector showed the plain gold rim, because touching a tile's style rewrote its `--rarity-a` and the frame stopped matching. The big card now wears the same frame as the small one.
- **Revive:** the wings and halo are for Angels only (none ship yet), smaller, fainter and centred (the right wing was mirrored beside the card). Every other Revive unit gets a phoenix mark: a faint ember ring and a small flame feather at the card's top centre, plus a "↺ Revive" chip on its skill strip. Once it has come back, the mark burns off, the chip is struck through in red, and its Revive line in the card text reads struck, red, "used".
- **Night pointer light:** at night a soft, faint warm light follows your pointer over the battlefield (fainter than the pitch-dark lantern, inside the board only); on touch it shows at the last touch and fades.
- **Daybreak sun:** barely there: no hard disc, a soft blurred glow at a further 60% fainter, its rays a third fainter; the left-to-right light and the whole-board brightening stay.
## 2026-10-17 (hidden skirmish links)
- **Hidden skirmishes keep their links:** a revealed hidden skirmish (4-H, 8-H, 10-H, 14-H, 17-H) appears with a trail from the fight it sits next to and opens once that fight is cleared, instead of standing unlinked and open from the start (only each map's first fight is like that). Its trail fades in as it pops onto the map. A jumper (5-J, 13-J, 19-J) still lands on the trail between its two fights, and its links no longer depend on where it lands. While a hidden fight isn't on the map, the fights linked from it pass straight through it, so nothing waits behind a fight you can't see. The Ambush on 3-2 hangs off the same trail as 3-2.
- **Link edits on hidden skirmishes stick:** 🔗 Links edits to and from a hidden skirmish or a jumper (including the fight after a jumper, for example linking 19-2 to 19-3 as well as 19-J) now save, publish and draw; they were being rewritten on every render. Skirmish edits on a hidden fight no longer save its on-the-map state (position, secret flag, empty links), and old edits that did are cleaned up when they load.
## 2026-10-17 (play and death hitch)
- **The 0.1 s hitch on a play and on a death** (user: "Playing a card and when a card dies consistently lags the game by 0.1s"): both came from the board redraw. GSAP Flip measured every card before and after it, one card at a time, and each card's measuring made the browser redo the page's style and layout (about 4 passes a card). On fixed-slot boards (Open and Gladiator, the normal fights) the redraw now skips Flip. Cards that moved (the column range widening after a play) glide from where they were: every position is read in one pass, then the glides are written. A death or a play that moves nobody measures nothing. Classic Collapse rows keep Flip.
- The board rows get their emoji as pictures in the HTML itself (`EmojiStyle.htmlBlock`), instead of the emoji observer swapping them node by node after every redraw.
- The castle bars' hit flash replays only when the castle lost Health. It used to restart, with a forced layout, on every HUD redraw.
- Measured on a Conquest board with 3 cards a side, counting the browser's own forced style and layout passes (the machine was heavily loaded, so the milliseconds are relative):
  - The play's synchronous task: forced layouts 84 → 4, style recalcs 135 → 20, 611 → 61 ms. In a trace, forced passes went 242 → 22.
  - The death's board update: forced layouts 33 → 0, style recalcs 45 → 0, 152 → 11 ms. `renderBoard` in a death round went from 76–120 ms a call to 5–40 ms.
  - The emoji swap work in a death round: about 100 → 48 ms.

## 2026-10-17 (combat order and speed)
- **One Speed order for the round** (user: "Arrows etc, and all these kind of skills happen at Speed = 1. Quick happens at Speed = 2."). A round now goes: (1) the start-of-round turns as before: Cower, boomerangs coming home faster than the quickest Fast Forward unit, the Fast Forward / Swimmer (Flood) / Tailwind extra turns, the slower boomerangs; (2) Poison, Decay and Wither ticks, Meteor burns, On Round Start triggers, Rally; (3) the **main order, highest Speed first**: every unit's swing goes at its Speed = a base (**Quick 2**, a **Boomerang throw 1**, anyone else 0) plus its Speed skill and Haste (+2 itself, +1 the units beside it); every Ready shooter's **Arrow, Fire Arrow, Ice Arrow, Twin Shot, Volley, the Bolts, Spitfire and Snipe go together as one action at Speed 1**. Inside one Speed: Swift first, then left to right, then the side with initiative; a unit at Speed 1 that both shoots and swings shoots first. Under Tall Grass, Stealth units still swing before everything. (4) Banana / Durian snacks (Speed -1), then upkeep. Before this, all the shots went off in one volley before anyone swung, and Quick was only a tie-break inside a Speed. So a Quick unit now strikes before the archers (and can drop one before it shoots), and archers shoot before ordinary swings. The Quick and the shooting skills' texts say so. Sim outcomes shift (the card-matrix golden will move). `tests/combat-order-2026-10-17.js`.
- **Deaths settle after each attack or skill** (user: "Settle death effects after a skill or attack finishes. I realise pounce, quick, and arrow happen first, before finally the die animation plays."): the dead are cleared (death effects and all) after every swing and after each shooter's shots, instead of after the whole volley. A unit killed as a card arrives (Pounce, an Ambush, a trap, Skyfall, an Earthquake) dies right then, instead of standing at 0 Health until the next round's first clean-up (after that round's Quick swings and arrows). On the board the toppled unit stays drawn until its death plays after the leap or hit that caused it, and in the fight replay a death plays as soon as its action's last blow lands (a Sweep, Cleave or Volley still plays as one run), so a dead unit is never seen acting or being hit.
- **Fight lag** (user: "General animation lag - during animation. Is it because it requires preloading?"): not preloading (image decoding was under 10 ms a round). Profiled with Playwright (3 rounds, 5 cards a side, Chrome performance metrics and a trace): the main cost was style recalculation, mostly from six `body:has(...)` CSS rules: with a `:has()` on `<body>`, every spark, number and particle the fight adds made the browser re-check the whole page's styles. They are classes on `<body>` now (pg-has-vs, pg-has-overlay, pg-has-spot, pg-shop-back, pg-in-match), kept in step by `syncPageFlags`. Also: speech bubbles follow their cards from one shared loop at the start of GSAP's frame (reads, then writes) instead of one loop each reading after the tweens wrote; the card list is no longer rebuilt on every replayed beat. Measured before → after: style recalculation 13.0 s → 3.9 s; main-thread task time 20.4 s → 11.4 s; long tasks 10.0 s → 1.0 s; average 37 → 55 fps; 95th-percentile frame 67 → 17 ms; frames over 100 ms 29 → 5.
- **Nest pages**: the Nest shows 60 cards a page with the Codex's pager above and below (it drew every card at once). A full collection (602 cards): opening 2.7 s → 0.29 s, long tasks 17.4 s → 0.2 s, 16,470 → 4,844 page elements. **Codex pages hold 80 cards (was 40)**: the first 32 are drawn at once and the rest on the next frame, so a page turn reaches its first frame in about the same time as before (20 → 26 ms). Codex and Nest card art loads lazily and decodes off the main thread.

## 2026-10-16 (gameplay fixes)
- **Daily dungeon keys:** the 🎟️ Dungeon tickets are 🗝️ Dungeon keys now (still 1 a day, up to 3, plus 1 on Mondays). Every floor takes a key when the fight starts; win and you get it back ("+1 🗝️ Dungeon key" in the rewards), lose or forfeit and it's gone, and the climb starts again from floor 1. Your best floor is remembered, so a floor's first-clear payout is still paid only once, and "Play again" after a loss starts at floor 1. A run left open under the old rule gives its ticket back. The Babel Spire takes no keys and never resets.
- **Gold Leaves from daily dungeons:** every daily dungeon floor's first clear (above your best floor) gives 🍂 10 Gold Leaves, and the Long Burrow (22-LB) also gives 🍂 20 + N on every clear of floor N (floor 20: 40). The floor's reward strip and the results show them. (The Long Burrow is still an admin preview.)
- **Name length:** a name on the entrance ("What should we call you?") and in the name prompt needs at least 3 characters after trimming; a shorter one stays on the form with a line saying so (empty names no longer slip in as "Woodland Warrior").
- **Tutorial card windows:** after T-0 and T-1 the map comes up first and the window pops in a moment later (veil, spring, cards dealt in one by one). "Two more cards!" is a proper reward: a gift heading over a slow sunburst, big cards with their names on ribbons, and "➕ Add to deck".
- **No Lumber lesson box:** the big picture window is gone; the spotlighted Pitching lesson teaches Lumber on its own.
- **Swaps:** a swap only offers to trade out a weak card the game gave you (your starter deck's cards, babies with Attack + Health ≤ 3, Starter/Basic cards, tutorial cards), and never one rarer than the card coming in. Cards you won or pulled are never offered.
- **Filters stay:** the Codex (search, filters, sort, view), Skills, Forge, Market and the Camp's card pool keep their search and filters when you leave and come back, and after a reload.
- **Nest on Map 3, nests unlock:** the Nest opens on Map 3 (Gannet Cliffs), and so does the first egg. It starts with one nest; the next ones open on Maps 5, 10, 15, 20, 25 and 30 and are then built with Maple Leaves and Magic Dust (150 + 40, 500 + 120, 1,000 + 250, 1,800 + 400, 2,800 + 600, 4,000 + 900). A save with eggs in several nests keeps enough of them built.
- **Shiny and alt art are per copy:** a Shiny copy (or an alternate-art skin, which dresses one plain copy) no longer changes every copy of the card. The Camp shows each look as its own stack; click it to put that copy in your deck. In a fight only that copy is Shiny or wears the skin, in hand and on the board. Decks from before keep the look on as many copies as you own.
- **Notices → Quests tab:** the "Your quests" list (the daily and weekly quests you're on) moved from the first Notices tab to the second, above the errand writs, and that tab is called **Quests** now. Notices keeps the posted notes; tapping a quest in the list turns to Notices and scrolls to its note. Both tabs show from the start (before the Quest Board, the Quests tab has just the list).
- **CPU slots:** the CPU still plays the moment you commit your turn, but no longer always takes the slot nearest the centre: with a win in reach it goes to the open column furthest out (far left or far right); otherwise it mostly goes across from one of your units it can kill or out-last, and else anywhere legal at random. The silent sims (tools/difficulty_curve.js) keep the old placement unless they pass `aiAim: true`.
## 2026-10-16 (voices and feel)
- **Voice barks:** cards say short lines (6 words at most) in a bubble above the card for about 1.6 s: on play (about 1 in 3), the killer on a kill (1 in 2), on death (1 in 3), on a skill (leaders and bosses only), and idle when you hover a card in the Codex or a deck pool. Leaders and bosses always speak on arrival, on their first kill and on death. One bubble on the board at a time, one bark per card per round. Wild animals, dragons and objects "speak" in sound text (*hiss*), in italics.
- **Lines for 49 cards:** every Heroic, Epic, Unique and Legendary card, the leaders and bosses below that (Wandering Traveller, Wandering Mage, Rodent King, Glacial Ape-King) and the proposal's samples (Otter Centurion, Lantern Bearer, Raccoon Bandit). Otters are dry and soldierly, Hummingbirds quick and boastful. The full list is in `docs/barks-2026-10-16.md`; the card editor has a Voice lines box per moment (under More), saved as `barks` on the card.
- **Babble:** each bark is read out as a short Animal-Crossing-style babble in the species' voice (a mouse high and quick, a bear low and slow, a dragon a deep rumble, a fish bubbly), made in code. It follows the Voice and Sound sliders, is silent when either is 0, lasts under a second, and never plays more than about once a second.
- **Voice lines setting:** On / Leaders only (default) / Off, next to Effects (and next to Voice in the fight's settings). The old generic chatter ("Let's go!") only plays with On, and never over a bark.
- **Normal death:** the earlier topple is back (the card tips over on its bottom edge, greying), as one smooth motion that starts slow and speeds up, fading as it lands, with the leaves and thump on the landing. It was a near-still lean and a snap, then a separate fade.
- **Day and night steps:** within a phase, ☀️ 1/3 → 2/3 → 3/3 and the night's three steps now ease the board's light over 10 s instead of sweeping in. A board redraw mid-way carries on from where it was.
- **Softer day colours:** Day 1 (daybreak) is now close to the normal day colour, Day 2 is exactly the normal day colour, Day 3 is the old dusk amber moved 10% towards it. Night 1 and 3 are the plain night; Night 2 is 5% darker.
- **Nightfall and daybreak:** both are now two effects together: the whole board darkens or lights up over 10 s (tint and night veil), and the new light creeps in from left to right behind the ragged edge at 40% of its old strength, then melts into the rest. The morning light streaks are at 40% too, and slower.
- **Day's sun:** the sun and its rays are 85% more transparent; the sun keeps climbing and drifting while it fades out (it used to stop, then fade). The golden wash creeps in from the left at 40% strength.
- **Birdsong at daybreak:** the birds now sing only about 1 in 3 daybreaks, one to three birds with a different little exchange each time.
- **Day tooltip:** the Day pill's tooltip adds "Draw +1 on Day." (both sides draw when Day comes after Night).
- **Swamp, mist and fungal map titles:** the first-visit title (e.g. The Morel Hollow, Map 7) is now the normal ribbon banner like every other map instead of the ink-brush calligraphy, and keeps the ink look's soft dark shadow along the bottom of the screen. Murgle's dungeon title is unchanged.
- **Rain coming in:** the start-of-rain effect (on the map, and a Spring Rain field arriving) is 90% more transparent. Rain stopping is unchanged.
## 2026-10-16 (placement and rarity)
- **Rarity on the road is a rule now** (`ROAD_RARITY` in arena_app.js, checked by `tests/road-rarity-2026-10-16.js`):
  - Normal skirmishes: Rare up to Map 15, Very Rare from 16, Super Rare from 21, Epic from 36, Heroic from 41, Unique from 51.
  - Elites: one step above a skirmish from Map 10.
  - Bosses: no Heroic on Maps 1–19.
  - The dragon lair's boss (the Caldera Wyrm, 20-B-4) is the only Legendary in Maps 0–20.
  - Maps 21–40: a quarter or more of every skirmish deck is Rare or better.
  - Card rewards follow the same caps (the map leaders a boss pays are outside them).
- **Fewer commons pack by pack:** Pack 1 (Hedgerow Pouch) 50% commons, Pack 2 (Tidemire Chest) 46%, Pack 3 (Highcrest Case) 42%, Packs 4–6 40/38/36%, Pack 7 on 35% down to a 30% floor (they were about 75%). A numbered pack rolls the rarity first, then the card. The Mystery Booster keeps its own odds.
- **No Legendary before Map 21 from packs:** Packs 1–3 have no Legendary and no jackpot. Faction packs, Faction Rewards and Faction Growth hold Legendaries back until Map 21.
- **The Cathedral Eagle** is now the reward of its own boss (21-6), not Map 11's. Map 11's boss pays the new Ibex Rockcaller.
- **The Final Exam (T-4) and 20-B-3** no longer field a Legendary or an Epic.
- **Rarity relabels:**
  - Rare → Uncommon (12 babies and small animals): Fox Kit, Bear Cub, Fawn Scout, Stable Colt, Plains Zebra, Dust Hyena, Mountain Goat Climber, Bog Leech, Cave Flitter, Grass Viper, Rockslide Ram, Warren Scout.
  - Ür-Elk and Lone Grey Wolf are Very Rare; Snow Owl Sentinel is the first Super Rare.
- **71 of the 94 new cards are on the road**, each in one fight and as that fight's card reward (no art yet: they show their emoji). The other 23 wait for maps past 21.
- **63 more cards** that no enemy had played now fight somewhere: the Ent (and the Elder Willow) in the Old Bramble, babies, turtles, shrine acolytes, the Scraper of Skies at the Sky Scraper Sentinel, and pack cards nobody had met yet.
- **Field effects by the curriculum:**
  - The Tutorial is misty.
  - Pebble Beach has the plain Tide, and only 2-4 Pelican Point has the Tide-spout.
  - River Rapids is on Sunken Hollow only; Lilypad Reach has the plain Tide.
  - Smugglers' Grotto is Darkness (it was Pitch Black). Pitch Black moves to the Sunken Depths, which lose their night and First Blood.
  - Swamp Fever on Gatorback Swamp (25% in the Sunken Grove) and on the Sable Swampmire elites.
  - Scorching I on the Savanna elites; Frigid on the Taiga boss.
  - Freezing on the Tundra elites and boss.
  - Sandstorm on the Glass Dunes (Scorching II on its boss); Scorching II on the Foundry's elites and boss.
  - The new effects (field effects 2) are placed too:
    - Tide on every Pebble Beach and Lilypad Reach fight and the Mangrove and Coral Current skirmishes.
    - Landslide on 8-4, 8-6, 8-7; Crushing Depths on every Sunken Depths fight.
    - Rook's Row (12-2), Bishop's Path (12-4) and Mirage (12-6), each once; High Canopy on Map 13; Undergrowth on Map 15, with Tall Grass on 15-3 and 15-4.
    - Consternation on 16-6; Hail on 17-3; Slippery (30%) on 17-A-2; Glass-storm on 18-5 (instead of its Sandstorm).
    - Lava Spout on the Foundry's elites and boss (instead of Scorching II there); Scorching III on Map 20's elites and bosses.
    - Leylines and Haunted are only noted, for Map 40+.
- **Difficulty:**
  - Map 0 retuned: 0-1 is a gentle first fight now (castle 20, no glacier wolves) and the Raccoon Heist lost its 7/12 Nightcrew.
  - Maps 9–20 retuned with `tools/curve_tune.js` toward a curve rising from index 18 to 56 (castle Health, plus a few card trades inside the rarity caps). The strong reference deck now wins most Map 10–16 fights.
- **Tools:** `curve_tune.js` keeps its card trades inside the rarity caps. `difficulty_curve.json` fights also carry the game's own map number and code (`gameMap`, `gameCode`).
- **Proposal:** `docs/card-placement-proposal-2026-10-16.md` (+ `.xlsx`: Placement, Rarity economy, Field curriculum, Map gaps, Changes made).
## 2026-10-17 (board and rewards)
- **Pass** sits to the right of the Graveyard/Discard pile, and the pile keeps a card's shape (the Deck's size) on narrow screens.
- **Opponent's pitch:** their card drops into a card-shaped slot under their pills, settles, fades off, and only then a big "+1 🪵 Lumber" rises while their pill counts it (nothing clips the card any more).
- **Enemy hand size:** a "5 🃏" pill on top of the enemy's Deck; their 💀 Graveyard badge moves to the Deck's bottom edge.
- **Skirmish panel fits the screen:** the Field list is compact, two columns wide, and scrolls inside itself; the deck row always stays in view.
- **Ecclesia box** is deep purple with light text everywhere; the "Discard for" box under it is a lighter slate.
- **Armoury pool filters** (search, type, kind, level, sort) are kept when you leave and come back.
- **Codex:** no "one-off" tag on skills (the editor's skill picker keeps it).
- **First clear:** the unlocks drop onto the bright board; the screen dims only after they have all landed, then the results open.
- **New trails** stay hidden until they ink in, one after another, each fight fading in as its trail reaches it.
- **Admin Clear map** now pays every first-clear reward (Leaves, Dust, cards, packs, elite/boss cards) of each fight it clears, plus every fight's clear-again Leaves and Dust.
- **Pack opener:** the "N cards" count under a big pile counts down; the big view of a pulled card shows that copy's finish and Shiny (the finish picker stays admin-only).
- **Bonus copies:** a pack card may come with an identical second copy, credited for real: Common 5%, Uncommon 4%, Rare 3%, Very Rare 2%, Super Rare 1%, then halving (Epic 0.5%, Heroic 0.25% …). It shows as "Bonus!" with the copy sliding out from behind the card. The old "×2" with two blank cards (fired on any card you already owned) is gone.
- **Equipment** never comes from fight rewards, first clears, drops, finds, reward tracks or packs, and is gone from pack contents and odds; the Blacksmith remains its source.
## 2026-10-17 (new maps)
- **Map 22: The Rimefire Caldera** 🌨️ (`m22`, was the Reserved slot). An ice volcano above the clouds with 8 fights, ending at the boss **the Rimeheart Colossus**. Cold and heat meet in every fight: Sulphur Fumes, Slippery 25, Hail 2, Frigid with Lava Spout, Ash Rain, Scorching with Hail. It is a volcano map, so it has the Day 4 / Night 2 glow, Scorched Ground in the big fights and the volcano's odds on 22-6 and 22-8. Its rewards are 3 Rares and a Super Rare (the Caldera Snow Leopard). **The Long Burrow (22-LB) is still attached.**
- **Map 23: The Goldfeather Siege** ⚔️ (`m23`). The warfield outside the Magnate's walls, with 8 fights: war elephants with archers in their howdahs, trenches, trebuchets and the Barbican. It ends at the boss **Marshal Tuskwell**. Arrow Slits shoot down from 23-5 on. The **War Elephant** is the first creature with Arrow 2 twice.
- **Map 24: Goldfeather Keep** 🏰 (`m24`). **Breach the Gate**, then the Bailey, the Counting House, the Courtyard, the Battlements, the Gilded Guard and the Treasury, and finally **the Magnate Duck** (Legendary, King; Midas, Bounty, Swipe, Shield Call). The map's Super Rare is the Gilded Swan Knight.
- **Volcano Glow:** the volcano maps that have day and night (20, 20-A, 22) run **Day for 4 rounds, then Night for 2**, instead of 3 and 3. It is a per-fight rule (`phaseDay` / `phaseNight`), and Edit skirmish has a Day / Night box for it. The phase pill counts "2/4" by day and "1/2" by night, and the Environment card has a Volcano Glow row.
- **New field effects**, each with an Environment card, a battle-log line, a look, an Edit skirmish entry and an Effects library staging:
  - **💨 Sulphur Fumes** (`sulphurFumes`): from round 2, every unit that doesn't resist fire, isn't Dry and isn't Flying is Choking that round (−1 Attack on everything it deals). It does no damage and adds no poison. It is on **20-A-2 The Wraith Vents**, **20-A-6 The Vent Crabs** and **22-2 Steam Vents**.
  - **🌋 Ash Rain** (`ashRain`): both castles take 1 a round (never below 1), and day bonuses are halved, as under Cloudy.
  - **🌫️ Ashy** (`ashy`, or `ashyAfterEruption`): Flying units are grounded (no Flying dodge, no Tailwind or Headwind), and attacks at units miss 1 in 5. Darksight, Keen Sense and Sonar see through it. On the volcano maps, every **Eruption** leaves the ground Ashy for 4 rounds.
  - **🏹 Arrow Slits** (`arrowSlits`, 2 by default): the defenders' walls shoot a random unit on your side each round. A Helmet can turn the arrow.
- **Arrow ×N:** a card can loose its Arrow more than once a round (`arrowCount`; it is a hidden skill in the editor). The War Elephant has Arrow 2 ×2, and its card shows two Arrow 2 lines.
- **17 new cards, with no art yet:**
  - Map 22: Rimefire Salamander, Fumarole Ibex, Ashwing Ptarmigan, Caldera Snow Leopard, Rimeheart Colossus.
  - Map 23: War Elephant, Howdah Archers, Testudo Tortoise, Trebuchet Crew, Marshal Tuskwell, Great Gate.
  - Map 24: Goose Sentry, Mallard Halberdier, Tax-Collector Teal, Battlement Heron, Gilded Swan Knight, The Magnate Duck.
  - The boss cards and the Great Gate are enemy-only.
- **Map looks:** a procedural background for each new map (`tools/make_map_backgrounds.py` m22–m24), battlefield gradients, a Frostfire title theme (Map 22) and a Fortress theme with a new battlements silhouette (Maps 23–24), map music and ambience, and decor sets.
- **Plan: `docs/synergy-curriculum-2026-10-17.md`** (+ `.xlsx`). For Maps 0–40 it covers:
  - where each skill, synergy pair and field effect is met, felt and combined;
  - a Codex "Works well with" design;
  - showcase decks;
  - the Tinker's Workshop, Armourer, Chrysalis Grove, Caravan Trader and Brewmaster, with the map where each unlocks.
## 2026-10-17 (skills)
- **Reflect (reworked, 🪞):** a shot aimed at it bounces off and hits a random unit on the shooter's side (their castle if they have none), as the Reflect unit's own shot (it can be dodged; it never bounces again). Shots: Arrow, Fire Arrow, Ice Arrow, Twin Shot, Volley, the five Bolts, Spitfire, Snipe, Fireball (the whole burst bounces), Rocket, a thrown Banana, Missile / On Ready damage, a Damage trigger at a random enemy, the castle's bolt. Not shots: melee, Pounce, Skyfall, Meteor, Lightning, Earthquake and the other area hits. The old melee "Reflect N%" is gone; an old number is now that % chance to bounce. Mirror Moth (was 30) and the Reflect test card (was 100) are plain Reflect now.
- **Vanguard N (new, 🎖️):** at the start of the game the next Vanguard card in your deck moves into your opening hand and a random other card from it is discarded (once a game; skipped if one is already in hand). As your first card of the game: +N/+N (default 1).
- **Web N (new, 🕸️):** its hits Web the target for N rounds (default 1). Webbed (a status with its own colour and gloss): it can't dodge (no Evasive, Swift, Flying, Prey or Tide dodge) and can't move or be moved (Wave, Tornado, Restless, a Bloodlust leap).
- **Bloodlust (reworked):** no number now. When it kills the unit facing it, it leaps to face the nearest enemy creature (not a Structure) with a free slot of its own side in front of it (open boards; packed rows close up by themselves). It deals half damage (rounded up) to Structures and castles. The Skills Codex adds: its leap counts as entering, so an enemy Ambush or Sentry facing the new slot strikes it. Was: Bloodlust N, +N Attack for drawing blood, up to +3N. Piranha Shoal (was 1) is plain Bloodlust.
- **Ambush N:** strikes any enemy unit that enters the slot facing it: played, spawned (tokens, hatches, reserves stepping up) or, on open boards, moved in (Wave, Tornado, Restless, Converge, a Bloodlust leap). Was: only a card played there. Engine: `watchScan`, run after every card lands, before melee and after every attacker's turn.
- **Sentry (new, 🗼):** once a round, while Ready, it attacks an enemy unit that enters one of the 3 slots facing it.
- **Crab Claws:** never attacks the unit in front; with nobody to either side its claws reach the castle (was: it attacked straight ahead).
- **Leech:** the engine's old `sap` (heal on hit by the damage dealt) is in "+ Add Skill" as Leech, with a card line and a chip.
- **New skills on no card yet:** Carrion N (heal N whenever another unit dies), Hoard N (+1 Attack per N Lumber you hold), Venom Master N (your units' Poison / Bleed hits add N more), Fletcher N (your units' arrows +N), Herbalist N (every heal on your units +N), Shatter N (+N damage to Frozen units). Fester (damage from its own Poison) and Electricity (+1 on wet units) already existed; fire-on-fire waits for a Burning status.
- Tests: `tests/skills-2026-10-17.js`.

## 2026-10-16 (field effects 2)
- **19 new field effects**, built and selectable in Edit skirmish (Hazards and rules), each with an Environment card, a battle-log line, a look and an Effects library entry. **No map carries them yet**; map placement is a separate pass. Engine: `fieldEffects2Tick` and the helper block near `rules` in bramblewood-engine.js; texts: `FIELD2` in arena_app.js; tests: `tests/field-effects-2026-10-16.js`.
  - **Tide** (`tide`): the Flood/Ebb cycle as a field effect of its own, Flood from round 2.
  - **Landslide** (`landslide`): each round a 1 in 4 chance of rocks: 5 damage to every unit that isn't flying (Mountain Climbers are spared too).
  - **Consternation** (`consternation`): every card in each hand loses 1/1 each upkeep, and keeps the loss when played (0 Attack and 1 Health at the least). Hand cards show what they have left; a 😰 badge on the unit.
  - **Crushing Depths** (`crushingDepths`): 5 water damage to every unit each round; Tide units and Swimmers take half, water Resist halves it again (a resistant Swimmer takes 1). No day or night under it.
  - **Rook's Row** / **Bishop's Path** (`rookRow` / `bishopPath`, Map 12's lines): +2 for a hit on the unit square in front / on the slant (interlocked ranks, Fork prongs, Backstab, Crab Claws).
  - **Mirage** (`mirage`): each round a random unit gets a 1/1 Illusion in a free slot right beside it (none if both are taken), copying only Flying, Tide, Swimmer, Haste and Speed.
  - **High Canopy** (`canopy`, Map 13) and **Undergrowth** (`undergrowth`, Map 15, the same rule without the Flying and Bounty parts): Pounce +2, Swift (and Quick) units Evasive; High Canopy also takes away Flying's dodge and gives Bounty +1.
  - **Tall Grass** (`tallGrass`, Map 15's add-on): Stealth units attack first; Backstab hits and Pounce deal double.
  - **Slippery** (`slippery`, a %; 50 by default): every attack at a unit misses 1 in 2, and every trigger and on-hit skill fails 1 in 2. Very strong, so the number can soften it.
  - **Glass-storm** (`glassStorm`, one-off): a Sandstorm (with its wind) whose glass buffets every unit for a random 1–3 each round.
  - **Hail** (`hail`): 3 ice damage to every unit each upkeep.
  - **Lava Spout** (`lavaSpout`): one random column bursts each round, 3 fire damage to the units there, both sides.
  - **Scorching III**: the existing Scorching at level 3 (4 units a side, 3 fire), next to Scorching II.
  - **Leylines I / II / III** (`leylines1/2/3`, independent): I strengthens the zeitgebers (a plain Diurnal / Nocturnal / Crepuscular is +3/+3, a numbered one +2/+2 more; Tide +3 Attack on Flood, Armor 3 on Ebb; Full Moon and Moonborn +2/+2 more). II: +1 Lumber a round for each side. III: +1 Lumber and +1 Stone a round, but every unit and both castles take 3 magic damage (a castle never drops below 1 from it).
  - **Haunted** (`haunted`): each round one random unit on each side is **Frightened**: it doesn't attack that round (👻 badge). Ghosts and Atheists aren't scared.
- **Atheist (new skill, on no card):** half damage from magic and from Devilry and Ecclesia attackers; the Leylines' burn doesn't touch it; never Frightened.
- **Sandstorm brings Windy's random wind** (unless the fight sets its own wind); its field card stack shows the Windy card.
- **Tide-spout is one-off:** it is on Pebble Beach's 2-4 only (was every Pebble Beach fight), and it no longer brings the Tide in. Flood and Ebb come only from the Tide, High Tide, Perma-tide / River Rapids, or a Moonpull / Tsunami card. The spout's column fades in and out about twice as fast.
- **The tide pill shows whenever a tide runs**, also on maps with no day and night (it was hidden there).
- **Flood and Ebb look clearer:** a light blue (Flood) or wet-sand (Ebb) tint washes over the board, each wave carries a foam line, High Tide's wave is bigger, and the water line at the board's foot keeps a drifting foam edge on Flood and glints on Ebb.
- **Side maps in daylight** (Tutorial, Clovermead …): the map pushes in only a little (×1.3, was ×4.5) and the side map grows from 90% (was 35%).
- **Edit skirmish:** the add list offers every hazard and rule (Swamp Fever, Freezing, Sandstorm and River Rapids were missing), every added effect has its chip, and one-off effects say "(one-off)".
- **Leader light stays a look:** a leader's glow lights nothing in the rules (only Illuminate does); a test holds it.

## 2026-10-16 (results and rewards)
- **No rank lesson box:** the results no longer show "🎉 Rank A! Well fought. Keep 90% of your castle…" (or its E/S/SS/SSS versions); the rank hex already says it.
- **Packs in First Clear:** the skirmish preview shows just the pack, no name. Hovering or focusing it opens a small card with its name and "Faction rewards!" (a free pack says how many cards).
- **Rank-locked card rewards:** a card reward that needs a rank wears that rank's small hex emblem on its corner instead of a separate "B+" pill; a card that only needs the first clear shows nothing extra.
- **Card reward ranks:** none needed on Maps 0–5, B from Map 6, A from Map 21 (was B from 5, A from 15, S from 30). S only when a fight sets it itself (`cardRank` on the node).
- **Enemy deck preview:** open from the start on Maps 0–5 (unless the fight asks for an A or S); from Map 6 it still needs a B clear. A locked deck shows just 🔒, without the rank emblem.

## 2026-10-16 (fight and rewards UI)
- **Graveyard preview:** just the cards (the Removal Zone's under a thin 🌫 rule), no titles, counts or close text, in a speech bubble whose tail points at the pile.
- **Battle log:** plays and attacks are the headline lines; every other line (status damage, effects, draws, readies) sits one step in. Penance and Blood Tithe now have log lines, a castle's own hit reads "Your castle hit …", and an event with no sentence that still hurt something says so.
- **Results rewards:** the main currencies (Maple Leaves, Magic Dust …) are one row of same-size pills; materia, a rescued baby and Base growth sit on a row below. The "✨ N for Base growth" pill is gone: a Base card already at its top level shows greyed, its dust bursts into the Magic Dust pill and the pill counts on up.
- **First Clear box:** centred, with no empty space on the right (it had a spare grid column). A won box whose label is wider than 80% of it shows just the ✓.
- **Pass:** it now sits in the deck's row, centred in the room before the Graveyard (between the Deck and the Graveyard on a phone), says just "Pass", and is squarer.
- **Bounty bubble:** "+🪵" (the number only above 1), no "Lumber" word.
- **Toasts over "Tap to skip":** while the reward reveal or a VS screen is up, toasts sit above its bottom label and over it.
- **Auto-Sweep results:** a sweep opens a results card (the fight, wins out of runs, Maple Leaves and Magic Dust counting up, Collect) instead of a toast.
- **Tutorial map:** T-2, T-3 and T-4 stay hidden while the two tutorials are played, then appear as you reach Map 1, Map 8 and Map 18.
- **Locked skirmishes:** the bramble ring is a true circle (it was lemon-shaped).
- **Win screen:** the "+3 XP" bar with its glow that floated over nothing is gone; the reward coins find their pills as they fall instead of where they were mid-animation; an account level-up waits until the results close, then plays over the page.
## 2026-10-16 (skills 2)
- **Wind is random now:** each round rolls its own wind. Windy: at your back, in your face or calm (1 in 3 each). Gale: always strong, either way (1 in 2). The field cards, pills and the Effects library say so; it used to flip back and forth on a fixed beat.
- **Amore (new skill, 💕):** when an Amore unit arrives and one of your Amore units already on the field shares a Type with it, the two pair up: +0/+3 and Regeneration 3 each. Once in each one's life, only ever those two; enemy units never pair with yours. When one dies, the other's heart turns brown 🤎: it keeps +0/+3 and loses Regeneration 3. Hearts drift between the pair; the unit's details say "In love" / "Heartbroken".
- **On Pitch (new trigger), card text "Scavenge - …":** every unit of yours on the field reacts when you pitch a card, with any trigger action. "Scavenge" is a placeholder name (Kindling and Salvage were the other ideas). On no card.
- **Stun N:** each landed hit has a 1 in 3 chance to Stun the target for N rounds (default 1). The old % values (Red Dragon 50, Cinder Hornet 30, the test card 100) read as Stun 1; cards.json now says Stun 1.
- **Cataphract Destrier:** the old "On Ready: deals 6 damage" is gone from the card (cards.json, and a published edit that still carries it, as it loads). The purple 🗡 counter that climbed to 8 is **Scar**: each hit from an enemy with Scar (Magma Titan, Scar 2) adds it for good, and every later hit on the unit deals that much more. Why it could not be removed: that old field had no row in the card editor, so there was nothing to delete (and a plain Save dropped it silently). The editor now opens it as an On Ready → Missile 6 trigger, which shows and can be removed. The published row: `supabase/oneoff/2026-10-16_cataphract.sql`.
- **Pounce N, <Att> or <Hp>:** Pounce can deal the card's own Attack or Health, worked out as it lands. In hand it reads "Pounce <Att> — When played, deal <Att> damage …"; on the board the number it dealt shows in blue.
- **Burn 1 Lumber (a trigger cost) and Fire on hit (new action):** every trigger has a "Pay" field: nothing, or Burn 1 Lumber (with no Lumber, the trigger doesn't go off). Fire on hit N: this attack's hit also deals N fire damage (meant for Map 20 as On Attack → Burn 1 Lumber → Fire on hit N). "Burn 1 Lumber → Heal an ally N" works the same way. An ember leaves the Lumber pill; the flare shows on what it hit.
- **94 new cards**, one for every skill that was on no card (Swift, Crab Claws and Restless stay off cards, as decided on 10-14 / 10-15), each a new animal (Jay Pilferer, Lovebird, Tardigrade, Sperm Whale Elder, Starfall Owl …). No art yet, not on any map; stats fit the stat budget for a suggested map. List: `docs/new-cards-2026-10-16.md` (+ `.xlsx`).
- **Clean names:** no braces, notes or "one-off" in skill names. "Diurnal – { }", "Nocturnal – { }", "Full Moon – { }" and "Tide – { }, { }" are just Diurnal / Nocturnal / Full Moon / Tide, with a "Gives" field (Stat bonus or Skills); their card lines read "Diurnal — By day (and in Twilight) it has Evasive, Thorns 1." "Bloom (conditions)" is Bloom When. One-off is a small tag beside the row. Dropdown options lost their bracketed notes (Cower: Hide in its shell / Flee and heal 2; Wave: Alternate).
## 2026-10-16 (archetype frames)
- **Archetype card frames:** every archetype has its own front frame. Devilry: dark iron, blood runs and pentagram studs. Ecclesia: white marble, gold and a stained-glass plate. Scrappers: riveted scrap-metal plates and a hazard stripe. Evolution: pearly shell ribs with cells in the plate. Exiled Ones: cracked ash, a dead thorn vine and a wilted rose. Forgotten Ones: dust, cobwebs and candle wax. Ancient Ones: weathered runestone with glowing runes. Outer Ones: a violet starfield. Void: black, an event-horizon rim and black holes on the corners. Each carries its emblem on both sides. A unit of an archetype wears the archetype's frame; a structure keeps its rickety boards, in the archetype's materials with the emblem nailed to its posts. Castles and field cards keep their kind's frame. Only Devilry, Ecclesia and Scrappers have cards today; the other six frames are ready for when they do.
- **No more top-right archetype mark** on cards that wear an archetype frame: the archetype corner mark (the 🙏 for Ecclesia, ⛧ for Devilry…) and the ⛧ Dark Summon corner badge are gone; Dark Summon is still in the card text.

## 2026-10-16 (fight flow)
- **Stuck fights fixed:** a fight could freeze with a card played but no round coming: Pass turn, playing, pitching and Auto-play all did nothing. The card was on the board in the engine, but an error in one of the play's effects or log lines stopped the turn before its round, and every retry hit the same error (and gave the CPU another turn). Now one commit runs at a time, the CPU acts once a round, the play's effects can't stop the round, a round that breaks always hands the turn back, and a watchdog starts a played turn's round if it never began. A card you play or pitch while the turn is already committing just shakes.
- **Map 0 lessons can't trap you:** outside the guided tutorial, a lesson gate (the pitching lesson, "That one looks tough") no longer blocks Pass turn, Auto-play, Forfeit, Quit, the speed button or the log, and a lesson lock whose bubble is gone lets go.
- **Upkeep:** the round-start effects (a castle's own action, the field's ticks) play out before your turn opens. Your hand dims, an "⏳ Upkeep" chip shows on the field, and play, pitch and Pass wait until it ends.
- **Herb Refinery:** its brew is a visible 🧪 thrown on a shallow arc that lands in 0.44 s (was over a second). The same quick throw for every castle shot.
- **Castle damage numbers** pop on that side's HP bar, where its fill ends, not in the middle of the field.
- **Normal hits are audible:** every hit now has a mid-range thwack. Before, only hits of 4+ had any sound laptop and phone speakers could play.
- **Killing blows:** the "−N ✖" stamp is gone. When the killer has an On Kill trigger (or Momentum, Midas Touch, Slash & Burn), a ✖ pops on the target as the blow lands, darts into the killer, and the trigger plays as it arrives.
- **Deaths start at once:** a killing blow no longer waits out the hit's beat; the death plays as the number lands.
- **Triggers:** when a trigger fires, only the card's own ⚡ badge for it glows. No rune ring, card glow, aura or lightning bolt.
- **Quick on the castle:** a Quick unit hitting the castle dashes straight at that side's HP bar, and every Quick hit dashes (it was once a round).
- **Battle log ✕:** the open log has a close button.
- **Fight preload:** as a fight opens, the art of every card either side can field (decks, hands, leader, the tokens and spawns they bring), both castles, the field's cards, the card backs and the arrow sprites are fetched and decoded, the effect glyphs are painted once off screen, and the sound engine is woken.
## 2026-10-16 (effects polish 2)
- **Electricity's arc is lightning, drawn by itself:** the arc's bolt (and a wet target's extra zap) is drawn by the hit it deals, and the number pops as the bolt lands (about 0.07–0.22 s, not a second later). Its damage was already lightning ("shock") in the rules, and it still ignores Armor (only melee hits meet Armor), but it now looks like lightning too: a yellow ⚡ number, a ⚡ burst and a pale-blue flash.
- **Momentum's icon is ⌰**, on the card, in the float and in the battle log.
- **Immolation:** the immolating unit has the fire on it. Its neighbours flash with warm light, glow orange at the edge and show fire-coloured 🔥 damage numbers, with no flames of their own.
- **Armor:** when Armor cuts down a hit, the 🛡 on the card's skill strip lights up and there's a metal "konk". Hits Armor didn't reduce stay silent. Hit events now record how much Armor took off (armorSoaked).
- **Pack:** the 🐺 that pops over the card when the pack grows is half the size.
- **Sap:** its red drain drops are half the size.
- **Lantern / Illuminate on play:** no 🏮 or moths. The light swells slowly out of the unit, settles, and fades as its lasting glow takes over.
- **Night-blind eye:** it blinks once when it first appears, then stays shut. After that it blinks only rarely (about 1% a minute). Every sight miss (darkness, Night-blind, Sun-shy) now just says "Miss!", shown on the unit that was swung at.
- **Illuminate lights the unit facing it:** a Night-blind unit directly facing an enemy Illuminate (or Lantern) unit doesn't miss for night-blindness. Card texts say so. Test: tests/nightblind-illuminate-2026-10-16.js.
- **Dark Sight eyes are centred:** on flyers they were about 3 px left, because they were centred on the card's wrapper rather than its hovering tile.
- **Pounce is more aggressive:** a slower, deeper crouch (0.24 s, was 0.12), a quick spring to the top, then the dive onto the card in 60% of its old time. The hit lands when it always did.

## 2026-10-16 (effects polish)
- **Heals take Poison off first:** every heal (Regeneration, Heal, Bloom, Nursing, Healing...) removes 1 Poison counter per point of healing before anything else, then Bleed as before, and only what's left restores Health. A poisoned unit with Regeneration uses it even at full Health. Each counter removed hops out of the card's Poison badge, and the badge counts down.
- **Dusk:** no setting sun any more. The board gets the static shadow bars across it and a faint warm tint from the west.
- **Bite:** one row of teeth on each jaw, and the jaws close all the way so the teeth mesh. Each tooth is white at the tip and fades toward a faintly red root.
- **Flying attacks:** no more swoop line. A flyer attacks with the normal lunge while its shadow draws in under it, so it looks like it dives.
- **Heal and Regeneration:** the heal's pluses are green (the ➕ emoji showed grey), including the one in the heal number. Regeneration's orbs start along the card's edge, invisible, and sink into the centre with a slight turn. They're brightest halfway in and fade out at the centre, then the heal's pluses rise.
- **Immolation:** the fire stays on the immolating card and moves with it. The units it burns only char. The flicker no longer throws flames across the screen, and that fix also covers heat and lava scorches.
- **Lantern light in the dark:** about half as bright and much wider. It stops at the battlefield's edge and no longer spills over the hand and HUD.
- **Chain lightning:** each bolt starts fading as soon as it appears, and the jumps come 20% closer together. Voltaic Eel's grey ball is gone. It was Electricity's arc: the arc reaches the screen as a ranged hit with damage type "shock", which has no projectile look, so the default grey ➶ flew to the unit beside the target. That hit now throws nothing, because the lightning is its look.
- **Arrows are 30% smaller:** Arrow, Fire Arrow, Ice Arrow, Twin Shot, Volley and Pierce, plus the Volley rain arrows. Boomerangs are the 🪃 emoji, not arrow art, so they're unchanged.
- **Effects Lab:** the entries for all of the above show the new looks. Old looks are kept as B variants where it helps to compare (swoop, Immolation, the Eel's grey ball). There are new heal-vs-Poison variants on Heal and Regeneration.
## 2026-10-16 (skills)
- **Two Devilry payments (new, on no card yet):** **Penance N** — "When played, deal 3 damage to your own castle." **Blood Tithe N** — "When played, deal 2 damage to a random ally (your castle if there is none)." Payments, not hits: Armor, Bulwark and the castle's Shield don't stop them, and a castle never pays below 1 Health. Icons ⛧🏰 / ⛧🩸, a dark ⛧ pulse sinks into the castle or the ally that pays, a battle-log line, editor rows, Effects library stagings. The stat budget counts them as a discount (skill cost `-v`: minus their number).
- **Ambush N (reworked):** "When the enemy plays a card into the slot facing it, deal 3 damage to that card." It strikes as the card arrives, Waiting or not; it can't be dodged and no Guardian steps in. The old "first attack always crits" is gone. Cards with Ambush (Venomlord Serpent, Subterraneaner, Trojan Raider) read as Ambush 3.
- **Expose N (reworked):** its hits put N Expose counters on the target. Each later hit on that unit is a crit (double damage) and removes 1 counter (it was +1 damage). Attacks at an Exposed unit still can't miss, so every counter becomes a crit. A swing that rolled its own Crit isn't doubled twice. The hit chip says "🎯 Crit!".
- **Perma-tide** now says "Always Flooded" (field card, pill and the Effects library).
- **Statuses on a unit's details:** hovering a unit in play lists each status it has right now under its skills, with its count, in the status colour: "Poison 3: takes 3 damage at upkeep, then loses 1 stack."
## 2026-10-16 (frames and titles)
- **Card front frames by card kind:** every card face (board, hand, Codex, deck editor, the big card views) now wears the frame of its kind, the same four kinds as the card backs. Units keep the walnut look, polished: a gold inlay round the art and brass corner pins. Structures get the same frame knocked together from weathered planks: uneven boards, crooked and bent nails, rope lashings on two corners, a split or two, a top board that overhangs the corners, and the whole frame a hair off true. Castles get dressed stone and gold with ruby and sapphire corner caps. Field effects get the Environment card's mossy stone and gold line. Rarity borders, the legendary gold rim and leader rings stay on top; the name scroll, stat pills and skill strip haven't moved. Pixel-art 9-slice images (`tools/make_card_frames.py`, `art/frames/`).
- **Murgle Mayhem's title:** entering the daily dungeon plays the same ribbon-banner title as the other maps (the Ice Hollow kind), in a new **dungeon** variant: a darker veil, a dungeon wall behind, a stone ribbon with moss trim, stalactites and bats, and swamp slime dripping from the top of the screen and down over the ribbon. The subtitle reads "Daily dungeon". Any dungeon can use it (`THEME_OF` → `'dungeon'`, or `variant:'dungeon'`); it's in the Effects Lab map titles.
- **Cataphract Destrier:** new flavour text, a nod to a certain gilded knight on the first road: "Gilded from crest to hoof, it keeps the old road out of the wood. Most who meet it there turn back. The wise ones come back later." Stats unchanged.

## 2026-10-16 (11:00)
- **Dungeons tab name:** with one daily dungeon open the Play tab reads its name (Murgle Mayhem); from the second on it reads Daily Dungeons, like Raids. Hidden until one is open, except in Admin Mode. The Babel Spire doesn't count (it takes no tickets).
- **World map:** every daily dungeon you've opened is a diamond beside its map that takes you straight in. Locked ones aren't drawn; admins see them marked 🛠️.
- **🗝️ key:** a small key with your Dungeon ticket count sits beside Home and Arena at the top right of the Play screens, and beside Home on the other screens. It opens the dungeons.
- **Errands tab on the Notices:** the board has two tabs now, Notices (daily and weekly, as before) and Errands, which lists only the errands folk asked of you on the road, never dailies or weeklies. Each errand is a big, straight parchment writ: title, who asked, their words, the task with a progress bar and count, the reward, and a wax-seal Claim.
- **Errand progress toasts:** when an errand moves on, a toast says so wherever you are ("📜 Errand: Pests in the Reeds — 7/12", "📜 Errand complete: …"), one per errand, with a fight's changes gathered into one.
- **Journeys hidden for now** (`JOURNEYS_HIDDEN` in arena_app.js): no board, no fight-step label, no toasts and no steps taken. Admin Mode still sees them, marked hidden.
- **Worthy is now Bounty everywhere:** every card that had Worthy N has Bounty N (with both, the larger). Published edits and cards saved in a browser that still say Worthy (Trash Panda Trickster, for one) change to Bounty as the game loads them, and so do skill grants and triggers. The engine no longer counts Worthy as Bounty.
- **Worthy is free for later:** it's kept as an empty, hidden slot. It isn't on any card and doesn't appear in card text, the Codex, tooltips or the keyword list.
- **Tide evade (test, off by default):** while the Tide is in (Flood, Ebb or High Tide), Tide units are Evasive against attacks from units without Tide, whatever their own skills, on both sides. To turn it on: Admin → 🧪 Rule tests, or the Test Lab panel (admins only, and only while Admin Mode is on). You can also add it to a skirmish in Edit skirmish ("Tide evade (test)"). Sims and tests use the `tideEvade` battle option or rule. While it's on, the Tide pill and the Tide chip mention it, and dodges play the normal Evasive effect.
- **Live database (your "Apply it"):** the feedback table, world events, server fight seeds (T3), the admin player list (S1), anti-cheat tier 1 (S2) and the new co-op rooms table are applied. Player rating is now server-only, so the game no longer writes it.
- **Card backings by card kind:** four pixel-art card backs. Units get the base design: the acorn mark in a gold medallion on a green weave. Structures get its timber-and-iron sibling: crossed mallets, plank boards, a stone frame. Castles get a regal back: crimson damask, a gold frame with rubies, a crowned keep. Field effects get a mossy back with vines and a day-and-night disc. Each face-down card shows its own kind's back: the pack opener before you flip, the draw flip into your hand, an enemy card flying in, a full-hand pitch, reward reveals, the home-screen card fan and the back of a card you spin in the viewer. The deck piles hold a mix, so they show the unit back (the pile never gives away your next draw). Images are in `art/backings/`, made by `tools/make_card_backings.py`.

## 2026-10-16 (09:15)
- **Skill marks on the card face:** 51 skills that sat on real cards with no mark now show their icon on the card's skill strip, with the number when it's more than 1. Among them: Nocturnal, Diurnal, Bleed, Regen, Guardian, Swarm, Arrow, Stealth, Pierce, Crit, Freeze and Shock.
- **Festering is now Lingering**, so it no longer reads like Fester. Lingering: Bleed and Poison don't wear off while it's on the field. Fester: extra damage equal to its own Poison.

## 2026-10-16 (07:30)
- **Feedback:** every note now carries the player's id (their account, or their guest session), their player name, whether they're signed in, and the time. The table still waits for "apply it".
- **Blacksmith:** a recipe stays hidden until you've held every card it uses (and its result, when the result can be found elsewhere). With none yet, the anvil says how recipes appear.
- **Flora:** the Wild Veggies line (Maps 20+) is now called Flora: the card plan sheet, the map look and the notes.
- **Skill audit:** all 216 skills checked against the engine. The full table is in `docs/skills-audit-2026-10-16.md` (and `.xlsx`).
- **Names:** Divine Retribution is now Retribution, Satiety is Well Fed, Revivificated is Revive (saved cards are unchanged).
- **Card text:** every skill has a short line now. Freeze, Sleep, Paralyze, Blind, Make Tipsy, Confuse, Shock, Stagger, Chained and Revive showed nothing on the card before. Pounce, Ice Arrow and Counterattack now say what they really hit.
- **Amounts:** Rabid N (Poison, default 2), Durian N (Thorns, default 1) and Dynamite's blast damage (default 5) can be set in the editor. Existing cards play the same.
- **Editor:** the status skills label their numbers Chance % / Rounds (they said Timer / Damage). Stun and Reflect start at 50%.
- **Keywords:** Exposed, Bound, Toxin, Smoke, Scar, Irradiation and Shield are coloured with a short meaning; magic, water and psychic damage are highlighted; plural and "&" skill names match.
- **Skills Codex:** lists the status skills, Explode, Render, Revive and Progeny too. Every skill line has an icon.

## 2026-10-16 (06:30)
- **Field art:** every Environment and weather card now has its own pixel-art scene (27 NightCafe images, about 20 credits):
  - Darkness, Pitch Black, Absolute darkness
  - Gale, Windy, Cloudy, Mist, Night, Twilight, Full Moon
  - River Rapids, Perma-tide, High Tide, Tide-spout
  - Swamp Fever, Freezing, Frost, Frostbite, Sandstorm
  - Scorching, Scorched Ground, Lava Tide, Petrification, Eruption
  - Boss surge, Deep mines, Rain
  - An unrevealed "?" card still hides its picture. The art is in `art/fields/`; `FIELD_ART` in arena_app.js says which card uses which.

## 2026-10-16 (05:30)
- **Quick:** the hit now lands with the dash (about 0.15 s), together with the speed lines, instead of after the normal wind-up.
- **Cave fire pits:** at most 3 per map, spread along the trail.
- **Map titles:** peaks, desert, volcano and night maps now use the Ice Hollow ribbon banner instead of the cinematic letterbox. Swamp, mist and fungal maps keep the ink style. The lab still shows all three.

## 2026-10-16 (02:00)
- **Combat animations:**
  - Cards no longer jump left or right between rounds or on victory.
  - Misses play the attack, and Evade dodges right on the blow.
  - Cleave is one arc across three slots, 0.2 s apart. Pounce leaps onto its target and hops back.
  - Day/night sweeps in gently.
  - Victory comes up over the crumbling castle, and castle damage numbers rise from the HP bar.
  - Restored the old shuffle.
  - Full Moon howl, new wind (soft or strong, north or south), wavy heat haze, armour glow, Bounty "+N" to Lumber.
  - Poison is 40% less dark, and poison deaths use bubbles.
  - Normal deaths drop straight down once.
- **Battle board:**
  - Guardian plates sit behind other cards and break on death. Clicking the graveyard shows its cards.
  - Pills are one size. The initiative coin sits on top, tinted by the field.
  - The fight backdrop takes the field's colours.
  - Rarity borders on the field, with a ring on leaders.
  - No empty grey strip. Costs of 5+ show as icon + number.
  - The enemy's resources are mirrored on its side, with a pitch-into-ground animation.
  - A turn # pill after the match.
- **Rules:**
  - Illuminate (Lantern's new name) and a faint leader light in the dark.
  - Swift is off enemies. Pounce goes for the unit opposite first.
  - Bounty and Worthy are merged.
  - Cleave, Fork and Pitchfork side hits can miss.
  - Sudden death: from round 20 every landed hit kills, and from round 25 any castle damage destroys the castle.
  - Simpler Darksight text. Structures are immune to poison.
  - Nursing skill and Nest mastery.
  - Deck-out surrender only when the enemy is truly out.
- **New skills (on no cards yet):**
  - Wilting, Venomous, Toxin, Weaken, Bulldoze, Tangleweed, Strangle
  - Invincible, Invisible, Sonar, Poison Gas, Spitfire
  - Slash & Burn, Predator & Prey, Nova, Absolute Zero
  - Mountain Climber, Crystallise, Cure, Trap, Taunt
  - Molting reworked and Bludgeon fixed.
  - New basic card: Sheep (Taunt).
- **New field effects (on no maps yet):** Swamp Fever, Freezing, Sandstorm, River Rapids, Scorching II, Cloudy.
- **Hidden skirmishes:** five revealed by clues (4-H, 8-H, 10-H, 14-H, 17-H), and three "jumpers" that land on the trail (5-J splash, 13-J ghost, 19-J meteor).
- **Pages:**
  - Dark maps are blotted out until cleared, and fire pits light as you win.
  - Trail lines meet node centres. Map arrows go the right way.
  - Murgle is on the World map, and there's a new **Dungeons** tab (tickets: 1 a day, plus 1 on Mondays). The Long Burrow (Map 22, admin preview) and the **Babel Spire** tower (from 20-10; BR 555 + 25 per floor; levels to 20) are there too.
  - Raid parts show X / Y HP left.
  - Forge sorts like the Codex, the hammer sound hits on the blows, and the Blacksmith text has contrast. Codex corners are no longer cut off.
  - Sunken Depths art is redone.
  - Deck editor: Save sits on the ready row.
  - Community defaults to Friends, with woodland friends and recently played.
  - Medals are on Profile, and quests are on the Notice board.
  - Max Energy now goes Nest 20→30, Forge 30→50, Tavern 50→60, paid in Dust and materials.
  - Tavern recruits with Beer (1–3 a week).
  - A 💬 feedback button (the database table is waiting for "apply it").
  - Noto emoji option. Skills Codex filter.
  - Map titles: a title sequence per biome the first time you open a map each session.
- **Effects Lab:**
  - The stage stays visible while you scroll, and the variant buttons sit in a thin right column.
  - 66 map-title and grandeur entries plus 31 new fun effects (fireworks, ink-brush reveal, CLASSIFIED stamp, stained glass, gacha capsule, lantern festival…).
- **Art:** the armoured boar is now Tusked Vanguard. New card Snapstick Turtle.

## 2026-10-15 (22:30)
- **The big effects sweep:**
  - The inventory lists 933 effect moments: every skill, status, darkness level, death, castle moment, card treatment, foil, pack reveal, map, menu, reward and future feature (`docs/effects-inventory-2026-10-15.md`).
  - All of them are now in the **Effects Lab** with search, filters, a coverage meter and a "Variants to choose" view.
  - About 1,300 variants in all. Where the look was uncertain there are A/B/C takes side by side; the game uses A.
  - **Highlights:**
    - Blind and dark units look blinded, and the lights go out when darkness starts.
    - Each darkness level has its own miss.
    - There is a death for each cause, plus a King's fall and a boss death.
    - Status wear-offs and lost turns now show.
    - Mythic, Ancient, Divine, Void and Daemonic each get their own pack reveal, and a foil pull gets a FOIL reveal.
    - 22 new foil concepts.
    - Every map and side map has its own ambience.
    - A wax-seal stamp on cleared fights, trails that draw themselves, and a map-cleared celebration.
    - The account level-up moment.
    - Damage colours for magic, water and true damage.
  - Per-batch notes are in `docs/fx-batch-a..f-status.md`.
- **Fight rules and field pills:**
  - **Exposed:** +1 damage per hit, and attacks on the unit can't miss.
  - **New skills:** Bloodlust and Full Moon.
  - **Plain and advanced forms:** Diurnal – {…}, Nocturnal – {…}, Full Moon – {…}, and two-facet Tide – {…}, {…}.
  - Flow is now **Flood**. Swimmer is retired, and its 33 cards now have Tide.
  - The field pills show only the current state: Day/Night X/3, Wind ⬆⬇ and Flood/Ebb/🌊🌊. They're no longer clipped, and the forecast pill is gone.
  - Map 0 has a Mist pill showing "?".
  - The empty middle slot comes back when a row is empty.
  - The Pounce "line" was a visual bug and is fixed.
  - The Spawn corner pill is gone.
  - The ambush skips its extra steps. Losing it costs 10 to 15 + 5 per map Maple Leaves (max 100).
- **Pages:**
  - Home buttons go to their own pages.
  - The Forge is out of the Codex tabs; Log, Deleted and Reference are admin-only.
  - The Codex shows 40 cards a page without splitting groups.
  - Wildpaths text is halved.
  - The Sandbox picker shows compressed cards.
  - Skirmish deck previews show tooltips on hover (1 s) or hold (0.5 s).
- **Game text spreadsheet:** `docs/game-texts.xlsx` has 6,523 rows, 466 of them keyed. Edit the New text column and send it back; `tools/text/import_texts.py` applies it. The forfeit text is changed as you asked.
- **Card placement proposal** (nothing moved): `docs/card-placement-proposal-2026-10-15.md` and `.xlsx`.

## 2026-10-15 (fifth list)
- **Exposed:** Expose N makes the target Exposed for its next N hits: +1 damage from each, and attacks at it can't miss. A red 🎯N badge, a log line, the crosshair look on every Exposed hit.
- **New skill Bloodlust N** (on no card yet): when its attack draws blood (hits a Bleeding enemy, or makes it Bleed), +N Attack for the fight, up to +3N. A red heartbeat pulse.
- **Pounce** hits one random enemy, as it always did; it now leaps at that unit instead of drawing a column of ghost cards up the board (that column read as a line of damage; Windy had nothing to do with it).
- **Time-givers, plain and advanced:** Diurnal / Nocturnal / Tide / Full Moon keep their simple bonus; the advanced forms list what they get instead: "Diurnal – {Evasive, Thorns 1}", "Tide – {+5/+5, Evasive}, {Armor 2}" (Flood, Ebb; both at High Tide), "Full Moon – {…}". New plain **Full Moon N** (+N/+N for good once a full moon rises over it). All editable in the card editor.
- **Flow is called Flood** everywhere players read it (pills, tooltips, the log, card text).
- **Swimmer retired:** the 33 Swimmer cards carry plain Tide now; Swimmer is gone from the editor and the lists (the engine still runs it).
- **Board pills say only the state,** inside the board: ☀️/🌙 X/3 (the moon's phase is the Night icon when a card cares), 💨 with its ⬆/⬇, 🌊 Flood / Ebb / 🌊🌊. No "next round" pill. Map 0 has a Mist pill that says "?"; later misty maps add a Mist card: "There is no day/night cycle." (and "The Moon is not visible." where the moon matters).
- **The ambush (surprise challenge):** clicking the skirmish pops a quick "Ambush!" window, then the fight starts at once. Lose it and the raiders run off with 10 to 15 Maple Leaves on Map 0, the cap rising 5 a map to 100.
- **The middle slot** shows again when your row has no units. **No "🔁 Spawn" corner pill** on tokens. **No "a rule of this battlefield"** line on Environment cards.

## 2026-10-15 (skill reveal)
- **Skills you learn later show as "?":** Diurnal, Nocturnal and Crepuscular stay "?" until you enter Map 1; Tide and Swimmer until Map 2. The "?" sits on the card's skill strip and in its text ("Something about this card you'll learn soon."); the Skills codex, coach tips, teaching cards, phase and tide pills and battle-log lines don't name them either. The skill still works in fights, a reveal is remembered, and Admin Mode shows everything. The list is one small table (`SKILL_REVEAL`), so more skills can be added.
- **Map 0 is misty:** no day and night (so no nightfall, howl or night sounds there). Its Mist shows "?" ("Something hangs in the air here. You'll learn more soon.") and Map 0 never marks a field effect as learned; learning by seeing starts on Map 1.
- **Evade → Evasive** (the Swimmer pick's label).
- **Hive Mind retired** from the card editor, the Effects library, the reference and the Test Kit (the engine still runs it).
- **Fish carry Tide:** Blind Cave Fish, Mangrove Mudskipper and Wrong-Way Salmon.
## 2026-10-15 (11:45)
- **Fork, Trident and Pitchfork now work alike:** each hits the 2 / 3 / 4 nearest enemy units no more than 1 / 1 / 2 columns away. With no enemy unit that near, it attacks straight ahead as normal. Fork no longer skips the unit in front or sends an empty side to the castle. 14 cards have Fork, 1 has Pitchfork, none has Trident.
- **Crab Claws is back:** each swing pinches a random enemy unit to its left or right (straight ahead if neither has one). No card has it yet; the crabs still Fork.
- **New skills, on no card yet:** Ice Arrow, Twin Shot and Volley; the Bolts (Fire, Acid, Poison, Ice and Shock Bolt: a spit at the enemy opposite every round); and Chilli N (when first Ready: +N Attack and fire attacks, but 1 damage to itself every round). Each has its own effect in fights, the 🔬 Effects library and the Effects Lab.
- **One-off skills:** skills that belong to one animal (Coffee, Chilli, Banana, Durian, Rabid, Meteor...) carry a small "one-off" tag in the card editor and the Skills codex.

## 2026-10-15 (09:00)
- **Master hub:**
  - It opens on a dashboard: Your calls and Planned first, then the latest changes, stat tiles and links.
  - New **🎴 Cards** tab with every card's art, filters and details: stats, skills, source, win rate and which decks use it.
  - **Search** across the whole hub (press /).
  - The changelog is collapsible, tabs sit in a sidebar, there's a theme toggle, and nothing is cut off on phones.
- **29 new skill effects:** Flying swoop, tide splash, armour block, fork prongs, pierce, stun stars, freeze, sleep, paralyse, acid, ink blind, fear, curse, mark, clock tick, parry, mirror, crown crack, stealth, scar, life drain, pollen, aura, rage, revive, summon portal, Lumber arc and prayer light.
  - Skills with their own effect: 61 → 105 (of 182). Weighted by cards, 437 → 633.
  - They show in fights, in the in-game 🔬 Effects library and in the hub's Effects Lab ("Even more skills"). The full list is in the effects catalogue.
- **Difficulty with the new starter deck:** Map 0 win rates dropped. 0-1 is 52% (was 67%), 0-2 60% (70%), 0-3 5% (12%) and the 0-4 boss 7% (17%).

## 2026-10-15 (05:30)
- **Fight ids match what you see:** Thistlewood's f-1 is now 1-1, the first map's fights are 0-1…0-4, side maps read like 1-A-1, and so on (226 fights, 36 maps, plus the endless dungeon). Old saves, map layouts and published skirmish edits are translated when they load; nothing in the database was rewritten.
- **Tutorial and early maps:**
  - No more Start screen.
  - Part I shows an 8-card deck plus its 1 reward. Part II adds the leader and 2 rewards, for a 20-card deck. 9 baby cards (1/2) fill the 17-card base behind the scenes.
  - **0-1** gives one card, which you're asked to swap in. **0-2** gives your faction pack, shown in its First Clear box. The **Camp (Armoury)** opens once both are cleared, at 0-3, and any pack held until then opens at that point.
  - Instruction tips say "Okay" instead of "Skip".
  - Cards flying into your deck now pass over the label.
  - Only the one highlighted card glows gold.
- **Packs:** the results screen shows "🎁 Pack won!" with the pack art. Leaving it, the pack floats up into the opener. Several packs show as a pile you open one by one, and the pile shrinks as you go. The Nest button stays hidden until the Nest is unlocked.
- **Swaps:** after the first one, you're offered up to 10 swaps in total, only when a new card strictly beats one in your deck. Clicking Swap shows "Nice!" and the window closes faster.
- **Deck editor:** click adds a copy; Shift-click (or right-click, or the small "−") removes one.
- **Skirmish preview:**
  - The First Clear box is shorter and sits at the right, with "First Clear" on its border. Claimed rewards aren't greyed out.
  - The title has room under the Fight again pill.
  - The panel fits its contents.
- **Fight:**
  - The battle waits for a summon (your leader too) to finish before the first attack.
  - **Deaths playing before the attack that caused them:** 0.5× speed was applied twice, so lunges ran 4× slower than the damage numbers. Tokens that spawned and died in the same round were never drawn. Both are fixed.
  - Speed: Shift-click or a long press goes slower, and 0.5× is in the cycle even in Admin Mode.
  - Stone (and Metal/Uranium) costs sit top-left with Lumber.
  - Electricity is 🔌.
- **Tide:**
  - Playing a Tide or Swimmer card no longer brings the tide. Only field effects (Perma-tide, Tide-spout, High Tide), Moonpull and Tsunami do.
  - Swimmer reads "🏊 Swimmer – On Tide, …" again.
- **Darkness:**
  - Night alone no longer makes units miss. Misses come from the field effects **Darkness** (1 in 4) and **Pitch Black** (1 in 2).
  - Smugglers' Grotto is Pitch Black. Caves & Alcoves, Mycelium Deep and Sunken Depths are Darkness.
  - Night-blind units still miss 1 in 2 at night.
- **Field pills and dialogue:**
  - Field pills sit at the left and show just an emoji and count, such as "☀️ 2/3". Details appear on hover.
  - The Night/Day tip reads "Night and Day alternate every 3 days…".
  - NPC lines come 1 s apart and stay up to 8 s; click to move on.
  - The dialogue panel sits further left on the map. Interactibles open it expanded.
- **Map 0** shows its field effects plainly; the "?" starts on Map 1. Misty now says "Mist hides the sun and moon: Diurnal and Nocturnal bonuses never apply."
- **Admin:**
  - New **🃏 Showcase cards** panel: one map at a time, pick each skirmish's showcase with one click.
  - "Check the whole map" runs 30 fights per skirmish without freezing the page, and a re-check takes 67 ms when nothing changed.

## 2026-10-15 (03:15)
- **Starting levels:** faction cards and the Wandering Traveller now start at Level 1, and their printed stats are their Level 1 stats.
- **Card editor budget line:** one score, **Budget: Max(A, B) against N**. A is Attack × Health + Skills and B is 2×Attack + Health + Skills.
  - The colours are green at or under N, red over N, and pink when well under N (60% of N or less).
  - Level is fixed at 1, so the Level picker is gone, and the Map picker is smaller.
  - The Test Lab's ⚖️ Stat budget page and its Fit button use the same rule. The old rule had two checks: the added score under N + 2 and the multiplied score under N.

## 2026-10-15 (02:45)
- **Regeneration:** the green zig-zag at the end is gone; the spiralling motes and the soft glow stay. A unit at full health no longer regenerates at all. Before, a bleeding unit at full health still "regenerated" to stop its Bleed.
- **Castle crumble:** the enemy Bramble now crumbles completely before the Victory sign and results. The hit-stop on the killing blow could slow the crumble so much that a safety timer let the results through halfway. It now always plays at normal speed and pauses a beat afterwards.

## 2026-10-15 (02:00)
- **Missing card pictures fixed:** Bee Drone, Bee Knight and Forager Ant lost their pictures because about 50 published admin edits from 10-12 had saved each card's own image file path. The WebP change renamed three of those files. The game now ignores a saved path that just points at the card's own built image and shows the current art. This also lets later art changes show on those 50 cards.
- **Art:** Bee Drone (your NightCafe image), Bee Knight (bee set, bottom left), Sandstorm Roc (bottom right), Otter Kit (top-left otter), Barrow Leech (bottom-right bat). Kraken Spawnling moved to the dark kraken (top right) so the Colossal Squid can have the top-left one. The sparrow on Shrine Bell-Ringer was already the top-right one.
- **New cards (not placed on maps, budget v2):** Colossal Squid (4 Lumber, Wait 3, 4/10, Fork, Gash 3, Tide), Lantern Spark Fly (2/5, Flying, Lantern), Baby Bat (1/5, Flying, Nocturnal), Baby Horned Capybara (2/6, Thorns 1).
- **Your 21:49 images:** Scraper of Skies has the new hive-tree art. The new **Red Dragon Egg** (Legendary, Wait 12, 0/10, not obtainable yet) cracks open into the Red Dragon when Ready. It's the first egg that hatches into one set card rather than a random one.
- **Deck previews** show the castle's art instead of the 🏰 icon.
- **Rarity lesson** now says cards run from Common up to Epic, without naming each, and calls a Very Rare or Super Rare card Rare.
- **Fight and field:**
  - Tide wording: pills say only what Tide units get, and in a fight the Tide chip turns blue and says the current bonus. Wash is removed (it only ever worked on Flow), so 6 cards lose it.
  - Each field effect is its own ENVIRONMENT card with a mossy frame. The High Tide card reads "Periodic High Tides" and the Tide-spout card "A spout pushes a column back".
  - Home ground is gone.
  - Push-back now has an animation: the card slides back with "⏪ +1 Wait".
  - Volcanic ground damage is renamed "Scorched Ground", and its damage numbers now stay on screen.
  - After an Eruption, comets fall for 3 rounds (2–5 each, halved for fire-resistant units).
  - The heat haze is fixed. New 0.5× speed. Forfeit asks in the centre over a dimmed backdrop.
  - The Lumber lesson only shows when you hold a Lumber card you can't afford yet.
  - Cleared dark maps are brighter. Only the map zooms into a sub-map, and the new map grows in.
- **Pages:**
  - Auto-sweep naming.
  - One loss rank on the Defeat screen, counting Armour damage, with the extra pill removed and the tip box background fixed.
  - Pick a skirmish's showcase card in the editor.
  - Wyrmslayer, To the Caldera and Eye of the Volcano now need a real win.
  - Field kit wording says "skirmish".
  - Inventory hides items you never had, marks new ones New!, and greys used-up ones. Wider tab margins.
  - **Packs open at once:** cards are credited when the pack is given, and old unopened packs open on load.
  - **Cobble, the Forge golem**, explains the Forge and says why something can't be done.

## 2026-10-15 (01:00)
- **Faster loading:** large card art is now shipped as WebP (same look). The game's image files dropped from 32 MB to 11 MB, so a Codex page of 50 cards loads about a third as much. The source art stays PNG.

## 2026-10-15 (00:15)
- **Card plan workbook:**
  - The 23 cards made today are now on the Plan sheet, each with a suggested home and its budget v2 check. Five come out over budget at their suggested map: Vampire Bat, Wandering Mage, Arc Bat, Hammerhead Shark and Ironback Gorilla, mostly on the Attack × Health check. The fitted stats are noted; no card was changed.
  - A new **Wild Veggies** sheet has 12 plant-card proposals for Maps 20+ (rooted ones like Venus Snaptrap and Durian Duke; walking ones like Turnip Brawler, Pumpkin Knight and Mandrake Screamer), built from existing skills. Tick the ones you want.

## 2026-10-14 (23:30)
- **Fights:**
  - Day/Night, Flow/Ebb, wind and the forecast are now pills on the board's middle line, and each one explains itself on hover or tap.
  - The terrain and lasting field rules ("Open Meadow I", Frigid, the volcano…) show as a field card beside the enemy's deck.
  - The opponent's Lumber is top right.
  - Leaders now drop in with a flash, a ring shockwave and a "👑 <Leader> joins the fight!" callout (and a shake for big ones).
- **Side maps** that aren't dark just zoom into the entrance and back out of the new map; caves keep the dark dive.
- **Stat budget v2:** N = 10 + 5 per Wait + 4 per Lumber + 0.2 per map + level (Level 1 to its top level adds up to +10) + rarity (+2 a step, Mythic +20). A half-miss skill (Evasive, Swift, Flying, Shadow, Blind) multiplies the score ×1.5, and Bounty costs 0. It's in the Test Lab, the card editor and the Skill N sheet.
- **New skills:**
  - 🤺 **Fencing:** Evasive and Swift can't dodge it; Frillneck Duelist has it instead of Bludgeon.
  - **Fireball** (on Ready, 15 fire to a random enemy and the units either side) and ☄️ **Meteor** (on Ready, 20 that ignores Armor, splash to the units beside it, and the column burns).
  - 🍌 **Banana** (Bramblewood Macaque) and 🍌🪃 **Bananarang** (Howler Monkey).
  - **Durian** (War Drum Mandrill): may gain Thorns each round.
  - 💠 **Shield:** temporary Health, and a Shield trigger action.
  - 🔌⚡ **Electricity:** arcs to the next unit, stronger on wet ones. On Voltaic Eel and three new cave bats: Voltwing, Static and Arc Bat.
  - 👃 **Keen Sense:** moles ignore darkness and Blind.
  - 💭 **Psychic N:** extra damage that nothing blocks; minds only.
  - **Smoke Bomb:** each round, maybe smoke an ally (attacks miss it half the time) or blind an enemy. It's on the new Smokescreen Raccoon.
  - Banana, Bananarang, Boomerang and Smoke Bomb are Evergreen.
- **Crabs Fork again**, shown with a crab claw 🦞. Crab Claws is retired.
- **On Death → the killer** as a trigger target: the new **Blister Beetle** poisons whoever eats it (5 Poison).
- **New cards** (not placed yet): Hammerhead Shark, Ironback Gorilla (Bludgeon), Voltwing / Static / Arc Bat, Smokescreen Raccoon, Blister Beetle.
- **Limit break** now needs lifetime duplicates by rarity, shown as a pill board with holes:
  - 10 for Common, 9 for Uncommon;
  - 8 for Rare up to Super Rare;
  - 7 for Heroic and Epic, 6 for Unique;
  - 5 for Quest-Unique up to Mythic, 4 for Ancient;
  - 3 for Divine and above.
- **Rarity lesson:** once, in the Codex, after 50 different cards and your first Very Rare.
- **Crafting** needs a card you've held, not just seen.
- **Codex: 🔢 All by ID** toggle shows one unsectioned list of every card by card number, 50 a page; it's remembered.
- **Art:**
  - Your images for Rootworm Colony (purple lichen), Bee Drone, Rivergate Tribune and Bramblewood Macaque.
  - The electric bats.
  - New NightCafe art for the new cards and all seven eggs.
  - The 193 cards from the earlier NightCafe batch now use their raw originals (no extra pixel pass), which keeps faces sharper.
  - Every card now has art.

## 2026-10-14 (21:00)
- **🔬 Effects library** (Admin → Effects library): every skill, trigger event, trigger action and field condition (254 in all) on a live stage. ▶ Play runs it through the real fight engine with its effects and sounds, ↻ Reset sets it up again, 0.5× slows it down, and a log shows each event and the damage it did. Field conditions show their look too (the Tide coming in and floating the swimmers, rain, fog, night, the volcano). A few things that need a bigger setup (leaders, Structures, Dark Summon) say so instead.

## 2026-10-14 (20:00)
- **New skills:**
  - 🦞 **Crab Claws** (hits left or right only; on Sulfur Vent Crab and Open-Ocean Hermit Crab).
  - **Sacrifice - {}** (a trigger when the card is sacrificed; in hand it shows a set of dark teeth across the art).
  - ⏲️ **Charge N - {}** (a yellow clock top-right starts when the unit is Ready; at 0 the effect fires and it starts again).
  - 🧫 **Meiosis N** (splits into two halves on death).
  - 🚫 **Nullify** (its hits get no reaction; what it kills goes to the Removal Zone).
  - 👣 **Restless** (moves every round; on no card).
- **Freeze is a clock now:** freezing adds icy counters shown on the Wait clock with snowflakes; each upkeep melts one instead of ticking Wait, same total delay. Stunned units have circling stars.
- **Evergreens:** 🌪️ **Tornado**, 🏔️ **Avalanche**, 🌊 **Tsunami**, all on arrival with a board-wide sweep. **Dragonic Spire** skills: 🐉⚡ **Dragon Lightning** (red bolts that ignore Armor) and 💀 **Wither** (max Health falls for 3 rounds, no healing). The Dragonic Spire map itself is listed for later.
- **Eggs are cards:** seven egg cards (Woodland Egg, Speckled Egg, River Bundle, Leathery Egg, Cocoon, Roe Pearl, Den Bundle). On the board they hatch into a random card of their kind when Ready. You get one the first time you set that egg in your Nest.
- **Esprit** now counts spawned units too, and only allies that share a type.
- **Screen shake** for big arrivals (over 20 Health, growing to 200) and big hits (over 15, growing to 100).
- **Fights:**
  - The sun and moon are gone; the field shifts colour temperature through the day (warm day, amber dusk, cool blue night).
  - New **Misty** condition: no day or night, and the fog drifts from orange to blue and back.
  - The deck pile is tighter and sits in line with the hand, and the gap to the board is smaller.
  - Phones get an icon-only top row and compact skill chips.
  - The Lumber lesson never asks you to pitch the card that needs the Lumber.
- **Pages:**
  - The Codex pager is now at the top as well.
  - The Nest and Forge put costs inside their buttons.
  - The Nest hides costs until you tap a card, greys out cards you can't afford ("Need 3 more Kibble"), and Kibble rises with each card of that species you train.
  - Deck cards show pictures, rating, total Attack and Health (and the count only when it isn't 20).
  - The Forge text has better contrast, and the swap offer is a proper sheet on phones.
  - The "Claim it on the Achievements board" line is gone.
- **Sheets:** a "Skill N values" sheet for you to set each skill's budget weight (tools/cardplan/import_skill_n.py brings your numbers into the game), and a "Factions & regions" sheet with the key skills per faction and region plus three subfactions: the Ashen Covenant (cultists), the Great Herd (savannah giants) and the Mycelium Choir.
- **Card editor:** shows the card's budget score against N for its map, level and rarity.
- **Art (NightCafe, 23 images):**
  - New: Big Bee, Frog, Fly, Gale Sprite (now a wind swallow), Guardian Shield (a golden pangolin), Growth Sprout, Insect Swarmling, Maggot, Malachite Golem (a blind crystal beetle), Mirrorhide Mutant, Nest Hatchling, Trojan Raider and Rabid Jackal.
  - Redone: Quarry Troll (a stone donkey), Webspire Sentinel, Yeti, Glass Golem (a glass armadillo), the Puddle Changeling at its reflection, and Rootworm Colony (lichen).
  - For the new cards: Rafflesia, Puffball Bombardier, Otter Angler and Honeyjoe Brewer.
- **Cards:**
  - Renamed: Big Bee, Frog, Fly.
  - MissingNo moved past World 1, and can't be obtained for now.
  - New, not placed: Rafflesia, Puffball Bombardier, Otter Angler and Honeyjoe Brewer.

## 2026-10-14 (17:30)
- **Caves and the deep have no day or night** (Caves & Alcoves, Smugglers' Grotto, The Sunken Depths had been left on Night, with a moon showing in a cave). Sable Swampmire and Pinewood Taiga stay always-night.
- **Lantern light in the dark:** in pitch-black and absolute-dark fights the field is shadowed except a warm pool of light that follows your pointer (it drifts by itself on touch). The cards don't move.
- **Difficulty re-measured** after today's rules (Speed, Tide = Swimmers, day/night by map and the rest): a mid-strength deck now wins 90–99% on Maps 1–9. The spikes are the Map 10 boss (35%), Map 14 boss (43%) and Map 16 boss (8%). The numbers are in the ⚖️ Balance tab.

## 2026-10-14 (16:15)
- **Bloom (conditions): +2/+2** while its conditions hold, e.g. "Bloom (Tide & Night)" or "Bloom (Wind or Wet)". For the plant cards to come; the old heal Bloom is unchanged. Units in bloom show 🌸.
- **Irradiation sounds:** a sizzle as stats burn away, Geiger-counter clicks when radiation is handed out.
- **〰️ Wave:** a hit pushes the target one column left or right (swapping if someone's there). On Dolphin Knight, Reef Manta Glider, Moray Ambusher and Tide Pool Crab.
- **Perma-tide** on the river maps (Sunken Hollow and Lilypad Reach): the Tide is always in, and tide effects can't change it. Shown in the Map Codex.
- **Blue Dragon: Supreme Tide** (double Tide bonuses, every round).
- **🥚 Brood N:** swarms hatch 1/1 brood that count for Swarm (Bee Drone, Carrion Fly Swarm, Swarm Matriarch).
- **Pack, reworked:** Pack units of the same type in an unbroken line each get +2/+2 per member (two: +4/+4, three: +6/+6). A **Pack Leader** links every same-type Pack unit on its side, adjacent or not, and adds its own +2/+2 plus +2/+2 for the shared type; a two-type leader leads two packs. Irradiation strips Pack 2 at a time. The AI places Pack cards next to their pack.
- **New art** for Owl Fletcher, Owl Nightwatch and Bee Drone, as real animals, made with NightCafe's Flux 2 Klein model in a 16-bit pixel style (no extra pixel pass, so faces stay sharp).

## 2026-10-14 (14:30)
- **Energy starts at 20 again.** The Camp raises it cheaply to 50 (+5 a step, 40 to 240 Maple Leaves); the Forge takes it from 50 to 60 (+2 a step). Anyone who already had 50 keeps it.
- **Swimmers are Tide units** (they gain Flow and Ebb) and float on the board. **Moonpull** on Moon Jelly brings the Tide in at once. Pebble Beach has a **Tide-spout**: a water geyser in one column each round starts the Tide, pushes those units back and soaks non-swimmers.
- **Day and night come from the map**, not from cards: outdoor maps cycle; caves, the undersea and dark places have none. Daylight is warmer with a sun and rays; night has a clear moon and stars.
- **Irradiation tokens:** each round every ☢️ token takes a point from Health, Attack or a skill (skills weaken, then vanish), then the tokens drop by 1. Card details show the change in colour.
- **Ghost** takes half from elemental attacks (only magic is full); new **Shade** and **Shadow**. **Supreme** beasts (the five dragons, still hidden) hit with magic, ignore Armor and Ward, and halve non-magic damage.
- **Twin** (Puddle Changeling, new Mirrorhide Mutant) and **Growth Sprout** tokens (1/3, count for Swarm) with **Sprout N**.
- **Your art is in:** Sunspire Envoy (the bottom-right bird), Tide Pool Crab, Cave Bat Swarm, Upside-Down Bat and Bat Swarmling. New cards: **Shallows Fry** (the green-water fish), **Vampire Bat** (3/4, drinks what it deals) and **Wandering Mage** (the wizard cat, a free leader for Map 51).
- Late-game plan written up: docs/design-2026-10-14-late-game.md.

## 2026-10-14 (12:45)
- **Volcano hazards with odds:** Lava Tide (lava floods a column), Petrification (a unit turns to stone for a round) and Eruption each roll every round from round 2. A fight's volcano level sets the odds: Very low 1/2/3%, Low 10/12/14%, Medium 20/22/24%, 1 in 2 45/50/55% (rising each round), High 60/65/70%. The fight conditions show the band word, not the number. Old fights with a fixed eruption are unchanged.
- **New skills for the maps after Map 20:** 🐇 Speed (the fastest units swing first; ties keep today's order), 🏃 Haste (+2 Speed, neighbours +1), 🤬 Rabid (hits poison 2; double damage from water), 🫣 Cower (hit last round: it hides in its shell, or flees), 👻 Ghost (normal attacks pass through; magic, fire, poison and acid still hurt), 🪄 Magic attacks (a blue wand on the card instead of the sword), 🧪 Ichor (attackers take acid, lose 1 Armor and bleed, even Ghosts), ☢️ Irradiated (withers itself and the units around it: lost max Health and Attack).
- New card: Rabid Jackal (2/3, Rabid), not placed on a map yet.
- **Name picker** (docs/name-picker-2026-10-14.xlsx): every candidate name for Base (15), Otters (15), Hummingbirds (15) and 6 per biome, with my ★ suggestions and a ✓ column that counts your picks.

## 2026-10-14 (11:30)
- **The new foils can drop from packs:** Aurora, Galaxy swirl, Molten gold, Frost crystal, Oil slick, Sakura, Glitter field, Holo scanlines and Cards of old are now rare prints in every pack's foil roll (each about 2–3% of foils), and each adds to a card's collection bonus. Admins can tune the odds in the pack editor.
- **Frozen units shatter:** a unit that dies to cold breaks into ice-glass shards (the Lab's shatter).
- **Pack hauls ripple:** a wave runs across the cards when the pack summary is laid out.

## 2026-10-14 (10:45)
- **Leader tutorial:** the first time you open the 👑 leader picker, the traveller explains that only Heroic and above can lead. Your first Heroic card brings it back ("this one can be your leader"), and the card itself speaks; if you skipped the first note, its line comes first.
- **D39:** 🍴 Pitchfork hits the 4 nearest enemy units within 2 columns (no Pierce). 🔱 Trident hits the 3 nearest within 1 column, never the castle.
- **Castles crack and crumble procedurally:** random-walk "miners" chisel cracks as Health drops, and a cellular automaton eats the castle along them when it falls, with rubble chips.
- **"Cards of old" finish** (aged paper, foxing, creases) for admins in the inspector and workbench, and a new Effects Lab tab, Procedural FX: shatter, Flip riffle shuffle, lantern light, a scrubbable forge timeline, a ripple wave.
- **💬 Dialogues:** every conversation, its speakers and where it plays, as a hub tab and a spreadsheet with an "Add your own" sheet. Any card's name works as a speaker and shows that card's art.
- The hub's Action items now open with your calls and the planned ideas.

## 2026-10-14 (10:15)
- **Eight new foils are in the game:** Aurora, Galaxy swirl, Molten gold (with drips), Frost crystal, Oil slick, Sakura (falling petals), Glitter field and Holo scanlines. Admins can try them in the card inspector and the Card workbench; none is handed out by packs yet.
- **Level-up burst:** tempering a card in the Forge, or training a hatchling to Level 1 in the Nest, now plays the Lab's level-up rays and "LEVEL N!" ribbon on the card.

## 2026-10-14 (09:30)
- **The Effects Lab's skill effects play in real fights** (Medium effects and up, at most once per unit a round): Regeneration knits a unit back, Poison and Bleed ticks show a cloud and a drip, Thorns bite back at the attacker, Helmet deflects with a ping, Earthquake cracks the field, Frost and heat show on chilled and scorched units, Swarm, Cleave and Quick attacks get their own strikes, Evasive and Swift units sidestep, and Lantern, Darksight and Guardian units glow, scan or raise a shield wall when played.
- Your new ideas (Electricity, Keen Sense, the Hammerhead, a sledgehammer bruiser, stat budget v2) are written up in the action items, not built yet.

## 2026-10-14 (03:30)
- **Card plan workbook** (docs/bramblewood-card-plan-2026-10-14.xlsx): every card sorted into Base, the two factions, the tutorial, Maps 0–21 (4 uniques each), fodder for the Ocean, Swamp, Ice, Volcano and Cave, the Mystery pack (Map 20's side map), Later worlds (the occult and alien cards) and Retired; plus a skill curriculum (Map 0: Flying, Swarm, Regeneration; Map 1: Diurnal, Thorns, Worthy …), animal-type counts (3–6 each, 4 Elementals, no trolls, 1 changeling) and the Card Pack seller at Maps 5, 11 and 17. Extra ordinary animals are listed as Spare, not placed.
- **18 new cards, with art:** Bramble Hoglet, Clover Butterfly, The Gannet Queen, Old Snapjaw, Alpine Marmot, Meerkat Burrower, Moon Jelly, Lion's Mane Jelly, Caiman Hatchling, Mudpuppy, Harbor Seal, Snow Ermine, Ember Centipede, Cinder Gecko, Ash Moth, Cave Olm, Glimmer Spider, Field Crow. They have no source yet, for you to place.
- **New art:** Bee Knight, the Puddle Changeling (looking at its reflection in the river) and the Two-Headed Calf (one body, two heads).
- **Sharper NightCafe art:** the blur came from our own pixel step, not NightCafe. All 185 NightCafe card portraits are redone from their originals on a finer grid (96 px, 48 colours), so eyes and outlines survive; five lost their drawn frames.
- **Effects Lab:** 16 new skill effects (Swarm, Regeneration, Poison cloud, Bleed, Thorns, Earthquake, Quick, Evasive, Cleave, Guardian, Dynamite, Helmet, Darksight, Frostbite, Scorch, Lantern), 8 new foils (Aurora, Galaxy, Molten gold, Frost, Oil slick, Sakura, Sparkle, Scanline) and 5 general effects (shockwave, three castle crumbles, level up, unlock sparkle, sky drop).
- **Action items cleared:** D27, D39, D74 (built), D75, D76, D77, D78 closed; only the live-database items wait for "apply it".

## 2026-10-14 (02:00)
- **Skill Codex (Map 9)** and **Map Codex (Map 11)**: two new Codex pages. Skills lists every skill you've met, what it does and what answers it ("Answered by" moved here from the card view). Maps lists every map you've reached with the field effects you've learned there (? until seen).
- **Card view:** no repeated name or stat tiles (the card shows them); its type is the species with its family's icon; a card that brings another card shows that card and its abilities on the right.
- **Card editor:** Species picks from every species in the game with its icon, and a new one becomes its own family. Each skill row has a ＋ that adds the same skill at a later level (with a Lv picker); those level skills switch on as the card levels up.
- **Saving a card's placement** sticks now: the card editor no longer puts the old source back when you save it afterwards.
- **Cards edited in the cloud before their art existed** show their art again (Shepherd, Owl Nightwatch, Tomcat, Sergeant Bramblefox).
- **Tutorial castle health** is set beside its Castle in the skirmish editor (the castle choice now applies to the tutorials too).
- **Deck editors:** click adds a card, Shift+click takes one out (the skirmish editor's deck and its popup).
- **Classic cards removed** (Otter Centurion and Bee Knight classics).
- **Map 0:** 0-1's castle is plain; the field effect starts at 0-3 (level I) and is level II at 0-4; 0-4 teaches the castle's Shield.
- **Boomerang:** it hits and flies on far past its target; against a castle it bounces off and out the top of the map; next round it drops back in from the top, hits, and spins home.
- **Skirmish card:** a revealed deck is a strip of the real cards with counts, each opening its details.
- **Codex:** the Factions pool comes first; the skill badges under each card are no longer cut off; Full Art view is 5% wider.
- **Armoury renamed Camp.**
- **First visit to a map:** the skirmishes now fall from the sky after the map's name card lifts, each with a landing shadow.
- **Ranked Live plays Standard** (every card at Level 1), closing D74.
- Swarm: I couldn't make it count itself (a lone Swarm unit gets +0 in the engine and on screen); a screenshot of the case would help.

## 2026-10-14 (01:30)
- **Map 21: The Quiet Summit.** Above the clouds after the Sundered Peak's storm: six fights among goats, rams, yaks, owls and eagles, ending at the Cathedral Eagle. Its own snowy map, with the zoom-out on your first visit. The Test Lab sits here as planned.
- **Stomping Grounds (Map 21, after its third fight):** your Hero is trained here now, on its own page; the Armoury no longer has a Hero button.
- **The Tutorial side map.** T-0 and T-1 live in their own side map, Tutorial, entered from the left edge of Map 0; new players start there and Map 0 opens when T-1 is won. Three new fights follow for later: **T-2 The Odd Lot** (a deck of odd cards, pays a Hedgerow Pouch on the first win), **T-3 Ranks and Challenges** (teaches that tougher fights pay more and that the less your Castle loses the higher your rank, with some cards only at S) and **T-4 The Final Exam** (an elite). Their decks are placeholders for you.
- **Page row:** on every page off the map, a row of shortcuts to your other places (Armoury, Stomping Grounds, Codex, Forge, Nest, Inventory, whichever are open) and a round ↩ on the right. The Armoury's Hero and Codex buttons are gone.
- **↑ / ↓** on the map go to the next or previous map.
- **Fight | Sweep** is one pill split down the middle; Sweep asks how many runs (and holds the Idle-Sweep switch).
- **Skirmish card:** the reward box's contents are centred.
- **The Arena opens on Map 11** and **the Quest Board on Map 8** (Caves & Alcoves).
- **The Sunken Depths** (was the Sunken Ferry): its entrance is a wreck with an anchor.
- **The Glimmer Depths** gem shines once the map is cleared, and a campfire burns at its top left, its glow flickering and sparks rising.
- **Field conditions:** an unseen one shows its (?) beside its name. "Used to the cold" is gone; the units that ignore frost are named in the Frost line.
- The Armoury always shows decks at Medium (the Large/Medium switch is gone); the conversation's hide arrow moved a little right.

## 2026-10-14 (00:40)
- **Map critters and your pawn face where they're going:** moving right, they look right; moving left, they look left.
- **Art:** portraits for the seven road folk who talk to you (Brother Ripple, Pip, Old Heron Wade, Bramble, Sister Carapace, Croaker, Thimble), all 13 raid bosses and the Goliath (shown in the raid panels and the VS screen), and a map for The Sunken Ferry.
- **Stat budget:** base N is 8, plus 0.1 per map number (Map 30: +3). Still a report only; no card stats were changed.

## 2026-10-14 (00:15)
- **Your deck has thickness:** the pile grows up and to the left as it fills (one edge per two cards) and thins as you draw. An empty deck says "Deck / Empty".
- **Map interactibles lose their circles:** curiosities, the wanderer and the "?" spots are now bare icons, so they blend into the map.
- **Skirmish card:** the first-clear box is only as wide as what's in it, the New skills strip is off (Admin can switch it back on), the locked deck is a shorter slab with the rank right beside the lock, and the card is tall enough to show it all.
- **Admin on the map:** the skirmish card's admin buttons sit outside it on the right; the map toolbar says Layout, Links, ➕ Skirmishes, ✅ Clear map and ↩ Unclear map. Clearing a map by hand now also hands you its skirmishes' card rewards.
- **Codex shows only cards you've seen**, admins included (tick 👁 Show unseen to see the rest). No more Hidden/Discovered pills. 50 cards a page, or whole sources until 50 is passed, with page buttons, so it's quick again. Admins get 🎁 Get all on every section (a season, a pack, a skirmish).
- **Admin resets in Profile:** Reset all (a fresh player, your edits kept), Reset Codex (forget every card seen) and Reset to Map N (every map before N cleared with its card rewards, their features open, you standing on Map N). Each asks for a second tap.
- **Season names:** 🍂 First season, 🌸 Second, ❄️ Third, ☀️ Fourth.
- **Side-map exits:** an open-air side map's way out is the main map's own icon; a cave's mouth has a flickering lamp hanging over it.
- **⚖️ Stat budget (Test Lab):** your formula, 2×Attack + Health + Skills < N + 2 and Attack × Health + Skills < N, with N from rarity and level (Level 0: −2). Base N, the per-skill costs, a per-Lumber bonus and "both rules" or "either rule" are editable. It lists cards over budget with the stats that would fit, and Fit applies them as card edits.
- The conversation panel's hide arrow sits a little further left.

## 2026-10-13 (23:30)
- **The tutorials are skirmishes T-0 and T-1** on Map 0, joined by a trail, with no "!" on them. Part 2's button says Fight, not Fight again.
- **Tutorial Complete!** Part 1 lists only "Tutorial Part 2" under Unlocked, part 2 only "Conquest Map"; part 2 has one button, Claim Rewards (no Next fight, no Finish).
- **First visit to a map:** it opens zoomed in on where you start, pulls back to the whole map, then its skirmishes drop into place one by one. Map 0 does this once Tutorial II is won; every later map (the bigger ones too) the first time you enter it.
- **"This is the enemy Castle" holds the round** until you press Next, so you don't miss the first fight. Any blocking tip now pauses the round.
- **Leader and Wait (Tutorial II):** when your leader lands, a tip explains its Wait and the round waits for OK; then a pointer stays on its Wait until it drops by 1. Initiative waits a turn after another tip, and on an iPad a tip on the whole field sits over it, not under it.
- **Lumber, shown not told.** The first card you get or draw that needs Lumber opens a small picture: the card, its 🪵 cost, and a spare card going to the Graveyard for +1 🪵. After that, a "🪵 Needs Lumber" tag pops on newly drawn Lumber cards for a few fights. The pitching tip now plays a ghost card being dragged from your hand to the Graveyard.
- **Shorter tutorial words** everywhere, the Traveller and the side guides included.
- **Deck suggestions.** On Maps 0 and 1 the first wins each bring a card that teaches Flying, Swimmer or Diurnal, swapped in for the weakest card in your deck. Later, a clearly better card won anywhere is offered the same way (turn it down three times and it stops asking). The swap shows your deck sliding away, the weak card in focus and the new one taking its place. The Armoury opens on Map 0.
- **"Two more cards"** after Tutorial II is a small card over a darkened screen with one OK button.
- **Castle crumble:** an enemy castle knocked to 0 shakes, cracks and slumps into falling stones and dust before the result.
- **Back buttons:** every page off the map (Nest, Codex and Forge, Armoury, Inventory and the rest) opens with a big ← Back to where you came from.
- **iPad looks like the computer:** cards keep their computer proportions, and in portrait the whole hand row fits on one line.
- **Conversations:** a reminder that just played stays quiet for 3 minutes (it used to repeat), the 💬 chip counts conversations rather than lines, the panel no longer gets stuck see-through with dead buttons after a card drag, and the ▾ and 💬 fade out after 20 seconds untouched.
- **Fixes:** the NEW! tag on a first-seen enemy fades once instead of coming back; the post-fight New! cascade runs 35% faster; a yellow tip outline on a unit now draws above the castle bars.

## 2026-10-13 (22:45)
- **Murgle Mayhem (6-MM), the first endless dungeon.** A side map of Sable Swampmire (Map 6) that opens when its last fight is won. Fifty floors, 6-MM-1 to 6-MM-50, on one long trail you scroll up; the map starts at your next floor. Every floor is the same frog-and-leech fight, 4% stronger than the floor below, and every 10th floor is the Murgle King with an alligator and a crocodile. Each cleared floor stays cleared, so a loss never sends you back.

## 2026-10-13 (22:00)
- **Art for the two new cards:** the Helmeted Otter in its cooking-pot helmet and the Dynamite Packrat with its lit fuse (NightCafe, pixelized like the rest).
- **🎲 Random** on the side screen appears after 15 seconds.

## 2026-10-13 (21:30)
- **Dynamite N.** No Wait: the unit lands with a red 🧨 fuse that burns down one a round. At 0 it explodes for 5 damage to the cards beside it and the three enemy cards facing it (a 3×3 around it). If it dies first, nothing happens. New card: **Dynamite Packrat** (1/18, 1 Stone, Dynamite 3, Caves & Alcoves).
- **Helmet.** Half the time, an arrow, missile or single bolt aimed at it glances off. Its badge is a drawn helmet (the emoji set has none cute enough). New card: **Helmeted Otter** (2/8, Otter pack).
- **Signing out switches accounts.** Sign out (and Log out) now really end the session, and this device starts fresh for the next person; the account's progress stays in the cloud. Sound and effects settings stay.
- **Start the tutorial starts over.** The guides show again from part 1, and you pick your side again.

## 2026-10-13 (20:45)
- **Small cards read cleanly.** On small cards (phone hand, leader, Armoury strip) the skill badges hang just below the card instead of sitting on the Attack and Health numbers.

## 2026-10-13 (20:00)
- **Random instead of Both.** The side screen offers Otters, Hummingbirds or 🎲 Random, and hovering one shows a line of lore and a line of play.
- **The ambush.** Your first Fight on 3-2 is interrupted: a scout of the other side shoves your pawn aside, an Ambush skirmish bounces onto the map and the fight starts. Winning it pays a Faction Growth card.
- **Faction colours:** Otters red, Hummingbirds blue, neutral green.

## 2026-10-13 (19:00)
- **More UI audit fixes.** Skill badges on small cards no longer sit on the Attack and Health numbers. On phones the map's fullscreen button clears the Energy pill and toasts appear above the tab bar instead of over the HUD. The Shop drops its duplicate "Back home" button and title, and the Autobattler's header button reads "← Arena".

## 2026-10-13 (18:00)
- **Wildpaths wait for Map 21.** The Home note and the perks stay hidden until Map 20's last fight is won, and only maps from 21 on earn Path points.
- **UI audit fixes.**
  - Phone fights fit the screen: castle, deck and graveyard share a row, the leader and hand the next, and Pass turn floats bottom-right.
  - Quick Battle, PvP and other off-map fights get a map's ground instead of a flat grey board.
  - One card count everywhere (Home's Codex note, Profile).
  - The floating Play tab bar no longer covers the last Arena and Raid cards.
  - The Tavern note has its own spot on Home instead of sitting on the Play tile.
  - Readable Community title and Codex subtitle; Forge tabs scroll on phones; the Field kit heading no longer squeezes.
  - No more twin daily notices; the Test tab is called Test Lab.

## 2026-10-13 (17:15)
- **Zeitgebers.** In a fight that's day by default, the first Diurnal, Nocturnal or Crepuscular unit played starts the day/night cycle from that round (Day first), like the first Tide unit starts the tide. Maps whose designer set a phase keep it.
- **Next round forecast.** A strip by the field says what next round brings: nightfall or dawn, the tide's turn, the wind (at your back or in your face) and eruptions.

## 2026-10-13 (16:30)
- **Into the first fight.** After you pick a side, your tutorial cards arc from the top right into your deck at the bottom left while the screen zooms in, then the battlefield fades in.
- **Tutorial polish.** In part 1 the highlighted card glows only once the "drag a card onto the field" step comes up. The tutorial's ghost card is the size of the real card. Both parts end on "Tutorial Complete!" with one button, Claim Rewards.
- **The map during the tutorial.** Until part 2 is won, Map 0 shows only the two tutorials (no other fights, trails or features), zoomed in 25% on them, and a gold ring that starts 50% bigger and settles onto the Part 2 marker points the way. Winning part 2 zooms the map out from the tutorial marker and the rest of Map 0 fades in.
- **New doc:** design pushback (is it too much, is it boring, what I'd change).

## 2026-10-13 (15:30)
- **Your name, front and centre.** The entrance asks "What should we call you?" over a bigger, glowing name field, and a first sign-in with an account that never picked a name gets a name prompt in the middle of the screen.
- **Darkness (D67, D73).** No more "night dimness". At night and in caves it's Darkness: units without Darksight (or Nocturnal, at night) miss 1 attack in 4. Pitchblack: 1 in 2. Absolute darkness: every attack misses. A Lantern lights its side (Absolute drops to 1 in 2). Smugglers' Grotto is Pitchblack and Caves & Alcoves is now Darkness. Dark fights get a vignette over the board.
- **Frigid and Scorching (D66).** Frost's level is how many units a side get chilled; each gets +1 Wait, and units weak to cold also take ice damage. Scorching level L burns L+1 random units a side for L fire damage; heat-resistant and Dry units are spared, units weak to heat take double.
- **Molting N (D72):** every N rounds +1 Attack and +2 Health for good. The Tide-pool, Sulfur-vent and Hermit crabs have Molting 4.

## 2026-10-13 (14:20)
- **All 21 Wildpath marks work now.** Second Pitch (once a fight, pitch twice in one turn) and Echoing Wood (your first token each fight comes with a copy) were the last two.

## 2026-10-13 (13:50)
- **19 of 21 Wildpath marks now work in Conquest.** New since 13:15: Bark Skin (first unit Armor 1), Hedge Wall (Guardians +2 Health a rank), Old Growth (Wait 2+ units +1/+2), Sharpened Briars (+1 Attack a rank to 3-Attack-or-less units), Light Feet (first Quick unit has no Wait), Thornbite (+1 Bleed on your Bleed hits), Weak Spots (+1 damage a rank to units under half Health), Fletcher's Eye (Arrow +1), Bramble Storm (Cleave side hits +1) Pollen Drift (Bloom heals +1 a rank) and Crown of Thorns (a kill gives the killer +1 Attack). Only your side gets them. Second Pitch and Echoing Wood are still previews.

## 2026-10-13 (13:15)
- **Wildpaths work in fights.** Deep Foundations (+2 castle Health a rank), Sap Mending, Unmoving, Heart of the Wood, Forager (+1 Lumber a rank), Keen Eye (draw 4), Prospector (+1 Iron Shard on an elite's first clear) and Everbloom now apply in Conquest. The other marks say "Preview" in their panel.
- **World bosses on the road.** Every 20th map ends on a world boss. From Map 50, every 10th map ends on a harder boss, with a normal boss as the fight before it.
- **Field-kit items from quests.** An A notice or better gives items, and each finished weekly tier gives 3, 2 or 1.

## 2026-10-13 (12:30)
- **Standard PvP.** Arena → Format: Collection or Standard. Standard has its own deck, built from every card, all at Level 1, with no foils, shinies or Materia. It covers Quick Battle, Pass & Play, Gauntlet and friend invites. Collection (your own cards and levels) stays the normal format.
- **The road's last fights.** Map 0 ends on a normal fight, Maps 1–4 on an Elite, every 5th map on a boss and the rest on a miniboss.
- **Card rewards by rank.** From Map 5 a fight's card needs rank B, from Map 15 rank A, from Map 30 rank S.
- **The Armoury is on Map 1.** Every Map 0 win gives a card, and until the Armoury opens you can swap it into your deck from the map.
- **Wildpaths cost points:** 5 and 10, then 15, 20 and 25 for the advanced ones.
- **🍺 The Tavern** (Map 14) now holds the max-Energy upgrades.
- **Field conditions are spelled out.** The skirmish panel lists every condition (terrain, eruptions, wind, darkness, night, twilight, high tide, frost, boss surge). In a fight each row shows ? until it first happens, then New!, then plain text.
- **Field kit:** no daily refill (one starter fill; more will come from dailies and weeklies). **🔋 Energy capsule** (+20) for your first win on Map 2.
- **Admin:** edit Forge tier prices, send 📣 world call-outs and GM messages (once the world_events table is applied), and a launch switch that hides every admin surface.
- **Swarm and Tide** are keyword families now, not archetypes, so they lose the archetype mark.
- **New docs:** economy and monetization, co-op dungeon for 4 players, Steam launch plan.

## 2026-10-13 (11:30)
- **Faction Reward 🎁 and Faction Growth 🌱.** Two reward placeholders for any fight (✏️ Edit rewards).
  - A Faction Reward draws a random card from your faction pool. The pool holds 5 copies of each Common, 4 of each Uncommon, 3 of each Rare and fewer above. Your faction tier (10/20/30/40 cards collected) sets the odds, e.g. at 20: 50% Common, 30% Uncommon, 20% Rare.
  - A Faction Growth gives the next card of the lowest rarity you don't have yet.
  - Elites and bosses give one Faction Reward and one base card unless the fight has its own placeholders.
  - The Map 20 "crown" is retired: Growth reaches the Epic and Heroic last.
- **📊 Card check in the Test Lab.** Win-rate test on just the cards a player can meet up to a map you pick, at Level 1, next to each rarity's band.
- **Danger warnings v2.**
  - Only cards you haven't beaten warn; a card counts as beaten once you win a fight it was in. The same big card warns every time until then.
  - The ladder steps up after 2 Uncommons, 3 Rares, 4 Very Rares, 5 Super Rares…
  - A fight can name its own ⚠️ danger cards.
- **Seeing.**
  - Normal units are blind only in complete darkness (caves), unless they have Darksight or a Lantern; night alone dims no one now.
  - New **Sun-shy** (blind by day) and **Night-blind** (blind at night).
- **Twilight.** With a Crepuscular card in a deck (or on a twilight map) the day runs Day, Night, Day, Night, Twilight. In Twilight Diurnal and Nocturnal are both on, and the new **Crepuscular** only then.
- **The tide** starts with the first Tide card played.
- **Frigid** and **Scorching** are the new names for Frost and Heatwave.
- **Cleave** (was Sweep): hits the unit in front, and the enemy units on its left and right each take N bonus damage.
- **Pitchfork** hits the 4 nearest enemy units, none more than 2 columns away.
- **Shedding N:** every N rounds +1/+1, and Poison, Bleed, Corrosion, Scar and Expose come off. Grass Viper and Adder Ambusher have it.
- **Hummingbirds fence:** Quick on Crimson Wing Recruit and Duelist Cadet, Pierce 1 on Cobalt Talon Skirmisher, Pierce 1 and Evasive on Ruby-throat Duelist.
- **Flea Market** moved to Map 31.

## 2026-10-13 (10:45)
- **Danger warnings ⚠️.** A red warning crosses the field when a dangerous enemy card is played. By default the first one is for an Uncommon; each warning raises the bar one rarity (Rare, then Very Rare and up), so big-rarity fights don't keep firing it. Settings → Danger warnings sets where it starts (Uncommon, Rare, Very Rare, Epic, Legendary) or turns it off; changing it restarts the climb.
- **Wind, rebuilt.** Wind belongs to the map now. Windy maps (Gannet Cliffs, The Glass Dunes, Ashen Spurn, The Sundered Peak) get strong wind every other round; gale maps (Eyrie Heights, The Aerie Vault) get it every round. Each gust blows the other way from the last, starting at your back.
  - Flying units on the side it blows from have a Tailwind: they act twice, a quick extra turn and then their normal one.
  - Flying units on the side it blows into have a Headwind: their skills and triggers go off twice.
  - The Tailwind and Headwind card passives are gone.
- **New skill: Bludgeon** 🔨. Each hit knocks out one of the target's defences: Armor, Flying or Swimmer (Burrow when it exists), at equal odds. The Codex → Reference page has the long description.
- **New skill: Snipe N** 🎯. Every round while Ready, if nothing stands opposite it, it shoots a random enemy unit for N.
- **New cards, with art:**
  - Cunning Vixen: Evasive, Backstab 2; Briar Maze.
  - Fox Sharpshot: Snipe 3; Briar Maze.
  - Balloon Archer: a mouse in a patchwork balloon, Flying, Arrow 2; Eyrie Heights.
  - Frillneck Duelist: an upright lizard in spiked knuckles, Quick, Bludgeon, Dry; Glass Dunes.
  - Monitor Rambler: a plated lizard on all fours, Armor 2, Thorns 1; Savanna Reaches.
  - Bombardier Beetle now has its picture.

## 2026-10-13 (09:30)
- **D66, second half:** Swimmer now on the fish, turtles and tortoises, frogs, Voltaic Eel, Orca Vanguard, Narwhal Lancer and Humpback Elder (+1 Attack on Flow). Nocturnal and Diurnal still wait for a day/night playtest.
- **The new skills on cards:** Rivergate Tribune now has Kinship Otter 1/1 (all your Otters +1/+1) instead of Rally. New **Bombardier Beetle** (Uncommon, Insect, 3/10, Rocket 4) is a reward from the Morel Hollow's Web Hollow fight; its art comes next time Chrome is reachable.
- **B6 balance sheet re-run** with every card measured at Level 1, against a fixed yardstick (the filler deck no longer picks up new traits). 228 of 454 cards are in band. Tonight's new cards were tuned toward their bands: Fennec Fox 2/10, Meerkat Sentry 2/7, Thorny Devil 2/14, Buzzed Chipmunk 3/7, Scree Goat 5/14, Lone Grey Wolf 4/18, the two Heroics 8/30 and 7/18. Cost-3+ cards still read weak on this test (the test deck carries fewer copies of them), so the Heroics, Epics and Legendaries need a hand check rather than this number.

## 2026-10-13 (08:30)
- **New passive: Kinship <Type> X/Y.** All your units of that Type get +X/+Y (the card itself too, if it is one). Several stack. In the card editor, pick the Type, then Attack and Health.
- **New evergreen: Rocket N** 🚀. Fires once, when the unit is Ready (on arrival if it has no Wait): the strongest enemy unit (highest Attack) takes N Heat damage and each enemy beside it takes 1. It hits the castle if the enemy has no units.
- **D66 (first half):** Tailwind went on the big soarers (eagles, condors, ravens, gulls, Pelican Diver, Migration Leader, Hawk Arrowkeeper). Headwind went on the heavy ground animals (Marching Elephant, Siege Rhino, Permafrost Mammoth, Tundra Musk Ox, Glacier Yak, the elks and the boars). Nocturnal, Diurnal and Swimmer are still waiting for your OK.

## 2026-10-13 (overnight)
- **Otters and Hummingbirds left the packs.** You earn them through progress now: the first clear of every elite and boss gives one card from your faction's track and one from the base track. Each track hands out every Common first, then every Uncommon, then every Rare; after that it draws duplicates (a Rare can be held 4 times, so 3 more stay in the pool). Very Rare and Super Rare join from Map 10. Map 20's boss gives your faction's Epic and Heroic. Two new Heroic cards: **Rivergate Tribune** (otters) and **Sunspire Sky-Sovereign** (hummingbirds).
- **Journeys (Maps 15–20).** Five subfaction quests take you across six maps, one fight per step, and every step pays two cards: the Toll Road (Road-folk), the Call of the Wild (Wild Beasts) and the Long Harvest (Woodland Folk) finish by Map 20; the Swarm Below and the Drowned Bell go on past it. They're on the Notices board, and the next fight shows its step. Subfaction bundles no longer drop.
- **Auto, Sweep, Auto-Sweep, Idle-Sweep.** Auto needs rank S on the fight and Map 20 passed. Sweep (Map 30 passed, after an Auto win at S) plays a fight for you N times on your Energy, paying the clear-again reward for each win. Auto-Sweep (Map 50) doesn't need the Auto win. Idle-Sweep (Map 70) spends the Energy that would spill past your maximum on a fight you pick.
- **Energy:** 50 max, 1 every 5 minutes.
- **New skills:** Lone Wolf X/Y (stronger with empty slots near it), Sociable X/Y (stronger with allies near it), Coffee N (Wait −N on arrival, then a nap), Dry (half Heat damage, immune to Heatwave), Darksight, Tailwind and Headwind (Windy rounds), and the **Landslide N** evergreen (when it falls: N to the enemy facing it and both its neighbours).
- **Weather:** every round can be Windy (1 in 2) when a Tailwind or Headwind unit is out, and night now dims everyone without Nocturnal or Darksight (1 attack in 4 misses; a Lantern keeps your side lit). Design note: weather-and-time-2026-10-13.
- **New cards:** Thorny Devil, Fennec Fox and Meerkat Sentry (the Glass Dunes is now Swift, Thorns and Dry throughout), Lone Grey Wolf, Buzzed Chipmunk and Scree Goat. The Deep Cave Troll is now the **Cave Bear**.
- **Arrow** shoots the nearest enemy (random when tied). Arrow, Fire Arrow and Boomerang say they never miss Flying units.
- **Esprit** is a passive. Spells are shelved (hidden everywhere) for now.
- **Codex:** locked, unlocked and owned cards sit in one list; cards you don't own are greyed, locked ones carry a 🔒. The phyla filter shows each phylum's emblem.
- **Card editor:** saving no longer jumps the page back to the top.
- **Art:** every NightCafe picture got a chunkier pixel pass (a 64-pixel grid on a 128 card). The Mirror Moth, Elder Willow, Conch Herald and Tidewall Fort (no more "HOME BASE" lettering) were redrawn.
- **Strength analysis** measures every card at Level 1; Base, starter and quest cards start at Level 0, so their first level (+10%) is noted.

## 2026-10-12 (23:55)
- **Every card starts hidden,** Base ones included. A card shows up in the Codex and deck lists once you've seen it or own it. Untick Hidden in the editor to keep a card always visible. Explicitly secret cards still get the "✨ Discovered!" pop; the rest just appear.
- **Targets are a choice now.** Heal Self is just **Heal**, and every action that used to pick its own target (Heal, Cleanse, Damage, Buff, Debuff, Poison, Bleed, Expose, Stun, Increase Wait, Exile) takes Self / Ally / Opponent / Any, then a distance (Adjacent, Any distance, Furthest, All), then how many targets (up to 8, never the same unit twice). Missile, Swap and Mind Control stay fixed presets.
- **New skill: Nature's Force N** 🌪️ — every Elemental on your side gets +N/+N while it lives; several stack. A value of 1 is the default and isn't printed, here and everywhere (Poison, Bleed and the rest show just the icon at 1).
- **Extended art shows far more of the picture:** nearly the full width, top-anchored, fading softly behind the stats. Normal art's bottom edge now fades into the plate instead of stopping hard.
- **Editing a card no longer takes it out of your inventory.** Only a fresh re-lock in the editor revokes your copy.
- **Card editor:** stats by level include Lv 0 for cards that hatch at Lv 1; the card's source can be set right in the editor; maps are grouped into the First world's First to Fourth seasons (Maps 0–5, 6–10, 11–15, 16–20).
- **Off Base:** Chapel Sparrow, Cinder Imp, Spring Rain, Echo Keeper and Voidfeather Scout now drop from maps.
- **Card strip:** Esprit 🤝 and Rally 🚩 show on the bottom strip; the Swarm mark is a 🐜 (🐝 for bee swarms).

## 2026-10-12 (22:55)
- **Every card has art now.** PixelLab is at its monthly limit, so 145 new portraits came from your NightCafe credits, shrunk to the game's 128×128 pixel style with their backgrounds kept. That covers every card that had none (enemy-only cards and items included), plus new Owl Sentinel, Ant Hill and Ant Warrior art as real animals, and War Hound and Bramblewood Macaque redone.
- **Castle art.** All 42 castles have a picture.
- **22 new castles to find.** Two or so per map from Map 0 to Map 10, e.g. Farmstead (10 Health, +1 Lumber every 2 rounds), Village Green (20, +1 Health on every unit), Lighthouse (a bolt every round), Wrecked Ferry. They're never a set reward: a win on their map can drop one (3% skirmish, 6% elite, 10% boss), and a basic pack has a 3% chance. A castle you already own drops as a spare to fuse in the Forge, and a map boss beaten again at rank S gives a spare of its castle.
- **The Goliath's brood.** Six raid-only cephalopods (Inkcloud Squid, Abyss Lantern Squid, Glass Octopus, Vampire Squid, Goliath Tentacle, Goliath Broodmother) now fill the Goliath's parts. When the raid falls, everyone who fought it gets one; the top 10% get two.
- **New side map: The Sunken Ferry,** below Coral Current. It opens after that map's boss. Five fights in an otter ferry wreck: night all through, faster (First Blood +2), with electric eels and the Goliath's brood.
- **New cards:** Cave Centipede (Quick, Poison) and Millipede Hauler (Armor 1; when it falls, three Worker Ants climb off), both on Caves & Alcoves.
- **Shock gets the 🔌,** and the Voltaic Eel and Abyss Lantern Squid now Shock.
- **Battle ratings are real:** worked out from the enemy's actual deck at the levels it fights at. The editor shows it read-only.
- **Enemy levels flattened:** Lv 2 at Map 5, +1 every 5 maps, Lv 5 at Map 20, boss decks one higher.
- **Stamina moved to Wildpaths.** Max Energy no longer grows on its own. Every 20 skirmishes earns a Stamina mark; spend it in Wildpaths → Stamina (with Maple Leaves) for +1 max Energy.
- **Clocks:** the Energy pill reads "4/20⚡ 03:12", and Raid Points and PvP tickets read the same way.
- **The skirmish panel:** the green tick is gone, the best rank sits on the panel's top-right corner, reward cards are as big as the highlighted card, and the battle rating is a ⚔ chip beside Health and Shield.
- **The map:** interactables are bare emblems that give a little shake now and then. Only real caves (Smugglers' Grotto) keep the cave mouth, now smaller and empty. Eye of the Volcano shows the volcano, Basalt Foundry a rock, the Canopy an acacia, the Glimmer Depths a gem in a rock. The note in your pack moved to Gatorback Swamp; open it once for 🦴3 Kibble and ✨40 Dust and it's gone.
- **Edit skirmish:** card details show over the deck editor and the deck preview, and each fight picks what it summons once it's out of cards: nothing (the default), imps, bees, ants, wolves, bats, sprouts, hatchlings or squid.
- **Pack names follow their maps:** Hedgerow Pouch, Tidemire Chest and Highcrest Case.
- **Types:** non-place, non-animal types (Forgotten, Oddity, Changeling, Irradiated, Shrine, Traveller…) are gone; rule-only ones (Structure, King, Leader, Devil, Imp) are kept but hidden.
- **Balance:** Darkness from your own losses stops at 10. Skull Vulture drops on Map 8's Root Snare.

## 2026-10-12 (21:20)
- **Daily portents in PvP.** The big PvP button now shows today's portent on its right: one medallion per field effect, with tomorrow's under them and when it changes. Every day rolls 1 to 3 effects (usually 2) from day and night, weather, Lumber, home ground for any biome, First Blood and the eruption; Double Time and Collapse count as 2. About one day in seven is a **Strange day**, which opens with one of those big rule changes (a purple medallion). Holidays are fixed every year (New Leaf, Bloomtide, The Thaw, Midsummer Fair, Harvest Home, Hallow's Eve, Midwinter, Winterfeast). These are the Arena's rules for the day, in every Arena mode.
- **Edit skirmish shows its field effects.** A new Field effects box lists everything the fight plays under, marked "map default" or "set here": day and night, weather, home ground and its tier, the eruption, boss surge, enemy mining, frost tuning and leader gifts. ✕ switches one off (even a map default, such as the Tundra's frost), ↺ puts the map's default back, and "Add a field effect" adds weather, Lumber, the eruption (2, 3 or 5), High Tide, Double Time, any biome's home ground at tier I–III, or a leader gift (Immolation, Inspiring, Regen or Armor 2).
- **Hatching, Pokémon style.** The egg now cracks with drawn splits that spread on each rock, with the rarity's light leaking through; then it turns to light, beams pour out, a white flash, and the card fades in from a bright silhouette.
- **Hatchlings start at Level 0.** A card you get for the first time from an egg arrives at Level 0, about 15% weaker. Train it to Level 1 in the Nest. Training (for hatchlings and Base cards alike) now costs **🦴 2 Kibble**, 15 Dust and 10 Maple Leaves, for an hour. Kibble is new: first clears give 1 (elites and dungeons 2, bosses 3, the world boss 5), repeat wins sometimes 1, and a grown baby brings 2. Everyone starts with 4.
- **Codex:** maps are grouped 0–5, 6–10, 11–15 and 16–20, and packs go by their names: Sprout Pouch · Acorn Chest · Golden Bramble Case, the Factions pool and the Mystery Booster.
- **One Factions pool.** The Rivergate (Otter), Sunfeather (Hummingbird) and shared Riverbank pools are now a single Factions pool that every basic pack draws from. The Rivergate and Sunfeather packs you earn on the road still give their own side's cards.
- **Dropdowns open in the page** (filters, editors and the rest) instead of the browser's own pop-up, which could open on another monitor.
- **Disenchant extras** moved to the Forge, next to Fuse all extras; it's no longer in the Nest.
- **Art:** War Hound and Bramblewood Macaque were grainy; they're cleaned up for now, and new portraits are queued for when PixelLab's monthly limit resets.

## 2026-10-12 (21:05)
- **Two-stage sudden death, bosses included.** From round 20 any hit kills a unit (sudden death I); from round 30 a hit on a castle ends the game (sudden death II). A banner marks each stage. Raids only ever reach stage I.
- **New card: Triumphvirate** (Unique leader, 6/22, Lumber 3, Wait 1, Felid, Leader and Savanna): a lion wrapped in jewellery on a carpet of gold, beside a lion-mane banner. It has the new **Dictator** skill: it can only be your Leader and never goes in a deck. It has no source yet, so it can't be earned; its portrait is queued in PixelLab.
- **Art:** Pufferfish Bulwark, Komodo Warlord and Wolf Pack Runner have portraits (264 cards in all). PixelLab then hit the account's monthly generation limit, so the other 88 queued portraits are paused and saved, waiting on you.
- **Proposal:** [rarity flags, the sinking Goliath raid and co-op dungeons](design-2026-10-12-rarity-raid-coop.md).

## 2026-10-12 (20:20)
- **Keywords light up everywhere.** Card text, coach tips, field and castle text now mark game words automatically: statuses and resources in their own colour (Poison green, Lumber brown, fire damage orange…), and terms such as Pitch, Upkeep, Wait, Adjacent and every skill name in bold with a dotted underline. Pitch, Upkeep and Adjacent get a one-line meaning under a card's skills. Flavour text is left alone. Nothing is hand-tagged: it all comes from the game's own lists.
- **Simpler skill text.** Every skill now reads short and in the same words, e.g. Immolation 2: "Deal 2 fire damage to all adjacent units every upkeep"; Pounce 5: "Deal 5 damage to a random enemy unit, or the castle if there are no targets"; triggers read "On Death: Deal 5 fire damage to an adjacent enemy". Heat damage is now called fire damage.
- **Resistance, Weakness and the new Immune** are core lines at the top of a card ("Resistance: Fire"). Immune takes no damage at all from what it names (a damage type, an attacker's type or an attacker's skill); it's in the card editor next to Resistance and Weakness.
- **Granted skills are light blue**, marked "given by this fight". The Caldera Wyrm's Immolation now comes from the world-boss fight instead of its card.
- **Compass-point bullets** replace the leaves in card details.
- **Tips above the dimming:** a spotlighted tutorial tip is no longer hidden under the dark layer.
- **Enemy resources** moved to the field's top-right.
- **Terrain.** Every biome now favours its own kind of unit, on both sides: none on a map's first skirmish, tier I (+0/+1) from the second, tier II (+1/+1 and the biome's signature skill) on elites and bosses, tier III (+1/+2) on the bosses of big maps. Signatures: Old Woods Regen, Meadow Bloom, Riverbank Inspiring, Tideline Shell, Coral Shelf Thorns, Mire Poison, Deep Dark Ambush, High Crags Siege, Frozen Waste Frostbite, Hunting Grounds Momentum, Basalt Floor Armor, and the Volcano's eruption. A pill on the field (top-left) says what it does; hover or tap it. A banner explains it when the fight starts, and native cards show a light-blue "Home ground" line.
- **The eruption is visible:** a lava geyser bursts through the struck card, embers fly, the field flashes red, and volcanic fields glow with lava.

## 2026-10-12 (19:20)
- **The last PixelLab batch is in:** portraits for Creeper and the 18 new cards (Pigeon Peon, Marching Elephant, Siege Rhino, Stonedrop Vulture, Newt Doctor, Gatling Hog, Dung Beetle, Ur-Elk, Subterraneaner, Farm Dog, House Cat, Shellwright Apprentice, Otter Royal Guard, Otter Flag Bearer, Otter Lantern Bearer, Riverbed Diver, Hummingbird Needler, Riverwing Envoy). Also new: Boar Rampager, Berserker Boar, Tusked Vanguard, Raccoon Bandit, Land Tiller, Talon Archer, Meerkat Wayfarer and Strange Materia. All 153 queued images are done.
- **The Forge** now uses the PixelLab hearth for its backdrop and the PixelLab anvil on its stump.
- **Card Ledger: Creature count.** A new view counts every unit by species and by creature, as a share of the cards a player can own, and flags anything crowded (a species at 12% or more, a creature at 6% or more; Otters and Hummingbirds are marked as the factions). Click a name to see its cards.
- **Fix:** the six otters added today are now species Mustelid like every other otter (they were tagged Mammal).

## 2026-10-12 (19:10)
- **Resources on the field:** your Lumber (and Stone, Metal, Grace and so on) now sits on the battlefield's bottom-left corner, and the enemy's on the bottom-right with a red "Enemy" tag, so you can see what they have saved up.
- **Full screen centres the field:** in full screen the battlefield sits in the middle of the screen, as far as that keeps your hand in view. On iPhone (no full-screen support) the ⤢ button gives the same layout.
- **Deck editor on phones:** swiping over the cards now scrolls the list. To drag a card, hold it still for a quarter of a second first.
- **Conversations stay out of the way:** at most 2 lines on a computer and 1 on a phone. They turn see-through while your pointer or finger is over them or while you drag a card, and a ▾ button tucks them into a small 💬 chip (with a count of new lines) until you tap it.
- **Pitching lesson:** the first time you hold a card you can't afford, or in any fight from Map 2 on, three spotlighted steps teach it: why you need Lumber, pitch a card onto the Graveyard (only that works until you do), and where your Lumber shows. Your guide says a line too. This replaces the old one-line Lumber tip.
- **Claiming rewards:** stars burst from the button, a ring spreads, and a swarm of reward icons rushes into a tally in the top-right corner. Each currency's total counts up as they land, then the tally fades. Claim all sends a bigger flood. Covers achievements, quests and errands.
- **Caves:** the blackout when you enter a side map now covers the whole screen.
- **Side map icons:** only real caves (Smugglers' Grotto, the Mycelium Deep, the Glimmer Depths, the Volcano Lair) keep the cave mouth. The others show just their emblem; Lilypad Reach is a lotus.
- **Earthquake** now also hits your own grounded units (never the caster, never flyers). The hits land 0.1 s apart, each unit jolting in turn. Gorge Wyrm and Glacial Ape King change with it.
- **Pack plan:** a proposal for your four-pack road structure is in `docs/pack-plan-2026-10-12.md`. It needs two decisions from you.

## 2026-10-12 (18:15)
- **Enemy card marker:** the red tint on top of enemy cards is smaller (a thin 5 px strip, inset from the corners) and much fainter. It now sits inside the card itself, so it moves with every lunge, hit, flip and topple instead of staying behind, and fades out when a card dies, falls or burns.

## 2026-10-12 (17:00)
- **Your map list:** the road is now 0 Outskirts, 1 Thistlewood, 2 Pebble Beach, 3 Gannet Cliffs, 4 Sunken Hollow, 5 Gatorback Swamp, 6 Sable Swampmire, 7 Morel Hollow, 8 Caves & Alcoves, 9 Kelp Mangroves, 10 Coral Current, 11 Eyrie Heights, 12 Briar Maze, 13 Redwood Deep, 14 Savanna Reaches, 15 Long Grass, 16 Pinewood Taiga, 17 Wolfsbane Tundra, 18 Glass Dunes, 19 Ashen Spurn, 20 Sundered Peak.
  - **Fused in as side maps:** Clovermead (Thistlewood, after its first fight), Lilypad Reach (Pebble Beach), Basalt Foundry (Ashen Spurn). Your progress on them stays.
  - **Renamed:** The Ashen Peak is **Ashen Spurn**; the Caldera Heart is the **Volcano Lair**.
  - **Five new side maps,** four fights and a boss each, built from their map's own cards: The Sunken Grove (Gatorback Swamp), The Glimmer Depths (Caves), The Aerie Vault (Eyrie Heights), The Ice Hollow (Wolfsbane Tundra), and The Old Bramble (Outskirts), which opens only once the Ice Hollow is cleared.
  - Feature spots follow the map numbers, so the field kit is now on Map 12 (the Briar Maze). The Sundered Peak's final boss is Map 20 at rating 400.
- **Skirmish panel:** one row: the showcase card, then the name, "30 ❤️ 98 🔷" (only the top armour layer, in its colour) and the battle rating under it, and the first-clear rewards on the right. Cleared is a green tick in the top-right corner. The enemy's card list stays inside the panel.
- **Admin off** now redraws the screen, so no admin buttons stay behind (skirmish panel, card details).
- **Card hover** darkens the card instead of turning its border brown.
- **Card art:** 51 new PixelLab portraits (the volcano undead, Caldera Wyrm, The Contradiction, bears, horses, pond and mangrove creatures, foxes, rabbits and more). 234 cards now have art; about 30 more are still generating.
- **Rarity colours:** Starter/Common grey, Uncommon/Quest green, Rare blue, Very Rare light blue, Super Rare teal, Epic purple, Heroic orange, Unique/Special amber, Legendary yellow, Mythic red, Ancient deep blue, plus Divine white, Void purple-grey and Daemonic black. The other special rarities wear their tier's colour.

## 2026-10-12 (16:30)
- **Balance pass** ([report](balance-pass-2026-10-12.md)): 63 player cards moved into their rarity's band with the smallest Attack/Health change (200 simulated games each; Attack never below 1, no change bigger than 2 Attack or a third of Health). Starter cards (the tutorial is built from them) are untouched; Ecclesia, Devilry, Remember and Changeling cards, leaders, Heroic+ and 3+ cost cards were left alone. The whole set is now 264 of 436 in band (was 186 of 418). Some enemy decks use these cards, so a few fights got easier (Gannet Cliffs) or harder (Map 0's third skirmish).
- **New cards:**
  - **Creeper** (Common, Pack 1): a lime-green bee with a blank face and a wide smile. 1/2, Flying, Swarm, Scare 1.
  - **Enemies:** Pigeon Peon, Farm Dog and House Cat (Clovermead), Dormouse (Thistlewood), Gatling Hog (Thistlewood), Newt Doctor and the kingfisher (Lilypad Reach), Beaver Lumberjack (Lilypad Reach), Dung Beetle (Morel Hollow), Subterraneaner (Caves), Marching Elephant and Siege Rhino (Savanna), Stonedrop Vulture (Gannet Cliffs, Eyrie Heights), Ür-Elk (Tundra, Taiga), Shellwright Apprentice and Otter Royal Guard (Outskirts).
  - **Otter pack:** Otter Royal Guard, Shellwright Apprentice, Otter Flag Bearer, Otter Lantern Bearer, Riverbed Diver. **Hummingbird pack:** Hummingbird Needler (the Ruby-Throat Duelist is already there).
  - **Riverwing Envoy** (an otter with a hummingbird on its shoulder): the Part 2 reward for players who pick both sides, with the Sunspire Envoy.
- **Seven new castles** with new passives: The Logjam (the enemy's first 3 units arrive 1 Wait later), Trojan Horse (a Trojan Raider climbs out on round 3), Ballista Keep (a bolt at a random enemy unit each round), Clam Farm (+1 Lumber every 3 rounds), Thorn Cage (a unit that hits the castle takes 1), Herb Refinery (each round: heal, sting or Lumber at random), Hidden Nest (a Nest Hatchling joins on round 2 and every 4 rounds). Each opens with a map's boss.
- **Frenzy** now means: while any status is on it, it strikes twice and each hit adds 1 Bleed.
- **Ranks:** SS is "not one point of damage on your castle"; SSS adds "not a single unit lost" (it used to be a fast win).
- **Field kit:** opens at Map 12 now (the Inventory still opens at Map 1). One item a fight. Nerfed and widened: Healing Draught 5, Kindling +1 Lumber, Scout's Map draw 2, Fire Pot 3 to every enemy unit, plus Honey Cake, Whetstone and Caltrops. One of each a day, up to 5 of each.
- **Eggs:** first clears drop an egg 8% (skirmish), 16% (elite), 25% (mini-boss), 35% (boss), 50% (world boss); repeats 0.1% per energy, ×1.5 / ×2 / ×3 / ×5 for elites, mini-bosses, bosses and world bosses; raids 1%. The results screen shows the egg.
- **The world boss has its own side map, the Caldera Heart**, opened by the Sundered Peak's final boss (rated 400) alongside the Eye of the Volcano (400–450). Its three fights are 350, 375, 400 and the Caldera Wyrm 500. An earlier world-boss win carries over.
- **Map screen:**
  - Swiping to another map needs a quick sideways finger swipe; a mouse press or a press on a node no longer changes the map.
  - Map icons shrink 5% for every node or destination past six (the Sundered Peak's are about three-quarters size).
  - The map list keeps its scroll when you change map. The tab colours darken further toward Map 20, with a little more red; deep tabs switch to light text.
- **Battle on phones:** press and hold a card for 0.25 s to see its details; lifting doesn't play it.
- **Lumber messages** say what's missing: "Need 2 more Lumber".
- **Replays:** the "First clear · already earned" section is gone; the results show only what you won.
- **Your decisions:**
  - **Enemy levels from Map 5 (D61):** enemy cards fight at Lv 2 at Map 5, +1 every 3 maps (Lv 3 at Map 8, Lv 7 at Map 20); elites +1, bosses +2, side maps +1. A level set in the skirmish editor still wins. Stats only change on Lv 3, 6 and 9, so the jump shows from Map 8.
  - **Tutorial Part 1 reward (D46):** the Rabbit Kit (3/2, Quick) replaces the Quarry Mole.
  - **Free Base copy (D59):** each map's boss, on its first clear, gives a copy of the Base card you own the fewest of.

## 2026-10-12 (13:00)
- **Pounce, a new evergreen keyword.** "On Play: deal damage" now has a name: **Pounce N** (🐾) hits a random enemy unit for N the moment the card lands, Waiting or not (the castle only if no units are left). It has its own log line and a crouch-and-spring on the card.
  - Kept as Pounce (9 cards): Raven Scout 2, Hawk Arrowkeeper 2, Eagle Diver 3, Golden Eagle Diver 3, Ford Kingfisher 2, Quill Volley 2, Mallard Marauder 1, Firetail Trickster 2, Caldera Wyrm 5.
  - Changed to other skills (25 cards): Yeti Scare 2, Gorge Wyrm Earthquake 3, Ember Wisp Immolation 1, Komodo Warlord Gash 3, Eyrie Warden Daunt 1, Cave Warlord Daunt 2, Venomlord Serpent Ambush, Cataphract Destrier Stampede, Bog Behemoth Regeneration 3, Ancient Sloth Titan Bulwark 2, Glacial Ape King Earthquake 4, Orca Vanguard Momentum 2, Permafrost Mammoth Frostbite 2, Eagle Sharpshooter Arrow 2, Deep Cave Troll Siege 4, Humpback Elder Inspiring 2, Kraken Spawnling Gash 3, Magma Titan Immolation 1, Pyroclast Wyrm and Fire-Drake Hatchling Fire Arrow 2, Red Dragon Fire Arrow 4, White Dragon Scare 3, Blue Dragon Lightning 4, Green Dragon Poison 3, Black Dragon Corrode 3. Most are enemy cards, so a few fights play a little differently.
- **Card drops.** Winning a fight can drop a card: 10% skirmish, 20% elite/champion/dungeon, 30% mini-boss, 40% boss, 70% world or raid boss, always for a raid win. Rarity: 1% Heroic from bosses, 1% Epic from world bosses and raids, then 2% Super Rare, 5% Very Rare, 10% Rare, 30% Uncommon, else Common.
- **Nest:**
  - Eggs now go into your pack. Tap an empty hay nest to place one, or to **nurture** a Level 0 base card to Level 1 (1 hour, 15 Dust + 10 Maple Leaves).
  - The Forge no longer takes cards from Level 0 to 1: a Level 0 card shows "Nurture it in the Nest", which opens the Nest with that card picked.
- **Forge:**
  - Upgrades past the Village Forge need 🔮 **Strange Materia** (1, 1, 2, 3), dropped by the bosses of Maps 12, 15, 25 and 30 on their first clear.
  - "Show the N I can temper" works once per visit, then fades with a small gadget sound. Tempering strikes the anvil.
  - **New forge art:** a pixel-art hearth, hood and tool wall behind the forge, and a pixel anvil on a stump. Drawn in code for now; PixelLab versions are queued.
- **Card opening:** light rays in the card's rarity colour behind Rare-and-up and new cards, a spotlight under the deck, a gold-trimmed card back with a moving sheen, a "2 of 3" count, and a tray of empty slots that fill as each card flies down. Fixed: the card that flies to the row below had stopped landing there.
- **Shop:** a lamp-lit back wall with a scalloped valance, bigger pouches with a shadow on the plank that lift and tip when you point at them, a beam of light on the chosen item, hanging price tags, and a counter with a wooden edge and a receipt.
- **Sweep** hits its three targets in quick succession, 0.3 s apart.
- **Map tabs** shade by tier: warm browns that darken from Map 0 to 20, then lime turning purple and darker up to Map 40.
- **Toucan Courier** is out of the Glass Dunes decks (Dust Hyenas instead) and now comes from the Canopy (y-1).
- **Card Ledger:** a "Summary by source" view: Base, each pack and each map in play order (side maps under their parent), with card counts, rarity mix, average stats, score, balance results and, for maps, the enemy cards they field. Map numbers now count from 0 as in the game. Click a row to see its cards.
- **Decisions waiting:** D58 egg rates, D59 free base copies and B2/B3 tiers, D60 the Map 20 boss battle rating (your note was cut off).

## 2026-10-12 (12:30)
- **Raids:**
  - **Leaders take the field.** All three leaders open on the board, one in each of the centre three columns: yours in your front row, each ally's in their own row. An ally's leader is the one saved on their deck, else the rarest card in it that can lead.
  - **Boss units.** On rounds 3, 7 and 11 the part sends in its biggest card as a boss unit with huge Health: ×(2 + 10·r²), where r is the share of the part's Health still standing this week. A fresh boss's unit is a wall; once the raid has pounded it, the unit is ordinary.
  - **Minimum damage.** A raid's full per-attempt reward starts at 120 damage (`minDamage`, editable per raid). Below that you get a pittance (8 Maple Leaves, 6 Dust).
  - **Raid materia.** Every attempt brings home at least one 🦑 Abyssal Ink, the raid's materia (up to 5 for big damage). It shows in the Inventory with the other Materia.
  - **World call-out.** When a raid falls, everyone sees "🌍 The Goliath has fallen! The last blow: …" once. If it was the hardest live raid and you were on when it fell, you get 0.8% of a Materia Unit (5 Dust, 4 Maple Leaves).
- **Leaders in the deck editor:** cards that could lead but sit in your deck now show in the picker, greyed out and marked "In your deck".
- **A leaders lesson:** the first time you get a card that can lead (Heroic, Unique or rarer), the Wandering Traveller explains leaders after the fight and offers to open the Armoury.
- **Shop quantities:**
  - With two or more packs on sale, each pack sits on the shelf once, and its counter asks how many: ×1, ×10, ×25, ×50, ×100 or ×250.
  - A tier shows once you've reached its map (10 at Map 9, 25 at 14, 50 at 19, 100 at 29, 250 at 44) and can afford the tier before it.
  - With a single pack on sale, its bundles stay on the shelves under the same map gates.

## 2026-10-12 (12:00)
- **Tutorial rewards come in two parts:**
  - Part 1 gives the Quarry Mole. "Add to deck" no longer shows the deck size.
  - Part 2 gives your side's two cards (Otters: River Warden and Otter Centurion; Hummingbirds: Sunspire Envoy and Crimson Recruit; both: River Warden and Sunspire Envoy). They fly into the deck, which now counts up to 20/20 with "A deck holds 20 cards".
  - Picking both sides also brings the new **Meerkat Wayfarer** (Uncommon, 3/7, Reach, Inspiring 1: "another traveller on the same road") to your collection.
  - Every list is editable in the tutorial editor (Part 1 reward; Part 2 rewards for each pick).
- **Tutorial flow:**
  - Part 1's win offers 🗺️ Back to the map beside the main button.
  - The guide to Part 2 takes two taps: tap the marker, then ⚔️ Fight, which is lit in the spotlight.
  - While you hold a card during "drag a card onto the field", a ghost card and hand glide from it to your row. Let go and the pointer comes back.
  - Tutorial cards keep their own skills (your edited cards play as they are).
- **Tutorial editor:**
  - Every deck shows as pictures with 🃏 Edit deck; the text box is under "Edit as text".
  - Save closes the editor and refreshes the map editor's preview.
  - The picture builder has ✓ Done.
- **Auto-play:** on a Conquest fight you've cleared at rank S or better, 🤖 Auto-play (top right) lets your side play itself. Press again to take over.
- **Quest rewards:** claiming one bursts at the button and shows a gold "Quest complete!" ribbon. Each reward arcs into a backpack that pops up in the corner, with no OK to press.
- **Used-up skill strips:** when everything left in a card's strip is a trigger that's fading, the strip fades with it and leaves no empty pill (e.g. the Wandering Traveller after his draw).
- **Shell** shows 🐢 on the card's skill strip too.
- **Full screen:** the match sits vertically centred.
- **Big screens (a first large RWD pass):**
  - From 1700×950 the match grows into the space: cards up to 240px tall, with their text scaled to match, and a wider board.
  - Home, Inventory, Profile, Nest and Shop scale up 1.2× (1.45× from 2300×1250).
- **Difficulty after the reorder:** the moved maps were retuned to the road's rising curve (tools/curve_tune.js). For example, the Morel Hollow (now Map 3) was much too hard, and the Sundered Peak (now Map 21) too easy. The world boss and the Eye of the Volcano keep their hand-set numbers.

## 2026-10-12 (11:30)
- **The road follows the 0–20 tiers.** Clovermead stays Map 1, so the road runs Maps 0–21:
  - 0 Outskirts, 1 Clovermead, 2 Thistlewood, 3 Morel Hollow, 4 Lilypad Reach, 5 Pebble Beach;
  - 6 Gannet Cliffs, 7 Sunken Hollow, 8 Gatorback Swamp, 9 Kelp Mangroves, 10 Sable Swampmire;
  - 11 Caves & Alcoves, 12 Eyrie Heights, 13 Briar Maze, 14 Redwood Deep, 15 Long Grass;
  - 16 Pinewood Taiga, 17 Wolfsbane Tundra, 18 Savanna Reaches, 19 Glass Dunes, 20 Basalt Foundry;
  - **21 The Sundered Peak (the Volcano, with the world boss)**.
  - The Ashen Peak (22) and Coral Current (23) come after it, as the tier list had them leaving the road.
  - Features stay on the map numbers from your table: the Forge on Map 11, Raid 1 on Map 13, and so on.
  - Maps you've already fought on stay open.
- **Icons:** the Sundered Peak is now the 🌋, the Ashen Peak a snowy 🗻 (no magma) and the Basalt Foundry ⚒️.
- **World boss: The Caldera Wyrm** (on the Sundered Peak, after its boss; optional like a raid boss).
  - It leads the enemy. It costs 2 Stone + 1 Metal, which the enemy digs each round, and it comes out the moment it can.
  - It deals 5 on landing and gains +2/+4 when cast.
  - Immolation 2: at every round start, 2 fire damage to the units beside it (theirs and yours) and the one facing it.
  - On death, it deals 5 to whatever faces it. It has Armor 2 and is immune to heat.
  - **The mountain erupts:** one random unit a side takes fire damage every round: 2 in elites, 3 in the boss fights, 5 against the world boss. The board rumbles and the struck card flares.
  - The boss fights here (and the world boss) surge +2/+4 when their leader is cast.
  - Its own theme, "The Caldera Heart": slow and very low, with war drums and the mountain rumbling under every bar.
  - A new achievement, Wyrmslayer.
- **Eye of the Volcano** (sub-map at the crater's edge, after the Sundered Peak's boss):
  - Three undead elites lead to Heart of the Mountain, a four-castle Dungeon in which every castle has its own deck. **The Contradiction** waits at the bottom.
  - Three wildlife elites (boars, vent crabs, ash condors) turn up at random after wins once their path is open.
  - New cards: Ashbone Ghoul, Cinder Skeleton, Magma Wraith, Obsidian Lich, Ember Revenant, and The Contradiction, a snow bear with a red-glowing heart (Bleed 2, Rage, Regen 2). It has its own background.
  - Their PixelLab portraits are queued next in the Chrome run.
- **Field kit and the backpack:**
  - Four items: Healing Draught (castle +6), Kindling Bundle (+2 Lumber), Scout's Map (draw 2) and Fire Pot (4 fire damage).
  - The kit refills one of each every day. Unused items pile up, to 20 each.
  - In a fight against the CPU, the 🎒 beside your Lumber uses one item a turn, without spending your play.
  - The Inventory stays hidden until a note from the Wandering Traveller on Map 1 shows you the backpack. Saves past Map 1 have it already.
- **Achievements page:**
  - A progress ring and Claim all.
  - Filters: All, Ready, In progress, Claimed.
  - Groups: Battles, The road, Bosses and raids, Collection, The Forge.
  - Medal tiles in bronze, silver, gold and dragon.
  - Four new achievements: Five Horizons, To the Caldera, Eye of the Volcano, Wyrmslayer.
- **Editors:**
  - Dungeon: each castle can have its own deck (🃏 Give it a deck), and the castle count is set right there.
  - Skirmish deck previews run left to right again.
  - Tutorial editor: every deck shows as pictures with 🃏 Edit deck (the picture builder); the text box is under "Edit as text". Save now closes the editor and refreshes the map editor's deck preview.
  - The picture builder has a ✓ Done button.
- **Tutorial cards keep their skills:** nothing is taken off any more, so your edited cards play as you made them.
- **Results card:**
  - The rank medal shows once, beside First Clear.
  - The Iron Shard and Base-growth pills are readable on the gold card.

## 2026-10-12 (11:00)
- **Winning keeps the board:**
  - A card that died in the part of the round skipped by the win now falls with the others instead of vanishing.
  - A card still flying in from the enemy's hand when you win lands in its slot.
- **Shout-outs:** unit emoji are about half as frequent, and only one shows at a time. When you win, the loser's units that never got to swing that round usually grumble; the ones that did only sometimes.
- **Tide:** the chips on Tide cards are just symbols now: 🌊⚔ on Flow, 🐚🛡 on Ebb, 🌊⚔🛡 on High tide. Flow gives +1 Attack and Ebb +1 Armor. High tide (+2/+2) comes as Ebb, Flow, Ebb, High, in boss and elite fights on water maps.
- **Shell:**
  - The badge is a 🐢, so it no longer reads as wings.
  - When it triggers, a pale-blue shell sweeps up the card over half a second, then "Shell!".
  - The unit can't attack for the rest of that round. Four small shields at the bottom of the card show it is up.
- **Swimmer:** it's now "If Tide →" one of Extra Attack, Quick Attack or Evade, chosen per card.
- **Poison** only lands when the hit gets damage through. A poisoner stopped by Armor poisons nothing.
- **Used-up triggers:**
  - An On Spawn or once-only trigger that has fired shines, turns grey, then fades off the card.
  - A trigger that is only off for now (Waiting, Stunned, Frozen, Asleep) stays grey.
- **Wandering merchants:** visiting one opens a short dialogue with the pack, its price and Buy / Not today.
- **Not obtainable** is worked out from the card's source; the Admin panel shows it as a status line.
- **Falling cards:** the red top edge falls with the card.
- **New card: Skull Vulture** (your PixelLab art). 1 Lumber, Wait 1, 3/4, Flying, Daunt 1, Nocturnal. It has no source yet (D51).
- **Art:** 9 more portraits. New: Eyrie Warden, Rockslide Ram, Peak Condor, Alpine Avalanche, Grizzly Vanguard, Blessed Avatar and Skull Vulture. Redone: Marsh Wisp (no longer a bear) and Soldier Ant. 183 cards have art.
- **Tutorial:** the combined slot uses 🎓 again.

## 2026-10-12 (10:40)
- **Raids:**
  - **Allies:**
    - Two allies fight with you: other raiders' decks when the cloud has them, the raid's ally decks otherwise.
    - The VS screen shows them, with their battle rating and castle.
    - In the fight one of them plays first each turn: into your middle row, your back row, or the front when there's nothing to stand behind. Their cards wear a 🤝.
  - **Castle:** your castle is all three castles at once (their Health added up and every passive merged), drawn a little bigger.
  - **Boss strength:** its cards are back up to 60% Attack and 70% Health (from 35% / 45%), since you have help now.
  - **Opening board:** the boss starts with its guards and just one card waiting, not a full board.
  - **Rows:** the middle and back rows are a bit smaller than the front (70%), no longer half size.
  - **Results:**
    - Every raid ends on the gold results card: "Raid complete!", or "👑 Absolute Victory!" in gold if you beat it.
    - The headline pill reads "1,125 damage dealt to The Goliath — Left Tentacle".
    - "Your damage still counts" is gone.
- **Castles in the Forge:**
  - Tempering moved out of the castle picker into Forge → 🏰 Castles.
  - A castle you get again counts as a duplicate, and fusing it banks credit toward its next levels.
- **Fuse all extras:** Forge → Upgrade has 🧩 Fuse all extras. It feeds every copy beyond what a deck can hold into its card's credit, and keeps foil, shiny and skinned copies.
- **Map music:** each kind of map has its own theme: meadows, water, volcano, caves, savanna and desert, snow, swamp, heights, deep forest. Caves are slow and eerie, with water dripping in the dark.
- **Inventory:**
  - Materia and enchant crystals sit in square slots: the icon, ×N in the corner, and the name when you rest on it.
  - Packs you have none of no longer show.
- **Hatching:**
  - The egg rocks three times, cracking more each time.
  - The light leaking out hints at the rarity: warm white for Common, green sparks for Uncommon, spinning blue rays for Rare.
  - Then it bursts and the card rises up close.
- **NPC speeches:** Admin → 💬 NPC speeches lists every conversation. You can change any line's words, who says it, or the reply buttons, and play it to hear it. A cloud admin's save publishes for everyone.
- **Deck builder:** the 0/2 copy counters sit 2px further right.
- **Fixed:** "Campaign Cleared" (and the maps-cleared count) were awarded for maps that have no fights yet.
- **Art:** 25 more portraits:
  - the redrawn **Duck Paddler** (a mallard paddling across a pond);
  - volcano cards: Pyroclast Wyrm, Magma Titan, Basalt Boar, Magma Salamander, Obsidian Scorpion, Cinder Hornet, Ember Jackal, Phoenix Fledgling, Sulfur Vent Crab;
  - Tide Spirit, Trapdoor Spider, Mountain Goat Climber, Beaver Lumberjack, Beaver Builder, Echo Keeper, Mallard Marauder;
  - War-Drum Mandrill, Golden Eagle Diver, Ravenous Wolverine, Gangrenous Leech, Chipmunk Stockpiler, Chipmunk Hoarder, Quill Volley, Bat Swarmling.

  Marsh Wisp came out as a bear, so it's being redrawn.

## 2026-10-12 (10:00)
- **Boomerang (your rules):**
  - On the way back it goes for the same unit it hit (or the castle again). If that unit is gone, it whiffs; a newcomer in the lane isn't hit.
  - Its speed on the way back is its Attack, so it usually beats Haste. Only a faster Fast Forward unit acts first.
  - At home, the thrower catches it (that's its attack for the round). If the thrower is gone:
    - a Boomerang ally in the lane catches it unharmed;
    - any other ally there takes the hit;
    - with nobody there, it hits your own castle.
  - The description ends "Don't fail to catch it!"
- **New passives:**
  - **Daunt N** (working name for your "____ N"): on hit, the target loses N Attack until the end of the next round. It stacks.
  - **Recoil N:** every attack also deals N damage to itself.
- **Sweep** shows 🧹N, not 🧹+N.
- **Deck shuffle** is a riffle: six full-size card backs split, slide apart and fall back in alternately. Nothing shrinks.
- **Initiative coin:** 10% smaller, and it rolls along the edge to the other side with an ease-in-out.
- **Leader slot tip:** "Your leader goes here. You always start with them…"
- **"That one looks tough"** now waits for the first Uncommon (or rarer) enemy unit you meet, and points at it.
- **Graveyard:** until pitching opens it's just "Graveyard", with no +1 Lumber. "Discard" only shows while you hold a card, once pitching is open.
- **Playback speed opens as you go:**
  - 1.5× after your first skirmish;
  - 2× after your first elite;
  - 3× after Map 2;
  - from Map 5 your chosen speed carries over to the next fight;
  - 4× after Map 15, 5× after Map 30.
- **Map backgrounds:** Clovermead and The Mycelium Deep have their own. Every map with art now uses it on its battlefield too.
- **Card workbench** (Admin → 🧪): any card with any art, rarity colour, foil, Starlight, foil strength, art style (framed, extended, emoji) and size.
- **Art:** Duck Paddler is being redrawn (queued next in your Chrome).

## 2026-10-12 (09:40)
- **Tutorial:**
  - **Decks:** part 1 uses your list exactly (11 cards), and part 2 adds the four cards you named (15).
  - **Skills:**
    - In part 1 no card has a skill, yours or the rival's (no Flying). Part 2 keeps only Swarm.
    - Both are set per part in Admin → Tutorial editor.
  - **Rival decks:** re-tuned for the plainer cards. With the computer playing your side, it wins about 92% as Otters or Both and about 83% / 78% as Hummingbirds.
  - **Tips are spread out:**
    - Part 1 order: your hand, playing a card, then the enemy castle, combat a round later, and your deck after that.
    - Initiative moved to part 2.
    - At most one other tip a round.
  - **Highlights:** your strongest card glows in your hand in part 1, and the leader slot glows in part 2.
  - **Traveller:** he calls "You almost got them!" near the end of part 1. In part 2 he says why he's helping ("You look like you need help…").
  - **After part 1:**
    - The 3 reward cards sit in the "Your first deck" grid and fly into the deck with the rest.
    - No toast; a pointer on the map shows Tutorial II.
  - **Both parts won:** they become one 🗝️ dungeon slot on the map, and a replay plays part 1 straight into part 2.
  - **Rushing in:** clicking quickly through the entry no longer leaves the side picker on top of the tutorial fight.
  - **Editing:**
    - The tutorial editor shows both parts' decks in full, with what every card does.
    - The map editor's Tutorial nodes show their real decks (they said "0 cards") and have a button into the editor.
- **Results screen:**
  - Won cards stay on one row, and the cards' half sits further left.
  - Their details open to the left, so they no longer cover what was unlocked.
  - With more new cards the reveals run faster (two: 15%, three or more: 30%).
  - A leftover tutorial tip no longer sits over the results.
- **Levels:** a new player is level 0 until the tutorial, then level 1. They were level 7 because maps with no fights yet counted as cleared; that XP is taken back from existing saves.
- **Before sign-in:** the front screen fans out 5 cards (3 on a phone).
- **Enemies:**
  - Only bosses, elites and champions keep summoning imps once they run dry. Everyone else surrenders or offers a draw.
  - With nothing playable, the computer now discards its weakest card for Lumber and keeps the card it's saving for. Before, it discarded at random.
  - It already couldn't play a card it can't pay for.
  - Resting on the opponent's deck shows their hand size and Lumber (and Stone or Energy when they have any).
- **Cards:**
  - The top-right corner mark is now the card's archetype only (🙏 Ecclesia, ⛧ Devilry, 🌫️ Scrapper, 🧬 Evolution, 🐝 Swarm, 🌊 Tide). Animal types no longer show there.
  - Stone costs read "🪨1" instead of "🪨1cost".
- **Codex:** phylum sort and filter open on Map 12 (5 maps after the Codex), and the Traveller explains phyla the first time.
- **Forge upgrades:** the Forge has 5 tiers.

  | Tier | Map | Temper limit | Rarest card |
  |---|---|---|---|
  | Village Forge | start | Lv 3 | Quest |
  | Iron Forge | 13 | Lv 4 | Super Rare |
  | Ember Forge | 16 | Lv 8 | Unique |
  | Dragonfire Forge | 26 | Lv 9 | Legendary |
  | Heartfire Forge | 31 | Lv 10 | Ancient |

  Each upgrade costs Maple Leaves and Dust. Limit breaks still wait for Map 50.
- **Battle rating:** the badge keeps a plain background; only its text takes the colour.
- **Hub:** a new 🃏 Decks tab lists the tutorial order and every tutorial, skirmish and raid deck.

## 2026-10-12 (08:30)
- **Art:** Beetle Battering Ram, Field Mouse, Fiddler Crab Swarm and Pelican Diver. 39 of tonight's 120 portraits are in; the rest keep generating in your Chrome.
- **Raids:** the action items now describe the boss's column attacks (a red glow on the column a round ahead).

## 2026-10-12 (07:50)
- **Tutorial rivals are fixed and weak:**
  - Otters face 4 Cobalt Talon Fledglings and 5 Otter Kits.
  - Hummingbirds face 6 Otter Kits, a Crossed-Eyes and 2 Pond Trout.
  - Both tribes face the same deck as Otters.
  - With the computer playing your side, part 1 is won ~86% of the time and part 2 ~75% before your leader joins (it was 11–65%, worst for "both").
- **Raid balance:** alone against a deck built for three, a raid was unwinnable (computer sims dealt ~0 damage). The boss's cards now fight at 35% Attack and 45% Health, and your castle is twice the trench wall (90). The boss's run-only copies also show properly on the board.
- **Raid specials in the full game:** the boss's telegraphed attacks are back. The column it will smash next glows red in your rows a round ahead, then every card of yours in that column, reserves too, takes the hit (your castle does if it's empty).
- **Art:** Crossed-Eyes, Rabbit Kit, Fox Kit, Cricket Drummer, Beetle Grunt, Meadow Frog, Antler Skirmisher, Mouse Sapper, Quarry Mole, Badger Berserker and Hedgehog Scout. Portraits drawn on a flat grey backdrop now have it cut away, so they sit on the card's own colours.

## 2026-10-12 (07:45)
- **Art:** 12 more Base cards have portraits (the rabbits, chipmunks, Harvest Mouse, Garden Snail, Pill Bug, Sparrow Chick, Earthworm, Guppy, Fleetfoot). Every card in the tutorial decks now has art. More are generating in your Chrome.

## 2026-10-12 (03:30)
- **Raids are a full match with three rows a side.**
  - Each side has a front, middle and back row.
  - A card can go behind one of your units. Reserves don't fight and can't be hit, and they step up a row at the start of a round when the column in front of them clears. Arriving at the front counts as arriving: On Spawn effects fire then.
  - The boss's guards hold its front, with more of its deck in the middle and back.
  - The trench minigame is benched; Admin can still open it.
- **Max Energy grows:** +1 for every 20 different skirmishes cleared, up to +10. The Energy pop-up shows how close you are (D40).
- **14A, The Mycelium Deep:** five fights under The Morel Hollow (Map 14). It appears two days after the Morel Monarch is first beaten (D41, built as I recommended).
- **Fix:** matches that run Open rules without saying so (the tutorial among them) now also draw Open rules on screen.
- **Action items:** every open item now has my pushback and my recommendation.

## 2026-10-12 (01:30)
- **Maps**
  - **Map 0 and a new Map 1.** The Outskirts are Map 0 now. A new meadow map, **Clovermead** (five easy fights with Base cards, boss The Old Hare), sits between it and Thistlewood, so every later map keeps its number.
  - Feature spots like the Armoury show as a dark **?** until the fight that opens them is cleared.
  - Curiosities, the well and the chat cave appear only after a fight is cleared (the map's first fight by default). In 🔗 Edit links, click a fight and then the tile to change which fight reveals it. No line is drawn to them.
  - Map tiles can't be spam-clicked, and their speech bubbles sit centred and follow the map when it moves.
  - A conversation already playing or waiting can't be queued again (the endless "Hear that hum?").
  - The **!** on a map feature fades once you've clicked it.
  - NPCs no longer end on a "…" line.
  - The map introduction shows the first time you ever open a map, not just the first map of a session.
- **Tutorial**
  - **Fixed decks.** Part 1: 3 Ducklings, 3 Honey Bees, 3 Silver Minnows, a Pond Duck and a Pond Trout. Part 2 adds a Duck Paddler, a Cottontail, an Acorn Chipmunk and a Chipmunk Forager.
  - **No leader in part 1.** In part 2 your leader introduces itself (only Okay closes it), its slot fades in with a fanfare, and a tip explains it.
  - An older saved tutorial setting can no longer bring back the harder castle Health.
- **Battle**
  - **Boomerang** flies home on its own:
    - out on the enemy side it hits whatever is in its lane now;
    - if the throw went into a unit that has since died, it's a **Whiff~**;
    - a throw into the castle hits the castle there and back;
    - if the thrower has died, an ally in its lane without Boomerang takes the hit, or your castle does if the lane is empty.
    - Its description is now one line.
  - **0 Attack is checked at every step**, not only at the start of combat. A Coral Polyp swings for 1 on Flow, and a mid-combat buff lets a unit attack.
  - **Fork, Trident and Octolash** aim from where the attacker stands. A Fork standing between two enemies hits those two, never one 1.5 slots away.
  - **Swimmer** can list what Flow gives it ("fastForward 1, armor 2"); without a list it keeps the extra turn.
  - **Ranks:** B from half your castle Health, C below half (S 90%, A 70%, B 50%, C 30%, D 15%).
  - **Fight buttons** read "Fight ⚔️ 6⚡" once, with no pill.
  - **Clock icons:** triggers that fire every turn show 🕐 instead of the bolt. Fields that act every round (Frost, Heatwave, Rain) wear a 🕐 on their bottom edge.
  - **Frost and tide:** a cold wave brushes the field before the frost bites, and the frost is thicker on +2 and +3 maps. Flow rolls a wave in across the field and Ebb drains it out.
  - **Spent triggers:** a trigger that can never fire again shines, greys and fades away. One that's only paused just greys.
  - **Sweep** has its own mark, 🧹.
  - **Worthy:** a Worthy unit's Lumber floats on the receiver's Lumber pill, not over the falling card.
  - **Battle log:** it reads top to bottom, follows the newest line and stays open across rounds.
- **Codex:** everything shows together by default. From Map 10 a "🗂️ Separated" toggle splits it into Base & Map 0, Maps 1–20, Maps 21–40, then every ten maps. Search is debounced and off-screen cards skip rendering.
- **Skirmish panel:** narrower, showing just the name with castle Health and Armour. The first-clear rewards are larger and labelled. A hidden deck is a dark slab with a lock and the rank needed, with no words and no show/hide.
- **Ranks after a fight:** the "Rank E ×0.6" pill is gone. The first F, E, A, S, SS and SSS each explain themselves once, and A, S, SS and SSS each get a cheer the first time.
- **One warning voice:** boss warnings are a single line, from Shieldback (Otters), Aurelia (Hummingbirds) or either (both).
- **Packs:** each pack wears a face from its own pool, and every booster in a bundle wears a different one. Packs no longer repeat a card while the pool has others, and recently pulled cards are much less likely.
- **Shop:** a "← Back to the map" button when you came from the map.
- **Art:** your PixelLab title screen is the new splash. 14 more D30 cards and the first 12 Base cards have art; more are generating in your Chrome.

## 2026-10-12 (08:10)
- **Skills**
  - **Trident 🔱** strikes left, centre and right; a side prong with no unit facing it hits the castle.
  - **Pitchfork** is Trident with Pierce: each prong carries on through the units behind.
  - **Sweep** stays a cleave: it never touches the castle, and does nothing when no unit stands in front.
  - **Octolash 🐙** (new): hits the 8 nearest enemy units.
  - **Rainmaker N** (new): brings N rounds of rain when it arrives. **Rainrunner** (new): +A/+H and unblockable while it rains.
  - **Moonborn** (new) and lunar phases: the moon changes every nightfall, shown only when a card cares.
  - **Frostbite** (new): frozen enemies get stronger.
- **Biomes**
  - **Wolfsbane Tundra** steps up: fewer frosty enemies at first, then frost-resistant ones the +1 Wait can't pick, then frostbite, then +2 freeze; the boss freezes +3 on three units of each side.
  - **Savanna:** the first Quick unit to swing each turn gets First Blood +1 (+2 at the boss). Yours can claim it first.
  - **Day and night** only show when a card cares about them. Night creeps across the field from the right and leaves the other way at dawn.
- **Battle**
  - Enemy cards fly in from the top of the board, where their hand is.
  - The leader always finishes landing at full height.
  - Your turn no longer ends after a pitch while your leader can still be played.
  - Castle shields count down hit by hit during combat, and sync at the end.
  - **Deaths:** the card tips backwards, picks up speed, hits the ground and throws up leaves, snow, sand or sparks by biome.
  - Hovering the field card explains it.
  - "Pride Queen joins you" shows once.
- **Tutorial**
  - It plays the open (non-collapse) rules and is much easier (your castle 16, the rival's 6).
  - The map opens zoomed in on the two tutorials, left and right. The rest of Map 1 appears once Tutorial 2 is won; the world map appears once Map 2 is first cleared.
  - Its tips are no longer lost at a match's end, and the completion screen is blue.
- **Start**
  - The title screen has no face warping and no paint duel; the PixelLab key art is generating.
  - Picking a tribe is lighter. "Both" appears after a minute with a fanfare: half Otter, half Hummingbird, plus a bonus Common card on Tutorial 2 and Brother Ripple, the otternarian, on making peace.
- **Shop and packs**
  - Only unlocked items show. At the start: one Acorn pack and a Bread (1 Lumber, does nothing, sells out).
  - A pack can no longer roll the same card again and again.
  - Advanced packs open 25 maps after their pack: 5 cards at 12× the price with 10× the foil and extended-art chance, plus 5 bonus cards.
  - The shop fits one screen, and only the page scrolls. NEW cards in a reveal are never greyed.
  - Bramble the courier mouse holds an unopened free pack beside the boss on the map.
- **Music:** nursery-rhyme songs on celesta, kalimba and marimba at home; separate battle, elite and boss themes.
- **Skirmish details** no longer hide the top panel.
- **Project:** the old code copies and the archived handoff left the claude.ai project (2.03 MB → 200 KB).

## 2026-10-12 (07:00)
- **Bugs from the cave screenshot**
  - **Win while the shield was up:** the castle's bar ignored its armour, so it read 0 while the armour had soaked the hits. The bar now spends the armour first.
  - **The Fight button flew off** when energy was short: the deny-shake now adds to the button's own position.
  - **Cave maps:** Home, the energy pill, the tab bar and the map title stay lit. The lantern keeps following the pointer after you click a skirmish, and the skirmish panel is only lightly darkened (it brightens under the pointer).
  - **Wait-0 enemy cards** no longer hit before they land. Their arrival strike plays after the card is on the board.
  - **Bites** crunch once, not twice.
  - **Fork:**
    - a miss on one prong no longer cancels the other (Blind rolls per prong, and Tipsy never moves a Fork);
    - its label shows 0.1 s before the damage number.
  - **Revive wings:** lower, narrower and silver, with a halo between them. Revive also gets a ↺ mark; Evasive gets 🍃 and Tide 🌊.
- **New skills:**
  - Swimmer (an extra turn on Flow);
  - Inspiring N, Friction N, Worthy N;
  - Lumberjack, Heavy Metal, Timber, Rock-solid, Iron-will;
  - Loyal and Usurper (leader-conditional, with granted skills);
  - Metal and Uranium resources;
  - Stone, Metal and Uranium costs now charged.
- **Changed skills:**
  - **Tailwind** also speeds your Flyers.
  - **Rage** doubles castle hits too, and shows an ember ½ shield.
  - **Shell** is reworked: any hit (arrows too) raises +N Armour and N temporary Health until the end of the next round, with no attacking meanwhile. Green shields glow in.
  - **Pitchfork** picks off the weakest facing unit, and a kill carries on.
- **Card data:**
  - the 17 Lumber-on-arrival cards now use Worthy;
  - 9 sea swimmers got Swimmer;
  - 15 new cards: Conch Crawler, Conch Herald, Shoal Shark, Malachite Golem, the three Irradiated cards, Heartwood Treant, Quarry Troll, Iron Warden, Badger Lumberjack, Ore-Smelter Mole, Sworn Shieldbearer, Crown Pretender, Grindstone Boar. All are unobtainable until ticked.
- **Tide is clearer:** Tide units show 🌊+1 / 🐚−1 and their real Attack on Flow.
- **Progression:**
  - Forge levels 5–8 open at Map 16, 9 at Map 26, 10 at Map 31; limit breaks at Map 50;
  - level 0 → 1 costs a mote of materia;
  - quest cards start at level 0;
  - a cave map you've cleared gets a 30% wider lantern and 10% less darkness.
- **Pitching opens after Map 1:**
  - before then, the Graveyard does nothing and shows no tip;
  - Lumber-cost cards earned meanwhile arrive when it opens;
  - after a pitch with nothing castable, the turn passes by itself.
- **Board:**
  - the camera holds still while the cards fit the middle five columns;
  - rows of 8+ tighten their spacing, and 21+ overlap by 20%;
  - the leader's crown and beam stay on the card;
  - on a win, tokens on both sides shatter at random moments;
  - tiny cards keep Attack at the bottom and drop the ⚔/❤ glyphs.
- **Skirmish editor:**
  - layered bonus health (L1–L4, blue to pink; each layer above 0 opens the next);
  - card levels per card in the deck.
- **Admin:**
  - 👑 Auto-win in a match;
  - ✅ Mark cleared / Clear the whole map on the skirmish panel;
  - 🎁 Get this card in the Codex.
- **Map chats:**
  - 19 new curiosities across Maps 1–11 (two per map at most);
  - replies that offer to take you somewhere now do it (the Nest, Notices, Codex, Forge, Shop, Arena, Test Lab);
  - no answer ends a chat kindly and it plays again next time.
- **Late side maps:** a side map can now appear N days after a clear, or after a quest.
- **New note:** [Progression to Map 60](progression-2026-10-12.md). It covers the level gates, the road after Map 20, card counts (235 different cards on Maps 1–20), and a max-energy and Town proposal.
- **D30:** the 22 card portraits are generating overnight on your PixelLab plan.

## 2026-10-12 (05:00)
- **All cards are unobtainable for now**, so we can build the list together.
  - 343 cards carry `unattainable` and can't come out of packs, rewards, finds, crafts or promotions.
  - Base, starter and tutorial cards, tokens, tests, materia and the hero stay obtainable, so a new player can still play.
  - Untick per card with the editor's new **Obtainable** box. Admin's Codex tags the rest "⛔ Not obtainable".
- **Codex: View by Advancement** (now the default): Base, Map 1, Map 2…, Pack A, B…, the faction pools, Mystery Pack A, Events, then "Not obtainable yet". It's also a sort option.
- **Fork never strikes straight.** It hits only the columns left and right of the one in front, and an empty one sends that swing to the castle.
  - Its mark is one light-red ⇔. Its attack preview shows just the two side lines.
- **Boomerang replaces Anti-Air** (no number). The throw is its attack; next round the boomerang comes back first, before anyone else, as that round's attack. It never misses a flier.
  - Otter Centurion and Net Thrower have it.
- **Initiative coin:** a small gold coin on the battlefield's left edge, on the half of whoever strikes first on an even face-off this round.
- **PvP:**
  - It always plays normal rules, never collapse.
  - PvP tickets come back one an hour, up to 10.
- **In a match:**
  - Pitching your last card no longer ends your turn while your leader can still be summoned.
  - The leader is greyed out until you can afford it.
  - A card can lead or sit in your deck, not both.
  - Cards that arrived in the final round stay visible through the victory.
  - Combat already stops at the castle's fall.
- **Type mark:** each card shows its first type's icon in the top-right corner, sliding beside the Wait badge while there is one.
- **Deck editor** shows only cards you own.
- **Boosters:**
  - Packs on the opening table are crimped foil wrappers with the cover art, a sheen and the pack's own metal, in balanced rows (5+5, 3+3…).
  - The card summary is balanced the same way.
- **Card preview:** the hover preview is never greyed out, and the stray "Caustic Scorpion" browser tooltip on the skirmish panel is gone.
- **Player levels are about twice as slow:** 200 + 50 per level, plus a gentle 1.12^L part that only takes over past level 40. Level 10 takes ~3,700 XP (was ~1,900).
- **Entrance screen:**
  - The panel and the cards sit closer to the middle.
  - The three cards deal face down and flip one by one with a sound.
  - A swapped card spins to its acorn back as it fades, then returns with a card sound.
  - "Enter the Grove" goes straight in, with no Start step.
- **Tutorial, in two parts.**
  - **Part 1** (the basics):
    - It plays normal rules, with no leader and a plain enemy castle.
    - You can't pitch during "play a card", and that tip closes the moment you play.
    - The "your castle" step is gone, and a new step teaches the initiative coin.
    - The Wait tip points at the Wait number, with "Wait" marked as a game word.
    - The enemy never gets Bee Tanks.
    - A loss says so plainly, and the account's achievement news is hidden on tutorial results.
  - **Part 2** waits on the map's 🎓 marker, to start yourself.
    - You play your starter deck with your leader against the Outskirts Watchtower, whose passive gets its own tip.
    - A friend remarks on flying (Hummingbirds) or boomerangs (Otters).
    - Winning gives the Ally Pack and the "training wheels are off" talk. Both parts then share one 🎓 slot that replays part 1 straight into part 2.
- **The Golden Bramble Case is on sale** once the Gilded Caravan is found; a merchant's pack is never stuck at "Coming soon". A dungeon's next castle no longer surrenders the moment it rises.
- **Bosses and elites:** in a boss fight every enemy card shows its extended art; in an elite fight they carry a new subtle lacquer finish. The same goes for the skirmish panel's card.

## 2026-10-12 (03:10)
- **Sweep, reworked to your rule.**
  - With a unit in front, it swings left, then centre, then right. An empty side is a miss you can see: the unit lunges at the empty slot and the air gets slashed. It never redirects.
  - With nothing in front, it hits the castle.
  - Its attack preview shows three lines, the side ones thinner, with a ring on an empty slot.
- **Swipe is now Fork** (the two-flank strike, unchanged); all 11 cards were migrated.
  - **Swipe** is new: a landed swing steals N Lumber from the opponent.
- **New skills:**
  - **Twin Strike** attacks twice on its turn.
  - **Converge** (on ready) pulls the enemy board, your board or both together around the centre, keeping their order.
  - **Defiance** (types, N) adds +N Attack for every enemy unit of those types.
  - **Pack N** adds +N Health on arrival for each ally of its type.
  - **Swarm N** gives N per ally (default 1).
- **Combat stops the moment a castle falls.** Later attackers used to keep swinging, so a card the enemy had just played could die unseen and vanish during the victory.
  - The enemy's card also finishes landing before combat starts.
- **Day and night (D33):** no more switching. Conquest fights are day, except on four night maps. Real time with a doubled twilight is a skirmish-editor option.
- **Conquest map:**
  - A link between two locked fights is dark. A link from an open fight fades out toward the locked one.
  - Cave darkness now covers the whole screen; the map list and tabs stay readable, a little dimmed.
- **Energy:**
  - The pill reads "4/20⚡ · +⚡ in 2:47".
  - With too little Energy, a fight button plays an error sound and shows "You don't have enough energy" in the middle of the screen for 2 seconds.
  - Admins get −5/−1/+1/+5, Empty, Fill, Set and Next refill now in the Energy panel, even with Admin mode off.
- **Card slots** fade in the moment you press a card and fade out properly.
- **Lore:** a sketch of five subfactions and the dragon thread in the [lore bible](lore-bible.md).
- **Action-items lap:**
  - Wildpaths now counts Path points (D32, my suggested default): 1 per map cleared, +1 per boss S rank. They show on the Wildpaths page; spending waits until the trails leave preview.
  - Fast Forward gets a ⏩ blur.
  - Pack gets its +Health pulse.
  - D33 is closed. D36 (tonight's skill readings) is added.

## 2026-10-12 (01:40)
- **Your map table, applied** ([note](map-schedule-2026-10-12.md)). Features open on the maps you listed:
  - Armoury 1, Nest 2, Notices 4, Cart 5, Codex 7, Arena and the Ember Peddler 8, Quest Board 9, Forge 11.
  - Map 13 opens Raid 1, a new Gilded Caravan (Golden Bramble Cases) and the Wanderer's Camp.
  - Then the Gauntlet on 16 and the Test Lab on 21.
  - Seven new unlock conversations. Existing saves keep what they had.
  - Free packs on boss first clears: Maps 3, 7, 10, 11, 13, 15, 16, 18 and 20. The tutorial gives an Ally Pack.
  - Missing dungeon sub-maps (6A, 9A, 12A, 14A–D, 15A, 18A) are listed in the note.
- **Errands: mini-quests from conversations.** From Map 9, someone on the road sometimes asks a favour after a Conquest win.
  - Yes pins it to a new Errands board on the Notices. Not now leaves it there as an offer for the day.
  - Up to 3 at once, paid in Dust, Maple Leaves and sometimes an Iron Shard.
- **Limit break.** A level-10 card that has been fed 5 duplicates can break to Lv 11 for its whole road's cost again (+10%).
  - Castles break 20 → 25 with Ember Cores, and a Dragon Scale for the last step.
- **Base cards grow from bosses.** A boss's first clear levels up to 2 Base cards in your deck, and an elite's gives a spare copy. When nothing can grow, it comes as Dust.
- **The Codex shows only what you've met:** cards you own or have seen, plus a pack's cards once its seller is open. Materia are Inventory items, not Codex cards. Admin still sees everything.
- **Tutorial spotlight.** Guided steps darken the screen around their target and mark it with a pulsing red ring (and a pointing hand when you have to act).
  - New tips teach triggers: greyed ⚡ = off while Waiting, Stunned, Frozen or Asleep; lit = ready.
  - Natural Leader no longer gets a tip.
- **Map ambience.**
  - Every map plays its own arrival sound.
  - The beach gets soft footsteps about once a minute.
  - Ambient extras start at a random point, so you hear them early too.
- **Mystery Boosters** sell only while the wandering trader is around, up to 5 a visit.
- **The master hub** is now also a hidden, unindexed page on the game site (`/hub/`).
- The Forge preview now uses the same per-level stats as matches.
- **Fast Forward N** (D22, action-items lap): before its first combat, a unit takes N extra turns on its own (Wait −1, or a swing), then joins the normal order. Stun, Freeze or Sleep wipe the counters. It's in the editor's skill list and the battle log; no card carries it yet.
- Action items: D22 and D31 closed; D34 (map-table readings) and D35 (Base growth numbers) added.

## 2026-10-12 (00:30)
- **Battle rating replaces deck level.** Each card counts its rarity weight × its level factor, and the leader counts double. The weights follow the Forge ladder: Common 1, Rare 4, Epic 11, Ancient 30; Base 0.5.
  - A new starter deck rates 24–29. Map 20's par is 400. A full level-10 Ancient deck is about 2,500.
  - Enemy fights show the rating you should bring. It's about 12 at Map 1 and climbs ~20% a map; elites are +15%, bosses +30%. The skirmish editor can set a fight's own.
  - Shown on the skirmish panel, both versus screens, deck lists and the deck builder. Translated into all 12 languages.
- **Forge economy v2, in Materia Units** ([note](forge-economy-v2-2026-10-11.md)). 1 MU = a Common from level 1 to 10 (675 Dust + 450 Maple Leaves).
  - **Levelling by rarity:**
    - ×1 / 2 / 4 / 6 / 8 / 11 / 14 / 17 / 21 / 25 / 30, Common to Ancient.
    - Base, Quest and map-reward cards ×0.5, Event cards ×1.5, heroes ×2.
    - Castles cost 4× in all: levels 10–20 at three times the price.
  - **Duplicates:** Forge → 🧩 Feed a duplicate banks 1/N of the card's 1→10 cost on it. N is 18.75 up to Super Rare, 17.5 to Unique, then 15, 13 and 10 for Legendary, Mythic and Ancient.
  - **Disenchanting:**
    - A copy melts for 0.25% (Common) to 10% (beyond Ancient) of an MU.
    - Foil finishes (+1 to +3), extended art, skins and Shiny multiply it.
    - **Melt down** takes a card back to its starting level and refunds 97% of its levels. Base, Quest and Event cards can't be melted.
  - **Income:**
    - Daily notices and weekly quests give ≈6.6 MU a week (≈28 a month).
    - Achievements give 10–50% MU.
    - First clears: 3% (skirmish) to a whole MU (campaign boss).
    - Boosters give a flat 1.5–4.5%.
    - Raid Dust is ×3.
  - Prestige, foil treatments, Blacksmith recipes, Materia crystals and Promotion cost 5× to match.
- **Card Ledger:**
  - Lists every rarity, including Very Rare, Super Rare, Quest, Quest-Unique and the special ones. Each has its colour and proper name.
  - New column: what each card costs to level 10, in MU.

## 2026-10-11 (23:50)
- **Plays left:** in a fight with more than one action a turn, a "▶ 1/2 plays" pill sits beside your Lumber. It counts down as you play and resets each round.
- **Versus screens on phones:** the boss opener's top/bottom split and the Arena versus screen kept the desktop's sideways split on phones. Both now split top and bottom, with the glowing seam across the middle.
- **Tests:** the UI smoke test now casts Tailwind from the hand (Wait −1, the turn ends, it's logged) and straps the Bramble Gauntlet onto a unit.

## 2026-10-11 (23:20)
- **Card editor: Card kind.** Unit, Spell or Equipment.
  - A spell picks Hasten, Mend or Sap and an amount.
  - Equipment picks the skill it grants (and its value).
  - The Spell / Equipment type tag is added for you.
- **The CPU uses the new card kinds.**
  - It casts a spell only when the spell would do something now (units still waiting, units hurt, enemies to sap). Otherwise it holds it.
  - With its play still free, it straps equipment onto its strongest unit (before, enemy equipment sat in hand forever).
- **New cards measured:**
  - **Bramble Gauntlet** wins 48% (in band).
  - **Thornwood Palisade** measured 38% at 2/18, so it's now **4/22, Counterattack, Spiteful 2** (53%, in band for Rare).
  - **Pyroclast Wyrm** with Pierce 5 is unchanged at 49%.
  - Spells aren't measured: a test deck of 8 spells has too few units for the number to mean anything, so the Ledger shows "not measured".
- **Shipping ledger commits:** `tools/card-ledger/ship.js` applies pending Commit-button commits to the card file, oldest first. It skips any field that changed since the commit was made, so a stale commit never overwrites newer work.
- **New decision D33:** day and night being off by default means 65 enemy decks' Nocturnal/Diurnal cards never get their bonus. Turn the cycle on for those fights? (Action items.)

## 2026-10-11 (22:40)
- **Renamed keywords:**
  - **Puncture N** (was Pierce): every landed melee hit also deals N damage to the enemy castle.
  - **Pierce N** (was Rend): every melee hit ignores N of the target's Armor. Pyroclast Wyrm has Pierce 5, which covers every Armor in the game.
- **Perforate N:** Pierce N + Puncture N + N Bleed, and the hit strips N Armor from the target for good.
- **Counterattack:** the unit never attacks on its own. Each time an enemy unit hits it, it strikes the enemy in front of it.
- **Spiteful N:** any enemy unit that damages it (attack, arrow or skill) takes N back.
- **New cards** (all in Pack 1):
  - **Tailwind 🍃**, the first **Spell**: 1 Lumber, all your units lose 1 Wait.
    - A spell never takes a place on the field. Casting it uses your play for the turn.
    - Spells can also Mend (heal your units) or Sap (enemy units lose Attack).
  - **Bramble Gauntlet 🧤** (equipment): +1/+2 and Spiteful 2.
  - **Thornwood Palisade 🪵** (structure): 2/18, Counterattack, Spiteful 1.
- **Actions per turn** (a new fight modifier in the skirmish editor; Arena rulesets can use it too):
  - Each side may play N cards a turn. The turn waits until you've used them, or you end it.
  - The side playing second gets N extra cards, N−1 castle Health and N−2 Lumber.
- **Natural Leader:** the Wandering Traveller's leader skill has its new name.
- **Guardians** wear riveted steel plates braced out from both sides. A card with **Revivification** carries a pair of white wings until its revive is spent.
- **Status keywords in card text:**
  - Poison, Bleed, Decay, Corrode, Frozen, Asleep, Paralyzed, Stunned, Blind, Tipsy, Confused, Shocked and Staggered are named in their own colour (Poison in green, Bleed in red…). Their rules are no longer repeated inside each skill.
  - Under the skills, a hairline and a short glossary explain each status that came up.
- **Fight costs:** the Conquest Fight button shows its Energy as a pill (e.g. "1⚡"). The "tickets left" pill on the result screen was hard to read; it is now dark on light.
- **Versus screens:**
  - The pre-fight screen shows the enemy deck's level, coloured by how it compares with yours.
  - Both versus screens keep their green and red. They now add a glow behind each side, a fine diagonal weave, slow light rays from the centre and a glowing seam down the split.
- **Difficulty curve re-measured with day/night off:**
  - The climb holds, from about 24 at Map 1 to about 63 at Map 23.
  - The Ashen Peak (Map 5) had jumped to 44 and was re-tuned to 37. Its castles got lower Health, and Caves & Alcoves (Map 6) got small Health nudges. Hub → 📈 Difficulty is updated.

## 2026-10-11 (21:30)
- **Day and night are off by default.** A fight turns them on in the skirmish editor (Day & night: cycle day-first or night-first, always day, always night) with **Switch every N rounds**. The daily Arena rulesets keep their own day/night rules. Nocturnal and Diurnal cards only get their bonus while a cycle runs.
- **The "ghost" sound was the nightfall howl.** It's now a reedy wolf's voice: a sawtooth through a moving "oo–ah" formant, a scoop up into a long held note, a light wobble and a falling tail.
- **Rare lava ambience:** on The Ashen Peak, Basalt Foundry and The Sundered Peak, a lava bubble pops and its spatter sizzles about every 15–26 seconds.
- **Deaths:**
  - The bleed-out colour wash now sits inside the card and moves with it, not as a box over the slot.
  - A shattering token takes its whole slot with it; no frame is left behind.
- **Statuses:**
  - **Tipsy** swings left, ahead or right at random and misses an empty column.
  - **Confused** fizzles its triggers and on-hit skills half the time.
  - **Blind** now misses half the time.
  - The new passives **Drunk 🍺**, **Purblind 🕶️** and **Scatterbrained** keep the card Tipsy, Blind or Confused for good.
  - On-hit **Make Tipsy** and **Confuse** skills.
- **Triggers:**
  - Reactive triggers are offline while a card waits, is Stunned, Frozen or Asleep (greyed ⚡).
  - The new **Primed 🔋** passive keeps them online.
  - Wandering Traveller makes Lumber only the first time it readies.
- **Swarm** is now +1 Attack per matching ally, updated live as allies arrive or fall. In the editor it can count any shared type or only the types you pick.
- **Skill wording:** effects last for good unless they say "until end of turn". "Permanently" is gone from descriptions and the log.
- **Your second match teaches the 1-second card hover.** Once the enemy fields its toughest card, a tip points at it and play waits until you rest the pointer on it and its details open. It offers Skip after 12 seconds.
- **Ranks:**
  - E ×0.6, D ×0.8, C ×1 (a win with about half your Health), B ×1.05, A ×1.1, S ×1.11, SS ×1.12, SSS ×1.13.
  - Losses rank F, FF (their castle took 2 or less) or FFF (1 or less, units included).
  - The multiplier only touches repeat rewards, never first clears.
  - Each rank's tooltip says how it was earned.
- **Conquest:**
  - The top-left map note fades away for 10 seconds when you hover it.
  - The map editor bar opens from a 🚨 button that only admins see.
  - The skirmish panel starts at the top with "Cleared" on its top row. It has a faint green border once beaten, and red when the enemy far outlevels you.
  - The nav buttons hide while a skirmish is focused.
  - The between-maps loading veil shows only on the first map load of a session.
- **Energy:**
  - Play buttons, post-fight windows and Conquest show their Energy cost on the button.
  - Clicking Energy opens a panel: "+5 Free energy!" once a day, or "Get more energy!" for admins. Energy can sit above the cap (22/20).
- **Test → 🎨 Card Decorator:**
  - Pick a card from your collection.
  - Change its art frame, rarity frame, biome trim and foil.
  - Tune foil strength, ice crystal lines, hue, saturation, band angle, glare and colour set (Rainbow, Ice, Ember, Verdant, Silver, Dusk).
  - Copy the spec to keep a look.
- **Card object audit** (docs/card-object-audit-2026-10-11.md):
  - Cards are lean (about 20 elements on the board) with no hidden subtrees.
  - Floating tips (card details, delayed tooltips, the deck tooltip) now follow the card they describe through one watcher (`TipWatch`). They fade with it and close as soon as it's removed, hidden or faded out, without per-card fade hooks.
- **Version and card-data check:**
  - Each build stamps its id and its card-data hash, and writes them to version.json.
  - Once a session the game compares: a newer build offers **Update**; a hash mismatch reports damaged card data and offers **Reload**.
- **Card Ledger:**
  - The table shows the stats the game actually uses, with your change in a separate "→" box.
  - **Commit** queues the stat edits as a commit in the ledger, marked "committed" until Claude ships them into the game's card file.
  - The game also accepts patch-style card overrides for that path.

## 2026-10-11 (18:10)
- **The original maps are back as Maps 1–13, in their old order; the new maps follow as 14–23.**
  - 1 Bramblewood Outskirts · 2 Thistlewood · 3 Pebble Beach (+ 3-A Smugglers' Grotto) · 4 Sunken Hollow · **5 The Ashen Peak** (a main map again) · 6 Caves & Alcoves · 7 Savanna Reaches (+ 7-A The Canopy) · 8 Wolfsbane Tundra · 9 Coral Current · 10 Sable Swampmire · 11 Basalt Foundry · 12 Eyrie Heights · 13 The Sundered Peak · 14 The Morel Hollow · 15 Lilypad Reach · 16 Gannet Cliffs · 17 Gatorback Swamp · 18 The Kelp Mangroves · 19 The Briar Maze · 20 The Redwood Deep · 21 The Long Grass · 22 The Pinewood Taiga · 23 The Glass Dunes.
  - Maps count from 1 again, as on the world screen. Fight codes read N-k, side maps N-A-k, and the tutorial is 1-0.
  - The Traveller's Cart is on Map 3, the Ember Peddler on Map 11 (Basalt Foundry), and Whisper's Game on Map 5 after 5-2. The rare S-rank find starts at Map 5. The first egg is a Water egg on Map 4.
  - A map you've already fought on stays open, so nobody loses progress.
- **The road now climbs.** Every fight was tuned against a target difficulty index that rises from about 18 at Map 1 to about 62 at Map 23. Elites sit above their map's skirmishes, bosses higher still. The tuner is the new tools/curve_tune.js.
  - Measured map averages climb from **22 (Map 1) to about 60 (Maps 20–23)**, with small dips at Maps 10–11 and 21–23.
  - The Starter deck's win rate falls from 43% to 2%, the Mid-road deck's from 94% to 43%, and the Strong deck's from 97% to about 65%. Hub → 📈 Difficulty has the chart.
- **Menu:**
  - **Raid** has its own tile beside Arena on Home, and sits beside Arena in the Play tabs.
  - **The Autobattler** (Whisper's Game) moved into the Arena page.
  - Once Raids are open, the Nest becomes a pinned note so the grid stays even.
- **Raids open at Map 12.** The Raid Banner and Wound Reaver's Domain come after Eyrie Heights' boss, and the Deep Troll King's Domain after the Sundered Peak's. Players who already opened Raids keep them.
- **Faction packs, reworked:**
  - The Otter, Hummingbird and shared Riverbank cards are now in the three basic packs (Sprout Pouch, Acorn Chest, Golden Bramble Case).
  - **Your faction's pack** (2 cards of your side, 1 general card) comes from every boss's first clear. It can't be bought, and Food tokens are retired.
  - **Subfactions:** beating an elite of one of the five peoples (Road-folk, Wild beasts, the Hive, the Deep, Woodland folk) collects that subfaction the first time and gives its bundle (2 of their cards, 1 general). The Shop shows which you've collected.
  - Repeat elite and boss wins have a 5% chance of the same pack.
- **Card Ledger and the Difficulty tab** use the game's own fight codes (Map 4 · 4-2, not Map 6 · 2-2).

## 2026-10-11 (17:10)
- **Hub → 📈 Difficulty: the difficulty curve.** Three reference decks play all 175 fights on the road (60 games each, side maps included; raid bosses are left to the Raid editor):
  - **Starter:** the deck a new Otter player actually starts with.
  - **Mid-road:** built from Base cards and every map reward up to Map 10.
  - **Strong:** built from everything you can own.
  - Mid-road and Strong are built by simulation: cards are ranked by their measured win rate, then a hill-climb keeps any swap that wins more across a spread of fights.
  - **Difficulty index** (0–100) for each fight averages four things: how often each deck loses, and how much castle Health the Strong deck loses. Two fights the Strong deck always wins still differ by what they cost it.
  - The tab charts every fight in road order with each map's average, shows each deck's win rate by map, and lists what breaks the climb. Below that are the three decklists and a sortable table of every fight.
  - Re-run with `node tools/difficulty_curve.js`, then rebuild the hub.
- **What the curve shows today** (map averages):
  - **Maps 0–5 are flat, around 18–31,** and Maps 4 and 5 (Pebble Beach, Gannet Cliffs) are the easiest on the road. They're easier than Map 0.
  - **A step at Map 6** (Sunken Hollow, 43), then a climb to about 53 by Map 9.
  - **A plateau around 49–55 from Map 9 to Map 21.** Map 11 (Eyrie Heights, 56) is the peak, and Map 10 dips to 44.
  - **Outlier:** 17-A y-3 Sloth Boughs (a skirmish at 64) is harder than the next map.
  - The Starter deck wins 29–36% of Map 0–3 fights, so the first maps lean on the rewards you pick up.
- **Card Ledger:** a new artifact, an editable sheet of every card's stats, source and balance-run win rate. Say "apply the card ledger" to put its edits into the game.

## 2026-10-11 (16:30)
- **Why the late maps were easy: the computer couldn't afford its own cards.** The Sundered Peak decks held 4-Lumber Cave Warlords and Cataphract Destriers, and the Basalt Foundry 3-Lumber Magma Titans, with nothing in either deck that makes Lumber. Adding a Lumber maker fixed most of them without touching Health:
  - **New card: Cinder Stoker** 🦎 (Common, Volcanic, 0 Lumber, 1/7, +1 Lumber when it arrives). It's in the Basalt Foundry's 9-5, 9-7 and 9-8, and won at 9-9 Slag Runners.
  - **New card: Pack Mule** 🫏 (Common, Horse, 0 Lumber, 1/9, +1 Lumber when it arrives). It's in the Sundered Peak's 11-5, 11-6 and 11-8, and won at 11-9 Panther Ledge.
  - **Beaver Builders** join the Tundra boss (t-7), as on the other Tundra fights.
  - **Results:** 11-5 and 11-6 went from 78% and 72% to about 50% (target 45%). The Tundra boss went from 52% to 38% (target 35%). Basalt Foundry 9-5 is 56%, 9-7 44% and 9-8 44%.
  - Both new cards have art prompts queued with D30 and show their emoji until then.
- **Eel Nest (7-7)** now holds eels: Riptide Eels, Coral-Current Eels and Moray Ambushers, plus a Coral Polyp Colony for Lumber. It went from 72% to 58% (target 45%).
- **Map 3, Lilypad Reach, now teaches two skills** (it introduced none):
  - **Evasive:** Camouflage Frog moves from the Ashen Peak (a frost map) to the Pond's frog fight, p-5, where you meet it and win it.
  - **Reach:** two Riverstone Slingers join p-6, the answer to the Pond's flying ducks.
- **Whole road:** 2 of 175 fights are now more than 12 points off target, both easy by 13 points (3-6 and 7-7). Earlier today it was 32. 8-3 was retuned after the Willow-o'-Wisp went in (now 76% vs 68%).
- tools/retune_all.js gains `--keep=…` (never trade these cards away).

## 2026-10-11 (15:40)
- **New card: Willow-o'-Wisp** 🌑 (Uncommon, 1 Lumber, Wait 1, 2/6, Nocturnal). A beetle made of shadow, of the new **Shadow** type (also Insect and Forgotten).
  - When an ally dies, it gains +1/+1 (once Ready).
  - When it dies, it exiles 2 cards from your graveyard (+2 Echoes for Remember cards).
  - You meet it in 8-3 Toad Chorus in the Sable Swampmire (Map 9, the Exile and Remember map), and win it there.
  - Without art yet, it shows as a dark silhouette with a cold glow. Its art prompt is queued with the faction-pack prompts (D30).
- **Triggers show when they're off:**
  - Every custom trigger now shows as **⚡→ what it does** on the card's bottom strip: ⚡→🐝 spawns, ⚡→💪 buffs, ⚡→🪦 anything to do with the graveyard, ⚡→🏹 arrows, ⚡→🪵 Lumber, and so on. These replace the separate per-action icons. Hover one to read the trigger.
  - **The rule:** reactive triggers (On Attacked, On Ally Die, Per Turn, On Ally Spawn and the like) are off while a card is still Waiting. Their ⚡ is grey, and it sparks on when the card becomes Ready. On Spawn, On Ready, On Death, On Exile, On Attack and On Kill always fire, and their ⚡ stays lit.
  - Card text says "(once Ready)" on reactive triggers. In the card editor, "also while Waiting" lets a trigger opt out (this replaces the earlier "once Ready" tick box).
  - Only one existing card plays differently: Feral Tuskboar's "+1 Attack when attacked" now starts once it's Ready.

## 2026-10-11 (14:50)
- **Late-map balance pass.** Thirty-two fights came out more than 12 points too easy in the simulator (the new-player deck model). Nine still do, and none are too hard.
  - The fights that hit the castle Health cap (240, the campaign boss 300) now trade cards instead.
  - Trades stay on theme. A fight borrows only from maps of the same biome up to two maps ahead (the Tundra takes taiga lynxes and wolverines, not savanna zebras). The volcanic maps take only cards that share their main types: Basalt Foundry stays volcanic, arachnid and elemental; the Sundered Peak stays bears and horses; the Ashen Peak stays frost, rodents and apes.
  - Epic-and-rarer cards are never traded away, and Magma Titan stays in the Basalt Foundry by hand.
  - A trade is kept only if it moves the fight toward its target.
  - **Still too easy (your pass):** t-7 Tundra boss (52% vs 35%), 3-6 (48% vs 35%), 9-5, 9-7 and 9-8 at the Basalt Foundry (about 75%, where the themed cards are expensive and the CPU can't always afford them), 11-5, 11-6 and 11-8 at the Sundered Peak, and 7-7 on the Open Sea.
  - tools/retune_all.js gains `--swaps=N`, `--cap`, `--borrow-next=K`, `--borrow-biome`, `--theme` and `--keep-rare`.
- **Codex → Reference → Skills along the road:** each skill sits under the first map whose enemies carry it. Skills you've met read in full; the rest show as ?, and maps you haven't reached just say how many there are to find.
- **Translations** for the new strings: Skills along the road, the Changeling label, Keen Eye, Tempering Stone and the Forge notes.

## 2026-10-11 (12:45)
- **Scraper of Skies** only releases bees once it's Ready (built). Custom triggers get a new "once Ready" tick box in the card editor, so any trigger can stay silent while its card is still Waiting.
- **Board camera:**
  - A summon now plays first; the camera zooms out to fit afterwards. It waits until no summon or card move is playing (about 2 seconds at most), then drifts to the new framing over about 0.8 seconds. Only a new match frames instantly.
  - When the cards bunch to one side, the camera leans a little toward them (about 40% of the way, never pushing a card out of frame) and turns up to 3° the same way. Reduced motion and the Low effects setting keep the lean and drop the turn.
- **Changeling disguise and Keen Eye 👁️:**
  - An enemy Changeling now looks like an ordinary Common critter, with its real numbers, until it strikes or is struck. Then it's unmasked with a shimmer and a "🎭 Changeling!" label.
  - New skill **Keen Eye**: while one is on your board, enemy Changelings show as themselves, and it hits them for 2 more. On Owl Sentinel, Fawn Scout and Warren Scout.
- **Material gates on the last levels:** levels 7–10 of Epic-and-rarer cards each need a 🪨 **Tempering Stone**, and level 10 of a Mythic or Ancient card also needs a 🐉 Dragon Scale. Stones come from boss first clears (raid and campaign bosses give 2), 5% of repeat Elite and Boss wins, and the Blacksmith, which smelts one from 3 Iron Shards and a River Pearl.

## 2026-10-11 (11:20)
- **Forge pacing** (`docs/forge-economy-2026-10-11.md`):
  - Levelling now costs more for rarer cards. A Common is still 690 Dust to level 10 (about a week of Dust for a regular player); a Rare is ×1.5, an Epic ×2.5, a Legendary ×4.5, a Mythic ×6 and an Ancient ×8.
  - Castles have rarities now (the plain Castle is Common, the early map castles Rare, the later ones Epic, Coral Spire Legendary) and cost more to level as they get rarer: a Rare castle takes about 2,400 Dust to reach 20.
  - The free +8 Dust per win is gone from modes that already pay out (Arena, Gauntlet, Ghost runs, Raids, Dungeon runs); quick battles against the computer give +2.
- **Blacksmith** (Forge):
  - **Materia** cards: Iron Shard, River Pearl, Ember Core and Dragon Scale. They drop from Elite and Boss first clears, the odd repeat win and high ranks.
  - Six equipment recipes, plus **Fuse** (3 spare copies → 1 random card a rarity higher).
  - **Equipment** is dragged onto one of your units in a fight. It gives that unit stats and a skill, never takes a place on the field (so it can't block), and falls with the unit.
  - New skill **Demolisher N:** +N damage to Structures.
- **Nest:**
  - A hatchery of seven hay nests in a hexagon under a windy sky.
  - Eggs and babies show their type and grow into a random card of it.
  - Babies are sometimes rescued after fights, and bosses sometimes leave an egg.
- **Changeling 🎭:** a new type of kind mimics that share a type with every unit. There are three: Puddle (Pack 1), Hedge (the faction packs), Glass (the Mystery Booster).
- **The Scale Trail:** a hidden substory. Eight harder fights each hide a Dragon Scale for an S rank.
- **Inventory:** a new page, pinned on Home.

## 2026-10-11 (10:10)
- **The 0–20 road is built** (D29, with my suggested answers; one revert brings the old order back).
  - Maps now count from 0: the Outskirts and the tutorial are Map 0 (0-0, 0-1 …).
  - New order: 0 Outskirts · 1 Thistlewood (Thistle Fields, renamed) · **2 The Morel Hollow** · **3 Lilypad Reach** · 4 Pebble Beach (+4-A Smugglers' Grotto) · **5 Gannet Cliffs** · 6 Sunken Hollow · **7 Gatorback Swamp** · **8 The Kelp Mangroves** · 9 Sable Swampmire (the Mire) · 10 Caves & Alcoves · 11 Eyrie Heights · **12 The Briar Maze** · **13 The Redwood Deep** · **14 The Long Grass** · **15 The Pinewood Taiga** · 16 Wolfsbane Tundra (+16-A The Ashen Peak) · 17 Savanna Reaches (+**17-A The Canopy**) · **18 The Glass Dunes** · 19 Basalt Foundry · 20 The Sundered Peak · 21 Coral Current (the open sea).
  - **11 new maps, 77 fights,** built from existing cards. Every reward is a card that had no home before (74 cards). Each map has its own pixel background and colours.
  - A map you've already fought on stays open, side maps included, so nobody loses progress.
  - The Traveller's Cart moves to Map 3, the Ember Peddler to Map 11 and Whisper's Game to Map 5 (5-2). Anything you've already unlocked stays unlocked. The rare S-rank find starts at Map 5.
  - Every fight's castle Health was retuned in the new play order (four passes of tools/retune_all.js). Castle Health is capped at 240 (300 for the campaign boss).
  - **Balance flag:** 22 of 175 fights still come out easier than their target, mostly elites and bosses from Map 9 on. A player's likely deck now holds far more reward cards by then, and castle Health alone can't close the gap. Those enemy decks need stronger cards (your balancing pass).

## 2026-10-11 (09:40)
- **Translations:** today's new text (Dungeon castles, faction packs and Food tokens, the pitch reminder, "Answered by", the New skill ribbon, the New achievement banner) is in all 12 languages.
- **Card list v2:** Beaver Lumberjack and Courier Pigeon are marked as deliberate starters (your B4 call), not accidents.
- **Action items:** D29–D32 added (the card-list questions, art for the pack cards, level caps, Wildpaths points).

## 2026-10-11 (09:20)
- **Counters in card details:** a skill's line now says what answers it. For example, Flying is "Answered by: Reach, Anti-Air", and Poison is "Answered by: Regeneration, Bloom, Healing". Only answers that really work in the engine are listed.
- **New achievement on the results screen:** a gold banner names any achievement that became ready to claim, once each.

## 2026-10-11 (07:10)
- **Wandering Traveller:** gives +1 Lumber once, when it first becomes Ready, instead of every round.
- **Play slots:** they're invisible until you pick up a card (drag it or tap it), then fade in. They fade in once the cards have settled, so a new slot no longer appears in the wrong place and jumps.
- **Buffed Attack:** no longer blue. It stays red and gets redder and glowier as it climbs: a little at 1.5× the printed value, more at 2×, 2.5× and 3× (the last two pulse).
  - The card details read "⚔ 5 (2 + 3)": the total and base in red, the bonus in blue.
- **Skill symbols on the south border:** every symbol, Poison and Flying included, sits in a small seal on the card's bottom edge. It no longer collides with two-digit Attack or Health. Board cards show up to 3 before cycling.
- **Revivificated:** "The first time it dies, it comes back with 1 Health and its statuses cleared. This only happens once."
- **Card editor → Stats by level:** set Attack and Health for every level from the card's base level up to its cap. A blank cell follows the default curve (shown in grey). There's a "Fill blanks from the curve" button. Every rarity caps at 10, castles at 20 and the hero at 100. The caps live in one table (`RARITY_MAX_LEVEL`).
- **Wildpaths (preview):** a page for PvE passive skills, with three hand-inked trails (The Root, The Thorn, The Bloom) of 7 marks each and its own logo. It's pinned on Home for admin and dev builds only, and changes nothing in fights yet.
- **New skill ribbon:** a skirmish preview lists the enemy skills you haven't met yet.
- **Doc:** "Introducing stats and mechanics along the road" (`docs/mechanics-onramp-2026-10-11.md`).

## 2026-10-11 (01:30)
- **Faction packs:** a Rivergate Pack (Otters) and a Sunfeather Pack (Hummingbirds).
  - Each pack draws from 15 cards: 10 for its side plus 5 Riverbank cards both share. That makes 25 cards: 19 new, plus 6 moved out of Pack 1 or given a home.
  - 2 cards a pack. Each card comes from your side's 15 (89%), Pack 1 (10%) or the other side's 10 (1%).
  - If neither card is Uncommon or better, you get a bonus Common or Uncommon.
  - Elite-and-up fights drop a pack on the first clear, and 5% of the time after that. You get the Otter pack against the Legion, the Hummingbird pack against the Tribes, and otherwise your own side's.
  - Neither pack is sold for leaves. The Sunfeather Pack can be bought for 5 🍯 **Food tokens**: you get 1 for every first clear and sometimes 1 for a repeat.
  - Unopened packs wait in the Shop under **Your packs**.
- **New skill, Lantern 🏮** (Lantern Bearer): at Night, your Diurnal units keep their day bonus.
- **Otters vs birds:** Riverstone Slinger has Reach (never misses a flyer), and Net Thrower has Anti-Air 2.
- **Pitching:** once you've pitched this turn, the Lumber tooltip turns red and says so. Dropping another card on the graveyard gets a reminder from your side's captain.
- **Dragging:**
  - A card you pick up keeps its full look; it used to lose its sizing and some effects mid-drag.
  - The Leader drags like a hand card: only the card goes with you, and its slot stays put.
  - The Leader's ribbon is just 👑, plus the cost if it has one; "Summon" is gone.
- **Card list v2** (`docs/card-list-2026-10-11.md`): the 21-map road (0–20) with every card placed, the real Base set (51 cards), the faction packs, and open questions.

## 2026-10-11 (00:40)
- **Dungeons, rebuilt:** a Dungeon is several castles in a row (2–8, default 3).
  - Castle 1 is a normal fight. When it falls, the next castle pops up in its place.
  - The enemy's field fills as if it had played 3 turns: it pitches up to 2 cards for Lumber and summons the best cards it can afford, not just the cheapest. Then it draws 4. You only see the result: the new cards drop in from the top.
  - The new wave takes the middle. Survivors aren't killed; they're pushed to the sides.
  - Every castle but the last starts weaker (¼ of full Health, rising to ½); the last has full Health.
  - Each castle has a round limit (default 8). When it runs out, the next castle arrives anyway and the old castle's remaining Health is added to it.
  - A chip at the top shows "Castle 2/3 · N rounds left".
  - Rank: a normal Dungeon tops out at S; Elite and Boss Dungeons reach SSS, with the fast-clear bar scaled by the number of castles.
- **Edit skirmish → Dungeon:** for Dungeon nodes you can set the number of castles, the tier, first and second-to-last Health %, setup turns, pitches, cards drawn, round limit, and the first and last castle shields. A plain-language description and a row of castle Health previews update as you type.
- Text fields in editors no longer break on numbers.

## 2026-10-11 (00:20)
- **Fight kinds:** Champion 🏅, Mini-boss 💢, Sub-boss ☠️, Dungeon 🗝️, World Boss 🌍 and Mega Raid 👑 join Elite, Boss and Raid.
  - Each new kind borrows an older kind's energy cost, payouts and rank caps.
  - Every special fight keeps a kind badge on its map node, and cleared nodes keep a ring in the kind's colour, so you can still tell an Elite from a Boss after beating it.
  - The boss title card names the kind.
- **Enemy castles:** every fight on Maps 1–10 now defends that map's castle, passive included, unless the skirmish picks its own.
  - Bigger fights bring a higher level of it: Elite 3, Boss 8, Raid 12, Campaign Boss 15.
  - Edit skirmish has a Castle level field to set it.
- **Skirmish preview, simpler:** the showcase card leads, and the enemy deck folds into "Their deck · N cards". Edit skirmish has a Showcase card picker; the default is the deck's strongest card.
- **Deck building from what you own:**
  - The pool shows a stack for every card you own, as deep as your copies, with "left/owned".
  - A deck can use as many copies as you own, whatever your other decks use. Base cards are unlimited.
  - **Finishes stacked / apart** switches between one stack per card and one stack per foil finish.
  - The deck itself shows as small card stacks with ×N instead of name pills.
  - Sort by Cost, Attack, Health, Wait, Rarity or Name.
- **Skirmish decks:** Edit skirmish's **Edit deck** opens a deck-builder window named after the skirmish (stacks, search, sorts). The editor keeps its scroll position.

## 2026-10-10 (23:50)
- **Home:**
  - the background is full size straight away when you come back from Conquest (only the menu does the page turn);
  - a soft light from the top, a dark band at the bottom, and a brown spotlight that leaves the menu lit;
  - the Quests and Codex notes sit a little closer to the menu.
- **Achievements:** a 🏆 note on Home (shows how many are ready to claim) and a 🏆 button on the Arena page.
- **Quest board:** it swings up from below, and loose notices flutter off it.
- **Cave maps:**
  - one or two snails creep across in straight lines, very slowly, leaving faint blue trails;
  - the crystals in the map art sparkle now and then;
  - on dark maps (caves, the grotto and the swamp) a predator's eyes glint in the dark, away from your lantern.

## 2026-10-10 (23:30)
- **Map numbers:** the Outskirts is Map 1, so Pebble Beach is Map 3 (3-1, 3-2…) and the tutorial is 1-0. Side maps use a letter: Smugglers' Grotto fights are 3-A-1, 3-A-2… The side skirmishes added earlier are on Maps 11 and 13.
- **Maps 14–20** are on the world map as Reserved; they don't open yet.
- **Map intros:** the map card shows the first time you ever open a map, and for the first map you open each session.
- **Cave maps** (Caves & Alcoves, Smugglers' Grotto):
  - they open in darkness with the map's name, then a light spreads out from the centre and settles into the lantern at your pointer;
  - away from the lantern it's much darker, and the darkness now covers the skirmishes and the trail too.
- **Map page:**
  - the title banner and the admin layout bar fade away while your pointer is over them, and clicks go through to the map (buttons still work);
  - the map arrows are greyed out while you edit the layout.
- **Home from Conquest:** the Home chip in the map list is gone. Use the top-right icon, or the 🌰 chestnut over a compass at the top of the World map.
- **Map castles and leaders:** each of Maps 1–10 has its own castle and a Heroic leader.
  - Castles: Outskirts Watchtower, Hedgerow Burrow, Tidewall Fort, Drowned Bellhouse, Ashen Bastion, Lantern Warren, Acacia Kraal, Wolfsbane Lodge, Coral Spire, Bog Stilt-House. Each unlocks when you beat that map's boss.
  - New castle passives: every unit +N Health, Flying units +N Attack, heal N each round.
  - Leaders (the boss's first-clear reward): Sergeant Bramblefox, The Thistle Baron, The Old Shell, The Drowned Matriarch, Yeti Chieftain, Echo Matriarch, Pride Queen, Wolfsbane Alpha, Reef Admiral, The Heron Hag. If you've already beaten a boss, you get its leader the next time you open the map.
- **Leaders must be Heroic or above.** The Wandering Traveller stays a Base card but has the new 👑 **Leader** passive. A saved leader that doesn't qualify stays in the deck, shows a warning and sits out matches.
- **Special rarities:** Special, Dev-Legendary, Dev-Ancient, Event-Legendary and Event-Rare, listed after every normal rarity together with Quest and Quest-Unique. Each counts as its normal tier for power and copy limits.
- **Castles level to 20:** temper them in the castle picker for +1 starting Health per level.
- **Armoury:**
  - a ‹ Back button in the deck editor;
  - the top row's Wait badges are no longer clipped;
  - hovering a card in the deck-large-preview shows its details after 1 s;
  - a new **Medium** view (deck-medium-preview) shows the castle on the left and the leader's art on the right, without the card list.
- **Card editor:** the art choices read just "Normal" and "Extended".
- **Music:**
  - new loops: *Sand and Banners* (Arena), *The Long Road* (Conquest map), *Drums Under the Hill* (Raids);
  - new stings: *Laurels* (victory) and *Fallen Leaves* (defeat).

## 2026-10-10 (23:15)
- **Music library, the Songbook:** five composed place themes, played by synthesised instruments so they're royalty-free by construction:
  - Shop: *Flour and Copper*, a waltz;
  - Armoury: *Tent Pegs*, a march;
  - Forge: *Bellows*;
  - Nest: *Down Feather*, a lullaby;
  - Codex: *Margins*.

  Each loops with small variations and crossfades as you move between places. Home keeps the calm piano and battles keep the seven people bands. The Effects Lab has a new **Music** tab to preview everything, battle bands at any intensity included.
- **12 new sound effects:** Shield Call drop, Backstab, Boomerang whirr, Shelf pick, Pay at the counter, Map unrolls, Mystery boing, Tape rip, Bow creak, Burn away, Ice shatter, Night swell. They're wired into the game and listed in the Lab.
- **New skill effects in battle (and in the Lab's Skills tab):**
  - the Anti-Air boomerang with feathers;
  - Shield Call's falling shield;
  - Backstab's dagger and slash;
  - ice shards and green drips on cold and poison deaths.
- **Effects Lab:** the page now always gets the newest script; the hub had been serving an older copy without the Beach shader option.

## 2026-10-10 (22:40)
- **Map loading veil:** entering a map shows a parchment card with the map's icon, name and number. It lifts once the map's effects have drawn their first frame (at least 0.35 s, at most 1.8 s), so nothing half-loads. Re-renders of the same map keep the live effect layer instead of rebuilding it, so it no longer blinks.
- **Talon Archer** (2/8 Flying, Arrow 2, Diurnal): an eagle that holds the bow in one talon and draws with the other. It isn't in a pack or on a map yet; that's your call.
- **NEW! in battle** shows only on enemy cards.
- **GSAP 3.13** in the game (it was 3.12.5). Every GSAP plugin is free from this version on.
- **Art queue:** `art_staging/jobs_2026_10_10.json` has PixelLab prompts for the 21 cards from tonight that still have no art.

## 2026-10-10 (22:30)
- **Shop shelves:** the Shop is a bakery and apothecary wall now.
  - Wooden shelves hold the goods: single packs on a straight shelf, sets of 10/25 tied with twine on a crooked one, and crates of 50/100 on a stepped one, with jars and loaves in between.
  - Each item has a handwritten masking-tape label and a price tag.
  - Hovering an item shows a card with its details. Clicking it puts it on the counter below, where the Open button is.
  - The wall scrolls when it fills up.
- **Cream foil:** boosters, on the shelves and when you open them, are a cream metallic foil with grain instead of pastel rainbow.
- **Mystery Booster** (❓, 80 🍁): 3 cards from its own pool of 8 oddities: Two-Headed Calf, Upside-Down Bat, Teatime Toad, Mirror Moth, Snail Mail, Glass Golem, Wrong-Way Salmon and Inside-Out Hedgehog.
- **Flea Market:** player trading moves out of the Shop into its own page, which unlocks on Map 30. Map 30 doesn't exist yet, so for now it opens only through Admin → unlocks.
- **Skirmish codes:** maps count from **Map 0**, and every fight has an X-Y code (0-1, 0-2 … the tutorial is 0-0, a raid boss X-R, Smugglers' Grotto 2-G1). The codes show on the map, in the tooltip, on the fight panel and on the VS screen. Save data is unchanged.
- **More fights:** Basalt Foundry (Map 10) and the Sundered Peak (Map 12) get two side skirmishes each, so both have 10. Side skirmishes branch off the trail without blocking it, and their castles are tuned with the map auto-tuner.
- **One NEW! tag:** the pack-opening stamp's look (coral to gold, cream letters, wine outline, tilted, glowing) is now used everywhere: a first sighting in battle, the pack summary, the reward reveal and the "new cards seen" list.

## 2026-10-10 (22:00)
- **New skills:**
  - **Shield Call** (🛡️) on the new **Shieldbearer Hound**, 2/5 for 2 in Pack 1. The first time an enemy skill targets one of your units, a 0/10 Guardian shield (+1 Health per level) drops into its place and the unit steps to the nearest slot, so the skill hits the shield. Once per hound.
  - **Backstab N** (🗡️, D21) on the new **Stoat Cutthroat** (3/8 for 1, not in a pack yet). It always attacks the nearest enemy unit and never the castle; with no enemy units it holds its swing. It hits for N more when the unit isn't the one directly in front of it.
- **Pack opening:**
  - Opened cards fly down into the list.
  - Opening several packs lays out up to 10 at a time; you open each one by passing over or clicking it, and all of them must be opened.
  - 100 or more packs arrive as a crate.
  - Duplicates stack (with a count once there are over 100), special finishes get their own stack, and **NEW!** shows once per card per opening.
- **Cards:**
  - Skill icons on cards fit 3 to a row. In the hand and on the board they show one slot that cycles through the skills every 2 s.
  - Enemy cards you meet for the first time get a **NEW!** tag.
- **Test lab:** skill rows and number inputs are vertically centred, and the skill list keeps its scroll position when it redraws (the same fix applies to every panel that re-renders).
- **Docs:**
  - the card list for balancing (Maps 1–5 rewards, Pack 1, with a proposal);
  - the GSAP / shader / VFX exploration, with a new **🧪 VFX Playground** tab in the hub (9 live sketches).

## 2026-10-10 (late)
- **Arena themed by day:**
  - every day rolls one day/night effect (the 3-round cycle most days; a 1-round "Restless Sky" about 8%; Dusk Start; Long Night; Midsummer), plus a second field about half the time (Frost, Fog, Spring Rain, Heatwave, Timber Fair);
  - Open rules most days, Collapse about one day in eight.
- **Day and night:**
  - a wolf howls at nightfall and a rooster crows at dawn; the messages just say "Night falls." / "Day breaks.";
  - **Nocturnal / Diurnal take two numbers**, e.g. "Nocturnal +5/+6: at night gain +5/+6". The stats arrive with a swell, a green aura and drifting spores that stay while it lasts, and leave when the phase turns. The old on/off form reads as +1/+0.
- **New cards:**
  - **Weredog** (2/5, Nocturnal +5/+6);
  - **Ironmaw Warwolf** (9/26 Epic: Swipe, Bleed 2, Armour 2; Kip the monkey rides it);
  - **MissingNo.**, card #0 (hidden);
  - village folk: Parish Sergeant, Land Tiller, Village Miller, Night Watchman, Otter Ferryman, Otter Netmender, Nectar Vintner and Dawn Bellringer.
  - The new cards (all but MissingNo.) are in Pack 1.
- **Species:** every card has an animal type or Elemental, grouped into phyla (Beast, Bird, Arthropod, Scaled, Aquatic, Crawler, Elemental), and hybrids show both. The card details show it, and the editor has a Species field. See the Card types sheet.
- **Skills:**
  - effect lines open with their icon;
  - Flying and Earthquake text simplified;
  - **Bleed** hurts only when the unit attacks or uses a skill, and Bleed and Poison lose 1 stack each time they hurt. New **Festering** passive (🦠): while it's on the field, stacks don't wear down.
  - **Sweep N** reworked into a cleave: the swing spills N damage onto the units either side of the target.
  - Overwhelm is renamed **Stampede** (🐘): leftover damage from a kill carries into the castle.
- **CPU:** it still pays costs and saves up by pitching, and now picks the card that fits the board (walls under pressure, damage when your castle is low, Anti-Air and Flying against fliers, cheaper Wait when it's urgent) instead of the most expensive or a random one.
  - Side effect: Otters vs Hummingbirds starters now measure ~66%.
  - The tutorial rival brings one flier at most, keeping every side above 70%.
- **Music:** Battle music and Menu music each have a volume bar (no more on/off); the old Music slider is now Ambience.
- **Play tabs:**
  - Test shows only in admin mode;
  - the Raid tab is named after the first raid until a second opens, then "Raids" with a picker, and it goes full window like the Arena.
- **Arena defeat:** the result pills read on the dusk card, and Try again shows "−1 🎟️" in PvP.
- **Test lab:**
  - changing the Test Card updates it in place (gold flare and swell for an upgrade, a grey wash and a soft tick for a removed skill) instead of resetting the field;
  - click the empty board for a Damage / amount / Heal menu, then click a card. The log credits "Tester".

## 2026-10-10 (night)
- **Cards:**
  - **Normal art is the default:** the art sits in a window inside a rarity-tinted walnut frame, with a solid plate under it for the stats. A card can be set to **Extended art** (to the edges) in the card editor.
  - The card tooltip no longer says "Costs N lumber to play".
- **Anti-Air N** (new skill, 🪃): never misses a Flying unit, and hits Flying units for N more.
  - **Otter Centurion** gets Anti-Air 1 and becomes 2/8 (it was 3/9), so Otters vs Hummingbirds stays ~58%.
  - On Otter Kit it would have broken the tutorial for Hummingbird players.
- **Wandering Traveller:** 6/11, Wait 3, +1 Lumber when it's ready.
- **Ranks:**
  - Sub-bosses and bosses can earn **SS** (no castle damage) and **SSS** (no damage and a win by round 8).
  - Top ranks pay extra: S +25%, SS +50%, SSS +100%.
  - From map 5 on, an S-or-better win has a 12% chance to turn up a card from that map you don't own, once per map.
- **Defeat screen:** the Victory card at dusk (slate and moonlight, drifting ash), plus a quote from Sun Tzoo, Isaac Newt, Abraham Lynxcoln and 21 more.
- **Leaders:**
  - your leader's light stops at the middle of the field;
  - the rival's leader gets a crimson pillar, a banner and a low rumble.
- **Clearer effects:**
  - stat gains pop in gold (and the stat swells), stat losses in violet (and it shrinks);
  - a crackling aura flares behind a card whose effect triggers.
- **Battle:**
  - fast-forward shows 1 to 4 arrows;
  - the victory wave is twice as quick;
  - a forfeit's sign holds 0.1 s less.
- **Energy** refills 1 every 5 minutes. Fight, Fight again, Play again and Next are greyed out without enough Energy, and re-enable as it refills.
- **Skirmish card:**
  - the enemy deck level is coloured by the gap to yours (your own number is gone);
  - the deck list shows after a Rank B clear, with no Show/Hide button.
- **Maps:**
  - Smugglers' Grotto has a sunlit "Way out" linked to the first fight;
  - caves are about 50% darker away from your torch;
  - the previous/next map arrows sit in the bottom corners.
- **Skirmish editor:** the content scrolls above a fixed footer, and Battle type / out-of-moves sit in their own "This skirmish's battle" box.
- **Home:**
  - Deck is now **Armoury**;
  - once the Arena opens, it takes the Codex's tile and the Codex becomes a pinned note;
  - Community opens a Community page with Ranking / Friends / Guild tabs.
- **Arena and Test lab** go full window like Conquest, with the tabs at the bottom centre. A 🏟️ Arena button sits beside 🏠 Home on the map.
- **Notices (quests):**
  - three daily notices at midnight and one more at 6 AM, noon and 6 PM, each counting from when it's posted;
  - ranks D to SSS with the reward on the card; A and up show their letter, and S to SSS are rare and pay a lot;
  - one free swap a day;
  - a claimed note keeps its size.
- **Laurels 🌿:** a new material, earned only in PvP Arena fights (3 a win, 2 a draw, 1 a loss). Arena Leaves are now under 5 and Dust is 0 or 1. The results screen no longer scrolls for nothing.
- **VS screen** shows both deck levels.
- **Scrollbars:** a thin walnut thumb.

## 2026-10-10 (evening)
- **Victory: cards no longer fly right.** The round's last board update ran a slide animation just before the match ended; it's skipped when the round ends the match.
- **Bounty bubble:** an enemy bounty card shows a reward-coloured "+1 🪵 Lumber" bubble above it (instead of the 🏆 badge) while you hold a card, and for 3 seconds as your turn starts.
- **Badges:** ability symbols sit closer; repeated shields overlap more; two-part symbols (Earthquake, King Slayer) tuck together.
- **Shops:**
  - each merchant unlocks the next pack tier: the Traveller's Cart (map 3, Sprout Pouch), the new **Ember Peddler** in Basalt Foundry (map 11, Acorn Chest), and map 19's merchant later (Golden Bramble Case);
  - once a second merchant is found, the page and the nav are called **Shops**.
- **Wandering merchants:** one a day, parked on one of your opened maps. Find their barrow to get a pack of the best tier a quarter off, once that day. The Shops page only says someone is out there; listing where they are (and the timer) is the planned QoL level.
- **Beach:** Pebble Beach has its own effect (warm sun, glints on the shallows, foam lines, drifting spray) and its own surf-and-gulls ambience. It used to borrow Sunken Hollow's water.
- **Calm music:** a slow, sparse generative piano on the map and in menus, in the spirit of C418. It has its own switch (🎹 Calm music) and follows the 🎵 slider.
- **Tutorial:** the rival leaves out Quick cards and brings fewer fliers, so every side is still an easy win after the basic-card changes: Otters 82%, Hummingbirds 73%, Both 92%.
- **Docs:** inspiration from Super Auto Pets and Tooth and Nail units (Design tab).

## 2026-10-10
- **Effects Lab now shares the game's engine:**
  - every build re-copies the lab's effect code from the game, uses all of the game's stylesheets (it used only the first), and inlines the same GSAP build;
  - this fixes Draw flip, Victory toss, the crit stamp, flyer feathers and the new damage-number bursts, which needed GSAP and didn't load in the hub.
- **Deaths:** "Normal" (no more "knocked out") is one smooth topple from upright to flat, with no bounce after.
- **Shock:** soft electric glows (14–26%) flicker over the card in a few places, with a 1px jitter, instead of a clipped RGB glitch. "Token dies" is renamed **Shatter**.
- **Cards:** the bottom band is a faint 7–8% white wash ending sharply above the stats (rarity is on the border). The low-HP fade is unchanged.
- **Water** caustics and glints are about half as bright, in the game and the lab, which now runs the shader at the game's strength.
- **Foundry:** Terraria-style lava dust, tiny bright embers rising with a soft glow.
- **Hub:**
  - Design has subtabs that show one sheet at a time, and Claude's guide shows only the doc you pick;
  - the lab's faint hint lines and the Balance win-rate colours in dark mode are now readable.
- **Ecclesia (D23), your Prayer model:**
  - Prayer = Prayer N on your board + the cards in your Removal Zone. Ecclesia cards need Prayer 🙏N to play (never spent).
  - Once a turn you can offer a hand card for +1 (a picker opens when you're 1 short).
  - New keywords: Worship, Healing, Lightning, Midas Touch, Divine Retribution, Satiety.
  - Nine new cards: Chapel Sparrow (Base) and eight Eyrie Heights rewards up to the Legendary Cathedral Eagle.
  - The old Grace cards now give Prayer. A full Ecclesia deck measures 74%.
- **Starting deck is editable:**
  - Admin → 🎓 Edit the tutorial → Starting deck has the shared, Otter, Hummingbird and Both lists, plus the tutorial rewards.
  - Default: 12 shared + 5 for your side + the 3 tutorial reward cards, which go straight into the deck = 20. Otters vs Hummingbirds measures 56%.
- **Tutorial progress per player:**
  - Each player's tutorial progress is now recorded: level 0–4 (not started, picked a side, in the fight with the guided step reached, lost a try, complete), their side and number of tries. It syncs to their cloud save.
  - Admin → 👥 Players lists everyone with level, tutorial progress, cards and wins. It needs the S1 database function ("apply it").
- **Wandering Traveller** is Wait 2 and a base card.
- **Hub:** the 🎮 Play button sits at the top right, on the title row.
- **Test:** the autobattler ghost check runs 144 fights instead of 36 (36 was too noisy).
- **New basic cards (your list):**
  - shared: Duck Paddler, Pond Trout, Meadow Frog, Forager Ant, Bee Knight and the new **Crossed-Eyes** (2/3 Flying);
  - Otters: Otter Kit, Otter Centurion and the new **Fleetfoot'd** (2/4 Quick);
  - Hummingbirds: Cobalt Fledgling, Crimson Recruit, Mosswing (shortened names);
  - leader: Wandering Traveller.
  - All start at level 0. Starter decks are the shared six ×2 plus your side's three (×3, ×3, ×2).
  - Otter starter vs Hummingbird starter is now 52.9% (was ~1%). The tutorial stays an easy win (87% / 82% / 98% by side).
- **Rarity is on the card border now** (green Uncommon, blue Rare…), not the bottom band. The band is a plain dark scrim for readability.
- **"Per Turn" is now "On Turn Start"**, with a first option for whose turn: both (every round), yours or the opponent's. Your turn is the round where you strike first.
- **Card editor:** the preview and art panel has its own right-hand column and no longer covers the form when you scroll.
- **Test Kit:**
  - **Manual combat:** ⚔ Attack (one real swing with every on-hit effect, arrows, Sweep and Frenzy; no round passes), 🛡 Get attacked, −1 / −5 / +1 / +5 and ☠ Kill on your card or the enemy facing it, and ▶ Fire any trigger moment.
  - **One skill at a time:** ◀ ▶ steps through all 69 skills.
  - **Custom triggers:** the Test Card has the card editor's own trigger rows. Cloning a card brings its triggers along, editable.
- **Skirmish editor, gallery pickers:**
  - "Enemy deck" is now just **Deck**, with an **Open card gallery** button: card tiles, search, an All/In this deck switch, tap to add a copy, − to remove one;
  - **Castle** opens a castle gallery;
  - **Leaders** has a "How many" setting (0–5) with one slot per leader. Tap a slot to pick from the card gallery.
- **One field style everywhere:** text boxes, dropdowns and checkboxes use the game's warm dark surface (no more pale blue browser fields), with a matching focus ring and custom checkboxes. Opt anything else in with the `bw-field` class.
- **Floating tab bar:** the buttons are pills, matching the bar.
- **Caged Fight (new, Arena → Challenges):**
  - your leader starts caged on the enemy board, 4 columns to the right, greyed under a translucent cage;
  - cage level = round((your deck level + enemy deck level) / 100), 0–10; cage HP is 5 at level 0, 6 at 1, then +2 a level, 25 at level 10;
  - break the cage to free your leader beside it. Until then, the leader can't be summoned;
  - vs Computer, or Pass & Play where both leaders are caged.
- **Opponent cards** have a faint red fade along their top edge (green on your own caged leader), so ownership is clear after Mind Control.
- **Victory no longer pushes cards right:** the board grid kept shrinking when the "+" targets vanished. Both rows now share one grid that never shrinks mid-match.
- **Skirmish editor (C2):** the battle type is set only inside Edit skirmish, and a saved choice no longer reverts.
- **Codex:**
  - locked or unseen cards stay hidden until you've seen them (in hand, on a board, or as a reward);
  - one "Your journey" list until you beat the first 20 maps, then themed sections (The Wildwood, The Far Reaches, The Old Powers, The Edge of the Map).
- **Card text scales with the card:** a card shown 2.5× larger has 2.5× larger text, wrapped the same.
- **Card levels codified:**
  - tutorial and starter cards start at level 0, everything else at 1;
  - major stat steps at 1, 3, 6 and 9, a minor one at 10.
- **Darkness** shows only if your deck has a Devilry card, as "★ held · ⛧ left".
- **Balance tab:** "Too weak" lists the weakest first, and the table header is readable.
- **Docs:** the archetypes note was rewritten (Swarm and Tide are keyword families, not archetypes), plus a starter-decks list, card levels, and Hearthstone inspiration.
- **Phone fixes (from your screenshots):**
  - Conquest scrolls on phones, and the fight panel scrolls too, with Fight pinned at the top. The chosen fight scrolls into view above the panel.
  - The tab bar no longer covers the trail.
  - Long-pressing a card no longer selects it or opens Save to Photos.
  - Hand cards' cost and Wait badges no longer collide (one icon plus a number from 3 up).
  - Crowded boards keep both Attack and Health readable, and status chips (🩸8) no longer cover the card.
  - "New fight" tokens stack instead of overlapping.
  - Toasts appear at the top, away from Pass turn.
  - The Nest's tip text isn't cut off on the left.
  - A drop highlight no longer gets stuck on your row.
- **UI:**
  - the victory screen puts Cards won and Rewards in two centred halves;
  - the map's house button is centred;
  - the card detail uses the game's dark theme instead of washed-out grey.
- **Rules:**
  - Heal removes Bleed counters first.
  - Stun is counters, and a stunned unit skips its whole turn, upkeep included.
  - Waiting units don't bleed from their own actions.
  - Cleanse N (curses first) has a proper cleansing animation.
- **Devilry:**
  - Dark Summon ⛧ (1 a turn, on top of your normal play, costs Darkness ★);
  - Darkness from perished units;
  - the keywords Devour, Ritual, Pitchfork, Sacrifice, Offering, Beware, Scare and Desecrate;
  - Imp 😈 and Devil 👹 card types with a dark aura on the frame;
  - Mind Control and Player Stun;
  - **ten new cards:** Cinder Imp (Base) and nine Basalt Foundry rewards, including The Sixfold.
- **Arena rules:** the Arena's rule set rotates daily (Long Night, Midsummer, Dusk Start, Timber Fair, Frost Week, Fog on the Moor, Standard), and whoever plays second opens with an extra card. Conquest fights can set their own rules.
- Reach (ignores Flying's dodge) is in the card editor.

## 2026-10-09 (night)
- **Second card-balance pass:**
  - 29 common and uncommon outliers moved half-way toward their rarity band: e.g. Dune Jackal 3 Attack, Jackrabbit Sprinter 3 Attack, Soldier Ant 2 Attack, Shepherd's Bark 14 Health, Rabbit Kit 3/2, Peak Condor 4 Attack.
  - Cards in band: 155 → 171 of 294.
  - Every map was retuned for it; seven fights needed card swaps, and Hedgerow Scouts kept its rabbits and foxes.
- **Found:** the hummingbird starter deck beats the otter starter deck ~99% of the time in simulation. Fixes are measured; it's your call (B6).
- New skill **Reach** (attacks ignore Flying's dodge), ready for the B6 fix; no card has it yet.
- **The Removal Zone comes alive:**
  - Every card sent there gives its owner 1 Echo 🕯️, shown on the deck badge.
  - **Remember N** cards come back from it once you have N Echoes.
  - Three new cards: **Echo Keeper** (Base), **Marsh Wisp** and **Bog Revenant** (Sable Swampmire rewards). Two swamp fights now use them.
- **Forgotten Ones 🕯️:**
  - A Remembered card now returns +1/+1 for every Echo it spent.
  - A new Swampmire boss reward, **The Unremembered** (Remember 3).
  - Marsh Wisp is now 2/4 and Bog Revenant 4/7: weaker alone, strong with Echo Keepers.
- **The Thistle Baron** (Thistle Fields boss) is beatable: ~23% → ~32%. Its Jackrabbit Sprinters were swapped for a Field Mouse and a Sapper.
- **Fights that were far too hard are fixed:**
  - The tuner wanted castle HP below the minimum, so these had been skipped.
  - Map 1's boss went from ~5% to ~43% for a new player's likely deck; the Grotto stash, the Roost and three cave skirmishes, the Condor Sovereign (10-9) and others were also fixed.
  - The main cause was Raccoon Nightcrew (7 Attack, Nocturnal). It was swapped out where it doesn't belong.
- **Tide, the second archetype:**
  - From round 2 the water alternates 🌊 Flow and 🐚 Ebb every round.
  - Tide units hit +1 on Flow and take 1 less per hit on Ebb.
  - Wash units push the enemy card facing them back 1 Wait on Flow (once per card).
  - 18 reef and beach cards are Tide. Seven were trimmed back into their rarity band: Dolphin Knight 3/4, Tide Spirit 2/5, Riptide Eel 7/5, Coral Current Eel 3/6, Pufferfish Bulwark 2 Attack, Hermit Crab 1/6, Cuttlefish 3/10.
  - Pebble Beach, Sunken Hollow, Coral Current, the Grotto and two Cinder Wastes fights were retuned.
- The balance tool can measure just a few cards (`--only=`); the map retuner respects castle-HP floors and swaps cards when it hits one.

## 2026-10-09 (evening)
- **Day and night:** fights alternate Day and Night every 3 rounds; at dawn both sides draw a card. 23 Nocturnal cards (owls, bats, raccoons…) hit +1 at night; 19 Diurnal cards (hummingbirds, bees, eagles…) hit +1 by day. Not in the tutorial or live ranked.
- **Field cards:** Blizzard, Heatwave, Spring Rain, Thick Fog and Full Moon. They are free, take no play, draw a card, and change the field for 3–4 rounds (one a turn). The Tundra's Frozen Ground comes back when a played field ends.
- **Lumber and draws from cards:** Beaver Lumberjack (+2 Lumber when played), Courier Pigeon (draw a card). The experimental Lumber trickle is gone.
- **Map editor:** drag the Armoury, Nest, Notices, the well and the caves; they publish with the layout.
- Every map retuned for the new rules.
- **Enemies play their big cards:** 31 enemy decks with 3+ cost cards now carry their map's Lumber maker, and were retuned.
- Bosses keep their namesake card again (the Glacial Ape-King, the Orca Vanguard King, Titan's Shadow, the Cave Warlord). The Tundra boss has a proper Tundra deck.
- Each field has its own look on the board: rain, fog, heat shimmer, moonlight.

## 2026-10-09
- Two new maps between the Outskirts and Sunken Hollow: **Thistle Fields** 🌼 (meadow critters) and **Pebble Beach** 🏖️ (crabs, gulls, pelicans). Map 1 and 2 progress stays open.
- First sub-map: a sea cave on Pebble Beach opens **Smugglers' Grotto** after Gull Gang. You zoom into the cave mouth; inside are the first elites and rarer rewards (Uncommon and Rare eels, an octopus).
- The Arena and the Shop now open on maps 2 and 3 (Thistle Fields and Pebble Beach), so they arrive at the same point as before.
- The first Nest egg drops on the 4th map (now Sunken Hollow).
- **Promotion:** in the Forge, a Worker Ant at Lv 3 can become an Ant Warrior (new), a Forager Ant or a Soldier Ant. Your decks get the new card; the ant goes back to Lv 0.
- Your Hero's rarity climbs with its level: Common, then Uncommon at 5 and so on up to Legendary at 90.
- A new opening screen: a slim panel on the left, the scene bright on the right with a fan of real cards, a letter-drop title with a gold sheen, and drifting tips.
- Archetype design sheet: 10 archetypes and the Elder / Outer / Forgotten Ones trio. It's in the hub's new 📐 Design tab, with the skills, balance, card-stage and grab-bag audits.
- No sideways scrollbar flash during page turns.
- Raid ghost decks stay full even when many cards are one-copy (Unique, Legendary).
- **The CPU saves Lumber** for costly cards. Before, enemies almost never played them.
- **Card balance:** every card is measured by simulated matches. See the hub's ⚖️ Balance tab and the report in 📐 Design. Ant Warrior was trimmed to 3/3.
- **Skirmish editor:** simulate against a new player's likely deck; Auto-tune Armour to the fight's target; a whole-map difficulty strip. Thistle Fields, Pebble Beach and the Grotto were retuned with these tools.
- The hub opens on a short 🎯 Action items list; the long Master doc is retired.
- **Every card has a rarity** (from measured strength, capped at Rare for now). 39 outliers moved half-way toward balance: Feral Tomcat 3/3, Honey Badger Fury 3 Attack, Raccoon Nightcrew 7 Attack, and so on.
- **Every map retuned** against a new player's likely deck: 85 of 96 fights changed. Old 0% walls (e.g. Savanna Reaches elites, the late bosses) and 100% pushovers are gone.
- **Big cards act on arrival:** dragons breathe 4 damage on every enemy; big brutes hit the enemy opposite for twice their cost; Elder Willow, Elderhorn Monarch and Riverworks Bastion refund 2 Lumber; Glacier Yak, Elder Tortoise, Voltaic Eel and the Carcass delay the enemy opposite.
- **New archetype: Swarm.** Ants and bees deal +1 damage for every 3 other Swarm allies on their side. Hive Mind (Worker Ant, Honey Bee, Forager Ant): when one dies, your newest Swarm ally gains +1/+1.
- **Experimental Lumber trickle** (Settings, off by default): +1 Lumber every 2 or 3 rounds for both sides. Live ranked matches and the tutorial stay on the standard rules.
- Sunken Hollow and Quill Line retuned with themed cards from later maps (orcas and humpbacks in the Hollow).
- **Fixed:** the game failed to load from 09:10 to 10:12 (a broken line in the main script). A syntax check now runs before every release.

## 2026-10-08 (late)
- Skirmish nodes: green when cleared (no tick), with a sheen.
- The card viewer is "Inspect"; only admins pick foils there.
- 11 critters and a Guppy join the card list.
- A small cave in Sunken Hollow to chat with; the 4th visit gives the Tiny Cave Dweller.
- Critical HP colour stays at 0 HP; attack turns pink when it's below 25% of printed.
- Skirmish Armour (a blue bar) replaces castle HP in skirmishes. Skirmishes can have a castle and optional CPU leaders, which the CPU may summon.
- Armour shows as 🛡 pips.
- Bites crunch, with the back teeth closing a beat later.
- **Packs v3:**
  - packs glow with a hint of their best card; rare jackpot packs;
  - sparks on rare pulls; a rarity banner;
  - auto-advance, a collection tray and a sticky footer;
  - 10 or more packs lay out on a table to slash at once into one pile;
  - packs no longer give Dust;
  - the Golden case gives Krooni 👑.
- Admins can set their own currencies.
- The Nest Nurse (Unique+ or the Wandering Traveller); eggs hatch into a random card.
- Page-turn transitions between screens.
- The Wandering Traveller is everyone's default leader.
- Energy climbs by map: 1 then 2 on map 1, 2 then 3 on map 2, 4 on map 3, then 5, 6, 7… Bosses cost double; "Full" at max.
- Header controls are all the same height; tips drift slowly and fade out with a zoom.
- The skirmish editor can make a new card and drop it straight into the deck.

## 2026-10-08
- A reward reveal after a win: cards shine into view with NEW!, and new fights drop onto the board.
- Flying units keep flying through the fight and no longer jerk back after a hit.
- Skirmish panel: Fight on top, a big enemy deck level, rewards on the right. Starting enemies are Lv 0.
- Faster map-to-map transitions; simpler edge arrows.
- Esprit: +X/+Y whenever any ally is played.
- Admin tools only for admins.
- Winners are tossed into the air at the end of a fight instead of dancing forever.
- Damage numbers burst out with an icon (👊 for crits) and pop higher on enemy cards; gold sounds sparkly.
- Cards emote: 22 emoji moods in battle, including reactions to poison, freezing, stuns and kills.
- Fixed a landed card occasionally jumping into its slot.
- The victory toss finishes before the results appear.
- Foils: no more red line; Starlight sparkles are their own finish; a new Lattice foil to try.
- Effects Lab in tabs, with card sizes, damage numbers and weather.
- Cards lean as you drag them across the board and land at that angle; a card dropped nowhere flies back to your hand.
- Skill text starts with the keyword ("Bleed 2 — …").
- The results window fits on screen; after a fight only the board stays when you look at it.
- Skirmish rewards show what the first clear gives, with your rank beside them.
- The Forge has three benches: Upgrade, Refine (finer foils) and Enchant (Materia).
- Shiny cards fight as Shiny units, and so do the units they spawn.
- Decks save when you press Save.
- Sharper battle motion in Open fights; dragged cards fly back to your hand.
- A livelier front screen: dancing otters and a standoff.
- Pick your ★ main deck; decks can go over 20 while you build, and only a 20-card main deck can be played.
- Shiny is a colour shift of the art; set discounts are 5/6/7/7.5%.
- Pack editor (admin): odds, foil chance and finishes, and what's inside each pack. Foils from packs are real foil copies.
- Claw marks, bites, stings and pecks when units hit, each with its own sound; the first skin, Ember Chipmunk, breathes fire.
- Security headers and a weekly CodeQL scan.
- A glorious win screen; reward cards beside every skirmish's name; Fight again on cleared skirmishes.
- Skirmishes no longer collapse by default; Tundra fights are fought on Frozen Ground.
- Hits recoil, flyers fall with a burst of leaves, and lightning lights the cards from where it strikes.
- The map fills your screen and glides between regions; a well waits by the pond on the Outskirts.
- New Profile, an Achievements page, and Notices (quests) as a cork board.
- Shiny cards (1 in 200), pack set discounts, and Disenchant extras.
- Card names in every language.
- Opening a pack is an event now: tear the foil wrapper, then turn each card one at a time, with a rarity glow and a big NEW! for cards you've never had. Buy a set of 10–100 packs to skip or open them all at once.
- Codex → 🔍 View large: spin any card in the light. Also from the Nest (🔍) and from a pack's summary.
- Effects Lab: a card treatment centre with 10 foil finishes.
- Skirmish chains can be re-linked in the editor (all or any of the earlier skirmishes).
- Battles feel better: knock-outs fall with weight, flyers soar off the ground, and triggered abilities flash a rune.
- Victory! (or Hurrah!) and Defeat!; unlocked cards break their padlock, newly seen cards get a NEW! tag.
- Conquest: the map fills the screen with Home and Settings built in, weather covers it all, and it only rains about one hour in ten.
- A livelier Home with rotating tips; Codex stats on demand; a clearer deck preview with charts.
- Left a fight by accident? ▶ Rejoin from Home.

## 2026-10-07
- Cards flip out of your deck as you draw them; the winners parade with banners.
- The Codex and deck editor are much smoother (up to about 9× less work per frame); the page-change leaves are calmer and smoother.
- Click a deck's name to rename it.
- Fire creatures shimmer with heat haze.
- Your avatar walks the Conquest map; raid bosses visibly wind up over the lane they'll hit.
- Codex pages turn like a book; battles appear through a pixel dissolve. The first effects wish-list is complete.
- Settings → Effects (High / Medium / Low / None); idle battles use about half the work.
- Page-change leaves drift edge to edge on gentle waves.
- Profile shows your email and admin role; optional hobby and birthday, with a birthday gift.
- Skirmish and card editors: safer saves, validation, and typed values kept when adding rows.
- Card editor: a live card preview, art (path, upload or remove) and Revert to original.
- Bosses make an entrance; coins rain into your rewards; raindrops on cards in wet fights; the Conquest map follows the season.
- Skirmish editor: Gold and Dust rewards per skirmish. Card editor: rarely used sections tucked away.
- Every edit to a Conquest map in one list, with Revert all; the card editor keeps a History you can step back through.
- Autobattler: watch any fight round by round from its result screen.
- The tutorial can be won whichever side you pick (Otters lost about 9 in 10), and a loss can skip it. Tapping the slot plays your card; map details show on every screen size.
- Battle music: a quiet tune in your rival's style that builds as the fight heats up (Settings → Battle music). Wait ticks flip an hourglass; caves are lit by your lamp.

## 2026-10-06
- Master hub: the Master doc, changelog, Effects Lab, Visual Library and Claude's guide as tabs on one page.
- Arrow and Fire Arrow get a full bow-shot animation; crits get their own symbol.
- New card face: name at the top, cost and Wait as pips.
- Graveyard is its own pile; loading screen; a performance pass (about 42% less work per frame).
- Board ambience: castle cracks, low-Health tremble, idle breathing.
- Battle atmosphere: a red sky in sudden death, lightning and thunder on storm maps, a sparkle trail on dragged cards.
- Status touches: frost creeps over frozen units, Shock glitches, flyers shed feathers, tokens shatter.
- Match moments: decks riffle at the start, the leader arrives on a throne of light, water ripples under landing cards.
- Fixed the last known card snap (a landed card jumping sideways).

## 2026-10-05
- The world comes alive: per-place ambience, a live day/night clock, fights on the map's own terrain, versus openers.
- Places: the Armoury Tent (deck), the Traveller's Cart (shop), the Old Nest and the Forge.
- Hero card: build your own card up to level 100.
- 12 languages.
- Battle feel: lighting, shadows, hit-stop, shockwaves, a danger heartbeat.

## 2026-10-04
- Maps 1–4 retuned to a difficulty curve, with reward cards for first clears.
- Cards burn away or bleed out when they die; holo foil and gold rims for rare cards.

## 2026-10-03
- Social and competitive: friends, private invites, the Market, PvP tickets, ranked tiers.
- New modes: the Autobattler draft run and Raids (the Goliath trench).
- Guided tutorial, Conquest-first onboarding, dialogue with the lore cast.
- Player levels, deck levels, quests and medals; sudden death from turn 20.
- Painted maps, a world atlas, WebGL on the splash and maps; Shop packs with an opening animation.
- Accessibility: WCAG AA contrast in both themes.

## 2026-10-02
- PixelLab card art for the factions, the dragons and maps 1–4.
- Battle modes (Gravity, Open, Gladiator); hidden cards; a Hall of Fame.
- Sign-in with Google; admin card edits published live.

## 2026-10-01 and earlier
- Deck rarity limits; live in-match tooltips.
- First tracked build (28 Sep): the Bramblewood Arena auto-battler with Conquest, Codex, Nest and Forge, built up over design versions 17–30 since mid-September.
