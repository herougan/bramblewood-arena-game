#!/usr/bin/env python3
"""2026-11-02 (release 11-02a merge): rows for the texts ENG17 (Hatchling) and BAL11 (N-WK) added in English only, and the 22-8 node renamed
by CONTENT6-2 ("The Rimeheart Mammoth"; node names are translated only in fr, de, es, zh-Hans, zh-Hant, ja, as the old Colossus row was).
Rows go to lang/<code>.json (TX keys, keyed by English text) and lang/ui/<code>.json (node name). Tagalog, Tamil and Indonesian deserve a native read.
    python3 tools/i18n_2026_11_02_release.py"""
import json, os
ROOT = os.path.join(os.path.dirname(os.path.abspath(__file__)), '..')
CODES = ['fr', 'de', 'es', 'it', 'pt', 'tl', 'ta', 'id', 'zh-Hans', 'zh-Hant', 'ja', 'ko']
# English, [fr, de, es, it, pt, tl, ta, id, zh-Hans, zh-Hant, ja, ko]
TX = [
 ("a weak deck built from this map's card list, for practice.",
  ["un deck faible construit à partir des cartes de cette carte, pour s’entraîner.", 'ein schwaches Deck aus der Kartenliste dieser Karte, zum Üben.', 'un mazo débil hecho con la lista de cartas de este mapa, para practicar.', 'un mazzo debole costruito con la lista di carte di questa mappa, per allenarsi.', 'um baralho fraco feito com a lista de cartas deste mapa, para treinar.', 'mahinang deck na binuo mula sa listahan ng card ng mapang ito, para sa pagsasanay.', 'இந்த வரைபடத்தின் அட்டைப் பட்டியலிலிருந்து பயிற்சிக்காக அமைத்த பலவீனமான தளம்.', 'dek lemah yang disusun dari daftar kartu peta ini, untuk latihan.', '用本地图卡牌列表组成的弱卡组，供练习。', '用本地圖卡牌列表組成的弱牌組，供練習。', 'このマップのカードリストで組んだ練習用の弱いデッキ。', '이 맵의 카드 목록으로 만든 연습용 약한 덱.']),
 ("{key}: practice fight against a weak deck of this map. No rewards. Tap to start.",
  ['{key} : combat d’entraînement contre un deck faible de cette carte. Aucune récompense. Touchez pour commencer.', '{key}: Übungskampf gegen ein schwaches Deck dieser Karte. Keine Belohnungen. Tippen zum Starten.', '{key}: combate de práctica contra un mazo débil de este mapa. Sin recompensas. Toca para empezar.', '{key}: scontro di allenamento contro un mazzo debole di questa mappa. Nessuna ricompensa. Tocca per iniziare.', '{key}: luta de treino contra um baralho fraco deste mapa. Sem recompensas. Toque para começar.', '{key}: pagsasanay na laban kontra sa mahinang deck ng mapang ito. Walang gantimpala. I-tap para magsimula.', '{key}: இந்த வரைபடத்தின் பலவீனமான தளத்துக்கு எதிரான பயிற்சிப் போர். பரிசுகள் இல்லை. தொடங்கத் தட்டவும்.', '{key}: pertarungan latihan melawan dek lemah peta ini. Tanpa hadiah. Ketuk untuk mulai.', '{key}：对阵本地图弱卡组的练习战。无奖励。点击开始。', '{key}：對陣本地圖弱牌組的練習戰。無獎勵。點擊開始。', '{key}：このマップの弱いデッキとの練習戦。報酬なし。タップで開始。', '{key}: 이 맵의 약한 덱과 붙는 연습전. 보상 없음. 탭하여 시작.']),
 ('Hatchling',
  ['Oisillon', 'Schlüpfling', 'Cría', 'Cucciolo', 'Filhote', 'Bagong Pisa', 'குஞ்சு', 'Tetasan', '雏崽', '雛崽', 'ひな', '새끼']),
 ('A young one an evolute can grow from: an evolute played onto it gains +1/+2. From Level 1.',
  ['Un petit dont une évolution peut naître : une évolution jouée dessus gagne +1/+2. Dès le niveau 1.', 'Ein Junges, aus dem eine Evolute wachsen kann: Eine darauf gespielte Evolute erhält +1/+2. Ab Stufe 1.', 'Una cría de la que puede crecer una evolución: una evolución jugada sobre ella gana +1/+2. Desde el nivel 1.', 'Un piccolo da cui può crescere un’evoluzione: un’evoluzione giocata sopra ottiene +1/+2. Dal livello 1.', 'Um filhote de onde uma evolução pode crescer: uma evolução jogada sobre ele ganha +1/+2. Desde o nível 1.', 'Isang batang maaaring pagmulan ng evolute: ang evolute na nilaro rito ay makakakuha ng +1/+2. Mula Level 1.', 'ஓர் எவல்யூட் வளரக்கூடிய இளம் உயிர்: இதன் மேல் விளையாடும் எவல்யூட் +1/+2 பெறும். நிலை 1 முதல்.', 'Anak muda tempat evolute bisa tumbuh: evolute yang dimainkan di atasnya mendapat +1/+2. Sejak Level 1.', '可由进化体成长而来的幼崽：打在它身上的进化体获得 +1/+2。1 级起。', '可由進化體成長而來的幼崽：打在牠身上的進化體獲得 +1/+2。1 級起。', '進化体が育つもとになる幼体：この上に出した進化体は+1/+2を得る。レベル1から。', '진화체가 자라날 수 있는 어린 개체: 그 위에 낸 진화체는 +1/+2를 얻습니다. 레벨 1부터.']),
 ("Every Baby card has it from Level 1. It only matters when you play an Evomax evolute (Evolute) onto it; it is not the egg's Hatch or Stay.",
  ['Chaque carte Bébé l’a dès le niveau 1. Elle ne compte que si vous jouez une évolution Evomax (Évolution) dessus ; ce n’est ni l’Éclosion ni le Maintien de l’œuf.', 'Jede Baby-Karte hat es ab Stufe 1. Es zählt nur, wenn du eine Evomax-Evolute (Evolute) darauf spielst; es ist nicht das Schlüpfen oder Bleiben des Eis.', 'Toda carta Bebé la tiene desde el nivel 1. Solo importa cuando juegas una evolución Evomax (Evolución) sobre ella; no es la Eclosión ni el Quedarse del huevo.', 'Ogni carta Cucciolo ce l’ha dal livello 1. Conta solo quando ci giochi sopra un’evoluzione Evomax (Evoluzione); non è la Schiusa né il Resta dell’uovo.', 'Toda carta Bebê tem isto desde o nível 1. Só importa quando você joga uma evolução Evomax (Evolução) sobre ela; não é o Chocar nem o Ficar do ovo.', 'Taglay ito ng bawat Baby card mula Level 1. Mahalaga lang ito kapag naglaro ka ng Evomax evolute (Evolute) dito; hindi ito ang Hatch o Stay ng itlog.', 'ஒவ்வொரு குழந்தை அட்டையிலும் நிலை 1 முதல் இது உண்டு. இதன் மேல் Evomax எவல்யூட்டை (எவல்யூட்) விளையாடும்போது மட்டுமே இது முக்கியம்; இது முட்டையின் பொரித்தல் அல்லது தங்குதல் அல்ல.', 'Setiap kartu Bayi memilikinya sejak Level 1. Ini hanya berarti saat kamu memainkan evolute Evomax (Evolute) di atasnya; ini bukan Menetas atau Tinggal milik telur.', '每张幼崽卡从 1 级起都有它。只有把 Evomax 进化体（进化）打在它身上时才有用；它不是蛋的孵化或留下。', '每張幼崽卡從 1 級起都有牠。只有把 Evomax 進化體（進化）打在牠身上時才有用；牠不是蛋的孵化或留下。', 'ベビーカードはすべてレベル1から持っている。Evomaxの進化体（進化）をこの上に出したときだけ意味がある。卵の孵化や留まるとは別物。', '모든 아기 카드가 레벨 1부터 가집니다. Evomax 진화체(진화)를 그 위에 낼 때만 의미가 있으며, 알의 부화나 머무르기와는 다릅니다.']),
]
NODE = ('The Rimeheart Mammoth', {'fr': 'Le Mammouth Cœur-de-Givre', 'de': 'Das Reifherz-Mammut', 'es': 'El Mamut Corazón de Escarcha',
        'zh-Hans': '霜心猛犸', 'zh-Hant': '霜心猛獁', 'ja': '霜心のマンモス'})

def upd(path, rows):
    raw = open(path, encoding='utf-8').read(); d = json.loads(raw)
    d.update(rows)
    ind = 1 if raw.startswith('{\n "') else 2
    open(path, 'w', encoding='utf-8').write(json.dumps(d, ensure_ascii=False, indent=ind) + '\n')

for i, c in enumerate(CODES):
    upd(os.path.join(ROOT, 'lang', c + '.json'), {en: tr[i] for en, tr in TX})
    if c in NODE[1]:
        upd(os.path.join(ROOT, 'lang', 'ui', c + '.json'), {NODE[0]: NODE[1][c]})
print('rows:', len(TX), 'x', len(CODES), '+ node in', len(NODE[1]))
