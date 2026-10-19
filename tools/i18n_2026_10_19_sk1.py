#!/usr/bin/env python3
"""Package SK1 texts (2026-10-19, owner 21:36: new combat skills; Sentry N, Formation, Isolation, Anchor, Expose / Exploit, Punish,
Siege, Spoils, Venom Pulse, and the Cure / Heal / Cleanse split).

    python3 tools/i18n_2026_10_19_sk1.py

1. Puts the English of every new TX key (KEYS) into bramblewood-texts.js, just before the table's end marker (once), and rewrites the
   English of the keys whose rule changed (CHANGED: Exposed is about hiding now).
2. Writes the 12 language packs (lang/<code>.json, keyed by that English; a leading emoji is not part of the key). A row a pack already
   has keeps the pack's own translation. Every {placeholder} is kept. Same layout as i18n_2026_10_19_gi.py.
"""
import json, os, re
ROOT = os.path.join(os.path.dirname(os.path.abspath(__file__)), '..')
CODES = ['fr', 'de', 'es', 'it', 'pt', 'tl', 'ta', 'id', 'zh-Hans', 'zh-Hant', 'ja', 'ko']
LEAD = re.compile(r'^[\s\U0001F000-\U0001FFFF☀-➿️‍⚓⚖]+')
def core(s): return LEAD.sub('', s.strip()).strip()

KEYS = {
 "ui.skn-sentry": "Sentry",
 "ui.skn-expose": "Expose",
 "ui.skn-siege": "Siege",
 "ui.skn-formation": "Formation",
 "ui.skn-isolation": "Isolation",
 "ui.skn-anchor": "Anchor",
 "ui.skn-exploit": "Exploit",
 "ui.skn-spoils": "Spoils",
 "ui.skn-venom-pulse": "Venom Pulse",
 "ui.skn-punish": "Punish",
 "ui.sk-sentry": "When an enemy enters one of the 3 slots facing it, deal {n} damage to it.",
 "ui.sk-sentry-codex": "On Enemy Enters (Facing): Damage N. Played, spawned, stepping up or moved in. Off while Waiting, Stunned, Frozen or Asleep.",
 "ui.sk-expose": "Its hits strip the target's hiding for {n} rounds: Invisible, Evasive, Smoke and Shadow stop working.",
 "ui.sk-expose-codex": "On Hit: Expose N. A Stealth unit is blocked as anyone is. Flying and Swift still dodge.",
 "ui.sk-exploit": "Its hits put {n} Exploit tokens on the target: each later hit on it deals 1 more.",
 "ui.sk-exploit-codex": "On Hit: Exploit N. Each hit uses one token, shots too; Poison and Bleed ticks don't. Armor still counts.",
 "ui.sk-siege": "Deals {n} more damage to Structures and to the enemy bramble.",
 "ui.sk-siege-codex": "Demolisher (Structures) and the old Siege (the bramble) are one skill now. An old Demolisher card reads as Siege.",
 "ui.sk-formation": "+{n}/+{n} for each ally right beside it (behind or in front, in a raid), up to 2.",
 "ui.sk-formation-codex": "Worked out again whenever the board changes. The Health comes and goes with its allies.",
 "ui.sk-isolation": "A drawback: −4/−4 with no ally within 2 columns, 1 less for each ally nearby.",
 "ui.sk-isolation-codex": "0, 1, 2, 3 or 4+ allies within 2 columns: −4, −3, −2, −1 or 0 Attack and Health. Never below 1 Health.",
 "ui.sk-anchor": "Nothing can move it: no push, pull, swap, Wave, Tornado or Restless step.",
 "ui.sk-anchor-codex": "Mind Control can't take it, and Shield Call can't move it aside. It holds a Converging board still.",
 "ui.sk-spoils": "When it kills an enemy creature, it gains +0/+{n}.",
 "ui.sk-spoils-codex": "On Kill (Creature): Buff itself +0/+N. Structures and the bramble are not creatures.",
 "ui.sk-venom-pulse": "Its hits make the target's Poison tick once more, at once.",
 "ui.sk-venom-pulse-n": "Its hits make the target's Poison tick {n} more times, at once.",
 "ui.sk-venom-pulse-codex": "On Hit: Poison Tick. Each tick deals the whole stack; the stack doesn't wear down.",
 "ui.sk-punish": "At the end of the round, each enemy that hit it this round takes {n}.",
 "ui.sk-punish-codex": "Being tried: off unless the Punish flag is on, and on no card yet.",
 "ui.sk-cure": "Every upkeep, cure up to {n} Poison from your most poisoned unit. Poison only.",
 "ui.sk-healing": "Every upkeep, heal your most wounded unit for {n}. It heals Health only.",
 "ui.st-exploit": "each hit on it deals 1 more and uses 1 token.",
 "ui.ls-exploit": "{n} token{s}: each hit on it deals 1 more and uses one.",
 "ui.exploit-tip": "Exploit {n}: its next {n} hit{s} deal 1 more each.",
 "ui.aura-formation-tip": "Formation: +{n}/+{n} from its allies in line",
 "ui.aura-isolation-tip": "Isolation: −{n}/−{n}, too few allies near",
 "ui.log-expose-rounds": "🎯 {att} exposes {name}: no hiding for {n} round{s}.",
 "ui.log-exploit": "🩻 {att} puts {n} Exploit token{s} on {name}.",
 "ui.log-exploit-hit": "🩻 {name} is exploited: +{b} damage ({n} left).",
 "ui.log-exploit-fade": "🩻 No enemy units left to strike {name}: its Exploit tokens fade.",
 "ui.log-poison-pulse": "💉 {att} makes the Poison in {name} pulse.",
 "ui.log-punish": "⚖️ {att} punishes {name} for {dmg}.",
 "ui.log-formation": "🔗 {name} holds formation: +{n}/+{n}.",
 "ui.log-isolation": "🏝️ {name} is isolated: −{n}/−{n}.",
 "ui.log-aura-off": "{name} is back to its own stats.",
 "ui.float-sentry": "🗼 Sentry!",
 "ui.float-exploit": "🩻 Exploit",
 "ui.float-punish": "⚖️ Punished",
 "ui.trg-on-enemy-enter": "On Enemy Enters (Facing)",
 "ui.trg-on-enemy-enter-desc": "an enemy unit enters one of the 3 slots facing this card (played, spawned or moved in)",
 "ui.trg-on-hit": "On Hit",
 "ui.trg-on-hit-desc": "each time this card's melee hit lands (the unit hit is the subject)",
 "ui.trg-on-kill-creature": "On Kill (Creature)",
 "ui.trg-on-kill-creature-desc": "each time this card's blow kills an enemy creature (not a Structure or the bramble)",
 "ui.act-exploit": "Exploit",
 "ui.act-exploit-desc": "Put N Exploit tokens on a chosen target: each later hit on it deals 1 more and uses one.",
 "ui.act-poison-tick": "Poison Tick",
 "ui.act-poison-tick-desc": "The chosen target's Poison ticks N times now, its whole stack each; the stack doesn't wear down.",
 "ui.act-expose-desc": "Expose a chosen target for N rounds: its hiding is stripped (Invisible, Evasive, Smoke, Shadow, Stealth).",
 "ui.act-heal-desc": "Restore a chosen target's Health (this card by default), never above its max. Heal only heals: Cleanse takes Bleed, Cure takes Poison.",
 "ui.act-cleanse-desc": "Remove up to N physical debuffs from a chosen target (this card by default): Bleed, Scar, Corrosion, Brittle, Exposed, Exploit, Shocked, Staggered, shredded Armor, Daunt. Empty: all. Not Poison, Freeze or Stun.",
}
# Keys already in the table whose English changes with the rule (Exposed: hiding stripped for N rounds, no more crit counters).
CHANGED = {
 "ui.st-exposed": "its hiding is stripped: Invisible, Evasive, Smoke and Shadow don’t protect it.",
 "ui.ls-exposed": "no hiding for {n} more round{s}: Invisible, Evasive, Smoke and Shadow don’t protect it.",
 "ui.exposed-tip": "Exposed: no hiding or Evasive dodge for {n} round{s}.",
}

