# Skill re-price proposal, 2026-11-08 (package BAL29)

A proposal only. Nothing is applied: `canonical/skill-costs.json` and `canonical/cards.json` are unchanged. Source: the BAL23 skill ladder (`docs/balance/skill-ladder/summary-2026-11-07.json`: 400 paired fights a variant (800 games), L1 and L5, 113 skills, game `e538c9f45c68`). The ladder ran on a frozen copy at the ENG34 merge, before ENG35-37 and CONTENT18. Built by `node tools/bal29/reprice_2026_11_08.js`; data in `reprice-proposal-2026-11-08.json`; the proposed cost table (a copy, for the record) in `proposed-skill-costs-2026-11-08.json`.

**The rule.** Each proposed price is the ladder's **mean** (over bodies, averaged over L1 and L5), not its **best**. The reason is that the cost table is priced in mean points. The canon was set over six carriers of three shapes (evaluation protocol 5a), and the ladder's mean reproduces it: canon Poison 1 / 2 = 2.38 / 4.69 reads 2.56 / 4.87 mean but 4.35 / 8.79 best. Armor, Bleed, Injured and Drunk agree in the same way. Pricing at best would mean changing the unit of the whole table (about x1.7 on every skill). Best is still shown as the ceiling a designer reaches by choosing the Attack/Health split. Numbered skills get `value x N^pow` fitted through the per-N means, so each proposal is a ready table entry.

Because of this rule, 187 "price off" flags shrink to the lists below. Most flags compare the price with *best*.

## Top table: what would move

**A. Clear under-priced (raise).** Old -> **proposed** at each N on the ladder; best is the ceiling. Cards = carriers on Maps 0-20 lists today (cards, side maps, special).

| Skill | N | Cards | Old | Proposed | Best | Conf. | Why |
|---|---|---|---|---|---|---|---|
| inspiring (canon) | 1-3 | 3 | 3 / 3.86 / 4.48 | **3.96 / 5.9 / 7.46** | 8.65 / 13.3 / 15.5 | high | mean 3.9 / 6.2 / 7.3 |
| delivery | 1-3 | 7 | 2.59 / 4.24 / 5.65 | **5.25 / 7.2 / 8.66** | 8.74 / 12.3 / 14.1 | high | priced by the 4-round rule, never measured |
| pickpocket | 1-2 | 1 | 1 / 2 | **5.13 / 5.29** | 10.6 / 10.7 | high | flat in N |
| almanac | 1-4 | 1 | 4 (flat) | **7.95 / 6.91 / 6.36 / 6** | 13.0 -> 10.6 | high | N is a threshold: worth falls with N |
| fork (canon) | on | 3 | 3.89 | **4.95** | 5.77 | high | 4.92 [4.2, 5.7] at both levels |
| twinStrike | on | 2 | 6.38 | **7.75** | 8.36 | high | about the same on every body |
| bulwark | 1-2 | 2 | 3.5 / 7 | **6.16 / 8.53** | 10.3 / 12.4 | high | ENG33 Log Walls |
| fastForward | 1-2 | 1 | 3.02 / 6.04 | **4.24 / 7.39** | 7.9 / 12.8 | high | |
| lumberjack | on | 1 | 3.29 | **4.85** | 8.47 | high | conditional, but reads high even out of context |
| repair | 1-2 | 1 | 0.5 / 1 | **2.93 / 2.97** | 4.7 / 4.8 | high | mends the bramble, flat |
| skitter | on | 1 | 1.44 | **3.5** | 3.93 | high | logic price (Haste x 0.56) too low |
| invisible | 1-3 | 2 | 0.48 / 0.96 / 0.96 | **1.05 / 1.64 / 2.13** | 2.4 / 4.7 / 4.8 | high | |
| overwhelm | on | 1 | 0.52 | **1.05** | 1.53 | high | |
| thorns | 1-4 | 8 | 2.83 / 4.48 / 5.86 / 7.09 | **3.22 / 5.08 / 6.63 / 8.02** | 5.6 -> 13.1 | medium | N 2-3 clear, N 1 / 4 inside the interval |
| scar / scare / berserk | 1-3 | 1 each | 1.7-1.8 / 3.4-3.6 / same | **~2.4 / ~3.6 / ~4.6** | | medium | half-scale step: N 1 and 3 under, N 2 fair |
| speed | 1-3 | 1 | 1.02 / 2.04 / 2.04 | **2.33 / 2.44 / 2.51** | 4.4-4.9 | low | only N 1 clear |
| re-curves (raise low N, cut high N) | | 1-3 each | | avalanche **9.25 / 9.85** (was 6.63 / 13.26); riled **5.87 -> 1.59** (flat 2.4); tally **4.8 -> 1.02** (flat 3.28); scavenge **2.99 / 3.5** (2.27 / 4.54); gash **0.46 / 1.42 / 2.73 / 4.36** (1.15 / 2.3 / 2.3 / 3.45) | | medium-low | price now matches each N |

