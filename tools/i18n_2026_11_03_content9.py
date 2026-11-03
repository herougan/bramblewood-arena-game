#!/usr/bin/env python3
"""2026-11-03 (package CONTENT9). Two owner calls of 2026-11-03 21:10:
  TEXT1-1 ("I prefer Tribes."): the Sunfeather Dominion is the Sunfeather Tribes wherever a player sees it, Dominion Nestguard is Sunfeather
          Nestguard, and the lore bible's knight renames are applied (ids unchanged): Stag Knight -> Stag Champion, Bee Knight -> Bee Warden,
          Dolphin Knight -> Dolphin Outrider (Cataphract Destrier was already the Gilded Roadwarden). The flavour lines that named the Dominion,
          a moat and a lance are reworded.
  ECON2-9 a ("OK"): one curiosity on each silent main map (DRAFTS for the owner; arena_app.js DIALOGUES cur_* and MAP_CURIOSITIES, written
          by hand in this package). This script adds their 12 language rows.
What it does:
  SRC   the English in the sources (canonical/cards.json names and flavour, bramblewood-texts.js, arena_app.js, arena_template.html)
  REN   renamed strings: the pack row is renamed in place (key order kept, never sorted) with the new translation
  NEW   new strings (the curiosities): added at the end of lang/ui/<code>.json
Language order: fr de es it pt tl ta id zh-Hans zh-Hant ja ko. Tagalog, Tamil and Indonesian deserve a native read (and Japanese / Korean).
Idempotent: a second run changes nothing.
    python3 tools/i18n_2026_11_03_content9.py"""
import json, os
ROOT = os.path.join(os.path.dirname(os.path.abspath(__file__)), '..')
CODES = ['fr', 'de', 'es', 'it', 'pt', 'tl', 'ta', 'id', 'zh-Hans', 'zh-Hant', 'ja', 'ko']

# ---- source edits: (file, old, new); old must occur (all occurrences replaced) or new must already be there
SRC = [
 ('arena_app.js', "{who:'aurelia', text:'Even the Dominion cannot fell that thing alone.'}", "{who:'aurelia', text:'Even the Sunfeather Tribes cannot fell that thing alone.'}"),
 ('arena_app.js', "'A Dominion patrol drops out of the canopy, blades already drawn.'", "'A Sunfeather war-band drops out of the canopy, blades already drawn.'"),
 ('arena_app.js', "'A Dominion patrol drops out of the canopy.'", "'A Sunfeather war-band drops out of the canopy.'"),
 ('arena_app.js', "hummingbirds: {name:'Sunfeather Dominion', lore:'From flower-thrones high in the canopy, the Dominion rules a court where every courtier is a duelist.'",
  "hummingbirds: {name:'Sunfeather Tribes', lore:'From painted cliff-nests above the canopy, the Sunfeather Tribes fly out in bright war-bands, and every warrior is a duelist.'"),
 ('arena_app.js', "hummingbirds: {title:'Sunfeather Dominion',", "hummingbirds: {title:'Sunfeather Tribes',"),
 ('arena_template.html', '<span class="faction-sub">Sunfeather Dominion</span>', '<span class="faction-sub">Sunfeather Tribes</span>'),
 ('bramblewood-texts.js', '"results.the-best-laid-plans-of-mice": "The best-laid plans of mice and otters often meet a Bee Knight.",',
  '"results.the-best-laid-plans-of-mice": "The best-laid plans of mice and otters often meet a Bee Warden.",'),
]
# card text fields (ids unchanged): (id, field, old, new)
CARD = [
 ('dominion-nestguard', 'name', 'Dominion Nestguard', 'Sunfeather Nestguard'),
 ('stag-knight', 'name', 'Stag Knight', 'Stag Champion'),
 ('bee-knight', 'name', 'Bee Knight', 'Bee Warden'),
 ('dolphin-knight', 'name', 'Dolphin Knight', 'Dolphin Outrider'),
 ('dolphin-knight', 'flavor', 'Rides the moat like open water. Lance first, questions never.', 'Rides the bow-wave ahead of the patrol. Spear first, questions never.'),
 ('sunthroat-courier', 'flavor', 'Carries messages the Dominion would rather you not read.', 'Carries messages between the tribes. Some were never meant for you.'),
]

