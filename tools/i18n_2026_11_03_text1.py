#!/usr/bin/env python3
"""2026-11-03 (package TEXT1, owner 18:37: "Checking and rewording all our dialogue and descriptions."): the alpha text pass
(docs/text1-2026-11-03.md has every before / after and its reason). This script applies the English changes and re-keys the 12
language rows of each changed string:
  TX     bramblewood-texts.js keys (rows in lang/<code>.json)
  APP    hard-coded English in arena_app.js: two SKILL_TEXT lines, three dialogue lines and one map blurb (rows in lang/ui/<code>.json;
         a skill template's {v1} is the ${v} of the code)
  FLAV   card flavour in canonical/cards.json (text only; rows in lang/ui/<code>.json)
  GROUP  translations only: rows whose English already says "multiplayer dungeon" but whose translation still said "group dungeon"
         (X19, package UI6), and the Surrounding term reworded here
A reworded row keeps its place in the pack (renamed in place, key order kept, never sorted); a row that was missing is added at the
end. Rows are a full new translation, ('sub', [(old, new) per language]) for an edit of the existing translation, or 'keep' (the
meaning did not change: only the English key moves). Tagalog, Tamil and Indonesian deserve a native read (and Japanese / Korean).
Idempotent: a second run changes nothing.
    python3 tools/i18n_2026_11_03_text1.py"""
import json, os, re
ROOT = os.path.join(os.path.dirname(os.path.abspath(__file__)), '..')
CODES = ['fr', 'de', 'es', 'it', 'pt', 'tl', 'ta', 'id', 'zh-Hans', 'zh-Hant', 'ja', 'ko']

