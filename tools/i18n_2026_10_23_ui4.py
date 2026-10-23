#!/usr/bin/env python3
"""Game texts added on 2026-10-23 by package UI4 (owner 01:03 #3 and #5, 01:57 #7, #8 and #11): the several-swap window, deck slots,
the main deck's ribbon, the hand's would-be stats, the icon-only Auto-win. Same rules as i18n_2026_10_23_fx3.py: keys are the English,
every {placeholder} is kept. Rows the packs already hold (Swap, Your deck, Keep my deck, Nice!, Main deck, Previous / Next deck card) are
reused, not rewritten. Tagalog, Tamil, Japanese and Korean deserve a native read.

    python3 tools/i18n_2026_10_23_ui4.py && python3 tools/i18n_refresh.py
"""
import json, os, re
ROOT = os.path.join(os.path.dirname(os.path.abspath(__file__)), '..')
CODES = ['fr', 'de', 'es', 'it', 'pt', 'tl', 'ta', 'id', 'zh-Hans', 'zh-Hant', 'ja', 'ko']
# English the game no longer shows (UI4: the results' item chip says what the item does, nothing about where items come from)
DEAD = ["Field kit: your first {of} Conquest wins each day bring an item ({nth} of {of} today). Use it from 🎒 in a skirmish.",
        "Field kit: this boss grants an item on its first clear. Use it from 🎒 in a skirmish."]
