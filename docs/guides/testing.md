# Testing cheat sheet (2026-11-11, GUIDE1)

The list is `tests/run-all.sh` (about 400 tests); the runner is `tests/run.js`. Numbers below are from `tests/out/test-timings.json` in the main checkout (2026-11-10), recorded under the usual two-at-a-time load.

## Cost of each tier
| Command | What runs | Recorded time |
|---|---|---|
| `node tests/run.js --list [--only RE] [--smoke]` | nothing: prints what would run, cached or not | under 1 s |
| `node tests/run.js --smoke` | 7 tests: syntax, integrity, card-pass, i18n-ui, d-2026-10-19, scenarios (48 s), two-player (105 s) | about 2 minutes |
| `node tests/run.js --only 'RE'` | tests whose file name matches RE, cache on | seconds to minutes |
| `node tests/run.js` | every unit test, skipping cached passes | up to about 30 min cold (3,560 s of test time, 2 at a time) |
| `node tests/run.js --full --e2e` | everything, no cache, plus Playwright | about 1.5 h (6,450 s of e2e alone); release only |

The slow ones: e2e `flows` 758 s, `qa1_2026_11_02` 548 s, `bv_2026_10_24` 527 s, `qa2_2026_11_03` 462 s; unit `pr-2026-10-23` 504 s, `ui2-2026-10-29` 232 s, `card-matrix` 195 s. Never add them to a package's `--only` set unless the package touches their area.

## Pick the smallest set
1. Find the tests that name what you changed:
   `grep -lE "functionName|tx-key|card-id" tests/*.js tests/e2e/*.py`
2. Preview: `node tests/run.js --list --only 'name1|name2'`.
3. Run: build first if the test reads `index.html` (most UI tests do), then `node tests/run.js --only 'name1|name2'`.
4. Add your own new test to `tests/run-all.sh` (one `run node tests/<pkg>-<date>.js` line with a short `# comment`).

By kind of change:
- Engine rule, keyword, AI: `--only 'scenarios|card-matrix|two-player|async-raid|raid|keywords'`, then `node tests/run.js` (engine changes affect everything).
- Card stats or skills in `cards.json`: `--only 'card-pass|card-pool|i18n-cards|easter|integrity'`, then `node tests/card-matrix.js` (new diffs are reviewed, accepted with `--update` once per release).
- Budget formula: `--only 'level-curve|forge-curve|card-pass|raid-rb|raid-br|card-pool'`.
- Texts / translations: `--only 'i18n|game-texts'`; if `game-texts` times out under load, `python3 tools/text/selftest.py`.
- UI screen: `node --check arena_app.js`, build, `--smoke`, the area's tests found by grep, the area's e2e script, then `python3 tools/shot.py`.
- PRO decks: `--only 'pro'`.
- Balance tools: `tools/pipeline/run.sh test` (smoke + the balance set; known failures listed in `tools/pipeline/config.json`).

## Keep runs short
- **The pass cache is shared by every worktree** (2026-11-11, TOOLS1): `tests/run.js` keeps it in `$(git rev-parse --git-common-dir)/bw-test-cache/test-cache.json`, so a fresh worktree needs no copying and a pass in one worktree is a "skipped" in another whenever the inputs are byte-identical. `node tests/run.js --cache-dir` prints the path; `BW_TEST_CACHE_DIR=<dir>` overrides it; without git it falls back to `tests/out/`. The key is unchanged (each test's relative input paths and file hashes, the Node version, the build is deterministic); a test keeps its last 12 passing keys, so worktrees on different sources do not push each other out. The first run folds the old `tests/out/test-cache.json` into the shared file (the main checkout's when the file is new, this checkout's always; this checkout's is then deleted). Timings stay in `tests/out/`. Report skipped tests as "cached", never "passed".
- Inputs of a test are the repo files it names, now including `electron/` (not `node_modules`, `game`, `dist`) and `.github/workflows/*.yml` when it names them (desk2 stayed cached after those changed).
- A test that names no repo file depends on every source file: name the files it reads, so it can be cached.
- Do not run the full suite between merges or per package; the coordinator runs it once per release (`docs/workflows/release.md`), in the background after the push.
- Never run a test suite next to a balance sim (2 cores); `tools/pipeline/run.sh` takes a lock for heavy steps.
- A slow test that timed out under load is not a failure: rerun it alone (`node tests/run.js --only '^tests/<name>'`) before reporting it.
- The runner prints one summary line and the tail of each failure. Do not add `-v` style output; do not paste whole logs into reports.

## Writing a test
- Plain Node script: `let fail = 0; const ok = (c, m)=>{ if(!c){ fail++; console.log('  ✗', m); } };` ... `process.exit(fail ? 1 : 0)`. Copy the shape of a recent test.
- Engine behaviour: a board scenario through `tests/lib/harness.js` (seeded) or a JSON case in `tests/scenarios/*.json` (`{"name", "rounds", "hqHp", "A": [...], "B": [...], "expect": [...]}`).
- App logic without a browser: `require('../tools/lib_bramble.js')` and call `B.G.<function>`, or cut a `// NAME:BEGIN` block out of `arena_app.js` (list in `docs/guides/arena-app-index.md`).
- Browser behaviour: a Python Playwright script in `tests/e2e/` (copy one; it serves the repo over http and skips the intro), listed on the `--e2e` line of `run-all.sh`.
- Prove the new mechanic does something (the scenarios' "every effect does something" check covers card effects automatically).
- Seed every random choice; a test must give the same result on every run.

## Golden files
- `tests/golden/card-matrix.json`: `node tests/card-matrix.js` must show 0 failures; changed results are explained in the CHANGELOG and accepted with `--update` once per release batch, after review.

## Reporting
"N passed, M failed, K cached" from the runner's last line, plus each failure's name and one-line cause. Name what you did not run.
