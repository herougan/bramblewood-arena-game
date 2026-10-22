#!/usr/bin/env python3
"""Game texts added on 2026-10-22 by package RW2 (owner on RW-1 and the raid drops, 12:13).

  * the challenge card on the fight panel: its ribbon ("Challenge") and its screen-reader words ("a challenge card");
  * a raid fight you only survived can now drop a card: its tooltip on the results ("A card dropped in this raid fight").

Same rules as i18n_2026_10_22_rw.py (every {placeholder} kept). Same caveats as i18n_core.py (Tagalog, Tamil, Japanese and Korean deserve a
native read). The keys are the English game texts exactly.

    python3 tools/i18n_2026_10_22_rw2.py && python3 tools/i18n_refresh.py --write && python3 tools/i18n_ui.py --write
"""
import json, os, re
ROOT = os.path.join(os.path.dirname(os.path.abspath(__file__)), '..')
CODES = ['fr', 'de', 'es', 'it', 'pt', 'tl', 'ta', 'id', 'zh-Hans', 'zh-Hant', 'ja', 'ko']
T = {
"Challenge": [
 "Défi", "Herausforderung", "Desafío", "Sfida", "Desafio", "Hamon", "சவால்", "Tantangan", "挑战", "挑戰", "チャレンジ", "도전"],
"a challenge card": [
 "une carte défi", "eine Herausforderungskarte", "una carta de desafío", "una carta sfida", "uma carta de desafio", "isang challenge card",
 "ஒரு சவால் அட்டை", "kartu tantangan", "一张挑战卡", "一張挑戰卡", "チャレンジカード", "도전 카드"],
"A card dropped in this raid fight": [
 "Une carte est tombée dans ce combat de raid", "In diesem Raidkampf ist eine Karte gefallen", "Ha caído una carta en este combate de incursión",
 "In questo scontro del raid è caduta una carta", "Uma carta caiu nesta luta de raide", "May card na nalaglag sa raid fight na ito",
 "இந்த ரெய்டு சண்டையில் ஒரு அட்டை கிடைத்தது", "Sebuah kartu jatuh di pertarungan raid ini", "这场突袭战掉落了一张卡牌",
 "這場突襲戰掉落了一張卡牌", "このレイド戦でカードがドロップしました", "이번 레이드 전투에서 카드가 나왔어요"],
}
assert all(len(v) == len(CODES) for v in T.values()), [k for k, v in T.items() if len(v) != len(CODES)]
ph = lambda s: sorted(set(re.findall(r'\{\w+\}', s)))
assert all(ph(k) == ph(t) for k, v in T.items() for t in v)
if __name__ == '__main__':
    added = 0
    for i, code in enumerate(CODES):
        path = os.path.join(ROOT, 'lang', code + '.json')
        pack = json.load(open(path, encoding='utf-8'))
        for en, row in T.items():
            if en in pack: continue  # a row a pack already has is left as the pack has it
            pack[en] = row[i]; added += 1
        with open(path, 'w', encoding='utf-8') as fh:
            json.dump(pack, fh, ensure_ascii=False, indent=1); fh.write('\n')
    print('wrote', len(CODES), 'packs;', len(T), 'strings each;', added, 'rows written')
