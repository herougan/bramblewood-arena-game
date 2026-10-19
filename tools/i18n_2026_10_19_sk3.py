#!/usr/bin/env python3
"""Package SK3 texts (2026-10-19, owner 21:56 / 21:59 / 22:08: skills batch 3; the rules are in bramblewood-engine.js, the Package SK3 block).

    python3 tools/i18n_2026_10_19_sk3.py

1. Puts the English of every new TX key (KEYS) into bramblewood-texts.js, just before the table's end marker (once). The keys in CHANGED
   (Hunter shown as "Cull", Executioner's 25%, Hunter's Codex note) get their new English in place.
2. Writes the 12 language packs (lang/<code>.json, keyed by that English; a leading emoji is not part of the key). A row a pack already
   has keeps the pack's own translation.
3. The new spell cards' names (lang/cards/<code>.json) and flavour lines (lang/ui/<code>.json).
Every {placeholder} is kept. Same layout as i18n_2026_10_19_gi.py.
"""
import json, os, re
ROOT = os.path.join(os.path.dirname(os.path.abspath(__file__)), '..')
CODES = ['fr', 'de', 'es', 'it', 'pt', 'tl', 'ta', 'id', 'zh-Hans', 'zh-Hant', 'ja', 'ko']
LEAD = re.compile(r'^[\s\U0001F000-\U0001FFFF☀-➿️‍]+')
def core(s): return LEAD.sub('', s.strip()).strip()

KEYS = {
 "ui.skn-spawner": "Spawner", "ui.skn-banner": "War Banner", "ui.skn-warcry": "Warcry", "ui.skn-shieldwall": "Shieldwall",
 "ui.skn-corpsefeeder": "Corpsefeeder", "ui.skn-amplifier": "Amplifier", "ui.skn-stench": "Stench", "ui.skn-broodkeeper": "Broodkeeper",
 "ui.skn-herald": "Herald", "ui.skn-harbinger": "Harbinger", "ui.skn-spotter": "Spotter", "ui.skn-silence": "Silence",
 "ui.skn-stymie": "Stymie", "ui.skn-exhaust": "Exhaust", "ui.skn-petrify": "Petrify",
 "ui.sk3-spawner": "While Ready, it spawns {card} into a free slot beside it every turn.",
 "ui.sk3-spawner-codex": "An On Turn Start trigger: off while it is Waiting, Stunned, Frozen or Asleep. No free slot beside it, no spawn.",
 "ui.sk3-banner": "Your other units have +{n}/+{n} while it lives.",
 "ui.sk3-warcry": "When played, your other units get +{n}/+{n}.",
 "ui.sk3-shieldwall": "The allies beside it have +{n} Armor while it lives.",
 "ui.sk3-corpsefeeder": "Each turn while Ready, it exiles your oldest graveyard card and gains +{n}/+{n}.",
 "ui.sk3-corpsefeeder-codex": "An empty graveyard feeds nothing. The exile is a real one: you get an Echo and On Exile fires.",
 "ui.sk3-amplifier": "The allies beside it have +{n} on each skill number, up to +{cap}.",
 "ui.sk3-amplifier-codex": "Poison 2 becomes 3, Thorns 1 becomes 2. Not itself and not triggers; several Amplifiers together add at most +2.",
 "ui.sk3-stench": "When played, {n} Stench on the enemy facing it and those beside it.",
 "ui.sk3-stench-codex": "Each Stench token is −1 Attack, up to −3. A Wave or wash of N washes N off; the Tide washes 1 each round. Flyers are above it.",
 "ui.sk3-broodkeeper": "Your units made by abilities arrive with +{n}/+{n}.",
 "ui.sk3-herald": "Your Leader has +{n}/+{n} while it lives.",
 "ui.sk3-herald-codex": "Your Leader: the deck's leader card, a Gladiator leader or a Natural Leader on the field.",
 "ui.sk3-harbinger": "Whenever another unit dies, on either side, it gains +{n}/+{n} (up to {cap} a round).",
 "ui.sk3-harbinger-codex": "An On Any Death trigger: off while it is Waiting, Stunned, Frozen or Asleep.",
 "ui.sk3-spotter": "While it lives, your units' attacks, shots and skills can't miss or be dodged.",
 "ui.sk3-spotter-codex": "Evasive, Swift, Flying, Smoke, fog, darkness, Blind and Invisible don't stop them. A Legendary dodge still rolls, as for True Strike.",
 "ui.sk3-silence": "Its attacks Silence the target for {n} rounds.",
 "ui.sk3-silence-1": "Its attacks Silence the target for a round.",
 "ui.sk3-silence-codex": "Silenced: its skills and triggers are off; its Attack and Health stay. Unlike Freeze or Sleep, it still swings.",
 "ui.sk3-stymie": "Its attacks Stymie the target for {n} rounds.",
 "ui.sk3-stymie-1": "Its attacks Stymie the target for a round.",
 "ui.sk3-stymie-codex": "Stymied: its Wait doesn't count down, and a Ready unit goes back to Wait 1. Freeze skips a swing; Stymie stops the clock.",
 "ui.sk3-exhaust": "Its attacks give the target {n} Exhaust tokens.",
 "ui.sk3-exhaust-1": "Its attacks give the target an Exhaust token.",
 "ui.sk3-exhaust-codex": "Each token makes the unit's next trigger or skill fizzle, then it goes. Its plain attack still swings.",
 "ui.sk3-petrify": "Its attacks turn the target to stone for {n} rounds.",
 "ui.sk3-petrify-1": "Its attacks turn the target to stone for a round.",
 "ui.sk3-petrify-codex": "Petrified: it can't attack, its triggers sleep, and it takes half damage. Shatter breaks the stone for double.",
 "ui.sk3-shatter": "Its hits and shots deal {n} more to Frozen, Brittle, Petrified or heavily armored units.",
 "ui.sk3-shatter-codex": "Heavily armored: Armor 3 or more. On a Petrified unit the whole hit is doubled instead of halved.",
 "ui.sk-hunter-weak": "Its hits and shots deal {n} more to weak units (Attack {a} or less, Health {h} or less).",
 "ui.hunter-vs-weak": "Weak",
 "ui.stn3-silenced": "Silenced", "ui.stn3-stymied": "Stymied", "ui.stn3-exhausted": "Exhausted", "ui.stn3-grounded": "Grounded",
 "ui.st3-silenced": "its skills and triggers are off; its Attack and Health stay.",
 "ui.st3-stymied": "its Wait doesn't count down, so it can't get Ready.",
 "ui.st3-exhausted": "each token makes its next trigger or skill fizzle.",
 "ui.st3-grounded": "a flyer pulled down: no Flying for a while.",
 "ui.st3-stench": "−1 Attack a token, up to −3, until a Wave or the Tide washes it off.",
 "ui.sk3-tip-silenced": "Silenced: no skills or triggers for {n} more rounds",
 "ui.sk3-tip-stymied": "Stymied: its Wait is frozen for {n} more rounds",
 "ui.sk3-tip-exhaust": "Exhausted: its next {n} triggers or skills fizzle",
 "ui.sk3-tip-petrified": "Petrified for {n} more rounds: no attack, half damage taken",
 "ui.sk3-tip-grounded": "Grounded: no Flying for {n} more rounds",
 "ui.sk3-tip-stench": "Stench: −{n} Attack",
 "ui.act3-duplicate": "Duplicate",
 "ui.act3-duplicate-desc": "The target gets an Illusion copy beside it: its Attack and skills, Health 1, Illusory.",
 "ui.act3-devour-grave": "Feed on the graveyard",
 "ui.act3-devour-grave-desc": "Exile the oldest card in your graveyard; if one went, this unit gets +N/+N.",
 "ui.act3-buff-all": "Buff all allies",
 "ui.act3-buff-all-desc": "Your other units get +N Attack and +N Health.",
 "ui.act3-stench-desc": "N Stench tokens on the targets: −1 Attack each, up to −3, until washed off.",
 "ui.act3-silence-desc": "The target's skills and triggers are off for N rounds.",
 "ui.act3-stymie-desc": "The target's Wait is frozen for N rounds; a Ready unit goes back to Wait 1.",
 "ui.act3-exhaust-desc": "N Exhaust tokens: the target's next N triggers or skills fizzle.",
 "ui.act3-petrify-desc": "The target turns to stone for N rounds: no attack, half damage taken.",
 "ui.act3-vulnerable": "Vulnerable",
 "ui.act3-vulnerable-desc": "Shock for N rounds (hits on it deal 50% more): every enemy, or every unit.",
 "ui.act3-barrage": "Barrage",
 "ui.act3-barrage-desc": "An arrow (or a bolt) of N at every enemy unit.",
 "ui.act3-smoke-screen": "Smoke Screen",
 "ui.act3-smoke-screen-desc": "Your units are hidden in Smoke for N rounds: attacks at them miss 1 in 2.",
 "ui.act3-magnet": "Magnet",
 "ui.act3-magnet-desc": "Enemy flyers are Grounded for N rounds: no Flying.",
 "ui.trig3-any-death": "On Any Death",
 "ui.trig3-any-death-desc": "every time any other unit dies, on either side",
 "ui.spell3-grave-call": "Revive a random creature from your graveyard; it gets +X/+X, X = the cards in your graveyard (up to {cap}).",
 "ui.spell3-smoke-screen": "Your units are hidden in Smoke for {n} rounds.",
 "ui.spell3-magnet": "Enemy flyers are Grounded for {n} rounds: no Flying.",
 "ui.log3-duplicate": "{att} conjures an Illusion of {name}.",
 "ui.log3-corpsefeed": "{name} feeds on the graveyard: +{n}/+{n}.",
 "ui.log3-silence": "{name} is Silenced for {n} rounds.",
 "ui.log3-stymie": "{name} is Stymied for {n} rounds.",
 "ui.log3-exhaust": "{name} gains {n} Exhaust.",
 "ui.log3-exhaust-spent": "{name} is Exhausted: it fizzles.",
 "ui.log3-petrify": "{name} turns to stone for {n} rounds.",
 "ui.log3-vulnerable": "{name} is Vulnerable for {n} rounds.",
 "ui.log3-barrage": "{name} looses a Barrage.",
 "ui.log3-smoke": "{name} is hidden in Smoke.",
 "ui.log3-magnet": "{name} is pulled to the ground.",
 "ui.log3-stench": "{name} reeks: {n} Stench.",
 "ui.log3-stench-wash": "{name} is washed clean of {n} Stench.",
 "ui.log3-grave-call": "{name} answers the Grave Call: +{n}/+{n}.",
}
CHANGED = {
 "ui.skn-hunter": "Cull",
 "ui.sk-hunter-codex": "One target is picked on the card: Weak (the default), Poisoned, Bleeding, Wet or Exposed. Executioner is the one for a low share of Health. Ticks and brambles get no bonus.",
 "ui.sk-executioner": "Its hits and shots deal {n} more to units below a quarter of their Health.",
 "ui.sk-executioner-codex": "Exactly a quarter is not below it. Poison and Bleed ticks, and brambles, get no bonus.",
}

