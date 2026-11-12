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
| 36 | Fire out | Tap a lit fire on a dark conquest map | Short "fsst": a hiss of filtered noise over a low breath | Noise blip | 400 ms |
| 37 | Crystal ting | Tap a crystal on a conquest map | Three bright sine/triangle partials (pitch varies 0.9-1.12 per tap) | Single bell blip | 550 ms |
| 38 | Water plop | Tap water on a conquest map | A falling sine plop, a splash of band noise, a smaller drip after it | Down-blip | 200 ms |
| 39 | Bush rustle | Tap a bush on a conquest map | Two short bursts of high filtered noise with crackle | Noise blip | 300 ms |
| 40 | Construction | Bulwark raises its Log Walls (2026-11-12, FX6) | Three hammer knocks on wood (a low square thud with a band of noise on each, the pitch sagging a little) over a short rising saw-scrape | Three square blips | 400 ms |
| 41 | Cinematic rumble | Meteor, Lightning, Earthquake, Eruption, Tidal wave, Stampede (omen and build) (2026-11-12, FX8) | `cineRumble`: filtered noise sweeping 140 to 70 Hz under a sine sliding 46 to 34 Hz, slow swell | (same, one palette) | 2-3 s |
| 42 | Cinematic boom | Meteor impact, Earthquake split, Eruption blast, Wildfire end flare (2026-11-12, FX8) | `cineBoom`: a sine dropping 130 to 26 Hz, a lowpassed noise burst and a triangle tail | (same, one palette) | 1.3 s |
| 43 | Cinematic thunder | Lightning storm (distant and after the strike) (2026-11-12, FX8) | `cineThunder`: slow-attack lowpassed noise falling 700 to 60 Hz over a 58 Hz sine | (same, one palette) | 1.7 s |
| 44 | Cinematic whoosh | Meteor falls; the tide drains (2026-11-12, FX8) | `cineWhoosh`: bandpass noise swept 300 to 2400 Hz, rising | (same, one palette) | 0.6-1.4 s |
| 45 | Cinematic crack | Lightning strike, Earthquake cracks (2026-11-12, FX8) | `cineCrack`: a very short highpass noise click and a falling square | (same, one palette) | 0.2 s |
| 46 | Cinematic chime | Eclipse (totality, diamond ring), Blizzard glints, Aurora blessing (2026-11-12, FX8) | `cineChime`: stacked sines on a chosen chord, each with a quiet octave, long decay | (same, one palette) | 1.5 s |
| 47 | Cinematic drone | Meteor and Eclipse (omen), Aurora (night) (2026-11-12, FX8) | `cineDrone`: two detuned triangles and a fifth, slow attack | (same, one palette) | 2-3 s |
| 48 | Cinematic buzz | Swarm (2026-11-12, FX8) | `cineBuzz`: a sawtooth with a 27 Hz vibrato over a narrow noise band | (same, one palette) | 2-4 s |
| 49 | Cinematic wind | Lightning, Tidal wave, Blizzard, Wildfire (2026-11-12, FX8) | `cineWind`: bandpass noise swept 380 to 950 Hz, slow swell | (same, one palette) | 1.6-3.4 s |
| 50 | Cinematic rain | Lightning storm (2026-11-12, FX8) | `cineRain`: quiet highpass noise, 0.7 s fade-in | (same, one palette) | 3 s |
| 51 | Cinematic slam | Tidal wave breaks (2026-11-12, FX8) | `cineSlam`: lowpass noise falling 2600 to 200 Hz and a 95 to 30 Hz sine | (same, one palette) | 0.95 s |
| 52 | Cinematic roar | Eruption, Wildfire, Stampede (2026-11-12, FX8) | `cineRoar`: slow lowpass noise (800 to 280 Hz) over a faint saw | (same, one palette) | 2-2.4 s |
| 53 | Cinematic hooves | Stampede (2026-11-12, FX8) | `cineHooves`: 13 short low thumps, 88 to 40 Hz, speeding up | (same, one palette) | 2.4 s |

**Status (2026-11-12, package FX8):** cues 41-53 are the sound of the eleven cinematic board effects (`bramblewood-cinematic.js`, Effects Lab group "Cinematic (FX8)", not wired into fights). SoundKit's `tone()` / `noise()` are private to `arena_app.js`, so the file builds the same kind of synth (oscillators, filtered noise, sweeps) on `SoundKit.audioContext()`, gated by the SFX volume; nothing plays under Effects None / reduced motion.

**Status (2026-11-12, package FX6):** cue 40 is live as a Web Audio synth (`SoundKit.constructTone`, built from `tone`, `fnoise`, `sweep`); it replaces the spawn buzz for Bulwark's walls.

**Status (2026-10-05):** cues 28–33 are live as Web Audio synths (`SoundKit.arrowLoose/arrowThunk/bleedOut/burnAway/castleCollapse/pitchChime`), built on two new primitives: filtered noise with a sweeping filter (`fnoise`) and a pitch-swept tone (`sweep`). They follow the "mixed" default for D17: an organic body with a little chip on top.

**Status (2026-10-05, later):**
- Hits now use a richer synth: a thwack with random pitch, plus a boom and crack on heavy blows (`SoundKit.hitAt`).
- Hits and deaths are panned to where they happen on screen (`SoundKit.at`).
- New cues: 34 **Materia forms** (`materiaForm`, 800 ms, a glassy shimmer and pings) and 35 **Hero level-up** (`heroLevel`, 1.5 s, a rising bell arpeggio).
- The ranked to-do list is in `effects-catalogue.md` → Recommendations.

**Status (2026-10-31, package MAPFX1):** cues 36-39 are live as Web Audio synths (`SoundKit.fireOut/crystalTing/waterPlop/bushRustle`; a tapped fire that is lit again reuses `fireIgnite`), played from `mfxPlay` in `arena_app.js`, which limits them (110 ms between any two, 5 per 1.5 s, 260 ms per spot) and pans them to where the tap was. They go through the same primitives as every cue, so the Sound effects slider and the mute rule them.

**Sources, CC0 first:**
- **Kenney:** Interface Sounds, Impact Sounds, RPG Audio, UI Audio, Casino Audio (card sounds).
- **OpenGameArt** (CC0 filter).
- **Freesound** (CC0 filter).
- **jsfxr** for direction B and the UI blips.

Each file gets a line in `CREDITS.md`, even for CC0.
