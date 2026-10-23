#!/usr/bin/env python3
"""Game texts added or changed on 2026-10-23 by package EN3 (owner 19:27 #2, #3, #5, #7, #8): Rampart and Bramble Armor (the bramble's two new
skills), Guardian never guards the bramble and a Guardian steps in for a Guardian, Bleed fades at the round's end (after it bled), a Boomerang
thrown on a miss. Same rules as tools/i18n_2026_10_23_en2.py: keys are the English as the page translator sees it, every {placeholder} is kept;
the replaced English rows are dropped. Tagalog, Tamil, Japanese and Korean deserve a native read.
  python3 tools/i18n_2026_10_23_en3.py"""
import json, os, re
ROOT = os.path.join(os.path.dirname(os.path.abspath(__file__)), '..')
CODES = ['fr', 'de', 'es', 'it', 'pt', 'tl', 'ta', 'id', 'zh-Hans', 'zh-Hant', 'ja', 'ko']
DEAD = [
 "Steps in front of an adjacent ally (beside it; in a raid, in front or behind) and takes the plain attacks aimed at it. Skills and area hits don't. Taunt is different: it makes the enemies facing it aim at it.",
 "Takes the plain attacks aimed at its adjacent allies.",
 "hurts by its stacks as it attacks or uses skills; −1 stack each round start, bled or not.",
 "takes {n} damage as it attacks or uses skills; −1 stack each round start, bled or not.",
 "🩸 Bleeding: this card takes damage every time it attacks or uses a skill. At the start of each round the stack drops by 1, whether it bled or not; Cleanse removes it.",
]
T = {
"Rampart": ["Rempart", "Bollwerkmauer", "Muralla", "Bastione", "Muralha", "Pader", "அரண்", "Benteng", "壁垒", "壁壘", "城壁", "성벽"],
"Takes half of each hit on your bramble (rounded up); the bramble takes the rest.": [
 "Prend la moitié de chaque coup porté à votre ronce (arrondie au supérieur) ; la ronce prend le reste.",
 "Nimmt die Hälfte jedes Treffers auf deinen Dorn (aufgerundet); der Dorn nimmt den Rest.",
 "Recibe la mitad de cada golpe a tu zarza (redondeada hacia arriba); la zarza recibe el resto.",
 "Subisce metà di ogni colpo al tuo rovo (arrotondata per eccesso); il rovo subisce il resto.",
 "Recebe metade de cada golpe na tua silva (arredondada para cima); a silva recebe o resto.",
 "Sinasalo ang kalahati ng bawat tama sa iyong bramble (pataas ang pag-round); ang bramble ang sasalo sa natitira.",
 "உங்கள் முட்புதர் மீதான ஒவ்வொரு தாக்குதலின் பாதியை (மேல்நோக்கி முழுமையாக்கி) ஏற்கும்; மீதியை முட்புதர் ஏற்கும்.",
 "Menerima separuh dari setiap serangan ke semak durimu (dibulatkan ke atas); semak duri menerima sisanya.",
 "替你的荆棘承受每次攻击的一半（向上取整）；其余由荆棘承受。",
 "替你的荊棘承受每次攻擊的一半（無條件進位）；其餘由荊棘承受。",
 "あなたの砦への攻撃をそれぞれ半分（切り上げ）引き受ける。残りは砦が受ける。",
 "내 가시덤불에 들어오는 공격마다 절반(올림)을 대신 받아요. 나머지는 가시덤불이 받아요."],
"Hits from units only: swings, shots, skills, a boomerang. The field's own damage to a bramble isn't shared. With two or more, the one nearest the attacker's column takes it. Its share is plain damage: its Shield soaks first, Armor doesn't.": [
 "Seulement les coups des unités : attaques, tirs, compétences, un boomerang. Les dégâts du terrain lui-même sur une ronce ne sont pas partagés. S'il y en a plusieurs, celui le plus proche de la colonne de l'attaquant le prend. Sa part est un dégât simple : son Bouclier absorbe d'abord, pas son Armure.",
 "Nur Treffer von Einheiten: Angriffe, Schüsse, Fähigkeiten, ein Bumerang. Der Schaden des Felds selbst an einem Dorn wird nicht geteilt. Bei mehreren nimmt ihn der, der der Spalte des Angreifers am nächsten steht. Sein Anteil ist einfacher Schaden: zuerst fängt sein Schild ab, seine Rüstung nicht.",
 "Solo golpes de unidades: ataques, disparos, habilidades, un bumerán. El daño propio del campo a una zarza no se reparte. Con dos o más, lo recibe el más cercano a la columna del atacante. Su parte es daño simple: su Escudo absorbe primero, su Armadura no.",
 "Solo colpi delle unità: attacchi, tiri, abilità, un boomerang. I danni del campo stesso a un rovo non si dividono. Con due o più, lo subisce quello più vicino alla colonna dell'attaccante. La sua parte è danno semplice: prima assorbe il suo Scudo, non la sua Armatura.",
 "Só golpes de unidades: ataques, disparos, habilidades, um bumerangue. O dano do próprio campo a uma silva não é dividido. Com dois ou mais, recebe-o o mais próximo da coluna do atacante. A sua parte é dano simples: o Escudo absorve primeiro, a Armadura não.",
 "Tama lang mula sa mga yunit: atake, tira, kakayahan, boomerang. Hindi hinahati ang sariling pinsala ng field sa bramble. Kapag dalawa o higit pa, ang pinakamalapit sa hanay ng umaatake ang sasalo. Karaniwang pinsala ang bahagi nito: Kalasag muna ang sasalo, hindi ang Baluti.",
 "அலகுகளின் தாக்குதல்கள் மட்டும்: அடிகள், எய்தல்கள், திறன்கள், ஒரு பூமராங். களத்தின் சொந்தச் சேதம் முட்புதருக்குப் பகிரப்படாது. இரண்டு அல்லது அதிகம் இருந்தால், தாக்குபவரின் நெடுவரிசைக்கு அருகிலுள்ளது ஏற்கும். அதன் பங்கு சாதாரணச் சேதம்: முதலில் அதன் கேடயம் உறிஞ்சும், கவசம் அல்ல.",
 "Hanya serangan dari unit: serangan, tembakan, kemampuan, bumerang. Kerusakan dari medan itu sendiri ke semak duri tidak dibagi. Jika ada dua atau lebih, yang paling dekat dengan kolom penyerang yang menerimanya. Bagiannya adalah kerusakan biasa: Perisainya menyerap lebih dulu, Zirahnya tidak.",
 "只算单位造成的攻击：普通攻击、射击、技能、回旋镖。场地本身对荆棘的伤害不分担。有两个或更多时，由离攻击者那一列最近的那个承受。它分到的是普通伤害：先由护盾吸收，护甲不减免。",
 "只算單位造成的攻擊：普通攻擊、射擊、技能、迴旋鏢。場地本身對荊棘的傷害不分擔。有兩個或更多時，由離攻擊者那一列最近的那個承受。它分到的是普通傷害：先由護盾吸收，護甲不減免。",
 "ユニットからの攻撃のみ：通常攻撃、射撃、スキル、ブーメラン。フィールド自体が砦に与えるダメージは分担しない。2体以上いるときは、攻撃者の列に最も近い1体が受ける。分担分は普通のダメージ：シールドが先に吸収し、アーマーは効かない。",
 "유닛의 공격만 해당돼요: 일반 공격, 사격, 스킬, 부메랑. 필드 자체가 가시덤불에 주는 피해는 나누지 않아요. 둘 이상이면 공격자의 열에 가장 가까운 유닛이 받아요. 나눠 받는 피해는 일반 피해예요: 보호막이 먼저 흡수하고, 방어구는 적용되지 않아요."],
"Bramble Armor": ["Armure de ronce", "Dornenrüstung", "Armadura de zarza", "Armatura di rovo", "Armadura de silva", "Baluti ng Bramble", "முட்புதர்க் கவசம்", "Zirah Semak Duri", "荆棘护甲", "荊棘護甲", "砦の鎧", "가시덤불 갑옷"],
"Your bramble takes 1 less damage from each hit.": [
 "Votre ronce subit 1 dégât de moins à chaque coup.",
 "Dein Dorn nimmt durch jeden Treffer 1 Schaden weniger.",
 "Tu zarza recibe 1 de daño menos de cada golpe.",
 "Il tuo rovo subisce 1 danno in meno da ogni colpo.",
 "A tua silva sofre menos 1 de dano em cada golpe.",
 "1 mas kaunting pinsala ang natatanggap ng iyong bramble sa bawat tama.",
 "ஒவ்வொரு தாக்குதலிலும் உங்கள் முட்புதர் 1 குறைவான சேதம் அடையும்.",
 "Semak durimu menerima 1 kerusakan lebih sedikit dari setiap serangan.",
 "你的荆棘每次受到攻击时伤害减少 1。",
 "你的荊棘每次受到攻擊時傷害減少 1。",
 "あなたの砦は攻撃を受けるたびにダメージが1減る。",
 "내 가시덤불은 공격마다 받는 피해가 1 줄어요."],
"Counted after a Rampart's share. Two or more don't add up: still 1 a hit. Supreme hits crush it.": [
 "Compté après la part d'un Rempart. Plusieurs ne s'additionnent pas : toujours 1 par coup. Les coups Suprêmes la brisent.",
 "Wird nach dem Anteil einer Bollwerkmauer gezählt. Mehrere addieren sich nicht: weiter 1 pro Treffer. Höchst-Treffer zerschmettern sie.",
 "Se cuenta tras la parte de una Muralla. Varias no se suman: sigue siendo 1 por golpe. Los golpes Supremos la aplastan.",
 "Si conta dopo la parte di un Bastione. Più d'una non si sommano: sempre 1 a colpo. I colpi Supremi la frantumano.",
 "Conta depois da parte de uma Muralha. Várias não se somam: continua a ser 1 por golpe. Os golpes Supremos esmagam-na.",
 "Binibilang pagkatapos ng bahagi ng Pader. Hindi nagdadagdagan ang dalawa o higit pa: 1 pa rin bawat tama. Dinudurog ito ng mga tamang Supreme.",
 "அரணின் பங்குக்குப் பிறகு கணக்கிடப்படும். இரண்டு அல்லது அதிகம் கூடாது: ஒரு தாக்குதலுக்கு இன்னும் 1. உச்ச தாக்குதல்கள் அதை நொறுக்கும்.",
 "Dihitung setelah bagian Benteng. Dua atau lebih tidak dijumlahkan: tetap 1 per serangan. Serangan Agung menghancurkannya.",
 "在壁垒分担之后计算。两个或更多不叠加：每次仍是 1。至高攻击会将其击碎。",
 "在壁壘分擔之後計算。兩個或更多不疊加：每次仍是 1。至高攻擊會將其擊碎。",
 "城壁の分担の後に数える。2体以上でも重ならない：1回の攻撃につき1のまま。至高の攻撃は打ち砕く。",
 "성벽이 나눠 받은 뒤에 계산해요. 둘 이상이어도 더해지지 않아요: 공격마다 여전히 1. 지고 공격은 이를 부숴요."],
"🚧 {name} takes {n} of the hit on its bramble; the bramble takes {b}.": [
 "🚧 {name} prend {n} du coup porté à sa ronce ; la ronce prend {b}.",
 "🚧 {name} nimmt {n} des Treffers auf seinen Dorn; der Dorn nimmt {b}.",
 "🚧 {name} recibe {n} del golpe a su zarza; la zarza recibe {b}.",
 "🚧 {name} subisce {n} del colpo al suo rovo; il rovo subisce {b}.",
 "🚧 {name} recebe {n} do golpe na sua silva; a silva recebe {b}.",
 "🚧 Sinalo ni {name} ang {n} ng tama sa bramble nito; {b} ang sa bramble.",
 "🚧 {name} தன் முட்புதர் மீதான தாக்குதலில் {n} ஏற்கிறது; முட்புதர் {b} ஏற்கிறது.",
 "🚧 {name} menerima {n} dari serangan ke semak durinya; semak duri menerima {b}.",
 "🚧 {name} 替荆棘承受了 {n} 点；荆棘承受 {b} 点。",
 "🚧 {name} 替荊棘承受了 {n} 點；荊棘承受 {b} 點。",
 "🚧 {name} が砦への攻撃のうち {n} を引き受けた。砦は {b} を受ける。",
 "🚧 {name}이(가) 가시덤불에 들어온 공격 중 {n}을(를) 받았어요. 가시덤불은 {b}을(를) 받아요."],
"🌿🛡️ {name}'s Bramble Armor takes 1 off the hit on its bramble.": [
 "🌿🛡️ L'Armure de ronce de {name} retire 1 au coup porté à sa ronce.",
 "🌿🛡️ Die Dornenrüstung von {name} nimmt dem Treffer auf seinen Dorn 1 ab.",
 "🌿🛡️ La Armadura de zarza de {name} quita 1 al golpe a su zarza.",
 "🌿🛡️ L'Armatura di rovo di {name} toglie 1 al colpo al suo rovo.",
 "🌿🛡️ A Armadura de silva de {name} tira 1 ao golpe na sua silva.",
 "🌿🛡️ Binawasan ng Baluti ng Bramble ni {name} nang 1 ang tama sa bramble nito.",
 "🌿🛡️ {name} இன் முட்புதர்க் கவசம் அதன் முட்புதர் மீதான தாக்குதலில் 1 குறைக்கிறது.",
 "🌿🛡️ Zirah Semak Duri milik {name} mengurangi 1 dari serangan ke semak durinya.",
 "🌿🛡️ {name} 的荆棘护甲让对荆棘的这次攻击少了 1 点。",
 "🌿🛡️ {name} 的荊棘護甲讓對荊棘的這次攻擊少了 1 點。",
 "🌿🛡️ {name} の砦の鎧が、砦への攻撃を1減らした。",
 "🌿🛡️ {name}의 가시덤불 갑옷이 가시덤불에 들어온 공격을 1 줄였어요."],
"🪃 {name} misses, but throws its boomerang anyway.": [
 "🪃 {name} rate, mais lance quand même son boomerang.",
 "🪃 {name} verfehlt, wirft seinen Bumerang aber trotzdem.",
 "🪃 {name} falla, pero lanza su bumerán de todos modos.",
 "🪃 {name} manca, ma lancia comunque il suo boomerang.",
 "🪃 {name} falha, mas lança o bumerangue na mesma.",
 "🪃 Sumablay si {name}, pero ibinato pa rin ang boomerang nito.",
 "🪃 {name} தவறுகிறது, ஆனாலும் தன் பூமராங்கை எறிகிறது.",
 "🪃 {name} meleset, tapi tetap melempar bumerangnya.",
 "🪃 {name} 没打中，但还是掷出了回旋镖。",
 "🪃 {name} 沒打中，但還是擲出了迴旋鏢。",
 "🪃 {name} は外したが、それでもブーメランを投げた。",
 "🪃 {name}이(가) 빗맞혔지만 그래도 부메랑을 던졌어요."],
"🦺 Covered!": ["🦺 Couvert !", "🦺 Gedeckt!", "🦺 ¡Cubierto!", "🦺 Coperto!", "🦺 Coberto!", "🦺 Nasalo!", "🦺 காக்கப்பட்டது!", "🦺 Dilindungi!", "🦺 掩护！", "🦺 掩護！", "🦺 かばった！", "🦺 엄호!"],
"🪃 Thrown!": ["🪃 Lancé !", "🪃 Geworfen!", "🪃 ¡Lanzado!", "🪃 Lanciato!", "🪃 Lançado!", "🪃 Ibinato!", "🪃 எறியப்பட்டது!", "🪃 Dilempar!", "🪃 掷出！", "🪃 擲出！", "🪃 投げた！", "🪃 던졌다!"],
"hurts by its stacks as it attacks or uses skills; then −1 stack at the round's end.": [
 "perd de la Santé selon ses cumuls quand elle attaque ou utilise des compétences ; puis −1 cumul à la fin de la manche.",
 "verliert Leben in Höhe ihrer Stapel, wenn sie angreift oder Fähigkeiten nutzt; dann −1 Stapel am Rundenende.",
 "pierde Salud según sus acumulaciones al atacar o usar habilidades; luego −1 acumulación al final de la ronda.",
 "perde Salute pari ai suoi accumuli quando attacca o usa abilità; poi −1 accumulo a fine turno.",
 "perde Vida igual às acumulações ao atacar ou usar habilidades; depois −1 acumulação no fim da ronda.",
 "nasasaktan ayon sa patong nito kapag umaatake o gumagamit ng kakayahan; saka −1 patong sa dulo ng round.",
 "தாக்கும்போதும் திறன்களைப் பயன்படுத்தும்போதும் அடுக்குகளுக்கு ஏற்பக் காயம்; பிறகு சுற்றின் முடிவில் −1 அடுக்கு.",
 "terluka sebesar tumpukannya saat menyerang atau memakai kemampuan; lalu −1 tumpukan di akhir ronde.",
 "攻击或使用技能时按层数受伤；之后在回合结束时 −1 层。",
 "攻擊或使用技能時按層數受傷；之後在回合結束時 −1 層。",
 "攻撃やスキル使用のたび重なった数だけ傷つく。その後ラウンド終了時に −1。",
 "공격하거나 스킬을 쓸 때마다 중첩 수만큼 다친다. 그다음 라운드가 끝날 때 −1."],
"takes {n} damage as it attacks or uses skills; then −1 stack at the round's end.": [
 "subit {n} dégâts quand elle attaque ou utilise des compétences ; puis −1 cumul à la fin de la manche.",
 "nimmt {n} Schaden, wenn sie angreift oder Fähigkeiten nutzt; dann −1 Stapel am Rundenende.",
 "recibe {n} de daño al atacar o usar habilidades; luego −1 acumulación al final de la ronda.",
 "subisce {n} danni quando attacca o usa abilità; poi −1 accumulo a fine turno.",
 "sofre {n} de dano ao atacar ou usar habilidades; depois −1 acumulação no fim da ronda.",
 "tumatanggap ng {n} pinsala kapag umaatake o gumagamit ng kakayahan; saka −1 patong sa dulo ng round.",
 "தாக்கும்போதும் திறன்களைப் பயன்படுத்தும்போதும் {n} சேதம்; பிறகு சுற்றின் முடிவில் −1 அடுக்கு.",
 "menerima {n} kerusakan saat menyerang atau memakai kemampuan; lalu −1 tumpukan di akhir ronde.",
 "攻击或使用技能时受到 {n} 点伤害；之后在回合结束时 −1 层。",
 "攻擊或使用技能時受到 {n} 點傷害；之後在回合結束時 −1 層。",
 "攻撃やスキル使用のたび {n} ダメージ。その後ラウンド終了時に −1。",
 "공격하거나 스킬을 쓸 때마다 피해 {n}. 그다음 라운드가 끝날 때 −1."],
"🩸 Bleeding: this card takes damage every time it attacks or uses a skill. At the end of each round the stack drops by 1, after it has bled; Cleanse removes it.": [
 "🩸 Saignement : cette carte subit des dégâts chaque fois qu'elle attaque ou utilise une compétence. À la fin de chaque manche, après avoir saigné, le cumul baisse de 1 ; Purger l'enlève.",
 "🩸 Blutung: Diese Karte nimmt jedes Mal Schaden, wenn sie angreift oder eine Fähigkeit nutzt. Am Ende jeder Runde, nachdem sie geblutet hat, sinkt der Stapel um 1; Reinigen entfernt sie.",
 "🩸 Sangrado: esta carta recibe daño cada vez que ataca o usa una habilidad. Al final de cada ronda, después de sangrar, la acumulación baja en 1; Limpiar lo quita.",
 "🩸 Sanguinamento: questa carta subisce danni ogni volta che attacca o usa un'abilità. Alla fine di ogni turno, dopo aver sanguinato, l'accumulo scende di 1; Purificare lo toglie.",
 "🩸 Sangramento: esta carta sofre dano sempre que ataca ou usa uma habilidade. No fim de cada ronda, depois de sangrar, a acumulação desce 1; Purificar remove-o.",
 "🩸 Dumudugo: napipinsala ang card na ito tuwing aatake o gagamit ng kakayahan. Sa dulo ng bawat round, pagkatapos nitong dumugo, bumababa nang 1 ang patong; inaalis ito ng Paglilinis.",
 "🩸 இரத்தக்கசிவு: இந்த அட்டை தாக்கும்போதும் திறனைப் பயன்படுத்தும்போதும் சேதம் அடையும். ஒவ்வொரு சுற்றின் முடிவிலும், கசிந்த பிறகு, அடுக்கு 1 குறையும்; தூய்மையாக்கல் நீக்கும்.",
 "🩸 Berdarah: kartu ini menerima kerusakan setiap kali menyerang atau memakai kemampuan. Di akhir setiap ronde, setelah berdarah, tumpukannya turun 1; Pembersihan menghapusnya.",
 "🩸 流血：这张卡每次攻击或使用技能都会受伤。每回合结束时，在流过血之后，层数减 1；净化可移除。",
 "🩸 流血：這張卡每次攻擊或使用技能都會受傷。每回合結束時，在流過血之後，層數減 1；淨化可移除。",
 "🩸 出血：このカードは攻撃やスキル使用のたびにダメージを受ける。各ラウンドの終了時、出血した後に重ねが1減る。浄化で消える。",
 "🩸 출혈: 이 카드는 공격하거나 스킬을 쓸 때마다 피해를 받습니다. 매 라운드가 끝날 때, 피를 흘린 뒤에 중첩이 1 줄어듭니다. 정화로 없앱니다."],
"Steps in front of an adjacent ally (beside it; in a raid, in front or behind) and takes the plain attacks aimed at it. Skills and area hits don't, and it never guards the bramble. A Guardian next to it steps in for it in turn. Taunt is different: it makes the enemies facing it aim at it.": [
 "S'interpose devant un allié adjacent (à côté ; en raid, devant ou derrière) et encaisse les attaques normales qui le visent. Pas les compétences ni les attaques de zone, et il ne protège jamais la ronce. Un Gardien à côté de lui s'interpose à son tour pour lui. La Provocation est différente : elle force les ennemis en face à la viser.",
 "Stellt sich vor einen angrenzenden Verbündeten (daneben; im Raid davor oder dahinter) und fängt die normalen Angriffe auf ihn ab. Fähigkeiten und Flächentreffer nicht, und den Dorn schützt er nie. Ein Wächter neben ihm springt seinerseits für ihn ein. Spott ist anders: Er zwingt die Gegner gegenüber, ihn anzugreifen.",
 "Se interpone ante un aliado adyacente (a su lado; en una incursión, delante o detrás) y recibe los ataques normales dirigidos a él. No las habilidades ni los golpes de área, y nunca protege la zarza. Un Guardián a su lado se interpone a su vez por él. Provocar es distinto: obliga a los enemigos de enfrente a apuntarle.",
 "Si mette davanti a un alleato adiacente (accanto; in un raid, davanti o dietro) e incassa gli attacchi normali diretti a lui. Non le abilità né i colpi ad area, e non protegge mai il rovo. Un Guardiano accanto a lui si mette a sua volta davanti a lui. Provocazione è diversa: costringe i nemici di fronte a mirare a lei.",
 "Põe-se à frente de um aliado adjacente (ao lado; numa incursão, à frente ou atrás) e recebe os ataques normais dirigidos a ele. Não as habilidades nem os golpes de área, e nunca protege a silva. Um Guardião ao lado dele põe-se, por sua vez, à frente dele. Provocar é diferente: obriga os inimigos à frente a visá-la.",
 "Humaharang sa harap ng katabing kakampi (sa tabi nito; sa raid, sa harap o likod) at sinasalo ang mga karaniwang atakeng nakatutok dito. Hindi ang mga kakayahan o atake sa lugar, at hindi nito kailanman binabantayan ang bramble. Ang Guardian na katabi nito ay haharang naman para rito. Iba ang Taunt: pinipilit nito ang mga kalabang nakaharap na ito ang atakehin.",
 "அருகிலுள்ள கூட்டாளியின் முன் வந்து (பக்கத்தில்; ரெய்டில் முன்னால் அல்லது பின்னால்) அதை நோக்கிய சாதாரணத் தாக்குதல்களைத் தான் ஏற்கிறது. திறன்களையும் பரப்புத் தாக்குதல்களையும் அல்ல, முட்புதரை ஒருபோதும் காக்காது. அதன் அருகிலுள்ள காவலன் அதற்காகத் தானும் முன் வரும். சீண்டல் வேறு: எதிரே உள்ள எதிரிகள் அதையே குறிவைக்கச் செய்கிறது.",
 "Melangkah ke depan sekutu yang bersebelahan (di sampingnya; dalam raid, di depan atau belakang) dan menerima serangan biasa yang ditujukan padanya. Bukan kemampuan atau serangan area, dan tidak pernah menjaga semak duri. Penjaga di sebelahnya gantian melangkah ke depannya. Ejekan berbeda: memaksa musuh di depannya untuk membidiknya.",
 "挡到相邻友军（左右两旁；团战中还有前后）身前，替它承受瞄准它的普通攻击。技能和范围攻击不会被挡下，也从不保护荆棘。旁边的另一个守护者会再替它挡下。嘲讽不同：它让对面的敌人改为瞄准自己。",
 "擋到相鄰友軍（左右兩旁；團戰中還有前後）身前，替它承受瞄準它的普通攻擊。技能和範圍攻擊不會被擋下，也從不保護荊棘。旁邊的另一個守護者會再替它擋下。嘲諷不同：它讓對面的敵人改為瞄準自己。",
 "隣の味方（左右。レイドでは前後も）の前に割って入り、その味方を狙った通常攻撃を代わりに受ける。スキルや範囲攻撃は受けず、砦は決して守らない。隣にいる別の守護者が、さらにこのユニットをかばう。挑発とは違う：挑発は正面の敵に自分を狙わせる。",
 "인접한 아군(양옆, 레이드에서는 앞뒤도) 앞을 막아서서 그 아군을 노린 일반 공격을 대신 받습니다. 스킬과 범위 공격은 막지 않고, 가시덤불은 절대 지키지 않습니다. 옆에 있는 다른 수호자가 다시 이 유닛을 대신 막아섭니다. 도발은 다릅니다: 마주한 적이 자신을 노리게 만듭니다."],
"Takes the plain attacks aimed at its adjacent allies (not the bramble).": [
 "Encaisse les attaques simples visant ses alliés adjacents (pas la ronce).",
 "Fängt normale Angriffe auf angrenzende Verbündete ab (nicht auf den Dorn).",
 "Recibe los ataques normales dirigidos a sus aliados adyacentes (no a la zarza).",
 "Incassa gli attacchi normali diretti agli alleati adiacenti (non al rovo).",
 "Recebe os ataques normais contra os aliados adjacentes (não contra a silva).",
 "Sinasalo ang mga karaniwang atake na nakatutok sa mga katabing kakampi nito (hindi sa bramble).",
 "அடுத்துள்ள கூட்டாளிகளை நோக்கிய சாதாரணத் தாக்குதல்களை ஏற்கும் (முட்புதரை நோக்கியவை அல்ல).",
 "Menerima serangan biasa yang diarahkan ke sekutu yang bersebelahan (bukan ke semak duri).",
 "替相邻的友方承受普通攻击（不包括荆棘）。",
 "替相鄰的友方承受普通攻擊（不包括荊棘）。",
 "隣接する味方を狙った通常攻撃を引き受ける（砦は対象外）。",
 "인접한 아군을 노린 일반 공격을 대신 받아요 (가시덤불은 제외)."],
}
assert all(len(v) == len(CODES) for v in T.values()), [k for k, v in T.items() if len(v) != len(CODES)]
# The four new cards (owner 20:44): name, flavour per language
CARDS = {
 'Dam-Keeper Beaver': ("Forty winters patching the dam. The bramble is just a dam that argues back.", [
  ("Castor gardien du barrage", "Quarante hivers à colmater le barrage. La ronce n'est qu'un barrage qui répond."),
  ("Dammwärter-Biber", "Vierzig Winter hat er den Damm geflickt. Der Dorn ist nur ein Damm, der widerspricht."),
  ("Castor guardapresas", "Cuarenta inviernos remendando la presa. La zarza es solo una presa que replica."),
  ("Castoro guardiano della diga", "Quaranta inverni a rattoppare la diga. Il rovo è solo una diga che risponde."),
  ("Castor guarda-represa", "Quarenta invernos a remendar a represa. A silva é só uma represa que responde."),
  ("Beaver na Bantay-Dike", "Apatnapung taglamig nang tinatagpian ang dike. Ang bramble ay dike lang na sumasagot."),
  ("அணைக்காவல் நீர்நாய்", "நாற்பது குளிர்காலம் அணையை ஒட்டியது. முட்புதர் எதிர்த்துப் பேசும் ஒரு அணை, அவ்வளவுதான்."),
  ("Berang-berang Penjaga Bendungan", "Empat puluh musim dingin menambal bendungan. Semak duri hanyalah bendungan yang suka membantah."),
  ("守坝河狸", "修补水坝四十个冬天。荆棘不过是一座会顶嘴的水坝。"),
  ("守壩河狸", "修補水壩四十個冬天。荊棘不過是一座會頂嘴的水壩。"),
  ("ダム番のビーバー", "四十の冬、ダムを繕ってきた。砦なんて、口答えするダムにすぎない。"),
  ("댐지기 비버", "마흔 번의 겨울 동안 댐을 고쳤다. 가시덤불은 말대꾸하는 댐일 뿐이다.")]),
 'Moat Snapper': ("It lives in the moat, sleeps in the moat, and bites whatever tries to cross the moat.", [
  ("Happeuse des douves", "Elle vit dans les douves, dort dans les douves et mord tout ce qui tente de traverser les douves."),
  ("Grabenschnapper", "Sie lebt im Graben, schläft im Graben und beißt alles, was über den Graben will."),
  ("Mordedora del foso", "Vive en el foso, duerme en el foso y muerde a quien intente cruzar el foso."),
  ("Azzannatrice del fossato", "Vive nel fossato, dorme nel fossato e morde chiunque provi ad attraversare il fossato."),
  ("Mordedora do fosso", "Vive no fosso, dorme no fosso e morde quem tentar atravessar o fosso."),
  ("Kagat-Kanal", "Sa kanal nakatira, sa kanal natutulog, at kinakagat ang sinumang tatawid sa kanal."),
  ("அகழிக் கடிஆமை", "அகழியில் வாழ்கிறது, அகழியில் உறங்குகிறது, அகழியைக் கடக்க முயலும் எதையும் கடிக்கிறது."),
  ("Penggigit Parit", "Tinggal di parit, tidur di parit, dan menggigit apa pun yang mencoba menyeberangi parit."),
  ("护城河鳄龟", "住在护城河，睡在护城河，谁想过护城河就咬谁。"),
  ("護城河鱷龜", "住在護城河，睡在護城河，誰想過護城河就咬誰。"),
  ("堀のカミツキガメ", "堀に住み、堀で眠り、堀を渡ろうとするものには噛みつく。"),
  ("해자 늑대거북", "해자에 살고, 해자에서 자고, 해자를 건너려는 건 뭐든 문다.")]),
 'Briarback Hedgehog': ("It curls up in the roots until nobody can tell which spines are whose.", [
  ("Hérisson dos-de-ronce", "Il se roule dans les racines jusqu'à ce que personne ne sache à qui sont les épines."),
  ("Dornrücken-Igel", "Er rollt sich in den Wurzeln ein, bis keiner mehr weiß, welche Stacheln wem gehören."),
  ("Erizo lomozarza", "Se enrosca entre las raíces hasta que nadie sabe de quién es cada púa."),
  ("Riccio dorsorovo", "Si acciambella tra le radici finché nessuno sa più di chi siano le spine."),
  ("Ouriço costas-de-silva", "Enrola-se nas raízes até ninguém saber de quem são os espinhos."),
  ("Hedgehog na Likod-Tinik", "Bumabaluktot ito sa mga ugat hanggang walang makaalam kung kanino ang mga tinik."),
  ("முட்முதுகு முள்ளம்பன்றி", "எந்த முள் யாருடையது என்று யாருக்கும் தெரியாதவரை வேர்களுக்குள் சுருண்டு கொள்கிறது."),
  ("Landak Punggung Duri", "Ia meringkuk di antara akar sampai tak ada yang tahu duri mana milik siapa."),
  ("荆背刺猬", "它蜷在根须间，直到没人分得清哪根刺是谁的。"),
  ("荊背刺蝟", "牠蜷在根鬚間，直到沒人分得清哪根刺是誰的。"),
  ("イバラ背のハリネズミ", "根のあいだに丸まって、どのトゲが誰のものか誰にもわからなくなる。"),
  ("가시등 고슴도치", "뿌리 사이에 몸을 말고 있으면, 어느 가시가 누구 건지 아무도 모른다.")]),
 'Barkplate Beetle': ("It chews bark into plates and glues them to the bramble. Nobody asked. Nobody minds.", [
  ("Scarabée plaque-écorce", "Il mâche l'écorce en plaques et les colle sur la ronce. Personne n'a demandé. Personne ne s'en plaint."),
  ("Rindenplatten-Käfer", "Er kaut Rinde zu Platten und klebt sie an den Dorn. Keiner hat gefragt. Keinen stört's."),
  ("Escarabajo placacorteza", "Mastica corteza en placas y las pega a la zarza. Nadie lo pidió. A nadie le importa."),
  ("Scarabeo piastra di corteccia", "Mastica la corteccia in piastre e le incolla al rovo. Nessuno l'ha chiesto. A nessuno dispiace."),
  ("Escaravelho placa-de-casca", "Mastiga casca em placas e cola-as à silva. Ninguém pediu. Ninguém se importa."),
  ("Salagubang na Balat-Kahoy", "Ngumunguya ito ng balat ng kahoy para gawing plaka at idinidikit sa bramble. Walang humiling. Walang nagrereklamo."),
  ("பட்டைத்தகடு வண்டு", "பட்டையை மென்று தகடுகளாக்கி முட்புதரில் ஒட்டுகிறது. யாரும் கேட்கவில்லை. யாரும் கவலைப்படவில்லை."),
  ("Kumbang Pelat Kulit Kayu", "Ia mengunyah kulit kayu jadi pelat dan menempelkannya ke semak duri. Tak ada yang minta. Tak ada yang keberatan."),
  ("树皮甲虫", "它把树皮嚼成甲片，粘到荆棘上。没人要求，也没人介意。"),
  ("樹皮甲蟲", "牠把樹皮嚼成甲片，黏到荊棘上。沒人要求，也沒人介意。"),
  ("樹皮よろいの甲虫", "樹皮をかんで板にして、砦に貼りつける。誰も頼んでいない。誰も気にしない。"),
  ("나무껍질 갑판벌레", "나무껍질을 씹어 판으로 만들어 가시덤불에 붙인다. 아무도 부탁 안 했다. 아무도 상관 안 한다.")]),
}
assert all(len(v[1]) == len(CODES) for v in CARDS.values())
# A leading emoji is peeled before the page translator looks a log or float up (i18n-templates): those rows go in peeled.
EMOJI_LEAD = re.compile(r'^[^\w{(\[]+\s')
PEEL = ["🚧 {name} takes {n} of the hit on its bramble; the bramble takes {b}.", "🌿🛡️ {name}'s Bramble Armor takes 1 off the hit on its bramble.",
        "🪃 {name} misses, but throws its boomerang anyway.", "🦺 Covered!", "🪃 Thrown!"]
