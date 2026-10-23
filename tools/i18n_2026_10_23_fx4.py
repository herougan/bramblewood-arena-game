#!/usr/bin/env python3
"""Game texts changed on 2026-10-23 by package FX4 (owner's 11:11 answers): Scorched Ground boils under one unit a side again, the line of
fire is its own field effect (Wildfire Front), Lava Waders (Fire Resistance), the Bulwark Shields' Guardian, Backstab's Waiting / Shocked /
Exposed targets, the faction pack's one-row swap with Swap Again, and the Tutorial's "Exit". Same rules as i18n_2026_10_23_fx3.py: keys are
the English, every {placeholder} is kept. Rows a pack already has elsewhere ("Exit" in the UI pack) are copied, not retranslated. Tagalog,
Tamil, Japanese and Korean deserve a native read.

    python3 tools/i18n_2026_10_23_fx4.py && python3 tools/i18n_refresh.py
"""
import json, os, re
ROOT = os.path.join(os.path.dirname(os.path.abspath(__file__)), '..')
CODES = ['fr', 'de', 'es', 'it', 'pt', 'tl', 'ta', 'id', 'zh-Hans', 'zh-Hant', 'ja', 'ko']
# English the game no longer shows (FX4 replaced it)
DEAD = ["🔥 A line of fire sweeps across the scorched ground.",
  "The shields are Structures with no skills. With no free slot, no shield.",
  "Worse at combat: Blind, Stunned, Frozen, Asleep, Confused, Tipsy, Staggered, Paralyzed, Bound, Webbed or turned to stone, or it can't see in the dark while this unit can.",
  "To Map {n}",
  "{n} new cards beat cards in your deck. Untick any you'd rather keep.", "Swap {n}"]  # UI4's ticked rows (ui.ui4-swap-say / -n), gone with them
