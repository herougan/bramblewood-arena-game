# Project state: the settled rules

What the owner has decided and the game has (or will have), one line each. A new chat reads this before it proposes a rule, so it does not re-ask what is settled.

How to read it:
- The id in brackets is the decision in `docs/decisions.json` (status DONE). `rules 10-19` means one of the dated owner directions in that file's `rules` list, which carry no id.
- The file after the id is the canonical source. Where a source is the engine or the budget, this page says so and does not restate its numbers: read the file.
- **Decided, not built yet (action item X)** marks a rule the owner has answered but the game does not follow yet. Until that item ships, the engine, not this page, is what the game does. Those lines name the action item in `docs/action-items.md`.
- This page is a map of decisions, not a second source. When it disagrees with `canonical/cards.json`, `bramblewood-budget.js`, `bramblewood-engine.js` or `docs/decisions.json`, those win and this page is wrong: fix it.
- Dated balance docs (`*-2026-10-*.md`) are history; the numbers in them are not rules.

Rules the owner stated in playtest notes that are not decisions yet (10-25 22:36, items G1-G26) are listed once at the end, under "Stated, not built".

## 1. Combat and damage types

Source for all of it: `bramblewood-engine.js` (the engine decides); player wording in `bramblewood-texts.js`; `docs/effects-catalogue.md` only describes.