**B. Clear over-priced (cut).**

| Skill | N | Cards | Old | Proposed | Best | Conf. | Why |
|---|---|---|---|---|---|---|---|
| recoil | 1-3 | 1 | +1 / +2 / +2 | **-3.46 / -5.88 / -8.02** | -1.5 / -3.0 / -3.2 | high (sign), medium (size) | a drawback priced as if it were a skill |
| weaken | 1-2 | 1 | 3.39 / 6.78 | **2.64 / 3.29** | 3.41 / 3.76 | high | N 2 is worth no more than N 1 |
| trap | 1-4 | 2 | 1.49 / 2.08 / 2.52 / 2.9 | **0.4 / 0.95 / 1.57 / 2.25** | 0.56 -> 2.63 | high | even best is below the price at N 1-2 |
| ambush | 1-4 | 2 | 1.44 / 2.24 / 2.9 / 3.48 | **0.59 / 1.42 / 2.38 / 3.42** | 0.93 -> 3.72 | high | N 1-2 |
| tornado | 1-2 | 1 | 1.96 / 3.92 | **1.17 / 1.76** | 1.92 / 3.26 | high | |
| nova | 1-4 | 1 | 2.24 / 4.48 / 4.48 / 6.72 | **1.25 / 2.53 / 3.82 / 5.12** | 1.4 -> 7.8 | medium | |
| bulldoze | 1-2 | 2 | 2.28 / 4.56 | **2.23 / 2.64** | 2.87 / 3.65 | medium | N 2 only |
| daunt | 1-3 | 4 | 2.31 / 3.05 / 3.58 | **1.72 / 2.56 / 3.22** | 1.9 / 3.25 / 3.74 | medium | N 1 clear |
| onslaught | 1-4 | 1 | 2.8 (flat) | **2.98 / 1.84 / 1.39 / 1.14** | 4.5 -> 1.1 | high | threshold re-curve |
| frostbite | 1-2 | 2 | 0.5 / 1 | **0.19 / 0.33** | 0.24 / 0.52 | high | |
| herbalist | 1-2 | 1 | 0.58 / 1.16 | **0.23 / 0.31** | 0.51 / 0.66 | high | |

## Card impact (dry run on Maps 0-20)

The budget check (`tools/skill_costs.js` budget with the pipeline's half-miss swap, BUDGET2's verdict: over = cap 1 or cap 2 broken at the start level or Level 1; well under = cap 1 at or below 60% of N) ran on today's 321 measured Maps 0-20 cards, once with today's table and once with the proposed copy.

| | OK | Over | Well under |
|---|---|---|---|
| Today's table | 295 | 21 | 5 |
| Proposal (A + B) | 285 | 30 | 6 |
| A only | 286 | 30 | 5 |
| B only | 294 | 21 | 6 |
| Alternative: A + B priced at *best* | 274 | 42 | 5 |

