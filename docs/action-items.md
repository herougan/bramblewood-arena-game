# Action items

## 10-23 17:34: building

From the owner's 10-23 17:34 answers and Claude's sweep of the easy defaults at his request (#7, package DC3). Quotes and meaning in `docs/decisions.json`. His other 17:34 notes (wind lines, Boomerang, Bleed, Swarm, deck UI, ...) are briefed separately.

| Decision | Package | Item |
|---|---|---|
| DF-1 | Later package (balance) | The budget's Map term back to 0.2 per map (`perMap` is 0.1 since BF6); a pack card's map is the first main-line map it appears on, never a submap (was: where its pack goes on sale). Change `cardObtainMap`, regenerate `canonical/card-obtain-maps.json`, re-fit the cards. |
| DF-2 | Later package (balance) | Base cards stop at Lv 4 and pay the full Forge cost; a fight's own first-clear card drops 10% a repeat. Count the grind to each tier's gate in the model (his note). |
| DF-3 | Later package (map effects) | Selfish boons: one per map from Map 5 (the 15 proposed), on every fight of the map, on at half the enemy deck sharing the theme; the Environment card shows the count. |
| DF-4 | With DF-3 | Retune Maps 7, 11 and 14 to the road targets in the same pass as DF-3's road retune. |
| RW3-2 | Later package (raids) | Notice rates: SS about once a month, SSS about once every 2-3 months for a full-clearing player (passive: first one after about 6-8 months); check the tickets' 40% cut doesn't stack. |
| TU2-3 | Small editor package | The tutorial brambles' Health in the editor is the value the tutorial fights use (9 and 11 stay until he edits them). |
| H1 | Later package (design + build) | Materia socketing: Unique rarity and above take one materia (gem) socket, never more; applying and removing both cost (placeholder prices, editable in the hub). |
| AR3-9 | Later package (UI) | Port the Group Dungeon to the main animated battle board. |
| A3 | Waiting on A1 | Trailer prompts are ready (`docs/art-style-prompts.md`, "Trailer (A3)"); generating the clips needs his keys, caps and an OK on the spend. |

Still waiting on the owner (9): FLY-1, DF-1b (his own play-through), AR3-6 ("apply it"), EQ-1, C1, G2, S3, A1, A2.

## 10-23 11:11: building

From the owner's 10-23 11:11 answers and Claude's sweep of the easy calls (package DC2). Quotes and meaning in `docs/decisions.json`. Order: FX4, then HUB2; BF11 is the coordinator's.

| Decision | Package | Item |
|---|---|---|
| UI4-3 | FX4 | Swap window: one row, your deck card on the left, up to 3 pack cards on the right; 0.8 s after Swap a "Swap Again" button; the right side moves on to select another card; the deck card swapped out leaves the choice. |
| FX3-1 | FX4 | Scorched Ground hits one unit, drawn as the ground boiling beneath it. The line of fire becomes its own field effect (fx in the master hub; find it a name): every unit takes 1 fire damage, one by one as the line passes. |
| FX3-2 | FX4 | A small gap between consecutive field-effect damage animations so both numbers read; the active field-effect card straightens, shines a little, and tilts back as the effect completes. |
| FX3-3 | FX4 | Lava Tide at 50% of its as-built strength; new equipment Lava Waders (boots that grant Fire Resistance). |
| EN-3 | FX4 | Bulwark's shields get Guardian. |
| EN-5 | FX4 | Backstab also triggers on a target still Waiting, Shocked or Exposed. |
| EB-1 | FX4 | The real deck after T-2 keeps one copy of each weak trainee card for variety; the Sparrow Chick leaves the starting cards (Gannet Cliffs onwards). |
| (note) | FX4 | Tutorial: the "To Map 0" button just says "Exit". |
| UI4-1 | HUB2 (after FX4) | Every upgrade and Forge cost (deck slot prices included; placeholders kept as built) is editable in the master hub. |
| EN-1 | BF11 | Trim the Magnate Duck's skills / numbers until it fits; the Muskrat Lodgekeeper keeps only Bulwark 1 and Tide. |
| EN-2 | BF11 | Bulwark priced 6 a point (was 8); re-fit the Ancient Sloth Titan. |
| EN-4 | BF11 | Thorns under 2 a point (Thorns 1 worth less than +1 Attack); Coffer Mimic Thorns 2; cap 2 becomes 2·(N/3)². |
| EB-3 | Later package (small UI) | The fight panel's deck tiles show the stats at the level the enemy fights at, not the printed ones. |
| BF10-1 | Later package (balance) | Evasive ×1.37 and Shadow ×1.1 in `canonical/skill-costs.json`, then a card re-fit. |
| EQ-1 | Waiting on the owner | How equipment is damaged or removed (design question; recommended: durability with acid / Corrode wear). |

Owner's own: he rebalances Maps 0-2 himself (EB-3).

## 10-23 owner answers: building

From the owner's 10-23 00:10 answers (numbers are his list's). Packages: TU2, RW3, EN, SX, AR3. Details and quotes in `docs/decisions.json`. Live database writes (T3, S1, S2) wait for his "apply it"; S3 and S4 wait for a Chrome session with him.

| # | Decision | Package | Item |
|---|---|---|---|
| 1 | — | TU2 | Tutorial exit: a player who finished T-1/T-2 but is stuck in the tutorial-only map must have a way out; T-2 leads to an exit to Map 0. |
| 2 | — | TU2 | Admin: the tutorial Brambles' Health and rewards must be editable. |
| 15 | TU-1 | TU2 | Label the tutorial fights T-1 to T-5. |
| 74 | N1 | TU2 | The Nest lists only baby/egg cards and level-0 base cards, in two tabs (recruits); faction cards start at level 0. |
| 85 | E10 | TU2 | Prepare a card combining / converting page: its own feature page, not a subtab. Nothing designed yet. |
| 84 | E9 | TU2 | Retire Krooni 👑 for now. |
| 24 | AR-2 | TU2 | Hide both daily dungeons (the Undercroft and Murgle Mayhem) until they are balanced and their special reward is decided; keep the defaults in the notes. |
| 41 | RK1 | TU2 | The Raid Ticket in the Shop becomes the Bonus Raid Ticket (300 Maple Leaves) with a different outline. |
| 5 | GD2-3 | RW3 (built 10-23) | Move a pack card to a skirmish as the exclusive first-clear card on Maps 4, 6, 11, 12, 18, 20, 21. |
| 6 | GD2-4 | RW3 (built 10-23) | Every skirmish pays that season's pack, a faction pack, a skirmish-exclusive card or a card of that season's pack. |
| 19 | RW2-3 | RW3 (built 10-23) | Card drop is about 1% per Energy spent; elites and above +1/2/3/4%; ticketed dungeons keep their higher rates. |
| 53 | DV4 | RW3 (built 10-23) | No map or rarity gate on pack output: packs are completely random, nothing changes their output. |
| 69 | C1 | RW3 (built 10-23) | Evaluate the pack foil chances; they should be rare (C1 itself stays open, "later"). |
| 42 | RK2 | RW3 (built 10-23) | The Bonus Raid Ticket is for sale only when the shop randomly has it, and it sells out after one purchase. |
| 44 | RK4 | RW3 (built 10-23) | SS / SSS raid notices about once a month or two; S notices 0.5-0.7 a week. |
| 68 | E2 | RW3 (built 10-23) | Disenchant values 5/10/25/45/65/100/150/250/400/700/1200/2000+ in rarity order (check the rarity list and the "etc."). |
| 86 | E11 | RW3 (built 10-23) | The Nest Nurse makes eggs hatch faster; no Shiny-chance bonus. |
| 25 | — | RW3 (built 10-23) | Forge: go back to card-based upgrades (the owner changed it to card_name-based; everything else is per card). |
| 23 | AR-1 | RW3 (built 10-23) | Standard PvP and Collection PvP draw from different pools; PvP keeps the foil treatments. |
| 8 | GD2-6 | RW3 (built 10-23) | How a player can own an Easter egg: giveaways, or a supremely low chance in mystery packs. |
| 31 | TR-4 | EN | Remove King from the four non-Kings; only the Magnate Duck is a King (balance it, not 1/1). New skill Liege {...}: active only while the King is on your side, worth 0.3x its braces, default Assault N with N=2. |
| 32 | TR-5 | EN | Price Liege at 0.3x its braces; the other prices stay. |
| 33 | TR-6 | EN | Remove the Enraged condition; Rage keeps its definition; "Rage {...}" = Rage's usual effects plus the braces, costed by logic. |
| 34 | EV-1 | EN | The Terraumbra is the Evomax equipment. |
| 36 | EV-3 | EN | Evolute type is shared only with the card under it; once evolved over, the card below is not referenced. |
| 37 | EV-4 | EN | An evolute with Wait also takes on the base's remaining Wait. |
| 38 | EV-5 | EN | Evolute, Alpha and Omega all cost 3. |
| 39 | EV-6 | EN | Baby-like cards get Fodder (the only non-Evomax cards that do), only at level 1; baby-like cards start at level 0. |
| 12 | FX2-1 | EN | The volcano restarts at very low after each eruption. |
| 90 | D24 | EN | Arena second player: no extra card; +1 Shield on its Bramble only. |
| 92 | FOG1 | EN | Fog applies to both sides: the CPU also cannot target what it cannot reach. |
| 88 | D21 | EN | Backstab triggers on a target with a status that weakens it in combat, or when the attacker has a skill that strengthens it (blind against evade, for example). |
| 7 | GD2-5 | EN | Name the shape "adjacent including diagonals" (Dynamite): suggested "Surrounding". |
| 4 | GD2-1 | EN | Rename Spellshield to Spell Ward. |
| 95 | — | SX (built 10-23) | Damage affected by its target (armor, for one) gets its own sound effect (an armor "ting"); if the source has an sfx, play it and the target-effect sound too. |
| 11 | DN2-4 | SX (built 10-23) | Element colour shift +12 degrees, with poison less blue and a little brighter. |
| 66 | H2 | SX (built 10-23) | Hero XP bar: Battle XP, Materia XP, and a third section that takes either; Battle XP there is 25% less efficient. |
| 26 | AR-3 | AR3 (built 10-23) | The co-op group dungeon: a big pass, launched as one package. Built: the Hollow Warren, 2-4 players (online 2 until AR3-6 is applied), CPU allies, calls AR3-1..AR3-9. |
| 48 | RP3 | RW3 (built 10-23) | Quarry Mole moves to 8-1 (its first-clear card; out of Base and off T-1). |
| 64 | I2 | SX (built 10-23) | Number-aware translation templates: numbered data texts are TX templates, the packs hold one row per template, numbers in the language's own format. |
| 60 | D17 | (owner files) | Music: only 2-3 tracks are usable; better tracks are needed, and they need CC0 files from the owner. |
| 71 | G2 | (a later hub package) | Move the still-relevant .md files into the master hub (the owner dislikes many disparate files); G2's detail now lives in its decision item. |
| 8 | GD2-6 | RW3 (built 10-23) | Easter-egg sources: giveaways; a supremely low chance in mystery packs. |
| 49 | RP4 | Owner later | The two factions should end symmetric; the owner balances the Hummingbirds himself later. |
| 24 | AR-2 | TU2 (note) | Note for the notes file: both daily dungeons are hidden because they need balancing and their special reward is undecided. |

