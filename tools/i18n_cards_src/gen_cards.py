# Scratch generator (2026-10-18, package I2): cards_src/b*.txt -> lang/cards/<code>.json. Not shipped.
import glob, json, os, sys
HERE = os.path.dirname(os.path.abspath(__file__))
sys.path.insert(0, os.path.join(HERE, 'pylib'))
from opencc import OpenCC
s2t = OpenCC('s2tw')
ROOT = sys.argv[1]
COLS = ['fr', 'de', 'es', 'it', 'pt', 'tl', 'ta', 'id', 'zh-Hans', 'ja', 'ko']
out = {c: {} for c in COLS + ['zh-Hant']}
seen = set()
for fp in sorted(glob.glob(os.path.join(HERE, 'cards_src', 'b*.txt'))):
    for ln, line in enumerate(open(fp, encoding='utf-8'), 1):
        line = line.rstrip('\n')
        if not line.strip() or line.startswith('#'): continue
        en, rest = line.split(' => ', 1)
        parts = [p.strip() for p in rest.split(' | ')]
        if len(parts) not in (11, 12): raise SystemExit('%s:%d %s: %d columns' % (fp, ln, en, len(parts)))
        if en in seen: raise SystemExit('dup ' + en)
        seen.add(en)
        for c, v in zip(COLS, parts):
            if not v: raise SystemExit('empty %s %s' % (en, c))
            out[c][en] = v
        out['zh-Hant'][en] = parts[11] if len(parts) == 12 else s2t.convert(parts[8])
cards = json.load(open(os.path.join(ROOT, 'canonical/cards.json'), encoding='utf-8'))
visible = sorted({c['name'] for c in cards if not c.get('test')})
extra = seen - set(visible)
if extra: raise SystemExit('not card names: %s' % sorted(extra))
os.makedirs(os.path.join(ROOT, 'lang/cards'), exist_ok=True)
for code, d in out.items():
    main = json.load(open(os.path.join(ROOT, 'lang/%s.json' % code), encoding='utf-8'))
    # only names the main pack lacks (it wins anyway); sorted for clean diffs
    d = {k: d[k] for k in sorted(d)}
    miss = [n for n in visible if n not in main and n not in d]
    with open(os.path.join(ROOT, 'lang/cards/%s.json' % code), 'w', encoding='utf-8') as fh:
        json.dump(d, fh, ensure_ascii=False, indent=1); fh.write('\n')
    print(code, len(d), 'missing', len(miss), miss[:5])
