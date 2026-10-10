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
out = (src.replace('__ART_A__', art('otter-centurion')).replace('__ART_B__', art('owl-fletcher')).replace('__ART_C__', art('eagle-sharpshooter'))
          .replace('__MAP__', mp).replace('__SCRIPTS__', scripts))
os.makedirs(os.path.join(ROOT, '.fxcat'), exist_ok=True)
open(os.path.join(ROOT, '.fxcat', 'playground.html'), 'w').write(out)
print('playground.html', len(out)//1024, 'KB')
