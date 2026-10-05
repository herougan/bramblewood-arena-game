#!/usr/bin/env python3
"""Core UI translations (2026-10-05) -> lang/<code>.json.

One row per English string; columns in the order of CODES. Drafted by Claude: French, German,
Spanish, Italian, Portuguese, Indonesian and Chinese should be close to final; Tagalog, Tamil,
Japanese and Korean deserve a native speaker's read before launch (tone, game terms).
Existing lang/*.json entries are kept (so hand edits survive); rows here fill or overwrite them.

    python3 tools/i18n_core.py
"""
import json, os
ROOT = os.path.join(os.path.dirname(os.path.abspath(__file__)), '..')
CODES = ['fr', 'de', 'es', 'it', 'pt', 'tl', 'ta', 'id', 'zh-Hans', 'zh-Hant', 'ja', 'ko']
T = {
# --- header / home ---
'Sign in': ['Se connecter','Anmelden','Iniciar sesión','Accedi','Entrar','Mag-sign in','உள்நுழை','Masuk','登录','登入','ログイン','로그인'],
'Home': ['Accueil','Start','Inicio','Home','Início','Home','முகப்பு','Beranda','主页','首頁','ホーム','홈'],
'Settings': ['Paramètres','Einstellungen','Ajustes','Impostazioni','Definições','Settings','அமைப்புகள்','Pengaturan','设置','設定','設定','설정'],
'Language': ['Langue','Sprache','Idioma','Lingua','Idioma','Wika','மொழி','Bahasa','语言','語言','言語','언어'],
'Play': ['Jouer','Spielen','Jugar','Gioca','Jogar','Maglaro','விளையாடு','Main','开战','開戰','プレイ','플레이'],
'Deck': ['Deck','Deck','Mazo','Mazzo','Baralho','Deck','அடுக்கு','Dek','卡组','牌組','デッキ','덱'],
'Codex': ['Codex','Kodex','Códice','Codice','Códice','Codex','நூலகம்','Kodeks','图鉴','圖鑑','図鑑','도감'],
'Shop': ['Boutique','Laden','Tienda','Negozio','Loja','Tindahan','கடை','Toko','商店','商店','ショップ','상점'],
'Nest': ['Nid','Nest','Nido','Nido','Ninho','Pugad','கூடு','Sarang','巢穴','巢穴','巣','둥지'],
'Quests': ['Quêtes','Aufträge','Misiones','Missioni','Missões','Mga Quest','பணிகள்','Misi','任务','任務','クエスト','퀘스트'],
'Community': ['Communauté','Gemeinschaft','Comunidad','Comunità','Comunidade','Komunidad','சமூகம்','Komunitas','社区','社群','コミュニティ','커뮤니티'],
'Ranking': ['Classement','Rangliste','Clasificación','Classifica','Classificação','Ranggo','தரவரிசை','Peringkat','排行榜','排行榜','ランキング','랭킹'],
'Friends': ['Amis','Freunde','Amigos','Amici','Amigos','Mga Kaibigan','நண்பர்கள்','Teman','好友','好友','フレンド','친구'],
'Guild': ['Guilde','Gilde','Gremio','Gilda','Guilda','Guild','குழு','Guild','公会','公會','ギルド','길드'],
'Start the tutorial': ['Commencer le tutoriel','Tutorial starten','Empezar el tutorial','Inizia il tutorial','Começar o tutorial','Simulan ang tutorial','பயிற்சியைத் தொடங்கு','Mulai tutorial','开始教程','開始教學','チュートリアルを始める','튜토리얼 시작'],
# --- settings ---
'Music & ambience': ['Musique et ambiance','Musik & Atmosphäre','Música y ambiente','Musica e ambiente','Música e ambiente','Musika at paligid','இசை & சூழல் ஒலி','Musik & suasana','音乐与环境音','音樂與環境音','音楽と環境音','음악 & 환경음'],
'Sound Effects': ['Effets sonores','Soundeffekte','Efectos de sonido','Effetti sonori','Efeitos sonoros','Sound effects','ஒலி விளைவுகள்','Efek suara','音效','音效','効果音','효과음'],
'Voice': ['Voix','Stimmen','Voces','Voci','Vozes','Boses','குரல்','Suara','语音','語音','ボイス','음성'],
'Battlefield': ['Champ de bataille','Schlachtfeld','Campo de batalla','Campo di battaglia','Campo de batalha','Larangan','போர்க்களம்','Medan perang','战场','戰場','戦場','전장'],
'Battlefield background': ['Fond du champ de bataille','Schlachtfeld-Hintergrund','Fondo del campo de batalla','Sfondo del campo','Fundo do campo de batalha','Background ng larangan','போர்க்கள பின்னணி','Latar medan perang','战场背景','戰場背景','戦場の背景','전장 배경'],
'Auto (by map)': ['Auto (selon la carte)','Automatisch (je Karte)','Automático (según mapa)','Automatico (per mappa)','Automático (por mapa)','Auto (ayon sa mapa)','தானியங்கி (வரைபடப்படி)','Otomatis (sesuai peta)','自动(按地图)','自動(依地圖)','自動(マップ別)','자동 (지도별)'],
'Calm (minimal)': ['Calme (minimal)','Ruhig (minimal)','Tranquilo (mínimo)','Calmo (minimo)','Calmo (mínimo)','Payapa (simple)','அமைதி (குறைவு)','Tenang (minimal)','平静(简洁)','平靜(簡潔)','穏やか(控えめ)','차분하게 (최소)'],
'Atmosphere': ['Atmosphère','Stimmung','Atmósfera','Atmosfera','Atmosfera','Kapaligiran','சூழல்','Suasana','氛围','氛圍','雰囲気','분위기'],
'Live (your clock)': ['En direct (votre heure)','Live (deine Uhrzeit)','En vivo (tu hora)','Dal vivo (la tua ora)','Ao vivo (a sua hora)','Live (oras mo)','நேரடி (உங்கள் நேரம்)','Langsung (jam Anda)','实时(你的时间)','即時(你的時間)','ライブ(あなたの時刻)','실시간 (내 시간)'],
'Off': ['Désactivé','Aus','Desactivado','Spento','Desligado','Off','அணை','Mati','关闭','關閉','オフ','끄기'],
'On': ['Activé','An','Activado','Acceso','Ligado','On','இயக்கு','Nyala','开启','開啟','オン','켜기'],
'Golden hour': ['Heure dorée','Goldene Stunde','Hora dorada','Ora d’oro','Hora dourada','Ginintuang oras','பொன்மாலை','Jam emas','黄金时刻','黃金時刻','ゴールデンアワー','골든 아워'],
'Moonlit': ['Clair de lune','Mondschein','A la luz de la luna','Al chiaro di luna','Luar','Liwanag ng buwan','நிலவொளி','Cahaya bulan','月光','月光','月明かり','달빛'],
'Rain': ['Pluie','Regen','Lluvia','Pioggia','Chuva','Ulan','மழை','Hujan','雨天','雨天','雨','비'],
'Autumn': ['Automne','Herbst','Otoño','Autunno','Outono','Taglagas','இலையுதிர்','Musim gugur','秋天','秋天','秋','가을'],
'Shader effects': ['Effets visuels','Shader-Effekte','Efectos visuales','Effetti visivi','Efeitos visuais','Mga visual effect','காட்சி விளைவுகள்','Efek visual','画面特效','畫面特效','シェーダー効果','셰이더 효과'],
'Workshop': ['Atelier','Werkstatt','Taller','Laboratorio','Oficina','Workshop','பணிமனை','Bengkel','工坊','工坊','ワークショップ','작업실'],
# --- play tabs / conquest ---
'Conquest': ['Conquête','Eroberung','Conquista','Conquista','Conquista','Pananakop','படையெடுப்பு','Penaklukan','征服','征服','征服','정복'],
'Arena': ['Arène','Arena','Arena','Arena','Arena','Arena','அரங்கம்','Arena','竞技场','競技場','アリーナ','아레나'],
'Autobattler': ['Combat auto','Autokampf','Autobatalla','Autobattaglia','Autobatalha','Autobattler','தானியங்கிப் போர்','Autobattle','自走棋','自走棋','オートバトル','오토배틀'],
'Raid': ['Raid','Raid','Asalto','Raid','Raide','Raid','படையெடுப்புப் போர்','Raid','突袭','突襲','レイド','레이드'],
'World': ['Monde','Welt','Mundo','Mondo','Mundo','Mundo','உலகம்','Dunia','世界','世界','ワールド','월드'],
'All maps': ['Toutes les cartes','Alle Karten','Todos los mapas','Tutte le mappe','Todos os mapas','Lahat ng mapa','எல்லா வரைபடங்கள்','Semua peta','全部地图','全部地圖','すべてのマップ','모든 지도'],
'Locked': ['Verrouillé','Gesperrt','Bloqueado','Bloccato','Bloqueado','Naka-lock','பூட்டப்பட்டது','Terkunci','未解锁','未解鎖','ロック中','잠김'],
'World map': ['Carte du monde','Weltkarte','Mapa del mundo','Mappa del mondo','Mapa-múndi','Mapa ng mundo','உலக வரைபடம்','Peta dunia','世界地图','世界地圖','ワールドマップ','월드 맵'],
'Full-screen map': ['Carte plein écran','Karte im Vollbild','Mapa a pantalla completa','Mappa a schermo intero','Mapa em ecrã inteiro','Full-screen na mapa','முழுத்திரை வரைபடம்','Peta layar penuh','全屏地图','全螢幕地圖','全画面マップ','전체 화면 지도'],
'Skirmish': ['Escarmouche','Scharmützel','Escaramuza','Schermaglia','Escaramuça','Sagupaan','சிறு மோதல்','Pertempuran kecil','遭遇战','遭遇戰','小競り合い','소규모 전투'],
'Elite': ['Élite','Elite','Élite','Élite','Elite','Elite','சிறப்புப் படை','Elit','精英','精英','エリート','정예'],
'Boss': ['Boss','Boss','Jefe','Boss','Chefe','Boss','தலைவன்','Bos','首领','首領','ボス','보스'],
# --- arena ---
'Practice': ['Entraînement','Training','Práctica','Allenamento','Treino','Ensayo','பயிற்சி','Latihan','练习','練習','練習','연습'],
'Quick Battle': ['Combat rapide','Schnelles Gefecht','Batalla rápida','Battaglia rapida','Batalha rápida','Mabilisang laban','விரைவுப் போர்','Pertarungan cepat','快速对战','快速對戰','クイックバトル','빠른 전투'],
'Pass & Play': ['Chacun son tour','Abwechselnd spielen','Pasa y juega','Passa e gioca','Passa e joga','Pasa at laro','மாறி மாறி விளையாடு','Bergiliran','轮流对战','輪流對戰','交代プレイ','번갈아 플레이'],
'Two players, one device': ['Deux joueurs, un appareil','Zwei Spieler, ein Gerät','Dos jugadores, un dispositivo','Due giocatori, un dispositivo','Dois jogadores, um dispositivo','Dalawang manlalaro, isang device','இருவர், ஒரே சாதனம்','Dua pemain, satu perangkat','双人同屏','雙人同屏','2人で1台','두 명, 한 기기'],
'Challenges': ['Défis','Herausforderungen','Desafíos','Sfide','Desafios','Mga hamon','சவால்கள்','Tantangan','挑战','挑戰','チャレンジ','도전'],
'Gauntlet': ['Épreuve','Spießrutenlauf','Desafío en serie','Sfida a oltranza','Desafio em série','Gauntlet','தொடர் சவால்','Tantangan beruntun','连胜挑战','連勝挑戰','勝ち抜き戦','연승 도전'],
'Win 10 in a row': ['Gagnez 10 fois de suite','Gewinne 10 in Folge','Gana 10 seguidas','Vinci 10 di fila','Vença 10 seguidas','Manalo ng 10 sunod-sunod','தொடர்ந்து 10 வெல்லுங்கள்','Menang 10 kali beruntun','连胜10场','連勝10場','10連勝しよう','10연승하기'],
'Dungeon': ['Donjon','Verlies','Mazmorra','Dungeon','Masmorra','Piitan','நிலவறை','Ruang bawah tanah','地牢','地牢','ダンジョン','던전'],
'Enter Dungeon': ['Entrer dans le donjon','Verlies betreten','Entrar en la mazmorra','Entra nel dungeon','Entrar na masmorra','Pumasok sa piitan','நிலவறைக்குள் நுழை','Masuk ruang bawah tanah','进入地牢','進入地牢','ダンジョンに入る','던전 입장'],
'Online': ['En ligne','Online','En línea','Online','Online','Online','இணையம்','Daring','在线','線上','オンライン','온라인'],
'PvP': ['JcJ','PvP','JcJ','PvP','JxJ','PvP','PvP','PvP','对战','對戰','対人戦','PvP'],
'Ranked Live': ['Classé en direct','Ranked live','Clasificatoria en vivo','Classificata dal vivo','Ranqueada ao vivo','Ranked live','தரவரிசை நேரடி','Peringkat langsung','实时排位','即時排位','ランク戦ライブ','실시간 랭크'],
'Real players, real time': ['De vrais joueurs, en temps réel','Echte Spieler, in Echtzeit','Jugadores reales, en tiempo real','Giocatori veri, in tempo reale','Jogadores reais, em tempo real','Totoong manlalaro, totoong oras','உண்மையான வீரர்கள், நேரலையில்','Pemain nyata, waktu nyata','真人玩家,实时对战','真人玩家,即時對戰','本物のプレイヤーとリアルタイムで','실제 플레이어와 실시간으로'],
# --- battle ---
'Enemy': ['Ennemi','Gegner','Enemigo','Nemico','Inimigo','Kalaban','எதிரி','Musuh','敌方','敵方','敵','적'],
'You': ['Vous','Du','Tú','Tu','Você','Ikaw','நீங்கள்','Kamu','你','你','あなた','나'],
'Castle': ['Château','Burg','Castillo','Castello','Castelo','Kastilyo','கோட்டை','Benteng','城堡','城堡','城','성'],
'Enemy Castle': ['Château ennemi','Feindliche Burg','Castillo enemigo','Castello nemico','Castelo inimigo','Kastilyo ng kalaban','எதிரியின் கோட்டை','Benteng musuh','敌方城堡','敵方城堡','敵の城','적의 성'],
'Forfeit': ['Abandonner','Aufgeben','Rendirse','Arrenditi','Desistir','Sumuko','விட்டுக்கொடு','Menyerah','认输','認輸','降参','항복'],
'Quit': ['Quitter','Verlassen','Salir','Esci','Sair','Umalis','வெளியேறு','Keluar','退出','退出','やめる','나가기'],
'Graveyard': ['Cimetière','Friedhof','Cementerio','Cimitero','Cemitério','Libingan','கல்லறை','Kuburan','墓地','墓地','墓地','무덤'],
'Discard': ['Défausser','Abwerfen','Descartar','Scarta','Descartar','Itapon','நிராகரி','Buang','弃牌','棄牌','捨てる','버리기'],
'Pass turn': ['Passer le tour','Zug beenden','Pasar turno','Passa il turno','Passar a vez','Laktawan ang tira','முறையைத் தவிர்','Lewati giliran','跳过回合','跳過回合','ターン終了','턴 넘기기'],
'Resolving…': ['Résolution…','Wird ausgewertet…','Resolviendo…','Risoluzione…','A resolver…','Nireresolba…','கணக்கிடப்படுகிறது…','Memproses…','结算中…','結算中…','解決中…','진행 중…'],
'Battle log': ['Journal de combat','Kampfprotokoll','Registro de batalla','Registro di battaglia','Registo de batalha','Tala ng laban','போர்ப் பதிவு','Catatan pertempuran','战斗记录','戰鬥紀錄','バトルログ','전투 기록'],
'Battle Log': ['Journal de combat','Kampfprotokoll','Registro de batalla','Registro di battaglia','Registo de batalha','Tala ng laban','போர்ப் பதிவு','Catatan pertempuran','战斗记录','戰鬥紀錄','バトルログ','전투 기록'],
'Tap to skip': ['Touchez pour passer','Tippen zum Überspringen','Toca para saltar','Tocca per saltare','Toque para saltar','I-tap para laktawan','தவிர்க்கத் தட்டவும்','Ketuk untuk lewati','点击跳过','點擊跳過','タップでスキップ','탭하여 건너뛰기'],
'Play full screen': ['Jouer en plein écran','Im Vollbild spielen','Jugar a pantalla completa','Gioca a schermo intero','Jogar em ecrã inteiro','Maglaro nang full screen','முழுத்திரையில் விளையாடு','Main layar penuh','全屏游玩','全螢幕遊玩','全画面でプレイ','전체 화면으로 플레이'],
'Pass: end your turn without playing a card': ['Passer : terminez votre tour sans jouer de carte','Passen: Zug beenden, ohne eine Karte zu spielen','Pasar: termina tu turno sin jugar carta','Passa: termina il turno senza giocare carte','Passar: termine a vez sem jogar carta','Laktaw: tapusin ang tira nang walang nilalaro','தவிர்: அட்டை இல்லாமல் உங்கள் முறையை முடிக்கவும்','Lewati: akhiri giliran tanpa memainkan kartu','跳过:不出牌直接结束回合','跳過:不出牌直接結束回合','パス:カードを出さずにターンを終える','넘기기: 카드를 내지 않고 턴 종료'],
'Give up this match — it counts as a loss': ['Abandonner ce match — cela compte comme une défaite','Dieses Match aufgeben — zählt als Niederlage','Abandonar esta partida — cuenta como derrota','Abbandona la partita — conta come sconfitta','Desistir deste jogo — conta como derrota','Sumuko sa laban — bilang na talo','இந்தப் போட்டியைக் கைவிடு — தோல்வியாகக் கணக்கிடப்படும்','Menyerah — dihitung kalah','放弃本局——计为失败','放棄本局——計為失敗','この試合を降参する(敗北扱い)','이번 경기 포기 — 패배로 기록됩니다'],
# --- peoples ---
'Rivergate Legion': ['Légion de Rivergate','Legion von Rivergate','Legión de Rivergate','Legione di Rivergate','Legião de Rivergate','Hukbo ng Rivergate','ரிவர்கேட் படை','Legiun Rivergate','河门军团','河門軍團','リヴァーゲート軍団','리버게이트 군단'],
'Sunfeather Tribes': ['Tribus Plumesoleil','Sonnenfeder-Stämme','Tribus Plumasol','Tribù Piumasole','Tribos Plumasol','Mga Tribo ng Sunfeather','சூரியஇறகு குலங்கள்','Suku Bulu Mentari','日羽部族','日羽部族','陽羽の部族','햇깃 부족'],
'Road-folk': ['Gens du chemin','Wegvolk','Gente del camino','Gente della strada','Gente da estrada','Mga manlalakbay','பாதை மக்கள்','Kaum pengembara','行路人','行路人','旅の民','길손들'],
'Wild beasts': ['Bêtes sauvages','Wilde Bestien','Bestias salvajes','Bestie selvagge','Bestas selvagens','Mababangis na hayop','காட்டு விலங்குகள்','Binatang buas','野兽','野獸','野獣','야수'],
'The Hive': ['La Ruche','Der Schwarm','La Colmena','L’Alveare','A Colmeia','Ang Bahay-pukyutan','தேன்கூடு','Sarang Lebah','蜂巢','蜂巢','巣の群れ','벌집'],
'The Deep': ['Les Abysses','Die Tiefe','Las Profundidades','Gli Abissi','As Profundezas','Ang Kailaliman','ஆழ்கடல்','Laut Dalam','深渊','深淵','深淵','심해'],
'Woodland folk': ['Peuple des bois','Waldvolk','Gente del bosque','Popolo dei boschi','Povo dos bosques','Taga-kagubatan','காட்டு மக்கள்','Warga hutan','林地居民','林地居民','森の民','숲의 주민'],
# --- results ---
'You Win!': ['Victoire !','Gewonnen!','¡Has ganado!','Hai vinto!','Ganhou!','Panalo ka!','நீங்கள் வென்றீர்கள்!','Kamu menang!','你赢了!','你贏了!','勝利!','승리!'],
'So Close! Good Fight': ['Presque ! Beau combat','Knapp! Guter Kampf','¡Casi! Buena pelea','Per poco! Bella lotta','Quase! Boa luta','Muntik na! Magandang laban','மிக அருகில்! நல்ல போராட்டம்','Hampir! Pertarungan bagus','差一点!打得不错','差一點!打得不錯','惜しい!いい戦いだった','아깝다! 잘 싸웠어요'],
'Draw!': ['Égalité !','Unentschieden!','¡Empate!','Pareggio!','Empate!','Tabla!','சமநிலை!','Seri!','平局!','平手!','引き分け!','무승부!'],
'VICTORY!': ['VICTOIRE !','SIEG!','¡VICTORIA!','VITTORIA!','VITÓRIA!','TAGUMPAY!','வெற்றி!','MENANG!','胜利!','勝利!','勝利!','승리!'],
'DEFEAT': ['DÉFAITE','NIEDERLAGE','DERROTA','SCONFITTA','DERROTA','TALO','தோல்வி','KALAH','失败','失敗','敗北','패배'],
'DRAW': ['ÉGALITÉ','UNENTSCHIEDEN','EMPATE','PAREGGIO','EMPATE','TABLA','சமநிலை','SERI','平局','平手','引き分け','무승부'],
'Total Damage Dealt': ['Dégâts infligés','Verursachter Schaden','Daño infligido','Danni inflitti','Dano causado','Kabuuang pinsalang naibigay','மொத்தம் ஏற்படுத்திய சேதம்','Total kerusakan diberikan','造成的总伤害','造成的總傷害','与えた総ダメージ','가한 총 피해'],
'Total Damage Taken': ['Dégâts subis','Erlittener Schaden','Daño recibido','Danni subiti','Dano sofrido','Kabuuang pinsalang natanggap','மொத்தம் பெற்ற சேதம்','Total kerusakan diterima','受到的总伤害','受到的總傷害','受けた総ダメージ','받은 총 피해'],
'Biggest Hit': ['Plus gros coup','Größter Treffer','Golpe más fuerte','Colpo più forte','Maior golpe','Pinakamalakas na tama','மிகப்பெரிய அடி','Serangan terbesar','最高单次伤害','最高單次傷害','最大ダメージ','최대 피해'],
'Rework my deck': ['Retravailler mon deck','Mein Deck überarbeiten','Rehacer mi mazo','Rivedi il mio mazzo','Refazer o meu baralho','Ayusin ang deck ko','என் அடுக்கை மாற்று','Ubah dekku','调整我的卡组','調整我的牌組','デッキを組み直す','덱 다시 짜기'],
'Try again': ['Réessayer','Nochmal versuchen','Reintentar','Riprova','Tentar de novo','Subukan ulit','மீண்டும் முயல்','Coba lagi','再试一次','再試一次','もう一度','다시 도전'],
'Play again': ['Rejouer','Nochmal spielen','Jugar otra vez','Gioca ancora','Jogar de novo','Maglaro ulit','மீண்டும் விளையாடு','Main lagi','再来一局','再來一局','もう一度プレイ','다시 플레이'],
'See the board': ['Voir le plateau','Spielfeld ansehen','Ver el tablero','Guarda il campo','Ver o tabuleiro','Tingnan ang board','பலகையைப் பார்','Lihat papan','查看战场','查看戰場','盤面を見る','전장 보기'],
'Back to the map': ['Retour à la carte','Zurück zur Karte','Volver al mapa','Torna alla mappa','Voltar ao mapa','Bumalik sa mapa','வரைபடத்துக்குத் திரும்பு','Kembali ke peta','返回地图','返回地圖','マップに戻る','지도로 돌아가기'],
'Leave': ['Partir','Verlassen','Salir','Esci','Sair','Umalis','வெளியேறு','Keluar','离开','離開','退出','나가기'],
'Close this and look at the final board': ['Fermer et regarder le plateau final','Schließen und das Endbrett ansehen','Cerrar y ver el tablero final','Chiudi e guarda il campo finale','Fechar e ver o tabuleiro final','Isara at tingnan ang huling board','இதை மூடி இறுதிப் பலகையைப் பார்','Tutup dan lihat papan akhir','关闭并查看最终战场','關閉並查看最終戰場','閉じて最終盤面を見る','닫고 마지막 전장 보기'],
'Cards won': ['Cartes gagnées','Gewonnene Karten','Cartas ganadas','Carte vinte','Cartas ganhas','Mga nakuhang card','வென்ற அட்டைகள்','Kartu didapat','获得的卡牌','獲得的卡牌','獲得カード','획득한 카드'],
# --- shop ---
'Packs': ['Paquets','Packs','Sobres','Bustine','Pacotes','Mga pack','பொதிகள்','Paket','卡包','卡包','パック','팩'],
'Market': ['Marché','Markt','Mercado','Mercato','Mercado','Palengke','சந்தை','Pasar','市场','市集','マーケット','장터'],
'Sprout Pouch': ['Bourse de pousses','Sprossbeutel','Bolsa de brotes','Sacchetto di germogli','Bolsa de rebentos','Supot ng Usbong','முளை பை','Kantong Tunas','嫩芽袋','嫩芽袋','若芽の袋','새싹 주머니'],
'Acorn Chest': ['Coffre à glands','Eichelkiste','Cofre de bellotas','Forziere di ghiande','Baú de bolotas','Baul ng Acorn','கருவாலிப் பெட்டி','Peti Biji Ek','橡果宝箱','橡果寶箱','どんぐりの宝箱','도토리 상자'],
'Golden Bramble Case': ['Écrin de ronce dorée','Goldene Brombeerschatulle','Estuche de zarza dorada','Scrigno di rovo dorato','Estojo de silva dourada','Gintong Kahon ng Bramble','பொன் முட்செடிப் பேழை','Kotak Semak Emas','金荆棘匣','金荊棘匣','黄金のいばら箱','황금 가시덤불 상자'],
'Coming soon': ['Bientôt','Demnächst','Próximamente','Prossimamente','Em breve','Malapit na','விரைவில்','Segera hadir','即将推出','即將推出','近日公開','출시 예정'],
'Sign in to open': ['Connectez-vous pour ouvrir','Zum Öffnen anmelden','Inicia sesión para abrir','Accedi per aprire','Entre para abrir','Mag-sign in para buksan','திறக்க உள்நுழைக','Masuk untuk membuka','登录后开启','登入後開啟','ログインして開封','로그인하고 열기'],
'1 new guaranteed': ['1 nouvelle garantie','1 neue garantiert','1 nueva garantizada','1 nuova garantita','1 nova garantida','1 bagong sigurado','1 புதியது உறுதி','1 baru dijamin','保底1张新卡','保底1張新卡','新カード1枚確定','새 카드 1장 확정'],
'Maple Leaves': ['Feuilles d’érable','Ahornblätter','Hojas de arce','Foglie d’acero','Folhas de ácer','Dahon ng Maple','மேப்பிள் இலைகள்','Daun Maple','枫叶','楓葉','カエデの葉','단풍잎'],
'Gold Leaves': ['Feuilles d’or','Goldblätter','Hojas de oro','Foglie d’oro','Folhas de ouro','Gintong Dahon','பொன் இலைகள்','Daun Emas','金叶','金葉','金の葉','황금잎'],
'Price': ['Prix','Preis','Precio','Prezzo','Preço','Presyo','விலை','Harga','价格','價格','価格','가격'],
'Sign in to open packs — it\'s free.': ['Connectez-vous pour ouvrir des paquets — c’est gratuit.','Melde dich an, um Packs zu öffnen — kostenlos.','Inicia sesión para abrir sobres: es gratis.','Accedi per aprire le bustine: è gratis.','Entre para abrir pacotes — é grátis.','Mag-sign in para magbukas ng pack — libre ito.','பொதிகளைத் திறக்க உள்நுழைக — இலவசம்.','Masuk untuk membuka paket — gratis.','登录即可开卡包——免费。','登入即可開卡包——免費。','ログインしてパックを開けよう(無料)。','로그인하고 팩을 열어 보세요 — 무료예요.'],
# --- nest ---
'The Nest': ['Le Nid','Das Nest','El Nido','Il Nido','O Ninho','Ang Pugad','கூடு','Sarang','巢穴','巢穴','巣','둥지'],
'Every card you\'ve collected, all in one nest.': ['Toutes vos cartes, réunies dans un seul nid.','Alle gesammelten Karten in einem Nest.','Todas tus cartas, en un solo nido.','Tutte le carte raccolte, in un solo nido.','Todas as suas cartas, num só ninho.','Lahat ng nakolekta mong card, nasa iisang pugad.','நீங்கள் சேகரித்த எல்லா அட்டைகளும் ஒரே கூட்டில்.','Semua kartumu, dalam satu sarang.','你收集的所有卡牌都在这个巢里。','你收集的所有卡牌都在這個巢裡。','集めたカードはすべてこの巣に。','모은 카드가 모두 이 둥지에 있어요.'],
'Play Conquest': ['Jouer en Conquête','Eroberung spielen','Jugar Conquista','Gioca Conquista','Jogar Conquista','Maglaro ng Pananakop','படையெடுப்பு விளையாடு','Main Penaklukan','进行征服','進行征服','征服をプレイ','정복 플레이'],
'Open the Shop': ['Ouvrir la boutique','Laden öffnen','Abrir la tienda','Apri il negozio','Abrir a loja','Buksan ang tindahan','கடையைத் திற','Buka toko','打开商店','打開商店','ショップを開く','상점 열기'],
# --- deck ---
'New': ['Nouveau','Neu','Nuevo','Nuovo','Novo','Bago','புதிது','Baru','新建','新增','新規','새로'],
'Manage decks': ['Gérer les decks','Decks verwalten','Gestionar mazos','Gestisci mazzi','Gerir baralhos','Ayusin ang mga deck','அடுக்குகளை நிர்வகி','Kelola dek','管理卡组','管理牌組','デッキ管理','덱 관리'],
'Leader': ['Chef','Anführer','Líder','Capo','Líder','Pinuno','தலைவர்','Pemimpin','领袖','領袖','リーダー','리더'],
'Not set': ['Non défini','Nicht gesetzt','Sin elegir','Non impostato','Não definido','Wala pa','அமைக்கப்படவில்லை','Belum diatur','未设置','未設定','未設定','미설정'],
'Your Loadout': ['Votre équipement','Deine Ausrüstung','Tu equipo','Il tuo equipaggiamento','O seu equipamento','Ang iyong gamit','உங்கள் தொகுப்பு','Perlengkapanmu','你的配置','你的配置','あなたの編成','내 구성'],
'Choose your Bramble': ['Choisissez votre Ronce','Wähle deine Brombeere','Elige tu Zarza','Scegli il tuo Rovo','Escolha a sua Silva','Piliin ang iyong Bramble','உங்கள் முட்செடியைத் தேர்வு செய்','Pilih Semakmu','选择你的荆棘','選擇你的荊棘','いばらを選ぼう','가시덤불 선택'],
'Cards': ['Cartes','Karten','Cartas','Carte','Cartas','Mga card','அட்டைகள்','Kartu','卡牌','卡牌','カード','카드'],
'Missing Leader': ['Chef manquant','Anführer fehlt','Falta el líder','Manca il capo','Falta o líder','Walang pinuno','தலைவர் இல்லை','Pemimpin belum ada','缺少领袖','缺少領袖','リーダー未設定','리더 없음'],
'Your decks': ['Vos decks','Deine Decks','Tus mazos','I tuoi mazzi','Os seus baralhos','Ang mga deck mo','உங்கள் அடுக்குகள்','Dek kamu','你的卡组','你的牌組','あなたのデッキ','내 덱'],
'New deck': ['Nouveau deck','Neues Deck','Nuevo mazo','Nuovo mazzo','Novo baralho','Bagong deck','புதிய அடுக்கு','Dek baru','新卡组','新牌組','新しいデッキ','새 덱'],
'Go to Codex': ['Aller au Codex','Zum Kodex','Ir al Códice','Vai al Codice','Ir ao Códice','Pumunta sa Codex','நூலகத்துக்குச் செல்','Ke Kodeks','前往图鉴','前往圖鑑','図鑑へ','도감으로'],
'Stats': ['Stats','Werte','Estadísticas','Statistiche','Estatísticas','Stats','புள்ளிவிவரம்','Statistik','属性','屬性','ステータス','능력치'],
# --- places ---
'Armoury Tent': ['Tente de l’armurerie','Rüstzelt','Tienda de la armería','Tenda dell’armeria','Tenda do arsenal','Tolda ng Armas','ஆயுதக் கூடாரம்','Tenda Gudang Senjata','军械帐篷','軍械帳篷','武具のテント','무기고 천막'],
'The Traveller’s Cart': ['La Charrette du Voyageur','Der Karren des Reisenden','El Carro del Viajero','Il Carretto del Viandante','A Carroça do Viajante','Ang Kariton ng Manlalakbay','பயணியின் வண்டி','Gerobak Pengembara','旅人的货车','旅人的貨車','旅人の荷車','나그네의 수레'],
'The Old Nest': ['Le Vieux Nid','Das Alte Nest','El Viejo Nido','Il Vecchio Nido','O Velho Ninho','Ang Lumang Pugad','பழைய கூடு','Sarang Tua','老巢','老巢','古い巣','오래된 둥지'],
}
assert all(len(v) == len(CODES) for v in T.values()), [k for k, v in T.items() if len(v) != len(CODES)]
os.makedirs(os.path.join(ROOT, 'lang'), exist_ok=True)
for i, code in enumerate(CODES):
    path = os.path.join(ROOT, 'lang', code + '.json')
    pack = json.load(open(path, encoding='utf-8')) if os.path.exists(path) else {}
    for en, row in T.items(): pack[en] = row[i]
    with open(path, 'w', encoding='utf-8') as fh: json.dump(dict(sorted(pack.items())), fh, ensure_ascii=False, indent=1)
print('wrote', len(CODES), 'packs,', len(T), 'strings each')