# ---- TX keys: (key, new English, row)
TX = [
 # d-2026-10-19 (cards' short lines under 20 words): the werebadger's Lycanthropy line was 21
 ('ui.sk-transform-short', 'It keeps them for the rest of the fight.',
  ["Il les garde jusqu'à la fin du combat.", 'Sie behält sie bis zum Ende des Kampfes.', 'Las conserva el resto del combate.',
   'Le tiene per il resto dello scontro.', 'Mantém-nas até ao fim do combate.', 'Mananatili ang mga ito hanggang matapos ang laban.',
   'போரின் மீதிக்கு அவற்றை வைத்திருக்கும்.', 'Ia menyimpannya sampai akhir pertarungan.', '本场战斗余下时间都保留。', '本場戰鬥餘下時間都保留。',
   '戦闘の終わりまで保つ。', '전투가 끝날 때까지 유지한다.']),
 # Enraged was removed (package EN, owner TR-6); the engine has 5 presets
 ('ui.tf-presets-codex', 'Presets: Lycanthropy, Gilded (Lumber 1, Stone 2, Metal 3, Gold 5 each), Championed, Veteran, Matured.',
  ('sub', [(', Enragé', ''), (', Erzürnt', ''), (', Enfurecido', ''), (', Infuriato', ''), (', Enfurecido', ''), (', Nagngingitngit', ''),
           (', சீற்றம்கொண்ட', ''), (', Murka', ''), ('、狂怒', ''), ('、狂怒', ''), ('、激昂', ''), (', 격노', '')])),
 # the engine (ENG9, G2) strikes the centre and one side, never left and right together: the old note said the opposite
 ('ui.skx-fork', 'A Taunt unit that draws the swing is always one of its lines.',
  ["Une unité avec Provocation qui attire le coup est toujours l’une de ses lignes.",
   'Eine Einheit mit Spott, die den Schlag auf sich zieht, ist immer eine seiner Linien.',
   'Una unidad con Provocar que atrae el golpe siempre es una de sus líneas.',
   'Un’unità con Provocazione che attira il colpo è sempre una delle sue linee.',
   'Uma unidade com Provocar que atrai o golpe é sempre uma das suas linhas.',
   'Ang unit na may Taunt na umaakit sa tama ay laging isa sa mga linya nito.',
   'தாக்குதலைத் தன்பால் இழுக்கும் சீண்டல் அலகு எப்போதும் அதன் கோடுகளில் ஒன்று.',
   'Unit Ejekan yang menarik ayunan itu selalu menjadi salah satu jalurnya.',
   '吸引这一击的嘲讽单位，必定是它攻击的线路之一。', '吸引這一擊的嘲諷單位，必定是它攻擊的線路之一。',
   'その一撃を引きつけた挑発ユニットは、必ず攻撃ラインの一つになる。', '그 일격을 끌어당긴 도발 유닛은 언제나 공격 줄 가운데 하나가 됩니다.']),
 # a season lasts 6 rounds (engine en6SeasonLen, ENG9 / EN6-4); the Grant form's note still said 3
 ('ui.sk-season-codex', 'Plain Season gives +1/+1. Only where the Seasons cycle runs: Spring, Summer, Autumn, Winter, 6 rounds each. Summer is hot and Winter is cold.',
  ('sub', [('3 tours chacun', '6 tours chacun'), ('je 3 Runden', 'je 6 Runden'), ('3 rondas cada una', '6 rondas cada una'), ('3 round ciascuna', '6 round ciascuna'),
           ('3 rondas cada', '6 rondas cada'), ('tig-3 round', 'tig-6 round'), ('ஒவ்வொன்றும் 3 சுற்றுகள்', 'ஒவ்வொன்றும் 6 சுற்றுகள்'),
           ('masing-masing 3 ronde', 'masing-masing 6 ronde'), ('各 3 回合', '各 6 回合'), ('各 3 回合', '各 6 回合'), ('各3ラウンド', '各6ラウンド'), ('각 3라운드', '각 6라운드')])),
 # Shedding clears Poison and Deadly Poison too (engine, the shedding upkeep): "Only Cure" was not true
 ('ui.st-poison', 'takes damage equal to its stacks each round, then loses 1 stack. Cure or Shedding removes it.',
  ('sub', [('Seule la Guérison l’enlève.', 'La Guérison ou Peau neuve l’enlève.'), ('Nur Kurieren entfernt es.', 'Kurieren oder Abstreifen entfernt es.'),
           ('Solo Sanar lo quita.', 'Sanar o Cambio de piel lo quitan.'), ('Solo la Cura lo toglie.', 'La Cura o la Muta lo tolgono.'),
           ('Só Curar o remove.', 'Curar ou Muda o removem.'), ('Lunas lang ang nag-aalis nito.', 'Lunas o Paghuhunos ang nag-aalis nito.'),
           ('குணமாக்கல் மட்டுமே நீக்கும்.', 'குணமாக்கல் அல்லது தோலுரிப்பு நீக்கும்.'), ('Hanya Penawar yang menghapusnya.', 'Penawar atau Berganti Kulit menghapusnya.'),
           ('只有净化能移除。', '净化或蜕皮能移除。'), ('只有淨化能移除。', '淨化或蛻皮能移除。'), ('治療でしか消えない。', '治療か皮むけで消える。'), ('치료만이 없앤다.', '치료나 탈피로 없앤다.')])),
 ('ui.st-greater-poison', 'takes 1 damage per stack each round; the stack never wears off. Cure or Shedding removes it.',
  ('sub', [('Seule la Guérison le retire.', 'La Guérison ou Peau neuve le retire.'), ('Nur Kurieren entfernt es.', 'Kurieren oder Abstreifen entfernt es.'),
           ('Solo Sanar lo quita.', 'Sanar o Cambio de piel lo quitan.'), ('Solo Cura lo rimuove.', 'Cura o Muta lo rimuovono.'),
           ('Só Cura o remove.', 'Cura ou Muda o removem.'), ('Lunas lang ang nag-aalis nito.', 'Lunas o Paghuhunos ang nag-aalis nito.'),
           ('குணப்படுத்தல் மட்டுமே அதை நீக்கும்.', 'குணப்படுத்தல் அல்லது தோலுரிப்பு அதை நீக்கும்.'), ('Hanya Penawar yang menghapusnya.', 'Penawar atau Berganti Kulit menghapusnya.'),
           ('只有净化能移除。', '净化或蜕皮能移除。'), ('只有淨化能移除。', '淨化或蛻皮能移除。'), ('治療でしか消えない。', '治療か皮むけで消える。'), ('치료로만 없앨 수 있어요.', '치료나 탈피로 없앨 수 있어요.')])),
 # X19 (package UI6): the group dungeon is Multiplayer; the translation follows in GROUP below
 ('ui.term-surrounding', 'the 8 places around it: adjacent plus the 4 diagonals (raid and multiplayer-dungeon rows too).', 'keep'),
 # Bloom's copy grows in an ADJACENT slot (engine bloomSlotOf: left / right, and front / behind on boards with more rows)
 ('ui.bl-short', 'Each Ready round its conditions hold: a copy with +1/+1 grows in an adjacent slot.',
  ['Chaque manche Prête où ses conditions sont réunies : une copie avec +1/+1 pousse dans une case adjacente.',
   'In jeder Bereit-Runde, in der ihre Bedingungen gelten: Auf einem angrenzenden Feld wächst eine Kopie mit +1/+1.',
   'Cada ronda Lista en que se cumplen sus condiciones: crece una copia con +1/+1 en una casilla adyacente.',
   'Ogni turno Pronta in cui le sue condizioni valgono: una copia con +1/+1 cresce in uno spazio adiacente.',
   'Em cada ronda Pronta em que as suas condições se cumprem: cresce uma cópia com +1/+1 numa casa adjacente.',
   'Sa bawat round na Handa ito at tumutugon ang kondisyon nito: tumutubo ang kopya nito na may +1/+1 sa katabing puwesto.',
   'நிபந்தனைகள் பொருந்தும் ஒவ்வொரு தயார் சுற்றிலும்: +1/+1 உடன் அதன் நகல் அடுத்துள்ள இடத்தில் வளரும்.',
   'Setiap ronde Siap saat syaratnya terpenuhi: salinannya dengan +1/+1 tumbuh di petak yang bersebelahan.',
   '每个条件满足的可进行回合：相邻空位长出一个自己的复制体，获得 +1/+1。', '每個條件滿足的可進行回合：相鄰空位長出一個自己的複製體，獲得 +1/+1。',
   '条件を満たす準備OKのラウンドごとに、隣接するマスに+1/+1のコピーが育つ。', '조건이 맞는 가능 상태의 라운드마다 인접한 칸에 +1/+1인 복제본이 자랍니다.']),
 ('ui.bl-short-lumber', 'Each Ready round its conditions hold, it pays {n} Lumber: a copy with +1/+1 grows in an adjacent slot.',
  ['Chaque manche Prête où ses conditions sont réunies, elle paie {n} Bois : une copie avec +1/+1 pousse dans une case adjacente.',
   'In jeder Bereit-Runde, in der ihre Bedingungen gelten, zahlt sie {n} Holz: Auf einem angrenzenden Feld wächst eine Kopie mit +1/+1.',
   'Cada ronda Lista en que se cumplen sus condiciones, paga {n} de Madera: crece una copia con +1/+1 en una casilla adyacente.',
   'Ogni turno Pronta in cui le sue condizioni valgono, paga {n} Legname: una copia con +1/+1 cresce in uno spazio adiacente.',
   'Em cada ronda Pronta em que as suas condições se cumprem, paga {n} de Madeira: cresce uma cópia com +1/+1 numa casa adjacente.',
   'Sa bawat round na Handa ito at tumutugon ang kondisyon nito, nagbabayad ito ng {n} Kahoy: tumutubo ang kopya nito na may +1/+1 sa katabing puwesto.',
   'நிபந்தனைகள் பொருந்தும் ஒவ்வொரு தயார் சுற்றிலும் அது {n} மரத்தைச் செலுத்தும்: +1/+1 உடன் அதன் நகல் அடுத்துள்ள இடத்தில் வளரும்.',
   'Setiap ronde Siap saat syaratnya terpenuhi, ia membayar {n} Kayu: salinannya dengan +1/+1 tumbuh di petak yang bersebelahan.',
   '每个条件满足的可进行回合，它支付 {n} 木材：相邻空位长出一个自己的复制体，获得 +1/+1。', '每個條件滿足的可進行回合，它支付 {n} 木材：相鄰空位長出一個自己的複製體，獲得 +1/+1。',
   '条件を満たす準備OKのラウンドごとに木材{n}を支払い、隣接するマスに+1/+1のコピーが育つ。', '조건이 맞는 가능 상태의 라운드마다 목재 {n}을(를) 내고, 인접한 칸에 +1/+1인 복제본이 자랍니다.']),
 # "steal 1 tokens" at its default; the bramble's owner loses the resource (the engine moves it to the thief's side)
 ('ui.sk2-pickpocket', "Its hits steal {n} of the target's tokens; on the bramble, {n} of its lowest-ranked resource.",
  ['Ses coups volent {n} des jetons de la cible ; sur le Roncier, {n} de sa ressource de plus bas rang.',
   'Seine Treffer stehlen {n} Marken des Ziels; an der Dornenhecke {n} seiner niedrigsten Ressource.',
   'Sus golpes roban {n} de las fichas del objetivo; en el Zarzal, {n} de su recurso de menor rango.',
   'I suoi colpi rubano {n} dei segnalini del bersaglio; sul Rovo, {n} della sua risorsa di grado più basso.',
   'Os seus golpes roubam {n} das fichas do alvo; no Silvado, {n} do seu recurso de menor grau.',
   'Ang mga tama nito ay nagnanakaw ng {n} sa mga token ng target; sa dawag, {n} ng pinakamababang resource nito.',
   'அதன் தாக்குதல்கள் இலக்கின் டோக்கன்களில் {n} திருடும்; முட்புதரில், அதன் மிகக் குறைந்த நிலை வளத்தில் {n}.',
   'Serangannya mencuri {n} token target; pada Semak, {n} sumber daya peringkat terendahnya.',
   '它的命中偷走目标的 {n} 个标记；打到荆棘丛时，偷走 {n} 个其最低级资源。', '它的命中偷走目標的 {n} 個標記；打到荊棘叢時，偷走 {n} 個其最低級資源。',
   '命中すると対象のトークンを{n}盗む。いばらなら、その最も低ランクの資源を{n}。', '적중 시 대상의 토큰 {n}개를 훔칩니다. 덤불이면 그쪽의 가장 낮은 등급 자원 {n}.']),
 # ENG17 / W10 (engine ownedCells): your row's centre is yours alone; other cells must be adjacent to one of your own units
 ('ui.coop2-group-sub', "A normal fight with a friend: each of you holds a row on one board, and you may also play into your ally's row, adjacent to one of your units.",
  ['Un combat normal avec un ami : chacun tient une rangée du même plateau, et vous pouvez aussi jouer dans la rangée de votre allié, dans une case adjacente à l’une de vos unités.',
   'Ein normaler Kampf mit einem Freund: Jeder hält eine Reihe auf demselben Brett, und du darfst auch in die Reihe deines Verbündeten spielen, auf ein an eine deiner Einheiten angrenzendes Feld.',
   'Un combate normal con un amigo: cada uno defiende una fila del mismo tablero, y también puedes jugar en la fila de tu aliado, en una casilla adyacente a una de tus unidades.',
   'Uno scontro normale con un amico: ognuno tiene una fila dello stesso tabellone, e puoi giocare anche nella fila del tuo alleato, in uno spazio adiacente a una tua unità.',
   'Uma luta normal com um amigo: cada um segura uma fileira do mesmo tabuleiro, e você também pode jogar na fileira do aliado, num espaço adjacente a uma das suas unidades.',
   'Isang normal na laban kasama ang kaibigan: may tig-isang hanay kayo sa iisang board, at puwede ka ring maglaro sa hanay ng kakampi mo, sa puwestong katabi ng isa sa mga unit mo.',
   'நண்பருடன் ஒரு வழக்கமான போர்: ஒரே பலகையில் ஒவ்வொருவரும் ஒரு வரிசையைப் பிடிப்பீர்கள்; உங்கள் அலகு ஒன்றுக்கு அடுத்துள்ள இடமாக இருந்தால், கூட்டாளியின் வரிசையிலும் விளையாடலாம்.',
   'Pertarungan biasa bersama teman: masing-masing memegang satu baris di papan yang sama, dan kamu juga boleh bermain di baris sekutumu, di slot yang bersebelahan dengan salah satu unitmu.',
   '和好友打一场普通的对战：你们各守同一棋盘上的一排；你也可以出到盟友那一排，只要那格与你的某个单位相邻。',
   '和好友打一場普通的對戰：你們各守同一棋盤上的一排；你也可以出到盟友那一排，只要那格與你的某個單位相鄰。',
   '仲間との普通の対戦。同じ盤面でそれぞれ1列を受け持ちます。自分のユニットに隣接するマスなら、味方の列にも出せます。',
   '친구와 함께하는 일반 대전: 한 보드에서 각자 한 줄을 맡고, 내 유닛에 인접한 칸이라면 동료의 줄에도 카드를 낼 수 있습니다.']),
 ('ui.coop2-how', "Each player holds a row and plays from their own hand. Your row's centre is yours alone. You may also play into an empty slot adjacent to one of your units, even in an ally's row; whoever claims it first gets it.",
  ['Chaque joueur tient une rangée et joue de sa propre main. Le centre de votre rangée n’est qu’à vous. Vous pouvez aussi jouer dans une case vide adjacente à l’une de vos unités, même dans la rangée d’un allié ; elle revient au premier qui la prend.',
   'Jeder Spieler hält eine Reihe und spielt aus der eigenen Hand. Die Mitte deiner Reihe gehört nur dir. Du darfst auch auf ein freies, an eine deiner Einheiten angrenzendes Feld spielen, auch in der Reihe eines Verbündeten; wer es zuerst beansprucht, bekommt es.',
   'Cada jugador defiende una fila y juega desde su propia mano. El centro de tu fila es solo tuyo. También puedes jugar en una casilla vacía adyacente a una de tus unidades, incluso en la fila de un aliado; es de quien la reclame primero.',
   'Ogni giocatore tiene una fila e gioca dalla propria mano. Il centro della tua fila è solo tuo. Puoi giocare anche in uno spazio vuoto adiacente a una tua unità, persino nella fila di un alleato; va a chi lo reclama per primo.',
   'Cada jogador segura uma fileira e joga da própria mão. O centro da sua fileira é só seu. Você também pode jogar num espaço vazio adjacente a uma das suas unidades, mesmo na fileira de um aliado; fica com quem o pegar primeiro.',
   'May tig-isang hanay ang bawat manlalaro at naglalaro mula sa sariling kamay. Sa iyo lang ang gitna ng hanay mo. Puwede ka ring maglaro sa bakanteng puwestong katabi ng isa sa mga unit mo, kahit sa hanay ng kakampi; mapupunta ito sa unang kumuha.',
   'ஒவ்வொரு வீரரும் ஒரு வரிசையைப் பிடித்து தம் கையிலிருந்து விளையாடுவார். உங்கள் வரிசையின் நடு இடம் உங்களுக்கு மட்டுமே. உங்கள் அலகு ஒன்றுக்கு அடுத்துள்ள காலி இடத்திலும், கூட்டாளியின் வரிசையில் இருந்தாலும், விளையாடலாம்; முதலில் கோருபவருக்கே அந்த இடம்.',
   'Setiap pemain memegang satu baris dan bermain dari tangannya sendiri. Tengah barismu hanya milikmu. Kamu juga boleh bermain di slot kosong yang bersebelahan dengan salah satu unitmu, bahkan di baris sekutu; slot itu milik yang lebih dulu mengklaimnya.',
   '每名玩家守一排，并从自己的手牌出牌。你那一排的中间格只属于你。你也可以出到与你的某个单位相邻的空位，即使在盟友那一排；谁先占到就归谁。',
   '每名玩家守一排，並從自己的手牌出牌。你那一排的中間格只屬於你。你也可以出到與你的某個單位相鄰的空位，即使在盟友那一排；誰先佔到就歸誰。',
   '各プレイヤーは1列を受け持ち、自分の手札から出します。自分の列の中央は自分だけのものです。自分のユニットに隣接する空きマスなら、味方の列にも出せます。先に取った人のものです。',
   '각 플레이어는 한 줄을 맡고 자기 손패에서 냅니다. 내 줄의 가운데 칸은 나만 쓸 수 있습니다. 내 유닛에 인접한 빈칸이라면 동료의 줄에도 낼 수 있으며, 먼저 차지한 사람이 그 칸을 가집니다.']),
]

