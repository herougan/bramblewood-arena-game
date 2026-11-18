"""POISON2 (2026-11-18, owner OWN-1118-1): the counter, status and damage type read Poison; Venomous N keeps its name.
Builds the table from the old English rows: new English by word swap, each pack's old translation with its own Poison word.
Run: python3 tools/i18n_2026_11_18_poison2.py  (safe to run twice: the second run finds no Venom left to change)."""
import json, re, sys
sys.path.insert(0, 'tools'); sys.path.insert(0, 'tools/text')
import i18n_add as A

KEEP = ('ui.eng33-venomous-name',)


def new_en(k, s):
    if k in KEEP: return s
    s = re.sub(r'Venomous(?! \d| \{n\})', 'Poison', s)
    for a, b in [('Envenomed', 'Poisoned'), ('envenomed', 'poisoned'), ('envenoms', 'poisons'), ('Venom', 'Poison'), ('venom', 'poison')]:
        s = s.replace(a, b)
    return s


SUBS = {  # per pack, in order; packs not listed keep their old words (they already read Poison there)
    'fr': [('Venin mortel', 'Poison mortel'), ('Venin', 'Poison'), ('venin', 'poison'), ('Envenim', 'Empoisonn'), ('envenim', 'empoisonn')],
    'tl': [('Kamandag', 'Lason')],
    'id': [(r'\bBisa\b', 'Racun'), (r'\bbisa\b', 'racun')],
    'zh-Hans': [('毒液喷吐', '\0'), ('毒液', '中毒'), ('\0', '毒液喷吐')],
    'zh-Hant': [('毒液噴吐', '\0'), ('毒液', '中毒'), ('\0', '毒液噴吐')],
}


def build():
    src = open('bramblewood-texts.js').read()
    rows = re.findall(r'^  "([^"]+)": "((?:[^"\\]|\\.)*)",?$', src, re.M)
    packs = {c: json.load(open('lang/%s.json' % c)) for c in A.CODES}
    tx = {}
    for k, s in rows:
        if not re.search('venom', s, re.I): continue
        en = json.loads('"' + s + '"'); n = new_en(k, en)
        if n == en: continue
        e = {'en': n}
        for c in A.CODES:
            t = packs[c][A.core(en)]
            for a, b in SUBS.get(c, []): t = re.sub(a, b, t)
            e[c] = t
        tx[k] = e
    return tx


if __name__ == '__main__':
    tx = build()
    print(len(tx), 'keys')
    A.apply_table({'tx': tx})
