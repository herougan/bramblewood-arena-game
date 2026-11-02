# New creatures, package CONTENT7 (2026-11-02): art prompts

Owner 11-02 19:56 ("OK go do, + art"): nine new creature cards (IDEA-11-02) and the repaint of the twelve CONTENT6 cards marked **Art rejected**
(prompts for those: `content6-2026-11-02-briefs.md`, unchanged). Style: `docs/style-guideline.md`, `docs/art-style-prompts.md` (paste the base prompt
first). Rules (CLAUDE.md): a full background in every prompt; none of "no clothes", weapon words, "spiked", "studded", "monitor", "sperm", "corpse";
never the watermarked stock image; nothing bought. One bright accent per image.

Status key: **Prompt written** = no image yet; **Art in** = in `art/cards/<id>.png`, `canonical/cards.json` and the build, reviewed.

## Sea creatures

#### Bloodworm (`bloodworm`), Common 2/6, Poison 1, Bleed 1. Proposed: Pebble Beach. Accent: the pink body against black jaws.
```
A fat pink bristly worm half out of its burrow in wet sand, four small black jaws unfolded from its head, a tide flat at low tide with shining puddles and wet pebbles, gulls in the sky and a pale evening sun behind, cute, detailed pixel art, full background
```

#### Bright Night Algae (`night-algae`), Common 1/3, Bloom (night). Proposed: Kelp Mangroves. Accent: its blue-green glow.
```
A round glowing blue-green blob of algae the size of a barrel with a sleepy face, floating in a calm mangrove bay at night, a second smaller glow splitting off beside it, dark mangrove roots and bright stars behind, cute, detailed pixel art, full background
```

#### Bobbit Worm (`bobbit-worm`), Uncommon 4/10, Ambush 2, Gash 2. Proposed: Kelp Mangroves. Accent: the iridescent purple sheen.
```
A long iridescent purple worm buried in coral sand with only its head and one pale feeler showing, jaws just opening, a small fish swimming close by, a shallow mangrove seabed with sea grass and sunlit water above, cute, detailed pixel art, full background
```

#### Man o' War (`man-o-war`), Rare 3/13, Poison 2, Tide. Proposed: Kelp Mangroves. Accent: the bright blue float.
```
A Portuguese man o' war jellyfish with a glossy blue and pink gas float like a little sail, long curling blue tentacles trailing under the water, drifting on a bright open sea with small waves, distant coast with mangrove trees and a clear morning sky behind, cute, detailed pixel art, full background
```

#### Nautiloid (`nautiloid`), Rare 3/14, Armor 2, Pierce 2. Proposed: Coral Current. Accent: the orange stripes on its long shell.
```
An ancient nautiloid with a long straight cone-shaped shell banded in orange and cream, tentacles spread forward, gliding over a coral reef, drifting sea lilies and shells on the sandy floor, blue water with light rays behind, cute, detailed pixel art, full background
```

#### Pistol Shrimp (`pistol-shrimp`), Uncommon 4/4, Stun on Hit 2. Proposed: Coral Current. Accent: the oversized claw and the bubble burst from it.
```
A small red-orange shrimp with one huge oversized claw snapping shut, a glowing bubble flashing between the claw tips, sitting at the mouth of a burrow in a sandy reef floor, a goby fish beside it, coral and sunlit water behind, cute, detailed pixel art, full background
```

## Mythic creatures (Map 56+, unlisted)

#### Unicorn (`unicorn`), Mythic 7/33, Healing 3, Cure 2. Accent: the pearl-white horn glow.
```
A graceful white horse with a long spiralled pearl horn glowing softly, standing in a flower meadow where the grass lifts back up around its hooves, a clear spring stream and tall old trees behind, golden morning light, cute, detailed pixel art, full background
```

#### Sphinx (`sphinx`), Mythic 9/33, Confuse, Daunt 1. Accent: its gold collar and glowing eyes.
```
A great lion with a calm wise face and a gold headcloth and collar lying like a statue, glowing amber eyes, tall sandstone ruins and a few palm trees around it, a desert dusk with a huge pale moon behind, cute, detailed pixel art, full background
```

#### Griffin (`griffin`), Mythic 10/22, Flying, Pounce 2. Accent: its golden eagle head and wings.
```
A griffin with a golden eagle head and broad feathered wings and a tawny lion body, diving down from a mountain ledge with wings spread, snow-capped peaks and drifting clouds behind, bright blue sky, cute, detailed pixel art, full background
```

## Status (2026-11-02): prompts written, no image generated

All 21 cards (these nine and the twelve CONTENT6 repaints) are **Prompt written**. The session could open NightCafe in the owner's signed-in Chrome, but a
sheet needs the owner's credits and the finished image has to reach the repo as a file (`tools/art/art2_import_2026_10_29.py --src <folder>`), which a
remote browser cannot hand over; so generation stops here. The twelve CONTENT6 cards keep `artReview` rejected until the repaint is imported; the nine new
cards carry no `art` yet (the emoji shows). To finish: generate the six 2x2 sheets of `content7-sheets-plan-2026-11-02.json` (prompt = its `base` + the four
`subjects`, top-left to bottom-right), list each sheet file in `docs/art/art2-sheets-2026-10-29.json`-style `{file: [ids]}`, run the importer, view the contact
sheet against `docs/style-guideline.md`, then clear `artReview` on the repainted twelve.
