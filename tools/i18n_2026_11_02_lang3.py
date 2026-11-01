#!/usr/bin/env python3
"""Package LANG3 (2026-11-02): translations for the English texts that packages UI7, UI9, UI10, UI11, ENG15, UI12, UI13, ENG16 and UI14
added or changed since 10-31, in all 12 languages. Rows live in tools/i18n_2026_11_02_lang3_a.py, _b.py and _c.py (English, then the
12 translations in CODES order); card names go to lang/cards/<code>.json, every other text to lang/<code>.json (rows that already exist
are kept as they are). Five texts that only changed a little are derived from the existing translation of their old English
(Keen Eye -> True Sight, Headwind dropped from a list, "PRO, BPRO, X-REF" -> the skirmish); the old rows go when
`python3 tools/i18n_refresh.py --write` drops the dead keys. Tagalog, Tamil, Japanese and Korean deserve a native read.
    python3 tools/i18n_2026_11_02_lang3.py"""
import json, os, re, sys
ROOT = os.path.join(os.path.dirname(os.path.abspath(__file__)), '..')
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
CODES = ['fr', 'de', 'es', 'it', 'pt', 'tl', 'ta', 'id', 'zh-Hans', 'zh-Hant', 'ja', 'ko']
import i18n_2026_11_02_lang3_a as A, i18n_2026_11_02_lang3_b as B, i18n_2026_11_02_lang3_c as C

KEEN = ['Œil vif', 'Scharfes Auge', 'Ojo avizor', 'Occhio acuto', 'Olho atento', 'Matalas na Mata', 'கூர்மையான கண்', 'Mata Tajam', '锐眼', '銳眼', '鋭い目', '예리한 눈']
TRUE = ['Vue véritable', 'Wahres Sehen', 'Visión verdadera', 'Vista vera', 'Visão verdadeira', 'Tunay na Paningin', 'மெய்ப்பார்வை', 'Penglihatan Sejati', '真视', '真視', '真視', '진실의 눈']
HEAD = ['Vent de face, ', 'Gegenwind, ', 'Viento en contra, ', 'Vento contrario, ', 'Vento contra, ', 'Headwind, ', 'எதிர்க்காற்று, ', 'Angin Haluan, ', '逆风、', '逆風、', '向かい風、', '역풍, ']
PRO = [', PRO, BPRO, X-REF', ', PRO, BPRO, X-REF', ', PRO, BPRO, X-REF', ', PRO, BPRO, X-REF', ', PRO, BPRO, X-REF', ', PRO, BPRO, X-REF', ', PRO, BPRO, X-REF', ', PRO, BPRO, X-REF', '、PRO、BPRO、X-REF', '、PRO、BPRO、X-REF', '、PRO、BPRO、X-REF', ', PRO, BPRO, X-REF']
SK = [', et l’escarmouche de la carte, <N>-SK', ' und das Scharmützel der Karte, <N>-SK', ', y la escaramuza del mapa, <N>-SK', ', e la schermaglia della mappa, <N>-SK',
      ', e a escaramuça do mapa, <N>-SK', ', at ang sagupaan ng mapa, <N>-SK', ', மற்றும் வரைபடத்தின் சிறு மோதல், <N>-SK', ', dan pertempuran kecil peta, <N>-SK',
      '，以及该地图的遭遇战，<N>-SK', '，以及該地圖的遭遇戰，<N>-SK', '、そのマップの小競り合い、<N>-SK', ', 그리고 그 맵의 교전, <N>-SK']
# English of the new text -> (English of the old text, per-language edit of the old translation)
ALT = {'de': [('Scharfem Auge', 'Wahrem Sehen')]}   # inflected forms in the old translation
def sub(a, b):
    def f(i, s):
        for x, y in [(a[i], b[i])] + ALT.get(CODES[i], []):
            if x in s: return s.replace(x, y)
        return None
    return f
