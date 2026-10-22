#!/usr/bin/env python3
"""Game texts added or changed on 2026-10-23 by package EN (the owner's 10-23 00:10 answers GD2-1, GD2-5, TR-4, TR-6, D21, D24 and his
01:57 notes 2, 5, 10): Spellward (was Spellshield), Assault, Liege, Rage – {…}, Shapeshifter, Bulwark's shields, Backstab's edge, Swarm
without Structures, the Surrounding term (Dynamite, Scavenge, Salvage), the second player's +1 Shield, and the Coffer Mimic's name and
flavour. Same rules as i18n_2026_10_23_eb.py: keys are the English as the page translator sees it, every {placeholder} is kept, a row a
pack already has is left as the pack has it. The Spellshield rows are replaced by Spellward rows. Tagalog, Tamil, Japanese and Korean
deserve a native read.

    python3 tools/i18n_2026_10_23_en.py && python3 tools/i18n_refresh.py
"""
import json, os, re
ROOT = os.path.join(os.path.dirname(os.path.abspath(__file__)), '..')
CODES = ['fr', 'de', 'es', 'it', 'pt', 'tl', 'ta', 'id', 'zh-Hans', 'zh-Hant', 'ja', 'ko']
RENAMED = {'Spellshield': 'Spellward'}  # old English key -> new English key (the old row goes)
KEEP = {'Rage'}  # rows a pack may already have in its own wording
# English the game no longer shows (EN replaced it): dropped from lang/<code>.json and lang/ui/<code>.json
DEAD = ["the eight places around it: left and right, in front and behind, and the four diagonals. In front is the enemy line across; in a raid, also your own rows in front and behind.", "Always attacks the nearest enemy unit, never the bramble. Deals {v1} more damage when that unit isn't the one directly in front of it.",
  "Attacks the nearest enemy unit, never the bramble. +{v1} damage when that unit isn't the one in front.",
  "While on the field, your Bramble takes {v1} less damage from every hit it takes.", "Your bramble takes {v1} less damage from every hit.",
  "Day and night alternate every 3 rounds, starting with day. Whoever plays second opens with an extra card.", "Whoever plays second opens with an extra card.",
  "Cards each side may play a turn. The side playing second gets N extra cards, N-1 bramble Health and N-2 Lumber", "The nearest enemy is not the one in front.",
  "A {f}-upkeep fuse; at 0 it blows: {d} fire damage beside it and to the 3 foes facing it.",
  "When a unit dies within 1 of it, +{n} scavenge points. Every {m} points: 1 Lumber.", "When a structure dies within 1 of it, +{n} salvage points. Every {m} points: 1 Stone.",
  "Within 1: the slots beside it, the three across from it, and a raid's next row. Either side's deaths count, not its own."]
