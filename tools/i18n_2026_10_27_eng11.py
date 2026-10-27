#!/usr/bin/env python3
"""Game texts added on 2026-10-27 by package ENG11 (the owner's 10-27 11:22 notes): the new Coffee N (K2), the dark places as night
for Nocturnal / Diurnal (K6) and Scorching by day only (K10). Adds the English rows to bramblewood-texts.js (before the table's end)
and the translations to the 12 packs in lang/. An older, reviewed pack row wins. Tagalog, Tamil, Japanese and Korean deserve a native read.
    python3 tools/i18n_2026_10_27_eng11.py"""
import json, os, re
ROOT = os.path.join(os.path.dirname(os.path.abspath(__file__)), '..')
CODES = ['fr', 'de', 'es', 'it', 'pt', 'tl', 'ta', 'id', 'zh-Hans', 'zh-Hant', 'ja', 'ko']
# Scorching II / III share one sentence per language: @L is the level, @U the units a side
SCORCH_N = [
 'Torride, niveau @L : à chaque tour de Jour (à chaque tour là où il n’y a ni jour ni nuit), @U unités au hasard de chaque camp subissent 1 dégât de feu. Les unités résistantes à la chaleur sont épargnées.',
 'Glühend, Stufe @L: In jeder Tagrunde (jede Runde, wo es weder Tag noch Nacht gibt) erleiden @U zufällige Einheiten auf jeder Seite 1 Feuerschaden. Hitzeresistente Einheiten bleiben verschont.',
 'Abrasador, nivel @L: en cada ronda de Día (cada ronda donde no hay día ni noche), @U unidades al azar de cada bando reciben 1 de daño de fuego. Las resistentes al calor se libran.',
 'Torrido, livello @L: in ogni round di Giorno (ogni round dove non c’è né giorno né notte) @U unità a caso per lato subiscono 1 danno da fuoco. Le unità resistenti al calore sono risparmiate.',
 'Escaldante, nível @L: em cada ronda de Dia (todas as rondas onde não há dia nem noite) @U unidades aleatórias de cada lado sofrem 1 de dano de fogo. As unidades resistentes ao calor são poupadas.',
 'Nakapapaso, level @L: sa bawat round ng Araw (bawat round kung saan walang araw o gabi), @U random na yunit sa bawat panig ang tatanggap ng 1 pinsalang apoy. Ligtas ang mga yunit na matibay sa init.',
 'கொளுத்தும் வெயில், நிலை @L: ஒவ்வொரு பகல் சுற்றிலும் (பகலும் இரவும் இல்லாத இடத்தில் ஒவ்வொரு சுற்றும்) ஒவ்வொரு பக்கத்திலும் @U சீரற்ற அலகுகள் 1 நெருப்புச் சேதம் பெறும். வெப்பம் தாங்கும் அலகுகள் தவிர்க்கப்படும்.',
 'Terik, level @L: di setiap ronde Siang (setiap ronde di tempat tanpa siang atau malam) @U unit acak di tiap sisi menerima 1 kerusakan api. Unit tahan panas tidak terkena.',
 '酷热，等级 @L：每个白天轮（没有昼夜之处则每轮），双方各有 @U 个随机单位受到 1 点火焰伤害。耐热单位不受影响。',
 '酷熱，等級 @L：每個白天輪（沒有晝夜之處則每輪），雙方各有 @U 個隨機單位受到 1 點火焰傷害。耐熱單位不受影響。',
 '灼熱、レベル@L：昼のラウンドごとに（昼夜のない場所では毎ラウンド）両陣営のランダムなユニット@U体が火炎ダメージ1。熱耐性のあるユニットは無事。',
 '폭염 레벨 @L: 낮 라운드마다(낮과 밤이 없는 곳에서는 매 라운드) 양쪽의 무작위 유닛 @U체가 화염 피해 1. 열 저항 유닛은 제외.']
