#!/usr/bin/env python3
"""Game texts changed and added on 2026-10-22 by package GD2 (the owner's answers to GD-1 .. GD-4, 19:27).

  * GD-1 ("things that deal with L/R can just say 'adjacent'"): the skill lines that said "beside it", "next to it", "either side of
    it" or "its neighbour" say "adjacent" now, and the Codex term Adjacent is defined as left / right (and in a raid, in front / behind).
  * GD-3: Guardian takes plain attacks only (its two lines), and the new Spellshield (4 TX keys).

Three kinds of rows:
  UI   lang/ui/<code>.json (literal strings of arena_app.js, keyed by English with {v1} placeholders): the old English row is renamed to the
       new English with the new translation. A pack without the old row keeps falling back to English, as before (nothing is added).
  FRAG the same for a long row, by replacing one fragment of the existing translation (asserted to be there).
  TX   lang/<code>.json (TX keys, keyed by English): old row renamed to the new English with the new translation; new rows added.
Every {placeholder} is kept (checked). A log line's leading emoji is not part of its row (the template matcher strips it). Tagalog, Tamil, Japanese and Korean deserve a native read.

    python3 tools/i18n_2026_10_22_gd2.py
"""
import json, os, re
ROOT = os.path.join(os.path.dirname(os.path.abspath(__file__)), '..')
CODES = ['fr', 'de', 'es', 'it', 'pt', 'tl', 'ta', 'id', 'zh-Hans', 'zh-Hant', 'ja', 'ko']

