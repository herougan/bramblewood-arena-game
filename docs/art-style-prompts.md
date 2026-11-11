# Bramblewood art style: prompt guide (2026-10-08)

Asset-pipeline action item 1. Every GPT Image, LoRA or Kling request starts from this page, so that new art sits beside the PixelLab cards. After generating, run the pixel pass: `tools/art/pixelize.py`. It snaps colours to `tools/art/palette.json`, which is 48 colours median-cut from the shipped card art.

## The look in one paragraph

Cosy woodland pixel art: chunky, readable silhouettes with a dark outline and soft top-left light. Colours are warm and slightly muted (moss greens, bark browns, river teals, berry reds), with one bright accent per image. Animals are expressive and a little chibi (big heads, clear eyes), never gory, but this is still an animal-eat-animal world, so warriors look like warriors. Backgrounds are simple and painterly at card size, so the character reads first.

## Base prompt (paste first, then the subject)

> Pixel art, 32-bit era game sprite style, crisp hard edges, limited palette, dark 1-pixel outline, soft light from the upper left, warm muted woodland colours (moss green, bark brown, river teal, berry red) with one bright accent, cute expressive animal character with a slightly large head, clean readable silhouette, no text, no watermark, no signature.

**Body plan rule (owner 2026-11-11):** after the subject, always add the creature's true body plan, even for chibi art, e.g. "anatomically correct spider: two body segments, eight legs all from the front segment" or "anatomically correct beetle: three body segments, six legs from the middle segment". Reject variations with the wrong leg count or attachment. Full rule: style guideline section 9.

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

## New card prompts (2026-11-05, package CONTENT11)

Card art: paste the base prompt first, then the line below. Run the pixel pass at 128 px. The game shows the card's emoji until the art lands.

### Nudibranch
> Full-body character in a small scene, centred, slight low angle: a cute nudibranch sea slug with big friendly eyes on two little horn-like rhinophores, a frilly cape of bright orange and violet gills along its back, gliding over a mossy timber beam of an old sunken ferry, soft river-teal water background with drifting light rays and a few pale sea anemones, one bright violet accent.

### Victoria Regia
> Full-body character in a small scene, centred, slight low angle: a giant round water lily pad with a raised rim and a cheerful face in its big white-and-pink flower, a young folded leaf pushing up beside it, the pad's turned-up underside showing rows of small red thorns, calm pond background with reeds, dragonflies and soft evening light, one bright pink accent.

### Old Snapjaw
> (ART9 2026-11-05, owner 11-04 "Old snapjaw needs new art") Full-body character in a small scene: a huge ancient old alligator with a long scarred snout, mossy green scales and a crown of pink swamp flowers (its own item, kept from the old art), lying half submerged in murky swamp water among cypress roots and lily pads, one glowing yellow eye watching patiently, misty green swamp with hanging moss and fireflies.

## New card prompts (2026-11-06, package ENG27)

Card art: paste the base prompt first, then the line below. Run the pixel pass at 128 px. The game shows the card's emoji until the art lands.

### Crimson Wing Drumcaller
> Full-body character in a small scene, centred, slight low angle: a small hummingbird of the Crimson Wing tribe hovering beside a little gourd drum on a woven strap, crimson and gold feathers with bold war-paint stripes on its cheeks, a short feather headdress, beak open in a chant, tiny wings blurred with motion, warm cliff-stone ledge background with woven tribal banners, flower garlands and a sunset sky, one bright crimson accent.

## New card prompts (2026-11-07, package CONTENT14)

Card art: paste the base prompt first, then the line below. Run the pixel pass at 128 px. The game shows the card's emoji until the art lands.

### Legate of Rivergate
> Full-body character in a small scene, centred, slight low angle: a calm, upright river otter commander of the Rivergate Legion in a bronze crested helmet with a tall red plume, a bronze chest plate over an oxblood-red wool tunic and a cream cloak pinned at the shoulder, one paw raised giving an order, a tall standard topped with a bronze fish planted beside it, river fort background with a timber palisade, a stone bridge and neat ranks of small otters on the bank under a clear morning sky, one bright oxblood-red accent.

### Gold-throat Elder
> Full-body character in a small scene, centred, slight low angle: a wise old hummingbird elder of the Gold-throat tribe hovering in front of a carved wooden totem, a shimmering gold throat and emerald back, a few silver-tipped feathers of age, a tall feather headdress with beads and a small flower garland, beak open in a song, tiny wings blurred with motion, warm cliff-stone background with woven nests, tribal banners and many small bright hummingbirds gathered to listen at golden hour, one bright gold accent.

