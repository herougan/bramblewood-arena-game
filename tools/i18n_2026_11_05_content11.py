#!/usr/bin/env python3
"""Package CONTENT11 (2026-11-05; owner 11-04 22:34: NUDI-1, IDEA-VREGIA, IDEA-EARLY-2): the two new cards' names (lang/cards/<code>.json) and
flavour lines (lang/ui/<code>.json), and the eleven boss gimmicks' names, rules and log lines (lang/<code>.json, keyed by the English text of
the TX keys 'ui.c11-*' in bramblewood-texts.js). One row per English text; rows that exist are kept, new rows are appended, nothing is sorted.
Tagalog, Tamil and Indonesian deserve a native read.
    python3 tools/i18n_2026_11_05_content11.py   (idempotent)"""
import json, os, unicodedata
ROOT = os.path.join(os.path.dirname(os.path.abspath(__file__)), '..')
CODES = ['fr', 'de', 'es', 'it', 'pt', 'tl', 'ta', 'id', 'zh-Hans', 'zh-Hant', 'ja', 'ko']

NAMES = [
 ('Nudibranch', ['Nudibranche', 'Nacktkiemer', 'Nudibranquio', 'Nudibranco', 'Nudibrânquio', 'Nudibranch', 'நுடிபிராங்க்', 'Nudibranch', '海蛞蝓', '海蛞蝓', 'ウミウシ', '갯민숭달팽이']),
 ('Victoria Regia', ['Victoria regia', 'Victoria Regia', 'Victoria regia', 'Victoria regia', 'Vitória-régia', 'Victoria Regia', 'விக்டோரியா ரெஜியா', 'Victoria Regia', '王莲', '王蓮', 'オオオニバス', '빅토리아 수련']),
]
FLAVOR = [
 ('It grazes on things that sting and keeps the stings for itself. The bright colours are a promise.', [
   'Il broute ce qui pique et garde les piqûres pour lui. Ses couleurs vives sont une promesse.',
   'Es weidet Dinge ab, die nesseln, und behält die Nesseln für sich. Die bunten Farben sind ein Versprechen.',
   'Pasta sobre lo que pica y se queda los aguijones. Sus colores vivos son una promesa.',
   'Bruca ciò che punge e tiene per sé le punture. I colori vivaci sono una promessa.',
   'Pasta no que pica e guarda as picadas para si. As cores vivas são uma promessa.',
   'Kinakain nito ang mga bagay na nanunusok at iniingatan ang mga tusok para sa sarili. Pangako ang matingkad nitong kulay.',
   'கொட்டுபவற்றை மேய்ந்து, அந்தக் கொடுக்குகளைத் தனக்கே வைத்துக்கொள்கிறது. அதன் பளிச்சிடும் நிறங்கள் ஒரு வாக்குறுதி.',
   'Ia memakan makhluk penyengat dan menyimpan sengatnya untuk dirinya. Warnanya yang cerah adalah janji.',
   '它啃食会蜇人的东西，把那些刺留给自己。鲜艳的颜色是一种承诺。',
   '牠啃食會螫人的東西，把那些刺留給自己。鮮豔的顏色是一種承諾。',
   '刺すものを食べ、その針を自分のものにする。鮮やかな色は約束だ。',
   '쏘는 것들을 뜯어 먹고 그 침을 제 것으로 삼는다. 화려한 색은 일종의 약속이다.']),
 ('Its new leaf comes up folded like a fist and shoves the old ones aside. Then it opens, and the underside is all thorns.', [
   'Sa nouvelle feuille monte pliée comme un poing et écarte les anciennes. Puis elle s’ouvre, et son revers n’est qu’épines.',
   'Sein neues Blatt steigt gefaltet wie eine Faust auf und schiebt die alten beiseite. Dann öffnet es sich, und die Unterseite ist voller Dornen.',
   'Su hoja nueva sube plegada como un puño y aparta las viejas. Luego se abre, y el envés es todo espinas.',
   'La sua foglia nuova sale piegata come un pugno e spinge via le vecchie. Poi si apre, e il rovescio è tutto spine.',
   'A folha nova sobe dobrada como um punho e empurra as velhas para o lado. Depois abre-se, e o avesso é só espinhos.',
   'Umaahon ang bago nitong dahon na nakatiklop na parang kamao at itinutulak ang mga luma. Saka ito bumubuka, at puro tinik ang ilalim.',
   'அதன் புதிய இலை முஷ்டி போல் மடிந்து எழுந்து பழையவற்றை ஒதுக்கித் தள்ளுகிறது. பின் விரிகிறது; அடிப்பக்கம் முழுதும் முட்கள்.',
   'Daun barunya muncul terlipat seperti kepalan dan menyingkirkan daun-daun lama. Lalu ia membuka, dan bagian bawahnya penuh duri.',
   '它的新叶像拳头一样卷着冒出水面，把旧叶推到一旁。然后它展开，叶背满是尖刺。',
   '它的新葉像拳頭一樣捲著冒出水面，把舊葉推到一旁。然後它展開，葉背滿是尖刺。',
   '新しい葉は拳のように畳まれて浮かび、古い葉を押しのける。それから開くと、裏は棘だらけだ。',
   '새 잎은 주먹처럼 접힌 채 올라와 묵은 잎들을 밀어낸다. 그러고 펼치면, 뒷면은 온통 가시다.']),
]
UI = [
 ('Cold Snap', ['Coup de froid', 'Kälteeinbruch', 'Ola de frío', 'Gelata improvvisa', 'Vaga de frio', 'Biglang Lamig', 'திடீர் குளிர்', 'Cuaca Dingin Mendadak', '寒流', '寒流', '寒波', '한파']),
 ('Every 3rd round, the newest unit on each side freezes for a round.', [
   'Tous les 3 tours, l’unité la plus récente de chaque camp gèle pour un tour.',
   'Jede 3. Runde friert die neueste Einheit jeder Seite für eine Runde ein.',
   'Cada 3 rondas, la unidad más nueva de cada lado se congela durante una ronda.',
   'Ogni 3 round, l’unità più recente di ogni lato si congela per un round.',
   'A cada 3 rondas, a unidade mais recente de cada lado congela durante uma ronda.',
   'Tuwing ika-3 round, nagyeyelo nang isang round ang pinakabagong yunit sa bawat panig.',
   'ஒவ்வொரு 3-வது சுற்றிலும், இரு பக்கத்திலும் புதிதாக வந்த அலகு ஒரு சுற்றுக்கு உறைகிறது.',
   'Setiap ronde ke-3, unit terbaru di tiap pihak membeku selama satu ronde.',
   '每第3回合，双方最新上场的单位冻结一回合。',
   '每第3回合，雙方最新上場的單位凍結一回合。',
   '3ラウンドごとに、両陣営の最も新しいユニットが1ラウンド凍りつく。',
   '3라운드마다 양쪽에서 가장 최근에 나온 유닛이 한 라운드 동안 얼어붙습니다.']),
 ('❄️ Cold Snap: {name} freezes.', ['❄️ Coup de froid : {name} gèle.', '❄️ Kälteeinbruch: {name} friert ein.', '❄️ Ola de frío: {name} se congela.', '❄️ Gelata improvvisa: {name} si congela.', '❄️ Vaga de frio: {name} congela.', '❄️ Biglang Lamig: nagyelo si {name}.', '❄️ திடீர் குளிர்: {name} உறைகிறது.', '❄️ Cuaca Dingin Mendadak: {name} membeku.', '❄️ 寒流：{name} 被冻住了。', '❄️ 寒流：{name} 被凍住了。', '❄️ 寒波：{name}が凍りついた。', '❄️ 한파: {name}이(가) 얼어붙었습니다.']),
 ('Thistle Prick', ['Piqûre de chardon', 'Distelstich', 'Pinchazo de cardo', 'Puntura di cardo', 'Picada de cardo', 'Tusok ng Tistel', 'முட்செடி குத்தல்', 'Tusukan Duri', '蓟刺', '薊刺', 'アザミの棘', '엉겅퀴 가시']),
 ('Every 3rd round, his thistles prick your unit with the most Health: 1 damage.', [
   'Tous les 3 tours, ses chardons piquent votre unité qui a le plus de Santé : 1 dégât.',
   'Jede 3. Runde stechen seine Disteln deine Einheit mit der meisten Gesundheit: 1 Schaden.',
   'Cada 3 rondas, sus cardos pinchan a tu unidad con más Salud: 1 de daño.',
   'Ogni 3 round, i suoi cardi pungono la tua unità con più Salute: 1 danno.',
   'A cada 3 rondas, os seus cardos picam a tua unidade com mais Vida: 1 de dano.',
   'Tuwing ika-3 round, tinutusok ng kanyang mga tistel ang yunit mong may pinakamaraming Buhay: 1 pinsala.',
   'ஒவ்வொரு 3-வது சுற்றிலும், அவனது முட்செடிகள் அதிக உயிர் கொண்ட உன் அலகைக் குத்துகின்றன: 1 சேதம்.',
   'Setiap ronde ke-3, durinya menusuk unitmu yang Nyawanya paling banyak: 1 kerusakan.',
   '每第3回合，他的蓟刺扎你生命最高的单位：1点伤害。',
   '每第3回合，他的薊刺扎你生命最高的單位：1點傷害。',
   '3ラウンドごとに、彼のアザミが体力の最も多いあなたのユニットを刺す：1ダメージ。',
   '3라운드마다 그의 엉겅퀴가 체력이 가장 높은 당신의 유닛을 찌릅니다: 피해 1.']),
 ('🌾 Thistle Prick: {name} takes {n}.', ['🌾 Piqûre de chardon : {name} subit {n}.', '🌾 Distelstich: {name} erleidet {n}.', '🌾 Pinchazo de cardo: {name} recibe {n}.', '🌾 Puntura di cardo: {name} subisce {n}.', '🌾 Picada de cardo: {name} sofre {n}.', '🌾 Tusok ng Tistel: tinamaan si {name} ng {n}.', '🌾 முட்செடி குத்தல்: {name} {n} சேதம் பெறுகிறது.', '🌾 Tusukan Duri: {name} terkena {n}.', '🌾 蓟刺：{name} 受到 {n} 点伤害。', '🌾 薊刺：{name} 受到 {n} 點傷害。', '🌾 アザミの棘：{name}に{n}ダメージ。', '🌾 엉겅퀴 가시: {name}이(가) {n} 피해를 입었습니다.']),
 ('Shell Up', ['Repli dans la carapace', 'Panzer zu', 'Al caparazón', 'Nel guscio', 'Na carapaça', 'Sa Loob ng Bao', 'ஓட்டுக்குள்', 'Masuk Cangkang', '缩壳', '縮殼', '甲羅ごもり', '등껍질 숨기']),
 ('Hit its bramble twice in one round and it hides in its shell: +3 Shield.', [
   'Frappez sa ronce deux fois en un tour et elle se cache dans sa carapace : +3 Bouclier.',
   'Triff sein Dorngestrüpp zweimal in einer Runde, und es verkriecht sich in seinem Panzer: +3 Schild.',
   'Golpea su zarza dos veces en una ronda y se esconde en su caparazón: +3 Escudo.',
   'Colpisci il suo rovo due volte in un round e si nasconde nel guscio: +3 Scudo.',
   'Acerta no seu silvado duas vezes numa ronda e esconde-se na carapaça: +3 Escudo.',
   'Tamaan nang dalawang beses sa isang round ang bramble nito at magtatago ito sa bao: +3 Kalasag.',
   'ஒரே சுற்றில் அதன் முட்புதரை இருமுறை தாக்கினால் அது ஓட்டுக்குள் ஒளிகிறது: +3 கேடயம்.',
   'Pukul semaknya dua kali dalam satu ronde dan ia bersembunyi di cangkangnya: +3 Perisai.',
   '一回合内击中它的荆棘两次，它就会缩进壳里：+3 护盾。',
   '一回合內擊中牠的荊棘兩次，牠就會縮進殼裡：+3 護盾。',
   '1ラウンドにイバラを2回叩くと、甲羅にこもる：シールド+3。',
   '한 라운드에 가시덤불을 두 번 때리면 등껍질에 숨습니다: 보호막 +3.']),
 ('🐢 Shell Up: the bramble hides in its shell, +{n} Shield.', ['🐢 Repli : la ronce se cache dans sa carapace, +{n} Bouclier.', '🐢 Panzer zu: das Dorngestrüpp verkriecht sich, +{n} Schild.', '🐢 Al caparazón: la zarza se esconde, +{n} Escudo.', '🐢 Nel guscio: il rovo si nasconde, +{n} Scudo.', '🐢 Na carapaça: o silvado esconde-se, +{n} Escudo.', '🐢 Sa Loob ng Bao: nagtago ang bramble, +{n} Kalasag.', '🐢 ஓட்டுக்குள்: முட்புதர் ஒளிகிறது, +{n} கேடயம்.', '🐢 Masuk Cangkang: semak bersembunyi, +{n} Perisai.', '🐢 缩壳：荆棘缩进壳里，+{n} 护盾。', '🐢 縮殼：荊棘縮進殼裡，+{n} 護盾。', '🐢 甲羅ごもり：イバラが甲羅にこもった、シールド+{n}。', '🐢 등껍질 숨기: 가시덤불이 숨었습니다, 보호막 +{n}.']),
 ("The Queen's Dive", ['Le piqué de la Reine', 'Sturzflug der Königin', 'El picado de la Reina', 'La picchiata della Regina', 'O mergulho da Rainha', 'Sisid ng Reyna', 'அரசியின் பாய்ச்சல்', 'Tukikan Sang Ratu', '女王俯冲', '女王俯衝', '女王の急降下', '여왕의 급강하']),
 ('Every 3rd round, she dives on the unit at one end of your row: 3 damage. Left end first, then right.', [
   'Tous les 3 tours, elle pique sur l’unité au bout de votre rangée : 3 dégâts. D’abord le bout gauche, puis le droit.',
   'Jede 3. Runde stürzt sie sich auf die Einheit am Ende deiner Reihe: 3 Schaden. Erst das linke Ende, dann das rechte.',
   'Cada 3 rondas, se lanza en picado sobre la unidad de un extremo de tu fila: 3 de daño. Primero el izquierdo, luego el derecho.',
   'Ogni 3 round, si getta in picchiata sull’unità a un’estremità della tua fila: 3 danni. Prima a sinistra, poi a destra.',
   'A cada 3 rondas, mergulha sobre a unidade numa ponta da tua fila: 3 de dano. Primeiro a ponta esquerda, depois a direita.',
   'Tuwing ika-3 round, sumisisid siya sa yunit sa dulo ng hanay mo: 3 pinsala. Unang kaliwang dulo, saka kanan.',
   'ஒவ்வொரு 3-வது சுற்றிலும், உன் வரிசையின் ஓர் ஓரத்தில் உள்ள அலகின் மீது அவள் பாய்கிறாள்: 3 சேதம். முதலில் இடது ஓரம், பின் வலது.',
   'Setiap ronde ke-3, ia menukik ke unit di ujung barisanmu: 3 kerusakan. Ujung kiri dulu, lalu kanan.',
   '每第3回合，她俯冲攻击你一排末端的单位：3点伤害。先左端，后右端。',
   '每第3回合，她俯衝攻擊你一排末端的單位：3點傷害。先左端，後右端。',
   '3ラウンドごとに、彼女はあなたの列の端のユニットに急降下する：3ダメージ。まず左端、次に右端。',
   '3라운드마다 그녀가 당신 줄 끝의 유닛에게 급강하합니다: 피해 3. 왼쪽 끝 먼저, 다음은 오른쪽.']),
 ('🪶 The Queen dives on {name}: {n} damage.', ['🪶 La Reine pique sur {name} : {n} dégâts.', '🪶 Die Königin stürzt sich auf {name}: {n} Schaden.', '🪶 La Reina se lanza sobre {name}: {n} de daño.', '🪶 La Regina piomba su {name}: {n} danni.', '🪶 A Rainha mergulha sobre {name}: {n} de dano.', '🪶 Sumisid ang Reyna kay {name}: {n} pinsala.', '🪶 அரசி {name} மீது பாய்கிறாள்: {n} சேதம்.', '🪶 Sang Ratu menukik ke {name}: {n} kerusakan.', '🪶 女王俯冲攻击 {name}：{n} 点伤害。', '🪶 女王俯衝攻擊 {name}：{n} 點傷害。', '🪶 女王が{name}に急降下：{n}ダメージ。', '🪶 여왕이 {name}에게 급강하: 피해 {n}.']),
 ('Undertow', ['Contre-courant', 'Sog', 'Resaca', 'Risacca', 'Ressaca', 'Hila ng Alon', 'அடி நீரோட்டம்', 'Arus Bawah', '暗流', '暗流', '引き波', '역류']),
 ('Every 2nd round, your unit with the most Attack is pulled under and skips the round.', [
   'Tous les 2 tours, votre unité qui a le plus d’Attaque est entraînée sous l’eau et passe le tour.',
   'Jede 2. Runde wird deine Einheit mit dem meisten Angriff unter Wasser gezogen und setzt die Runde aus.',
   'Cada 2 rondas, tu unidad con más Ataque es arrastrada al fondo y pierde la ronda.',
   'Ogni 2 round, la tua unità con più Attacco viene trascinata sott’acqua e salta il round.',
   'A cada 2 rondas, a tua unidade com mais Ataque é puxada para o fundo e perde a ronda.',
   'Tuwing ika-2 round, hinihila pailalim ang yunit mong may pinakamalakas na Atake at lalaktaw ito sa round.',
   'ஒவ்வொரு 2-வது சுற்றிலும், அதிகத் தாக்குதல் கொண்ட உன் அலகு கீழே இழுக்கப்பட்டு அந்தச் சுற்றைத் தவறவிடுகிறது.',
   'Setiap ronde ke-2, unitmu dengan Serangan terbesar ditarik ke bawah dan melewatkan ronde itu.',
   '每第2回合，你攻击最高的单位被拖入水下，跳过该回合。',
   '每第2回合，你攻擊最高的單位被拖入水下，跳過該回合。',
   '2ラウンドごとに、攻撃力の最も高いあなたのユニットが水中に引き込まれ、そのラウンドを休む。',
   '2라운드마다 공격력이 가장 높은 당신의 유닛이 물속으로 끌려가 그 라운드를 쉽니다.']),
 ('🌀 Undertow: {name} is pulled under.', ['🌀 Contre-courant : {name} est entraîné sous l’eau.', '🌀 Sog: {name} wird unter Wasser gezogen.', '🌀 Resaca: {name} es arrastrado al fondo.', '🌀 Risacca: {name} viene trascinato sott’acqua.', '🌀 Ressaca: {name} é puxado para o fundo.', '🌀 Hila ng Alon: hinila pailalim si {name}.', '🌀 அடி நீரோட்டம்: {name} கீழே இழுக்கப்படுகிறது.', '🌀 Arus Bawah: {name} ditarik ke bawah.', '🌀 暗流：{name} 被拖入水下。', '🌀 暗流：{name} 被拖入水下。', '🌀 引き波：{name}が水中に引き込まれた。', '🌀 역류: {name}이(가) 물속으로 끌려갔습니다.']),
 ('Snap Back', ['Riposte des mâchoires', 'Zurückschnappen', 'Mordisco de vuelta', 'Morso di risposta', 'Dentada de volta', 'Gantíng Kagat', 'திருப்பிக் கடி', 'Gigitan Balasan', '反咬', '反咬', '噛み返し', '되물기']),
 ('Each round, the bramble bites the last unit that hit it: 6 damage.', [
   'À chaque tour, la ronce mord la dernière unité qui l’a frappée : 6 dégâts.',
   'Jede Runde beißt das Dorngestrüpp die letzte Einheit, die es getroffen hat: 6 Schaden.',
   'Cada ronda, la zarza muerde a la última unidad que la golpeó: 6 de daño.',
   'Ogni round, il rovo morde l’ultima unità che l’ha colpito: 6 danni.',
   'A cada ronda, o silvado morde a última unidade que lhe acertou: 6 de dano.',
   'Bawat round, kinakagat ng bramble ang huling yunit na tumama rito: 6 pinsala.',
   'ஒவ்வொரு சுற்றிலும், தன்னைக் கடைசியாகத் தாக்கிய அலகை முட்புதர் கடிக்கிறது: 6 சேதம்.',
   'Setiap ronde, semak itu menggigit unit terakhir yang memukulnya: 6 kerusakan.',
   '每回合，荆棘咬住最后一个击中它的单位：6点伤害。',
   '每回合，荊棘咬住最後一個擊中牠的單位：6點傷害。',
   '毎ラウンド、イバラは最後に自分を叩いたユニットに噛みつく：6ダメージ。',
   '매 라운드 가시덤불이 마지막으로 자신을 때린 유닛을 뭅니다: 피해 6.']),
 ('🐊 Snap Back: {name} is bitten for {n}.', ['🐊 Riposte : {name} est mordu, {n} dégâts.', '🐊 Zurückschnappen: {name} wird gebissen, {n} Schaden.', '🐊 Mordisco de vuelta: {name} recibe un mordisco de {n}.', '🐊 Morso di risposta: {name} viene morso per {n}.', '🐊 Dentada de volta: {name} é mordido, {n} de dano.', '🐊 Gantíng Kagat: nakagat si {name}, {n} pinsala.', '🐊 திருப்பிக் கடி: {name} {n} சேதத்துடன் கடிக்கப்படுகிறது.', '🐊 Gigitan Balasan: {name} digigit, {n} kerusakan.', '🐊 反咬：{name} 被咬，{n} 点伤害。', '🐊 反咬：{name} 被咬，{n} 點傷害。', '🐊 噛み返し：{name}が噛まれた、{n}ダメージ。', '🐊 되물기: {name}이(가) 물렸습니다, 피해 {n}.']),
 ("Hare's Nap", ['La sieste du lièvre', 'Hasenschläfchen', 'La siesta de la liebre', 'Il pisolino della lepre', 'A sesta da lebre', 'Idlip ng Kuneho', 'முயலின் குட்டித் தூக்கம்', 'Tidur Siang Si Kelinci', '野兔打盹', '野兔打盹', '野ウサギの昼寝', '산토끼의 낮잠']),
 ("Every 5th round, the Old Hare's units nap through the round. A hit wakes one up.", [
   'Tous les 5 tours, les unités du Vieux Lièvre font la sieste pendant le tour. Un coup en réveille une.',
   'Jede 5. Runde verschlafen die Einheiten des Alten Hasen die Runde. Ein Treffer weckt eine auf.',
   'Cada 5 rondas, las unidades de la Vieja Liebre duermen la siesta toda la ronda. Un golpe despierta a una.',
   'Ogni 5 round, le unità della Vecchia Lepre fanno un pisolino per tutto il round. Un colpo ne sveglia una.',
   'A cada 5 rondas, as unidades da Velha Lebre dormem a sesta durante a ronda. Um golpe acorda uma.',
   'Tuwing ika-5 round, umiidlip buong round ang mga yunit ng Matandang Kuneho. Nagigising ang isa kapag natamaan.',
   'ஒவ்வொரு 5-வது சுற்றிலும், கிழ முயலின் அலகுகள் அந்தச் சுற்று முழுவதும் தூங்குகின்றன. ஒரு அடி ஒன்றை எழுப்பும்.',
   'Setiap ronde ke-5, unit-unit Kelinci Tua tidur siang sepanjang ronde. Satu pukulan membangunkan satu unit.',
   '每第5回合，老野兔的单位整回合都在打盹。受到攻击的会醒来。',
   '每第5回合，老野兔的單位整回合都在打盹。受到攻擊的會醒來。',
   '5ラウンドごとに、老いた野ウサギのユニットはそのラウンド中昼寝する。攻撃を受けたものは目を覚ます。',
   '5라운드마다 늙은 산토끼의 유닛들이 그 라운드 내내 낮잠을 잡니다. 맞은 유닛은 깨어납니다.']),
 ("💤 The Old Hare's side takes a nap.", ['💤 Le camp du Vieux Lièvre fait la sieste.', '💤 Die Seite des Alten Hasen hält ein Schläfchen.', '💤 El bando de la Vieja Liebre se echa la siesta.', '💤 Il lato della Vecchia Lepre fa un pisolino.', '💤 O lado da Velha Lebre faz a sesta.', '💤 Umiidlip ang panig ng Matandang Kuneho.', '💤 கிழ முயலின் பக்கம் குட்டித் தூக்கம் போடுகிறது.', '💤 Pihak Kelinci Tua tidur siang.', '💤 老野兔一方在打盹。', '💤 老野兔一方在打盹。', '💤 老いた野ウサギの陣営が昼寝をする。', '💤 늙은 산토끼 쪽이 낮잠을 잡니다.']),
 ('Lodge Repairs', ['Réparations du terrier', 'Burgreparatur', 'Reparaciones de la madriguera', 'Riparazioni della tana', 'Reparações da toca', 'Pag-aayos ng Lungga', 'கூட்டுப் பழுதுபார்ப்பு', 'Perbaikan Sarang', '巢穴修补', '巢穴修補', '巣の修繕', '굴 보수']),
 ('Every 2nd round, her most hurt unit is patched up: it heals 4.', [
   'Tous les 2 tours, son unité la plus blessée est rafistolée : elle soigne 4.',
   'Jede 2. Runde wird ihre am schwersten verletzte Einheit geflickt: sie heilt 4.',
   'Cada 2 rondas, su unidad más herida es remendada: se cura 4.',
   'Ogni 2 round, la sua unità più ferita viene rattoppata: cura 4.',
   'A cada 2 rondas, a sua unidade mais ferida é remendada: cura 4.',
   'Tuwing ika-2 round, tinatagpian ang pinakasugatan niyang yunit: gumagaling ito ng 4.',
   'ஒவ்வொரு 2-வது சுற்றிலும், அவளது மிகவும் காயமுற்ற அலகு சரிசெய்யப்படுகிறது: 4 குணமாகிறது.',
   'Setiap ronde ke-2, unitnya yang paling terluka ditambal: pulih 4.',
   '每第2回合，她伤得最重的单位被修补：恢复4点。',
   '每第2回合，她傷得最重的單位被修補：恢復4點。',
   '2ラウンドごとに、彼女の最も傷ついたユニットが修繕される：4回復。',
   '2라운드마다 그녀의 가장 다친 유닛이 수리됩니다: 4 회복.']),
 ('🦫 Lodge Repairs: {name} heals {n}.', ['🦫 Réparations : {name} soigne {n}.', '🦫 Burgreparatur: {name} heilt {n}.', '🦫 Reparaciones: {name} se cura {n}.', '🦫 Riparazioni: {name} cura {n}.', '🦫 Reparações: {name} cura {n}.', '🦫 Pag-aayos ng Lungga: gumaling si {name} ng {n}.', '🦫 கூட்டுப் பழுதுபார்ப்பு: {name} {n} குணமாகிறது.', '🦫 Perbaikan Sarang: {name} pulih {n}.', '🦫 巢穴修补：{name} 恢复 {n}。', '🦫 巢穴修補：{name} 恢復 {n}。', '🦫 巣の修繕：{name}が{n}回復。', '🦫 굴 보수: {name}이(가) {n} 회복했습니다.']),
 ('Ink Cloud', ['Nuage d’encre', 'Tintenwolke', 'Nube de tinta', 'Nube d’inchiostro', 'Nuvem de tinta', 'Ulap ng Tinta', 'மை மேகம்', 'Awan Tinta', '墨云', '墨雲', '墨の雲', '먹물 구름']),
 ('Every 3rd round, ink blinds one random unit on each side for a round.', [
   'Tous les 3 tours, l’encre aveugle une unité au hasard de chaque camp pendant un tour.',
   'Jede 3. Runde blendet Tinte eine zufällige Einheit jeder Seite für eine Runde.',
   'Cada 3 rondas, la tinta ciega a una unidad al azar de cada lado durante una ronda.',
   'Ogni 3 round, l’inchiostro acceca un’unità a caso di ogni lato per un round.',
   'A cada 3 rondas, a tinta cega uma unidade ao acaso de cada lado durante uma ronda.',
   'Tuwing ika-3 round, binubulag ng tinta ang isang random na yunit sa bawat panig nang isang round.',
   'ஒவ்வொரு 3-வது சுற்றிலும், இரு பக்கத்திலும் ஒரு சீரற்ற அலகை மை ஒரு சுற்றுக்குக் குருடாக்குகிறது.',
   'Setiap ronde ke-3, tinta membutakan satu unit acak di tiap pihak selama satu ronde.',
   '每第3回合，墨汁让双方各一个随机单位失明一回合。',
   '每第3回合，墨汁讓雙方各一個隨機單位失明一回合。',
   '3ラウンドごとに、墨が両陣営のランダムなユニット1体を1ラウンド盲目にする。',
   '3라운드마다 먹물이 양쪽에서 무작위 유닛 하나씩을 한 라운드 동안 실명시킵니다.']),
 ('🐙 Ink Cloud: {name} is Blind.', ['🐙 Nuage d’encre : {name} est aveuglé.', '🐙 Tintenwolke: {name} ist geblendet.', '🐙 Nube de tinta: {name} está ciego.', '🐙 Nube d’inchiostro: {name} è accecato.', '🐙 Nuvem de tinta: {name} está cego.', '🐙 Ulap ng Tinta: bulag si {name}.', '🐙 மை மேகம்: {name} குருடாகிறது.', '🐙 Awan Tinta: {name} buta.', '🐙 墨云：{name} 失明了。', '🐙 墨雲：{name} 失明了。', '🐙 墨の雲：{name}は盲目になった。', '🐙 먹물 구름: {name}이(가) 실명했습니다.']),
 ('Root Grip', ['Étreinte des racines', 'Wurzelgriff', 'Agarre de raíces', 'Presa delle radici', 'Aperto das raízes', 'Kapit ng Ugat', 'வேர்ப் பிடி', 'Cengkeraman Akar', '根缚', '根縛', '根の締めつけ', '뿌리 옭죄기']),
 ('Every 4th round, roots tangle the unit with the most Health on each side.', [
   'Tous les 4 tours, des racines entravent l’unité qui a le plus de Santé dans chaque camp.',
   'Jede 4. Runde verstricken Wurzeln die Einheit mit der meisten Gesundheit auf jeder Seite.',
   'Cada 4 rondas, las raíces enredan a la unidad con más Salud de cada lado.',
   'Ogni 4 round, le radici avvinghiano l’unità con più Salute di ogni lato.',
   'A cada 4 rondas, as raízes enredam a unidade com mais Vida de cada lado.',
   'Tuwing ika-4 round, pinupulupot ng mga ugat ang yunit na may pinakamaraming Buhay sa bawat panig.',
   'ஒவ்வொரு 4-வது சுற்றிலும், இரு பக்கத்திலும் அதிக உயிர் கொண்ட அலகை வேர்கள் சிக்கவைக்கின்றன.',
   'Setiap ronde ke-4, akar melilit unit dengan Nyawa terbanyak di tiap pihak.',
   '每第4回合，树根缠住双方生命最高的单位。',
   '每第4回合，樹根纏住雙方生命最高的單位。',
   '4ラウンドごとに、根が両陣営の体力の最も多いユニットに絡みつく。',
   '4라운드마다 뿌리가 양쪽에서 체력이 가장 높은 유닛을 휘감습니다.']),
 ('🌿 Root Grip: {name} is Tangled.', ['🌿 Étreinte des racines : {name} est entravé.', '🌿 Wurzelgriff: {name} ist verstrickt.', '🌿 Agarre de raíces: {name} está enredado.', '🌿 Presa delle radici: {name} è avvinghiato.', '🌿 Aperto das raízes: {name} está enredado.', '🌿 Kapit ng Ugat: napulupot si {name}.', '🌿 வேர்ப் பிடி: {name} சிக்கியது.', '🌿 Cengkeraman Akar: {name} terlilit.', '🌿 根缚：{name} 被缠住了。', '🌿 根縛：{name} 被纏住了。', '🌿 根の締めつけ：{name}が絡め取られた。', '🌿 뿌리 옭죄기: {name}이(가) 휘감겼습니다.']),
 ('Cracking Bark', ['Écorce fendue', 'Rissige Rinde', 'Corteza agrietada', 'Corteccia spaccata', 'Casca rachada', 'Bitak na Balat', 'வெடிக்கும் பட்டை', 'Kulit Kayu Retak', '裂树皮', '裂樹皮', 'ひび割れる樹皮', '갈라지는 껍질']),
 ('Every 3rd round, its old bark cracks: it loses half its Shield.', [
   'Tous les 3 tours, sa vieille écorce se fend : elle perd la moitié de son Bouclier.',
   'Jede 3. Runde reißt seine alte Rinde: es verliert die Hälfte seines Schildes.',
   'Cada 3 rondas, su vieja corteza se agrieta: pierde la mitad de su Escudo.',
   'Ogni 3 round, la sua vecchia corteccia si spacca: perde metà dello Scudo.',
   'A cada 3 rondas, a sua velha casca racha: perde metade do Escudo.',
   'Tuwing ika-3 round, nabibitak ang luma nitong balat: nawawala ang kalahati ng Kalasag nito.',
   'ஒவ்வொரு 3-வது சுற்றிலும், அதன் பழைய பட்டை வெடிக்கிறது: அதன் கேடயத்தில் பாதி போகிறது.',
   'Setiap ronde ke-3, kulit kayunya yang tua retak: ia kehilangan separuh Perisainya.',
   '每第3回合，它的老树皮裂开：失去一半护盾。',
   '每第3回合，它的老樹皮裂開：失去一半護盾。',
   '3ラウンドごとに、古い樹皮がひび割れる：シールドの半分を失う。',
   '3라운드마다 낡은 껍질이 갈라집니다: 보호막의 절반을 잃습니다.']),
 ('🌳 Cracking Bark: the bramble loses {n} Shield.', ['🌳 Écorce fendue : la ronce perd {n} Bouclier.', '🌳 Rissige Rinde: das Dorngestrüpp verliert {n} Schild.', '🌳 Corteza agrietada: la zarza pierde {n} de Escudo.', '🌳 Corteccia spaccata: il rovo perde {n} Scudo.', '🌳 Casca rachada: o silvado perde {n} de Escudo.', '🌳 Bitak na Balat: nawalan ang bramble ng {n} Kalasag.', '🌳 வெடிக்கும் பட்டை: முட்புதர் {n} கேடயம் இழக்கிறது.', '🌳 Kulit Kayu Retak: semak kehilangan {n} Perisai.', '🌳 裂树皮：荆棘失去 {n} 护盾。', '🌳 裂樹皮：荊棘失去 {n} 護盾。', '🌳 ひび割れる樹皮：イバラがシールドを{n}失った。', '🌳 갈라지는 껍질: 가시덤불이 보호막 {n}을(를) 잃었습니다.']),
 ('Boss', ['Boss', 'Boss', 'Jefe', 'Boss', 'Chefe', 'Boss', 'தலைவன்', 'Bos', '首领', '首領', 'ボス', '보스']),
]


