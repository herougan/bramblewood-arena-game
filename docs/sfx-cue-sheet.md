# SFX cue sheet (draft, 2026-10-03)

Each cue lists what triggers it, its mood, and a target length. Today every cue is synthesized live in Web Audio inside `SoundKit` in `arena_app.js`. Each will be replaced by one or more short files in `audio/`, with 2–3 variations for anything that repeats a lot, so it doesn't sound robotic.

Formats: OGG plus an M4A fallback (or MP3), mono, 44.1 kHz, normalised to about −16 LUFS.

The **A** and **B** columns are the two directions in D17: A is cosy/organic, B is chiptune. Option C mixes them.

| # | Cue | Trigger | Mood (A, cosy/organic) | Mood (B, chiptune) | Length |
|---|---|---|---|---|---|
| 1 | UI click | Any button | Soft wooden tick | Short square blip | < 80 ms |
| 2 | UI hover | Hover on big tiles | Faint leaf brush | Tiny high blip | < 60 ms |
| 3 | UI back / close | Close a modal | Paper slide | Down-blip | < 150 ms |
| 4 | Tab / map pan | Switch tab, pan world | Page turn / soft whoosh | Sweep | 200–300 ms |
| 5 | Card draw | Draw from deck | Card slide off a stack | Rising blip | 150 ms |
| 6 | Card play | Card lands on the board | Card slap on felt, plus a wood thump | Low thunk | 200 ms |
| 7 | Card flip | Pack reveal, flip | Crisp paper flip | Two-note flip | 120 ms |
| 8 | Hit (light) | Damage 1–3 | Small thwack | Noise burst | 120 ms |
| 9 | Hit (heavy) | Damage 4+ or crit | Big thump with crack | Low crunch | 250 ms |
| 10 | Dodge | Airborne/Illusory dodge | Wing whoosh | Pitch-bend swoosh | 200 ms |
| 11 | Poison tick | Poison damage | Bubbling glop | Wobbly blip | 200 ms |
| 12 | Heal | Heal | Soft chime with a breath | Arpeggio up | 300 ms |
| 13 | Death | Card dies | Puff of leaves | Descending blips | 300 ms |
| 14 | Castle hit | Castle damage | Stone thud, dust | Low boom | 300 ms |
| 15 | Castle destroyed | A castle at 0 | Collapse rumble | Long noise fall | 1.2 s |
| 16 | Turn start | Your turn | Small bell | Two-note "ready" | 300 ms |
| 17 | Victory | Win | Warm fanfare (strings and pipe) | 8-bit fanfare | 2–3 s |
| 18 | Defeat | Loss | Low cello sigh | Sad descending tune | 2 s |
| 19 | Coin / reward | Currency gained | Leaf rustle with a coin clink | Coin blip | 250 ms |
| 20 | Pack shake | Pack opening | Rustling pouch | Rattle | 600 ms |
| 21 | Pack burst | Pack opens | Paper rip with a sparkle | Burst | 400 ms |
| 22 | Rare reveal | Rare+ card flipped | Shimmering chime | Sparkle arpeggio | 800 ms |
| 23 | Node select | Pick a skirmish | Pin into map | Select blip | 150 ms |
| 24 | Raid boss roar | Raid fight start | Deep sea-creature groan | Distorted growl | 1.5 s |
| 25 | Trench telegraph | Column about to be smashed | Rising creak and rumble | Warning beeps | 800 ms |
| 26 | Deny | Illegal action | Dull wood knock | Buzz | 150 ms |
| 27 | Level up | Player level | Bright bell flourish | Level-up jingle | 1.5 s |
| 28 | Bow loosed | Arrow / Fire Arrow fires | Plucked string and an air whoosh (fire adds crackle) | Twang blip | 220 ms |
| 29 | Arrow lands | Arrow hits | Wooden thunk with a short quiver | Thud blip | 120 ms |
| 30 | Bleed-out | A card dies (non-fire) | Low wet squelch, two drips (pitch by cause: poison lower, cold higher) | Down-blip and two drips | 550 ms |
| 31 | Burn-away | A card burns (heat) | Soft roar with crackles | Noise hiss | 700 ms |
| 32 | Castle falls | Castle at 0 | Long rumble, stones settling | Long noise fall | 1.4 s |
| 33 | Pitch | A card is pitched for resources | Wood tock and a bright two-note chime | Coin blip | 330 ms |

**Status (2026-10-05):** cues 28–33 are live as Web Audio synths (`SoundKit.arrowLoose/arrowThunk/bleedOut/burnAway/castleCollapse/pitchChime`), built on two new primitives: filtered noise with a sweeping filter (`fnoise`) and a pitch-swept tone (`sweep`). They follow the "mixed" default for D17: an organic body with a little chip on top.

**Sources, CC0 first:**
- **Kenney:** Interface Sounds, Impact Sounds, RPG Audio, UI Audio, Casino Audio (card sounds).
- **OpenGameArt** (CC0 filter).
- **Freesound** (CC0 filter).
- **jsfxr** for direction B and the UI blips.

Each file gets a line in `CREDITS.md`, even for CC0.