### Damage types
- **Kinds of damage:** physical, magic, true, the elements (fire / heat, frost, shock, poison, acid, water, decay and the rest) and status ticks (Poison, Bleed). The engine's damage function holds the order of steps. [EN8-2, built form; `bramblewood-engine.js`]
- **Armor (owner 10-25 17:53): elements count as physical, so Armor applies to them; only magic (and dark / holy) passes Armor; Magic Armor stops magic only; true damage passes both.** Armor (and Shell, the tide's Armor, Prayer Ward, Shieldwall) works on swings (a swing, a prong, a counter) and on arrows and spits (ENG9-6); Missiles, Fireballs and the other damage skills still pass it. Every "bolt" is magic; the physical elemental spits read Cinder / Acid / Venom / Ice / Spark ("Spit" dropped, ENG9-3; Ember is a gem and Frost a skill, so Cinder and Ice). Pierce N cuts Armor only. **Built (ENG9, ENG10, 2026-10-26).** [EN8-2, ENG9-3, ENG9-6; engine `isMagicDmg`, `damageCardFlat` `fo.armor`]
- **Armor is priced slightly exponentially:** 1.68 x N^1.43, Armor 5 = 10x Armor 1 (owner: "5 armor nullifies most damage - ~>10"); the cards on the old line were re-fit both ways and the two held ones cut. **Built (ENG10, 2026-10-26).** [ENG9-9; `canonical/skill-costs.json`, `docs/balance/eng10-armor-hits-2026-10-26.json`]
- **Exact numbers inside, one rounding at the end.** A hit is rounded once, half up, when it lands on the board; nothing rounds while it passes between functions. A half of 1 is 1, so Resist, Ghost, Atheist and the Psychic Dampener never stop a 1. [FX2, FX2-3; engine `roundDmg`]
- **Status-type attacks deal only counters, not damage as well:** a "– poison / – bleed" shot or action at a unit gives its N as counters and no damage (at a bramble it deals its N). Poison Barbs N: Thorns that poison. **Built (ENG9, 2026-10-26).** [owner note #40, 10-25 17:53; no decision id]
- **Bleed fades at the round's end, after it bleeds.** [EN3-2]
- **Greater Poison deals 1 per stack each round and the stack never wears down;** only Cure removes it (plain Poison still wears down). [EN4-2]
- **Daunt (Weakness) counters fall off one per damage action** (a swing, an Arrow, a damage skill), not at round end or on other skills. **Built (ENG9, 2026-10-26).** [EN8-11]
- **Cure removes Poison only; Heal restores Health only; Cleanse (Renewal) removes the physical debuffs.** [rules 10-21 SK1]
- **A heal with nothing to heal does not happen:** no animation, no heal trigger, a once-only heal trigger is not spent. Bleed counts as something to heal (it stanches). [rules 10-19, 00:07]
- **Field damage per tick:** every hazard 1 a unit a round; a single-target hazard 2; a rare one up to 3. The volcano is gentler by design (Lava Tide at 50%; one ground fire a fight; after an Eruption it drops to Very Low and climbs one level a round). [FX1, FX3-1, FX3-2, FX3-3, FX2-1, EN-7, FX4-1..FX4-3; the maps' field rules in `arena_app.js`]
- **A unit at 0 Health is dead and leaves the board when its action ends.** [PG-5]

### Blocking and redirecting
- **Guardian redirects plain swings (and, since ENG9, counter-attacks) only.** Not skills, not Arrow, not area damage, not Cleave's side hits. [GD-3, GD2-2]
- **Which Guardian steps in:** one of the adjacent Guardians, at random (the fight's seeded RNG). Adjacent means in front, behind, left, right; front and behind matter only on raid and multi-player boards. [GD-1, GD-2]
- **No chains.** A Guardian never intercepts for an intercepting Guardian. A Guardian aimed at directly is still covered by the Guardian beside it, unless it is itself intercepting. Guardian does not protect the bramble. [EN3-3, EN4-5, EN3-1]
- **Thorns and similar reflected damage cannot be redirected.** [EN8-1]
- **A counter-attack can be redirected by a Guardian.** **Built (ENG9, 2026-10-26).** [EN8-1]
- **Guardian and Rampart work only while the unit is Ready** (not Waiting, Stunned, Frozen, Asleep, Petrified, Chained or Bound): **Built (ENG9, 2026-10-26).** Intercept animations: the blocker steps toward its own Rampart, shakes with an expanding aura, and a unit that dies blocking dies where it blocked. **Decided, not built yet (action item V4).** [EN8-8; owner #33]
- **Spellward (one word) shields allies from skills;** Ward is the dodge. [GD2-1, GD-3]
- **Bulwark's shields give Guardian ("vanguard" meant Guardian);** Bulwark N is priced 6 a point. [EN-3, EN-2]
- **Fortify (key `brambleArmor`; was Bramble Armor): 1 at most with several units.** Rampart and Fortify are the bramble skills' names; Fortify is not Fortification (SK2, builds a Palisade). [EN3-5, EN3-4, FIN2-a]
- **Fog of War is information only,** for both sides: it limits what a side knows, never what a skill can reach. [FOG1, FOG2, EN-8]
- **The second player gets +1 Shield on its bramble and nothing else,** wherever a second-player bonus existed. [D24]

### Triggers and death (the engine's order)
These are the owner's rules of 10-19, pinned by `tests/trigger-layers-2026-10-19.js`; the engine is the source.
- **Trigger chains stop at layer 5** (`TRIGGER_LAYER_CAP`); siblings at one layer all resolve; simultaneous triggers resolve in board order, first player lane by lane. [rules 10-19]
- **A unit killed in a death sweep dies in the next pass,** with its own death effects; units dying in the same pass do not see each other's On Ally Die; a unit's own death is not an ally death. [rules 10-19]
- **Summoned and token units fire On Ally Spawn, not On Ally Played;** tokens fire death triggers. [rules 10-19]
- **Revive is a true death (full death effects); Rescue is not a death at all** (Guardian's step-in and Shield Call fire nothing). [rules 10-19, 00:19]
- **Quiet Contemplation: nothing happens twice** (no Headwind, Twin Strike, Crit doubling). [rules 10-19, 00:19; EN2-4]
- **Freeze:** frozen before its turn, a unit skips this round and thaws at its end; frozen after it acted, it skips its next round. **Confuse:** each trigger, skill and action fails 1 in 2. [rules 10-19, 23:32]
- **Evolute:** only the top card's death effects fire; the type is shared only with the card it sits on; it waits its own Wait plus the base's remaining Wait. [EV-2, EV-3, EV-4]
- **Equipment wears down** (durability by rarity, worn by hits and acid). [EQ-1, EQ2-1]
- **Hardy N: equipment lives on top of durability.** A break (the durability running out, Sunder's or Dismantle's 50%, Pulverise for sure) takes one life; the durability refills; at 0 lives the piece is destroyed. Dragonscale Mail is Hardy 2. **Built (ENG10, 2026-10-26).** [PROP1-1; engine `eqBreakLife`]

## 2. Keywords

Each keyword's price lives in `canonical/skill-costs.json`; its behaviour in the engine.
- **Skills are triggers x actions where they fit;** a new skill is built from an existing trigger and action before a new keyword is added. [rules 10-19 SK1]
- **Skill introduction is gentle and strict: two new skills a map at most; Maps 21-40 use the skills already learnt; new skills return past Map 40.** [rules 10-21 RP]
- **Legendary abilities are a tier of their own** (gold tag, rarely on cards you can own). True Strike still ignores plain dodges but not a Legendary one. [rules 10-18 23:05]
- **Expose strips hiding, Exploit adds damage; Siege N replaces Demolisher; Isolation is a drawback; Punish stays behind a flag (Map 40+).** [rules 10-19 SK1]
- **Hunter N has one status picker** (Poisoned default, Bleeding, Wet, Exposed); Hunter and Executioner add to hits and shots, never to ticks or a bramble. [rules 10-19 GI]
- **Bloom:** the copy can bloom; it tries to create the new unit adjacent, and up or down on multi-row boards. [BL-1, BL-2]
- **Bloom with no free slot fails:** the split animation turns slightly reddish, then the unit gets +1/+1 instead (no Lumber paid); Bloom starts "testing" only when the unit is Ready. **Built (ENG9, 2026-10-26).** [EN7-2]
- **Cleave's side hits spread Poison and Bleed;** priced by the 4-round rule (0.6 of the status's price on top). **Built (ENG9, 2026-10-26).** [EN7-3]
- **Dive stays as built (area damage still reaches a diver); a Quick creature can Dive and loses Quick while aloft or under.** The Quick part: **Built (ENG9, 2026-10-26).** [EN7-1, EN7-4]
- **Undead (passive) brings the unit back once as a token; Revive N (action; the keyword is On Play: Revive N) returns random graveyard creature cards as real cards.** **Built (ENG9, 2026-10-26).** Revive is on no card yet (call ENG9-1). [owner note #20, 10-25 17:53; no decision id]
- **Poison Barbs N: Thorns that deal poison** (never redirected; a Guardian doesn't step in for it). **Built (ENG9, 2026-10-26).** [owner note #40]
- **Detonate N: the target's Poison ticks N times at once, each tick removing a counter, animated in a row.** **Built (CONTENT3, 2026-10-26)**; priced 0.2 a tick. [owner 17:53 message; no decision id]
- **Hoard is taken; the hand-count skills are Full Hand N and Lean N.** Plenty stays at 4+ cards. [EN6-1, EN6-3, EN6-5]
- **Backstab also triggers on a target that is Waiting, Shocked or Exposed.** [EN-5, D21]
- **Swarm counts other allies only; Swarm by Type counts the Type tree.** [UI4-2, EN2-6]
- **Headwind doubles Shots, Snipe and On Action; Tailwind is Quick.** [EN2-3, EN2-4]
- **Nocturnal "at night only" counts Twilight as night.** [CX1]
- **The dark places are night for Nocturnal / Diurnal:** a fight with its own darkness (Darkness, Pitch Black, Absolute) counts as night for the time-givers; a Nocturnal unit sees in the dark there; a Diurnal one gets no bonus and stays dark-blind. The real phase (pill, dawn, moon, Night-blind, Sun-shy) is unchanged. **Built (ENG11, 2026-10-27).** [owner K6, 10-27 11:22; no decision id]
- **Scorching burns only by day (Twilight too); where the fight has no day or night it burns every round.** **Built (ENG11, 2026-10-27).** [owner K10, 10-27 11:22; no decision id]
- **Coffee N: every Nth round the unit acts it acts twice, then it is Stunned a round** (replaces Wait −N on play); priced 1.5 / N by the 4-round rule; on the Buzzed Chipmunk (Map 5) and the Honeyjoe Brewer. **Built (ENG11, 2026-10-27).** [owner K2, 10-27 11:22; no decision id]
- **Seasons run 6 rounds each.** **Built (ENG9, 2026-10-26).** [EN6-4]
- **Skills that read "?":** Stem (Fodder was its name on the babies) and Chrysalis read "?" before Map 15, then show the name with "?" for the effect until Map 20 (`SKILL_REVEAL_MAP` nameFrom). **Built (ENG9, 2026-10-26).** [EN8-4]
- **Wildpath perks and brambles that mend say "Repair Bramble."** **Built (ENG9, 2026-10-26).** [EN8-3]
- **A named keyword for "On Ready: gain N Lumber": Stockpile N** (Forager is too close to Foraging; call ENG9-2), on the Beaver Lumberjack. **Built (ENG9, 2026-10-26).** [EN6-6]
- **Gem sockets: taking a gem out gives it back;** gem fusion and a very rare Socket N skill. **Built (CONTENT3, 2026-10-26):** Socket N adds N sockets to each copy (priced 0: gems sit outside the budget; on no card yet, call CONTENT3-4); two gems of one kind fuse into a Greater gem (twice the bonus) at the Forge's Socket tab for 30 Dust (a placeholder). [H1-a, H1; gem effects sit outside the budget, `docs/workflows/balance.md`]
- **Equip Time N (default 1) with a top-right badge; Tamper-proof equipment cannot be stolen; a Platform card type (Structure rules for now).** **Built (CONTENT3, 2026-10-26):** Equip Time is the piece's `equip.turns`; a Platform card carries Structure too; the Mother Carrier (Heroic, awaiting a source) is the first. [owner notes #21, #22; destroying equipment waits on OWN-Q2]
- **Bound (OWN-Q1):** a Bound unit can't move (no Intercept, Guardian, Rampart, Dive, Charge) and loses Flying's dodge; its swings, arrows and ranged actions deal half damage. Only Strangle binds now (Tangleweed lays Tangled). **Built (ENG9, 2026-10-26).**
- **Pulverise (OWN-Q5):** ignores Armor, breaks Armor / Magic Armor and takes one Hardy life of the equipment it hits, double damage to Structures. **Built (CONTENT3, ENG10, 2026-10-26)**, priced 2.1; on no card yet.
- **Sunder (On Hit) and Dismantle (On Play):** 50% to break one Hardy life. **Built (ENG10, 2026-10-26)**, priced 1.0 and 0.5; on no card yet. [PROP1-1]
- **Threshold skills, Name N – {…} (plain +2/+2):** Requiem (deaths, both sides, 5), Dirge (yours, 3), Carnage (the enemy's, 3), Muster (your units, 6), Beset (the enemy's units, 6), Throng (the field, 10); priced by measured uptime (`bramblewood-budget.js` thrS). One card each on Maps 0-20. **Built (ENG10, 2026-10-26).** [PROP1-4]
- **Wakeful (G5): it never falls Asleep** (a Sleep hit, the Spore Cloud). **Built (CONTENT3, 2026-10-26)**, priced 0.5; the Sleepless Shrew, 7-4's first-clear card.
- **A Sandstorm is a Storm for Storm cards; the blinding Sandstorm (`sandstorm: 'blind'`) makes every unit Blind but Dry / Keen Sense / Sonar ones.** **Built (CONTENT3, 2026-10-26)**; on 18-4. [owner EN8-7 / C4]
- **Gorge (the old Fester key):** a hooked Parasite feeds a second time at round end, at half its Attack; the Gangrenous Leech is a Parasite with it. **Built (ENG10, 2026-10-26).** [OWN-Q4, PROP1-3]

## 3. Resources

- **No free Lumber income.** Lumber comes from cards that give it or draw, the day/night cycle and field cards; the trickle setting was removed. [B4]
- **Resources are a strategic move:** a cheap strong card is a design tool (its strength is tempo); costly cards need an economy the opponent can attack. [rules 10-19 SK2b]
- **Three tiers, each paid with the one below** (Milling gives Lumber, Quarry pays Lumber for Stone, Smelter pays Lumber and Stone for Metal); a trigger can carry a price and fizzles free. [rules 10-19 SK2b]
- **Lumber gatherers per biome, plus Stonecutter, Prospector, Felling, Scavenge, Salvage, Coppice, Windfall, Driftwood;** all built, default value 1. [LUM-1, EN8-5, CONTENT2-1, CONTENT2-2]
- **Pearls** (from Pearl Bed, On Ready, once) pay 1 Lumber or 1 Stone, only when you are short. [EN8-6]
- **More Lumber and draw mechanics are wanted** across the road (OWN-C6). CONTENT3 (2026-10-26) added two Lumber gatherers (Sunken Hollow, Sable Swampmire) and the first two draw cards in any map pool (The Long Grass, The Briar Maze). [CONTENT2-4]
- **Energy:** items roll 2% per Energy a fight cost, 3 a day, fight drops only; a capsule gives 8 Energy and is a first-clear reward about every three maps. The curve is in the game (`arena_app.js`, `ENERGY_*`, `STAMINA_PLACES`); hub 📈 Curves tab shows it. [EB-4, EB-5]
- **Krooni are retired for now** (nothing spends them). Many currencies are fine as long as each shows only where it matters. [E9, T4]
- **Disenchant values and the Forge costs are in `canonical/upgrade-costs.json`** (editable in the hub's 💰 Upgrade costs tab); Base and Quest cards cannot be disenchanted. [E2, E5, RW3-6, UI4-1]
- **Raid Tickets:** the Bonus Raid Ticket is sold only when the shop randomly has it and sells out after one; SS notices about once a month, SSS every 2-3 months for a player who full-clears. [RK1, RK2, RK4, RW3-2]
- **No free pack for guests before sign-in.** [E1]

## 4. Progression and rewards

Canonical text: `docs/progression-plan.md`.
- **No Forge before Map 11:** Maps 0-10 are won by deck building. Levels gate by map, not by resources; Base cards stop at Level 4 and pay the full Forge cost; a fight's first-clear card drops 10% a repeat. Source: `ROAD_LEVEL_CURVE`, `BASE_CARD_LEVEL_CAP`, `UPGRADE_COSTS` in `arena_app.js`. [B7, DF-2]
- **Base cards are Level 1; Level 0 is for tutorial base and baby cards trained in the Nest;** faction cards come at Level 0. The Nest lists only baby / egg cards and Level-0 base cards, in two tabs. [PP-3, TU2-2, N1]
- **The stat budget grows with level** (the formula N(L) is in `bramblewood-budget.js`); limit break comes in waves, older cards get a bigger step, and opens at Map 50. [B8, B9; budget]
- **Printed card = obtained card.** Enemy strength comes from levels, decks / synergy and fields, never from altered stats. [B10]
- **Skirmish rewards are never pack cards.** Every card is exactly one of: a skirmish reward, a pack card, a faction reward, or a raid / smith / nest / base / quest / secret / Easter egg / materia card. [rules 10-21 RP; `canonical/cards.json` `source`]
- **Every skirmish pays one of four things:** a pack of that season, a faction pack, a skirmish-exclusive card, or a card of the season's pack. 1-2 skirmish exclusives a map (3 at most), by how many new cards the map has. Skirmish exclusives have priority over pack placement. [GD2-3, GD2-4, GD-5, DV3]
- **First clear only:** Map 0's sure card comes with the first clear; repeats roll the drop. A first-clear fight rolls no extra drop. [PR-1, RW2-1, GD-6]
- **Card drops scale with Energy** (about 1% an Energy, plus 1-4% on fights with shields); skirmish drops use the basic pack pool only; rarity shares by map. [RW2-3, RW-2, RW-3, RW3-1]
- **Bosses count as elites for the card-reward rank; the cap is S, SS / SSS only for challenge missions;** one challenge card per four maps from Map 4. [RW-1, RW2-2]
- **Packs are completely random:** no map or rarity gate, no memory of earlier packs. A map ends with a pack of 3 and a faction pack. [DV4, RW3-3, RW5-1]
- **Pack tiers:** Pack 1 Maps 0-6, Pack 2 Maps 7-13, Pack 3 Maps 14-20; Pack 4 Maps 21-27, Pack 5 28-34, Pack 6 35-41. [PP-1, N221-1; `canonical/cards.json` `source.tier`]
- **Faction rewards climb from the lowest rarity** by cards received; no faction Rare before Map 14; Otters and Hummingbirds end up symmetric. [rules 10-21 RP, PP-2, RP2, DV6, RP4, RW5-2]
- **The rarity ladder past Map 20:** Epic 22, Heroic 25, Unique 30, Legendary 40, Mythic 60; Ancient, Divine, Void and Daemonic never appear on the road. Source: `RARITY_INTRO`, `ROAD_MAIN_FROM` in `arena_app.js`. [DV1, DV2, DV5]
- **Decks:** a card's copies follow the ladder 5 / 4 / 3 / 2 / 1 by rarity, with per-deck Legendary 3 and Mythic 2 caps; enemy decks follow it too; a main deck is chosen explicitly and a played deck is 20 cards. [PG-1, PG-6, E8, PG-3; BAL2 owner 10-23 22:23 #4]
- **Shiny:** 0.5% for every card received; pack foils 1 / 1.5 / 2%; Easter eggs 0.05% from Mystery Boosters. [E6, RW3-4, RW3-10]
- **Hero levels need a third of their XP from Materia.** [SX-2, H2]
- **Dungeons are hidden from players (Admin Mode only).** The Group Dungeon moves much further ahead (about Map 16), named after its own theme. The hiding and the Arena's Co-op tab are built; the move and the themed name: **decided, not built yet (action item B3).** [PL2-1, PL2-2, PL1-3]
- **A lost or drawn fight gives at least 1 XP** (not on a free replay). **Decided, not built yet (action item F4).** [owner note #1, 10-25 17:53]
- **Level reward track:** Level 0 at the start, Level 1 after the tutorials; Levels 1-5 give single cards; from Level 5 packs alternate faction / Pack 1, later Pack 2. **Decided, not built yet (action item B1).** [owner note #3]
- **The XP curve is to be re-fitted: a gentler exponent and a stronger linear part** ("so ez to reach level 15. But 15-25 was a drag"). The hub's 📈 Curves tab shows the current curve. **Decided, not built yet (action item B2).** [owner note #52]

## 5. Maps and road

Canonical: `canonical/map-pools.json` (card pools), the maps in `arena_app.js`, `docs/skirmish-tuning-guide.md` (the standing design restrictions).
- **The road should roughly always get harder;** at the least it is about as hard as the map before while teaching something. Tolerance and targets: `docs/evaluation-protocol.md`. [DF-1b]
- **The road curve is `roadCurveTarget` / `skirmishTargetBand` in `arena_app.js`;** the numbers are there, not here. Side maps sit a step lower. [owner 10-19 20:39, in the tuning guide section 10; BAL2-3]
- **Use the agreed philosophy and schedule, not hand balancing:** per-fight Enemy levels follow the schedule; the hand-set LEAD levels are gone. [BAL2-1, BAL2-3, BAL2-5]
- **Enemy levels by map:** Map 0 enemies fight at Level 0; the schedule for later maps is `EARLY_ENEMY_LEVEL` and the level intro maps in `arena_app.js`. A challenge skirmish may go one Enemy level up. [EB-3, DF3-2]
- **A map's card pool guides the editor and refuses nothing;** one SPECIAL list per main map is shared with its submaps. [MP-1, MP-3, MP-2, MP-4]
- **Submaps:** one unique card each, the rest cards the player already has; every side map opens at least four maps after its parent. Side-map Rares follow the same Rare-from-Map-10 rule. [rules 10-21 RP, BAL2-2, DV7]
- **Rare skirmish cards start at Map 10;** Map 5's only Rare is its boss's leader; one exception is the Mangrove Kingfisher on 9-6. [PP-2, BAL2-2, RW5-7]
- **Selfish boons from Map 5, on challenge skirmishes only,** on while at least half the enemy deck shares the theme. [DF-3, DF3-1]
- **Skirmish leaders from Map 2, unshown; elites and above lead on every map, shown;** twin bosses lead with 2 (24-8, 23-8). [LEAD-1, LEAD-3, LEAD-5, SK-2]
- **5-7 different cards a skirmish;** a 7 is rare (8 of them stand). [SK-3]
- **Maps 21-40 are stronger versions of the 0-20 animals (and extinct look-alikes); 40+ has dinosaurs; 50+ is magic.** The Maps 25-40 proposal table stands; cards with no home yet stay held. [rules 10-21 RP, N221-1, N221-5]
- **Skirmishes default to Open mode;** Gravity is a special, per skirmish. [G3]
- **Clearing a map moves you to the next one; map progress is kept on this device only.** [PG-4, MAP-4]
- **PRO fights** are for the owner to evaluate a map's cards and never change an existing skirmish; they pay nothing and are not shown to players (banked idea: reveal after Map 40). Rules: `docs/evaluation-protocol.md`. [PRO-1, PRO-2, PRO2-1; owner 10-25 17:53 #27]
- **A side map that opens late fights its own PRO / BPRO decks at the road's enemy level of the map it opens on** (the mean over that map's road fights; Level 1 otherwise). **Built (ENG10, 2026-10-26).** [PREF-3; `proLateSideLevel` in `arena_app.js`]
- **A PvP stranger's deck (Collection PvP) is levelled to your battle rating:** Level = 1 + (your BR / its BR at Level 1 - 1) / 0.31, clamped 1-10 (a fractional level mixes two stat steps); Standard PvP stays at Level 1. **Built (ENG10, 2026-10-26).** [FIX3-4; `pvpStrangerLevel`]
- **Tutorial fights are T-1 to T-5;** tutorial brambles keep 9 and 11 Health, and the editor's value becomes the one used. [TU-1, TU2-3]
- **Raid bosses sit near 20% win rate** and are rebalanced from where players unlock the raid. [RW2-4; tuning guide section 10]

## 6. CPU

Source: `bramblewood-engine.js` (the AI) and `bramblewood-autobattle.js`.
- **The CPU has no side preference and likes the middle lanes;** with no kill or trade it weights slots facing or beside your units. [EN2-2]
- **The lethal guard stays at every CPU level** (from Map 1): when your Ready units would swing into open columns for its bramble's Health and Shield, it plays the unit that blocks the most. [EN8-8]
- **Every level pitches before it plays** (nothing useful: its least valuable card; an unaffordable card with 3+ in hand: a spare). [EN8-8]
- **A bramble's healing heals an ally;** the Wildpath perks that mend stay "Repair Bramble". [EN8-3]
- **The CPU does not save Lumber for its leader,** so costly leaders rarely come out (revisit with the difficulty retune). [LEAD-4]
- **The CPU plays through fog from its own side:** it never sees a fogged unit it could not reach. [FOG1, EN-8]
- **The CPU keeps a Lumber reserve and pitches only to reach it or to afford a high-value card** (it knows its deck's average cost; low-cost decks should not pitch rapidly). **Decided, not built yet (action item A2).** [EN6-3; owner #33]
- **The CPU scores every option each turn (each playable card in each slot, or pitch), Bloom chances included, and takes the best.** **Decided, not built yet (action item A1).** [owner note #26]

## 7. Cards and budget

Canonical: `canonical/cards.json` (stats, skills, art) and `bramblewood-budget.js` (N(L), the stat checks). Fold edits into the file with the fold tools; Supabase `card_overrides`, hub edits and the Card Ledger are inputs, not sources.
- **The budget is v5-halved:** the formula is in `bramblewood-budget.js`, with the Map term 0.2 a map; a card's map is the first main-line map it can be had on, never a submap; faction cards use Map 5 until the faction rewards land. Read the file for coefficients. [B8, B11, DF-1, RP1]
- **Stat caps:** cap 2 stays A*H + S*|S| <= (N/3)^2; Fragile and similar "must be less" qualities multiply by 0.7; a quality priced by a multiplier costs 0 as a skill. [B14, BF7-1, BF7-2]
- **A unit's own Shield N counts as 0.8 x N Health** in both caps' stat terms (not as a skill in S); Shield given by an action or Bulwark keeps its own price. [FIN2-c, owner 10-26 23:46]
- **Price by logic, the 4-round rule:** +1 Attack or +1 Health held over a typical 4-round life is the yardstick; adjust for timing and reliability. Measurement is optional. `docs/workflows/balance.md`. [EN6-2, EN8-5; owner 10-23 20:44]
- **A card has two skills at most,** except thematic creatures; plain Flying, Tide, Diurnal and Nocturnal do not count. [HB2-1; `docs/workflows/card-data.md`]
- **Cards the formula cuts are held at their stats until a balance pass trims a skill;** no blanket halving. [BF11-1, EN3-6, B11]
- **Printed stats are the owner's to tune in the hub;** Bounty is unique and stays where thematic (Beaver and similar lose it). [BF7-3, BAL2-4]
- **Kings:** only the Magnate Duck; Liege is priced 0.3x its braces; Evolute, Alpha and Omega cost 3. [TR-4, TR-5, EV-5]
- **Baby-like cards carry Fodder at Level 1;** they are the only non-Evomax cards with Fodder. [EN-6, EV-6]
- **Easter eggs show as plain cards to an owner;** reached by giveaways or a very low mystery-pack chance. [GD2-6]
- **Held cards stay held:** the Canopy's rainforest animals, the Thistle Baron, Eyrie Heights' theme, and the N221 cards with no home. [RP5, N221-1]
- **Art and names:** art direction in `docs/style-guideline.md`; lore and names in `docs/lore-bible.md`; dogs and cats are neutral, friends of both peoples. [L1, L2]

## Stated, not built (owner playtest notes, 10-25 22:36)

Not decisions yet: they are the owner's words, turned into action items G1-G26. They become rules when shipped.
- **Fork** hits two adjacent enemies among L/C/R (never L+R); the castle only when none of the three is there; Trident and Pitchfork hit the castle only when none of their lines holds an enemy (G2). **Built (ENG9, 2026-10-26).**
- **Sleeping units never swing** (put to sleep, stunned, frozen or chained before its turn, a unit loses that round's swing); Decay is applied and counted, Decay costs 12% more (G4). **Built (ENG9, 2026-10-26).**
- **Tangled: 50% to act** (swings, shots, actions, triggers; the Confused coin), laid by Tangleweed; re-priced 1.4 (G25). **Built (ENG9, 2026-10-26).**
- **One-shot On Ready skills leave the card once spent;** a unit Ready at Wait 0 gets its On Ready on the turn it is played (owner ENG9-7); **Charge recharges** like Reload, and Reload costs more (-6) (owner ENG9-4) (G23, G24). **Built (ENG9, ENG10, 2026-10-26).**
- **Chained prices as a multiplier on the budget** (x(1 + 0.25 a held round), `chainedMult`); it breaks once its damage adds up to N; no lock glyph (G19; call ENG9-8). **Built (ENG9, 2026-10-26).**
- **All packs give 3 cards (Collector's 5); re-cost them** (G15).
- **Forge tabs appear when their feature is earned at a map; Reinforce shows locked "?"** (G18).
- **First-clear reward not yet won shows full colour; already won is greyed with a tick** (G6).
- **Flora is the phylum; Tree, Fruit, Flower, Vine and Mushroom are its types** (the Fungi cards are Mushroom; the types count as Flora everywhere); a joint cost sits side by side with no gap, "/" kept for an alternative cost (none yet) (G9; owner ENG9-5). **Built (ENG9, ENG10, 2026-10-26).**
- **Grasping Briars, a field rule:** one random unit a side Tangled each round (not Flyers or Structures); on 12-4 and 12-7 (owner ENG9-10). **Built (ENG10, 2026-10-26).**

## Where sources disagree

- Dated owner-note ids (#nn, 10-25 17:53) refer to the note list in `docs/action-items.md`, not to `docs/decisions.json`.
- `docs/skirmish-tuning-guide.md` section "Where sources disagree" lists older win-rate targets and rarity constants the game has superseded; the game's code wins.
