#!/usr/bin/env python3
"""Card names and flavour lines of the 2026-10-19 candidate pool (package AN, owner 23:04: "More thematic animals ... like pin
cushions (uni = sea urchins) and sea snakes ... Do the polar ones in advance"), and the Admin "Pool cards" filter's texts.
Names go to lang/cards/<code>.json, flavour lines to lang/ui/<code>.json (the page translator matches the card's English flavour),
the TX texts to the main packs lang/<code>.json. Same caveats as i18n_core.py (Tagalog, Tamil, Japanese and Korean deserve a native
read). Animal names follow each language's common name where one exists.

    python3 tools/i18n_2026_10_19_pool.py && python3 assemble_arena.py && mv bramblewood-arena.html index.html
"""
import json, os, re
ROOT = os.path.join(os.path.dirname(os.path.abspath(__file__)), '..')
CODES = ['fr', 'de', 'es', 'it', 'pt', 'tl', 'ta', 'id', 'zh-Hans', 'zh-Hant', 'ja', 'ko']

NAMES = {
# Map 0
"Water Vole": ["Campagnol amphibie", "Schermaus", "Rata de agua", "Arvicola acquatica", "Rato-de-água", "Dagang-tubig", "நீர் எலி", "Tikus Air", "欧洲水鼠", "歐洲水鼠", "ミズハタネズミ", "물밭쥐"],
"River Mink": ["Vison des rivières", "Flussnerz", "Visón de río", "Visone di fiume", "Vison-do-rio", "Mink ng Ilog", "ஆற்று மிங்க்", "Cerpelai Sungai", "河畔水貂", "河畔水貂", "カワミンク", "강밍크"],
"Signal Crayfish": ["Écrevisse signal", "Signalkrebs", "Cangrejo señal", "Gambero segnale", "Lagostim-sinal", "Signal na Ulang", "சிக்னல் நன்னீர் இறால்", "Udang Karang Sinyal", "信号小龙虾", "信號小龍蝦", "ウチダザリガニ", "시그널가재"],
"Pine Marten": ["Martre des pins", "Baummarder", "Marta", "Martora", "Marta", "Marten ng Pino", "பைன் மார்ட்டன்", "Marten Pinus", "松貂", "松貂", "マツテン", "소나무담비"],
"Woodcock Lookout": ["Bécasse vigie", "Schnepfen-Späher", "Becada vigía", "Beccaccia di vedetta", "Galinhola vigia", "Bantay na Woodcock", "வுட்காக் காவலன்", "Pengintai Berkik", "丘鹬哨兵", "丘鷸哨兵", "見張りのヤマシギ", "멧도요 파수꾼"],
"Grass Snake": ["Couleuvre à collier", "Ringelnatter", "Culebra de collar", "Biscia dal collare", "Cobra-de-água-de-colar", "Ahas-damo", "புல் பாம்பு", "Ular Rumput", "水游蛇", "水游蛇", "ヨーロッパヤマカガシ", "유럽풀뱀"],
# Map 1
"Ladybird Guard": ["Coccinelle de garde", "Marienkäfer-Wache", "Mariquita guardiana", "Coccinella di guardia", "Joaninha guardiã", "Bantay na Ladybug", "லேடிபேர்ட் காவலன்", "Penjaga Kepik", "瓢虫卫兵", "瓢蟲衛兵", "テントウムシの衛兵", "무당벌레 경비병"],
"Hedgerow Shrew": ["Musaraigne des haies", "Heckenspitzmaus", "Musaraña del seto", "Toporagno delle siepi", "Musaranho-das-sebes", "Shrew ng Bakod", "வேலி மூஞ்சூறு", "Cecurut Pagar", "树篱鼩鼱", "樹籬鼩鼱", "生け垣のトガリネズミ", "산울타리 땃쥐"],
"Stag Beetle": ["Lucane cerf-volant", "Hirschkäfer", "Ciervo volante", "Cervo volante", "Vaca-loura", "Salagubang-usa", "மான் வண்டு", "Kumbang Rusa", "锹甲", "鍬甲", "クワガタムシ", "사슴벌레"],
"Slow-worm": ["Orvet", "Blindschleiche", "Lución", "Orbettino", "Licranço", "Butiking Walang Paa", "கால் இல்லாப் பல்லி", "Kadal Tanpa Kaki", "蛇蜥", "蛇蜥", "ヒメアシナシトカゲ", "무족도마뱀"],
"Robin Redbreast": ["Rouge-gorge", "Rotkehlchen", "Petirrojo", "Pettirosso", "Pisco-de-peito-ruivo", "Robin na Pula ang Dibdib", "செம்மார்பு ராபின்", "Robin Dada Merah", "欧亚鸲", "歐亞鴝", "ヨーロッパコマドリ", "유럽울새"],
"Field Vole": ["Campagnol agreste", "Erdmaus", "Topillo agreste", "Arvicola agreste", "Rato-do-campo", "Daga sa Parang", "வயல் எலி", "Tikus Ladang", "田鼠", "田鼠", "キタハタネズミ", "들밭쥐"],
# Map 2
"Pincushion Urchin": ["Oursin pelote", "Nadelkissen-Seeigel", "Erizo de mar acerico", "Riccio puntaspilli", "Ouriço-alfineteiro", "Salawaking Unan-karayom", "ஊசிப்பஞ்சு கடல் முள்ளெலி", "Bulu Babi Bantalan Jarum", "针垫海胆", "針墊海膽", "針山ウニ", "바늘방석 성게"],
"Rock Pool Starfish": ["Étoile de mer des flaques", "Gezeitentümpel-Seestern", "Estrella de mar de charca", "Stella marina delle pozze", "Estrela-do-mar das poças", "Bituing-dagat ng Batuhan", "பாறைக்குளக் கடல் நட்சத்திரம்", "Bintang Laut Kolam Batu", "礁池海星", "礁池海星", "潮だまりのヒトデ", "조수 웅덩이 불가사리"],
"Oystercatcher": ["Huîtrier pie", "Austernfischer", "Ostrero", "Beccaccia di mare", "Ostraceiro", "Ibong Talaba", "சிப்பி பிடிப்பான்", "Burung Pemakan Tiram", "蛎鹬", "蠣鷸", "ミヤコドリ", "검은머리물떼새"],
"Sanderling": ["Bécasseau sanderling", "Sanderling", "Correlimos tridáctilo", "Piovanello tridattilo", "Pilrito-das-praias", "Sanderling", "மணல் உள்ளான்", "Kedidi Putih", "三趾滨鹬", "三趾濱鷸", "ミユビシギ", "세가락도요"],
"Grey Seal Bull": ["Phoque gris mâle", "Kegelrobben-Bulle", "Macho de foca gris", "Maschio di foca grigia", "Macho de foca-cinzenta", "Lalaking Abuhing Seal", "சாம்பல் கடல்நாய்க் காளை", "Anjing Laut Abu Jantan", "雄灰海豹", "雄灰海豹", "ハイイロアザラシの雄", "회색물범 수컷"],
"Limpet Clinger": ["Patelle accrochée", "Klammernde Napfschnecke", "Lapa aferrada", "Patella aggrappata", "Lapa agarrada", "Kapit na Limpet", "ஒட்டும் லிம்பெட்", "Limpet Penempel", "紧抓帽贝", "緊抓帽貝", "しがみつくカサガイ", "달라붙는 삿갓조개"],
# Map 3
"Puffin Diver": ["Macareux plongeur", "Papageitaucher", "Frailecillo buceador", "Pulcinella di mare tuffatrice", "Papagaio-do-mar mergulhador", "Sumisisid na Puffin", "மூழ்கும் பஃபின்", "Puffin Penyelam", "潜水海鹦", "潛水海鸚", "潜水するニシツノメドリ", "잠수하는 퍼핀"],
"Razorbill": ["Petit pingouin", "Tordalk", "Alca común", "Gazza marina", "Torda-mergulheira", "Razorbill", "கத்தி அலகுப் பறவை", "Alka Paruh Pisau", "刀嘴海雀", "刀嘴海雀", "オオハシウミガラス", "큰부리바다오리"],
"Kittiwake Flock": ["Volée de mouettes tridactyles", "Dreizehenmöwen-Schwarm", "Bandada de gaviotas tridáctilas", "Stormo di gabbiani tridattili", "Bando de gaivotas-tridáctilas", "Kawan ng Kittiwake", "கிட்டிவேக் கூட்டம்", "Kawanan Camar Kittiwake", "三趾鸥群", "三趾鷗群", "ミツユビカモメの群れ", "세가락갈매기 떼"],
"Peregrine Stooper": ["Faucon pèlerin en piqué", "Sturzflug-Wanderfalke", "Halcón peregrino en picado", "Pellegrino in picchiata", "Falcão-peregrino em picada", "Bumubulusok na Peregrine", "பாய்ந்திறங்கும் பெரிகிரின் வல்லூறு", "Alap-alap Kawah Penukik", "俯冲游隼", "俯衝遊隼", "急降下するハヤブサ", "급강하 매"],
"Fulmar Spitter": ["Fulmar cracheur", "Spuckender Eissturmvogel", "Fulmar escupidor", "Fulmaro sputatore", "Fulmar cuspidor", "Nandudurang Fulmar", "துப்பும் ஃபுல்மார்", "Fulmar Peludah", "喷油暴风鹱", "噴油暴風鸌", "油を吐くフルマカモメ", "침 뱉는 풀마갈매기"],
"Red-billed Chough": ["Crave à bec rouge", "Alpenkrähe", "Chova piquirroja", "Gracchio corallino", "Gralha-de-bico-vermelho", "Pulang-tuka na Chough", "சிவப்பு அலகுக் காகம்", "Gagak Paruh Merah", "红嘴山鸦", "紅嘴山鴉", "ベニハシガラス", "붉은부리까마귀"],
# Map 4
"Muskrat Lodgekeeper": ["Rat musqué gardien de hutte", "Bisamratten-Burgwart", "Rata almizclera guardiana", "Topo muschiato custode", "Rato-almiscarado guardião", "Muskrat na Tagabantay ng Kubo", "கஸ்தூரி எலிக் குடில் காவலன்", "Tikus Kesturi Penjaga Pondok", "麝鼠守巢者", "麝鼠守巢者", "巣守りのマスクラット", "사향쥐 오두막지기"],
"Water Shrew": ["Crossope aquatique", "Wasserspitzmaus", "Musgaño patiblanco", "Toporagno d'acqua", "Musaranho-de-água", "Shrew ng Tubig", "நீர் மூஞ்சூறு", "Cecurut Air", "水鼩", "水鼩", "ミズトガリネズミ", "물땃쥐"],
"Pyrenean Desman": ["Desman des Pyrénées", "Pyrenäen-Desman", "Desmán ibérico", "Desman dei Pirenei", "Toupeira-de-água", "Desman ng Pyrenees", "பிரனீஸ் டெஸ்மன்", "Desman Pirenia", "比利牛斯山鼬鼹", "比利牛斯山鼬鼴", "ピレネーデスマン", "피레네데스만"],
"Great Crested Grebe": ["Grèbe huppé", "Haubentaucher", "Somormujo lavanco", "Svasso maggiore", "Mergulhão-de-crista", "Malaking May-tuktok na Grebe", "பெருங்கொண்டை முக்குளிப்பான்", "Titihan Jambul Besar", "凤头䴙䴘", "鳳頭鸊鷉", "カンムリカイツブリ", "뿔논병아리"],
"Old Sturgeon": ["Vieil esturgeon", "Alter Stör", "Viejo esturión", "Vecchio storione", "Velho esturjão", "Matandang Sturgeon", "முதிய ஸ்டர்ஜன் மீன்", "Ikan Sturgeon Tua", "老鲟鱼", "老鱘魚", "年老いたチョウザメ", "늙은 철갑상어"],
"Diving Bell Spider": ["Argyronète", "Wasserspinne", "Araña de agua", "Ragno palombaro", "Aranha-de-água", "Gagambang Kampanang-sisid", "நீர்மணிச் சிலந்தி", "Laba-laba Lonceng Selam", "水蛛", "水蛛", "ミズグモ", "물거미"],
# Map 5
"Alligator Gar": ["Garpique alligator", "Alligatorhecht", "Pejelagarto", "Luccio alligatore", "Peixe-jacaré", "Alligator Gar", "முதலை கார் மீன்", "Ikan Aligator", "鳄雀鳝", "鱷雀鱔", "アリゲーターガー", "앨리게이터가아"],
"Swamp Rabbit": ["Lapin des marais", "Sumpfkaninchen", "Conejo de pantano", "Coniglio di palude", "Coelho-do-pântano", "Kuneho ng Latian", "சதுப்பு முயல்", "Kelinci Rawa", "沼泽兔", "沼澤兔", "ヌマチウサギ", "늪토끼"],
"Mosquito Cloud": ["Nuée de moustiques", "Mückenwolke", "Nube de mosquitos", "Nuvola di zanzare", "Nuvem de mosquitos", "Ulap ng Lamok", "கொசு மேகம்", "Awan Nyamuk", "蚊群", "蚊群", "蚊柱", "모기 떼"],
"Fire Ant Raft": ["Radeau de fourmis de feu", "Feuerameisen-Floß", "Balsa de hormigas de fuego", "Zattera di formiche di fuoco", "Jangada de formigas-de-fogo", "Balsa ng mga Hantik", "நெருப்பு எறும்புத் தெப்பம்", "Rakit Semut Api", "火蚁筏", "火蟻筏", "ヒアリのいかだ", "불개미 뗏목"],
"Anhinga Spearbird": ["Anhinga harponneur", "Speervogel-Anhinga", "Anhinga lancera", "Anhinga lanciere", "Biguatinga-lanceiro", "Anhingang Sibat-ibon", "ஈட்டிப் பறவை அன்ஹிங்கா", "Burung Tombak Anhinga", "矛鸟蛇鹈", "矛鳥蛇鵜", "槍鳥アメリカヘビウ", "창잡이 뱀목가마우지"],
"Roseate Spoonbill": ["Spatule rosée", "Rosalöffler", "Espátula rosada", "Spatola rosata", "Colhereiro", "Kulay-rosas na Spoonbill", "இளஞ்சிவப்புக் கரண்டிவாயன்", "Paruh Sendok Merah Muda", "粉红琵鹭", "粉紅琵鷺", "ベニヘラサギ", "붉은저어새"],
# Map 6
"Booming Bittern": ["Butor tonnant", "Dröhnende Rohrdommel", "Avetoro retumbante", "Tarabuso tonante", "Abetouro trovejante", "Umuugong na Bittern", "முழங்கும் பெருங்குருகு", "Kuntul Bittern Menggelegar", "轰鸣大麻鳽", "轟鳴大麻鳽", "鳴り響くサンカノゴイ", "우렁찬 알락해오라기"],
"Giant Water Bug": ["Punaise d'eau géante", "Riesenwasserwanze", "Chinche de agua gigante", "Cimice d'acqua gigante", "Barata-d'água-gigante", "Higanteng Surot-tubig", "மாபெரும் நீர்ப் பூச்சி", "Kepinding Air Raksasa", "巨型田鳖", "巨型田鱉", "タガメ", "물장군"],
"Water Scorpion": ["Nèpe", "Wasserskorpion", "Escorpión de agua", "Scorpione d'acqua", "Escorpião-d'água", "Alakdang-tubig", "நீர்த் தேள்", "Kalajengking Air", "水蝎蝽", "水蠍蝽", "タイコウチ", "장구애비"],
"Greater Siren": ["Grande sirène", "Großer Armmolch", "Sirena mayor", "Sirena maggiore", "Sereia-maior", "Malaking Siren", "பெரிய சைரன்", "Siren Besar", "大鳗螈", "大鰻螈", "オオサイレン", "큰사이렌도롱뇽"],
"Marsh Harrier": ["Busard des roseaux", "Rohrweihe", "Aguilucho lagunero", "Falco di palude", "Águia-sapeira", "Lawin ng Latian", "சதுப்புப் பூனைப்பருந்து", "Elang Rawa", "白头鹞", "白頭鷂", "ヨーロッパチュウヒ", "개구리매"],
"Raft Spider": ["Dolomède", "Gerandete Jagdspinne", "Araña balsa", "Ragno zattera", "Aranha-jangada", "Gagambang Balsa", "தெப்பச் சிலந்தி", "Laba-laba Rakit", "狡蛛", "狡蛛", "ハシリグモ", "뗏목거미"],
# Map 7
"Leopard Slug": ["Limace léopard", "Tigerschnegel", "Babosa leopardo", "Limaccia leopardo", "Lesma-leopardo", "Leopardong Slug", "சிறுத்தை நத்தை", "Siput Bugil Macan Tutul", "豹纹蛞蝓", "豹紋蛞蝓", "マダラコウラナメクジ", "표범민달팽이"],
"Wolf Spider Mother": ["Mère araignée-loup", "Wolfsspinnen-Mutter", "Madre araña lobo", "Madre ragno lupo", "Mãe aranha-lobo", "Inang Gagambang-lobo", "ஓநாய்ச் சிலந்தித் தாய்", "Induk Laba-laba Serigala", "狼蛛之母", "狼蛛之母", "コモリグモの母", "늑대거미 어미"],
"Truffle Piglet": ["Porcelet truffier", "Trüffelferkel", "Lechón trufero", "Maialino da tartufo", "Leitão trufeiro", "Biik na Truffle", "டிரஃபிள் பன்றிக்குட்டி", "Anak Babi Truffle", "松露小猪", "松露小豬", "トリュフ子豚", "트러플 새끼돼지"],
"Fungus Gnat Cloud": ["Nuée de sciarides", "Trauermücken-Wolke", "Nube de mosquitos del hongo", "Nuvola di moscerini dei funghi", "Nuvem de mosquitos-dos-fungos", "Ulap ng Niknik ng Kabute", "காளான் கொசு மேகம்", "Awan Agas Jamur", "蕈蚊群", "蕈蚊群", "キノコバエの群れ", "버섯파리 떼"],
"Springtail Hopper": ["Collembole sauteur", "Springschwanz-Hüpfer", "Colémbolo saltarín", "Collembolo saltatore", "Colêmbolo saltador", "Lumulundag na Springtail", "துள்ளும் வால்தாவி", "Ekor Pegas Pelompat", "跳跳弹尾虫", "跳跳彈尾蟲", "跳ねるトビムシ", "톡토기 뜀꾼"],
"Red-backed Salamander": ["Salamandre à dos rayé", "Rotrücken-Salamander", "Salamandra de lomo rojo", "Salamandra dal dorso rosso", "Salamandra-de-dorso-vermelho", "Salamandrang Pula ang Likod", "சிவப்பு முதுகு சாலமாண்டர்", "Salamander Punggung Merah", "红背无肺螈", "紅背無肺螈", "セアカサラマンダー", "붉은등도롱뇽"],
# Map 8
"Cave Cricket": ["Grillon des cavernes", "Höhlenschrecke", "Grillo de las cavernas", "Grillo delle caverne", "Grilo-das-cavernas", "Kuliglig ng Kuweba", "குகைச் சில்வண்டு", "Jangkrik Gua", "穴螽", "穴螽", "カマドウマ", "꼽등이"],
"Ghost Crayfish": ["Écrevisse fantôme", "Geisterkrebs", "Cangrejo de río fantasma", "Gambero fantasma", "Lagostim-fantasma", "Multong Ulang", "பேய் நன்னீர் இறால்", "Udang Karang Hantu", "幽灵小龙虾", "幽靈小龍蝦", "幽霊ザリガニ", "유령가재"],
"Cave Swiftlet": ["Salangane des cavernes", "Höhlensalangane", "Salangana de las cuevas", "Salangana delle grotte", "Andorinhão-das-cavernas", "Balinsasayaw ng Kuweba", "குகை உழவாரன்", "Walet Gua", "洞穴金丝燕", "洞穴金絲燕", "洞窟のアナツバメ", "동굴 칼새"],
"Cave Pseudoscorpion": ["Pseudoscorpion des cavernes", "Höhlen-Pseudoskorpion", "Pseudoescorpión de cueva", "Pseudoscorpione di grotta", "Pseudoescorpião-das-cavernas", "Huwad-alakdan ng Kuweba", "குகைப் போலித் தேள்", "Kalajengking Semu Gua", "洞穴拟蝎", "洞穴擬蠍", "洞窟のカニムシ", "동굴 의갈"],
"Whip Spider": ["Amblypyge", "Geißelspinne", "Amblipígido", "Amblipigio", "Amblipígio", "Gagambang Latigo", "சாட்டைச் சிலந்தி", "Laba-laba Cambuk", "鞭蛛", "鞭蛛", "ウデムシ", "채찍거미"],
"Giant Cave Huntsman": ["Araignée chasseuse géante des cavernes", "Riesen-Höhlenjagdspinne", "Araña cazadora gigante de las cuevas", "Ragno cacciatore gigante delle grotte", "Aranha-caçadora-gigante das cavernas", "Higanteng Gagambang Mangangaso ng Kuweba", "குகையின் மாபெரும் வேட்டைச் சிலந்தி", "Laba-laba Pemburu Raksasa Gua", "洞穴巨型高脚蛛", "洞穴巨型高腳蛛", "巨大洞窟アシダカグモ", "거대 동굴 농발거미"],
"Guano Beetle": ["Scarabée du guano", "Guanokäfer", "Escarabajo del guano", "Coleottero del guano", "Besouro-do-guano", "Salagubang ng Guano", "வௌவால் எச்ச வண்டு", "Kumbang Guano", "蝠粪甲虫", "蝠糞甲蟲", "グアノの甲虫", "구아노 딱정벌레"],
# Map 9
"Banded Sea Krait": ["Tricot rayé", "Gebänderter Plattschwanz", "Serpiente marina anillada", "Serpente marino a bande", "Serpente-marinha-listrada", "May-guhit na Ahas-dagat", "வரிக் கடல் பாம்பு", "Ular Laut Belang", "蓝灰扁尾海蛇", "藍灰扁尾海蛇", "アオマダラウミヘビ", "넓은띠큰바다뱀"],
"Fishing Cat": ["Chat pêcheur", "Fischkatze", "Gato pescador", "Gatto pescatore", "Gato-pescador", "Pusang Mangingisda", "மீன்பிடிப் பூனை", "Kucing Bakau", "渔猫", "漁貓", "スナドリネコ", "고기잡이살쾡이"],
"Proboscis Monkey": ["Nasique", "Nasenaffe", "Mono narigudo", "Nasica", "Macaco-narigudo", "Unggoy na Mahaba ang Ilong", "நீள்மூக்குக் குரங்கு", "Bekantan", "长鼻猴", "長鼻猴", "テングザル", "코주부원숭이"],
"Horseshoe Crab": ["Limule", "Pfeilschwanzkrebs", "Cangrejo herradura", "Limulo", "Caranguejo-ferradura", "Dupang", "குதிரைலாட நண்டு", "Belangkas", "鲎", "鱟", "カブトガニ", "투구게"],
"Sea Hare": ["Lièvre de mer", "Seehase", "Liebre de mar", "Lepre di mare", "Lebre-do-mar", "Kuneho-dagat", "கடல் முயல்", "Kelinci Laut", "海兔", "海兔", "アメフラシ", "군소"],
"Mangrove Manatee": ["Lamantin des mangroves", "Mangroven-Seekuh", "Manatí del manglar", "Lamantino delle mangrovie", "Peixe-boi do mangue", "Manatee ng Bakawan", "சதுப்புநிலக் கடல்பசு", "Manatee Bakau", "红树林海牛", "紅樹林海牛", "マングローブのマナティー", "맹그로브 매너티"],
# Map 10
"Yellow-bellied Sea Snake": ["Serpent marin à ventre jaune", "Plättchen-Seeschlange", "Serpiente marina de vientre amarillo", "Serpente marino dal ventre giallo", "Serpente-marinha-de-barriga-amarela", "Ahas-dagat na Dilaw ang Tiyan", "மஞ்சள் வயிற்றுக் கடல் பாம்பு", "Ular Laut Perut Kuning", "长吻海蛇", "長吻海蛇", "セグロウミヘビ", "노랑배바다뱀"],
"Crown-of-thorns Star": ["Étoile couronne d'épines", "Dornenkronen-Seestern", "Estrella corona de espinas", "Stella corona di spine", "Estrela coroa-de-espinhos", "Bituing-dagat na Korona ng Tinik", "முள்முடி நட்சத்திர மீன்", "Bintang Laut Mahkota Duri", "棘冠海星", "棘冠海星", "オニヒトデ", "악마불가사리"],
"Parrotfish": ["Poisson-perroquet", "Papageifisch", "Pez loro", "Pesce pappagallo", "Peixe-papagaio", "Isdang Loro", "கிளி மீன்", "Ikan Kakatua", "鹦嘴鱼", "鸚嘴魚", "ブダイ", "비늘돔"],
"Lionfish": ["Poisson-lion", "Rotfeuerfisch", "Pez león", "Pesce leone", "Peixe-leão", "Isdang Leon", "சிங்க மீன்", "Ikan Lepu Ayam", "狮子鱼", "獅子魚", "ミノカサゴ", "쏠배감펭"],
"Giant Clam": ["Bénitier géant", "Riesenmuschel", "Almeja gigante", "Tridacna gigante", "Tridacna-gigante", "Taklobo", "மாபெரும் சிப்பி", "Kima Raksasa", "大砗磲", "大硨磲", "オオシャコガイ", "대왕조개"],
"Great Barracuda": ["Grand barracuda", "Großer Barrakuda", "Gran barracuda", "Grande barracuda", "Barracuda-grande", "Malaking Barakuda", "பெரும் சீலா மீன்", "Barakuda Besar", "大金梭鱼", "大金梭魚", "オニカマス", "큰꼬치고기"],
"Whale Shark": ["Requin-baleine", "Walhai", "Tiburón ballena", "Squalo balena", "Tubarão-baleia", "Butanding", "திமிங்கிலச் சுறா", "Hiu Paus", "鲸鲨", "鯨鯊", "ジンベエザメ", "고래상어"],
# Map 11
"Chamois Leaper": ["Chamois bondissant", "Springende Gämse", "Rebeco saltarín", "Camoscio saltatore", "Camurça saltadora", "Lumulundag na Chamois", "தாவும் சமோயிஸ்", "Chamois Pelompat", "跳跃岩羚", "跳躍岩羚", "跳ねるシャモア", "뛰어오르는 샤무아"],
"Alpine Swift": ["Martinet à ventre blanc", "Alpensegler", "Vencejo real", "Rondone maggiore", "Andorinhão-real", "Alpine na Layang-layang", "ஆல்ப்ஸ் உழவாரன்", "Walet Alpen", "高山雨燕", "高山雨燕", "シロハラアマツバメ", "알프스칼새"],
"Wallcreeper": ["Tichodrome échelette", "Mauerläufer", "Treparriscos", "Picchio muraiolo", "Trepadeira-dos-muros", "Ibong Umaakyat sa Pader", "சுவரேறிப் பறவை", "Pemanjat Tebing", "红翅旋壁雀", "紅翅旋壁雀", "カベバシリ", "바위타기새"],
"Alpine Salamander": ["Salamandre noire", "Alpensalamander", "Salamandra alpina", "Salamandra alpina", "Salamandra-alpina", "Alpine na Salamandra", "ஆல்ப்ஸ் சாலமாண்டர்", "Salamander Alpen", "高山蝾螈", "高山蠑螈", "アルプスサラマンダー", "알프스도롱뇽"],
"Apollo Butterfly": ["Apollon", "Apollofalter", "Apolo", "Apollo", "Borboleta-apolo", "Paruparong Apollo", "அப்போலோ வண்ணத்துப்பூச்சி", "Kupu-kupu Apollo", "阿波罗绢蝶", "阿波羅絹蝶", "アポロウスバシロチョウ", "아폴로모시나비"],
"Mountain Hare": ["Lièvre variable", "Schneehase", "Liebre de montaña", "Lepre variabile", "Lebre-da-montanha", "Liyebre ng Bundok", "மலை முயல்", "Terwelu Gunung", "雪兔", "雪兔", "ユキウサギ", "눈토끼"],
# Map 12
"Thorn Shrike": ["Pie-grièche des épines", "Dornwürger", "Alcaudón de las espinas", "Averla delle spine", "Picanço-dos-espinhos", "Shrike ng Tinik", "முள் கீச்சான்", "Bentet Duri", "荆棘伯劳", "荊棘伯勞", "茨のモズ", "가시때까치"],
"Hedge Weasel": ["Belette des haies", "Heckenwiesel", "Comadreja del seto", "Donnola delle siepi", "Doninha-das-sebes", "Weasel ng Bakod", "வேலி மரநாய்", "Musang Pagar", "树篱伶鼬", "樹籬伶鼬", "生け垣のイタチ", "산울타리 족제비"],
"Hawthorn Shieldbug": ["Punaise de l'aubépine", "Weißdorn-Stachelwanze", "Chinche del espino", "Cimice del biancospino", "Percevejo-do-espinheiro", "Surot-kalasag ng Hawthorn", "முட்செடிக் கேடய வண்டு", "Kepik Perisai Hawthorn", "山楂盾蝽", "山楂盾蝽", "サンザシのカメムシ", "산사나무 노린재"],
"Muntjac Barker": ["Muntjac aboyeur", "Bellender Muntjak", "Muntíaco ladrador", "Muntjac abbaiante", "Muntíaco ladrador", "Tumatahol na Muntjac", "குரைக்கும் கேளையாடு", "Kijang Penggonggong", "吠叫麂", "吠叫麂", "吠えるキョン", "짖는 문착"],
"Anvil Thrush": ["Grive à l'enclume", "Amboss-Drossel", "Zorzal del yunque", "Tordo dell'incudine", "Tordo-da-bigorna", "Thrush ng Palihan", "பட்டறைக்கல் பாடும்பறவை", "Murai Landasan", "砧石歌鸫", "砧石歌鶇", "金床のウタツグミ", "모루 노래지빠귀"],
"Garden Tiger Moth": ["Écaille martre", "Brauner Bär", "Mariposa tigre", "Falena tigre", "Mariposa-tigre", "Gamugamong Tigre", "தோட்டப் புலி அந்துப்பூச்சி", "Ngengat Harimau Taman", "豹灯蛾", "豹燈蛾", "ヒトリガ", "불나방"],
# Polar set
"Polar Bear": ["Ours polaire", "Eisbär", "Oso polar", "Orso polare", "Urso-polar", "Osong Polar", "பனிக் கரடி", "Beruang Kutub", "北极熊", "北極熊", "ホッキョクグマ", "북극곰"],
"Harp Seal Pup": ["Bébé phoque du Groenland", "Sattelrobben-Junges", "Cría de foca arpa", "Cucciolo di foca della Groenlandia", "Cria de foca-da-gronelândia", "Batang Harp Seal", "ஹார்ப் கடல்நாய்க் குட்டி", "Anak Anjing Laut Harpa", "竖琴海豹幼崽", "豎琴海豹幼崽", "タテゴトアザラシの赤ちゃん", "하프물범 새끼"],
"Beluga": ["Béluga", "Beluga", "Beluga", "Beluga", "Beluga", "Beluga", "பெலுகா திமிங்கிலம்", "Beluga", "白鲸", "白鯨", "シロイルカ", "벨루가"],
"Arctic Tern": ["Sterne arctique", "Küstenseeschwalbe", "Charrán ártico", "Sterna codalunga", "Andorinha-do-mar-ártica", "Tern ng Arktiko", "ஆர்க்டிக் ஆலா", "Dara Laut Arktik", "北极燕鸥", "北極燕鷗", "キョクアジサシ", "북극제비갈매기"],
"Greenland Shark": ["Requin du Groenland", "Grönlandhai", "Tiburón de Groenlandia", "Squalo della Groenlandia", "Tubarão-da-gronelândia", "Pating ng Greenland", "கிரீன்லாந்துச் சுறா", "Hiu Greenland", "格陵兰睡鲨", "格陵蘭睡鯊", "ニシオンデンザメ", "그린란드상어"],
"Lemming Swarm": ["Nuée de lemmings", "Lemmingschwarm", "Enjambre de lemmings", "Sciame di lemming", "Enxame de lemingues", "Kawan ng Lemming", "லெம்மிங் கூட்டம்", "Kawanan Lemming", "旅鼠群", "旅鼠群", "レミングの大群", "레밍 떼"],
"Woodland Caribou": ["Caribou des bois", "Waldkaribu", "Caribú de bosque", "Caribù dei boschi", "Caribu-da-floresta", "Caribou ng Gubat", "காட்டுக் கரிபு", "Karibu Hutan", "林地驯鹿", "林地馴鹿", "モリカリブー", "숲순록"],
"Krill Swarm": ["Essaim de krill", "Krillschwarm", "Enjambre de kril", "Sciame di krill", "Enxame de krill", "Kawan ng Krill", "கிரில் கூட்டம்", "Kawanan Krill", "磷虾群", "磷蝦群", "オキアミの群れ", "크릴 떼"],
"Musk Ox Calf": ["Veau de bœuf musqué", "Moschusochsen-Kalb", "Cría de buey almizclero", "Vitello di bue muschiato", "Cria de boi-almiscarado", "Guya ng Musk Ox", "கஸ்தூரி எருதுக் கன்று", "Anak Lembu Kesturi", "麝牛幼崽", "麝牛幼崽", "ジャコウウシの子", "사향소 송아지"],
}

