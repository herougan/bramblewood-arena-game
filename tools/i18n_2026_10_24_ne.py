#!/usr/bin/env python3
"""Game texts added or changed on 2026-10-24 by package NE (owner notes 2026-10-23): the wallet row ("You have"), the Nest's "Locked for
now", Hatchery / Eggs / Younglings, the Nurse note, the Camp pool's Shift hint and copy fan, the empty leather deck slot, the Codex detail's
copies, and two Nest tips. Same rules as tools/i18n_2026_10_24_en5.py: keys are the English as the page translator sees it, every
{placeholder} is kept; a row a pack already has is left as it is. The literal UI rows the package removed from arena_app.js are dropped from
lang/ui (DROP), and "Fill a nest" moves from lang/ui to the main pack (it is a TX text now). Tagalog, Tamil, Japanese and Korean deserve a
native read.
  python3 tools/i18n_2026_10_24_ne.py"""
import json, os, re
ROOT = os.path.join(os.path.dirname(os.path.abspath(__file__)), '..')
CODES = ['fr', 'de', 'es', 'it', 'pt', 'tl', 'ta', 'id', 'zh-Hans', 'zh-Hant', 'ja', 'ko']
T = {
"You have": ["Vous avez", "Du hast", "Tienes", "Hai", "Tens", "Mayroon ka", "உங்களிடம்", "Kamu punya", "你拥有", "你擁有", "所持", "보유"],
"Locked for now": ["Verrouillé pour l’instant", "Vorerst gesperrt", "Bloqueado por ahora", "Bloccato per ora", "Bloqueado por agora", "Nakakandado muna", "இப்போதைக்குப் பூட்டப்பட்டது", "Terkunci untuk sekarang", "暂时锁定", "暫時鎖定", "今はロック中", "지금은 잠겨 있어요"],
"Locked for now — progress further": ["Verrouillé pour l’instant — progressez encore", "Vorerst gesperrt — komm weiter voran", "Bloqueado por ahora — avanza más", "Bloccato per ora — prosegui ancora", "Bloqueado por agora — avança mais", "Nakakandado muna — umusad pa", "இப்போதைக்குப் பூட்டப்பட்டது — மேலும் முன்னேறுங்கள்", "Terkunci untuk sekarang — maju lebih jauh", "暂时锁定——继续推进吧", "暫時鎖定——繼續推進吧", "今はロック中 — さらに進もう", "지금은 잠겨 있어요 — 더 나아가세요"],
"The next one is locked for now.": ["Le suivant est verrouillé pour l’instant.", "Das nächste ist vorerst gesperrt.", "El siguiente está bloqueado por ahora.", "Il prossimo è bloccato per ora.", "O próximo está bloqueado por agora.", "Nakakandado muna ang susunod.", "அடுத்தது இப்போதைக்குப் பூட்டப்பட்டுள்ளது.", "Yang berikutnya terkunci untuk sekarang.", "下一个暂时锁定。", "下一個暫時鎖定。", "次の巣は今はロック中。", "다음 둥지는 지금은 잠겨 있어요."],
"Tap an empty nest to set an egg, or to train a youngling (a fresh hatchling or a Base card) to Level 1 with Kibble. Only the Nest can do that; the Forge takes it from there.": [
  "Touchez un nid vide pour y poser un œuf, ou pour entraîner un petit (un nouveau-né ou une carte de base) au niveau 1 avec des croquettes. Seul le Nid peut le faire ; la Forge prend le relais ensuite.",
  "Tippe auf ein leeres Nest, um ein Ei hineinzulegen oder ein Jungtier (einen frisch Geschlüpften oder eine Basiskarte) mit Futter auf Stufe 1 zu bringen. Nur das Nest kann das; danach übernimmt die Schmiede.",
  "Toca un nido vacío para poner un huevo o para entrenar a una cría (un recién nacido o una carta base) hasta el nivel 1 con pienso. Solo el Nido puede hacerlo; después sigue la Forja.",
  "Tocca un nido vuoto per deporre un uovo o per allenare un cucciolo (un appena nato o una carta base) al livello 1 con le crocchette. Solo il Nido può farlo; poi pensa la Forgia.",
  "Toca num ninho vazio para pôr um ovo ou para treinar uma cria (um recém-nascido ou uma carta base) até ao nível 1 com ração. Só o Ninho o pode fazer; depois segue a Forja.",
  "I-tap ang bakanteng pugad para maglagay ng itlog, o para sanayin ang isang batang hayop (bagong pisa o Base card) hanggang Level 1 gamit ang Kibble. Ang Pugad lang ang makagagawa niyan; ang Pandayan na ang bahala pagkatapos.",
  "முட்டை வைக்க, அல்லது ஒரு குட்டியை (புதிதாகப் பொரித்தது அல்லது அடிப்படை அட்டை) கிபிள் கொண்டு நிலை 1 வரை பயிற்றுவிக்க, காலியான கூட்டைத் தட்டுங்கள். கூடு மட்டுமே அதைச் செய்யும்; அதன் பிறகு உலைக்களம் பார்த்துக்கொள்ளும்.",
  "Ketuk sarang kosong untuk menaruh telur, atau untuk melatih anakan (yang baru menetas atau kartu Dasar) ke Level 1 dengan Kibble. Hanya Sarang yang bisa; setelah itu Tempa yang melanjutkan.",
  "点一个空巢来放蛋，或用狗粮把一只幼崽（刚孵出的或基础卡）训练到 1 级。只有巢能做到；之后交给锻炉。",
  "點一個空巢來放蛋，或用狗糧把一隻幼崽（剛孵出的或基礎卡）訓練到 1 級。只有巢能做到；之後交給鍛爐。",
  "空いた巣をタップして卵を置くか、キブルで幼獣（生まれたてか基本カード）をレベル1まで育てよう。それができるのは巣だけ。その先は鍛冶場の出番。",
  "빈 둥지를 눌러 알을 두거나, 키블로 새끼(갓 부화한 카드나 기본 카드)를 레벨 1까지 훈련하세요. 그건 둥지만 할 수 있어요. 그다음은 대장간이 맡아요."],
"A new Nurse master speeds what you set in a nest from then on; what is already growing keeps its time.": [
  "Un nouveau maître nourricier accélère ce que vous placez ensuite dans un nid ; ce qui grandit déjà garde son temps.",
  "Ein neuer Pflegemeister beschleunigt, was du ab dann ins Nest legst; was schon wächst, behält seine Zeit.",
  "Un nuevo maestro cuidador acelera lo que pongas en un nido a partir de entonces; lo que ya crece conserva su tiempo.",
  "Un nuovo maestro balia accelera ciò che metti in un nido da quel momento; ciò che sta già crescendo mantiene il suo tempo.",
  "Um novo mestre ama acelera o que puseres num ninho a partir daí; o que já está a crescer mantém o seu tempo.",
  "Pinabibilis ng bagong Nurse master ang ilalagay mo sa pugad mula noon; ang lumalaki na ay mananatili sa oras nito.",
  "புதிய செவிலி மாஸ்டர் அதன் பிறகு கூட்டில் நீங்கள் வைப்பதை வேகப்படுத்தும்; ஏற்கனவே வளர்வது தன் நேரத்தையே வைத்திருக்கும்.",
  "Master Perawat baru mempercepat apa yang kamu taruh di sarang sejak saat itu; yang sudah tumbuh tetap pada waktunya.",
  "新的保育大师只加快之后放进巢里的东西；已经在生长的保持原来的时间。",
  "新的保育大師只加快之後放進巢裡的東西；已經在生長的保持原來的時間。",
  "新しいナースマスターが速めるのは、その後に巣へ置いたものだけ。すでに育っているものは時間がそのまま。",
  "새 보육 마스터는 그 뒤에 둥지에 둔 것만 빠르게 해요. 이미 자라는 것은 시간이 그대로예요."],
"Hatchery": ["Couvoir", "Brutstätte", "Criadero", "Incubatoio", "Incubadora", "Pisaan", "குஞ்சுப்பண்ணை", "Penetasan", "孵化场", "孵化場", "孵化場", "부화장"],
"Fill a nest": ["Remplir un nid", "Ein Nest füllen", "Llenar un nido", "Riempi un nido", "Encher um ninho", "Punuin ang pugad", "ஒரு கூட்டை நிரப்புங்கள்", "Isi sarang", "填满一个巢", "填滿一個巢", "巣を埋める", "둥지 채우기"],
"Eggs": ["Œufs", "Eier", "Huevos", "Uova", "Ovos", "Mga itlog", "முட்டைகள்", "Telur", "蛋", "蛋", "卵", "알"],
"Younglings": ["Petits", "Jungtiere", "Crías", "Cuccioli", "Crias", "Mga batang hayop", "குட்டிகள்", "Anakan", "幼崽", "幼崽", "幼獣", "새끼들"],
"Tap a youngling to train it to Level 1 in this nest. It takes {h}h.": [
  "Touchez un petit pour l’entraîner au niveau 1 dans ce nid. Il faut {h} h.", "Tippe auf ein Jungtier, um es in diesem Nest auf Stufe 1 zu bringen. Das dauert {h} Std.",
  "Toca una cría para entrenarla hasta el nivel 1 en este nido. Tarda {h} h.", "Tocca un cucciolo per allenarlo al livello 1 in questo nido. Ci vogliono {h} h.",
  "Toca numa cria para a treinar até ao nível 1 neste ninho. Demora {h} h.", "I-tap ang batang hayop para sanayin ito hanggang Level 1 sa pugad na ito. Aabutin ng {h} oras.",
  "இந்தக் கூட்டில் ஒரு குட்டியை நிலை 1 வரை பயிற்றுவிக்க அதைத் தட்டுங்கள். {h} மணி நேரம் ஆகும்.", "Ketuk anakan untuk melatihnya ke Level 1 di sarang ini. Butuh {h} jam.",
  "点一只幼崽，在这个巢里把它训练到 1 级。需要 {h} 小时。", "點一隻幼崽，在這個巢裡把它訓練到 1 級。需要 {h} 小時。",
  "幼獣をタップして、この巣でレベル1まで育てよう。{h}時間かかる。", "새끼를 눌러 이 둥지에서 레벨 1까지 훈련하세요. {h}시간 걸려요."],
"No younglings right now. Fresh hatchlings, Base cards and new faction cards wait here until a nest trains them.": [
  "Aucun petit pour l’instant. Les nouveau-nés, les cartes de base et les nouvelles cartes de faction attendent ici qu’un nid les entraîne.",
  "Gerade keine Jungtiere. Frisch Geschlüpfte, Basiskarten und neue Fraktionskarten warten hier, bis ein Nest sie trainiert.",
  "No hay crías ahora. Los recién nacidos, las cartas base y las nuevas cartas de facción esperan aquí a que un nido las entrene.",
  "Nessun cucciolo per ora. Gli appena nati, le carte base e le nuove carte di fazione aspettano qui che un nido le alleni.",
  "Nenhuma cria por agora. Os recém-nascidos, as cartas base e as novas cartas de fação esperam aqui que um ninho as treine.",
  "Walang batang hayop sa ngayon. Naghihintay dito ang mga bagong pisa, Base card at bagong faction card hanggang sanayin sila ng pugad.",
  "இப்போது குட்டிகள் இல்லை. புதிதாகப் பொரித்தவை, அடிப்படை அட்டைகள், புதிய அணி அட்டைகள் ஒரு கூடு பயிற்றுவிக்கும் வரை இங்கே காத்திருக்கும்.",
  "Belum ada anakan. Yang baru menetas, kartu Dasar dan kartu faksi baru menunggu di sini sampai sarang melatihnya.",
  "现在没有幼崽。刚孵出的、基础卡和新的阵营卡会在这里等巢来训练。", "現在沒有幼崽。剛孵出的、基礎卡和新的陣營卡會在這裡等巢來訓練。",
  "今は幼獣がいない。生まれたて、基本カード、新しい陣営カードは巣が育てるまでここで待つ。", "지금은 새끼가 없어요. 갓 부화한 카드, 기본 카드, 새 진영 카드는 둥지가 훈련할 때까지 여기서 기다려요."],
"In your deck": ["Dans votre deck", "In deinem Deck", "En tu mazo", "Nel tuo mazzo", "No teu baralho", "Nasa deck mo", "உங்கள் டெக்கில்", "Di dekmu", "在你的卡组里", "在你的牌組裡", "デッキに入っている", "덱에 있어요"],
"Alt art on a plain copy": ["Art alternatif sur un exemplaire simple", "Alternatives Artwork auf einem einfachen Exemplar", "Arte alternativo en una copia normal", "Arte alternativa su una copia semplice", "Arte alternativa numa cópia simples", "Ibang art sa isang karaniwang kopya", "சாதாரண நகலில் மாற்று ஓவியம்", "Seni alternatif di salinan biasa", "普通副本上的异画", "普通副本上的異畫", "通常のカードに着せる別イラスト", "일반 카드에 입히는 다른 그림"],
"Click a copy to put exactly that one in": ["Cliquez un exemplaire pour mettre exactement celui-là", "Klicke ein Exemplar, um genau dieses hineinzulegen", "Haz clic en una copia para meter justo esa", "Clicca una copia per inserire proprio quella", "Clica numa cópia para pôr exatamente essa", "I-click ang isang kopya para iyon mismo ang ilagay", "சரியாக அந்த நகலையே சேர்க்க அதைச் சொடுக்குங்கள்", "Klik salinan untuk memasukkan yang itu saja", "点一张副本，正好放进那一张", "點一張副本，正好放進那一張", "コピーをクリックすると、そのカードがそのまま入る", "카드를 눌러 바로 그 카드를 넣으세요"],
"{name}: your copies": ["{name} : vos exemplaires", "{name}: deine Exemplare", "{name}: tus copias", "{name}: le tue copie", "{name}: as tuas cópias", "{name}: ang mga kopya mo", "{name}: உங்கள் நகல்கள்", "{name}: salinanmu", "{name}：你的副本", "{name}：你的副本", "{name}：所持しているカード", "{name}: 보유한 카드"],
"Hold Shift: copy limits": ["Maintenez Maj : limites d’exemplaires", "Umschalt halten: Exemplar-Grenzen", "Mantén Mayús: límites de copias", "Tieni premuto Maiusc: limiti di copie", "Mantém Shift: limites de cópias", "Pindutin ang Shift: hangganan ng kopya", "Shift-ஐ அழுத்திப் பிடி: நகல் வரம்புகள்", "Tahan Shift: batas salinan", "按住 Shift：张数上限", "按住 Shift：張數上限", "Shiftを押す：枚数の上限", "Shift 누르기: 장수 제한"],
"Hold Shift (or tap this) to see how many of each card your deck holds and may hold.": [
  "Maintenez Maj (ou touchez ici) pour voir combien d’exemplaires de chaque carte votre deck contient et peut contenir.",
  "Halte Umschalt (oder tippe hier), um zu sehen, wie viele von jeder Karte dein Deck hat und haben darf.",
  "Mantén Mayús (o toca aquí) para ver cuántas copias de cada carta tiene tu mazo y cuántas puede tener.",
  "Tieni premuto Maiusc (o tocca qui) per vedere quante copie di ogni carta ha il tuo mazzo e quante ne può avere.",
  "Mantém Shift (ou toca aqui) para ver quantas cópias de cada carta o teu baralho tem e pode ter.",
  "Pindutin ang Shift (o i-tap ito) para makita kung ilan sa bawat card ang hawak at puwedeng hawakan ng deck mo.",
  "ஒவ்வொரு அட்டையிலும் உங்கள் டெக்கில் எத்தனை உள்ளன, எத்தனை இருக்கலாம் என்பதைப் பார்க்க Shift-ஐ அழுத்திப் பிடியுங்கள் (அல்லது இதைத் தட்டுங்கள்).",
  "Tahan Shift (atau ketuk ini) untuk melihat berapa banyak tiap kartu di dekmu dan berapa yang boleh.",
  "按住 Shift（或点这里）查看你的卡组每张卡有几张、最多能放几张。", "按住 Shift（或點這裡）查看你的牌組每張卡有幾張、最多能放幾張。",
  "Shiftを押す（またはここをタップ）と、デッキに各カードが何枚入っていて何枚まで入るかが見える。", "Shift를 누르면(또는 여기를 누르면) 덱에 카드마다 몇 장이 있고 몇 장까지 넣을 수 있는지 보여요."],
"Empty deck slot": ["Emplacement de deck vide", "Leerer Deckplatz", "Hueco de mazo vacío", "Slot del mazzo vuoto", "Espaço de baralho vazio", "Bakanteng puwang ng deck", "காலியான டெக் இடம்", "Slot dek kosong", "空的卡组栏位", "空的牌組欄位", "空きデッキ枠", "빈 덱 슬롯"],
"Tap to build a deck here": ["Touchez pour construire un deck ici", "Tippe, um hier ein Deck zu bauen", "Toca para crear un mazo aquí", "Tocca per creare un mazzo qui", "Toca para criar um baralho aqui", "I-tap para bumuo ng deck dito", "இங்கே ஒரு டெக் உருவாக்கத் தட்டுங்கள்", "Ketuk untuk membuat dek di sini", "点这里组一副卡组", "點這裡組一副牌組", "タップしてここにデッキを作る", "눌러서 여기에 덱 만들기"],
"Your copies ({n})": ["Vos exemplaires ({n})", "Deine Exemplare ({n})", "Tus copias ({n})", "Le tue copie ({n})", "As tuas cópias ({n})", "Ang mga kopya mo ({n})", "உங்கள் நகல்கள் ({n})", "Salinanmu ({n})", "你的副本（{n}）", "你的副本（{n}）", "所持しているカード（{n}）", "보유한 카드 ({n})"],
"Tap a copy to see its level": ["Touchez un exemplaire pour voir son niveau", "Tippe ein Exemplar an, um seine Stufe zu sehen", "Toca una copia para ver su nivel", "Tocca una copia per vederne il livello", "Toca numa cópia para ver o seu nível", "I-tap ang kopya para makita ang level nito", "நிலையைப் பார்க்க ஒரு நகலைத் தட்டுங்கள்", "Ketuk salinan untuk melihat levelnya", "点一张副本看它的等级", "點一張副本看它的等級", "カードをタップするとレベルが見える", "카드를 눌러 레벨을 보세요"],
}
# literal UI text in arena_app.js (lang/ui)
UI = {
"🥚 Eggs and babies grow in the nests. Tap an empty nest to set one, or to train a youngling.": [
  "🥚 Les œufs et les bébés grandissent dans les nids. Touchez un nid vide pour en poser un, ou pour entraîner un petit.",
  "🥚 Eier und Junge wachsen in den Nestern. Tippe auf ein leeres Nest, um eins hineinzulegen oder ein Jungtier zu trainieren.",
  "🥚 Los huevos y las crías crecen en los nidos. Toca un nido vacío para poner uno o para entrenar a una cría.",
  "🥚 Uova e piccoli crescono nei nidi. Tocca un nido vuoto per deporne uno o per allenare un cucciolo.",
  "🥚 Os ovos e as crias crescem nos ninhos. Toca num ninho vazio para pôr um ou para treinar uma cria.",
  "🥚 Lumalaki ang mga itlog at sanggol sa mga pugad. I-tap ang bakanteng pugad para maglagay ng isa, o para sanayin ang isang batang hayop.",
  "🥚 முட்டைகளும் குட்டிகளும் கூடுகளில் வளரும். ஒன்றை வைக்க, அல்லது ஒரு குட்டியைப் பயிற்றுவிக்க, காலியான கூட்டைத் தட்டுங்கள்.",
  "🥚 Telur dan bayi tumbuh di sarang. Ketuk sarang kosong untuk menaruh satu, atau untuk melatih anakan.",
  "🥚 蛋和幼崽在巢里长大。点一个空巢放一个进去，或训练一只幼崽。", "🥚 蛋和幼崽在巢裡長大。點一個空巢放一個進去，或訓練一隻幼崽。",
  "🥚 卵と赤ちゃんは巣で育つ。空いた巣をタップして置くか、幼獣を育てよう。", "🥚 알과 아기는 둥지에서 자라요. 빈 둥지를 눌러 하나를 두거나 새끼를 훈련하세요."],
"🦴 A nest and some Kibble train a youngling to Level 1. The Forge takes it from there.": [
  "🦴 Un nid et quelques croquettes entraînent un petit au niveau 1. La Forge prend le relais.",
  "🦴 Ein Nest und etwas Futter bringen ein Jungtier auf Stufe 1. Danach übernimmt die Schmiede.",
  "🦴 Un nido y algo de pienso entrenan a una cría hasta el nivel 1. Después sigue la Forja.",
  "🦴 Un nido e qualche crocchetta allenano un cucciolo al livello 1. Poi pensa la Forgia.",
  "🦴 Um ninho e alguma ração treinam uma cria até ao nível 1. Depois segue a Forja.",
  "🦴 Sinasanay ng isang pugad at kaunting Kibble ang batang hayop hanggang Level 1. Ang Pandayan na ang bahala pagkatapos.",
  "🦴 ஒரு கூடும் கொஞ்சம் கிபிளும் ஒரு குட்டியை நிலை 1 வரை பயிற்றுவிக்கும். அதன் பிறகு உலைக்களம் பார்த்துக்கொள்ளும்.",
  "🦴 Sarang dan sedikit Kibble melatih anakan ke Level 1. Setelah itu Tempa yang melanjutkan.",
  "🦴 一个巢加一点狗粮就能把幼崽训练到 1 级。之后交给锻炉。", "🦴 一個巢加一點狗糧就能把幼崽訓練到 1 級。之後交給鍛爐。",
  "🦴 巣とキブルで幼獣をレベル1に育てる。その先は鍛冶場の出番。", "🦴 둥지와 키블로 새끼를 레벨 1까지 훈련해요. 그다음은 대장간이 맡아요."],
}
DROP = ["(dresses one plain copy)", "A nest that opens on Map {v1}", "A nest that {v1}", "Eggs in your pack", "Every plain copy is in", "Fill a nest",
        "No Level-0 cards to nurture. Your Base cards start at Level 0.", "Opens on Map {v1}{v2}, then it can be built",
        "Stack foil and other finishes together, or show each finish as its own stack", "The next one opens on Map {v1}.",
        "Train a Level-0 card to Level 1", "{v1}, then it can be built", "{v1}h · tap a card · you have 🦴{v2}",
        "🥚 Eggs and babies grow in the nests. Level 0 cards wait under 🌱 Level 0.", "🦴 A nest and some Kibble train a Level 0 card to Level 1. The Forge takes it from there.",
        "🔍 Tap a card to see it up close and spin it in the light.", "🃏 A taller stack means more copies of that card."]
