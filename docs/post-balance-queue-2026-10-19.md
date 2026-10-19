# Post-balance queue (2026-10-19)

You applied the measured skill worth to the cost table this morning (199 entries in `canonical/skill-costs.json` now use
their measured value; each one keeps its old value as `prevValue`). Your own values are unchanged: On Death 1,
On Ally Played 2.5, Bounty 0.5, Supreme, Supreme Tide and True Strike.

Under the new costs, **29 cards are over budget v3**. Every one of them fitted before the costs changed. As you decided
at 08:49 (separate the units by theme, you pick the units for each map, then a post-balance step sets skills and stats),
**they are not refit now**. They wait here for the post-balance step. The Dragons and the Caldera Wyrm are not on the
list: they are over on purpose (your creature-ranks call).

The data is in `docs/balance/post-balance-queue.json`, built by `node tools/post_balance_queue.js`. Until the
post-balance step, the tests treat these cards as known to be over budget. They fail if the list goes stale, for example
when a card is refit or another cost changes.

## How to read it

A card passes budget v3 when **2A+H+S < N** and **A×H+S < (N/3)²**. S is the cost of the card's skills, and N is
its allowance from rarity, Wait, Lumber and level. For a card with Evasive, Swift, Flying, Shadow or Blind, both sides
are ×1.5. All 29 cards fail only the first rule (2A+H+S); none is near the second. **Over** is by how much 2A+H+S is
above N. Taking that much off 2A+H+S (or adding it to N) brings the card back under. The list is sorted by that
margin, largest first.

