#!/usr/bin/env python3
"""Game texts added on 2026-10-25 by package PREF (owner #32 / 17:53 / 22:36): the Admin switch "Play with the map's reference deck", the
reference-set picker, a map's X-REF fight (its opponent row, map node and Admin row), the fight's REF tag and the results line. "REF" and the
fight codes stay as they are in every language. Tagalog, Tamil, Japanese and Korean deserve a native read.
    python3 tools/i18n_2026_10_25_pref.py"""
import json, os, re
ROOT = os.path.join(os.path.dirname(os.path.abspath(__file__)), '..')
CODES = ['fr', 'de', 'es', 'it', 'pt', 'tl', 'ta', 'id', 'zh-Hans', 'zh-Hant', 'ja', 'ko']
T = {
 'Map reference': ['Référence de la carte', 'Kartenreferenz', 'Referencia del mapa', 'Riferimento della mappa', 'Referência do mapa', 'Sanggunian ng mapa',
                   'வரைபட மேற்கோள்', 'Referensi peta', '地图参考', '地圖參考', 'マップの基準', '맵 기준'],
 "Play with the map's reference deck": ['Jouer avec le deck de référence de la carte', 'Mit dem Referenzdeck der Karte spielen', 'Jugar con el mazo de referencia del mapa',
   'Gioca con il mazzo di riferimento della mappa', 'Jogar com o baralho de referência do mapa', 'Maglaro gamit ang reference deck ng mapa',
   'வரைபடத்தின் மேற்கோள் அடுக்குடன் விளையாடு', 'Main dengan dek referensi peta', '使用地图的参考卡组', '使用地圖的參考牌組', 'マップの基準デッキで遊ぶ', '맵의 기준 덱으로 플레이'],
 'Reference:': ['Référence :', 'Referenz:', 'Referencia:', 'Riferimento:', 'Referência:', 'Sanggunian:', 'மேற்கோள்:', 'Referensi:', '参考：', '參考：', '基準：', '기준:'],
 "On: every Conquest fight (road, PRO, BPRO, X-REF) deals you the chosen reference deck at that map's levels instead of your deck. Free, no rewards. Kept on this device.": [
   "Activé : chaque combat de Conquête (route, PRO, BPRO, X-REF) vous donne le deck de référence choisi aux niveaux de cette carte au lieu de votre deck. Gratuit, sans récompense. Conservé sur cet appareil.",
   "An: Jeder Eroberungskampf (Weg, PRO, BPRO, X-REF) gibt dir statt deines Decks das gewählte Referenzdeck auf den Stufen dieser Karte. Kostenlos, ohne Belohnung. Bleibt auf diesem Gerät gespeichert.",
   "Activado: cada combate de Conquista (camino, PRO, BPRO, X-REF) te da el mazo de referencia elegido a los niveles de ese mapa en lugar de tu mazo. Gratis, sin recompensas. Se guarda en este dispositivo.",
   "Attivo: ogni scontro di Conquista (percorso, PRO, BPRO, X-REF) ti dà il mazzo di riferimento scelto ai livelli di quella mappa al posto del tuo mazzo. Gratis, senza ricompense. Salvato su questo dispositivo.",
   "Ligado: cada combate de Conquista (caminho, PRO, BPRO, X-REF) dá-lhe o baralho de referência escolhido nos níveis desse mapa em vez do seu baralho. Grátis, sem recompensas. Guardado neste dispositivo.",
   "Naka-on: bawat laban sa Conquest (daan, PRO, BPRO, X-REF) ay magbibigay sa iyo ng napiling reference deck sa mga level ng mapang iyon sa halip na iyong deck. Libre, walang gantimpala. Nakatago sa device na ito.",
   "இயக்கத்தில்: ஒவ்வொரு வெற்றிப் போரிலும் (பாதை, PRO, BPRO, X-REF) உங்கள் அடுக்குக்குப் பதிலாக தேர்ந்த மேற்கோள் அடுக்கு அந்த வரைபடத்தின் நிலைகளில் வழங்கப்படும். இலவசம், பரிசு இல்லை. இந்தச் சாதனத்தில் சேமிக்கப்படும்.",
   "Aktif: setiap pertarungan Penaklukan (jalan, PRO, BPRO, X-REF) memberimu dek referensi pilihan pada level peta itu, bukan dekmu. Gratis, tanpa hadiah. Disimpan di perangkat ini.",
   "开启：每场征服战斗（道路、PRO、BPRO、X-REF）都会用所选参考卡组（按该地图的等级）代替你的卡组。免费，无奖励。保存在此设备上。",
   "開啟：每場征服戰鬥（道路、PRO、BPRO、X-REF）都會用所選參考牌組（按該地圖的等級）代替你的牌組。免費，無獎勵。儲存在此裝置上。",
   "オン：すべての征服バトル（道、PRO、BPRO、X-REF）で、自分のデッキの代わりに選んだ基準デッキをそのマップのレベルで使います。無料・報酬なし。この端末に保存されます。",
   "켜짐: 모든 정복 전투(길, PRO, BPRO, X-REF)에서 내 덱 대신 선택한 기준 덱을 그 맵의 레벨로 사용합니다. 무료, 보상 없음. 이 기기에 저장됩니다."],
 'Against:': ['Contre :', 'Gegen:', 'Contra:', 'Contro:', 'Contra:', 'Laban sa:', 'எதிராக:', 'Melawan:', '对手：', '對手：', '相手：', '상대:'],
 'You play:': ['Vous jouez :', 'Du spielst:', 'Juegas con:', 'Giochi con:', 'Você joga com:', 'Gamit mo:', 'நீங்கள் விளையாடுவது:', 'Kamu memakai:', '你使用：', '你使用：', '使うデッキ：', '사용 덱:'],
 'Level {n}': ['Niveau {n}', 'Stufe {n}', 'Nivel {n}', 'Livello {n}', 'Nível {n}', 'Level {n}', 'நிலை {n}', 'Level {n}', '等级 {n}', '等級 {n}', 'レベル{n}', '레벨 {n}'],
 "{key}: the reference deck against this map's PRO decks": [
   "{key} : le deck de référence contre les decks PRO de cette carte", "{key}: das Referenzdeck gegen die PRO-Decks dieser Karte", "{key}: el mazo de referencia contra los mazos PRO de este mapa",
   "{key}: il mazzo di riferimento contro i mazzi PRO di questa mappa", "{key}: o baralho de referência contra os baralhos PRO deste mapa", "{key}: ang reference deck laban sa mga PRO deck ng mapang ito",
   "{key}: இந்த வரைபடத்தின் PRO அடுக்குகளுக்கு எதிராக மேற்கோள் அடுக்கு", "{key}: dek referensi melawan dek PRO peta ini", "{key}：参考卡组对阵本地图的 PRO 卡组",
   "{key}：參考牌組對陣本地圖的 PRO 牌組", "{key}：基準デッキ対このマップのPROデッキ", "{key}: 기준 덱 대 이 맵의 PRO 덱"],
 "Reference deck vs this map's PRO decks": [
   "Deck de référence contre les decks PRO de cette carte", "Referenzdeck gegen die PRO-Decks dieser Karte", "Mazo de referencia contra los mazos PRO de este mapa",
   "Mazzo di riferimento contro i mazzi PRO di questa mappa", "Baralho de referência contra os baralhos PRO deste mapa", "Reference deck laban sa mga PRO deck ng mapang ito",
   "இந்த வரைபடத்தின் PRO அடுக்குகளுக்கு எதிராக மேற்கோள் அடுக்கு", "Dek referensi melawan dek PRO peta ini", "参考卡组对阵本地图的 PRO 卡组",
   "參考牌組對陣本地圖的 PRO 牌組", "基準デッキ対このマップのPROデッキ", "기준 덱 대 이 맵의 PRO 덱"],
 'REF': ['REF'] * 12,
 'You are playing {name}, not your deck.': [
   'Vous jouez {name}, pas votre deck.', 'Du spielst {name}, nicht dein Deck.', 'Juegas con {name}, no con tu mazo.', 'Stai giocando {name}, non il tuo mazzo.',
   'Você está jogando com {name}, não com o seu baralho.', 'Gamit mo ang {name}, hindi ang iyong deck.', 'நீங்கள் உங்கள் அடுக்கு அல்ல, {name} உடன் விளையாடுகிறீர்கள்.',
   'Kamu memakai {name}, bukan dekmu.', '你正在使用 {name}，而不是你的卡组。', '你正在使用 {name}，而不是你的牌組。', '自分のデッキではなく{name}で遊んでいます。', '내 덱이 아니라 {name}(으)로 플레이 중입니다.'],
 'Played with {name}: no rewards.': [
   'Joué avec {name} : pas de récompense.', 'Mit {name} gespielt: keine Belohnung.', 'Jugado con {name}: sin recompensas.', 'Giocato con {name}: nessuna ricompensa.',
   'Jogado com {name}: sem recompensas.', 'Nilaro gamit ang {name}: walang gantimpala.', '{name} உடன் விளையாடப்பட்டது: பரிசு இல்லை.', 'Dimainkan dengan {name}: tanpa hadiah.',
   '使用 {name} 进行：无奖励。', '使用 {name} 進行：無獎勵。', '{name}でプレイ：報酬なし。', '{name}(으)로 플레이: 보상 없음.'],
}
def dump(path, d):
    with open(path, 'w', encoding='utf-8') as fh:
        json.dump(d, fh, ensure_ascii=False, indent=1); fh.write('\n')
ph = lambda s: sorted(set(re.findall(r'\{\w+\}', s)))
src = open(os.path.join(ROOT, 'bramblewood-texts.js'), encoding='utf-8').read()
for en in T: assert json.dumps(en, ensure_ascii=False) in src, en  # every one is a TX text
for i, code in enumerate(CODES):
    path = os.path.join(ROOT, 'lang', code + '.json'); pack = json.load(open(path, encoding='utf-8'))
    for en, row in T.items():
        assert len(row) == len(CODES) and ph(en) == ph(row[i]), (code, en)
        if en in pack and pack[en] != row[i] and en in ('Level {n}', 'Against:', 'You play:', 'Reference:'): continue  # an older, reviewed row wins
        pack[en] = row[i]
    dump(path, pack)
print('wrote', len(CODES), 'packs:', len(T), 'texts each')