# ---- renamed rows: (old English, new English, 12 translations)
REN = [
 ('Sunfeather Dominion', 'Sunfeather Tribes',
  ['Tribus de Plume-Soleil', 'Sonnenfeder-Stämme', 'Tribus Plumasol', 'Tribù di Piumasole', 'Tribos Pluma-Sol', 'Mga Tribo ng Sunfeather',
   'சூரியச்சிறகு இனக்குழுக்கள்', 'Suku-Suku Bulu Surya', '日羽诸部', '日羽諸部', '陽羽の部族', '햇깃 부족']),
 ('Dominion Nestguard', 'Sunfeather Nestguard',
  ['Garde-nid de Plume-Soleil', 'Sonnenfeder-Nestwache', 'Guardanidos Plumasol', 'Guardanido di Piumasole', 'Guarda-Ninho Pluma-Sol', 'Bantay-Pugad ng Sunfeather',
   'சூரியச்சிறகுக் கூட்டுக்காவலன்', 'Penjaga Sarang Bulu Surya', '日羽巢卫', '日羽巢衛', '陽羽の巣守り', '햇깃 둥지수호병']),
 ('Stag Knight', 'Stag Champion',
  ['Champion cerf', 'Hirschrecke', 'Campeón ciervo', 'Cervo Campione', 'Cervo Campeão', 'Kampeong Usa',
   'கலைமான் வெற்றிவீரன்', 'Rusa Juara', '雄鹿勇士', '雄鹿勇士', '雄ジカの勇者', '수사슴 용사']),
 ('Bee Knight', 'Bee Warden',
  ['Gardienne abeille', 'Bienenwächterin', 'Guardiana abeja', 'Ape Guardiana', 'Abelha Guardiã', 'Bantay na Bubuyog',
   'தேனீக் காவலன்', 'Lebah Penjaga', '蜂守卫', '蜂守衛', 'ハチの番人', '꿀벌 파수꾼']),
 ('Dolphin Knight', 'Dolphin Outrider',
  ['Éclaireur dauphin', 'Delfin-Vorreiter', 'Batidor delfín', 'Delfino Battistrada', 'Golfinho Batedor', 'Lumba-lumbang Tagapanguna',
   'ஓங்கில் முன்னோடி', 'Lumba-Lumba Perintis', '海豚先锋', '海豚先鋒', 'イルカの先駆け', '돌고래 선봉']),
 ('Even the Dominion cannot fell that thing alone.', 'Even the Sunfeather Tribes cannot fell that thing alone.',
  ['Même les Tribus de Plume-Soleil ne peuvent pas abattre cette chose seules.', 'Nicht einmal die Sonnenfeder-Stämme können das Ding allein fällen.',
   'Ni siquiera las Tribus Plumasol pueden derribar esa cosa solas.', 'Nemmeno le Tribù di Piumasole possono abbattere quella cosa da sole.',
   'Nem as Tribos Pluma-Sol conseguem derrubar aquela coisa sozinhas.', 'Kahit ang Mga Tribo ng Sunfeather ay hindi kayang pabagsakin iyan nang mag-isa.',
   'சூரியச்சிறகு இனக்குழுக்களால்கூட அதைத் தனியாக வீழ்த்த முடியாது.', 'Bahkan Suku-Suku Bulu Surya tidak bisa menumbangkan benda itu sendirian.',
   '就连日羽诸部也无法独自击倒那东西。', '就連日羽諸部也無法獨自擊倒那東西。', '陽羽の部族でさえ、あれを単独では倒せない。', '햇깃 부족조차 저걸 혼자서는 쓰러뜨릴 수 없어요.']),
 ('A Dominion patrol drops out of the canopy, blades already drawn.', 'A Sunfeather war-band drops out of the canopy, blades already drawn.',
  ['Une bande de guerre de Plume-Soleil tombe de la canopée, lames déjà tirées.', 'Eine Sonnenfeder-Kriegsschar fällt aus dem Blätterdach, die Klingen schon gezogen.',
   'Una banda de guerra Plumasol cae del dosel, con las hojas ya desenvainadas.', 'Una banda di guerra di Piumasole piomba giù dalla volta degli alberi, lame già sguainate.',
   'Um bando de guerra Pluma-Sol cai da copa das árvores, lâminas já desembainhadas.', 'Isang pangkat-mandirigma ng Sunfeather ang bumaba mula sa kagubatan sa itaas, nakabunot na ang mga talim.',
   'சூரியச்சிறகுப் போர்க்குழு ஒன்று மரவுச்சியிலிருந்து குதிக்கிறது, வாள்கள் ஏற்கெனவே உருவப்பட்டுள்ளன.', 'Sekelompok prajurit Bulu Surya turun dari kanopi, bilah sudah terhunus.',
   '一支日羽战团从树冠间扑下，刀刃早已出鞘。', '一支日羽戰團從樹冠間撲下，刀刃早已出鞘。', '陽羽の戦団が樹冠から舞い降りる。刃はすでに抜かれている。', '햇깃 전투대가 수관에서 뛰어내립니다. 칼날은 이미 뽑혀 있어요.']),
 ('A Dominion patrol drops out of the canopy.', 'A Sunfeather war-band drops out of the canopy.',
  ['Une bande de guerre de Plume-Soleil tombe de la canopée.', 'Eine Sonnenfeder-Kriegsschar fällt aus dem Blätterdach.',
   'Una banda de guerra Plumasol cae del dosel.', 'Una banda di guerra di Piumasole piomba giù dalla volta degli alberi.',
   'Um bando de guerra Pluma-Sol cai da copa das árvores.', 'Isang pangkat-mandirigma ng Sunfeather ang bumaba mula sa kagubatan sa itaas.',
   'சூரியச்சிறகுப் போர்க்குழு ஒன்று மரவுச்சியிலிருந்து குதிக்கிறது.', 'Sekelompok prajurit Bulu Surya turun dari kanopi.',
   '一支日羽战团从树冠间扑下。', '一支日羽戰團從樹冠間撲下。', '陽羽の戦団が樹冠から舞い降りる。', '햇깃 전투대가 수관에서 뛰어내립니다.']),
 ('Carries messages the Dominion would rather you not read.', 'Carries messages between the tribes. Some were never meant for you.',
  ['Porte des messages entre les tribus. Certains ne vous étaient pas destinés.', 'Trägt Nachrichten zwischen den Stämmen. Manche waren nie für dich bestimmt.',
   'Lleva mensajes entre las tribus. Algunos nunca fueron para ti.', 'Porta messaggi tra le tribù. Alcuni non erano mai per te.',
   'Leva mensagens entre as tribos. Algumas nunca foram para ti.', 'Nagdadala ng mga mensahe sa pagitan ng mga tribu. May ilang hindi kailanman para sa iyo.',
   'பழங்குடிகளுக்கு இடையே செய்திகளைச் சுமந்து செல்கிறது. சில உனக்காக எழுதப்படவே இல்லை.', 'Membawa pesan antarsuku. Sebagian tak pernah dimaksudkan untukmu.',
   '在各部之间传递消息。有些本就不该让你看到。', '在各部之間傳遞消息。有些本就不該讓你看到。', '部族から部族へ便りを運ぶ。その中には、あなた宛てではないものもある。', '부족과 부족 사이에 소식을 나릅니다. 어떤 건 애초에 당신 몫이 아니었죠.']),
 ('From flower-thrones high in the canopy, the Dominion rules a court where every courtier is a duelist.',
  'From painted cliff-nests above the canopy, the Sunfeather Tribes fly out in bright war-bands, and every warrior is a duelist.',
  ['Depuis leurs nids peints sur les falaises au-dessus de la canopée, les Tribus de Plume-Soleil s’envolent en bandes de guerre éclatantes, et chaque guerrier est un duelliste.',
   'Aus bemalten Klippennestern über dem Blätterdach ziehen die Sonnenfeder-Stämme in leuchtenden Kriegsscharen aus, und jeder Krieger ist ein Duellant.',
   'Desde nidos pintados en los acantilados sobre el dosel, las Tribus Plumasol salen en vistosas bandas de guerra, y cada guerrero es un duelista.',
   'Dai nidi dipinti sulle scogliere sopra la volta degli alberi, le Tribù di Piumasole partono in sgargianti bande di guerra, e ogni guerriero è un duellante.',
   'Dos ninhos pintados nas falésias acima da copa, as Tribos Pluma-Sol partem em bandos de guerra vistosos, e cada guerreiro é um duelista.',
   'Mula sa mga pinintahang pugad sa bangin sa ibabaw ng kagubatan, lumilipad ang Mga Tribo ng Sunfeather sa makukulay na pangkat-mandirigma, at bawat mandirigma ay isang duwelista.',
   'மரவுச்சிக்கு மேலே வண்ணம் தீட்டிய பாறைக் கூடுகளிலிருந்து, சூரியச்சிறகு இனக்குழுக்கள் ஒளிரும் போர்க்குழுக்களாகப் பறந்து வருகின்றனர்; ஒவ்வொரு வீரனும் ஒரு வாள்போர் வீரன்.',
   'Dari sarang-sarang bercat di tebing di atas kanopi, Suku-Suku Bulu Surya terbang dalam kelompok prajurit yang mencolok, dan setiap prajurit adalah seorang duelis.',
   '日羽诸部从树冠之上彩绘的崖巢出发，结成鲜艳的战团，每个战士都是决斗高手。', '日羽諸部從樹冠之上彩繪的崖巢出發，結成鮮豔的戰團，每個戰士都是決鬥高手。',
   '樹冠の上、彩られた崖の巣から、陽羽の部族は色鮮やかな戦団となって飛び立つ。戦士は皆、決闘の名手だ。',
   '수관 위 색칠한 절벽 둥지에서 햇깃 부족은 화려한 전투대를 이루어 날아오르고, 전사 하나하나가 결투의 달인입니다.']),
 ('Rides the moat like open water. Lance first, questions never.', 'Rides the bow-wave ahead of the patrol. Spear first, questions never.',
  ['Chevauche la vague d’étrave devant la patrouille. La lance d’abord, les questions jamais.', 'Reitet der Patrouille auf der Bugwelle voraus. Speer zuerst, Fragen nie.',
   'Cabalga la ola de proa por delante de la patrulla. Primero la lanza, preguntas nunca.', 'Cavalca l’onda di prua davanti alla pattuglia. Prima la lancia, domande mai.',
   'Cavalga a onda de proa à frente da patrulha. Primeiro a lança, perguntas nunca.', 'Sumasakay sa alon sa unahan ng patrulya. Sibat muna, tanong ay hindi kailanman.',
   'ரோந்துக் குழுவுக்கு முன்னால் அலைமுகட்டில் சவாரி செய்கிறது. முதலில் ஈட்டி, கேள்விகள் ஒருபோதும் இல்லை.', 'Menunggangi gelombang haluan di depan patroli. Tombak dulu, pertanyaan tidak pernah.',
   '乘着巡逻队前方的船首浪。先出矛，从不问。', '乘著巡邏隊前方的船首浪。先出矛，從不問。', '巡回隊の先頭で船首波に乗る。まず槍、質問は一生なし。', '순찰대 앞에서 뱃머리 물결을 탑니다. 창이 먼저, 질문은 영원히 없음.']),
 ('The best-laid plans of mice and otters often meet a Bee Knight.', 'The best-laid plans of mice and otters often meet a Bee Warden.',
  ['Les plans les mieux ficelés des souris et des loutres croisent souvent une Gardienne Abeille.', 'Die bestgeschmiedeten Pläne von Mäusen und Ottern treffen oft auf eine Bienenwächterin.',
   'Los planes mejor trazados de ratones y nutrias a menudo se topan con una Guardiana Abeja.', 'I piani meglio congegnati di topi e lontre spesso incontrano un’Ape Guardiana.',
   'Os planos mais bem feitos de ratos e lontras dão muitas vezes com uma Abelha Guardiã.', 'Ang pinakamahusay na plano ng mga daga at otter ay madalas sumalubong sa isang Bantay na Bubuyog.',
   'எலிகள், நீர்நாய்களின் சிறந்த திட்டங்கள் பெரும்பாலும் ஒரு தேனீக் காவலனைச் சந்திக்கின்றன.', 'Rencana terbaik tikus dan berang-berang sering bertemu Lebah Penjaga.',
   '老鼠和水獭最周密的计划，往往撞上一位蜂守卫。', '老鼠和水獺最周密的計畫，往往撞上一位蜂守衛。', 'ネズミとカワウソの練りに練った計画も、よくハチの番人に出くわす。', '생쥐와 수달의 가장 치밀한 계획도 종종 꿀벌 파수꾼을 만난다.']),
]