## New card prompts (2026-11-07, package CONTENT15)

Card art: paste the base prompt first, then the line below. Run the pixel pass at 128 px. The game shows the card's emoji until the art lands.

### Oathsworn Legionary
> Full-body character in a small scene, centred, slight low angle: a sturdy river otter legionary of the Rivergate Legion standing firm, chin up, looking past the viewer toward a tall standard topped with a bronze fish, a bronze crested helmet, an oxblood-red wool tunic under a bronze chest plate, a tall rectangular shield with a wave emblem held close at its side, river fort background with a timber palisade, a stone bridge and a line of otters behind it under a clear morning sky, one bright oxblood-red accent.

### Cobalt Talon Honour-guard
> Full-body character in a small scene, centred, slight low angle: a fierce young hummingbird of the Cobalt Talon tribe darting forward in mid-flight, shimmering cobalt-blue feathers with bold white war-paint stripes, a short crest of blue feathers, a bead necklace and a small flower garland, tiny wings blurred with motion, a carved totem and an old gold-throated hummingbird singing on a ledge behind it, warm cliff-stone background with woven nests and tribal banners at golden hour, one bright cobalt accent.

## Token prompts (2026-11-07, package ENG33)

Token art: paste the base prompt first, then the line below. Run the pixel pass at 128 px. The game shows the token's emoji (🪵) until the art lands.

### Log Wall (Bulwark N's construct, 0/8 Structure)
> A small scene, centred, slight low angle: a short wall of upright logs lashed with rope, mossy, standing on a grassy bank, a few ferns and pebbles at its foot, soft morning light, a gentle wooded hillside and pale sky in the background.

## New card prompts (2026-11-07, package CONTENT17)

Card art for the twenty CONTENT17 Claude picks (on no list until the owner places them): paste the base prompt first, then the line below. Run the pixel pass at 128 px. The game shows the card's emoji until the art lands. Gear is strapped on or held in the jaws, never in hands (style guideline section 9); the prompts name each object plainly.

### Trident Caiman
> Full-body character in a small scene, centred, slight low angle: a lean young caiman with bumpy olive scales lying low on a muddy bank, holding a rusty three-pronged fishing fork crosswise in its jaws, a frayed rope loop around its neck to carry it, half a sunken rowing boat behind it, misty green swamp background with cypress roots and hanging moss, one bright yellow eye accent.

### Peat-smoke Shaman
> Full-body character in a small scene, centred, slight low angle: a round old toad with warty brown skin sitting beside a small clay pot of smouldering peat, eyes half closed as it hums, a necklace of dried reeds, seed pods and tiny shells, curls of pale smoke rising around it, dusky bog background with sundews, cotton grass and glowing marsh lights.

### Matamata
> Full-body character in a small scene, centred, slight low angle: a flat matamata turtle with a ridged shell like a heap of brown dead leaves and a wide frilled triangular head, mouth just opening in the shallow water, drifting leaves around it, murky river-green background with sunken branches and soft light from above.

### Bog Lungfish
> Full-body character in a small scene, centred, slight low angle: a long eel-like lungfish with thread-thin fins and speckled grey-brown skin curled half inside a cracked mud cocoon, one calm eye open, a dry cracked bog bed with a little puddle beside it, hazy golden evening background with reeds.

### Mossmother Newt
> Full-body character in a small scene, centred, slight low angle: a plump orange-bellied newt with a stern, motherly face carrying a bundle of green sphagnum moss on her back, tucking a tuft of moss into a small cut on a mouse's leg beside her, damp mossy log background in a soft green bog with fern fronds.

### Reed-dart Bittern
> Full-body character in a small scene, centred, slight low angle: a streaky brown bittern standing perfectly upright among tall reeds, beak pointed at the sky to blend in, a small quiver of sharpened reed stems strapped to its side, one reed stem flicking out of the reed bed toward the viewer, golden reed-bed background at dusk.

### Shoebill
> Full-body character in a small scene, centred, slight low angle: a tall grey shoebill stork with a huge clog-shaped bill and pale unblinking eyes staring straight at the viewer, standing motionless on a floating mat of papyrus, still dark water and papyrus stems in the background, soft overcast light.

### Hoatzin
> Full-body character in a small scene, centred, slight low angle: a scruffy hoatzin bird with a shaggy orange crest, blue bare face and red eyes perched on a low branch over brown water, a fluffy chick below climbing the branch with little claws on its wings, wavy green stink lines drifting from the adult, humid swamp-forest background with hanging vines.