# ---- hard-coded English in arena_app.js: (old source text, new source text, old pack key, new pack key, row)
APP = [
 # Swift's dodge is a 1-in-2 roll (engine, the swift miss check): "dodges attacks" read as every attack
 ('swift: ()=> `Always attacks first, and dodges attacks from units without Swift.`',
  'swift: ()=> `Always attacks first, and dodges half the attacks from units without Swift.`',
  'Always attacks first, and dodges attacks from units without Swift.', 'Always attacks first, and dodges half the attacks from units without Swift.',
  ['Attaque toujours en premier, et esquive la moitié des attaques des unités sans Rapide.',
   'Greift immer zuerst an und weicht der Hälfte der Angriffe von Einheiten ohne Flink aus.',
   'Siempre ataca primero, y esquiva la mitad de los ataques de unidades sin Veloz.',
   'Attacca sempre per primo e schiva metà degli attacchi delle unità senza Rapido.',
   'Ataca sempre primeiro e esquiva metade dos ataques de unidades sem Veloz.',
   'Laging unang umaatake, at naiilagan ang kalahati ng mga atake mula sa mga unit na walang Mabilis.',
   'எப்போதும் முதலில் தாக்கும்; விரைவு இல்லாத அலகுகளின் தாக்குதல்களில் பாதியைத் தவிர்க்கும்.',
   'Selalu menyerang lebih dulu, dan menghindari separuh serangan dari unit tanpa Gesit.',
   '总是先攻击，并闪避没有迅捷的单位一半的攻击。', '總是先攻擊，並閃避沒有迅捷的單位一半的攻擊。',
   '常に先に攻撃し、俊敏を持たないユニットの攻撃を半分かわす。', '항상 먼저 공격하고, 날쌘이 없는 유닛의 공격을 절반 피합니다.']),
 # Immolation also burns the enemy facing it (engine upkeep: adjacentOf + the facing enemy; ENG18 row 7)
 ('immolation: v=> `Deal ${v} fire damage to all adjacent units every upkeep.`',
  'immolation: v=> `Every upkeep: ${v} fire damage to adjacent units and the enemy facing it.`',
  'Deal {v1} fire damage to all adjacent units every upkeep.', 'Every upkeep: {v1} fire damage to adjacent units and the enemy facing it.',
  ['À chaque entretien : {v1} dégâts de feu aux unités adjacentes et à l’ennemi en face.',
   'In jeder Unterhaltsphase: {v1} Feuerschaden an angrenzenden Einheiten und dem Gegner gegenüber.',
   'En cada mantenimiento: {v1} de daño de fuego a las unidades adyacentes y al enemigo de enfrente.',
   'A ogni mantenimento: {v1} danni da fuoco alle unità adiacenti e al nemico di fronte.',
   'Em cada manutenção: {v1} de dano de fogo às unidades adjacentes e ao inimigo à frente.',
   'Bawat upkeep: {v1} pinsalang apoy sa mga katabing unit at sa kalabang kaharap nito.',
   'ஒவ்வொரு பராமரிப்பிலும்: அடுத்துள்ள அலகுகளுக்கும் எதிரே உள்ள எதிரிக்கும் {v1} நெருப்புச் சேதம்.',
   'Setiap upkeep: {v1} kerusakan api ke unit yang bersebelahan dan musuh di hadapannya.',
   '每个维持阶段：对相邻单位和正对它的敌人造成 {v1} 点火焰伤害。', '每個維持階段：對相鄰單位和正對它的敵人造成 {v1} 點火焰傷害。',
   'アップキープごと：隣接するユニットと正面の敵に火炎ダメージ{v1}。', '매 유지 단계: 인접한 유닛과 마주한 적에게 화염 피해 {v1}.']),
 # PvP tickets: up to 10, +1 an hour (PVP_TICKETS_PER_DAY, PVP_TICKET_REGEN_MS; ui.ar-tickets-tip), not ten a day
 ("{label:'go', who:'vesper', text:'Ten tickets a day. Spend them well.'}",
  "{label:'go', who:'vesper', text:'Ten tickets at most, and one more each hour. Spend them well.'}",
  'Ten tickets a day. Spend them well.', 'Ten tickets at most, and one more each hour. Spend them well.',
  ['Dix tickets au plus, et un de plus chaque heure. Dépensez-les bien.', 'Höchstens zehn Tickets, jede Stunde kommt eins dazu. Gib sie mit Bedacht aus.',
   'Diez entradas como máximo, y una más cada hora. Gástalas bien.', 'Dieci biglietti al massimo, e uno in più ogni ora. Spendili bene.',
   'Dez bilhetes no máximo, e mais um a cada hora. Gasta-os bem.', 'Sampung tiket ang pinakamarami, at may dagdag na isa bawat oras. Gamitin nang maayos.',
   'அதிகபட்சம் பத்து டிக்கெட்டுகள், ஒவ்வொரு மணி நேரமும் ஒன்று கூடும். நன்றாகச் செலவழி.', 'Paling banyak sepuluh tiket, tambah satu tiap jam. Gunakan dengan baik.',
   '门票最多十张，每小时补一张。好好使用。', '門票最多十張，每小時補一張。好好使用。', 'チケットは最大10枚、1時間ごとに1枚戻る。上手に使って。', '티켓은 최대 열 장, 한 시간마다 한 장씩 돌아와요. 잘 써요.']),
 # the Tavern's Max Energy steps are bought with Dust and materials (STAMINA_PLACES.tavern), not earned per 20 fights; "stamina" is Energy
 ("text:'Rest here when you have earned it: every 20 different fights you clear, the keeper will stretch your stamina a little further.'",
  "text:'Rest here when you have earned it. Bring Dust and the right materials, and the keeper will stretch your Energy a little further.'",
  'Rest here when you have earned it: every 20 different fights you clear, the keeper will stretch your stamina a little further.',
  'Rest here when you have earned it. Bring Dust and the right materials, and the keeper will stretch your Energy a little further.',
  ['Reposez-vous ici quand vous l’avez mérité. Apportez de la Poussière et les bons matériaux, et l’aubergiste prolongera un peu votre Énergie.',
   'Ruh dich hier aus, wenn du es dir verdient hast. Bring Staub und die richtigen Materialien, und der Wirt streckt deine Energie ein Stück weiter.',
   'Descansa aquí cuando te lo hayas ganado. Trae Polvo y los materiales adecuados, y el tabernero estirará un poco más tu Energía.',
   'Riposa qui quando te lo sei guadagnato. Porta Polvere e i materiali giusti, e l’oste allungherà un po’ la tua Energia.',
   'Descansa aqui quando o mereceres. Traz Pó e os materiais certos, e o taberneiro estica um pouco mais a tua Energia.',
   'Magpahinga rito kapag karapat-dapat ka na. Magdala ng Alikabok at ng tamang materyales, at babanatin nang kaunti ng tagapangalaga ang iyong Enerhiya.',
   'தகுதி பெற்றதும் இங்கே ஓய்வெடு. தூசியையும் சரியான பொருட்களையும் கொண்டு வா; விடுதிக்காரர் உன் ஆற்றலைச் சற்று நீட்டுவார்.',
   'Beristirahatlah di sini kalau sudah pantas. Bawa Debu dan bahan yang tepat, dan pemiliknya akan menambah sedikit Energimu.',
   '等你挣够了就来这里歇歇。带上粉尘和合适的材料，店主就会让你的能量再多撑一点。', '等你掙夠了就來這裡歇歇。帶上粉塵和合適的材料，店主就會讓你的能量再多撐一點。',
   '頑張ったらここで休むといい。粉と必要な素材を持ってくれば、主人がエネルギーを少し伸ばしてくれる。', '자격이 생기면 여기서 쉬어요. 가루와 알맞은 재료를 가져오면 주인이 에너지를 조금씩 늘려 줘요.']),
 # "the pill" is our code word for the Tide chip; the translations already said "indicator"
 ("Watch the pill on the field.'", "Watch the Tide marker on the field.'",
  'Flood… ebb… flood. The tide decides who hits harder. Watch the pill on the field.', 'Flood… ebb… flood. The tide decides who hits harder. Watch the Tide marker on the field.', 'keep'),
 # Map m11 is not the last map any more (Quiet Summit, Rimefire Caldera, the Goldfeather maps follow): "final approach ... one throne left" was stale
 ('blurb:"The campaign’s final approach — apex predators, no scouts left to send ahead of you. Ten regions down. One throne left."',
  'blurb:"The mountain’s broken crown — apex predators, and no scouts left to send ahead of you."',
  'The campaign’s final approach — apex predators, no scouts left to send ahead of you. Ten regions down. One throne left.',
  'The mountain’s broken crown — apex predators, and no scouts left to send ahead of you.',
  ['La couronne brisée de la montagne : superprédateurs, et plus aucun éclaireur à envoyer devant vous.',
   'Die zerbrochene Krone des Berges – Spitzenjäger, und keine Späher mehr, die du vorausschicken könntest.',
   'La corona rota de la montaña: superdepredadores y ningún explorador que enviar por delante.',
   'La corona spezzata della montagna: superpredatori, e nessun esploratore da mandare avanti.',
   'A coroa partida da montanha: superpredadores, e nenhum batedor para enviar à tua frente.',
   'Ang basag na korona ng bundok — mga pinakamabangis na mandaragit, at wala nang tagamanmang maipapauna sa iyo.',
   'மலையின் உடைந்த மகுடம் — உச்ச வேட்டையாடிகள், உனக்கு முன் அனுப்ப ஒற்றர் யாரும் இல்லை.',
   'Mahkota gunung yang retak — predator puncak, dan tak ada lagi pengintai untuk dikirim mendahuluimu.',
   '群山破碎的王冠——顶级掠食者，再也没有斥候能替你打头阵。', '群山破碎的王冠——頂級掠食者，再也沒有斥候能替你打頭陣。',
   '砕けた山の頂――頂点の捕食者たち、先に送る斥候はもういない。', '산의 부서진 왕관 — 최상위 포식자들, 앞서 보낼 정찰병은 더 이상 없다.']),
]

