#!/usr/bin/env python3
"""Game texts added or changed on 2026-10-24 by package EN5 (owner 02:59 / 03:12): Greater Poison is called Deadly Poison (the rows that name
it are re-keyed with the new English and the new name in each pack; zh / ja / ko already said "deadly poison": 剧毒 / 劇毒 / 猛毒 / 맹독);
Breach, Canopy Cover, the state skills Timbered / Bedrock / Forged / Last Stand, Hemorrhage N, Bloom's copy that can bloom (and the cells in
front or behind), the Group Dungeon's people row. Same rules as tools/i18n_2026_10_23_en4.py: keys are the English as the page translator
sees it, every {placeholder} is kept, log lines and floats are keyed peeled (their leading emoji off); the replaced English rows are dropped.
Tagalog, Tamil, Japanese and Korean deserve a native read.
  python3 tools/i18n_2026_10_24_en5.py"""
import json, os, re
ROOT = os.path.join(os.path.dirname(os.path.abspath(__file__)), '..')
CODES = ['fr', 'de', 'es', 'it', 'pt', 'tl', 'ta', 'id', 'zh-Hans', 'zh-Hant', 'ja', 'ko']
# Greater Poison -> Deadly Poison in each pack's own words (regex, replacement)
GP = {
 'fr': [(r'Poison majeur', 'Poison mortel')],
 'de': [(r'Stark(es|em|en|er)? Gift', lambda m: 'Tödlich' + (m.group(1) or 'es') + ' Gift')],
 'es': [(r'Veneno mayor', 'Veneno mortal')],
 'it': [(r'Veleno superiore', 'Veleno mortale')],
 'pt': [(r'Veneno maior', 'Veneno mortal')],
 'tl': [(r'Matinding Lason', 'Nakamamatay na Lason')],
 'ta': [(r'பெருநஞ்ச', 'கொடிய நஞ்ச')],
 'id': [(r'Racun Agung', 'Racun Mematikan')],
 'zh-Hans': [], 'zh-Hant': [], 'ja': [], 'ko': [],
}
# Bloom: the copy can bloom now (the last clause of ui.bl-desc / ui.bl-desc-lumber), and "beside it" on more rows (ui.bl-codex)
BL_OLD_DESC = "Once, at the start of the first round its conditions hold ({when}): a copy of it grows in a free slot beside it, with +1/+1, its damage and its stat changes but none of its counters. The unit itself is unchanged; the copy can't bloom."
BL_NEW_DESC = BL_OLD_DESC.replace("the copy can't bloom.", "the copy can bloom once too.")
BL_OLD_DESCL = "Once, at the start of the first round its conditions hold ({when}) and you have {n} Lumber: it pays the Lumber and a copy of it grows in a free slot beside it, with +1/+1, its damage and its stat changes but none of its counters. The unit itself is unchanged; the copy can't bloom."
BL_NEW_DESCL = BL_OLD_DESCL.replace("the copy can't bloom.", "the copy can bloom once too.")
BL_CLAUSE = {
 'fr': ("la copie ne peut pas fleurir.", "la copie peut aussi fleurir une fois."), 'de': ("die Kopie kann nicht blühen.", "die Kopie kann ebenfalls einmal blühen."),
 'es': ("la copia no puede florecer.", "la copia también puede florecer una vez."), 'it': ("la copia non può fiorire.", "anche la copia può fiorire una volta."),
 'pt': ("a cópia não pode florescer.", "a cópia também pode florescer uma vez."), 'tl': ("hindi makakapamulaklak ang kopya.", "makakapamulaklak din nang isang beses ang kopya."),
 'ta': ("நகல் மலராது.", "நகலும் ஒருமுறை மலரலாம்."), 'id': ("salinannya tidak bisa mekar.", "salinannya juga bisa mekar sekali."),
 'zh-Hans': ("复制体不能花开。", "复制体也能花开一次。"), 'zh-Hant': ("複製體不能花開。", "複製體也能花開一次。"),
 'ja': ("コピーは開花しない。", "コピーも一度だけ開花できる。"), 'ko': ("복제는 개화하지 못합니다.", "복제도 한 번 개화할 수 있습니다."),
}
BL_OLD_CODEX = "Conditions: Wet (rain, the Tide in, or a beach, river or sea map), Sunny (day or Twilight, with no Rain, Fog or darkness), Killed an enemy (this unit has killed an enemy unit), and Tide, Ebb, Night, Day, Twilight, Wind, Dark, Heat, Frost, Full Moon, Rain. With no free slot beside it, it waits and tries again next round. The copy arrives with its printed Wait and leaves no card behind when it dies."
BL_NEW_CODEX = BL_OLD_CODEX.replace("With no free slot beside it,", "Beside it means left or right, or in front or behind on a board with more rows (a raid, the Group Dungeon). With no free slot beside it,")
BL_CODEX_ADD = {
 'fr': "« À côté » veut dire à gauche ou à droite, ou devant ou derrière sur un plateau à plusieurs rangées (un raid, le Donjon de groupe).",
 'de': "„Daneben“ heißt links oder rechts, oder davor oder dahinter auf einem Feld mit mehreren Reihen (ein Raid, das Gruppenverlies).",
 'es': "«Al lado» es a la izquierda o a la derecha, o delante o detrás en un tablero con varias filas (una incursión, la Mazmorra de grupo).",
 'it': "«Accanto» vuol dire a sinistra o a destra, oppure davanti o dietro su un campo con più file (un raid, il Dungeon di gruppo).",
 'pt': "«Ao lado» é à esquerda ou à direita, ou à frente ou atrás num tabuleiro com várias filas (um raide, a Masmorra de grupo).",
 'tl': "Ang \"katabi\" ay kaliwa o kanan, o sa harap o likod sa larangang may higit sa isang hanay (isang raid, ang Dungeon ng grupo).",
 'ta': "\"அருகில்\" என்றால் இடம் அல்லது வலம், அல்லது பல வரிசைகள் உள்ள களத்தில் முன்னே அல்லது பின்னே (ஒரு ரெய்டு, குழு நிலவறை).",
 'id': "\"Di sebelahnya\" berarti kiri atau kanan, atau di depan atau belakang pada papan dengan beberapa baris (raid, Dungeon Grup).",
 'zh-Hans': "“旁边”指左边或右边；在有多排的战场上（突袭、组队地牢）也包括前面或后面。",
 'zh-Hant': "「旁邊」指左邊或右邊；在有多排的戰場上（突襲、組隊地牢）也包括前面或後面。",
 'ja': "「隣」は左右のこと。列が複数ある盤（レイド、グループダンジョン）では前後も含む。",
 'ko': "'옆'은 왼쪽이나 오른쪽이며, 여러 줄이 있는 판(레이드, 그룹 던전)에서는 앞이나 뒤도 됩니다.",
}
HEMO_OLD_CODEX = "Doubled before its own Bleed lands, so a target with no Bleed gets none from it. Only a swing that lands. Ghosts don't bleed."
HEMO_NEW_CODEX = "Doubled before its own Bleed lands, so a target with no Bleed gets only what Hemorrhage N adds after the doubling (none at plain Hemorrhage). Only a swing that lands. Ghosts don't bleed."
T = {
HEMO_NEW_CODEX: [
  "Doublé avant que son propre Saignement ne s'ajoute : une cible sans Saignement ne reçoit que ce qu'Hémorragie N ajoute après le doublement (rien pour l'Hémorragie simple). Seulement un coup qui porte. Les fantômes ne saignent pas.",
  "Verdoppelt, bevor die eigene Blutung dazukommt: Ein Ziel ohne Blutung bekommt nur, was Blutsturz N nach dem Verdoppeln hinzufügt (beim einfachen Blutsturz nichts). Nur ein Schlag, der trifft. Geister bluten nicht.",
  "Se duplica antes de que caiga su propio Sangrado: un objetivo sin Sangrado solo recibe lo que Hemorragia N añade tras duplicar (nada con la Hemorragia simple). Solo un golpe que acierta. Los fantasmas no sangran.",
  "Raddoppiato prima che arrivi il suo Sanguinamento: un bersaglio senza Sanguinamento riceve solo ciò che Emorragia N aggiunge dopo il raddoppio (niente con l'Emorragia semplice). Solo un colpo che va a segno. I fantasmi non sanguinano.",
  "Duplicado antes de cair o seu próprio Sangramento: um alvo sem Sangramento só recebe o que Hemorragia N soma depois de duplicar (nada com a Hemorragia simples). Só um golpe que acerta. Fantasmas não sangram.",
  "Dinodoble bago dumapo ang sarili nitong Pagdurugo: ang target na walang Pagdurugo ay nakakakuha lamang ng idinadagdag ng Pagdurugo-Lalim N pagkatapos ng pagdodoble (wala sa simpleng Pagdurugo-Lalim). Tamang tumama lamang. Hindi dumudugo ang mga multo.",
  "தன் குருதிப்போக்கு சேரும் முன் இரட்டிக்கும்: குருதிப்போக்கு இல்லாத இலக்குக்கு, இரட்டித்த பின் குருதிப்பெருக்கு N சேர்ப்பது மட்டுமே கிடைக்கும் (சாதாரண குருதிப்பெருக்கில் ஒன்றும் இல்லை). தாக்கு படும்போது மட்டுமே. ஆவிகளுக்குக் குருதி வராது.",
  "Digandakan sebelum Pendarahannya sendiri masuk: target tanpa Pendarahan hanya mendapat tambahan Pendarahan Hebat N setelah penggandaan (tidak ada untuk Pendarahan Hebat biasa). Hanya serangan yang kena. Hantu tidak berdarah.",
  "先翻倍，再加上它自己的流血：没有流血的目标只会得到大出血 N 在翻倍后附加的部分（普通大出血则没有）。只有命中的攻击才算。幽灵不会流血。",
  "先翻倍，再加上它自己的流血：沒有流血的目標只會得到大出血 N 在翻倍後附加的部分（普通大出血則沒有）。只有命中的攻擊才算。幽靈不會流血。",
  "自分の出血が乗る前に倍になる。出血のない相手には、倍化の後に大出血Nが加える分だけ（ふつうの大出血では何もなし）。当たった攻撃のみ。ゴーストは出血しない。",
  "자기 출혈이 붙기 전에 두 배가 됩니다. 출혈이 없는 대상은 두 배 뒤에 대출혈 N이 더하는 만큼만 받습니다(그냥 대출혈이면 없음). 맞은 공격만. 유령은 피를 흘리지 않습니다."],
"Its hits double the Bleed the target already has, then add {n} Bleed.": [
  "Ses coups doublent le Saignement de la cible, puis ajoutent {n} Saignement.", "Seine Treffer verdoppeln die Blutung des Ziels und fügen dann {n} Blutung hinzu.",
  "Sus golpes duplican el Sangrado del objetivo y luego añaden {n} de Sangrado.", "I suoi colpi raddoppiano il Sanguinamento del bersaglio, poi aggiungono {n} Sanguinamento.",
  "Os seus golpes duplicam o Sangramento do alvo e depois somam {n} de Sangramento.", "Dinodoble ng mga tama nito ang Pagdurugo ng target, saka nagdaragdag ng {n} Pagdurugo.",
  "அதன் தாக்குகள் இலக்கின் குருதிப்போக்கை இரட்டிக்கும், பின் {n} குருதிப்போக்கைச் சேர்க்கும்.", "Serangannya menggandakan Pendarahan target, lalu menambah {n} Pendarahan.",
  "它的攻击让目标已有的流血翻倍，再附加 {n} 层流血。", "它的攻擊讓目標已有的流血翻倍，再附加 {n} 層流血。", "その攻撃は対象の出血を倍にし、さらに出血{n}を加える。", "공격하면 대상의 출혈을 두 배로 만든 뒤 출혈 {n}을 더해요."],
"Breach": ["Brèche", "Durchbruch", "Brecha", "Breccia", "Brecha", "Butas", "உடைப்பு", "Terobos", "破阵", "破陣", "突破", "돌파"],
"Every hit it lands also deals {n} damage to the enemy bramble.": [
  "Chaque coup qui porte inflige aussi {n} dégâts à la ronce ennemie.", "Jeder Treffer fügt auch der gegnerischen Dornenburg {n} Schaden zu.",
  "Cada golpe que acierta también hace {n} de daño a la zarza enemiga.", "Ogni colpo a segno infligge anche {n} danni al rovo nemico.",
  "Cada golpe que acerta também causa {n} de dano à silva inimiga.", "Bawat tamang tama nito ay nagbibigay rin ng {n} pinsala sa kalabang bramble.",
  "அது படும் ஒவ்வொரு தாக்கும் எதிரி முட்புதருக்கும் {n} சேதம் தரும்.", "Setiap serangan yang kena juga memberi {n} kerusakan ke semak duri musuh.",
  "它每次命中，也对敌方荆棘造成 {n} 点伤害。", "它每次命中，也對敵方荊棘造成 {n} 點傷害。", "攻撃が当たるたび、敵の砦にも{n}ダメージを与える。", "공격이 맞을 때마다 적 가시덤불에도 {n} 피해를 줘요."],
"Only a melee swing that lands on a unit, whatever the hit did to it. Rampart and Bramble Armor still cut it.": [
  "Seulement un coup de mêlée qui touche une unité, quoi qu'il lui fasse. Rempart et Armure de ronce le réduisent quand même.",
  "Nur ein Nahkampfschlag, der eine Einheit trifft, egal was er ihr antut. Bollwerkmauer und Dornenrüstung mindern ihn trotzdem.",
  "Solo un golpe cuerpo a cuerpo que acierta a una unidad, haga lo que haga. Muralla y Armadura de zarza lo siguen reduciendo.",
  "Solo un colpo in mischia che colpisce un'unità, qualunque cosa le faccia. Bastione e Armatura di rovo lo riducono comunque.",
  "Só um golpe corpo a corpo que acerta uma unidade, faça o que fizer. Muralha e Armadura de silva continuam a reduzi-lo.",
  "Tamang suntok lamang sa isang unit, anuman ang nagawa nito. Binabawasan pa rin ito ng Pader at ng Baluti ng Bramble.",
  "ஓர் அலகின் மீது படும் நேரடித் தாக்கு மட்டுமே, அது என்ன செய்தாலும். அரணும் முட்புதர்க் கவசமும் அதைக் குறைக்கும்.",
  "Hanya serangan jarak dekat yang mengenai unit, apa pun akibatnya. Benteng dan Zirah Semak Duri tetap menguranginya.",
  "只算命中单位的近战攻击，无论这一击造成了什么。壁垒和荆棘护甲仍会削减它。", "只算命中單位的近戰攻擊，無論這一擊造成了什麼。壁壘和荊棘護甲仍會削減它。",
  "ユニットに当たった近接攻撃のみ（その攻撃の結果は問わない）。城壁と砦の鎧で減る。", "유닛에 맞은 근접 공격만 해당돼요(그 공격이 무엇을 했든). 성벽과 가시덤불 갑옷으로 여전히 줄어요."],
"Canopy Cover": ["Couvert des feuillages", "Blätterdeckung", "Refugio del dosel", "Riparo delle fronde", "Abrigo da copa", "Lilim ng Kanopi", "மரநிழல் மறைவு", "Naungan Kanopi", "林荫掩护", "林蔭掩護", "木陰の隠れ身", "수관 은신"],
"Under the trees, this ground unit dodges half the single-target attacks aimed at it.": [
  "Sous les arbres, cette unité au sol esquive la moitié des attaques ciblées sur elle.", "Unter den Bäumen weicht diese Bodeneinheit der Hälfte der gezielten Angriffe auf sie aus.",
  "Bajo los árboles, esta unidad de tierra esquiva la mitad de los ataques dirigidos a ella.", "Sotto gli alberi, questa unità di terra schiva metà degli attacchi mirati a lei.",
  "Debaixo das árvores, esta unidade terrestre esquiva metade dos ataques dirigidos a ela.", "Sa ilalim ng mga puno, naiilagan ng unit na ito sa lupa ang kalahati ng mga atakeng nakatutok dito.",
  "மரங்களின் கீழ், இந்தத் தரை அலகு தன்னைக் குறிவைக்கும் தாக்குகளில் பாதியைத் தவிர்க்கும்.", "Di bawah pepohonan, unit darat ini menghindari separuh serangan yang diarahkan kepadanya.",
  "在树下，这个地面单位能闪避一半针对它的单体攻击。", "在樹下，這個地面單位能閃避一半針對它的單體攻擊。", "木々の下では、この地上ユニットは自分を狙う単体攻撃の半分を回避する。", "나무 아래에서 이 지상 유닛은 자기를 노린 단일 공격의 절반을 피해요."],
"Under the trees: any fight on a forest map (the Old Woods), High Canopy or the Undergrowth. Ground: not Flying (a grounded flyer counts). One roll, like Evasive, and not on top of Evasive. True Strike and Exposed see through it.": [
  "Sous les arbres : tout combat sur une carte de forêt (le Vieux bois), la Haute canopée ou le Sous-bois. Au sol : sans Vol (un volant cloué au sol compte). Un seul jet, comme Insaisissable, et pas en plus d'Insaisissable. Coup sûr et Exposée le voient.",
  "Unter den Bäumen: jeder Kampf auf einer Waldkarte (Alter Wald), im Hohen Blätterdach oder im Unterholz. Boden: nicht Fliegend (ein heruntergeholter Flieger zählt). Ein Wurf, wie Ausweichend, und nicht zusätzlich zu Ausweichend. Sicherer Treffer und Entblößt durchschauen es.",
  "Bajo los árboles: cualquier combate en un mapa de bosque (el Bosque viejo), el Dosel alto o el Sotobosque. De tierra: sin Volador (un volador derribado cuenta). Una tirada, como Evasiva, y no además de Evasiva. Golpe certero y Expuesta lo atraviesan.",
  "Sotto gli alberi: ogni scontro su una mappa di bosco (il Bosco antico), l'Alta chioma o il Sottobosco. Di terra: non Volante (un volante abbattuto conta). Un solo tiro, come Elusiva, e non in aggiunta a Elusiva. Colpo sicuro ed Esposta lo vedono.",
  "Debaixo das árvores: qualquer combate num mapa de floresta (o Bosque antigo), a Copa alta ou o Mato rasteiro. Terrestre: sem Voador (um voador derrubado conta). Um só lançamento, como Evasiva, e não além de Evasiva. Golpe certeiro e Exposta veem através dele.",
  "Sa ilalim ng mga puno: anumang laban sa mapang gubat (ang Matandang Gubat), sa Mataas na Kanopi o sa Kasukalan. Sa lupa: hindi Lumilipad (bilang ang lumilipad na ibinaba sa lupa). Isang tira, gaya ng Mailap, at hindi dagdag sa Mailap. Nakikita ito ng Tiyak na Tama at ng Nakalantad.",
  "மரங்களின் கீழ்: காட்டு வரைபடத்தில் (பழங்காடு), உயர் மரவிதானத்தில் அல்லது அடர்புதரில் நடக்கும் எந்தச் சண்டையும். தரை: பறக்காதது (தரையிறக்கப்பட்ட பறவையும் அடங்கும்). ஏமாற்றுவது போல் ஒரே வீச்சு, அதன் மேல் கூடுதலாக அல்ல. உறுதித் தாக்கும் வெளிப்பட்டதும் அதைக் கடந்து பார்க்கும்.",
  "Di bawah pepohonan: pertarungan apa pun di peta hutan (Hutan Tua), Kanopi Tinggi, atau Semak Belukar. Darat: tidak Terbang (penerbang yang dijatuhkan dihitung). Satu lemparan, seperti Mengelak, dan tidak ditambah Mengelak. Serangan Pasti dan Terekspos menembusnya.",
  "树下：森林地图（古林）、高树冠或灌木丛中的任何战斗。地面：没有飞行（被击落的飞行单位也算）。和闪避一样只判定一次，不与闪避叠加。必中和暴露能看穿它。",
  "樹下：森林地圖（古林）、高樹冠或灌木叢中的任何戰鬥。地面：沒有飛行（被擊落的飛行單位也算）。和閃避一樣只判定一次，不與閃避疊加。必中和暴露能看穿它。",
  "木々の下：森のマップ（古い森）、高い樹冠、下草での戦い。地上：飛行なし（地上に落とされた飛行ユニットも含む）。回避と同じく判定は1回で、回避と重ならない。必中と無防備は見破る。",
  "나무 아래: 숲 지도(오래된 숲), 높은 수관, 덤불숲에서의 모든 싸움. 지상: 비행이 없음(땅에 떨어진 비행 유닛도 포함). 회피처럼 한 번만 굴리며 회피와 겹치지 않아요. 필중과 노출은 꿰뚫어 봐요."],
"Timbered": ["Boisé", "Holzreich", "Maderero", "Legnoso", "Madeireiro", "Matibay sa Kahoy", "மரவளம்", "Berkayu", "囤木", "囤木", "木組み", "목재 비축"],
"While you hold 3 or more Lumber: {skills}.": [
  "Tant que vous avez 3 Bois ou plus : {skills}.", "Solange du 3 oder mehr Holz hast: {skills}.", "Mientras tengas 3 o más de Madera: {skills}.", "Finché hai 3 o più Legna: {skills}.",
  "Enquanto tiveres 3 ou mais de Madeira: {skills}.", "Habang may hawak kang 3 o higit pang Kahoy: {skills}.", "உன்னிடம் 3 அல்லது அதற்கு மேல் மரம் இருக்கும் வரை: {skills}.", "Selama kamu memegang 3 Kayu atau lebih: {skills}.",
  "当你持有 3 个或更多木材时：{skills}。", "當你持有 3 個或更多木材時：{skills}。", "木材を3以上持っている間：{skills}。", "목재가 3개 이상 있는 동안: {skills}."],
"Plain Timbered gives +0/+2. It turns on and off as your Lumber goes up and down.": [
  "Boisé simple donne +0/+2. Il s'allume et s'éteint selon votre Bois.", "Einfaches Holzreich gibt +0/+2. Es geht an und aus, wie dein Holz steigt und fällt.",
  "Maderero simple da +0/+2. Se enciende y se apaga según suba o baje tu Madera.", "Legnoso semplice dà +0/+2. Si accende e si spegne mentre la tua Legna sale e scende.",
  "Madeireiro simples dá +0/+2. Liga e desliga conforme a tua Madeira sobe e desce.", "Ang simpleng Matibay sa Kahoy ay nagbibigay ng +0/+2. Bumubukas at sumasara ito habang tumataas at bumababa ang Kahoy mo.",
  "சாதாரண மரவளம் +0/+2 தரும். உன் மரம் ஏறி இறங்கும்போது அது இயங்கி நிற்கும்.", "Berkayu biasa memberi +0/+2. Menyala dan padam saat Kayu-mu naik dan turun.",
  "普通囤木给予 +0/+2。随着你的木材增减而开启或关闭。", "普通囤木給予 +0/+2。隨著你的木材增減而開啟或關閉。", "ふつうの木組みは+0/+2。木材の増減に合わせてオンとオフが切り替わる。", "기본 목재 비축은 +0/+2를 줘요. 목재가 늘고 줄면 켜지고 꺼져요."],
"Bedrock": ["Roc", "Grundfels", "Lecho de roca", "Roccia madre", "Rocha-mãe", "Batong-Saligan", "அடிப்பாறை", "Batuan Dasar", "基岩", "基岩", "岩盤", "기반암"],
"While you hold 2 or more Stone: {skills}.": [
  "Tant que vous avez 2 Pierres ou plus : {skills}.", "Solange du 2 oder mehr Stein hast: {skills}.", "Mientras tengas 2 o más de Piedra: {skills}.", "Finché hai 2 o più Pietra: {skills}.",
  "Enquanto tiveres 2 ou mais de Pedra: {skills}.", "Habang may hawak kang 2 o higit pang Bato: {skills}.", "உன்னிடம் 2 அல்லது அதற்கு மேல் கல் இருக்கும் வரை: {skills}.", "Selama kamu memegang 2 Batu atau lebih: {skills}.",
  "当你持有 2 个或更多岩石时：{skills}。", "當你持有 2 個或更多岩石時：{skills}。", "石を2以上持っている間：{skills}。", "돌이 2개 이상 있는 동안: {skills}."],
"Plain Bedrock gives Armor 1. Stone comes from cards that quarry it or are pitched for it.": [
  "Roc simple donne Armure 1. La Pierre vient des cartes qui l'extraient ou qu'on défausse pour elle.", "Einfacher Grundfels gibt Rüstung 1. Stein kommt von Karten, die ihn brechen oder dafür abgeworfen werden.",
  "Lecho de roca simple da Armadura 1. La Piedra sale de cartas que la extraen o que se descartan por ella.", "Roccia madre semplice dà Armatura 1. La Pietra viene da carte che la estraggono o che si scartano per averla.",
  "Rocha-mãe simples dá Armadura 1. A Pedra vem de cartas que a extraem ou que se descartam por ela.", "Ang simpleng Batong-Saligan ay nagbibigay ng Baluti 1. Ang Bato ay galing sa mga card na nagmimina nito o itinatapon para dito.",
  "சாதாரண அடிப்பாறை கவசம் 1 தரும். கல்லை வெட்டியெடுக்கும் அல்லது அதற்காக எறியப்படும் அட்டைகளிலிருந்து கல் வரும்.", "Batuan Dasar biasa memberi Zirah 1. Batu berasal dari kartu yang menambangnya atau dibuang untuknya.",
  "普通基岩给予护甲 1。岩石来自开采它的卡牌，或为它弃置的卡牌。", "普通基岩給予護甲 1。岩石來自開採它的卡牌，或為它棄置的卡牌。", "ふつうの岩盤はアーマー1。石は石を切り出すカードや、石のために捨てるカードから得る。", "기본 기반암은 갑옷 1을 줘요. 돌은 돌을 캐는 카드나 돌을 위해 버리는 카드에서 나와요."],
"Forged": ["Forgé", "Geschmiedet", "Forjado", "Forgiato", "Forjado", "Hinulma", "வார்க்கப்பட்டது", "Ditempa", "锻造", "鍛造", "鍛え抜き", "단련"],
"While you hold 1 or more Metal: {skills}.": [
  "Tant que vous avez 1 Métal ou plus : {skills}.", "Solange du 1 oder mehr Metall hast: {skills}.", "Mientras tengas 1 o más de Metal: {skills}.", "Finché hai 1 o più Metallo: {skills}.",
  "Enquanto tiveres 1 ou mais de Metal: {skills}.", "Habang may hawak kang 1 o higit pang Metal: {skills}.", "உன்னிடம் 1 அல்லது அதற்கு மேல் உலோகம் இருக்கும் வரை: {skills}.", "Selama kamu memegang 1 Logam atau lebih: {skills}.",
  "当你持有 1 个或更多金属时：{skills}。", "當你持有 1 個或更多金屬時：{skills}。", "金属を1以上持っている間：{skills}。", "금속이 1개 이상 있는 동안: {skills}."],
"Plain Forged gives +1/+0. Metal comes from smelters and cards that make it.": [
  "Forgé simple donne +1/+0. Le Métal vient des fonderies et des cartes qui en produisent.", "Einfaches Geschmiedet gibt +1/+0. Metall kommt von Schmelzern und Karten, die es herstellen.",
  "Forjado simple da +1/+0. El Metal sale de fundidores y de cartas que lo producen.", "Forgiato semplice dà +1/+0. Il Metallo viene da fonderie e da carte che lo producono.",
  "Forjado simples dá +1/+0. O Metal vem de fundidores e de cartas que o produzem.", "Ang simpleng Hinulma ay nagbibigay ng +1/+0. Ang Metal ay galing sa mga tunawan at sa mga card na gumagawa nito.",
  "சாதாரண வார்க்கப்பட்டது +1/+0 தரும். உருக்காலைகளிலிருந்தும் அதைச் செய்யும் அட்டைகளிலிருந்தும் உலோகம் வரும்.", "Ditempa biasa memberi +1/+0. Logam berasal dari peleburan dan kartu yang membuatnya.",
  "普通锻造给予 +1/+0。金属来自熔炉和产出金属的卡牌。", "普通鍛造給予 +1/+0。金屬來自熔爐和產出金屬的卡牌。", "ふつうの鍛え抜きは+1/+0。金属は精錬するものや金属を作るカードから得る。", "기본 단련은 +1/+0을 줘요. 금속은 제련소와 금속을 만드는 카드에서 나와요."],
"Last Stand": ["Dernier carré", "Letztes Gefecht", "Última resistencia", "Ultima difesa", "Última resistência", "Huling Paninindigan", "இறுதி நிலைப்பு", "Pertahanan Terakhir", "背水一战", "背水一戰", "背水の陣", "최후의 저항"],
"While your bramble is at a third of its Health or less: {skills}.": [
  "Tant que votre ronce est à un tiers de sa Vie ou moins : {skills}.", "Solange deine Dornenburg bei einem Drittel ihrer Lebenspunkte oder weniger ist: {skills}.",
  "Mientras tu zarza esté a un tercio de su Salud o menos: {skills}.", "Finché il tuo rovo è a un terzo della sua Salute o meno: {skills}.",
  "Enquanto a tua silva estiver a um terço da sua Vida ou menos: {skills}.", "Habang nasa ikatlo o mas mababa ng Buhay nito ang iyong bramble: {skills}.",
  "உன் முட்புதரின் உயிர் மூன்றில் ஒரு பங்கு அல்லது குறைவாக இருக்கும் வரை: {skills}.", "Selama semak durimu di sepertiga Nyawanya atau kurang: {skills}.",
  "当你的荆棘生命值在三分之一或以下时：{skills}。", "當你的荊棘生命值在三分之一或以下時：{skills}。", "自分の砦の体力が3分の1以下の間：{skills}。", "내 가시덤불의 체력이 3분의 1 이하인 동안: {skills}."],
"Plain Last Stand gives +1/+1. It turns off again if the bramble is healed above a third.": [
  "Dernier carré simple donne +1/+1. Il s'éteint si la ronce est soignée au-dessus d'un tiers.", "Einfaches Letztes Gefecht gibt +1/+1. Es geht wieder aus, wenn die Dornenburg über ein Drittel geheilt wird.",
  "Última resistencia simple da +1/+1. Se apaga si la zarza se cura por encima de un tercio.", "Ultima difesa semplice dà +1/+1. Si spegne se il rovo viene curato sopra un terzo.",
  "Última resistência simples dá +1/+1. Desliga se a silva for curada acima de um terço.", "Ang simpleng Huling Paninindigan ay nagbibigay ng +1/+1. Namamatay ito ulit kapag napagaling ang bramble nang lampas sa ikatlo.",
  "சாதாரண இறுதி நிலைப்பு +1/+1 தரும். முட்புதர் மூன்றில் ஒரு பங்குக்கு மேல் குணமானால் அது மீண்டும் அணையும்.", "Pertahanan Terakhir biasa memberi +1/+1. Padam lagi jika semak duri dipulihkan di atas sepertiga.",
  "普通背水一战给予 +1/+1。荆棘被治疗到三分之一以上时会再次关闭。", "普通背水一戰給予 +1/+1。荊棘被治療到三分之一以上時會再次關閉。", "ふつうの背水の陣は+1/+1。砦が3分の1より上まで回復すると再びオフになる。", "기본 최후의 저항은 +1/+1을 줘요. 가시덤불이 3분의 1 위로 회복되면 다시 꺼져요."],
"{skill} is on": ["{skill} est actif", "{skill} ist an", "{skill} está activo", "{skill} è attivo", "{skill} está ativo", "Bukas ang {skill}", "{skill} இயங்குகிறது", "{skill} aktif", "{skill} 已开启", "{skill} 已開啟", "{skill}がオン", "{skill} 켜짐"],
"{att} breaches the enemy bramble for {d}.": [
  "{att} fait une brèche dans la ronce ennemie : {d}.", "{att} durchbricht die gegnerische Dornenburg für {d}.", "{att} abre brecha en la zarza enemiga: {d}.", "{att} apre una breccia nel rovo nemico: {d}.",
  "{att} abre brecha na silva inimiga: {d}.", "Binutas ni {att} ang kalabang bramble nang {d}.", "{att} எதிரி முட்புதரை {d} உடைக்கிறது.", "{att} menerobos semak duri musuh sebesar {d}.",
  "{att} 破入敌方荆棘，造成 {d} 点伤害。", "{att} 破入敵方荊棘，造成 {d} 點傷害。", "{att}が敵の砦を突破して{d}ダメージ。", "{att}이(가) 적 가시덤불을 돌파해 {d} 피해."],
"{att} breaches your bramble for {d}.": [
  "{att} fait une brèche dans votre ronce : {d}.", "{att} durchbricht deine Dornenburg für {d}.", "{att} abre brecha en tu zarza: {d}.", "{att} apre una breccia nel tuo rovo: {d}.",
  "{att} abre brecha na tua silva: {d}.", "Binutas ni {att} ang iyong bramble nang {d}.", "{att} உன் முட்புதரை {d} உடைக்கிறது.", "{att} menerobos semak durimu sebesar {d}.",
  "{att} 破入你的荆棘，造成 {d} 点伤害。", "{att} 破入你的荊棘，造成 {d} 點傷害。", "{att}が自分の砦を突破して{d}ダメージ。", "{att}이(가) 내 가시덤불을 돌파해 {d} 피해."],
"{name} hides under the canopy: {att} misses.": [
  "{name} se cache sous les feuillages : {att} le manque.", "{name} versteckt sich unter dem Blätterdach: {att} verfehlt.", "{name} se esconde bajo el dosel: {att} falla.", "{name} si nasconde sotto le fronde: {att} manca il colpo.",
  "{name} esconde-se debaixo da copa: {att} falha.", "Nagtago si {name} sa ilalim ng kanopi: sumablay si {att}.", "{name} மரநிழலில் மறைகிறது: {att} தவறுகிறது.", "{name} bersembunyi di bawah kanopi: {att} meleset.",
  "{name} 躲进林荫：{att} 落空。", "{name} 躲進林蔭：{att} 落空。", "{name}は木陰に隠れた：{att}の攻撃は外れた。", "{name}이(가) 수관 아래 숨었어요: {att}의 공격이 빗나갔어요."],
"{name}'s {skill} is on.": [
  "{skill} de {name} est actif.", "{skill} von {name} ist an.", "{skill} de {name} está activo.", "{skill} di {name} è attivo.", "{skill} de {name} está ativo.", "Bukas ang {skill} ni {name}.",
  "{name} இன் {skill} இயங்குகிறது.", "{skill} milik {name} aktif.", "{name} 的{skill}已开启。", "{name} 的{skill}已開啟。", "{name}の{skill}がオンになった。", "{name}의 {skill}이(가) 켜졌어요."],
"{name}'s {skill} fades.": [
  "{skill} de {name} s'éteint.", "{skill} von {name} erlischt.", "{skill} de {name} se apaga.", "{skill} di {name} svanisce.", "{skill} de {name} apaga-se.", "Naglaho ang {skill} ni {name}.",
  "{name} இன் {skill} மங்குகிறது.", "{skill} milik {name} padam.", "{name} 的{skill}消退了。", "{name} 的{skill}消退了。", "{name}の{skill}が消えた。", "{name}의 {skill}이(가) 꺼졌어요."],
"{min} to {max} players": ["{min} à {max} joueurs", "{min} bis {max} Spieler", "De {min} a {max} jugadores", "Da {min} a {max} giocatori", "De {min} a {max} jogadores", "{min} hanggang {max} manlalaro",
  "{min} முதல் {max} வீரர்கள்", "{min} sampai {max} pemain", "{min} 至 {max} 名玩家", "{min} 至 {max} 名玩家", "{min}〜{max}人", "{min}~{max}명"],
"{n} of {size} seats taken": ["{n} places prises sur {size}", "{n} von {size} Plätzen besetzt", "{n} de {size} asientos ocupados", "{n} posti occupati su {size}", "{n} de {size} lugares ocupados", "{n} sa {size} upuan ang may nakaupo",
  "{size} இருக்கைகளில் {n} நிரம்பின", "{n} dari {size} kursi terisi", "{size} 个座位已占 {n} 个", "{size} 個座位已佔 {n} 個", "{size}席中{n}席が埋まっている", "{size}자리 중 {n}자리 찼어요"],
}
assert all(len(v) == len(CODES) for v in T.values()), [k for k, v in T.items() if len(v) != len(CODES)]
ph = lambda s: sorted(set(re.findall(r'\{\w+\}', s)))
assert all(ph(k) == ph(t) for k, v in T.items() for t in v), [(k, t) for k, v in T.items() for t in v if ph(k) != ph(t)]
def dump(path, d):
    with open(path, 'w', encoding='utf-8') as fh:
        json.dump(d, fh, ensure_ascii=False, indent=1); fh.write('\n')
