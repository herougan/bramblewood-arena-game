import json, os

SCRATCH = os.path.dirname(os.path.abspath(__file__)) + "/"

engine_src = open(SCRATCH + "bramblewood-engine.js", encoding="utf-8").read()
# Ghost decks for Async Arena + offline Raid (2026-10-03) — DOM-free, shared with tests/async-raid.js.
# 2026-10-16: + bramblewood-fx-g.js (FX.G: map titles, map grandeur, the fun set).
# 2026-10-15: the six effect batches (bramblewood-fx-a.js … -f.js, window.FX.A…F) load right after unitfx; see
# docs/effects-lab-contract.md. They only define functions, so the order among them doesn't matter.
ghosts_src = open(SCRATCH + "bramblewood-ghosts.js", encoding="utf-8").read() + "\n" + open(SCRATCH + "bramblewood-autobattle.js", encoding="utf-8").read() + "\n" + open(SCRATCH + "bramblewood-raid.js", encoding="utf-8").read() + "\n" + open(SCRATCH + "bramblewood-trench.js", encoding="utf-8").read() + "\n" + open(SCRATCH + "bramblewood-integrity.js", encoding="utf-8").read() + "\n" + open(SCRATCH + "bramblewood-shaders.js", encoding="utf-8").read() + "\n" + open(SCRATCH + "bramblewood-skillfx.js", encoding="utf-8").read() + "\n" + open(SCRATCH + "bramblewood-procfx.js", encoding="utf-8").read() + "\n" + open(SCRATCH + "bramblewood-unitfx.js", encoding="utf-8").read() + "\n" + "".join(open(SCRATCH + "bramblewood-fx-%s.js" % _b, encoding="utf-8").read() + "\n" for _b in "abcdefg") + open(SCRATCH + "bramblewood-splash.js", encoding="utf-8").read() + "\n" + open(SCRATCH + "bramblewood-i18n.js", encoding="utf-8").read()
# Game texts (2026-10-15, user: "offload it into a excel so I can edit the text from there"): the TEXT table and TX(), after the
# translation layer it hands its strings to. Edited through docs/game-texts.xlsx (tools/text/import_texts.py).
ghosts_src += "\n" + open(SCRATCH + "bramblewood-texts.js", encoding="utf-8").read()
# 2026-10-18 (R3-WP5 accessibility): modal focus management (aria-modal, focus in / Tab trap / Escape / focus back) for every
# role=dialog overlay, by one MutationObserver. DOM-only and self-guarding, so it rides in the same script block.
ghosts_src += "\n" + open(SCRATCH + "bramblewood-a11y.js", encoding="utf-8").read()
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
# 2026-10-14: the card art is now raw NightCafe paintings (about 110 KB each as PNG); big PNG/JPEG art is shipped as WebP
# (quality 88, about a fifth of the size, no visible change). Small art and the canonical PNGs are left alone.
_WEBP_CACHE = {}
def _to_webp(data):
    k = hashlib.sha256(data).hexdigest()
    if k in _WEBP_CACHE: return _WEBP_CACHE[k]
    try:
        from PIL import Image
        import io
        im = Image.open(io.BytesIO(data))
        has_alpha = im.mode in ("RGBA", "LA") or (im.mode == "P" and "transparency" in im.info)
        im = im.convert("RGBA" if has_alpha else "RGB")
        buf = io.BytesIO(); im.save(buf, "WEBP", quality=88, method=6)
        out = buf.getvalue()
        res = out if len(out) < len(data) * 0.8 else None
    except Exception:
        res = None
    _WEBP_CACHE[k] = res
    return res
def data_uri_to_asset(rel_base, uri):
    m = _re.match(r"data:image/([a-z+]+);base64,(.*)$", uri or "", _re.S)
    if not m: return uri
    ext = {"jpeg": "jpg", "svg+xml": "svg"}.get(m.group(1), m.group(1))
    data = base64.b64decode(m.group(2))
    if not INLINE and m.group(1) in ("png", "jpeg") and len(data) > 40000:
        w = _to_webp(data)
        if w: return asset_url("%s.webp" % rel_base, w, "image/webp")
    return asset_url("%s.%s" % (rel_base, ext), data, "image/" + m.group(1))