# ---- card flavour: (card id, new flavour, row)
FLAV = [
 ('woodland-brawler', 'Settles every argument the same way: badly, loudly, and in its own favour.', 'keep'),   # British spelling, as the texts
 ('cuttlefish-illusionist', "By the time the colour pattern registers as a threat, it already isn't there.", 'keep'),
 ('ironmaw-warwolf', 'Twice the height of a cart, steel on every claw and tooth. Kip, the monkey on its back, does the steering. This is the war, walking.',  # 40 words
  ['Deux fois la hauteur d’une charrette, de l’acier sur chaque griffe et chaque croc. Kip, le singe sur son dos, tient la barre. C’est la guerre qui marche.',
   'Doppelt so hoch wie ein Karren, Stahl an jeder Kralle und jedem Zahn. Kip, der Affe auf seinem Rücken, lenkt. Das ist der Krieg auf vier Beinen.',
   'El doble de alto que un carro, con acero en cada garra y cada diente. Kip, el mono que lleva a lomos, lo dirige. Es la guerra, caminando.',
   'Alto il doppio di un carro, acciaio su ogni artiglio e ogni dente. Kip, la scimmia sulla sua groppa, tiene la guida. È la guerra che cammina.',
   'Duas vezes a altura de uma carroça, aço em cada garra e cada dente. Kip, o macaco às suas costas, é quem guia. É a guerra, a andar.',
   'Doble ang taas sa kariton, may bakal sa bawat kuko at ngipin. Si Kip, ang unggoy sa likod nito, ang nagmamaneho. Ito ang digmaan, naglalakad.',
   'வண்டியை விட இருமடங்கு உயரம், ஒவ்வொரு நகத்திலும் பல்லிலும் எஃகு. அதன் முதுகிலுள்ள குரங்கு கிப் தான் வழிநடத்துகிறது. இதுவே நடந்து வரும் போர்.',
   'Dua kali tinggi gerobak, baja di setiap cakar dan taring. Kip, monyet di punggungnya, yang mengemudi. Inilah perang, berjalan.',
   '比马车高一倍，每只爪、每颗牙都包着钢。背上的猴子基普负责掌舵。这是会走路的战争。', '比馬車高一倍，每隻爪、每顆牙都包著鋼。背上的猴子基普負責掌舵。這是會走路的戰爭。',
   '荷車の倍の背丈、爪にも牙にも鋼。背中の猿のキップが舵を取る。これは歩く戦争だ。', '수레보다 두 배는 크고, 발톱과 이빨마다 강철. 등에 탄 원숭이 킵이 방향을 잡는다. 이것은 걸어 다니는 전쟁이다.']),
 ('wandering-mage', 'A cat in a starry hat, with a little fire spirit reading over its shoulder. It walks the farthest roads, as the Traveller once did.',  # 37 words, "past Map 50"
  ['Un chat au chapeau étoilé, avec un petit esprit de feu qui lit par-dessus son épaule. Il arpente les routes les plus lointaines, comme le Voyageur autrefois.',
   'Eine Katze mit Sternenhut und ein kleiner Feuergeist, der ihr über die Schulter mitliest. Sie zieht über die fernsten Straßen, wie einst der Reisende.',
   'Un gato con sombrero estrellado y un pequeño espíritu de fuego que lee por encima de su hombro. Recorre los caminos más lejanos, como antes el Viajero.',
   'Un gatto con un cappello stellato e un piccolo spirito di fuoco che legge da sopra la sua spalla. Percorre le strade più lontane, come un tempo il Viandante.',
   'Um gato de chapéu estrelado, com um pequeno espírito de fogo a ler por cima do ombro. Percorre as estradas mais distantes, como outrora o Viajante.',
   'Isang pusang may sombrerong may bituin, at isang munting espiritu ng apoy na nakikibasa sa balikat nito. Nilalakad nito ang pinakamalalayong daan, gaya ng Manlalakbay noon.',
   'நட்சத்திரத் தொப்பி அணிந்த ஒரு பூனை, அதன் தோளுக்கு மேல் படிக்கும் ஒரு சிறு நெருப்பு ஆவி. முன்பு பயணி செய்ததுபோல, அது மிகத் தொலைவான சாலைகளில் நடக்கிறது.',
   'Seekor kucing bertopi berbintang, dengan roh api kecil yang ikut membaca dari balik bahunya. Ia menempuh jalan-jalan terjauh, seperti sang Pengelana dulu.',
   '戴星星帽的猫，肩头还有个小火灵跟着看书。它走在最远的路上，就像当年的旅人。', '戴星星帽的貓，肩頭還有個小火靈跟著看書。牠走在最遠的路上，就像當年的旅人。',
   '星の帽子をかぶった猫と、その肩越しに本をのぞく小さな火の精。かつての旅人のように、最果ての道を歩いている。', '별무늬 모자를 쓴 고양이, 어깨 너머로 함께 책을 읽는 작은 불의 정령. 예전의 나그네처럼 가장 먼 길을 걷는다.']),
 ('bucketknee-wolf', 'It took the hard jobs until it took one to the knee. Now it keeps the village gate, with a bucket on its head and stories nobody asked for.',  # 35 words
  ['Il prenait les durs travaux, jusqu’au jour où il en a pris un dans le genou. Désormais il garde la porte du village, un seau sur la tête et des histoires que personne n’a demandées.',
   'Er übernahm die harten Aufträge, bis er einen ins Knie bekam. Jetzt bewacht er das Dorftor, mit einem Eimer auf dem Kopf und Geschichten, nach denen keiner gefragt hat.',
   'Aceptaba los trabajos duros hasta que uno le dio en la rodilla. Ahora guarda la puerta del pueblo, con un cubo en la cabeza e historias que nadie pidió.',
   'Prendeva i lavori duri, finché uno non lo prese al ginocchio. Ora sorveglia il cancello del villaggio, con un secchio in testa e storie che nessuno ha chiesto.',
   'Aceitava os trabalhos duros até levar um no joelho. Agora guarda o portão da aldeia, com um balde na cabeça e histórias que ninguém pediu.',
   'Tinatanggap nito ang mabibigat na trabaho hanggang tamaan ito ng isa sa tuhod. Ngayon binabantayan nito ang tarangkahan ng nayon, may timba sa ulo at mga kuwentong walang humihingi.',
   'முழங்காலில் ஒன்று படும்வரை அது கடினமான வேலைகளை ஏற்றது. இப்போது தலையில் வாளியுடனும், யாரும் கேட்காத கதைகளுடனும் ஊர் வாயிலைக் காக்கிறது.',
   'Dulu ia mengambil pekerjaan berat, sampai satu mengenai lututnya. Kini ia menjaga gerbang desa, dengan ember di kepala dan cerita yang tak diminta siapa pun.',
   '它曾专接苦差事，直到膝盖中了一箭。如今它头顶水桶守着村门，还有一肚子没人想听的故事。', '牠曾專接苦差事，直到膝蓋中了一箭。如今牠頭頂水桶守著村門，還有一肚子沒人想聽的故事。',
   'きつい仕事ばかり請けていたが、ある日膝に一発もらった。今は頭にバケツをかぶって村の門を守り、誰も頼んでいない昔話をしている。',
   '힘든 일만 맡다가 무릎에 한 방 맞았다. 이제는 머리에 양동이를 쓰고 마을 문을 지키며, 아무도 묻지 않은 이야기를 늘어놓는다.']),
 ('crowbar', 'It has opened more stuck doors than any key, and it is a great comfort when something leggy drops from the rafters.',  # 32 words
  ['Il a ouvert plus de portes coincées que n’importe quelle clé, et il rassure beaucoup quand quelque chose à pattes tombe des poutres.',
   'Es hat mehr klemmende Türen geöffnet als jeder Schlüssel und ist ein großer Trost, wenn etwas Vielbeiniges von den Dachbalken fällt.',
   'Ha abierto más puertas atascadas que cualquier llave, y es un gran consuelo cuando algo con muchas patas cae de las vigas.',
   'Ha aperto più porte incastrate di qualsiasi chiave, ed è un gran conforto quando qualcosa di zampettante cade dalle travi.',
   'Já abriu mais portas emperradas do que qualquer chave, e é um grande conforto quando algo cheio de patas cai das vigas.',
   'Mas maraming nakabarang pinto na ang nabuksan nito kaysa sa anumang susi, at malaking ginhawa ito kapag may mabintiing bagay na nahulog mula sa mga biga.',
   'எந்தச் சாவியையும் விட அதிகமான சிக்கிய கதவுகளை இது திறந்திருக்கிறது; கூரைச் சட்டங்களிலிருந்து கால்கள் நிறைந்த ஏதாவது விழும்போது இது பெரும் ஆறுதல்.',
   'Ia sudah membuka lebih banyak pintu macet daripada kunci mana pun, dan sangat menenangkan saat sesuatu berkaki banyak jatuh dari kasau.',
   '它撬开的卡死的门比任何钥匙都多；房梁上掉下什么多腿的东西时，有它在很安心。', '它撬開的卡死的門比任何鑰匙都多；房樑上掉下什麼多腿的東西時，有它在很安心。',
   'どの鍵よりも多くの開かずの扉をこじ開けてきた。梁から脚の多いものが落ちてきたときも、実に頼もしい。', '어떤 열쇠보다 많은 꽉 낀 문을 열어 왔고, 서까래에서 다리 많은 무언가가 떨어질 때 큰 위안이 된다.']),
 ('sea-cucumber', 'Poke it and it throws its insides at you. A week later it has grown a new set and is back on the reef, chewing sand.',  # 30 words
  ['Touchez-la et elle vous lance ses entrailles. Une semaine plus tard, elle en a de nouvelles et broute de nouveau le sable du récif.',
   'Stups sie an, und sie wirft dir ihre Innereien entgegen. Eine Woche später sind sie nachgewachsen, und sie kaut wieder Sand am Riff.',
   'Tócalo y te lanza sus entrañas. Una semana después le han crecido otras y vuelve al arrecife, masticando arena.',
   'Toccalo e ti lancia contro le sue interiora. Una settimana dopo gliene sono ricresciute di nuove ed è di nuovo sulla scogliera a masticare sabbia.',
   'Toca-lhe e ele atira-te as entranhas. Uma semana depois já criou outras e está de volta ao recife, a mastigar areia.',
   'Sundutin mo at ibabato nito sa iyo ang laman-loob nito. Makalipas ang isang linggo, may bago na itong laman-loob at bumalik na sa bahura, ngumunguya ng buhangin.',
   'குத்தினால் தன் குடலை உன் மீது வீசும். ஒரு வாரத்தில் புதியவை வளர்ந்து, மீண்டும் பவளப்பாறையில் மணலை மென்றுகொண்டிருக்கும்.',
   'Colek dia, dan ia melempar isi perutnya padamu. Seminggu kemudian isi perutnya tumbuh lagi dan ia kembali di karang, mengunyah pasir.',
   '戳它一下，它就把内脏朝你喷出来。一周后新的长好了，它又回到礁石上嚼沙子。', '戳牠一下，牠就把內臟朝你噴出來。一週後新的長好了，牠又回到礁石上嚼沙子。',
   'つつくと内臓を投げつけてくる。一週間後には新しいのが生えそろい、また礁で砂を噛んでいる。', '찌르면 내장을 내던진다. 일주일 뒤면 새 내장이 자라 다시 산호초에서 모래를 씹고 있다.']),
 # "older than the castle" / "in no hurry" was the joke on six old creatures: three keep it, three get their own line
 ('old-sturgeon', 'Its bony plates were armour long before anyone forged any. It has outlived every smith since.',
  ['Ses plaques osseuses étaient une armure bien avant que quiconque en forge une. Il a survécu à tous les forgerons depuis.',
   'Seine Knochenplatten waren eine Rüstung, lange bevor jemand eine schmiedete. Er hat seither jeden Schmied überlebt.',
   'Sus placas óseas eran armadura mucho antes de que nadie forjara una. Ha sobrevivido a todos los herreros desde entonces.',
   'Le sue placche ossee erano un’armatura molto prima che qualcuno ne forgiasse una. Da allora è sopravvissuto a ogni fabbro.',
   'As suas placas ósseas eram armadura muito antes de alguém forjar alguma. Desde então sobreviveu a todos os ferreiros.',
   'Baluti na ang matitigas nitong kaliskis bago pa may nakapanday nito. Nalampasan na nito ang buhay ng bawat panday mula noon.',
   'யாரும் கவசம் அடிப்பதற்கு நெடுங்காலம் முன்பே அதன் எலும்புத் தகடுகள் கவசமாக இருந்தன. அன்றிலிருந்து ஒவ்வொரு கொல்லரையும் விட அது நீண்டு வாழ்ந்திருக்கிறது.',
   'Lempeng tulangnya sudah menjadi zirah jauh sebelum ada yang menempanya. Sejak itu ia hidup lebih lama dari setiap pandai besi.',
   '早在有人锻造铠甲之前，它的骨板就已是铠甲。从那以后，每个铁匠都没它活得久。', '早在有人鍛造鎧甲之前，牠的骨板就已是鎧甲。從那以後，每個鐵匠都沒牠活得久。',
   '誰かが鎧を鍛えるずっと前から、その骨の板は鎧だった。以来、どの鍛冶屋よりも長生きしている。', '누가 갑옷을 벼리기 훨씬 전부터 그 뼈판은 갑옷이었다. 그 뒤로 모든 대장장이보다 오래 살았다.']),
 ('bog-behemoth', 'Wider than the moat, heavier than the drawbridge, and perfectly happy where the mud is deepest.',
  ['Plus large que les douves, plus lourd que le pont-levis, et parfaitement heureux là où la boue est la plus profonde.',
   'Breiter als der Burggraben, schwerer als die Zugbrücke und rundum zufrieden, wo der Schlamm am tiefsten ist.',
   'Más ancho que el foso, más pesado que el puente levadizo y feliz del todo donde el barro es más hondo.',
   'Più largo del fossato, più pesante del ponte levatoio, e felicissimo dove il fango è più profondo.',
   'Mais largo do que o fosso, mais pesado do que a ponte levadiça, e perfeitamente feliz onde a lama é mais funda.',
   'Mas malapad kaysa sa moat, mas mabigat kaysa sa tulay-levadiso, at lubos na masaya kung saan pinakamalalim ang putik.',
   'அகழியை விட அகலம், தூக்குப் பாலத்தை விட கனம்; சேறு மிக ஆழமான இடத்தில் முழு மகிழ்ச்சியுடன் இருக்கும்.',
   'Lebih lebar dari parit, lebih berat dari jembatan angkat, dan sangat senang di tempat lumpurnya paling dalam.',
   '比护城河还宽，比吊桥还重，在淤泥最深的地方过得心满意足。', '比護城河還寬，比吊橋還重，在淤泥最深的地方過得心滿意足。',
   '堀より幅広く、跳ね橋より重い。泥がいちばん深い場所で、すっかり満足している。', '해자보다 넓고 도개교보다 무거우며, 진흙이 가장 깊은 곳에서 더없이 행복하다.']),
 ('nautilus-drifter', 'A living fossil, quietly hoarding pearls since the sea was young.',
  ['Un fossile vivant qui amasse des perles en silence depuis que la mer est jeune.', 'Ein lebendes Fossil, das still Perlen hortet, seit das Meer jung war.',
   'Un fósil viviente que acumula perlas en silencio desde que el mar era joven.', 'Un fossile vivente che accumula perle in silenzio da quando il mare era giovane.',
   'Um fóssil vivo que junta pérolas em silêncio desde que o mar era jovem.', 'Isang buhay na fossil, tahimik na nag-iipon ng perlas mula pa noong bata pa ang dagat.',
   'ஒரு உயிருள்ள புதைபடிவம்; கடல் இளமையாக இருந்ததிலிருந்தே அமைதியாக முத்துகளைச் சேர்த்து வருகிறது.', 'Fosil hidup yang diam-diam menimbun mutiara sejak laut masih muda.',
   '一块活化石，从大海年轻时起就默默囤积珍珠。', '一塊活化石，從大海年輕時起就默默囤積珍珠。', '生きた化石。海が若かった頃から、黙々と真珠をため込んでいる。', '살아 있는 화석. 바다가 젊던 시절부터 조용히 진주를 모아 왔다.']),
]

