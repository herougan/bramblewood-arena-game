#!/usr/bin/env python3
"""2026-10-26 (package FIN1, RES4-3): the Tidelock Vault's floors and boss get aqua names (ids unchanged: roost, galleries, pools, matriarch).
Roost -> The Dripping Roost, Galleries -> The Sunken Galleries, Pools -> The Brine Pools, Hall -> The Tidewarden's Hall, boss -> The Tidewarden;
the three lines that still said "warren" now say the vault / the tide. Rewrites the English of the existing TX keys in bramblewood-texts.js and
re-keys the 12 lang/<code>.json rows (the old English row is dropped once nothing else uses it). Tagalog, Tamil, Japanese, Korean deserve a native read.
    python3 tools/i18n_2026_10_26_fin1.py"""
import json, os, re
ROOT = os.path.join(os.path.dirname(os.path.abspath(__file__)), '..')
CODES = ['fr', 'de', 'es', 'it', 'pt', 'tl', 'ta', 'id', 'zh-Hans', 'zh-Hant', 'ja', 'ko']
# key, old English, new English, [fr, de, es, it, pt, tl, ta, id, zh-Hans, zh-Hant, ja, ko]
K = [
 ('ui.ar3-dungeon-name', 'The Hollow Warren', 'The Tidelock Vault', ['Le Coffre des Marées', 'Der Gezeitentresor', 'La Cámara de la Marea', 'La Cripta delle Maree', 'O Cofre das Marés', 'Ang Bangan ng Taog', None, None, None, None, None, None]),
 ('ui.ar3-floor-roost', 'The Bat Roost', 'The Dripping Roost', ['Le Perchoir ruisselant', 'Der tropfende Rastplatz', 'El Dormidero Goteante', 'Il Posatoio Gocciolante', 'O Poleiro Gotejante', 'Ang Tumutulong na Tuluyan', 'சொட்டும் தங்குமிடம்', 'Sarang Menetes', '滴水栖洞', '滴水棲洞', 'したたる止まり木', '물방울 맺힌 보금자리']),
 ('ui.ar3-floor-galleries', 'The Mole Galleries', 'The Sunken Galleries', ['Les Galeries englouties', 'Die versunkenen Stollen', 'Las Galerías Sumergidas', 'Le Gallerie Sommerse', 'As Galerias Submersas', 'Ang Lumubog na mga Lagusan', 'மூழ்கிய சுரங்கப் பாதைகள்', 'Galeri Tenggelam', '沉没坑道', '沉沒坑道', '沈んだ坑道', '가라앉은 갱도']),
 ('ui.ar3-floor-pools', 'The Salamander Pools', 'The Brine Pools', ['Les Bassins de saumure', 'Die Salzlaken-Becken', 'Las Pozas de Salmuera', 'Le Pozze di Salamoia', 'As Poças de Salmoura', 'Ang mga Poso ng Alat', 'உப்புநீர்க் குளங்கள்', 'Kolam Air Garam', '盐水池', '鹽水池', '塩水の池', '소금물 웅덩이']),
 ('ui.ar3-floor-matriarch', "The Matriarch's Hall", "The Tidewarden's Hall", ['La Salle du Gardien des marées', 'Die Halle des Gezeitenwächters', 'La Sala del Guardián de la Marea', 'La Sala del Custode delle Maree', 'O Salão do Guardião da Maré', 'Ang Bulwagan ng Tagabantay ng Taog', 'அலைக்காவலனின் மண்டபம்', 'Aula Penjaga Pasang', '潮汐守卫的大厅', '潮汐守衛的大廳', '潮の番人の広間', '조수지기의 홀']),
 ('ui.ar3-boss-name', 'The Hollow Matriarch', 'The Tidewarden', ['Le Gardien des marées', 'Der Gezeitenwächter', 'El Guardián de la Marea', 'Il Custode delle Maree', 'O Guardião da Maré', 'Ang Tagabantay ng Taog', 'அலைக்காவலன்', 'Penjaga Pasang', '潮汐守卫', '潮汐守衛', '潮の番人', '조수지기']),
 ('ui.ar3-mech-smack', 'The Matriarch marks a column, then strikes each of your units in it for 4.', 'The Tidewarden marks a column, then strikes each of your units in it for 4.',
  ['Le Gardien des marées marque une colonne, puis frappe chacune de vos unités qui s’y trouvent pour 4.', 'Der Gezeitenwächter markiert eine Spalte und trifft dann jede deiner Einheiten darin mit 4.', 'El Guardián de la Marea marca una columna y golpea a cada una de tus unidades en ella por 4.', 'Il Custode delle Maree segna una colonna, poi colpisce ogni tua unità al suo interno per 4.', 'O Guardião da Maré marca uma coluna e golpeia cada uma das suas unidades nela por 4.', 'Minamarkahan ng Tagabantay ng Taog ang isang hanay, saka tatamaan ang bawat unit mo roon ng 4.', 'அலைக்காவலன் ஒரு நெடுவரிசையைக் குறித்து, அதிலுள்ள உங்கள் ஒவ்வொரு படையையும் 4 சேதத்துடன் தாக்குவான்.', 'Penjaga Pasang menandai satu kolom, lalu menyerang setiap unitmu di dalamnya sebesar 4.', '潮汐守卫会标记一列，然后对该列中你的每个单位造成 4 点伤害。', '潮汐守衛會標記一列，然後對該列中你的每個單位造成 4 點傷害。', '潮の番人が1列を示し、その列にいるあなたのユニットそれぞれに4ダメージを与える。', '조수지기가 한 열을 표시한 뒤, 그 열에 있는 내 유닛마다 4 피해를 줍니다.']),
 ('ui.ar3-floor-time', 'The warren closed: out of rounds', 'The tide came back: out of rounds', ['La marée est revenue : plus de manches', 'Die Flut kam zurück: keine Runden mehr', 'La marea volvió: sin rondas', 'La marea è tornata: round esauriti', 'A maré voltou: acabaram as rodadas', 'Bumalik ang tubig: ubos na ang mga round', 'அலை திரும்பி வந்தது: சுற்றுகள் தீர்ந்தன', 'Air pasang kembali: ronde habis', '潮水回来了：回合用完', '潮水回來了：回合用完', '潮が戻ってきた：ラウンド切れ', '밀물이 돌아왔다: 라운드 소진']),
 ('ui.ar3-group-sub', 'Two to four players side by side against the Hollow Warren. Everyone plans at the same time, then all the plays land together.', 'Two to four players side by side against the Tidelock Vault. Everyone plans at the same time, then all the plays land together.',
  ['De deux à quatre joueurs côte à côte contre le Coffre des Marées. Tout le monde prépare son coup en même temps, puis tous les coups tombent ensemble.', 'Zwei bis vier Spieler Seite an Seite gegen den Gezeitentresor. Alle planen gleichzeitig, dann werden alle Züge zusammen ausgeführt.', 'De dos a cuatro jugadores codo con codo contra la Cámara de la Marea. Todos planean a la vez y luego todas las jugadas caen juntas.', 'Da due a quattro giocatori fianco a fianco contro la Cripta delle Maree. Tutti pianificano insieme, poi tutte le mosse arrivano insieme.', 'De dois a quatro jogadores lado a lado contra o Cofre das Marés. Todos planejam ao mesmo tempo e depois todas as jogadas caem juntas.', 'Dalawa hanggang apat na manlalaro, magkakatabi laban sa Bangan ng Taog. Sabay-sabay na nagpaplano ang lahat, saka sabay-sabay na bumabagsak ang mga laro.', 'இரண்டு முதல் நான்கு வீரர்கள் அருகருகே அலைப்பூட்டுக் களஞ்சியத்துக்கு எதிராக. அனைவரும் ஒரே நேரத்தில் திட்டமிடுவார்கள்; பின்னர் எல்லா ஆட்டங்களும் ஒன்றாக இறங்கும்.', 'Dua sampai empat pemain berdampingan melawan Ruang Kunci Pasang. Semua merencanakan bersamaan, lalu semua langkah jatuh bersamaan.', '两到四名玩家并肩对抗潮锁宝库。所有人同时计划，然后所有出牌一起生效。', '兩到四名玩家並肩對抗潮鎖寶庫。所有人同時計劃，然後所有出牌一起生效。', '2〜4人が肩を並べてタイドロック金庫に挑みます。全員が同時に作戦を立て、すべてのプレイが一斉に決まります。', '2~4명이 나란히 서서 조수 잠금 금고에 맞섭니다. 모두 동시에 계획하고, 모든 플레이가 한꺼번에 적용됩니다.']),
 ('ui.ar3-run-cleared', 'The Hollow Warren is cleared!', 'The Tidelock Vault is cleared!', ['Le Coffre des Marées est vaincu !', 'Der Gezeitentresor ist bezwungen!', '¡La Cámara de la Marea está despejada!', 'La Cripta delle Maree è conquistata!', 'O Cofre das Marés foi vencido!', 'Nalinis na ang Bangan ng Taog!', 'அலைப்பூட்டுக் களஞ்சியம் வெல்லப்பட்டது!', 'Ruang Kunci Pasang berhasil ditaklukkan!', '潮锁宝库已攻克！', '潮鎖寶庫已攻克！', 'タイドロック金庫を制覇した！', '조수 잠금 금고를 클리어했다!']),
]
def dump(path, d):
    with open(path, 'w', encoding='utf-8') as fh:
        json.dump(d, fh, ensure_ascii=False, indent=1); fh.write('\n')
tp = os.path.join(ROOT, 'bramblewood-texts.js'); src = open(tp, encoding='utf-8').read()
for k, old, new, _ in K:
    a, b = '"' + k + '": ' + json.dumps(old, ensure_ascii=False), '"' + k + '": ' + json.dumps(new, ensure_ascii=False)
    if b in src: continue
    assert src.count(a) == 1, k
    src = src.replace(a, b)
open(tp, 'w', encoding='utf-8').write(src)
used = lambda en: ('"' + json.dumps(en, ensure_ascii=False)[1:]) in src
for i, code in enumerate(CODES):
    path = os.path.join(ROOT, 'lang', code + '.json'); pack = json.load(open(path, encoding='utf-8'))
    for k, old, new, row in K:
        if not used(old): pack.pop(old, None)
        if row[i] is None:  # the Tidelock Vault row already exists from RES4
            assert new in pack, (code, new); continue
        pack[new] = row[i]
    dump(path, pack)
print('ok')