# fr, de, es, it, pt, tl, ta, id, zh-Hans, zh-Hant, ja, ko
T = {
"Spawner": ["Engendreur", "Brüter", "Engendrador", "Generatore", "Gerador", "Tagapagsilang", "பிறப்பிப்பான்", "Pemunah Bibit", "孵生者", "孵生者", "スポナー", "스포너"],
"War Banner": ["Bannière de guerre", "Kriegsbanner", "Estandarte de guerra", "Stendardo di guerra", "Estandarte de guerra", "Bandila ng Digmaan", "போர்க் கொடி", "Panji Perang", "战旗", "戰旗", "軍旗", "전쟁 깃발"],
"Warcry": ["Cri de guerre", "Kriegsschrei", "Grito de guerra", "Grido di guerra", "Grito de guerra", "Sigaw ng Digmaan", "போர் முழக்கம்", "Pekik Perang", "战吼", "戰吼", "雄叫び", "함성"],
"Shieldwall": ["Mur de boucliers", "Schildwall", "Muro de escudos", "Muro di scudi", "Muralha de escudos", "Pader ng Kalasag", "கேடயச் சுவர்", "Dinding Perisai", "盾墙", "盾牆", "盾の壁", "방패벽"],
"Corpsefeeder": ["Nécrophage", "Aasfresser", "Necrófago", "Necrofago", "Necrófago", "Kumakain ng Bangkay", "பிணந்தின்னி", "Pemakan Bangkai", "食尸者", "食屍者", "屍食い", "시체 포식자"],
"Amplifier": ["Amplificateur", "Verstärker", "Amplificador", "Amplificatore", "Amplificador", "Pampalakas", "பெருக்கி", "Penguat", "增幅者", "增幅者", "増幅者", "증폭기"],
"Stench": ["Puanteur", "Gestank", "Hedor", "Fetore", "Fedor", "Baho", "நாற்றம்", "Bau Busuk", "恶臭", "惡臭", "悪臭", "악취"],
"Broodkeeper": ["Gardien de couvée", "Brutpfleger", "Guardacrías", "Custode della covata", "Guardião da ninhada", "Tagapag-alaga ng Supling", "குஞ்சுக் காவலன்", "Penjaga Anakan", "育雏者", "育雛者", "子守り", "둥지지기"],
"Herald": ["Héraut", "Herold", "Heraldo", "Araldo", "Arauto", "Tagapagbalita", "முரசறைவோன்", "Bentara", "传令官", "傳令官", "伝令", "전령"],
"Harbinger": ["Présage", "Vorbote", "Presagio", "Presagio", "Presságio", "Tagapagbadya", "முன்னறிவிப்பான்", "Pertanda", "凶兆", "凶兆", "凶兆", "흉조"],
"Spotter": ["Guetteur", "Späher", "Vigía", "Vedetta", "Vigia", "Tagamasid", "கண்காணிப்பாளன்", "Pengintai", "瞭望者", "瞭望者", "見張り", "관측병"],
"Silence": ["Silence", "Stille", "Silencio", "Silenzio", "Silêncio", "Patahimik", "மௌனம்", "Bungkam", "沉默", "沉默", "沈黙", "침묵"],
"Stymie": ["Entrave", "Hemmnis", "Estorbo", "Intralcio", "Estorvo", "Hadlang", "தடுப்பு", "Hambat", "阻滞", "阻滯", "足止め", "저지"],
"Exhaust": ["Épuisement", "Erschöpfung", "Agotamiento", "Sfinimento", "Exaustão", "Pagod", "களைப்பு", "Lelah", "疲惫", "疲憊", "疲弊", "탈진"],
"Petrify": ["Pétrification", "Versteinern", "Petrificar", "Pietrificare", "Petrificar", "Gawing Bato", "கல்லாக்கு", "Membatu", "石化", "石化", "石化", "석화"],
"Cull": ["Abattage", "Auslese", "Criba", "Abbattimento", "Abate", "Pagtatahip", "களையெடு", "Pemusnah", "淘汰", "淘汰", "間引き", "솎아내기"],
"While Ready, it spawns {card} into a free slot beside it every turn.": [
  "Tant qu’elle est prête, elle fait apparaître {card} dans une case libre à côté, à chaque tour.", "Solange sie bereit ist, erscheint jede Runde {card} auf einem freien Feld daneben.",
  "Mientras está lista, genera {card} en una casilla libre a su lado cada turno.", "Finché è pronta, genera {card} in una casella libera accanto, ogni turno.",
  "Enquanto está pronta, gera {card} numa casa livre ao lado, a cada turno.", "Habang Handa, naglalabas ito ng {card} sa bakanteng puwesto sa tabi nito bawat turno.",
  "தயாராக இருக்கும்போது, ஒவ்வொரு சுற்றிலும் அருகிலுள்ள காலியிடத்தில் {card} பிறக்கும்.", "Selama Siap, ia memunculkan {card} di petak kosong di sampingnya tiap giliran.",
  "就绪时，每回合在身旁的空格生成{card}。", "就緒時，每回合在身旁的空格生成{card}。", "準備完了の間、毎ターン隣の空きマスに{card}を生み出す。", "준비된 동안 매 턴 옆 빈칸에 {card}을(를) 낳아요."],
"An On Turn Start trigger: off while it is Waiting, Stunned, Frozen or Asleep. No free slot beside it, no spawn.": [
  "Un déclencheur En début de tour : inactif tant qu’elle attend, est étourdie, gelée ou endormie. Sans case libre à côté, rien n’apparaît.",
  "Ein Auslöser bei Rundenbeginn: aus, solange sie wartet, betäubt, gefroren oder eingeschlafen ist. Kein freies Feld daneben, nichts erscheint.",
  "Un disparador Al empezar el turno: apagado mientras espera, está aturdida, congelada o dormida. Sin casilla libre al lado, nada aparece.",
  "Un innesco A inizio turno: spento mentre attende, è stordita, congelata o addormentata. Senza casella libera accanto, niente appare.",
  "Um gatilho No início do turno: desligado enquanto espera, está atordoada, congelada ou adormecida. Sem casa livre ao lado, nada aparece.",
  "Isang trigger sa Simula ng Turno: patay habang Naghihintay, Stunned, Frozen o Tulog. Walang bakanteng puwesto sa tabi, walang lalabas.",
  "ஒரு சுற்றுத் தொடக்கத் தூண்டி: காத்திருக்கும்போது, மயங்கும்போது, உறைந்தபோது, உறங்கும்போது செயல்படாது. அருகில் காலியிடம் இல்லையெனில் எதுவும் பிறக்காது.",
  "Pemicu Awal Giliran: mati selama Menunggu, Pingsan, Beku, atau Tertidur. Tanpa petak kosong di samping, tak ada yang muncul.",
  "回合开始触发：等待、眩晕、冻结或睡眠时无效。身旁没有空格就不生成。", "回合開始觸發：等待、暈眩、冰凍或睡眠時無效。身旁沒有空格就不生成。",
  "ターン開始時のトリガー：待機・スタン・凍結・睡眠中は働かない。隣に空きマスがなければ何も出ない。", "턴 시작 트리거: 대기, 기절, 빙결, 수면 중에는 꺼져요. 옆에 빈칸이 없으면 아무것도 안 나와요."],
"Your other units have +{n}/+{n} while it lives.": [
  "Vos autres unités ont +{n}/+{n} tant qu’elle vit.", "Deine anderen Einheiten haben +{n}/+{n}, solange sie lebt.", "Tus otras unidades tienen +{n}/+{n} mientras viva.",
  "Le tue altre unità hanno +{n}/+{n} finché vive.", "As tuas outras unidades têm +{n}/+{n} enquanto viver.", "May +{n}/+{n} ang iba mong unit habang buhay ito.",
  "இது உயிருடன் இருக்கும்வரை உன் மற்ற அலகுகளுக்கு +{n}/+{n}.", "Unitmu yang lain mendapat +{n}/+{n} selama ia hidup.", "它在场时，你的其他单位+{n}/+{n}。", "牠在場時，你的其他單位+{n}/+{n}。",
  "これが生きている間、味方の他のユニットは+{n}/+{n}。", "살아 있는 동안 아군의 다른 유닛은 +{n}/+{n}."],
"When played, your other units get +{n}/+{n}.": [
  "Une fois jouée, vos autres unités gagnent +{n}/+{n}.", "Wenn gespielt, erhalten deine anderen Einheiten +{n}/+{n}.", "Al jugarse, tus otras unidades ganan +{n}/+{n}.",
  "Quando giocata, le tue altre unità ottengono +{n}/+{n}.", "Ao ser jogada, as tuas outras unidades ganham +{n}/+{n}.", "Kapag nilaro, makakakuha ng +{n}/+{n} ang iba mong unit.",
  "விளையாடும்போது, உன் மற்ற அலகுகள் +{n}/+{n} பெறும்.", "Saat dimainkan, unitmu yang lain mendapat +{n}/+{n}.", "打出时，你的其他单位获得+{n}/+{n}。", "打出時，你的其他單位獲得+{n}/+{n}。",
  "プレイ時、味方の他のユニットは+{n}/+{n}を得る。", "낼 때 아군의 다른 유닛이 +{n}/+{n}을 얻어요."],
"The allies beside it have +{n} Armor while it lives.": [
  "Les alliés à côté ont +{n} d’Armure tant qu’elle vit.", "Die Verbündeten daneben haben +{n} Rüstung, solange sie lebt.", "Los aliados a su lado tienen +{n} de Armadura mientras viva.",
  "Gli alleati accanto hanno +{n} Armatura finché vive.", "Os aliados ao lado têm +{n} de Armadura enquanto viver.", "May +{n} Armor ang mga kakampi sa tabi nito habang buhay ito.",
  "இது உயிருடன் இருக்கும்வரை அருகிலுள்ள கூட்டாளிகளுக்கு +{n} கவசம்.", "Sekutu di sampingnya mendapat +{n} Zirah selama ia hidup.", "它在场时，身旁的友军护甲+{n}。", "牠在場時，身旁的友軍護甲+{n}。",
  "これが生きている間、隣の味方はアーマー+{n}。", "살아 있는 동안 옆 아군은 방어구 +{n}."],
"Each turn while Ready, it exiles your oldest graveyard card and gains +{n}/+{n}.": [
  "À chaque tour où elle est prête, elle exile la plus ancienne carte de votre cimetière et gagne +{n}/+{n}.", "Jede Runde, solange sie bereit ist, verbannt sie die älteste Karte deines Friedhofs und erhält +{n}/+{n}.",
  "Cada turno que está lista, exilia la carta más antigua de tu cementerio y gana +{n}/+{n}.", "Ogni turno in cui è pronta, esilia la carta più vecchia del tuo cimitero e ottiene +{n}/+{n}.",
  "A cada turno pronta, exila a carta mais antiga do teu cemitério e ganha +{n}/+{n}.", "Bawat turno habang Handa, itinatapon nito ang pinakamatandang card sa libingan mo at nakakakuha ng +{n}/+{n}.",
  "தயாராக உள்ள ஒவ்வொரு சுற்றிலும், உன் கல்லறையின் பழைய அட்டையை நாடுகடத்தி +{n}/+{n} பெறும்.", "Tiap giliran selama Siap, ia mengasingkan kartu tertua di kuburanmu dan mendapat +{n}/+{n}.",
  "就绪时每回合放逐你墓地中最早的一张牌，并获得+{n}/+{n}。", "就緒時每回合放逐你墓地中最早的一張牌，並獲得+{n}/+{n}。", "準備完了の間、毎ターン墓地で一番古いカードを追放し、+{n}/+{n}を得る。", "준비된 동안 매 턴 무덤에서 가장 오래된 카드를 추방하고 +{n}/+{n}을 얻어요."],
"An empty graveyard feeds nothing. The exile is a real one: you get an Echo and On Exile fires.": [
  "Un cimetière vide ne nourrit rien. L’exil est réel : vous gagnez un Écho et En exil se déclenche.", "Ein leerer Friedhof nährt nichts. Die Verbannung ist echt: Du erhältst ein Echo und Bei Verbannung löst aus.",
  "Un cementerio vacío no alimenta nada. El exilio es real: ganas un Eco y Al exiliar se activa.", "Un cimitero vuoto non nutre nulla. L’esilio è vero: ottieni un’Eco e All’esilio si attiva.",
  "Um cemitério vazio não alimenta nada. O exílio é real: ganhas um Eco e Ao exilar dispara.", "Walang napapakain ang walang lamang libingan. Totoong pagtapon ito: may Echo ka at gagana ang On Exile.",
  "காலியான கல்லறை எதையும் ஊட்டாது. நாடுகடத்தல் உண்மையானது: உனக்கு ஒரு எதிரொலி கிடைக்கும், நாடுகடத்தும்போது தூண்டி செயல்படும்.", "Kuburan kosong tak memberi makan. Pengasingannya sungguhan: kamu dapat Gema dan Saat Diasingkan terpicu.",
  "墓地为空则无可吞食。放逐是真正的放逐：你获得一个回响，放逐时触发。", "墓地為空則無可吞食。放逐是真正的放逐：你獲得一個迴響，放逐時觸發。", "墓地が空なら何も食べない。追放は本物：エコーを得て、追放時が発動する。", "무덤이 비면 먹을 게 없어요. 추방은 진짜예요: 메아리를 얻고 추방 시 트리거가 발동해요."],
"The allies beside it have +{n} on each skill number, up to +{cap}.": [
  "Les alliés à côté ont +{n} à chaque nombre de compétence, jusqu’à +{cap}.", "Die Verbündeten daneben haben +{n} auf jede Fähigkeitszahl, bis +{cap}.",
  "Los aliados a su lado tienen +{n} en cada número de habilidad, hasta +{cap}.", "Gli alleati accanto hanno +{n} su ogni numero di abilità, fino a +{cap}.",
  "Os aliados ao lado têm +{n} em cada número de habilidade, até +{cap}.", "May +{n} sa bawat numero ng skill ang mga kakampi sa tabi nito, hanggang +{cap}.",
  "அருகிலுள்ள கூட்டாளிகளின் ஒவ்வொரு திறன் எண்ணுக்கும் +{n}, +{cap} வரை.", "Sekutu di sampingnya mendapat +{n} pada tiap angka skill, hingga +{cap}.",
  "身旁友军的每个技能数值+{n}，最多+{cap}。", "身旁友軍的每個技能數值+{n}，最多+{cap}。", "隣の味方のスキルの数値はそれぞれ+{n}（最大+{cap}）。", "옆 아군의 스킬 수치가 각각 +{n}, 최대 +{cap}."],
"Poison 2 becomes 3, Thorns 1 becomes 2. Not itself and not triggers; several Amplifiers together add at most +2.": [
  "Poison 2 devient 3, Épines 1 devient 2. Pas elle-même ni les déclencheurs ; plusieurs Amplificateurs ajoutent au plus +2.", "Gift 2 wird 3, Dornen 1 wird 2. Nicht sie selbst und keine Auslöser; mehrere Verstärker geben zusammen höchstens +2.",
  "Veneno 2 pasa a 3, Espinas 1 a 2. No a sí misma ni a los disparadores; varios Amplificadores suman como mucho +2.", "Veleno 2 diventa 3, Spine 1 diventa 2. Non se stessa né gli innesci; più Amplificatori insieme danno al massimo +2.",
  "Veneno 2 passa a 3, Espinhos 1 a 2. Não a si mesma nem gatilhos; vários Amplificadores juntos dão no máximo +2.", "Ang Poison 2 ay nagiging 3, ang Thorns 1 ay nagiging 2. Hindi sarili nito at hindi ang mga trigger; hanggang +2 lang ang magkakasamang Amplifier.",
  "நஞ்சு 2 → 3, முட்கள் 1 → 2. தன்னையும் தூண்டிகளையும் அல்ல; பல பெருக்கிகள் சேர்ந்தாலும் அதிகபட்சம் +2.", "Racun 2 jadi 3, Duri 1 jadi 2. Bukan dirinya dan bukan pemicu; beberapa Penguat bersama paling banyak +2.",
  "毒2变为3，荆棘1变为2。不含自身与触发；多个增幅者合计最多+2。", "毒2變為3，荊棘1變為2。不含自身與觸發；多個增幅者合計最多+2。", "毒2は3に、トゲ1は2に。自分とトリガーは対象外。増幅者が何体いても合計+2まで。", "독 2는 3, 가시 1은 2가 돼요. 자신과 트리거는 제외; 증폭기가 여럿이어도 최대 +2."],
"When played, {n} Stench on the enemy facing it and those beside it.": [
  "Une fois jouée, {n} Puanteur sur l’ennemi en face et ceux à côté de lui.", "Wenn gespielt, {n} Gestank auf den Gegner gegenüber und die neben ihm.",
  "Al jugarse, {n} de Hedor en el enemigo de enfrente y los de su lado.", "Quando giocata, {n} Fetore sul nemico di fronte e su quelli accanto.",
  "Ao ser jogada, {n} de Fedor no inimigo em frente e nos que estão ao lado dele.", "Kapag nilaro, {n} Baho sa kalabang kaharap nito at sa mga katabi niyon.",
  "விளையாடும்போது, எதிரே உள்ள எதிரிக்கும் அதன் அருகிலுள்ளவர்களுக்கும் {n} நாற்றம்.", "Saat dimainkan, {n} Bau Busuk pada musuh di depannya dan yang di sampingnya.",
  "打出时，对面的敌人及其两侧获得{n}层恶臭。", "打出時，對面的敵人及其兩側獲得{n}層惡臭。", "プレイ時、正面の敵とその両隣に悪臭{n}。", "낼 때 맞은편 적과 그 옆에 악취 {n}."],
"Each Stench token is −1 Attack, up to −3. A Wave or wash of N washes N off; the Tide washes 1 each round. Flyers are above it.": [
  "Chaque jeton de Puanteur vaut −1 d’Attaque, jusqu’à −3. Une Vague ou un lavage de N en retire N ; la Marée en retire 1 par manche. Les volants sont au-dessus.",
  "Jede Gestanksmarke ist −1 Angriff, bis −3. Eine Welle oder Spülung N wäscht N ab; die Flut 1 pro Runde. Flieger sind darüber.",
  "Cada ficha de Hedor es −1 de Ataque, hasta −3. Una Ola o lavado de N quita N; la Marea quita 1 por ronda. Los voladores están por encima.",
  "Ogni segnalino Fetore è −1 Attacco, fino a −3. Un’Onda o lavaggio di N ne toglie N; la Marea 1 a round. I volanti ne sono sopra.",
  "Cada ficha de Fedor é −1 de Ataque, até −3. Uma Onda ou lavagem de N tira N; a Maré tira 1 por ronda. Os voadores estão acima.",
  "Bawat Baho token ay −1 Attack, hanggang −3. Ang Wave o hugas na N ay nag-aalis ng N; 1 bawat round ang Tide. Nasa itaas nito ang mga lumilipad.",
  "ஒவ்வொரு நாற்ற டோக்கனும் −1 தாக்குதல், −3 வரை. N அலை அல்லது கழுவல் N நீக்கும்; ஓதம் ஒவ்வொரு சுற்றும் 1. பறப்பவை அதற்கு மேல்.",
  "Tiap token Bau Busuk −1 Serangan, hingga −3. Ombak atau basuhan N menghapus N; Pasang menghapus 1 tiap ronde. Penerbang di atasnya.",
  "每层恶臭使攻击−1，最多−3。N级的浪潮或冲刷洗去N层；潮汐每回合洗去1层。飞行单位不受影响。", "每層惡臭使攻擊−1，最多−3。N級的浪潮或沖刷洗去N層；潮汐每回合洗去1層。飛行單位不受影響。",
  "悪臭1つにつき攻撃−1（最大−3）。N のウェーブや洗い流しでN個消え、潮は毎ラウンド1個消す。飛行ユニットは届かない。", "악취 토큰 하나당 공격 −1, 최대 −3. N의 파도나 씻김이 N개를 지우고, 조수는 라운드마다 1개를 지워요. 비행 유닛은 그 위에 있어요."],
"Your units made by abilities arrive with +{n}/+{n}.": [
  "Vos unités créées par des capacités arrivent avec +{n}/+{n}.", "Deine durch Fähigkeiten erschaffenen Einheiten kommen mit +{n}/+{n}.", "Tus unidades creadas por habilidades llegan con +{n}/+{n}.",
  "Le tue unità create da abilità arrivano con +{n}/+{n}.", "As tuas unidades criadas por habilidades chegam com +{n}/+{n}.", "Dumarating na may +{n}/+{n} ang mga unit mong gawa ng ability.",
  "திறன்களால் உருவாகும் உன் அலகுகள் +{n}/+{n} உடன் வரும்.", "Unitmu yang dibuat oleh kemampuan datang dengan +{n}/+{n}.", "由能力产生的你方单位登场时+{n}/+{n}。", "由能力產生的你方單位登場時+{n}/+{n}。",
  "能力で生まれた味方ユニットは+{n}/+{n}で登場する。", "능력으로 생긴 아군 유닛은 +{n}/+{n}으로 나와요."],
"Your Leader has +{n}/+{n} while it lives.": [
  "Votre Chef a +{n}/+{n} tant qu’elle vit.", "Dein Anführer hat +{n}/+{n}, solange sie lebt.", "Tu Líder tiene +{n}/+{n} mientras viva.", "Il tuo Capo ha +{n}/+{n} finché vive.",
  "O teu Líder tem +{n}/+{n} enquanto viver.", "May +{n}/+{n} ang iyong Pinuno habang buhay ito.", "இது உயிருடன் இருக்கும்வரை உன் தலைவருக்கு +{n}/+{n}.", "Pemimpinmu mendapat +{n}/+{n} selama ia hidup.",
  "它在场时，你的领袖+{n}/+{n}。", "牠在場時，你的領袖+{n}/+{n}。", "これが生きている間、リーダーは+{n}/+{n}。", "살아 있는 동안 리더는 +{n}/+{n}."],
"Your Leader: the deck's leader card, a Gladiator leader or a Natural Leader on the field.": [
  "Votre Chef : la carte chef du deck, un chef de Gladiateur ou un Chef né sur le terrain.", "Dein Anführer: die Anführerkarte des Decks, ein Gladiatoren-Anführer oder ein Geborener Anführer auf dem Feld.",
  "Tu Líder: la carta líder del mazo, un líder de Gladiador o un Líder nato en el campo.", "Il tuo Capo: la carta capo del mazzo, un capo Gladiatore o un Capo nato in campo.",
  "O teu Líder: a carta líder do baralho, um líder de Gladiador ou um Líder nato em campo.", "Ang Pinuno mo: ang leader card ng deck, isang Gladiator leader o isang Natural Leader sa larangan.",
  "உன் தலைவர்: தளத்தின் தலைவர் அட்டை, ஒரு கிளாடியேட்டர் தலைவர் அல்லது களத்திலுள்ள இயல்புத் தலைவர்.", "Pemimpinmu: kartu pemimpin dek, pemimpin Gladiator, atau Pemimpin Alami di medan.",
  "领袖：卡组的领袖卡、角斗士领袖或场上的天生领袖。", "領袖：牌組的領袖卡、角鬥士領袖或場上的天生領袖。", "リーダー：デッキのリーダーカード、グラディエーターのリーダー、または場の天性のリーダー。", "리더: 덱의 리더 카드, 검투사 리더 또는 필드의 타고난 리더."],
"Whenever another unit dies, on either side, it gains +{n}/+{n} (up to {cap} a round).": [
  "Chaque fois qu’une autre unité meurt, d’un camp ou de l’autre, elle gagne +{n}/+{n} (jusqu’à {cap} par manche).", "Immer wenn eine andere Einheit stirbt, auf beiden Seiten, erhält sie +{n}/+{n} (bis {cap} pro Runde).",
  "Cada vez que muere otra unidad, de cualquier bando, gana +{n}/+{n} (hasta {cap} por ronda).", "Ogni volta che un’altra unità muore, da qualsiasi parte, ottiene +{n}/+{n} (fino a {cap} a round).",
  "Sempre que outra unidade morre, de qualquer lado, ganha +{n}/+{n} (até {cap} por ronda).", "Tuwing may ibang unit na namamatay, saanmang panig, nakakakuha ito ng +{n}/+{n} (hanggang {cap} bawat round).",
  "எந்தப் பக்கத்திலும் வேறு அலகு இறக்கும்போதெல்லாம் இது +{n}/+{n} பெறும் (ஒரு சுற்றுக்கு {cap} வரை).", "Tiap kali unit lain mati, di pihak mana pun, ia mendapat +{n}/+{n} (hingga {cap} per ronde).",
  "每当任一方有其他单位死亡，它获得+{n}/+{n}（每回合最多{cap}次）。", "每當任一方有其他單位死亡，牠獲得+{n}/+{n}（每回合最多{cap}次）。", "どちら側でも他のユニットが死ぬたび、+{n}/+{n}を得る（1ラウンド{cap}回まで）。", "어느 쪽이든 다른 유닛이 죽을 때마다 +{n}/+{n}을 얻어요(라운드당 {cap}번까지)."],
"An On Any Death trigger: off while it is Waiting, Stunned, Frozen or Asleep.": [
  "Un déclencheur À toute mort : inactif tant qu’elle attend, est étourdie, gelée ou endormie.", "Ein Auslöser Bei jedem Tod: aus, solange sie wartet, betäubt, gefroren oder eingeschlafen ist.",
  "Un disparador Ante cualquier muerte: apagado mientras espera, está aturdida, congelada o dormida.", "Un innesco A ogni morte: spento mentre attende, è stordita, congelata o addormentata.",
  "Um gatilho Em qualquer morte: desligado enquanto espera, está atordoada, congelada ou adormecida.", "Isang trigger na Sa Anumang Kamatayan: patay habang Naghihintay, Stunned, Frozen o Tulog.",
  "ஒரு எந்த மரணத்திலும் தூண்டி: காத்திருக்கும்போது, மயங்கும்போது, உறைந்தபோது, உறங்கும்போது செயல்படாது.", "Pemicu Saat Kematian Apa Pun: mati selama Menunggu, Pingsan, Beku, atau Tertidur.",
  "任意死亡触发：等待、眩晕、冻结或睡眠时无效。", "任意死亡觸發：等待、暈眩、冰凍或睡眠時無效。", "いずれかの死亡時トリガー：待機・スタン・凍結・睡眠中は働かない。", "모든 죽음 트리거: 대기, 기절, 빙결, 수면 중에는 꺼져요."],
"While it lives, your units' attacks, shots and skills can't miss or be dodged.": [
  "Tant qu’elle vit, les attaques, tirs et compétences de vos unités ne peuvent ni rater ni être esquivés.", "Solange sie lebt, können Angriffe, Schüsse und Fähigkeiten deiner Einheiten weder danebengehen noch ausgewichen werden.",
  "Mientras viva, los ataques, disparos y habilidades de tus unidades no fallan ni pueden esquivarse.", "Finché vive, attacchi, tiri e abilità delle tue unità non mancano e non possono essere schivati.",
  "Enquanto viver, os ataques, disparos e habilidades das tuas unidades não falham nem podem ser esquivados.", "Habang buhay ito, hindi sasablay o maiiwasan ang mga atake, tira at skill ng iyong mga unit.",
  "இது உயிருடன் இருக்கும்வரை உன் அலகுகளின் தாக்குதல்கள், எய்தல்கள், திறன்கள் தவறாது, தவிர்க்கப்படாது.", "Selama ia hidup, serangan, tembakan, dan skill unitmu tak bisa meleset atau dihindari.",
  "它在场时，你方单位的攻击、射击和技能不会落空，也无法被闪避。", "牠在場時，你方單位的攻擊、射擊和技能不會落空，也無法被閃避。", "これが生きている間、味方の攻撃・射撃・スキルは外れず、回避されない。", "살아 있는 동안 아군의 공격, 사격, 스킬은 빗나가거나 회피되지 않아요."],
"Evasive, Swift, Flying, Smoke, fog, darkness, Blind and Invisible don't stop them. A Legendary dodge still rolls, as for True Strike.": [
  "Évasion, Vif, Vol, Fumée, brouillard, obscurité, Aveugle et Invisible ne les arrêtent pas. Une esquive Légendaire se tente quand même, comme contre Frappe sûre.",
  "Ausweichend, Flink, Fliegend, Rauch, Nebel, Dunkelheit, Blind und Unsichtbar halten sie nicht auf. Ein Legendäres Ausweichen würfelt trotzdem, wie bei Sicherem Treffer.",
  "Evasión, Veloz, Vuelo, Humo, niebla, oscuridad, Ceguera e Invisible no los detienen. Una esquiva Legendaria aún tira, como con Golpe certero.",
  "Elusione, Rapido, Volo, Fumo, nebbia, oscurità, Cecità e Invisibile non li fermano. Una schivata Leggendaria tira comunque, come per Colpo sicuro.",
  "Evasivo, Veloz, Voo, Fumo, nevoeiro, escuridão, Cegueira e Invisível não os travam. Uma esquiva Lendária ainda rola, como para Golpe certeiro.",
  "Hindi sila napipigilan ng Evasive, Swift, Flying, Usok, ulap, dilim, Blind at Invisible. Gumugulong pa rin ang Legendary na iwas, gaya ng sa True Strike.",
  "தப்பித்தல், விரைவு, பறத்தல், புகை, மூடுபனி, இருள், குருடு, மறைவு இவற்றைத் தடுக்காது. புராணத் தவிர்ப்பு உண்மைத் தாக்குதலுக்கு போல இன்னும் உருளும்.",
  "Mengelak, Gesit, Terbang, Asap, kabut, kegelapan, Buta, dan Tak Terlihat tak menghentikannya. Hindaran Legendaris tetap diundi, seperti untuk Serangan Pasti.",
  "闪避、迅捷、飞行、烟雾、浓雾、黑暗、致盲和隐身都挡不住。传说级闪避仍会判定，与必中相同。", "閃避、迅捷、飛行、煙霧、濃霧、黑暗、致盲和隱身都擋不住。傳說級閃避仍會判定，與必中相同。",
  "回避・俊敏・飛行・煙・霧・暗闇・盲目・透明では防げない。伝説の回避だけは、必中と同じく判定される。", "회피, 신속, 비행, 연기, 안개, 어둠, 실명, 투명으로 막지 못해요. 전설 회피는 필중처럼 여전히 판정해요."],
"Its attacks Silence the target for {n} rounds.": [
  "Ses attaques réduisent la cible au Silence pendant {n} manches.", "Ihre Angriffe bringen das Ziel für {n} Runden zum Schweigen.", "Sus ataques Silencian al objetivo durante {n} rondas.",
  "I suoi attacchi Silenziano il bersaglio per {n} round.", "Os seus ataques Silenciam o alvo durante {n} rondas.", "Pinatatahimik ng mga atake nito ang target sa loob ng {n} round.",
  "இதன் தாக்குதல்கள் இலக்கை {n} சுற்றுகளுக்கு மௌனமாக்கும்.", "Serangannya Membungkam target selama {n} ronde.", "它的攻击使目标沉默{n}回合。", "牠的攻擊使目標沉默{n}回合。",
  "その攻撃は対象を{n}ラウンド沈黙させる。", "공격하면 대상이 {n}라운드 동안 침묵해요."],
"Its attacks Silence the target for a round.": [
  "Ses attaques réduisent la cible au Silence pendant une manche.", "Ihre Angriffe bringen das Ziel für eine Runde zum Schweigen.", "Sus ataques Silencian al objetivo durante una ronda.",
  "I suoi attacchi Silenziano il bersaglio per un round.", "Os seus ataques Silenciam o alvo durante uma ronda.", "Pinatatahimik ng mga atake nito ang target sa loob ng isang round.",
  "இதன் தாக்குதல்கள் இலக்கை ஒரு சுற்றுக்கு மௌனமாக்கும்.", "Serangannya Membungkam target selama satu ronde.", "它的攻击使目标沉默1回合。", "牠的攻擊使目標沉默1回合。",
  "その攻撃は対象を1ラウンド沈黙させる。", "공격하면 대상이 1라운드 동안 침묵해요."],
"Silenced: its skills and triggers are off; its Attack and Health stay. Unlike Freeze or Sleep, it still swings.": [
  "Réduite au silence : ses compétences et déclencheurs sont coupés ; son Attaque et sa Santé restent. Contrairement au Gel ou au Sommeil, elle frappe encore.",
  "Verstummt: Fähigkeiten und Auslöser sind aus; Angriff und Leben bleiben. Anders als bei Frost oder Schlaf schlägt sie noch zu.",
  "Silenciada: sus habilidades y disparadores se apagan; su Ataque y Salud se quedan. A diferencia de Congelar o Dormir, sigue golpeando.",
  "Silenziata: abilità e innesci spenti; Attacco e Salute restano. A differenza di Gelo o Sonno, colpisce ancora.",
  "Silenciada: habilidades e gatilhos desligados; Ataque e Vida ficam. Ao contrário de Congelar ou Dormir, ainda ataca.",
  "Silenced: patay ang mga skill at trigger nito; nananatili ang Attack at Health. Di tulad ng Freeze o Sleep, umaatake pa rin ito.",
  "மௌனமானது: திறன்களும் தூண்டிகளும் நிற்கும்; தாக்குதலும் உயிர்ப்பும் மாறாது. உறைதல், உறக்கம் போலல்லாமல் இது இன்னும் தாக்கும்.",
  "Terbungkam: skill dan pemicunya mati; Serangan dan Nyawanya tetap. Tak seperti Beku atau Tidur, ia tetap menyerang.",
  "沉默：技能与触发失效，攻击和生命保留。与冻结、睡眠不同，它仍会攻击。", "沉默：技能與觸發失效，攻擊和生命保留。與冰凍、睡眠不同，牠仍會攻擊。",
  "沈黙：スキルとトリガーが止まるが、攻撃と体力はそのまま。凍結や睡眠と違い、攻撃はする。", "침묵: 스킬과 트리거가 꺼지고 공격과 체력은 그대로예요. 빙결이나 수면과 달리 여전히 공격해요."],
"Its attacks Stymie the target for {n} rounds.": [
  "Ses attaques entravent la cible pendant {n} manches.", "Ihre Angriffe hemmen das Ziel für {n} Runden.", "Sus ataques Estorban al objetivo durante {n} rondas.",
  "I suoi attacchi Intralciano il bersaglio per {n} round.", "Os seus ataques Estorvam o alvo durante {n} rondas.", "Hinahadlangan ng mga atake nito ang target sa loob ng {n} round.",
  "இதன் தாக்குதல்கள் இலக்கை {n} சுற்றுகளுக்குத் தடுக்கும்.", "Serangannya Menghambat target selama {n} ronde.", "它的攻击使目标阻滞{n}回合。", "牠的攻擊使目標阻滯{n}回合。",
  "その攻撃は対象を{n}ラウンド足止めする。", "공격하면 대상이 {n}라운드 동안 저지돼요."],
"Its attacks Stymie the target for a round.": [
  "Ses attaques entravent la cible pendant une manche.", "Ihre Angriffe hemmen das Ziel für eine Runde.", "Sus ataques Estorban al objetivo durante una ronda.",
  "I suoi attacchi Intralciano il bersaglio per un round.", "Os seus ataques Estorvam o alvo durante uma ronda.", "Hinahadlangan ng mga atake nito ang target sa loob ng isang round.",
  "இதன் தாக்குதல்கள் இலக்கை ஒரு சுற்றுக்குத் தடுக்கும்.", "Serangannya Menghambat target selama satu ronde.", "它的攻击使目标阻滞1回合。", "牠的攻擊使目標阻滯1回合。",
  "その攻撃は対象を1ラウンド足止めする。", "공격하면 대상이 1라운드 동안 저지돼요."],
"Stymied: its Wait doesn't count down, and a Ready unit goes back to Wait 1. Freeze skips a swing; Stymie stops the clock.": [
  "Entravée : son Attente ne décompte plus, et une unité prête repasse à Attente 1. Le Gel saute une frappe ; l’Entrave arrête l’horloge.",
  "Gehemmt: Ihr Warten zählt nicht herunter, und eine bereite Einheit geht zurück auf Warten 1. Frost überspringt einen Schlag; Hemmnis hält die Uhr an.",
  "Estorbada: su Espera no baja, y una unidad lista vuelve a Espera 1. Congelar salta un golpe; Estorbo detiene el reloj.",
  "Intralciata: la sua Attesa non scende, e un’unità pronta torna ad Attesa 1. Il Gelo salta un colpo; l’Intralcio ferma l’orologio.",
  "Estorvada: a sua Espera não desce, e uma unidade pronta volta a Espera 1. Congelar salta um ataque; o Estorvo para o relógio.",
  "Stymied: hindi bumababa ang Wait nito, at bumabalik sa Wait 1 ang unit na Handa. Lumalaktaw ng atake ang Freeze; pinahihinto ng Stymie ang orasan.",
  "தடுக்கப்பட்டது: காத்திருப்பு குறையாது, தயாரான அலகு மீண்டும் காத்திருப்பு 1 ஆகும். உறைதல் ஒரு தாக்குதலைத் தவிர்க்கும்; தடுப்பு கடிகாரத்தை நிறுத்தும்.",
  "Terhambat: Tunggunya tak berkurang, dan unit yang Siap kembali ke Tunggu 1. Beku melewatkan satu serangan; Hambat menghentikan jam.",
  "阻滞：等待不再倒数，已就绪的单位回到等待1。冻结跳过一次攻击；阻滞让时钟停下。", "阻滯：等待不再倒數，已就緒的單位回到等待1。冰凍跳過一次攻擊；阻滯讓時鐘停下。",
  "足止め：待機が減らず、準備完了のユニットは待機1に戻る。凍結は攻撃を1回飛ばし、足止めは時計を止める。", "저지: 대기가 줄지 않고, 준비된 유닛은 대기 1로 돌아가요. 빙결은 공격을 건너뛰고, 저지는 시계를 멈춰요."],
"Its attacks give the target {n} Exhaust tokens.": [
  "Ses attaques donnent {n} jetons d’Épuisement à la cible.", "Ihre Angriffe geben dem Ziel {n} Erschöpfungsmarken.", "Sus ataques dan al objetivo {n} fichas de Agotamiento.",
  "I suoi attacchi danno al bersaglio {n} segnalini Sfinimento.", "Os seus ataques dão ao alvo {n} fichas de Exaustão.", "Nagbibigay ang mga atake nito ng {n} Exhaust token sa target.",
  "இதன் தாக்குதல்கள் இலக்குக்கு {n} களைப்பு டோக்கன்கள் தரும்.", "Serangannya memberi target {n} token Lelah.", "它的攻击给目标{n}层疲惫。", "牠的攻擊給目標{n}層疲憊。",
  "その攻撃は対象に疲弊トークンを{n}個与える。", "공격하면 대상에게 탈진 토큰 {n}개를 줘요."],
"Its attacks give the target an Exhaust token.": [
  "Ses attaques donnent un jeton d’Épuisement à la cible.", "Ihre Angriffe geben dem Ziel eine Erschöpfungsmarke.", "Sus ataques dan al objetivo una ficha de Agotamiento.",
  "I suoi attacchi danno al bersaglio un segnalino Sfinimento.", "Os seus ataques dão ao alvo uma ficha de Exaustão.", "Nagbibigay ang mga atake nito ng isang Exhaust token sa target.",
  "இதன் தாக்குதல்கள் இலக்குக்கு ஒரு களைப்பு டோக்கன் தரும்.", "Serangannya memberi target satu token Lelah.", "它的攻击给目标1层疲惫。", "牠的攻擊給目標1層疲憊。",
  "その攻撃は対象に疲弊トークンを1個与える。", "공격하면 대상에게 탈진 토큰 1개를 줘요."],
"Each token makes the unit's next trigger or skill fizzle, then it goes. Its plain attack still swings.": [
  "Chaque jeton fait échouer le prochain déclencheur ou compétence de l’unité, puis disparaît. Son attaque simple frappe toujours.",
  "Jede Marke lässt den nächsten Auslöser oder die nächste Fähigkeit der Einheit verpuffen und verschwindet. Ihr normaler Angriff schlägt weiter zu.",
  "Cada ficha hace fallar el próximo disparador o habilidad de la unidad y luego se va. Su ataque simple sigue golpeando.",
  "Ogni segnalino fa fallire il prossimo innesco o abilità dell’unità, poi sparisce. Il suo attacco semplice colpisce ancora.",
  "Cada ficha faz falhar o próximo gatilho ou habilidade da unidade e depois desaparece. O seu ataque simples continua.",
  "Bawat token ay nagpapapalya sa susunod na trigger o skill ng unit, saka ito nawawala. Umaatake pa rin ang karaniwang atake nito.",
  "ஒவ்வொரு டோக்கனும் அலகின் அடுத்த தூண்டி அல்லது திறனைப் பிசுபிசுக்கச் செய்து மறையும். அதன் சாதாரணத் தாக்குதல் தொடரும்.",
  "Tiap token membuat pemicu atau skill berikutnya gagal, lalu hilang. Serangan biasanya tetap jalan.",
  "每层使该单位下一次触发或技能失效，然后移除。普通攻击照常。", "每層使該單位下一次觸發或技能失效，然後移除。普通攻擊照常。",
  "トークン1つごとに次のトリガーかスキルが不発になり、トークンは消える。通常攻撃はする。", "토큰마다 다음 트리거나 스킬이 불발되고 토큰이 사라져요. 일반 공격은 그대로예요."],
"Its attacks turn the target to stone for {n} rounds.": [
  "Ses attaques changent la cible en pierre pendant {n} manches.", "Ihre Angriffe verwandeln das Ziel für {n} Runden in Stein.", "Sus ataques convierten al objetivo en piedra durante {n} rondas.",
  "I suoi attacchi trasformano il bersaglio in pietra per {n} round.", "Os seus ataques transformam o alvo em pedra durante {n} rondas.", "Ginagawang bato ng mga atake nito ang target sa loob ng {n} round.",
  "இதன் தாக்குதல்கள் இலக்கை {n} சுற்றுகளுக்குக் கல்லாக்கும்.", "Serangannya mengubah target menjadi batu selama {n} ronde.", "它的攻击将目标石化{n}回合。", "牠的攻擊將目標石化{n}回合。",
  "その攻撃は対象を{n}ラウンド石にする。", "공격하면 대상이 {n}라운드 동안 돌이 돼요."],
"Its attacks turn the target to stone for a round.": [
  "Ses attaques changent la cible en pierre pendant une manche.", "Ihre Angriffe verwandeln das Ziel für eine Runde in Stein.", "Sus ataques convierten al objetivo en piedra durante una ronda.",
  "I suoi attacchi trasformano il bersaglio in pietra per un round.", "Os seus ataques transformam o alvo em pedra durante uma ronda.", "Ginagawang bato ng mga atake nito ang target sa loob ng isang round.",
  "இதன் தாக்குதல்கள் இலக்கை ஒரு சுற்றுக்குக் கல்லாக்கும்.", "Serangannya mengubah target menjadi batu selama satu ronde.", "它的攻击将目标石化1回合。", "牠的攻擊將目標石化1回合。",
  "その攻撃は対象を1ラウンド石にする。", "공격하면 대상이 1라운드 동안 돌이 돼요."],
"Petrified: it can't attack, its triggers sleep, and it takes half damage. Shatter breaks the stone for double.": [
  "Pétrifiée : elle ne peut pas attaquer, ses déclencheurs dorment, et elle subit moitié moins de dégâts. Fracas brise la pierre pour le double.",
  "Versteinert: Sie kann nicht angreifen, ihre Auslöser ruhen, und sie nimmt halben Schaden. Zerschmettern bricht den Stein für doppelten.",
  "Petrificada: no puede atacar, sus disparadores duermen y recibe la mitad de daño. Quebrar rompe la piedra por el doble.",
  "Pietrificata: non può attaccare, i suoi innesci dormono e subisce metà danni. Frantumare spezza la pietra per il doppio.",
  "Petrificada: não pode atacar, os seus gatilhos dormem e recebe metade do dano. Estilhaçar parte a pedra pelo dobro.",
  "Petrified: hindi ito makaatake, tulog ang mga trigger nito, at kalahati lang ang pinsalang natatanggap. Binabasag ng Shatter ang bato nang doble.",
  "கல்லானது: தாக்க முடியாது, தூண்டிகள் உறங்கும், பாதிச் சேதம் மட்டும். சிதறல் கல்லை இரட்டிப்பாக உடைக்கும்.",
  "Membatu: tak bisa menyerang, pemicunya tidur, dan ia menerima separuh kerusakan. Hancurkan memecah batu dengan dua kali lipat.",
  "石化：无法攻击，触发休眠，受到的伤害减半。粉碎会以双倍伤害击碎石头。", "石化：無法攻擊，觸發休眠，受到的傷害減半。粉碎會以雙倍傷害擊碎石頭。",
  "石化：攻撃できず、トリガーは眠り、受けるダメージは半分。シャッターは石を2倍で砕く。", "석화: 공격할 수 없고 트리거가 잠들며 받는 피해가 절반이에요. 분쇄는 돌을 두 배로 부숴요."],
"Its hits and shots deal {n} more to Frozen, Brittle, Petrified or heavily armored units.": [
  "Ses coups et ses tirs infligent {n} de plus aux unités gelées, fragiles, pétrifiées ou lourdement blindées.", "Seine Treffer und Schüsse machen {n} mehr bei gefrorenen, spröden, versteinerten oder schwer gepanzerten Einheiten.",
  "Sus golpes y disparos hacen {n} más a unidades congeladas, quebradizas, petrificadas o muy acorazadas.", "I suoi colpi e tiri infliggono {n} in più a unità congelate, fragili, pietrificate o molto corazzate.",
  "Seus golpes e disparos causam {n} a mais em unidades congeladas, quebradiças, petrificadas ou muito blindadas.", "Ang mga tama at tira nito ay {n} na dagdag sa mga unit na Frozen, Brittle, Petrified o makapal ang baluti.",
  "இதன் தாக்குதல்களும் எய்தல்களும் உறைந்த, நொறுங்கும், கல்லான அல்லது கனத்த கவச அலகுகளுக்கு {n} அதிகம் தரும்.", "Serangan dan tembakannya memberi {n} lebih ke unit Beku, Rapuh, Membatu, atau berzirah tebal.",
  "它的攻击和射击对冻结、易碎、石化或重甲单位多造成{n}点伤害。", "它的攻擊和射擊對冰凍、易碎、石化或重甲單位多造成{n}點傷害。", "その攻撃と射撃は凍結・脆弱・石化・重装甲のユニットに{n}多く与える。", "공격과 사격이 빙결, 취약, 석화 또는 중장갑 유닛에게 {n} 더 피해를 줘요."],
"Heavily armored: Armor 3 or more. On a Petrified unit the whole hit is doubled instead of halved.": [
  "Lourdement blindée : Armure 3 ou plus. Sur une unité pétrifiée, le coup entier est doublé au lieu d’être réduit de moitié.",
  "Schwer gepanzert: Rüstung 3 oder mehr. Bei einer versteinerten Einheit wird der ganze Treffer verdoppelt statt halbiert.",
  "Muy acorazada: Armadura 3 o más. En una unidad petrificada, todo el golpe se duplica en vez de reducirse a la mitad.",
  "Molto corazzata: Armatura 3 o più. Su un’unità pietrificata l’intero colpo è raddoppiato invece che dimezzato.",
  "Muito blindada: Armadura 3 ou mais. Numa unidade petrificada, o golpe inteiro é dobrado em vez de reduzido a metade.",
  "Makapal ang baluti: Armor 3 pataas. Sa Petrified na unit, dinodoble ang buong tama sa halip na hatiin.",
  "கனத்த கவசம்: கவசம் 3 அல்லது அதற்கு மேல். கல்லான அலகின் மீது முழுத் தாக்கமும் பாதியாகாமல் இரட்டிப்பாகும்.",
  "Berzirah tebal: Zirah 3 atau lebih. Pada unit Membatu, seluruh serangan digandakan, bukan dibagi dua.",
  "重甲：护甲3或以上。对石化单位，整次伤害翻倍而非减半。", "重甲：護甲3或以上。對石化單位，整次傷害翻倍而非減半。", "重装甲：アーマー3以上。石化したユニットには、半減ではなく攻撃全体が2倍になる。", "중장갑: 방어구 3 이상. 석화된 유닛에게는 절반이 아니라 전체 피해가 두 배예요."],
"Its hits and shots deal {n} more to weak units (Attack {a} or less, Health {h} or less).": [
  "Ses coups et ses tirs infligent {n} de plus aux unités faibles (Attaque {a} ou moins, Santé {h} ou moins).", "Seine Treffer und Schüsse machen {n} mehr bei schwachen Einheiten (Angriff {a} oder weniger, Leben {h} oder weniger).",
  "Sus golpes y disparos hacen {n} más a unidades débiles (Ataque {a} o menos, Salud {h} o menos).", "I suoi colpi e tiri infliggono {n} in più alle unità deboli (Attacco {a} o meno, Salute {h} o meno).",
  "Seus golpes e disparos causam {n} a mais em unidades fracas (Ataque {a} ou menos, Vida {h} ou menos).", "Ang mga tama at tira nito ay {n} na dagdag sa mahihinang unit (Attack {a} pababa, Health {h} pababa).",
  "இதன் தாக்குதல்களும் எய்தல்களும் வலுவற்ற அலகுகளுக்கு {n} அதிகம் தரும் (தாக்குதல் {a} அல்லது குறைவு, உயிர்ப்பு {h} அல்லது குறைவு).", "Serangan dan tembakannya memberi {n} lebih ke unit lemah (Serangan {a} atau kurang, Nyawa {h} atau kurang).",
  "它的攻击和射击对弱小单位多造成{n}点伤害（攻击≤{a}且生命≤{h}）。", "它的攻擊和射擊對弱小單位多造成{n}點傷害（攻擊≤{a}且生命≤{h}）。", "その攻撃と射撃は弱いユニット（攻撃{a}以下かつ体力{h}以下）に{n}多く与える。", "공격과 사격이 약한 유닛(공격 {a} 이하, 체력 {h} 이하)에게 {n} 더 피해를 줘요."],
"Weak": ["Faible", "Schwach", "Débil", "Debole", "Fraca", "Mahina", "வலுவற்றது", "Lemah", "弱小", "弱小", "弱い", "약함"],
"One target is picked on the card: Weak (the default), Poisoned, Bleeding, Wet or Exposed. Executioner is the one for a low share of Health. Ticks and brambles get no bonus.": [
  "Une cible est choisie sur la carte : Faible (par défaut), Empoisonnée, Qui saigne, Mouillée ou Exposée. Bourreau est celle pour une faible part de Santé. Les effets par manche et les ronces n’ont pas de bonus.",
  "Ein Ziel wird auf der Karte gewählt: Schwach (Standard), Vergiftet, Blutend, Nass oder Entblößt. Henker ist die für wenig verbleibendes Leben. Ticks und Dornenhecken bekommen keinen Bonus.",
  "Se elige un objetivo en la carta: Débil (por defecto), Envenenada, Que sangra, Mojada o Expuesta. Verdugo es la de poca Salud restante. Los efectos por ronda y las zarzas no reciben bonificación.",
  "Sulla carta si sceglie un bersaglio: Debole (predefinito), Avvelenata, Sanguinante, Bagnata o Esposta. Boia è quella per poca Salute rimasta. Gli effetti a round e i rovi non hanno bonus.",
  "Escolhe-se um alvo na carta: Fraca (padrão), Envenenada, A sangrar, Molhada ou Exposta. Carrasco é a de pouca Vida restante. Efeitos por ronda e silvados não têm bónus.",
  "Isang target ang pinipili sa card: Mahina (default), Nalason, Dumudugo, Basa o Nakalantad. Ang Executioner ang para sa kaunting natitirang Health. Walang bonus ang mga tick at bramble.",
  "அட்டையில் ஒரு இலக்கு தேர்வாகும்: வலுவற்றது (இயல்பு), நஞ்சூட்டப்பட்டது, இரத்தம் கசிவது, நனைந்தது, வெளிப்பட்டது. குறைந்த உயிர்ப்புப் பங்குக்குக் கொலையாளி. சுற்று விளைவுகளுக்கும் முட்புதர்களுக்கும் கூடுதல் இல்லை.",
  "Satu target dipilih di kartu: Lemah (bawaan), Teracuni, Berdarah, Basah, atau Terekspos. Algojo untuk Nyawa yang tinggal sedikit. Efek per ronde dan semak tak dapat bonus.",
  "卡上选择一种目标：弱小（默认）、中毒、流血、潮湿或暴露。处决者针对生命比例低的单位。持续伤害和荆棘堡不获加成。", "卡上選擇一種目標：弱小（預設）、中毒、流血、潮溼或暴露。處決者針對生命比例低的單位。持續傷害和荊棘堡不獲加成。",
  "カードで対象を1つ選ぶ：弱い（既定）、毒、出血、濡れ、無防備。体力の割合が低い相手には処刑人。継続ダメージと茨の砦にはボーナスなし。", "카드에서 대상을 하나 골라요: 약함(기본), 중독, 출혈, 젖음, 노출. 체력 비율이 낮은 상대는 처형인 몫이에요. 지속 피해와 가시덤불에는 보너스가 없어요."],
"Its hits and shots deal {n} more to units below a quarter of their Health.": [
  "Ses coups et ses tirs infligent {n} de plus aux unités sous le quart de leur Santé.", "Seine Treffer und Schüsse machen {n} mehr bei Einheiten unter einem Viertel ihres Lebens.",
  "Sus golpes y disparos hacen {n} más a unidades por debajo de un cuarto de su Salud.", "I suoi colpi e tiri infliggono {n} in più alle unità sotto un quarto della loro Salute.",
  "Seus golpes e disparos causam {n} a mais em unidades abaixo de um quarto da Vida.", "Ang mga tama at tira nito ay {n} na dagdag sa mga unit na mas mababa sa sangkapat ng kanilang Health.",
  "இதன் தாக்குதல்களும் எய்தல்களும் உயிர்ப்பின் கால்பங்குக்குக் கீழுள்ள அலகுகளுக்கு {n} அதிகம் தரும்.", "Serangan dan tembakannya memberi {n} lebih ke unit di bawah seperempat Nyawanya.",
  "它的攻击和射击对生命低于四分之一的单位多造成{n}点伤害。", "它的攻擊和射擊對生命低於四分之一的單位多造成{n}點傷害。", "その攻撃と射撃は体力が4分の1未満のユニットに{n}多く与える。", "공격과 사격이 체력이 4분의 1 미만인 유닛에게 {n} 더 피해를 줘요."],
"Exactly a quarter is not below it. Poison and Bleed ticks, and brambles, get no bonus.": [
  "Exactement un quart n’est pas en dessous. Les dégâts de Poison et de Saignement, et les ronces, n’ont pas de bonus.", "Genau ein Viertel ist nicht darunter. Gift- und Blutungsticks sowie Dornenhecken bekommen keinen Bonus.",
  "Exactamente un cuarto no está por debajo. Los ticks de Veneno y Sangrado, y las zarzas, no reciben bonificación.", "Esattamente un quarto non è sotto. I tick di Veleno e Sanguinamento, e i rovi, non hanno bonus.",
  "Exatamente um quarto não está abaixo. Os ticks de Veneno e Sangramento, e os silvados, não têm bónus.", "Ang eksaktong sangkapat ay hindi mas mababa. Walang bonus ang tick ng Poison at Bleed, at ang mga bramble.",
  "சரியாகக் கால்பங்கு கீழல்ல. நஞ்சு, இரத்தக்கசிவு சேதங்களுக்கும் முட்புதர்களுக்கும் கூடுதல் இல்லை.", "Tepat seperempat tidak terhitung di bawah. Detak Racun dan Pendarahan, serta semak, tak dapat bonus.",
  "恰好四分之一不算低于。毒与流血的持续伤害和荆棘堡不获加成。", "恰好四分之一不算低於。毒與流血的持續傷害和荊棘堡不獲加成。", "ちょうど4分の1は未満に入らない。毒と出血の継続ダメージ、茨の砦にはボーナスなし。", "정확히 4분의 1은 미만이 아니에요. 독·출혈 지속 피해와 가시덤불에는 보너스가 없어요."],
"Silenced": ["Réduite au silence", "Verstummt", "Silenciada", "Silenziata", "Silenciada", "Pinatahimik", "மௌனமானது", "Terbungkam", "沉默", "沉默", "沈黙", "침묵"],
"Stymied": ["Entravée", "Gehemmt", "Estorbada", "Intralciata", "Estorvada", "Hinadlangan", "தடுக்கப்பட்டது", "Terhambat", "阻滞", "阻滯", "足止め", "저지됨"],
"Exhausted": ["Épuisée", "Erschöpft", "Agotada", "Sfinita", "Exausta", "Pagod", "களைத்தது", "Kelelahan", "疲惫", "疲憊", "疲弊", "탈진"],
"Grounded": ["Clouée au sol", "Am Boden", "En tierra", "A terra", "Em terra", "Nakababa", "தரையிறக்கப்பட்டது", "Tertambat", "坠地", "墜地", "撃墜", "추락"],
"its skills and triggers are off; its Attack and Health stay.": [
  "ses compétences et déclencheurs sont coupés ; son Attaque et sa Santé restent.", "Fähigkeiten und Auslöser sind aus; Angriff und Leben bleiben.", "sus habilidades y disparadores se apagan; su Ataque y Salud se quedan.",
  "abilità e innesci spenti; Attacco e Salute restano.", "habilidades e gatilhos desligados; Ataque e Vida ficam.", "patay ang mga skill at trigger nito; nananatili ang Attack at Health.",
  "திறன்களும் தூண்டிகளும் நிற்கும்; தாக்குதலும் உயிர்ப்பும் மாறாது.", "skill dan pemicunya mati; Serangan dan Nyawanya tetap.", "技能与触发失效，攻击和生命保留。", "技能與觸發失效，攻擊和生命保留。",
  "スキルとトリガーが止まる。攻撃と体力はそのまま。", "스킬과 트리거가 꺼지고 공격과 체력은 그대로예요."],
"its Wait doesn't count down, so it can't get Ready.": [
  "son Attente ne décompte plus, elle ne peut donc pas être prête.", "ihr Warten zählt nicht herunter, also wird sie nicht bereit.", "su Espera no baja, así que no puede estar lista.",
  "la sua Attesa non scende, quindi non può essere pronta.", "a sua Espera não desce, por isso não fica pronta.", "hindi bumababa ang Wait nito, kaya hindi ito makakapag-Handa.",
  "காத்திருப்பு குறையாது, எனவே தயாராக முடியாது.", "Tunggunya tak berkurang, jadi ia tak bisa Siap.", "等待不再倒数，因此无法就绪。", "等待不再倒數，因此無法就緒。",
  "待機が減らないので、準備完了にならない。", "대기가 줄지 않아 준비될 수 없어요."],
"each token makes its next trigger or skill fizzle.": [
  "chaque jeton fait échouer son prochain déclencheur ou compétence.", "jede Marke lässt den nächsten Auslöser oder die nächste Fähigkeit verpuffen.", "cada ficha hace fallar su próximo disparador o habilidad.",
  "ogni segnalino fa fallire il prossimo innesco o abilità.", "cada ficha faz falhar o próximo gatilho ou habilidade.", "bawat token ay nagpapapalya sa susunod nitong trigger o skill.",
  "ஒவ்வொரு டோக்கனும் அடுத்த தூண்டி அல்லது திறனைப் பிசுபிசுக்கச் செய்யும்.", "tiap token membuat pemicu atau skill berikutnya gagal.", "每层使下一次触发或技能失效。", "每層使下一次觸發或技能失效。",
  "トークン1つごとに次のトリガーかスキルが不発になる。", "토큰마다 다음 트리거나 스킬이 불발돼요."],
"a flyer pulled down: no Flying for a while.": [
  "un volant ramené au sol : plus de Vol pendant un temps.", "ein heruntergeholter Flieger: eine Weile kein Fliegen.", "un volador derribado: sin Vuelo por un tiempo.",
  "un volante tirato giù: niente Volo per un po’.", "um voador puxado para baixo: sem Voo por um tempo.", "isang lumilipad na hinila pababa: walang Flying sandali.",
  "கீழே இழுக்கப்பட்ட பறப்பது: சிறிது நேரம் பறத்தல் இல்லை.", "penerbang yang ditarik turun: tanpa Terbang untuk sementara.", "被拉下来的飞行单位：暂时失去飞行。", "被拉下來的飛行單位：暫時失去飛行。",
  "引きずり下ろされた飛行ユニット：しばらく飛行なし。", "끌어내려진 비행 유닛: 잠시 비행이 없어요."],
"−1 Attack a token, up to −3, until a Wave or the Tide washes it off.": [
  "−1 d’Attaque par jeton, jusqu’à −3, jusqu’à ce qu’une Vague ou la Marée le lave.", "−1 Angriff pro Marke, bis −3, bis eine Welle oder die Flut es abwäscht.", "−1 de Ataque por ficha, hasta −3, hasta que una Ola o la Marea lo lave.",
  "−1 Attacco a segnalino, fino a −3, finché un’Onda o la Marea non lo lava via.", "−1 de Ataque por ficha, até −3, até uma Onda ou a Maré o lavar.", "−1 Attack bawat token, hanggang −3, hanggang hugasan ng Wave o ng Tide.",
  "ஒவ்வொரு டோக்கனுக்கும் −1 தாக்குதல், −3 வரை, அலையோ ஓதமோ கழுவும்வரை.", "−1 Serangan per token, hingga −3, sampai Ombak atau Pasang membasuhnya.", "每层攻击−1，最多−3，直到浪潮或潮汐将其洗去。", "每層攻擊−1，最多−3，直到浪潮或潮汐將其洗去。",
  "1つにつき攻撃−1（最大−3）。ウェーブか潮で洗い流されるまで続く。", "토큰당 공격 −1, 최대 −3, 파도나 조수가 씻어 낼 때까지."],
"Silenced: no skills or triggers for {n} more rounds": [
  "Réduite au silence : plus de compétences ni de déclencheurs pendant {n} manches", "Verstummt: noch {n} Runden keine Fähigkeiten oder Auslöser", "Silenciada: sin habilidades ni disparadores durante {n} rondas más",
  "Silenziata: niente abilità né innesci per altri {n} round", "Silenciada: sem habilidades nem gatilhos por mais {n} rondas", "Pinatahimik: walang skill o trigger sa loob ng {n} pang round",
  "மௌனம்: இன்னும் {n} சுற்றுகளுக்குத் திறன்களோ தூண்டிகளோ இல்லை", "Terbungkam: tanpa skill atau pemicu selama {n} ronde lagi", "沉默：还有{n}回合无技能与触发", "沉默：還有{n}回合無技能與觸發",
  "沈黙：あと{n}ラウンド、スキルもトリガーもなし", "침묵: {n}라운드 더 스킬과 트리거 없음"],
"Stymied: its Wait is frozen for {n} more rounds": [
  "Entravée : son Attente est figée encore {n} manches", "Gehemmt: ihr Warten ist noch {n} Runden eingefroren", "Estorbada: su Espera queda congelada {n} rondas más",
  "Intralciata: la sua Attesa è ferma per altri {n} round", "Estorvada: a sua Espera fica congelada por mais {n} rondas", "Hinadlangan: nakapirmi ang Wait nito sa loob ng {n} pang round",
  "தடுப்பு: இன்னும் {n} சுற்றுகளுக்குக் காத்திருப்பு உறைந்திருக்கும்", "Terhambat: Tunggunya membeku {n} ronde lagi", "阻滞：等待冻结，还剩{n}回合", "阻滯：等待凍結，還剩{n}回合",
  "足止め：あと{n}ラウンド、待機が止まっている", "저지: {n}라운드 더 대기가 멈춰 있어요"],
"Exhausted: its next {n} triggers or skills fizzle": [
  "Épuisée : ses {n} prochains déclencheurs ou compétences échouent", "Erschöpft: die nächsten {n} Auslöser oder Fähigkeiten verpuffen", "Agotada: sus próximos {n} disparadores o habilidades fallan",
  "Sfinita: i suoi prossimi {n} innesci o abilità falliscono", "Exausta: os seus próximos {n} gatilhos ou habilidades falham", "Pagod: papalya ang susunod nitong {n} trigger o skill",
  "களைப்பு: அடுத்த {n} தூண்டிகள் அல்லது திறன்கள் பிசுபிசுக்கும்", "Kelelahan: {n} pemicu atau skill berikutnya gagal", "疲惫：接下来{n}次触发或技能失效", "疲憊：接下來{n}次觸發或技能失效",
  "疲弊：次の{n}回のトリガーかスキルが不発", "탈진: 다음 {n}번의 트리거나 스킬이 불발"],
"Petrified for {n} more rounds: no attack, half damage taken": [
  "Pétrifiée encore {n} manches : pas d’attaque, moitié des dégâts", "Noch {n} Runden versteinert: kein Angriff, halber Schaden", "Petrificada {n} rondas más: sin ataque, mitad de daño",
  "Pietrificata per altri {n} round: niente attacco, metà danni", "Petrificada por mais {n} rondas: sem ataque, metade do dano", "Petrified sa loob ng {n} pang round: walang atake, kalahating pinsala",
  "இன்னும் {n} சுற்றுகளுக்குக் கல்: தாக்குதல் இல்லை, பாதிச் சேதம்", "Membatu {n} ronde lagi: tanpa serangan, separuh kerusakan", "石化还剩{n}回合：不能攻击，伤害减半", "石化還剩{n}回合：不能攻擊，傷害減半",
  "あと{n}ラウンド石化：攻撃なし、ダメージ半分", "{n}라운드 더 석화: 공격 없음, 피해 절반"],
"Grounded: no Flying for {n} more rounds": [
  "Clouée au sol : pas de Vol pendant {n} manches", "Am Boden: noch {n} Runden kein Fliegen", "En tierra: sin Vuelo {n} rondas más", "A terra: niente Volo per altri {n} round",
  "Em terra: sem Voo por mais {n} rondas", "Nakababa: walang Flying sa loob ng {n} pang round", "தரையில்: இன்னும் {n} சுற்றுகளுக்குப் பறத்தல் இல்லை", "Tertambat: tanpa Terbang {n} ronde lagi",
  "坠地：还有{n}回合无法飞行", "墜地：還有{n}回合無法飛行", "撃墜：あと{n}ラウンド飛行なし", "추락: {n}라운드 더 비행 없음"],
"Stench: −{n} Attack": ["Puanteur : −{n} d’Attaque", "Gestank: −{n} Angriff", "Hedor: −{n} de Ataque", "Fetore: −{n} Attacco", "Fedor: −{n} de Ataque", "Baho: −{n} Attack", "நாற்றம்: −{n} தாக்குதல்", "Bau Busuk: −{n} Serangan", "恶臭：攻击−{n}", "惡臭：攻擊−{n}", "悪臭：攻撃−{n}", "악취: 공격 −{n}"],
"Duplicate": ["Dupliquer", "Duplizieren", "Duplicar", "Duplicare", "Duplicar", "Gayahin", "நகலெடு", "Gandakan", "复制", "複製", "複製", "복제"],
"The target gets an Illusion copy beside it: its Attack and skills, Health 1, Illusory.": [
  "La cible reçoit une copie Illusion à côté : son Attaque et ses compétences, Santé 1, Illusoire.", "Das Ziel erhält eine Illusionskopie daneben: sein Angriff und seine Fähigkeiten, Leben 1, Illusorisch.",
  "El objetivo recibe una copia Ilusión a su lado: su Ataque y habilidades, Salud 1, Ilusoria.", "Il bersaglio riceve una copia Illusione accanto: il suo Attacco e le abilità, Salute 1, Illusoria.",
  "O alvo recebe uma cópia Ilusão ao lado: o seu Ataque e habilidades, Vida 1, Ilusória.", "Magkakaroon ang target ng Illusion na kopya sa tabi nito: ang Attack at skill nito, Health 1, Illusory.",
  "இலக்குக்கு அருகில் ஒரு மாயை நகல் வரும்: அதன் தாக்குதலும் திறன்களும், உயிர்ப்பு 1, மாயை.", "Target mendapat salinan Ilusi di sampingnya: Serangan dan skill-nya, Nyawa 1, Ilusif.",
  "目标身旁出现一个幻影复制体：其攻击与技能，生命1，虚幻。", "目標身旁出現一個幻影複製體：其攻擊與技能，生命1，虛幻。", "対象の隣に幻影のコピーが現れる：攻撃とスキルはそのまま、体力1、幻影。", "대상 옆에 환영 복제가 생겨요: 공격과 스킬 그대로, 체력 1, 환영."],
"Feed on the graveyard": ["Se nourrir du cimetière", "Vom Friedhof zehren", "Alimentarse del cementerio", "Nutrirsi dal cimitero", "Alimentar-se do cemitério", "Kumain mula sa libingan", "கல்லறையில் உண்", "Makan dari kuburan", "吞食墓地", "吞食墓地", "墓地を食らう", "무덤 포식"],
"Exile the oldest card in your graveyard; if one went, this unit gets +N/+N.": [
  "Exilez la plus ancienne carte de votre cimetière ; si une est partie, cette unité gagne +N/+N.", "Verbanne die älteste Karte deines Friedhofs; ging eine, erhält diese Einheit +N/+N.",
  "Exilia la carta más antigua de tu cementerio; si salió una, esta unidad gana +N/+N.", "Esilia la carta più vecchia del tuo cimitero; se ne è uscita una, questa unità ottiene +N/+N.",
  "Exila a carta mais antiga do teu cemitério; se saiu uma, esta unidade ganha +N/+N.", "Itapon ang pinakamatandang card sa libingan mo; kung may naalis, makakakuha ang unit na ito ng +N/+N.",
  "உன் கல்லறையின் பழைய அட்டையை நாடுகடத்து; ஒன்று போனால், இந்த அலகு +N/+N பெறும்.", "Asingkan kartu tertua di kuburanmu; jika ada yang pergi, unit ini mendapat +N/+N.",
  "放逐你墓地中最早的一张牌；若有放逐，此单位获得+N/+N。", "放逐你墓地中最早的一張牌；若有放逐，此單位獲得+N/+N。", "墓地で一番古いカードを追放し、追放できたらこのユニットは+N/+N。", "무덤에서 가장 오래된 카드를 추방하고, 추방했다면 이 유닛이 +N/+N을 얻어요."],
"Buff all allies": ["Renforcer tous les alliés", "Alle Verbündeten stärken", "Potenciar a todos los aliados", "Potenziare tutti gli alleati", "Fortalecer todos os aliados", "Palakasin ang lahat ng kakampi", "எல்லாக் கூட்டாளிகளையும் வலுப்படுத்து", "Perkuat semua sekutu", "强化所有友军", "強化所有友軍", "味方全員を強化", "모든 아군 강화"],
"Your other units get +N Attack and +N Health.": [
  "Vos autres unités gagnent +N d’Attaque et +N de Santé.", "Deine anderen Einheiten erhalten +N Angriff und +N Leben.", "Tus otras unidades ganan +N de Ataque y +N de Salud.",
  "Le tue altre unità ottengono +N Attacco e +N Salute.", "As tuas outras unidades ganham +N de Ataque e +N de Vida.", "Makakakuha ang iba mong unit ng +N Attack at +N Health.",
  "உன் மற்ற அலகுகள் +N தாக்குதலும் +N உயிர்ப்பும் பெறும்.", "Unitmu yang lain mendapat +N Serangan dan +N Nyawa.", "你的其他单位获得+N攻击和+N生命。", "你的其他單位獲得+N攻擊和+N生命。",
  "味方の他のユニットは攻撃+N、体力+N。", "아군의 다른 유닛이 공격 +N, 체력 +N을 얻어요."],
"N Stench tokens on the targets: −1 Attack each, up to −3, until washed off.": [
  "N jetons de Puanteur sur les cibles : −1 d’Attaque chacun, jusqu’à −3, jusqu’au lavage.", "N Gestanksmarken auf die Ziele: je −1 Angriff, bis −3, bis sie abgewaschen werden.",
  "N fichas de Hedor en los objetivos: −1 de Ataque cada una, hasta −3, hasta lavarse.", "N segnalini Fetore sui bersagli: −1 Attacco ciascuno, fino a −3, finché non vengono lavati.",
  "N fichas de Fedor nos alvos: −1 de Ataque cada, até −3, até serem lavadas.", "N Baho token sa mga target: −1 Attack bawat isa, hanggang −3, hanggang mahugasan.",
  "இலக்குகளின் மீது N நாற்ற டோக்கன்கள்: ஒவ்வொன்றும் −1 தாக்குதல், −3 வரை, கழுவப்படும்வரை.", "N token Bau Busuk pada target: masing-masing −1 Serangan, hingga −3, sampai dibasuh.",
  "在目标身上放置N层恶臭：每层攻击−1，最多−3，直到被洗去。", "在目標身上放置N層惡臭：每層攻擊−1，最多−3，直到被洗去。", "対象に悪臭をN個：1つにつき攻撃−1（最大−3）、洗い流されるまで。", "대상에게 악취 토큰 N개: 하나당 공격 −1, 최대 −3, 씻겨 나갈 때까지."],
"The target's skills and triggers are off for N rounds.": [
  "Les compétences et déclencheurs de la cible sont coupés pendant N manches.", "Fähigkeiten und Auslöser des Ziels sind N Runden aus.", "Las habilidades y disparadores del objetivo se apagan durante N rondas.",
  "Abilità e innesci del bersaglio sono spenti per N round.", "As habilidades e gatilhos do alvo ficam desligados durante N rondas.", "Patay ang mga skill at trigger ng target sa loob ng N round.",
  "இலக்கின் திறன்களும் தூண்டிகளும் N சுற்றுகளுக்கு நிற்கும்.", "Skill dan pemicu target mati selama N ronde.", "目标的技能与触发失效N回合。", "目標的技能與觸發失效N回合。",
  "対象のスキルとトリガーがNラウンド止まる。", "대상의 스킬과 트리거가 N라운드 동안 꺼져요."],
"The target's Wait is frozen for N rounds; a Ready unit goes back to Wait 1.": [
  "L’Attente de la cible est figée pendant N manches ; une unité prête repasse à Attente 1.", "Das Warten des Ziels ist N Runden eingefroren; eine bereite Einheit geht zurück auf Warten 1.",
  "La Espera del objetivo queda congelada N rondas; una unidad lista vuelve a Espera 1.", "L’Attesa del bersaglio è ferma per N round; un’unità pronta torna ad Attesa 1.",
  "A Espera do alvo fica congelada durante N rondas; uma unidade pronta volta a Espera 1.", "Nakapirmi ang Wait ng target sa loob ng N round; bumabalik sa Wait 1 ang unit na Handa.",
  "இலக்கின் காத்திருப்பு N சுற்றுகளுக்கு உறையும்; தயாரான அலகு காத்திருப்பு 1 க்குத் திரும்பும்.", "Tunggu target membeku selama N ronde; unit yang Siap kembali ke Tunggu 1.",
  "目标的等待冻结N回合；已就绪的单位回到等待1。", "目標的等待凍結N回合；已就緒的單位回到等待1。", "対象の待機がNラウンド止まる。準備完了のユニットは待機1に戻る。", "대상의 대기가 N라운드 동안 멈추고, 준비된 유닛은 대기 1로 돌아가요."],
"N Exhaust tokens: the target's next N triggers or skills fizzle.": [
  "N jetons d’Épuisement : les N prochains déclencheurs ou compétences de la cible échouent.", "N Erschöpfungsmarken: die nächsten N Auslöser oder Fähigkeiten des Ziels verpuffen.",
  "N fichas de Agotamiento: los próximos N disparadores o habilidades del objetivo fallan.", "N segnalini Sfinimento: i prossimi N innesci o abilità del bersaglio falliscono.",
  "N fichas de Exaustão: os próximos N gatilhos ou habilidades do alvo falham.", "N Exhaust token: papalya ang susunod na N trigger o skill ng target.",
  "N களைப்பு டோக்கன்கள்: இலக்கின் அடுத்த N தூண்டிகள் அல்லது திறன்கள் பிசுபிசுக்கும்.", "N token Lelah: N pemicu atau skill target berikutnya gagal.",
  "N层疲惫：目标接下来N次触发或技能失效。", "N層疲憊：目標接下來N次觸發或技能失效。", "疲弊トークンN個：対象の次のN回のトリガーかスキルが不発。", "탈진 토큰 N개: 대상의 다음 N번 트리거나 스킬이 불발돼요."],
"The target turns to stone for N rounds: no attack, half damage taken.": [
  "La cible se change en pierre pendant N manches : pas d’attaque, moitié des dégâts.", "Das Ziel wird N Runden zu Stein: kein Angriff, halber Schaden.", "El objetivo se vuelve piedra durante N rondas: sin ataque, mitad de daño.",
  "Il bersaglio diventa pietra per N round: niente attacco, metà danni.", "O alvo torna-se pedra durante N rondas: sem ataque, metade do dano.", "Nagiging bato ang target sa loob ng N round: walang atake, kalahating pinsala.",
  "இலக்கு N சுற்றுகளுக்குக் கல்லாகும்: தாக்குதல் இல்லை, பாதிச் சேதம்.", "Target menjadi batu selama N ronde: tanpa serangan, separuh kerusakan.", "目标石化N回合：不能攻击，伤害减半。", "目標石化N回合：不能攻擊，傷害減半。",
  "対象はNラウンド石になる：攻撃なし、ダメージ半分。", "대상이 N라운드 동안 돌이 돼요: 공격 없음, 피해 절반."],
"Vulnerable": ["Vulnérable", "Verwundbar", "Vulnerable", "Vulnerabile", "Vulnerável", "Bulnerable", "பாதிக்கப்படக்கூடியது", "Rentan", "易伤", "易傷", "脆弱化", "취약"],
"Shock for N rounds (hits on it deal 50% more): every enemy, or every unit.": [
  "Choc pendant N manches (les coups sur elle font 50 % de plus) : chaque ennemi, ou chaque unité.", "Schock für N Runden (Treffer darauf machen 50 % mehr): jeder Gegner oder jede Einheit.",
  "Descarga durante N rondas (los golpes contra ella hacen un 50 % más): cada enemigo, o cada unidad.", "Shock per N round (i colpi su di essa fanno il 50% in più): ogni nemico, o ogni unità.",
  "Choque durante N rondas (os golpes nela causam 50% a mais): cada inimigo, ou cada unidade.", "Shock sa loob ng N round (50% na dagdag ang mga tama rito): bawat kalaban, o bawat unit.",
  "N சுற்றுகளுக்கு அதிர்ச்சி (அதன் மீதான தாக்குதல்கள் 50% அதிகம்): ஒவ்வொரு எதிரியும், அல்லது ஒவ்வொரு அலகும்.", "Kejut selama N ronde (serangan padanya 50% lebih): tiap musuh, atau tiap unit.",
  "感电N回合（受到的攻击伤害+50%）：所有敌人，或所有单位。", "感電N回合（受到的攻擊傷害+50%）：所有敵人，或所有單位。", "Nラウンドの感電（受ける攻撃が50%増し）：敵全員、またはユニット全員。", "N라운드 감전(받는 공격 피해 50% 증가): 모든 적, 또는 모든 유닛."],
"Barrage": ["Barrage", "Sperrfeuer", "Andanada", "Raffica", "Barragem", "Ulan ng Pana", "சரமாரி", "Rentetan", "齐射", "齊射", "一斉射撃", "일제 사격"],
"An arrow (or a bolt) of N at every enemy unit.": [
  "Une flèche (ou un trait) de N sur chaque unité ennemie.", "Ein Pfeil (oder Bolzen) von N auf jede gegnerische Einheit.", "Una flecha (o un proyectil) de N a cada unidad enemiga.",
  "Una freccia (o un dardo) di N su ogni unità nemica.", "Uma flecha (ou um projétil) de N em cada unidade inimiga.", "Isang pana (o bolt) na N sa bawat kalabang unit.",
  "ஒவ்வொரு எதிரி அலகின் மீதும் N அம்பு (அல்லது கணை).", "Satu panah (atau baut) N ke tiap unit musuh.", "向每个敌方单位射出N点箭矢（或法弹）。", "向每個敵方單位射出N點箭矢（或法彈）。",
  "敵ユニット全員にNの矢（または弾）。", "모든 적 유닛에게 N의 화살(또는 탄)."],
"Smoke Screen": ["Écran de fumée", "Rauchwand", "Cortina de humo", "Cortina di fumo", "Cortina de fumo", "Tabing ng Usok", "புகைத் திரை", "Tabir Asap", "烟幕", "煙幕", "煙幕", "연막"],
"Your units are hidden in Smoke for N rounds: attacks at them miss 1 in 2.": [
  "Vos unités sont cachées dans la Fumée pendant N manches : les attaques contre elles ratent 1 fois sur 2.", "Deine Einheiten sind N Runden im Rauch verborgen: Angriffe auf sie gehen 1 von 2 daneben.",
  "Tus unidades quedan ocultas en Humo durante N rondas: los ataques contra ellas fallan 1 de cada 2.", "Le tue unità sono nascoste nel Fumo per N round: gli attacchi contro di esse mancano 1 su 2.",
  "As tuas unidades ficam escondidas no Fumo durante N rondas: os ataques contra elas falham 1 em 2.", "Nakatago sa Usok ang iyong mga unit sa loob ng N round: sumasablay ang 1 sa 2 atake sa kanila.",
  "உன் அலகுகள் N சுற்றுகளுக்குப் புகையில் மறையும்: அவற்றின் மீதான தாக்குதல்கள் 2 இல் 1 தவறும்.", "Unitmu tersembunyi dalam Asap selama N ronde: serangan ke mereka meleset 1 dari 2.",
  "你的单位隐于烟雾N回合：对它们的攻击有一半落空。", "你的單位隱於煙霧N回合：對牠們的攻擊有一半落空。", "味方はNラウンド煙に隠れる：攻撃は2回に1回外れる。", "아군이 N라운드 동안 연기에 숨어요: 그들을 향한 공격은 2번에 1번 빗나가요."],
"Magnet": ["Aimant", "Magnet", "Imán", "Calamita", "Íman", "Magneto", "காந்தம்", "Magnet", "磁铁", "磁鐵", "磁石", "자석"],
"Enemy flyers are Grounded for N rounds: no Flying.": [
  "Les volants ennemis sont cloués au sol pendant N manches : pas de Vol.", "Gegnerische Flieger sind N Runden am Boden: kein Fliegen.", "Los voladores enemigos quedan en tierra durante N rondas: sin Vuelo.",
  "I volanti nemici sono a terra per N round: niente Volo.", "Os voadores inimigos ficam em terra durante N rondas: sem Voo.", "Nakababa ang mga kalabang lumilipad sa loob ng N round: walang Flying.",
  "எதிரியின் பறப்பவை N சுற்றுகளுக்குத் தரையிறக்கப்படும்: பறத்தல் இல்லை.", "Penerbang musuh Tertambat selama N ronde: tanpa Terbang.", "敌方飞行单位坠地N回合：失去飞行。", "敵方飛行單位墜地N回合：失去飛行。",
  "敵の飛行ユニットはNラウンド撃墜：飛行なし。", "적 비행 유닛이 N라운드 동안 추락해요: 비행 없음."],
"On Any Death": ["À toute mort", "Bei jedem Tod", "Ante cualquier muerte", "A ogni morte", "Em qualquer morte", "Sa Anumang Kamatayan", "எந்த மரணத்திலும்", "Saat Kematian Apa Pun", "任意死亡时", "任意死亡時", "いずれかの死亡時", "모든 죽음 시"],
"every time any other unit dies, on either side": [
  "chaque fois qu’une autre unité meurt, d’un camp ou de l’autre", "jedes Mal, wenn eine andere Einheit stirbt, auf beiden Seiten", "cada vez que muere otra unidad, de cualquier bando",
  "ogni volta che un’altra unità muore, da qualsiasi parte", "sempre que outra unidade morre, de qualquer lado", "tuwing may ibang unit na namamatay, saanmang panig",
  "எந்தப் பக்கத்திலும் வேறு அலகு இறக்கும் ஒவ்வொரு முறையும்", "tiap kali unit lain mati, di pihak mana pun", "任一方每有其他单位死亡时", "任一方每有其他單位死亡時",
  "どちら側でも他のユニットが死ぬたび", "어느 쪽이든 다른 유닛이 죽을 때마다"],
"Revive a random creature from your graveyard; it gets +X/+X, X = the cards in your graveyard (up to {cap}).": [
  "Ranimez une créature au hasard de votre cimetière ; elle gagne +X/+X, X = les cartes de votre cimetière (jusqu’à {cap}).", "Belebe eine zufällige Kreatur aus deinem Friedhof; sie erhält +X/+X, X = die Karten in deinem Friedhof (bis {cap}).",
  "Revive una criatura al azar de tu cementerio; gana +X/+X, X = las cartas de tu cementerio (hasta {cap}).", "Rianima una creatura a caso dal tuo cimitero; ottiene +X/+X, X = le carte nel tuo cimitero (fino a {cap}).",
  "Revive uma criatura ao acaso do teu cemitério; ganha +X/+X, X = as cartas do teu cemitério (até {cap}).", "Buhayin ang isang random na nilalang mula sa libingan mo; makakakuha ito ng +X/+X, X = ang mga card sa libingan mo (hanggang {cap}).",
  "உன் கல்லறையிலிருந்து ஓர் உயிரினத்தை உயிர்ப்பி; அது +X/+X பெறும், X = உன் கல்லறையின் அட்டைகள் ({cap} வரை).", "Bangkitkan satu makhluk acak dari kuburanmu; ia mendapat +X/+X, X = kartu di kuburanmu (hingga {cap}).",
  "随机复活你墓地中的一个生物；它获得+X/+X，X为你墓地中的牌数（最多{cap}）。", "隨機復活你墓地中的一個生物；牠獲得+X/+X，X為你墓地中的牌數（最多{cap}）。", "墓地から生き物を1体ランダムに蘇らせる。+X/+X を得る（X＝墓地のカード枚数、最大{cap}）。", "무덤에서 무작위 생물 하나를 되살려요; +X/+X를 얻어요, X = 무덤의 카드 수(최대 {cap})."],
"Your units are hidden in Smoke for {n} rounds.": [
  "Vos unités sont cachées dans la Fumée pendant {n} manches.", "Deine Einheiten sind {n} Runden im Rauch verborgen.", "Tus unidades quedan ocultas en Humo durante {n} rondas.",
  "Le tue unità sono nascoste nel Fumo per {n} round.", "As tuas unidades ficam escondidas no Fumo durante {n} rondas.", "Nakatago sa Usok ang iyong mga unit sa loob ng {n} round.",
  "உன் அலகுகள் {n} சுற்றுகளுக்குப் புகையில் மறையும்.", "Unitmu tersembunyi dalam Asap selama {n} ronde.", "你的单位隐于烟雾{n}回合。", "你的單位隱於煙霧{n}回合。",
  "味方は{n}ラウンド煙に隠れる。", "아군이 {n}라운드 동안 연기에 숨어요."],
"Enemy flyers are Grounded for {n} rounds: no Flying.": [
  "Les volants ennemis sont cloués au sol pendant {n} manches : pas de Vol.", "Gegnerische Flieger sind {n} Runden am Boden: kein Fliegen.", "Los voladores enemigos quedan en tierra durante {n} rondas: sin Vuelo.",
  "I volanti nemici sono a terra per {n} round: niente Volo.", "Os voadores inimigos ficam em terra durante {n} rondas: sem Voo.", "Nakababa ang mga kalabang lumilipad sa loob ng {n} round: walang Flying.",
  "எதிரியின் பறப்பவை {n} சுற்றுகளுக்குத் தரையிறக்கப்படும்: பறத்தல் இல்லை.", "Penerbang musuh Tertambat selama {n} ronde: tanpa Terbang.", "敌方飞行单位坠地{n}回合：失去飞行。", "敵方飛行單位墜地{n}回合：失去飛行。",
  "敵の飛行ユニットは{n}ラウンド撃墜：飛行なし。", "적 비행 유닛이 {n}라운드 동안 추락해요: 비행 없음."],
"{att} conjures an Illusion of {name}.": [
  "{att} fait apparaître une Illusion de {name}.", "{att} beschwört eine Illusion von {name}.", "{att} conjura una Ilusión de {name}.", "{att} evoca un’Illusione di {name}.",
  "{att} conjura uma Ilusão de {name}.", "Naglabas si {att} ng Illusion ni {name}.", "{att} {name} இன் மாயையை உருவாக்குகிறது.", "{att} memunculkan Ilusi {name}.",
  "{att}召唤出{name}的幻影。", "{att}召喚出{name}的幻影。", "{att}が{name}の幻影を生み出す。", "{att}이(가) {name}의 환영을 불러내요."],
"{name} feeds on the graveyard: +{n}/+{n}.": [
  "{name} se nourrit du cimetière : +{n}/+{n}.", "{name} zehrt vom Friedhof: +{n}/+{n}.", "{name} se alimenta del cementerio: +{n}/+{n}.", "{name} si nutre dal cimitero: +{n}/+{n}.",
  "{name} alimenta-se do cemitério: +{n}/+{n}.", "Kumakain si {name} mula sa libingan: +{n}/+{n}.", "{name} கல்லறையில் உண்கிறது: +{n}/+{n}.", "{name} makan dari kuburan: +{n}/+{n}.",
  "{name}吞食墓地：+{n}/+{n}。", "{name}吞食墓地：+{n}/+{n}。", "{name}が墓地を食らう：+{n}/+{n}。", "{name}이(가) 무덤을 먹어요: +{n}/+{n}."],
"{name} is Silenced for {n} rounds.": [
  "{name} est réduite au silence pendant {n} manches.", "{name} ist {n} Runden verstummt.", "{name} queda silenciada durante {n} rondas.", "{name} è silenziata per {n} round.",
  "{name} fica silenciada durante {n} rondas.", "Pinatahimik si {name} sa loob ng {n} round.", "{name} {n} சுற்றுகளுக்கு மௌனமாகிறது.", "{name} terbungkam selama {n} ronde.",
  "{name}被沉默{n}回合。", "{name}被沉默{n}回合。", "{name}は{n}ラウンド沈黙する。", "{name}이(가) {n}라운드 동안 침묵해요."],
"{name} is Stymied for {n} rounds.": [
  "{name} est entravée pendant {n} manches.", "{name} ist {n} Runden gehemmt.", "{name} queda estorbada durante {n} rondas.", "{name} è intralciata per {n} round.",
  "{name} fica estorvada durante {n} rondas.", "Hinadlangan si {name} sa loob ng {n} round.", "{name} {n} சுற்றுகளுக்குத் தடுக்கப்படுகிறது.", "{name} terhambat selama {n} ronde.",
  "{name}被阻滞{n}回合。", "{name}被阻滯{n}回合。", "{name}は{n}ラウンド足止めされる。", "{name}이(가) {n}라운드 동안 저지돼요."],
"{name} gains {n} Exhaust.": [
  "{name} reçoit {n} Épuisement.", "{name} erhält {n} Erschöpfung.", "{name} recibe {n} de Agotamiento.", "{name} riceve {n} Sfinimento.", "{name} recebe {n} de Exaustão.",
  "Nakakuha si {name} ng {n} Exhaust.", "{name} {n} களைப்பு பெறுகிறது.", "{name} mendapat {n} Lelah.", "{name}获得{n}层疲惫。", "{name}獲得{n}層疲憊。", "{name}に疲弊{n}。", "{name}이(가) 탈진 {n}을 얻어요."],
"{name} is Exhausted: it fizzles.": [
  "{name} est épuisée : ça échoue.", "{name} ist erschöpft: Es verpufft.", "{name} está agotada: falla.", "{name} è sfinita: fallisce.", "{name} está exausta: falha.",
  "Pagod si {name}: pumalya.", "{name} களைத்துள்ளது: பிசுபிசுக்கிறது.", "{name} kelelahan: gagal.", "{name}疲惫：失效了。", "{name}疲憊：失效了。", "{name}は疲弊：不発。", "{name}이(가) 탈진했어요: 불발."],
"{name} turns to stone for {n} rounds.": [
  "{name} se change en pierre pendant {n} manches.", "{name} wird {n} Runden zu Stein.", "{name} se vuelve piedra durante {n} rondas.", "{name} diventa pietra per {n} round.",
  "{name} torna-se pedra durante {n} rondas.", "Naging bato si {name} sa loob ng {n} round.", "{name} {n} சுற்றுகளுக்குக் கல்லாகிறது.", "{name} menjadi batu selama {n} ronde.",
  "{name}石化{n}回合。", "{name}石化{n}回合。", "{name}は{n}ラウンド石になる。", "{name}이(가) {n}라운드 동안 돌이 돼요."],
"{name} is Vulnerable for {n} rounds.": [
  "{name} est vulnérable pendant {n} manches.", "{name} ist {n} Runden verwundbar.", "{name} queda vulnerable durante {n} rondas.", "{name} è vulnerabile per {n} round.",
  "{name} fica vulnerável durante {n} rondas.", "Bulnerable si {name} sa loob ng {n} round.", "{name} {n} சுற்றுகளுக்குப் பாதிக்கப்படக்கூடியதாகிறது.", "{name} rentan selama {n} ronde.",
  "{name}易伤{n}回合。", "{name}易傷{n}回合。", "{name}は{n}ラウンド脆弱化する。", "{name}이(가) {n}라운드 동안 취약해요."],
"{name} looses a Barrage.": [
  "{name} lâche un Barrage.", "{name} entfesselt ein Sperrfeuer.", "{name} suelta una Andanada.", "{name} scaglia una Raffica.", "{name} dispara uma Barragem.",
  "Nagpakawala si {name} ng Ulan ng Pana.", "{name} சரமாரி எய்கிறது.", "{name} melepaskan Rentetan.", "{name}发动齐射。", "{name}發動齊射。", "{name}が一斉射撃を放つ。", "{name}이(가) 일제 사격을 퍼부어요."],
"{name} is hidden in Smoke.": [
  "{name} est cachée dans la Fumée.", "{name} ist im Rauch verborgen.", "{name} queda oculta en Humo.", "{name} è nascosta nel Fumo.", "{name} fica escondida no Fumo.",
  "Nakatago si {name} sa Usok.", "{name} புகையில் மறைகிறது.", "{name} tersembunyi dalam Asap.", "{name}隐于烟雾。", "{name}隱於煙霧。", "{name}は煙に隠れる。", "{name}이(가) 연기에 숨어요."],
"{name} is pulled to the ground.": [
  "{name} est ramenée au sol.", "{name} wird zu Boden gezogen.", "{name} es arrastrada a tierra.", "{name} viene tirata a terra.", "{name} é puxada para o chão.",
  "Hinila pababa si {name}.", "{name} தரைக்கு இழுக்கப்படுகிறது.", "{name} ditarik ke tanah.", "{name}被拉到地面。", "{name}被拉到地面。", "{name}は地面に引きずり下ろされる。", "{name}이(가) 땅으로 끌려 내려와요."],
"{name} reeks: {n} Stench.": [
  "{name} empeste : {n} Puanteur.", "{name} stinkt: {n} Gestank.", "{name} apesta: {n} de Hedor.", "{name} puzza: {n} Fetore.", "{name} fede: {n} de Fedor.",
  "Bumabaho si {name}: {n} Baho.", "{name} நாறுகிறது: {n} நாற்றம்.", "{name} berbau busuk: {n} Bau Busuk.", "{name}恶臭熏天：{n}层恶臭。", "{name}惡臭熏天：{n}層惡臭。", "{name}が臭う：悪臭{n}。", "{name}에게서 악취가 나요: 악취 {n}."],
"{name} is washed clean of {n} Stench.": [
  "{name} est lavée de {n} Puanteur.", "{name} wird von {n} Gestank reingewaschen.", "{name} queda limpia de {n} de Hedor.", "{name} viene ripulita di {n} Fetore.", "{name} fica limpa de {n} de Fedor.",
  "Nahugasan si {name} ng {n} Baho.", "{name} இலிருந்து {n} நாற்றம் கழுவப்படுகிறது.", "{name} dibersihkan dari {n} Bau Busuk.", "{name}被洗去{n}层恶臭。", "{name}被洗去{n}層惡臭。", "{name}の悪臭が{n}洗い流される。", "{name}의 악취 {n}이(가) 씻겨 나가요."],
"{name} answers the Grave Call: +{n}/+{n}.": [
  "{name} répond à l’Appel de la tombe : +{n}/+{n}.", "{name} folgt dem Grabesruf: +{n}/+{n}.", "{name} responde a la Llamada de la tumba: +{n}/+{n}.", "{name} risponde al Richiamo della tomba: +{n}/+{n}.",
  "{name} responde ao Chamado da cova: +{n}/+{n}.", "Sumagot si {name} sa Tawag ng Libingan: +{n}/+{n}.", "{name} கல்லறை அழைப்புக்குப் பதிலளிக்கிறது: +{n}/+{n}.", "{name} menjawab Panggilan Kubur: +{n}/+{n}.",
  "{name}回应了墓地召唤：+{n}/+{n}。", "{name}回應了墓地召喚：+{n}/+{n}。", "{name}が墓の呼び声に応える：+{n}/+{n}。", "{name}이(가) 무덤의 부름에 응해요: +{n}/+{n}."],
}
CARD_NAMES = {
"Grave Call": ["Appel de la tombe", "Grabesruf", "Llamada de la tumba", "Richiamo della tomba", "Chamado da cova", "Tawag ng Libingan", "கல்லறை அழைப்பு", "Panggilan Kubur", "墓地召唤", "墓地召喚", "墓の呼び声", "무덤의 부름"],
"Smoke Screen": ["Écran de fumée", "Rauchwand", "Cortina de humo", "Cortina di fumo", "Cortina de fumo", "Tabing ng Usok", "புகைத் திரை", "Tabir Asap", "烟幕", "煙幕", "煙幕", "연막"],
"Magnet": ["Aimant", "Magnet", "Imán", "Calamita", "Íman", "Magneto", "காந்தம்", "Magnet", "磁铁", "磁鐵", "磁石", "자석"],
}
FLAVOR = {
"The bell has no clapper. It rings anyway, and something under the moss answers.": [
  "La cloche n’a pas de battant. Elle sonne quand même, et quelque chose sous la mousse répond.", "Die Glocke hat keinen Klöppel. Sie läutet trotzdem, und etwas unter dem Moos antwortet.",
  "La campana no tiene badajo. Suena igual, y algo bajo el musgo responde.", "La campana non ha batacchio. Suona lo stesso, e qualcosa sotto il muschio risponde.",
  "O sino não tem badalo. Toca na mesma, e algo debaixo do musgo responde.", "Walang palawit ang kampana. Tumutunog pa rin ito, at may sumasagot sa ilalim ng lumot.",
  "மணிக்கு நாக்கு இல்லை. இருந்தும் ஒலிக்கிறது; பாசிக்கு அடியில் ஏதோ பதில் சொல்கிறது.", "Lonceng itu tak berbandul. Tetap berdentang, dan sesuatu di bawah lumut menjawab.",
  "这口钟没有钟锤，却照样响了，苔藓下有什么回应了它。", "這口鐘沒有鐘錘，卻照樣響了，苔蘚下有什麼回應了它。", "その鐘に舌はない。それでも鳴り、苔の下で何かが応える。", "그 종에는 추가 없어요. 그래도 울리고, 이끼 아래 무언가가 대답해요."],
"Somebody kicked the damp leaves into the fire. Now nobody can see who.": [
  "Quelqu’un a jeté les feuilles mouillées dans le feu. Maintenant, personne ne voit qui.", "Jemand hat das feuchte Laub ins Feuer getreten. Jetzt sieht niemand mehr, wer.",
  "Alguien echó las hojas húmedas al fuego. Ahora nadie ve quién.", "Qualcuno ha calciato le foglie umide nel fuoco. Ora nessuno vede chi.",
  "Alguém atirou as folhas húmidas para o fogo. Agora ninguém vê quem.", "May sumipa ng basang dahon sa apoy. Ngayon, walang makakita kung sino.",
  "யாரோ ஈரமான இலைகளை நெருப்பில் உதைத்தார்கள். இப்போது யார் என்று யாருக்கும் தெரியவில்லை.", "Seseorang menendang daun basah ke api. Kini tak ada yang bisa melihat siapa.",
  "有人把湿叶子踢进了火堆。现在谁也看不清是谁。", "有人把溼葉子踢進了火堆。現在誰也看不清是誰。", "誰かが湿った葉を火に蹴り込んだ。今は誰が誰だか見えない。", "누군가 젖은 잎을 불에 걷어찼어요. 이제 아무도 누가 누군지 몰라요."],
"The heron insists it meant to land. Its feathers say otherwise.": [
  "Le héron jure qu’il voulait se poser. Ses plumes disent le contraire.", "Der Reiher besteht darauf, er wollte landen. Seine Federn sagen etwas anderes.",
  "La garza insiste en que quería aterrizar. Sus plumas dicen lo contrario.", "L’airone giura che voleva atterrare. Le sue piume dicono il contrario.",
  "A garça insiste que queria aterrar. As penas dizem o contrário.", "Iginigiit ng tagak na sinadya niyang lumapag. Iba ang sinasabi ng mga balahibo nito.",
  "தான் இறங்கவே நினைத்ததாகக் கொக்கு சொல்கிறது. அதன் இறகுகள் வேறு சொல்கின்றன.", "Bangau bersikeras ia memang mau mendarat. Bulunya berkata lain.",
  "苍鹭坚称自己本就想降落。它的羽毛可不这么说。", "蒼鷺堅稱自己本就想降落。牠的羽毛可不這麼說。", "サギは降りるつもりだったと言い張る。羽根はそうは言っていない。", "왜가리는 원래 내려앉으려 했다고 우겨요. 깃털은 다르게 말하지만요."],
}

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
    for k, en in list(KEYS.items()) + list(CHANGED.items()):
        c = core(en); assert c in T, (k, c)
        want = sorted(re.findall(r'\{\w+\}', c))
        for code, tr in zip(CODES, T[c]): assert sorted(re.findall(r'\{\w+\}', tr)) == want, (k, code, tr)
    for d in (T, CARD_NAMES, FLAVOR):
        for en, row in d.items(): assert len(row) == 12, en
    tp = os.path.join(ROOT, 'bramblewood-texts.js'); src = open(tp, encoding='utf-8').read()
    end = '\n}/*TEXT-TABLE-END*/'; assert src.count(end) == 1
    for k, en in CHANGED.items():
        m = re.search(r'("%s": )"(?:[^"\\]|\\.)*"' % re.escape(k), src); assert m, k
        src = src[:m.start()] + m.group(1) + json.dumps(en, ensure_ascii=False) + src[m.end():]
    add = [k for k in KEYS if ('"%s":' % k) not in src]
    if add:
        body = ''.join(',\n  %s: %s' % (json.dumps(k), json.dumps(KEYS[k], ensure_ascii=False)) for k in add)
        src = src.replace(end, body + end)
    open(tp, 'w', encoding='utf-8').write(src)
    for i, code in enumerate(CODES):
        write_pack(os.path.join(ROOT, 'lang', code + '.json'), T, i)
        write_pack(os.path.join(ROOT, 'lang', 'cards', code + '.json'), CARD_NAMES, i)
        write_pack(os.path.join(ROOT, 'lang', 'ui', code + '.json'), FLAVOR, i)
    print('TX keys added:', len(add), '| changed:', len(CHANGED), '| packs:', len(CODES), 'x', len(T), 'texts,', len(CARD_NAMES), 'names,', len(FLAVOR), 'flavour lines')
