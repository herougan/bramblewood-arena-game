# Armed creatures: animals with gear and culture (Maps 21+), 2026-11-07

Package CONTENT17. The owner, 2026-11-07 23:55: "for Maps 0-20 the animals are kinda just animals. But future, more like Egyptian alligators and stuff, with weapons. I noticed I can't fit arrow-ers in Maps 0-20 much. E.g. maybe if a crocodile had a trident or some ice animal had ice arrows. ... Yeti: so where are the yeti hunters?"

**Concepts only.** No card data, no prices, no map lists. A content package turns a concept into a card (cards.json, the budget, the 12 language packs), and the owner places it. The Maps 0-20 part of the request (ranged picks per map, some new cards) is in `canonical/claude-new-cards.json` under `content17`.

## The direction

- **Maps 0-20 stay animals.** Their cards are wild animals. A few early ones use what they find (a gull drops shells, a squirrel drops acorns, a caiman throws a fork it found). CONTENT17 added ranged picks of that kind to every map in 0-20.
- **From Map 21 on, gear and culture.** Creatures belong to peoples with a craft, a look and a reason to fight:
  - temple crocodiles that guard river shrines;
  - yeti, and the hunters who track them;
  - tundra archers who shoot ice.
  - This follows `docs/lore-bible.md`: the Otters and the Hummingbirds are the first peoples with gear, and the beasts stay hunger with a vocabulary.
  - It also fits the 21+ plan (`docs/design/world-21-plus-ideas-2026-10-30.md`), where animals gradually form societies, use tools (Map 34-35) and fight organised wars (Goldfeather Siege, Map 37 there; Map 23 on today's road).
- **Art rule, unchanged.** Natural animal bodies (style guideline section 9):
  - gear is strapped on or carried in the jaws, never held in hands, and nothing stands upright like a person;
  - prompts name the object plainly ("a long carved pole with a bone hook in its jaws", "a bundle of icicles strapped to its back") and keep avoiding weapon words.
  - The card's name may say "spear" or "trident"; the prompt does not.
- **Original cultures only.** The desert peoples take their look from sand, river and sun (reed boats, sun discs, carved sandstone, lapis and gold), not from a real religion's gods or sacred figures. The bog shamans of CONTENT17 follow the same rule: herbalists and smoke-healers, not any real faith's priests.

## How ranged becomes common there

Today a ranged card is rare: about 63 of 842 card entries, most of them late or out of play. From Map 21 on, gear makes shooting ordinary:

1. **About 1 card in 4 on a 21+ map list is ranged** (thrown, slung, shot or dropped), against about 1 in 17 on Maps 0-20 today (16 of the 276 cards on their lists).
2. **Every people has its own shot:** temple crocodiles throw spears (Reach), yeti hunters throw bolas and lassos, tundra archers shoot Ice Arrow, dune folk sling stones (Arrow), storm birds call Lightning.
3. **Answers come with them:** more Guardian, Taunt and Shield bodies, and anti-air melee (Anti-air), so a wall of archers can be broken. A Sentry or Volley structure in a siege map is the ranged side's castle.
4. **Melee and ranged keep the delivery rules:** each new skill gets a line in `canonical/skill-delivery.json` (melee / ranged / none) when it is built. Thrown weapons use existing keys: Reach (the swing is ranged), Arrow, Bola, Lasso, Snipe, Volley, Ice Arrow, Fire Arrow.

## Concept cards (18)

| # | Concept | Animal | People / culture | Ranged? | Idea (existing skill keys) | Suits |
|---|---|---|---|---|---|---|
| 1 | Temple Spear Crocodile | Nile-type crocodile | Sunbank temple guards | yes | Reach + Pierce: throws a sandstone-tipped spear from the water | Saltblind Flats (23 in the 21+ plan), Sunscorch Basin (25) |
| 2 | Sun-disc Priestess Ibis | ibis | Sunbank temple keepers | no | Healing + Prayer: a reed-boat healer (an original sun cult) | 23, 25 |
| 3 | Reedboat Slinger Mongoose | mongoose | Sunbank river crews | yes | Arrow 2: slings clay balls from a reed boat | 23, 25 |
| 4 | Lapis Scarab Bearer | scarab beetle | Sunbank tomb builders | no | Armor + Delivery (Stone): rolls carved stone for the temples | 25, Redclay Warrens (36) |
| 5 | Yeti Elder | yeti | the yeti clans | no | Guardian + Frostbite: the old one the hunters never caught | Quiet Summit (21), Shivering Reach (29) |
| 6 | Yeti Huntmaster | wolverine | the yeti hunters | yes | Bola + Keen Eye; Leader of the hunt | 21, 29 |
| 7 | Snowshoe Netcaster | snowshoe hare | the yeti hunters | yes | Lasso 1 + Evasive: throws the net and runs | 21, 29 |
| 8 | Horn-caller Musk Ox | musk ox | the yeti hunters | no | Inspiring: the hunt's horn, the herd behind it | 29 |
| 9 | Rime Archer Ermine | stoat | tundra archers | yes | Ice Arrow 2: icicle shafts from a strapped quiver | Rimefire Caldera (22), 29 |
| 10 | Frostbow Owl | snowy owl | tundra archers | yes | Ice Arrow + Flying: shoots from the night sky | 22, 29 |
| 11 | Glacier Volley Walrus | walrus | tundra archers' ice forts | yes | Volley + Armor: a walrus with a rack of ice shards on its back | 29 |
| 12 | Storm-chant Heron | heron | storm-callers | yes | Lightning: calls a bolt down on the line | Thunderhead Expanse (26) |
| 13 | Kite-rider Swift | swift | storm-callers | yes | Flying + Arrow: rides the gusts and shoots | 26 |
| 14 | Lantern Angler Spearfish | anglerfish | abyss hunters | yes | Snipe + Darksight: a lure light and a thrown barb | Abyssal Shelf (27) |
| 15 | Ironbark Shield Tortoise | tortoise | Ironroot wardens | no | Guardian + Armor: carries a wall of grown bark | Ironroot Wilds (28) |
| 16 | Flint-knapper Badger | badger | the First Hearth | no | Delivery (Stone) + Armor: makes the flint the hunters throw | First Hearth (34) |
| 17 | Flint-throw Baboon Troop | baboon | Flintbound hunters | yes | Volley 1: a troop hurling flint | Flintbound Wilds (35) |
| 18 | Siege Pelican Catapult | pelican | Goldfeather army | yes | Volley + Siege: a beaked catapult crew | Goldfeather Siege (23 today; 37 in the 21+ plan) |

## The yeti hunters (the owner's question)

The yeti are already in the game: the Yeti (Ashen Spurn's list) and the Yeti Chieftain (a leader on no list). CONTENT17 adds their hunters in two steps.

**On Maps 0-20 now:** three new cards, on no list until the owner places them.
- Yeti Tracker (a wolverine): Keen Eye + Bola.
- Icefletch Fox (an arctic fox): Ice Arrow + Evasive.
- Yeti Snarer (a snow leopard): Lasso + Pounce.
- They are Claude picks on Wolfsbane Tundra (17) and Ashen Spurn (19).

**From Map 21 on:** the hunters become a people with a camp and a horn (concepts 6-8).
- The yeti clans answer them (concept 5).
- A skirmish of "the hunt" is a natural road fight: hunters against one huge yeti and its young.

## Next steps (for a later content package)

- Choose 4-6 concepts per 21+ map when that map's list is built.
- Price them with `bramblewood-budget.js` and translate them.
- Add a ranged count to the map's list check (target about 1 in 4).