**10 cards change verdict**, and each is put back by 1-2 stat points (the refit's smallest change):

| Card | Stats | Skill | S old -> new | Use of N | Verdict | Fit |
|---|---|---|---|---|---|---|
| Field Mouse | 2/5 | pickpocket | 1 -> 5.13 | 0.93 -> 1.25 | over | 1/4 |
| Leafcutter Gardener | 2/4 | delivery | 4.22 -> 6.88 | 0.98 -> 1.16 | over | 1/4 |
| Beaver Lumberjack | 3/5 | delivery | 2.28 -> 4.62 | 0.97 -> 1.11 | over | 2/5 |
| Muskrat Reedgatherer | 1/8 | delivery | 4.16 -> 7.06 | 0.91 -> 1.08 | over | 1/6 |
| Dune Packrat | 2/11 | delivery | 5.71 -> 8.75 | 0.89 -> 1.01 | over | 2/10 |
| Cone-cutter Squirrel | 2/5 | almanac | 8.28 -> 10.28 | 0.96 -> 1.06 | over | 2/3 |
| Mangrove Mudskipper | 1/7 | skitter | 1.94 -> 4.0 | 0.89 -> 1.03 | over | 1/6 |
| Badger Lumberjack | 2/11 | lumberjack | 3.29 -> 4.85 | 0.95 -> 1.03 | over | 2/10 |
| Bramble Sprout | 1/5 | thorns | 4.48 -> 5.08 | 0.97 -> 1.01 | over | 1/4 |
| Granite Ox Golem | 3/17 | recoil | 5.91 -> -1.97 | 0.73 -> 0.55 | well under | 3/20 |

Another 48 cards carry a changed skill but keep their verdict (S moves -1.9 to +3.0): 43 stay inside tolerance, and 5 were already over and stay over (Alley Cat, Cricket Drummer, Hedgehog Scout, Porcupine Roller, Cypress Root Lurker). The proposal fixes none of today's 21 over cards. No named owner card (Dragons, BUDGET2-5, DECK1) flips.

## C. Context skills: keep the price, measure in context later

These read near zero (or below zero) in the global context because they need a field, a partner or a team. They must not be cut on this reading.
- **Partner:** Fletcher (alone 0.2-0.4; **Arrow 1 + Fletcher 1 synergy +7.2 L1 / +8.5 L5**), Relict (+2.9 with Armor), Swarm, Pack Leader, Prey, Hunter, Carrion, Weapon Master, Timbered, Bedrock.
- **Field or map:** Mountain Climber, Dry, Darksight, Illuminate, Tide, Salt, Frost, Heat, Canopy Cover, Dive (reads 0), Moonborn; the time-of-day skills Nocturnal / Diurnal / Crepuscular / Nightblind are priced by logic (zeitS uptime).
- **Team:** Guardian (mean -1.1, best 3.1), Taunt (mean -1.2, best 4.8). Their worth is the ally they protect.
- **Foe-dependent:** Pierce, Shatter, Executioner, Backstab, Keen Eye / Keen Sense / Sonar, Web, Foe Scarcity, Crab Claws.
- **Priced elsewhere:** Carnage / Requiem (thrS uptime; the table value is unused), Hibernate (part of its price sits in its Attack), Reload (an Archer drawback; the test body has no shots).

## D. Changed since the measure: re-measure on the current game

Thanatosis (ENG36 rework), Shield (ENG37 `shield.armor`; the flat 2.53 also misses N: N 2 reads 1.85, N 6 reads 4.04), Shell (ENG37 `shell.when`), Immunity (ENG36 status resistances), and Leech N (`sap`, ENG35), Reach (ENG37 rework, ENG37-2 open), Hoard (ENG36), Constrict (new), none of which are on the ladder. Status resistances also slightly lower the worth of the Poison and Bleed family against resistant foes.

## E. Hold (no move proposed)

- **Fair on the mean, flagged on best only:** Poison 1-2, Armor, Bleed, Pounce, Quick, Regen, Rage, Haste, Mighty, Stealth, Undead, Brood, Foraging, Predator, Siege, Drunk, Injured. The two examples in the brief also land here: **Sweep** (mean 3.07 / 5.36 / 6.81 / 7.75 vs 3.59 / 5.08 / 6.22 / 7.19) and **Poison Bolt** (3.63 / 6.72 / 8.09 vs 3.53 / 7.06 / 7.06). They are under-priced only on the best body.
- **Mean and best point in opposite directions (body-dependent):** the shooters and damage-over-time skills (Arrow, Fire / Ice Arrow, Twin Shot, Spitfire, Decay, Greater Poison 2, Wither 2, Poison 3-4, Healing 2, Meiosis 2). On average they read 1-7 points under their price (Spitfire 2 and Twin Shot 2 the most), but on their best body (a wall) they read over it. A cut would invite wall shooters, so hold them until a decision on the unit (BAL29-2).

## F. Multipliers (priced on the caps, not in S)

Flying and Evasive (x1.13 on the stats, SKILL2-2) read 3.5 mean, about what x1.13 charges a mid card. Purblind (x0.7) reads -6.2. Outside this proposal.

## Decisions

- **BAL29-1** Apply group A + B (34 skills; 10 cards would then need a 1-2 point refit through the pipeline)?
- **BAL29-2** Price unit: keep the mean (the canon's unit) or move to the ladder's best?

## Balancing status

- Road (Maps 0-20, cached from BAL27 `bal27b`, before CONTENT18): 153 in band / 171 within 10 / 15 beyond 20 of 226.
- Worst maps: The Canopy (0/5; CONTENT18's Canopy Bower lifted 14-A-2 only, to 47.5), Thistlewood (+18.5 too easy, 1-3 / 1-4), Basalt Foundry (19-A-7 / 19-A-8), Savanna Reaches.
- Open balance decisions: BAL29-1/2, ENG37-2 (Reach price), BAL21-5, BAL24-1, BAL25-1..3, BAL26-1/2, CONTENT17-2, ENG32-2/3.
- Next: re-measure group D on the current game (`tools/pipeline/run.sh measure`), then, if BAL29-1 is a), `run.sh price` + `refit` and a road measure of Maps 0-20.
