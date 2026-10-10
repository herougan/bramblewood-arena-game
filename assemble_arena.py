import json, os

SCRATCH = os.path.dirname(os.path.abspath(__file__)) + "/"

engine_src = open(SCRATCH + "bramblewood-engine.js", encoding="utf-8").read()
# Ghost decks for Async Arena + offline Raid (2026-10-03) — DOM-free, shared with tests/async-raid.js.
ghosts_src = open(SCRATCH + "bramblewood-ghosts.js", encoding="utf-8").read() + "\n" + open(SCRATCH + "bramblewood-autobattle.js", encoding="utf-8").read() + "\n" + open(SCRATCH + "bramblewood-raid.js", encoding="utf-8").read() + "\n" + open(SCRATCH + "bramblewood-trench.js", encoding="utf-8").read() + "\n" + open(SCRATCH + "bramblewood-integrity.js", encoding="utf-8").read() + "\n" + open(SCRATCH + "bramblewood-shaders.js", encoding="utf-8").read() + "\n" + open(SCRATCH + "bramblewood-skillfx.js", encoding="utf-8").read() + "\n" + open(SCRATCH + "bramblewood-unitfx.js", encoding="utf-8").read() + "\n" + open(SCRATCH + "bramblewood-splash.js", encoding="utf-8").read() + "\n" + open(SCRATCH + "bramblewood-i18n.js", encoding="utf-8").read()
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

# Asset split (2026-10-05): card art, map terrain and the Home sprites used to be base64 data URIs
# inside index.html (4.8 MB of a 7.8 MB page). They're now written to assets/ next to index.html
# and referenced by URL with a ?v=<content hash> so browsers cache them and refetch only when they
# change. BW_INLINE=1 restores the old fully self-contained single file (e.g. for an Artifact).
import base64, hashlib, re as _re
INLINE = os.environ.get("BW_INLINE") == "1"
ASSETS = SCRATCH + "assets/"
_written = set()
def asset_url(rel, data, mime="image/png"):
    if INLINE:
        return "data:%s;base64,%s" % (mime, base64.b64encode(data).decode("ascii"))
    path = ASSETS + rel
    os.makedirs(os.path.dirname(path), exist_ok=True)
    if not os.path.exists(path) or open(path, "rb").read() != data:
        with open(path, "wb") as fh: fh.write(data)
    _written.add(path)
    return "assets/%s?v=%s" % (rel, hashlib.sha256(data).hexdigest()[:10])
def data_uri_to_asset(rel_base, uri):
    m = _re.match(r"data:image/([a-z+]+);base64,(.*)$", uri or "", _re.S)
    if not m: return uri
    ext = {"jpeg": "jpg", "svg+xml": "svg"}.get(m.group(1), m.group(1))
    return asset_url("%s.%s" % (rel_base, ext), base64.b64decode(m.group(2)), "image/" + m.group(1))

# Language packs (2026-10-05): lang/<code>.json -> assets/lang/<code>.js, loaded on demand by
# bramblewood-i18n.js (or all inlined with BW_INLINE=1).
import glob as _glob
_pack_urls, _inline_packs = {}, []
for _fp in sorted(_glob.glob(SCRATCH + "lang/*.json")):
    _code = os.path.basename(_fp)[:-5]
    if _code == "en": continue
    _js = "(window.BW_LANG_PACKS=window.BW_LANG_PACKS||{})[%s]=%s;\n" % (json.dumps(_code), json.dumps(json.load(open(_fp, encoding="utf-8")), ensure_ascii=False, separators=(",", ":")))
    if INLINE: _inline_packs.append(_js)
    else: _pack_urls[_code] = asset_url("lang/%s.js" % _code, _js.encode("utf-8"), "text/javascript")
ghosts_src = ("".join(_inline_packs) if INLINE else "") + ghosts_src.replace("__LANG_PACK_URLS__", json.dumps(_pack_urls).replace("\\", "\\\\").replace("'", "\\'"), 1)

