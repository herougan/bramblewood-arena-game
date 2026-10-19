# Raid bramble art brief: Kraken's Reef (2026-10-19, package U3)

The owner, 13:43: *"The tentacle smack should be a property of the Raid's bramble. Which should be appropriately named and art'd."*

This is a brief only. No art was generated and no credits were spent.

## What it is

In a raid fight the boss side has a bramble (its castle, the "Enemy" tile at the top left of the board). For the Goliath it is now
**Kraken's Reef** (owner call; the other name considered was "The Drowned Maw"). The Tentacle Smack is the reef's ability: every 3
turns a tentacle lashes out of it at one of your columns or rows. The FX's tentacle reaches out of this tile.

- In the game: `RAID_BRAMBLES.goliath` in `arena_app.js` (`art: 'art/raids/krakens-reef.svg'`).
- The placeholder now: `art/raids/krakens-reef.svg`, a 48×48 pixel-art SVG drawn by `tools/make_raid_bramble_art.py` (a coral reef
  fortress with a keep and two towers, coral crowns, a gate like a maw with a teal glow, and two violet tentacles curling up around it).
- A painted version can replace it: save it as `art/raids/krakens-reef.png` and change the `art` path in `RAID_BRAMBLES` (the build
  ships `art/raids/*.svg` and `*.png` as hashed assets).

## Where it shows

- The bramble tile (top left), about 60 to 100 px wide, so the shape must read small: one strong silhouette, high contrast.
- The bramble's info panel and the raid's rules (56 px thumbnail).
- Square crop, the subject centred, the top fifth fairly quiet (the tile's "Enemy" label and the HP bar sit over the top and bottom).

## Look

- The Goliath's palette: deep abyss blue and violet water, violet tentacles with pink undersides, coral pink and orange, a teal glow.
- It should read as a **fortress** (a bramble is a castle) that **is also part of the creature**: the reef's walls are grown over by
  the Goliath, its tentacles coil around the towers, and the gate is a dark mouth.
- Match the card art: the same pixel style as `art/raids/goliath.png` and the Abyss cards (`art/cards/goliath-tentacle.png`,
  `art/cards/kraken-spawnling.png`).

## NightCafe prompt

Start from the base prompt in `docs/art-style-prompts.md`, then add:

```text
Pixel art, 32-bit era game sprite style, crisp hard edges, limited palette, dark 1-pixel outline, card art, full scene, centred, front view, square. Kraken's Reef: an ancient fortress grown from purple reef rock and coral on the floor of a deep ocean, a squat central keep with two round towers, crowned with branching pink and orange coral. Two huge violet tentacles with pale pink undersides and rows of round suckers rise from behind the fortress and curl around its towers, their tips coiling above the walls. The arched gate is a dark cavern mouth fringed with pale curved coral teeth, a soft teal glow deep inside; small round windows glow teal like eyes. Background: deep blue-violet water fading to black, faint shafts of light from the surface far above, drifting bubbles and tiny glowing plankton, kelp swaying at the base, a sandy seabed with scattered shells. Moody and mysterious, deep blues and violets with coral pink and teal accents, readable at a small size.
```

Negative prompt (if the model takes one): `text, letters, watermark, signature, frame, border, blurry, photo, 3d render, people, humans`.

Words kept out of the prompt on purpose (they trip NightCafe's filter or pull the wrong look): "no clothes", any weapon words,
"spiked", "studded", "monitor", "sperm" and "corpse".