# Language packs (2026-10-05): lang/<code>.json -> assets/lang/<code>.js, loaded on demand by
# bramblewood-i18n.js (or all inlined with BW_INLINE=1).
import glob as _glob
_pack_urls, _inline_packs = {}, []
# 2026-10-18 (audit I2: about 360 card names were in no pack): card names live in their own files, lang/cards/<code>.json (same
# {"English": "translation"} shape), merged into each built pack here; the main pack wins on a clash so a hand edit there sticks.
# Both the assets/lang/<code>.js file and the BW_INLINE=1 copy are made from the merged pack. tools/i18n_cards.py reports coverage.
_pack_codes = sorted({os.path.basename(_p)[:-5] for _p in _glob.glob(SCRATCH + "lang/*.json") + _glob.glob(SCRATCH + "lang/cards/*.json")})
for _code in _pack_codes:
    if _code == "en": continue
    _pack = {}
    for _fp in (SCRATCH + "lang/cards/%s.json" % _code, SCRATCH + "lang/%s.json" % _code):
        if os.path.exists(_fp): _pack.update(json.load(open(_fp, encoding="utf-8")))
    _js = "(window.BW_LANG_PACKS=window.BW_LANG_PACKS||{})[%s]=%s;\n" % (json.dumps(_code), json.dumps(_pack, ensure_ascii=False, separators=(",", ":")))
    if INLINE: _inline_packs.append(_js)
    else: _pack_urls[_code] = asset_url("lang/%s.js" % _code, _js.encode("utf-8"), "text/javascript")
ghosts_src = ("".join(_inline_packs) if INLINE else "") + ghosts_src.replace("__LANG_PACK_URLS__", json.dumps(_pack_urls).replace("\\", "\\\\").replace("'", "\\'"), 1)
# Emoji sets (2026-10-17, user: "For Emoji - use the best and free one ... fluent flat"): tools/emoji/sets/<set>.json (made by
# tools/emoji/build_sets.py: only the ~540 emoji the game uses, svgo'd) -> assets/emoji/<set>.js, one file per set, which
# EmojiStyle in arena_app.js loads only when that set is in use (Fluent Flat is the default). No CDN. Under BW_INLINE=1 they
# become data: URLs like every other asset.
_emoji_urls = {}
for _fp in sorted(_glob.glob(SCRATCH + "tools/emoji/sets/*.json")):
    _ed = json.load(open(_fp, encoding="utf-8"))
    _js = "(window.BW_EMOJI_SETS=window.BW_EMOJI_SETS||{})[%s]=%s;\n" % (json.dumps(_ed["set"]), json.dumps({"vs": _ed.get("vs", []), "emoji": _ed["emoji"]}, ensure_ascii=False, separators=(",", ":")))
    _emoji_urls[_ed["set"]] = asset_url("emoji/%s.js" % _ed["set"], _js.encode("utf-8"), "text/javascript")
if app_src.count("__EMOJI_SET_URLS__") != 1: raise SystemExit("Expected exactly 1 __EMOJI_SET_URLS__ in arena_app.js")
app_src = app_src.replace("__EMOJI_SET_URLS__", json.dumps(_emoji_urls), 1)

def emoji_atlases():
    """2026-10-18 (Codex profiling: each emoji was its own SVG document to lay out and re-rasterise, about 8 per card): one
    sprite sheet per emoji set, tools/emoji/atlas/<set>.webp + .json, drawn by tools/emoji/build_atlas.py from the bundled set.
    A sheet whose hash no longer matches its set is rebuilt here (needs playwright + Chromium); if that can't run, the set
    ships without a sheet and EmojiStyle draws it the old way (one SVG per emoji), so the build never breaks over it.
    Returns {set: {url, cols, rows, pitch, cell, pad, w, h, keys, vs, miss}} for EMOJI_ATLAS in arena_app.js."""
    import subprocess, sys as _sys, importlib.util as _iu
    tool = SCRATCH + "tools/emoji/build_atlas.py"
    sys_dir = SCRATCH + "tools/emoji/atlas/"
    try:  # for set_hash() only (the module imports playwright inside build(), so loading it is cheap)
        _spec = _iu.spec_from_file_location("bw_build_atlas", tool); _mod = _iu.module_from_spec(_spec); _spec.loader.exec_module(_mod)
        _ns = {"set_hash": _mod.set_hash}
    except Exception as e:
        print("emoji atlas: cannot read %s (%s); emoji stay SVG" % (tool, e)); return {}
    out = {}
    for fp in sorted(_glob.glob(SCRATCH + "tools/emoji/sets/*.json")):
        ed = json.load(open(fp, encoding="utf-8")); name = ed["set"]
        meta_fp, img_fp = sys_dir + name + ".json", sys_dir + name + ".webp"
        def current():
            try: return os.path.exists(img_fp) and json.load(open(meta_fp, encoding="utf-8")).get("hash") == _ns["set_hash"](ed)
            except Exception: return False
        if not current():
            print("emoji atlas: %s is out of date, rebuilding (tools/emoji/build_atlas.py)" % name)
            try: subprocess.run([_sys.executable, tool, name], check=True, timeout=900)
            except Exception as e: print("emoji atlas: rebuild failed (%s); %s stays SVG" % (e, name))
        if not current(): continue
        meta = json.load(open(meta_fp, encoding="utf-8"))
        meta["url"] = asset_url("emoji/%s-atlas.webp" % name, open(img_fp, "rb").read(), "image/webp")
        meta.pop("hash", None); meta.pop("set", None)
        out[name] = meta
    return out
