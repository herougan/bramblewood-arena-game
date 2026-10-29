#!/usr/bin/env python3
"""Game texts added on 2026-10-29 by package UI3 (Map cards "Export all"; the group dungeon's CPU allies play a random deck). 7 new TX keys (ui.ui3-*),
one row per English text in lang/<code>.json (rows that already exist are kept as they are). Tagalog, Tamil, Japanese and Korean deserve a native read.
    python3 tools/i18n_2026_10_29_ui3.py"""
import json, os, re
ROOT = os.path.join(os.path.dirname(os.path.abspath(__file__)), '..')
CODES = ['fr', 'de', 'es', 'it', 'pt', 'tl', 'ta', 'id', 'zh-Hans', 'zh-Hant', 'ja', 'ko']
T = [  # English, then the 12 translations in CODES order
 ('Export all', ['Tout exporter', 'Alles exportieren', 'Exportar todo', 'Esporta tutto', 'Exportar tudo', 'I-export lahat', 'அனைத்தையும் ஏற்றுமதி செய்', 'Ekspor semua', '全部导出', '全部匯出', 'すべてエクスポート', '모두 내보내기']),
 ('Copies every list of every map (chosen, maybe and cut cards) with your current Cut/Keep choices, in map order, as text for Claude. Offers a .txt and a .json download too.', [
  "Copie toutes les listes de toutes les cartes (retenues, peut-être et écartées) avec vos choix Couper/Garder actuels, dans l'ordre des cartes, sous forme de texte pour Claude. Propose aussi un téléchargement .txt et .json.",
  'Kopiert jede Liste jeder Karte (gewählte, vielleicht und gestrichene Karten) mit deinen aktuellen Streichen/Behalten-Entscheidungen, in Kartenreihenfolge, als Text für Claude. Bietet auch einen .txt- und einen .json-Download an.',
  'Copia todas las listas de todos los mapas (cartas elegidas, quizá y descartadas) con tus decisiones actuales de Cortar/Mantener, en el orden de los mapas, como texto para Claude. También ofrece una descarga .txt y .json.',
  "Copia ogni elenco di ogni mappa (carte scelte, forse e scartate) con le tue scelte attuali Taglia/Tieni, nell'ordine delle mappe, come testo per Claude. Offre anche un download .txt e .json.",
  'Copia todas as listas de todos os mapas (cartas escolhidas, talvez e cortadas) com as suas escolhas atuais de Cortar/Manter, pela ordem dos mapas, como texto para o Claude. Também oferece uma transferência .txt e .json.',
  'Kinokopya ang bawat listahan ng bawat mapa (mga napili, baka at tinanggal na baraha) kasama ang kasalukuyan mong pili na Tanggalin/Itago, ayon sa ayos ng mapa, bilang teksto para kay Claude. May .txt at .json na download din.',
  'ஒவ்வொரு வரைபடத்தின் ஒவ்வொரு பட்டியலையும் (தேர்ந்தெடுத்த, ஒருவேளை, நீக்கிய அட்டைகள்) உங்கள் தற்போதைய வெட்டு/வைத்திரு தேர்வுகளுடன், வரைபட வரிசையில், Claude-க்கான உரையாக நகலெடுக்கிறது. .txt மற்றும் .json பதிவிறக்கமும் தருகிறது.',
  'Menyalin setiap daftar dari setiap peta (kartu terpilih, mungkin, dan dibuang) beserta pilihan Buang/Simpan Anda saat ini, sesuai urutan peta, sebagai teks untuk Claude. Juga menawarkan unduhan .txt dan .json.',
  '按地图顺序复制每张地图的每个列表（入选、待定和删除的卡牌）以及你当前的删除/保留选择，作为给 Claude 的文本。同时提供 .txt 和 .json 下载。',
  '按地圖順序複製每張地圖的每個列表（入選、待定和刪除的卡牌）以及你目前的刪除/保留選擇，作為給 Claude 的文字。同時提供 .txt 和 .json 下載。',
  '各マップのすべてのリスト（採用・保留・カット済みのカード）と現在のカット／キープの選択を、マップ順にClaude向けのテキストとしてコピーします。.txt と .json のダウンロードも用意します。',
  '모든 맵의 모든 목록(선택, 보류, 제외한 카드)과 현재의 제외/유지 선택을 맵 순서대로 Claude에게 줄 텍스트로 복사해요. .txt와 .json 다운로드도 제공해요.']),
 ('Copied everything: paste it to Claude, or download it', ['Tout est copié : collez-le à Claude, ou téléchargez-le', 'Alles kopiert: füge es bei Claude ein oder lade es herunter', 'Todo copiado: pégalo a Claude o descárgalo', 'Tutto copiato: incollalo a Claude o scaricalo', 'Tudo copiado: cole para o Claude ou transfira', 'Nakopya na lahat: i-paste kay Claude o i-download', 'எல்லாம் நகலெடுக்கப்பட்டது: Claude-இல் ஒட்டவும் அல்லது பதிவிறக்கவும்', 'Semua tersalin: tempelkan ke Claude atau unduh', '已全部复制：粘贴给 Claude，或下载', '已全部複製：貼給 Claude，或下載', 'すべてコピーしました。Claudeに貼り付けるか、ダウンロードしてください', '모두 복사했어요: Claude에게 붙여넣거나 다운로드하세요']),
 ('Ready: download it', ['Prêt : téléchargez-le', 'Bereit: lade es herunter', 'Listo: descárgalo', 'Pronto: scaricalo', 'Pronto: transfira', 'Handa na: i-download', 'தயார்: பதிவிறக்கவும்', 'Siap: unduh', '已准备好：请下载', '已準備好：請下載', '準備できました。ダウンロードしてください', '준비됐어요: 다운로드하세요']),
 ('A CPU ally with a random deck joins at Start', ["Un allié CPU avec un deck aléatoire rejoint au départ", 'Ein CPU-Verbündeter mit zufälligem Deck stößt beim Start dazu', 'Un aliado de la CPU con un mazo aleatorio se une al empezar', "Un alleato CPU con un mazzo casuale si unisce all'inizio", 'Um aliado da CPU com um baralho aleatório junta-se ao início', 'May sasamang CPU ally na random ang deck pagsisimula', 'தொடக்கத்தில் சீரற்ற டெக் கொண்ட CPU கூட்டாளி சேர்கிறார்', 'Sekutu CPU dengan dek acak bergabung saat Mulai', '开始时会有一名使用随机卡组的 CPU 盟友加入', '開始時會有一名使用隨機牌組的 CPU 盟友加入', 'スタート時にランダムなデッキを持つCPU味方が加わります', '시작하면 무작위 덱을 쓰는 CPU 아군이 합류해요']),
 ('Back to the Arena', ['Retour à l\'Arène', 'Zurück zur Arena', 'Volver a la Arena', 'Torna all\'Arena', 'Voltar à Arena', 'Bumalik sa Arena', 'அரங்கத்திற்குத் திரும்பு', 'Kembali ke Arena', '返回竞技场', '返回競技場', 'アリーナに戻る', '아레나로 돌아가기']),
 ('Plays a random deck', ['Joue un deck aléatoire', 'Spielt ein zufälliges Deck', 'Juega un mazo aleatorio', 'Gioca un mazzo casuale', 'Joga um baralho aleatório', 'Random na deck ang gamit', 'சீரற்ற டெக்கை விளையாடுகிறது', 'Memakai dek acak', '使用随机卡组', '使用隨機牌組', 'ランダムなデッキを使います', '무작위 덱을 써요']),
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