def load(p):
    with open(p, encoding='utf-8') as fh:
        return json.load(fh)


def dump(p, d):
    with open(p, 'w', encoding='utf-8') as fh:
        json.dump(d, fh, ensure_ascii=False, indent=1); fh.write('\n')


def core(t):
    # the runtime keys a text by its core: the leading emoji and a trailing colon are not part of the key (tests/i18n-templates-2026-10-18.js core)
    t = t.strip()
    while t and (unicodedata.category(t[0]) in ('So', 'Sk', 'Cf', 'Mn') or t[0] in ' \ufe0f\u200d'):
        t = t[1:]
    return t.rstrip(' :')


def main():
    for rows in (NAMES, FLAVOR, UI):
        for en, tr in rows:
            assert len(tr) == 12, en
            if '{' in en:
                for t in tr:
                    for ph in ('{name}', '{n}'):
                        assert (ph in en) == (ph in t), (en, t)
    stats = {}
    for i, code in enumerate(CODES):
        paths = {w: os.path.join(ROOT, 'lang', *(([w] if w else []) + [code + '.json'])) for w in ('', 'cards', 'ui')}
        packs = {w: load(p) for w, p in paths.items()}
        added = 0
        for rows, where in ((NAMES, 'cards'), (FLAVOR, 'ui'), (UI, '')):
            for en, tr in rows:
                if en != core(en):  # a log line: keyed by its core (an earlier run of this script keyed it whole: that row goes)
                    packs[where].pop(en, None); en, tr = core(en), [core(x) for x in tr]
                if en not in packs[where]: added += 1; packs[where][en] = tr[i]  # an existing row (e.g. 'Boss') is kept
        for w, p in paths.items(): dump(p, packs[w])
        stats[code] = added
    print('ok: rows added per language:', stats)


if __name__ == '__main__':
    main()
