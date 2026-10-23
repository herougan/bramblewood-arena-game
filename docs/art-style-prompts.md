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

## Trailer (A3): Kling shot prompts (2026-10-23, package DC3)

The owner, 10-23 17:34: *"A3: Prepare the text prompts."* These are text prompts only. Nothing was generated and nothing was
spent: making the clips needs decision A1 (his keys and monthly caps) and his OK on the amount. Shot list from
`docs/asset-pipeline-action-items.md`, item 10; the castle is called the bramble now.

**How each shot is made.** (1) Make the start frame with the base prompt above plus the shot's *start frame* text, 16:9 at
1920 wide (GPT Image or the LoRA), and pick it in the Visual Library. (2) Feed that still to Kling 3.0 image-to-video with the
shot's *motion* text, 5 s unless the shot says 10 s, 16:9, no camera shake. (3) Use the shared negative prompt below on every
clip. (4) Save each prompt beside its file (`same-name.prompt.txt`). A still that is drawn from the game (a card, the map) is
taken as a screenshot instead of generated.

**Shared negative prompt (Kling):** text, letters, logo, watermark, signature, blurry, smeared pixels, extra limbs, human
hands, people, gore, photo-realism, 3D render.

**Look rules for every frame:** natural animal anatomy (four paws on the ground, birds perch or fly), gear shaped to the
animal, never held; a full background in every frame; one bright accent; no words in the image.

### Shot 1: the crowd parts (0:00-0:04, opens the trailer)
- **Start frame:** wide riverbank at golden hour, a cheerful crowd of otters in small bronze crested helmets and oxblood
  capes on the left, a crowd of hummingbirds with crimson face paint and flower garlands hovering on the right, a wooden
  bridge over a teal river in the middle, autumn maple trees and drifting leaves behind, warm late-afternoon light.
- **Motion:** the two crowds lean back and step aside to open a clear path down the middle of the bridge, otters waddling,
  hummingbirds fluttering up, maple leaves swirling across the frame, slow push-in along the path.
- Leaves room in the centre for the title card in the edit.

### Shot 2: a pack tears open (0:04-0:07)
- **Start frame:** a foil booster pouch with a crimped top and a leaf-and-paw emblem, lying on a mossy tree stump in a
  sunlit forest clearing, soft bokeh of ferns behind, one gold glint on the foil.
- **Motion:** the crimped top tears open by itself from left to right, a puff of golden sparkles and maple leaves bursts
  out, five cards fan up out of the pouch and hang in the air, camera tilts up with them.

### Shot 3: a Shiny reveal (0:09-0:12, after a gameplay cut)
- **Start frame:** a single face-down card with a leaf-pattern back, standing upright on a wooden table in a cosy lantern-lit
  burrow, shelves of jars and a round window with night sky behind.
- **Motion:** the card spins once and flips face up, a rainbow shimmer sweeps across its face from corner to corner, small
  star sparkles pop around its edges, the lanterns brighten for a moment, slow orbit around the card.

### Shot 4: Ember Chipmunk breathes fire (0:14-0:18)
- **Start frame:** a small chipmunk with ember-orange fur and a soft glow along its stripes, crouched on all four paws on a
  rock in a dusk forest clearing, cheeks puffed, fireflies and dark pine trees behind, warm ember accent.
- **Motion:** the chipmunk rears back, then puffs a short bright burst of flame forward across the clearing, sparks and
  glowing embers drift and fade, its tail flicks, camera holds still then nudges in. Keep the flame small and playful.

### Shot 5: the bramble falls (0:20-0:25, 10 s clip, trimmed in the edit)
- **Start frame:** a fortress grown from a giant thorny bramble hedge, a round keep of woven branches with two leafy towers
  and a little banner of an otter wave emblem, standing on a hill under a stormy orange sunset, a meadow below.
- **Motion:** cracks run up the woven walls, the towers sway and fold inward, the whole bramble fortress collapses into a
  cloud of leaves, dust and petals that blows across the meadow, a burst of light where it stood, camera pulls back.

### Shot 6: the standoff (0:26-0:30, end card)
- **Start frame:** the key art: otters on the left bank and hummingbirds on the right bank face each other across a wide
  river at golden hour, banners of a wave emblem and a sun-feather emblem, painted cliffs on the right, a river fort on the
  left, distant mountains.
- **Motion:** a slow crane up and pull back, the river glitters, banners ripple in the wind, the hummingbirds rise a little,
  the otters raise their heads, light warms, then holds still for the logo.

### The cut (30 s)
| Time | Clip | Note |
|---|---|---|
| 0:00-0:04 | Shot 1 | Title card over the parted path |
| 0:04-0:07 | Shot 2 | |
| 0:07-0:09 | Gameplay | A hand being played onto the board |
| 0:09-0:12 | Shot 3 | |
| 0:12-0:14 | Gameplay | A Poison tick and a crit number |
| 0:14-0:18 | Shot 4 | |
| 0:18-0:20 | Gameplay | The Conquest map glide |
| 0:20-0:25 | Shot 5 | The bramble's last hit in gameplay leads into it |
| 0:25-0:26 | Gameplay | The victory banner |
| 0:26-0:30 | Shot 6 | Logo and link end card (text added in the edit, never in the image) |
