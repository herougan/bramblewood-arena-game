#!/usr/bin/env python3
"""Package CONTENT12 (2026-11-06; decision BAL16-2 a): road fight 17-8 is renamed after its leader since CUT3-1 a, "The Walrus Icebreaker"
(was "The Glacial Ape-King"), and its Easter-egg hint with it. Rows in lang/ui/<code>.json keyed by the English text (fight names and hints
live there); the card name's own translations (lang/cards) are followed. Rows that exist are kept, new rows are appended, nothing is sorted.
Tagalog, Tamil and Indonesian deserve a native read.
    python3 tools/i18n_2026_11_06_content12.py   (idempotent)"""
import json, os
ROOT = os.path.join(os.path.dirname(os.path.abspath(__file__)), '..')
CODES = ['fr', 'de', 'es', 'it', 'pt', 'tl', 'ta', 'id', 'zh-Hans', 'zh-Hant', 'ja', 'ko']
UI = [
 ('The Walrus Icebreaker', ['Le Morse brise-glace', 'Der Walross-Eisbrecher', 'La Morsa rompehielos', 'Il Tricheco Rompighiaccio', 'A Morsa Quebra-Gelo',
   'Ang Walrus na Pambasag-Yelo', 'பனியுடைக்கும் வால்ரஸ்', 'Sang Walrus Pemecah Es', '破冰海象', '破冰海象', 'セイウチの砕氷船', '쇄빙 바다코끼리']),
 ('Beat the Walrus Icebreaker flawlessly…', ['Battez le Morse brise-glace sans faute…', 'Besiege den Walross-Eisbrecher makellos …',
   'Vence a la Morsa rompehielos sin un rasguño…', 'Sconfiggi il Tricheco Rompighiaccio senza un graffio…', 'Vença a Morsa Quebra-Gelo sem um arranhão…',
   'Talunin ang Walrus na Pambasag-Yelo nang walang galos…', 'பனியுடைக்கும் வால்ரஸைக் காயமின்றி வெல்லுங்கள்…', 'Kalahkan Walrus Pemecah Es tanpa cela…',
   '无伤击败破冰海象……', '無傷擊敗破冰海象……', 'セイウチの砕氷船を無傷で倒す…', '쇄빙 바다코끼리를 무피해로 쓰러뜨리기…']),
]

GONE = ['Beat the Glacial Ape-King flawlessly…']


def load(p):
    with open(p, encoding='utf-8') as fh:
        return json.load(fh)


def dump(p, d):
    with open(p, 'w', encoding='utf-8') as fh:
        json.dump(d, fh, ensure_ascii=False, indent=1); fh.write('\n')


def main():
    stats = {}
    for i, code in enumerate(CODES):
        p = os.path.join(ROOT, 'lang', 'ui', code + '.json'); pack = load(p); added = 0
        for old in GONE: pack.pop(old, None)  # the old hint is no longer source text (tests/i18n-ui-2026-10-18)
        for en, tr in UI:
            assert len(tr) == 12, en
            if en not in pack: pack[en] = tr[i]; added += 1
        dump(p, pack); stats[code] = added
    print('ok: rows added per language:', stats)


if __name__ == '__main__':
    main()
