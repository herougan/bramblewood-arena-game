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

## 2. Fights happen somewhere (✅ built 2026-10-05)

**Built:** battles are fought on the skirmish map's own pixel terrain, under a soft scrim, with the felt shader switched to light only (lamp and impact lights, no cloth weave).

## 3. Rivals with presence (✅ v1 built 2026-10-05)

**Built:** a versus opener before every Conquest skirmish:
- your avatar, castle and deck on the left; the rival's icon, name, castle HP and a line of trash talk on the right;
- bosses get a red side, a rumble and a longer hold;
- tap to skip; a quick retry of the same rival gets a 0.9-second version.

Lines come from `RIVAL_TAUNTS` by node kind, or a node's own `taunt` field. Bespoke boss entrances are still to do.

## 4. Diegetic screens (✅ built 2026-10-05)

**Built: the Armoury Tent.** The deck builder sits inside the Legion's tent:
- muted oxblood leather panels with a scalloped valance, timber poles and lantern light;
- a hanging "⛺ Armoury Tent" sign;
- the flaps part as you walk in (skipped for reduced motion);
- inside, muffled canvas-and-wind ambience with the odd forge clank.

**Built: the Traveller's Cart (Shop).** A mouse peddler's caravan:
- a faded indigo-and-cream scalloped awning, plank walls and a counter edge, lantern light;
- the awning rolls up as you arrive, with a little bell;
- a roadside breeze, a lantern hum, the odd creak and a trinket jingle.

**Built: the Old Nest (Nest).** A woven-twig hollow in warm light:
- soft down drifts in as you enter;
- a gentle breeze and a few small birds nearby.

**Built: the Forge (Codex → Forge).** Soot-dark brick with a hearth glowing from below:
- sparks rising and an ember flare as you walk in;
- a hearth roar and crackle, bellows and the odd hammer ring.

**Built: in-world transitions.** Moving between Home, Play, the Codex and the other menus sends a gust of leaves sweeping across (about 0.6 seconds, never blocks a click). Places keep their own entrances instead. Off for reduced motion.

## 5. A living clock (✅ built 2026-10-05)

**Built:** Settings → Atmosphere → "🕰️ Live (your clock)", now the default:
- **Dawn (5–8):** rosy light with motes. **Day:** clear. **Dusk (17–20):** amber with motes. **Night:** blue with fireflies.
- It's a multiply-blend colour cast over everything, gentle enough that text stays readable.
- The ambience adds crickets at night (not in caves or underwater) and a dawn chorus.
- Preview any phase with `?tod=night` (or `dawn`, `day`, `dusk`).

---

**All five built.** Next round: bespoke boss entrances (#3), and places for the remaining menus (Quests as the Notice Board, the Arena as a real arena).