| Card | Rarity | A/H | Source | S before -> after | N | 2A+H+S | Over | A×H+S / (N/3)² | Largest costs now |
|---|---|---|---|---|---|---|---|---|---|
| Marshal of Rivergate | Epic | 8/26 | pack | 5 -> 19.1 | 51.6 | 61.1 | +9.5 | 227.1 / 295.84 | sweep 13.62; armor 5.48 |
| Orca Vanguard | Common | 9/36 | map:m7:10-5 | 5.5 -> 14.37 | 61.1 | 68.37 | +7.27 | 338.37 / 414.8 | sweep 9.08; tide 2.79; momentum 2 |
| Malachite Golem | Rare | 8/34 | pack | 4 -> 13.19 | 57.1 | 63.19 | +6.09 | 285.19 / 362.27 | shell 8.07; darksight 5.12 |
| Reef Manta Glider | Common | 4/15 | map:m2:4-5 | 2 -> 6.9 | 39.1 | 44.85 | +5.75 | 100.35 / 169.87 | wave 4.11; tide 2.79 |
| Raven Harbinger | Common | 5/18 | - | 2.5 -> 6.76 | 46.6 | 52.14 | +5.54 | 145.14 / 241.28 | poison 6.26; bounty 0.5 |
| Stone Turtle Warden | Common | 4/30 | map:m2:4-4 | 5 -> 13.75 | 46.6 | 51.75 | +5.15 | 133.75 / 241.28 | armor 10.96; tide 2.79 |
| Eyrie Warden | Common | 7/24 | map:mv:11-A-2 | 2.5 -> 6.15 | 61.1 | 66.22 | +5.12 | 261.23 / 414.8 | daunt 3.29; onReadyDamage 2.36; bounty 0.5 |
| Great Gate | Common | 0/28 | - | 4 -> 9.22 | 32.6 | 37.22 | +4.62 | 9.22 / 118.08 | armor 8.22; guardian 1 |
| Ravenous Wolverine | Rare | 1/12 | map:m6:17-6 | 6 -> 19.98 | 29.4 | 33.98 | +4.58 | 31.98 / 96.04 | onAttack → buff 19.98 |
| Humpback Elder | Common | 8/39 | map:m2:4-3 | 6 -> 10.11 | 61.1 | 65.11 | +4.01 | 322.11 / 414.8 | inspiring 4.32; thorns 3; tide 2.79 |
| The Magnate Duck | Legendary | 6/59 | - | 13.5 -> 18.04 | 85.4 | 89.04 | +3.64 | 372.04 / 810.35 | armor 8.22; inspiring 4.32; midas 2 |
| Cave Warlord | Common | 12/58 | map:m11:20-5 | 3.5 -> 9.44 | 87.9 | 91.44 | +3.54 | 705.44 / 858.49 | daunt 6.58; onReadyDamage 2.36; bounty 0.5 |
| Kraken Spawnling | Common | 9/31 | map:mj:10-A-2 | 3 -> 7.14 | 52.6 | 56.14 | +3.54 | 286.14 / 307.42 | fork 5.14; gash 2 |
| Subterraneaner | Uncommon | 8/10 | map:m4:8-5 | 4 -> 12.43 | 34.9 | 38.43 | +3.53 | 92.43 / 135.33 | darksight 5.12; keenSense 4.14; ambush 2.17 |
| Ruby-Throat Duelist | Rare | 1/6 | pack | 3 -> 7.55 | 31.5 | 34.99 | +3.49 | 30.49 / 110.25 | quick 7.55 |
| Gorge Wyrm | Common | 9/45 | map:mx:20-B-3 | 4.5 -> 10.46 | 70.6 | 73.46 | +2.86 | 415.46 / 553.82 | sweep 9.08; earthquake 0.88; bounty 0.5 |
| Ember Revenant | Epic | 7/22 | map:m9:19-A-10 | 4 -> 10.85 | 44.1 | 46.85 | +2.75 | 164.85 / 216.09 | armor 5.48; revive 5.37 |
| Great Horned Owl | Common | 6/21 | map:ml:15-7 | 2.5 -> 5.54 | 55.1 | 57.81 | +2.71 | 197.31 / 337.33 | nocturnal 2.68; onReadyDamage 2.36; bounty 0.5 |
| Permafrost Mammoth | Common | 9/34 | map:m22:22-5 | 5 -> 11.76 | 61.1 | 63.76 | +2.66 | 317.76 / 414.8 | sweep 9.08; nocturnal 2.68 |
| Ironmaw Warwolf | Epic | 9/26 | pack | 5 -> 16.02 | 57.6 | 60.02 | +2.42 | 250.02 / 368.64 | armor 5.48; bleed 5.4; fork 5.14 |
| Dune Jackal | Common | 2/12 | pack | 3 -> 13.3 | 27.4 | 29.3 | +1.9 | 37.3 / 83.42 | quick 7.55; dry 5.75 |
| Colony | Rare | 0/20 | - | 4 -> 6.36 | 25 | 26.36 | +1.36 | 6.36 / 69.44 | onAttacked → spawnCard 6.36 |
| Narwhal Lancer | Common | 7/20 | pack | 3 -> 6.43 | 39.1 | 40.43 | +1.33 | 146.43 / 169.87 | expose 3.64; tide 2.79 |
| Venomlord Serpent | Common | 8/34 | map:ms:5-A-3 | 4.5 -> 12.06 | 61.1 | 62.06 | +0.96 | 284.06 / 414.8 | poison 9.39; ambush 2.17; bounty 0.5 |
| Blind Cave Fish | Common | 1/6 | map:m4:8-2 | 2 -> 7.91 | 23 | 23.87 | +0.87 | 20.87 / 58.78 | darksight 5.12; tide 2.79 |
| Sea Cucumber | Uncommon | 2/14 | map:m7:10-3 | 8 -> 17.52 | 34.9 | 35.52 | +0.62 | 45.52 / 135.33 | regen 6.2; onDeath → poison 4.83; onAttacked → stun 3.7 |
| Grovebearer Dragon-Turtle | Legendary | 6/48 | map:m23:23-8 | 8 -> 36.37 | 95.9 | 96.37 | +0.47 | 324.37 / 1021.87 | sturdy 16.9; regen 9.3; sprout 6.38 |
| Giant Cave Huntsman | Rare | 6/12 | map:m4:8-6 | 6 -> 19.47 | 43.4 | 43.47 | +0.07 | 91.47 / 209.28 | poison 6.26; darksight 5.12; pounce 4.8 |
| Bone Diviner | Uncommon | 5/19 | - | 2 -> 2.74 | 47.6 | 47.61 | +0.01 | 146.61 / 251.75 | onKill → gain 2.74 |

## Notes for the post-balance step

- Fourteen of the 29 are over by less than 3. Bone Diviner, Giant Cave Huntsman and Grovebearer Dragon-Turtle are over
  by under 0.5, so one Health would bring each back under.
- The biggest jumps come from a few skills whose measured worth is far above the old 1-2: Sweep (4.54, half scale:
  9.08 at Sweep 2-3), Armor (2.74 a point), Poison (3.13 a point), Quick (7.55), Darksight (5.12), Sturdy (16.9)
  and Shell (2.69, half scale). An On Attack buff (Ravenous Wolverine) costs On Attack 3 × Buff 3.33 a
  point of Attack.
- **Decision for you:** when the worth was applied, every negative measured value was floored at 0. That includes the
  two payments, Penance and Blood Tithe. They used to be a discount (-1 per point) and now cost 0. Their measured worth
  was negative (-0.21 and -1.18), so the measurement agrees they are a cost to the card, but the floor removes that
  discount. If you want them back as discounts, set them to -1 in the hub's Skill costs tab, or to the measured value.
- The game's Test Lab still has its own default costs (`SB_DEFAULT_SKILLS` in `arena_app.js`), and they are not yet
  the applied ones. Only the balance tools and the hub read `canonical/skill-costs.json`.
