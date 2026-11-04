#!/usr/bin/env python3
"""Game texts added on 2026-11-03/04 by package UI19 (Card editor: Swarm N, Art height; Map cards window: skills and the NEW! flag).
10 new TX keys (ui.ui19-*), one row per English text in lang/<code>.json (existing rows are kept; new rows are appended, nothing is sorted).
Tagalog and Tamil deserve a native read.
    python3 tools/i18n_2026_11_03_ui19.py   (idempotent)"""
import json, os, re
ROOT = os.path.join(os.path.dirname(os.path.abspath(__file__)), '..')
CODES = ['fr', 'de', 'es', 'it', 'pt', 'tl', 'ta', 'id', 'zh-Hans', 'zh-Hant', 'ja', 'ko']
T = [  # English, then the 12 translations in CODES order
 ('Swarm N', ['Essaim N', 'Schwarm N', 'Enjambre N', 'Sciame N', 'Enxame N', 'Swarm N', 'திரள் N', 'Swarm N', '集群 N', '集群 N', 'スウォーム N', '떼 N']),
 ('Attack gained for each ally that counts (1 if left alone).', ['Attaque gagnée pour chaque allié concerné (1 par défaut).', 'Angriff für jeden zählenden Verbündeten (1, wenn nichts steht).', 'Ataque ganado por cada aliado que cuenta (1 si se deja así).', 'Attacco guadagnato per ogni alleato che conta (1 se lasciato così).', 'Ataque ganho por cada aliado que conta (1 se deixado assim).', 'Attack na nakukuha sa bawat kakampi na bibilangin (1 kung hindi binago).', 'கணக்கில் வரும் ஒவ்வொரு கூட்டாளிக்கும் கிடைக்கும் தாக்குதல் (மாற்றாவிட்டால் 1).', 'Serangan yang didapat untuk tiap sekutu yang dihitung (1 jika dibiarkan).', '每个符合条件的盟友增加的攻击（不填为 1）。', '每個符合條件的盟友增加的攻擊（不填為 1）。', '対象となる味方1体ごとに得る攻撃力（未入力なら1）。', '해당되는 아군 하나당 얻는 공격력 (비워 두면 1).']),
 ('per ally', ['par allié', 'pro Verbündetem', 'por aliado', 'per alleato', 'por aliado', 'bawat kakampi', 'ஒவ்வொரு கூட்டாளிக்கும்', 'per sekutu', '每个盟友', '每個盟友', '味方1体ごと', '아군당']),
 ('Art height', ['Hauteur de l’illustration', 'Bildhöhe', 'Altura del arte', 'Altezza dell’illustrazione', 'Altura da arte', 'Taas ng art', 'கலையின் உயரம்', 'Tinggi gambar', '插图高度', '插圖高度', 'イラストの高さ', '일러스트 높이']),
 ('Moves the picture behind the name scroll: 0 shows the top of it, 100 the bottom, 50 is centred.', ['Déplace l’image derrière le parchemin du nom : 0 montre le haut, 100 le bas, 50 est centré.', 'Verschiebt das Bild hinter der Namensrolle: 0 zeigt die Oberkante, 100 die Unterkante, 50 ist mittig.', 'Mueve la imagen detrás del pergamino del nombre: 0 muestra la parte superior, 100 la inferior, 50 está centrada.', 'Sposta l’immagine dietro la pergamena del nome: 0 mostra la parte alta, 100 quella bassa, 50 è centrata.', 'Move a imagem atrás do pergaminho do nome: 0 mostra o topo, 100 a base, 50 é centralizado.', 'Inililipat ang larawan sa likod ng balumbon ng pangalan: 0 ang itaas, 100 ang ibaba, 50 ang gitna.', 'பெயர் சுருளுக்குப் பின்னால் படத்தை நகர்த்தும்: 0 மேற்பகுதி, 100 கீழ்ப்பகுதி, 50 நடுவில்.', 'Menggeser gambar di belakang gulungan nama: 0 menampilkan bagian atas, 100 bagian bawah, 50 di tengah.', '移动名称卷轴后面的图片：0 显示顶部，100 显示底部，50 为居中。', '移動名稱卷軸後面的圖片：0 顯示頂部，100 顯示底部，50 為置中。', '名前の巻物の後ろの絵を動かします。0 は上、100 は下、50 は中央。', '이름 두루마리 뒤의 그림을 옮깁니다. 0은 위쪽, 100은 아래쪽, 50은 가운데입니다.']),
 ('Skills on these cards', ['Compétences de ces cartes', 'Fähigkeiten dieser Karten', 'Habilidades de estas cartas', 'Abilità di queste carte', 'Habilidades destas cartas', 'Mga kasanayan sa mga kard na ito', 'இந்த அட்டைகளில் உள்ள திறன்கள்', 'Skill pada kartu-kartu ini', '这些卡牌上的技能', '這些卡牌上的技能', 'これらのカードのスキル', '이 카드들의 스킬']),
 ('NEW!', ['NOUVEAU !', 'NEU!', '¡NUEVO!', 'NUOVO!', 'NOVO!', 'BAGO!', 'புதியது!', 'BARU!', '新！', '新！', 'NEW!', '신규!']),
 ('First time this skill shows up on the road: no earlier map’s cards carry it.', ['Première apparition de cette compétence sur la route : aucune carte d’une carte précédente ne l’a.', 'Zum ersten Mal auf dem Weg: keine Karte einer früheren Karte trägt diese Fähigkeit.', 'Primera vez que aparece esta habilidad en el camino: ninguna carta de un mapa anterior la tiene.', 'Prima volta che questa abilità compare lungo la strada: nessuna carta di una mappa precedente la ha.', 'Primeira vez que esta habilidade aparece na estrada: nenhuma carta de um mapa anterior a tem.', 'Unang beses na lumitaw ang kasanayang ito sa daan: walang kard ng naunang mapa ang mayroon nito.', 'இந்தத் திறன் பாதையில் முதல் முறையாகத் தோன்றுகிறது: முந்தைய வரைபட அட்டைகளில் இல்லை.', 'Pertama kali skill ini muncul di jalan: tidak ada kartu peta sebelumnya yang memilikinya.', '这个技能第一次出现在道路上：之前地图的卡牌都没有它。', '這個技能第一次出現在道路上：之前地圖的卡牌都沒有它。', 'このスキルが道中で初めて登場します。これより前のマップのカードにはありません。', '이 스킬이 길 위에서 처음 나옵니다. 이전 맵의 카드에는 없습니다.']),
 ('{n} of {total} cards', ['{n} carte(s) sur {total}', '{n} von {total} Karten', '{n} de {total} cartas', '{n} carte su {total}', '{n} de {total} cartas', '{n} sa {total} na kard', '{total} அட்டைகளில் {n}', '{n} dari {total} kartu', '{total} 张卡中有 {n} 张', '{total} 張卡中有 {n} 張', '{total}枚中{n}枚', '{total}장 중 {n}장']),
 ('No skills on these cards.', ['Aucune compétence sur ces cartes.', 'Keine Fähigkeiten auf diesen Karten.', 'Ninguna habilidad en estas cartas.', 'Nessuna abilità su queste carte.', 'Nenhuma habilidade nestas cartas.', 'Walang kasanayan sa mga kard na ito.', 'இந்த அட்டைகளில் திறன்கள் இல்லை.', 'Tidak ada skill pada kartu-kartu ini.', '这些卡牌没有技能。', '這些卡牌沒有技能。', 'これらのカードにスキルはありません。', '이 카드들에는 스킬이 없습니다.']),
]
ph = lambda s: sorted(set(re.findall(r'\{\w+\}', s)))
def dump(path, d):
    with open(path, 'w', encoding='utf-8') as fh:
        json.dump(d, fh, ensure_ascii=False, indent=1); fh.write('\n')
added = 0
for i, code in enumerate(CODES):
    path = os.path.join(ROOT, 'lang', code + '.json'); pack = json.load(open(path, encoding='utf-8'))
    for en, row in T:
        assert len(row) == 12 and ph(en) == ph(row[i]), (code, en)
        if en not in pack: added += 1
        pack.setdefault(en, row[i])
    dump(path, pack)
print('ok: %d rows added across %d packs' % (added, len(CODES)))