def gp(code, s):
    for a, b in GP[code]: s = re.sub(a, b, s)
    return s
for i, code in enumerate(CODES):
    path = os.path.join(ROOT, 'lang', code + '.json'); ui = os.path.join(ROOT, 'lang', 'ui', code + '.json')
    pack = json.load(open(path, encoding='utf-8')); uipack = json.load(open(ui, encoding='utf-8'))
    for d in (pack, uipack):
        for k in [k for k in d if 'Greater Poison' in k]:
            v = d.pop(k); d[k.replace('Greater Poison', 'Deadly Poison')] = gp(code, v)
    a, b = BL_CLAUSE[code]
    for old, new in ((BL_OLD_DESC, BL_NEW_DESC), (BL_OLD_DESCL, BL_NEW_DESCL)):
        for d in (pack, uipack):
            if old in d:
                v = d.pop(old); assert a in v, (code, v[-60:]); d[new] = v.replace(a, b)
        assert new in pack or new in uipack, (code, 'no Bloom row', new[:40])
    for d in (pack, uipack):
        if BL_OLD_CODEX in d:
            v = d.pop(BL_OLD_CODEX); d[BL_NEW_CODEX] = v.rstrip() + ' ' + BL_CODEX_ADD[code]
    assert BL_NEW_CODEX in pack or BL_NEW_CODEX in uipack, (code, 'no Bloom codex row')
    pack.pop(HEMO_OLD_CODEX, None); uipack.pop(HEMO_OLD_CODEX, None)
    for dead in ('Hidden!',): pack.pop(dead, None)  # a float the first build had (the dodge's own "Evaded!" says it)
    for en, row in T.items(): uipack.pop(en, None); pack[en] = row[i]
    dump(path, pack); dump(ui, uipack)
print('wrote', len(CODES), 'packs:', len(T), 'new rows each, Greater Poison -> Deadly Poison, Bloom\'s copy can bloom')
