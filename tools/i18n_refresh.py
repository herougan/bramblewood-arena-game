#!/usr/bin/env python3
"""Refresh the language packs against the game (2026-10-18, audit E6: the 12 packs dated from 10-15 and covered 17 of the 323
game texts in bramblewood-texts.js that have no {placeholder}).

    python3 tools/i18n_refresh.py            # report: dead keys, and game texts each pack is missing
    python3 tools/i18n_refresh.py --write    # also drop the dead keys from lang/*.json

A key is dead when its English text is nowhere in what the game ships: the string literals of every bramblewood-*.js and
arena_app.js (comments don't count), the template's HTML, the canonical/*.json data and the TEXT table. Translations are added by
the dated tools (tools/i18n_core.py, tools/i18n_2026_10_*.py); run them first, then this, since an old tool would re-add a key
that has since gone. Re-running is safe: it only removes and reports.

Texts with a {placeholder} are reported apart: TX() fills them in English before they reach the page, so the page translator
(bramblewood-i18n.js) can't match them, and a translation would never show. They need TX to look them up first (owner's call).
"""
import glob, html, json, os, re, subprocess, sys, unicodedata
ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
sys.path.insert(0, os.path.join(ROOT, 'tools', 'text'))
import textlib  # noqa: E402

CODES = ['fr', 'de', 'es', 'it', 'pt', 'tl', 'ta', 'id', 'zh-Hans', 'zh-Hant', 'ja', 'ko']
LEAD = re.compile(r'^[\s \W_]*', re.U)


# Game texts left in English on purpose: the defeat-screen quotes' pun names, and a GSAP easing string the keyifier swept into the
# TEXT table (results.elastic-out-1-5, not player text).
SKIP = {'Sun Tzoo', 'Julius Cheetah', 'Napoleon Bonapartridge', 'Isaac Newt', 'Charles Darwren', 'Albert Pinestein', 'Marie Curlew',
        'Abraham Lynxcoln', 'Theodore Moosevelt', 'Douglas MacOtter', 'George Washingtoad', 'Robert Burrows', 'elastic.out(1, .5)'}
LEAD_EXTRA = set('\u00a0\ufe0f\u200d↻→←▸▾•·★☆✓✕✗⚡')


def runtime_core(s):
    """What bramblewood-i18n.js translateText() looks up when the exact text isn't in the pack: the text without its leading
    emoji/symbols (Unicode So/Sk, spaces and a few arrows) and without trailing spaces or colons."""
    t = s.strip(); i = 0
    # (U+1F000 and up: emoji newer than this Python's Unicode tables, e.g. 🪽, are still emoji to the browser)
    while i < len(t) and (t[i].isspace() or t[i] in LEAD_EXTRA or unicodedata.category(t[i]) in ('So', 'Sk') or 0x1F000 <= ord(t[i]) <= 0x1FAFF): i += 1
    return t[i:].rstrip(' \t\n:')


def covered(text, pack):
    t = text.strip()
    return t in pack or runtime_core(t) in pack


def corpus():
    chunks = []
    js = ['arena_app.js'] + sorted(os.path.basename(p) for p in glob.glob(os.path.join(ROOT, 'bramblewood-*.js')))
    for rel in js:
        src = textlib.read(rel)
        lits, _ = textlib.lex(src)
        for L in lits:
            for kind, a, b in L.parts:
                if kind != 's': continue
                try: chunks.append(textlib.js_unescape(src[a:b]))
                except Exception: chunks.append(src[a:b])
    tpl = textlib.read('arena_template.html')
    chunks.append(re.sub(r'<!--[\s\S]*?-->', ' ', tpl))
    def walk(v):
        if isinstance(v, str): chunks.append(v)
        elif isinstance(v, dict): [walk(x) for x in v.values()]; [walk(k) for k in v.keys()]
        elif isinstance(v, list): [walk(x) for x in v]
    for p in glob.glob(os.path.join(ROOT, 'canonical', '*.json')):
        walk(json.load(open(p, encoding='utf-8')))
    text = '\n'.join(chunks)
    return text + '\n' + html.unescape(text)


def tx_table():
    out = subprocess.run(['node', '-e', "process.stdout.write(JSON.stringify(require(process.argv[1]).TEXT))",
                          os.path.join(ROOT, 'bramblewood-texts.js')], capture_output=True, text=True, check=True).stdout
    return json.loads(out)


def alive(key, text):
    k = key.strip()
    if not k or k in text: return True
    core = k[len(LEAD.match(k).group(0)):].rstrip(' :')
    return bool(core) and core in text


def main():
    write = '--write' in sys.argv
    text = corpus()
    TX = tx_table()
    plain = sorted({v.strip() for v in TX.values() if not re.search(r'\{\w+\}', v) and '<' not in v and v.strip() not in SKIP})
    held = sorted({v for v in TX.values() if re.search(r'\{\w+\}', v)})
    for code in CODES:
        path = os.path.join(ROOT, 'lang', code + '.json')
        pack = json.load(open(path, encoding='utf-8'))
        dead = [k for k in pack if not alive(k, text)]
        missing = [v for v in plain if not covered(v, pack)]
        bad = [k for k, v in pack.items() if set(re.findall(r'\{\w+\}', k)) != set(re.findall(r'\{\w+\}', v))]
        print(f'{code:8} {len(pack):4} keys · {len(dead):3} dead · game texts {len(plain) - len(missing)}/{len(plain)}'
              + (f' · placeholder mismatch: {bad}' if bad else ''))
        if '-v' in sys.argv:
            for k in dead: print('   dead:', k)
            for k in missing[:400]: print('   missing:', k)
        if write and dead:
            for k in dead: del pack[k]
            with open(path, 'w', encoding='utf-8') as fh:
                json.dump(dict(sorted(pack.items(), key=lambda kv: kv[0].lower())), fh, ensure_ascii=False, indent=1); fh.write('\n')
    print(f'{len(plain)} game texts without placeholders (+{len(SKIP)} kept in English); {len(held)} with placeholders (not translatable until TX looks them up)')


if __name__ == '__main__':
    main()