FLAVOR = {
# Map 0
"Plop! Gone under the bank before the heron has even turned its head.": [
  "Plouf ! Disparu sous la berge avant que le héron ait tourné la tête.", "Plopp! Unter der Uferkante verschwunden, bevor der Reiher auch nur den Kopf dreht.",
  "¡Plop! Desaparece bajo la orilla antes de que la garza gire la cabeza.", "Plop! Sparita sotto la riva prima che l'airone giri la testa.",
  "Plop! Sumiu debaixo da margem antes de a garça virar a cabeça.", "Plop! Wala na sa ilalim ng pampang bago pa man lumingon ang tagak.",
  "ப்ளாப்! கொக்கு தலையைத் திருப்புவதற்குள் கரைக்கடியில் மறைந்துவிட்டது.", "Plup! Lenyap ke bawah tebing sebelum bangau sempat menoleh.",
  "扑通！苍鹭还没回头，它就已钻进岸下不见了。", "撲通！蒼鷺還沒回頭，牠就已鑽進岸下不見了。", "ポチャン！サギが振り向く前に、もう土手の下へ消えている。", "퐁당! 왜가리가 고개를 돌리기도 전에 둑 밑으로 사라졌다."],
"Swims like an otter, bites like a stoat, and answers to neither.": [
  "Nage comme une loutre, mord comme une hermine, et n'obéit à aucune.", "Schwimmt wie ein Otter, beißt wie ein Hermelin und hört auf keinen von beiden.",
  "Nada como una nutria, muerde como un armiño y no obedece a ninguno.", "Nuota come una lontra, morde come un ermellino e non risponde a nessuno dei due.",
  "Nada como uma lontra, morde como um arminho e não obedece a nenhum.", "Lumalangoy na parang otter, nangangagat na parang stoat, at walang sinusunod sa dalawa.",
  "நீர்நாய் போல நீந்தும், கீரி போலக் கடிக்கும், இரண்டுக்கும் அடங்காது.", "Berenang seperti berang-berang, menggigit seperti cerpelai, dan tak tunduk pada keduanya.",
  "游起来像水獭，咬起来像白鼬，却谁也不服。", "游起來像水獺，咬起來像白鼬，卻誰也不服。", "カワウソのように泳ぎ、オコジョのように噛み、どちらにも従わない。", "수달처럼 헤엄치고 족제비처럼 물지만, 누구의 말도 듣지 않는다."],
"It waves its white-flagged claws at everything, which is not the same as surrendering.": [
  "Il agite ses pinces à drapeau blanc devant tout le monde, ce qui ne veut pas dire qu'il se rend.", "Es schwenkt seine weiß beflaggten Scheren vor allem und jedem, was nicht dasselbe ist wie Aufgeben.",
  "Agita sus pinzas de bandera blanca ante todo, que no es lo mismo que rendirse.", "Sventola le sue chele dalla bandiera bianca a chiunque, il che non significa arrendersi.",
  "Agita as pinças de bandeira branca para tudo, o que não é o mesmo que render-se.", "Iwinawagayway nito ang mga sipit na may puting bandila sa lahat, pero hindi iyon pagsuko.",
  "வெள்ளைக் கொடி இடுக்கிகளை எல்லாவற்றின் முன்னும் ஆட்டும்; ஆனால் அது சரணடைவது அல்ல.", "Ia mengibaskan capit berbendera putihnya ke segala hal, tapi itu bukan berarti menyerah.",
  "它对谁都挥舞那对带白旗的螯，可这并不等于投降。", "牠對誰都揮舞那對帶白旗的螯，可這並不等於投降。", "白旗つきのハサミを何にでも振りかざすが、降参しているわけではない。", "흰 깃발 달린 집게를 무엇에게나 흔들지만, 항복한다는 뜻은 아니다."],
"Down the trunk headfirst, and the squirrel never hears it coming.": [
  "Tête la première le long du tronc, et l'écureuil ne l'entend jamais venir.", "Kopfüber den Stamm hinab, und das Eichhörnchen hört es nie kommen.",
  "Tronco abajo de cabeza, y la ardilla nunca la oye llegar.", "Giù per il tronco a testa in giù, e lo scoiattolo non la sente mai arrivare.",
  "Tronco abaixo de cabeça, e o esquilo nunca a ouve chegar.", "Pababa sa puno nang nauuna ang ulo, at hindi ito naririnig ng ardilya.",
  "தலைகீழாக மரத்தண்டில் இறங்கும்; அணில் அதன் வருகையைக் கேட்பதே இல்லை.", "Turun batang pohon dengan kepala lebih dulu, dan tupai tak pernah mendengarnya datang.",
  "它头朝下顺树干溜下，松鼠从来听不见它来。", "牠頭朝下順樹幹溜下，松鼠從來聽不見牠來。", "頭から幹を駆け下りる。リスはその気配に気づかない。", "머리부터 나무줄기를 타고 내려오니, 다람쥐는 다가오는 소리를 듣지 못한다."],
"Eyes on the sides of its head, and out only at dusk, when the light lies.": [
  "Des yeux sur les côtés de la tête, et dehors seulement au crépuscule, quand la lumière ment.", "Augen an den Seiten des Kopfes, und nur in der Dämmerung unterwegs, wenn das Licht lügt.",
  "Ojos a los lados de la cabeza, y solo sale al anochecer, cuando la luz engaña.", "Occhi ai lati della testa, ed esce solo al crepuscolo, quando la luce inganna.",
  "Olhos dos lados da cabeça, e só sai ao entardecer, quando a luz engana.", "Nasa gilid ng ulo ang mga mata, at lumalabas lang sa takipsilim, kapag nanlilinlang ang liwanag.",
  "தலையின் இருபுறமும் கண்கள்; ஒளி ஏமாற்றும் அந்தி வேளையில் மட்டுமே வெளியே வரும்.", "Matanya di sisi kepala, dan hanya keluar saat senja, ketika cahaya menipu.",
  "眼睛长在头两侧，只在光线骗人的黄昏出来。", "眼睛長在頭兩側，只在光線騙人的黃昏出來。", "目は頭の横にあり、光が嘘をつく夕暮れにだけ現れる。", "눈은 머리 양옆에 있고, 빛이 속이는 해질녘에만 나온다."],
"Corner it and it rolls over, tongue out, and plays dead. Very convincingly.": [
  "Acculée, elle se retourne, langue pendante, et fait la morte. De façon très convaincante.", "In die Enge getrieben, dreht sie sich auf den Rücken, Zunge heraus, und stellt sich tot. Sehr überzeugend.",
  "Si la acorralas, se pone panza arriba, saca la lengua y se hace la muerta. Muy convincente.", "Messa alle strette, si rovescia, lingua fuori, e si finge morta. In modo molto convincente.",
  "Encurralada, vira-se de barriga para cima, língua de fora, e finge-se morta. Muito convincente.", "Kapag nasukol, tumitihaya, nakalabas ang dila, at nagkukunwaring patay. Kapani-paniwala talaga.",
  "மடக்கினால், நாக்கை நீட்டிப் புரண்டு, இறந்தது போல நடிக்கும். மிக நம்பும்படி.", "Kalau terpojok, ia telentang, menjulurkan lidah, dan pura-pura mati. Sangat meyakinkan.",
  "把它逼到角落，它就翻过身、吐出舌头装死。装得非常像。", "把牠逼到角落，牠就翻過身、吐出舌頭裝死。裝得非常像。", "追い詰めると、ひっくり返って舌を出し、死んだふりをする。実に迫真だ。", "몰아붙이면 혀를 내밀고 뒤집어져 죽은 척한다. 아주 그럴듯하게."],
# Map 1
"Seven spots, one bad taste, and a promise that you will only bite once.": [
  "Sept points, un mauvais goût, et la promesse que vous ne mordrez qu'une fois.", "Sieben Punkte, ein übler Geschmack und das Versprechen, dass du nur einmal zubeißt.",
  "Siete puntos, un mal sabor y la promesa de que solo morderás una vez.", "Sette puntini, un pessimo sapore e la promessa che morderai una volta sola.",
  "Sete pintas, um mau sabor e a promessa de que só vais morder uma vez.", "Pitong batik, isang pangit na lasa, at pangakong isang beses ka lang kakagat.",
  "ஏழு புள்ளிகள், ஒரு கசப்பு, ஒரே ஒரு முறைதான் கடிப்பீர்கள் என்ற உறுதி.", "Tujuh bintik, satu rasa tak enak, dan janji bahwa kau hanya akan menggigit sekali.",
  "七个斑点，一股怪味，外加一个保证：你只会咬一次。", "七個斑點，一股怪味，外加一個保證：你只會咬一次。", "七つの斑点とまずい味。かじるのは一度きりだと約束しよう。", "일곱 개의 점, 고약한 맛, 그리고 딱 한 번만 깨물게 될 거라는 약속."],
"It must eat every few hours or starve, so it is always, always in a hurry.": [
  "Elle doit manger toutes les quelques heures ou mourir de faim, alors elle est toujours, toujours pressée.", "Sie muss alle paar Stunden fressen oder verhungern, also hat sie es immer, immer eilig.",
  "Debe comer cada pocas horas o morir de hambre, así que siempre, siempre tiene prisa.", "Deve mangiare ogni poche ore o morire di fame, quindi ha sempre, sempre fretta.",
  "Tem de comer de poucas em poucas horas ou morre de fome, por isso anda sempre, sempre com pressa.", "Kailangan nitong kumain bawat ilang oras o mamamatay sa gutom, kaya lagi, laging nagmamadali.",
  "சில மணிநேரத்துக்கு ஒருமுறை உண்ணாவிட்டால் பட்டினியால் சாகும்; அதனால் எப்போதும் அவசரம்தான்.", "Ia harus makan setiap beberapa jam atau mati kelaparan, jadi ia selalu, selalu terburu-buru.",
  "它每隔几小时就得吃东西，否则就会饿死，所以总是、总是急匆匆的。", "牠每隔幾小時就得吃東西，否則就會餓死，所以總是、總是急匆匆的。", "数時間ごとに食べないと飢え死にする。だからいつも、いつも急いでいる。", "몇 시간마다 먹지 않으면 굶어 죽으니, 늘, 늘 서두른다."],
"All that jaw is for wrestling rivals. Your little units will do.": [
  "Toutes ces mandibules servent à lutter contre ses rivaux. Vos petites unités feront l'affaire.", "All die Kiefer sind zum Ringen mit Rivalen da. Deine kleinen Einheiten tun es auch.",
  "Toda esa mandíbula es para luchar con rivales. Tus pequeñas unidades servirán.", "Tutte quelle mandibole servono a lottare con i rivali. Le tue piccole unità andranno bene.",
  "Toda essa mandíbula é para lutar com rivais. As tuas pequenas unidades servem.", "Ang lahat ng pangang iyon ay para makipagbuno sa karibal. Puwede na rin ang maliliit mong yunit.",
  "அந்தப் பெரிய தாடைகள் போட்டியாளர்களுடன் மல்லுக்கட்டவே. உங்கள் சிறிய படைகளும் போதும்.", "Rahang sebesar itu untuk bergulat dengan saingan. Unit kecilmu pun boleh juga.",
  "这么大的颚是用来跟对手角力的。你的小部队也凑合。", "這麼大的顎是用來跟對手角力的。你的小部隊也湊合。", "あの大顎はライバルと組み合うためのもの。君の小さな兵でも構わない。", "그 큰 턱은 경쟁자와 씨름하라고 있는 것. 네 작은 유닛들도 상관없다."],
"Not a worm, not slow, and not finished just because you grabbed its tail.": [
  "Pas un ver, pas lent, et pas fini simplement parce que vous avez attrapé sa queue.", "Kein Wurm, nicht langsam und nicht erledigt, nur weil du ihren Schwanz gepackt hast.",
  "Ni gusano, ni lento, ni acabado solo porque le hayas agarrado la cola.", "Né verme, né lento, e non finito solo perché gli hai afferrato la coda.",
  "Nem verme, nem lento, nem acabado só porque lhe agarraste a cauda.", "Hindi uod, hindi mabagal, at hindi pa tapos dahil lang nahawakan mo ang buntot nito.",
  "புழுவும் அல்ல, மெதுவும் அல்ல; வாலைப் பிடித்துவிட்டதால் முடிந்துவிடவும் இல்லை.", "Bukan cacing, tidak lambat, dan belum tamat hanya karena kau menangkap ekornya.",
  "不是虫，也不慢，你抓住它的尾巴也不代表它完了。", "不是蟲，也不慢，你抓住牠的尾巴也不代表牠完了。", "ミミズでもなく、のろくもない。尻尾をつかんだくらいで終わりはしない。", "벌레도 아니고 느리지도 않으며, 꼬리를 잡았다고 끝난 것도 아니다."],
"The friendliest bird in the garden, until another robin lands on its patch.": [
  "L'oiseau le plus aimable du jardin, jusqu'à ce qu'un autre rouge-gorge se pose sur son territoire.", "Der freundlichste Vogel im Garten, bis ein anderes Rotkehlchen in seinem Revier landet.",
  "El pájaro más amable del jardín, hasta que otro petirrojo se posa en su terreno.", "L'uccello più gentile del giardino, finché un altro pettirosso non si posa sul suo territorio.",
  "A ave mais simpática do jardim, até outro pisco aterrar no seu território.", "Ang pinakamagiliw na ibon sa hardin, hanggang may ibang robin na dumapo sa teritoryo nito.",
  "தோட்டத்தின் மிக நட்பான பறவை, இன்னொரு ராபின் அதன் இடத்தில் வந்து அமரும் வரை.", "Burung paling ramah di kebun, sampai robin lain mendarat di wilayahnya.",
  "花园里最友善的鸟，直到另一只知更鸟落在它的地盘上。", "花園裡最友善的鳥，直到另一隻知更鳥落在牠的地盤上。", "庭でいちばん人懐っこい鳥。別のコマドリが縄張りに降りるまでは。", "정원에서 가장 다정한 새. 다른 울새가 제 구역에 내려앉기 전까지는."],
"There is never just one field vole. By autumn there are hundreds.": [
  "Il n'y a jamais un seul campagnol. À l'automne, ils sont des centaines.", "Es gibt nie nur eine Erdmaus. Im Herbst sind es Hunderte.",
  "Nunca hay un solo topillo. Para el otoño hay cientos.", "Non c'è mai una sola arvicola. In autunno sono centinaia.",
  "Nunca há só um rato-do-campo. No outono há centenas.", "Hindi kailanman iisa ang daga sa parang. Pagdating ng taglagas, daan-daan na sila.",
  "வயல் எலி ஒன்றாக மட்டும் இருப்பதே இல்லை. இலையுதிர்காலத்தில் நூற்றுக்கணக்கில் இருக்கும்.", "Tikus ladang tak pernah cuma satu. Menjelang musim gugur jumlahnya ratusan.",
  "田鼠从来不会只有一只。到了秋天就有成百上千只。", "田鼠從來不會只有一隻。到了秋天就有成百上千隻。", "ハタネズミが一匹だけということはない。秋には何百匹にもなる。", "들밭쥐는 절대 한 마리가 아니다. 가을이면 수백 마리가 된다."],
# Map 2
"The rock pool's pin cushion. Step on it once and you will always know where it lives.": [
  "La pelote à épingles de la flaque. Marchez dessus une fois et vous saurez toujours où il habite.", "Das Nadelkissen des Gezeitentümpels. Tritt einmal drauf, und du weißt für immer, wo er wohnt.",
  "El acerico de la charca. Písalo una vez y siempre sabrás dónde vive.", "Il puntaspilli della pozza. Calpestalo una volta e saprai sempre dove abita.",
  "A almofada de alfinetes da poça. Pisa-o uma vez e saberás sempre onde mora.", "Ang unan-karayom ng batuhan. Matapakan mo ito minsan at lagi mong malalaman kung saan ito nakatira.",
  "பாறைக்குளத்தின் ஊசிப்பஞ்சு. ஒருமுறை மிதித்தால், அது எங்கே வாழ்கிறது என்று என்றும் மறக்க மாட்டீர்கள்.", "Bantalan jarum kolam batu. Injak sekali, dan kau akan selalu ingat di mana ia tinggal.",
  "礁池里的针垫。踩上一次，你就永远记得它住在哪儿。", "礁池裡的針墊。踩上一次，你就永遠記得牠住在哪兒。", "潮だまりの針山。一度踏めば、どこに住んでいるか一生忘れない。", "조수 웅덩이의 바늘방석. 한 번 밟으면 그 녀석이 어디 사는지 평생 잊지 못한다."],
"Pull off an arm and it simply grows another. It has five to spare.": [
  "Arrachez-lui un bras et il en repousse un autre. Il en a cinq en réserve.", "Reiß ihm einen Arm ab, und er wächst einfach nach. Er hat fünf übrig.",
  "Arráncale un brazo y le crece otro. Tiene cinco de sobra.", "Strappale un braccio e ne ricresce un altro. Ne ha cinque di scorta.",
  "Arranca-lhe um braço e cresce outro. Tem cinco de sobra.", "Bunutin ang isang braso nito at tutubo lang ang bago. May lima itong ekstra.",
  "ஒரு கையைப் பிடுங்கினால், இன்னொன்று வளர்ந்துவிடும். அதற்கு ஐந்து கைகள் உண்டு.", "Cabut satu lengannya dan ia tinggal menumbuhkan lagi. Ia punya lima cadangan.",
  "扯掉一条腕，它就再长一条。它有五条可以挥霍。", "扯掉一條腕，牠就再長一條。牠有五條可以揮霍。", "腕を一本もいでも、また生えてくる。五本も余裕がある。", "팔 하나를 떼어 내도 그냥 새로 자란다. 여분이 다섯 개나 있다."],
"A bill like an orange chisel, made for opening what wants to stay shut.": [
  "Un bec comme un ciseau orange, fait pour ouvrir ce qui veut rester fermé.", "Ein Schnabel wie ein oranger Meißel, gemacht, um zu öffnen, was zu bleiben will.",
  "Un pico como un cincel naranja, hecho para abrir lo que quiere seguir cerrado.", "Un becco come uno scalpello arancione, fatto per aprire ciò che vuole restare chiuso.",
  "Um bico como um cinzel laranja, feito para abrir o que quer ficar fechado.", "Tukang parang kulay-kahel na pait, ginawa para buksan ang ayaw mabuksan.",
  "ஆரஞ்சு உளி போன்ற அலகு, மூடியே இருக்க விரும்புவதைத் திறக்கவே செய்யப்பட்டது.", "Paruh seperti pahat jingga, dibuat untuk membuka yang ingin tetap tertutup.",
  "一张像橙色凿子的嘴，专门撬开那些想紧闭的东西。", "一張像橙色鑿子的嘴，專門撬開那些想緊閉的東西。", "オレンジ色のノミのような嘴。閉じていたいものをこじ開けるためのもの。", "주황색 끌 같은 부리. 닫혀 있고 싶은 것을 여는 데 쓰인다."],
"Chases the wave out, flees it back in, all day long, on clockwork legs.": [
  "Poursuit la vague qui recule, la fuit quand elle revient, toute la journée, sur des pattes mécaniques.", "Jagt der Welle hinterher, flieht vor ihr zurück, den ganzen Tag, auf Uhrwerkbeinen.",
  "Persigue la ola al retirarse, huye de ella al volver, todo el día, con patas de reloj.", "Insegue l'onda che si ritira, la fugge quando torna, tutto il giorno, su zampe a molla.",
  "Persegue a onda que recua, foge dela quando volta, o dia todo, em pernas de relógio.", "Hinahabol ang alon palabas, tinatakbuhan pabalik, buong araw, sa mga paang parang relo.",
  "அலை பின்வாங்கும்போது துரத்தும், திரும்பும்போது ஓடும், நாள் முழுதும், கடிகாரக் கால்களில்.", "Mengejar ombak saat surut, lari saat datang, sepanjang hari, dengan kaki bagai jarum jam.",
  "浪退它就追，浪来它就逃，一整天，迈着发条般的小腿。", "浪退牠就追，浪來牠就逃，一整天，邁著發條般的小腿。", "引く波を追い、寄せる波から逃げる。一日中、ぜんまい仕掛けの脚で。", "밀려가는 파도를 쫓고, 밀려오면 달아난다. 하루 종일 태엽 같은 다리로."],
"Hauls out on the shingle every autumn and lets nothing near his pups.": [
  "Il se hisse sur les galets chaque automne et ne laisse rien approcher de ses petits.", "Robbt jeden Herbst auf den Kies und lässt nichts in die Nähe seiner Jungen.",
  "Sube a los guijarros cada otoño y no deja que nada se acerque a sus crías.", "Ogni autunno si issa sui ciottoli e non lascia avvicinare niente ai suoi piccoli.",
  "Sobe para os seixos todos os outonos e não deixa nada aproximar-se das crias.", "Umaahon sa batuhan tuwing taglagas at walang pinalalapit sa kanyang mga anak.",
  "ஒவ்வொரு இலையுதிர்காலமும் கூழாங்கல் கரையில் ஏறி, தன் குட்டிகளருகே எதையும் விடாது.", "Naik ke pantai kerikil tiap musim gugur dan tak membiarkan apa pun mendekati anak-anaknya.",
  "每年秋天它都爬上卵石滩，不让任何东西靠近它的幼崽。", "每年秋天牠都爬上卵石灘，不讓任何東西靠近牠的幼崽。", "毎年秋に小石の浜へ上がり、子どもに何ひとつ近づけさせない。", "가을마다 자갈 해변에 올라와 새끼 곁에 아무것도 오지 못하게 한다."],
"When the tide goes out it clamps down. Nothing short of a chisel shifts it.": [
  "Quand la marée descend, elle se cramponne. Seul un ciseau peut la déloger.", "Wenn die Flut geht, saugt sie sich fest. Nur ein Meißel bringt sie weg.",
  "Cuando baja la marea, se aferra. Solo un cincel la mueve.", "Quando la marea si ritira, si stringe alla roccia. Solo uno scalpello la smuove.",
  "Quando a maré desce, agarra-se. Só um cinzel a tira dali.", "Kapag kumati ang tubig, kumakapit ito. Pait lang ang makakapag-alis dito.",
  "அலை இறங்கும்போது இறுகப் பற்றிக்கொள்ளும். உளி இல்லாமல் அதை அசைக்க முடியாது.", "Saat air surut, ia mencengkeram erat. Hanya pahat yang bisa melepasnya.",
  "退潮时它就死死吸住。除了凿子，什么都撬不动它。", "退潮時牠就死死吸住。除了鑿子，什麼都撬不動牠。", "潮が引くと岩に張りつく。ノミでもなければ動かせない。", "물이 빠지면 바위에 딱 붙는다. 끌이 아니면 떼어 낼 수 없다."],
# Map 3
"Ten sand eels in its beak, and always room for one more.": [
  "Dix lançons dans le bec, et toujours de la place pour un de plus.", "Zehn Sandaale im Schnabel, und immer Platz für einen mehr.",
  "Diez lanzones en el pico, y siempre cabe uno más.", "Dieci cicerelli nel becco, e sempre posto per un altro.",
  "Dez galeotas no bico, e sempre espaço para mais uma.", "Sampung sand eel sa tuka, at laging may puwang pa para sa isa.",
  "அலகில் பத்து மணல் விலாங்குகள், இன்னொன்றுக்கு எப்போதும் இடம் உண்டு.", "Sepuluh ikan sidat pasir di paruhnya, dan selalu ada tempat untuk satu lagi.",
  "嘴里叼着十条玉筋鱼，总还能再塞一条。", "嘴裡叼著十條玉筋魚，總還能再塞一條。", "くちばしにイカナゴが十匹。あと一匹はいつでも入る。", "부리에 까나리 열 마리, 그래도 한 마리 더 들어갈 자리는 늘 있다."],
"Its name is a warning about the bill, not the beard.": [
  "Son nom est un avertissement sur le bec, pas sur la barbe.", "Sein Name ist eine Warnung vor dem Schnabel, nicht vor dem Bart.",
  "Su nombre es una advertencia sobre el pico, no sobre la barba.", "Il suo nome è un avvertimento sul becco, non sulla barba.",
  "O seu nome é um aviso sobre o bico, não sobre a barba.", "Babala ang pangalan nito tungkol sa tuka, hindi sa balbas.",
  "அதன் பெயர் அலகைப் பற்றிய எச்சரிக்கை, தாடியைப் பற்றியது அல்ல.", "Namanya adalah peringatan soal paruh, bukan soal jenggot.",
  "它的名字警告的是那张嘴，不是胡子。", "牠的名字警告的是那張嘴，不是鬍子。", "その名は嘴への警告であって、ひげのことではない。", "그 이름은 수염이 아니라 부리에 대한 경고다."],
"Kitti-waaake! A thousand ledges, a thousand nests, one deafening chorus.": [
  "Kitti-waaake ! Mille corniches, mille nids, un seul chœur assourdissant.", "Kitti-waaake! Tausend Simse, tausend Nester, ein ohrenbetäubender Chor.",
  "¡Kitti-waaake! Mil cornisas, mil nidos, un solo coro ensordecedor.", "Kitti-waaake! Mille cenge, mille nidi, un solo coro assordante.",
  "Kitti-waaake! Mil saliências, mil ninhos, um coro ensurdecedor.", "Kitti-waaake! Isang libong gilid, isang libong pugad, isang nakabibinging koro.",
  "கிட்டி-வேஏக்! ஆயிரம் விளிம்புகள், ஆயிரம் கூடுகள், ஒரே காதைப் பிளக்கும் கோரஸ்.", "Kitti-waaake! Seribu tebing, seribu sarang, satu paduan suara yang memekakkan.",
  "Kitti-waaake！一千道岩架，一千个巢，一曲震耳欲聋的大合唱。", "Kitti-waaake！一千道岩架，一千個巢，一曲震耳欲聾的大合唱。", "キティウェェイク！千の岩棚、千の巣、耳をつんざく大合唱。", "키티웨이크! 천 개의 바위 턱, 천 개의 둥지, 귀청 떨어지는 합창 하나."],
"The fastest thing alive, falling on purpose.": [
  "L'être vivant le plus rapide, qui tombe exprès.", "Das schnellste Lebewesen der Welt, absichtlich im Fall.",
  "El ser vivo más rápido, cayendo a propósito.", "L'essere vivente più veloce, che cade apposta.",
  "O ser vivo mais rápido, a cair de propósito.", "Ang pinakamabilis na buhay na nilalang, sinasadyang bumulusok.",
  "உயிருள்ளவற்றில் மிக வேகமானது, வேண்டுமென்றே விழுகிறது.", "Makhluk hidup tercepat, jatuh dengan sengaja.",
  "世上最快的活物，故意往下坠。", "世上最快的活物，故意往下墜。", "地上最速の生き物が、わざと落ちてくる。", "살아 있는 것 중 가장 빠른 존재가 일부러 떨어진다."],
"Get too close to its nest and it spits stinking oil all over your feathers.": [
  "Approchez trop de son nid et il vous crache une huile puante sur les plumes.", "Komm seinem Nest zu nahe, und es spuckt dir stinkendes Öl ins Gefieder.",
  "Acércate demasiado a su nido y te escupe aceite apestoso en las plumas.", "Avvicinati troppo al suo nido e ti sputa olio puzzolente sulle piume.",
  "Chega-te demasiado ao ninho e cospe-te óleo malcheiroso nas penas.", "Lumapit ka nang husto sa pugad nito at duduraan ka ng mabahong langis sa balahibo.",
  "அதன் கூட்டின் அருகே போனால், நாற்றமெடுக்கும் எண்ணெயை உங்கள் இறகுகள் மீது துப்பும்.", "Terlalu dekat ke sarangnya, dan ia meludahkan minyak busuk ke seluruh bulumu.",
  "离它的巢太近，它就把臭油喷你一身羽毛。", "離牠的巢太近，牠就把臭油噴你一身羽毛。", "巣に近づきすぎると、臭い油を羽じゅうに吐きかけてくる。", "둥지에 너무 다가가면 고약한 기름을 깃털에 온통 뱉어 댄다."],
"A crow in red stockings, tumbling off the cliff for the fun of it.": [
  "Un corbeau en bas rouges, qui dégringole de la falaise pour le plaisir.", "Eine Krähe in roten Strümpfen, die zum Spaß von der Klippe purzelt.",
  "Un cuervo con medias rojas, que se tira del acantilado por diversión.", "Un corvo con le calze rosse, che ruzzola giù dalla scogliera per divertimento.",
  "Um corvo de meias vermelhas, a cair da falésia por diversão.", "Uwak na nakapulang medyas, nagpapagulong mula sa bangin para lang maglaro.",
  "சிவப்புக் காலுறை அணிந்த காகம், வேடிக்கைக்காகக் குன்றிலிருந்து உருள்கிறது.", "Gagak berkaus kaki merah, berjungkir dari tebing sekadar untuk bersenang-senang.",
  "穿着红袜子的乌鸦，从悬崖上翻滚而下，只为好玩。", "穿著紅襪子的烏鴉，從懸崖上翻滾而下，只為好玩。", "赤い靴下のカラス。面白半分に崖から転がり落ちる。", "빨간 스타킹을 신은 까마귀, 재미로 절벽에서 굴러떨어진다."],
# Map 4
"Its reed lodge rises from the flood like a haystack with its front door underwater.": [
  "Sa hutte de roseaux sort de la crue comme une meule de foin dont la porte serait sous l'eau.", "Seine Schilfburg ragt aus der Flut wie ein Heuhaufen, dessen Haustür unter Wasser liegt.",
  "Su cabaña de juncos surge de la crecida como un pajar con la puerta bajo el agua.", "La sua capanna di canne spunta dalla piena come un pagliaio con la porta sott'acqua.",
  "A sua cabana de juncos ergue-se da cheia como um palheiro com a porta debaixo de água.", "Umaangat ang kubo nitong tambo mula sa baha na parang dayami na nasa ilalim ng tubig ang pinto.",
  "அதன் நாணல் குடில் வெள்ளத்திலிருந்து வைக்கோல் போர் போல எழும்; வாசல் மட்டும் நீருக்கடியில்.", "Pondok buluhnya menyembul dari banjir seperti tumpukan jerami dengan pintu depan di bawah air.",
  "它的芦苇窝从洪水里冒出来，像个干草堆，前门却在水下。", "牠的蘆葦窩從洪水裡冒出來，像個乾草堆，前門卻在水下。", "葦の巣は洪水から干し草の山のように突き出し、玄関は水の中にある。", "갈대 오두막이 홍수 위로 건초더미처럼 솟아 있고, 현관문은 물속에 있다."],
"Silver with bubbles as it dives, and its bite carries venom.": [
  "Argentée de bulles quand elle plonge, et sa morsure est venimeuse.", "Silbern vor Bläschen, wenn sie taucht, und ihr Biss ist giftig.",
  "Plateada de burbujas al sumergirse, y su mordisco lleva veneno.", "Argentata di bollicine quando si tuffa, e il suo morso è velenoso.",
  "Prateado de bolhas quando mergulha, e a sua mordida traz veneno.", "Pilak sa mga bula habang sumisisid, at may lason ang kagat nito.",
  "மூழ்கும்போது குமிழ்களால் வெள்ளியாய் மின்னும்; அதன் கடியில் நஞ்சு உண்டு.", "Keperakan oleh gelembung saat menyelam, dan gigitannya berbisa.",
  "潜水时满身气泡闪着银光，咬一口还带毒。", "潛水時滿身氣泡閃著銀光，咬一口還帶毒。", "潜ると泡で銀色に光り、その噛みつきには毒がある。", "잠수하면 거품으로 은빛이 되고, 그 이빨에는 독이 있다."],
"A trunked, near-blind swimmer that finds its supper by the touch of its whiskers.": [
  "Un nageur à trompe, presque aveugle, qui trouve son dîner du bout des moustaches.", "Ein fast blinder Schwimmer mit Rüssel, der sein Abendessen mit den Schnurrhaaren ertastet.",
  "Un nadador con trompa, casi ciego, que encuentra la cena con el tacto de sus bigotes.", "Un nuotatore con la proboscide, quasi cieco, che trova la cena al tocco dei baffi.",
  "Um nadador de tromba, quase cego, que encontra o jantar ao toque dos bigodes.", "Isang halos-bulag na manlalangoy na may nguso, na nahahanap ang hapunan sa haplos ng balbas.",
  "தும்பிக்கை கொண்ட, கிட்டத்தட்டக் குருடான நீச்சல்காரன்; மீசையின் தொடுதலால் இரவுணவைக் கண்டுபிடிக்கும்.", "Perenang berbelalai yang hampir buta, menemukan makan malam dengan sentuhan kumisnya.",
  "长着长鼻、几乎全盲的游泳者，靠胡须一碰就找到晚餐。", "長著長鼻、幾乎全盲的游泳者，靠鬍鬚一碰就找到晚餐。", "鼻の長い、ほとんど目の見えない泳ぎ手。ひげで触れて夕食を見つける。", "코가 길고 거의 앞을 못 보는 헤엄꾼, 수염의 감촉으로 저녁거리를 찾는다."],
"When trouble comes it does not fly. It sinks, and surfaces somewhere else.": [
  "Quand le danger arrive, il ne s'envole pas. Il coule, et refait surface ailleurs.", "Wenn Ärger kommt, fliegt er nicht. Er sinkt und taucht woanders wieder auf.",
  "Cuando hay peligro no vuela. Se hunde y sale a flote en otro sitio.", "Quando arriva il pericolo non vola. Si immerge e riaffiora altrove.",
  "Quando há perigo não voa. Afunda-se e volta à tona noutro sítio.", "Kapag may panganib, hindi ito lumilipad. Lumulubog ito, at lumilitaw sa ibang lugar.",
  "ஆபத்து வந்தால் அது பறப்பதில்லை. மூழ்கி, வேறொரு இடத்தில் மேலே வரும்.", "Saat bahaya datang, ia tidak terbang. Ia tenggelam, lalu muncul di tempat lain.",
  "遇到麻烦时它不飞走。它沉下去，再从别处冒出来。", "遇到麻煩時牠不飛走。牠沉下去，再從別處冒出來。", "危険が来ても飛び立たない。沈んで、別の場所に浮かび上がる。", "위험이 닥쳐도 날지 않는다. 가라앉았다가 다른 곳에서 떠오른다."],
"Older than the castle, armoured like a knight, and in no hurry at all.": [
  "Plus vieux que le château, cuirassé comme un chevalier, et pas pressé du tout.", "Älter als die Burg, gepanzert wie ein Ritter und überhaupt nicht in Eile.",
  "Más viejo que el castillo, acorazado como un caballero y sin ninguna prisa.", "Più vecchio del castello, corazzato come un cavaliere e per niente di fretta.",
  "Mais velho do que o castelo, couraçado como um cavaleiro e sem pressa nenhuma.", "Mas matanda pa sa kastilyo, nakabaluti na parang kabalyero, at hindi nagmamadali.",
  "கோட்டையை விட வயதானது, வீரனைப் போலக் கவசம் அணிந்தது, அவசரமே இல்லாதது.", "Lebih tua dari kastil, berzirah seperti ksatria, dan sama sekali tak terburu-buru.",
  "比城堡还老，披甲如骑士，一点也不着急。", "比城堡還老，披甲如騎士，一點也不著急。", "城より古く、騎士のように鎧をまとい、少しも急がない。", "성보다 오래되고, 기사처럼 갑옷을 둘렀으며, 전혀 서두르지 않는다."],
"It lives underwater in a bubble of silk and air, and waits there for you.": [
  "Elle vit sous l'eau dans une bulle de soie et d'air, et vous y attend.", "Sie lebt unter Wasser in einer Blase aus Seide und Luft und wartet dort auf dich.",
  "Vive bajo el agua en una burbuja de seda y aire, y allí te espera.", "Vive sott'acqua in una bolla di seta e aria, e lì ti aspetta.",
  "Vive debaixo de água numa bolha de seda e ar, e ali espera por ti.", "Nakatira ito sa ilalim ng tubig sa bula ng seda at hangin, at doon ka hinihintay.",
  "பட்டும் காற்றும் கொண்ட குமிழியில் நீருக்கடியில் வாழ்ந்து, அங்கே உங்களுக்காகக் காத்திருக்கும்.", "Ia hidup di bawah air dalam gelembung sutra dan udara, dan menunggumu di sana.",
  "它住在水下一个丝与空气织成的气泡里，在那儿等着你。", "牠住在水下一個絲與空氣織成的氣泡裡，在那兒等著你。", "水中で糸と空気の泡に住み、そこで君を待っている。", "물속 거미줄과 공기로 된 방울 속에 살며, 거기서 너를 기다린다."],
# Map 5
"Half fish, half alligator, all teeth, and a hundred million years of practice.": [
  "Mi-poisson, mi-alligator, tout en dents, et cent millions d'années d'entraînement.", "Halb Fisch, halb Alligator, ganz Zähne, und hundert Millionen Jahre Übung.",
  "Medio pez, medio caimán, todo dientes, y cien millones de años de práctica.", "Metà pesce, metà alligatore, tutto denti, e cento milioni di anni di pratica.",
  "Meio peixe, meio jacaré, todo dentes, e cem milhões de anos de prática.", "Kalahating isda, kalahating buwaya, puro ngipin, at sandaang milyong taon ng pagsasanay.",
  "பாதி மீன், பாதி முதலை, முழுக்கப் பற்கள், பத்துக் கோடி ஆண்டுப் பயிற்சி.", "Setengah ikan, setengah aligator, penuh gigi, dan latihan seratus juta tahun.",
  "半是鱼，半是鳄，满嘴獠牙，还有一亿年的练习。", "半是魚，半是鱷，滿嘴獠牙，還有一億年的練習。", "半分は魚、半分はワニ、歯だらけで、一億年の修業つき。", "반은 물고기, 반은 악어, 온통 이빨에, 1억 년의 연습."],
"The only rabbit that dives in to escape the hounds. It has never met a gator.": [
  "Le seul lapin qui plonge pour échapper aux chiens. Il n'a jamais croisé d'alligator.", "Das einzige Kaninchen, das vor den Hunden ins Wasser springt. Einem Alligator ist es nie begegnet.",
  "El único conejo que se zambulle para huir de los perros. Nunca ha visto un caimán.", "L'unico coniglio che si tuffa per sfuggire ai cani. Non ha mai incontrato un alligatore.",
  "O único coelho que mergulha para fugir dos cães. Nunca conheceu um jacaré.", "Ang tanging kunehong sumisisid para takasan ang mga aso. Hindi pa ito nakakakilala ng buwaya.",
  "வேட்டை நாய்களிடமிருந்து தப்ப நீரில் குதிக்கும் ஒரே முயல். அது இதுவரை முதலையைச் சந்தித்ததில்லை.", "Satu-satunya kelinci yang menyelam untuk lolos dari anjing. Ia belum pernah bertemu buaya.",
  "唯一会跳进水里躲猎犬的兔子。它还没遇见过短吻鳄。", "唯一會跳進水裡躲獵犬的兔子。牠還沒遇見過短吻鱷。", "猟犬から逃れるために水に飛び込む唯一のウサギ。まだワニには会っていない。", "사냥개를 피해 물에 뛰어드는 유일한 토끼. 아직 악어를 만난 적은 없다."],
"One is a nuisance. The whole cloud is a blood tax.": [
  "Un seul est une gêne. Toute la nuée, c'est un impôt du sang.", "Eine ist lästig. Die ganze Wolke ist eine Blutsteuer.",
  "Uno es una molestia. La nube entera es un impuesto de sangre.", "Una è un fastidio. L'intera nuvola è una tassa di sangue.",
  "Um é um incómodo. A nuvem inteira é um imposto de sangue.", "Ang isa ay istorbo. Ang buong ulap ay buwis ng dugo.",
  "ஒன்று தொல்லை. மேகம் முழுதும் இரத்த வரி.", "Satu cuma mengganggu. Seluruh awannya adalah pajak darah.",
  "一只是烦扰，一整群就是血税。", "一隻是煩擾，一整群就是血稅。", "一匹なら迷惑。群れ全体なら血の税だ。", "한 마리는 성가심, 떼 전체는 피의 세금."],
"When the flood comes they link legs and float: a living raft that stings.": [
  "Quand vient la crue, elles s'agrippent par les pattes et flottent : un radeau vivant qui pique.", "Wenn die Flut kommt, haken sie die Beine ineinander und treiben: ein lebendes Floß, das sticht.",
  "Cuando llega la crecida, se enganchan de las patas y flotan: una balsa viva que pica.", "Quando arriva la piena, si agganciano per le zampe e galleggiano: una zattera viva che punge.",
  "Quando vem a cheia, prendem-se pelas patas e flutuam: uma jangada viva que pica.", "Kapag dumating ang baha, nagkakapit-kapit ang mga paa nila at lumulutang: isang buhay na balsang nangangagat.",
  "வெள்ளம் வந்தால் கால்களைக் கோத்து மிதக்கும்: கொட்டும் உயிருள்ள தெப்பம்.", "Saat banjir datang, mereka mengaitkan kaki dan mengapung: rakit hidup yang menyengat.",
  "洪水一来，它们就腿勾着腿浮起来：一只会蜇人的活木筏。", "洪水一來，牠們就腿勾著腿浮起來：一隻會螫人的活木筏。", "洪水が来ると脚を組んで浮かぶ。刺してくる生きたいかだだ。", "홍수가 나면 다리를 엮어 떠오른다. 쏘아 대는 살아 있는 뗏목이다."],
"Swims with only its neck above water, then spears whatever swims past.": [
  "Nage avec seulement le cou hors de l'eau, puis transperce tout ce qui passe.", "Schwimmt nur mit dem Hals über Wasser und spießt dann auf, was vorbeischwimmt.",
  "Nada con solo el cuello fuera del agua y luego ensarta lo que pase nadando.", "Nuota con solo il collo fuori dall'acqua, poi infilza qualunque cosa passi.",
  "Nada só com o pescoço fora de água e depois espeta tudo o que passa.", "Lumalangoy na leeg lang ang nasa ibabaw ng tubig, saka sinisibat ang anumang dumaan.",
  "கழுத்து மட்டும் நீருக்கு மேலே இருக்க நீந்தி, கடந்து போவதை ஈட்டியால் குத்தும்.", "Berenang hanya dengan leher di atas air, lalu menombak apa pun yang lewat.",
  "游泳时只露出脖子，然后把游过的东西一矛刺穿。", "游泳時只露出脖子，然後把游過的東西一矛刺穿。", "首だけを水面に出して泳ぎ、通りかかるものを突き刺す。", "목만 물 위로 내놓고 헤엄치다가 지나가는 것은 무엇이든 꿰뚫는다."],
"Sweeps its spoon side to side through the mud and eats whatever it bumps.": [
  "Balaie la vase de sa cuillère, de gauche à droite, et mange tout ce qu'elle heurte.", "Schwenkt seinen Löffel durch den Schlamm hin und her und frisst alles, woran er stößt.",
  "Barre el fango con su cuchara de lado a lado y se come todo lo que toca.", "Spazza il fango con il suo cucchiaio da una parte all'altra e mangia tutto ciò che urta.",
  "Varre a lama com a colher de um lado para o outro e come tudo em que toca.", "Iniwawasiwas ang kutsara sa putik pakaliwa't pakanan at kinakain ang anumang matamaan.",
  "தன் கரண்டியைச் சேற்றில் இடமும் வலமும் வீசி, தட்டுப்படுவதையெல்லாம் உண்ணும்.", "Mengayunkan sendoknya ke kiri dan kanan di lumpur dan memakan apa pun yang tersentuh.",
  "它用勺子般的嘴在泥里左右扫，碰到什么就吃什么。", "牠用勺子般的嘴在泥裡左右掃，碰到什麼就吃什麼。", "スプーンを泥の中で左右に振り、当たったものを何でも食べる。", "숟가락 같은 부리로 진흙을 좌우로 휘저어 부딪히는 것은 뭐든 먹는다."],
# Map 6
"Freezes among the reeds by day. At night it booms like a drum underwater.": [
  "Immobile dans les roseaux le jour. La nuit, il tonne comme un tambour sous l'eau.", "Tagsüber erstarrt sie im Schilf. Nachts dröhnt sie wie eine Trommel unter Wasser.",
  "De día se queda inmóvil entre los juncos. De noche retumba como un tambor bajo el agua.", "Di giorno resta immobile tra le canne. Di notte rimbomba come un tamburo sott'acqua.",
  "De dia fica imóvel entre os juncos. À noite ribomba como um tambor debaixo de água.", "Hindi gumagalaw sa gitna ng tambo sa araw. Sa gabi, umuugong na parang tambol sa ilalim ng tubig.",
  "பகலில் நாணல்களுக்கிடையே அசையாமல் நிற்கும். இரவில் நீருக்கடி முரசு போல முழங்கும்.", "Diam membeku di antara buluh pada siang hari. Malam hari ia menggelegar bagai genderang di bawah air.",
  "白天它在芦苇间一动不动。到了夜里，它像水下的鼓一样轰鸣。", "白天牠在蘆葦間一動不動。到了夜裡，牠像水下的鼓一樣轟鳴。", "昼は葦の中で固まっている。夜になると水中の太鼓のように鳴り響く。", "낮에는 갈대 사이에서 꼼짝 않고, 밤이면 물속 북처럼 우렁차게 운다."],
"The toe-biter. It waits on the bottom with its arms wide open.": [
  "La mordeuse d'orteils. Elle attend au fond, les bras grands ouverts.", "Der Zehenbeißer. Er wartet am Grund mit weit geöffneten Armen.",
  "La muerdededos. Espera en el fondo con los brazos bien abiertos.", "La mordi-dita. Aspetta sul fondo a braccia spalancate.",
  "A morde-dedos. Espera no fundo de braços bem abertos.", "Ang kagat-daliri. Naghihintay ito sa ilalim nang nakabuka ang mga bisig.",
  "கால்விரல் கடிப்பான். கைகளை அகல விரித்தபடி அடியில் காத்திருக்கும்.", "Si penggigit jari kaki. Ia menunggu di dasar dengan lengan terbuka lebar.",
  "“咬脚趾的家伙”。它张开双臂在水底等着。", "「咬腳趾的傢伙」。牠張開雙臂在水底等著。", "足の指かじり。両腕を大きく広げて水底で待っている。", "발가락 깨물이. 팔을 활짝 벌린 채 바닥에서 기다린다."],
"Breathes through its tail like a snorkel and grabs whatever swims by.": [
  "Respire par la queue comme avec un tuba et attrape tout ce qui passe.", "Atmet durch den Schwanz wie durch einen Schnorchel und packt alles, was vorbeischwimmt.",
  "Respira por la cola como con un tubo de buceo y atrapa lo que pase nadando.", "Respira dalla coda come con un boccaglio e afferra qualunque cosa passi a nuoto.",
  "Respira pela cauda como por um tubo de mergulho e agarra tudo o que passa.", "Humihinga sa buntot na parang snorkel at sinusunggaban ang anumang lumangoy sa tabi.",
  "வால் வழியாக மூச்சுக் குழாய் போல சுவாசித்து, நீந்திக் கடப்பதைப் பிடித்துக்கொள்ளும்.", "Bernapas lewat ekornya seperti snorkel dan menyambar apa pun yang berenang lewat.",
  "用尾巴像呼吸管一样呼吸，游过来的东西一把抓住。", "用尾巴像呼吸管一樣呼吸，游過來的東西一把抓住。", "尻尾をシュノーケルのようにして息をし、泳いでくるものをつかむ。", "꼬리를 스노클처럼 써서 숨 쉬고, 헤엄쳐 지나가는 것은 무엇이든 움켜쥔다."],
"When the swamp dries it seals itself in mud and waits, for years if it must.": [
  "Quand le marais s'assèche, elle s'enferme dans la boue et attend, des années s'il le faut.", "Wenn der Sumpf austrocknet, versiegelt er sich im Schlamm und wartet, notfalls jahrelang.",
  "Cuando el pantano se seca, se sella en el barro y espera, años si hace falta.", "Quando la palude si secca, si sigilla nel fango e aspetta, per anni se serve.",
  "Quando o pântano seca, fecha-se na lama e espera, anos se for preciso.", "Kapag natuyo ang latian, ikinukulong nito ang sarili sa putik at naghihintay, kahit ilang taon.",
  "சதுப்பு வறண்டால் சேற்றுக்குள் தன்னை அடைத்துக்கொண்டு காத்திருக்கும், தேவைப்பட்டால் ஆண்டுக்கணக்கில்.", "Saat rawa mengering, ia menyegel diri dalam lumpur dan menunggu, bertahun-tahun bila perlu.",
  "沼泽干涸时，它就把自己封进泥里等待，必要时等上好几年。", "沼澤乾涸時，牠就把自己封進泥裡等待，必要時等上好幾年。", "沼が干上がると泥の中に閉じこもって待つ。必要なら何年でも。", "늪이 마르면 진흙 속에 몸을 봉하고 기다린다. 필요하면 몇 년이라도."],
"Quarters low over the reeds, wings in a V, and drops on anything that squeaks.": [
  "Rase les roseaux, les ailes en V, et fond sur tout ce qui couine.", "Streicht tief über das Schilf, die Flügel in V-Form, und stürzt sich auf alles, was piepst.",
  "Patrulla a ras de los juncos, con las alas en V, y cae sobre todo lo que chilla.", "Perlustra basso sopra le canne, ali a V, e piomba su tutto ciò che squittisce.",
  "Patrulha rente aos juncos, de asas em V, e cai sobre tudo o que guincha.", "Mababang lumilipad sa ibabaw ng tambo, hugis-V ang pakpak, at dinadagit ang anumang sumisirit.",
  "நாணல்களுக்கு மேல் தாழப் பறந்து, சிறகுகளை V வடிவில் விரித்து, கீச்சிடும் எதன் மேலும் பாயும்.", "Melayang rendah di atas buluh, sayap membentuk V, dan menyambar apa pun yang mencicit.",
  "它贴着芦苇低飞，双翼呈V形，扑向一切吱吱叫的东西。", "牠貼著蘆葦低飛，雙翼呈V形，撲向一切吱吱叫的東西。", "翼をV字にして葦の上を低く飛び、キーキー鳴くものに襲いかかる。", "날개를 V자로 펴고 갈대 위를 낮게 날다가, 찍찍대는 것은 무엇이든 덮친다."],
"Rests its feet on the water and feels for ripples in the dark.": [
  "Pose ses pattes sur l'eau et guette les rides dans le noir.", "Legt die Füße aufs Wasser und ertastet im Dunkeln die Wellen.",
  "Apoya las patas en el agua y siente las ondas en la oscuridad.", "Poggia le zampe sull'acqua e sente le increspature nel buio.",
  "Pousa as patas na água e sente as ondulações no escuro.", "Ipinapatong ang mga paa sa tubig at dinarama ang mga alon sa dilim.",
  "கால்களை நீரின் மேல் வைத்து, இருளில் அலைச்சுழிகளை உணரும்.", "Meletakkan kakinya di atas air dan merasakan riak dalam gelap.",
  "把脚搭在水面上，在黑暗中感受涟漪。", "把腳搭在水面上，在黑暗中感受漣漪。", "水面に脚をのせ、暗闇でさざ波を感じ取る。", "물 위에 발을 얹고 어둠 속에서 물결을 느낀다."],
# Map 7
"Spotted like a big cat, slow as a slug, and very fond of mushrooms.": [
  "Tachetée comme un grand félin, lente comme une limace, et très friande de champignons.", "Gefleckt wie eine Großkatze, langsam wie eine Schnecke und ganz verrückt nach Pilzen.",
  "Moteada como un gran felino, lenta como una babosa y muy aficionada a las setas.", "Maculata come un grande felino, lenta come una lumaca e ghiottissima di funghi.",
  "Malhada como um grande felino, lenta como uma lesma e muito gulosa de cogumelos.", "May batik na parang malaking pusa, mabagal na parang slug, at mahilig sa kabute.",
  "பெரிய பூனை போலப் புள்ளிகள், நத்தை போல மெதுவு, காளான்களின் மீது பெரும் ஆசை.", "Berbintik seperti kucing besar, lambat seperti siput, dan sangat suka jamur.",
  "斑纹像大猫，慢得像蛞蝓，还特别爱吃蘑菇。", "斑紋像大貓，慢得像蛞蝓，還特別愛吃蘑菇。", "大型ネコのような斑点、ナメクジらしいのろさ、そしてキノコが大好物。", "큰 고양이처럼 얼룩지고, 민달팽이처럼 느리며, 버섯을 무척 좋아한다."],
"She carries her spiderlings on her back, and still runs you down.": [
  "Elle porte ses petits sur le dos, et vous rattrape quand même.", "Sie trägt ihre Jungen auf dem Rücken und holt dich trotzdem ein.",
  "Lleva a sus crías a la espalda y aun así te alcanza.", "Porta i piccoli sulla schiena, e ti raggiunge lo stesso.",
  "Leva as crias às costas e mesmo assim apanha-te.", "Pasan niya sa likod ang kanyang mga anak, pero naaabutan ka pa rin.",
  "தன் குஞ்சுகளை முதுகில் சுமந்தபடியே உங்களைத் துரத்திப் பிடித்துவிடுவாள்.", "Ia menggendong anak-anaknya di punggung, dan tetap bisa mengejarmu.",
  "她背着一窝小蛛，照样能把你追上。", "她背著一窩小蛛，照樣能把你追上。", "背中に子グモを背負ったまま、それでも君に追いつく。", "등에 새끼들을 업고도 기어이 너를 따라잡는다."],
"Nose to the leaf litter, it finds the treasure you were standing on.": [
  "Le groin dans les feuilles mortes, il trouve le trésor sur lequel vous marchiez.", "Mit der Nase im Laub findet es den Schatz, auf dem du gerade standest.",
  "Con el hocico en la hojarasca, encuentra el tesoro que estabas pisando.", "Col naso tra le foglie, trova il tesoro su cui stavi in piedi.",
  "Focinho nas folhas, encontra o tesouro em que estavas a pisar.", "Nakasubsob ang nguso sa mga dahon, nahahanap nito ang kayamanang tinatapakan mo.",
  "சருகுகளில் மூக்கை வைத்து, நீங்கள் நின்றுகொண்டிருந்த புதையலைக் கண்டுபிடிக்கும்.", "Hidung di serasah daun, ia menemukan harta yang tadi kau injak.",
  "它把鼻子拱进落叶，找到了你脚下踩着的宝贝。", "牠把鼻子拱進落葉，找到了你腳下踩著的寶貝。", "落ち葉に鼻を押しつけ、君が踏んでいた宝物を見つけ出す。", "낙엽에 코를 박고, 네가 밟고 서 있던 보물을 찾아낸다."],
"Born in the gills, they rise in a haze wherever a mushroom is cut.": [
  "Nées dans les lamelles, elles s'élèvent en nuage partout où l'on coupe un champignon.", "In den Lamellen geboren, steigen sie als Dunst auf, wo immer ein Pilz geschnitten wird.",
  "Nacidos en las láminas, se alzan como una neblina allí donde se corta una seta.", "Nati nelle lamelle, si alzano in una foschia ovunque si tagli un fungo.",
  "Nascidos nas lamelas, erguem-se numa névoa onde quer que se corte um cogumelo.", "Isinilang sa hasang ng kabute, umaangat sila na parang ulap tuwing may kabuteng pinuputol.",
  "காளான் இதழ்களில் பிறந்து, காளான் வெட்டப்படும் இடமெல்லாம் புகைமூட்டமாய் எழும்.", "Lahir di bilah jamur, mereka naik bagai kabut di mana pun jamur dipotong.",
  "它们生在菌褶里，哪里切开蘑菇，哪里就腾起一片雾。", "牠們生在菌褶裡，哪裡切開蘑菇，哪裡就騰起一片霧。", "ひだの中で生まれ、キノコが切られるたびに霞のように舞い上がる。", "버섯 주름에서 태어나, 버섯을 자르는 곳마다 안개처럼 피어오른다."],
"Smaller than a seed, with a spring folded under its belly. Blink and it is gone.": [
  "Plus petit qu'une graine, avec un ressort replié sous le ventre. Clignez des yeux et il a disparu.", "Kleiner als ein Samen, mit einer Feder unter dem Bauch. Einmal blinzeln, und er ist weg.",
  "Más pequeño que una semilla, con un resorte plegado bajo la panza. Parpadea y ya no está.", "Più piccolo di un seme, con una molla ripiegata sotto la pancia. Batti le ciglia ed è sparito.",
  "Mais pequeno do que uma semente, com uma mola dobrada sob a barriga. Pestaneja e já foi.", "Mas maliit sa buto, may nakatiklop na spring sa ilalim ng tiyan. Kumurap ka at wala na.",
  "விதையை விடச் சிறியது, வயிற்றின் கீழ் மடித்த சுருள்வில். கண் இமைத்தால் காணாமல் போகும்.", "Lebih kecil dari biji, dengan pegas terlipat di bawah perutnya. Berkedip, dan ia lenyap.",
  "比种子还小，肚子下折着一根弹簧。一眨眼就不见了。", "比種子還小，肚子下摺著一根彈簧。一眨眼就不見了。", "種より小さく、お腹の下にばねを折りたたんでいる。瞬きすれば消えている。", "씨앗보다 작고, 배 밑에 용수철을 접어 두었다. 눈 깜빡하면 사라진다."],
"Breathes through its damp skin and lives under the same log for years.": [
  "Respire par sa peau humide et vit des années sous la même bûche.", "Atmet durch die feuchte Haut und lebt jahrelang unter demselben Baumstamm.",
  "Respira por la piel húmeda y vive años bajo el mismo tronco.", "Respira attraverso la pelle umida e vive per anni sotto lo stesso tronco.",
  "Respira pela pele húmida e vive anos debaixo do mesmo tronco.", "Humihinga sa basa nitong balat at taon-taong nakatira sa ilalim ng iisang troso.",
  "ஈரத் தோல் வழியாக மூச்சுவிட்டு, ஆண்டுக்கணக்கில் ஒரே மரக்கட்டையின் கீழ் வாழும்.", "Bernapas lewat kulitnya yang lembap dan bertahun-tahun tinggal di bawah batang kayu yang sama.",
  "它靠湿润的皮肤呼吸，在同一根木头下一住就是好几年。", "牠靠濕潤的皮膚呼吸，在同一根木頭下一住就是好幾年。", "湿った皮膚で呼吸し、何年も同じ倒木の下で暮らす。", "축축한 피부로 숨 쉬며, 몇 해고 같은 통나무 밑에서 산다."],
# Map 8
"Legs twice as long as its body, and every one of them listening.": [
  "Des pattes deux fois plus longues que son corps, et chacune d'elles écoute.", "Beine doppelt so lang wie der Körper, und jedes einzelne lauscht.",
  "Patas el doble de largas que su cuerpo, y todas escuchan.", "Zampe lunghe il doppio del corpo, e ognuna di esse ascolta.",
  "Pernas com o dobro do comprimento do corpo, e todas elas a escutar.", "Mga paang dalawang ulit ang haba sa katawan, at bawat isa ay nakikinig.",
  "உடலைப் போல இருமடங்கு நீளக் கால்கள், ஒவ்வொன்றும் கேட்டுக்கொண்டிருக்கிறது.", "Kakinya dua kali panjang tubuhnya, dan semuanya mendengarkan.",
  "腿比身子长一倍，每一条都在聆听。", "腿比身子長一倍，每一條都在聆聽。", "体の倍もある脚。その一本一本が耳を澄ませている。", "몸보다 두 배 긴 다리, 그 하나하나가 귀를 기울인다."],
"Pale as candle wax, blind as a stone, and it lives a hundred years in the dark.": [
  "Pâle comme la cire, aveugle comme une pierre, elle vit cent ans dans le noir.", "Bleich wie Kerzenwachs, blind wie ein Stein, und er lebt hundert Jahre im Dunkeln.",
  "Pálido como la cera, ciego como una piedra, y vive cien años en la oscuridad.", "Pallido come la cera, cieco come un sasso, vive cent'anni nel buio.",
  "Pálido como cera de vela, cego como uma pedra, e vive cem anos no escuro.", "Maputla na parang kandila, bulag na parang bato, at sandaang taong nabubuhay sa dilim.",
  "மெழுகு போல வெளிறியது, கல் போலக் குருடானது, இருளில் நூறு ஆண்டுகள் வாழும்.", "Pucat seperti lilin, buta seperti batu, dan hidup seratus tahun dalam gelap.",
  "苍白如烛蜡，盲如石头，在黑暗中活上一百年。", "蒼白如燭蠟，盲如石頭，在黑暗中活上一百年。", "ろうのように白く、石のように盲目で、闇の中で百年生きる。", "촛농처럼 하얗고 돌처럼 눈멀었으며, 어둠 속에서 백 년을 산다."],
"Clicks its way through the pitch dark, and builds its nest from its own spit.": [
  "Se fraie un chemin à coups de clics dans le noir complet, et bâtit son nid avec sa propre salive.", "Klickt sich durch die stockfinstere Nacht und baut sein Nest aus eigenem Speichel.",
  "Se abre paso a chasquidos en la oscuridad total y construye su nido con su propia saliva.", "Si fa strada a schiocchi nel buio pesto e costruisce il nido con la propria saliva.",
  "Abre caminho aos estalidos na escuridão total e constrói o ninho com a própria saliva.", "Kumikiliti ang daan sa ganap na dilim, at ginagawa ang pugad mula sa sariling laway.",
  "கும்மிருட்டில் கிளிக் ஒலியால் வழி கண்டு, தன் எச்சிலால் கூடு கட்டும்.", "Berdecak menembus gelap gulita, dan membangun sarang dari ludahnya sendiri.",
  "它在漆黑中靠咔嗒声辨路，用自己的唾液筑巢。", "牠在漆黑中靠咔嗒聲辨路，用自己的唾液築巢。", "真っ暗闇をカチカチという音で進み、自分の唾で巣を作る。", "칠흑 속을 딸깍 소리로 길을 찾고, 제 침으로 둥지를 짓는다."],
"A scorpion with no tail and no sting, just two venom-tipped claws the size of grains.": [
  "Un scorpion sans queue ni dard, juste deux pinces venimeuses grosses comme des grains.", "Ein Skorpion ohne Schwanz und Stachel, nur zwei giftige Scheren so groß wie Körner.",
  "Un escorpión sin cola ni aguijón, solo dos pinzas venenosas del tamaño de granos.", "Uno scorpione senza coda né pungiglione, solo due chele velenose grandi come chicchi.",
  "Um escorpião sem cauda nem ferrão, só duas pinças venenosas do tamanho de grãos.", "Alakdang walang buntot at walang tibo, dalawang makamandag na sipit lang na sinlaki ng butil.",
  "வாலும் கொடுக்கும் இல்லாத தேள்; தானிய அளவிலான இரண்டு நஞ்சுக் கொடுக்குகள் மட்டும்.", "Kalajengking tanpa ekor dan sengat, hanya dua capit berbisa sebesar butir beras.",
  "没有尾巴、没有毒刺的蝎子，只有两只米粒大小的带毒螯。", "沒有尾巴、沒有毒刺的蠍子，只有兩隻米粒大小的帶毒螯。", "尾も毒針もないサソリ。あるのは粒ほどの毒のハサミが二つだけ。", "꼬리도 독침도 없는 전갈, 낟알만 한 독 집게 두 개뿐이다."],
"It feels the dark with two whip-long legs, then strikes with the spiny pair.": [
  "Il tâte le noir de deux pattes longues comme des fouets, puis frappe avec la paire épineuse.", "Sie ertastet das Dunkel mit zwei peitschenlangen Beinen und schlägt dann mit dem stacheligen Paar zu.",
  "Palpa la oscuridad con dos patas largas como látigos y luego ataca con el par espinoso.", "Tasta il buio con due zampe lunghe come fruste, poi colpisce con il paio spinoso.",
  "Apalpa o escuro com duas pernas longas como chicotes e depois ataca com o par espinhoso.", "Kinakapa ang dilim ng dalawang paang sinhaba ng latigo, saka umaatake gamit ang matinik na pares.",
  "சாட்டை நீளக் கால்கள் இரண்டால் இருளைத் தடவி, முள் கால்களால் தாக்கும்.", "Ia meraba gelap dengan dua kaki sepanjang cambuk, lalu menyerang dengan pasangan berduri.",
  "它用两条鞭子般的长腿摸索黑暗，再用那对带刺的钳子出击。", "牠用兩條鞭子般的長腿摸索黑暗，再用那對帶刺的鉗子出擊。", "鞭のように長い二本の脚で闇を探り、トゲだらけの一対で襲いかかる。", "채찍처럼 긴 두 다리로 어둠을 더듬다가, 가시 돋친 한 쌍으로 덮친다."],
"Wider than your face, faster than your scream, and it has already seen you.": [
  "Plus large que votre visage, plus rapide que votre cri, et elle vous a déjà vu.", "Breiter als dein Gesicht, schneller als dein Schrei, und sie hat dich längst gesehen.",
  "Más ancha que tu cara, más rápida que tu grito, y ya te ha visto.", "Più larga della tua faccia, più veloce del tuo urlo, e ti ha già visto.",
  "Mais larga do que a tua cara, mais rápida do que o teu grito, e já te viu.", "Mas malapad pa sa mukha mo, mas mabilis pa sa sigaw mo, at nakita ka na nito.",
  "உங்கள் முகத்தை விட அகலம், உங்கள் அலறலை விட வேகம், அது ஏற்கெனவே உங்களைப் பார்த்துவிட்டது.", "Lebih lebar dari wajahmu, lebih cepat dari jeritanmu, dan ia sudah melihatmu.",
  "比你的脸还宽，比你的尖叫还快，而且它早就看见你了。", "比你的臉還寬，比你的尖叫還快，而且牠早就看見你了。", "君の顔より大きく、君の悲鳴より速い。そして、もう君を見ている。", "네 얼굴보다 넓고, 네 비명보다 빠르며, 이미 너를 보고 있다."],
"Under every bat roost there is a heap, and under every heap, a thousand of these.": [
  "Sous chaque dortoir de chauves-souris, il y a un tas, et sous chaque tas, mille de ceux-ci.", "Unter jedem Fledermausquartier liegt ein Haufen, und unter jedem Haufen tausend von diesen.",
  "Bajo cada colonia de murciélagos hay un montón, y bajo cada montón, mil de estos.", "Sotto ogni colonia di pipistrelli c'è un mucchio, e sotto ogni mucchio, mille di questi.",
  "Debaixo de cada abrigo de morcegos há um monte, e debaixo de cada monte, mil destes.", "Sa ilalim ng bawat pugad ng paniki ay may tambak, at sa ilalim ng bawat tambak, isang libo nito.",
  "ஒவ்வொரு வௌவால் கூட்டின் கீழும் ஒரு குவியல்; ஒவ்வொரு குவியலின் கீழும் இவை ஆயிரம்.", "Di bawah setiap sarang kelelawar ada tumpukan, dan di bawah setiap tumpukan, seribu ekor ini.",
  "每个蝙蝠窝下都有一堆，每堆底下都有上千只这种虫。", "每個蝙蝠窩下都有一堆，每堆底下都有上千隻這種蟲。", "コウモリのねぐらの下には山があり、その山の下にはこいつが千匹いる。", "박쥐 둥지 아래엔 무더기가 있고, 무더기마다 이 녀석들이 천 마리씩 있다."],
# Map 9
"Hunts eels in the roots by night, then crawls ashore to lay its eggs.": [
  "Chasse les anguilles dans les racines la nuit, puis rampe à terre pour pondre.", "Jagt nachts Aale in den Wurzeln und kriecht dann an Land, um Eier zu legen.",
  "Caza anguilas entre las raíces de noche y luego se arrastra a tierra para poner sus huevos.", "Di notte caccia anguille tra le radici, poi striscia a riva per deporre le uova.",
  "Caça enguias nas raízes à noite e depois rasteja para terra para pôr os ovos.", "Nanghuhuli ng igat sa mga ugat sa gabi, saka gumagapang sa pampang para mangitlog.",
  "இரவில் வேர்களுக்கிடையே விலாங்குகளை வேட்டையாடி, முட்டையிடக் கரைக்கு ஊர்ந்து வரும்.", "Memburu belut di akar-akar pada malam hari, lalu merayap ke darat untuk bertelur.",
  "它夜里在树根间猎鳗，然后爬上岸产卵。", "牠夜裡在樹根間獵鰻，然後爬上岸產卵。", "夜は根の間でウナギを狩り、それから岸へ這い上がって卵を産む。", "밤에는 뿌리 사이에서 장어를 사냥하고, 알을 낳으러 뭍으로 기어 나온다."],
"A cat that loves the water: it taps the surface like a lure, then dives.": [
  "Un chat qui aime l'eau : il tapote la surface comme un leurre, puis plonge.", "Eine Katze, die Wasser liebt: Sie klopft wie ein Köder auf die Oberfläche und taucht dann.",
  "Un gato que adora el agua: golpea la superficie como un señuelo y luego se zambulle.", "Un gatto che ama l'acqua: picchietta la superficie come un'esca, poi si tuffa.",
  "Um gato que adora água: bate na superfície como um isco e depois mergulha.", "Pusang mahilig sa tubig: tinatapik ang ibabaw na parang pain, saka sumisisid.",
  "நீரை நேசிக்கும் பூனை: தூண்டில் போல நீர்மட்டத்தைத் தட்டி, பின் மூழ்கும்.", "Kucing pencinta air: ia mengetuk permukaan seperti umpan, lalu menyelam.",
  "一只爱水的猫：它像鱼饵一样轻拍水面，然后一头扎下去。", "一隻愛水的貓：牠像魚餌一樣輕拍水面，然後一頭紮下去。", "水が大好きなネコ。疑似餌のように水面を叩き、それから飛び込む。", "물을 좋아하는 고양이. 미끼처럼 수면을 톡톡 치다가 뛰어든다."],
"That nose honks across the whole mangrove. Everyone looks. That is the point.": [
  "Ce nez claironne dans toute la mangrove. Tout le monde regarde. C'est bien le but.", "Diese Nase trötet durch die ganze Mangrove. Alle schauen hin. Genau darum geht es.",
  "Esa nariz resuena por todo el manglar. Todos miran. De eso se trata.", "Quel naso strombazza per tutta la mangrovia. Tutti guardano. È proprio questo lo scopo.",
  "Aquele nariz buzina por todo o mangue. Toda a gente olha. É essa a ideia.", "Umaalingawngaw ang ilong na iyon sa buong bakawan. Napapatingin ang lahat. Iyon nga ang punto.",
  "அந்த மூக்கு சதுப்புக்காடு முழுதும் ஒலிக்கும். எல்லோரும் பார்ப்பார்கள். அதுதான் நோக்கம்.", "Hidung itu membunyi ke seluruh hutan bakau. Semua menoleh. Memang itu tujuannya.",
  "那只鼻子的叫声响彻整片红树林。人人都看过来。这正是目的。", "那隻鼻子的叫聲響徹整片紅樹林。人人都看過來。這正是目的。", "あの鼻の声はマングローブじゅうに響く。誰もが振り向く。それが狙いだ。", "그 코가 맹그로브 전체에 울려 퍼진다. 모두가 쳐다본다. 바로 그게 목적이다."],
"Not a crab at all, but older than the dinosaurs, with blue blood to prove it.": [
  "Pas un crabe du tout, mais plus vieux que les dinosaures, avec du sang bleu pour le prouver.", "Gar kein Krebs, aber älter als die Dinosaurier, mit blauem Blut als Beweis.",
  "No es un cangrejo en absoluto, pero es más antiguo que los dinosaurios, con sangre azul que lo demuestra.", "Non è affatto un granchio, ma è più antico dei dinosauri, con il sangue blu a dimostrarlo.",
  "Não é caranguejo nenhum, mas é mais antigo do que os dinossauros, com sangue azul para o provar.", "Hindi talaga alimango, pero mas matanda pa sa mga dinosauro, at may asul na dugo bilang patunay.",
  "அது நண்டே அல்ல; டைனோசர்களை விடப் பழமையானது, சான்றாக நீல இரத்தம்.", "Sama sekali bukan kepiting, tapi lebih tua dari dinosaurus, dengan darah biru sebagai buktinya.",
  "它根本不是螃蟹，却比恐龙还古老，蓝色的血就是证明。", "牠根本不是螃蟹，卻比恐龍還古老，藍色的血就是證明。", "カニではまったくないが、恐竜より古い。その証拠に血は青い。", "게가 전혀 아니지만 공룡보다 오래되었고, 그 증거로 피가 파랗다."],
"A sea slug with rabbit ears that hides behind a cloud of purple ink.": [
  "Une limace de mer aux oreilles de lapin qui se cache derrière un nuage d'encre violette.", "Eine Meeresschnecke mit Hasenohren, die sich hinter einer Wolke aus violetter Tinte versteckt.",
  "Una babosa marina con orejas de conejo que se esconde tras una nube de tinta morada.", "Una lumaca di mare con orecchie da coniglio che si nasconde dietro una nuvola di inchiostro viola.",
  "Uma lesma-do-mar com orelhas de coelho que se esconde atrás de uma nuvem de tinta roxa.", "Isang dagat-slug na may tainga ng kuneho na nagtatago sa likod ng ulap ng lilang tinta.",
  "முயல் காதுகள் கொண்ட கடல் நத்தை, ஊதா மையின் மேகத்துக்குப் பின்னால் ஒளிந்துகொள்ளும்.", "Siput laut bertelinga kelinci yang bersembunyi di balik awan tinta ungu.",
  "长着兔耳朵的海蛞蝓，躲在一团紫色墨汁后面。", "長著兔耳朵的海蛞蝓，躲在一團紫色墨汁後面。", "ウサギの耳をもつ海のナメクジ。紫の墨の雲に隠れる。", "토끼 귀가 달린 바다 민달팽이, 보랏빛 먹물 구름 뒤에 숨는다."],
"Half a tonne of seagrass and patience, drifting through the roots at walking pace.": [
  "Une demi-tonne d'herbiers et de patience, qui dérive entre les racines au pas.", "Eine halbe Tonne Seegras und Geduld, die im Schritttempo durch die Wurzeln treibt.",
  "Media tonelada de pradera marina y paciencia, que deriva entre las raíces al paso.", "Mezza tonnellata di erba marina e pazienza, che scivola tra le radici a passo d'uomo.",
  "Meia tonelada de erva-marinha e paciência, a derivar entre as raízes a passo.", "Kalahating tonelada ng damong-dagat at pasensya, lumulutang sa mga ugat sa bilis ng paglakad.",
  "அரை டன் கடல்புல்லும் பொறுமையும், நடை வேகத்தில் வேர்களிடையே மிதந்து செல்லும்.", "Setengah ton lamun dan kesabaran, hanyut di antara akar secepat orang berjalan.",
  "半吨海草与耐心，以散步的速度在根须间漂过。", "半噸海草與耐心，以散步的速度在根鬚間漂過。", "半トンの海草と忍耐が、歩く速さで根の間を漂っていく。", "반 톤의 해초와 인내가, 걷는 속도로 뿌리 사이를 떠다닌다."],
# Map 10
"It drifts with the slicks in the open ocean and never comes ashore at all.": [
  "Il dérive avec les nappes en haute mer et ne vient jamais à terre.", "Sie treibt mit den Schlieren im offenen Meer und kommt nie an Land.",
  "Deriva con las manchas en mar abierto y jamás sale a tierra.", "Va alla deriva con le chiazze in mare aperto e non viene mai a riva.",
  "Deriva com as manchas em mar aberto e nunca vem a terra.", "Lumulutang kasama ng mga slick sa malawak na dagat at hindi kailanman umaahon.",
  "திறந்த கடலில் நீர்ப்படலங்களுடன் மிதக்கும்; கரைக்கு வருவதே இல்லை.", "Ia hanyut bersama lapisan buih di laut lepas dan tak pernah naik ke darat.",
  "它随着外海的浮沫带漂流，从不上岸。", "牠隨著外海的浮沫帶漂流，從不上岸。", "外洋の潮目とともに漂い、陸には一度も上がらない。", "먼바다의 물띠를 따라 떠다니며, 뭍에는 결코 오르지 않는다."],
"It eats the reef from the top down, and every one of its spines is venomous.": [
  "Elle dévore le récif de haut en bas, et chacune de ses épines est venimeuse.", "Er frisst das Riff von oben nach unten, und jeder seiner Stacheln ist giftig.",
  "Se come el arrecife de arriba abajo, y cada una de sus espinas es venenosa.", "Divora la barriera dall'alto in basso, e ogni sua spina è velenosa.",
  "Come o recife de cima para baixo, e cada um dos seus espinhos é venenoso.", "Kinakain nito ang bahura mula itaas pababa, at makamandag ang bawat tinik nito.",
  "பவளப்பாறையை மேலிருந்து கீழாகத் தின்னும்; அதன் ஒவ்வொரு முள்ளிலும் நஞ்சு.", "Ia memakan terumbu dari atas ke bawah, dan setiap durinya berbisa.",
  "它从上往下啃食珊瑚礁，每一根刺都有毒。", "牠從上往下啃食珊瑚礁，每一根刺都有毒。", "サンゴ礁を上から食べ尽くし、そのトゲの一本一本に毒がある。", "산호초를 위에서부터 먹어 치우며, 가시 하나하나에 독이 있다."],
"It bites the coral to bits, and every white beach began in its gut.": [
  "Il croque le corail en miettes, et chaque plage blanche a commencé dans son ventre.", "Er beißt die Koralle zu Krümeln, und jeder weiße Strand begann in seinem Bauch.",
  "Muerde el coral hasta hacerlo trizas, y cada playa blanca empezó en su tripa.", "Sgretola il corallo a morsi, e ogni spiaggia bianca è nata nella sua pancia.",
  "Morde o coral aos bocados, e cada praia branca começou na sua barriga.", "Kinakagat nito ang koral hanggang madurog, at nagsimula sa tiyan nito ang bawat puting dalampasigan.",
  "பவளத்தைத் துண்டு துண்டாகக் கடிக்கும்; ஒவ்வொரு வெண்மணல் கரையும் அதன் வயிற்றில்தான் தொடங்கியது.", "Ia menggigit karang sampai remuk, dan setiap pantai putih bermula di perutnya.",
  "它把珊瑚啃成碎屑，每一片白沙滩都始于它的肚子。", "牠把珊瑚啃成碎屑，每一片白沙灘都始於牠的肚子。", "サンゴをかみ砕く。白い砂浜はみな、その腹の中から始まった。", "산호를 잘게 깨물어 부수니, 모든 하얀 해변은 그 뱃속에서 시작되었다."],
"Its fins spread like a fan of feathers. Every feather is a venomous spine.": [
  "Ses nageoires s'ouvrent comme un éventail de plumes. Chaque plume est une épine venimeuse.", "Seine Flossen spreizen sich wie ein Federfächer. Jede Feder ist ein Giftstachel.",
  "Sus aletas se abren como un abanico de plumas. Cada pluma es una espina venenosa.", "Le sue pinne si aprono come un ventaglio di piume. Ogni piuma è una spina velenosa.",
  "As barbatanas abrem-se como um leque de penas. Cada pena é um espinho venenoso.", "Bumubuka ang mga palikpik nito na parang pamaypay ng balahibo. Bawat balahibo ay makamandag na tinik.",
  "அதன் துடுப்புகள் இறகு விசிறி போல விரியும். ஒவ்வொரு இறகும் நஞ்சு முள்.", "Siripnya mengembang seperti kipas bulu. Setiap bulunya adalah duri berbisa.",
  "它的鳍像羽毛扇一样展开。每一根羽毛都是一根毒刺。", "牠的鰭像羽毛扇一樣展開。每一根羽毛都是一根毒刺。", "ひれは羽根の扇のように広がる。その羽根の一本一本が毒のトゲだ。", "지느러미가 깃털 부채처럼 펼쳐진다. 깃털 하나하나가 독가시다."],
"It farms algae in its own lips, and closes like a door.": [
  "Il cultive des algues dans ses propres lèvres, et se ferme comme une porte.", "Sie züchtet Algen in ihren eigenen Lippen und schließt sich wie eine Tür.",
  "Cultiva algas en sus propios labios y se cierra como una puerta.", "Coltiva alghe nelle proprie labbra, e si chiude come una porta.",
  "Cultiva algas nos próprios lábios e fecha-se como uma porta.", "Nagtatanim ito ng lumot sa sarili nitong labi, at sumasara na parang pinto.",
  "தன் உதடுகளிலேயே பாசி வளர்க்கும்; கதவு போல மூடிக்கொள்ளும்.", "Ia membudidayakan alga di bibirnya sendiri, dan menutup seperti pintu.",
  "它在自己的唇上种藻类，合起来像一扇门。", "牠在自己的唇上種藻類，合起來像一扇門。", "自分の唇で藻を育て、扉のように閉じる。", "제 입술에서 조류를 기르고, 문처럼 닫힌다."],
"It hangs in the current like a silver blade. Then it is not there any more.": [
  "Il flotte dans le courant comme une lame d'argent. Puis il n'est plus là.", "Er steht in der Strömung wie eine silberne Klinge. Dann ist er nicht mehr da.",
  "Se queda quieta en la corriente como una hoja de plata. Luego ya no está.", "Resta sospeso nella corrente come una lama d'argento. Poi non c'è più.",
  "Fica parada na corrente como uma lâmina de prata. Depois já não está lá.", "Nakabitin ito sa agos na parang pilak na talim. Tapos wala na ito roon.",
  "நீரோட்டத்தில் வெள்ளிக் கத்தி போலத் தொங்கி நிற்கும். பின் அது அங்கே இல்லை.", "Ia melayang di arus seperti bilah perak. Lalu ia sudah tak ada di sana.",
  "它像一把银刃悬在水流中。然后就不见了。", "牠像一把銀刃懸在水流中。然後就不見了。", "銀の刃のように潮の中に浮かぶ。次の瞬間にはもういない。", "은빛 칼날처럼 물살 속에 떠 있다. 그러다 더는 그 자리에 없다."],
"The biggest fish in the sea lives on the smallest things in it.": [
  "Le plus gros poisson de la mer vit des plus petites choses qu'elle contient.", "Der größte Fisch im Meer lebt von den kleinsten Dingen darin.",
  "El pez más grande del mar vive de lo más pequeño que hay en él.", "Il pesce più grande del mare vive delle cose più piccole che contiene.",
  "O maior peixe do mar vive das coisas mais pequenas que nele há.", "Ang pinakamalaking isda sa dagat ay nabubuhay sa pinakamaliliit na bagay roon.",
  "கடலின் மிகப்பெரிய மீன், அதிலுள்ள மிகச் சிறியவற்றை உண்டு வாழ்கிறது.", "Ikan terbesar di laut hidup dari makhluk terkecil di dalamnya.",
  "海里最大的鱼，靠海里最小的东西为生。", "海裡最大的魚，靠海裡最小的東西為生。", "海でいちばん大きな魚は、海でいちばん小さなものを食べて生きる。", "바다에서 가장 큰 물고기가 바다에서 가장 작은 것을 먹고 산다."],
# Map 11
"Leaps from ledge to ledge where even the ibex think twice.": [
  "Bondit de corniche en corniche là où même les bouquetins hésitent.", "Springt von Sims zu Sims, wo selbst die Steinböcke zweimal überlegen.",
  "Salta de cornisa en cornisa donde hasta las cabras montesas se lo piensan dos veces.", "Salta di cengia in cengia dove persino gli stambecchi ci pensano due volte.",
  "Salta de saliência em saliência onde até as cabras-monteses pensam duas vezes.", "Lumulukso mula gilid hanggang gilid kung saan pati ang ibex ay nag-aalangan.",
  "ஐபெக்ஸ் கூட இருமுறை யோசிக்கும் இடங்களில் விளிம்பிலிருந்து விளிம்புக்குத் தாவும்.", "Melompat dari tebing ke tebing di tempat bahkan ibex pun berpikir dua kali.",
  "在连羱羊都要犹豫的地方，它从一道岩架跳到另一道。", "在連羱羊都要猶豫的地方，牠從一道岩架跳到另一道。", "アイベックスさえためらう岩棚から岩棚へと跳び移る。", "아이벡스조차 망설이는 곳에서 바위 턱에서 바위 턱으로 뛰어오른다."],
"It eats, drinks and sleeps on the wing, and may not land for half a year.": [
  "Il mange, boit et dort en vol, et peut ne pas se poser pendant six mois.", "Er frisst, trinkt und schläft im Flug und landet vielleicht ein halbes Jahr lang nicht.",
  "Come, bebe y duerme en vuelo, y puede pasar medio año sin posarse.", "Mangia, beve e dorme in volo, e può non posarsi per mezzo anno.",
  "Come, bebe e dorme a voar, e pode passar meio ano sem pousar.", "Kumakain, umiinom at natutulog habang lumilipad, at maaaring hindi lumapag nang kalahating taon.",
  "பறந்தபடியே உண்ணும், குடிக்கும், உறங்கும்; அரை ஆண்டு தரையிறங்காமலும் இருக்கும்.", "Ia makan, minum, dan tidur sambil terbang, dan bisa tak mendarat setengah tahun.",
  "它在飞行中吃、喝、睡，可能半年都不落地。", "牠在飛行中吃、喝、睡，可能半年都不落地。", "飛びながら食べ、飲み、眠る。半年降りないこともある。", "날면서 먹고 마시고 자며, 반년 동안 내려앉지 않기도 한다."],
"A grey mouse of a bird on the cliff face, until it opens its crimson wings.": [
  "Une souris grise d'oiseau sur la paroi, jusqu'à ce qu'il ouvre ses ailes cramoisies.", "Ein grauer Mausvogel an der Felswand, bis er seine karminroten Flügel öffnet.",
  "Un pájaro gris como un ratón en la pared, hasta que abre sus alas carmesí.", "Un uccellino grigio come un topo sulla parete, finché non apre le ali cremisi.",
  "Uma ave cinzenta como um rato na falésia, até abrir as asas carmesim.", "Isang abuhing ibong parang daga sa pader ng bangin, hanggang ibuka nito ang pulang pakpak.",
  "குன்றுச் சுவரில் ஒரு சாம்பல் எலி போன்ற பறவை, அது தன் செந்நிறச் சிறகுகளை விரிக்கும் வரை.", "Burung abu-abu seperti tikus di dinding tebing, sampai ia membentangkan sayap merah tuanya.",
  "峭壁上一只灰扑扑像老鼠的鸟，直到它张开绯红的翅膀。", "峭壁上一隻灰撲撲像老鼠的鳥，直到牠張開緋紅的翅膀。", "崖に張りつく灰色のネズミのような鳥。深紅の翼を広げるまでは。", "절벽에 붙은 회색 쥐 같은 새, 진홍빛 날개를 펼치기 전까지는."],
"Jet black, born live after two years inside its mother, and very hard to impress.": [
  "Noire comme le jais, née vivante après deux ans dans le ventre de sa mère, et très difficile à impressionner.", "Pechschwarz, lebend geboren nach zwei Jahren im Mutterleib, und sehr schwer zu beeindrucken.",
  "Negra azabache, nacida viva tras dos años dentro de su madre, y muy difícil de impresionar.", "Nera come il giaietto, nata viva dopo due anni nella madre, e molto difficile da impressionare.",
  "Negra como azeviche, nascida viva após dois anos dentro da mãe, e muito difícil de impressionar.", "Itim na itim, ipinanganak nang buhay matapos ang dalawang taon sa loob ng ina, at mahirap pahangain.",
  "கருங்கல் போலக் கருப்பு, தாயின் வயிற்றில் இரண்டு ஆண்டுகளுக்குப் பின் உயிருடன் பிறந்தது, எளிதில் வியக்காதது.", "Hitam legam, lahir hidup setelah dua tahun dalam tubuh induknya, dan sulit sekali dibuat terkesan.",
  "乌黑发亮，在母亲腹中待了两年才胎生出来，很难被打动。", "烏黑發亮，在母親腹中待了兩年才胎生出來，很難被打動。", "漆黒の体。母の胎内で二年過ごしてから生まれ、めったなことでは驚かない。", "새까맣고, 어미 뱃속에서 2년을 지낸 뒤 새끼로 태어났으며, 좀처럼 감탄하지 않는다."],
"Red eyespots on white wings: a warning the thin mountain air carries a long way.": [
  "Des ocelles rouges sur des ailes blanches : un avertissement que l'air raréfié porte très loin.", "Rote Augenflecken auf weißen Flügeln: eine Warnung, die die dünne Bergluft weit trägt.",
  "Ocelos rojos sobre alas blancas: una advertencia que el aire fino de la montaña lleva lejos.", "Ocelli rossi su ali bianche: un avvertimento che l'aria sottile dei monti porta lontano.",
  "Ocelos vermelhos em asas brancas: um aviso que o ar rarefeito da montanha leva longe.", "Pulang batik-mata sa puting pakpak: babalang dinadala nang malayo ng manipis na hangin sa bundok.",
  "வெள்ளைச் சிறகுகளில் சிவப்புக் கண்புள்ளிகள்: மெல்லிய மலைக்காற்று வெகுதூரம் கொண்டு செல்லும் எச்சரிக்கை.", "Bintik mata merah di sayap putih: peringatan yang dibawa jauh oleh udara gunung yang tipis.",
  "白翅上的红色眼斑：稀薄的山间空气会把这份警告传得很远。", "白翅上的紅色眼斑：稀薄的山間空氣會把這份警告傳得很遠。", "白い翅に赤い眼状紋。薄い山の空気が、その警告を遠くまで運ぶ。", "흰 날개의 붉은 눈알무늬. 희박한 산 공기가 그 경고를 멀리까지 실어 나른다."],
"Brown in summer, white in winter, and always one leap ahead of the eagle.": [
  "Brun l'été, blanc l'hiver, et toujours un bond devant l'aigle.", "Braun im Sommer, weiß im Winter und dem Adler immer einen Sprung voraus.",
  "Pardo en verano, blanco en invierno, y siempre un salto por delante del águila.", "Bruna d'estate, bianca d'inverno, e sempre un balzo davanti all'aquila.",
  "Castanha no verão, branca no inverno, e sempre um salto à frente da águia.", "Kayumanggi sa tag-init, puti sa taglamig, at laging isang lukso nauuna sa agila.",
  "கோடையில் பழுப்பு, குளிர்காலத்தில் வெள்ளை, கழுகுக்கு எப்போதும் ஒரு தாவல் முன்னால்.", "Cokelat di musim panas, putih di musim dingin, dan selalu selompatan di depan elang.",
  "夏天棕，冬天白，总比老鹰快一跳。", "夏天棕，冬天白，總比老鷹快一跳。", "夏は茶色、冬は白。いつもワシより一跳び先を行く。", "여름엔 갈색, 겨울엔 흰색, 언제나 독수리보다 한 걸음 앞서 뛴다."],
# Map 12
"The butcher bird: it keeps a larder of beetles and mice, hung up on the thorns.": [
  "L'oiseau boucher : il garde un garde-manger de scarabées et de souris, pendus aux épines.", "Der Metzgervogel: Er hält eine Speisekammer aus Käfern und Mäusen, auf die Dornen gespießt.",
  "El pájaro carnicero: guarda una despensa de escarabajos y ratones, colgados de las espinas.", "L'uccello macellaio: tiene una dispensa di coleotteri e topi, appesi alle spine.",
  "A ave talhante: guarda uma despensa de besouros e ratos, pendurados nos espinhos.", "Ang ibong mangangatay: may imbakan ito ng salagubang at daga, nakasabit sa mga tinik.",
  "கசாப்புக்காரப் பறவை: முட்களில் தொங்கவிட்ட வண்டுகளும் எலிகளும் கொண்ட சரக்கறை வைத்திருக்கும்.", "Burung jagal: ia menyimpan lumbung kumbang dan tikus, tergantung di duri-duri.",
  "屠夫鸟：它把甲虫和老鼠挂在荆棘上，当作储藏室。", "屠夫鳥：牠把甲蟲和老鼠掛在荊棘上，當作儲藏室。", "はやにえの鳥。甲虫やネズミを茨に刺して蓄えている。", "백정새. 딱정벌레와 쥐를 가시에 꿰어 두고 식량 창고로 삼는다."],
"Thin enough to follow a mouse down its own hole, and it does.": [
  "Assez mince pour suivre une souris dans son propre trou, et elle le fait.", "Dünn genug, um einer Maus in ihr eigenes Loch zu folgen, und es tut es auch.",
  "Lo bastante delgada para seguir a un ratón por su propio agujero, y lo hace.", "Abbastanza sottile da seguire un topo nella sua tana, e lo fa.",
  "Magra o bastante para seguir um rato pela sua própria toca, e fá-lo.", "Sapat ang payat para sundan ang daga sa sarili nitong lungga, at ginagawa nga nito.",
  "ஒரு எலியை அதன் சொந்த வளைக்குள்ளேயே பின்தொடரும் அளவுக்கு ஒல்லி, அப்படியே செய்யும்.", "Cukup ramping untuk mengikuti tikus masuk ke lubangnya sendiri, dan memang begitu.",
  "瘦到能跟着老鼠钻进它自己的洞，而且真会这么做。", "瘦到能跟著老鼠鑽進牠自己的洞，而且真會這麼做。", "ネズミを巣穴の奥まで追えるほど細い。そして実際に追う。", "쥐를 제 굴까지 따라 들어갈 만큼 가늘고, 실제로 그렇게 한다."],
"A green shield with red trim, and a smell that clears the hedge.": [
  "Un bouclier vert bordé de rouge, et une odeur qui vide la haie.", "Ein grüner Schild mit rotem Rand und ein Geruch, der die Hecke leert.",
  "Un escudo verde con ribete rojo, y un olor que despeja el seto.", "Uno scudo verde bordato di rosso, e un odore che svuota la siepe.",
  "Um escudo verde de orla vermelha, e um cheiro que esvazia a sebe.", "Berdeng kalasag na may pulang gilid, at amoy na nagpapalayas sa buong bakod.",
  "சிவப்பு ஓரம் கொண்ட பச்சைக் கேடயம்; வேலியையே காலி செய்யும் நாற்றம்.", "Perisai hijau berpinggiran merah, dan bau yang mengosongkan pagar tanaman.",
  "一面镶红边的绿盾，外加一股能清空整片树篱的气味。", "一面鑲紅邊的綠盾，外加一股能清空整片樹籬的氣味。", "赤い縁取りの緑の盾。生け垣を空っぽにするほどの臭い。", "붉은 테두리의 초록 방패, 그리고 산울타리를 텅 비게 만드는 냄새."],
"A deer no bigger than a dog, and it barks like one at anything in the hedge.": [
  "Un cerf pas plus grand qu'un chien, qui aboie comme lui contre tout ce qui bouge dans la haie.", "Ein Hirsch, nicht größer als ein Hund, und er bellt wie einer alles in der Hecke an.",
  "Un ciervo no más grande que un perro, que ladra como uno a todo lo que hay en el seto.", "Un cervo non più grande di un cane, che abbaia come un cane a qualunque cosa nella siepe.",
  "Um veado do tamanho de um cão, que ladra como um a tudo o que está na sebe.", "Isang usang hindi lalaki sa aso, at tumatahol din na parang aso sa anumang nasa bakod.",
  "நாயை விடப் பெரிதில்லாத மான்; வேலியில் எதைக் கண்டாலும் நாய் போலவே குரைக்கும்.", "Rusa yang tak lebih besar dari anjing, dan menggonggong seperti anjing pada apa pun di pagar tanaman.",
  "个头不比狗大的鹿，对树篱里的任何东西都像狗一样吠叫。", "個頭不比狗大的鹿，對樹籬裡的任何東西都像狗一樣吠叫。", "犬ほどの大きさしかないシカ。生け垣の何にでも犬のように吠える。", "개만 한 사슴이, 산울타리 속 무엇에게나 개처럼 짖어 댄다."],
"It sings the hedge awake each dawn, then smashes snails on its favourite stone.": [
  "Elle réveille la haie de son chant chaque aube, puis casse des escargots sur sa pierre préférée.", "Sie singt die Hecke jeden Morgen wach und zerschlägt dann Schnecken auf ihrem Lieblingsstein.",
  "Despierta el seto cantando cada amanecer y luego rompe caracoles en su piedra favorita.", "Sveglia la siepe col canto ogni alba, poi frantuma lumache sulla sua pietra preferita.",
  "Acorda a sebe a cantar todas as madrugadas e depois parte caracóis na sua pedra preferida.", "Ginigising nito ang bakod sa awit tuwing madaling-araw, saka binabasag ang mga suso sa paborito nitong bato.",
  "ஒவ்வொரு விடியலிலும் பாடி வேலியை எழுப்பும், பின் தன் விருப்பக் கல்லில் நத்தைகளை உடைக்கும்.", "Ia membangunkan pagar tanaman dengan kicaunya tiap fajar, lalu memecahkan siput di batu kesayangannya.",
  "它每天清晨用歌声唤醒树篱，然后在最爱的石头上砸碎蜗牛。", "牠每天清晨用歌聲喚醒樹籬，然後在最愛的石頭上砸碎蝸牛。", "毎朝、歌で生け垣を目覚めさせ、お気に入りの石でカタツムリを割る。", "새벽마다 노래로 산울타리를 깨우고, 아끼는 돌에 달팽이를 내리쳐 깬다."],
"Its woolly-bear caterpillar is all bristles, and the moth tastes even worse.": [
  "Sa chenille est toute en poils, et le papillon a encore plus mauvais goût.", "Ihre Bärenraupe besteht nur aus Borsten, und der Falter schmeckt noch schlimmer.",
  "Su oruga peluda es todo pelos, y la mariposa sabe aún peor.", "Il suo bruco peloso è tutto setole, e la falena ha un sapore ancora peggiore.",
  "A sua lagarta peluda é só cerdas, e a mariposa sabe ainda pior.", "Puro balahibo ang mabalbong uod nito, at mas pangit pa ang lasa ng gamugamo.",
  "அதன் கம்பளிப்புழு முழுக்க மயிர்கள்; அந்துப்பூச்சியின் சுவை இன்னும் மோசம்.", "Ulat bulunya penuh bulu kaku, dan ngengatnya terasa lebih buruk lagi.",
  "它的毛毛虫浑身是刺毛，蛾子的味道更糟。", "牠的毛毛蟲渾身是刺毛，蛾子的味道更糟。", "毛虫は剛毛だらけ。成虫の蛾はもっとまずい。", "털북숭이 애벌레는 온통 뻣뻣한 털이고, 나방은 맛이 더 고약하다."],
# Polar set
"It waits at the breathing hole for hours. The seal only has to come up once.": [
  "Il attend des heures près du trou de respiration. Le phoque n'a qu'à remonter une fois.", "Er wartet stundenlang am Atemloch. Die Robbe muss nur einmal auftauchen.",
  "Espera horas junto al agujero de respiración. La foca solo tiene que asomarse una vez.", "Aspetta per ore al foro di respirazione. La foca deve risalire una volta sola.",
  "Espera horas junto ao buraco de respiração. A foca só tem de subir uma vez.", "Naghihintay ito nang ilang oras sa butas-hingahan. Isang beses lang kailangang umahon ang seal.",
  "சுவாசத் துளையருகே மணிக்கணக்கில் காத்திருக்கும். கடல்நாய் ஒரே ஒருமுறை மேலே வந்தால் போதும்.", "Ia menunggu berjam-jam di lubang napas. Anjing laut cukup muncul sekali saja.",
  "它在呼吸孔旁一等就是几个小时。海豹只要冒一次头就够了。", "牠在呼吸孔旁一等就是幾個小時。海豹只要冒一次頭就夠了。", "呼吸穴のそばで何時間も待つ。アザラシは一度顔を出すだけでいい。", "숨구멍 옆에서 몇 시간이고 기다린다. 물범은 한 번만 고개를 내밀면 된다."],
"A white bundle on the pack ice, drinking the richest milk in the sea.": [
  "Une boule blanche sur la banquise, qui boit le lait le plus riche de la mer.", "Ein weißes Bündel auf dem Packeis, das die reichhaltigste Milch des Meeres trinkt.",
  "Un bulto blanco sobre el hielo, que bebe la leche más rica del mar.", "Un fagottino bianco sulla banchisa, che beve il latte più ricco del mare.",
  "Uma trouxa branca no gelo, a beber o leite mais rico do mar.", "Isang puting bungkos sa yelo, umiinom ng pinakamasustansyang gatas sa dagat.",
  "பனிப்படலத்தில் ஒரு வெள்ளை மூட்டை, கடலின் மிகச் செழுமையான பாலைக் குடிக்கிறது.", "Buntalan putih di atas es, meminum susu terkaya di lautan.",
  "浮冰上的一团白，喝着海里最浓的奶。", "浮冰上的一團白，喝著海裡最濃的奶。", "流氷の上の白いかたまり。海でいちばん濃いミルクを飲んでいる。", "유빙 위의 하얀 꾸러미, 바다에서 가장 진한 젖을 먹는다."],
"The sea canary: it whistles and chirps under the ice, and the pod sings back.": [
  "Le canari des mers : il siffle et gazouille sous la glace, et le groupe lui répond en chantant.", "Der Kanarienvogel des Meeres: Er pfeift und zwitschert unter dem Eis, und die Schule singt zurück.",
  "El canario del mar: silba y trina bajo el hielo, y la manada le responde cantando.", "Il canarino del mare: fischia e cinguetta sotto il ghiaccio, e il branco risponde cantando.",
  "O canário do mar: assobia e chilreia debaixo do gelo, e o grupo responde a cantar.", "Ang kanaryo ng dagat: sumisipol at humuhuni sa ilalim ng yelo, at sumasagot ng awit ang kawan.",
  "கடல் கானரி: பனிக்கடியில் சீட்டியடித்துக் கீச்சிடும், கூட்டம் பதிலுக்குப் பாடும்.", "Kenari laut: ia bersiul dan berkicau di bawah es, dan kawanannya menyanyi membalas.",
  "海中金丝雀：它在冰下吹哨、啁啾，鲸群也唱着回应。", "海中金絲雀：牠在冰下吹哨、啁啾，鯨群也唱著回應。", "海のカナリア。氷の下で口笛を吹きさえずると、群れが歌い返す。", "바다의 카나리아. 얼음 밑에서 휘파람 불고 지저귀면, 무리가 노래로 답한다."],
"Pole to pole and back every year: it sees more daylight than anything alive.": [
  "D'un pôle à l'autre et retour chaque année : il voit plus de jour que tout autre être vivant.", "Jedes Jahr von Pol zu Pol und zurück: Sie sieht mehr Tageslicht als jedes andere Lebewesen.",
  "De polo a polo y vuelta cada año: ve más luz del día que cualquier ser vivo.", "Da un polo all'altro e ritorno ogni anno: vede più luce del giorno di qualunque essere vivente.",
  "De polo a polo e de volta todos os anos: vê mais luz do dia do que qualquer ser vivo.", "Mula polo hanggang polo at pabalik bawat taon: mas maraming liwanag ng araw ang nakikita nito kaysa anumang buhay.",
  "ஒவ்வொரு ஆண்டும் துருவத்திலிருந்து துருவம் சென்று திரும்பும்: உயிருள்ள எதையும் விட அதிகப் பகலொளியைக் காணும்.", "Dari kutub ke kutub dan kembali setiap tahun: ia melihat lebih banyak siang daripada makhluk hidup mana pun.",
  "每年从一极飞到另一极再飞回：它见到的日光比任何活物都多。", "每年從一極飛到另一極再飛回：牠見到的日光比任何活物都多。", "毎年、極から極へ往復する。生き物の中でいちばん多くの日の光を見る。", "해마다 극에서 극까지 오간다. 살아 있는 어떤 것보다 많은 햇빛을 본다."],
"Four hundred years old, slow as the ice, and it has never once hurried.": [
  "Quatre cents ans, lent comme la glace, et il ne s'est jamais pressé une seule fois.", "Vierhundert Jahre alt, langsam wie das Eis, und er hat sich nie ein einziges Mal beeilt.",
  "Cuatrocientos años, lento como el hielo, y jamás se ha dado prisa.", "Quattrocento anni, lento come il ghiaccio, e non ha mai avuto fretta una sola volta.",
  "Quatrocentos anos, lento como o gelo, e nunca teve pressa uma única vez.", "Apatnaraang taong gulang, kasimbagal ng yelo, at kahit minsan ay hindi nagmadali.",
  "நானூறு வயது, பனி போல மெதுவு; ஒருமுறைகூட அவசரப்பட்டதில்லை.", "Berusia empat ratus tahun, lambat seperti es, dan tak pernah sekali pun terburu-buru.",
  "四百岁了，慢得像冰，从来没有着急过一次。", "四百歲了，慢得像冰，從來沒有著急過一次。", "四百歳、氷のようにのろく、一度も急いだことがない。", "사백 살, 얼음처럼 느리고, 단 한 번도 서두른 적이 없다."],
"Every few years there are millions, and every owl in the tundra eats well.": [
  "Toutes les quelques années, ils sont des millions, et chaque hibou de la toundra mange bien.", "Alle paar Jahre sind es Millionen, und jede Eule der Tundra frisst sich satt.",
  "Cada pocos años hay millones, y todos los búhos de la tundra comen bien.", "Ogni pochi anni sono milioni, e ogni gufo della tundra mangia bene.",
  "De poucos em poucos anos há milhões, e todas as corujas da tundra comem bem.", "Bawat ilang taon ay milyon-milyon sila, at busog ang bawat kuwago sa tundra.",
  "சில ஆண்டுகளுக்கு ஒருமுறை லட்சக்கணக்கில் பெருகும்; துந்திராவின் ஒவ்வொரு ஆந்தையும் நன்றாக உண்ணும்.", "Setiap beberapa tahun jumlahnya jutaan, dan setiap burung hantu di tundra makan kenyang.",
  "每隔几年就有几百万只，苔原上的每只猫头鹰都吃得饱饱的。", "每隔幾年就有幾百萬隻，苔原上的每隻貓頭鷹都吃得飽飽的。", "数年おきに何百万匹にもなり、ツンドラのフクロウはみな腹いっぱいになる。", "몇 해마다 수백만 마리가 되고, 툰드라의 올빼미는 모두 배불리 먹는다."],
"Wide hooves for snow, a nose for lichen, and a herd that never stops walking.": [
  "De larges sabots pour la neige, un nez pour le lichen, et une harde qui ne cesse jamais de marcher.", "Breite Hufe für den Schnee, eine Nase für Flechten und eine Herde, die nie stehen bleibt.",
  "Pezuñas anchas para la nieve, olfato para el liquen y una manada que nunca deja de andar.", "Zoccoli larghi per la neve, un naso per il lichene e una mandria che non smette mai di camminare.",
  "Cascos largos para a neve, faro para o líquen e uma manada que nunca para de andar.", "Malalapad na kuko para sa niyebe, ilong para sa lumot, at kawang hindi tumitigil sa paglakad.",
  "பனிக்கு அகலக் குளம்புகள், பாசிக்கு ஒரு மூக்கு, ஒருபோதும் நடையை நிறுத்தாத மந்தை.", "Kuku lebar untuk salju, hidung untuk lumut kerak, dan kawanan yang tak pernah berhenti berjalan.",
  "宽大的蹄子踏雪，灵敏的鼻子找地衣，还有一支永不停步的鹿群。", "寬大的蹄子踏雪，靈敏的鼻子找地衣，還有一支永不停步的鹿群。", "雪のための広いひづめ、地衣類を嗅ぎ当てる鼻、そして歩みを止めない群れ。", "눈을 밟는 넓은 발굽, 이끼를 찾는 코, 그리고 결코 걸음을 멈추지 않는 무리."],
"Each one is nothing. Together they feed the whole cold sea.": [
  "Chacun n'est rien. Ensemble, ils nourrissent toute la mer froide.", "Jeder einzelne ist nichts. Zusammen ernähren sie das ganze kalte Meer.",
  "Cada uno no es nada. Juntos alimentan todo el mar frío.", "Ognuno da solo è niente. Insieme nutrono tutto il mare freddo.",
  "Cada um não é nada. Juntos alimentam todo o mar frio.", "Wala ang bawat isa. Magkakasama, pinakakain nila ang buong malamig na dagat.",
  "ஒவ்வொன்றும் ஒன்றுமில்லை. ஒன்றாக, அவை குளிர்க்கடல் முழுவதற்கும் உணவளிக்கின்றன.", "Masing-masing bukan apa-apa. Bersama, mereka memberi makan seluruh laut dingin.",
  "每一只都微不足道。合在一起，它们养活了整片寒冷的海。", "每一隻都微不足道。合在一起，牠們養活了整片寒冷的海。", "一匹では何でもない。集まれば冷たい海全体を養う。", "하나하나는 아무것도 아니다. 함께라면 차가운 바다 전체를 먹여 살린다."],
"When the wolves come, the herd forms a ring, and the calves go in the middle.": [
  "Quand les loups arrivent, le troupeau forme un cercle, et les veaux vont au milieu.", "Wenn die Wölfe kommen, bildet die Herde einen Ring, und die Kälber kommen in die Mitte.",
  "Cuando llegan los lobos, la manada forma un círculo y las crías van en el centro.", "Quando arrivano i lupi, la mandria forma un cerchio e i vitelli vanno nel mezzo.",
  "Quando chegam os lobos, a manada forma um círculo e as crias vão para o meio.", "Kapag dumating ang mga lobo, bumubuo ng bilog ang kawan, at nasa gitna ang mga guya.",
  "ஓநாய்கள் வந்தால், மந்தை வட்டமாக நிற்கும்; கன்றுகள் நடுவில் செல்லும்.", "Saat serigala datang, kawanan membentuk lingkaran, dan anak-anaknya masuk ke tengah.",
  "狼群一来，牛群就围成一圈，小牛待在中间。", "狼群一來，牛群就圍成一圈，小牛待在中間。", "オオカミが来ると群れは輪になり、子どもたちは真ん中に入る。", "늑대가 오면 무리는 둥글게 원을 만들고, 송아지들은 한가운데로 들어간다."],
}