# [fr, de, es, it, pt, tl, ta, id, zh-Hans, zh-Hant, ja, ko], keyed by the English core
T = {
"Sentry": ["Sentinelle", "Wache", "Centinela", "Sentinella", "Sentinela", "Bantay", "காவலன்", "Penjaga", "哨兵", "哨兵", "歩哨", "보초"],
"Expose": ["Exposer", "Entblößen", "Exponer", "Esporre", "Expor", "Ilantad", "வெளிப்படுத்து", "Ungkap", "暴露", "暴露", "暴露", "노출"],
"Siege": ["Siège", "Belagerung", "Asedio", "Assedio", "Cerco", "Pagkubkob", "முற்றுகை", "Pengepungan", "攻城", "攻城", "攻城", "공성"],
"Formation": ["Formation", "Formation", "Formación", "Formazione", "Formação", "Hanay", "அணிவகுப்பு", "Formasi", "阵型", "陣型", "隊列", "대형"],
"Isolation": ["Isolement", "Isolation", "Aislamiento", "Isolamento", "Isolamento", "Pagkakahiwalay", "தனிமை", "Terkucil", "孤立", "孤立", "孤立", "고립"],
"Anchor": ["Ancre", "Anker", "Ancla", "Ancora", "Âncora", "Angkla", "நங்கூரம்", "Jangkar", "锚定", "錨定", "錨", "닻"],
"Exploit": ["Exploiter", "Ausnutzen", "Explotar", "Sfruttare", "Explorar", "Samantalahin", "சுரண்டல்", "Eksploitasi", "破绽", "破綻", "弱点突き", "약점 공략"],
"Spoils": ["Butin", "Beute", "Botín", "Bottino", "Espólio", "Samsam", "கொள்ளைப்பொருள்", "Rampasan", "战利品", "戰利品", "戦利品", "전리품"],
"Venom Pulse": ["Pulsation venimeuse", "Giftpuls", "Pulso venenoso", "Impulso velenoso", "Pulso venenoso", "Pintig ng Lason", "நஞ்சுத் துடிப்பு", "Denyut Bisa", "毒脉冲", "毒脈衝", "毒の脈動", "독 맥동"],
"Punish": ["Châtiment", "Bestrafen", "Castigo", "Punizione", "Punição", "Parusa", "தண்டனை", "Hukuman", "惩戒", "懲戒", "懲罰", "응징"],
"When an enemy enters one of the 3 slots facing it, deal {n} damage to it.": [
  "Quand un ennemi entre dans l’un des 3 emplacements face à elle, lui inflige {n} dégâts.", "Betritt ein Feind eines der 3 Felder vor ihr, erhält er {n} Schaden.",
  "Cuando un enemigo entra en una de las 3 casillas frente a ella, le hace {n} de daño.", "Quando un nemico entra in uno dei 3 spazi di fronte, gli infligge {n} danni.",
  "Quando um inimigo entra num dos 3 espaços à sua frente, causa-lhe {n} de dano.", "Kapag pumasok ang kaaway sa isa sa 3 puwestong kaharap nito, tamaan ito ng {n}.",
  "அதன் எதிரே உள்ள 3 இடங்களில் ஒன்றில் எதிரி நுழைந்தால், அதற்கு {n} சேதம்.", "Saat musuh masuk ke salah satu dari 3 petak di depannya, beri {n} kerusakan.",
  "敌人进入它对面的3个位置之一时，对其造成{n}点伤害。", "敵人進入它對面的3個位置之一時，對其造成{n}點傷害。", "敵が正面の3マスのいずれかに入ると、{n}ダメージを与える。", "적이 맞은편 3칸 중 한 곳에 들어오면 {n} 피해를 줘요."],
"On Enemy Enters (Facing): Damage N. Played, spawned, stepping up or moved in. Off while Waiting, Stunned, Frozen or Asleep.": [
  "À l’entrée d’un ennemi (en face) : Dégâts N. Joué, invoqué, monté d’un rang ou déplacé. Inactive en Attente, Étourdie, Gelée ou Endormie.",
  "Bei Feindeintritt (gegenüber): Schaden N. Gespielt, beschworen, aufgerückt oder hineinbewegt. Aus, solange wartend, betäubt, gefroren oder schlafend.",
  "Al entrar un enemigo (enfrente): Daño N. Jugado, invocado, avanzado o movido. Inactiva mientras Espera, Aturdida, Congelada o Dormida.",
  "All’ingresso di un nemico (di fronte): Danno N. Giocato, evocato, avanzato o spostato. Spenta in Attesa, Stordita, Congelata o Addormentata.",
  "Ao entrar um inimigo (à frente): Dano N. Jogado, invocado, avançado ou movido. Desligada em Espera, Atordoada, Congelada ou Adormecida.",
  "Kapag Pumasok ang Kaaway (Kaharap): Pinsala N. Nilaro, lumitaw, umabante o inilipat. Patay habang Naghihintay, Natigilan, Nagyelo o Tulog.",
  "எதிரி நுழையும்போது (எதிரே): சேதம் N. விளையாடப்பட்டது, தோன்றியது, முன்னேறியது அல்லது நகர்ந்தது. காத்திருப்பு, திகைப்பு, உறைவு, தூக்கத்தில் இயங்காது.",
  "Saat Musuh Masuk (Depan): Kerusakan N. Dimainkan, muncul, maju, atau dipindah. Mati saat Menunggu, Pingsan, Beku, atau Tidur.",
  "敌人进入（对面）时：伤害N。打出、召唤、前移或被移入均算。等待、眩晕、冰冻或沉睡时无效。", "敵人進入（對面）時：傷害N。打出、召喚、前移或被移入均算。等待、暈眩、冰凍或沉睡時無效。",
  "敵が入った時（正面）：Nダメージ。プレイ、召喚、前進、移動のいずれも。待機・スタン・凍結・睡眠中は無効。", "적이 들어올 때(맞은편): 피해 N. 냄, 소환, 전진, 이동 모두 해당. 대기·기절·빙결·수면 중엔 꺼져요."],
"Its hits strip the target's hiding for {n} rounds: Invisible, Evasive, Smoke and Shadow stop working.": [
  "Ses coups ôtent toute cachette à la cible pendant {n} tours : Invisible, Évasion, Fumée et Ombre ne marchent plus.",
  "Ihre Treffer nehmen dem Ziel für {n} Runden jedes Versteck: Unsichtbar, Ausweichen, Rauch und Schatten wirken nicht.",
  "Sus golpes quitan al objetivo su escondite durante {n} rondas: Invisible, Evasión, Humo y Sombra dejan de funcionar.",
  "I suoi colpi tolgono al bersaglio ogni nascondiglio per {n} turni: Invisibile, Elusivo, Fumo e Ombra non funzionano.",
  "Os seus golpes tiram ao alvo o esconderijo por {n} rondas: Invisível, Evasivo, Fumo e Sombra deixam de funcionar.",
  "Inaalis ng mga tama nito ang pagtatago ng target nang {n} round: walang bisa ang Invisible, Evasive, Usok at Anino.",
  "இதன் தாக்குதல்கள் {n} சுற்றுகளுக்கு இலக்கின் மறைவை நீக்கும்: மறைவு, தவிர்ப்பு, புகை, நிழல் வேலை செய்யாது.",
  "Serangannya melepas persembunyian target selama {n} ronde: Tak Terlihat, Mengelak, Asap, dan Bayangan tak berfungsi.",
  "它的攻击让目标{n}回合内无处可藏：隐形、闪避、烟雾和暗影都失效。", "它的攻擊讓目標{n}回合內無處可藏：隱形、閃避、煙霧和暗影都失效。",
  "その攻撃は{n}ラウンドの間、対象の隠れを剥ぐ：透明・回避・煙・影が効かない。", "공격이 {n}라운드 동안 대상의 은신을 벗겨요: 투명, 회피, 연막, 그림자가 통하지 않아요."],
"On Hit: Expose N. A Stealth unit is blocked as anyone is. Flying and Swift still dodge.": [
  "Au coup : Exposer N. Une unité Furtive est bloquée comme les autres. Vol et Vif esquivent encore.",
  "Bei Treffer: Entblößen N. Eine Tarn-Einheit wird wie jede andere geblockt. Flug und Flink weichen weiter aus.",
  "Al golpear: Exponer N. Una unidad Sigilosa queda bloqueada como cualquiera. Vuelo y Rápido aún esquivan.",
  "Al colpo: Esporre N. Un’unità Furtiva viene bloccata come tutte. Volo e Rapido schivano ancora.",
  "Ao acertar: Expor N. Uma unidade Furtiva é bloqueada como qualquer outra. Voo e Veloz ainda esquivam.",
  "Sa Tama: Ilantad N. Nahaharang ang Palihim na unit gaya ng iba. Umiiwas pa rin ang Lumilipad at Mabilis.",
  "தாக்கும்போது: வெளிப்படுத்து N. மறைந்து செல்லும் அலகும் மற்றவை போல் தடுக்கப்படும். பறப்பவையும் வேகமானவையும் இன்னும் தவிர்க்கும்.",
  "Saat Kena: Ungkap N. Unit Siluman tertahan seperti lainnya. Terbang dan Lincah masih bisa mengelak.",
  "命中时：暴露N。潜行单位会像其他单位一样被拦下。飞行和迅捷仍可闪避。", "命中時：暴露N。潛行單位會像其他單位一樣被攔下。飛行和迅捷仍可閃避。",
  "命中時：暴露N。隠密ユニットも他と同じく阻まれる。飛行と俊敏はなお回避する。", "명중 시: 노출 N. 은밀 유닛도 다른 유닛처럼 막혀요. 비행과 신속은 여전히 회피해요."],
"Its hits put {n} Exploit tokens on the target: each later hit on it deals 1 more.": [
  "Ses coups posent {n} jetons Exploiter sur la cible : chaque coup suivant lui inflige 1 de plus.",
  "Ihre Treffer legen {n} Ausnutzen-Marken auf das Ziel: Jeder spätere Treffer macht 1 mehr.",
  "Sus golpes ponen {n} fichas de Explotar en el objetivo: cada golpe posterior hace 1 más.",
  "I suoi colpi mettono {n} segnalini Sfruttare sul bersaglio: ogni colpo successivo infligge 1 in più.",
  "Os seus golpes põem {n} fichas de Explorar no alvo: cada golpe seguinte causa mais 1.",
  "Naglalagay ang mga tama nito ng {n} Samantalahin token sa target: dagdag na 1 sa bawat susunod na tama.",
  "இதன் தாக்குதல்கள் இலக்கில் {n} சுரண்டல் வில்லைகளை வைக்கும்: அடுத்த ஒவ்வொரு தாக்குதலும் 1 அதிகம்.",
  "Serangannya memasang {n} token Eksploitasi pada target: tiap serangan berikutnya memberi 1 lebih.",
  "它的攻击在目标身上放{n}个破绽标记：之后每次命中多造成1点伤害。", "它的攻擊在目標身上放{n}個破綻標記：之後每次命中多造成1點傷害。",
  "その攻撃は対象に弱点トークンを{n}個置く：以後の命中ごとに1多く与える。", "공격이 대상에게 약점 토큰 {n}개를 놓아요: 이후 명중마다 1 더 줘요."],
"On Hit: Exploit N. Each hit uses one token, shots too; Poison and Bleed ticks don't. Armor still counts.": [
  "Au coup : Exploiter N. Chaque coup use un jeton, les tirs aussi ; pas les tics de Poison ou de Saignement. L’Armure compte encore.",
  "Bei Treffer: Ausnutzen N. Jeder Treffer verbraucht eine Marke, Schüsse auch; Gift- und Blutungsticks nicht. Rüstung zählt weiter.",
  "Al golpear: Explotar N. Cada golpe gasta una ficha, también los disparos; los tics de Veneno y Sangrado no. La Armadura sigue contando.",
  "Al colpo: Sfruttare N. Ogni colpo usa un segnalino, anche i tiri; i tick di Veleno e Sanguinamento no. L’Armatura conta ancora.",
  "Ao acertar: Explorar N. Cada golpe gasta uma ficha, os disparos também; os tiques de Veneno e Sangramento não. A Armadura ainda conta.",
  "Sa Tama: Samantalahin N. Bawat tama ay gumagamit ng isang token, pati tira; hindi ang tik ng Lason at Pagdurugo. Bilang pa rin ang Baluti.",
  "தாக்கும்போது: சுரண்டல் N. ஒவ்வொரு தாக்குதலும், எய்தலும், ஒரு வில்லையைச் செலவழிக்கும்; நஞ்சு, இரத்தக் கசிவு துடிப்புகள் அல்ல. கவசம் இன்னும் கணக்கில்.",
  "Saat Kena: Eksploitasi N. Tiap serangan memakai satu token, tembakan juga; detak Racun dan Pendarahan tidak. Zirah tetap dihitung.",
  "命中时：破绽N。每次命中（射击也算）消耗一个标记；中毒和流血的跳伤不算。护甲照常生效。", "命中時：破綻N。每次命中（射擊也算）消耗一個標記；中毒和流血的跳傷不算。護甲照常生效。",
  "命中時：弱点突きN。命中（射撃も）ごとに1個消費。毒と出血の継続ダメージは消費しない。装甲は有効。", "명중 시: 약점 공략 N. 명중(사격 포함)마다 토큰 1개 소모; 독·출혈 피해는 아니에요. 방어구는 그대로 적용돼요."],
"Deals {n} more damage to Structures and to the enemy bramble.": [
  "Inflige {n} dégâts de plus aux Structures et à la ronce ennemie.", "Macht {n} mehr Schaden an Bauwerken und am feindlichen Dornenwall.",
  "Hace {n} más de daño a las Estructuras y a la zarza enemiga.", "Infligge {n} danni in più alle Strutture e al rovo nemico.",
  "Causa mais {n} de dano a Estruturas e à silva inimiga.", "Dagdag na {n} pinsala sa mga Istruktura at sa kalabang tinikan.",
  "கட்டமைப்புகளுக்கும் எதிரியின் முட்புதருக்கும் {n} அதிக சேதம் தரும்.", "Memberi {n} kerusakan lebih ke Bangunan dan semak duri musuh.",
  "对建筑和敌方荆棘多造成{n}点伤害。", "對建築和敵方荊棘多造成{n}點傷害。", "建造物と敵のイバラに{n}多くダメージを与える。", "구조물과 적의 가시덤불에 피해를 {n} 더 줘요."],
"Demolisher (Structures) and the old Siege (the bramble) are one skill now. An old Demolisher card reads as Siege.": [
  "Démolisseur (Structures) et l’ancien Siège (la ronce) ne font plus qu’un. Une ancienne carte Démolisseur se lit comme Siège.",
  "Abrissbirne (Bauwerke) und die alte Belagerung (der Dornenwall) sind jetzt eine Fähigkeit. Eine alte Abrissbirnen-Karte gilt als Belagerung.",
  "Demoledora (Estructuras) y el antiguo Asedio (la zarza) son ahora una sola habilidad. Una carta antigua con Demoledora se lee como Asedio.",
  "Demolitore (Strutture) e il vecchio Assedio (il rovo) ora sono un’unica abilità. Una vecchia carta Demolitore vale come Assedio.",
  "Demolidor (Estruturas) e o antigo Cerco (a silva) são agora uma só habilidade. Uma carta antiga com Demolidor conta como Cerco.",
  "Isang kasanayan na ngayon ang Demolisher (Istruktura) at ang lumang Pagkubkob (tinikan). Ang lumang kard na Demolisher ay binabasa bilang Pagkubkob.",
  "இடிப்பான் (கட்டமைப்புகள்) மற்றும் பழைய முற்றுகை (முட்புதர்) இப்போது ஒரே திறன். பழைய இடிப்பான் அட்டை முற்றுகையாகப் படிக்கப்படும்.",
  "Penghancur (Bangunan) dan Pengepungan lama (semak duri) kini satu skill. Kartu Penghancur lama dibaca sebagai Pengepungan.",
  "拆迁者（建筑）和旧的攻城（荆棘）现已合为一项技能。旧的拆迁者卡牌按攻城计算。", "拆遷者（建築）和舊的攻城（荊棘）現已合為一項技能。舊的拆遷者卡牌按攻城計算。",
  "解体屋（建造物）と旧・攻城（イバラ）は一つのスキルになった。旧解体屋カードは攻城として読む。", "철거꾼(구조물)과 예전 공성(가시덤불)은 이제 한 스킬이에요. 예전 철거꾼 카드는 공성으로 읽어요."],
"+{n}/+{n} for each ally right beside it (behind or in front, in a raid), up to 2.": [
  "+{n}/+{n} par allié juste à côté (derrière ou devant, en raid), jusqu’à 2.", "+{n}/+{n} je Verbündetem direkt daneben (dahinter oder davor, im Raid), bis zu 2.",
  "+{n}/+{n} por cada aliado justo al lado (detrás o delante, en una incursión), hasta 2.", "+{n}/+{n} per ogni alleato accanto (dietro o davanti, in un raid), fino a 2.",
  "+{n}/+{n} por cada aliado mesmo ao lado (atrás ou à frente, num raide), até 2.", "+{n}/+{n} sa bawat kakampi sa tabi nito (likod o harap, sa raid), hanggang 2.",
  "அருகில் உள்ள ஒவ்வொரு நட்புக்கும் (சோதனையில் பின்னோ முன்னோ) +{n}/+{n}, 2 வரை.", "+{n}/+{n} untuk tiap sekutu tepat di sampingnya (belakang atau depan, di raid), maks 2.",
  "紧邻的每个友军（突袭中前后也算）+{n}/+{n}，最多2个。", "緊鄰的每個友軍（突襲中前後也算）+{n}/+{n}，最多2個。", "すぐ隣の味方1体ごとに+{n}/+{n}（レイドでは前後も）、最大2体。", "바로 옆 아군마다(레이드에선 앞뒤도) +{n}/+{n}, 최대 2명."],
"Worked out again whenever the board changes. The Health comes and goes with its allies.": [
  "Recalculé à chaque changement du plateau. La Santé va et vient avec ses alliés.", "Bei jeder Änderung des Spielfelds neu berechnet. Die Gesundheit kommt und geht mit den Verbündeten.",
  "Se recalcula cada vez que cambia el tablero. La Salud va y viene con sus aliados.", "Ricalcolato a ogni cambio del campo. La Salute va e viene con gli alleati.",
  "Recalculado sempre que o tabuleiro muda. A Vida vai e vem com os aliados.", "Kinukuwenta muli tuwing nagbabago ang board. Dumarating at umaalis ang Buhay kasama ng mga kakampi.",
  "பலகை மாறும் ஒவ்வொரு முறையும் மீண்டும் கணக்கிடப்படும். நலம் நட்புகளுடன் வந்து போகும்.", "Dihitung ulang tiap kali papan berubah. Nyawa datang dan pergi bersama sekutunya.",
  "棋盘每次变化都会重新计算。生命随友军增减。", "棋盤每次變化都會重新計算。生命隨友軍增減。", "盤面が変わるたびに再計算。体力は味方とともに増減する。", "판이 바뀔 때마다 다시 계산해요. 체력은 아군과 함께 오르내려요."],
"A drawback: −4/−4 with no ally within 2 columns, 1 less for each ally nearby.": [
  "Un défaut : −4/−4 sans allié à 2 colonnes ou moins, 1 de moins par allié proche.", "Ein Nachteil: −4/−4 ohne Verbündeten in 2 Spalten, je nahem Verbündeten 1 weniger.",
  "Un defecto: −4/−4 sin aliados a 2 columnas o menos, 1 menos por cada aliado cerca.", "Uno svantaggio: −4/−4 senza alleati entro 2 colonne, 1 in meno per ogni alleato vicino.",
  "Uma desvantagem: −4/−4 sem aliados a 2 colunas, menos 1 por cada aliado perto.", "Isang kahinaan: −4/−4 kung walang kakampi sa loob ng 2 hanay, bawas 1 sa bawat malapit na kakampi.",
  "ஒரு குறை: 2 நெடுவரிசைக்குள் நட்பு இல்லையெனில் −4/−4; அருகிலுள்ள ஒவ்வொரு நட்புக்கும் 1 குறைவு.", "Kelemahan: −4/−4 tanpa sekutu dalam 2 kolom, berkurang 1 per sekutu di dekatnya.",
  "缺点：2列内没有友军时−4/−4，每有一个邻近友军少1。", "缺點：2列內沒有友軍時−4/−4，每有一個鄰近友軍少1。", "欠点：2列以内に味方がいないと−4/−4、近くの味方1体ごとに1減る。", "약점: 2열 안에 아군이 없으면 −4/−4, 근처 아군마다 1씩 줄어요."],
"0, 1, 2, 3 or 4+ allies within 2 columns: −4, −3, −2, −1 or 0 Attack and Health. Never below 1 Health.": [
  "0, 1, 2, 3 ou 4+ alliés à 2 colonnes : −4, −3, −2, −1 ou 0 Attaque et Santé. Jamais sous 1 Santé.",
  "0, 1, 2, 3 oder 4+ Verbündete in 2 Spalten: −4, −3, −2, −1 oder 0 Angriff und Gesundheit. Nie unter 1 Gesundheit.",
  "0, 1, 2, 3 o 4+ aliados a 2 columnas: −4, −3, −2, −1 o 0 de Ataque y Salud. Nunca por debajo de 1 de Salud.",
  "0, 1, 2, 3 o 4+ alleati entro 2 colonne: −4, −3, −2, −1 o 0 Attacco e Salute. Mai sotto 1 Salute.",
  "0, 1, 2, 3 ou 4+ aliados a 2 colunas: −4, −3, −2, −1 ou 0 de Ataque e Vida. Nunca abaixo de 1 de Vida.",
  "0, 1, 2, 3 o 4+ kakampi sa loob ng 2 hanay: −4, −3, −2, −1 o 0 Atake at Buhay. Hindi bababa sa 1 Buhay.",
  "2 நெடுவரிசைக்குள் 0, 1, 2, 3 அல்லது 4+ நட்புகள்: −4, −3, −2, −1 அல்லது 0 தாக்குதல், நலம். நலம் 1-க்குக் கீழ் போகாது.",
  "0, 1, 2, 3, atau 4+ sekutu dalam 2 kolom: −4, −3, −2, −1, atau 0 Serangan dan Nyawa. Tak pernah di bawah 1 Nyawa.",
  "2列内有0、1、2、3或4+个友军：攻击和生命−4、−3、−2、−1或0。生命不会低于1。", "2列內有0、1、2、3或4+個友軍：攻擊和生命−4、−3、−2、−1或0。生命不會低於1。",
  "2列以内の味方が0、1、2、3、4+体：攻撃と体力が−4、−3、−2、−1、0。体力は1未満にならない。", "2열 안 아군 0, 1, 2, 3, 4+명: 공격·체력 −4, −3, −2, −1, 0. 체력은 1 아래로 안 내려가요."],
"Nothing can move it: no push, pull, swap, Wave, Tornado or Restless step.": [
  "Rien ne peut la déplacer : ni poussée, ni traction, ni échange, ni Vague, ni Tornade, ni pas Agité.",
  "Nichts kann sie bewegen: kein Stoß, Zug, Tausch, keine Welle, kein Tornado, kein Unruhig-Schritt.",
  "Nada puede moverla: ni empuje, ni tirón, ni intercambio, ni Ola, ni Tornado, ni paso Inquieto.",
  "Niente può spostarla: né spinta, né trazione, né scambio, né Onda, né Tornado, né passo Irrequieto.",
  "Nada a pode mover: nem empurrão, puxão, troca, Onda, Tornado ou passo Inquieto.",
  "Walang makapagpapagalaw dito: walang tulak, hila, palit, Alon, Buhawi o hakbang ng Balisa.",
  "எதுவும் இதை நகர்த்த முடியாது: தள்ளல், இழுப்பு, இடமாற்றம், அலை, சூறாவளி, அமைதியற்ற அடி எதுவும் இல்லை.",
  "Tak ada yang bisa memindahkannya: dorong, tarik, tukar, Ombak, Tornado, atau langkah Gelisah.",
  "任何效果都无法移动它：推、拉、交换、浪潮、龙卷风、躁动都不行。", "任何效果都無法移動它：推、拉、交換、浪潮、龍捲風、躁動都不行。",
  "何もそれを動かせない：押し、引き、入れ替え、波、竜巻、落ち着きのない歩みも。", "무엇도 움직일 수 없어요: 밀기, 당기기, 교체, 파도, 토네이도, 안절부절 이동 모두 안 돼요."],
"Mind Control can't take it, and Shield Call can't move it aside. It holds a Converging board still.": [
  "Le Contrôle mental ne peut pas la prendre, et l’Appel du bouclier ne l’écarte pas. Elle fige un plateau qui Converge.",
  "Gedankenkontrolle kann sie nicht nehmen, Schildruf sie nicht beiseiteschieben. Sie hält ein Zusammenrücken auf.",
  "El Control mental no puede llevársela y la Llamada del escudo no la aparta. Detiene un tablero que Converge.",
  "Il Controllo mentale non può prenderla e il Richiamo dello scudo non la sposta. Blocca un campo che Converge.",
  "O Controlo mental não a pode levar e o Chamado do escudo não a afasta. Segura um tabuleiro que Converge.",
  "Hindi ito makukuha ng Mind Control, at hindi ito maitatabi ng Shield Call. Pinipigil nito ang Converge sa board.",
  "மனக் கட்டுப்பாடு இதை எடுக்க முடியாது, கேடயம் அழைப்பு இதை ஒதுக்க முடியாது. ஒன்றுகூடும் பலகையை அசையாமல் வைக்கும்.",
  "Kendali Pikiran tak bisa mengambilnya, dan Panggilan Perisai tak bisa menggesernya. Ia menahan papan yang Menyatu.",
  "精神控制夺不走它，盾牌召唤也挪不开它。它会让收拢中的棋盘保持不动。", "精神控制奪不走它，盾牌召喚也挪不開它。它會讓收攏中的棋盤保持不動。",
  "精神支配で奪えず、シールドコールでもどかせない。収束する盤面を止める。", "정신 지배로 빼앗을 수 없고, 방패 호출로 비킬 수도 없어요. 모이는 판을 붙잡아 둬요."],
"When it kills an enemy creature, it gains +0/+{n}.": [
  "Quand elle tue une créature ennemie, elle gagne +0/+{n}.", "Tötet sie eine feindliche Kreatur, erhält sie +0/+{n}.", "Cuando mata a una criatura enemiga, gana +0/+{n}.",
  "Quando uccide una creatura nemica, ottiene +0/+{n}.", "Quando mata uma criatura inimiga, ganha +0/+{n}.", "Kapag nakapatay ito ng kalabang nilalang, nakakakuha ito ng +0/+{n}.",
  "எதிரி உயிரினத்தைக் கொல்லும்போது +0/+{n} பெறும்.", "Saat membunuh makhluk musuh, ia mendapat +0/+{n}.", "击杀敌方生物时获得+0/+{n}。", "擊殺敵方生物時獲得+0/+{n}。",
  "敵のクリーチャーを倒すと+0/+{n}を得る。", "적 생물을 처치하면 +0/+{n}을 얻어요."],
"On Kill (Creature): Buff itself +0/+N. Structures and the bramble are not creatures.": [
  "À l’élimination (créature) : se renforce de +0/+N. Les Structures et la ronce ne sont pas des créatures.",
  "Bei Tötung (Kreatur): stärkt sich um +0/+N. Bauwerke und der Dornenwall sind keine Kreaturen.",
  "Al matar (criatura): se refuerza +0/+N. Las Estructuras y la zarza no son criaturas.",
  "All’uccisione (creatura): si potenzia di +0/+N. Strutture e rovo non sono creature.",
  "Ao matar (criatura): reforça-se em +0/+N. Estruturas e a silva não são criaturas.",
  "Kapag Nakapatay (Nilalang): Palakasin ang sarili +0/+N. Hindi nilalang ang mga Istruktura at tinikan.",
  "கொல்லும்போது (உயிரினம்): தன்னை +0/+N வலுப்படுத்தும். கட்டமைப்புகளும் முட்புதரும் உயிரினங்கள் அல்ல.",
  "Saat Membunuh (Makhluk): Perkuat diri +0/+N. Bangunan dan semak duri bukan makhluk.",
  "击杀（生物）时：自身强化+0/+N。建筑和荆棘不算生物。", "擊殺（生物）時：自身強化+0/+N。建築和荊棘不算生物。",
  "撃破時（クリーチャー）：自身を+0/+N強化。建造物とイバラはクリーチャーではない。", "처치 시(생물): 자신 +0/+N 강화. 구조물과 가시덤불은 생물이 아니에요."],
"Its hits make the target's Poison tick once more, at once.": [
  "Ses coups font agir le Poison de la cible une fois de plus, aussitôt.", "Ihre Treffer lassen das Gift des Ziels sofort noch einmal wirken.",
  "Sus golpes hacen que el Veneno del objetivo actúe una vez más, al instante.", "I suoi colpi fanno agire subito ancora una volta il Veleno del bersaglio.",
  "Os seus golpes fazem o Veneno do alvo atuar mais uma vez, de imediato.", "Pinapatik agad ng mga tama nito ang Lason ng target nang isa pang beses.",
  "இதன் தாக்குதல்கள் இலக்கின் நஞ்சை உடனே இன்னொரு முறை துடிக்கச் செய்யும்.", "Serangannya membuat Racun target berdetak sekali lagi, seketika.",
  "它的攻击让目标的中毒立刻再发作一次。", "它的攻擊讓目標的中毒立刻再發作一次。", "その攻撃で対象の毒がすぐにもう一度効く。", "공격하면 대상의 독이 즉시 한 번 더 터져요."],
"Its hits make the target's Poison tick {n} more times, at once.": [
  "Ses coups font agir le Poison de la cible {n} fois de plus, aussitôt.", "Ihre Treffer lassen das Gift des Ziels sofort {n}-mal mehr wirken.",
  "Sus golpes hacen que el Veneno del objetivo actúe {n} veces más, al instante.", "I suoi colpi fanno agire subito il Veleno del bersaglio {n} volte in più.",
  "Os seus golpes fazem o Veneno do alvo atuar mais {n} vezes, de imediato.", "Pinapatik agad ng mga tama nito ang Lason ng target nang {n} pang beses.",
  "இதன் தாக்குதல்கள் இலக்கின் நஞ்சை உடனே இன்னும் {n} முறை துடிக்கச் செய்யும்.", "Serangannya membuat Racun target berdetak {n} kali lagi, seketika.",
  "它的攻击让目标的中毒立刻再发作{n}次。", "它的攻擊讓目標的中毒立刻再發作{n}次。", "その攻撃で対象の毒がすぐにあと{n}回効く。", "공격하면 대상의 독이 즉시 {n}번 더 터져요."],
"On Hit: Poison Tick. Each tick deals the whole stack; the stack doesn't wear down.": [
  "Au coup : Tic de poison. Chaque tic inflige toute la pile ; la pile ne s’use pas.", "Bei Treffer: Giftschlag. Jeder Schlag macht den ganzen Stapel; der Stapel nimmt nicht ab.",
  "Al golpear: Tic de veneno. Cada tic hace toda la pila; la pila no se gasta.", "Al colpo: Tick di veleno. Ogni tick infligge l’intera pila; la pila non cala.",
  "Ao acertar: Tique de veneno. Cada tique causa a pilha toda; a pilha não diminui.", "Sa Tama: Tik ng Lason. Buong patong ang pinsala ng bawat tik; hindi nababawasan ang patong.",
  "தாக்கும்போது: நஞ்சுத் துடிப்பு. ஒவ்வொரு துடிப்பும் முழு அடுக்கையும் தரும்; அடுக்கு குறையாது.", "Saat Kena: Detak Racun. Tiap detak memberi seluruh tumpukan; tumpukan tak berkurang.",
  "命中时：毒发。每次毒发造成全部层数的伤害；层数不减。", "命中時：毒發。每次毒發造成全部層數的傷害；層數不減。", "命中時：毒の発動。毎回スタック全部のダメージ。スタックは減らない。", "명중 시: 독 발동. 매번 중첩 전부만큼 피해; 중첩은 줄지 않아요."],
"At the end of the round, each enemy that hit it this round takes {n}.": [
  "À la fin du tour, chaque ennemi qui l’a frappée ce tour subit {n}.", "Am Rundenende erleidet jeder Feind, der sie in dieser Runde traf, {n}.",
  "Al final de la ronda, cada enemigo que la golpeó en ella recibe {n}.", "A fine turno, ogni nemico che l’ha colpita in questo turno subisce {n}.",
  "No fim da ronda, cada inimigo que a atingiu nessa ronda sofre {n}.", "Sa dulo ng round, tatamaan ng {n} ang bawat kaaway na tumama rito ngayong round.",
  "சுற்றின் முடிவில், இந்தச் சுற்றில் இதைத் தாக்கிய ஒவ்வொரு எதிரியும் {n} பெறும்.", "Di akhir ronde, tiap musuh yang menyerangnya ronde ini menerima {n}.",
  "回合结束时，本回合每个攻击过它的敌人受到{n}点伤害。", "回合結束時，本回合每個攻擊過它的敵人受到{n}點傷害。", "ラウンド終了時、このラウンドにそれを攻撃した敵はそれぞれ{n}受ける。", "라운드가 끝날 때, 이번 라운드에 이 유닛을 친 적은 각각 {n}을 받아요."],
"Being tried: off unless the Punish flag is on, and on no card yet.": [
  "À l’essai : inactif sauf si l’option Châtiment est activée, et sur aucune carte pour l’instant.", "In Erprobung: aus, solange die Bestrafen-Option nicht an ist, und noch auf keiner Karte.",
  "En pruebas: apagado salvo que la opción Castigo esté activa, y aún en ninguna carta.", "In prova: spento finché l’opzione Punizione non è attiva, e ancora su nessuna carta.",
  "Em teste: desligado salvo com a opção Punição ligada, e ainda em nenhuma carta.", "Sinusubok pa: patay maliban kung naka-on ang Parusa, at wala pa sa anumang kard.",
  "சோதனையில்: தண்டனைக் கொடி இயக்கப்படாவிட்டால் இயங்காது; இன்னும் எந்த அட்டையிலும் இல்லை.", "Masih dicoba: mati kecuali bendera Hukuman menyala, dan belum ada di kartu mana pun.",
  "试验中：除非开启惩戒开关，否则无效；目前不在任何卡牌上。", "試驗中：除非開啟懲戒開關，否則無效；目前不在任何卡牌上。", "試験中：懲罰フラグがオンでない限り無効。まだどのカードにもない。", "시험 중: 응징 플래그가 켜져야만 작동하고, 아직 어떤 카드에도 없어요."],
"Every upkeep, cure up to {n} Poison from your most poisoned unit. Poison only.": [
  "À chaque entretien, soigne jusqu’à {n} Poison de votre unité la plus empoisonnée. Le Poison seulement.",
  "In jeder Versorgung bis zu {n} Gift von deiner am stärksten vergifteten Einheit heilen. Nur Gift.",
  "En cada mantenimiento, cura hasta {n} de Veneno de tu unidad más envenenada. Solo Veneno.",
  "A ogni mantenimento, cura fino a {n} Veleno dalla tua unità più avvelenata. Solo Veleno.",
  "Em cada manutenção, cura até {n} de Veneno da tua unidade mais envenenada. Só Veneno.",
  "Sa bawat upkeep, gamutin ang hanggang {n} Lason ng pinakanalasong unit mo. Lason lang.",
  "ஒவ்வொரு பராமரிப்பிலும், உங்கள் அதிகம் நஞ்சூட்டப்பட்ட அலகின் {n} நஞ்சு வரை குணமாக்கும். நஞ்சு மட்டும்.",
  "Tiap pemeliharaan, sembuhkan hingga {n} Racun dari unitmu yang paling teracuni. Hanya Racun.",
  "每次维持阶段，为你中毒最深的单位解除至多{n}层中毒。只解毒。", "每次維持階段，為你中毒最深的單位解除至多{n}層中毒。只解毒。",
  "毎アップキープ、最も毒の強い味方の毒を最大{n}治す。毒のみ。", "매 유지 단계마다 가장 많이 중독된 유닛의 독을 최대 {n} 치료해요. 독만요."],
"Every upkeep, heal your most wounded unit for {n}. It heals Health only.": [
  "À chaque entretien, soigne votre unité la plus blessée de {n}. Elle ne rend que de la Santé.",
  "In jeder Versorgung deine am stärksten verwundete Einheit um {n} heilen. Nur Gesundheit.",
  "En cada mantenimiento, cura {n} a tu unidad más herida. Solo restaura Salud.",
  "A ogni mantenimento, cura di {n} la tua unità più ferita. Ridà solo Salute.",
  "Em cada manutenção, cura {n} à tua unidade mais ferida. Só repõe Vida.",
  "Sa bawat upkeep, pagalingin ng {n} ang pinakasugatang unit mo. Buhay lang ang ibinabalik.",
  "ஒவ்வொரு பராமரிப்பிலும், உங்கள் அதிகம் காயமடைந்த அலகை {n} குணமாக்கும். நலம் மட்டும்.",
  "Tiap pemeliharaan, pulihkan {n} unitmu yang paling terluka. Hanya Nyawa.",
  "每次维持阶段，为你伤势最重的单位恢复{n}点生命。只恢复生命。", "每次維持階段，為你傷勢最重的單位恢復{n}點生命。只恢復生命。",
  "毎アップキープ、最も傷ついた味方を{n}回復。体力のみ回復する。", "매 유지 단계마다 가장 다친 유닛을 {n} 회복해요. 체력만 회복해요."],
"its hiding is stripped: Invisible, Evasive, Smoke and Shadow don’t protect it.": [
  "sa cachette lui est ôtée : Invisible, Évasion, Fumée et Ombre ne la protègent pas.", "ihr Versteck ist weg: Unsichtbar, Ausweichen, Rauch und Schatten schützen sie nicht.",
  "pierde su escondite: Invisible, Evasión, Humo y Sombra no la protegen.", "perde il nascondiglio: Invisibile, Elusivo, Fumo e Ombra non la proteggono.",
  "perde o esconderijo: Invisível, Evasivo, Fumo e Sombra não a protegem.", "naalis ang pagtatago nito: hindi ito pinoprotektahan ng Invisible, Evasive, Usok at Anino.",
  "அதன் மறைவு நீக்கப்பட்டது: மறைவு, தவிர்ப்பு, புகை, நிழல் அதைக் காக்காது.", "persembunyiannya hilang: Tak Terlihat, Mengelak, Asap, dan Bayangan tak melindunginya.",
  "无处可藏：隐形、闪避、烟雾和暗影都保护不了它。", "無處可藏：隱形、閃避、煙霧和暗影都保護不了它。", "隠れを剥がれた：透明・回避・煙・影が守らない。", "은신이 벗겨졌어요: 투명, 회피, 연막, 그림자가 지켜 주지 않아요."],
"no hiding for {n} more round{s}: Invisible, Evasive, Smoke and Shadow don’t protect it.": [
  "sans cachette encore {n} tour(s) : Invisible, Évasion, Fumée et Ombre ne la protègent pas.", "noch {n} Runde(n) ohne Versteck: Unsichtbar, Ausweichen, Rauch und Schatten schützen sie nicht.",
  "sin escondite {n} ronda(s) más: Invisible, Evasión, Humo y Sombra no la protegen.", "senza nascondiglio per altri {n} turni: Invisibile, Elusivo, Fumo e Ombra non la proteggono.",
  "sem esconderijo mais {n} ronda(s): Invisível, Evasivo, Fumo e Sombra não a protegem.", "walang pagtatago sa {n} pang round: hindi ito pinoprotektahan ng Invisible, Evasive, Usok at Anino.",
  "இன்னும் {n} சுற்றுகள் மறைவில்லை: மறைவு, தவிர்ப்பு, புகை, நிழல் அதைக் காக்காது.", "tanpa persembunyian {n} ronde lagi: Tak Terlihat, Mengelak, Asap, dan Bayangan tak melindunginya.",
  "还有{n}回合无处可藏：隐形、闪避、烟雾和暗影都保护不了它。", "還有{n}回合無處可藏：隱形、閃避、煙霧和暗影都保護不了它。", "あと{n}ラウンド隠れられない：透明・回避・煙・影が守らない。", "{n}라운드 더 은신 불가: 투명, 회피, 연막, 그림자가 지켜 주지 않아요."],
"Exposed: no hiding or Evasive dodge for {n} round{s}.": [
  "Exposée : ni cachette ni esquive d’Évasion pendant {n} tour(s).", "Entblößt: kein Versteck, kein Ausweichen für {n} Runde(n).", "Expuesta: sin escondite ni esquiva de Evasión durante {n} ronda(s).",
  "Esposta: niente nascondiglio né schivata Elusiva per {n} turni.", "Exposta: sem esconderijo nem esquiva Evasiva por {n} ronda(s).", "Nalantad: walang pagtatago o Evasive na iwas sa {n} round.",
  "வெளிப்பட்டது: {n} சுற்றுகளுக்கு மறைவோ தவிர்ப்போ இல்லை.", "Terungkap: tanpa persembunyian atau elakan selama {n} ronde.", "暴露：{n}回合内无法隐藏或闪避。", "暴露：{n}回合內無法隱藏或閃避。",
  "暴露：{n}ラウンド、隠れも回避もできない。", "노출: {n}라운드 동안 은신·회피 불가."],
"each hit on it deals 1 more and uses 1 token.": [
  "chaque coup qu’elle reçoit inflige 1 de plus et use 1 jeton.", "jeder Treffer auf sie macht 1 mehr und verbraucht 1 Marke.", "cada golpe que recibe hace 1 más y gasta 1 ficha.",
  "ogni colpo che subisce infligge 1 in più e usa 1 segnalino.", "cada golpe que sofre causa mais 1 e gasta 1 ficha.", "dagdag na 1 ang bawat tama rito at gumagamit ng 1 token.",
  "அதன் மீதான ஒவ்வொரு தாக்குதலும் 1 அதிகம் தந்து 1 வில்லையைச் செலவழிக்கும்.", "tiap serangan padanya memberi 1 lebih dan memakai 1 token.",
  "每次命中它多造成1点伤害并消耗1个标记。", "每次命中它多造成1點傷害並消耗1個標記。", "命中ごとに1多く受け、トークンを1個使う。", "명중마다 1 더 받고 토큰 1개를 써요."],
"{n} token{s}: each hit on it deals 1 more and uses one.": [
  "{n} jeton(s) : chaque coup qu’elle reçoit inflige 1 de plus et en use un.", "{n} Marke(n): jeder Treffer auf sie macht 1 mehr und verbraucht eine.",
  "{n} ficha(s): cada golpe que recibe hace 1 más y gasta una.", "{n} segnalino/i: ogni colpo che subisce infligge 1 in più e ne usa uno.",
  "{n} ficha(s): cada golpe que sofre causa mais 1 e gasta uma.", "{n} token: dagdag na 1 ang bawat tama rito at gumagamit ng isa.",
  "{n} வில்லைகள்: அதன் மீதான ஒவ்வொரு தாக்குதலும் 1 அதிகம் தந்து ஒன்றைச் செலவழிக்கும்.", "{n} token: tiap serangan padanya memberi 1 lebih dan memakai satu.",
  "{n}个标记：每次命中它多造成1点伤害并消耗一个。", "{n}個標記：每次命中它多造成1點傷害並消耗一個。", "トークン{n}個：命中ごとに1多く受け、1個使う。", "토큰 {n}개: 명중마다 1 더 받고 하나를 써요."],
"Exploit {n}: its next {n} hit{s} deal 1 more each.": [
  "Exploiter {n} : ses {n} prochains coups reçus infligent 1 de plus chacun.", "Ausnutzen {n}: die nächsten {n} Treffer auf sie machen je 1 mehr.",
  "Explotar {n}: sus próximos {n} golpes recibidos hacen 1 más cada uno.", "Sfruttare {n}: i prossimi {n} colpi subiti infliggono 1 in più ciascuno.",
  "Explorar {n}: os próximos {n} golpes que sofre causam mais 1 cada.", "Samantalahin {n}: dagdag na 1 ang bawat isa sa susunod na {n} tama rito.",
  "சுரண்டல் {n}: அதன் மீதான அடுத்த {n} தாக்குதல்கள் ஒவ்வொன்றும் 1 அதிகம்.", "Eksploitasi {n}: {n} serangan berikutnya padanya masing-masing memberi 1 lebih.",
  "破绽{n}：接下来{n}次命中它各多造成1点伤害。", "破綻{n}：接下來{n}次命中它各多造成1點傷害。", "弱点突き{n}：次の{n}回の命中はそれぞれ1多い。", "약점 공략 {n}: 다음 {n}번의 명중은 각각 1 더 줘요."],
"Formation: +{n}/+{n} from its allies in line": [
  "Formation : +{n}/+{n} grâce à ses alliés alignés", "Formation: +{n}/+{n} durch Verbündete in Reihe", "Formación: +{n}/+{n} por sus aliados en línea",
  "Formazione: +{n}/+{n} dagli alleati in fila", "Formação: +{n}/+{n} pelos aliados em linha", "Hanay: +{n}/+{n} mula sa mga kakampi sa linya",
  "அணிவகுப்பு: வரிசையில் உள்ள நட்புகளால் +{n}/+{n}", "Formasi: +{n}/+{n} dari sekutu sebaris", "阵型：同排友军带来+{n}/+{n}", "陣型：同排友軍帶來+{n}/+{n}",
  "隊列：並んだ味方から+{n}/+{n}", "대형: 나란한 아군으로 +{n}/+{n}"],
"Isolation: −{n}/−{n}, too few allies near": [
  "Isolement : −{n}/−{n}, trop peu d’alliés proches", "Isolation: −{n}/−{n}, zu wenige Verbündete nah", "Aislamiento: −{n}/−{n}, pocos aliados cerca",
  "Isolamento: −{n}/−{n}, pochi alleati vicini", "Isolamento: −{n}/−{n}, poucos aliados perto", "Pagkakahiwalay: −{n}/−{n}, kulang ang malapit na kakampi",
  "தனிமை: −{n}/−{n}, அருகில் நட்புகள் குறைவு", "Terkucil: −{n}/−{n}, terlalu sedikit sekutu dekat", "孤立：−{n}/−{n}，附近友军太少", "孤立：−{n}/−{n}，附近友軍太少",
  "孤立：−{n}/−{n}、近くの味方が少ない", "고립: −{n}/−{n}, 근처 아군이 너무 적어요"],
"{att} exposes {name}: no hiding for {n} round{s}.": [
  "{att} expose {name} : plus de cachette pendant {n} tour(s).", "{att} entblößt {name}: {n} Runde(n) kein Versteck.", "{att} expone a {name}: sin escondite durante {n} ronda(s).",
  "{att} espone {name}: niente nascondiglio per {n} turni.", "{att} expõe {name}: sem esconderijo por {n} ronda(s).", "Inilantad ng {att} ang {name}: walang pagtatago sa {n} round.",
  "{att} {name}-ஐ வெளிப்படுத்துகிறது: {n} சுற்றுகளுக்கு மறைவில்லை.", "{att} mengungkap {name}: tanpa persembunyian {n} ronde.", "{att}暴露了{name}：{n}回合内无处可藏。", "{att}暴露了{name}：{n}回合內無處可藏。",
  "{att}が{name}を暴露：{n}ラウンド隠れられない。", "{att}이(가) {name}을(를) 노출: {n}라운드 동안 은신 불가."],
"{att} puts {n} Exploit token{s} on {name}.": [
  "{att} pose {n} jeton(s) Exploiter sur {name}.", "{att} legt {n} Ausnutzen-Marke(n) auf {name}.", "{att} pone {n} ficha(s) de Explotar en {name}.",
  "{att} mette {n} segnalino/i Sfruttare su {name}.", "{att} põe {n} ficha(s) de Explorar em {name}.", "Naglagay ang {att} ng {n} Samantalahin token sa {name}.",
  "{att} {name} மீது {n} சுரண்டல் வில்லைகளை வைக்கிறது.", "{att} memasang {n} token Eksploitasi pada {name}.", "{att}在{name}身上放了{n}个破绽标记。", "{att}在{name}身上放了{n}個破綻標記。",
  "{att}が{name}に弱点トークンを{n}個置く。", "{att}이(가) {name}에게 약점 토큰 {n}개를 놓아요."],
"{name} is exploited: +{b} damage ({n} left).": [
  "{name} est exploitée : +{b} dégâts ({n} restant(s)).", "{name} wird ausgenutzt: +{b} Schaden ({n} übrig).", "{name} es explotada: +{b} de daño (quedan {n}).",
  "{name} viene sfruttata: +{b} danni ({n} rimasti).", "{name} é explorada: +{b} de dano (restam {n}).", "Sinamantala ang {name}: +{b} pinsala ({n} natitira).",
  "{name} சுரண்டப்படுகிறது: +{b} சேதம் ({n} மீதம்).", "{name} dieksploitasi: +{b} kerusakan (sisa {n}).", "{name}被抓住破绽：+{b}伤害（剩{n}个）。", "{name}被抓住破綻：+{b}傷害（剩{n}個）。",
  "{name}の弱点を突く：+{b}ダメージ（残り{n}）。", "{name}의 약점을 공략: 피해 +{b} (남은 {n})."],
"No enemy units left to strike {name}: its Exploit tokens fade.": [
  "Plus aucune unité ennemie pour frapper {name} : ses jetons Exploiter s’effacent.", "Keine feindliche Einheit mehr, die {name} trifft: ihre Ausnutzen-Marken verblassen.",
  "No quedan unidades enemigas para golpear a {name}: sus fichas de Explotar se desvanecen.", "Nessuna unità nemica può colpire {name}: i suoi segnalini Sfruttare svaniscono.",
  "Não restam unidades inimigas para atingir {name}: as suas fichas de Explorar desvanecem.", "Wala nang kaaway na tatama sa {name}: naglalaho ang mga Samantalahin token nito.",
  "{name}-ஐத் தாக்க எதிரி அலகுகள் இல்லை: அதன் சுரண்டல் வில்லைகள் மறைகின்றன.", "Tak ada unit musuh tersisa untuk menyerang {name}: token Eksploitasinya memudar.",
  "已没有敌方单位能攻击{name}：它的破绽标记消散了。", "已沒有敵方單位能攻擊{name}：它的破綻標記消散了。", "{name}を打つ敵ユニットがいない：弱点トークンが消える。", "{name}을(를) 칠 적 유닛이 없어요: 약점 토큰이 사라져요."],
"{att} makes the Poison in {name} pulse.": [
  "{att} fait palpiter le Poison de {name}.", "{att} lässt das Gift in {name} pulsieren.", "{att} hace latir el Veneno de {name}.",
  "{att} fa pulsare il Veleno in {name}.", "{att} faz pulsar o Veneno em {name}.", "Pinapintig ng {att} ang Lason sa {name}.",
  "{att} {name}-இல் உள்ள நஞ்சைத் துடிக்கச் செய்கிறது.", "{att} membuat Racun dalam {name} berdenyut.", "{att}让{name}体内的毒素发作。", "{att}讓{name}體內的毒素發作。",
  "{att}が{name}の毒を脈打たせる。", "{att}이(가) {name}의 독을 맥동시켜요."],
"{att} punishes {name} for {dmg}.": [
  "{att} châtie {name} : {dmg}.", "{att} bestraft {name} mit {dmg}.", "{att} castiga a {name} con {dmg}.", "{att} punisce {name} per {dmg}.", "{att} pune {name} com {dmg}.",
  "Pinarusahan ng {att} ang {name} ng {dmg}.", "{att} {name}-ஐ {dmg} கொண்டு தண்டிக்கிறது.", "{att} menghukum {name} sebesar {dmg}.", "{att}惩戒了{name}，造成{dmg}点伤害。", "{att}懲戒了{name}，造成{dmg}點傷害。",
  "{att}が{name}を懲罰：{dmg}。", "{att}이(가) {name}을(를) 응징: {dmg}."],
"{name} holds formation: +{n}/+{n}.": [
  "{name} tient la formation : +{n}/+{n}.", "{name} hält die Formation: +{n}/+{n}.", "{name} mantiene la formación: +{n}/+{n}.", "{name} tiene la formazione: +{n}/+{n}.",
  "{name} mantém a formação: +{n}/+{n}.", "Nananatili sa hanay ang {name}: +{n}/+{n}.", "{name} அணிவகுப்பில் நிற்கிறது: +{n}/+{n}.", "{name} menjaga formasi: +{n}/+{n}.",
  "{name}保持阵型：+{n}/+{n}。", "{name}保持陣型：+{n}/+{n}。", "{name}が隊列を組む：+{n}/+{n}。", "{name}이(가) 대형을 유지: +{n}/+{n}."],
"{name} is isolated: −{n}/−{n}.": [
  "{name} est isolée : −{n}/−{n}.", "{name} ist isoliert: −{n}/−{n}.", "{name} está aislada: −{n}/−{n}.", "{name} è isolata: −{n}/−{n}.", "{name} está isolada: −{n}/−{n}.",
  "Nakahiwalay ang {name}: −{n}/−{n}.", "{name} தனிமையில்: −{n}/−{n}.", "{name} terkucil: −{n}/−{n}.", "{name}陷入孤立：−{n}/−{n}。", "{name}陷入孤立：−{n}/−{n}。",
  "{name}は孤立：−{n}/−{n}。", "{name}이(가) 고립: −{n}/−{n}."],
"{name} is back to its own stats.": [
  "{name} retrouve ses propres stats.", "{name} hat wieder ihre eigenen Werte.", "{name} vuelve a sus propias estadísticas.", "{name} torna alle sue statistiche.",
  "{name} volta às suas estatísticas.", "Bumalik sa sariling stats ang {name}.", "{name} தன் சொந்த மதிப்புகளுக்குத் திரும்புகிறது.", "{name} kembali ke statistiknya sendiri.",
  "{name}恢复原本的属性。", "{name}恢復原本的屬性。", "{name}は元の能力値に戻る。", "{name}이(가) 원래 능력치로 돌아와요."],
"Sentry!": ["Sentinelle !", "Wache!", "¡Centinela!", "Sentinella!", "Sentinela!", "Bantay!", "காவல்!", "Penjaga!", "哨兵！", "哨兵！", "歩哨！", "보초!"],
"Punished": ["Châtiée", "Bestraft", "Castigada", "Punita", "Punida", "Pinarusahan", "தண்டிக்கப்பட்டது", "Dihukum", "受惩戒", "受懲戒", "懲罰", "응징당함"],
"On Enemy Enters (Facing)": ["À l’entrée d’un ennemi (en face)", "Bei Feindeintritt (gegenüber)", "Al entrar un enemigo (enfrente)", "All’ingresso di un nemico (di fronte)",
  "Ao entrar um inimigo (à frente)", "Kapag Pumasok ang Kaaway (Kaharap)", "எதிரி நுழையும்போது (எதிரே)", "Saat Musuh Masuk (Depan)", "敌人进入时（对面）", "敵人進入時（對面）", "敵が入った時（正面）", "적이 들어올 때(맞은편)"],
"an enemy unit enters one of the 3 slots facing this card (played, spawned or moved in)": [
  "une unité ennemie entre dans l’un des 3 emplacements face à cette carte (jouée, invoquée ou déplacée)", "eine feindliche Einheit betritt eines der 3 Felder vor dieser Karte (gespielt, beschworen oder hineinbewegt)",
  "una unidad enemiga entra en una de las 3 casillas frente a esta carta (jugada, invocada o movida)", "un’unità nemica entra in uno dei 3 spazi di fronte a questa carta (giocata, evocata o spostata)",
  "uma unidade inimiga entra num dos 3 espaços à frente desta carta (jogada, invocada ou movida)", "pumasok ang kalabang unit sa isa sa 3 puwestong kaharap ng kard na ito (nilaro, lumitaw o inilipat)",
  "இந்த அட்டையின் எதிரே உள்ள 3 இடங்களில் ஒன்றில் எதிரி அலகு நுழைகிறது (விளையாடப்பட்டு, தோன்றி அல்லது நகர்ந்து)", "unit musuh masuk ke salah satu dari 3 petak di depan kartu ini (dimainkan, muncul, atau dipindah)",
  "敌方单位进入此卡对面的3个位置之一（打出、召唤或被移入）", "敵方單位進入此卡對面的3個位置之一（打出、召喚或被移入）", "敵ユニットがこのカードの正面3マスのいずれかに入る（プレイ、召喚、移動）", "적 유닛이 이 카드 맞은편 3칸 중 한 곳에 들어올 때(냄, 소환, 이동)"],
"On Hit": ["Au coup", "Bei Treffer", "Al golpear", "Al colpo", "Ao acertar", "Sa Tama", "தாக்கும்போது", "Saat Kena", "命中时", "命中時", "命中時", "명중 시"],
"each time this card's melee hit lands (the unit hit is the subject)": [
  "chaque fois que le coup au corps à corps de cette carte porte (l’unité frappée est le sujet)", "jedes Mal, wenn der Nahkampftreffer dieser Karte sitzt (die getroffene Einheit ist das Subjekt)",
  "cada vez que el golpe cuerpo a cuerpo de esta carta acierta (la unidad golpeada es el sujeto)", "ogni volta che il colpo in mischia di questa carta va a segno (l’unità colpita è il soggetto)",
  "sempre que o golpe corpo a corpo desta carta acerta (a unidade atingida é o sujeito)", "tuwing tumatama ang suntok ng kard na ito (ang natamaang unit ang paksa)",
  "இந்த அட்டையின் நேரடித் தாக்குதல் படும் ஒவ்வொரு முறையும் (தாக்கப்பட்ட அலகே பொருள்)", "tiap kali serangan jarak dekat kartu ini kena (unit yang kena adalah subjeknya)",
  "每当此卡的近战攻击命中（被命中的单位即目标对象）", "每當此卡的近戰攻擊命中（被命中的單位即目標對象）", "このカードの近接攻撃が当たるたび（当たったユニットが対象）", "이 카드의 근접 공격이 맞을 때마다(맞은 유닛이 대상)"],
"On Kill (Creature)": ["À l’élimination (créature)", "Bei Tötung (Kreatur)", "Al matar (criatura)", "All’uccisione (creatura)", "Ao matar (criatura)", "Kapag Nakapatay (Nilalang)",
  "கொல்லும்போது (உயிரினம்)", "Saat Membunuh (Makhluk)", "击杀时（生物）", "擊殺時（生物）", "撃破時（クリーチャー）", "처치 시(생물)"],
"each time this card's blow kills an enemy creature (not a Structure or the bramble)": [
  "chaque fois qu’un coup de cette carte tue une créature ennemie (pas une Structure ni la ronce)", "jedes Mal, wenn ein Schlag dieser Karte eine feindliche Kreatur tötet (kein Bauwerk, nicht der Dornenwall)",
  "cada vez que un golpe de esta carta mata a una criatura enemiga (no una Estructura ni la zarza)", "ogni volta che un colpo di questa carta uccide una creatura nemica (non una Struttura né il rovo)",
  "sempre que um golpe desta carta mata uma criatura inimiga (não uma Estrutura nem a silva)", "tuwing nakapapatay ang tama ng kard na ito ng kalabang nilalang (hindi Istruktura o tinikan)",
  "இந்த அட்டையின் அடி ஒரு எதிரி உயிரினத்தைக் கொல்லும் ஒவ்வொரு முறையும் (கட்டமைப்போ முட்புதரோ அல்ல)", "tiap kali pukulan kartu ini membunuh makhluk musuh (bukan Bangunan atau semak duri)",
  "每当此卡的攻击击杀一个敌方生物（建筑和荆棘不算）", "每當此卡的攻擊擊殺一個敵方生物（建築和荊棘不算）", "このカードの一撃が敵クリーチャーを倒すたび（建造物とイバラは除く）", "이 카드의 일격이 적 생물을 처치할 때마다(구조물·가시덤불 제외)"],
"Put N Exploit tokens on a chosen target: each later hit on it deals 1 more and uses one.": [
  "Pose N jetons Exploiter sur une cible choisie : chaque coup suivant lui inflige 1 de plus et en use un.", "Lege N Ausnutzen-Marken auf ein gewähltes Ziel: jeder spätere Treffer macht 1 mehr und verbraucht eine.",
  "Pon N fichas de Explotar en un objetivo elegido: cada golpe posterior hace 1 más y gasta una.", "Metti N segnalini Sfruttare su un bersaglio scelto: ogni colpo successivo infligge 1 in più e ne usa uno.",
  "Põe N fichas de Explorar num alvo escolhido: cada golpe seguinte causa mais 1 e gasta uma.", "Maglagay ng N Samantalahin token sa napiling target: dagdag na 1 sa bawat susunod na tama at gumagamit ng isa.",
  "தேர்ந்த இலக்கில் N சுரண்டல் வில்லைகளை வை: அடுத்த ஒவ்வொரு தாக்குதலும் 1 அதிகம் தந்து ஒன்றைச் செலவழிக்கும்.", "Pasang N token Eksploitasi pada target pilihan: tiap serangan berikutnya memberi 1 lebih dan memakai satu.",
  "在所选目标身上放N个破绽标记：之后每次命中多造成1点伤害并消耗一个。", "在所選目標身上放N個破綻標記：之後每次命中多造成1點傷害並消耗一個。",
  "選んだ対象に弱点トークンをN個置く：以後の命中ごとに1多く与え、1個使う。", "고른 대상에게 약점 토큰 N개를 놓아요: 이후 명중마다 1 더 주고 하나를 써요."],
"Poison Tick": ["Tic de poison", "Giftschlag", "Tic de veneno", "Tick di veleno", "Tique de veneno", "Tik ng Lason", "நஞ்சுத் துடிப்பு", "Detak Racun", "毒发", "毒發", "毒の発動", "독 발동"],
"The chosen target's Poison ticks N times now, its whole stack each; the stack doesn't wear down.": [
  "Le Poison de la cible choisie agit N fois tout de suite, toute la pile à chaque fois ; la pile ne s’use pas.", "Das Gift des gewählten Ziels wirkt sofort N-mal, jedes Mal der ganze Stapel; der Stapel nimmt nicht ab.",
  "El Veneno del objetivo elegido actúa N veces ya, toda la pila cada vez; la pila no se gasta.", "Il Veleno del bersaglio scelto agisce subito N volte, l’intera pila ogni volta; la pila non cala.",
  "O Veneno do alvo escolhido atua N vezes já, a pilha toda de cada vez; a pilha não diminui.", "Pumipitik ngayon nang N beses ang Lason ng napiling target, buong patong bawat isa; hindi nababawasan ang patong.",
  "தேர்ந்த இலக்கின் நஞ்சு இப்போதே N முறை துடிக்கும், ஒவ்வொரு முறையும் முழு அடுக்கு; அடுக்கு குறையாது.", "Racun target pilihan berdetak N kali sekarang, seluruh tumpukan tiap kali; tumpukan tak berkurang.",
  "所选目标的中毒立刻发作N次，每次造成全部层数的伤害；层数不减。", "所選目標的中毒立刻發作N次，每次造成全部層數的傷害；層數不減。",
  "選んだ対象の毒が今すぐN回発動、毎回スタック全部。スタックは減らない。", "고른 대상의 독이 지금 N번 터져요, 매번 중첩 전부만큼; 중첩은 줄지 않아요."],
"Expose a chosen target for N rounds: its hiding is stripped (Invisible, Evasive, Smoke, Shadow, Stealth).": [
  "Expose une cible choisie pendant N tours : sa cachette lui est ôtée (Invisible, Évasion, Fumée, Ombre, Furtivité).", "Entblößt ein gewähltes Ziel für N Runden: kein Versteck mehr (Unsichtbar, Ausweichen, Rauch, Schatten, Tarnung).",
  "Expone a un objetivo elegido durante N rondas: pierde su escondite (Invisible, Evasión, Humo, Sombra, Sigilo).", "Espone un bersaglio scelto per N turni: perde il nascondiglio (Invisibile, Elusivo, Fumo, Ombra, Furtività).",
  "Expõe um alvo escolhido por N rondas: perde o esconderijo (Invisível, Evasivo, Fumo, Sombra, Furtividade).", "Ilantad ang napiling target nang N round: naaalis ang pagtatago nito (Invisible, Evasive, Usok, Anino, Palihim).",
  "தேர்ந்த இலக்கை N சுற்றுகள் வெளிப்படுத்து: அதன் மறைவு நீக்கப்படும் (மறைவு, தவிர்ப்பு, புகை, நிழல், மறைந்து செல்லல்).", "Ungkap target pilihan selama N ronde: persembunyiannya hilang (Tak Terlihat, Mengelak, Asap, Bayangan, Siluman).",
  "暴露所选目标N回合：使其无处可藏（隐形、闪避、烟雾、暗影、潜行）。", "暴露所選目標N回合：使其無處可藏（隱形、閃避、煙霧、暗影、潛行）。",
  "選んだ対象をNラウンド暴露：隠れを剥ぐ（透明・回避・煙・影・隠密）。", "고른 대상을 N라운드 노출: 은신을 벗겨요(투명, 회피, 연막, 그림자, 은밀)."],
"Restore a chosen target's Health (this card by default), never above its max. Heal only heals: Cleanse takes Bleed, Cure takes Poison.": [
  "Rend de la Santé à une cible choisie (cette carte par défaut), jamais au-delà du max. Soigner ne fait que soigner : Purifier ôte le Saignement, Guérir le Poison.",
  "Stellt die Gesundheit eines gewählten Ziels her (standardmäßig diese Karte), nie über das Maximum. Heilen heilt nur: Reinigen nimmt Blutung, Kurieren Gift.",
  "Restaura la Salud de un objetivo elegido (esta carta por defecto), nunca por encima del máximo. Curar solo cura: Purificar quita Sangrado, Sanar quita Veneno.",
  "Ridà Salute a un bersaglio scelto (questa carta di base), mai oltre il massimo. Curare cura e basta: Purificare toglie il Sanguinamento, Guarire il Veleno.",
  "Repõe a Vida de um alvo escolhido (esta carta por defeito), nunca acima do máximo. Curar só cura: Purificar tira Sangramento, Sarar tira Veneno.",
  "Ibalik ang Buhay ng napiling target (ang kard na ito kung wala), hindi lalampas sa max. Paggaling lang ang Heal: Cleanse sa Pagdurugo, Cure sa Lason.",
  "தேர்ந்த இலக்கின் நலத்தை மீட்கும் (இயல்பாக இந்த அட்டை), அதிகபட்சத்தை மீறாது. குணமாக்கல் குணமாக்க மட்டும்: தூய்மை இரத்தக் கசிவை, மருந்து நஞ்சை நீக்கும்.",
  "Pulihkan Nyawa target pilihan (kartu ini secara bawaan), tak melebihi maks. Sembuh hanya menyembuhkan: Bersihkan untuk Pendarahan, Obati untuk Racun.",
  "为所选目标恢复生命（默认此卡），不超过上限。治疗只回血：净化去流血，解毒去中毒。", "為所選目標恢復生命（預設此卡），不超過上限。治療只回血：淨化去流血，解毒去中毒。",
  "選んだ対象（既定はこのカード）の体力を回復、最大値まで。回復は回復だけ：出血は浄化、毒は治療で消す。", "고른 대상(기본은 이 카드)의 체력을 회복, 최대치까지. 치유는 치유만: 출혈은 정화, 독은 해독으로."],
"Remove up to N physical debuffs from a chosen target (this card by default): Bleed, Scar, Corrosion, Brittle, Exposed, Exploit, Shocked, Staggered, shredded Armor, Daunt. Empty: all. Not Poison, Freeze or Stun.": [
  "Retire jusqu’à N affaiblissements physiques d’une cible choisie (cette carte par défaut) : Saignement, Cicatrice, Corrosion, Fragile, Exposé, Exploiter, Choc, Chancelant, Armure déchirée, Intimidation. Vide : tous. Pas le Poison, le Gel ni l’Étourdissement.",
  "Entfernt bis zu N körperliche Schwächungen von einem gewählten Ziel (standardmäßig diese Karte): Blutung, Narbe, Korrosion, Spröde, Entblößt, Ausnutzen, Schock, Taumeln, zerfetzte Rüstung, Einschüchterung. Leer: alle. Nicht Gift, Frost oder Betäubung.",
  "Quita hasta N debilitaciones físicas de un objetivo elegido (esta carta por defecto): Sangrado, Cicatriz, Corrosión, Quebradizo, Expuesto, Explotar, Choque, Tambaleo, Armadura rota, Intimidación. Vacío: todas. No Veneno, Congelación ni Aturdimiento.",
  "Rimuove fino a N indebolimenti fisici da un bersaglio scelto (questa carta di base): Sanguinamento, Cicatrice, Corrosione, Fragile, Esposto, Sfruttare, Shock, Barcollo, Armatura lacerata, Intimidazione. Vuoto: tutti. Non Veleno, Gelo né Stordimento.",
  "Remove até N enfraquecimentos físicos de um alvo escolhido (esta carta por defeito): Sangramento, Cicatriz, Corrosão, Quebradiço, Exposto, Explorar, Choque, Cambaleio, Armadura rasgada, Intimidação. Vazio: todos. Não Veneno, Congelamento nem Atordoamento.",
  "Alisin ang hanggang N pisikal na debuff ng napiling target (ang kard na ito kung wala): Pagdurugo, Peklat, Kalawang, Marupok, Nalantad, Samantalahin, Kuryente, Pagsuray, punit na Baluti, Pananakot. Walang laman: lahat. Hindi Lason, Yelo o Pagkatigil.",
  "தேர்ந்த இலக்கிலிருந்து (இயல்பாக இந்த அட்டை) N வரை உடல் பலவீனங்களை நீக்கும்: இரத்தக் கசிவு, தழும்பு, அரிப்பு, நொறுங்கல், வெளிப்பாடு, சுரண்டல், மின்னதிர்ச்சி, தடுமாற்றம், கிழிந்த கவசம், அச்சுறுத்தல். காலியெனில்: அனைத்தும். நஞ்சு, உறைவு, திகைப்பு அல்ல.",
  "Hapus hingga N pelemahan fisik dari target pilihan (kartu ini secara bawaan): Pendarahan, Luka, Korosi, Rapuh, Terungkap, Eksploitasi, Sengatan, Terhuyung, Zirah koyak, Gentar. Kosong: semua. Bukan Racun, Beku, atau Pingsan.",
  "移除所选目标（默认此卡）至多N个物理减益：流血、伤疤、腐蚀、易碎、暴露、破绽、感电、踉跄、破损护甲、威吓。留空：全部。不含中毒、冰冻和眩晕。",
  "移除所選目標（預設此卡）至多N個物理減益：流血、傷疤、腐蝕、易碎、暴露、破綻、感電、踉蹌、破損護甲、威嚇。留空：全部。不含中毒、冰凍和暈眩。",
  "選んだ対象（既定はこのカード）の物理的な弱体を最大N個消す：出血、傷跡、腐食、もろい、暴露、弱点、感電、よろめき、裂けた装甲、威圧。空欄：すべて。毒・凍結・スタンは除く。",
  "고른 대상(기본은 이 카드)의 물리 약화를 최대 N개 제거: 출혈, 흉터, 부식, 취약, 노출, 약점 공략, 감전, 비틀거림, 찢긴 방어구, 위협. 비우면 전부. 독·빙결·기절은 제외."],
}
# floats whose core is a single word already in T
T["Exploit"] = T["Exploit"]