T = {
"Spellward": ["Garde-sort", "Zauberwacht", "Guarda arcana", "Guardia arcana", "Guarda arcana", "Bantay-Salamangka", "மந்திரக் காவல்",
  "Penangkal Mantra", "法术守护", "法術守護", "スペルウォード", "주문 수호"],
"Assault": ["Assaut", "Sturmangriff", "Asalto", "Assalto", "Assalto", "Salakay", "தாக்குதல் வேகம்", "Serbuan", "突击", "突擊", "強襲", "강습"],
"+{n} Attack on its own attacks, not on counterattacks.": [
  "+{n} Attaque sur ses propres attaques, pas sur les contre-attaques.", "+{n} Angriff bei eigenen Angriffen, nicht bei Gegenangriffen.",
  "+{n} de Ataque en sus propios ataques, no en los contraataques.", "+{n} Attacco nei propri attacchi, non nei contrattacchi.",
  "+{n} de Ataque nos seus próprios ataques, não nos contra-ataques.", "+{n} Atake sa sarili nitong pag-atake, hindi sa ganting-atake.",
  "தன் சொந்தத் தாக்குதல்களில் +{n} தாக்குதல்; எதிர்த்தாக்குதல்களில் இல்லை.", "+{n} Serangan pada serangannya sendiri, bukan pada serangan balik.",
  "自己攻击时 +{n} 攻击，反击时不算。", "自己攻擊時 +{n} 攻擊，反擊時不算。", "自分の攻撃時に攻撃+{n}（反撃には付かない）。", "자신이 공격할 때 공격력 +{n} (반격에는 적용되지 않음)."],
"Liege": ["Vassal", "Lehnsmann", "Vasallo", "Vassallo", "Vassalo", "Basalyo", "குடிமகன்", "Vasal", "臣属", "臣屬", "臣下", "가신"],
"While a King is on your side: {skills}.": [
  "Tant qu'un Roi est dans votre camp : {skills}.", "Solange ein König auf deiner Seite ist: {skills}.", "Mientras haya un Rey en tu bando: {skills}.",
  "Finché un Re è dalla tua parte: {skills}.", "Enquanto houver um Rei do teu lado: {skills}.", "Habang may Hari sa iyong panig: {skills}.",
  "உங்கள் பக்கத்தில் ஓர் அரசன் இருக்கும் வரை: {skills}.", "Selama ada Raja di pihakmu: {skills}.", "己方有王在场时：{skills}。", "己方有王在場時：{skills}。",
  "味方にキングがいる間：{skills}。", "아군에 왕이 있는 동안: {skills}."],
"A King is a unit with the King skill, not this one. Plain Liege gives Assault 2: +2 Attack on its own attacks.": [
  "Un Roi est une unité avec la compétence Roi, autre que celle-ci. Vassal seul donne Assaut 2 : +2 Attaque sur ses propres attaques.",
  "Ein König ist eine Einheit mit der Fähigkeit König, nicht diese. Lehnsmann allein gibt Sturmangriff 2: +2 Angriff bei eigenen Angriffen.",
  "Un Rey es una unidad con la habilidad Rey, no esta. Vasallo solo da Asalto 2: +2 de Ataque en sus propios ataques.",
  "Un Re è un'unità con l'abilità Re, non questa. Vassallo da solo dà Assalto 2: +2 Attacco nei propri attacchi.",
  "Um Rei é uma unidade com a habilidade Rei, não esta. Vassalo sozinho dá Assalto 2: +2 de Ataque nos seus próprios ataques.",
  "Ang Hari ay unit na may kakayahang Hari, hindi ito. Ang Basalyo lang ay nagbibigay ng Salakay 2: +2 Atake sa sarili nitong pag-atake.",
  "அரசன் என்பது அரசன் திறன் கொண்ட வேறு ஓர் அலகு, இது அல்ல. வெறும் குடிமகன் தாக்குதல் வேகம் 2 தரும்: தன் தாக்குதல்களில் +2 தாக்குதல்.",
  "Raja adalah unit dengan kemampuan Raja, bukan unit ini. Vasal saja memberi Serbuan 2: +2 Serangan pada serangannya sendiri.",
  "王是拥有“王”技能的单位，不算它自己。普通的臣属给予突击 2：自己攻击时 +2 攻击。", "王是擁有「王」技能的單位，不算它自己。普通的臣屬給予突擊 2：自己攻擊時 +2 攻擊。",
  "キングとはキングのスキルを持つ自分以外のユニット。ただの臣下は強襲2：自分の攻撃時に攻撃+2。", "왕은 왕 스킬을 가진 다른 유닛입니다. 그냥 가신은 강습 2: 자신이 공격할 때 공격력 +2."],
"Rage": ["Rage", "Raserei", "Furia", "Furia", "Fúria", "Galit", "ஆவேசம்", "Amukan", "狂怒", "狂怒", "激怒", "분노"],
"Below half Health: double Attack, takes half damage, and {skills}.": [
  "Sous la moitié de sa Santé : Attaque doublée, dégâts subis réduits de moitié, et {skills}.",
  "Unter halber Gesundheit: doppelter Angriff, halber Schaden, und {skills}.", "Por debajo de la mitad de Salud: Ataque doble, recibe la mitad de daño y {skills}.",
  "Sotto metà Salute: Attacco doppio, subisce metà danni e {skills}.", "Abaixo de metade da Vida: Ataque a dobrar, sofre metade do dano e {skills}.",
  "Kapag kulang sa kalahati ang Buhay: dobleng Atake, kalahating pinsala ang tinatanggap, at {skills}.",
  "பாதி உயிருக்குக் கீழே: இரட்டைத் தாக்குதல், பாதிச் சேதம் மட்டும், மேலும் {skills}.", "Di bawah separuh Nyawa: Serangan ganda, menerima separuh kerusakan, dan {skills}.",
  "生命低于一半时：攻击翻倍，受到的伤害减半，并且{skills}。", "生命低於一半時：攻擊翻倍，受到的傷害減半，並且{skills}。",
  "体力が半分未満：攻撃2倍、受けるダメージ半減、さらに{skills}。", "체력이 절반 미만일 때: 공격력 2배, 받는 피해 절반, 그리고 {skills}."],
"Shapeshifter": ["Métamorphe", "Gestaltwandler", "Cambiaformas", "Mutaforme", "Transmorfo", "Tagapag-anyo", "வடிவமாற்றி", "Pengubah Bentuk", "化形者", "化形者", "変化する者", "변신체"],
"Counts as every kind of Structure: it shares a type with every Structure.": [
  "Compte comme toute sorte de Structure : il partage un type avec chaque Structure.", "Gilt als jede Art von Bauwerk: Es teilt einen Typ mit jedem Bauwerk.",
  "Cuenta como cualquier tipo de Estructura: comparte un tipo con cada Estructura.", "Conta come ogni tipo di Struttura: condivide un tipo con ogni Struttura.",
  "Conta como qualquer tipo de Estrutura: partilha um tipo com cada Estrutura.", "Bilang ito sa lahat ng uri ng Istruktura: may kaparehong uri ito sa bawat Istruktura.",
  "எல்லா வகைக் கட்டடமாகவும் கணக்கு: ஒவ்வொரு கட்டடத்துடனும் ஒரு வகையைப் பகிர்கிறது.", "Dihitung sebagai segala jenis Bangunan: berbagi tipe dengan setiap Bangunan.",
  "算作任何一种建筑：与每个建筑都共享一个类型。", "算作任何一種建築：與每個建築都共享一個類型。", "あらゆる建造物として扱う：すべての建造物とタイプを共有する。", "모든 종류의 건축물로 간주: 모든 건축물과 유형을 공유합니다."],
"As it arrives: two 0/{hp} Bulwark Shields in the free front-row slots nearest it.": [
  "À son arrivée : deux Boucliers de rempart 0/{hp} dans les cases libres de première ligne les plus proches.",
  "Beim Eintreffen: zwei Bollwerkschilde 0/{hp} auf den nächsten freien Plätzen der vorderen Reihe.",
  "Al llegar: dos Escudos de baluarte 0/{hp} en las casillas libres de primera fila más cercanas.",
  "All'arrivo: due Scudi del baluardo 0/{hp} negli spazi liberi della prima fila più vicini.",
  "Ao chegar: dois Escudos de baluarte 0/{hp} nos espaços livres da primeira fila mais próximos.",
  "Pagdating nito: dalawang 0/{hp} na Kalasag ng Muog sa pinakamalapit na bakanteng puwesto sa unahang hanay.",
  "வரும்போது: அருகிலுள்ள முன்வரிசைக் காலி இடங்களில் இரண்டு 0/{hp} அரண் கேடயங்கள்.",
  "Saat tiba: dua Perisai Benteng 0/{hp} di slot barisan depan kosong terdekat.",
  "登场时：在离它最近的前排空位放置两个 0/{hp} 的壁垒护盾。", "登場時：在離它最近的前排空位放置兩個 0/{hp} 的壁壘護盾。",
  "登場時：最も近い前列の空きマスに0/{hp}の防壁シールドを2つ置く。", "등장 시: 가장 가까운 앞줄 빈칸에 0/{hp} 방벽 방패 2개."],
"The shields are Structures with no skills. With no free slot, no shield.": [
  "Les boucliers sont des Structures sans compétence. Sans case libre, pas de bouclier.", "Die Schilde sind Bauwerke ohne Fähigkeiten. Kein freier Platz, kein Schild.",
  "Los escudos son Estructuras sin habilidades. Sin casilla libre, no hay escudo.", "Gli scudi sono Strutture senza abilità. Senza spazio libero, niente scudo.",
  "Os escudos são Estruturas sem habilidades. Sem espaço livre, não há escudo.", "Ang mga kalasag ay Istrukturang walang kakayahan. Kung walang bakanteng puwesto, walang kalasag.",
  "கேடயங்கள் திறன் இல்லாத கட்டடங்கள். காலி இடம் இல்லையெனில் கேடயம் இல்லை.", "Perisai adalah Bangunan tanpa kemampuan. Tanpa slot kosong, tidak ada perisai.",
  "护盾是没有技能的建筑。没有空位就没有护盾。", "護盾是沒有技能的建築。沒有空位就沒有護盾。", "シールドはスキルのない建造物。空きマスがなければ出ない。", "방패는 스킬이 없는 건축물입니다. 빈칸이 없으면 방패도 없습니다."],
"Bulwark Shield": ["Bouclier de rempart", "Bollwerkschild", "Escudo de baluarte", "Scudo del baluardo", "Escudo de baluarte", "Kalasag ng Muog", "அரண் கேடயம்",
  "Perisai Benteng", "壁垒护盾", "壁壘護盾", "防壁シールド", "방벽 방패"],
"Attacks the nearest enemy unit, never the bramble. +{n} damage when that unit is worse at combat.": [
  "Attaque l'unité ennemie la plus proche, jamais le roncier. +{n} dégâts quand cette unité est diminuée au combat.",
  "Greift die nächste feindliche Einheit an, nie die Dornenhecke. +{n} Schaden, wenn diese Einheit im Kampf geschwächt ist.",
  "Ataca a la unidad enemiga más cercana, nunca al zarzal. +{n} de daño cuando esa unidad está mermada en combate.",
  "Attacca l'unità nemica più vicina, mai il rovo. +{n} danni quando quell'unità è indebolita in combattimento.",
  "Ataca a unidade inimiga mais próxima, nunca o silvado. +{n} de dano quando essa unidade está enfraquecida em combate.",
  "Inaatake ang pinakamalapit na kaaway na unit, hindi kailanman ang dawag. +{n} pinsala kapag mahina sa laban ang unit na iyon.",
  "அருகிலுள்ள எதிரி அலகைத் தாக்கும், ஒருபோதும் முட்புதரை அல்ல. அந்த அலகு போரில் பலவீனமாக இருந்தால் +{n} சேதம்.",
  "Menyerang unit musuh terdekat, tidak pernah semak. +{n} kerusakan saat unit itu sedang lemah dalam pertempuran.",
  "攻击最近的敌方单位，从不攻击荆棘丛。该单位战斗状态变差时，+{n} 伤害。", "攻擊最近的敵方單位，從不攻擊荊棘叢。該單位戰鬥狀態變差時，+{n} 傷害。",
  "最も近い敵ユニットを攻撃し、いばらは狙わない。そのユニットが戦闘で不利な状態なら、ダメージ+{n}。",
  "가장 가까운 적 유닛을 공격하며 덤불은 공격하지 않습니다. 그 유닛이 전투에 불리한 상태면 피해 +{n}."],
"Worse at combat: Blind, Stunned, Frozen, Asleep, Confused, Tipsy, Staggered, Paralyzed, Bound, Webbed or turned to stone, or it can't see in the dark while this unit can.": [
  "Diminuée au combat : Aveuglée, Étourdie, Gelée, Endormie, Confuse, Éméchée, Chancelante, Paralysée, Ligotée, Engluée ou changée en pierre, ou elle ne voit pas dans le noir alors que celle-ci voit.",
  "Im Kampf geschwächt: Geblendet, Betäubt, Gefroren, Schlafend, Verwirrt, Beschwipst, Taumelnd, Gelähmt, Gefesselt, Eingesponnen oder versteinert, oder sie sieht im Dunkeln nichts, während diese Einheit sieht.",
  "Mermada en combate: Cegada, Aturdida, Congelada, Dormida, Confusa, Achispada, Tambaleante, Paralizada, Atada, Enredada o convertida en piedra, o no ve en la oscuridad mientras esta sí ve.",
  "Indebolita in combattimento: Accecata, Stordita, Congelata, Addormentata, Confusa, Brilla, Barcollante, Paralizzata, Legata, Invischiata o pietrificata, oppure non vede al buio mentre questa sì.",
  "Enfraquecida em combate: Cega, Atordoada, Congelada, Adormecida, Confusa, Tocada, Cambaleante, Paralisada, Amarrada, Enredada ou transformada em pedra, ou não vê no escuro enquanto esta vê.",
  "Mahina sa laban: Bulag, Tulala, Nagyelo, Tulog, Lito, Lasing, Pasuray-suray, Paralisado, Nakagapos, Nasa sapot o naging bato, o hindi ito makakita sa dilim habang nakakakita ang unit na ito.",
  "போரில் பலவீனம்: குருடு, மயக்கம், உறைவு, தூக்கம், குழப்பம், போதை, தடுமாற்றம், முடக்கம், கட்டுண்டது, வலையில் சிக்கியது அல்லது கல்லானது; அல்லது இது பார்க்கும்போது அது இருளில் பார்க்க முடியாதது.",
  "Lemah dalam pertempuran: Buta, Pingsan, Membeku, Tertidur, Bingung, Mabuk, Terhuyung, Lumpuh, Terikat, Terjerat jaring atau membatu, atau ia tak bisa melihat dalam gelap sementara unit ini bisa.",
  "战斗状态变差：失明、眩晕、冰冻、沉睡、混乱、微醺、踉跄、麻痹、束缚、被网缠住或石化，或它在黑暗中看不见而本单位看得见。",
  "戰鬥狀態變差：失明、暈眩、冰凍、沉睡、混亂、微醺、踉蹌、麻痺、束縛、被網纏住或石化，或牠在黑暗中看不見而本單位看得見。",
  "戦闘で不利な状態：盲目、気絶、凍結、睡眠、混乱、ほろ酔い、よろめき、麻痺、拘束、蜘蛛の巣、石化、またはこのユニットは見えるのに相手は暗闇で見えない。",
  "전투에 불리한 상태: 실명, 기절, 빙결, 수면, 혼란, 취함, 비틀거림, 마비, 속박, 거미줄 또는 석화, 또는 이 유닛은 보이는데 상대는 어둠 속에서 보지 못함."],
"Surrounding": ["Alentour", "Umliegend", "Circundante", "Circostante", "Circundante", "Nakapaligid", "சுற்றியுள்ள", "Sekeliling", "周围", "周圍", "周囲", "주변"],
"the 8 places around it: left, right, front, back and the 4 diagonals (a raid's rows too).": [
  "les 8 places autour d'elle : gauche, droite, devant, derrière et les 4 diagonales (et les rangées d'un raid).",
  "die 8 Plätze ringsum: links, rechts, vorn, hinten und die 4 Diagonalen (auch die Reihen eines Raids).",
  "los 8 lugares a su alrededor: izquierda, derecha, delante, detrás y las 4 diagonales (también las filas de una incursión).",
  "gli 8 posti intorno: sinistra, destra, davanti, dietro e le 4 diagonali (anche le file di un raid).",
  "os 8 lugares à volta: esquerda, direita, frente, trás e as 4 diagonais (também as filas de uma incursão).",
  "ang 8 puwesto sa paligid nito: kaliwa, kanan, harap, likod at ang 4 na pahilis (pati ang mga hanay ng raid).",
  "அதைச் சுற்றியுள்ள 8 இடங்கள்: இடம், வலம், முன், பின், 4 மூலைவிட்டங்கள் (ரெய்டின் வரிசைகளும்).",
  "8 tempat di sekelilingnya: kiri, kanan, depan, belakang, dan 4 diagonal (juga baris dalam raid).",
  "它周围的 8 个位置：左、右、前、后和 4 个斜角（突袭中的各排也算）。", "它周圍的 8 個位置：左、右、前、後和 4 個斜角（突襲中的各排也算）。",
  "周りの8か所：左右、前後、斜め4方向（レイドの列も）。", "주위 8칸: 좌, 우, 앞, 뒤, 대각선 4칸 (레이드의 줄도 포함)."],
"A {f}-upkeep fuse; at 0 it blows: {d} fire damage to every surrounding unit.": [
  "Une mèche de {f} entretiens ; à 0 elle saute : {d} dégâts de feu à chaque unité alentour.",
  "Eine Lunte über {f} Unterhaltsphasen; bei 0 explodiert sie: {d} Feuerschaden an jeder umliegenden Einheit.",
  "Una mecha de {f} mantenimientos; en 0 estalla: {d} de daño de fuego a cada unidad circundante.",
  "Una miccia di {f} mantenimenti; a 0 esplode: {d} danni da fuoco a ogni unità circostante.",
  "Um rastilho de {f} manutenções; a 0 rebenta: {d} de dano de fogo a cada unidade circundante.",
  "Mitsa ng {f} upkeep; sa 0 sumasabog: {d} pinsalang apoy sa bawat nakapaligid na unit.",
  "{f}-பராமரிப்புத் திரி; 0-இல் வெடிக்கும்: சுற்றியுள்ள ஒவ்வோர் அலகுக்கும் {d} நெருப்புச் சேதம்.",
  "Sumbu {f} giliran perawatan; di 0 ia meledak: {d} kerusakan api ke setiap unit di sekelilingnya.",
  "{f} 个维持阶段的引信；归 0 时爆炸：对周围每个单位造成 {d} 点火焰伤害。", "{f} 個維持階段的引信；歸 0 時爆炸：對周圍每個單位造成 {d} 點火焰傷害。",
  "{f} アップキープの導火線。0 で爆発：周囲のすべてのユニットに {d} の炎ダメージ。", "{f} 유지 단계 도화선. 0이 되면 폭발: 주변의 모든 유닛에게 화염 피해 {d}."],
"When a surrounding unit dies, +{n} scavenge points. Every {m} points: 1 Lumber.": [
  "Quand une unité alentour meurt, +{n} points de glanage. Tous les {m} points : 1 Bois.", "Stirbt eine umliegende Einheit, +{n} Sammelpunkte. Je {m} Punkte: 1 Holz.",
  "Cuando muere una unidad circundante, +{n} puntos de rapiña. Cada {m} puntos: 1 de Madera.", "Quando muore un'unità circostante, +{n} punti di spigolatura. Ogni {m} punti: 1 Legno.",
  "Quando morre uma unidade circundante, +{n} pontos de rapina. A cada {m} pontos: 1 de Madeira.", "Kapag may nakapaligid na unit na namatay, +{n} puntos ng pulot. Bawat {m} puntos: 1 Kahoy.",
  "சுற்றியுள்ள ஓர் அலகு இறந்தால், +{n} பொறுக்கு புள்ளிகள். ஒவ்வொரு {m} புள்ளிகளுக்கும்: 1 மரம்.", "Saat unit di sekelilingnya mati, +{n} poin pulung. Setiap {m} poin: 1 Kayu.",
  "周围有单位阵亡时，+{n} 拾荒点数。每 {m} 点：1 木材。", "周圍有單位陣亡時，+{n} 拾荒點數。每 {m} 點：1 木材。", "周囲でユニットが倒れると拾い集めポイント+{n}。{m}ポイントごとに木材1。",
  "주변에서 유닛이 죽으면 줍기 점수 +{n}. {m}점마다 목재 1."],
"When a surrounding structure dies, +{n} salvage points. Every {m} points: 1 Stone.": [
  "Quand une structure alentour est détruite, +{n} points de récupération. Tous les {m} points : 1 Pierre.", "Wird ein umliegendes Bauwerk zerstört, +{n} Bergungspunkte. Je {m} Punkte: 1 Stein.",
  "Cuando cae una estructura circundante, +{n} puntos de recuperación. Cada {m} puntos: 1 de Piedra.", "Quando cade una struttura circostante, +{n} punti di recupero. Ogni {m} punti: 1 Pietra.",
  "Quando cai uma estrutura circundante, +{n} pontos de recuperação. A cada {m} pontos: 1 de Pedra.", "Kapag may nakapaligid na istrukturang nawasak, +{n} puntos ng pagsalba. Bawat {m} puntos: 1 Bato.",
  "சுற்றியுள்ள ஒரு கட்டமைப்பு அழிந்தால், +{n} மீட்பு புள்ளிகள். ஒவ்வொரு {m} புள்ளிகளுக்கும்: 1 கல்.", "Saat bangunan di sekelilingnya hancur, +{n} poin penyelamatan. Setiap {m} poin: 1 Batu.",
  "周围有建筑被摧毁时，+{n} 回收点数。每 {m} 点：1 岩石。", "周圍有建築被摧毀時，+{n} 回收點數。每 {m} 點：1 岩石。", "周囲で建造物が壊れるとサルベージポイント+{n}。{m}ポイントごとに石1。",
  "주변에서 건축물이 부서지면 회수 점수 +{n}. {m}점마다 돌 1."],
"Surrounding: the slots beside it, the three across from it, and a raid's next row. Either side's deaths count, not its own.": [
  "Alentour : les cases voisines, les trois en face, et la rangée suivante d'un raid. Les morts des deux camps comptent, pas la sienne.",
  "Umliegend: die Plätze daneben, die drei gegenüber und in einem Raid die nächste Reihe. Tode beider Seiten zählen, nicht der eigene.",
  "Circundante: las casillas de al lado, las tres de enfrente y la fila siguiente de una incursión. Cuentan las muertes de ambos bandos, no la suya.",
  "Circostante: gli spazi accanto, i tre di fronte e la fila successiva di un raid. Contano le morti di entrambi i lati, non la sua.",
  "Circundante: os espaços ao lado, os três em frente e a fila seguinte de uma incursão. Contam as mortes dos dois lados, não a sua.",
  "Nakapaligid: ang mga puwesto sa tabi, ang tatlo sa tapat, at ang susunod na hanay ng raid. Bilang ang pagkamatay ng magkabilang panig, hindi ang sarili.",
  "சுற்றியுள்ளவை: அருகிலுள்ள இடங்கள், எதிரே உள்ள மூன்று, ரெய்டின் அடுத்த வரிசை. இரு தரப்பு இறப்புகளும் கணக்கு, அதன் சொந்தம் அல்ல.",
  "Sekeliling: slot di sebelahnya, tiga di seberangnya, dan baris berikut dalam raid. Kematian kedua pihak dihitung, bukan dirinya.",
  "周围：旁边的格子、对面的三个，以及突袭中的下一排。双方的阵亡都算，自己的不算。", "周圍：旁邊的格子、對面的三個，以及突襲中的下一排。雙方的陣亡都算，自己的不算。",
  "周囲：隣のマス、向かいの3つ、レイドでは次の列。両陣営の死亡が数えられ、自分自身は含まない。", "주변: 옆 칸, 맞은편 세 칸, 레이드의 다음 줄. 양쪽의 죽음이 모두 세어지며, 자신은 제외."],
"Day and night alternate every 3 rounds, starting with day. Whoever plays second starts with +1 Shield on its bramble.": [
  "Le jour et la nuit alternent tous les 3 tours, en commençant par le jour. Celui qui joue en second commence avec +1 Bouclier sur son roncier.",
  "Tag und Nacht wechseln alle 3 Runden, beginnend mit dem Tag. Wer als Zweiter spielt, beginnt mit +1 Schild auf seiner Dornenhecke.",
  "El día y la noche se alternan cada 3 rondas, empezando por el día. Quien juega segundo empieza con +1 Escudo en su zarzal.",
  "Giorno e notte si alternano ogni 3 round, iniziando dal giorno. Chi gioca per secondo inizia con +1 Scudo sul suo rovo.",
  "O dia e a noite alternam a cada 3 rondas, começando pelo dia. Quem joga em segundo começa com +1 Escudo no seu silvado.",
  "Nagpapalitan ang araw at gabi bawat 3 round, simula sa araw. Ang pangalawang maglalaro ay magsisimula nang may +1 Kalasag sa dawag nito.",
  "பகலும் இரவும் ஒவ்வொரு 3 சுற்றுக்கும் மாறும், பகலில் தொடங்கும். இரண்டாவதாக ஆடுபவர் தன் முட்புதரில் +1 கேடயத்துடன் தொடங்குவார்.",
  "Siang dan malam bergantian setiap 3 ronde, dimulai dengan siang. Yang bermain kedua mulai dengan +1 Perisai pada semaknya.",
  "昼夜每 3 轮交替一次，从白天开始。后手的一方荆棘丛开局 +1 护盾。", "晝夜每 3 輪交替一次，從白天開始。後手的一方荊棘叢開局 +1 護盾。",
  "昼と夜が3ラウンドごとに入れ替わる（昼から開始）。後攻はいばらにシールド+1で始まる。",
  "낮과 밤이 3라운드마다 바뀌고, 낮부터 시작해요. 두 번째로 플레이하는 쪽은 덤불에 방패 +1을 얻고 시작해요."],
"Whoever plays second starts with +1 Shield on its bramble.": [
  "Celui qui joue en second commence avec +1 Bouclier sur son roncier.", "Wer als Zweiter spielt, beginnt mit +1 Schild auf seiner Dornenhecke.",
  "Quien juega segundo empieza con +1 Escudo en su zarzal.", "Chi gioca per secondo inizia con +1 Scudo sul suo rovo.", "Quem joga em segundo começa com +1 Escudo no seu silvado.",
  "Ang pangalawang maglalaro ay magsisimula nang may +1 Kalasag sa dawag nito.", "இரண்டாவதாக ஆடுபவர் தன் முட்புதரில் +1 கேடயத்துடன் தொடங்குவார்.",
  "Yang bermain kedua mulai dengan +1 Perisai pada semaknya.", "后手的一方荆棘丛开局 +1 护盾。", "後手的一方荊棘叢開局 +1 護盾。", "後攻はいばらにシールド+1で始まる。",
  "두 번째로 플레이하는 쪽은 덤불에 방패 +1을 얻고 시작해요."],
"Cards each side may play a turn. The side playing second gets +1 Shield on its bramble, and nothing else": [
  "Cartes que chaque camp peut jouer par tour. Le camp qui joue en second reçoit +1 Bouclier sur son roncier, et rien d'autre",
  "Karten, die jede Seite pro Zug spielen darf. Die Seite, die als Zweite spielt, erhält +1 Schild auf ihrer Dornenhecke, sonst nichts",
  "Cartas que cada bando puede jugar por turno. El bando que juega segundo recibe +1 Escudo en su zarzal, y nada más",
  "Carte che ogni lato può giocare per turno. Il lato che gioca per secondo riceve +1 Scudo sul suo rovo, e nient'altro",
  "Cartas que cada lado pode jogar por turno. O lado que joga em segundo recebe +1 Escudo no seu silvado, e nada mais",
  "Mga card na maaaring laruin ng bawat panig bawat turno. Ang pangalawang panig ay may +1 Kalasag sa dawag nito, at wala nang iba",
  "ஒவ்வொரு தரப்பும் ஒரு முறைக்கு விளையாடக்கூடிய அட்டைகள். இரண்டாவதாக ஆடும் தரப்புக்குத் தன் முட்புதரில் +1 கேடயம் மட்டும்",
  "Kartu yang boleh dimainkan tiap pihak per giliran. Pihak yang bermain kedua mendapat +1 Perisai pada semaknya, tidak lebih",
  "每方每回合可出的牌数。后手的一方荆棘丛 +1 护盾，别无其他", "每方每回合可出的牌數。後手的一方荊棘叢 +1 護盾，別無其他",
  "各陣営が1ターンに出せるカード数。後攻はいばらにシールド+1、それ以外はなし", "각 진영이 한 턴에 낼 수 있는 카드 수. 두 번째 진영은 덤불에 방패 +1만 받습니다"],
"The dummy in front is Blind: the Backstab lands.": [
  "Le mannequin en face est Aveuglé : le Coup dans le dos porte.", "Die Puppe gegenüber ist geblendet: das Meucheln trifft.",
  "El muñeco de enfrente está Cegado: la Puñalada trapera acierta.", "Il fantoccio di fronte è Accecato: la Pugnalata alle spalle va a segno.",
  "O boneco em frente está Cego: a Punhalada pelas costas acerta.", "Bulag ang dummy sa harap: tumatama ang Saksak-Talikod.",
  "எதிரே உள்ள பொம்மை குருடாக உள்ளது: முதுகுக் குத்து விழுகிறது.", "Boneka di depan Buta: Tikaman dari Belakang mengenai.",
  "正前方的假人失明了：背刺命中。", "正前方的假人失明了：背刺命中。", "正面の人形は盲目：背後からの一撃が決まる。", "앞의 허수아비가 실명 상태: 백스탭이 적중합니다."],
}
# Swarm's lines end with "Structures don't count." now (owner 01:57 note 10): the pack's own wording of the old line, plus SDC.
SDC = ["Les Structures ne comptent pas.", "Bauwerke zählen nicht.", "Las Estructuras no cuentan.", "Le Strutture non contano.", "As Estruturas não contam.",
  "Hindi bilang ang mga Istruktura.", "கட்டடங்கள் கணக்கில் இல்லை.", "Bangunan tidak dihitung.", "建筑不算。", "建築不算。", "建造物は数えない。", "건축물은 세지 않습니다."]
