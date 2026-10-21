#!/usr/bin/env python3
"""Game texts added on 2026-10-22 by package MP (owner 00:51 / 00:57): the Map cards editor (admin) and the skirmish deck pickers that
read a map's card pool. The rules for a template row are those of i18n_2026_10_18d.py (every {placeholder} kept). Keys are the English,
as the page translator sees them. A row a pack already has (in lang/<code>.json or lang/ui/<code>.json: "Cards", "Medium", "Details",
"Wait" ...) is left as the pack has it. Same caveats as i18n_core.py (Tagalog, Tamil, Japanese and Korean deserve a native read).

    python3 tools/i18n_2026_10_22_mp.py && python3 tools/i18n_refresh.py
"""
import json, os, re
ROOT = os.path.join(os.path.dirname(os.path.abspath(__file__)), '..')
CODES = ['fr', 'de', 'es', 'it', 'pt', 'tl', 'ta', 'id', 'zh-Hans', 'zh-Hant', 'ja', 'ko']
T = {
"Map cards": ["Cartes de la carte", "Kartenpool", "Cartas del mapa", "Carte della mappa", "Cartas do mapa", "Mga card ng mapa", "வரைபட அட்டைகள்", "Kartu peta", "地图卡牌", "地圖卡牌", "マップのカード", "맵 카드"],
"Choose which cards belong to this map and its submaps": [
  "Choisir les cartes de cette carte et de ses sous-cartes", "Wähle, welche Karten zu dieser Karte und ihren Unterkarten gehören", "Elige qué cartas pertenecen a este mapa y a sus submapas",
  "Scegli quali carte appartengono a questa mappa e alle sue sottomappe", "Escolhe que cartas pertencem a este mapa e aos seus submapas", "Piliin kung aling mga card ang kabilang sa mapang ito at sa mga submapa nito",
  "இந்த வரைபடத்திற்கும் அதன் துணை வரைபடங்களுக்கும் உரிய அட்டைகளைத் தேர்ந்தெடுங்கள்", "Pilih kartu mana yang termasuk peta ini dan sub-petanya",
  "选择属于这张地图及其子地图的卡牌", "選擇屬於這張地圖及其子地圖的卡牌", "このマップとサブマップに属するカードを選びます", "이 맵과 하위 맵에 속할 카드를 고르세요"],
"Choose the cards each map (and each submap) draws its skirmish decks from, with Special for one-off cards. Saved live for every player.": [
  "Choisissez les cartes dans lesquelles chaque carte (et sous-carte) puise les decks de ses escarmouches, avec Spécial pour les cartes d’exception. Enregistré en direct pour tous les joueurs.",
  "Wähle die Karten, aus denen jede Karte (und Unterkarte) die Decks ihrer Scharmützel zieht, mit „Besonders“ für einmalige Karten. Wird live für alle Spieler gespeichert.",
  "Elige las cartas de las que cada mapa (y submapa) saca los mazos de sus escaramuzas, con Especial para cartas únicas. Se guarda en directo para todos los jugadores.",
  "Scegli le carte da cui ogni mappa (e sottomappa) prende i mazzi delle sue schermaglie, con Speciale per le carte eccezionali. Salvato in diretta per tutti i giocatori.",
  "Escolhe as cartas de onde cada mapa (e submapa) tira os baralhos das suas escaramuças, com Especial para cartas pontuais. Guardado em direto para todos os jogadores.",
  "Piliin ang mga card na pagkukunan ng bawat mapa (at submapa) para sa mga deck ng kanilang skirmish, at Special para sa mga natatanging card. Live na nase-save para sa lahat ng manlalaro.",
  "ஒவ்வொரு வரைபடமும் (துணை வரைபடமும்) தன் சண்டை அடுக்குகளுக்கு எடுக்கும் அட்டைகளைத் தேர்ந்தெடுங்கள்; தனித்த அட்டைகளுக்கு சிறப்பு. அனைத்து வீரர்களுக்கும் உடனே சேமிக்கப்படும்.",
  "Pilih kartu yang menjadi sumber dek skirmish setiap peta (dan sub-peta), dengan Spesial untuk kartu sekali pakai. Disimpan langsung untuk semua pemain.",
  "选择每张地图（及子地图）的遭遇战卡组所用的卡牌，特殊栏放一次性的卡牌。对所有玩家实时保存。", "選擇每張地圖（及子地圖）的遭遇戰卡組所用的卡牌，特殊欄放一次性的卡牌。對所有玩家即時儲存。",
  "各マップ（とサブマップ）の戦闘デッキに使うカードを選びます。単発のカードは「スペシャル」へ。全プレイヤーにすぐ反映されます。", "각 맵(과 하위 맵)의 전투 덱에 쓸 카드를 고르세요. 일회성 카드는 스페셜에 넣어요. 모든 플레이어에게 바로 저장돼요."],
"Open Map cards": ["Ouvrir les cartes de la carte", "Kartenpool öffnen", "Abrir las cartas del mapa", "Apri le carte della mappa", "Abrir as cartas do mapa", "Buksan ang mga card ng mapa", "வரைபட அட்டைகளைத் திற", "Buka kartu peta", "打开地图卡牌", "打開地圖卡牌", "マップのカードを開く", "맵 카드 열기"],
"Card size": ["Taille des cartes", "Kartengröße", "Tamaño de las cartas", "Dimensione delle carte", "Tamanho das cartas", "Laki ng card", "அட்டை அளவு", "Ukuran kartu", "卡牌大小", "卡牌大小", "カードの大きさ", "카드 크기"],
"Large": ["Grande", "Groß", "Grande", "Grande", "Grande", "Malaki", "பெரியது", "Besar", "大", "大", "大", "크게"],
"Add cards": ["Ajouter des cartes", "Karten hinzufügen", "Añadir cartas", "Aggiungi carte", "Adicionar cartas", "Magdagdag ng card", "அட்டைகளைச் சேர்", "Tambah kartu", "添加卡牌", "新增卡牌", "カードを追加", "카드 추가"],
"Add to": ["Ajouter à", "Hinzufügen zu", "Añadir a", "Aggiungi a", "Adicionar a", "Idagdag sa", "இதில் சேர்", "Tambah ke", "添加到", "新增到", "追加先", "추가할 곳"],
"Submap: Cards": ["Sous-carte : cartes", "Unterkarte: Karten", "Submapa: cartas", "Sottomappa: carte", "Submapa: cartas", "Submapa: mga card", "துணை வரைபடம்: அட்டைகள்", "Sub-peta: kartu", "子地图：卡牌", "子地圖：卡牌", "サブマップ：カード", "하위 맵: 카드"],
"Submap: Special": ["Sous-carte : spécial", "Unterkarte: Besonders", "Submapa: especial", "Sottomappa: speciale", "Submapa: especial", "Submapa: Special", "துணை வரைபடம்: சிறப்பு", "Sub-peta: spesial", "子地图：特殊", "子地圖：特殊", "サブマップ：スペシャル", "하위 맵: 스페셜"],
"{name}: Cards": ["{name} : cartes", "{name}: Karten", "{name}: cartas", "{name}: carte", "{name}: cartas", "{name}: mga card", "{name}: அட்டைகள்", "{name}: kartu", "{name}：卡牌", "{name}：卡牌", "{name}：カード", "{name}: 카드"],
"Cards added from a skirmish's deck editor, for a fight that is deliberately different.": [
  "Cartes ajoutées depuis l’éditeur de deck d’une escarmouche, pour un combat volontairement différent.", "Karten, die im Deck-Editor eines Scharmützels hinzugefügt wurden, für einen bewusst anderen Kampf.",
  "Cartas añadidas desde el editor de mazo de una escaramuza, para un combate deliberadamente distinto.", "Carte aggiunte dall’editor del mazzo di una schermaglia, per uno scontro volutamente diverso.",
  "Cartas adicionadas a partir do editor de baralho de uma escaramuça, para um combate propositadamente diferente.", "Mga card na idinagdag mula sa deck editor ng isang skirmish, para sa laban na sadyang kakaiba.",
  "ஒரு சண்டையின் அடுக்குத் திருத்தியிலிருந்து சேர்க்கப்பட்ட அட்டைகள்; வேண்டுமென்றே வேறுபட்ட சண்டைக்காக.", "Kartu yang ditambahkan dari editor dek sebuah skirmish, untuk pertarungan yang sengaja berbeda.",
  "从遭遇战的卡组编辑器添加的卡牌，用于刻意与众不同的战斗。", "從遭遇戰的卡組編輯器新增的卡牌，用於刻意與眾不同的戰鬥。",
  "戦闘のデッキ編集から追加されたカード。わざと毛色を変えた戦闘のためのものです。", "전투의 덱 편집기에서 추가한 카드예요. 일부러 다르게 만든 전투를 위한 거예요."],
"Read only here. Edit it on the parent map.": [
  "Lecture seule ici. Modifiez-le sur la carte parente.", "Hier nur lesbar. Bearbeite es auf der übergeordneten Karte.", "Solo lectura aquí. Edítalo en el mapa principal.", "Sola lettura qui. Modificala nella mappa principale.",
  "Só de leitura aqui. Edita no mapa principal.", "Basa lang dito. I-edit ito sa pangunahing mapa.", "இங்கே படிக்க மட்டும். தாய் வரைபடத்தில் திருத்துங்கள்.", "Hanya baca di sini. Ubah di peta induk.",
  "此处只读。请在上级地图中编辑。", "此處唯讀。請在上級地圖中編輯。", "ここでは閲覧のみ。親マップで編集してください。", "여기서는 읽기 전용이에요. 상위 맵에서 편집하세요."],
"No cards here yet.": ["Aucune carte ici pour l’instant.", "Hier sind noch keine Karten.", "Aún no hay cartas aquí.", "Ancora nessuna carta qui.", "Ainda não há cartas aqui.", "Wala pang card dito.", "இங்கே இன்னும் அட்டைகள் இல்லை.", "Belum ada kartu di sini.", "这里还没有卡牌。", "這裡還沒有卡牌。", "ここにはまだカードがありません。", "아직 카드가 없어요."],
"No cards match.": ["Aucune carte ne correspond.", "Keine Karte passt.", "Ninguna carta coincide.", "Nessuna carta corrisponde.", "Nenhuma carta corresponde.", "Walang tugmang card.", "பொருந்தும் அட்டைகள் இல்லை.", "Tidak ada kartu yang cocok.", "没有符合的卡牌。", "沒有符合的卡牌。", "一致するカードがありません。", "맞는 카드가 없어요."],
"Move to Special": ["Déplacer vers Spécial", "Zu „Besonders“ verschieben", "Mover a Especial", "Sposta in Speciale", "Mover para Especial", "Ilipat sa Special", "சிறப்புக்கு நகர்த்து", "Pindahkan ke Spesial", "移到特殊", "移到特殊", "スペシャルへ移動", "스페셜로 이동"],
"Move to Cards": ["Déplacer vers Cartes", "Zu „Karten“ verschieben", "Mover a Cartas", "Sposta in Carte", "Mover para Cartas", "Ilipat sa Mga Card", "அட்டைகளுக்கு நகர்த்து", "Pindahkan ke Kartu", "移到卡牌", "移到卡牌", "カードへ移動", "카드로 이동"],
"Remove": ["Retirer", "Entfernen", "Quitar", "Rimuovi", "Remover", "Alisin", "நீக்கு", "Hapus", "移除", "移除", "削除", "제거"],
"{n} cards in this pool": ["{n} cartes dans cette réserve", "{n} Karten in diesem Pool", "{n} cartas en este grupo", "{n} carte in questo gruppo", "{n} cartas neste grupo", "{n} card sa pool na ito", "இந்தத் தொகுப்பில் {n} அட்டைகள்", "{n} kartu di kumpulan ini", "此卡池共 {n} 张卡牌", "此卡池共 {n} 張卡牌", "このプールに{n}枚", "이 풀에 카드 {n}장"],
"Lumber cost": ["Coût en bois", "Holzkosten", "Coste de madera", "Costo in legno", "Custo em madeira", "Gastos na kahoy", "மரச் செலவு", "Biaya kayu", "木材费用", "木材費用", "木材コスト", "목재 비용"],
"This map {a} · Its submaps {b} · Other maps {c}": [
  "Cette carte {a} · Ses sous-cartes {b} · Autres cartes {c}", "Diese Karte {a} · Ihre Unterkarten {b} · Andere Karten {c}", "Este mapa {a} · Sus submapas {b} · Otros mapas {c}", "Questa mappa {a} · Le sue sottomappe {b} · Altre mappe {c}",
  "Este mapa {a} · Os seus submapas {b} · Outros mapas {c}", "Mapang ito {a} · Mga submapa nito {b} · Ibang mapa {c}", "இந்த வரைபடம் {a} · அதன் துணை வரைபடங்கள் {b} · மற்ற வரைபடங்கள் {c}", "Peta ini {a} · Sub-petanya {b} · Peta lain {c}",
  "本地图 {a} · 其子地图 {b} · 其他地图 {c}", "本地圖 {a} · 其子地圖 {b} · 其他地圖 {c}", "このマップ {a} · サブマップ {b} · 他のマップ {c}", "이 맵 {a} · 하위 맵 {b} · 다른 맵 {c}"],
"Used elsewhere": ["Utilisée ailleurs", "Anderswo genutzt", "Usada en otros sitios", "Usata altrove", "Usada noutros sítios", "Gamit sa iba", "வேறிடத்தில் பயன்பாடு", "Dipakai di tempat lain", "其他地方的使用", "其他地方的使用", "他での使用", "다른 곳에서 사용"],
"Back to the file": ["Revenir au fichier", "Zurück zur Datei", "Volver al archivo", "Torna al file", "Voltar ao ficheiro", "Bumalik sa file", "கோப்புக்குத் திரும்பு", "Kembali ke berkas", "恢复为文件内容", "恢復為檔案內容", "ファイルの状態に戻す", "파일 상태로 되돌리기"],
"Tap again to reset": ["Touchez encore pour réinitialiser", "Nochmal tippen zum Zurücksetzen", "Toca otra vez para restablecer", "Tocca ancora per ripristinare", "Toca outra vez para repor", "I-tap ulit para i-reset", "மீட்டமைக்க மீண்டும் தொடவும்", "Ketuk lagi untuk mengatur ulang", "再点一次即可重置", "再點一次即可重設", "もう一度タップでリセット", "다시 누르면 초기화돼요"],
"Published live": ["Publié en direct", "Live veröffentlicht", "Publicado en directo", "Pubblicato in diretta", "Publicado em direto", "Live nang nailathala", "நேரடியாக வெளியிடப்பட்டது", "Dipublikasikan langsung", "已实时发布", "已即時發布", "ライブ公開済み", "실시간으로 게시됨"],
"Saved in this browser only": ["Enregistré dans ce navigateur seulement", "Nur in diesem Browser gespeichert", "Guardado solo en este navegador", "Salvato solo in questo browser", "Guardado só neste navegador", "Na-save sa browser na ito lang", "இந்த உலாவியில் மட்டும் சேமிக்கப்பட்டது", "Disimpan di peramban ini saja", "仅保存在此浏览器", "僅儲存在此瀏覽器", "このブラウザにのみ保存", "이 브라우저에만 저장됨"],
"Show more": ["Afficher plus", "Mehr anzeigen", "Mostrar más", "Mostra altro", "Mostrar mais", "Magpakita pa", "மேலும் காட்டு", "Tampilkan lebih banyak", "显示更多", "顯示更多", "もっと見る", "더 보기"],
"+ Load any card": ["+ Charger n’importe quelle carte", "+ Beliebige Karte laden", "+ Cargar cualquier carta", "+ Carica qualsiasi carta", "+ Carregar qualquer carta", "+ Mag-load ng kahit anong card", "+ எந்த அட்டையையும் ஏற்று", "+ Muat kartu apa pun", "+ 载入任意卡牌", "+ 載入任意卡牌", "+ 任意のカードを読み込む", "+ 아무 카드나 불러오기"],
"Back to this map's cards": ["Retour aux cartes de cette carte", "Zurück zu den Karten dieser Karte", "Volver a las cartas de este mapa", "Torna alle carte di questa mappa", "Voltar às cartas deste mapa", "Bumalik sa mga card ng mapang ito", "இந்த வரைபடத்தின் அட்டைகளுக்குத் திரும்பு", "Kembali ke kartu peta ini", "返回本地图的卡牌", "返回本地圖的卡牌", "このマップのカードに戻る", "이 맵의 카드로 돌아가기"],
"All cards. A card you pick goes into the deck and into {map}'s Special cards.": [
  "Toutes les cartes. Une carte choisie va dans le deck et dans les cartes spéciales de {map}.", "Alle Karten. Eine gewählte Karte kommt ins Deck und in die besonderen Karten von {map}.",
  "Todas las cartas. Una carta elegida va al mazo y a las cartas especiales de {map}.", "Tutte le carte. Una carta scelta va nel mazzo e tra le carte speciali di {map}.",
  "Todas as cartas. Uma carta escolhida vai para o baralho e para as cartas especiais de {map}.", "Lahat ng card. Ang piniling card ay mapupunta sa deck at sa mga Special card ng {map}.",
  "அனைத்து அட்டைகளும். நீங்கள் தேர்ந்தெடுக்கும் அட்டை அடுக்கிலும் {map} இன் சிறப்பு அட்டைகளிலும் சேரும்.", "Semua kartu. Kartu yang dipilih masuk ke dek dan ke kartu Spesial {map}.",
  "全部卡牌。选中的卡牌会加入卡组，并加入 {map} 的特殊卡牌。", "全部卡牌。選中的卡牌會加入卡組，並加入 {map} 的特殊卡牌。",
  "すべてのカード。選んだカードはデッキと {map} のスペシャルに入ります。", "모든 카드예요. 고른 카드는 덱과 {map}의 스페셜 카드에 들어가요."],
"{name} added to the deck and to {map}'s Special cards.": [
  "{name} ajoutée au deck et aux cartes spéciales de {map}.", "{name} zum Deck und zu den besonderen Karten von {map} hinzugefügt.", "{name} añadida al mazo y a las cartas especiales de {map}.", "{name} aggiunta al mazzo e alle carte speciali di {map}.",
  "{name} adicionada ao baralho e às cartas especiais de {map}.", "Naidagdag ang {name} sa deck at sa mga Special card ng {map}.", "{name} அடுக்கிலும் {map} இன் சிறப்பு அட்டைகளிலும் சேர்க்கப்பட்டது.", "{name} ditambahkan ke dek dan ke kartu Spesial {map}.",
  "{name} 已加入卡组和 {map} 的特殊卡牌。", "{name} 已加入卡組和 {map} 的特殊卡牌。", "{name} をデッキと {map} のスペシャルに追加しました。", "{name}을(를) 덱과 {map}의 스페셜 카드에 추가했어요."],
"Added to {map}'s Special cards.": ["Ajouté aux cartes spéciales de {map}.", "Zu den besonderen Karten von {map} hinzugefügt.", "Añadido a las cartas especiales de {map}.", "Aggiunto alle carte speciali di {map}.", "Adicionado às cartas especiais de {map}.", "Naidagdag sa mga Special card ng {map}.", "{map} இன் சிறப்பு அட்டைகளில் சேர்க்கப்பட்டது.", "Ditambahkan ke kartu Spesial {map}.", "已加入 {map} 的特殊卡牌。", "已加入 {map} 的特殊卡牌。", "{map} のスペシャルに追加しました。", "{map}의 스페셜 카드에 추가했어요."],
"Not in this map's pool": ["Pas dans la réserve de cette carte", "Nicht im Pool dieser Karte", "No está en el grupo de este mapa", "Non è nel gruppo di questa mappa", "Não está no grupo deste mapa", "Wala sa pool ng mapang ito", "இந்த வரைபடத்தின் தொகுப்பில் இல்லை", "Tidak ada di kumpulan peta ini", "不在本地图的卡池中", "不在本地圖的卡池中", "このマップのプールにありません", "이 맵의 풀에 없어요"],
"Add to Special": ["Ajouter à Spécial", "Zu „Besonders“", "Añadir a Especial", "Aggiungi a Speciale", "Adicionar a Especial", "Idagdag sa Special", "சிறப்பில் சேர்", "Tambah ke Spesial", "加入特殊", "加入特殊", "スペシャルに追加", "스페셜에 추가"],
"Add all to Special": ["Tout ajouter à Spécial", "Alle zu „Besonders“", "Añadir todas a Especial", "Aggiungi tutte a Speciale", "Adicionar todas a Especial", "Idagdag lahat sa Special", "அனைத்தையும் சிறப்பில் சேர்", "Tambah semua ke Spesial", "全部加入特殊", "全部加入特殊", "すべてスペシャルに追加", "모두 스페셜에 추가"],
"This map has no card pool yet. Add cards in Map cards, or load any card.": [
  "Cette carte n’a pas encore de réserve de cartes. Ajoutez-en dans Cartes de la carte, ou chargez n’importe quelle carte.", "Diese Karte hat noch keinen Kartenpool. Füge Karten im Kartenpool hinzu oder lade eine beliebige Karte.",
  "Este mapa aún no tiene un grupo de cartas. Añade cartas en Cartas del mapa o carga cualquier carta.", "Questa mappa non ha ancora un gruppo di carte. Aggiungile in Carte della mappa o carica qualsiasi carta.",
  "Este mapa ainda não tem um grupo de cartas. Adiciona cartas em Cartas do mapa ou carrega qualquer carta.", "Wala pang pool ng card ang mapang ito. Magdagdag sa Mga card ng mapa, o mag-load ng kahit anong card.",
  "இந்த வரைபடத்திற்கு இன்னும் அட்டைத் தொகுப்பு இல்லை. வரைபட அட்டைகளில் சேர்க்கவும், அல்லது எந்த அட்டையையும் ஏற்றவும்.", "Peta ini belum punya kumpulan kartu. Tambahkan di Kartu peta, atau muat kartu apa pun.",
  "这张地图还没有卡池。请在地图卡牌中添加，或载入任意卡牌。", "這張地圖還沒有卡池。請在地圖卡牌中新增，或載入任意卡牌。", "このマップにはまだカードプールがありません。マップのカードで追加するか、任意のカードを読み込んでください。", "이 맵에는 아직 카드 풀이 없어요. 맵 카드에서 추가하거나 아무 카드나 불러오세요."],
}
assert all(len(v) == len(CODES) for v in T.values()), [k for k, v in T.items() if len(v) != len(CODES)]
ph = lambda s: sorted(set(re.findall(r'\{\w+\}', s)))
assert all(ph(k) == ph(t) for k, v in T.items() for t in v), [(k, t) for k, v in T.items() for t in v if ph(k) != ph(t)]
if __name__ == '__main__':
    kept = 0
    for i, code in enumerate(CODES):
        path = os.path.join(ROOT, 'lang', code + '.json')
        ui = os.path.join(ROOT, 'lang', 'ui', code + '.json')
        pack = json.load(open(path, encoding='utf-8')) if os.path.exists(path) else {}
        uipack = json.load(open(ui, encoding='utf-8')) if os.path.exists(ui) else {}
        for en, row in T.items():
            if en in pack or en in uipack: kept += 1; continue  # the pack's own wording stays
            pack[en] = row[i]
        with open(path, 'w', encoding='utf-8') as fh:
            json.dump(pack, fh, ensure_ascii=False, indent=1); fh.write('\n')  # the pack's own order, new rows at the end
    print('wrote', len(CODES), 'packs,', len(T), 'strings each;', kept, 'rows a pack already had were kept')