T = {
"Swap cards": ["Échanger des cartes", "Karten tauschen", "Cambiar cartas", "Scambia carte", "Trocar cartas", "Magpalit ng mga baraha",
  "அட்டைகளை மாற்று", "Tukar kartu", "交换卡牌", "交換卡牌", "カードを入れ替え", "카드 교체"],
"From the pack": ["Du paquet", "Aus dem Pack", "Del sobre", "Dalla bustina", "Do pacote", "Mula sa pakete", "பொதியிலிருந்து", "Dari paket",
  "来自卡包", "來自卡包", "パックから", "팩에서"],
"{n} new cards beat cards in your deck. Untick any you'd rather keep.": [
  "{n} nouvelles cartes surpassent des cartes de ton deck. Décoche celles que tu préfères garder.",
  "{n} neue Karten schlagen Karten in deinem Deck. Entferne den Haken bei denen, die du lieber behältst.",
  "{n} cartas nuevas superan a cartas de tu mazo. Desmarca las que prefieras conservar.",
  "{n} nuove carte battono carte del tuo mazzo. Togli la spunta a quelle che preferisci tenere.",
  "{n} cartas novas superam cartas do teu baralho. Desmarca as que preferires manter.",
  "{n} bagong baraha ang mas malakas sa mga baraha sa deck mo. Alisin ang tsek sa gusto mong panatilihin.",
  "{n} புதிய அட்டைகள் உன் டெக்கின் அட்டைகளை விட வலிமையானவை. வைத்துக்கொள்ள விரும்புவதன் குறியை நீக்கு.",
  "{n} kartu baru mengungguli kartu di dekmu. Hapus centang yang ingin kamu pertahankan.",
  "{n} 张新卡强过你牌组里的卡。想保留的就取消勾选。", "{n} 張新卡強過你牌組裡的卡。想保留的就取消勾選。",
  "新しいカード{n}枚がデッキのカードを上回っています。残したいものはチェックを外してください。",
  "새 카드 {n}장이 덱의 카드보다 강해요. 남기고 싶은 카드는 체크를 해제하세요."],
"Swap {n}": ["Échanger {n}", "{n} tauschen", "Cambiar {n}", "Scambia {n}", "Trocar {n}", "Ipalit ang {n}", "{n} மாற்று", "Tukar {n}",
  "交换 {n} 张", "交換 {n} 張", "{n}枚を入れ替え", "{n}장 교체"],
"{n} new cards are in your deck.": ["{n} nouvelles cartes sont dans ton deck.", "{n} neue Karten sind in deinem Deck.", "{n} cartas nuevas están en tu mazo.",
  "{n} nuove carte sono nel tuo mazzo.", "{n} cartas novas estão no teu baralho.", "Nasa deck mo na ang {n} bagong baraha.",
  "{n} புதிய அட்டைகள் உன் டெக்கில் உள்ளன.", "{n} kartu baru ada di dekmu.", "{n} 张新卡已加入你的牌组。", "{n} 張新卡已加入你的牌組。",
  "新しいカード{n}枚がデッキに入りました。", "새 카드 {n}장이 덱에 들어갔어요."],
"Deck slots": ["Emplacements de deck", "Deckplätze", "Ranuras de mazo", "Slot dei mazzi", "Espaços de baralho", "Mga puwang ng deck",
  "டெக் இடங்கள்", "Slot dek", "牌组栏位", "牌組欄位", "デッキ枠", "덱 슬롯"],
"{used} of {n} deck slots used": ["{used} emplacements de deck utilisés sur {n}", "{used} von {n} Deckplätzen belegt", "{used} de {n} ranuras de mazo en uso",
  "{used} slot dei mazzi su {n} in uso", "{used} de {n} espaços de baralho em uso", "{used} sa {n} puwang ng deck ang gamit",
  "{n} டெக் இடங்களில் {used} பயன்பாட்டில்", "{used} dari {n} slot dek terpakai", "已用 {used}/{n} 个牌组栏位", "已用 {used}/{n} 個牌組欄位",
  "デッキ枠 {n} 中 {used} 使用中", "덱 슬롯 {n}개 중 {used}개 사용 중"],
"Every deck slot is open.": ["Tous les emplacements de deck sont ouverts.", "Alle Deckplätze sind offen.", "Todas las ranuras de mazo están abiertas.",
  "Tutti gli slot dei mazzi sono aperti.", "Todos os espaços de baralho estão abertos.", "Bukas na ang lahat ng puwang ng deck.",
  "எல்லா டெக் இடங்களும் திறந்துள்ளன.", "Semua slot dek sudah terbuka.", "所有牌组栏位都已开启。", "所有牌組欄位都已開啟。",
  "デッキ枠はすべて開放済みです。", "모든 덱 슬롯이 열렸어요."],
"Deck slot {slot} opens once you clear Map {map}.": ["L'emplacement de deck {slot} s'ouvre une fois la Carte {map} terminée.",
  "Deckplatz {slot} öffnet sich, sobald du Karte {map} abgeschlossen hast.", "La ranura de mazo {slot} se abre al completar el Mapa {map}.",
  "Lo slot {slot} si apre quando completi la Mappa {map}.", "O espaço de baralho {slot} abre quando concluíres o Mapa {map}.",
  "Bubukas ang puwang ng deck {slot} kapag natapos mo ang Mapa {map}.", "வரைபடம் {map} முடித்ததும் டெக் இடம் {slot} திறக்கும்.",
  "Slot dek {slot} terbuka setelah kamu menuntaskan Peta {map}.", "通关地图 {map} 后开启牌组栏位 {slot}。", "通關地圖 {map} 後開啟牌組欄位 {slot}。",
  "マップ{map}をクリアするとデッキ枠{slot}が開きます。", "맵 {map}을 클리어하면 덱 슬롯 {slot}이 열려요."],
"Open deck slot {slot}": ["Ouvrir l'emplacement {slot}", "Deckplatz {slot} öffnen", "Abrir la ranura {slot}", "Apri lo slot {slot}", "Abrir o espaço {slot}",
  "Buksan ang puwang {slot}", "டெக் இடம் {slot} திற", "Buka slot dek {slot}", "开启牌组栏位 {slot}", "開啟牌組欄位 {slot}", "デッキ枠{slot}を開放", "덱 슬롯 {slot} 열기"],
"You now have {n} deck slots.": ["Tu as maintenant {n} emplacements de deck.", "Du hast jetzt {n} Deckplätze.", "Ahora tienes {n} ranuras de mazo.",
  "Ora hai {n} slot dei mazzi.", "Agora tens {n} espaços de baralho.", "Mayroon ka nang {n} puwang ng deck.", "இப்போது உனக்கு {n} டெக் இடங்கள் உள்ளன.",
  "Sekarang kamu punya {n} slot dek.", "你现在有 {n} 个牌组栏位。", "你現在有 {n} 個牌組欄位。", "デッキ枠が{n}つになりました。", "이제 덱 슬롯이 {n}개예요."],
"Clear the map first.": ["Termine d'abord la carte.", "Schließe zuerst die Karte ab.", "Completa primero el mapa.", "Completa prima la mappa.", "Conclui primeiro o mapa.",
  "Tapusin muna ang mapa.", "முதலில் வரைபடத்தை முடி.", "Tuntaskan petanya dulu.", "先通关这张地图。", "先通關這張地圖。", "先にマップをクリアしてください。", "먼저 맵을 클리어하세요."],
"Not enough to open a deck slot yet.": ["Pas encore assez pour ouvrir un emplacement de deck.", "Noch nicht genug, um einen Deckplatz zu öffnen.",
  "Aún no tienes suficiente para abrir una ranura de mazo.", "Non hai ancora abbastanza per aprire uno slot.", "Ainda não tens o suficiente para abrir um espaço de baralho.",
  "Kulang pa para magbukas ng puwang ng deck.", "டெக் இடத்தைத் திறக்க இன்னும் போதவில்லை.", "Belum cukup untuk membuka slot dek.",
  "还不够开启牌组栏位。", "還不夠開啟牌組欄位。", "デッキ枠を開くにはまだ足りません。", "덱 슬롯을 열기엔 아직 부족해요."],
"All {n} deck slots hold a deck. Open another in the Camp or the Tavern, or delete a deck.": [
  "Tes {n} emplacements de deck sont pleins. Ouvre-en un autre au Camp ou à la Taverne, ou supprime un deck.",
  "Alle {n} Deckplätze sind belegt. Öffne im Lager oder in der Taverne einen weiteren oder lösche ein Deck.",
  "Tus {n} ranuras de mazo están ocupadas. Abre otra en el Campamento o la Taberna, o borra un mazo.",
  "Tutti i {n} slot dei mazzi sono occupati. Aprine un altro all'Accampamento o alla Taverna, o elimina un mazzo.",
  "Os teus {n} espaços de baralho estão ocupados. Abre outro no Acampamento ou na Taberna, ou apaga um baralho.",
  "May deck na ang lahat ng {n} puwang. Magbukas ng isa pa sa Kampo o sa Tavern, o magbura ng deck.",
  "உன் {n} டெக் இடங்களும் நிறைந்துள்ளன. முகாமில் அல்லது விடுதியில் இன்னொன்றைத் திற, அல்லது ஒரு டெக்கை நீக்கு.",
  "Semua {n} slot dek terisi. Buka satu lagi di Kemah atau Kedai, atau hapus sebuah dek.",
  "{n} 个牌组栏位都已占用。去营地或酒馆再开一个，或删除一副牌组。", "{n} 個牌組欄位都已佔用。去營地或酒館再開一個，或刪除一副牌組。",
  "デッキ枠{n}つがすべて使用中です。キャンプか酒場で枠を増やすか、デッキを削除してください。",
  "덱 슬롯 {n}개가 모두 찼어요. 캠프나 선술집에서 하나 더 열거나 덱을 삭제하세요."],
"Your one deck slot holds a deck. Open another in the Camp or the Tavern.": [
  "Ton seul emplacement de deck est occupé. Ouvre-en un autre au Camp ou à la Taverne.",
  "Dein einziger Deckplatz ist belegt. Öffne im Lager oder in der Taverne einen weiteren.",
  "Tu única ranura de mazo está ocupada. Abre otra en el Campamento o la Taberna.",
  "Il tuo unico slot dei mazzi è occupato. Aprine un altro all'Accampamento o alla Taverna.",
  "O teu único espaço de baralho está ocupado. Abre outro no Acampamento ou na Taberna.",
  "May deck na ang nag-iisa mong puwang. Magbukas ng isa pa sa Kampo o sa Tavern.",
  "உன் ஒரே டெக் இடம் நிறைந்துள்ளது. முகாமில் அல்லது விடுதியில் இன்னொன்றைத் திற.",
  "Satu-satunya slot dekmu sudah terisi. Buka satu lagi di Kemah atau Kedai.",
  "你唯一的牌组栏位已占用。去营地或酒馆再开一个。", "你唯一的牌組欄位已佔用。去營地或酒館再開一個。",
  "デッキ枠は1つだけで、使用中です。キャンプか酒場で枠を増やしてください。",
  "하나뿐인 덱 슬롯이 찼어요. 캠프나 선술집에서 하나 더 열어요."],
"You play with this one": ["Tu joues avec celui-ci", "Mit diesem spielst du", "Juegas con este", "Giochi con questo", "Jogas com este", "Ito ang ginagamit mo",
  "நீ விளையாடுவது இதுதான்", "Kamu bermain dengan ini", "你用这副牌组出战", "你用這副牌組出戰", "このデッキで戦います", "이 덱으로 싸워요"],
"Attack if played now: {n} (printed {printed})": ["Attaque si jouée maintenant : {n} (imprimée {printed})", "Angriff, wenn jetzt gespielt: {n} (aufgedruckt {printed})",
  "Ataque si se juega ahora: {n} (impreso {printed})", "Attacco se giocata ora: {n} (stampato {printed})", "Ataque se jogada agora: {n} (impresso {printed})",
  "Atake kung ilalaro ngayon: {n} (nakalimbag {printed})", "இப்போது ஆடினால் தாக்குதல்: {n} (அச்சிடப்பட்டது {printed})", "Serangan jika dimainkan sekarang: {n} (tercetak {printed})",
  "现在打出时的攻击：{n}（卡面 {printed}）", "現在打出時的攻擊：{n}（卡面 {printed}）", "今出した場合の攻撃：{n}（カード表記 {printed}）", "지금 내면 공격력: {n} (카드 표기 {printed})"],
"Health if played now: {n} (printed {printed})": ["Santé si jouée maintenant : {n} (imprimée {printed})", "Leben, wenn jetzt gespielt: {n} (aufgedruckt {printed})",
  "Salud si se juega ahora: {n} (impreso {printed})", "Salute se giocata ora: {n} (stampato {printed})", "Vida se jogada agora: {n} (impresso {printed})",
  "Buhay kung ilalaro ngayon: {n} (nakalimbag {printed})", "இப்போது ஆடினால் உயிர்: {n} (அச்சிடப்பட்டது {printed})", "Nyawa jika dimainkan sekarang: {n} (tercetak {printed})",
  "现在打出时的生命：{n}（卡面 {printed}）", "現在打出時的生命：{n}（卡面 {printed}）", "今出した場合の体力：{n}（カード表記 {printed}）", "지금 내면 체력: {n} (카드 표기 {printed})"],
"Auto-win": ["Victoire auto", "Auto-Sieg", "Victoria automática", "Vittoria automatica", "Vitória automática", "Auto-panalo", "தானியங்கி வெற்றி", "Menang otomatis",
  "自动获胜", "自動獲勝", "自動勝利", "자동 승리"],
}
# rows added only where a pack lacks them (other packs already have their own wording for these)
FILL = {"Swap": ["Échanger", "Tauschen", "Intercambiar", "Scambia", "Trocar", "Ipalit", "மாற்று", "Tukar", "交换", "交換", "入れ替え", "교체"]}
assert all(len(v) == len(CODES) for v in list(T.values()) + list(FILL.values()))
ph = lambda s: sorted(set(re.findall(r'\{\w+\}', s)))
assert all(ph(k) == ph(t) for k, v in T.items() for t in v), [k for k, v in T.items() for t in v if ph(k) != ph(t)]
def dump(path, d):
    with open(path, 'w', encoding='utf-8') as fh:
        json.dump(d, fh, ensure_ascii=False, indent=1); fh.write('\n')
if __name__ == '__main__':
    for i, code in enumerate(CODES):
        path = os.path.join(ROOT, 'lang', code + '.json'); ui = os.path.join(ROOT, 'lang', 'ui', code + '.json')
        pack = json.load(open(path, encoding='utf-8')); uipack = json.load(open(ui, encoding='utf-8'))
        for old in DEAD: pack.pop(old, None); uipack.pop(old, None)
        for en, row in T.items(): uipack.pop(en, None); pack[en] = row[i]
        for en, row in FILL.items():
            if en not in pack and en not in uipack: pack[en] = row[i]
        dump(path, pack); dump(ui, uipack)
    print('wrote', len(CODES), 'packs:', len(T), 'rows each,', len(DEAD), 'dead rows dropped')
