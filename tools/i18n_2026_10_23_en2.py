#!/usr/bin/env python3
"""Game texts added or changed on 2026-10-23 by package EN2 (owner 13:16 #9, #17, #22; 17:34 #15): Boomerang's bramble throw, Guardian's step-in
and its reach against Taunt, the wind (Tailwind is Quick, Headwind doubles active skills), the Ironclaw Fiddler's clack and its name and flavour.
Same rules as tools/i18n_2026_10_23_en.py: keys are the English as the page translator sees it, every {placeholder} is kept; the replaced English
rows are dropped. Tagalog, Tamil, Japanese and Korean deserve a native read. (Kept in the package's scratchpad: tools/ is outside EN2's files.)"""
import json, os, re
ROOT = '/home/claude/bramblewood-arena-game/.claude/worktrees/agent-a181577ede1dc5410'
CODES = ['fr', 'de', 'es', 'it', 'pt', 'tl', 'ta', 'id', 'zh-Hans', 'zh-Hant', 'ja', 'ko']
DEAD = [
 'The wind turns each round (back, face or calm). Tailwind Flyers are Quick; Headwind Flyers use their active skills (Arrow, Bolts, Snipe) twice.', 'Strong wind every round, back or face. Tailwind Flyers are Quick; Headwind Flyers use their active skills (Arrow, Bolts, Snipe) twice.',
 "Throws on attack. Next round it flies back fast and hits the same target again. Never misses Flying units. Don't fail to catch it!",
 "Plain attacks aimed at an adjacent ally land on this card instead. Skills and area hits don't.",
 "The wind turns each round (back, face or calm). Tailwind Flyers act first; Headwind Flyers trigger and shoot twice.",
 "Strong wind every round, back or face. Tailwind Flyers act first; Headwind Flyers trigger and shoot twice.",
 "Flying – Tailwind: a quick extra turn before combat", "Flying – Headwind: its skills and triggers go off twice", "Tailwind: a quick extra turn before combat",
 "Strong wind from side {v1}: Tailwind for its Flyers (an extra turn), Headwind for the other side's (skills twice).",
]
T = {
"Throws on attack. Next round it flies back fast and hits the same target again; a throw at the bramble flies on, and on its way back hits the bramble and then the unit in its lane. Never misses Flying units. Don't fail to catch it!": [
 "Lance en attaquant. Au tour suivant, il revient vite et frappe de nouveau la même cible ; lancé sur la ronce, il file plus loin et, au retour, frappe la ronce puis l'unité de son couloir. Ne rate jamais les unités volantes. Ne le laisse pas t'échapper !",
 "Wirft beim Angriff. In der nächsten Runde fliegt er schnell zurück und trifft dasselbe Ziel erneut; ein Wurf auf das Dornengestrüpp fliegt weiter und trifft auf dem Rückweg das Gestrüpp und dann die Einheit in seiner Bahn. Verfehlt nie fliegende Einheiten. Fang ihn wieder!",
 "Lanza al atacar. En la siguiente ronda vuelve rápido y golpea de nuevo al mismo objetivo; lanzado a la zarza, sigue de largo y al volver golpea la zarza y luego a la unidad de su carril. Nunca falla a las unidades voladoras. ¡No dejes de atraparlo!",
 "Lancia quando attacca. Il turno dopo torna veloce e colpisce di nuovo lo stesso bersaglio; lanciato sul rovo, prosegue e al ritorno colpisce il rovo e poi l'unità nella sua corsia. Non manca mai le unità volanti. Non dimenticare di riprenderlo!",
 "Lança ao atacar. Na ronda seguinte volta depressa e atinge de novo o mesmo alvo; lançado à silva, segue em frente e, ao voltar, atinge a silva e depois a unidade na sua faixa. Nunca falha unidades voadoras. Não te esqueças de o apanhar!",
 "Ibinabato kapag umaatake. Sa susunod na round, mabilis itong bumabalik at tinatamaan ulit ang parehong target; kapag sa bramble ibinato, lumalampas ito, at pagbalik ay tinatamaan ang bramble at saka ang unit sa linya nito. Hindi kailanman sumasablay sa mga lumilipad. Huwag kalimutang saluhin!",
 "தாக்கும்போது எறிகிறது. அடுத்த சுற்றில் வேகமாகத் திரும்பி அதே இலக்கை மீண்டும் தாக்கும்; முட்புதரை நோக்கி எறிந்தால் அது கடந்து பறந்து, திரும்பும் வழியில் முட்புதரையும் பின் தன் பாதையிலுள்ள அலகையும் தாக்கும். பறக்கும் அலகுகளைத் தவறவிடாது. பிடிக்கத் தவறாதீர்கள்!",
 "Dilempar saat menyerang. Ronde berikutnya ia kembali dengan cepat dan mengenai target yang sama lagi; lemparan ke semak duri terus melaju, dan saat kembali mengenai semak duri lalu unit di jalurnya. Tak pernah meleset dari unit terbang. Jangan lupa menangkapnya!",
 "攻击时掷出。下一回合它会飞快地回来，再次击中同一个目标；掷向荆棘堡的会继续飞过去，回程时先击中荆棘堡，再击中它那一列的单位。从不会打不中飞行单位。别忘了接住它！",
 "攻擊時擲出。下一回合它會飛快地回來，再次擊中同一個目標；擲向荊棘堡的會繼續飛過去，回程時先擊中荊棘堡，再擊中它那一列的單位。從不會打不中飛行單位。別忘了接住它！",
 "攻撃時に投げる。次のラウンドに素早く戻り、同じ相手にもう一度当たる。いばらの砦に投げたものはそのまま飛び抜け、戻り道で砦に、続いてその列のユニットに当たる。飛行ユニットには必ず当たる。受け止め損ねないで！",
 "공격할 때 던집니다. 다음 라운드에 빠르게 돌아와 같은 대상을 다시 맞힙니다. 가시덤불을 향해 던지면 그대로 날아갔다가 돌아오는 길에 가시덤불을, 이어서 그 줄의 유닛을 맞힙니다. 비행 유닛을 절대 놓치지 않습니다. 꼭 받아내세요!"],
"Steps in front of an adjacent ally (beside it; in a raid, in front or behind) and takes the plain attacks aimed at it. Skills and area hits don't. Taunt is different: it makes the enemies facing it aim at it.": [
 "S'interpose devant un allié adjacent (à côté ; en raid, devant ou derrière) et encaisse les attaques normales qui le visent. Pas les compétences ni les attaques de zone. La Provocation est différente : elle force les ennemis en face à la viser.",
 "Stellt sich vor einen angrenzenden Verbündeten (daneben; im Raid davor oder dahinter) und fängt die normalen Angriffe auf ihn ab. Fähigkeiten und Flächentreffer nicht. Spott ist anders: Er zwingt die Gegner gegenüber, ihn anzugreifen.",
 "Se interpone ante un aliado adyacente (a su lado; en una incursión, delante o detrás) y recibe los ataques normales dirigidos a él. No las habilidades ni los golpes de área. Provocar es distinto: obliga a los enemigos de enfrente a apuntarle.",
 "Si mette davanti a un alleato adiacente (accanto; in un raid, davanti o dietro) e incassa gli attacchi normali diretti a lui. Non le abilità né i colpi ad area. Provocazione è diversa: costringe i nemici di fronte a mirare a lei.",
 "Põe-se à frente de um aliado adjacente (ao lado; numa incursão, à frente ou atrás) e recebe os ataques normais dirigidos a ele. Não as habilidades nem os golpes de área. Provocar é diferente: obriga os inimigos à frente a visá-la.",
 "Humaharang sa harap ng katabing kakampi (sa tabi nito; sa raid, sa harap o likod) at sinasalo ang mga karaniwang atakeng nakatutok dito. Hindi ang mga kakayahan o atake sa lugar. Iba ang Taunt: pinipilit nito ang mga kalabang nakaharap na ito ang atakehin.",
 "அருகிலுள்ள கூட்டாளியின் முன் வந்து (பக்கத்தில்; ரெய்டில் முன்னால் அல்லது பின்னால்) அதை நோக்கிய சாதாரணத் தாக்குதல்களைத் தான் ஏற்கிறது. திறன்களையும் பரப்புத் தாக்குதல்களையும் அல்ல. சீண்டல் வேறு: எதிரே உள்ள எதிரிகள் அதையே குறிவைக்கச் செய்கிறது.",
 "Melangkah ke depan sekutu yang bersebelahan (di sampingnya; dalam raid, di depan atau belakang) dan menerima serangan biasa yang ditujukan padanya. Bukan kemampuan atau serangan area. Ejekan berbeda: memaksa musuh di depannya untuk membidiknya.",
 "挡到相邻友军（左右两旁；团战中还有前后）身前，替它承受瞄准它的普通攻击。技能和范围攻击不会被挡下。嘲讽不同：它让对面的敌人改为瞄准自己。",
 "擋到相鄰友軍（左右兩旁；團戰中還有前後）身前，替它承受瞄準它的普通攻擊。技能和範圍攻擊不會被擋下。嘲諷不同：它讓對面的敵人改為瞄準自己。",
 "隣の味方（左右。レイドでは前後も）の前に割って入り、その味方を狙った通常攻撃を代わりに受ける。スキルや範囲攻撃は受けない。挑発とは違う：挑発は正面の敵に自分を狙わせる。",
 "인접한 아군(양옆, 레이드에서는 앞뒤도) 앞을 막아서서 그 아군을 노린 일반 공격을 대신 받습니다. 스킬과 범위 공격은 막지 않습니다. 도발은 다릅니다: 마주한 적이 자신을 노리게 만듭니다."],
"Wind turns each round (back, face, calm): Tailwind Flyers are Quick, Headwind Flyers' shots and Snipe go twice.": ["Le vent tourne à chaque manche (dos, face, calme) : volants au vent arrière Rapides, tirs et Tir précis au vent de face deux fois.", "Der Wind dreht jede Runde (Rücken, Gesicht, still): Rückenwind-Flieger sind Flink, Schüsse und Scharfschuss bei Gegenwind zweimal.", "El viento cambia cada ronda (a favor, en contra, calma): voladores con viento a favor Rápidos; disparos y Francotirador en contra, dos veces.", "Il vento cambia ogni turno (spalle, faccia, calma): volanti col vento a favore Rapidi, tiri e Cecchino col vento contrario due volte.", "O vento muda a cada ronda (costas, frente, calmo): voadores com vento a favor Rápidos, tiros e Atirador com vento contra duas vezes.", "Nag-iiba ang hangin bawat round (likod, harap, kalmado): Mabilis ang may Tailwind, dalawang beses ang tira at Snipe ng may Headwind.", "ஒவ்வொரு சுற்றிலும் காற்று மாறும் (பின், முன், அமைதி): பின்காற்றில் பறப்பவை விரைவு, எதிர்காற்றில் அம்புகளும் குறிசுடலும் இருமுறை.", "Angin berubah tiap ronde (belakang, depan, tenang): penerbang berangin buritan Cepat, tembakan dan Penembak Jitu berangin haluan dua kali.", "每回合风向都会变（顺风、逆风、无风）：顺风的飞行单位迅捷，逆风的射击和狙击发动两次。", "每回合風向都會變（順風、逆風、無風）：順風的飛行單位迅捷，逆風的射擊和狙擊發動兩次。", "風は毎ラウンド変わる（追い風・向かい風・無風）：追い風の飛行ユニットは俊足、向かい風の射撃と狙撃は2回。", "바람은 매 라운드 바뀝니다(순풍, 역풍, 무풍): 순풍 비행 유닛은 신속, 역풍의 사격과 저격은 두 번."],
"Strong wind every round, back or face: Tailwind Flyers are Quick, Headwind Flyers' shots and Snipe go twice.": ["Vent fort à chaque manche, dans le dos ou de face : volants au vent arrière Rapides, tirs et Tir précis au vent de face deux fois.", "Starker Wind jede Runde, Rücken oder Gesicht: Rückenwind-Flieger sind Flink, Schüsse und Scharfschuss bei Gegenwind zweimal.", "Viento fuerte cada ronda, a favor o en contra: voladores con viento a favor Rápidos; disparos y Francotirador en contra, dos veces.", "Vento forte ogni turno, alle spalle o in faccia: volanti col vento a favore Rapidi, tiri e Cecchino col vento contrario due volte.", "Vento forte em cada ronda, pelas costas ou de frente: voadores com vento a favor Rápidos, tiros e Atirador com vento contra duas vezes.", "Malakas na hangin bawat round, sa likod o harap: Mabilis ang may Tailwind, dalawang beses ang tira at Snipe ng may Headwind.", "ஒவ்வொரு சுற்றிலும் பலத்த காற்று, பின்னால் அல்லது முன்னால்: பின்காற்றில் பறப்பவை விரைவு, எதிர்காற்றில் அம்புகளும் குறிசுடலும் இருமுறை.", "Angin kencang tiap ronde, dari belakang atau depan: penerbang berangin buritan Cepat, tembakan dan Penembak Jitu berangin haluan dua kali.", "每回合都有强风，顺风或逆风：顺风的飞行单位迅捷，逆风的射击和狙击发动两次。", "每回合都有強風，順風或逆風：順風的飛行單位迅捷，逆風的射擊和狙擊發動兩次。", "毎ラウンド強風、追い風か向かい風：追い風の飛行ユニットは俊足、向かい風の射撃と狙撃は2回。", "매 라운드 강풍, 순풍 또는 역풍: 순풍 비행 유닛은 신속, 역풍의 사격과 저격은 두 번."],
"Flying – Tailwind: Quick this round (swings at Speed 2; a Waiting unit still waits)": [
 "Vol – Vent arrière : Rapide cette manche (frappe à la Vitesse 2 ; une unité en attente attend toujours)",
 "Fliegend – Rückenwind: diese Runde Flink (schlägt mit Tempo 2; eine wartende Einheit wartet weiter)",
 "Vuelo – Viento a favor: Rápido esta ronda (golpea a Velocidad 2; una unidad en espera sigue esperando)",
 "Volo – Vento a favore: Rapido in questo turno (colpisce a Velocità 2; un'unità in attesa aspetta ancora)",
 "Voo – Vento a favor: Rápido nesta ronda (ataca à Velocidade 2; uma unidade em espera continua à espera)",
 "Lumilipad – Tailwind: Mabilis ngayong round (umaatake sa Bilis 2; naghihintay pa rin ang unit na naghihintay)",
 "பறத்தல் – பின்காற்று: இந்தச் சுற்றில் விரைவு (வேகம் 2-இல் தாக்கும்; காத்திருக்கும் அலகு இன்னும் காத்திருக்கும்)",
 "Terbang – Angin buritan: Cepat ronde ini (menyerang di Kecepatan 2; unit yang menunggu tetap menunggu)",
 "飞行 – 顺风：本回合迅捷（以速度 2 出手；等待中的单位仍要等待）",
 "飛行 – 順風：本回合迅捷（以速度 2 出手；等待中的單位仍要等待）",
 "飛行 – 追い風：このラウンドは俊足（速度2で攻撃。待機中のユニットは待ったまま）",
 "비행 – 순풍: 이번 라운드 신속 (속도 2로 공격, 대기 중인 유닛은 계속 대기)"],
"Flying – Headwind: its active skills (Arrow, Bolts, Snipe) go off twice; its swing and passives once": [
 "Vol – Vent de face : ses compétences actives (Flèche, Éclairs, Tir précis) se déclenchent deux fois ; son attaque et ses passifs une fois",
 "Fliegend – Gegenwind: seine aktiven Fähigkeiten (Pfeil, Blitze, Scharfschuss) wirken zweimal; sein Angriff und seine Passiven einmal",
 "Vuelo – Viento en contra: sus habilidades activas (Flecha, Rayos, Francotirador) se activan dos veces; su ataque y sus pasivas, una",
 "Volo – Vento contrario: le sue abilità attive (Freccia, Dardi, Cecchino) scattano due volte; l'attacco e le passive una volta",
 "Voo – Vento contra: as habilidades ativas (Flecha, Raios, Atirador) disparam duas vezes; o ataque e as passivas uma vez",
 "Lumilipad – Headwind: dalawang beses gumagana ang aktibong kakayahan nito (Arrow, Bolts, Snipe); isang beses ang atake at mga passive",
 "பறத்தல் – எதிர்காற்று: அதன் செயல் திறன்கள் (அம்பு, மின்னல், குறிசுடல்) இருமுறை; அதன் தாக்குதலும் நிலைத் திறன்களும் ஒருமுறை",
 "Terbang – Angin haluan: kemampuan aktifnya (Panah, Petir, Penembak Jitu) aktif dua kali; serangan dan pasifnya sekali",
 "飞行 – 逆风：主动技能（箭、雷击、狙击）发动两次；攻击和被动技能只一次",
 "飛行 – 逆風：主動技能（箭、雷擊、狙擊）發動兩次；攻擊和被動技能只一次",
 "飛行 – 向かい風：アクティブスキル（矢・ボルト・狙撃）が2回発動。攻撃とパッシブは1回",
 "비행 – 역풍: 액티브 스킬(화살, 볼트, 저격)이 두 번 발동, 공격과 패시브는 한 번"],
"Tailwind: Quick this round (swings at Speed 2)": [
 "Vent arrière : Rapide cette manche (frappe à la Vitesse 2)", "Rückenwind: diese Runde Flink (schlägt mit Tempo 2)", "Viento a favor: Rápido esta ronda (golpea a Velocidad 2)",
 "Vento a favore: Rapido in questo turno (colpisce a Velocità 2)", "Vento a favor: Rápido nesta ronda (ataca à Velocidade 2)", "Tailwind: Mabilis ngayong round (umaatake sa Bilis 2)",
 "பின்காற்று: இந்தச் சுற்றில் விரைவு (வேகம் 2-இல் தாக்கும்)", "Angin buritan: Cepat ronde ini (menyerang di Kecepatan 2)", "顺风：本回合迅捷（以速度 2 出手）", "順風：本回合迅捷（以速度 2 出手）",
 "追い風：このラウンドは俊足（速度2で攻撃）", "순풍: 이번 라운드 신속 (속도 2로 공격)"],
"Strong wind from side {v1}: Tailwind for its Flyers (Quick), Headwind for the other side's (active skills twice).": [
 "Vent fort du côté {v1} : vent arrière pour ses volants (Rapides), vent de face pour ceux d'en face (compétences actives deux fois).",
 "Starker Wind von Seite {v1}: Rückenwind für ihre Flieger (Flink), Gegenwind für die der anderen Seite (aktive Fähigkeiten zweimal).",
 "Viento fuerte desde el lado {v1}: viento a favor para sus voladores (Rápidos), en contra para los del otro lado (habilidades activas dos veces).",
 "Vento forte dal lato {v1}: vento a favore per i suoi volanti (Rapidi), contrario per quelli dell'altro lato (abilità attive due volte).",
 "Vento forte do lado {v1}: vento a favor para os seus voadores (Rápidos), contra para os do outro lado (habilidades ativas duas vezes).",
 "Malakas na hangin mula sa panig {v1}: Tailwind sa mga lumilipad nito (Mabilis), Headwind sa kabilang panig (aktibong kakayahan nang dalawang beses).",
 "பக்கம் {v1}-இலிருந்து பலத்த காற்று: அதன் பறப்பவைக்குப் பின்காற்று (விரைவு), மறுபக்கத்தவைக்கு எதிர்காற்று (செயல் திறன்கள் இருமுறை).",
 "Angin kencang dari sisi {v1}: angin buritan bagi penerbangnya (Cepat), angin haluan bagi milik sisi lain (kemampuan aktif dua kali).",
 "强风来自 {v1} 方：其飞行单位顺风（迅捷），对方的逆风（主动技能两次）。", "強風來自 {v1} 方：其飛行單位順風（迅捷），對方的逆風（主動技能兩次）。",
 "{v1}側から強風：その飛行ユニットは追い風（俊足）、相手側は向かい風（アクティブスキル2回）。", "{v1} 쪽에서 강풍: 그쪽 비행 유닛은 순풍(신속), 반대쪽은 역풍(액티브 스킬 두 번)."],
"caught the Tailwind: Quick this round 🪁": [
 "a pris le vent arrière : Rapide cette manche 🪁", "erwischte den Rückenwind: diese Runde Flink 🪁", "atrapó el viento a favor: Rápido esta ronda 🪁", "ha preso il vento a favore: Rapido in questo turno 🪁",
 "apanhou o vento a favor: Rápido nesta ronda 🪁", "sinakyan ang Tailwind: Mabilis ngayong round 🪁", "பின்காற்றைப் பிடித்தது: இந்தச் சுற்றில் விரைவு 🪁", "menangkap angin buritan: Cepat ronde ini 🪁",
 "乘上了顺风：本回合迅捷 🪁", "乘上了順風：本回合迅捷 🪁", "追い風に乗った：このラウンドは俊足 🪁", "순풍을 탔다: 이번 라운드 신속 🪁"],
"Tailwind: Quick!": ["Vent arrière : Rapide !", "Rückenwind: Flink!", "¡Viento a favor: Rápido!", "Vento a favore: Rapido!", "Vento a favor: Rápido!", "Tailwind: Mabilis!",
 "பின்காற்று: விரைவு!", "Angin buritan: Cepat!", "顺风：迅捷！", "順風：迅捷！", "追い風：俊足！", "순풍: 신속!"],
"Clack!": ["Clac !", "Klack!", "¡Clac!", "Clac!", "Clac!", "Klak!", "கிளாக்!", "Klak!", "咔嚓！", "咔嚓！", "カチン！", "딸깍!"],
}
CARD_NAME = "Ironclaw Fiddler"
CARD_FLAVOUR = "One claw for waving, one for winning. This one only grew the second."
CARD = {
 'fr': ("Violoneux à pince de fer", "Une pince pour saluer, une pour gagner. Celui-ci n'a fait pousser que la seconde."),
 'de': ("Eisenscheren-Winkerkrabbe", "Eine Schere zum Winken, eine zum Siegen. Diese hier ließ nur die zweite wachsen."),
 'es': ("Violinista de pinza férrea", "Una pinza para saludar, otra para ganar. Este solo dejó crecer la segunda."),
 'it': ("Granchio violinista dalla chela di ferro", "Una chela per salutare, una per vincere. Questo ha fatto crescere solo la seconda."),
 'pt': ("Violinista de pinça férrea", "Uma pinça para acenar, outra para vencer. Este só deixou crescer a segunda."),
 'tl': ("Bakal-Sipit na Fiddler", "Isang sipit para kumaway, isa para manalo. Ang pangalawa lang ang pinalaki nito."),
 'ta': ("இரும்புக் கொடுக்கு நண்டு", "ஒரு கொடுக்கு கையசைக்க, ஒன்று வெல்ல. இது இரண்டாவதை மட்டுமே வளர்த்தது."),
 'id': ("Kepiting Biola Capit Besi", "Satu capit untuk melambai, satu untuk menang. Yang ini hanya menumbuhkan yang kedua."),
 'zh-Hans': ("铁钳招潮蟹", "一只钳子用来挥手，一只用来取胜。这只只长了第二只。"),
 'zh-Hant': ("鐵鉗招潮蟹", "一隻鉗子用來揮手，一隻用來取勝。這隻只長了第二隻。"),
 'ja': ("アイアンクロー・シオマネキ", "片方のはさみは手を振るため、もう片方は勝つため。こいつは二つ目しか育てなかった。"),
 'ko': ("강철집게 농게", "한 집게는 손 흔들기용, 한 집게는 이기기용. 이 녀석은 두 번째만 키웠다."),
}
assert all(len(v) == len(CODES) for v in T.values()), [k for k, v in T.items() if len(v) != len(CODES)]
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
    uipack[CARD_FLAVOUR] = CARD[code][1]
    dump(path, pack); dump(ui, uipack)
    cp = os.path.join(ROOT, 'lang', 'cards', code + '.json'); cards = json.load(open(cp, encoding='utf-8')); cards[CARD_NAME] = CARD[code][0]; dump(cp, cards)
print('wrote', len(CODES), 'packs,', len(T), 'strings each; the Ironclaw Fiddler name and flavour')