# rows copied from the pack's own UI table into the main table (TX keys read the main table first)
COPY = ["Exit"]
T = {
"From round 2, the ground boils under one random unit on each side: 1 fire damage a round.": [
  "Dès le tour 2, le sol bout sous une unité au hasard de chaque camp : 1 dégât de feu par tour.",
  "Ab Runde 2 kocht der Boden unter einer zufälligen Einheit jeder Seite: 1 Feuerschaden pro Runde.",
  "Desde la ronda 2, el suelo hierve bajo una unidad al azar de cada bando: 1 de daño de fuego por ronda.",
  "Dal round 2, il terreno ribolle sotto un'unità a caso per lato: 1 danno da fuoco a round.",
  "A partir da ronda 2, o chão ferve sob uma unidade aleatória de cada lado: 1 de dano de fogo por ronda.",
  "Mula round 2, kumukulo ang lupa sa ilalim ng isang random na yunit sa bawat panig: 1 pinsalang apoy bawat round.",
  "சுற்று 2 முதல், ஒவ்வொரு பக்கத்திலும் ஒரு சீரற்ற அலகின் கீழ் நிலம் கொதிக்கும்: ஒரு சுற்றுக்கு 1 நெருப்புச் சேதம்.",
  "Mulai ronde 2, tanah mendidih di bawah satu unit acak di tiap sisi: 1 kerusakan api per ronde.",
  "从第 2 轮起，双方各有一个随机单位脚下的地面沸腾：每轮 1 点火焰伤害。",
  "從第 2 輪起，雙方各有一個隨機單位腳下的地面沸騰：每輪 1 點火焰傷害。",
  "ラウンド2から、両陣営のランダムなユニット1体の足元で地面が煮え立つ：毎ラウンド火炎ダメージ1。",
  "2라운드부터 양쪽의 무작위 유닛 1체 아래에서 땅이 끓어올라요: 라운드마다 화염 피해 1."],
"The ground boils: 1 to a unit a side": [
  "Le sol bout : 1 à une unité par camp", "Der Boden kocht: 1 an eine Einheit je Seite", "El suelo hierve: 1 a una unidad por bando",
  "Il terreno ribolle: 1 a un'unità per lato", "O chão ferve: 1 a uma unidade por lado", "Kumukulo ang lupa: 1 sa isang yunit bawat panig",
  "நிலம் கொதிக்கிறது: ஒரு பக்கத்துக்கு ஓர் அலகுக்கு 1", "Tanah mendidih: 1 ke satu unit per sisi", "地面沸腾：每方一个单位 1 点",
  "地面沸騰：每方一個單位 1 點", "地面が煮え立つ：各陣営1体に1", "땅이 끓어요: 양쪽 유닛 1체씩 1"],
"Units that resist fire, and Mountain Climbers, are spared.": [
  "Les unités qui résistent au feu et les Grimpeurs sont épargnés.", "Feuerresistente Einheiten und Bergsteiger bleiben verschont.",
  "Las unidades resistentes al fuego y los Escaladores se libran.", "Le unità resistenti al fuoco e gli Scalatori sono risparmiati.",
  "As unidades resistentes ao fogo e os Escaladores são poupados.", "Ligtas ang mga yunit na matibay sa apoy at ang mga Mountain Climber.",
  "நெருப்பை எதிர்க்கும் அலகுகளும் மலையேறிகளும் தப்பும்.", "Unit yang tahan api dan Pendaki Gunung tidak terkena.", "抗火单位和登山者不受影响。",
  "抗火單位和登山者不受影響。", "炎耐性のあるユニットと登山家は無事。", "화염 저항 유닛과 등반가는 무사해요."],
"Wildfire Front": ["Front de feu", "Feuerfront", "Frente de incendio", "Fronte di fuoco", "Frente de incêndio", "Harap ng Sunog", "காட்டுத்தீ முனை",
  "Garis Depan Api", "野火前线", "野火前線", "野火の前線", "들불 전선"],
"Fire Resistance": ["Résistance au feu", "Feuerresistenz", "Resistencia al fuego", "Resistenza al fuoco", "Resistência ao fogo", "Tibay sa Apoy",
  "நெருப்பு எதிர்ப்பு", "Tahan Api", "火焰抗性", "火焰抗性", "炎耐性", "화염 저항"],
"Resist {x}": ["Résiste : {x}", "Resistenz: {x}", "Resiste: {x}", "Resiste: {x}", "Resiste: {x}", "Matibay sa {x}", "{x} எதிர்ப்பு", "Tahan {x}",
  "抗{x}", "抗{x}", "{x}耐性", "{x} 저항"],
"🔥 A wildfire front sweeps across the field.": [
  "🔥 Un front de feu balaie le terrain.", "🔥 Eine Feuerfront fegt über das Feld.", "🔥 Un frente de incendio barre el campo.",
  "🔥 Un fronte di fuoco spazza il campo.", "🔥 Uma frente de incêndio varre o campo.", "🔥 Dumaan ang harap ng sunog sa larangan.",
  "🔥 ஒரு காட்டுத்தீ முனை களத்தைக் கடக்கிறது.", "🔥 Garis depan api menyapu medan.", "🔥 野火前线扫过战场。", "🔥 野火前線掃過戰場。",
  "🔥 野火の前線が戦場を横切る。", "🔥 들불 전선이 전장을 휩쓸어요."],
"The wildfire front burns {name}: {n} 🔥 fire damage.": [
  "Le front de feu brûle {name} : {n} 🔥 dégâts de feu.", "Die Feuerfront verbrennt {name}: {n} 🔥 Feuerschaden.",
  "El frente de incendio quema a {name}: {n} 🔥 de daño de fuego.", "Il fronte di fuoco brucia {name}: {n} 🔥 danni da fuoco.",
  "A frente de incêndio queima {name}: {n} 🔥 de dano de fogo.", "Sinunog ng harap ng sunog si {name}: {n} 🔥 pinsalang apoy.",
  "காட்டுத்தீ முனை {name}-ஐ எரிக்கிறது: {n} 🔥 நெருப்புச் சேதம்.", "Garis depan api membakar {name}: {n} 🔥 kerusakan api.",
  "野火前线烧到{name}：{n} 🔥 火焰伤害。", "野火前線燒到{name}：{n} 🔥 火焰傷害。", "野火の前線が{name}を焼く：{n} 🔥 火炎ダメージ。",
  "들불 전선이 {name}을(를) 태워요: {n} 🔥 화염 피해."],
"The shields are Structures with Guardian. With no free slot, no shield.": [
  "Les boucliers sont des Structures avec Gardien. Sans case libre, pas de bouclier.", "Die Schilde sind Bauwerke mit Wächter. Kein freier Platz, kein Schild.",
  "Los escudos son Estructuras con Guardián. Sin casilla libre, no hay escudo.", "Gli scudi sono Strutture con Guardiano. Senza spazio libero, niente scudo.",
  "Os escudos são Estruturas com Guardião. Sem espaço livre, não há escudo.", "Ang mga kalasag ay Istrukturang may Guardian. Kung walang bakanteng puwesto, walang kalasag.",
  "கேடயங்கள் காவலன் திறனுள்ள கட்டடங்கள். காலி இடம் இல்லையெனில் கேடயம் இல்லை.", "Perisai adalah Bangunan dengan Penjaga. Tanpa slot kosong, tidak ada perisai.",
  "护盾是带守护的建筑。没有空位就没有护盾。", "護盾是帶守護的建築。沒有空位就沒有護盾。", "シールドはガーディアンを持つ建造物。空きマスがなければ出ない。",
  "방패는 수호자를 가진 건축물입니다. 빈칸이 없으면 방패도 없습니다."],
"Worse at combat: still Waiting, Shocked, Exposed, Blind, Stunned, Frozen, Asleep, Confused, Tipsy, Staggered, Paralyzed, Bound, Webbed or turned to stone, or it can't see in the dark while this unit can.": [
  "Diminuée au combat : encore en Attente, Électrisée, Exposée, Aveuglée, Étourdie, Gelée, Endormie, Confuse, Éméchée, Chancelante, Paralysée, Ligotée, Engluée ou changée en pierre, ou elle ne voit pas dans le noir alors que celle-ci voit.",
  "Im Kampf geschwächt: noch Wartend, Geschockt, Entblößt, Geblendet, Betäubt, Gefroren, Schlafend, Verwirrt, Beschwipst, Taumelnd, Gelähmt, Gefesselt, Eingesponnen oder versteinert, oder sie sieht im Dunkeln nichts, während diese Einheit sieht.",
  "Mermada en combate: aún en Espera, Electrocutada, Expuesta, Cegada, Aturdida, Congelada, Dormida, Confusa, Achispada, Tambaleante, Paralizada, Atada, Enredada o convertida en piedra, o no ve en la oscuridad mientras esta sí ve.",
  "Indebolita in combattimento: ancora in Attesa, Folgorata, Esposta, Accecata, Stordita, Congelata, Addormentata, Confusa, Brilla, Barcollante, Paralizzata, Legata, Invischiata o pietrificata, oppure non vede al buio mentre questa sì.",
  "Enfraquecida em combate: ainda em Espera, Eletrizada, Exposta, Cega, Atordoada, Congelada, Adormecida, Confusa, Tocada, Cambaleante, Paralisada, Amarrada, Enredada ou transformada em pedra, ou não vê no escuro enquanto esta vê.",
  "Mahina sa laban: Naghihintay pa, Nakuryente, Nakalantad, Bulag, Tulala, Nagyelo, Tulog, Lito, Lasing, Pasuray-suray, Paralisado, Nakagapos, Nasa sapot o naging bato, o hindi ito makakita sa dilim habang nakakakita ang unit na ito.",
  "போரில் பலவீனம்: இன்னும் காத்திருப்பு, மின்னதிர்ச்சி, வெளிப்பட்டது, குருடு, மயக்கம், உறைவு, தூக்கம், குழப்பம், போதை, தடுமாற்றம், முடக்கம், கட்டுண்டது, வலையில் சிக்கியது அல்லது கல்லானது; அல்லது இது பார்க்கும்போது அது இருளில் பார்க்க முடியாதது.",
  "Lemah dalam pertempuran: masih Menunggu, Tersetrum, Terekspos, Buta, Pingsan, Membeku, Tertidur, Bingung, Mabuk, Terhuyung, Lumpuh, Terikat, Terjerat jaring atau membatu, atau ia tak bisa melihat dalam gelap sementara unit ini bisa.",
  "战斗状态变差：仍在等待、触电、暴露、失明、眩晕、冰冻、沉睡、混乱、微醺、踉跄、麻痹、束缚、被网缠住或石化，或它在黑暗中看不见而本单位看得见。",
  "戰鬥狀態變差：仍在等待、觸電、暴露、失明、暈眩、冰凍、沉睡、混亂、微醺、踉蹌、麻痺、束縛、被網纏住或石化，或牠在黑暗中看不見而本單位看得見。",
  "戦闘で不利な状態：まだ待機中、感電、無防備、盲目、気絶、凍結、睡眠、混乱、ほろ酔い、よろめき、麻痺、拘束、蜘蛛の巣、石化、またはこのユニットは見えるのに相手は暗闇で見えない。",
  "전투에 불리한 상태: 아직 대기 중, 감전, 노출, 실명, 기절, 빙결, 수면, 혼란, 취함, 비틀거림, 마비, 속박, 거미줄 또는 석화, 또는 이 유닛은 보이는데 상대는 어둠 속에서 보지 못함."],
"New cards that beat cards in your deck: {n}.": [
  "Nouvelles cartes meilleures que des cartes de ton deck : {n}.", "Neue Karten, die Karten in deinem Deck schlagen: {n}.",
  "Cartas nuevas que superan a cartas de tu mazo: {n}.", "Carte nuove migliori di carte del tuo mazzo: {n}.", "Cartas novas melhores do que cartas do teu baralho: {n}.",
  "Mga bagong card na mas mahusay kaysa sa nasa deck mo: {n}.", "உன் தளத்திலுள்ள அட்டைகளை விடச் சிறந்த புதிய அட்டைகள்: {n}.",
  "Kartu baru yang lebih kuat dari kartu di dekmu: {n}.", "胜过你卡组中卡牌的新卡：{n}。", "勝過你牌組中卡牌的新卡：{n}。", "デッキのカードより強い新しいカード：{n}枚。",
  "덱의 카드보다 강한 새 카드: {n}장."],
"Still better than your deck: {n}.": [
  "Encore meilleures que ton deck : {n}.", "Noch besser als dein Deck: {n}.", "Aún mejores que tu mazo: {n}.", "Ancora migliori del tuo mazzo: {n}.",
  "Ainda melhores do que o teu baralho: {n}.", "Mas mahusay pa rin kaysa sa deck mo: {n}.", "இன்னும் உன் தளத்தை விடச் சிறந்தவை: {n}.",
  "Masih lebih kuat dari dekmu: {n}.", "仍胜过你的卡组：{n}。", "仍勝過你的牌組：{n}。", "まだデッキより強いカード：{n}枚。", "아직 덱보다 강한 카드: {n}장."],
"Swap {out} for {in}?": [
  "Échanger {out} contre {in} ?", "{out} gegen {in} tauschen?", "¿Cambiar {out} por {in}?", "Scambiare {out} con {in}?", "Trocar {out} por {in}?",
  "Ipalit ang {out} sa {in}?", "{out}-ஐ {in}-க்கு மாற்றவா?", "Tukar {out} dengan {in}?", "用{in}换下{out}？", "用{in}換下{out}？",
  "{out}を{in}と入れ替える？", "{out}을(를) {in}(으)로 바꿀까요?"],
"Swap Again": ["Échanger encore", "Nochmal tauschen", "Cambiar otra vez", "Scambia ancora", "Trocar outra vez", "Ipalit Ulit", "மீண்டும் மாற்று",
  "Tukar Lagi", "再换一张", "再換一張", "もう一度入れ替え", "한 번 더 교체"],
"Previous pack card": ["Carte précédente du paquet", "Vorherige Packkarte", "Carta anterior del sobre", "Carta precedente del pacchetto",
  "Carta anterior do pacote", "Naunang card ng pack", "முந்தைய பொதி அட்டை", "Kartu paket sebelumnya", "上一张卡包卡牌", "上一張卡包卡牌", "前のパックカード", "이전 팩 카드"],
"Next pack card": ["Carte suivante du paquet", "Nächste Packkarte", "Siguiente carta del sobre", "Carta successiva del pacchetto",
  "Carta seguinte do pacote", "Susunod na card ng pack", "அடுத்த பொதி அட்டை", "Kartu paket berikutnya", "下一张卡包卡牌", "下一張卡包卡牌", "次のパックカード", "다음 팩 카드"],
}
CARD_NAME = "Lava Waders"
CARD_FLAVOUR = "Thigh-high boots of salamander hide and pitch. Wade in, keep your toes."
CARD = {
 'fr': ("Cuissardes de lave", "Des cuissardes en peau de salamandre et en poix. Entre dans la lave, garde tes orteils."),
 'de': ("Lavawaten", "Hüfthohe Stiefel aus Salamanderhaut und Pech. Hineinwaten, Zehen behalten."),
 'es': ("Botas de lava", "Botas hasta el muslo de piel de salamandra y brea. Métete y conserva los dedos."),
 'it': ("Stivali da lava", "Stivali alti fino alla coscia, in pelle di salamandra e pece. Entra a guado, tieniti le dita."),
 'pt': ("Galochas de lava", "Botas até à coxa de pele de salamandra e breu. Entra a vau e fica com os dedos."),
 'tl': ("Botang Pang-lava", "Botang hanggang hita na gawa sa balat ng salamander at alkitran. Lumusong ka, buo pa rin ang mga daliri mo."),
 'ta': ("எரிமலைக்குழம்பு காலணிகள்", "சாலமாண்டர் தோலும் தாரும் கொண்ட தொடை உயரக் காலணிகள். இறங்கி நட, விரல்கள் பத்திரம்."),
 'id': ("Sepatu Lava", "Sepatu bot setinggi paha dari kulit salamander dan ter. Masuklah, jari kakimu tetap utuh."),
 'zh-Hans': ("熔岩涉水靴", "用蝾螈皮和沥青做的过膝长靴。蹚进去，脚趾还在。"),
 'zh-Hant': ("熔岩涉水靴", "用蠑螈皮和瀝青做的過膝長靴。蹚進去，腳趾還在。"),
 'ja': ("溶岩ウェーダー", "サラマンダーの革と松脂でできた腿まであるブーツ。踏み込んでも、つま先は無事。"),
 'ko': ("용암 장화", "도롱뇽 가죽과 역청으로 만든 허벅지 높이 장화. 걸어 들어가도 발가락은 무사하다."),
}
assert all(len(v) == len(CODES) for v in T.values()), [k for k, v in T.items() if len(v) != len(CODES)]
ph = lambda s: sorted(set(re.findall(r'\{\w+\}', s)))
assert all(ph(k) == ph(t) for k, v in T.items() for t in v), [(k, t) for k, v in T.items() for t in v if ph(k) != ph(t)]
def dump(path, d):
    with open(path, 'w', encoding='utf-8') as fh:
        json.dump(d, fh, ensure_ascii=False, indent=1); fh.write('\n')
if __name__ == '__main__':
    for i, code in enumerate(CODES):
        path = os.path.join(ROOT, 'lang', code + '.json'); ui = os.path.join(ROOT, 'lang', 'ui', code + '.json')
        pack = json.load(open(path, encoding='utf-8')); uipack = json.load(open(ui, encoding='utf-8'))
        for old in DEAD: pack.pop(old, None)
        for en in COPY:
            if en not in pack:
                if en not in uipack: raise SystemExit(f'{code}: no row for "{en}"')
                pack[en] = uipack[en]
        for en, row in T.items(): uipack.pop(en, None); pack[en] = row[i]
        uipack[CARD_FLAVOUR] = CARD[code][1]
        dump(path, pack); dump(ui, uipack)
        cp = os.path.join(ROOT, 'lang', 'cards', code + '.json')
        cards = json.load(open(cp, encoding='utf-8')); cards[CARD_NAME] = CARD[code][0]; dump(cp, cards)
    print('wrote', len(CODES), 'packs:', len(T), 'rows each,', len(COPY), 'copied,', len(DEAD), 'dead rows dropped; the Lava Waders name and flavour')
