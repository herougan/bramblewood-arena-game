#!/usr/bin/env python3
"""Game texts added on 2026-10-21 by package TR (titles, transforms and the Crown; owner 18:23, docs/titles-transforms-2026-10-21.md):
King, Kingly, Tribute, Usurper's theft of the Crown, King Slayer against Royalty, the five Transform presets (Gilded, Championed, Veteran,
Enraged, Matured) and their conditions, the Crown's badge, floats and log lines (their leading emoji peeled, as the page translator does),
Gold's pill (TX ui.skn-king ... ui.gold-tip). Same form as tools/i18n_2026_10_21_ev.py.

    python3 tools/i18n_2026_10_21_tr.py && python3 tools/i18n_refresh.py
"""
import json, os, re
ROOT = os.path.join(os.path.dirname(os.path.abspath(__file__)), '..')
CODES = ['fr', 'de', 'es', 'it', 'pt', 'tl', 'ta', 'id', 'zh-Hans', 'zh-Hant', 'ja', 'ko']
T = {
"King": ["Roi", "König", "Rey", "Re", "Rei", "Hari", "அரசன்", "Raja", "王", "王", "キング", "왕"],
"The first King in play takes the Crown. While it holds it: {skills}.": [
  "Le premier Roi en jeu prend la Couronne. Tant qu'il la porte : {skills}.",
  "Der erste König im Spiel nimmt die Krone. Solange er sie trägt: {skills}.",
  "El primer Rey en juego toma la Corona. Mientras la lleva: {skills}.",
  "Il primo Re in gioco prende la Corona. Finché la porta: {skills}.",
  "O primeiro Rei em jogo toma a Coroa. Enquanto a usar: {skills}.",
  "Ang unang Hari sa laro ang kukuha ng Korona. Habang suot ito: {skills}.",
  "ஆட்டத்தில் வரும் முதல் அரசன் கிரீடத்தை எடுக்கிறான். அதை அணிந்திருக்கும் வரை: {skills}.",
  "Raja pertama yang dimainkan mengambil Mahkota. Selama memakainya: {skills}.",
  "第一个上场的王获得王冠。戴着王冠时：{skills}。",
  "第一個上場的王獲得王冠。戴著王冠時：{skills}。",
  "最初に場に出たキングが王冠を得る。王冠を持つ間：{skills}。",
  "처음 전장에 나온 왕이 왕관을 차지한다. 왕관을 쓰는 동안: {skills}."],
"One Crown in play. When its holder falls, it passes to a King, or fades into +1 Gold.": [
  "Une seule Couronne en jeu. Quand son porteur tombe, elle passe à un Roi, ou se dissipe en +1 Or.",
  "Eine Krone im Spiel. Fällt ihr Träger, geht sie an einen König oder vergeht zu +1 Gold.",
  "Una sola Corona en juego. Cuando cae su portador, pasa a un Rey o se desvanece en +1 Oro.",
  "Una sola Corona in gioco. Quando il portatore cade, passa a un Re o svanisce in +1 Oro.",
  "Uma só Coroa em jogo. Quando o portador cai, passa a um Rei ou desvanece em +1 Ouro.",
  "Iisang Korona sa laro. Kapag bumagsak ang may suot, mapupunta ito sa isang Hari, o maglalaho bilang +1 Ginto.",
  "ஆட்டத்தில் ஒரே கிரீடம். அணிந்தவர் வீழ்ந்தால் அது ஓர் அரசனுக்குச் செல்லும், இல்லையெனில் +1 தங்கமாக மறையும்.",
  "Satu Mahkota di arena. Saat pemakainya gugur, ia berpindah ke seorang Raja, atau memudar menjadi +1 Emas.",
  "场上只有一顶王冠。佩戴者倒下时，它传给一位王，否则化为 +1 金币。",
  "場上只有一頂王冠。佩戴者倒下時，它傳給一位王，否則化為 +1 金幣。",
  "王冠は場に一つ。持ち主が倒れるとキングに渡り、いなければ +1 ゴールドになって消える。",
  "왕관은 전장에 하나. 주인이 쓰러지면 왕에게 넘어가고, 없으면 골드 +1로 사라진다."],
"Kingly (Tribute 1, Armor 2)": ["Royal (Tribut 1, Armure 2)", "Königlich (Tribut 1, Rüstung 2)", "Regio (Tributo 1, Armadura 2)", "Regale (Tributo 1, Armatura 2)",
  "Régio (Tributo 1, Armadura 2)", "Makahari (Tributo 1, Baluti 2)", "அரச (கப்பம் 1, கவசம் 2)", "Rajawi (Upeti 1, Zirah 2)", "王者（贡金 1，护甲 2）",
  "王者（貢金 1，護甲 2）", "王の威光（貢納 1、アーマー 2）", "왕의 위엄 (조공 1, 방어구 2)"],
"Tribute": ["Tribut", "Tribut", "Tributo", "Tributo", "Tributo", "Tributo", "கப்பம்", "Upeti", "贡金", "貢金", "貢納", "조공"],
"Gains {n} Gold each turn while Ready.": [
  "Gagne {n} Or à chaque tour tant qu'elle est Prête.", "Erhält jede Runde {n} Gold, solange sie Bereit ist.", "Gana {n} Oro cada turno mientras está Lista.",
  "Ottiene {n} Oro ogni turno finché è Pronta.", "Ganha {n} Ouro a cada turno enquanto estiver Pronta.", "Nagkakamit ng {n} Ginto bawat turn habang Handa.",
  "தயாராக இருக்கும் வரை ஒவ்வொரு முறையும் {n} தங்கம் பெறுகிறது.", "Mendapat {n} Emas tiap giliran selama Siap.", "可进行时，每回合获得 {n} 金币。",
  "可進行時，每回合獲得 {n} 金幣。", "準備OKの間、毎ターン {n} ゴールドを得る。", "가능 상태인 동안 매 턴 골드 {n}을(를) 얻는다."],
"If it kills the crowned King, it steals the Crown.": [
  "Si elle tue le Roi couronné, elle vole la Couronne.", "Tötet sie den gekrönten König, stiehlt sie die Krone.", "Si mata al Rey coronado, roba la Corona.",
  "Se uccide il Re incoronato, ruba la Corona.", "Se matar o Rei coroado, rouba a Coroa.", "Kapag napatay nito ang nakoronahang Hari, nanakawin nito ang Korona.",
  "கிரீடம் சூடிய அரசனைக் கொன்றால், அது கிரீடத்தைத் திருடுகிறது.", "Jika membunuh Raja bermahkota, ia mencuri Mahkota.", "若它击杀戴冠之王，便夺走王冠。",
  "若它擊殺戴冠之王，便奪走王冠。", "王冠を持つキングを倒すと、王冠を奪う。", "왕관을 쓴 왕을 처치하면 왕관을 빼앗는다."],
"Deals {n} bonus damage on every hit against Royalty, a King or the crowned unit.": [
  "Inflige {n} dégâts bonus à chaque coup contre la Royauté, un Roi ou l'unité couronnée.",
  "Verursacht bei jedem Treffer gegen Königshaus, einen König oder die gekrönte Einheit {n} Bonusschaden.",
  "Inflige {n} de daño extra en cada golpe contra la Realeza, un Rey o la unidad coronada.",
  "Infligge {n} danni bonus a ogni colpo contro i Reali, un Re o l'unità incoronata.",
  "Causa {n} de dano extra em cada golpe contra a Realeza, um Rei ou a unidade coroada.",
  "Nagdudulot ng {n} dagdag na pinsala sa bawat tama laban sa Maharlika, isang Hari o sa yunit na may korona.",
  "அரச குலம், ஓர் அரசன் அல்லது கிரீடம் சூடிய அலகு மீதான ஒவ்வொரு அடிக்கும் {n} கூடுதல் சேதம்.",
  "Memberi {n} kerusakan tambahan tiap serangan terhadap Bangsawan, seorang Raja, atau unit bermahkota.",
  "每次命中王族、王或戴冠单位时，额外造成 {n} 点伤害。", "每次命中王族、王或戴冠單位時，額外造成 {n} 點傷害。",
  "王族、キング、王冠を持つユニットへの攻撃ごとに {n} の追加ダメージ。", "왕족, 왕, 왕관을 쓴 유닛을 칠 때마다 추가 피해 {n}."],
"Gilded": ["Doré", "Vergoldet", "Dorado", "Dorato", "Dourado", "Ginintuan", "பொன்மயம்", "Bersepuh Emas", "镀金", "鍍金", "金ぴか", "금빛"],
"Championed": ["Champion", "Champion", "Campeón", "Campione", "Campeão", "Kampeon", "வெற்றிவீரன்", "Juara", "冠军", "冠軍", "チャンピオン", "챔피언"],
"Veteran": ["Vétéran", "Veteran", "Veterano", "Veterano", "Veterano", "Beterano", "அனுபவசாலி", "Veteran", "老兵", "老兵", "古参兵", "베테랑"],
"Enraged": ["Enragé", "Erzürnt", "Enfurecido", "Infuriato", "Enfurecido", "Nagngingitngit", "சீற்றம்கொண்ட", "Murka", "狂怒", "狂怒", "激昂", "격노"],
"Matured": ["Mûri", "Gereift", "Madurado", "Maturato", "Amadurecido", "Hinog", "முதிர்ந்த", "Matang", "成熟", "成熟", "成熟", "성숙"],
"your resources worth over 25": ["vos ressources valent plus de 25", "deine Ressourcen sind mehr als 25 wert", "tus recursos valen más de 25", "le tue risorse valgono più di 25",
  "os teus recursos valem mais de 25", "lampas sa 25 ang halaga ng iyong yaman", "உங்கள் வளங்களின் மதிப்பு 25-ஐத் தாண்டும்", "nilai sumber dayamu lebih dari 25",
  "你的资源总值超过 25", "你的資源總值超過 25", "資源の価値が 25 を超える", "자원 가치가 25를 넘는다"],
"it wins a duel": ["elle gagne un duel", "sie gewinnt ein Duell", "gana un duelo", "vince un duello", "vence um duelo", "nanalo ito sa isang tunggalian",
  "அது ஒரு தனிப்போரில் வெல்கிறது", "ia memenangkan duel", "它赢下一场决斗", "它贏下一場決鬥", "決闘に勝つ", "결투에서 이긴다"],
"it survives 3 rounds": ["elle survit 3 manches", "sie überlebt 3 Runden", "sobrevive 3 rondas", "sopravvive 3 round", "sobrevive 3 rondas", "nakaligtas ito nang 3 round",
  "அது 3 சுற்றுகள் தாக்குப்பிடிக்கிறது", "ia bertahan 3 ronde", "它存活 3 回合", "它存活 3 回合", "3 ラウンド生き延びる", "3라운드를 버틴다"],
"its Rage is on": ["sa Rage est active", "ihre Wut ist aktiv", "su Furia está activa", "la sua Furia è attiva", "a sua Fúria está ativa", "nakabukas ang Galit nito",
  "அதன் சீற்றம் செயலில் உள்ளது", "Amukannya aktif", "它的狂暴已触发", "它的狂暴已觸發", "激怒が発動している", "분노가 발동했다"],
"it survives {n} rounds": ["elle survit {n} manches", "sie überlebt {n} Runden", "sobrevive {n} rondas", "sopravvive {n} round", "sobrevive {n} rondas", "nakaligtas ito nang {n} round",
  "அது {n} சுற்றுகள் தாக்குப்பிடிக்கிறது", "ia bertahan {n} ronde", "它存活 {n} 回合", "它存活 {n} 回合", "{n} ラウンド生き延びる", "{n}라운드를 버틴다"],
"{name}: under {when}, an evolute played onto it gains {gain}": [
  "{name} : sous {when}, une Évolute jouée dessus gagne {gain}", "{name}: unter {when} erhält ein darauf gespielter Evolut {gain}",
  "{name}: con {when}, un Evoluto jugado encima gana {gain}", "{name}: con {when}, un Evoluto giocato sopra ottiene {gain}",
  "{name}: com {when}, um Evoluto jogado por cima ganha {gain}", "{name}: kapag {when}, ang Evolute na ilalaro sa ibabaw nito ay makakakuha ng {gain}",
  "{name}: {when} எனும்போது, இதன் மீது ஆடப்படும் எவால்யூட் {gain} பெறும்", "{name}: saat {when}, Evolut yang dimainkan di atasnya mendapat {gain}",
  "{name}：在 {when} 时，打在它上面的进化体获得 {gain}", "{name}：在 {when} 時，打在它上面的進化體獲得 {gain}",
  "{name}：{when} とき、この上にプレイしたエボリュートは {gain} を得る", "{name}: {when} 조건에서, 그 위에 낸 에볼루트가 {gain}을(를) 얻는다"],
"Presets: Lycanthropy, Gilded (Lumber 1, Stone 2, Metal 3, Gold 5 each), Championed, Veteran, Enraged, Matured.": [
  "Préréglages : Lycanthropie, Doré (Bois 1, Pierre 2, Métal 3, Or 5 chacun), Champion, Vétéran, Enragé, Mûri.",
  "Vorlagen: Lykanthropie, Vergoldet (Holz 1, Stein 2, Metall 3, Gold 5 je Stück), Champion, Veteran, Erzürnt, Gereift.",
  "Preajustes: Licantropía, Dorado (Madera 1, Piedra 2, Metal 3, Oro 5 cada uno), Campeón, Veterano, Enfurecido, Madurado.",
  "Preimpostazioni: Licantropia, Dorato (Legname 1, Pietra 2, Metallo 3, Oro 5 ciascuno), Campione, Veterano, Infuriato, Maturato.",
  "Predefinições: Licantropia, Dourado (Madeira 1, Pedra 2, Metal 3, Ouro 5 cada), Campeão, Veterano, Enfurecido, Amadurecido.",
  "Mga preset: Likantropiya, Ginintuan (Kahoy 1, Bato 2, Metal 3, Ginto 5 bawat isa), Kampeon, Beterano, Nagngingitngit, Hinog.",
  "முன்னமைவுகள்: ஓநாய்மாற்றம், பொன்மயம் (மரம் 1, கல் 2, உலோகம் 3, தங்கம் 5 ஒவ்வொன்றும்), வெற்றிவீரன், அனுபவசாலி, சீற்றம்கொண்ட, முதிர்ந்த.",
  "Preset: Likantropi, Bersepuh Emas (Kayu 1, Batu 2, Logam 3, Emas 5 masing-masing), Juara, Veteran, Murka, Matang.",
  "预设：狼化症、镀金（木材 1、岩石 2、金属 3、金币 5，各计）、冠军、老兵、狂怒、成熟。",
  "預設：狼化症、鍍金（木材 1、岩石 2、金屬 3、金幣 5，各計）、冠軍、老兵、狂怒、成熟。",
  "プリセット：人狼化、金ぴか（木材 1、石 2、金属 3、ゴールド 5 ずつ）、チャンピオン、古参兵、激昂、成熟。",
  "프리셋: 늑대인간화, 금빛 (목재 1, 돌 2, 금속 3, 골드 5씩), 챔피언, 베테랑, 격노, 성숙."],
"The Crown: {skills} while it holds it": [
  "La Couronne : {skills} tant qu'elle la porte", "Die Krone: {skills}, solange sie sie trägt", "La Corona: {skills} mientras la lleve", "La Corona: {skills} finché la porta",
  "A Coroa: {skills} enquanto a usar", "Ang Korona: {skills} habang suot ito", "கிரீடம்: அணிந்திருக்கும் வரை {skills}", "Mahkota: {skills} selama memakainya",
  "王冠：佩戴期间 {skills}", "王冠：佩戴期間 {skills}", "王冠：持つ間 {skills}", "왕관: 쓰는 동안 {skills}"],
"Crowned": ["Couronné", "Gekrönt", "Coronado", "Incoronato", "Coroado", "Nakoronahan", "முடிசூட்டப்பட்டது", "Bermahkota", "加冕", "加冕", "戴冠", "대관"],
"Crown stolen": ["Couronne volée", "Krone gestohlen", "Corona robada", "Corona rubata", "Coroa roubada", "Ninakaw ang Korona", "கிரீடம் திருடப்பட்டது", "Mahkota dicuri",
  "王冠被夺", "王冠被奪", "王冠を奪った", "왕관 탈취"],
"{name} takes the Crown.": ["{name} prend la Couronne.", "{name} nimmt die Krone.", "{name} toma la Corona.", "{name} prende la Corona.", "{name} toma a Coroa.",
  "Kinuha ni {name} ang Korona.", "{name} கிரீடத்தை எடுக்கிறது.", "{name} mengambil Mahkota.", "{name}戴上了王冠。", "{name}戴上了王冠。", "{name}が王冠を得た。", "{name}이(가) 왕관을 차지했다."],
"The Crown falls from {name}.": ["La Couronne tombe de {name}.", "Die Krone fällt von {name}.", "La Corona cae de {name}.", "La Corona cade da {name}.", "A Coroa cai de {name}.",
  "Nalaglag ang Korona mula kay {name}.", "{name} இடமிருந்து கிரீடம் விழுகிறது.", "Mahkota jatuh dari {name}.", "王冠从{name}头上落下。", "王冠從{name}頭上落下。",
  "王冠が{name}から落ちた。", "왕관이 {name}에게서 떨어졌다."],
"The Crown falls to the ground.": ["La Couronne tombe à terre.", "Die Krone fällt zu Boden.", "La Corona cae al suelo.", "La Corona cade a terra.", "A Coroa cai ao chão.",
  "Nalaglag sa lupa ang Korona.", "கிரீடம் தரையில் விழுகிறது.", "Mahkota jatuh ke tanah.", "王冠掉落在地。", "王冠掉落在地。", "王冠が地に落ちた。", "왕관이 땅에 떨어졌다."],
"{name} picks up the Crown.": ["{name} ramasse la Couronne.", "{name} hebt die Krone auf.", "{name} recoge la Corona.", "{name} raccoglie la Corona.", "{name} apanha a Coroa.",
  "Pinulot ni {name} ang Korona.", "{name} கிரீடத்தை எடுத்துக்கொள்கிறது.", "{name} memungut Mahkota.", "{name}拾起了王冠。", "{name}拾起了王冠。", "{name}が王冠を拾った。", "{name}이(가) 왕관을 주웠다."],
"The liege grants the Crown to {name}.": ["Le suzerain accorde la Couronne à {name}.", "Der Lehnsherr verleiht {name} die Krone.", "El señor otorga la Corona a {name}.",
  "Il signore concede la Corona a {name}.", "O suserano concede a Coroa a {name}.", "Ipinagkaloob ng panginoon ang Korona kay {name}.", "மேலரசர் கிரீடத்தை {name} க்கு வழங்குகிறார்.",
  "Junjungan menganugerahkan Mahkota kepada {name}.", "宗主将王冠授予{name}。", "宗主將王冠授予{name}。", "宗主が王冠を{name}に授けた。", "군주가 {name}에게 왕관을 하사했다."],
"{name} steals the Crown from {from}.": ["{name} vole la Couronne de {from}.", "{name} stiehlt {from} die Krone.", "{name} roba la Corona a {from}.", "{name} ruba la Corona a {from}.",
  "{name} rouba a Coroa a {from}.", "Ninakaw ni {name} ang Korona mula kay {from}.", "{name} {from} இடமிருந்து கிரீடத்தைத் திருடுகிறது.", "{name} mencuri Mahkota dari {from}.",
  "{name}从{from}手中夺走了王冠。", "{name}從{from}手中奪走了王冠。", "{name}が{from}から王冠を奪った。", "{name}이(가) {from}에게서 왕관을 빼앗았다."],
"The Crown fades away: +{n} Gold.": ["La Couronne se dissipe : +{n} Or.", "Die Krone vergeht: +{n} Gold.", "La Corona se desvanece: +{n} Oro.", "La Corona svanisce: +{n} Oro.",
  "A Coroa desvanece: +{n} Ouro.", "Naglaho ang Korona: +{n} Ginto.", "கிரீடம் மறைகிறது: +{n} தங்கம்.", "Mahkota memudar: +{n} Emas.", "王冠消散了：+{n} 金币。", "王冠消散了：+{n} 金幣。",
  "王冠は消えた：+{n} ゴールド。", "왕관이 사라졌다: 골드 +{n}."],
"{name} pays Tribute: +{n} Gold.": ["{name} perçoit un Tribut : +{n} Or.", "{name} erhält Tribut: +{n} Gold.", "{name} cobra Tributo: +{n} Oro.", "{name} riscuote un Tributo: +{n} Oro.",
  "{name} recebe Tributo: +{n} Ouro.", "Tumanggap ng Tributo si {name}: +{n} Ginto.", "{name} கப்பம் பெறுகிறது: +{n} தங்கம்.", "{name} menerima Upeti: +{n} Emas.",
  "{name}收取贡金：+{n} 金币。", "{name}收取貢金：+{n} 金幣。", "{name}の貢納：+{n} ゴールド。", "{name}이(가) 조공을 받는다: 골드 +{n}."],
"{name} is {title} now.": ["{name} est désormais {title}.", "{name} ist jetzt {title}.", "{name} ahora es {title}.", "{name} ora è {title}.", "{name} agora é {title}.",
  "{title} na ngayon si {name}.", "{name} இப்போது {title}.", "{name} kini {title}.", "{name}现已{title}。", "{name}現已{title}。", "{name}は{title}になった。", "{name}은(는) 이제 {title}."],
"Gold: Tribute and the Crown pay it. It counts 5 toward Gilded.": [
  "Or : le Tribut et la Couronne en donnent. Il compte 5 pour Doré.", "Gold: Tribut und Krone bringen es. Es zählt 5 für Vergoldet.",
  "Oro: lo dan el Tributo y la Corona. Cuenta 5 para Dorado.", "Oro: lo danno il Tributo e la Corona. Conta 5 per Dorato.",
  "Ouro: dão-no o Tributo e a Coroa. Conta 5 para Dourado.", "Ginto: ibinibigay ng Tributo at ng Korona. Bilang na 5 para sa Ginintuan.",
  "தங்கம்: கப்பமும் கிரீடமும் தருகின்றன. பொன்மயத்துக்கு ஒன்றுக்கு 5.", "Emas: diberikan Upeti dan Mahkota. Dihitung 5 untuk Bersepuh Emas.",
  "金币：来自贡金和王冠。每枚为镀金计 5。", "金幣：來自貢金和王冠。每枚為鍍金計 5。", "ゴールド：貢納と王冠で得る。金ぴかでは 1 つ 5 と数える。",
  "골드: 조공과 왕관으로 얻는다. 금빛 조건에서 하나당 5로 친다."],
"{n} skills count: two at most. Plain Flying, Tide, Diurnal, Nocturnal don't count; several count as one.": [
  "{n} compétences comptent : deux au plus. Vol, Marée, Diurne, Nocturne simples ne comptent pas ; plusieurs comptent pour une.",
  "{n} Fähigkeiten zählen: höchstens zwei. Einfaches Fliegend, Flut, Tagaktiv, Nachtaktiv zählen nicht; mehrere zählen als eine.",
  "Cuentan {n} habilidades: dos como máximo. Volador, Marea, Diurno y Nocturno simples no cuentan; varios cuentan como una.",
  "Contano {n} abilità: al massimo due. Volante, Marea, Diurno, Notturno semplici non contano; più di uno contano come una.",
  "Contam {n} habilidades: duas no máximo. Voador, Maré, Diurno, Noturno simples não contam; vários contam como uma.",
  "{n} kakayahan ang bilang: dalawa lang ang pinakamarami. Hindi bilang ang payak na Lumilipad, Alon, Diurnal, Nocturnal; ang ilan ay isa.",
  "{n} திறன்கள் கணக்கில்: அதிகபட்சம் இரண்டு. எளிய பறத்தல், அலை, பகல், இரவு கணக்கில்லை; பல சேர்ந்தால் ஒன்று.",
  "{n} kemampuan dihitung: paling banyak dua. Terbang, Pasang, Diurnal, Nokturnal biasa tidak dihitung; beberapa dihitung satu.",
  "计入 {n} 个技能：最多两个。普通的飞行、潮汐、昼行、夜行不计；多个合计为一个。",
  "計入 {n} 個技能：最多兩個。普通的飛行、潮汐、晝行、夜行不計；多個合計為一個。",
  "数えるスキル {n}：最大 2 つ。素の飛行・潮・昼行性・夜行性は数えず、複数でも 1 つ。",
  "계산되는 스킬 {n}개: 최대 두 개. 일반 비행, 물결, 주행성, 야행성은 세지 않으며 여럿이면 하나로 센다."],
}
assert all(len(v) == len(CODES) for v in T.values())
ph = lambda s: sorted(set(re.findall(r'\{\w+\}', s)))
assert all(ph(k) == ph(t) for k, v in T.items() for t in v)
if __name__ == '__main__':
    for i, code in enumerate(CODES):
        path = os.path.join(ROOT, 'lang', code + '.json')
        items = list((json.load(open(path, encoding='utf-8')) if os.path.exists(path) else {}).items())
        for en, row in T.items():
            j = next((j for j, (k, _) in enumerate(items) if k == en), None)
            if j is not None: items[j] = (en, row[i]); continue
            items.insert(next((j for j, (k, _) in enumerate(items) if k.lower() > en.lower()), len(items)), (en, row[i]))
        with open(path, 'w', encoding='utf-8') as fh:
            json.dump(dict(items), fh, ensure_ascii=False, indent=1); fh.write('\n')
    print('wrote', len(CODES), 'packs,', len(T), 'strings each')
