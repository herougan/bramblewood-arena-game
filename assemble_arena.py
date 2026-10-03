import json, os

SCRATCH = os.path.dirname(os.path.abspath(__file__)) + "/"

engine_src = open(SCRATCH + "bramblewood-engine.js", encoding="utf-8").read()
# Ghost decks for Async Arena + offline Raid (2026-10-03) — DOM-free, shared with tests/async-raid.js.
ghosts_src = open(SCRATCH + "bramblewood-ghosts.js", encoding="utf-8").read() + "\n" + open(SCRATCH + "bramblewood-autobattle.js", encoding="utf-8").read()
raid_bosses_literal = json.dumps(json.load(open(SCRATCH + "canonical/raid-bosses.json", encoding="utf-8")), ensure_ascii=False)
app_src = open(SCRATCH + "arena_app.js", encoding="utf-8").read()
# GSAP (2026-09-16, "GSAP-quality" animation pass): a page published via the Artifact tool is
# self-contained -- external CDN scripts (cdnjs, etc.) are blocked at publish time -- so GSAP
# core + the Flip plugin are inlined as literal script content instead of a <script src=...>
# tag. Fetched via `npm install gsap` (registry.npmjs.org is reachable even though the CDN
# isn't) rather than downloaded from a CDN directly.
gsap_src = open(SCRATCH + "gsap.min.js", encoding="utf-8").read()
gsap_flip_src = open(SCRATCH + "Flip.min.js", encoding="utf-8").read()
# Supabase JS SDK (2026-09-22, Raid multiplayer backend) — same reasoning as GSAP above: inlined
# as literal script content (fetched via `npm pack @supabase/supabase-js`, registry.npmjs.org)
# rather than a <script src=...> CDN tag, so the assembled file stays self-contained/offline-first
# regardless of which surface it's opened from. Defines a global `supabase` object with
# `.createClient(url, anonKey)` — see arena_app.js's initCloudSync() for how it's used.
supabase_src = open(SCRATCH + "supabase.umd.js", encoding="utf-8").read()

canonical = json.load(open(SCRATCH + "canonical/cards.json", encoding="utf-8"))
card_defs_obj = {}
for c in canonical:
    d = dict(c)  # keep 'id' inside the object too (many call sites read d.id directly)
    card_defs_obj[d["id"]] = d
card_defs_literal = json.dumps(card_defs_obj, ensure_ascii=False)

characters = json.load(open(SCRATCH + "canonical/characters.json", encoding="utf-8"))
character_defs_obj = {}
for ch in characters:
    character_defs_obj[ch["id"]] = dict(ch)
character_defs_literal = json.dumps(character_defs_obj, ensure_ascii=False)

