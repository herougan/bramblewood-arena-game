---
name: continue
description: Use when the owner says "continue" (or "keep going"): the default Bramblewood Arena work plan, background CPU use, the roadmap step and the short report format.
---

# "Continue": the default plan (owner 2026-11-28 12:20)

"Every time I say continue, it's to make the game better and keep you not idle while I design."

## Why now
We are redesigning cards so they are much more **strategic, diverse and fun**. Maps 0-20 exist to explore the whole design space we created, give players the options they imagine in a card game, and show what is lacking.

## Roadmap step (name it in every report)
Prototype → **Balance (now)** → Content and polish → Closed playtest → Post on user-testing forums → Open beta → Launch.

## Default work, one code agent at a time (docs-only and tools-only agents may run beside it)
Each track works in layers: a strategy pass first (a short design doc + owner decisions), then agents dig deeper and build.
1. **Effects (VFX):** skill, trigger, field and boss effects; card art (living art); GIFs for the owner.
2. **Skills (gameplay):** the ladder, On Death, reactive "protect this turn" answers, archetypes and the roles cards fill (engines, value over time, immediate pressure).
3. **Personalisation:** foil treatments, special animations, skins (static / moving lines / animated), tribe flourishes (a Swarm of Ants makes this, a Swarm of birds makes that).
4. **Card design passes:** cards that are dull, duplicate, or a glass cannon / wall only by stat fit.
5. **Also:** CPU play quality, onboarding and tutorial clarity, performance, test robustness, accessibility and translations, new species (art when PixelLab downloads work), open owner decisions waiting on a build.
Never: map-list, pack, Special or reward changes while the owner has them paused (11-27 11:22); purchases; live database writes without "apply it".

## Background CPU when otherwise idle (one job at a time, sharded, commit progress)
- A full road measure after any rule or card change (25 min; docs/workflows/balance.md).
- Skill and card simulations: card power ratings (tools/card_balance.js --resume), skill worth.
- The resource-skill bench (RESBENCH): test decks A-0 ... A-n.
- New robust tests for anything a package changed.

## Report format (short)
- One line per finished thing, player-visible first.
- Interruptions in one line ("Server stopped 5 hours ago."), no list of what is left.
- **Where we are:** roadmap step + the road in one line (e.g. "Balance: road 180/208 in band").
- Questions only when the owner must decide.
