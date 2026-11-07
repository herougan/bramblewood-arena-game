#!/usr/bin/env python3
"""Package CONTENT17 (2026-11-07, owner 23:55): the twenty new Claude-pick cards' names (lang/cards/<code>.json) and flavour lines
(lang/ui/<code>.json), and the Map cards window's three new texts (lang/<code>.json, keyed by the English text of the TX keys 'ui.c17-*' in
bramblewood-texts.js). One row per English text; rows that exist are kept, new rows are appended, nothing is sorted.
Tagalog, Tamil and Indonesian deserve a native read.
    python3 tools/i18n_2026_11_07_content17.py   (idempotent)"""
import json, os
ROOT = os.path.join(os.path.dirname(os.path.abspath(__file__)), '..')
CODES = ['fr', 'de', 'es', 'it', 'pt', 'tl', 'ta', 'id', 'zh-Hans', 'zh-Hant', 'ja', 'ko']

UI = [
 ('Ranged', ['À distance', 'Fernkampf', 'A distancia', 'A distanza', 'À distância', 'Malayuan', 'தொலைவு', 'Jarak jauh', '远程', '遠程', '遠距離', '원거리']),
 ('Melee', ['Mêlée', 'Nahkampf', 'Cuerpo a cuerpo', 'Mischia', 'Corpo a corpo', 'Malapitan', 'நெருக்கம்', 'Jarak dekat', '近战', '近戰', '近接', '근접']),
 ('New card', ['Nouvelle carte', 'Neue Karte', 'Carta nueva', 'Nuova carta', 'Carta nova', 'Bagong card', 'புதிய அட்டை', 'Kartu baru', '新卡', '新卡', '新カード', '새 카드']),
]