# ---- translations only: the group dungeon is Multiplayer (X19); rows whose English names a multiplayer dungeon
GROUP = {'fr': [('donjon de groupe', 'donjon multijoueur')], 'de': [('Gruppen-Dungeon', 'Mehrspieler-Dungeon')],
         'es': [('mazmorras de grupo', 'mazmorras multijugador'), ('mazmorra de grupo', 'mazmorra multijugador')],
         'it': [('dungeon di gruppo', 'dungeon multigiocatore')],
         'pt': [('masmorras em grupo', 'masmorras multijogador'), ('masmorra em grupo', 'masmorra multijogador')],
         'tl': [('group dungeon', 'multiplayer dungeon')], 'ta': [('குழு நிலவறை', 'பலர் விளையாட்டு நிலவறை')], 'id': [('dungeon grup', 'dungeon multipemain')],
         'zh-Hans': [('组队地下城', '多人地下城')], 'zh-Hant': [('組隊地下城', '多人地下城')], 'ja': [('グループダンジョン', 'マルチプレイダンジョン')],
         'ko': [('그룹 던전', '멀티플레이 던전')]}
GROUP_EN = re.compile(r'multiplayer[- ]dungeon', re.I)

def load(p): return json.load(open(p, encoding='utf-8'))
def dump(path, d):
    with open(path, 'w', encoding='utf-8') as fh:
        json.dump(d, fh, ensure_ascii=False, indent=1); fh.write('\n')