SWARM = {"+{v1} Attack for every ally that shares a type with it (e.g. every other Ant beside an Ant).": "+{v1} Attack for every ally that shares a type with it (e.g. every other Ant beside an Ant). Structures don't count.",
  "+{v1} Attack for every ally that shares a type with it.": "+{v1} Attack for every ally that shares a type with it. Structures don't count."}
SWARM_IS = ["+{v1} Attaque pour chaque allié qui est {v2}.", "+{v1} Angriff für jeden Verbündeten, der {v2} ist.", "+{v1} de Ataque por cada aliado que sea {v2}.",
  "+{v1} Attacco per ogni alleato che è {v2}.", "+{v1} de Ataque por cada aliado que seja {v2}.", "+{v1} Atake sa bawat kakampi na {v2}.",
  "{v2} ஆக உள்ள ஒவ்வொரு கூட்டாளிக்கும் +{v1} தாக்குதல்.", "+{v1} Serangan untuk tiap sekutu yang merupakan {v2}.", "每有一个{v2}友军，+{v1} 攻击。", "每有一個{v2}友軍，+{v1} 攻擊。",
  "{v2}の味方1体ごとに攻撃+{v1}。", "{v2}인 아군마다 공격력 +{v1}."]
CARD_NAME = "Coffer Mimic"
CARD_FLAVOUR = "Every cave has one chest too heavy to open. Grab it and it grabs back."
CARD = {
 'fr': ("Mimique du coffre", "Chaque grotte cache un coffre trop lourd pour être ouvert. Attrapez-le, et c'est lui qui vous attrape."),
 'de': ("Truhen-Mimik", "Jede Höhle hat eine Truhe, die zu schwer zum Öffnen ist. Greif nach ihr, und sie greift zurück."),
 'es': ("Cofre mímico", "Toda cueva tiene un cofre demasiado pesado para abrirlo. Agárralo y te agarrará a ti."),
 'it': ("Forziere mimico", "Ogni grotta ha un forziere troppo pesante da aprire. Afferralo, e sarà lui ad afferrare te."),
 'pt': ("Baú mímico", "Toda gruta tem um baú pesado demais para abrir. Agarra-o e ele agarra-te de volta."),
 'tl': ("Gayang Kaban", "Bawat kuweba ay may isang kabang masyadong mabigat buksan. Hawakan mo ito at hahawakan ka rin nito."),
 'ta': ("பெட்டி மாயாவி", "ஒவ்வொரு குகையிலும் திறக்க முடியாத அளவு கனமான ஒரு பெட்டி உண்டு. அதைப் பிடித்தால், அது உங்களைப் பிடிக்கும்."),
 'id': ("Peti Peniru", "Setiap gua punya satu peti yang terlalu berat untuk dibuka. Raihlah, dan ia akan meraihmu balik."),
 'zh-Hans': ("宝箱拟态怪", "每个洞穴都有一个重得打不开的宝箱。你去抓它，它就反过来抓你。"),
 'zh-Hant': ("寶箱擬態怪", "每個洞穴都有一個重得打不開的寶箱。你去抓它，它就反過來抓你。"),
 'ja': ("宝箱ミミック", "どの洞窟にも、重くて開かない宝箱がひとつある。つかめば、つかみ返してくる。"),
 'ko': ("보물상자 미믹", "어느 동굴에나 너무 무거워 열 수 없는 상자가 하나 있다. 붙잡으면, 그것도 당신을 붙잡는다."),
}
assert all(len(v) == len(CODES) for v in T.values()), [k for k, v in T.items() if len(v) != len(CODES)]
ph = lambda s: sorted(set(re.findall(r'\{\w+\}', s)))
assert all(ph(k) == ph(t) for k, v in T.items() for t in v), [(k, t) for k, v in T.items() for t in v if ph(k) != ph(t)]
def dump(path, d):
    with open(path, 'w', encoding='utf-8') as fh:
        json.dump(d, fh, ensure_ascii=False, indent=1); fh.write('\n')
