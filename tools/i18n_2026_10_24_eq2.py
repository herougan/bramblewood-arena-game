#!/usr/bin/env python3
"""Game texts added on 2026-10-24 by package EQ2 (equipment durability, Dive, Bolster and the Health bar, Parasite, the Goliath's Beak Strike):
the skill names and texts, the durability lines, the log lines and tooltips (keys as the packs keep them: the English text without its
leading emoji), the three new card names (lang/cards) and their flavour lines (lang/ui, where the card flavours live).
The skill words follow each pack's own names (Guardian, Taunt, Corrode, Flying, Wait, Structure, bramble ...). A row a pack already has
is left as it is. Tagalog, Tamil, Japanese and Korean deserve a native read.
  python3 tools/i18n_2026_10_24_eq2.py"""
import json, os, re
ROOT = os.path.join(os.path.dirname(os.path.abspath(__file__)), '..')
CODES = ['fr', 'de', 'es', 'it', 'pt', 'tl', 'ta', 'id', 'zh-Hans', 'zh-Hant', 'ja', 'ko']
T = {
"Dive": ["Piqué", "Sturzflug", "Picado", "Picchiata", "Mergulho", "Sisid", "பாய்ச்சல்", "Menukik", "俯冲", "俯衝", "急降下", "급강하"],
"Once a fight: dives on the weakest enemy in its row for {n} more. A diving Flyer can't dodge.": [
 "Une fois par combat : pique sur l’ennemi le plus faible de sa rangée, +{n} dégâts. Un volant en piqué ne peut pas esquiver.",
 "Einmal pro Kampf: stürzt sich auf den schwächsten Gegner seiner Reihe, {n} mehr Schaden. Ein Flieger im Sturzflug weicht nicht aus.",
 "Una vez por combate: se lanza en picado sobre el enemigo más débil de su fila, {n} más. Un volador en picado no esquiva.",
 "Una volta per scontro: si getta in picchiata sul nemico più debole della sua fila, {n} in più. Un volante in picchiata non schiva.",
 "Uma vez por combate: mergulha no inimigo mais fraco da sua fileira, {n} a mais. Um voador em mergulho não se esquiva.",
 "Minsan bawat laban: sumisisid sa pinakamahinang kalaban sa hanay nito, {n} pa. Hindi makaiwas ang lumilipad na sumisisid.",
 "ஒரு போரில் ஒருமுறை: தன் வரிசையின் மிகப் பலவீனமான எதிரி மீது பாய்ந்து {n} கூடுதல் சேதம். பாயும் பறவை தப்ப முடியாது.",
 "Sekali per pertarungan: menukik ke musuh terlemah di barisnya, {n} lebih. Penerbang yang menukik tak bisa menghindar.",
 "每场战斗一次：俯冲攻击本排最弱的敌人，多造成{n}点伤害。俯冲中的飞行单位无法闪避。",
 "每場戰鬥一次：俯衝攻擊本排最弱的敵人，多造成{n}點傷害。俯衝中的飛行單位無法閃避。",
 "1戦闘に1回：自分の列で最も弱い敵に急降下し、{n}追加ダメージ。急降下中の飛行ユニットは回避できない。",
 "전투당 한 번: 자기 줄에서 가장 약한 적에게 급강하해 {n} 추가 피해. 급강하 중인 비행 유닛은 회피할 수 없어요."],
"Only a Flyer, a Tide unit or a Sprinter can have it. The dive picks the unit with the least Health (the nearest one on a tie), past any Taunt; a Guardian beside it still steps in. A diving Flyer loses its dodge for the rest of that round.": [
 "Seuls un volant, une unité de Marée ou un Sprinteur peuvent l’avoir. Le piqué vise l’unité qui a le moins de Santé (la plus proche en cas d’égalité), malgré toute Provocation ; un Gardien voisin s’interpose quand même. Un volant en piqué perd son esquive jusqu’à la fin de la manche.",
 "Nur ein Flieger, eine Gezeiten-Einheit oder ein Sprinter kann ihn haben. Der Sturzflug trifft die Einheit mit dem wenigsten Leben (bei Gleichstand die nächste), trotz Spott; ein Wächter daneben springt trotzdem ein. Ein Flieger im Sturzflug verliert für den Rest der Runde sein Ausweichen.",
 "Solo un volador, una unidad de Marea o un Velocista pueden tenerlo. El picado elige la unidad con menos Salud (la más cercana si empatan), pase lo que pase con Provocar; un Guardián al lado aún se interpone. Un volador en picado pierde su esquiva el resto de la ronda.",
 "Solo un volante, un’unità di Marea o uno Scattista possono averla. La picchiata sceglie l’unità con meno Salute (la più vicina in caso di parità), ignorando la Provocazione; un Guardiano accanto si mette comunque in mezzo. Un volante in picchiata perde la schivata per il resto del round.",
 "Só um voador, uma unidade de Maré ou um Velocista pode tê-lo. O mergulho escolhe a unidade com menos Vida (a mais próxima no empate), passando por qualquer Provocação; um Guardião ao lado ainda se interpõe. Um voador em mergulho perde a esquiva pelo resto da rodada.",
 "Lumilipad, yunit ng Alon o Sprinter lang ang puwedeng magkaroon nito. Pinipili ng sisid ang yunit na may pinakakaunting Buhay (ang pinakamalapit kapag tabla), lampas sa anumang Taunt; papagitna pa rin ang katabing Guardian. Nawawala ang iwas ng lumilipad na sumisisid hanggang matapos ang round.",
 "பறப்பவை, அலை அலகு அல்லது ஓட்டக்காரர் மட்டுமே இதைப் பெற முடியும். குறைந்த உயிர் கொண்ட அலகை (சமமானால் அருகிலுள்ளதை) தூண்டலையும் தாண்டித் தேர்ந்தெடுக்கும்; பக்கத்திலுள்ள காவலர் இன்னும் இடையில் வருவார். பாயும் பறவை அந்தச் சுற்று முழுவதும் தப்பும் திறனை இழக்கும்.",
 "Hanya penerbang, unit Pasang, atau Pelari yang bisa memilikinya. Tukikan memilih unit dengan Nyawa paling sedikit (yang terdekat bila seri), melewati Ejekan apa pun; Penjaga di sebelahnya tetap menghadang. Penerbang yang menukik kehilangan hindarannya sampai akhir ronde.",
 "只有飞行单位、潮汐单位或疾跑者能拥有。俯冲会选择生命最少的单位（相同时取最近的），无视嘲讽；旁边的守护者仍会挺身而出。俯冲中的飞行单位在本回合剩余时间内失去闪避。",
 "只有飛行單位、潮汐單位或疾跑者能擁有。俯衝會選擇生命最少的單位（相同時取最近的），無視嘲諷；旁邊的守護者仍會挺身而出。俯衝中的飛行單位在本回合剩餘時間內失去閃避。",
 "飛行・潮・スプリンターのユニットだけが持てる。急降下は体力が最も少ないユニット（同じなら最も近いもの）を挑発に関係なく狙う。隣の守護者はそれでも割って入る。急降下した飛行ユニットはそのラウンドの残り、回避できない。",
 "비행, 조수, 스프린터 유닛만 가질 수 있어요. 급강하는 체력이 가장 적은 유닛(같으면 가장 가까운 유닛)을 도발과 상관없이 노려요. 옆의 수호자는 그래도 막아서요. 급강하한 비행 유닛은 그 라운드가 끝날 때까지 회피하지 못해요."],
"Bolster": ["Renfort", "Bollwerk", "Refuerzo", "Rinforzo", "Reforço", "Pagpapatibay", "வலுவூட்டு", "Perkuat", "加固", "加固", "補強", "보강"],
"Each round's fight begins with {n} temporary Health for it, used up first and gone next round.": [
 "Chaque manche, au début du combat, il gagne {n} Santé temporaire, perdue en premier et disparue à la manche suivante.",
 "Zu Beginn jedes Rundenkampfs erhält er {n} vorübergehendes Leben, das zuerst verbraucht wird und nächste Runde verfällt.",
 "Al empezar el combate de cada ronda recibe {n} de Salud temporal, que se gasta primero y desaparece la ronda siguiente.",
 "All’inizio dello scontro di ogni round riceve {n} Salute temporanea, consumata per prima e svanita il round dopo.",
 "No início do combate de cada rodada recebe {n} de Vida temporária, gasta primeiro e perdida na rodada seguinte.",
 "Sa simula ng laban bawat round, may {n} pansamantalang Buhay ito, unang nauubos at nawawala sa susunod na round.",
 "ஒவ்வொரு சுற்றுப் போரின் தொடக்கத்திலும் {n} தற்காலிக உயிர் பெறும்; முதலில் செலவாகி அடுத்த சுற்றில் மறையும்.",
 "Tiap awal pertarungan ronde, ia mendapat {n} Nyawa sementara, terpakai lebih dulu dan hilang ronde berikutnya.",
 "每回合战斗开始时获得{n}点临时生命，优先消耗，下回合消失。",
 "每回合戰鬥開始時獲得{n}點臨時生命，優先消耗，下回合消失。",
 "毎ラウンドの戦闘開始時に一時体力{n}を得る。先に減り、次のラウンドには消える。",
 "매 라운드 전투가 시작될 때 임시 체력 {n}을 얻어요. 먼저 깎이고 다음 라운드에 사라져요."],
"Temporary Health is the pale blue end of a unit's Health bar; bonus Health (above its printed Health) is the gold part.": [
 "La Santé temporaire est le bout bleu pâle de la barre de Santé ; la Santé bonus (au-delà de la Santé imprimée) en est la partie dorée.",
 "Vorübergehendes Leben ist das hellblaue Ende der Lebensleiste; Bonusleben (über dem aufgedruckten Leben) ist der goldene Teil.",
 "La Salud temporal es el extremo azul pálido de la barra de Salud; la Salud extra (por encima de la impresa) es la parte dorada.",
 "La Salute temporanea è l’estremità azzurra della barra della Salute; la Salute bonus (oltre quella stampata) è la parte dorata.",
 "A Vida temporária é a ponta azul-clara da barra de Vida; a Vida bônus (acima da impressa) é a parte dourada.",
 "Ang pansamantalang Buhay ang mapusyaw na asul na dulo ng bar ng Buhay; ang dagdag na Buhay (lampas sa nakalimbag) ang gintong bahagi.",
 "தற்காலிக உயிர் உயிர்ப் பட்டையின் வெளிர் நீல முனை; கூடுதல் உயிர் (அச்சிட்டதற்கு மேல்) தங்கப் பகுதி.",
 "Nyawa sementara adalah ujung biru pucat bilah Nyawa; Nyawa bonus (di atas Nyawa tercetak) adalah bagian emas.",
 "临时生命是生命条末端的淡蓝色部分；额外生命（超出卡面生命的部分）是金色部分。",
 "臨時生命是生命條末端的淡藍色部分；額外生命（超出卡面生命的部分）是金色部分。",
 "一時体力は体力バーの端の淡い青、ボーナス体力（印刷された体力を超える分）は金色の部分。",
 "임시 체력은 체력 바 끝의 옅은 파란색, 보너스 체력(카드에 적힌 체력 이상)은 금색 부분이에요."],
"Parasite": ["Parasite", "Parasit", "Parásito", "Parassita", "Parasita", "Parasito", "ஒட்டுண்ணி", "Parasit", "寄生", "寄生", "寄生", "기생"],
"Can be played onto an enemy unit in reach. It feeds on it each round: its Attack in damage.": [
 "Peut être joué sur une unité ennemie à portée. Il s’en nourrit chaque manche : son Attaque en dégâts.",
 "Kann auf eine gegnerische Einheit in Reichweite gespielt werden. Er zehrt jede Runde von ihr: seinen Angriff als Schaden.",
 "Se puede jugar sobre una unidad enemiga a tu alcance. Se alimenta de ella cada ronda: su Ataque en daño.",
 "Si può giocare su un’unità nemica a portata. Se ne nutre ogni round: il suo Attacco in danni.",
 "Pode ser jogado sobre uma unidade inimiga ao alcance. Alimenta-se dela a cada rodada: seu Ataque em dano.",
 "Puwedeng ilaro sa kalabang yunit na abot. Kumakain ito roon bawat round: ang Atake nito bilang pinsala.",
 "எட்டும் தூரத்திலுள்ள எதிரி அலகு மீது விளையாடலாம். ஒவ்வொரு சுற்றும் அதை உண்ணும்: தன் தாக்குதல் அளவு சேதம்.",
 "Bisa dimainkan ke unit musuh dalam jangkauan. Ia memakan unit itu tiap ronde: Serangannya sebagai kerusakan.",
 "可打在你够得着的敌方单位身上。每回合吸食它：造成等于自身攻击的伤害。",
 "可打在你夠得著的敵方單位身上。每回合吸食它：造成等於自身攻擊的傷害。",
 "届く範囲の敵ユニットの上に出せる。毎ラウンドそれを食う：自分の攻撃と同じダメージ。",
 "닿는 범위의 적 유닛 위에 낼 수 있어요. 매 라운드 그 유닛을 빨아먹어요: 자신의 공격만큼 피해."],
"In reach: a column you could play a unit into (the centre, or beside one of your units). It heals as much as it feeds. While it rides its host it can't be hit and blocks nothing, and it waits its own Wait first. When its host dies it drops onto your side in that column (if the slot is free). One Parasite a host, never on a Structure. Played into your own slot it is a plain unit.": [
 "À portée : une colonne où tu pourrais jouer une unité (le centre, ou à côté d’une de tes unités). Il se soigne d’autant qu’il se nourrit. Tant qu’il chevauche son hôte, il ne peut pas être touché et ne bloque rien, et il fait d’abord son Attente. Quand son hôte meurt, il tombe de ton côté dans cette colonne (si l’emplacement est libre). Un Parasite par hôte, jamais sur une Structure. Joué dans ton propre emplacement, c’est une unité ordinaire.",
 "In Reichweite: eine Spalte, in die du eine Einheit spielen könntest (die Mitte oder neben einer deiner Einheiten). Er heilt sich so viel, wie er zehrt. Solange er auf seinem Wirt reitet, kann er nicht getroffen werden und blockt nichts; zuerst wartet er sein eigenes Warten ab. Stirbt sein Wirt, fällt er auf deine Seite in diese Spalte (wenn der Platz frei ist). Ein Parasit pro Wirt, nie auf einem Bauwerk. In deinen eigenen Platz gespielt, ist er eine normale Einheit.",
 "A tu alcance: una columna donde podrías jugar una unidad (el centro, o junto a una de tus unidades). Se cura tanto como se alimenta. Mientras va sobre su huésped no puede ser golpeado ni bloquea nada, y primero cumple su Espera. Cuando su huésped muere, cae a tu lado en esa columna (si la casilla está libre). Un Parásito por huésped, nunca sobre una Estructura. Jugado en tu propia casilla es una unidad normal.",
 "A portata: una colonna in cui potresti giocare un’unità (il centro, o accanto a una tua unità). Si cura quanto si nutre. Mentre cavalca il suo ospite non può essere colpito e non blocca nulla, e prima sconta la propria Attesa. Quando l’ospite muore, cade dalla tua parte in quella colonna (se lo spazio è libero). Un Parassita per ospite, mai su una Struttura. Giocato in un tuo spazio è un’unità normale.",
 "Ao alcance: uma coluna onde você poderia jogar uma unidade (o centro, ou ao lado de uma unidade sua). Cura-se tanto quanto se alimenta. Enquanto monta seu hospedeiro não pode ser atingido e não bloqueia nada, e primeiro cumpre sua Espera. Quando o hospedeiro morre, cai do seu lado nessa coluna (se o espaço estiver livre). Um Parasita por hospedeiro, nunca numa Estrutura. Jogado no seu próprio espaço é uma unidade comum.",
 "Abot: isang hanay na mapaglalaruan mo ng yunit (ang gitna, o katabi ng isa sa mga yunit mo). Gumagaling ito nang kasindami ng kinakain nito. Habang nakasakay sa host hindi ito matatamaan at walang hinaharangan, at hinihintay muna nito ang sariling Hintay. Kapag namatay ang host, bumababa ito sa panig mo sa hanay na iyon (kung bakante ang puwesto). Isang Parasito bawat host, hindi kailanman sa Istruktura. Kapag inilaro sa sarili mong puwesto, karaniwang yunit ito.",
 "எட்டும் தூரம்: நீ ஒரு அலகை வைக்கக்கூடிய நெடுவரிசை (மையம், அல்லது உன் அலகுக்கு அருகில்). உண்ணும் அளவுக்கு தன்னைக் குணப்படுத்தும். தன் விருந்தோம்பி மீது இருக்கும்போது அதைத் தாக்க முடியாது, எதையும் தடுக்காது; முதலில் தன் காத்திருப்பை முடிக்கும். விருந்தோம்பி இறந்தால் அந்த நெடுவரிசையில் உன் பக்கம் விழும் (இடம் காலியாக இருந்தால்). ஒரு விருந்தோம்பிக்கு ஒரு ஒட்டுண்ணி, கட்டடத்தின் மீது ஒருபோதும் இல்லை. உன் இடத்தில் விளையாடினால் சாதாரண அலகு.",
 "Dalam jangkauan: kolom tempat kamu bisa memainkan unit (tengah, atau di samping salah satu unitmu). Ia sembuh sebanyak yang ia makan. Selama menumpang pada inangnya ia tak bisa diserang dan tak menghalangi apa pun, dan ia menjalani Tunggu-nya dulu. Saat inangnya mati, ia jatuh ke sisimu di kolom itu (jika slotnya kosong). Satu Parasit per inang, tak pernah pada Bangunan. Dimainkan di slotmu sendiri ia unit biasa.",
 "够得着：你能打出单位的那一列（中间，或你某个单位的旁边）。它吸多少就回复多少。附在宿主身上时它不会被攻击，也不阻挡任何东西，并且要先等完自己的等待。宿主死亡时，它会落到你这边的同一列（若该位置空着）。每个宿主只能有一个寄生，不能寄生在建筑上。打在你自己的格子里则是普通单位。",
 "夠得著：你能打出單位的那一列（中間，或你某個單位的旁邊）。它吸多少就回復多少。附在宿主身上時它不會被攻擊，也不阻擋任何東西，並且要先等完自己的等待。宿主死亡時，它會落到你這邊的同一列（若該位置空著）。每個宿主只能有一個寄生，不能寄生在建築上。打在你自己的格子裡則是普通單位。",
 "届く範囲：ユニットを出せる列（中央、または自分のユニットの隣）。食った分だけ回復する。宿主に乗っている間は攻撃されず、何もブロックせず、まず自分の待機を待つ。宿主が死ぬと、その列の自分側に落ちる（マスが空いていれば）。宿主1体に寄生は1体、建造物には付かない。自分のマスに出せば普通のユニット。",
 "닿는 범위: 유닛을 낼 수 있는 열(가운데, 또는 내 유닛 옆). 빨아먹은 만큼 회복해요. 숙주에 붙어 있는 동안은 공격받지 않고 아무것도 막지 않으며, 먼저 자기 대기를 기다려요. 숙주가 죽으면 그 열의 내 쪽으로 떨어져요(칸이 비어 있으면). 숙주 하나에 기생은 하나, 건축물에는 붙지 않아요. 내 칸에 내면 평범한 유닛이에요."],
"Durability {n}/{max}.": ["Durabilité {n}/{max}.", "Haltbarkeit {n}/{max}.", "Durabilidad {n}/{max}.", "Durabilità {n}/{max}.", "Durabilidade {n}/{max}.", "Tibay {n}/{max}.", "நீடிப்பு {n}/{max}.", "Ketahanan {n}/{max}.", "耐久 {n}/{max}。", "耐久 {n}/{max}。", "耐久 {n}/{max}。", "내구도 {n}/{max}."],
"Durability {n}: each hit on its wearer takes 1 (acid or Corrode 2); it breaks at 0.": [
 "Durabilité {n} : chaque coup sur son porteur en retire 1 (acide ou Corrosion : 2) ; il se brise à 0.",
 "Haltbarkeit {n}: jeder Treffer auf den Träger kostet 1 (Säure oder Ätzen 2); bei 0 zerbricht es.",
 "Durabilidad {n}: cada golpe a su portador resta 1 (ácido o Corrosión, 2); se rompe en 0.",
 "Durabilità {n}: ogni colpo a chi lo indossa toglie 1 (acido o Corrosione 2); a 0 si rompe.",
 "Durabilidade {n}: cada golpe no portador tira 1 (ácido ou Corrosão, 2); quebra em 0.",
 "Tibay {n}: bawat tama sa nagsusuot ay bawas 1 (asido o Corrode 2); nasisira sa 0.",
 "நீடிப்பு {n}: அணிந்தவர் மீது ஒவ்வொரு அடியும் 1 குறைக்கும் (அமிலம் அல்லது அரிப்பு 2); 0-இல் உடையும்.",
 "Ketahanan {n}: tiap serangan ke pemakainya mengurangi 1 (asam atau Korosi 2); pecah di 0.",
 "耐久{n}：持有者每受一次攻击减1（酸或腐蚀减2）；为0时损坏。",
 "耐久{n}：持有者每受一次攻擊減1（酸或腐蝕減2）；為0時損壞。",
 "耐久{n}：装備者が攻撃を受けるたび1減る（酸か腐食は2）。0で壊れる。",
 "내구도 {n}: 착용자가 공격받을 때마다 1 감소(산이나 부식은 2), 0이 되면 부서져요."],
"Broken!": ["Brisé !", "Zerbrochen!", "¡Roto!", "Rotto!", "Quebrou!", "Sira!", "உடைந்தது!", "Pecah!", "损坏！", "損壞！", "壊れた！", "부서졌다!"],
"{unit}'s {item} breaks.": ["{item} de {unit} se brise.", "{item} von {unit} zerbricht.", "{item} de {unit} se rompe.", "{item} di {unit} si rompe.", "{item} de {unit} quebra.", "Nasira ang {item} ni {unit}.", "{unit} இன் {item} உடைகிறது.", "{item} milik {unit} pecah.", "{unit}的{item}损坏了。", "{unit}的{item}損壞了。", "{unit}の{item}が壊れた。", "{unit}의 {item}이(가) 부서졌어요."],
"Acid eats into {unit}'s {item} ({n} durability left).": [
 "L’acide ronge {item} de {unit} (durabilité restante : {n}).", "Säure frisst sich in {item} von {unit} ({n} Haltbarkeit übrig).", "El ácido corroe {item} de {unit} (quedan {n} de durabilidad).",
 "L’acido corrode {item} di {unit} ({n} di durabilità rimasta).", "O ácido corrói {item} de {unit} (restam {n} de durabilidade).", "Kinakain ng asido ang {item} ni {unit} ({n} tibay na lang).",
 "அமிலம் {unit} இன் {item}-ஐ அரிக்கிறது ({n} நீடிப்பு மீதம்).", "Asam menggerogoti {item} milik {unit} (sisa ketahanan {n}).", "酸液侵蚀了{unit}的{item}（剩余耐久{n}）。",
 "酸液侵蝕了{unit}的{item}（剩餘耐久{n}）。", "酸が{unit}の{item}を蝕む（残り耐久{n}）。", "산이 {unit}의 {item}을(를) 갉아먹어요(내구도 {n} 남음)."],
"Health {hp}/{max}": ["Santé {hp}/{max}", "Leben {hp}/{max}", "Salud {hp}/{max}", "Salute {hp}/{max}", "Vida {hp}/{max}", "Buhay {hp}/{max}", "உயிர் {hp}/{max}", "Nyawa {hp}/{max}", "生命 {hp}/{max}", "生命 {hp}/{max}", "体力 {hp}/{max}", "체력 {hp}/{max}"],
"{n} bonus Health": ["{n} Santé bonus", "{n} Bonusleben", "{n} de Salud extra", "{n} Salute bonus", "{n} de Vida bônus", "{n} dagdag na Buhay", "{n} கூடுதல் உயிர்", "{n} Nyawa bonus", "{n}点额外生命", "{n}點額外生命", "ボーナス体力{n}", "보너스 체력 {n}"],
"{n} temporary Health": ["{n} Santé temporaire", "{n} vorübergehendes Leben", "{n} de Salud temporal", "{n} Salute temporanea", "{n} de Vida temporária", "{n} pansamantalang Buhay", "{n} தற்காலிக உயிர்", "{n} Nyawa sementara", "{n}点临时生命", "{n}點臨時生命", "一時体力{n}", "임시 체력 {n}"],
"Dive +{n}": ["Piqué +{n}", "Sturzflug +{n}", "Picado +{n}", "Picchiata +{n}", "Mergulho +{n}", "Sisid +{n}", "பாய்ச்சல் +{n}", "Tukik +{n}", "俯冲 +{n}", "俯衝 +{n}", "急降下 +{n}", "급강하 +{n}"],
"{unit} dives on {target} (+{n}).": ["{unit} pique sur {target} (+{n}).", "{unit} stürzt sich auf {target} (+{n}).", "{unit} se lanza en picado sobre {target} (+{n}).", "{unit} si getta in picchiata su {target} (+{n}).", "{unit} mergulha em {target} (+{n}).", "Sumisid si {unit} kay {target} (+{n}).", "{unit} {target} மீது பாய்கிறது (+{n}).", "{unit} menukik ke {target} (+{n}).", "{unit}俯冲攻击{target}（+{n}）。", "{unit}俯衝攻擊{target}（+{n}）。", "{unit}が{target}に急降下（+{n}）。", "{unit}이(가) {target}에게 급강하해요(+{n})."],
"Parasite: {name} ({a}/{h}) feeds on this unit.": ["Parasite : {name} ({a}/{h}) se nourrit de cette unité.", "Parasit: {name} ({a}/{h}) zehrt von dieser Einheit.", "Parásito: {name} ({a}/{h}) se alimenta de esta unidad.", "Parassita: {name} ({a}/{h}) si nutre di questa unità.", "Parasita: {name} ({a}/{h}) se alimenta desta unidade.", "Parasito: kumakain si {name} ({a}/{h}) sa yunit na ito.", "ஒட்டுண்ணி: {name} ({a}/{h}) இந்த அலகை உண்கிறது.", "Parasit: {name} ({a}/{h}) memakan unit ini.", "寄生：{name}（{a}/{h}）正在吸食此单位。", "寄生：{name}（{a}/{h}）正在吸食此單位。", "寄生：{name}（{a}/{h}）がこのユニットを食っている。", "기생: {name}({a}/{h})이(가) 이 유닛을 빨아먹고 있어요."],
"Hook the Parasite onto this unit": ["Accrocher le Parasite à cette unité", "Den Parasiten an diese Einheit heften", "Enganchar el Parásito a esta unidad", "Aggancia il Parassita a questa unità", "Prender o Parasita nesta unidade", "Ikabit ang Parasito sa yunit na ito", "ஒட்டுண்ணியை இந்த அலகில் பொருத்து", "Kaitkan Parasit ke unit ini", "把寄生体挂到这个单位上", "把寄生體掛到這個單位上", "このユニットに寄生させる", "이 유닛에 기생시키기"],
"A Parasite hooks onto an enemy unit in your reach.": ["Un Parasite s’accroche à une unité ennemie à ta portée.", "Ein Parasit heftet sich an eine gegnerische Einheit in deiner Reichweite.", "Un Parásito se engancha a una unidad enemiga a tu alcance.", "Un Parassita si aggancia a un’unità nemica a tua portata.", "Um Parasita se prende a uma unidade inimiga ao seu alcance.", "Kumakabit ang Parasito sa kalabang yunit na abot mo.", "ஒட்டுண்ணி உன் எட்டும் தூரத்திலுள்ள எதிரி அலகில் ஒட்டிக்கொள்ளும்.", "Parasit menempel pada unit musuh dalam jangkauanmu.", "寄生体只能挂在你够得着的敌方单位上。", "寄生體只能掛在你夠得著的敵方單位上。", "寄生は届く範囲の敵ユニットにしか付けられない。", "기생은 닿는 범위의 적 유닛에만 붙을 수 있어요."],
"{unit} hooks onto {target}.": ["{unit} s’accroche à {target}.", "{unit} heftet sich an {target}.", "{unit} se engancha a {target}.", "{unit} si aggancia a {target}.", "{unit} se prende a {target}.", "Kumabit si {unit} kay {target}.", "{unit} {target}-இல் ஒட்டிக்கொள்கிறது.", "{unit} menempel pada {target}.", "{unit}挂到了{target}身上。", "{unit}掛到了{target}身上。", "{unit}が{target}に取り付いた。", "{unit}이(가) {target}에게 달라붙었어요."],
"{unit} feeds on {target}: {n} damage.": ["{unit} se nourrit de {target} : {n} dégâts.", "{unit} zehrt von {target}: {n} Schaden.", "{unit} se alimenta de {target}: {n} de daño.", "{unit} si nutre di {target}: {n} danni.", "{unit} se alimenta de {target}: {n} de dano.", "Kumakain si {unit} kay {target}: {n} pinsala.", "{unit} {target}-ஐ உண்கிறது: {n} சேதம்.", "{unit} memakan {target}: {n} kerusakan.", "{unit}吸食{target}：{n}点伤害。", "{unit}吸食{target}：{n}點傷害。", "{unit}が{target}を食う：{n}ダメージ。", "{unit}이(가) {target}을(를) 빨아먹어요: 피해 {n}."],
"{unit} lets go of its fallen host and drops into the empty slot.": ["{unit} lâche son hôte tombé et se pose dans l’emplacement vide.", "{unit} lässt seinen gefallenen Wirt los und fällt in den freien Platz.", "{unit} suelta a su huésped caído y cae en la casilla vacía.", "{unit} lascia l’ospite caduto e scende nello spazio vuoto.", "{unit} solta o hospedeiro caído e cai no espaço vazio.", "Binitawan ni {unit} ang bumagsak na host at bumaba sa bakanteng puwesto.", "{unit} விழுந்த விருந்தோம்பியை விட்டு காலி இடத்தில் இறங்குகிறது.", "{unit} melepas inangnya yang tumbang dan turun ke slot kosong.", "{unit}放开倒下的宿主，落进空位。", "{unit}放開倒下的宿主，落進空位。", "{unit}は倒れた宿主から離れ、空いたマスに降りた。", "{unit}이(가) 쓰러진 숙주를 놓고 빈 칸으로 내려왔어요."],
"{unit} has nowhere to land and is lost.": ["{unit} n’a nulle part où se poser et disparaît.", "{unit} findet keinen Platz und geht verloren.", "{unit} no tiene dónde caer y se pierde.", "{unit} non ha dove posarsi ed è perduto.", "{unit} não tem onde cair e se perde.", "Walang mababagsakan si {unit} at nawala.", "{unit} இறங்க இடமின்றி இழக்கப்படுகிறது.", "{unit} tak punya tempat mendarat dan hilang.", "{unit}无处落脚，消失了。", "{unit}無處落腳，消失了。", "{unit}は降りる場所がなく失われた。", "{unit}은(는) 내려앉을 곳이 없어 사라졌어요."],
"{name}: {dmg} damage to your unit with the most Attack, every {every} turns. A Guardian beside it takes the blow instead.": [
 "{name} : {dmg} dégâts à ton unité qui a le plus d’Attaque, tous les {every} tours. Un Gardien à côté encaisse le coup à sa place.",
 "{name}: {dmg} Schaden an deiner Einheit mit dem meisten Angriff, alle {every} Züge. Ein Wächter daneben fängt den Schlag ab.",
 "{name}: {dmg} de daño a tu unidad con más Ataque, cada {every} turnos. Un Guardián a su lado recibe el golpe en su lugar.",
 "{name}: {dmg} danni alla tua unità con più Attacco, ogni {every} turni. Un Guardiano accanto prende il colpo al suo posto.",
 "{name}: {dmg} de dano à sua unidade com mais Ataque, a cada {every} turnos. Um Guardião ao lado leva o golpe no lugar dela.",
 "{name}: {dmg} pinsala sa yunit mong may pinakamataas na Atake, bawat {every} turno. Ang katabing Guardian ang sasalo ng tama.",
 "{name}: அதிக தாக்குதல் கொண்ட உன் அலகுக்கு {dmg} சேதம், ஒவ்வொரு {every} முறையும். பக்கத்திலுள்ள காவலர் அந்த அடியை ஏற்பார்.",
 "{name}: {dmg} kerusakan ke unitmu dengan Serangan tertinggi, tiap {every} giliran. Penjaga di sebelahnya menerima pukulan itu.",
 "{name}：每{every}回合对你攻击最高的单位造成{dmg}点伤害。旁边的守护者会代为承受。",
 "{name}：每{every}回合對你攻擊最高的單位造成{dmg}點傷害。旁邊的守護者會代為承受。",
 "{name}：{every}ターンごとに、攻撃が最も高い自分のユニットに{dmg}ダメージ。隣の守護者が代わりに受ける。",
 "{name}: {every}턴마다 공격이 가장 높은 내 유닛에게 피해 {dmg}. 옆의 수호자가 대신 맞아요."],
"{name} strikes {unit} for {dmg}.": ["{name} frappe {unit} : {dmg}.", "{name} trifft {unit}: {dmg}.", "{name} golpea a {unit}: {dmg}.", "{name} colpisce {unit}: {dmg}.", "{name} atinge {unit}: {dmg}.", "Tinamaan ng {name} si {unit}: {dmg}.", "{name} {unit}-ஐ அடிக்கிறது: {dmg}.", "{name} menghantam {unit}: {dmg}.", "{name}击中{unit}：{dmg}。", "{name}擊中{unit}：{dmg}。", "{name}が{unit}を打つ：{dmg}。", "{name}이(가) {unit}을(를) 강타: {dmg}."],
"{guard} steps in front of {unit} and takes the {name}: {dmg}.": ["{guard} s’interpose devant {unit} et encaisse {name} : {dmg}.", "{guard} stellt sich vor {unit} und fängt {name} ab: {dmg}.", "{guard} se pone delante de {unit} y recibe {name}: {dmg}.", "{guard} si mette davanti a {unit} e prende {name}: {dmg}.", "{guard} se põe à frente de {unit} e leva {name}: {dmg}.", "Pumagitna si {guard} sa harap ni {unit} at sinalo ang {name}: {dmg}.", "{guard} {unit} முன் வந்து {name}-ஐ ஏற்கிறது: {dmg}.", "{guard} menghadang di depan {unit} dan menerima {name}: {dmg}.", "{guard}挡在{unit}前面，承受了{name}：{dmg}。", "{guard}擋在{unit}前面，承受了{name}：{dmg}。", "{guard}が{unit}の前に立ち、{name}を受けた：{dmg}。", "{guard}이(가) {unit} 앞을 막고 {name}을(를) 맞았어요: {dmg}."],
"{name} finds no unit and hits your bramble for {dmg}.": ["{name} ne trouve aucune unité et frappe ta ronce : {dmg}.", "{name} findet keine Einheit und trifft deine Dornenhecke: {dmg}.", "{name} no encuentra ninguna unidad y golpea tu zarzal: {dmg}.", "{name} non trova unità e colpisce il tuo rovo: {dmg}.", "{name} não encontra unidade e atinge sua sarça: {dmg}.", "Walang yunit na nakita ang {name} at tinamaan ang bramble mo: {dmg}.", "{name} எந்த அலகையும் காணாமல் உன் முட்புதரைத் தாக்குகிறது: {dmg}.", "{name} tak menemukan unit dan menghantam semakmu: {dmg}.", "{name}找不到单位，击中你的荆棘堡：{dmg}。", "{name}找不到單位，擊中你的荊棘堡：{dmg}。", "{name}はユニットを見つけられず、あなたの砦を打った：{dmg}。", "{name}이(가) 유닛을 찾지 못해 내 가시덤불을 쳤어요: {dmg}."],
"Guarded": ["Protégé", "Beschützt", "Protegido", "Protetto", "Protegido", "Naprotektahan", "காக்கப்பட்டது", "Terlindungi", "受到守护", "受到守護", "守られた", "보호됨"],
"One unit (a Guardian can step in)": ["Une unité (un Gardien peut s’interposer)", "Eine Einheit (ein Wächter kann einspringen)", "Una unidad (un Guardián puede interponerse)", "Un’unità (un Guardiano può mettersi in mezzo)", "Uma unidade (um Guardião pode se interpor)", "Isang yunit (puwedeng pumagitna ang Guardian)", "ஒரு அலகு (காவலர் இடையில் வரலாம்)", "Satu unit (Penjaga bisa menghadang)", "单个单位（守护者可挺身而出）", "單個單位（守護者可挺身而出）", "1体（守護者が割って入れる）", "유닛 하나(수호자가 막아설 수 있음)"],
"Beak Strike": ["Coup de bec", "Schnabelhieb", "Picotazo", "Colpo di becco", "Bicada", "Tuka", "அலகு அடி", "Patukan Paruh", "鸟喙击", "鳥喙擊", "クチバシ打ち", "부리 찍기"],
}
NAMES = {
"Clinging Leech": ["Sangsue tenace", "Klammernder Blutegel", "Sanguijuela aferrada", "Sanguisuga tenace", "Sanguessuga agarrada", "Kumakapit na Linta", "ஒட்டும் அட்டை", "Lintah Melekat", "缠附水蛭", "纏附水蛭", "しがみつきヒル", "들러붙는 거머리"],
"Barnacle Bulwark": ["Rempart à bernacles", "Seepocken-Bollwerk", "Baluarte de percebes", "Baluardo di cirripedi", "Baluarte de cracas", "Kutang ng Taliptip", "கொட்டலை அரண்", "Benteng Teritip", "藤壶壁垒", "藤壺壁壘", "フジツボの防壁", "따개비 방벽"],
"Reefback Turtle": ["Tortue dos-de-récif", "Riffrücken-Schildkröte", "Tortuga lomo de arrecife", "Tartaruga dorso di scogliera", "Tartaruga dorso-de-recife", "Pagong na Likod-bahura", "பவளமுதுகு ஆமை", "Penyu Punggung Karang", "礁背海龟", "礁背海龜", "サンゴ甲羅のウミガメ", "산호등 바다거북"],
}
FLAVOR = {
"It never picks a fight. It picks a host, and it holds on until the host gives up.": [
 "Il ne choisit jamais un combat. Il choisit un hôte, et il tient bon jusqu’à ce que l’hôte cède.",
 "Er sucht nie Streit. Er sucht sich einen Wirt und hält fest, bis der Wirt aufgibt.",
 "Nunca elige una pelea. Elige un huésped, y se aferra hasta que el huésped se rinde.",
 "Non sceglie mai uno scontro. Sceglie un ospite, e resta attaccata finché l’ospite non cede.",
 "Nunca escolhe uma briga. Escolhe um hospedeiro, e se agarra até o hospedeiro desistir.",
 "Hindi ito pumipili ng away. Pumipili ito ng host, at kumakapit hanggang sumuko ang host.",
 "அது சண்டையைத் தேர்வதில்லை. ஒரு விருந்தோம்பியைத் தேர்ந்து, அது தளரும் வரை பிடித்துக்கொள்கிறது.",
 "Ia tak pernah memilih perkelahian. Ia memilih inang, dan bertahan sampai inangnya menyerah.",
 "它从不挑起争斗。它挑选宿主，然后一直缠着，直到宿主放弃。",
 "它從不挑起爭鬥。它挑選宿主，然後一直纏著，直到宿主放棄。",
 "けんかは選ばない。選ぶのは宿主で、宿主が音を上げるまで離れない。",
 "싸움을 고르지 않아요. 숙주를 고르고, 숙주가 포기할 때까지 매달려요."],
"Every shell that ever washed up on the reef is glued to its back. The kraken's beak has tried most of them.": [
 "Chaque coquille échouée sur le récif est collée sur son dos. Le bec du kraken en a essayé la plupart.",
 "Jede Muschel, die je ans Riff gespült wurde, klebt auf seinem Rücken. Der Schnabel des Kraken hat die meisten probiert.",
 "Cada concha que llegó al arrecife está pegada a su espalda. El pico del kraken ha probado la mayoría.",
 "Ogni conchiglia mai arrivata sulla scogliera è incollata sulla sua schiena. Il becco del kraken le ha provate quasi tutte.",
 "Toda concha que já chegou ao recife está colada nas suas costas. O bico do kraken já provou a maioria.",
 "Nakadikit sa likod nito ang bawat kabibeng napadpad sa bahura. Nasubukan na ng tuka ng kraken ang karamihan.",
 "பவளப்பாறைக்கு ஒதுங்கிய ஒவ்வொரு சிப்பியும் அதன் முதுகில் ஒட்டியுள்ளது. கிராக்கனின் அலகு அவற்றில் பலவற்றை முயன்றுள்ளது.",
 "Setiap cangkang yang pernah terdampar di karang menempel di punggungnya. Paruh kraken sudah mencoba sebagian besar.",
 "冲上礁石的每一枚贝壳都粘在它背上。海妖的喙已经试过其中大半。",
 "沖上礁石的每一枚貝殼都黏在它背上。海妖的喙已經試過其中大半。",
 "岩礁に流れ着いた貝殻はみな、その背中に貼りついている。クラーケンのくちばしはほとんどを試した。",
 "암초에 밀려온 조개껍데기는 모두 그 등에 붙어 있어요. 크라켄의 부리가 대부분을 시험해 봤죠."],
"Coral has grown on its shell for a hundred years. The little fish hide behind it, and so do the otters.": [
 "Le corail pousse sur sa carapace depuis cent ans. Les petits poissons s’y cachent, et les loutres aussi.",
 "Seit hundert Jahren wächst Koralle auf seinem Panzer. Die kleinen Fische verstecken sich dahinter, die Otter auch.",
 "El coral crece en su caparazón desde hace cien años. Los peces pequeños se esconden detrás, y las nutrias también.",
 "Il corallo cresce sul suo guscio da cent’anni. I pesciolini ci si nascondono dietro, e anche le lontre.",
 "O coral cresce em seu casco há cem anos. Os peixinhos se escondem atrás dele, e as lontras também.",
 "Isang daang taon nang tumutubo ang korales sa bao nito. Nagtatago sa likod nito ang maliliit na isda, pati ang mga otter.",
 "நூறு ஆண்டுகளாக அதன் ஓட்டில் பவளம் வளர்கிறது. சிறு மீன்கள் அதன் பின் ஒளிகின்றன, நீர்நாய்களும் கூட.",
 "Karang tumbuh di cangkangnya selama seratus tahun. Ikan-ikan kecil bersembunyi di baliknya, begitu juga para berang-berang.",
 "珊瑚在它的壳上长了一百年。小鱼躲在它身后，水獭也是。",
 "珊瑚在牠的殼上長了一百年。小魚躲在牠身後，水獺也是。",
 "百年かけてその甲羅にサンゴが育った。小魚はその陰に隠れ、カワウソたちも隠れる。",
 "백 년 동안 그 등딱지에 산호가 자랐어요. 작은 물고기들이 그 뒤에 숨고, 수달들도 그래요."],
}
def dump(path, d):
    with open(path, 'w', encoding='utf-8') as fh:
        json.dump(d, fh, ensure_ascii=False, indent=1); fh.write('\n')