# ---- new rows (ECON2-9 a curiosities): (English, 12 translations), added to lang/ui/<code>.json
NEW = [
 # names (the map button's title)
 ('A tidy pile of bones', ['Un tas d’os bien rangé', 'Ein ordentlicher Knochenhaufen', 'Un montón de huesos muy ordenado', 'Un mucchio di ossa ben ordinato', 'Uma pilha de ossos bem arrumada', 'Maayos na tumpok ng mga buto', 'நேர்த்தியாக அடுக்கிய எலும்புக் குவியல்', 'Tumpukan tulang yang rapi', '一堆码得整整齐齐的骨头', '一堆碼得整整齊齊的骨頭', 'きちんと積まれた骨の山', '가지런히 쌓인 뼈 무더기']),
 ('A knotted kelp rope', ['Une corde de varech nouée', 'Ein geknotetes Tangseil', 'Una cuerda de algas anudada', 'Una corda di alghe annodata', 'Uma corda de algas com nós', 'Isang buhol-buhol na lubid ng kelp', 'முடிச்சுப் போட்ட கடற்பாசிக் கயிறு', 'Tali rumput laut bersimpul', '一根打了结的海带绳', '一根打了結的海帶繩', '結び目のある昆布の縄', '매듭지은 다시마 밧줄']),
 ('A thread tied to a thorn', ['Un fil noué à une épine', 'Ein Faden an einem Dorn', 'Un hilo atado a una espina', 'Un filo legato a una spina', 'Um fio atado a um espinho', 'Isang sinulid na nakatali sa tinik', 'முள்ளில் கட்டிய ஒரு நூல்', 'Benang yang terikat pada duri', '系在刺上的一根线', '繫在刺上的一根線', 'トゲに結ばれた糸', '가시에 묶인 실']),
 ('A cart wheel in the grass', ['Une roue de charrette dans l’herbe', 'Ein Karrenrad im Gras', 'Una rueda de carro en la hierba', 'Una ruota di carro nell’erba', 'Uma roda de carroça na relva', 'Isang gulong ng kariton sa damuhan', 'புல்லில் கிடக்கும் வண்டிச் சக்கரம்', 'Roda gerobak di rerumputan', '草丛里的一只车轮', '草叢裡的一隻車輪', '草むらの荷車の車輪', '풀밭의 수레바퀴']),
 ('A shed antler', ['Un bois tombé', 'Eine abgeworfene Geweihstange', 'Una cuerna mudada', 'Un palco caduto', 'Uma haste de chifre caída', 'Isang nalaglag na sungay', 'உதிர்ந்த மான்கொம்பு', 'Tanduk rusa yang luruh', '一只脱落的鹿角', '一隻脫落的鹿角', '抜け落ちた枝角', '떨어진 사슴뿔']),
 ('A patch of wolfsbane', ['Un carré d’aconit', 'Ein Flecken Eisenhut', 'Un macizo de acónito', 'Una macchia di aconito', 'Uma moita de acônito', 'Isang kumpol ng wolfsbane', 'ஓநாய்நஞ்சுச் செடிகளின் திட்டு', 'Serumpun akonit', '一片狼毒花', '一片狼毒花', 'トリカブトの群生', '투구꽃 덤불']),
 ('A rose of glass', ['Une rose de verre', 'Eine Glasrose', 'Una rosa de vidrio', 'Una rosa di vetro', 'Uma rosa de vidro', 'Isang rosas na salamin', 'கண்ணாடி ரோஜா', 'Mawar kaca', '一朵玻璃玫瑰', '一朵玻璃玫瑰', 'ガラスのバラ', '유리 장미']),
 ('A kettle on a steam vent', ['Une bouilloire sur une fumerolle', 'Ein Kessel über einem Dampfloch', 'Una tetera sobre una fumarola', 'Un bollitore su una fumarola', 'Uma chaleira sobre uma fumarola', 'Isang takure sa butas ng singaw', 'நீராவித் துளையின் மேல் ஒரு கெட்டில்', 'Ketel di atas lubang uap', '蒸汽孔上的一把水壶', '蒸汽孔上的一把水壺', '噴気孔の上のやかん', '증기 구멍 위의 주전자']),
 ('A muddy pay-roll', ['Un registre de solde boueux', 'Eine schlammige Soldliste', 'Una nómina embarrada', 'Un ruolino paga infangato', 'Uma folha de pagamento enlameada', 'Isang maputik na listahan ng sahod', 'சேறு படிந்த ஊதியப் பட்டியல்', 'Daftar gaji berlumpur', '一份沾满泥的饷银名册', '一份沾滿泥的餉銀名冊', '泥まみれの給金台帳', '진흙투성이 급료 명부']),
 ('A bitten gold coin', ['Une pièce d’or mordue', 'Eine angebissene Goldmünze', 'Una moneda de oro mordida', 'Una moneta d’oro morsa', 'Uma moeda de ouro mordida', 'Isang kinagat na gintong barya', 'கடிக்கப்பட்ட பொற்காசு', 'Koin emas bekas gigitan', '一枚被咬过的金币', '一枚被咬過的金幣', '噛み跡のある金貨', '이빨 자국 난 금화']),
 # Map 6, Sable Swampmire
 ('Bones, stacked by size. Somebody here is tidy about supper.',
  ['Des os, empilés par taille. Quelqu’un ici range bien après le souper.', 'Knochen, nach Größe gestapelt. Hier ist jemand ordentlich beim Abendessen.',
   'Huesos, apilados por tamaño. Alguien aquí es muy ordenado con la cena.', 'Ossa, impilate per grandezza. Qualcuno qui è ordinato a cena.',
   'Ossos, empilhados por tamanho. Alguém aqui é arrumado com o jantar.', 'Mga buto, nakasalansan ayon sa laki. May maayos dito pagdating sa hapunan.',
   'அளவு வாரியாக அடுக்கிய எலும்புகள். இங்கே யாரோ இரவுணவில் ஒழுங்கானவர்.', 'Tulang-tulang, ditumpuk menurut ukuran. Ada yang rapi soal makan malam di sini.',
   '骨头，按大小码好。这里有谁吃完晚饭还挺讲究。', '骨頭，按大小碼好。這裡有誰吃完晚飯還挺講究。', '骨が大きさ順に積んである。ここの誰かは夕食の後片付けにうるさいらしい。', '크기별로 쌓은 뼈예요. 여기 누군가는 저녁 식사 뒷정리가 깔끔하네요.']),
 ('The Gnawed. Rats who stopped asking what\'s on the plate. They\'d trade with you, if you looked less like a meal.',
  ['Les Rongés. Des rats qui ont cessé de demander ce qu’il y a dans l’assiette. Ils feraient affaire avec vous, si vous ressembliez moins à un repas.',
   'Die Zernagten. Ratten, die nicht mehr fragen, was auf dem Teller liegt. Sie würden mit dir handeln, wenn du weniger wie eine Mahlzeit aussähest.',
   'Los Roídos. Ratas que dejaron de preguntar qué hay en el plato. Comerciarían contigo si parecieras menos una comida.',
   'I Rosicchiati. Ratti che hanno smesso di chiedere cosa c’è nel piatto. Commercerebbero con te, se sembrassi meno un pasto.',
   'Os Roídos. Ratos que deixaram de perguntar o que há no prato. Negociariam contigo, se parecesses menos uma refeição.',
   'Ang mga Ngumatngat. Mga dagang hindi na nagtatanong kung ano ang nasa plato. Makikipagkalakalan sila sa iyo, kung hindi ka mukhang pagkain.',
   'கொறிப்போர். தட்டில் என்ன என்று கேட்பதை நிறுத்திவிட்ட எலிகள். நீ உணவு போலக் குறைவாகத் தெரிந்தால், உன்னோடு வியாபாரம் செய்வார்கள்.',
   'Kaum Gerogot. Tikus-tikus yang berhenti bertanya apa isi piringnya. Mereka mau berdagang denganmu, kalau kamu tidak terlalu mirip santapan.',
   '啃噬者。那些不再过问盘里是什么的老鼠。要是你看起来不那么像一顿饭，他们倒愿意跟你做买卖。', '啃噬者。那些不再過問盤裡是什麼的老鼠。要是你看起來不那麼像一頓飯，他們倒願意跟你做買賣。',
   '齧り族だ。皿の上が何かを問うのをやめたネズミたち。もう少しごちそうに見えなければ、取引にも応じるだろう。', '갉아먹는 자들이에요. 접시에 뭐가 올랐는지 더는 묻지 않는 쥐들이죠. 당신이 덜 먹음직스러워 보였다면 거래도 했을 거예요.']),
 ('Noted. Nobody wanders off alone in this bog.',
  ['Noté. Personne ne s’éloigne seul dans ce marais.', 'Vermerkt. In diesem Sumpf geht niemand allein los.', 'Anotado. En esta ciénaga nadie se aleja solo.',
   'Annotato. In questa palude nessuno si allontana da solo.', 'Anotado. Ninguém se afasta sozinho neste pântano.', 'Nakatala. Walang lalayo nang mag-isa sa lusak na ito.',
   'குறித்துக்கொண்டேன். இந்தச் சதுப்பில் யாரும் தனியாக விலகிச் செல்லக்கூடாது.', 'Dicatat. Tak seorang pun berkeliaran sendirian di rawa ini.',
   '记下了。在这片沼泽里，谁也不许单独走开。', '記下了。在這片沼澤裡，誰也不許單獨走開。', '了解。この沼で一人で離れる者はいない。', '알겠습니다. 이 늪에서는 누구도 혼자 떨어져 다니지 않습니다.']),
 # Map 9, the Kelp Mangroves
 ('Kelp, knotted around a root. Three knots, then one.',
  ['Du varech, noué autour d’une racine. Trois nœuds, puis un.', 'Tang, um eine Wurzel geknotet. Drei Knoten, dann einer.', 'Algas, anudadas a una raíz. Tres nudos, y luego uno.',
   'Alghe, annodate attorno a una radice. Tre nodi, poi uno.', 'Algas, atadas à volta de uma raiz. Três nós, depois um.', 'Kelp, nakabuhol sa isang ugat. Tatlong buhol, tapos isa.',
   'ஒரு வேரைச் சுற்றி முடிச்சிட்ட கடற்பாசி. மூன்று முடிச்சுகள், பிறகு ஒன்று.', 'Rumput laut, disimpul di sekeliling akar. Tiga simpul, lalu satu.',
   '海带，缠在一根树根上打了结。三个结，再一个。', '海帶，纏在一根樹根上打了結。三個結，再一個。', '根に結ばれた昆布。結び目が三つ、それから一つ。', '뿌리에 감아 묶은 다시마예요. 매듭 셋, 그리고 하나.']),
 ('Tidefolk writing. It means: the dry ones came through here, so count your fish.',
  ['Une écriture du Peuple des marées. Ça veut dire : les secs sont passés par ici, comptez vos poissons.', 'Schrift des Gezeitenvolks. Sie heißt: Die Trockenen sind hier durchgekommen, also zählt eure Fische.',
   'Escritura de la Gente de la Marea. Significa: los secos pasaron por aquí, así que cuenta tus peces.', 'Scrittura del Popolo delle Maree. Vuol dire: i secchi sono passati di qui, contate i pesci.',
   'Escrita do Povo das Marés. Quer dizer: os secos passaram por aqui, por isso contem os peixes.', 'Sulat ng Tidefolk. Ibig sabihin: dumaan dito ang mga tuyo, kaya bilangin ang mga isda ninyo.',
   'அலைமக்களின் எழுத்து. பொருள்: காய்ந்தவர்கள் இவ்வழியே வந்தார்கள், உங்கள் மீன்களை எண்ணுங்கள்.', 'Tulisan Kaum Pasang. Artinya: para kering lewat sini, jadi hitung ikanmu.',
   '潮民的文字。意思是：干身子的来过这儿，数数你的鱼。', '潮民的文字。意思是：乾身子的來過這兒，數數你的魚。', '潮の民の文字だ。意味は『乾いた連中が通った、魚を数えておけ』。', '조수 일족의 글이에요. 뜻은 이래요. \'마른 자들이 지나갔다, 물고기를 세어 둬라.\'']),
 ('\'The dry ones.\' That\'s us, isn\'t it?',
  ['« Les secs. » C’est nous, ça, non ?', '„Die Trockenen.“ Das sind wir, oder?', '«Los secos». Somos nosotros, ¿verdad?', '«I secchi». Siamo noi, vero?', '«Os secos.» Somos nós, não somos?',
   '\'Ang mga tuyo.\' Tayo iyon, ano?', '\'காய்ந்தவர்கள்.\' அது நாம்தானே?', '\'Para kering.\' Itu kita, kan?', '“干身子的。”说的是我们吧？', '「乾身子的。」說的是我們吧？', '『乾いた連中』。俺たちのことだよな？', '\'마른 자들.\' 우리 얘기죠?']),
 # Map 12, the Briar Maze
 ('A thread, tied to a thorn, running off into the hedge.',
  ['Un fil, noué à une épine, qui s’enfonce dans la haie.', 'Ein Faden, an einen Dorn gebunden, der in die Hecke hineinführt.', 'Un hilo, atado a una espina, que se pierde en el seto.',
   'Un filo, legato a una spina, che si perde nella siepe.', 'Um fio, atado a um espinho, que se perde na sebe.', 'Isang sinulid, nakatali sa tinik, na tumatakbo papasok sa halamang-bakod.',
   'ஒரு முள்ளில் கட்டிய நூல், வேலிக்குள் ஓடிச் செல்கிறது.', 'Seutas benang, terikat pada duri, menjulur masuk ke pagar tanaman.',
   '一根线，系在刺上，一直延伸进树篱里。', '一根線，繫在刺上，一直延伸進樹籬裡。', 'トゲに結ばれた糸が、生け垣の奥へ続いている。', '가시에 묶인 실 한 가닥이 산울타리 속으로 이어져요.']),
 ('Someone found the way out and marked it for the rest of us.',
  ['Quelqu’un a trouvé la sortie et l’a marquée pour nous autres.', 'Jemand hat den Ausgang gefunden und ihn für uns andere markiert.', 'Alguien encontró la salida y la marcó para los demás.',
   'Qualcuno ha trovato l’uscita e l’ha segnata per tutti noi.', 'Alguém encontrou a saída e marcou-a para os outros.', 'May nakahanap ng labasan at minarkahan ito para sa ating lahat.',
   'யாரோ வெளியேறும் வழியைக் கண்டு, மற்றவர்களுக்காகக் குறித்து வைத்திருக்கிறார்கள்.', 'Seseorang menemukan jalan keluar dan menandainya untuk kita semua.',
   '有人找到了出路，给后来的人做了记号。', '有人找到了出路，給後來的人做了記號。', '誰かが出口を見つけて、後の者のために印をつけたんだ。', '누군가 출구를 찾아서 나머지를 위해 표시해 뒀네요.']),
 ('Or someone marked the way in. In a maze it\'s the same thread.',
  ['Ou quelqu’un a marqué l’entrée. Dans un labyrinthe, c’est le même fil.', 'Oder jemand hat den Weg hinein markiert. In einem Labyrinth ist es derselbe Faden.', 'O alguien marcó la entrada. En un laberinto es el mismo hilo.',
   'O qualcuno ha segnato l’entrata. In un labirinto è lo stesso filo.', 'Ou alguém marcou a entrada. Num labirinto, é o mesmo fio.', 'O may nagmarka ng daan papasok. Sa isang maze, iisang sinulid lang iyon.',
   'அல்லது யாரோ உள்ளே வரும் வழியைக் குறித்திருக்கலாம். புதிர்வழியில் இரண்டும் ஒரே நூல்தான்.', 'Atau seseorang menandai jalan masuk. Di labirin, itu benang yang sama.',
   '也可能有人标的是进来的路。在迷宫里，那是同一根线。', '也可能有人標的是進來的路。在迷宮裡，那是同一根線。', 'あるいは入り口の印かもな。迷路では、どちらも同じ糸さ。', '아니면 들어오는 길을 표시한 거겠죠. 미로에선 같은 실이에요.']),
 # Map 15, the Long Grass
 ('One of ours. A road-folk cart lost a wheel here and kept going on three.',
  ['Un des nôtres. Une charrette des gens de la route a perdu une roue ici et a continué sur trois.', 'Einer von uns. Ein Karren des Straßenvolks hat hier ein Rad verloren und ist auf dreien weitergefahren.',
   'Uno de los nuestros. Un carro de la gente del camino perdió aquí una rueda y siguió con tres.', 'Uno dei nostri. Un carro della gente di strada ha perso una ruota qui ed è andato avanti con tre.',
   'Um dos nossos. Uma carroça da gente da estrada perdeu aqui uma roda e seguiu com três.', 'Isa sa amin. Nawalan ng gulong dito ang kariton ng mga taga-daan at nagpatuloy sa tatlo.',
   'எங்களுடையது. சாலைமக்களின் வண்டி ஒன்று இங்கே ஒரு சக்கரத்தை இழந்து, மூன்றிலேயே பயணித்தது.', 'Milik kami. Gerobak kaum jalanan kehilangan roda di sini dan terus jalan dengan tiga.',
   '是我们的人。一辆行路人的车在这儿掉了个轮子，靠三个轮子接着走了。', '是我們的人。一輛行路人的車在這兒掉了個輪子，靠三個輪子接著走了。', '仲間のだ。道の民の荷車がここで車輪を一つ落として、三つで走り続けた。', '우리 쪽 거예요. 길손들의 수레가 여기서 바퀴 하나를 잃고 세 바퀴로 계속 갔죠.']),
 ('On three wheels? Through militia country?',
  ['Sur trois roues ? En pays de milice ?', 'Auf drei Rädern? Durch Milizland?', '¿Con tres ruedas? ¿Por tierra de milicias?', 'Su tre ruote? In terra di milizie?', 'Com três rodas? Por terra de milícias?',
   'Sa tatlong gulong? Sa lupain ng milisya?', 'மூன்று சக்கரங்களிலா? படைவீரர் நாட்டின் வழியாகவா?', 'Dengan tiga roda? Melewati wilayah milisi?', '三个轮子？穿过民兵的地盘？', '三個輪子？穿過民兵的地盤？', '三輪で？ 民兵の土地を抜けて？', '세 바퀴로? 민병대 땅을 지나서?']),
 ('Road-folk always keep going. The wheel is the only thing we ever leave behind.',
  ['Les gens de la route continuent toujours. La roue est la seule chose que nous laissons derrière nous.', 'Das Straßenvolk fährt immer weiter. Das Rad ist das Einzige, was wir je zurücklassen.',
   'La gente del camino siempre sigue. La rueda es lo único que dejamos atrás.', 'La gente di strada va sempre avanti. La ruota è l’unica cosa che ci lasciamo dietro.',
   'A gente da estrada segue sempre. A roda é a única coisa que deixamos para trás.', 'Laging nagpapatuloy ang mga taga-daan. Ang gulong lang ang naiiwan namin.',
   'சாலைமக்கள் எப்போதும் போய்க்கொண்டே இருப்பார்கள். நாங்கள் விட்டுச்செல்வது சக்கரம் மட்டுமே.', 'Kaum jalanan selalu terus berjalan. Roda satu-satunya yang pernah kami tinggalkan.',
   '行路人总是接着走。轮子是我们唯一会丢下的东西。', '行路人總是接著走。輪子是我們唯一會丟下的東西。', '道の民はいつだって進み続ける。置いていくのは車輪くらいのものさ。', '길손들은 언제나 계속 가요. 우리가 남기고 가는 건 바퀴뿐이죠.']),
 # Map 16, the Pinewood Taiga
 ('An elk\'s antler, shed in the snow. The great stags drop them every winter.',
  ['Un bois d’élan, tombé dans la neige. Les grands cerfs les perdent chaque hiver.', 'Eine Elchschaufel, abgeworfen im Schnee. Die großen Hirsche werfen sie jeden Winter ab.',
   'Una cuerna de alce, mudada en la nieve. Los grandes ciervos las sueltan cada invierno.', 'Un palco d’alce, caduto nella neve. I grandi cervi li perdono ogni inverno.',
   'Um chifre de alce, caído na neve. Os grandes veados largam-nos todos os invernos.', 'Sungay ng elk, nalaglag sa niyebe. Ibinabagsak ito ng malalaking usa tuwing taglamig.',
   'பனியில் உதிர்ந்த கடமானின் கொம்பு. பெரிய கலைமான்கள் ஒவ்வொரு குளிர்காலமும் அவற்றை உதிர்க்கும்.', 'Tanduk rusa besar, luruh di salju. Rusa-rusa jantan agung menjatuhkannya tiap musim dingin.',
   '一只驼鹿角，脱落在雪里。大雄鹿每年冬天都会掉角。', '一隻駝鹿角，脫落在雪裡。大雄鹿每年冬天都會掉角。', '雪に落ちたヘラジカの角。大鹿たちは冬ごとに角を落とすの。', '눈 위에 떨어진 엘크의 뿔이에요. 큰 사슴들은 겨울마다 뿔을 떨군답니다.']),
 ('Our tribes carve them into horns. One note, and every stag in the wood looks up.',
  ['Nos tribus en font des cors. Une seule note, et chaque cerf du bois lève la tête.', 'Unsere Stämme schnitzen Hörner daraus. Ein Ton, und jeder Hirsch im Wald hebt den Kopf.',
   'Nuestras tribus las tallan en cuernos de llamada. Una nota, y todos los ciervos del bosque alzan la vista.', 'Le nostre tribù ne intagliano corni. Una nota, e ogni cervo del bosco alza la testa.',
   'As nossas tribos fazem delas trompas. Uma nota, e todos os veados do bosque erguem a cabeça.', 'Inuukit ito ng aming mga tribu bilang tambuli. Isang nota, at titingala ang bawat usa sa gubat.',
   'எங்கள் பழங்குடிகள் அவற்றைக் கொம்பு வாத்தியங்களாகச் செதுக்குவார்கள். ஒரு சுரம் போதும், காட்டின் ஒவ்வொரு கலைமானும் தலை தூக்கும்.', 'Suku-suku kami mengukirnya jadi terompet. Satu nada, dan setiap rusa jantan di hutan menengadah.',
   '我们各部把它们刻成号角。吹响一声，林中每头雄鹿都会抬头。', '我們各部把它們刻成號角。吹響一聲，林中每頭雄鹿都會抬頭。', '我らの部族はそれを角笛に彫る。ひと吹きで、森じゅうの雄ジカが顔を上げる。', '우리 부족은 그걸 깎아 뿔피리를 만든다. 한 번 불면 숲의 모든 수사슴이 고개를 든다.']),
 ('And every wolf, I\'d guess.',
  ['Et chaque loup, j’imagine.', 'Und jeder Wolf, schätze ich.', 'Y todos los lobos, supongo.', 'E ogni lupo, immagino.', 'E todos os lobos, calculo.', 'At bawat lobo, sa palagay ko.',
   'ஒவ்வொரு ஓநாயும் கூட, என்று நினைக்கிறேன்.', 'Dan setiap serigala juga, kurasa.', '还有每头狼，我猜。', '還有每頭狼，我猜。', 'それと、狼もみんなな。', '늑대도 전부요, 아마.']),
 # Map 17, Wolfsbane Tundra
 ('Wolfsbane, flowering through the frost. The only blue for a hundred miles.',
  ['De l’aconit, qui fleurit à travers le givre. Le seul bleu à cent lieues à la ronde.', 'Eisenhut, der durch den Frost blüht. Das einzige Blau auf hundert Meilen.',
   'Acónito, floreciendo entre la escarcha. El único azul en cien millas.', 'Aconito, che fiorisce tra la brina. L’unico blu per cento miglia.',
   'Acônito, a florir através da geada. O único azul em cem milhas.', 'Wolfsbane, namumulaklak sa gitna ng hamog na yelo. Ang tanging bughaw sa loob ng sandaang milya.',
   'உறைபனியைத் துளைத்துப் பூக்கும் ஓநாய்நஞ்சு. நூறு மைல்களுக்கு இதுவே ஒரே நீலம்.', 'Akonit, mekar menembus embun beku. Satu-satunya biru sejauh seratus mil.',
   '狼毒花，穿过冰霜开放。方圆百里唯一的蓝色。', '狼毒花，穿過冰霜開放。方圓百里唯一的藍色。', '霜を破って咲くトリカブト。百里四方で唯一の青。', '서리를 뚫고 핀 투구꽃이에요. 백 리 안에 단 하나뿐인 파란색이죠.']),
 ('The packs walk around it. Every one of them, and wide.',
  ['Les meutes le contournent. Toutes, et de loin.', 'Die Rudel gehen darum herum. Jedes einzelne, und in weitem Bogen.', 'Las manadas lo rodean. Todas, y bien lejos.',
   'I branchi ci girano intorno. Tutti, e alla larga.', 'As matilhas contornam-no. Todas, e com folga.', 'Iniikutan ito ng mga kawan. Lahat sila, at malayo.',
   'கூட்டங்கள் அதைச் சுற்றியே நடக்கின்றன. ஒவ்வொன்றும், அகலமாக விலகி.', 'Kawanan-kawanan memutarinya. Semuanya, dan dari jauh.',
   '狼群都绕着它走。每一群都是，远远绕开。', '狼群都繞著它走。每一群都是，遠遠繞開。', '群れはどれもそれを避けて通る。大きく回り込んでな。', '늑대 무리들은 그걸 돌아서 갑니다. 하나도 빠짐없이, 멀찍이.']),
 ('Then so do we. Some lessons the wolves already paid for.',
  ['Alors nous aussi. Certaines leçons, les loups les ont déjà payées.', 'Dann wir auch. Manche Lektionen haben die Wölfe schon bezahlt.', 'Entonces nosotros también. Algunas lecciones ya las pagaron los lobos.',
   'Allora anche noi. Certe lezioni i lupi le hanno già pagate.', 'Então nós também. Algumas lições, os lobos já as pagaram.', 'Kung gayon, tayo rin. May mga aral na nabayaran na ng mga lobo.',
   'அப்படியானால் நாமும் அப்படியே. சில பாடங்களுக்கு ஓநாய்கள் ஏற்கெனவே விலை கொடுத்துவிட்டன.', 'Kalau begitu kita juga. Ada pelajaran yang sudah dibayar para serigala.',
   '那我们也绕开。有些教训，狼已经替我们付过代价了。', '那我們也繞開。有些教訓，狼已經替我們付過代價了。', 'なら我らもそうしよう。狼がすでに代価を払った教えもある。', '그럼 우리도 그래야지. 어떤 교훈은 늑대들이 이미 값을 치렀으니까.']),
 # Map 18, the Glass Dunes
 ('Lightning struck the dune here and left a rose of glass behind.',
  ['La foudre a frappé la dune ici et a laissé une rose de verre.', 'Hier hat der Blitz in die Düne geschlagen und eine Glasrose zurückgelassen.', 'Un rayo cayó aquí en la duna y dejó una rosa de vidrio.',
   'Qui un fulmine ha colpito la duna e ha lasciato una rosa di vetro.', 'Um raio caiu aqui na duna e deixou uma rosa de vidro.', 'Tinamaan ng kidlat ang buhanginan dito at nag-iwan ng rosas na salamin.',
   'இங்கே மின்னல் மணற்குன்றைத் தாக்கி, ஒரு கண்ணாடி ரோஜாவை விட்டுச் சென்றது.', 'Petir menyambar bukit pasir di sini dan meninggalkan mawar kaca.',
   '闪电劈中了这里的沙丘，留下一朵玻璃玫瑰。', '閃電劈中了這裡的沙丘，留下一朵玻璃玫瑰。', 'ここで雷が砂丘に落ちて、ガラスのバラを残していった。', '번개가 여기 모래언덕에 떨어져 유리 장미를 남겼어요.']),
 ('Don\'t touch it. It\'s still warm. It\'s always still warm.',
  ['N’y touchez pas. Elle est encore chaude. Elle est toujours encore chaude.', 'Nicht anfassen. Sie ist noch warm. Sie ist immer noch warm.', 'No la toques. Todavía está caliente. Siempre está todavía caliente.',
   'Non toccarla. È ancora calda. È sempre ancora calda.', 'Não lhe toques. Ainda está quente. Está sempre ainda quente.', 'Huwag mong hawakan. Mainit pa. Laging mainit pa.',
   'தொடாதே. இன்னும் சூடாக இருக்கிறது. எப்போதும் இன்னும் சூடாகவே இருக்கும்.', 'Jangan disentuh. Masih hangat. Selalu masih hangat.',
   '别碰。还是热的。它一直都还是热的。', '別碰。還是熱的。它一直都還是熱的。', '触るな。まだ温かい。いつだって、まだ温かいんだ。', '만지지 마요. 아직 따뜻해요. 언제나 아직 따뜻하죠.']),
 ('How long ago was the lightning?',
  ['La foudre, c’était il y a combien de temps ?', 'Wie lange ist der Blitz her?', '¿Cuánto hace del rayo?', 'Quanto tempo fa è caduto il fulmine?', 'Há quanto tempo foi o raio?',
   'Gaano na katagal ang kidlat?', 'மின்னல் எவ்வளவு காலத்துக்கு முன்?', 'Sudah berapa lama sejak petir itu?', '那道闪电是多久以前的事？', '那道閃電是多久以前的事？', '雷が落ちたのはいつのことだ？', '번개가 친 게 얼마나 전인데요?']),
 ('Before my grandmother. The sand keeps a grudge.',
  ['Avant ma grand-mère. Le sable a de la rancune.', 'Vor meiner Großmutter. Der Sand ist nachtragend.', 'Antes de mi abuela. La arena guarda rencor.', 'Prima di mia nonna. La sabbia porta rancore.',
   'Antes da minha avó. A areia guarda rancor.', 'Bago pa ang lola ko. Mapagtanim ng sama ng loob ang buhangin.', 'என் பாட்டிக்கும் முன்பு. மணல் பகையை மறப்பதில்லை.', 'Sebelum nenekku. Pasir menyimpan dendam.',
   '在我奶奶之前。沙子记仇。', '在我奶奶之前。沙子記仇。', 'ばあちゃんより前さ。砂は恨みを忘れない。', '우리 할머니보다 전이에요. 모래는 앙심을 품거든요.']),
 # Map 22, the Rimefire Caldera
 ('Somebody\'s kettle, set over a crack in the ice. It boils without a fire.',
  ['La bouilloire de quelqu’un, posée sur une fissure de la glace. Elle bout sans feu.', 'Jemandes Kessel, über einen Riss im Eis gestellt. Er kocht ohne Feuer.',
   'La tetera de alguien, puesta sobre una grieta del hielo. Hierve sin fuego.', 'Il bollitore di qualcuno, posato su una crepa nel ghiaccio. Bolle senza fuoco.',
   'A chaleira de alguém, pousada sobre uma fenda no gelo. Ferve sem fogo.', 'Takure ng kung sino, nakapatong sa bitak ng yelo. Kumukulo kahit walang apoy.',
   'யாரோ ஒருவரின் கெட்டில், பனியின் விரிசல் மேல் வைக்கப்பட்டது. நெருப்பு இல்லாமலே கொதிக்கிறது.', 'Ketel milik seseorang, diletakkan di atas retakan es. Mendidih tanpa api.',
   '不知谁的水壶，架在冰缝上。没有火也烧开了。', '不知誰的水壺，架在冰縫上。沒有火也燒開了。', '誰かのやかんが氷の割れ目に置いてある。火もないのに沸いてるよ。', '누군가의 주전자가 얼음 틈 위에 놓여 있네요. 불도 없이 끓어요.']),
 ('The goats up here make tea whenever the vent breathes. Twice a minute.',
  ['Ici, les chèvres font du thé chaque fois que la fumerolle respire. Deux fois par minute.', 'Die Ziegen hier oben kochen Tee, wann immer das Dampfloch atmet. Zweimal die Minute.',
   'Aquí arriba las cabras hacen té cada vez que la fumarola respira. Dos veces por minuto.', 'Quassù le capre fanno il tè ogni volta che la fumarola respira. Due volte al minuto.',
   'Cá em cima as cabras fazem chá sempre que a fumarola respira. Duas vezes por minuto.', 'Nagtitimpla ng tsaa ang mga kambing dito tuwing humihinga ang butas. Dalawang beses bawat minuto.',
   'இங்குள்ள ஆடுகள் துளை மூச்சு விடும்போதெல்லாம் தேநீர் போடுகின்றன. நிமிடத்துக்கு இரண்டு முறை.', 'Kambing-kambing di atas sini menyeduh teh setiap kali lubang itu bernapas. Dua kali semenit.',
   '山上的山羊每逢气孔呼一口气就泡茶。一分钟两回。', '山上的山羊每逢氣孔呼一口氣就泡茶。一分鐘兩回。', 'ここのヤギは噴気孔が息をするたびにお茶を淹れるのさ。一分に二度。', '여기 염소들은 구멍이 숨을 쉴 때마다 차를 끓여요. 일 분에 두 번이죠.']),
 ('The mountain\'s been cooking longer than any of us. Mind you don\'t end up in the pot.',
  ['La montagne cuisine depuis plus longtemps que nous tous. Prenez garde de ne pas finir dans la marmite.', 'Der Berg kocht schon länger als jeder von uns. Pass auf, dass du nicht im Topf landest.',
   'La montaña lleva cocinando más que cualquiera de nosotros. Cuidado no acabes en la olla.', 'La montagna cucina da più tempo di tutti noi. Attento a non finire nella pentola.',
   'A montanha cozinha há mais tempo do que qualquer um de nós. Cuidado para não acabares na panela.', 'Mas matagal nang nagluluto ang bundok kaysa sa sinuman sa atin. Ingat at baka mapunta ka sa kaldero.',
   'இந்த மலை நம் எல்லோரையும் விட நீண்ட காலமாகச் சமைத்து வருகிறது. பானைக்குள் போய்விடாமல் பார்த்துக்கொள்.', 'Gunung ini sudah memasak lebih lama dari kita semua. Hati-hati jangan sampai masuk panci.',
   '这座山煮东西的年头比我们谁都长。当心别自己进了锅。', '這座山煮東西的年頭比我們誰都長。當心別自己進了鍋。', 'この山は誰よりも長く煮炊きしてきた。鍋の中身にならないようにな。', '이 산은 우리 누구보다 오래 요리해 왔어요. 냄비 속에 들어가지 않게 조심해요.']),
 # Map 23, the Goldfeather Siege
 ('A pay-roll, dropped in the mud. Every sellsword in the camp, and what they\'re owed.',
  ['Un registre de solde, tombé dans la boue. Chaque mercenaire du camp, et ce qu’on lui doit.', 'Eine Soldliste, in den Schlamm gefallen. Jeder Söldner im Lager, und was man ihm schuldet.',
   'Una nómina, caída en el barro. Cada mercenario del campamento, y lo que se le debe.', 'Un ruolino paga, caduto nel fango. Ogni mercenario del campo, e quanto gli è dovuto.',
   'Uma folha de pagamento, caída na lama. Cada mercenário do acampamento, e o que lhe devem.', 'Isang listahan ng sahod, nahulog sa putik. Bawat bayarang mandirigma sa kampo, at ang utang sa kanila.',
   'சேற்றில் விழுந்த ஊதியப் பட்டியல். முகாமிலுள்ள ஒவ்வொரு கூலிப்படையாளரும், அவருக்குச் சேர வேண்டியதும்.', 'Daftar gaji, jatuh ke lumpur. Setiap tentara bayaran di perkemahan, dan berapa utangnya pada mereka.',
   '一份饷银名册，掉在泥里。营里每个雇佣兵，还有欠他们多少。', '一份餉銀名冊，掉在泥裡。營裡每個傭兵，還有欠他們多少。', '泥に落ちた給金台帳だ。陣中の傭兵全員と、それぞれの未払い額。', '진흙에 떨어진 급료 명부예요. 진영의 용병 전부와 받을 돈이 적혀 있어요.']),
 ('Look at the bottom line. Nobody\'s been paid since spring.',
  ['Regardez la dernière ligne. Personne n’a été payé depuis le printemps.', 'Sieh dir die letzte Zeile an. Seit dem Frühling ist keiner bezahlt worden.', 'Mira la última línea. Nadie cobra desde la primavera.',
   'Guarda l’ultima riga. Nessuno è stato pagato dalla primavera.', 'Olha para a última linha. Ninguém recebe desde a primavera.', 'Tingnan mo ang huling linya. Walang nasahuran mula pa noong tagsibol.',
   'கடைசி வரியைப் பார். வசந்தத்திலிருந்து யாருக்கும் ஊதியம் கொடுக்கப்படவில்லை.', 'Lihat baris terakhir. Tak ada yang dibayar sejak musim semi.',
   '看最后一行。从春天起就没人拿到过饷。', '看最後一行。從春天起就沒人拿到過餉。', '最後の行を見てみな。春から誰も払われてない。', '맨 아랫줄을 봐요. 봄부터 아무도 돈을 못 받았어요.']),
 ('An army that isn\'t paid starts thinking. Good. Let it think.',
  ['Une armée qu’on ne paie pas se met à réfléchir. Bien. Qu’elle réfléchisse.', 'Ein Heer, das keinen Sold bekommt, fängt an zu denken. Gut. Soll es denken.', 'Un ejército que no cobra empieza a pensar. Bien. Que piense.',
   'Un esercito non pagato comincia a pensare. Bene. Che pensi.', 'Um exército que não recebe começa a pensar. Ótimo. Que pense.', 'Ang hukbong hindi nasasahuran ay nagsisimulang mag-isip. Mabuti. Hayaan itong mag-isip.',
   'ஊதியம் பெறாத படை சிந்திக்கத் தொடங்கும். நல்லது. சிந்திக்கட்டும்.', 'Pasukan yang tidak dibayar mulai berpikir. Bagus. Biar ia berpikir.',
   '拿不到饷的军队就会开始盘算。很好。让它盘算去。', '拿不到餉的軍隊就會開始盤算。很好。讓它盤算去。', '給金の出ない軍は考え始める。よし。考えさせておけ。', '급료를 못 받는 군대는 생각을 하기 시작한다. 좋다. 생각하게 둬라.']),
 # Map 24, Goldfeather Keep
 ('A coin from the Counting House, fallen in a crack. Someone bit it to test it.',
  ['Une pièce du Comptoir, tombée dans une fente. Quelqu’un l’a mordue pour l’éprouver.', 'Eine Münze aus dem Kontor, in eine Ritze gefallen. Jemand hat hineingebissen, um sie zu prüfen.',
   'Una moneda de la Casa de cuentas, caída en una grieta. Alguien la mordió para probarla.', 'Una moneta della Casa dei Conti, caduta in una fessura. Qualcuno l’ha morsa per saggiarla.',
   'Uma moeda da Casa da Contagem, caída numa fenda. Alguém a mordeu para a testar.', 'Barya mula sa Bahay-Bilangan, nahulog sa siwang. May kumagat dito para subukin.',
   'எண்ணும் மாளிகையிலிருந்து ஒரு காசு, விரிசலில் விழுந்தது. சோதிக்க யாரோ கடித்துப் பார்த்திருக்கிறார்கள்.', 'Koin dari Rumah Hitung, jatuh ke celah. Seseorang menggigitnya untuk mengujinya.',
   '一枚账房里的金币，掉进了缝里。有人咬过它，试试真假。', '一枚帳房裡的金幣，掉進了縫裡。有人咬過它，試試真假。', '勘定所の金貨が隙間に落ちている。誰かが確かめるために噛んだ跡がある。', '회계실의 동전이 틈새에 떨어져 있어요. 누군가 진짜인지 깨물어 봤네요.']),
 ('And then left it there?',
  ['Et puis l’a laissée là ?', 'Und sie dann liegen lassen?', '¿Y luego la dejó ahí?', 'E poi l’ha lasciata lì?', 'E depois deixou-a ali?', 'Tapos iniwan lang doon?',
   'பிறகு அங்கேயே விட்டுவிட்டார்களா?', 'Lalu ditinggalkan begitu saja?', '然后就扔在那儿了？', '然後就扔在那兒了？', 'で、そのまま置いていったのか？', '그러고는 그냥 두고 갔다고요?']),
 ('The bite says it\'s lead under the gold. Even the Magnate\'s coins wear armour.',
  ['La morsure dit qu’il y a du plomb sous l’or. Même les pièces du Magnat portent une armure.', 'Der Biss verrät: Unter dem Gold ist Blei. Sogar die Münzen des Magnaten tragen Rüstung.',
   'El mordisco dice que hay plomo bajo el oro. Hasta las monedas del Magnate llevan armadura.', 'Il morso dice che sotto l’oro c’è piombo. Persino le monete del Magnate portano l’armatura.',
   'A dentada diz que há chumbo debaixo do ouro. Até as moedas do Magnata usam armadura.', 'Sabi ng kagat, tingga ito sa ilalim ng ginto. Pati ang mga barya ng Magnate ay nakabaluti.',
   'கடிதடம் சொல்கிறது: பொன்னுக்கு அடியில் ஈயம். செல்வந்தரின் காசுகள்கூடக் கவசம் அணிகின்றன.', 'Bekas gigitan itu bilang di bawah emasnya ada timah. Bahkan koin sang Konglomerat memakai zirah.',
   '那道牙印说明金子底下是铅。连大亨的金币都披着盔甲。', '那道牙印說明金子底下是鉛。連大亨的金幣都披著盔甲。', '噛み跡を見れば金の下は鉛だとわかる。大富豪の金貨でさえ鎧を着ているのさ。', '이빨 자국을 보니 금 아래는 납이에요. 거부의 동전조차 갑옷을 입었네요.']),
]