for D in (T, UI): assert all(len(v) == len(CODES) for v in D.values()), [k for k, v in D.items() if len(v) != len(CODES)]
ph = lambda s: sorted(set(re.findall(r'\{\w+\}', s)))
for D in (T, UI): assert all(ph(k) == ph(t) for k, v in D.items() for t in v), [(k, t) for k, v in D.items() for t in v if ph(k) != ph(t)]
def dump(path, d):
    with open(path, 'w', encoding='utf-8') as fh:
        json.dump(d, fh, ensure_ascii=False, indent=1); fh.write('\n')
app = open(os.path.join(ROOT, 'arena_app.js'), encoding='utf-8').read()
for i, code in enumerate(CODES):
    path = os.path.join(ROOT, 'lang', code + '.json'); ui = os.path.join(ROOT, 'lang', 'ui', code + '.json')
    pack = json.load(open(path, encoding='utf-8')); uipack = json.load(open(ui, encoding='utf-8'))
    for k in DROP:
        if k in app and k not in T: continue  # still in the source: keep it
        uipack.pop(k, None)
    for en, row in T.items():
        if en not in pack: pack[en] = row[i]
    for en, row in UI.items():
        if en not in uipack and en not in pack: uipack[en] = row[i]
    dump(path, pack); dump(ui, uipack)
print('wrote', len(CODES), 'packs:', len(T), 'texts,', len(UI), 'UI rows; dropped', len(DROP), 'old UI rows')
