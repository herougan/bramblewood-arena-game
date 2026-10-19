# Easter eggs (internal note, 2026-10-19, package EE)

Owner, 09:52: "Easter eggs: Special category, ungettable atm."

**Internal only.** The inspirations below must never reach a card, a prompt or the game's text. Names, art and designs are original or "inspired by". The internal ids keep the owner's names.

## How the category works

- **One list:** `EASTER_EGG_IDS` in `arena_app.js` (next to `cardObtainableFrom`).
- **To add one ("more to come"):**
  1. Put its id on the list.
  2. Give the card `"source": {"kind": "easteregg"}` and `"easterEgg": true`.
  3. Run `node tests/easter-eggs-2026-10-19.js`, which checks that the list and the flags agree.
- **No source can give one out yet.**
  - `cardObtainableFrom` returns null for them, so `isUnattainable` is true.
  - `unlockCardForPlayer` refuses them from every source except an admin's grant (`admin`, `adminGrant`, `devGrant`).
  - These pools leave them out too, even if someone gives an egg a real source:
    - the pack pools (`packCardPool`, so the faction packs, the general packs and the base and faction reward tracks too);
    - the card drop (`rollCardDrop`);
    - the skirmish rewards (`nodeRewardCardIds`, and the reward editor's search);
    - the raid cards (`raidCardIds`);
    - the reward tracks (`trackPick`);
    - the Forge's fuse;
    - the engine's egg hatch (`eggPoolFor`), for the Nest's egg cards.
  - No Blacksmith recipe makes one.
- **Hidden until seen.**
  - The Codex shows each Easter egg as a masked "???" tile with a 🥚, its rarity band only, in its own "Easter eggs" section (2026-10-19, package CX: "not obtainable yet" is the section's tooltip now). The tile opens nothing.
  - Once the player has seen the card (in a fight, say) or owns it, the real card shows.
  - Admins see the whole card with 👁 Show unseen, tagged "🥚 Easter egg".
  - A masked egg never matches a search or a skill filter.
  - The hub's card list (`tools/hub/export_decks.py`) shows it as "???" with no thumbnail.
- **Turning one on later:** take it off the list, remove the flag and give it a real source.

## The eight cards

The budget is v3 at Level 1, from `tools/skill_costs.js`. The numbers are in each card's creatorNote.

| id | Name | Rarity | Cost / Wait | Stats | Skills | Inspiration (internal) |
|---|---|---|---|---|---|---|
| `creeper` | Creeper | Very Rare (was Common, a pack card) | 1 / 1 | 3/12 | Restless (creeps one column a round toward the nearest enemy), Explode 2 rounds → 8 to the enemy facing it | a famous green exploding block-game mob. It is now an original creeping beetle (copper and amber), not a green pixel copy. Its old smiling green-bee art was taken off. |
| `terraumbra` | Terraumbra | Unique, **Evomax**, equipment | 2 / 0 | +3/+3 to its bearer | grants Shedding 2 (+1/+1 for good every 2 rounds, cleanses) and Cleave 2 | a prismatic summoned-blade weapon from a 2D sandbox game. It is a swarm of rainbow light shards that grows as it evolves. |
| `exo-podas` | Exo-podas | Very Rare | 2 / 2 | 6/20 | Armor 1, Trident (stomps three lanes), Mountain Climber | a six-legged walker unit from a sci-fi RTS |
| `galactic-condor` | Galactic Condor | Epic | 2 / 2 | 4/12 | Flying; Charge 2 → Position Beam 5 | a space-condor gunship and its charged beam |
| `pink-maus` | Pink Maus | Unique | 2 / 1 | 2/24 | Sturdy (half damage from everything), Taunt | a famous pink bean-blob boss from a side-scrolling MMO |
| `nyoogle` | Nyoogle | Super Rare | 1 / 1 | 4/11 | Illuminate (its lantern), Restless (creeps closer), Invisible 2, Backstab 2 | pom-pom winged mascots plus a lantern-carrying stalker, both from a long-running JRPG series. The look is changed: a moss-hooded critter with a pom-pom stalk and no wings. |
| `tobasco-drakon` | Habanero Drakon | Rare (my pick: a "little drake") | 1 / 1 | 4/13, resists Fire | Chilli 2 (on Ready, fire attacks and +2 Attack, 1 self-damage a round), Fire Bolt 2 | a fiery hot-sauce dragon. The display name is not "Tobasco" because that is a near-copy of a hot-sauce trademark. |
| `demo-panda` | Kegfuse Panda | Super Rare (my pick) | 1 / 1 | 4/14 | Make Tipsy 50% for 2 rounds (the suspicious jar), Nova 3 (when it dies, every enemy unit takes 3 magic damage: the fizzing keg) | a team-shooter demolitions man. The text says only "a fizzing keg" and "a suspicious jar". |

### Galactic Condor: Position Beam

`positionBeam` is a new engine action (`bramblewood-engine.js`, `positionBeamPlan` / `firePositionBeam`), fired by the Condor's Charge 2 (every 2 rounds once it is Ready). Its path depends on the Condor's own column. Column 0 is the exact centre; slot battles use the slot.

- **Centre (column 0):** straight across. It hits the enemy unit directly opposite and the enemy bramble.
- **A side (1 to 4 out):** angled toward the far side. It hits the units diagonally across: from one step inward of the unit opposite, in to the centre line. That is as many units as the Condor stands columns out. If nothing is there, the beam goes on into the bramble.
- **The edge (5 out, `BEAM_EDGE`):** almost flat. It hits every enemy unit inward of the one opposite, and spares the unit opposite and those beyond it (owner: "hits the entire row except its opposing onwards").

Each unit hit takes the beam's full amount (5 for the Condor). Evasion and Guardian apply. The beam is not a shot, so Reflect doesn't bounce it.

The look reuses the lightning bolt with a prismatic, hue-cycling glow (`sfx-bolt-beam`), plus a "🌈 Position Beam 5" float and a log line.

The text is the TX key `ui.act-position-beam-desc` (17 words): "fire a 5 beam. Centre: the unit across and the bramble. Side: diagonally inward. Edge: the row inward."

Tested in `tests/position-beam-2026-10-19.js`.

## Evomax

The Evolution archetype is now called **Evomax** wherever a player sees it. The internal id `evolution` stays, along with its frame art (`a-evolution.png`), its CSS class (`ar-evolution`) and the cards' `mechanicLine`.

The name comes from TX `ui.arch-evomax`. It is untranslated in the Latin-script packs and transliterated in ja (エボマックス), ko (에보맥스) and ta. zh keeps "Evomax".

It is used by:
- `MECH_LINE_LABEL` (the Codex filter and the stats pie);
- `CARD_ARCHETYPE_MARK` (the corner mark's title);
- the card editor's Archetype option;
- the card detail's mechanic tag, which had shown such a card as "Devilry".

Terraumbra is the first Evomax card.