ph = lambda s: sorted(set(re.findall(r'\{\w+\}', s)))
for tab in (T, NAMES, FLAVOR): assert all(len(v) == len(CODES) for v in tab.values()), [k for k, v in tab.items() if len(v) != len(CODES)]
for i, code in enumerate(CODES):
    path = os.path.join(ROOT, 'lang', code + '.json'); ui = os.path.join(ROOT, 'lang', 'ui', code + '.json'); cards = os.path.join(ROOT, 'lang', 'cards', code + '.json')
    pack = json.load(open(path, encoding='utf-8')); uipack = json.load(open(ui, encoding='utf-8')); cpack = json.load(open(cards, encoding='utf-8'))
    ui_sorted, c_sorted = list(uipack) == sorted(uipack), list(cpack) == sorted(cpack)
    for en, row in T.items():
        t = row[i]; assert ph(en) == ph(t), (code, en, t)
        if en not in pack and en not in uipack: pack[en] = t
    for en, row in NAMES.items():
        if en not in cpack: cpack[en] = row[i]
    for en, row in FLAVOR.items():
        if en not in uipack and en not in pack: uipack[en] = row[i]
    dump(path, pack); dump(ui, dict(sorted(uipack.items())) if ui_sorted else uipack); dump(cards, dict(sorted(cpack.items())) if c_sorted else cpack)
print('wrote', len(CODES), 'packs:', len(T), 'texts,', len(NAMES), 'names,', len(FLAVOR), 'flavour lines')
