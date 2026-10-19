# Raid elder art brief (2026-10-19, package UT)

The owner, 09:52: *"The elder in Raid doesn't have its own art yet. (It should use the base one as inspiration for the more epic version)."*

This is a brief only. No art was generated and no credits were spent.

## Which units have no art of their own

The Goliath raid sends a **boss unit** in on rounds 3, 7, 11, 15 and 19 of each fight. The boss unit is the part's biggest card, grown, under its own name (`buildRaidFullFight` and `RAID_BOSS_UNIT_NAMES` in `arena_app.js`). It has +1 Attack, Health ×(1.5 + 1.5·r), Epic rarity, and 100 Health on a fresh raid. It has no art of its own: it borrows its base card's art.

| Boss unit | Raid parts | Base card | Art it uses now |
|---|---|---|---|
| **Leviathan Elder** (`humpback-elder~boss`) | Tail, Core | Humpback Elder | `art/cards/humpback-elder.png` (128 px) |
| Kraken Brute (`kraken-spawnling~boss`) | Left Tentacle, Right Tentacle | Kraken Spawnling | `art/cards/kraken-spawnling.png` (256 px) |

"The elder in Raid" is the **Leviathan Elder**. The Kraken Brute has the same gap, so a second prompt is below. Both rows are also in `canonical/unit-themes.json` → `nonPlayer`, with `art.ownArt: false`.

## The base art, to build on

`art/cards/humpback-elder.png` shows a dark slate-teal humpback head coming at the viewer underwater. It has a crust of pale green barnacles on its brow and jaw, a small yellow eye, a deep blue water background and a soft light from above.

Keep from it:
- the colours (slate teal, barnacle green, deep blue);
- the head-on, three-quarter view;
- the barnacle crust.

Make it **bigger, older and more epic**:
- a whale so big it fills the frame;
- a crown of barnacles and coral, with moss and kelp trailing from it;
- old scars and a glowing eye;
- storm light from above.

## Prompt: Leviathan Elder

Start from the base prompt in `docs/art-style-prompts.md`, then add:

> Pixel art, 32-bit era game sprite style, crisp hard edges, limited palette, dark 1-pixel outline, card art, full scene, centred, slight low angle. An ancient colossal humpback whale, the Leviathan Elder, surging up out of a dark storm sea toward the viewer in three-quarter view, so vast it fills the frame. Weathered slate-teal skin crusted with pale green barnacles and white coral, long ribbons of kelp and moss trailing from its jaw and flippers, a crown of white barnacles and pearl-like growths ringing its brow, old pale scars across its head, one calm ancient eye glowing soft gold. Background: towering storm waves, a bruised violet sky with forked lightning, a single beam of moonlight breaking through the clouds onto its back, white spray and foam all around, a tiny sailing ship far below for scale. Dramatic rim light, deep blues and teals with one warm gold accent, epic and awe-inspiring.

## Prompt: Kraken Brute (the same gap)

Build it on `art/cards/kraken-spawnling.png`, a dark slate kraken with red eyes in a stormy sea, coiled round a broken mast.

> Pixel art, 32-bit era game sprite style, crisp hard edges, limited palette, dark 1-pixel outline, card art, full scene, centred, slight low angle. A huge ancient kraken, the Kraken Brute, rising from a storm-black sea, its great mantle crowned with coral and trailing kelp, old barnacle-crusted tentacles coiling around the broken mast of a sunken ship, two deep red eyes glowing under a heavy brow. Background: a wall of storm waves, a dark violet sky split by lightning, spray and foam, moonlight catching the wet tentacles. Dramatic rim light, slate blue and deep red, epic.

## Rules for the request

- **Always ask for a background** (a full scene). Never ask for a transparent cut-out for these two.
- Keep these words out of the prompt (owner's list):
  - "no clothes";
  - weapon words (blade, sword, spear, and the like);
  - "spiked", "studded", "monitor", "sperm", "corpse".
  - The prompts above contain none of them. Don't add "sperm whale" for a whale; say "humpback".
- Sizes: 128 px card art after the pixel pass (`python3 tools/art/pixelize.py in.png out.png --size 128 --outline`). A 256 px version can go to `art/raids/`.
- Suggested files:
  - `art/raids/units/leviathan-elder.png`
  - `art/raids/units/kraken-brute.png`
  - Save each prompt beside its file as `same-name.prompt.txt`.
- Wiring (later, once the art exists): give the boss unit its own `art` where `buildRaidFullFight` makes `defs[bossUnitId]`. For example, a `RAID_BOSS_UNIT_ART` map next to `RAID_BOSS_UNIT_NAMES`. The base cards keep their art.
