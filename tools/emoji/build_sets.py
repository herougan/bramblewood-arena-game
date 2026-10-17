#!/usr/bin/env python3
"""Bundled emoji sets (2026-10-17, user: "For Emoji - use the best and free one. If you prefer fluent flat, lets do that.").

Builds one file per emoji set with ONLY the emoji the game uses, so Settings -> Emoji style works offline, in the Steam build
and under the CSP, with no jsDelivr:

    tools/emoji/sets/fluent.json   Microsoft Fluent Emoji, Flat style (MIT)       <- the default
    tools/emoji/sets/twemoji.json  Twemoji 17.0.3, jdecked fork (CC-BY 4.0)
    tools/emoji/sets/noto.json     Google Noto Emoji 2.051 (Apache 2.0)

Each file is {"set", "source", "licence", "missing": [...], "fallback": {key: "twemoji"}, "vs": [...], "emoji": {key: "<svg…>"}}.
key = the emoji's lowercase hex codepoints joined by "-", FE0F removed (e.g. "1f426-200d-2b1b"). Fluent has no flags and
Noto keeps its flags elsewhere, so a picture a set lacks is filled from Twemoji (listed under "fallback"; credited in
CREDITS.md). assemble_arena.py turns each into assets/emoji/<set>.js (hashed URL), which the game loads only when that set
is picked.

Steps (all reproducible; sources are pinned):
    node tools/emoji/scan_emoji.js > tools/emoji/used.json      # what the game uses (~540 sequences)
    python3 tools/emoji/build_sets.py                           # fetch (cached in tools/emoji/.src/), svgo, write sets/
Fetching uses git (a blobless, sparse clone of microsoft/fluentui-emoji at FLUENT_REF) and raw.githubusercontent.com for
Twemoji and Noto. svgo runs through npx (svgo@3.3.2).
"""
import json, os, re, shutil, subprocess, sys, urllib.parse

HERE = os.path.dirname(os.path.abspath(__file__))
SRC = os.path.join(HERE, ".src")
OUT = os.path.join(HERE, "sets")
FLUENT_REPO, FLUENT_REF = "https://github.com/microsoft/fluentui-emoji", "1ffb34c752ecf5d402f04cfb4b392c77f57c54bc"  # main, 2026-08-24
TWEMOJI_RAW = "https://raw.githubusercontent.com/jdecked/twemoji/v17.0.3/assets/svg/"
NOTO_RAW = "https://raw.githubusercontent.com/googlefonts/noto-emoji/v2.051/svg/"
SVGO = ["npx", "--yes", "svgo@3.3.2"]


def run(cmd, **kw):
    r = subprocess.run(cmd, capture_output=True, text=True, **kw)
    if r.returncode != 0:
        raise SystemExit("failed: %s\n%s" % (" ".join(cmd), r.stderr[-2000:]))
    return r.stdout


def curl_many(pairs):
    """pairs: [(url, dest)]. Downloads the ones not cached yet; a 404 just leaves the file absent."""
    todo = [(u, d) for u, d in pairs if not os.path.exists(d)]
    if not todo: return
    cfg = os.path.join(SRC, "curl.cfg")
    with open(cfg, "w") as fh:
        for u, d in todo:
            os.makedirs(os.path.dirname(d), exist_ok=True)
            fh.write('url = "%s"\noutput = "%s"\n' % (u, d + ".part"))
    subprocess.run(["curl", "-sS", "--fail", "--parallel", "--parallel-max", "16", "-K", cfg], capture_output=True, text=True)
    for _u, d in todo:
        if os.path.exists(d + ".part"):
            if os.path.getsize(d + ".part") > 0: os.replace(d + ".part", d)
            else: os.remove(d + ".part")
    os.remove(cfg)


def fluent_sources(keys):
    """Blobless sparse clone; returns {key: path to the Flat svg}."""
    repo = os.path.join(SRC, "fluentui-emoji")
    if not os.path.isdir(os.path.join(repo, ".git")):
        run(["git", "clone", "--filter=blob:none", "--no-checkout", FLUENT_REPO, repo])
    run(["git", "-C", repo, "sparse-checkout", "set", "--no-cone", "/LICENSE", "/assets/*/metadata.json"])
    run(["git", "-C", repo, "checkout", "-q", FLUENT_REF])
    files = run(["git", "-C", repo, "ls-tree", "-r", "--name-only", FLUENT_REF]).splitlines()
    flat = {}
    for f in files:
        m = re.match(r"assets/([^/]+)/(?:Default/)?Flat/[^/]+_flat(?:_default)?\.svg$", f)
        if m: flat[m.group(1)] = f
    by_key = {}
    for folder in os.listdir(os.path.join(repo, "assets")):
        mp = os.path.join(repo, "assets", folder, "metadata.json")
        if not os.path.exists(mp) or folder not in flat: continue
        md = json.load(open(mp, encoding="utf-8"))
        k = "-".join(c for c in md.get("unicode", "").lower().split() if c != "fe0f")
        if k: by_key.setdefault(k, flat[folder])
    want = {k: by_key[k] for k in keys if k in by_key}
    run(["git", "-C", repo, "sparse-checkout", "set", "--no-cone", "/LICENSE", "/assets/*/metadata.json"] + ["/" + p for p in sorted(set(want.values()))])
    run(["git", "-C", repo, "checkout", "-q", FLUENT_REF])
    return {k: os.path.join(repo, p) for k, p in want.items()}


