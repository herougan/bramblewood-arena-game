#!/usr/bin/env python3
"""Game texts added on 2026-11-04 by package ENG23 (owner 11-03 23:01 / 23:12): Crepuscular's day and night parts and its braced form,
Skitter, the fast-forward tokens and Grant Fast-forward, the two bramble actives of CONTENT9-2 (the Gnawed Larder's Feed, Ballista Keep's
Aimed Bolt) and the Type's new shown name Rodentia (the taxonomy's NAMES.rodent). One row per English text in lang/<code>.json (rows that
already exist are kept as they are; new rows are appended, nothing is sorted). Tagalog, Tamil, Japanese and Korean deserve a native read.
    python3 tools/i18n_2026_11_04_eng23.py   (idempotent)"""
import json, os, re
ROOT = os.path.join(os.path.dirname(os.path.abspath(__file__)), '..')
CODES = ['fr', 'de', 'es', 'it', 'pt', 'tl', 'ta', 'id', 'zh-Hans', 'zh-Hant', 'ja', 'ko']
T = [  # English, then the 12 translations in CODES order
 ('Day Attack', ['Attaque de jour', 'Angriff am Tag', 'Ataque de día', 'Attacco di giorno', 'Ataque de dia', 'Atake sa araw', 'பகல் தாக்குதல்', 'Serangan siang', '白天攻击', '白天攻擊', '昼の攻撃', '낮 공격']),
 ('Day Health', ['Santé de jour', 'Leben am Tag', 'Salud de día', 'Salute di giorno', 'Vida de dia', 'Buhay sa araw', 'பகல் உயிர்', 'Nyawa siang', '白天生命', '白天生命', '昼の体力', '낮 체력']),
 ('Night Attack', ['Attaque de nuit', 'Angriff bei Nacht', 'Ataque de noche', 'Attacco di notte', 'Ataque de noite', 'Atake sa gabi', 'இரவுத் தாக்குதல்', 'Serangan malam', '夜晚攻击', '夜晚攻擊', '夜の攻撃', '밤 공격']),
 ('Night Health', ['Santé de nuit', 'Leben bei Nacht', 'Salud de noche', 'Salute di notte', 'Vida de noite', 'Buhay sa gabi', 'இரவு உயிர்', 'Nyawa malam', '夜晚生命', '夜晚生命', '夜の体力', '밤 체력']),
 ('Crepuscular {day} → {night}', ['Crépusculaire {day} → {night}', 'Dämmerungsaktiv {day} → {night}', 'Crepuscular {day} → {night}', 'Crepuscolare {day} → {night}', 'Crepuscular {day} → {night}', 'Takipsilim {day} → {night}', 'அந்திநேர {day} → {night}', 'Krepuskular {day} → {night}', '晨昏 {day} → {night}', '晨昏 {day} → {night}', '薄明 {day} → {night}', '박명 {day} → {night}']),
 ('Crepuscular { {day} } → { {night} }', ['Crépusculaire { {day} } → { {night} }', 'Dämmerungsaktiv { {day} } → { {night} }', 'Crepuscular { {day} } → { {night} }', 'Crepuscolare { {day} } → { {night} }', 'Crepuscular { {day} } → { {night} }', 'Takipsilim { {day} } → { {night} }', 'அந்திநேர { {day} } → { {night} }', 'Krepuskular { {day} } → { {night} }', '晨昏 { {day} } → { {night} }', '晨昏 { {day} } → { {night} }', '薄明 { {day} } → { {night} }', '박명 { {day} } → { {night} }']),
 ('At night: +{a}/+{h}. Twilight brings it too.', [
   'La nuit : +{a}/+{h}. Le crépuscule l’apporte aussi.', 'Nachts: +{a}/+{h}. Die Dämmerung bringt es auch.', 'De noche: +{a}/+{h}. El crepúsculo también lo trae.',
   'Di notte: +{a}/+{h}. Anche il crepuscolo lo porta.', 'De noite: +{a}/+{h}. O crepúsculo também o traz.', 'Sa gabi: +{a}/+{h}. Dala rin ito ng takipsilim.',
   'இரவில்: +{a}/+{h}. அந்திநேரமும் இதைக் கொண்டுவரும்.', 'Malam hari: +{a}/+{h}. Senja juga membawanya.', '夜晚：+{a}/+{h}。黄昏时也有。', '夜晚：+{a}/+{h}。黃昏時也有。',
   '夜：+{a}/+{h}。薄明でも得る。', '밤: +{a}/+{h}. 황혼에도 얻습니다.']),
 ('By day: +{da}/+{dh}. At night: +{na}/+{nh}. Twilight brings both.', [
   'Le jour : +{da}/+{dh}. La nuit : +{na}/+{nh}. Le crépuscule apporte les deux.', 'Am Tag: +{da}/+{dh}. Nachts: +{na}/+{nh}. Die Dämmerung bringt beides.',
   'De día: +{da}/+{dh}. De noche: +{na}/+{nh}. El crepúsculo trae ambos.', 'Di giorno: +{da}/+{dh}. Di notte: +{na}/+{nh}. Il crepuscolo porta entrambi.',
   'De dia: +{da}/+{dh}. De noite: +{na}/+{nh}. O crepúsculo traz ambos.', 'Sa araw: +{da}/+{dh}. Sa gabi: +{na}/+{nh}. Dala ng takipsilim ang dalawa.',
   'பகலில்: +{da}/+{dh}. இரவில்: +{na}/+{nh}. அந்திநேரம் இரண்டையும் கொண்டுவரும்.', 'Siang hari: +{da}/+{dh}. Malam hari: +{na}/+{nh}. Senja membawa keduanya.',
   '白天：+{da}/+{dh}。夜晚：+{na}/+{nh}。黄昏时两者都有。', '白天：+{da}/+{dh}。夜晚：+{na}/+{nh}。黃昏時兩者都有。',
   '昼：+{da}/+{dh}。夜：+{na}/+{nh}。薄明では両方。', '낮: +{da}/+{dh}. 밤: +{na}/+{nh}. 황혼에는 둘 다.']),
 ('Skitter', ['Détale', 'Huschen', 'Escabullirse', 'Sgattaiolare', 'Escapulir', 'Kaskas', 'பதுங்கியோட்டம்', 'Lari Kecil', '窜逃', '竄逃', 'すばしっこい', '종종걸음']),
 ('After one of its hits lands, it has Haste and Evasive for its next turn.', [
   'Après un coup réussi, il a Hâte et Évasif pour son prochain tour.', 'Nachdem einer seiner Treffer sitzt, hat es in seinem nächsten Zug Eile und Ausweichend.',
   'Tras acertar un golpe, tiene Prisa y Evasivo en su siguiente turno.', 'Dopo che un suo colpo va a segno, ha Fretta ed Evasivo nel turno successivo.',
   'Depois de um golpe certeiro, tem Pressa e Evasivo no turno seguinte.', 'Matapos tumama ang isang atake nito, may Bilis at Iwas ito sa susunod nitong turn.',
   'அதன் அடி ஒன்று பட்ட பிறகு, அடுத்த முறைக்கு அதற்கு வேகமும் தப்பித்தலும் கிடைக்கும்.', 'Setelah salah satu pukulannya kena, ia mendapat Gesit dan Mengelak pada giliran berikutnya.',
   '它的一次攻击命中后，下一回合获得迅捷与闪避。', '它的一次攻擊命中後，下一回合獲得迅捷與閃避。', '攻撃が当たると、次のターンにヘイストと回避を得る。', '공격이 맞으면 다음 턴에 신속과 회피를 얻습니다.']),
 ('Haste: Speed +2 for itself and +1 for the allies beside it. Evasive: a 1-in-2 chance to dodge each single-target attack or ability. Both last for the round after the hit; another hit renews them.', [
   'Hâte : Vitesse +2 pour lui et +1 pour les alliés à côté. Évasif : 1 chance sur 2 d’esquiver chaque attaque ou capacité à cible unique. Les deux durent la manche après le coup ; un autre coup les renouvelle.',
   'Eile: Tempo +2 für sich und +1 für die Verbündeten daneben. Ausweichend: 1 zu 2, jedem Einzelziel-Angriff oder jeder Einzelziel-Fähigkeit auszuweichen. Beides hält die Runde nach dem Treffer; ein weiterer Treffer erneuert es.',
   'Prisa: Velocidad +2 para sí y +1 para los aliados a su lado. Evasivo: 1 entre 2 de esquivar cada ataque o habilidad de un solo objetivo. Ambos duran la ronda tras el golpe; otro golpe los renueva.',
   'Fretta: Velocità +2 per sé e +1 per gli alleati accanto. Evasivo: 1 su 2 di schivare ogni attacco o abilità a bersaglio singolo. Entrambi durano il round dopo il colpo; un altro colpo li rinnova.',
   'Pressa: Velocidade +2 para si e +1 para os aliados ao lado. Evasivo: 1 em 2 de esquivar cada ataque ou habilidade de alvo único. Ambos duram a ronda após o golpe; outro golpe renova-os.',
   'Bilis: Bilis +2 sa sarili at +1 sa mga kakamping katabi. Iwas: 1 sa 2 na tsansang makaiwas sa bawat atake o kakayahang iisa ang target. Tatagal ang dalawa sa round matapos ang tama; panibagong tama ang magpapanibago.',
   'வேகம்: தனக்கு வேகம் +2, அருகிலுள்ள கூட்டாளிகளுக்கு +1. தப்பித்தல்: ஒற்றை இலக்குத் தாக்குதல் அல்லது திறனைத் தவிர்க்க 2-இல் 1 வாய்ப்பு. இரண்டும் அடிக்குப் பின்வரும் சுற்று நீடிக்கும்; இன்னொரு அடி புதுப்பிக்கும்.',
   'Gesit: Kecepatan +2 untuk dirinya dan +1 untuk sekutu di sebelahnya. Mengelak: peluang 1 dari 2 menghindari tiap serangan atau kemampuan satu sasaran. Keduanya bertahan satu ronde setelah pukulan; pukulan lain memperbaruinya.',
   '迅捷：自身速度 +2，相邻友军 +1。闪避：对每次单体攻击或技能有二分之一几率闪开。两者在命中后的一回合内生效；再次命中会刷新。',
   '迅捷：自身速度 +2，相鄰友軍 +1。閃避：對每次單體攻擊或技能有二分之一機率閃開。兩者在命中後的一回合內生效；再次命中會刷新。',
   'ヘイスト：自身の速度+2、隣の味方+1。回避：単体対象の攻撃や能力を2回に1回かわす。どちらも命中の次のラウンドの間続き、再び命中すると更新される。',
   '신속: 자신 속도 +2, 옆의 아군 +1. 회피: 단일 대상 공격이나 능력을 2번에 1번 피합니다. 둘 다 공격이 맞은 다음 라운드 동안 유지되며, 다시 맞히면 갱신됩니다.']),
 ('Grant Fast-forward', ['Accorder Avance rapide', 'Vorspulen gewähren', 'Conceder Avance rápido', 'Concedi Avanti veloce', 'Conceder Avanço rápido', 'Magbigay ng Fast-forward', 'வேக முன்னோட்டம் அளி', 'Beri Maju Cepat', '赋予快进', '賦予快進', '早送りを与える', '빨리 감기 부여']),
 ('Put N fast-forward tokens on a target (itself by default, an ally or every ally). At the start of the next combat, each token is one extra turn for that unit on its own: a Waiting unit counts its Wait down by 1, a Ready one swings.', [
   'Place N jetons d’avance rapide sur une cible (lui-même par défaut, un allié ou chaque allié). Au début du combat suivant, chaque jeton est un tour de plus pour cette unité seule : une unité en Attente décompte son Attente de 1, une unité Prête frappe.',
   'Legt N Vorspul-Marker auf ein Ziel (standardmäßig sich selbst, einen Verbündeten oder alle Verbündeten). Zu Beginn des nächsten Kampfes ist jeder Marker ein Extrazug nur für diese Einheit: Eine wartende Einheit zählt ihr Warten um 1 herunter, eine bereite schlägt zu.',
   'Pon N fichas de avance rápido en un objetivo (él mismo por defecto, un aliado o cada aliado). Al empezar el siguiente combate, cada ficha es un turno extra solo para esa unidad: una unidad en Espera baja su Espera en 1, una Lista golpea.',
   'Metti N segnalini di avanti veloce su un bersaglio (se stesso di base, un alleato o ogni alleato). All’inizio dello scontro seguente, ogni segnalino è un turno in più solo per quell’unità: un’unità in Attesa scala la sua Attesa di 1, una Pronta colpisce.',
   'Coloca N fichas de avanço rápido num alvo (ele próprio por defeito, um aliado ou cada aliado). No início do combate seguinte, cada ficha é um turno extra só para essa unidade: uma unidade em Espera desconta 1 de Espera, uma Pronta ataca.',
   'Maglagay ng N fast-forward token sa isang target (sa sarili bilang default, sa isang kakampi o sa bawat kakampi). Sa simula ng susunod na labanan, bawat token ay isang dagdag na turn para lamang sa yunit na iyon: ang naka-Hintay ay bababa ng 1 ang Hintay, ang Handa ay aatake.',
   'ஒரு இலக்கின் மீது N வேக முன்னோட்ட வில்லைகளை வை (இயல்பாகத் தன்மீது, ஒரு கூட்டாளி அல்லது ஒவ்வொரு கூட்டாளி). அடுத்த சண்டையின் தொடக்கத்தில், ஒவ்வொரு வில்லையும் அந்த அலகுக்கு மட்டும் ஒரு கூடுதல் முறை: காத்திருக்கும் அலகு காத்திருப்பை 1 குறைக்கும், தயாரானது தாக்கும்.',
   'Taruh N token maju cepat pada sasaran (dirinya secara bawaan, satu sekutu atau setiap sekutu). Di awal pertarungan berikutnya, tiap token adalah satu giliran tambahan khusus untuk unit itu: unit yang Menunggu mengurangi Tunggunya 1, unit yang Siap menyerang.',
   '在目标身上放置 N 个快进标记（默认是自己，也可以是一名友军或所有友军）。下一场战斗开始时，每个标记让该单位单独多行动一次：等待中的单位等待减 1，就绪的单位攻击。',
   '在目標身上放置 N 個快進標記（預設是自己，也可以是一名友軍或所有友軍）。下一場戰鬥開始時，每個標記讓該單位單獨多行動一次：等待中的單位等待減 1，就緒的單位攻擊。',
   '対象に早送りトークンをN個置く（初期値は自身、味方1体、または味方全員）。次の戦闘の開始時、トークン1つにつきそのユニットだけが1回多く行動する：待機中なら待機が1減り、準備完了なら攻撃する。',
   '대상에게 빨리 감기 토큰 N개를 놓습니다(기본은 자신, 아군 하나 또는 모든 아군). 다음 전투가 시작될 때 토큰 하나마다 그 유닛만 한 번 더 행동합니다: 대기 중이면 대기가 1 줄고, 준비되었으면 공격합니다.']),
 ('give {who} ⏩ ×{n} fast-forward', ['donner ⏩ ×{n} avance rapide à {who}', '{who} ⏩ ×{n} Vorspulen geben', 'dar ⏩ ×{n} avance rápido a {who}', 'dare ⏩ ×{n} avanti veloce a {who}', 'dar ⏩ ×{n} avanço rápido a {who}', 'bigyan ang {who} ng ⏩ ×{n} fast-forward', '{who}-க்கு ⏩ ×{n} வேக முன்னோட்டம் அளி', 'beri {who} ⏩ ×{n} maju cepat', '给予{who} ⏩ ×{n} 快进', '給予{who} ⏩ ×{n} 快進', '{who}に早送り ⏩ ×{n} を与える', '{who}에게 빨리 감기 ⏩ ×{n} 부여']),
 ('itself', ['lui-même', 'sich selbst', 'sí mismo', 'se stesso', 'si próprio', 'sarili nito', 'தன்னை', 'dirinya', '自己', '自己', '自身', '자신']),
 ('Fast-forward ⏩ ×{n}: at the start of the next combat it takes {n} extra turns of its own, before everyone else.', [
   'Avance rapide ⏩ ×{n} : au début du combat suivant, il joue {n} tours de plus à lui seul, avant tous les autres.',
   'Vorspulen ⏩ ×{n}: Zu Beginn des nächsten Kampfes macht es {n} eigene Extrazüge, vor allen anderen.',
   'Avance rápido ⏩ ×{n}: al empezar el siguiente combate hace {n} turnos extra propios, antes que nadie.',
   'Avanti veloce ⏩ ×{n}: all’inizio dello scontro seguente fa {n} turni in più da solo, prima di tutti.',
   'Avanço rápido ⏩ ×{n}: no início do combate seguinte faz {n} turnos extra só seus, antes de todos.',
   'Fast-forward ⏩ ×{n}: sa simula ng susunod na labanan, gagawa ito ng {n} dagdag na sariling turn, bago ang lahat.',
   'வேக முன்னோட்டம் ⏩ ×{n}: அடுத்த சண்டையின் தொடக்கத்தில், மற்ற எல்லோருக்கும் முன், அது தனியாக {n} கூடுதல் முறைகள் ஆடும்.',
   'Maju cepat ⏩ ×{n}: di awal pertarungan berikutnya ia mengambil {n} giliran tambahan sendiri, sebelum yang lain.',
   '快进 ⏩ ×{n}：下一场战斗开始时，它先于所有人单独多行动 {n} 次。', '快進 ⏩ ×{n}：下一場戰鬥開始時，它先於所有人單獨多行動 {n} 次。',
   '早送り ⏩ ×{n}：次の戦闘の開始時、誰よりも先に単独で{n}回多く行動する。', '빨리 감기 ⏩ ×{n}: 다음 전투가 시작될 때, 누구보다 먼저 혼자서 {n}번 더 행동합니다.']),
 ('⏩ {name} gets fast-forward ×{n}.', ['⏩ {name} reçoit avance rapide ×{n}.', '⏩ {name} erhält Vorspulen ×{n}.', '⏩ {name} recibe avance rápido ×{n}.', '⏩ {name} riceve avanti veloce ×{n}.', '⏩ {name} recebe avanço rápido ×{n}.', '⏩ Nakakuha ang {name} ng fast-forward ×{n}.', '⏩ {name} வேக முன்னோட்டம் ×{n} பெறுகிறது.', '⏩ {name} mendapat maju cepat ×{n}.', '⏩ {name} 获得快进 ×{n}。', '⏩ {name} 獲得快進 ×{n}。', '⏩ {name}は早送り ×{n} を得た。', '⏩ {name}이(가) 빨리 감기 ×{n}을(를) 얻었습니다.']),
 ('🐾 {name} skitters: Haste and Evasive next turn.', ['🐾 {name} détale : Hâte et Évasif au prochain tour.', '🐾 {name} huscht: Eile und Ausweichend im nächsten Zug.', '🐾 {name} se escabulle: Prisa y Evasivo el siguiente turno.', '🐾 {name} sgattaiola: Fretta ed Evasivo al prossimo turno.', '🐾 {name} escapule-se: Pressa e Evasivo no próximo turno.', '🐾 Kumaskas ang {name}: Bilis at Iwas sa susunod na turn.', '🐾 {name} பதுங்கியோடுகிறது: அடுத்த முறை வேகமும் தப்பித்தலும்.', '🐾 {name} berlari kecil: Gesit dan Mengelak giliran berikutnya.', '🐾 {name} 窜逃：下一回合迅捷与闪避。', '🐾 {name} 竄逃：下一回合迅捷與閃避。', '🐾 {name}はすばしっこく動く：次のターン、ヘイストと回避。', '🐾 {name}이(가) 종종걸음: 다음 턴에 신속과 회피.']),
 ('Feed', ['Nourrir', 'Füttern', 'Alimentar', 'Nutrire', 'Alimentar', 'Pakainin', 'ஊட்டு', 'Beri Makan', '喂食', '餵食', '餌やり', '먹이기']),
 ('Feed: once a turn, instead of pitching, a hand card goes into this bramble: Repair {n} and +{a} Attack to your units on the field. {k} feeds a fight.', [
   'Nourrir : une fois par tour, au lieu de défausser, une carte de la main va dans ce roncier : Réparation {n} et +{a} Attaque à vos unités sur le terrain. {k} repas par combat.',
   'Füttern: einmal pro Zug, statt abzuwerfen, geht eine Handkarte in diese Dornenhecke: Reparatur {n} und +{a} Angriff für deine Einheiten auf dem Feld. {k} Fütterungen pro Kampf.',
   'Alimentar: una vez por turno, en vez de descartar, una carta de la mano entra en este zarzal: Reparar {n} y +{a} Ataque a tus unidades en el campo. {k} comidas por combate.',
   'Nutrire: una volta per turno, invece di scartare, una carta dalla mano entra in questo rovo: Riparazione {n} e +{a} Attacco alle tue unità in campo. {k} pasti a scontro.',
   'Alimentar: uma vez por turno, em vez de descartar, uma carta da mão entra neste silvado: Reparar {n} e +{a} Ataque às tuas unidades em campo. {k} refeições por combate.',
   'Pakainin: minsan bawat turn, sa halip na itapon, isang kard sa kamay ang papasok sa dawag na ito: Ayusin {n} at +{a} Atake sa iyong mga yunit sa larangan. {k} pagpapakain bawat laban.',
   'ஊட்டு: ஒரு முறைக்கு ஒருமுறை, வீசுவதற்குப் பதில், கையிலுள்ள ஓர் அட்டை இந்த முட்புதருக்குள் போகும்: பழுதுபார் {n}, களத்திலுள்ள உன் அலகுகளுக்கு +{a} தாக்குதல். ஒரு சண்டைக்கு {k} ஊட்டல்கள்.',
   'Beri Makan: sekali per giliran, alih-alih membuang, satu kartu dari tangan masuk ke semak ini: Perbaiki {n} dan +{a} Serangan untuk unitmu di medan. {k} kali per pertarungan.',
   '喂食：每回合一次，代替弃牌，把一张手牌喂给这座荆棘丛：修复 {n}，你场上的单位 +{a} 攻击。每场战斗 {k} 次。',
   '餵食：每回合一次，代替棄牌，把一張手牌餵給這座荊棘叢：修復 {n}，你場上的單位 +{a} 攻擊。每場戰鬥 {k} 次。',
   '餌やり：1ターンに1回、捨てる代わりに手札1枚をこのいばらに与える：修復{n}、場のあなたのユニットに攻撃+{a}。1戦闘に{k}回。',
   '먹이기: 턴마다 한 번, 버리는 대신 손의 카드 한 장을 이 덤불에 먹입니다: 수리 {n}, 필드의 내 유닛 공격 +{a}. 전투당 {k}번.']),
 ("Feed (instead of this turn's pitch): drop a hand card here or on your bramble, or pick a card and tap. Repair {n}, your units on the field +{a} Attack. {left} left this fight.", [
   'Nourrir (au lieu de la défausse de ce tour) : déposez une carte de la main ici ou sur votre roncier, ou choisissez une carte et touchez. Réparation {n}, vos unités sur le terrain +{a} Attaque. Encore {left} ce combat.',
   'Füttern (statt des Abwurfs in diesem Zug): Lege eine Handkarte hier oder auf deine Dornenhecke, oder wähle eine Karte und tippe. Reparatur {n}, deine Einheiten auf dem Feld +{a} Angriff. Noch {left} in diesem Kampf.',
   'Alimentar (en vez del descarte de este turno): suelta una carta de la mano aquí o en tu zarzal, o elige una carta y toca. Reparar {n}, tus unidades en el campo +{a} Ataque. Quedan {left} este combate.',
   'Nutrire (invece dello scarto di questo turno): lascia qui una carta della mano o sul tuo rovo, oppure scegli una carta e tocca. Riparazione {n}, le tue unità in campo +{a} Attacco. Ne restano {left} in questo scontro.',
   'Alimentar (em vez do descarte deste turno): larga uma carta da mão aqui ou no teu silvado, ou escolhe uma carta e toca. Reparar {n}, as tuas unidades em campo +{a} Ataque. Restam {left} neste combate.',
   'Pakainin (sa halip na itapon ngayong turn): ihulog dito o sa iyong dawag ang isang kard sa kamay, o pumili ng kard at pindutin. Ayusin {n}, iyong mga yunit sa larangan +{a} Atake. {left} na lang sa labang ito.',
   'ஊட்டு (இந்த முறையின் வீசலுக்குப் பதில்): கையிலுள்ள அட்டையை இங்கே அல்லது உன் முட்புதர் மீது விடு, அல்லது ஓர் அட்டையைத் தேர்ந்து தட்டு. பழுதுபார் {n}, களத்திலுள்ள உன் அலகுகள் +{a} தாக்குதல். இந்தச் சண்டையில் இன்னும் {left}.',
   'Beri Makan (pengganti buangan giliran ini): taruh kartu dari tangan di sini atau di semakmu, atau pilih kartu lalu ketuk. Perbaiki {n}, unitmu di medan +{a} Serangan. Sisa {left} di pertarungan ini.',
   '喂食（代替本回合的弃牌）：把手牌拖到这里或你的荆棘丛上，或选中一张牌再点按。修复 {n}，你场上的单位 +{a} 攻击。本场还剩 {left} 次。',
   '餵食（代替本回合的棄牌）：把手牌拖到這裡或你的荊棘叢上，或選取一張牌再點按。修復 {n}，你場上的單位 +{a} 攻擊。本場還剩 {left} 次。',
   '餌やり（このターンの捨て札の代わり）：手札をここかあなたのいばらに置くか、カードを選んでタップ。修復{n}、場のユニットに攻撃+{a}。この戦闘で残り{left}回。',
   '먹이기(이번 턴의 버리기 대신): 손의 카드를 여기나 내 덤불에 놓거나, 카드를 골라 누르세요. 수리 {n}, 필드의 내 유닛 공격 +{a}. 이번 전투에 {left}번 남음.']),
 ('Pick a card in your hand first, then tap Feed (or drag the card onto Feed or your bramble).', [
   'Choisissez d’abord une carte de votre main, puis touchez Nourrir (ou faites glisser la carte sur Nourrir ou votre roncier).',
   'Wähle zuerst eine Karte auf deiner Hand, dann tippe auf Füttern (oder zieh die Karte auf Füttern oder deine Dornenhecke).',
   'Elige primero una carta de tu mano y toca Alimentar (o arrastra la carta a Alimentar o a tu zarzal).',
   'Scegli prima una carta della mano, poi tocca Nutrire (o trascina la carta su Nutrire o sul tuo rovo).',
   'Escolhe primeiro uma carta da mão e toca em Alimentar (ou arrasta a carta para Alimentar ou para o teu silvado).',
   'Pumili muna ng kard sa iyong kamay, saka pindutin ang Pakainin (o i-drag ang kard sa Pakainin o sa iyong dawag).',
   'முதலில் உன் கையிலுள்ள ஓர் அட்டையைத் தேர்ந்தெடு, பின் ஊட்டு என்பதைத் தட்டு (அல்லது அட்டையை ஊட்டு அல்லது உன் முட்புதர் மீது இழு).',
   'Pilih dulu satu kartu di tanganmu, lalu ketuk Beri Makan (atau seret kartu ke Beri Makan atau semakmu).',
   '先选中一张手牌，再点按“喂食”（或把牌拖到“喂食”或你的荆棘丛上）。', '先選取一張手牌，再點按「餵食」（或把牌拖到「餵食」或你的荊棘叢上）。',
   'まず手札を1枚選び、餌やりをタップ（またはカードを餌やりかあなたのいばらにドラッグ）。', '먼저 손의 카드를 고른 뒤 먹이기를 누르세요(또는 카드를 먹이기나 내 덤불로 끌어다 놓으세요).']),
 ('🍖 The bramble eats {name}: Repair {n}, your units on the field +{a} Attack ({left} feeds left).', [
   '🍖 Le roncier mange {name} : Réparation {n}, vos unités sur le terrain +{a} Attaque (encore {left}).',
   '🍖 Die Dornenhecke frisst {name}: Reparatur {n}, deine Einheiten auf dem Feld +{a} Angriff (noch {left}).',
   '🍖 El zarzal se come {name}: Reparar {n}, tus unidades en el campo +{a} Ataque (quedan {left}).',
   '🍖 Il rovo mangia {name}: Riparazione {n}, le tue unità in campo +{a} Attacco (ne restano {left}).',
   '🍖 O silvado come {name}: Reparar {n}, as tuas unidades em campo +{a} Ataque (restam {left}).',
   '🍖 Kinain ng dawag ang {name}: Ayusin {n}, iyong mga yunit sa larangan +{a} Atake ({left} na lang).',
   '🍖 முட்புதர் {name}-ஐத் தின்கிறது: பழுதுபார் {n}, களத்திலுள்ள உன் அலகுகள் +{a} தாக்குதல் (இன்னும் {left}).',
   '🍖 Semak memakan {name}: Perbaiki {n}, unitmu di medan +{a} Serangan (sisa {left}).',
   '🍖 荆棘丛吃掉了 {name}：修复 {n}，你场上的单位 +{a} 攻击（还剩 {left} 次）。', '🍖 荊棘叢吃掉了 {name}：修復 {n}，你場上的單位 +{a} 攻擊（還剩 {left} 次）。',
   '🍖 いばらが{name}を食べた：修復{n}、場のユニットに攻撃+{a}（残り{left}回）。', '🍖 덤불이 {name}을(를) 먹었습니다: 수리 {n}, 필드의 내 유닛 공격 +{a} (남은 횟수 {left}).']),
 ('Aimed Bolt', ['Trait visé', 'Gezielter Bolzen', 'Virote apuntado', 'Dardo mirato', 'Virote apontado', 'Asintadong Bolt', 'குறிவைத்த அம்பு', 'Baut Terarah', '瞄准弩矢', '瞄準弩矢', '狙いボルト', '조준 볼트']),
 ("Aimed Bolt: once a fight, on your turn, pick an enemy column: {n} damage to the unit there (their bramble if it is empty). It doesn't use your play.", [
   'Trait visé : une fois par combat, à votre tour, choisissez une colonne ennemie : {n} dégâts à l’unité qui s’y trouve (à leur roncier si elle est vide). Cela n’utilise pas votre action.',
   'Gezielter Bolzen: einmal pro Kampf, in deinem Zug, wähle eine gegnerische Spalte: {n} Schaden an der Einheit dort (an ihrer Dornenhecke, wenn sie leer ist). Es verbraucht deinen Zug nicht.',
   'Virote apuntado: una vez por combate, en tu turno, elige una columna enemiga: {n} de daño a la unidad allí (a su zarzal si está vacía). No gasta tu jugada.',
   'Dardo mirato: una volta a scontro, nel tuo turno, scegli una colonna nemica: {n} danni all’unità lì (al loro rovo se è vuota). Non usa la tua giocata.',
   'Virote apontado: uma vez por combate, no teu turno, escolhe uma coluna inimiga: {n} de dano à unidade lá (ao silvado deles se estiver vazia). Não gasta a tua jogada.',
   'Asintadong Bolt: minsan bawat laban, sa iyong turn, pumili ng kolum ng kaaway: {n} pinsala sa yunit doon (sa kanilang dawag kung bakante). Hindi nito ginagamit ang iyong laro.',
   'குறிவைத்த அம்பு: ஒரு சண்டைக்கு ஒருமுறை, உன் முறையில், எதிரியின் ஒரு நெடுவரிசையைத் தேர்ந்தெடு: அங்குள்ள அலகுக்கு {n} சேதம் (காலியாக இருந்தால் அவர்கள் முட்புதருக்கு). இது உன் ஆட்டத்தைச் செலவழிக்காது.',
   'Baut Terarah: sekali per pertarungan, pada giliranmu, pilih satu kolom musuh: {n} kerusakan ke unit di sana (ke semak mereka bila kosong). Tidak memakai aksimu.',
   '瞄准弩矢：每场战斗一次，在你的回合选择一条敌方纵列：对那里的单位造成 {n} 伤害（若空着则打他们的荆棘丛）。不占用你的出牌。',
   '瞄準弩矢：每場戰鬥一次，在你的回合選擇一條敵方縱列：對那裡的單位造成 {n} 傷害（若空著則打他們的荊棘叢）。不占用你的出牌。',
   '狙いボルト：1戦闘に1回、自分のターンに敵の列を選ぶ：そこのユニットに{n}ダメージ（空なら相手のいばら）。プレイは消費しない。',
   '조준 볼트: 전투당 한 번, 내 턴에 적의 열을 고릅니다: 그곳의 유닛에 {n} 피해(비어 있으면 상대 덤불). 내 플레이를 쓰지 않습니다.']),
 ("Aimed Bolt {n}: once a fight. Pick an enemy column; it doesn't use your play.", [
   'Trait visé {n} : une fois par combat. Choisissez une colonne ennemie ; cela n’utilise pas votre action.', 'Gezielter Bolzen {n}: einmal pro Kampf. Wähle eine gegnerische Spalte; es verbraucht deinen Zug nicht.',
   'Virote apuntado {n}: una vez por combate. Elige una columna enemiga; no gasta tu jugada.', 'Dardo mirato {n}: una volta a scontro. Scegli una colonna nemica; non usa la tua giocata.',
   'Virote apontado {n}: uma vez por combate. Escolhe uma coluna inimiga; não gasta a tua jogada.', 'Asintadong Bolt {n}: minsan bawat laban. Pumili ng kolum ng kaaway; hindi nito ginagamit ang iyong laro.',
   'குறிவைத்த அம்பு {n}: ஒரு சண்டைக்கு ஒருமுறை. எதிரியின் நெடுவரிசையைத் தேர்ந்தெடு; இது உன் ஆட்டத்தைச் செலவழிக்காது.', 'Baut Terarah {n}: sekali per pertarungan. Pilih satu kolom musuh; tidak memakai aksimu.',
   '瞄准弩矢 {n}：每场战斗一次。选择一条敌方纵列；不占用你的出牌。', '瞄準弩矢 {n}：每場戰鬥一次。選擇一條敵方縱列；不占用你的出牌。',
   '狙いボルト {n}：1戦闘に1回。敵の列を選ぶ。プレイは消費しない。', '조준 볼트 {n}: 전투당 한 번. 적의 열을 고르세요. 내 플레이를 쓰지 않습니다.']),
 ('Pick a column for the Aimed Bolt', ['Choisissez une colonne pour le Trait visé', 'Wähle eine Spalte für den Gezielten Bolzen', 'Elige una columna para el Virote apuntado', 'Scegli una colonna per il Dardo mirato', 'Escolhe uma coluna para o Virote apontado', 'Pumili ng kolum para sa Asintadong Bolt', 'குறிவைத்த அம்புக்கு ஒரு நெடுவரிசையைத் தேர்ந்தெடு', 'Pilih kolom untuk Baut Terarah', '为瞄准弩矢选择一条纵列', '為瞄準弩矢選擇一條縱列', '狙いボルトの列を選ぶ', '조준 볼트를 쏠 열을 고르세요']),
 ('Their bramble (an empty column)', ['Leur roncier (une colonne vide)', 'Ihre Dornenhecke (eine leere Spalte)', 'Su zarzal (una columna vacía)', 'Il loro rovo (una colonna vuota)', 'O silvado deles (uma coluna vazia)', 'Ang kanilang dawag (bakanteng kolum)', 'அவர்கள் முட்புதர் (காலி நெடுவரிசை)', 'Semak mereka (kolom kosong)', '他们的荆棘丛（空纵列）', '他們的荊棘叢（空縱列）', '相手のいばら（空の列）', '상대 덤불(빈 열)']),
 ('No target.', ['Aucune cible.', 'Kein Ziel.', 'Sin objetivo.', 'Nessun bersaglio.', 'Sem alvo.', 'Walang target.', 'இலக்கு இல்லை.', 'Tidak ada sasaran.', '没有目标。', '沒有目標。', '対象なし。', '대상 없음.']),
 ('🎯 The Aimed Bolt hits {name} for {n}.', ['🎯 Le Trait visé touche {name} pour {n}.', '🎯 Der Gezielte Bolzen trifft {name} für {n}.', '🎯 El Virote apuntado golpea a {name} por {n}.', '🎯 Il Dardo mirato colpisce {name} per {n}.', '🎯 O Virote apontado acerta {name} por {n}.', '🎯 Tinamaan ng Asintadong Bolt ang {name} ng {n}.', '🎯 குறிவைத்த அம்பு {name}-ஐ {n} அளவு தாக்குகிறது.', '🎯 Baut Terarah mengenai {name} sebesar {n}.', '🎯 瞄准弩矢命中 {name}，造成 {n}。', '🎯 瞄準弩矢命中 {name}，造成 {n}。', '🎯 狙いボルトが{name}に{n}命中。', '🎯 조준 볼트가 {name}에 {n} 명중.']),
 ('🎯 The Aimed Bolt hits the enemy bramble for {n}.', ['🎯 Le Trait visé touche le roncier ennemi pour {n}.', '🎯 Der Gezielte Bolzen trifft die gegnerische Dornenhecke für {n}.', '🎯 El Virote apuntado golpea el zarzal enemigo por {n}.', '🎯 Il Dardo mirato colpisce il rovo nemico per {n}.', '🎯 O Virote apontado acerta o silvado inimigo por {n}.', '🎯 Tinamaan ng Asintadong Bolt ang dawag ng kaaway ng {n}.', '🎯 குறிவைத்த அம்பு எதிரி முட்புதரை {n} அளவு தாக்குகிறது.', '🎯 Baut Terarah mengenai semak musuh sebesar {n}.', '🎯 瞄准弩矢命中敌方荆棘丛，造成 {n}。', '🎯 瞄準弩矢命中敵方荊棘叢，造成 {n}。', '🎯 狙いボルトが敵のいばらに{n}命中。', '🎯 조준 볼트가 적 덤불에 {n} 명중.']),
 ('Rodentia', ['Rongeurs', 'Nagetiere', 'Roedores', 'Roditori', 'Roedores', 'Rodentia', 'கொறிணிகள்', 'Rodentia', '啮齿目', '齧齒目', '齧歯目', '설치목']),
]
ph = lambda s: sorted(set(re.findall(r'\{\w+\}', s)))
def dump(path, d):
    with open(path, 'w', encoding='utf-8') as fh:
        json.dump(d, fh, ensure_ascii=False, indent=1); fh.write('\n')
added = 0
# The log lines open with an emoji; the page translator also looks up the text after it (tests/i18n-templates-2026-10-18.js), so a line
# that opens with "🎯 " / "🍖 " / "🐾 " / "⏩ " gets a second row without it. ENG22's Fortify log line (🏯) gets its own the same way.
EMO = re.compile(r'^(🎯|🍖|🐾|⏩|🏯) ')
FORTIFY = '🏯 {name} fortifies its bramble: {x}.'
for i, code in enumerate(CODES):
    path = os.path.join(ROOT, 'lang', code + '.json'); pack = json.load(open(path, encoding='utf-8'))
    rows = list(T) + ([(FORTIFY, [pack[FORTIFY]] * 12)] if FORTIFY in pack else [])
    for en, row in rows:
        assert len(row) == 12 and ph(en) == ph(row[i]), (code, en)
        if en not in pack: added += 1
        pack.setdefault(en, row[i])
        if EMO.match(en) and EMO.match(row[i]):
            bare = EMO.sub('', en)
            if bare not in pack: added += 1
            pack.setdefault(bare, EMO.sub('', row[i]))
    dump(path, pack)
print('ok: %d rows added across %d packs' % (added, len(CODES)))
