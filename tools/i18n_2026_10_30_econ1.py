#!/usr/bin/env python3
"""Game texts added on 2026-10-30 by package ECON1 (Briar Blossoms, the brambles' own resource). 6 new TX keys (ui.econ1-*, results.econ1-*),
one row per English text in lang/<code>.json (rows that already exist are kept as they are). Tagalog, Tamil, Japanese and Korean deserve a native read.
"Briar Blossoms" is a placeholder name the owner can change; change the English key and these rows together.
    python3 tools/i18n_2026_10_30_econ1.py"""
import json, os, re
ROOT = os.path.join(os.path.dirname(os.path.abspath(__file__)), '..')
CODES = ['fr', 'de', 'es', 'it', 'pt', 'tl', 'ta', 'id', 'zh-Hans', 'zh-Hant', 'ja', 'ko']
T = [  # English, then the 12 translations in CODES order
 ('Briar Blossoms', ['Fleurs de ronce', 'Brombeerblüten', 'Flores de zarza', 'Fiori di rovo', 'Flores de silva', 'Bulaklak ng Dawag', 'முட்புதர் மலர்கள்', 'Bunga Semak Duri', '荆棘花', '荊棘花', 'イバラの花', '가시덤불 꽃']),
 ('Briar Blossoms: reinforcing a bramble costs them. Won in Conquest fights, a few even from a loss.', [
  "Fleurs de ronce : renforcer une ronce en coûte. Gagnées dans les combats de Conquête, quelques-unes même en cas de défaite.",
  'Brombeerblüten: Das Verstärken eines Dornwalls kostet sie. Gewonnen in Eroberungskämpfen, ein paar sogar bei einer Niederlage.',
  'Flores de zarza: reforzar una zarza cuesta flores. Se ganan en los combates de Conquista, unas pocas incluso al perder.',
  'Fiori di rovo: rinforzare un rovo li costa. Si vincono negli scontri di Conquista, qualcuno anche perdendo.',
  'Flores de silva: reforçar uma silva custa flores. Ganham-se nos combates de Conquista, algumas até numa derrota.',
  'Bulaklak ng Dawag: ito ang gastos sa pagpapalakas ng dawag. Napapanalunan sa mga laban sa Conquest, may kaunti kahit matalo.',
  'முட்புதர் மலர்கள்: ஒரு முட்புதரை வலுப்படுத்த இவை தேவை. வெற்றி யுத்தங்களில் கிடைக்கும், தோல்வியிலும் சில கிடைக்கும்.',
  'Bunga Semak Duri: memperkuat semak duri membutuhkannya. Didapat dari pertarungan Penaklukan, sedikit bahkan saat kalah.',
  '荆棘花：强化荆棘需要它。在征服战斗中获得，即使失败也能得到一些。',
  '荊棘花：強化荊棘需要它。在征服戰鬥中獲得，即使失敗也能得到一些。',
  'イバラの花：イバラの強化に使います。征服の戦いで手に入り、負けても少しもらえます。',
  '가시덤불 꽃: 가시덤불을 강화하는 데 들어요. 정복 전투에서 얻고, 져도 조금 받아요.']),
 ('Reinforcing costs Briar Blossoms and a little Dust and Leaves. You have {have}. Win fights for more; a loss still gives a few for the damage you did to the enemy bramble.', [
  "Renforcer coûte des Fleurs de ronce et un peu de Poussière et de Feuilles. Vous en avez {have}. Gagnez des combats pour en avoir plus ; une défaite en donne quelques-unes pour les dégâts infligés à la ronce ennemie.",
  'Verstärken kostet Brombeerblüten und etwas Staub und Blätter. Du hast {have}. Gewinne Kämpfe für mehr; eine Niederlage gibt ein paar für den Schaden am gegnerischen Dornwall.',
  'Reforzar cuesta Flores de zarza y un poco de Polvo y Hojas. Tienes {have}. Gana combates para conseguir más; una derrota da algunas por el daño que hiciste a la zarza enemiga.',
  "Rinforzare costa Fiori di rovo e un po' di Polvere e Foglie. Ne hai {have}. Vinci scontri per averne di più; una sconfitta ne dà qualcuno per i danni inflitti al rovo nemico.",
  'Reforçar custa Flores de silva e um pouco de Pó e Folhas. Tem {have}. Ganhe combates para ter mais; uma derrota dá algumas pelo dano que fez à silva inimiga.',
  'Ang pagpapalakas ay gumagastos ng Bulaklak ng Dawag at kaunting Alikabok at Dahon. Mayroon kang {have}. Manalo sa mga laban para sa higit pa; kahit matalo, may kaunti para sa pinsalang ginawa mo sa dawag ng kalaban.',
  'வலுப்படுத்த முட்புதர் மலர்களும் சிறிது தூசியும் இலைகளும் தேவை. உங்களிடம் {have} உள்ளன. மேலும் பெற யுத்தங்களில் வெல்லுங்கள்; தோல்வியிலும் எதிரி முட்புதருக்குச் செய்த சேதத்திற்குச் சில கிடைக்கும்.',
  'Memperkuat butuh Bunga Semak Duri dan sedikit Debu serta Daun. Kamu punya {have}. Menangkan pertarungan untuk lebih banyak; kalah pun memberi sedikit untuk kerusakan pada semak duri musuh.',
  '强化需要荆棘花，以及少量魔尘和叶子。你有 {have}。赢得战斗获得更多；失败也会按你对敌方荆棘造成的伤害给一些。',
  '強化需要荊棘花，以及少量魔塵和葉子。你有 {have}。贏得戰鬥獲得更多；失敗也會按你對敵方荊棘造成的傷害給一些。',
  '強化にはイバラの花と少しのダストとリーフが必要です。所持数 {have}。戦いに勝つと増えます。負けても敵のイバラに与えたダメージ分だけ少しもらえます。',
  '강화에는 가시덤불 꽃과 약간의 가루와 잎이 들어요. 지금 {have}개 있어요. 전투에서 이기면 더 얻고, 져도 적 가시덤불에 준 피해만큼 조금 받아요.']),
 ('{n} Briar Blossoms for every floor won', ['{n} Fleurs de ronce pour chaque étage gagné', '{n} Brombeerblüten für jedes gewonnene Stockwerk', '{n} Flores de zarza por cada piso ganado', '{n} Fiori di rovo per ogni piano vinto', '{n} Flores de silva por cada piso ganho', '{n} Bulaklak ng Dawag sa bawat palapag na napanalunan', 'வென்ற ஒவ்வொரு தளத்திற்கும் {n} முட்புதர் மலர்கள்', '{n} Bunga Semak Duri untuk setiap lantai yang dimenangkan', '每赢一层 {n} 荆棘花', '每贏一層 {n} 荊棘花', '勝った階ごとにイバラの花 {n}', '이긴 층마다 가시덤불 꽃 {n}개']),
 ('Briar Blossoms for the win. Spend them to reinforce your brambles in the Forge.', [
  'Fleurs de ronce pour la victoire. Dépensez-les pour renforcer vos ronces à la Forge.',
  'Brombeerblüten für den Sieg. Gib sie in der Schmiede aus, um deine Dornwälle zu verstärken.',
  'Flores de zarza por la victoria. Gástalas para reforzar tus zarzas en la Forja.',
  'Fiori di rovo per la vittoria. Spendili per rinforzare i tuoi rovi alla Forgia.',
  'Flores de silva pela vitória. Gaste-as para reforçar as suas silvas na Forja.',
  'Bulaklak ng Dawag para sa panalo. Gastusin sa Pandayan para palakasin ang iyong mga dawag.',
  'வெற்றிக்கான முட்புதர் மலர்கள். உலைக்கூடத்தில் உங்கள் முட்புதர்களை வலுப்படுத்த இவற்றைச் செலவிடுங்கள்.',
  'Bunga Semak Duri untuk kemenangan. Gunakan di Tempa untuk memperkuat semak durimu.',
  '胜利获得的荆棘花。在熔炉中用来强化你的荆棘。',
  '勝利獲得的荊棘花。在熔爐中用來強化你的荊棘。',
  '勝利のイバラの花。鍛冶場でイバラの強化に使えます。',
  '승리로 얻은 가시덤불 꽃. 대장간에서 가시덤불을 강화하는 데 써요.']),
 ('Briar Blossoms for the damage you did to the enemy bramble', [
  'Fleurs de ronce pour les dégâts infligés à la ronce ennemie',
  'Brombeerblüten für den Schaden am gegnerischen Dornwall',
  'Flores de zarza por el daño que hiciste a la zarza enemiga',
  'Fiori di rovo per i danni inflitti al rovo nemico',
  'Flores de silva pelo dano que fez à silva inimiga',
  'Bulaklak ng Dawag para sa pinsalang ginawa mo sa dawag ng kalaban',
  'எதிரி முட்புதருக்கு நீங்கள் செய்த சேதத்திற்கான முட்புதர் மலர்கள்',
  'Bunga Semak Duri untuk kerusakan yang kamu berikan pada semak duri musuh',
  '你对敌方荆棘造成伤害获得的荆棘花',
  '你對敵方荊棘造成傷害獲得的荊棘花',
  '敵のイバラに与えたダメージ分のイバラの花',
  '적 가시덤불에 준 피해로 얻은 가시덤불 꽃']),
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
