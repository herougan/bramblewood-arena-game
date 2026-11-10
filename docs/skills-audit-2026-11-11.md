# Skills audit (2026-11-11, package SKILL9)

Owner: *"Run through all skills again, make sure they meet our standard. Highlight any duplicates. In the end, the target is for <80 skills (total) at Map 20."*

**Analysis only: no card, map, text or engine file changed.** Data: `docs/design/skills-audit-2026-11-11.json` (every skill: where a player first meets it, carriers, card text, icon, price, a VFX hint). Made by `tools/skill9/skill9_dump_2026_11_11.py` (reads the built game in a headless browser) and `tools/skill9/skill9_audit_2026_11_11.py` (counts it; the plan is `tools/skill9/plan_2026_11_11.json`). The engine and `canonical/cards.json` win over this page.

## In short

- **Today a player meets 133 skills on main Maps 0-20.** 126 come from the main lists, counted the way the Map cards window counts them. 7 more come from fights, rewards, SPECIAL lists and the starting deck. Side maps that open by Map 20 add 38 (171 in all). With your picks for Maps 0-11 in place of those lists: 125.
- **The plan brings it to 73** (70 without the minor Flying, Diurnal, Tide and Salt), or 72 with your picks.
  - 50 of the 60 cuts come from merging variants into one skill. Each variant becomes a version of its family and reads "Family – version" (for example "Arrow – ice"). It keeps its own rule and price, the way ENG39 already works (DES2-3 a), so no fight changes.
  - 4 card swaps.
  - 6 skills leave the main road: they sit on cards you did not pick, or on cards only an enemy plays from a SPECIAL list.
- **Standard failures:** 3 high, 7 medium, 6 low (section 2).
- **One carrier only:** 86 of the 126 list skills appear on just one card on Maps 0-20.
- **Pacing still needs card moves:** after the plan, Maps 1 and 3 still introduce 9-10 skills each (section 5).

## 1. The count

