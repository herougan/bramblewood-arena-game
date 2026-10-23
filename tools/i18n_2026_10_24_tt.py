#!/usr/bin/env python3
"""Game texts added on 2026-10-24 by package TT (owner 13:16 #4, "A tutorial for triggers."): the two steps of the Triggers lesson (coach.tl-what,
coach.tl-when), the Skill Codex's "Triggers lesson" replay button, its tooltip and toast, and the "Next ▶" button the coach tips already used
(it had no row). The trigger names inside the second step are the ones each pack already uses for the chip tooltips (lang/ui, lang/<code>.json);
a pack without a row for one keeps the English name. A row a pack already has is left as it is. Tagalog, Tamil, Japanese and Korean deserve a native read.
  python3 tools/i18n_2026_10_24_tt.py"""
import json, os, re
ROOT = os.path.join(os.path.dirname(os.path.abspath(__file__)), '..')
CODES = ['fr', 'de', 'es', 'it', 'pt', 'tl', 'ta', 'id', 'zh-Hans', 'zh-Hant', 'ja', 'ko']
TERMS = {'spawn': 'On Spawn', 'attack': 'On Attack', 'hit': 'On Hit', 'attacked': 'On Attacked', 'kill': 'On Kill', 'death': 'On Death', 'turn': 'On Turn Start'}
EN_WHAT = "⚡ This chip is a trigger: something the card does by itself when its moment comes. The left says when, the right says what. Rest your pointer on it (or press and hold) to read it in full."
EN_WHEN = "When does it go off? On Spawn: the moment the card is played. On Attack and On Hit: when it swings and when its blow lands. On Attacked: when it is hit. On Kill and On Death: when it kills and when it dies. On Turn Start (🕐): every round once it is Ready."
WHAT = [
"⚡ Cette pastille est un déclencheur : quelque chose que la carte fait toute seule quand son moment arrive. La gauche dit quand, la droite dit quoi. Posez le pointeur dessus (ou appuyez longuement) pour la lire en entier.",
"⚡ Dieses Chip ist ein Auslöser: etwas, das die Karte von selbst tut, wenn ihr Moment kommt. Links steht wann, rechts was. Halte den Zeiger darauf (oder drücke lange), um es ganz zu lesen.",
"⚡ Esta ficha es un disparador: algo que la carta hace sola cuando llega su momento. A la izquierda dice cuándo, a la derecha qué. Deja el puntero encima (o mantén pulsado) para leerlo entero.",
"⚡ Questo gettone è un innesco: qualcosa che la carta fa da sola quando arriva il suo momento. A sinistra dice quando, a destra cosa. Tieni il puntatore sopra (o premi a lungo) per leggerlo per intero.",
"⚡ Esta ficha é um gatilho: algo que a carta faz sozinha quando chega o seu momento. À esquerda diz quando, à direita diz o quê. Pousa o ponteiro nela (ou prime longamente) para ler tudo.",
"⚡ Ang chip na ito ay isang trigger: isang bagay na kusang ginagawa ng card kapag dumating ang sandali nito. Sinasabi ng kaliwa kung kailan, sinasabi ng kanan kung ano. Ihinto ang pointer dito (o pindutin nang matagal) para mabasa nang buo.",
"⚡ இந்த சிப் ஒரு தூண்டி: அட்டை தன் தருணம் வரும்போது தானாகச் செய்யும் ஒன்று. இடப்பக்கம் எப்போது என்றும், வலப்பக்கம் என்ன என்றும் சொல்லும். முழுவதும் படிக்க சுட்டியை அதன் மேல் வையுங்கள் (அல்லது அழுத்திப் பிடியுங்கள்).",
"⚡ Chip ini adalah pemicu: sesuatu yang dilakukan kartu dengan sendirinya saat waktunya tiba. Sisi kiri menyatakan kapan, sisi kanan menyatakan apa. Arahkan penunjuk ke sana (atau tekan lama) untuk membacanya lengkap.",
"⚡ 这个小标记是触发效果：时机一到，卡牌会自动做的事。左边说明何时，右边说明做什么。把指针停在上面（或长按）即可读完整说明。",
"⚡ 這個小標記是觸發效果：時機一到，卡牌會自動做的事。左邊說明何時，右邊說明做什麼。把游標停在上面（或長按）即可讀完整說明。",
"⚡ このチップはトリガー。タイミングが来ると、カードが自分で行うことです。左がいつ、右が何をするか。ポインタを乗せる（または長押し）と全文が読めます。",
"⚡ 이 칩은 트리거예요. 때가 되면 카드가 스스로 하는 일이에요. 왼쪽은 언제, 오른쪽은 무엇을 하는지 알려 줘요. 포인터를 올리거나 길게 누르면 전체를 읽을 수 있어요.",
]
WHEN = [
"Quand se déclenche-t-il ? <spawn> : à l’instant où la carte est jouée. <attack> et <hit> : quand elle frappe et quand son coup porte. <attacked> : quand elle est touchée. <kill> et <death> : quand elle tue et quand elle meurt. <turn> (🕐) : chaque tour une fois Prête.",
"Wann löst er aus? <spawn>: sobald die Karte gespielt wird. <attack> und <hit>: wenn sie zuschlägt und wenn ihr Schlag trifft. <attacked>: wenn sie getroffen wird. <kill> und <death>: wenn sie tötet und wenn sie stirbt. <turn> (🕐): jede Runde, sobald sie bereit ist.",
"¿Cuándo salta? <spawn>: en cuanto se juega la carta. <attack> y <hit>: cuando ataca y cuando su golpe da en el blanco. <attacked>: cuando la golpean. <kill> y <death>: cuando mata y cuando muere. <turn> (🕐): cada ronda una vez que está lista.",
"Quando scatta? <spawn>: nel momento in cui la carta viene giocata. <attack> e <hit>: quando colpisce e quando il suo colpo va a segno. <attacked>: quando viene colpita. <kill> e <death>: quando uccide e quando muore. <turn> (🕐): ogni round, una volta pronta.",
"Quando dispara? <spawn>: no instante em que a carta é jogada. <attack> e <hit>: quando ataca e quando o golpe acerta. <attacked>: quando é atingida. <kill> e <death>: quando mata e quando morre. <turn> (🕐): todas as rondas, depois de estar pronta.",
"Kailan ito gumagana? <spawn>: sa sandaling nilaro ang card. <attack> at <hit>: kapag umaatake ito at kapag tumama ang hampas nito. <attacked>: kapag tinamaan ito. <kill> at <death>: kapag pumatay ito at kapag namatay ito. <turn> (🕐): bawat round kapag Handa na ito.",
"இது எப்போது செயல்படும்? <spawn>: அட்டை விளையாடப்படும் கணத்தில். <attack> மற்றும் <hit>: அது தாக்கும்போதும் அதன் அடி படும்போதும். <attacked>: அது அடிவாங்கும்போது. <kill> மற்றும் <death>: அது கொல்லும்போதும் இறக்கும்போதும். <turn> (🕐): தயாரானதும் ஒவ்வொரு சுற்றிலும்.",
"Kapan aktif? <spawn>: saat kartu dimainkan. <attack> dan <hit>: saat menyerang dan saat pukulannya mengenai. <attacked>: saat terkena serangan. <kill> dan <death>: saat membunuh dan saat mati. <turn> (🕐): setiap ronde setelah Siap.",
"何时触发？<spawn>：卡牌打出的那一刻。<attack>和<hit>：它出手时，以及它的攻击命中时。<attacked>：它被击中时。<kill>和<death>：它击杀时和它死亡时。<turn>（🕐）：就绪后每一回合。",
"何時觸發？<spawn>：卡牌打出的那一刻。<attack>和<hit>：它出手時，以及它的攻擊命中時。<attacked>：它被擊中時。<kill>和<death>：它擊殺時和它死亡時。<turn>（🕐）：就緒後每一回合。",
"いつ発動する？<spawn>：カードを出した瞬間。<attack>と<hit>：攻撃に出るときと、その一撃が当たったとき。<attacked>：攻撃を受けたとき。<kill>と<death>：倒したときと倒れたとき。<turn>（🕐）：準備ができたあと毎ラウンド。",
"언제 발동할까요? <spawn>: 카드를 내는 순간. <attack>과 <hit>: 공격에 나설 때와 그 일격이 적중할 때. <attacked>: 공격을 받을 때. <kill>과 <death>: 처치할 때와 쓰러질 때. <turn>(🕐): 준비된 뒤 매 라운드.",
]
BTN = [
["🎓 Leçon des déclencheurs", "🎓 Lektion: Auslöser", "🎓 Lección de disparadores", "🎓 Lezione sugli inneschi", "🎓 Lição dos gatilhos", "🎓 Aralin sa mga trigger", "🎓 தூண்டி பாடம்", "🎓 Pelajaran pemicu", "🎓 触发效果教程", "🎓 觸發效果教學", "🎓 トリガーのレッスン", "🎓 트리거 수업"],
["Rejouer la leçon des déclencheurs lors de votre prochain combat avec une carte à déclencheur", "Die Auslöser-Lektion im nächsten Kampf mit einer Auslöser-Karte noch einmal abspielen", "Repetir la lección de disparadores en tu próximo combate con una carta con disparador", "Rigioca la lezione sugli inneschi nel prossimo scontro con una carta con innesco", "Repetir a lição dos gatilhos no teu próximo combate com uma carta com gatilho", "Ulitin ang aralin sa mga trigger sa susunod mong laban na may trigger card", "தூண்டி அட்டையுடன் உங்கள் அடுத்த சண்டையில் தூண்டி பாடத்தை மீண்டும் காட்டு", "Putar ulang pelajaran pemicu di pertarungan berikutnya dengan kartu pemicu", "下次遇到带触发效果的卡牌时再播放一次触发效果教程", "下次遇到帶觸發效果的卡牌時再播放一次觸發效果教學", "次にトリガー持ちのカードが出る戦闘で、もう一度レッスンを見る", "다음에 트리거 카드가 나오는 전투에서 트리거 수업을 다시 보기"],
["🎓 La leçon des déclencheurs reviendra la prochaine fois qu’une carte à déclencheur apparaîtra en combat.", "🎓 Die Auslöser-Lektion kommt wieder, wenn im Kampf das nächste Mal eine Auslöser-Karte erscheint.", "🎓 La lección de disparadores volverá la próxima vez que aparezca una carta con disparador en un combate.", "🎓 La lezione sugli inneschi tornerà la prossima volta che in uno scontro comparirà una carta con innesco.", "🎓 A lição dos gatilhos volta a aparecer na próxima vez que uma carta com gatilho surgir num combate.", "🎓 Muling lalabas ang aralin sa mga trigger sa susunod na may trigger card na lumabas sa laban.", "🎓 சண்டையில் அடுத்த முறை தூண்டி அட்டை வரும்போது தூண்டி பாடம் மீண்டும் வரும்.", "🎓 Pelajaran pemicu akan muncul lagi saat kartu pemicu berikutnya muncul di pertarungan.", "🎓 下次战斗中出现带触发效果的卡牌时，会再次播放触发效果教程。", "🎓 下次戰鬥中出現帶觸發效果的卡牌時，會再次播放觸發效果教學。", "🎓 次の戦闘でトリガー持ちのカードが出たとき、レッスンがもう一度流れます。", "🎓 다음 전투에서 트리거 카드가 나오면 트리거 수업이 다시 나와요."],
["Suivant ▶", "Weiter ▶", "Siguiente ▶", "Avanti ▶", "Seguinte ▶", "Susunod ▶", "அடுத்து ▶", "Lanjut ▶", "下一步 ▶", "下一步 ▶", "次へ ▶", "다음 ▶"],
]
T = {EN_WHAT: WHAT, EN_WHEN: WHEN,
     "🎓 Triggers lesson": BTN[0], "Play the triggers lesson again in your next fight with a trigger card": BTN[1],
     "🎓 The triggers lesson will play again the next time a trigger card shows up in a fight.": BTN[2], "Next ▶": BTN[3]}
def dump(path, d):
    with open(path, 'w', encoding='utf-8') as fh:
        json.dump(d, fh, ensure_ascii=False, indent=1); fh.write('\n')
ph = lambda s: sorted(set(re.findall(r'\{\w+\}', s)))
assert all(len(v) == len(CODES) for v in T.values())
for i, code in enumerate(CODES):
    path = os.path.join(ROOT, 'lang', code + '.json'); ui = os.path.join(ROOT, 'lang', 'ui', code + '.json')
    pack = json.load(open(path, encoding='utf-8')); uipack = json.load(open(ui, encoding='utf-8'))
    word = {k: uipack.get(en) or pack.get(en) or en for k, en in TERMS.items()}
    for en, row in T.items():
        t = row[i]
        if en == EN_WHEN:
            for k, w in word.items(): t = t.replace('<' + k + '>', w)
            assert '<' not in t, t
        assert ph(en) == ph(t)
        if en not in pack and en not in uipack: pack[en] = t
    dump(path, pack); dump(ui, uipack)
print('wrote', len(CODES), 'packs:', len(T), 'texts')
