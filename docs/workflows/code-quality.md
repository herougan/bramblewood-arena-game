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
