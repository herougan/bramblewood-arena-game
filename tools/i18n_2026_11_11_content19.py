#!/usr/bin/env python3
"""Package CONTENT19 (2026-11-11, owner: "Add a new card, Sea Bass for Map 10"): the Sea Bass's name (lang/cards/<code>.json) and flavour line
(lang/ui/<code>.json), one row per English text, rows that exist are kept. Same two files and the same writer as CONTENT18's script (its
load / dump / CODES are reused). The names are the local names of the sea bass (the fishermen's "wolf of the sea" is its name in German,
Wolfsbarsch, and in French and Italian, loup / lupo di mare). Tagalog, Tamil and Indonesian deserve a native read.
    python3 tools/i18n_2026_11_11_content19.py   (idempotent)"""
import os
from i18n_2026_11_08_content18 import CODES, ROOT, load, dump

NAMES = [
 ('Sea Bass', ['Bar', 'Wolfsbarsch', 'Lubina', 'Spigola', 'Robalo', 'Apahap', 'கொடுவா மீன்', 'Ikan Kakap', '海鲈鱼', '海鱸魚', 'スズキ', '농어']),
]

FLAVOR = [
 ('The fishermen call it the wolf of the sea. It hunts the surf in loose packs and never fights the current.', [
   'Les pêcheurs l’appellent le loup de mer. Il chasse dans les vagues, en bandes lâches, et ne lutte jamais contre le courant.',
   'Die Fischer nennen ihn den Wolf des Meeres. Er jagt in der Brandung in lockeren Rudeln und kämpft nie gegen die Strömung.',
   'Los pescadores lo llaman el lobo del mar. Caza en el oleaje en manadas sueltas y nunca lucha contra la corriente.',
   'I pescatori lo chiamano il lupo di mare. Caccia tra i frangenti in branchi radi e non lotta mai contro la corrente.',
   'Os pescadores o chamam de lobo do mar. Ele caça na arrebentação em matilhas soltas e nunca luta contra a corrente.',
   'Tinatawag ito ng mga mangingisda na lobo ng dagat. Nangangaso ito sa along dumadaluyong sa maluwag na kawan at hindi kailanman lumalaban sa agos.',
   'மீனவர்கள் இதைக் கடலின் ஓநாய் என்கிறார்கள். அலைகளில் தளர்வான கூட்டங்களாக வேட்டையாடும்; நீரோட்டத்தை ஒருபோதும் எதிர்த்துப் போராடாது.',
   'Para nelayan menyebutnya serigala laut. Ia berburu di ombak dalam kawanan longgar dan tidak pernah melawan arus.',
   '渔民称它为海中之狼。它三五成群地在拍岸浪中捕猎，从不逆流而战。',
   '漁民稱牠為海中之狼。牠三五成群地在拍岸浪中獵食，從不逆流而戰。',
   '漁師はそれを海の狼と呼ぶ。波打ち際を、ゆるい群れで狩り、流れには決して逆らわない。',
   '어부들은 이 물고기를 바다의 늑대라고 부른다. 느슨한 무리를 지어 부서지는 파도 속에서 사냥하며, 물살과는 결코 싸우지 않는다.']),
]


def main():
    stats = {}
    for i, code in enumerate(CODES):
        added = 0
        for rel, rows in ((os.path.join('lang', 'cards', code + '.json'), NAMES), (os.path.join('lang', 'ui', code + '.json'), FLAVOR)):
            p = os.path.join(ROOT, rel); pack = load(p)
            for en, tr in rows:
                assert len(tr) == 12, en
                if en not in pack: pack[en] = tr[i]; added += 1
            dump(p, pack)
        stats[code] = added
    print('ok: rows added per language:', stats)


if __name__ == '__main__':
    main()