if __name__ == '__main__':
    kept = 0
    for i, code in enumerate(CODES):
        path = os.path.join(ROOT, 'lang', code + '.json')
        ui = os.path.join(ROOT, 'lang', 'ui', code + '.json')
        pack = json.load(open(path, encoding='utf-8')) if os.path.exists(path) else {}
        uipack = json.load(open(ui, encoding='utf-8')) if os.path.exists(ui) else {}
        for old in list(RENAMED) + DEAD: pack.pop(old, None); uipack.pop(old, None)
        for en, row in T.items():
            if en in KEEP and (en in pack or en in uipack): kept += 1; continue  # a word the pack already has (Rage) stays as the pack has it
            uipack.pop(en, None); pack[en] = row[i]  # this tool's own rows: written (re-running updates them)
        uipack[CARD_FLAVOUR] = CARD[code][1]
        for was, now in SWARM.items():  # the pack's own Swarm line + "Structures don't count."
            base = uipack.pop(was, None) or pack.pop(was, None)
            if base: uipack[now] = base + ' ' + SDC[i]
        uipack["+{v1} Attack for every ally that is {v2}. Structures don't count."] = SWARM_IS[i] + ' ' + SDC[i]
        dump(path, pack); dump(ui, uipack)
        cp = os.path.join(ROOT, 'lang', 'cards', code + '.json')
        cards = json.load(open(cp, encoding='utf-8')); cards[CARD_NAME] = CARD[code][0]; dump(cp, cards)
    print('wrote', len(CODES), 'packs,', len(T), 'strings each;', kept, 'rows a pack already had were kept; the Coffer Mimic name and flavour')
