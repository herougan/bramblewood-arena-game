#!/usr/bin/env python3
"""Game texts added on 2026-10-25 by package PL2 (owner playtest 10-24 22:28 / 10-25 00:02): the one-step trigger lesson, the Arena's
Co-op tab, the results' rank-reward ribbon ("[S] reward") and the pack card viewer's "Pack 1" pill. The lesson keeps each pack's own word
for the trigger chip (the old two-step lesson's). Tagalog, Tamil, Japanese and Korean deserve a native read.
    python3 tools/i18n_2026_10_25_pl2.py"""
import json, os, re
ROOT = os.path.join(os.path.dirname(os.path.abspath(__file__)), '..')
CODES = ['fr', 'de', 'es', 'it', 'pt', 'tl', 'ta', 'id', 'zh-Hans', 'zh-Hant', 'ja', 'ko']
T = {
 '⚡ This chip is a trigger — read the card.': [
   '⚡ Cette pastille est un déclencheur — lisez la carte.', '⚡ Dieses Chip ist ein Auslöser — lies die Karte.', '⚡ Esta ficha es un disparador — lee la carta.',
   '⚡ Questo gettone è un innesco — leggi la carta.', '⚡ Esta ficha é um gatilho — leia a carta.', '⚡ Ang chip na ito ay isang trigger — basahin ang card.',
   '⚡ இந்த சிப் ஒரு தூண்டி — அட்டையைப் படியுங்கள்.', '⚡ Chip ini adalah pemicu — baca kartunya.', '⚡ 这个小标记是触发效果 — 读一读卡牌。',
   '⚡ 這個小標記是觸發效果 — 讀一讀卡牌。', '⚡ このチップはトリガー — カードを読んでみよう。', '⚡ 이 칩은 트리거예요 — 카드를 읽어 보세요.'],
 'Co-op': ['Coop', 'Koop', 'Cooperativo', 'Cooperativa', 'Cooperativo', 'Co-op', 'கூட்டு', 'Ko-op', '合作', '合作', '協力', '협동'],
 'reward': ['récompense', 'Belohnung', 'recompensa', 'ricompensa', 'recompensa', 'gantimpala', 'பரிசு', 'hadiah', '奖励', '獎勵', '報酬', '보상'],
 '{rank} reward': ['Récompense {rank}', 'Belohnung {rank}', 'Recompensa {rank}', 'Ricompensa {rank}', 'Recompensa {rank}', 'Gantimpalang {rank}', '{rank} பரிசு', 'Hadiah {rank}',
                   '{rank} 奖励', '{rank} 獎勵', '{rank}報酬', '{rank} 보상'],
 'Pack {n}': ['Pack {n}', 'Pack {n}', 'Sobre {n}', 'Bustina {n}', 'Pacote {n}', 'Pack {n}', 'பொதி {n}', 'Paket {n}', '卡包 {n}', '卡包 {n}', 'パック{n}', '팩 {n}'],
}
def dump(path, d):
    with open(path, 'w', encoding='utf-8') as fh:
        json.dump(d, fh, ensure_ascii=False, indent=1); fh.write('\n')
ph = lambda s: sorted(set(re.findall(r'\{\w+\}', s)))
src = open(os.path.join(ROOT, 'bramblewood-texts.js'), encoding='utf-8').read()
for en in T: assert ('"' + en + '"') in src, en  # every one is a TX text
for i, code in enumerate(CODES):
    path = os.path.join(ROOT, 'lang', code + '.json'); pack = json.load(open(path, encoding='utf-8'))
    for en, row in T.items():
        assert len(row) == len(CODES) and ph(en) == ph(row[i]), (code, en)
        pack[en] = row[i]
    dump(path, pack)
print('wrote', len(CODES), 'packs:', len(T), 'texts each')
