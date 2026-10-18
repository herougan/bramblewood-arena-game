#!/usr/bin/env python3
"""Package T texts (2026-10-18): the new texts of the tutorial / rewards package, in the 12 packs.
  * "It costs 🪵 Lumber: ..." is the line under a card that waited for pitching to open, in the central swap window (it replaces the
    "You're ready for bigger cards" toast);
  * "{name}: you already have this bramble. ..." is the hover of a spare bramble shown as a card among the cards won;
  * "SPARE" is that card's tag (a new one wears NEW!).
Same rules as i18n_2026_10_18d.py (every {placeholder} kept). Run tools/i18n_refresh.py afterwards; tests/i18n-templates-2026-10-18.js
checks every pack.

    python3 tools/i18n_2026_10_18t.py
"""
import json, os, re
ROOT = os.path.join(os.path.dirname(os.path.abspath(__file__)), '..')
CODES = ['fr', 'de', 'es', 'it', 'pt', 'tl', 'ta', 'id', 'zh-Hans', 'zh-Hant', 'ja', 'ko']
T = {
"It costs 🪵 Lumber: pitch a card you don't need to the Graveyard for Lumber, then play it.": [
  "Elle coûte du 🪵 Bois : envoyez au Cimetière une carte dont vous n’avez pas besoin pour gagner du Bois, puis jouez-la.",
  "Sie kostet 🪵 Holz: Wirf eine Karte, die du nicht brauchst, für Holz auf den Friedhof und spiel sie dann.",
  "Cuesta 🪵 Madera: manda al Cementerio una carta que no necesites para conseguir Madera y luego juégala.",
  "Costa 🪵 Legname: manda al Cimitero una carta che non ti serve per avere Legname, poi giocala.",
  "Custa 🪵 Madeira: manda para o Cemitério uma carta de que não precisas para ganhar Madeira e depois joga-a.",
  "Kailangan nito ng 🪵 Kahoy: itapon sa Libingan ang card na hindi mo kailangan para sa Kahoy, saka laruin ito.",
  "இதற்கு 🪵 மரக்கட்டை தேவை: தேவையில்லாத ஓர் அட்டையை மரக்கட்டைக்காக கல்லறைக்கு அனுப்பி, பிறகு இதை ஆடுங்கள்.",
  "Kartu ini butuh 🪵 Kayu: buang kartu yang tidak kamu perlukan ke Kuburan untuk Kayu, lalu mainkan.",
  "它需要 🪵 木材：把一张用不上的卡丢进墓地换木材，然后打出它。",
  "它需要 🪵 木材：把一張用不上的卡丟進墓地換木材，然後打出它。",
  "🪵 木材が必要です。いらないカードを墓地に送って木材にし、それから出しましょう。",
  "🪵 목재가 필요해요: 필요 없는 카드를 무덤에 버려 목재를 얻은 다음 내 보세요."],
"{name}: you already have this bramble. Fuse the spare in the Forge to level it up.": [
  "{name} : vous avez déjà ce roncier. Fusionnez le double à la Forge pour le faire monter de niveau.",
  "{name}: Diese Dornenhecke hast du schon. Verschmilz das Duplikat in der Schmiede, um sie aufzuwerten.",
  "{name}: ya tienes este zarzal. Funde el repetido en la Forja para subirlo de nivel.",
  "{name}: hai già questo rovo. Fondi il doppione nella Fucina per farlo salire di livello.",
  "{name}: já tens este silvado. Funde o repetido na Forja para lhe subir o nível.",
  "{name}: mayroon ka nang dawag na ito. Pagsamahin ang ekstra sa Pandayan para tumaas ang level nito.",
  "{name}: இந்த முட்புதர் ஏற்கெனவே உங்களிடம் உள்ளது. அதன் நிலையை உயர்த்த, கூடுதலானதை உலையில் இணையுங்கள்.",
  "{name}: kamu sudah punya semak ini. Leburkan cadangannya di Tempa untuk menaikkan levelnya.",
  "{name}：你已经有这个荆棘丛了。在锻造里熔合多出来的那份来升级它。",
  "{name}：你已經有這個荊棘叢了。在鍛造裡熔合多出來的那份來升級它。",
  "{name}：このいばらはもう持っています。予備を鍛冶で合成してレベルを上げましょう。",
  "{name}: 이미 가진 덤불이에요. 남는 것을 대장간에서 합성해 레벨을 올리세요."],
"SPARE": ["DOUBLE", "DUPLIKAT", "REPETIDO", "DOPPIONE", "REPETIDO", "EKSTRA", "கூடுதல்", "CADANGAN", "多余", "多餘", "予備", "여분"],
}
assert all(len(v) == len(CODES) for v in T.values()), [k for k, v in T.items() if len(v) != len(CODES)]
ph = lambda s: sorted(set(re.findall(r'\{\w+\}', s)))
assert all(ph(k) == ph(t) for k, v in T.items() for t in v), [(k, t) for k, v in T.items() for t in v if ph(k) != ph(t)]
if __name__ == '__main__':
    for i, code in enumerate(CODES):
        path = os.path.join(ROOT, 'lang', code + '.json')
        pack = json.load(open(path, encoding='utf-8')) if os.path.exists(path) else {}
        # each new row goes in front of the first key that sorts after it; the rows already there keep their order (fewer merge clashes)
        items = [(k, v) for k, v in pack.items() if k not in T]
        for en, row in T.items():
            at = next((j for j, (k, _) in enumerate(items) if k.lower() > en.lower()), len(items))
            items.insert(at, (en, row[i]))
        with open(path, 'w', encoding='utf-8') as fh:
            json.dump(dict(items), fh, ensure_ascii=False, indent=1); fh.write('\n')
    print('wrote', len(CODES), 'packs,', len(T), 'strings each')
