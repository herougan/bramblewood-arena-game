# Architecture cheat sheet (2026-11-11, GUIDE1)

One static page, no framework, no bundler, no server code of ours except Supabase SQL. Names to grep: `docs/guides/arena-app-index.md`.

## The build (`python3 assemble_arena.py && mv bramblewood-arena.html index.html`, about 40 s)
`assemble_arena.py` reads `arena_template.html` and fills placeholders:

| Placeholder | Filled with |
|---|---|
| `__ENGINE_SRC__` (in the template) | engine block + "ghosts" block, below |
| `__ENGINE_SRC_STRING__` | the engine block as a string, `window.__BRAMBLEWOOD_ENGINE_SRC__`: the simulator Web Worker runs it |
| `</body>` | GSAP 3.13 + Flip (`gsap.min.js`, `Flip.min.js`), `supabase.umd.js` (supabase-js 2.116), then `arena_app.js` |
| `__CARD_DEFS__`, `__RAIDS__`, `__MAP_POOLS__`, `__SKILL_COSTS__`, `__PRO_SKIRMISHES__`, ... (about 40, all `__NAME__`) | JSON from `canonical/*.json` (and a few `docs/` files), put into `arena_app.js` |

- Engine block, in order: `bramblewood-budget.js`, `var __SKILL_DELIVERY__` (canonical/skill-delivery.json), `var __SKILL_PARAMS__` (canonical/skill-params.json), `bramblewood-skillparams.js`, `bramblewood-taxonomy.js`, `bramblewood-engine.js`.
- Ghosts block: ghosts, autobattle, raid, trench, coop, integrity, shaders, skillfx, procfx, unitfx, fx-a..g, splash, i18n, then texts, a11y, guild, `tools/skill_costs.js`.
- Not in the game: `bramblewood-fx-war.js`, `bramblewood-fx-ideas.js` (Effects Lab only, `tools/effects-lab/build.py`).
- Card art and map art become hashed files in `assets/` (`?v=<hash>`); `BW_INLINE=1` inlines everything (single-file page).
- Language packs: `lang/ui/<code>.json`, then `lang/cards/<code>.json`, then `lang/<code>.json` (later wins) are merged into `assets/lang/<code>.js`, loaded when the language is picked.
- `cards.json` keeps one fused key per skill family; the build expands them to the flat keys the game reads (`tools/skill_params.py`).
- `"pool": true` cards never reach `__CARD_DEFS__` (Admin sees them through `__POOL_CARD_DEFS__`).
- Build stamp: `version.json` + the page's `__BUILD_ID__` / `__BUILD_CARD_HASH__` are one pair. Commit both; `bash tools/merge/check_build_pair.sh` before a push.
- Generated, never hand-edited: `index.html`, `version.json`, `assets/lang/*.js`, `docs/game-texts.xlsx`, `docs/decisions.md`, `docs/code-map.md`, `docs/guides/arena-app-index.md`.

## Files and their jobs
| File | Lines | Job |
|---|---|---|
| `arena_app.js` | ~65.7k | Every screen and the meta-game: map, Codex, deck editor, Forge, Nest, shop, raid UI, cloud sync, admin. Globals, no modules. |
| `arena_template.html` | ~15.6k | Page shell and almost all CSS (tokens in `:root`; long one-line rules) |
| `bramblewood-engine.js` | ~12.4k | DOM-free battle rules and the CPU. Browser global and `module.exports` for Node |
| `bramblewood-texts.js` | ~3.7k | `TEXT` table (`/*TEXT-TABLE-START*/`) and `TX(key, vars)` |
| `bramblewood-i18n.js` | 320 | Page translator `i18`, `BramblewoodI18n` |
| `bramblewood-budget.js` | 570 | N(L), stat checks, Forge curve (`BramblewoodBudget`) |
| `bramblewood-raid.js`, `-trench.js`, `-ghosts.js`, `-autobattle.js`, `-coop.js`, `-guild.js` | small | DOM-free models, each `root.Bramblewood<Name>`, each with a Node test |
| `bramblewood-fx-*.js`, `-skillfx.js`, `-unitfx.js`, `-procfx.js`, `-shaders.js`, `-splash.js` | 0.3-2k each | Visual effects (`FX.A..G`, `SkillFX`, `UnitFX`, `ProcFX`, `BramblewoodShaders`) |
| `canonical/*.json` | | Data sources: `cards.json` (49 MB, art inlined: never Read it), raids, map pools, skill costs, PRO decks |
| `tools/` | | Python/Node tools: build helpers, balance sims, i18n scripts, hub, merge |
| `tests/` | | `run-all.sh` (the list), `run.js` (runner), Node unit tests, `tests/e2e/*.py` (Playwright) |
| `electron/` | | Desktop wrapper (proof of concept): loads the built `index.html` from `app://` |
| `supabase/` | | `migrations/` (applied), `proposed/` (waits for "apply it"), `oneoff/` |
| `hub/`, `tools/hub/` | | The project hub artifact (built to gitignored `.hub/`) |