def load(p): return json.load(open(p, encoding='utf-8'))
def dump(path, d):
    with open(path, 'w', encoding='utf-8') as fh:
        json.dump(d, fh, ensure_ascii=False, indent=1); fh.write('\n')
def rename_in_place(pack, old, new, val):
    out = {}
    for k, v in pack.items():
        if k == old: out[new] = val
        elif k == new: continue
        else: out[k] = v
    return out

# 1) English in the sources
for f, a, b in SRC:
    p = os.path.join(ROOT, f); s = open(p, encoding='utf-8').read()
    if a in s: s = s.replace(a, b)
    else: assert b in s, ('neither old nor new text in ' + f, a)
    open(p, 'w', encoding='utf-8').write(s)
cp = os.path.join(ROOT, 'canonical', 'cards.json'); cj = open(cp, encoding='utf-8').read(); cards = {c['id']: c for c in json.loads(cj)}
for cid, field, a, b in CARD:
    cur = cards[cid][field]
    if cur == b: continue
    assert cur == a, (cid, field, cur)
    old = '"%s": %s' % (field, json.dumps(a)); assert cj.count(old) == 1, (cid, field)
    cj = cj.replace(old, '"%s": %s' % (field, json.dumps(b)))
json.loads(cj); open(cp, 'w', encoding='utf-8').write(cj)

# 2) the 12 packs
for row in REN + [(None, en, tr) for en, tr in NEW]: assert len(row[2]) == 12, row[1]
for i, code in enumerate(CODES):
    paths = {s: os.path.join(ROOT, 'lang', s, code + '.json') if s else os.path.join(ROOT, 'lang', code + '.json') for s in ('', 'ui', 'cards')}
    packs = {s: load(p) for s, p in paths.items()}
    for old, en, tr in REN:
        where = next((s for s in ('', 'ui', 'cards') if old in packs[s]), None)  # '' (the root pack) is falsy: compare with None
        if where is None: where = next((s for s in ('', 'ui', 'cards') if en in packs[s]), 'ui')
        pk = packs[where]
        if old in pk: packs[where] = rename_in_place(pk, old, en, tr[i])
        else: pk[en] = tr[i]
    for en, tr in NEW:
        where = next((s for s in ('', 'ui', 'cards') if en in packs[s]), 'ui')
        packs[where][en] = tr[i]
    for s, pk in packs.items(): dump(paths[s], pk)
print('ok:', len(SRC), 'source edits,', len(CARD), 'card fields,', len(REN), 'renamed rows,', len(NEW), 'new rows x', len(CODES), 'languages')
