#!/usr/bin/env python3
"""Add or update texts and their 12 translations from one small table (2026-11-11, package TOOLS1).

Replaces the ~20 lines each dated tools/i18n_<date>_<pkg>.py copied; the old scripts stay as they are.

    python3 tools/i18n_add.py TABLE.json [--overwrite] [--keyify] [--no-export]

TABLE is a .json file, or a .py file that defines TABLE = {...}. Sections, all optional:
  tx      "ui.pkg-name": {"en": "English", "fr": "...", ... "ko": "..."}  -> the TEXT table in bramblewood-texts.js, plus a row in
          lang/<code>.json keyed by the English text (leading emoji peeled, as the page translator does)
  pack    "English text": {"fr": "...", ...}    -> lang/<code>.json only (text the code reads through _t, no TX key)
  cards   "Card name": {"fr": "...", ...}       -> lang/cards/<code>.json
  flavor  "Flavour line": {"fr": "...", ...}    -> lang/ui/<code>.json
A translation set is an object with the 12 codes (fr de es it pt tl ta id zh-Hans zh-Hant ja ko) or a list of 12 in that order; a tx
entry may also be a list of 13 (English first). Every code must be there and every {placeholder} kept (an English plural ending such
as {s} may be dropped); one bad entry and nothing is written. Rows that exist are kept (hand edits survive) unless --overwrite.
A tx key whose English changed is updated in place and the new English gets its rows (old rows stay until tools/i18n_ui.py --write).
Safe to run twice.

Then: --keyify runs tools/text/keyify.py (it rewrites arena_app.js; it lists the keys it made that have no translation yet), and
docs/game-texts.xlsx is refreshed with tools/text/export_texts.py (about 45 s) unless --no-export. Build afterwards.

From Python: sys.path.insert(0, 'tools'); import i18n_add; i18n_add.apply_table({'tx': {...}}).
The root is the folder above this file, so a copy of tools/ + bramblewood-texts.js + lang/ works as a sandbox (tests/tools1-2026-11-11.js).
"""
import argparse, json, os, re, runpy, subprocess, sys, unicodedata

HERE = os.path.dirname(os.path.abspath(__file__))
ROOT = os.path.dirname(HERE)
sys.path.insert(0, os.path.join(HERE, 'text'))
import textlib as T  # its ROOT is derived from its own location, the same tree as ours

CODES = ['fr', 'de', 'es', 'it', 'pt', 'tl', 'ta', 'id', 'zh-Hans', 'zh-Hant', 'ja', 'ko']
PACKS = {'main': 'lang/{}.json', 'cards': 'lang/cards/{}.json', 'flavor': 'lang/ui/{}.json'}
SECTIONS = ('tx', 'pack', 'cards', 'flavor')
PH = re.compile(r'\{(\w+)\}')
PLURAL = re.compile(r'^s\d?$|^plural_')  # the page translator's plural placeholders (bramblewood-i18n.js phKind)
KEY = re.compile(r'^\w+\.[\w.-]+$')
LEAD_CHARS = set('️‍↻→←▸▾•·★☆✓✕✗⚡')  # the page translator's LEAD, minus \s \p{Extended_Pictographic} \p{So} \p{Sk}


def core(text):
    """The pack key for an English text: leading emoji and symbols peeled, as bramblewood-i18n.js does."""
    t = text.strip()
    i = 0
    while i < len(t) and (t[i].isspace() or t[i] in LEAD_CHARS or unicodedata.category(t[i]) in ('So', 'Sk') or 0x1F000 <= ord(t[i]) <= 0x1FAFF):
        i += 1
    return t[i:] or t


def entry(section, key, val, errs):
    """-> (english, {code: text}) or None (the problems go to errs)."""
    en, tr = key, None
    if isinstance(val, list):
        if section == 'tx': en, val = (val[0] if val else None), val[1:]
        tr = dict(zip(CODES, val)) if len(val) == len(CODES) else None
        if tr is None: errs.append('%s %r: a list needs %d translations in the order of CODES' % (section, key, len(CODES))); return None
    elif isinstance(val, dict):
        tr = dict(val)
        if section == 'tx': en = tr.pop('en', None)
    else:
        errs.append('%s %r: expected an object or a list' % (section, key)); return None
    if not isinstance(en, str) or not en.strip(): errs.append('%s %r: no English text ("en")' % (section, key)); return None
    bad = [c for c in CODES if not isinstance(tr.get(c), str) or not tr[c].strip()]
    bad += ['unknown code ' + c for c in tr if c not in CODES]
    if bad: errs.append('%s %r: missing or bad %s' % (section, key, ', '.join(bad))); return None
    want, ok = set(PH.findall(en)), True
    for c in CODES:
        got = set(PH.findall(tr[c]))
        if got - want or {p for p in want - got if not PLURAL.match(p)}:
            errs.append('%s %r: %s changes the placeholders (English %s, %s %s)' % (section, key, c, sorted(want), c, sorted(got))); ok = False
    return (en, tr) if ok else None