## Runtime flow
1. Page loads: scripts run top to bottom in one global scope. `arena_app.js` reads `localStorage`, builds card defs (`getCardDefs`, cached; `invalidateCardDefs` after edits), wires the UI.
2. `initCloudSync()` makes the Supabase client (`sbClient`), loads `card_overrides` (public read), signs in anonymously, pulls the player's rows if signed in.
3. Navigation: `switchTab(tab)` hides every `#view-<tab>` but one and calls that tab's renderer (`safeRender('Name', fn)` catches its errors). Play has sub-tabs (`playSubTab` → `renderConquestSubTab`, `renderRaidSubTab` ...); the Codex has `codexSubTab`.
4. Renderers rebuild HTML strings (`el.innerHTML = ...`, `escapeHtml` / `escapeAttr` on every interpolated value), then wire listeners.
5. A fight: `startConquestMatch(mapId, nodeKey)` (map fights; `startMatch(mode, opts)` for Quick Battle / Pass & Play / Gauntlet, `startTutorialMatch`, `startRaidPartMatch` ... for the others) calls `makeSimEngine(getCardDefs(), nextMatchRng(), {recordEvents:true, rules: fightRules(mapId, node), ...})` and sets `matchState = {engine, players, ...}`. Each round `resolveRound()` steps the engine and plays its `events[]` as animation (`renderVfxForEvent`, GSAP). A decided fight records its result (`recordMatchResult`, `fightRewardBegin`, the results screen `rewardsPanelHTML`); `endMatch()` leaves the fight and cleans up.
6. Simulations (Test Lab, skirmish editor panels) run `makeSimEngine` with `recordEvents:false`, seeded (`seededRng(seed)`); the bulk simulator runs the engine string in a Web Worker.

## Where state lives
| State | Where | Notes |
|---|---|---|
| Current screen | `currentTab`, `playSubTab`, `codexSubTab` | plain `let` globals |
| Live fight | `matchState` (about 1,200 references) | null outside a fight; many guards test it |
| Player wallet, cards, decks | `myCurrencies`, `myCardCopies`, `myDeckCounts`, `myDecks`, `myUnlockedCardIds`, `myCardLevels` | mirrored to `localStorage` |
| Saved progress | `localStorage` keys `bramblewood_*` (165 `*_KEY` constants) | offline-first: the browser is the source for a guest |
| Cloud copy | Supabase rows (see `docs/guides/networking-api.md`) | pushed only for real (non-anonymous) accounts |
| Live card edits | `liveCards`, `liveDeletes` from `card_overrides` | override `cards.json` at load; fold them back with the fold tools |
| Admin | `adminModeEnabled` (UI switch), `cloudCardAdmin` (server `is_app_admin()`) | the server decides what an admin may write |
| Effects level | `fxLevel()` (`bramblewood_fx_level`: none / low / med / high) | `fxAtLeast('med')` gates decorative effects |

## Node side (tests and tools)
- `require('./bramblewood-engine.js')` gives `makeSimEngine`, `simulateOneMatch`, `mulberry32`, `TRIGGER_KEYS`, `ACTION_KEYS` ...
- `tests/lib/harness.js`: engine + `canonical/cards.json` (art stripped), seeded boards, golden files.
- `tools/lib_bramble.js`: cuts named functions out of `arena_app.js` and evaluates them (`B.G.skirmishCastle(...)`, `B.G.fightRules`, `B.MAPS`). Add a name to its `NAMES` list to reach a new app function from Node; never copy app logic into a tool.
- Tests that need app code cut out `// NAME:BEGIN` ... `// NAME:END` blocks of `arena_app.js` (list in the index). Keep those marker lines.
- `tools/lib_map_pools.js`: map pools, `fightPool`, `isOutOfPlay`.

## Deploy
- Push `main` → Vercel serves the repo root statically (`vercel.json`: security headers and a report-only CSP whose `connect-src` allows only the Supabase project). A new outside origin needs a CSP entry.
- The page re-reads `version.json` each session and asks to update when the build differs.
- Release steps: `docs/workflows/release.md`. Hub: `python3 tools/hub/build.py`.

## Conventions that save rework
- New player text: a `TX('ui.<pkg>-<name>')` key + 12 language rows (`docs/guides/i18n.md`). Literal English in `arena_app.js` goes to `lang/ui`.
- New skill: engine rule + app registry entry (`PASSIVE_DEFS` / `ACTION_DEFS` / `TRIGGER_DEFS`) + price in `canonical/skill-costs.json` + TX texts + a scenario test (`.claude/agents/engine-architect.md`).
- Patching a registry entry: `sk1Patch(list, key, patch)`. A later patch of the same key replaces the earlier one: edit the existing patch instead of stacking another.
- Dated code comments: `// 2026-11-11 (package XX): reason`, one line (`docs/workflows/code-quality.md`).
