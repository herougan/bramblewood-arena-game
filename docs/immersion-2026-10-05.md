# Immersion: five ideas (2026-10-05)

**The question:** how do we make Bramblewood feel like a place you're *in*, rather than a set of menus you click through? Five ideas, roughly ordered by payoff per effort.

## 1. Every place sounds like itself (✅ built 2026-10-05)

**Problem:** the game was silent between sound effects, and the Music slider controlled nothing.

**What we built:** a live soundscape for each place, synthesised in the browser (no audio files). Each place has continuous "beds" (filtered noise that moves slowly) plus small scheduled events:

| Place | What you hear |
|---|---|
| Home and Outskirts | Breeze, a distant stream, birdsong |
| Sunken Hollow | Lapping water, frogs |
| Ashen Peak | Low rumble, crackles |
| Caves | Drone and echoing drips |
| Savanna | Warm wind, insects, a far-off cry |
| Tundra | Howling, sweeping wind and gusts |
| Coral Current | Muffled water, bubbles |
| Swamp | Murk, insects, frogs |
| Foundry | Rumble, crackles, metal clanks |
| Eyrie | Wind, eagle cries |
| Sundered Peak | Rumble, crackle, distant thunder |
| 🌧️ Rain atmosphere | Rain, drips, thunder |

**How it behaves:**
- It plays on Home, on the Conquest map and in battle, using the map you're fighting on.
- It fades out in menu tabs such as Deck and Shop, crossfades between places, and goes quiet while the tab is hidden.
- It's controlled by the 🎵 slider, now "Music & ambience".
- It starts on your first tap, because browsers block audio before a gesture.
- **Code:** `Ambience` in `arena_app.js`.

## 2. Fights happen somewhere

**Today:** the battlefield is green felt with a weather overlay.

**Proposal:** use the map's own pixel terrain (`art/maps/<id>.png`), darkened and blurred under the felt light, as the battlefield floor. A skirmish in the Basalt Foundry then visibly happens on cracked basalt by a lava river.

**Cost:** small. The art and the overlay already exist.

## 3. Rivals with presence

**Proposal:** a 1.5-second "versus" opener before each skirmish:
- your banner on the left, theirs on the right (the portrait, name, castle and rank, as in the Profile's "What rivals see");
- one line of trash talk from the existing dialogue system;
- then the board slides in.

Bosses get a longer, bespoke entrance.

**Cost:** medium. It's mostly layout, plus a few lines of dialogue per node.

## 4. Diegetic screens

**Proposal:** fewer menus, more places:
- The Armoury Tent opens as a tent interior around the deck builder.
- The Old Nest is a nest you look into.
- The Shop is a cart with the pouch on the counter.
- Screen changes use in-world transitions (leaves parting, a page turning) instead of instant swaps.

Tabs stay as a fallback for speed.

**Cost:** medium to large. It can be done one screen at a time.

## 5. A living clock

**Proposal:** your real local time tints Home, the maps and battles:
- dawn is pink, day neutral, dusk amber;
- night is blue, with fireflies and lanterns.

The ambience follows the clock too (crickets at night, birds at dawn). Seasonal touches can come later, such as autumn leaves in October.

**Cost:** small to medium. It's one global time-of-day value that the shaders and the ambience read.

---

**Suggested next:** #2, which is quick and visible, then #3.
