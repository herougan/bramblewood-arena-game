#!/usr/bin/env python3
"""Game texts added on 2026-11-05 by package ENG25 (owner notes 23:35): Tide N, the new Moonpull, Immortal, Hydra, <Tribe> Delivery {Resource},
the Forage action, the Berries rule, Hatchling / Regeneration from Level 1. Adds the TX keys to bramblewood-texts.js (before the table's end, once)
and one row per English text in lang/<code>.json (rows that already exist are kept; new rows are appended, nothing is sorted).
Tagalog, Tamil, Japanese and Korean deserve a native read.
    python3 tools/i18n_2026_11_05_eng25.py   (idempotent)"""
import json, os, re
ROOT = os.path.join(os.path.dirname(os.path.abspath(__file__)), '..')
CODES = ['fr', 'de', 'es', 'it', 'pt', 'tl', 'ta', 'id', 'zh-Hans', 'zh-Hant', 'ja', 'ko']
# key, English, the 12 translations in CODES order
T = [
 ('ui.eng25-tide', 'Flood: +{n} Attack. Ebb: +{n} Armor. High Tide: +{h} Attack, +{h} Armor.', [
   'Marée haute : +{n} Attaque. Reflux : +{n} Armure. Grande marée : +{h} Attaque, +{h} Armure.',
   'Flut: +{n} Angriff. Ebbe: +{n} Rüstung. Springflut: +{h} Angriff, +{h} Rüstung.',
   'Pleamar: +{n} Ataque. Bajamar: +{n} Armadura. Marea alta: +{h} Ataque, +{h} Armadura.',
   'Flusso: +{n} Attacco. Riflusso: +{n} Armatura. Alta marea: +{h} Attacco, +{h} Armatura.',
   'Preia-mar: +{n} Ataque. Vazante: +{n} Armadura. Maré alta: +{h} Ataque, +{h} Armadura.',
   'Taog: +{n} Atake. Kati: +{n} Baluti. Malaking Taog: +{h} Atake, +{h} Baluti.',
   'ஏற்றம்: +{n} தாக்குதல். இறக்கம்: +{n} கவசம். பெருவேலை: +{h} தாக்குதல், +{h} கவசம்.',
   'Pasang: +{n} Serangan. Surut: +{n} Zirah. Pasang Tinggi: +{h} Serangan, +{h} Zirah.',
   '涨潮：攻击 +{n}。退潮：护甲 +{n}。大潮：攻击 +{h}，护甲 +{h}。',
   '漲潮：攻擊 +{n}。退潮：護甲 +{n}。大潮：攻擊 +{h}，護甲 +{h}。',
   '満ち潮：攻撃+{n}。引き潮：アーマー+{n}。大潮：攻撃+{h}、アーマー+{h}。',
   '밀물: 공격 +{n}. 썰물: 방어구 +{n}. 대조: 공격 +{h}, 방어구 +{h}.']),
 ('ui.eng25-moonpull', 'On arrival the Tide comes in. While it lives, your Tide bonuses double.', [
   'À son arrivée, la Marée monte. Tant qu’il vit, vos bonus de Marée doublent.',
   'Bei Ankunft kommt die Flut. Solange es lebt, verdoppeln sich deine Gezeitenboni.',
   'Al llegar sube la Marea. Mientras viva, tus bonos de Marea se duplican.',
   'All’arrivo sale la Marea. Finché vive, i tuoi bonus di Marea raddoppiano.',
   'Ao chegar, a Maré sobe. Enquanto vive, os teus bónus de Maré duplicam.',
   'Pagdating, papasok ang Taog. Habang buhay ito, doble ang mga bonus ng Taog mo.',
   'வரும்போது அலை உள்ளே வரும். அது உயிருடன் இருக்கும் வரை, உன் அலைப் போனஸ்கள் இரட்டிக்கும்.',
   'Saat tiba, Pasang datang. Selama ia hidup, bonus Pasangmu berlipat dua.',
   '登场时潮水涌来。它存活期间，你的潮汐加成翻倍。',
   '登場時潮水湧來。它存活期間，你的潮汐加成翻倍。',
   '登場すると潮が満ちる。生きている間、味方の潮のボーナスが2倍。',
   '등장하면 조수가 밀려옵니다. 살아 있는 동안 내 조수 보너스가 두 배가 됩니다.']),
 ('ui.eng25-moonpull-codex', 'Flood this round (an Ebb turns to Flood). Two Moonpulls still double once. Tide 2 under it counts 4.', [
   'Marée haute cette manche (un Reflux devient Marée haute). Deux Moonpull ne doublent qu’une fois. Marée 2 compte alors 4.',
   'Diese Runde Flut (eine Ebbe wird zur Flut). Zwei Moonpull verdoppeln nur einmal. Gezeiten 2 zählt dann 4.',
   'Pleamar esta ronda (una Bajamar pasa a Pleamar). Dos Moonpull duplican una sola vez. Marea 2 cuenta 4.',
   'Flusso in questo round (un Riflusso diventa Flusso). Due Moonpull raddoppiano una volta sola. Marea 2 conta 4.',
   'Preia-mar nesta ronda (uma Vazante passa a Preia-mar). Dois Moonpull duplicam só uma vez. Maré 2 conta 4.',
   'Taog ngayong round (ang Kati ay nagiging Taog). Dalawang Moonpull ay isang beses lang nagdodoble. Ang Taog 2 ay bilang na 4.',
   'இந்தச் சுற்றில் ஏற்றம் (இறக்கம் ஏற்றமாகும்). இரண்டு Moonpull ஒருமுறை மட்டுமே இரட்டிக்கும். அலை 2 அப்போது 4.',
   'Pasang ronde ini (Surut menjadi Pasang). Dua Moonpull tetap hanya melipatgandakan sekali. Pasang 2 dihitung 4.',
   '本回合涨潮（退潮变为涨潮）。两个月引也只翻倍一次。此时潮汐 2 算作 4。',
   '本回合漲潮（退潮變為漲潮）。兩個月引也只翻倍一次。此時潮汐 2 算作 4。',
   'このラウンドは満ち潮（引き潮は満ち潮に）。Moonpullが2体でも2倍は1回。潮2なら4。',
   '이번 라운드는 밀물(썰물은 밀물로). Moonpull이 둘이어도 한 번만 두 배. 조수 2는 4가 됩니다.']),
 ('ui.eng25-regen-codex', 'A Level 0 copy has no Regeneration; it arrives at Level 1.', [
   'Une copie de Niveau 0 n’a pas Régénération ; elle arrive au Niveau 1.',
   'Eine Kopie auf Stufe 0 hat keine Regeneration; sie kommt auf Stufe 1.',
   'Una copia de Nivel 0 no tiene Regeneración; llega en el Nivel 1.',
   'Una copia di Livello 0 non ha Rigenerazione; arriva al Livello 1.',
   'Uma cópia de Nível 0 não tem Regeneração; chega no Nível 1.',
   'Walang Regeneration ang kopyang Level 0; darating ito sa Level 1.',
   'நிலை 0 நகலுக்கு மீளுருவாக்கம் இல்லை; அது நிலை 1 இல் வரும்.',
   'Salinan Level 0 tidak punya Regenerasi; ia datang di Level 1.',
   '0 级副本没有再生；它在 1 级获得。',
   '0 級副本沒有再生；它在 1 級獲得。',
   'レベル0のコピーには再生がない。レベル1で得る。',
   '레벨 0 사본에는 재생이 없습니다. 레벨 1에 얻습니다.']),
 ('ui.skn-eng25-immortal', 'Immortal', ['Immortel', 'Unsterblich', 'Inmortal', 'Immortale', 'Imortal', 'Walang Kamatayan', 'அழியாதது', 'Abadi', '不朽', '不朽', '不死', '불멸']),
 ('ui.eng25-immortal', 'When it dies, a token copy with Immortal takes its place, Waiting 1 round.', [
   'Quand il meurt, une copie jeton avec Immortel prend sa place, en Attente 1 manche.',
   'Wenn es stirbt, nimmt eine Marken-Kopie mit Unsterblich seinen Platz ein, 1 Runde wartend.',
   'Al morir, una copia ficha con Inmortal ocupa su lugar, en Espera 1 ronda.',
   'Quando muore, una copia segnalino con Immortale prende il suo posto, in Attesa 1 round.',
   'Ao morrer, uma cópia ficha com Imortal toma o seu lugar, em Espera 1 ronda.',
   'Kapag namatay, isang token na kopya na may Walang Kamatayan ang papalit, Naghihintay ng 1 round.',
   'அது இறக்கும்போது, அழியாதது கொண்ட ஒரு வில்லை நகல் அதன் இடத்தை எடுக்கும், 1 சுற்று காத்திருக்கும்.',
   'Saat mati, salinan token dengan Abadi menggantikannya, Menunggu 1 ronde.',
   '它死亡时，一个带不朽的衍生物复制品取代它，等待 1 回合。',
   '它死亡時，一個帶不朽的衍生物複製品取代它，等待 1 回合。',
   '死ぬと、不死を持つトークンのコピーがその場所に現れ、1ラウンド待機する。',
   '죽으면 불멸을 가진 토큰 사본이 그 자리를 차지하고 1라운드 대기합니다.']),
 ('ui.eng25-immortal-codex', 'A copy that dies in the round it came back stays dead. A Nullify kill makes no copy.', [
   'Une copie qui meurt dans la manche de son retour reste morte. Une mort par Annulation n’en fait aucune.',
   'Eine Kopie, die in der Runde ihrer Rückkehr stirbt, bleibt tot. Ein Tod durch Annullieren macht keine.',
   'Una copia que muere en la ronda en que volvió queda muerta. Una muerte por Anular no hace copia.',
   'Una copia che muore nel round in cui è tornata resta morta. Un’uccisione con Annulla non fa copie.',
   'Uma cópia que morre na ronda em que voltou fica morta. Uma morte por Anular não faz cópia.',
   'Ang kopyang namatay sa round na bumalik ito ay mananatiling patay. Walang kopya kapag pinatay ng Nullify.',
   'திரும்பிய சுற்றிலேயே இறக்கும் நகல் இறந்தே இருக்கும். Nullify கொலை நகல் தராது.',
   'Salinan yang mati di ronde ia kembali tetap mati. Kematian oleh Nullify tidak membuat salinan.',
   '在回来的那一回合死亡的复制品不再复活。被无效化击杀不产生复制品。',
   '在回來的那一回合死亡的複製品不再復活。被無效化擊殺不產生複製品。',
   '戻ったラウンドに死んだコピーはそのまま。無効化で倒されるとコピーは出ない。',
   '돌아온 라운드에 죽은 사본은 그대로 죽습니다. 무효화로 죽으면 사본이 없습니다.']),
 ('ui.skn-eng25-hydra', 'Hydra', ['Hydre', 'Hydra', 'Hidra', 'Idra', 'Hidra', 'Hydra', 'ஹைட்ரா', 'Hydra', '九头蛇', '九頭蛇', 'ヒュドラ', '히드라']),
 ('ui.eng25-hydra', 'When it dies, two half-size token copies with Hydra appear beside it.', [
   'Quand il meurt, deux copies jetons de moitié, avec Hydre, apparaissent à côté.',
   'Wenn es stirbt, erscheinen daneben zwei halb so große Marken-Kopien mit Hydra.',
   'Al morir, aparecen a su lado dos copias ficha a mitad de tamaño con Hidra.',
   'Quando muore, accanto appaiono due copie segnalino dimezzate con Idra.',
   'Ao morrer, surgem ao lado duas cópias ficha a meio tamanho com Hidra.',
   'Kapag namatay, dalawang kalahating token na kopya na may Hydra ang lilitaw sa tabi nito.',
   'அது இறக்கும்போது, ஹைட்ரா கொண்ட இரண்டு பாதி அளவு வில்லை நகல்கள் அருகில் தோன்றும்.',
   'Saat mati, dua salinan token setengah ukuran dengan Hydra muncul di sebelahnya.',
   '它死亡时，旁边出现两个减半的带九头蛇的衍生物复制品。',
   '它死亡時，旁邊出現兩個減半的帶九頭蛇的衍生物複製品。',
   '死ぬと、ヒュドラを持つ半分のトークンのコピーが隣に2体現れる。',
   '죽으면 히드라를 가진 절반 크기 토큰 사본 둘이 옆에 나타납니다.']),
 ('ui.eng25-hydra-codex', 'Attack and Health halve, rounded up; Attack 1 becomes 0. Health 1 makes no copies. Never in its own slot.', [
   'Attaque et Santé divisées par deux, arrondies au-dessus ; Attaque 1 devient 0. Santé 1 ne fait pas de copies. Jamais dans sa propre case.',
   'Angriff und Leben halbiert, aufgerundet; Angriff 1 wird 0. Leben 1 macht keine Kopien. Nie auf seinem eigenen Feld.',
   'Ataque y Salud a la mitad, redondeo arriba; Ataque 1 pasa a 0. Salud 1 no hace copias. Nunca en su propia casilla.',
   'Attacco e Salute dimezzati, per eccesso; Attacco 1 diventa 0. Salute 1 non fa copie. Mai nella sua casella.',
   'Ataque e Vida a metade, arredondados para cima; Ataque 1 passa a 0. Vida 1 não faz cópias. Nunca na sua casa.',
   'Hati ang Atake at Buhay, paakyat ang pag-round; ang Atake 1 ay nagiging 0. Walang kopya kapag Buhay 1. Hindi kailanman sa sarili nitong puwesto.',
   'தாக்குதலும் உயிரும் பாதியாகும், மேல்நோக்கி முழுமையாக்கப்படும்; தாக்குதல் 1 என்பது 0. உயிர் 1 நகல் தராது. அதன் சொந்த இடத்தில் ஒருபோதும் இல்லை.',
   'Serangan dan Nyawa dibagi dua, dibulatkan ke atas; Serangan 1 jadi 0. Nyawa 1 tidak membuat salinan. Tidak pernah di petaknya sendiri.',
   '攻击和生命减半，向上取整；攻击 1 变为 0。生命 1 不产生复制品。从不出现在它原来的格子。',
   '攻擊和生命減半，向上取整；攻擊 1 變為 0。生命 1 不產生複製品。從不出現在它原來的格子。',
   '攻撃と体力は半分（切り上げ）、攻撃1は0。体力1ならコピーなし。元のマスには出ない。',
   '공격과 체력은 절반(올림), 공격 1은 0. 체력 1이면 사본 없음. 원래 칸에는 나오지 않습니다.']),
 ('ui.skn-eng25-tribe-delivery', 'Tribe Delivery', ['Livraison de tribu', 'Stammeslieferung', 'Entrega de tribu', 'Consegna di tribù', 'Entrega de tribo', 'Paghahatid ng Lahi', 'இனத் தருவிப்பு', 'Kiriman Suku', '族群送货', '族群送貨', '一族の配達', '종족 배달']),
 ('ui.eng25-tribe-delivery', 'When you play an ally {tribe}, you gain 1 {res}.', [
   'Quand vous jouez un allié {tribe}, vous gagnez 1 {res}.', 'Wenn du einen verbündeten {tribe} spielst, erhältst du 1 {res}.',
   'Cuando juegas un aliado {tribe}, ganas 1 {res}.', 'Quando giochi un alleato {tribe}, ottieni 1 {res}.',
   'Quando jogas um aliado {tribe}, ganhas 1 {res}.', 'Kapag naglaro ka ng kakamping {tribe}, makakakuha ka ng 1 {res}.',
   'ஒரு கூட்டாளி {tribe} ஐ விளையாடும்போது, 1 {res} பெறுவாய்.', 'Saat kamu memainkan sekutu {tribe}, kamu mendapat 1 {res}.',
   '你打出友方{tribe}时，获得 1 {res}。', '你打出友方{tribe}時，獲得 1 {res}。', '味方の{tribe}を出すと、{res}を1得る。', '아군 {tribe}을(를) 내면 {res} 1을 얻습니다.']),
 ('ui.eng25-tribe-delivery-head', '{tribe} Delivery { {res} }', [
   'Livraison {tribe} { {res} }', '{tribe}-Lieferung { {res} }', 'Entrega {tribe} { {res} }', 'Consegna {tribe} { {res} }', 'Entrega {tribe} { {res} }',
   'Paghahatid ng {tribe} { {res} }', '{tribe} தருவிப்பு { {res} }', 'Kiriman {tribe} { {res} }', '{tribe}送货 { {res} }', '{tribe}送貨 { {res} }', '{tribe}の配達 { {res} }', '{tribe} 배달 { {res} }']),
 ('ui.eng25-tribe-delivery-codex', 'Not for itself. Off while it is Waiting, Stunned, Frozen or Asleep.', [
   'Pas pour lui-même. Inactif tant qu’il est en Attente, Étourdi, Gelé ou Endormi.', 'Nicht für sich selbst. Aus, solange es wartet, betäubt, gefroren oder schlafend ist.',
   'No cuenta él mismo. Inactivo mientras está en Espera, Aturdido, Congelado o Dormido.', 'Non per sé stesso. Spento mentre è in Attesa, Stordito, Congelato o Addormentato.',
   'Não conta ele próprio. Desligado enquanto está em Espera, Atordoado, Congelado ou Adormecido.', 'Hindi para sa sarili. Patay habang Naghihintay, Natulala, Nagyelo o Tulog.',
   'தனக்கு அல்ல. காத்திருக்கும், மயங்கிய, உறைந்த அல்லது தூங்கும் போது இயங்காது.', 'Tidak untuk dirinya. Mati saat Menunggu, Pingsan, Beku atau Tidur.',
   '不算它自己。等待、眩晕、冰冻或沉睡时无效。', '不算它自己。等待、暈眩、冰凍或沉睡時無效。', '自身は対象外。待機中・スタン・凍結・睡眠中は働かない。', '자신은 제외. 대기, 기절, 빙결, 수면 중에는 꺼집니다.']),
 ('ui.eng25-tribe-delivery-res-name', 'Tribe Delivery resource', ['Ressource de livraison de tribu', 'Ressource der Stammeslieferung', 'Recurso de entrega de tribu', 'Risorsa della consegna di tribù', 'Recurso da entrega de tribo', 'Rekurso ng Paghahatid ng Lahi', 'இனத் தருவிப்பு வளம்', 'Sumber Kiriman Suku', '族群送货资源', '族群送貨資源', '一族の配達の資源', '종족 배달 자원']),
 ('ui.eng25-act-forage', 'Forage', ['Cueillir', 'Sammeln', 'Recolectar', 'Raccogliere', 'Colher', 'Mangalap', 'உணவு தேடு', 'Meramu', '采集', '採集', '採集', '채집']),
 ('ui.eng25-act-forage-desc', 'The unit gathers N Berries. 3 Berries heal your most hurt other ally 3.', [
   'L’unité cueille N Baies. 3 Baies soignent de 3 votre autre allié le plus blessé.', 'Die Einheit sammelt N Beeren. 3 Beeren heilen deinen am stärksten verletzten anderen Verbündeten um 3.',
   'La unidad recoge N Bayas. 3 Bayas curan 3 a tu otro aliado más herido.', 'L’unità raccoglie N Bacche. 3 Bacche curano di 3 il tuo altro alleato più ferito.',
   'A unidade colhe N Bagas. 3 Bagas curam 3 ao teu outro aliado mais ferido.', 'Mangangalap ang yunit ng N Berry. 3 Berry ang magpapagaling ng 3 sa pinakasugatang ibang kakampi mo.',
   'அலகு N பெர்ரிகளைச் சேகரிக்கும். 3 பெர்ரிகள் அதிகம் காயமடைந்த மற்றொரு கூட்டாளியை 3 குணமாக்கும்.', 'Unit mengumpulkan N Beri. 3 Beri memulihkan 3 sekutu lain yang paling terluka.',
   '该单位采集 N 个浆果。3 个浆果为你受伤最重的其他友军治疗 3。', '該單位採集 N 個漿果。3 個漿果為你受傷最重的其他友軍治療 3。',
   'このユニットがベリーをN個集める。ベリー3個で最も傷ついた他の味方を3回復。', '이 유닛이 베리 N개를 모읍니다. 베리 3개로 가장 다친 다른 아군을 3 회복합니다.']),
 ('ui.eng25-foraging', '+{n} Berry each turn. {b} Berries heal your most hurt other ally {h}.', [
   '+{n} Baie par tour. {b} Baies soignent de {h} votre autre allié le plus blessé.', '+{n} Beere pro Zug. {b} Beeren heilen deinen am stärksten verletzten anderen Verbündeten um {h}.',
   '+{n} Baya por turno. {b} Bayas curan {h} a tu otro aliado más herido.', '+{n} Bacca a turno. {b} Bacche curano di {h} il tuo altro alleato più ferito.',
   '+{n} Baga por turno. {b} Bagas curam {h} ao teu outro aliado mais ferido.', '+{n} Berry bawat turn. {b} Berry ang magpapagaling ng {h} sa pinakasugatang ibang kakampi mo.',
   'ஒவ்வொரு முறையும் +{n} பெர்ரி. {b} பெர்ரிகள் அதிகம் காயமடைந்த மற்றொரு கூட்டாளியை {h} குணமாக்கும்.', '+{n} Beri tiap giliran. {b} Beri memulihkan {h} sekutu lain yang paling terluka.',
   '每回合 +{n} 浆果。{b} 个浆果为你受伤最重的其他友军治疗 {h}。', '每回合 +{n} 漿果。{b} 個漿果為你受傷最重的其他友軍治療 {h}。',
   '毎ターンベリー+{n}。ベリー{b}個で最も傷ついた他の味方を{h}回復。', '매 턴 베리 +{n}. 베리 {b}개로 가장 다친 다른 아군을 {h} 회복합니다.']),
]
# changed English values of existing keys (the old rows stay in the packs; the new English gets its own row)
CHANGED = [
 ('ui.sk-hatchling', 'An evolute played onto it gains +1/+2. From Level 1.', [
   'Un évolué joué dessus gagne +1/+2. Dès le Niveau 1.', 'Ein darauf gespieltes Evolut erhält +1/+2. Ab Stufe 1.',
   'Un evoluto jugado encima gana +1/+2. Desde el Nivel 1.', 'Un evoluto giocato sopra ottiene +1/+2. Dal Livello 1.',
   'Um evoluto jogado por cima ganha +1/+2. A partir do Nível 1.', 'Ang evolute na nilaro rito ay makakakuha ng +1/+2. Mula Level 1.',
   'அதன் மேல் விளையாடிய பரிணாமம் +1/+2 பெறும். நிலை 1 முதல்.', 'Evolute yang dimainkan di atasnya mendapat +1/+2. Sejak Level 1.',
   '打在它身上的进化体获得 +1/+2。从 1 级起。', '打在它身上的進化體獲得 +1/+2。從 1 級起。',
   'その上に出した進化体は+1/+2。レベル1から。', '그 위에 낸 진화체는 +1/+2를 얻습니다. 레벨 1부터.']),
 ('ui.sk-hatchling-codex', "Every Baby card gets it at Level 1. It only matters when you play an Evomax evolute (Evolute) onto it; it is not the egg's Hatch or Stay.", [
   'Chaque carte Bébé l’obtient au Niveau 1. Elle ne compte que si vous jouez un évolué Evomax (Évolué) dessus ; ce n’est pas l’Éclosion ou le Reste de l’œuf.',
   'Jede Baby-Karte erhält es auf Stufe 1. Es zählt nur, wenn du ein Evomax-Evolut (Evolut) darauf spielst; es ist nicht das Schlüpfen oder Bleiben des Eis.',
   'Cada carta Bebé lo obtiene en el Nivel 1. Solo importa si juegas un evoluto Evomax (Evoluto) encima; no es el Eclosionar o Quedarse del huevo.',
   'Ogni carta Cucciolo lo ottiene al Livello 1. Conta solo se giochi un evoluto Evomax (Evoluto) sopra; non è la Schiusa o il Resta dell’uovo.',
   'Cada carta Bebé recebe-o no Nível 1. Só conta quando jogas um evoluto Evomax (Evoluto) por cima; não é o Eclodir ou Ficar do ovo.',
   'Bawat Baby card ay nakakakuha nito sa Level 1. Mahalaga lang ito kapag naglaro ka ng Evomax evolute (Evolute) rito; hindi ito ang Hatch o Stay ng itlog.',
   'ஒவ்வொரு குழந்தை அட்டையும் நிலை 1 இல் இதைப் பெறும். அதன் மேல் Evomax பரிணாமத்தை (Evolute) விளையாடும்போது மட்டுமே இது முக்கியம்; இது முட்டையின் Hatch அல்லது Stay அல்ல.',
   'Setiap kartu Bayi mendapatkannya di Level 1. Hanya berarti saat kamu memainkan evolute Evomax (Evolute) di atasnya; ini bukan Menetas atau Tetap milik telur.',
   '每张幼崽卡在 1 级获得它。只有在它身上打出 Evomax 进化体（进化体）时才有用；它不是蛋的孵化或留下。',
   '每張幼崽卡在 1 級獲得它。只有在它身上打出 Evomax 進化體（進化體）時才有用；它不是蛋的孵化或留下。',
   'すべてのベビーカードがレベル1で得る。Evomaxの進化体（Evolute）をその上に出すときだけ意味がある。卵の孵化や留まるではない。',
   '모든 아기 카드가 레벨 1에 얻습니다. 그 위에 Evomax 진화체(Evolute)를 낼 때만 의미가 있습니다. 알의 부화나 머무르기가 아닙니다.']),
]
def ph(t): return sorted(re.findall(r'\{(\w+)\}', t))
TXP = os.path.join(ROOT, 'bramblewood-texts.js')
src = open(TXP, encoding='utf-8').read()
END = '\n}/*TEXT-TABLE-END*/;'
assert END in src
add = ''
for key, en, _ in T:
    if ('"%s":' % key) not in src: add += ',\n  %s: %s' % (json.dumps(key), json.dumps(en, ensure_ascii=False))
for key, en, _ in CHANGED:
    m = re.search(r'("%s": )("(?:[^"\\]|\\.)*")' % re.escape(key), src); assert m, key
    src = src[:m.start(2)] + json.dumps(en, ensure_ascii=False) + src[m.end(2):]
if add:
    i = src.index(END); src = src[:i] + add + src[i:]
open(TXP, 'w', encoding='utf-8').write(src)
added = 0
for i, code in enumerate(CODES):
    path = os.path.join(ROOT, 'lang', code + '.json'); pack = json.load(open(path, encoding='utf-8'))
    for key, en, row in T + CHANGED:
        assert len(row) == 12 and ph(en) == ph(row[i]), (code, en)
        if en not in pack: added += 1
        pack.setdefault(en, row[i])
    with open(path, 'w', encoding='utf-8') as fh:
        json.dump(pack, fh, ensure_ascii=False, indent=1); fh.write('\n')
print('ok: %d rows added across %d packs' % (added, len(CODES)))
