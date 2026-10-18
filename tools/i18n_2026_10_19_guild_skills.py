#!/usr/bin/env python3
"""Game texts added on 2026-10-19 by package G (guild skills; owner 20:45: "Guild skills. Starting with +raid HP to your bramble."):
the Guild tab's Guild skills panel (title, how Seeds are earned, the Seeds count, the preview note, levels, costs, the upgrade button),
Rooted Walls and the six locked skills, the raid pre-fight line ("Guild: +12% bramble Health"), the admin preview, and the upgrade's
errors and toast. Keys are the English with the leading emoji peeled, as the page translator sees them; every {placeholder} is kept.
Words follow the packs (Roncier / Dornenhecke / Zarzal ... for the bramble; Guilde / Gilde / Gremio ...; Points de Raid ...).
"Coming soon" is already in every pack. Same caveats as i18n_core.py (Tagalog, Tamil, Japanese and Korean deserve a native read).

    python3 tools/i18n_2026_10_19_guild_skills.py && python3 tools/i18n_refresh.py
"""
import json, os, re
ROOT = os.path.join(os.path.dirname(os.path.abspath(__file__)), '..')
CODES = ['fr', 'de', 'es', 'it', 'pt', 'tl', 'ta', 'id', 'zh-Hans', 'zh-Hant', 'ja', 'ko']
T = {
"Guild skills": [
  "Compétences de guilde", "Gildenfähigkeiten", "Habilidades del gremio", "Abilità di gilda", "Habilidades da guilda", "Mga skill ng guild",
  "சங்கத் திறன்கள்", "Skill guild", "公会技能", "公會技能", "ギルドスキル", "길드 스킬"],
"Skills help every member. The guild's owner buys levels with 🌱 Guild Seeds, which members earn in raid fights: 1 Seed for every {per} raid damage, up to {cap} each a week.": [
  "Les compétences aident chaque membre. Le chef de la guilde achète les niveaux avec des 🌱 Graines de guilde, que les membres gagnent en raid : 1 Graine tous les {per} dégâts de raid, jusqu'à {cap} chacun par semaine.",
  "Fähigkeiten helfen jedem Mitglied. Der Gildenbesitzer kauft Stufen mit 🌱 Gildensamen, die Mitglieder in Raid-Kämpfen verdienen: 1 Samen pro {per} Raid-Schaden, bis zu {cap} pro Woche und Mitglied.",
  "Las habilidades ayudan a todos los miembros. El dueño del gremio compra niveles con 🌱 Semillas del gremio, que los miembros ganan en los asaltos: 1 Semilla por cada {per} de daño de asalto, hasta {cap} cada uno por semana.",
  "Le abilità aiutano ogni membro. Il capo della gilda compra i livelli con i 🌱 Semi di gilda, che i membri guadagnano nei raid: 1 Seme ogni {per} danni da raid, fino a {cap} a testa a settimana.",
  "As habilidades ajudam todos os membros. O dono da guilda compra níveis com 🌱 Sementes da guilda, que os membros ganham nos raides: 1 Semente por cada {per} de dano de raide, até {cap} cada um por semana.",
  "Tumutulong ang mga skill sa bawat miyembro. Bumibili ang may-ari ng guild ng mga level gamit ang 🌱 Binhi ng Guild, na kinikita ng mga miyembro sa raid: 1 Binhi sa bawat {per} raid damage, hanggang {cap} bawat isa kada linggo.",
  "திறன்கள் ஒவ்வொரு உறுப்பினருக்கும் உதவும். சங்கத் தலைவர் 🌱 சங்க விதைகளால் நிலைகளை வாங்குவார்; உறுப்பினர்கள் படையெடுப்புப் போர்களில் அவற்றை ஈட்டுவர்: ஒவ்வொரு {per} படையெடுப்புச் சேதத்துக்கும் 1 விதை, ஒருவருக்கு வாரத்துக்கு {cap} வரை.",
  "Skill membantu setiap anggota. Pemilik guild membeli level dengan 🌱 Benih Guild, yang didapat anggota dari pertarungan raid: 1 Benih tiap {per} damage raid, hingga {cap} per orang seminggu.",
  "技能惠及每位成员。公会会长用 🌱 公会种子购买等级，成员在突袭战中赚取种子：每 {per} 点突袭伤害得 1 颗，每人每周最多 {cap} 颗。",
  "技能惠及每位成員。公會會長用 🌱 公會種子購買等級，成員在突襲戰中賺取種子：每 {per} 點突襲傷害得 1 顆，每人每週最多 {cap} 顆。",
  "スキルはメンバー全員に効く。ギルドのオーナーが 🌱 ギルドの種でレベルを買う。種はメンバーがレイド戦で稼ぐ：レイドダメージ {per} ごとに1個、1人につき週 {cap} 個まで。",
  "스킬은 모든 멤버에게 도움이 됩니다. 길드장이 🌱 길드 씨앗으로 레벨을 사고, 씨앗은 멤버가 레이드 전투에서 얻습니다: 레이드 피해 {per}마다 1개, 1인당 주 {cap}개까지."],
"{n} Guild Seeds": [
  "{n} Graines de guilde", "{n} Gildensamen", "{n} Semillas del gremio", "{n} Semi di gilda", "{n} Sementes da guilda", "{n} Binhi ng Guild",
  "{n} சங்க விதைகள்", "{n} Benih Guild", "公会种子 {n}", "公會種子 {n}", "ギルドの種 {n}", "길드 씨앗 {n}"],
"Preview: guild skills aren't switched on yet. Levels can't be bought, and raid fights get no guild bonus.": [
  "Aperçu : les compétences de guilde ne sont pas encore activées. On ne peut pas acheter de niveaux, et les raids n'ont pas de bonus de guilde.",
  "Vorschau: Gildenfähigkeiten sind noch nicht eingeschaltet. Stufen können nicht gekauft werden, und Raid-Kämpfe bekommen keinen Gildenbonus.",
  "Vista previa: las habilidades del gremio aún no están activadas. No se pueden comprar niveles y los asaltos no tienen bonificación de gremio.",
  "Anteprima: le abilità di gilda non sono ancora attive. Non si possono comprare livelli e i raid non hanno bonus di gilda.",
  "Pré-visualização: as habilidades da guilda ainda não estão ativas. Não se podem comprar níveis e os raides não têm bónus de guilda.",
  "Preview: hindi pa naka-on ang mga skill ng guild. Hindi pa mabibili ang mga level, at walang guild bonus ang mga raid.",
  "முன்னோட்டம்: சங்கத் திறன்கள் இன்னும் இயக்கப்படவில்லை. நிலைகளை வாங்க முடியாது; படையெடுப்புப் போர்களுக்குச் சங்க போனஸ் இல்லை.",
  "Pratinjau: skill guild belum dinyalakan. Level belum bisa dibeli, dan pertarungan raid tidak mendapat bonus guild.",
  "预览：公会技能尚未开启。暂时无法购买等级，突袭战也没有公会加成。",
  "預覽：公會技能尚未開啟。暫時無法購買等級，突襲戰也沒有公會加成。",
  "プレビュー：ギルドスキルはまだオンになっていない。レベルは買えず、レイド戦にギルドボーナスはつかない。",
  "미리 보기: 길드 스킬이 아직 켜지지 않았습니다. 레벨을 살 수 없고, 레이드 전투에 길드 보너스가 없습니다."],
"Loading guild skills…": [
  "Chargement des compétences de guilde…", "Gildenfähigkeiten werden geladen…", "Cargando habilidades del gremio…", "Caricamento delle abilità di gilda…",
  "A carregar as habilidades da guilda…", "Nilo-load ang mga skill ng guild…", "சங்கத் திறன்கள் ஏற்றப்படுகின்றன…", "Memuat skill guild…",
  "正在加载公会技能…", "正在載入公會技能…", "ギルドスキルを読み込み中…", "길드 스킬 불러오는 중…"],
"Level {n} of {max}": [
  "Niveau {n} sur {max}", "Stufe {n} von {max}", "Nivel {n} de {max}", "Livello {n} di {max}", "Nível {n} de {max}", "Level {n} sa {max}",
  "நிலை {n} / {max}", "Level {n} dari {max}", "等级 {n}/{max}", "等級 {n}/{max}", "レベル {n}/{max}", "레벨 {n}/{max}"],
"Top level": [
  "Niveau max", "Höchste Stufe", "Nivel máximo", "Livello massimo", "Nível máximo", "Pinakamataas na level",
  "உச்ச நிலை", "Level tertinggi", "已满级", "已滿級", "最大レベル", "최고 레벨"],
"Next level: {cost} 🌱": [
  "Niveau suivant : {cost} 🌱", "Nächste Stufe: {cost} 🌱", "Siguiente nivel: {cost} 🌱", "Livello successivo: {cost} 🌱", "Próximo nível: {cost} 🌱",
  "Susunod na level: {cost} 🌱", "அடுத்த நிலை: {cost} 🌱", "Level berikutnya: {cost} 🌱", "下一级：{cost} 🌱", "下一級：{cost} 🌱", "次のレベル：{cost} 🌱", "다음 레벨: {cost} 🌱"],
"Upgrade for {cost} 🌱": [
  "Améliorer pour {cost} 🌱", "Verbessern für {cost} 🌱", "Mejorar por {cost} 🌱", "Migliora per {cost} 🌱", "Melhorar por {cost} 🌱",
  "I-upgrade sa {cost} 🌱", "{cost} 🌱க்கு மேம்படுத்து", "Tingkatkan seharga {cost} 🌱", "升级（{cost} 🌱）", "升級（{cost} 🌱）", "{cost} 🌱で強化", "{cost} 🌱로 강화"],
"Only the guild's owner can buy levels.": [
  "Seul le chef de la guilde peut acheter des niveaux.", "Nur der Gildenbesitzer kann Stufen kaufen.", "Solo el dueño del gremio puede comprar niveles.",
  "Solo il capo della gilda può comprare livelli.", "Só o dono da guilda pode comprar níveis.", "Ang may-ari lang ng guild ang makakabili ng mga level.",
  "சங்கத் தலைவர் மட்டுமே நிலைகளை வாங்க முடியும்.", "Hanya pemilik guild yang bisa membeli level.", "只有公会会长能购买等级。", "只有公會會長能購買等級。",
  "レベルを買えるのはギルドのオーナーだけ。", "레벨은 길드장만 살 수 있습니다."],
"Rooted Walls": [
  "Remparts enracinés", "Verwurzelte Wälle", "Muros arraigados", "Mura radicate", "Muralhas enraizadas", "Nakaugat na Pader",
  "வேரூன்றிய சுவர்கள்", "Tembok Berakar", "扎根之墙", "紮根之牆", "根張りの壁", "뿌리 내린 성벽"],
"Each level gives your bramble +{pct}% Health in raid fights.": [
  "Chaque niveau donne +{pct} % de Santé à votre roncier en raid.", "Jede Stufe gibt deiner Dornenhecke +{pct} % Leben in Raid-Kämpfen.",
  "Cada nivel da a tu zarzal +{pct} % de Salud en los asaltos.", "Ogni livello dà al tuo rovo +{pct}% di Salute nei raid.",
  "Cada nível dá ao teu silvado +{pct}% de Vida nos raides.", "Bawat level ay nagbibigay sa dawag mo ng +{pct}% Buhay sa mga raid.",
  "ஒவ்வொரு நிலையும் படையெடுப்புப் போர்களில் உன் முட்புதருக்கு +{pct}% உயிர் தரும்.", "Tiap level memberi semakmu +{pct}% Nyawa dalam pertarungan raid.",
  "每级让你的荆棘丛在突袭战中 +{pct}% 生命。", "每級讓你的荊棘叢在突襲戰中 +{pct}% 生命。", "レベルごとに、レイド戦であなたのいばらの体力 +{pct}%。",
  "레벨마다 레이드 전투에서 내 덤불의 체력 +{pct}%."],
"Now: +{pct}% bramble Health in raid fights.": [
  "Actuellement : +{pct} % de Santé du roncier en raid.", "Jetzt: +{pct} % Dornenhecken-Leben in Raid-Kämpfen.", "Ahora: +{pct} % de Salud del zarzal en los asaltos.",
  "Ora: +{pct}% di Salute del rovo nei raid.", "Agora: +{pct}% de Vida do silvado nos raides.", "Ngayon: +{pct}% Buhay ng dawag sa mga raid.",
  "இப்போது: படையெடுப்புப் போர்களில் முட்புதர் உயிர் +{pct}%.", "Sekarang: +{pct}% Nyawa semak dalam pertarungan raid.", "当前：突袭战中荆棘丛生命 +{pct}%。",
  "目前：突襲戰中荊棘叢生命 +{pct}%。", "現在：レイド戦でいばらの体力 +{pct}%。", "현재: 레이드 전투에서 덤불 체력 +{pct}%."],
"Sharpened Thorns": [
  "Épines aiguisées", "Geschärfte Dornen", "Espinas afiladas", "Spine affilate", "Espinhos afiados", "Pinatalas na Tinik",
  "கூர்மையான முட்கள்", "Duri Tajam", "锐化尖刺", "銳化尖刺", "研がれた棘", "날카로운 가시"],
"More raid damage from every fight.": [
  "Plus de dégâts de raid à chaque combat.", "Mehr Raid-Schaden aus jedem Kampf.", "Más daño de asalto en cada combate.", "Più danni da raid da ogni scontro.",
  "Mais dano de raide em cada combate.", "Mas maraming raid damage sa bawat laban.", "ஒவ்வொரு போரிலும் அதிகப் படையெடுப்புச் சேதம்.", "Lebih banyak damage raid dari tiap pertarungan.",
  "每场战斗造成更多突袭伤害。", "每場戰鬥造成更多突襲傷害。", "毎回の戦いでレイドダメージが増える。", "모든 전투에서 레이드 피해 증가."],
"Second Wind": [
  "Second souffle", "Zweiter Atem", "Segundo aliento", "Secondo fiato", "Segundo fôlego", "Ikalawang Hininga",
  "இரண்டாம் மூச்சு", "Napas Kedua", "重整旗鼓", "重整旗鼓", "セカンドウインド", "재기의 숨결"],
"Hold one more Raid Point.": [
  "Un Point de Raid de plus en réserve.", "Ein Raid-Punkt mehr im Vorrat.", "Guarda un Punto de Asalto más.", "Un Punto raid in più da tenere.",
  "Guarda mais um Ponto de raide.", "Makapag-ipon ng isa pang Raid Point.", "இன்னும் ஒரு படையெடுப்புப் புள்ளியை வைத்திருக்கலாம்.", "Simpan satu Poin Raid lagi.",
  "多存 1 点突袭点数。", "多存 1 點突襲點數。", "レイドポイントを1つ多く持てる。", "레이드 포인트를 1개 더 보유."],
"Sap Return": [
  "Retour de sève", "Saftrückfluss", "Savia de vuelta", "Linfa di ritorno", "Retorno de seiva", "Balik-Dagta",
  "சாறு திரும்பல்", "Getah Kembali", "汁液回流", "汁液回流", "樹液の恵み", "수액 환원"],
"Some Energy back after a raid fight.": [
  "Un peu d'Énergie rendue après un raid.", "Etwas Energie zurück nach einem Raid-Kampf.", "Recupera algo de Energía tras un asalto.",
  "Un po' di Energia restituita dopo un raid.", "Recupera alguma Energia depois de um raide.", "Kaunting Enerhiya pabalik pagkatapos ng raid.",
  "படையெடுப்புப் போருக்குப் பின் சிறிது ஆற்றல் திரும்பும்.", "Sedikit Energi kembali setelah pertarungan raid.", "突袭战后返还部分能量。", "突襲戰後返還部分能量。",
  "レイド戦の後、エネルギーが少し戻る。", "레이드 전투 후 에너지 일부 반환."],
"Guild Chest": [
  "Coffre de guilde", "Gildentruhe", "Cofre del gremio", "Forziere di gilda", "Baú da guilda", "Kaban ng Guild",
  "சங்கப் பெட்டகம்", "Peti Guild", "公会宝箱", "公會寶箱", "ギルドの宝箱", "길드 상자"],
"A bigger reward when a raid falls.": [
  "Une plus grosse récompense quand un raid tombe.", "Eine größere Belohnung, wenn ein Raid fällt.", "Una recompensa mayor cuando cae un asalto.",
  "Una ricompensa più grande quando un raid cade.", "Uma recompensa maior quando um raide cai.", "Mas malaking gantimpala kapag bumagsak ang raid.",
  "படையெடுப்பு வீழும்போது பெரிய வெகுமதி.", "Hadiah lebih besar saat raid tumbang.", "突袭首领倒下时奖励更多。", "突襲首領倒下時獎勵更多。",
  "レイドが倒れたときの報酬が増える。", "레이드가 쓰러지면 보상 증가."],
"Ally Banners": [
  "Bannières alliées", "Verbündetenbanner", "Estandartes aliados", "Stendardi alleati", "Estandartes aliados", "Bandila ng Kakampi",
  "கூட்டாளிக் கொடிகள்", "Panji Sekutu", "盟友战旗", "盟友戰旗", "味方の旗", "아군 깃발"],
"Stronger allies in your raid rows.": [
  "Des alliés plus forts dans vos rangées de raid.", "Stärkere Verbündete in deinen Raid-Reihen.", "Aliados más fuertes en tus filas de asalto.",
  "Alleati più forti nelle tue file del raid.", "Aliados mais fortes nas tuas filas de raide.", "Mas malalakas na kakampi sa mga hanay mo sa raid.",
  "உன் படையெடுப்பு வரிசைகளில் வலிமையான கூட்டாளிகள்.", "Sekutu lebih kuat di baris raidmu.", "突袭阵列中的盟友更强。", "突襲陣列中的盟友更強。",
  "レイドの列の味方が強くなる。", "레이드 줄의 아군이 더 강해짐."],
"Seed Satchel": [
  "Sacoche à graines", "Samenbeutel", "Saco de semillas", "Sacca di semi", "Bolsa de sementes", "Supot ng Binhi",
  "விதைப் பை", "Kantong Benih", "种子袋", "種子袋", "種袋", "씨앗 주머니"],
"More Guild Seeds from raid fights.": [
  "Plus de Graines de guilde en raid.", "Mehr Gildensamen aus Raid-Kämpfen.", "Más Semillas del gremio en los asaltos.", "Più Semi di gilda dai raid.",
  "Mais Sementes da guilda nos raides.", "Mas maraming Binhi ng Guild mula sa mga raid.", "படையெடுப்புப் போர்களில் அதிகச் சங்க விதைகள்.", "Lebih banyak Benih Guild dari pertarungan raid.",
  "突袭战获得更多公会种子。", "突襲戰獲得更多公會種子。", "レイド戦でギルドの種が増える。", "레이드 전투에서 길드 씨앗 증가."],
"Guild: +{pct}% bramble Health": [
  "Guilde : +{pct} % de Santé du roncier", "Gilde: +{pct} % Dornenhecken-Leben", "Gremio: +{pct} % de Salud del zarzal", "Gilda: +{pct}% di Salute del rovo",
  "Guilda: +{pct}% de Vida do silvado", "Guild: +{pct}% Buhay ng dawag", "சங்கம்: முட்புதர் உயிர் +{pct}%", "Guild: +{pct}% Nyawa semak",
  "公会：荆棘丛生命 +{pct}%", "公會：荊棘叢生命 +{pct}%", "ギルド：いばらの体力 +{pct}%", "길드: 덤불 체력 +{pct}%"],
"(admin preview)": [
  "(aperçu admin)", "(Admin-Vorschau)", "(vista previa de admin)", "(anteprima admin)", "(pré-visualização de admin)", "(admin preview)",
  "(நிர்வாகி முன்னோட்டம்)", "(pratinjau admin)", "（管理员预览）", "（管理員預覽）", "（管理者プレビュー）", "(관리자 미리 보기)"],
"Admin preview, this browser only: set levels to try them in raid fights.": [
  "Aperçu admin, dans ce navigateur seulement : réglez des niveaux pour les essayer en raid.",
  "Admin-Vorschau, nur in diesem Browser: Stufen einstellen, um sie in Raid-Kämpfen zu testen.",
  "Vista previa de admin, solo en este navegador: ajusta niveles para probarlos en los asaltos.",
  "Anteprima admin, solo in questo browser: imposta i livelli per provarli nei raid.",
  "Pré-visualização de admin, só neste navegador: define níveis para os experimentar nos raides.",
  "Admin preview, sa browser na ito lang: magtakda ng mga level para subukan sa mga raid.",
  "நிர்வாகி முன்னோட்டம், இந்த உலாவியில் மட்டும்: படையெடுப்புப் போர்களில் சோதிக்க நிலைகளை அமை.",
  "Pratinjau admin, hanya di browser ini: atur level untuk mencobanya dalam pertarungan raid.",
  "管理员预览，仅限此浏览器：设置等级，在突袭战中试用。", "管理員預覽，僅限此瀏覽器：設定等級，在突襲戰中試用。",
  "管理者プレビュー（このブラウザーのみ）：レベルを設定してレイド戦で試せる。", "관리자 미리 보기(이 브라우저만): 레벨을 정해 레이드 전투에서 시험해 보세요."],
"Preview {n}": [
  "Aperçu {n}", "Vorschau {n}", "Vista previa {n}", "Anteprima {n}", "Pré-visualização {n}", "Preview {n}",
  "முன்னோட்டம் {n}", "Pratinjau {n}", "预览 {n}", "預覽 {n}", "プレビュー {n}", "미리 보기 {n}"],
"Clear preview": [
  "Effacer l'aperçu", "Vorschau löschen", "Borrar vista previa", "Cancella anteprima", "Limpar pré-visualização", "I-clear ang preview",
  "முன்னோட்டத்தை அழி", "Hapus pratinjau", "清除预览", "清除預覽", "プレビューを消す", "미리 보기 지우기"],
"Sign in to buy guild skills.": [
  "Connectez-vous pour acheter des compétences de guilde.", "Melde dich an, um Gildenfähigkeiten zu kaufen.", "Inicia sesión para comprar habilidades del gremio.",
  "Accedi per comprare abilità di gilda.", "Inicia sessão para comprar habilidades da guilda.", "Mag-sign in para bumili ng mga skill ng guild.",
  "சங்கத் திறன்களை வாங்க உள்நுழை.", "Masuk untuk membeli skill guild.", "登录后才能购买公会技能。", "登入後才能購買公會技能。",
  "ギルドスキルを買うにはサインインして。", "길드 스킬을 사려면 로그인하세요."],
"Guild skills aren't switched on yet. No Seeds were spent.": [
  "Les compétences de guilde ne sont pas encore activées. Aucune Graine n'a été dépensée.", "Gildenfähigkeiten sind noch nicht eingeschaltet. Es wurden keine Samen ausgegeben.",
  "Las habilidades del gremio aún no están activadas. No se gastó ninguna Semilla.", "Le abilità di gilda non sono ancora attive. Nessun Seme è stato speso.",
  "As habilidades da guilda ainda não estão ativas. Nenhuma Semente foi gasta.", "Hindi pa naka-on ang mga skill ng guild. Walang Binhing nagastos.",
  "சங்கத் திறன்கள் இன்னும் இயக்கப்படவில்லை. விதைகள் எதுவும் செலவாகவில்லை.", "Skill guild belum dinyalakan. Tidak ada Benih yang terpakai.",
  "公会技能尚未开启。没有花费种子。", "公會技能尚未開啟。沒有花費種子。", "ギルドスキルはまだオンになっていない。種は使われていない。", "길드 스킬이 아직 켜지지 않았습니다. 씨앗은 쓰이지 않았습니다."],
"Only the guild's owner can buy skill levels.": [
  "Seul le chef de la guilde peut acheter des niveaux de compétence.", "Nur der Gildenbesitzer kann Fähigkeitsstufen kaufen.", "Solo el dueño del gremio puede comprar niveles de habilidad.",
  "Solo il capo della gilda può comprare livelli di abilità.", "Só o dono da guilda pode comprar níveis de habilidade.", "Ang may-ari lang ng guild ang makakabili ng mga level ng skill.",
  "சங்கத் தலைவர் மட்டுமே திறன் நிலைகளை வாங்க முடியும்.", "Hanya pemilik guild yang bisa membeli level skill.", "只有公会会长能购买技能等级。", "只有公會會長能購買技能等級。",
  "スキルのレベルを買えるのはギルドのオーナーだけ。", "스킬 레벨은 길드장만 살 수 있습니다."],
"Not enough Guild Seeds: this level costs {cost} and the guild has {n}.": [
  "Pas assez de Graines de guilde : ce niveau coûte {cost} et la guilde en a {n}.", "Nicht genug Gildensamen: Diese Stufe kostet {cost}, die Gilde hat {n}.",
  "No hay suficientes Semillas del gremio: este nivel cuesta {cost} y el gremio tiene {n}.", "Semi di gilda insufficienti: questo livello costa {cost} e la gilda ne ha {n}.",
  "Sementes da guilda insuficientes: este nível custa {cost} e a guilda tem {n}.", "Kulang ang Binhi ng Guild: {cost} ang halaga ng level na ito at {n} ang nasa guild.",
  "சங்க விதைகள் போதவில்லை: இந்த நிலைக்கு {cost} தேவை, சங்கத்திடம் {n} உள்ளன.", "Benih Guild tidak cukup: level ini butuh {cost} dan guild punya {n}.",
  "公会种子不足：这一级需要 {cost}，公会有 {n}。", "公會種子不足：這一級需要 {cost}，公會有 {n}。", "ギルドの種が足りない：このレベルは {cost}、ギルドの所持は {n}。",
  "길드 씨앗이 부족합니다: 이 레벨은 {cost}개, 길드 보유는 {n}개."],
"This skill's level just changed. Check it and try again.": [
  "Le niveau de cette compétence vient de changer. Vérifiez-le et réessayez.", "Die Stufe dieser Fähigkeit hat sich gerade geändert. Prüfe sie und versuch es noch einmal.",
  "El nivel de esta habilidad acaba de cambiar. Revísalo e inténtalo de nuevo.", "Il livello di questa abilità è appena cambiato. Controllalo e riprova.",
  "O nível desta habilidade acabou de mudar. Confirma e tenta outra vez.", "Kababago lang ng level ng skill na ito. Tingnan ito at subukang muli.",
  "இந்தத் திறனின் நிலை இப்போதுதான் மாறியது. சரிபார்த்து மீண்டும் முயல்.", "Level skill ini baru saja berubah. Periksa lalu coba lagi.",
  "这个技能的等级刚刚变了。请查看后重试。", "這個技能的等級剛剛變了。請查看後重試。", "このスキルのレベルが今変わった。確認してもう一度試して。", "이 스킬의 레벨이 방금 바뀌었습니다. 확인하고 다시 시도하세요."],
"That skill is already at its top level.": [
  "Cette compétence est déjà à son niveau max.", "Diese Fähigkeit ist schon auf der höchsten Stufe.", "Esa habilidad ya está en su nivel máximo.",
  "Quell'abilità è già al livello massimo.", "Essa habilidade já está no nível máximo.", "Nasa pinakamataas na level na ang skill na iyan.",
  "அந்தத் திறன் ஏற்கெனவே உச்ச நிலையில் உள்ளது.", "Skill itu sudah di level tertinggi.", "这个技能已经满级。", "這個技能已經滿級。",
  "そのスキルはもう最大レベル。", "그 스킬은 이미 최고 레벨입니다."],
"Couldn't buy the level ({err}). No Seeds were spent.": [
  "Impossible d'acheter le niveau ({err}). Aucune Graine n'a été dépensée.", "Die Stufe konnte nicht gekauft werden ({err}). Es wurden keine Samen ausgegeben.",
  "No se pudo comprar el nivel ({err}). No se gastó ninguna Semilla.", "Impossibile comprare il livello ({err}). Nessun Seme è stato speso.",
  "Não foi possível comprar o nível ({err}). Nenhuma Semente foi gasta.", "Hindi nabili ang level ({err}). Walang Binhing nagastos.",
  "நிலையை வாங்க முடியவில்லை ({err}). விதைகள் எதுவும் செலவாகவில்லை.", "Gagal membeli level ({err}). Tidak ada Benih yang terpakai.",
  "无法购买该等级（{err}）。没有花费种子。", "無法購買該等級（{err}）。沒有花費種子。", "レベルを買えなかった（{err}）。種は使われていない。", "레벨을 사지 못했습니다({err}). 씨앗은 쓰이지 않았습니다."],
"Couldn't load your guild's skills.": [
  "Impossible de charger les compétences de votre guilde.", "Die Fähigkeiten deiner Gilde konnten nicht geladen werden.", "No se pudieron cargar las habilidades de tu gremio.",
  "Impossibile caricare le abilità della tua gilda.", "Não foi possível carregar as habilidades da tua guilda.", "Hindi ma-load ang mga skill ng guild mo.",
  "உன் சங்கத்தின் திறன்களை ஏற்ற முடியவில்லை.", "Gagal memuat skill guildmu.", "无法加载你公会的技能。", "無法載入你公會的技能。",
  "ギルドのスキルを読み込めなかった。", "길드 스킬을 불러오지 못했습니다."],
"{name} is now level {n}.": [
  "{name} est maintenant au niveau {n}.", "{name} ist jetzt auf Stufe {n}.", "{name} ya está en el nivel {n}.", "{name} ora è al livello {n}.",
  "{name} está agora no nível {n}.", "Level {n} na ang {name}.", "{name} இப்போது நிலை {n}.", "{name} sekarang level {n}.",
  "{name} 现在是 {n} 级。", "{name} 現在是 {n} 級。", "{name} がレベル {n} になった。", "{name}이(가) 이제 레벨 {n}입니다."],
}
assert all(len(v) == len(CODES) for v in T.values()), [k for k, v in T.items() if len(v) != len(CODES)]
PLURAL = re.compile(r'^\{(s\d?|plural_\w+)\}$')
ph = lambda s: sorted(set(p for p in re.findall(r'\{\w+\}', s) if not PLURAL.match(p)))
assert all(ph(k) == ph(t) for k, v in T.items() for t in v), [(k, t) for k, v in T.items() for t in v if ph(k) != ph(t)]
assert all(e in t for k, v in T.items() for e in re.findall(r'🌱', k) for t in v), 'keep the 🌱 in the translation'
if __name__ == '__main__':
    for i, code in enumerate(CODES):
        path = os.path.join(ROOT, 'lang', code + '.json')
        pack = json.load(open(path, encoding='utf-8')) if os.path.exists(path) else {}
        for en, row in T.items(): pack[en] = row[i]
        with open(path, 'w', encoding='utf-8') as fh:
            json.dump(dict(sorted(pack.items(), key=lambda kv: kv[0].lower())), fh, ensure_ascii=False, indent=1); fh.write('\n')
    print('wrote', len(CODES), 'packs,', len(T), 'strings each')
