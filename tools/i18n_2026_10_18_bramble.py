#!/usr/bin/env python3
"""Castle -> bramble in the language packs (2026-10-18, owner: "Call it bramble now, not castle, officially").

The base each side defends is the bramble in every text players read. The packs are keyed by the English text, so each
English line whose "castle" became "bramble" gets its key renamed here and its translation reworded with one word per
language for the base (kept masculine where the old word was, so the articles still agree):
    fr roncier · de Dornenhecke · es zarzal · it rovo · pt silvado · tl dawag · ta முட்புதர் · id semak
    zh-Hans 荆棘丛 · zh-Hant 荊棘叢 · ja いばら · ko 덤불
Also adds "Bramble" (the dungeon chip, the Bramble labels and the Bramble rank tier) and rewords de/tl "Brambles".
Safe to run again: an old key is dropped only when its renamed key is written.

    python3 tools/i18n_2026_10_18_bramble.py && python3 tools/i18n_refresh.py
"""
import json, os
ROOT = os.path.join(os.path.dirname(os.path.abspath(__file__)), '..')
CODES = ["fr", "de", "es", "it", "pt", "tl", "ta", "id", "zh-Hans", "zh-Hant", "ja", "ko"]
# new English key -> the old English key it replaces
RENAME = {
 "A new bramble in the pack": "A new castle in the pack",
 "A new bramble rises": "A new castle rises",
 "A spare bramble": "A spare castle",
 "A win by a thread. Ranks grade the bramble Health you keep: lose less of it for a better rank.": "A win by a thread. Ranks grade the castle Health you keep: lose less of it for a better rank.",
 "Barely a scratch on your bramble. Take no damage at all for SS.": "Barely a scratch on your castle. Take no damage at all for SS.",
 "Cards hit the card in front of them. No card in front? They hit the Bramble.": "Cards hit the card in front of them. No card in front? They hit the Castle.",
 "Bramble HP, starting hand, decks, the rival's name and every guided-step message. Publishes live for new players.": "Castle HP, starting hand, decks, the rival's name and every guided-step message. Publishes live for new players.",
 "Draft a woodland warband. Outwit your foe, lane by lane. Burn their bramble to the ground.": "Draft a woodland warband. Outwit your foe, lane by lane. Burn their castle to the ground.",
 "Each card strikes the one across from it; an empty lane hits the bramble.": "Each card strikes the one across from it; an empty lane hits the castle.",
 "From turn 20 it’s sudden death: any hit kills, and any bramble hit ends it.": "From turn 20 it’s sudden death: any hit kills, and any castle hit ends it.",
 "Fuse it in the Forge (Brambles) to bank progress toward its next levels": "Fuse it in the Forge (Castles) to bank progress toward its next levels",
 "Fused {n} spare bramble{s}: ✨ {dust} of credit.": "Fused {n} spare castle{s}: ✨ {dust} of credit.",
 "Insanity is playing the same deck and expecting a different bramble.": "Insanity is playing the same deck and expecting a different castle.",
 "Not one point of damage on your bramble.": "Not one point of damage on your castle.",
 "Play cards, attack, and chip away at the enemy Bramble. New ideas get explained as you meet them in the skirmishes.": "Play cards, attack, and chip away at the enemy Castle. New ideas get explained as you meet them in the skirmishes.",
 "Summon your leader when you can afford it, and read the enemy bramble: it has a passive of its own.": "Summon your leader when you can afford it, and read the enemy castle: it has a passive of its own.",
 "The enemy Bramble. Break it to win.": "The enemy Castle. Break it to win.",
 "The less health your Bramble loses, the higher your rank. Some card rewards only unlock at rank S.": "The less health your Castle loses, the higher your rank. Some card rewards only unlock at rank S.",
 "Their bramble has a passive of its own.": "Their castle has a passive of its own.",
 "This bramble has a Shield: hits break it first, then its Health.": "This castle has a Shield: hits break it first, then its Health.",
 "Well fought. Keep 90% of your bramble and it becomes S.": "Well fought. Keep 90% of your castle and it becomes S.",
 "You look like you need help. I watched that first fight from the hedge: good instincts, thin ranks, and the next bramble is sturdier. A road's safer walked by two, and I owe this valley a favour or two. I'm with you now: call me onto the field when you need me.": "You look like you need help. I watched that first fight from the hedge: good instincts, thin ranks, and the next castle is sturdier. A road's safer walked by two, and I owe this valley a favour or two. I'm with you now: call me onto the field when you need me.",
 "Your bramble is already at full Health.": "Your castle is already at full Health.",
 "Your leader, the sky, and bramble passives": "Your leader, the sky, and castle passives"
}
# new English key -> {code: translation}
T = {
 "A new bramble in the pack": {
  "fr": "Un nouveau roncier dans le paquet",
  "de": "Eine neue Dornenhecke im Pack",
  "es": "Un zarzal nuevo en el sobre",
  "it": "Un nuovo rovo nella bustina",
  "pt": "Um silvado novo no pacote",
  "tl": "Bagong dawag sa pack",
  "ta": "பொதியில் ஒரு புதிய முட்புதர்",
  "id": "Semak baru di paket",
  "zh-Hans": "卡包里有一片新荆棘丛",
  "zh-Hant": "卡包裡有一片新荊棘叢",
  "ja": "パックに新たないばら",
  "ko": "팩에 새 덤불"
 },
 "A new bramble rises": {
  "fr": "Un nouveau roncier se dresse",
  "de": "Eine neue Dornenhecke erhebt sich",
  "es": "Se alza un nuevo zarzal",
  "it": "Sorge un nuovo rovo",
  "pt": "Ergue-se um novo silvado",
  "tl": "May bagong dawag na tumayo",
  "ta": "புதிய முட்புதர் எழுகிறது",
  "id": "Semak baru tumbuh",
  "zh-Hans": "新的荆棘丛拔地而起",
  "zh-Hant": "新的荊棘叢拔地而起",
  "ja": "新たないばらがそびえる",
  "ko": "새 덤불이 솟아오른다"
 },
 "A spare bramble": {
  "fr": "Un roncier en trop",
  "de": "Eine Ersatz-Dornenhecke",
  "es": "Un zarzal de sobra",
  "it": "Un rovo in più",
  "pt": "Um silvado a mais",
  "tl": "Sobrang dawag",
  "ta": "ஒரு கூடுதல் முட்புதர்",
  "id": "Semak cadangan",
  "zh-Hans": "一片多余的荆棘丛",
  "zh-Hant": "一片多餘的荊棘叢",
  "ja": "予備のいばら",
  "ko": "여분의 덤불"
 },
 "A win by a thread. Ranks grade the bramble Health you keep: lose less of it for a better rank.": {
  "fr": "Une victoire de justesse. Le rang note la Santé de roncier conservée : perdez-en moins pour un meilleur rang.",
  "de": "Ein Sieg um Haaresbreite. Der Rang bewertet das Leben, das deiner Dornenhecke bleibt: Verlier weniger davon für einen besseren Rang.",
  "es": "Una victoria por los pelos. El rango valora la Salud del zarzal que conservas: pierde menos para un rango mejor.",
  "it": "Una vittoria per un soffio. Il grado valuta la Salute del rovo che ti resta: perdine meno per un grado migliore.",
  "pt": "Uma vitória à justa. O rank avalia a Vida do silvado que manténs: perde menos para um rank melhor.",
  "tl": "Panalong halos hindi umabot. Ang ranggo ay batay sa natirang Buhay ng dawag mo: mas kaunti ang mawala, mas mataas ang ranggo.",
  "ta": "மயிரிழையில் வெற்றி. தரம் நீங்கள் காக்கும் முட்புதர் உயிரை மதிப்பிடும்: குறைவாக இழந்தால் சிறந்த தரம்.",
  "id": "Menang tipis. Peringkat menilai Nyawa semak yang tersisa: kehilangan lebih sedikit untuk peringkat lebih baik.",
  "zh-Hans": "险胜。评级看你保住的荆棘丛生命：损失越少，评级越好。",
  "zh-Hant": "險勝。評級看你保住的荊棘叢生命：損失越少，評級越好。",
  "ja": "辛勝です。ランクは残ったいばらの体力で決まります。減らさないほど高ランク。",
  "ko": "아슬아슬한 승리예요. 랭크는 지켜 낸 덤불 체력으로 매겨져요. 덜 잃을수록 좋은 랭크예요."
 },
 "Barely a scratch on your bramble. Take no damage at all for SS.": {
  "fr": "À peine une égratignure sur votre roncier. Ne subissez aucun dégât pour SS.",
  "de": "Kaum ein Kratzer an deiner Dornenhecke. Nimm gar keinen Schaden für SS.",
  "es": "Apenas un rasguño en tu zarzal. No recibas ningún daño para SS.",
  "it": "Appena un graffio sul rovo. Non subire alcun danno per SS.",
  "pt": "Mal se nota um arranhão no teu silvado. Não sofras dano nenhum para SS.",
  "tl": "Halos walang gasgas ang dawag mo. Huwag tamaan kahit kaunti para sa SS.",
  "ta": "முட்புதரில் ஒரு கீறல்கூட இல்லை. SS க்கு எந்தச் சேதமும் படாதீர்கள்.",
  "id": "Semakmu nyaris tak tergores. Jangan terima kerusakan sama sekali untuk SS.",
  "zh-Hans": "荆棘丛几乎毫发无损。完全不受伤就是 SS。",
  "zh-Hant": "荊棘叢幾乎毫髮無損。完全不受傷就是 SS。",
  "ja": "いばらにはかすり傷程度。ノーダメージならSSです。",
  "ko": "덤불에 거의 흠집도 없어요. 피해를 전혀 받지 않으면 SS예요."
 },
 "Cards hit the card in front of them. No card in front? They hit the Bramble.": {
  "fr": "Les cartes frappent celle qui leur fait face. Personne en face ? Elles frappent le Roncier.",
  "de": "Karten treffen die Karte vor ihnen. Keine Karte davor? Dann treffen sie die Dornenhecke.",
  "es": "Las cartas golpean a la carta de enfrente. ¿No hay ninguna? Golpean el Zarzal.",
  "it": "Le carte colpiscono quella che hanno di fronte. Nessuna davanti? Colpiscono il Rovo.",
  "pt": "As cartas atacam a carta à sua frente. Não há nenhuma? Atacam o Silvado.",
  "tl": "Tinatamaan ng card ang card na nasa harap nito. Walang card sa harap? Ang Dawag ang tatamaan.",
  "ta": "அட்டைகள் தங்கள் முன் உள்ள அட்டையைத் தாக்கும். முன்னால் அட்டை இல்லையா? முட்புதரைத் தாக்கும்.",
  "id": "Kartu menyerang kartu di depannya. Tidak ada kartu di depan? Mereka menyerang Semak.",
  "zh-Hans": "卡牌攻击正对面的卡牌。对面没有卡？那就攻击荆棘丛。",
  "zh-Hant": "卡牌攻擊正對面的卡牌。對面沒有卡？那就攻擊荊棘叢。",
  "ja": "カードは正面のカードを攻撃します。正面にいなければいばらを攻撃します。",
  "ko": "카드는 정면의 카드를 쳐요. 정면에 카드가 없으면 덤불을 쳐요."
 },
 "Bramble HP, starting hand, decks, the rival's name and every guided-step message. Publishes live for new players.": {
  "fr": "PV du roncier, main de départ, decks, nom du rival et chaque message guidé. Publié en direct pour les nouveaux joueurs.",
  "de": "Dornenhecken-LP, Starthand, Decks, Name des Rivalen und jede Anleitungsnachricht. Wird live für neue Spieler veröffentlicht.",
  "es": "PV del zarzal, mano inicial, mazos, nombre del rival y cada mensaje guiado. Se publica en vivo para jugadores nuevos.",
  "it": "PS del rovo, mano iniziale, mazzi, nome del rivale e ogni messaggio guidato. Pubblicato dal vivo per i nuovi giocatori.",
  "pt": "PV do silvado, mão inicial, decks, nome do rival e cada mensagem guiada. Publicado ao vivo para novos jogadores.",
  "tl": "HP ng dawag, panimulang kamay, mga deck, pangalan ng karibal at bawat mensahe ng gabay. Agad na inilalathala para sa mga bagong manlalaro.",
  "ta": "முட்புதர் HP, தொடக்கக் கை, டெக்குகள், போட்டியாளரின் பெயர் மற்றும் ஒவ்வொரு வழிகாட்டல் படிச் செய்தியும். புதிய வீரர்களுக்கு உடனடியாக வெளியிடப்படும்.",
  "id": "HP semak, kartu awal, dek, nama rival, dan setiap pesan panduan. Langsung terbit untuk pemain baru.",
  "zh-Hans": "荆棘丛生命值、起手牌、卡组、对手名字以及每条引导步骤消息。对新玩家实时发布。",
  "zh-Hant": "荊棘叢生命值、起手牌、牌組、對手名字以及每則引導步驟訊息。對新玩家即時發布。",
  "ja": "いばらのHP、初期手札、デッキ、ライバルの名前、各ガイドステップのメッセージ。新規プレイヤーに即時公開されます。",
  "ko": "덤불 HP, 시작 손패, 덱, 라이벌 이름, 모든 안내 단계 메시지. 신규 플레이어에게 즉시 게시됩니다."
 },
 "Draft a woodland warband. Outwit your foe, lane by lane. Burn their bramble to the ground.": {
  "fr": "Recrute une troupe sylvestre. Déjoue ton ennemi, couloir par couloir. Réduis son roncier en cendres.",
  "de": "Stell eine Waldkriegerschar auf. Überliste deinen Gegner, Bahn um Bahn. Brenn seine Dornenhecke nieder.",
  "es": "Recluta una banda del bosque. Supera a tu rival, carril a carril. Reduce su zarzal a cenizas.",
  "it": "Recluta una banda del bosco. Supera il nemico, corsia dopo corsia. Rada al suolo il suo rovo.",
  "pt": "Monte um bando da floresta. Supere seu inimigo, pista a pista. Reduza o silvado dele a cinzas.",
  "tl": "Bumuo ng pangkat-mandirigma ng kagubatan. Talunin sa talino ang kalaban, linya kada linya. Sunugin ang kanilang dawag hanggang maabo.",
  "ta": "ஒரு காட்டுப் போர்ப்படையைத் திரட்டு. ஒவ்வொரு பாதையிலும் எதிரியை மதியால் வெல். அவர்களின் முட்புதரைத் தரைமட்டமாக எரி.",
  "id": "Rekrut pasukan hutan. Kalahkan lawan, jalur demi jalur. Bakar semak mereka hingga rata.",
  "zh-Hans": "组建林地战团。逐条战线智胜对手。将敌方荆棘丛烧成平地。",
  "zh-Hant": "組建林地戰團。逐條戰線智取對手。將敵方荊棘叢燒成平地。",
  "ja": "森の戦隊を編成せよ。レーンごとに敵を出し抜き、そのいばらを焼き払え。",
  "ko": "숲의 전투단을 꾸리세요. 레인마다 적의 허를 찌르고, 적의 덤불을 불태우세요."
 },
 "Each card strikes the one across from it; an empty lane hits the bramble.": {
  "fr": "Chaque carte frappe celle d’en face ; une voie vide touche le roncier.",
  "de": "Jede Karte trifft die gegenüber; eine leere Bahn trifft die Dornenhecke.",
  "es": "Cada carta golpea a la de enfrente; un carril vacío golpea el zarzal.",
  "it": "Ogni carta colpisce quella di fronte; una corsia vuota colpisce il rovo.",
  "pt": "Cada carta ataca a da frente; uma faixa vazia atinge o silvado.",
  "tl": "Tinatamaan ng bawat kard ang kaharap nito; kung walang laman, ang dawag.",
  "ta": "ஒவ்வொரு அட்டையும் எதிரில் உள்ளதைத் தாக்கும்; காலியாக இருந்தால் முட்புதரை.",
  "id": "Tiap kartu menyerang lawan di depannya; jalur kosong mengenai semak.",
  "zh-Hans": "每张卡攻击对面的卡；对面空着就打荆棘丛。",
  "zh-Hant": "每張卡攻擊對面的卡；對面空著就打荊棘叢。",
  "ja": "カードは向かいのカードを攻撃。向かいが空ならいばらを攻撃。",
  "ko": "카드는 맞은편 카드를 공격하고, 빈 칸이면 덤불을 쳐요."
 },
 "From turn 20 it’s sudden death: any hit kills, and any bramble hit ends it.": {
  "fr": "Dès le tour 20, c’est la mort subite : tout coup tue, et toucher un roncier met fin à la partie.",
  "de": "Ab Runde 20 gilt Sudden Death: Jeder Treffer tötet, jeder Heckentreffer beendet das Spiel.",
  "es": "Desde el turno 20 es muerte súbita: cualquier golpe mata y golpear un zarzal termina la partida.",
  "it": "Dal turno 20 è morte improvvisa: ogni colpo uccide e colpire un rovo chiude la partita.",
  "pt": "A partir do turno 20 é morte súbita: qualquer golpe mata e atingir um silvado termina a partida.",
  "tl": "Mula turn 20, sudden death na: bawat tama ay pumapatay, at tapos na kapag natamaan ang dawag.",
  "ta": "20ஆம் சுற்றிலிருந்து திடீர் மரணம்: எந்த அடியும் கொல்லும், முட்புதர் அடிபட்டால் முடியும்.",
  "id": "Mulai giliran 20 berlaku mati mendadak: tiap serangan membunuh, serangan ke semak mengakhiri laga.",
  "zh-Hans": "从第 20 回合起进入骤死：任何攻击都致命，击中荆棘丛即结束。",
  "zh-Hant": "從第 20 回合起進入驟死：任何攻擊都致命，擊中荊棘叢即結束。",
  "ja": "20ターン目からサドンデス：どの攻撃も一撃、いばらに当たれば決着。",
  "ko": "20턴부터 서든 데스: 모든 공격이 치명적이고, 덤불을 맞히면 끝나요."
 },
 "Fuse it in the Forge (Brambles) to bank progress toward its next levels": {
  "fr": "Fusionnez-le à la Forge (Ronciers) pour cumuler des progrès vers ses niveaux suivants",
  "de": "Verschmilz es in der Schmiede (Dornenhecken), um Fortschritt für die nächsten Stufen anzusparen",
  "es": "Fusiónalo en la Forja (Zarzales) para acumular progreso hacia sus próximos niveles",
  "it": "Fondilo nella Fucina (Rovi) per accumulare progressi verso i livelli successivi",
  "pt": "Funde-o na Forja (Silvados) para acumular progresso para os próximos níveis",
  "tl": "I-fuse ito sa Pandayan (Mga Dawag) para mag-ipon ng progreso sa susunod na mga level",
  "ta": "அடுத்த நிலைகளுக்கான முன்னேற்றத்தைச் சேமிக்க உலையில் (முட்புதர்கள்) இணையுங்கள்",
  "id": "Lebur di Tempa (Semak) untuk menabung progres ke level berikutnya",
  "zh-Hans": "在锻造（荆棘丛）里融合它，为下一级积攒进度",
  "zh-Hant": "在鍛造（荊棘叢）裡融合它，為下一級累積進度",
  "ja": "鍛冶（いばら）で合成すると、次のレベルへの進捗を貯められます",
  "ko": "대장간(덤불)에서 융합하면 다음 레벨을 향한 진행도가 쌓여요"
 },
 "Fused {n} spare bramble{s}: ✨ {dust} of credit.": {
  "fr": "Ronciers en trop fusionnés : {n} — ✨ {dust} de crédit.",
  "de": "Überzählige Dornenhecken verschmolzen: {n} — ✨ {dust} Guthaben.",
  "es": "Zarzales sobrantes fusionados: {n} — ✨ {dust} de crédito.",
  "it": "Rovi in più fusi: {n} — ✨ {dust} di credito.",
  "pt": "{n} silvado{s} a mais fundido{s}: ✨ {dust} de crédito.",
  "tl": "Na-fuse ang {n} sobrang dawag: ✨ {dust} na credit.",
  "ta": "{n} உபரி முட்புதர்கள் இணைக்கப்பட்டன: ✨ {dust} வரவு.",
  "id": "{n} semak cadangan dilebur: ✨ {dust} kredit.",
  "zh-Hans": "融合了 {n} 片多余的荆棘丛：✨ {dust} 额度。",
  "zh-Hant": "融合了 {n} 片多餘的荊棘叢：✨ {dust} 額度。",
  "ja": "余ったいばら{n}つを合成：✨ {dust}分のクレジット。",
  "ko": "남는 덤불 {n}개를 융합: ✨ {dust} 크레딧."
 },
 "Insanity is playing the same deck and expecting a different bramble.": {
  "fr": "La folie, c’est jouer le même deck en espérant un autre roncier.",
  "de": "Wahnsinn ist, dasselbe Deck zu spielen und eine andere Dornenhecke zu erwarten.",
  "es": "La locura es jugar el mismo mazo y esperar otro zarzal.",
  "it": "La follia è giocare lo stesso mazzo aspettandosi un rovo diverso.",
  "pt": "Loucura é jogar o mesmo baralho e esperar um silvado diferente.",
  "tl": "Kabaliwan ang laruin ang parehong deck at umasang iba ang dawag.",
  "ta": "அதே அடுக்கை ஆடி வேறு முட்புதரை எதிர்பார்ப்பதுதான் பைத்தியக்காரத்தனம்.",
  "id": "Kegilaan adalah memainkan dek yang sama dan berharap semaknya berbeda.",
  "zh-Hans": "疯狂就是用同一副卡组，却期待不同的荆棘丛。",
  "zh-Hant": "瘋狂就是用同一副牌組，卻期待不同的荊棘叢。",
  "ja": "同じデッキで違ういばらを期待する、それを狂気という。",
  "ko": "광기란 같은 덱으로 다른 덤불을 기대하는 것이다."
 },
 "Not one point of damage on your bramble.": {
  "fr": "Pas un seul point de dégât sur votre roncier.",
  "de": "Kein einziger Schadenspunkt an deiner Dornenhecke.",
  "es": "Ni un punto de daño en tu zarzal.",
  "it": "Nemmeno un punto di danno al rovo.",
  "pt": "Nem um ponto de dano no teu silvado.",
  "tl": "Walang kahit isang puntos ng pinsala sa dawag mo.",
  "ta": "உங்கள் முட்புதருக்கு ஒரு புள்ளி சேதம்கூட இல்லை.",
  "id": "Tidak ada satu poin pun kerusakan pada semakmu.",
  "zh-Hans": "荆棘丛没有受到一点伤害。",
  "zh-Hant": "荊棘叢沒有受到一點傷害。",
  "ja": "いばらへのダメージはゼロ。",
  "ko": "덤불에 피해가 단 1도 없어요."
 },
 "Play cards, attack, and chip away at the enemy Bramble. New ideas get explained as you meet them in the skirmishes.": {
  "fr": "Jouez des cartes, attaquez et entamez le Roncier ennemi. Les nouveautés sont expliquées à mesure que vous les rencontrez dans les escarmouches.",
  "de": "Spiel Karten, greif an und zermürbe die gegnerische Dornenhecke. Neues wird erklärt, sobald du ihm in den Scharmützeln begegnest.",
  "es": "Juega cartas, ataca y desgasta el Zarzal enemigo. Las ideas nuevas se explican cuando las encuentras en las escaramuzas.",
  "it": "Gioca carte, attacca e logora il Rovo nemico. Le novità ti vengono spiegate man mano che le incontri nelle schermaglie.",
  "pt": "Joga cartas, ataca e vai desgastando o Silvado inimigo. As novidades são explicadas à medida que as encontras nas escaramuças.",
  "tl": "Maglaro ng card, umatake, at unti-untiin ang Dawag ng kalaban. Ipapaliwanag ang mga bagong ideya pagdating mo sa mga sagupaan.",
  "ta": "அட்டைகளை ஆடுங்கள், தாக்குங்கள், எதிரி முட்புதரைச் சிறிது சிறிதாக உடையுங்கள். புதிய கருத்துகள் சிறு மோதல்களில் சந்திக்கும்போது விளக்கப்படும்.",
  "id": "Mainkan kartu, serang, dan kikis Semak musuh. Hal baru dijelaskan saat kamu menemuinya di pertempuran kecil.",
  "zh-Hans": "出牌、进攻，一点点削弱敌方荆棘丛。新玩法会在遭遇战中遇到时再讲解。",
  "zh-Hant": "出牌、進攻，一點點削弱敵方荊棘叢。新玩法會在遭遇戰中遇到時再講解。",
  "ja": "カードを出して攻撃し、敵のいばらを削りましょう。新しい要素は小競り合いで出会ったときに説明します。",
  "ko": "카드를 내고 공격해서 적의 덤불을 조금씩 깎아요. 새로운 건 소규모 전투에서 만날 때마다 설명해 줄게요."
 },
 "Summon your leader when you can afford it, and read the enemy bramble: it has a passive of its own.": {
  "fr": "Invoquez votre chef quand vous en avez les moyens, et observez le roncier ennemi : il a son propre passif.",
  "de": "Ruf deinen Anführer, sobald du ihn dir leisten kannst, und lies die gegnerische Dornenhecke: Sie hat eine eigene Passive.",
  "es": "Invoca a tu líder cuando puedas pagarlo y fíjate en el zarzal enemigo: tiene un pasivo propio.",
  "it": "Evoca il tuo capo quando puoi permettertelo e studia il rovo nemico: ha un passivo tutto suo.",
  "pt": "Invoca o teu líder quando o puderes pagar e lê o silvado inimigo: tem um passivo próprio.",
  "tl": "Ipatawag ang pinuno mo kapag kaya mo na, at basahin ang dawag ng kalaban: may sarili itong passive.",
  "ta": "முடியும்போது உங்கள் தலைவரை அழையுங்கள், எதிரி முட்புதரைக் கவனியுங்கள்: அதற்கென்று ஒரு செயலற்றத் திறன் உண்டு.",
  "id": "Panggil pemimpinmu saat mampu, dan perhatikan semak musuh: ia punya pasifnya sendiri.",
  "zh-Hans": "负担得起时召唤你的领袖，并留意敌方荆棘丛：它有自己的被动。",
  "zh-Hant": "負擔得起時召喚你的領袖，並留意敵方荊棘叢：它有自己的被動。",
  "ja": "余裕ができたらリーダーを呼びましょう。敵のいばらも要チェック。独自のパッシブがあります。",
  "ko": "여유가 되면 리더를 소환하고, 적의 덤불을 잘 봐요. 덤불에도 자기만의 패시브가 있어요."
 },
 "The enemy Bramble. Break it to win.": {
  "fr": "Le Roncier ennemi. Détruisez-le pour gagner.",
  "de": "Die gegnerische Dornenhecke. Zerstöre sie, um zu gewinnen.",
  "es": "El Zarzal enemigo. Destrúyelo para ganar.",
  "it": "Il Rovo nemico. Distruggilo per vincere.",
  "pt": "O Silvado inimigo. Destrói-o para ganhar.",
  "tl": "Ang Dawag ng kalaban. Wasakin ito para manalo.",
  "ta": "எதிரியின் முட்புதர். வெல்ல அதை உடையுங்கள்.",
  "id": "Semak musuh. Hancurkan untuk menang.",
  "zh-Hans": "敌方荆棘丛。摧毁它就能获胜。",
  "zh-Hant": "敵方荊棘叢。摧毀它就能獲勝。",
  "ja": "敵のいばらです。壊せば勝ち。",
  "ko": "적의 덤불이에요. 부수면 이겨요."
 },
 "The less health your Bramble loses, the higher your rank. Some card rewards only unlock at rank S.": {
  "fr": "Moins votre Roncier perd de santé, plus votre rang est élevé. Certaines cartes ne se débloquent qu’au rang S.",
  "de": "Je weniger Leben deine Dornenhecke verliert, desto höher dein Rang. Manche Kartenbelohnungen gibt es erst ab Rang S.",
  "es": "Cuanta menos salud pierda tu Zarzal, mayor será tu rango. Algunas cartas de recompensa solo se desbloquean con rango S.",
  "it": "Meno salute perde il tuo Rovo, più alto è il grado. Alcune carte ricompensa si sbloccano solo al grado S.",
  "pt": "Quanto menos vida o teu Silvado perder, maior o teu rank. Algumas cartas de recompensa só se desbloqueiam no rank S.",
  "tl": "Habang mas kaunti ang nawawalang buhay ng Dawag mo, mas mataas ang ranggo mo. May mga card reward na bubukas lang sa ranggo S.",
  "ta": "உங்கள் முட்புதர் குறைவான உயிர் இழந்தால் உங்கள் தரம் உயரும். சில அட்டைப் பரிசுகள் S தரத்தில் மட்டுமே திறக்கும்.",
  "id": "Makin sedikit nyawa Semakmu yang hilang, makin tinggi peringkatmu. Beberapa hadiah kartu hanya terbuka di peringkat S.",
  "zh-Hans": "荆棘丛损失的生命越少，评级越高。有些卡牌奖励只在 S 级解锁。",
  "zh-Hant": "荊棘叢損失的生命越少，評級越高。有些卡牌獎勵只在 S 級解鎖。",
  "ja": "いばらの体力を失わないほどランクが上がります。Sランクでしか手に入らないカード報酬もあります。",
  "ko": "덤불이 잃는 체력이 적을수록 랭크가 높아요. 어떤 카드 보상은 S 랭크에서만 열려요."
 },
 "Their bramble has a passive of its own.": {
  "fr": "Leur roncier a son propre passif.",
  "de": "Ihre Dornenhecke hat eine eigene Passive.",
  "es": "Su zarzal tiene un pasivo propio.",
  "it": "Il loro rovo ha un passivo tutto suo.",
  "pt": "O silvado deles tem um passivo próprio.",
  "tl": "May sariling passive ang dawag nila.",
  "ta": "அவர்களின் முட்புதருக்கும் தனி செயலற்றத் திறன் உண்டு.",
  "id": "Semak mereka punya pasifnya sendiri.",
  "zh-Hans": "他们的荆棘丛有自己的被动。",
  "zh-Hant": "他們的荊棘叢有自己的被動。",
  "ja": "相手のいばらには独自のパッシブがあります。",
  "ko": "상대의 덤불에도 자기만의 패시브가 있어요."
 },
 "This bramble has a Shield: hits break it first, then its Health.": {
  "fr": "Ce roncier a un Bouclier : les coups le brisent d’abord, puis entament la Santé.",
  "de": "Diese Dornenhecke hat einen Schild: Treffer brechen zuerst ihn, dann das Leben.",
  "es": "Este zarzal tiene un Escudo: los golpes lo rompen primero y luego van a la Salud.",
  "it": "Questo rovo ha uno Scudo: i colpi rompono prima quello, poi la Salute.",
  "pt": "Este silvado tem um Escudo: os golpes partem-no primeiro, depois a Vida.",
  "tl": "May Kalasag ang dawag na ito: unang nababasag ito sa mga tama, saka ang Buhay.",
  "ta": "இந்த முட்புதருக்குக் கேடயம் உண்டு: தாக்குதல்கள் முதலில் அதை உடைக்கும், பிறகு உயிரை.",
  "id": "Semak ini punya Perisai: serangan memecahkannya dulu, baru Nyawanya.",
  "zh-Hans": "这片荆棘丛有护盾：攻击会先打破护盾，再伤及生命。",
  "zh-Hant": "這片荊棘叢有護盾：攻擊會先打破護盾，再傷及生命。",
  "ja": "このいばらにはシールドがあります。攻撃はまずシールドを壊し、その後で体力を削ります。",
  "ko": "이 덤불엔 보호막이 있어요. 공격은 보호막을 먼저 깨고, 그다음 체력을 깎아요."
 },
 "Well fought. Keep 90% of your bramble and it becomes S.": {
  "fr": "Bien joué. Gardez 90 % de votre roncier et ce sera S.",
  "de": "Gut gekämpft. Behalte 90 % deiner Dornenhecke, dann wird es S.",
  "es": "Bien luchado. Conserva el 90 % de tu zarzal y será S.",
  "it": "Ben combattuto. Conserva il 90% del rovo e sarà S.",
  "pt": "Bem lutado. Mantém 90% do teu silvado e passa a S.",
  "tl": "Magaling. Panatilihin ang 90% ng dawag mo at magiging S ito.",
  "ta": "நன்றாகப் போரிட்டீர்கள். முட்புதரின் 90% ஐக் காத்தால் S ஆகும்.",
  "id": "Bertarung dengan baik. Pertahankan 90% semakmu, dan jadi S.",
  "zh-Hans": "打得好。保住 90% 的荆棘丛就是 S。",
  "zh-Hant": "打得好。保住 90% 的荊棘叢就是 S。",
  "ja": "よく戦いました。いばらの90%を守ればSになります。",
  "ko": "잘 싸웠어요. 덤불을 90% 지키면 S가 돼요."
 },
 "You look like you need help. I watched that first fight from the hedge: good instincts, thin ranks, and the next bramble is sturdier. A road's safer walked by two, and I owe this valley a favour or two. I'm with you now: call me onto the field when you need me.": {
  "fr": "Vous avez l’air d’avoir besoin d’aide. J’ai regardé ce premier combat depuis la haie : bon instinct, rangs maigres, et le prochain roncier est plus solide. Une route est plus sûre à deux, et je dois une faveur ou deux à cette vallée. Je suis avec vous maintenant : appelez-moi sur le terrain quand vous aurez besoin de moi.",
  "de": "Du siehst aus, als bräuchtest du Hilfe. Ich habe den ersten Kampf von der Hecke aus gesehen: gute Instinkte, dünne Reihen, und die nächste Dornenhecke ist stabiler. Zu zweit geht sich ein Weg sicherer, und ich schulde diesem Tal noch den einen oder anderen Gefallen. Ich bin jetzt bei dir: Ruf mich aufs Feld, wenn du mich brauchst.",
  "es": "Parece que necesitas ayuda. Vi ese primer combate desde el seto: buen instinto, filas escasas, y el próximo zarzal es más robusto. Un camino es más seguro de dos en dos, y le debo a este valle un favor o dos. Ahora estoy contigo: llámame al campo cuando me necesites.",
  "it": "Sembra che tu abbia bisogno d’aiuto. Ho guardato quel primo scontro dalla siepe: buon istinto, file sottili, e il prossimo rovo è più robusto. Una strada è più sicura in due, e devo un favore o due a questa valle. Ora sono con te: chiamami in campo quando ti servo.",
  "pt": "Parece que precisas de ajuda. Vi aquele primeiro combate da sebe: bom instinto, fileiras magras, e o próximo silvado é mais robusto. Um caminho é mais seguro a dois, e devo um favor ou dois a este vale. Agora estou contigo: chama-me para o campo quando precisares de mim.",
  "tl": "Mukhang kailangan mo ng tulong. Pinanood ko ang unang laban mula sa halamanan: magaling ang kutob mo, manipis ang hanay, at mas matibay ang susunod na dawag. Mas ligtas ang daan kapag dalawa, at may utang akong pabor sa lambak na ito. Kasama mo na ako: tawagin mo ako sa larangan kapag kailangan mo ako.",
  "ta": "உங்களுக்கு உதவி தேவை போலத் தெரிகிறது. அந்த முதல் சண்டையை வேலியிலிருந்து பார்த்தேன்: நல்ல உள்ளுணர்வு, மெலிந்த அணி, அடுத்த முட்புதர் இன்னும் உறுதியானது. இருவராக நடந்தால் பாதை பாதுகாப்பானது, இந்தப் பள்ளத்தாக்குக்கு நான் ஓரிரு நன்றிக்கடன் பட்டிருக்கிறேன். இப்போது உங்களுடன் இருக்கிறேன்: தேவைப்படும்போது என்னைக் களத்துக்கு அழையுங்கள்.",
  "id": "Sepertinya kamu butuh bantuan. Aku menonton pertarungan pertama itu dari balik pagar tanaman: naluri bagus, barisan tipis, dan semak berikutnya lebih kokoh. Jalan lebih aman ditempuh berdua, dan aku berutang satu-dua budi pada lembah ini. Sekarang aku bersamamu: panggil aku ke medan saat kamu butuh.",
  "zh-Hans": "看起来你需要帮手。我在树篱后看了你的第一场仗：直觉不错，兵力单薄，而下一片荆棘丛更坚固。两人同行路更安全，我也欠这片山谷一两份人情。现在我跟你走：需要时就召我上场。",
  "zh-Hant": "看起來你需要幫手。我在樹籬後看了你的第一場仗：直覺不錯，兵力單薄，而下一片荊棘叢更堅固。兩人同行路更安全，我也欠這片山谷一兩份人情。現在我跟你走：需要時就召我上場。",
  "ja": "助けが要りそうですね。最初の戦いは生け垣から見ていました。勘はいいけれど手勢が薄い、そして次のいばらはもっと頑丈です。道は二人で歩くほうが安全ですし、この谷には借りがひとつふたつあります。これからは一緒です。必要なときはフィールドに呼んでください。",
  "ko": "도움이 필요해 보이네요. 첫 전투는 산울타리에서 지켜봤어요. 감은 좋은데 병력이 얇고, 다음 덤불은 더 튼튼해요. 길은 둘이 걸어야 안전하고, 저도 이 골짜기에 빚이 좀 있거든요. 이제 함께할게요. 필요할 때 전장으로 불러 주세요."
 },
 "Your bramble is already at full Health.": {
  "fr": "Votre roncier est déjà à pleine Santé.",
  "de": "Deine Dornenhecke hat schon volles Leben.",
  "es": "Tu zarzal ya tiene la Salud completa.",
  "it": "Il tuo rovo ha già la Salute al massimo.",
  "pt": "O teu silvado já tem a Vida cheia.",
  "tl": "Puno na ang Buhay ng dawag mo.",
  "ta": "உங்கள் முட்புதர் ஏற்கனவே முழு உயிருடன் உள்ளது.",
  "id": "Nyawa semakmu sudah penuh.",
  "zh-Hans": "你的荆棘丛生命已满。",
  "zh-Hant": "你的荊棘叢生命已滿。",
  "ja": "いばらの体力はもう満タンです。",
  "ko": "덤불 체력이 이미 가득 찼어요."
 },
 "Your leader, the sky, and bramble passives": {
  "fr": "Votre chef, le ciel et les passifs de roncier",
  "de": "Dein Anführer, der Himmel und Dornenhecken-Passiven",
  "es": "Tu líder, el cielo y los pasivos del zarzal",
  "it": "Il tuo capo, il cielo e i passivi del rovo",
  "pt": "O teu líder, o céu e os passivos do silvado",
  "tl": "Ang pinuno mo, ang langit, at ang mga passive ng dawag",
  "ta": "உங்கள் தலைவர், வானம், முட்புதரின் செயலற்றத் திறன்கள்",
  "id": "Pemimpinmu, langit, dan pasif semak",
  "zh-Hans": "你的领袖、天空与荆棘丛被动",
  "zh-Hant": "你的領袖、天空與荊棘叢被動",
  "ja": "リーダー、空、そしていばらのパッシブ",
  "ko": "리더, 하늘, 그리고 덤불의 패시브"
 },
 "Bramble": {
  "fr": "Roncier",
  "de": "Dornenhecke",
  "es": "Zarzal",
  "it": "Rovo",
  "pt": "Silvado",
  "tl": "Dawag",
  "ta": "முட்புதர்",
  "id": "Semak",
  "zh-Hans": "荆棘丛",
  "zh-Hant": "荊棘叢",
  "ja": "いばら",
  "ko": "덤불"
 }
}
OVERRIDE = {"Brambles": {"de": "Dornenhecken", "tl": "Mga Dawag"}}


def main():
    for code in CODES:
        path = os.path.join(ROOT, 'lang', code + '.json')
        pack = json.load(open(path, encoding='utf-8'))
        for k, row in T.items():
            if code in row:
                pack[k] = row[code]
                if k in RENAME: pack.pop(RENAME[k], None)
        for k, row in OVERRIDE.items():
            if code in row: pack[k] = row[code]
        with open(path, 'w', encoding='utf-8') as fh:
            json.dump(dict(sorted(pack.items(), key=lambda kv: kv[0].lower())), fh, ensure_ascii=False, indent=1); fh.write('\n')
    print('bramble: %d keys renamed, %d added, in %d packs' % (len(RENAME), len(T) - len(RENAME), len(CODES)))


if __name__ == '__main__':
    main()