# The Admin "Pool cards" filter (bramblewood-texts.js ui.admin-pool-*): main packs.
TEXTS = {
"Pool cards ({n})": ["Cartes en réserve ({n})", "Pool-Karten ({n})", "Cartas en reserva ({n})", "Carte in riserva ({n})", "Cartas em reserva ({n})", "Mga pool card ({n})", "காத்திருப்பு அட்டைகள் ({n})", "Kartu cadangan ({n})", "候选卡牌（{n}）", "候選卡牌（{n}）", "候補カード（{n}）", "후보 카드 ({n})"],
"Unplaced candidate cards, by the map each was made for. Players never see them. Click one to place it: choose its skirmish or pack under From, then Save.": [
  "Cartes candidates pas encore placées, classées par la carte pour laquelle chacune a été faite. Les joueurs ne les voient jamais. Cliquez sur l'une pour la placer : choisissez son escarmouche ou son paquet sous Provenance, puis Enregistrez.",
  "Noch nicht platzierte Kandidaten-Karten, nach der Karte geordnet, für die jede gemacht wurde. Spieler sehen sie nie. Klicke eine an, um sie zu platzieren: wähle unter Herkunft ihr Gefecht oder Paket und speichere.",
  "Cartas candidatas sin colocar, por el mapa para el que se hizo cada una. Los jugadores nunca las ven. Haz clic en una para colocarla: elige su escaramuza o sobre en Origen y luego Guarda.",
  "Carte candidate non ancora piazzate, per la mappa per cui è stata fatta ciascuna. I giocatori non le vedono mai. Fai clic su una per piazzarla: scegli la sua schermaglia o il suo pacchetto in Provenienza, poi Salva.",
  "Cartas candidatas por colocar, pelo mapa para o qual cada uma foi feita. Os jogadores nunca as veem. Clica numa para a colocar: escolhe a sua escaramuça ou pacote em Origem e depois Guarda.",
  "Mga kandidatong card na hindi pa nailalagay, ayon sa mapang pinaggawan ng bawat isa. Hindi ito nakikita ng mga manlalaro. I-click ang isa para ilagay: piliin ang skirmish o pack nito sa Mula, saka I-save.",
  "இன்னும் வைக்கப்படாத வேட்பாளர் அட்டைகள், ஒவ்வொன்றும் உருவாக்கப்பட்ட வரைபடத்தின்படி. விளையாடுபவர்கள் இவற்றைப் பார்ப்பதே இல்லை. ஒன்றை வைக்க அதைக் கிளிக் செய்யுங்கள்: மூலம் என்பதில் அதன் சண்டை அல்லது பொதியைத் தேர்ந்தெடுத்து, சேமியுங்கள்.",
  "Kartu kandidat yang belum ditempatkan, menurut peta tempat masing-masing dibuat. Pemain tak pernah melihatnya. Klik satu untuk menempatkannya: pilih pertempuran atau paketnya di Asal, lalu Simpan.",
  "尚未放置的候选卡牌，按各自所属的地图排列。玩家永远看不到它们。点击一张即可放置：在“来源”中选择它的遭遇战或卡包，然后保存。",
  "尚未放置的候選卡牌，按各自所屬的地圖排列。玩家永遠看不到它們。點擊一張即可放置：在「來源」中選擇它的遭遇戰或卡包，然後儲存。",
  "まだ配置していない候補カード。それぞれ作られたマップごとに並ぶ。プレイヤーには見えない。クリックして配置：入手元でスカーミッシュかパックを選び、保存する。",
  "아직 배치하지 않은 후보 카드로, 각 카드가 만들어진 맵별로 정리되어 있다. 플레이어에게는 보이지 않는다. 하나를 클릭해 배치하려면 출처에서 전투나 팩을 고른 뒤 저장한다."],
"No pool cards match.": ["Aucune carte en réserve ne correspond.", "Keine Pool-Karte passt.", "Ninguna carta en reserva coincide.", "Nessuna carta in riserva corrisponde.", "Nenhuma carta em reserva corresponde.", "Walang tumugmang pool card.", "பொருந்தும் காத்திருப்பு அட்டை இல்லை.", "Tidak ada kartu cadangan yang cocok.", "没有匹配的候选卡牌。", "沒有符合的候選卡牌。", "一致する候補カードはありません。", "일치하는 후보 카드가 없다."],
"Pool": ["Réserve", "Pool", "Reserva", "Riserva", "Reserva", "Pool", "காத்திருப்பு", "Cadangan", "候选", "候選", "候補", "후보"],
"Map {n}": ["Carte {n}", "Karte {n}", "Mapa {n}", "Mappa {n}", "Mapa {n}", "Mapa {n}", "வரைபடம் {n}", "Peta {n}", "地图 {n}", "地圖 {n}", "マップ {n}", "맵 {n}"],
"skirmish reward": ["récompense d'escarmouche", "Gefechtsbelohnung", "premio de escaramuza", "premio di schermaglia", "prémio de escaramuça", "gantimpala ng skirmish", "சண்டை வெகுமதி", "hadiah pertempuran", "遭遇战奖励", "遭遇戰獎勵", "スカーミッシュ報酬", "전투 보상"],
"pack": ["paquet", "Paket", "sobre", "pacchetto", "pacote", "pack", "பொதி", "paket", "卡包", "卡包", "パック", "팩"],
}