UI = [
("At the start of every round it deals {v1} fire damage to the units next to it, yours and theirs, and to the enemy facing it.",
 "At the start of every round it deals {v1} fire damage to the units adjacent to it and to the enemy facing it.", [
 "Au début de chaque tour, elle inflige {v1} dégâts de feu aux unités adjacentes et à l’ennemi en face.",
 "Zu Beginn jeder Runde fügt sie den angrenzenden Einheiten und dem Gegner gegenüber {v1} Feuerschaden zu.",
 "Al inicio de cada ronda inflige {v1} de daño de fuego a las unidades adyacentes y al enemigo de enfrente.",
 "All’inizio di ogni round infligge {v1} danni da fuoco alle unità adiacenti e al nemico di fronte.",
 "No início de cada ronda, causa {v1} de dano de fogo às unidades adjacentes e ao inimigo à sua frente.",
 "Sa simula ng bawat round, nagdudulot ito ng {v1} pinsalang apoy sa mga katabing yunit at sa kalabang nasa harap nito.",
 "ஒவ்வொரு சுற்றின் தொடக்கத்திலும் அடுத்துள்ள அலகுகளுக்கும் எதிரே உள்ள எதிரிக்கும் {v1} நெருப்புச் சேதம் செய்கிறது.",
 "Di awal setiap ronde, memberi {v1} kerusakan api ke unit yang bersebelahan dengannya dan ke musuh di depannya.",
 "每轮开始时，对相邻的单位以及对面的敌人造成 {v1} 点火焰伤害。", "每輪開始時，對相鄰的單位以及對面的敵人造成 {v1} 點火焰傷害。",
 "毎ラウンド開始時、隣接するユニットと正面の敵に火炎ダメージ{v1}。", "매 라운드 시작 시 인접한 유닛과 마주한 적에게 화염 피해 {v1}을 줘요."]),
("Speed +2 for itself and Speed +1 for the allies beside it, while it lives.",
 "Speed +2 for itself and Speed +1 for its adjacent allies, while it lives.", [
 "Vitesse +2 pour elle-même et Vitesse +1 pour ses alliés adjacents, tant qu’elle vit.", "Tempo +2 für sich selbst und Tempo +1 für angrenzende Verbündete, solange sie lebt.",
 "Velocidad +2 para sí misma y Velocidad +1 para sus aliados adyacentes, mientras viva.", "Velocità +2 per sé e Velocità +1 per gli alleati adiacenti, finché vive.",
 "Velocidade +2 para si e Velocidade +1 para os aliados adjacentes, enquanto viver.", "Bilis +2 para sa sarili at Bilis +1 para sa mga katabing kakampi, habang buhay ito.",
 "தனக்கு வேகம் +2, அடுத்துள்ள கூட்டாளிகளுக்கு வேகம் +1, அது உயிருடன் இருக்கும் வரை.", "Kecepatan +2 untuk dirinya dan Kecepatan +1 untuk sekutu yang bersebelahan, selama ia hidup.",
 "存活期间，自身速度 +2，相邻的友方速度 +1。", "存活期間，自身速度 +2，相鄰的友方速度 +1。", "生きている間、自身のスピード+2、隣接する味方のスピード+1。", "살아 있는 동안 자신은 속도 +2, 인접한 아군은 속도 +1."]),
("As it attacks, the allies either side of it get +{v1} Attack for their next swing.",
 "As it attacks, its adjacent allies get +{v1} Attack for their next swing.", [
 "Quand elle attaque, ses alliés adjacents reçoivent +{v1} Attaque pour leur prochain coup.", "Wenn sie angreift, bekommen angrenzende Verbündete +{v1} Angriff für ihren nächsten Schlag.",
 "Al atacar, sus aliados adyacentes reciben +{v1} de Ataque para su próximo golpe.", "Quando attacca, gli alleati adiacenti ricevono +{v1} Attacco per il prossimo colpo.",
 "Ao atacar, os aliados adjacentes recebem +{v1} de Ataque no próximo golpe.", "Kapag umaatake ito, may +{v1} Atake ang mga katabing kakampi sa susunod nilang hampas.",
 "இது தாக்கும்போது, அடுத்துள்ள கூட்டாளிகள் தங்கள் அடுத்த அடிக்கு +{v1} தாக்குதல் பெறுகின்றன.", "Saat menyerang, sekutu yang bersebelahan mendapat +{v1} Serangan untuk pukulan berikutnya.",
 "它攻击时，相邻的友方下一击 +{v1} 攻击。", "它攻擊時，相鄰的友方下一擊 +{v1} 攻擊。", "攻撃するとき、隣接する味方は次の一撃で攻撃+{v1}。", "공격할 때 인접한 아군이 다음 공격에 공격력 +{v1}을 얻어요."]),
("A drawback: when it attacks, it deals {v1} damage to each ally beside it.",
 "A drawback: when it attacks, it deals {v1} damage to each adjacent ally.", [
 "Un inconvénient : quand elle attaque, elle inflige {v1} dégâts à chaque allié adjacent.", "Ein Nachteil: Wenn sie angreift, fügt sie jedem angrenzenden Verbündeten {v1} Schaden zu.",
 "Un inconveniente: al atacar, inflige {v1} de daño a cada aliado adyacente.", "Uno svantaggio: quando attacca, infligge {v1} danni a ogni alleato adiacente.",
 "Uma desvantagem: ao atacar, causa {v1} de dano a cada aliado adjacente.", "Isang kahinaan: kapag umaatake ito, nagdudulot ito ng {v1} pinsala sa bawat katabing kakampi.",
 "ஒரு குறை: இது தாக்கும்போது அடுத்துள்ள ஒவ்வொரு கூட்டாளிக்கும் {v1} சேதம் செய்கிறது.", "Kelemahan: saat menyerang, ia memberi {v1} kerusakan ke setiap sekutu yang bersebelahan.",
 "一个缺点：它攻击时，对每个相邻的友方造成 {v1} 点伤害。", "一個缺點：它攻擊時，對每個相鄰的友方造成 {v1} 點傷害。", "欠点：攻撃するとき、隣接する味方それぞれに{v1}ダメージを与える。", "단점: 공격할 때 인접한 아군 각각에게 {v1} 피해를 줘요."]),
("Single-target hits aimed at an ally beside it, in front of it or behind it land on this card instead. Area hits don't.",
 "Plain attacks aimed at an adjacent ally land on this card instead. Skills and area hits don't.", [
 "Les attaques simples visant un allié adjacent touchent cette carte à la place. Pas les compétences ni les coups de zone.",
 "Normale Angriffe auf einen angrenzenden Verbündeten treffen stattdessen diese Karte. Fähigkeiten und Flächentreffer nicht.",
 "Los ataques normales dirigidos a un aliado adyacente impactan en esta carta. Las habilidades y los golpes de área no.",
 "Gli attacchi normali diretti a un alleato adiacente colpiscono invece questa carta. Abilità e colpi ad area no.",
 "Ataques normais contra um aliado adjacente atingem esta carta. Habilidades e golpes em área não.",
 "Ang mga karaniwang atake na nakatutok sa katabing kakampi ay tatama sa card na ito. Hindi kasama ang mga skill at mga tirang pang-area.",
 "அடுத்துள்ள கூட்டாளியை நோக்கிய சாதாரணத் தாக்குதல்கள் அதற்குப் பதிலாக இந்த அட்டையைத் தாக்கும். திறன்களும் பரப்புத் தாக்குதல்களும் அல்ல.",
 "Serangan biasa yang diarahkan ke sekutu yang bersebelahan mengenai kartu ini. Skill dan serangan area tidak.",
 "瞄准相邻友方的普通攻击会改为命中这张卡。技能和范围攻击不会。", "瞄準相鄰友方的普通攻擊會改為命中這張卡。技能和範圍攻擊不會。",
 "隣接する味方を狙った通常攻撃は、代わりにこのカードに当たる。スキルと範囲攻撃は対象外。", "인접한 아군을 노린 일반 공격은 대신 이 카드에 맞아요. 스킬과 범위 공격은 제외."]),
("Takes the single-target hits aimed at the allies beside, in front of and behind it.",
 "Takes the plain attacks aimed at its adjacent allies.", [
 "Encaisse les attaques simples visant ses alliés adjacents.", "Fängt normale Angriffe auf angrenzende Verbündete ab.", "Recibe los ataques normales dirigidos a sus aliados adyacentes.",
 "Incassa gli attacchi normali diretti agli alleati adiacenti.", "Recebe os ataques normais contra os aliados adjacentes.", "Sinasalo ang mga karaniwang atake na nakatutok sa mga katabing kakampi nito.",
 "அடுத்துள்ள கூட்டாளிகளை நோக்கிய சாதாரணத் தாக்குதல்களை ஏற்கும்.", "Menerima serangan biasa yang diarahkan ke sekutu yang bersebelahan.",
 "替相邻的友方承受普通攻击。", "替相鄰的友方承受普通攻擊。", "隣接する味方を狙った通常攻撃を引き受ける。", "인접한 아군을 노린 일반 공격을 대신 받아요."]),
("Its hits call red lightning: {v1} damage to the target and a unit beside it, ignoring Armor.",
 "Its hits call red lightning: {v1} damage to the target and a unit adjacent to it, ignoring Armor.", [
 "Ses coups appellent un éclair rouge : {v1} dégâts à la cible et à une unité adjacente, en ignorant l’Armure.",
 "Ihre Treffer rufen roten Blitz herbei: {v1} Schaden am Ziel und an einer angrenzenden Einheit, Rüstung wird ignoriert.",
 "Sus golpes invocan un rayo rojo: {v1} de daño al objetivo y a una unidad adyacente, ignorando la Armadura.",
 "I suoi colpi richiamano un fulmine rosso: {v1} danni al bersaglio e a un’unità adiacente, ignorando l’Armatura.",
 "Os seus golpes chamam relâmpagos vermelhos: {v1} de dano ao alvo e a uma unidade adjacente, ignorando a Armadura.",
 "Tumatawag ng pulang kidlat ang mga tama nito: {v1} pinsala sa target at sa isang katabing yunit nito, hindi pinapansin ang Baluti.",
 "இதன் அடிகள் சிவப்பு மின்னலை அழைக்கின்றன: கவசத்தைப் புறக்கணித்து இலக்குக்கும் அதற்கு அடுத்துள்ள ஒரு அலகுக்கும் {v1} சேதம்.",
 "Pukulannya memanggil petir merah: {v1} kerusakan ke target dan satu unit yang bersebelahan dengannya, mengabaikan Zirah.",
 "它的攻击召来红色闪电：对目标和一个与其相邻的单位造成 {v1} 点伤害，无视护甲。", "它的攻擊召來紅色閃電：對目標和一個與其相鄰的單位造成 {v1} 點傷害，無視護甲。",
 "攻撃が赤い雷を呼ぶ：対象とそれに隣接するユニット1体に{v1}ダメージ、アーマー無視。", "공격이 붉은 번개를 불러요: 대상과 인접한 유닛 하나에 방어력을 무시하고 {v1} 피해."]),
("Its hits arc to a unit beside the target for {v1} lightning damage.",
 "Its hits arc to a unit adjacent to the target for {v1} lightning damage.", [
 "Ses coups rebondissent sur une unité adjacente à la cible pour {v1} dégâts de foudre.", "Ihre Treffer springen auf eine an das Ziel angrenzende Einheit über, für {v1} Blitzschaden.",
 "Sus golpes saltan a una unidad adyacente al objetivo por {v1} de daño eléctrico.", "I suoi colpi saltano a un’unità adiacente al bersaglio per {v1} danni da fulmine.",
 "Os seus golpes saltam para uma unidade adjacente ao alvo com {v1} de dano elétrico.", "Tumatalon ang mga tama nito sa yunit na katabi ng target, {v1} pinsalang kidlat.",
 "இதன் அடிகள் இலக்குக்கு அடுத்துள்ள அலகுக்குத் தாவி {v1} மின்னல் சேதம் செய்கின்றன.", "Pukulannya melompat ke unit yang bersebelahan dengan target dengan {v1} kerusakan petir.",
 "它的攻击会跳到与目标相邻的一个单位，造成 {v1} 点闪电伤害。", "它的攻擊會跳到與目標相鄰的一個單位，造成 {v1} 點閃電傷害。",
 "攻撃が対象に隣接するユニットに飛び火し、雷ダメージ{v1}。", "공격이 대상과 인접한 유닛으로 튀어 번개 피해 {v1}."]),
("Chain Lightning {v1}: its hits chain lightning on through 2 more enemy units beside the target",
 "Chain Lightning {v1}: its hits chain lightning on through 2 more enemy units adjacent to the target", [
 "Chaîne d’éclairs {v1} : ses coups enchaînent la foudre sur 2 autres unités ennemies adjacentes à la cible",
 "Kettenblitz {v1}: ihre Treffer schicken Blitze durch 2 weitere angrenzende gegnerische Einheiten",
 "Cadena de rayos {v1}: sus golpes encadenan rayos por 2 unidades enemigas más adyacentes al objetivo",
 "Fulmine a catena {v1}: i suoi colpi propagano un fulmine su altre 2 unità nemiche adiacenti al bersaglio",
 "Relâmpago em cadeia {v1}: os seus golpes propagam relâmpagos por mais 2 unidades inimigas adjacentes ao alvo",
 "Kadenang Kidlat {v1}: kumakalat ang kidlat ng mga tama nito sa 2 pang kalabang yunit na katabi ng target",
 "சங்கிலி மின்னல் {v1}: இதன் அடிகள் இலக்குக்கு அடுத்துள்ள இன்னும் 2 எதிரி அலகுகளுக்கு மின்னலைப் பரப்புகின்றன",
 "Petir Berantai {v1}: pukulannya merambatkan petir ke 2 unit musuh lagi yang bersebelahan dengan target",
 "连锁闪电 {v1}：它的攻击会连锁到与目标相邻的另外 2 个敌方单位", "連鎖閃電 {v1}：它的攻擊會連鎖到與目標相鄰的另外 2 個敵方單位",
 "連鎖雷{v1}：攻撃が対象に隣接する敵ユニットさらに2体へ連鎖する", "연쇄 번개 {v1}: 공격이 대상과 인접한 적 유닛 2체로 번개를 이어요"]),
("Its hits chain lightning on through 2 more enemy units beside the target, {v1} lightning damage each.",
 "Its hits chain lightning on through 2 more enemy units adjacent to the target, {v1} lightning damage each.", [
 "Ses coups enchaînent la foudre sur 2 autres unités ennemies adjacentes à la cible, {v1} dégâts de foudre chacune.",
 "Ihre Treffer schicken Kettenblitze durch 2 weitere angrenzende gegnerische Einheiten, je {v1} Blitzschaden.",
 "Sus golpes encadenan rayos por 2 unidades enemigas más adyacentes al objetivo, {v1} de daño eléctrico cada una.",
 "I suoi colpi propagano un fulmine a catena su altre 2 unità nemiche adiacenti al bersaglio, {v1} danni da fulmine ciascuna.",
 "Os seus golpes propagam relâmpagos em cadeia por mais 2 unidades inimigas adjacentes ao alvo, {v1} de dano elétrico cada.",
 "Kumakalat ang kadenang kidlat ng mga tama nito sa 2 pang kalabang yunit na katabi ng target, {v1} pinsalang kidlat bawat isa.",
 "இதன் அடிகள் இலக்குக்கு அடுத்துள்ள இன்னும் 2 எதிரி அலகுகளுக்குச் சங்கிலி மின்னலாகப் பரவுகின்றன, தலா {v1} மின்னல் சேதம்.",
 "Pukulannya merambatkan petir berantai ke 2 unit musuh lagi yang bersebelahan dengan target, masing-masing {v1} kerusakan petir.",
 "它的攻击会让闪电连锁到与目标相邻的另外 2 个敌方单位，各造成 {v1} 点闪电伤害。", "它的攻擊會讓閃電連鎖到與目標相鄰的另外 2 個敵方單位，各造成 {v1} 點閃電傷害。",
 "攻撃が対象に隣接する敵ユニットさらに2体へ連鎖し、それぞれ雷ダメージ{v1}。", "공격이 대상과 인접한 적 유닛 2체에 연쇄 번개로 이어져 각각 번개 피해 {v1}."]),
("the columns to its left, centre and right.",
 "directly left or right; in a raid, also directly in front or behind.", [
 "les unités juste à sa gauche et à sa droite ; en raid, aussi juste devant et derrière elle.", "die Einheiten direkt links und rechts davon; im Raid auch direkt davor und dahinter.",
 "las unidades justo a su izquierda y derecha; en una incursión, también justo delante y detrás.", "le unità subito a sinistra e a destra; in un raid, anche subito davanti e dietro.",
 "as unidades logo à esquerda e à direita; numa incursão, também logo à frente e atrás.", "ang mga yunit na nasa mismong kaliwa at kanan nito; sa raid, pati ang nasa mismong harap at likod nito.",
 "அதன் நேர் இடது மற்றும் வலது பக்க அலகுகள்; ரெய்டில் நேர் முன்னும் பின்னும் உள்ளவையும்.", "unit tepat di kiri dan kanannya; dalam raid, juga tepat di depan dan di belakangnya.",
 "紧挨在它左边和右边的单位；在突袭中，也包括紧挨在它前方和后方的单位。", "緊挨在它左邊和右邊的單位；在突襲中，也包括緊挨在它前方和後方的單位。",
 "すぐ左と右のユニット。レイドでは、すぐ前と後ろのユニットも。", "바로 왼쪽과 오른쪽의 유닛. 레이드에서는 바로 앞과 뒤의 유닛도."]),
("Friction: hurts the allies beside it when it attacks", "Friction: hurts its adjacent allies when it attacks", [
 "Friction : blesse ses alliés adjacents quand elle attaque", "Reibung: verletzt beim Angriff angrenzende Verbündete", "Fricción: hiere a sus aliados adyacentes cuando ataca",
 "Attrito: ferisce gli alleati adiacenti quando attacca", "Fricção: fere os aliados adjacentes quando ataca", "Kiskisan: sinasaktan ang mga katabing kakampi kapag umaatake",
 "உராய்வு: தாக்கும்போது அடுத்துள்ள கூட்டாளிகளைக் காயப்படுத்துகிறது", "Gesekan: melukai sekutu yang bersebelahan saat menyerang",
 "摩擦：攻击时会伤到相邻的友方", "摩擦：攻擊時會傷到相鄰的友方", "摩擦：攻撃すると隣接する味方を傷つける", "마찰: 공격할 때 인접한 아군에게 피해를 줘요"]),
("Irradiated {v1}: gives Irradiation to its neighbours and the enemy facing it", "Irradiated {v1}: gives Irradiation to its adjacent units and the enemy facing it", [
 "Irradiée {v1} : donne l’Irradiation aux unités adjacentes et à l’ennemi en face", "Verstrahlt {v1}: gibt angrenzenden Einheiten und dem Gegner gegenüber Bestrahlung",
 "Irradiada {v1}: da Irradiación a las unidades adyacentes y al enemigo de enfrente", "Irradiata {v1}: dà Irradiazione alle unità adiacenti e al nemico di fronte",
 "Irradiada {v1}: dá Irradiação às unidades adjacentes e ao inimigo à sua frente", "Na-radyasyon {v1}: nagbibigay ng Radyasyon sa mga katabing yunit at sa kalabang nasa harap nito",
 "கதிர்வீச்சுக்குள்ளானது {v1}: அடுத்துள்ள அலகுகளுக்கும் எதிரே உள்ள எதிரிக்கும் கதிர்வீச்சு தருகிறது", "Teradiasi {v1}: memberi Radiasi ke unit yang bersebelahan dan musuh di depannya",
 "辐射 {v1}：使相邻单位和对面的敌人受到辐射", "輻射 {v1}：使相鄰單位和對面的敵人受到輻射", "被曝{v1}：隣接するユニットと正面の敵に放射線を与える", "방사능 오염 {v1}: 인접한 유닛과 마주한 적에게 방사능을 줘요"]),
("Dragon Lightning {v1}: its hits call red lightning on the target and a unit beside it", "Dragon Lightning {v1}: its hits call red lightning on the target and a unit adjacent to it", [
 "Foudre draconique {v1} : ses coups appellent un éclair rouge sur la cible et une unité adjacente", "Drachenblitz {v1}: ihre Treffer rufen roten Blitz auf das Ziel und eine angrenzende Einheit",
 "Rayo de dragón {v1}: sus golpes invocan un rayo rojo sobre el objetivo y una unidad adyacente", "Fulmine del drago {v1}: i suoi colpi richiamano fulmini rossi sul bersaglio e su un’unità adiacente",
 "Relâmpago do dragão {v1}: os seus golpes chamam relâmpagos vermelhos sobre o alvo e uma unidade adjacente", "Kidlat ng Dragon {v1}: tumatawag ng pulang kidlat ang mga tama nito sa target at sa isang katabing yunit",
 "டிராகன் மின்னல் {v1}: இதன் அடிகள் இலக்கின் மீதும் அதற்கு அடுத்துள்ள ஒரு அலகின் மீதும் சிவப்பு மின்னலை அழைக்கின்றன", "Petir Naga {v1}: pukulannya memanggil petir merah pada target dan satu unit yang bersebelahan dengannya",
 "龙之雷 {v1}：它的攻击在目标及一个与其相邻的单位上召来红色闪电", "龍之雷 {v1}：它的攻擊在目標及一個與其相鄰的單位上召來紅色閃電",
 "竜の雷{v1}：攻撃で対象とそれに隣接するユニットに赤い雷を呼ぶ", "용의 번개 {v1}: 공격이 대상과 인접한 유닛에 붉은 번개를 불러요"]),
("Electricity {v1}: its hits arc to a unit beside the target", "Electricity {v1}: its hits arc to a unit adjacent to the target", [
 "Électricité {v1} : ses coups rebondissent sur une unité adjacente à la cible", "Elektrizität {v1}: ihre Treffer springen auf eine an das Ziel angrenzende Einheit über",
 "Electricidad {v1}: sus golpes saltan a una unidad adyacente al objetivo", "Elettricità {v1}: i suoi colpi saltano a un’unità adiacente al bersaglio",
 "Eletricidade {v1}: os seus golpes saltam para uma unidade adjacente ao alvo", "Kuryente {v1}: tumatalon ang mga tama nito sa yunit na katabi ng target",
 "மின்சாரம் {v1}: இதன் அடிகள் இலக்குக்கு அடுத்துள்ள அலகுக்குத் தாவுகின்றன", "Listrik {v1}: pukulannya melompat ke unit yang bersebelahan dengan target",
 "电流 {v1}：它的攻击会跳到与目标相邻的单位", "電流 {v1}：它的攻擊會跳到與目標相鄰的單位", "電撃{v1}：攻撃が対象に隣接するユニットに飛び火する", "전기 {v1}: 공격이 대상과 인접한 유닛으로 튀어요"]),
]