## 10-22 owner notes (09:46, 09:52)

| ID | Batch | Item |
|---|---|---|
| N22-2 | Content (package SK) | Skirmish decks hold 5–7 different cards; 7 is rare (6 cronies and 1 bigger unit, the leader). From Map 2 on, every skirmish has a leader: its highlighted (showcase) card, also summoned from reserve so it comes out often. Players aren't told. Now: 16 skirmishes have 4 cards, 14 have 7, none has a leader. ✅ **Built by SK (10-22):** all 149 skirmishes (main maps and side maps) hold 5–7 different cards (47 five, 94 six, 8 seven); `skirmishLeadersOf` makes the showcase card the leader from Map 2 (134 fights); calls SK-2 and SK-3 in `docs/decisions.json`. Not touched: the Tutorial lessons T-2/T-3, the endless floors. Check: `node tools/skirmish_sizes_2026_10_22.js check`. |
| N22-3 | Content (package SK) | Sergeant Bramblefox: a Heroic map leader paid on Map 0 (0-4), outside the rarity ladder. Lower its rarity and move it to another map, as that map's reward and in its skirmish. ✅ **Built by SK (10-22):** Rare, 3/10, the leader of 13-2 Fox Run (Map 13) and paid there; call SK-1 in `docs/decisions.json`. |
| N22-4 | Rewards (package RW) | First-clear rewards: resources need only the clear. Card rewards need at least B, or S when the card is Rare or above; elites at least SS. Every 20 maps the ranks step up by one (Maps 20–39: A, SS for Rare+; 40+: S, SSS for Rare+), capped at SSS. The same gates apply to random card drops. Replaces the 10-16 rule (none on Maps 0–5, B from 6, A from 21). ✅ **Built by RW (10-22):** `cardRewardRankFor(map, node, cardId)` is per card (a Common and a Rare in one fight show different emblems; a per-card ledger lets a later better win claim the rest); bosses count as elites (call RW-1); `rollCardDrop` only lands a drop that meets the gate. |
| N22-5 | Rewards (package RW) | Skirmishes with no pack or card reward drop a pack card instead: Commons from Map 0, Uncommons from Map 10, Rares (rarely) from Map 30. 50% it is the fight's own card, else another card of the same rarity from that card's pack. The drop rate is 30% lower than today's 10%. Off-rarity: 5% one rank down, 5% one rank up, and a second 5% roll for two up. ✅ **Built by RW (10-22):** 7% a win, rarity by map (calls RW-2, RW-3: other fights keep the old drop, now rank-gated). |
| N22-6 | UI (package RW) | Fights show their small drop chances on one line (`Possible drops: 🥚 2% · 🃏 7%` plus the rank emblem). Ranks are always the hex emblem, never "rank B" (now in docs/workflows/ui.md). ✅ **Built by RW (10-22):** the drop line on the fight panel; the emblem replaces the rank words in the results chip, the loss headline, the Dragon Scale trail and the tooltips (the raid-rank badges, "Raid rank A", and the admin editors still use words). |
| N22-7 | Future | Mystery enemies: art clouded except the centre, name "?", skills discovered slowly over time (the "?" skill hiding is the base). |
| N22-8 | Done | The Quarry Mole is no longer a starting reward (owner: good, its effects were too advanced for the start). |
| N22-9 | Balance (package BF7) | Pass III applied: the half-miss ×1.5 on Attack and Health only, Fragile ×0.7 on both caps, the multiplier-priced skills at 0, On Attack / Add Wait / Twin Strike / Octolash cut to their measured worth, Bounty kept at 3; your 5 live edits of 10-21 folded in; 124 cards re-fitted. ✅ **Built by BF7 (10-22, not pushed yet):** no-fit cards 130 → 108; their cheapest fixes in docs/balance/hand-pass-2026-10-22.md (call BF7-5); calls BF7-1 to BF7-4 in `docs/decisions.json`. |
| N22-10 | Balance (future) | Skill-worth test setups: randomise the test units' Lumber cost and Wait (owner on Bounty: "maybe in your testing, you don't use many lumber costed units"), so Lumber- and Wait-sensitive skills (Bounty, Add Wait, On Ready Gold ...) are measured on the cards that carry them. Not built; re-measure Bounty with it. |
| N22-11 | Rewards (package RW2) | Answers to RW-1..3 and the raid drops (12:13): ranks capped at S, SS only for challenge cards (a few high-rarity non-pack elite rewards); skirmish drops 80/20 on Maps 10–29; one pack-card drop for every fight, scaled by Energy; raid fight drops ~1% survive, >10% kill, ≤25% S+ kill. ✅ **Built by RW2 (10-22, not pushed yet):** cap S; six challenge cards (Heron Hag, Echo Matriarch, Pride Queen, Yeti Chieftain, Triumphvirate, Iron Warden); drops 7% per Energy tier capped at 25%; raid 1 / 12 / 25%. Calls RW2-1 to RW2-4. |
| N22-12 | Rules (package GD) | Owner 14:12: "Future raids, you probably want tanky guardians - the enemy's single targets can actually hit the guardians instead if they were aiming for an adjacent unit (front/back or left/right)." Tanky guardian units in raids: an enemy single-target attack aimed at a unit next to a guardian (front/back or left/right) hits the guardian instead. **Part of it exists:** the 🦺 Guardian skill (`redirectToGuardian` in the engine) already turns a unit's swing onto a Guardian beside its target, but left/right only, in the same row (the front row, or a raid's middle / back row since TS). Missing: front/back (a Guardian in the row in front of or behind the target, same column); the raid boss's own attacks (all AOE today: the smacks and the Tail Sweep, so there is no single-target boss attack to turn yet); tanky guardian cards for the raiders. ✅ **Built by GD (10-22, not pushed yet; owner 18:20: "Guardian now blocks for all adjacent allies in the 4 cardinal directions"):** a Guardian takes the single-target hits aimed at the ally to its left, right, in front of or behind it (same column, the next row toward / away from the enemy; front / behind only on the raid board, where every row fights). Order when several could: left, right, in front, behind. Never itself; area hits aren't redirected. Still open: a single-target boss attack and tanky guardian raider cards. |
| N22-13 | Rules (package FX2) | Owner 14:12, FX-1..3. ✅ **Built by FX2 (10-22, not pushed yet):** damage is exact until the one apply step, rounded once, half up; Landslide 1 in 4 for 3; the volcano's Lava Tide, Eruption, comets and Scorched Ground 1 each; the Tentacles' smack 1, the Tail Sweep 2, the Core's smack 1–2; the classic trench uses the same numbers. Calls FX2-1 to FX2-3. |

## 10-21 owner notes: queued (run as batches after the workflow audit)