def write_pack(path, rows, i, keep_existing=True):
    pack = json.load(open(path, encoding='utf-8')) if os.path.exists(path) else {}
    items = list(pack.items())
    have = set(pack)
    for en, row in rows.items():
        if en in have and keep_existing: continue
        at = next((j for j, (k, _) in enumerate(items) if k.lower() > en.lower()), len(items))
        items.insert(at, (en, row[i]))
    with open(path, 'w', encoding='utf-8') as fh:
        json.dump(dict(items), fh, ensure_ascii=False, indent=1); fh.write('\n')

if __name__ == '__main__':
    allk = dict(KEYS); allk.update(CHANGED)
    for k, en in allk.items():
        c = core(en); assert c in T, (k, c)
        want = sorted(set(re.findall(r'\{\w+\}', c)) - {'{s}'}) # {s} is the English plural ending; the packs leave it out (as before)
        for code, tr in zip(CODES, T[c]): assert sorted(set(re.findall(r'\{\w+\}', tr)) - {'{s}'}) == want, (k, code, tr)
    for en, row in T.items(): assert len(row) == 12, en
    tp = os.path.join(ROOT, 'bramblewood-texts.js'); src = open(tp, encoding='utf-8').read()
    end = '\n}/*TEXT-TABLE-END*/'; assert src.count(end) == 1
    own = {k: v for k, v in KEYS.items() if ('"%s":' % k) in src}; own.update(CHANGED) # SK1's own keys keep their English in step with KEYS
    for k, en in own.items():
        pat = re.compile(r'(\n  "%s": )"(?:[^"\\]|\\.)*"' % re.escape(k)); assert pat.search(src), k
        src = pat.sub(lambda m: m.group(1) + json.dumps(en, ensure_ascii=False), src, count=1)
    add = [k for k in KEYS if ('"%s":' % k) not in src]
    if add:
        body = ''.join(',\n  %s: %s' % (json.dumps(k), json.dumps(KEYS[k], ensure_ascii=False)) for k in add)
        src = src.replace(end, body + end)
    open(tp, 'w', encoding='utf-8').write(src)
    for i, code in enumerate(CODES):
        write_pack(os.path.join(ROOT, 'lang', code + '.json'), T, i)
    print('TX keys added:', len(add), '| changed:', len(CHANGED), '| packs:', len(CODES), 'x', len(T), 'texts')