### Shell-drop Gull
> Full-body character in a small scene, centred, slight low angle: a cheeky herring gull hovering above rocks with wings spread, a big ridged clam shell just released from its feet and falling, cracked shells scattered on the rocks below, bright windy seaside background with rock pools and a blue sky with small clouds.

### Smuggler Slingrat
> Full-body character in a small scene, centred, slight low angle: a sly brown rat of the road-folk in a patched dark cloak and a small sea-blue scarf, a leather strap with a stone pouch hanging from its jaws, a small lantern and a stack of barrels behind it, dim sea-cave background with dripping rock and a sliver of moonlit water, lantern-amber glow.

### Tidefolk Harpooner
> Full-body character in a small scene, centred, slight low angle: a sleek grey seal of the Tidefolk surfacing through green water, eyes fierce, a long carved fishing pole with a bone hook carried in its jaws, a kelp cord with shells and beads around its neck, mangrove roots and kelp curtains in the background, sunlight in shafts through the water.

### Snapgun Shrimp
> Full-body character in a small scene, centred, slight low angle: a small bright pistol shrimp with one huge oversized claw raised, a glowing white bubble bursting in front of the claw with a tiny flash of light, coral reef background with soft pink and purple corals and drifting particles.

### Quill-flinger Porcupine
> Full-body character in a small scene, centred, slight low angle: a stocky porcupine with long black-and-white quills raised, mid-swing of its tail with a few loose quills flying off toward the viewer, bramble-hedge maze background with tall thorny walls and warm late-afternoon light.

### Acorn-pelter Squirrel
> Full-body character in a small scene, centred, slight low angle: a red squirrel with tufted ears and a bushy tail sitting on a branch, an acorn held in its mouth ready to drop, more acorns stuffed in a little bark pouch strapped to its side, sunny woodland edge background with oak leaves and a castle wall far away.

### Pinecone Crossbill
> Full-body character in a small scene, centred, slight low angle: a red crossbill finch with its crossed beak gripping a pinecone, wings open as it lets the cone drop, snowy pine branches around it, dark taiga forest background with soft snowfall and pale winter light.

### Yeti Tracker
> Full-body character in a small scene, centred, slight low angle: a stocky wolverine with thick brown fur nosing into a huge fresh footprint in the snow, a coil of weighted cord with two round stones slung across its back, more giant footprints leading away, wind-blown tundra background with distant mountains and grey sky.

### Icefletch Fox
> Full-body character in a small scene, centred, slight low angle: a white arctic fox crouched on a snowdrift, a small bundle of clear icicles strapped to its back like a quiver, one icicle glinting as it flicks loose, pale blue tundra background with an icy ridge and a low winter sun.

### Yeti Snarer
> Full-body character in a small scene, centred, slight low angle: a snow leopard with thick spotted fur crouched on a rocky ledge, a looped rope held in its jaws and more rope coiled across its back, eyes fixed on a huge shaggy shadow in the blowing snow below, steep snowy mountain background at dusk.

### Sand-flinger Antlion
> Full-body character in a small scene, centred, slight low angle: a round antlion larva with big curved jaws at the bottom of a sand funnel, a spray of sand flicked up from its head into the air, glassy dune background with heat shimmer and a pale sky.

### Stonecracker Vulture
> Full-body character in a small scene, centred, slight low angle: a white vulture with a yellow face and a shaggy neck ruff flying low, a round stone held in its beak, an ostrich egg on the pale sand below, bright desert background with low dunes, scattered bones and a hazy sun.

## New card prompt (2026-11-08, package ENG37)

Card art for the Gannet Cliffs Reach card (owner 09:27, confirmed): paste the base prompt first, then the line below. Run the pixel pass at 128 px. The game shows the card's emoji (🐦‍⬛) until the art lands. The object is held in the beak, never in hands (style guideline section 9).

### Cormorant
> Full-body character in a small scene, centred, slight low angle: a glossy black cormorant with a hooked beak, green eyes and a pale throat patch standing on a rocky sea-cliff ledge, wings half spread to dry in the wind, a long sharpened wooden pole taken from its nest held crosswise in its beak, white sea-cliff background with nesting gannets on the ledges, sea spray and a bright blue sky, one bright green eye accent.

## New card and bramble prompts (2026-11-08, package CONTENT18)

Card art for the CONTENT18 shooters (on no list) and the Bloom star path's card, and the Canopy Bower's bramble art: paste the base prompt first, then the line below. Run the pixel pass at 128 px. The game shows the emoji until the art lands. Natural anatomy, nothing held in hands (style guideline section 9). The shooters are Cute (low stats); the Bumblebee Queen is Brave (Epic).

