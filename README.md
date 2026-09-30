# Bramblewood Arena

A card-battle microsite (otters vs. hummingbirds). This repo holds both the full source and the
assembled single-file build that's actually deployed.

## What's here

- `index.html` — the deployed build: a single self-contained HTML file (~5.5MB) with everything
  inlined (game code, GSAP, the Supabase SDK, all card art as data URIs). This is what Vercel
  serves. Deployed on Vercel from this repo.
- `arena_app.js` / `bramblewood-engine.js` / `arena_template.html` — the actual source. `arena_app.js`
  is the UI/app layer; `bramblewood-engine.js` is the combat engine (kept dependency-free, no DOM
  access, so it can also run headless in tests); `arena_template.html` is the page shell/CSS.
- `canonical/cards.json` / `canonical/characters.json` — the full card and character/Bramble
  dataset, as plain JSON (this is the actual game data — balance changes, new cards, etc. all
  happen here).
- `assemble_arena.py` — the build script. Reads everything above (plus the three vendored
  libraries below) and writes `index.html`. Run it after any source change:
  `python3 assemble_arena.py`
- `gsap.min.js` / `Flip.min.js` / `supabase.umd.js` — vendored copies of GSAP (+ its Flip plugin)
  and the Supabase JS SDK, inlined into the build rather than loaded from a CDN so the assembled
  page stays self-contained and works offline/from a local file too.

## Backend

Live data (accounts, decks, match history, ranked, guilds, raid bosses) is backed by Supabase.
The client only ever uses the public anon key (safe to expose, gated by Row Level Security) —
never a service-role key. Card/character data itself (`canonical/*.json`) is NOT stored in
Supabase; it's baked directly into the build.

## Rebuilding after a source change

```
node --check arena_app.js && node --check bramblewood-engine.js   # syntax check first
python3 assemble_arena.py                                          # writes index.html
```
