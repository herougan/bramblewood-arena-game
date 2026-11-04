#!/usr/bin/env python3
"""Game texts added on 2026-11-04 by package ENG24: Bramble Armor as a Fortify form ("Fortify { Armor N }, while it lives", decision ENG22-2 b),
Fortify's Codex note naming it so, and the four new skills Relict (RELICT-1), Meld {X}, Immunity and Sequestration (RELICT-2). One row per English
text in lang/<code>.json (rows that already exist are kept; new rows are appended, nothing is sorted). Tagalog, Tamil, Japanese and Korean
deserve a native read.
    python3 tools/i18n_2026_11_04_eng24.py   (idempotent)"""
import json, os, re
ROOT = os.path.join(os.path.dirname(os.path.abspath(__file__)), '..')
CODES = ['fr', 'de', 'es', 'it', 'pt', 'tl', 'ta', 'id', 'zh-Hans', 'zh-Hant', 'ja', 'ko']
FORT = ['Fortifier', 'Festigen', 'Fortalecer', 'Rinforzo', 'Reforçar', 'Patibayin', 'வலுப்படுத்து', 'Perkuat', '加固', '加固', '補強', '보강']
ARM = ['Armure', 'Rüstung', 'Armadura', 'Armatura', 'Armadura', 'Baluti', 'கவசம்', 'Zirah', '护甲', '護甲', 'アーマー', '방어구']
LIVES = ['tant qu’il vit', 'solange es lebt', 'mientras viva', 'finché vive', 'enquanto viver', 'habang buhay ito', 'அது உயிருடன் இருக்கும் வரை', 'selama ia hidup', '存活期间', '存活期間', '生きている間', '살아 있는 동안']
SEP = [', ', ', ', ', ', ', ', ', ', ', ', ', ', ', ', '，', '，', '、', ', ']
head = lambda i, n: '%s { %s %s }%s%s' % (FORT[i], ARM[i], n, SEP[i], LIVES[i])
T = [  # English, then the 12 translations in CODES order
 ('Fortify { Armor 1 }, while it lives', [head(i, '1') for i in range(12)]),
 ('Fortify { Armor {n} }, while it lives', [head(i, '{n}') for i in range(12)]),
 ('Relict', ['Relicte', 'Relikt', 'Relicto', 'Relitto', 'Relicto', 'Relikto', 'தொல்லுயிர்', 'Relik', '孑遗', '孑遺', '遺存種', '잔존종']),
 ('Field effects and field-wide skills pass it by, good and bad.', [
   'Les effets de terrain et les compétences sur tout le terrain l’épargnent, bons ou mauvais.',
   'Feldeffekte und feldweite Fähigkeiten gehen an ihm vorbei, gute wie schlechte.',
   'Los efectos de campo y las habilidades de todo el campo no le afectan, buenos o malos.',
   'Gli effetti del campo e le abilità su tutto il campo non lo toccano, buoni o cattivi.',
   'Os efeitos de campo e as habilidades de campo inteiro não o afetam, bons ou maus.',
   'Hindi ito tinatablan ng mga epekto ng larangan at mga skill na pang-buong larangan, mabuti man o masama.',
   'களத்தின் விளைவுகளும் களம் முழுவதுக்குமான திறன்களும், நல்லதோ கெட்டதோ, இதைத் தொடாது.',
   'Efek medan dan skill seluruh medan melewatinya, baik maupun buruk.',
   '场地效果和全场技能对它无效，无论好坏。',
   '場地效果和全場技能對它無效，無論好壞。',
   'フィールド効果と全体スキルは、良くも悪くもこれに及ばない。',
   '필드 효과와 필드 전체 스킬은 좋든 나쁘든 이 유닛을 비켜 갑니다.']),
 ("Weather, the dark, terrain hazards, wind, the tide's water and lane bonuses don't touch it, nor Earthquake, Landslide, Avalanche, Tsunami, Tornado, Poison Gas, Absolute Zero or Nova. Single-target skills still do.", [
   'Ni la météo, ni l’obscurité, ni les dangers du terrain, ni le vent, ni l’eau de la marée, ni les bonus de couloir ne le touchent, pas plus que Séisme, Éboulement, Avalanche, Tsunami, Tornade, Gaz toxique, Zéro absolu ou Nova. Les compétences à cible unique, si.',
   'Wetter, Dunkelheit, Geländegefahren, Wind, das Wasser der Flut und Bahnboni berühren es nicht, ebenso wenig Erdbeben, Erdrutsch, Lawine, Tsunami, Tornado, Giftgas, Absoluter Nullpunkt oder Nova. Fähigkeiten mit einem Ziel schon.',
   'No le afectan el clima, la oscuridad, los peligros del terreno, el viento, el agua de la marea ni las bonificaciones de carril, ni Terremoto, Derrumbe, Avalancha, Tsunami, Tornado, Gas venenoso, Cero absoluto o Nova. Las habilidades de un solo objetivo, sí.',
   'Non lo toccano il tempo, il buio, i pericoli del terreno, il vento, l’acqua della marea né i bonus di corsia, né Terremoto, Frana, Valanga, Tsunami, Tornado, Gas velenoso, Zero assoluto o Nova. Le abilità a bersaglio singolo sì.',
   'Não o afetam o tempo, o escuro, os perigos do terreno, o vento, a água da maré nem os bónus de faixa, nem Terramoto, Deslizamento, Avalanche, Tsunami, Tornado, Gás venenoso, Zero absoluto ou Nova. As habilidades de alvo único, sim.',
   'Hindi ito tinatamaan ng panahon, dilim, panganib ng lupain, hangin, tubig ng alon at bonus ng linya, o ng Lindol, Pagguho, Avalanche, Tsunami, Buhawi, Lasong Gas, Absolute Zero o Nova. Tinatamaan pa rin ito ng mga skill na iisa ang target.',
   'வானிலை, இருள், நில ஆபத்துகள், காற்று, அலையின் நீர், பாதை போனஸ்கள் இதைத் தொடாது; நிலநடுக்கம், நிலச்சரிவு, பனிச்சரிவு, சுனாமி, சூறாவளி, நச்சு வாயு, முழுப் பூஜ்யம், நோவாவும் அப்படியே. ஒற்றை இலக்குத் திறன்கள் இன்னும் தாக்கும்.',
   'Cuaca, gelap, bahaya medan, angin, air pasang, dan bonus lajur tidak menyentuhnya, begitu pula Gempa, Longsor, Longsor Salju, Tsunami, Tornado, Gas Racun, Nol Mutlak, atau Nova. Skill satu sasaran tetap mengenainya.',
   '天气、黑暗、地形危害、风、潮水和路线加成都不影响它，地震、山崩、雪崩、海啸、龙卷风、毒气、绝对零度和新星也不影响。单体技能仍然有效。',
   '天氣、黑暗、地形危害、風、潮水和路線加成都不影響它，地震、山崩、雪崩、海嘯、龍捲風、毒氣、絕對零度和新星也不影響。單體技能仍然有效。',
   '天候、暗闇、地形の危険、風、潮の水、レーンボーナスはこれに及ばず、地震・地すべり・雪崩・津波・竜巻・毒ガス・絶対零度・ノヴァも同じ。単体対象のスキルは効く。',
   '날씨, 어둠, 지형 위험, 바람, 조수의 물, 레인 보너스가 닿지 않으며 지진, 산사태, 눈사태, 쓰나미, 토네이도, 독가스, 절대영도, 노바도 마찬가지입니다. 단일 대상 스킬은 여전히 통합니다.']),
 ('Meld', ['Fusion', 'Verschmelzen', 'Fusión', 'Fusione', 'Fusão', 'Pagsanib', 'இணைவு', 'Lebur', '融合', '融合', '融合', '융합']),
 ('Meld { {x} }', ['Fusion { {x} }', 'Verschmelzen { {x} }', 'Fusión { {x} }', 'Fusione { {x} }', 'Fusão { {x} }', 'Pagsanib { {x} }', 'இணைவு { {x} }', 'Lebur { {x} }', '融合 { {x} }', '融合 { {x} }', '融合 { {x} }', '융합 { {x} }']),
 ('Your other Meld units have {x} while it lives.', [
   'Vos autres unités Fusion ont {x} tant qu’il vit.', 'Deine anderen Verschmelzen-Einheiten haben {x}, solange es lebt.', 'Tus otras unidades con Fusión tienen {x} mientras viva.',
   'Le tue altre unità con Fusione hanno {x} finché vive.', 'As tuas outras unidades com Fusão têm {x} enquanto viver.', 'May {x} ang iba mong yunit na may Pagsanib habang buhay ito.',
   'இது உயிருடன் இருக்கும் வரை உன் மற்ற இணைவு அலகுகளுக்கு {x}.', 'Unit Lebur-mu yang lain punya {x} selama ia hidup.', '它存活期间，你的其他融合单位拥有 {x}。',
   '它存活期間，你的其他融合單位擁有 {x}。', 'これが生きている間、他の融合ユニットは{x}を持つ。', '살아 있는 동안 다른 융합 유닛이 {x}을(를) 얻습니다.']),
 ('Like a hive: every Meld unit shares its braces with the other Meld units on your side, not with itself.', [
   'Comme une ruche : chaque unité Fusion partage ses accolades avec les autres unités Fusion de votre camp, pas avec elle-même.',
   'Wie ein Schwarm: Jede Verschmelzen-Einheit teilt ihre Klammern mit den anderen Verschmelzen-Einheiten deiner Seite, nicht mit sich selbst.',
   'Como una colmena: cada unidad con Fusión comparte sus llaves con las demás unidades con Fusión de tu lado, no consigo misma.',
   'Come un alveare: ogni unità con Fusione condivide le sue graffe con le altre unità con Fusione del tuo lato, non con sé stessa.',
   'Como uma colmeia: cada unidade com Fusão partilha as suas chavetas com as outras unidades com Fusão do teu lado, não consigo mesma.',
   'Parang pugad: ibinabahagi ng bawat yunit na may Pagsanib ang braces nito sa ibang yunit na may Pagsanib sa panig mo, hindi sa sarili nito.',
   'ஒரு கூட்டைப் போல: ஒவ்வொரு இணைவு அலகும் தன் அடைப்புக்குறிகளை உன் பக்கத்தின் மற்ற இணைவு அலகுகளுடன் பகிரும், தனக்கல்ல.',
   'Seperti sarang: setiap unit Lebur berbagi isi kurung kurawalnya dengan unit Lebur lain di pihakmu, bukan dengan dirinya sendiri.',
   '像蜂巢一样：每个融合单位把括号里的技能分给你方其他融合单位，不给自己。',
   '像蜂巢一樣：每個融合單位把括號裡的技能分給你方其他融合單位，不給自己。',
   '群れのように：融合ユニットは括弧の中身を味方の他の融合ユニットと分け合う（自分自身には付かない）。',
   '벌집처럼: 융합 유닛마다 중괄호의 스킬을 내 편의 다른 융합 유닛과 나눕니다. 자신에게는 주지 않습니다.']),
 ('Immunity', ['Immunité', 'Immunität', 'Inmunidad', 'Immunità', 'Imunidade', 'Imyunidad', 'நோயெதிர்ப்பு', 'Imunitas', '免疫', '免疫', '免疫', '면역']),
 ("It can't be Poisoned or catch Decay, Toxin or other sickness.", [
   'Il ne peut pas être Empoisonné ni attraper Pourriture, Toxine ou autre maladie.', 'Es kann nicht vergiftet werden und fängt sich weder Verfall, Toxin noch andere Krankheit ein.',
   'No puede ser Envenenado ni contraer Descomposición, Toxina u otra enfermedad.', 'Non può essere Avvelenato né prendere Decadimento, Tossina o altre malattie.',
   'Não pode ser Envenenado nem apanhar Decomposição, Toxina ou outra doença.', 'Hindi ito malalason o mahahawaan ng Bulok, Toxin o ibang sakit.',
   'இதற்கு நஞ்சு ஏறாது; சிதைவு, நச்சுப்பொருள் அல்லது வேறு நோயும் பிடிக்காது.', 'Ia tak bisa Teracuni atau terkena Busuk, Toksin, atau penyakit lain.',
   '它不会中毒，也不会染上腐朽、毒素或其他疾病。', '它不會中毒，也不會染上腐朽、毒素或其他疾病。', '毒にならず、腐敗・トキシンなどの病にもかからない。', '중독되지 않으며 부패, 독소 같은 병에도 걸리지 않습니다.']),
 ("Stops Poison, Greater Poison, Toxin, Decay (and Decay damage's Attack loss), Swamp Fever and Spore Cloud. Poison or decay damage still hurts.", [
   'Bloque Poison, Poison supérieur, Toxine, Pourriture (et la perte d’Attaque des dégâts de Pourriture), Fièvre des marais et Nuage de spores. Les dégâts de poison ou de pourriture font toujours mal.',
   'Verhindert Gift, Starkes Gift, Toxin, Verfall (und den Angriffsverlust durch Verfallsschaden), Sumpffieber und Sporenwolke. Gift- oder Verfallsschaden trifft trotzdem.',
   'Detiene Veneno, Veneno mayor, Toxina, Descomposición (y la pérdida de Ataque por daño de descomposición), Fiebre del pantano y Nube de esporas. El daño de veneno o de descomposición sigue doliendo.',
   'Ferma Veleno, Veleno superiore, Tossina, Decadimento (e la perdita di Attacco dei danni da decadimento), Febbre di palude e Nube di spore. I danni da veleno o decadimento colpiscono ancora.',
   'Trava Veneno, Veneno maior, Toxina, Decomposição (e a perda de Ataque do dano de decomposição), Febre do pântano e Nuvem de esporos. O dano de veneno ou de decomposição ainda dói.',
   'Pinipigilan ang Lason, Matinding Lason, Toxin, Bulok (at ang bawas sa Atake ng pinsalang Bulok), Lagnat ng Latian at Ulap ng Spore. Masakit pa rin ang pinsalang lason o bulok.',
   'நஞ்சு, பெருநஞ்சு, நச்சுப்பொருள், சிதைவு (சிதைவு சேதத்தின் தாக்குதல் இழப்பும்), சதுப்புக் காய்ச்சல், வித்து மேகம் ஆகியவற்றைத் தடுக்கும். நஞ்சு அல்லது சிதைவு சேதம் இன்னும் வலிக்கும்.',
   'Menghentikan Racun, Racun Besar, Toksin, Busuk (dan hilangnya Serangan oleh kerusakan Busuk), Demam Rawa, dan Awan Spora. Kerusakan racun atau busuk tetap melukai.',
   '阻止中毒、强毒、毒素、腐朽（及腐朽伤害造成的攻击下降）、沼泽热和孢子云。毒素或腐朽伤害仍会造成伤害。',
   '阻止中毒、強毒、毒素、腐朽（及腐朽傷害造成的攻擊下降）、沼澤熱和孢子雲。毒素或腐朽傷害仍會造成傷害。',
   '毒・強毒・トキシン・腐敗（腐敗ダメージの攻撃低下も）・沼地熱・胞子雲を防ぐ。毒や腐敗のダメージ自体は受ける。',
   '독, 강독, 독소, 부패(부패 피해의 공격력 감소 포함), 늪지열, 포자 구름을 막습니다. 독이나 부패 피해 자체는 여전히 받습니다.']),
 ('Sequestration', ['Séquestre', 'Beschlagnahme', 'Secuestro', 'Sequestro', 'Sequestro', 'Pagkumpiska', 'பறிமுதல்', 'Sita', '夺技', '奪技', '奪取', '압류']),
 ("Its hit steals the target's status skills until the end of next round.", [
   'Son coup vole les compétences d’état de la cible jusqu’à la fin de la manche suivante.', 'Sein Treffer stiehlt die Zustandsfähigkeiten des Ziels bis zum Ende der nächsten Runde.',
   'Su golpe roba las habilidades de estado del objetivo hasta el final de la siguiente ronda.', 'Il suo colpo ruba le abilità di stato del bersaglio fino alla fine del round seguente.',
   'O seu golpe rouba as habilidades de estado do alvo até ao fim da ronda seguinte.', 'Ninanakaw ng tama nito ang mga status skill ng target hanggang matapos ang susunod na round.',
   'இதன் அடி இலக்கின் நிலைத் திறன்களை அடுத்த சுற்றின் முடிவு வரை பறிக்கும்.', 'Pukulannya mencuri skill status sasaran sampai akhir ronde berikutnya.',
   '它的攻击会夺走目标的状态技能，直到下一回合结束。', '它的攻擊會奪走目標的狀態技能，直到下一回合結束。', '攻撃が当たると、次のラウンドの終わりまで相手の状態スキルを奪う。', '공격이 맞으면 다음 라운드가 끝날 때까지 대상의 상태 스킬을 빼앗습니다.']),
 ('Status skills: Poison, Bleed, Decay, Sleep, Freeze, Stun, Blind and the like; never shots or damage skills. One steal at a time.', [
   'Compétences d’état : Poison, Saignement, Pourriture, Sommeil, Gel, Étourdissement, Cécité et autres ; jamais les tirs ni les compétences de dégâts. Un vol à la fois.',
   'Zustandsfähigkeiten: Gift, Blutung, Verfall, Schlaf, Frost, Betäubung, Blindheit und ähnliche; nie Schüsse oder Schadensfähigkeiten. Ein Diebstahl auf einmal.',
   'Habilidades de estado: Veneno, Sangrado, Descomposición, Sueño, Congelación, Aturdimiento, Ceguera y similares; nunca disparos ni habilidades de daño. Un robo a la vez.',
   'Abilità di stato: Veleno, Sanguinamento, Decadimento, Sonno, Gelo, Stordimento, Cecità e simili; mai tiri o abilità di danno. Un furto alla volta.',
   'Habilidades de estado: Veneno, Sangramento, Decomposição, Sono, Congelamento, Atordoamento, Cegueira e afins; nunca tiros nem habilidades de dano. Um roubo de cada vez.',
   'Mga status skill: Lason, Dugo, Bulok, Tulog, Yelo, Stun, Bulag at iba pa; hindi kailanman ang mga tira o damage skill. Isang nakaw sa bawat pagkakataon.',
   'நிலைத் திறன்கள்: நஞ்சு, இரத்தப்போக்கு, சிதைவு, தூக்கம், உறைவு, மயக்கம், குருடு போன்றவை; அம்புகளோ சேதத் திறன்களோ ஒருபோதும் இல்லை. ஒரு நேரத்தில் ஒரு பறிப்பு.',
   'Skill status: Racun, Pendarahan, Busuk, Tidur, Beku, Pingsan, Buta, dan sejenisnya; bukan tembakan atau skill kerusakan. Satu curian sekali waktu.',
   '状态技能：中毒、流血、腐朽、睡眠、冰冻、眩晕、致盲等；绝不包括射击或伤害技能。一次只夺一份。',
   '狀態技能：中毒、流血、腐朽、睡眠、冰凍、暈眩、致盲等；絕不包括射擊或傷害技能。一次只奪一份。',
   '状態スキル：毒・出血・腐敗・睡眠・凍結・スタン・盲目など。射撃やダメージスキルは対象外。奪えるのは一度に一つの相手から。',
   '상태 스킬: 독, 출혈, 부패, 수면, 빙결, 기절, 실명 등. 사격이나 피해 스킬은 아닙니다. 한 번에 하나만 빼앗습니다.']),
]
# Fortify's Codex note (ENG22) named Bramble Armor in its last sentence; ENG24 names the Fortify form there. The new row keeps each pack's
# own translation up to that sentence and replaces the sentence.
CODEX_OLD = 'Parts: +N Health (its Health and its top), Thorns N (a unit that hits the bramble takes N), Regen N (each round heals one wounded ally N), Bolt N (each round, N at a random enemy unit), +N Shield. Several add up. Bramble Armor is different: 1 less a hit while its unit lives.'
CODEX_NEW = CODEX_OLD.replace('Bramble Armor is different', 'Fortify { Armor 1 }, while it lives, is different')
MARK = ['L’Armure du roncier', 'Dornenrüstung ist', 'La Armadura del zarzal', 'L’Armatura del rovo', 'A Armadura do silvado', 'Iba ang Baluti', 'முட்புதர் கவசம் வேறு', 'Zirah Semak berbeda', '荆棘护甲不同', '荊棘護甲不同', 'いばらの鎧は別物', '덤불 갑옷은 다릅니다']
LAST = ['« %s » est autre chose : 1 de moins par coup tant que son unité vit.', '„%s“ ist etwas anderes: 1 weniger pro Treffer, solange ihre Einheit lebt.',
        '«%s» es otra cosa: 1 menos por golpe mientras su unidad vive.', '«%s» è diverso: 1 in meno a colpo finché la sua unità vive.', '«%s» é outra coisa: 1 a menos por golpe enquanto a sua unidade vive.',
        'Iba ang "%s": 1 bawas bawat tama habang buhay ang yunit nito.', '"%s" வேறு: அதன் அலகு உயிரோடிருக்கும்வரை ஒவ்வொரு அடிக்கும் 1 குறைவு.', '"%s" berbeda: 1 lebih sedikit per pukulan selama unitnya hidup.',
        '“%s”不同：其单位存活时每次受击少 1。', '「%s」不同：其單位存活時每次受擊少 1。', '「%s」は別物：そのユニットが生きている間、1撃ごとに1少なくなる。', '"%s"은(는) 다릅니다: 그 유닛이 살아 있는 동안 한 번 맞을 때마다 1 적게 받습니다.']
ph = lambda s: sorted(set(re.findall(r'\{\w+\}', s)))
def dump(path, d):
    with open(path, 'w', encoding='utf-8') as fh:
        json.dump(d, fh, ensure_ascii=False, indent=1); fh.write('\n')
added = 0
for i, code in enumerate(CODES):
    path = os.path.join(ROOT, 'lang', code + '.json'); pack = json.load(open(path, encoding='utf-8'))
    rows = list(T)
    old = pack.get(CODEX_OLD)
    if old and MARK[i] in old: rows.append((CODEX_NEW, [None] * i + [old[:old.index(MARK[i])] + LAST[i] % head(i, '1')] + [None] * (11 - i)))
    for en, row in rows:
        assert len(row) == 12 and ph(en) == ph(row[i]), (code, en)
        if en not in pack: added += 1
        pack.setdefault(en, row[i])
    dump(path, pack)
print('ok: %d rows added across %d packs' % (added, len(CODES)))
