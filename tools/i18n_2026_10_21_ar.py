#!/usr/bin/env python3
"""Game texts added on 2026-10-21 by package AR (owner 22:41 on the Arena page): the Arena's sign, loading and error states, the two
PvP buttons and their tips, the Standard deck chip, today's field, the modes heading; the Daily Dungeons' group dungeon slot; the
Profile's match log; the admin raid tickets; and the Undercroft (the Arena's old Dungeon, now a daily dungeon under Map 11). The
rules for a template row are those of i18n_2026_10_18d.py (every {placeholder} kept; a leading emoji is not part of the key). Keys are
the English, as the page translator sees them. A row a pack already has (in lang/<code>.json or lang/ui/<code>.json: "The Arena",
"Coming soon", "Classic rules today." ...) is left as the pack has it. The words follow the packs (JcJ, 対人戦, 对战 for PvP; Deck
standard / Standarddeck / 标准卡组; Donjons quotidiens / デイリーダンジョン; Tickets de raid / 突袭券). Same caveats as i18n_core.py
(Tagalog, Tamil, Japanese and Korean deserve a native read).

    python3 tools/i18n_2026_10_21_ar.py && python3 tools/i18n_refresh.py
"""
import json, os, re
ROOT = os.path.join(os.path.dirname(os.path.abspath(__file__)), '..')
CODES = ['fr', 'de', 'es', 'it', 'pt', 'tl', 'ta', 'id', 'zh-Hans', 'zh-Hant', 'ja', 'ko']
T = {
"The Arena": ["L’Arène", "Die Arena", "La Arena", "L’Arena", "A Arena", "Ang Arena", "அரங்கம்", "Arena", "竞技场", "競技場", "アリーナ", "투기장"],
"Raking the sand…": [
  "On ratisse le sable…", "Der Sand wird geharkt …", "Rastrillando la arena…", "Si rastrella la sabbia…", "A alisar a areia…",
  "Sinusuyod ang buhangin…", "மணல் சீர்செய்யப்படுகிறது…", "Meratakan pasir…", "正在耙平沙地…", "正在耙平沙地…", "砂をならしています…", "모래를 고르는 중…"],
"The Arena didn't draw properly.": [
  "L’Arène ne s’est pas affichée correctement.", "Die Arena wurde nicht richtig angezeigt.", "La Arena no se mostró bien.", "L’Arena non si è visualizzata bene.",
  "A Arena não apareceu como devia.", "Hindi naipakita nang maayos ang Arena.", "அரங்கம் சரியாகக் காட்டப்படவில்லை.", "Arena tidak tampil dengan benar.",
  "竞技场没有正确显示。", "競技場沒有正確顯示。", "アリーナがうまく表示されませんでした。", "투기장을 제대로 표시하지 못했어요."],
"Your decks are safe. Try again, or come back in a moment.": [
  "Vos decks ne risquent rien. Réessayez, ou revenez dans un instant.", "Deinen Decks ist nichts passiert. Versuch es nochmal oder komm gleich wieder.",
  "Tus mazos están a salvo. Vuelve a intentarlo o regresa en un momento.", "I tuoi mazzi sono al sicuro. Riprova, o torna tra un momento.",
  "Os teus baralhos estão a salvo. Tenta de novo ou volta daqui a pouco.", "Ligtas ang mga deck mo. Subukan ulit, o bumalik mamaya.",
  "உங்கள் அடுக்குகள் பாதுகாப்பாக உள்ளன. மீண்டும் முயலுங்கள், அல்லது சற்று நேரம் கழித்து வாருங்கள்.", "Dek-mu aman. Coba lagi, atau kembali sebentar lagi.",
  "你的卡组安然无恙。再试一次，或者稍后再来。", "你的卡組安然無恙。再試一次，或者稍後再來。", "デッキは無事です。もう一度試すか、少ししてから来てください。", "덱은 무사해요. 다시 시도하거나 잠시 후에 다시 오세요."],
"Classic rules today.": [
  "Règles classiques aujourd’hui.", "Heute klassische Regeln.", "Hoy, reglas clásicas.", "Oggi regole classiche.", "Hoje, regras clássicas.",
  "Klasikong patakaran ngayon.", "இன்று வழக்கமான விதிகள்.", "Aturan klasik hari ini.", "今天是经典规则。", "今天是經典規則。", "今日はクラシックルール。", "오늘은 기본 규칙이에요."],
"PvP tickets: up to {cap}, one more every hour. Each PvP match uses one.": [
  "Tickets JcJ : jusqu’à {cap}, un de plus chaque heure. Chaque match JcJ en utilise un.", "PvP-Tickets: bis zu {cap}, jede Stunde einer mehr. Jedes PvP-Match braucht einen.",
  "Tickets PvP: hasta {cap}, uno más cada hora. Cada partida PvP usa uno.", "Biglietti PvP: fino a {cap}, uno in più ogni ora. Ogni partita PvP ne usa uno.",
  "Bilhetes PvP: até {cap}, mais um a cada hora. Cada partida PvP usa um.", "Mga PvP ticket: hanggang {cap}, may dagdag na isa bawat oras. Isa ang gamit ng bawat PvP na laban.",
  "PvP டிக்கெட்டுகள்: {cap} வரை, ஒவ்வொரு மணி நேரமும் ஒன்று கூடும். ஒவ்வொரு PvP போட்டிக்கும் ஒன்று.", "Tiket PvP: sampai {cap}, bertambah satu setiap jam. Setiap pertandingan PvP memakai satu.",
  "对战券：最多 {cap} 张，每小时多一张。每场对战用一张。", "對戰券：最多 {cap} 張，每小時多一張。每場對戰用一張。", "対人戦チケット：最大{cap}枚、1時間ごとに1枚増えます。1試合に1枚使います。", "PvP 티켓: 최대 {cap}장, 한 시간마다 한 장씩 늘어나요. PvP 한 판에 한 장을 써요."],
"Collection PvP": ["JcJ Collection", "Sammlungs-PvP", "PvP de colección", "PvP Collezione", "PvP de coleção", "PvP ng koleksiyon", "சேகரிப்பு PvP", "PvP Koleksi", "收藏对战", "收藏對戰", "コレクション対人戦", "컬렉션 PvP"],
"Your cards and decks": [
  "Vos cartes et vos decks", "Deine Karten und Decks", "Tus cartas y mazos", "Le tue carte e i tuoi mazzi", "As tuas cartas e baralhos", "Ang mga card at deck mo",
  "உங்கள் அட்டைகளும் அடுக்குகளும்", "Kartu dan dekmu", "你的卡牌和卡组", "你的卡牌和卡組", "自分のカードとデッキ", "내 카드와 덱"],
"A stranger's deck from your tier, against your own cards, levels and foils. Uses a PvP ticket.": [
  "Le deck d’un inconnu de votre palier, contre vos propres cartes, niveaux et brillantes. Utilise un ticket JcJ.",
  "Das Deck eines Fremden aus deiner Stufe, gegen deine eigenen Karten, Stufen und Folien. Braucht ein PvP-Ticket.",
  "El mazo de un desconocido de tu nivel, contra tus propias cartas, niveles y láminas. Usa un ticket PvP.",
  "Il mazzo di uno sconosciuto della tua fascia, contro le tue carte, i tuoi livelli e le tue foil. Usa un biglietto PvP.",
  "O baralho de um desconhecido do teu escalão, contra as tuas cartas, níveis e foils. Usa um bilhete PvP.",
  "Deck ng isang estranghero mula sa antas mo, laban sa sarili mong mga card, level at foil. Gumagamit ng isang PvP ticket.",
  "உங்கள் நிலையிலுள்ள ஒரு அந்நியரின் அடுக்கு, உங்கள் சொந்த அட்டைகள், நிலைகள், ஃபாயில்களுக்கு எதிராக. ஒரு PvP டிக்கெட் செலவாகும்.",
  "Dek orang asing dari tingkatmu, melawan kartu, level, dan foil milikmu sendiri. Memakai satu tiket PvP.",
  "与你同段位的陌生人的卡组，对阵你自己的卡牌、等级和闪卡。消耗一张对战券。", "與你同段位的陌生人的卡組，對陣你自己的卡牌、等級和閃卡。消耗一張對戰券。",
  "同じ階級の見知らぬ相手のデッキと、自分のカード・レベル・ホイルで戦います。対人戦チケットを1枚使います。",
  "같은 등급의 낯선 상대 덱과 내 카드, 레벨, 포일로 싸워요. PvP 티켓을 한 장 써요."],
"Standard PvP": ["JcJ Standard", "Standard-PvP", "PvP estándar", "PvP Standard", "PvP padrão", "Standard na PvP", "நிலையான PvP", "PvP Standar", "标准对战", "標準對戰", "スタンダード対人戦", "스탠다드 PvP"],
"Same cards for all, Level 1": [
  "Mêmes cartes pour tous, niveau 1", "Gleiche Karten für alle, Stufe 1", "Las mismas cartas para todos, nivel 1", "Stesse carte per tutti, livello 1",
  "As mesmas cartas para todos, nível 1", "Parehong card para sa lahat, Level 1", "அனைவருக்கும் ஒரே அட்டைகள், நிலை 1", "Kartu yang sama untuk semua, Level 1",
  "人人同样的卡牌，1 级", "人人同樣的卡牌，1 級", "全員同じカード、レベル1", "모두 같은 카드, 레벨 1"],
"Both sides play every card at Level 1, with no foils. Build your Standard deck from any card. Uses a PvP ticket.": [
  "Les deux camps jouent chaque carte au niveau 1, sans brillantes. Construisez votre deck standard avec n’importe quelle carte. Utilise un ticket JcJ.",
  "Beide Seiten spielen jede Karte auf Stufe 1, ohne Folien. Bau dein Standarddeck aus beliebigen Karten. Braucht ein PvP-Ticket.",
  "Ambos bandos juegan cada carta a nivel 1, sin láminas. Arma tu mazo estándar con cualquier carta. Usa un ticket PvP.",
  "Entrambe le parti giocano ogni carta al livello 1, senza foil. Costruisci il tuo mazzo standard con qualsiasi carta. Usa un biglietto PvP.",
  "Os dois lados jogam cada carta no nível 1, sem foils. Monta o teu baralho padrão com qualquer carta. Usa um bilhete PvP.",
  "Level 1 ang bawat card ng magkabilang panig, walang foil. Buuin ang Standard na deck mo mula sa kahit anong card. Gumagamit ng isang PvP ticket.",
  "இரு தரப்பும் ஒவ்வொரு அட்டையையும் நிலை 1-இல், ஃபாயில் இல்லாமல் விளையாடும். எந்த அட்டையிலிருந்தும் உங்கள் நிலையான அடுக்கை அமையுங்கள். ஒரு PvP டிக்கெட் செலவாகும்.",
  "Kedua pihak memainkan setiap kartu di Level 1, tanpa foil. Susun dek Standar-mu dari kartu apa pun. Memakai satu tiket PvP.",
  "双方的每张卡都是 1 级，没有闪卡。用任意卡牌组成你的标准卡组。消耗一张对战券。", "雙方的每張卡都是 1 級，沒有閃卡。用任意卡牌組成你的標準卡組。消耗一張對戰券。",
  "両者ともすべてのカードをレベル1、ホイルなしで使います。スタンダードデッキはどのカードからでも組めます。対人戦チケットを1枚使います。",
  "양쪽 모두 모든 카드를 레벨 1, 포일 없이 써요. 스탠다드 덱은 아무 카드로나 짤 수 있어요. PvP 티켓을 한 장 써요."],
"Standard deck {n}/{size}": [
  "Deck standard {n}/{size}", "Standarddeck {n}/{size}", "Mazo estándar {n}/{size}", "Mazzo standard {n}/{size}", "Baralho padrão {n}/{size}", "Standard na deck {n}/{size}",
  "நிலையான அடுக்கு {n}/{size}", "Dek Standar {n}/{size}", "标准卡组 {n}/{size}", "標準卡組 {n}/{size}", "スタンダードデッキ {n}/{size}", "스탠다드 덱 {n}/{size}"],
"Edit your Standard deck: any card, all at Level 1.": [
  "Modifiez votre deck standard : n’importe quelle carte, toutes au niveau 1.", "Bearbeite dein Standarddeck: jede Karte, alle auf Stufe 1.",
  "Edita tu mazo estándar: cualquier carta, todas a nivel 1.", "Modifica il tuo mazzo standard: qualsiasi carta, tutte al livello 1.",
  "Edita o teu baralho padrão: qualquer carta, todas no nível 1.", "I-edit ang Standard na deck mo: kahit anong card, lahat ay Level 1.",
  "உங்கள் நிலையான அடுக்கைத் திருத்துங்கள்: எந்த அட்டையும், அனைத்தும் நிலை 1-இல்.", "Ubah dek Standar-mu: kartu apa pun, semuanya Level 1.",
  "编辑你的标准卡组：任意卡牌，全部 1 级。", "編輯你的標準卡組：任意卡牌，全部 1 級。", "スタンダードデッキを編集：どのカードでも、すべてレベル1。", "스탠다드 덱 편집: 아무 카드나, 모두 레벨 1."],
"Today's field": [
  "Le terrain du jour", "Das heutige Feld", "El campo de hoy", "Il campo di oggi", "O campo de hoje", "Ang larangan ngayon", "இன்றைய களம்", "Medan hari ini",
  "今日战场", "今日戰場", "今日のフィールド", "오늘의 필드"],
"A strange day": ["Un jour étrange", "Ein seltsamer Tag", "Un día extraño", "Una giornata strana", "Um dia estranho", "Kakaibang araw", "ஒரு விசித்திரமான நாள்", "Hari yang aneh", "奇怪的一天", "奇怪的一天", "不思議な日", "이상한 날"],
"New in {h}h": [
  "Nouveau dans {h} h", "Neu in {h} Std.", "Nuevo en {h} h", "Nuovo tra {h} h", "Novo em {h} h", "Bago sa loob ng {h} oras", "{h} மணி நேரத்தில் புதியது", "Baru dalam {h} jam",
  "{h} 小时后更新", "{h} 小時後更新", "{h}時間後に新しく", "{h}시간 뒤 새로"],
"Every Arena fight today plays under these. Ranked Live plays Standard.": [
  "Chaque combat de l’Arène se joue aujourd’hui avec ces règles. Le classé en direct se joue en standard.",
  "Jeder Arena-Kampf spielt heute nach diesen Regeln. Ranked live spielt Standard.",
  "Hoy todos los combates de la Arena se juegan con estas reglas. La clasificatoria en vivo es estándar.",
  "Oggi ogni scontro dell’Arena si gioca con queste regole. Il classificato dal vivo è standard.",
  "Hoje todos os combates da Arena seguem estas regras. O ranqueado ao vivo é padrão.",
  "Ito ang patakaran sa bawat laban sa Arena ngayon. Standard ang Ranked live.",
  "இன்று ஒவ்வொரு அரங்கப் போரும் இவற்றின் கீழ் நடக்கும். தரவரிசை நேரடி நிலையானது.",
  "Hari ini setiap pertarungan Arena memakai aturan ini. Ranked live memakai Standar.",
  "今天竞技场的每场战斗都用这些规则。实时排位用标准规则。", "今天競技場的每場戰鬥都用這些規則。實時排位用標準規則。",
  "今日のアリーナの戦いはすべてこのルールです。ランク戦ライブはスタンダードです。", "오늘 투기장의 모든 싸움은 이 규칙으로 해요. 실시간 랭크전은 스탠다드예요."],
"More ways to play": [
  "D’autres façons de jouer", "Weitere Spielarten", "Más formas de jugar", "Altri modi di giocare", "Mais formas de jogar", "Iba pang paraan ng paglalaro",
  "விளையாட மேலும் வழிகள்", "Cara bermain lainnya", "更多玩法", "更多玩法", "ほかの遊び方", "다른 플레이 방법"],
"Group Dungeon": ["Donjon de groupe", "Gruppenverlies", "Mazmorra de grupo", "Dungeon di gruppo", "Masmorra de grupo", "Dungeon ng grupo", "குழு நிலவறை", "Dungeon Grup", "组队地牢", "組隊地牢", "グループダンジョン", "그룹 던전"],
"A dungeon with live players, side by side. Your group runs will be recorded here.": [
  "Un donjon avec de vrais joueurs, côte à côte. Vos parties en groupe seront notées ici.",
  "Ein Verlies mit echten Spielern, Seite an Seite. Deine Gruppenläufe werden hier festgehalten.",
  "Una mazmorra con jugadores en vivo, codo con codo. Tus partidas en grupo quedarán registradas aquí.",
  "Un dungeon con giocatori dal vivo, fianco a fianco. Le tue partite di gruppo saranno registrate qui.",
  "Uma masmorra com jogadores ao vivo, lado a lado. As tuas partidas em grupo ficarão registadas aqui.",
  "Isang dungeon kasama ang mga totoong manlalaro, magkakatabi. Dito itatala ang mga takbo ng grupo mo.",
  "நேரடி வீரர்களுடன் அருகருகே ஒரு நிலவறை. உங்கள் குழு ஓட்டங்கள் இங்கே பதிவாகும்.",
  "Dungeon bersama pemain langsung, berdampingan. Perjalanan grupmu akan tercatat di sini.",
  "与真人玩家并肩闯的地牢。你的组队记录会显示在这里。", "與真人玩家並肩闖的地牢。你的組隊紀錄會顯示在這裡。",
  "本物のプレイヤーと並んで挑むダンジョン。グループでの挑戦はここに記録されます。", "실제 플레이어와 나란히 도는 던전이에요. 그룹 도전 기록은 여기에 남아요."],
"Coming soon": ["Bientôt", "Demnächst", "Próximamente", "Prossimamente", "Em breve", "Malapit na", "விரைவில்", "Segera hadir", "即将推出", "即將推出", "近日公開", "곧 공개"],
"Match log": ["Journal des matchs", "Kampfprotokoll", "Registro de partidas", "Registro delle partite", "Registo de partidas", "Talaan ng laban", "போட்டிப் பதிவு", "Catatan pertandingan", "对战日志", "對戰日誌", "対戦ログ", "대전 기록"],
"PvE": ["JcE", "PvE", "PvE", "PvE", "PvE", "PvE", "PvE", "PvE", "冒险", "冒險", "対CPU戦", "PvE"],
"See the deck you faced": [
  "Voir le deck affronté", "Das Deck ansehen, gegen das du gespielt hast", "Ver el mazo al que te enfrentaste", "Vedi il mazzo che hai affrontato", "Ver o baralho que enfrentaste",
  "Tingnan ang deck na nakaharap mo", "நீங்கள் எதிர்கொண்ட அடுக்கைப் பாருங்கள்", "Lihat dek yang kamu hadapi", "查看你对阵的卡组", "查看你對陣的卡組", "対戦したデッキを見る", "상대한 덱 보기"],
"No PvP matches yet.": [
  "Pas encore de match JcJ.", "Noch keine PvP-Matches.", "Aún no hay partidas PvP.", "Ancora nessuna partita PvP.", "Ainda sem partidas PvP.", "Wala pang PvP na laban.",
  "இன்னும் PvP போட்டிகள் இல்லை.", "Belum ada pertandingan PvP.", "还没有对战记录。", "還沒有對戰紀錄。", "対人戦の記録はまだありません。", "아직 PvP 대전이 없어요."],
"No PvE fights yet.": [
  "Pas encore de combat JcE.", "Noch keine PvE-Kämpfe.", "Aún no hay combates PvE.", "Ancora nessuno scontro PvE.", "Ainda sem combates PvE.", "Wala pang PvE na laban.",
  "இன்னும் PvE போர்கள் இல்லை.", "Belum ada pertarungan PvE.", "还没有冒险战斗记录。", "還沒有冒險戰鬥紀錄。", "対CPU戦の記録はまだありません。", "아직 PvE 전투가 없어요."],
"Set": ["Fixer", "Setzen", "Fijar", "Imposta", "Definir", "Itakda", "அமை", "Atur", "设定", "設定", "設定", "설정"],
"Give yourself raid tickets: +1, +5 or a set number, past the cap of {cap} too. Synced to your account.": [
  "Donnez-vous des tickets de raid : +1, +5 ou un nombre précis, même au-delà du plafond de {cap}. Synchronisé avec votre compte.",
  "Gib dir Raid-Tickets: +1, +5 oder eine feste Zahl, auch über die Grenze von {cap} hinaus. Wird mit deinem Konto abgeglichen.",
  "Date tickets de raid: +1, +5 o un número fijo, incluso por encima del tope de {cap}. Se sincroniza con tu cuenta.",
  "Datti biglietti raid: +1, +5 o un numero preciso, anche oltre il limite di {cap}. Sincronizzato con il tuo account.",
  "Dá a ti mesmo bilhetes de raid: +1, +5 ou um número fixo, mesmo acima do limite de {cap}. Sincronizado com a tua conta.",
  "Bigyan ang sarili ng raid ticket: +1, +5 o isang takdang bilang, lampas pa sa hangganang {cap}. Naka-sync sa account mo.",
  "உங்களுக்குப் படையெடுப்பு டிக்கெட்டுகள் கொடுங்கள்: +1, +5 அல்லது ஒரு குறிப்பிட்ட எண், {cap} வரம்பைத் தாண்டியும். உங்கள் கணக்குடன் ஒத்திசைக்கப்படும்.",
  "Beri dirimu tiket raid: +1, +5 atau angka tertentu, melewati batas {cap} juga. Tersinkron ke akunmu.",
  "给自己突袭券：+1、+5 或设定一个数量，也可以超过 {cap} 的上限。会同步到你的账号。", "給自己突襲券：+1、+5 或設定一個數量，也可以超過 {cap} 的上限。會同步到你的帳號。",
  "レイドチケットを自分に付与：+1、+5、または指定の数。上限{cap}を超えても可。アカウントに同期されます。",
  "레이드 티켓을 직접 받아요: +1, +5 또는 원하는 수, 상한 {cap}을 넘어도 돼요. 계정에 동기화돼요."],
"Raid tickets: {n}": [
  "Tickets de raid : {n}", "Raid-Tickets: {n}", "Tickets de raid: {n}", "Biglietti raid: {n}", "Bilhetes de raid: {n}", "Mga raid ticket: {n}", "படையெடுப்பு டிக்கெட்டுகள்: {n}",
  "Tiket raid: {n}", "突袭券：{n}", "突襲券：{n}", "レイドチケット：{n}", "레이드 티켓: {n}"],
"The Undercroft": ["La Crypte", "Die Krypta", "La Cripta", "La Cripta", "A Cripta", "Ang Silong", "அடித்தள அறைகள்", "Ruang Bawah Tanah", "地下墓窟", "地下墓窟", "地下墓所", "지하 묘실"],
"The Vault Warden": ["Le Gardien des caveaux", "Der Gewölbewächter", "El Guardián de la Bóveda", "Il Guardiano delle Volte", "O Guardião da Abóbada", "Ang Bantay ng Silong", "அறைக் காவலன்", "Penjaga Ruang Besi", "穹窖守卫", "穹窖守衛", "地下蔵の番人", "묘실 수호자"],
"Vaults under the Arena’s sand. Every three floors the doors open onto another land.": [
  "Des caveaux sous le sable de l’Arène. Tous les trois étages, les portes s’ouvrent sur une autre contrée.",
  "Gewölbe unter dem Sand der Arena. Alle drei Etagen öffnen sich die Türen zu einem anderen Land.",
  "Bóvedas bajo la arena de la Arena. Cada tres pisos, las puertas se abren a otra tierra.",
  "Volte sotto la sabbia dell’Arena. Ogni tre piani le porte si aprono su un’altra terra.",
  "Abóbadas sob a areia da Arena. A cada três andares, as portas abrem-se para outra terra.",
  "Mga silong sa ilalim ng buhangin ng Arena. Bawat tatlong palapag, bumubukas ang mga pinto sa ibang lupain.",
  "அரங்கின் மணலுக்குக் கீழே உள்ள அறைகள். ஒவ்வொரு மூன்று தளங்களிலும் கதவுகள் வேறொரு நிலத்திற்குத் திறக்கின்றன.",
  "Ruang-ruang di bawah pasir Arena. Setiap tiga lantai, pintunya terbuka ke negeri lain.",
  "竞技场沙地下的穹窖。每过三层，门就通往另一片土地。", "競技場沙地下的穹窖。每過三層，門就通往另一片土地。",
  "アリーナの砂の下にある地下蔵。3階ごとに、扉は別の土地へと開きます。", "투기장 모래 아래의 묘실. 세 층마다 문이 다른 땅으로 열려요."],
"The next door grinds open.": [
  "La porte suivante s’ouvre en grinçant.", "Die nächste Tür schabt auf.", "La siguiente puerta se abre chirriando.", "La porta successiva si apre stridendo.",
  "A porta seguinte abre-se a ranger.", "Umiingit na bumubukas ang susunod na pinto.", "அடுத்த கதவு கிறீச்சிட்டுத் திறக்கிறது.", "Pintu berikutnya terbuka berderit.",
  "下一扇门嘎吱嘎吱地打开了。", "下一扇門嘎吱嘎吱地打開了。", "次の扉がきしみながら開く。", "다음 문이 삐걱이며 열려요."],
"Every tenth floor the warden of the vaults comes down to meet you.": [
  "Tous les dix étages, le gardien des caveaux descend à votre rencontre.", "Auf jeder zehnten Etage kommt der Wächter der Gewölbe herab, um dich zu treffen.",
  "Cada diez pisos, el guardián de las bóvedas baja a tu encuentro.", "Ogni dieci piani il guardiano delle volte scende a incontrarti.",
  "A cada dez andares, o guardião das abóbadas desce ao teu encontro.", "Bawat ikasampung palapag, bumababa ang bantay ng silong para harapin ka.",
  "ஒவ்வொரு பத்தாவது தளத்திலும் அறைகளின் காவலன் உங்களைச் சந்திக்க இறங்கி வருகிறான்.", "Setiap lantai kesepuluh, penjaga ruang besi turun menemuimu.",
  "每到第十层，穹窖的守卫就会下来迎战你。", "每到第十層，穹窖的守衛就會下來迎戰你。", "10階ごとに、地下蔵の番人が下りてきて立ちはだかる。", "열 층마다 묘실의 수호자가 내려와 맞서요."],
}
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
        for en, row in T.items():
            if en in pack or en in uipack: kept += 1; continue  # the pack's own wording stays
            pack[en] = row[i]
        with open(path, 'w', encoding='utf-8') as fh:
            json.dump(pack, fh, ensure_ascii=False, indent=1); fh.write('\n')  # the pack's own order, new rows at the end
    print('wrote', len(CODES), 'packs,', len(T), 'strings each;', kept, 'rows a pack already had were kept')
