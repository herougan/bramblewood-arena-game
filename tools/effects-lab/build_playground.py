#!/usr/bin/env python3
"""Builds the VFX Playground (tools/effects-lab/playground.src.html) into one self-contained page:
GSAP 3.13 + plugins inlined, card art and a map image as data URIs. Output: .fxcat/playground.html"""
import base64, json, os
HERE = os.path.dirname(os.path.abspath(__file__)); ROOT = os.path.abspath(os.path.join(HERE, '..', '..'))
src = open(os.path.join(HERE, 'playground.src.html')).read()
cards = {c['id']: c for c in json.load(open(os.path.join(ROOT, 'canonical', 'cards.json')))}
art = lambda i: cards[i].get('art', '')
mp = 'data:image/png;base64,' + base64.b64encode(open(os.path.join(ROOT, 'assets', 'maps', 'm1.png'), 'rb').read()).decode()
V = os.path.join(HERE, 'vendor', 'gsap-3.13.0')
order = ['gsap', 'MotionPathPlugin', 'Physics2DPlugin', 'SplitText', 'DrawSVGPlugin', 'MorphSVGPlugin', 'CustomEase', 'CustomWiggle', 'CustomBounce', 'ScrambleTextPlugin']
scripts = '\n'.join('<script>' + open(os.path.join(V, f + '.min.js')).read().replace('</script', '<\\/script') + '</script>' for f in order)
# 2026-10-16: the new demos run the game's FX.G (map titles, grandeur, the fun set), with the title fonts and each theme's map art.
THEMES = [['forest', 'm1', 'Bramblewood Outskirts', '🌲', 'Map 0'], ['meadow', 'mq', 'Clovermead', '🍀', 'Side map'], ['beach', 'mb', 'Pebble Beach', '🏖️', 'Map 3'], ['water', 'mp', 'Lilypad Reach', '🪷', 'Side map'], ['reef', 'm7', 'Coral Current', '🐠', 'Map 11'], ['swamp', 'mw', 'Gatorback Swamp', '🐊', 'Map 6'], ['mist', 'ms', 'The Sunken Grove', '🌳', 'Side map'], ['fungal', 'mu', 'The Morel Hollow', '🍄', 'Map 8'], ['cave', 'm4', 'Caves & Alcoves', '🦇', 'Map 9'], ['crystal', 'mn', 'The Glimmer Depths', '💎', 'Side map'], ['alpine', 'm10', 'Eyrie Heights', '🏔️', 'Map 12'], ['tundra', 'm6', 'Wolfsbane Tundra', '🐺', 'Map 18'], ['desert', 'md', 'The Glass Dunes', '🏜️', 'Map 19'], ['savanna', 'm5', 'Savanna Reaches', '🌾', 'Map 15'], ['volcano', 'm11', 'The Sundered Peak', '🌋', 'Map 21'], ['forge', 'm9', 'Basalt Foundry', '🪨', 'Side map'], ['night', 'm21', 'The Quiet Summit', '🏔️', 'Map 22'], ['lair', 'mx', 'Volcano Lair', '🐉', 'Side map']]
d64 = lambda p, mime: 'data:' + mime + ';base64,' + base64.b64encode(open(p, 'rb').read()).decode()
maps = {t[1]: d64(os.path.join(ROOT, 'assets', 'maps', t[1] + '.png'), 'image/png') for t in THEMES}
maps['m1'] = mp
fonts = ''.join("@font-face{font-family:'%s'; font-weight:%s; font-display:swap; src:url(%s) format('woff2');}\n" % (fam, w, d64(os.path.join(ROOT, 'fonts', f), 'font/woff2'))
  for fam, w, f in [('Caveat', 700, 'caveat-latin-700-normal.woff2'), ('MedievalSharp', 400, 'medievalsharp-latin-400-normal.woff2'), ('Lilita One', 400, 'lilita-one-latin-400-normal.woff2')])
fxg = open(os.path.join(ROOT, 'bramblewood-fx-g.js'), encoding='utf-8').read().replace('</script', '<\\/script')
src = src.replace('__FONTS__', fonts).replace('__FXG__', fxg).replace('__MAPS__', json.dumps(maps)).replace('__THEMES__', json.dumps(THEMES))
for k, v in maps.items(): src = src.replace('__MAP_' + k + '__', v)
out = (src.replace('__ART_A__', art('otter-centurion')).replace('__ART_B__', art('owl-fletcher')).replace('__ART_C__', art('eagle-sharpshooter'))
          .replace('__MAP__', mp).replace('__SCRIPTS__', scripts))
os.makedirs(os.path.join(ROOT, '.fxcat'), exist_ok=True)
open(os.path.join(ROOT, '.fxcat', 'playground.html'), 'w').write(out)
print('playground.html', len(out)//1024, 'KB')
