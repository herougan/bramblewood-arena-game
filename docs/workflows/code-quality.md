# Code quality: least code that works (2026-11-11)

Adapted from the Ponytail ruleset (DietrichGebert/ponytail, MIT) at the owner's request (2026-11-11: "The ponytail is used to make our code of higher quality").
Every package walks this ladder before writing code, and stops at the first rung that answers:

1. **Does it need to exist?** Re-read the request. Drop extras nobody asked for (options, settings, abstractions "for later").
2. **Is it already in the codebase?** Search `docs/code-map.md`, then `grep -n`. arena_app.js often has a helper (ui37*, cardTile, TX, mapNumberOf...). Reuse or extend it; never write a second copy.
3. **Does the platform already do it?** Browser APIs, CSS, GSAP (already loaded), Node / Python standard library.
4. **Does an installed dependency cover it?** Do not add a new dependency for a few lines.
5. **Only then write the minimum**, plus one small test if the logic can break.

Never cut: validation where data comes from outside (cloud rows, imports, user input), data-loss handling (saves, picks), security, accessibility, translations (TX keys + language packs).

When reviewing a package: flag code that duplicates an existing helper, dead code left behind, and new options nobody asked for.

## In-game copy (2026-11-11, package GUIDE1)
Every English word is paid 13 times (English + 12 languages) and has to fit a 390 px chip.
- Short and plain. A label names; its tooltip explains; the Codex holds the full rule. Never repeat a tooltip's explanation in the label or the toast.
- No duplicate labels: what the position already says stays out (style guide section 6, "Think contextually"). The full meaning goes in `aria-label`.
- Numbers over adjectives: "+1 Attack", "1 🔑 a floor", not "a little harder", "a few keys". Ranks are the hex emblem; chances are icons and numbers (`docs/workflows/ui.md`).
- One text per thing. Change the existing TX key in place; never add a second key and patch it over the first. Delete keys nothing shows, with their 12 pack rows.

| Before | After |
|---|---|
| `toast.fg-nothing-to-disenchant` (29 words): "♻️ Nothing to disenchant: no card has copies beyond its deck limit (Common {c}, Uncommon {u}, Rare {r} …). Base and Quest cards, foils and Shinies are never touched." | "♻️ Nothing to disenchant: no copies over the deck limit." (the limits and exceptions belong in the Disenchant tooltip) |
| `ui.dungeons-sub`: "Endless climbs, a little harder every floor. Each floor uses a key (all the Dailies share them), win or lose; lose and the climb starts again from floor 1." | "Endless climb. Each floor costs 1 🔑, win or lose. Lose: back to floor 1." |
| Guardian has three texts, `ui.en8-guardian`, `ui.eng9-guardian`, `ui.e22-guardian` (50-84 words each), each set by its own `sk1Patch(PASSIVE_DEFS, 'guardian', ...)`; only the last one shows, all three are translated 12 times | One key, edited in place when the rule changes; the edge cases in the Codex note |

## Code comments (2026-11-11, package GUIDE1)
- One line: `// <date> (package XX): <why the code is this way>`. Not the story of how it got there: git and `docs/CHANGELOG.md` hold that.
- No narration: no long owner quotes (a few words and the time are enough), no "used to", "this fix", "now", no restating what the next line does.
- When you change code under an old comment, rewrite the comment to the current truth and delete the history. A stale comment costs every later reader and misleads them.
- Keep `// NAME:BEGIN` / `// NAME:END` markers (tests cut those blocks out) and real warnings ("keyify deletes keys built by name").
- Docs and reports follow the same rules: CHANGELOG entries are a few bullets of numbers and names, not paragraphs.

Before (`arena_template.html`, above `.board-row`): 70 comment lines from four dates (09-16 to 09-22). The first paragraph's rule (rows scroll sideways) was reversed by the last, and it gives `--match-card-h` as 196px and the row's `min-height` as 252px; the code now has a 149px base token (a `clamp()` in fights) and `min-height:214px`. After:
```css
/* 2026-09-22: rows never clip or scroll; .battlefield clips and the board pans (fitBattlefieldZoom / wireBattlefieldPan). */
```
Before (`arena_app.js`, above `levelStatMultiplier`): 60 comment lines over a 3-line function, the first paragraph describing a +100% curve the code no longer has. After:
```js
// 2026-09-18: legacy level curve; only callers outside getCardDefs (the autobattler's power) still use it.
```
Before (`switchTab`):
```js
// 2026-10-15 (user: "Forge is not a submenu of Codex" + "I pressed codex and it went to Forge"): the Forge is its own page that
// happens to be drawn in the Codex view, so leaving it forgets it; the next plain visit to the Codex opens Browse.
```
After:
```js
// 2026-10-15: the Forge is its own page drawn in the Codex view; leaving it resets the Codex to Browse.
```

When reviewing: also flag player text that explains what a tooltip already says, a second TX key for the same thing, and multi-line history comments.