SCORCH_EN = 'Scorching, level @L: each Day round (every round where there is no day or night) @U random units on each side take 1 fire damage. Heat-resistant units are spared.'
sc = lambda t, L, U: t.replace('@L', str(L)).replace('@U', str(U))
# key, English, [12 translations in CODES order]
ROWS = [
 ('ui.e11-coffee', 'Every {n} turns: acts twice, then Stunned for a round.', [
   'Tous les {n} tours : agit deux fois, puis Étourdie pendant un tour.',
   'Alle {n} Züge: handelt zweimal, danach eine Runde betäubt.',
   'Cada {n} turnos: actúa dos veces y luego queda Aturdida una ronda.',
   'Ogni {n} turni: agisce due volte, poi Stordita per un round.',
   'A cada {n} turnos: age duas vezes e depois fica Atordoada durante uma ronda.',
   'Bawat {n} turno: kumikilos nang dalawang beses, saka Tuliro nang isang round.',
   'ஒவ்வொரு {n} முறைக்கும்: இருமுறை செயல்படும், பின் ஒரு சுற்றுக்கு மயக்கம்.',
   'Setiap {n} giliran: bertindak dua kali, lalu Pingsan selama satu ronde.',
   '每 {n} 个回合：行动两次，之后眩晕一轮。',
   '每 {n} 個回合：行動兩次，之後眩暈一輪。',
   '{n}ターンごと：2回行動し、その後1ラウンドスタン。',
   '{n}턴마다: 두 번 행동한 뒤 한 라운드 기절.']),
 ('ui.e11-coffee-codex', "A turn is a round in which it acts; rounds it waits, or is Stunned, Frozen or asleep, don't count. Acting twice: its shots go twice and it swings once more.", [
   'Un tour ne compte que si elle agit ; les tours où elle attend, ou est Étourdie, Gelée ou endormie, ne comptent pas. Agir deux fois : ses tirs partent deux fois et elle frappe une fois de plus.',
   'Ein Zug ist eine Runde, in der sie handelt; Runden, in denen sie wartet oder betäubt, gefroren oder schlafend ist, zählen nicht. Zweimal handeln: ihre Schüsse gehen zweimal los und sie schlägt einmal mehr zu.',
   'Un turno es una ronda en la que actúa; las rondas en que espera o está Aturdida, Congelada o dormida no cuentan. Actuar dos veces: sus disparos salen dos veces y golpea una vez más.',
   'Un turno è un round in cui agisce; i round in cui attende o è Stordita, Congelata o addormentata non contano. Agire due volte: i suoi tiri partono due volte e colpisce una volta in più.',
   'Um turno é uma ronda em que age; as rondas em que espera ou está Atordoada, Congelada ou a dormir não contam. Agir duas vezes: os seus disparos saem duas vezes e golpeia mais uma vez.',
   'Ang turno ay round na kumikilos ito; hindi binibilang ang mga round na naghihintay ito, o Tuliro, Nagyelo o tulog. Kumilos nang dalawang beses: dalawang beses ang mga tira nito at may isa pang hampas.',
   'ஒரு முறை என்பது அது செயல்படும் சுற்று; காத்திருக்கும், மயக்கம், உறைந்த அல்லது தூங்கும் சுற்றுகள் கணக்கில் இல்லை. இருமுறை செயல்படுதல்: அதன் எய்தல்கள் இருமுறை, மேலும் ஒரு அடி கூடுதல்.',
   'Giliran adalah ronde saat ia bertindak; ronde saat ia menunggu, atau Pingsan, Beku, atau tertidur, tidak dihitung. Bertindak dua kali: tembakannya dua kali dan ia menyerang sekali lagi.',
   '回合指它行动的轮次；等待、眩晕、冰冻或睡眠的轮次不计。行动两次：射击发动两次，并多挥击一次。',
   '回合指它行動的輪次；等待、眩暈、冰凍或睡眠的輪次不計。行動兩次：射擊發動兩次，並多揮擊一次。',
   'ターンとは行動したラウンドのこと。待機中やスタン・凍結・睡眠中のラウンドは数えない。2回行動：射撃が2回になり、攻撃をもう1回行う。',
   '턴은 행동한 라운드입니다. 대기 중이거나 기절, 빙결, 수면 중인 라운드는 세지 않습니다. 두 번 행동: 사격이 두 번 나가고 한 번 더 공격합니다.']),
 ('ui.e11-log-coffee', 'is wired on coffee: it acts twice this round ☕', [
   'est survoltée au café : elle agit deux fois ce tour ☕',
   'ist vom Kaffee aufgedreht: handelt diese Runde zweimal ☕',
   'va cargada de café: actúa dos veces esta ronda ☕',
   'è carica di caffè: agisce due volte in questo round ☕',
   'está ligada a café: age duas vezes nesta ronda ☕',
   'nakainom ng kape: kikilos ito nang dalawang beses ngayong round ☕',
   'காபி குடித்து உற்சாகம்: இந்தச் சுற்றில் இருமுறை செயல்படும் ☕',
   'kena kafein: bertindak dua kali ronde ini ☕',
   '喝了咖啡精神大振：本轮行动两次 ☕',
   '喝了咖啡精神大振：本輪行動兩次 ☕',
   'コーヒーでハイに：このラウンドは2回行動 ☕',
   '커피로 각성: 이번 라운드에 두 번 행동 ☕']),
 ('ui.e11-nocturnal-codex', 'In the dark places (Darkness, Pitch Black) it is always night: it has its night bonus there and sees in the dark.', [
   'Dans les lieux sombres (Ténèbres, Noir d’encre), c’est toujours la nuit : elle y a son bonus de nuit et voit dans le noir.',
   'An dunklen Orten (Dunkelheit, Pechschwarz) ist immer Nacht: Dort hat sie ihren Nachtbonus und sieht im Dunkeln.',
   'En los lugares oscuros (Oscuridad, Negro absoluto) siempre es de noche: allí tiene su bonificación nocturna y ve en la oscuridad.',
   'Nei luoghi bui (Oscurità, Buio pesto) è sempre notte: lì ha il suo bonus notturno e vede al buio.',
   'Nos lugares escuros (Escuridão, Breu total) é sempre noite: aí tem o seu bónus noturno e vê no escuro.',
   'Sa madidilim na lugar (Dilim, Napakadilim) laging gabi: doon nasa kanya ang bonus sa gabi at nakakakita ito sa dilim.',
   'இருண்ட இடங்களில் (இருள், கும்மிருட்டு) எப்போதும் இரவு: அங்கு அதற்கு இரவுப் போனஸ் உண்டு, இருளிலும் பார்க்கும்.',
   'Di tempat gelap (Kegelapan, Gelap Gulita) selalu malam: di sana ia mendapat bonus malamnya dan bisa melihat dalam gelap.',
   '在黑暗之地（黑暗、漆黑一片）永远是夜晚：它在那里获得夜晚加成，并能在黑暗中视物。',
   '在黑暗之地（黑暗、漆黑一片）永遠是夜晚：它在那裡獲得夜晚加成，並能在黑暗中視物。',
   '暗い場所（闇、真っ暗闇）では常に夜：そこでは夜のボーナスを得て、暗闇でも見える。',
   '어두운 곳(어둠, 칠흑)에서는 늘 밤입니다: 그곳에서 밤 보너스를 받고 어둠 속에서도 봅니다.']),
 ('ui.e11-diurnal-codex', 'In the dark places (Darkness, Pitch Black) it is always night: it gets no day bonus there.', [
   'Dans les lieux sombres (Ténèbres, Noir d’encre), c’est toujours la nuit : elle n’y a pas de bonus de jour.',
   'An dunklen Orten (Dunkelheit, Pechschwarz) ist immer Nacht: Dort bekommt sie keinen Tagbonus.',
   'En los lugares oscuros (Oscuridad, Negro absoluto) siempre es de noche: allí no recibe bonificación diurna.',
   'Nei luoghi bui (Oscurità, Buio pesto) è sempre notte: lì non riceve il bonus diurno.',
   'Nos lugares escuros (Escuridão, Breu total) é sempre noite: aí não recebe bónus diurno.',
   'Sa madidilim na lugar (Dilim, Napakadilim) laging gabi: walang bonus sa araw doon.',
   'இருண்ட இடங்களில் (இருள், கும்மிருட்டு) எப்போதும் இரவு: அங்கு பகல் போனஸ் இல்லை.',
   'Di tempat gelap (Kegelapan, Gelap Gulita) selalu malam: di sana ia tidak mendapat bonus siang.',
   '在黑暗之地（黑暗、漆黑一片）永远是夜晚：它在那里得不到白天加成。',
   '在黑暗之地（黑暗、漆黑一片）永遠是夜晚：它在那裡得不到白天加成。',
   '暗い場所（闇、真っ暗闇）では常に夜：そこでは昼のボーナスを得ない。',
   '어두운 곳(어둠, 칠흑)에서는 늘 밤입니다: 그곳에서는 낮 보너스를 받지 못합니다.']),
 ('ui.e11-fxx-dark', 'Dark-blind: a unit without Darksight or Nocturnal. The dark places count as night for Nocturnal and Diurnal units. An Illuminate unit lights its own side, and the enemy facing it.', [
   'Aveugle dans le noir : une unité sans Vision nocturne ni Nocturne. Les lieux sombres comptent comme la nuit pour les unités Nocturnes et Diurnes. Une unité Illumination éclaire son camp, et l’ennemi en face d’elle.',
   'Dunkelblind: eine Einheit ohne Dunkelsicht oder Nachtaktiv. Dunkle Orte zählen für nachtaktive und tagaktive Einheiten als Nacht. Eine Einheit mit Erleuchten erhellt ihre Seite und den Feind ihr gegenüber.',
   'Ciega en la oscuridad: una unidad sin Visión oscura ni Nocturna. Los lugares oscuros cuentan como noche para las unidades Nocturnas y Diurnas. Una unidad con Iluminar alumbra su lado y al enemigo que tiene enfrente.',
   'Cieca al buio: un’unità senza Scurovisione né Notturna. I luoghi bui contano come notte per le unità Notturne e Diurne. Un’unità con Illuminare rischiara il suo lato e il nemico che ha di fronte.',
   'Cega no escuro: uma unidade sem Visão no escuro nem Noturna. Os lugares escuros contam como noite para as unidades Noturnas e Diurnas. Uma unidade com Iluminar ilumina o seu lado e o inimigo à sua frente.',
   'Bulag sa dilim: unit na walang Paningin sa Dilim o Panggabi. Itinuturing na gabi ang madidilim na lugar para sa mga unit na Panggabi at Pang-araw. Ang unit na may Pagliwanag ay nagbibigay-liwanag sa sariling panig nito, at sa kaaway na kaharap nito.',
   'இருள்-குருடு: இருள்பார்வையோ இரவுலாவியோ இல்லாத அலகு. இருண்ட இடங்கள் இரவுலாவி, பகலுலாவி அலகுகளுக்கு இரவாகக் கணக்கிடப்படும். ஒளியூட்டு அலகு தன் பக்கத்தையும், தன்னை எதிர்கொள்ளும் எதிரியையும் ஒளிரச் செய்கிறது.',
   'Buta-gelap: unit tanpa Penglihatan Gelap atau Nokturnal. Tempat gelap dihitung sebagai malam bagi unit Nokturnal dan Diurnal. Unit Menerangi menerangi sisinya sendiri, dan musuh di hadapannya.',
   '暗盲：没有暗视或夜行的单位。黑暗之地对夜行与昼行单位视为夜晚。照明单位会照亮己方，以及正对它的敌人。',
   '暗盲：沒有暗視或夜行的單位。黑暗之地對夜行與晝行單位視為夜晚。照明單位會照亮己方，以及正對它的敵人。',
   '闇で目が見えない：暗視も夜行性も持たないユニット。暗い場所は夜行性・昼行性ユニットにとって夜として扱う。照明ユニットは自陣と、正面の敵を照らす。',
   '어둠에 눈먼: 어둠 시야도 야행성도 없는 유닛. 어두운 곳은 야행성과 주행성 유닛에게 밤으로 칩니다. 조명 유닛은 자기 쪽과 마주한 적을 밝힌다.']),
 ('ui.e11-scorching1', "By day (always where there's no night), 2 units a side take 1 fire damage.", [
   "De jour (toujours là où il n’y a pas de nuit), 2 unités par camp subissent 1 dégât de feu.",
   "Bei Tag (immer, wo es keine Nacht gibt) erleiden 2 Einheiten je Seite 1 Feuerschaden.",
   "De día (siempre donde no hay noche), 2 unidades por bando reciben 1 de daño de fuego.",
   "Di giorno (sempre dove non c’è notte), 2 unità per lato subiscono 1 danno da fuoco.",
   "De dia (sempre onde não há noite), 2 unidades de cada lado sofrem 1 de dano de fogo.",
   "Sa araw (palagi kung walang gabi), 2 yunit sa bawat panig ang tatanggap ng 1 pinsalang apoy.",
   "பகலில் (இரவு இல்லாத இடத்தில் எப்போதும்), ஒவ்வொரு பக்கத்திலும் 2 அலகுகள் 1 நெருப்புச் சேதம் பெறும்.",
   "Saat siang (selalu di tempat tanpa malam), 2 unit di tiap sisi menerima 1 kerusakan api.",
   "白天（没有夜晚之处则一直），双方各 2 个单位受到 1 点火焰伤害。",
   "白天（沒有夜晚之處則一直），雙方各 2 個單位受到 1 點火焰傷害。",
   "昼（夜のない場所では常に）、両陣営のユニット2体が火炎ダメージ1。",
   "낮에(밤이 없는 곳에서는 늘) 양쪽 유닛 2체가 화염 피해 1."]),
 ('ui.e11-scorching2', sc(SCORCH_EN, 2, 3), [sc(t, 2, 3) for t in SCORCH_N]),
 ('ui.e11-scorching3', sc(SCORCH_EN, 3, 4), [sc(t, 3, 4) for t in SCORCH_N]),
]
def dump(path, d):
    with open(path, 'w', encoding='utf-8') as fh:
        json.dump(d, fh, ensure_ascii=False, indent=1); fh.write('\n')
ph = lambda s: sorted(set(re.findall(r'\{\w+\}', s)))
TP = os.path.join(ROOT, 'bramblewood-texts.js'); src = open(TP, encoding='utf-8').read()
end = src.index('\n}/*TEXT-TABLE-END*/')
add = [(k, en) for k, en, _ in ROWS if ('"%s":' % k) not in src]
if add:
    src = src[:end] + ',\n' + ',\n'.join('  %s: %s' % (json.dumps(k), json.dumps(en, ensure_ascii=False)) for k, en in add) + src[end:]
    open(TP, 'w', encoding='utf-8').write(src)
for k, en, row in ROWS: assert json.dumps(en, ensure_ascii=False) in src, en
for i, code in enumerate(CODES):
    path = os.path.join(ROOT, 'lang', code + '.json'); pack = json.load(open(path, encoding='utf-8'))
    for k, en, row in ROWS:
        assert len(row) == len(CODES) and ph(en) == ph(row[i]), (code, en)
        if en in pack: continue  # an older, reviewed row wins
        pack[en] = row[i]
    dump(path, pack)
print('texts: %d new keys; wrote %d packs, %d texts each' % (len(add), len(CODES), len(ROWS)))
