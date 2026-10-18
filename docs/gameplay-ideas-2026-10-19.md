# Gameplay ideas (2026-10-19)

This started as a check of Codex's backlog and now adds our own ideas. The detail is in `gameplay-ideas-2026-10-19.xlsx`:

- **Maps, Skills, Field Effects:** each Codex row with a Status, what we have now, a verdict and an action. Rows marked *Ours* are what Codex missed.
- **Synergies:** 30 ideas of our own.

These are documents only; no game code changed.

## Codex's backlog in brief

| Sheet | Rows | Exist | Adjust | Propose | Future | Dup | Reject |
|---|---|---|---|---|---|---|---|
| Skills | 303 | 125 | 8 | 8 | 28 | 111 | 23 |
| Fields | 77 | 19 | 5 | 3 | 22 | 21 | 7 |
| Maps | 22 | 11 | 5 | 4 | 1 | – | 1 |

- **Maps 0–20:** Codex's names and numbers match ours. It misses the side maps, Maps 21–24 and the hidden fights.
- **Already built:** collision (the Wave crash), Pull and push (Wave, Tornado, Converge), Rockfall (Landslide) and water with lightning (Wet).
- **Worth taking:**
  - Spore Cloud (7);
  - Thunderstorm (10);
  - Ash Rain and Ashy on Ashen Spurn (19), placement only;
  - Proliferate and Detonate Poison (5–6);
  - Executioner;
  - Field Breaker;
  - Tangled Roots (9);
  - Brittle (18).
- **Rejected:**
  - Isolation, which fights Lone Wolf;
  - Rescue Chain and Death Spiral, which risk loops;
  - Metal fields;
  - feel-bad curses;
  - Darkness on Sunken Hollow;
  - name clashes: we keep our own Evasive, Expose, Charge, Nullify, Renewal, Haunted and Dawn, and Awash stays Wave.

## Top 10 synergies

Implicit synergies combine without naming each other. Explicit synergies name another keyword, status or tribe. Costs use `canonical/skill-costs.json` (trigger weight × action value). "0 new" means the idea only combines skills the cards already pay for.

1. **Rain Conductor** (implicit, data, 0 new): Rainmaker Frog's rain makes everyone Wet, so Storm Heron and Voltaic Eel deal more lightning damage.
2. **Shatter the Arrivals** (implicit, data, 0 new): under Freezing every unit arrives frozen, so Walrus Icebreaker's Shatter hits each one. Wolfsbane Tundra (17).
3. **Wave into the Web** (implicit, data, 0 new): Webbed units can't be pushed, so a Wave crashes into them and both sides take damage. Gallery Orb-Weaver with Tide Pool Crab or Moray Ambusher.
4. **Bramble Bait** (implicit, data, ~1): Taunt forces attacks into Thorns. Sheep beside Quill-Thorn Boar, or a Taunt + Thorns hedgehog. Briar Maze (12).
5. **Guardian Relic** (implicit, data, ~1): a Relic keeps plain keywords, so a Guardian Ecclesia unit leaves a 1/1 Guardian behind.
6. **Prayer Bastion** (implicit, data, ~1): a 2/24 Prayer 1 wall keeps its tokens alive for Worship (Hymn Wren, Cathedral Eagle).
7. **Hunter (status)** (explicit, small engine, ~1): one keyword with a picker, +N against Poisoned, Bleeding, Wet or Exposed units. It replaces five Codex "exploit" keywords.
8. **Kin Rally** (explicit, data, 2.5 × 1): On Ally Played (Kin), that ally gets +1/+1. For Otters, Ducks and Hummingbirds.
9. **Pack Howl** (explicit, data, 2.5 × 1): On Ally Played (Wolf), Bleed 1 on the enemy facing it. Alpha Howler, Wolf Pack Runner. This gives Wolfsbane its wolves.
10. **Prayer Ward** (explicit, small engine, ~1): Armor 1 while the unit holds Prayer tokens.

The sheet has 20 more, such as Herding into the Ambush, Many Hits on the Marked, Feverish Leech, Timber Baron, Duck Squadron, Bolt Master, Brood Mother, Vigil Keeper and a Bloom When pass for each biome.

## Our additions

- **Skills:** Hunter, Kin Rally, Pack Howl, Prayer Ward, Vigil Keeper, Brood Mother, Bolt Master.
- **Fields:**
  - Blood in the Water (Coral Current);
  - Pollen Drift (Clovermead 1-A);
  - Spring Rain on The Canopy (14-A);
  - Hallowed Ground (the Quiet Summit boss only);
  - a rule of at most two field effects per fight. Fight 22-8 and the Map 20 elites go over it.
- **Maps:** a suggestion for each of Maps 21–24 and the side maps.

## rules.txt

**We already follow:**
- Triggers are primitives.
- Bounty is unchanged.
- Tokens fire On Ally Spawn, not On Ally Played.
- Relic is no spawn at all.
- A unit's own death is not an ally death.
- A heal of 0 fires nothing.
- Nothing triggers on gaining resources.
- Revive is not a death.

**We differ on purpose:**
- Positioning already exists.
- Darkness is on Maps 8 and 2-B.
- Cure takes Poison only, and heals stanch Bleed only.

## Open questions

1. **Loop cap:** only the death sweep is capped (6 passes). Do you want a trigger-chain cap? Codex suggests 5.
2. **Tokens:** they fire On Death and On Ally Die, so swarms can flood triggers. Keep that?
3. **Esprit:** it counts Kin tokens as well as played cards. Keep?
4. **Simultaneous triggers:** they run in board order. Make that a rule?
5. **Evasive:** Codex says skills only. Ours dodges half of attacks and skills. Which did you mean?
6. **Enemy graveyard exile:** our action only takes cards from the owner's own graveyard. Allow enemy cards too?
7. **Kin Rally:** should a trigger be able to target the played card? If not, it buffs a random Kin.