# Long rows: (old English, new English, {code: (old fragment, new fragment)}); a pack with the row must have the fragment.
FRAG = [
("Every upkeep it gives {v1} Irradiation to the enemy facing it and to the units beside it, and 1 to itself.",
 "Every upkeep it gives {v1} Irradiation to the enemy facing it and to the units adjacent to it, and 1 to itself.",
 {'fr': ("aux unités à côté d’elle", "aux unités adjacentes"), 'de': ("den Einheiten neben ihr", "den angrenzenden Einheiten"), 'es': ("a las unidades de su lado", "a las unidades adyacentes"),
  'zh-Hans': ("身旁的单位", "相邻的单位"), 'zh-Hant': ("身旁的單位", "相鄰的單位"), 'ja': ("正面の敵と隣のユニット", "正面の敵と隣接するユニット")}),
("Red lightning follows its swing: whenever its attack connects, the target and one unit beside it each take",
 "Red lightning follows its swing: whenever its attack connects, the target and one unit adjacent to it each take",
 {'fr': ("la cible et une unité à côté", "la cible et une unité adjacente"), 'de': ("das Ziel und eine Einheit daneben", "das Ziel und eine angrenzende Einheit"),
  'es': ("el objetivo y una unidad a su lado", "el objetivo y una unidad adyacente"), 'zh-Hans': ("目标和其旁边的一个单位", "目标和一个与其相邻的单位"),
  'zh-Hant': ("目標和其旁邊的一個單位", "目標和一個與其相鄰的單位"), 'ja': ("対象とその隣のユニット1体", "対象とそれに隣接するユニット1体")}),
("Its hits arc: the spark jumps to one enemy unit beside the target for {v1} lightning damage.",
 "Its hits arc: the spark jumps to one enemy unit adjacent to the target for {v1} lightning damage.",
 {'fr': ("une unité ennemie à côté de la cible", "une unité ennemie adjacente à la cible"), 'de': ("eine gegnerische Einheit neben dem Ziel", "eine an das Ziel angrenzende gegnerische Einheit"),
  'es': ("una unidad enemiga junto al objetivo", "una unidad enemiga adyacente al objetivo"), 'zh-Hans': ("目标旁边的一个敌方单位", "与目标相邻的一个敌方单位"),
  'zh-Hant': ("目標旁邊的一個敵方單位", "與目標相鄰的一個敵方單位"), 'ja': ("対象の隣の敵ユニット1体", "対象に隣接する敵ユニット1体")}),
("the bolt jumps from the target to an enemy unit beside it, then on to one more,",
 "the bolt jumps from the target to an enemy unit adjacent to it, then on to one more,",
 {'fr': ("à une unité ennemie à côté,", "à une unité ennemie adjacente,"), 'de': ("auf eine gegnerische Einheit daneben", "auf eine angrenzende gegnerische Einheit"),
  'es': ("a una unidad enemiga a su lado", "a una unidad enemiga adyacente"), 'zh-Hans': ("从目标跳到旁边的一个敌方单位", "从目标跳到相邻的一个敌方单位"),
  'zh-Hant': ("從目標跳到旁邊的一個敵方單位", "從目標跳到相鄰的一個敵方單位"), 'ja': ("対象から隣の敵ユニットへ", "対象から隣接する敵ユニットへ")}),
("1 in 2 the flames catch a unit beside it for 1.",
 "1 in 2 the flames catch a unit adjacent to it for 1.",
 {'fr': ("une unité voisine pour 1", "une unité adjacente pour 1"), 'de': ("auf eine Einheit daneben über", "auf eine angrenzende Einheit über"),
  'es': ("a una unidad de su lado por 1", "a una unidad adyacente por 1"), 'zh-Hans': ("蔓延到旁边的一个单位", "蔓延到相邻的一个单位"),
  'zh-Hant': ("蔓延到旁邊的一個單位", "蔓延到相鄰的一個單位"), 'ja': ("炎が隣のユニットに燃え移り", "炎が隣接するユニットに燃え移り")}),
]

