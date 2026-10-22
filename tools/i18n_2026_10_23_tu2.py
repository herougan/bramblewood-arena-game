#!/usr/bin/env python3
"""Game texts added on 2026-10-23 by package TU2 (owner answers of 00:10): the Tutorial's way out to Map 0, the tutorial fights' Bramble
Health and reward editors, the Nest's two recruit tabs (Eggs and babies, Level 0) and two new Nest tips, the Promotion page ("Coming
soon"), the Bonus Raid Ticket, and the start-map coach tip now naming T-2 (Tutorial II reads T-2 since TU-1; the old "Tap T-1" row is
replaced in every pack). Same rules as i18n_2026_10_21_ar.py: keys are the English as the page translator sees it, a leading emoji is
not part of the key, every {placeholder} is kept, a row a pack already has is left as the pack has it. Tagalog, Tamil, Japanese and
Korean deserve a native read.

    python3 tools/i18n_2026_10_23_tu2.py && python3 tools/i18n_refresh.py
"""
import json, os, re
ROOT = os.path.join(os.path.dirname(os.path.abspath(__file__)), '..')
CODES = ['fr', 'de', 'es', 'it', 'pt', 'tl', 'ta', 'id', 'zh-Hans', 'zh-Hant', 'ja', 'ko']
T = {
"To Map {n}": ["Vers la carte {n}", "Zu Karte {n}", "A el mapa {n}", "Verso la mappa {n}", "Para o mapa {n}", "Papunta sa Mapa {n}", "வரைபடம் {n}க்கு", "Ke Peta {n}", "前往地图 {n}", "前往地圖 {n}", "マップ{n}へ", "맵 {n}로"],
"Way out: on to Map {n}, {name}": [
  "Sortie : vers la carte {n}, {name}", "Ausgang: weiter zu Karte {n}, {name}", "Salida: hacia el mapa {n}, {name}", "Uscita: verso la mappa {n}, {name}",
  "Saída: para o mapa {n}, {name}", "Labasan: papunta sa Mapa {n}, {name}", "வெளிவழி: வரைபடம் {n}, {name} க்கு", "Jalan keluar: ke Peta {n}, {name}",
  "出口：前往地图 {n}，{name}", "出口：前往地圖 {n}，{name}", "出口：マップ{n}「{name}」へ", "출구: 맵 {n}, {name}(으)로"],
"Bramble Health": ["Santé du roncier", "Lebenspunkte des Dornenhags", "Salud del zarzal", "Salute del rovo", "Vida do silvado", "Buhay ng bramble", "முட்புதர் உயிர்", "Nyawa semak duri", "荆棘堡生命", "荊棘堡生命", "いばらの体力", "가시덤불 체력"],
"The rival bramble's Health in this tutorial fight. Blank: the tutorial editor's fallback.": [
  "La santé du roncier adverse dans ce combat du tutoriel. Vide : la valeur de secours de l’éditeur du tutoriel.",
  "Die Lebenspunkte des gegnerischen Dornenhags in diesem Tutorial-Kampf. Leer: der Ersatzwert des Tutorial-Editors.",
  "La salud del zarzal rival en este combate del tutorial. En blanco: el valor de reserva del editor del tutorial.",
  "La salute del rovo avversario in questo scontro del tutorial. Vuoto: il valore di riserva dell’editor del tutorial.",
  "A vida do silvado rival neste combate do tutorial. Vazio: o valor de reserva do editor do tutorial.",
  "Ang buhay ng kalabang bramble sa labang ito ng tutorial. Blangko: ang reserbang numero ng tutorial editor.",
  "இந்தப் பயிற்சிச் சண்டையில் எதிரி முட்புதரின் உயிர். காலியாக விட்டால்: பயிற்சித் தொகுப்பியின் மாற்று எண்.",
  "Nyawa semak duri lawan di pertarungan tutorial ini. Kosong: angka cadangan dari editor tutorial.",
  "这场教程战斗中对手荆棘堡的生命。留空：使用教程编辑器的备用数值。", "這場教學戰鬥中對手荊棘堡的生命。留空：使用教學編輯器的備用數值。",
  "このチュートリアル戦での相手のいばらの体力。空欄：チュートリアル編集の予備値。", "이 튜토리얼 전투에서 상대 가시덤불의 체력. 비우면: 튜토리얼 편집기의 기본값."],
"In the fight: {n} (every bramble's Health is halved)": [
  "En combat : {n} (la santé de chaque roncier est divisée par deux)", "Im Kampf: {n} (die Lebenspunkte jedes Dornenhags werden halbiert)",
  "En el combate: {n} (la salud de cada zarzal se reduce a la mitad)", "In battaglia: {n} (la salute di ogni rovo è dimezzata)",
  "No combate: {n} (a vida de cada silvado é reduzida a metade)", "Sa laban: {n} (hinahati sa dalawa ang buhay ng bawat bramble)",
  "சண்டையில்: {n} (ஒவ்வொரு முட்புதரின் உயிரும் பாதியாகும்)", "Dalam pertarungan: {n} (nyawa setiap semak duri dibagi dua)",
  "战斗中：{n}（每座荆棘堡的生命都减半）", "戰鬥中：{n}（每座荊棘堡的生命都減半）", "戦闘では：{n}（いばらの体力はすべて半分になります）", "전투에서: {n} (모든 가시덤불의 체력은 절반이 돼요)"],
"Part {n}: rival bramble Health": [
  "Partie {n} : santé du roncier adverse", "Teil {n}: Lebenspunkte des gegnerischen Dornenhags", "Parte {n}: salud del zarzal rival", "Parte {n}: salute del rovo avversario",
  "Parte {n}: vida do silvado rival", "Bahagi {n}: buhay ng kalabang bramble", "பகுதி {n}: எதிரி முட்புதர் உயிர்", "Bagian {n}: nyawa semak duri lawan",
  "第 {n} 部分：对手荆棘堡生命", "第 {n} 部分：對手荊棘堡生命", "パート{n}：相手のいばらの体力", "{n}부: 상대 가시덤불 체력"],
"Saved on that tutorial fight: the same number as its Bramble Health in Edit skirmish.": [
  "Enregistré sur ce combat du tutoriel : le même nombre que sa santé du roncier dans Modifier l’escarmouche.",
  "Wird bei diesem Tutorial-Kampf gespeichert: dieselbe Zahl wie seine Lebenspunkte des Dornenhags unter Gefecht bearbeiten.",
  "Se guarda en ese combate del tutorial: el mismo número que su salud del zarzal en Editar escaramuza.",
  "Salvato su quello scontro del tutorial: lo stesso numero della sua salute del rovo in Modifica schermaglia.",
  "Guardado nesse combate do tutorial: o mesmo número que a vida do silvado em Editar escaramuça.",
  "Naka-save sa labang iyon ng tutorial: kapareho ng Buhay ng bramble nito sa Edit skirmish.",
  "அந்தப் பயிற்சிச் சண்டையில் சேமிக்கப்படும்: சண்டையைத் திருத்து பகுதியில் உள்ள முட்புதர் உயிர் எண்ணும் இதுவே.",
  "Disimpan pada pertarungan tutorial itu: angka yang sama dengan Nyawa semak duri di Edit pertempuran.",
  "保存在那场教程战斗上：与“编辑小规模战斗”里的荆棘堡生命是同一个数。", "儲存在那場教學戰鬥上：與「編輯小規模戰鬥」裡的荊棘堡生命是同一個數。",
  "そのチュートリアル戦に保存されます：「戦闘を編集」のいばらの体力と同じ数値です。", "그 튜토리얼 전투에 저장돼요: 전투 편집의 가시덤불 체력과 같은 숫자예요."],
"Tutorial rewards saved and published.": [
  "Récompenses du tutoriel enregistrées et publiées.", "Tutorial-Belohnungen gespeichert und veröffentlicht.", "Recompensas del tutorial guardadas y publicadas.",
  "Ricompense del tutorial salvate e pubblicate.", "Recompensas do tutorial guardadas e publicadas.", "Naka-save at nailathala ang mga gantimpala ng tutorial.",
  "பயிற்சி வெகுமதிகள் சேமிக்கப்பட்டு வெளியிடப்பட்டன.", "Hadiah tutorial disimpan dan diterbitkan.", "教程奖励已保存并发布。", "教學獎勵已儲存並發布。",
  "チュートリアルの報酬を保存して公開しました。", "튜토리얼 보상을 저장하고 게시했어요."],
"Tutorial rewards saved in this browser.": [
  "Récompenses du tutoriel enregistrées dans ce navigateur.", "Tutorial-Belohnungen in diesem Browser gespeichert.", "Recompensas del tutorial guardadas en este navegador.",
  "Ricompense del tutorial salvate in questo browser.", "Recompensas do tutorial guardadas neste navegador.", "Naka-save sa browser na ito ang mga gantimpala ng tutorial.",
  "பயிற்சி வெகுமதிகள் இந்த உலாவியில் சேமிக்கப்பட்டன.", "Hadiah tutorial disimpan di browser ini.", "教程奖励已保存在此浏览器中。", "教學獎勵已儲存在此瀏覽器中。",
  "チュートリアルの報酬をこのブラウザに保存しました。", "튜토리얼 보상을 이 브라우저에 저장했어요."],
"Rewards: {name}": ["Récompenses : {name}", "Belohnungen: {name}", "Recompensas: {name}", "Ricompense: {name}", "Recompensas: {name}", "Mga gantimpala: {name}",
  "வெகுமதிகள்: {name}", "Hadiah: {name}", "奖励：{name}", "獎勵：{name}", "報酬：{name}", "보상: {name}"],
"A new player gets these cards for winning this tutorial, and they go into the starting deck.": [
  "Un nouveau joueur reçoit ces cartes en gagnant ce tutoriel, et elles rejoignent son deck de départ.",
  "Neue Spieler bekommen diese Karten für den Sieg in diesem Tutorial, und sie kommen ins Startdeck.",
  "Quien empieza recibe estas cartas al ganar este tutorial, y van a su mazo inicial.",
  "Un nuovo giocatore riceve queste carte vincendo questo tutorial, e finiscono nel mazzo iniziale.",
  "Um jogador novo recebe estas cartas ao vencer este tutorial, e elas entram no baralho inicial.",
  "Makukuha ng bagong manlalaro ang mga card na ito sa pagkapanalo sa tutorial na ito, at mapupunta sila sa panimulang deck.",
  "இந்தப் பயிற்சியை வென்றால் புதிய வீரர் இந்த அட்டைகளைப் பெறுவார்; அவை தொடக்க அடுக்கில் சேரும்.",
  "Pemain baru mendapat kartu-kartu ini karena memenangkan tutorial ini, dan kartunya masuk ke dek awal.",
  "新玩家赢下这场教程就会得到这些卡牌，它们会加入初始卡组。", "新玩家贏下這場教學就會得到這些卡牌，它們會加入初始卡組。",
  "新しいプレイヤーはこのチュートリアルに勝つとこれらのカードを受け取り、最初のデッキに入ります。", "새 플레이어는 이 튜토리얼에서 이기면 이 카드들을 받고, 시작 덱에 들어가요."],
"A new player gets these cards for winning this tutorial, by the side they picked.": [
  "Un nouveau joueur reçoit ces cartes en gagnant ce tutoriel, selon le camp choisi.",
  "Neue Spieler bekommen diese Karten für den Sieg in diesem Tutorial, je nach gewählter Seite.",
  "Quien empieza recibe estas cartas al ganar este tutorial, según el bando que eligió.",
  "Un nuovo giocatore riceve queste carte vincendo questo tutorial, in base alla fazione scelta.",
  "Um jogador novo recebe estas cartas ao vencer este tutorial, conforme o lado que escolheu.",
  "Makukuha ng bagong manlalaro ang mga card na ito sa pagkapanalo sa tutorial na ito, ayon sa panig na pinili niya.",
  "இந்தப் பயிற்சியை வென்றால், புதிய வீரர் தேர்ந்தெடுத்த பக்கத்தைப் பொறுத்து இந்த அட்டைகளைப் பெறுவார்.",
  "Pemain baru mendapat kartu-kartu ini karena memenangkan tutorial ini, sesuai pihak yang dipilihnya.",
  "新玩家赢下这场教程就会得到这些卡牌，按所选阵营而定。", "新玩家贏下這場教學就會得到這些卡牌，依所選陣營而定。",
  "新しいプレイヤーはこのチュートリアルに勝つと、選んだ陣営に応じてこれらのカードを受け取ります。", "새 플레이어는 이 튜토리얼에서 이기면 고른 진영에 따라 이 카드들을 받아요."],
"Changes go live for every player.": [
  "Les changements s’appliquent à tous les joueurs.", "Änderungen gelten sofort für alle Spieler.", "Los cambios se aplican a todos los jugadores.",
  "Le modifiche valgono subito per tutti i giocatori.", "As alterações aplicam-se a todos os jogadores.", "Agad na para sa lahat ng manlalaro ang mga pagbabago.",
  "மாற்றங்கள் எல்லா வீரர்களுக்கும் உடனே பொருந்தும்.", "Perubahan langsung berlaku untuk semua pemain.", "更改会对所有玩家生效。", "變更會對所有玩家生效。",
  "変更はすべてのプレイヤーに反映されます。", "변경 사항이 모든 플레이어에게 적용돼요."],
"Changes stay in this browser (sign in as an admin to publish them).": [
  "Les changements restent dans ce navigateur (connectez-vous en admin pour les publier).", "Änderungen bleiben in diesem Browser (als Admin anmelden, um sie zu veröffentlichen).",
  "Los cambios se quedan en este navegador (inicia sesión como admin para publicarlos).", "Le modifiche restano in questo browser (accedi come admin per pubblicarle).",
  "As alterações ficam neste navegador (entra como admin para as publicar).", "Mananatili sa browser na ito ang mga pagbabago (mag-sign in bilang admin para mailathala).",
  "மாற்றங்கள் இந்த உலாவியிலேயே இருக்கும் (வெளியிட நிர்வாகியாக உள்நுழையுங்கள்).", "Perubahan tetap di browser ini (masuk sebagai admin untuk menerbitkannya).",
  "更改只保存在此浏览器中（以管理员身份登录才能发布）。", "變更只儲存在此瀏覽器中（以管理員身分登入才能發布）。",
  "変更はこのブラウザにだけ残ります（公開するには管理者でサインイン）。", "변경 사항은 이 브라우저에만 남아요(게시하려면 관리자로 로그인하세요)."],
"Picked Otters": ["Choix : Loutres", "Otter gewählt", "Eligió Nutrias", "Scelta: Lontre", "Escolheu Lontras", "Pinili ang Otters", "நீர்நாய்களைத் தேர்ந்தவர்", "Memilih Berang-berang", "选了水獭", "選了水獺", "カワウソを選んだ場合", "수달을 고른 경우"],
"Picked Hummingbirds": ["Choix : Colibris", "Kolibris gewählt", "Eligió Colibríes", "Scelta: Colibrì", "Escolheu Beija-flores", "Pinili ang Hummingbirds", "ரீங்காரப் பறவைகளைத் தேர்ந்தவர்", "Memilih Kolibri", "选了蜂鸟", "選了蜂鳥", "ハチドリを選んだ場合", "벌새를 고른 경우"],
"Picked both": ["Choix : les deux", "Beide gewählt", "Eligió ambos", "Scelta: entrambi", "Escolheu ambos", "Pinili ang dalawa", "இரண்டையும் தேர்ந்தவர்", "Memilih keduanya", "两边都选", "兩邊都選", "両方を選んだ場合", "둘 다 고른 경우"],
"No reward cards yet.": ["Pas encore de cartes en récompense.", "Noch keine Belohnungskarten.", "Aún no hay cartas de recompensa.", "Ancora nessuna carta in ricompensa.", "Ainda não há cartas de recompensa.",
  "Wala pang gantimpalang card.", "இன்னும் வெகுமதி அட்டைகள் இல்லை.", "Belum ada kartu hadiah.", "还没有奖励卡牌。", "還沒有獎勵卡牌。", "報酬カードはまだありません。", "아직 보상 카드가 없어요."],
"Eggs and babies": ["Œufs et petits", "Eier und Junge", "Huevos y crías", "Uova e cuccioli", "Ovos e crias", "Mga itlog at anak", "முட்டைகளும் குட்டிகளும்", "Telur dan anak", "蛋和幼崽", "蛋和幼崽", "卵と赤ちゃん", "알과 새끼"],
"Level 0": ["Niveau 0", "Stufe 0", "Nivel 0", "Livello 0", "Nível 0", "Antas 0", "நிலை 0", "Level 0", "0 级", "0 級", "レベル0", "레벨 0"],
"Eggs and babies: {n}": ["Œufs et petits : {n}", "Eier und Junge: {n}", "Huevos y crías: {n}", "Uova e cuccioli: {n}", "Ovos e crias: {n}", "Mga itlog at anak: {n}",
  "முட்டைகளும் குட்டிகளும்: {n}", "Telur dan anak: {n}", "蛋和幼崽：{n}", "蛋和幼崽：{n}", "卵と赤ちゃん：{n}", "알과 새끼: {n}"],
"Level 0 cards: {n}": ["Cartes de niveau 0 : {n}", "Karten auf Stufe 0: {n}", "Cartas de nivel 0: {n}", "Carte di livello 0: {n}", "Cartas de nível 0: {n}", "Mga card na Antas 0: {n}",
  "நிலை 0 அட்டைகள்: {n}", "Kartu Level 0: {n}", "0 级卡牌：{n}", "0 級卡牌：{n}", "レベル0のカード：{n}", "레벨 0 카드: {n}"],
"A nest trains a Level 0 card to Level 1 with 🦴 Kibble. You have 🦴 {kibble}.": [
  "Un nid entraîne une carte de niveau 0 au niveau 1 avec des 🦴 croquettes. Vous en avez 🦴 {kibble}.",
  "Ein Nest trainiert eine Karte von Stufe 0 auf Stufe 1, mit 🦴 Futter. Du hast 🦴 {kibble}.",
  "Un nido entrena una carta de nivel 0 hasta el nivel 1 con 🦴 pienso. Tienes 🦴 {kibble}.",
  "Un nido allena una carta dal livello 0 al livello 1 con 🦴 crocchette. Ne hai 🦴 {kibble}.",
  "Um ninho treina uma carta de nível 0 até ao nível 1 com 🦴 ração. Tens 🦴 {kibble}.",
  "Sinasanay ng pugad ang card na Antas 0 hanggang Antas 1 gamit ang 🦴 Kibble. Mayroon kang 🦴 {kibble}.",
  "ஒரு கூடு 🦴 தீவனத்துடன் நிலை 0 அட்டையை நிலை 1 வரை பயிற்றுவிக்கும். உங்களிடம் 🦴 {kibble} உள்ளது.",
  "Sarang melatih kartu Level 0 ke Level 1 dengan 🦴 Kibble. Kamu punya 🦴 {kibble}.",
  "巢用 🦴 狗粮把 0 级卡牌训练到 1 级。你有 🦴 {kibble}。", "巢用 🦴 狗糧把 0 級卡牌訓練到 1 級。你有 🦴 {kibble}。",
  "巣は 🦴 キブルでレベル0のカードをレベル1に育てます。手持ちは 🦴 {kibble}。", "둥지는 🦴 사료로 레벨 0 카드를 레벨 1로 키워요. 가진 양: 🦴 {kibble}."],
"Train one": ["En entraîner une", "Eine trainieren", "Entrenar una", "Allenane una", "Treinar uma", "Magsanay ng isa", "ஒன்றைப் பயிற்றுவி", "Latih satu", "训练一张", "訓練一張", "1枚育てる", "하나 키우기"],
"No Level 0 cards right now. Fresh hatchlings, Base cards and new faction cards wait here until a nest trains them.": [
  "Aucune carte de niveau 0 pour l’instant. Les nouveau-nés, les cartes de base et les nouvelles cartes de faction attendent ici qu’un nid les entraîne.",
  "Gerade keine Karten auf Stufe 0. Frisch Geschlüpfte, Basiskarten und neue Fraktionskarten warten hier, bis ein Nest sie trainiert.",
  "Ahora no hay cartas de nivel 0. Las crías recién nacidas, las cartas básicas y las nuevas cartas de facción esperan aquí a que un nido las entrene.",
  "Al momento nessuna carta di livello 0. I nuovi nati, le carte base e le nuove carte di fazione aspettano qui che un nido le alleni.",
  "Agora não há cartas de nível 0. Crias acabadas de nascer, cartas base e novas cartas de fação esperam aqui até um ninho as treinar.",
  "Walang card na Antas 0 ngayon. Naghihintay rito ang mga bagong pisa, Base card at bagong faction card hanggang sanayin ng pugad.",
  "இப்போது நிலை 0 அட்டைகள் இல்லை. புதிதாகப் பொரித்தவை, அடிப்படை அட்டைகள், புதிய அணி அட்டைகள் ஒரு கூடு பயிற்றுவிக்கும் வரை இங்கே காத்திருக்கும்.",
  "Belum ada kartu Level 0 sekarang. Anak yang baru menetas, kartu Dasar, dan kartu faksi baru menunggu di sini sampai sarang melatihnya.",
  "现在没有 0 级卡牌。刚孵出的幼崽、基础卡牌和新的阵营卡牌会在这里等巢来训练。", "現在沒有 0 級卡牌。剛孵出的幼崽、基礎卡牌和新的陣營卡牌會在這裡等巢來訓練。",
  "今はレベル0のカードがありません。生まれたての子、ベースカード、新しい陣営カードは、巣が育てるまでここで待ちます。",
  "지금은 레벨 0 카드가 없어요. 갓 태어난 새끼, 기본 카드, 새 진영 카드는 둥지가 키울 때까지 여기서 기다려요."],
"Coming soon": ["Bientôt", "Demnächst", "Próximamente", "Prossimamente", "Em breve", "Malapit na", "விரைவில்", "Segera hadir", "即将推出", "即將推出", "近日公開", "곧 공개"],
"Promotion": ["Promotion", "Beförderung", "Promoción", "Promozione", "Promoção", "Promosyon", "பதவி உயர்வு", "Promosi", "晋升", "晉升", "昇格", "승급"],
"Turning a card into a different card will have its own page. It isn't built yet.": [
  "Transformer une carte en une autre aura sa propre page. Elle n’existe pas encore.", "Eine Karte in eine andere verwandeln bekommt eine eigene Seite. Die gibt es noch nicht.",
  "Convertir una carta en otra tendrá su propia página. Aún no está hecha.", "Trasformare una carta in un’altra avrà una pagina tutta sua. Non è ancora pronta.",
  "Transformar uma carta noutra terá a sua própria página. Ainda não está feita.", "Magkakaroon ng sariling pahina ang paggawa ng card na ibang card. Hindi pa ito nagagawa.",
  "ஒரு அட்டையை வேறு அட்டையாக மாற்றுவதற்குத் தனிப் பக்கம் வரும். அது இன்னும் உருவாக்கப்படவில்லை.", "Mengubah kartu menjadi kartu lain akan punya halaman sendiri. Belum dibuat.",
  "把一张卡变成另一张卡会有自己的页面，现在还没做好。", "把一張卡變成另一張卡會有自己的頁面，現在還沒做好。", "カードを別のカードに変える機能は専用ページになります。まだできていません。", "카드를 다른 카드로 바꾸는 기능은 따로 페이지가 생겨요. 아직 만들어지지 않았어요."],
"See the Promotion page": ["Voir la page Promotion", "Zur Seite Beförderung", "Ver la página de Promoción", "Vedi la pagina Promozione", "Ver a página Promoção", "Tingnan ang pahina ng Promosyon",
  "பதவி உயர்வுப் பக்கத்தைப் பார்", "Lihat halaman Promosi", "查看晋升页面", "查看晉升頁面", "昇格ページを見る", "승급 페이지 보기"],
"Promotion will turn a card you have raised into a different card. Which cards, what it costs and what happens to the old card are not decided yet.": [
  "La promotion transformera une carte que vous avez fait progresser en une autre carte. Quelles cartes, à quel prix et ce que devient l’ancienne carte : rien n’est encore décidé.",
  "Die Beförderung macht aus einer Karte, die du aufgewertet hast, eine andere Karte. Welche Karten, was es kostet und was mit der alten Karte passiert, ist noch nicht entschieden.",
  "La promoción convertirá una carta que hayas subido en otra carta distinta. Qué cartas, cuánto cuesta y qué pasa con la carta anterior aún no está decidido.",
  "La promozione trasformerà una carta che hai potenziato in una carta diversa. Quali carte, quanto costa e cosa succede alla vecchia carta non è ancora deciso.",
  "A promoção vai transformar uma carta que fizeste evoluir numa carta diferente. Que cartas, quanto custa e o que acontece à carta antiga ainda não está decidido.",
  "Gagawin ng Promosyon ang card na pinalakas mo na isang ibang card. Hindi pa napagpapasyahan kung aling mga card, magkano, at ano ang mangyayari sa lumang card.",
  "நீங்கள் வளர்த்த ஒரு அட்டையை பதவி உயர்வு வேறொரு அட்டையாக மாற்றும். எந்த அட்டைகள், என்ன செலவு, பழைய அட்டைக்கு என்ன ஆகும் என்பவை இன்னும் முடிவாகவில்லை.",
  "Promosi akan mengubah kartu yang sudah kamu tingkatkan menjadi kartu lain. Kartu mana, berapa biayanya, dan apa yang terjadi pada kartu lama belum diputuskan.",
  "晋升会把你培养过的一张卡变成另一张卡。哪些卡、花费多少、旧卡会怎样，都还没有决定。", "晉升會把你培養過的一張卡變成另一張卡。哪些卡、花費多少、舊卡會怎樣，都還沒有決定。",
  "昇格は、育てたカードを別のカードに変える機能です。対象のカード、費用、元のカードがどうなるかは、まだ決まっていません。",
  "승급은 키운 카드를 다른 카드로 바꿔 줘요. 어떤 카드인지, 비용은 얼마인지, 원래 카드는 어떻게 되는지는 아직 정해지지 않았어요."],
"Nothing here can be used yet, and none of your cards change.": [
  "Rien ici n’est encore utilisable, et aucune de vos cartes ne change.", "Hier lässt sich noch nichts benutzen, und keine deiner Karten ändert sich.",
  "Aquí aún no se puede usar nada, y ninguna de tus cartas cambia.", "Qui non si può ancora usare nulla, e nessuna delle tue carte cambia.",
  "Ainda não dá para usar nada aqui, e nenhuma das tuas cartas muda.", "Wala pang magagamit dito, at walang card mo ang magbabago.",
  "இங்கே இன்னும் எதையும் பயன்படுத்த முடியாது; உங்கள் அட்டைகள் எதுவும் மாறாது.", "Belum ada yang bisa dipakai di sini, dan tidak ada kartumu yang berubah.",
  "这里还不能使用任何功能，你的卡牌也不会改变。", "這裡還不能使用任何功能，你的卡牌也不會改變。", "ここではまだ何も使えません。あなたのカードも変わりません。", "여기서는 아직 아무것도 쓸 수 없고, 카드도 바뀌지 않아요."],
"Bonus Raid Ticket": ["Ticket de raid bonus", "Bonus-Raidticket", "Ticket de incursión extra", "Biglietto raid bonus", "Bilhete de raide bónus", "Bonus na Raid Ticket", "போனஸ் ரெய்டு டிக்கெட்", "Tiket Raid Bonus", "奖励突袭券", "獎勵突襲券", "ボーナスレイドチケット", "보너스 레이드 티켓"],
"Paid by a fallen raid when your total raid rank was high. Use it for an extra raid fight.": [
  "Offert par un raid vaincu quand votre rang de raid total était élevé. Utilisez-le pour un combat de raid en plus.",
  "Gibt es von einem gefallenen Raid, wenn dein Gesamt-Raidrang hoch war. Nutze es für einen zusätzlichen Raidkampf.",
  "Lo paga una incursión caída cuando tu rango total de incursión era alto. Úsalo para un combate de incursión extra.",
  "Lo paga un raid caduto quando il tuo grado raid totale era alto. Usalo per uno scontro raid in più.",
  "Pago por um raide derrubado quando a tua patente total de raide era alta. Usa-o para um combate de raide extra.",
  "Ibinibigay ng natumbang raid kapag mataas ang kabuuang raid rank mo. Gamitin para sa dagdag na laban sa raid.",
  "உங்கள் மொத்த ரெய்டு தரம் உயர்வாக இருந்தபோது வீழ்ந்த ரெய்டு தருவது. கூடுதல் ரெய்டு சண்டைக்குப் பயன்படுத்துங்கள்.",
  "Diberikan oleh raid yang tumbang saat peringkat raid totalmu tinggi. Pakai untuk satu pertarungan raid tambahan.",
  "突袭被击败时，若你的突袭总评级很高就会获得。可用于多打一场突袭战。", "突襲被擊敗時，若你的突襲總評級很高就會獲得。可用於多打一場突襲戰。",
  "レイドが倒れたとき、合計レイドランクが高いともらえます。レイド戦を1回多く戦えます。", "레이드가 쓰러졌을 때 총 레이드 랭크가 높으면 받아요. 레이드 전투를 한 번 더 할 수 있어요."],
"A Bonus Raid Ticket for your raid rank: one extra raid fight.": [
  "Un ticket de raid bonus pour votre rang de raid : un combat de raid en plus.", "Ein Bonus-Raidticket für deinen Raidrang: ein zusätzlicher Raidkampf.",
  "Un ticket de incursión extra por tu rango de incursión: un combate de incursión más.", "Un biglietto raid bonus per il tuo grado raid: uno scontro raid in più.",
  "Um bilhete de raide bónus pela tua patente de raide: um combate de raide extra.", "Isang Bonus na Raid Ticket para sa raid rank mo: isang dagdag na laban sa raid.",
  "உங்கள் ரெய்டு தரத்திற்காக ஒரு போனஸ் ரெய்டு டிக்கெட்: ஒரு கூடுதல் ரெய்டு சண்டை.", "Satu Tiket Raid Bonus untuk peringkat raidmu: satu pertarungan raid tambahan.",
  "因突袭评级获得一张奖励突袭券：可多打一场突袭战。", "因突襲評級獲得一張獎勵突襲券：可多打一場突襲戰。", "レイドランクのボーナスレイドチケット：レイド戦を1回多く戦えます。", "레이드 랭크 보상으로 보너스 레이드 티켓: 레이드 전투 한 번 더."],
"Eggs and babies grow in the nests. Level 0 cards wait under 🌱 Level 0.": [
  "Les œufs et les petits grandissent dans les nids. Les cartes de niveau 0 attendent sous 🌱 Niveau 0.",
  "Eier und Junge wachsen in den Nestern. Karten auf Stufe 0 warten unter 🌱 Stufe 0.",
  "Los huevos y las crías crecen en los nidos. Las cartas de nivel 0 esperan en 🌱 Nivel 0.",
  "Uova e cuccioli crescono nei nidi. Le carte di livello 0 aspettano in 🌱 Livello 0.",
  "Os ovos e as crias crescem nos ninhos. As cartas de nível 0 esperam em 🌱 Nível 0.",
  "Lumalaki sa mga pugad ang mga itlog at anak. Naghihintay ang mga card na Antas 0 sa 🌱 Antas 0.",
  "முட்டைகளும் குட்டிகளும் கூடுகளில் வளரும். நிலை 0 அட்டைகள் 🌱 நிலை 0 இல் காத்திருக்கும்.",
  "Telur dan anak tumbuh di sarang. Kartu Level 0 menunggu di 🌱 Level 0.",
  "蛋和幼崽在巢里长大。0 级卡牌在 🌱 0 级 里等着。", "蛋和幼崽在巢裡長大。0 級卡牌在 🌱 0 級 裡等著。",
  "卵と赤ちゃんは巣で育ちます。レベル0のカードは 🌱 レベル0 で待っています。", "알과 새끼는 둥지에서 자라요. 레벨 0 카드는 🌱 레벨 0 에서 기다려요."],
"A nest and some Kibble train a Level 0 card to Level 1. The Forge takes it from there.": [
  "Un nid et quelques croquettes font passer une carte du niveau 0 au niveau 1. La Forge prend la suite.",
  "Ein Nest und etwas Futter bringen eine Karte von Stufe 0 auf Stufe 1. Danach übernimmt die Schmiede.",
  "Un nido y algo de pienso llevan una carta del nivel 0 al 1. Después se encarga la Forja.",
  "Un nido e qualche crocchetta portano una carta dal livello 0 al livello 1. Poi ci pensa la Forgia.",
  "Um ninho e alguma ração levam uma carta do nível 0 ao nível 1. Depois, a Forja trata do resto.",
  "Ang pugad at kaunting Kibble ang nagsasanay sa card na Antas 0 hanggang Antas 1. Ang Forge na ang bahala pagkatapos.",
  "ஒரு கூடும் சிறிது தீவனமும் நிலை 0 அட்டையை நிலை 1 ஆக்கும். அதன் பிறகு பட்டறை பார்த்துக்கொள்ளும்.",
  "Sarang dan sedikit Kibble melatih kartu Level 0 ke Level 1. Setelah itu, Tempa yang melanjutkan.",
  "巢加一点狗粮就能把 0 级卡牌训练到 1 级，之后交给锻造炉。", "巢加一點狗糧就能把 0 級卡牌訓練到 1 級，之後交給鍛造爐。",
  "巣と少しのキブルで、レベル0のカードがレベル1になります。その先は鍛冶場の出番です。", "둥지와 사료 조금이면 레벨 0 카드가 레벨 1이 돼요. 그다음은 대장간이 맡아요."],
"Tap T-2, then press ⚔️ Fight.": [
  "Touchez T-2, puis appuyez sur ⚔️ Combattre.", "Tippe auf T-2 und drück dann ⚔️ Kämpfen.", "Toca T-2 y luego pulsa ⚔️ Luchar.", "Tocca T-2, poi premi ⚔️ Combatti.",
  "Toca em T-2 e depois carrega em ⚔️ Lutar.", "I-tap ang T-2, tapos pindutin ang ⚔️ Lumaban.", "T-2 ஐத் தட்டி, பிறகு ⚔️ சண்டை அழுத்துங்கள்.", "Ketuk T-2, lalu tekan ⚔️ Bertarung.",
  "点 T-2，然后按 ⚔️ 战斗。", "點 T-2，然後按 ⚔️ 戰鬥。", "T-2 をタップして、⚔️ バトルを押しましょう。", "T-2 을 탭하고 ⚔️ 전투를 눌러요."],
}
RETIRED = ["Tap T-1, then press ⚔️ Fight."]  # Tutorial II reads T-2 now (TU-1)
assert all(len(v) == len(CODES) for v in T.values()), [k for k, v in T.items() if len(v) != len(CODES)]
ph = lambda s: sorted(set(re.findall(r'\{\w+\}', s)))
assert all(ph(k) == ph(t) for k, v in T.items() for t in v), [(k, t) for k, v in T.items() for t in v if ph(k) != ph(t)]
if __name__ == '__main__':
    kept = 0
    for i, code in enumerate(CODES):
        path = os.path.join(ROOT, 'lang', code + '.json')
        ui = os.path.join(ROOT, 'lang', 'ui', code + '.json')
        pack = json.load(open(path, encoding='utf-8')) if os.path.exists(path) else {}
        uipack = json.load(open(ui, encoding='utf-8')) if os.path.exists(ui) else {}
        for en in RETIRED: pack.pop(en, None)
        for en, row in T.items():
            if en in pack or en in uipack: kept += 1; continue  # the pack's own wording stays
            pack[en] = row[i]
        with open(path, 'w', encoding='utf-8') as fh:
            json.dump(pack, fh, ensure_ascii=False, indent=1); fh.write('\n')
    print('wrote', len(CODES), 'packs,', len(T), 'strings each;', kept, 'rows a pack already had were kept')