ARCHETYPE_ICON = {
    # 2026-09-14: the four combined "X & Y" categories were split into two independent,
    # multi-membership archetypes each (a card like the Scorpion just belongs to both).
    "River": "🏞️", "Otter": "🦦", "Flora": "🌳", "Ocean": "🌊", "Cetacean": "🐬", "Bee": "🐝",
    "Desert": "🏜️", "Frost": "❄️", "Insect": "🐜", "Owl": "🦉",
    # Ants (2026-09-16, per explicit request): a sub-type of Insect — every ant card carries
    # BOTH "Insect" and "Ants" (see task90_update_cards.py-style retag pass in canonical/cards.json).
    "Ants": "🐜",
    "Dog": "🐕", "Cat": "🐈", "Ape": "🦍", "Arachnid": "🕷️", "Worm": "🪱",
    "Elemental": "🔥", "Fish": "🐟", "Porcupine": "🦔", "Reptile": "🦎",
    "Raccoon": "🦝", "Badger": "🦡", "Raven": "🐦‍⬛", "Wolf": "🐺", "Boar": "🐗",
    "Turtle": "🐢", "Chipmunk": "🐿️", "Eagle": "🦅", "Cephalopod": "🐙",
    "Bear": "🐻", "Deer": "🦌", "Fox": "🦊", "Beaver": "🦫", "Snake": "🐍",
    "Bat": "🦇", "Mouse": "🐭", "Horse": "🐴", "Frog": "🐸", "Rabbit": "🐇",
    "Sloth": "🦥", "Duck": "🦆", "Shrine": "🙏",
    # 2026-09-14 "biome expansion" (item #9): new archetypes for biomes not yet covered.
    "Rainforest": "🌴", "Savanna": "🌾", "Tundra": "🦣", "Coral Reef": "🪸", "Mountain": "⛰️",
    "Swamp": "🐊", "Cave": "🦇", "Volcanic": "🌋", "Taiga": "🌲", "Coastal": "🌊", "Mangrove": "🌱",
    # Structure (2026-09-18, per explicit request: "remove the concept of 'type' as in structure
    # and unit — structure is just a subtype in types now"). Previously `type: 'Structure'|'Unit'`
    # was a separate dropdown field with no engine dependency at all (grep confirms nothing in
    # bramblewood-engine.js ever reads `.type` — a Structure just has 0 Attack, which the engine
    # already skips attacking with). Folding it into the existing Type Tags pill system (this
    # dict) means Structure cards can now ALSO carry a biome/animal tag alongside it, instead of
    # Type being an exclusive either/or choice with the tags array.
    "Structure": "🏗️",
    # King (2026-09-22, per explicit request: "New type: King. New card: King Maker - Passive:
    # King Slayer N - does N extra damage to Kings on hit."). Not an animal/geography tag like
    # the rest of this dict (same non-taxonomic special-category precedent as Structure/Shrine
    # above), so it's deliberately left out of ANIMAL_TYPE_ARCHETYPES/GEO_TYPE_ARCHETYPES in
    # arena_app.js — it just doesn't get counted in either Codex pie chart, same as those two.
    # Retroactively applied to the two existing cards whose NAMES already said "King" (Rodent
    # King, Glacial Ape-King) so King Slayer has real, thematically-grounded targets to hit from
    # the moment it ships, instead of being inert until new King-tagged content is added later.
    "King": "👑",
    # Hummingbird (2026-09-23, batch #28, per explicit request to build a matching Hummingbird
    # mini-roster alongside the new Otter-side Basics tier): the Sunfeather Dominion's people —
    # previously lore-only (see claude/lore-otters-vs-hummingbirds.md, "not yet wired into game
    # data"). A narrow single-species tag exactly like Otter/Bee/Ants above, NOT a broad
    # taxonomic class, so — same precedent as Otter/Bee/Ants (and King) — it's deliberately left
    # out of ANIMAL_TYPE_ARCHETYPES/GEO_TYPE_ARCHETYPES in arena_app.js and just falls into that
    # chart's "None (no broad animal type)" bucket, the same as every other single-species tag.
    # The lore doc's 7-caste system (Crimson Wing/Cobalt Talon/Gold-throated/Mosswing/Violet
    # Vane/Voidfeather/Sunthroat) is deliberately NOT modeled as its own mechanical tag this
    # batch — a caste is referenced only in each card's name/flavor text for texture. Giving 10
    # cards 7 new one-off pie-chart categories would be noise, not signal; full caste mechanical
    # identity (like the lore doc's own draft example cards with real abilities) is bigger future
    # content, not this batch's "basic tier" scope.
    "Hummingbird": "🐦",
}
archetype_icon_literal = json.dumps(ARCHETYPE_ICON, ensure_ascii=False)

template = open(SCRATCH + "arena_template.html", encoding="utf-8").read()

def sub_once(text, placeholder, replacement):
    count = text.count(placeholder)
    if count != 1:
        raise SystemExit(f"Expected exactly 1 occurrence of {placeholder!r}, found {count}")
    return text.replace(placeholder, replacement, 1)

engine_src_string_literal = json.dumps(engine_src)

out = template
# Splash art (2026-10-02): PixelLab otters-vs-hummingbirds scene, inlined as a data URI like the
# card art so the single-file build stays self-contained.
import base64
splash_png = open(SCRATCH + "art/splash.png", "rb").read()
out = sub_once(out, "__SPLASH_ART__", "data:image/png;base64," + base64.b64encode(splash_png).decode("ascii"))
out = sub_once(out, "__ENGINE_SRC__", engine_src + "\n" + ghosts_src)
out = sub_once(out, "__ENGINE_SRC_STRING__", engine_src_string_literal)
# app_src references __CARD_DEFS__ / __ARCHETYPE_ICON__ / __CHARACTER_DEFS__ inside itself
app_src = sub_once(app_src, "__CARD_DEFS__", card_defs_literal)
app_src = sub_once(app_src, "__ARCHETYPE_ICON__", archetype_icon_literal)
app_src = sub_once(app_src, "__CHARACTER_DEFS__", character_defs_literal)
app_src = sub_once(app_src, "__RAID_BOSSES__", raid_bosses_literal)
# insert GSAP + Flip, then the app script (which depends on both), right before </body> --
# GSAP must load and register its plugin BEFORE arena_app.js runs (it calls gsap.Flip.from()
# and gsap.timeline() at module-eval-adjacent times, e.g. inside renderBoard()).
gsap_block = (
    f"<script>\n{gsap_src}\n</script>\n"
    f"<script>\n{gsap_flip_src}\n</script>\n"
    f"<script>if(typeof gsap!=='undefined' && typeof Flip!=='undefined'){{ gsap.registerPlugin(Flip); }}</script>\n"
    f"<script>\n{supabase_src}\n</script>\n"
)
out = sub_once(out, "</body>", f"{gsap_block}<script>\n{app_src}\n</script>\n</body>")

with open(SCRATCH + "bramblewood-arena.html", "w", encoding="utf-8") as f:
    f.write(out)

print("Wrote bramblewood-arena.html:", len(out), "bytes")