TX = [
("+{n}/+{n} for each ally right beside it (behind or in front, in a raid), up to 2.", "+{n}/+{n} for each adjacent ally, up to 2.", [
 "+{n}/+{n} par allié adjacent, jusqu’à 2.", "+{n}/+{n} je angrenzendem Verbündeten, bis zu 2.", "+{n}/+{n} por cada aliado adyacente, hasta 2.", "+{n}/+{n} per ogni alleato adiacente, fino a 2.",
 "+{n}/+{n} por cada aliado adjacente, até 2.", "+{n}/+{n} sa bawat katabing kakampi, hanggang 2.", "அடுத்துள்ள ஒவ்வொரு கூட்டாளிக்கும் +{n}/+{n}, அதிகபட்சம் 2.",
 "+{n}/+{n} untuk setiap sekutu yang bersebelahan, hingga 2.", "每个相邻的友军 +{n}/+{n}，最多2个。", "每個相鄰的友軍 +{n}/+{n}，最多2個。", "隣接する味方1体ごとに+{n}/+{n}、最大2体。", "인접한 아군 하나마다 +{n}/+{n}, 최대 2."]),
("The allies beside it have +{n} Armor while it lives.", "Its adjacent allies have +{n} Armor while it lives.", [
 "Ses alliés adjacents ont +{n} d’Armure tant qu’elle vit.", "Angrenzende Verbündete haben +{n} Rüstung, solange sie lebt.", "Sus aliados adyacentes tienen +{n} de Armadura mientras viva.",
 "Gli alleati adiacenti hanno +{n} Armatura finché vive.", "Os aliados adjacentes têm +{n} de Armadura enquanto viver.", "May +{n} Baluti ang mga katabing kakampi nito habang buhay ito.",
 "இது உயிருடன் இருக்கும் வரை அடுத்துள்ள கூட்டாளிகளுக்கு +{n} கவசம்.", "Sekutu yang bersebelahan mendapat +{n} Zirah selama ia hidup.",
 "它在场时，相邻的友军护甲+{n}。", "牠在場時，相鄰的友軍護甲+{n}。", "これが生きている間、隣接する味方はアーマー+{n}。", "살아 있는 동안 인접한 아군의 방어구 +{n}."]),
("The allies beside it have +{n} on each skill number, up to +{cap}.", "Its adjacent allies have +{n} on each skill number, up to +{cap}.", [
 "Ses alliés adjacents ont +{n} à chaque nombre de compétence, jusqu’à +{cap}.", "Angrenzende Verbündete haben +{n} auf jede Fähigkeitszahl, bis +{cap}.",
 "Sus aliados adyacentes tienen +{n} en cada número de habilidad, hasta +{cap}.", "Gli alleati adiacenti hanno +{n} su ogni numero di abilità, fino a +{cap}.",
 "Os aliados adjacentes têm +{n} em cada número de habilidade, até +{cap}.", "May +{n} sa bawat numero ng skill ang mga katabing kakampi nito, hanggang +{cap}.",
 "அடுத்துள்ள கூட்டாளிகளின் ஒவ்வொரு திறன் எண்ணுக்கும் +{n}, அதிகபட்சம் +{cap}.", "Sekutu yang bersebelahan mendapat +{n} pada setiap angka skill, hingga +{cap}.",
 "相邻友军的每个技能数值+{n}，最多+{cap}。", "相鄰友軍的每個技能數值+{n}，最多+{cap}。", "隣接する味方のスキルの数値はそれぞれ+{n}（最大+{cap}）。", "인접한 아군의 각 스킬 수치 +{n}, 최대 +{cap}."]),
("Each round, a Poisoned enemy passes 1 Poison to a unit beside it.", "Each round, a Poisoned enemy passes 1 Poison to a unit adjacent to it.", [
 "À chaque manche, un ennemi empoisonné transmet 1 Poison à une unité adjacente.", "Jede Runde gibt ein vergifteter Feind 1 Gift an eine angrenzende Einheit weiter.",
 "Cada ronda, un enemigo envenenado pasa 1 de Veneno a una unidad adyacente.", "Ogni round, un nemico avvelenato passa 1 Veleno a un’unità adiacente.",
 "A cada ronda, um inimigo envenenado passa 1 de Veneno a uma unidade adjacente.", "Bawat round, nagpapasa ang isang Nalasong kalaban ng 1 Lason sa isang katabing yunit.",
 "ஒவ்வொரு சுற்றிலும், நஞ்சூட்டப்பட்ட ஒரு எதிரி அடுத்துள்ள ஒரு அலகுக்கு 1 நஞ்சைக் கடத்துகிறது.", "Setiap ronde, satu musuh yang Teracun meneruskan 1 Racun ke unit yang bersebelahan dengannya.",
 "每回合，一个中毒的敌人把1层中毒传给相邻的单位。", "每回合，一個中毒的敵人把1層中毒傳給相鄰的單位。", "毎ラウンド、毒状態の敵1体が隣接するユニットに毒1を移す。", "매 라운드, 중독된 적 하나가 인접한 유닛에게 독 1을 옮겨요."]),
("Each round, up to {n} Poisoned enemies each pass 1 Poison to a unit beside them.", "Each round, up to {n} Poisoned enemies each pass 1 Poison to a unit adjacent to them.", [
 "À chaque manche, jusqu’à {n} ennemis empoisonnés transmettent chacun 1 Poison à une unité adjacente.", "Jede Runde geben bis zu {n} vergiftete Feinde je 1 Gift an eine angrenzende Einheit weiter.",
 "Cada ronda, hasta {n} enemigos envenenados pasan cada uno 1 de Veneno a una unidad adyacente.", "Ogni round, fino a {n} nemici avvelenati passano ciascuno 1 Veleno a un’unità adiacente.",
 "A cada ronda, até {n} inimigos envenenados passam cada um 1 de Veneno a uma unidade adjacente.", "Bawat round, hanggang {n} Nalasong kalaban ang bawat isa'y nagpapasa ng 1 Lason sa isang katabing yunit.",
 "ஒவ்வொரு சுற்றிலும், நஞ்சூட்டப்பட்ட {n} எதிரிகள் வரை ஒவ்வொன்றும் அடுத்துள்ள ஒரு அலகுக்கு 1 நஞ்சைக் கடத்துகின்றன.", "Setiap ronde, hingga {n} musuh yang Teracun masing-masing meneruskan 1 Racun ke unit yang bersebelahan.",
 "每回合，最多{n}个中毒的敌人各把1层中毒传给相邻的单位。", "每回合，最多{n}個中毒的敵人各把1層中毒傳給相鄰的單位。", "毎ラウンド、毒状態の敵最大{n}体がそれぞれ隣接するユニットに毒1を移す。", "매 라운드, 중독된 적 최대 {n}명이 각각 인접한 유닛에게 독 1을 옮겨요."]),
("Every upkeep while Ready: {n} fire damage to a random enemy; half the time, 1 to its neighbour.", "Every upkeep while Ready: {n} fire damage to a random enemy; half the time, 1 to an adjacent unit.", [
 "À chaque entretien quand elle est Prête : {n} dégâts de feu à une ennemie au hasard ; une fois sur deux, 1 à une unité adjacente.",
 "Jede Unterhaltsphase, solange bereit: {n} Feuerschaden an einem zufälligen Feind; in der Hälfte der Fälle 1 an eine angrenzende Einheit.",
 "Cada mantenimiento mientras está Lista: {n} de daño de fuego a un enemigo al azar; la mitad de las veces, 1 a una unidad adyacente.",
 "A ogni mantenimento finché è Pronta: {n} danni da fuoco a un nemico a caso; metà delle volte, 1 a un’unità adiacente.",
 "Em cada manutenção enquanto Pronta: {n} de dano de fogo a um inimigo aleatório; metade das vezes, 1 a uma unidade adjacente.",
 "Bawat upkeep habang Handa: {n} pinsalang apoy sa isang random na kalaban; kalahati ng oras, 1 sa isang katabing yunit nito.",
 "தயாராக இருக்கும்போது ஒவ்வொரு பராமரிப்பிலும்: சீரற்ற எதிரிக்கு {n} நெருப்புச் சேதம்; பாதி நேரம், அதற்கு அடுத்துள்ள அலகுக்கு 1.",
 "Setiap pemeliharaan selama Siap: {n} kerusakan api ke musuh acak; separuh waktu, 1 ke unit yang bersebelahan dengannya.",
 "可进行时每个维持阶段：对随机敌人造成 {n} 点火焰伤害；一半几率再对与其相邻的单位造成 1 点。", "可進行時每個維持階段：對隨機敵人造成 {n} 點火焰傷害；一半機率再對與其相鄰的單位造成 1 點。",
 "準備OKの間、毎アップキープ：ランダムな敵に {n} の炎ダメージ。半分の確率でそれに隣接するユニットに 1。", "준비 상태일 때 매 유지 단계: 무작위 적에게 화염 피해 {n}; 절반의 확률로 그 적과 인접한 유닛에게 1."]),
("Formation: +{n}/+{n} from its allies in line", "Formation: +{n}/+{n} from its adjacent allies", [
 "Formation : +{n}/+{n} grâce à ses alliés adjacents", "Formation: +{n}/+{n} durch angrenzende Verbündete", "Formación: +{n}/+{n} por sus aliados adyacentes",
 "Formazione: +{n}/+{n} dagli alleati adiacenti", "Formação: +{n}/+{n} pelos aliados adjacentes", "Hanay: +{n}/+{n} mula sa mga katabing kakampi nito",
 "அணிவகுப்பு: அடுத்துள்ள நட்புகளால் +{n}/+{n}", "Formasi: +{n}/+{n} dari sekutu yang bersebelahan", "阵型：相邻友军带来+{n}/+{n}", "陣型：相鄰友軍帶來+{n}/+{n}",
 "隊列：隣接する味方から+{n}/+{n}", "대형: 인접한 아군으로 +{n}/+{n}"]),
# new rows (old None): Spellshield
(None, "Spellshield", ["Pare-sort", "Zauberschild", "Escudo arcano", "Scudo arcano", "Escudo arcano", "Kalasag-Salamangka", "மந்திரக் கேடயம்", "Perisai Mantra", "法术护盾", "法術護盾", "スペルシールド", "주문 방패"]),
(None, "Single-target skills aimed at an adjacent ally hit this unit instead.", [
 "Les compétences à cible unique visant un allié adjacent touchent cette unité à la place.", "Einzelziel-Fähigkeiten, die auf einen angrenzenden Verbündeten zielen, treffen stattdessen diese Einheit.",
 "Las habilidades de objetivo único dirigidas a un aliado adyacente impactan en esta unidad.", "Le abilità a bersaglio singolo dirette a un alleato adiacente colpiscono invece questa unità.",
 "Habilidades de alvo único contra um aliado adjacente atingem esta unidade.", "Ang mga skill na iisa ang target na nakatutok sa katabing kakampi ay tatama sa yunit na ito.",
 "அடுத்துள்ள கூட்டாளியை நோக்கிய ஒற்றை இலக்குத் திறன்கள் அதற்குப் பதிலாக இந்த அலகைத் தாக்கும்.", "Skill bertarget tunggal yang diarahkan ke sekutu yang bersebelahan mengenai unit ini.",
 "瞄准相邻友方的单体技能会改为命中这个单位。", "瞄準相鄰友方的單體技能會改為命中這個單位。", "隣接する味方を狙った単体スキルは、代わりにこのユニットに当たる。", "인접한 아군을 노린 단일 대상 스킬은 대신 이 유닛에 맞아요."]),
(None, "Arrows, Bolts and other shots, damage skills and status skills aimed at one unit. Plain attacks are Guardian's, and areas reach everyone. Never itself; with two or more, one at random.", [
 "Flèches, Carreaux et autres tirs, compétences de dégâts et d’altération visant une seule unité. Les attaques simples sont pour le Gardien, et les zones touchent tout le monde. Jamais elle-même ; s’il y en a plusieurs, l’une au hasard.",
 "Pfeile, Bolzen und andere Schüsse, Schadens- und Statusfähigkeiten, die auf eine Einheit zielen. Normale Angriffe übernimmt der Wächter, Flächen treffen alle. Nie sich selbst; bei mehreren eine zufällige.",
 "Flechas, Saetas y otros disparos, habilidades de daño y de estado dirigidas a una sola unidad. Los ataques normales son cosa del Guardián, y las áreas alcanzan a todos. Nunca a sí misma; si hay varias, una al azar.",
 "Frecce, Dardi e altri tiri, abilità di danno e di stato dirette a una sola unità. Gli attacchi normali spettano al Guardiano, e le aree colpiscono tutti. Mai sé stessa; se ce ne sono più, una a caso.",
 "Flechas, Virotes e outros disparos, habilidades de dano e de estado contra uma só unidade. Os ataques normais são do Guardião, e as áreas atingem todos. Nunca a si mesma; com várias, uma ao acaso.",
 "Mga Palaso, Bolt at iba pang tira, mga skill na pampinsala at pang-status na nakatutok sa iisang yunit. Ang mga karaniwang atake ay para sa Guardian, at tumatama sa lahat ang mga pang-area. Hindi kailanman ang sarili; kapag dalawa o higit pa, isa nang random.",
 "ஒரே அலகை நோக்கிய அம்புகள், போல்ட்கள் மற்றும் பிற எய்தல்கள், சேதத் திறன்கள், நிலைத் திறன்கள். சாதாரணத் தாக்குதல்கள் Guardian-உடையவை; பரப்புத் தாக்குதல்கள் அனைவரையும் அடையும். ஒருபோதும் தன்னை அல்ல; இரண்டு அல்லது அதற்கு மேல் இருந்தால், சீரற்ற ஒன்று.",
 "Panah, Bolt, dan tembakan lain, skill kerusakan dan skill status yang diarahkan ke satu unit. Serangan biasa urusan Guardian, dan serangan area mengenai semua. Tidak pernah dirinya sendiri; jika ada beberapa, satu secara acak.",
 "瞄准单个单位的箭矢、弩箭等射击，以及伤害技能和状态技能。普通攻击归守护者，范围攻击会命中所有人。从不保护自己；有两个或以上时随机一个。",
 "瞄準單個單位的箭矢、弩箭等射擊，以及傷害技能和狀態技能。普通攻擊歸守護者，範圍攻擊會命中所有人。從不保護自己；有兩個或以上時隨機一個。",
 "1体を狙う矢・ボルトなどの射撃、ダメージスキル、状態異常スキル。通常攻撃は守護者の役目で、範囲攻撃は全員に届く。自分自身は守らない。2体以上いればランダムに1体。",
 "유닛 하나를 노린 화살, 볼트 등 사격, 피해 스킬과 상태 스킬. 일반 공격은 Guardian의 몫이고, 범위 공격은 모두에게 닿아요. 자신은 절대 아님; 둘 이상이면 무작위로 하나."]),
(None, "{att} takes the skill aimed at {name}.", [
 "{att} encaisse la compétence visant {name}.", "{att} fängt die Fähigkeit ab, die auf {name} zielte.", "{att} recibe la habilidad dirigida a {name}.",
 "{att} incassa l’abilità diretta a {name}.", "{att} recebe a habilidade dirigida a {name}.", "Sinalo ni {att} ang skill na nakatutok kay {name}.",
 "{name}-ஐ நோக்கிய திறனை {att} ஏற்கிறது.", "{att} menerima skill yang diarahkan ke {name}.", "{att} 替 {name} 承受了技能。", "{att} 替 {name} 承受了技能。",
 "{att}が{name}を狙ったスキルを引き受けた。", "{att}이(가) {name}을(를) 노린 스킬을 대신 받았어요."]),
]

