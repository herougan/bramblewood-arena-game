# Bramblewood Arena — Style Guide (mandatory before shipping any visual/UX change)

## How this doc is used

Read this before writing or reviewing ANY change that touches how the game looks, sounds, moves,
or reads — a new card visual, a new UI panel, a new animation, a new sound cue, new copy in a
button or dropdown. It is a checklist, not background reading: if a planned change would violate
a rule below, either fix the plan so it doesn't, or flag it to the user as a decision item exactly
the way `game-design-action-items.md` already flags ambiguous asks — don't silently ship a
violation and don't silently "improve" the rule on your own judgment mid-task.

This doc holds the CROSS-CUTTING conventions — the ones that apply no matter which subsystem
you're touching. The `context-*.md` docs remain the per-system deep reference (exact CSS variable
names, exact function names, the full history of why a value is what it is) — read the relevant
one too before touching that system. This doc is the fast top-level pass; the context docs are
where the details live. When the two ever seem to disagree, the context doc is more likely current
(it's the one this doc's own process below tells you to update after a change) — fix this doc to
match rather than assuming the context doc is stale.

## 1. Design tokens — never hand-write a color

Every color is a CSS custom property, defined once on the bare `:root` (light theme) and
redefined under `@media (prefers-color-scheme: dark)` guarded by `:root:not([data-theme="light"])`
plus again under `:root[data-theme="dark"]` for the explicit toggle. A new UI element takes its
color from `--bg`/`--surface`/`--surface-2`/`--surface-3`/`--surface-border`/`--ink`/
`--ink-muted`/`--ink-soft`/`--accent`/`--accent-strong`/`--accent-ink`/`--attack`/`--health`, never
a literal hex value — a literal that "looks right" in whichever theme you happened to preview
breaks silently in the other one. `--page-wood`/`--page-ink` are the ONE deliberate exception:
they exist specifically for content sitting directly on the outer wood background rather than
inside a `--surface` panel (the topbar's Home/Settings/Back buttons, the home menu's ghost
buttons) — `--page-ink` is fixed-light in both themes on purpose, because `--ink` flips per theme
and a `--surface`-paired ink color goes unreadable on the always-dark wood backdrop. Don't reuse
`--page-ink` for anything that DOES sit inside a `--surface` panel, and don't give `--ink` a
`--page-wood`-specific override — that was a real, already-fixed contrast bug
(`game-design-action-items.md`, batch #3, item 1); the fix was a new token, not patching the old
one.

Three type families, each with a job — don't introduce a fourth without a real reason: **Nunito**
(body text, buttons), **Baloo 2** (headings, card names/stats, UI labels — the game's primary
"voice"), **MedievalSharp** (the brand wordmark only, for the chivalric flavor — not for general
UI text, it doesn't hold up at small sizes or in long strings).

## 2. Card anatomy (CSRE — Card Surface Real Estate)

`cardTileHTML()` is the one renderer for every card EXCEPT the live battlefield (`boardCardHTML()`
is separate, on purpose — combat has its own animation needs that would fight anything below).
Current anatomy, top to bottom, and why:

- **Top band, shared, `top:-7px`**: cost badge (far left), skill/ability badges (center), Wait
  badge (far right). These three were deliberately unified onto one shared band — keep new
  top-of-card indicators on this same band rather than inventing a new absolute position, and
  don't move skill badges to a different vertical position than cost/wait again (they were once
  moved to `top:16px` to avoid crowding cost, which instead put them on top of the card name —
  a real, already-fixed bug; see `game-design-action-items.md`'s "Card visual design" category).
- **Zero-cost / zero-wait hiding rule (CSRE)**: a $0 cost or $0 Wait badge renders as NOTHING, not
  a bare "🪙0" or "⏱0" chip — apply this through the shared `costBadgeParts()` helper, not a
  one-off check, so hand cards/deck tiles/the Leader widget/the hover popover all stay consistent.
- **Name**, below the top band, centered, Baloo 2 700, currently 13px/1.12 line-height — sized to
  read clearly at the in-match card size; if you change in-match card size, re-check this against
  a card with the longest real name in the roster, not a short placeholder.
- **Stats** (⚔/❤), bottom of the tile via `margin-top:auto` in flex-column contexts (board/hand/
  leader) — the pool/Codex/deck-picker grid is NOT flex-column (`display:block`), so stats sit in
  normal flow there instead; don't assume one universal position without checking which context
  you're in first (this was a real, confirmed-wrong assumption once — verify with a real
  `getComputedStyle` check, don't infer from a CSS comment written for a different context).
- **`.rarity-band`**: a bottom-anchored gradient scrim, both a rarity-color indicator and text
  legibility backing. Current tuning: 50% of tile height, capped at .58 max black alpha, with a
  `transparent 0%, transparent 30%` lead-in. If retuned, re-check specifically against Common
  (`#ffffff`-family) and Starter rarity colors — a too-dark scrim flattens those two into an
  indistinguishable grey wash before it visibly hurts any other, more-saturated rarity.
- **Pitch/discard-resource badge**, bottom edge, dormant by default: shows nothing for the
  universal 1-Lumber baseline, and only appears once a card's real discard yield deviates from
  that baseline (a non-1 Lumber amount — including 0, flagged as abnormal — or any other resource
  above 0). Don't make this always-visible; that was explicitly rejected as noise.
- **Hover flourish** (`.card-tile-magnetic`): cursor-following 3D tilt (`--ctTiltX`/`--ctTiltY`,
  up to ~7-10°, eased back to flat on `mouseleave` via CSS transition, no JS needed for the reset)
  plus a diagonal shimmer sweep reusing the card's existing `::after` glass-shine layer. Opt a
  NEW context into this class only if it's a browsing/picking context (deck pool, castle/Bramble
  picker, Codex) — never the hand strip, the leader widget, or anything board-related, which
  already carry their own combat/selection-specific animation this would fight.
- **Foil/`splashEffect`** is independent of `rarity` — a card can be Rare AND Foil. Never route a
  print-variant effect through the `rarity` field again (that was the original bug this field
  split fixed).
- Castle/HQ tiles render through this SAME `cardTileHTML()`, with `opts.isCastle` suppressing
  cost/wait/attack — don't build a separate castle-specific tile template; "the castle should look
  like a proper card" was resolved by fixing shared anatomy, not by special-casing castles.
- A card that is actually yours in the current match (e.g. the tutorial's leader) is rendered with
  `opts.inPlay` so it never gets the greyed-out "locked" treatment, even if its data is `locked`
  for deck-building.

## 3. Motion conventions

The GSAP entrance/Flip system (full detail in `context-vfx-animation.md`) is explicitly
"extremely carefully tuned... with many bugfix comments warning against structural changes" —
treat that warning as real. Prefer additive changes (a new event branch in `renderVfxForEvent`, a
new `pendingEntranceOrigins` producer) over restructuring the dispatch or the Flip/new-card split.
Two rules worth restating because they've each caused a real bug once: new cards must stay
explicitly excluded from what `Flip.from()` targets (it will silently re-diff against stale DOM
otherwise), and a played card's hand-uid is not always its board-uid — read the real board uid
from the `'play'` event, not the uid a card was played with.

**A newly-created or newly-repositioned card should reflow LIVE, mid-round, not deferred to
round-end.** This has been the standing rule since the V21 live-collapse work: death, collapse-in,
`onAttackedSpawn`, and `onDeathSpawn` tokens all splice into the replay the instant their engine
event replays, using `matchState.replayRows`/`replayCards` as the live snapshot. A new spawn/
reposition event type should follow this same pattern rather than only showing its final state
once the whole round's log finishes.

**Interactive-element motion responds to real interaction, not a permanent scripted loop.** The
magnetic-tilt/shimmer pattern above, and the home-menu buttons' tilt+glow+squash-and-stretch
click pop, both replaced an earlier always-rocking scripted keyframe specifically because a
cursor-follow/click-triggered treatment reads as alive and a looping idle animation reads as
scripted. New interactive chrome (a button, a clickable icon) should follow the interaction-driven
pattern, not add a new permanent idle loop. Decorative, non-interactive ambiance (the Autumn
Village leaf system) is the deliberate exception — it's atmosphere, not a control, and is allowed
to run on its own schedule. The battle board's idle breathing and low-HP tremble (2026-10-06) fall
under that exception: they are tiny, ambient, use the CSS `translate` property so they never fight
GSAP's `transform` tweens, and stop for stunned, frozen and sleeping units. A hover sheen sweeps all the way across its button and exits the far
edge — it never parks mid-button.

Squash-and-stretch on click uses asymmetric `scaleX`/`scaleY` (not a uniform `scale`), a bouncy
overshoot easing (`cubic-bezier(.5,1.75,.75,1.25)`), and must respect whatever cursor-tilt custom
property is already active so a click mid-hover doesn't snap flat first — copy this shape for any
new "big satisfying click" moment rather than a plain scale-pulse.

Anything floating that's anchored to a card (speech bubbles, damage numbers) must follow that card
when the page scrolls or the board re-renders — re-anchor every frame, don't position once.

## 4. Skill VFX (bubbly, obvious, clear — and queued, not simultaneous)

A skill/status animation should read instantly as "something happened" — never as ambiguous
noise, and never as one mechanic possibly being confused for another. Three requirements, all
non-negotiable for any new skill/status VFX:

- **Bubbly.** Favor a playful, physical read over a flat number appearing out of nowhere — a
  bounce, a shake, a pop, a color pulse. `floatText()` + `shakeEl()` + a dedicated `SoundKit` cue
  together is the baseline treatment for a new mechanic, not an optional extra.
- **Obvious.** A player should never need to read the battle log to know something just
  happened — the VFX alone announces it.
- **Distinct per mechanic.** A new skill/status must be visually AND audibly distinguishable from
  every mechanic already covered in `renderVfxForEvent()`/`SoundKit` (section 3/5 above) — a
  shared glyph or tone across two different mechanics reads as "the same thing happening twice."
  This has caused real, since-fixed confusion before: Poison APPLYING a fresh stack and Poison
  TICKING an existing stack once looked "almost alike" until deliberately given distinct floats
  (a small "+3☠" for applying vs. a bolder "🫧 5!" for ticking) — see the `poisonTick` handler's
  own comment in `arena_app.js` for the full story. Treat that as the standard of distinctness to
  match, not the exception.

**Skill/status VFX queue — they never play simultaneously or overlap.** This is enforced
centrally in `delayForEvent()`/`vfxKindOf()` (`arena_app.js`), not left to each effect to
self-pace: every event in a round's replay (one per card, per tick, per triggered effect) plays
to completion, then the replay waits a breath, then the next one starts. The breath length
depends on whether two consecutive events are the same KIND of thing or a different one:

- **Same kind back-to-back → a short, bubbly 200ms breath.** Example: two Poison ticks landing
  in the same round (two different poisoned cards) each get their own `SoundKit.bubble()` cue
  and their own damage number, one after another, only 200ms apart — close enough to read as
  "the same kind of thing, happening again," cute rather than sluggish.
- **A different kind immediately after → a longer 500ms breath.** Example: a Poison tick
  followed by a Bleed tick, or a Freeze status landing right after a Poison tick, gets 500ms —
  long enough that the switch clearly reads as "a new, distinct thing is happening now," not a
  blur of the previous effect.
- "Kind" is `ev.type` for most events. The one exception is `statusFx`, which bundles many
  visually/audibly distinct sub-mechanics (poison/freeze/stun/scar/blind/...) under one event
  type — there, `vfxKindOf()` folds in `ev.kind` too (`statusFx:freeze` vs. `statusFx:poison`
  count as two different kinds, never lumped together as one "statusFx" kind).
- This rule governs skill/status VFX specifically. Ordinary attacks (`hit`/`hitHQ`/`evaded`),
  deaths, and Render keep their own separately-tuned pacing (900/1260ms, 550ms, 780ms
  respectively) — they're already distinct, deliberate beats in the combat rhythm, not part of
  this same-kind/different-kind skill-effect queue.
- A brand-new event type needs no new plumbing to join this queue — `vfxKindOf()`'s default
  (`ev.type`) covers it automatically. The only thing a new mechanic must get right is giving a
  `statusFx`-shaped event its own distinct `ev.kind` string, matching no other status's.

## 5. Sound conventions

Every cue is a `SoundKit` method built only from the two primitives, `tone()`/`noise()` — never
call the Web Audio API directly from anywhere else, since volume gating (three independent
sliders: SFX/Voice/Music — see `context-audio.md`) only happens at that one choke point. A new
mechanic gets its own NAMED cue distinct from every existing one — this has been the rule since
2026-09-13 ("make sure to add sfx and vfx for all the skills too") and every skill/status shipped
since has followed it; don't reuse an existing tone for a new mechanic just because it's "close
enough," and don't add a mechanic with no sound at all. `SoundKit.stopAll()` already cuts every
in-flight cue at round end — a new cue with a long tail doesn't need its own cleanup, it inherits
this for free as long as it's scheduled through `tone()`/`noise()`.

## 6. Copy & naming

Skill/passive names are simple — one or two words ("Hide", "Lunge", "Chained", "Swift"), not a name
that crams its parameters into the label ("Freeze (Chance% / Duration)" was cleaned up specifically
for this reason). Full mechanical detail belongs in the skill's `desc()` function and the Codex
Reference tab, generated from the same registry — never hand-write Reference tab content that
could drift from the registry.

Chance-based mechanics use halves only (1 in 2) — no 1/3s, 1/4s etc. Several independent halves
may stack (Swift + Flying + Evade = 7/8 dodge), but each individual roll is a coin flip.

Dropdowns are alphabetical by display label, with two standing exceptions: placeholder/sentinel
options ("All types", "— pick a card —", "None") stay first rather than being folded into
alphabetical order, and **Rarity is never alphabetized** (`RARITY_DEFS` is a meaningful power-tier
ladder — alphabetizing would scramble it). Follow both exceptions for any new dropdown rather than
re-deriving the question each time.

Be honest about platform limitations rather than faking a feature. The Google SSO investigation
is the standing precedent: rather than build a "Sign in with Google" button that couldn't actually
authenticate anyone, the honest boundary was explained to the user and a real, smaller feature
(the platform's own `user` capability) was built and clearly labeled for what it actually does.
Never ship a control that looks functional but silently does nothing or lies about what happened —
the Language button's "Soon"-tagged, genuinely-disabled other languages follow this same
precedent.

**Think contextually: let a control's surroundings carry its meaning.** A label only needs to say
what its position doesn't already say. A Show/Hide toggle sitting beside a deck list is obviously
about that deck, so it reads "👁 Show" / "🙈 Hide", not "Show deck" / "Hide deck"; a "+1 🪵" next to
the card you're holding needn't also be pinned above the Graveyard. Before adding words, ask what
the player already knows from where they are looking. Keep the full meaning in the `aria-label`
for screen readers, since they don't get the visual context. (Added 2026-10-06, per explicit
request: "always think contextually".)

## 7. Layout & responsiveness

`--match-card-w`/`--match-card-h` is the ONLY sizing lever for in-match cards (`.hq-tile`,
`.board-card`, `.hand-strip .card-tile` all consume it identically) — never reintroduce a
per-context hardcoded size for these three; that was a real bug (three independently-drifted
sizes) before this convention existed. The Codex/pool/deck-editor/Forge's own `.card-tile`
default sizing is a deliberately SEPARATE system (browsing many cards vs. cards actually in
play) — don't try to unify the two.

Tiles in the same row (e.g. the Home menu's Settings/Profile/Ranking/Guild/Admin row) are the
same width AND height — a wrapper element must not leave its button shrink-wrapped.

One mobile breakpoint handles phone width — add a new responsive rule inside that existing
`@media` block rather than introducing a second breakpoint. `.topbar-wrap` must never change
width based on the current tab; only `.content-wrap` toggles between the narrow (1220px-capped)
and wide (`min(1900px, 98-99vw)`, in-match/map views) layouts — a nav bar that visibly resizes
between tabs was explicitly flagged as disorienting and fixed.

When testing any layout change with Playwright, set an explicit viewport
(`{width:1400,height:1000}` has been the working size) rather than trusting the default
1280×720 — a real bug shipped once where hover/mouse-position checks silently no-op'd because
the target element rendered below the default viewport's bottom edge, with no thrown error to
flag it.

## 8. Theming

The game already supports light and dark themes via the token system in section 1 — a new
component must render correctly in both, not just whichever theme you happened to preview in.
Never give a token its only definition inside a `prefers-color-scheme`/`[data-theme]` block; the
bare `:root` block is always the light-theme source of truth, with the dark blocks only ever
redefining tokens that already exist there. Text placed over the splash art or another dark
image must use a light, shadowed color — never the theme `--ink`, which can be dark.

## 9. Card art direction (PixelLab) — added 2026-10-02

Every card portrait is pixel art in a Pokémon-like creature style. Three rules apply to all of
them, then a "genre" decides the mood.

### Always
- **Natural animal anatomy.** Not anthropomorphic: no hands, no standing upright like a person,
  no human clothing by default. Animals without legs (fish, snakes, worms, whales) never get legs;
  birds perch or fly; quadrupeds stay on four legs.
- **Gear fits the animal's body.** "Knight"/"armoured" cards wear armour shaped to the creature
  (a helmet and back-plate on a dolphin, a gold chest plate on a bee) — never a human suit of
  armour, never a weapon held in hands. A weapon, if any, is strapped on.
- **Clothing only when it IS the card's identity** — e.g. the Cobalt Talon Skirmisher's tiny cloth
  scarf and padded vest, the Raccoon Nightcrew's thief mask. Keep it small.

### Make every card unique — four levers
Two cards from the same faction/species must differ on at least two of these:
1. **Pose** — perching, diving, weaving, sprinting, rearing, sleeping, mid-leap, seen from below…
2. **Equipment** — none, a bundle, a scroll, a cloth scarf, fitted armour, a shell…
3. **Scene** — what the card is DOING, taken from its name/flavor (building a nest, delivering a
   message, guarding eggs, slipping out of a window with loot).
4. **Background** — canyon at sunset, misty canopy, moonlit wall, reef, snowdrift, storm.

A good test: each portrait should tell a different story beat, the way the Wandering Traveller
variations read as "generic", "exploring" and "hopeful about the road ahead". If a new portrait
could be swapped with a sibling card's without anyone noticing, regenerate it.

### Genres (mood by power)
| Genre | Used for | Look |
|---|---|---|
| **Cute** | Starter/common and weak cards (low attack + health) | Big sparkling eyes, round chubby shapes, bright cheerful palette, everyday scenes |
| **Brave** | Mid-strength fighters and veterans | Confident determined eyes, sturdy shapes, warm rich palette, dynamic action pose |
| **Menacing** | The strongest creatures, bosses, apex predators (high rarity or very high stats) | Narrowed glowing eyes, angular silhouette, dramatic low-angle lighting, darker saturated palette, imposing pose, scars |

Rule of thumb when rarity doesn't settle it: attack + health under ~15 → Cute, ~15–27 → Brave,
28+ → Menacing. Faction lines escalate inside one species — e.g. Hummingbird recruits and couriers
are Cute, the Dominion Nestguard and Sunspire Envoy are Menacing.

### Prompt template
`<genre prefix>` + `natural animal anatomy, not anthropomorphic, no hands, never standing upright
like a human,` + `<subject + pose>, <equipment>, <scene>, <background>`.
Genre prefixes and the generation/download technique live in `pixellab-art-batch-status.md`.
Generate at 128×128 (Pro returns four variations) with background removal OFF, pick the variation
with the clearest silhouette and the most distinct story beat, and crop it with
`art_staging/crop.py`.

## Before you ship a visual/UX change, verify:

1. Every new color is a token, defined in all three required places (bare `:root`, the
   `prefers-color-scheme` dark override, the `[data-theme="dark"]` override) — not a hardcoded hex.
2. If it touches a card tile, it goes through `cardTileHTML()` (or `boardCardHTML()` for the live
   battlefield specifically), not a new bespoke template.
3. If it's a new hover/click flourish, it's driven by real interaction, not a permanent loop —
   and it's opted into deliberately per-context, not applied globally.
4. It has its own distinct `SoundKit` cue if it represents a new mechanic, built from `tone()`/
   `noise()` only — and that cue/visual is genuinely distinguishable from every other mechanic's,
   not a reused "close enough" tone or glyph.
5. If it's a new skill/status VFX event, it needs no special-casing to queue correctly — it just
   needs a real, distinct `ev.type` (or a distinct `ev.kind` if it's shaped as `statusFx`) so
   `vfxKindOf()` buckets it apart from every other mechanic; verify the same-kind-vs-different-kind
   200ms/500ms breathing rule reads right in a real multi-effect round, not just in isolation.
   And check it isn't SILENT: a new `statusFx` `kind` with no matching branch in
   `renderVfxForEvent` produces no error of any kind, just nothing — cross-reference the engine's
   `events.push({type:'statusFx', kind:...})` call sites against the front end's if/else chain
   rather than trusting a visual skim (this is exactly how `bleed` and `esprit` went unnoticed for
   a while — see `context-vfx-animation.md`'s "Skills/VFX/SFX coverage audit" section).
6. Any new dropdown is alphabetized (except placeholders and Rarity).
7. It was checked at a real mobile viewport width, not just desktop.
8. It was checked in both light and dark.
9. If it reveals a genuine platform limitation, that limitation is disclosed honestly rather than
   faked or silently dropped.
10. New card art follows section 9: natural anatomy, the right genre for the card's power, and
    distinct from its siblings on at least two of pose / equipment / scene / background.
11. Its labels lean on context: no word that the control's position already makes obvious
    (section 6, "Think contextually"), with the full meaning kept in `aria-label`.
