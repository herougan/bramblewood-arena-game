# AI asset pipeline: action items (2026-10-08)

Owner's request: *"Put in action items using GPT Image and Kling or even LORA to generate in-game assets and marketing collateral."*

**Rule for every item below:** no API keys, credits or plans are bought without the owner's explicit OK. Each item lists what it would cost, so it can be approved one at a time.

## What each tool is for

| Tool | Best at | Use it for | Watch out for |
|---|---|---|---|
| **GPT Image (`gpt-image-2`, OpenAI API)** | Following a prompt closely, editing a given image, transparent PNG/WebP (preview since 20 Aug 2026) | Cut-out sprites, icons, skins, pack wrappers, card backs, marketing stills | Not a true pixel grid: run every result through our pixel pass (below). Cost per image isn't published as a table; measure on a test batch. |
| **LoRA (FLUX.2 [dev], trained on our own art)** | Keeping one consistent house style across hundreds of images | New card art in exactly the Bramblewood pixel style; Maps 9–10 cards while PixelLab is at its monthly cap | Needs 20–40 clean examples of our own art; outputs still need the pixel pass and a human check |
| **Kling 3.0 (image → video)** | Bringing a still to life (up to 10 s a clip, first/last frame control) | Trailer shots, social clips, an animated splash loop | Video is heavy in-game: a few seconds as WebM under 2 MB at most. Commercial-use terms must be checked per plan. |
| **PixelLab** (already in use) | Native pixel art | Stays the main source for card art | Monthly cap (2,000 generations; currently used up) |

## Action items

### A. Foundations (do first)

1. **Style bible for prompts.**
   - Write `docs/art-style-prompts.md` with:
     - the palette, extracted from the existing card art
     - pixel size per asset type (card art 160 px; sprites 16–32 px drawn at ×6–×9)
     - outline colour, lighting from the upper left, mood words
     - a list of "never" items: real brands, existing characters, text in images
   - Every generator call starts from this. *Effort: Claude, about 1 hour. Cost: none.*
2. **Pixel pass script** (`tools/art/pixelize.py`).
   - Downscale to the target grid with nearest-neighbour, snap to the palette, clean the outline, trim transparent edges, pack frames into a sprite sheet.
   - This makes GPT Image and LoRA output sit beside the PixelLab art. *Effort: Claude. Cost: none.*
3. **Keys and budget.**
   - The owner creates OpenAI and fal.ai (or Replicate) keys and stores them as local environment variables, never in the repo.
   - A monthly cap is set in each dashboard. *Owner action. Decision **A1**.*

### B. In-game assets

4. **Splash crowd and standoff, real art.**
   - Replace today's code-drawn otters and hummingbird with generated sprites:
     - dancing otter in 2–4 frames
     - angry otter with spear
     - angry hummingbird with staff
     - a few background silhouettes for the far band
   - Tool: GPT Image (transparent), then the pixel pass. *About 30 images. Small cost.*
5. **Skins.**
   - Ember Chipmunk card art first (a fire-tinted version of the chipmunk).
   - Then a skin template so each new skin is one prompt plus one review.
   - Tool: GPT Image edit of the existing card art. *About 5–10 images per skin.*
6. **Card art LoRA.**
   - Train on 30 of our best PixelLab cards, using FLUX.2 [dev] via fal (about $6.40 per 1,000 training steps).
   - Then generate Maps 9–10 cards and the Home sprites that are waiting on PixelLab.
   - Keep PixelLab for hero cards. *Decision **A2**.*
7. **Hit VFX sprites.**
   - Claw, bite, sting, peck and scorch decals as 4–6-frame sprite sheets, replacing the current vector marks where they look better.
   - Tool: GPT Image (transparent).
8. **Pack wrappers and card backs.**
   - One wrapper per pack (Sprout Pouch, Acorn Chest, Golden Bramble Case) and two or three card-back designs.
   - Tool: GPT Image.

### C. Marketing collateral

9. **Key art.**
   - The otter-vs-hummingbird standoff as a wide painting: 16:9 for the site and store pages, 1:1 for social, 1200×630 for link previews (`og:image`; the site has none yet).
   - Tool: GPT Image or the LoRA, upscaled.
10. **Trailer, 30 s.** Built from 5–6 Kling clips:
    - the splash crowd parting
    - a pack tearing open
    - a Shiny reveal
    - Ember Chipmunk breathing fire
    - a castle falling

    Gameplay capture is cut between them. *About 6–10 Kling clips. Decision **A3**.*
11. **Short-form loops (9:16).** Three 6–10 s clips for social: pack opening, fire breath, the map glide.
12. **Store and press kit.** Logo variants, 6 screenshots, a one-paragraph pitch, the key art. *Cost: none beyond items 9–11.*

### D. Process

13. **Review gate.**
    - Every generated asset lands in the Visual Library (hub) as "proposed".
    - Nothing ships until the owner picks it.
    - The prompt and settings are saved next to each image so it can be regenerated.
14. **Labelling and terms.**
    - Note AI-generated assets in the credits.
    - Re-check OpenAI, Kling and fal commercial-use terms before any paid marketing.
    - Never prompt with real artists' names or existing characters.

## Suggested order

A1 (keys) → 1–2 → 4 (splash) → 5 (Ember Chipmunk) → 6 (LoRA test on 10 cards) → 9 → 10.

## Sources

- [gpt-image-2 transparent backgrounds (20 Aug 2026)](https://ecorpit.com/gpt-image-2-transparent-background-preview-no-token-table-2026/)
- [fal FLUX.2 trainer](https://fal.ai/models/fal-ai/flux-2-trainer/llms.txt)
- [Kling 3.0 overview](https://www.atlascloud.ai/blog/guides/kling-ai)
