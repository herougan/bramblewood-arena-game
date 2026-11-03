#!/usr/bin/env python3
"""Game texts added on 2026-11-03 by package LISTFIX2 (the Map cards review: a Cut card's status pill "Still listed" / "Kept for its fight" /
"Removed" with tooltips, and the line under Copy my picks saying the marks stay in the browser). 8 new TX keys (ui.lf2-*), one row per English
text in lang/<code>.json (rows that already exist are kept as they are; new rows are appended, nothing is sorted). Admin-only screen;
Tagalog, Tamil, Japanese and Korean deserve a native read.
    python3 tools/i18n_2026_11_03_listfix2.py   (idempotent)"""
import json, os, re
ROOT = os.path.join(os.path.dirname(os.path.abspath(__file__)), '..')
CODES = ['fr', 'de', 'es', 'it', 'pt', 'tl', 'ta', 'id', 'zh-Hans', 'zh-Hant', 'ja', 'ko']
T = [  # English, then the 12 translations in CODES order
 ('Still listed', ['Toujours listée', 'Noch gelistet', 'Aún en la lista', 'Ancora in lista', 'Ainda na lista', 'Nakalista pa', 'இன்னும் பட்டியலில்', 'Masih terdaftar', '仍在列表中', '仍在列表中', 'まだリストにある', '아직 목록에 있음']),
 ('This cut is not in the game yet: the card is still on this list.',
  ['Cette coupe n’est pas encore dans le jeu : la carte est toujours sur cette liste.',
   'Diese Streichung ist noch nicht im Spiel: Die Karte steht noch auf dieser Liste.',
   'Este recorte aún no está en el juego: la carta sigue en esta lista.',
   'Questo taglio non è ancora nel gioco: la carta è ancora in questa lista.',
   'Este corte ainda não está no jogo: a carta continua nesta lista.',
   'Wala pa sa laro ang tanggal na ito: nasa listahang ito pa ang baraha.',
   'இந்த நீக்கம் இன்னும் விளையாட்டில் இல்லை: அட்டை இன்னும் இந்தப் பட்டியலில் உள்ளது.',
   'Potongan ini belum masuk ke permainan: kartunya masih ada di daftar ini.',
   '这次删减还未进入游戏：这张卡仍在此列表中。',
   '這次刪減還未進入遊戲：這張卡仍在此列表中。',
   'このカットはまだゲームに入っていません：カードはまだこのリストにあります。',
   '이 제외는 아직 게임에 반영되지 않았습니다: 카드가 아직 이 목록에 있습니다.']),
 ('Kept for its fight', ['Gardée pour son combat', 'Für ihren Kampf behalten', 'Conservada por su combate', 'Tenuta per il suo scontro', 'Mantida pelo seu combate', 'Itinago para sa laban nito', 'அதன் போருக்காக வைக்கப்பட்டது', 'Disimpan untuk pertarungannya', '为其战斗保留', '為其戰鬥保留', '戦闘のために残す', '전투용으로 유지']),
 ("Off this list, but on the map's SPECIAL list: a fight still leads with it or gives it as a reward, so it can still appear here.",
  ['Retirée de cette liste, mais sur la liste SPECIAL de la carte : un combat la prend encore comme chef ou la donne en récompense, elle peut donc encore apparaître ici.',
   'Nicht mehr auf dieser Liste, aber auf der SPECIAL-Liste der Karte: Ein Kampf führt noch mit ihr an oder gibt sie als Belohnung, sie kann hier also noch auftauchen.',
   'Fuera de esta lista, pero en la lista SPECIAL del mapa: un combate aún la usa de líder o la da como recompensa, así que aún puede aparecer aquí.',
   'Fuori da questa lista, ma nella lista SPECIAL della mappa: uno scontro la usa ancora come capo o la dà come ricompensa, quindi può ancora comparire qui.',
   'Fora desta lista, mas na lista SPECIAL do mapa: um combate ainda a usa como líder ou a dá como recompensa, por isso ainda pode aparecer aqui.',
   'Wala na sa listahang ito, pero nasa SPECIAL na listahan ng mapa: may laban pang gumagamit dito bilang pinuno o ibinibigay ito bilang gantimpala, kaya puwede pa itong lumabas dito.',
   'இந்தப் பட்டியலில் இல்லை, ஆனால் வரைபடத்தின் SPECIAL பட்டியலில் உள்ளது: ஒரு போர் இன்னும் அதைத் தலைவராகக் கொள்கிறது அல்லது பரிசாகத் தருகிறது, எனவே இங்கே இன்னும் தோன்றலாம்.',
   'Tidak di daftar ini, tetapi di daftar SPECIAL peta: sebuah pertarungan masih memakainya sebagai pemimpin atau memberinya sebagai hadiah, jadi kartu ini masih bisa muncul di sini.',
   '已不在此列表，但在地图的 SPECIAL 列表中：仍有战斗以它为首领或把它作为奖励，所以它仍可能在这里出现。',
   '已不在此列表，但在地圖的 SPECIAL 列表中：仍有戰鬥以它為首領或把它作為獎勵，所以它仍可能在這裡出現。',
   'このリストからは外れましたが、マップの SPECIAL リストにあります：まだリーダーにする戦闘や報酬として出す戦闘があるため、ここに出ることがあります。',
   '이 목록에서는 빠졌지만 맵의 SPECIAL 목록에 있습니다: 아직 이 카드를 리더로 쓰거나 보상으로 주는 전투가 있어 여기에 나올 수 있습니다.']),
 ('Removed', ['Retirée', 'Entfernt', 'Quitada', 'Rimossa', 'Removida', 'Tinanggal', 'நீக்கப்பட்டது', 'Dihapus', '已移除', '已移除', '削除済み', '제거됨']),
 ('Off this list: the cut is in the game.',
  ['Retirée de cette liste : la coupe est dans le jeu.', 'Nicht mehr auf dieser Liste: Die Streichung ist im Spiel.', 'Fuera de esta lista: el recorte está en el juego.',
   'Fuori da questa lista: il taglio è nel gioco.', 'Fora desta lista: o corte está no jogo.', 'Wala na sa listahang ito: nasa laro na ang tanggal.',
   'இந்தப் பட்டியலில் இல்லை: நீக்கம் விளையாட்டில் உள்ளது.', 'Tidak di daftar ini: potongannya sudah di permainan.', '已不在此列表：删减已进入游戏。',
   '已不在此列表：刪減已進入遊戲。', 'このリストから外れました：カットはゲームに反映済みです。', '이 목록에서 빠졌습니다: 제외가 게임에 반영되었습니다.']),
 ('Off this list: the cut is in the game. Still on: {lists}.',
  ['Retirée de cette liste : la coupe est dans le jeu. Toujours sur : {lists}.', 'Nicht mehr auf dieser Liste: Die Streichung ist im Spiel. Noch auf: {lists}.',
   'Fuera de esta lista: el recorte está en el juego. Sigue en: {lists}.', 'Fuori da questa lista: il taglio è nel gioco. Ancora su: {lists}.',
   'Fora desta lista: o corte está no jogo. Ainda em: {lists}.', 'Wala na sa listahang ito: nasa laro na ang tanggal. Nasa pa rin: {lists}.',
   'இந்தப் பட்டியலில் இல்லை: நீக்கம் விளையாட்டில் உள்ளது. இன்னும் உள்ளது: {lists}.', 'Tidak di daftar ini: potongannya sudah di permainan. Masih di: {lists}.',
   '已不在此列表：删减已进入游戏。仍在：{lists}。', '已不在此列表：刪減已進入遊戲。仍在：{lists}。',
   'このリストから外れました：カットはゲームに反映済みです。まだ載っている所：{lists}。', '이 목록에서 빠졌습니다: 제외가 게임에 반영되었습니다. 아직 있는 곳: {lists}.']),
 ('✂ Cut and ↩ Keep only mark your picks in this browser; no list changes until Claude folds them in. Use Copy my picks or Export all, then paste the text to Claude.',
  ['✂ Écarter et ↩ Garder ne font que marquer tes choix dans ce navigateur ; aucune liste ne change avant que Claude les intègre. Utilise Copier mes choix ou Tout exporter, puis colle le texte à Claude.',
   '✂ Streichen und ↩ Behalten markieren deine Wahl nur in diesem Browser; keine Liste ändert sich, bis Claude sie einarbeitet. Nutze „Meine Wahl kopieren“ oder „Alles exportieren“ und füge den Text bei Claude ein.',
   '✂ Recortar y ↩ Conservar solo marcan tus elecciones en este navegador; ninguna lista cambia hasta que Claude las incorpore. Usa Copiar mis elecciones o Exportar todo y pega el texto a Claude.',
   '✂ Taglia e ↩ Tieni segnano solo le tue scelte in questo browser; nessuna lista cambia finché Claude non le integra. Usa Copia le mie scelte o Esporta tutto, poi incolla il testo a Claude.',
   '✂ Cortar e ↩ Manter só marcam as tuas escolhas neste navegador; nenhuma lista muda até o Claude as integrar. Usa Copiar minhas escolhas ou Exportar tudo e cola o texto ao Claude.',
   'Minamarkahan lang ng ✂ Tanggalin at ↩ Panatilihin ang mga pinili mo sa browser na ito; walang listahang magbabago hangga’t hindi ito isinasama ni Claude. Gamitin ang Kopyahin ang mga napili ko o I-export lahat, saka i-paste kay Claude.',
   '✂ நீக்கு, ↩ வை ஆகியவை இந்த உலாவியில் உங்கள் தேர்வுகளைக் குறிக்க மட்டுமே; Claude சேர்க்கும் வரை எந்தப் பட்டியலும் மாறாது. என் தேர்வுகளை நகலெடு அல்லது அனைத்தையும் ஏற்றுமதி செய், பின் உரையை Claude-இடம் ஒட்டவும்.',
   '✂ Coret dan ↩ Simpan hanya menandai pilihanmu di peramban ini; tidak ada daftar yang berubah sampai Claude memasukkannya. Pakai Salin pilihan saya atau Ekspor semua, lalu tempel teksnya ke Claude.',
   '✂ 剔除 和 ↩ 保留 只在此浏览器中标记你的选择；在 Claude 合并之前，列表不会改变。请用“复制我的选择”或“全部导出”，再把文字粘贴给 Claude。',
   '✂ 剔除 和 ↩ 保留 只在此瀏覽器中標記你的選擇；在 Claude 合併之前，列表不會改變。請用「複製我的選擇」或「全部匯出」，再把文字貼給 Claude。',
   '✂ カット と ↩ 残す はこのブラウザで選択に印を付けるだけです。Claude が取り込むまでリストは変わりません。「選択をコピー」か「すべてエクスポート」を使い、テキストを Claude に貼り付けてください。',
   '✂ 제외와 ↩ 유지는 이 브라우저에서 선택을 표시할 뿐입니다. Claude가 반영하기 전까지 목록은 바뀌지 않습니다. 내 선택 복사 또는 모두 내보내기를 누른 뒤 텍스트를 Claude에게 붙여 넣으세요.']),
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