def rename_in_place(pack, old, new, val):
    if old not in pack: pack[new] = val; return pack
    out = {}
    for k, v in pack.items():
        if k == old: out[new] = val
        elif k == new: continue
        else: out[k] = v
    return out
def translate(row, i, cur):
    if row == 'keep':
        assert cur is not None, 'keep needs an existing row'
        return cur
    if isinstance(row, tuple):
        a, b = row[1][i]
        assert cur is not None and a in cur, (CODES[i], cur, a)
        return cur.replace(a, b, 1)
    assert len(row) == 12; return row[i]

# 1) English
tp = os.path.join(ROOT, 'bramblewood-texts.js'); src = open(tp, encoding='utf-8').read()
moves = []  # (old English, new English, row, default pack: '' or 'ui/')
for k, en, row in TX:
    m = re.search(r'^  "%s": (".*?"),?\n' % re.escape(k), src, re.M); assert m, k
    old = json.loads(m.group(1))
    if old != en:
        src = src.replace(m.group(0), m.group(0).replace(m.group(1), json.dumps(en, ensure_ascii=False)))
    moves.append((old, en, row, ''))
open(tp, 'w', encoding='utf-8').write(src)
ap = os.path.join(ROOT, 'arena_app.js'); app = open(ap, encoding='utf-8').read()
for a, b, oldk, newk, row in APP:
    if a in app: assert app.count(a) == 1, a; app = app.replace(a, b)
    else: assert b in app, ('neither old nor new text in arena_app.js', a)
    moves.append((oldk, newk, row, 'ui/'))