### Adder
> Full-body character in a small scene, centred, slight low angle: a small grey-brown adder with a dark zigzag down its back coiled on a sun-warmed flat stone, head raised, a fine mist of droplets sprayed from its open mouth, big bright eyes, heather and bracken around the stone, misty green swamp-edge background with reeds and soft morning light.

### Elephant
> Full-body character in a small scene, centred, slight low angle: a young round grey elephant with big floppy ears standing knee-deep at a muddy waterhole, trunk raised and spraying a sparkling arc of water toward the viewer, playful eyes, a few birds on the bank, golden savanna background with acacia trees and a warm afternoon sky.

### Fruit Bat
> Full-body character in a small scene, centred, slight low angle: a fluffy brown fruit bat with a fox-like face hanging upside down from a fig branch, wings wrapped around a half-eaten fig, a soft squashed fig dropping from its feet, big dark eyes, warm dim cave-mouth background with hanging roots, green leaves and a sliver of jungle light.

### Glow-worm
> Full-body character in a small scene, centred, slight low angle: a small pale glow-worm larva with a softly glowing blue-green tail end, flicking a tiny bead of light from its tail toward the viewer, hundreds of glowing dots and silky threads on the cave roof above like a starry sky, dark blue cave background with a still underground pool reflecting the lights.

### Bumblebee Queen
> Full-body character in a small scene, centred, slight low angle: a big fuzzy bumblebee queen with black and golden-yellow bands and shimmering wings, determined bright eyes, perched on a large pollen ball on top of a clover flower, a tiny crown-shaped ring of petals on her head, a few small worker bees flying around her, spring meadow background with foxgloves, clover and a soft sunrise sky.

### Canopy Bower (bramble)
> A small scene, centred, slight low angle: a cosy platform of woven lianas and branches high in a rainforest tree, a round roof of broad green leaves, rope bridges leading off to other trees, hanging flowers and vines, a toucan perched on the railing and a monkey peeking out, misty green rainforest canopy background with light rain and soft rays of sun through the leaves.

## New card prompt (2026-11-11, package CONTENT19)

Card art for the Sea Bass (Map 10, Coral Current; owner: "Add a new card, Sea Bass for Map 10"): paste the base prompt first, then the line below. Run the pixel pass at 128 px. The game shows the card's emoji (🐟) until the art lands. Genre Cute (Common, 3/6). The body plan rule (owner 2026-11-11) is in the line: a fish has no limbs, and a sea bass has two separate dorsal fins, one pair of pectoral and one pair of pelvic fins, one anal fin and a forked tail. Reject variations with legs, one long dorsal fin or a rounded tail.

### Sea Bass
> Full-body character in a small scene, centred, slight low angle: a cute silver sea bass with big bright eyes and a dark spot on its gill cover, sleek silver body with faint dark lines along its flanks, riding the white curl of a breaking wave over a reef wall, two smaller sea bass glinting in the water behind it, sunlit teal shallows background with coral heads and a pale sandy bottom, one bright coral-orange accent. Natural animal anatomy, not anthropomorphic, no hands, anatomically correct fish: one streamlined body with no limbs, two dorsal fins, a pair of pectoral fins, a pair of pelvic fins, one anal fin and a forked tail fin.


Card art for the Barrel Cactus (Rare, 1/18, Dry + Thorns 2; CACTI1, owner 2026-11-12: "There is no cacti card. There should be. Dry & Thorny"): paste the base prompt first, then the line below. Run the pixel pass at 128 px, then put the PNG in `art/cards/barrel-cactus.png` and the `art` field. The game shows the card emoji until the art lands (no art tool was reachable the night it was added). Genre Cute. Body plan (owner 2026-11-11): a barrel cactus is one round ribbed body with no limbs, rows of spines on the ribs and a ring of small flowers on top. Reject variations with arms, legs, a saguaro-style branching trunk or a face with hands.

### Barrel Cactus
> Full-body character in a small scene, centred, slight low angle: a cute round green barrel cactus with big bright eyes, a squat ribbed body with neat rows of pale sharp spines along each rib, a ring of small yellow flowers on top, standing on cracked sandy ground between pale dunes under a clear pale sky, hot pale-gold desert background with long soft shadows, one bright yellow flower accent. Natural plant anatomy, not anthropomorphic, no hands, anatomically correct barrel cactus: one short round ribbed body, no arms, no branches, no legs, spines in rows on the ribs, flowers in a crown on top.