NAMES = [
 ('Trident Caiman', ['Caïman au trident', 'Dreizack-Kaiman', 'Caimán del tridente', 'Caimano col tridente', 'Jacaré-tridente', 'Caiman na may Salapang', 'திரிசூல முதலை', 'Kaiman Trisula', '三叉戟凯门鳄', '三叉戟凱門鱷', '三叉槍のカイマン', '삼지창 카이만']),
 ('Peat-smoke Shaman', ['Chaman à la fumée de tourbe', 'Torfrauch-Schamane', 'Chamán del humo de turba', 'Sciamano del fumo di torba', 'Xamã da Fumaça de Turfa', 'Shaman ng Usok ng Pit', 'கரிமண் புகை பூசாரி', 'Dukun Asap Gambut', '泥炭烟萨满', '泥炭煙薩滿', '泥炭煙のシャーマン', '토탄 연기 주술사']),
 ('Matamata', ['Matamata', 'Fransenschildkröte', 'Matamata', 'Matamata', 'Matamatá', 'Matamata', 'மாட்டாமாட்டா ஆமை', 'Matamata', '枯叶龟', '枯葉龜', 'マタマタ', '마타마타']),
 ('Bog Lungfish', ['Dipneuste des tourbières', 'Moor-Lungenfisch', 'Pez pulmonado del pantano', 'Dipnoo della palude', 'Peixe-pulmonado do Brejo', 'Lungfish ng Latian', 'சதுப்பு நுரையீரல் மீன்', 'Ikan Paru Rawa', '沼泽肺鱼', '沼澤肺魚', '沼のハイギョ', '늪 폐어']),
 ('Mossmother Newt', ['Triton Mère-Mousse', 'Moosmutter-Molch', 'Tritón Madremusgo', 'Tritone Madremuschio', 'Tritão Mãe-do-Musgo', 'Newt na Inang-Lumot', 'பாசித்தாய் நியூட்', 'Kadal Air Ibu Lumut', '苔藓之母蝾螈', '苔蘚之母蠑螈', '苔母のイモリ', '이끼어멈 영원']),
 ('Reed-dart Bittern', ['Butor aux fléchettes de roseau', 'Schilfpfeil-Rohrdommel', 'Avetoro dardo de junco', 'Tarabuso dai dardi di canna', 'Socó-dardo-de-junco', 'Bittern na may Tibong Tambo', 'நாணல் அம்பு கொக்கு', 'Burung Bittern Panah Buluh', '芦苇镖麻鳽', '蘆葦鏢麻鳽', '葦矢のサンカノゴイ', '갈대 다트 알락해오라기']),
 ('Shoebill', ['Bec-en-sabot', 'Schuhschnabel', 'Picozapato', 'Becco a scarpa', 'Bico-de-sapato', 'Shoebill', 'சப்பாத்து அலகு நாரை', 'Paruh Sepatu', '鲸头鹳', '鯨頭鸛', 'ハシビロコウ', '넓적부리황새']),
 ('Hoatzin', ['Hoazin', 'Hoatzin', 'Hoacín', 'Hoatzin', 'Cigana', 'Hoatzin', 'ஹோட்சின்', 'Hoatzin', '麝雉', '麝雉', 'ツメバケイ', '호아친']),
 ('Shell-drop Gull', ['Goéland lâche-coquillages', 'Muschelwerfer-Möwe', 'Gaviota sueltaconchas', 'Gabbiano getta-conchiglie', 'Gaivota Larga-Conchas', 'Gull na Naghuhulog ng Kabibe', 'சிப்பி வீசும் கடற்பறவை', 'Camar Penjatuh Kerang', '摔贝海鸥', '摔貝海鷗', '貝落としのカモメ', '조개 떨구는 갈매기']),
 ('Smuggler Slingrat', ['Rat contrebandier à la fronde', 'Schmuggler-Schleuderratte', 'Rata contrabandista hondera', 'Ratto contrabbandiere con fionda', 'Rato Contrabandista Fundeiro', 'Dagang Kontrabandista na may Tirador', 'கவண் கடத்தல் எலி', 'Tikus Penyelundup Ketapel', '走私弹弓鼠', '走私彈弓鼠', '密輸人のスリング鼠', '밀수꾼 새총쥐']),
 ('Tidefolk Harpooner', ['Harponneur du Peuple des marées', 'Gezeitenvolk-Harpunier', 'Arponero del Pueblo de la Marea', 'Ramponiere del Popolo delle Maree', 'Arpoador do Povo das Marés', 'Taga-salapang ng Bayan ng Alon', 'அலைமக்கள் ஈட்டியெறிவோன்', 'Penombak Kaum Pasang', '潮民鱼叉手', '潮民魚叉手', '潮の民の銛打ち', '조수족 작살잡이']),
 ('Snapgun Shrimp', ['Crevette canon-claque', 'Knallkanonen-Garnele', 'Camarón cañonazo', 'Gamberetto cannoniere', 'Camarão Canhão-Estalo', 'Hipong Baril-Pitik', 'சொடுக்கு பீரங்கி இறால்', 'Udang Meriam Jentik', '响枪虾', '響槍蝦', 'パチン砲エビ', '딸깍포 새우']),
 ('Quill-flinger Porcupine', ['Porc-épic lance-piquants', 'Stachelschleuder-Stachelschwein', 'Puercoespín lanzapúas', 'Istrice lancia-aculei', 'Porco-espinho Atira-Espinhos', 'Porcupine na Naghahagis ng Tinik', 'முள் எறியும் முள்ளம்பன்றி', 'Landak Pelempar Duri', '掷刺豪猪', '擲刺豪豬', '針投げのヤマアラシ', '가시 던지는 호저']),
 ('Acorn-pelter Squirrel', ['Écureuil lance-glands', 'Eichelwerfer-Eichhörnchen', 'Ardilla tirabellotas', 'Scoiattolo lancia-ghiande', 'Esquilo Atira-Bolotas', 'Ardilyang Bumabato ng Ensina', 'கருவாலிக்காய் எறியும் அணில்', 'Tupai Pelempar Biji Ek', '掷橡果松鼠', '擲橡果松鼠', 'どんぐり投げのリス', '도토리 던지는 다람쥐']),
 ('Pinecone Crossbill', ['Bec-croisé des pommes de pin', 'Zapfen-Kreuzschnabel', 'Piquituerto de piñas', 'Crociere delle pigne', 'Cruza-bico das Pinhas', 'Crossbill ng Bunga ng Pino', 'பைன் கூம்பு குறுக்கலகு', 'Paruh Silang Buah Pinus', '松果交嘴雀', '松果交嘴雀', '松かさのイスカ', '솔방울 솔잣새']),
 ('Yeti Tracker', ['Pisteur de yéti', 'Yeti-Fährtenleser', 'Rastreador de yetis', 'Segugio dello yeti', 'Rastreador de Yeti', 'Taga-sundan ng Yeti', 'எட்டி தடம் தேடி', 'Pelacak Yeti', '雪人追踪者', '雪人追蹤者', 'イエティ追跡者', '예티 추적자']),
 ('Icefletch Fox', ['Renard aux flèches de glace', 'Eispfeil-Fuchs', 'Zorro flechahielo', 'Volpe dalle frecce di ghiaccio', 'Raposa Flecha-de-Gelo', 'Sorong may Palasong Yelo', 'பனி அம்பு நரி', 'Rubah Panah Es', '冰矢狐', '冰矢狐', '氷矢のキツネ', '얼음화살 여우']),
 ('Yeti Snarer', ['Trappeur de yéti', 'Yeti-Fallensteller', 'Lacero de yetis', 'Accalappia-yeti', 'Laçador de Yeti', 'Taga-silo ng Yeti', 'எட்டி கண்ணிவைப்போன்', 'Penjerat Yeti', '雪人套索手', '雪人套索手', 'イエティ捕り', '예티 올가미꾼']),
 ('Sand-flinger Antlion', ['Fourmilion lance-sable', 'Sandwerfer-Ameisenlöwe', 'Hormiga león lanzaarena', 'Formicaleone lancia-sabbia', 'Formiga-leão Atira-Areia', 'Antlion na Naghahagis ng Buhangin', 'மணல் வீசும் எறும்புச்சிங்கம்', 'Undur-undur Pelempar Pasir', '抛沙蚁狮', '拋沙蟻獅', '砂撒きのアリジゴク', '모래 던지는 개미귀신']),
 ('Stonecracker Vulture', ['Vautour casse-pierres', 'Steinknacker-Geier', 'Buitre rompepiedras', 'Avvoltoio spaccasassi', 'Abutre Quebra-Pedras', 'Buwitreng Pambasag ng Bato', 'கல் உடைக்கும் கழுகு', 'Burung Nasar Pemecah Batu', '碎石秃鹫', '碎石禿鷲', '石割りハゲワシ', '돌 깨는 대머리수리']),
]

