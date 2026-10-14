# Late game and the long road (2026-10-14, your 11:07 and 11:25 notes)

What was built today is in the changelog. This note keeps the ideas that belong to later maps, so they are not lost.

## How long to reach Map 20

Assumptions: two sessions a day of about 40 minutes, every free Energy capsule used (they come from quests, not on a timer), and Energy spent to the last point each session.

- Clearing every fight on Maps 0–20 once costs about **1,060 Energy** (Map 0 is 7, Map 10 is 70, Map 20 is 126, because later fights cost 7–8 each and bosses double).
- With losses (about 1.4 tries a fight on average), that is about **1,500 Energy**.
- A session starts with a full bar (it refills between sessions) and earns about 8 more while you play.

| Max Energy | Energy a day | Days to Map 20 |
|---|---|---|
| 20 all the way (never upgraded) | about 56 | about 26 days |
| 20, then 50 from the Camp by about Map 5 | about 116 once upgraded | **about 14 days** |
| 50, then 60 from the Forge | about 136 | about 12–13 days |

At 50+, Energy and play time run out at about the same point: 80 minutes is roughly 25 fights, and at Map 10+ 116 Energy is about 15 fights. So the Camp upgrade is the one that matters, and it is meant to be cheap (840 Maple Leaves for all six steps).

**Built now:** max Energy starts at **20**. The **Camp** raises it +5 a step to 50 (40, 80 … 240 Maple Leaves). The **Forge** takes it +2 a step from 50 to 60 (Maple Leaves and Dust). 70 is for a later mechanic. Regeneration stays 1 every 5 minutes, and free top-ups come through Alchemy at Map 65+ (not built). Players who already had 50 keep it, and old Stamina marks become Forge steps.

## Wild Veggies (Maps 20+)

Inspired by Duel Masters' Wild Veggies: fruits, vegetables and fungi come to life.
- Some are rooted and never move or attack, like a Rafflesia (a stink aura) or a Venus Fly Trap (snaps whatever stands in front of it).
- Others have faces and arms or tentacles: a turnip brawler, a pumpkin knight, a walking puffball that bursts into spores.
- The new **Growth Sprout** token (1/3, counts toward Swarm) and **Sprout N** skill are their natural engine. A field of sprouts is strong, and Swarm makes it scary.

## Day and night, Tide

- Day and night now come from the map, not from cards. Caves, the undersea and dark places have none; misty mountains will join that list when such a map exists.
- Swimmers are Tide units. **Moonpull** (on Moon Jelly) brings the Tide in at once. Pebble Beach has the **Tide-spout**.

## The far maps

- **Map 50: the first dragon.** A new dragon every 25 maps after that. They are found through clues scattered everywhere and long quests with no guide. Dragons are hugely strong and hard to get: only their egg can be crafted, after farming them for about a month.
- **Supreme beasts** (dragons, sphinxes, leviathans; used sparingly): their attacks sparkle and are magic, they crush Armor and Ward, and non-magic damage to them is halved. In super-boss fights they also carry the skirmish Shield, so the card you get is weaker than the boss you met but still supremely strong. The five dragons already in the data have Supreme, hidden and on no map.
- **Map 51: the Wandering Mage**, a free leader who supports you the way the Wandering Traveller does early on. The card exists (your wizard-cat art) and isn't placed yet.
- **Map 60+:** collection PvP gets very wild.
- **Map 80+:** you may bring your own effect, once.
- **Every 100 maps:** a new limit-break mechanic, so Level 12 cards start to appear. Heroes get very strong. Other progressions arrive too, such as cards that use attunement instead of levels.
- **Resources by world:** World 1 has Lumber (T1), Stone (T2) and Metal (T3). Uranium belongs to World 3 (T7–T9).

## Summoning a twin

**Twin** (when it arrives, a token copy of it appears beside it) is on two cards: the early trickster **Puddle Changeling** and the late **Mirrorhide Mutant**.

## Ghost, Shade and Shadow

- **Ghost:** normal attacks do nothing, elemental attacks do half, and only magic does full damage. Bleed reaches a Ghost only through Ichor.
- **Shade:** halves non-magic attacks at night and in the dark.
- **Shadow:** at night and in the dark, half the non-magic attacks at it miss.

## Irradiation

Irradiated units carry ☢️ tokens. Each round, each token takes one point from Health (weight 3), Attack (2) or one skill (1 each):
- A number skill drops by 1 and is removed at 1.
- A one-word skill takes 2 points to remove.
- A trigger narrows its targets first, then loses count or value, then is removed.

The tokens then drop by 1. The card's details show the change in colour: blue for buffs, green for radiation losses.

## Icons and emoji sets

You asked about emoji sets we can plug in. Since the game is a web page, any open set can replace system emoji with images:
- **Twemoji** (CC-BY 4.0)
- **OpenMoji** (CC BY-SA 4.0, a hand-drawn look)
- **Noto Emoji** (Apache 2.0)
- **Fluent Emoji** (MIT, has a flat and a 3D style)

The plan:
- Route every skill and resource icon through one `icon(key)` helper.
- The helper picks our own PNG if we have one, else the set's image, else the system emoji.
- That one switch lets us draw our own icons over time. The skill and resource icons are the first to swap.

Electricity's icon is 🔌, which Shock already uses: they can share it, as Shock is the electric status. The three electric-veined bats from your sheet are saved in art_staging/reserve for the Electricity cave cards.

## Art notes

- **"Legends" or "Folktale" style:** your re-uploaded paintings (the Bramblewood Macaque, the panther, the gorilla, the armoured hounds) form their own look, so we can keep it for folktale cards and variants.
- **Placed today:**
  - the green-water fish is the new **Shallows Fry** (1/2 Swimmer, a beginner card that introduces Swimmer and the Tide);
  - **Sunspire Envoy** uses the bottom-right golden bird;
  - **Tide Pool Crab** uses the rock-pool crab;
  - **Cave Bat Swarm, Upside-Down Bat and Bat Swarmling** use the cave bats;
  - the new **Vampire Bat** (3/4, drinks what it deals) uses a cave bat.
- **Still to redo:** Owl Fletcher and Bee Drone, as real animals rather than upright figures (Owl Sentinel was already redone), plus a fresh Owl Nightwatch.
