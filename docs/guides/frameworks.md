# Frameworks and tools cheat sheet (2026-11-11, GUIDE1)

The game is plain browser JavaScript in one global scope: no framework, no modules, no bundler, no TypeScript, no root `package.json`. Use what is already loaded before adding anything (`docs/workflows/code-quality.md`, rungs 3-4).

## In the page
| Library / API | Version | How it is used | Rules |
|---|---|---|---|
| GSAP + Flip | 3.13.0 (`gsap.min.js`, `Flip.min.js`, inlined by the build) | All choreographed motion: skill FX (`bramblewood-skillfx.js`), card moves, results | Check `hasGsap()`; gate decoration with `fxAtLeast('med')` and `reducedMotion()`. GSAP owns `transform` on cards: ambient CSS motion uses the separate `translate` / `scale` properties in `:where()` selectors so GSAP wins. Beats inside an effect use `gsap.delayedCall` (it follows the hit-stop time scale), not `setTimeout`. After a Flip in absolute mode, `clearProps:'transform'`. |
| supabase-js | 2.116 (`supabase.umd.js`, global `supabase`) | One client, `sbClient`, made in `initCloudSync()` | `docs/guides/networking-api.md` |
| WebGL | browser | `bramblewood-shaders.js`: one canvas per surface (battlefield floor, splash, map), never one per card | Ambient frames at about 30 fps |
| Web Audio | browser | `SoundKit` in `arena_app.js`, cues built from `tone()` / `noise()` only | A new mechanic gets its own cue (style guide section 4-5) |
| Web Worker | browser | The bulk simulator runs the engine string (`window.__BRAMBLEWOOD_ENGINE_SRC__`) from a blob URL | Engine code must stay DOM-free |
| CSS | hand-written in `arena_template.html` | Tokens on `:root`, dark mode twice (media query + `[data-theme="dark"]`), `--match-card-w/h` for in-fight cards | `.claude/agents/ui-ux.md` |
| Fonts | `fonts/*.woff2` (Nunito, Baloo 2, MedievalSharp, Caveat, Lilita One); CJK and Tamil from Google Fonts on demand | `fonts/fonts.css` | Style guide: Nunito body, Baloo 2 headings and card text, MedievalSharp the wordmark only |

## Node (tests and tools)
- Node 22. Built-in modules only (`fs`, `path`, `vm`, `child_process`, `worker_threads`, `crypto`), plus Playwright 1.56 from the global modules for a few browser tests.
- No test framework. A test is a script that prints `✗ <message>` lines and exits non-zero on failure, usually through a local `ok(cond, msg)`. Copy that shape from a recent test (`tests/card-pass-2026-10-19.js`); do not add jest or mocha.
- `require('../bramblewood-engine.js')`, `tests/lib/harness.js` (seeded boards, card defs without art), `tools/lib_bramble.js` (app functions cut out of `arena_app.js`), `tools/lib_map_pools.js`.
- Balance sims are Node with `--workers 2` (two cores; run them alone). `tools/opt/build-exe.sh` packs the deck optimizer as a Node single-executable app; `.github/workflows/deckopt.yml` runs it on GitHub runners.
- The runner: `tests/run.js` (tiers, cache, timings; `docs/guides/testing.md`).

## Python
- Python 3.13. Used for the build (`assemble_arena.py`), text tools (`tools/text/*.py`, `tools/i18n_*.py`), art (`PIL`), spreadsheets (`openpyxl`: `docs/game-texts.xlsx`), the hub (`tools/hub/build.py`), the code map, and every browser test.
- Playwright for Python 1.56, async API. Chromium: `/opt/pw-browsers/chromium_headless_shell-1194/chrome-linux/headless_shell`. WebGL needs `--enable-unsafe-swiftshader --use-angle=swiftshader --ignore-gpu-blocklist`.
- Serve the page over http (fonts and fetches fail on `file://`); `tools/shot.py` does it for you.
- Skip the intro in a script: `localStorage.setItem('bramblewood_arena_tutorial_done','1'); sessionStorage.setItem('bramblewood_seen_splash','1')`, then `FEATURE_SPOTS.forEach(sp=> unlockFeature(sp.key))` to open every feature.
- Set the viewport explicitly (390x844 phone, 1366x860 desktop in `tools/shot.py`); the default 1280x720 has hidden real bugs.
- Read untrusted files with `python3 -I`.

## Outside the repo
| Service | Use | Access rule |
|---|---|---|
| Vercel | Static hosting of the repo root; a push to `main` deploys | Never buy anything; deploy only on an approved release |
| Supabase (`xjctfwobcsyiztecutrb`) | Auth, player rows, `card_overrides`, RPCs | Read-only SQL any time; writes only after "apply it" |
| GitHub Actions | `codeql.yml`, `deckopt.yml` | |
| PixelLab, NightCafe | Card and map art, through the browser | `.claude/agents/art-director.md` |
| Electron 44 + electron-builder 26 | `electron/`: desktop proof of concept (`npm start`, `npm run dist`), optional `steamworks.js` behind `BRAMBLE_STEAM=1` | Downloads about 100 MB: only when the task is the desktop build |

## Do not add
- A framework (React, Vue, Svelte), a bundler (webpack, vite), TypeScript, or a root `package.json` for the game.
- CDN scripts or new outside origins: the CSP in `vercel.json` allows only the Supabase project for `connect-src`, and the page inlines its libraries.
- A CSS framework, a second animation library, an icon font: emoji go through `EmojiStyle` sets in `assets/emoji/`.
- A test framework, or a Python dependency for something the standard library does.
- A new font family without the owner (style guide section 1).
