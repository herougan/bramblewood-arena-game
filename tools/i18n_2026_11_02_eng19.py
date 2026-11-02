#!/usr/bin/env python3
"""Package ENG19 (2026-11-02; owner 22:15 #5 #6 #13 #15 and 22:26): the new and changed texts in all 12 languages.
  - lang/<code>.json (keyed by English): Pearl / Pearl Bed, Majesty, Grant Shield and Bloom's "what fills it" lines (new keys appended).
  - lang/ui/<code>.json: Swarm's two lines lose "Structures don't count." (#6). The keys are renamed in place, so the order is kept.
Nothing is sorted. Tagalog, Tamil and Indonesian deserve a native read.
    python3 tools/i18n_2026_11_02_eng19.py   (idempotent)"""
import json, os
ROOT = os.path.join(os.path.dirname(os.path.abspath(__file__)), '..')
CODES = ['fr', 'de', 'es', 'it', 'pt', 'tl', 'ta', 'id', 'zh-Hans', 'zh-Hant', 'ja', 'ko']

# (English, [fr, de, es, it, pt, tl, ta, id, zh-Hans, zh-Hant, ja, ko])
T = [
 ("Every turn while it is Ready, you gain {n} Pearl. A Pearl pays for 1 Lumber or 1 Stone.", [
  "À chaque tour où il est Prêt, vous gagnez {n} Perle. Une Perle paie 1 Bois ou 1 Pierre.",
  "In jedem Zug, in dem es bereit ist, erhältst du {n} Perle. Eine Perle zahlt 1 Holz oder 1 Stein.",
  "Cada turno que está Listo, ganas {n} Perla. Una Perla paga 1 de Madera o 1 de Piedra.",
  "Ogni turno in cui è Pronto, ottieni {n} Perla. Una Perla paga 1 Legname o 1 Pietra.",
  "A cada turno em que está Pronto, você ganha {n} Pérola. Uma Pérola paga 1 Madeira ou 1 Pedra.",
  "Bawat turno na Handa ito, makakakuha ka ng {n} Perlas. Ang isang Perlas ay pambayad sa 1 Kahoy o 1 Bato.",
  "தயாராக இருக்கும் ஒவ்வொரு திருப்பத்திலும் {n} முத்து பெறுவீர்கள். ஒரு முத்து 1 மரம் அல்லது 1 கல்லுக்குச் செலுத்தும்.",
  "Setiap giliran saat Siap, kamu mendapat {n} Mutiara. Satu Mutiara membayar 1 Kayu atau 1 Batu.",
  "它就绪的每个回合，你获得 {n} 珍珠。1 颗珍珠可抵 1 木材或 1 石材。",
  "它就緒的每個回合，你獲得 {n} 珍珠。1 顆珍珠可抵 1 木材或 1 石材。",
  "準備完了の間、毎ターン真珠を{n}得る。真珠1つは木材1か石1の代わりに払える。",
  "준비된 동안 매 턴 진주 {n}을 얻습니다. 진주 1개는 목재 1 또는 돌 1로 지불됩니다."]),
 ("Once: when its Wait runs out (a Wait 0 card: as it is played). Pearl Bed is the one that pays every turn.", [
  "Une seule fois : quand son Attente se termine (une carte à Attente 0 : dès qu’elle est jouée). C’est le Banc de perles qui paie à chaque tour.",
  "Einmal: wenn seine Wartezeit abläuft (eine Karte mit Wartezeit 0: sobald sie gespielt wird). Die Perlenbank zahlt jeden Zug.",
  "Una vez: cuando se agota su Espera (una carta con Espera 0: al jugarla). El Lecho de perlas es el que paga cada turno.",
  "Una volta: quando la sua Attesa finisce (una carta con Attesa 0: appena giocata). È il Banco di perle a pagare ogni turno.",
  "Uma vez: quando sua Espera acaba (uma carta com Espera 0: ao ser jogada). O Banco de pérolas é que paga a cada turno.",
  "Isang beses: kapag naubos ang Hintay nito (kard na Hintay 0: pagkalaro nito). Ang Higaan ng Perlas ang nagbabayad bawat turno.",
  "ஒருமுறை மட்டும்: அதன் காத்திருப்பு முடியும்போது (காத்திருப்பு 0 அட்டை: விளையாடியதும்). ஒவ்வொரு திருப்பமும் செலுத்துவது முத்துப் படுகை.",
  "Sekali: saat Tunggu-nya habis (kartu Tunggu 0: saat dimainkan). Hamparan Mutiara-lah yang membayar setiap giliran.",
  "仅一次：在它的等待结束时（等待为 0 的卡：打出时）。每回合都给的是珍珠床。",
  "僅一次：在它的等待結束時（等待為 0 的卡：打出時）。每回合都給的是珍珠床。",
  "一度だけ：待機が尽きた時（待機0のカードは出した時）。毎ターン払うのは真珠床。",
  "한 번만: 대기가 끝날 때 (대기 0 카드는 낼 때). 매 턴 주는 것은 진주 밭입니다."]),
 ("It pays at the start of every turn it is Ready (not while Waiting, Stunned, Frozen or Asleep). Pearls are spent only when you are short: Lumber and Stone go first, then Pearls make up the rest.", [
  "Il paie au début de chaque tour où il est Prêt (pas en Attente, Étourdi, Gelé ou Endormi). Les Perles ne servent que s’il vous manque : Bois et Pierre d’abord, puis les Perles complètent.",
  "Es zahlt zu Beginn jedes Zuges, in dem es bereit ist (nicht beim Warten, betäubt, eingefroren oder schlafend). Perlen werden nur ausgegeben, wenn dir etwas fehlt: erst Holz und Stein, dann füllen Perlen auf.",
  "Paga al inicio de cada turno que está Listo (no en Espera, Aturdido, Congelado ni Dormido). Las Perlas se gastan solo si te falta: primero Madera y Piedra, luego las Perlas completan.",
  "Paga all’inizio di ogni turno in cui è Pronto (non in Attesa, Stordito, Congelato o Addormentato). Le Perle si spendono solo se manca qualcosa: prima Legname e Pietra, poi le Perle completano.",
  "Paga no início de cada turno em que está Pronto (não em Espera, Atordoado, Congelado ou Dormindo). Pérolas só são gastas quando falta: primeiro Madeira e Pedra, depois as Pérolas completam.",
  "Nagbabayad ito sa simula ng bawat turno na Handa ito (hindi habang Naghihintay, Natigilan, Nagyelo o Tulog). Ginagamit lang ang Perlas kapag kulang: Kahoy at Bato muna, saka pupunuin ng Perlas.",
  "தயாராக இருக்கும் ஒவ்வொரு திருப்பத்தின் தொடக்கத்திலும் செலுத்தும் (காத்திருக்கும்போது, திகைத்தபோது, உறைந்தபோது, உறங்கும்போது அல்ல). பற்றாக்குறையில் மட்டும் முத்துகள் செலவாகும்: முதலில் மரம், கல்; மீதியை முத்துகள் நிரப்பும்.",
  "Membayar di awal setiap giliran saat Siap (tidak saat Menunggu, Pingsan, Membeku, atau Tertidur). Mutiara dipakai hanya saat kurang: Kayu dan Batu dulu, lalu Mutiara menutup sisanya.",
  "它在每个就绪回合开始时给（等待、眩晕、冰冻或睡着时不给）。只有不足时才花珍珠：先用木材和石材，再用珍珠补足。",
  "它在每個就緒回合開始時給（等待、暈眩、冰凍或睡著時不給）。只有不足時才花珍珠：先用木材和石材，再用珍珠補足。",
  "準備完了の毎ターン開始時に払う（待機中・スタン・凍結・睡眠中は払わない）。真珠は足りない時だけ使う：先に木材と石、残りを真珠で補う。",
  "준비된 매 턴 시작에 줍니다 (대기, 기절, 빙결, 수면 중에는 아님). 진주는 부족할 때만 씁니다: 목재와 돌을 먼저, 나머지는 진주로 채웁니다."]),
 ("Majesty", ["Majesté", "Majestät", "Majestad", "Maestà", "Majestade", "Kamahalan", "மாட்சிமை", "Keagungan", "威仪", "威儀", "威厳", "위엄"]),
 ("While Ready, enemy units facing it (its column and the next ones) attack with {n} less Attack.", [
  "Tant qu’il est Prêt, les unités ennemies en face (sa colonne et les colonnes voisines) attaquent avec {n} d’Attaque en moins.",
  "Solange es bereit ist, greifen gegnerische Einheiten ihm gegenüber (seine Spalte und die Spalten daneben) mit {n} weniger Angriff an.",
  "Mientras está Listo, las unidades enemigas frente a él (su columna y las de al lado) atacan con {n} de Ataque menos.",
  "Finché è Pronto, le unità nemiche di fronte (la sua colonna e quelle accanto) attaccano con {n} di Attacco in meno.",
  "Enquanto está Pronto, as unidades inimigas à sua frente (sua coluna e as vizinhas) atacam com {n} de Ataque a menos.",
  "Habang Handa ito, ang mga kalabang yunit na kaharap nito (ang hanay nito at ang mga katabing hanay) ay umaatake nang {n} na mas mababang Atake.",
  "அது தயாராக இருக்கும்வரை, அதை எதிர்கொள்ளும் எதிரி அலகுகள் (அதன் நிரல், அருகிலுள்ள நிரல்கள்) {n} குறைந்த தாக்குதலுடன் தாக்கும்.",
  "Selama Siap, unit musuh yang menghadapnya (kolomnya dan kolom di sebelahnya) menyerang dengan Serangan {n} lebih rendah.",
  "它就绪时，面对它的敌方单位（它的列及相邻列）攻击时攻击力 -{n}。",
  "它就緒時，面對它的敵方單位（它的列及相鄰列）攻擊時攻擊力 -{n}。",
  "準備完了の間、向かい合う敵ユニット（その列と隣の列）は攻撃力-{n}で攻撃する。",
  "준비된 동안 맞은편 적 유닛(그 열과 옆 열)은 공격력이 {n} 낮은 채로 공격합니다."]),
 ("Several Majesty units don't add up on one enemy: the biggest counts. It weakens their attacks only, not their skills or Thorns.", [
  "Plusieurs unités Majesté ne s’additionnent pas sur un même ennemi : la plus forte compte. Seules ses attaques sont affaiblies, pas ses compétences ni ses Épines.",
  "Mehrere Majestät-Einheiten addieren sich bei einem Gegner nicht: die größte zählt. Nur seine Angriffe werden geschwächt, nicht seine Fertigkeiten oder Dornen.",
  "Varias unidades con Majestad no se suman sobre un enemigo: cuenta la mayor. Solo debilita sus ataques, no sus habilidades ni sus Espinas.",
  "Più unità con Maestà non si sommano su un nemico: conta la più alta. Indebolisce solo i suoi attacchi, non le abilità né le Spine.",
  "Várias unidades com Majestade não se somam num inimigo: vale a maior. Só enfraquece os ataques dele, não as habilidades nem os Espinhos.",
  "Hindi nagdadagdagan ang ilang yunit na may Kamahalan sa iisang kalaban: ang pinakamalaki ang bilang. Atake lang nito ang humihina, hindi ang mga kakayahan o Mga tinik.",
  "பல மாட்சிமை அலகுகள் ஒரே எதிரியின் மீது கூடாது: பெரியதே கணக்கு. அதன் தாக்குதல்கள் மட்டுமே பலவீனமாகும், திறன்களோ முட்களோ அல்ல.",
  "Beberapa unit Keagungan tidak bertambah pada satu musuh: yang terbesar yang dihitung. Hanya serangannya yang melemah, bukan kemampuan atau Duri-nya.",
  "多个威仪单位对同一敌人不叠加：取最大的。只削弱它的攻击，不影响技能或荆刺。",
  "多個威儀單位對同一敵人不疊加：取最大的。只削弱它的攻擊，不影響技能或荊刺。",
  "複数の威厳は同じ敵に重ならない：最大のものだけ。弱まるのは攻撃だけで、スキルや棘は弱まらない。",
  "여러 위엄 유닛은 한 적에게 합산되지 않습니다: 가장 큰 값만. 공격만 약해지고 스킬이나 가시는 아닙니다."]),
 ("Grant Shield", ["Accorder un Bouclier", "Schild gewähren", "Otorgar Escudo", "Concedi Scudo", "Conceder Escudo", "Magbigay ng Panangga", "கவசம் வழங்கு", "Beri Perisai", "赋予护盾", "賦予護盾", "シールド付与", "보호막 부여"]),
 ("Give Shield (temporary Health that soaks damage first and never comes back): N to itself, N to each adjacent ally (in front, behind, left, right), N to each ally around it (corners too), or N to every ally. Fill in any of the four.", [
  "Donne du Bouclier (des PV temporaires qui absorbent les dégâts en premier et ne reviennent jamais) : N à lui-même, N à chaque allié adjacent (devant, derrière, à gauche, à droite), N à chaque allié autour (coins compris), ou N à chaque allié. Remplissez n’importe lesquels des quatre.",
  "Gibt Schild (temporäre Lebenspunkte, die Schaden zuerst schlucken und nie zurückkommen): N sich selbst, N jedem angrenzenden Verbündeten (vorne, hinten, links, rechts), N jedem Verbündeten ringsum (auch diagonal) oder N jedem Verbündeten. Fülle beliebige der vier aus.",
  "Da Escudo (Salud temporal que absorbe el daño primero y nunca vuelve): N a sí mismo, N a cada aliado adyacente (delante, detrás, izquierda, derecha), N a cada aliado alrededor (esquinas incluidas) o N a cada aliado. Rellena cualquiera de los cuatro.",
  "Dà Scudo (Salute temporanea che assorbe i danni per prima e non torna mai): N a sé stesso, N a ogni alleato adiacente (davanti, dietro, a sinistra, a destra), N a ogni alleato intorno (angoli compresi) o N a ogni alleato. Compila uno qualsiasi dei quattro.",
  "Dá Escudo (Vida temporária que absorve o dano primeiro e nunca volta): N a si mesmo, N a cada aliado adjacente (frente, trás, esquerda, direita), N a cada aliado ao redor (cantos inclusive) ou N a cada aliado. Preencha qualquer um dos quatro.",
  "Nagbibigay ng Panangga (pansamantalang Buhay na unang sumisipsip ng pinsala at hindi na bumabalik): N sa sarili, N sa bawat katabing kakampi (harap, likod, kaliwa, kanan), N sa bawat kakampi sa paligid nito (kasama ang mga sulok), o N sa bawat kakampi. Punan ang alinman sa apat.",
  "கவசம் தரும் (சேதத்தை முதலில் உறிஞ்சி திரும்ப வராத தற்காலிக உயிர்): தனக்கு N, ஒவ்வொரு அருகிலுள்ள கூட்டாளிக்கும் N (முன், பின், இடம், வலம்), சுற்றியுள்ள ஒவ்வொரு கூட்டாளிக்கும் N (மூலைகளும்), அல்லது ஒவ்வொரு கூட்டாளிக்கும் N. நான்கில் எதையும் நிரப்பலாம்.",
  "Memberi Perisai (Nyawa sementara yang menyerap kerusakan lebih dulu dan tidak pernah kembali): N untuk dirinya, N untuk tiap sekutu bersebelahan (depan, belakang, kiri, kanan), N untuk tiap sekutu di sekitarnya (termasuk sudut), atau N untuk setiap sekutu. Isi yang mana pun dari keempatnya.",
  "给予护盾（先吸收伤害、用掉就不回来的临时生命）：给自己 N，给每个相邻友军 N（前、后、左、右），给周围每个友军 N（含斜角），或给每个友军 N。四项任填。",
  "給予護盾（先吸收傷害、用掉就不回來的臨時生命）：給自己 N，給每個相鄰友軍 N（前、後、左、右），給周圍每個友軍 N（含斜角），或給每個友軍 N。四項任填。",
  "シールドを与える（先にダメージを吸収し、二度と戻らない一時的な体力）：自分にN、隣接する各味方にN（前・後・左・右）、周囲の各味方にN（斜めも）、または全味方にN。4つのどれでも入力できる。",
  "보호막을 줍니다 (피해를 먼저 흡수하고 다시 돌아오지 않는 임시 체력): 자신에게 N, 인접한 각 아군에게 N (앞, 뒤, 왼쪽, 오른쪽), 주변 각 아군에게 N (대각선 포함), 또는 모든 아군에게 N. 넷 중 아무거나 채우세요."]),
 ("give itself {n} Shield", ["se donne {n} de Bouclier", "gibt sich {n} Schild", "se da {n} de Escudo", "si dà {n} di Scudo", "dá a si mesmo {n} de Escudo", "binibigyan ang sarili ng {n} Panangga", "தனக்கு {n} கவசம் தரும்", "memberi dirinya {n} Perisai", "给自己 {n} 护盾", "給自己 {n} 護盾", "自分にシールド{n}", "자신에게 보호막 {n}"]),
 ("give each adjacent ally {n} Shield", ["donne {n} de Bouclier à chaque allié adjacent", "gibt jedem angrenzenden Verbündeten {n} Schild", "da {n} de Escudo a cada aliado adyacente", "dà {n} di Scudo a ogni alleato adiacente", "dá {n} de Escudo a cada aliado adjacente", "binibigyan ang bawat katabing kakampi ng {n} Panangga", "ஒவ்வொரு அருகிலுள்ள கூட்டாளிக்கும் {n} கவசம் தரும்", "memberi tiap sekutu bersebelahan {n} Perisai", "给每个相邻友军 {n} 护盾", "給每個相鄰友軍 {n} 護盾", "隣接する各味方にシールド{n}", "인접한 각 아군에게 보호막 {n}"]),
 ("give each ally around it {n} Shield", ["donne {n} de Bouclier à chaque allié autour de lui", "gibt jedem Verbündeten ringsum {n} Schild", "da {n} de Escudo a cada aliado a su alrededor", "dà {n} di Scudo a ogni alleato intorno", "dá {n} de Escudo a cada aliado ao redor", "binibigyan ang bawat kakampi sa paligid nito ng {n} Panangga", "சுற்றியுள்ள ஒவ்வொரு கூட்டாளிக்கும் {n} கவசம் தரும்", "memberi tiap sekutu di sekitarnya {n} Perisai", "给周围每个友军 {n} 护盾", "給周圍每個友軍 {n} 護盾", "周囲の各味方にシールド{n}", "주변 각 아군에게 보호막 {n}"]),
 ("give every ally {n} Shield", ["donne {n} de Bouclier à chaque allié", "gibt jedem Verbündeten {n} Schild", "da {n} de Escudo a cada aliado", "dà {n} di Scudo a ogni alleato", "dá {n} de Escudo a cada aliado", "binibigyan ang bawat kakampi ng {n} Panangga", "ஒவ்வொரு கூட்டாளிக்கும் {n} கவசம் தரும்", "memberi setiap sekutu {n} Perisai", "给每个友军 {n} 护盾", "給每個友軍 {n} 護盾", "全味方にシールド{n}", "모든 아군에게 보호막 {n}"]),
 ("Blooms when all of these hold: {list}.", ["Fleurit quand tout ceci est vrai : {list}.", "Blüht, wenn all dies gilt: {list}.", "Florece cuando se cumple todo esto: {list}.", "Fiorisce quando vale tutto questo: {list}.", "Floresce quando tudo isto vale: {list}.", "Namumulaklak kapag totoo ang lahat ng ito: {list}.", "இவை அனைத்தும் இருக்கும்போது மலரும்: {list}.", "Mekar saat semua ini terpenuhi: {list}.", "以下全部满足时开花：{list}。", "以下全部滿足時開花：{list}。", "次のすべてを満たすと開花：{list}。", "다음이 모두 맞으면 개화: {list}."]),
 ("Blooms when any of these holds: {list}.", ["Fleurit quand l’un de ceci est vrai : {list}.", "Blüht, wenn eines davon gilt: {list}.", "Florece cuando se cumple alguna de estas: {list}.", "Fiorisce quando vale una di queste: {list}.", "Floresce quando qualquer um destes vale: {list}.", "Namumulaklak kapag totoo ang alinman dito: {list}.", "இவற்றில் ஏதேனும் ஒன்று இருக்கும்போது மலரும்: {list}.", "Mekar saat salah satu ini terpenuhi: {list}.", "以下任一满足时开花：{list}。", "以下任一滿足時開花：{list}。", "次のどれかを満たすと開花：{list}。", "다음 중 하나라도 맞으면 개화: {list}."]),
 ("you have {n} Lumber to pay", ["vous avez {n} Bois pour payer", "du hast {n} Holz zum Bezahlen", "tienes {n} de Madera para pagar", "hai {n} Legname per pagare", "você tem {n} Madeira para pagar", "may {n} Kahoy ka na pambayad", "செலுத்த {n} மரம் உங்களிடம் உள்ளது", "kamu punya {n} Kayu untuk membayar", "你有 {n} 木材可付", "你有 {n} 木材可付", "払える木材が{n}ある", "지불할 목재 {n}이 있음"]),
 ("Tide: the tide is coming in", ["Marée : la marée monte", "Flut: das Wasser steigt", "Marea: la marea está subiendo", "Marea: la marea sta salendo", "Maré: a maré está subindo", "Alon: tumataas ang tubig", "அலை: அலை ஏறுகிறது", "Pasang: air sedang pasang", "潮汐：正在涨潮", "潮汐：正在漲潮", "潮：潮が満ちてくる", "물결: 밀물이 들어옴"]),
 ("Ebb: the tide is out", ["Reflux : la marée est basse", "Ebbe: das Wasser ist draußen", "Bajamar: la marea está baja", "Riflusso: la marea è bassa", "Vazante: a maré está baixa", "Kati: mababa ang tubig", "இறக்கம்: அலை இறங்கியுள்ளது", "Surut: air sedang surut", "退潮：潮水已退", "退潮：潮水已退", "引き潮：潮が引いている", "썰물: 물이 빠짐"]),
 ("Night: night or Twilight", ["Nuit : la nuit ou le Crépuscule", "Nacht: Nacht oder Dämmerung", "Noche: de noche o en el Crepúsculo", "Notte: di notte o al Crepuscolo", "Noite: à noite ou no Crepúsculo", "Gabi: gabi o Takipsilim", "இரவு: இரவு அல்லது அந்தி", "Malam: malam atau Senja", "夜晚：夜晚或黄昏", "夜晚：夜晚或黃昏", "夜：夜か薄明", "밤: 밤 또는 황혼"]),
 ("Day: day or Twilight", ["Jour : le jour ou le Crépuscule", "Tag: Tag oder Dämmerung", "Día: de día o en el Crepúsculo", "Giorno: di giorno o al Crepuscolo", "Dia: de dia ou no Crepúsculo", "Araw: araw o Takipsilim", "பகல்: பகல் அல்லது அந்தி", "Siang: siang atau Senja", "白天：白天或黄昏", "白天：白天或黃昏", "昼：昼か薄明", "낮: 낮 또는 황혼"]),
 ("Twilight", ["Crépuscule", "Dämmerung", "Crepúsculo", "Crepuscolo", "Crepúsculo", "Takipsilim", "அந்தி", "Senja", "黄昏", "黃昏", "薄明", "황혼"]),
 ("Wind: a windy round", ["Vent : une manche venteuse", "Wind: eine windige Runde", "Viento: una ronda con viento", "Vento: un round ventoso", "Vento: uma rodada com vento", "Hangin: isang mahanging round", "காற்று: காற்றுள்ள சுற்று", "Angin: ronde berangin", "风：有风的一轮", "風：有風的一輪", "風：風の吹くラウンド", "바람: 바람 부는 라운드"]),
 ("Wet: rain, the tide coming in, or a beach, river or sea map", ["Mouillée : la pluie, la marée qui monte, ou une carte de plage, de rivière ou de mer", "Nass: Regen, steigende Flut oder eine Strand-, Fluss- oder Meereskarte", "Mojada: lluvia, la marea subiendo, o un mapa de playa, río o mar", "Bagnata: pioggia, la marea che sale, o una mappa di spiaggia, fiume o mare", "Molhada: chuva, a maré subindo, ou um mapa de praia, rio ou mar", "Basa: ulan, tumataas na tubig, o mapa ng dalampasigan, ilog o dagat", "நனைந்தது: மழை, ஏறும் அலை, அல்லது கடற்கரை, ஆறு அல்லது கடல் வரைபடம்", "Basah: hujan, air pasang, atau peta pantai, sungai, atau laut", "潮湿：下雨、涨潮，或海滩、河流、海洋地图", "潮溼：下雨、漲潮，或海灘、河流、海洋地圖", "濡れ：雨、満ちてくる潮、または浜・川・海のマップ", "젖음: 비, 밀물, 또는 해변·강·바다 맵"]),
 ("Dark: night, or darkness over the field", ["Sombre : la nuit, ou les ténèbres sur le terrain", "Dunkel: Nacht oder Dunkelheit über dem Feld", "Oscuro: de noche, u oscuridad sobre el campo", "Buio: di notte, o oscurità sul campo", "Escuro: à noite, ou escuridão sobre o campo", "Dilim: gabi, o kadiliman sa larangan", "இருள்: இரவு, அல்லது களத்தின் மீது இருள்", "Gelap: malam, atau kegelapan di medan", "黑暗：夜晚，或场上一片黑暗", "黑暗：夜晚，或場上一片黑暗", "暗闇：夜、またはフィールドを覆う闇", "어둠: 밤, 또는 전장의 어둠"]),
 ("Heat: a Heatwave", ["Chaleur : une Canicule", "Hitze: eine Hitzewelle", "Calor: una Ola de calor", "Caldo: un’Ondata di calore", "Calor: uma Onda de calor", "Init: isang Heatwave", "வெப்பம்: வெப்ப அலை", "Panas: Gelombang Panas", "炎热：热浪", "炎熱：熱浪", "熱：熱波", "열기: 폭염"]),
 ("Frost: the ground is frozen", ["Gel : le sol est gelé", "Frost: der Boden ist gefroren", "Escarcha: el suelo está helado", "Gelo: il terreno è ghiacciato", "Geada: o chão está congelado", "Hamog na yelo: nagyeyelo ang lupa", "உறைபனி: நிலம் உறைந்துள்ளது", "Beku: tanah membeku", "霜冻：地面结冰", "霜凍：地面結冰", "霜：地面が凍っている", "서리: 땅이 얼어 있음"]),
 ("Full Moon: a full-moon night", ["Pleine lune : une nuit de pleine lune", "Vollmond: eine Vollmondnacht", "Luna llena: una noche de luna llena", "Luna piena: una notte di luna piena", "Lua cheia: uma noite de lua cheia", "Kabilugan ng buwan: gabing kabilugan ng buwan", "முழு நிலவு: முழு நிலவு இரவு", "Bulan purnama: malam bulan purnama", "满月：满月之夜", "滿月：滿月之夜", "満月：満月の夜", "보름달: 보름달 밤"]),
 ("Rain: it is raining", ["Pluie : il pleut", "Regen: es regnet", "Lluvia: está lloviendo", "Pioggia: sta piovendo", "Chuva: está chovendo", "Ulan: umuulan", "மழை: மழை பெய்கிறது", "Hujan: sedang hujan", "雨：正在下雨", "雨：正在下雨", "雨：雨が降っている", "비: 비가 옴"]),
 ("Sunny: day or Twilight, with no rain, fog or darkness", ["Ensoleillé : le jour ou le Crépuscule, sans pluie, brouillard ni ténèbres", "Sonnig: Tag oder Dämmerung, ohne Regen, Nebel oder Dunkelheit", "Soleado: de día o en el Crepúsculo, sin lluvia, niebla ni oscuridad", "Soleggiato: di giorno o al Crepuscolo, senza pioggia, nebbia né oscurità", "Ensolarado: de dia ou no Crepúsculo, sem chuva, neblina ou escuridão", "Maaraw: araw o Takipsilim, walang ulan, hamog o dilim", "வெயில்: பகல் அல்லது அந்தி, மழை, மூடுபனி, இருள் இல்லாமல்", "Cerah: siang atau Senja, tanpa hujan, kabut, atau gelap", "晴朗：白天或黄昏，且无雨、无雾、无黑暗", "晴朗：白天或黃昏，且無雨、無霧、無黑暗", "晴れ：昼か薄明で、雨・霧・暗闇がない", "맑음: 낮 또는 황혼, 비·안개·어둠 없음"]),
 ("Killed an enemy: this unit has killed an enemy unit in this fight", ["A tué un ennemi : cette unité a tué une unité ennemie pendant ce combat", "Hat einen Gegner getötet: diese Einheit hat in diesem Kampf eine gegnerische Einheit getötet", "Mató a un enemigo: esta unidad ha matado a una unidad enemiga en este combate", "Ha ucciso un nemico: questa unità ha ucciso un’unità nemica in questo scontro", "Matou um inimigo: esta unidade matou uma unidade inimiga nesta luta", "Nakapatay ng kalaban: nakapatay ang yunit na ito ng kalabang yunit sa labanang ito", "ஒரு எதிரியைக் கொன்றது: இந்தப் போரில் இந்த அலகு ஒரு எதிரி அலகைக் கொன்றுள்ளது", "Membunuh musuh: unit ini telah membunuh unit musuh dalam pertarungan ini", "击杀过敌人：这个单位在本场战斗中击杀过敌方单位", "擊殺過敵人：這個單位在本場戰鬥中擊殺過敵方單位", "敵を倒した：このユニットがこの戦いで敵ユニットを倒している", "적을 처치함: 이 유닛이 이번 전투에서 적 유닛을 처치함"]),
]

