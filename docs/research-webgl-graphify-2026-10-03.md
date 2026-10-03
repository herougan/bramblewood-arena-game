# Research: WebGL next steps and graphify (2026-10-03)

There are two threads here:
1. Where to take the shaders after v1 (T7).
2. What "graphify" is, and whether it helps the AI work on this codebase. I ran it on our code; the results are below.

---

## 1. WebGL: what to try next

### Where we are (v1, shipped today)
- **Splash and Home:** one fragment shader over the painted art. It decides per pixel by colour: green sways, blue in the lower half ripples, bright areas bloom. It adds light shafts and fireflies.
- **Maps:** each Conquest map has a procedural overlay (caustics, embers, fog and lantern, aurora…).
- **Limit:** WebGL can only draw what we hand it as a texture, so the cards and the board (DOM) can't be shader-processed directly. That limit shapes everything below.

### The big unlock to watch: HTML-in-Canvas
Chrome has an **origin trial for "HTML-in-Canvas"**: it renders live DOM elements into a canvas and uploads them as a WebGL texture.
- **Names:** `texElementSubImage2D` for WebGL, `drawElementImageToTexture` for WebGPU, and the `content="drawable"` canvas attribute.
- **Status:** the trial runs through Chrome 160, and the API names changed in Chrome 150/155.

**What it would allow:** real post-processing on the actual battlefield.
- heat haze over the cards;
- shockwave ripples through the board when a castle is hit;
- a CRT/pixel filter as an "atmosphere pack";
- a page-curl as the game moves between screens.

**Today it's Chrome-only and experimental.** Plan:
- feature-detect it;
- use it as an enhancement on Chrome;
- keep the current overlays as the fallback everywhere else.

I'd prototype one effect (castle-hit shockwave) behind a flag once we have an origin-trial token for the Vercel domain.

### Ranked experiments (value ÷ effort)

| # | Experiment | Why it fits Bramblewood | Effort |
|---|---|---|---|
| 1 | **Holo foil shader for foil and alt-art cards** | Collectors' pride (T6), and foil already exists as data. A rainbow sheen plus sparkle that follows the pointer or device tilt. One small canvas per *detail-view* card; never on every hand card. | S |
| 2 | **Depth-map parallax for the Home and splash art** | One extra greyscale depth image per scene turns the flat painting into a real 2.5D camera sway (true depth, not just layered sprites). The depth map can be painted, or generated offline with a monocular depth model. | S–M |
| 3 | **Water mask instead of colour guessing** | Today "blue in the lower half" is treated as water. A painted mask (one PNG) gives proper reflections: the flipped scene plus sine displacement, as in the pixel-art water technique below. It also stops the sky rippling. | S |
| 4 | **Pointer-lit normal mapping** | Torches and lanterns that light the cave maps and cards by direction. Normal maps can be generated from the pixel art (tools: Laigter, SpriteIlluminator), or faked from brightness. "Light by darkening" avoids the washed-out look. | M |
| 5 | **Battlefield weather layer** | Rain splashes on the felt, a lane glow at the start of your turn, lightning on storm maps. Same overlay technique as the maps, under the cards. | S |
| 6 | **Castle-hit shockwave and screen distortion** | Needs HTML-in-Canvas (above) to distort the real board. Without it, distort only the background layer. | M (Chrome-only) |
| 7 | **Day/night from the local clock** | Just uniforms (light colour, shadow length) on the shaders we already have. | S |
| 8 | **Moddable atmosphere packs** | JSON plus small GLSL snippets. Security note: a shader can't read data, but a bad one can hang the GPU, so player-made packs need admin approval and a frame-time watchdog that turns them off. | M |

### Engine choices
- **Stay on raw WebGL1/2 for now.** Our layers are a few fullscreen quads; a library adds weight for little gain.
- **WebGPU now ships in all major browsers,** including Safari/iOS 26. Worth it later for compute (particles, fluid water). Not needed for these effects; WebGL stays the baseline.
- **PixiJS + pixi-filters** has ready-made GodRay, Shockwave, Glow, Pixelate, CRT, Bloom and Displacement filters. Good if we ever move the battlefield itself to a canvas renderer; overkill for overlays.

### Performance guardrails (keep for every experiment)
- Half-resolution render targets.
- One shared requestAnimationFrame loop.
- Pause off-screen and in hidden tabs.
- Off with reduced motion and on 2-core or data-saver devices (already true).
- Next: auto-downgrade if frames run long. Measure the frame-time over 2 s; if it's over ~6 ms on our layers, halve the resolution, then turn the layer off.

