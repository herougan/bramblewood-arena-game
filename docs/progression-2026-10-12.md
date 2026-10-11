# Progression, maps 1–60 (2026-10-12)

This answers the progression points from the 22:40 list. The built parts are marked **Built**; the rest are proposals waiting for your call.

## 1. Level gates (built)

"Reached Map N" means Map N is open to you. Admin mode skips every gate.

| Step | When it opens | Notes |
|---|---|---|
| Forge | Map 11 (Basalt Foundry spot) | Unchanged |
| Level 0 → 1 | Always | Costs **a mote of materia**: 1/45 of a Materia Unit (15 Dust, 10 Maple Leaves), the same for every card |
| Levels 1 → 4 | Always | |
| Levels 5 → 8 | Map 16 | |
| Level 9 | Map 26 | |
| Level 10 | Map 31 | |
| Limit break (Lv 11, castles 21–25) | Map 50 | Your "maps 50–60" |

The Forge shows the gate on the button ("Level 5 opens once you reach Map 16"), and the limit-break panel says "Limit breaks open once you reach Map 50".

Starting levels:
- Base cards start at 0.
- Reward cards start at 1.
- Quest and errand cards (`source.kind` `quest` or `errand`, or `quest: true`) start at 0.

## 2. The road after Map 20 (proposal)

**Maps 1–20 stay straightforward:**
- one trail per map;
- a boss every fifth map;
- feature spots as they are now.

**Maps 10–20 add a little more:**
- up to two curiosities and chats per map (built tonight: 19 of them on Maps 1–11);
- the occasional errand;
- **optional dungeons that turn up later.**

The mechanism for late dungeons is **built**:
- a side map's `entry` can say `afterDays: 5` (it appears five days after its `after` fight is first cleared);
- or `quest: '<id>'` (it appears once that quest's flag is set).

No dungeon uses it yet. Your list's 9A, 12A, 14A–D, 15A and 18A are the candidates. Suggested:
- 14A–D one at a time, two days apart, after Map 14's boss;
- 15A five days after Map 15;
- 18A after the Map 17 quest.

**From Map 40, a world boss every 10 maps** (40, 50, 60):
- A world boss is its own map: a castle with layered bonus health (L1–L4, built tonight in the editor), a deck of named cards at set levels (per-card levels, also built tonight), and a raid-style shared weekly pool for the community version.
- Between bosses, maps get longer:
  - 10–12 fights instead of 6–8;
  - two branches that rejoin;
  - a side dungeon on every map.
- Progress slows by design:
  - map energy cost rises by 1 every 10 maps;
  - first-clear rewards stay flat, so later maps pay mostly through cards and materia.

## 3. Cards on Maps 1–20 (your question: 160+?)

Yes, well over 160. Counted from the live data:

| | Cards |
|---|---|
| Different enemy cards on Maps 1–20 (with their side maps) | 183 |
| Reward cards earned on those maps | 125 |
| Enemy and reward cards together | 235 |
| Pack pools | 78 |
| Base and starter cards | 43 |
| All cards today | 475 |

A player who clears Maps 1–20 and buys packs can own about 246 different cards (125 + 78 + 43) once you mark them obtainable.

## 4. Raising max energy, and the Town (proposal)

**Max energy.** Max energy rises by **+1 for every 20 different skirmishes cleared**, up to +10 (30 in all).
- It rewards exploring rather than grinding one fight.
- It needs no new screen: the energy pill's tooltip can say "18/20 to +1 max energy".

The Nest isn't the right home for it: the Nest is about cards, and tying energy to it would make players visit it for the wrong reason.

**The Town** would be a page of its own, opened from a signpost where the Nest spot is today.
- **Buildings.** You place them anywhere on a small valley map:
  - Nest (moves here);
  - Workshop (Forge shortcuts);
  - Lumber Mill and Quarry (small daily resource ticks);
  - Watchtower (max energy +1 once built).
- **Placement matters for the feel.** A building's ambience follows the ground it stands on: a Nest on the mountain gets wind and air, by the river it gets water, in the woods birdsong.
- **Factories.** Each building levels with Dust and Maple Leaves and pays a small daily amount, capped so it never beats playing.
- **First step**, if you say yes:
  - the signpost;
  - a blank valley with the Nest as its only building;
  - free placement and saved positions;
  - the ambience by ground type.

## 5. Readings from tonight's skills (see D39 in action items)

- **Swimmer:** on a Flow round, one extra turn at the start of combat. Added to the 9 Tide fish, eels and sharks.
- **Tailwind:** the existing Tailwind spell now also gives every Flyer of yours one extra turn next combat.
- **Inspiring N** (your blank, my rule): as it attacks, the allies either side get +N Attack for their next swing.
- **Loyal / Usurper:**
  - Loyal +A/+H while one of your leaders is on the battlefield;
  - Usurper +A/+H while the enemy leader is;
  - either can also grant skills (`loyalGrant` / `usurperGrant`; the editor sets the numbers, the grant is data for now).
- **Worthy N:**
  - brings N Lumber on arrival, and its death gives the other side 1;
  - the 14 `onSpawnGold` cards and the 3 cards with an "On Spawn: gain Lumber" trigger were moved to it.
- **Lumberjack:** +1 on every Lumber gain, pitching included.
- **Heavy Metal:** +1 on every Stone or Metal gain.
- **Timber / Rock-solid / Iron-will:** +1/+1 per Lumber, +2/+2 per Stone, +3/+3 per Metal you hold.
- **Uranium ☢️:**
  - made by the Irradiated Axolotl (1 when Ready);
  - spent by the Irradiated Glow Wyrm (2) and the Irradiated Couatl (3).
- **Rage:**
  - doubles Attack below half Health, castle hits included;
  - the board shows the doubled number and an ember ½ shield.
- **Shell N:**
  - the first hit of any kind raises it: +N Armour and N temporary Health until the end of the next round, and no attacks meanwhile;
  - an unhit unit attacks as normal.
- **Friction N:** when it attacks, N damage to each ally beside it.
- **Pitchfork** (rethought): it strikes the weakest of the three units facing it. If that kills, the same swing carries on into the next-weakest.
- **Pitching:**
  - it opens after Map 1's last fight;
  - until then, dropping on the Graveyard does nothing and has no tooltip;
  - Lumber-cost cards a player earns before then wait and arrive when pitching opens.
- **New cards** (all unobtainable until you tick them):
  - Conch Crawler and Conch Herald (beach);
  - Shoal Shark;
  - Malachite Golem (1 Stone);
  - Irradiated Axolotl, Glow Wyrm and Couatl;
  - Heartwood Treant, Quarry Troll, Iron Warden;
  - Badger Lumberjack, Ore-Smelter Mole;
  - Sworn Shieldbearer, Crown Pretender;
  - Grindstone Boar.