if app_src.count("__EMOJI_ATLAS__") != 1: raise SystemExit("Expected exactly 1 __EMOJI_ATLAS__ in arena_app.js")
app_src = app_src.replace("__EMOJI_ATLAS__", json.dumps(emoji_atlases(), separators=(",", ":")), 1)

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
    "Desert": "🏜️", "Frost": "❄️", "Insect": "🐜", "Owl": "🦉", "Oddity": "❓", "Village": "🏘️", "Leader": "👑", "Changeling": "🎭", "Shadow": "🌑", "Materia": "💠", "Equipment": "⚒️", "Spell": "✨",
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
    # Irradiated (2026-10-12, user: "Uranium resource, only for irradiated glow wyrms, axolotls and couatls").
    "Irradiated": "☢️",
    # The great beasts (2026-10-18, user: "Add a legendary leviathan ... second in rank as Dragons ... a unique balrog ... third in
    # rank ... Dragon-Turtles? also legendary"): each family is a tag of its own so more can follow (see creatureRank in arena_app.js).
    # The five Dragons already carried "Dragon" with no icon.
    "Dragon": "🐉", "Leviathan": "🐋", "Dragon-Turtle": "🐢", "Fiend": "👺",
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
# Side maps that borrow another map's art (2026-10-15, user: "Are there any submaps with no background? fill them in."). These
# were plain byte-for-byte copies of their parent's PNG (and the app never switched them on), or had no art at all (Murgle
# Mayhem). Each is now recoloured here at build time so it never looks identical to the map it borrows from:
# id -> (source map, hue shift in degrees, saturation x, brightness x).
MAP_ART_DERIVED = {
    "mo": ("mf", -14, 0.80, 0.70),   # The Old Bramble: the old Outskirts forest (mf since the swap), darker and olive
    "mi": ("m6", 14, 1.25, 0.82),    # The Ice Hollow: the tundra, bluer and dimmer
    "mn": ("m4", -70, 1.25, 1.00),   # The Glimmer Depths: the caves, shifted from violet to teal
    "ms": ("mw", 22, 0.95, 0.80),    # The Sunken Grove: Gatorback Swamp, cooler and darker
    "mv": ("m10", 190, 1.00, 0.95),  # The Aerie Vault: Eyrie Heights, turned from slate blue to straw and twig
    "mx": ("m11", 16, 1.15, 0.78),   # Volcano Lair: the Sundered Peak, hotter orange and darker
    "mm": ("m8", 34, 1.10, 0.92),    # Murgle Mayhem (endless dungeon under Sable Swampmire): the swamp, tinted teal
    # 2026-10-18 (audit R3-WP6: the Spire and the Long Burrow drew only a gradient): the two last dungeons get backdrops too.
    "tw": ("m10", 12, 1.50, 0.82),   # The Babel Spire: Eyrie Heights' stone and sky pools, colder and bluer
    "mlb": ("m4", 120, 0.85, 1.05),  # The Long Burrow: the caves turned from violet to packed earth and root
}
def _derived_map_png(src, dh, ds, dv):
    from PIL import Image
    import io as _io, numpy as _np
    im = Image.open(SCRATCH + "art/maps/%s.png" % src).convert("RGB")
    hsv = _np.array(im.convert("HSV")).astype(_np.float32)
    hsv[..., 0] = (hsv[..., 0] + dh * 255.0 / 360.0) % 256
    hsv[..., 1] = _np.clip(hsv[..., 1] * ds, 0, 255); hsv[..., 2] = _np.clip(hsv[..., 2] * dv, 0, 255)
    out = Image.fromarray(hsv.astype(_np.uint8), "HSV").convert("RGB")
    buf = _io.BytesIO(); out.save(buf, format="PNG", optimize=True); return buf.getvalue()
