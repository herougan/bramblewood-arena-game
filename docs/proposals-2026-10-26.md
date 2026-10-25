# Proposals, 2026-10-26 (package PROP1)

Four design proposals the owner asked for on 10-25 23:58. Nothing here is built; no game code changed. Each section ends with the owner's call, which is also a decision in `docs/decisions.json` (PROP1-1 .. PROP1-4).

Prices use the owner's 4-round rule (`docs/workflows/balance.md`): a stat point is 2 x Attack + Health (`bramblewood-budget.js`, `contextS`), so +1 Attack held over a typical 4-round life is 2 points, +1 Health 1 point, +1/+1 3 points and +2/+2 6 points. A conditional bonus costs its points x the share of the unit's rounds the condition holds (the EN5 / EN6 uptime method; Plenty's +1/+1 at 0.15 is 0.45).

Sources read: `docs/project-state.md`, `docs/evaluation-protocol.md`, `docs/effects-catalogue.md`, `bramblewood-budget.js`, `bramblewood-engine.js` (`EQ_DEF`, `EQ2_DEF`, `eqDrop`, `eq2Wear`, `eq2ParasiteTick`, the Fester bonus in the swing), `arena_app.js` (`QUEST_TIERS`, `DAILY_QUEST_KINDS`, `QUEST_RANK_REWARD`, `xpToNext`, `xpMilestones`), `docs/economy-monetization-2026-10-13.md` (on disk), `docs/progression-plan.md`, decisions OWN-Q2/Q3/Q4/Q5, EQ-1, EQ2-1, EQ2-4, and action items B1, B2, E15, E16, E20.

---

## 1. Equipment hardiness and destruction (OWN-Q2)

### What the owner asked
- "Equipment can be destroyed through specific anti-equipment skill. But only at 50% chance, since equipments shouldn't be so easily destroyed ... how do i make stronger equipment represent hardiness? Like mythril armor shouldn't break easily - maybe with armor 'lives' default 1, some have 2-3 - almost becoming unbreakable."
- From #21 (decided, action items E15 / E16): Equip Time N (default 1, a top-right badge); Tamper-proof equipment cannot be stolen; when the wearer dies the piece drops and the next unit picks it up. From OWN-Q5 (decided): Pulverise breaks equipment it hits.

### What the game does today (engine, package EQ2)
- Every piece has **durability**: `equip.durability` on its card, else by rarity (Common / Uncommon 3, Rare to Super Rare 4, Epic and up 5; `EQ2_DEF.durByRarity`, mirrored in `bramblewood-budget.js` `EQUIP_DUR_BY_RARITY`).
- A hit on the wearer takes 1 (a swing, a shot, a bolt, a raid smack, a floor's burn; a Poison or Bleed tick is no hit); an acid hit takes 2; each Corrode applied takes 2. At 0 the piece breaks: it goes to the graveyard and its stats and granted skills come off (Health never below 1).
- When the wearer dies, the piece stays in its slot with its wear and the next unit played, spawned or moved there picks it up and equips it over `EQ_DEF.equipTurns` (1) rounds. A piece worn to 0 by the killing blow breaks instead.
- Disarm (Glintsnatch Magpie) steals a piece. Nothing else destroys one.
- Price: `equipLifeMult` = min(durability, 4) / 4 of the piece's stats and grant (x0.75 for durability 3, x1 from 4).
- The board already shows a column of durability pips beside the piece's icon (`eq2MarksHTML`).

### Proposal (recommended): Lives on top of durability
Durability stays as the wear counter: it is what makes hits, acid and Corrode matter, and it already has its pips and its price. **Lives** count how many times a piece can break before it is gone. Lives 1, the default, is exactly today's rule, so no existing card changes.

Rules:
1. **Lives N** on an equipment card (`equip.lives`, default 1). The keyword on the card is **Hardy N** (N = lives; plain pieces show nothing). The name is free: no skill, keyword or text uses "Hardy" (checked in `arena_app.js`, `bramblewood-engine.js`, `bramblewood-texts.js`, `canonical/skill-costs.json`, `canonical/cards.json`).
2. **Wear** as today: a hit 1, an acid hit 2, each Corrode applied 2.
3. **A break takes one life.** A piece breaks when its durability reaches 0, or when a break effect succeeds (below). If it has lives left, it stays on, shows a crack, and its durability refills to full. At 0 lives it is destroyed as today (graveyard, stats and skills off).
4. **Break effects take a life without touching durability.** So a Hardy 3 piece needs three breaks, whatever its wear.
5. **Dropping and picking up** as decided in #21: the piece keeps its durability and its lives; the next unit picks it up after the piece's Equip Time N (default 1).
6. **Tamper-proof** blocks Disarm (and any later steal) only. It does not protect against breaking.
7. **The killing blow:** as today, a piece worn to 0 by the blow that fells its unit breaks; with lives left it loses one, refills and drops.

Defaults: Lives 1 for every piece. Hardy 2 for the Legendary armour that exists (Dragonscale Mail); Hardy 3 is kept for a few named pieces of rare metals (a future Mythril Hauberk, the owner's example), Legendary or rarer, never on a Common. Weapons stay at 1 life by default: they are meant to be the pieces you lose.

### The anti-equipment skills
All three are built from an existing trigger and a new action **Break** (take one life from a piece, at a chance), the owner's triggers x actions rule.

| Skill | Wording on the card | Rule | Price (4-round rule) |
|---|---|---|---|
| **Sunder** | "On Hit: 50% to break the target's equipment." | Each landed swing or shot at a unit carrying a piece rolls 50% (the fight's seeded RNG) to take one of its lives. Nothing on a unit with no piece or a loose piece. Quiet Contemplation: one roll, no doubling. | **1.0.** The ten pieces today are worth 1.9-16.8 points after `equipLifeMult`, about 4 for a typical one (`docs/balance/eq2-equipment-2026-10-24.json`, x1After). Against a carrier, two landed hits break a 1-life piece 75% of the time, early in its life, so the foe loses about two thirds of it, about 2.7 points. It does nothing against a deck with no equipment, which is most decks today: x about 0.4. Disarm, which also gains the piece, is priced 1.4-2 in `canonical/skill-costs.json`. |
| **Dismantle** | "On Play: 50% to break the equipment of the enemy facing it, or a loose enemy piece if none." | One roll when it is played (a spawned copy rolls too). A loose piece counts: breaking its last life removes it from the slot. | **0.5.** One roll, once a fight, only against equipment: about a third of Sunder. Its plus is reach: it is the only answer to a piece lying loose. |
| **Pulverise** (decided OWN-Q5) | "... breaks equipment it hits ..." | A landed Pulverise hit takes one life, sure (no roll). See the call below: the owner's "only at 50%" may mean Pulverise rolls too. | Its equipment part is **+0.5** inside Pulverise's price: a sure break on a skill that also ignores and breaks Armor and doubles damage to Structures. |

Interactions, one line each:
- **Corrode and acid** are the slow, sure answer: they wear durability (2 a time); at 0 a life goes and durability refills. A Hardy 3 Dragonscale (durability 5) takes 3 x 3 = 9 Corrode stacks, or 8 acid hits, to destroy. Sunder and Dismantle are the fast, chancy answer. Pulverise is the rare sure answer.
- **Break and wear together:** a break never refills durability; only losing a life to wear does.
- **Disarm** steals the piece with its lives and wear. Tamper-proof stops it.
- **Revive:** a revived unit keeps its piece (as today).
- **Bloom copies** start with no piece.
- **The CPU:** Sunder and Pulverise units aim at carriers first when the lane choice is free (one more term in the slot score, worth a piece's stats x the break chance).

### How it shows
- **On the card face** (Codex, hand): "Hardy 2" as a keyword line; a small gem badge with the number at the bottom right of the art. The Equip Time badge sits top right (E15). Durability shows as "Durability 5" in the card's detail, as today.
- **On the board:** under the piece's icon, its lives as small gold rings (one ring per life left, nothing for a plain 1-life piece) above the durability pips. A break: the icon cracks (a white crack line), one ring pops, "💔 −1 life" floats, the pips refill with a short glint. The last break is today's shatter.
- **Log line:** "{unit}'s {piece} cracks (1 life left)."

### Price of Lives (the equipment piece's own price)
Today a piece counts min(D, 4) / 4 of its stats and grant for the wearer's 4-round life. Two effects of an extra life:
- **The wearer's life:** a Common piece of durability 3 with Hardy 2 lasts 6 hits: min(6, 4) / 4 = 1, so x0.75 becomes x1.
- **After the wearer dies:** a 1-life piece usually breaks around its wearer's death; a Hardy piece outlives it and serves the next unit, after Equip Time, if one comes into that slot before the fight ends. Estimate: 3 of the next unit's 4 rounds (Equip Time 1) x 0.8 (the slot is refilled) x 0.6 (the fight is still going) = **+0.35 of the piece's points for the 2nd life, +0.2 for the 3rd**.
- So: `equipLifeMult = min(D x L, 4) / 4 + 0.35 x [L >= 2] + 0.2 x [L >= 3]`.
- Example: Dragonscale Mail (0/11, Armor 2, durability 5) at Hardy 2: 14 points x 1.35 = 18.9, against its N of 26.9 (70% of its budget, from 52%). It fits without a stat change; the stat checks would confirm before it ships.

### Other ways to do it (the owner's call)
- **A. Lives on top of durability (recommended, above).** Keeps today's wear; lives 1 is today's rule; Hardy N is the hardiness. Cost: a second small number on rare pieces only.
- **B. Lives replace durability.** Hits no longer wear pieces. Only break effects (Sunder, Dismantle, Pulverise) and acid / Corrode take lives (acid / Corrode at 50% a time, the owner's "only at 50%"). Simpler to read (one number), but pieces become near-permanent buffs again against a deck with no answer, the problem the owner raised in EQ-1. Sunder would be needed on many more cards.
- **C. Hardy as a quality, no lives.** A Hardy piece ignores break effects (Sunder, Dismantle and Pulverise fail on it) and takes half wear (a hit wears it every other time). Mythril = Hardy. One keyword, no new number, but no "2-3 lives" gradation, and nothing but slow wear answers it.

Also to settle: does Pulverise break for sure, or roll 50% like Sunder?

---

## 2. The battle pass (OWN-Q3, with B1 and B2)

### What the owner asked
- "Battlepass is not level locked but gameplay locked. Doing what actions daily or weekly builds up to it. Resets every month."
- #51: "Should we take back the abundant packs we give in levelling? 25 levels = 25 packs - but it seems very hard to reach level 25 actually."
- B1 (decided, not built): Level 0 at the start, Level 1 after the tutorials; Levels 1-5 give single cards; from Level 5 packs alternate faction / Pack 1, later Pack 2.
- B2 (decided, not built): "it was so ez to reach level 15. But 15-25 was a drag": a gentler exponent and a stronger linear part.

### What exists to build on
- **Daily notices** (`DAILY_QUEST_KINDS`, `rollDailyQuest`): 3 at midnight and 1 each at 6 AM, 12 PM and 6 PM, ranked D to SSS (`QUEST_RANK_WEIGHT`: D 22, C 30, B 30, A 13.8, S 3.5, SS 0.5, SSS 0.2 percent), one free swap a day. Counters: Energy on Conquest, units defeated, wins, Conquest clears, PvP tickets, PvP wins, raids joined.
- **Daily and weekly tiers** (`QUEST_TIERS`): three daily tiers (3 / 3 / 2 quests) and three weekly tiers (3 / 3 / 2), each paying Maple Leaves, Dust and XP (daily 100 / 60 / 30 XP, weekly 400 / 250 / 120).
- **One counter function** `bumpQuestCounter(counter, n)` feeds dailies, weeklies, errands and lifetime medals. A pass only needs to listen to it and to the claim functions.
- **XP:** mostly from notices (25-750 XP by rank, about 46 on average), tier claims, first clears (25), map clears (300) and medals; a win gives 3.
- **Level rewards:** the awarding code (`awardXp`) grants nothing on a level-up today; the per-level packs are B1's planned track (one pack a level from Level 5 to 25, the owner's "25 levels = 25 packs").
- **The Bramble Pass** in `docs/economy-monetization-2026-10-13.md` (D75: 4.99 USD a month subscription, a first price) is the only paid-pass idea on record. It is used below as the premium lane's placeholder; money stays undecided (S3 parked).

How long Level 25 takes today (`xpToNext`: 7,716 XP to Level 15, 12,765 more to 25; 20,481 in all). Each claimed tier quest pays its tier's XP (daily 100 / 60 / 30, weekly 400 / 250 / 120):
- **Everything every day** (6 notices, all 8 daily tier quests, all weekly quests, about 10 wins, PvP and raids open): about 275 + 540 + 313 (weekly, a day) + 30 = about 1,150 XP a day. Level 25 in about 18 days.
- **Notices and the easy half of the tiers:** about 500 a day. About 40 days.
- **Casual:** about 250 a day. About 80 days.

Map clears (300 each) and first clears add more early on. Under B1 as decided, that is 21 packs over 18-80 days, on top of the map-end packs.

### Proposal: the Moon Trail
A monthly track. Name: **Moon Trail** (the month is a moon; the game already has Full Moon and night). Its points are **Pawprints** 🐾. Neither name is used as a feature or currency in the code or texts (the word "pawprints" appears once, in a map dialogue line). Alternatives: Season Trail / Trail Marks, or just Battle Pass.

**Gameplay locked, not level locked:** every player sees it from Map 1 (after the tutorials). There is no level gate. What earns points is the actions below. Actions for features you have not opened yet (PvP, raids) are never drawn for you, exactly as `DAILY_QUEST_KINDS` already filters with `needs`.

**Resets:** on the 1st of each month at local midnight. Unclaimed tiers you reached are paid automatically at the reset (nothing is lost for not opening the screen). Pawprints do not carry over.

#### Daily actions (reset at local midnight, the notices' day)
| Action | Built on | Pawprints |
|---|---|---|
| Finish a daily notice, rank D, C or B | `claimQuest('daily', id)` of a notice | 10 |
| Finish a rank A notice | the same | 20 |
| Finish a rank S / SS / SSS notice | the same | 40 / 60 / 100 |
| Finish daily tier 1 / 2 / 3 (all its quests claimed) | `claimQuest('daily', id)` on `QUEST_TIERS.daily` | 20 / 10 / 10 |
| First win of the day (any mode that counts for quests, `QUEST_COUNTING_MODES`) | `bumpQuestCounter('wins')`, once a day | 10 |

A notice is worth about 13 Pawprints on average (by `QUEST_RANK_WEIGHT`). A full day (6 notices, all three tiers, a win) is about 130; a light day (3 notices, tier 1, a win) about 70.

#### Weekly actions (weeks start Monday, as `weekKey`)
| Action | Built on | Pawprints |
|---|---|---|
| Finish weekly tier 1 / 2 / 3 | `claimQuest('weekly', id)` on `QUEST_TIERS.weekly` | 100 / 60 / 40 |
| Three **Trail challenges** a week, 50 each, drawn from the pool below (seeded by the week, the same for everyone) | counters | 150 in all |

Trail challenge pool (the gameplay-locked part: things to do, not time spent). Existing counters first; the four marked *new* need one more `bumpQuestCounter` call each at their source.
- Defeat 150 enemy units (`unitsDefeated`)
- Clear 12 Conquest fights (`conquestWins`)
- Use 250 Energy on Conquest (`energyConquest`)
- Win 15 matches (`wins`)
- Join 3 raids (`raidsJoined`, needs the raid)
- Win 8 PvP matches (`pvpWins`, needs the arena)
- Clear 2 challenge skirmishes (*new*: `challengeClears`)
- Beat a boss or an elite (*new*: `bossWins`)
- Level up 3 card copies in the Forge (*new*: `forgeLevels`, needs the Forge, Map 11)
- Win with 3 different decks (*new*: `decksWon`, counts distinct deck ids)

#### The month's numbers
| Player | Pawprints a month (30.4 days, 4.35 weeks) | Tier reached (of 30) |
|---|---|---|
| Full: every notice, tier and challenge | about 130 x 30 + 350 x 4.35 = about 5,400 | 30 by about day 25 |
| Regular: a light day 22 days a month, weekly tiers 1-2 and two challenges | about 70 x 22 + 260 x 4 = about 2,600 | 17 |
| Casual: a light half-day 12 days a month, weekly tier 1 | about 40 x 12 + 100 x 3 = about 800 | 5 |

**Tiers:** 30 tiers at 150 Pawprints each (4,500 for the whole free lane). Past tier 30: a **Trail Chest** (a pack of 3) every 600 more, at most 3 a month. The tier cost is the one knob: 120 a tier would let a regular player reach tier 21.

#### Tiers and rewards
Free lane for everyone; the premium lane is a **placeholder**. The owner has not decided on money (S3 stays parked): the lane is drawn locked, with "Coming later" and no price. Gold Leaves amounts there only show the shape.

Free-lane totals a month: 6 packs (3 of the current pack tier, 2 faction packs, 1 Tidemire Chest of 5), about 900 Maple Leaves, about 900 Dust, 2 Energy capsules, 1 Raid Ticket, 4 field-kit items, Kibble and Metal, and a monthly title.

| Tier | Free lane | Premium lane (placeholder) |
|---|---|---|
| 1 | 80 🍁 Maple Leaves | 30 🍂 (placeholder) |
| 2 | 100 ✨ Dust | Monthly card back |
| 3 | 2 field-kit items | 1 pack (current tier) |
| 4 | 60 🍁 | 30 🍂 |
| 5 | **Pack: your current pack tier** (Pack 1 on Maps 0-6, Pack 2 on 7-13, and so on) | Shiny reroll token |
| 6 | 120 ✨ | 1 pack |
| 7 | 20 🦴 Kibble | 30 🍂 |
| 8 | 100 🍁 | Monthly emote |
| 9 | ⚡ Energy capsule (8 Energy) | 1 pack |
| 10 | **Faction pack** | 1 Tidemire Chest |
| 11 | 120 ✨ | 30 🍂 |
| 12 | 2 🔩 Metal | 1 pack |
| 13 | 100 🍁 | Card frame (monthly) |
| 14 | 1 field-kit item | 30 🍂 |
| 15 | **Pack: current tier** | 1 pack |
| 16 | 150 ✨ | 1 Raid Ticket |
| 17 | 20 🦴 | 30 🍂 |
| 18 | 120 🍁 | 1 pack |
| 19 | 🎟️ Raid Ticket | Monthly avatar |
| 20 | **Faction pack** | 1 Tidemire Chest |
| 21 | 150 ✨ | 30 🍂 |
| 22 | 120 🍁 | 1 pack |
| 23 | 1 field-kit item | Shiny reroll token |
| 24 | 2 🔩 | 30 🍂 |
| 25 | **Pack: current tier** | 1 pack |
| 26 | 150 ✨ | 1 Highcrest Case |
| 27 | 150 🍁 | 30 🍂 |
| 28 | ⚡ Energy capsule | 1 pack |
| 29 | 110 ✨, 150 🍁 | 60 🍂 |
| 30 | **Tidemire Chest (5 cards)** and the month's title ("Moonwalker of <month>") | Animated card back |

Notes:
- **Raid Ticket at tier 19:** RW3-2 keeps tickets rare (an S notice brings one about 0.6 a week). One a month from the trail is the same order as one S notice's 40%.
- **Energy capsules:** EB-5 gives one about every three maps on first clears. Two a month from the trail is a small top-up; one at tier 9 alone is also fine.
- **Packs follow the road:** "current pack tier" is the highest pack tier your furthest map has opened (PP-1). So a new player never gets a Pack 3 card on Map 2, and the faction packs climb as faction rewards do (RP rules).
- **What the trail does not pay:** XP (XP stays with notices, tiers and milestones, so levels keep meaning "how far you are"), skirmish-exclusive cards, and anything with a gate (Forge tiers, maps).

### What moves out of level rewards
B1's track stays for the first levels (onboarding), and the steady packs move to the trail:

| Level | B1 as decided | Proposed |
|---|---|---|
| 0 → 1 (tutorials done) | – | – (unchanged) |
| 2, 3, 4, 5 | a single card each | a single card each (unchanged) |
| 5 | first pack (faction) | first pack (faction), unchanged: the moment packs are taught |
| 6-9, 11-14, 16-19, 21-24 | a pack each (faction / Pack 1 alternating) | 100 🍁 + 50 ✨ each, no pack |
| 10, 15, 20, 25 | a pack each | a pack (Pack of your tier at 10 and 20, faction at 15 and 25) + a cosmetic at 10 / 20 (a title, a frame) |
| 26 and up | a pack each | the same five-level rhythm |

Packs to Level 25: B1 gives 21; the proposal gives 5 from levels. The trail's 6 a month add about 4-8 for a daily player over the 18-40 days to Level 25 (9-13 in all). A slower player gets more trail packs per level, because the month passes whatever their XP. Levels pay less but more often feel earned, and packs come from playing every day rather than from a curve that slows down.

Pack flow for a free daily player, all sources (`economy-monetization-2026-10-13.md` targets 5-7 a week): map ends (a pack of 3 and a faction pack per map, RW5-1, about 1-2 maps a week mid-road) about 2-4, the trail about 1.4, the level packs about 0.2, packs bought with Maple Leaves about 1-2. That is about 5-7.

### The XP curve (B2), for the record
B2 owns this change (with the hub's Curves tab). An input for it, which flattens the curve the way the owner described:
- `xpToNext(L) = 330 + 30 (L-1) + 10 (1.06^(L-1) - 1)`
- Level 15 in 7,420 XP (today 7,716), Levels 15-25 in 9,048 (today 12,765), Level 40 in 36,159 (today 57,750).
- Early levels get slightly slower (Level 5 in 1,504, today 1,115), and the drag after 15 drops by about 30%.

### Options (the owner's call)
- **A. Moon Trail as above, level packs every 5 levels (recommended).**
- **B. Moon Trail without packs** (resources, items, cosmetics only); B1's pack-a-level stays. Generous, and the trail then feels like a chore list.
- **C. No level packs at all after Level 5:** all steady packs come from the trail and the map ends; levels give resources and cosmetics.

Also open: the tier cost (150 recommended, 120 easier), and the premium lane (kept as a locked placeholder until money is decided).

---

## 3. Fester rework (OWN-Q4)

### What the owner asked
"just do extra damage = poison seems very lame and already kinda done with detonate. I like the name though. Maybe it makes parasites act twice or something."

### What Fester is today
- Engine (`bramblewood-engine.js`, the swing): `festerBonus = effects.fester ? (attacker's own Poison stacks) : 0`, added to the swing like Crit (Rupture is the same with the attacker's own Bleed).
- Wording (`arena_app.js` `SKILL_TEXT.fester`): "Deals extra damage equal to its own Poison." A unit only gains from it while it is poisoned itself.
- Cards: the Gangrenous Leech (Uncommon, 1 Lumber, 4/4, Poison 2 + Fester; source "mk") and the test card. Price 0 (`canonical/skill-costs.json`: measured -0.04, high confidence): in practice it does nothing.
- Lingering (`festering`, the Carrion Beetle) is a different skill (Bleed and Poison don't wear down while it is on the field); it was renamed from Festering in 10-16 so the two would not be confused. It stays as it is.

### Parasite today (EQ2-4, EN7-2)
A Parasite card may be played onto an enemy unit in your reach. It rides its host: no slot, can't be hit, blocks nothing. It waits its own Wait, then **feeds as each round's fight begins**: its Attack as a flat hit on the host (no dodge, no Armor, no Guardian), healing itself as much (`eq2ParasiteTick`). One Parasite a host, never a Structure. When the host dies it drops onto your side in that column if the slot is free, else into your graveyard. Its bloom copy hooks onto an enemy beside its host. Price: Parasite is 1 (fixed). The Clinging Leech (4/9) is the only Parasite card.

### Three reworks that keep the name
All three make Fester a Parasite skill (the leech's own word for an infected wound) and take poison out of it, so it no longer overlaps Detonate. Under any of them the Gangrenous Leech becomes a Parasite (Parasite + Fester). Its Poison 2 stays on its swings only, as today: a feed is not a swing, so it does not poison.

| | **F1. Gorge** (the owner's "act twice") | **F2. Brood-mother** (an aura) | **F3. Spreading** (the wound spreads) |
|---|---|---|---|
| Wording | "Fester: as a Parasite, it feeds twice each round: as the fight begins and again as the round ends." | "Fester: while it is on the field, your Parasites feed twice each round." | "Fester: when its host dies, it hooks onto an enemy beside the host instead of dropping off." |
| Rule | The second feed comes at round end, after the swings and before Bleed fades, with the same Attack and heal. Quiet Contemplation: one feed. A hooked Parasite only, so it does nothing played as a plain unit. | Every Parasite of your side, hooked and done waiting, feeds a second time at round end. Several Fester units do not stack (a Parasite feeds at most twice). It works whether the Fester unit is itself hooked or in a slot. | The new host: an enemy unit left, right, in front of or behind the old one, with no Parasite, not a Structure or a cage, picked at random (seeded); none: it drops as today. Its Wait is already done, so it feeds the next round. |
| What it is for | A Parasite that kills its host fast. | Parasite decks: the leech-mother that makes every leech worse for the enemy. | A Parasite that keeps feeding across a fight instead of turning into a plain unit. |
| Price (4-round rule) | A feed is A damage that always lands plus A healing. Hooked after its Wait, a Parasite feeds about 3 times in a 4-round life; a second feed each time adds about A damage a round, worth about +A Attack (2A points), x 0.8 (the host can die first; played as a plain unit it does nothing). **1.6 x Attack**: 6.4 on the 4/9 Clinging Leech, so a Gorging Parasite needs about 2 less Attack or 4 less Health. If that is too swingy, a half-strength second feed (ceil(A/2)) costs **0.8 x Attack**. | 1.6 x A for each of your Parasites on the field, x the share of rounds a Parasite of yours is hooked. No Parasite deck exists yet (one Parasite card), so the uptime cannot be measured. Judged at 0.3 for a card made for a Parasite deck (two or three leeches in 20 cards), and the leeches' Attack about 3: 1.6 x 3 x 0.3 x 1.5 Parasites = **about 2.2**, a fixed price, revisited once a Parasite deck exists. | The host dies about halfway through the Parasite's life. Without Fester it drops as a plain unit (it can then be hit; its swings can be blocked); with Fester it gets about 2 more sure feeds, if a neighbour exists (about 0.7 on an open board) and the fight goes on (0.7). The gain over dropping is the sure-hit part of 2 feeds, about half of A a feed: **0.5 x Attack** (2 on the Clinging Leech). |
| Risk | Strongest; a 4-Attack leech deals 8 sure a round. | Needs more Parasite cards before it does anything. | Mild; the plainest to read. |

Recommended: **F1 (Gorge) at half strength on its second feed** (ceil(A/2), 0.8 x Attack). It is the owner's idea, reads at a glance, and stays safe on a high-Attack leech. F3 is the safe fallback. F2 is worth keeping for when more leeches exist. The Clinging Leech's proposed home is the Carrion Moors (Map 27); Maps 21-40 introduce no new skills, so a Parasite deck there would need Parasite taught earlier.

What happens to the current effect: removed (it was priced 0 and did nothing). Rupture (extra damage equal to its own Bleed) is untouched; the owner did not raise it.

---

## 4. Threshold skills

### What the owner asked
"Propose new skill(s) that depends on threshold of dead units or number of units on field. E.g. Default is +2/+2."

### How they work (common rules)
- Each is a state skill in the EN5 / EN6 form: **Name N – {…}**. The braces hold what it gains while the condition holds; plain = {+2/+2}, the owner's default. N is the threshold. The bonus comes and goes as the count changes, like Plenty or Last Stand: it is not banked. Health gained this way works like the day / night bonus (EN5's state skills): losing it never kills below 1.
- **"Died this fight"** counts every unit that left the board dead this fight: tokens and Bloom copies count, Structures and cages do not. Revive and Undead do not take a death back. Rescue is not a death (rules 10-19). The engine needs a per-side counter `pl.diedThisFight`, raised in the death sweep. The graveyard cannot be used: tokens leave no card there.
- **"Units on a side"** counts live units on the board (front and back rows on raid boards): not Structures, not cages, not a Parasite riding a host (it has no slot), not loose equipment.
- Read at the moment the unit acts (its swing, shot or skill) and at round start for Health.
- Priced like the other state skills: the braces' points x the measured uptime, added to `EN6_UPTIME`-style tables in `bramblewood-budget.js` once built.

### Uptime, measured
`tools/prop1_threshold_uptime_2026_10_26.js` (the EN6 hand method): 1,500 seeded CPU-vs-CPU fights between decks of 20 random live band cards (bramble 35, open board, day / night cycle, CPU skill 1), counted over every unit-round on side 1's board as combat starts. Output: `docs/balance/prop1-threshold-uptime-2026-10-26.json`.

The share of unit-rounds where the count is at least N:

| Count | N = 2 | 3 | 4 | 5 | 6 | 8 | 10 | 12 |
|---|---|---|---|---|---|---|---|---|
| Units died this fight, both sides | 0.71 | 0.61 | 0.52 | 0.43 | 0.36 | 0.23 | 0.14 | 0.08 |
| Your units died | 0.51 | 0.36 | 0.25 | 0.17 | 0.10 | 0.03 | 0.01 | 0 |
| Enemy units died | 0.57 | 0.41 | 0.29 | 0.19 | 0.12 | 0.04 | 0.01 | 0 |
| Your live units (this one included) | 0.98 | 0.91 | 0.79 | 0.60 | 0.39 | 0.08 | 0.01 | 0 |
| Enemy live units | 0.97 | 0.89 | 0.72 | 0.51 | 0.30 | 0.06 | 0.01 | 0 |
| Live units on the field, both sides | 1.0 | 1.0 | 0.98 | 0.98 | 0.94 | 0.85 | 0.54 | 0.26 |

Other readings:
- A unit lives **4.4 rounds** on average (7,483 units), which bears out the 4-round rule's "typical life".
- These fights last 12.2 rounds (bramble 35).
- Deaths start late: about 0.4 by round 4, 1.0 by round 5, 2.7 by round 7 and 5.8 by round 10, while the field holds about 7 units by round 4 and 10-11 from round 8.

**Judged uptime.** As EN6 did for Plenty, a card built for its condition plays where it holds more often. Where your own deck can push the count (sacrifices and tokens for deaths, cheap units for numbers), the price takes the measured share + 0.1. Where only the enemy decides (Carnage, Beset), it takes the measured share.

Caveat: these are CPU-vs-CPU fights of random decks. Road fights against a fixed deck, and players who hold units back, will differ. As with EN6, re-measure once cards carry the skills.

### The six skills
Names checked against every skill key and label in `arena_app.js`, the engine, `bramblewood-texts.js`, `canonical/skill-costs.json` and the card names in `canonical/cards.json`: none of Requiem, Dirge, Carnage, Muster, Beset or Throng is used. Avoided on purpose: Vigil (a card name), Harvest (map text), Pack, Swarm, Lone Wolf and Legion (taken or a faction name).

Price = 6 points (+2/+2) x the judged uptime. Other braces: their points (2A + H + the skills' own prices) x the same uptime, as `contextS` does.

| Skill | Wording (plain) | N (default) | Measured / judged uptime | Price of {+2/+2} | Fits (theme) | Where (cards, maps) |
|---|---|---|---|---|---|---|
| **Requiem N – {…}** 🕯️ | "While N or more units have died this fight: +2/+2." | 5 | 0.43 / 0.53 | **3.2** | graveyards, the undead, bone-pickers | Cinder Skeleton, Ashbone Ghoul, Skull Vulture; the Ash maps (20-A-1 the Ash Ossuary, 20-A-3 the Lich's Kiln); the proposed Carrion Moors (Map 27) |
| **Dirge N – {…}** 🥀 | "While N or more of your units have died this fight: +2/+2." | 3 | 0.36 / 0.46 | **2.8** | mourners and avengers: elephants, crows, a pack that lost its own | War Elephant (23-8's Marshal Tuskwell), Carrion Crow, Wolfsbane Alpha; Fodder and token decks feed it |
| **Carnage N – {…}** 🩸 | "While N or more enemy units have died this fight: +2/+2." | 3 | 0.41 / 0.41 | **2.4** | scavengers and predators that smell blood | Dust Hyena, Grave-grin Hyena, Stonedrop Vulture; savanna and Pale Desert maps |
| **Muster N – {…}** 🚩 | "While your side has N or more units (this one included): +2/+2." | 6 | 0.39 / 0.49 | **2.9** | packs and armies | Timber Wolf Pack, Glacier Wolf Pack, Wolf Pack Runner, Ant Warrior, Fire Ant Raft, Sergeant Bramblefox; the tundra (Map 17), the proposed Ant Empire (Map 26), the Legion's soldiers |
| **Beset N – {…}** 🐺 | "While the enemy has N or more units: +2/+2." | 6 | 0.30 / 0.30 | **1.8** | the cornered and outnumbered: lone hunters | Lone Grey Wolf, Ravenous Wolverine (both on 17-A-4, the Hollow King); a natural pair with Lone Wolf |
| **Throng N – {…}** 🐜 | "While the field holds N or more units (both sides): +2/+2." | 10 | 0.54 / 0.64 | **3.8** | swarms that thrive in a crowd | Krill Swarm, Lemming Swarm, Carrion Fly Swarm, Cave Bat Swarm; the caves (8-A-4, the Gem Hoarder), reefs |

Notes on the choices:
- **The thresholds put each skill near 0.3-0.55 uptime:** on about half the time, so the bonus is felt and the price stays near a skill-and-a-half.
- **Muster and Throng count the unit itself**, so a card's own text is easy to check on the board (count the row).
- **Beset stays cheap:** only the enemy decides it, and it is on when you are under pressure, which is when +2/+2 matters most. The CPU's lethal guard (EN8-8) means a Beset unit sees more enemies late in the fight.
- **Throng's N is high** because the board fills up (10-11 units by round 8). On a board with fewer slots (a raid row, a small map) N should drop to 8; the card's own N handles that.
- **Introduction:** the two-new-skills-a-map rule holds, and Maps 21-40 introduce no new skills (rules 10-21 RP). So these arrive on Maps 0-20 cards that swap a skill for one (Requiem on Map 20, Muster and Beset on Map 17, Throng on Map 8), or past Map 40.
- **Show on the board:** the state-skill chip lights up while it holds, as Plenty's does, with the count on hover ("Requiem: 4 / 5 died").

### Why these six
Two counts (deaths and units) x three sides (both, yours, the enemy's) cover the owner's examples. Each has a clear home:
- deaths of anyone: graveyards and the undead;
- your own deaths: mourning and vengeance;
- enemy deaths: scavengers and predators;
- your units: pack and army animals;
- enemy units: the ones that do best when outnumbered;
- the whole field: swarms.

The owner can also pick a smaller set (Requiem, Muster and Throng are the three plainest).

### Options (the owner's call)
- **A. All six, +2/+2 by default, at the thresholds above (recommended).** At most two new skills a map: on Maps 0-20 cards that swap a skill, or past Map 40 (Maps 21-40 introduce none).
- **B. Only Requiem, Muster and Throng** (one per count). Fewer words to learn.
- **C. A scaling form instead of a threshold:** +1 Attack for every K deaths (or units), capped. It reads as Swarm does, and is harder to price and to read on the board.