def twemoji_name(e):
    # Twemoji's own file rule: FE0F is dropped unless the sequence has a ZWJ in it.
    cps = [format(ord(c), "x") for c in e["seq"]]
    if "200d" not in cps: cps = [c for c in cps if c != "fe0f"]
    return "-".join(cps)


def noto_name(e):
    return "emoji_u" + "_".join(c.rjust(4, "0") for c in e["key"].split("-")) + ".svg"


def optimise(paths, set_id, precision=2):
    """svgo --multipass over copies of the source files; returns {key: svg text}."""
    tmp_in, tmp_out = os.path.join(SRC, "svgo-in-" + set_id), os.path.join(SRC, "svgo-out-" + set_id)
    for d in (tmp_in, tmp_out):
        shutil.rmtree(d, ignore_errors=True); os.makedirs(d)
    for k, p in paths.items(): shutil.copyfile(p, os.path.join(tmp_in, k + ".svg"))
    cfg = os.path.join(SRC, "svgo.config.cjs")
    with open(cfg, "w") as fh:
        # keep viewBox (the pictures scale to 1em); ids are prefixed per emoji so gradients never clash (they're <img>s anyway)
        fh.write("module.exports={multipass:true,floatPrecision:%d," % precision + "plugins:[{name:'preset-default',params:{overrides:{removeViewBox:false}}},"
                 "'removeDimensions',{name:'prefixIds',params:{delim:'',prefixClassNames:false}}]};\n")
    run(SVGO + ["--config", cfg, "-q", "-f", tmp_in, "-o", tmp_out])
    out = {}
    for k in paths:
        s = open(os.path.join(tmp_out, k + ".svg"), encoding="utf-8").read().strip()
        if 'xmlns="http://www.w3.org/2000/svg"' not in s: s = s.replace("<svg", '<svg xmlns="http://www.w3.org/2000/svg"', 1)
        out[k] = s
    return out


def main():
    used = json.load(open(os.path.join(HERE, "used.json"), encoding="utf-8"))
    keys = [e["key"] for e in used]
    os.makedirs(SRC, exist_ok=True); os.makedirs(OUT, exist_ok=True)
    tw_dir, noto_dir = os.path.join(SRC, "twemoji"), os.path.join(SRC, "noto")
    curl_many([(TWEMOJI_RAW + twemoji_name(e) + ".svg", os.path.join(tw_dir, e["key"] + ".svg")) for e in used])
    curl_many([(NOTO_RAW + noto_name(e), os.path.join(noto_dir, e["key"] + ".svg")) for e in used])
    srcs = {
        "twemoji": {k: os.path.join(tw_dir, k + ".svg") for k in keys if os.path.exists(os.path.join(tw_dir, k + ".svg"))},
        "noto": {k: os.path.join(noto_dir, k + ".svg") for k in keys if os.path.exists(os.path.join(noto_dir, k + ".svg"))},
        "fluent": fluent_sources(keys),
    }
    meta = {
        "fluent": ("Microsoft Fluent Emoji (Flat), " + FLUENT_REPO + " @ " + FLUENT_REF[:10], "MIT"),
        "twemoji": ("Twemoji 17.0.3, https://github.com/jdecked/twemoji", "CC-BY 4.0"),
        "noto": ("Noto Emoji 2.051, https://github.com/googlefonts/noto-emoji", "Apache-2.0"),
    }
    # Noto draws on a 128-unit grid, so one decimal is plenty (and keeps the set under the 2 MB budget); the others use 32/36.
    opt = {s: optimise(p, s, 1 if s == "noto" else 2) for s, p in srcs.items()}
    report = []
    for s in ("fluent", "twemoji", "noto"):
        emoji, fallback, missing = {}, {}, []
        for k in keys:
            if k in opt[s]: emoji[k] = opt[s][k]
            elif s != "twemoji" and k in opt["twemoji"]: emoji[k] = opt["twemoji"][k]; fallback[k] = "twemoji"
            else: missing.append(k)
        # vs: the keys drawn as a picture only when FE0F follows (text-presentation symbols such as ↔️ ▶️ ⬆️; see scan_emoji.js)
        doc = {"set": s, "source": meta[s][0], "licence": meta[s][1], "missing": missing, "fallback": fallback,
               "vs": [e["key"] for e in used if e.get("needsVS")], "emoji": emoji}
        txt = json.dumps(doc, ensure_ascii=False, separators=(",", ":"))
        with open(os.path.join(OUT, s + ".json"), "w", encoding="utf-8") as fh: fh.write(txt)
        report.append("%-8s %4d emoji, %3d from Twemoji, %2d missing, %6.0f KB" % (s, len(emoji) - len(fallback), len(fallback), len(missing), len(txt.encode("utf-8")) / 1024))
    print("\n".join(report))


if __name__ == "__main__":
    main()
