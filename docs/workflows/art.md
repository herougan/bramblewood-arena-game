# Workflow: art generation and visual review

For card art, map and raid backgrounds, frames, briefs and art review.

## Files you need
- Direction: `docs/style-guideline.md`. Prompt patterns: `docs/art-style-prompts.md`. Briefs: `docs/art/*-briefs.md`.
- Card art:
  - `art/cards/<id>.png`: square, 256 px, quantized to 256 colours;
  - the same PNG as a data URI in that card's `art` field in `canonical/cards.json`;
  - built copies in `assets/cards/*.webp`.
- Reuse map: `tools/art_reuse_map.py`, `docs/art/art-reuse-map.md`.
- Rejected art: a card's `artReview {status:'rejected', reason}` (set in the in-game card editor) is the review queue.

## Rules
- NightCafe: generate with the owner's credits. Never buy plans, PRO models or LoRAs. Never vote, claim streaks or act for the owner; just close popups.
- PixelLab: never buy credits, and never print the bearer token. Never use the watermarked stock image.
- Every prompt has a background. Avoid the banned prompt words listed in `/CLAUDE.md`.
- Art jobs are isolated (no shared code), so they can run in parallel with code work.

## Review
- Look before shipping. `python3 tools/shot.py --screen codex` (or `--js` to open a card) gives 390 px and 1366 px shots in `tests/out/shots/`. View them, don't just generate them.
- For many images, build one contact sheet (a grid PNG) and view that once instead of each image.

## Done when
The art is in place in all three spots, the brief is updated, the shot is viewed, and rejected cards are cleared or re-queued.