for d in (NAMES, FLAVOR, TEXTS):
    assert all(len(v) == len(CODES) for v in d.values()), [k for k, v in d.items() if len(v) != len(CODES)]
ph = lambda s: sorted(set(re.findall(r'\{\w+\}', s)))
assert all(ph(k) == ph(t) for k, v in TEXTS.items() for t in v)


def write(rel, rows, sort):
    # sort: the main packs are kept in lower-case key order (as the dated tools write them); the card and ui packs keep their order
    # and the new keys go at the end, so the diff (and a merge with other packages) touches only the new lines.
    for i, code in enumerate(CODES):
        path = os.path.join(ROOT, rel % code)
        pack = json.load(open(path, encoding='utf-8')) if os.path.exists(path) else {}
        for en, row in rows.items(): pack[en] = row[i]
        if sort: pack = dict(sorted(pack.items(), key=lambda kv: kv[0].lower()))
        with open(path, 'w', encoding='utf-8') as fh:
            json.dump(pack, fh, ensure_ascii=False, indent=1); fh.write('\n')


if __name__ == '__main__':
    write('lang/cards/%s.json', NAMES, False)
    write('lang/ui/%s.json', FLAVOR, False)
    write('lang/%s.json', TEXTS, True)
    print('wrote', len(CODES), 'languages:', len(NAMES), 'card names,', len(FLAVOR), 'flavour lines,', len(TEXTS), 'Admin texts')