**My recommendation for the next WebGL batch:** #1 foil, #3 water mask, #5 battlefield weather. Then prototype #6 on Chrome.

---

## 2. graphify: a code knowledge graph for AI assistants

### What it is
`graphify` (Graphify-Labs, Apache-2.0/MIT, pip package `graphifyy`) turns a folder into a **queryable knowledge graph**.
- **Code:** parsed locally with tree-sitter (about 40 languages including JS, TS and Python). It's deterministic, needs no LLM, and nothing leaves the machine.
- **Docs, PDFs and images:** optionally sent to your AI assistant's model for relationship extraction. That part costs tokens.
- **Edges:** every edge is tagged `EXTRACTED` (read from source) or `INFERRED`. It's a real graph, not a vector store.
- **Outputs:** `GRAPH_REPORT.md` (god nodes, communities, surprising links), `graph.json` and `graph.html` (an interactive view).
- **CLI queries:**
  - `graphify explain "X"`
  - `graphify path "A" "B"`
  - `graphify query "…"`
- **Install:** `graphify install` registers a `/graphify` skill for Claude Code, Cursor, Codex and others.
- **Vendor claim:** large token savings ("up to 49×") for assistants navigating a codebase. That's their benchmark; I haven't verified it.

Naming note: there's also a fork, `rhanka/graphify`. The main project is `Graphify-Labs/graphify`.

### I ran it on Bramblewood (code only, 0 tokens)
- `bash tools/code-graph.sh` (new) parses `arena_app.js`, the engine and pure modules, `assemble_arena.py` and `tests/`.
- **Result:** 1,391 nodes, 3,849 edges, 81 communities, 95% extracted / 5% inferred, in about a minute.
- **The report** is committed as [`code-graph-report.md`](code-graph-report.md). The 1.7 MB graph and the HTML view stay out of git.
- **God nodes** (most connected):
  1. `getCardDefs` (122)
  2. `makeSimEngine` (83)
  3. `escapeHtml` (78)
  4. `renderMatchUI` (64)
  5. `resolveRound` (62)
- **The useful finding:** "Community 0" is the top level of `arena_app.js`: 146 module-level globals with **cohesion 0.01**. That's hard evidence for something we've known: the 20k-line file wants splitting into modules (match UI, Conquest, shop/economy, admin/editors, cloud sync). The graph's communities are a ready-made split plan.
- **Queries work:** `graphify explain "resolveLiveTarget"` shows it's called only from `resolveCombatInner`.
- **Caveat:** `graphify path "playCardByUid" "resolveCombat"` returned a 6-hop path through the *offline raid* code, which is technically true but not the main route. Inferred edges can mislead, so treat paths as hints.

### Should we use it?
- **For me, the AI working on this repo:** yes, as a map. It's cheaper than re-reading big regions of `arena_app.js` to find who calls what. Code-only runs are free and local.
- **For docs:** skip for now. Our docs are already indexed in the claude.ai project, and doc extraction costs tokens.
- **Keep it fresh:**
  - re-run `tools/code-graph.sh` after big refactors;
  - `graphify watch` can do it live;
  - a git hook is optional.
- **Not a replacement for tests or for reading code before changing it.**

**Recommendation:** keep the script and report. Use the communities as the module-split plan when we do the `arena_app.js` refactor. That refactor also makes the graph, and every AI session, more effective.

---

## Sources
- [HTML-in-Canvas origin trial updates (Chrome)](https://developer.chrome.com/blog/html-in-canvas-ot-changes)
- [Exploring the HTML-in-Canvas proposal (Codrops)](https://tympanus.net/codrops/2026/05/13/exploring-the-html-in-canvas-proposal/)
- [Water surface shader for 2D pixel-art games](https://injuly.in/blog/water-shader/index.html)
- [Dynamic lighting and shadows in a 2D game (normal maps, "light by darkening")](https://mattgreer.dev/blog/dynamic-lighting-and-shadows/)
- [Parallax shaders and depth maps (Alan Zucconi)](https://www.alanzucconi.com/2019/01/01/parallax-shader/)
- [WebGPU is now supported in major browsers (web.dev)](https://web.dev/blog/webgpu-supported-major-browsers)
- [PixiJS filters](https://github.com/pixijs/filters/blob/main/README.md)
- [graphify (Graphify-Labs)](https://github.com/Graphify-Labs/graphify) · [graphify.net](https://graphify.net/) · [fork: rhanka/graphify](https://github.com/rhanka/graphify)
- [Graphify + Claude Code setup guide (token-savings claim)](https://clskillshub.com/blog/graphify-claude-code-integration)