DERIVED = [
 ('Enemies beyond your reach show only their art. Facing one, Darksight, True Sight or Illuminate reveals it.',
  'Enemies beyond your reach show only their art. Facing one, Darksight, Keen Eye or Illuminate reveals it.', sub(KEEN, TRUE)),
 ('Your reach is every column holding one of your units, and the ones beside it. A Darksight, True Sight or Illuminate unit reveals what it covers for the rest of the fight. Only what you see changes; combat and the CPU play as normal.',
  'Your reach is every column holding one of your units, and the ones beside it. A Darksight, Keen Eye or Illuminate unit reveals what it covers for the rest of the fight. Only what you see changes; combat and the CPU play as normal.', sub(KEEN, TRUE)),
 ('Bring a unit beside it, or use Darksight, True Sight or Illuminate.', 'Bring a unit beside it, or use Darksight, Keen Eye or Illuminate.', sub(KEEN, TRUE)),
 ("Off here: Twin Strike, Frenzy's second swing, Twin Shot's second arrow, Twin, Echoing Wood, Crit, Expose's crit, Rage, Mighty, Tall Grass's double hits, Supreme Tide (plain Tide instead), Double Time, the extra turns of Fast Forward, Tailwind and Quick Attack, and Second Pitch.",
  "Off here: Headwind, Twin Strike, Frenzy's second swing, Twin Shot's second arrow, Twin, Echoing Wood, Crit, Expose's crit, Rage, Mighty, Tall Grass's double hits, Supreme Tide (plain Tide instead), Double Time, the extra turns of Fast Forward, Tailwind and Quick Attack, and Second Pitch.",
  sub(HEAD, [''] * 12)),
 ("On: every Conquest fight (road, and the map's skirmish, <N>-SK) deals you the chosen reference deck at that map's levels instead of your deck. Free, no rewards. Kept on this device.",
  "On: every Conquest fight (road, PRO, BPRO, X-REF) deals you the chosen reference deck at that map's levels instead of your deck. Free, no rewards. Kept on this device.", sub(PRO, SK)),
]
ph = lambda s: sorted(set(re.findall(r'\{\w+\}', s)))


def dump(path, d):
    with open(path, 'w', encoding='utf-8') as fh:
        json.dump(d, fh, ensure_ascii=False, indent=1); fh.write('\n')


def load(path):
    return json.load(open(path, encoding='utf-8'))


def main():
    # a text with a harvest-style {v1} placeholder (tools/i18n_ui.py: a ${...} in arena_app.js) goes to lang/ui, the rest to the main pack
    rows = [(en, r, 'ui' if re.search(r'\{v\d\}', en) else 'main') for en, r in A.T + B.T + C.T] + [(en, r, 'cards') for en, r in C.CARDS]
    seen = set()
    for en, r, _ in rows:
        assert en not in seen, 'duplicate row: ' + en[:60]
        seen.add(en)
        assert len(r) == 12, (en, len(r))
    added = {c: 0 for c in CODES}
    for i, code in enumerate(CODES):
        mp = os.path.join(ROOT, 'lang', code + '.json'); main_pack = load(mp)
        cp = os.path.join(ROOT, 'lang', 'cards', code + '.json'); cards_pack = load(cp)
        up = os.path.join(ROOT, 'lang', 'ui', code + '.json'); ui_pack = load(up)
        for en, r, where in rows:
            assert ph(en) == ph(r[i]) or where == 'cards', (code, en[:60], ph(en), ph(r[i]))
            tgt = {'main': main_pack, 'ui': ui_pack, 'cards': cards_pack}[where]
            if en not in tgt: added[code] += 1
            tgt.setdefault(en, r[i])
        for en, old_en, fn in DERIVED:
            if en in main_pack: continue   # already derived (the old row goes with tools/i18n_refresh.py --write)
            old = main_pack.get(old_en) or ui_pack.get(old_en)
            assert old, (code, 'no old row for', old_en[:50])
            new = fn(i, old)
            assert new is not None and ph(new) == ph(en) and new != old, (code, 'cannot derive', en[:50])
            if en not in main_pack: added[code] += 1
            main_pack.setdefault(en, new)
        dump(mp, main_pack)
        dump(cp, cards_pack)
        dump(up, ui_pack)
    print('ok: rows added per language:', added)


if __name__ == '__main__':
    main()
