# Effects Lab contract (2026-10-15)

How the six effect batches add effects to the game and to the Effects Lab catalogue. The source of truth for *what* to
build is `docs/effects-inventory-2026-10-15.json` (933 entries; `batch` says whose it is). This page says *how*.

## Files

| File | What goes in it | Who edits it |
|---|---|---|
| `bramblewood-fx-a.js` … `bramblewood-fx-f.js` | the effect code: `window.FX.A` … `FX.F` | one batch each |
| `tools/effects-lab/manifest/a.js` … `f.js` | lab registrations (`FXLAB.register`) | one batch each |
| `arena_app.js` | one-line hook calls only (see "Hooking it in the game") | all, sparingly |
| `tools/effects-lab/fxlab-core.js` | the registration API and the stages (framework) | nobody in a batch |
| `tools/effects-lab/fxlab-catalogue.js`, `build.py` | the catalogue page (framework) | nobody in a batch |
| `tools/effects-lab/fixtures.json` | the game's own markup for the stages (`capstages.py` re-captures it) | nobody in a batch |
| `tools/effects-lab/manifest/_existing.js` | demos of effects that already exist (worked examples) | read it |

Never put new CSS in `arena_template.html`. Never edit another batch's files.
`assemble_arena.py` bundles the six modules after `procfx`/`unitfx`; `build.py` bundles the same six files, then every
`manifest/*.js` (one `<script>` each, so one broken manifest can't break the others).

## 1. Add an effect function (bramblewood-fx-X.js)

```js
// in bramblewood-fx-c.js, under "---- effects ----"
M.bossDeath = function(el, opts){                      // el: a .board-card (or .card-tile, map node, pill...)
  opts = opts || {}; const g = gsap, t = tileOf(el), c = centre(t);
  css('bossDeath', `.fxc-boss-ring{position:fixed; border-radius:50%; border:3px solid #ffd56e;}
                    @keyframes fxcBossPulse{50%{filter:brightness(1.6);}}`);
  const ring = layer('fxc-boss-ring');                 // fixed overlay on <body>; layer(cls, html, host) for an absolute one
  g.set(ring, {x:c.x - 40, y:c.y - 40, width:80, height:80});
  return new Promise(res=> g.timeline({onComplete:()=>{ ring.remove(); opts.onDone && opts.onDone(); res(); }})
    .to(ring, {scale:3, opacity:0, duration:.6, ease:'power2.out'})
    .to(t, {y:20, opacity:0, duration:.5}, '<.1'));
};
M.bossDeath_B = function(el, opts){ /* a second take */ };
```

Rules:
- **Names**: `FX.<Batch>.<camelCaseEffect>`; variants are `<name>_B`, `<name>_C` (A is the plain name). Lab variant keys are `A`, `B`, `C` to match.
- **Signature**: `(el or elements, opts)` → a Promise or nothing. Honour `opts.onImpact` / `opts.onDone` when the caller needs a beat (damage number on impact). Accept `opts.host` when the effect fills a screen or a board, defaulting to `document.body`.
- **Pure**: animate only the elements you are given (plus overlays you create and remove). Don't read `matchState`, don't change game state, don't call `renderBoard`. Clean up everything you add; leave the element as you found it (`clearProps`).
- **CSS**: through the module's `css(key, text)` (one `<style id="fx-c-style">`, each key once). Prefix classes and keyframes with your batch: `fxc-…`, `fxcName`. Use the game's variables (`--rarity-a`, `--ink`) where it helps.
- **Timing**: GSAP (`gsap.min.js` and Flip are already in the game and the lab; nothing to load). Use `later(fn, ms)` / `wait(ms)` from the module header instead of `setTimeout` so slow motion and hit-stop stretch your timing too. Never touch `gsap.globalTimeline.timeScale`.
- **Weight**: no network, no images you'd have to fetch (draw with CSS/SVG/canvas/emoji), short (≤ ~1.5 s for battle beats, ≤ 3 s for big moments), cheap (no layout thrash in loops; ≤ ~40 particles).
- Helpers already in each module: `css, layer, later, wait, centre, tileOf, rnd` (also exported on `FX.X`). The game's own helpers are globals you may call when present (`floatText`, `SoundKit`, `SkillFX`, `ProcFX`, `UnitFX`); guard with `window.SkillFX &&`.

## 2. Hooking it in the game

Battle events — no edits to `arena_app.js` needed. `renderVfxForEvent(ev)` calls `fxBatchVfx(ev)` after the built-in passes
(`fifthPassVfx`, `sixthPassVfx`, `labSkillFx`, `ninthPassVfx`, `eighthPassVfx`), which calls your `FX.X.onEvent(ev, env)`:

```js
M.onEvent = function(ev, env){
  if(!env.fxAtLeast('med')) return;                    // Medium effects and up; 'high' for heavy looks
  // ev = {type:'death', side, defId, uid, ...} from bramblewood-engine.js; the boss test is illustrative
  if(ev.type === 'death' && env.defs[ev.defId] && env.defs[ev.defId].boss && env.once('bossdeath' + ev.uid)){
    const el = env.el(ev.uid); if(el) M.bossDeath(el);   // fire and forget: never await, never block the replay
  }
};
```

`env`: `el(uid)` (the `.board-card`, like `boardCardEl`), `tile(uid)`, `defs`, `fxOf(defId)` (its `effects`), `battlefield`,
`at(ms, fn)`, `once(key)` (true once per unit per round, like `skillFxOnce`), `fxAtLeast(level)`, `level`, `hitAtMs(ev)` (when this hit's
impact lands), `sound(name, ...args)`, `match`. `fxBatchVfx` already skips everything under `reducedMotion()` or Effects "none", and
swallows errors (set `window.__fxDebug = true` to log them).
Find the event shapes in `bramblewood-engine.js` (`events.push({type:…})`) and in the inventory's `trigger` field.

Non-battle moments — add **one guarded line** at the right spot and handle it in `FX.X.hooks`:

```js
// arena_app.js, where the moment happens:
fxHook('mapNodeCleared', nodeEl);
// bramblewood-fx-e.js:
M.hooks.mapNodeCleared = (nodeEl, env)=>{ if(env.fxAtLeast('med')) M.nodeCleared(nodeEl); };
```

`fxHook(name, ...args)` calls every batch's `hooks[name]` with `env` appended, with the same gating and error guard. Pick distinct
hook names (prefix with your area if unsure). Where things happen in `arena_app.js`:

| Moment | Function |
|---|---|
| battle events, statuses, hits | `renderVfxForEvent` (use `onEvent` instead), `flashDmg`, `animateAttacker`, `hqHitBigVfx` |
| deaths | `deathVfx`, `deathStyleFor`; castle fall `castleCrumble` |
| conquest map | `renderConquestSubTab` (nodes, trail), `placeMapPawn`, `mapPawnDropIn`, `enterSubMap`, `leavesRevealToMap` |
| packs | `openPackAnimation` (`.po2-*` markup) |
| rewards and results | `rewardsPanelHTML`, `rewardsCheer`, the `winloss-overlay` block |
| forge, nest | `renderForge`, `renderNest` |
| dialogue, tutorial | `playDialogue` |
| toasts | `showToast` |

Always respect `reducedMotion()` and `fxAtLeast('med')` (the hooks do it for you); never `await` an effect inside the replay
loop; never hold `setTimeout` chains that outlive a match without checking the element is still connected.

## 3. Register the lab demo (manifest/X.js)

```js
(function(){
const R = FXLAB.register, X = ()=> window.FX.C;
R({id:'death-boss', stage:'board', note:'Boss units get their own fall.', inGameHook:'onEvent: death of a boss unit',
  variants:[
    {key:'A', label:'Gold ring and drop',  play:ctx=> X().bossDeath(ctx.board.foe[1])},
    {key:'B', label:'Shatter into scales', play:ctx=> X().bossDeath_B(ctx.board.foe[1])},
  ]});
})();
```

- `id` must be an inventory id, else the catalogue lists the problem at the top. One `register` per id; a second call with the same id adds/replaces variants.
- `stage`: `cards | board | map | pack | ui | screen` (default from the area: combat/status/field/weather/darkness/death/castle/summon/raid → board, card-treatment/foil → cards, pack → pack, map/world → map, rewards/progression/ui/tutorial → ui). A variant may set its own `stage`.
- `play(ctx)` returns a Promise (the lab waits for it, 12 s cap) or nothing (the lab waits `duration`, default 1600 ms). "Play all" plays every variant in order.
- `FXLAB.registerGroup(defaults, [specs])` registers several entries with shared fields (`stage`, `note`).
- Each play gets a **fresh stage**; overlays you added to `<body>` are removed before the next play.

`ctx`:

| Field | Contents |
|---|---|
| `root`, `stage` | the stage element, its type |
| `cards` | `.card-tile`s (each in a `.board-card`). Cards stage: common, rare, foil (Cosmos legendary), leader (`.board-card.is-leader`) |
| `castle` | a castle tile (cards stage; the enemy castle on the board stage) |
| `board` | `mine`, `foe` (3 `.board-card`s each, as `boardCardEl` gives), `castleMine`, `castleFoe`, `field` (environment cards), `hud`, `el` (`#battlefieldEl`), `rowMine`, `rowFoe`, `leader`, `hand`, `hpMine`, `hpFoe`, `pillsMine`, `pillsFoe` — a real fight's `#view-play` |
| `map` | `el` (`#conquestCanvas`), `layout`, `nodes.cleared[]`, `nodes.available`, `nodes.locked`, `nodes.boss`, `nodeList`, `trail` (svg), `trailLines`, `pawn`, `spot` (feature spot) |
| `pack` | `el` (the `.po2` overlay), `pack`, `strip`, `hint`; `await ctx.pack.deal()` deals face-down `ctx.pack.cards`; `ctx.pack.flip(i)` reveals one |
| `ui` | `hud`, `pills.gold / dust / leaves / energy`, `results` (a Victory card with rewards), `toastArea`, `toast(msg, kind)` |
| helpers | `wait(ms)` (follows the speed control), `sound(name, ...args)`, `float(el, text, cls)` (the game's damage number), `tilt(tile, ms)` (sweep the light over a foil), `tile(kind, {append})` (`common uncommon rare epic legendary mythic foil leader castle token fire flyer`), `layer(cls)`, `reset()`, `alive()`, `gsap`, `entry`, `variant`, `speed` |

The stages are built from `fixtures.json` (the game's real markup, captured by `tools/effects-lab/capstages.py`) and use the game's
whole stylesheet, so tiles look exactly as in a fight. Board, map and pack are laid out at their natural size and fitted with CSS
`zoom`, so `getBoundingClientRect` overlays line up.

## 4. Checklist per entry

1. Pick the inventory id(s) in your batch; read `current`, `quality`, `themeNotes`, `variantsSuggested`.
2. Write `FX.X.name` (and `_B`, `_C` when `variantsSuggested` is true or the look is uncertain: 2–3 real alternatives, not tweaks).
3. CSS via `css()` with your prefix; nothing in `arena_template.html`.
4. Hook it: `onEvent` for battle events, or one `fxHook('name', …)` line in `arena_app.js` + `M.hooks.name`. Gate heavy looks with `env.fxAtLeast('med')`.
5. Register it in `manifest/X.js` with the same variant keys; add `inGameHook` (where it fires) and a `note` when it helps choose.
6. `python3 tools/effects-lab/build.py`, open `.fxcat/effects.html`, filter "Built in the lab", play each variant at 1× and 0.25×: 0 console errors, nothing left behind on the next play, works at 390 px wide.
7. `python3 assemble_arena.py && mv bramblewood-arena.html index.html`, then `timeout 590 bash tests/run-all.sh` (ALL PASSED) and `timeout 280 python3 tests/e2e/ui_smoke.py` (0 failures).
8. Comment new code with a dated note (`// 2026-10-15: …`). Don't commit `.fxcat/` or `.hub/`.
