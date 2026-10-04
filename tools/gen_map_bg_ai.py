#!/usr/bin/env python3
"""AI map backgrounds through OpenRouter (2026-10-04) — the upgrade path for
tools/make_map_backgrounds.py's procedural stand-ins.

OpenRouter routes one API key to many image models, so the model can be swapped without code
changes. Writes art/maps/<id>.png at the same 256x144 pixel-art size the procedural ones use
(the build embeds whatever is in art/maps/), so nothing else changes.

    OPENROUTER_API_KEY=... python3 tools/gen_map_bg_ai.py              # all maps
    OPENROUTER_API_KEY=... python3 tools/gen_map_bg_ai.py m3 m9        # just these
    BW_IMAGE_MODEL=google/gemini-2.5-flash-image python3 tools/gen_map_bg_ai.py m1

Not run yet: this workspace can't reach openrouter.ai (network policy) and has no key. It
costs money per image, so run it yourself, or ask Claude to once access is set up.
"""
import os, sys, json, base64, io, urllib.request
from PIL import Image

ROOT = os.path.join(os.path.dirname(os.path.abspath(__file__)), '..')
OUT = os.path.join(ROOT, 'art', 'maps')
MODEL = os.environ.get('BW_IMAGE_MODEL', 'google/gemini-2.5-flash-image')
STYLE = ("Top-down 16-bit pixel art game map background, 16:9, cosy storybook palette, soft top-left "
         "light, no text, no UI, no characters, no buildings. Keep the middle horizontal band calm and "
         "open (a trail with battle markers will be drawn there); put detail toward the edges.")
PROMPTS = {
    'm1': 'Forest outskirts meadow: grass with wildflowers, clusters of pines and round oaks, a winding stream along the bottom, a small pond.',
    'm2': 'Sunken wetland hollow: teal marsh, many still pools with lily pads, reeds, a slow river across the top.',
    'm3': 'Ashen volcanic slope: grey-brown ash and rock, thin glowing lava cracks, scattered boulders, dead trees.',
    'm4': 'Cave floor seen from above: dark violet stone, glowing blue and pink crystal clusters, small dark pools.',
    'm5': 'Golden savanna: tall dry grass, dirt patches, flat-topped acacia trees, one watering hole.',
    'm6': 'Snowy tundra: snowfield with soft drifts, a frozen lake, snow-covered pines, ice-blue shadows.',
    'm7': 'Shallow tropical sea from above: turquoise water, sand bars, colourful coral reefs.',
    'm8': 'Dark swamp: murky green ground, black water pools, dead trees, reeds, a few fireflies.',
    'm9': 'Basalt foundry: black basalt plates, a river of glowing lava across the top, orange seams.',
    'm10': 'Mountain eyrie: pale grey cliff tops, drifting clouds, sky showing through gaps, sparse pines.',
    'm11': 'Sundered crimson peak: scorched red rock, glowing rifts, red crystals, drifting embers.',
}


def generate(map_id, key):
    body = {'model': MODEL, 'modalities': ['image', 'text'],
            'messages': [{'role': 'user', 'content': STYLE + ' Scene: ' + PROMPTS[map_id]}]}
    req = urllib.request.Request('https://openrouter.ai/api/v1/chat/completions', data=json.dumps(body).encode(),
                                 headers={'Authorization': 'Bearer ' + key, 'Content-Type': 'application/json'})
    with urllib.request.urlopen(req, timeout=180) as r:
        data = json.load(r)
    imgs = (data.get('choices') or [{}])[0].get('message', {}).get('images') or []
    if not imgs:
        raise RuntimeError('no image in response: ' + json.dumps(data)[:300])
    url = imgs[0]['image_url']['url']
    raw = base64.b64decode(url.split(',', 1)[1])
    im = Image.open(io.BytesIO(raw)).convert('RGB')
    # centre-crop to 16:9, then down to the game's pixel grid and a small palette
    w, h = im.size; th = int(w * 9 / 16)
    if th <= h: im = im.crop((0, (h - th) // 2, w, (h - th) // 2 + th))
    else:
        tw = int(h * 16 / 9); im = im.crop(((w - tw) // 2, 0, (w - tw) // 2 + tw, h))
    im = im.resize((256, 144), Image.LANCZOS).quantize(colors=48, method=Image.Quantize.MEDIANCUT, dither=Image.Dither.NONE)
    os.makedirs(OUT, exist_ok=True)
    path = os.path.join(OUT, map_id + '.png'); im.save(path, optimize=True)
    return path


if __name__ == '__main__':
    key = os.environ.get('OPENROUTER_API_KEY')
    if not key:
        sys.exit('Set OPENROUTER_API_KEY first (and make sure openrouter.ai is reachable).')
    for mid in (sys.argv[1:] or list(PROMPTS)):
        print('wrote', generate(mid, key))
