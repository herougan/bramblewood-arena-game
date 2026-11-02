#!/usr/bin/env python3
"""Package CONTENT8 (2026-11-02; owner 21:12, CONTENT7-3 "Dinoflagellates (algae). Type = algae, phyla - flora."): the card id night-algae,
Bright Night Algae, becomes Dinoflagellates: new name (lang/cards) and flavour line (lang/ui) in all 12 languages. The old English name and
flavour keys are removed from every pack. Key order is kept (new keys are appended). Tagalog, Tamil and Indonesian deserve a native read.
    python3 tools/i18n_2026_11_02_content8.py   (idempotent)"""
import json, os
ROOT = os.path.join(os.path.dirname(os.path.abspath(__file__)), '..')
CODES = ['fr', 'de', 'es', 'it', 'pt', 'tl', 'ta', 'id', 'zh-Hans', 'zh-Hant', 'ja', 'ko']

NAMES = [
 ('Bright Night Algae', 'Dinoflagellates', ['Dinoflagellés', 'Dinoflagellaten', 'Dinoflagelados', 'Dinoflagellati', 'Dinoflagelados', 'Dinoflagellate', 'டைனோஃபிளாஜெல்லேட்டுகள்', 'Dinoflagelata', '甲藻', '甲藻', '渦鞭毛藻', '와편모류']),
]
FLAVOR = [
 ('A glowing bacterium, blown up to the size of a barrel. Come dark, the bay lights up and there are two.', 'Each wave breaks in blue sparks. Come dark, the bay lights up and there are two.', [
  'Chaque vague éclate en étincelles bleues. À la nuit, la baie s’illumine et il y en a deux.', 'Jede Welle zerspringt in blaue Funken. Bei Dunkelheit leuchtet die Bucht, und es sind zwei.',
  'Cada ola estalla en chispas azules. Al oscurecer, la bahía se enciende y hay dos.', 'Ogni onda si spezza in scintille azzurre. Quando fa buio la baia si illumina e ce ne sono due.',
  'Cada onda se desfaz em faíscas azuis. Ao escurecer, a baía se ilumina e passam a ser duas.', 'Bawat alon ay nagiging asul na kislap. Paglubog ng araw, nagliliwanag ang look at dalawa na ito.',
  'ஒவ்வொரு அலையும் நீலத் தீப்பொறிகளாக உடைகிறது. இருட்டியதும் வளைகுடா ஒளிர்கிறது; இப்போது இரண்டு.',
  'Setiap ombak pecah menjadi percikan biru. Begitu gelap, teluk menyala dan jumlahnya menjadi dua.',
  '每一道浪都碎成蓝色的火花。天一黑，海湾亮起来，它就变成了两群。', '每一道浪都碎成藍色的火花。天一黑，海灣亮起來，牠就變成了兩群。',
  '波が砕けるたびに青い火花が散る。日が暮れると入り江が輝き、二群になる。', '파도가 부서질 때마다 푸른 불꽃이 튄다. 어두워지면 만이 환해지고, 둘이 된다.']),
]


def load(p):
    with open(p, encoding='utf-8') as fh:
        return json.load(fh)


def dump(p, d):
    with open(p, 'w', encoding='utf-8') as fh:
        json.dump(d, fh, ensure_ascii=False, indent=1); fh.write('\n')


def main():
    for rows in (NAMES, FLAVOR):
        for old, new, tr in rows:
            assert len(tr) == 12, new
    stats = {}
    for i, code in enumerate(CODES):
        paths = {w: os.path.join(ROOT, 'lang', *(([w] if w else []) + [code + '.json'])) for w in ('', 'cards', 'ui')}
        packs = {w: load(p) for w, p in paths.items()}
        dropped = added = 0
        for rows, where in ((NAMES, 'cards'), (FLAVOR, 'ui')):
            for old, new, tr in rows:
                if old:
                    for w in packs:
                        if old in packs[w]: del packs[w][old]; dropped += 1
                if new not in packs[where]: added += 1
                packs[where][new] = tr[i]
        for w, p in paths.items(): dump(p, packs[w])
        stats[code] = (added, dropped)
    print('ok: (added, old keys dropped) per language:', stats)


if __name__ == '__main__':
    main()