def put(pack, k, v, overwrite, st):
    if k not in pack: pack[k] = v; st['added'] += 1
    elif pack[k] != v:
        if overwrite: pack[k] = v; st['overwritten'] += 1
        else: st['kept'] += 1


def dump(pack):
    return json.dumps(pack, ensure_ascii=False, indent=1) + '\n'


def apply_table(table, overwrite=False, root=ROOT):
    """Validate everything, then write. Returns {'tx_added', 'tx_updated', 'main'|'cards'|'flavor': {added, overwritten, kept}}."""
    errs = ['unknown section %r (use %s)' % (s, ', '.join(SECTIONS)) for s in table if s not in SECTIONS]
    rows = {s: [] for s in SECTIONS}
    for s in SECTIONS:
        for key, val in (table.get(s) or {}).items():
            if s == 'tx' and not KEY.match(key): errs.append('tx key %r does not look like ui.name (English text goes in "en")' % key); continue
            e = entry(s, key, val, errs)
            if e: rows[s].append((key,) + e)
    if errs: raise ValueError('\n'.join(errs))
    stats = {p: {'added': 0, 'overwritten': 0, 'kept': 0} for p in PACKS}
    stats.update(tx_added=0, tx_updated=0)
    if rows['tx']:
        tx = T.load_table(root)
        for key, en, _ in rows['tx']:
            if key not in tx: stats['tx_added'] += 1
            elif tx[key] != en: stats['tx_updated'] += 1
            else: continue
            tx[key] = en
        if stats['tx_added'] or stats['tx_updated']: T.save_table(tx, root)
    for pk, pat in PACKS.items():
        sel = rows['tx'] + rows['pack'] if pk == 'main' else rows['cards' if pk == 'cards' else 'flavor']
        if not sel: continue
        for c in CODES:
            p = os.path.join(root, pat.format(c))
            raw = open(p, encoding='utf-8').read() if os.path.exists(p) else ''
            pack = json.loads(raw) if raw else {}
            for key, en, tr in sel:
                if pk == 'main': put(pack, core(en), core(tr[c]), overwrite, stats[pk])
                else: put(pack, key, tr[c], overwrite, stats[pk])  # cards and flavor: the key is the English text itself
            new = dump(pack)
            if new != raw:
                os.makedirs(os.path.dirname(p), exist_ok=True)
                tmp = p + '.tmp'
                with open(tmp, 'w', encoding='utf-8') as fh: fh.write(new)
                os.replace(tmp, p)  # temp file + rename: an interrupted run never leaves a half-written pack
    return stats


def untranslated_new_keys(before, root=ROOT):
    """TX keys made since `before` (a set) whose English has no row in the French pack."""
    tx, fr = T.load_table(root), json.load(open(os.path.join(root, 'lang', 'fr.json'), encoding='utf-8'))
    return [(k, v) for k, v in tx.items() if k not in before and core(v) not in fr]


def main():
    ap = argparse.ArgumentParser(description='Add or update TX keys and card texts with their 12 translations (docs/guides/i18n.md).')
    ap.add_argument('table', help='a .json file, or a .py file that defines TABLE = {...}')
    ap.add_argument('--overwrite', action='store_true', help='replace translation rows that already exist with different text')
    ap.add_argument('--keyify', action='store_true', help='then run tools/text/keyify.py (rewrites arena_app.js)')
    ap.add_argument('--no-export', action='store_true', help='skip the docs/game-texts.xlsx refresh (about 45 s)')
    a = ap.parse_args()
    if a.table.endswith('.py'): table = runpy.run_path(a.table)['TABLE']
    else: table = json.load(open(a.table, encoding='utf-8'))
    try: st = apply_table(table, a.overwrite)
    except ValueError as e: print('i18n_add: nothing written\n  ' + str(e).replace('\n', '\n  ')); return 2
    rows = ['%s +%d' % (p, st[p]['added']) + (' ~%d overwritten' % st[p]['overwritten'] if st[p]['overwritten'] else '') +
            (' (%d differ, kept: --overwrite replaces them)' % st[p]['kept'] if st[p]['kept'] else '') for p in PACKS if sum(st[p].values())]
    print('i18n_add: tx %d added, %d updated; rows (x12 packs): %s' % (st['tx_added'], st['tx_updated'], ', '.join(rows) or 'nothing new'))
    if a.keyify:
        before = set(T.load_table())
        r = subprocess.run([sys.executable, os.path.join(HERE, 'text', 'keyify.py')], cwd=ROOT)
        if r.returncode: return r.returncode
        miss = untranslated_new_keys(before)
        if miss:
            print('keyify made %d keys with no translation yet (add them in the next table):' % len(miss))
            for k, v in miss[:10]: print('  %s: %s' % (k, v[:80]))
            if len(miss) > 10: print('  ... and %d more' % (len(miss) - 10))
    if not a.no_export:
        r = subprocess.run([sys.executable, os.path.join(HERE, 'text', 'export_texts.py')], cwd=ROOT)
        if r.returncode: return r.returncode
    return 0


if __name__ == '__main__':
    sys.exit(main())