# Swarm (#6): the lang/ui keys lose their last sentence. (old key, new key)
SWARM = [
 ("+{v1} Attack for every ally that shares a type with it (e.g. every other Ant beside an Ant). Structures don't count.",
  "+{v1} Attack for every ally that shares a type with it (e.g. every other Ant beside an Ant)."),
 ("+{v1} Attack for every ally that shares a type with it. Structures don't count.",
  "+{v1} Attack for every ally that shares a type with it."),
]

def load(p):
    with open(p, encoding='utf-8') as f: return json.load(f)
def save(p, d):
    with open(p, 'w', encoding='utf-8') as f: json.dump(d, f, ensure_ascii=False, indent=1); f.write('\n')

def main():
    assert all(len(v) == len(CODES) for _, v in T)
    for i, c in enumerate(CODES):
        p = os.path.join(ROOT, 'lang', c + '.json'); d = load(p)
        for en, tr in T: d[en] = tr[i]
        save(p, d)
        pu = os.path.join(ROOT, 'lang', 'ui', c + '.json'); u = load(pu)
        tail = d.get("Structures don't count.", '')
        out = {}
        for k, v in u.items():
            nk = dict(SWARM).get(k)
            if nk:
                nv = v[:-len(tail)].rstrip() if tail and v.endswith(tail) else v
                assert nv != v or not tail, (c, k)
                out[nk] = nv
            else: out[k] = v
        save(pu, out)
    print('ENG19 texts written to', len(CODES), 'packs')

if __name__ == '__main__': main()