_art_ids = []
# 2026-10-18: loops over whole map ids, so the Babel Spire ("tw", no "m" prefix) and the Long Burrow ("mlb") fit in.
for _id in ["m" + _m for _m in [str(i) for i in range(1, 30)] + ["f", "b", "g", "u", "p", "c", "w", "k", "h", "r", "l", "t", "d", "y", "q", "z", "e", "x", "s", "n", "v", "i", "o", "j", "m", "lb", "tut", "arena", "abyss"]] + ["tw"]:   # + the Arena's tourney ground and the raids' deep sea (2026-10-17)   # m1..m29 plus the 2026-10-09 field/beach maps
    _fp = SCRATCH + "art/maps/%s.png" % _id
    if _id in MAP_ART_DERIVED:
        _data = _derived_map_png(*MAP_ART_DERIVED[_id])
    elif os.path.exists(_fp):
        _data = open(_fp, "rb").read()
    else:
        continue
    _art_ids.append(_id)
    _map_css.append(".map-theme-%s, .battlefield.map-%s{--map-art:url(%s);}" % (_id, _id, asset_url("maps/%s.png" % _id, _data)))
# The app only draws art for ids in MAP_ART_IDS (arena_app.js); six side maps had art baked in but were missing from it.
_mai = _re.search(r"const MAP_ART_IDS = new Set\(\[([^\]]*)\]\)", app_src)
_missing = sorted(set(_art_ids) - set(_re.findall(r'"([a-z0-9]+)"', _mai.group(1) if _mai else "")))
if _missing: raise SystemExit("MAP_ART_IDS in arena_app.js is missing maps that have art: %s" % ", ".join(_missing))
# Forge art (2026-10-12): tools/make_forge_art.py -> art/forge/bg.png + anvil.png (PixelLab versions replace them).
_fg = [(k, SCRATCH + "art/forge/%s.png" % f) for k, f in (("--forge-art", "bg"), ("--anvil-art", "anvil"))]
_fg = ["%s:url(%s);" % (k, asset_url("forge/" + os.path.basename(fp), open(fp, "rb").read())) for k, fp in _fg if os.path.exists(fp)]
if _fg: _map_css.append(":root{" + "".join(_fg) + "}")
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
# Version + card-data check (2026-10-11, user: "a per-session card_data hash plus version check: if the client is
# outdated, ask to update; if the hash is wrong for that version, the data is corrupted"). The build id and the
# expected card-data hash are baked into the page and written to version.json, which the page re-reads each session.
import subprocess as _sp
_tmp = SCRATCH + ".card_defs_tmp.json"
with open(_tmp, "w", encoding="utf-8") as _fh: _fh.write(card_defs_literal)
_res = _sp.run(["node", "-e", "const I=require(process.argv[1]);process.stdout.write(I.cardDataHash(JSON.parse(require('fs').readFileSync(process.argv[2],'utf8'))))", SCRATCH + "bramblewood-integrity.js", _tmp], capture_output=True, text=True)
os.remove(_tmp)
card_hash = _res.stdout.strip()
if not card_hash: raise SystemExit("card hash failed: " + _res.stderr)
build_id = hashlib.sha256((app_src + engine_src + ghosts_src + card_defs_literal + character_defs_literal).encode("utf-8")).hexdigest()[:12]
app_src = sub_once(app_src, "__BUILD_ID__", build_id)
app_src = sub_once(app_src, "__BUILD_CARD_HASH__", card_hash)
with open(SCRATCH + "version.json", "w", encoding="utf-8") as _fh: json.dump({"build": build_id, "cardHash": card_hash}, _fh)
# Raid boss + NPC portraits (2026-10-13): `art` values that are repo paths (art/raids/<id>.png, art/npc/<speaker>.png)
# become hashed assets/ URLs (or data URIs under BW_INLINE), the same as card art.
def _path_art(rel):
    fp = SCRATCH + rel
    return asset_url(rel[len("art/"):], open(fp, "rb").read()) if rel.startswith("art/") and os.path.exists(fp) else rel
def _with_path_art(items):
    for it in items:
        if isinstance(it, dict) and isinstance(it.get("art"), str) and not it["art"].startswith("data:"): it["art"] = _path_art(it["art"])
    return items
raid_bosses_literal = json.dumps(_with_path_art(json.load(open(SCRATCH + "canonical/raid-bosses.json", encoding="utf-8"))), ensure_ascii=False)
# 2026-10-16 (user: "Card backings -> 4 types for now…"): art/backings/<kind>.png (CARD_BACKINGS in arena_app.js) too.
# 2026-10-16 (user: "...I meant the front card frame. To have 4 types..."): and art/frames/<kind>.png (CARD_FRAMES).
app_src = _re.sub(r"art:'(art/(?:npc|fields|backings|frames)/[a-z0-9_-]+\.png)'", lambda m: "art:'%s'" % _path_art(m.group(1)), app_src)
app_src = sub_once(app_src, "__RAID_BOSSES__", raid_bosses_literal)
app_src = sub_once(app_src, "__RAIDS__", json.dumps(_with_path_art(json.load(open(SCRATCH + "canonical/raids.json", encoding="utf-8"))), ensure_ascii=False))
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
