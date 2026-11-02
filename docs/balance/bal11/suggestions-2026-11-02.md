# BAL11 suggestions for the owner (not applied), 2026-11-02

Card picks and cuts per hard map that would help the road reach its curve. Claude does not change the lists (BAL-ROLES); these are for the
owner's pass. Evidence: the map's card contribution (`docs/balance/bench-contrib-mapNN-<id>-bpro-2026-11-02-bal11.md`), the weak-deck search
(`docs/balance/bal11-weak.jsonl`, `bal11-weak2.jsonl`) and the road measure (`docs/balance/bal11/road-2026-11-02.md`). "K14-free" = the
weakest deck of the list without BAL7's K14 rule, measured once (40 games).

## The Canopy (14-A, side map of the Savanna) - still 0-5% on every fight
- K14 blocks it: its usable list (9 cards inside the cap, no Baby) is mostly not unique to the map, so 14-A-1 and 14-A-5 have **no** deck of
  their size under K14, and 14-A-3 / 14-A-4 none weak enough (K14-free 50% / 10% against 70 / 60).
- Cut from the Canopy fights: **Siege Rhino** (a Map 23 card, +5.5 a copy over the fair line), **Pangolin Roller** (+4.8), Hercules Beetle
  (priced at Map 18). Keep Hoopoe Herald fewer than 5 copies (2/13 at 0 Lumber; in every fight).
- Pick: 3-4 weak cards unique to the Canopy (Common, 0-1 Lumber, forest / tree animals) so K14 can fill a deck; or decide BAL10-6 b (a
  side map's own list counts as map-unique).

## The Mycelium Deep (7-A) - 7-A-3 20% (target 70), 7-A-5 35-38%
- Cut **Beetle Battering-Ram** from 7-A-3 / 7-A-4 (a Map 23 card, Breach + Siege + Nocturnal on an always-night map: +7.0 a copy over the fair
  line, the top card of all nine maps measured). Fewer **Dung Beetle** copies (20 copies over the map's fights; Decay at 0 Lumber) and Ant
  Warrior (10). Trapdoor Spider (Rare, 4/7 at 0 Lumber) out of the early fights.
- Pick: Compost Grub is a Baby card now; Garden Snail / Earthworm / Rootworm Colony (below the fair line) are the honest weak fillers.

## The Sunken Depths (10-A) - 10-A-4 12%, 10-A-5 25%, 10-A-1 68% (90)
- Even the weakest legal deck stays under the band on 10-A-1 / 10-A-4 / 10-A-5 (67.5 / 10 / 17.5%): the list is costly (Orca, Kraken 3
  Lumber, Colossal Squid 4) and its two Lumber makers (Nautilus Drifter, Coral Polyp Colony: +4.5 / +4.1 a copy) feed it.
- Cut Nautilus Drifter / Coral Polyp Colony from the fights, or Mangrove Manatee (7/7 Guardian, +4.2). Pick 2-3 cheap fish (Silver Minnow,
  Clownfish Scout level) so the CPU decks can be built without the 3-Lumber cards.

## The Pale Desert (18-A) - 9 fights, 47-82%; the bramble is by rule (tests/pale-desert)
- **Trapdoor Spider** holds 15 copies across the desert's fights (+3.9 a copy): cut to one fight. Dune Packrat (+3 Lumber on Ready, +3.5),
  Thorny Devil (1/20 Guardian, +3.4).
- Its list is 6-7 usable cards: the weak search has nothing weaker to reach for on 18-A-1 / 18-A-2 / 18-A-5 (77.5 / 70 / 55% best).
  Pick 2 weak desert Commons.

## Wolfsbane Tundra (17) - 17-6 40%, 17-7 15%, 17-8 25%
- **Walrus Icebreaker** (Very Rare 4/17 Freeze + Shatter: +5.5 a copy, 9 copies in the road) and Glacial Ape King (4 copies in every fight;
  6/40 Guardian Earthquake) carry the elites. K14-free does not help 17-6 / 17-7 / 17-8 either: cut the Walrus to 1-2 fights and the Ape King
  to 2 copies, or a lower bramble Health (BAL10-6 a).

## Basalt Foundry (19-A) - 19-A-1 43%, 19-A-2 45%, 19-A-9 20%
- Echidna Quillshot (+4.8) and **Tide Spirit** (Rare 5/5 at 0 Lumber, +4.2). 19-A-1 has no K14-legal deck of its size (K14-free 70%).
- Pick: 2-3 Foundry-only weak cards (K14 room); cut Tide Spirit from the early fights.

## Caves & Alcoves (8) - 8-1 77%, 8-2 70%, 8-7 52%
- **Vampire Bat** (2/3 Flying, Nocturnal on an always-night map: +3.6), Star-nosed Mole (5/5 at 0 Lumber, 11 copies), Giant Cave Huntsman.
  The weakest legal decks score lower than the current ones here (8-1: 42.5%), so the contribution order does not match the road: the owner's
  pick of the opening fights' cards matters more than a swap.

## The Savanna (14) and the Eye of the Volcano (20-A)
- Savanna: Savanna Cheetah (+3.6), Pangolin Roller (15 copies); 14-5 has no K14-legal deck. Volcano: Ashbone Ghoul holds 31 copies of the
  volcano's fights, Magma Salamander 12; The Contradiction (Epic, +3.9).

## Formula proposals (decisions BAL11-3..5)
- The Map term (and the time-of-day home share) from the earliest map whose list or road deck holds the card (Beetle Battering-Ram, Siege Rhino,
  Hercules Beetle).
- Lumber makers priced by their list's mean cost, measured on the home map.
- A tighter cap 2 for a 0-Lumber, 0-Wait Rare (tempo).