| ID | Batch | Item |
|---|---|---|
| N21-1 | Content | Diegesis pass, starting with the beach: it should feel like a beach (about 30% is the art). Add a Starfish. |
| N21-2 | Content + balance | Maps 0–5 enemies start very cute; Map 5 begins slightly more imposing creatures. The Shark is too strong for its current spot: move it later. |
| N21-3 | UI | The view-type button (Album, Compressed, Full art) stays visible whatever the filter toggle shows. |
| N21-4 | UI | Album is the default view. |
| N21-5 | Engine | Diving "exposes" a flier: no 50% miss advantage while diving. Dive itself still needs a definition (BX: eligibility only; options in `docs/ramming-proposal-2026-10-21.md`). |
| N21-6 | UI + engine | Shield bars: each shield rank fills in turn with ease-in-out; the next rank starts when the one below is half full. Smaller ranks fill faster and are slightly more transparent, with uneven transparency up to 12%. Applies to the raid and to monsters with shields. |
| N21-7 | Engine + UI | Bonus HP and temp HP for monsters, each in its own bar colour. Example: Crepuscular gives +1 attack by day and +2 temp HP at night. |
| N21-8 | UI | Skill codex: lay skills out more freely (left and right, not one column), and show which skills counter each skill. |
| T21-1 | UI (owner call) | Phone raid VS screen (390×844): the sticky Start button covers the bottom of the boss art since MX's Shield line. Options: tighten the VS layout, or move the Shield line (tests/nv-2026-10-19.js B2 fails until then). |
| T21-2 | Balance (BF5) | Pale Desert 18-A-5 wins 80% (band 61–77%) since BX made the Stonedrop Vulture an Archer 3. Trench core and guild-skills baselines drifted (43% overwhelmed). |
| T21-3 | Docs | decisions.json's 10-18 rule still places the Pall Wraith in the Eye of the Volcano; RP moved it to 20-5. Confirm RP's move. |
| T21-4 | Tests | tests/card-pass-2026-10-19.js check 1 still pins the v3 budget and the pre-BF6 owner-call list; it now fails on the BF6-flagged cards (B14). Update it to read docs/balance/bf6-bucket-2026-10-21.json once B14 is decided. tests/shield-call.js is stale since Shield Call was retired. |
| N21-10 | Engine (package EV) | Evolute archetype for Evomax: built 10-21 (not pushed yet): Evolute / Alpha / Omega, Stem, Chrysalis, the stack, the CPU, legal-base highlighting, three lines. Owner calls EV-1 to EV-7; cards to make in docs/evolute-design-2026-10-21.md. |
| N21-11 | Engine (package TR) | Titles, transforms and the Crown: built 10-21 (not pushed yet): Gilded, Championed, Veteran, Enraged, Matured; King, Kingly, Tribute, Gold in the fight, the Crown's drop / liege / steal (Usurper) / fade, King Slayer vs Royalty and the crowned unit; HB2-1's two-skill count with 69 cut skills back. Owner calls TR-1 to TR-6. Spec: docs/titles-transforms-2026-10-21.md. Parasite noted, not built. |
| N21-12 | Balance | Structures have no attack (owner 18:52): done 10-21 (package TR, not pushed yet): the 7 structures' Health re-fitted by formula at Attack 0: Webspire Sentinel 19, Elder Willow 39, Riverworks Bastion 29, Vampire Roost 24, Thornwood Palisade 16, Iron Warden 32, War Elephant 28. |
| T21-5 | Tests | After UI3, EV and TR (no test runs, per the owner): card-matrix golden needs a reviewed --update; checks that look for the removed card-detail lines (species, Wait N, the stat row in #cardPop) or an attack plate on 0-Attack cards will fail; hub/effects.html and tools/effects-lab/fixtures.json hold stale copies of the old bramble-tile markup; skill-worth has unmeasured new skills. One triage pass before the next release with tests. |
| N22-1 | Content process (owner 00:51) | Maps 21–40: another divvy pass like DV. **Maps 40+: build one map at a time**: the idea first, work it through, the owner confirms, then make it concrete, then create art. Use the map card-pool editor (package MP, canonical/map-pools.json) for each map's pool. |
| B21-3 | Balance (owner) | Skill costs: human pass I (259 owner edits) and Claude pass II (16 raises capped at their measurement) are applied, and 360 cards re-fitted. **124 cards have no legal line** under these prices; they keep their stats, flagged in docs/balance/human-pass-1-flagged-2026-10-21.json. Next is pass III (lower the skills that push them out) or accept the floors (`tools/refit_pass_2026_10_21.js <ids> apply --floor`). Also: Fragile is −8 as a skill and ×0.75 on N, a double count. Report: docs/balance/human-pass-1-2026-10-22.md. ✅ **10-22 (BF7):** pass III applied and Fragile fixed (N22-9); 108 cards still have no line (docs/balance/hand-pass-2026-10-22.md). |
| B21-1 | Balance (owner) | Pounce is priced 2.4 per step (Pounce 2 = 4.8), about twice the same effect built as a trigger (On Play 1 x 2 damage x 1.27 = 2.5). The owner may change it in the hub's Skill costs tab. |
| B21-2 | Balance (owner, done 10-22 for pass I) | The skill-cost edit flow: the owner edits the hub's Skill costs tab, then Claude pulls them (tools/hub/pull_skill_costs.md, tools/hub/apply_skill_costs.js), re-fits the affected cards by formula (tools/bf6_rederive_2026_10_21.js --only=) and deploys. Then the owner edits cards in the live editor; fold those server overrides into cards.json before the next balance pass. |
| C21-1 | Content (owner) | "Elemental" in the type tree catches 51 cards; plants/Ents, imps, shrine staff, Gale Sprite (wind) and the fire+ice salamanders stayed physical. Should plants get an element? |
| C21-2 | Content | Mirrorhide Mutant's flavour ("Now there are two of it") fits the old Twin, not Mimic. Swordbill Challenger's art: the prompt is in docs/art/new-cards-2026-10-21-briefs.md, not generated yet. |
| N21-9 | Workflow | Workflow audit: CLAUDE.md, docs/workflows/, tests/run.js, tools/merge/, tools/shot.py, docs/code-map.md (done 10-21, not pushed yet). |

## 10-19 morning: open calls (consolidated)

Done overnight and this morning: road curve, theme pass (96 pool cards placed), card pass, level curves, skill-worth measured and applied (owner-set values kept), the 4 SQL files applied, raid hub / respawn / instances / tickets / rewards / battle rating, Units by theme picker. Full test run: green.

| Area | Item | Question |
|---|---|---|
| Workflow | Units by theme (hub) | Pick units per map; then I run the post-balance step from your picks |
| Balance | Post-balance queue | 28 cards over budget v4 under the measured costs (docs/balance/post-balance-queue.json; 10-19 BF: Bone Diviner and the Dragon-Turtle left, Barnacle Fortress joined); refit in post-balance |
| Balance | Map bumps | Maps 8, 13, 20 sit off the linear climb (reference decks). Build decks against neighbours, move a strong reward later, or accept |
| Balance | Forge opens Map 11 | ANSWERED 10-19: keep it; players deck-build to win |
| Balance | Starters | Burrow Rabbit 85%, Crimson Wing Recruit 79% (band 20–48) |
| Balance | Sacrifice imps | Ash/Cinder Imp 94–97%, Puppeteer Imp 99% whatever stats: rethink Sacrifice |
| Balance | 27 cards out of band | Mostly 2+ Lumber (Lumber cut overshoots) |
| Balance | Dragons / Caldera Wyrm | Over budget, untouched |
| Balance | Arrow | Petal Fletcher 87.5% at 1/1: needs the cost change (now applied: re-measure in post-balance) |
| Raid | Raid cards crafted (RC) | 1.5% own-card drop per claim / won fight; faction-card chance 10/15/25%; rarity floors C/U/R |
| Raid | Trophy shards (RC) | 6/9/13 per claim (+4/+2/+1 by standing; half if it survives); recipe table in CHANGELOG; unseen cards can't be crafted |
| Server | raid_shards column | supabase/proposed/20261019_raid_shards.sql (cap +200 a save): apply? |
| Units | Variant names (UT) | 109 thematic names proposed (nameProposal in unit-themes); many Kelp Mangroves start with "Kelp" |
| Units | Proposed animals (UT) | 30 beings with no animal in the art (Ent owl, golems gorilla, Great Gate duck…); MissingNo bird vs cat art |
| Units | species vs animal | 11 cards disagree (Moray "Cnidarian", moles "Rodent", Tardigrade "Insect"): fix species? |
| Units | Tutorial Level 0 | Hummingbird side's tutorial cards also Level 0 (fairness): OK? |
| Easter eggs | Names | ANSWERED 10-22 07:42: names okay (Habanero Drakon, Kegfuse Panda, Nyoogle) |
| Easter eggs | Codex teaser | 8 "???" tiles visible from the start and counted, or hidden until seen? |
| Easter eggs | Condor "+5" | ANSWERED 10-22 07:42: okay, and it must animate turning and manoeuvring to fire the beam. BUILT 10-22 by package CB: centre rears and dips, side banks, edge swings round (Effects Lab, Built 10-21/22) |
| Easter eggs | Rarities | Drakon Rare, Panda Super Rare; Nyoogle tagged cat/mythic |
| Server | Deck sync migration (SY) | supabase/proposed/20261019_deck_sync.sql: looks + deleted_at columns, checks, stale-write guard. Optional: apply? |
| Server | Device-only data (SY) | Per-copy foil/Shiny/skins and Kibble, Food, Beer, Kroon, Laurels still don't sync. Sync next? |
| Server | Currency guard (SY) | guard_currency_write rejects a whole upload when one currency jumps past its limit: a device far ahead never syncs |
| Raid | Admin wins (NV) | An admin 👑 Win in a raid no longer counts (test only). Earlier admin wins pushed ~20,019 to the live Goliath pool: remove those rows? (needs your OK) |
| Raid | VS countdown (NV) | Raid VS screen waits 9 s before auto-start (normal fights 2.8 s): right length? |
| UI | Conquest fight opener (NV) | Separate screen, not redesigned yet |
| UI | Hold timing (MB2) | Touch-and-hold is 0.25 s in fights, 0.45 s elsewhere: same everywhere? |
| Raid | Small instances (RB) | 30-player floor relies on stand-ins (14%/day, my pick) and Core stumps 14 HP. Scale HP by participants instead? (needs last week's count) |
| Raid | Tier thresholds (RB) | Participant 1,000→500, Competent 10,000→2,000, Leading 50,000→12,500 (0.1% reach it; 7,500 gives ~5%) |
| Raid | Instance cap 250 (RB) | Republish the Goliath from the raid editor, or apply supabase/proposed/20261019_raid_cap_250.sql |
| Balance | Forge curve size (BF) | Gains are absolute budget points: small cards grow most (Otter Centurion 3/5 → 11/18 at Lv 10, mean +228%). Alternative: scale by budget use (~+90% at Lv 10 for all) |
| Balance | "Base" in N (BF) | Read as v3 N without the level term. If you meant v3's L1 N, every card's N rises ~2.1 |
| Balance | Nest Lv 0 → 1 (BF) | Most Base cards gain nothing at Lv 1 (gain arrives at Lv 2). Make Lv 1 a minor step? |
| Balance | 16-6 Reaver's Hollow (BF) | 74% vs 52–68% band at the 2× Shield cap: raise the cap or accept |
| Balance | Side maps ahead (BF) | aheadMaps = 1 on every side map; set 2 for Volcano Lair, the Eye? |
| UI | Centre slack (BU) | Keeping the centre column centred costs card size sometimes (75 → 69.5 px at 390) |
| UI | CPU fills centre (BU) | CPU now fills an empty centre first (follows the always-legal centre rule) |
| Raid | Mid/back-row refills (TS) | Units falling in middle/back rows die fully, but Revive / On Death: Spawn / Relic / Crystallise / Meiosis don't refill those slots. Should they? |
| Raid | Back-row attacker hooks (TS) | Mid/back rows now fire On Attack, Crit, Recoil, Reload, Twin Strike, Frenzy (same as normal attacks): small buff |
| Raid | Start-of-round in back rows (TS) | Regeneration, Renewal, On Round Start still front row only |
| UI | Small-card chips (TS) | Small cards show 2 chips then "+N" ("☠3 +2"); shrink to fit 3? "NEW!" tag covers chips for 4.5 s |
| Cards | Base vs faction pack (CX check) | 5 cards tagged Base are also in the Factions pack (tier 11): Shellwright Apprentice, Otter Royal Guard, Otter Flag-Bearer, Otter Lantern-Bearer, Riverbed Diver. Base = skirmish only: drop them from the pack, or untag Base? |
| UI | Codex on phones (CX) | 4×4 cards ~64 px under the global 80% width; full width would give ~80 px |
| UI | Codex controls (CX) | Phones: top-corner « ‹ › »; desktop: side tabs. One layout everywhere? |
| Balance | Trigger weights (DC) | Measured: On Enemy Spawn 0.5→2.26, On Move 0.5→1.7, On Exile 0.25→1.14, On Heal 2→2.73, On Ally Spawn 1→1.38, On Charge 1→1.62, On Sacrifice 0.5→0.29. Apply? |
| Balance | Two-skill costing (DC) | Cost two-skill cards with family multipliers (dot×dot 1.55, control×offense 1.29…; global 1.11)? |
| Balance | Removals (DC) | Exile, Mind Control, Tsunami only bounds (beat a sure kill): cost by hand? |
| Balance | Combo outliers (DC) | Freeze + Rage (+28.9), Evasive/Flying/Supreme + On Ready: Gold: watch any card printing them together |
| Raid | Bramble name (U3) | "Kraken's Reef" (alt: "The Drowned Maw"); placeholder SVG until painted art from docs/art/raid-bramble-art-brief.md |
| Raid | Last turns (U3) | "3/2 turns left", "Last turn!" under the tick in the final 3 turns, plus the existing banner |
| UI | Trench header (U3) | Still "Turn X / Y": make it "Turn X" too? |
| Raid | Raid BR weighting (RJ) | Boss BR counts elders at Epic × (1 + bonus/basic HP) and row copies at printed rarity: reads high vs what they do (a 5/4 Broodmother copy adds 21) |
| Balance | Caldera Wyrm (RJ) | 1.82× its N, no source. Option 1: 6/11 at Lv 6 with its 30 HP moved onto the 20-B-4 bramble; option 2: keep 6/41, list as non-player |
| Balance | Road gaps (BF3) | 43 fights off target with honest levers (docs/balance/road-gaps-2026-10-19.json): 20 too easy (future cheat fields: 21-6, 16-7, 2-B-2..4, 1-5, 1-A-5, 20-A-4, 18-A-7…), 23 too hard (Map 9 at Lv 2 before the Forge; 2-A-2, 2-A-5, 0-B-1, 0-B-2) |
| Balance | Shield overrides (BF3) | 26 fights above the Shield rule; back on the rule would drop on-target 150 → 147. Keep or remove? |
| Balance | Thorns (BF3) | Re-measured 3.23 per point (was 1), low confidence, likely a floor |
| Raid | Tail elder (BF3) | Retune made Orca Warlord the tail's elder (biggest card). Pin the Leviathan Elder per part? |
| Balance | Enemy stat changes (BF3, B10) | Flagged, not changed: endless floor perk (0 now), raid staged decks, raid elders (+1 Attack, HP multiplier, floor 55) |
| Server | Clear folded overrides (BF4) | APPLIED 10-19 20:45: 72 card rows reset to the file, map-nodes m1/mtut cleared; backup in card_overrides_backup_20261019 (RLS on) |
| Balance | Cave Bat Swarm (BF4) | Still over budget with its server skills (Darksight, Nocturnal, Fork): 1/1, or drop Darksight? |
| Balance | Road after fold (BF4) | 146/179 main on target (was 150): 0-2, 3-1, 8-3, 8-4, 20-8, 1-A-1 now too hard; 15-3, 0-3 too easy |
| Design | On Play share (owner 21:36, note only) | Owner may give 5%+ of units On Play effects himself |
| Design | 20 more skill ideas (owner 21:36) | Owner adding more ideas soon |
| Balance | Wait / Lumber values | Wait 3+ cards win −18 pts and Lumber 3+ −26.5 pts under their rarity band while using more of their budget: costs look under-rewarded. Raise perWait / perLumber after the halving pass? |
| UI | Codex types (UX) | Brambles chip opens the Brambles page (they aren't cards); the 5 field cards count as Spells; the 🔍 Inspect view still shows your best level |
| UI | Tutorial BR (UX) | Tutorial panel now shows the real rival deck BR (⚔ 10), which may look high |
| UI | Cobble over windows (UX) | Cobble's lines show over the Forge copies window and centre stage: should he wait? |
| Raid | Back-row attack share (RR) | Back rows hit for half Attack (ROW_SWING_SHARE 0.5, Claude's 10-17 choice, no owner rule). Full Attack (1.0) = "as if at the front", ~doubles back-row raid damage |
| Skills | SK2 calls | Milling still attacks; Fortification builds once on play (no Anchor yet); Pickpocket on the bramble overlaps Swipe; Repair range 1; Foraging alternative (shared Berry pool or +1/+1); Petrified Tree Stone under-costed; Petrified Tree animal proposed owl |
| Cards | EQ calls | Hazard spells shelved with all spells (SPELLS_SHELVED): unshelve? Armory as Weapon Master's structure; Crowbar from the Blacksmith? "Rockfall" vs "Collapse"; Rubble blocks movement too? Hazard/Weapon Master costs unmeasured (4 hazards cost 0 Lumber) |
| UI | Brambles "Yours to own" (UX2) | Counts 43 of 45 (all but raid brambles); split into Starter / Map reward / Drops? |
| Cards | New cards need sources | Petrified Tree, Crowbar, Armory, Frost Slick, Magma Vent, Bog Seep, Miasma, Rockfall (flagged awaitingSource) |
| Skills | SK3 names | Hunter shown as "Cull" (alt Finisher, Merciless); Broodkeeper (alt Nursery, Hatchery, Matriarch); Herald (alt Squire, Vassal, Banner-bearer); Spotter (alt Lookout, Beacon, Pathfinder); armor aura "Shieldwall" (Bulwark taken: rename old one Rampart?); spells Grave Call, Smoke Screen, Magnet |
| Skills | SK3 behaviour changes | Grave-Grin Hyena's Executioner now <25% HP (was <50%); Hunter default target now Weak (A≤2 and H≤4); CPU doesn't value new skills yet |
| Cards | Frames (CF) | Equipment = forged gunmetal normal frame; Devilry/Evomax = normal frame + accent; Terraumbra no longer pink. Equipment look is subtle on phones: stronger? |
| Raid | Tentacle on desktop (TF) | Fixed (reduced motion showed only a flash; slow frames skipped the slam). Column smack on wide desktop comes from the board top, leaning ≤16° toward the bramble |
| Raid | Shard income (MX) | Tickets cap a week at ~16 fights, so Leading gets ~60–80 shards a fall (not 100+). Want 1.5/fight or Leading ×6? Legendary (160) = 2–3 Leading falls |
| Raid | Smack columns (MX) | Column smacks weight columns by unit count; rows now 1 in 3 each. Uniform over occupied columns instead? |
| UI | Key badge at 0 (MX) | Kept showing a greyed "0"; hide it instead? |
| Rules | Pounce open lane | Hit the bramble when nothing faces it? |
| Rules | Detonate | 1-for-1 Poison is weak (measured ~0): ×2 or Detonate N? |
| Rules | Field Breaker | Everything that ticks each round, or weather only? |
| Rules | Frenzy + Freeze | Frozen mid-Frenzy loses the bonus attack: OK? |
| Rules | Quiet Contemplation | Is Expose exempt? Confirm what it leaves alone |
| Rules | Regeneration | Stop Bleed at full Health like other heals? |
| Raids | BR | Boss HP bonus dominates the boss BR (elders now 100→basic HP, BR follows) |
| Raids | Restart | A standing raid's restart pays the "survived" share: keep? |
| Raids | Auto | Unlock for raids completed before 10-19? |
| Raids | Leading participant | Proposed +40% everything + a guaranteed extra raid card |
| Dungeons | Keys | ~3–5 floors a day now; loss resets to floor 1. Keep, drop the reset, or more keys? |
| Economy | Strange Materia | Only 7 exist; Key ring competes with Forge tiers. New source? |
| Units | Variants | Dire / Elder / Ancient multipliers are a first draft (109 proposals in the hub) |
| Units | Thin sub-factions | The Gnawed has no cards; the Tidefolk has 3 |
| Art | NightCafe | Pall Wraith, Sandfish, Pale Oryx, Quicksand Queen, The Last Oasis, Giant Cave Huntsman (prompt in its notes), placed pool cards, GI example cards |
| Text | Translations | Tagalog, Tamil, Japanese, Korean want a native read |
| Server | Trust | Raid rows / tickets / Seeds are client-written; server rewards (supabase/proposed/20261017_*) still pending |
| Test Lab | Costs | The in-game Test Lab still uses the old skill costs: switch to the table? |
| Platform | Steam / Apple | Not yet |

## 10-18 evening: (superseded by the table above)



Answered and built today: everything in the 10-18 daytime and overnight tables below (your 15:05, 15:37, 15:56 and 17:28 answers). Still open:

| Item | Question |
|---|---|
| Frost Vanguard (0-4) | Skirmish pass took Map 0's boss from 70% to 35% for the starter deck. Revert so the first boss stays gentle? |
| 21-3 Cloud Ledge, 24-6 Gilded Guard | Still 100% / 98% wins; each needs a hand-picked attacker card |
| Endless floors | Only +4% stats a floor now. Add shield too, or a gentler step? Murgle King floor 10 is 0% for a Map 6 deck |
| Theme drift | Badger Berserker is in 9 more fights; Map 3 is full of Pelican Divers. Fine? |
| Dragons, Caldera Wyrm | Still over budget N. Fit them? |
| Bramblewood Macaque | 100% win rate; only fix found is 2/10 → 2/4 |
| 11 skills | Cards whose skill can't fit N at any stats; skills need a rethink (list in balance-pass-2026-10-18) |
| Strong reference deck | Rebuild it for the new card stats? |
| Item-granting bosses | Main-map bosses from Map 12 allow a 3rd item and give one kit item on first clear. Other bosses, or only the +1 use? |
| Dungeon Sweep | Sweeps your best floor, no key, pays clear-again Leaves/Dust only (no Long Burrow Gold Leaves). Use keys? Pay Gold Leaves? |
| Premium flag | `isPremiumPlayer()` reads profiles.premium or lifetime_spend_usd > 10; neither column exists yet. Server must set one once payments exist |
| Spire refund | Forfeits and draws refund Energy too, so scouting a new floor is free. OK? |
| Ads | docs/ads-considerations-2026-10-18.md: at all? which spot first? premium gets the ad rewards without watching? |
| Guild rename SQL | supabase/proposed/20261018_guild_rename.sql blocks A + B ("apply it"; B closes a join-as-owner hole), C optional |
| Rename Ticket | 250 price, cap 9, free renames until 2026-10-26? |
| Collection levels | Deck-prompt floor thresholds by Collection level (DECK_PROMPT_FLOORS) |
| Tutorial | Player at 8 HP: playtest |
| Crash kills | Should a Wave crash kill give Momentum? |
| Simulate vs new player | Follow the chosen difficulty? |
| Tentacle smacks | Row/column alternate; or 50/50? |
| Emoji atlas | Cell size OK? |
| Tide | Water heights and Pixel style look |
| Translations | it, pt, ko, id, tl, ta: screens are translated, but card flavour, skill text and long battle-log lines (~1,200) are still English. Run that as its own package? |
| Split sentences | 56 sentences reach the page split by inline tags and stay English until wrapped in TX() (`python3 tools/i18n_ui.py --split`). Do them next? |
| zh-Hant | Converted from zh-Hans with OpenCC, not translated separately. OK? |

## 10-18 daytime: answered

All items answered at 15:05 / 15:37 / 15:56 and built.

## Overnight 10-18: your calls

Built while you slept (two rounds): the Bleed / Poison / Cure / Awash rules, the balance pass (173 cards), three legendaries with creature ranks, the Scale Trail finale, Dragon / Supreme / Ghost looks, honest locks on uncharted maps, dead-code clean-up, Arena and Leylines scenes, boss banter, translations for every game text, the desktop build's offline fonts, icon and Steam stub; round 2: placeholder texts and card names translated, Steam achievements wired, dead drop-zone code removed. Details in the CHANGELOG.

| Item | Question |
|---|---|
| Wave and crashes | The Awash field now crashes (both units take N). Should the Wave skill crash too, or keep pushing / swapping? |
| Long burners (B4) | 77 cards costing 2+ Lumber stay at 22–37% whatever their stats; one Lumber less is the real lever (Voltaic Eel 3→1 went 30%→97.5%). Cut Lumber on some? |
| Great Gate | Over budget; fitting it (0/28) changes fights 23-7 and 24-1. Fit it? |
| The Sixfold | The budget doesn't count Ritual. Add a Ritual discount to the skill-cost table? |
| Dragon-Turtle | Placed in the Map 23 siege boss deck and reward for now. Or hold it for a future forest map (25+)? |
| Leviathan | Only drops from the Goliath raid. Also fight it in the raid (it would become the boss unit)? |
| Supreme | Give the Dragon-Turtle Supreme like the Leviathan? Give the Ashmantle Fiend the Supreme looks? |
| Supreme isn't a boss | Supreme units no longer get the "Boss · Defeated!" banner unless they are a real boss. OK? |
| Scale Trail reward | 8/8 gives the Red Dragon Egg (`SCALE_TRAIL_FINALE_REWARD`). Keep? Should an egg be allowed to lead (it's Legendary)? |
| Long Burrow | Still "Coming soon". Release: set `LONG_BURROW_RELEASED = true` (arena_app.js, just above the Long Burrow's map entry) |
| Uncharted unlocks | Nest 6/7 (Maps 25/30), Forge tiers 4/5 and card Levels 9/10 (Maps 26/31), Flea Market (31), dungeon slot 3 (40) now say "Unlocks beyond the charted maps". Suggested moves: Nest 6→22, Nest 7→24, Forge 4 / Level 9→22, Forge 5 / Level 10→24, Strange Materia→bosses of Maps 21 and 23 |
| Art | 119 cards (incl. the 3 new legendaries and all Map 22–24 bosses) have no art and show their emoji. Generate with your NightCafe credits (~0.75 each)? The new Arena scenes are code-drawn; repaint later? |
| Desktop | Steam App ID (100 USD), Apple Developer (99 USD/year) for Mac signing. 13 achievements are already wired (ids in platform-roadmap 10-18); they fire once Steam is on. Admin Mode never unlocks them. Set names in Steamworks |
| Translations | Every game text and all 647 card names now translate in the 12 languages (my drafts; Tagalog, Tamil, Japanese, Korean want a native read). Named cards: the descriptive part is translated (The Thistle Baron); keep such names in English instead? |


## Platform roadmap (10-17)

Your 21:32 ask (alt emoji, alt effects, security, Electron or Unity, royalty-free music) is answered in [`platform-roadmap-2026-10-17.md`](platform-roadmap-2026-10-17.md). In short:

| Topic | Recommendation |
|---|---|
| Emoji | Bundle Twemoji and Noto in the game (no more jsDelivr); add Fluent Flat (MIT); start a 32×32 pixel icon set behind `iconHTML()` with CC0 stand-ins. Avoid OpenMoji as a base (share-alike) |
| Effects | An "Effects style" setting (Classic / Pixel / Minimal) beside the level, with the Lab's B/C variants wired to it; auto-downgrade on slow frames; no PixiJS yet |
| Security | Four SQL drafts in `supabase/proposed/` (not applied). Found today: new currency rows aren't capped, the market doesn't check ownership or take payment, feedback can be flooded. Next: server-paid rewards and market, then fight replay |
| Desktop/mobile | Electron for Steam (proof of concept in `electron/`: `npm i && npm start`), Capacitor for phones later. Not Tauri (Steam overlay), not Unity (rewrite) |
| Music | Keep the generative music; add a Soundtrack option (per-biome tracks, crossfades, lazy loading). Shortlist of 12 CC0/CC-BY tracks and packs |

**Waiting on you:**
- "Apply it" for drafts a–d.
- The gain budgets in draft a.
- Market: does listing remove a copy?
- 💰 Supabase Pro (25 USD/month) for leaked-password protection.
- Stop serving `docs/`, `tools/` and `hub/` from the site at launch?
- 💰 Apple Developer (99 USD/year) when a Mac build is wanted.
- Pick 6–8 music tracks; optionally buy one pack (24.99 USD).

_Updated 2026-10-16, 07:00. Everything from your notes up to 04:58 today is built. Only the items below are still open; each one waits on you (a word, a pick, money or a live database write). Older "Done" sections follow for reference._

## 1. Still open

**Applied to the live database (10-16, your "Apply it"):** the feedback table, D55 `world_events`, T3 `fight_sessions` (server fight seeds), S1 `admin_list_players`, S2 anti-cheat tier 1 (rating is server-only; one write can add at most 2,000 Gold or Dust, 200 Gems, 50 Metal), and D76 `coop_rooms` (written today: friends-only rooms, join by code). The co-op game itself still has to be built on top of the table.

**Worth knowing about S2:** a single honest write that adds more than 2,000 Dust (say, breaking down a high-level card) would be refused, and the next load would bring back the server's lower number. Say if you want higher caps, or those refunds moved to the server.

**Your calls from the 10-16 afternoon batch:**

| Item | Question |
|---|---|
| Expose | Counters add up with every hit, so after its first hit every later hit on that unit crits (Narwhal Lancer 8 → 14 a swing). Keep, or cap at N? |
| Wind | The engine flipped the wind on a fixed beat; it now rolls each round (Windy 1 in 3 back / face / calm, Gale 1 in 2). Keep the random roll, or text only? |
| Swift, Crab Claws, Restless | No new card for these three, because you'd kept them off cards before. Want one each? |
| Amore | Pairs only your own units (an enemy pair would buff them). OK? |
| Enemy deck preview | Open on Maps 0–5, needs B from Map 6. Should it need A from Map 21 like card rewards? |
| Packs | First-clear packs have no rank gate. Should they? |
| Cataphract's On Ready 6 | Removed from the card file, and stripped as your published edit loads. To clean the stored row too, say "apply it" for `supabase/oneoff/2026-10-16_cataphract.sql` |
| Rename | Cataphract Destrier → "Gilded Roadwarden"? And an optional "come back later" roadside fight (in the changelog notes) |
| Dark Summon ⛧ badge | Removed from Devilry-framed cards with the archetype mark (the text still says it). Keep it off? |

**Your calls from the 10-16 / 10-17 evening batches:**

| Item | Question |
|---|---|
| Stomping Grounds filters | That page has no filter or card list, so the Armoury's card pool got the "keep filters" fix. Which page did you mean? |
| Death fall | The card still tips backwards on its bottom edge, now one smooth ease-in motion. Say if the direction itself should change |
| Voice lines default | "Leaders only", so most new Heroic+ barks stay quiet until set to On |
| Swamp Fever | Placed on Maps 5–6 by me (from the old proposal); you never placed it |
| Slippery | Set to 30% on 17-A-2 instead of 50% |
| Leaders with no home | Gannet Queen and Old Snapjaw as leader rewards for 3-7 / 5-7? The Triumvirate for the Map 20 final boss? |
| Map 19 volcano cycle | Ashen Spurn has the ash biome but not the 4-day/2-night cycle. Add it? |
| Perma-tide name | High Water (pick), Floodplain or Endless Flood |
| First Blood | Make it a Quick-hunter passive "Quickdraw N" instead of a field rule? |
| Chess monsters | Rook Beetle (3/6 Armor 1 Pierce 1) and Bishop Mantis (2/4 Fork + Backstab 1) for Map 12? |
| Reflect | Reworked to bounce shots (the old melee-reflect % is gone; Thorns/Spiteful cover melee) |
| Crab Claws | Hits the castle when nobody is left or right (was: straight ahead) |
| Nest prices | Nests #2–#7 at Maps 5/10/15/20/25/30, built for 150+40 … 4000+900 Maple+Dust (my numbers) |
| Daily dungeon keys | Key taken on start, given back on a win; a loss loses it and restarts the climb at floor 1 |

**Your picks:**

| Item | Where |
|---|---|
| Flora | The Flora sheet in the card plan workbook (12 plant cards for Maps 20+; renamed from Wild Veggies) |
| Card placement | `docs/card-placement-proposal-2026-10-15.md` / `.xlsx` and the Recommended sheet in `docs/skills-by-map-2026-10-15.xlsx`. The new skills, field effects and cards are built but on no maps until you choose |
| Skill N for the new skills | Fill "Your N" on the Skill N sheet for the 10-14 to 10-16 skills (Electricity, Keen Sense, Psychic, Bloodlust, the Bolts, Bulldoze and the rest) |
| Difficulty | Measured again 10-16 (40 games a fight): Maps 1–9 are fine for a mid deck; from Map 10 even the strong deck struggles (10-7 boss 30%, 14-8 boss 7.5%, 16-7 boss 10%; the Map 14 and 16 elites 7–27%). Map 0 got harder with the weaker starter deck. Say the word and I retune Map 0 and Maps 10–16 |

**Fixes to make in the card editor** (your published edits override the files, so these have to be re-saved from the editor):
- The 0-2 deck still lists the removed Bee Knight (classic).
- Earthworm has lost its Regen.
- Silver Minnow, Pond Trout and River Carp need Tide.
- Meadow Frog should be Rainrunner.
- The Wandering Traveller lost its Lumber trigger.

**Art:** Otter Shieldback and Armored Mastiff full-size art. Their good PixelLab versions aren't in the gallery I can see; send them if you have them. Optional: Tidewall Fort's castle art has "HOME BASE" lettering (a redo costs 0.75 NightCafe credits).

**Not checked:** the Noto emoji option loads from a CDN, and I haven't seen it on the live site.

## 2. Ideas kept for later

| Idea | Notes |
|---|---|
| Card backings | ✅ By card type (10-16): Unit, Structure, Castle and Field effect backs in `art/backings/`. Still open: faction backs as images (faction packs still use the CSS placeholders on their unit cards) |
| Evade to non-swimmers | ✅ Built to test (10-16): Admin → 🧪 Rule tests → 🌊 Tide evade, also in the Test Lab and the skirmish editor. Off for players |
| Journeys | Hidden for now (`JOURNEYS_HIDDEN`). While hidden nobody gets the subfaction cards, which only Journeys give |
| Spirits, amalgams, ethereal creatures (owner 10-23 20:44) | Non-combat ways to make cards for Pack 7+ (expensive, needs unique resources): star forges; spirits found like eggs, made corporeal; certain animals combined into amalgams, or turned ethereal by another mechanic. Ties to E10 (the combining/converting page). Design first, not built. |
| The rest | Pool of card and play ideas in `docs/design-notes-2026-10-14-ideas.md`; late game in `docs/design-2026-10-14-late-game.md` |

## Done at 2026-10-16 07:00 (all your notes from 10-14 10:45 to 10-16 04:58)

Each line is in the changelog under the time shown.

| Your note | What's in the game now |
|---|---|
| 08:28 "Planned, not built yet" | **All built** (10-14 23:30): 🔌 Electricity (Voltaic Eel, Voltwing, Static, Arc Bat), 👃 Keen Sense (moles), Hammerhead Shark, Ironback Gorilla (the sledgehammer bruiser, Bludgeon), Stat budget v2 (now "Max(A, B) against N", 10-15 03:15). 💭 Psychic N is defined and built too |
| 20:00 calls | Crab Claws is back and pinches a random side unit, straight ahead if neither (10-15 11:45). Toxin is a real skill (10-16 02:00). Every card has art (Rabid Jackal, Mirrorhide Mutant, Growth Sprout, Bog Leech, Rivergate Tribune included) |
| 21:06, 21:31, 21:33, 21:49 | Ideas note, art rules, castle art in deck previews, Dragon Egg and Scraper of Skies art, Colossal Squid and the baby cards (10-15 02:00) |
| 22:39, 22:40 | Regeneration without the zig-zag and none at full Health; the castle crumbles fully before Victory (10-15 02:45) |
| 22:50 | Faction cards start at Level 1; budget line Max(A, B) (10-15 03:15) |
| 22:59–23:52 | Fight ids, NPC lines, pills, field tooltips, speed, results panel, no Start screen, tutorial flow, packs, swaps, deck editor (10-15 05:30, details above) |
| 08:00 | Master hub dashboard, 🎴 Cards tab, search, 29 new skill effects (10-15 09:00) |
| 08:23, 08:58 | Balancing and map notes; eggs; Nest on Map 4; Energy path Nest 20→30, Forge 30→50, Tavern 50→60 |
| 09:52, 09:54 | Skills shown as "?" until learned, Map 0 mist, Evasive, Hive Mind retired, fish carry Tide (10-15 skill reveal) |
| 10:23, 10:36 | Baby cards and the skills-by-map list; Ice Arrow, Twin Shot, Volley, the Bolts, Chilli, one-off tags, Fork / Trident / Pitchfork alike (10-15 11:45) |
| 12:29 | The big effects sweep: 958 effect moments in the Effects Lab, about 1,300 variants, 22 foil concepts, deaths by cause (10-15 22:30) |
| 18:15 | Card placement proposal, nothing moved (your pick, above) |
| 20:12 (15 items) | Wildpaths text, middle slot, Pounce, Exposed, spawn pill, Sandbox, home buttons, Codex 40 a page, tooltips, Bloodlust, time-givers, ambush losses, game texts in `docs/game-texts.xlsx`, Environment text, pills (10-15 fifth list and 22:30) |
| 21:37 (56 items), 21:48, 21:56, 22:05, 23:19 | Combat animations, battle board, rules (Illuminate, sudden death, Bounty = Worthy), 21 new skills, 6 new field effects, hidden skirmishes and jumpers, Dungeons tab, Long Burrow, Babel Spire, Energy, Beer, 💬 feedback button, Noto emoji, map titles, Effects Lab layout, Snapstick Turtle, Sheep (10-16 02:00) |
| 23:24 | Bulldoze (10-16 02:00) |
| 04:58 | Proposals relinked as .xlsx and .md; Quick hits land with the dash; at most 3 cave fires; ribbon map titles replace the cinematic ones (10-16 05:30) |
| Field art | 27 pixel scenes on the Environment and weather cards (10-16 06:30) |
| 08:57 | Errands tab on the Notices; daily dungeons named like raids, on the World map, with a 🗝️ beside Home and Arena; Worthy → Bounty on every card; Tide evade to test; card backings for units, structures, castles and fields; the live database items applied |
| 06:53 | Feedback rows carry the player's id, name and time; Wild Veggies is now Flora; the Blacksmith hides recipes until you've held their parts; D71 closed; the skill audit (10-16 skill audit) |

**Calls closed:** D27, D39, D74, D75, D78 (your 10-14 09:00 answers), D70 (Murgle placed), D77 (Steam: revisit by December), D71 (okay, 10-16), the Blacksmith question (10-16: recipes stay hidden until you've held their parts). Earlier: D20–D69 and P1/P2, as listed below.

## Done at 05:30 (your 22:59–23:47 notes)

Built (changelog 05:30). Choices to check:
- **Starter deck:** 8 shown cards (your side's 3 + 5 shared) + 9 hidden baby cards (3 Honey Bee, 3 Silver Minnow, 3 Sparrow Chick). It's weaker than the old 17 basics; Map 0 wasn't retuned (still open, section 1).
- **0-2's card** (Chipmunk Cavalry) moved to 0-3, so 0-3 gives Owl Nightwatch and Chipmunk Cavalry.
- **"Both sides" players** get a random faction pack at 0-2.
- **Strictly better** means Cost and Wait no higher, Attack and Health no lower, at least one strictly better, and no fewer skills.
- **The tutorial fights** keep their internal ids `tutorial`/`tutorial2` (shown T-1, T-2 since 2026-10-23, TU2; the three after them keep keys T-2 / T-3 / T-4 and read T-3 / T-4 / T-5).
- **The dialogue panel** moved about 5% left on the map, not 8%, so it doesn't cover the map list.
- **No "Play tutorial" button** turned up after picking a side here. If you still see one, tell me when.
- **The Misty on 1-1** isn't in the live data. It's probably an edit saved only in your browser.

## Done at 02:00 (your 20:31–21:33 notes)

All built (changelog 02:00). Choices to check:
- **Wash removed** from 6 cards (Dolphin Knight, Tide Spirit, Octopus Tactician, Riptide Eel, Coral Current Eel, Goliath Tentacle). They lose that ability.
- **"Periodic High Tides"** is on the High Tide card; the Tide-spout card says it pushes a column back. Say if you meant the other way.
- **Scorched Ground** is the new name of the volcanic ground's damage.
- **0.5× speed** is always available.
- **A pack won in a fight** opens after the results screen.
- **Cobble the golem** speaks at the Forge.
- **Kraken Spawnling** now uses the dark kraken so the Colossal Squid has the top-left one.
- Your 21:06 ideas are kept in `docs/design-notes-2026-10-14-ideas.md`. Card backings are noted as a future task.
- Clovermead's map art doesn't show in local builds (it is the same before these changes).

## Done at 23:30 (your 16:58, 17:03, 17:13 and 17:55 notes)

All built (see the changelog's 23:30 entry). ✅ Toxin is a real skill since 10-16. Still open: Blacksmith equipment isn't gated by "held once" (section 1).

## Done at 20:00 (your 14:50 list)

| Item | What's in the game now |
|---|---|
| Skill N | "Skill N values" sheet in the card plan workbook (fill "Your N"; tools/cardplan/import_skill_n.py brings it in). The card editor shows the card's budget score against N for its map, level and rarity |
| Screen shake | Big arrivals (over 20 Health, up to 200) and big hits (over 15, up to 100) |
| Factions | "Factions & regions" sheet: key skills per faction and region, and three subfactions with one card each (Ashen Covenant, Great Herd, Mycelium Choir). Not in the game |
| New skills | Crab Claws, Sacrifice - {}, Charge N - {}, freeze counters and stun stars, Meiosis, Nullify (kills go to the Removal Zone; the name is one constant), Restless (optional, on no card) |
| Evergreens | Tornado, Avalanche, Tsunami; Dragonic Spire's Dragon Lightning and Wither (the map is listed for later) |
| Eggs | Seven egg cards that hatch on the board into a random card of their kind; you get one when you first set that egg in the Nest |
| Esprit | Counts spawned units too, only those that share a type |
| Fight look | No sun or moon: colour temperature changes through the day; Misty condition; tighter deck pile and rows; icon-only top row on phones; compact skill chips |
| Lumber lesson | Never asks you to pitch the card that needs the Lumber; with no other card it says you'll draw an extra one next turn |
| Pages | Codex pager on top too; admin-only buttons checked; no "claim it on the board" line; costs inside Nest and Forge buttons; deck cards show pictures, rating, total Attack/Health; Forge contrast; swap offer is a sheet on phones; Nest costs show on tap ("Need 3 more Kibble"), Kibble rises per species |
| Cards | Big Bee, Frog, Fly renamed; MissingNo past World 1 and unobtainable; new Rafflesia, Puffball Bombardier, Otter Angler, Honeyjoe Brewer (not placed) |
| Art | 23 NightCafe images (list in the changelog). ✅ Bog Leech and Rivergate Tribune have art since 10-14. Still open: Otter Shieldback and Armored Mastiff (section 1) |
| Your calls | ✅ Closed: Crab Claws now attacks straight ahead when no side unit is there (10-15), and Psychic N is defined (10-14) |
| Effects library | Built at 21:00: Admin → 🔬 Effects library, every skill, trigger and field condition on a live stage with its effects, sounds and damage log |

## Done at 17:30 (continuing)

| Item | What's in the game now |
|---|---|
| Caves | No day or night in Caves & Alcoves, Smugglers' Grotto and The Sunken Depths (they had been left on Night) |
| Dark fights | A lantern pool of light follows your pointer in pitch-black and absolute darkness |
| Difficulty | Re-measured: Maps 1–9 are easy for a mid deck (90–99%); spikes at the Map 10, 14 and 16 bosses (35%, 43%, 8%). Still open (section 1) |
| Art | ✅ Rabid Jackal, Mirrorhide Mutant and Growth Sprout have art since 10-14 |

## Done at 16:15 (your 12:02 list)

| Item | What's in the game now |
|---|---|
| Bloom | Bloom (conditions) +2/+2, e.g. Tide & Night, Wind or Wet. New key so the old heal Bloom keeps working |
| Irradiation sound | Sizzle when stats burn, Geiger clicks when radiation spreads |
| Wave | Pushes the hit unit left or right; on four sea cards |
| River | Perma-tide on Sunken Hollow and Lilypad Reach (there is no map named River yet) |
| Blue Dragon | Supreme Tide |
| Swarm | Brood N hatches 1/1 brood (Wait 1) on three swarm cards |
| Pack | Chains of same-type Pack units: +2/+2 per member; Pack Leader links them all and adds +4/+4; irradiation strips 2 |
| NightCafe | Best free route: Flux 2 Klein 9B Fast with a 16-bit pixel prompt, Prompt Magic off. The pixel LoRAs and pixel templates are PRO-only. Notes in art_staging/PULL.md |

## Done at 14:30 (your 11:07 and 11:25 notes)

| Item | What's in the game now |
|---|---|
| Energy | Starts at 20; Camp to 50 (cheap), Forge to 60. About 14 days to Map 20 at two sessions a day if you buy the Camp steps early (26 days if you never do). Details in the late-game note |
| Tide | Swimmers = Tide, float; Moonpull (Moon Jelly); Tide-spout on Pebble Beach |
| Day and night | By map: outdoor maps cycle; caves, undersea and dark places have none; brighter sun, clear moon |
| Irradiation | Tokens that eat Health, Attack or skill values each round; shown in card details |
| Ghost, Shade, Shadow, Supreme | Built; Supreme is on the five hidden dragons only |
| Twin, Growth Sprout | Built; Twin on Puddle Changeling and the new Mirrorhide Mutant |
| Art | Your images placed; Shallows Fry, Vampire Bat and Wandering Mage added (not on maps yet) |
| Later | Flora, dragons from Map 50, Map 80 own effect, limit breaks every 100 maps, emoji/icon sets: in docs/design-2026-10-14-late-game.md |
| Art redo | Done at 16:15: Owl Fletcher, Owl Nightwatch and Bee Drone (NightCafe Flux 2 Klein, 16-bit pixel prompt, 2.25 credits; about 199 left) |

## Done at 12:45 (your 10:18 list)

| Item | What's in the game now |
|---|---|
| Volcano | Lava Tide, Petrification and Eruption roll each round at the fight's volcano level (Very low → High); the conditions show the band word |
| Map 20+ skills | Speed, Haste, Rabid, Cower, Ghost + Magic damage, Ichor, Irradiated, with tests. Rabid Jackal (2/3) added, no art or map yet |
| Names | docs/name-picker-2026-10-14.xlsx: tick ✓ to choose 15 Base, 15 Otters, 15 Hummingbirds and 6 per biome. Bog Leech already exists (2/5, Bleed 1); Vampire Bat (3 Attack, Leech 3) is proposed |
| Boomerang | Checked against your rules: it throws on its swing, comes back at the start of the next combat for a second hit (fast, before the main order), its owner doesn't swing that round, it never misses flyers, and an empty lane on the way back is a whiff. Tests cover each |
| Resources | Noted: Lumber, Stone and Metal are World 1 (T1–T3); Uranium belongs to World 3 (T7–T9). Irradiated cards don't make Uranium |

## Done at 10:45 (your 09:00 list)

| Item | What's in the game now |
|---|---|
| Leader tutorial | The first time you open the 👑 leader picker, the traveller says only Heroic and above can lead. Your first Heroic card brings the lesson back: "this one can be your leader", and the card itself speaks. If you never saw the first note, its line comes first |
| D39 | Pitchfork and Trident reworked (above) |
| Dialogues | 💬 Dialogues tab in the hub and docs/dialogues-2026-10-14.xlsx: all 63 conversations, who says each line and where it plays. An "Add your own" sheet; any card's name works as a speaker and shows that card's art |
| VFX | Castles crack with random-walk "miners" as they lose Health and crumble cell by cell (a cellular automaton) when destroyed. "Cards of old" finish: aged paper, foxing, creases. New Effects Lab tab, Procedural FX: shatter, Flip riffle shuffle, lantern light, a scrubbable forge timeline, a ripple wave |
| Foils | The eight Lab foils and Cards of old are in the game and drop from packs as rare prints (each about 2–3% of foils); the Forge and the Nest play a level-up burst |
| Effects in play | Frozen units shatter into ice shards; pack hauls ripple when laid out |

## Done at 23:30 (your 20:55, 21:36 and 22:05 lists)

| Item | What's in the game now |
|---|---|
| Tutorial | The tutorials are skirmishes T-1 and T-2 (no "!"; labelled T-0 and T-1 until 2026-10-23); part 1 unlocks "Tutorial Part 2", part 2 "Conquest Map" and has one Claim Rewards button; "This is the enemy Castle" holds the round; the leader's Wait is taught with a pause and a pointer; Initiative waits a turn; all tutorial words shortened |
| Maps | First visit to any map: zoom out, then the skirmishes drop in. Interactibles have no circles. Open-air side maps exit through the main map's icon; caves have a lamp. Critters and your pawn face the way they walk |
| Lessons | Lumber shown as a picture, a "Needs Lumber" tag on drawn cards, a ghost card dragged to the Graveyard; Maps 0–1 swap in Flying, Swimmer and Diurnal cards; later, better cards are offered as swaps. Armoury on Map 0 |
| Screens | Back buttons on every page off the map; iPad laid out like a computer; skirmish card fits, B beside the lock, New skills strip off; admin buttons beside the card and Clear/Unclear map on the toolbar (clearing pays the cards) |
| Codex | Only cards you've seen (admins: "Show unseen"); no Hidden/Discovered pills; 50 a page; 🎁 Get all per section; seasons 🍂🌸❄️☀️ |
| Admin | Profile: Reset all, Reset Codex, Reset to Map N |
| Fights | Deck thickness, castle crumble, Traveller conversation fixes (no repeats, no stuck see-through panel, fading arrow) |
| Art | Portraits for the 7 road folk and the 14 raid bosses (raid panels and VS screen); The Sunken Ferry map. About 17 NightCafe credits, roughly 218 left |
| Balance | ⚖️ Stat budget in the Test Lab: N = 8 + rarity step + level (Level 0: −2) + 0.1 per map number. Report only; no card has been changed |

## Done at 20:00 (your 17:37 list)

| Item | What's in the game now |
|---|---|
| 1 | No more "Both". The side screen has a third button, 🎲 Random (red Otters, blue Hummingbirds, green Random), and hovering any of them writes one line of lore and one of play at the bottom |
| 2 + 4 | **The ambush.** Your first Fight on 3-2 (Gannet Cliffs) is interrupted: a scout of the other side hops in and shoves your pawn aside, an Ambush skirmish bounces onto the map, and the fight starts. Winning it pays a **Faction Growth** card (the next card of your side you don't have, lowest rarity first). 3-2 waits until the ambush is beaten |
| 3 | Faction colours: Otters red, Hummingbirds blue, neutral green (side screen, entrance ribbon, faction packs, the ambush) |
| 6 | Battle ratings are live: worked out from the actual deck, each card's rarity weight and the level it fights at (road level or the editor's), plus leaders, scaled to 20 cards. They don't yet count map conditions or your Wildpath bonuses |
| D69 | Closed (okay) |

## Done at 18:00 (your 16:09 note)

| Item | What's in the game now |
|---|---|
| Wildpaths | Hidden until Map 21 is reached (Map 20's last fight won); only maps 21+ give points |
| UI audit | Phone fight layout, art on off-map boards, one card count, tab bar clearance, Tavern note spot, contrast fixes, Forge tabs, twin daily notices, "Test Lab" |

**UI audit, fixed at 19:00:** badges over stats on small cards, the phone fullscreen button, phone toasts, the Shop's duplicate back button and title, the Autobattler's Arena button. **Left as is:** Codex sort on phones lives under Filters (by design); the Shop's "?" marks are undiscovered subfactions (intended mystery).

## Done at 17:15 (your 15:58 list)

| Item | What's in the game now |
|---|---|
| Zeitgebers | In a fight that's day by default, the first Diurnal, Nocturnal or Crepuscular unit played starts the day/night cycle from that round (Day first). Maps with a phase set by the designer keep it. The first Tide unit already starts the tide |
| D80 | A "Next round" strip by the field: nightfall or dawn, the tide's turn, the wind (at your back or in your face) and eruptions |

## Done at 16:30 (your 14:50 list)

| Item | What's in the game now |
|---|---|
| 1 | The side pick flows into the fight: cards arc into your deck, the screen zooms, the battlefield fades in |
| 2 | Part 1's highlighted card glows only from the "drag a card" step |
| 3 | The tutorial's ghost card is the real card's size (it was copying the lifted, scaled-up card) |
| 4 | "Tutorial Complete!" and a single Claim Rewards button. Admin: the rewards are in Admin → 🎓 Tutorial editor ("Part 1 reward" and the part 2 lists) |
| 5 | Map 0 shows only the tutorials until part 2 is won (admins too, unless the layout editor is open), zoomed 25%, with a gold ring pointer; winning part 2 zooms out to the whole map |
| 7 | [Design pushback](design-pushback-2026-10-13.md) |

**Pushback calls:** D79 no, D80 built (the forecast), D81 not now, D82 vetoed.

## Done at 15:30 (your 14:21 list)

| Item | What's in the game now |
|---|---|
| First sign-in | The name field is the centre of the entrance ("What should we call you?"), and a first account sign-in without a chosen name opens a name prompt |
| D67 / D73 | Darkness 1 in 4 (night, Caves & Alcoves), Pitchblack 1 in 2 (Smugglers' Grotto), Absolute darkness 100% (for the Abyssal Plains). Darksight sees through all of it; Nocturnal sees at night; a Lantern lights its side |
| D66 | Frigid: level = units chilled a side, always +1 Wait, cold-weak units also take ice damage. Scorching: level L hits L+1 units a side for L fire damage, double on heat-weak units |
| D72 | New **Molting N** (+1/+2 every N rounds) on three crabs. My reading: Shedding stays for snakes and lizards (+1/+1 and the old skin's statuses fall away) |
| Extra | Dark fights get a vignette over the board, thicker with each level |

**Closed:** D65/D66, D67, D68, D72, D73. D71 is yours (mark the generic cards' Source in the editor).

## Done at 13:15 (continuing)

| Item | What's in the game now |
|---|---|
| Wildpaths | All 21 marks apply in Conquest fights, to your side only |
| Road | Map 20 (and every 20th) ends on a world boss. From Map 50: every 10th map a harder boss with a normal boss before it |
| D54 | Field-kit items come from quests: A notices and above, and finished weekly tiers |

## Done at 12:30 (your 11:40 list)

| Item | What's in the game now |
|---|---|
| D32 Wildpaths | Points cost 5 and 10 for the first rings, then 15, 20 and 25 (the capstone) for the advanced ones. Learn from the detail panel; ranks show on the tree. The bonuses are still a preview |
| Standard PvP | Arena → **Format: Collection / Standard**. Standard has its own deck (🃏 builder over every card), every card at Level 1, no foils, shinies or Materia. It covers Quick Battle, Pass & Play, Gauntlet and friend invites (the invite and banner say Standard). Collection is the normal format |
| Armoury | Moved to Map 1. Every Map 0 win now gives a card, and before the Armoury opens a window on the map offers to swap a deck card out for it |
| Road enders | Map 0 ends on a normal fight, Maps 1–4 on an Elite, every 5th map on a boss, the rest on a miniboss. Card rewards need rank B from Map 5, A from Map 15, S from Map 30 (a 🔒 pill shows the rank) |
| D40 Tavern | 🍺 The Tavern opens on Map 14 and now holds the max-Energy upgrades |
| D45 | Admin Mode → Forge → **✏️ Edit tier prices** (Gold, Dust, Strange Materia, map) publishes to everyone |
| D53 | Every fight's conditions are listed in the skirmish panel (terrain, eruptions, wind, gale, darkness, night, twilight, high tide, frost and its parts, boss surge). In a fight each row shows **?** until it first happens, then **New!** for that fight, then plain text |
| D54 | The daily field-kit refill is gone (the traveller packs one starter fill; more will come from dailies and weeklies). Your first win on Map 2 gives a 🔋 Energy capsule (+20 Energy, used from the Energy panel); it's also a reward token in ✏️ Edit rewards |
| D55 | The 3-minute check now also reads world events and GM messages, and Admin has a 📣 World call-out composer. The `world_events` table is written up in `supabase/migrations/20261013_world_events.sql` and is **not applied**: it waits for "apply it" |
| Archetypes | Swarm and Tide are keyword families, not archetypes: they lost the corner mark. Archetypes are Devilry, Ecclesia, Evolution, Scrappers, Exiled Ones, Forgotten Ones, Ancient Ones, Outer Ones and Void |
| Admin at launch | A `LAUNCH_BUILD` switch hides every admin surface on the live site. Server-side, admin writes are already refused by the `is_app_admin()` row policies, so a packet forwarder can't run them |
| Docs | [Economy and monetization](economy-monetization-2026-10-13.md), [co-op dungeon](coop-dungeon-design-2026-10-13.md), [Steam launch plan](steam-launch-plan-2026-10-13.md) |

**Closed:** D34, D41, D42, D43, D44, D47, D49 (replaced by the co-op dungeon doc), D50, D56, D57, D62, D63, D64.

## Done at 11:30 (your 10:57 list)

| # | What I did |
|---|---|
| 1 | Test Lab → 📊 **Card check**: measures only the cards a player meets up to a map you pick (that map's and earlier rewards, Base cards, your faction's cards), at Level 1, against their rarity band. |
| 1–3 | **Faction Reward** 🎁 and **Faction Growth** 🌱 placeholders in ✏️ Edit rewards. Reward: a random card from your faction pool (5 copies of each Common, 4 Uncommon, 3 Rare, 2 above, min 1), with odds by faction tier (10/20/30/40 collected: at 20 it's 50% Common / 30% Uncommon / 20% Rare). Growth: 1 of each faction card, lowest rarity first. Elites and bosses give 1 Faction Reward + 1 base card unless the fight has placeholders. |
| 4 | Hummingbirds as fencers: Crimson Wing Recruit and Duelist Cadet got Quick, Cobalt Talon Skirmisher Pierce 1, Ruby-throat Duelist Pierce 1 + Evasive. None use Poison. |
| 5 | Danger warnings v2: a card warns until you've **beaten** it (won a fight it was in). The ladder: 2 at Uncommon, 3 at Rare, 4 at Very Rare, 5 at Super Rare… A fight can name its own ⚠️ Danger cards (✏️ Edit rewards); those always warn until beaten. |
| 6 | **Shedding N**: every N rounds +1/+1 and its harmful counters come off (Grass Viper, Adder Ambusher). |
| 7 | **Twilight** in the cycle (D, N, D, N, T) on twilight maps or with a **Crepuscular** card in a deck; Diurnal and Nocturnal both active in Twilight. |
| 8 | Frost → **Frigid**, Heatwave → **Scorching**. Eclipse / Syzygy planned for Map 35+ (roadmap note). |
| 9, 11, 12 | Floodplains, Abyssal Plains (Map 29) and the Map 20–60 road: world-roadmap-2026-10-13. |
| 10 | Blindness only in complete darkness (caves today) unless Darksight or a Lantern; new **Sun-shy** and **Night-blind**. Night alone dims no one now. |
| 13 | The tide waits for the first Tide card. |
| 18 | Sweep is **Cleave** ("hits the unit in front, and the enemy units on its left and right each take N bonus damage"). |
| 19 | **Pitchfork** hits the 4 nearest enemy units, none more than 2 columns away (no longer pierces). |
| 14–17, 20, 21 | B6, D23, D24, D26, D32 closed; the Flea Market moved to Map 31. |

New calls for you:

| ID | What | (a) Pushback | (b) Recommendation |
|---|---|---|---|
| **D70** | **Endless dungeons: Murgle Mayhem (6-MM) is built** on my proposal (opens after Map 6, 50 floors, +4% a floor, a mini-boss every 10th, every floor a checkpoint) | ✅ Closed: Murgle is on the World map and in the Dungeons tab, with the Long Burrow (Map 22) and the Babel Spire after it (10-16) | |

## Done overnight (your 00:17 list)

| # | What I did |
|---|---|
| 1 | Strength analysis measures every card at Level 1; Base, starter and quest cards (Level 0 at the start) are measured at Level 1 and flagged ("first level is a major +10% step"). Base cards now start at Level 0 in the game too. |
| 2 | Otters and Hummingbirds are out of every pack. Elite and boss first clears give 1 faction-track card + 1 base-track card (Commons → Uncommons → Rares → duplicates; Very/Super Rare from Map 10). Map 20's boss gives your faction's Epic + Heroic; two Heroics made (Rivergate Tribune, Sunspire Sky-Sovereign). |
| 3 | Journeys: five subfaction quests across Maps 15–20 (three end there, two go past). Each step is a real fight and pays 2 cards. On the Notices board; the next fight shows its step. |
| 4 | Phyla filter shows each phylum's emblem. |
| 5 | Arrow / Fire Arrow shoot the nearest enemy (random on ties); "Never misses Flying units" on Arrow, Fire Arrow and Boomerang. |
| 6 | Deep Cave Troll → Cave Bear (new art). |
| 7 | Esprit is a passive. |
| 8 | New evergreen: Landslide N (when it falls: N to the enemy facing it and both its neighbours; Flying is above it). |
| 9 | Codex: one list; unowned greyed, locked 🔒. |
| 10 | Saving a card keeps your scroll position. |
| 11 | Spells shelved everywhere (`SPELLS_SHELVED`). |
| 12–13 | Windy rounds (1 in 2) with Tailwind and Headwind; night dims non-Nocturnal units (1 in 4 misses) unless they have Darksight or a Lantern; Dry. Design note and who-gets-what list: weather-and-time-2026-10-13.md. |
| 15 | Max Energy 50, 1 per 5 minutes. |
| 16 | Auto (Map 20 + rank S), Sweep (Map 30 + an Auto win at S), Auto-Sweep (Map 50), Idle-Sweep (Map 70). |
| 17 | Glass Dunes themed: Dry, Swift and Thorns; new Thorny Devil, Fennec Fox, Meerkat Sentry. |
| 18 | Lone Wolf X/Y and Sociable X/Y (Lone Grey Wolf, Meerkat Sentry). |
| 19 | Coffee N (Buzzed Chipmunk). Your workbook was byte-for-byte the one I exported, so it had no Codex changes in it: send the Codex version and I'll pick up the new skills. |
| 20 | Every NightCafe picture re-pixelated on a 64-pixel grid (chunkier); Mirror Moth, Elder Willow, Conch Herald, Tidewall Fort redrawn; art for the 9 new cards. Daily credits: a check-in is set for 08:20 your time. |

## Done at 23:55 (your 23:12 list, all ten)

| ID | What I did |
|---|---|
| 23-1…10 | Lv 0 row in stats by level · source editable in the card editor, maps in First–Fourth seasons · Nature's Force N · every card hidden by default · Heal + Self/Ally/Opponent/Any, distance and target count on every targeted action · 🐜/🐝 swarm mark · no "1" after icons · extended art crops far less, no hard bottom edge · editing no longer revokes your copy · Esprit/Rally on the strip |
| ART-T | Optional, still open: Tidewall Fort's castle art has "HOME BASE" lettering in it; regenerate on request (0.75 credits). |

## Done tonight (21:35–22:50)

| ID | What I did |
|---|---|
| ART | **Every card has art.** PixelLab is at its monthly limit, so I used your NightCafe credits (0.75 each, about 145 images, ~110 credits; 284 left). Each image is shrunk to the game's 128×128 pixel style with its background kept. Owl Sentinel, Ant Hill and Ant Warrior were redone as real animals; four upright ones (Bramblefox, Shieldbearer, Thistle Baron, Parish Sergeant) were redone on all fours. |
| RAID | **Six Goliath cephalopods** (Inkcloud Squid, Abyss Lantern Squid, Glass Octopus, Vampire Squid, Goliath Tentacle, Goliath Broodmother) fill the Goliath's parts, and drop only from the raid: one card when it falls, a second for the top 10%. |
| D20 | Darkness from your own losses now stops at 10. |
| D38 | Closed: whether a card can be earned now comes from its source, not a flag. |
| D48 | Spare castles: a map boss beaten again at rank S gives a spare of that map's castle; drop castles (below) give spares too. |
| D51 | Skull Vulture drops on Map 8's Root Snare. |
| P1/P2 | Closed: one Factions pool; the pack-only cards stay pack-only. |
| BAL | Enemy levels flattened: Lv 2 at Map 5, +1 every 5 maps, Lv 5 at Map 20, boss decks one higher. |
| 22:04 | Your 16 items: map emblems, Sunken Ferry side map, Stamina in Wildpaths, centipede and millipede, node panel, 22 drop castles, editor card details, out-of-cards summons, cosmetic types removed, 🔌 Shock, pack names. |
| 22:25 | Bare shaking map emblems, the pack note on Gatorback Swamp, real battle ratings, X/Y ⚡ MM:SS clocks, castle art (generating). |

## Where things stand

- **Effects:** 958 effect moments, all in the hub's Effects Lab with A/B/C variants; the game uses A. Pick a different variant anywhere and I'll switch it.
- **Cards:** every card has art; the new cards and skills from 10-14 to 10-16 are built but sit on no map until you place them.
- **Game text:** `docs/game-texts.xlsx` (6,858 rows). Edit the New text column and send it back.
- **Balance:** stat budget v3 (2026-10-17: 2A + H + S < N and A×H + S < (N/3)², N = 20 + 2×Level + Rarity + 6×Wait + 0.5×Wait² + 4×Lumber + 0.4×Lumber²) in the card editor and Test Lab; the card balance report is in the ⚖️ Balance tab.
- **Difficulty:** Map 0 and the Map 10, 14 and 16 bosses need a retune (section 1).

## Things only you can do (outside chat)

- **Supabase:** leaked-password protection needs the Pro plan (the project is on Free), so it's off. Upgrading is your call.
- **PixelLab:** at its monthly limit. Buying credits is your call; nothing waits on it except the two art pieces above.
- **NightCafe:** about 147 credits left after the field art.
- **The claude.ai project** is well under its limit.