open(ap, 'w', encoding='utf-8').write(app)
cp = os.path.join(ROOT, 'canonical', 'cards.json'); cj = open(cp, encoding='utf-8').read(); cards = {c['id']: c for c in json.loads(cj)}
for cid, en, row in FLAV:
    old = cards[cid]['flavor']
    if old != en:
        a = '"flavor": ' + json.dumps(old); assert cj.count(a) == 1, cid
        cj = cj.replace(a, '"flavor": ' + json.dumps(en))
    moves.append((old, en, row, 'ui/'))
open(cp, 'w', encoding='utf-8').write(cj); json.loads(cj)

# 2) the 12 packs
txt_now = src
for i, code in enumerate(CODES):
    paths = {'': os.path.join(ROOT, 'lang', code + '.json'), 'ui/': os.path.join(ROOT, 'lang', 'ui', code + '.json')}
    packs = {s: load(p) for s, p in paths.items()}
    for old, en, row, home in moves:
        if old == en and row in ('keep',) : continue
        where = next((s for s in (home, '' if home else 'ui/') if old in packs[s]), None) or next((s for s in (home, '' if home else 'ui/') if en in packs[s]), home)
        pk = packs[where]
        cur = pk.get(old) if old in pk else pk.get(en)
        if old == en:  # English unchanged: only the translation (never here today, kept for reruns)
            continue
        if old not in pk and en in pk and row != 'keep' and not isinstance(row, tuple): pk[en] = translate(row, i, pk[en]); continue
        if old not in pk and en in pk: continue  # already applied
        val = translate(row, i, cur) if (cur is not None or not (row == 'keep' or isinstance(row, tuple))) else None
        if val is None: continue  # a 'keep' / 'sub' row this pack never had: nothing to carry
        still = ('": ' + json.dumps(old, ensure_ascii=False) + ',') in txt_now or ('": ' + json.dumps(old, ensure_ascii=False) + '\n') in txt_now
        if still: pk[en] = val  # another key still shows the old English: keep its row, add this one
        else: packs[where] = rename_in_place(pk, old, en, val)
    for s, pk in packs.items():
        for k in list(pk):
            if GROUP_EN.search(k):
                v = pk[k]
                for a, b in GROUP[code]: v = v.replace(a, b)
                pk[k] = v
        dump(paths[s], pk)
print('ok:', len(TX), 'TX,', len(APP), 'app,', len(FLAV), 'flavour; group-dungeon translations follow X19')
