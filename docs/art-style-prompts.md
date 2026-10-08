# Bramblewood art style: prompt guide (2026-10-08)

Asset-pipeline action item 1. Every GPT Image, LoRA or Kling request starts from this page, so that new art sits beside the PixelLab cards. After generating, run the pixel pass: `tools/art/pixelize.py`. It snaps colours to `tools/art/palette.json`, which is 48 colours median-cut from the shipped card art.

## The look in one paragraph

Cosy woodland pixel art: chunky, readable silhouettes with a dark outline and soft top-left light. Colours are warm and slightly muted (moss greens, bark browns, river teals, berry reds), with one bright accent per image. Animals are expressive and a little chibi (big heads, clear eyes), never gory, but this is still an animal-eat-animal world, so warriors look like warriors. Backgrounds are simple and painterly at card size, so the character reads first.

## Base prompt (paste first, then the subject)

> Pixel art, 32-bit era game sprite style, crisp hard edges, limited palette, dark 1-pixel outline, soft light from the upper left, warm muted woodland colours (moss green, bark brown, river teal, berry red) with one bright accent, cute expressive animal character with a slightly large head, clean readable silhouette, no text, no watermark, no signature.

## Per asset type

| Asset | Size after the pixel pass | Add to the prompt | Background |
|---|---|---|---|
| Card art | 128 px (shown at about 160) | "full-body character in a small scene, centred, slight low angle" | Scene, simple and painterly |
| Sprite (splash crowd, map pawn) | 24–40 px tall, shown ×6–×9 | "single character, full body, side view, neutral pose; same character, frame 2: arms up" | **Transparent** (`background: "transparent"`, PNG/WebP) |
| Skin variant | Same as the card | Use an *edit* of the existing card art: "same character and pose, now [fire-tinted fur, ember glow, tiny flame breath]" | Keep the original |
| Hit decal (claw, bite…) | 32–48 px, 4–6 frames | "VFX sprite sheet, [claw slash], 4 frames left to right, transparent" | Transparent |
| Pack wrapper | 256×360 | "foil booster pack, crimped top, faction emblem, playful paw-print liner" | Transparent |
| Key art (marketing) | 16:9 at 1920 wide, 1:1, 1200×630 | "wide establishing shot, otters on the left bank, hummingbirds on the right, river between, golden hour" | Scene |

## Characters (for consistency)

Follow `lore-bible.md`; these are the short versions.

- **Otters (the Rivergate Legion):**
  - A disciplined river legion with a pre-Roman legionary look: bronze crested helmets, oxblood tunics, rectangular wave-emblem shields.
  - Palette: bronze, oxblood and river blue. Their land has roads, forts and bridges.
  - Example prompt: *"pre-Roman otter legionary, bronze crested helmet, oxblood tunic, wave-emblem shield, river fort behind"*.
- **Hummingbirds (the Sunfeather Tribes):**
  - A loose federation of brightly painted tribes: crimson war-paint, feather headdresses, bead necklaces, flower garlands.
  - Saturated jewel tones. Their land has painted cliffs, totems and blossoms.
  - They fight beside the big beasts (stags, bears, boars, big cats) they befriend with song.
- **Dogs and cats** are neutral friends of both peoples (see `lore-bible.md`). War dogs are quadrupeds that hold weapons in their mouths.
- **Never** use real brands, existing characters or living artists' names, and never put text in an image.

## Workflow

1. Generate 4 options.
2. Pick one.
3. Run the pixel pass at the target size: `python3 tools/art/pixelize.py in.png out.png --size 32 --outline`.
4. Check it next to three existing cards in the Visual Library.
5. Save the prompt beside the file (`same-name.prompt.txt`) so it can be redone.