ph = lambda s: sorted(set(re.findall(r'\{\w+\}', s)))
for rows in (UI, TX):
    for old, new, tr in rows:
        assert len(tr) == len(CODES), new
        assert all(ph(new) == ph(t) for t in tr), new
        assert old is None or ph(old) == ph(new), new


def rename(pack, old, new, val):
    """Replace the row `old` by `new` in place (keeping its position); False when the pack has no `old` row."""
    if old not in pack: return False
    out = {}
    for k, v in pack.items():
        if k == old: out[new] = val
        elif k != new: out[k] = v
    pack.clear(); pack.update(out); return True


if __name__ == '__main__':
    stats = {'ui': 0, 'frag': 0, 'tx': 0, 'added': 0, 'skipped': 0}
    for i, code in enumerate(CODES):
        p = os.path.join(ROOT, 'lang', 'ui', code + '.json'); pack = json.load(open(p, encoding='utf-8'))
        for old, new, tr in UI:
            if rename(pack, old, new, tr[i]): stats['ui'] += 1
            else: stats['skipped'] += 1
        for old_part, new_part, frags in FRAG:
            ks = [k for k in pack if old_part in k]
            for k in ks:
                a, b = frags[code]; assert a in pack[k], (code, a)
                rename(pack, k, k.replace(old_part, new_part), pack[k].replace(a, b)); stats['frag'] += 1
        with open(p, 'w', encoding='utf-8') as fh: json.dump(pack, fh, ensure_ascii=False, indent=1); fh.write('\n')
        p = os.path.join(ROOT, 'lang', code + '.json'); pack = json.load(open(p, encoding='utf-8'))
        for old, new, tr in TX:
            if old is None:
                if new not in pack: pack[new] = tr[i]; stats['added'] += 1
            elif rename(pack, old, new, tr[i]): stats['tx'] += 1
            elif new not in pack: pack[new] = tr[i]; stats['added'] += 1
        with open(p, 'w', encoding='utf-8') as fh: json.dump(pack, fh, ensure_ascii=False, indent=1); fh.write('\n')
    print('GD2 texts:', stats)