| Where a player meets it | Skills |
|---|---|
| The engine's skill list (`SKILL_DEFS`) | 448 entries: 392 skills of their own (the rest are ENG35 parts), 13 retired, 81 on no card |
| On any card in play | 298 |
| **Main Maps 0-20, main lists** (a card with it at Level 0, not shown as "?") | **126** (122 without minor skills) |
| + fights, rewards, SPECIAL lists, level skills, starting deck | **133** |
| + side maps that open by Map 20 | 171 |
| Your picks (Maps 0-11) instead of those lists | 125 |
| "On X: Y" trigger lines on main-list cards (the game's count skips them) | 11 lines, 7 triggers x 6 actions |

New skills per main map. "Today" counts every source. "Plan" is after the plan. "Plan + picks" uses your picks for Maps 0-11 and lists only.

| Map | 0 | 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10 | 11 | 12 | 13 | 14 | 15 | 16 | 17 | 18 | 19 | 20 |
|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|
| Today | 12 | 11 | 4 | 10 | 4 | 3 | 9 | 10 | 6 | 4 | 3 | 7 | 4 | 5 | 6 | 8 | 4 | 9 | 4 | 6 | 4 |
| Plan | 11 | 9 | 4 | 10 | 4 | 1 | 4 | 4 | 3 | 2 | 2 | 4 | 2 | 1 | 0 | 3 | 0 | 3 | 2 | 3 | 1 |
| Plan + picks | 3 | 9 | 6 | 8 | 4 | 4 | 3 | 2 | 3 | 5 | 0 | 4 | 4 | 3 | 1 | 3 | 0 | 4 | 2 | 3 | 1 |

Map 0's 11 are the basics. The starting deck and the Level 1 skills bring most of them. By the list rule only 4 are new there: Flying, Guardian, Swarm, Venomous.

## 2. Standard failures

The standard: clear one-line text, its own mechanical identity, readable on a card, fits its cards, consistent names, a price in the budget, a VFX. Every road skill has an icon.

| Id | Skill (cards) | Problem | Fix |
|---|---|---|---|
| **H1** | Bedrock (Quarry Mole, M8, your pick) | Uses Stone on Map 8. Your rule is no Stone before Map 21. Malachite Golem's Stone cost on the M8 list breaks it too (card data; you did not pick it). | Mechanics: needs 3+ Lumber instead (SKILL9-10) |
| **H2** | Scavenge (Carrion Crow, M12) | The card text describes the retired point rule ("+1 scavenge point, every 3: 1 Lumber"). The engine gives +1 Lumber when another of your units dies (`en8DeathFeed`). | Wording: `ui.sk2-scavenge` |
| **H3** | Pack Leader (Dhole Matriarch, M16) | Links Pack units, but no card on a Maps 0-20 main list has Pack. It does nothing on the road. | Data: drop it. It is priced 0, so the budget does not move. |
| M1 | Pacing (Maps 1, 3, 6, 7) | By the list rule, Map 1 introduces 13 skills and Maps 3, 6 and 7 nine each. The rules allow 2 new skills a map (rules 10-21 RP), or 2-3 (UI35). | The plan, then section 5 |
| M2 | Guardian (15 road cards) | Priced 0.0, while its own note says 1.0 (not measured) | Budget: measure |
| M3 | Immolation (Magma Rhino), Converge (Border Collie) | Priced 0, with no note | Budget: measure |
| M4 | Tally family (7 road cards) | The same +2/+2 threshold shape is priced anywhere from 1.68 (Carnage, still on the old uptime, call ENG22-5) to 7.95 (Almanac, theoretical) | Budget: measure them as one family |
| M5 | One-carrier skills | 86 of 126 have one card on Maps 0-20. Your target for a signature is 2+. | The plan folds most; CONTENT work for the rest |
| M6 | Crepuscular (Woodcock Lookout, M1) | Day and night are both +1/+0, so it is a flat +1 Attack dressed as a time skill | Data: a real day / night split |
| M7 | Prey (Springbok Pronker, M14) | Dodges only while an enemy Predator is on the field. No M14 card has Predator, so it is rarely on. | Make it an Evasive version |
| L1 | Armor | "...every swing, arrow and spit but magic (never below 0). Magic goes past it." says "magic" twice | Wording |
| L2 | Bedrock, Salt | "🛡 Armor" with no number | Wording: "Armor 1" |
| L3 | Remember, Brood, Progeny, Foraging, Swarm | Grammar on the card: "1 Echoes", "2 1/1 copies", "Bramble Sprout take", "+2 Berry", "every ally that is Ants" | Wording |
| L4 | Fork, Charge, Spitfire | Fork has no full stop and says "this unit". Charge says "a random opponent" (it means an enemy unit). Spitfire's "1 to an adjacent unit" does not say adjacent to what. | Wording |
| L5 | Names | "Delivery, every turn" uses a comma; "Foe's Scarcity"; "Iron-will" has a hyphen. Cull's engine key is `hunter`, and project-state still calls it Hunter N. | The "Family – version" names fix most of these |
| L6 | VFX | No named engine event or FX code was found for Pickpocket, Foraging, Sequestration, the Cull and Tally families, Milling, Scavenge, Twin Strike, Mighty, Echolocation or Requiem. Several show as a plain hit, a Lumber float or a lit chip. | Check in the Effects Lab. A code search is not proof. |

Every main-list card on Maps 0-20 has at most 3 skills, not counting Flying, Tide, Diurnal and Nocturnal.

## 3. Duplicates: merge families

Each line is one rule shape. Today each variant on the road counts as a skill of its own. Under the plan the family counts once. "Saves" counts against the 133.

| Family (decision) | On the road now (first map) | Off-road versions | Saves |
|---|---|---|---|
| **Arrow** (1) | Arrow M11, Ice Arrow M17, Fire Arrow M20, Venom Spit M17, Twin Shot M14, Spitfire M19, Archer M11 (your pick) | Acid, Cinder, Ice, Spark, Volley, Snipe | 5 |
| **Keen Sense** (1) | Keen Sense M8, Darksight M8, Echolocation M2 | | 2 |
| **Cull** (2): bonus damage against one kind of target | Cull M5, Predator M6, Siege M12, Executioner M14, Shatter M17 | King Slayer | 4 |
| **Evasive** (1) | Evasive M3, Canopy Cover M13, Prey M14 | | 2 |
| **Daunt** (1) | Daunt M6, Weaken M6, Bludgeon M9 (your pick) | Stench | 1 |
| **Tally** (3): "while a count reaches N: +2/+2" | Tally M6, Carnage M14, Onslaught M15, Foe's Scarcity M15, Riled M16, Almanac M16, Dirge M17, Requiem M20 | Muster, Beset, Plenty | 7 |
| **Delivery** (1) | Delivery M0, Driftwood M2 (your pick), Delivery every turn M7, Scavenge M12, Milling M13 | Stockpile, Pearl, Tribe Delivery, Felling, Coppice, Salvage | 3 |
| **Heal** (4) | Regenerate M0, Repair M5, Heal M6, Herbalist M15, Carrion M20 | Nursing, Leech | 4 |
| **Speed** (5) | Quick M0, Slow M0, Fast Forward M13, Speed M15, Haste M18 | Blitz, Swift | 4 |
| **Thrive** (6), new name: "while a condition holds: +A/+H" | Timbered M1, Crepuscular M1, Rainrunner M1 (your pick), Bedrock M8, Salt M9, Frost M17, Heat M19 | Storm, Rain, Drought, Iron-will, Hoard | 5 |
| **Inflict** (7), new name: "its hits have a chance to give a status" | Shock M9 (your pick), Confuse M12, Freeze M17 | Sleep, Paralyze, Blinding, Make Tipsy, Stagger | 1 |
| **Afflicted** (8): a status it always has | Scatterbrained M3 (your pick), Purblind M8, Night-blind M14, Drunk M14 | | 2 |
| Venomous (1) | Venomous M0, Deadly Poison M7 | Poisonous, Poison Barbs | 1 |
| Decay (1) | Decay M7, Wither M7 | Corrode, Toxin | 1 |
| Pounce (1) | Pounce M3, Gash M10 (Pounce – bleed, like Arrow – bleed) | | 1 |
| Progeny (1) | Progeny M7, Meiosis M7 | Offspring, Hydra, Immortal | 1 |
| Fletcher (1) | Fletcher M11, Weapon Master M15 | | 1 |
| Nocturnal (1) | Nocturnal M0, Moonborn M16 | | 1 |
| Shell (1) | Shell M3, Cower M5 (your 11-08 "retreat into the shell") | | 1 |
| Immunity (1) | Immunity M6, Wakeful M7, Relict M9 | | 2 |
| Ambush (1) | Ambush M17, Trap M18 (same trigger: an enemy enters the slot facing it) | | 1 |

**Name collisions to keep in mind:**
- Frost (state) / Frostbite / Freeze / Ice
- Venomous / Venom Spit / Deadly Poison / Poison Barbs / Poisonous
- Brood / Progeny / Offspring / Sprout / Meiosis
- Shield / Spellward / Ward
- Two "Siege" and two "Bloom" entries in the registry, one of each retired

Off the road, Thorns / Poison Barbs / Spiteful / Counterattack are also one shape (damage back when hit). They are side-map only today.

## 4. The plan to reach under 80

**a. Families (section 3): 50 of the 60 cuts.** A version keeps its own rule, price and card. Only its name changes, to "Family – version", so the Map cards window counts the family key once.
- No fight changes. The budget stays as it is.
- The work is engine-free:
  - texts in `bramblewood-texts.js` and the 12 language packs;
  - the family key in `canonical/skill-params.json` "kinds";
  - `ui18CardSkillKeys` reading a version as its family.
- Risk: names that players have already seen change (Quick, Regenerate, Freeze, Carnage). Decisions 4, 5 and 7 offer to keep the old family name.

**b. Card swaps: 4.** Each card keeps 1-2 skills and its theme.

| Skill | Card | Becomes | Budget | Fights to re-measure |
|---|---|---|---|---|
| Berserk | Tasmanian Devil (M13) | Rage (already met on M13) | S +0.67 | 13-1/3/4/6/7/8, 16-7 |
| Scare | Yeti (M19) | Armor | S about -0.2 | 19-4, 19-6 (first clear) |
| Remember | Ashbone Ghoul (M20, an Undead ghoul) | Undead | S -2.36 | 20-1 to 20-10; 6-6's off-list Marsh Wisp goes (K14) |
| Pack Leader | Dhole Matriarch (M16) | dropped, keeps Guardian (H3) | none (priced 0) | 16-5, 16-6, 16-7 |

**c. Off the main road: 6.** Each sits on a card you did not pick, or on an enemy-only SPECIAL card. The card stays in the game.

| Skill | Card | Fights that hold it today |
|---|---|---|
| Sequestration | Poison Dart Croaker (not in your M6 picks) | 6-1 (deck, first clear) |
| Meld | Leafcutter Gardener (not in your M7 picks) | 7-1 to 7-6 (7-3 first clear); rebuilt when the M7 picks apply |
| Pickpocket | Field Mouse (not in your M1 picks) | 1-1, 1-3, 1-4 (first clear), 1-5, 12-3, 12-7; Clovermead keeps it |
| Gorge, Parasite | Gangrenous Leech (M11 SPECIAL) | 11-R |
| Rupture | Wound Reaver (M11 SPECIAL; The Aerie Vault's card) | 11-R |

**d. Not planned:**
- Cure stays its own skill. It arrives with your Marsh-mallow Hare pick on Map 5, and Cure is not Heal (rules 10-21 SK1).
- Charge, Fork and Nova drop out once your Map 10 picks apply.
- No card gains a skill (owner 11-10 11:31).

**e. If a decision says no:** the count rises by that decision's savings.
- Without Tally (3): 80.
- Without Tally and Thrive (3, 6): 85.
- The ones that matter most: 1 (23), 9 (10), 3 (7).

## 5. Pacing: moves that need no cut

After the plan, Maps 1 and 3 still introduce too much.
- **Map 1 (9):** keep Thorns, Inspiring and Foraging. Your picks already drop Lumberjack, Devour, True Sight and Thanatosis (to Map 4). Injured and Thrive (Puddle Skimmer, rain) could start later.
- **Map 3 (10):** keep Pounce, Dive and Reach (the DES2 signatures). Shell and Shield could start on Map 2, the shells map (Conch Crawler), or later. Mountain Climber could start on Map 11 (Chamois Leaper). Cleave could start on Map 8 (Octopus Tactician). Reload could start on Map 10/11 (Riptide Eel, Peak Condor). Bleed could start on Map 4 (Alley Cat). Evasive could start on Map 6 (Camouflage Frog).
- **Room left:** Maps 5, 13, 14, 16 and 20 introduce 0-1 each after the plan.

## 6. Skills a Map 0-20 player does not meet on the main road

- **Side maps that open by Map 20 (38):**
  - Acid, Beset, Bludgeon, Corrode, Counterattack, Dictator, Drought, Dynamite, Esprit, Fireball
  - Frenzy, Iron-will, Kinship, Landslide, Leech, Lightning, Nullify, Octolash, Pack, Pack Howl
  - Plenty, Poison Barbs, Prospector, Quarry, Rain, Rampart, Relic, Ritual, Rocket, Spiteful
  - Sprout, Storm, Sturdy, Supreme, Supreme Tide, Tangleweed, Trident, Volley
  - After the plan's families, side maps add 37 to the 73 (110). Side-map tuning waits (owner 11-10 11:57).
- **First met on main Map 21+ (16):** Breach, Cure, Earthquake, Expose, Felling, Heavy Metal, Hoard, Ice, King, Last Stand, Scatterbrained, Sentry, Stem, Stun, Swipe, Vanguard. Cure and Scatterbrained come earlier with your picks.
- **On cards that no map uses yet** (packs, factions, raids, unplaced): 109. **On no card:** 81. **Retired:** 13. All names are in the JSON (`notOnTheMainRoad`).

## 7. Decisions to make

The drafts, under 100 words each with a default, are in the SKILL9 report. They are not in `docs/decisions.json` yet.
- SKILL9-1: "Family – version" names, plus the low-risk merges
- SKILL9-2: Cull
- SKILL9-3: Tally
- SKILL9-4: Heal's name
- SKILL9-5: Speed's name
- SKILL9-6: Thrive
- SKILL9-7: Inflict
- SKILL9-8: Afflicted
- SKILL9-9: swaps and off-road moves
- SKILL9-10: Bedrock's Stone