FLAVOR = [
 ('It found the fork in a sunken boat and learned to throw it. Then it learned to fetch it back.', [
   'Il a trouvé la fourche dans une barque coulée et a appris à la lancer. Puis il a appris à aller la rechercher.',
   'Er fand die Gabel in einem gesunkenen Boot und lernte, sie zu werfen. Dann lernte er, sie zurückzuholen.',
   'Encontró el tridente en una barca hundida y aprendió a lanzarlo. Luego aprendió a ir a buscarlo.',
   'Ha trovato la forca in una barca affondata e ha imparato a lanciarla. Poi ha imparato a riprenderla.',
   'Achou o tridente num barco afundado e aprendeu a atirá-lo. Depois aprendeu a ir buscá-lo.',
   'Natagpuan nito ang salapang sa isang lumubog na bangka at natutong ihagis ito. Saka natuto itong kunin muli.',
   'மூழ்கிய படகில் அந்த முள்கோலைக் கண்டெடுத்து வீசக் கற்றது. பிறகு அதைத் திரும்ப எடுத்து வரவும் கற்றது.',
   'Ia menemukan trisula itu di perahu yang tenggelam dan belajar melemparnya. Lalu ia belajar memungutnya kembali.',
   '它在一艘沉船里找到了这把叉子，学会了投掷。后来又学会了把它捡回来。',
   '牠在一艘沉船裡找到了這把叉子，學會了投擲。後來又學會了把它撿回來。',
   '沈んだ舟で見つけた銛を、投げることを覚えた。それから拾いに戻ることも覚えた。',
   '가라앉은 배에서 작살을 찾아 던지는 법을 배웠다. 그다음엔 다시 주워 오는 법을 배웠다.']),
 ('It hums over a smouldering pot of peat. The smoke smells awful, and the wounds close anyway.', [
   'Il fredonne au-dessus d’un pot de tourbe qui couve. La fumée sent atroce, et les plaies se referment quand même.',
   'Er summt über einem glimmenden Torftopf. Der Rauch stinkt fürchterlich, und die Wunden schließen sich trotzdem.',
   'Tararea sobre una olla de turba humeante. El humo huele fatal, y las heridas se cierran de todos modos.',
   'Canticchia sopra un vaso di torba che fuma. Il fumo puzza da morire, e le ferite si chiudono lo stesso.',
   'Cantarola sobre um pote de turfa fumegante. A fumaça cheira mal, e as feridas fecham mesmo assim.',
   'Humuhuni ito sa ibabaw ng umuusok na palayok ng pit. Napakabaho ng usok, pero gumagaling pa rin ang mga sugat.',
   'புகையும் கரிமண் பானையின் மேல் முணுமுணுக்கிறது. புகை நாற்றமடிக்கிறது, ஆனாலும் காயங்கள் ஆறுகின்றன.',
   'Ia bersenandung di atas kendi gambut yang membara. Asapnya bau sekali, tapi lukanya tetap menutup.',
   '它对着一罐闷烧的泥炭哼着歌。烟味难闻极了，伤口却照样愈合。',
   '牠對著一罐悶燒的泥炭哼著歌。煙味難聞極了，傷口卻照樣癒合。',
   'くすぶる泥炭の壺の上でハミングする。煙はひどい臭いだが、傷はちゃんとふさがる。',
   '연기 나는 토탄 단지 위에서 콧노래를 부른다. 연기 냄새는 끔찍하지만 상처는 아문다.']),
 ('It looks like a heap of dead leaves. Then the heap opens its mouth, and the river goes in.', [
   'On dirait un tas de feuilles mortes. Puis le tas ouvre la bouche, et la rivière y entre.',
   'Sie sieht aus wie ein Haufen welker Blätter. Dann öffnet der Haufen sein Maul, und der Fluss strömt hinein.',
   'Parece un montón de hojas secas. Luego el montón abre la boca y el río entra en ella.',
   'Sembra un mucchio di foglie secche. Poi il mucchio apre la bocca, e il fiume ci entra.',
   'Parece um monte de folhas secas. Então o monte abre a boca, e o rio entra.',
   'Mukha itong tambak ng tuyong dahon. Saka bumubuka ang bibig ng tambak, at pumapasok ang ilog.',
   'உதிர்ந்த இலைக் குவியல் போலத் தெரிகிறது. பிறகு அந்தக் குவியல் வாயைத் திறக்கிறது, ஆறு உள்ளே போகிறது.',
   'Ia tampak seperti tumpukan daun kering. Lalu tumpukan itu membuka mulut, dan sungai pun masuk.',
   '它看起来像一堆枯叶。然后那堆叶子张开了嘴，河水便流了进去。',
   '牠看起來像一堆枯葉。然後那堆葉子張開了嘴，河水便流了進去。',
   '枯れ葉の山にしか見えない。やがてその山が口を開け、川がまるごと流れ込む。',
   '죽은 잎 더미처럼 보인다. 그러다 그 더미가 입을 벌리고, 강물이 빨려 들어간다.']),
 ('When the bog dries up, it wraps itself in mud and waits. It has waited out kings.', [
   'Quand la tourbière s’assèche, il s’enveloppe de boue et attend. Il a survécu à des rois.',
   'Wenn das Moor austrocknet, hüllt er sich in Schlamm und wartet. Er hat schon Könige überdauert.',
   'Cuando el pantano se seca, se envuelve en barro y espera. Ha sobrevivido a reyes.',
   'Quando la palude si secca, si avvolge nel fango e aspetta. Ha visto passare dei re.',
   'Quando o brejo seca, ele se enrola na lama e espera. Já sobreviveu a reis.',
   'Kapag natuyo ang latian, binabalot nito ang sarili sa putik at naghihintay. Nalampasan na nito ang mga hari.',
   'சதுப்பு வறண்டால் சேற்றில் தன்னைச் சுற்றிக்கொண்டு காத்திருக்கிறது. அரசர்களையே கடந்து வாழ்ந்திருக்கிறது.',
   'Saat rawa mengering, ia membungkus diri dengan lumpur dan menunggu. Ia sudah menunggu lebih lama dari raja-raja.',
   '沼泽干涸时，它把自己裹进泥里等待。它熬过了好几代国王。',
   '沼澤乾涸時，牠把自己裹進泥裡等待。牠熬過了好幾代國王。',
   '沼が干上がると、泥にくるまって待つ。王たちよりも長く待ち続けてきた。',
   '늪이 마르면 진흙으로 몸을 감싸고 기다린다. 왕들보다 오래 버텼다.']),
 ('She packs moss into every cut and tells you it was your own fault.', [
   'Elle tasse de la mousse dans chaque entaille et vous dit que c’était votre faute.',
   'Sie stopft Moos in jeden Schnitt und sagt dir, es sei deine eigene Schuld gewesen.',
   'Rellena cada corte con musgo y te dice que fue culpa tuya.',
   'Riempie di muschio ogni taglio e ti dice che è stata colpa tua.',
   'Ela enche cada corte de musgo e diz que a culpa foi sua.',
   'Pinupuno niya ng lumot ang bawat hiwa at sinasabing kasalanan mo rin iyon.',
   'ஒவ்வொரு வெட்டிலும் பாசியை அடைத்து, அது உன் தவறுதான் என்கிறாள்.',
   'Ia menyumpal setiap luka dengan lumut dan bilang itu salahmu sendiri.',
   '她往每道伤口里塞满苔藓，然后告诉你这都怪你自己。',
   '她往每道傷口裡塞滿苔蘚，然後告訴你這都怪你自己。',
   'どの切り傷にも苔を詰めこんで、あんたの自業自得だと言う。',
   '베인 상처마다 이끼를 채워 넣고는 네 잘못이라고 말한다.']),
 ('It stands as still as a reed. Then one of the reeds flies at you.', [
   'Il reste immobile comme un roseau. Puis l’un des roseaux vole vers vous.',
   'Sie steht still wie ein Schilfhalm. Dann fliegt einer der Halme auf dich zu.',
   'Se queda quieto como un junco. Luego uno de los juncos sale volando hacia ti.',
   'Sta immobile come una canna. Poi una delle canne ti vola contro.',
   'Fica parado como um junco. Então um dos juncos voa na sua direção.',
   'Nakatayo itong kasing-tahimik ng tambo. Saka may isang tambong lumilipad papunta sa iyo.',
   'நாணல் போல அசையாமல் நிற்கிறது. பிறகு நாணல்களில் ஒன்று உன்னை நோக்கிப் பறக்கிறது.',
   'Ia berdiri diam seperti sebatang buluh. Lalu salah satu buluh melesat ke arahmu.',
   '它像一根芦苇般纹丝不动。然后，其中一根芦苇朝你飞了过来。',
   '牠像一根蘆葦般紋絲不動。然後，其中一根蘆葦朝你飛了過來。',
   '葦のように微動だにしない。そして葦の一本がこちらへ飛んでくる。',
   '갈대처럼 꼼짝 않고 서 있다. 그러다 갈대 하나가 너에게 날아온다.']),
 ('It can stand and stare for an hour. Nothing in the bog has ever won the staring contest.', [
   'Il peut rester debout à fixer pendant une heure. Rien dans le marais n’a jamais gagné le concours de regards.',
   'Er kann eine Stunde lang dastehen und starren. Nichts im Moor hat je das Anstarren gewonnen.',
   'Puede quedarse una hora mirando fijamente. Nada en el pantano ha ganado nunca el duelo de miradas.',
   'Può restare fermo a fissare per un’ora. Niente nella palude ha mai vinto la gara di sguardi.',
   'Consegue ficar uma hora encarando. Nada no brejo jamais venceu o duelo de olhares.',
   'Kaya nitong tumayo at tumitig nang isang oras. Wala pang nanalo sa labanan ng titigan sa latian.',
   'ஒரு மணி நேரம் நின்று வெறித்துப் பார்க்கும். சதுப்பில் எதுவும் அந்தப் பார்வைப் போட்டியில் வென்றதில்லை.',
   'Ia bisa berdiri menatap selama sejam. Belum ada makhluk rawa yang menang adu tatap dengannya.',
   '它能站着盯上一个小时。沼泽里从没有谁赢过这场瞪眼比赛。',
   '牠能站著盯上一個小時。沼澤裡從沒有誰贏過這場瞪眼比賽。',
   '一時間でも立ったまま見つめていられる。沼でにらめっこに勝ったものはいない。',
   '한 시간이고 서서 노려볼 수 있다. 늪에서 그 눈싸움을 이긴 자는 없다.']),
 ('Everything downwind calls it the stinkbird. Its chicks climb with claws on their wings.', [
   'Tout ce qui est sous le vent l’appelle l’oiseau puant. Ses petits grimpent avec des griffes au bout des ailes.',
   'Alles, was unter dem Wind steht, nennt ihn Stinkvogel. Seine Küken klettern mit Krallen an den Flügeln.',
   'Todo lo que está a sotavento lo llama el pájaro apestoso. Sus crías trepan con garras en las alas.',
   'Tutto ciò che sta sottovento lo chiama l’uccello puzzolente. I suoi pulcini si arrampicano con artigli sulle ali.',
   'Tudo o que fica a favor do vento a chama de ave fedorenta. Seus filhotes escalam com garras nas asas.',
   'Tinatawag itong mabahong ibon ng lahat ng nasa daan ng hangin. Umaakyat ang mga sisiw nito gamit ang kuko sa pakpak.',
   'காற்று வீசும் திசையில் உள்ள எல்லாம் இதை நாற்றப் பறவை என்கின்றன. அதன் குஞ்சுகள் இறக்கை நகங்களால் ஏறுகின்றன.',
   'Semua yang ada di hilir angin menyebutnya burung bau. Anak-anaknya memanjat dengan cakar di sayap.',
   '下风处的一切都叫它臭鸟。它的雏鸟靠翅膀上的爪子攀爬。',
   '下風處的一切都叫牠臭鳥。牠的雛鳥靠翅膀上的爪子攀爬。',
   '風下にいるものはみな、これを臭い鳥と呼ぶ。ひなは翼の爪でよじ登る。',
   '바람이 불어 가는 쪽의 모두가 냄새 새라고 부른다. 새끼들은 날개의 발톱으로 기어오른다.']),
 ('It drops shells on the rocks to crack them. It does not much mind what is under the rocks.', [
   'Il lâche des coquillages sur les rochers pour les casser. Ce qu’il y a sous les rochers lui importe peu.',
   'Sie lässt Muscheln auf die Felsen fallen, um sie zu knacken. Was unter den Felsen ist, kümmert sie wenig.',
   'Deja caer conchas sobre las rocas para romperlas. Poco le importa lo que haya debajo.',
   'Lascia cadere conchiglie sugli scogli per romperle. Di ciò che sta sotto gli scogli, poco gli importa.',
   'Larga conchas nas pedras para quebrá-las. Pouco se importa com o que está embaixo delas.',
   'Ibinabagsak nito ang mga kabibe sa bato para mabasag. Wala itong pakialam kung ano ang nasa ilalim ng bato.',
   'சிப்பிகளை உடைக்கப் பாறைகளின் மேல் போடுகிறது. பாறைக்குக் கீழே என்ன இருக்கிறது என்பதைப் பற்றி அதிகம் கவலைப்படுவதில்லை.',
   'Ia menjatuhkan kerang ke batu untuk memecahkannya. Ia tak terlalu peduli apa yang ada di bawah batu.',
   '它把贝壳扔到岩石上摔碎。至于岩石下面有什么，它不太在意。',
   '牠把貝殼扔到岩石上摔碎。至於岩石下面有什麼，牠不太在意。',
   '貝を岩に落として割る。岩の下に何がいようと、あまり気にしない。',
   '조개를 바위에 떨어뜨려 깬다. 바위 밑에 뭐가 있든 별로 신경 쓰지 않는다.']),
 ('Sells you the lantern, then shoots it out. Everything has a price, friend, even the dark.', [
   'Il vous vend la lanterne, puis la crève d’un tir. Tout a un prix, l’ami, même le noir.',
   'Verkauft dir die Laterne und schießt sie dann aus. Alles hat seinen Preis, Freund, sogar die Dunkelheit.',
   'Te vende el farol y luego lo apaga de un tiro. Todo tiene precio, amigo, hasta la oscuridad.',
   'Ti vende la lanterna, poi la spegne con un tiro. Tutto ha un prezzo, amico, anche il buio.',
   'Vende a lanterna e depois a apaga com um tiro. Tudo tem preço, amigo, até o escuro.',
   'Ibinebenta sa iyo ang parol, saka binabaril para mamatay. Lahat may presyo, kaibigan, pati ang dilim.',
   'விளக்கை உனக்கு விற்கும், பிறகு அதைச் சுட்டு அணைக்கும். எல்லாவற்றுக்கும் விலை உண்டு நண்பா, இருளுக்கும் கூட.',
   'Menjual lentera padamu, lalu menembaknya padam. Semua ada harganya, kawan, bahkan gelap.',
   '先卖你灯笼，再一弹打灭它。朋友，什么都有价钱，连黑暗也是。',
   '先賣你燈籠，再一彈打滅它。朋友，什麼都有價錢，連黑暗也是。',
   'ランタンを売りつけて、それから撃ち消す。何にでも値段はあるのさ、旦那。暗闇にもね。',
   '등불을 팔고는 쏴서 꺼 버린다. 뭐든 값이 있지, 친구. 어둠조차도.']),
 ('The Tidefolk throw from below the surface. The dry ones never see the arm.', [
   'Le Peuple des marées lance depuis sous la surface. Les secs ne voient jamais le bras.',
   'Das Gezeitenvolk wirft von unter der Oberfläche. Die Trockenen sehen den Arm nie.',
   'El Pueblo de la Marea lanza desde bajo la superficie. Los secos nunca ven el brazo.',
   'Il Popolo delle Maree lancia da sotto la superficie. Gli asciutti non vedono mai il braccio.',
   'O Povo das Marés arremessa de baixo da superfície. Os secos nunca veem o braço.',
   'Naghahagis ang Bayan ng Alon mula sa ilalim ng tubig. Hindi kailanman nakikita ng mga tuyo ang bisig.',
   'அலைமக்கள் நீர்ப்பரப்புக்குக் கீழிருந்து எறிகிறார்கள். உலர்ந்தவர்கள் அந்தக் கையைப் பார்ப்பதே இல்லை.',
   'Kaum Pasang melempar dari bawah permukaan. Kaum kering tak pernah melihat lengannya.',
   '潮民从水面下投掷。干燥者从来看不见那只手。',
   '潮民從水面下投擲。乾燥者從來看不見那隻手。',
   '潮の民は水面の下から投げる。乾いた者たちには、その腕が見えない。',
   '조수족은 수면 아래에서 던진다. 마른 자들은 그 팔을 결코 보지 못한다.']),
 ('One snap makes a bubble hotter than a forge. It pops two fish away.', [
   'Un claquement fait une bulle plus chaude qu’une forge. Elle éclate deux poissons plus loin.',
   'Ein Knall erzeugt eine Blase, heißer als eine Esse. Sie platzt zwei Fische weiter.',
   'Un chasquido crea una burbuja más caliente que una fragua. Revienta a dos peces de distancia.',
   'Uno schiocco crea una bolla più calda di una forgia. Scoppia due pesci più in là.',
   'Um estalo faz uma bolha mais quente que uma forja. Ela estoura a dois peixes de distância.',
   'Isang pitik ay lumilikha ng bulang mas mainit pa sa pandayan. Pumuputok ito dalawang isda ang layo.',
   'ஒரு சொடுக்கு உலையை விடச் சூடான குமிழியை உண்டாக்குகிறது. அது இரண்டு மீன் தூரத்தில் வெடிக்கிறது.',
   'Satu jentikan membuat gelembung yang lebih panas dari tungku. Ia meletus dua ekor ikan jauhnya.',
   '一声脆响就能造出比熔炉还烫的气泡，在两条鱼开外炸开。',
   '一聲脆響就能造出比熔爐還燙的氣泡，在兩條魚開外炸開。',
   'ひと鳴らしで鍛冶炉より熱い泡ができ、魚二匹先ではじける。',
   '한 번 딸깍하면 대장간보다 뜨거운 거품이 생겨 물고기 두 마리 너머에서 터진다.']),
 ('Porcupines cannot throw their quills, everyone says. This one never heard.', [
   'Les porcs-épics ne peuvent pas lancer leurs piquants, tout le monde le dit. Celui-ci n’a jamais entendu.',
   'Stachelschweine können ihre Stacheln nicht werfen, sagt jeder. Dieses hat es nie gehört.',
   'Los puercoespines no pueden lanzar sus púas, dice todo el mundo. Este nunca se enteró.',
   'Gli istrici non possono lanciare gli aculei, lo dicono tutti. Questo non l’ha mai sentito dire.',
   'Porcos-espinhos não atiram espinhos, todo mundo diz. Este nunca ouviu falar.',
   'Hindi raw kayang ihagis ng porcupine ang mga tinik nito, sabi ng lahat. Hindi ito nakarinig.',
   'முள்ளம்பன்றிகளால் முட்களை எறிய முடியாது என்று எல்லோரும் சொல்கிறார்கள். இது அதைக் கேட்டதே இல்லை.',
   'Landak tak bisa melempar durinya, kata semua orang. Yang satu ini tak pernah dengar.',
   '人人都说豪猪不会扔刺。这一只从没听说过。',
   '人人都說豪豬不會扔刺。這一隻從沒聽說過。',
   'ヤマアラシは針を投げられない、と誰もが言う。こいつは聞いたことがない。',
   '호저는 가시를 못 던진다고들 한다. 이 녀석은 그런 말을 들어 본 적이 없다.']),
 ('It has a whole tree of ammunition and a very good memory for faces.', [
   'Il a tout un arbre de munitions et une très bonne mémoire des visages.',
   'Es hat einen ganzen Baum voller Munition und ein sehr gutes Gedächtnis für Gesichter.',
   'Tiene un árbol entero de munición y muy buena memoria para las caras.',
   'Ha un albero intero di munizioni e un’ottima memoria per le facce.',
   'Tem uma árvore inteira de munição e uma ótima memória para rostos.',
   'May isang buong punong bala ito at napakahusay na alaala sa mga mukha.',
   'அதனிடம் ஒரு மரம் முழுக்க வெடிபொருள் இருக்கிறது, முகங்களை நன்றாக நினைவில் வைத்திருக்கிறது.',
   'Ia punya sebatang pohon penuh amunisi dan ingatan yang sangat baik akan wajah.',
   '它有一整棵树的弹药，还特别记得住长相。',
   '牠有一整棵樹的彈藥，還特別記得住長相。',
   '弾は木一本ぶん。顔はひとつ残らず覚えている。',
   '나무 한 그루 분량의 탄약과 아주 좋은 얼굴 기억력을 지녔다.']),
 ('Its crossed beak was made for prising open pinecones. Dropping them on wolves came later.', [
   'Son bec croisé était fait pour ouvrir les pommes de pin. Les lâcher sur les loups est venu plus tard.',
   'Sein gekreuzter Schnabel war zum Aufhebeln von Zapfen gemacht. Sie auf Wölfe fallen zu lassen, kam später.',
   'Su pico cruzado servía para abrir piñas. Dejarlas caer sobre los lobos vino después.',
   'Il suo becco incrociato era fatto per aprire le pigne. Farle cadere sui lupi è venuto dopo.',
   'O bico cruzado foi feito para abrir pinhas. Largá-las nos lobos veio depois.',
   'Ginawa ang krus nitong tuka para magbukas ng bunga ng pino. Ang paghuhulog nito sa mga lobo ay dumating kalaunan.',
   'அதன் குறுக்கலகு பைன் கூம்புகளைத் திறக்கவே உருவானது. ஓநாய்கள் மேல் போடுவது பிறகு வந்தது.',
   'Paruhnya yang bersilang dibuat untuk mencungkil buah pinus. Menjatuhkannya ke serigala datang belakangan.',
   '它交叉的喙本是用来撬开松果的。往狼身上扔松果是后来的事。',
   '牠交叉的喙本是用來撬開松果的。往狼身上扔松果是後來的事。',
   '交差したくちばしは松かさをこじ開けるためのもの。狼の上に落とすのは後から覚えた。',
   '어긋난 부리는 솔방울을 벌리려고 생겨났다. 늑대 위로 떨어뜨리는 건 나중 일이다.']),
 ('It reads a yeti track like a letter: how big, how hungry, how long ago.', [
   'Il lit une trace de yéti comme une lettre : quelle taille, quelle faim, depuis combien de temps.',
   'Er liest eine Yeti-Spur wie einen Brief: wie groß, wie hungrig, wie lange her.',
   'Lee una huella de yeti como una carta: qué tamaño, cuánta hambre, hace cuánto.',
   'Legge un’orma di yeti come una lettera: quanto è grande, quanto ha fame, da quanto è passato.',
   'Lê um rastro de yeti como uma carta: o tamanho, a fome, há quanto tempo.',
   'Binabasa nito ang bakas ng yeti na parang liham: gaano kalaki, gaano kagutom, gaano na katagal.',
   'எட்டியின் தடத்தைக் கடிதம் போலப் படிக்கிறது: எவ்வளவு பெரியது, எவ்வளவு பசி, எவ்வளவு நேரம் முன்.',
   'Ia membaca jejak yeti seperti surat: seberapa besar, seberapa lapar, sudah berapa lama.',
   '它读雪人的足迹就像读信：多大、多饿、多久以前。',
   '牠讀雪人的足跡就像讀信：多大、多餓、多久以前。',
   'イエティの足跡を手紙のように読む。どれほど大きく、どれほど飢え、どれほど前か。',
   '예티 발자국을 편지처럼 읽는다. 얼마나 큰지, 얼마나 배고픈지, 얼마나 오래전인지.']),
 ('Its shafts are icicles snapped from the eaves. They melt away; the cold stays in.', [
   'Ses traits sont des glaçons cassés aux avant-toits. Ils fondent ; le froid reste dedans.',
   'Seine Schäfte sind Eiszapfen von der Traufe. Sie schmelzen; die Kälte bleibt drin.',
   'Sus astiles son carámbanos arrancados de los aleros. Se derriten; el frío se queda dentro.',
   'Le sue frecce sono ghiaccioli staccati dalle grondaie. Si sciolgono; il freddo resta dentro.',
   'Suas hastes são pingentes de gelo arrancados dos beirais. Derretem; o frio fica.',
   'Ang mga palaso nito ay mga yelong pinutol mula sa bubong. Natutunaw ang mga ito; nananatili ang lamig.',
   'அதன் அம்புகள் கூரை விளிம்பிலிருந்து ஒடித்த பனிக்கட்டிகள். அவை உருகிவிடும்; குளிர் உள்ளேயே தங்கும்.',
   'Anak panahnya adalah es runcing yang dipatahkan dari atap. Esnya mencair; dinginnya tetap tinggal.',
   '它的箭是从屋檐上掰下的冰柱。冰会化掉，寒意却留在里面。',
   '牠的箭是從屋簷上掰下的冰柱。冰會化掉，寒意卻留在裡面。',
   '矢は軒から折ったつらら。溶けて消えても、冷たさは残る。',
   '화살은 처마에서 꺾은 고드름이다. 녹아 없어져도 냉기는 남는다.']),
 ('The yeti hunters bring rope, patience and one snow leopard who has done this before.', [
   'Les chasseurs de yéti apportent de la corde, de la patience et un léopard des neiges qui a déjà fait ça.',
   'Die Yeti-Jäger bringen Seil, Geduld und einen Schneeleoparden mit, der das schon einmal gemacht hat.',
   'Los cazadores de yetis traen cuerda, paciencia y un leopardo de las nieves que ya lo ha hecho antes.',
   'I cacciatori di yeti portano corda, pazienza e un leopardo delle nevi che l’ha già fatto.',
   'Os caçadores de yeti trazem corda, paciência e um leopardo-das-neves que já fez isso antes.',
   'Nagdadala ang mga mangangaso ng yeti ng lubid, tiyaga, at isang leopardo ng niyebe na nakagawa na nito dati.',
   'எட்டி வேட்டைக்காரர்கள் கயிறு, பொறுமை, இதை முன்பே செய்த ஒரு பனிச்சிறுத்தை ஆகியவற்றைக் கொண்டு வருகிறார்கள்.',
   'Para pemburu yeti membawa tali, kesabaran, dan seekor macan tutul salju yang sudah pernah melakukannya.',
   '雪人猎手带着绳子、耐心，还有一只干过这活的雪豹。',
   '雪人獵手帶著繩子、耐心，還有一隻幹過這活的雪豹。',
   'イエティ狩りが持ってくるのは、縄と根気と、前にもやったことのある雪豹一頭。',
   '예티 사냥꾼들은 밧줄과 인내심, 그리고 이 일을 해 본 눈표범 한 마리를 데려온다.']),
 ('It flicks sand at anything on the slope until the slope gives way.', [
   'Il projette du sable sur tout ce qui se trouve sur la pente, jusqu’à ce que la pente cède.',
   'Er schnippt Sand auf alles am Hang, bis der Hang nachgibt.',
   'Lanza arena a todo lo que está en la ladera hasta que la ladera cede.',
   'Lancia sabbia su qualsiasi cosa sul pendio finché il pendio non cede.',
   'Joga areia em tudo o que está na encosta até a encosta ceder.',
   'Pinipitik nito ang buhangin sa anumang nasa dalisdis hanggang gumuho ang dalisdis.',
   'சரிவில் உள்ள எதன் மீதும் சரிவு சரியும் வரை மணலைச் சுண்டி வீசுகிறது.',
   'Ia menjentikkan pasir ke apa saja di lereng sampai lerengnya runtuh.',
   '它朝坡上的一切弹沙子，直到斜坡塌下去。',
   '牠朝坡上的一切彈沙子，直到斜坡塌下去。',
   '斜面にいるものに砂を弾き続ける。斜面が崩れるまで。',
   '비탈 위의 무엇에든 모래를 튕긴다. 비탈이 무너질 때까지.']),
 ('Too small to crack an egg by force, so it carries a stone. Then it found other things to crack.', [
   'Trop petit pour casser un œuf de force, il porte une pierre. Puis il a trouvé d’autres choses à casser.',
   'Zu klein, um ein Ei mit Gewalt zu knacken, also trägt er einen Stein. Dann fand er andere Dinge zum Knacken.',
   'Demasiado pequeño para romper un huevo a la fuerza, así que lleva una piedra. Luego encontró otras cosas que romper.',
   'Troppo piccolo per rompere un uovo con la forza, così porta un sasso. Poi ha trovato altro da rompere.',
   'Pequeno demais para quebrar um ovo à força, ele carrega uma pedra. Depois achou outras coisas para quebrar.',
   'Masyadong maliit para basagin ang itlog sa lakas, kaya nagdadala ito ng bato. Saka ito nakakita ng ibang mababasag.',
   'முட்டையை வலிமையால் உடைக்க முடியாத அளவு சிறியது, அதனால் ஒரு கல்லைச் சுமக்கிறது. பிறகு உடைக்க வேறு பொருட்களையும் கண்டது.',
   'Terlalu kecil untuk memecah telur dengan tenaga, jadi ia membawa batu. Lalu ia menemukan hal lain untuk dipecahkan.',
   '它太小，没法硬啄开蛋，于是叼来一块石头。后来它又找到了别的可以砸的东西。',
   '牠太小，沒法硬啄開蛋，於是叼來一塊石頭。後來牠又找到了別的可以砸的東西。',
   '力ずくで卵を割るには小さすぎるから、石を運ぶ。そのうち、ほかにも割るものを見つけた。',
   '힘으로 알을 깨기엔 너무 작아서 돌을 나른다. 그러다 깰 만한 다른 것들을 찾아냈다.']),
]


def load(p):
    with open(p, encoding='utf-8') as fh:
        return json.load(fh)


def dump(p, d):
    with open(p, 'w', encoding='utf-8') as fh:
        json.dump(d, fh, ensure_ascii=False, indent=1); fh.write('\n')


def main():
    stats = {}
    for i, code in enumerate(CODES):
        added = 0
        for rel, rows in ((os.path.join('lang', code + '.json'), UI), (os.path.join('lang', 'cards', code + '.json'), NAMES), (os.path.join('lang', 'ui', code + '.json'), FLAVOR)):
            p = os.path.join(ROOT, rel); pack = load(p)
            for en, tr in rows:
                assert len(tr) == 12, en
                if en not in pack: pack[en] = tr[i]; added += 1
            dump(p, pack)
        stats[code] = added
    print('ok: rows added per language:', stats)


if __name__ == '__main__':
    main()