canonical = json.load(open(SCRATCH + "canonical/cards.json", encoding="utf-8"))
card_defs_obj = {}
for c in canonical:
    d = dict(c)  # keep 'id' inside the object too (many call sites read d.id directly)
    if isinstance(d.get("art"), str) and d["art"].startswith("data:"):
        d["art"] = data_uri_to_asset("cards/" + _re.sub(r"[^a-z0-9_-]", "-", d["id"].lower()), d["art"])
    card_defs_obj[d["id"]] = d
card_defs_literal = json.dumps(card_defs_obj, ensure_ascii=False)

characters = json.load(open(SCRATCH + "canonical/characters.json", encoding="utf-8"))
character_defs_obj = {}
for ch in characters:
    cd = dict(ch)
    if isinstance(cd.get("art"), str) and cd["art"].startswith("data:"):
        cd["art"] = data_uri_to_asset("castles/" + _re.sub(r"[^a-z0-9_-]", "-", cd["id"].lower()), cd["art"])
    character_defs_obj[cd["id"]] = cd
character_defs_literal = json.dumps(character_defs_obj, ensure_ascii=False)

ARCHETYPE_ICON = {
    # 2026-09-14: the four combined "X & Y" categories were split into two independent,
    # multi-membership archetypes each (a card like the Scorpion just belongs to both).
    "River": "🏞️", "Otter": "🦦", "Flora": "🌳", "Ocean": "🌊", "Cetacean": "🐬", "Bee": "🐝",
    "Desert": "🏜️", "Frost": "❄️", "Insect": "🐜", "Owl": "🦉", "Oddity": "❓", "Village": "🏘️", "Leader": "👑",
    # Ants (2026-09-16, per explicit request): a sub-type of Insect — every ant card carries
    # BOTH "Insect" and "Ants" (see task90_update_cards.py-style retag pass in canonical/cards.json).
    "Ants": "🐜",
    "Dog": "🐕", "Cat": "🐈", "Ape": "🦍", "Arachnid": "🕷️", "Worm": "🪱",
    "Elemental": "🔥", "Fish": "🐟", "Porcupine": "🦔", "Reptile": "🦎",
    "Raccoon": "🦝", "Badger": "🦡", "Raven": "🐦‍⬛", "Wolf": "🐺", "Boar": "🐗",
    "Turtle": "🐢", "Chipmunk": "🐿️", "Eagle": "🦅", "Cephalopod": "🐙",
    "Bear": "🐻", "Deer": "🦌", "Fox": "🦊", "Beaver": "🦫", "Snake": "🐍",
    "Bat": "🦇", "Mouse": "🐭", "Horse": "🐴", "Frog": "🐸", "Rabbit": "🐇",
    "Sloth": "🦥", "Duck": "🦆", "Shrine": "🙏", "Forgotten": "🕯️", "Imp": "😈", "Devil": "👹",
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
# CSS custom property so the entrance screen and the Home scene share ONE copy of the data URI.
out = sub_once(out, "__SPLASH_ART__", "data:image/png;base64," + base64.b64encode(splash_png).decode("ascii"))
_depth_path = SCRATCH + "art/splash_depth.png"
_depth_uri = ("data:image/png;base64," + base64.b64encode(open(_depth_path, "rb").read()).decode("ascii")) if os.path.exists(_depth_path) else ""
app_src = app_src.replace("__SPLASH_DEPTH__", _depth_uri, 1)
# Conquest map backgrounds (2026-10-04): tools/make_map_backgrounds.py -> art/maps/<id>.png, one CSS
# custom property per map theme, shown pixelated under the map's light/vignette gradients.
_map_css = []
for _mid in [str(i) for i in range(1, 30)] + ["f", "b", "g"]:   # m1..m29 plus the 2026-10-09 field/beach maps
    _fp = SCRATCH + "art/maps/m%s.png" % _mid
    if os.path.exists(_fp):
        _map_css.append(".map-theme-m%s, .battlefield.map-m%s{--map-art:url(%s);}" % (_mid, _mid, asset_url("maps/m%s.png" % _mid, open(_fp, "rb").read())))
out = out.replace("/*__MAP_ART_CSS__*/", "\n".join(_map_css), 1)
# Arrow projectiles (2026-10-04, Arrow / Fire Arrow skills): small pixel-art PNGs from art/fx/.
for _ph, _fn in (("__ARROW_PNG__", "art/fx/arrow.png"), ("__FIRE_ARROW_PNG__", "art/fx/fire_arrow.png")):
    _fp = SCRATCH + _fn
    app_src = app_src.replace(_ph, ("data:image/png;base64," + base64.b64encode(open(_fp, "rb").read()).decode("ascii")) if os.path.exists(_fp) else "", 1)
# Home 2.5D layers (2026-10-03): foreground otter/hummingbird sprites (transparent PNGs) if present.
import os
def _home_sprite(name):
    path = SCRATCH + "art/home/" + name + ".png"
    return asset_url("home/" + name + ".png", open(path, "rb").read()) if os.path.exists(path) else ""
app_src = app_src.replace("__HOME_OTTER__", _home_sprite("otter"), 1).replace("__HOME_BIRD__", _home_sprite("hummingbird"), 1)
out = sub_once(out, "__ENGINE_SRC__", engine_src + "\n" + ghosts_src)
out = sub_once(out, "__ENGINE_SRC_STRING__", engine_src_string_literal)
# app_src references __CARD_DEFS__ / __ARCHETYPE_ICON__ / __CHARACTER_DEFS__ inside itself
app_src = sub_once(app_src, "__CARD_DEFS__", card_defs_literal)
app_src = sub_once(app_src, "__ARCHETYPE_ICON__", archetype_icon_literal)
app_src = sub_once(app_src, "__CHARACTER_DEFS__", character_defs_literal)
app_src = sub_once(app_src, "__RAID_BOSSES__", raid_bosses_literal)
app_src = sub_once(app_src, "__RAIDS__", json.dumps(json.load(open(SCRATCH + "canonical/raids.json", encoding="utf-8")), ensure_ascii=False))
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

# Any other large inline image left in the page (the biome card textures in the stylesheet, each
# pasted twice) moves to assets/tex/, named by content so duplicates collapse to one file. The
# splash and its depth map stay inline: the WebGL splash shader can't read a separate image file
# when the page is opened straight from disk.
if not INLINE:
    _keep = set()
    for _fn in ("art/splash.png", "art/splash_depth.png"):
        if os.path.exists(SCRATCH + _fn): _keep.add(base64.b64encode(open(SCRATCH + _fn, "rb").read()).decode("ascii"))
    def _ext(m):
        b64 = m.group(2)
        if len(b64) < 20000 or b64 in _keep: return m.group(0)
        data = base64.b64decode(b64)
        return asset_url("tex/%s.%s" % (hashlib.sha256(data).hexdigest()[:16], "jpg" if m.group(1)=="jpeg" else m.group(1)), data)
    out = _re.sub(r"data:image/(png|jpeg|webp|gif);base64,([A-Za-z0-9+/=]+)", _ext, out)
with open(SCRATCH + "bramblewood-arena.html", "w", encoding="utf-8") as f:
    f.write(out)

# drop asset files nothing references any more (renamed or deleted art)
if not INLINE and os.path.isdir(ASSETS):
    for root, _dirs, files in os.walk(ASSETS):
        for fn in files:
            fp = os.path.join(root, fn)
            if fp not in _written: os.remove(fp)
print("Wrote bramblewood-arena.html:", len(out), "bytes", "(inline)" if INLINE else "+ %d asset files" % len(_written))