ph = lambda s: sorted(set(re.findall(r'\{\w+\}', s)))
assert all(ph(k) == ph(t) for k, v in T.items() for t in v), [(k, t) for k, v in T.items() for t in v if ph(k) != ph(t)]
def dump(path, d):
    with open(path, 'w', encoding='utf-8') as fh:
        json.dump(d, fh, ensure_ascii=False, indent=1); fh.write('\n')
for i, code in enumerate(CODES):
    path = os.path.join(ROOT, 'lang', code + '.json'); ui = os.path.join(ROOT, 'lang', 'ui', code + '.json')
    pack = json.load(open(path, encoding='utf-8')); uipack = json.load(open(ui, encoding='utf-8'))
    for old in DEAD: pack.pop(old, None); uipack.pop(old, None)
    for en, row in T.items(): uipack.pop(en, None); pack[en] = row[i]
    for en in PEEL: pack.pop(en, None); pack[EMOJI_LEAD.sub('', en)] = EMOJI_LEAD.sub('', T[en][i])
    for nm, (fl, rows) in CARDS.items(): uipack[fl] = rows[i][1]
    dump(path, pack); dump(ui, uipack)
    cp = os.path.join(ROOT, 'lang', 'cards', code + '.json'); cn = json.load(open(cp, encoding='utf-8'))
    for nm, (fl, rows) in CARDS.items(): cn[nm] = rows[i][0]
    dump(cp, cn)
print('wrote', len(CODES), 'packs,', len(T), 'strings each, and', len(CARDS), 'card names and flavours')
