---
name: card-level-design
description: Use when designing, redesigning or reviewing a Bramblewood Arena card's stats, skills and Level 0-10 table (levelBonus / levelSkills), e.g. "Redesign X for me" or a card review pass. Level 10 form first, then Levels 1-10 with skills learnt early.
---

# Card level design

Owner 2026-11-23 23:39 (item 14): "If needed, make a skill out of reviewing the cards e.g. making the lvl 10, then designing lvl1-10 etc. and making the skills learned spread out (mostly in the earlier levels learnt)".

For one card or a batch: a new card, a redesign the owner asks for, or a review of cards mid-design. Canonical data is `canonical/cards.json`; the budget is `bramblewood-budget.js`; settled rules are `docs/project-state.md` (search "Cards grow to Level 10", "Starter cards", "Base cards are Level 1"). Workflow file: `docs/workflows/card-data.md`.

## 1. Read before designing
- The card: stats, `effects`, `levelBonus`, `levelSkills`, `kind` (baby / base / faction), rarity, source, and whether the owner edited it. On an owner-edited card, change only what the owner asked.
- Where it lives: its map list (`canonical/map-pools.json` and the owner's Yes picks), that map's table row (`MAP_FOCUS_SKILLS` and `MAP_SPECIAL_SKILL_NAMES` in `arena_app.js`, or `docs/map-skill-table.md`), the map's rarity cap, its family and theme.
- Owner rules that bite:
  - a skill is New! only on the map whose table row has it, at most two new skills a map;
  - Fork is for octopi only and Trident is rare (owner 2026-11-23);
  - resistances / weaknesses only when super relevant, default none (owner 2026-11-23);
  - printed card = obtained card;
  - starter, baby and faction cards start at Level 0, base cards at Level 1;
  - Hatchling and Regeneration arrive at Level 1.

## 2. Concept
One sentence from the real animal: what it does, and how that becomes one core skill (the one its name or behaviour names) plus at most one or two more. Vanilla cards are fine ("not everything needs effects").

## 3. Design Level 10 first
The Level 10 form fills N(10) at the card's Level 1 fill, held inside 85-100% (`levelBonusAt`, N(L) in `bramblewood-budget.js`). Choose the growth style by the skill share of the growth: A stats only, B about 10%, C about 25%, D about 50%.

## 4. Then Levels 1-10 (0 for starter / baby / faction)
- The core skill is there from the card's first level (Level 1 for Level 0 starters, per the rule).
- Every other skill is learnt later, spread out and mostly early: e.g. Levels 2, 3 and 5 (`levelSkills`). Late levels (6-10) carry stat steps and +1 steps of a growable skill, typically at 4 / 7 / 10.
- Stats follow the card's own Attack : Health shape. No level breaks either cap at N(L); a step that breaks one moves a level later.
- Stored form: `levelBonus {"L": {attack, health, skills}}` (stat deltas; skills are the absolute new values) and `levelSkills {"L": {key: value}}`.

## 5. Check
- `node tools/lvl10/gen_2026_11_18.js --dry --card <id>` prints the generator's table for comparison. Never use `--force` over owner edits.
- Budget at every level with `bramblewood-budget.js` (`levelBonusAt`): inside the card's band, or list it.
- If the card is in road or reference decks, list the fights it can move; the coordinator re-measures.
- Tests: `node tests/run.js --only 'card|budget|lvl'`; the card matrix golden only via its `--update` after reviewing the diff.

## 6. Output
- A table per card: Level, Attack / Health, skills, budget %, with before / after and a one-line why, in a dated doc under `docs/design/`.
- Apply to `canonical/cards.json` only what the owner asked for. Anything else is a proposal, or a `docs/decisions.json` item (body under 100 words).
- Code and data comments: a date and the reason.
