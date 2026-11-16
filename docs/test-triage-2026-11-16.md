# Unit test triage, 2026-11-16 (package TESTFIX5)

Source: the GitHub full run on main (47 failing). Not triaged here: lab-errors-2026-11-12 and mapfx1-2026-10-31 (CI environment), skir1-2026-11-11 (its 36 deck-rule failures are balance work). The other 44 were run one at a time on batch-1023e plus this package.

**Result:** 7 of 44 pass now; failing checks 664 -> 375 (440 -> 151 without unit-themes, which needs one regenerated file). Smoke: 4 passed, 3 cached.

Classes: **a** stale check (a later owner decision or package changed the value on purpose; the test now checks the current rule, with a dated TESTFIX5 comment). **b** real bug in the game or a tool. **c** waits on a card or data call: *card* = card stats, skills or rarity (the owner's redesign); *list* = the owner's map lists or rewards; *deck* = road / PvP decks (balance work, like skir1); *bal* = needs a balance re-measure; *art* = card art.

| Test | Class | Cause | Action | Status |
|---|---|---|---|---|
| bal12 | a, c card | Inspiring owner-priced (ENG27-7); Nautilus Drifter's Lumber is a Delivery since ENG39 | 2 checks fixed | 1 left: 33 in-play cards outside the band (BAL12 refit tool) |
| bal13 | a, c list | 14-A-BPRO-3 gone (SKIR1 rebuilt the PRO decks); Siege Rhino priced for Map 23 but on the owner's Map 15 / 16 lists | 1 fixed | 1 left: Siege Rhino in 12 decks (Maps 15, 16, 11-UC) |
| bal14 | c bal | 78 of 255 skill items have no bramble-15 measure (ENG39 / ENG40 items: Delivery every round, Swarm Ants, Thanatosis ...) | none | 1 left |
| bal2 | c card | Caldera Wyrm 4/7 over at Level 1 (30.65 vs N 28.39) | none | 1 left |
| bal21 | c list | Siege Rhino, as bal13 | none | 1 left |
| bal3 | a, c deck | 18-A-9 at Level 3 is SIDE2-4 e (BALREL1) | exception added | 1 left: 13-4 and 20-4 boons off, 21-3 has 8 cards |
| bal7 | a, c deck | the lists are the owner's 11-13 picks (LIST1), not 11-12 | source updated | 1 left: K14 broken on 47 fights |
| bal9 | c list, card, deck | 14-2 holds cut Ant Hill; 44 reward slots and 5 rarities off the lists; 33 cards outside the band; no Guardian on the m7, m10, ml, m6 lists | none | 5 left |
| bf5 | a, c card | BF6 took the Huntsman's Poison; Moon Jelly and Cave Bat Swarm as the owner set them; owner-edit rows changed later | 4 fixed | 3 left: 61 cards over UI27-4 a's two-skill count, Level 1 overages, 6 under 60% of N |
| budget2 | a, c card | re-fit cards changed again later (owner edits, CONTENT11-1) | later lines accepted | 2 left: Woodpecker Sapper 1.08, Beaver Lumberjack 1.11, Earthworm 0.56 of N, and others outside the band |
| bx | c card | Greyplume Fledgling 69.5% of N vs Otter Kit 81% | none | 1 left |
| card-pool | a, c card, list | notes keep budget-v3 numbers after later budget steps; BF6 took the spider's Poison | 2 fixed (87 checks) | 24 left: 9 rarities vs the 10-19 placement map, Banded Sea Krait lacks Tide, 6 cards on the post-balance queue now fit, 4 pool cards' notes, Old Sturgeon 75% |
| content12 | c card | identical lines: Plains Zebra / Snowshoe Hare, Village Miller / Farm Dog, Pine Marten / Fishing Cat | none | 1 left |
| content14 | c art | Legate of Rivergate, Gold-throat Elder: no art | none | 2 left |
| content15 | c art | Oathsworn Legionary, Cobalt Talon Honour-guard: no art | none | 2 left |
| content16 | c list, card | canonical/pack-plan.json (a proposal) predates the 11-13 lists; 3 basic adds over budget | none (needs `tools/content16_pack_plan_2026_11_07.js` re-run) | 9 left |
| df3 | c deck | 13-4 deck 5/14 for Wild Rage, 20-4 0/20 for Restless Dead | none | 2 left |
| easter-eggs | c card | Exo-Podas 33.61 vs N 31.37, Tobasco Drakon 29 vs 22.21 | none | 2 left |
| eb | a, c card, deck | 0-3 no longer holds the Chipmunk Skirmisher; the 10-23 run judged against today's moved targets | 3 fixed | 2 left: starter top-up order (Otter Kit 2/4, Meadow Frog 2/3 under 7), 1-5's Badger Lumberjack off Map 1's list |
| en2 | c card | Ironclaw Fiddler 39.78 vs N 36.8 | none | 1 left |
| eng10 | a, c card, list | Armor re-set as a measured canon (SKILL2 / BAL12); Pulverise re-priced (BAL32); ENG39 skill kinds; Old Sturgeon owner edit | 6 fixed | 3 left: Wolf Pack Runner over, Ravenous Wolverine and Cinder Skeleton obtained at Map 22 |
| eng21 | a | Inspiring owner-priced (ENG27-7) | fixed | pass |
| fin2 | a, c card | sbCheck has the SIDE2 signature | fixed | 2 left: Armadillo Guard 21.93 vs N 19.34 |
| fix6 | a | REF6 re-run (11-14) rebuilt Reference (Random); 4-5's leader is Shoal Shark | fixed | pass |
| gd2 | a, c list | a card's source.map is its first list (SKIR3) | fixed | 1 left: Honey Badger Fury unattainable but on the m3 / m11 / m21 lists and 19-1's first-clear card |
| gi | a, c card | Detonate / Brittle re-priced (BAL32); ui.log-detonate removed (TESTFIX3) | 3 fixed | 3 left: Glasswing Moth, Frostmoon Howler, Weathervane Swift over |
| lead | c deck | 9 fights' `leaders` override names a card their rebuilt deck dropped (5-2, 7-2..7-5, 18-2, 20-1, 2-A-5, 17-A-3) | none | 10 left |
| level-curve | a | BAL19-1 lowers Shield as a lever (137 fights); BALREL1 set 13-4, 2-1, 2-B-1 | limit counts raises; owner exceptions | pass |
| n221 | a, c list | cards the owner's lists cut need no N221 home | fixed | 1 left: 5 Maps 21-24 pack cards off their map's list; Grovebearer's Sturdy |
| opt2 | c card | MAP-tier rarity over cap: Dolphin Knight (mb, m2), Phoenix Mushrooms, Tide Spirit, Caldera Snow Leopard | none | 1 left |
| pale-desert | a, c card, bal | opens after Map 19 and plays its deck (DV7, PREF-3); boon / Quicksand rules; dated Shields; Regen +2 (ENG24); placement by the lists | 26 checks fixed | 21 left: stored measure stale (re-measure), Sandfish and Rabid Jackal over |
| prayer | c card | Friar Badger 19.52 vs N 17.88 | none | 1 left |
| pvp1 | c deck | 4 PvP test decks hold cut cards (Talus Pika, Cinder Stoker, Ant Hill, Box Turtle) | none | 5 left |
| ref6 | a | TIP2 reworded the tooltip | fixed | pass |
| review1 | a | TESTFIX3 removed three unused keys | fixed | pass |
| rewards-pass | a, c list | DV's gates (Very Rare Map 20 + Volcano Lair, side maps re-gated); RW5's pool hooks; cut Devilry / Ecclesia cards | 10 fixed | 5 left: Anvilwhisker Otter, Map 0-1 rewards with skills and 5 fights with none, The Canopy 3 and Volcano Lair 2 unique rewards |
| road-rarity | a, c deck | CONTENT14 extended the faction filter | fixed | 9 left: 20-A-4's Ashmantle Fiend, Maps 21-24 decks under a quarter Rare |
| skills2 | b | a hidden editor entry labelled "Venomous (old)" | label "Old Venomous" (arena_app.js) | pass |
| tut2 | c card | Cottontail Level 1 3/1: 12.23 vs N 11.75 | none | 1 left |
| thematic | a, c list, deck, bal | 10-19 placements moved by DV and the owner's lists | fixed (102 checks) | 5 left: Rock-pool Starfish, Razorbill rewards; T-2 / T-3 uncommons; Map 3 off-theme cards; stale measure |
| ts-status-chips | a | UI53: a count of 1 shows the icon only | fixed | pass |
| ui29 | c list | counts from the stale pack-plan.json (content16) | none | 16 left |
| unit-themes | b, c card | canonical/unit-themes.json is stale; `node tools/unit_themes.js` takes 224 to 163 (a 9.7k-line diff to a canonical file, so it was not applied here) | none | 224 left; after a regenerate: 14 creatures without a biome, 4 without a family, Dire / Elder bodies vs budget |
| winrate-panel | a, c bal | BAL35-1 a's own targets; Clovermead opens after Map 12; Pale Desert plays its gate's deck | fixed | 3 left: docs/balance/skirmish-pass-decks.json (10-28) differs from the game's Map 13, 14, 17 reference decks |

## Counts
- Stale checks fixed (a): 24 tests, 288 checks. 7 tests now pass (6 stale, 1 bug).
- Real bugs (b): 2. Fixed: the "Venomous (old)" label. Not fixed: canonical/unit-themes.json needs regenerating (outside this package's files).
- Waiting (c), 37 tests still failing: card budget or skills 20, owner lists / rewards 11, decks 9, balance re-measure 4, art 2 (a test can be in several).

## Also found
- ENG9-9 (owner: Armor 5 about 10x Armor 1) is no longer what the price does: SKILL2 / BAL12 re-set Armor from its measure (Armor 5 6.83, 2.9x). The test now checks the canon; if the owner still wants x10, that is a new call.
- Honey Badger Fury is unattainable yet listed on three maps and is 19-1's first-clear card; Razorbill is 3-7's reward but on no list.
