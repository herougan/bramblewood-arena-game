#!/usr/bin/env python3
"""Game texts added on 2026-10-19 by package RO (raid ops: the Raid hub, raid tickets, respawns 24 h after a kill, the admin restart,
instances, taking part / strong contributor, the held-raid share and Auto after completing a raid). Keys are the English with the
leading emoji peeled, as the page translator sees them; every {placeholder} is kept. It also drops the two retired "Not enough Raid
Points — this costs ..." rows (the raid's ticket reason replaces them). The words follow the packs: Health (Santé, Leben ...), Energy,
Maple Leaves, Magic Dust, Metal, Raid (Asalto, Raide, 突袭 ...). Same caveats as i18n_core.py (Tagalog, Tamil, Japanese and Korean
deserve a native read).

    python3 tools/i18n_2026_10_19_ro.py && python3 tools/i18n_refresh.py
"""
import json, os, re
ROOT = os.path.join(os.path.dirname(os.path.abspath(__file__)), '..')
CODES = ['fr', 'de', 'es', 'it', 'pt', 'tl', 'ta', 'id', 'zh-Hans', 'zh-Hant', 'ja', 'ko']
T = {
"All raids": [
  "Tous les raids", "Alle Raids", "Todos los asaltos", "Tutti i raid", "Todos os raides", "Lahat ng raid", "எல்லா படையெடுப்புப் போர்களும்",
  "Semua raid", "全部突袭", "全部突襲", "すべてのレイド", "모든 레이드"],
"Pick a raid. A fight takes a raid ticket and some Energy; you hold up to {cap} tickets, +1 a day, and each week starts full.": [
  "Choisissez un raid. Un combat coûte un ticket de raid et un peu d'Énergie ; vous gardez jusqu'à {cap} tickets, +1 par jour, et chaque semaine commence au complet.",
  "Wähle einen Raid. Ein Kampf kostet ein Raid-Ticket und etwas Energie; du hältst bis zu {cap} Tickets, +1 pro Tag, und jede Woche beginnt voll.",
  "Elige un asalto. Un combate cuesta un ticket de asalto y algo de Energía; guardas hasta {cap} tickets, +1 al día, y cada semana empieza llena.",
  "Scegli un raid. Uno scontro costa un biglietto raid e un po' di Energia; ne tieni fino a {cap}, +1 al giorno, e ogni settimana parte piena.",
  "Escolhe um raide. Um combate custa um bilhete de raide e alguma Energia; guardas até {cap} bilhetes, +1 por dia, e cada semana começa cheia.",
  "Pumili ng raid. Isang raid ticket at kaunting Enerhiya ang bawat laban; hanggang {cap} ticket ang hawak mo, +1 bawat araw, at puno ang simula ng bawat linggo.",
  "ஒரு படையெடுப்புப் போரைத் தேர்ந்தெடுங்கள். ஒரு சண்டைக்கு ஒரு டிக்கெட்டும் கொஞ்சம் ஆற்றலும் தேவை; {cap} டிக்கெட்டுகள் வரை வைத்திருக்கலாம், நாளுக்கு +1, ஒவ்வொரு வாரமும் நிறைவாகத் தொடங்கும்.",
  "Pilih raid. Satu pertarungan butuh satu tiket raid dan sedikit Energi; kamu menyimpan hingga {cap} tiket, +1 per hari, dan setiap minggu dimulai penuh.",
  "选择一场突袭。每场战斗消耗一张突袭券和一些能量；你最多持有 {cap} 张，每天 +1，每周开始时补满。",
  "選擇一場突襲。每場戰鬥消耗一張突襲券和一些能量；你最多持有 {cap} 張，每天 +1，每週開始時補滿。",
  "レイドを選ぼう。1回の戦闘でレイドチケット1枚と少しのエネルギーを使う。チケットは最大{cap}枚、1日に+1、毎週満タンから始まる。",
  "레이드를 고르세요. 전투 한 번에 레이드 티켓 1장과 에너지가 조금 듭니다. 티켓은 최대 {cap}장, 하루에 +1, 매주 가득 찬 채로 시작합니다."],
"Health left": [
  "Santé restante", "Leben übrig", "Salud restante", "Salute rimasta", "Vida restante", "Natitirang Buhay", "மீதமுள்ள உயிர்", "Sisa Nyawa",
  "剩余生命", "剩餘生命", "残り体力", "남은 체력"],
"Not yet": [
  "Pas encore", "Noch nicht", "Aún no", "Non ancora", "Ainda não", "Hindi pa", "இன்னும் இல்லை", "Belum", "尚未", "尚未", "まだ", "아직"],
"Open {name}": [
  "Ouvrir {name}", "{name} öffnen", "Abrir {name}", "Apri {name}", "Abrir {name}", "Buksan ang {name}", "{name} ஐத் திற", "Buka {name}",
  "打开{name}", "打開{name}", "{name}を開く", "{name} 열기"],
"Instance {n}": [
  "Instance {n}", "Instanz {n}", "Instancia {n}", "Istanza {n}", "Instância {n}", "Instance {n}", "நிகழ்வு {n}", "Instans {n}",
  "副本 {n}", "副本 {n}", "インスタンス{n}", "인스턴스 {n}"],
"Instance": [
  "Instance", "Instanz", "Instancia", "Istanza", "Instância", "Instance", "நிகழ்வு", "Instans", "副本", "副本", "インスタンス", "인스턴스"],
"Many raiders: the raid runs in several instances, each with its own Health and rewards. This one is yours this week.": [
  "Beaucoup de raiders : le raid se joue en plusieurs instances, chacune avec sa Santé et ses récompenses. Celle-ci est la vôtre cette semaine.",
  "Viele Raider: Der Raid läuft in mehreren Instanzen, jede mit eigenem Leben und eigenen Belohnungen. Diese ist diese Woche deine.",
  "Muchos asaltantes: el asalto se juega en varias instancias, cada una con su Salud y sus recompensas. Esta es la tuya esta semana.",
  "Molti predoni: il raid si svolge in più istanze, ognuna con la sua Salute e le sue ricompense. Questa è la tua per questa settimana.",
  "Muitos atacantes: o raide decorre em várias instâncias, cada uma com a sua Vida e recompensas. Esta é a tua esta semana.",
  "Maraming raider: tumatakbo ang raid sa ilang instance, bawat isa may sariling Buhay at gantimpala. Ito ang sa iyo ngayong linggo.",
  "பல வீரர்கள்: படையெடுப்புப் போர் பல நிகழ்வுகளாக நடக்கிறது, ஒவ்வொன்றுக்கும் தனி உயிரும் வெகுமதிகளும். இந்த வாரம் இது உங்களுடையது.",
  "Banyak penyerbu: raid berjalan dalam beberapa instans, masing-masing dengan Nyawa dan hadiahnya sendiri. Yang ini milikmu minggu ini.",
  "突袭者很多：突袭分成几个副本进行，每个副本有自己的生命和奖励。这是你本周的副本。",
  "突襲者很多：突襲分成幾個副本進行，每個副本有自己的生命和獎勵。這是你本週的副本。",
  "参加者が多いので、レイドはいくつかのインスタンスに分かれ、それぞれに体力と報酬がある。これが今週のあなたのインスタンス。",
  "레이더가 많아 레이드는 여러 인스턴스로 나뉘며, 각각 체력과 보상이 따로 있습니다. 이번 주에는 이곳이 당신의 인스턴스입니다."],
"Raid tickets": [
  "Tickets de raid", "Raid-Tickets", "Tickets de asalto", "Biglietti raid", "Bilhetes de raide", "Mga raid ticket", "படையெடுப்பு டிக்கெட்டுகள்",
  "Tiket raid", "突袭券", "突襲券", "レイドチケット", "레이드 티켓"],
"Raid tickets: one a fight. You hold up to {cap}; +1 a day, and each week starts full.": [
  "Tickets de raid : un par combat. Vous en gardez jusqu'à {cap} ; +1 par jour, et chaque semaine commence au complet.",
  "Raid-Tickets: eins pro Kampf. Du hältst bis zu {cap}; +1 pro Tag, und jede Woche beginnt voll.",
  "Tickets de asalto: uno por combate. Guardas hasta {cap}; +1 al día, y cada semana empieza llena.",
  "Biglietti raid: uno a scontro. Ne tieni fino a {cap}; +1 al giorno, e ogni settimana parte piena.",
  "Bilhetes de raide: um por combate. Guardas até {cap}; +1 por dia, e cada semana começa cheia.",
  "Mga raid ticket: isa bawat laban. Hanggang {cap} ang hawak mo; +1 bawat araw, at puno ang simula ng bawat linggo.",
  "படையெடுப்பு டிக்கெட்டுகள்: ஒரு சண்டைக்கு ஒன்று. {cap} வரை வைத்திருக்கலாம்; நாளுக்கு +1, ஒவ்வொரு வாரமும் நிறைவாகத் தொடங்கும்.",
  "Tiket raid: satu per pertarungan. Kamu menyimpan hingga {cap}; +1 per hari, dan setiap minggu dimulai penuh.",
  "突袭券：每场战斗一张。最多持有 {cap} 张；每天 +1，每周开始时补满。",
  "突襲券：每場戰鬥一張。最多持有 {cap} 張；每天 +1，每週開始時補滿。",
  "レイドチケット：戦闘1回に1枚。最大{cap}枚まで持てて、1日に+1、毎週満タンから始まる。",
  "레이드 티켓: 전투 한 번에 1장. 최대 {cap}장까지, 하루에 +1, 매주 가득 찬 채로 시작합니다."],
"+1 in {span}": [
  "+1 dans {span}", "+1 in {span}", "+1 en {span}", "+1 tra {span}", "+1 dentro de {span}", "+1 sa loob ng {span}", "{span} இல் +1",
  "+1 dalam {span}", "{span} 后 +1", "{span} 後 +1", "{span}後に+1", "{span} 후 +1"],
"Taking part": [
  "Participation", "Dabei", "Participas", "Partecipi", "A participar", "Kasali", "பங்கேற்பு", "Ikut serta", "参与中", "參與中", "参加中", "참여 중"],
"Strong contributor": [
  "Grand contributeur", "Starker Beitrag", "Gran contribuyente", "Grande contributore", "Grande contribuidor", "Malakas na kontribyutor",
  "வலுவான பங்களிப்பாளர்", "Kontributor kuat", "主力贡献者", "主力貢獻者", "主力貢献者", "핵심 기여자"],
"{fights}/{nf} fights · {damage}/{nd} damage": [
  "{fights}/{nf} combats · {damage}/{nd} dégâts", "{fights}/{nf} Kämpfe · {damage}/{nd} Schaden", "{fights}/{nf} combates · {damage}/{nd} daño",
  "{fights}/{nf} scontri · {damage}/{nd} danni", "{fights}/{nf} combates · {damage}/{nd} dano", "{fights}/{nf} laban · {damage}/{nd} pinsala",
  "{fights}/{nf} சண்டைகள் · {damage}/{nd} சேதம்", "{fights}/{nf} pertarungan · {damage}/{nd} kerusakan", "{fights}/{nf} 场战斗 · {damage}/{nd} 伤害",
  "{fights}/{nf} 場戰鬥 · {damage}/{nd} 傷害", "{fights}/{nf}戦 · {damage}/{nd}ダメージ", "{fights}/{nf}회 전투 · {damage}/{nd} 피해"],
"Taking part: {fights}+ fights and {damage}+ raid damage in this life of the raid. Strong contributor: {sfights}+ fights and {sdamage}+ damage, for {pct}% more of every reward.": [
  "Participation : {fights}+ combats et {damage}+ dégâts de raid dans cette vie du raid. Grand contributeur : {sfights}+ combats et {sdamage}+ dégâts, pour {pct} % de plus sur chaque récompense.",
  "Dabei: {fights}+ Kämpfe und {damage}+ Raid-Schaden in diesem Leben des Raids. Starker Beitrag: {sfights}+ Kämpfe und {sdamage}+ Schaden, für {pct} % mehr von jeder Belohnung.",
  "Participas: {fights}+ combates y {damage}+ de daño en esta vida del asalto. Gran contribuyente: {sfights}+ combates y {sdamage}+ de daño, con un {pct} % más de cada recompensa.",
  "Partecipi: {fights}+ scontri e {damage}+ danni da raid in questa vita del raid. Grande contributore: {sfights}+ scontri e {sdamage}+ danni, per il {pct}% in più di ogni ricompensa.",
  "A participar: {fights}+ combates e {damage}+ de dano nesta vida do raide. Grande contribuidor: {sfights}+ combates e {sdamage}+ de dano, com {pct}% a mais de cada recompensa.",
  "Kasali: {fights}+ laban at {damage}+ pinsala sa buhay na ito ng raid. Malakas na kontribyutor: {sfights}+ laban at {sdamage}+ pinsala, para sa {pct}% dagdag sa bawat gantimpala.",
  "பங்கேற்பு: இந்தச் சுற்றில் {fights}+ சண்டைகள், {damage}+ சேதம். வலுவான பங்களிப்பாளர்: {sfights}+ சண்டைகள், {sdamage}+ சேதம்; ஒவ்வொரு வெகுமதியிலும் {pct}% அதிகம்.",
  "Ikut serta: {fights}+ pertarungan dan {damage}+ kerusakan raid di nyawa raid ini. Kontributor kuat: {sfights}+ pertarungan dan {sdamage}+ kerusakan, untuk {pct}% lebih dari setiap hadiah.",
  "参与：在本轮突袭中打 {fights}+ 场、造成 {damage}+ 突袭伤害。主力贡献者：{sfights}+ 场、{sdamage}+ 伤害，每项奖励多 {pct}%。",
  "參與：在本輪突襲中打 {fights}+ 場、造成 {damage}+ 突襲傷害。主力貢獻者：{sfights}+ 場、{sdamage}+ 傷害，每項獎勵多 {pct}%。",
  "参加：このレイドの今回の周期で{fights}戦以上、レイドダメージ{damage}以上。主力貢献者：{sfights}戦以上、{sdamage}ダメージ以上で、すべての報酬が{pct}%増える。",
  "참여: 이번 레이드 주기에서 {fights}회 이상 전투, 레이드 피해 {damage} 이상. 핵심 기여자: {sfights}회 이상, 피해 {sdamage} 이상이면 모든 보상이 {pct}% 늘어납니다."],
"Auto open": [
  "Auto disponible", "Auto frei", "Auto disponible", "Auto sbloccato", "Auto disponível", "Bukas ang Auto", "தானியங்கி திறந்தது", "Auto terbuka",
  "已开放自动", "已開放自動", "オート解放", "자동 열림"],
"Take part when this raid falls to open Auto for its fights.": [
  "Participez quand ce raid tombe pour débloquer l'Auto dans ses combats.",
  "Sei dabei, wenn dieser Raid fällt, um Auto für seine Kämpfe freizuschalten.",
  "Participa cuando este asalto caiga para abrir el Auto en sus combates.",
  "Partecipa quando questo raid cade per sbloccare l'Auto nei suoi scontri.",
  "Participa quando este raide cair para abrir o Auto nos seus combates.",
  "Makilahok kapag bumagsak ang raid na ito para mabuksan ang Auto sa mga laban nito.",
  "இந்தப் படையெடுப்பு வீழும்போது பங்கேற்றால், அதன் சண்டைகளுக்குத் தானியங்கி திறக்கும்.",
  "Ikut serta saat raid ini tumbang untuk membuka Auto di pertarungannya.",
  "在这场突袭被击倒时参与，即可为它的战斗开放自动。",
  "在這場突襲被擊倒時參與，即可為它的戰鬥開放自動。",
  "このレイドが倒れたときに参加すると、その戦闘でオートが使えるようになる。",
  "이 레이드가 쓰러질 때 참여하면 그 전투에서 자동을 쓸 수 있습니다."],
"The raid fell — claim your reward!": [
  "Le raid est tombé — réclamez votre récompense !", "Der Raid ist gefallen — hol dir deine Belohnung!", "¡El asalto ha caído: reclama tu recompensa!",
  "Il raid è caduto: reclama la tua ricompensa!", "O raide caiu: reclama a tua recompensa!", "Bumagsak ang raid — kunin ang gantimpala mo!",
  "படையெடுப்பு வீழ்ந்தது — உங்கள் வெகுமதியைப் பெறுங்கள்!", "Raid tumbang — klaim hadiahmu!", "突袭已被击倒——领取你的奖励！", "突襲已被擊倒——領取你的獎勵！",
  "レイドが倒れた——報酬を受け取ろう！", "레이드가 쓰러졌습니다 — 보상을 받으세요!"],
"The raid held — claim your share.": [
  "Le raid a tenu — réclamez votre part.", "Der Raid hat gehalten — hol dir deinen Anteil.", "El asalto resistió: reclama tu parte.",
  "Il raid ha resistito: reclama la tua parte.", "O raide resistiu: reclama a tua parte.", "Nakatagal ang raid — kunin ang bahagi mo.",
  "படையெடுப்பு தாங்கி நின்றது — உங்கள் பங்கைப் பெறுங்கள்.", "Raid bertahan — klaim bagianmu.", "突袭撑住了——领取你的那一份。", "突襲撐住了——領取你的那一份。",
  "レイドは持ちこたえた——分け前を受け取ろう。", "레이드가 버텼습니다 — 몫을 받으세요."],
"Everyone taking part ({fights}+ fights, {damage}+ damage)": [
  "Tous les participants ({fights}+ combats, {damage}+ dégâts)", "Alle, die dabei sind ({fights}+ Kämpfe, {damage}+ Schaden)",
  "Todos los que participan ({fights}+ combates, {damage}+ daño)", "Tutti i partecipanti ({fights}+ scontri, {damage}+ danni)",
  "Todos os participantes ({fights}+ combates, {damage}+ dano)", "Lahat ng kasali ({fights}+ laban, {damage}+ pinsala)",
  "பங்கேற்கும் அனைவரும் ({fights}+ சண்டைகள், {damage}+ சேதம்)", "Semua yang ikut serta ({fights}+ pertarungan, {damage}+ kerusakan)",
  "所有参与者（{fights}+ 场，{damage}+ 伤害）", "所有參與者（{fights}+ 場，{damage}+ 傷害）", "参加者全員（{fights}戦以上、{damage}ダメージ以上）",
  "참여한 모두 ({fights}회 이상, 피해 {damage} 이상)"],
"Strong contributors ({fights}+ fights, {damage}+ damage)": [
  "Grands contributeurs ({fights}+ combats, {damage}+ dégâts)", "Starke Beiträge ({fights}+ Kämpfe, {damage}+ Schaden)",
  "Grandes contribuyentes ({fights}+ combates, {damage}+ daño)", "Grandi contributori ({fights}+ scontri, {damage}+ danni)",
  "Grandes contribuidores ({fights}+ combates, {damage}+ dano)", "Malalakas na kontribyutor ({fights}+ laban, {damage}+ pinsala)",
  "வலுவான பங்களிப்பாளர்கள் ({fights}+ சண்டைகள், {damage}+ சேதம்)", "Kontributor kuat ({fights}+ pertarungan, {damage}+ kerusakan)",
  "主力贡献者（{fights}+ 场，{damage}+ 伤害）", "主力貢獻者（{fights}+ 場，{damage}+ 傷害）", "主力貢献者（{fights}戦以上、{damage}ダメージ以上）",
  "핵심 기여자 ({fights}회 이상, 피해 {damage} 이상)"],
"{pct}% more of every reward": [
  "{pct} % de plus sur chaque récompense", "{pct} % mehr von jeder Belohnung", "Un {pct} % más de cada recompensa", "Il {pct}% in più di ogni ricompensa",
  "Mais {pct}% de cada recompensa", "{pct}% dagdag sa bawat gantimpala", "ஒவ்வொரு வெகுமதியிலும் {pct}% அதிகம்", "{pct}% lebih dari setiap hadiah",
  "每项奖励多 {pct}%", "每項獎勵多 {pct}%", "すべての報酬が{pct}%増える", "모든 보상 {pct}% 증가"],
"If it survives": [
  "S'il survit", "Wenn er überlebt", "Si sobrevive", "Se sopravvive", "Se sobreviver", "Kung makaligtas ito", "அது தப்பினால்", "Jika bertahan",
  "如果它撑住了", "如果它撐住了", "倒れなかったら", "버텨 낸다면"],
"{pct}% of the Maple Leaves, Magic Dust, Metal and XP, and up to {max}% of its own rewards (cards, extras), by how much of its Health went": [
  "{pct} % des Feuilles d’érable, de la Poussière magique, du Métal et de l'XP, et jusqu'à {max} % de ses propres récompenses (cartes, extras), selon la Santé qu'il a perdue",
  "{pct} % der Ahornblätter, des Zauberstaubs, des Metalls und der EP, und bis zu {max} % seiner eigenen Belohnungen (Karten, Extras), je nachdem, wie viel Leben er verloren hat",
  "El {pct} % de las Hojas de arce, el Polvo mágico, el Metal y la EXP, y hasta un {max} % de sus propias recompensas (cartas, extras), según cuánta Salud perdió",
  "Il {pct}% delle Foglie d’acero, della Polvere magica, del Metallo e dei PE, e fino al {max}% delle sue ricompense (carte, extra), in base a quanta Salute ha perso",
  "{pct}% das Folhas de ácer, do Pó mágico, do Metal e da XP, e até {max}% das suas próprias recompensas (cartas, extras), conforme a Vida que perdeu",
  "{pct}% ng Dahon ng Maple, Mahikang Alikabok, Metal at XP, at hanggang {max}% ng sarili nitong gantimpala (card, extra), ayon sa nawalang Buhay nito",
  "மேப்பிள் இலைகள், மாய தூசி, உலோகம், XP இல் {pct}%, அதன் சொந்த வெகுமதிகளில் (அட்டைகள், கூடுதல்) {max}% வரை, அது இழந்த உயிரைப் பொறுத்து",
  "{pct}% Daun Maple, Debu Ajaib, Logam, dan XP, serta hingga {max}% hadiah khususnya (kartu, ekstra), sesuai Nyawa yang hilang",
  "枫叶、魔法粉尘、金属和经验的 {pct}%，以及按它失去的生命计、最多 {max}% 的专属奖励（卡牌、额外奖励）",
  "楓葉、魔法粉塵、金屬和經驗的 {pct}%，以及按它失去的生命計、最多 {max}% 的專屬獎勵（卡牌、額外獎勵）",
  "カエデの葉・魔法の粉・金属・XPの{pct}%と、削った体力に応じて最大{max}%の専用報酬（カード、追加報酬）",
  "단풍잎, 마법 가루, 금속, XP의 {pct}%, 그리고 깎인 체력에 따라 최대 {max}%의 전용 보상 (카드, 추가 보상)"],
"When it falls": [
  "Quand il tombe", "Wenn er fällt", "Cuando cae", "Quando cade", "Quando cai", "Kapag bumagsak ito", "அது வீழும்போது", "Saat tumbang",
  "当它被击倒", "當它被擊倒", "倒れたら", "쓰러지면"],
"It comes back {h} h later at full Health: a new life, with its own rewards.": [
  "Il revient {h} h plus tard avec toute sa Santé : une nouvelle vie, avec ses propres récompenses.",
  "Er kehrt {h} Std. später mit vollem Leben zurück: ein neues Leben, mit eigenen Belohnungen.",
  "Vuelve {h} h después con toda su Salud: una nueva vida, con sus propias recompensas.",
  "Ritorna {h} h dopo con tutta la Salute: una nuova vita, con le sue ricompense.",
  "Regressa {h} h depois com a Vida cheia: uma nova vida, com as suas próprias recompensas.",
  "Babalik ito makalipas ang {h} oras na puno ang Buhay: bagong buhay, may sariling gantimpala.",
  "{h} மணி நேரம் கழித்து முழு உயிருடன் திரும்பும்: புதிய சுற்று, தனி வெகுமதிகளுடன்.",
  "Kembali {h} jam kemudian dengan Nyawa penuh: nyawa baru, dengan hadiahnya sendiri.",
  "{h} 小时后以满生命归来：新的一轮，有自己的奖励。",
  "{h} 小時後以滿生命歸來：新的一輪，有自己的獎勵。",
  "{h}時間後に体力満タンで戻ってくる。新しい周期で、報酬も別。",
  "{h}시간 뒤 체력이 가득 찬 채로 돌아옵니다. 새로운 주기이며 보상도 따로 있습니다."],
"Restart raid": [
  "Relancer le raid", "Raid neu starten", "Reiniciar asalto", "Riavvia il raid", "Reiniciar raide", "I-restart ang raid", "படையெடுப்பை மீண்டும் தொடங்கு",
  "Mulai ulang raid", "重启突袭", "重啟突襲", "レイドを再開", "레이드 재시작"],
"Admin: start a fresh life of this raid now, at full Health": [
  "Admin : lancer maintenant une nouvelle vie de ce raid, avec toute sa Santé", "Admin: jetzt ein neues Leben dieses Raids starten, mit vollem Leben",
  "Admin: empezar ahora una nueva vida de este asalto, con toda su Salud", "Admin: avvia ora una nuova vita di questo raid, con tutta la Salute",
  "Admin: começar agora uma nova vida deste raide, com a Vida cheia", "Admin: simulan na ang bagong buhay ng raid na ito, puno ang Buhay",
  "நிர்வாகி: இந்தப் படையெடுப்பின் புதிய சுற்றை இப்போதே முழு உயிருடன் தொடங்கு", "Admin: mulai nyawa baru raid ini sekarang, dengan Nyawa penuh",
  "管理员：现在以满生命开始这场突袭的新一轮", "管理員：現在以滿生命開始這場突襲的新一輪", "管理者：このレイドの新しい周期を今すぐ体力満タンで始める",
  "관리자: 이 레이드의 새 주기를 지금 체력이 가득 찬 채로 시작"],
"Restart {name}?": [
  "Relancer {name} ?", "{name} neu starten?", "¿Reiniciar {name}?", "Riavviare {name}?", "Reiniciar {name}?", "I-restart ang {name}?",
  "{name} ஐ மீண்டும் தொடங்கவா?", "Mulai ulang {name}?", "重启{name}？", "重啟{name}？", "{name}を再開する？", "{name}을(를) 재시작할까요?"],
"Every instance starts a fresh life now, at full Health. If it is still standing, this life ends unbeaten and its raiders can claim the held-raid share.": [
  "Chaque instance commence maintenant une nouvelle vie, avec toute sa Santé. S'il est encore debout, cette vie se termine invaincue et ses raiders peuvent réclamer la part du raid qui a tenu.",
  "Jede Instanz beginnt jetzt ein neues Leben, mit vollem Leben. Steht er noch, endet dieses Leben unbesiegt, und seine Raider können den Anteil für einen gehaltenen Raid holen.",
  "Cada instancia empieza ahora una nueva vida, con toda su Salud. Si sigue en pie, esta vida termina invicta y sus asaltantes pueden reclamar la parte del asalto que resistió.",
  "Ogni istanza inizia ora una nuova vita, con tutta la Salute. Se è ancora in piedi, questa vita finisce imbattuta e i suoi predoni possono reclamare la parte del raid che ha resistito.",
  "Cada instância começa agora uma nova vida, com a Vida cheia. Se ainda estiver de pé, esta vida termina invicta e os atacantes podem reclamar a parte do raide que resistiu.",
  "Magsisimula ngayon ng bagong buhay ang bawat instance, puno ang Buhay. Kung nakatayo pa ito, magtatapos ang buhay na ito nang hindi natalo at makukuha ng mga raider ang bahagi para sa nakatagal na raid.",
  "ஒவ்வொரு நிகழ்வும் இப்போதே முழு உயிருடன் புதிய சுற்றைத் தொடங்கும். அது இன்னும் நின்றால், இந்தச் சுற்று தோற்கடிக்கப்படாமல் முடியும்; அதன் வீரர்கள் தாங்கி நின்ற படையெடுப்பின் பங்கைப் பெறலாம்.",
  "Setiap instans memulai nyawa baru sekarang, dengan Nyawa penuh. Jika masih berdiri, nyawa ini berakhir tak terkalahkan dan para penyerbunya bisa mengklaim bagian raid yang bertahan.",
  "每个副本现在都以满生命开始新的一轮。如果它还没倒下，这一轮以未被击败结束，参与者可以领取突袭撑住时的那一份。",
  "每個副本現在都以滿生命開始新的一輪。如果它還沒倒下，這一輪以未被擊敗結束，參與者可以領取突襲撐住時的那一份。",
  "すべてのインスタンスが今すぐ体力満タンで新しい周期を始める。まだ倒れていなければ、この周期は倒されずに終わり、参加者は持ちこたえたレイドの分け前を受け取れる。",
  "모든 인스턴스가 지금 체력이 가득 찬 채로 새 주기를 시작합니다. 아직 버티고 있다면 이번 주기는 쓰러지지 않은 채 끝나고, 레이더들은 버틴 레이드의 몫을 받을 수 있습니다."],
"{name} restarted for everyone.": [
  "{name} relancé pour tout le monde.", "{name} für alle neu gestartet.", "{name} reiniciado para todos.", "{name} riavviato per tutti.",
  "{name} reiniciado para todos.", "Na-restart ang {name} para sa lahat.", "{name} அனைவருக்கும் மீண்டும் தொடங்கியது.", "{name} dimulai ulang untuk semua.",
  "{name}已为所有人重启。", "{name}已為所有人重啟。", "{name}を全員に向けて再開した。", "{name}이(가) 모두에게 재시작되었습니다."],
"{name} restarted in this browser only: the server side isn't switched on yet.": [
  "{name} relancé dans ce navigateur seulement : le côté serveur n'est pas encore activé.",
  "{name} nur in diesem Browser neu gestartet: Die Serverseite ist noch nicht eingeschaltet.",
  "{name} reiniciado solo en este navegador: la parte del servidor aún no está activada.",
  "{name} riavviato solo in questo browser: la parte server non è ancora attiva.",
  "{name} reiniciado só neste navegador: o lado do servidor ainda não está ativo.",
  "Na-restart ang {name} sa browser na ito lang: hindi pa naka-on ang server.",
  "{name} இந்த உலாவியில் மட்டும் மீண்டும் தொடங்கியது: சேவையகப் பக்கம் இன்னும் இயக்கப்படவில்லை.",
  "{name} dimulai ulang di peramban ini saja: sisi server belum dinyalakan.",
  "{name}只在此浏览器中重启：服务器端还没有开启。",
  "{name}只在此瀏覽器中重啟：伺服器端還沒有開啟。",
  "{name}はこのブラウザでだけ再開した。サーバー側はまだ有効になっていない。",
  "{name}이(가) 이 브라우저에서만 재시작되었습니다. 서버 쪽은 아직 켜지지 않았습니다."],
"No raid tickets left. The next one comes in {span}.": [
  "Plus de tickets de raid. Le prochain arrive dans {span}.", "Keine Raid-Tickets mehr. Das nächste kommt in {span}.",
  "No te quedan tickets de asalto. El siguiente llega en {span}.", "Niente più biglietti raid. Il prossimo arriva tra {span}.",
  "Não tens bilhetes de raide. O próximo chega dentro de {span}.", "Wala ka nang raid ticket. Darating ang susunod sa loob ng {span}.",
  "படையெடுப்பு டிக்கெட்டுகள் இல்லை. அடுத்தது {span} இல் வரும்.", "Tiket raid habis. Yang berikutnya datang dalam {span}.",
  "突袭券用完了。下一张将在 {span} 后到来。", "突襲券用完了。下一張將在 {span} 後到來。", "レイドチケットがない。次の1枚は{span}後。",
  "레이드 티켓이 없습니다. 다음 티켓은 {span} 후에 옵니다."],
"You completed {name}: Auto is open for its fights from now on.": [
  "Vous avez vaincu {name} : l'Auto est disponible dans ses combats désormais.",
  "Du hast {name} geschafft: Auto ist ab jetzt für seine Kämpfe frei.",
  "Has completado {name}: desde ahora el Auto está disponible en sus combates.",
  "Hai completato {name}: da ora l'Auto è sbloccato nei suoi scontri.",
  "Completaste {name}: a partir de agora o Auto está disponível nos seus combates.",
  "Natapos mo ang {name}: bukas na ang Auto sa mga laban nito mula ngayon.",
  "நீங்கள் {name} ஐ முடித்தீர்கள்: இனி அதன் சண்டைகளுக்குத் தானியங்கி திறந்திருக்கும்.",
  "Kamu menyelesaikan {name}: mulai sekarang Auto terbuka untuk pertarungannya.",
  "你完成了{name}：从现在起它的战斗可以使用自动。",
  "你完成了{name}：從現在起它的戰鬥可以使用自動。",
  "{name}を達成した：これからはその戦闘でオートが使える。",
  "{name}을(를) 완료했습니다: 이제부터 그 전투에서 자동을 쓸 수 있습니다."],
}
RETIRED = [
  "Not enough Raid Points — this costs {raidPoints}🎫 (you have {currentRaidPoints}).",
  "Not enough Raid Points — this costs {raidPoints}🎫 and you have {currentRaidPoints}🎫. They refill 1 every 6 hours.",
]
assert all(len(v) == len(CODES) for v in T.values()), [k for k, v in T.items() if len(v) != len(CODES)]
PLURAL = re.compile(r'^\{(s\d?|plural_\w+)\}$')
ph = lambda s: sorted(set(p for p in re.findall(r'\{\w+\}', s) if not PLURAL.match(p)))
assert all(ph(k) == ph(t) for k, v in T.items() for t in v), [(k, t) for k, v in T.items() for t in v if ph(k) != ph(t)]
assert all(run in t for k, v in T.items() for run in re.findall(r'(?:\{\w+\}){2,}', k) for t in v)
if __name__ == '__main__':
    for i, code in enumerate(CODES):
        path = os.path.join(ROOT, 'lang', code + '.json')
        pack = json.load(open(path, encoding='utf-8')) if os.path.exists(path) else {}
        for en in RETIRED: pack.pop(en, None)
        for en, row in T.items(): pack[en] = row[i]
        with open(path, 'w', encoding='utf-8') as fh:
            json.dump(pack, fh, ensure_ascii=False, indent=1); fh.write('\n')  # keep the packs' order (new rows at the end): smaller merges
    print('wrote', len(CODES), 'packs,', len(T), 'strings each;', len(RETIRED), 'retired')
